"""Serfs & Lords rules engine. Pure logic, no I/O.

Usage: game.apply(player_id, {"type": ..., ...}); raises IllegalMove on bad input.
game.view(player_id) returns the JSON-safe state that player is allowed to see.

Expansion rules live in mixins: seafaring.py (Ships & Islands) and
knights.py (Knights & Raiders). They are inert unless enabled in options.
"""
import random

from .board import RESOURCES, COMMODITIES, TERRAIN_RESOURCE
from .common import IllegalMove, fmt, pips, COSTS
from .mapgen import generate, SIZES, SHAPES, MAX_PLAYERS
from .seafaring import SeafaringMixin
from .knights import KnightsMixin, CITY_COMMODITY, TRACKS
from .progress import ADVANCEMENTS

PIECES = {"road": 15, "ship": 15, "village": 5, "city": 4}
DECREE_NAMES = {
    "soldier": "Soldier",
    "road_charter": "Road Charter",
    "harvest": "Bountiful Harvest",
    "monopoly": "Resource Monopoly",
}
COLORS = ["#c0392b", "#2e6fbf", "#e08a1e", "#2f8f4e", "#7d3c98", "#e8e1d0"]
MAX_ANY = 6

__all__ = ["Game", "IllegalMove", "normalize_options", "COSTS"]


def is_advancement(card):
    return card.startswith("adv:")


def card_name(card):
    return card[4:] if is_advancement(card) else DECREE_NAMES[card]


def default_vp(o):
    return 10 + (3 if o["knights"] else 0) + (2 if o["seafaring"] else 0)


def normalize_options(o):
    o = dict(o or {})
    out = {
        "size": o.get("size") if o.get("size") in SIZES else "small",
        "shape": o.get("shape") if o.get("shape") in SHAPES else "classic",
        "seafaring": bool(o.get("seafaring")),
        "knights": bool(o.get("knights")),
    }
    if out["shape"] == "islands":
        out["seafaring"] = True
    vp = o.get("vp_target")
    out["vp_target"] = vp if isinstance(vp, int) and 5 <= vp <= 30 else default_vp(out)
    return out


class Player:
    def __init__(self, pid, name, color, cards):
        self.id = pid
        self.name = name
        self.color = color
        self.hand = {r: 0 for r in cards}
        self.decrees = []       # playable (or advancement) cards
        self.new_decrees = []   # bought this turn, not yet playable
        self.soldiers = 0
        self.pieces = dict(PIECES)
        # Ships & Islands
        self.home_islands = set()
        self.bonus_islands = set()
        # Knights & Raiders
        self.levels = {t: 0 for t in TRACKS}
        self.progress = []
        self.progress_vp = []   # revealed advancement cards
        self.defender_vp = 0
        self.knight_pieces = {1: 2, 2: 2, 3: 2}

    def card_count(self):
        return sum(self.hand.values())

    def has(self, res):
        return all(self.hand.get(r, 0) >= n for r, n in res.items())


class Game(SeafaringMixin, KnightsMixin):
    def __init__(self, names, options=None, rng=None):
        self.options = normalize_options(options)
        size = self.options["size"]
        if not 2 <= len(names) <= MAX_PLAYERS[size]:
            raise ValueError(f"2-{MAX_PLAYERS[size]} players for a {size} map")
        self.sea = self.options["seafaring"]
        self.knights_mode = self.options["knights"]
        self.vp_target = self.options["vp_target"]
        self.rng = rng or random.Random()
        self.board = generate(size, self.options["shape"], gold=self.sea, rng=self.rng)
        self.cards = RESOURCES + (COMMODITIES if self.knights_mode else [])
        self.players = [Player(i, n, COLORS[i], self.cards) for i, n in enumerate(names)]
        big = len(names) > 4
        self.bank = {r: (24 if big else 19) for r in RESOURCES}
        if self.knights_mode:
            self.bank.update({c: (15 if big else 12) for c in COMMODITIES})
            self.deck = []
        else:
            self.deck = (["soldier"] * (20 if big else 14) + ["road_charter"] * 3 + ["harvest"] * 3
                         + ["monopoly"] * 3 + ["adv:" + a for a in ADVANCEMENTS])
            self.rng.shuffle(self.deck)
        self.buildings = {}   # vertex -> (pid, "village"|"city")
        self.roads = {}       # edge -> pid
        land = [i for i, h in enumerate(self.board.hexes) if h["terrain"] != "sea"]
        moors = [i for i in land if self.board.hexes[i]["terrain"] == "moor"]
        self.bandit = moors[0] if moors else land[0]
        n = len(names)
        self.setup_order = list(range(n)) + list(reversed(range(n)))
        self.setup_step = 0
        self.setup_vertex = None
        self.current = 0
        self.turn_no = 0
        self.phase = "setup_village"
        self.resume_phase = None      # where to go after bandit / free placements
        self.robber_kind = "any"      # "any" (bandit or pirate) or "bandit"
        self.robber_moved = "bandit"
        self.dice = None
        self.pending_discard = {}
        self.pending_picks = {}
        self.placing = None           # {"kind", "left", "resume"}
        self.played_decree = False
        self.trade = None
        self.longest_road = None
        self.largest_army = None
        self.winner = None
        self.log = []
        self.init_seafaring()
        self.init_knights()
        self.say("Turn order: " + ", ".join(names) + ".")
        self.say(f"{self.players[0].name}, place your first village.")

    # ---- helpers --------------------------------------------------------
    def say(self, msg):
        self.log.append(msg)
        del self.log[:-100]

    def name(self, pid):
        return self.players[pid].name

    def pay(self, p, cost):
        for r, n in cost.items():
            p.hand[r] -= n
            self.bank[r] += n

    def give(self, p, r, n):
        n = max(0, min(n, self.bank[r]))
        p.hand[r] += n
        self.bank[r] -= n
        return n

    def move_card(self, src, dst, r, n=1):
        n = min(n, src.hand[r])
        src.hand[r] -= n
        dst.hand[r] += n
        return n

    def random_card(self, p):
        pool = [r for r in self.cards for _ in range(p.hand[r])]
        return self.rng.choice(pool) if pool else None

    def vp(self, pid, hidden=True):
        p = self.players[pid]
        pts = sum(1 if kind == "village" else 2 for owner, kind in self.buildings.values() if owner == pid)
        if self.longest_road == pid:
            pts += 2
        if self.largest_army == pid:
            pts += 2
        pts += len(p.bonus_islands)
        pts += 2 * sum(1 for owner, _ in self.capitals.values() if owner == pid)
        pts += len(p.progress_vp) + p.defender_vp
        if hidden:
            pts += sum(1 for c in p.decrees + p.new_decrees if is_advancement(c))
        return pts

    def rate(self, pid, card):
        if self.trade_charter:
            return 2
        best = 4
        if card in COMMODITIES and self.players[pid].levels["commerce"] >= 3:
            return 2
        for v, (owner, _) in self.buildings.items():
            if owner != pid:
                continue
            h = self.board.vertices[v]["harbor"]
            if h == card:
                return 2
            if h == "any":
                best = 3
        return best

    def hand_limit(self, pid):
        return 7 + 2 * sum(1 for v in self.walls if self.buildings.get(v, (None,))[0] == pid)

    # ---- placement legality --------------------------------------------
    def vertex_blocked(self, pid, v):
        """True if another player's building or knight sits on v (blocks roads passing through)."""
        b = self.buildings.get(v)
        if b and b[0] != pid:
            return True
        k = self.knights.get(v)
        return bool(k and k["owner"] != pid)

    def _vertex_free(self, v):
        if v in self.buildings or v in self.knights or not self.board.vertex_on_land(v):
            return False
        return all(a not in self.buildings for a in self.board.vertices[v]["adj"])

    def _touches_own_route(self, pid, v):
        return any(self.roads.get(e) == pid or self.ships.get(e) == pid for e in self.board.vertices[v]["edges"])

    def my_vertices(self, pid):
        """Every vertex touched by pid's buildings, roads or ships."""
        out = {v for v, (o, _) in self.buildings.items() if o == pid}
        for pieces in (self.roads, self.ships):
            for e, o in pieces.items():
                if o == pid:
                    out.update(self.board.edges[e]["v"])
        return out

    def setup_city_round(self):
        return self.knights_mode and self.setup_step >= len(self.players)

    def legal_villages(self, pid, setup=False):
        kind = "city" if setup and self.setup_city_round() else "village"
        if self.players[pid].pieces[kind] == 0:
            return []
        return [v for v in sorted(self.board.land_vertices)
                if self._vertex_free(v) and (setup or self._touches_own_route(pid, v))]

    def legal_cities(self, pid):
        if self.players[pid].pieces["city"] == 0:
            return []
        return [v for v, (o, k) in self.buildings.items() if o == pid and k == "village"]

    def legal_roads(self, pid):
        if self.players[pid].pieces["road"] == 0:
            return []
        if self.phase == "setup_road":
            return [e for e in self.board.vertices[self.setup_vertex]["edges"]
                    if e not in self.roads and e not in self.ships and self.board.edge_on_land(e)]
        # only edges touching your own pieces can possibly be legal
        near = set()
        for v in self.my_vertices(pid):
            near.update(self.board.vertices[v]["edges"])
        out = []
        for e in sorted(near):
            edge = self.board.edges[e]
            if e in self.roads or e in self.ships or not self.board.edge_on_land(e):
                continue
            for v in edge["v"]:
                b = self.buildings.get(v)
                if b and b[0] == pid:
                    out.append(e)
                    break
                if not self.vertex_blocked(pid, v) and any(
                        self.roads.get(x) == pid for x in self.board.vertices[v]["edges"] if x != e):
                    out.append(e)
                    break
        return out

    def steal_candidates(self):
        out = set()
        if self.robber_moved == "pirate":
            for e, o in self.ships.items():
                if self.pirate in self.board.edges[e]["hexes"]:
                    out.add(o)
        else:
            for v in self.board.hexes[self.bandit]["vertices"]:
                b = self.buildings.get(v)
                if b:
                    out.add(b[0])
        return sorted(o for o in out if o != self.current and self.players[o].card_count() > 0)

    # ---- longest road (roads + ships) -----------------------------------
    def road_length(self, pid):
        own = [(e, "road") for e, o in self.roads.items() if o == pid]
        own += [(e, "ship") for e, o in self.ships.items() if o == pid]
        if not own:
            return 0
        at_vertex = {}
        for e, t in own:
            for v in self.board.edges[e]["v"]:
                at_vertex.setdefault(v, []).append((e, t))

        def own_building(v):
            b = self.buildings.get(v)
            return b is not None and b[0] == pid

        def dfs(v, used, last):
            best = 0
            for e, t in at_vertex.get(v, []):
                if e in used:
                    continue
                # roads and ships only join at your own building
                if last is not None and t != last and not own_building(v):
                    continue
                w = self.board.other_end(e, v)
                length = 1 if self.vertex_blocked(pid, w) else 1 + dfs(w, used | {e}, t)
                best = max(best, length)
            return best

        return max(dfs(v, frozenset(), None) for v in at_vertex)

    def update_longest_road(self):
        lengths = {p.id: self.road_length(p.id) for p in self.players}
        holder = self.longest_road
        if holder is not None and lengths[holder] >= 5 and lengths[holder] >= max(lengths.values()):
            return
        best = max(lengths.values())
        leaders = [pid for pid, n in lengths.items() if n == best]
        new = leaders[0] if best >= 5 and len(leaders) == 1 else None
        if new != holder:
            self.longest_road = new
            if new is not None:
                self.say(f"{self.name(new)} takes Longest Road ({best}).")
            else:
                self.say("Longest Road is no longer held.")

    def update_largest_army(self, pid):
        p = self.players[pid]
        holder = self.largest_army
        if p.soldiers >= 3 and holder != pid and (holder is None or p.soldiers > self.players[holder].soldiers):
            self.largest_army = pid
            self.say(f"{p.name} takes Largest Army ({p.soldiers} soldiers).")

    # ---- action dispatch ------------------------------------------------
    ANYONE = ("discard", "respond_trade", "pick")

    def apply(self, pid, action):
        if self.phase == "over":
            raise IllegalMove("The game is over.")
        kind = action.get("type")
        handler = getattr(self, "act_" + str(kind), None)
        if handler is None:
            raise IllegalMove(f"Unknown action {kind!r}.")
        if kind not in self.ANYONE and pid != self.current:
            raise IllegalMove("It's not your turn.")
        handler(pid, action)
        if self.phase not in ("setup_village", "setup_road") and self.vp(self.current) >= self.vp_target:
            self.winner = self.current
            self.phase = "over"
            self.say(f"{self.name(self.current)} wins with {self.vp(self.current)} victory points!")

    def _need(self, *phases):
        if self.phase not in phases:
            raise IllegalMove("You can't do that right now.")

    def _setup_place(self, pid, what, at):
        p = self.players[pid]
        if self.phase == "setup_village":
            kind = "city" if self.setup_city_round() else "village"
            if what not in ("village", "city") or at not in self.legal_villages(pid, setup=True):
                raise IllegalMove(f"You can't place a {kind} there.")
            self.buildings[at] = (pid, kind)
            p.pieces[kind] -= 1
            self.setup_vertex = at
            isl = self.board.vertex_island(at)
            if isl is not None:
                p.home_islands.add(isl)
            if self.setup_step >= len(self.players):
                for hi in self.board.vertices[at]["hexes"]:
                    r = TERRAIN_RESOURCE[self.board.hexes[hi]["terrain"]]
                    if r:
                        self.give(p, r, 1)
            self.phase = "setup_road"
            self.say(f"{p.name} placed a {kind}.")
            return
        if what == "ship":
            if at not in self.legal_ships(pid):
                raise IllegalMove("Place a ship next to your new village.")
            self.ships[at] = pid
            p.pieces["ship"] -= 1
        else:
            if what != "road" or at not in self.legal_roads(pid):
                raise IllegalMove("Place a road next to your new village.")
            self.roads[at] = pid
            p.pieces["road"] -= 1
        self.setup_step += 1
        if self.setup_step == len(self.setup_order):
            self.current = 0
            self.phase = "roll"
            self.say(f"Setup done. {self.name(0)}, roll the dice.")
        else:
            self.current = self.setup_order[self.setup_step]
            self.phase = "setup_village"
            second = self.setup_step >= len(self.players)
            what = "city" if second and self.knights_mode else ("second village" if second else "first village")
            self.say(f"{self.name(self.current)}, place your {what}.")

    def act_build(self, pid, a):
        what = a.get("what")
        at = a.get("at")
        if not isinstance(at, int):
            raise IllegalMove("Choose a spot.")
        if self.phase in ("setup_village", "setup_road"):
            return self._setup_place(pid, what, at)
        self._need("main")
        p = self.players[pid]
        legal = {
            "road": self.legal_roads,
            "ship": self.legal_ships,
            "village": self.legal_villages,
            "city": self.legal_cities,
            "knight": self.legal_knight_spots,
            "wall": self.legal_walls,
        }.get(what)
        if legal is None:
            raise IllegalMove("Unknown building.")
        if not p.has(COSTS[what]):
            raise IllegalMove(f"You can't afford a {what}.")
        if at not in legal(pid):
            raise IllegalMove(f"You can't build a {what} there.")
        self.pay(p, COSTS[what])
        self._place_piece(pid, what, at)
        self.say(f"{p.name} built a {what}.")

    def _place_piece(self, pid, what, at):
        p = self.players[pid]
        if what == "road":
            self.roads[at] = pid
            p.pieces["road"] -= 1
        elif what == "ship":
            self.ships[at] = pid
            self.ships_new.add(at)
            p.pieces["ship"] -= 1
        elif what == "village":
            self.buildings[at] = (pid, "village")
            p.pieces["village"] -= 1
            self.on_village_built(pid, at)
        elif what == "city":
            self.buildings[at] = (pid, "city")
            p.pieces["city"] -= 1
            p.pieces["village"] += 1
        elif what == "knight":
            self.knights[at] = {"owner": pid, "level": 1, "active": False, "activated_turn": -1}
            p.knight_pieces[1] -= 1
        elif what == "wall":
            self.walls.add(at)
        if what in ("road", "ship", "village", "knight"):
            self.update_longest_road()

    # ---- rolling + production ------------------------------------------
    def act_roll(self, pid, a, dice=None):
        self._need("roll")
        red, yellow = dice or (self.rng.randint(1, 6), self.rng.randint(1, 6))
        self.dice = [red, yellow]
        total = red + yellow
        self.say(f"{self.name(pid)} rolled {total}.")
        if self.knights_mode:
            self.knights_event(red)
        if total == 7:
            self.start_seven()
            return
        received = self.produce(total)
        if self.knights_mode:
            self.almsgiving(received)
        self.phase = "pick" if self.pending_picks else "main"

    def start_seven(self):
        self.pending_discard = {}
        for p in self.players:
            if p.card_count() > self.hand_limit(p.id):
                self.pending_discard[p.id] = p.card_count() // 2
                self.say(f"{p.name} must discard {p.card_count() // 2}.")
        self.resume_phase = "main"
        self.robber_kind = "any"
        if self.pending_discard:
            self.phase = "discard"
        else:
            self._after_discard()

    def robber_active(self):
        return not self.knights_mode or self.raided

    def _after_discard(self):
        if self.robber_active():
            self.phase = "bandit"
        else:
            self.say("The bandits stay hidden until the raiders first arrive.")
            self.phase = self.resume_phase

    def produce(self, total, only=None):
        """Pay out tiles numbered `total`. Returns the set of players who got anything."""
        owed = {c: {} for c in self.cards}
        gold = {}
        for hi, h in enumerate(self.board.hexes):
            if h["number"] != total or hi == self.bandit:
                continue
            t = h["terrain"]
            r = TERRAIN_RESOURCE[t]
            for v in h["vertices"]:
                b = self.buildings.get(v)
                if not b or (only is not None and b[0] != only):
                    continue
                o, kind = b
                n = 2 if kind == "city" else 1
                if t == "gold":
                    gold[o] = gold.get(o, 0) + n
                elif kind == "city" and self.knights_mode and t in CITY_COMMODITY:
                    owed[r][o] = owed[r].get(o, 0) + 1
                    c = CITY_COMMODITY[t]
                    owed[c][o] = owed[c].get(o, 0) + 1
                else:
                    owed[r][o] = owed[r].get(o, 0) + n
        received = set()
        for r, who in owed.items():
            if not who:
                continue
            if sum(who.values()) > self.bank[r] and len(who) > 1:
                self.say(f"The bank is short of {r}; nobody receives it.")
                continue
            for q, n in who.items():
                got = self.give(self.players[q], r, n)
                if got:
                    received.add(q)
                    self.say(f"{self.name(q)} receives {got} {r}.")
        for q, n in gold.items():
            self.pending_picks[q] = self.pending_picks.get(q, 0) + n
            received.add(q)
            self.say(f"{self.name(q)} strikes gold: choose {n} resource(s).")
        return received

    def act_pick(self, pid, a):
        self._need("pick")
        need = self.pending_picks.get(pid)
        if not need:
            raise IllegalMove("You have nothing to choose.")
        res = self._resources(a.get("resources"), RESOURCES)
        if sum(res.values()) != need:
            raise IllegalMove(f"Choose exactly {need}.")
        if any(self.bank[r] < n for r, n in res.items()):
            raise IllegalMove("The bank doesn't have that many.")
        for r, n in res.items():
            self.give(self.players[pid], r, n)
        del self.pending_picks[pid]
        self.say(f"{self.name(pid)} took {fmt(res)}.")
        if not self.pending_picks:
            self.phase = "main"

    def act_discard(self, pid, a):
        self._need("discard")
        need = self.pending_discard.get(pid)
        if not need:
            raise IllegalMove("You don't need to discard.")
        res = self._resources(a.get("resources"))
        p = self.players[pid]
        if sum(res.values()) != need or not p.has(res):
            raise IllegalMove(f"Discard exactly {need} cards you hold.")
        self.pay(p, res)
        del self.pending_discard[pid]
        self.say(f"{p.name} discarded {need}.")
        if not self.pending_discard:
            self._after_discard()

    def act_move_bandit(self, pid, a):
        self._need("bandit")
        hi = a.get("hex")
        if not isinstance(hi, int) or not 0 <= hi < len(self.board.hexes):
            raise IllegalMove("Pick a tile.")
        if self.board.is_land(hi):
            if hi == self.bandit:
                raise IllegalMove("Move the bandits to a different tile.")
            self.bandit = hi
            self.robber_moved = "bandit"
            self.say(f"{self.name(pid)} moved the bandits.")
        else:
            if not self.sea or self.robber_kind != "any" or hi == self.pirate:
                raise IllegalMove("Move the bandits to a land tile.")
            self.pirate = hi
            self.robber_moved = "pirate"
            self.say(f"{self.name(pid)} moved the pirate.")
        cands = self.steal_candidates()
        if len(cands) == 1:
            self._steal(cands[0])
        elif cands:
            self.phase = "steal"
            return
        self.phase = self.resume_phase

    def act_steal(self, pid, a):
        self._need("steal")
        target = a.get("target")
        if target not in self.steal_candidates():
            raise IllegalMove("You can't steal from that player.")
        self._steal(target)
        self.phase = self.resume_phase

    def _steal(self, target):
        t = self.players[target]
        r = self.random_card(t)
        if r:
            self.move_card(t, self.players[self.current], r)
            self.say(f"{self.name(self.current)} stole a card from {t.name}.")

    # ---- free placements (Road Charter, progress cards) ------------------
    def start_placing(self, kind, count):
        self.placing = {"kind": kind, "left": count, "resume": self.phase}
        self.phase = "place"
        if not any(self.legal_place(self.current).values()):
            self._end_placing()

    def legal_place(self, pid):
        kind = self.placing["kind"] if self.placing else None
        out = {}
        if kind == "road":
            out = {"road": self.legal_roads(pid), "ship": self.legal_ships(pid)}
        elif kind == "knight":
            out = {"knight": self.legal_knight_spots(pid)}
        elif kind == "promote":
            out = {"promote": self.legal_promotions(pid)}
        elif kind == "wall":
            out = {"wall": self.legal_walls(pid)}
        elif kind == "remove_road":
            out = {"remove_road": self.legal_road_removals(pid)}
        return out

    def act_place(self, pid, a):
        self._need("place")
        what, at = a.get("what"), a.get("at")
        if at not in self.legal_place(pid).get(what, []):
            raise IllegalMove("You can't place that there.")
        if what == "promote":
            self._promote(pid, at)
        elif what == "remove_road":
            owner = self.roads.pop(at)
            self.players[owner].pieces["road"] += 1
            self.say(f"{self.name(pid)} tore up a road of {self.name(owner)}.")
            self.update_longest_road()
        else:
            self._place_piece(pid, what, at)
            self.say(f"{self.name(pid)} placed a free {what}.")
        self.placing["left"] -= 1
        if self.placing["left"] == 0 or not any(self.legal_place(pid).values()):
            self._end_placing()

    def act_place_done(self, pid, a):
        self._need("place")
        self._end_placing()

    def _end_placing(self):
        self.phase = self.placing["resume"]
        self.placing = None

    # ---- decrees (base game) ---------------------------------------------
    def act_buy_decree(self, pid, a):
        self._need("main")
        if self.knights_mode:
            raise IllegalMove("Decrees aren't used with Knights & Raiders.")
        p = self.players[pid]
        if not self.deck:
            raise IllegalMove("No decrees left.")
        if not p.has(COSTS["decree"]):
            raise IllegalMove("You can't afford a decree.")
        self.pay(p, COSTS["decree"])
        p.new_decrees.append(self.deck.pop())
        self.say(f"{p.name} bought a royal decree.")

    def act_play_decree(self, pid, a):
        self._need("roll", "main")
        card = a.get("card")
        p = self.players[pid]
        if card not in DECREE_NAMES or card not in p.decrees:
            raise IllegalMove("You don't have that decree to play.")
        if self.played_decree:
            raise IllegalMove("Only one decree per turn.")
        if card == "harvest":
            picks = a.get("resources")
            if not isinstance(picks, list) or len(picks) != 2 or any(r not in RESOURCES for r in picks):
                raise IllegalMove("Choose two resources.")
            need = {r: picks.count(r) for r in set(picks)}
            if any(self.bank[r] < n for r, n in need.items()):
                raise IllegalMove("The bank doesn't have those.")
        if card == "monopoly" and a.get("resource") not in RESOURCES:
            raise IllegalMove("Choose a resource.")
        if card == "road_charter" and not (self.legal_roads(pid) or self.legal_ships(pid)):
            raise IllegalMove("You have nowhere to build a road.")
        p.decrees.remove(card)
        self.played_decree = True
        self.say(f"{p.name} played {DECREE_NAMES[card]}.")
        if card == "soldier":
            p.soldiers += 1
            self.update_largest_army(pid)
            self.resume_phase = self.phase
            self.robber_kind = "any"
            self.phase = "bandit"
        elif card == "road_charter":
            self.start_placing("road", 2)
        elif card == "harvest":
            for r in picks:
                self.give(p, r, 1)
        elif card == "monopoly":
            r = a["resource"]
            total = sum(self.move_card(q, p, r, q.hand[r]) for q in self.players if q.id != pid)
            self.say(f"{p.name} claimed all {total} {r}.")

    # ---- trading ----------------------------------------------------------
    def _resources(self, d, allowed=None):
        allowed = allowed or self.cards
        if not isinstance(d, dict):
            raise IllegalMove("Bad resource list.")
        out = {}
        for r, n in d.items():
            if r not in allowed or not isinstance(n, int) or n < 0:
                raise IllegalMove("Bad resource list.")
            if n:
                out[r] = n
        return out

    def act_bank_trade(self, pid, a):
        self._need("main")
        give, get = a.get("give"), a.get("get")
        if give not in self.cards or get not in self.cards or give == get:
            raise IllegalMove("Pick two different cards.")
        p = self.players[pid]
        n = self.rate(pid, give)
        if p.hand[give] < n:
            raise IllegalMove(f"You need {n} {give}.")
        if self.bank[get] < 1:
            raise IllegalMove(f"The bank is out of {get}.")
        self.pay(p, {give: n})
        self.give(p, get, 1)
        self.say(f"{p.name} traded {n} {give} to the bank for 1 {get}.")

    def act_offer_trade(self, pid, a):
        self._need("main")
        give, get = self._resources(a.get("give")), self._resources(a.get("get"))
        if not give or not get:
            raise IllegalMove("A trade needs something on both sides.")
        if set(give) & set(get):
            raise IllegalMove("Don't offer and ask for the same resource.")
        if not self.players[pid].has(give):
            raise IllegalMove("You don't have what you're offering.")
        self.trade = {"from": pid, "give": give, "get": get, "accepted": [], "declined": []}
        self.say(f"{self.name(pid)} offers {fmt(give)} for {fmt(get)}.")

    def act_respond_trade(self, pid, a):
        t = self.trade
        if not t or pid == t["from"]:
            raise IllegalMove("There's no offer for you.")
        accept = a.get("accept")  # True, False, or None to take back a response
        if accept and not self.players[pid].has(t["get"]):
            raise IllegalMove(f"You need {fmt(t['get'])} to accept.")
        for lst in (t["accepted"], t["declined"]):
            if pid in lst:
                lst.remove(pid)
        if accept:
            t["accepted"].append(pid)
            self.say(f"{self.name(pid)} accepts the offer.")
        elif accept is not None:
            t["declined"].append(pid)

    def act_complete_trade(self, pid, a):
        t = self.trade
        if not t:
            raise IllegalMove("No offer open.")
        other = a.get("with")
        if other not in t["accepted"]:
            raise IllegalMove("That player hasn't accepted.")
        p, q = self.players[pid], self.players[other]
        if not p.has(t["give"]) or not q.has(t["get"]):
            raise IllegalMove("Someone no longer has the cards.")
        for r, n in t["give"].items():
            self.move_card(p, q, r, n)
        for r, n in t["get"].items():
            self.move_card(q, p, r, n)
        self.say(f"{p.name} traded with {q.name}.")
        self.trade = None

    def act_cancel_trade(self, pid, a):
        self.trade = None

    def act_end_turn(self, pid, a):
        self._need("main")
        p = self.players[pid]
        p.decrees += p.new_decrees
        p.new_decrees = []
        self.trade = None
        self.played_decree = False
        self.dice = None
        self.end_turn_seafaring()
        self.end_turn_knights()
        self.turn_no += 1
        self.current = (self.current + 1) % len(self.players)
        self.phase = "roll"
        self.say(f"{self.name(self.current)}'s turn.")

    # ---- view -----------------------------------------------------------
    def view(self, pid):
        me = self.players[pid]
        legal = {}
        if pid == self.current:
            if self.phase == "setup_village":
                legal["villages"] = self.legal_villages(pid, setup=True)
            elif self.phase == "setup_road":
                legal["roads"] = self.legal_roads(pid)
                legal["ships"] = self.legal_ships(pid)
            elif self.phase == "place":
                legal["place"] = self.legal_place(pid)
            elif self.phase == "main":
                legal = {"villages": self.legal_villages(pid), "roads": self.legal_roads(pid),
                         "cities": self.legal_cities(pid), "ships": self.legal_ships(pid),
                         "ship_moves": {str(k): v for k, v in self.ship_moves(pid).items()}}
                legal.update(self.knights_legal(pid))
        over = self.phase == "over"
        return {
            "options": self.options,
            "board": self.board.to_dict(),
            "buildings": [[v, o, k] for v, (o, k) in self.buildings.items()],
            "roads": [[e, o] for e, o in self.roads.items()],
            "ships": [[e, o] for e, o in self.ships.items()],
            "bandit": self.bandit,
            "pirate": self.pirate,
            "players": [{
                "id": p.id, "name": p.name, "color": p.color,
                "cards": p.card_count(), "decrees": len(p.decrees) + len(p.new_decrees),
                "progress": len(p.progress),
                "soldiers": p.soldiers, "vp": self.vp(p.id, hidden=(p.id == pid or over)),
                "pieces": p.pieces, "road_length": self.road_length(p.id),
                "levels": p.levels, "defender": p.defender_vp, "advancements": p.progress_vp,
                "islands": len(p.bonus_islands),
                "knight_strength": sum(k["level"] for k in self.knights.values() if k["owner"] == p.id and k["active"]),
                "knight_pieces": p.knight_pieces,
                "hand_limit": self.hand_limit(p.id),
            } for p in self.players],
            "you": pid,
            "hand": me.hand,
            "cards": self.cards,
            "my_decrees": [{"card": c, "name": card_name(c), "new": False} for c in me.decrees]
                          + [{"card": c, "name": card_name(c), "new": True} for c in me.new_decrees],
            "my_progress": self.progress_view(me),
            "rates": {r: self.rate(pid, r) for r in self.cards},
            "bank": self.bank,
            "deck_left": len(self.deck),
            "current": self.current,
            "turn": self.turn_no,
            "phase": self.phase,
            "setup_kind": "city" if self.phase == "setup_village" and self.setup_city_round() else "village",
            "dice": self.dice,
            "discard": self.pending_discard.get(pid, 0),
            "waiting_discard": list(self.pending_discard),
            "pick": self.pending_picks.get(pid, 0),
            "waiting_pick": list(self.pending_picks),
            "steal_candidates": self.steal_candidates() if self.phase == "steal" else [],
            "robber_kind": self.robber_kind,
            "played_decree": self.played_decree,
            "placing": self.placing,
            "trade": self.trade,
            "longest_road": self.longest_road,
            "largest_army": self.largest_army,
            "winner": self.winner,
            "vp_target": self.vp_target,
            "legal": legal,
            "costs": COSTS,
            "ship_moved": self.ship_moved,
            "trade_charter": self.trade_charter,
            **self.knights_view(),
            "log": self.log[-40:],
        }

"""Knights & Raiders rules (mixin for Game). Inert unless options["knights"]."""
from .board import RESOURCES, COMMODITIES, TERRAIN_RESOURCE
from .common import IllegalMove, pips, COSTS, fmt
from .progress import PROGRESS, build_decks, progress_name

TRACKS = ["commerce", "faith", "arms"]
TRACK_COMMODITY = {"commerce": "cloth", "faith": "parchment", "arms": "steel"}
CITY_COMMODITY = {"forest": "parchment", "pasture": "cloth", "hills": "steel"}
EVENT_FACES = ["raiders", "raiders", "raiders", "commerce", "faith", "arms"]
RAID_TRACK = 7
MAX_PROGRESS = 4
MAX_WALLS = 3


class KnightsMixin:
    def init_knights(self):
        self.knights = {}        # vertex -> {owner, level, active, activated_turn}
        self.walls = set()       # city vertices with a wall
        self.capitals = {}       # track -> (pid, vertex)
        self.raiders = 0
        self.raided = False
        self.event = None
        self.promoted = set()    # knight vertices promoted this turn
        self.fleet = None        # resource/commodity tradable 2:1 this turn (Trade Fleet)
        self.merchant = None     # [hex, pid]
        self.crane = False
        self.bishop = False
        self.discard_only = False
        self.taking = None       # Guild Master / Spy choice in progress
        self.pending_pdiscard = {}
        self.decks = build_decks(self.rng) if self.knights_mode else {t: [] for t in TRACKS}

    # ---- event die, raiders, progress draws ------------------------------
    def knights_event(self, red):
        face = self.rng.choice(EVENT_FACES)
        self.event = face
        if face == "raiders":
            self.raiders += 1
            self.say(f"The raiders' ships draw nearer ({self.raiders}/{RAID_TRACK}).")
            if self.raiders >= RAID_TRACK:
                self.raid()
            return
        n = len(self.players)
        for i in range(n):
            p = self.players[(self.current + i) % n]
            lvl = p.levels[face]
            if lvl >= 1 and red <= lvl + 1:
                self.draw_progress(p.id, face)

    def draw_progress(self, pid, track):
        p = self.players[pid]
        deck = self.decks[track]
        if not deck:
            return
        card = deck.pop()
        if card.startswith("adv:"):
            p.progress_vp.append(card[4:])
            self.say(f"{p.name} achieves an Important Advancement: {card[4:]}! +1 victory point.")
        else:
            p.progress.append(card)
            self.say(f"{p.name} draws a {track} card.")
            if len(p.progress) > MAX_PROGRESS and pid != self.current:
                self.pending_pdiscard[pid] = len(p.progress) - MAX_PROGRESS
                self.say(f"{p.name} holds too many progress cards and must put one back.")

    def city_count(self):
        return sum(1 for _, k in self.buildings.values() if k == "city")

    def capital_vertices(self):
        return {v for _, v in self.capitals.values()}

    def raid(self):
        strength = self.city_count()
        contrib = {p.id: 0 for p in self.players}
        for k in self.knights.values():
            if k["active"]:
                contrib[k["owner"]] += k["level"]
        defense = sum(contrib.values())
        self.raided = True
        self.say(f"⚔️ The raiders land! Their strength {strength} vs. the realm's knights {defense}.")
        if defense >= strength:
            best = max(contrib.values())
            top = [pid for pid, c in contrib.items() if c == best]
            if best == 0:
                self.say("The raiders find nothing worth taking and sail away.")
            elif len(top) == 1:
                self.players[top[0]].defender_vp += 1
                self.say(f"{self.name(top[0])} is named Defender of the Realm! +1 victory point.")
            else:
                for pid in top:
                    p = self.players[pid]
                    track = max(TRACKS, key=lambda t: (p.levels[t], self.rng.random()))
                    self.draw_progress(pid, track)
                self.say("The defenders share the glory and each draw a progress card.")
        else:
            caps = self.capital_vertices()
            eligible = [p.id for p in self.players
                        if any(o == p.id and k == "city" and v not in caps for v, (o, k) in self.buildings.items())]
            if eligible:
                low = min(contrib[pid] for pid in eligible)
                for pid in eligible:
                    if contrib[pid] == low:
                        self._sack_city(pid, caps)
            else:
                self.say("There are no cities to sack.")
        for k in self.knights.values():
            k["active"] = False
        self.raiders = 0

    def _sack_city(self, pid, caps):
        p = self.players[pid]
        cities = [v for v, (o, k) in self.buildings.items() if o == pid and k == "city" and v not in caps]
        v = min(cities, key=lambda c: sum(pips(self.board.hexes[h]["number"]) for h in self.board.vertices[c]["hexes"]))
        self.buildings[v] = (pid, "village")
        p.pieces["city"] += 1
        p.pieces["village"] = max(0, p.pieces["village"] - 1)
        self.walls.discard(v)
        self.say(f"The raiders sack one of {p.name}'s cities; it falls back to a village.")

    def almsgiving(self, received):
        for p in self.players:
            if p.levels["faith"] >= 3 and p.id not in received:
                self.pending_picks[p.id] = self.pending_picks.get(p.id, 0) + 1
                self.say(f"{p.name} receives alms: choose 1 resource.")

    # ---- legality --------------------------------------------------------
    def legal_knight_spots(self, pid, any_level=False):
        pieces = self.players[pid].knight_pieces if self.knights_mode else {}
        if not self.knights_mode or not (any(pieces.values()) if any_level else pieces[1]):
            return []
        return sorted(v for v in self.my_vertices(pid)
                      if v not in self.buildings and v not in self.knights and self.board.vertex_on_land(v)
                      and any(self.roads.get(e) == pid for e in self.board.vertices[v]["edges"]))

    def legal_promotions(self, pid):
        if not self.knights_mode:
            return []
        p = self.players[pid]
        out = []
        for v, k in self.knights.items():
            if k["owner"] != pid or k["level"] >= 3 or v in self.promoted:
                continue
            if k["level"] == 2 and p.levels["arms"] < 3:
                continue
            if p.knight_pieces[k["level"] + 1] > 0:
                out.append(v)
        return out

    def legal_activations(self, pid):
        return [v for v, k in self.knights.items() if k["owner"] == pid and not k["active"]]

    def legal_walls(self, pid):
        if not self.knights_mode:
            return []
        mine = [v for v, (o, k) in self.buildings.items() if o == pid and k == "city"]
        if sum(1 for v in mine if v in self.walls) >= MAX_WALLS:
            return []
        return [v for v in mine if v not in self.walls]

    def legal_road_removals(self, pid):
        out = []
        for e, o in self.roads.items():
            if o == pid:
                continue
            for v in self.board.edges[e]["v"]:
                b = self.buildings.get(v)
                if b and b[0] == o:
                    continue
                if not any(self.roads.get(x) == o or self.ships.get(x) == o
                           for x in self.board.vertices[v]["edges"] if x != e):
                    out.append(e)
                    break
        return out

    def _reach(self, pid, start):
        """Vertices a knight at `start` can reach along pid's roads: (empty spots, enemy knight spots)."""
        empty, enemies, seen, stack = [], [], {start}, [start]
        while stack:
            u = stack.pop()
            for e in self.board.vertices[u]["edges"]:
                if self.roads.get(e) != pid:
                    continue
                w = self.board.other_end(e, u)
                if w in seen:
                    continue
                seen.add(w)
                b, k = self.buildings.get(w), self.knights.get(w)
                if (b and b[0] != pid) or (k and k["owner"] != pid):
                    if k and k["owner"] != pid:
                        enemies.append(w)
                    continue
                if not b and not k:
                    empty.append(w)
                stack.append(w)
        return empty, enemies

    def knight_ready(self, v):
        k = self.knights.get(v)
        return bool(k and k["active"] and k["activated_turn"] != self.turn_no)

    def knight_moves(self, pid):
        out = {}
        for v, k in self.knights.items():
            if k["owner"] != pid or not self.knight_ready(v):
                continue
            empty, enemies = self._reach(pid, v)
            targets = empty + [w for w in enemies if self.knights[w]["level"] < k["level"]]
            if targets:
                out[v] = targets
        return out

    def chase_knights(self, pid):
        if not self.raided:
            return []
        hexv = set(self.board.hexes[self.bandit]["vertices"])
        return [v for v, k in self.knights.items() if k["owner"] == pid and v in hexv and self.knight_ready(v)]

    def improve_cost(self, lvl, discount=None):
        return max(0, lvl - (self.crane if discount is None else discount))

    def improve_options(self, pid, discount=None):
        p = self.players[pid]
        has_city = any(o == pid and k == "city" for o, k in self.buildings.values())
        out = {}
        for t in TRACKS:
            lvl = p.levels[t] + 1
            if lvl > 5 or not has_city:
                continue
            if p.hand[TRACK_COMMODITY[t]] >= self.improve_cost(lvl, discount) and (lvl < 4 or self._capital_city_for(pid, t, lvl) is not False):
                out[t] = lvl
        return out

    def _capital_city_for(self, pid, track, lvl):
        """None if no capital changes hands, a vertex if pid gains it, False if pid would gain it but has no free city."""
        holder = self.capitals.get(track)
        if lvl < 4 or (holder and (holder[0] == pid or self.players[holder[0]].levels[track] >= lvl)):
            return None
        caps = self.capital_vertices()
        free = [v for v, (o, k) in self.buildings.items() if o == pid and k == "city" and v not in caps]
        return free[0] if free else False

    def knights_legal(self, pid):
        if not self.knights_mode:
            return {}
        p = self.players[pid]
        return {
            "knights": self.legal_knight_spots(pid),
            "promote": self.legal_promotions(pid),
            "activate": self.legal_activations(pid),
            "walls": self.legal_walls(pid),
            "knight_moves": {str(k): v for k, v in self.knight_moves(pid).items()},
            "chase": self.chase_knights(pid),
            "improve": self.improve_options(pid),
            "progress_playable": [c for c in set(p.progress) if self._progress_ok(pid, c)],
            "progress_targets": {c: self.progress_targets(pid, c) for c in set(p.progress)
                                 if (PROGRESS[c]["param"] or "").startswith("player_")},
        }

    # ---- knight actions ----------------------------------------------------
    def _promote(self, pid, v):
        p = self.players[pid]
        k = self.knights[v]
        p.knight_pieces[k["level"]] += 1
        k["level"] += 1
        p.knight_pieces[k["level"]] -= 1
        self.promoted.add(v)
        self.say(f"{p.name} promoted a knight to level {k['level']}.")

    def act_promote_knight(self, pid, a):
        self._need("main")
        v = a.get("at")
        if v not in self.legal_promotions(pid):
            raise IllegalMove("You can't promote that knight.")
        if not self.players[pid].has(COSTS["promote"]):
            raise IllegalMove("You can't afford a promotion.")
        self.pay(self.players[pid], COSTS["promote"])
        self._promote(pid, v)

    def act_activate_knight(self, pid, a):
        self._need("main")
        v = a.get("at")
        if v not in self.legal_activations(pid):
            raise IllegalMove("You can't activate that knight.")
        if not self.players[pid].has(COSTS["activate"]):
            raise IllegalMove("Activating a knight costs 1 grain.")
        self.pay(self.players[pid], COSTS["activate"])
        self.knights[v]["active"] = True
        self.knights[v]["activated_turn"] = self.turn_no
        self.say(f"{self.name(pid)} activated a knight.")

    def act_move_knight(self, pid, a):
        self._need("main")
        src, dst = a.get("from"), a.get("to")
        if dst not in self.knight_moves(pid).get(src, []):
            raise IllegalMove("That knight can't go there.")
        k = self.knights.pop(src)
        k["active"] = False
        enemy = self.knights.pop(dst, None)
        self.knights[dst] = k
        if enemy:
            self._push_off(enemy, dst, f"{self.name(pid)}'s knight")
        else:
            self.say(f"{self.name(pid)} moved a knight.")
        self.update_longest_road()

    def displace_knight(self, v):
        """Intrigue: push the knight at v away without a knight of your own."""
        self._push_off(self.knights.pop(v), v, f"{self.name(self.current)}'s intrigue")
        self.update_longest_road()

    def _push_off(self, enemy, frm, by):
        """The displaced knight retreats along its owner's roads to an empty spot, or leaves the board."""
        empty, _ = self._reach(enemy["owner"], frm)
        empty = [w for w in empty if w != frm]
        owner = self.players[enemy["owner"]]
        if empty:
            self.knights[empty[0]] = enemy
            self.say(f"{by} drives off {owner.name}'s knight.")
        else:
            owner.knight_pieces[enemy["level"]] += 1
            self.say(f"{by} routs {owner.name}'s knight from the field.")

    def act_chase_bandit(self, pid, a):
        self._need("main")
        v = a.get("at")
        if v not in self.chase_knights(pid):
            raise IllegalMove("That knight can't reach the bandits.")
        self.knights[v]["active"] = False
        self.say(f"{self.name(pid)}'s knight chases off the bandits.")
        self.resume_phase = "main"
        self.robber_kind = "bandit"
        self.phase = "bandit"

    def act_improve(self, pid, a):
        self._need("main")
        track = a.get("track")
        opts = self.improve_options(pid)
        if track not in opts:
            raise IllegalMove("You can't improve that right now.")
        p = self.players[pid]
        lvl = opts[track]
        city = self._capital_city_for(pid, track, lvl)
        self.pay(p, {TRACK_COMMODITY[track]: self.improve_cost(lvl)})
        self.crane = False
        p.levels[track] = lvl
        self.say(f"{p.name} raised {track} to level {lvl}.")
        if city is not None:
            old = self.capitals.get(track)
            self.capitals[track] = (pid, city)
            if old:
                self.say(f"{p.name} seizes the {track.capitalize()} Metropolis from {self.name(old[0])}!")
            else:
                self.say(f"{p.name} founds the {track.capitalize()} Metropolis! +2 victory points.")

    # ---- progress cards ----------------------------------------------------
    def _richer(self, pid, or_equal=False):
        mine = self.vp(pid, hidden=False)
        return [q.id for q in self.players if q.id != pid
                and (self.vp(q.id, hidden=False) >= mine if or_equal else self.vp(q.id, hidden=False) > mine)]

    def progress_targets(self, pid, card):
        """Lords a player-picking card can be aimed at."""
        param = PROGRESS[card]["param"] if card in PROGRESS else None
        if param == "player_richer":
            return [q for q in self._richer(pid) if self.players[q].card_count()]
        if param == "player_progress":
            return [q.id for q in self.players if q.id != pid and q.progress]
        if param == "player_knights":
            return [q.id for q in self.players if q.id != pid and any(k["owner"] == q.id for k in self.knights.values())]
        return []

    def merchant_hexes(self, pid):
        return [i for i, h in enumerate(self.board.hexes) if TERRAIN_RESOURCE.get(h["terrain"])
                and any(self.buildings.get(v, (None,))[0] == pid for v in h["vertices"])
                and (not self.merchant or self.merchant[0] != i or self.merchant[1] != pid)]

    def swap_hexes(self):
        return [i for i, h in enumerate(self.board.hexes) if h["number"] and h["number"] not in (2, 12, 6, 8)]

    def intrigue_targets(self, pid):
        return [v for v, k in self.knights.items() if k["owner"] != pid
                and any(self.roads.get(e) == pid or self.ships.get(e) == pid for e in self.board.vertices[v]["edges"])]

    def my_villages(self, pid):
        return [v for v, (o, k) in self.buildings.items() if o == pid and k == "village"]

    def _progress_ok(self, pid, card):
        if card not in PROGRESS:
            return False
        if pid in self.pending_pdiscard:
            return False
        if card == "alchemist":
            return self.phase == "roll"
        if self.phase != "main":
            return False
        p = self.players[pid]
        checks = {
            "merchant": lambda: self.merchant_hexes(pid),
            "guild_master": lambda: self.progress_targets(pid, card),
            "spy": lambda: self.progress_targets(pid, card),
            "deserter": lambda: self.progress_targets(pid, card) and any(p.knight_pieces.values())
                                and self.legal_knight_spots(pid, any_level=True),
            "inventor": lambda: len(self.swap_hexes()) >= 2,
            "crane": lambda: not self.crane and self.improve_options(pid, discount=1),
            "stonemason": lambda: self.legal_walls(pid),
            "master_builder": lambda: self.my_villages(pid) and p.pieces["city"] > 0 and p.has({"iron": 2, "grain": 1}),
            "road_charter": lambda: self.legal_roads(pid) or self.legal_ships(pid),
            "smithy": lambda: self.legal_promotions(pid),
            "bishop": lambda: self.raided,
            "diplomat": lambda: self.legal_road_removals(pid),
            "intrigue": lambda: self.intrigue_targets(pid),
            "call_to_arms": lambda: self.legal_activations(pid),
            "port_exchange": lambda: any(p.hand[r] for r in RESOURCES),
        }
        return bool(checks[card]()) if card in checks else True

    def act_play_progress(self, pid, a):
        card = a.get("card")
        p = self.players[pid]
        if card not in p.progress:
            raise IllegalMove("You don't hold that card.")
        if not self._progress_ok(pid, card):
            raise IllegalMove("You can't play that right now.")
        # validate parameters before spending the card
        param = PROGRESS[card]["param"]
        if param == "resource" and a.get("resource") not in RESOURCES:
            raise IllegalMove("Choose a resource.")
        elif param == "commodity" and a.get("resource") not in COMMODITIES:
            raise IllegalMove("Choose a commodity.")
        elif param == "card" and a.get("resource") not in self.cards:
            raise IllegalMove("Choose a resource or commodity.")
        elif param == "dice":
            d = a.get("dice")
            if not (isinstance(d, list) and len(d) == 2 and all(x in range(1, 7) for x in d)):
                raise IllegalMove("Choose both dice.")
        elif param and param.startswith("player_") and a.get("target") not in self.progress_targets(pid, card):
            raise IllegalMove("Choose a lord this card can target.")
        p.progress.remove(card)
        self.decks[PROGRESS[card]["track"]].insert(0, card)   # played cards go under their deck
        self.say(f"{p.name} played {progress_name(card)}.")
        others = [q for q in self.players if q.id != pid]
        target = self.players[a["target"]] if param and param.startswith("player_") else None
        if card == "merchant":
            self.start_placing("merchant", 1)
        elif card == "trade_fleet":
            self.fleet = a["resource"]
        elif card == "port_exchange":
            for q in others:
                coms = [c for c in COMMODITIES if q.hand[c]]
                res = [r for r in RESOURCES if p.hand[r]]
                if coms and res:
                    give = max(res, key=lambda r: p.hand[r])
                    get = max(coms, key=lambda c: q.hand[c])
                    self.move_card(p, q, give)
                    self.move_card(q, p, get)
                    self.say(f"{p.name} swaps 1 {give} for 1 {get} with {q.name}.")
        elif card in ("guild_master", "spy"):
            n = min(2, target.card_count()) if card == "guild_master" else 1
            self.taking = {"from": target.id, "n": n, "kind": "hand" if card == "guild_master" else "progress"}
            self.phase = "take"
        elif card in ("resource_monopoly", "commodity_monopoly"):
            r = a["resource"]
            n = sum(self.move_card(q, p, r, 2 if card == "resource_monopoly" else 1) for q in others)
            self.say(f"{p.name} collects {n} {r}.")
        elif card == "alchemist":
            self.act_roll(pid, {}, dice=a["dice"])
        elif card == "inventor":
            self.start_placing("swap", 2)
        elif card == "crane":
            self.crane = True
        elif card == "stonemason":
            self.start_placing("wall", 1)
        elif card in ("irrigation", "mining"):
            terrain, r = ("fields", "grain") if card == "irrigation" else ("hills", "iron")
            tiles = sum(1 for h in self.board.hexes if h["terrain"] == terrain
                        and any(self.buildings.get(v, (None,))[0] == pid for v in h["vertices"]))
            n = self.give(p, r, 2 * tiles)
            self.say(f"{p.name} takes {n} {r}.")
        elif card == "master_builder":
            cost = {"iron": 2, "grain": 1}
            self.pay(p, cost)
            self.start_placing("city", 1)
            if self.placing:
                self.placing["refund"] = cost
        elif card == "road_charter":
            self.start_placing("road", 2)
        elif card == "smithy":
            self.start_placing("promote", 2)
        elif card == "bishop":
            self.resume_phase = "main"
            self.robber_kind = "bandit"
            self.bishop = True
            self.phase = "bandit"
        elif card == "deserter":
            mine = [(v, k) for v, k in self.knights.items() if k["owner"] == target.id]
            v, k = min(mine, key=lambda x: (x[1]["level"], x[1]["active"]))   # they give up their weakest
            del self.knights[v]
            target.knight_pieces[k["level"]] += 1
            self.say(f"One of {target.name}'s knights deserts.")
            self.update_longest_road()
            levels = [lv for lv in range(k["level"], 0, -1) if p.knight_pieces[lv] > 0]
            if levels:
                self.start_placing("knight", 1)
                if self.placing:
                    self.placing.update(level=levels[0], active=k["active"])
        elif card == "diplomat":
            self.start_placing("remove_road", 1)
        elif card == "intrigue":
            self.start_placing("displace", 1)
        elif card == "saboteur":
            half = {q.id: q.card_count() // 2 for q in others if q.id in self._richer(pid, or_equal=True)}
            self.pending_discard = {q: n for q, n in half.items() if n}
            for q, n in self.pending_discard.items():
                self.say(f"{self.name(q)} must discard {n}.")
            if self.pending_discard:
                self.resume_phase = "main"
                self.discard_only = True
                self.phase = "discard"
        elif card == "call_to_arms":
            for v in self.legal_activations(pid):
                self.knights[v]["active"] = True
                self.knights[v]["activated_turn"] = self.turn_no
        elif card == "royal_wedding":
            for qid in self._richer(pid):
                q = self.players[qid]
                for _ in range(2):
                    have = [c for c in self.cards if q.hand[c]]
                    if have:   # they hand over what they can best spare
                        self.move_card(q, p, max(have, key=lambda c: q.hand[c]))
                self.say(f"{q.name} sends {p.name} a wedding gift.")

    def act_take(self, pid, a):
        """Second half of Guild Master / Spy: choose what to take from the target."""
        self._need("take")
        t = self.taking
        q, p = self.players[t["from"]], self.players[pid]
        if t["kind"] == "progress":
            c = a.get("card")
            if c not in q.progress:
                raise IllegalMove("Choose one of their cards.")
            q.progress.remove(c)
            p.progress.append(c)
            self.say(f"{p.name}'s spy steals a progress card from {q.name}.")
        else:
            picks = a.get("cards")
            if not isinstance(picks, list) or len(picks) != t["n"] or any(c not in self.cards for c in picks) \
                    or any(q.hand[c] < picks.count(c) for c in set(picks)):
                raise IllegalMove(f"Choose {t['n']} of their cards.")
            for c in picks:
                self.move_card(q, p, c)
            self.say(f"{p.name} takes {fmt({c: picks.count(c) for c in set(picks)})} from {q.name}.")
        self.taking = None
        self.phase = "main"

    def act_discard_progress(self, pid, a):
        """A lord who drew a 5th progress card outside their turn puts one back."""
        if pid not in self.pending_pdiscard:
            raise IllegalMove("You don't need to discard a progress card.")
        p = self.players[pid]
        c = a.get("card")
        if c not in p.progress:
            raise IllegalMove("Choose one of your progress cards.")
        p.progress.remove(c)
        self.decks[PROGRESS[c]["track"]].insert(0, c)
        self.pending_pdiscard[pid] -= 1
        if self.pending_pdiscard[pid] <= 0:
            del self.pending_pdiscard[pid]
        self.say(f"{p.name} returns a progress card to the deck.")

    def take_view(self, pid):
        t = self.taking
        if not t or pid != self.current:
            return None
        q = self.players[t["from"]]
        if t["kind"] == "progress":
            return {"from": q.id, "n": 1, "kind": "progress", "cards": self.progress_view(q)}
        return {"from": q.id, "n": t["n"], "kind": "hand", "hand": dict(q.hand)}

    def progress_view(self, p):
        return [{"card": c, "name": progress_name(c), "track": PROGRESS[c]["track"],
                 "param": PROGRESS[c]["param"], "desc": PROGRESS[c]["desc"]} for c in p.progress]

    def knights_view(self):
        return {
            "knights": [[v, k["owner"], k["level"], k["active"], k["active"] and k["activated_turn"] == self.turn_no]
                        for v, k in self.knights.items()],
            "walls": sorted(self.walls),
            "capitals": {t: list(c) for t, c in self.capitals.items()},
            "raiders": self.raiders,
            "raid_track": RAID_TRACK,
            "raided": self.raided,
            "event": self.event,
            "deck_sizes": {t: len(d) for t, d in self.decks.items()},
        }

    def end_turn_knights(self):
        self.promoted = set()
        self.fleet = None
        self.crane = False
        self.event = None

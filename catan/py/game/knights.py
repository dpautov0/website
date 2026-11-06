"""Knights & Raiders rules (mixin for Game). Inert unless options["knights"]."""
from .board import RESOURCES, COMMODITIES
from .common import IllegalMove, pips, COSTS
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
        self.trade_charter = False
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
        if len(p.progress) >= MAX_PROGRESS:
            self.say(f"{p.name}'s hands are full; no {track} card.")
            return
        card = deck.pop()
        if card.startswith("adv:"):
            p.progress_vp.append(card[4:])
            self.say(f"{p.name} achieves an Important Advancement: {card[4:]}! +1 victory point.")
        else:
            p.progress.append(card)
            self.say(f"{p.name} draws a {track} card.")

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
    def legal_knight_spots(self, pid):
        if not self.knights_mode or self.players[pid].knight_pieces[1] == 0:
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

    def improve_options(self, pid):
        p = self.players[pid]
        has_city = any(o == pid and k == "city" for o, k in self.buildings.values())
        out = {}
        for t in TRACKS:
            lvl = p.levels[t] + 1
            if lvl > 5 or not has_city:
                continue
            if p.hand[TRACK_COMMODITY[t]] >= lvl and (lvl < 4 or self._capital_city_for(pid, t, lvl) is not False):
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
            empty, _ = self._reach(enemy["owner"], dst)
            empty = [w for w in empty if w != dst]
            owner = self.players[enemy["owner"]]
            if empty:
                self.knights[empty[0]] = enemy
                self.say(f"{self.name(pid)}'s knight drives off {owner.name}'s knight.")
            else:
                owner.knight_pieces[enemy["level"]] += 1
                self.say(f"{self.name(pid)}'s knight routs {owner.name}'s knight from the field.")
        else:
            self.say(f"{self.name(pid)} moved a knight.")
        self.update_longest_road()

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
        self.pay(p, {TRACK_COMMODITY[track]: lvl})
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
    def _progress_ok(self, pid, card):
        if card not in PROGRESS:
            return False
        if card == "alchemist":
            return self.phase == "roll"
        if self.phase != "main":
            return False
        if card == "pilgrimage":
            return self.raided
        if card == "muster":
            return bool(self.legal_knight_spots(pid))
        if card == "smithy":
            return bool(self.legal_promotions(pid))
        if card == "stonemason":
            return bool(self.legal_walls(pid))
        if card == "sapper":
            return bool(self.legal_road_removals(pid))
        if card == "pilgrim_road":
            return bool(self.legal_roads(pid) or self.legal_ships(pid))
        if card == "rally":
            return bool(self.legal_activations(pid))
        return True

    def act_play_progress(self, pid, a):
        card = a.get("card")
        p = self.players[pid]
        if card not in p.progress:
            raise IllegalMove("You don't hold that card.")
        if not self._progress_ok(pid, card):
            raise IllegalMove("You can't play that right now.")
        # validate parameters before spending the card
        param = PROGRESS[card]["param"]
        if param == "resources2":
            picks = a.get("resources")
            self._check_picks(picks, 2, RESOURCES)
        elif param == "commodities2":
            picks = a.get("resources")
            self._check_picks(picks, 2, COMMODITIES)
        elif param == "resource" and a.get("resource") not in RESOURCES:
            raise IllegalMove("Choose a resource.")
        elif param == "commodity" and a.get("resource") not in COMMODITIES:
            raise IllegalMove("Choose a commodity.")
        elif param == "resource_commodity":
            if a.get("resource") not in RESOURCES or a.get("commodity") not in COMMODITIES:
                raise IllegalMove("Choose a resource and a commodity.")
        elif param == "number" and a.get("number") not in (2, 3, 4, 5, 6, 8, 9, 10, 11, 12):
            raise IllegalMove("Choose a number other than 7.")
        elif param == "dice":
            d = a.get("dice")
            if not (isinstance(d, list) and len(d) == 2 and all(x in range(1, 7) for x in d)):
                raise IllegalMove("Choose both dice.")
        p.progress.remove(card)
        self.say(f"{p.name} played {progress_name(card)}.")
        others = [q for q in self.players if q.id != pid]
        if card in ("market_day", "weavers"):
            for r in a["resources"]:
                self.give(p, r, 1)
        elif card == "trade_charter":
            self.trade_charter = True
        elif card == "guild_monopoly":
            c = a["resource"]
            n = sum(self.move_card(q, p, c, 1) for q in others)
            self.say(f"{p.name} collects {n} {c}.")
        elif card == "resource_monopoly":
            r = a["resource"]
            n = sum(self.move_card(q, p, r, 2) for q in others)
            self.say(f"{p.name} collects {n} {r}.")
        elif card in ("toll_road", "tithe"):
            mine = self.vp(pid, hidden=False) if card == "toll_road" else p.card_count()
            for q in others:
                theirs = self.vp(q.id, hidden=False) if card == "toll_road" else q.card_count()
                if theirs > mine:
                    r = self.random_card(q)
                    if r:
                        self.move_card(q, p, r)
                        self.say(f"{q.name} pays {p.name} a card.")
        elif card == "pilgrimage":
            self.resume_phase = "main"
            self.robber_kind = "any"
            self.phase = "bandit"
        elif card == "miracle":
            self.produce(a["number"], only=pid)
            if self.pending_picks:
                self.phase = "pick"
        elif card == "pilgrim_road":
            self.start_placing("road", 2)
        elif card == "alms":
            self.give(p, a["resource"], 1)
            self.give(p, a["commodity"], 1)
        elif card == "muster":
            self.start_placing("knight", 1)
        elif card == "smithy":
            self.start_placing("promote", 2)
        elif card == "stonemason":
            self.start_placing("wall", 1)
        elif card == "sapper":
            self.start_placing("remove_road", 1)
        elif card == "rally":
            for v in self.legal_activations(pid):
                self.knights[v]["active"] = True
                self.knights[v]["activated_turn"] = self.turn_no
        elif card == "alchemist":
            self.act_roll(pid, {}, dice=a["dice"])
        elif card == "armorer":
            self.give(p, "steel", 1)
            self.give(p, "iron", 1)

    def _check_picks(self, picks, n, allowed):
        if not isinstance(picks, list) or len(picks) != n or any(r not in allowed for r in picks):
            raise IllegalMove(f"Choose {n}.")
        if any(self.bank[r] < picks.count(r) for r in set(picks)):
            raise IllegalMove("The bank doesn't have those.")

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
        self.trade_charter = False
        self.event = None

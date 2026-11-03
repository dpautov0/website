"""Heuristic computer players. Works for every rule set.

next_bot_action(game, rng, bots=None, styles=None) -> (pid, action) or None
picks an action for whichever player (in `bots`, default everyone) must act now.
action is None when a bot is waiting on humans (e.g. answers to its trade offer).

Styles change priorities: "builder" expands, "merchant" trades, "warlord" fights.
"""
from .board import RESOURCES, COMMODITIES, TERRAIN_RESOURCE
from .common import COSTS, pips
from .knights import TRACK_COMMODITY, TRACKS
from .progress import PROGRESS

STYLES = ["builder", "merchant", "warlord"]
STYLE_LABEL = {"builder": "Builder", "merchant": "Merchant", "warlord": "Warlord"}
# priority bonus per action kind for each style
STYLE_BONUS = {
    "builder": {"road": 2, "ship": 2, "village": 2},
    "merchant": {"bank_trade": 2, "offer": 3, "improve": 1},
    "warlord": {"knight": 3, "activate_knight": 3, "promote_knight": 2, "buy_decree": 3, "soldier": 3, "wall": 2},
}


def spot_value(g, v):
    score = 0
    seen = set()
    for hi in g.board.vertices[v]["hexes"]:
        h = g.board.hexes[hi]
        score += pips(h["number"]) * (0.5 if hi == g.bandit else 1)
        if h["terrain"] == "gold":
            score += 1
        r = TERRAIN_RESOURCE[h["terrain"]]
        if r and r not in seen:
            seen.add(r)
            score += 1
    if g.board.vertices[v]["harbor"]:
        score += 1
    return score


def _discard_choice(p, need, cards):
    res = {}
    for _ in range(need):
        r = max(cards, key=lambda c: p.hand[c] - res.get(c, 0))
        res[r] = res.get(r, 0) + 1
    return res


def _wanted(g, pid):
    """Resources this player is short of for its next likely builds, most wanted first."""
    p = g.players[pid]
    goals = ["city", "village", "road"] if not g.knights_mode else ["city", "village", "knight", "road"]
    need = {}
    for goal in goals:
        for r, n in COSTS[goal].items():
            if p.hand[r] < n:
                need[r] = need.get(r, 0) + n - p.hand[r]
    return sorted(need, key=need.get, reverse=True) or RESOURCES[:]


def next_bot_action(g, rng, bots=None, styles=None):
    bots = set(range(len(g.players))) if bots is None else set(bots)
    styles = styles or {}
    if g.phase == "over":
        return None
    if g.phase == "discard":
        for pid, need in g.pending_discard.items():
            if pid in bots:
                return pid, {"type": "discard", "resources": _discard_choice(g.players[pid], need, g.cards)}
        return None
    if g.phase == "pick":
        for pid, n in g.pending_picks.items():
            if pid in bots:
                want = _wanted(g, pid)
                res = {}
                for i in range(n):
                    r = next((x for x in want + RESOURCES if g.bank[x] > res.get(x, 0)), "grain")
                    res[r] = res.get(r, 0) + 1
                    want = want[1:] + want[:1]
                return pid, {"type": "pick", "resources": res}
        return None
    t = g.trade
    if t:
        # bots answer open offers first
        for pid in bots:
            if pid != t["from"] and pid not in t["accepted"] and pid not in t["declined"]:
                p = g.players[pid]
                fair = sum(t["give"].values()) >= sum(t["get"].values())
                ok = p.has(t["get"]) and fair and rng.random() < 0.6
                return pid, {"type": "respond_trade", "accept": ok}
        if t["from"] not in bots:
            return None  # a human's offer; it's up to them now
        if t["accepted"]:
            return t["from"], {"type": "complete_trade", "with": t["accepted"][0]}
        if len(t["declined"]) == len(g.players) - 1:
            return t["from"], {"type": "cancel_trade"}
        return t["from"], None  # waiting on humans; the server withdraws stale offers
    pid = g.current
    if pid not in bots:
        return None
    return pid, _turn_action(g, pid, rng, styles.get(pid))


def _turn_action(g, pid, rng, style=None):
    p = g.players[pid]
    ph = g.phase
    if ph == "setup_village":
        spots = g.legal_villages(pid, setup=True)
        best = max(spots, key=lambda v: spot_value(g, v) + rng.random())
        return {"type": "build", "what": "village", "at": best}
    if ph == "setup_road":
        opts = [("road", e) for e in g.legal_roads(pid)] + [("ship", e) for e in g.legal_ships(pid)]
        what, at = rng.choice(opts)
        return {"type": "build", "what": what, "at": at}
    if ph == "roll":
        if "alchemist" in p.progress and rng.random() < 0.5:
            return {"type": "play_progress", "card": "alchemist", "dice": [rng.choice([2, 3, 4, 5]), rng.choice([3, 4, 5, 6])]}
        if "soldier" in p.decrees and not g.played_decree and rng.random() < (0.8 if style == "warlord" else 0.4):
            return {"type": "play_decree", "card": "soldier"}
        return {"type": "roll"}
    if ph == "bandit":
        return {"type": "move_bandit", "hex": _robber_target(g, pid, rng, style)}
    if ph == "steal":
        cands = g.steal_candidates()
        return {"type": "steal", "target": max(cands, key=lambda q: g.vp(q, hidden=False) + rng.random())}
    if ph == "place":
        for what, spots in g.legal_place(pid).items():
            if spots:
                return {"type": "place", "what": what, "at": rng.choice(spots)}
        return {"type": "place_done"}
    if ph == "main":
        return _main_action(g, pid, rng, style)
    return {"type": "end_turn"}


def _robber_target(g, pid, rng, style=None):
    leader = max((q.id for q in g.players if q.id != pid), key=lambda q: g.vp(q, hidden=False))
    best, best_score = None, -1
    for hi, h in enumerate(g.board.hexes):
        if hi == g.bandit or hi == g.pirate:
            continue
        land = g.board.is_land(hi)
        if not land and (not g.sea or g.robber_kind != "any"):
            continue
        score = rng.random()
        if land:
            for v in h["vertices"]:
                b = g.buildings.get(v)
                if b:
                    w = 2 if b[1] == "city" else 1
                    score += -5 * w if b[0] == pid else w * (1 + pips(h["number"]) / 3)
                    if style == "warlord" and b[0] == leader:
                        score += 2
        else:
            for e, o in g.ships.items():
                if hi in g.board.edges[e]["hexes"]:
                    score += -3 if o == pid else 1
        if score > best_score:
            best, best_score = hi, score
    return best


def _kind(a):
    t = a["type"]
    if t == "build":
        return a["what"]
    if t == "play_decree":
        return a["card"]
    if t == "offer_trade":
        return "offer"
    return t


def _main_action(g, pid, rng, style=None):
    p = g.players[pid]
    can = p.has
    opts = []
    # play progress cards that are ready
    if g.knights_mode:
        for c in set(p.progress):
            if c != "alchemist" and g._progress_ok(pid, c):
                a = {"type": "play_progress", "card": c}
                param = PROGRESS[c]["param"]
                if param == "resources2":
                    a["resources"] = [r for r in _wanted(g, pid)[:2]] if len(_wanted(g, pid)) >= 2 else ["grain", "iron"]
                elif param == "commodities2":
                    a["resources"] = rng.sample(COMMODITIES, 2)
                elif param == "resource":
                    a["resource"] = max(RESOURCES, key=lambda r: sum(q.hand[r] for q in g.players if q.id != pid))
                elif param == "commodity":
                    a["resource"] = rng.choice(COMMODITIES)
                elif param == "resource_commodity":
                    a["resource"], a["commodity"] = _wanted(g, pid)[0], rng.choice(COMMODITIES)
                elif param == "number":
                    a["number"] = rng.choice([5, 6, 8, 9])
                if param in ("resources2", "commodities2") and any(g.bank[r] < a["resources"].count(r) for r in a["resources"]):
                    continue
                opts.append((5, a))
    if not g.knights_mode:
        for c in set(p.decrees):
            if c in ("harvest", "monopoly", "road_charter") and not g.played_decree:
                a = {"type": "play_decree", "card": c}
                if c == "harvest":
                    a["resources"] = (_wanted(g, pid) * 2)[:2]
                    if any(g.bank[r] < a["resources"].count(r) for r in a["resources"]):
                        continue
                if c == "monopoly":
                    a["resource"] = max(RESOURCES, key=lambda r: sum(q.hand[r] for q in g.players if q.id != pid))
                if c == "road_charter" and not (g.legal_roads(pid) or g.legal_ships(pid)):
                    continue
                opts.append((4, a))
    if can(COSTS["city"]):
        spots = g.legal_cities(pid)
        if spots:
            opts.append((10, {"type": "build", "what": "city", "at": max(spots, key=lambda v: spot_value(g, v))}))
    if can(COSTS["village"]):
        spots = g.legal_villages(pid)
        if spots:
            opts.append((9, {"type": "build", "what": "village", "at": max(spots, key=lambda v: spot_value(g, v) + rng.random())}))
    if g.knights_mode:
        imp = g.improve_options(pid)
        for t in imp:
            opts.append((8, {"type": "improve", "track": t}))
        threat = g.raiders >= 4
        if can(COSTS["activate"]):
            act = g.legal_activations(pid)
            if act and (threat or rng.random() < 0.3):
                opts.append((7, {"type": "activate_knight", "at": act[0]}))
        if can(COSTS["knight"]):
            spots = g.legal_knight_spots(pid)
            if spots and (threat or rng.random() < 0.4):
                opts.append((6, {"type": "build", "what": "knight", "at": rng.choice(spots)}))
            promo = g.legal_promotions(pid)
            if promo and rng.random() < 0.3:
                opts.append((5, {"type": "promote_knight", "at": promo[0]}))
        if can(COSTS["wall"]) and g.legal_walls(pid) and rng.random() < 0.3:
            opts.append((4, {"type": "build", "what": "wall", "at": g.legal_walls(pid)[0]}))
        chase = g.chase_knights(pid)
        if chase and any(b[0] == pid for v in g.board.hexes[g.bandit]["vertices"] for b in [g.buildings.get(v)] if b):
            opts.append((6, {"type": "chase_bandit", "at": chase[0]}))
        moves = g.knight_moves(pid)
        if moves and rng.random() < 0.1:
            src = rng.choice(list(moves))
            opts.append((2, {"type": "move_knight", "from": src, "to": rng.choice(moves[src])}))
    if not g.knights_mode and can(COSTS["decree"]) and g.deck and rng.random() < (0.9 if style == "warlord" else 0.6):
        opts.append((5, {"type": "buy_decree"}))
    if p.pieces["village"] > 0 and not g.legal_villages(pid) or rng.random() < 0.3:
        if can(COSTS["road"]):
            roads = g.legal_roads(pid)
            if roads:
                opts.append((3, {"type": "build", "what": "road", "at": rng.choice(roads)}))
        if can(COSTS["ship"]):
            ships = g.legal_ships(pid)
            if ships:
                opts.append((3, {"type": "build", "what": "ship", "at": rng.choice(ships)}))
    moves = g.ship_moves(pid)
    if moves and rng.random() < 0.2:
        src = rng.choice(list(moves))
        opts.append((2, {"type": "move_ship", "from": src, "to": rng.choice(moves[src])}))
    # bank trades toward what we need
    want = _wanted(g, pid)
    for r in g.cards:
        rate = g.rate(pid, r)
        if p.hand[r] >= rate + (1 if r in want else 0) and want and want[0] != r and g.bank[want[0]] > 0:
            opts.append((1, {"type": "bank_trade", "give": r, "get": want[0]}))
            break
    # offer one player trade per turn: a spare card for something we need
    offered = getattr(g, "_bot_offered", set())
    g._bot_offered = offered
    chance = {"merchant": 0.7}.get(style, 0.2)
    if (g.turn_no, pid) not in offered and not g.trade and rng.random() < chance:
        spare = [r for r in g.cards if p.hand[r] >= 2 and r not in want[:2]]
        if spare and want and want[0] not in spare:
            offered.add((g.turn_no, pid))
            opts.append((2, {"type": "offer_trade", "give": {max(spare, key=lambda r: p.hand[r]): 1}, "get": {want[0]: 1}}))
    if opts:
        bonus = STYLE_BONUS.get(style, {})
        opts.sort(key=lambda o: o[0] + bonus.get(_kind(o[1]), 0) + rng.random(), reverse=True)
        return opts[0][1]
    return {"type": "end_turn"}

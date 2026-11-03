"""Random map generation: size, shape, terrain, numbers, harbors."""
import math
import random

from .board import Board, RESOURCES, axial_dist, axial_neighbors

SIZES = {"small": 19, "medium": 28, "large": 37, "huge": 50}
MAX_PLAYERS = {"small": 4, "medium": 5, "large": 6, "huge": 6}
SHAPES = ["classic", "continent", "islands"]

TERRAIN_WEIGHTS = {"forest": 4, "claypit": 3, "pasture": 4, "fields": 4, "hills": 3, "moor": 1}
NUMBERS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]
ORIGIN = (0, 0)


def _angle(c):
    x, y = math.sqrt(3) * (c[0] + c[1] / 2), 1.5 * c[1]
    return math.atan2(y, x)


def _ring(radius):
    return [c for c in _disc(radius) if axial_dist(c, ORIGIN) == radius]


def _disc(radius):
    return [(q, r) for q in range(-radius, radius + 1) for r in range(-radius, radius + 1)
            if abs(q + r) <= radius]


# ---- shapes ---------------------------------------------------------------
def shape_classic(n, rng):
    land = []
    radius = 0
    while len(land) < n:
        ring = sorted(_ring(radius), key=_angle) if radius else [ORIGIN]
        need = n - len(land)
        if need >= len(ring):
            land += ring
        else:
            # spread the partial ring evenly around the coast
            off = rng.randrange(len(ring))
            land += [ring[(off + round(i * len(ring) / need)) % len(ring)] for i in range(need)]
        radius += 1
    return [land]


def _grow(seed, size, rng, blocked=frozenset(), limit=9):
    """Grow a compact random blob of `size` cells from seed, avoiding `blocked` cells."""
    cells = {seed}
    while len(cells) < size:
        frontier = {}
        for c in cells:
            for nb in axial_neighbors(c):
                if nb in cells or nb in blocked or axial_dist(nb, ORIGIN) > limit:
                    continue
                frontier[nb] = sum(1 for x in axial_neighbors(nb) if x in cells)
        if not frontier:
            return None
        choices = list(frontier)
        weights = [frontier[c] ** 2.5 for c in choices]
        cells.add(rng.choices(choices, weights)[0])
    return cells


def shape_continent(n, rng):
    return [sorted(_grow(ORIGIN, n, rng))]


def shape_islands(n, rng):
    for _ in range(200):
        main_size = round(n * 0.5)
        k = 2 if n <= 19 else 3 if n <= 37 else 4
        rest = n - main_size
        sizes = [rest // k + (1 if i < rest % k else 0) for i in range(k)]
        islands = [_grow(ORIGIN, main_size, rng)]
        ok = True
        for size in sizes:
            land = set().union(*islands)
            # cells adjacent to existing land are off-limits so islands stay separate
            near = {nb for c in land for nb in axial_neighbors(c)} | land
            seeds = [c for c in _disc(7) if c not in near and min(axial_dist(c, x) for x in land) <= 3]
            if not seeds:
                ok = False
                break
            isl = _grow(rng.choice(seeds), size, rng, blocked=frozenset(near))
            if isl is None:
                ok = False
                break
            islands.append(isl)
        if ok:
            return [sorted(i) for i in islands]
    raise RuntimeError("could not generate islands")


# ---- terrain + numbers ------------------------------------------------------
def _terrain_bag(n, gold, rng):
    weights = dict(TERRAIN_WEIGHTS)
    if gold:
        weights["gold"] = 1
    total = sum(weights.values())
    exact = {t: w * n / total for t, w in weights.items()}
    counts = {t: int(x) for t, x in exact.items()}
    for t in sorted(exact, key=lambda t: exact[t] - counts[t], reverse=True)[: n - sum(counts.values())]:
        counts[t] += 1
    if counts["moor"] == 0:
        big = max(counts, key=counts.get)
        counts[big] -= 1
        counts["moor"] = 1
    bag = [t for t, c in counts.items() for _ in range(c)]
    rng.shuffle(bag)
    return bag


def _assign_numbers(cells, rng):
    bag = []
    while len(bag) < len(cells):
        b = NUMBERS[:]
        rng.shuffle(b)
        bag += b
    bag = bag[: len(cells)]
    hot = [x for x in bag if x in (6, 8)]
    cold = [x for x in bag if x not in (6, 8)]
    cellset = set(cells)
    best = []
    for _ in range(300):
        order = cells[:]
        rng.shuffle(order)
        chosen = []
        for c in order:
            if len(chosen) == len(hot):
                break
            if all(nb not in chosen for nb in axial_neighbors(c) if nb in cellset):
                chosen.append(c)
        if len(chosen) > len(best):
            best = chosen
        if len(best) == len(hot):
            break
    out = dict(zip(best, hot))
    rest = [c for c in cells if c not in out]
    rng.shuffle(rest)
    leftovers = cold + hot[len(best):]
    rng.shuffle(leftovers)
    out.update(zip(rest, leftovers))
    return out


# ---- harbors ------------------------------------------------------------------
def _place_harbors(board, rng, land_count):
    # open ocean = sea tiles connected to the board's edge (no harbors on lakes)
    ocean = {i for i, h in enumerate(board.hexes) if h["terrain"] == "sea" and len(board.hex_neighbors(i)) < 6}
    stack = list(ocean)
    while stack:
        i = stack.pop()
        for j in board.hex_neighbors(i):
            if j not in ocean and board.hexes[j]["terrain"] == "sea":
                ocean.add(j)
                stack.append(j)
    coastal = []
    for ei, e in enumerate(board.edges):
        hs = e["hexes"]
        if len(hs) == 2 and board.is_land(hs[0]) != board.is_land(hs[1]):
            sea = hs[0] if not board.is_land(hs[0]) else hs[1]
            land = hs[1] if sea == hs[0] else hs[0]
            if sea in ocean and board.hexes[land]["terrain"] not in ("moor", "gold"):
                coastal.append((ei, sea))
    cx = sum(board.hexes[i]["x"] for i in range(len(board.hexes)) if board.is_land(i)) / land_count
    cy = sum(board.hexes[i]["y"] for i in range(len(board.hexes)) if board.is_land(i)) / land_count

    def ang(item):
        a, b = board.edges[item[0]]["v"]
        mx = (board.vertices[a]["x"] + board.vertices[b]["x"]) / 2
        my = (board.vertices[a]["y"] + board.vertices[b]["y"]) / 2
        return math.atan2(my - cy, mx - cx)

    coastal.sort(key=ang)
    want = min(round(land_count / 2.1), len(coastal) // 3)
    any_n = round(want * 4 / 9)
    types = ["any"] * any_n
    while len(types) < want:
        r = RESOURCES[:]
        rng.shuffle(r)
        types += r
    types = types[:want]
    rng.shuffle(types)
    taken = set()
    picks = []
    off = rng.randrange(len(coastal)) if coastal else 0
    for i in range(want):
        start = off + round(i * len(coastal) / want)
        for j in range(len(coastal)):
            ei, sea = coastal[(start + j) % len(coastal)]
            a, b = board.edges[ei]["v"]
            if a in taken or b in taken:
                continue
            picks.append((ei, sea))
            for v in (a, b):
                taken.add(v)
                taken.update(board.vertices[v]["adj"])
            break
    for (ei, sea), t in zip(picks, types):
        a, b = board.edges[ei]["v"]
        mx = (board.vertices[a]["x"] + board.vertices[b]["x"]) / 2
        my = (board.vertices[a]["y"] + board.vertices[b]["y"]) / 2
        s = board.hexes[sea]
        board.harbors.append({"edge": ei, "type": t, "x": mx + (s["x"] - mx) * 0.55, "y": my + (s["y"] - my) * 0.55})
        board.vertices[a]["harbor"] = t
        board.vertices[b]["harbor"] = t


def generate(size="small", shape="classic", gold=False, rng=None):
    rng = rng or random.Random()
    n = SIZES[size]
    islands = {"classic": shape_classic, "continent": shape_continent, "islands": shape_islands}[shape](n, rng)
    land = [c for isl in islands for c in isl]
    terrains = dict(zip(land, _terrain_bag(n, gold, rng)))
    # keep gold off the home island when there are other islands to explore
    if shape == "islands":
        home = set(islands[0])
        away = [c for c in land if c not in home and terrains[c] != "gold"]
        for c in [c for c in islands[0] if terrains[c] == "gold"]:
            if away:
                swap = away.pop(rng.randrange(len(away)))
                terrains[c], terrains[swap] = terrains[swap], terrains[c]
    producing = [c for c in land if terrains[c] != "moor"]
    numbers = _assign_numbers(producing, rng)
    radius = max(axial_dist(c, ORIGIN) for c in land) + 1
    landset = set(land)
    tiles = [{"q": c[0], "r": c[1], "terrain": terrains[c], "number": numbers.get(c)} for c in land]
    near = {c for c in _disc(radius + 1) if c not in landset and min(axial_dist(c, x) for x in land) <= 2}
    tiles += [{"q": c[0], "r": c[1], "terrain": "sea", "number": None} for c in sorted(near)]
    board = Board(tiles)
    _place_harbors(board, rng, n)
    return board

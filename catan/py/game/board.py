"""Hex board geometry for any set of tiles.

Hexes are pointy-top in axial coordinates (q, r). Vertices and edges are
derived from corner pixel positions so neighbouring hexes share the same
vertex/edge ids. Sea tiles are part of the board (ships sail on them).
"""
import math

RESOURCES = ["timber", "clay", "wool", "grain", "iron"]
COMMODITIES = ["cloth", "parchment", "steel"]

TERRAIN_RESOURCE = {
    "forest": "timber",
    "claypit": "clay",
    "pasture": "wool",
    "fields": "grain",
    "hills": "iron",
    "moor": None,
    "gold": None,
    "sea": None,
}

SQ3 = math.sqrt(3)
AXIAL_DIRS = [(1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)]


def axial_neighbors(c):
    return [(c[0] + dq, c[1] + dr) for dq, dr in AXIAL_DIRS]


def axial_dist(a, b):
    dq, dr = a[0] - b[0], a[1] - b[1]
    return (abs(dq) + abs(dr) + abs(dq + dr)) // 2


class Board:
    def __init__(self, tiles):
        """tiles: list of {"q", "r", "terrain", "number"}."""
        self.hexes = []      # {q, r, x, y, terrain, number, vertices, island}
        self.vertices = []   # {x, y, hexes, adj, edges, harbor}
        self.edges = []      # {v: (a, b), hexes}
        self.harbors = []    # {edge, type, x, y}
        self._build(tiles)
        self._find_islands()
        land = {i for i, h in enumerate(self.hexes) if h["terrain"] != "sea"}
        self.land_vertices = frozenset(i for i, v in enumerate(self.vertices) if any(h in land for h in v["hexes"]))
        self.land_edges = frozenset(i for i, e in enumerate(self.edges) if any(h in land for h in e["hexes"]))
        self.sea_edges = frozenset(i for i, e in enumerate(self.edges) if any(h not in land for h in e["hexes"]))

    def _build(self, tiles):
        vert_index, edge_index = {}, {}
        for t in tiles:
            q, r = t["q"], t["r"]
            cx, cy = SQ3 * (q + r / 2), 1.5 * r
            hi = len(self.hexes)
            corners = []
            for i in range(6):
                a = math.radians(60 * i - 30)
                vx, vy = cx + math.cos(a), cy + math.sin(a)
                key = (round(vx, 3) + 0.0, round(vy, 3) + 0.0)
                if key not in vert_index:
                    vert_index[key] = len(self.vertices)
                    self.vertices.append({"x": vx, "y": vy, "hexes": [], "adj": [], "edges": [], "harbor": None})
                vi = vert_index[key]
                self.vertices[vi]["hexes"].append(hi)
                corners.append(vi)
            self.hexes.append({"q": q, "r": r, "x": cx, "y": cy, "terrain": t["terrain"],
                               "number": t.get("number"), "vertices": corners, "island": None})
            for i in range(6):
                a, b = corners[i], corners[(i + 1) % 6]
                k = (min(a, b), max(a, b))
                if k not in edge_index:
                    ei = edge_index[k] = len(self.edges)
                    self.edges.append({"v": k, "hexes": []})
                    self.vertices[a]["adj"].append(b)
                    self.vertices[b]["adj"].append(a)
                    self.vertices[a]["edges"].append(ei)
                    self.vertices[b]["edges"].append(ei)
                self.edges[edge_index[k]]["hexes"].append(hi)
        self._hex_at = {(h["q"], h["r"]): i for i, h in enumerate(self.hexes)}

    def _find_islands(self):
        n = 0
        for i, h in enumerate(self.hexes):
            if h["terrain"] == "sea" or h["island"] is not None:
                continue
            stack = [i]
            h["island"] = n
            while stack:
                j = stack.pop()
                for k in self.hex_neighbors(j):
                    hk = self.hexes[k]
                    if hk["terrain"] != "sea" and hk["island"] is None:
                        hk["island"] = n
                        stack.append(k)
            n += 1
        self.island_count = n

    # ---- queries --------------------------------------------------------
    def hex_index(self, q, r):
        return self._hex_at.get((q, r))

    def hex_neighbors(self, hi):
        h = self.hexes[hi]
        out = []
        for dq, dr in AXIAL_DIRS:
            j = self._hex_at.get((h["q"] + dq, h["r"] + dr))
            if j is not None:
                out.append(j)
        return out

    def is_land(self, hi):
        return self.hexes[hi]["terrain"] != "sea"

    def vertex_on_land(self, v):
        return v in self.land_vertices

    def vertex_island(self, v):
        for h in self.vertices[v]["hexes"]:
            if self.is_land(h):
                return self.hexes[h]["island"]
        return None

    def edge_on_land(self, e):
        return e in self.land_edges

    def edge_on_sea(self, e):
        return e in self.sea_edges

    def edge_between(self, a, b):
        for ei in self.vertices[a]["edges"]:
            if b in self.edges[ei]["v"]:
                return ei
        return None

    def other_end(self, e, v):
        a, b = self.edges[e]["v"]
        return b if a == v else a

    def to_dict(self):
        return {
            "hexes": [{k: h[k] for k in ("x", "y", "terrain", "number", "vertices", "island")} for h in self.hexes],
            "vertices": [{"x": v["x"], "y": v["y"]} for v in self.vertices],
            "edges": [list(e["v"]) for e in self.edges],
            "harbors": self.harbors,
        }

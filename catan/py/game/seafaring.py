"""Ships & Islands rules (mixin for Game). Inert unless options["seafaring"]."""
from .common import IllegalMove


class SeafaringMixin:
    def init_seafaring(self):
        self.ships = {}          # edge -> pid
        self.ships_new = set()   # ships built this turn (can't move yet)
        self.ship_moved = False
        self.pirate = None
        if self.sea:
            # start the pirate on open water away from the coast if possible
            sea = [i for i, h in enumerate(self.board.hexes) if h["terrain"] == "sea"]
            far = [i for i in sea if all(not self.board.is_land(j) for j in self.board.hex_neighbors(i))]
            self.pirate = self.rng.choice(far or sea)

    def pirate_blocks(self, e):
        return self.pirate is not None and self.pirate in self.board.edges[e]["hexes"]

    def legal_ships(self, pid, ignore=None):
        """Edges where pid may build a ship. `ignore` is a ship edge treated as absent (for moving)."""
        if not self.sea or self.players[pid].pieces["ship"] == 0 and ignore is None:
            return []
        board = self.board

        def free(e):
            return (e not in self.roads and (e not in self.ships or e == ignore)
                    and board.edge_on_sea(e) and not self.pirate_blocks(e))

        if self.phase == "setup_road":
            return [e for e in board.vertices[self.setup_vertex]["edges"] if free(e)]
        near = set()
        for v in self.my_vertices(pid):
            near.update(board.vertices[v]["edges"])
        out = []
        for e in sorted(near):
            edge = board.edges[e]
            if e == ignore or not free(e):
                continue
            for v in edge["v"]:
                b = self.buildings.get(v)
                if b and b[0] == pid:
                    out.append(e)
                    break
                if not self.vertex_blocked(pid, v) and any(
                        self.ships.get(x) == pid and x != e and x != ignore for x in board.vertices[v]["edges"]):
                    out.append(e)
                    break
        return out

    def open_ships(self, pid):
        """Ships at the open end of a shipping line (nothing of yours beyond one end)."""
        out = []
        for e, o in self.ships.items():
            if o != pid or e in self.ships_new or self.pirate_blocks(e):
                continue
            for v in self.board.edges[e]["v"]:
                b = self.buildings.get(v)
                if b and b[0] == pid:
                    continue
                if not any(self.ships.get(x) == pid for x in self.board.vertices[v]["edges"] if x != e):
                    out.append(e)
                    break
        return out

    def ship_moves(self, pid):
        if not self.sea or self.ship_moved or self.phase != "main":
            return {}
        out = {}
        for e in self.open_ships(pid):
            targets = [t for t in self.legal_ships(pid, ignore=e) if t != e]
            if targets:
                out[e] = targets
        return out

    def act_move_ship(self, pid, a):
        self._need("main")
        src, dst = a.get("from"), a.get("to")
        if dst not in self.ship_moves(pid).get(src, []):
            raise IllegalMove("You can't move that ship there.")
        del self.ships[src]
        self.ships[dst] = pid
        self.ship_moved = True
        self.say(f"{self.name(pid)} moved a ship.")
        self.update_longest_road()

    def on_village_built(self, pid, v):
        if not self.sea:
            return
        p = self.players[pid]
        isl = self.board.vertex_island(v)
        if isl is not None and isl not in p.home_islands and isl not in p.bonus_islands:
            p.bonus_islands.add(isl)
            self.say(f"{p.name} settles a new island! +1 victory point.")

    def end_turn_seafaring(self):
        self.ships_new = set()
        self.ship_moved = False

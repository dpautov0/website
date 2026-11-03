COSTS = {
    "road": {"timber": 1, "clay": 1},
    "ship": {"timber": 1, "wool": 1},
    "village": {"timber": 1, "clay": 1, "wool": 1, "grain": 1},
    "city": {"grain": 2, "iron": 3},
    "decree": {"wool": 1, "grain": 1, "iron": 1},
    "knight": {"wool": 1, "iron": 1},
    "promote": {"wool": 1, "iron": 1},
    "activate": {"grain": 1},
    "wall": {"clay": 2},
}


class IllegalMove(Exception):
    pass


def fmt(res):
    return ", ".join(f"{n} {r}" for r, n in res.items())


def pips(number):
    return 6 - abs(7 - number) if number else 0

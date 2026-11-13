"""Bridge between the browser host (p2p.js) and the game engine, run inside Pyodide.

Everything crosses the boundary as JSON strings so JS never touches Python objects.
"""
import base64
import json
import pickle
import random

from game.bot import STYLES, next_bot_action
from game.engine import Game, IllegalMove, normalize_options
from game.mapgen import MAX_PLAYERS

G = None
RNG = random.Random()


def resolve(options_json):
    return json.dumps(normalize_options(json.loads(options_json)))


def max_players(options_json):
    return MAX_PLAYERS[normalize_options(json.loads(options_json))["size"]]


def styles():
    return json.dumps(STYLES)


def new_game(names_json, options_json):
    global G
    G = Game(json.loads(names_json), json.loads(options_json))


def has_game():
    return G is not None


def apply(pid, action_json):
    """Returns "" on success, else the reason the move was refused."""
    try:
        G.apply(pid, json.loads(action_json))
        return ""
    except IllegalMove as e:
        return str(e) or "You can't do that."


def view(pid):
    return json.dumps(G.view(pid))


def bot_step(styles_json):
    """Next computer move as JSON [pid, action] (action null = waiting on humans), or null."""
    styles = {int(k): v for k, v in json.loads(styles_json).items()}
    got = next_bot_action(G, RNG, styles.keys(), styles)
    return json.dumps(None if got is None else list(got))


def save():
    return base64.b64encode(pickle.dumps(G)).decode() if G is not None else ""


def load(data):
    global G
    G = pickle.loads(base64.b64decode(data)) if data else None

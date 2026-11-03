"""Knights & Raiders progress cards: three decks, one per city-improvement track.

`param` tells the client what to ask for before playing:
  resources2 / commodities2 / resource / commodity / resource_commodity / number / dice / None
"""

ADVANCEMENTS = ["Printing Press", "Magna Carta", "Gunpowder", "Navigator's Compass", "The University"]

PROGRESS = {
    # Commerce (cloth)
    "market_day": {"track": "commerce", "count": 4, "name": "Market Day", "param": "resources2",
                   "desc": "Take any 2 resources from the bank."},
    "trade_charter": {"track": "commerce", "count": 3, "name": "Trade Charter", "param": None,
                      "desc": "For the rest of your turn, trade anything with the bank at 2:1."},
    "guild_monopoly": {"track": "commerce", "count": 3, "name": "Guild Monopoly", "param": "commodity",
                       "desc": "Name a commodity. Every other lord gives you 1 of it."},
    "resource_monopoly": {"track": "commerce", "count": 4, "name": "Resource Monopoly", "param": "resource",
                          "desc": "Name a resource. Every other lord gives you up to 2 of it."},
    "toll_road": {"track": "commerce", "count": 2, "name": "Toll Road", "param": None,
                  "desc": "Every lord with more victory points than you gives you 1 random card."},
    "weavers": {"track": "commerce", "count": 2, "name": "Weavers' Bounty", "param": "commodities2",
                "desc": "Take any 2 commodities from the bank."},
    # Faith (parchment); the Important Advancements also live in this deck
    "pilgrimage": {"track": "faith", "count": 2, "name": "Pilgrimage", "param": None,
                   "desc": "Move the bandits (or pirate) and steal a card. Only after the first raid."},
    "tithe": {"track": "faith", "count": 2, "name": "Tithe", "param": None,
              "desc": "Every lord with more cards than you gives you 1 random card."},
    "miracle": {"track": "faith", "count": 2, "name": "Miracle", "param": "number",
                "desc": "Name a number (not 7). Tiles with that number produce for you alone."},
    "pilgrim_road": {"track": "faith", "count": 2, "name": "Pilgrim Road", "param": None,
                     "desc": "Build 2 roads (or ships) for free."},
    "alms": {"track": "faith", "count": 3, "name": "Alms", "param": "resource_commodity",
             "desc": "Take 1 resource and 1 commodity of your choice from the bank."},
    # Arms (steel)
    "muster": {"track": "arms", "count": 2, "name": "Muster", "param": None,
               "desc": "Place a free basic knight."},
    "smithy": {"track": "arms", "count": 3, "name": "Smithy", "param": None,
               "desc": "Promote up to 2 of your knights for free."},
    "stonemason": {"track": "arms", "count": 2, "name": "Stonemason", "param": None,
                   "desc": "Build a free city wall."},
    "rally": {"track": "arms", "count": 2, "name": "Rally", "param": None,
              "desc": "Activate all of your knights for free."},
    "sapper": {"track": "arms", "count": 2, "name": "Sapper", "param": None,
               "desc": "Remove another lord's road from the open end of their network."},
    "alchemist": {"track": "arms", "count": 2, "name": "Alchemist", "param": "dice",
                  "desc": "Play instead of rolling: choose what the red and yellow dice show."},
    "armorer": {"track": "arms", "count": 2, "name": "Armorer", "param": None,
                "desc": "Take 1 steel and 1 iron from the bank."},
}


def progress_name(card):
    if card.startswith("adv:"):
        return card[4:]
    return PROGRESS[card]["name"]


def build_decks(rng):
    decks = {"commerce": [], "faith": [], "arms": []}
    for key, c in PROGRESS.items():
        decks[c["track"]] += [key] * c["count"]
    decks["faith"] += ["adv:" + a for a in ADVANCEMENTS]
    for d in decks.values():
        rng.shuffle(d)
    return decks

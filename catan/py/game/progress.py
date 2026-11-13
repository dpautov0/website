"""Knights & Raiders progress cards: three decks of 18, one per city-improvement track.

The deck makeup and effects follow the standard rules for this kind of expansion
(Commerce = trade, Faith = science, Arms = politics); the names are our own.

`param` tells the client what to ask for before playing:
  resource / commodity / card / dice / player_richer / player_progress / player_knights / None
"""

# one Important Advancement (a victory point card) sits in each of the Faith and Arms decks
ADVANCEMENTS = {"faith": "Printing Press", "arms": "Magna Carta"}

PROGRESS = {
    # Commerce (cloth, yellow)
    "merchant": {"track": "commerce", "count": 6, "name": "Merchant", "param": None,
                 "desc": "Put the merchant on a land tile next to your village or city. You trade that tile's resource 2:1, "
                         "and hold +1★ while you control the merchant."},
    "trade_fleet": {"track": "commerce", "count": 2, "name": "Trade Fleet", "param": "card",
                    "desc": "Name a resource or commodity. For the rest of your turn, trade it with the bank at 2:1."},
    "port_exchange": {"track": "commerce", "count": 2, "name": "Port Exchange", "param": None,
                      "desc": "Give each other lord 1 resource; each must give you 1 commodity back (if they have none, keep yours)."},
    "guild_master": {"track": "commerce", "count": 2, "name": "Guild Master", "param": "player_richer",
                     "desc": "Pick a lord with more ★ than you. Look at their hand and take any 2 cards."},
    "resource_monopoly": {"track": "commerce", "count": 4, "name": "Resource Monopoly", "param": "resource",
                          "desc": "Name a resource. Every other lord gives you 2 of it (if they have them)."},
    "commodity_monopoly": {"track": "commerce", "count": 2, "name": "Commodity Monopoly", "param": "commodity",
                           "desc": "Name a commodity. Every other lord gives you 1 of it (if they have one)."},
    # Faith (parchment, green)
    "alchemist": {"track": "faith", "count": 2, "name": "Alchemist", "param": "dice",
                  "desc": "Play instead of rolling: choose what the red and yellow dice show. The event die is rolled as usual."},
    "inventor": {"track": "faith", "count": 2, "name": "Inventor", "param": None,
                 "desc": "Swap two number tokens on the map (not 2, 12, 6 or 8)."},
    "crane": {"track": "faith", "count": 2, "name": "Crane", "param": None,
              "desc": "Your next city improvement this turn costs 1 commodity less."},
    "stonemason": {"track": "faith", "count": 1, "name": "Stonemason", "param": None,
                   "desc": "Build a free city wall."},
    "irrigation": {"track": "faith", "count": 2, "name": "Irrigation", "param": None,
                   "desc": "Take 2 grain for each fields tile next to your villages or cities."},
    "mining": {"track": "faith", "count": 2, "name": "Mining", "param": None,
               "desc": "Take 2 iron for each hills tile next to your villages or cities."},
    "master_builder": {"track": "faith", "count": 2, "name": "Master Builder", "param": None,
                       "desc": "Upgrade a village to a city for just 2 iron and 1 grain."},
    "road_charter": {"track": "faith", "count": 2, "name": "Road Charter", "param": None,
                     "desc": "Build 2 roads (or ships) for free."},
    "smithy": {"track": "faith", "count": 2, "name": "Smithy", "param": None,
               "desc": "Promote up to 2 of your knights for free (normal promotion rules apply)."},
    # Arms (steel, blue)
    "bishop": {"track": "arms", "count": 2, "name": "Bishop", "param": None,
               "desc": "Move the bandits and take 1 random card from every lord next to their new tile. Only after the first raid."},
    "deserter": {"track": "arms", "count": 2, "name": "Deserter", "param": "player_knights",
                 "desc": "Pick a lord. They remove one of their knights, and you place one of yours of the same strength for free."},
    "diplomat": {"track": "arms", "count": 2, "name": "Diplomat", "param": None,
                 "desc": "Remove any open road (nothing at one end). If it's your own, you may rebuild it somewhere else."},
    "intrigue": {"track": "arms", "count": 2, "name": "Intrigue", "param": None,
                 "desc": "Push away an enemy knight that stands on your road network, without using a knight of your own."},
    "saboteur": {"track": "arms", "count": 2, "name": "Saboteur", "param": None,
                 "desc": "Every lord with at least as many ★ as you discards half of their cards."},
    "spy": {"track": "arms", "count": 3, "name": "Spy", "param": "player_progress",
            "desc": "Look at a lord's progress cards and take one of them."},
    "call_to_arms": {"track": "arms", "count": 2, "name": "Call to Arms", "param": None,
                     "desc": "Activate all of your knights for free."},
    "royal_wedding": {"track": "arms", "count": 2, "name": "Royal Wedding", "param": None,
                      "desc": "Every lord with more ★ than you gives you 2 cards."},
}


def progress_name(card):
    if card.startswith("adv:"):
        return card[4:]
    return PROGRESS[card]["name"]


def build_decks(rng):
    decks = {"commerce": [], "faith": [], "arms": []}
    for key, c in PROGRESS.items():
        decks[c["track"]] += [key] * c["count"]
    for track, adv in ADVANCEMENTS.items():
        decks[track].append("adv:" + adv)
    for d in decks.values():
        rng.shuffle(d)
    return decks

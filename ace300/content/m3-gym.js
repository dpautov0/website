/* Mini Exam 3 · the recognition gym pages (#/l/m3-gym and one page per deck). One-tap drills that train SEEING the
   move: a problem statement or a graph, one question, tap, see why and "the read", next. The decks live in
   js/gym-m3.js; the gym widget (stats, chips, keys) is GYM.mount in js/drill.js. */
(function () {
  'use strict';
  const { R } = C;
  const ALL_IDS = GYM.DECKS.map((d) => d.id);
  const host = '<div class="gym-host"></div>';
  // a one-line summary of a deck's rule for the lesson list: math and bold stripped
  const subOf = (d) => {
    const s = d.rule.replace(/\$[^$]*\$/g, '…').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    return s.length > 110 ? s.slice(0, 110).replace(/\s+\S*$/, '') + '…' : s;
  };

  C.unit({
    id: 'm3gym', exam: 'm3', tools: true, num: 'Mini Exam 3', title: 'Recognition gym',
    lessons: [
      {
        id: 'm3-gym', title: 'Recognition gym: every deck, mixed', kind: 'review',
        sub: 'One tap per problem: which equation, which zone, which root, which area, which way it moves. Serves your weakest deck most',
        steps: [
          R(md`
            ### What this is for

            On the exam the hard part is rarely the algebra. It is the first five seconds: looking at a problem and knowing **which move it wants**. $P = MC$ or $MR = MC$? $Q^S$ or $Q^D$ at the ceiling? The larger root or the smaller? Which letters are the deadweight loss?

            That is a speed skill, and speed comes from reps. Every card here is one problem and one question you should answer **by looking**, not by solving. Tap an answer (or press 1–7). Read **the read** underneath: the one rule the card was testing. Press Enter for the next card.

            **How to use it.** Ten minutes a day until the exam. The target: **20 in a row, with a median time under 6 seconds.** If you are right but slow, the card says so; slow and right still means the move is not automatic yet.

            **The chips are the decks.** Tap a chip to switch that deck on or off. Each chip shows your accuracy on it; a red one is a weak spot. The gym serves weak decks and new decks more often, so the mix drifts toward what you need. Numbers, phrasings and cases change every time, so you cannot memorize the cards, only the moves.
          `),
          C.W(host, (el) => GYM.mount(el.querySelector('.gym-host'), ALL_IDS, true)),
          R(md`
            **One deck at a time:** ${GYM.DECKS.map((d) => `[${d.title}](#/l/m3-gym-${d.id})`).join(' · ')}.

            When a deck keeps going red, go back to its lesson: [the problem-type map](#/l/m3-map) lists which page teaches each move.
          `),
        ],
      },
      ...GYM.DECKS.map((d) => ({
        id: `m3-gym-${d.id}`, title: `Gym: ${d.title}`, kind: 'review', sub: subOf(d), hideHome: true,
        steps: [
          R('### The rule\n\n' + d.rule + '\n\nOne card at a time: read the problem, tap the move, then read **the read**. Aim for 20 in a row with a median under 6 seconds.'),
          C.W(host, (el) => GYM.mount(el.querySelector('.gym-host'), [d.id], false)),
          R(md`[Back to the mixed gym](#/l/m3-gym)`),
        ],
      })),
    ],
  });
})();

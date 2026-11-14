/* The recognition gym (#/l/e3-gym): one-tap reads for Exam 3. A fresh question, one tap (or a key), see why, next. Every
   deck keeps its own accuracy, streak and speed in this browser; the mixed page serves the weakest deck most. The decks
   are in js/e3-gym-decks.js, the engine (E3Drill.gym) in js/e3-drill.js. One page per deck, linked from the mixed page. */
(function () {
  'use strict';
  const { R } = C;
  const ALL_IDS = GYM.DECKS.map((d) => d.id);
  const NL = String.fromCharCode(10);

  EM.lesson('e3-gymu', {
    id: 'e3-gym', order: 5, kind: 'review', title: 'Recognition gym: every deck, mixed',
    sub: `${ALL_IDS.length} decks of one-tap reads: direction, H, phasors, α β λ δ, loss, polarization, hand, Γ, power, nodes, lines, bounces, stubs, λ/4, VSWR`,
    steps: [
      R(md`
        ### How the gym works

        Each card is one read you will make many times on the exam: which way a wave travels, which way H points, which hand it turns, what $\Gamma$ is, when the next bounce arrives. Answer it **by looking**, not by solving.

        - **One tap.** Tap an answer, or press 1 to 5.
        - **See why.** A wrong tap names the slip that gives that option. Every card then shows **the read**: the short path to the answer.
        - **Next.** Press Enter or the Next button.

        **Aim for under 8 seconds a card.** The line above the card shows your streak, accuracy and median time. The gym serves **your weakest decks most often** (and new decks until you have tried them). The chips turn decks on and off; a red chip is a weak deck: open its own page below, read its rule once, and do 20 in a row there. Your record stays in this browser.
      `),
      C.W('<div class="gym-host"></div>', (el) => E3Drill.gym(el.querySelector('.gym-host'), ALL_IDS, true)),
      R(md`
        ### One deck at a time

        ${GYM.DECKS.map((d) => `- [${d.title}](#/l/e3-gym-${d.id}): ${d.sub}.`).join(NL + '        ')}
      `),
    ],
  });

  GYM.DECKS.forEach((d, i) => EM.lesson('e3-gymu', {
    id: `e3-gym-${d.id}`, order: 5 + (i + 1) / 100, kind: 'review', hideHome: true,
    title: `Gym: ${d.title}`, sub: d.sub,
    steps: [
      R(md`### The rule

${d.rule}

Aim for 20 in a row, each under 8 seconds.`),
      C.W('<div class="gym-host"></div>', (el) => E3Drill.gym(el.querySelector('.gym-host'), [d.id], false)),
      R(md`[Back to the mixed gym](#/l/e3-gym), where every deck is shuffled together.`),
    ],
  }));
})();

/* "Which end is which": reading NMOS vs PMOS, then the three questions (where is the source, what does the test node
   touch, is the gate held) and the drill e2_look. First lesson of Unit 7; also at #/look. */
(function () {
  'use strict';
  const { R, G } = C;
  const lbl = (x, y, t) => ['txt', [x, y], `$${t}$`];

  // NMOS and PMOS side by side, terminals labelled
  const pair = [
    ['nmos', [1, 1], { n: '\\text{NMOS}' }], lbl(1.35, -0.1, 'D'), lbl(-0.15, 0.75, 'G'), lbl(1.35, 2.15, 'S'),
    ['w', [1, 0], [1, -0.4]], ['rail', [1, -0.4]], ['gnd', [1, 2]],
    ['pmos', [4, 1], { n: '\\text{PMOS}' }], lbl(4.35, -0.1, 'S'), lbl(2.85, 0.75, 'G'), lbl(4.35, 2.15, 'D'),
    ['w', [4, 0], [4, -0.4]], ['rail', [4, -0.4]], ['gnd', [4, 2]],
  ];
  // the same job done by an NMOS and by a PMOS: mirror images
  const degPair = [
    ['nmos', [1, 1]], ['acg', [0, 1]], ['w', [1, 0], [1, -0.5], [2, -0.5]], ['term', [2, -0.5], { n: '\\leftarrow R_X' }],
    ['R', [1, 2], [1, 3.2], { n: 'R' }], ['gnd', [1, 3.2]],
    ['pmos', [4.4, 1.2]], ['acg', [3.4, 1.2]], ['R', [4.4, -1], [4.4, 0.2], { n: 'R' }], ['rail', [4.4, -1]],
    ['w', [4.4, 2.2], [4.4, 2.7], [5.4, 2.7]], ['term', [5.4, 2.7], { n: '\\leftarrow R_X' }],
  ];
  const srcPair = [
    ['nmos', [1, 1]], ['acg', [0, 1]], ['w', [1, 0], [1, -0.4]], ['rail', [1, -0.4]],
    ['w', [1, 2], [1, 2.5], [2, 2.5]], ['term', [2, 2.5], { n: '\\leftarrow R_X' }],
    ['pmos', [4.4, 1]], ['acg', [3.4, 1]], ['gnd', [4.4, 2]],
    ['w', [4.4, 0], [4.4, -0.5], [5.4, -0.5]], ['term', [5.4, -0.5], { n: '\\leftarrow R_X' }],
  ];

  const lesson = {
    id: 'e2-u7-look', title: 'Which end is which? Reading NMOS and PMOS (drill)', ref: 'Start of Unit 7',
    steps: [
      R(md`
        ### Why this lesson

        Every impedance and every gain on the exam starts with three quick questions about each transistor. If you get them wrong, everything after is wrong, and PMOS is where people slip. This lesson gives you a fixed way to answer them, then a drill to make it automatic.
      `),
      R(md`
        ### Question 1: where is the source? Look for the arrow.

        **The arrow is always on the source.** That is the only rule you need. The rest follows:

        | | NMOS | PMOS |
        |---|---|---|
        | Arrow | on the **bottom** lead, points **out** | on the **top** lead, points **in** |
        | Source | bottom, toward ground | **top, toward $V_{DD}$** |
        | Drain | top | bottom |
        | Gate | the plate on the side | the plate on the side |

        Memory hook: **PMOS: Pointing in, source near Power.** A PMOS is an NMOS turned upside down: its source hangs off $V_{DD}$ the way an NMOS source sits on ground.
      `, pair),
      R(md`
        ### Question 2: what does the test node touch?

        Follow the wire from the test node (the $R_X$ arrow, or the output) to the transistor. It lands on one of three things:
        - the **plate on the side**: the **gate**;
        - the lead **with the arrow**: the **source**;
        - the lead **without the arrow**: the **drain**.

        Do not decide by "top" or "bottom" alone. Top is the drain for an NMOS but the source for a PMOS. **Arrow = source** works for both.
      `),
      R(md`
        ### Question 3: is the gate held, or does it move?

        - Gate tied to a fixed voltage (drawn with a triangle ▽, incremental ground): the gate is **held**.
        - Gate wired to the drain: a **diode-connected** transistor. The gate moves with the drain.
        - Gate wired somewhere that moves with the test node: the K rule (later in this unit).

        ### Then read off the answer

        | The test node touches... | Gate | What you see | Size |
        |---|---|---|---|
        | the gate | anything | $\infty$ | infinite |
        | the drain, source straight on its rail | held | $r_{ds}$ | big |
        | the drain, resistor $R$ between source and its rail | held | $r_{ds} + R + g_mr_{ds}R \approx r_{ds}(1 + g_mR)$ | bigger |
        | the source, drain straight on its rail | held | $\tfrac1{g_m}\parallel r_{ds}\approx\tfrac1{g_m}$ | small |
        | the source, resistor $R$ on the drain side | held | $\dfrac{r_{ds} + R}{1 + g_mr_{ds}}\approx\tfrac1{g_m}\big(1 + \tfrac{R}{r_{ds}}\big)$ | small |
        | the drain of a diode (gate tied to drain) | moves | $\tfrac1{g_m}\parallel r_{ds}\approx\tfrac1{g_m}$ | small |

        In one line: **drain looks big, source looks small, gate looks infinite, diode looks small.** "Its rail" means ground for an NMOS source and $V_{DD}$ for a PMOS source: both are incremental ground.
      `),
      R(md`
        ### PMOS gives the same answers: the pictures are mirror images

        The small-signal model does not know NMOS from PMOS. Turn the NMOS picture upside down, swap ground and $V_{DD}$ (both are incremental ground), and you have the PMOS picture with **the same answer**.

        Left: an NMOS drain with $R$ under its source, looked into from the top. Right: a PMOS drain with $R$ **above** its source (between the source and $V_{DD}$), looked into from the bottom. Both are $r_{ds} + R + g_mr_{ds}R$.

        For a PMOS, "under the source" becomes "between the source and $V_{DD}$". That is the whole translation.
      `, degPair),
      R(md`
        The same mirror for looking into a **source**. Left: an NMOS source, looked into from below, drain on $V_{DD}$. Right: a PMOS source, looked into from above, drain on ground. Both are about $1/g_m$.

        Watch the PMOS one: you are looking in from the **top** and you see a **small** resistance, because the top of a PMOS is its source.
      `, srcPair),
      R(md`
        ### The drill

        Each problem draws one transistor in a random setup, PMOS more often than NMOS. Answer the three questions in order, then compute the number. A wrong pick tells you what that option would have been the answer to. Do at least 10 in a row without a miss.
      `),
      G('e2_look', { need: 10 }),
    ],
  };
  E2.unit('e2u7').lessons.unshift(lesson);
})();

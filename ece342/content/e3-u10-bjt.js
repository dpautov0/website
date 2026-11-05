/* Unit 10 — the BJT: which lead is which (NPN/PNP), I_C = beta I_B and the four regions, DC analysis (assume active,
   solve, check, saturation fallback), then the small-signal model g_m = I_C/V_T, r_pi = beta/g_m, r_o = V_A/I_C and the
   MOSFET <-> BJT translation. Lectures 21–23, Spring 2026 Midterm 2 Problem 3. Every number was checked by script. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const B = window.E3B;
  const L = (l) => E3.lesson('e3u10', l);
  const lbl = (x, y, t, a = 'c') => ['txt', [x, y], `$${t}$`, { a }];
  const kO = (v) => `${v}\\,\\text{k}\\Omega`;

  // ---------------------------------------------------------------- figures
  const pair = [
    ['npn', [1, 1], { n: '\\text{NPN}' }], lbl(1.35, -0.15, 'C', 'l'), lbl(-0.2, 0.72, 'B'), lbl(1.35, 2.2, 'E', 'l'),
    ['w', [1, 0], [1, -0.4]], ['rail', [1, -0.4]], ['gnd', [1, 2]],
    ['pnp', [4.2, 1], { n: '\\text{PNP}' }], lbl(4.55, -0.15, 'E', 'l'), lbl(3, 0.72, 'B'), lbl(4.55, 2.2, 'C', 'l'),
    ['w', [4.2, 0], [4.2, -0.4]], ['rail', [4.2, -0.4]], ['gnd', [4.2, 2]],
  ];
  const currents = [
    ['npn', [1, 1], { n: '\\text{NPN}' }], ['w', [1, 0], [1, -0.7]], ['iarr', [1, -0.35], 'd', { n: 'I_C' }],
    ['w', [0, 1], [-0.7, 1]], ['iarr', [-0.35, 1], 'r', { n: 'I_B' }], ['w', [1, 2], [1, 2.7]], ['iarr', [1, 2.35], 'd', { n: 'I_E' }],
    ['pnp', [4.6, 1], { n: '\\text{PNP}' }], ['w', [4.6, 0], [4.6, -0.7]], ['iarr', [4.6, -0.35], 'd', { n: 'I_E' }],
    ['w', [3.6, 1], [2.9, 1]], ['iarr', [3.25, 1], 'l', { n: 'I_B' }], ['w', [4.6, 2], [4.6, 2.7]], ['iarr', [4.6, 2.35], 'd', { n: 'I_C' }],
  ];
  const ex1 = { kind: 'rb', VCC: 10, VBB: 2, RB: 20e3, RE: 1e3, RC: 4e3, beta: 100, VEE: 0 };
  const ex2 = { kind: 'div', VCC: 12, R1: 80e3, R2: 20e3, VBB: 2.4, RB: 16e3, RE: 1e3, RC: 5e3, beta: 100, VEE: 0 };
  const ex2th = { kind: 'rb', VCC: 12, VBB: 2.4, RB: 16e3, RE: 1e3, RC: 5e3, beta: 100, VEE: 0 };
  const ex3 = { kind: 'pnp', VCC: 5, VBB: 3, RB: 20e3, RE: 1e3, RC: 2e3, beta: 100, VEE: 0 };
  const ex4 = { kind: 'rb', VCC: 5, VBB: 3, RB: 20e3, RE: 0, RC: 10e3, beta: 100, VEE: 0 };
  const pdc1 = { kind: 'rb', VCC: 9, VBB: 3, RB: 50e3, RE: 2e3, RC: 3e3, beta: 100, VEE: 0 };
  const pdcP = { kind: 'pnp', VCC: 10, VBB: 6, RB: 40e3, RE: 2e3, RC: 3e3, beta: 50, VEE: 0 };
  const pdcS = { kind: 'rb', VCC: 5, VBB: 2, RB: 10e3, RE: 500, RC: 5e3, beta: 100, VEE: 0 };
  // a common emitter with its supply and bias, then the same circuit with everything DC turned off
  const ceBias = [
    ['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['w', [1, 0], [1.9, 0]], ['term', [1.9, 0], { n: 'v_{out}' }],
    ['npn', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }],
    ['V', [-0.6, 2.3], [-0.6, 3.3], { n: 'V_{BE}', side: 'l' }], ['gnd', [-0.6, 3.3]],
  ];
  const ceModel = [
    ['Vac', [-0.4, 0.2], [-0.4, 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.4, 1.4]], ['w', [-0.4, 0.2], [-0.4, 0], [1, 0]],
    ['R', [1, 0], [1, 2], { n: 'r_\\pi', side: 'l' }], ['vlab', [1.35, 0.35], [1.35, 1.65], { n: 'v_\\pi' }],
    ['w', [1, 2], [4.2, 2]], ['gnd', [2.4, 2]], ['G', [3, 0], [3, 2], { n: 'g_mv_\\pi', side: 'l' }], ['w', [3, 0], [5.6, 0]],
    ['R', [4.2, 0], [4.2, 2], { n: 'r_o' }], ['R', [5.6, 0], [5.6, 2], { n: 'R_C' }], ['w', [4.2, 2], [5.6, 2]], ['term', [5.6, -0.0], { n: 'v_{out}', side: 'r' }],
  ];

  // ================================================================== 1. which lead is which
  L({
    id: 'e3-u10-look', title: 'Which lead is which? Reading NPN and PNP', ref: 'Lecture 21',
    steps: [
      R(md`
        ### Why this lesson

        Every BJT question on Exam 3 starts the same way: find the emitter. Once you know which lead is the emitter, you know which lead is the collector, which way current flows, what the input resistance is, and what the stage is called. Exam 2 had the same first step for NMOS and PMOS ([which end is which](#/l/e2-u7-look)); this is the BJT version, and it is shorter, because the rule is identical: **the arrow marks the emitter**, the way it marked the source.
      `),
      R(md`
        ### The three leads

        A bipolar junction transistor has a **collector** (C), a **base** (B) and an **emitter** (E).

        | | NPN | PNP |
        |---|---|---|
        | Arrow | on the **bottom** lead, points **out** | on the **top** lead, points **in** |
        | Emitter | bottom, toward ground | **top, toward $V_{CC}$** |
        | Collector | top | bottom |
        | Base | the lead on the side, at the bar | the lead on the side, at the bar |

        Memory hook: **NPN: Not Pointing iN.** A PNP is an NPN turned upside down, exactly as a PMOS was an NMOS turned upside down: its emitter hangs off the supply.

        **The arrow is the direction conventional current flows in the emitter lead.** Out of an NPN, into a PNP.
      `, pair),
      Q(md`A PNP drawn the usual way (arrow on the top lead). Which lead is the emitter?`,
        ['The top lead (toward $V_{CC}$)', 'The bottom lead (toward ground)', 'The lead on the side'], 0,
        [null, 'That is where an **NPN** emitter sits. A PNP is the NPN flipped: its arrow, and its emitter, are on top.', 'The side lead, at the bar, is always the base.'],
        md`The arrow is always on the emitter. A PNP's arrow is on the top lead and points in. Its emitter sits at the higher voltage, toward $V_{CC}$, the way a PMOS source does.`,
        { fig: [['pnp', [1, 1]], ['w', [1, 0], [1, -0.4]], ['rail', [1, -0.4]], ['gnd', [1, 2]]] }),
      R(md`
        ### Which way the currents flow

        In the active region current enters an NPN at the collector and the base and leaves at the emitter. A PNP is the reverse: it enters at the emitter and leaves at the collector and the base. Either way
        $$I_E = I_C + I_B$$
        because current cannot pile up inside the transistor. The emitter always carries the most.

        So in the standard drawing current flows **top to bottom** through both: into the NPN's collector, out of its emitter; into the PNP's emitter, out of its collector.
      `, currents),
      Q(md`What does the arrow on a BJT symbol tell you?`,
        ['Which lead is the emitter, and the direction conventional current flows through it', 'The direction electrons flow through the collector', 'Which lead goes to ground', 'Nothing: it is decoration'], 0,
        [null, 'Electrons flow against conventional current, and the arrow is on the emitter, not the collector.', 'A PNP emitter goes to the **supply**, not to ground.', 'It is the only mark that tells NPN from PNP and emitter from collector.'],
        md`The arrow sits on the emitter and points the way conventional current flows there: out of an NPN, into a PNP.`),
      R(md`
        ### The MOSFET twin

        | BJT | MOSFET | Why they match |
        |---|---|---|
        | emitter (arrow) | source (arrow) | the terminal the control voltage is measured against: $v_{be}$, $v_{gs}$ |
        | base | gate | the control terminal |
        | collector | drain | where the controlled current comes out; looks like a current source |
        | NPN | NMOS | emitter/source toward ground |
        | PNP | PMOS | emitter/source toward the supply |

        Every Exam 2 picture has a BJT version obtained by swapping the symbol. The names change too: common **source** becomes common **emitter**, common **gate** becomes common **base**, and the source follower becomes the **emitter follower** (common collector).

        !!trap The one difference that matters for everything in Units 10–12
        A gate draws no current. **A base does.** Every BJT formula that differs from its MOSFET twin differs because of the base current, through $\beta$ and $r_\pi$.
      `),
      R(md`
        ### The drill

        Each problem draws one BJT, NPN or PNP, possibly mirrored left to right, with its leads labelled A, B, C in random order. Answer from the arrow alone. Six in a row and it is automatic.
      `),
      G('e3_bwhich', { need: 6 }),
    ],
  });

  // ================================================================== 2. I_C = beta I_B, the regions
  L({
    id: 'e3-u10-regions', title: 'How a BJT works: $I_C = \\beta I_B$ and the four regions', ref: 'Lectures 21–22',
    steps: [
      R(md`
        ### Why this lesson

        Before any amplifier, you need the DC operating point, and before that you need to know what the transistor does in each region. Problem 1 on a BJT exam is almost always "find $I_C$ and check the region". This lesson gives you the three equations and the region test.
      `),
      R(md`
        ### Two junctions

        A BJT is two pn junctions back to back: base–emitter (BE) and base–collector (BC). In the **forward-active** region (the amplifier region):
        - the **BE junction is forward biased**, so $V_{BE}\approx0.7\,\text{V}$ for an NPN ($V_{EB}\approx0.7\,\text{V}$ for a PNP);
        - the **BC junction is reverse biased** (or at zero), so the collector sits at or above the base for an NPN.

        The emitter injects carriers into the thin base. Almost all of them are swept across into the collector; a few recombine in the base and have to be replaced by base current. That gives the three equations:
        $$I_C = I_S\,e^{V_{BE}/V_T}\qquad I_C = \beta I_B\qquad I_E = I_C + I_B = (\beta + 1)I_B$$
        with $V_T = kT/q\approx25\,\text{mV}$ and $\beta$ typically 50–200. Also $\alpha = I_C/I_E = \dfrac{\beta}{\beta + 1}\approx 0.99$.

        **Numbers.** $\beta = 100$, $I_B = 10\,\mu\text{A}$: $I_C = 1\,\text{mA}$, $I_E = 1.01\,\text{mA}$. The emitter and collector currents are almost equal; the base current is about 1% of them.
      `),
      R(md`
        ### Why $V_{BE}\approx0.7\,\text{V}$ is good enough

        $I_C = I_S e^{V_{BE}/V_T}$ is steep: every $V_T\ln10 = 58\,\text{mV}$ of extra $V_{BE}$ multiplies $I_C$ by 10, and $V_T\ln2 = 17\,\text{mV}$ doubles it. Over the whole useful range of currents (a factor of 100, say), $V_{BE}$ moves by only about $0.12\,\text{V}$. So for DC analysis we freeze it at $0.7\,\text{V}$ and let the resistors set the current.

        !!intuition A BJT is a current amplifier with a fixed-voltage input
        Looking into the base you see a diode (about $0.7\,\text{V}$). Whatever current you push into the base comes out of the collector multiplied by $\beta$. That is the whole DC story in the active region.
      `),
      Q(md`$\beta = 100$ and the transistor is forward active with $I_B = 20\,\mu\text{A}$. What is $I_E$?`,
        ['$2.02\\,\\text{mA}$', '$2\\,\\text{mA}$', '$20\\,\\mu\\text{A}$', '$0.2\\,\\text{mA}$'], 0,
        [null, 'That is $I_C = \\beta I_B$. The emitter carries both: $I_E = (\\beta + 1)I_B$.', 'That is the base current itself.', 'Off by a factor of 10: $100\\times20\\,\\mu\\text{A} = 2\\,\\text{mA}$.'],
        md`$I_C = \beta I_B = 2\,\text{mA}$ and $I_E = I_C + I_B = (\beta + 1)I_B = 2.02\,\text{mA}$.`),
      R(md`
        ### The four regions

        Each junction is either on (forward biased) or off, so there are four combinations:

        | BE | BC | Region | What it means |
        |---|---|---|---|
        | on | off | **forward active** | amplifier: $I_C = \beta I_B$, $V_{CE} > 0.2\,\text{V}$ |
        | on | on | **saturation** | a closed switch: $V_{CE}\approx0.2\,\text{V}$, and now $I_C < \beta I_B$ |
        | off | off | **cutoff** | an open switch: no current |
        | off | on | reverse active | used upside down (rare) |

        **The quick test for active.** NPN: $V_C\ge V_B$ (the collector at or above the base). PNP: $V_C\le V_B$. A looser version is $V_{CE} > V_{CE,sat} = 0.2\,\text{V}$: between the two the BC junction is only slightly forward biased and the device still acts active. On exams, use $V_C\ge V_B$ unless told otherwise.

        For a PNP every voltage flips sign: $V_{EB}\approx0.7\,\text{V}$ when on, $V_{EC}\approx0.2\,\text{V}$ in saturation.
      `),
      Q(md`Which MOSFET region behaves like a BJT's **saturation** region (a closed switch, small voltage across it)?`,
        ['Triode', 'Saturation', 'Cutoff', 'There is no match'], 0,
        [null, 'The names cross over. MOSFET saturation is the **flat** current-source region: that is the BJT\'s forward-active region.', 'Cutoff is cutoff in both.', 'Triode is the match: both are "switch on, small voltage drop".'],
        md`The names are swapped between the two devices. **BJT forward active ↔ MOSFET saturation** (the amplifier region). **BJT saturation ↔ MOSFET triode** (switch closed). Say "the amplifier region" in your head to avoid the trap.`),
      Q(md`An NPN has $V_B = 1.4\,\text{V}$, $V_E = 0.7\,\text{V}$, $V_C = 0.9\,\text{V}$. Which region?`,
        ['Saturation', 'Forward active', 'Cutoff', 'Reverse active'], 0,
        [null, 'Active needs the collector at or above the base. Here $V_C = 0.9\\,\\text{V} < V_B = 1.4\\,\\text{V}$: the BC junction is forward biased by $0.5\\,\\text{V}$.', 'The BE junction has $0.7\\,\\text{V}$ across it: it is on.', 'Reverse active needs BE **off**.'],
        md`$V_{BE} = 0.7\,\text{V}$ (on) and $V_{BC} = 0.5\,\text{V}$ (on): both junctions on is saturation. Check: $V_{CE} = 0.2\,\text{V}$, the saturation voltage.`,
        { fig: [['npn', [1, 1]], ['w', [1, 0], [1, -0.3]], ['w', [1, 2], [1, 2.3]], ['w', [0, 1], [-0.3, 1]], lbl(1.2, -0.3, 'V_C = 0.9\\,\\text{V}', 'l'), lbl(1.2, 2.3, 'V_E = 0.7\\,\\text{V}', 'l'), lbl(-0.4, 1, 'V_B = 1.4\\,\\text{V}', 'r')] }),
      P({
        id: 'e3u10-cur', title: 'The three currents',
        q: md`A forward-active BJT has $\beta = 80$ and $I_E = 1.62\,\text{mA}$. Find $I_B$, $I_C$ and $\alpha$.`,
        parts: [{ lbl: 'I_B', unit: 'µA', ans: 20 }, { lbl: 'I_C', unit: 'mA', ans: 1.6 }, { lbl: '\\alpha', unit: '', ans: 80 / 81 }],
        hints: [md`$I_E = (\beta + 1)I_B$.`, md`$\alpha = \beta/(\beta + 1) = I_C/I_E$.`],
        sol: md`
1. $I_B = \dfrac{I_E}{\beta + 1} = \dfrac{1.62\,\text{mA}}{81} = 20\,\mu\text{A}$.
2. $I_C = \beta I_B = 80\times20\,\mu\text{A} = 1.6\,\text{mA}$ (check: $I_C + I_B = 1.62\,\text{mA}$ ✓).
3. $\alpha = \dfrac{\beta}{\beta + 1} = \dfrac{80}{81} = 0.988$.`,
      }),
      R(md`
        ### The drill

        Node voltages on an NPN or a PNP: decide each junction, then the region. For a PNP, flip every subtraction ($V_{EB} = V_E - V_B$).
      `),
      G('e3_bregion', { need: 5 }),
    ],
  });

  // ================================================================== 3. DC analysis
  L({
    id: 'e3-u10-dc', title: 'DC analysis: assume active, solve, check', ref: 'Lecture 22',
    steps: [
      R(md`
        ### Why this lesson

        Every small-signal number ($g_m$, $r_\pi$, the gain) needs $I_C$ first. Last semester's Problem 3 ([typed here](#/l/e3-sp26-bjt)) spent a third of its points on the DC operating point. The method is one fixed recipe; this lesson walks it on four circuits, including a PNP and one that saturates.
      `),
      R(md`
        !!method The recipe
        1. **DC circuit.** Capacitors open, signal sources off (an AC source becomes 0 V).
        2. **Assume forward active:** $V_{BE} = 0.7\,\text{V}$ ($V_{EB}$ for a PNP), $I_C = \beta I_B$, $I_E = (\beta + 1)I_B$.
        3. **KVL around the base loop**, from the base supply, through $R_B$, the junction and $R_E$, to the emitter supply. Solve for $I_B$.
        4. **Node voltages:** $V_E$, $V_B = V_E\pm0.7$, $V_C$.
        5. **Check:** NPN $V_C\ge V_B$, PNP $V_C\le V_B$. If it fails, the transistor is saturated: set $|V_{CE}| = 0.2\,\text{V}$ and solve again with $I_B$ and $I_C$ as two separate unknowns.
      `),
      R(md`
        ### Example 1: base resistor and emitter resistor

        $V_{CC} = 10\,\text{V}$, $V_{BB} = 2\,\text{V}$, $R_B = 20\kO$, $R_E = 1\kO$, $R_C = 4\kO$, $\beta = 100$.

        **Step 3: the base loop.** Starting at $V_{BB}$ and walking to ground: drop $I_BR_B$ across $R_B$, $0.7\,\text{V}$ across the junction, and $I_ER_E = (\beta + 1)I_BR_E$ across $R_E$:
        $$V_{BB} = I_BR_B + 0.7 + (\beta + 1)I_BR_E\quad\Rightarrow\quad I_B = \frac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E} = \frac{1.3\,\text{V}}{20\kO + 101\kO} = 10.74\,\mu\text{A}$$
        So $I_C = \beta I_B = 1.074\,\text{mA}$.

        **Step 4.** $V_E = I_ER_E = 101\times10.74\,\mu\text{A}\times1\kO = 1.085\,\text{V}$, $V_B = 1.785\,\text{V}$, $V_C = 10 - (1.074\,\text{mA})(4\kO) = 5.70\,\text{V}$.

        **Step 5.** $V_C = 5.70\,\text{V}\ge V_B = 1.79\,\text{V}$: forward active ✓.

        !!key $R_E$ counts $(\beta + 1)$ times in the base loop
        $R_E$ carries the emitter current, $(\beta + 1)$ times the base current. Seen from the base loop it acts like a resistor $(\beta + 1)R_E$. This is the first appearance of the **$(\beta + 1)$ rule**, and it comes back in Unit 11 as the small-signal input resistance $r_\pi + (\beta + 1)R_E$.
      `, B.dcFig(ex1)),
      Q(md`Why does $R_E$ appear as $(\beta + 1)R_E$ in $I_B = \dfrac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E}$?`,
        ['$R_E$ carries the emitter current $(\\beta + 1)I_B$, so its voltage drop is $(\\beta + 1)I_BR_E$', 'Because $\\beta$ amplifies resistors', 'Because $R_E$ is in parallel with $r_\\pi$', 'It is an approximation for large $\\beta$'], 0,
        [null, 'Transistors amplify currents, not resistors. The factor comes from which current flows where.', '$r_\\pi$ is a small-signal quantity; this is a DC KVL.', 'It is exact (given $V_{BE} = 0.7\\,\\text{V}$ and $I_C = \\beta I_B$).'],
        md`Write the drop across $R_E$ in terms of the loop's unknown $I_B$: $V_{R_E} = I_ER_E = (\beta + 1)I_BR_E$. Divide by $I_B$ and $R_E$ "looks like" $(\beta + 1)R_E$.`),
      R(md`
        ### Example 2: a divider on the base

        Two resistors from $V_{CC}$ to ground set the base. Replace them by their Thévenin twin first: $V_{BB} = V_{CC}\dfrac{R_2}{R_1 + R_2}$ and $R_B = R_1\parallel R_2$. Then it is Example 1.

        $V_{CC} = 12\,\text{V}$, $R_1 = 80\kO$, $R_2 = 20\kO$: $V_{BB} = 12\times\tfrac{20}{100} = 2.4\,\text{V}$, $R_B = 16\kO$. With $R_E = 1\kO$, $R_C = 5\kO$, $\beta = 100$:
        $$I_B = \frac{2.4 - 0.7}{16\kO + 101\kO} = 14.53\,\mu\text{A},\qquad I_C = 1.453\,\text{mA}$$
        $V_E = 1.468\,\text{V}$, $V_B = 2.168\,\text{V}$, $V_C = 12 - 7.265 = 4.735\,\text{V}\ge V_B$ ✓.

        **The shortcut and its cost.** If you ignore the base current, $V_B = 2.4\,\text{V}$ exactly, $V_E = 1.7\,\text{V}$ and $I_E = 1.7\,\text{mA}$: 17% too high here, because $R_B = 16\kO$ is not small next to $(\beta + 1)R_E = 101\kO$. The shortcut is fine only when $R_B\ll(\beta + 1)R_E$.
      `, B.dcFig(ex2)),
      R(md`The same transistor after the swap: one source and one resistor on the base.`, B.dcFig(ex2th)),
      R(md`
        ### Example 3: a PNP

        Flip everything: $R_E$ hangs from $V_{CC}$ to the emitter on top, current flows **down** through the emitter and out of the collector and the base. $V_{CC} = 5\,\text{V}$, $V_{BB} = 3\,\text{V}$, $R_B = 20\kO$, $R_E = 1\kO$, $R_C = 2\kO$, $\beta = 100$.

        **Base loop**, from $V_{CC}$ down: $V_{CC} - (\beta + 1)I_BR_E - 0.7 - I_BR_B = V_{BB}$:
        $$I_B = \frac{V_{CC} - 0.7 - V_{BB}}{R_B + (\beta + 1)R_E} = \frac{1.3\,\text{V}}{121\kO} = 10.74\,\mu\text{A},\qquad I_C = 1.074\,\text{mA}$$
        $V_E = 5 - 1.085 = 3.915\,\text{V}$, $V_B = V_E - 0.7 = 3.215\,\text{V}$, $V_C = I_CR_C = 2.149\,\text{V}$.

        **Check (PNP):** $V_C = 2.15\,\text{V}\le V_B = 3.22\,\text{V}$ ✓ forward active. Same numbers as Example 1, upside down.
      `, B.dcFig(ex3)),
      R(md`
        ### Example 4: when the check fails

        $V_{CC} = 5\,\text{V}$, $V_{BB} = 3\,\text{V}$, $R_B = 20\kO$, no $R_E$, $R_C = 10\kO$, $\beta = 100$.

        **Assume active:** $I_B = 2.3\,\text{V}/20\kO = 115\,\mu\text{A}$, $I_C = 11.5\,\text{mA}$, $V_C = 5 - 115 = -110\,\text{V}$. Impossible, and certainly below $V_B = 0.7\,\text{V}$: **saturated**.

        **Redo with $V_{CE} = 0.2\,\text{V}$.** The emitter is grounded, so $V_C = 0.2\,\text{V}$ and
        $$I_C = \frac{5 - 0.2}{10\kO} = 0.48\,\text{mA},\qquad I_B = 115\,\mu\text{A}\ (\text{unchanged})$$
        **Consistency:** $\beta I_B = 11.5\,\text{mA} > I_C = 0.48\,\text{mA}$ ✓. In saturation the collector resistor, not $\beta$, limits the current: the transistor is a closed switch.
      `, B.dcFig(ex4)),
      Q(md`You assumed forward active on an NPN and found $V_C = 0.5\,\text{V}$, $V_B = 1.2\,\text{V}$. What next?`,
        ['Redo it in saturation: $V_{CE} = 0.2\\,\\text{V}$, $I_B$ and $I_C$ separate unknowns', 'Accept it: the currents came out positive', 'Assume cutoff', 'Use a smaller $\\beta$ until $V_C\\ge V_B$'], 0,
        [null, 'Positive currents are not the test. The collector is below the base, so the BC junction is forward biased: not active.', 'Cutoff needs the BE junction off; there is base drive here.', '$\\beta$ is a property of the transistor; you cannot tune it. In saturation $I_C < \\beta I_B$ simply stops holding.'],
        md`$V_C < V_B$ means the base–collector junction is forward biased: both junctions on, saturation. Replace "$I_C = \beta I_B$" by "$V_{CE} = 0.2\,\text{V}$" and solve again; then check $I_C < \beta I_B$.`),
      R(md`
        ### Capacitors at DC

        In amplifier circuits (like last semester's Problem 3) capacitors couple the signal in and out or bypass $R_E$. **At DC every capacitor is an open circuit**: erase it, and erase everything that is only reachable through it. That problem's DC part was: $V_B = 3\,\text{V}$ set by a source, so $V_E = 2.3\,\text{V}$, $I_E = 2.3\,\text{V}/2.3\kO = 1\,\text{mA}$, $I_C\approx1\,\text{mA}$, $V_C = 10 - (4\kO)(1\,\text{mA}) = 6\,\text{V}\ge V_B$ ✓. When the base voltage is fixed by a source, start from the emitter: $V_E = V_B - 0.7$.
      `),
      P({
        id: 'e3u10-dc1', title: 'Base and emitter resistors',
        q: md`$\beta = 100$. Find $I_C$ and $V_C$, and confirm the region.`,
        fig: B.dcFig(pdc1),
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.91270, accept: [0.92] }, { lbl: 'V_C', unit: 'V', ans: 6.2619, accept: [6.24] }, { lbl: 'Region', mc: ['Forward active', 'Saturation', 'Cutoff'], a: 0, fixed: true, why: [null, '$V_C$ comes out well above $V_B$.', 'The base drive is $3\\,\\text{V} > 0.7\\,\\text{V}$.'] }],
        hints: [md`$I_B = \dfrac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E}$.`, md`$V_E = (\beta + 1)I_BR_E$, $V_B = V_E + 0.7$, $V_C = V_{CC} - I_CR_C$.`],
        sol: md`
1. $I_B = \dfrac{3 - 0.7}{50\kO + 101\times2\kO} = \dfrac{2.3\,\text{V}}{252\kO} = 9.127\,\mu\text{A}$, so $I_C = 100\,I_B = 0.913\,\text{mA}$.
2. $V_E = 101\times9.127\,\mu\text{A}\times2\kO = 1.844\,\text{V}$, $V_B = 2.544\,\text{V}$.
3. $V_C = 9 - (0.913\,\text{mA})(3\kO) = 6.26\,\text{V}\ge V_B$: forward active ✓.

(With $\beta + 1\approx\beta$ you get $0.920\,\text{mA}$ and $6.24\,\text{V}$; also accepted.)`,
      }),
      P({
        id: 'e3u10-dcpnp', title: 'A PNP',
        q: md`$\beta = 50$. Find $I_C$ and $V_C$, and confirm the region.`,
        fig: B.dcFig(pdcP),
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1.16197, accept: [1.17857] }, { lbl: 'V_C', unit: 'V', ans: 3.48592, accept: [3.5357] }, { lbl: 'Region', mc: ['Forward active', 'Saturation', 'Cutoff'], a: 0, fixed: true, why: [null, 'For a PNP the test is $V_C\\le V_B$; here $V_C\\approx3.5\\,\\text{V}$ is below $V_B\\approx6.9\\,\\text{V}$.', '$V_{CC} - V_{BB} = 4\\,\\text{V}$ is more than enough to turn the junction on.'] }],
        hints: [md`From $V_{CC}$ down: $V_{CC} - (\beta + 1)I_BR_E - 0.7 - I_BR_B = V_{BB}$.`, md`PNP check: $V_C\le V_B$.`],
        sol: md`
1. $I_B = \dfrac{10 - 0.7 - 6}{40\kO + 51\times2\kO} = \dfrac{3.3\,\text{V}}{142\kO} = 23.24\,\mu\text{A}$, $I_C = 50\,I_B = 1.162\,\text{mA}$.
2. $V_E = 10 - 51\times23.24\,\mu\text{A}\times2\kO = 7.630\,\text{V}$, $V_B = V_E - 0.7 = 6.930\,\text{V}$.
3. $V_C = I_CR_C = 1.162\,\text{mA}\times3\kO = 3.486\,\text{V}\le V_B$: forward active ✓.`,
      }),
      P({
        id: 'e3u10-dcsat', title: 'Does it saturate?',
        q: md`$\beta = 100$. Find the region, then $I_C$ and $V_C$ ($V_{CE,sat} = 0.2\,\text{V}$).`,
        fig: B.dcFig(pdcS),
        parts: [{ lbl: 'Region', mc: ['Forward active', 'Saturation', 'Cutoff'], a: 1, fixed: true, why: ['Assuming active gives $V_C = -5.7\\,\\text{V}$, far below $V_B$.', null, 'There is $2\\,\\text{V}$ of base drive: the BE junction is on.'] }, { lbl: 'I_C', unit: 'mA', ans: 0.86522 }, { lbl: 'V_C', unit: 'V', ans: 0.67391, tol: { abs: 0.005 } }],
        hints: [md`Active first: $I_B = 1.3/(10\kO + 101\times0.5\kO)$. Where does that put $V_C$?`, md`Saturation: $I_B(R_B + R_E) + I_CR_E = V_{BB} - 0.7$ and $I_BR_E + I_C(R_C + R_E) = V_{CC} - 0.2$.`],
        sol: md`
1. **Assume active.** $I_B = \dfrac{1.3\,\text{V}}{10\kO + 50.5\kO} = 21.49\,\mu\text{A}$, $I_C = 2.149\,\text{mA}$, $V_C = 5 - 2.149\times5 = -5.74\,\text{V} < V_B$: saturated.
2. **Saturation, two unknowns.** Base loop: $2 - 0.7 = 10\kO\,I_B + 0.5\kO\,(I_B + I_C)$. Collector loop: $5 - 0.2 = 5\kO\,I_C + 0.5\kO\,(I_B + I_C)$:
$$10.5\,I_B + 0.5\,I_C = 1.3\,\text{mA·k}\Omega,\qquad 0.5\,I_B + 5.5\,I_C = 4.8\,\text{mA·k}\Omega$$
giving $I_B = 82.6\,\mu\text{A}$, $I_C = 0.865\,\text{mA}$.
3. $V_E = (I_B + I_C)R_E = 0.474\,\text{V}$, $V_C = V_E + 0.2 = 0.674\,\text{V}$.
4. **Consistency:** $\beta I_B = 8.26\,\text{mA} > I_C$ ✓ (in saturation there is more base current than the collector can use).`,
      }),
      R(md`
        ### The drill

        Random NPN and PNP bias circuits (base resistor, divider, split supply), most of them active, some saturated, a few cut off. Run the recipe every time; the check is part of the answer.
      `),
      G('e3_bdc', { need: 5 }),
    ],
  });

  // ================================================================== 4. small-signal model
  L({
    id: 'e3-u10-model', title: 'The small-signal model: $g_m$, $r_\\pi$, $r_o$', ref: 'Lecture 23',
    steps: [
      R(md`
        ### Why this lesson

        Every gain and every impedance in Units 11–15 is computed on this model. It is the MOSFET model from [Unit 6](#/l/e2-u6-model) with **one extra resistor**, $r_\pi$, from base to emitter. Learn what the three numbers mean and how to get them from the bias in your head.
      `),
      R(md`
        ### $g_m$: how much $i_c$ per volt of $v_{be}$

        Small changes around the bias: $g_m = \dfrac{dI_C}{dV_{BE}}$. From $I_C = I_Se^{V_{BE}/V_T}$:
        $$g_m = \frac{I_S e^{V_{BE}/V_T}}{V_T} = \frac{I_C}{V_T}$$
        **Numbers to own:** $1\,\text{mA}\to g_m = 40\,\text{mS}$, $1/g_m = 25\,\Omega$. It scales with current: $2\,\text{mA}\to80\,\text{mS}$ ($12.5\,\Omega$), $0.5\,\text{mA}\to20\,\text{mS}$ ($50\,\Omega$). In words: **$g_m$ in mS is 40 times $I_C$ in mA.**

        It depends only on the current: not on size, not on $\beta$. Compare a MOSFET: $g_m = 2I_D/V_{ov}$, which at $1\,\text{mA}$ and $V_{ov} = 0.2\,\text{V}$ is only $10\,\text{mS}$. **A BJT gives about 4–10 times more $g_m$ per milliamp.**
      `),
      R(md`
        ### $r_\pi$: the base draws current

        A change $v_{be}$ changes the collector current by $g_mv_{be}$, and the base current by $1/\beta$ of that. The base therefore looks like a resistor
        $$r_\pi = \frac{v_{be}}{i_b} = \frac{v_{be}}{g_mv_{be}/\beta} = \frac{\beta}{g_m}$$
        At $1\,\text{mA}$, $\beta = 100$: $r_\pi = 100\times25\,\Omega = 2.5\kO$. Note $g_mr_\pi = \beta$: handy for every simplification.

        This is the piece a MOSFET does not have: its gate is an insulator, $r_\pi\to\infty$. **A BJT with $\beta\to\infty$ is a MOSFET with $g_m = I_C/V_T$.**

        ### $r_o$: the Early effect

        $I_C$ rises slightly with $V_{CE}$, like $r_{ds}$ for the MOSFET: $r_o = V_A/I_C$ with the Early voltage $V_A$ (tens to a hundred volts). At $1\,\text{mA}$ and $V_A = 100\,\text{V}$: $r_o = 100\kO$. The intrinsic gain $g_mr_o = V_A/V_T$ does not depend on the current: $100/0.025 = 4000$, bigger than a MOSFET's $g_mr_{ds}$.
      `),
      R(md`
        ### The hybrid-$\pi$ model

        Between base and emitter: $r_\pi$, with $v_\pi$ across it (+ at the base). Between collector and emitter: a current source $g_mv_\pi$ flowing collector → emitter, in parallel with $r_o$. **The same model for NPN and PNP**, exactly as for NMOS and PMOS: write the PNP in it the same way and the signs take care of themselves.

        **Incremental grounds**, as in Exam 2: $V_{CC}$, ground, any fixed bias voltage, and large capacitors become ground; an ideal DC current source becomes an open circuit.
      `, E3F.hybridPi()),
      R(md`
        ### The translation table

        | | MOSFET (Exam 2) | BJT (Exam 3) |
        |---|---|---|
        | control voltage | $v_{gs}$ | $v_{be} = v_\pi$ |
        | input resistance of the device | gate: $\infty$ | base: $r_\pi = \beta/g_m$ |
        | transconductance | $g_m = 2I_D/V_{ov}$ | $g_m = I_C/V_T$ |
        | $g_m$ at $1\,\text{mA}$ | $10\,\text{mS}$ ($V_{ov} = 0.2\,\text{V}$) | $40\,\text{mS}$ |
        | output resistance | $r_{ds} = 1/(\lambda I_D)$ | $r_o = V_A/I_C$ |
        | intrinsic gain | $g_mr_{ds}$ (about 50–200) | $g_mr_o = V_A/V_T$ (about 2000–4000) |
        | looking into the low terminal (source / emitter) | $\tfrac1{g_m}$ | $\tfrac{r_\pi}{\beta + 1}\approx\tfrac1{g_m}$ |

        Everything in Exam 2 that never involved the gate current carries over unchanged. Everything that did (input resistances, anything through the base) picks up $r_\pi$ and factors of $\beta + 1$: that is Unit 11.
      `),
      Q(md`A BJT's collector current doubles (same $\beta$). What happens to $g_m$ and $r_\pi$?`,
        ['$g_m$ doubles, $r_\\pi$ halves', 'Both double', '$g_m$ doubles, $r_\\pi$ stays', 'Both stay the same'], 0,
        [null, '$r_\\pi = \\beta/g_m$: more $g_m$ means less $r_\\pi$.', '$r_\\pi = \\beta/g_m$ depends on $g_m$.', '$g_m = I_C/V_T$ is proportional to the current.'],
        md`$g_m = I_C/V_T$ doubles; $r_\pi = \beta/g_m$ halves. ($r_o = V_A/I_C$ halves too.)`),
      Q(md`Which element of the BJT small-signal model has no counterpart in the MOSFET model?`,
        ['$r_\\pi$', '$g_mv_\\pi$', '$r_o$', 'None: they are identical'], 0,
        [null, 'The controlled source is the same idea as $g_mv_{gs}$.', '$r_o$ plays the role of $r_{ds}$.', 'The base draws current; the gate does not. That current flows in $r_\\pi$.'],
        md`$r_\pi$ models the base current. A MOSFET's gate draws none, so its "$r_\pi$" is infinite. Every BJT/MOSFET difference in the next units traces back to this resistor.`),
      Q(md`At $I = 1\,\text{mA}$, which has the larger $g_m$: a BJT, or a MOSFET with $V_{ov} = 0.2\,\text{V}$?`,
        ['The BJT: $40\\,\\text{mS}$ vs $10\\,\\text{mS}$', 'The MOSFET: $10\\,\\text{mS}$ vs $4\\,\\text{mS}$', 'They are equal at equal current', 'It depends on $\\beta$'], 0,
        [null, 'BJT: $I_C/V_T = 1\\,\\text{mA}/25\\,\\text{mV} = 40\\,\\text{mS}$.', 'Different formulas: $I/V_T$ vs $2I/V_{ov}$, and $V_T = 25\\,\\text{mV}$ is smaller than $V_{ov}/2 = 100\\,\\text{mV}$.', '$g_m = I_C/V_T$ has no $\\beta$ in it.'],
        md`BJT: $g_m = I_C/V_T = 40\,\text{mS}$. MOSFET: $2I_D/V_{ov} = 10\,\text{mS}$. The ratio is $V_{ov}/(2V_T) = 4$ here.`),
      P({
        id: 'e3u10-model-num', title: 'Parameters from the bias',
        q: md`A BJT is biased at $I_C = 0.5\,\text{mA}$ with $\beta = 120$ and $V_A = 60\,\text{V}$. Find $g_m$, $r_\pi$ and $r_o$.`,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 20 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 6 }, { lbl: 'r_o', unit: 'kΩ', ans: 120 }],
        hints: [md`$1\,\text{mA}\to40\,\text{mS}$, so $0.5\,\text{mA}\to$?`],
        sol: md`
1. $g_m = I_C/V_T = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$ ($1/g_m = 50\,\Omega$).
2. $r_\pi = \beta/g_m = 120\times50\,\Omega = 6\kO$.
3. $r_o = V_A/I_C = 60\,\text{V}/0.5\,\text{mA} = 120\kO$.`,
      }),
      R(md`
        ### First use: the common-emitter gain

        Input on the base, emitter grounded, output at the collector with $R_C$ to $V_{CC}$. In the model, $v_\pi = v_{in}$ (the source drives the base directly), so the collector pulls $g_mv_{in}$ through $R_C\parallel r_o$:
        $$A_v = -g_m(R_C\parallel r_o)$$
        The common-source result with $g_m = I_C/V_T$. Last semester's Problem 3: $I_C = 1\,\text{mA}$, so $g_m = 40\,\text{mS}$, and the collector saw $R_{C1}\parallel R_L = 1\kO$: $A_v = -40$. The $r_\pi$ is there, but with an ideal source on the base it does not change $v_\pi$. (Put a resistor $R_S$ in front of the base and it does: $v_\pi = v_{in}\,r_\pi/(r_\pi + R_S)$. That is Unit 12.)
      `, ceModel),
      R(md`The circuit above, with its bias source. In the model the bias source and $V_{CC}$ are both ground.`, ceBias),
      R(md`
        ### The drill

        Bias in, parameters out: sometimes $I_C$ is given, sometimes $I_B$ or $I_E$, sometimes a whole bias circuit. Get to $g_m$ in your head ($40\times I_C$), then $r_\pi$ and $r_o$.
      `),
      G('e3_bgm', { need: 5 }),
    ],
  });

  // ================================================================== 5. mixed drill
  L({
    id: 'e3-u10-mix', title: 'Unit 10 mixed drill', ref: 'Lectures 21–23', kind: 'review',
    steps: [
      R(md`
        Every Unit 10 skill, mixed: reading NPN/PNP symbols, regions from node voltages, DC bias (with saturation), and $g_m$, $r_\pi$, $r_o$ from the bias. Ten without opening a solution completes it. Then the concept questions, shuffled.

        | Quantity | Formula | At $1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$ |
        |---|---|---|
        | $g_m$ | $I_C/V_T$ | $40\,\text{mS}$ ($1/g_m = 25\,\Omega$) |
        | $r_\pi$ | $\beta/g_m$ | $2.5\kO$ |
        | $r_o$ | $V_A/I_C$ | $100\kO$ |
        | DC base loop | $I_B = \dfrac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E}$ | |
        | active check | NPN $V_C\ge V_B$; PNP $V_C\le V_B$ | |
      `),
      G('e3_bdc', { need: 10, pool: ['e3_bwhich', 'e3_bregion', 'e3_bdc', 'e3_bdc', 'e3_bgm', 'e3_bgm'] }),
      G('concept', { need: 6, units: ['e3u10'] }),
    ],
  });
})();

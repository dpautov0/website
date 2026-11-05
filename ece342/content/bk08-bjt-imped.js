/* Book Chapter 8 — Looking into a BJT. The base (r_pi, and r_pi + (beta + 1)R_E), the emitter (r_pi/(beta + 1) and
   (R_B + r_pi)/(beta + 1)), the (beta + 1) rule both ways (Darlington, emitter-coupled pair), the collector (r_o, its
   degeneration with the beta r_o ceiling), the diode-connected BJT, the BJT cascode, and nodes that mix BJTs and
   MOSFETs. Lecture 24 (summary page) plus the r_o corrections. Every formula and number here was checked against an
   independent small-signal nodal solve. Figures: window.BK6 (js/gens-bk-a6.js); drills: GENS.bk8_*. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const F = window.BK6;
  const ss = F.ss;
  const L = (l) => BK.lesson('bk08', l);
  const ex = (...a) => BK.ex(...a);

  // ---------------------------------------------------------------- pictures used in several sections
  const hybrid = E3F.hybridPi();
  // a model with the currents of the base derivation written on it
  const baseREcur = [...ss({ b: 'test', e: 'RE', c: 'gnd' }), ['iarr', [1, 2.75], 'd', { n: '(\\beta+1)i_t', side: 'r', off: [16, 0] }]];
  const emitRBcur = [...ss({ b: 'RB', e: 'test', c: 'gnd' }), ['iarr', [-0.75, 0], 'l', { n: 'i_x', side: 'b', off: [0, 13] }]];
  // Darlington: Q1 at [1,1] drives Q2's base; R_E under Q2
  const darl = (o = {}) => [
    ['npn', [1, 1], { n: 'Q_1' }], ['npn', [2, 3], { n: 'Q_2' }], ['w', [1, 2], [1, 3]],
    ['w', [1, 0], [1, -0.4], [2, -0.4], [2, 2]], ['rail', [1.5, -0.4], { n: 'V_{CC}' }],
    ...(o.out ? [['R', [-1.3, 1], [0, 1], { n: 'R_B' }], ['acg', [-1.3, 1]], ['w', [2, 4], [2, 4.5]], F.upA([2, 4.5])]
      : [['R', [2, 4], [2, 5.2], { n: 'R_E' }], ['gnd', [2, 5.2]], ['w', [0, 1], [-0.7, 1]], F.inL([-0.7, 1])]),
  ];
  // emitter-coupled pair: look into Q1's base, Q2's base held, ideal tail source
  const pairFig = [
    ['rail', [1, 0], { n: 'V_{CC}' }], ['rail', [3, 0], { n: 'V_{CC}' }], ['npn', [1, 1], { n: 'Q_1' }], ['npn', [3, 1], { n: 'Q_2', flip: true }],
    ['w', [1, 2], [1, 2.4], [3, 2.4], [3, 2]], ['I', [2, 2.4], [2, 3.6], { n: 'I_{EE}' }], ['gnd', [2, 3.6]], ['acg', [4, 1]],
    ['w', [0, 1], [-0.7, 1]], F.inL([-0.7, 1]),
  ];
  const elevFig = [
    ['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1]], ['R', [-1.3, 1], [0, 1], { n: 'Z_B' }], ['acg', [-1.3, 1]],
    ['R', [1, 2], [1, 3.2], { n: 'Z_E', side: 'l' }], ['gnd', [1, 3.2]],
    ['txt', [-0.65, 0.35], '$\\text{base floor}$'], ['txt', [1.25, 2.3], '$\\text{emitter floor}$', { a: 'l' }],
    ['txt', [2.1, 0.75], '$\\text{up: }\\times(\\beta + 1)$', { a: 'l' }], ['txt', [2.1, 1.3], '$\\text{down: }\\div(\\beta + 1)$', { a: 'l' }],
  ];

  // ================================================================== 8.1 the base
  L({
    id: 'bk08-base', title: 'Looking into the base', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Chapter 8 at a glance

        This chapter asks one question three times: **what resistance does a small signal see when it pushes on a terminal of a BJT?** The base, the emitter and the collector each give a different answer, and each answer changes with what hangs on the other two terminals. Every gain in [Chapter 9](#/l/bk09-ce) is assembled from these answers, exactly as the MOSFET gains of [Chapter 4](#/l/bk04-norton) were assembled from the terminal resistances of [Chapter 3](#/l/bk03-test).

        **What you need first.** The hybrid-$\pi$ model of [Chapter 7](#/l/bk07-hybrid) ($g_m = I_C/V_T$, $r_\pi = \beta/g_m$, $r_o = V_A/I_C$), and the test-source method of [Chapter 1](#/l/bk01-test): turn off the independent sources, apply $v_t$ at the terminal, find the current $i_t$ it supplies, and divide.

        **What you will be able to do.** Write down, and derive when asked, the resistance looking into any BJT terminal with resistors around it; use the $(\beta + 1)$ rule in both directions; explain why a BJT collector cannot be boosted much past $\beta r_o$; and find the resistance of any node built from BJTs and MOSFETs.

        | Looking into | Typical size at $1\,\text{mA}$ | The result you will derive |
        |---|---|---|
        | the base | $\text{k}\Omega$ to hundreds of $\text{k}\Omega$ | $r_\pi + (\beta + 1)R_E$ |
        | the emitter | tens of $\Omega$ | $\dfrac{r_\pi + R_B}{\beta + 1}$ |
        | the collector | $100\kO$ to $\text{M}\Omega$ | $r_o\big[1 + g_m(R_E\parallel r_\pi)\big] + R_E\parallel r_\pi$ |

        !!key The reference transistor of this chapter
          $I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$, $V_T = 25\,\text{mV}$. Then $g_m = I_C/V_T = 40\,\text{mS}$ (so $1/g_m = 25\,\Omega$), $r_\pi = \beta/g_m = 2.5\kO$, $r_o = V_A/I_C = 100\kO$. Keep these four numbers in your head: every size comparison in the chapter is made with them.
      `),
      R(md`
        ### The question

        When a signal source drives the base of a transistor, how much current must it supply? The ratio $v/i$ is the **input resistance** of every common-emitter stage and every emitter follower, and it decides how much a BJT stage loads whatever drives it.

        On Exam 2 the gate always gave $R_{in} = \infty$ and you never had to think about it. A base never gives $\infty$. This section finds what it gives instead, first with the emitter grounded, then with a resistor $R_E$ under the emitter (Lecture 24's two cases).
      `),
      R(md`
        ### The physical picture

        The base–emitter junction is a forward-biased pn junction. Raise $V_{BE}$ by a small $v$ and the emitter injects more electrons across the thin base, so the collector current rises by $g_mv$ ([Chapter 7](#/l/bk07-gm)). A fraction $1/\beta$ of that increase must come in through the base lead: it replaces the holes the base loses to recombination and to back-injection into the emitter.

        So a base-voltage change $v$ brings a base-current change $g_mv/\beta$. The base behaves like a resistor $r_\pi = \beta/g_m$. Picture the base as **a valve with a small leak**: you steer a large collector current, and the price of steering is a base current $\beta$ times smaller.

        Sizes: $r_\pi = 2.5\kO$ at $1\,\text{mA}$ with $\beta = 100$, $25\kO$ at $0.1\,\text{mA}$; halve the current and $r_\pi$ doubles. A MOSFET gate is the plate of a capacitor: no current at all, $R = \infty$.
      `),
      R(md`
        ### The model

        Forward active, small signals: the hybrid-$\pi$ model ([Chapter 7](#/l/bk07-hybrid)). Between base and emitter sits $r_\pi$; from collector to emitter a controlled current $g_mv_\pi$, where $v_\pi = v_b - v_e$; and $r_o$ from collector to emitter. Every supply and every held bias voltage becomes incremental ground.

        We start with $r_o\to\infty$ (as Lecture 24 does), because $r_o$ is usually far larger than everything around it. At the end of the section we put it back and see exactly what it changes.
      `, hybrid),
      RF(md`
        ### Derivation 1: the emitter on its rail

        The circuit: collector on $V_{CC}$, emitter grounded, and we look into the base.

        [[fig:c]]

        Replace the transistor by its model. $V_{CC}$ becomes incremental ground, so the collector sits at 0 V, and so does the emitter. Put a test voltage $v_t$ on the base and call the current it supplies $i_t$.

        [[fig:m]]

        1. **Where can $i_t$ go?** The base node touches only $r_\pi$. The controlled source joins C and E, not B. So all of $i_t$ flows down through $r_\pi$: $i_t = v_\pi/r_\pi$.
        2. **The control voltage.** The emitter is grounded, so $v_\pi = v_b - v_e = v_t - 0 = v_t$.
        3. **Combine:** $i_t = v_t/r_\pi$.

        $$R_{in} = \frac{v_t}{i_t} = r_\pi = \frac{\beta}{g_m}$$

        The controlled source does carry $g_mv_t$, but it flows from the grounded collector to the grounded emitter. None of it passes through the test source, so it does not affect $R_{in}$.
      `, { c: { fig: F.lookB({}), cap: 'Looking into the base, emitter grounded.' }, m: { fig: ss({ b: 'test', e: 'gnd', c: 'gnd' }), cap: 'Its small-signal circuit with a test source on the base.' } }),
      RF(md`
        ### Derivation 2: a resistor $R_E$ under the emitter

        Now the emitter reaches ground through $R_E$. It is no longer held, and that changes everything.

        [[fig:c]]

        [[fig:m]]

        1. **The base current.** As before, $i_t$ has one path: down through $r_\pi$. So $v_\pi = i_tr_\pi$.
        2. **The collector current.** The controlled source carries $g_mv_\pi = g_mr_\pi\,i_t = \beta i_t$ from the collector into the emitter node (using $g_mr_\pi = \beta$).
        3. **KCL at the emitter.** Two currents arrive: $i_t$ through $r_\pi$ and $\beta i_t$ through the controlled source. One path leaves: $R_E$. So $R_E$ carries $(\beta + 1)i_t$, and the emitter sits at $v_e = (\beta + 1)i_tR_E$.
        4. **KVL from the base to ground:** $v_t = v_\pi + v_e = i_tr_\pi + (\beta + 1)i_tR_E$.

        $$R_{in} = \frac{v_t}{i_t} = r_\pi + (\beta + 1)R_E$$

        !!key Looking into the base
          $$R_{in} = r_\pi + (\beta + 1)R_E$$
          "Emitter resistance $R_E$ appears $(\beta + 1)$ larger looking from the base" (Lecture 24). A resistor $R_B$ in series in front of the base carries only $i_t$, so it adds once: $R_{in} = R_B + r_\pi + (\beta + 1)R_E$ (Lecture 24's summary page).
      `, { c: { fig: F.lookB({ RE: true }), cap: 'Looking into the base with $R_E$ under the emitter.' }, m: { fig: baseREcur, cap: 'The model. $i_t$ goes down $r_\\pi$; the controlled source adds $\\beta i_t$; $R_E$ carries both.' } }),
      R(md`
        ### The same result through $r_e$

        [Chapter 7](#/l/bk07-tmodel) defined the intrinsic emitter resistance $r_e = \alpha/g_m = V_T/I_E$. Since $r_\pi = \dfrac{\beta}{g_m} = (\beta + 1)\dfrac{\alpha}{g_m}$, we have exactly $r_\pi = (\beta + 1)r_e$, and the key result becomes
        $$R_{in} = (\beta + 1)(r_e + R_E)$$
        Read it as: **the base sees everything in the emitter path, the junction's own $r_e$ plus the external $R_E$, magnified by $\beta + 1$.** For the reference transistor with $R_E = 1\kO$: $101\times(24.75 + 1000)\,\Omega = 103.5\kO$.
      `),
      R(md`
        ### Check it

        - **$R_E\to0$:** $R_{in}\to r_\pi$, Derivation 1. ✓
        - **$\beta\to\infty$ at fixed $g_m$:** $r_\pi\to\infty$ and the base draws no current at all: a MOSFET gate, $R_{in} = \infty$. ✓
        - **Units:** $r_\pi$ is in ohms and $(\beta + 1)$ is a pure number. ✓
        - **One number:** reference transistor, $R_E = 1\kO$: $2.5\kO + 101\kO = 103.5\kO$. A $1\kO$ resistor looks like $101\kO$.
      `),
      RF(md`
        ### What $r_o$ changes

        Put $r_o$ back. It runs from the collector to the emitter, and the collector is at incremental ground, so $r_o$ is a **second path from the emitter to ground**, in parallel with $R_E$.

        [[fig:m]]

        Steps 1 and 2 do not change ($i_t$ still goes down $r_\pi$, the source still carries $\beta i_t$). In step 3 the $(\beta + 1)i_t$ arriving at the emitter now splits between $R_E$ and $r_o$, so $v_e = (\beta + 1)i_t(R_E\parallel r_o)$, and
        $$R_{in} = r_\pi + (\beta + 1)(R_E\parallel r_o)$$

        With $R_E = 1\kO$ and $r_o = 100\kO$, $R_E\parallel r_o = 990\,\Omega$: a 1% change, which is why Lecture 24 drops $r_o$. It matters when $R_E$ is not small next to $r_o$, above all when the emitter is fed by a current source ($R_E\to\infty$): then $R_{in} = r_\pi + (\beta + 1)r_o\approx\beta r_o$, very large but not infinite.

        With a resistor $R_C$ on the collector as well, the exact result is $R_{in} = r_\pi + R_E\dfrac{(\beta + 1)r_o + R_C}{r_o + R_C + R_E}$, which is again $r_\pi + (\beta + 1)R_E$ whenever $R_E$ and $R_C$ are small next to $r_o$.
      `, { m: { fig: ss({ b: 'test', e: 'RE', c: 'gnd', ro: true }), cap: 'With $r_o$: the collector is grounded, so $r_o$ hangs from the emitter to ground beside $R_E$.' } }),
      R(md`
        ### What it means

        **The base is a window onto the emitter circuit, with magnification $\beta + 1$.** Whatever you hang under the emitter (a resistor, the input of another transistor, a current source), the base sees it $\beta + 1$ times larger, plus the junction's own $r_\pi$.

        The magnification comes from current, not from voltage. The emitter follows the base (they differ by only $v_\pi$), so almost all of $v_t$ appears across $R_E$. But $R_E$ carries $(\beta + 1)$ times the current you supply. Same voltage, $(\beta + 1)$ times less current from you: $(\beta + 1)$ times more resistance.
      `),
      RF(md`
        ### How to recognize it

        The signal, or the arrow, arrives at the lead that ends on the bar: the base. Then ask one question: **what lies between the emitter and incremental ground?** Write $R_{in} = R_B + r_\pi + (\beta + 1)\times(\text{that})$.

        A PNP gives the same result. It is drawn upside down, emitter on top with $R_E$ up to $V_{CC}$, but $V_{CC}$ is incremental ground and the small-signal model is identical ([Chapter 7](#/l/bk07-pnpmodel)).

        [[fig:p]]
      `, { p: { fig: F.lookB({ pnp: true, RE: true }), cap: 'A PNP: emitter on top (arrow pointing in), $R_E$ to $V_{CC}$. Still $R_{in} = r_\\pi + (\\beta + 1)R_E$.' } }),
      R(md`
        ### Worked example

        $I_C = 0.5\,\text{mA}$, $\beta = 120$, $R_E = 200\,\Omega$, and a $10\kO$ resistor $R_B$ in series with the base; $r_o\to\infty$. Find $R_{in}$.

        1. $g_m = I_C/V_T = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$.
        2. $r_\pi = \beta/g_m = 120/(20\,\text{mS}) = 6\kO$.
        3. $(\beta + 1)R_E = 121\times200\,\Omega = 24.2\kO$.
        4. $R_{in} = R_B + r_\pi + (\beta + 1)R_E = 10 + 6 + 24.2 = 40.2\kO$.

        A $200\,\Omega$ resistor in the emitter outweighs the whole $6\kO$ junction.

        !!mistake Common mistakes
          - **Writing $\infty$ for a base** (the MOSFET habit). A base always draws current: at least $r_\pi$.
          - **Adding $R_E$ once**, $r_\pi + R_E$. It carries $(\beta + 1)$ times the base current.
          - **Multiplying $R_B$ or $r_\pi$ by $\beta + 1$.** Only resistance on the emitter side is multiplied; $R_B$ and $r_\pi$ carry the base current itself.
          - **$\beta$ instead of $\beta + 1$.** Harmless (1%), and accepted everywhere on this site.
      `),
      Q(md`The reference transistor ($\beta = 100$, $r_\pi = 2.5\kO$) has $R_E = 1\kO$ under its emitter; the collector is on $V_{CC}$. What is $R_{in}$ looking into the base?`,
        [md`$103.5\kO$`, md`$3.5\kO$`, md`$2.5\kO$`, md`$\infty$`, md`$253.5\kO$`], 0,
        [null, md`That adds $R_E$ once. $R_E$ carries $(\beta + 1)$ times the base current, so it counts 101 times.`, md`That ignores $R_E$: the emitter is not grounded here.`, md`That is a MOSFET gate. A base draws current through $r_\pi$.`, md`That multiplies $r_\pi$ by $\beta + 1$. Only the emitter-side resistance is multiplied.`],
        md`$R_{in} = r_\pi + (\beta + 1)R_E = 2.5\kO + 101\times1\kO = 103.5\kO$. The emitter resistor dominates.`,
        { fig: F.lookB({ RE: true }) }),
      Q(md`Why does $R_E$ look $(\beta + 1)$ times bigger from the base?`,
        [md`$R_E$ carries $(\beta + 1)$ times the current you supply, at nearly the same voltage`, md`The transistor amplifies the base voltage by $\beta + 1$ before it reaches $R_E$`, md`Because $r_\pi$ is in series with $R_E$`, md`Because the collector current flows through $r_\pi$`], 0,
        [null, md`The emitter follows the base: the voltage across $R_E$ is a little **less** than $v_t$, not larger. The magnification is in current.`, md`Resistances in series add; they do not multiply. The factor comes from the extra current $\beta i_t$ that joins at the emitter.`, md`The collector current flows from C to E and on into $R_E$; it never passes through $r_\pi$.`],
        md`Resistance is voltage over current. Across $R_E$ you find almost all of $v_t$, while $R_E$ carries $i_t + \beta i_t$. Seen from the base, where only $i_t$ is supplied, $R_E$ is worth $(\beta + 1)R_E$.`),
      Q(md`The emitter is fed by an **ideal current source** instead of $R_E$; the collector is on $V_{CC}$, and we keep $r_o$. What do you see looking into the base?`,
        [md`$r_\pi + (\beta + 1)r_o$`, md`$\infty$`, md`$r_\pi$`, md`$r_\pi + r_o$`], 0,
        [null, md`The current source is open for signals, but $r_o$ still connects the emitter to the grounded collector.`, md`That treats the emitter as grounded. A current source is an open circuit, not a short.`, md`$r_o$ is on the emitter side, so it is multiplied by $\beta + 1$ like any $R_E$.`],
        md`An ideal current source is an open circuit for signals ($R_E\to\infty$), so the only emitter-side path is $r_o$ to the grounded collector: $R_{in} = r_\pi + (\beta + 1)(\infty\parallel r_o) = r_\pi + (\beta + 1)r_o\approx\beta r_o$. Huge, but finite.`),
      P({
        id: 'bk08-base-1', title: 'Warm-up: the bare base',
        q: md`A BJT runs at $I_C = 0.25\,\text{mA}$ with $\beta = 80$; its emitter is grounded and its collector is on $V_{CC}$. Find $g_m$, $r_\pi$ and the resistance looking into the base.`,
        fig: F.lookB({}),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 10 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 8 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 8, traps: [{ v: 0.1, msg: 'That is $1/g_m$, the emitter-side resistance. From the base you see $r_\\pi = \\beta/g_m$.' }] }],
        hints: [md`$g_m = I_C/V_T$ with $V_T = 25\,\text{mV}$.`, md`With the emitter grounded, the base sees only $r_\pi$.`],
        sol: md`
1. $g_m = \dfrac{I_C}{V_T} = \dfrac{0.25\,\text{mA}}{25\,\text{mV}} = 10\,\text{mS}$.
2. $r_\pi = \dfrac{\beta}{g_m} = \dfrac{80}{10\,\text{mS}} = 8\kO$.
3. Emitter grounded: $R_{in} = r_\pi = 8\kO$ (Derivation 1). The controlled source runs between two grounded nodes and draws nothing from the test source.`,
      }),
      P({
        id: 'bk08-base-2', title: 'A small emitter resistor, a big effect',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 150$, $R_E = 470\,\Omega$, $r_o\to\infty$. Find $r_\pi$ and $R_{in}$ looking into the base.`,
        fig: F.lookB({ RE: true }),
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 1.875 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 72.845, traps: [{ v: 2.345, msg: 'That adds $R_E$ once. Seen from the base it counts $\\beta + 1 = 151$ times.' }, { v: 354.1, msg: 'That multiplies $r_\\pi$ by $\\beta + 1$ too. Only the emitter side is multiplied.' }] }],
        hints: [md`$g_m = 80\,\text{mS}$.`, md`$R_{in} = r_\pi + (\beta + 1)R_E$.`],
        sol: md`
1. $g_m = 2\,\text{mA}/25\,\text{mV} = 80\,\text{mS}$, so $r_\pi = 150/80\,\text{mS} = 1.875\kO$.
2. $(\beta + 1)R_E = 151\times0.47\kO = 70.97\kO$.
3. $R_{in} = 1.875 + 70.97 = 72.85\kO$. (With $\beta$ instead of $\beta + 1$: $72.38\kO$, also fine.)

The $470\,\Omega$ resistor contributes 97% of the input resistance.`,
      }),
      P({
        id: 'bk08-base-3', title: 'The formula, typed',
        q: md`Type the resistance looking into the base when a resistor $R_B$ is in series with the base and $R_E$ is under the emitter ($r_o\to\infty$). Use \`RB\`, \`rpi\`, \`beta\`, \`RE\`.`,
        fig: F.lookB({ RE: true, RB: true }),
        parts: [ex('RB + rpi + (beta + 1)*RE', ['RB', 'rpi', 'beta', 'RE'], 'R_{in}')],
        hints: [md`$R_B$ carries the base current $i_t$; $R_E$ carries $(\beta + 1)i_t$.`],
        sol: md`KVL from the input to ground: $v_t = i_tR_B + i_tr_\pi + (\beta + 1)i_tR_E$, so
$$R_{in} = R_B + r_\pi + (\beta + 1)R_E$$
$R_B$ and $r_\pi$ carry the base current and add once; $R_E$ carries the emitter current and counts $\beta + 1$ times.`,
      }),
      P({
        id: 'bk08-base-4', title: 'A current source in the emitter',
        q: md`The emitter is biased by an ideal current source (no $R_E$), the collector is on $V_{CC}$. $I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$. Find $r_o$ and the resistance looking into the base.`,
        fig: [['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1]], ['I', [1, 2], [1, 3.2], { n: 'I_{EE}' }], ['gnd', [1, 3.2]], ['w', [0, 1], [-0.7, 1]], F.inL([-0.7, 1])],
        parts: [{ lbl: 'r_o', unit: 'kΩ', ans: 50 }, { lbl: 'R_{in}', unit: 'MΩ', ans: 5.0525, traps: [{ v: 0.0525, msg: 'That is $r_\\pi + r_o$. $r_o$ hangs on the emitter side, so it is multiplied by $\\beta + 1$.' }] }],
        hints: [md`An ideal current source is an open circuit for signals. What is left between the emitter and ground?`, md`$r_o$ goes from the emitter to the collector, which is at incremental ground.`],
        sol: md`
1. $r_o = V_A/I_C = 50\,\text{V}/1\,\text{mA} = 50\kO$; $r_\pi = 2.5\kO$.
2. Small signal, the current source is open ($R_E\to\infty$). The only path from the emitter to ground is $r_o$ (to the grounded collector).
3. $R_{in} = r_\pi + (\beta + 1)(\infty\parallel r_o) = 2.5\kO + 101\times50\kO = 5.0525\,\text{M}\Omega\approx\beta r_o$.

This is why the input of a well-built emitter follower is enormous: the base sees the emitter's current source through the $(\beta + 1)$ window.`,
      }),
      P({
        id: 'bk08-base-5', title: 'A PNP, from the DC bias up',
        q: md`The PNP has $R_E = 1\kO$ from $V_{CC} = 5\,\text{V}$ to its emitter and $R_C = 2\kO$ from its collector to ground. Its base is held at $3.3\,\text{V}$ DC by the input source (which also carries the signal). $\beta = 100$, $V_{EB,on} = 0.7\,\text{V}$, $r_o\to\infty$. Find $I_E$, $I_C$, $r_\pi$ and the resistance looking into the base.`,
        fig: [['rail', [1, -1.2], { n: 'V_{CC} = 5\\,\\text{V}' }], ['R', [1, -1.2], [1, 0], { n: 'R_E', s: '1\\,\\text{k}\\Omega' }], ['pnp', [1, 1]],
          ['R', [1, 2], [1, 3.2], { n: 'R_C', s: '2\\,\\text{k}\\Omega' }], ['gnd', [1, 3.2]],
          ['w', [0, 1], [-0.8, 1]], ['node', [-0.8, 1], { n: 'V_B = 3.3\\,\\text{V}', side: 'a' }], ['w', [-0.8, 1], [-0.8, 1.3]], ['Vac', [-0.8, 1.3], [-0.8, 2.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.8, 2.3], [-0.8, 3.3], { n: '3.3\\,\\text{V}', side: 'l' }], ['gnd', [-0.8, 3.3]]],
        parts: [{ lbl: 'I_E', unit: 'mA', ans: 1 }, { lbl: 'I_C', unit: 'mA', ans: 0.990099, accept: [1] }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.525, accept: [2.5] },
          { lbl: 'R_{in}', unit: 'kΩ', ans: 103.525, traps: [{ v: 3.525, msg: '$R_E$ counts $\\beta + 1$ times from the base, PNP or not.' }] }],
        hints: [md`The emitter sits $0.7\,\text{V}$ above the base. Then $I_E = (V_{CC} - V_E)/R_E$.`, md`Small signal, $V_{CC}$ is ground: $R_E$ hangs from the emitter to ground, exactly like the NPN picture turned over.`],
        sol: md`
**DC.** $V_E = V_B + 0.7 = 4.0\,\text{V}$, so $I_E = (5 - 4)\,\text{V}/1\kO = 1\,\text{mA}$ and $I_C = \alpha I_E = \tfrac{100}{101}\,\text{mA} = 0.990\,\text{mA}$. Forward active? $V_C = I_CR_C = 1.98\,\text{V}$, below the base ($3.3\,\text{V}$): ✓.

**Small signal.** $g_m = I_C/V_T = 39.6\,\text{mS}$, $r_\pi = \beta/g_m = 2.525\kO$ ($2.5\kO$ if you round $I_C$ to $1\,\text{mA}$).

**Looking in.** $V_{CC}$ is incremental ground, so $R_E$ runs from the emitter to ground; $R_C$ sits on the collector and (with $r_o\to\infty$) does not matter:
$$R_{in} = r_\pi + (\beta + 1)R_E = 2.525 + 101\times1 = 103.5\kO$$
Or with $r_e = V_T/I_E = 25\,\Omega$: $R_{in} = (\beta + 1)(r_e + R_E) = 101\times1.025\kO = 103.5\kO$.`,
      }),
      R(md`
        ### Drill

        Random bias points, NPN and PNP, with and without $R_E$, $R_B$ and $r_o$. Compute $r_\pi$ first, then ask what lies under the emitter.
      `),
      G('bk8_base', { need: 4 }),
    ],
  });

  // ================================================================== 8.2 the emitter
  L({
    id: 'bk08-emitter', title: 'Looking into the emitter', ref: 'Lecture 24',
    steps: [
      R(md`
        ### The question

        What does a signal see when it pushes on the **emitter**, with the base held? This is the input resistance of the common-base stage and the output resistance of the emitter follower ([Chapter 9](#/l/bk09-cb)), and it is what a transistor's emitter presents to anything wired to it. Lecture 24 does it twice: base grounded, and base held through a resistor $R_B$.
      `),
      R(md`
        ### The physical picture

        Hold the base still and push the emitter up by a small $v$. The junction voltage $v_{be}$ falls by $v$, so the emitter current falls. How much? The emitter current is the whole current of the base–emitter diode, $I_E = I_C + I_B$, so its incremental resistance is a diode's ([Chapter 1](#/l/bk01-diode)): $V_T/I_E$.

        That is the intrinsic emitter resistance $r_e$. **At $1\,\text{mA}$ the emitter looks like $25\,\Omega$**: The Art of Electronics' rule $r_e\approx25\,\Omega/I_C[\text{mA}]$. The emitter is the BJT's low-resistance terminal, the twin of a MOSFET source ($1/g_m$).

        If the base is held only through a resistor $R_B$, it does not stay perfectly still. The change in base current flows through $R_B$ and drags the base along. But the base current is only $1/(\beta + 1)$ of the emitter current, so **$R_B$ shows up at the emitter divided by $\beta + 1$**.
      `),
      RF(md`
        ### Derivation 1: the base grounded

        [[fig:c]]

        Test source $v_t$ on the emitter, pushing $i_t$ into the emitter node; base and collector at incremental ground.

        [[fig:m]]

        1. **The control voltage.** $v_\pi = v_b - v_e = 0 - v_t = -v_t$. The control voltage is the test voltage itself, with a minus sign.
        2. **Through $r_\pi$:** a current $v_t/r_\pi$ flows from the emitter up to the grounded base.
        3. **Through the controlled source:** it carries $g_mv_\pi = -g_mv_t$ from C to E, which is the same as $g_mv_t$ flowing from E up to C.
        4. **KCL at the emitter.** Everything the test source pushes in leaves by those two paths: $i_t = \dfrac{v_t}{r_\pi} + g_mv_t = \dfrac{(1 + \beta)v_t}{r_\pi}$.

        $$R = \frac{v_t}{i_t} = \frac{r_\pi}{\beta + 1} = \frac{1}{g_m + 1/r_\pi}\approx\frac{1}{g_m}$$

        And $\dfrac{r_\pi}{\beta + 1} = \dfrac{\beta}{(\beta + 1)g_m} = \dfrac{\alpha}{g_m} = r_e$ exactly: the derivation and the diode picture agree.
      `, { c: { fig: F.lookE({}), cap: 'Looking into the emitter, base held (the triangle is incremental ground).' }, m: { fig: ss({ b: 'gnd', e: 'test', c: 'gnd' }), cap: 'The model: $v_\\pi = -v_t$, and both $r_\\pi$ and the controlled source carry current away from the test source.' } }),
      RF(md`
        ### Derivation 2: $R_B$ in the base

        [[fig:c]]

        [[fig:m]]

        1. **The base path.** The current that leaves the emitter through $r_\pi$ now continues through $R_B$ to ground. Call it $i_x$. It sees $r_\pi$ and $R_B$ in series between $v_t$ and ground: $i_x = \dfrac{v_t}{r_\pi + R_B}$.
        2. **The control voltage.** $i_x$ flows from E to B through $r_\pi$, so the emitter is $i_xr_\pi$ above the base: $v_\pi = v_b - v_e = -i_xr_\pi$.
        3. **The controlled source:** $g_mv_\pi = -g_mr_\pi i_x = -\beta i_x$, i.e. $\beta i_x$ flows from E up to C.
        4. **KCL at the emitter:** $i_t = i_x + \beta i_x = (\beta + 1)\dfrac{v_t}{r_\pi + R_B}$.

        $$R = \frac{R_B + r_\pi}{\beta + 1} = r_e + \frac{R_B}{\beta + 1}$$

        !!key Looking into the emitter
          $$R = \frac{R_B + r_\pi}{\beta + 1}\approx\frac{1}{g_m} + \frac{R_B}{\beta + 1}$$
          "Base resistance appears $(\beta + 1)$ times smaller looking from the emitter" (Lecture 24). With $R_B = 0$: $r_\pi/(\beta + 1) = r_e\approx1/g_m$.
      `, { c: { fig: F.lookE({ RB: true }), cap: 'The base held through $R_B$.' }, m: { fig: emitRBcur, cap: 'The model: $i_x$ runs through $r_\\pi$ and $R_B$; the controlled source adds $\\beta i_x$.' } }),
      R(md`
        ### Check it

        - **$R_B\to0$:** $r_\pi/(\beta + 1)$, Derivation 1. ✓
        - **$R_B\to\infty$ (base floating):** $R\to\infty$. With the base open there can be no base current, so the transistor cannot change its current at all: the emitter is a dead end. ✓
        - **$\beta\to\infty$:** $R\to1/g_m$, the MOSFET source, where a gate resistor never matters. ✓
        - **One number:** $I_C = 2\,\text{mA}$, $\beta = 100$, $R_B = 5\kO$: $r_\pi = 1.25\kO$ and $R = 6.25\kO/101 = 61.9\,\Omega$.
      `),
      R(md`
        ### What $R_C$ and $r_o$ change

        With $r_o\to\infty$ (Lecture 24), a resistor $R_C$ on the collector changes nothing: the collector current is $g_mv_\pi$ whatever the collector voltage does. With $r_o$ finite and the collector at incremental ground, $r_o$ is one more path from the emitter to ground: $R = r_o\parallel\dfrac{R_B + r_\pi}{\beta + 1}$.

        With both $R_C$ and $r_o$ the exact result is
        $$R = \frac{(R_B + r_\pi)(R_C + r_o)}{R_B + R_C + r_\pi + (\beta + 1)r_o}\approx\frac{R_B + r_\pi}{\beta + 1}\Big(1 + \frac{R_C}{r_o}\Big)$$
        the twin of the MOSFET's $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$ ([Chapter 3](#/l/bk03-source)). The emitter stays small while $R_C\ll r_o$.

        The extreme case teaches the most: an **ideal current source on the collector** ($R_C\to\infty$). Then the collector current cannot change, so any change of emitter current must be base current, and $R\to R_B + r_\pi$. The emitter is no longer small at all. (A MOSFET source in the same spot would be infinite: no gate current to fall back on.)
      `),
      RF(md`
        ### What it means, and how to recognize it

        The emitter is small because the junction is a diode carrying the full emitter current, and the base side is divided by $\beta + 1$ for the same reason the emitter side was multiplied in [the last section](#/l/bk08-base): the emitter current is $(\beta + 1)$ times the base current.

        **Recognize it:** the signal or the arrow lands on the lead with the arrowhead, and the base is held, by a triangle, a supply, a bypass capacitor, or through a resistor to one of those. Say: "emitter: everything on the base side, plus $r_\pi$, divided by $\beta + 1$". Emitters are tens to hundreds of ohms. For a PNP the emitter is on top; looking down into it gives the same formula.

        [[fig:p]]
      `, { p: { fig: F.lookE({ pnp: true, RB: true }), cap: 'A PNP emitter, looked into from above, base held through $R_B$: still $(R_B + r_\\pi)/(\\beta + 1)$.' } }),
      R(md`
        ### Worked example

        $I_C = 2\,\text{mA}$, $\beta = 100$, base held through $R_B = 5\kO$, $r_o\to\infty$. Find the resistance looking into the emitter, and say which part dominates.

        1. $g_m = 2\,\text{mA}/25\,\text{mV} = 80\,\text{mS}$, $r_\pi = 100/80\,\text{mS} = 1.25\kO$.
        2. $R = \dfrac{R_B + r_\pi}{\beta + 1} = \dfrac{5 + 1.25}{101}\kO = 61.9\,\Omega$.
        3. Split it: $r_e = 1250/101 = 12.4\,\Omega$ and $R_B/(\beta + 1) = 49.5\,\Omega$. The base resistor contributes four times more than the junction.

        !!mistake Common mistakes
          - **Writing $1/g_m$ when there is a base resistor.** $R_B/(\beta + 1)$ is often larger than $1/g_m$ itself.
          - **Multiplying $R_B$ by $\beta + 1$.** That is the base-side rule used backwards: from the emitter you divide.
          - **$R_B + r_\pi$ without dividing.** That is the resistance of the base loop, not what the emitter sees.
          - **Still writing $1/g_m$ with a current source on the collector and $r_o$ included.** Then the emitter is about $R_B + r_\pi$.
      `),
      Q(md`The reference transistor ($I_C = 1\,\text{mA}$, $\beta = 100$) has its base held through $R_B = 10\kO$. About what do you see looking into the emitter?`,
        [md`About $124\,\Omega$`, md`About $25\,\Omega$`, md`About $12.5\kO$`, md`About $1\,\text{M}\Omega$`], 0,
        [null, md`That is $1/g_m$ alone. $R_B$ adds $R_B/(\beta + 1)\approx99\,\Omega$.`, md`That is $R_B + r_\pi$, the base loop. From the emitter it is divided by $\beta + 1$.`, md`That multiplies by $\beta + 1$: the rule for looking into the base, used the wrong way round.`],
        md`$R = \dfrac{R_B + r_\pi}{\beta + 1} = \dfrac{12.5\kO}{101} = 124\,\Omega$, i.e. $r_e + R_B/(\beta + 1) = 24.8 + 99\,\Omega$.`,
        { fig: F.lookE({ RB: true }) }),
      Q(md`With the base grounded, you double the transistor's bias current. The resistance looking into the emitter...`,
        [md`halves`, md`doubles`, md`stays the same`, md`drops by $\sqrt2$`], 0,
        [null, md`More current means a steeper diode curve, so a smaller incremental resistance.`, md`$r_\pi/(\beta + 1) = V_T/I_E$ does depend on the current.`, md`$\sqrt{\ }$ is the MOSFET's square law at fixed $W/L$. A BJT's $g_m = I_C/V_T$ is proportional to the current.`],
        md`$R = r_e = V_T/I_E$: twice the current, half the resistance. $25\,\Omega$ at $1\,\text{mA}$, $12.5\,\Omega$ at $2\,\text{mA}$.`),
      Q(md`An **ideal current source** feeds the collector, the base sits on $R_B$ to ground, and we keep $r_o$. About what do you see looking into the emitter?`,
        [md`About $R_B + r_\pi$`, md`About $(R_B + r_\pi)/(\beta + 1)$`, md`$\infty$`, md`About $1/g_m$`], 0,
        [null, md`That assumes the collector current can change. A current source on the collector pins it.`, md`That is a MOSFET source with a current-source drain: there the gate has no current to fall back on. A base does.`, md`$1/g_m$ needs the collector current to follow the emitter. Here it cannot.`],
        md`$R = \dfrac{(R_B + r_\pi)(R_C + r_o)}{R_B + R_C + r_\pi + (\beta + 1)r_o}\to R_B + r_\pi$ as $R_C\to\infty$. With the collector current frozen, every change of emitter current is base current, which sees $r_\pi + R_B$.`),
      P({
        id: 'bk08-emit-1', title: 'Emitter numbers',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 100$, $r_o\to\infty$. Find the resistance looking into the emitter with the base grounded ($R_1$), then with $R_B = 5\kO$ from the base to ground ($R_2$).`,
        fig: F.lookE({ RB: true }),
        parts: [{ lbl: 'R_1', unit: 'Ω', ans: 12.376, accept: [12.5] }, { lbl: 'R_2', unit: 'Ω', ans: 61.881, accept: [62.5], traps: [{ v: 6250, msg: 'That is $R_B + r_\\pi$. Looking from the emitter, divide by $\\beta + 1$.' }, { v: 505000, msg: 'You multiplied by $\\beta + 1$: that is the rule for looking into the base.' }] }],
        hints: [md`$g_m = 80\,\text{mS}$, $r_\pi = 1.25\kO$.`, md`$R = (R_B + r_\pi)/(\beta + 1)$.`],
        sol: md`
1. $g_m = 80\,\text{mS}$, $r_\pi = 100/80\,\text{mS} = 1.25\kO$.
2. $R_1 = \dfrac{r_\pi}{\beta + 1} = \dfrac{1250}{101} = 12.38\,\Omega\approx\dfrac{1}{g_m} = 12.5\,\Omega$.
3. $R_2 = \dfrac{5000 + 1250}{101} = 61.9\,\Omega\approx12.5 + 50 = 62.5\,\Omega$.`,
      }),
      P({
        id: 'bk08-emit-2', title: 'The formula, typed',
        q: md`Type the resistance looking into the emitter when the base is held through $R_B$ ($r_o\to\infty$). Use \`RB\`, \`rpi\`, \`beta\` (\`gm\` also works: \`1/gm + RB/beta\` is accepted).`,
        fig: F.lookE({ RB: true }),
        parts: [ex('(RB + rpi)/(beta + 1)', ['RB', 'rpi', 'beta', 'gm'], 'R')],
        hints: [md`The base path carries $i_x = v_t/(R_B + r_\pi)$, the controlled source adds $\beta i_x$.`],
        sol: md`$i_t = (\beta + 1)\dfrac{v_t}{R_B + r_\pi}$, so $R = \dfrac{R_B + r_\pi}{\beta + 1}\approx\dfrac{1}{g_m} + \dfrac{R_B}{\beta}$.`,
      }),
      P({
        id: 'bk08-emit-3', title: 'A PNP emitter, looked into from above',
        q: md`A PNP runs at $I_C = 0.4\,\text{mA}$ with $\beta = 80$. Its base sits on a $20\kO$ resistor to ground, its collector on ground. Find $r_\pi$ and the resistance looking down into its emitter ($r_o\to\infty$).`,
        fig: F.lookE({ pnp: true, RB: '20\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 5 }, { lbl: 'R', unit: 'Ω', ans: 308.64, accept: [312.5], traps: [{ v: 62.5, msg: 'That is $1/g_m$ alone; the $20\\kO$ base resistor adds $R_B/(\\beta + 1)\\approx247\\,\\Omega$.' }] }],
        hints: [md`$g_m = 16\,\text{mS}$. The PNP's small-signal model is the NPN's.`],
        sol: md`
1. $g_m = 0.4\,\text{mA}/25\,\text{mV} = 16\,\text{mS}$, $r_\pi = 80/16\,\text{mS} = 5\kO$.
2. $R = \dfrac{R_B + r_\pi}{\beta + 1} = \dfrac{25\kO}{81} = 308.6\,\Omega$ ($\approx1/g_m + R_B/\beta = 62.5 + 250 = 312.5\,\Omega$).

Upside down or not, the emitter divides the base side by $\beta + 1$.`,
      }),
      P({
        id: 'bk08-emit-4', title: 'What a collector load does to the emitter',
        q: md`Base grounded, $I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 25\,\text{V}$ (so $r_o = 25\kO$, and we keep it). Find the resistance looking into the emitter (a) with $R_C = 25\kO$ on the collector, (b) with an ideal current source on the collector instead.`,
        parts: [{ lbl: 'R_a', unit: 'Ω', ans: 48.972, accept: [49.5, 50], traps: [{ v: 24.75, msg: 'That ignores $R_C$. With $r_o$ finite, a collector load raises the emitter resistance by about $1 + R_C/r_o$.' }] },
          { lbl: 'R_b', unit: 'kΩ', ans: 2.5, traps: [{ v: 0.02475, msg: 'With the collector current pinned by the current source, the emitter current can only change through the base.' }] }],
        hints: [md`Use $R = \dfrac{(R_B + r_\pi)(R_C + r_o)}{R_B + R_C + r_\pi + (\beta + 1)r_o}$ with $R_B = 0$.`, md`For (b) let $R_C\to\infty$.`],
        sol: md`
$r_\pi = 2.5\kO$, $r_o = 25\kO$, $R_B = 0$.

**(a)** $R = \dfrac{r_\pi(R_C + r_o)}{R_C + r_\pi + (\beta + 1)r_o} = \dfrac{2.5\kO\times50\kO}{25 + 2.5 + 2525\,\text{k}\Omega} = \dfrac{125\,\text{M}\Omega^2}{2552.5\kO} = 48.97\,\Omega$. The estimate $r_e(1 + R_C/r_o) = 24.75\times2 = 49.5\,\Omega$ is within 1%.

**(b)** $R_C\to\infty$: $R\to r_\pi = 2.5\kO$. The collector current cannot change, so the emitter current changes only as base current, through $r_\pi$.`,
      }),
      P({
        id: 'bk08-emit-5', title: 'Looking back into a follower',
        q: md`The base of an NPN is driven from a source with resistance $R_S = 10\kO$ (the source itself is incremental ground). The emitter also has $R_E = 2\kO$ to ground. $I_C = 1\,\text{mA}$, $\beta = 100$, $r_o\to\infty$. What resistance does a load connected to the emitter see?`,
        fig: [['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1]], ['R', [-1.3, 1], [0, 1], { n: 'R_S' }], ['acg', [-1.3, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E', side: 'l' }], ['gnd', [1, 3.2]], ['w', [1, 2], [2, 2]], F.term([2, 2], '\\leftarrow R', 'r')],
        parts: [{ lbl: 'R', unit: 'Ω', ans: 116.55, accept: [117.65], traps: [{ v: 123.76, msg: 'That is only the emitter looking up. $R_E$ hangs on the same node, in parallel.' }, { v: 2000, msg: 'That is $R_E$ alone. The emitter looking up is in parallel with it, and it is much smaller.' }] }],
        hints: [md`Two paths from the node to ground: up into the emitter, and down through $R_E$.`],
        sol: md`
1. Up into the emitter: $\dfrac{R_S + r_\pi}{\beta + 1} = \dfrac{10 + 2.5}{101}\kO = 123.8\,\Omega$.
2. Down: $R_E = 2\kO$.
3. In parallel: $R = 123.8\parallel2000 = 116.6\,\Omega$.

This is the output resistance of an emitter follower ([Chapter 9](#/l/bk09-cc)): a $10\kO$ source shrinks to $99\,\Omega$ on the way down through the junction.`,
      }),
      R(md`
        ### Drill

        Random bias points, NPN and PNP, base held directly or through $R_B$, sometimes with $r_o$ and a collector load. Find $r_\pi$, then divide the base side by $\beta + 1$.
      `),
      G('bk8_emit', { need: 4 }),
    ],
  });

  // ================================================================== 8.3 the (beta + 1) rule
  L({
    id: 'bk08-elevator', title: 'The $(\\beta + 1)$ rule, both ways', ref: 'Lecture 24',
    steps: [
      R(md`
        ### The question

        Two results, one fact. From the base, emitter-side resistance is multiplied by $\beta + 1$; from the emitter, base-side resistance is divided by $\beta + 1$. This section derives both from one general picture, so that you can apply them to anything hanging on a terminal (another transistor, a current source, a whole chain) without a new derivation. Then we use it twice in a row: the Darlington pair and the emitter-coupled pair.
      `),
      RF(md`
        ### The physical picture

        Across the base–emitter junction two things are true at once.
        - **Voltage:** the emitter follows the base. $v_b$ and $v_e$ differ only by $v_\pi$, which is small whenever the emitter circuit is a sizable resistance.
        - **Current:** the emitter always carries $(\beta + 1)$ times the base current.

        A resistance is voltage over current. Measured at the base, you see the emitter circuit's voltage but supply only $1/(\beta + 1)$ of its current: the emitter circuit looks $(\beta + 1)$ times **bigger**. Measured at the emitter, you see the base circuit's voltage but carry $(\beta + 1)$ times its current: it looks $(\beta + 1)$ times **smaller**.

        So the junction is an impedance converter with a current ratio of $\beta + 1$ (The Art of Electronics' name for the follower). Picture an elevator between two floors: riding up from the emitter floor to the base floor multiplies every resistance by $\beta + 1$; riding down divides it.

        [[fig:e]]
      `, { e: { fig: elevFig, cap: 'Two floors: whatever sits on the emitter floor looks $(\\beta + 1)$ times bigger from the base, and vice versa.' } }),
      RF(md`
        ### The derivation, once, for anything

        Let $Z_E$ be whatever connects the emitter to incremental ground, and $Z_B$ whatever connects the base to incremental ground: any linear resistance at all. Keep $r_o\to\infty$.

        **Up (look into the base, $Z_E$ under the emitter).** Exactly as in [the base](#/l/bk08-base) with $R_E\to Z_E$: the test current $i_t$ flows down $r_\pi$, the controlled source adds $\beta i_t$, and $Z_E$ carries $(\beta + 1)i_t$. KVL: $v_t = i_tr_\pi + (\beta + 1)i_tZ_E$.

        **Down (look into the emitter, $Z_B$ on the base).** Exactly as in [the emitter](#/l/bk08-emitter) with $R_B\to Z_B$: the base path carries $i_x = v_t/(Z_B + r_\pi)$ and the controlled source adds $\beta i_x$, so $i_t = (\beta + 1)i_x$.

        [[fig:m]]

        !!key The $(\beta + 1)$ rule
          $$R_{\uparrow\,\text{base}} = r_\pi + (\beta + 1)Z_E = (\beta + 1)(r_e + Z_E)$$
          $$R_{\downarrow\,\text{emitter}} = \frac{Z_B + r_\pi}{\beta + 1} = r_e + \frac{Z_B}{\beta + 1}$$
          The junction itself is $r_\pi$ seen from the base and $r_e$ seen from the emitter, and $r_\pi = (\beta + 1)r_e$. Up: multiply everything below and add the junction. Down: divide everything above and add the junction.
      `, { m: { fig: ss({ b: 'RB', e: 'RE', c: 'gnd', lab: { RB: 'Z_B', RE: 'Z_E' } }), cap: 'One model for both directions: the test source goes on B (with $Z_B$ removed) or on E (with $Z_E$ removed).' } }),
      R(md`
        ### Check it

        - **The junction alone** ($Z_B = Z_E = 0$): up gives $r_\pi$, down gives $r_\pi/(\beta + 1) = r_e$. They differ by exactly $\beta + 1$, as they must. ✓
        - **$\beta\to\infty$:** up gives $\infty$ (a gate), down gives $1/g_m$ (a source). ✓
        - **The collector is not on the elevator.** Nothing on the collector side appears in either formula (with $r_o\to\infty$). The collector is a current source; [its own section](#/l/bk08-collector) is next but one.
      `),
      RF(md`
        ### Using it twice: the Darlington

        Two NPNs with $Q_1$'s emitter driving $Q_2$'s base, both collectors on $V_{CC}$, and $R_E$ under $Q_2$. Look into $Q_1$'s base.

        [[fig:d]]

        Ride the elevator from the bottom up, one floor at a time.
        1. **Into $Q_2$'s base:** $R_2 = r_{\pi2} + (\beta_2 + 1)R_E$.
        2. **$R_2$ is what hangs under $Q_1$'s emitter**, so into $Q_1$'s base: $R_{in} = r_{\pi1} + (\beta_1 + 1)R_2 = r_{\pi1} + (\beta_1 + 1)r_{\pi2} + (\beta_1 + 1)(\beta_2 + 1)R_E$.

        **$r_{\pi1}$ is not $r_{\pi2}$.** $Q_1$'s emitter current is $Q_2$'s base current, so $Q_1$ runs at about $1/\beta_2$ of $Q_2$'s current. Exactly: $I_{C1} = \alpha_1I_{B2}$, so $r_{\pi1} = \beta_1V_T/I_{C1} = (\beta_1 + 1)r_{\pi2}$, and
        $$R_{in} = (\beta_1 + 1)\big[2r_{\pi2} + (\beta_2 + 1)R_E\big]\approx\beta_1\beta_2R_E$$
        With $I_{C2} = 1\,\text{mA}$, $\beta_1 = \beta_2 = 100$, $R_E = 1\kO$: $r_{\pi2} = 2.5\kO$, $r_{\pi1} = 252.5\kO$, and $R_{in} = 101\times(5 + 101)\kO = 10.7\,\text{M}\Omega$. Two floors, $R_E$ multiplied ten thousand times. (The pair's current gain is $\beta(\beta + 2)\approx\beta^2$: last semester's Problem 1(b), [here](#/l/e3-sp26-bjt).)

        **Riding down instead:** look up into $Q_2$'s emitter with $Q_1$'s base held through $R_B$. Divide twice: $R = \dfrac{1}{\beta_2 + 1}\Big[r_{\pi2} + \dfrac{R_B + r_{\pi1}}{\beta_1 + 1}\Big]$.
      `, { d: { fig: darl(), cap: 'A Darlington pair: $Q_1$\'s emitter is $Q_2$\'s base.' } }),
      RF(md`
        ### Down, then up: the emitter-coupled pair

        Two NPNs share their emitters, fed by an ideal current source (open for signals). $Q_2$'s base is held; look into $Q_1$'s base.

        [[fig:p]]

        1. **Down into $Q_2$'s emitter** (base held): $Z = r_{\pi2}/(\beta_2 + 1) = r_{e2}$.
        2. **That is $Q_1$'s emitter load**, so up into $Q_1$'s base: $R_{in} = (\beta_1 + 1)(r_{e1} + r_{e2}) = r_{\pi1} + r_{\pi2}$.

        For a matched pair, $R_{in} = 2r_\pi$. This is the input resistance of a BJT differential pair (the MOSFET pair of [Chapter 5](#/l/bk05-diffpair) had $\infty$). With $I_{EE} = 1\,\text{mA}$ split equally, each transistor runs at $0.5\,\text{mA}$, $r_\pi = 5\kO$ for $\beta = 100$, and $R_{in} = 10\kO$.
      `, { p: { fig: pairFig, cap: 'Look into $Q_1$\'s base: $Q_1$\'s emitter sees $Q_2$\'s emitter.' } }),
      R(md`
        ### How to recognize it

        Find the junction you are crossing and the direction. **Toward a base:** add $r_\pi$, multiply what is below by $\beta + 1$. **Toward an emitter:** add $r_\pi$ to what is above, divide by $\beta + 1$. Chains are just repeated rides, from the far end toward you. The collector is not part of the elevator.

        | You stand at | You look toward | It looks |
        |---|---|---|
        | the base | the emitter circuit | $\times(\beta + 1)$, plus $r_\pi$ |
        | the emitter | the base circuit | $\div(\beta + 1)$, plus $r_e$ |
        | the base of a Darlington | $R_E$ two floors down | $\times(\beta + 1)^2$ |
        | the emitter of a Darlington | $R_B$ two floors up | $\div(\beta + 1)^2$ |

        !!mistake Common mistakes
          - **Adding the multipliers.** Two floors give $(\beta + 1)^2$, not $2(\beta + 1)$.
          - **One $r_\pi$ for both Darlington transistors.** $Q_1$ runs at $1/\beta$ of $Q_2$'s current, so $r_{\pi1}\approx\beta r_{\pi2}$.
          - **Riding the elevator across the collector.** The rule is for the base–emitter junction only.
      `),
      Q(md`A Darlington pair, $\beta = 100$ each, $R_E = 1\kO$ under the second emitter. About what do you see looking into the first base?`,
        [md`About $10\,\text{M}\Omega$`, md`About $100\kO$`, md`About $200\kO$`, md`About $1\kO$`], 0,
        [null, md`That is one floor. $Q_1$ multiplies again everything under its emitter, including $(\beta + 1)R_E$.`, md`The multipliers compound, they do not add: $(\beta + 1)^2$, not $2(\beta + 1)$.`, md`That is $R_E$ seen from its own node.`],
        md`Two floors up: $R_E\times(\beta + 1)^2\approx10^4\times1\kO = 10\,\text{M}\Omega$, plus the $r_\pi$ terms ($10.7\,\text{M}\Omega$ at $I_{C2} = 1\,\text{mA}$).`,
        { fig: darl() }),
      Q(md`Two matched NPNs share their emitters (ideal tail current source). $Q_2$'s base is held. Looking into $Q_1$'s base you see...`,
        [md`$2r_\pi$`, md`$r_\pi$`, md`$r_\pi + (\beta + 1)r_\pi$`, md`$\infty$`], 0,
        [null, md`That treats $Q_1$'s emitter as grounded. It sees $Q_2$'s emitter, $r_{e2}$, which comes back up multiplied by $\beta + 1$.`, md`From $Q_1$'s emitter, $Q_2$ looks like its **emitter**, $r_\pi/(\beta + 1)$, not like its base.`, md`The tail current source is open, but $Q_2$'s emitter is a path to ground.`],
        md`Down into $Q_2$'s emitter: $r_e = r_\pi/(\beta + 1)$. Up into $Q_1$'s base: $r_\pi + (\beta + 1)r_e = 2r_\pi$.`,
        { fig: pairFig }),
      P({
        id: 'bk08-elev-1', title: 'The emitter-coupled pair in numbers',
        q: md`In the emitter-coupled pair above, $I_{EE} = 1\,\text{mA}$ splits equally and $\beta = 100$. Find each $r_\pi$, the resistance $Q_1$'s emitter sees looking into $Q_2$'s emitter, and $R_{in}$ at $Q_1$'s base.`,
        fig: pairFig,
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 5 }, { lbl: 'r_{e2}', unit: 'Ω', ans: 49.505, accept: [50] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 10, traps: [{ v: 5, msg: 'That is $Q_1$ alone with its emitter grounded. Its emitter sees $r_{e2}$, which comes back up multiplied by $\\beta + 1$.' }] }],
        hints: [md`Each transistor: $I_C\approx0.5\,\text{mA}$, $g_m = 20\,\text{mS}$.`, md`Down: $r_\pi/(\beta + 1)$. Up: $r_\pi + (\beta + 1)\times$ that.`],
        sol: md`
1. Each transistor runs at $0.5\,\text{mA}$ (exactly $\alpha\times0.5\,\text{mA}$; the difference is 1%): $g_m = 20\,\text{mS}$, $r_\pi = 5\kO$.
2. Down into $Q_2$'s emitter: $r_{e2} = \dfrac{r_\pi}{\beta + 1} = \dfrac{5000}{101} = 49.5\,\Omega$.
3. Up into $Q_1$'s base: $R_{in} = r_\pi + (\beta + 1)r_{e2} = 5\kO + 5\kO = 10\kO = 2r_\pi$.`,
      }),
      P({
        id: 'bk08-elev-2', title: 'A Darlington in numbers',
        q: md`Darlington: $Q_2$ runs at $I_{C2} = 2\,\text{mA}$, $\beta_1 = \beta_2 = 100$, $R_E = 500\,\Omega$ under $Q_2$, $r_o\to\infty$. Find $r_{\pi2}$, $r_{\pi1}$ and $R_{in}$ at $Q_1$'s base.`,
        fig: darl(),
        parts: [{ lbl: 'r_{\\pi2}', unit: 'kΩ', ans: 1.25 }, { lbl: 'r_{\\pi1}', unit: 'kΩ', ans: 126.25, accept: [125] },
          { lbl: 'R_{in}', unit: 'MΩ', ans: 5.353, accept: [5.25], traps: [{ v: 0.05175, msg: 'That is one floor: the input of $Q_2$ alone. $Q_1$ multiplies it by $\\beta + 1$ again (and adds $r_{\\pi1}$).' }] }],
        hints: [md`$I_{E1} = I_{B2} = I_{C2}/\beta_2$, so $I_{C1} = \alpha_1I_{C2}/\beta_2$.`, md`$r_{\pi1} = (\beta_1 + 1)r_{\pi2}$.`],
        sol: md`
1. $g_{m2} = 80\,\text{mS}$, $r_{\pi2} = 100/80\,\text{mS} = 1.25\kO$.
2. $Q_1$ supplies $Q_2$'s base current: $I_{E1} = 2\,\text{mA}/100 = 20\,\mu\text{A}$, $I_{C1} = 19.8\,\mu\text{A}$, so $r_{\pi1} = \beta_1V_T/I_{C1} = 126.25\kO = 101\times1.25\kO$.
3. Into $Q_2$'s base: $R_2 = 1.25\kO + 101\times0.5\kO = 51.75\kO$.
4. Into $Q_1$'s base: $R_{in} = 126.25\kO + 101\times51.75\kO = 5353\kO = 5.35\,\text{M}\Omega$.

The quick estimate $\beta^2R_E = 5\,\text{M}\Omega$ is 7% low, because the two $r_\pi$ terms add $2(\beta + 1)r_{\pi2}$.`,
      }),
      P({
        id: 'bk08-elev-3', title: 'Darlington input, typed',
        q: md`Type the resistance looking into $Q_1$'s base of a Darlington with $R_E$ under $Q_2$ ($r_o\to\infty$). Use \`rpi1\`, \`rpi2\`, \`beta1\`, \`beta2\`, \`RE\`.`,
        fig: darl(),
        parts: [Object.assign(ex('rpi1 + (beta1 + 1)*(rpi2 + (beta2 + 1)*RE)', ['rpi1', 'rpi2', 'beta1', 'beta2', 'RE'], 'R_{in}'), { vars: { rpi1: [1e5, 5e5], rpi2: [1e3, 5e3], beta1: [50, 200], beta2: [50, 200], RE: [100, 2000] } })],
        hints: [md`Start at the bottom: into $Q_2$'s base. That is what hangs under $Q_1$'s emitter.`],
        sol: md`$$R_{in} = r_{\pi1} + (\beta_1 + 1)\big[r_{\pi2} + (\beta_2 + 1)R_E\big]$$
Two floors: $R_E$ is multiplied by $(\beta_1 + 1)(\beta_2 + 1)$, $r_{\pi2}$ once, $r_{\pi1}$ not at all.`,
      }),
      P({
        id: 'bk08-elev-4', title: 'Riding down a Darlington',
        q: md`Same Darlington ($I_{C2} = 1\,\text{mA}$, $\beta = 100$ each, so $r_{\pi2} = 2.5\kO$ and $r_{\pi1} = 252.5\kO$). $Q_1$'s base is held through $R_B = 100\kO$. Find the resistance looking up into $Q_2$'s emitter.`,
        fig: darl({ out: true }),
        parts: [{ lbl: 'R', unit: 'Ω', ans: 59.31, traps: [{ v: 3490, msg: 'That is one floor down: the resistance at $Q_1$\'s emitter. Add $r_{\\pi2}$ and divide by $\\beta_2 + 1$ once more.' }, { v: 24.75, msg: 'That is $Q_2$\'s $r_e$ alone, as if its base were grounded. Its base sees $Q_1$\'s emitter.' }] }],
        hints: [md`First, $Q_1$'s emitter: $(R_B + r_{\pi1})/(\beta_1 + 1)$. That sits on $Q_2$'s base.`],
        sol: md`
1. One floor down, at $Q_1$'s emitter: $\dfrac{R_B + r_{\pi1}}{\beta_1 + 1} = \dfrac{352.5\kO}{101} = 3.490\kO$.
2. That is $Q_2$'s base resistance. Second floor down: $R = \dfrac{r_{\pi2} + 3.490\kO}{\beta_2 + 1} = \dfrac{5.990\kO}{101} = 59.3\,\Omega$.

A $100\kO$ resistor ends up worth $100\kO/101^2\approx10\,\Omega$ at the bottom.`,
      }),
      P({
        id: 'bk08-elev-5', title: 'A follower feeding a degenerated stage',
        q: md`$Q_1$ (an emitter follower, $I_{C1} = 0.5\,\text{mA}$, its own bias current source on its emitter) drives the base of $Q_2$ ($I_{C2} = 1\,\text{mA}$, $R_{E2} = 200\,\Omega$ to ground). $\beta = 100$ for both, $r_o\to\infty$. Find the resistance looking into $Q_2$'s base and into $Q_1$'s base.`,
        fig: [['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1], { n: 'Q_1' }], ['w', [1, 2], [1, 3], [2, 3]], ['I', [1, 3], [1, 4.4], { n: 'I_1' }], ['gnd', [1, 4.4]],
          ['npn', [3, 3], { n: 'Q_2' }], ['R', [3, 4], [3, 5.2], { n: 'R_{E2}' }], ['gnd', [3, 5.2]], ['R', [3, 0.6], [3, 2], { n: 'R_C' }], ['rail', [3, 0.6], { n: 'V_{CC}' }], ['w', [3, 2], [3.8, 2]], ['term', [3.8, 2], { n: 'v_{out}', side: 'r' }], ['w', [0, 1], [-0.7, 1]], F.inL([-0.7, 1])],
        parts: [{ lbl: 'R_{in2}', unit: 'kΩ', ans: 22.7 }, { lbl: 'R_{in1}', unit: 'MΩ', ans: 2.2977, traps: [{ v: 0.0277, msg: 'That adds $R_{in2}$ once. It hangs under $Q_1$\'s emitter, so it is multiplied by $\\beta + 1$.' }] }],
        hints: [md`$I_1$ is open for signals: under $Q_1$'s emitter there is only $Q_2$'s base.`],
        sol: md`
1. $r_{\pi2} = 100/(40\,\text{mS}) = 2.5\kO$, $r_{\pi1} = 100/(20\,\text{mS}) = 5\kO$.
2. Into $Q_2$'s base: $R_{in2} = r_{\pi2} + (\beta + 1)R_{E2} = 2.5 + 101\times0.2 = 22.7\kO$.
3. The current source $I_1$ is open, so $Q_1$'s emitter sees only $R_{in2}$: $R_{in1} = r_{\pi1} + (\beta + 1)R_{in2} = 5\kO + 101\times22.7\kO = 2.298\,\text{M}\Omega$.`,
      }),
      R(md`
        ### Drill

        Two transistors stacked or coupled: Darlington inputs and outputs, emitter-coupled pairs. Ride from the far end toward the terminal you look into.
      `),
      G('bk8_elev', { need: 4 }),
    ],
  });
})();

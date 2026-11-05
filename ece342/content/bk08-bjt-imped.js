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
    ['txt', [-0.65, 0.12], '$\\text{base floor}$'], ['txt', [1.25, 2.3], '$\\text{emitter floor}$', { a: 'l' }],
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
        parts: [Object.assign(ex('RB + rpi + (beta + 1)*RE', ['RB', 'rpi', 'beta', 'RE'], 'R_{in}'), { vars: { RB: [2e4, 1e5], rpi: [1e3, 1e4], beta: [50, 200], RE: [100, 500] } })],
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
        fig: F.lookE({ pnp: true, RB: 'R_B = 20\\,\\text{k}\\Omega' }),
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
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 5.05, accept: [5] }, { lbl: 'r_{e2}', unit: 'Ω', ans: 50, accept: [49.505] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 10.1, accept: [10], traps: [{ v: 5.05, msg: 'That is $Q_1$ alone with its emitter grounded. Its emitter sees $r_{e2}$, which comes back up multiplied by $\\beta + 1$.' }] }],
        hints: [md`Each transistor: $I_C\approx0.5\,\text{mA}$, $g_m = 20\,\text{mS}$.`, md`Down: $r_\pi/(\beta + 1)$. Up: $r_\pi + (\beta + 1)\times$ that.`],
        sol: md`
1. Each emitter carries $I_E = 0.5\,\text{mA}$, so $I_C = \alpha I_E = 0.495\,\text{mA}$, $g_m = 19.8\,\text{mS}$ and $r_\pi = \beta/g_m = 5.05\kO$ (rounding $I_C$ to $0.5\,\text{mA}$ gives $5\kO$: fine).
2. Down into $Q_2$'s emitter: $r_{e2} = \dfrac{r_\pi}{\beta + 1} = \dfrac{5050}{101} = 50\,\Omega$, which is just $V_T/I_E$.
3. Up into $Q_1$'s base: $R_{in} = r_\pi + (\beta + 1)r_{e2} = 5.05\kO + 5.05\kO = 10.1\kO = 2r_\pi$.`,
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
        parts: [Object.assign(ex('rpi1 + (beta1 + 1)*(rpi2 + (beta2 + 1)*RE)', ['rpi1', 'rpi2', 'beta1', 'beta2', 'RE'], 'R_{in}'), { vars: { rpi1: [1e5, 5e5], rpi2: [1e3, 5e3], beta1: [80, 200], beta2: [80, 200], RE: [100, 2000] } })],
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
  // ================================================================== 8.4 the collector
  const collCur = ss({ b: 'gnd', e: 'RE', c: 'test', ro: true });
  const ceilFig = ss({ b: 'gnd', e: 'open', c: 'test', ro: true });
  L({
    id: 'bk08-collector', title: 'Looking into the collector', ref: 'Lecture 24 and the MOSFET drain',
    steps: [
      R(md`
        ### The question

        The collector is the BJT's high-resistance terminal. It is the output of the common-emitter, common-base and cascode stages, so its resistance is $R_{out}$ in every one of those gains, and it is what a BJT current source (a load, a tail, a mirror output) presents to the circuit.

        Lecture 24 sets $r_o\to\infty$ and writes $R = \infty$ for every collector. That is the right first answer. With $r_o$ finite we get the BJT twin of the [degenerated MOSFET drain](#/l/bk03-degen), $r_{ds} + R_S + g_mr_{ds}R_S$, with one twist that has no MOSFET counterpart: a ceiling.
      `),
      R(md`
        ### The physical picture

        With the base and the emitter held, the collector current is set by $v_{be}$ alone: the collector is a **current source**. Its voltage matters only through the Early effect, which makes the current creep up with $V_{CE}$; that slope is $1/r_o$ ([Chapter 6](#/l/bk06-early)). So looking in you see $r_o = V_A/I_C$: $100\kO$ for the reference transistor.

        Now put $R_E$ under the emitter. Push the collector up: a little more current flows (through $r_o$), the emitter rises, $v_{be}$ shrinks, and the transistor pulls back. That is **negative feedback holding the current still**, and a current that holds still means a larger resistance. The same story as MOSFET degeneration.

        The twist: when the emitter rises, part of the extra current escapes through $r_\pi$ into the held base instead of flowing through $R_E$. The base current is a **leak in the feedback loop**, and it caps how much the feedback can do. However large $R_E$ is, the best you can get is about $(\beta + 1)r_o$.
      `),
      RF(md`
        ### Derivation 1: the emitter on its rail

        [[fig:c]]

        Base and emitter at incremental ground: $v_\pi = 0$, so the controlled source carries nothing. The only element joining the collector to anything is $r_o$, from the collector to the grounded emitter.
        $$R = r_o = \frac{V_A}{I_C}$$
        A BJT with a held base and emitter is a current source, imperfect by $r_o$. **MOSFET twin:** the drain, $r_{ds}$.
      `, { c: { fig: F.lookC({}), cap: 'Looking into the collector, base and emitter held.' } }),
      RF(md`
        ### Derivation 2: $R_E$ under the emitter

        [[fig:c]]

        Test source $v_t$ on the collector, supplying $i_t$; base at incremental ground; $R_E$ from the emitter to ground; and now we must keep $r_o$ (without it the answer is just $\infty$).

        [[fig:m]]

        1. **Where does $i_t$ go?** The collector node touches only the controlled source and $r_o$, and both end on the emitter. So all of $i_t$ arrives at the emitter node.
        2. **The emitter voltage.** From the emitter, $i_t$ can leave through $R_E$ to ground or through $r_\pi$ to the grounded base: two resistors in parallel. So $v_e = i_t(R_E\parallel r_\pi)$.
        3. **The control voltage.** $v_\pi = v_b - v_e = -i_t(R_E\parallel r_\pi)$: the emitter rose, so the junction was squeezed.
        4. **KCL at the collector.** $i_t$ splits into the controlled source, $g_mv_\pi$, and $r_o$: $i_t = g_mv_\pi + i_{ro}$. So $r_o$ carries $i_{ro} = i_t - g_mv_\pi = i_t\big[1 + g_m(R_E\parallel r_\pi)\big]$. Because $v_\pi < 0$, the source pulls **against** the test current, and $r_o$ must carry more than $i_t$.
        5. **KVL from the collector to ground:** $v_t = i_{ro}r_o + v_e = i_tr_o\big[1 + g_m(R_E\parallel r_\pi)\big] + i_t(R_E\parallel r_\pi)$.

        !!key Looking into the collector
          $$R = r_o\big[1 + g_m(R_E\parallel r_\pi)\big] + R_E\parallel r_\pi$$
          With the emitter grounded, $R = r_o$. With $r_o\to\infty$ (Lecture 24), $R = \infty$. MOSFET twin: $r_{ds}(1 + g_mR_S) + R_S$, with $R_S$ replaced by $R_E\parallel r_\pi$ because the base current leaks part of the emitter's signal away.
      `, { c: { fig: F.lookC({ RE: true }), cap: 'Looking into the collector with $R_E$ under the emitter.' }, m: { fig: collCur, cap: 'The model. $i_t$ reaches the emitter and splits between $R_E$ and $r_\\pi$.' } }),
      RF(md`
        ### Check it, and find the ceiling

        - **$R_E\to0$:** $R\to r_o$, Derivation 1. ✓
        - **$r_\pi\to\infty$** (a base that draws nothing, like a gate): $R\to r_o(1 + g_mR_E) + R_E$, the MOSFET's degenerated drain. ✓
        - **One number:** reference transistor with $R_E = 1\kO$: $R_E\parallel r_\pi = 714\,\Omega$, $g_m(R_E\parallel r_\pi) = 28.6$, so $R = 100\kO\times29.6 + 0.7\kO = 2.96\,\text{M}\Omega$. The MOSFET formula would claim $4.1\,\text{M}\Omega$, 39% too high.
        - **$R_E\to\infty$:** $R_E\parallel r_\pi\to r_\pi$ and
        $$R\to r_o(1 + g_mr_\pi) + r_\pi = (\beta + 1)r_o + r_\pi\approx\beta r_o$$

        **Why the ceiling exists.** With $R_E$ gone, the emitter's only exit is $r_\pi$ to the base, so all of $i_t$ leaves as base current. That makes $v_\pi = -i_tr_\pi$, the controlled source pulls $\beta i_t$ against the test current, and $r_o$ carries $(\beta + 1)i_t$. The feedback signal *is* the base current, and the transistor can answer it with at most $\beta$ times as much. A MOSFET has no gate current to lose, so its drain can be boosted without limit; **a BJT collector tops out near $\beta r_o$**: $10\,\text{M}\Omega$ for the reference transistor.

        [[fig:m]]
      `, { m: { fig: ceilFig, cap: 'The ceiling: with $R_E\\to\\infty$ the emitter connects only through $r_\\pi$, so every bit of $i_t$ becomes base current.' } }),
      RF(md`
        ### What a base resistor does

        If the base is held through $R_B$ instead of directly, the leak path is $r_\pi + R_B$, and only the fraction $r_\pi/(r_\pi + R_B)$ of the emitter's rise reaches $v_\pi$. The same five steps give
        $$R = r_o\Big[1 + g_m\frac{r_\pi}{r_\pi + R_B}\big(R_E\parallel(r_\pi + R_B)\big)\Big] + R_E\parallel(r_\pi + R_B)$$
        With $R_B = 0$ it is the key result. The lesson: **a soft base wastes degeneration.** Keep the base of a current-source transistor stiff (a bypass capacitor or a low-resistance bias) if you want its collector to be high.

        [[fig:c]]

        A **PNP** gives the identical formula; the picture is upside down, with $R_E$ up to $V_{CC}$ and the collector at the bottom.

        [[fig:p]]
      `, { c: { fig: F.lookC({ RE: true, RB: true }), cap: 'Base held through $R_B$.' }, p: { fig: F.lookC({ pnp: true, RE: true }), cap: 'A PNP current source: $R_E$ to $V_{CC}$, base held, looking up into the collector.' } }),
      R(md`
        ### What it means, and how to recognize it

        A collector is a current source, as good as $r_o$ on its own, made better by emitter degeneration, but never better than about $\beta r_o$. Sizes: $r_o$ is tens to hundreds of $\text{k}\Omega$; degenerated, a few $\text{M}\Omega$; the ceiling, $10\,\text{M}\Omega$-ish.

        **Recognize it:** the arrow lands on the lead with no arrowhead that is not on the side, and the base is held. Say: "collector: $r_o$, times $1 + g_m(R_E\parallel r_\pi)$ if something sits under the emitter". If the base is the input instead, you are not looking at a current source: [Chapter 9](#/l/bk09-ce) handles that.

        ### Worked example

        A PNP current-source load: $I_C = 0.5\,\text{mA}$, $\beta = 50$, $V_A = 40\,\text{V}$, $R_E = 2\kO$ from $V_{CC}$ to the emitter, base held. Find the resistance looking up into its collector.

        1. $g_m = 20\,\text{mS}$, $r_\pi = 50/20\,\text{mS} = 2.5\kO$, $r_o = 40\,\text{V}/0.5\,\text{mA} = 80\kO$.
        2. $R_E\parallel r_\pi = \dfrac{2\times2.5}{4.5}\kO = 1.111\kO$, so $g_m(R_E\parallel r_\pi) = 22.2$.
        3. $R = 80\kO\times23.2 + 1.1\kO = 1.86\,\text{M}\Omega$. The ceiling here is $(\beta + 1)r_o + r_\pi = 4.08\,\text{M}\Omega$.

        !!mistake Common mistakes
          - **$R_E$ instead of $R_E\parallel r_\pi$** (the MOSFET formula). It overestimates badly whenever $R_E$ is comparable to $r_\pi$.
          - **Expecting unlimited boost.** No amount of $R_E$ takes a BJT collector past about $\beta r_o$.
          - **Writing $\infty$ when the problem gives $V_A$.** Lecture 24's $\infty$ means "$r_o$ ignored"; once $r_o$ is given, use it.
          - **Forgetting the base resistor.** A base held through $R_B$ degrades the boost.
      `),
      Q(md`The reference transistor ($g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$), now with $r_o = 50\kO$ and $R_E = 500\,\Omega$; base held. About what do you see looking into the collector?`,
        [md`About $884\kO$`, md`About $1.05\,\text{M}\Omega$`, md`About $50\kO$`, md`About $5\,\text{M}\Omega$`], 0,
        [null, md`That is the MOSFET formula, $r_o(1 + g_mR_E) + R_E$. Use $R_E\parallel r_\pi = 417\,\Omega$: the base leaks part of the feedback.`, md`That is $r_o$ alone; $R_E$ degenerates it.`, md`That is the ceiling $(\beta + 1)r_o$, reached only when $R_E\gg r_\pi$.`],
        md`$R_E\parallel r_\pi = 500\parallel2500 = 417\,\Omega$, $g_m(R_E\parallel r_\pi) = 16.7$, so $R = 50\kO\times17.7 + 0.42\kO = 884\kO$.`,
        { fig: F.lookC({ RE: true }) }),
      Q(md`You keep increasing $R_E$ under a BJT whose base is held. The resistance looking into the collector...`,
        [md`levels off near $(\beta + 1)r_o$`, md`grows without limit, like $g_mr_oR_E$`, md`falls, because $R_E$ steals current`, md`stays $r_o$, because the base is held`], 0,
        [null, md`That is the MOSFET. Once $R_E\gg r_\pi$ the feedback signal is the base current itself, and the transistor answers it with at most $\beta$ times as much.`, md`$R_E$ is in series with the collector path; it can only add resistance.`, md`A held base does not hold the emitter: $v_\pi = -v_e$ still changes and the controlled source responds.`],
        md`$R = r_o[1 + g_m(R_E\parallel r_\pi)] + R_E\parallel r_\pi$, and $R_E\parallel r_\pi$ can never exceed $r_\pi$. So $R\le r_o(1 + \beta) + r_\pi$.`),
      P({
        id: 'bk08-coll-1', title: 'A bare collector',
        q: md`A BJT runs at $I_C = 0.5\,\text{mA}$ with $V_A = 60\,\text{V}$; its base and emitter are held. Find the resistance looking into its collector.`,
        fig: F.lookC({}),
        parts: [{ lbl: 'R', unit: 'kΩ', ans: 120, traps: [{ v: 0.05, msg: 'That is $1/g_m$, the emitter. The collector is the high-resistance terminal.' }] }],
        hints: [md`With $v_\pi = 0$ only $r_o$ is left.`],
        sol: md`$v_\pi = 0$, so the controlled source is dead and $R = r_o = V_A/I_C = 60\,\text{V}/0.5\,\text{mA} = 120\kO$.`,
      }),
      P({
        id: 'bk08-coll-2', title: 'Degeneration and its ceiling',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$, base held. Find the resistance looking into the collector with $R_E = 500\,\Omega$, and the ceiling as $R_E\to\infty$.`,
        fig: F.lookC({ RE: true }),
        parts: [{ lbl: 'R', unit: 'kΩ', ans: 883.75, traps: [{ v: 1050.5, msg: 'That is the MOSFET formula. The base is held, so $r_\\pi$ sits in parallel with $R_E$ at the emitter: use $R_E\\parallel r_\\pi$.' }, { v: 50, msg: 'That is $r_o$ alone; $R_E$ degenerates it.' }] },
          { lbl: 'R_{max}', unit: 'MΩ', ans: 5.0525, accept: [5] }],
        hints: [md`$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\kO$.`, md`As $R_E\to\infty$, $R_E\parallel r_\pi\to r_\pi$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\,\text{V}/1\,\text{mA} = 50\kO$.
2. $R_E\parallel r_\pi = \dfrac{0.5\times2.5}{3}\kO = 416.7\,\Omega$, $g_m(R_E\parallel r_\pi) = 16.67$.
3. $R = 50\kO\times17.67 + 0.42\kO = 883.8\kO$.
4. Ceiling: $r_o(1 + g_mr_\pi) + r_\pi = 50\kO\times101 + 2.5\kO = 5.05\,\text{M}\Omega\approx\beta r_o$.`,
      }),
      P({
        id: 'bk08-coll-3', title: 'The formula, typed',
        q: md`Type the resistance looking into the collector, base at incremental ground, $R_E$ under the emitter, $r_o$ kept. Use \`ro\`, \`gm\`, \`rpi\`, \`RE\`, \`beta\` (\`||\` is parallel).`,
        fig: F.lookC({ RE: true }),
        parts: [ex('ro*(1 + gm*(RE || rpi)) + (RE || rpi)', ['ro', 'gm', 'rpi', 'RE', 'beta'], 'R')],
        hints: [md`The emitter rises by $i_t(R_E\parallel r_\pi)$; $r_o$ carries $i_t[1 + g_m(R_E\parallel r_\pi)]$.`],
        sol: md`$R = r_o\big[1 + g_m(R_E\parallel r_\pi)\big] + R_E\parallel r_\pi$. The last term is under 1% of the total and may be dropped; replacing $R_E\parallel r_\pi$ by $R_E$ may not.`,
      }),
      P({
        id: 'bk08-coll-4', title: 'A PNP current-source load',
        q: md`A PNP with $R_E = 2\kO$ from $V_{CC}$ to its emitter and its base held runs at $I_C = 0.5\,\text{mA}$, $\beta = 50$, $V_A = 40\,\text{V}$. Find $r_o$ and the resistance looking up into its collector.`,
        fig: F.lookC({ pnp: true, RE: 'R_E = 2\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'r_o', unit: 'kΩ', ans: 80 }, { lbl: 'R', unit: 'MΩ', ans: 1.85889, traps: [{ v: 3.282, msg: 'That uses $R_E$ instead of $R_E\\parallel r_\\pi$.' }] }],
        hints: [md`$r_\pi = 2.5\kO$; $R_E\parallel r_\pi = 1.11\kO$.`],
        sol: md`
1. $g_m = 20\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 80\kO$.
2. $R_E\parallel r_\pi = 1.111\kO$, $g_m(R_E\parallel r_\pi) = 22.22$.
3. $R = 80\kO\times23.22 + 1.11\kO = 1.859\,\text{M}\Omega$. (The PNP is upside down; its formula is not.)`,
      }),
      P({
        id: 'bk08-coll-5', title: 'What a soft base costs',
        q: md`Reference transistor ($I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$) with $R_E = 2.5\kO$. Find the resistance looking into the collector (a) with the base held directly, (b) with the base held through $R_B = 10\kO$.`,
        fig: F.lookC({ RE: true, RB: true }),
        parts: [{ lbl: 'R_a', unit: 'MΩ', ans: 5.10125 }, { lbl: 'R_b', unit: 'MΩ', ans: 1.76875, traps: [{ v: 5.10125, msg: 'That is with the base held directly. Through $R_B$, only $r_\\pi/(r_\\pi + R_B)$ of the emitter\'s rise reaches $v_\\pi$.' }] }],
        hints: [md`(a) $R_E\parallel r_\pi = 1.25\kO$.`, md`(b) Replace $r_\pi$ by $r_\pi + R_B$ in the parallel combination, and multiply the $g_m$ term by $r_\pi/(r_\pi + R_B)$.`],
        sol: md`
$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 100\kO$.

**(a)** $R_E\parallel r_\pi = 1.25\kO$, $g_m\times1.25\kO = 50$: $R_a = 100\kO\times51 + 1.25\kO = 5.10\,\text{M}\Omega$.

**(b)** $R_E\parallel(r_\pi + R_B) = 2.5\parallel12.5 = 2.083\kO$; the fraction reaching $v_\pi$ is $r_\pi/(r_\pi + R_B) = 0.2$, so the boost is $g_m\times2.083\kO\times0.2 = 16.67$:
$$R_b = 100\kO\times17.67 + 2.08\kO = 1.77\,\text{M}\Omega$$
A $10\kO$ base resistor threw away two thirds of the output resistance.`,
      }),
      R(md`
        ### Drill

        NPN and PNP collectors, with and without $R_E$, sometimes with a soft base or the $R_E\to\infty$ ceiling. Find $r_o$, $r_\pi$ and $R_E\parallel r_\pi$ first.
      `),
      G('bk8_coll', { need: 4 }),
    ],
  });

  // ================================================================== 8.5 the diode-connected BJT
  const mirrorFig = [
    ['rail', [1, -1.2], { n: 'V_{CC}' }], ['I', [1, -1.2], [1, 0], { n: 'I_{REF}' }], ['npn', [1, 1], { n: 'Q_1', flip: true, dc: true }], ['gnd', [1, 2]],
    ['w', [2, 1], [3, 1]], ['npn', [4, 1], { n: 'Q_2' }], ['gnd', [4, 2]], ['w', [4, 0], [4, -0.5]], F.dnA([4, -0.5], 'R_{out}'), ['node', [2, 1], { n: 'X', side: 'b' }],
  ];
  L({
    id: 'bk08-diode', title: 'The diode-connected BJT', ref: 'Lecture 24',
    steps: [
      R(md`
        ### The question

        Tie a BJT's base to its collector and look in. Lecture 24's summary page lists the answer, $r_\pi/(1 + \beta)$, and a variant with a resistor $R_B$ from the collector to the base. This connection is the reference side of every current mirror, a common load, and a way to make a small, well-defined resistance out of a bias current.
      `),
      R(md`
        ### The physical picture

        With the base tied to the collector, the transistor adjusts its own $V_{BE}$ until it carries whatever current is pushed into it. So from outside it is simply a **diode**: the base–emitter junction, with the collector current riding along. The whole current $I = I_C + I_B$ enters at the top and leaves by the emitter.

        A diode carrying $I$ has incremental resistance $V_T/I$ ([Chapter 1](#/l/bk01-diode)). So a diode-connected BJT at $1\,\text{mA}$ looks like $25\,\Omega$, the same as looking into an emitter: small.
      `),
      RF(md`
        ### Derivation

        [[fig:c]]

        Test source on the collector, which is also the base; emitter grounded. Keep $r_o$.

        [[fig:m]]

        1. **The control voltage.** The base is the collector, the emitter is grounded: $v_\pi = v_t$.
        2. **Three currents leave the top node:** $v_t/r_\pi$ through $r_\pi$, $g_mv_\pi = g_mv_t$ through the controlled source, and $v_t/r_o$ through $r_o$.
        3. **KCL:** $i_t = v_t\Big(\dfrac{1}{r_\pi} + g_m + \dfrac{1}{r_o}\Big)$.

        $$R = r_\pi\parallel\frac{1}{g_m}\parallel r_o\approx\frac{1}{g_m}$$

        !!key The diode-connected BJT
          $$R = \frac{1}{g_m + 1/r_\pi + 1/r_o}\approx\frac{1}{g_m}$$
          With $r_o\to\infty$ (Lecture 24): $R = \dfrac{r_\pi}{1 + \beta} = r_e = \dfrac{V_T}{I_E}$, exactly a diode carrying the total current.
      `, { c: { fig: F.diode({}), cap: 'Base tied to collector.' }, m: { fig: ss({ b: 'C', e: 'gnd', c: 'test', ro: true }), cap: 'The model: the controlled source is driven by the test voltage itself, so it behaves as a resistor $1/g_m$.' } }),
      R(md`
        ### Check it, and what it means

        - **Units:** a sum of conductances, inverted. ✓
        - **$\beta\to\infty$, $r_o\to\infty$:** $R = 1/g_m$, the MOSFET diode ([Chapter 3](#/l/bk03-diode)). ✓
        - **One number:** $I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$: $g_m = 20\,\text{mS}$, $1/r_\pi = 0.2\,\text{mS}$, $1/r_o = 0.01\,\text{mS}$, so $R = 1/(20.21\,\text{mS}) = 49.5\,\Omega$.

        **A controlled source driven by its own terminal voltage is a resistor.** The source $g_mv_\pi$ sits across the same two nodes that set $v_\pi$, so it draws $g_m$ amps per volt: a conductance $g_m$. That is the whole trick of the diode connection, for BJTs and MOSFETs alike ([Chapter 1](#/l/bk01-test)).
      `),
      RF(md`
        ### A resistor from collector to base

        Lecture 24's summary also lists a diode with $R_B$ between the collector and the base. Now the base current has to flow through $R_B$ before it reaches the junction.

        [[fig:c]]

        [[fig:m]]

        1. **Base current.** From the top node, $R_B$ and $r_\pi$ are in series to the grounded emitter: $i_b = v_t/(R_B + r_\pi)$, and $v_\pi = i_br_\pi$.
        2. **Collector current.** $g_mv_\pi = g_mr_\pi i_b = \beta i_b$, also drawn from the top node.
        3. **KCL:** $i_t = i_b + \beta i_b = (\beta + 1)\dfrac{v_t}{R_B + r_\pi}$ (plus $v_t/r_o$ if $r_o$ is kept).

        $$R = \frac{R_B + r_\pi}{\beta + 1}\quad\Big(\parallel r_o\Big)$$

        The emitter result read from the other end: a base-side resistance divided by $\beta + 1$. With $R_B = 0$ it is the plain diode.
      `, { c: { fig: F.diode({ RB: true }), cap: '$R_B$ from the collector to the base.' }, m: { fig: ss({ b: 'RBC', e: 'gnd', c: 'test' }), cap: 'The model: the base current flows through $R_B$ and $r_\\pi$; the collector draws $\\beta$ times more.' } }),
      RF(md`
        ### Where it shows up: the current mirror

        $Q_1$ is diode-connected and fed by $I_{REF}$; $Q_2$ shares its base–emitter voltage. Matched transistors with the same $V_{BE}$ carry the same collector current $I_C$. The reference current also has to supply both base currents: $I_{REF} = I_C + 2I_C/\beta$, so
        $$I_{C2} = I_{REF}\frac{\beta}{\beta + 2}$$

        Small signal, node $X$ sees $Q_1$ as a diode, about $1/g_m$, with $Q_2$'s $r_\pi$ in parallel: still about $1/g_m$. And looking into $Q_2$'s collector (base held by the low-resistance node $X$, emitter grounded) you see $r_{o2}$: the mirror output is a current source with $R_{out} = r_{o2}$.

        [[fig:mir]]

        A PNP diode works the same way from $V_{CC}$ down; PNP mirrors are the usual active loads of Chapter 9.

        [[fig:p]]

        !!mistake Common mistakes
          - **$r_\pi$ for a diode.** With the base tied to the collector, the collector current responds too: $\beta + 1$ times the base current, so about $1/g_m$, not $r_\pi$.
          - **$r_o$ for a diode.** $r_o$ is the collector with its base **held**; a diode's base moves with the collector.
          - **$R_B + r_\pi$ for the collector-to-base resistor version.** Divide by $\beta + 1$.
      `, { mir: { fig: mirrorFig, cap: 'A BJT current mirror: $Q_1$ diode-connected, $Q_2$ copies its current.' }, p: { fig: F.diode({ pnp: true }), cap: 'A diode-connected PNP hanging from $V_{CC}$: looking up, about $1/g_m$.' } }),
      Q(md`A diode-connected NPN carries $1\,\text{mA}$, $\beta = 100$. About what do you see looking in?`,
        [md`About $25\,\Omega$`, md`About $2.5\kO$`, md`About $100\kO$`, md`$\infty$`], 0,
        [null, md`That is $r_\pi$ alone. With the base tied to the collector the collector current responds too, $\beta$ times more.`, md`That is $r_o$: a collector with its base **held**. Here the base moves with the collector.`, md`Nothing in a forward-active BJT looks infinite once you include $r_\pi$ and the controlled source.`],
        md`$R\approx r_\pi/(\beta + 1)\approx1/g_m = 25\,\Omega$.`, { fig: F.diode({}) }),
      Q(md`Lecture 24's summary lists a diode-connected BJT with $R_B$ from collector to base: $R = \dfrac{R_B + r_\pi}{\beta + 1}$. Which other result has the same form, and why?`,
        [md`Looking into an emitter with $R_B$ in the base: in both, the base path carries $1/(\beta + 1)$ of the total current`, md`Looking into a base with $R_E$: in both, a resistor is multiplied by $\beta + 1$`, md`Looking into a collector: in both, $r_o$ is boosted`, md`None: it is a coincidence`], 0,
        [null, md`From the base, emitter-side resistors are **multiplied**. Here $R_B$ is divided.`, md`$r_o$ does not even appear in the formula.`, md`It is the same physics: the base path carries $i_b$ while the terminal carries $(\beta + 1)i_b$.`],
        md`In both cases the voltage drives $R_B + r_\pi$ to set the base current, and the transistor adds $\beta$ times that. Total current $(\beta + 1)i_b$ for a voltage $i_b(R_B + r_\pi)$.`),
      P({
        id: 'bk08-diode-1', title: 'Diode numbers',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$. Find the resistance looking into a diode-connected BJT, exactly ($R_1$, with $r_o$), and with $R_B = 20\kO$ from the collector to the base instead of the wire ($R_2$, with $r_o$).`,
        parts: [{ lbl: 'R_1', unit: 'Ω', ans: 49.480, accept: [50] }, { lbl: 'R_2', unit: 'Ω', ans: 246.91, accept: [247.52, 250], traps: [{ v: 25000, msg: 'Divide by $\\beta + 1$: the collector draws $\\beta$ times the base current.' }] }],
        hints: [md`$g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $r_o = 100\kO$.`],
        sol: md`
1. $g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $r_o = 100\kO$.
2. $R_1 = \dfrac{1}{20\,\text{mS} + 0.2\,\text{mS} + 0.01\,\text{mS}} = 49.5\,\Omega\approx1/g_m = 50\,\Omega$.
3. $R_2 = r_o\parallel\dfrac{R_B + r_\pi}{\beta + 1} = 100\kO\parallel\dfrac{25\kO}{101} = 100\kO\parallel247.5\,\Omega = 246.9\,\Omega$.`,
      }),
      P({
        id: 'bk08-diode-2', title: 'The collector-to-base resistor, typed',
        q: md`Type the resistance of the diode with $R_B$ from collector to base ($r_o\to\infty$). Use \`RB\`, \`rpi\`, \`beta\`.`,
        fig: F.diode({ RB: true }),
        parts: [ex('(RB + rpi)/(beta + 1)', ['RB', 'rpi', 'beta'], 'R')],
        sol: md`$i_t = i_b + \beta i_b$ with $i_b = v_t/(R_B + r_\pi)$: $\;R = \dfrac{R_B + r_\pi}{\beta + 1}$.`,
      }),
      P({
        id: 'bk08-diode-3', title: 'A diode with an emitter resistor',
        q: md`A diode-connected NPN carries $I_C = 1\,\text{mA}$ ($\beta = 100$, $r_o\to\infty$) and has $R_E = 200\,\Omega$ from its emitter to ground. Find the resistance looking in at the top.`,
        fig: F.diode({ RE: true }),
        parts: [{ lbl: 'R', unit: 'Ω', ans: 224.75, accept: [225], traps: [{ v: 24.75, msg: 'That ignores $R_E$, which carries the whole current.' }, { v: 20224.75, msg: 'From the top of a diode, $R_E$ is not multiplied: the test current itself flows through it.' }] }],
        hints: [md`The whole test current flows out through $R_E$. What does the diode itself add?`],
        sol: md`
The test current $i_t = (\beta + 1)i_b$ flows down through the junction and then through $R_E$. KVL from the top: $v_t = i_br_\pi + i_tR_E = i_t\Big[\dfrac{r_\pi}{\beta + 1} + R_E\Big]$.
$$R = r_e + R_E = 24.75 + 200 = 224.75\,\Omega$$
Series resistors add when they carry the same current: here the terminal current and $R_E$'s current are the same, so no $(\beta + 1)$ factor appears.`,
      }),
      P({
        id: 'bk08-diode-4', title: 'A mirror: DC copy and small-signal resistances',
        q: md`In the mirror above, $I_{REF} = 1\,\text{mA}$, the transistors are matched with $\beta = 100$ and $V_A = 50\,\text{V}$. Find $I_{C2}$, the small-signal resistance of node $X$ (the current source $I_{REF}$ is open for signals), and $R_{out}$ at $Q_2$'s collector.`,
        fig: mirrorFig,
        parts: [{ lbl: 'I_{C2}', unit: 'mA', ans: 0.980392 },
          { lbl: 'R_X', unit: 'Ω', ans: 24.988, accept: [25.5] }, { lbl: 'R_{out}', unit: 'kΩ', ans: 51, accept: [50] }],
        hints: [md`KCL at the top of $Q_1$: $I_{REF} = I_{C1} + I_{B1} + I_{B2}$.`, md`Node $X$: $Q_1$ is a diode ($1/g_m\parallel r_\pi\parallel r_o$) and $Q_2$'s base adds another $r_\pi$.`],
        sol: md`
**DC.** Same $V_{BE}$, same transistors: $I_{C1} = I_{C2} = I_C$. KCL: $I_{REF} = I_C + 2I_C/\beta$, so $I_C = \dfrac{1\,\text{mA}}{1.02} = 0.980\,\text{mA}$.

**Small signal.** $g_m = 0.980\,\text{mA}/25\,\text{mV} = 39.2\,\text{mS}$, $r_\pi = \beta/g_m = 2.55\kO$, $r_o = V_A/I_C = 51\kO$.

**Node $X$:** $R_X = \dfrac{1}{g_m + 2/r_\pi + 1/r_o} = \dfrac{1}{39.2 + 0.78 + 0.02\,\text{mS}} = 25.0\,\Omega$.

**$R_{out}$:** $Q_2$'s base sits on a $25\,\Omega$ node (held), its emitter on ground: $R_{out} = r_{o2} = 51\kO$.`,
      }),
      R(md`
        ### Drill

        Diodes, NPN and PNP, plain, with a collector-to-base resistor, or with an emitter resistor.
      `),
      G('bk8_diode', { need: 3 }),
    ],
  });

  // ================================================================== 8.6 the BJT cascode
  const cascFig = (o = {}) => [
    ['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['acg', [0, 3]],
    ...(o.RE ? [['R', [1, 4], [1, 5.2], { n: 'R_E' }], ['gnd', [1, 5.2]]] : [['gnd', [1, 4]]]),
    ['node', [1, 2], { n: 'X', side: 'r' }], ['w', [1, 0], [1, -0.5]], F.dnA([1, -0.5], 'R_{out}'),
  ];
  const pnpCasc = [['rail', [1, -0.2], { n: 'V_{CC}' }], ['pnp', [1, 0.8], { n: 'Q_3' }], ['acg', [0, 0.8]], ['pnp', [1, 2.8], { n: 'Q_4' }], ['acg', [0, 2.8]], ['w', [1, 3.8], [1, 4.3]], F.upA([1, 4.3], 'R_{out}')];
  const bicFig = [['nmos', [1, 1], { n: 'M_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['acg', [0, 3]], ['gnd', [1, 4]], ['w', [1, 0], [1, -0.5]], F.dnA([1, -0.5], 'R_{out}')];
  L({
    id: 'bk08-cascode', title: 'The BJT cascode', ref: 'Lectures 24 and 29 with Chapter 3',
    steps: [
      R(md`
        ### The question

        How high can the output resistance of a BJT current source go? Stack a second transistor $Q_2$ (base held) on top of the current source $Q_1$ (base held) and look into $Q_2$'s collector. This is the output of the cascode amplifier of [Chapter 9](#/l/bk09-cascode) and of every cascode load; the MOSFET version gave $g_mr_{ds}^2$ ([Chapter 3](#/l/bk03-cascode)).
      `),
      R(md`
        ### The physical picture

        $Q_2$'s base is held, so its emitter, node $X$, can barely move: $Q_2$ **shields** $Q_1$ from the output voltage. $Q_1$'s Early effect is gone, and $Q_1$ looks to $Q_2$ like a huge emitter resistor, $r_{o1}$.

        So $Q_2$ is a collector with heavy degeneration, and the [collector result](#/l/bk08-collector) applies with $R_E = r_{o1}$. But $r_{o1}$ is far larger than $r_{\pi2}$: we are deep in the ceiling. A MOSFET cascode keeps gaining ($g_mr_{ds}$ times); a BJT cascode stops at about $\beta r_o$.
      `),
      RF(md`
        ### Derivation

        [[fig:c]]

        1. **$Q_1$ alone.** Base held, emitter grounded: $v_{\pi1} = 0$, its controlled source is dead, and it is just $r_{o1}$ from $X$ to ground (Derivation 1 of [the collector](#/l/bk08-collector)).
        2. **$Q_2$ with $R_E = r_{o1}$.** Its base is held, so the collector result applies directly:

        [[fig:m]]

        $$R_{out} = r_{o2}\big[1 + g_{m2}(r_{o1}\parallel r_{\pi2})\big] + r_{o1}\parallel r_{\pi2}$$

        3. **Simplify.** $r_{o1}$ ($100\kO$) is much larger than $r_{\pi2}$ ($2.5\kO$), so $r_{o1}\parallel r_{\pi2}\approx r_{\pi2}$ and $g_{m2}r_{\pi2} = \beta$:
        $$R_{out}\approx r_{o2}(1 + \beta)\approx\beta r_{o2}$$

        !!key The BJT cascode
          $$R_{out} = r_{o2}\big[1 + g_{m2}(r_{o1}\parallel r_{\pi2})\big] + r_{o1}\parallel r_{\pi2}\approx\beta r_{o2}$$
          Reference transistors: $r_{o1}\parallel r_{\pi2} = 2.44\kO$, so $R_{out} = 100\kO\times98.6 + 2.4\kO = 9.86\,\text{M}\Omega$, right at the ceiling $\beta r_o = 10\,\text{M}\Omega$.
      `, { c: { fig: cascFig(), cap: 'A BJT cascode current source: both bases held.' }, m: { fig: ss({ b: 'gnd', e: 'RE', c: 'test', ro: true, s: '2', lab: { RE: 'r_{o1}' } }), cap: '$Q_2$\'s model with $Q_1$ replaced by $r_{o1}$.' } }),
      R(md`
        ### Check it

        - **$r_{\pi2}\to\infty$** (a MOSFET on top): $R_{out}\to r_{o2}(1 + g_{m2}r_{o1}) + r_{o1}$, Chapter 3's cascode. ✓
        - **The ceiling:** however large $r_{o1}$ gets, $r_{o1}\parallel r_{\pi2} < r_{\pi2}$, so $R_{out} < (\beta + 1)r_{o2} + r_{\pi2}$. ✓
        - **Numbers:** $9.86\,\text{M}\Omega$ versus $100\kO$ for one transistor: the cascode buys a factor of about $\beta$.

        ### Mixing devices: put the MOSFET on top

        The ceiling comes from $Q_2$'s base current. Replace $Q_2$ by an NMOS (BiCMOS): the gate draws nothing, the degeneration works fully, and
        $$R_{out} = r_{ds2} + r_{o1} + g_{m2}r_{ds2}r_{o1}$$
        With $r_{o1} = 100\kO$ and an NMOS with $g_m = 10\,\text{mS}$, $r_{ds} = 20\kO$: $20.1\,\text{M}\Omega$, twice the all-BJT cascode. Put the NPN on top of the NMOS instead and the ceiling returns: $r_{o2}[1 + g_{m2}(r_{ds1}\parallel r_{\pi2})] + r_{ds1}\parallel r_{\pi2} = 8.99\,\text{M}\Omega$. **In a BiCMOS cascode, the MOSFET goes on top.**
      `, bicFig),
      RF(md`
        ### Stacking a third BJT buys nothing

        A third NPN on top sees the cascode, $\approx10\,\text{M}\Omega$, as its emitter resistor. Again $10\,\text{M}\Omega\parallel r_{\pi3}\approx r_{\pi3}$, so it lands on its own ceiling: $R\approx(\beta + 1)r_{o3} = 10.1\,\text{M}\Omega$, about 2% more than two transistors. The base current leaks no matter how good the current source below is.

        PNP cascodes, the usual high-resistance loads, are the same circuit upside down: two PNPs from $V_{CC}$, both bases held, looking up into the lower collector.

        [[fig:p]]

        !!mistake Common mistakes
          - **$g_mr_o^2$ for a BJT cascode.** That is the MOSFET result; the BJT stops near $\beta r_o$.
          - **$r_{o1}$ instead of $r_{o1}\parallel r_{\pi2}$.** $Q_2$'s grounded base sits behind $r_{\pi2}$, in parallel with $r_{o1}$ at node $X$.
          - **Expecting a triple BJT cascode to help.** Each BJT is capped by its own base current.
      `, { p: { fig: pnpCasc, cap: 'A PNP cascode load: emitter of $Q_3$ on $V_{CC}$, both bases held. $R_{out}\\approx\\beta r_o$ again.' } }),
      Q(md`Reference transistors ($\beta = 100$, $r_o = 100\kO$) in a cascode. About what is $R_{out}$?`,
        [md`About $10\,\text{M}\Omega$`, md`About $400\,\text{M}\Omega$`, md`About $200\kO$`, md`About $2.5\kO$`], 0,
        [null, md`That is $g_mr_o\times r_o$, the MOSFET-style result. $Q_2$'s base current caps it at about $\beta r_o$.`, md`That is $r_{o1} + r_{o2}$: it ignores $Q_2$'s feedback.`, md`That is $r_\pi$.`],
        md`$R_{out}\approx(\beta + 1)r_{o2} = 10.1\,\text{M}\Omega$; exactly, $9.86\,\text{M}\Omega$.`, { fig: cascFig() }),
      Q(md`In a BiCMOS cascode current source, which device should sit on top for the highest output resistance?`,
        [md`The MOSFET: its gate draws no current, so the boost is not capped`, md`The BJT: its $g_m$ is larger`, md`It makes no difference`, md`The BJT: its $r_o$ is larger`], 0,
        [null, md`A larger $g_m$ does not help once the top device hits its $\beta r_o$ ceiling.`, md`MOS on top: $g_{m2}r_{ds2}r_{o1}$, uncapped. BJT on top: about $\beta r_{o2}$.`, md`$r_o$ matters, but the ceiling matters more.`],
        md`MOS on top gives $r_{ds2} + r_{o1} + g_{m2}r_{ds2}r_{o1}$; BJT on top stops at about $\beta r_{o2}$.`),
      P({
        id: 'bk08-casc-1', title: 'A cascode in numbers',
        q: md`Two matched NPNs in a cascode current source, $I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$. Find $r_o$, $r_\pi$, the exact $R_{out}$, and the ceiling estimate $\beta r_{o2}$.`,
        fig: cascFig(),
        parts: [{ lbl: 'r_o', unit: 'kΩ', ans: 100 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 5 }, { lbl: 'R_{out}', unit: 'MΩ', ans: 9.62857, traps: [{ v: 200.1, msg: 'That is the MOSFET-style $g_mr_o^2$. The base current of $Q_2$ caps the BJT cascode near $\\beta r_o$.' }] }, { lbl: '\\beta r_{o2}', unit: 'MΩ', ans: 10 }],
        hints: [md`$r_{o1}\parallel r_{\pi2} = 100\parallel5\kO$.`],
        sol: md`
1. $g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $r_o = 50\,\text{V}/0.5\,\text{mA} = 100\kO$.
2. $r_{o1}\parallel r_{\pi2} = 4.762\kO$, $g_{m2}\times4.762\kO = 95.24$.
3. $R_{out} = 100\kO\times96.24 + 4.76\kO = 9.63\,\text{M}\Omega$.
4. $\beta r_{o2} = 10\,\text{M}\Omega$: the exact answer is 4% below the ceiling, because $r_{o1}$ is only 20 times $r_{\pi2}$.`,
      }),
      P({
        id: 'bk08-casc-2', title: 'The cascode, typed',
        q: md`Type $R_{out}$ of the BJT cascode current source. Use \`ro1\`, \`ro2\`, \`gm2\`, \`rpi2\`, \`beta2\`.`,
        fig: cascFig(),
        parts: [ex('ro2*(1 + gm2*(ro1 || rpi2)) + (ro1 || rpi2)', ['ro1', 'ro2', 'gm2', 'rpi2', 'beta2'], 'R_{out}')],
        hints: [md`It is the collector result with $R_E = r_{o1}$.`],
        sol: md`$R_{out} = r_{o2}\big[1 + g_{m2}(r_{o1}\parallel r_{\pi2})\big] + r_{o1}\parallel r_{\pi2}$. (The estimate $(\beta + 1)r_{o2}$ is not accepted here: it assumes $r_{o1}\gg r_{\pi2}$, which a typed formula cannot assume.)`,
      }),
      P({
        id: 'bk08-casc-3', title: 'BiCMOS: which device on top?',
        q: md`An NPN ($I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$) and an NMOS ($g_m = 10\,\text{mS}$, $r_{ds} = 20\kO$) form a cascode current source. Find $R_{out}$ (a) with the NMOS on top, (b) with the NPN on top.`,
        fig: bicFig,
        parts: [{ lbl: 'R_a', unit: 'MΩ', ans: 20.12 }, { lbl: 'R_b', unit: 'MΩ', ans: 8.99111, traps: [{ v: 20.12, msg: 'With the NPN on top its base current leaks: use $r_{ds1}\\parallel r_{\\pi2}$.' }] }],
        hints: [md`(a) A MOSFET degenerated by $r_{o1}$: $r_{ds} + r_{o1} + g_mr_{ds}r_{o1}$.`, md`(b) The collector formula with $R_E = r_{ds}$: $r_{ds}\parallel r_\pi = 2.22\kO$.`],
        sol: md`
**(a)** $R_a = r_{ds2} + r_{o1} + g_{m2}r_{ds2}r_{o1} = 20\kO + 100\kO + 0.01\times20\kO\times100\kO = 20.12\,\text{M}\Omega$.

**(b)** $r_{ds1}\parallel r_{\pi2} = 20\parallel2.5 = 2.222\kO$, $g_{m2}\times2.222\kO = 88.9$: $R_b = 100\kO\times89.9 + 2.2\kO = 8.99\,\text{M}\Omega$.

The NMOS on top wins by more than a factor of 2: no gate current, no ceiling.`,
      }),
      P({
        id: 'bk08-casc-4', title: 'A third transistor',
        q: md`Three matched NPNs are stacked, all bases held (reference transistors: $I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$). The two-transistor cascode below the top one has $R = 9.859\,\text{M}\Omega$. Find the resistance looking into the top collector.`,
        parts: [{ lbl: 'R', unit: 'MΩ', ans: 10.1001, traps: [{ v: 985.9, msg: 'That multiplies by $g_mr_o$ again, as a MOSFET would. The top BJT is capped by its own $r_\\pi$.' }] }],
        hints: [md`The top transistor's emitter resistance is $9.859\,\text{M}\Omega\parallel r_{\pi3}$.`],
        sol: md`
$R_E = 9.859\,\text{M}\Omega$ sits under $Q_3$. $R_E\parallel r_{\pi3} = 9.859\,\text{M}\Omega\parallel2.5\kO = 2.4994\kO$, so $g_m(R_E\parallel r_\pi) = 99.98$ and
$$R = 100\kO\times100.98 + 2.5\kO = 10.10\,\text{M}\Omega$$
Only 2.4% more than two transistors: the third BJT hits its own $(\beta + 1)r_o$ ceiling.`,
      }),
      R(md`
        ### Drill

        Cascodes of NPNs, PNPs and mixed BiCMOS pairs, some with an emitter resistor under the bottom device.
      `),
      G('bk8_casc', { need: 3 }),
    ],
  });
  // ================================================================== 8.7 nodes
  const ceLoad = (o = {}) => [
    ...(o.RE2 ? [['rail', [1, -3.2], { n: 'V_{CC}' }], ['R', [1, -3.2], [1, -2], { n: 'R_{E2}', s: o.RE2 }]] : [['rail', [1, -2], { n: 'V_{CC}' }]]),
    ['pnp', [1, -1], { n: 'Q_2' }], ['acg', [0, -1]], ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }],
  ];
  const nodeBase = (gate) => [
    ['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C', side: 'l' }], ['node', [1, 0], { n: 'X', side: 'r', dot: true }],
    ['w', [1, 0], [1, 1], [1.6, 1]], ...(gate ? [['nmos', [2.6, 1], { n: 'M_2' }], ['rail', [2.6, 0], { n: 'V_{DD}' }], ['R', [2.6, 2], [2.6, 3.2], { n: 'R_S' }], ['gnd', [2.6, 3.2]]]
      : [['npn', [2.6, 1], { n: 'Q_2' }], ['rail', [2.6, 0], { n: 'V_{CC}' }], ['R', [2.6, 2], [2.6, 3.2], { n: 'R_{E2}' }], ['gnd', [2.6, 3.2]]]),
    ['w', [1, 0], [0.2, 0]], F.term([0.2, 0], 'R_X\\rightarrow', 'l'),
  ];
  const nodeMix = [
    ['rail', [1, -1], { n: 'V_{CC}' }], ['pnp', [1, 0], { n: 'Q_2' }], ['acg', [0, 0]], ['nmos', [1, 2], { n: 'M_1' }], ['acg', [0, 2]], ['gnd', [1, 3]],
    ['w', [1, 1], [2, 1]], ['npn', [3, 1], { n: 'Q_3' }], ['rail', [3, 0], { n: 'V_{CC}' }], ['R', [3, 2], [3, 3.2], { n: 'R_{E3}' }], ['gnd', [3, 3.2]],
    ['node', [1.5, 1], { n: 'X', side: 'a' }], ['w', [1, 1], [0.4, 1]], F.term([0.4, 1], 'R_X\\rightarrow', 'l'),
  ];
  L({
    id: 'bk08-node', title: 'Nodes with BJTs and MOSFETs: $R_{UP}\\parallel R_{DN}$', ref: 'Lecture 24 with Chapter 3',
    steps: [
      R(md`
        ### The question

        Every output resistance on the exam is the resistance of a node to incremental ground, and every gain is $-G_MR_{out}$ ([Chapter 4](#/l/bk04-norton)). Now the blocks touching the node can be BJTs, MOSFETs, or both. You already own every block; this section is about reading which block is which, fast, and remembering the one new rule: **a base loads a node, a gate does not.**
      `),
      R(md`
        ### The physical picture

        Push a test current into the node. Every element touching it offers that current a path to incremental ground, and the paths are in parallel: the current takes the easy ones. So **the smallest resistance wins**, and anything ten times larger barely matters.

        A MOSFET gate offers no path at all (a capacitor plate), so in Exam 2 a gate on a node changed nothing ([Chapter 3](#/l/bk03-node)). A BJT base is a path, $r_\pi + (\beta + 1)R_E$, so a node that drives a base is loaded by it.

        !!method The node method
          1. Turn off the input source (it becomes incremental ground; a current source becomes open).
          2. Split the node: everything between it and the top rail is $R_{UP}$, everything to the bottom rail is $R_{DN}$, and anything hanging off it sideways (a base, a gate, a load) is a third branch.
          3. For each transistor touching the node, name the terminal that touches it and what sits on its other terminals; read its resistance off the ladder below.
          4. $R = R_{UP}\parallel R_{DN}\parallel R_{side}$. Estimate first: the smallest one wins.
      `),
      R(md`
        ### The size ladder

        Reference transistors ($1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$; a MOSFET with $g_m = 10\,\text{mS}$, $r_{ds} = 20\kO$ where it appears):

        | What touches the node | Resistance | Size |
        |---|---|---|
        | an emitter, base held; a diode | $r_e\approx1/g_m$ | $25\,\Omega$ |
        | an emitter, base through $10\kO$ | $\dfrac{R_B + r_\pi}{\beta + 1}$ | $124\,\Omega$ |
        | a MOSFET source or diode | $1/g_m$ | $100\,\Omega$ |
        | a base, emitter grounded | $r_\pi$ | $2.5\kO$ |
        | a MOSFET drain, gate held | $r_{ds}$ | $20\kO$ |
        | a collector, base held | $r_o$ | $100\kO$ |
        | a base, $1\kO$ under the emitter | $r_\pi + (\beta + 1)R_E$ | $103.5\kO$ |
        | a collector, $1\kO$ under the emitter | $r_o[1 + g_m(R_E\parallel r_\pi)] + R_E\parallel r_\pi$ | $2.96\,\text{M}\Omega$ |
        | a cascode collector | $\approx\beta r_o$ | $9.86\,\text{M}\Omega$ |
        | a MOSFET gate | $\infty$ | |
      `),
      RF(md`
        ### Example 1: a common emitter with a current-source load

        $v_{in}$ off: $Q_1$'s base is grounded and its emitter is grounded, so looking down into its collector: $R_{DN} = r_{o1}$. Looking up into $Q_2$'s collector (base held, emitter on $V_{CC}$): $R_{UP} = r_{o2}$.
        $$R_{out} = r_{o1}\parallel r_{o2}$$
        At $1\,\text{mA}$ with $V_{A,n} = 100\,\text{V}$ and $V_{A,p} = 50\,\text{V}$: $100\kO\parallel50\kO = 33.3\kO$. The gain is then $-g_mR_{out} = -40\,\text{mS}\times33.3\kO = -1333$ ([Chapter 9](#/l/bk09-ce)).

        [[fig:a]]
      `, { a: { fig: ceLoad(), cap: 'A common emitter with a PNP current-source load.' } }),
      RF(md`
        ### Example 2: a node that drives a base

        Node $X$ has $R_C = 10\kO$ up to $V_{CC}$, and it drives the base of $Q_2$, which has $R_{E2} = 1\kO$ under its emitter ($1\,\text{mA}$, $\beta = 100$). Looking into that base: $r_{\pi2} + (\beta + 1)R_{E2} = 103.5\kO$, a side branch:
        $$R_X = R_C\parallel\big[r_{\pi2} + (\beta + 1)R_{E2}\big] = 10\kO\parallel103.5\kO = 9.12\kO$$
        Here the base barely loads the node because $R_{E2}$ was multiplied by 101. With $Q_2$'s emitter grounded it would be $10\kO\parallel2.5\kO = 2\kO$: a stage driving a bare base loses most of its output resistance, and with it most of its gain.

        [[fig:b]]

        **The same node driving a MOSFET gate:** the gate offers no path, so $R_X = R_C = 10\kO$, whatever hangs under the source.

        [[fig:g]]
      `, { b: { fig: nodeBase(false), cap: 'Node $X$ drives the base of $Q_2$: a side branch.' }, g: { fig: nodeBase(true), cap: 'Node $X$ drives a gate: no branch at all.' } }),
      RF(md`
        ### Example 3: three devices on one node

        A PNP current source above ($r_{o2} = 80\kO$), an NMOS current source below ($r_{ds1} = 40\kO$), and the base of an emitter follower $Q_3$ ($1\,\text{mA}$, $\beta = 100$, $R_{E3} = 5\kO$, $r_o$ ignored) hanging off $X$.

        [[fig:m]]

        1. $R_{UP} = r_{o2} = 80\kO$ and $R_{DN} = r_{ds1} = 40\kO$: together $26.7\kO$.
        2. The side branch: $r_{\pi3} + (\beta + 1)R_{E3} = 2.5\kO + 505\kO = 507.5\kO$.
        3. $R_X = 80\parallel40\parallel507.5\kO = 25.3\kO$: the base costs 5%. Make $R_{E3}$ smaller and it costs more.

        !!mistake Common mistakes
          - **Ignoring a base on the node** (the gate habit). A base is a path to ground.
          - **Using $r_\pi$ for a base with something under its emitter.** Multiply what is under the emitter by $\beta + 1$.
          - **Forgetting to turn the input off.** With $v_{in} = 0$, the driven base of a common emitter is incremental ground, and its collector looks like $r_o$.
          - **Adding instead of combining in parallel.** Paths from one node to ground are in parallel.
      `, { m: { fig: nodeMix, cap: 'A PNP, an NMOS and a BJT base on one node.' } }),
      Q(md`A node has a PNP collector (base held, $r_o = 50\kO$) above it and, hanging off it, the base of an NPN follower with $R_E = 2\kO$ under its emitter ($\beta = 100$, $r_\pi = 2.5\kO$). Nothing else. About what is $R_X$?`,
        [md`About $40\kO$`, md`About $50\kO$`, md`About $2.4\kO$`, md`About $205\kO$`], 0,
        [null, md`That ignores the base. A base is a path to ground: $r_\pi + (\beta + 1)R_E\approx205\kO$ in parallel.`, md`That uses $r_\pi$ for the base. With $R_E$ under the emitter, the base looks like $r_\pi + (\beta + 1)R_E$.`, md`That is the base branch alone; the PNP collector is in parallel with it.`],
        md`$50\kO\parallel(2.5 + 202)\kO = 50\parallel204.5 = 40.2\kO$. The base loads the node by 20%.`),
      Q(md`The same node, but it drives the **gate** of an NMOS source follower instead of the base of an NPN follower. $R_X$ is now...`,
        [md`$50\kO$, the PNP collector alone`, md`smaller, because the follower adds a path`, md`$1/g_m$ of the MOSFET`, md`infinite`], 0,
        [null, md`A gate is a capacitor plate: no current, no path.`, md`$1/g_m$ is what you see looking into the **source**, not the gate.`, md`The PNP collector is still a path, $r_o = 50\kO$.`],
        md`A gate offers no path to ground, so the node sees only the PNP: $R_X = r_o = 50\kO$.`),
      P({
        id: 'bk08-node-1', title: 'Common emitter with a current-source load',
        q: md`In the stage below, $Q_1$ (NPN) and $Q_2$ (PNP, base held) both carry $1\,\text{mA}$. $V_{A,n} = 100\,\text{V}$, $V_{A,p} = 50\,\text{V}$. Find $R_{DN}$, $R_{UP}$ and $R_{out}$ at the output.`,
        fig: ceLoad(),
        parts: [{ lbl: 'R_{DN}', unit: 'kΩ', ans: 100 }, { lbl: 'R_{UP}', unit: 'kΩ', ans: 50 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 33.333, traps: [{ v: 150, msg: 'The two paths to ground are in parallel, not in series.' }] }],
        hints: [md`Turn $v_{in}$ off: $Q_1$'s base is grounded.`],
        sol: md`
1. $v_{in} = 0$: $Q_1$ has base and emitter grounded, so $R_{DN} = r_{o1} = 100\,\text{V}/1\,\text{mA} = 100\kO$.
2. $Q_2$: base held, emitter on $V_{CC}$: $R_{UP} = r_{o2} = 50\kO$.
3. $R_{out} = 100\parallel50 = 33.3\kO$.`,
      }),
      P({
        id: 'bk08-node-2', title: 'A node that drives a base',
        q: md`Node $X$: $R_C = 10\kO$ to $V_{CC}$, and the base of $Q_2$ ($I_C = 0.5\,\text{mA}$, $\beta = 100$, $R_{E2} = 500\,\Omega$, $r_o\to\infty$). Find the resistance looking into $Q_2$'s base and $R_X$.`,
        fig: nodeBase(false),
        parts: [{ lbl: 'R_{in2}', unit: 'kΩ', ans: 55.5 }, { lbl: 'R_X', unit: 'kΩ', ans: 8.4733, traps: [{ v: 10, msg: 'A base is not a gate: it is a path to ground, in parallel with $R_C$.' }, { v: 3.3333, msg: 'That uses $r_\\pi$ alone for the base; $R_{E2}$ counts $(\\beta + 1)$ times.' }] }],
        hints: [md`$r_{\pi2} = 5\kO$.`],
        sol: md`
1. $r_{\pi2} = 100/(20\,\text{mS}) = 5\kO$; $R_{in2} = 5\kO + 101\times0.5\kO = 55.5\kO$.
2. $R_X = 10\parallel55.5 = 8.47\kO$.`,
      }),
      P({
        id: 'bk08-node-3', title: 'The loaded node, typed',
        q: md`Type $R_X$ for the node above: $R_C$ up, and the base of $Q_2$ with $R_{E2}$ under its emitter ($r_o\to\infty$). Use \`RC\`, \`rpi2\`, \`beta2\`, \`RE2\`.`,
        fig: nodeBase(false),
        parts: [Object.assign(ex('RC || (rpi2 + (beta2 + 1)*RE2)', ['RC', 'rpi2', 'beta2', 'RE2'], 'R_X'), { vars: { RC: [1e3, 2e4], rpi2: [1e3, 2e4], beta2: [50, 200], RE2: [100, 2000] } })],
        sol: md`$R_X = R_C\parallel\big[r_{\pi2} + (\beta_2 + 1)R_{E2}\big]$.`,
      }),
      P({
        id: 'bk08-node-4', title: 'Three devices on one node',
        q: md`In the circuit below, $r_{o2} = 80\kO$ (PNP current source), $r_{ds1} = 40\kO$ (NMOS current source), and $Q_3$ runs at $1\,\text{mA}$ with $\beta = 100$, $R_{E3} = 5\kO$, $r_{o3}\to\infty$. Find the side branch $R_{in3}$ and $R_X$.`,
        fig: nodeMix,
        parts: [{ lbl: 'R_{in3}', unit: 'kΩ', ans: 507.5 }, { lbl: 'R_X', unit: 'kΩ', ans: 25.3317, traps: [{ v: 26.6667, msg: 'That leaves out $Q_3$\'s base, which is a path to ground.' }] }],
        sol: md`
1. $R_{in3} = r_{\pi3} + (\beta + 1)R_{E3} = 2.5 + 505 = 507.5\kO$.
2. $R_X = 80\parallel40\parallel507.5\kO$: $80\parallel40 = 26.67\kO$, then $\parallel507.5\kO = 25.33\kO$.`,
      }),
      R(md`
        ### Drill

        Random blocks above, below and beside a node: resistors, PNP and NPN collectors (plain and degenerated), BJT diodes, an NPN emitter, MOSFET current sources, and BJT bases or MOSFET gates hanging off the side.
      `),
      G('bk8_node', { need: 4 }),
    ],
  });

  // ================================================================== Chapter 8 problems
  const examA = [
    ['rail', [1, -1.2], { n: 'V_{CC} = 9\\,\\text{V}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C', s: '4\\,\\text{k}\\Omega' }], ['npn', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E', s: '1\\,\\text{k}\\Omega' }], ['gnd', [1, 3.2]],
    ['R', [-1.3, 1], [0, 1], { n: 'R_B', s: '10\\,\\text{k}\\Omega' }], ['w', [-1.3, 1], [-1.8, 1], [-1.8, 1.3]], ['Vac', [-1.8, 1.3], [-1.8, 2.3], { n: 'v_{in}', side: 'l' }],
    ['V', [-1.8, 2.3], [-1.8, 3.3], { n: 'V_{BB} = 1.81\\,\\text{V}', side: 'l' }], ['gnd', [-1.8, 3.3]], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }],
  ];
  const examB = [
    ['rail', [1, -2.2], { n: 'V_{CC}' }], ['R', [1, -2.2], [1, -1], { n: 'R_{E2}', s: '1\\,\\text{k}\\Omega' }], ['pnp', [1, 0], { n: 'Q_2' }], ['acg', [0, 0]],
    ['npn', [1, 2], { n: 'Q_1' }], ['R', [1, 3], [1, 4.2], { n: 'R_{E1}', s: '500\\,\\Omega' }], ['gnd', [1, 4.2]],
    ['w', [0, 2], [-0.6, 2], [-0.6, 2.3]], ['Vac', [-0.6, 2.3], [-0.6, 3.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 3.3]],
    ['w', [1, 1], [2, 1]], ['node', [1.5, 1], { n: 'X', side: 'a' }], ['npn', [3, 1], { n: 'Q_3' }], ['rail', [3, 0], { n: 'V_{CC}' }],
    ['R', [3, 2], [3, 3.2], { n: 'R_{E3}', s: '4.3\\,\\text{k}\\Omega' }], ['gnd', [3, 3.2]], ['w', [3, 2], [3.8, 2]], ['term', [3.8, 2], { n: 'v_{out}' }],
  ];
  const examC = [
    ['npn', [1, 1], { n: 'Q_1' }], ['npn', [2, 3], { n: 'Q_2' }], ['w', [1, 2], [1, 3]], ['w', [1, 0], [1, -0.4], [2, -0.4], [2, 2]], ['rail', [1.5, -0.4], { n: 'V_{CC}' }],
    ['R', [-1.3, 1], [0, 1], { n: 'R_S', s: '100\\,\\text{k}\\Omega' }], ['w', [-1.3, 1], [-1.8, 1], [-1.8, 1.3]], ['Vac', [-1.8, 1.3], [-1.8, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.8, 2.3]],
    ['R', [2, 4], [2, 5.2], { n: 'R_E', s: '2\\,\\text{k}\\Omega' }], ['gnd', [2, 5.2]], ['w', [2, 4], [2.8, 4]], ['term', [2.8, 4], { n: 'v_{out}' }],
  ];
  const emitNode = [['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1]], ['R', [-1.3, 1], [0, 1], { n: 'R_B' }], ['acg', [-1.3, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E', side: 'l' }], ['gnd', [1, 3.2]], ['w', [1, 2], [2, 2]], F.term([2, 2], '\\leftarrow R_X', 'r')];
  const pair2 = [
    ['rail', [1, 0], { n: 'V_{CC}' }], ['rail', [3, 0], { n: 'V_{CC}' }], ['npn', [1, 1], { n: 'Q_1' }], ['npn', [3, 1], { n: 'Q_2', flip: true }],
    ['w', [1, 2], [1, 2.4], [3, 2.4], [3, 2]], ['I', [2, 2.4], [2, 3.6], { n: 'I_{EE}' }], ['gnd', [2, 3.6]], ['R', [4, 1], [5.3, 1], { n: 'R_{B2}' }], ['acg', [5.3, 1]],
    ['R', [-1.3, 1], [0, 1], { n: 'R_{B1}' }], ['w', [-1.3, 1], [-1.8, 1]], F.inL([-1.8, 1]),
  ];
  L({
    id: 'bk08-problems', title: 'Chapter 8 problems', kind: 'review', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Chapter 8 summary

        Every result of the chapter, with the one-line reason it is true. $r_e = \alpha/g_m = r_\pi/(\beta + 1)\approx1/g_m$.

        | Looking into | Around it | Result | Why, in one line |
        |---|---|---|---|
        | [base](#/l/bk08-base) | emitter on its rail | $r_\pi$ | $i_t$ has one path, through $r_\pi$, and $v_\pi = v_t$ |
        | [base](#/l/bk08-base) | $R_B$ in front, $R_E$ under | $R_B + r_\pi + (\beta + 1)R_E$ | $R_E$ carries $(\beta + 1)$ times the base current |
        | [base](#/l/bk08-base) | current source under, $r_o$ kept | $r_\pi + (\beta + 1)r_o$ | $r_o$ is the only emitter-side path |
        | [emitter](#/l/bk08-emitter) | base held | $r_e\approx1/g_m$ | a diode carrying $I_E$: $V_T/I_E$ |
        | [emitter](#/l/bk08-emitter) | base through $R_B$ | $\dfrac{R_B + r_\pi}{\beta + 1}$ | the base path carries $1/(\beta + 1)$ of the emitter current |
        | [emitter](#/l/bk08-emitter) | $R_C$ and $r_o$ on the collector | $\approx\dfrac{R_B + r_\pi}{\beta + 1}\Big(1 + \dfrac{R_C}{r_o}\Big)$ | a collector load lets the collector current lag |
        | [elevator](#/l/bk08-elevator) | anything | up: $(\beta + 1)(r_e + Z_E)$; down: $r_e + \dfrac{Z_B}{\beta + 1}$ | same voltage, $(\beta + 1)$ times the current |
        | [collector](#/l/bk08-collector) | base and emitter held | $r_o$ | $v_\pi = 0$: only $r_o$ is left |
        | [collector](#/l/bk08-collector) | $R_E$ under | $r_o[1 + g_m(R_E\parallel r_\pi)] + R_E\parallel r_\pi$ | the emitter rise fights back; $r_\pi$ leaks part of it |
        | [collector](#/l/bk08-collector) | $R_E\to\infty$ | $(\beta + 1)r_o + r_\pi$ | the feedback signal is the base current itself |
        | [diode](#/l/bk08-diode) | base tied to collector | $\dfrac{1}{g_m + 1/r_\pi + 1/r_o}\approx\dfrac{1}{g_m}$ | the controlled source sees its own voltage |
        | [diode](#/l/bk08-diode) | $R_B$ collector to base | $\dfrac{R_B + r_\pi}{\beta + 1}$ | base path carries $1/(\beta + 1)$ of the current |
        | [cascode](#/l/bk08-cascode) | both bases held | $r_{o2}[1 + g_{m2}(r_{o1}\parallel r_{\pi2})] + \ldots\approx\beta r_o$ | $Q_2$ degenerated by $r_{o1}$, capped by its base current |
        | [node](#/l/bk08-node) | anything | $R_{UP}\parallel R_{DN}\parallel R_{side}$ | parallel paths to ground; a base is a path, a gate is not |
      `),
      RF(md`
        The four pictures to keep in your head:

        [[fig:b]]

        [[fig:e]]

        [[fig:c]]

        [[fig:k]]
      `, { b: { fig: F.lookB({ RE: true, RB: true }), cap: 'Base: $R_B + r_\\pi + (\\beta + 1)R_E$.' }, e: { fig: F.lookE({ RB: true }), cap: 'Emitter: $(R_B + r_\\pi)/(\\beta + 1)$.' },
        c: { fig: F.lookC({ RE: true }), cap: 'Collector: $r_o[1 + g_m(R_E\\parallel r_\\pi)] + R_E\\parallel r_\\pi$, at most about $\\beta r_o$.' }, k: { fig: cascFig(), cap: 'Cascode: about $\\beta r_{o2}$.' } }),
      P({
        id: 'bk08-x-1', title: 'The ladder in one transistor',
        q: md`Reference transistor ($I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$). Find (a) the resistance looking into the base with $R_E = 1\kO$ under the emitter ($r_o$ ignored), (b) looking into the emitter with the base held through $10\kO$ ($r_o$ ignored), (c) looking into the collector with base and emitter held.`,
        parts: [{ lbl: 'R_a', unit: 'kΩ', ans: 103.5 }, { lbl: 'R_b', unit: 'Ω', ans: 123.762, accept: [125] }, { lbl: 'R_c', unit: 'kΩ', ans: 100 }],
        sol: md`(a) $2.5 + 101\times1 = 103.5\kO$. (b) $(10 + 2.5)\kO/101 = 123.8\,\Omega$. (c) $r_o = 100\kO$. Emitter small, base in between (and magnified), collector big.`,
      }),
      P({
        id: 'bk08-x-2', title: 'A PNP base',
        q: md`A PNP at $I_C = 2\,\text{mA}$, $\beta = 80$, has $R_E = 330\,\Omega$ from $V_{CC}$ to its emitter and $R_B = 2\kO$ in series with its base ($r_o\to\infty$). Find $r_\pi$ and $R_{in}$.`,
        fig: F.lookB({ pnp: true, RE: 'R_E = 330\\,\\Omega', RB: 'R_B = 2\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 1 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 29.73, traps: [{ v: 3.33, msg: '$R_E$ counts $\\beta + 1$ times from the base.' }] }],
        sol: md`$g_m = 80\,\text{mS}$, $r_\pi = 80/80\,\text{mS} = 1\kO$. $R_{in} = 2 + 1 + 81\times0.33 = 29.73\kO$.`,
      }),
      P({
        id: 'bk08-x-3', title: 'An emitter with a collector load',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 120$, $V_A = 20\,\text{V}$. The base is held through $R_B = 4.7\kO$ and $R_C = 10\kO$ is on the collector; keep $r_o$. Find the resistance looking into the emitter.`,
        fig: F.lookE({ RB: 'R_B = 4.7\\,\\text{k}\\Omega', RC: 'R_C = 10\\,\\text{k}\\Omega' }),
        parts: [{ lbl: 'R', unit: 'Ω', ans: 110.07, traps: [{ v: 88.43, msg: 'That is the $r_o\\to\\infty$ answer. With $r_o = 40\\kO$, the $10\\kO$ collector load raises it by about $1 + R_C/r_o$.' }] }],
        hints: [md`$r_\pi = 6\kO$, $r_o = 40\kO$.`],
        sol: md`
$g_m = 20\,\text{mS}$, $r_\pi = 6\kO$, $r_o = 40\kO$.
$$R = \frac{(R_B + r_\pi)(R_C + r_o)}{R_B + R_C + r_\pi + (\beta + 1)r_o} = \frac{10.7\kO\times50\kO}{20.7\kO + 4840\kO} = 110.1\,\Omega$$
Check: $\dfrac{10.7\kO}{121}\big(1 + \tfrac{10}{40}\big) = 88.4\times1.25 = 110.5\,\Omega$.`,
      }),
      P({
        id: 'bk08-x-4', title: 'Degeneration equal to $r_\\pi$',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 150$, $V_A = 60\,\text{V}$, base held, and $R_E$ chosen equal to $r_\pi$. Find $r_\pi$, the resistance looking into the collector, and the ceiling $(\beta + 1)r_o + r_\pi$.`,
        fig: F.lookC({ RE: 'R_E = r_\\pi' }),
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 1.875 }, { lbl: 'R', unit: 'MΩ', ans: 2.2809375, traps: [{ v: 4.531875, msg: 'That uses $R_E$ instead of $R_E\\parallel r_\\pi$ (and happens to equal the ceiling).' }] }, { lbl: 'R_{max}', unit: 'MΩ', ans: 4.531875 }],
        sol: md`
$g_m = 80\,\text{mS}$, $r_\pi = 1.875\kO$, $r_o = 30\kO$. $R_E\parallel r_\pi = r_\pi/2 = 937.5\,\Omega$, $g_m\times937.5\,\Omega = 75$:
$$R = 30\kO\times76 + 0.94\kO = 2.281\,\text{M}\Omega$$
Ceiling: $151\times30\kO + 1.875\kO = 4.532\,\text{M}\Omega$. With $R_E = r_\pi$ you are already halfway there.`,
      }),
      P({
        id: 'bk08-x-5', title: 'A PNP diode load',
        q: md`A diode-connected PNP carries $0.25\,\text{mA}$ ($\beta = 50$, $V_A = 50\,\text{V}$). Find its exact small-signal resistance, keeping $r_\pi$ and $r_o$.`,
        fig: F.diode({ pnp: true }),
        parts: [{ lbl: 'R', unit: 'Ω', ans: 97.99, accept: [100] }],
        sol: md`$g_m = 10\,\text{mS}$, $1/r_\pi = 1/5\kO = 0.2\,\text{mS}$, $1/r_o = 1/200\kO = 0.005\,\text{mS}$. $R = 1/(10.205\,\text{mS}) = 98.0\,\Omega\approx1/g_m$.`,
      }),
      P({
        id: 'bk08-x-6', title: 'Down a Darlington',
        q: md`A Darlington with $Q_2$ at $I_{C2} = 4\,\text{mA}$, $\beta = 50$ for both, $r_o\to\infty$. $Q_1$'s base is held through $R_B = 50\kO$. Find $r_{\pi1}$ and the resistance looking up into $Q_2$'s emitter.`,
        fig: darl({ out: true }),
        parts: [{ lbl: 'r_{\\pi1}', unit: 'kΩ', ans: 15.9375 }, { lbl: 'R', unit: 'Ω', ans: 31.478, traps: [{ v: 6.127, msg: 'That is $Q_2$\'s $r_e$ alone.' }] }],
        sol: md`
$r_{\pi2} = 50\times25\,\text{mV}/4\,\text{mA} = 312.5\,\Omega$; $r_{\pi1} = 51\times312.5 = 15.94\kO$.
Down one floor: $(50 + 15.94)\kO/51 = 1.293\kO$. Down two: $(0.3125 + 1.293)\kO/51 = 31.5\,\Omega$.`,
      }),
      P({
        id: 'bk08-x-7', title: 'An emitter node, typed',
        q: md`Type the resistance $R_X$ of the emitter node: base held through $R_B$, $R_E$ from the emitter to ground ($r_o\to\infty$). Use \`RB\`, \`RE\`, \`rpi\`, \`beta\`.`,
        fig: emitNode,
        parts: [Object.assign(ex('RE || ((RB + rpi)/(beta + 1))', ['RB', 'RE', 'rpi', 'beta'], 'R_X'), { vars: { RB: [2e3, 2e4], RE: [50, 500], rpi: [1e3, 2e4], beta: [50, 200] } })],
        sol: md`Up into the emitter: $\dfrac{R_B + r_\pi}{\beta + 1}$. Down: $R_E$. $\;R_X = R_E\parallel\dfrac{R_B + r_\pi}{\beta + 1}$.`,
      }),
      P({
        id: 'bk08-x-8', title: 'A collector with a soft base, typed',
        q: md`Type the resistance looking into the collector with $R_E$ under the emitter and the base held through $R_B$; keep $r_o$. Use \`ro\`, \`gm\`, \`rpi\`, \`beta\`, \`RE\`, \`RB\`.`,
        fig: F.lookC({ RE: true, RB: true }),
        parts: [ex('ro*(1 + gm*rpi/(rpi + RB)*(RE || (rpi + RB))) + (RE || (rpi + RB))', ['ro', 'gm', 'rpi', 'beta', 'RE', 'RB'], 'R')],
        hints: [md`The emitter rises by $i_t\,(R_E\parallel(r_\pi + R_B))$, and $r_\pi/(r_\pi + R_B)$ of that is $-v_\pi$.`],
        sol: md`$$R = r_o\Big[1 + g_m\frac{r_\pi}{r_\pi + R_B}\big(R_E\parallel(r_\pi + R_B)\big)\Big] + R_E\parallel(r_\pi + R_B)$$`,
      }),
      P({
        id: 'bk08-x-9', title: 'A degenerated PNP load',
        q: md`In this common emitter, $Q_1$: $1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$. $Q_2$ (PNP, base held): $1\,\text{mA}$, $\beta = 50$, $V_A = 50\,\text{V}$, $R_{E2} = 500\,\Omega$. Find $R_{UP}$, $R_{DN}$, $R_{out}$ and the gain $-g_{m1}R_{out}$.`,
        fig: ceLoad({ RE2: '500\\,\\Omega' }),
        parts: [{ lbl: 'R_{UP}', unit: 'kΩ', ans: 764.643, traps: [{ v: 1050.5, msg: 'Use $R_{E2}\\parallel r_{\\pi2}$, not $R_{E2}$.' }] }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 100 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 88.4339 }, { lbl: 'A_v', unit: '', ans: -3537.36 }],
        sol: md`
1. $Q_2$: $g_m = 40\,\text{mS}$, $r_\pi = 1.25\kO$, $r_o = 50\kO$. $R_{E2}\parallel r_{\pi2} = 357.1\,\Omega$, boost $1 + 14.29 = 15.29$: $R_{UP} = 50\kO\times15.29 + 0.36\kO = 764.6\kO$.
2. $Q_1$ with $v_{in} = 0$: $R_{DN} = r_{o1} = 100\kO$.
3. $R_{out} = 764.6\parallel100 = 88.4\kO$; $A_v = -40\,\text{mS}\times88.4\kO = -3537$.

Degenerating the load pushed $R_{UP}$ far above $r_{o1}$, so now $Q_1$'s own $r_o$ sets the gain.`,
      }),
      P({
        id: 'bk08-x-10', title: 'A cascode with emitter degeneration',
        q: md`A cascode of two reference transistors ($1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$) with $R_E = 1\kO$ under $Q_1$. Find the resistance $Q_1$ presents to node $X$ and $R_{out}$.`,
        fig: cascFig({ RE: true }),
        parts: [{ lbl: 'R_X', unit: 'MΩ', ans: 2.957857 }, { lbl: 'R_{out}', unit: 'MΩ', ans: 10.0940 }],
        sol: md`
$R_X = 100\kO\times(1 + 40\,\text{mS}\times714.3\,\Omega) + 0.71\kO = 2.958\,\text{M}\Omega$.
$R_X\parallel r_{\pi2} = 2.4979\kO$, boost $1 + 99.92$: $R_{out} = 100\kO\times100.92 + 2.5\kO = 10.09\,\text{M}\Omega$. Only 2.4% above the plain cascode ($9.86\,\text{M}\Omega$): $Q_2$ was already at its ceiling.`,
      }),
      P({
        id: 'bk08-x-11', title: 'A differential pair with base resistors',
        q: md`Emitter-coupled pair, $I_{EE} = 2\,\text{mA}$ split equally, $\beta = 100$, $R_{B1} = R_{B2} = 5\kO$ (input in series with $R_{B1}$, $Q_2$'s base held through $R_{B2}$). Find $r_\pi$, the resistance $Q_1$'s emitter sees, and $R_{in}$.`,
        fig: pair2,
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 2.525, accept: [2.5] }, { lbl: 'Z_E', unit: 'Ω', ans: 74.505, accept: [75] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 15.05, accept: [15] }],
        sol: md`
$I_C = \alpha\times1\,\text{mA} = 0.990\,\text{mA}$, $r_\pi = 2.525\kO$. Down into $Q_2$'s emitter: $Z_E = (5 + 2.525)\kO/101 = 74.5\,\Omega$. Up: $R_{in} = 5 + 2.525 + 101\times0.0745 = 15.05\kO = 2(R_B + r_\pi)$.`,
      }),
      P({
        id: 'bk08-x-12', title: 'The elevator, round trip',
        q: md`An NPN at $0.5\,\text{mA}$, $\beta = 100$, has $R_B = 20\kO$ in series with its base and $R_E = 1\kO$ from emitter to ground ($r_o\to\infty$). Find (a) $R_{in}$ at the far end of $R_B$, (b) the resistance looking up into the emitter (with $R_E$ removed, base end of $R_B$ grounded), (c) the emitter node's resistance with $R_E$ in place.`,
        fig: emitNode,
        parts: [{ lbl: 'R_a', unit: 'kΩ', ans: 126 }, { lbl: 'R_b', unit: 'Ω', ans: 247.525, accept: [250] }, { lbl: 'R_c', unit: 'Ω', ans: 198.413 }],
        sol: md`$r_\pi = 5\kO$. (a) $20 + 5 + 101\times1 = 126\kO$. (b) $25\kO/101 = 247.5\,\Omega$. (c) $247.5\parallel1000 = 198.4\,\Omega$. Up multiplies $R_E$ by 101; down divides $R_B$ by 101.`,
      }),
      P({
        id: 'bk08-x-13', title: 'Exam-style: one stage, every terminal', big: true,
        q: md`$V_{CC} = 9\,\text{V}$, $R_C = 4\kO$, $R_E = 1\kO$, $R_B = 10\kO$, $V_{BB} = 1.81\,\text{V}$; $\beta = 100$, $V_A = 50\,\text{V}$, $V_{BE} = 0.7\,\text{V}$. (a) Find $I_C$ and check forward active. (b) Find $g_m$, $r_\pi$, $r_o$. (c) Ignoring $r_o$, find $R_{in}$ seen by $v_{in}$. (d) With $r_o$, find the resistance looking down into the collector (input off) and the output resistance $R_{out}$ at $v_{out}$. (e) With $r_o$, find the resistance $R_E$ sees looking up into the emitter.`,
        fig: examA,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 }, { lbl: 'r_o', unit: 'kΩ', ans: 50 },
          { lbl: 'R_{in}', unit: 'kΩ', ans: 113.5 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 421.296, traps: [{ v: 1479.3, msg: 'That holds the base directly. Here it is held through $R_B = 10\\kO$ (the source is off).' }] }, { lbl: 'R_{out}', unit: 'kΩ', ans: 3.96236 },
          { lbl: 'R_{e}', unit: 'Ω', ans: 133.229, accept: [133.66] }],
        hints: [md`DC: $V_{BB} - 0.7 = I_BR_B + (\beta + 1)I_BR_E$.`, md`(d) The source is off, so the base sits on $R_B$ to ground: the soft-base collector formula.`, md`(e) The emitter formula with $R_B$, $R_C$ and $r_o$.`],
        sol: md`
**(a) DC.** $I_B = \dfrac{1.81 - 0.7}{10\kO + 101\times1\kO} = \dfrac{1.11}{111\kO} = 10\,\mu\text{A}$, $I_C = 1\,\text{mA}$. $V_E = 101\times10\,\mu\text{A}\times1\kO = 1.01\,\text{V}$, $V_B = 1.71\,\text{V}$, $V_C = 9 - 4 = 5\,\text{V}\ge V_B$: forward active ✓.

**(b)** $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\,\text{V}/1\,\text{mA} = 50\kO$.

**(c)** $R_{in} = R_B + r_\pi + (\beta + 1)R_E = 10 + 2.5 + 101 = 113.5\kO$.

**(d)** Base on $R_B$: leak path $r_\pi + R_B = 12.5\kO$; $R_E\parallel12.5\kO = 925.9\,\Omega$; fraction $r_\pi/(r_\pi + R_B) = 0.2$; boost $g_m\times925.9\times0.2 = 7.41$:
$$R_{DN} = 50\kO\times8.41 + 0.93\kO = 421.3\kO$$
Up is $R_C$ ($V_{CC}$ is ground): $R_{out} = 4\parallel421.3 = 3.962\kO$.

**(e)** $R_e = \dfrac{(R_B + r_\pi)(R_C + r_o)}{R_B + R_C + r_\pi + (\beta + 1)r_o} = \dfrac{12.5\kO\times54\kO}{16.5\kO + 5050\kO} = 133.2\,\Omega$, close to $\dfrac{12.5\kO}{101}(1 + \tfrac{4}{50}) = 133.7\,\Omega$.`,
      }),
      P({
        id: 'bk08-x-14', title: 'Exam-style: a loaded high-resistance node', big: true,
        q: md`All three transistors carry $1\,\text{mA}$ with $\beta = 100$, $V_A = 50\,\text{V}$. $Q_2$ (PNP, base held) has $R_{E2} = 1\kO$; $Q_1$ has $R_{E1} = 500\,\Omega$; the follower $Q_3$ has $R_{E3} = 4.3\kO$ (keep its $r_o$; its collector is on $V_{CC}$). With $v_{in}$ off, find $R_{UP}$ into $Q_2$'s collector, $R_{DN}$ into $Q_1$'s collector, the side branch $R_{in3}$, and $R_X$.`,
        fig: examB,
        parts: [{ lbl: 'R_{UP}', unit: 'MΩ', ans: 1.47929 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 883.75 }, { lbl: 'R_{in3}', unit: 'kΩ', ans: 402.413 }, { lbl: 'R_X', unit: 'kΩ', ans: 232.96, traps: [{ v: 553.23, msg: 'That leaves out $Q_3$\'s base, which is the smallest of the three paths.' }] }],
        hints: [md`All three: $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\kO$.`, md`$Q_3$'s base: $r_\pi + (\beta + 1)(R_{E3}\parallel r_{o3})$.`],
        sol: md`
1. $R_{UP}$: $R_{E2}\parallel r_\pi = 714.3\,\Omega$, boost $29.57$: $50\kO\times29.57 + 0.71\kO = 1.479\,\text{M}\Omega$.
2. $R_{DN}$: $R_{E1}\parallel r_\pi = 416.7\,\Omega$, boost $17.67$: $50\kO\times17.67 + 0.42\kO = 883.8\kO$.
3. $R_{in3} = 2.5\kO + 101\times(4.3\parallel50)\kO = 2.5 + 101\times3.959 = 402.4\kO$.
4. $R_X = 1479\parallel883.8\parallel402.4\kO = 233.0\kO$.

Without $Q_3$ the node would be $553\kO$: the follower's base more than halves it. Every base on a high-resistance node matters.`,
      }),
      P({
        id: 'bk08-x-15', title: 'Exam-style: a Darlington follower', big: true,
        q: md`Darlington follower: $Q_2$ at $I_{C2} = 2\,\text{mA}$, $\beta = 100$ for both, $R_E = 2\kO$, source resistance $R_S = 100\kO$, $r_o\to\infty$. Find $r_{\pi2}$, $r_{\pi1}$, $R_{in}$ at $Q_1$'s base, the resistance looking up into $Q_2$'s emitter, and $R_{out}$ at $v_{out}$.`,
        fig: examC,
        parts: [{ lbl: 'r_{\\pi2}', unit: 'kΩ', ans: 1.25 }, { lbl: 'r_{\\pi1}', unit: 'kΩ', ans: 126.25 }, { lbl: 'R_{in}', unit: 'MΩ', ans: 20.65450 }, { lbl: 'R_{up}', unit: 'Ω', ans: 34.5555 }, { lbl: 'R_{out}', unit: 'Ω', ans: 33.9685 }],
        sol: md`
1. $r_{\pi2} = 100\times25\,\text{mV}/2\,\text{mA} = 1.25\kO$; $r_{\pi1} = 101\times1.25\kO = 126.25\kO$.
2. $R_{in} = 126.25\kO + 101\times(1.25 + 101\times2)\kO = 126.25 + 20528.25 = 20.65\,\text{M}\Omega$.
3. Down: $Q_1$'s emitter $(100 + 126.25)\kO/101 = 2.240\kO$; $Q_2$'s emitter $(1.25 + 2.240)\kO/101 = 34.56\,\Omega$.
4. $R_{out} = 34.56\parallel2000 = 33.97\,\Omega$. A $100\kO$ source drives a $2\kO$ load through a $34\,\Omega$ output: that is what a Darlington buffer is for.`,
      }),
      R(md`
        ### Mixed drill

        Every Chapter 8 generator, shuffled. Eight in a row completes the chapter.
      `),
      G('bk8_base', { need: 8, pool: ['bk8_base', 'bk8_emit', 'bk8_elev', 'bk8_coll', 'bk8_diode', 'bk8_casc', 'bk8_node'] }),
    ],
  });
})();

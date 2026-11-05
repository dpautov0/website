/* Unit 11 — BJT terminal impedances: the base (r_pi, and r_pi + (beta+1)R_E), the emitter (r_pi/(beta+1) ~ 1/g_m, and
   (R_B + r_pi)/(beta+1)), the (beta + 1) elevator, the collector (r_o, boosted by R_E || r_pi up to about beta r_o), the
   diode-connected BJT, R_UP || R_DN with BJTs and MOSFETs mixed, and the full "which terminal, what do you see" drill.
   Lecture 24 (summary page) plus the standard r_o corrections. Every formula and number was checked against a nodal solve. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const L = (l) => E3.lesson('e3u11', l);
  const ex = (...a) => E3.ex(...a);

  // ---------------------------------------------------------------- circuit pictures (R_X = what you look into)
  const lookL = (p) => ['term', p, { n: 'R_X\\rightarrow', side: 'l' }];
  const lookUp = (p) => ['term', p, { n: '\\uparrow R_X', side: 'r' }];
  const lookDn = (p) => ['term', p, { n: '\\downarrow R_X', side: 'r' }];
  const baseF = (re, rb) => [['rail', [1, 0]], ['npn', [1, 1]], ...(re ? [['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]]),
    ...(rb ? [['R', [-1.2, 1], [0, 1], { n: 'R_B' }], ['w', [-1.2, 1], [-1.7, 1]], lookL([-1.7, 1])] : [['w', [0, 1], [-0.7, 1]], lookL([-0.7, 1])])];
  const emitF = (rb) => [['rail', [1, 0]], ['npn', [1, 1]], ...(rb ? [['R', [-1.2, 1], [0, 1], { n: 'R_B' }], ['acg', [-1.2, 1]]] : [['acg', [0, 1]]]), ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4])];
  const collF = (re) => [['npn', [1, 1]], ['acg', [0, 1]], ...(re ? [['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]]), ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4])];
  const diodeF = () => [['npn', [1, 1], { dc: true }], ['gnd', [1, 2]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4])];
  const diodeRBF = () => [['npn', [1, 1]], ['gnd', [1, 2]], ['R', [0, 1], [0, -0.5], { n: 'R_B', side: 'l' }], ['w', [0, -0.5], [1, -0.5], [1, 0]], ['w', [1, -0.5], [1, -0.9]], lookDn([1, -0.9])];
  const pnpEmitF = () => [['pnp', [1, 1]], ['acg', [0, 1]], ['gnd', [1, 2]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4])];
  const pnpCollREF = () => [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_E' }], ['pnp', [1, 1]], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], lookUp([1, 2.4])];
  const cascF = () => [['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['acg', [0, 3]], ['gnd', [1, 4]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4])];

  // ---------------------------------------------------------------- small-signal models (r_o left out unless drawn)
  const rpi = (x, y1, y2, side = 'l') => [['R', [x, y1], [x, y2], { n: 'r_\\pi', side }], ['vlab', [x + 0.35, y1 + 0.35], [x + 0.35, y2 - 0.35], { n: 'v_\\pi' }]];
  const test = (x, y, dx = 1.4, dir = 'l') => [['w', [x, y], [x + dx, y]], ['V', [x + dx, y], [x + dx, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [x + dx, y + 1.2]], ['iarr', [x + dx * 0.55, y], dir, { n: 'i_t' }]];
  const baseModel = [
    ['V', [-0.6, 0], [-0.6, 1.2], { n: 'v_t', side: 'l' }], ['gnd', [-0.6, 1.2]], ['w', [-0.6, 0], [1, 0]], ['iarr', [0.2, 0], 'r', { n: 'i_t' }],
    ...rpi(1, 0, 2), ['w', [1, 2], [3, 2]], ['G', [3, 0], [3, 2], { n: 'g_mv_\\pi' }], ['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]],
    ['w', [2, 2], [2, 2.6]], ['R', [2, 2.6], [2, 4], { n: 'R_E' }], ['gnd', [2, 4]], ['txt', [2.15, 1.75], '$E$', { a: 'l' }], ['txt', [1.15, -0.3], '$B$', { a: 'l' }], ['txt', [3.15, -0.3], '$C$', { a: 'l' }],
    ['iarr', [2, 2.3], 'd', { n: '(\\beta + 1)i_t', side: 'l', off: [-14, 0] }],
  ];
  const emitModel = [
    ['R', [-0.4, 0], [1, 0], { n: 'R_B' }], ['w', [-0.4, 0], [-0.4, 0.4]], ['gnd', [-0.4, 0.4]],
    ...rpi(1, 0, 2), ['w', [1, 2], [3, 2]], ['G', [3, 0], [3, 2], { n: 'g_mv_\\pi' }], ['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]],
    ['txt', [1.15, -0.3], '$B$', { a: 'l' }], ['txt', [3.15, -0.3], '$C$', { a: 'l' }], ['txt', [3.15, 2.3], '$E$', { a: 'l' }],
    ...test(3, 2),
  ];
  const collModel = [
    ['w', [1, 0], [0.4, 0], [0.4, 0.4]], ['gnd', [0.4, 0.4]],
    ...rpi(1, 0, 2), ['w', [1, 2], [4.4, 2]], ['G', [3, 0], [3, 2], { n: 'g_mv_\\pi' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_o' }],
    ['R', [2, 2], [2, 3.4], { n: 'R_E' }], ['gnd', [2, 3.4]], ['txt', [2.15, 1.75], '$E$', { a: 'l' }], ['txt', [1.15, -0.3], '$B$', { a: 'l' }], ['txt', [3.15, -0.3], '$C$', { a: 'l' }],
    ...test(4.4, 0),
  ];
  const diodeModel = [
    ['w', [1, 0], [1, -0.6], [3, -0.6], [3, 0]],
    ...rpi(1, 0, 2), ['w', [1, 2], [4.4, 2]], ['gnd', [2, 2]], ['G', [3, 0], [3, 2], { n: 'g_mv_\\pi' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_o' }],
    ['txt', [1.15, -0.85], '$B = C$', { a: 'l' }],
    ...test(4.4, 0),
  ];
  // the elevator picture: base floor and emitter floor
  const elevator = [
    ['rail', [1, 0]], ['npn', [1, 1]], ['R', [-1.2, 1], [0, 1], { n: 'R_B' }], ['acg', [-1.2, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]],
    ['txt', [-0.4, 0.25], '$\\text{base floor}$'], ['txt', [2.1, 2.6], '$\\text{emitter floor}$', { a: 'l' }],
    ['txt', [2.1, 0.7], '$\\uparrow\\ \\times(\\beta + 1)$', { a: 'l' }], ['txt', [2.1, 1.35], '$\\downarrow\\ \\div(\\beta + 1)$', { a: 'l' }],
  ];
  // node examples
  const ceLoadFig = [
    ['rail', [1, -2]], ['pnp', [1, -1], { n: 'Q_2' }], ['acg', [0, -1]], ['w', [1, 0], [2, 0]], ['term', [2, 0], { n: 'v_{out}' }],
    ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]],
  ];
  const followFig = [
    ['rail', [1, 0]], ['npn', [1, 1], { n: 'Q_1' }], ['R', [-1.2, 1], [0, 1], { n: 'R_S' }], ['w', [-1.2, 1], [-1.6, 1], [-1.6, 1.4]], ['Vac', [-1.6, 1.4], [-1.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.6, 2.4]],
    ['w', [1, 2], [2, 2]], ['term', [2, 2], { n: 'v_{out}' }], ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]],
  ];
  const baseLoadFig = [
    ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_C' }], ['node', [1, 0], { n: 'X', side: 'l', dot: true }],
    ['w', [1, 0], [1, 1], [1.6, 1]], ['npn', [2.6, 1], { n: 'Q_2' }], ['rail', [2.6, 0]], ['R', [2.6, 2], [2.6, 3.2], { n: 'R_{E2}' }], ['gnd', [2.6, 3.2]],
    ['w', [1, 0], [0.2, 0]], ['term', [0.2, 0], { n: 'R_X\\rightarrow', side: 'l' }],
  ];

  // ================================================================== 1. the base
  L({
    id: 'e3-u11-base', title: 'Looking into the base', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Why this lesson

        In Exam 2 the input resistance of every stage driven at the gate was $\infty$, and you never thought about it. **A base is not a gate.** It draws current, so every common-emitter and emitter-follower stage loads whatever drives it, and the loading depends on what hangs under the emitter. This is half of the Lecture 24 summary page.

        Same recipe as [Unit 7](#/l/e2-u7-three): a test source $v_t$ on the terminal, everything else at incremental ground, $R = v_t/i_t$.
      `),
      R(md`
        ### Emitter on its rail: $r_\pi$

        With the emitter grounded, the test voltage sits right across $r_\pi$: $v_\pi = v_t$, so $i_t = v_t/r_\pi$.
        $$R_{in} = r_\pi = \frac{\beta}{g_m}$$
        The $g_mv_\pi$ current flows from collector to emitter, between two grounded nodes: none of it reaches the test source. At $1\,\text{mA}$, $\beta = 100$: $R_{in} = 2.5\kO$.

        **MOSFET twin:** the gate, $R_{in} = \infty$. The difference is exactly the base current.
      `, baseF(false)),
      R(md`
        ### $R_E$ under the emitter: $r_\pi + (\beta + 1)R_E$

        Now the emitter sits on $R_E$. The test current $i_t$ is the base current. It flows through $r_\pi$ into the emitter node, where the collector adds $g_mv_\pi = \beta i_t$. So $(\beta + 1)i_t$ flows down through $R_E$. KVL from the base to ground:
        $$v_t = i_tr_\pi + (\beta + 1)i_tR_E\quad\Rightarrow\quad R_{in} = r_\pi + (\beta + 1)R_E$$

        **The emitter resistance appears $(\beta + 1)$ times larger looking from the base.** (Lecture 24, word for word.) The reason is the same as in the DC base loop: $R_E$ carries $(\beta + 1)$ times the current you are pushing in, so each ohm of $R_E$ costs you $(\beta + 1)$ ohms of voltage per amp of base current.

        A resistor $R_B$ in series in front of the base just adds: $R_{in} = R_B + r_\pi + (\beta + 1)R_E$.
      `, baseModel),
      R(md`The circuit for that model: look in at the base, $R_E$ under the emitter, collector on its rail.`, baseF(true)),
      Q(md`$\beta = 100$, $r_\pi = 2.5\kO$, $R_E = 1\kO$. What do you see looking into the base?`,
        ['$103.5\\kO$', '$3.5\\kO$', '$2.5\\kO$', '$\\infty$'], 0,
        [null, 'You added $R_E$ once. It carries $(\\beta + 1)$ times the base current, so it counts 101 times.', 'That ignores $R_E$. The emitter is not grounded here.', 'That is a MOSFET gate. A base draws current.'],
        md`$R_{in} = r_\pi + (\beta + 1)R_E = 2.5\kO + 101\times1\kO = 103.5\kO$. The $R_E$ term dominates.`,
        { fig: baseF(true) }),
      R(md`
        !!note With $r_o$ (when it matters)
        Lecture 24 ignores $r_o$. With it, and the collector at incremental ground, $r_o$ hangs from the emitter to ground in parallel with $R_E$: $R_{in} = r_\pi + (\beta + 1)(R_E\parallel r_o)$. With a resistor $R_C$ on the collector instead, $R_{in} = r_\pi + R_E\dfrac{(\beta + 1)r_o + R_C}{r_o + R_C + R_E}$. Both are $r_\pi + (\beta + 1)R_E$ whenever $R_E$ and $R_C$ are small next to $r_o$, which is the usual case.

        ### How to recognize it

        The arrow (or the input) lands on the **side lead at the bar**. Say: "base: $r_\pi$, plus $\beta + 1$ times whatever is under the emitter". Whatever is under the emitter can be a resistor, another transistor's base (that is the next lesson), or an emitter. Never write $\infty$ for a base.
      `),
      P({
        id: 'e3u11-base-num', title: 'Input resistance of a degenerated common emitter',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $R_E = 1\kO$, $r_o\to\infty$. Find $r_\pi$ and the resistance looking into the base.`,
        fig: baseF(true),
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 5 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 106, accept: [105], traps: [{ v: 6, msg: '$R_E$ counts $(\\beta + 1)$ times from the base.' }] }],
        hints: [md`$g_m = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$; $r_\pi = \beta/g_m$.`],
        sol: md`
1. $g_m = 20\,\text{mS}$, $r_\pi = 100/20\,\text{mS} = 5\kO$.
2. $R_{in} = r_\pi + (\beta + 1)R_E = 5\kO + 101\kO = 106\kO$ ($105\kO$ with $\beta + 1\approx\beta$, also accepted).`,
      }),
      P({
        id: 'e3u11-base-sym', title: 'The formula, typed',
        q: md`Type the resistance looking into the base with $R_B$ in series in front of it and $R_E$ under the emitter ($r_o\to\infty$). Use \`rpi\`, \`beta\`, \`RB\`, \`RE\`.`,
        fig: baseF(true, true),
        parts: [ex('RB + rpi + (beta + 1)*RE', ['RB', 'rpi', 'beta', 'RE'], 'R_X')],
        sol: md`$R_X = R_B + r_\pi + (\beta + 1)R_E$. $R_B$ is in series with the base current, so it adds once; $R_E$ carries $(\beta + 1)$ times that current.`,
      }),
    ],
  });

  // ================================================================== 2. the emitter
  L({
    id: 'e3-u11-emitter', title: 'Looking into the emitter', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Why this lesson

        The emitter is the BJT's low-impedance terminal, like the MOSFET source. It is the input of a common-base stage and the output of an emitter follower, so its resistance is half of those gains. The new piece compared with Exam 2: a resistor in the **base** now matters.
      `),
      R(md`
        ### Base held: $\dfrac{r_\pi}{\beta + 1}\approx\dfrac1{g_m}$

        Base at incremental ground, collector on its rail, test source on the emitter. Then $v_\pi = 0 - v_t = -v_t$. Two currents leave the emitter node through the transistor: $v_t/r_\pi$ through $r_\pi$ to the base, and $g_mv_t$ up through the controlled source. Together
        $$i_t = \frac{v_t}{r_\pi} + g_mv_t = \frac{(1 + \beta)v_t}{r_\pi}\quad\Rightarrow\quad R = \frac{r_\pi}{\beta + 1}\approx\frac{1}{g_m}\ \ (\beta\gg1)$$
        At $1\,\text{mA}$: about $25\,\Omega$. **MOSFET twin:** the source, $1/g_m$. Same number, same reason (the control voltage is the test voltage).
      `, emitF(false)),
      R(md`
        ### $R_B$ in the base: $\dfrac{R_B + r_\pi}{\beta + 1}$

        Now the base reaches incremental ground only through $R_B$. Push the emitter up by $v_t$: current $v_t/(R_B + r_\pi)$ flows from the emitter, through $r_\pi$ and $R_B$, to ground, and $v_\pi = -v_t\dfrac{r_\pi}{R_B + r_\pi}$. The collector current changes by $g_m$ times that, which is $\beta$ times the base current. In total
        $$i_t = (\beta + 1)\frac{v_t}{R_B + r_\pi}\quad\Rightarrow\quad R = \frac{R_B + r_\pi}{\beta + 1}$$

        **The base resistance appears $(\beta + 1)$ times smaller looking from the emitter.** (Lecture 24 again.) Mirror image of the last lesson: from the base, emitter things are multiplied; from the emitter, base things are divided.

        **MOSFET twin:** a resistor on the gate never matters (no gate current), so a source is always $1/g_m$. For a BJT, $R_B$ shows up as $R_B/(\beta + 1)$. With $R_B = 10\kO$, $\beta = 100$ that adds $99\,\Omega$, often more than $1/g_m$ itself.
      `, emitModel),
      R(md`The circuit for that model.`, emitF(true)),
      Q(md`$I_C = 1\,\text{mA}$, $\beta = 100$, $R_B = 10\kO$. About how much do you see looking into the emitter?`,
        ['About $124\\,\\Omega$', 'About $25\\,\\Omega$', 'About $12.5\\kO$', 'About $10\\kO$'], 0,
        [null, 'That is $1/g_m$ alone. $R_B$ adds $R_B/(\\beta + 1)\\approx99\\,\\Omega$.', 'That is $R_B + r_\\pi$: the base loop. Divide by $\\beta + 1$ when looking from the emitter.', 'Base-side resistors are divided by $\\beta + 1$ from the emitter.'],
        md`$\dfrac{R_B + r_\pi}{\beta + 1} = \dfrac{10\kO + 2.5\kO}{101} = 124\,\Omega$, i.e. $1/g_m + R_B/(\beta + 1) = 25 + 99\,\Omega$.`,
        { fig: emitF(true) }),
      R(md`
        !!note With $r_o$ and a collector resistor $R_C$
        $r_o$ adds a path from the emitter to the collector. With the collector on its rail it is simply in parallel: $R = r_o\parallel\dfrac{R_B + r_\pi}{\beta + 1}$. With $R_C$ on the collector the exact result is $R = \dfrac{(R_B + r_\pi)(R_C + r_o)}{R_B + R_C + r_\pi + (\beta + 1)r_o}\approx\dfrac{R_B + r_\pi}{\beta + 1}\Big(1 + \dfrac{R_C}{r_o}\Big)$, the twin of the MOSFET's $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$: the emitter stays small while $R_C\ll r_o$. (With $r_o\to\infty$, as in Lecture 24, $R_C$ does not matter at all.)

        ### How to recognize it

        The arrow lands on the lead **with the arrow on it**, and the base is held (a triangle, a supply, or through $R_B$ to one). Say: "emitter: everything in the base, divided by $\beta + 1$". Emitters are small: tens to hundreds of ohms.
      `),
      P({
        id: 'e3u11-emit-num', title: 'Emitter numbers',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 100$, $r_o\to\infty$. Find the resistance looking into the emitter with the base grounded, then with $R_B = 5\kO$ between the base and ground.`,
        parts: [{ lbl: 'R_{X1}', unit: 'Ω', ans: 12.376, accept: [12.5] }, { lbl: 'R_{X2}', unit: 'Ω', ans: 61.881, accept: [62.5, 62.376], traps: [{ v: 12.376, msg: '$R_B$ shows up divided by $\\beta + 1$: about $49.5\\,\\Omega$ extra.' }] }],
        hints: [md`$g_m = 80\,\text{mS}$, $r_\pi = 1.25\kO$.`],
        sol: md`
1. $g_m = 2\,\text{mA}/25\,\text{mV} = 80\,\text{mS}$, $r_\pi = 100/80\,\text{mS} = 1.25\kO$.
2. Base grounded: $R_{X1} = \dfrac{r_\pi}{\beta + 1} = \dfrac{1250}{101} = 12.38\,\Omega\approx\dfrac1{g_m} = 12.5\,\Omega$.
3. With $R_B$: $R_{X2} = \dfrac{5000 + 1250}{101} = 61.9\,\Omega$.`,
      }),
      P({
        id: 'e3u11-emit-sym', title: 'The formula, typed',
        q: md`Type the resistance looking into the emitter, base through $R_B$ to incremental ground, $r_o\to\infty$. Use \`rpi\`, \`beta\`, \`RB\` (\`gm\` also works: \`1/gm + RB/(beta+1)\` is accepted).`,
        fig: emitF(true),
        parts: [ex('(RB + rpi)/(beta + 1)', ['RB', 'rpi', 'beta', 'gm'], 'R_X')],
        sol: md`$R_X = \dfrac{R_B + r_\pi}{\beta + 1}\approx\dfrac1{g_m} + \dfrac{R_B}{\beta + 1}$.`,
      }),
    ],
  });

  // ================================================================== 3. the elevator
  L({
    id: 'e3-u11-elevator', title: 'The $(\\beta + 1)$ elevator', ref: 'Lecture 24',
    steps: [
      R(md`
        ### One picture for both results

        Think of the base and the emitter as two floors, connected by an elevator that scales resistance by $\beta + 1$:
        - **Going up** (you stand at the base and look down to the emitter): everything on the emitter floor looks **$(\beta + 1)$ times bigger**. Add $r_\pi$, the junction itself.
        - **Going down** (you stand at the emitter and look up into the base): everything on the base floor, including $r_\pi$, looks **$(\beta + 1)$ times smaller**.

        $$R_{\text{into base}} = r_\pi + (\beta + 1)R_{\text{emitter side}}\qquad R_{\text{into emitter}} = \frac{r_\pi + R_{\text{base side}}}{\beta + 1}$$

        Why both directions: the emitter carries $(\beta + 1)$ times the base current. A resistor on the emitter side sees $(\beta + 1)$ times more current than you push into the base (so it looks bigger from there); a resistor on the base side sees $(\beta + 1)$ times less current than you push into the emitter (so it looks smaller from there).
      `, elevator),
      R(md`
        ### Two floors: the Darlington

        Stack two transistors so that $Q_1$'s emitter drives $Q_2$'s base, with $R_E$ under $Q_2$. Work from the bottom up:
        1. Into $Q_2$'s base: $r_{\pi2} + (\beta_2 + 1)R_E$.
        2. That is what sits under $Q_1$'s emitter, so into $Q_1$'s base: $r_{\pi1} + (\beta_1 + 1)\big[r_{\pi2} + (\beta_2 + 1)R_E\big]$.

        $R_E$ gets multiplied by about $\beta_1\beta_2$: with $\beta = 100$ each and $R_E = 1\kO$, about $10\,\text{M}\Omega$. (Last semester's Problem 1(b) was this pair's current gain, $\beta(\beta + 2)\approx\beta^2$, [here](#/l/e3-sp26-bjt).)

        Going the other way, from $Q_2$'s emitter up through both bases, divides twice: $\dfrac{1}{\beta_2 + 1}\Big[r_{\pi2} + \dfrac{R_B + r_{\pi1}}{\beta_1 + 1}\Big]$.
      `),
      Q(md`Two stacked BJTs (Darlington), $\beta = 100$ each, $R_E = 1\kO$ under the second emitter. About what do you see looking into the first base?`,
        ['About $10\\,\\text{M}\\Omega$', 'About $100\\kO$', 'About $200\\kO$', 'About $1\\kO$'], 0,
        [null, 'That is one floor. The first transistor multiplies again everything under its emitter.', 'The multipliers compound, they do not add: $(\\beta + 1)^2$, not $2(\\beta + 1)$.', 'That is $R_E$ itself, seen from its own node.'],
        md`Two floors up: $R_E\times(\beta + 1)^2\approx10^4\times1\kO = 10\,\text{M}\Omega$ (plus the $r_\pi$ terms).`),
      R(md`
        ### An emitter on the emitter floor: the differential-pair input

        If $Q_1$'s emitter meets another emitter ($Q_2$, base held), the emitter floor holds $R_E\parallel\dfrac{r_{\pi2}}{\beta_2 + 1}$. The emitter is the small one, about $1/g_{m2}$, so it wins the parallel combination:
        $$R_{in}\approx r_{\pi1} + (\beta_1 + 1)\frac{1}{g_{m2}}\approx r_{\pi1} + r_{\pi2} = 2r_\pi$$
        for identical transistors. That is the input resistance of a BJT differential pair (Exam 2's [pair lesson](#/l/e2-u7-pair), with $r_\pi$ instead of $\infty$).

        ### The Lecture 24 summary page, as one table

        | Looking into | What surrounds it | Result |
        |---|---|---|
        | base | $R_B$ in front, emitter grounded | $R_B + r_\pi$ |
        | base | $R_B$ in front, $R_E$ under the emitter | $R_B + r_\pi + (\beta + 1)R_E$ |
        | emitter | base grounded | $\dfrac{r_\pi}{\beta + 1}\approx\dfrac1{g_m}$ |
        | emitter | $R_B$ in the base | $\dfrac{R_B + r_\pi}{\beta + 1}$ |
        | diode (base tied to collector) | emitter grounded | $\dfrac{r_\pi}{\beta + 1}$ |
        | collector | $R_B$ from collector to base | $\dfrac{R_B + r_\pi}{\beta + 1}$ |
        | collector | base held, with or without $R_E$ | $\infty$ (with $r_o\to\infty$) |
      `),
      R(md`
        ### The drill

        One or two BJTs, $r_o\to\infty$, numbers from the bias. Find which floor you are on, then ride the elevator: up multiplies, down divides.
      `),
      G('e3_belev', { need: 5 }),
    ],
  });

  // ================================================================== 4. the collector
  L({
    id: 'e3-u11-collector', title: 'Looking into the collector', ref: 'Lecture 24 and the MOSFET drain',
    steps: [
      R(md`
        ### Why this lesson

        The collector is the BJT's high-impedance terminal, the output of a common-emitter, common-base or cascode stage: $R_{out}$ in every one of those gains. Lecture 24 sets $r_o\to\infty$ and writes $R = \infty$. With $r_o$ finite you get the twin of the Exam 2 [degenerated drain](#/l/e2-u7-scaler), with one twist that comes from $r_\pi$.
      `),
      R(md`
        ### Base held, emitter on its rail: $r_o$

        Base and emitter both at incremental ground: $v_\pi = 0$, the controlled source is dead, only $r_o$ connects the collector to the emitter.
        $$R = r_o = \frac{V_A}{I_C}$$
        A BJT with a fixed base is a current source, imperfect by $r_o$. **MOSFET twin:** the drain, $r_{ds}$.
      `, collF(false)),
      R(md`
        ### $R_E$ under the emitter: degeneration, with a ceiling

        The test current $i_t$ enters the collector and has to leave through the emitter node, where it meets $R_E$ to ground **and $r_\pi$ to the (grounded) base**. So the emitter rises by $v_e = i_t(R_E\parallel r_\pi)$, and $v_\pi = -v_e$. The controlled source then pulls $g_mv_\pi$ **against** the test current, so $r_o$ carries $i_t + g_mv_e$:
        $$v_t = v_e + r_o(i_t + g_mv_e)\quad\Rightarrow\quad R = r_o\big[1 + g_m(R_E\parallel r_\pi)\big] + R_E\parallel r_\pi$$

        **MOSFET twin:** $r_{ds}(1 + g_mR_S) + R_S$. Same shape, with $R_E\parallel r_\pi$ in place of $R_S$, because the base current leaks part of the emitter's signal away through $r_\pi$.

        **The ceiling.** Make $R_E$ huge: $R_E\parallel r_\pi\to r_\pi$ and $R\to r_o(1 + g_mr_\pi) + r_\pi\approx(\beta + 1)r_o$. A MOSFET drain can be boosted without limit; **a BJT collector tops out near $\beta r_o$**.
      `, collModel),
      R(md`The circuit for that model.`, collF(true)),
      Q(md`$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\kO$, $R_E = 500\,\Omega$, base held. About what do you see looking into the collector?`,
        ['About $884\\kO$', 'About $1.05\\,\\text{M}\\Omega$', 'About $50\\kO$', 'About $5\\,\\text{M}\\Omega$'], 0,
        [null, 'That is the MOSFET formula with $R_E$. Use $R_E\\parallel r_\\pi = 417\\,\\Omega$, not $500\\,\\Omega$.', 'That ignores the degeneration.', 'That is the ceiling $(\\beta + 1)r_o$, reached only for $R_E\\gg r_\\pi$.'],
        md`$R_E\parallel r_\pi = 500\parallel2500 = 417\,\Omega$, $g_m(\ldots) = 16.7$, so $R = 50\kO\times17.7 + 0.4\kO = 884\kO$.`,
        { fig: collF(true) }),
      R(md`
        ### The BJT cascode

        Two stacked NPNs, both bases held. The top one ($Q_2$) is degenerated by the bottom one's collector, $r_{o1}$. So $R_E\to r_{o1}$ and $R_E\parallel r_{\pi2}\approx r_{\pi2}$ (since $r_{o1}\gg r_{\pi2}$):
        $$R_{out} = r_{o2}\big[1 + g_{m2}(r_{o1}\parallel r_{\pi2})\big] + r_{o1}\parallel r_{\pi2}\approx\beta r_{o2}$$
        At $1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$: $9.86\,\text{M}\Omega$, right at the ceiling $\beta r_o = 10\,\text{M}\Omega$. The MOSFET cascode gave $g_mr_{ds}^2$; the BJT cascode is capped at $\beta r_o$ by $r_\pi$.
      `, cascF()),
      R(md`
        ### How to recognize it

        The arrow lands on the lead **without the arrow and not on the side**, and the base is held. Say: "collector: $r_o$, times $1 + g_m(R_E\parallel r_\pi)$ if there is something under the emitter". Collectors are big: tens of kΩ to MΩ. For a **PNP** the picture is upside down (emitter and $R_E$ on top toward $V_{CC}$, collector at the bottom) and the formula is identical.
      `, pnpCollREF()),
      P({
        id: 'e3u11-coll-num', title: 'Collector numbers',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$, base held. Find the resistance looking into the collector with $R_E = 500\,\Omega$, and the ceiling as $R_E\to\infty$.`,
        fig: collF(true),
        parts: [{ lbl: 'R_X', unit: 'kΩ', ans: 883.75, accept: [883.33], traps: [{ v: 1050.5, msg: 'The base is grounded, so $r_\\pi$ sits in parallel with $R_E$ at the emitter: use $R_E\\parallel r_\\pi$.' }, { v: 50, msg: 'That is $r_o$ alone; $R_E$ degenerates it.' }] },
          { lbl: 'R_{max}', unit: 'MΩ', ans: 5.0525, accept: [5, 5.05] }],
        hints: [md`$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\kO$, $R_E\parallel r_\pi = 417\,\Omega$.`, md`As $R_E\to\infty$, $R_E\parallel r_\pi\to r_\pi$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\,\text{V}/1\,\text{mA} = 50\kO$.
2. $R_E\parallel r_\pi = \dfrac{0.5\times2.5}{3}\kO = 416.7\,\Omega$; $g_m(R_E\parallel r_\pi) = 16.67$.
3. $R_X = 50\kO\times17.67 + 0.417\kO = 883.8\kO$.
4. Ceiling: $r_o(1 + g_mr_\pi) + r_\pi = 50\kO\times101 + 2.5\kO = 5.05\,\text{M}\Omega\approx\beta r_o$.`,
      }),
      P({
        id: 'e3u11-coll-sym', title: 'The formula, typed',
        q: md`Type the resistance looking into the collector, base at incremental ground, $R_E$ under the emitter. Use \`ro\`, \`gm\`, \`rpi\`, \`RE\`, \`beta\` (\`||\` is parallel).`,
        fig: collF(true),
        parts: [ex('ro*(1 + gm*(RE || rpi)) + (RE || rpi)', ['ro', 'gm', 'rpi', 'RE', 'beta'], 'R_X')],
        sol: md`$R_X = r_o\big[1 + g_m(R_E\parallel r_\pi)\big] + R_E\parallel r_\pi$ (the last term can be dropped: it is under 1% here).`,
      }),
    ],
  });

  // ================================================================== 5. the diode-connected BJT
  L({
    id: 'e3-u11-diode', title: 'The diode-connected BJT', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Base tied to collector: about $1/g_m$

        With the base wired to the collector, the test voltage is $v_\pi$. Both $r_\pi$ ($v_t/r_\pi$) and the collector ($g_mv_t$) draw current, plus $r_o$:
        $$R = r_\pi\parallel\frac1{g_m}\parallel r_o = \frac{1}{g_m + 1/r_\pi + 1/r_o}\approx\frac{r_\pi}{\beta + 1}\approx\frac{1}{g_m}$$
        The same as looking into an emitter: small. **MOSFET twin:** the diode-connected MOSFET, $\tfrac1{g_m}\parallel r_{ds}$. Where it shows up: the reference side of a current mirror (and a matched second transistor copies its current, $I_{out} = I_{ref}\dfrac{\beta}{\beta + 2}$ once both base currents are counted), and as a load.
      `, diodeModel),
      R(md`The circuit: base wired straight to the collector.`, diodeF()),
      R(md`
        ### $R_B$ from collector to base: $\dfrac{R_B + r_\pi}{\beta + 1}$

        Put a resistor between the collector and the base instead of a wire (Lecture 24 summary, bottom right). The test voltage drives $R_B + r_\pi$ in series, giving a base current $i_b = v_t/(R_B + r_\pi)$, and the collector draws $\beta i_b$ on top:
        $$R = \frac{R_B + r_\pi}{\beta + 1}$$
        It is the emitter result again, read from the other end: the base-side resistance divided by $\beta + 1$. With $R_B = 0$ it is the plain diode.
      `, diodeRBF()),
      Q(md`A diode-connected NPN, $I_C = 1\,\text{mA}$, $\beta = 100$. About what do you see looking in?`,
        ['About $25\\,\\Omega$', 'About $2.5\\kO$', 'About $100\\kO$', '$\\infty$'], 0,
        [null, 'That is $r_\\pi$ alone. With the base tied to the collector, the collector current responds too: $\\beta$ times more.', 'That is $r_o$, a collector with its base held.', 'Nothing in a BJT is infinite here.'],
        md`$R\approx r_\pi/(\beta + 1)\approx1/g_m = 25\,\Omega$.`,
        { fig: diodeF() }),
      P({
        id: 'e3u11-diode-num', title: 'Diode numbers',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$. Find the resistance looking into a diode-connected BJT (exact, with $r_o$), and with $R_B = 20\kO$ from the collector to the base instead of the wire.`,
        parts: [{ lbl: 'R_1', unit: 'Ω', ans: 49.480, accept: [50, 49.505] }, { lbl: 'R_2', unit: 'Ω', ans: 246.91, accept: [247.52, 250], traps: [{ v: 25000, msg: 'Divide by $\\beta + 1$: the collector draws $\\beta$ times the base current.' }] }],
        hints: [md`$g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $r_o = 100\kO$.`],
        sol: md`
1. $g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $r_o = 100\kO$.
2. $R_1 = \dfrac{1}{20\,\text{mS} + 0.2\,\text{mS} + 0.01\,\text{mS}} = 49.5\,\Omega\approx1/g_m = 50\,\Omega$.
3. $R_2 = r_o\parallel\dfrac{R_B + r_\pi}{\beta + 1} = 100\kO\parallel\dfrac{25\kO}{101} = 100\kO\parallel247.5\,\Omega = 246.9\,\Omega$.`,
      }),
    ],
  });

  // ================================================================== 6. a node
  L({
    id: 'e3-u11-node', title: 'A node with BJTs: $R_{UP}\\parallel R_{DN}$', ref: 'Lecture 24 with Exam 2 Unit 7',
    steps: [
      R(md`
        ### Why this lesson

        Every output resistance on the exam is a node: look up, look down, put the two in parallel ([Unit 7](#/l/e2-u7-node)). Now the blocks can be BJTs, MOSFETs, or both. You already have every block; this lesson is about reading which block is which, fast.

        !!method The node method
        1. Turn off the input (it becomes incremental ground).
        2. Split the node into what is **above** it ($R_{UP}$) and what is **below** ($R_{DN}$).
        3. For each transistor touching the node, ask: which terminal touches it, and what sits on its other terminals? Read the result off the table (base: $r_\pi + (\beta + 1)R_E$; emitter: $\frac{r_\pi + R_B}{\beta + 1}$; collector: $r_o$, boosted by $R_E\parallel r_\pi$; diode: $1/g_m$).
        4. $R = R_{UP}\parallel R_{DN}$. The smaller one wins.
      `),
      R(md`
        ### Example 1: a common emitter with a PNP current-source load

        Input off: $Q_1$'s base is grounded, its emitter is grounded, so looking down into its collector: $r_{o1}$. Looking up into $Q_2$'s collector (base held, emitter on $V_{CC}$): $r_{o2}$.
        $$R_{out} = r_{o1}\parallel r_{o2}$$
        At $1\,\text{mA}$ with $V_{A,n} = 100\,\text{V}$, $V_{A,p} = 50\,\text{V}$: $100\kO\parallel50\kO = 33.3\kO$. (The gain is then $-g_mR_{out} = -40\,\text{mS}\times33.3\kO\approx-1333$: Unit 12.)
      `, ceLoadFig),
      R(md`
        ### Example 2: the emitter-follower output

        Input off: $v_{in}$ is a short, so $Q_1$'s base sees $R_S$ to ground. Looking up into $Q_1$'s emitter: $\dfrac{R_S + r_\pi}{\beta + 1}$. Looking down: $R_E$.
        $$R_{out} = R_E\parallel\frac{R_S + r_\pi}{\beta + 1}$$
        $I_C = 1\,\text{mA}$, $\beta = 100$, $R_S = 10\kO$, $R_E = 2\kO$: $\dfrac{12.5\kO}{101} = 124\,\Omega$, in parallel with $2\kO$: $R_{out} = 117\,\Omega$. A follower's output is low because it is an emitter, and a $10\kO$ source resistance shrinks to $99\,\Omega$ on the way down the elevator.
      `, followFig),
      R(md`
        ### Example 3: a node that drives a base

        Node $X$ has $R_C$ up to $V_{CC}$ and, hanging off it, the base of $Q_2$ with $R_{E2}$ under its emitter. In Exam 2 a gate on a node changed nothing. A base does: looking into it you see $r_{\pi2} + (\beta + 1)R_{E2}$, in parallel with $R_C$:
        $$R_X = R_C\parallel\big[r_{\pi2} + (\beta + 1)R_{E2}\big] = 10\kO\parallel103.5\kO = 9.12\kO$$
        ($I_{C2} = 1\,\text{mA}$, $\beta = 100$, $R_{E2} = 1\kO$.) Here the base barely loads the node because $R_{E2}$ was multiplied by 101. Without $R_{E2}$ it would be $10\kO\parallel2.5\kO = 2\kO$: a big hit to a previous stage's gain. **Every time a stage drives a BJT base, check the loading.**
      `, baseLoadFig),
      Q(md`A node has a PNP collector (base held) above it and an NPN emitter follower's **base** below it (with $R_E = 2\kO$ under the emitter, $\beta = 100$). Which side sets the node resistance?`,
        ['Neither clearly: compare $r_{o}$ (tens of kΩ) with $r_\\pi + 101\\times2\\kO\\approx200\\kO$; the PNP side is smaller', 'The base side, because bases are small', 'The base side is infinite, so the PNP side', 'The PNP side, because collectors are always small'], 0,
        [null, 'Bases are small only when the emitter is grounded. With $R_E$ under it, $(\\beta + 1)R_E$ makes it large.', 'A base is never infinite: $r_\\pi + (\\beta + 1)R_E$.', 'Collectors are large (about $r_o$).'],
        md`Estimate both: $r_o$ of a PNP at $1\,\text{mA}$ is $50$–$100\kO$; the base is $r_\pi + (\beta + 1)R_E\approx205\kO$. Both large, the PNP side smaller: it dominates, but the base still pulls the node down noticeably.`),
      P({
        id: 'e3u11-node-num', title: 'Follower output, numbers',
        q: md`Emitter follower: $I_C = 1\,\text{mA}$, $\beta = 100$, $r_o\to\infty$, source resistance $R_S = 10\kO$, $R_E = 2\kO$. Find $R_{out}$ at the emitter.`,
        fig: followFig,
        parts: [{ lbl: 'R_{out}', unit: 'Ω', ans: 116.55, accept: [117.65], traps: [{ v: 2000, msg: 'That is $R_E$ alone. Look up into the emitter too.' }, { v: 23.81, msg: 'That ignores $R_S$: it comes down the elevator as $R_S/(\\beta + 1)$.' }] }],
        hints: [md`Up: $\dfrac{R_S + r_\pi}{\beta + 1}$. Down: $R_E$.`],
        sol: md`
1. $r_\pi = 2.5\kO$. Up into the emitter: $\dfrac{10\kO + 2.5\kO}{101} = 123.8\,\Omega$.
2. $R_{out} = 123.8\,\Omega\parallel2\kO = 116.6\,\Omega$.`,
      }),
      R(md`
        ### The drill

        Random blocks above and below a node: resistors, PNP and NPN collectors (with and without degeneration), BJT and MOS diodes, an NPN emitter looking up, an NPN **base** looking down. Estimate which side is smaller first, then compute.
      `),
      G('e3_bupdn', { need: 6 }),
    ],
  });

  // ================================================================== 7. the full drill
  L({
    id: 'e3-u11-look', title: 'Which terminal, and what do you see? (BJT drill)', ref: 'Units 10–11',
    steps: [
      R(md`
        ### The whole unit on one card

        | The test node touches... | Around it | You see | Size at $1\,\text{mA}$, $\beta = 100$ |
        |---|---|---|---|
        | the base | emitter on its rail | $r_\pi$ | $2.5\kO$ |
        | the base | $R_E$ under the emitter | $r_\pi + (\beta + 1)R_E$ | $\approx100\times R_E$ |
        | the emitter | base held | $\dfrac{r_\pi}{\beta + 1}\approx\dfrac1{g_m}$ | $25\,\Omega$ |
        | the emitter | $R_B$ in the base | $\dfrac{r_\pi + R_B}{\beta + 1}$ | $25\,\Omega + R_B/101$ |
        | the collector | base held, emitter on its rail | $r_o$ | $V_A/I_C$, e.g. $100\kO$ |
        | the collector | base held, $R_E$ under the emitter | $r_o[1 + g_m(R_E\parallel r_\pi)] + R_E\parallel r_\pi$ | up to $\approx\beta r_o$ |
        | a diode (base tied to collector) | | $\dfrac{r_\pi}{\beta + 1}\approx\dfrac1{g_m}$ | $25\,\Omega$ |
        | the collector | $R_B$ from collector to base | $\dfrac{r_\pi + R_B}{\beta + 1}$ | |

        **Collector big, emitter small, base in between (and multiplied by what is under it).** Compared with the MOSFET: the gate's $\infty$ becomes $r_\pi$, everything crossing the base–emitter junction picks up $\beta + 1$, and degeneration is capped at $\beta r_o$.
      `),
      R(md`For a PNP, flip the picture: the emitter (arrow pointing in) is on top, toward $V_{CC}$. Looking into its emitter from below with the base held is still about $1/g_m$.`, pnpEmitF()),
      R(md`
        ### The drill

        One BJT, NPN or PNP, mirrored or not, in one of eight setups. Find the emitter, name the terminal the test node touches, pick the formula, then compute. Ten in a row.
      `),
      G('e3_blook', { need: 10 }),
    ],
  });

  // ================================================================== 8. mixed
  L({
    id: 'e3-u11-mix', title: 'Unit 11 mixed drill', ref: 'Lecture 24', kind: 'review',
    steps: [
      R(md`Every Unit 11 skill, mixed: one-transistor looks, nodes with BJT and MOSFET blocks, and the $(\beta + 1)$ elevator through one or two transistors. Ten without opening a solution completes it. Then the concept questions from Units 10–11, shuffled.`),
      G('e3_blook', { need: 10, pool: ['e3_blook', 'e3_blook', 'e3_bupdn', 'e3_belev'] }),
      G('concept', { need: 6, units: ['e3u10', 'e3u11'] }),
    ],
  });
})();

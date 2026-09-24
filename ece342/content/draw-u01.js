/* draw-u01.js — drawings for Units 0–1 and the two rewritten lessons:
   "The three canonical stages" (what the stages are, how to recognise them, why degeneration appears
   only sometimes) and "The test-source method" (every step drawn). */
(function () {
  const { R, P, G } = C;
  const X = window.EXAM;
  const Dw = window.DRAW;
  const unit = (id) => COURSE.units.find((u) => u.id === id);
  const lesson = (uid, lid) => unit(uid).lessons.find((l) => l.id === lid);
  const byId = (id) => { for (const u of COURSE.units) for (const l of u.lessons) for (const s of l.steps) if (s.id === id) return s; return null; };
  const stepAt = (uid, lid, i) => lesson(uid, lid).steps[i];
  const RNG = { gm: [2e-4, 2e-2], RD: [500, 5e4], RS: [100, 1e4], RO: [1e3, 1e5], R1: [200, 2e4], R2: [200, 2e4], vin: [0.01, 2] };
  const DSP = { gm: 'g_m', RD: 'R_D', RS: 'R_S', RO: 'R_O', R1: 'R_1', R2: 'R_2', vin: 'v_{in}' };
  const ex = (expr, vars, lbl) => ({ lbl, expr, vars: Object.fromEntries(vars.map((v) => [v, RNG[v]])), disp: DSP });

  // ================================================================ shared drawings
  const T = {};
  // MOSFET symbol and its small-signal model
  T.mos = [['nmos', [1, 1]], ['txt', [1.25, -0.15], '$D$', { a: 'l' }], ['txt', [1.25, 2.15], '$S$', { a: 'l' }], ['txt', [-0.1, 0.75], '$G$', { a: 'c' }]];
  T.mosModel = [
    ['term', [0, 0.3], { n: 'G', side: 'l' }], ['term', [0, 1.3]], ['w', [0, 1.3], [0, 1.9], [1.6, 1.9]],
    ['vlab', [0.25, 0.4], [0.25, 1.2], { n: 'v_{gs}' }],
    ['G', [1.6, -0.1], [1.6, 1.9], { n: 'g_mv_{gs}' }],
    ['w', [1.6, -0.1], [1.6, -0.6]], ['term', [1.6, -0.6], { n: 'D' }],
    ['w', [1.6, 1.9], [1.6, 2.5]], ['term', [1.6, 2.5], { n: 'S' }],
  ];
  // transistor-level stages (DC bias not shown)
  const top = (lbl = 'R_D') => [['rail', [2, -0.9], { n: 'V_{DD}' }], ['R', [2, -0.9], [2, 0.5], { n: lbl }]];
  const gateIn = [['w', [1, 1.5], [0, 1.5]], ['Vac', [0, 1.5], [0, 2.7], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 2.7]]];
  const drainOut = [['w', [2, 0.5], [3.2, 0.5]], ['term', [3.2, 0.5], { n: 'v_{out}' }]];
  T.csT = [...top(), ...drainOut, ['nmos', [2, 1.5]], ['gnd', [2, 2.5]], ...gateIn];
  T.degT = [...top(), ...drainOut, ['nmos', [2, 1.5]], ['R', [2, 2.5], [2, 3.8], { n: 'R_S' }], ['gnd', [2, 3.8]], ...gateIn];
  T.isrcT = [...top(), ...drainOut, ['nmos', [2, 1.5]], ['I', [2, 2.5], [2, 3.8], { n: 'I_B' }], ['gnd', [2, 3.8]], ...gateIn];
  T.folT = [['rail', [2, 0.1], { n: 'V_{DD}' }], ['w', [2, 0.1], [2, 0.5]], ['nmos', [2, 1.5]], ...gateIn,
    ['R', [2, 2.5], [2, 3.8], { n: 'R_S' }], ['gnd', [2, 3.8]], ['w', [2, 2.5], [3.2, 2.5]], ['term', [3.2, 2.5], { n: 'v_{out}' }]];
  T.cgT = [...top(), ...drainOut, ['nmos', [2, 1.5]], ['w', [1, 1.5], [0.4, 1.5]], ['V', [0.4, 1.5], [0.4, 2.7], { n: 'V_B', side: 'l' }], ['gnd', [0.4, 2.7]],
    ['Vac', [2, 2.5], [2, 3.8], { n: 'v_{in}' }], ['gnd', [2, 3.8]]];
  T.cascT = [['w', [2, -0.9], [5, -0.9]], ['rail', [3.5, -0.9], { n: 'V_{DD}' }],
    ['R', [2, -0.9], [2, 0.5], { n: 'R_1' }], ['nmos', [2, 1.5], { n: 'M_1' }], ['gnd', [2, 2.5]], ...gateIn,
    ['w', [2, 0.5], [3.9, 0.5], [3.9, 1.5], [4, 1.5]],
    ['R', [5, -0.9], [5, 0.5], { n: 'R_2' }], ['nmos', [5, 1.5], { n: 'M_2' }], ['gnd', [5, 2.5]],
    ['w', [5, 0.5], [6.2, 0.5]], ['term', [6.2, 0.5], { n: 'v_{out}' }]];
  // small-signal models
  T.degM = FIGS.cs();
  T.csM = FIGS.cs().filter((e) => !(e[0] === 'R' && Dw.optOf(e).n === 'R_S') && !(e[0] === 'gnd' && e[1][0] === 2.6 && e[1][1] === 3.4)).concat([['gnd', [2.6, 2]]]);
  T.folM = FIGS.follower();
  T.cascM = (byId('PS1-4') || {}).fig;
  // test-source setups
  T.csTest = Dw.test(T.csM, { at: [2.6, -0.7], x: 5.4 });
  T.degTest = Dw.test(T.degM, { at: [2.6, -0.7], x: 5.4 });
  T.folTest = Dw.test(T.folM, { at: [5, 2] });
  T.folNoRO = FIGS.follower().filter((e) => !(e[0] === 'R' && Dw.optOf(e).n === 'R_O'));
  T.folNoROTest = Dw.test(T.folNoRO, { at: [5, 2] });
  // a VCCS controlled by its own terminal voltage is a resistor 1/g_m
  T.selfG = [['V', [0, 0], [0, 1.4], { n: 'v_t', side: 'l' }], ['w', [0, 0], [1.4, 0]], ['w', [0, 1.4], [1.4, 1.4]], ['G', [1.4, 0], [1.4, 1.4], { n: 'g_mv_t' }], ['iarr', [0.7, 0], 'r', { n: 'i_t' }]];
  T.selfR = [['V', [0, 0], [0, 1.4], { n: 'v_t', side: 'l' }], ['w', [0, 0], [1.4, 0]], ['w', [0, 1.4], [1.4, 1.4]], ['R', [1.4, 0], [1.4, 1.4], { n: '1/g_m' }], ['iarr', [0.7, 0], 'r', { n: 'i_t' }]];
  // an open sensing port: no current, so no drop across the series resistor
  T.sense = [['V', [0, 0.6], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0]], ['R', [0, 0], [1.6, 0], { n: 'R_X' }],
    ['iarr', [0.8, 0], 'r', { n: 'i=0', side: 'b', off: [0, 14] }], ['term', [1.6, 0]], ['term', [1.6, 1]], ['w', [1.6, 1], [1.6, 1.6], [0, 1.6]], ['vlab', [1.85, 0.1], [1.85, 0.9], { n: 'v_x = v_{in}' }]];
  window.TDRAW = T;

  // ================================================================ Unit 1: the three canonical stages (rewritten)
  const L = lesson('u1', 'u1-canonical');
  const oldProbs = L.steps.filter((s) => s.t === 'prob');
  oldProbs[2].fig = T.degTest;
  oldProbs[2].q = md`In the degenerated common-source model below, $v_{in}$ is switched off (shorted) and a test voltage $v_t$ is applied at the output. What does the controlled source do?`;
  L.title = 'The canonical stages: what they are and how to spot them';
  L.steps = [
    R(md`
      ### A MOSFET, seen by small signals
      In Problem Set 1 and in almost every exam Problem 1, the circuit with a diamond $g_mv_x$ is the **small-signal model of a transistor amplifier**. You don't need transistor physics to solve them, but knowing what they came from tells you which formula applies.

      For small signals a MOSFET is two facts: the **gate draws no current**, and a current $g_mv_{gs}$ flows from **drain to source**, where $v_{gs}$ is the gate-to-source voltage.

      [[fig:mos]]

      **How to read any model drawing:** find the sensing port ($+\;v_x\;-$). Its $+$ terminal is the **gate**, its $-$ terminal is the **source**. The diamond's top is the **drain**, its bottom is the **source**. Now you know which transistor terminal every node is.
    `),
    R(md`
      ### Three ways to connect one transistor
      A stage has an input, an output, and one terminal that is **common** to both (tied to ground for signals). The stage is named after the common terminal:

      [[fig:three]]

      - **Common source (CS):** input at the gate, output at the drain. Inverting, gain can be large.
      - **Common drain = source follower (CD):** input at the gate, output at the **source**. Gain just under 1, low output resistance.
      - **Common gate (CG):** input at the source, output at the drain (Mock A Problem 1).

      $V_{DD}$ and any other DC voltage count as ground for signals: a DC source can't change, so its small-signal voltage is 0. That's why "drain common" works when the drain goes to $V_{DD}$.
    `),
    R(md`
      ### Common source, source grounded
      The source is tied straight to ground, so $v_x = v_{in}$ exactly. The diamond pulls $g_mv_{in}$ down out of the output node, and that current comes through $R_D$:
      $$v_{out} = -g_mR_D\,v_{in}$$
      Negative because more input means more current through $R_D$, a bigger drop, and a lower output.

      [[fig:cs]]

      **Output resistance.** Short $v_{in}$ and push with $v_t$ at the output. Now $v_x = 0$, so the diamond carries nothing (it is **dead**, an open circuit). The test source sees only $R_D$: $\RTH = R_D$.
    `),
    R(md`
      ### Degeneration: a resistor in the source
      **"Degenerated"** means there is a resistor $R_S$ between the source and ground. It's there only when the circuit has one. If the source goes straight to ground, to $V_{DD}$, or to any DC voltage, $R_S = 0$ and there is no degeneration. So check what connects to the source before choosing a formula.

      Why it changes the gain: the drain current $g_mv_x$ also flows down through $R_S$, which lifts the source to $v_s = g_mv_xR_S$. The transistor only sees what's left of the input:
      $$v_x = v_{in} - v_s = v_{in} - g_mR_Sv_x \;\Rightarrow\; v_x = \frac{v_{in}}{1 + g_mR_S}$$
      $$v_{out} = -g_mR_Dv_x = -\frac{g_mR_D}{1 + g_mR_S}\,v_{in} \;\approx\; -\frac{R_D}{R_S}\quad(g_mR_S \gg 1)$$
      This is negative feedback: more current raises the source, which cuts $v_x$, which cuts the current. You trade gain for a gain set by resistors.

      [[fig:deg]]

      **Output resistance is still $R_D$.** Short $v_{in}$. KCL at the source node: the diamond's current $g_mv_x$ must leave through $R_S$, and $v_x = 0 - v_s$, so $v_s(g_m + 1/R_S) = 0 \Rightarrow v_s = 0 \Rightarrow v_x = 0$. The source is dead again.

      !!key What connects the source to ground decides the gain
      | Source goes to | $R_S$ for signals | $v_x$ | $v_{out}/v_{in}$ |
      |---|---|---|---|
      | ground, $V_{DD}$, any DC voltage | $0$ | $v_{in}$ | $-g_mR_D$ |
      | a resistor $R_S$ | $R_S$ | $\dfrac{v_{in}}{1+g_mR_S}$ | $-\dfrac{g_mR_D}{1+g_mR_S}$ |
      | only an ideal DC current source | $\infty$ (open) | $0$ | $0$: the source follows the gate |

      [[fig:srcs]]

      Every degenerated formula turns back into the plain one when you set $R_S = 0$: that's the check.
    `),
    R(md`
      ### Source follower (common drain)
      Now the output is taken at the **source**. $R_O$ is the transistor's own output resistance, in parallel with $R_S$ for signals (both go from the source to ground): call the combination $R' = R_S\pl R_O$.

      KCL at the source: all of $g_mv_x$ flows into $R'$, so $v_{out} = g_mv_xR'$, and the sensing port sits between gate and source, so $v_x = v_{in} - v_{out}$:
      $$v_{out} = g_mR'(v_{in} - v_{out}) \;\Rightarrow\; \frac{v_{out}}{v_{in}} = \frac{g_mR'}{1 + g_mR'}$$
      Slightly less than 1, close to 1 when $g_mR' \gg 1$: the output **follows** the input.

      [[fig:fol]]

      **Output resistance.** Short $v_{in}$ and apply $v_t$ at the source. Now $v_x = 0 - v_t = -v_t$, so the diamond carries $-g_mv_t$ downward, i.e. it pulls $g_mv_t$ out of the test source. A current proportional to the voltage across it is a resistor:

      [[fig:self]]

      $$\RTH = \frac{1}{g_m}\pl R_S\pl R_O$$
      Small, which is why followers are used as output buffers.
    `),
    R(md`
      ### Cascade
      Stage 1's drain drives stage 2's gate. A gate draws no current (the sensing port is open), so stage 2 doesn't load stage 1, and the gains simply multiply:
      $$\frac{v_{out}}{v_{in}} = (-g_{m1}R_1)(-g_{m2}R_2)$$
      Two inversions make it non-inverting. $\RTH$ is the last stage's: $R_2$. If stage 2 had an input resistance $R_{in2}$ to ground, stage 1 would see $R_1\pl R_{in2}$ instead of $R_1$.

      [[fig:casc]]

      An open sensing port also means a resistor in series with it carries **no current and drops nothing** (the $R_X$ in Problem Set 1 #4):

      [[fig:sense]]
    `),
    R(md`
      ### How to attack a Problem 1 model
      1. Find the sensing port: $+$ is the gate, $-$ is the source. Find the diamond: its top is the drain.
      2. Where is the input (gate or source)? Where is the output (drain or source)? That names the stage.
      3. Is there anything between the source and ground? Nothing: plain. A resistor: divide $g_m$ by $1 + g_mR_S$. The output itself (follower): $\dfrac{g_mR'}{1+g_mR'}$.
      4. For $\RTH$: short $v_{in}$, apply $v_t$, and ask whether $v_x$ is forced to 0 (dead source) or equals $\pm v_t$ (a $1/g_m$ resistor).

      | Stage | $v_{out}/v_{in}$ (open circuit) | $\RTH$ |
      |---|---|---|
      | Common source | $-g_mR_D$ | $R_D$ |
      | Degenerated CS | $-\dfrac{g_mR_D}{1+g_mR_S}$ | $R_D$ |
      | Source follower | $\dfrac{g_mR'}{1+g_mR'}$, $R' = R_S\pl R_O$ | $\dfrac1{g_m}\pl R_S\pl R_O$ |
      | Cascade of CS | $\prod(-g_{mk}R_k)$ | last stage's $R$ |
    `),
    P({
      q: md`Name this stage.`,
      fig: T.folT,
      parts: [{ mc: ['Source follower (common drain)', 'Common source', 'Degenerated common source', 'Common gate'], a: 0, why: [null, 'The output is at the source, not the drain.', 'A resistor sits in the source, but the output is taken there too: that makes it a follower.', 'The input is at the gate.'] }],
      sol: md`Input at the gate, output at the **source**, drain at $V_{DD}$ (ground for signals): common drain, the source follower.`,
    }),
    P({
      q: md`Name this stage.`,
      fig: T.degT,
      parts: [{ mc: ['Degenerated common source', 'Common source', 'Source follower', 'Common gate'], a: 0, why: [null, 'There is a resistor between the source and ground.', 'The output is at the drain.', 'The input is at the gate.'] }],
      sol: md`Input at the gate, output at the drain, and a resistor $R_S$ from the source to ground: degenerated common source, gain $-\dfrac{g_mR_D}{1+g_mR_S}$.`,
    }),
    P({
      q: md`Name this stage.`,
      fig: T.cgT,
      parts: [{ mc: ['Common gate', 'Common source', 'Source follower', 'Degenerated common source'], a: 0, why: [null, 'The input is at the source, not the gate.', 'The output is at the drain.', 'The input goes into the source.'] }],
      sol: md`The gate sits at a DC voltage $V_B$ (ground for signals), the input enters at the source, and the output is at the drain: common gate.`,
    }),
    P(Object.assign({}, oldProbs[0], { fig: T.csM, q: md`A common-source stage **without** degeneration: the source goes straight to ground. What is $\VTH$ at $v_{out}$?` })),
    P({
      q: md`Same common-source model. Find the output resistance $\RTH$.`,
      fig: T.csTest,
      parts: [ex('RD', ['RD'], '\\RTH')],
      hints: [md`With $v_{in}$ shorted, what is $v_x$? What does the diamond carry then?`],
      sol: md`$v_{in} = 0$ makes $v_x = 0$, so $g_mv_x = 0$: the diamond is an open circuit. The test source sees only $R_D$: $\RTH = R_D$.`,
    }),
    P({
      q: md`Degenerated common-source model. Find $\VTH$ at $v_{out}$.`,
      fig: T.degM,
      parts: [ex('-gm*RD*vin/(1+gm*RS)', ['gm', 'RD', 'RS', 'vin'], '\\VTH')],
      hints: [md`KCL at the source node: $g_mv_x$ flows down through $R_S$, so $v_s = g_mv_xR_S$, and $v_x = v_{in} - v_s$.`],
      sol: md`$v_x = v_{in} - g_mR_Sv_x \Rightarrow v_x = \dfrac{v_{in}}{1+g_mR_S}$, so $\VTH = -g_mR_Dv_x = -\dfrac{g_mR_D}{1+g_mR_S}v_{in}$.`,
    }),
    oldProbs[2],
    P(Object.assign({}, oldProbs[1], { fig: T.folNoROTest, q: md`Source follower with $R_O \to \infty$ (no $R_O$). With the input shorted and a test source at the output, what is $\RTH$?` })),
    P({
      q: md`Source follower model with $R_O$ included. Find the open-circuit gain $\VTH/v_{in}$ (type <code>||</code> for parallel).`,
      fig: T.folM,
      parts: [ex('gm*(RS||RO)/(1+gm*(RS||RO))', ['gm', 'RS', 'RO'], '\\VTH/v_{in}')],
      sol: md`$R' = R_S\pl R_O$. $v_{out} = g_mR'(v_{in} - v_{out})$, so $\dfrac{v_{out}}{v_{in}} = \dfrac{g_mR'}{1+g_mR'}$.`,
    }),
  ];
  L.steps[0].figs = { mos: Dw.row([{ fig: T.mos, cap: 'MOSFET' }, { fig: T.mosModel, cap: 'small-signal model' }]) };
  L.steps[1].figs = { three: Dw.row([{ fig: T.csT, cap: 'common source' }, { fig: T.folT, cap: 'common drain (follower)' }, { fig: T.cgT, cap: 'common gate' }]) };
  L.steps[2].figs = { cs: Dw.row([{ fig: T.csT, cap: 'circuit' }, { fig: T.csM, cap: 'small-signal model' }, { fig: T.csTest, cap: '$R_{TH}$: $v_{in}$ shorted, $v_t$ applied' }]) };
  L.steps[3].figs = {
    deg: Dw.row([{ fig: T.degT, cap: 'circuit' }, { fig: T.degM, cap: 'small-signal model' }, { fig: T.degTest, cap: '$R_{TH}$ setup' }]),
    srcs: Dw.row([{ fig: T.csT, cap: 'wire: $R_S = 0$' }, { fig: T.degT, cap: 'resistor: $R_S$' }, { fig: T.isrcT, cap: 'current source: open for signals' }]),
  };
  L.steps[4].figs = {
    fol: Dw.row([{ fig: T.folT, cap: 'circuit' }, { fig: T.folM, cap: 'small-signal model' }, { fig: T.folTest, cap: '$R_{TH}$ setup' }]),
    self: Dw.row([{ fig: T.selfG, cap: 'diamond controlled by its own voltage' }, { fig: T.selfR, cap: 'same current: a resistor $1/g_m$' }]),
  };
  L.steps[5].figs = { casc: Dw.row([{ fig: T.cascT, cap: 'two CS stages' }, { fig: T.cascM, cap: 'small-signal model' }]), sense: { fig: T.sense, cap: 'open sensing port: $i = 0$, so $v_x = v_{in}$' } };

  // ================================================================ Unit 1: the test-source method (rewritten)
  const exFig = [
    ['V', [0, 0.6], [0, 1.6], { n: 'v_{in}', side: 'l', v: 1 }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0]],
    ['R', [0, 0], [1.6, 0], { n: 'R_1', s: '1\\kO', v: 1000 }], ['node', [1.6, 0], { n: 'x', name: 'x', side: 'a' }],
    ['R', [1.6, 0], [1.6, 1.6], { n: 'R_2', s: '1\\kO', v: 1000, side: 'l' }], ['gnd', [1.6, 1.6]], ['vlab', [2, 0.35], [2, 1.25], { n: 'v_x' }],
    ['R', [1.6, 0], [3.8, 0], { n: 'R_F', s: '2\\kO', v: 2000 }],
    ['G', [3.8, 0], [3.8, 1.6], { n: 'g_mv_x', s: '2\\,\\text{mS}', g: 2e-3, c: ['x', '0'] }], ['gnd', [3.8, 1.6]],
    ['w', [3.8, 0], [5.2, 0]], ['R', [5.2, 0], [5.2, 1.6], { n: 'R_L', s: '5\\kO', v: 5000 }], ['gnd', [5.2, 1.6]],
    ['w', [5.2, 0], [6, 0]], ['term', [6, 0], { n: 'v_{out}', name: 'o' }],
  ];
  const exTh = Schem.thevenin(exFig, 'o');
  const exOff = Dw.off(exFig), exTest = Dw.test(exFig, { at: [6, 0] });
  const TS = lesson('u1', 'u1-testsource');
  const tsGens = TS.steps.filter((s) => s.t === 'gen');
  const thevPlot = Schem.plot({ x: [0, 3], y: [0, 6.5], xl: 'I_{port}', yl: 'V_{port}', xt: [0, 1, 2, 3], yt: [0, 2, 4, 6],
    curves: [{ f: (i) => 5 - 2 * i, from: 0, to: 2.5 }], pts: [{ x: 0, y: 5, n: 'V_{TH}' }, { x: 2.5, y: 0, n: 'I_N' }] });
  const thevEq = [['V', [0, 0.5], [0, 1.5], { n: 'V_{TH}', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_{TH}' }], ['w', [1.8, 0], [2.4, 0]], ['term', [2.4, 0], { n: 'a' }],
    ['w', [0, 1.5], [0, 1.9], [2.4, 1.9]], ['term', [2.4, 1.9], { n: 'b' }], ['iarr', [2.1, 0], 'l', { n: 'I_{port}' }], ['vlab', [2.7, 0.2], [2.7, 1.7], { n: 'V_{port}' }]];
  TS.steps = [
    R(md`
      ### What $\RTH$ measures
      Any linear two-terminal network behaves like $\VTH$ in series with $\RTH$. Push a current $I_{port}$ into the port and the port voltage moves along a straight line:
      $$V_{port} = \VTH + \RTH\,I_{port}$$
      **Independent sources** only set where the line sits ($\VTH$). **Dependent sources** are part of how the network responds, so they change the slope. To measure the slope: switch the independent sources off, keep every dependent source, push with a test source, and see how much current flows.

      [[fig:idea]]
    `),
    R(md`
      ### The method, drawn
      This circuit has a VCCS whose control $v_x$ is the voltage across $R_2$.

      [[fig:s1]]

      **Step 1. Independent sources off.** A voltage source becomes a short (its value can't change, so for the change it's 0 V). A current source becomes an open. **Dependent sources stay.**

      [[fig:s2]]

      **Step 2. Apply a test voltage $v_t$ at the port** and call the current it pushes in $i_t$.

      [[fig:s3]]

      **Step 3. Write the control variable in terms of $v_t$.** KCL at $x$ (currents leaving):
      $$\frac{v_x}{R_1} + \frac{v_x}{R_2} + \frac{v_x - v_t}{R_F} = 0 \;\Rightarrow\; v_x(1 + 1 + 0.5)\,\text{mS} = 0.5\,\text{mS}\cdot v_t \;\Rightarrow\; v_x = \frac{v_t}{5}$$

      **Step 4. KCL at the port for $i_t$.** Everything that leaves the output node is supplied by the test source:
      $$i_t = \frac{v_t}{R_L} + g_mv_x + \frac{v_t - v_x}{R_F} = v_t\left(0.2 + 0.4 + 0.4\right)\text{mS} = 1\,\text{mS}\cdot v_t$$

      **Step 5.** $\RTH = v_t/i_t = 1\kO$. (Solving the original circuit with the output open gives $\VTH = -0.6\,v_{in}$.)
    `),
    R(md`
      ### The patterns that decide every problem
      **1. A sensing port draws no current.** A resistor in series with it drops nothing.

      [[fig:sense]]

      **2. A dead source.** If switching the input off forces the control voltage to zero, the diamond carries nothing and is an open circuit (the degenerated CS: $\RTH = R_D$).

      [[fig:dead]]

      **3. A diamond controlled by the test voltage itself** carries $g_mv_t$: that is a resistor $1/g_m$ (the follower: $\RTH = \tfrac1{g_m}\pl R_S\pl R_O$).

      [[fig:self]]

      **4. Control voltage is a fraction of $v_t$** (the example above: $v_x = v_t/5$). The diamond then acts like a conductance $g_m\times$(that fraction).

      !!tip Test voltage or test current?
      Either works. A test **voltage** is easier when the control voltage is tied to the port voltage (patterns 3–4). A test **current** is easier when the port is fed through a single branch, so you know the current everywhere at once.

      !!trap Negative resistance is legal
      With a dependent source, $\RTH$ can come out negative. Check the signs; if they hold, it's real.
    `),
    P({
      q: md`The circuit from the drawn example. Find $\VTH$ at $v_{out}$ for $v_{in} = 1\,\text{V}$, and $\RTH$.`,
      fig: exFig,
      parts: [{ lbl: '\\VTH', unit: 'V', ans: exTh.VTH }, { lbl: '\\RTH', unit: 'kΩ', ans: exTh.RTH / 1000 }],
      hints: [md`$\VTH$: output open. Two nodes, $x$ and $o$: write KCL at both.`, md`$\RTH$: short $v_{in}$, apply $v_t$ at the output, and follow Steps 3–5 above.`],
      figs: { test: { fig: exTest, cap: '$v_{in}$ shorted, $v_t$ applied' } },
      sol: md`**$\VTH$** (output open). KCL at $o$: $\frac{v_o}{5\text{k}} + 2\text{m}\,v_x + \frac{v_o - v_x}{2\text{k}} = 0 \Rightarrow v_o = -\tfrac{15}{7}v_x$. KCL at $x$: $\frac{v_x - 1}{1\text{k}} + \frac{v_x}{1\text{k}} + \frac{v_x - v_o}{2\text{k}} = 0$. Together: $v_x = 0.28\,\text{V}$, $\VTH = -0.6\,\text{V}$.

**$\RTH$:**

[[fig:test]]

$v_x = v_t/5$, $i_t = v_t(0.2 + 0.4 + 0.4)\,\text{mS}$, so $\RTH = 1\kO$.`,
    }),
    ...tsGens,
  ];
  TS.title = 'Dependent sources: the test-source method';
  TS.steps[0].figs = { idea: Dw.row([{ fig: thevEq, cap: 'Thévenin equivalent' }, { svg: thevPlot, cap: 'the port line: slope $R_{TH}$' }]) };
  TS.steps[1].figs = {
    s1: { fig: exFig, cap: 'the circuit' },
    s2: { fig: exOff, cap: 'step 1: $v_{in}$ shorted; the diamond stays' },
    s3: { fig: exTest, cap: 'step 2: test source $v_t$ at the port' },
  };
  TS.steps[2].figs = {
    sense: { fig: T.sense, cap: '$i = 0$ through $R_X$, so $v_x = v_{in}$' },
    dead: Dw.row([{ fig: T.degTest, cap: 'input shorted: $v_s(g_m + 1/R_S) = 0$, so $v_x = 0$' }]),
    self: Dw.row([{ fig: T.selfG, cap: '$i_t = g_mv_t$' }, { fig: T.selfR, cap: 'same as $1/g_m$' }]),
  };

  // ================================================================ Unit 0 readings and problems
  const U0 = (lid, i, figs) => { stepAt('u0', lid, i).figs = figs; };
  const elemAbs = [['R', [0, 0], [0, 1.6], { n: 'R' }], ['vlab', [0.45, 0.2], [0.45, 1.4], { n: 'v' }], ['iarr', [0, 0.1], 'd', { n: 'i', side: 'l', off: [-16, 0] }]];
  const elemDel = [['X', [0, 0], [0, 1.6], { n: '\\text{element}' }], ['vlab', [0.5, 0.2], [0.5, 1.4], { n: 'v' }], ['iarr', [0, 1.5], 'u', { n: 'i', side: 'l', off: [-16, 0] }]];
  const s0 = stepAt('u0', 'u0-signs', 0);
  s0.md += '\n\n[[fig:pc]]';
  s0.figs = { pc: Dw.row([{ fig: elemAbs, cap: '$i$ enters $+$: $p = vi$ absorbed' }, { fig: elemDel, cap: '$i$ enters $-$: $p = vi$ delivered' }]) };
  const sg = lesson('u0', 'u0-signs').steps.filter((s) => s.t === 'prob');
  sg[0].fig = sg[0].fig || [['R', [0, 0], [0, 1.6], { n: '2\\kO' }], ['vlab', [0.45, 0.2], [0.45, 1.4], { n: 'v = 6\\,\\text{V}' }], ['iarr', [0, 1.5], 'u', { n: 'i', side: 'l', off: [-16, 0] }]];
  sg[1].fig = sg[1].fig || [['X', [0, 0], [0, 1.6], { n: '\\text{element}' }], ['vlab', [0.5, 0.2], [0.5, 1.4], { n: 'v = 5\\,\\text{V}' }], ['iarr', [0, 0.1], 'd', { n: 'i = 2\\,\\text{mA}', side: 'l', off: [-16, 0] }]];

  const kclFig = [['node', [2, 1], { dot: true }], ['R', [0, 1], [2, 1], { n: 'R_1' }], ['R', [2, 1], [4, 1], { n: 'R_2' }], ['R', [2, -0.8], [2, 1], { n: 'R_3', side: 'l' }], ['R', [2, 1], [2, 2.8], { n: 'R_4', side: 'l' }],
    ['iarr', [1.3, 1], 'r', { n: 'i_1' }], ['iarr', [2.8, 1], 'r', { n: 'i_2' }], ['iarr', [2, 0.2], 'd', { n: 'i_3', off: [16, 0] }], ['iarr', [2, 1.8], 'd', { n: 'i_4', off: [16, 0] }]];
  stepAt('u0', 'u0-kcl', 0).md += '\n\n[[fig:kcl]]';
  U0('u0-kcl', 0, { kcl: { fig: kclFig, cap: 'KCL: $i_1 + i_3 = i_2 + i_4$' } });
  const kclP = lesson('u0', 'u0-kcl').steps.filter((s) => s.t === 'prob')[0];
  kclP.fig = [['V', [0, 0.6], [0, 1.6], { n: 'V_S', side: 'l' }], ['w', [0, 0.6], [0, 0]], ['R', [0, 0], [1.6, 0], { n: 'R_1' }], ['node', [1.6, 0], { n: '1', side: 'a' }],
    ['R', [1.6, 0], [3.2, 0], { n: 'R_2' }], ['node', [3.2, 0], { n: '2', side: 'a' }], ['R', [3.2, 0], [4.8, 0], { n: 'R_3' }], ['node', [4.8, 0], { n: '3', side: 'a' }],
    ['R', [1.6, 0], [1.6, 1.6], { n: 'R_4' }], ['R', [3.2, 0], [3.2, 1.6], { n: 'R_5' }], ['R', [4.8, 0], [4.8, 1.6], { n: 'R_6' }],
    ['w', [0, 1.6], [4.8, 1.6]], ['gnd', [2.4, 1.6]], ['node', [0, 0], { n: '4', side: 'l' }], ['txt', [5.4, 1.6], '$\\text{node 5 (ground)}$', { a: 'l' }]];
  kclP.q = md`The circuit below has 5 nodes (1, 2, 3, 4 and ground). How many **independent** KCL equations does a circuit with 5 nodes have?`;

  const kvlFig = [['V', [0, 0.3], [0, 1.5], { n: 'V_S', side: 'l' }], ['w', [0, 0.3], [0, 0]], ['R', [0, 0], [2, 0], { n: 'R_1' }], ['R', [2, 0], [2, 1.8], { n: 'R_2' }], ['w', [0, 1.5], [0, 1.8]], ['R', [0, 1.8], [2, 1.8], { n: 'R_3', side: 'b' }],
    ['vlab', [0.35, -0.3], [1.65, -0.3], { n: 'v_1', side: 'a' }], ['vlab', [2.4, 0.2], [2.4, 1.6], { n: 'v_2' }], ['vlab', [1.65, 2.1], [0.35, 2.1], { n: 'v_3', side: 'b' }], ['txt', [1, 0.9], '$\\circlearrowright$', { a: 'c' }]];
  stepAt('u0', 'u0-kvl', 0).md += '\n\n[[fig:kvl]]';
  U0('u0-kvl', 0, { kvl: { fig: kvlFig, cap: 'clockwise: $-V_S + v_1 + v_2 + v_3 = 0$' } });

  const vdiv = [['V', [0, 0.4], [0, 1.6], { n: 'V_S', side: 'l' }], ['w', [0, 0.4], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_1' }], ['R', [1.8, 0], [1.8, 2], { n: 'R_2' }], ['w', [0, 1.6], [0, 2], [1.8, 2]], ['gnd', [0.9, 2]],
    ['w', [1.8, 0], [2.6, 0]], ['term', [2.6, 0], { n: 'V_2 = V_S\\frac{R_2}{R_1+R_2}' }]];
  const idiv = [['I', [0, 2], [0, 0], { n: 'I_S', side: 'l' }], ['w', [0, 0], [2.6, 0]], ['R', [1.3, 0], [1.3, 2], { n: 'R_1', side: 'l' }], ['R', [2.6, 0], [2.6, 2], { n: 'R_2' }], ['w', [0, 2], [2.6, 2]], ['gnd', [0, 2]],
    ['iarr', [2.6, 0.5], 'd', { n: 'I_2 = I_S\\frac{R_1}{R_1+R_2}', off: [16, 0] }]];
  stepAt('u0', 'u0-divide', 0).md += '\n\n[[fig:div]]';
  U0('u0-divide', 0, { div: Dw.row([{ fig: vdiv, cap: 'voltage divider' }, { fig: idiv, cap: 'current divider (note: the *other* resistor on top)' }]) });

  const superFig = [['I', [0, 2], [0, 0], { n: 'I_S', side: 'l' }], ['gnd', [0, 2]], ['w', [0, 0], [1.2, 0]], ['node', [1.2, 0], { n: 'v_A', side: 'a' }], ['R', [1.2, 0], [1.2, 2], { n: 'R_1', side: 'l' }], ['gnd', [1.2, 2]],
    ['V', [1.2, 0], [3.4, 0], { n: 'V_X' }], ['node', [3.4, 0], { n: 'v_B', side: 'a' }], ['R', [3.4, 0], [3.4, 2], { n: 'R_2' }], ['gnd', [3.4, 2]]];
  stepAt('u0', 'u0-supernode', 0).md += '\n\n[[fig:sup]]';
  U0('u0-supernode', 0, { sup: { fig: superFig, cap: 'floating source between $A$ and $B$: $v_A - v_B = V_X$, and one KCL around both nodes' } });
  const supP = lesson('u0', 'u0-supernode').steps.filter((s) => s.t === 'prob').find((s) => /floating/.test(s.q));
  if (supP) supP.fig = superFig;

  const meshFig = [['V', [0, 0.4], [0, 1.6], { n: 'V_S', side: 'l' }], ['w', [0, 0.4], [0, 0]], ['R', [0, 0], [2, 0], { n: 'R_1' }], ['R', [2, 0], [2, 2], { n: 'R_2' }], ['R', [2, 0], [4, 0], { n: 'R_3' }], ['R', [4, 0], [4, 2], { n: 'R_4' }],
    ['w', [0, 1.6], [0, 2], [4, 2]], ['txt', [1, 1], '$i_1\\circlearrowright$', { a: 'c' }], ['txt', [3, 1], '$i_2\\circlearrowright$', { a: 'c' }]];
  stepAt('u0', 'u0-mesh', 0).md += '\n\n[[fig:mesh]]';
  U0('u0-mesh', 0, { mesh: { fig: meshFig, cap: '$R_2$ carries $i_1 - i_2$' } });

  const depFig = (type, lbl, ctrl) => [...ctrl, [type, [2.2, 0], [2.2, 1.6], { n: lbl }], ['w', [2.2, 0], [3, 0]], ['w', [2.2, 1.6], [3, 1.6]], ['term', [3, 0]], ['term', [3, 1.6]]];
  const vctrl = [['term', [0, 0]], ['term', [0, 1.6]], ['vlab', [0.3, 0.2], [0.3, 1.4], { n: 'v_x' }]];
  const ictrl = [['term', [0, 0]], ['w', [0, 0], [0.9, 0], [0.9, 1.6], [0, 1.6]], ['term', [0, 1.6]], ['iarr', [0.9, 0.8], 'd', { n: 'i_x' }]];
  stepAt('u0', 'u0-dep', 0).md += '\n\n[[fig:dep]]';
  U0('u0-dep', 0, { dep: Dw.row([
    { fig: depFig('E', 'Av_x', vctrl), cap: 'VCVS' }, { fig: depFig('G', 'g_mv_x', vctrl), cap: 'VCCS' },
    { fig: depFig('E', 'r_mi_x', ictrl), cap: 'CCVS' }, { fig: depFig('G', '\\beta i_x', ictrl), cap: 'CCCS' }]) });

  // ================================================================ Unit 1 readings and problems
  const U1 = (lid, i, add, figs) => { const s = stepAt('u1', lid, i); s.md += `\n\n${add}`; s.figs = Object.assign(s.figs || {}, figs); };
  const lin = lesson('u1', 'u1-linear').steps.filter((s) => s.t === 'prob');
  lin[0].figHtml = Schem.plot({ x: [-2, 2], y: [-6, 8], xl: 'x', yl: 'f(x)', xt: [-2, -1, 0, 1, 2], yt: [-4, 0, 4, 8],
    curves: [{ f: (x) => 3 * x + 2 }, { f: (x) => Math.abs(x), cls: 'dash' }, { f: (x) => -5 * x, cls: 'dc' }, { f: (x) => x * x, cls: 'ink' }],
    pts: [{ x: 1, y: 5, n: '3x+2' }, { x: 1.6, y: 1.6, n: '|x|' }, { x: -1, y: 5, n: '-5x' }, { x: 1.8, y: 3.24, n: 'x^2' }] });
  lin[1].fig = [['V', [0, 0.4], [0, 1.6], { n: 'V_1', side: 'l' }], ['w', [0, 0.4], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_1' }], ['C', [1.8, 0], [1.8, 2], { n: 'C' }],
    ['D', [1.8, 0], [3.6, 0]], ['R', [3.6, 0], [3.6, 2], { n: 'R_2' }], ['I', [4.8, 2], [4.8, 0], { n: 'I_1' }], ['w', [3.6, 0], [4.8, 0]], ['w', [0, 1.6], [0, 2], [4.8, 2]], ['gnd', [2.7, 2]]];
  lin[2].fig = [['C', [0, 0], [0, 1.6], { n: 'C = 5' }], ['vlab', [0.5, 0.2], [0.5, 1.4], { n: 'x(t)' }], ['iarr', [0, 0], 'd', { n: 'y(t) = 5\\,dx/dt', side: 'l', off: [-18, 6] }]];
  lin[3].figHtml = Dw.row([{ fig: [['V', [0, 0], [0, 1.4], { n: 'V_0' }], ['iarr', [0, 0], 'd', { n: 'i', side: 'l', off: [-14, 4] }]], cap: 'ideal source' },
    { svg: Schem.plot({ x: [-2, 2], y: [0, 3], xl: 'i', yl: 'v', xt: [-2, 0, 2], yt: [0, 1, 2, 3], curves: [{ f: () => 2 }], pts: [{ x: 0, y: 2, n: 'V_0' }] }), cap: '$v = V_0$ for every $i$: no line through the origin' }]).svg;

  const netDep = [['V', [0, 0.4], [0, 1.6], { n: 'V_S', side: 'l' }], ['w', [0, 0.4], [0, 0]], ['R', [0, 0], [1.6, 0], { n: 'R_1' }], ['node', [1.6, 0], { name: 'x' }], ['R', [1.6, 0], [1.6, 2], { n: 'R_2', side: 'l' }], ['vlab', [1.95, 0.3], [1.95, 1.7], { n: 'v_x' }],
    ['G', [3.2, 0], [3.2, 2], { n: 'g_mv_x' }], ['w', [1.6, 0], [3.2, 0]], ['I', [4.4, 2], [4.4, 0], { n: 'I_S' }], ['w', [3.2, 0], [5.2, 0]], ['term', [5.2, 0], { n: 'a' }], ['w', [0, 1.6], [0, 2], [5.2, 2]], ['term', [5.2, 2], { n: 'b' }]];
  const thP = lesson('u1', 'u1-thevenin').steps.filter((s) => s.t === 'prob');
  thP[0].fig = netDep;
  thP[0].figs = { off: { fig: Dw.off(netDep), cap: 'independent sources off: $V_S$ shorted, $I_S$ opened, the diamond stays' } };
  thP[0].sol += '\n\n[[fig:off]]';
  const subBase = (branch) => [['V', [0, 0.4], [0, 1.6], { n: '10\\,\\text{V}', side: 'l' }], ['w', [0, 0.4], [0, 0]], ['R', [0, 0], [2, 0], { n: '4\\,\\Omega' }], ['w', [0, 1.6], [0, 2], [2, 2]], ...branch];
  thP[1].fig = subBase([['R', [2, 0], [2, 2], { n: '6\\,\\Omega' }], ['vlab', [2.4, 0.2], [2.4, 1.8], { n: '6\\,\\text{V}' }], ['iarr', [2, 0.3], 'd', { n: '1\\,\\text{A}', side: 'l', off: [-14, 0] }]]);
  thP[1].figs = { opts: Dw.row([
    { fig: subBase([['V', [2, 0], [2, 2], { n: '6\\,\\text{V}' }]]), cap: '$6\\,\\text{V}$ source: same' },
    { fig: subBase([['I', [2, 0], [2, 2], { n: '1\\,\\text{A}' }]]), cap: '$1\\,\\text{A}$ source: same' },
    { fig: subBase([['R', [2, 0], [2, 2], { n: '3\\,\\Omega' }]]), cap: '$3\\,\\Omega$: changes it' }]) };
  thP[1].sol += '\n\n[[fig:opts]]';
  const thevNort = [['V', [0, 0.5], [0, 1.5], { n: 'V_{TH}', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_{TH}' }], ['term', [1.8, 0], { n: 'a' }], ['w', [0, 1.5], [0, 2], [1.8, 2]], ['term', [1.8, 2], { n: 'b' }]];
  const nort = [['I', [0, 2], [0, 0], { n: 'I_N', side: 'l' }], ['w', [0, 0], [1.4, 0], [2.2, 0]], ['R', [1.4, 0], [1.4, 2], { n: 'R_N' }], ['w', [0, 2], [2.2, 2]], ['term', [2.2, 0], { n: 'a' }], ['term', [2.2, 2], { n: 'b' }]];
  const box = (extra) => [['box', [0, -0.2], [2, 2.2], { n: 'linear<br/>network' }], ['w', [2, 0], [2.8, 0]], ['w', [2, 2], [2.8, 2]], ...extra];
  U1('u1-thevenin', 0, '[[fig:eq]]\n\n[[fig:meas]]', {
    eq: Dw.row([{ fig: box([['term', [2.8, 0], { n: 'a' }], ['term', [2.8, 2], { n: 'b' }]]), cap: 'network' }, { fig: thevNort, cap: 'Thévenin' }, { fig: nort, cap: 'Norton' }]),
    meas: Dw.row([
      { fig: box([['term', [2.8, 0]], ['term', [2.8, 2]], ['vlab', [3.1, 0.2], [3.1, 1.8], { n: 'V_{OC} = V_{TH}' }]]), cap: 'open circuit' },
      { fig: box([['w', [2.8, 0], [2.8, 2]], ['iarr', [2.8, 1], 'd', { n: 'I_{SC} = I_N' }]]), cap: 'short circuit' },
      { fig: [['box', [0, -0.2], [2, 2.2], { n: 'independent<br/>sources off' }], ['w', [2, 0], [3, 0]], ['w', [2, 2], [3, 2]], ['V', [3, 0], [3, 2], { n: 'v_t' }], ['iarr', [2.5, 0], 'l', { n: 'i_t' }]], cap: '$R_{TH} = v_t/i_t$' }]),
  });

  const supEx = [['V', [0, 0.4], [0, 1.6], { n: 'V_S', side: 'l' }], ['w', [0, 0.4], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_1' }], ['node', [1.8, 0], { n: 'v', side: 'a' }], ['R', [1.8, 0], [1.8, 2], { n: 'R_2', side: 'l' }],
    ['I', [3.2, 2], [3.2, 0], { n: 'I_S' }], ['w', [1.8, 0], [3.2, 0]], ['w', [0, 1.6], [0, 2], [3.2, 2]], ['gnd', [1.8, 2]]];
  U1('u1-superpos', 0, '[[fig:sp]]', { sp: Dw.row([
    { fig: supEx, cap: 'both sources' },
    { fig: supEx.filter((e) => e[0] !== 'I'), cap: '$V_S$ alone ($I_S$ open): $v\' = V_S\\frac{R_2}{R_1+R_2}$' },
    { fig: supEx.map((e) => (e[0] === 'V' ? ['w', e[1], e[2]] : e)), cap: '$I_S$ alone ($V_S$ short): $v\'\' = I_S(R_1\\|R_2)$' }]) });

  const bbLoad = [['box', [0, -0.2], [2.2, 2.2], { n: 'linear<br/>circuit' }], ['w', [2.2, 0.2], [3.4, 0.2]], ['w', [2.2, 1.8], [3.4, 1.8]], ['R', [3.4, 0.2], [3.4, 1.8], { n: 'R_L' }], ['iarr', [2.8, 0.2], 'r', { n: 'I_L' }]];
  U1('u1-blackbox', 0, '[[fig:bb]]', { bb: Dw.row([{ fig: bbLoad, cap: 'two loads, two currents: one equation for $R_{TH}$' }, { fig: FIGS.blackbox({ src: 'V' }), cap: 'source-free box: everything scales with $V_1$' }]) });
  U1('u1-scaling', 0, '[[fig:sc]]', { sc: Dw.row([
    { fig: FIGS.blackbox({ src: 'V', load: false }).concat([['txt', [4.3, 1], '$R_2 = \\infty$', { a: 'l' }]]), cap: 'open circuit: $V_2 = V_{OC} = V_{TH}$' },
    { fig: FIGS.blackbox({ src: 'V', load: false }).concat([['w', [4.1, 0], [4.6, 0], [4.6, 2], [4.1, 2]], ['iarr', [4.6, 1], 'd', { n: 'I_{SC} = I_N' }]]), cap: 'short circuit: $I_2 = I_{SC} = I_N$' }]) });
  const scP = lesson('u1', 'u1-scaling').steps.filter((s) => s.t === 'prob');
  scP[0].fig = FIGS.blackbox({ src: 'V' });
  scP[1].fig = FIGS.blackbox({ src: 'V', load: false }).map((e) => (e[0] === 'box' ? ['box', e[1], e[2], { n: 'Linear circuit<br/>(with an internal<br/>source)' }] : e));

})();

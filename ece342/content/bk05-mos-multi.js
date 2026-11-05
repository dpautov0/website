/* The book, Chapter 5: circuits with several MOSFETs. Current mirrors (DC copy by size, small signal, output
   resistance), gain chains and loading, two paths into one output, mirrors that carry signal, the folded cascode and
   current division, the differential pair, and the DC bias of stacks and mirrors; then the chapter's problems.
   Every formula and number here was checked against an independent nodal solve (small signal) or a Newton solve of
   the square-law circuit (DC): scratchpad A4/*.py. Generators: js/gens-bk-a4.js. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk05', l);
  const ex = (...a) => BK.ex(...a);
  const FG = window.BK4.fig;

  // ================================================================ figure helpers
  const vin = (x, y, n = 'v_{in}') => [['Vac', [x, y], [x, y + 1], { n, side: 'l' }], ['gnd', [x, y + 1]]];
  const out = (p, n = 'v_{out}') => ['term', p, { n, side: 'r' }];
  // one transistor's small-signal model: g_m v_gs from the drain point to the source point, r_ds beside it (dx right)
  const ssm = (x, yd, ys, gl, rl, o = {}) => {
    const dx = o.dx ?? 1.2;
    return [['G', [x, yd], [x, ys], { n: gl, side: o.side || 'l' }], ['R', [x + dx, yd], [x + dx, ys], { n: rl }],
      ['w', [x, yd], [x + dx, yd]], ['w', [x, ys], [x + dx, ys]]];
  };
  const testV = (x, y, dx = 1.4) => [['w', [x, y], [x + dx, y]], ['V', [x + dx, y], [x + dx, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [x + dx, y + 1.2]], ['iarr', [x + dx * 0.5, y], 'l', { n: 'i_t' }]];
  const shortOut = (x, y, dx = 1.3) => [['w', [x, y], [x + dx, y], [x + dx, y + 0.6]], ['gnd', [x + dx, y + 0.6]], ['iarr', [x + dx * 0.5, y], 'l', { n: 'i_{out}' }]];

  // ================================================================ 1. mirrors: figures
  const diodeFig = [
    ['rail', [1, -0.6], { n: 'V_{DD}' }], ['I', [1, -0.6], [1, 0.6], { n: 'I_{REF}', side: 'l' }], ['w', [1, 0.6], [1, 1]],
    ['nmos', [1, 2], { n: 'M_1', flip: true, dc: true }], ['gnd', [1, 3]],
    ['vlab', [2.45, 1.1], [2.45, 2.9], { n: 'V_{GS} = V_{DS}' }],
  ];
  const mirrorFig = FG.nmirror();
  const mirrorRD = (vdd) => FG.nmirror({ vdd, rd: true });
  const pmirrorFig = FG.pmirror({ rl: true });
  const cascMirrorFig = FG.cascMirror();
  // I_D versus V_GS for the diode (W/L = 50) and a copy three times wider (W/L = 150), both at V_GS = 1.2 V
  const sqPlot = Schem.plot({
    x: [0.9, 1.5], y: [0, 600], w: 420, h: 260, xl: 'V_{GS}\\ (\\text{V})', yl: 'I_D\\ (\\mu\\text{A})',
    xt: [1, 1.1, 1.2, 1.3, 1.4, 1.5], yt: [0, 100, 200, 300, 400, 500, 600],
    curves: [
      { f: (v) => (v > 1 ? 2500 * (v - 1) ** 2 : 0), to: 1.49, cls: 'dc' },
      { f: (v) => (v > 1 ? 7500 * (v - 1) ** 2 : 0), to: 1.282 },
      { pts: [[1.2, 0], [1.2, 560]], cls: 'dash' },
    ],
    pts: [{ x: 1.2, y: 100, n: 'M_1:\\ 100\\,\\mu\\text{A}' }, { x: 1.2, y: 300, n: 'M_2:\\ 300\\,\\mu\\text{A}' }],
  });
  // the copy's output characteristic: triode below V_ov = 0.2 V, then flat with slope 1/r_ds (lambda = 0.05 V^-1)
  const outPlot = Schem.plot({
    x: [0, 3], y: [0, 400], w: 420, h: 260, xl: 'V_{out} = V_{DS2}\\ (\\text{V})', yl: 'I_{out}\\ (\\mu\\text{A})',
    xt: [0, 0.2, 1, 1.2, 2, 3], yt: [0, 100, 200, 300, 400],
    curves: [
      { f: (x) => (x < 0.2 ? 15000 * (0.2 * x - x * x / 2) : 300) * (1 + 0.05 * x) / 1.06 },
      { pts: [[0.2, 0], [0.2, 390]], cls: 'dash' },
    ],
    pts: [{ x: 1.2, y: 300, n: '' }],
  });
  // small-signal pictures of the mirror
  const mirrorRinModel = [
    ['V', [-1.4, 0], [-1.4, 1.2], { n: 'v_t', side: 'l' }], ['gnd', [-1.4, 1.2]], ['w', [-1.4, 0], [3.2, 0]], ['iarr', [-0.7, 0], 'r', { n: 'i_t' }],
    ['node', [1.6, 0], { n: 'a', side: 'a' }],
    ...ssm(0, 0, 1.8, 'g_{m1}v_a', 'r_{ds1}'), ['gnd', [0.6, 1.8]],
    ['term', [3.2, 0], { n: '\\text{gate of } M_2', side: 'r' }],
    ['txt', [0.6, 2.75], '$M_1:\\ \\text{gate} = \\text{drain} = a,\\ v_{gs1} = v_a$'],
  ];
  const mirrorRoutModel = [
    ['w', [0, 0], [2.2, 0]], ['node', [1.6, 0], { n: 'a', side: 'a' }],
    ...ssm(0, 0, 1.8, 'g_{m1}v_a', 'r_{ds1}'), ['gnd', [0.6, 1.8]],
    ['term', [2.2, 0], { n: 'G_2', side: 'r' }],
    ['txt', [0.6, 2.75], '$M_1\\ (\\text{diode})$'],
    ...ssm(4.6, 0, 1.8, 'g_{m2}v_a', 'r_{ds2}'), ['gnd', [5.2, 1.8]],
    ['txt', [5.2, 2.75], '$M_2:\\ v_{gs2} = v_a$'],
    ...testV(5.8, 0),
  ];
  const mirrorAiModel = [
    ['I', [-1.4, 1.8], [-1.4, 0], { n: 'i_{in}', side: 'l' }], ['w', [-1.4, 0], [2.2, 0]], ['w', [-1.4, 1.8], [0, 1.8]],
    ['node', [1.6, 0], { n: 'a', side: 'a' }],
    ...ssm(0, 0, 1.8, 'g_{m1}v_a', 'r_{ds1}'), ['gnd', [0.6, 1.8]],
    ['term', [2.2, 0], { n: 'G_2', side: 'r' }],
    ...ssm(4.6, 0, 1.8, 'g_{m2}v_a', 'r_{ds2}'), ['gnd', [5.2, 1.8]],
    ...shortOut(5.8, 0),
  ];
  const cascRoutModel = [
    ...ssm(1, 0, 2, 'g_{m4}v_{gs4}', 'r_{ds4}'),
    ['w', [2.2, 0], [3.6, 0]], ['V', [3.6, 0], [3.6, 1.2], { n: 'v_t', side: 'r' }], ['gnd', [3.6, 1.2]], ['iarr', [2.9, 0], 'l', { n: 'i_t' }],
    ['node', [2.2, 2], { n: 'x', side: 'r' }], ['R', [1.6, 2], [1.6, 3.4], { n: 'r_{ds2}' }], ['gnd', [1.6, 3.4]],
    ['txt', [1.0, -0.6], '$M_4:\\ v_{gs4} = 0 - v_x$'],
    ['txt', [2.1, 3.0], '$M_2:\\ v_{gs2} = 0$', { a: 'l' }],
  ];

  // ================================================================ 1. current mirrors
  L({
    id: 'bk05-mirror', title: 'Current mirrors: copying a current by size', ref: 'Practice 2 #1, 3 #1; Problem Set 4 #3',
    steps: [
      R(md`
        ### Chapter 5 at a glance

        Chapters 3 and 4 took one transistor at a time: what each terminal looks like, and what one transistor does as an amplifier. Real circuits, and every Problem 3 on Exam 2, use several transistors that work together. The good news of this chapter is that **nothing new is needed**: the same small-signal model, the same test source, the same $A_v = -G_MR_{out}$. What is new is bookkeeping: which transistor feeds which node, and where the signal current goes.

        By the end of the chapter you will be able to:
        - find the DC currents of a current mirror from transistor sizes, and its small-signal input and output resistance;
        - split a chain of stages, account for loading, and multiply the gains;
        - add up several transistors that drive one output;
        - follow a signal current through a mirror and through a folded cascode;
        - analyze the differential pair, with resistor loads and with a mirror load;
        - solve Exam 2's Problem 1: the DC bias of stacks and mirrors.

        **What you need first:** the small-signal model $i_d = g_mv_{gs} + v_{ds}/r_{ds}$ ([Chapter 2](#/l/bk02-model)); the terminal resistances of [Chapter 3](#/l/bk03-test) (gate: $\infty$; drain with a held gate: $r_{ds}$; source and diode: about $1/g_m$; degenerated drain: $r_{ds} + R_S + g_mr_{ds}R_S$); and the gain method $A_v = -G_MR_{out}$ of [Chapter 4](#/l/bk04-norton).

        | Section | The one idea | Where it shows up |
        |---|---|---|
        | Current mirrors | a diode turns a current into a voltage; a copy turns it back | Exam 2 Problem 1, every current-source load |
        | Gain chains | a gate draws nothing; a source draws a lot | Practice 2 #3, Problem Set 6 |
        | Two paths | with the output shorted, currents simply add | Problem Sets 4 #2 and 6 |
        | Signal mirrors | a mirror carries signal current and turns a pull into a push | Practice 3 #1–2 |
        | Folded cascode | current divides between paths by conductance | Practice 1 #3, Problem Set 4 #4 |
        | Differential pair | a fixed tail current is shared; the mirror doubles the output | Practice 3 #3 |
        | DC of stacks | currents first, then overdrives, then compare drain with gate | Practice 2 #1 |
      `),
      R(md`
        ### The question

        Every amplifier in Chapter 4 needed a bias current, and we drew it as an ideal current source. Many of them also had a "current-source load" whose resistance was $r_{ds}$. On a chip that current source **is a transistor**: one reference current is made once, by a resistor or an external source, and then **copied** to every stage that needs it. The circuit that copies it is the current mirror.

        This section answers three questions. How does a transistor copy a current, and how do the sizes set the copy? Where does the copy stop working, and how accurate is it? And what does a mirror look like to a small signal? On Exam 2 the first two are Problem 1 (DC with mirrors), and the third is the $r_{ds}$ of every current-source load in Problems 2 and 3.
      `),
      R(md`
        ### The physical picture: a diode-connected transistor measures a current

        Tie the gate of an NMOS to its drain and push a fixed current $I_{REF}$ into the drain. Nothing can flow into the gate (it is a capacitor plate), so **all of $I_{REF}$ must go down the channel**. The transistor has no say in how much current flows; what it can adjust is its voltage.

        Suppose $V_{GS}$ were too low. The channel would carry less than $I_{REF}$, the surplus would pile up as charge on the drain–gate node, and that charge would raise $V_{GS}$. If $V_{GS}$ were too high, the channel would carry more than $I_{REF}$ and drain the node down. The node settles at the one $V_{GS}$ at which the channel carries exactly $I_{REF}$.

        So a **diode-connected transistor is a current-to-voltage converter**: feed it a current and it answers with the gate voltage that goes with that current. It is also always in saturation: $V_{DS} = V_{GS}$, which is more than the $V_{GS} - V_{TN}$ that saturation needs.

        **Feel for the numbers.** An NMOS with $W/L = 50$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$) at $100\,\mu\text{A}$: $V_{ov} = \sqrt{2(100\,\mu\text{A})/(100\,\mu\text{A/V}^2\times50)} = 0.2\,\text{V}$, so $V_{GS} = 1.2\,\text{V}$. Four times the current only doubles the overdrive ($0.4\,\text{V}$, $V_{GS} = 1.4\,\text{V}$): the square law makes the voltage a gentle function of the current.
      `, diodeFig),
      RF(md`
        ### Copying: same $V_{GS}$, same current per unit width

        Now hang the gate wire on a second transistor $M_2$ whose source is also on ground. $M_2$ sees exactly the same $V_{GS}$ as $M_1$. If it is identical to $M_1$ and in saturation, it **must** carry the same current: the same gate voltage over the same channel gives the same channel charge and the same drift. The gate wire carries the *recipe* (a voltage), not the current.

        If $M_2$ is three times wider, think of it as three copies of $M_1$ side by side, each carrying $I_{REF}$: it carries $3I_{REF}$. That is the whole idea of a mirror: **the ratio of the currents is the ratio of the sizes.**

        [[fig:m]]

        Because a gate draws no current, one diode can feed **any number** of copies, each with its own size: $1\times$, $2\times$, $\tfrac12\times$. The reference never notices them. This is how a whole chip is biased from one current.
      `, { m: { fig: mirrorFig, cap: 'The basic NMOS mirror. $M_1$ (diode-connected) turns $I_{REF}$ into a gate voltage; $M_2$ shares the gate and the source, so it has the same $V_{GS}$.' } }),
      RF(md`
        ### The model and the derivation (DC)

        **The model.** The square law in saturation, $I_D = \tfrac12\mu_nC_{ox}\tfrac WL(V_{GS} - V_{TN})^2$. **Assumptions:** both transistors in saturation; the same $\mu_nC_{ox}$ and $V_{TN}$ (same type, same chip); channel-length modulation ignored for now ($\lambda = 0$; we put it back below).

        **Step 1: the diode sets the overdrive.** All of $I_{REF}$ flows down $M_1$, and $M_1$ is saturated:
        $$I_{REF} = \tfrac12\mu_nC_{ox}\Big(\frac WL\Big)_1V_{ov}^2\quad\Rightarrow\quad V_{ov} = \sqrt{\frac{2I_{REF}}{\mu_nC_{ox}(W/L)_1}}$$

        **Step 2: the copy sees the same overdrive.** $M_2$'s gate is the same node as $M_1$'s gate and its source is the same ground, so $V_{GS2} = V_{GS1}$ and $V_{ov2} = V_{ov1} = V_{ov}$.

        **Step 3: the copy's current.** If $M_2$ is saturated,
        $$I_{out} = \tfrac12\mu_nC_{ox}\Big(\frac WL\Big)_2V_{ov}^2$$

        **Step 4: divide Step 3 by Step 1.** The factor $\tfrac12\mu_nC_{ox}$ cancels, and so does $V_{ov}^2$:

        !!key The mirror ratio
          $$\frac{I_{out}}{I_{REF}} = \frac{(W/L)_2}{(W/L)_1}$$
          valid while $M_2$ is in saturation. The ratio does not depend on $\mu C_{ox}$, on $V_{TN}$ or on the current level: only on the sizes. The same holds for a PMOS mirror.

        [[fig:sq]]

        The plot shows the two square laws. The diode picks the point where its curve reaches $100\,\mu\text{A}$ ($V_{GS} = 1.2\,\text{V}$); the copy, three times wider, sits on its own curve at the **same** $V_{GS}$, where the current is $300\,\mu\text{A}$.
      `, { sq: { fig: sqPlot, cap: 'Square law of the diode $M_1$ ($W/L = 50$, grey) and of a copy $M_2$ three times wider ($W/L = 150$, coloured). The shared gate voltage (dashed) gives $100\\,\\mu$A and $300\\,\\mu$A.' } }),
      R(md`
        ### Check it

        - **Equal sizes:** the ratio is 1 and $I_{out} = I_{REF}$. A mirror with identical devices copies exactly.
        - **A longer copy:** $(W/L)_2 = 25$ against $(W/L)_1 = 50$ gives half the current. Length works against current, width for it.
        - **Units:** a ratio of ratios, dimensionless, as a current ratio must be.
        - **One number:** $I_{REF} = 100\,\mu\text{A}$, $(W/L)_1 = 50$, $(W/L)_2 = 150$ gives $300\,\mu\text{A}$. Check it the long way: $M_2$'s own overdrive would be $\sqrt{2(300\,\mu\text{A})/(100\,\mu\text{A/V}^2\times150)} = \sqrt{0.04} = 0.2\,\text{V}$, the same as $M_1$'s. Consistent.
      `),
      RF(md`
        ### Where the copy stops working: compliance

        The derivation assumed $M_2$ is saturated. Saturation needs $V_{DS2}\ge V_{ov}$. Below that the copy enters triode and its current falls toward zero, whatever the gate says. So a mirror only works while its output stays **above $V_{ov}$** (here $0.2\,\text{V}$). That minimum output voltage is the mirror's **compliance**, or headroom.

        [[fig:o]]

        It helps to write the condition with node voltages. $V_{DS}\ge V_{GS} - V_{TN}$ is $V_D - V_S\ge V_G - V_S - V_{TN}$; the source voltage cancels:
        $$V_D\ \ge\ V_G - V_{TN}\qquad(\text{NMOS saturation})$$
        The drain may sit at most one threshold **below the gate**. In a mirror the gate voltage is already known from the diode, so the limit on the output follows in one line.

        **Example.** In the mirror above put a resistor $R_D$ from $V_{DD} = 5\,\text{V}$ to $M_2$'s drain. The copy carries $300\,\mu\text{A}$ and the gate is at $1.2\,\text{V}$, so the drain must stay at or above $1.2 - 1 = 0.2\,\text{V}$. A larger $R_D$ drops more voltage and pushes the drain down, so the largest allowed $R_D$ puts the drain exactly at $0.2\,\text{V}$:
        $$R_{D,max} = \frac{V_{DD} - V_D}{I_{out}} = \frac{5 - 0.2}{0.3\,\text{mA}} = 16\kO$$
      `, { o: { fig: outPlot, cap: 'The copy\'s current against its own drain voltage. Below $V_{ov} = 0.2$ V (dashed) it is in triode and stops copying; above it the current is almost flat, rising slowly with slope $1/r_{ds2}$. The dot marks $V_{DS2} = V_{DS1} = 1.2$ V, where the copy is exact.' } }),
      R(md`
        ### How accurate is the copy? Channel-length modulation

        In saturation the current still rises a little with $V_{DS}$: $I_D = \tfrac12\mu_nC_{ox}\tfrac WLV_{ov}^2(1 + \lambda V_{DS})$. Repeat Step 4 with this law. The diode has $V_{DS1} = V_{GS}$; the copy has whatever drain voltage its load gives it:
        $$\frac{I_{out}}{I_{REF}} = \frac{(W/L)_2}{(W/L)_1}\cdot\frac{1 + \lambda V_{DS2}}{1 + \lambda V_{DS1}}$$

        The copy is exact only when $V_{DS2} = V_{DS1}$. **Example:** equal sizes, $\lambda = 0.05\,\text{V}^{-1}$, $V_{DS1} = V_{GS}\approx1.2\,\text{V}$ and the copy's drain at $3.2\,\text{V}$: the ratio is $\dfrac{1.16}{1.06} = 1.094$, so the copy is about 9% too large.

        This error is $r_{ds}$ at work. The flat part of the curve above has slope $\dfrac{dI_{out}}{dV_{DS2}}\approx\lambda I_{out} = \dfrac{1}{r_{ds2}}$ ([Chapter 2](#/l/bk02-clm)). The exam ignores $\lambda$ in DC problems and keeps it only as $r_{ds} = 1/(\lambda I_D)$ in small signal; we do the same from now on.
      `),
      RF(md`
        ### The small-signal picture: input side

        Now hold every DC quantity still and ask what a small signal sees. Two nodes matter: the **input** (the diode node, call it $a$) and the **output** ($M_2$'s drain). The reference $I_{REF}$ is an ideal DC current source: its small-signal current is zero, so it is an **open circuit** and does not appear.

        **Looking into node $a$.** Put a test voltage $v_t$ on node $a$ and let $i_t$ flow in. Replace $M_1$ by its model: gate and drain are both $a$, the source is ground, so $v_{gs1} = v_a = v_t$. The gate of $M_2$ also sits on $a$ but draws nothing.

        [[fig:in]]

        **KCL at $a$.** The test current leaves through $M_1$'s dependent source and through $r_{ds1}$:
        $$i_t = g_{m1}v_t + \frac{v_t}{r_{ds1}}\quad\Rightarrow\quad R_{in} = \frac{v_t}{i_t} = \frac{1}{g_{m1} + 1/r_{ds1}} = \frac1{g_{m1}}\parallel r_{ds1}\approx\frac1{g_{m1}}$$
        This is the diode-connected transistor of [Chapter 3](#/l/bk03-diode). With $g_{m1} = 1\,\text{mS}$ and $r_{ds1} = 200\kO$: $R_{in} = 1\kO\parallel200\kO = 995\,\Omega$. The input of a mirror is a low resistance: it **accepts** current easily.
      `, { in: { fig: mirrorRinModel, cap: 'Looking into the diode node $a$. The dependent source is controlled by its own terminal voltage, so it acts as a resistor $1/g_{m1}$.' } }),
      RF(md`
        ### The small-signal picture: output side

        **Looking into $M_2$'s drain.** Put a test voltage $v_t$ on the output and let $i_t$ flow into $M_2$'s drain. Replace both transistors by their models. $M_2$'s source is ground, its gate is node $a$: $v_{gs2} = v_a$.

        [[fig:out]]

        **Step 1: what drives node $a$?** Write KCL at $a$. The only things connected to it are $M_1$'s own model and $M_2$'s gate, which draws no current. The reference is open. So the currents leaving $a$ are
        $$g_{m1}v_a + \frac{v_a}{r_{ds1}} = 0\quad\Rightarrow\quad v_a\Big(g_{m1} + \frac1{r_{ds1}}\Big) = 0\quad\Rightarrow\quad v_a = 0$$
        Nothing pushes on node $a$, so it stays still.

        **Step 2: the copy.** With $v_a = 0$, $M_2$'s dependent source $g_{m2}v_a$ carries nothing. All of $i_t$ flows through $r_{ds2}$:
        $$i_t = \frac{v_t}{r_{ds2}}$$

        !!key Output resistance of a mirror
          $$R_{out} = r_{ds2} = \frac{1}{\lambda I_{out}}$$
          The copy is a current source whose only imperfection is its own $r_{ds}$. This is the "current-source load" of Chapter 4.

        **Why it has this shape.** The output voltage has no way back to the gate: the gate node is driven by the diode and loaded by nothing, and $M_2$'s gate draws no current. So changing the output voltage cannot change $v_{gs2}$; only channel-length modulation is left. Numbers: $I_{out} = 300\,\mu\text{A}$, $\lambda = 0.05\,\text{V}^{-1}$ gives $r_{ds2} = 1/(15\,\mu\text{A/V}) = 66.7\kO$.
      `, { out: { fig: mirrorRoutModel, cap: 'Looking into the copy\'s drain. Node $a$ has nothing driving it, so $v_a = 0$ and $M_2$ is just $r_{ds2}$.' } }),
      RF(md`
        ### The small-signal picture: a copied signal

        One more question, which is the bridge to [mirrors that carry signal](#/l/bk05-sigmirror). Suppose the reference current carries a small signal $i_{in}$ on top of $I_{REF}$. How much signal current comes out of the copy? Hold the output at a fixed voltage (short it to incremental ground) and find the current $i_{out}$ that $M_2$ pulls from the short.

        [[fig:ai]]

        **Step 1: the diode turns $i_{in}$ into a voltage.** KCL at $a$: $i_{in}$ flows in and leaves through $M_1$:
        $$i_{in} = g_{m1}v_a + \frac{v_a}{r_{ds1}}\quad\Rightarrow\quad v_a = \frac{i_{in}}{g_{m1} + 1/r_{ds1}}$$

        **Step 2: the copy turns it back into a current.** The output is shorted, so $r_{ds2}$ has no voltage across it; only $g_{m2}v_a$ flows:
        $$i_{out} = g_{m2}v_a = \frac{g_{m2}}{g_{m1} + 1/r_{ds1}}\,i_{in}\approx\frac{g_{m2}}{g_{m1}}\,i_{in}$$

        **Step 3: the ratio is the size ratio again.** Both devices share $V_{ov}$ and $g_m = 2I_D/V_{ov}$, so $g_{m2}/g_{m1} = I_{out}/I_{REF} = (W/L)_2/(W/L)_1$. The small-signal copy has the same ratio as the DC copy. In our example: $\dfrac{3\,\text{mS}}{1\,\text{mS} + 0.005\,\text{mS}} = 2.985$, essentially 3.
      `, { ai: { fig: mirrorAiModel, cap: 'A signal current pushed into the diode node, output shorted. The diode converts it to $v_a$; the copy converts $v_a$ back to a current.' } }),
      RF(md`
        ### A better copy: the cascode mirror

        Two things limit the simple mirror: its output resistance is only $r_{ds2}$, and its copy is exact only when $V_{DS2} = V_{DS1}$. The **cascode mirror** fixes both by stacking a second diode $M_3$ on $M_1$ and a second device $M_4$ on $M_2$, with $M_4$'s gate on $M_3$'s gate.

        [[fig:c]]

        **DC: why the copy becomes exact.** Take $M_3$ and $M_4$ identical and carrying the same current, so $V_{GS3} = V_{GS4}$. $M_4$'s gate is at $V_{GS1} + V_{GS3}$, so its source (which is $M_2$'s drain) is at $V_{GS1} + V_{GS3} - V_{GS4} = V_{GS1}$. Then $V_{DS2} = V_{GS1} = V_{DS1}$: the condition for an exact copy, now held whatever the output does.

        **Small signal: the output resistance.** With the reference ideal, nothing drives either gate node (the argument of the previous step, applied to each diode), so both gates are still. Looking into $M_4$'s drain we see a transistor with a held gate and $r_{ds2}$ under its source: the degenerated drain of [Chapter 3](#/l/bk03-degen) with $R_S = r_{ds2}$.

        [[fig:cm]]

        $$R_{out} = r_{ds4} + r_{ds2} + g_{m4}r_{ds4}r_{ds2}\approx g_{m4}r_{ds4}\cdot r_{ds2}$$
        With every device at $g_m = 1\,\text{mS}$, $r_{ds} = 200\kO$: $R_{out} = 200\kO + 200\kO + 40\,\text{M}\Omega = 40.4\,\text{M}\Omega$, two hundred times the simple mirror's $200\kO$.

        **The price: headroom.** $M_4$ must stay saturated: $V_{out}\ge V_{G4} - V_{TN} = V_{GS1} + V_{GS3} - V_{TN} = V_{TN} + 2V_{ov}$. With $V_{ov} = 0.2\,\text{V}$ that is $1.4\,\text{V}$ instead of the simple mirror's $0.2\,\text{V}$.
      `, {
        c: { fig: cascMirrorFig, cap: 'The cascode mirror: diodes $M_1$, $M_3$ on the reference side; the copy $M_2$ with the cascode device $M_4$ on the output side.' },
        cm: { fig: cascRoutModel, cap: 'Output resistance of the cascode mirror: $M_4$ with a held gate and $r_{ds2}$ under its source ($M_2$\'s gate is held too, so $M_2$ is just $r_{ds2}$).' },
      }),
      RF(md`
        ### How to recognize it, and the PMOS mirror

        A mirror is **two transistors with their gates tied, sources on the same rail, one of them with its gate tied to its own drain**. Read it in three words: the diode is the **input** (about $1/g_m$), the other is the **output** (about $r_{ds}$), and the gain is the **size ratio**.

        The PMOS mirror is the same circuit upside down. Both sources sit on $V_{DD}$; the reference current is pulled **down** out of the diode's drain; the copy **pushes** current down into its load. Everything above holds with $V_{SG}$ in place of $V_{GS}$ and $\mu_pC_{ox}$ in place of $\mu_nC_{ox}$. Only the saturation condition flips direction: $V_{SD}\ge V_{SG} - |V_{TP}|$ becomes, after the source voltage cancels,
        $$V_D\ \le\ V_G + |V_{TP}|\qquad(\text{PMOS saturation})$$
        The drain may sit at most one threshold **above the gate**.

        [[fig:p]]
      `, { p: { fig: pmirrorFig, cap: 'A PMOS mirror (sources on $V_{DD}$, on top). $I_{REF}$ is pulled out of the diode $M_1$; the copy $M_2$ pushes its current down into $R_L$.' } }),
      R(md`
        ### Worked example: one mirror, every number

        An NMOS mirror: $I_{REF} = 100\,\mu\text{A}$, $(W/L)_1 = 50$, $(W/L)_2 = 150$, $\lambda = 0.05\,\text{V}^{-1}$ (small signal only), $R_D$ from $V_{DD} = 5\,\text{V}$ to the copy's drain. Find $V_{GS}$, $I_{out}$, the largest $R_D$, and the small-signal $R_{in}$, $R_{out}$ and current gain.

        1. **Overdrive.** $V_{ov} = \sqrt{\dfrac{2(100\,\mu\text{A})}{(100\,\mu\text{A/V}^2)(50)}} = \sqrt{0.04\,\text{V}^2} = 0.2\,\text{V}$, so $V_{GS} = 1.2\,\text{V}$.
        2. **Copy.** $I_{out} = 100\,\mu\text{A}\times\dfrac{150}{50} = 300\,\mu\text{A}$.
        3. **Largest $R_D$.** Edge: $V_D = V_G - V_{TN} = 0.2\,\text{V}$, so $R_{D,max} = \dfrac{5 - 0.2}{0.3\,\text{mA}} = 16\kO$.
        4. **Small-signal parameters.** $g_{m1} = \dfrac{2(100\,\mu\text{A})}{0.2\,\text{V}} = 1\,\text{mS}$, $r_{ds1} = \dfrac{1}{(0.05)(100\,\mu\text{A})} = 200\kO$; $g_{m2} = 3\,\text{mS}$, $r_{ds2} = \dfrac{1}{(0.05)(300\,\mu\text{A})} = 66.7\kO$.
        5. **Resistances.** $R_{in} = 1\kO\parallel200\kO = 995\,\Omega$; $R_{out} = r_{ds2} = 66.7\kO$.
        6. **Current gain.** $\dfrac{i_{out}}{i_{in}} = \dfrac{3}{1 + 0.005} = 2.985\approx3$.

        !!mistake Common mistakes with mirrors
          - **The ratio upside down, or square-rooted.** The copy carries $(W/L)_2/(W/L)_1$ times the reference. Not the inverse, and not $\sqrt{\cdot}$: the overdrive is shared, so the current is *linear* in $W/L$.
          - **Forgetting to check saturation.** The ratio only holds while the copy is saturated. Always find where its drain can go ($V_D\ge V_G - V_{TN}$ for NMOS, $V_D\le V_G + |V_{TP}|$ for PMOS).
          - **$R_{out} = 1/g_{m2}$.** That is what a diode or a source looks like. The copy's gate is held by the diode, so it is a drain: $r_{ds2}$.
          - **Thinking the copies load the reference.** Gates draw no current: adding copies does not change $I_{REF}$ or $V_{GS}$.
          - **Comparing the drain with the source** in the saturation check. Compare it with the gate: that is what the mirror fixes.
      `),
      Q(md`$I_{REF} = 50\,\mu\text{A}$ flows into a diode-connected NMOS with $W/L = 20$. A second NMOS with $W/L = 60$ shares its gate and source and is saturated. What does it carry?`,
        ['$150\\,\\mu\\text{A}$', '$86.6\\,\\mu\\text{A}$', '$16.7\\,\\mu\\text{A}$', '$450\\,\\mu\\text{A}$'], 0,
        [null, 'That is $50\\sqrt3$. The two devices share $V_{ov}$, so the current is linear in $W/L$; the square root would apply if they shared the current and you asked for the overdrive.',
          'Upside down: the wider device carries more current.', 'That is the square of the ratio. Same $V_{ov}^2$ on both sides, so only the first power of $W/L$ survives.'],
        md`Same $V_{GS}$, same $V_{ov}$, so $I_{out} = I_{REF}\dfrac{(W/L)_2}{(W/L)_1} = 50\times\dfrac{60}{20} = 150\,\mu\text{A}$.`, { fig: mirrorFig }),
      Q(md`In a simple NMOS mirror with an ideal reference, what small-signal resistance do you see looking into the copy's drain?`,
        ['$r_{ds2}$', '$1/g_{m2}$', '$\\infty$', '$\\tfrac{1}{g_{m1}}\\parallel r_{ds1}$'], 0,
        [null, 'That is what you see looking into a diode or a source, where the gate–source voltage follows the test voltage. Here the copy\'s gate is held still by the diode.',
          'Only if $\\lambda = 0$. Channel-length modulation leaves $r_{ds2}$.', 'That is the input side (the diode node), not the output.'],
        md`The reference is open in small signal, so KCL at the gate node gives $v_a(g_{m1} + 1/r_{ds1}) = 0$: the gate is still, $v_{gs2} = 0$, and the copy is just $r_{ds2}$.`),
      Q(md`Why is a diode-connected NMOS always in saturation (whenever it conducts)?`,
        ['$V_{DS} = V_{GS}$, which is always more than $V_{GS} - V_{TN}$', 'Because a current source feeds it', 'Because its source is grounded', 'It is not; it is in triode when the current is small'], 0,
        [null, 'A current source sets the current, not the region. A resistor-fed diode is saturated too.', 'The source voltage cancels out of the condition; what matters is drain versus gate.', 'Saturation needs $V_{DS}\\ge V_{ov}$; with drain and gate tied, $V_{DS} = V_{ov} + V_{TN} > V_{ov}$ at any current.'],
        md`Saturation means $V_{DS}\ge V_{GS} - V_{TN}$, or in node voltages $V_D\ge V_G - V_{TN}$. With the drain tied to the gate, $V_D = V_G$, which is $V_{TN}$ more than needed.`),
      P({
        id: 'bk05-mir-copy', title: 'A first copy',
        q: md`$I_{REF} = 40\,\mu\text{A}$ flows into a diode-connected NMOS $M_1$ with $(W/L)_1 = 20$. $M_2$, with $(W/L)_2 = 80$, shares its gate and source and is saturated. $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. Find $V_{GS}$ and $I_{out}$.`,
        fig: mirrorFig,
        parts: [
          { lbl: 'V_{GS}', unit: 'V', ans: 1.2, traps: [{ v: 0.2, msg: 'That is the overdrive. $V_{GS} = V_{TN} + V_{ov}$.' }] },
          { lbl: 'I_{out}', unit: 'µA', ans: 160, traps: [{ v: 80, msg: 'That is $40\\times\\sqrt4$. Same overdrive, so the current is linear in $W/L$.' }, { v: 10, msg: 'Upside down: the wider device carries more.' }, { v: 640, msg: 'The ratio is $(W/L)_2/(W/L)_1$, not its square.' }] },
        ],
        hints: [md`$V_{ov} = \sqrt{2I_{REF}/(\mu_nC_{ox}(W/L)_1)}$.`, md`$I_{out} = I_{REF}\,(W/L)_2/(W/L)_1$.`],
        sol: md`
1. **Overdrive from the diode.** $V_{ov} = \sqrt{\dfrac{2(40\,\mu\text{A})}{(100\,\mu\text{A/V}^2)(20)}} = \sqrt{0.04\,\text{V}^2} = 0.2\,\text{V}$, so $V_{GS} = 1 + 0.2 = 1.2\,\text{V}$.
2. **The copy.** Same $V_{GS}$, same $V_{ov}$: $I_{out} = 40\,\mu\text{A}\times\dfrac{80}{20} = 160\,\mu\text{A}$.
3. **Check.** $M_2$: $\tfrac12(100\,\mu\text{A/V}^2)(80)(0.2\,\text{V})^2 = 160\,\mu\text{A}$. Consistent.`,
      }),
      P({
        id: 'bk05-mir-pmos', title: 'A PMOS mirror and its largest load',
        q: md`In the PMOS mirror, $V_{DD} = 5\,\text{V}$, $I_{REF} = 40\,\mu\text{A}$ is pulled out of the diode $M_1$ with $(W/L)_1 = 40$, and the copy $M_2$ has $(W/L)_2 = 120$. $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$. Find $V_{SG}$, the gate voltage $V_G$, the copied current $I_{out}$, and the largest $R_L$ (from $M_2$'s drain to ground) that keeps $M_2$ saturated.`,
        fig: pmirrorFig,
        parts: [
          { lbl: 'V_{SG}', unit: 'V', ans: 1.2 },
          { lbl: 'V_G', unit: 'V', ans: 3.8, traps: [{ v: 1.2, msg: 'That is $V_{SG}$. The gate sits $V_{SG}$ **below** $V_{DD}$.' }] },
          { lbl: 'I_{out}', unit: 'µA', ans: 120 },
          { lbl: 'R_{L,max}', unit: 'kΩ', ans: 40, traps: [{ v: 3.8 / 0.12, msg: 'The PMOS edge is $V_D = V_G + |V_{TP}|$, one threshold **above** the gate.' }, { v: 5 / 0.12, msg: 'The drain cannot rise all the way to $V_{DD}$.' }] },
        ],
        hints: [md`$V_{ov} = \sqrt{2I_{REF}/(\mu_pC_{ox}(W/L)_1)}$, $V_{SG} = |V_{TP}| + V_{ov}$, $V_G = V_{DD} - V_{SG}$.`, md`PMOS saturation: $V_D\le V_G + |V_{TP}|$. A bigger $R_L$ lifts the drain.`],
        sol: md`
1. **Diode.** $V_{ov} = \sqrt{\dfrac{2(40\,\mu\text{A})}{(50\,\mu\text{A/V}^2)(40)}} = \sqrt{0.04} = 0.2\,\text{V}$, so $V_{SG} = 1.2\,\text{V}$ and $V_G = 5 - 1.2 = 3.8\,\text{V}$.
2. **Copy.** $I_{out} = 40\times\dfrac{120}{40} = 120\,\mu\text{A}$, pushed down into $R_L$.
3. **Edge.** $V_D\le V_G + |V_{TP}| = 4.8\,\text{V}$. The drain voltage is $I_{out}R_L$, which grows with $R_L$, so the largest $R_L$ puts it at $4.8\,\text{V}$: $R_{L,max} = \dfrac{4.8\,\text{V}}{0.12\,\text{mA}} = 40\kO$.
4. **Check** with $V_{SD}\ge V_{ov}$: $V_{SD} = 5 - 4.8 = 0.2\,\text{V} = V_{ov}$. At the edge, as asked.`,
      }),
      P({
        id: 'bk05-mir-ss', title: 'The mirror in small signal',
        q: md`An NMOS mirror with $I_{REF} = 50\,\mu\text{A}$ (ideal), $(W/L)_1 = 25$, $(W/L)_2 = 100$, $\lambda = 0.02\,\text{V}^{-1}$. Find $R_{in}$ (looking into the diode node), $R_{out}$ (looking into the copy's drain), and the small-signal current gain $i_{out}/i_{in}$ with the output held still.`,
        fig: FG.nmirror({ look: true }),
        parts: [
          { lbl: 'R_{in}', unit: 'kΩ', ans: 1.996, accept: [2], traps: [{ v: 1000, msg: 'That is $r_{ds1}$. The diode\'s gate follows the node, so it looks like $1/g_{m1}$.' }] },
          { lbl: 'R_{out}', unit: 'kΩ', ans: 250, traps: [{ v: 0.5, msg: 'That is $1/g_{m2}$: a diode or a source. The copy\'s gate is held, so it is $r_{ds2}$.' }, { v: 1000, msg: 'That is $r_{ds1}$, at the reference current. The copy carries $200\\,\\mu$A.' }] },
          { lbl: 'i_{out}/i_{in}', unit: '', ans: 3.992, accept: [4] },
        ],
        hints: [md`DC: $V_{ov} = 0.2\,\text{V}$, $I_{D2} = 200\,\mu\text{A}$. Then $g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$ for each.`, md`$R_{in} = \tfrac1{g_{m1}}\parallel r_{ds1}$, $R_{out} = r_{ds2}$, $i_{out}/i_{in} = g_{m2}/(g_{m1} + 1/r_{ds1})$.`],
        sol: md`
1. **DC.** $V_{ov} = \sqrt{2(50)/(100\times25)} = 0.2\,\text{V}$; $I_{D2} = 50\times4 = 200\,\mu\text{A}$.
2. **Parameters.** $g_{m1} = \dfrac{2(50\,\mu\text{A})}{0.2\,\text{V}} = 0.5\,\text{mS}$, $r_{ds1} = \dfrac{1}{(0.02)(50\,\mu\text{A})} = 1\,\text{M}\Omega$; $g_{m2} = 2\,\text{mS}$, $r_{ds2} = \dfrac{1}{(0.02)(200\,\mu\text{A})} = 250\kO$.
3. **Input.** $R_{in} = 2\kO\parallel1\,\text{M}\Omega = 1.996\kO$.
4. **Output.** The ideal reference leaves the gate node undriven, so $v_a = 0$ and $R_{out} = r_{ds2} = 250\kO$.
5. **Current gain.** $\dfrac{2\,\text{mS}}{0.5\,\text{mS} + 0.001\,\text{mS}} = 3.992$: the size ratio 4, less a hair lost in $r_{ds1}$.`,
      }),
      P({
        id: 'bk05-mir-lam', title: 'How good is the copy?',
        q: md`An NMOS mirror with equal sizes copies $I_{REF} = 100\,\mu\text{A}$. Its diode sits at $V_{GS} = 1.25\,\text{V}$, $\lambda = 0.04\,\text{V}^{-1}$, and the copy's drain is held at $4.25\,\text{V}$. Using $I_D\propto(1 + \lambda V_{DS})$, find $I_{out}$. Then estimate the same error from $r_{ds2}\approx1/(\lambda I_{REF})$: $\Delta I\approx\Delta V_{DS}/r_{ds2}$.`,
        fig: mirrorFig,
        parts: [
          { lbl: 'I_{out}', unit: 'µA', ans: 111.43, traps: [{ v: 100, msg: 'That ignores $\\lambda$. The copy\'s drain is 3 V higher than the diode\'s.' }] },
          { lbl: '\\Delta I', unit: 'µA', ans: 12, accept: [11.43] },
        ],
        hints: [md`$\dfrac{I_{out}}{I_{REF}} = \dfrac{1 + \lambda V_{DS2}}{1 + \lambda V_{DS1}}$ with $V_{DS1} = V_{GS}$.`, md`$r_{ds2}\approx\dfrac{1}{(0.04)(100\,\mu\text{A})} = 250\kO$ and $\Delta V_{DS} = 3\,\text{V}$.`],
        sol: md`
1. **Exact (within the model).** $\dfrac{I_{out}}{I_{REF}} = \dfrac{1 + 0.04\times4.25}{1 + 0.04\times1.25} = \dfrac{1.17}{1.05} = 1.1143$, so $I_{out} = 111.4\,\mu\text{A}$.
2. **The $r_{ds}$ estimate.** $\Delta V_{DS} = 4.25 - 1.25 = 3\,\text{V}$ across $r_{ds2}\approx250\kO$: $\Delta I\approx\dfrac{3\,\text{V}}{250\kO} = 12\,\mu\text{A}$.
3. **Same story.** The exact difference is $11.4\,\mu\text{A}$; the estimate is 5% high because $r_{ds} = 1/(\lambda I_D)$ is itself a first-order approximation. Either way the copy is about 11% too large: this is why precision mirrors are cascoded.`,
      }),
      P({
        id: 'bk05-mir-casc', title: 'Output resistance of the cascode mirror',
        q: md`For the cascode mirror (reference ideal), type the resistance looking into $M_4$'s drain, keeping every $r_{ds}$. Use \`gm4\`, \`rds4\`, \`rds2\`. Then evaluate it with $g_{m4} = 1\,\text{mS}$, $r_{ds2} = r_{ds4} = 200\kO$, and give the lowest output voltage at which $M_4$ stays saturated when every device has $V_{ov} = 0.2\,\text{V}$.`,
        fig: cascMirrorFig,
        parts: [
          ex('rds4 + rds2 + gm4*rds4*rds2', ['gm4', 'rds4', 'rds2'], 'R_{out}'),
          { lbl: '\\text{value of } R_{out}', unit: 'MΩ', ans: 40.4, accept: [40] },
          { lbl: 'V_{out,min}', unit: 'V', ans: 1.4, traps: [{ v: 0.2, msg: 'That is the simple mirror\'s headroom. $M_4$\'s gate is a whole $V_{GS}$ higher.' }, { v: 0.4, msg: 'That is $2V_{ov}$. The cascode gate sits at $2V_{GS}$, so the limit is $V_{TN} + 2V_{ov}$.' }] },
        ],
        hints: [md`Ideal reference: both gate nodes are still. $M_2$ is then just $r_{ds2}$, sitting under $M_4$'s source.`, md`A drain with a held gate and $R_S$ under the source: $r_{ds} + R_S + g_mr_{ds}R_S$.`, md`$M_4$ saturated: $V_{out}\ge V_{G4} - V_{TN}$ with $V_{G4} = V_{GS1} + V_{GS3}$.`],
        sol: md`
1. **Which nodes move?** The reference is open in small signal. KCL at each diode node has only the diode's own model in it, so both gate voltages are zero. $M_2$ has a held gate and a grounded source: it is $r_{ds2}$.
2. **Looking into $M_4$.** A held gate and $R_S = r_{ds2}$ under the source: $R_{out} = r_{ds4} + r_{ds2} + g_{m4}r_{ds4}r_{ds2}$.
3. **Numbers.** $200\kO + 200\kO + (1\,\text{mS})(200\kO)(200\kO) = 0.4\,\text{M}\Omega + 40\,\text{M}\Omega = 40.4\,\text{M}\Omega$.
4. **Headroom.** $V_{G4} = V_{GS1} + V_{GS3} = 1.2 + 1.2 = 2.4\,\text{V}$; $M_4$ saturated needs $V_{out}\ge2.4 - 1 = 1.4\,\text{V}$.`,
      }),
      P({
        id: 'bk05-mir-steer', title: 'Two mirrors in a row', big: true,
        q: md`An NMOS mirror ($M_1$ diode with $(W/L)_1 = 10$ and $I_{REF} = 20\,\mu\text{A}$; copy $M_2$ with $(W/L)_2 = 50$) pulls its current out of a diode-connected PMOS $M_3$ with $(W/L)_3 = 100$, source on $V_{DD} = 5\,\text{V}$. A PMOS copy $M_4$ with $(W/L)_4 = 300$ pushes current into $R_L$ to ground. Course parameters. Find $I_{D2}$, the voltage at $M_3$'s drain, $I_{out}$ through $R_L$, and the largest $R_L$ for $M_4$ in saturation.`,
        fig: [
          ['rail', [1, -0.6], { n: 'V_{DD}' }], ['I', [1, -0.6], [1, 0.6], { n: 'I_{REF}', side: 'l' }], ['w', [1, 0.6], [1, 1]],
          ['nmos', [1, 2], { n: 'M_1', flip: true, dc: true }], ['gnd', [1, 3]], ['nmos', [3, 2], { n: 'M_2' }], ['gnd', [3, 3]],
          ['w', [3, -0.6], [5, -0.6]], ['rail', [4, -0.6], { n: 'V_{DD}' }],
          ['pmos', [3, 0.4], { n: 'M_3', flip: true, dc: true }], ['pmos', [5, 0.4], { n: 'M_4' }],
          ['w', [3, 1], [3, 1.4]], ['w', [5, 1.4], [5, 1.8]], ['R', [5, 1.8], [5, 3], { n: 'R_L' }], ['gnd', [5, 3]], ['node', [3, 1.2], { n: 'V_X', side: 'l' }],
        ],
        parts: [
          { lbl: 'I_{D2}', unit: 'µA', ans: 100 },
          { lbl: 'V_X', unit: 'V', ans: 3.8 },
          { lbl: 'I_{out}', unit: 'µA', ans: 300 },
          { lbl: 'R_{L,max}', unit: 'kΩ', ans: 16, traps: [{ v: 3.8 / 0.3, msg: 'PMOS edge: $V_D = V_G + |V_{TP}|$, not $V_G$.' }] },
        ],
        hints: [md`Currents first: each mirror multiplies by its own size ratio.`, md`$M_3$ is a diode carrying $I_{D2}$: its drain is its gate, $V_X = V_{DD} - V_{SG3}$.`, md`$M_4$'s edge: $V_D = V_X + 1$.`],
        sol: md`
1. **First mirror.** $I_{D2} = 20\times\dfrac{50}{10} = 100\,\mu\text{A}$. (Check $M_1$: $V_{ov} = \sqrt{2(20)/(100\times10)} = 0.2\,\text{V}$.)
2. **The PMOS diode.** $M_3$ carries $M_2$'s $100\,\mu\text{A}$: $V_{ov3} = \sqrt{\dfrac{2(100)}{50\times100}} = 0.2\,\text{V}$, $V_{SG3} = 1.2\,\text{V}$, so $V_X = 5 - 1.2 = 3.8\,\text{V}$. ($M_2$'s drain is at $3.8\,\text{V}\ge V_{G1} - V_{TN} = 0.2\,\text{V}$: saturated.)
3. **Second mirror.** $I_{out} = 100\times\dfrac{300}{100} = 300\,\mu\text{A}$.
4. **Largest $R_L$.** $V_D\le V_X + 1 = 4.8\,\text{V}$, so $R_{L,max} = \dfrac{4.8}{0.3\,\text{mA}} = 16\kO$.

**The pattern:** one reference, several mirrors in a row; each multiplies by its own size ratio, $20\times5\times3 = 300\,\mu\text{A}$. An NMOS mirror *pulls* current, a PMOS mirror *pushes* it: two mirrors turn a current around.`,
      }),
      G('bk_mirror', { need: 4 }),
      G('bk_mirrorss', { need: 3 }),
    ],
  });

  // ================================================================ 2. chains: figures
  const chainBlock = [
    ['G', [0, 0], [0, 1.8], { n: 'G_{M1}v_{in}', side: 'l' }], ['R', [1.4, 0], [1.4, 1.8], { n: 'R_{out1}' }],
    ['R', [3.2, 0], [3.2, 1.8], { n: 'R_{in2}' }],
    ['w', [0, 0], [4.6, 0]], ['w', [0, 1.8], [3.2, 1.8]], ['gnd', [1.4, 1.8]],
    ['node', [2.3, 0], { n: 'v_1', side: 'a' }],
    ['box', [4.6, -0.6], [6.4, 0.6], { n: '' }], ['txt', [5.5, 0], '$\\times A_2$'],
    ['w', [6.4, 0], [7.2, 0]], ['term', [7.2, 0], { n: 'v_{out}' }],
    ['txt', [0.7, 2.7], '$\\text{stage 1, as Norton}$'], ['txt', [4.4, 2.7], '$\\text{stage 2, seen from } v_1$'],
  ];
  const csCsFig = [
    ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_{D1}', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4),
    ['w', [1, 0], [1.8, 0], [1.8, 1], [2, 1]], ['node', [1.4, 0], { n: 'v_1', side: 'a' }],
    ['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_{D2}' }], ['nmos', [3, 1], { n: 'M_2' }], ['gnd', [3, 2]],
    ['w', [3, 0], [3.8, 0]], out([3.8, 0]),
  ];
  const csCgFig = [
    ['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_{D2}', side: 'l' }], ['w', [1, -1], [1.8, -1]], out([1.8, -1]),
    ['nmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]],
    ['w', [1, 1], [3, 1]], ['node', [2, 1], { n: 'v_1', side: 'b' }], ['rail', [3, -0.4]], ['R', [3, -0.4], [3, 1], { n: 'R_{D1}' }],
    ['nmos', [1, 2], { n: 'M_1' }], ['gnd', [1, 3]], ['w', [0, 2], [-0.6, 2], [-0.6, 2.4]], ...vin(-0.6, 2.4),
  ];
  // looking into the source of the common gate M_2, with R_D2 on its drain
  const cgRinModel = [
    ['gndu', [1, -1.6]], ['R', [1, -1.6], [1, 0], { n: 'R_{D2}', side: 'l' }],
    ...ssm(1, 0, 2, 'g_{m2}v_{gs2}', 'r_{ds2}'), ['node', [2.2, 0], { n: 'v_{out}', side: 'r' }],
    ['w', [1.6, 2], [1.6, 2.6], [3.2, 2.6]], ['V', [3.2, 2.6], [3.2, 3.8], { n: 'v_t', side: 'r' }], ['gnd', [3.2, 3.8]], ['iarr', [2.4, 2.6], 'l', { n: 'i_t' }],
    ['node', [1.6, 2.3], { n: 'v_1', side: 'l' }],
    ['txt', [4.4, 0.9], '$v_{gs2} = 0 - v_t$', { a: 'l' }],
  ];
  const csCgModel = [
    ['w', [1, 0], [5.4, 0]], ['node', [4.2, 0], { n: 'v_1', side: 'b' }],
    ...ssm(1, 0, 1.8, 'g_{m1}v_{in}', 'r_{ds1}'), ['gnd', [1.6, 1.8]],
    ['txt', [1.6, 2.6], '$M_1:\\ v_{gs1} = v_{in}$'],
    ['gndu', [3.4, -1.8]], ['R', [3.4, -1.8], [3.4, 0], { n: 'R_{D1}' }],
    ...ssm(5.4, -2.6, 0, 'g_{m2}v_{gs2}', 'r_{ds2}'),
    ['txt', [6, 0.7], '$M_2:\\ v_{gs2} = 0 - v_1$'],
    ['w', [6.6, -2.6], [8.8, -2.6]], ['gndu', [7.8, -4.2]], ['R', [7.8, -4.2], [7.8, -2.6], { n: 'R_{D2}' }], out([8.8, -2.6]),
  ];
  const csCdFig = (rl = 'R_L') => [
    ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_{D1}', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4),
    ['w', [1, 0], [1.8, 0], [1.8, 1], [2, 1]], ['node', [1.4, 0], { n: 'v_1', side: 'a' }],
    ['rail', [3, 0]], ['nmos', [3, 1], { n: 'M_2' }], ['w', [3, 2], [3.8, 2]], out([3.8, 2]),
    ['R', [3, 2], [3, 3.2], { n: rl }], ['gnd', [3, 3.2]],
  ];
  const csRLFig = [
    ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_{D1}', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4),
    ['w', [1, 0], [2.4, 0]], out([2.4, 0]), ['R', [2, 0], [2, 1.2], { n: 'R_L' }], ['gnd', [2, 1.2]],
  ];
  // exam-level chain: CS with a PMOS diode load, whose node drives the source of a common gate with a current-source load
  const chainCgLoad = [
    ['w', [1, -2.6], [3, -2.6]], ['rail', [2, -2.6], { n: 'V_{DD}' }],
    ['pmos', [3, -1.6], { n: 'M_4' }], ['acg', [2, -1.6]], ['w', [3, -0.6], [3.8, -0.6]], out([3.8, -0.6]),
    ['nmos', [3, 0.4], { n: 'M_3' }], ['acg', [2, 0.4]],
    ['pmos', [1, -1.6], { n: 'M_2', dc: true }], ['w', [1, -0.6], [1, 1.4]], ['w', [1, 1.4], [3, 1.4]], ['node', [2, 1.4], { n: 'v_1', side: 'b' }],
    ['nmos', [1, 2.4], { n: 'M_1' }], ['gnd', [1, 3.4]], ['w', [0, 2.4], [-0.6, 2.4], [-0.6, 2.8]], ...vin(-0.6, 2.8),
  ];
  // exam-level chain: CS into a stack of two PMOS diodes; the middle of the stack drives a PMOS common source
  const chainStack = [
    ['w', [1, -2], [4, -2]], ['rail', [2.5, -2], { n: 'V_{DD}' }],
    ['pmos', [1, -1], { n: 'M_3', flip: true, dc: true }], ['node', [1, 0], { n: 'v_1', side: 'l' }],
    ['pmos', [1, 1], { n: 'M_2', flip: true, dc: true }], ['node', [1, 2], { n: 'v_0', side: 'l' }],
    ['nmos', [1, 3], { n: 'M_1' }], ['gnd', [1, 4]], ['w', [0, 3], [-0.6, 3], [-0.6, 3.4]], ...vin(-0.6, 3.4),
    ['w', [1, 0], [2.6, 0], [2.6, -1], [3, -1]],
    ['pmos', [4, -1], { n: 'M_5' }], ['w', [4, 0], [4.8, 0]], out([4.8, 0]),
    ['nmos', [4, 1], { n: 'M_6' }], ['acg', [3, 1]], ['gnd', [4, 2]],
  ];

  // ================================================================ 2. gain chains and loading
  L({
    id: 'bk05-chain', title: 'Gain chains and loading', ref: 'Problem Set 6; Practice 2 #3',
    steps: [
      R(md`
        ### The question

        Many exam circuits are **two amplifiers in a row**: the output of the first, a node we call $v_1$, is the input of the second. Problem Set 6 and Practice Exam 2 #3 ask for exactly this: $A_1 = v_1/v_{in}$, $A_2 = v_{out}/v_1$, and the overall $A_v = v_{out}/v_{in}$.

        Splitting the gain at $v_1$ is always allowed. The one trap is **loading**: the second stage may pull signal current out of $v_1$ and change $A_1$. This section shows when that happens, how to account for it in one line, and why it is often not a loss at all.
      `),
      R(md`
        ### The physical picture: who draws current from $v_1$?

        Think of stage 1 as a pump that pushes a signal current $G_{M1}v_{in}$ into node $v_1$, and of everything hanging on $v_1$ as pipes that let that current drain away. The voltage at $v_1$ is the current times the resistance of all the pipes together. Stage 1's own output resistance $R_{out1}$ is one pipe. **The input of stage 2 is another.**

        What that second pipe looks like depends on **which terminal** of the next transistor touches $v_1$:
        - **A gate.** A gate is a capacitor plate: no current flows into it at low frequency. Stage 2 is invisible to stage 1, like an ideal voltmeter.
        - **A source** (a common-gate stage). The gate is held, so the transistor's current changes with $v_1$ itself: it is a fat pipe of about $1/g_m$, usually the widest one at the node.
        - **A diode.** Also about $1/g_m$.
        - **A drain with a held gate.** A thin pipe, $r_{ds}$ or more.

        **Magnitudes.** At $g_m = 1\,\text{mS}$, a source is about $1\kO$, while $R_D\parallel r_{ds}$ might be $18\kO$. Hang a source on that node and the node resistance drops almost twenty times.
      `),
      RF(md`
        ### The model: stage 1 as a Norton source, stage 2 as a resistor

        **Stage 1, seen from $v_1$.** By [Chapter 4](#/l/bk04-norton), any linear stage seen from its output is a current source $G_{M1}v_{in}$ (pulling current out of the node) in parallel with $R_{out1}$. This is exact, whatever is connected to $v_1$.

        **Stage 2, seen from $v_1$.** If $v_{in}$ reaches stage 2 only through $v_1$, then stage 2, seen from $v_1$, is a linear circuit with no source of its own. Whatever is inside it, it draws a current proportional to $v_1$: it is a resistor, $R_{in2}$. We find $R_{in2}$ with stage 2's real load in place.

        [[fig:b]]

        **Assumptions:** every transistor saturated; $v_{in}$ drives stage 1 only; $r_{ds}$ kept unless we say otherwise.
      `, { b: { fig: chainBlock, cap: 'A chain, reduced: stage 1 as its Norton equivalent, stage 2 as the resistance it presents at $v_1$, followed by its own gain $A_2 = v_{out}/v_1$.' } }),
      R(md`
        ### The derivation

        **Step 1: KCL at $v_1$.** The Norton source pulls $G_{M1}v_{in}$ out of the node; $R_{out1}$ and $R_{in2}$ carry $v_1/R_{out1}$ and $v_1/R_{in2}$ out of it. The currents leaving $v_1$ add to zero:
        $$G_{M1}v_{in} + \frac{v_1}{R_{out1}} + \frac{v_1}{R_{in2}} = 0$$

        **Step 2: solve for $v_1$.** Collect the $v_1$ terms; $1/R_{out1} + 1/R_{in2}$ is the conductance of the parallel combination:
        $$v_1 = -G_{M1}\,(R_{out1}\parallel R_{in2})\,v_{in}$$

        **Step 3: the second stage.** Once $v_1$ is known, $v_{out}$ depends only on stage 2 and its load, because $v_{in}$ has no other way to the output. So $A_2 = v_{out}/v_1$ is a property of stage 2 alone: drive its input with an ideal source $v_1$ and use the $G_MR_{out}$ method:
        $$A_2 = \frac{v_{out}}{v_1} = -G_{M2}R_{out2}$$

        **Step 4: multiply.** $\dfrac{v_{out}}{v_{in}} = \dfrac{v_1}{v_{in}}\cdot\dfrac{v_{out}}{v_1}$ is an identity.

        !!key A chain of two stages
          $$A_v = A_1A_2,\qquad A_1 = -G_{M1}\,\big(R_{out1}\parallel R_{in2}\big),\qquad A_2 = -G_{M2}R_{out2}$$
          $R_{in2}$ is what stage 2 looks like from $v_1$ (with its load in place); $A_2$ is found by driving stage 2 with an ideal $v_1$. Forgetting $R_{in2}$ is "ignoring the loading".
      `),
      R(md`
        ### Check it, and what $R_{in2}$ is for each connection

        - **A gate on $v_1$:** $R_{in2}\to\infty$ and $A_1 = -G_{M1}R_{out1}$, the stage-1 gain alone. Correct: a gate cannot load anything.
        - **$R_{in2}\to0$** (stage 2 shorts $v_1$): $A_1\to0$. Correct: a shorted node cannot move.
        - **Units:** $G_M$ in siemens times a resistance: dimensionless.

        | What touches $v_1$ | $R_{in2}$ | Where derived |
        |---|---|---|
        | a gate (CS, follower, cascode input) | $\infty$ | [the gate](#/l/bk03-gate) |
        | a source, gate held, $R_{D2}$ on the drain (CG) | $\dfrac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}}\approx\dfrac1{g_{m2}}\Big(1 + \dfrac{R_{D2}}{r_{ds2}}\Big)$ | [the source](#/l/bk03-source) |
        | a diode-connected transistor | $\dfrac1{g_m}\parallel r_{ds}$ | [the diode](#/l/bk03-diode) |
        | a drain, gate held, $R_S$ under the source | $r_{ds} + R_S + g_mr_{ds}R_S$ | [degeneration](#/l/bk03-degen) |
      `),
      RF(md`
        ### Example 1: common source into common source (no loading)

        $M_1$ is a common source with $R_{D1}$; its drain $v_1$ drives the **gate** of $M_2$, a second common source with $R_{D2}$. Every transistor: $g_m = 1\,\text{mS}$, $r_{ds} = 200\kO$; $R_{D1} = R_{D2} = 20\kO$.

        [[fig:f]]

        **Step 1: $A_1$.** $M_1$: gate at $v_{in}$, source grounded, so $G_{M1} = g_{m1}$ and $R_{out1} = R_{D1}\parallel r_{ds1}$. $M_2$'s gate draws nothing: $R_{in2} = \infty$.
        $$A_1 = -g_{m1}(R_{D1}\parallel r_{ds1}) = -(1\,\text{mS})(20\kO\parallel200\kO) = -(1\,\text{mS})(18.18\kO) = -18.18$$

        **Step 2: $A_2$.** The same kind of stage: $A_2 = -g_{m2}(R_{D2}\parallel r_{ds2}) = -18.18$.

        **Step 3: multiply.** $A_v = (-18.18)(-18.18) = +330.6$.

        **Sign in words:** $v_{in}$ up, $M_1$ pulls harder, $v_1$ down, $M_2$ pulls less, $v_{out}$ up. Two inversions: positive.
      `, { f: { fig: csCsFig, cap: 'Common source into common source: $v_1$ drives a gate.' } }),
      RF(md`
        ### Example 2: common source into common gate (strong loading)

        Same transistors and resistors, one change: $v_1$ now drives the **source** of $M_2$, whose gate is held at a bias (the triangle, an incremental ground). We will see the gain fall from $+331$ to about $-19$, and why that is not a disaster.

        [[fig:f]]

        **Step 1: $R_{in2}$, looking into $M_2$'s source.** Put a test voltage $v_t$ at the source and let $i_t$ flow in. The gate is at 0, so $v_{gs2} = -v_t$. $M_2$'s drain carries the same $i_t$ up through $R_{D2}$ (nothing else is at the drain), so $v_{out} = -i_tR_{D2}$ (current flowing *up* through $R_{D2}$ to incremental ground makes the drain negative).

        [[fig:m1]]

        KCL through the transistor: the current from drain to source is $-i_t$ (it flows up), and the model says it is $g_{m2}v_{gs2} + (v_{out} - v_t)/r_{ds2}$:
        $$-i_t = -g_{m2}v_t + \frac{-i_tR_{D2} - v_t}{r_{ds2}}$$
        Multiply by $-r_{ds2}$ and collect: $i_t(r_{ds2} + R_{D2}) = v_t(1 + g_{m2}r_{ds2})$, so
        $$R_{in2} = \frac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}} = \frac{220\kO}{201} = 1.095\kO$$
      `, {
        f: { fig: csCgFig, cap: 'Common source into common gate: $v_1$ drives a source.' },
        m1: { fig: cgRinModel, cap: 'Looking into $M_2$\'s source: the gate is held, so $v_{gs2} = -v_t$ and the transistor fights the test voltage.' },
      }),
      RF(md`
        ### Example 2, continued: the gains

        [[fig:m]]

        **Step 2: $A_1$ with the load.** At $v_1$: $R_{D1}\parallel r_{ds1} = 18.18\kO$ in parallel with $R_{in2} = 1.095\kO$, which is $1.032\kO$:
        $$A_1 = -(1\,\text{mS})(1.032\kO) = -1.032$$

        **Step 3: $A_2$.** Drive $M_2$'s source with an ideal $v_1$ and short the output: $v_{gs2} = -v_1$, and the current pulled out of the output (drain to source) is $-g_{m2}v_1 - v_1/r_{ds2}$, so $G_{M2} = -(g_{m2} + 1/r_{ds2})$, negative as for every common gate. With $v_1 = 0$ the output sees $R_{D2}\parallel r_{ds2}$:
        $$A_2 = -G_{M2}R_{out2} = (1.005\,\text{mS})(18.18\kO) = +18.27$$

        **Step 4: multiply.** $A_v = (-1.032)(18.27) = -18.86$. A full nodal solve of the circuit gives the same $-18.86$. Ignoring the loading would have given $(-18.18)(18.27) = -332$: wrong by a factor of 18.

        !!intuition The signal travels as a current
          $v_1$ hardly moves ($A_1\approx-1$), yet the overall gain is $-19$. $M_1$ pulls a current $g_{m1}v_{in}$ out of $v_1$; that current can come from $R_{D1}\parallel r_{ds1}$ ($18.2\kO$) or up through $M_2$'s source ($1.1\kO$). It takes the easy path: $\dfrac{18.18}{18.18 + 1.095} = 94\%$ of it comes through $M_2$, and therefore through $R_{D2}$. So $|A_v|\approx0.94\,g_{m1}R_{D2}$. This is the cascode idea, with a leak: a low-resistance source passes the current on to a high-resistance load.
      `, { m: { fig: csCgModel, cap: 'The small-signal model of the CS → CG chain. $M_2$ sits between $v_1$ and $v_{out}$: whatever current flows up through it leaves $v_1$.' } }),
      RF(md`
        ### Example 3: a buffer between a stage and a heavy load

        A common source with $R_{D1} = 20\kO$ must drive a load $R_L = 2\kO$. Connected directly, $R_L$ sits in parallel at the drain:
        $$A_v = -g_{m1}(R_{D1}\parallel r_{ds1}\parallel R_L) = -(1\,\text{mS})(1.80\kO) = -1.80$$

        [[fig:a]]

        Now put a **source follower** $M_2$ in between: $v_1$ drives its gate (no loading), and its source drives $R_L$.

        [[fig:b]]

        **Step 1: $A_1$.** Gate input: $A_1 = -g_{m1}(R_{D1}\parallel r_{ds1}) = -18.18$.

        **Step 2: $A_2$, the follower.** Short the output: $v_{gs2} = v_1$ and $M_2$ pushes $g_{m2}v_1$ **into** the output, so $G_{M2} = -g_{m2}$. With $v_1 = 0$ the output sees $\tfrac1{g_{m2}}\parallel r_{ds2}\parallel R_L$:
        $$A_2 = g_{m2}\Big(\frac1{g_{m2}}\parallel r_{ds2}\parallel R_L\Big) = \frac{g_{m2}(r_{ds2}\parallel R_L)}{1 + g_{m2}(r_{ds2}\parallel R_L)} = \frac{1.98}{2.98} = 0.664$$

        **Step 3: multiply.** $A_v = (-18.18)(0.664) = -12.08$, almost seven times better than $-1.80$. The follower loses a little voltage, but it shields the high-resistance node from the heavy load. That is what a buffer is for.
      `, {
        a: { fig: csRLFig, cap: 'The load straight on the drain: $R_L$ in parallel with $R_{D1}$ kills the gain.' },
        b: { fig: csCdFig(), cap: 'A source follower as a buffer: $v_1$ sees a gate, $R_L$ sees a source (about $1/g_m$).' },
      }),
      R(md`
        ### What it means, and how to recognize it

        **Find the split node, then ask one question: what touches it?** A gate: multiply the stand-alone gains. Anything else: put its resistance in parallel at the node before you compute $A_1$.

        **The sign: count inversions first.** Walk the signal from input to output and count the stages that invert:

        | Stage or block | From → to | Inverts? |
        |---|---|---|
        | common source | gate → drain | yes |
        | common gate | source → drain | no |
        | source follower | gate → source | no (gain below 1) |
        | resistor or diode divider | top → middle | no (below 1) |
        | current mirror | diode current → copy current | no |

        An odd count gives a negative $A_v$. Write the sign down before any algebra; if the algebra disagrees, the algebra is wrong.

        !!note The output resistance of the whole chain
          $A_2$ uses $R_{out2}$ found with $v_1$ grounded, because $A_2$ is a ratio. The output resistance of the **whole chain** (with $v_{in} = 0$) is found with $v_1$ looking back into $R_{out1}$, not grounded. For a gate input the two agree. For a common-gate input they differ: in Example 2 the chain's output resistance is $R_{D2}\parallel[r_{ds2} + (R_{D1}\parallel r_{ds1})(1 + g_{m2}r_{ds2})] = 19.9\kO$, against $R_{out2} = 18.2\kO$.

        !!mistake Common mistakes with chains
          - **Ignoring the loading** of a source or diode at $v_1$: $A_1$ comes out 10 to 20 times too big.
          - **Adding a load that is not there:** a gate on $v_1$ draws nothing. Do not put $1/g_m$ or $r_{ds}$ of the next transistor at $v_1$ when only its gate is connected.
          - **Using $1/g_m$ for a common-gate input whose drain load is large.** $R_{in} = (r_{ds} + R_D)/(1 + g_mr_{ds})$: with a current-source load ($R_D = r_{ds}$) it is $2/g_m$, not $1/g_m$.
          - **Computing $A_2$ with stage 1 attached.** $A_2 = v_{out}/v_1$ belongs to stage 2 alone.
      `),
      Q(md`A common-source stage's drain $v_1$ drives the **gate** of a source follower. How much does the follower load $v_1$?`,
        ['Not at all: $R_{in2} = \\infty$', 'About $1/g_{m2}$', 'About $r_{ds2}$', 'About $R_L$, the follower\'s load'], 0,
        [null, 'That is what a source (or a diode) looks like. Here $v_1$ touches a gate.', 'That is a drain with a held gate. A gate draws no current at all.', 'The follower\'s load is on its source, behind the gate; nothing of it reaches $v_1$ through a gate.'],
        md`A gate is a capacitor plate: at low frequency no current flows into it, so $R_{in2} = \infty$ and $A_1$ is the stage-1 gain alone. That is exactly why a follower makes a good buffer.`),
      Q(md`In a common source → common gate chain, $A_1 = v_1/v_{in}$ came out about $-1$. What does that tell you?`,
        ['$v_1$ is a low-resistance node: the signal is passed on as a current, and the chain can still have a large gain', 'The chain has a gain of about $-1$', 'The common gate stage is broken', 'The second stage must have a gain below 1'], 0,
        [null, 'The overall gain is $A_1A_2$, and $A_2$ of a common gate can be large: here $-1\\times18$.', 'Nothing is broken: a common gate input is meant to be about $1/g_m$.', 'A common gate has $A_2\\approx g_m(R_D\\parallel r_{ds})$, usually large.'],
        md`The common gate's source is about $1/g_m$, so the node $v_1$ barely moves, but the current $g_{m1}v_{in}$ flows through $M_2$ into $R_{D2}$, which gives the gain.`),
      Q(md`Common source → common gate → common source. What is the sign of $A_v$?`,
        ['Positive', 'Negative', 'It depends on the resistor values', 'Zero'], 0,
        [null, 'Count again: CS inverts, CG does not, CS inverts: two inversions.', 'Signs come from the stage types, not from magnitudes.', 'Nothing cancels in a single chain.'],
        md`Two inverting stages (the two common sources) and one non-inverting (the common gate): an even number of inversions, so $A_v > 0$.`),
      P({
        id: 'bk05-ch-cscs', title: 'Two common sources in a row',
        q: md`In the CS → CS chain, $M_1$ has $g_{m1} = 2\,\text{mS}$, $r_{ds1} = 50\kO$, $R_{D1} = 10\kO$; $M_2$ has $g_{m2} = 4\,\text{mS}$, $r_{ds2} = 25\kO$, $R_{D2} = 5\kO$. Find $A_1$, $A_2$ and $A_v$.`,
        fig: csCsFig,
        parts: [
          { lbl: 'A_1', unit: '', ans: -16.667, traps: [{ v: -20, msg: 'Keep $r_{ds1}$ in parallel with $R_{D1}$.' }] },
          { lbl: 'A_2', unit: '', ans: -16.667 },
          { lbl: 'A_v', unit: '', ans: 277.78, traps: [{ v: -277.78, msg: 'Two inversions: the sign is positive.' }] },
        ],
        hints: [md`$v_1$ drives a gate: no loading.`, md`$A_k = -g_{mk}(R_{Dk}\parallel r_{dsk})$.`],
        sol: md`
1. $A_1 = -(2\,\text{mS})(10\kO\parallel50\kO) = -(2\,\text{mS})(8.333\kO) = -16.67$.
2. $A_2 = -(4\,\text{mS})(5\kO\parallel25\kO) = -(4\,\text{mS})(4.167\kO) = -16.67$.
3. $A_v = (-16.67)(-16.67) = +277.8$. A gate draws no current, so the stages multiply with no correction.`,
      }),
      P({
        id: 'bk05-ch-cscg', title: 'Common source into common gate, with numbers',
        q: md`In the CS → CG chain, every transistor has $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$; $R_{D1} = 5\kO$, $R_{D2} = 10\kO$. Find $R_{in2}$, $A_1$, $A_2$ and $A_v$.`,
        fig: csCgFig,
        parts: [
          { lbl: 'R_{in2}', unit: 'Ω', ans: 547.26, accept: [500], traps: [{ v: 100000, msg: 'That is $r_{ds2}$. A source with its gate held is about $1/g_m$.' }] },
          { lbl: 'A_1', unit: '', ans: -0.98170, traps: [{ v: -9.5238, msg: 'That ignores the loading: $R_{in2}$ sits in parallel at $v_1$.' }] },
          { lbl: 'A_2', unit: '', ans: 18.273, accept: [18.18] },
          { lbl: 'A_v', unit: '', ans: -17.938, traps: [{ v: -174.03, msg: 'That is the product without loading.' }] },
        ],
        hints: [md`$R_{in2} = \dfrac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}}$.`, md`$A_1 = -g_{m1}(R_{D1}\parallel r_{ds1}\parallel R_{in2})$; $A_2 = (g_{m2} + 1/r_{ds2})(R_{D2}\parallel r_{ds2})$.`],
        sol: md`
1. $R_{in2} = \dfrac{100\kO + 10\kO}{1 + 200} = 547.3\,\Omega$ (close to $1/g_{m2} = 500\,\Omega$).
2. At $v_1$: conductances $\dfrac1{5\kO} + \dfrac1{100\kO} + \dfrac1{547.3\,\Omega} = 0.2 + 0.01 + 1.827 = 2.037\,\text{mS}$, so $490.9\,\Omega$; $A_1 = -(2\,\text{mS})(490.9\,\Omega) = -0.982$.
3. $A_2 = (2.01\,\text{mS})(10\kO\parallel100\kO) = (2.01\,\text{mS})(9.091\kO) = 18.27$.
4. $A_v = (-0.982)(18.27) = -17.94$. About 90% of $M_1$'s current comes up through $M_2$ ($\tfrac{4.762}{4.762 + 0.547}$), so $|A_v|\approx0.9\,g_{m1}R_{D2}$.`,
      }),
      P({
        id: 'bk05-ch-buffer', title: 'Is the buffer worth it?',
        q: md`A common source ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_{D1} = 10\kO$) must drive $R_L = 500\,\Omega$. Find the gain with $R_L$ directly on the drain, then with a source follower ($g_{m2} = 2\,\text{mS}$, $r_{ds2} = 100\kO$) in between: $A_1$, $A_2$, $A_v$.`,
        fig: csCdFig(),
        parts: [
          { lbl: 'A_{direct}', unit: '', ans: -0.94787 },
          { lbl: 'A_1', unit: '', ans: -18.182 },
          { lbl: 'A_2', unit: '', ans: 0.49875, traps: [{ v: 1, msg: 'A follower\'s gain is $g_mR/(1 + g_mR)$, and here $g_mR\\approx1$.' }] },
          { lbl: 'A_v', unit: '', ans: -9.0682 },
        ],
        hints: [md`Direct: $R_L$ in parallel with $R_{D1}\parallel r_{ds1}$.`, md`Follower: $A_2 = \dfrac{g_{m2}(r_{ds2}\parallel R_L)}{1 + g_{m2}(r_{ds2}\parallel R_L)}$.`],
        sol: md`
1. **Direct.** $R_{D1}\parallel r_{ds1}\parallel R_L$: $0.1 + 0.01 + 2 = 2.11\,\text{mS}$, so $473.9\,\Omega$; $A = -(2\,\text{mS})(473.9\,\Omega) = -0.948$.
2. **Buffered, stage 1.** Gate input, no loading: $A_1 = -(2\,\text{mS})(9.091\kO) = -18.18$.
3. **Stage 2.** $r_{ds2}\parallel R_L = 497.5\,\Omega$, $g_{m2}\times497.5\,\Omega = 0.995$: $A_2 = \dfrac{0.995}{1.995} = 0.499$.
4. $A_v = (-18.18)(0.499) = -9.07$: almost ten times better. The follower only halves the voltage, because its output resistance $1/g_{m2} = 500\,\Omega$ equals $R_L$; a bigger $g_{m2}$ would help further.`,
      }),
      P({
        id: 'bk05-ch-sym', title: 'The CS → CG chain, symbolically',
        q: md`For the CS → CG chain, find $A_v = v_{out}/v_{in}$ keeping every $r_{ds}$. Use \`gm1\`, \`rds1\`, \`RD1\`, \`gm2\`, \`rds2\`, \`RD2\`.`,
        fig: csCgFig,
        parts: [ex('-gm1*(RD1 || rds1 || (rds2 + RD2)/(1 + gm2*rds2))*(gm2 + 1/rds2)*(RD2 || rds2)', ['gm1', 'rds1', 'RD1', 'gm2', 'rds2', 'RD2'], 'A_v', { ranges: { RD2: [2e4, 1e5], gm2: [1e-3, 5e-3] } })],
        hints: [md`$A_1 = -g_{m1}(R_{D1}\parallel r_{ds1}\parallel R_{in2})$ with $R_{in2} = \dfrac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}}$.`, md`$A_2 = (g_{m2} + 1/r_{ds2})(R_{D2}\parallel r_{ds2})$.`],
        sol: md`
$$A_v = -g_{m1}\Big(R_{D1}\parallel r_{ds1}\parallel\frac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}}\Big)\Big(g_{m2} + \frac1{r_{ds2}}\Big)(R_{D2}\parallel r_{ds2})$$
With $g_mr_{ds}\gg1$ and $R_{D1}\parallel r_{ds1}\gg1/g_{m2}$ this is about $-g_{m1}(R_{D2}\parallel r_{ds2})$: all of $M_1$'s current reaches the output. (The box accepts the forms that use $g_{m2}$ for $g_{m2} + 1/r_{ds2}$, but keep $R_{D2}/r_{ds2}$ inside $R_{in2}$: with a large $R_{D2}$ it matters.)`,
      }),
      P({
        id: 'bk05-ch-cgload', title: 'A common gate with a current-source load', big: true,
        q: md`$M_1$ (CS) has a diode-connected PMOS $M_2$ on its drain $v_1$. $v_1$ is also the source of the common gate $M_3$ (gate held), whose drain is the output, loaded by the PMOS current source $M_4$ (gate held). (a) Find $A_1 = v_1/v_{in}$ and $A_v$ symbolically, keeping $r_{ds}$. (b) Evaluate both with every $g_m = 1\,\text{mS}$, every $r_{ds} = 200\kO$.`,
        fig: chainCgLoad,
        parts: [
          ex('-gm1*(rds1 || (1/(gm2 + 1/rds2)) || (rds3 + rds4)/(1 + gm3*rds3))', ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'rds4'], 'A_1', { ranges: { gm2: [1e-3, 3e-3], gm3: [1e-3, 3e-3] } }),
          ex('-gm1*(rds1 || (1/(gm2 + 1/rds2)) || (rds3 + rds4)/(1 + gm3*rds3))*(gm3 + 1/rds3)*(rds3 || rds4)', ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'rds4'], 'A_v', { ranges: { gm2: [1e-3, 3e-3], gm3: [1e-3, 3e-3] } }),
          { lbl: 'A_1\\ (\\text{numbers})', unit: '', ans: -0.66116, traps: [{ v: -0.5, msg: 'That uses $R_{in3} = 1/g_{m3}$. With $r_{ds4}$ on its drain, $M_3$\'s source is about $2/g_{m3}$.' }] },
          { lbl: 'A_v\\ (\\text{numbers})', unit: '', ans: -66.446, accept: [-66.67] },
        ],
        hints: [md`At $v_1$: $r_{ds1}$, the diode $\tfrac1{g_{m2}}\parallel r_{ds2}$, and $M_3$'s source $R_{in3} = \dfrac{r_{ds3} + r_{ds4}}{1 + g_{m3}r_{ds3}}$.`, md`$A_2$: drive $M_3$'s source with $v_1$: $G_{M2} = -(g_{m3} + 1/r_{ds3})$, $R_{out2} = r_{ds3}\parallel r_{ds4}$.`, md`Equal devices: $R_{in3}\approx2/g_m$, the node is $\tfrac1{g_m}\parallel\tfrac2{g_m} = \tfrac{2}{3g_m}$.`],
        sol: md`
**Recognize it first:** a common source with a diode load, whose node also feeds the **source** of a common gate. Split at $v_1$; the common gate loads it.

**$R_{in3}$.** $M_3$'s drain sees only $r_{ds4}$ (gate of $M_4$ held), so by Example 2's formula with $R_D = r_{ds4}$:
$$R_{in3} = \frac{r_{ds3} + r_{ds4}}{1 + g_{m3}r_{ds3}}\approx\frac{2}{g_{m3}}\quad(\text{equal }r_{ds})$$

**$A_1$.** Everything at $v_1$ in parallel: $A_1 = -g_{m1}\Big(r_{ds1}\parallel\big(\tfrac1{g_{m2}}\parallel r_{ds2}\big)\parallel R_{in3}\Big)$.

**$A_2$.** $G_{M2} = -(g_{m3} + 1/r_{ds3})$ and $R_{out2} = r_{ds3}\parallel r_{ds4}$, so $A_2 = (g_{m3} + 1/r_{ds3})(r_{ds3}\parallel r_{ds4})$, and $A_v = A_1A_2$.

**Numbers.** $R_{in3} = \dfrac{400\kO}{201} = 1.990\kO$. Conductances at $v_1$: $0.005 + 1.005 + 0.5025 = 1.5125\,\text{mS}$, so $661.2\,\Omega$ and $A_1 = -0.661$. $A_2 = (1.005\,\text{mS})(100\kO) = 100.5$. $A_v = -66.4$.

**The shape:** $A_v\approx-\tfrac23\cdot\tfrac{g_mr_{ds}}{2} = -\tfrac{g_mr_{ds}}{3}$. Two thirds of $M_1$'s current goes up through $M_3$ (the diode takes the rest), and the output node is $r_{ds}/2$.`,
      }),
      P({
        id: 'bk05-ch-stack', title: 'A stack of diodes as a divider', big: true,
        q: md`$M_1$ (CS) pulls on node $v_0$, which looks up into two diode-connected PMOS in series: $M_2$ (from $v_1$ down to $v_0$) and $M_3$ (from $V_{DD}$ down to $v_1$). $v_1$ drives the gate of the PMOS common source $M_5$, loaded by the NMOS current source $M_6$. $g_{m1} = g_{m2} = g_{m5} = 1\,\text{mS}$, $g_{m3} = 2\,\text{mS}$, every $r_{ds} = 200\kO$. Find $v_0/v_{in}$, $A_1 = v_1/v_{in}$, $A_2 = v_{out}/v_1$ and $A_v$.`,
        fig: chainStack,
        parts: [
          { lbl: 'v_0/v_{in}', unit: '', ans: -1.4827, accept: [-1.5] },
          { lbl: 'A_1', unit: '', ans: -0.49506, accept: [-0.5], traps: [{ v: -0.74135, msg: 'The middle of the stack is not half of $v_0$: the two diodes have different $g_m$. The divider is $\\tfrac{1/g_{m3}}{1/g_{m2} + 1/g_{m3}}$.' }] },
          { lbl: 'A_2', unit: '', ans: -100 },
          { lbl: 'A_v', unit: '', ans: 49.506, accept: [50] },
        ],
        hints: [md`Each diode is a resistor $\tfrac1{g_m}\parallel r_{ds}$. $M_5$'s gate draws nothing, so the same current flows through both diodes: the stack is two resistors in series.`, md`$v_0 = -g_{m1}\big(r_{ds1}\parallel(R_2 + R_3)\big)v_{in}$, then $v_1 = v_0\dfrac{R_3}{R_2 + R_3}$.`, md`$A_2 = -g_{m5}(r_{ds5}\parallel r_{ds6})$.`],
        sol: md`
**Recognize it first:** the stack is a voltage divider between $v_0$ and $V_{DD}$ (incremental ground), and $v_1$ only drives a gate.

1. **Diodes as resistors.** $M_2$: gate and drain at $v_0$, source at $v_1$, so its current is $g_{m2}(v_0 - v_1) + (v_0 - v_1)/r_{ds2}$: a resistor $R_2 = 1/(g_{m2} + 1/r_{ds2}) = 995\,\Omega$ between $v_0$ and $v_1$. $M_3$: $R_3 = 1/(2\,\text{mS} + 0.005\,\text{mS}) = 498.8\,\Omega$ from $v_1$ to ground.
2. **Node $v_0$.** $r_{ds1}\parallel(R_2 + R_3) = 200\kO\parallel1.494\kO = 1.483\kO$, so $v_0/v_{in} = -1.483$.
3. **Divider.** $A_1 = -1.483\times\dfrac{498.8}{1494} = -0.495$.
4. **Second stage.** $A_2 = -g_{m5}(r_{ds5}\parallel r_{ds6}) = -(1\,\text{mS})(100\kO) = -100$.
5. $A_v = (-0.495)(-100) = +49.5$.

**The shortcut:** $M_1$'s current $g_{m1}v_{in}$ flows through both diodes, so $v_1\approx-g_{m1}v_{in}\times\tfrac1{g_{m3}}$: only the diode between $v_1$ and the rail matters. $A_1\approx-g_{m1}/g_{m3} = -0.5$.`,
      }),
      G('bk_chain', { need: 4 }),
    ],
  });

  // ================================================================ 3. two paths: figures
  const pathsNorton = [
    ['w', [0, 0], [5.4, 0]], out([5.4, 0]),
    ['G', [0, 0], [0, 1.8], { n: 'G_{Ma}v_{in}', side: 'l' }], ['G', [2.2, 0], [2.2, 1.8], { n: 'G_{Mb}v_{in}', side: 'l' }],
    ['R', [4.2, 0], [4.2, 1.8], { n: 'R_{out}' }], ['w', [0, 1.8], [4.2, 1.8]], ['gnd', [2.2, 1.8]],
  ];
  const invFig = [
    ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['w', [0, -1], [-0.3, -1], [-0.3, 1], [0, 1]], ['w', [-0.3, 0], [-0.9, 0], [-0.9, 0.4]], ...vin(-0.9, 0.4),
  ];
  const fightFig = [
    ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['node', [1.7, 0], { n: 'v_1', side: 'a' }], ['w', [1, 0], [2.4, 0], [2.4, -1], [3, -1]],
    ['rail', [4, -2]], ['pmos', [4, -1], { n: 'M_4' }], ['nmos', [4, 1], { n: 'M_3' }], ['gnd', [4, 2]],
    ['w', [4, 0], [4.8, 0]], out([4.8, 0]),
    ['w', [0, 1], [-1, 1], [-1, 1.4]], ...vin(-1, 1.4),
    ['w', [-0.4, 1], [-0.4, 2.9], [2.6, 2.9], [2.6, 1], [3, 1]],
  ];
  const fightModel = [
    ['w', [0, 0], [1.2, 0]], ['node', [0.6, 0], { n: 'v_1', side: 'a' }],
    ...ssm(0, 0, 1.8, 'g_{m1}v_{in}', 'r_{ds1}'), ['gnd', [0.6, 1.8]],
    ...ssm(0, 0, -1.8, 'g_{m2}v_1', 'r_{ds2}'), ['gndu', [0.6, -1.8]],
    ['txt', [0.6, 2.6], '$M_1\\ (\\text{below}),\\ M_2\\ (\\text{diode, above})$'],
    ['w', [4.4, 0], [6.8, 0]], out([6.8, 0]),
    ...ssm(4.4, 0, 1.8, 'g_{m3}v_{in}', 'r_{ds3}'), ['gnd', [5, 1.8]],
    ...ssm(4.4, 0, -1.8, 'g_{m4}v_1', 'r_{ds4}'), ['gndu', [5, -1.8]],
    ['txt', [5, 2.6], '$M_3\\ (\\text{below}),\\ M_4\\ (\\text{above})$'],
  ];
  const degPPFig = [
    ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['nmos', [1, 1], { n: 'M_1' }], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]],
    ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['w', [0, -1], [-0.3, -1], [-0.3, 1], [0, 1]], ['w', [-0.3, 0], [-0.9, 0], [-0.9, 0.4]], ...vin(-0.9, 0.4),
  ];
  const pathsExam = [
    ['rail', [1, -2]], ['R', [1, -2], [1, -0.8], { n: 'R_{D1}', side: 'l' }], ['nmos', [1, 0.2], { n: 'M_1' }], ['gnd', [1, 1.2]],
    ['node', [1.8, -0.8], { n: 'v_1', side: 'a' }], ['w', [1, -0.8], [2.6, -0.8], [2.6, -1.5]],
    ['rail', [3.6, -2.5]], ['pmos', [3.6, -1.5], { n: 'M_3' }], ['nmos', [3.6, 0.5], { n: 'M_2' }],
    ['R', [3.6, 1.5], [3.6, 2.7], { n: 'R_S' }], ['gnd', [3.6, 2.7]], ['w', [3.6, -0.5], [4.4, -0.5]], out([4.4, -0.5]),
    ['w', [0, 0.2], [-1, 0.2], [-1, 0.6]], ...vin(-1, 0.6),
    ['w', [-0.4, 0.2], [-0.4, 3.0], [2.2, 3.0], [2.2, 0.5], [2.6, 0.5]],
  ];

  // ================================================================ 3. two paths into one output
  L({
    id: 'bk05-paths', title: 'Two paths into one output', ref: 'Problem Sets 4 #2, 6(b)(d)(e); Practice 2 #3, 4 #2',
    steps: [
      R(md`
        ### The question

        Sometimes $v_{in}$ reaches the output through **more than one transistor**. The simplest case is the CMOS push-pull stage, where $v_{in}$ drives an NMOS and a PMOS that share one drain. A harder case: $v_{in}$ drives one transistor at the output directly and, at the same time, a first stage whose output $v_1$ drives a second transistor at the same output. Problem Sets 4 and 6 and Practice Exam 2 #3 are built like this.

        We want one gain from several contributions. The answer is short: **with the output shorted, the transistor currents simply add**, each with its own sign. This section shows why, and how to get every sign right.
      `),
      RF(md`
        ### The physical picture: several hands on one rope

        Picture the output node as a bucket. Each transistor whose drain is on the output is a hose that pours current in or draws it out; the resistance to (incremental) ground is a leak. The bucket's level is the output voltage.

        Now hold the level still: short the output to ground. Then no hose can feel the level, because every transistor's current depends only on its own $v_{gs}$ (and on $v_{ds}$ through $r_{ds}$, which the short pins at zero). The hoses cannot interact through the output, so **their currents just add**. Let the output go, and the net current flows through the one leak, $R_{out}$.

        [[fig:n]]

        That is the Norton picture of [Chapter 4](#/l/bk04-norton) with the current source split into one piece per path. Each piece can **push** (current into the output) or **pull** (current out of it). Pushes and pulls fight; pulls add to pulls.
      `, { n: { fig: pathsNorton, cap: 'Two paths into one output, seen from the output: two Norton currents in parallel, one output resistance.' } }),
      R(md`
        ### The model and the derivation

        **Model.** Every transistor saturated and replaced by $g_mv_{gs}$ from drain to source with $r_{ds}$ beside it. The circuit is linear, so superposition holds. **Convention** (Chapter 4): $G_M = i_{out}/v_{in}$ with the output shorted and $i_{out}$ the current flowing from the short **into** the stage, that is, pulled out of the output node by the transistors.

        **Step 1: short the output.** Now $v_{out} = 0$. Every resistor and every $r_{ds}$ that runs from the output to an incremental ground has zero volts across it: it carries no current.

        **Step 2: what is left.** The only currents that can leave the shorted node are the dependent sources of the transistors whose drains are on it (and, for a degenerated transistor, the current its branch carries; we come back to that in Example 3).

        **Step 3: KCL at the short.** The short supplies whatever the transistors draw:
        $$i_{out} = g_{ma}v_{gs,a} + g_{mb}v_{gs,b} + \dots$$

        **Step 4: divide by $v_{in}$.** If a gate sees $v_{in}$ itself, its $v_{gs}/v_{in}$ is $1$ (source on a rail). If a gate sits on the output of an earlier stage, $v_{gs}/v_{in} = A_1$, **with $A_1$'s sign**:
        $$G_M = g_{ma}\frac{v_{gs,a}}{v_{in}} + g_{mb}\frac{v_{gs,b}}{v_{in}} + \dots$$

        **Step 5: one output resistance.** Set $v_{in} = 0$. Every internal node driven only by $v_{in}$ (like $v_1$) goes still, so every gate at the output is still. There is one output node, so there is one $R_{out} = R_{UP}\parallel R_{DN}$.

        !!key Several paths into one output
          $$A_v = -\big(G_{Ma} + G_{Mb} + \dots\big)R_{out}$$
          Each $G_{M}$ term is that path's short-circuit transconductance with its own sign; a gate driven by an earlier stage contributes $g_mA_1$. $R_{out}$ is found once, with $v_{in} = 0$.
      `),
      RF(md`
        ### Example 1: the CMOS push-pull stage (paths that add)

        $M_1$ (NMOS, source on ground) and $M_2$ (PMOS, source on $V_{DD}$) share the output drain, and **both gates are $v_{in}$**. Take $g_{m1} = g_{m2} = 1\,\text{mS}$ and $r_{ds1} = r_{ds2} = 200\kO$.

        [[fig:f]]

        **Step 1: each $v_{gs}$.** $M_1$: $v_{gs1} = v_{in} - 0 = v_{in}$. $M_2$: its source is $V_{DD}$, an incremental ground, so $v_{gs2} = v_{in} - 0 = v_{in}$ too. (The same model serves NMOS and PMOS: $g_mv_{gs}$ from drain to source.)

        **Step 2: $G_M$.** Both dependent sources point from their drain (the output) to their source, so both carry current **out of** the output: $G_M = g_{m1} + g_{m2} = 2\,\text{mS}$.

        **Step 3: $R_{out}$.** With $v_{in} = 0$ both gates are still: each transistor is its $r_{ds}$. $R_{out} = r_{ds1}\parallel r_{ds2} = 100\kO$.

        **Step 4:** $A_v = -(2\,\text{mS})(100\kO) = -200$.

        **In words:** $v_{in}$ up, the NMOS pulls down harder **and** the PMOS pushes up less. Both lower $v_{out}$. Compare a common source with a plain current-source load (the PMOS gate held): $A_v = -g_{m1}(r_{ds1}\parallel r_{ds2}) = -100$. Letting the load transistor help doubles the gain for free.
      `, { f: { fig: invFig, cap: 'The CMOS push-pull stage: both gates on $v_{in}$, both drains on the output.' } }),
      RF(md`
        ### Example 2: two paths that fight

        **Direct path:** $M_3$ (NMOS, gate at $v_{in}$) has its drain on the output. **Indirect path:** $M_1$ (NMOS, gate at $v_{in}$) pulls on node $v_1$, loaded by the diode-connected PMOS $M_2$; $v_1$ drives the gate of the PMOS $M_4$, whose drain is also on the output. Take $g_{m1} = g_{m2} = g_{m3} = 1\,\text{mS}$, $g_{m4} = 2\,\text{mS}$, every $r_{ds} = 200\kO$.

        [[fig:f]]

        **Step 1: each $v_{gs}$.** Every source is on ground or $V_{DD}$: $v_{gs1} = v_{in}$, $v_{gs2} = v_1$ (gate and drain at $v_1$), $v_{gs3} = v_{in}$, $v_{gs4} = v_1$.

        **Step 2: the model.** The two halves are joined only by $v_1$ controlling $M_4$; no wire joins them, because a gate draws no current. So the left half can be solved first, by itself.

        [[fig:m]]

        **Step 3: $A_1$ from KCL at $v_1$** (currents leaving):
        $$g_{m1}v_{in} + \frac{v_1}{r_{ds1}} + g_{m2}v_1 + \frac{v_1}{r_{ds2}} = 0\quad\Rightarrow\quad A_1 = \frac{v_1}{v_{in}} = -\frac{g_{m1}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}} = -\frac{1}{1.01} = -0.990$$
        A common source with a diode load: inverting, gain about $-g_{m1}/g_{m2}$.

        **Step 4: $G_M$.** $i_{out} = g_{m3}v_{in} + g_{m4}v_1 = (g_{m3} + g_{m4}A_1)v_{in}$:
        $$G_M = 1\,\text{mS} + (2\,\text{mS})(-0.990) = -0.980\,\text{mS}$$

        **Step 5: $R_{out}$ and the gain.** $v_{in} = 0$ makes $v_1 = 0$, so both output transistors are their $r_{ds}$: $R_{out} = 100\kO$, and $A_v = -(-0.980\,\text{mS})(100\kO) = +98.0$.

        **In words:** $v_{in}$ up, $M_3$ pulls $1\,\text{mS}\times v_{in}$ down. Meanwhile $v_1$ falls by about $v_{in}$, which turns the PMOS $M_4$ **on** harder: it pushes $2\,\text{mS}\times v_{in}$ more **into** the output. The push wins, so the gain is positive.
      `, {
        f: { fig: fightFig, cap: 'Two paths: $M_3$ directly, and $M_1$–$M_2$ then $M_4$.' },
        m: { fig: fightModel, cap: 'The small-signal model. Left: node $v_1$ ($M_1$ pulls, the diode $M_2$ acts as $1/g_{m2}$). Right: the output ($M_3$ and $M_4$). Only $v_1$ links them.' },
      }),
      R(md`
        ### Check it

        - **The paths can cancel.** $G_M = 0$ when $g_{m3} = g_{m4}\,\dfrac{g_{m1}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}$; with these numbers, $g_{m4} = 1.01\,\text{mS}$. A good test of your signs: if your formula cannot reach zero, a sign is wrong.
        - **Remove a path.** $g_{m4} = 0$ (the PMOS a plain current source) leaves $A_v = -g_{m3}(r_{ds3}\parallel r_{ds4}) = -100$, the common source with an active load.
        - **Units:** each term of $G_M$ is a transconductance ($A_1$ is dimensionless).

        !!intuition Add or fight, in one sentence
          For each transistor at the output, ask: when $v_{in}$ rises, does it take current **out of** the output or put current **in**? A gate that sees $v_{in}$ itself takes current out, NMOS or PMOS alike. A gate that sees an **inverted** copy ($A_1 < 0$) puts current in. Same direction: add. Opposite directions: subtract.
      `),
      RF(md`
        ### Example 3: a degenerated path

        Now degenerate the NMOS of the push-pull stage with $R_S = 1\kO$ under its source; everything else as in Example 1. Each path's $G_M$ is still found with the output shorted, but the degenerated branch no longer delivers $g_{m1}v_{in}$.

        [[fig:f]]

        **The degenerated branch, output shorted.** Its drain is at 0, its source at $v_s$, so its current (drain to source) is $g_{m1}(v_{in} - v_s) + (0 - v_s)/r_{ds1}$, and the same current flows down through $R_S$: $v_s/R_S$. Setting them equal and solving for $v_s$, the branch current is
        $$G_{M1} = \frac{g_{m1}}{1 + (g_{m1} + 1/r_{ds1})R_S} = \frac{1\,\text{mS}}{1 + 1.005} = 0.499\,\text{mS}$$
        ([Chapter 4](#/l/bk04-degen)). The PMOS path is unchanged: $G_{M2} = g_{m2} = 1\,\text{mS}$. Total $G_M = 1.499\,\text{mS}$.

        **$R_{out}$.** Looking down is now a degenerated drain: $R_{DN} = r_{ds1} + R_S + g_{m1}r_{ds1}R_S = 401\kO$. Looking up: $r_{ds2} = 200\kO$. $R_{out} = 200\kO\parallel401\kO = 133.4\kO$.

        **Gain.** $A_v = -(1.499\,\text{mS})(133.4\kO) = -200$. Exactly the same as without $R_S$!

        !!intuition Why degeneration did not change the gain
          For the degenerated branch, $G_{M1} = \dfrac{g_{m1}r_{ds1}}{R_{DN}}$ exactly (multiply the formula above by $r_{ds1}/r_{ds1}$). The PMOS has $G_{M2} = \dfrac{g_{m2}r_{ds2}}{R_{UP}}$ with $R_{UP} = r_{ds2}$. Then
          $$A_v = -(G_{M1} + G_{M2})\frac{R_{UP}R_{DN}}{R_{UP} + R_{DN}} = -\frac{g_{m1}r_{ds1}\,R_{UP} + g_{m2}r_{ds2}\,R_{DN}}{R_{UP} + R_{DN}}$$
          a weighted average of the two intrinsic gains. With equal intrinsic gains ($200$ each) the average is $200$ whatever $R_S$ is: degeneration takes away transconductance and gives back exactly as much output resistance.
      `, { f: { fig: degPPFig, cap: 'Push-pull with the NMOS degenerated by $R_S$.' } }),
      R(md`
        ### How to recognize it

        Look at the output node and list every transistor whose **drain** touches it. If two or more of them have gates that move with $v_{in}$ (directly, or through an earlier stage), you have several paths. Then:

        1. For each one, write $v_{gs}/v_{in}$: $1$ for a gate on $v_{in}$ with its source on a rail; $A_1$ (with sign) for a gate on an earlier stage's output; for a degenerated branch, use $\dfrac{g_m}{1 + (g_m + 1/r_{ds})R_S}$.
        2. Add them: $G_M$.
        3. One $R_{out}$, with $v_{in} = 0$.

        !!mistake Common mistakes with two paths
          - **Losing the sign of $A_1$.** A gate driven by an inverting stage contributes $g_mA_1 < 0$: it fights the direct path.
          - **Two output resistances.** There is one output node, so one $R_{out}$. Do not compute "the $R_{out}$ of each path".
          - **Leaving $v_1$ moving when you find $R_{out}$.** With $v_{in} = 0$, a node driven only by $v_{in}$ is still, so its transistor at the output is just $r_{ds}$.
          - **Flipping the PMOS sign by hand.** With $v_{gs}$ (not $v_{sg}$) and the source on a rail, a PMOS whose gate rises pulls current out of its drain, exactly like an NMOS.
      `),
      Q(md`In the CMOS push-pull stage, $v_{in}$ drives the gates of an NMOS (source on ground) and a PMOS (source on $V_{DD}$) whose drains share the output. Do their contributions to $G_M$ add or subtract?`,
        ['Add: $G_M = g_{mn} + g_{mp}$', 'Subtract: $G_M = g_{mn} - g_{mp}$', 'Only the larger one counts', 'They cancel when the devices match'], 0,
        [null, 'Gate up makes the NMOS pull down harder and the PMOS push up less: both lower $v_{out}$.', 'Both currents land in the same short; nothing is discarded.', 'They would cancel only if one gate saw an inverted copy of $v_{in}$.'],
        md`Both gates see $v_{in}$ itself, so both transistors draw current out of the output when $v_{in}$ rises: $G_M = g_{mn} + g_{mp}$, and $A_v = -(g_{mn} + g_{mp})(r_{dsn}\parallel r_{dsp})$.`, { fig: invFig }),
      Q(md`In Example 2 (the fight), you set $v_{in} = 0$ to find $R_{out}$. What does $M_4$ look like from the output?`,
        ['$r_{ds4}$: $v_1$ is still, so its gate is held', '$1/g_{m4}$', '$r_{ds4}(1 + g_{m4}r_{ds2})$', 'An open circuit'], 0,
        [null, 'That would need $M_4$\'s gate to follow the output. Its gate is $v_1$, which nothing drives once $v_{in} = 0$.', 'Its source is on $V_{DD}$, not on a resistor: nothing degenerates it.', 'Channel-length modulation leaves $r_{ds4}$.'],
        md`With $v_{in} = 0$ the only source at node $v_1$ ($g_{m1}v_{in}$) is gone and the output cannot reach $v_1$ (a gate draws no current), so $v_1 = 0$: $M_4$ is $r_{ds4}$, and $R_{out} = r_{ds3}\parallel r_{ds4}$.`),
      Q(md`A gate at the output is driven by $v_1 = A_1v_{in}$ with $A_1 = -3$, and the transistor has $g_m = 2\,\text{mS}$. What does it add to $G_M$?`,
        ['$-6\\,\\text{mS}$', '$+6\\,\\text{mS}$', '$+2\\,\\text{mS}$', '$-2/3\\,\\text{mS}$'], 0,
        [null, 'Keep the sign of $A_1$: the gate moves opposite to $v_{in}$, so the transistor pushes current in.', 'Its gate does not see $v_{in}$; it sees $A_1v_{in}$.', 'Multiply, do not divide: $g_m\\cdot v_{gs}/v_{in} = g_mA_1$.'],
        md`The contribution is $g_m\,v_{gs}/v_{in} = g_mA_1 = (2\,\text{mS})(-3) = -6\,\text{mS}$. Negative: current is pushed **into** the output when $v_{in}$ rises.`),
      P({
        id: 'bk05-pa-inv', title: 'Push-pull with unequal devices',
        q: md`In the push-pull stage, $g_{m1} = 2\,\text{mS}$, $r_{ds1} = 50\kO$ (NMOS) and $g_{m2} = 1\,\text{mS}$, $r_{ds2} = 100\kO$ (PMOS). Find $G_M$, $R_{out}$ and $A_v$.`,
        fig: invFig,
        parts: [
          { lbl: 'G_M', unit: 'mS', ans: 3, traps: [{ v: 1, msg: 'The two contributions add: both gates see $v_{in}$.' }] },
          { lbl: 'R_{out}', unit: 'kΩ', ans: 33.333 },
          { lbl: 'A_v', unit: '', ans: -100 },
        ],
        hints: [md`Both gates see $v_{in}$ and both sources sit on rails.`, md`$R_{out} = r_{ds1}\parallel r_{ds2}$.`],
        sol: md`
1. $G_M = g_{m1} + g_{m2} = 3\,\text{mS}$ (both pull current out of the output when $v_{in}$ rises).
2. $R_{out} = 50\kO\parallel100\kO = 33.3\kO$.
3. $A_v = -(3\,\text{mS})(33.3\kO) = -100$.`,
      }),
      P({
        id: 'bk05-pa-fight', title: 'The fight, with other numbers',
        q: md`In Example 2's circuit, take $g_{m1} = 1\,\text{mS}$, $g_{m2} = 2\,\text{mS}$, $g_{m3} = 2\,\text{mS}$, $g_{m4} = 1\,\text{mS}$, every $r_{ds} = 200\kO$. Find $A_1 = v_1/v_{in}$, $G_M$ and $A_v$.`,
        fig: fightFig,
        parts: [
          { lbl: 'A_1', unit: '', ans: -0.49751, accept: [-0.5] },
          { lbl: 'G_M', unit: 'mS', ans: 1.5025, accept: [1.5], traps: [{ v: 2.4975, msg: 'The PMOS path subtracts: its gate sees an inverted copy ($A_1 < 0$).' }] },
          { lbl: 'A_v', unit: '', ans: -150.25, accept: [-150] },
        ],
        hints: [md`$A_1 = -\dfrac{g_{m1}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}$.`, md`$G_M = g_{m3} + g_{m4}A_1$, $R_{out} = r_{ds3}\parallel r_{ds4} = 100\kO$.`],
        sol: md`
1. $A_1 = -\dfrac{1}{2 + 0.005 + 0.005} = -0.4975$.
2. $G_M = 2\,\text{mS} + (1\,\text{mS})(-0.4975) = 1.5025\,\text{mS}$. This time the direct path wins.
3. $A_v = -(1.5025\,\text{mS})(100\kO) = -150.2$: inverting, because $M_3$ (which inverts) wins the fight.`,
      }),
      P({
        id: 'bk05-pa-sym', title: 'The fight, symbolically',
        q: md`For Example 2's circuit, find $A_v$ keeping every $r_{ds}$. Write $A_1$ out in full.`,
        fig: fightFig,
        parts: [ex('-(gm3 - gm4*gm1/(gm2 + 1/rds1 + 1/rds2))*(rds3 || rds4)', ['gm1', 'gm2', 'gm3', 'gm4', 'rds1', 'rds2', 'rds3', 'rds4'], 'A_v', { ranges: { gm1: [1e-3, 2e-3], gm2: [2e-3, 4e-3], gm3: [4e-3, 8e-3], gm4: [1e-3, 2e-3] } })],
        hints: [md`$A_1 = -g_{m1}\big(\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}\big)$; gates draw nothing, so nothing loads $v_1$.`, md`Short the output: $i_{out} = g_{m3}v_{in} + g_{m4}v_1$.`],
        sol: md`
$G_M = g_{m3} + g_{m4}A_1 = g_{m3} - \dfrac{g_{m1}g_{m4}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}$ and $R_{out} = r_{ds3}\parallel r_{ds4}$:
$$A_v = -\Big(g_{m3} - \frac{g_{m1}g_{m4}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}\Big)(r_{ds3}\parallel r_{ds4})\approx-\Big(g_{m3} - \frac{g_{m1}g_{m4}}{g_{m2}}\Big)(r_{ds3}\parallel r_{ds4})$$
The minus sign inside the bracket is the fight.`,
      }),
      P({
        id: 'bk05-pa-zero', title: 'Make the paths cancel',
        q: md`In Example 2's circuit, $g_{m1} = g_{m2} = g_{m3} = 1\,\text{mS}$ and every $r_{ds} = 200\kO$. What $g_{m4}$ makes $A_v = 0$? And what is $A_v$ if $g_{m4}$ is twice that?`,
        fig: fightFig,
        parts: [
          { lbl: 'g_{m4}', unit: 'mS', ans: 1.01, accept: [1] },
          { lbl: 'A_v\\ (2g_{m4})', unit: '', ans: 100 },
        ],
        hints: [md`$G_M = g_{m3} + g_{m4}A_1 = 0$ with $A_1 = -1/1.01$.`, md`Doubling $g_{m4}$: $G_M = g_{m3} - 2g_{m3} = -g_{m3}$.`],
        sol: md`
1. $A_1 = -\dfrac{1\,\text{mS}}{1.01\,\text{mS}}$, so $G_M = 0$ needs $g_{m4} = g_{m3}/|A_1| = 1.01\,\text{mS}$.
2. With $2.02\,\text{mS}$: $G_M = 1 - 2.02/1.01 = -1\,\text{mS}$, so $A_v = -(-1\,\text{mS})(100\kO) = +100$. Too strong a push turns the stage non-inverting.`,
      }),
      P({
        id: 'bk05-pa-deg', title: 'Degenerated push-pull, symbolically',
        q: md`For the push-pull stage with $R_S$ under the NMOS (Example 3), type $G_M$ and $R_{out}$, keeping $r_{ds}$. Use \`gm1\`, \`rds1\`, \`gm2\`, \`rds2\`, \`RS\`.`,
        fig: degPPFig,
        parts: [
          ex('gm1/(1 + (gm1 + 1/rds1)*RS) + gm2', ['gm1', 'rds1', 'gm2', 'rds2', 'RS'], 'G_M'),
          ex('rds2 || (rds1 + RS + gm1*rds1*RS)', ['gm1', 'rds1', 'gm2', 'rds2', 'RS'], 'R_{out}'),
        ],
        hints: [md`Output shorted: the degenerated branch carries $\dfrac{g_{m1}}{1 + (g_{m1} + 1/r_{ds1})R_S}v_{in}$; the PMOS carries $g_{m2}v_{in}$.`, md`$R_{DN}$ is a degenerated drain; $R_{UP} = r_{ds2}$.`],
        sol: md`
$$G_M = \frac{g_{m1}}{1 + (g_{m1} + 1/r_{ds1})R_S} + g_{m2}\approx\frac{g_{m1}}{1 + g_{m1}R_S} + g_{m2},\qquad R_{out} = r_{ds2}\parallel\big(r_{ds1} + R_S + g_{m1}r_{ds1}R_S\big)$$
Both paths pull current out of the output when $v_{in}$ rises, so they add.`,
      }),
      P({
        id: 'bk05-pa-exam', title: 'A boosted path against a degenerated one', big: true,
        q: md`$v_{in}$ drives $M_1$, a common source with $R_{D1}$, whose drain $v_1$ drives the gate of the PMOS $M_3$ at the output. $v_{in}$ also drives $M_2$, an NMOS at the output degenerated by $R_S$. (a) Find $G_M$ and $R_{out}$ symbolically. (b) With every $g_m = 1\,\text{mS}$, every $r_{ds} = 200\kO$, $R_{D1} = 10\kO$, $R_S = 1\kO$, find $A_1$, $G_M$, $R_{out}$ and $A_v$.`,
        fig: pathsExam,
        parts: [
          ex('gm2/(1 + (gm2 + 1/rds2)*RS) - gm3*gm1*(RD1 || rds1)', ['gm1', 'rds1', 'RD1', 'gm2', 'rds2', 'RS', 'gm3'], 'G_M'),
          ex('rds3 || (rds2 + RS + gm2*rds2*RS)', ['gm2', 'rds2', 'RS', 'rds3'], 'R_{out}'),
          { lbl: 'A_1', unit: '', ans: -9.5238 },
          { lbl: 'G_M\\ (\\text{mS})', unit: 'mS', ans: -9.0251, traps: [{ v: 10.023, msg: 'The PMOS path subtracts: its gate sees $A_1v_{in}$ with $A_1 < 0$.' }] },
          { lbl: 'R_{out}\\ (\\text{k}\\Omega)', unit: 'kΩ', ans: 133.44 },
          { lbl: 'A_v', unit: '', ans: 1204.3 },
        ],
        hints: [md`$v_1$ only drives a gate: $A_1 = -g_{m1}(R_{D1}\parallel r_{ds1})$.`, md`Output shorted: $M_3$ contributes $g_{m3}A_1$, $M_2$ contributes $\dfrac{g_{m2}}{1 + (g_{m2} + 1/r_{ds2})R_S}$.`, md`$R_{out} = r_{ds3}\parallel(r_{ds2} + R_S + g_{m2}r_{ds2}R_S)$.`],
        sol: md`
**Recognize it first:** two paths into one output. The PMOS $M_3$ is driven by an inverted, amplified copy ($A_1$), so it pushes current in; the degenerated NMOS $M_2$ pulls current out. They fight, and the amplified path wins.

1. **$A_1$.** $v_1$ drives only a gate: $A_1 = -g_{m1}(R_{D1}\parallel r_{ds1}) = -(1\,\text{mS})(9.524\kO) = -9.524$.
2. **$G_M$.** $G_{M2} = \dfrac{1\,\text{mS}}{1 + 1.005} = 0.499\,\text{mS}$ and $g_{m3}A_1 = -9.524\,\text{mS}$: $G_M = -9.025\,\text{mS}$.
3. **$R_{out}$.** $R_{DN} = 200\kO + 1\kO + 200\kO = 401\kO$; $R_{out} = 200\kO\parallel401\kO = 133.4\kO$.
4. **$A_v$** $= -(-9.025\,\text{mS})(133.4\kO) = +1204$.

**Sign in words:** $v_{in}$ up, $v_1$ falls by $9.5v_{in}$, the PMOS pushes hard into the output; the NMOS pulls a little. Net: $v_{out}$ rises.`,
      }),
      G('bk_paths', { need: 4 }),
    ],
  });

  // ================================================================ 4. signal mirrors: figures
  const SG = FG.sig;
  const sigModel = [
    ['w', [0, 0], [1.2, 0]], ['node', [0.6, 0], { n: 'a', side: 'a' }],
    ...ssm(0, 0, 1.8, 'g_{m1}v_{in}', 'r_{ds1}'), ['gnd', [0.6, 1.8]],
    ...ssm(0, 0, -1.8, 'g_{m2}v_a', 'r_{ds2}'), ['gndu', [0.6, -1.8]],
    ['txt', [0.6, 2.6], '$M_1\\ (\\text{below}),\\ M_2\\ (\\text{diode, above})$'],
    ['w', [4.2, 0], [7, 0]], out([7, 0]),
    ...ssm(4.2, 0, -1.8, 'g_{m3}v_a', 'r_{ds3}'), ['gndu', [4.8, -1.8]],
    ['R', [6.2, 0], [6.2, 1.8], { n: 'R_L' }], ['gnd', [6.2, 1.8]],
    ['txt', [4.8, 1.0], '$M_3\\ (\\text{above})$'],
  ];
  const twoMirrorFig = [
    ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', flip: true, dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4), ['node', [1, 0], { n: 'a', side: 'l' }],
    ['rail', [3, -2]], ['pmos', [3, -1], { n: 'M_3' }], ['nmos', [3, 1], { n: 'M_4', flip: true, dc: true }], ['gnd', [3, 2]], ['node', [3, 0], { n: 'b', side: 'l' }],
    ['rail', [5, -2]], ['pmos', [5, -1], { n: 'M_6' }], ['acg', [4, -1], { dir: 'u' }], ['nmos', [5, 1], { n: 'M_5' }], ['gnd', [5, 2]],
    ['w', [5, 0], [5.8, 0]], out([5.8, 0]),
  ];

  // ================================================================ 4. mirrors that carry signal
  L({
    id: 'bk05-sigmirror', title: 'Mirrors that carry signal', ref: 'Practice 3 #1–2, 4 #1; Problem Set 4 #3',
    steps: [
      R(md`
        ### The question

        In [the first section](#/l/bk05-mirror) a mirror copied a DC current, and its reference was ideal, so in small signal the diode node never moved. Now let the reference **carry signal**: a transistor driven by $v_{in}$ pulls a varying current through the diode, and the copy delivers a varying current somewhere else. Practice Exam 3 #1 and #2, Practice 4 #1 and Problem Set 4 #3 are built this way.

        We want the gain of such a circuit, and above all its **sign**, which is where most mistakes happen.
      `),
      R(md`
        ### The physical picture: a current amplifier made of two converters

        A diode-connected transistor turns a current into a voltage: push $i$ into it and its gate moves by $i/g_{m1}$ (it looks like $1/g_{m1}$). A copy turns that voltage back into a current: $g_{m2}$ times it. Back to back, they form a **current amplifier** with gain $g_{m2}/g_{m1}$, which is the size ratio. The diode node is a low-resistance node: it barely moves ($10\,\mu\text{A}$ into $1/g_m = 1\kO$ is $10\,\text{mV}$), so the signal travels as a current.

        **Direction.** The copy flows **the same way through the copy** as the input flows through the diode. In an NMOS mirror, more current *into* the diode's drain means more current *into* the copy's drain. In a PMOS mirror on top, more current *pulled out* of the diode (down from its drain) means more current *pushed out* of the copy (down into its load).

        **The sign trick.** A common source *pulls* current out of its drain node. Put a PMOS mirror on top of it, and that pull reappears in another branch as a **push** into the load. A pull lowers a node; a push raises it. So a common source seen through one mirror is **non-inverting**.
      `),
      RF(md`
        ### The model and the derivation: a common source through a PMOS mirror

        $M_1$ (NMOS, gate at $v_{in}$) pulls its current through the diode-connected PMOS $M_2$ at node $a$. The PMOS $M_3$ shares $M_2$'s gate and copies the current into $R_L$; the output is $M_3$'s drain. Every transistor saturated, $r_{ds}$ kept.

        [[fig:f]]

        **Step 1: each $v_{gs}$.** The PMOS sources sit on $V_{DD}$, an incremental ground. $M_1$: $v_{gs1} = v_{in}$. $M_2$: gate and drain at $a$, so $v_{gs2} = v_a$. $M_3$: gate at $a$, so $v_{gs3} = v_a$.

        **Step 2: the model.** Node $a$ holds $M_1$ (pulling $g_{m1}v_{in}$ down) and $M_2$ (from $a$ up to incremental ground, $g_{m2}v_a$ with $r_{ds2}$). The output holds $M_3$ ($g_{m3}v_a$ from the output up to incremental ground, $r_{ds3}$) and $R_L$. The halves are joined only by $v_a$ controlling $M_3$.

        [[fig:m]]

        **Step 3: KCL at $a$** (currents leaving):
        $$g_{m1}v_{in} + \frac{v_a}{r_{ds1}} + g_{m2}v_a + \frac{v_a}{r_{ds2}} = 0\quad\Rightarrow\quad v_a = -\frac{g_{m1}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}\,v_{in}\approx-\frac{g_{m1}}{g_{m2}}v_{in}$$
        A common source with a diode load ([Chapter 4](#/l/bk04-loads)).

        **Step 4: $G_M$, output shorted.** Only $M_3$'s dependent source carries current at the shorted output, from the output (drain) up to $V_{DD}$ (source): it **pulls** $g_{m3}v_a$ out of the output.
        $$G_M = \frac{g_{m3}v_a}{v_{in}} = -\frac{g_{m1}g_{m3}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}$$
        Negative: when $v_{in}$ rises, $v_a$ falls and $M_3$ pushes current **into** the output.

        **Step 5: $R_{out}$.** With $v_{in} = 0$ nothing drives node $a$, so $v_a = 0$ and $M_3$ is $r_{ds3}$: $R_{out} = R_L\parallel r_{ds3}$.

        !!key Gain through a mirror
          $$A_v = -G_MR_{out} = +\frac{g_{m1}g_{m3}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}\,(R_L\parallel r_{ds3})\approx+g_{m1}\,\frac{(W/L)_3}{(W/L)_2}\,R_L$$
          Non-inverting: the mirror turns $M_1$'s pull into a push.
      `, {
        f: { fig: SG.cs(), cap: 'A common source $M_1$ through the PMOS mirror $M_2$–$M_3$ into $R_L$.' },
        m: { fig: sigModel, cap: 'The small-signal model: node $a$ on the left, the output on the right, joined only through $v_a$.' },
      }),
      R(md`
        ### Check it, with numbers

        $g_{m1} = g_{m2} = 1\,\text{mS}$, $M_3$ twice as wide as $M_2$ (so $g_{m3} = 2\,\text{mS}$ at the same overdrive, and $r_{ds3} = 100\kO$ at twice the current), $r_{ds1} = r_{ds2} = 200\kO$, $R_L = 10\kO$.

        1. $v_a/v_{in} = -\dfrac{1}{1 + 0.005 + 0.005} = -0.990$.
        2. $G_M = (2\,\text{mS})(-0.990) = -1.980\,\text{mS}$.
        3. $R_{out} = 10\kO\parallel100\kO = 9.09\kO$.
        4. $A_v = +(1.980\,\text{mS})(9.09\kO) = +18.0$, against the estimate $g_{m1}\cdot2\cdot R_L = 20$.

        **Limits.** $r_{ds}\to\infty$: $A_v = g_{m1}(g_{m3}/g_{m2})R_L$ exactly. Remove the mirror and put $R_L$ straight on $M_1$'s drain: $A_v = -g_{m1}R_L$. Same size, opposite sign: the mirror changes the sign and scales by the size ratio.

        **Sign in words:** $v_{in}$ up, $M_1$ pulls more out of $a$, $a$ (the PMOS gates) goes down, $M_3$'s $v_{sg}$ grows, $M_3$ pushes more current into $R_L$, $v_{out}$ up.
      `),
      RF(md`
        ### Example 2: a common gate through a mirror (inverting!)

        Now $M_1$ is a **common gate**: gate held, $v_{in}$ applied to its source through $R_S$, drain into the PMOS diode $M_2$. $M_3$ (twice $M_2$) copies into $R_L$. Same numbers as above, $R_S = 1\kO$.

        [[fig:f]]

        **Step 1: the current into $M_1$'s source.** $M_1$'s drain sees only the diode, $R_a = \tfrac1{g_{m2}}\parallel r_{ds2} = 995\,\Omega$ ($M_3$'s gate draws nothing). Looking into the source ([Chapter 3](#/l/bk03-source)): $R_{in1} = \dfrac{r_{ds1} + R_a}{1 + g_{m1}r_{ds1}} = 1.000\kO$. So a current
        $$i = \frac{v_{in}}{R_S + R_{in1}} = \frac{v_{in}}{2\kO}$$
        flows from $v_{in}$ **up** through $M_1$ into node $a$.

        **Step 2: the diode node.** That current leaves $a$ through the diode: $v_a = iR_a$. It **rises** with $v_{in}$ (opposite to the common source).

        **Step 3: $G_M$ and the gain.** Output shorted: $M_3$ pulls $g_{m3}v_a$ out of it, so $G_M = \dfrac{g_{m3}R_a}{R_S + R_{in1}} = \dfrac{(2\,\text{mS})(995\,\Omega)}{2\kO} = 0.995\,\text{mS}$, positive. $R_{out} = 9.09\kO$ again:
        $$A_v = -(0.995\,\text{mS})(9.09\kO) = -9.05\approx-\frac{g_{m3}}{g_{m2}}\cdot\frac{R_L}{R_S + 1/g_{m1}}$$

        **In words:** $v_{in}$ up, $M_1$'s $v_{gs}$ shrinks, it pulls **less** from the diode, $a$ rises, $M_3$ pushes less, $v_{out}$ falls. A common gate is non-inverting by itself; one mirror makes it inverting.
      `, { f: { fig: SG.cg(), cap: 'A common gate $M_1$ driven at its source through $R_S$, mirrored by $M_2$–$M_3$ into $R_L$.' } }),
      R(md`
        ### What it means, and how to recognize it

        A mirror is a **current amplifier with a gain equal to the size ratio and no sign change through the devices**. The voltage sign of the whole stage then depends only on where the copy delivers its current: a PMOS copy pushes into its load (the node rises when the input current grows), an NMOS copy pulls from its load (the node falls).

        **Recognize it:** a diode-connected transistor whose gate wire continues to another transistor, *and* a transistor driven by $v_{in}$ (or by an earlier stage) feeding the diode. Then: (1) find the signal current into the diode; (2) multiply by the size ratio; (3) decide push or pull at the output; (4) multiply by the output node's resistance.

        | Input device feeding the diode | Current into the diode when $v_{in}$ rises | PMOS copy into $R_L$ |
        |---|---|---|
        | common source (gate at $v_{in}$) | more | $+g_m\frac{(W/L)_3}{(W/L)_2}R_L$ |
        | common gate (source at $v_{in}$) | less | $-\frac{(W/L)_3}{(W/L)_2}\frac{R_L}{R_S + 1/g_m}$ |
        | a resistor from $v_{in}$ (current input) | depends on the side | $\pm\frac{(W/L)_{copy}}{(W/L)_{diode}}\frac{R_L}{R_S + 1/g_m}$ |

        !!mistake Common mistakes with signal mirrors
          - **Inverting twice in your head.** A common source inverts at its *own* drain; the mirror does not invert again. CS + one mirror is non-inverting.
          - **Treating the diode node as an output.** $v_a$ is small ($\approx g_{m1}/g_{m2}$ times $v_{in}$); the gain appears at the copy's output, through $R_L$.
          - **Forgetting the size ratio.** The copy carries $g_{m3}/g_{m2} = (W/L)_3/(W/L)_2$ times the diode's signal current.
          - **$R_{out}$ with the diode moving.** With $v_{in} = 0$ the diode node is still: the copy is just $r_{ds}$.
      `),
      RF(md`
        ### Example 3: turning the current around twice

        $M_1$ (CS) pulls through the PMOS diode $M_2$; the PMOS copy $M_3$ (twice $M_2$) pushes into the NMOS diode $M_4$; the NMOS copy $M_5$ (twice $M_4$) pulls from the output, whose load is the PMOS current source $M_6$ (gate held). $g_{m1} = g_{m2} = g_{m4} = 1\,\text{mS}$, $g_{m3} = g_{m5} = 2\,\text{mS}$; $r_{ds1} = r_{ds2} = r_{ds4} = 200\kO$, $r_{ds3} = r_{ds5} = r_{ds6} = 100\kO$.

        [[fig:f]]

        1. **Node $a$.** As before: $v_a = -\dfrac{g_{m1}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}v_{in} = -0.990\,v_{in}$.
        2. **Node $b$.** $M_3$ (from $b$ up to $V_{DD}$) carries $g_{m3}v_a + v_b/r_{ds3}$ out of $b$; the diode $M_4$ carries $(g_{m4} + 1/r_{ds4})v_b$ out of $b$. KCL: $v_b = -\dfrac{g_{m3}v_a}{g_{m4} + 1/r_{ds3} + 1/r_{ds4}} = -\dfrac{(2)(-0.990)}{1 + 0.01 + 0.005}v_{in} = +1.951\,v_{in}$.
        3. **Output.** $M_5$ pulls $g_{m5}v_b$ out of the shorted output: $G_M = (2\,\text{mS})(1.951) = 3.902\,\text{mS}$. $R_{out} = r_{ds5}\parallel r_{ds6} = 50\kO$.
        4. $A_v = -(3.902\,\text{mS})(50\kO) = -195$, against the estimate $-g_{m1}\cdot2\cdot2\cdot50\kO = -200$.

        **Sign:** the PMOS mirror turns the pull into a push, the NMOS mirror turns it back into a pull: inverting overall, like a plain common source with a current gain of 4.
      `, { f: { fig: twoMirrorFig, cap: 'Two mirrors in a row: PMOS $M_2$–$M_3$, then NMOS $M_4$–$M_5$, into the output loaded by the current source $M_6$.' } }),
      Q(md`A small signal current $i$ flows **into** the drain of a diode-connected NMOS $M_1$. $M_2$ (three times wider, same $L$) mirrors it. What does $M_2$ do?`,
        ['Pulls $3i$ into its drain', 'Pushes $3i$ out of its drain', 'Pulls $i/3$ into its drain', 'Pulls $\\sqrt3\\,i$ into its drain'], 0,
        [null, 'The copy flows the same way through the copy device as through the diode: into the drain.', 'Upside down: the wider device carries more.', 'Same overdrive, so the current is linear in $W/L$.'],
        md`The diode's gate rises by $i/g_{m1}$; $M_2$ has the same $v_{gs}$ and pulls $g_{m2}i/g_{m1} = 3i$ into its drain.`),
      Q(md`A common source $M_1$ feeds a PMOS mirror whose copy drives $R_L$ to ground. Why is the gain positive?`,
        ['The mirror delivers $M_1$\'s extra pull as an extra push into $R_L$', 'A PMOS has a negative $g_m$', '$M_3$ is a source follower, and followers do not invert', 'The mirror copies the voltage of node $a$ to the output'], 0,
        [null, 'Every $g_m$ is positive; the model is the same for NMOS and PMOS.', 'The output is $M_3$\'s **drain**, not its source. From node $a$, $M_3$ is a (PMOS) common source, which inverts; the overall sign is positive because node $a$ was already inverted.',
          'A mirror copies a **current**. The output voltage is the copied current times $R_L\\parallel r_{ds3}$, far larger than $v_a$.'],
        md`$v_{in}$ up: $M_1$ pulls more, the PMOS gates fall, $M_3$ pushes more into $R_L$, $v_{out}$ rises. The same story as a chain: $M_1$ with its diode load is a common source (inverting, $v_a\approx-\tfrac{g_{m1}}{g_{m2}}v_{in}$), and $M_3$ is a PMOS common source from node $a$ (inverting again). Two inversions: positive.`),
      Q(md`In the CS-through-mirror circuit, what is $R_{out}$?`,
        ['$R_L\\parallel r_{ds3}$', '$R_L\\parallel\\tfrac1{g_{m3}}$', '$R_L\\parallel r_{ds3}\\parallel\\tfrac1{g_{m2}}$', '$R_L$'], 0,
        [null, '$M_3$\'s gate is not its drain: with $v_{in} = 0$ the gate node is still, so $M_3$ is a drain with a held gate.', 'The diode $M_2$ is on the other side of a gate: no current path to the output.', 'Channel-length modulation leaves $r_{ds3}$ in parallel.'],
        md`With $v_{in} = 0$, KCL at $a$ gives $v_a = 0$, so $M_3$ is $r_{ds3}$ in parallel with $R_L$.`),
      P({
        id: 'bk05-sm-num', title: 'Through a mirror, with numbers',
        q: md`In the CS-through-mirror circuit, $g_{m1} = 2\,\text{mS}$, $r_{ds1} = 100\kO$; $M_2$: $g_{m2} = 1\,\text{mS}$, $r_{ds2} = 200\kO$; $M_3$ is three times wider than $M_2$ ($g_{m3} = 3\,\text{mS}$, $r_{ds3} = 66.7\kO$); $R_L = 5\kO$. Find $v_a/v_{in}$, $G_M$ and $A_v$.`,
        fig: SG.cs(),
        parts: [
          { lbl: 'v_a/v_{in}', unit: '', ans: -1.9704, accept: [-2] },
          { lbl: 'G_M', unit: 'mS', ans: -5.9113, traps: [{ v: 5.9113, msg: 'When $v_{in}$ rises, $M_3$ pushes current in: $G_M$ (pulled out) is negative.' }] },
          { lbl: 'A_v', unit: '', ans: 27.495, traps: [{ v: -27.495, msg: 'The mirror makes the stage non-inverting.' }] },
        ],
        hints: [md`$v_a/v_{in} = -g_{m1}/(g_{m2} + 1/r_{ds1} + 1/r_{ds2})$.`, md`$G_M = g_{m3}\,v_a/v_{in}$; $R_{out} = R_L\parallel r_{ds3}$.`],
        sol: md`
1. $v_a/v_{in} = -\dfrac{2}{1 + 0.01 + 0.005} = -1.970$.
2. $G_M = (3\,\text{mS})(-1.970) = -5.911\,\text{mS}$.
3. $R_{out} = 5\kO\parallel66.7\kO = 4.651\kO$; $A_v = +(5.911\,\text{mS})(4.651\kO) = +27.5$ (estimate $g_{m1}\cdot3\cdot R_L = 30$).`,
      }),
      P({
        id: 'bk05-sm-sym', title: 'Through a mirror, symbolically',
        q: md`Type $A_v$ for the CS-through-mirror circuit, keeping every $r_{ds}$. Use \`gm1\`, \`rds1\`, \`gm2\`, \`rds2\`, \`gm3\`, \`rds3\`, \`RL\`.`,
        fig: SG.cs(),
        parts: [ex('gm1*gm3/(gm2 + 1/rds1 + 1/rds2)*(RL || rds3)', ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'RL'], 'A_v', { ranges: { RL: [2e4, 1e5] } })],
        hints: [md`$v_a = -g_{m1}v_{in}/(g_{m2} + 1/r_{ds1} + 1/r_{ds2})$; $M_3$ pushes $-g_{m3}v_a$ into the output.`],
        sol: md`$$A_v = \frac{g_{m1}g_{m3}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}\,(R_L\parallel r_{ds3})\approx\frac{g_{m1}g_{m3}}{g_{m2}}(R_L\parallel r_{ds3})$$
Keep $r_{ds3}$ in parallel with $R_L$: nothing makes it negligible. The $1/r_{ds}$ terms next to $g_{m2}$ can go ($g_mr_{ds}\gg1$).`,
      }),
      P({
        id: 'bk05-sm-cg', title: 'A common gate through a mirror',
        q: md`In Example 2's circuit, take $g_{m1} = 2\,\text{mS}$, $r_{ds1} = 100\kO$, $g_{m2} = 1\,\text{mS}$, $r_{ds2} = 200\kO$, $M_3$ the same size as $M_2$ ($g_{m3} = 1\,\text{mS}$, $r_{ds3} = 200\kO$), $R_S = 500\,\Omega$, $R_L = 20\kO$. Find $R_{in1}$ (into $M_1$'s source), the signal current $i/v_{in}$ through $M_1$, and $A_v$.`,
        fig: SG.cg(),
        parts: [
          { lbl: 'R_{in1}', unit: 'Ω', ans: 502.46, accept: [500] },
          { lbl: 'i/v_{in}', unit: 'mS', ans: 0.99754, accept: [1] },
          { lbl: 'A_v', unit: '', ans: -18.047, accept: [-18.18], traps: [{ v: 18.047, msg: 'One mirror after a common gate makes it inverting: less current through the diode lifts its gate.' }] },
        ],
        hints: [md`$R_a = \tfrac1{g_{m2}}\parallel r_{ds2}$ is all that $M_1$'s drain sees; $R_{in1} = \dfrac{r_{ds1} + R_a}{1 + g_{m1}r_{ds1}}$.`, md`$v_a = iR_a$ rises with $v_{in}$; $A_v = -g_{m3}R_a\dfrac{i}{v_{in}}(R_L\parallel r_{ds3})$.`],
        sol: md`
1. **The diode.** $R_a = \dfrac{1}{1\,\text{mS} + 0.005\,\text{mS}} = 995\,\Omega$ is all that $M_1$'s drain sees.
2. **Into $M_1$'s source.** $R_{in1} = \dfrac{r_{ds1} + R_a}{1 + g_{m1}r_{ds1}} = \dfrac{100\kO + 0.995\kO}{201} = 502.5\,\Omega$, close to $1/g_{m1} = 500\,\Omega$.
3. **The signal current.** $\dfrac{i}{v_{in}} = \dfrac{1}{R_S + R_{in1}} = \dfrac{1}{1002.5\,\Omega} = 0.9975\,\text{mS}$.
4. **The gain.** $v_a = iR_a$ and $M_3$ pulls $g_{m3}v_a$ out of the output, which sees $20\kO\parallel200\kO = 18.18\kO$:
$$A_v = -g_{m3}R_a\frac{i}{v_{in}}(R_L\parallel r_{ds3}) = -(1\,\text{mS})(995\,\Omega)(0.9975\,\text{mS})(18.18\kO) = -18.05$$
The estimate $-\tfrac{g_{m3}}{g_{m2}}\cdot\tfrac{R_L\parallel r_{ds3}}{R_S + 1/g_{m1}} = -18.18$ is within 1%.`,
      }),
      P({
        id: 'bk05-sm-dio', title: 'A current-input amplifier',
        q: md`$v_{in}$ drives the diode-connected NMOS $M_1$ (biased by an ideal $I_B$) through a large capacitor and $R_S = 1\kO$. $M_2$, three times wider than $M_1$, shares its gate and drives $R_L = 5\kO$ to $V_{DD}$. $g_{m1} = 1\,\text{mS}$, $r_{ds1} = 200\kO$, $g_{m2} = 3\,\text{mS}$, $r_{ds2} = 66.7\kO$. Find $v_a/v_{in}$ and $A_v$.`,
        fig: SG.dio(),
        parts: [
          { lbl: 'v_a/v_{in}', unit: '', ans: 0.49875, accept: [0.5] },
          { lbl: 'A_v', unit: '', ans: -6.9593, accept: [-7.5], traps: [{ v: 6.9593, msg: '$M_2$ pulls from its drain: from node $a$ to the output it is a common source.' }] },
        ],
        hints: [md`The diode is $R_a = \tfrac1{g_{m1}}\parallel r_{ds1}$: a divider with $R_S$.`, md`$A_v = -g_{m2}\dfrac{v_a}{v_{in}}(R_L\parallel r_{ds2})$.`],
        sol: md`
1. $R_a = 995\,\Omega$, so $v_a/v_{in} = \dfrac{995}{1000 + 995} = 0.499$.
2. $R_L\parallel r_{ds2} = 5\kO\parallel66.7\kO = 4.651\kO$.
3. $A_v = -(3\,\text{mS})(0.499)(4.651\kO) = -6.96$. Seen as currents: $i = v_{in}/(R_S + 1/g_{m1})$ enters the diode, $3i$ is pulled from the output.`,
      }),
      P({
        id: 'bk05-sm-two', title: 'Two mirrors in a row, symbolically', big: true,
        q: md`For Example 3 (CS, PMOS mirror $M_2$–$M_3$, NMOS mirror $M_4$–$M_5$, current-source load $M_6$), find $A_v$ symbolically, keeping every $r_{ds}$; then give its value with Example 3's numbers.`,
        fig: twoMirrorFig,
        parts: [
          ex('-gm5*gm3*gm1/((gm2 + 1/rds1 + 1/rds2)*(gm4 + 1/rds3 + 1/rds4))*(rds5 || rds6)', ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'gm4', 'rds4', 'gm5', 'rds5', 'rds6'], 'A_v'),
          { lbl: 'A_v\\ (\\text{numbers})', unit: '', ans: -195.09, accept: [-200] },
        ],
        hints: [md`$v_a = -\dfrac{g_{m1}v_{in}}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}$.`, md`Node $b$ holds $M_3$ ($g_{m3}v_a$ and $r_{ds3}$) and the diode $M_4$: $v_b = -\dfrac{g_{m3}v_a}{g_{m4} + 1/r_{ds3} + 1/r_{ds4}}$.`, md`$G_M = g_{m5}v_b/v_{in}$, $R_{out} = r_{ds5}\parallel r_{ds6}$.`],
        sol: md`
**Recognize it first:** a common source whose current is turned around twice: a pull, then a push into $M_4$, then a pull again at the output.

$$A_v = -\frac{g_{m1}\,g_{m3}\,g_{m5}}{\big(g_{m2} + \frac1{r_{ds1}} + \frac1{r_{ds2}}\big)\big(g_{m4} + \frac1{r_{ds3}} + \frac1{r_{ds4}}\big)}\,(r_{ds5}\parallel r_{ds6})\approx-g_{m1}\frac{g_{m3}}{g_{m2}}\frac{g_{m5}}{g_{m4}}(r_{ds5}\parallel r_{ds6})$$

Numbers (Example 3): $-195$. The two size ratios multiply ($2\times2 = 4$), and the two mirrors cancel each other's sign change.`,
      }),
      G('bk_sigmirror', { need: 4 }),
    ],
  });
})();

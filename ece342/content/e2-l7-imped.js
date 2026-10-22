/* Unit 7 — terminal impedances: gate/drain/source, the diode, degeneration as an impedance scaler, cascodes and gain
   boosting, R_UP || R_DN, gates that move (the K rule), differential-pair nodes. Lectures 14–17, Problem Set 5. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2u7', l);
  const look = (p, n, side = 'r') => ['term', p, { n: `\\leftarrow ${n}`, side }];


  // ---------------------------------------------------------------- small-signal model pieces for the drawings below
  // one transistor: dependent source g_m v_gs from drain (x, yd) to source (x, ys), r_ds 1.4 units to the right
  const dev = (x, yd, ys, gl, rl, side = 'r') => [
    ['G', [x, yd], [x, ys], { n: gl, side }], ['w', [x, yd], [x + 1.4, yd]], ['R', [x + 1.4, yd], [x + 1.4, ys], { n: rl }], ['w', [x, ys], [x + 1.4, ys]],
  ];
  // test source hanging off node (x, y), to the right
  const test = (x, y, dx = 1.4) => [['w', [x, y], [x + dx, y]], ['V', [x + dx, y], [x + dx, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [x + dx, y + 1.2]], ['iarr', [x + dx * 0.55, y], 'l', { n: 'i_t' }]];
  // gate terminal with +v_gs- drawn to the source node (as in the lectures)
  const gateTo = (gx, ys, x) => [['term', [gx, 0.4], { n: 'G', side: 'a' }], ['term', [gx, 1.4]], ['w', [gx, 1.4], [gx, ys], [x, ys]], ['vlab', [gx + 0.25, 0.55], [gx + 0.25, 1.25], { n: 'v_{gs}' }]];

  // the gate, with its model: the test source only touches the gate terminal
  const gateModel = [
    ['V', [-0.2, 0.4], [-0.2, 1.6], { n: 'v_t', side: 'l' }], ['gnd', [-0.2, 1.6]], ['w', [-0.2, 0.4], [1.2, 0.4]], ['iarr', [0.5, 0.4], 'r', { n: 'i_t = 0' }],
    ['term', [1.2, 0.4], { n: 'G', side: 'a' }], ['term', [1.2, 1.4]], ['w', [1.2, 1.4], [1.2, 2], [3, 2]], ['vlab', [1.45, 0.55], [1.45, 1.25], { n: 'v_{gs}' }],
    ...dev(3, 0, 2, 'g_mv_{gs}', 'r_{ds}'), ['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]], ['w', [3, 2], [3, 2.5]], ['gnd', [3, 2.5]],
    ['txt', [3.15, -0.25], '$D$', { a: 'l' }], ['txt', [3.15, 2.3], '$S$', { a: 'l' }],
  ];
  // common-source output with v_in killed: M1 is r_ds alone, R_D goes to incremental ground
  const csOutModel = [
    ...dev(1, 0, 2, 'g_mv_{gs} = 0', 'r_{ds}', 'l'), ['gnd', [1.7, 2]], ['txt', [1.7, 2.75], '$M_1$ ($v_{in} = 0$)'],
    ['R', [3.6, -1.4], [3.6, 0], { n: 'R_D' }], ['gndu', [3.6, -1.4]], ['w', [2.4, 0], [3.6, 0]], ['node', [3.6, 0], { n: 'v_{out}', side: 'b' }],
    ...test(3.6, 0, 1.6),
  ];
  // PMOS diode: source on top (V_DD = incremental ground), drain = gate at the bottom, test source there
  const pdiodeModel = [
    ['gndu', [3, -0.6]], ['w', [3, 0], [3, -0.6]],
    ...dev(3, 2, 0, 'g_mv_{gs}', 'r_{ds}'),
    ['term', [1.2, 0.6], { n: 'S', side: 'l' }], ['w', [1.2, 0.6], [1.2, 0], [3, 0]], ['term', [1.2, 1.4], { n: 'G', side: 'l' }], ['w', [1.2, 1.4], [1.2, 2], [3, 2]],
    ['vlab', [1.45, 1.3], [1.45, 0.7], { n: 'v_{gs}' }],
    ['txt', [3.15, -0.25], '$S$', { a: 'l' }], ['txt', [3.15, 2.3], '$D$', { a: 'l' }],
    ...test(4.4, 2),
  ];
  // two diodes in series, r_ds left out
  const twoDiodeModel = [
    ['G', [2, 0], [2, 2], { n: 'g_{ma}v_{gsa}' }], ['G', [2, 2], [2, 4], { n: 'g_{mb}v_{gsb}' }], ['gnd', [2, 4]],
    ['node', [2, 2], { n: 'X', side: 'l' }], ['txt', [1.5, 1], '$M_a$: $v_{gsa} = v_t - v_X$', { a: 'r' }], ['txt', [1.5, 3], '$M_b$: $v_{gsb} = v_X$', { a: 'r' }], ['txt', [3.6, 4], '($r_{ds}$ left out)', { a: 'l' }],
    ['node', [2, 0], { n: 'v_t', side: 'a' }], ...test(2, 0, 1.8),
  ];
  // diode on a resistor, r_ds kept
  const diodeRSModel = [
    ['term', [1.2, 0.4], { n: 'G', side: 'a' }], ['w', [1.2, 0.4], [1.2, 0], [3, 0]], ['term', [1.2, 1.4]], ['w', [1.2, 1.4], [1.2, 2], [3, 2]], ['vlab', [1.45, 0.55], [1.45, 1.25], { n: 'v_{gs}' }],
    ...dev(3, 0, 2, 'g_mv_{gs}', 'r_{ds}'), ['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['gnd', [3, 3.4]],
    ['txt', [3.15, -0.25], '$D$', { a: 'l' }], ['node', [3, 2], { n: 'S', side: 'l' }],
    ...test(4.4, 0),
  ];
  // cascode, both gates held
  const cascModel = [
    ...dev(3, 0, 2, 'g_{m2}v_{gs2}', 'r_{ds2}'), ...dev(3, 2, 4, 'g_{m1}v_{gs1}', 'r_{ds1}'), ['gnd', [3.7, 4]],
    ['node', [3, 2], { n: 'X', side: 'l' }], ['txt', [2.3, 1], '$M_2$: $v_{gs2} = 0 - v_X$', { a: 'r' }], ['txt', [2.3, 3], '$M_1$: $v_{gs1} = 0 - 0 = 0$', { a: 'r' }],
    ...test(4.4, 0),
  ];
  // Practice 2 #2(a): M1 on M2 on R, gates held
  const stackFig = [
    ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['w', [1, 0], [1, -0.4]], ['term', [1, -0.4], { n: '\\downarrow R_{EQ1}', side: 'r' }],
    ['node', [1, 2], { n: 'Y', side: 'l' }], ['txt', [1.25, 2], '$\\downarrow R_Y$', { a: 'l' }],
    ['nmos', [1, 3], { n: 'M_2' }], ['acg', [0, 3]], ['R', [1, 4], [1, 5.2], { n: 'R' }], ['gnd', [1, 5.2]],
  ];
  // the regulated cascode, everything below Y lumped into R_Y
  const regFig = [
    ['nmos', [2, 1], { n: 'M_1' }], ['w', [2, 0], [2, -0.4]], ['term', [2, -0.4], { n: '\\downarrow R_{out}', side: 'r' }],
    ['node', [2, 2], { n: 'Y', side: 'r' }], ['R', [2, 2], [2, 3.4], { n: 'R_Y' }], ['gnd', [2, 3.4]],
    ['nmos', [0.4, 2.6], { n: 'M_3', flip: true }], ['gnd', [0.4, 3.6]], ['w', [1.4, 2.6], [1.4, 2], [2, 2]],
    ['w', [0.4, 1.6], [0.4, 1], [1, 1]], ['node', [0.4, 1.3], { n: 'N', side: 'l' }], ['rail', [0.4, -0.2]], ['I', [0.4, -0.2], [0.4, 1], { n: 'I_B', side: 'l' }],
  ];
  const regModel = [
    ...dev(4, 0, 2, 'g_{m1}v_{gs1}', 'r_{ds1}'), ['R', [4, 2], [4, 3.4], { n: 'R_Y' }], ['gnd', [4, 3.4]], ['node', [4, 2], { n: 'Y', side: 'l' }],
    ['txt', [4.7, -0.35], '$M_1$'],
    ...dev(0, 0, 2, 'g_{m3}v_{gs3}', 'r_{ds3}'), ['gnd', [0.7, 2]], ['node', [0.7, 0], { n: 'N', side: 'a' }], ['txt', [0.7, 2.75], '$M_3$ ($I_B$ open)'],
    ['txt', [0.7, 3.4], '$v_{gs3} = v_Y$'], ['txt', [4.7, 4.1], '$v_{gs1} = v_N - v_Y$'],
    ...test(5.4, 0),
  ];
  // Practice 1 #2(a), every transistor replaced by its model
  const nodeModel = [
    ['gndu', [3, -3.4]], ['R', [3, -3.4], [3, -2], { n: 'R_1', side: 'l' }], ['node', [3, -2], { n: 'S_2', side: 'l' }],
    ...dev(3, 0, -2, 'g_{m2}v_{gs2}', 'r_{ds2}'),
    ...dev(3, 0, 2, 'g_{m1}v_{gs1}', 'r_{ds1}'), ['R', [3, 2], [3, 3.4], { n: 'R_S', side: 'l' }], ['gnd', [3, 3.4]], ['node', [3, 2], { n: 'X', side: 'l' }],
    ['node', [3, 0], { n: 'N', side: 'l' }],
    ['txt', [6.4, -1.2], '$M_2$: $v_{gs2} = v_t - v_{S2}$', { a: 'l' }], ['txt', [6.4, 1.6], '$M_1$: $v_{gs1} = 0 - v_X$', { a: 'l' }],
    ...test(4.4, 0),
  ];
  // the K rule: the gate sits at K v_t
  const kModel = [
    ['w', [1.2, 0.4], [0.4, 0.4]], ['term', [0.4, 0.4], { n: 'v_g = K\\,v_t', side: 'l' }],
    ['term', [1.2, 0.4], { n: 'G', side: 'a' }], ['term', [1.2, 1.4]], ['w', [1.2, 1.4], [1.2, 2], [3, 2]], ['vlab', [1.45, 0.55], [1.45, 1.25], { n: 'v_{gs}' }],
    ...dev(3, 0, 2, 'g_mv_{gs}', 'r_{ds}'), ['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['gnd', [3, 3.4]],
    ['txt', [3.15, -0.25], '$D$', { a: 'l' }], ['node', [3, 2], { n: 'S', side: 'l' }],
    ...test(4.4, 0),
  ];
  // a gate on a divider across the test node
  const divFig = [
    ['w', [0, -0.4], [3, -0.4]], ['w', [3, 0], [3, -0.4]], ['node', [1.5, -0.4], { n: 'v_t', side: 'a' }],
    ['R', [0, -0.4], [0, 1], { n: 'R_a', side: 'l' }], ['R', [0, 1], [0, 2.4], { n: 'R_b', side: 'l' }], ['gnd', [0, 2.4]],
    ['w', [0, 1], [2, 1]], ['node', [1, 1], { n: 'g', side: 'a' }],
    ['nmos', [3, 1], { n: 'M' }], ['R', [3, 2], [3, 3.2], { n: 'R_S' }], ['gnd', [3, 3.2]],
    ['w', [3, -0.4], [3.8, -0.4]], ['term', [3.8, -0.4], { n: '\\leftarrow R_{EQ}', side: 'r' }],
  ];

  L({
    id: 'e2-u7-three', title: 'Gate, drain, source', ref: 'Lecture 15',
    steps: [
      R(md`
        ### What "looking into a terminal" means

        A transistor has three terminals. In a real circuit each of them is connected to other things, and every exam question about output resistance comes down to one question: **if I wiggle the voltage at this terminal, how much current flows in?**

        The recipe is always the same:
        1. Put a **test voltage source** $v_t$ on the terminal you are looking into.
        2. Put the other two terminals at **incremental ground**. "Incremental ground" means a node whose voltage does not change for small signals: real ground, $V_{DD}$, or a gate held at a fixed bias voltage. In the small-signal circuit all of those become ground.
        3. Replace the transistor by its small-signal model, find the current $i_t$ the test source pushes in, and divide: $R = v_t/i_t$.

        The two drawings above did this for the **drain** ($R_D = r_{ds}$) and the **source** ($R_S = \tfrac1{g_m}\parallel r_{ds}$). This lesson adds the third terminal, the **gate**, puts numbers on all three, and then uses them on the first real circuit: the output of a common-source amplifier.
      `),
      R(md`
        ### Looking into the gate

        Put the test source on the gate. The drain and source are at incremental ground.

        **Step 1: what is $v_{gs}$?** The gate is at $v_t$, the source is at 0, so $v_{gs} = v_t$. The dependent source is alive: it carries $g_mv_t$.

        **Step 2: where does that current flow?** From the drain to the source, and **both of those are grounded**. So $g_mv_t$ flows from ground, through the device, back to ground. None of it passes through the test source. Same for $r_{ds}$: it has zero volts across it (both ends grounded), so it carries nothing.

        **Step 3: what touches the gate?** Look at the model: **nothing is wired to the gate terminal.** The gate only *controls* the dependent source; it is an insulated plate (the gate oxide), so no current can enter it.
        $$i_t = 0$$
        $$R_G = \frac{v_t}{i_t} = \infty$$

        That is why a gate hanging on a node never adds a branch to that node. It "listens" to the node's voltage without loading it.
      `, gateModel),
      R(md`
        ### Putting numbers on all three

        Take a typical transistor: $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$.

        **Gate:** $R_G = \infty$, whatever the numbers.

        **Drain** (gate and source at incremental ground):
        $$R_D = r_{ds} = 100\kO$$

        **Source** (gate and drain at incremental ground):
        $$R_S = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{2\,\text{mS} + 0.01\,\text{mS}} = \frac{1}{2.01\,\text{mS}} = 497.5\,\Omega$$
        Compare $1/g_m = 1/(2\,\text{mS}) = 500\,\Omega$: the $r_{ds}$ in parallel changes it by half a percent. That is why we write $R_S\approx 1/g_m$.

        **The ratio:** $R_D/R_S \approx r_{ds}/(1/g_m) = g_mr_{ds} = (2\,\text{mS})(100\kO) = 200$. The drain looks **200 times bigger** than the source. The number $g_mr_{ds}$ is called the **intrinsic gain** of the transistor, and it shows up everywhere in this unit.

        !!intuition Why the source is low and the drain is high
        At the drain, the test voltage does **not** reach $v_{gs}$ (gate and source are both still), so the transistor keeps its current fixed and only the leak resistor $r_{ds}$ responds. A current source that ignores the voltage across it is a big resistance.
        At the source, the test voltage **is** $v_{gs}$ (with a minus sign). Raise the source by 1 mV and the transistor's current drops by $g_m\times1\,\text{mV}$, which must come from the test source. A small voltage producing a large current is a small resistance.
      `),
      Q(md`Gate and source at incremental ground. What do you see looking into the **drain**?`,
        ['$r_{ds}$', '$1/g_m$', '$\\infty$', '$r_{ds}\\parallel 1/g_m$'], 0,
        [null, '$1/g_m$ needs $v_{gs}$ to move with the test voltage; here $v_{gs} = 0$.', 'Only for $r_{ds}\\to\\infty$ (the ideal current source).', 'The $1/g_m$ part needs $v_{gs}\\ne0$.'],
        md`$v_{gs} = 0$, so $g_mv_{gs} = 0$ and only $r_{ds}$ connects drain to source: $R_D = r_{ds}$. A transistor with a fixed gate is a current source, imperfect by $r_{ds}$.`,
        { fig: F.drain() }),
      Q(md`Gate and drain at incremental ground. What do you see looking into the **source**?`,
        ['$\\frac1{g_m}\\parallel r_{ds}\\approx\\frac1{g_m}$', '$r_{ds}$', '$\\infty$', '$g_mr_{ds}$'], 0,
        [null, 'That ignores the controlled source, which is very much alive: $v_{gs} = -v_t$.', 'The gate is open, not the source.', 'That is a gain, not a resistance.'],
        md`$v_{gs} = -v_t$: the device carries $g_mv_t$ less current down, i.e. $g_mv_t$ flows in. $R_S = \frac1{g_m}\parallel r_{ds}$. Sources are **low**-impedance nodes (hundreds of ohms), drains are **high**-impedance nodes (tens of kΩ and up).`,
        { fig: F.source() }),
      R(md`
        ### First use: the output of a common-source amplifier

        A **common-source** amplifier has the input on the gate of $M_1$, its source grounded, and a resistor $R_D$ from the drain (the output) up to $V_{DD}$. What resistance does the output node have?

        **Step 1: turn off the input.** Output resistance is a property of the circuit with the input switched off, so set $v_{in} = 0$. Now $M_1$'s gate is at incremental ground.

        **Step 2: list what touches the output node.** Two things: $R_D$ going **up**, and $M_1$'s drain going **down**.
      `, [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [2.2, 0]], ['term', [2.2, 0], { n: 'v_{out}' }], ['nmos', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]], ['txt', [1.25, -0.55], '$\\uparrow R_{UP} = R_D$', { a: 'l' }], ['txt', [1.25, 0.45], '$\\downarrow R_{DN} = r_{ds}$', { a: 'l' }]]),
      R(md`
        **Step 3: draw the small-signal model.** $V_{DD}$ is a fixed voltage, so the top of $R_D$ goes to ground. $M_1$ has gate at 0 (input off) and source at 0, so $v_{gs} = 0$: its dependent source carries nothing and only $r_{ds}$ remains. Put the test source on the output.

        **Step 4: KCL at the output.** The test current splits between the two resistors, which both go from the output to ground:
        $$i_t = \frac{v_t}{R_D} + \frac{v_t}{r_{ds}}$$
        $$R_{out} = \frac{v_t}{i_t} = \frac{1}{1/R_D + 1/r_{ds}} = R_D\parallel r_{ds}$$

        **Example.** $R_D = 10\kO$, $r_{ds} = 100\kO$:
        $$R_{out} = \frac{10\times100}{10 + 100}\kO = \frac{1000}{110}\kO = 9.09\kO$$
        The smaller resistor dominates a parallel combination. Lecture 15 calls the two pieces $R_{UP}$ (looking up from the node) and $R_{DN}$ (looking down): $R_{out} = R_{UP}\parallel R_{DN}$. Unit 7's "node" lesson builds on exactly this.
      `, csOutModel),
      P({
        id: 'e2u7-three-num', title: 'All three looks, with numbers',
        q: md`A transistor has $g_m = 1\,\text{mS}$ and $r_{ds} = 40\kO$. Find the resistance looking into its drain (gate and source at incremental ground), the exact resistance looking into its source (gate and drain at incremental ground), and the output resistance of a common-source amplifier built from it with $R_D = 5\kO$.`,
        parts: [{ lbl: 'R_D', unit: 'kΩ', ans: 40 }, { lbl: 'R_S', unit: 'Ω', ans: 975.61 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4.4444 }],
        hints: [md`$R_S = \dfrac{1}{g_m + 1/r_{ds}}$; $1/r_{ds} = 1/40\kO = 0.025\,\text{mS}$.`, md`$R_{out} = R_D\parallel r_{ds}$.`],
        sol: md`
1. Drain: $v_{gs} = 0$, so only $r_{ds}$: $R_D = 40\kO$.
2. Source: $g_m + 1/r_{ds} = 1\,\text{mS} + 0.025\,\text{mS} = 1.025\,\text{mS}$, so $R_S = 1/1.025\,\text{mS} = 975.6\,\Omega$ (close to $1/g_m = 1\kO$).
3. Common-source output: $R_D\parallel r_{ds} = \dfrac{5\times40}{5 + 40}\kO = \dfrac{200}{45}\kO = 4.44\kO$.`,
      }),
      R(md`
        ### Summary

        | Looking into | Others at incremental ground | What $v_{gs}$ does | Result | Typical size |
        |---|---|---|---|---|
        | gate | (anything) | moves, but no current can enter the gate | $R_G = \infty$ | $\infty$ |
        | drain | gate, source | stays 0: dependent source dead | $R_D = r_{ds}$ | $100\kO$ |
        | source | gate, drain | equals $-v_t$: dependent source alive | $R_S = \tfrac1{g_m}\parallel r_{ds}\approx\tfrac1{g_m}$ | $500\,\Omega$ |

        **Drains are high, sources are low, gates are infinite.** When a node connects to a source (or a diode, next lesson), that $1/g_m$ path dominates whatever else is there. When a node only sees drains, it is a high-impedance node and its voltage swings a lot: that is where gain comes from.
      `),
    ],
  });

  L({
    id: 'e2-u7-diode', title: 'The diode-connected transistor', ref: 'Lecture 15–16',
    steps: [
      R(md`
        ### What this lesson builds

        Above, the model gave $R_{diode} = \tfrac1{g_m}\parallel r_{ds}$ for an NMOS with its gate tied to its drain. This lesson:
        1. puts a number on it and explains the name;
        2. shows a **PMOS** diode gives the same answer;
        3. stacks two diodes, and puts a diode on top of a resistor, each derived from the model;
        4. lists where diodes appear in real circuits.

        **Example.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$:
        $$R_{diode} = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{2\,\text{mS} + 0.01\,\text{mS}} = 497.5\,\Omega\approx\frac{1}{g_m} = 500\,\Omega$$

        **Why "diode".** Two reasons. It has two terminals, and it always conducts in one direction only. Since gate and drain are the same node, $V_{DS} = V_{GS}$, which is always bigger than $V_{GS} - V_{TN}$: a diode-connected transistor that conducts at all is **always in saturation**. For small signals it is simply a resistor of about $1/g_m$.
      `, F.diode()),
      R(md`
        ### A diode-connected PMOS

        Same small-signal model for NMOS and PMOS: a dependent source $g_mv_{gs}$ from **drain to source**, with $r_{ds}$ across it. For the PMOS the source is on top (on $V_{DD}$) and the drain is at the bottom, so the dependent source points **up**.

        **Step 1: node voltages.** Source on $V_{DD}$, a fixed voltage, so $v_s = 0$. Gate and drain are the same node, the test node: $v_g = v_d = v_t$.

        **Step 2: $v_{gs}$.**
        $$v_{gs} = v_g - v_s = v_t - 0 = v_t$$

        **Step 3: KCL at the drain.** The test current $i_t$ enters the drain and leaves through two paths up to $V_{DD}$: the dependent source carries $g_mv_{gs} = g_mv_t$, and $r_{ds}$ carries $v_t/r_{ds}$.
        $$i_t = g_mv_t + \frac{v_t}{r_{ds}}$$

        **Step 4: divide.**
        $$R_{diode} = \frac{v_t}{i_t} = \frac{1}{g_m + 1/r_{ds}} = \frac1{g_m}\parallel r_{ds}$$
        Identical to the NMOS. (With the large-signal picture you would talk about $v_{sg}$ instead; with the shared small-signal model the signs take care of themselves.)
      `, pdiodeModel),
      R(md`
        ### Two diodes in series

        Stack diode $M_a$ on top of diode $M_b$: $M_a$'s source is $M_b$'s drain, node $X$; $M_b$'s source is grounded. Leave out $r_{ds}$ to keep the algebra short.

        **Step 1: $v_{gs}$ of each device.**
        - $M_b$: gate = drain = $X$, source at 0. $v_{gsb} = v_X$.
        - $M_a$: gate = drain = the test node ($v_t$), source at $X$. $v_{gsa} = v_t - v_X$.

        **Step 2: the same current flows through both.** Nothing else touches $X$, so $i_t$ goes down through $M_a$ and then through $M_b$.

        **Step 3: the bottom device.** $i_t = g_{mb}v_{gsb} = g_{mb}v_X$, so
        $$v_X = \frac{i_t}{g_{mb}}$$

        **Step 4: the top device.** $i_t = g_{ma}v_{gsa} = g_{ma}(v_t - v_X)$, so
        $$v_t - v_X = \frac{i_t}{g_{ma}}$$

        **Step 5: add the two.**
        $$v_t = \frac{i_t}{g_{ma}} + \frac{i_t}{g_{mb}}\quad\Rightarrow\quad R = \frac{1}{g_{ma}} + \frac{1}{g_{mb}}$$
        Two resistors in series. Because each device's gate follows its own drain, each one just looks like its own $1/g_m$.
      `, twoDiodeModel),
      Q(md`Two diode-connected NMOS are stacked in series between a node and ground; $M_a$ has $g_m = 2\,\text{mS}$, $M_b$ has $g_m = 5\,\text{mS}$. Ignoring $r_{ds}$, what resistance does the node see?`,
        ['$700\\,\\Omega$', '$143\\,\\Omega$', '$500\\,\\Omega$', '$7\\,\\text{k}\\Omega$'], 0,
        [null, 'That is the two in parallel; stacked devices are in series.', 'That is only the 2 mS device.', 'Check the units: $1/(2\\,\\text{mS}) = 500\\,\\Omega$.'],
        md`Series: $\tfrac1{g_{ma}} + \tfrac1{g_{mb}} = 500 + 200 = 700\,\Omega$. (Problem Set 6(a) uses exactly this: $R_{DN1} = \tfrac1{g_{m2}} + \tfrac1{g_{m3}}$, and the middle node is a divider of the two.)`),
      R(md`
        ### A diode on top of a resistor

        Now the diode's source is not grounded: a resistor $R_S$ sits between the source and ground. Again leave out $r_{ds}$ (the problem below keeps it).

        **Step 1: node voltages.** Gate = drain = $v_t$. All of $i_t$ flows down through the device and then through $R_S$, so the source sits at $v_s = i_tR_S$.

        **Step 2: $v_{gs}$.**
        $$v_{gs} = v_t - i_tR_S$$

        **Step 3: the device current.** It equals $i_t$:
        $$i_t = g_m(v_t - i_tR_S)$$

        **Step 4: solve for $v_t$.** Divide by $g_m$: $\dfrac{i_t}{g_m} = v_t - i_tR_S$. Move the $R_S$ term over:
        $$v_t = i_tR_S + \frac{i_t}{g_m} = i_t\Big(R_S + \frac{1}{g_m}\Big)$$
        $$R = R_S + \frac{1}{g_m}$$

        **Example.** $g_m = 2\,\text{mS}$, $R_S = 2\kO$: $R = 2\kO + 0.5\kO = 2.5\kO$. Keeping $r_{ds} = 100\kO$ changes the $0.5\kO$ to $0.4975\kO$.

        !!intuition No magnification here
        In the next lesson a resistor under a **held** gate gets multiplied by $g_mr_{ds}$. Here the gate is **not** held: it rides up with the drain, so the transistor never fights the current. The diode simply adds its $1/g_m$ in series with $R_S$.
      `, diodeRSModel),
      P({
        id: 'e2u7-diode-rs', title: 'A diode on a resistor',
        q: md`A diode-connected NMOS sits on top of $R_S$. Find the resistance looking in (keep $r_{ds}$). The answer box accepts the exact form or the $g_mr_{ds}\gg1$ approximation.`,
        fig: F.diodeRS(),
        parts: [E2.ex('RS + 1/(gm + 1/rds)', ['gm', 'rds', 'RS'], 'R_{DN}')],
        hints: [md`Gate and drain are the same node, so $v_{gs} = v_t - v_s$, and $v_s = i_tR_S$.`, md`$i_t = (g_m + g_{ds})(v_t - v_s)$.`],
        sol: md`$i_t = (g_m + \tfrac1{r_{ds}})(v_t - i_tR_S)\ \Rightarrow\ v_t = i_t\Big(R_S + \frac{1}{g_m + 1/r_{ds}}\Big)$
$$R_{DN} = R_S + \tfrac1{g_m}\parallel r_{ds} \approx R_S + \tfrac1{g_m}$$
The diode just adds in series. Problem Set 5 (h)'s official answer writes "$\approx R_1$": that only holds if $g_mR_1\gg1$. Keep the $1/g_m$.`,
      }),
      P({
        id: 'e2u7-diode-num', title: 'A PMOS diode under a resistor, with numbers',
        q: md`A diode-connected PMOS has $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$. A resistor $R = 1\kO$ connects its source to $V_{DD}$. Find the resistance looking up into its drain (keep $r_{ds}$).`,
        parts: [{ lbl: 'R_{UP}', unit: 'kΩ', ans: 1.98039 }],
        hints: [md`Same algebra as the NMOS diode on a resistor: $R + \tfrac1{g_m}\parallel r_{ds}$.`],
        sol: md`
1. $\tfrac1{g_m}\parallel r_{ds} = \dfrac{1}{1\,\text{mS} + 0.02\,\text{mS}} = \dfrac{1}{1.02\,\text{mS}} = 0.9804\kO$.
2. Add the resistor in series: $R_{UP} = 1\kO + 0.9804\kO = 1.980\kO$.`,
      }),
      R(md`
        ### Where diodes show up

        - **As a load.** A common-source stage with a diode load has $R_{out}\approx 1/g_{m2}$, so $A_v\approx -g_{m1}/g_{m2}$: small, but set only by transistor sizes (derived in Unit 8).
        - **In current mirrors.** The input side of every current mirror is a diode. It converts a current into a voltage, $v = i/g_m$, and that voltage drives the other transistor's gate.
        - **In stacks.** Diodes in series add, as derived above. The middle node of a stack is a voltage divider: it moves by the fraction "resistance below it" over "total". That fact is the key to the K rule later in this unit.

        ### Summary

        | Circuit | Result | Why |
        |---|---|---|
        | NMOS or PMOS diode | $\tfrac1{g_m}\parallel r_{ds}\approx\tfrac1{g_m}$ | $v_{gs}$ equals the test voltage |
        | Two diodes in series | $\tfrac1{g_{ma}} + \tfrac1{g_{mb}}$ | same current, each its own $1/g_m$ |
        | Diode on top of $R_S$ | $R_S + \tfrac1{g_m}\parallel r_{ds}$ | gate rides with the drain: no magnification |
      `),
    ],
  });

  L({
    id: 'e2-u7-scaler', title: 'Degeneration: the impedance scaler', ref: 'Lecture 17',
    steps: [
      R(md`
        ### Where this lesson goes

        This is the most important page of the unit. The two derivations above gave two formulas for a transistor whose **gate is held**:
        - looking **down into the drain**, with a resistor $R_S$ under the source:
        $$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$$
        - looking **up into the source**, with a resistor $R_D$ on the drain (the drawing above called this $R_S$; here we write $R_{UP}$ so it is not confused with the resistor $R_S$):
        $$R_{UP} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}$$

        Now we read them: what each term means, how big they are with real numbers, when the short forms are safe, the one trap that catches everyone, and the single fact that ties the two together.
      `),
      R(md`
        ### Reading the drain formula

        **Step 1: what you would get without the dependent source.** $r_{ds}$ and $R_S$ in series: $r_{ds} + R_S$.

        **Step 2: the extra term.** The dependent source adds $g_mr_{ds}R_S$. That is $R_S$ multiplied by the intrinsic gain $g_mr_{ds}$ (around 100 to 200). It is usually by far the biggest term.

        **Step 3: group the terms.** Pull $r_{ds}$ out of the first and third:
        $$R_{DN} = r_{ds}(1 + g_mR_S) + R_S\approx r_{ds}(1 + g_mR_S)$$
        Dropping the lone $R_S$ is safe: it is tiny next to $r_{ds}$.

        **Step 4: the shortest form.** If also $g_mR_S\gg1$, then $1 + g_mR_S\approx g_mR_S$ and
        $$R_{DN}\approx g_mr_{ds}R_S$$
        **$R_S$ appears $g_mr_{ds}$ times larger from the drain.**

        **Example 1.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$. Then $g_mR_S = 2$ and $g_mr_{ds} = 200$.
        $$R_{DN} = 100\kO + 1\kO + (200)(1\kO) = 301\kO$$
        Check the short forms: $r_{ds}(1 + g_mR_S) = 100\times3 = 300\kO$ (fine), $g_mr_{ds}R_S = 200\kO$ (33% low, because $g_mR_S = 2$ is not $\gg1$).

        **Example 2.** Same transistor, $R_S = 10\kO$ ($g_mR_S = 20$):
        $$R_{DN} = 100 + 10 + 200\times10 = 2110\kO\approx2.1\,\text{M}\Omega$$
        Now $g_mr_{ds}R_S = 2000\kO$ is within 5%. A $10\kO$ resistor turned a $100\kO$ drain into $2.1\,\text{M}\Omega$.
      `, F.drainDeg()),
      R(md`
        !!intuition Why the transistor magnifies $R_S$
        Push the drain up. A little current starts to flow down through the device and through $R_S$. That current lifts the source, which **lowers $v_{gs}$** (the gate is held), which shuts the channel and fights the current. The transistor works hard to keep its current constant, and "current barely changes when the voltage changes" is exactly what a big resistance is. The bigger $R_S$, the more the source rises per unit current, and the harder the fight.
      `),
      R(md`
        ### Reading the source formula

        **Step 1: split the fraction into two pieces.**
        $$R_{UP} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}} = \frac{r_{ds}}{1 + g_mr_{ds}} + \frac{R_D}{1 + g_mr_{ds}}$$

        **Step 2: the first piece is the plain source.** Divide top and bottom by $r_{ds}$: $\dfrac{1}{1/r_{ds} + g_m} = \dfrac1{g_m}\parallel r_{ds}\approx\dfrac1{g_m}$. That is the source with $R_D = 0$, from the previous lessons.

        **Step 3: the second piece is $R_D$ shrunk.** $1 + g_mr_{ds}\approx g_mr_{ds}$, so
        $$R_{UP}\approx\frac{1}{g_m} + \frac{R_D}{g_mr_{ds}}$$
        **$R_D$ appears $g_mr_{ds}$ times smaller from the source.** The source is $\approx 1/g_m$ only while $R_D\ll r_{ds}$.

        **Example.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, so $1 + g_mr_{ds} = 201$.
        - $R_D = 10\kO$: $R_{UP} = \dfrac{110\kO}{201} = 547\,\Omega$. Close to $1/g_m = 500\,\Omega$.
        - $R_D = 100\kO$ (another transistor's $r_{ds}$): $R_{UP} = \dfrac{200\kO}{201} = 995\,\Omega\approx 2/g_m$. Double.
        - $R_D = 1\,\text{M}\Omega$: $R_{UP} = \dfrac{1100\kO}{201} = 5.47\kO$. Eleven times $1/g_m$.
      `, F.sourceRD()),
      R(md`
        ### The trap: a current source on the drain

        Suppose the drain sits on an **ideal current source**. Its small-signal resistance is infinite, so set $R_D\to\infty$.

        **Step 1: the formula.** The numerator $r_{ds} + R_D$ grows without limit while the denominator $1 + g_mr_{ds}$ stays fixed:
        $$R_{UP} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\ \xrightarrow{\ R_D\to\infty\ }\ \infty$$

        **Step 2: the reason, from KCL.** Any current that enters the source must leave through the drain (the gate takes nothing). At the drain the only other path is the ideal current source, which cannot carry any signal current. So no current can enter the source at all, whatever voltage you apply: the resistance is **infinite**, not $1/g_m$.

        This is a favourite short-answer question (Lecture 17 note). The intermediate case, a real transistor current source with $R_D = r_{ds}$, gives the $\approx 2/g_m$ of the example above.
      `),
      R(md`
        !!key Lecture 17: "common gate acts as an impedance scaler"
        From the drain, the source side is multiplied by $g_mr_{ds}$. From the source, the drain side is divided by $g_mr_{ds}$.

        !!intuition One fact behind both formulas
        With the gate held, the transistor passes the **same current** in at one end and out at the other. But the voltage at the drain moves about $g_mr_{ds}$ times as much as the voltage at the source (the transistor amplifies the source voltage onto the drain, with gain about $g_mr_{ds}$: this is the common-gate amplifier). Same current, $g_mr_{ds}$ times the voltage: $g_mr_{ds}$ times the resistance. Looking in from the other end, the ratio is upside down.

        **Why it matters on the exam.** Problem 2 on every practice paper is a node where one branch is a degenerated drain (sometimes the "resistor" is itself a diode, a cascode, or another degenerated device). Name the thing in the source, compute its resistance with the canonical results, and multiply by $g_mr_{ds}$.
      `),
      Q(md`$g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 1\kO$ in the source, gate held. About how big is the resistance looking into the drain?`,
        ['$\\approx 150\\kO$', '$\\approx 51\\kO$', '$\\approx 100\\kO$', '$\\approx 1\\kO$'], 0,
        [null, 'That is $r_{ds} + R_S$, without the $g_mr_{ds}R_S$ term, which is the big one.', 'That is $g_mr_{ds}R_S$ alone; add $r_{ds}$.', 'That is $R_S$ alone; the transistor magnifies it.'],
        md`$r_{ds} + R_S + g_mr_{ds}R_S = 50 + 1 + 100 = 151\kO$. Here $g_mR_S = 2$, so the "$\approx g_mr_{ds}R_S$" shortcut would be 33% low; $r_{ds}(1 + g_mR_S) = 150\kO$ is the safe approximation.`),
      Q(md`Gate held, the drain loaded by $R_D = r_{ds}$. What do you see looking into the source?`,
        ['$\\approx 2/g_m$', '$\\approx 1/g_m$', '$\\approx r_{ds}$', '$\\infty$'], 0,
        [null, 'That needs $R_D\\ll r_{ds}$. Here $R_D/(g_mr_{ds}) = 1/g_m$ adds a second $1/g_m$.', 'The drain resistance is divided by $g_mr_{ds}$, not passed straight through.', 'Only for an ideal current source on the drain.'],
        md`$\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}} = \dfrac{2r_{ds}}{1 + g_mr_{ds}}\approx\dfrac{2}{g_m}$. This is exactly what happens in a differential pair or a cascode whose drain load is another transistor's $r_{ds}$ (Problem Set 6(f): $R_X \approx \tfrac1{g_m}(1 + \tfrac{R}{r_{ds}})$).`),
      P({
        id: 'e2u7-src-rd', title: 'Derive the other direction',
        q: md`Derive the resistance looking into the source of a transistor whose gate is at incremental ground and whose drain has $R_D$ to incremental ground. Keep $r_{ds}$.`,
        fig: F.sourceRD(),
        parts: [E2.ex('(rds + RD)/(1 + gm*rds)', ['gm', 'rds', 'RD'], 'R_S')],
        hints: [md`The test current $i_t$ flows in at the source, up through the device, and down through $R_D$: so $v_d = i_tR_D$.`, md`Device current from drain to source is $-i_t$: $-i_t = g_m(0 - v_t) + \dfrac{v_d - v_t}{r_{ds}}$.`],
        sol: md`$v_d = i_tR_D$. KCL for the device (drain to source): $-i_t = -g_mv_t + \dfrac{i_tR_D - v_t}{r_{ds}}$. Multiply by $r_{ds}$: $-i_tr_{ds} = -g_mr_{ds}v_t + i_tR_D - v_t$, so
$$v_t(1 + g_mr_{ds}) = i_t(r_{ds} + R_D)\ \Rightarrow\ R_S = \frac{r_{ds}+R_D}{1+g_mr_{ds}}$$
This is the common-gate input resistance (Lecture 17).`,
      }),
      P({
        id: 'e2u7-scaler-num', title: 'Both directions, with numbers',
        q: md`A transistor with its gate held has $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$. (1) With $R_S = 2\kO$ under its source, find the resistance looking into the drain. (2) With $R_D = 50\kO$ on its drain instead (source free), find the resistance looking into the source.`,
        parts: [{ lbl: 'R_{DN}', unit: 'kΩ', ans: 152 }, { lbl: 'R_{UP}', unit: 'kΩ', ans: 1.96078 }],
        hints: [md`$g_mr_{ds} = 50$.`, md`$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$; $R_{UP} = \dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$.`],
        sol: md`
1. $g_mr_{ds} = (1\,\text{mS})(50\kO) = 50$.
2. $R_{DN} = 50 + 2 + 50\times2 = 152\kO$.
3. $R_{UP} = \dfrac{50 + 50}{1 + 50}\kO = \dfrac{100}{51}\kO = 1.96\kO$, about $2/g_m$ (because $R_D = r_{ds}$).`,
      }),
      R(md`
        ### Summary

        | Gate held, looking into | Other end has | Exact | Short form |
        |---|---|---|---|
        | drain | $R_S$ under the source | $r_{ds} + R_S + g_mr_{ds}R_S$ | $r_{ds}(1 + g_mR_S)$, or $g_mr_{ds}R_S$ if $g_mR_S\gg1$ |
        | source | $R_D$ on the drain | $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$ | $\dfrac1{g_m} + \dfrac{R_D}{g_mr_{ds}}$ |
        | source | ideal current source on the drain | $\infty$ | $\infty$ |
      `),
    ],
  });

  L({
    id: 'e2-u7-cascode', title: 'Cascodes and gain boosting', ref: 'Lectures 16–17',
    steps: [
      R(md`
        ### The plan for this lesson

        A **cascode** is one transistor stacked on top of another: the top transistor's source sits on the bottom transistor's drain, and both gates are held. We want the resistance looking down into the top drain. It is the biggest resistance one can build from two transistors, and big output resistance means big gain.

        We will:
        1. draw the full small-signal model and derive the cascode's output resistance step by step;
        2. put numbers on it;
        3. learn the "bottom-up" rule for any stack (Practice 2 #2(a));
        4. derive the **regulated cascode** (gain boosting, Practice 2 #2(b)), where an extra amplifier drives the top gate.
      `, F.cascodeR()),
      R(md`
        ### Step 1: what is $v_{gs}$ of each transistor?

        Call the node between the two transistors $X$.
        - **$M_1$ (bottom):** gate held (incremental ground), source grounded. $v_{gs1} = 0 - 0 = 0$. Its dependent source is dead; only $r_{ds1}$ is left, from $X$ to ground.
        - **$M_2$ (top):** gate held, source at $X$. $v_{gs2} = 0 - v_X = -v_X$. Its dependent source is alive.

        ### Step 2: the equations

        **(1) Current through $M_1$.** All of $i_t$ goes down through $M_2$, arrives at $X$, and has only one way out: through $M_1$, which is just $r_{ds1}$. So
        $$v_X = i_t\,r_{ds1}$$

        **(2) Current down through $M_2$** (drain = test node, source = $X$): dependent source plus $r_{ds2}$.
        $$i_t = g_{m2}v_{gs2} + \frac{v_t - v_X}{r_{ds2}} = -g_{m2}v_X + \frac{v_t - v_X}{r_{ds2}}$$
      `, cascModel),
      R(md`
        ### Step 3: solve

        Put (1) into (2):
        $$i_t = -g_{m2}r_{ds1}\,i_t + \frac{v_t - i_tr_{ds1}}{r_{ds2}}$$
        Multiply every term by $r_{ds2}$:
        $$i_tr_{ds2} = -g_{m2}r_{ds2}r_{ds1}\,i_t + v_t - i_tr_{ds1}$$
        Move all $i_t$ terms to the left:
        $$i_t\,(r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}) = v_t$$
        $$R_{out} = \frac{v_t}{i_t} = r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}\approx g_{m2}r_{ds2}\,r_{ds1}$$
        This is the degenerated-drain formula $r_{ds} + R_S + g_mr_{ds}R_S$ with $R_S = r_{ds1}$, as promised: the bottom transistor is just a resistor $r_{ds1}$, and the top one magnifies it by $g_{m2}r_{ds2}$.

        **Example.** Both transistors: $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, so $g_mr_{ds} = 200$.
        $$R_{out} = 100\kO + 100\kO + (200)(100\kO) = 200\kO + 20{,}000\kO = 20.2\,\text{M}\Omega$$
        One transistor alone gives $r_{ds} = 100\kO$. Stacking a second multiplied it by about 200.
      `),
      P({
        id: 'e2u7-casc-sym', title: 'Cascode output resistance',
        q: md`Both gates at incremental ground. Find $R_{out}$ looking into $M_2$'s drain. (Exact form or the $g_mr_{ds}\gg1$ approximation.)`,
        fig: F.cascodeR(),
        parts: [E2.ex('rds1 + rds2 + gm2*rds2*rds1', ['gm2', 'rds1', 'rds2'], 'R_{out}')],
        hints: [md`Looking down from $M_2$'s source you see $M_1$'s drain: $r_{ds1}$. Now it is a degenerated drain with $R_S = r_{ds1}$.`],
        sol: md`$M_2$ degenerated by $r_{ds1}$: $R_{out} = r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}\approx g_{m2}r_{ds2}r_{ds1}$.`,
      }),
      R(md`
        ### Any stack: work from the bottom up

        The cascode derivation never used the fact that the thing under $M_2$ was a transistor; it only used its resistance. So for any stack of held-gate transistors:

        !!key The bottom-up rule
        Turn everything below a transistor's source into one resistance $R_x$. Then looking into that transistor's drain:
        $$R_{next} = r_{ds} + R_x(1 + g_mr_{ds})$$
        (that is $r_{ds} + R_x + g_mr_{ds}R_x$ written with $R_x$ collected). Repeat, one transistor at a time, going up.

        **Practice 2 #2(a).** $M_1$ on top of $M_2$ on top of a resistor $R$, both gates held.

        **Step 1: the bottom transistor.** $M_2$ with $R$ under its source:
        $$R_Y = r_{ds2} + R(1 + g_{m2}r_{ds2})$$
        **Step 2: the top transistor.** $M_1$ with $R_Y$ under its source:
        $$R_{EQ1} = r_{ds1} + R_Y(1 + g_{m1}r_{ds1})\approx g_{m1}r_{ds1}\,r_{ds2}(1 + g_{m2}R)$$

        **Example.** All transistors $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$; $R = 1\kO$.
        - $R_Y = 100\kO + 1\kO\times201 = 301\kO$.
        - $R_{EQ1} = 100\kO + 301\kO\times201 = 100\kO + 60{,}501\kO = 60.6\,\text{M}\Omega$.

        (In the exam figure, $M_1$'s gate sits on a voltage source, so it is held; and a gate hanging on $Y$ draws no current, so it adds nothing to the node.)
      `, stackFig),
      R(md`
        ### Gain boosting: the regulated cascode

        Practice 2 #2(b) replaces the fixed bias on $M_1$'s gate with a small amplifier. $M_3$ has its **gate on $Y$**, its source grounded, and its **drain on $M_1$'s gate** (node $N$). An ideal current source $I_B$ feeds $N$ from $V_{DD}$. Everything below $Y$ is lumped into one resistance $R_Y$ (in Practice 2 it is the $M_2$-on-$R$ stack from above).

        **Step 1: what does $I_B$ do in small signal?** An ideal current source never changes its current, so its signal current is zero: it is an **open circuit**. Node $N$ touches only $M_3$'s drain and $M_1$'s gate (which draws nothing).

        **Step 2: $v_{gs}$ of each transistor.**
        - $M_3$: gate $Y$, source ground. $v_{gs3} = v_Y$.
        - $M_1$: gate $N$, source $Y$. $v_{gs1} = v_N - v_Y$. Its gate is no longer still.
      `, regFig),
      R(md`
        **Step 3: KCL at $N$ (what $M_3$ does).** Only $M_3$ touches $N$, so the current through $M_3$ must be zero:
        $$0 = g_{m3}v_Y + \frac{v_N}{r_{ds3}}\quad\Rightarrow\quad v_N = -g_{m3}r_{ds3}\,v_Y = -A\,v_Y,\qquad A = g_{m3}r_{ds3}$$
        $M_3$ is a common-source amplifier from $Y$ to $N$ with gain $-A$ (its only load is its own $r_{ds3}$).

        **Step 4: $v_{gs1}$.**
        $$v_{gs1} = v_N - v_Y = -Av_Y - v_Y = -(1 + A)\,v_Y$$
        In a plain cascode $v_{gs1} = -v_Y$. Here it is $(1 + A)$ times bigger.

        **Step 5: KCL at $Y$.** $M_3$'s gate takes no current, so all of $i_t$ flows into $R_Y$:
        $$v_Y = i_tR_Y$$

        **Step 6: current down through $M_1$.**
        $$i_t = g_{m1}v_{gs1} + \frac{v_t - v_Y}{r_{ds1}} = -g_{m1}(1 + A)R_Y\,i_t + \frac{v_t - i_tR_Y}{r_{ds1}}$$
        Multiply by $r_{ds1}$:
        $$i_tr_{ds1} = -g_{m1}r_{ds1}(1 + A)R_Y\,i_t + v_t - i_tR_Y$$
        Collect $i_t$:
        $$i_t\,\big[r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + A)R_Y\big] = v_t$$
        $$R_{out} = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y\approx(g_{m1}r_{ds1})(g_{m3}r_{ds3})\,R_Y$$

        **Example.** All $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$ ($g_mr_{ds} = 200$, so $A = 200$), and take $R_Y = 1\kO$ to keep it simple.
        - Plain cascode ($A = 0$): $100 + 1 + 200\times1 = 301\kO$.
        - Regulated: $100 + 1 + 200\times201\times1 = 100 + 1 + 40{,}200 = 40{,}301\kO\approx 40.3\,\text{M}\Omega$.
        The booster multiplied the output resistance by another $\approx 1 + A = 201$.

        !!intuition A watchdog on node $Y$
        In the plain cascode, when $Y$ rises by $v_Y$, $M_1$'s $v_{gs}$ falls by $v_Y$ and the transistor fights back. In the regulated cascode, $M_3$ sees $Y$ rise and yanks $M_1$'s gate **down** by $Av_Y$. Now $v_{gs1}$ falls by $(1 + A)v_Y$, and $M_1$ fights $(1 + A)$ times harder. So the magnification $g_{m1}r_{ds1}$ becomes $g_{m1}r_{ds1}(1 + A)$. $Y$ barely moves, so the current barely moves: a huge resistance.
      `, regModel),
      Q(md`In the regulated cascode, why does the ideal current source $I_B$ matter for the small-signal answer?`,
        ['It is an open circuit, so $M_3$\'s only load is $r_{ds3}$, giving the full gain $g_{m3}r_{ds3}$.', 'It sets $M_1$\'s gate to incremental ground.', 'It adds $r_{ds}$ in parallel with $R$.', 'It does not: $M_3$ could be removed.'], 0,
        [null, 'If $M_1$\'s gate were incremental ground there would be no boosting at all (that is part (a)).', 'It is connected to $M_1$\'s gate node, not to $Y$.', '$M_3$ is the whole point: it moves $M_1$\'s gate.'],
        md`An ideal current source has infinite small-signal resistance, so the gate node of $M_1$ is a high-impedance node and $M_3$ gets its intrinsic gain. With a resistor load $R_B$ instead, $A = g_{m3}(r_{ds3}\parallel R_B)$.`),
      P({
        id: 'e2u7-casc-num', title: 'Plain and regulated, with numbers',
        q: md`All transistors have $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$. (1) Find the output resistance of a plain cascode (two transistors, both gates held, bottom source grounded). (2) Now $M_1$ (top) sits on $R_Y = 2\kO$ and its gate is driven by a booster $M_3$ with an ideal current-source load, as in the regulated cascode. Find $R_{out}$.`,
        parts: [{ lbl: 'R_{casc}', unit: 'MΩ', ans: 2.6 }, { lbl: 'R_{reg}', unit: 'MΩ', ans: 5.152 }],
        hints: [md`$g_mr_{ds} = 50$. Plain: $r_{ds2} + r_{ds1} + g_mr_{ds}r_{ds1}$.`, md`Regulated: $r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y$ with $1 + A = 51$.`],
        sol: md`
1. $g_mr_{ds} = (1\,\text{mS})(50\kO) = 50$.
2. Plain cascode: $50 + 50 + 50\times50 = 2600\kO = 2.6\,\text{M}\Omega$.
3. Regulated: $50 + 2 + 50\times51\times2 = 52 + 5100 = 5152\kO = 5.15\,\text{M}\Omega$.
(Without the booster, $M_1$ on $2\kO$ would give only $50 + 2 + 50\times2 = 152\kO$.)`,
      }),
      R(md`
        ### Summary

        | Circuit | $R_{out}$ (exact) | Approximate |
        |---|---|---|
        | One transistor, gate held | $r_{ds}$ | $r_{ds}$ |
        | Transistor on $R_x$, gate held | $r_{ds} + R_x(1 + g_mr_{ds})$ | $g_mr_{ds}R_x$ |
        | Cascode ($R_x = r_{ds1}$) | $r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}$ | $g_{m2}r_{ds2}r_{ds1}$ |
        | Regulated cascode on $R_Y$ | $r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y$ | $(g_{m1}r_{ds1})(g_{m3}r_{ds3})R_Y$ |

        Each held-gate transistor stacked on top multiplies by about $g_mr_{ds}$; a booster amplifier on the gate multiplies by another $1 + A$.
      `),
    ],
  });

  L({
    id: 'e2-u7-node', title: 'A node: $R_{UP}\\parallel R_{DN}$', ref: 'Lecture 15, Problem Set 5',
    steps: [
      R(md`
        ### The plan for this lesson

        Most "find $R_{EQ}$" questions put the test source on a **node** with several branches hanging off it: something above, something below, maybe more. We will:
        1. show why the answer is simply all the branches in parallel;
        2. work Practice 1 #2(a) completely, with the small-signal model drawn;
        3. put numbers on it and see which branch wins;
        4. point at the one situation where the splitting needs care (next lesson).

        ### Why the node splits

        **Step 1.** Put $v_t$ on the node. Every branch connects the node to (incremental) ground through its own parts.

        **Step 2.** If the branches share nothing except the node and ground, each branch's current depends only on $v_t$ and its own parts. Call the branch resistances $R_{UP}$ and $R_{DN}$: $i_{UP} = v_t/R_{UP}$, $i_{DN} = v_t/R_{DN}$.

        **Step 3.** KCL at the node: the test source supplies both.
        $$i_t = \frac{v_t}{R_{UP}} + \frac{v_t}{R_{DN}}\quad\Rightarrow\quad R_{EQ} = \frac{v_t}{i_t} = R_{UP}\parallel R_{DN}$$

        !!key Split the node
        $$R_{EQ} = R_{UP}\parallel R_{DN}\ (\parallel\text{ any other branch})$$
        Find each branch with the results from this unit, then combine. The **smallest** branch dominates, so spot the $1/g_m$ branches first.
      `),
      R(md`
        ### Practice 1 #2(a)

        **Up:** a diode-connected PMOS $M_2$ (gate tied to its drain, which is our node $N$) with a resistor $R_1$ between its source and $V_{DD}$. **Down:** $M_1$ with its gate held and $R_S$ under its source.

        **Step 1: $v_{gs}$ of each transistor.**
        - $M_2$: gate = drain = $N$, so $v_{g2} = v_t$. Its source is node $S_2$ (top of $R_1$). $v_{gs2} = v_t - v_{S2}$.
        - $M_1$: gate held, so $v_{g1} = 0$. Its source is node $X$ (top of $R_S$). $v_{gs1} = 0 - v_X = -v_X$.
      `, [['rail', [1, -3.2]], ['R', [1, -3.2], [1, -2], { n: 'R_1' }], ['pmos', [1, -1], { n: 'M_2', dc: true }], ['w', [1, 0], [2, 0]], look([2, 0], 'R_{eq1}'), ['node', [1, 0], { n: 'N', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]]]),
      R(md`
        **Step 2: draw the model.** $V_{DD}$ becomes ground (top). Each transistor becomes $g_mv_{gs}$ from drain to source with $r_{ds}$ across it. For the PMOS the drain ($N$) is at the bottom, so its arrow points up. The two branches meet only at $N$ and at ground, so they split.

        **Step 3: the up branch.** It is "a diode on a resistor" from the diode lesson: the gate rides with the drain, so the diode adds its $\tfrac1{g_{m2}}\parallel r_{ds2}$ in series with $R_1$:
        $$R_{UP} = R_1 + \frac1{g_{m2}}\parallel r_{ds2}\approx R_1 + \frac1{g_{m2}}$$

        **Step 4: the down branch.** It is the degenerated drain from the scaler lesson ($M_1$'s gate held, $R_S$ under its source):
        $$R_{DN} = r_{ds1} + R_S + g_{m1}r_{ds1}R_S$$

        **Step 5: combine.**
        $$R_{eq1} = \Big[R_1 + \tfrac1{g_{m2}}\parallel r_{ds2}\Big]\parallel\Big[r_{ds1} + R_S + g_{m1}r_{ds1}R_S\Big]\approx R_1 + \tfrac1{g_{m2}}$$
        The up branch is a few kΩ; the down branch is hundreds of kΩ. The small one wins.
      `, nodeModel),
      R(md`
        ### With numbers

        All transistors $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$; $R_1 = R_S = 1\kO$.

        **Up:** $\tfrac1{g_{m2}}\parallel r_{ds2} = \dfrac{1}{2.01\,\text{mS}} = 0.4975\kO$, so $R_{UP} = 1 + 0.4975 = 1.4975\kO$.

        **Down:** $R_{DN} = 100 + 1 + 200\times1 = 301\kO$.

        **Combine:**
        $$R_{eq1} = \frac{1.4975\times301}{1.4975 + 301}\kO = \frac{450.7}{302.5}\kO = 1.490\kO$$
        The approximation $R_1 + 1/g_{m2} = 1.5\kO$ is within 1%. The $301\kO$ branch changed the answer by half a percent.

        !!intuition Which branch wins
        A parallel combination is always smaller than its smallest branch, and when one branch is 100 times smaller than the others, it **is** the answer to within about 1%. Look for a source or a diode on the node first: that branch is a few hundred ohms to a few kΩ, while drains are $100\kO$ and up.

        !!trap A branch can hide in a gate
        The split only works if each branch's current depends on $v_t$ alone, through its own parts. If the node also drives a **gate** of a transistor whose drain is on the same node, that transistor is a third branch whose current depends on how far its gate moves. That is the K rule, next lesson.
      `),
      G('e2_updn', { need: 6 }),
      P({
        id: 'e2u7-node-num', title: 'Practice 1 #2(a), new numbers',
        q: md`Same circuit (PMOS diode $M_2$ with $R_1$ above, $M_1$ with gate held and $R_S$ below). All transistors $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$; $R_1 = R_S = 2\kO$. Find $R_{UP}$, $R_{DN}$ and $R_{eq1}$ (keep $r_{ds}$ everywhere).`,
        parts: [{ lbl: 'R_{UP}', unit: 'kΩ', ans: 2.98039 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 152 }, { lbl: 'R_{eq1}', unit: 'kΩ', ans: 2.92308 }],
        hints: [md`$\tfrac1{g_m}\parallel r_{ds} = 1/(1.02\,\text{mS})$.`, md`$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$ with $g_mr_{ds} = 50$.`],
        sol: md`
1. $R_{UP} = 2\kO + \dfrac{1}{1.02\,\text{mS}} = 2 + 0.9804 = 2.980\kO$.
2. $R_{DN} = 50 + 2 + 50\times2 = 152\kO$.
3. $R_{eq1} = \dfrac{2.980\times152}{2.980 + 152}\kO = \dfrac{453.0}{154.98}\kO = 2.923\kO$. Again almost exactly the up branch.`,
      }),
    ],
  });

  L({
    id: 'e2-u7-k', title: 'Gates that move: the K rule', ref: 'Problem Set 5 (f)–(i)',
    steps: [
      R(md`
        ### The plan for this lesson

        So far every transistor on the test node had its gate **held**, or tied straight to its drain (a diode). Sometimes the test voltage reaches a transistor's gate only **partly**: through a resistor divider, through the middle of a stack, or through another device. Then $v_{gs}$ gets an extra push from the gate, and the transistor pulls extra current.

        We will:
        1. describe "how much the gate moves" with one number $K$;
        2. derive the drain resistance for any $K$ from the model;
        3. check it at its corners ($K = 0$, $K = 1$, $R_S = 0$);
        4. work an example with numbers, and learn how to find $K$;
        5. extend it to feedback through a mirror.
      `),
      R(md`
        ### Step 1: the setup and the model

        A transistor has its drain on the test node and $R_S$ under its source. Its gate is driven by something that moves by
        $$v_g = K\,v_t$$
        when the test node moves by $v_t$. $K$ is a plain number, usually between 0 (gate held) and 1 (gate on the drain).

        **Node voltages:** drain $v_d = v_t$; gate $v_g = Kv_t$; source $v_s = i_tR_S$ (all of $i_t$ goes down through the device and then through $R_S$; the gate takes nothing).

        **Step 2: $v_{gs}$.**
        $$v_{gs} = v_g - v_s = Kv_t - i_tR_S$$
      `, kModel),
      R(md`
        **Step 3: the device current equals $i_t$.** Dependent source plus $r_{ds}$ (which has $v_t - i_tR_S$ across it):
        $$i_t = g_m(Kv_t - i_tR_S) + \frac{v_t - i_tR_S}{r_{ds}}$$

        **Step 4: multiply every term by $r_{ds}$.**
        $$i_tr_{ds} = g_mr_{ds}K\,v_t - g_mr_{ds}R_S\,i_t + v_t - R_S\,i_t$$

        **Step 5: $i_t$ terms on the left, $v_t$ terms on the right.**
        $$i_t\,(r_{ds} + R_S + g_mr_{ds}R_S) = v_t\,(1 + g_mr_{ds}K)$$

        **Step 6: the resistance.**
        $$R_{DN} = \frac{v_t}{i_t} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$$
        The top is the degenerated drain from the scaler lesson. The bottom, $1 + g_mr_{ds}K$, is what the moving gate does: it divides the resistance down.

        **Step 7: the short form.** Top $\approx r_{ds}(1 + g_mR_S)$; bottom $\approx g_mr_{ds}K$ when $g_mr_{ds}K\gg1$:
        $$R_{DN}\approx\frac{r_{ds}(1 + g_mR_S)}{g_mr_{ds}K} = \frac{1 + g_mR_S}{g_mK} = \frac{R_S + 1/g_m}{K}$$
      `),
      R(md`
        ### Checking the corners

        **$K = 0$ (gate held).** The bottom is 1:
        $$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$$
        the degenerated drain. ✓

        **$K = 1$ (gate on the drain: a diode on $R_S$).** Write the top as $r_{ds} + R_S(1 + g_mr_{ds})$ and divide each piece by $1 + g_mr_{ds}$:
        $$R_{DN} = \frac{r_{ds}}{1 + g_mr_{ds}} + R_S = \frac1{g_m}\parallel r_{ds} + R_S$$
        exactly the diode-on-a-resistor result. ✓

        **$R_S = 0$ (source grounded).** Divide top and bottom by $r_{ds}$:
        $$R_{DN} = \frac{r_{ds}}{1 + g_mr_{ds}K} = \frac{1}{1/r_{ds} + Kg_m} = r_{ds}\parallel\frac{1}{Kg_m}$$
        The transistor acts like a resistor $1/(Kg_m)$: a diode, weakened by the factor $K$.

        **Example.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$, $K = 0.5$:
        $$R_{DN} = \frac{100 + 1 + 200\times1}{1 + 200\times0.5}\kO = \frac{301}{101}\kO = 2.98\kO$$
        Short form: $\dfrac{1\kO + 0.5\kO}{0.5} = 3\kO$. ✓ Compare the held gate ($K = 0$): $301\kO$. Letting the gate move by half the test voltage made the branch 100 times smaller.
      `),
      R(md`
        ### Finding $K$, with a full example

        Finding $K$ is the real work. Ask: **"if the test node moves by $v_t$, how much does this gate move?"**

        **Example: a gate on a divider.** Resistors $R_a$ (top) and $R_b$ (bottom) go from the test node to ground, and the transistor's gate sits at their middle. $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$, $R_a = R_b = 10\kO$.

        **Step 1: $K$.** The gate draws no current, so the divider is unloaded:
        $$K = \frac{R_b}{R_a + R_b} = \frac{10}{20} = 0.5$$

        **Step 2: the transistor branch.** From the example above, $R_{DN} = 2.98\kO$.

        **Step 3: do not forget the divider itself.** It is also a branch from the test node to ground: $R_a + R_b = 20\kO$.

        **Step 4: combine the branches.**
        $$R_{EQ} = 20\kO\parallel2.98\kO = \frac{20\times2.98}{22.98}\kO = 2.59\kO$$
      `, divFig),
      R(md`
        !!key Where $K$ comes from
        - **A resistor divider:** $K = \dfrac{R_b}{R_a + R_b}$.
        - **The middle of a stack** (diodes or resistors) carrying the test current: the stack carries $i = v_t/R_{stack}$, and the gate's node sits at $i\times$(resistance below it). So $K = \dfrac{\text{resistance below the gate's node}}{\text{total resistance of that branch}}$ (Problem Set 5 (f): $K = \dfrac{1/g_{m2}}{R_{DN1}}$; (i): $K = R_2/R_{UP}$).
        - **The source of a device whose drain carries the test current** (Practice 1 #2(b)): the source moves by the current times the resistance under it, divided by $v_t$.

        **Problem Set 5 (f)** is the classic. $M_4$'s gate hangs on the diode $M_2$ at the bottom of the left branch.
        1. The left branch has resistance $R_{DN1}$, so it carries $v_t/R_{DN1}$.
        2. That current flows through the diode $M_2$, so the diode's top sits at $v_t\cdot\dfrac{1/g_{m2}}{R_{DN1}}$: $K = \dfrac{1}{g_{m2}R_{DN1}}$.
        3. $M_4$ has its source grounded ($R_S = 0$), so it looks like $r_{ds4}\parallel\dfrac{1}{Kg_{m4}} = r_{ds4}\parallel\dfrac{g_{m2}R_{DN1}}{g_{m4}}$.
      `),
      G('e2_k', { need: 3 }),
      P({
        id: 'e2u7-k-sym', title: 'The gate on a divider, symbolic',
        q: md`The gate of a transistor (with $R_S$ in its source) is driven by a node that moves $K$ times the drain voltage. Find $R_{DN}$ looking into its drain. Exact or approximate form.`,
        fig: F.drainK(),
        parts: [E2.ex('(rds + RS + gm*rds*RS)/(1 + gm*rds*K)', ['gm', 'rds', 'RS', 'K'], 'R_{DN}')],
        hints: [md`$v_s = i_tR_S$ and $v_g = Kv_t$, so $v_{gs} = Kv_t - i_tR_S$.`],
        sol: md`$i_t = g_m(Kv_t - i_tR_S) + \dfrac{v_t - i_tR_S}{r_{ds}}$. Times $r_{ds}$: $i_t(r_{ds} + R_S + g_mr_{ds}R_S) = v_t(1 + g_mr_{ds}K)$, so
$$R_{DN} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}\approx\frac{R_S + 1/g_m}{K}$$`,
      }),
      P({
        id: 'e2u7-k-num', title: 'A divider on the gate, with numbers',
        q: md`Same circuit as the worked example (gate at the middle of a divider $R_a$, $R_b$ across the test node, $R_S$ under the source), now with $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 0$, $R_a = 30\kO$, $R_b = 10\kO$. Find $K$, the transistor branch $R_{DN}$, and the total $R_{EQ}$.`,
        parts: [{ lbl: 'K', unit: '', ans: 0.25 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 3.7037 }, { lbl: 'R_{EQ}', unit: 'kΩ', ans: 3.3898 }],
        hints: [md`$K = R_b/(R_a + R_b)$.`, md`$R_S = 0$: $R_{DN} = r_{ds}\parallel\dfrac{1}{Kg_m}$. Then put it in parallel with the divider, $R_a + R_b$.`],
        sol: md`
1. $K = \dfrac{10}{30 + 10} = 0.25$.
2. $\dfrac{1}{Kg_m} = \dfrac{1}{0.25\,\text{mS}} = 4\kO$, so $R_{DN} = 50\parallel4 = \dfrac{200}{54}\kO = 3.704\kO$. (Formula: $\dfrac{50}{1 + 50\times0.25} = \dfrac{50}{13.5} = 3.704\kO$.)
3. $R_{EQ} = 40\parallel3.704 = \dfrac{40\times3.704}{40 + 3.704}\kO = \dfrac{148.1}{43.70}\kO = 3.390\kO$.`,
      }),
      R(md`
        ### Feedback through a mirror: one more step

        This shows up in Practice 4 #3(b) and Practice 5 #2(b). The picture: the test current flows down one branch and passes through a **diode-connected transistor** (maybe with a resistor). The voltage it makes there drives the **gate of another transistor whose drain is the test node**. That transistor then pulls extra current out of the test node, so the node looks smaller.

        Below is Practice 5 #2(b). The stack $M_1$, $M_2$, $R$ is the branch; $M_3$ and $M_4$ are the transistors whose gates sense it.
      `, [
        ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['w', [1, 0], [1, -0.4], [4.6, -0.4]], ['term', [4.6, -0.4], { n: '\\leftarrow R_{eq2}', side: 'r' }],
        ['nmos', [1, 3], { n: 'M_2', dc: true }], ['node', [1, 2], { n: 'X', side: 'ar' }], ['node', [1, 4], { n: 'Y', side: 'al' }],
        ['R', [1, 4], [1, 5.2], { n: 'R', side: 'l' }], ['gnd', [1, 5.2]],
        ['w', [1, 4], [2, 4]], ['nmos', [3, 4], { n: 'M_3' }], ['gnd', [3, 5]], ['w', [3, 3], [3, -0.4]],
        ['w', [1, 2], [2.6, 2], { hops: [3] }], ['w', [2.6, 2], [3.6, 2], { hops: [3] }], ['nmos', [4.6, 2], { n: 'M_4' }], ['gnd', [4.6, 3]], ['w', [4.6, 1], [4.6, -0.4]],
      ]),
      R(md`
        **Step 1: the current down the branch.** With nothing else attached, the stack looks like $R_{eq1}$ (part (a) of the same problem):
        $$R_X = R + \frac{1}{g_{m2}}\parallel r_{ds2},\qquad R_{eq1} = r_{ds1} + R_X\,(1 + g_{m1}r_{ds1})$$
        So a test voltage $v_t$ sends a current $i = \dfrac{v_t}{R_{eq1}}$ down through $M_1$, $M_2$ and $R$.

        **Step 2: the voltages that current makes.** The gate draws no current, so all of $i$ goes through $M_2$ and $R$:
        $$v_Y = i\,R \qquad\text{(top of the resistor)}$$
        $$v_X = i\,\Big(R + \frac{1}{g_{m2}}\Big) = i\,R_X \qquad\text{(top of the diode)}$$
        With no resistor, the diode alone gives $v = i\times\dfrac{1}{g_m}$.

        **Step 3: the extra currents.** $M_3$ and $M_4$ have their sources grounded and their drains on the test node. Each pulls $g_m\times$(its gate voltage), plus its own $v_t/r_{ds}$:
        $$i_{M3} = g_{m3}\,v_Y + \frac{v_t}{r_{ds3}} = g_{m3}R\;i + \frac{v_t}{r_{ds3}}$$
        $$i_{M4} = g_{m4}\,v_X + \frac{v_t}{r_{ds4}} = g_{m4}R_X\;i + \frac{v_t}{r_{ds4}}$$

        **Step 4: add up everything leaving the test node.**
        $$i_t = i\,\big(1 + g_{m3}R + g_{m4}R_X\big) + \frac{v_t}{r_{ds3}} + \frac{v_t}{r_{ds4}}$$
        The branch carries $i$, but the node really supplies $i(1 + g_{m3}R + g_{m4}R_X)$. Every extra current that grows with $i$ makes the branch look that many times smaller:
        $$R_{eq2} = r_{ds3}\parallel r_{ds4}\parallel\frac{R_{eq1}}{1 + g_{m3}R + g_{m4}R_X}$$

        !!intuition The rule in one line
        $$R_{EQ} = \frac{R_{branch}}{1 + (\text{extra current per unit of branch current})}$$
        Each transistor that senses the branch current and dumps a copy onto the test node adds its "copy ratio" to the bottom. Here $M_3$ copies $g_{m3}R$ and $M_4$ copies $g_{m4}R_X$ per unit of $i$.

        Both parts are worked in full in [Practice Exam 5](#/l/e2-p5) (#2) and [Practice Exam 4](#/l/e2-p4) (#3(b)).
      `),

      R(md`
        ### Summary

        | Situation | $R_{DN}$ looking into the drain |
        |---|---|
        | Gate moves by $Kv_t$, $R_S$ under the source | $\dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}\approx\dfrac{R_S + 1/g_m}{K}$ |
        | $K = 0$ (gate held) | $r_{ds} + R_S + g_mr_{ds}R_S$ |
        | $K = 1$ (diode on $R_S$) | $R_S + \tfrac1{g_m}\parallel r_{ds}$ |
        | $R_S = 0$ | $r_{ds}\parallel\dfrac{1}{Kg_m}$ |
        | Transistors copying a branch's current onto the node | $\dfrac{R_{branch}}{1 + \text{copy ratio}}$, in parallel with their $r_{ds}$ |

        Finding $K$: divider $\dfrac{R_b}{R_a + R_b}$; middle of a stack $\dfrac{\text{resistance below}}{\text{total}}$. And remember that whatever sets $K$ (a divider, a stack) is usually a branch on the node too.
      `),
    ],
  });

  // ---------------------------------------------------------------- differential pair, from the model up
  // Transistor-level pictures: (a) current-source loads, (b) mirror load
  const pairFig = (b) => b ? F.diffMirror() : [
    ['rail', [1, -0.4]], ['rail', [3, -0.4]],
    ['pmos', [1, 0.6], { n: 'M_3', flip: true }], ['acg', [2, 0.6]], ['pmos', [3, 0.6], { n: 'M_4' }],
    ['nmos', [1, 2.6], { n: 'M_1' }], ['nmos', [3, 2.6], { n: 'M_2', flip: true }], ['acg', [0, 2.6]], ['acg', [4, 2.6]],
    ['w', [3, 1.6], [3.8, 1.6]], ['term', [3.8, 1.6], { n: '\\leftarrow R_{out}', side: 'r' }], ['node', [1, 1.6], { n: 'A', side: 'l' }],
    ['w', [1, 3.6], [3, 3.6]], ['node', [2, 3.6], { n: 'P', side: 'a' }], ['I', [2, 3.6], [2, 4.8], { n: 'I_{tail}', side: 'r' }], ['gnd', [2, 4.8]],
  ];
  // Step 1 picture: every fixed node replaced by ground, tail removed
  const pairKilled = (b) => [
    ['acg', [1, -0.4]], ['acg', [3, -0.4]],
    b ? ['pmos', [1, 0.6], { n: 'M_3', flip: true, dc: true }] : ['pmos', [1, 0.6], { n: 'M_3', flip: true }],
    ...(b ? [] : [['acg', [2, 0.6]]]),
    b ? ['pmos', [3, 0.6], { n: 'M_4' }] : ['pmos', [3, 0.6], { n: 'M_4', flip: true }],
    ...(b ? [] : [['acg', [4, 0.6]]]),
    ['nmos', [1, 2.6], { n: 'M_1' }], ['nmos', [3, 2.6], { n: 'M_2', flip: true }], ['acg', [0, 2.6]], ['acg', [4, 2.6]],
    ['w', [3, 1.6], [4.6, 1.6]], ['V', [4.6, 1.6], [4.6, 2.8], { n: 'v_t', side: 'r' }], ['gnd', [4.6, 2.8]], ['iarr', [3.8, 1.6], 'l', { n: 'i_t' }],
    ['node', [1, 1.6], { n: 'A', side: 'l' }],
    ['w', [1, 3.6], [3, 3.6]], ['node', [2, 3.6], { n: 'P', side: 'b' }], ['txt', [2, 4.4], '$\\text{tail: open}$'],
  ];
  // Step 2 picture: the full small-signal model. Each transistor = g_m v_gs (drain to source) in parallel with r_ds.
  const pairModel = (b) => [
    // loads on node A (left) and on the output (right); top row is incremental ground (V_DD)
    ['gndu', [1, -1.6]], ['R', [1, -1.6], [1, 0], { n: b ? '\\tfrac{1}{g_{m3}}\\parallel r_{ds3}' : 'r_{ds3}', side: 'l' }],
    ...(b ? [
      ['G', [5, 0], [5, -1.6], { n: 'g_{m4}v_A' }], ['gndu', [5, -1.6]], ['w', [5, -1.6], [6.2, -1.6]], ['R', [6.2, -1.6], [6.2, 0], { n: 'r_{ds4}' }],
    ] : [
      ['gndu', [6.2, -1.6]], ['R', [6.2, -1.6], [6.2, 0], { n: 'r_{ds4}' }],
    ]),
    // M1 between A and P
    ['w', [1, 0], [2.2, 0]], ['G', [1, 0], [1, 2.4], { n: 'g_{m1}v_{gs1}', side: 'l' }], ['R', [2.2, 0], [2.2, 2.4], { n: 'r_{ds1}' }], ['w', [1, 2.4], [2.2, 2.4]],
    ['txt', [1.6, -0.3], '$M_1$'],
    // M2 between output and P
    ['w', [3.8, 0], [5, 0]], ['R', [3.8, 0], [3.8, 2.4], { n: 'r_{ds2}', side: 'l' }], ['G', [5, 0], [5, 2.4], { n: 'g_{m2}v_{gs2}' }], ['w', [3.8, 2.4], [5, 2.4]],
    ['txt', [4.4, -0.3], '$M_2$'],
    // shared source node P, nothing else attached (tail open)
    ['w', [2.2, 2.4], [3.8, 2.4]], ['node', [3, 2.4], { n: 'P', side: 'b' }],
    ['node', [1, 0], { n: 'A', side: 'al' }], ['node', [5, 0], { n: 'out', side: 'a' }],
    // test source on the output
    ['w', [5, 0], [7.4, 0]], ['V', [7.4, 0], [7.4, 1.2], { n: 'v_t', side: 'r' }], ['gnd', [7.4, 1.2]], ['iarr', [6.8, 0], 'l', { n: 'i_t' }],
  ];

  L({
    id: 'e2-u7-pair', title: 'Differential-pair nodes, from the model up', ref: 'Practice 3 #3',
    steps: [
      R(md`
        ### The circuit and the question

        A **differential pair** is two transistors, $M_1$ and $M_2$, whose **sources are tied together** at one node, called $P$. A **tail current source** $I_{tail}$ pulls a fixed DC current out of $P$ to ground. Each drain has a load on top. Practice 3 #3 asks: **what resistance do you see looking into $M_2$'s drain** (the output)? Both gates sit at fixed bias voltages.

        There are two versions. In **(a)**, the loads are two PMOS **current sources** ($M_3$, $M_4$, gates held at a fixed voltage). In **(b)**, the load is a **current mirror**: $M_3$ is diode-connected (gate tied to its drain, node $A$), and $M_4$'s gate is tied to node $A$ too.

        We will do (a) completely, every step, then see what (b) changes.
      `, pairFig(false)),
      R(md`
        ### Step 1: turn off everything that does not move

        For small signals, any node held at a fixed voltage is ground. So:
        - $V_{DD}$ becomes ground (the triangles on top).
        - The gates of $M_1$ and $M_2$ (fixed bias) become ground.
        - The gates of $M_3$ and $M_4$ (fixed bias) become ground.
        - The tail is an **ideal current source**: its current never changes, so the signal current through it is zero. A branch that carries zero signal current is an **open circuit**. Remove it.

        Then put a **test source** $v_t$ on the output and ask how much current $i_t$ it pushes in. $R_{out} = v_t / i_t$.

        Notice what removing the tail does: node $P$ now touches **only** $M_1$'s source and $M_2$'s source. Whatever current comes down through $M_2$ into $P$ has exactly one place to go: **up through $M_1$**.
      `, pairKilled(false)),
      R(md`
        ### Step 2: replace every transistor with its model

        Each transistor becomes a **dependent current source $g_mv_{gs}$, pointing from drain to source**, in parallel with **$r_{ds}$** from drain to source. Nothing connects to the gate.

        - $M_3$: gate at ground, source at ground, so $v_{gs3} = 0$: its dependent source is zero. Only $r_{ds3}$ is left, from $A$ to ground.
        - $M_4$: same reasoning: only $r_{ds4}$, from the output to ground.
        - $M_1$: drain $A$, source $P$, gate at ground, so $v_{gs1} = 0 - v_P = -v_P$.
        - $M_2$: drain = output, source $P$, gate at ground, so $v_{gs2} = -v_P$.

        That gives the full small-signal circuit below. There are three unknowns: $v_P$, $v_A$, and the current $i_2$ flowing **down** through $M_2$ (from the output to $P$).
      `, pairModel(false)),
      R(md`
        ### Step 3: write the equations, one node at a time

        **(1) Current down through $M_2$** (output to $P$). It is the dependent source plus the $r_{ds2}$ current:
        $$i_2 = g_{m2}v_{gs2} + \frac{v_t - v_P}{r_{ds2}} = -g_{m2}v_P + \frac{v_t - v_P}{r_{ds2}}$$

        **(2) KCL at $P$.** Only $M_1$ and $M_2$ touch $P$. So the current $i_2$ arriving from $M_2$ must leave through $M_1$, going **up**, from $P$ to $A$. In $M_1$'s drain-to-source direction (down, $A$ to $P$) that current is $-i_2$:
        $$-i_2 = g_{m1}v_{gs1} + \frac{v_A - v_P}{r_{ds1}} = -g_{m1}v_P + \frac{v_A - v_P}{r_{ds1}}$$

        **(3) KCL at $A$.** The current $i_2$ arrives at $A$ from below and leaves through $r_{ds3}$ to ground:
        $$v_A = i_2\,r_{ds3}$$

        **(4) Total current from the test source.** It splits: $i_2$ goes down $M_2$, and $v_t/r_{ds4}$ goes into $M_4$:
        $$i_t = i_2 + \frac{v_t}{r_{ds4}}$$
      `),
      R(md`
        ### Step 4: solve

        **Find $v_P$.** Put (3) into (2):
        $$-i_2 = -g_{m1}v_P + \frac{i_2r_{ds3} - v_P}{r_{ds1}}$$
        Multiply by $r_{ds1}$:
        $$-i_2r_{ds1} = -g_{m1}r_{ds1}v_P + i_2r_{ds3} - v_P$$
        Move the $v_P$ terms to one side:
        $$v_P\,(1 + g_{m1}r_{ds1}) = i_2\,(r_{ds1} + r_{ds3})$$
        $$v_P = i_2\,R_P,\qquad R_P = \frac{r_{ds1} + r_{ds3}}{1 + g_{m1}r_{ds1}}$$
        $R_P$ is the resistance node $P$ presents to $M_2$. It is exactly **"looking into $M_1$'s source, with $r_{ds3}$ on $M_1$'s drain"**: the source-side formula from earlier in this unit. Size: $R_P \approx \dfrac{1}{g_{m1}}\Big(1 + \dfrac{r_{ds3}}{r_{ds1}}\Big) \approx \dfrac{2}{g_{m1}}$. Small.

        **Find $v_t / i_2$.** Put $v_P = i_2R_P$ into (1):
        $$i_2 = -g_{m2}i_2R_P + \frac{v_t - i_2R_P}{r_{ds2}}$$
        Multiply by $r_{ds2}$ and collect $i_2$:
        $$i_2\,\big(r_{ds2} + g_{m2}r_{ds2}R_P + R_P\big) = v_t$$
        $$R_{DN2} = \frac{v_t}{i_2} = r_{ds2} + R_P\,(1 + g_{m2}r_{ds2})$$
        This is the **degenerated-drain formula** ($r_{ds} + R_S + g_mr_{ds}R_S$) with $R_S = R_P$. So: $M_2$ looks like a transistor with a resistor $R_P$ under its source, and that resistor is $M_1$ seen from its source.

        **Add $M_4$.** From (4), $i_t = v_t/R_{DN2} + v_t/r_{ds4}$, so the two are in parallel:
        $$\boxed{R_{out} = r_{ds4}\parallel\Big[r_{ds2} + R_P(1 + g_{m2}r_{ds2})\Big],\qquad R_P = \frac{r_{ds1} + r_{ds3}}{1 + g_{m1}r_{ds1}}}$$

        **Matched pair** ($g_{m1} = g_{m2}$, $r_{ds1} = r_{ds2}$): $R_P(1 + g_{m2}r_{ds2}) = r_{ds1} + r_{ds3}$ exactly, so $R_{DN2} = 2r_{ds1} + r_{ds3}$. With every $r_{ds}$ equal: $R_{DN2} = 3r_{ds}$ and $R_{out} = r_{ds}\parallel 3r_{ds} = \tfrac34r_{ds}$.

        !!intuition What the current actually does
        Push current into the output. Most of it goes into $M_4$ ($r_{ds4}$). The rest goes **down $M_2$, across $P$, and back up $M_1$** into $r_{ds3}$, because the tail is open and there is nowhere else to go. Going up through $M_1$ is "entering a source": cheap, about $2/g_m$. But $M_2$ sits on top of that small resistance with its gate held, and the impedance scaler multiplies it by about $g_mr_{ds}$, giving roughly $2r_{ds}$. So the path down through the pair is a big resistance, about $2r_{ds}$ to $3r_{ds}$.
      `),
      P({
        id: 'e2u7-pair-a', title: 'Current-source loads, with numbers',
        q: md`In circuit (a), all four transistors have $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$. Find $R_P$ (the resistance node $P$ presents), $R_{DN2}$ (looking down into $M_2$'s drain), and $R_{out}$.`,
        fig: pairModel(false),
        parts: [{ lbl: 'R_P', unit: 'kΩ', ans: 0.99502 }, { lbl: 'R_{DN2}', unit: 'kΩ', ans: 300 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 75 }],
        hints: [md`$R_P = \dfrac{r_{ds1} + r_{ds3}}{1 + g_{m1}r_{ds1}} = \dfrac{200\kO}{1 + 200}$.`, md`$R_{DN2} = r_{ds2} + R_P(1 + g_{m2}r_{ds2})$. Notice $(1 + g_{m2}r_{ds2})$ is the same 201 you divided by.`],
        sol: md`
1. $g_mr_{ds} = (2\,\text{mS})(100\kO) = 200$.
2. $R_P = \dfrac{100\text{k} + 100\text{k}}{1 + 200} = \dfrac{200\text{k}}{201} = 0.995\kO$ (about $2/g_m = 1\kO$).
3. $R_{DN2} = 100\text{k} + 0.995\text{k}\times201 = 100\text{k} + 200\text{k} = 300\kO$.
4. $R_{out} = r_{ds4}\parallel R_{DN2} = 100\text{k}\parallel300\text{k} = \dfrac{100\cdot300}{400}\kO = 75\kO$.`,
      }),
      R(md`
        ### Part (b): the mirror load. What changes?

        Now $M_3$ is **diode-connected** (gate tied to its drain $A$), and $M_4$'s gate is **also tied to $A$**. Go through the model again, device by device:

        - $M_3$: gate = drain = $A$, source at ground, so $v_{gs3} = v_A$. Its dependent source $g_{m3}v_A$ flows from $A$ to ground, and $r_{ds3}$ also connects $A$ to ground. A current $g_{m3}v_A$ through a node at voltage $v_A$ is just a resistor $1/g_{m3}$. So $M_3$ is $\dfrac{1}{g_{m3}}\parallel r_{ds3}$, call it $R_{D3}$.
        - $M_4$: source at ground (V_DD), gate at $A$, so $v_{gs4} = v_A$. Its dependent source $g_{m4}v_A$ now **pulls current out of the output node**. This is new: in (a) $M_4$'s gate was still.
        - $M_1$, $M_2$: unchanged.
      `, pairModel(true)),
      R(md`
        ### Part (b), the equations

        Equations (1) and (2) are **identical** to part (a). Equation (3) uses the diode instead of $r_{ds3}$:
        $$v_A = i_2\,R_{D3},\qquad R_{D3} = \frac{1}{g_{m3}}\parallel r_{ds3} \approx \frac{1}{g_{m3}}$$
        So the same algebra gives the same shape, with $R_{D3}$ in place of $r_{ds3}$:
        $$R_P = \frac{r_{ds1} + R_{D3}}{1 + g_{m1}r_{ds1}},\qquad R_{DN2} = r_{ds2} + R_P(1 + g_{m2}r_{ds2})$$
        Matched pair: $R_{DN2} = 2r_{ds1} + R_{D3} \approx 2r_{ds}$.

        **Equation (4) changes.** The test source now feeds three things: $i_2$ down the pair, $v_t/r_{ds4}$ into $M_4$'s $r_{ds}$, **and** $M_4$'s dependent source $g_{m4}v_A$:
        $$i_t = i_2 + \frac{v_t}{r_{ds4}} + g_{m4}v_A = i_2 + \frac{v_t}{r_{ds4}} + g_{m4}R_{D3}\,i_2$$
        $$i_t = \frac{v_t}{r_{ds4}} + i_2\,\big(1 + g_{m4}R_{D3}\big),\qquad i_2 = \frac{v_t}{R_{DN2}}$$
        Divide by $v_t$:
        $$\boxed{R_{out} = r_{ds4}\parallel\frac{R_{DN2}}{1 + g_{m4}R_{D3}}}$$

        **Matched** ($g_{m4} = g_{m3}$): $g_{m4}R_{D3} \approx 1$, so the bottom is about 2:
        $$R_{out} \approx r_{ds4}\parallel\frac{2r_{ds}}{2} = r_{ds4}\parallel r_{ds2}$$

        !!intuition Why the mirror halves the pair's resistance
        The current $i_2$ that goes down $M_2$ and up $M_1$ lands on the diode $M_3$. The mirror $M_4$ **copies** it and pulls the copy out of the output too. So for every bit of current the pair path carries, the output actually supplies **twice** as much. Twice the current at the same voltage is half the resistance: $2r_{ds}$ becomes $r_{ds}$. This is the "feedback through a mirror" rule from the K-rule lesson: $R = \dfrac{R_{branch}}{1 + \text{copy ratio}}$, with copy ratio $g_{m4}R_{D3} \approx 1$.
      `),
      P({
        id: 'e2u7-pair-b', title: 'Mirror load, with numbers',
        q: md`In circuit (b), all four transistors have $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$. Find $R_{D3}$ (the diode $M_3$), $R_{DN2}$, the copy factor $1 + g_{m4}R_{D3}$, and $R_{out}$.`,
        fig: pairModel(true),
        parts: [{ lbl: 'R_{D3}', unit: 'Ω', ans: 497.51 }, { lbl: 'R_{DN2}', unit: 'kΩ', ans: 200.4975 }, { lbl: '1 + g_{m4}R_{D3}', unit: '', ans: 1.99502 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 50.124 }],
        hints: [md`$R_{D3} = \dfrac{1}{g_m}\parallel r_{ds} = \dfrac{1}{2\,\text{mS} + 10\,\mu\text{S}}$.`, md`Matched pair: $R_{DN2} = 2r_{ds} + R_{D3}$. Then $R_{out} = r_{ds4}\parallel\dfrac{R_{DN2}}{1 + g_{m4}R_{D3}}$.`],
        sol: md`
1. $R_{D3} = \dfrac{1}{2\,\text{mS} + 1/100\text{k}} = \dfrac{1}{2.01\,\text{mS}} = 497.5\,\Omega$.
2. $R_P = \dfrac{100\text{k} + 0.4975\text{k}}{201} = 0.49999\kO$, and $R_{DN2} = 100\text{k} + 0.49999\text{k}\times201 = 200.50\kO$ (that is $2r_{ds} + R_{D3}$).
3. Copy factor: $1 + (2\,\text{mS})(497.5\,\Omega) = 1 + 0.995 = 1.995$.
4. $\dfrac{R_{DN2}}{1.995} = 100.50\kO$, then $R_{out} = 100\text{k}\parallel100.5\text{k} = 50.12\kO$. Compare (a): $75\kO$. The mirror makes the output resistance smaller, about $r_{ds}/2$.`,
      }),
      Q(md`In a differential pair with an ideal tail current source, a test current is pushed into $M_2$'s drain. Where does the part that enters $M_2$ go?`,
        ['Down $M_2$, then up through $M_1$ into $M_1$\'s drain load.', 'Down $M_2$ and into the tail source.', 'Nowhere: the output impedance is infinite.', 'Half through each transistor to ground.'], 0,
        [null, 'The tail is an ideal current source: open in small signal.', 'It does flow, because $M_1$\'s source is a $1/g_m$-ish path to its drain load.', 'Neither transistor has a path to ground except through its drain load.'],
        md`With the tail open, node $P$ touches only the two sources. The current goes down $M_2$ and up $M_1$ (into $M_1$'s source, out of its drain) into $M_1$'s load.`),
    ],
  });
})();

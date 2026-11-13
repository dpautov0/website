/* Unit 9 — multi-transistor circuits: gain chains and loading, two paths into one output, mirrors that carry signal,
   folded cascodes and current division, the DC bias problem, and the exam playbook. Problem Sets 4 and 6.
   Every lesson: say where it is going, draw the circuit, draw the small-signal model, derive in numbered steps,
   then numbers, then intuition, then a recap table. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2u9', l);
  const vin = (x, y) => [['Vac', [x, y], [x, y + 1], { n: 'v_{in}', side: 'l' }], ['gnd', [x, y + 1]]];

  // ================================================================ figures
  // chain, example 1: common source driving the gate of a second common source
  const csCsFig = [
    ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_{D1}', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4),
    ['w', [1, 0], [1.8, 0], [1.8, 1], [2, 1]], ['node', [1.5, 0], { n: 'v_1', side: 'a' }],
    ['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_{D2}' }], ['nmos', [3, 1], { n: 'M_2' }], ['gnd', [3, 2]],
    ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'v_{out}' }],
  ];
  // chain, example 2: common source whose drain node v_1 drives the SOURCE of a common gate M_2
  const csCgFig = [
    ['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_{D2}', side: 'l' }], ['w', [1, -1], [1.8, -1]], ['term', [1.8, -1], { n: 'v_{out}' }],
    ['nmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]],
    ['w', [1, 1], [3, 1]], ['node', [2, 1], { n: 'v_1', side: 'b' }], ['rail', [3, -0.4]], ['R', [3, -0.4], [3, 1], { n: 'R_{D1}' }],
    ['nmos', [1, 2], { n: 'M_1' }], ['gnd', [1, 3]], ['w', [0, 2], [-0.6, 2], [-0.6, 2.4]], ...vin(-0.6, 2.4),
  ];
  // chain, example 2: its small-signal model
  const csCgModel = [
    ['w', [1, 0], [5.4, 0]], ['node', [4.2, 0], { n: 'v_1', side: 'b' }],
    ['G', [1, 0], [1, 1.8], { n: 'g_{m1}v_{in}', side: 'l' }], ['R', [2.2, 0], [2.2, 1.8], { n: 'r_{ds1}' }], ['w', [1, 1.8], [2.2, 1.8]], ['gnd', [1.6, 1.8]],
    ['txt', [1.6, 2.6], '$M_1:\\ v_{gs1} = v_{in}$'],
    ['gndu', [3.4, -1.8]], ['R', [3.4, -1.8], [3.4, 0], { n: 'R_{D1}' }],
    ['G', [5.4, -2.6], [5.4, 0], { n: 'g_{m2}v_{gs2}', side: 'l' }], ['R', [6.6, -2.6], [6.6, 0], { n: 'r_{ds2}' }], ['w', [5.4, 0], [6.6, 0]], ['w', [5.4, -2.6], [6.6, -2.6]],
    ['txt', [6, 0.7], '$M_2:\\ v_{gs2} = 0 - v_1$'],
    ['w', [6.6, -2.6], [8.8, -2.6]], ['gndu', [7.8, -4.2]], ['R', [7.8, -4.2], [7.8, -2.6], { n: 'R_{D2}' }], ['term', [8.8, -2.6], { n: 'v_{out}' }],
  ];

  // paths: the circuit and its model
  const pathsFig = [['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ['w', [0, 1], [-0.4, 1], [-0.4, 3.4], [2.6, 3.4], [2.6, 1], [3, 1]], ...vin(-0.4, 3.4),
    ['w', [1, 0], [2.6, 0], [2.6, -1], [3, -1]], ['node', [1.8, 0], { n: 'v_1', side: 'a' }],
    ['rail', [4, -2]], ['pmos', [4, -1], { n: 'M_4' }], ['nmos', [4, 1], { n: 'M_3' }], ['gnd', [4, 2]], ['w', [4, 0], [4.8, 0]], ['term', [4.8, 0], { n: 'v_{out}' }]];
  const pathsModel = [
    ['w', [0, 0], [1.2, 0]], ['node', [0.6, 0], { n: 'v_1', side: 'a' }],
    ['G', [0, 0], [0, 1.8], { n: 'g_{m1}v_{in}', side: 'l' }], ['R', [1.2, 0], [1.2, 1.8], { n: 'r_{ds1}' }], ['w', [0, 1.8], [1.2, 1.8]], ['gnd', [0.6, 1.8]],
    ['G', [0, 0], [0, -1.8], { n: 'g_{m2}v_1', side: 'l' }], ['R', [1.2, -1.8], [1.2, 0], { n: 'r_{ds2}' }], ['w', [0, -1.8], [1.2, -1.8]], ['gndu', [0.6, -1.8]],
    ['txt', [0.6, 2.6], '$M_1$ (below), $M_2$ (diode, above)'],
    ['w', [4.4, 0], [6.8, 0]], ['term', [6.8, 0], { n: 'v_{out}' }],
    ['G', [4.4, 0], [4.4, 1.8], { n: 'g_{m3}v_{in}', side: 'l' }], ['R', [5.6, 0], [5.6, 1.8], { n: 'r_{ds3}' }], ['w', [4.4, 1.8], [5.6, 1.8]], ['gnd', [5, 1.8]],
    ['G', [4.4, 0], [4.4, -1.8], { n: 'g_{m4}v_1', side: 'l' }], ['R', [5.6, -1.8], [5.6, 0], { n: 'r_{ds4}' }], ['w', [4.4, -1.8], [5.6, -1.8]], ['gndu', [5, -1.8]],
    ['txt', [5, 2.6], '$M_3$ (below), $M_4$ (above)'],
  ];

  // mirror: the circuit and its model
  const mirrorFig = [['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', flip: true, dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4),
    ['node', [1, 0], { n: 'a', side: 'l' }],
    ['rail', [3, -2]], ['pmos', [3, -1], { n: 'M_3' }], ['R', [3, 0], [3, 1.4], { n: 'R_L' }], ['gnd', [3, 1.4]], ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'v_{out}' }]];
  const mirrorModel = [
    ['w', [0, 0], [1.2, 0]], ['node', [0.6, 0], { n: 'a', side: 'a' }],
    ['G', [0, 0], [0, 1.8], { n: 'g_{m1}v_{in}', side: 'l' }], ['R', [1.2, 0], [1.2, 1.8], { n: 'r_{ds1}' }], ['w', [0, 1.8], [1.2, 1.8]], ['gnd', [0.6, 1.8]],
    ['G', [0, 0], [0, -1.8], { n: 'g_{m2}v_a', side: 'l' }], ['R', [1.2, -1.8], [1.2, 0], { n: 'r_{ds2}' }], ['w', [0, -1.8], [1.2, -1.8]], ['gndu', [0.6, -1.8]],
    ['txt', [0.6, 2.6], '$M_1$ (below), $M_2$ (diode, above)'],
    ['w', [4.2, 0], [6.8, 0]], ['term', [6.8, 0], { n: 'v_{out}' }],
    ['G', [4.2, 0], [4.2, -1.8], { n: 'g_{m3}v_a', side: 'l' }], ['R', [5.4, -1.8], [5.4, 0], { n: 'r_{ds3}' }], ['w', [4.2, -1.8], [5.4, -1.8]], ['gndu', [4.8, -1.8]],
    ['R', [6.2, 0], [6.2, 1.8], { n: 'R_L' }], ['gnd', [6.2, 1.8]],
    ['txt', [4.8, 1], '$M_3$ (above)'],
  ];

  // folded cascode with the output shorted (for G_M)
  const foldedModel = [
    ['w', [0, 0], [8.8, 0]], ['node', [7.0, 0], { n: 'X', side: 'a' }],
    ['G', [0, 0], [0, 1.8], { n: 'g_{m1}v_{in}', side: 'l' }], ['R', [1.2, 0], [1.2, 1.8], { n: 'r_{ds1}' }], ['w', [0, 1.8], [1.2, 1.8]], ['gnd', [0.6, 1.8]],
    ['txt', [0.6, 2.6], '$M_1$'],
    ['gndu', [2.6, -1.8]], ['R', [2.6, -1.8], [2.6, 0], { n: 'r_{ds3}' }], ['txt', [2.6, 0.5], '$M_3$'],
    ['G', [4.8, -1.8], [4.8, 0], { n: 'g_{m2}v_{gs2}', side: 'l' }], ['R', [6, -1.8], [6, 0], { n: 'r_{ds2}' }], ['w', [4.8, -1.8], [6, -1.8]], ['gndu', [5.4, -1.8]],
    ['txt', [5.4, 0.5], '$M_2$'],
    ['G', [7.6, 1.8], [7.6, 0], { n: 'g_{m4}v_{gs4}', side: 'l' }], ['R', [8.8, 0], [8.8, 1.8], { n: 'r_{ds4}' }], ['w', [7.6, 1.8], [8.8, 1.8]],
    ['txt', [8.2, -0.5], '$M_4$'],
    ['w', [8.8, 1.8], [9.8, 1.8], [9.8, 2.2]], ['gnd', [9.8, 2.2]], ['iarr', [9.3, 1.8], 'l', { n: 'i_{out}' }],
    ['txt', [8.6, 3], '$v_{out} = 0$ (shorted)'],
  ];

  // DC: a plain NMOS mirror with a drain resistor
  const dcMirror = [
    ['rail', [1, -0.4]], ['I', [1, -0.4], [1, 0.8], { s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [1, 0.8], [1, 1]],
    ['nmos', [1, 2], { n: 'M_1', sz: '1x', flip: true, dc: true }], ['gnd', [1, 3]],
    ['nmos', [3, 2], { n: 'M_2', sz: '3x' }], ['gnd', [3, 3]],
    ['rail', [3, -0.4], { n: 'V_{DD} = 5\\,\\text{V}' }], ['R', [3, -0.4], [3, 1], { n: 'R_D' }], ['node', [3, 1], { n: 'V_D', side: 'r' }],
  ];
  // DC: Practice Exam 2, Problem 1 (same netlist as the practice-exam page)
  const p2fig1 = [
    ['w', [0, 0], [3.4, 0]], ['rail', [1.7, 0], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['pmos', [0, 1], { n: 'M_5', sz: '2x', flip: true, dc: true }], ['pmos', [2, 1], { n: 'M_4', sz: '2x' }],
    ['R', [0, 2], [0, 3], { n: 'R_1', side: 'l' }], ['w', [0, 3], [1, 3]],
    ['pmos', [2, 3], { n: 'M_3', sz: '8x' }], ['node', [2, 4], { n: 'V_1', side: 'al' }],
    ['w', [3.4, 0], [3.4, 0.7]], ['R', [3.4, 0.7], [3.4, 2.5], { s: '25\\kO' }], ['w', [3.4, 2.5], [3.4, 4], [2, 4]], ['iarr', [3.4, 0.35], 'd', { n: 'I_2', side: 'r' }],
    ['w', [0, 3], [0, 3.5]], ['I', [0, 3.5], [0, 4.9], { s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [0, 4.9], [0, 6]],
    ['nmos', [2, 5], { n: 'M_2', sz: '2x', flip: true }], ['w', [3, 5], [3, 5.3]], ['V', [3, 5.3], [3, 6.2], { n: 'V_A', side: 'r' }], ['gnd', [3, 6.2]],
    ['iarr', [2, 6], 'd', { n: 'I_1', side: 'r', off: [16, 0] }],
    ['nmos', [0, 7], { n: 'M_0', sz: '1x', flip: true, dc: true }], ['gnd', [0, 8]],
    ['nmos', [2, 7], { n: 'M_1', sz: '2x' }], ['gnd', [2, 8]],
  ];

  // ================================================================ 1. chains
  L({
    id: 'e2-u9-chain', title: 'Gain chains and loading', ref: 'Problem Set 6',
    steps: [
      R(md`
        ### The plan for this lesson

        Many exam circuits are **two amplifiers in a row**: the output of the first one, a node we call $v_1$, is the input of the second one. Problem Set 6 and Practice Exam 2 #3 ask for exactly this: $A_1 = v_1/v_{in}$, $A_2 = v_{out}/v_1$, and $A_v = v_{out}/v_{in}$.

        Here is where we are going:
        1. Why you are allowed to split the gain at $v_1$, and the one trap in doing so (**loading**).
        2. What the second stage "costs" the first one, for each way it can be connected to $v_1$.
        3. **Example 1:** common source into the gate of a second common source. No loading at all.
        4. **Example 2:** common source into the source of a common gate. Loading matters a lot, and we draw the full small-signal model.
        5. **Example 3:** a stack of two diodes used as a voltage divider (Problem Set 6(a)).
        6. Getting the sign right by counting inversions.

        Numbers used throughout: $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$ for every transistor, $R_{D1} = R_{D2} = 10\kO$.
      `),
      R(md`
        ### Splitting the gain at $v_1$

        **Step 1: multiply and divide by $v_1$.** This is just algebra, it is always true:
        $$A_v = \frac{v_{out}}{v_{in}} = \frac{v_1}{v_{in}}\cdot\frac{v_{out}}{v_1} = A_1\,A_2$$

        **Step 2: what $A_2$ means.** $A_2 = v_{out}/v_1$: treat $v_1$ as if it were an ideal source driving the second stage, and find $v_{out}$. Nothing of the first stage matters for this, because once $v_1$ is known, $v_{out}$ only depends on what is connected between $v_1$ and the output.

        **Step 3: what $A_1$ means, and the trap.** $A_1 = v_1/v_{in}$ is the voltage at $v_1$ **in the real circuit, with the second stage attached**. The second stage's input may draw signal current from $v_1$. If it does, it acts like one more resistor hanging on $v_1$. Call that resistor $R_{in2}$, the **input resistance** of stage 2. Then, by the $G_MR_{out}$ method applied at $v_1$:
        $$A_1 = -G_{M1}\,\big(R_{out1}\parallel R_{in2}\big)$$
        where $G_{M1}$ and $R_{out1}$ are those of stage 1 alone. Forgetting $R_{in2}$ is called **ignoring the loading**, and it is the classic mistake.
      `),
      R(md`
        ### What the next stage costs: $R_{in2}$ for each connection

        Look at **which terminal** of the next transistor touches $v_1$.

        - **A gate.** No current ever flows into a gate. So $R_{in2} = \infty$: the next stage is invisible to the first.
        - **A source** (the input of a **common gate** stage). Its gate is held, so $v_{gs} = 0 - v_1$: the transistor's current changes with $v_1$ itself. That makes it look like a small resistor, about $\dfrac{1}{g_m}$ (we derive it exactly in Example 2). This is usually the smallest thing at $v_1$.
        - **A diode-connected transistor.** Its gate follows its own drain, so it looks like $\dfrac{1}{g_m}\parallel r_{ds}\approx\dfrac1{g_m}$.
        - **A drain** whose gate is held. $v_{gs} = 0$, only $r_{ds}$ is left: $R_{in2} = r_{ds}$.

        So: gate = free, drain = big, source or diode = small. A small $R_{in2}$ in parallel at $v_1$ makes $A_1$ small. That is not a defect: it means the signal current is flowing **into** stage 2, which is where we want it.
      `),
      R(md`
        ### Example 1: common source into common source

        $M_1$ is a common source stage with $R_{D1}$ on top; its drain is $v_1$. $v_1$ drives the **gate** of $M_2$, a second common source with $R_{D2}$.

        **Step 1: $A_1$.** $M_1$ has $v_{gs1} = v_{in}$ (gate at $v_{in}$, source grounded), so $G_{M1} = g_{m1}$. Looking from $v_1$: $R_{D1}$ up, $r_{ds1}$ down, and $M_2$'s gate, which draws nothing ($R_{in2} = \infty$):
        $$A_1 = -g_{m1}\,(R_{D1}\parallel r_{ds1})$$
        $$A_1 = -(2\,\text{mS})(10\text{k}\parallel100\text{k}) = -(2\,\text{mS})(9.09\kO) = -18.2$$

        **Step 2: $A_2$.** $M_2$ has $v_{gs2} = v_1$. It is the same kind of stage:
        $$A_2 = -g_{m2}\,(R_{D2}\parallel r_{ds2}) = -18.2$$

        **Step 3: multiply.**
        $$A_v = A_1A_2 = (-18.2)(-18.2) = +331$$

        **Sign check in words:** $v_{in}$ up → $M_1$ pulls more → $v_1$ down → $M_2$ pulls less → $v_{out}$ up. Two inversions, positive gain.
      `, csCsFig),
      R(md`
        ### Example 2: common source into common gate

        Now $v_1$ is connected to the **source** of $M_2$. $M_2$'s gate is held at a bias voltage (the open triangle: an incremental ground), and its drain goes through $R_{D2}$ to $V_{DD}$. $R_{D1}$ still hangs from $V_{DD}$ to $v_1$.

        Same transistors, same resistors as Example 1. The only change is **which terminal** of $M_2$ touches $v_1$. We will see that this changes the gain from $+331$ to about $-19$.

        **Step 1: write each transistor's $v_{gs}$.**
        - $M_1$: gate at $v_{in}$, source at ground. $v_{gs1} = v_{in}$.
        - $M_2$: gate held (ground for signals), source at $v_1$. $v_{gs2} = 0 - v_1 = -v_1$.

        **Step 2: draw the model** (next step). Each transistor becomes $g_mv_{gs}$ from drain to source, with $r_{ds}$ in parallel. $V_{DD}$ is ground for signals, so $R_{D1}$ and $R_{D2}$ go to the ground triangles at the top.
      `, csCgFig),
      R(md`
        ### Example 2: the small-signal model

        Read the picture from left to right:
        - $M_1$: the source $g_{m1}v_{in}$ pulls current **down out of** $v_1$, with $r_{ds1}$ beside it.
        - $R_{D1}$ from $v_1$ up to (incremental) ground.
        - $M_2$: drain at the top (the output), source at the bottom ($v_1$). Its source $g_{m2}v_{gs2} = -g_{m2}v_1$ points from drain to source, with $r_{ds2}$ beside it.
        - $R_{D2}$ from the output up to ground.

        Notice that $M_2$ sits **between** $v_1$ and $v_{out}$. Whatever current flows up through $M_2$ leaves $v_1$. That is the loading.
      `, csCgModel),
      R(md`
        ### Example 2, step by step

        **Step 3: $R_{in2}$, looking up into $M_2$'s source.** Put a test voltage $v_t$ at $v_1$ and let $i$ be the current flowing **up** through $M_2$ (from source to drain). That current continues up through $R_{D2}$, so $v_{out} = iR_{D2}$. Up through $M_2$ is the opposite of its drain-to-source direction:
        $$i = -\Big[g_{m2}v_{gs2} + \frac{v_{out} - v_t}{r_{ds2}}\Big] = g_{m2}v_t + \frac{v_t - iR_{D2}}{r_{ds2}}$$
        Multiply by $r_{ds2}$ and collect the $i$ terms on the left:
        $$i\,(r_{ds2} + R_{D2}) = v_t\,(1 + g_{m2}r_{ds2})$$
        $$R_{in2} = \frac{v_t}{i} = \frac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}}\approx\frac{1}{g_{m2}}\Big(1 + \frac{R_{D2}}{r_{ds2}}\Big)$$
        Numbers: $g_{m2}r_{ds2} = 200$, so $R_{in2} = \dfrac{110\kO}{201} = 547\,\Omega$.

        **Step 4: $A_1$, with the load.** At $v_1$: $R_{D1}$, $r_{ds1}$ and $R_{in2}$ in parallel. In conductances, $0.1 + 0.01 + 1.827 = 1.937\,\text{mS}$, so the parallel is $516\,\Omega$:
        $$A_1 = -g_{m1}\,(R_{D1}\parallel r_{ds1}\parallel R_{in2}) = -(2\,\text{mS})(516\,\Omega) = -1.03$$
        Compare $-18.2$ in Example 1: the common gate input pulls $A_1$ down to about $-1$.

        **Step 5: $A_2$, by $G_MR_{out}$ with $v_1$ as the input.** Short the output: $M_2$'s drain-to-source current is $g_{m2}(-v_1) + \dfrac{0 - v_1}{r_{ds2}} = -(g_{m2} + g_{ds2})v_1$, where $g_{ds} = 1/r_{ds}$. That is the current pulled out of the output into the stage, so $G_{M2} = -(g_{m2} + g_{ds2})$: **negative**, as for every common gate. Kill $v_1$: the output sees $R_{D2}\parallel r_{ds2}$. So
        $$A_2 = -G_{M2}R_{out2} = (g_{m2} + g_{ds2})(R_{D2}\parallel r_{ds2}) = (2.01\,\text{mS})(9.09\kO) = +18.3$$

        **Step 6: multiply.**
        $$A_v = A_1A_2 = (-1.03)(18.3) = -18.9$$
        (A full nodal solution of the circuit gives $-18.86$: the split is exact.)

        **Sign check in words:** $v_{in}$ up → $M_1$ pulls more out of $v_1$ → $v_1$ down → $M_2$'s $v_{gs} = -v_1$ goes up → $M_2$ pulls more current down through $R_{D2}$ → $v_{out}$ down. One inversion, negative.

        !!intuition Where the current goes
        $M_1$ pulls $g_{m1}v_{in}$ out of $v_1$. That current can come from $R_{D1}\parallel r_{ds1}$ ($9.09\kO$) or from $M_2$'s source ($547\,\Omega$). Current takes the easy path: $\dfrac{9.09}{9.09 + 0.547} = 94\%$ of it comes up through $M_2$ and therefore through $R_{D2}$. So $|A_v|\approx 0.94\times g_{m1}\times R_{D2}\approx 19$. The small $A_1$ is not a loss: the signal travels as a **current**, not as a voltage. If you had ignored the loading you would have written $(-18.2)(18.3) = -333$, wrong by a factor of 18.
      `),
      R(md`
        ### Example 3: a stack of diodes as a divider (Problem Set 6(a))

        In Problem Set 6(a), stage 1 is a degenerated common source $M_1$ whose drain node $v_0$ looks up into $R_{UP}$ and down into **two diode-connected NMOS in series**: $M_2$ on top (gate and drain at $v_0$, source at $v_1$) and $M_3$ below (gate and drain at $v_1$, source at ground). The second stage's gate hangs on $v_1$, the middle of the stack.

        **Step 1: each diode is a resistor.** For $M_3$: $v_{gs3} = v_1 - 0 = v_1$, and its current $g_{m3}v_1$ flows through a voltage $v_1$: a resistor $1/g_{m3}$. For $M_2$: $v_{gs2} = v_0 - v_1$, and its current $g_{m2}(v_0 - v_1)$ flows through a voltage $v_0 - v_1$: a resistor $1/g_{m2}$. (With $r_{ds}$: $\tfrac1{g_m}\parallel r_{ds}$ each.)

        **Step 2: the same current flows through both.** The second stage's gate on $v_1$ draws nothing. So the stack is two resistors in series, and $v_1$ is a **voltage divider**:
        $$v_1 = v_0\cdot\frac{1/g_{m3}}{1/g_{m2} + 1/g_{m3}} = v_0\cdot\frac{g_{m2}}{g_{m2} + g_{m3}}$$
        Equal diodes: $v_1 = v_0/2$.

        **Step 3: the stack is also stage 1's load.** Looking down from $v_0$: $R_{DN1} = \dfrac1{g_{m2}} + \dfrac1{g_{m3}}$. So
        $$A_1 = \frac{v_1}{v_{in}} = -G_{M1}\,(R_{UP}\parallel R_{DN1})\cdot\frac{1/g_{m3}}{R_{DN1}},\qquad G_{M1}\approx\frac{g_{m1}}{1 + g_{m1}R_1}$$

        **Numbers** ($R_1 = 1\kO$, all $g_m = 2\,\text{mS}$). $G_{M1} = \dfrac{2\,\text{mS}}{1 + 2} = 0.667\,\text{mS}$. $R_{DN1} = 500 + 500 = 1\kO$. $R_{UP}$ is a degenerated drain, about $r_{ds}(1 + g_mR_1) = 300\kO$, so $R_{UP}\parallel R_{DN1}\approx 1\kO$. Then $v_0 = -(0.667\,\text{mS})(1\kO)v_{in} = -0.667\,v_{in}$ and $v_1 = v_0/2 = -0.33\,v_{in}$.
      `),
      R(md`
        ### The sign: count inversions first

        Before any algebra, walk the signal through the chain and count the stages that **invert**:

        | Stage or block | From → to | Inverts? |
        |---|---|---|
        | common source | gate → drain | yes ($-$) |
        | common gate | source → drain | no ($+$) |
        | source follower | gate → source | no ($+$, gain just under 1) |
        | diode divider, resistor divider | top → middle | no ($+$, less than 1) |
        | current mirror | diode current → copy current | no (the copy flows the same way) |

        An odd number of inversions gives a negative $A_v$, an even number a positive one. Write this sign down first; if your algebra disagrees, the algebra is wrong.
      `),
      R(md`
        ### Summary

        | Situation | What to do | Example result |
        |---|---|---|
        | Any chain | $A_v = A_1A_2$, with $A_1 = -G_{M1}(R_{out1}\parallel R_{in2})$ | |
        | $v_1$ drives a gate | $R_{in2} = \infty$, no loading | common source → common source: $+331$ |
        | $v_1$ drives a source (common gate) | $R_{in2} = \dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\dfrac1{g_m}$ | common source → common gate: $-18.9$ |
        | $v_1$ is the middle of a diode stack | divider $\dfrac{1/g_{m3}}{1/g_{m2} + 1/g_{m3}}$ | equal diodes: one half |
        | Sign | count the inverting stages | |
      `),
      G('e2_chain', { need: 4 }),
      G('e2_sign', { need: 4 }),
      P({
        id: 'e2u9-chain-num', title: 'Common source into common gate, with numbers',
        q: md`In Example 2 (common source $M_1$ into the source of a common gate $M_2$), take $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$ for both transistors and $R_{D1} = R_{D2} = 10\kO$. Find $R_{in2}$, $A_1 = v_1/v_{in}$, $A_2 = v_{out}/v_1$ and $A_v$.`,
        fig: csCgFig,
        parts: [{ lbl: 'R_{in2}', unit: 'Ω', ans: 547.264 }, { lbl: 'A_1', unit: '', ans: -1.03238 }, { lbl: 'A_2', unit: '', ans: 18.2727 }, { lbl: 'A_v', unit: '', ans: -18.8644 }],
        hints: [md`$R_{in2} = \dfrac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}}$.`, md`$A_1 = -g_{m1}(R_{D1}\parallel r_{ds1}\parallel R_{in2})$; $A_2 = (g_{m2} + 1/r_{ds2})(R_{D2}\parallel r_{ds2})$.`],
        sol: md`
1. $R_{in2} = \dfrac{100\text{k} + 10\text{k}}{1 + 200} = \dfrac{110\text{k}}{201} = 547.3\,\Omega$.
2. At $v_1$: $\dfrac1{10\text{k}} + \dfrac1{100\text{k}} + \dfrac1{547.3} = 0.1 + 0.01 + 1.8273 = 1.9373\,\text{mS}$, so $516.2\,\Omega$, and $A_1 = -(2\,\text{mS})(516.2\,\Omega) = -1.032$.
3. $A_2 = (2.01\,\text{mS})(10\text{k}\parallel100\text{k}) = (2.01\,\text{mS})(9.091\kO) = 18.27$.
4. $A_v = (-1.032)(18.27) = -18.86$.`,
      }),
    ],
  });

  // ================================================================ 2. two paths
  L({
    id: 'e2-u9-paths', title: 'Two paths into one output', ref: 'Problem Sets 4 #2, 6(b)(d)(e); Practice 2 #3, 4 #2',
    steps: [
      R(md`
        ### The plan for this lesson

        Sometimes $v_{in}$ reaches the output through **more than one transistor**. Example: $v_{in}$ drives a transistor at the output directly, and also drives a first stage whose output $v_1$ drives a second transistor at the same output. These are "two paths". Problem Set 6(b)(d)(e) and Practice Exam 2 #3 are built like this.

        Where we are going:
        1. Why $G_M$ is just the **sum** of the transistors' currents when the output is shorted.
        2. A warm-up where both paths **add** (the CMOS inverter amplifier).
        3. The main example, where the two paths **fight**, with its full small-signal model and every step.
        4. How to tell in one sentence whether paths add or fight.
      `),
      R(md`
        ### Why the paths simply add inside $G_M$

        Recall the method: $A_v = -G_MR_{out}$, with $G_M = i_{out}/v_{in}$, where $i_{out}$ is the current pulled **out of the output node into the circuit** (the course says "down") when the output is shorted to ground.

        **Step 1: short the output.** Then $v_{out} = 0$. Every resistor and every $r_{ds}$ that connects the output to ground has zero volts across it and carries **no current**.

        **Step 2: what is left.** Only the dependent sources $g_mv_{gs}$ of the transistors whose drain is on the output can carry current. Each one carries $g_m$ times its own $v_{gs}$, and the short does not let them affect each other.

        **Step 3: add them** (Kirchhoff's current law at the shorted output):
        $$i_{out} = g_{ma}v_{gs,a} + g_{mb}v_{gs,b} + \dots$$
        $$G_M = \frac{i_{out}}{v_{in}} = g_{ma}\frac{v_{gs,a}}{v_{in}} + g_{mb}\frac{v_{gs,b}}{v_{in}} + \dots$$
        If a gate is driven by an earlier stage, its $v_{gs}$ is $A_1v_{in}$, **with $A_1$'s sign**.

        **Step 4: one $R_{out}$.** Kill $v_{in}$ and look into the output once. There is only one output node, so there is only one $R_{out}$, whatever the number of paths.
      `),
      R(md`
        ### Warm-up: both gates on $v_{in}$ (Problem Set 4 #2)

        $M_a$ (NMOS, source grounded, drawn as $M_1$) and $M_b$ (PMOS, source on $V_{DD}$, drawn as $M_2$) share the output drain node, and **both gates are $v_{in}$**.

        **Step 1: the $v_{gs}$.** $M_a$: $v_{gs,a} = v_{in} - 0 = v_{in}$. $M_b$: its source is $V_{DD}$, ground for signals, so $v_{gs,b} = v_{in} - 0 = v_{in}$ too.

        **Step 2: the currents, output shorted.** Each dependent source points from drain (the output) to source. So each one carries current **out of** the output: $g_{ma}v_{in}$ down into $M_a$, and $g_{mb}v_{in}$ up into $M_b$. Both are current leaving the output node:
        $$G_M = g_{ma} + g_{mb}$$

        **Step 3: $R_{out}$ and the gain.** With $v_{in} = 0$ both gates are still, so each transistor is just its $r_{ds}$:
        $$A_v = -(g_{ma} + g_{mb})(r_{ds,a}\parallel r_{ds,b})$$
        Numbers: $-(2 + 2)\,\text{mS}\times50\kO = -200$.

        **In words:** $v_{in}$ up → the NMOS pulls down harder **and** the PMOS pushes up less. Both effects lower $v_{out}$, so they add.
      `, F.inverter()),
      R(md`
        ### The main example: two paths that fight

        **Path 1, direct:** $M_3$ (NMOS, gate at $v_{in}$, source grounded) has its drain on the output.

        **Path 2, through a first stage:** $M_1$ (NMOS, gate at $v_{in}$) pulls on node $v_1$, whose load is a diode-connected PMOS $M_2$. $v_1$ drives the gate of PMOS $M_4$ (source on $V_{DD}$), whose drain is also on the output.

        We want $A_v = v_{out}/v_{in}$, keeping $r_{ds}$.

        **Step 1: write each $v_{gs}$** (every source here is ground or $V_{DD}$, both ground for signals):
        - $M_1$: gate $v_{in}$. $v_{gs1} = v_{in}$.
        - $M_2$: gate and drain at $v_1$. $v_{gs2} = v_1$.
        - $M_3$: gate $v_{in}$. $v_{gs3} = v_{in}$.
        - $M_4$: gate $v_1$. $v_{gs4} = v_1$.
      `, pathsFig),
      R(md`
        ### The small-signal model

        **Left half (node $v_1$):** $M_1$'s source $g_{m1}v_{in}$ pulls current out of $v_1$ down to ground; $M_2$'s source $g_{m2}v_1$ points from its drain ($v_1$) up to its source (incremental ground). Each has its $r_{ds}$ beside it.

        **Right half (the output):** $M_3$'s $g_{m3}v_{in}$ pulls current out of the output down to ground; $M_4$'s $g_{m4}v_1$ points from the output up to incremental ground. Again each with its $r_{ds}$.

        The two halves are connected **only through $v_1$ controlling $M_4$**: no wire joins them, because a gate draws no current. So the left half can be solved first, by itself.
      `, pathsModel),
      R(md`
        ### Step by step

        **Step 2: solve the left half for $v_1$.** Kirchhoff's current law at $v_1$, currents leaving the node:
        $$g_{m1}v_{in} + \frac{v_1}{r_{ds1}} + g_{m2}v_1 + \frac{v_1}{r_{ds2}} = 0$$
        $$v_1\Big(g_{m2} + \frac1{r_{ds1}} + \frac1{r_{ds2}}\Big) = -g_{m1}v_{in}$$
        $$A_1 = \frac{v_1}{v_{in}} = -g_{m1}\Big(\frac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}\Big)\approx-\frac{g_{m1}}{g_{m2}}$$
        This is a common source with a diode load: inverting.

        **Step 3: $G_M$, output shorted.** By the previous step, add the currents pulled out of the output:
        $$i_{out} = g_{m3}v_{in} + g_{m4}v_1 = \big(g_{m3} + g_{m4}A_1\big)v_{in}$$
        $$G_M = g_{m3} + g_{m4}A_1\approx g_{m3} - \frac{g_{m1}g_{m4}}{g_{m2}}$$
        Since $A_1 < 0$, the second term is **negative**: the paths subtract.

        **Step 4: $R_{out}$, $v_{in}$ dead.** With $v_{in} = 0$, nothing drives node $v_1$, so $v_1 = 0$. Both gates at the output are still, so each output transistor is just its $r_{ds}$:
        $$R_{out} = r_{ds3}\parallel r_{ds4}$$

        **Step 5: the gain.**
        $$A_v = -G_MR_{out} = -\big(g_{m3} + g_{m4}A_1\big)(r_{ds3}\parallel r_{ds4})$$

        **Numbers:** $g_{m1} = g_{m2} = g_{m3} = 2\,\text{mS}$, $g_{m4} = 4\,\text{mS}$, all $r_{ds} = 100\kO$.
        - $\dfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}$: conductances $2 + 0.01 + 0.01 = 2.02\,\text{mS}$, so $495\,\Omega$. $A_1 = -(2\,\text{mS})(495\,\Omega) = -0.990$.
        - $G_M = 2\,\text{mS} + (4\,\text{mS})(-0.990) = 2 - 3.96 = -1.96\,\text{mS}$.
        - $R_{out} = 100\text{k}\parallel100\text{k} = 50\kO$.
        - $A_v = -(-1.96\,\text{mS})(50\kO) = +98$.

        **Sign check in words:** $v_{in}$ up → $M_3$ pulls the output down by $2\,\text{mS}\times v_{in}$. At the same time $v_1$ goes **down** by about $v_{in}$, which turns the PMOS $M_4$ on harder: it pushes $4\,\text{mS}\times v_{in}$ more current **up into** the output. The push wins, so $v_{out}$ goes up: positive gain, as found.

        !!intuition Add or fight, in one sentence
        For each transistor at the output, ask: when $v_{in}$ goes up, does this transistor take current **out of** the output or put current **in**? A gate that sees $v_{in}$ itself (NMOS or PMOS alike) takes current out. A gate that sees an **inverted** copy ($A_1 < 0$) puts current in. Same direction: add. Opposite directions: subtract. If $g_{m3} = g_{m1}g_{m4}/g_{m2}$ the two paths cancel exactly and the gain is zero.
      `),
      R(md`
        ### Where this shows up

        - **Practice Exam 2 #3:** the same fight, with the direct transistor $M_5$ degenerated by $R_2$, so its contribution is $\dfrac{g_{m5}}{1 + g_{m5}R_2}$ instead of $g_{m5}$.
        - **Problem Set 6(d):** $v_1 = -g_{m1}(R_2\parallel r_{ds2})v_{in}$ drives a transistor whose current **adds** to $M_1$'s at the output, so $|G_M| = g_{m1}\big(1 + g_{m2}(R_2\parallel r_{ds2})\big)$: a boost.
        - **Problem Set 6(e):** $G_M = g_{m4} + g_{m5}A_1$, exactly the shape of Step 3.

        ### Summary

        | Step | Rule |
        |---|---|
        | $G_M$ | short the output, add $g_m\cdot v_{gs}$ for every transistor on it; a gate on $v_1$ contributes $g_m A_1$ |
        | Sign of a term | gate sees $v_{in}$: adds; gate sees an inverted copy: subtracts |
        | $R_{out}$ | one node, one $R_{out}$: kill $v_{in}$ (so $v_1 = 0$ too) and take $R_{UP}\parallel R_{DN}$ |
        | Gain | $A_v = -(G_{M,a} + G_{M,b} + \dots)R_{out}$ |
      `),
      P({
        id: 'e2u9-paths-sym', title: 'Two paths that fight',
        q: md`For the circuit in this lesson, find $A_v = v_{out}/v_{in}$ keeping $r_{ds}$ (exact or approximate). Use $A_1$ written out, not as a symbol.`,
        fig: pathsFig,
        parts: [E2.ex('-(gm3 - gm4*gm1*(1/gm2 || rds1 || rds2))*(rds3 || rds4)', ['gm1', 'gm2', 'gm3', 'gm4', 'rds1', 'rds2', 'rds3', 'rds4'], 'A_v')],
        hints: [md`$A_1 = -g_{m1}\big(\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}\big)$. The gates of $M_4$ and $M_3$ draw nothing, so they do not load anything.`, md`Short the output: $i_{out} = g_{m3}v_{in} + g_{m4}v_1$ (current pulled down).`],
        sol: md`$G_M = g_{m3} + g_{m4}A_1 = g_{m3} - g_{m1}g_{m4}\big(\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}\big)$, $R_{out} = r_{ds3}\parallel r_{ds4}$:
$$A_v = -\Big[g_{m3} - g_{m1}g_{m4}\big(\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}\big)\Big](r_{ds3}\parallel r_{ds4})\approx-\Big(g_{m3} - \frac{g_{m1}g_{m4}}{g_{m2}}\Big)(r_{ds3}\parallel r_{ds4})$$
If $g_{m3} = g_{m1}g_{m4}/g_{m2}$ the two paths cancel exactly. That is a good sanity check of your signs: a PMOS gate driven by an inverted copy of the input works **against** an NMOS driven by the input.`,
      }),
      P({
        id: 'e2u9-paths-num', title: 'Two paths, with numbers',
        q: md`Same circuit, now with $g_{m1} = g_{m2} = 2\,\text{mS}$, $g_{m3} = 3\,\text{mS}$, $g_{m4} = 1\,\text{mS}$, every $r_{ds} = 100\kO$. Find $A_1 = v_1/v_{in}$, $G_M$ (in mS, current pulled out of the shorted output per volt of $v_{in}$) and $A_v$.`,
        fig: pathsFig,
        parts: [{ lbl: 'A_1', unit: '', ans: -0.990099 }, { lbl: 'G_M', unit: 'mS', ans: 2.009901 }, { lbl: 'A_v', unit: '', ans: -100.495 }],
        hints: [md`$\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2} = 1/(2.02\,\text{mS})$.`, md`$G_M = g_{m3} + g_{m4}A_1$, $R_{out} = 50\kO$.`],
        sol: md`
1. $A_1 = -\dfrac{2\,\text{mS}}{2.02\,\text{mS}} = -0.990$.
2. $G_M = 3\,\text{mS} + (1\,\text{mS})(-0.990) = 2.010\,\text{mS}$. This time the direct path wins.
3. $R_{out} = 100\text{k}\parallel100\text{k} = 50\kO$, $A_v = -(2.010\,\text{mS})(50\kO) = -100.5$. Inverting, because $M_3$ (which inverts) wins the fight.`,
      }),
      Q(md`$v_{in}$ drives the gate of an NMOS $M_a$ at the output (source grounded) and, separately, the gate of a PMOS $M_b$ at the same output (source at $V_{DD}$). Do their contributions add or subtract?`,
        ['Add: $G_M = g_{ma} + g_{mb}$', 'Subtract: $G_M = g_{ma} - g_{mb}$', 'Only the larger one counts.', 'They cancel.'], 0,
        [null, 'Gate up makes the NMOS pull down harder and the PMOS push up less: both lower $v_{out}$.', 'Both currents land in the same short; nothing is discarded.', 'They would cancel only if one gate saw an inverted signal.'],
        md`This is the CMOS inverter amplifier: the same signal on both gates, effects in the same direction, $G_M = g_{ma} + g_{mb}$ (Problem Set 4 #2). Signs only flip when one gate sees an inverted copy, as in the example above.`),
    ],
  });

  // ================================================================ 3. mirrors
  L({
    id: 'e2-u9-mirror', title: 'Mirrors that carry signal', ref: 'Practice 3 #1–2, Problem Set 4 #3',
    steps: [
      R(md`
        ### The plan for this lesson

        A **current mirror** is two transistors with their gates tied together: one is **diode-connected** (gate wired to its own drain), the other is the **copy**. You know it from DC: it copies a bias current. Here we use it to copy a **signal** current from one branch to another.

        Where we are going:
        1. The mirror alone in small signal: why the copy is $\dfrac{g_{m2}}{g_{m1}}$ times the input, and why that ratio is the size ratio $W/L$.
        2. The main example: a common source stage whose current goes through a PMOS mirror into a load resistor. We draw the model and derive $A_v$ step by step.
        3. Why this amplifier is **non-inverting**.
      `),
      R(md`
        ### The mirror on its own

        A small-signal current $i_{in}$ flows down into the diode-connected $M_1$ (node $a$ is its gate and drain). $M_2$ shares the gate.

        **Step 1: the diode turns current into voltage.** $M_1$ has gate $= $ drain $= a$ and source at ground, so $v_{gs1} = v_a$. All the current entering $a$ goes down through $M_1$ (the gate of $M_2$ draws nothing):
        $$i_{in} = g_{m1}v_a + \frac{v_a}{r_{ds1}}\quad\Rightarrow\quad v_a = \frac{i_{in}}{g_{m1} + g_{ds1}}\approx\frac{i_{in}}{g_{m1}}$$

        **Step 2: the copy turns voltage back into current.** $M_2$ has gate at $a$, source at ground: $v_{gs2} = v_a$. With its drain held still (that is what we do when we short an output), only the dependent source carries current, from drain to source:
        $$i_{out} = g_{m2}v_a = \frac{g_{m2}}{g_{m1} + g_{ds1}}\,i_{in}\approx\frac{g_{m2}}{g_{m1}}\,i_{in}$$

        **Step 3: the ratio is the size ratio.** Both transistors have the same $V_{GS}$ (shared gate, shared source) and the same threshold, so the same overdrive $V_{ov}$. From the square law, $I_D = \tfrac12\mu C_{ox}\tfrac WL V_{ov}^2$, so at equal $V_{ov}$ the DC currents are in the ratio of $W/L$. And $g_m = \dfrac{2I_D}{V_{ov}}$, so at equal $V_{ov}$ the $g_m$'s are in the same ratio:
        $$\frac{i_{out}}{i_{in}}\approx\frac{g_{m2}}{g_{m1}} = \frac{I_{D2}}{I_{D1}} = \frac{(W/L)_2}{(W/L)_1}$$

        **Step 4: the direction.** $i_{in}$ flows **into** $M_1$'s drain, and $i_{out}$ flows **into** $M_2$'s drain. The copy flows the same way through its transistor as the original flows through the diode.

        **Example.** $i_{in} = 10\,\mu\text{A}$ and $M_2$ is twice as wide: $i_{out} = 20\,\mu\text{A}$, into $M_2$'s drain.
      `, F.mirror()),
      R(md`
        ### The main example: common source through a PMOS mirror

        $M_1$ (NMOS, gate at $v_{in}$) pulls its current through a **diode-connected PMOS** $M_2$ at node $a$. PMOS $M_3$ shares $M_2$'s gate and copies that current into a load resistor $R_L$; the output is $M_3$'s drain.

        **Step 1: write each $v_{gs}$.** The PMOS sources are on $V_{DD}$, which is ground for signals.
        - $M_1$: gate $v_{in}$, source ground. $v_{gs1} = v_{in}$.
        - $M_2$: gate and drain at $a$, source at ground. $v_{gs2} = v_a$.
        - $M_3$: gate at $a$, source at ground. $v_{gs3} = v_a$.
      `, mirrorFig),
      R(md`
        ### The small-signal model

        **Left (node $a$):** $M_1$'s $g_{m1}v_{in}$ pulls current out of $a$ down to ground. $M_2$'s $g_{m2}v_a$ points from its drain ($a$) up to its source (incremental ground). $r_{ds1}$ and $r_{ds2}$ beside them.

        **Right (the output):** $M_3$'s $g_{m3}v_a$ points from its drain (the output) up to its source (incremental ground), with $r_{ds3}$ beside it. $R_L$ from the output to ground.

        As in the previous lesson, the two halves are joined only by $v_a$ controlling $M_3$. Solve the left half first.
      `, mirrorModel),
      R(md`
        ### Step by step

        **Step 2: node $a$.** Kirchhoff's current law at $a$, currents leaving:
        $$g_{m1}v_{in} + \frac{v_a}{r_{ds1}} + g_{m2}v_a + \frac{v_a}{r_{ds2}} = 0$$
        $$v_a = -\frac{g_{m1}}{g_{m2} + g_{ds1} + g_{ds2}}\,v_{in}\approx-\frac{g_{m1}}{g_{m2}}\,v_{in}$$
        (A common source with a diode load, exactly as in Unit 8.)

        **Step 3: $G_M$, output shorted.** Only $M_3$'s dependent source carries current. It flows from the output into $M_3$, which is current pulled **out of** the output:
        $$i_{out} = g_{m3}v_a = -\frac{g_{m1}g_{m3}}{g_{m2} + g_{ds1} + g_{ds2}}\,v_{in}$$
        $$G_M = -\frac{g_{m1}g_{m3}}{g_{m2} + g_{ds1} + g_{ds2}}\approx-\frac{g_{m1}g_{m3}}{g_{m2}}$$
        $G_M$ is **negative**: when $v_{in}$ rises, current is pushed **into** the output.

        **Step 4: $R_{out}$, $v_{in}$ dead.** Then nothing drives node $a$ (the only source there was $g_{m1}v_{in}$), so $v_a = 0$ and $M_3$'s gate is still: it is just $r_{ds3}$. In parallel with $R_L$:
        $$R_{out} = R_L\parallel r_{ds3}$$

        **Step 5: the gain.**
        $$A_v = -G_MR_{out} = +\frac{g_{m1}g_{m3}}{g_{m2} + g_{ds1} + g_{ds2}}\,(R_L\parallel r_{ds3})\approx+\frac{g_{m1}g_{m3}}{g_{m2}}R_L$$

        **Numbers:** all $g_m = 2\,\text{mS}$, all $r_{ds} = 100\kO$, $R_L = 10\kO$.
        - $v_a/v_{in} = -\dfrac{2}{2 + 0.01 + 0.01} = -0.990$.
        - $G_M = (2\,\text{mS})(-0.990) = -1.98\,\text{mS}$.
        - $R_{out} = 10\text{k}\parallel100\text{k} = 9.09\kO$.
        - $A_v = -(-1.98\,\text{mS})(9.09\kO) = +18.0$.

        **Sign check in words:** $v_{in}$ up → $M_1$ pulls more current out of $a$ → $a$ (the PMOS gates) goes down → the PMOS $M_3$'s $v_{sg}$ grows → $M_3$ pushes more current into $R_L$ → $v_{out}$ up. **Non-inverting.**

        !!intuition The mirror turns a pull into a push
        A common source alone would pull current **down** out of its drain, which is inverting. The mirror takes that pulled current and delivers a copy **from the top**, into the other branch. A current that used to leave a node now enters the load node, so the sign flips back: $A_v\approx +g_{m1}R_L$ for equal sizes. With $M_3$ twice as wide as $M_2$, the copy is doubled and so is the gain.
      `),
      R(md`
        ### Where this shows up, and summary

        **Practice 3 #1** is this circuit with a **cascode** mirror (a second diode stacked on $M_2$ and a second copy device stacked on $M_3$). The extra diode carries the same current and changes nothing in the ratio, so the gain is still $+g_{m1}R_L$ for equal sizes.

        | Quantity | Result | Approximate |
        |---|---|---|
        | Mirror ratio | $\dfrac{i_{out}}{i_{in}} = \dfrac{g_{m2}}{g_{m1} + g_{ds1}}$ | $\dfrac{(W/L)_2}{(W/L)_1}$ |
        | Diode node $v_a$ | $-\dfrac{g_{m1}}{g_{m2} + g_{ds1} + g_{ds2}}v_{in}$ | $-\dfrac{g_{m1}}{g_{m2}}v_{in}$ |
        | $G_M$ | $-\dfrac{g_{m1}g_{m3}}{g_{m2} + g_{ds1} + g_{ds2}}$ (negative) | $-\dfrac{g_{m1}g_{m3}}{g_{m2}}$ |
        | $R_{out}$ | $R_L\parallel r_{ds3}$ | |
        | $A_v$ | $+\dfrac{g_{m1}g_{m3}}{g_{m2} + g_{ds1} + g_{ds2}}(R_L\parallel r_{ds3})$ | $+g_{m1}R_L\dfrac{(W/L)_3}{(W/L)_2}$ |
      `),
      P({
        id: 'e2u9-mirror-sym', title: 'Gain through a mirror',
        q: md`Find $A_v$ for the circuit in this lesson, keeping $r_{ds}$ (exact or approximate).`,
        fig: mirrorFig,
        parts: [E2.ex('gm1*gm3/(gm2 + 1/rds1 + 1/rds2)*(RL || rds3)', ['gm1', 'gm2', 'gm3', 'rds1', 'rds2', 'rds3', 'RL'], 'A_v')],
        hints: [md`Diode node: $v_a = -\dfrac{g_{m1}v_{in}}{g_{m2} + g_{ds1} + g_{ds2}}$ (a CS stage loaded by $\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}$).`, md`$M_3$'s $v_{sg} = -v_a$, so it pushes $g_{m3}(-v_a)$ into the output node.`],
        sol: md`$v_a = -g_{m1}\big(\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}\big)v_{in}$. $M_3$ pushes $-g_{m3}v_a$ into $v_{out}$, which sees $R_L\parallel r_{ds3}$:
$$A_v = \frac{g_{m1}g_{m3}}{g_{m2} + g_{ds1} + g_{ds2}}(R_L\parallel r_{ds3})\approx\frac{g_{m1}g_{m3}}{g_{m2}}R_L$$
Practice 3 #1 is this with a **cascode** mirror ($M_2$–$M_4$ on top of $M_3$–$M_5$): the extra diode in the stack changes nothing (it carries the same current), and the gain is $+g_{m1}R_L$ for equal sizes.`,
      }),
      P({
        id: 'e2u9-mirror-num', title: 'Gain through a mirror, with numbers',
        q: md`In the mirror example, every transistor has $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$, and $R_L = 5\kO$. Find $v_a/v_{in}$, $G_M$ (in mS, current pulled out of the shorted output) and $A_v$.`,
        fig: mirrorFig,
        parts: [{ lbl: 'v_a/v_{in}', unit: '', ans: -0.990099 }, { lbl: 'G_M', unit: 'mS', ans: -1.980198 }, { lbl: 'A_v', unit: '', ans: 9.42951 }],
        hints: [md`$v_a/v_{in} = -\dfrac{g_{m1}}{g_{m2} + 2/r_{ds}}$, $G_M = g_{m3}\,v_a/v_{in}$.`, md`$R_{out} = 5\text{k}\parallel100\text{k} = 4.762\kO$.`],
        sol: md`
1. $v_a/v_{in} = -\dfrac{2}{2.02} = -0.990$.
2. $G_M = (2\,\text{mS})(-0.990) = -1.980\,\text{mS}$ (negative: the output is pushed up).
3. $R_{out} = \dfrac{5\cdot100}{105}\kO = 4.762\kO$, so $A_v = -(-1.980\,\text{mS})(4.762\kO) = +9.43$.`,
      }),
      Q(md`A small-signal current $i$ flows **into** a diode-connected NMOS $M_1$ (down through it). $M_2$ (twice as wide, same $L$) mirrors it. Which way does $M_2$'s small-signal current flow, and how big is it?`,
        ['Down through $M_2$ (into its drain), $2i$', 'Up out of $M_2$\'s drain, $2i$', 'Down through $M_2$, $i/2$', 'Down through $M_2$, $\\sqrt2\\,i$'], 0,
        [null, 'The copy flows the same way through the mirror device as through the diode.', 'Upside down: the wider device carries more.', 'Same $V_{ov}$, so current is linear in $W/L$, not its square root.'],
        md`The diode's gate rises by $i/g_{m1}$, so $M_2$'s $v_{gs}$ rises and it pulls $g_{m2}\cdot i/g_{m1} = 2i$ into its drain.`),
    ],
  });

  // ================================================================ 4. folded cascode
  L({
    id: 'e2-u9-folded', title: 'Folded cascode and current division', ref: 'Practice 1 #3, Problem Set 4 #4, Lecture 16 (iii)',
    steps: [
      R(md`
        ### The plan for this lesson

        A **cascode** puts a common gate transistor on top of a common source transistor so the signal current passes straight through to the output. In a **folded cascode**, the common gate transistor is the opposite type (here a PMOS), so the signal current turns around ("folds") at a node $X$ and continues to an output below.

        The circuit (Practice 1 #3, Lecture 16 (iii)):
        - $M_1$: NMOS, gate at $v_{in}$, source grounded, drain at $X$. The input device.
        - $M_3$: PMOS current source from $V_{DD}$ into $X$ (gate held). It supplies the DC current.
        - $M_4$: PMOS, **source at $X$**, gate held, drain at the output. The common gate device that carries the signal on.
        - $R_D$: from the output to ground.
        - $M_2$: NMOS, drain on $V_{DD}$, gate held, **source at $X$**. Present in Practice 1 #3, absent in Problem Set 4 #4; we do both.

        Where we are going: each $v_{gs}$, the model with the output shorted, $G_M$ by **current division** at $X$, $R_{out}$ by the degenerated-drain formula, then numbers for both versions.
      `, F.foldedCascode()),
      R(md`
        ### Step 1: each transistor's $v_{gs}$

        $V_{DD}$, ground and every held gate are ground for signals.
        - $M_1$: gate $v_{in}$, source ground. $v_{gs1} = v_{in}$. It pulls $g_{m1}v_{in}$ out of $X$.
        - $M_3$: gate held, source on $V_{DD}$. $v_{gs3} = 0$, so only $r_{ds3}$ is left, from $X$ to ground.
        - $M_2$: gate held, source at $X$. $v_{gs2} = 0 - v_X = -v_X$. Its drain is on $V_{DD}$ (ground).
        - $M_4$: gate held, source at $X$. $v_{gs4} = -v_X$. Its drain is the output.

        **What $M_2$ looks like from $X$.** Its drain-to-source current, from ground into $X$, is $g_{m2}(-v_X) + \dfrac{0 - v_X}{r_{ds2}} = -(g_{m2} + g_{ds2})v_X$. So a current $(g_{m2} + g_{ds2})v_X$ **leaves** $X$ through $M_2$: it is a resistor $\dfrac{1}{g_{m2} + g_{ds2}} = \dfrac1{g_{m2}}\parallel r_{ds2}$ from $X$ to ground. A source whose gate is held looks small.
      `),
      R(md`
        ### Step 2: the model with the output shorted

        For $G_M$ we short the output ($v_{out} = 0$). Then $R_D$ carries nothing and is left out of the picture. Every transistor is $g_mv_{gs}$ from drain to source with $r_{ds}$ beside it:
        - $M_1$ from $X$ down to ground;
        - $M_3$: just $r_{ds3}$ up to incremental ground;
        - $M_2$ from incremental ground (its drain) down to $X$ (its source);
        - $M_4$ from the shorted output (its drain) up to $X$ (its source).

        $i_{out}$ is the current pulled out of the output node into $M_4$.
      `, foldedModel),
      R(md`
        ### Step 3: $G_M$ by current division at $X$

        **(a) $M_4$ seen from $X$.** With the output at 0, $M_4$ is exactly like $M_2$: drain at ground, gate at ground, source at $X$. So it is a resistor $\dfrac{1}{g_{m4} + g_{ds4}}$ from $X$ to ground, and the current it carries from the output up into $X$ is
        $$i_{out} = -(g_{m4} + g_{ds4})\,v_X$$

        **(b) Everything else at $X$.** Call it $R_X$: $r_{ds1}$ (with $v_{in}$ handled separately as the source $g_{m1}v_{in}$), $r_{ds3}$, and $M_2$:
        $$R_X = r_{ds1}\parallel r_{ds3}\parallel\Big(\frac1{g_{m2}}\parallel r_{ds2}\Big)$$

        **(c) Kirchhoff's current law at $X$**, currents leaving:
        $$g_{m1}v_{in} + \frac{v_X}{R_X} + (g_{m4} + g_{ds4})v_X = 0\quad\Rightarrow\quad v_X = -\frac{g_{m1}v_{in}}{1/R_X + g_{m4} + g_{ds4}}$$

        **(d) Put $v_X$ into (a):**
        $$i_{out} = g_{m1}v_{in}\,\frac{g_{m4} + g_{ds4}}{1/R_X + g_{m4} + g_{ds4}}$$
        Multiply top and bottom by $R_X/(g_{m4} + g_{ds4})$:
        $$G_M = g_{m1}\,\frac{R_X}{R_X + \frac{1}{g_{m4} + g_{ds4}}}\approx g_{m1}\,\frac{R_X}{R_X + 1/g_{m4}}$$
        This is the **current divider**: $M_1$ pulls $g_{m1}v_{in}$ out of $X$; that current is supplied partly by $R_X$ and partly by $M_4$'s source, in proportion to how easy each path is. Only the part through $M_4$ reaches the output.

        **(e) The two versions.**
        - **Without $M_2$:** $R_X = r_{ds1}\parallel r_{ds3}$, about $50\kO$, much bigger than $1/g_{m4}$. Almost all the current goes through $M_4$: $G_M\approx g_{m1}$. The fold is free.
        - **With $M_2$:** $R_X\approx\dfrac1{g_{m2}}$, as small as $M_4$'s side. The current splits between two low-resistance paths:
        $$G_M\approx g_{m1}\,\frac{1/g_{m2}}{1/g_{m2} + 1/g_{m4}} = \frac{g_{m1}g_{m4}}{g_{m2} + g_{m4}}$$
        Equal sizes: half the current is lost into $M_2$.
      `),
      R(md`
        ### Step 4: $R_{out}$, looking up into $M_4$'s drain

        Kill $v_{in}$. Looking up from the output: $M_4$, with $R_X$ at its source ($R_X$ is everything at $X$ except $M_4$, as above). Looking down: $R_D$.

        **Derivation.** Put a test voltage $v_t$ on the output and let $i_t$ flow up into $M_4$'s drain, through $M_4$, and into $R_X$. Then $v_X = i_tR_X$ and $v_{gs4} = 0 - v_X = -i_tR_X$. $M_4$'s drain-to-source current is $i_t$:
        $$i_t = g_{m4}(-i_tR_X) + \frac{v_t - i_tR_X}{r_{ds4}}$$
        Multiply by $r_{ds4}$ and collect $i_t$:
        $$i_t\,\big(r_{ds4} + g_{m4}r_{ds4}R_X + R_X\big) = v_t$$
        $$R_{UP} = \frac{v_t}{i_t} = r_{ds4} + R_X\,(1 + g_{m4}r_{ds4})$$
        This is the degenerated-drain formula from Unit 7. Then
        $$R_{out} = R_D\parallel\big[r_{ds4} + R_X(1 + g_{m4}r_{ds4})\big]$$

        **Step 5: the gain and its sign.** $G_M > 0$, so $A_v = -G_MR_{out}$ is negative. In words: $v_{in}$ up → $M_1$ pulls more out of $X$ → $X$ goes down → $M_4$'s $v_{sg}$ shrinks → less current flows down into $R_D$ → $v_{out}$ down. Inverting.
      `),
      R(md`
        ### Numbers for both versions

        All transistors $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$; $R_D = 10\kO$. Note $\dfrac{1}{g_m + g_{ds}} = \dfrac{1}{2.01\,\text{mS}} = 497.5\,\Omega$ and $g_mr_{ds} = 200$.

        **Without $M_2$:**
        1. $R_X = 100\text{k}\parallel100\text{k} = 50\kO$.
        2. $G_M = (2\,\text{mS})\dfrac{50\text{k}}{50\text{k} + 0.4975\text{k}} = (2\,\text{mS})(0.990) = 1.980\,\text{mS}$.
        3. $R_{UP} = 100\text{k} + (50\text{k})(201) = 10.15\,\text{M}\Omega$, so $R_{out} = 10\text{k}\parallel10.15\text{M} = 9.99\kO$.
        4. $A_v = -(1.980\,\text{mS})(9.99\kO) = -19.8$: essentially $-g_{m1}R_D$.

        **With $M_2$:**
        1. $R_X = 50\text{k}\parallel497.5\,\Omega$: conductances $0.02 + 2.01 = 2.03\,\text{mS}$, so $R_X = 492.6\,\Omega$.
        2. $G_M = (2\,\text{mS})\dfrac{492.6}{492.6 + 497.5} = (2\,\text{mS})(0.4975) = 0.995\,\text{mS}$.
        3. $R_{UP} = 100\text{k} + (492.6)(201) = 100\text{k} + 99.0\text{k} = 199.0\kO$, so $R_{out} = 10\text{k}\parallel199\text{k} = 9.52\kO$.
        4. $A_v = -(0.995\,\text{mS})(9.52\kO) = -9.47$: about half.

        !!intuition Current takes the easy path
        $M_1$ pulls a signal current out of $X$. Every branch at $X$ offers to supply it, and each supplies a share in proportion to its **conductance**. A drain ($r_{ds}$) offers almost nothing; a source with its gate held ($\approx1/g_m$) offers a lot. Without $M_2$, $M_4$'s source is the only easy path, so it supplies nearly everything. Add $M_2$ (another source with a held gate) and the two share it equally. The output also loses some resistance, because $M_4$'s degeneration $R_X$ shrank from $50\kO$ to $493\,\Omega$.

        ### Summary

        | Quantity | Formula | No $M_2$ | With $M_2$ |
        |---|---|---|---|
        | $R_X$ (all at $X$ except $M_4$) | $r_{ds1}\parallel r_{ds3}\,[\parallel\tfrac1{g_{m2}}\parallel r_{ds2}]$ | $50\kO$ | $493\,\Omega$ |
        | $G_M$ | $g_{m1}\dfrac{R_X}{R_X + 1/(g_{m4} + g_{ds4})}$ | $1.98\,\text{mS}\approx g_{m1}$ | $0.995\,\text{mS}\approx\tfrac12g_{m1}$ |
        | $R_{out}$ | $R_D\parallel[r_{ds4} + R_X(1 + g_{m4}r_{ds4})]$ | $9.99\kO$ | $9.52\kO$ |
        | $A_v$ | $-G_MR_{out}$ | $-19.8$ | $-9.47$ |
      `),
      P({
        id: 'e2u9-folded-gm', title: 'Folded cascode $G_M$ (no $M_2$)',
        q: md`Remove $M_2$ from the folded cascode. Find $G_M$ (current pulled out of the shorted output per $v_{in}$), keeping $r_{ds}$. Exact or approximate.`,
        fig: [['rail', [3, -0.6]], ['pmos', [3, 0.4], { n: 'M_3' }], ['acg', [2, 0.4]], ['w', [1, 1.4], [3, 1.4]], ['node', [1.4, 1.4], { n: 'X', side: 'a' }], ['nmos', [1, 2.4], { n: 'M_1' }], ['gnd', [1, 3.4]], ['w', [0, 2.4], [-0.6, 2.4], [-0.6, 2.8]], ...vin(-0.6, 2.8),
          ['pmos', [3, 2.4], { n: 'M_4', flip: true }], ['acg', [4, 2.4], { dir: 'u' }], ['w', [3, 3.4], [3.9, 3.4]], ['term', [3.9, 3.4], { n: 'v_{out}' }], ['R', [3, 3.4], [3, 4.6], { n: 'R_D' }], ['gnd', [3, 4.6]]],
        parts: [E2.ex('gm1*(rds1 || rds3)/((rds1 || rds3) + 1/(gm4 + 1/rds4))', ['gm1', 'gm4', 'rds1', 'rds3', 'rds4'], 'G_M')],
        hints: [md`With $v_{out}$ shorted, $M_4$'s source looks like $\tfrac1{g_{m4}}\parallel r_{ds4}$.`, md`Current division at $X$ between $r_{ds1}\parallel r_{ds3}$ and that.`],
        sol: md`$R_X = r_{ds1}\parallel r_{ds3}$; $M_4$'s source (drain shorted) is $\tfrac1{g_{m4}}\parallel r_{ds4}$. The share of $g_{m1}v_{in}$ through $M_4$:
$$G_M = g_{m1}\frac{r_{ds1}\parallel r_{ds3}}{(r_{ds1}\parallel r_{ds3}) + \frac1{g_{m4}}\parallel r_{ds4}}\approx g_{m1}$$
The fold is free when nothing else at $X$ competes with $M_4$'s source. (Problem Set 4 #4 is this circuit with an NMOS input and $A_v\approx-g_{m1}R_D$.)`,
      }),
      P({
        id: 'e2u9-folded-num', title: 'Folded cascode with $M_2$, with numbers',
        q: md`Full folded cascode (with $M_2$). All transistors $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, and $R_D = 5\kO$. Find $R_X$, $G_M$, $R_{out}$ and $A_v$.`,
        fig: F.foldedCascode(),
        parts: [{ lbl: 'R_X', unit: 'Ω', ans: 492.611 }, { lbl: 'G_M', unit: 'mS', ans: 0.995050 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4.87745 }, { lbl: 'A_v', unit: '', ans: -4.85331 }],
        hints: [md`$R_X = r_{ds1}\parallel r_{ds3}\parallel\dfrac{1}{g_{m2} + g_{ds2}}$; conductances $0.01 + 0.01 + 2.01\,\text{mS}$.`, md`$R_{out} = R_D\parallel[r_{ds4} + R_X(1 + g_{m4}r_{ds4})]$.`],
        sol: md`
1. $R_X = 1/(2.03\,\text{mS}) = 492.6\,\Omega$.
2. $G_M = (2\,\text{mS})\dfrac{492.6}{492.6 + 497.5} = 0.995\,\text{mS}$ (the same as before: $R_D$ does not enter $G_M$).
3. $R_{UP} = 100\text{k} + 492.6\times201 = 199.0\kO$; $R_{out} = 5\text{k}\parallel199\text{k} = \dfrac{5\cdot199}{204}\kO = 4.877\kO$.
4. $A_v = -(0.995\,\text{mS})(4.877\kO) = -4.85$.`,
      }),
    ],
  });

  // ================================================================ 5. DC
  L({
    id: 'e2-u9-dc', title: 'Problem 1: DC bias with mirrors and stacks', ref: 'Practice 2 #1, Problem Set 4 #3–4',
    steps: [
      R(md`
        ### The plan for this lesson

        Some papers open with a **DC** problem (Practice 2 #1, Problem Set 4 #3–4). No small signal here: we find the actual bias currents and voltages. Typical questions: "find the currents", "find $V_1$", "find the resistor (or the bias voltage) that puts a transistor at the **edge of saturation**".

        You need exactly three tools, and we derive each one:
        1. The **square law**, turned into "current → overdrive".
        2. The **mirror ratio** from transistor sizes.
        3. The **edge-of-saturation** condition, written as drain versus gate.

        Then a warm-up example, then Practice Exam 2 #1 completely worked.

        Course parameters: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $V_{TN} = |V_{TP}| = 1\,\text{V}$.
      `),
      R(md`
        ### Tool 1: from current to overdrive

        **Step 1: the square law** (saturation). The **overdrive** is $V_{ov} = V_{GS} - V_{TN}$ for NMOS, $V_{ov} = V_{SG} - |V_{TP}|$ for PMOS:
        $$I_D = \tfrac12\,\mu C_{ox}\,\frac WL\,V_{ov}^2$$

        **Step 2: lump the constants.** Write $K = \tfrac12\mu C_{ox}\dfrac WL$. Then $I_D = KV_{ov}^2$, so
        $$V_{ov} = \sqrt{\frac{I_D}{K}},\qquad V_{GS} = V_{TN} + V_{ov}\ \ (\text{NMOS}),\qquad V_{SG} = |V_{TP}| + V_{ov}\ \ (\text{PMOS})$$

        **Step 3: the $K$ values you will meet** (Practice 2 uses $1x = 50/1$):
        - NMOS $1x$ ($W/L = 50$): $K = \tfrac12(100)(50) = 2500\,\mu\text{A/V}^2$.
        - NMOS $2x$ ($W/L = 100$): $K = 5000\,\mu\text{A/V}^2$.
        - PMOS $2x$ ($W/L = 100$): $K = \tfrac12(50)(100) = 2500\,\mu\text{A/V}^2$.
        - PMOS $8x$ ($W/L = 400$): $K = \tfrac12(50)(400) = 10000\,\mu\text{A/V}^2$.

        **Example.** NMOS $1x$ at $100\,\mu\text{A}$: $V_{ov} = \sqrt{100/2500} = \sqrt{0.04} = 0.2\,\text{V}$, so $V_{GS} = 1.2\,\text{V}$. PMOS $8x$ at $100\,\mu\text{A}$: $V_{ov} = \sqrt{100/10000} = 0.1\,\text{V}$, $V_{SG} = 1.1\,\text{V}$.

        **Rule of thumb:** same current, $4\times$ larger $K$ → half the overdrive (square root of 4).
      `),
      R(md`
        ### Tool 2: the mirror ratio from sizes

        **Step 1: what is shared.** In a mirror, the diode-connected device and the copy have their gates tied and their sources on the same rail. So they have the **same $V_{GS}$**, and (same threshold) the **same $V_{ov}$**.

        **Step 2: divide the two square laws.** $I_1 = K_1V_{ov}^2$, $I_2 = K_2V_{ov}^2$. The $V_{ov}^2$ cancels, and so does $\tfrac12\mu C_{ox}$ (same type of transistor):
        $$\frac{I_2}{I_1} = \frac{K_2}{K_1} = \frac{(W/L)_2}{(W/L)_1}$$

        **Step 3: series devices.** Two transistors in series (one drain into the other's source, nothing else at the node) carry the **same** current, whatever their sizes. Their overdrives then differ: $V_{ov}\propto1/\sqrt{K}$.

        **Example.** A $1x$ diode carries $100\,\mu\text{A}$. A $2x$ copy carries $200\,\mu\text{A}$; a $3x$ copy carries $300\,\mu\text{A}$. (Only true while the copy is in saturation, which is what Tool 3 checks.)
      `),
      R(md`
        ### Tool 3: the edge of saturation, as drain versus gate

        **Step 1: NMOS.** Saturation needs $V_{DS}\ge V_{ov} = V_{GS} - V_{TN}$. Write each side with node voltages:
        $$V_D - V_S\ \ge\ V_G - V_S - V_{TN}$$
        $V_S$ cancels on both sides:
        $$V_D\ \ge\ V_G - V_{TN}$$
        **Edge of saturation:** $V_D = V_G - V_{TN}$. The drain may sit at most one threshold **below** the gate.

        **Step 2: PMOS.** Saturation needs $V_{SD}\ge V_{ov} = V_{SG} - |V_{TP}|$:
        $$V_S - V_D\ \ge\ V_S - V_G - |V_{TP}|$$
        Cancel $V_S$ and multiply by $-1$ (which flips the inequality):
        $$V_D\ \le\ V_G + |V_{TP}|$$
        **Edge of saturation:** $V_D = V_G + |V_{TP}|$. The drain may sit at most one threshold **above** the gate.

        **Why this form is handy:** you never need the source voltage. In a mirror the gate voltage is already known from Tool 1, so the edge-of-saturation drain voltage follows in one line.
      `),
      R(md`
        ### Warm-up example: how big can $R_D$ be?

        $100\,\mu\text{A}$ flows into a $1x$ NMOS diode $M_1$ ($W/L = 50$). $M_2$ is $3x$ ($W/L = 150$), shares the gate, and has $R_D$ from its drain to $V_{DD} = 5\,\text{V}$. Find $I_{D2}$, and the largest $R_D$ that keeps $M_2$ in saturation.

        **Step 1: the gate voltage (Tool 1).** $M_1$: $K = 2500\,\mu\text{A/V}^2$, $V_{ov} = \sqrt{100/2500} = 0.2\,\text{V}$, so $V_G = V_{GS} = 1.2\,\text{V}$.

        **Step 2: the copied current (Tool 2).**
        $$I_{D2} = 100\,\mu\text{A}\times\frac{150}{50} = 300\,\mu\text{A}$$

        **Step 3: the edge of saturation (Tool 3).** NMOS: $V_{D2} = V_G - V_{TN} = 1.2 - 1 = 0.2\,\text{V}$. A bigger $R_D$ drops more voltage and pulls the drain lower, so this is the **lowest** allowed drain voltage.

        **Step 4: turn it into a resistor** (Ohm's law across $R_D$):
        $$R_{D,max} = \frac{V_{DD} - V_{D2}}{I_{D2}} = \frac{5 - 0.2}{300\,\mu\text{A}} = \frac{4.8\,\text{V}}{0.3\,\text{mA}} = 16\kO$$

        **Check:** $M_2$'s own overdrive is $\sqrt{300/7500} = 0.2\,\text{V}$ (same as $M_1$, as Tool 2 said), and at the edge $V_{DS} = 0.2\,\text{V} = V_{ov}$. Consistent.
      `, dcMirror),
      R(md`
        ### Practice Exam 2 #1: the circuit, and part (a)

        ($1x = 50/1$, $V_{DD} = 5\,\text{V}$.) (a) Find $V_1$, $I_1$, $I_2$. (b) Find $R_1$ so that $M_4$ is at the edge of saturation. (c) Find $V_A$ so that $M_1$ is at the edge of saturation.

        **Read the circuit first.** The $100\,\mu\text{A}$ source sits in one branch: $V_{DD}$ → diode-connected PMOS $M_5$ → $R_1$ → the $100\,\mu\text{A}$ source → diode-connected NMOS $M_0$ → ground. Everything in that branch carries $100\,\mu\text{A}$. Two mirrors copy it: $M_0\to M_1$ (NMOS) and $M_5\to M_4$ (PMOS).

        **Step 1: $I_1$ (Tool 2).** $M_0$ is $1x$ with $100\,\mu\text{A}$; $M_1$ is $2x$ with the same $V_{GS}$:
        $$I_1 = 100\,\mu\text{A}\times\frac{2}{1} = 200\,\mu\text{A}$$
        $M_2$ is in series with $M_1$, so it carries $200\,\mu\text{A}$ too.

        **Step 2: $M_4$'s current.** $M_5$ ($2x$) carries $100\,\mu\text{A}$; $M_4$ ($2x$, same $V_{SG}$) copies $100\,\mu\text{A}$. $M_3$ is in series below $M_4$, so $100\,\mu\text{A}$ flows down through $M_3$ into node $V_1$.

        **Step 3: Kirchhoff's current law at $V_1$.** In: $100\,\mu\text{A}$ from $M_3$ and $I_2$ down through the $25\kO$. Out: $I_1 = 200\,\mu\text{A}$ down through $M_2$.
        $$100\,\mu\text{A} + I_2 = 200\,\mu\text{A}\quad\Rightarrow\quad I_2 = 100\,\mu\text{A}$$

        **Step 4: $V_1$** (Ohm's law across the $25\kO$):
        $$V_1 = 5 - (25\kO)(100\,\mu\text{A}) = 5 - 2.5 = 2.5\,\text{V}$$
      `, p2fig1),
      R(md`
        ### Practice Exam 2 #1, part (b): $R_1$ for $M_4$ at the edge

        **Step 1: $M_5$'s gate (Tool 1).** PMOS $2x$: $K = 2500\,\mu\text{A/V}^2$. At $100\,\mu\text{A}$: $V_{ov} = 0.2\,\text{V}$, $V_{SG5} = 1.2\,\text{V}$. Its source is at $5\,\text{V}$, so its gate (and drain, the top of $R_1$) is
        $$V_{G5} = 5 - 1.2 = 3.8\,\text{V}$$
        $M_4$ shares this gate: $V_{G4} = 3.8\,\text{V}$.

        **Step 2: where $M_4$'s drain must be (Tool 3, PMOS).**
        $$V_{D4} = V_{G4} + |V_{TP}| = 3.8 + 1 = 4.8\,\text{V}$$

        **Step 3: what sets $M_4$'s drain.** $M_4$'s drain is $M_3$'s source. $M_3$ is PMOS $8x$: $K = 10000\,\mu\text{A/V}^2$, at $100\,\mu\text{A}$: $V_{ov} = 0.1\,\text{V}$, $V_{SG3} = 1.1\,\text{V}$. So
        $$V_{D4} = V_{S3} = V_{G3} + 1.1$$

        **Step 4: solve for $M_3$'s gate.**
        $$V_{G3} + 1.1 = 4.8\quad\Rightarrow\quad V_{G3} = 3.7\,\text{V}$$

        **Step 5: turn it into $R_1$.** $M_3$'s gate is the bottom of $R_1$. $R_1$ carries the $100\,\mu\text{A}$ and drops from $3.8\,\text{V}$ to $3.7\,\text{V}$:
        $$R_1 = \frac{3.8 - 3.7}{100\,\mu\text{A}} = \frac{0.1\,\text{V}}{0.1\,\text{mA}} = 1\kO$$
      `),
      R(md`
        ### Practice Exam 2 #1, part (c): $V_A$ for $M_1$ at the edge

        **Step 1: $M_1$'s gate.** $M_0$ ($1x$, $100\,\mu\text{A}$): $V_{ov} = 0.2\,\text{V}$, $V_{GS0} = 1.2\,\text{V}$. $M_1$ shares it: $V_{G1} = 1.2\,\text{V}$.

        **Step 2: where $M_1$'s drain must be (Tool 3, NMOS).**
        $$V_{D1} = V_{G1} - V_{TN} = 1.2 - 1 = 0.2\,\text{V}$$

        **Step 3: what sets $M_1$'s drain.** It is $M_2$'s source. $M_2$ is NMOS $2x$ ($K = 5000\,\mu\text{A/V}^2$) carrying $200\,\mu\text{A}$: $V_{ov2} = \sqrt{200/5000} = 0.2\,\text{V}$, $V_{GS2} = 1.2\,\text{V}$.

        **Step 4: solve for $M_2$'s gate, which is $V_A$.**
        $$V_A = V_{S2} + V_{GS2} = 0.2 + 1.2 = 1.4\,\text{V}$$

        !!intuition The pattern of every DC mirror problem
        Currents first (mirrors copy in proportion to size, series devices share, Kirchhoff's current law where branches meet a resistor). Then overdrives from $I = KV_{ov}^2$. Then the edge of saturation compares **drain to gate**, never to source, and the source voltage of the next device up the stack ($V_G\pm V_{GS}$) closes the loop.

        ### Summary: the recipe

        | Step | What you do | Practice 2 #1 |
        |---|---|---|
        | 1. Currents | mirror ratio $= (W/L)$ ratio; series = same current; KCL at resistor nodes | $I_1 = 200$, $I_2 = 100\,\mu\text{A}$ |
        | 2. Overdrives | $V_{ov} = \sqrt{I/K}$, $K = \tfrac12\mu C_{ox}W/L$ | $0.2$, $0.1\,\text{V}$ |
        | 3. Edge | NMOS $V_D = V_G - V_{TN}$; PMOS $V_D = V_G + \lvert V_{TP}\rvert$ | $V_{D4} = 4.8$, $V_{D1} = 0.2\,\text{V}$ |
        | 4. Close the loop | next device: $V_S = V_G \pm V_{GS}$; Ohm's law for the resistor | $R_1 = 1\kO$, $V_A = 1.4\,\text{V}$ |
      `),
      G('mirror_ratio', { need: 2 }),
      G('stack_vov', { need: 2 }),
      G('mirror_rmax', { need: 2 }),
      P({
        id: 'e2u9-dc-num', title: 'Mirror and the largest drain resistor',
        q: md`In the warm-up circuit, make $M_2$ a $4x$ device ($W/L = 200$); $M_1$ stays $1x$ ($W/L = 50$) with $100\,\mu\text{A}$, $V_{DD} = 5\,\text{V}$. Find $V_{GS}$, $I_{D2}$ and the largest $R_D$ that keeps $M_2$ in saturation.`,
        fig: dcMirror,
        parts: [{ lbl: 'V_{GS}', unit: 'V', ans: 1.2 }, { lbl: 'I_{D2}', unit: 'µA', ans: 400 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 12 }],
        hints: [md`$V_{ov} = \sqrt{100/2500}$. The copy is $200/50 = 4$ times the reference.`, md`Edge: $V_{D2} = V_G - V_{TN}$; then $R_D = (V_{DD} - V_{D2})/I_{D2}$.`],
        sol: md`
1. $K_1 = 2500\,\mu\text{A/V}^2$, $V_{ov} = 0.2\,\text{V}$, $V_{GS} = 1.2\,\text{V}$.
2. $I_{D2} = 100\times4 = 400\,\mu\text{A}$.
3. Edge: $V_{D2} = 1.2 - 1 = 0.2\,\text{V}$, so $R_{D,max} = \dfrac{5 - 0.2}{0.4\,\text{mA}} = 12\kO$.`,
      }),
    ],
  });

  // ================================================================ 6. playbook
  L({
    id: 'e2-u9-playbook', title: 'Exam playbook', ref: 'All five practice exams',
    steps: [
      R(md`
        ### The paper

        Three problems, 60 minutes, 100 points, no calculator. Across the five practice exams the problems are always of these kinds:

        | Problem | What it is | Where to practise |
        |---|---|---|
        | 1 (20–35 pts) | short answers, or one numeric gain with $W/L$ given and $r_{ds}$ ignored, or a DC mirror problem | Units 6, 8 (numeric gains), 9 (DC) |
        | 2 (30–40 pts) | two impedances $R_{EQ1}$, $R_{EQ2}$, "$r_{ds}\ne\infty$, $g_mr_{ds}\gg1$" | Unit 7, flashcards |
        | 3 (35–40 pts) | $G_M$, $R_{in}$, $R_{out}$, or a chain $A_1$, $A_2$, $A_v$ | Units 8–9 |

        Below: one procedure for impedances, one for gains, how to collect partial credit, and four checks.
      `),
      R(md`
        ### For every impedance question

        1. **Mark the node and kill every independent source.** $V_{DD}$, bias voltages and held gates become ground; DC current sources become open circuits.
        2. **Split into branches.** $R_{UP}$ (everything above the node), $R_{DN}$ (everything below), and note any transistor whose **gate** connects to the node (it draws no current, but it may copy the node's movement somewhere else).
        3. **Work each branch from its far end toward the node**, replacing what you have finished with one resistance. The three building blocks:
           - a diode-connected transistor: $\tfrac1{g_m}$ (gate follows the node);
           - looking into a drain with $R$ under the source: $r_{ds} + R(1 + g_mr_{ds})\approx r_{ds}(1 + g_mR)$;
           - looking into a source with $R_D$ on the drain: $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\tfrac1{g_m}\big(1 + R_D/r_{ds}\big)$.
        4. **Gates that move.** If a gate elsewhere follows the node by a factor $K$, use the K rule from Unit 7 (the extra current that gate makes divides the branch resistance).
        5. **Parallel everything.** Then simplify with $g_mr_{ds}\gg1$, but **keep** an $r_{ds}$ that has nothing smaller in parallel with it.
      `),
      R(md`
        ### For every gain question

        1. **Name the stages and count inversions.** Common source inverts; common gate, source follower, dividers and mirrors do not. The sign is decided before any algebra.
        2. **Write each transistor's $v_{gs}$** in one line ($v_g - v_s$, with held nodes at 0). Draw the model if anything is unclear: $g_mv_{gs}$ from drain to source, $r_{ds}$ beside it.
        3. **$G_M$ with the output shorted:** add the $g_mv_{gs}$ of every transistor on the output (paths add, or fight if one gate sees an inverted copy). Use current division where the signal current passes a node with several branches (folded cascode).
        4. **$R_{out}$ with $v_{in}$ dead:** $R_{UP}\parallel R_{DN}$, using the impedance procedure above.
        5. **$A_v = -G_MR_{out}$.** For chains, $A_v = A_1A_2$ with $v_1$ computed **with the next stage attached**.

        !!key Partial credit
        Practice 1 says "**Please box your intermediate answers.**" Write $R_{UP}$, $R_{DN}$, $G_M$, $R_{out}$ separately and box each one before combining. A wrong final answer with correct boxed pieces still earns most of the points.
      `),
      R(md`
        ### Checks that catch most mistakes

        - **Units:** a resistance must come out in ohms; $g_mr_{ds}$ and $g_mR$ are dimensionless; $G_M$ is in siemens.
        - **Limits:** set $r_{ds}\to\infty$ and see whether you get the textbook result; set $R_S = 0$ and see whether the degenerated formula becomes the plain one.
        - **Size:** a node touching a source or a diode is about $1/g_m$ (hundreds of ohms); a node touching only drains is about $r_{ds}$ or more (hundreds of kilohms).
        - **Sign:** one sentence of "$v_{in}$ up → ... → $v_{out}$ ..." must agree with your answer.

        **Last pass before the exam:** the [flashcards](#/cards) until all are known, then the [stage sheet](#/sheet).
      `),
    ],
  });
})();

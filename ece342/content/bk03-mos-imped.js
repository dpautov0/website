/* Chapter 3 — Looking into a MOSFET: every terminal resistance, derived (book unit bk03).
   The test-source method on a transistor; the gate (infinite), the drain (r_ds), the source (about 1/g_m, and
   (r_ds + R_D)/(1 + g_m r_ds) with a drain load), the diode-connected transistor, degeneration as an impedance
   scaler, gates that move (the K rule), cascodes and the regulated cascode, and a node as R_UP || R_DN.
   Figures and drills: js/gens-bk-a2.js (window.BK3F, GENS.bk_mi_*). Every number below was computed by an independent
   nodal solve of the small-signal circuit (and the PMOS results checked against a large-signal square-law solve). */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk03', l);
  const { F, S } = window.BK3F;
  // several drawings side by side: row([{fig, cap}, ...]) is a figure entry for RF; rowSvg(...) a figure for R/P
  const row = (items, cap) => Object.assign(window.DRAW.row(items), cap ? { cap } : {});
  const rowSvg = (items) => window.DRAW.row(items).svg;

  // ================================================================== shared pictures
  // symbols and their models: NMOS (drain up) and PMOS (source up). The model current g_m v_gs points drain -> source.
  const nSym = [['nmos', [1, 1]], ['w', [1, 0], [1, -0.4]], ['term', [1, -0.4], { n: 'D', side: 'r' }], ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: 'S', side: 'r' }],
    ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'G', side: 'l' }]];
  const nMod = [['term', [2, -0.6], { n: 'D', side: 'r' }], ['w', [2, -0.6], [2, 0]], ...S.mos(2, 0, 2), ['w', [2, 2], [2, 2.6]], ['term', [2, 2.6], { n: 'S', side: 'r' }],
    ...S.gport(0.3, 0.5, 2, 2)];
  const pSym = [['pmos', [1, 1]], ['w', [1, 0], [1, -0.4]], ['term', [1, -0.4], { n: 'S', side: 'r' }], ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: 'D', side: 'r' }],
    ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: 'G', side: 'l' }]];
  const pMod = [['term', [2, -0.6], { n: 'S', side: 'r' }], ['w', [2, -0.6], [2, 0]], ...S.mos(2, 2, 0), ['w', [2, 2], [2, 2.6]], ['term', [2, 2.6], { n: 'D', side: 'r' }],
    ['term', [0.3, 1.5], { n: 'G', side: 'b' }], ['term', [0.3, 0.6]], ['w', [0.3, 0.6], [0.3, 0], [2, 0]], ['vlab', [0.55, 1.35], [0.55, 0.75], { n: 'v_{gs}' }]];

  // ================================================================== 1. the test-source method
  const box = [['box', [0, 0], [2.4, 2], { n: 'linear circuit,<br/>sources off' }], ['w', [1.2, 2], [1.2, 2.4]], ['gnd', [1.2, 2.4]],
    ['node', [2.4, 1], { n: 'X', side: 'ar', dot: true }], ...S.test(2.4, 1, { dx: 1.8 })];
  const vinB = (gx, y) => [['w', [gx, y], [gx - 0.7, y], [gx - 0.7, y + 0.3]], ['Vac', [gx - 0.7, y + 0.3], [gx - 0.7, y + 1.3], { n: 'v_{in}', side: 'l' }],
    ['V', [gx - 0.7, y + 1.3], [gx - 0.7, y + 2.5], { n: 'V_B', side: 'l' }], ['gnd', [gx - 0.7, y + 2.5]]];
  const cs0 = [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [2, 0]], ['term', [2, 0], { n: 'v_{out}', side: 'r' }],
    ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ...vinB(0, 1)];
  const cs1 = [['gndu', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.7, 1], [-0.7, 1.5]], ['gnd', [-0.7, 1.5]], ['txt', [-0.85, 0.7], '$v_{in} = 0$', { a: 'r' }], ...S.test(1, 0, { dx: 1.6 })];
  const cs2 = [['gndu', [3.4, -1.4]], ['R', [3.4, -1.4], [3.4, 0], { n: 'R_D' }], ...S.mos(1, 0, 2), ['w', [2.3, 0], [3.4, 0]], ['gnd', [1.65, 2]],
    ...S.gport(-0.8, 0.5, 1, 2, { gnd: true }), ['txt', [1.65, -0.35], '$M_1$'], ['node', [3.4, 0], { n: 'v_{out}', side: 'al' }], ...S.test(3.4, 0)];
  const src0 = [['rail', [1, 0], { n: 'V_{DD}' }], ['nmos', [1, 1]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['V', [-0.6, 1.3], [-0.6, 2.5], { n: 'V_B', side: 'l' }], ['gnd', [-0.6, 2.5]],
    ['w', [1, 2], [1, 2.4]], ['term', [1, 2.4], { n: '\\uparrow R', side: 'r' }]];
  const src1 = [['gndu', [2, -0.6]], ['w', [2, -0.6], [2, 0]], ['txt', [2.15, -0.3], '$D$', { a: 'l' }], ...S.mos(2, 0, 2), ...S.gport(0.4, 0.5, 2, 2, { gnd: true }),
    ['node', [2.65, 2], { n: 'S', side: 'b' }], ...S.test(3.3, 2)];
  const killFig = [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [2, 0]], ['term', [2, 0], { n: 'v_{out}', side: 'r' }],
    ['nmos', [1, 1], { n: 'M_1' }], ['R', [1, 2], [1, 3.2], { n: 'R_S', side: 'l' }], ['w', [1, 2], [2, 2]], ['C', [2, 2], [2, 3.2], { n: 'C_S' }], ['w', [1, 3.2], [2, 3.2]], ['gnd', [1.5, 3.2]],
    ['w', [0, 1], [-1, 1]], ['R', [-1, 1], [-1, 2.2], { n: 'R_G', side: 'l' }], ['V', [-1, 2.2], [-1, 3.4], { n: 'V_B', side: 'l' }], ['gnd', [-1, 3.4]],
    ['C', [-2.2, 1], [-1, 1], { n: 'C_{in}' }], ['w', [-2.2, 1], [-2.2, 1.4]], ['Vac', [-2.2, 1.4], [-2.2, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-2.2, 2.4]]];
  const pcsFig = [['rail', [1, 0], { n: 'V_{DD}' }], ['pmos', [1, 1], { n: 'M_1' }], ['w', [1, 2], [2, 2]], ['term', [2, 2], { n: 'v_{out}', side: 'r' }],
    ['R', [1, 2], [1, 3.2], { n: 'R_D' }], ['gnd', [1, 3.2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]]];
  const vccsFig = [['node', [1, 0], { n: 'v_x', side: 'a', dot: true }], ['w', [1, 0], [2.4, 0]], ['G', [1, 0], [1, 1.6], { n: 'g\\,v_x', side: 'l' }], ['gnd', [1, 1.6]],
    ['R', [2.4, 0], [2.4, 1.6], { n: 'R' }], ['gnd', [2.4, 1.6]], ['w', [2.4, 0], [3.4, 0]], ['term', [3.4, 0], { n: '\\leftarrow R_X', side: 'r' }]];
  const psrcNode = [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_S' }], ['pmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['gnd', [1, 2]],
    ['w', [1, 0], [2, 0]], F.lookR([2, 0], 'R_X')];

  L({
    id: 'bk03-test', title: 'The test-source method on a transistor', ref: 'Lectures 14–15',
    steps: [
      R(md`
        ### Chapter 3 at a glance

        This chapter answers one question, over and over, until it is automatic: **what small-signal resistance do you see when you look into a node of a MOSFET circuit?** Every gain in Chapter 4 is $A_v = -G_MR_{out}$, every bandwidth in Chapters 12 and 13 is built from $1/RC$, and Problem 2 of Exam 2 is an $R_{EQ}$. All of them need this one skill.

        **What you will be able to do** by the end of the chapter:
        - put a test source on any node, replace each transistor by its model, and find the resistance step by step;
        - say at a glance what each terminal looks like, and *why*: the gate is infinite, the drain is $r_{ds}$, the source is about $1/g_m$;
        - handle the five situations the exams use: the diode-connected transistor, a resistor under the source (degeneration), a resistor on the drain seen from the source, a gate that moves (the K rule), and stacks (cascodes);
        - split any node into $R_{UP}\parallel R_{DN}$ and know at once which branch wins.

        **What you need first:** the small-signal model of [Chapter 2](#/l/bk02-model) (a current $g_mv_{gs}$ plus $v_{ds}/r_{ds}$ from drain to source, nothing into the gate, the same for a PMOS: [why](#/l/bk02-pmodel)); what becomes ground for small signals ([Chapter 1](#/l/bk01-two)); and the test-source method for circuits with dependent sources ([Chapter 1](#/l/bk01-test)). This section recalls each of them as it goes.

        | Section | Looking into | Result |
        |---|---|---|
        | [The gate](#/l/bk03-gate) | the gate | $\infty$ |
        | [The drain](#/l/bk03-drain) | the drain, gate and source still | $r_{ds}$ |
        | [The source](#/l/bk03-source) | the source, gate still | $\tfrac{1}{g_m}\parallel r_{ds}$; with $R_D$ on the drain $\dfrac{r_{ds}+R_D}{1+g_mr_{ds}}$ |
        | [The diode](#/l/bk03-diode) | gate tied to drain | $\tfrac{1}{g_m}\parallel r_{ds}$ |
        | [Degeneration](#/l/bk03-degen) | the drain, $R_S$ under the source | $r_{ds} + R_S + g_mr_{ds}R_S$ |
        | [The K rule](#/l/bk03-k) | the drain, gate moving by $Kv_t$ | $\dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$ |
        | [Cascodes](#/l/bk03-cascode) | the top of a stack | $r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}$ |
        | [A node](#/l/bk03-node) | any node | $R_{UP}\parallel R_{DN}$ |
      `),
      R(md`
        ### The question

        How do we find the resistance at a node when the circuit contains transistors? For a network of resistors we would combine them in series and in parallel. A transistor is not a resistor: its current depends on the voltages at all three of its terminals at once. We need a method that works for any linear circuit, including circuits with dependent sources. That method is the **test source**, and this section runs it on a transistor slowly, with the small-signal circuit drawn at every step.

        ### The physical picture: wiggle the node, measure the current

        Imagine the circuit sitting at its DC operating point. Grab one node and wiggle its voltage by a tiny amount $v_t$, say $1\,\text{mV}$. Some extra current $i_t$ has to flow into the node to make that happen. The ratio
        $$R = \frac{v_t}{i_t}$$
        is the **small-signal resistance** of the node. A node that soaks up a lot of current for a small wiggle has a **low** resistance; a node that barely takes any current has a **high** resistance. It is the question an ohmmeter asks, except that we ask it about *changes* around the bias point, not about the DC voltage and current themselves.

        A MOSFET responds to a wiggle through two handles, one strong and one weak:
        - **$v_{gs}$, the strong handle.** Each millivolt of $v_{gs}$ changes the drain current by $g_m\times1\,\text{mV}$. At $g_m = 2\,\text{mS}$ that is $2\,\mu\text{A}$.
        - **$v_{ds}$, the weak handle.** Each millivolt of $v_{ds}$ changes the current by only $1\,\text{mV}/r_{ds}$. At $r_{ds} = 100\kO$ that is $0.01\,\mu\text{A}$, two hundred times less.

        And the gate itself is an insulated plate: no current ever enters it.

        | Wiggle a terminal so that | Current per mV | Resistance | Which terminal does this |
        |---|---|---|---|
        | $v_{gs}$ changes | $2\,\mu\text{A}$ | $1/g_m = 500\,\Omega$ | the source |
        | only $v_{ds}$ changes | $0.01\,\mu\text{A}$ | $r_{ds} = 100\kO$ | the drain |
        | nothing can flow in | $0$ | $\infty$ | the gate |

        This table is the whole chapter in miniature; the rest of the chapter makes it exact. Throughout, a "typical transistor" is biased at $I_D = 0.2\,\text{mA}$ with $V_{ov} = 0.2\,\text{V}$ and $\lambda = 0.05\,\text{V}^{-1}$, so $g_m = 2I_D/V_{ov} = 2\,\text{mS}$, $r_{ds} = 1/(\lambda I_D) = 100\kO$, and $g_mr_{ds} = 200$.
      `),
      RF(md`
        ### The model we use

        In saturation, for small changes around the bias point, a MOSFET is replaced by this model ([Chapter 2](#/l/bk02-model) derives it from the square law):
        - **nothing** connects to the gate: $i_g = 0$;
        - between drain and source, a **dependent current source** $g_mv_{gs}$ that flows from drain to source, controlled by $v_{gs} = v_g - v_s$;
        - in parallel with it, the resistor **$r_{ds}$**.

        So the current that flows into the drain and out of the source is
        $$i_d = g_mv_{gs} + \frac{v_{ds}}{r_{ds}}$$
        [[fig:mod]]
        The PMOS uses the **same** model, with the same direction: $g_mv_{gs}$ flows from its drain to its source. A PMOS is drawn with its source on top, so the arrow in its model points **up**. ([Chapter 2](#/l/bk02-pmodel) shows why the signs work out with no extra minus signs.) Our assumptions: saturation, small signals, low frequency (the capacitances return in Chapter 12), and no body effect.
      `, { mod: row([{ fig: nSym, cap: 'NMOS' }, { fig: nMod, cap: 'its model' }, { fig: pSym, cap: 'PMOS (source on top)' }, { fig: pMod, cap: 'its model: $g_mv_{gs}$ points up' }]) }),
      RF(md`
        ### The procedure

        !!method The test-source method, for any node
          1. **Turn off every independent source.** A DC voltage (the supply $V_{DD}$, a bias $V_B$, any node held at a fixed voltage, drawn as the course's triangle) becomes **ground**: its value never changes, so its change is zero. A DC current source becomes an **open circuit**: its current never changes. A large capacitor becomes a **short**. The signal input is set to zero too.
          2. **Connect a test voltage $v_t$** from the node to ground. Call $i_t$ the current it pushes **into** the node.
          3. **Replace each transistor by its model.** The dependent sources stay: they *are* the transistors.
          4. **Write $v_{gs} = v_g - v_s$ for every transistor**, using $v_t$, zeros, and names for the node voltages you do not know yet.
          5. **Write KCL** at every unknown node and at the test node, one line at a time, each line saying why it is true.
          6. **Solve for $v_t/i_t$.** That ratio is the resistance.
        [[fig:box]]
        **Why may we turn the DC sources off?** The small-signal circuit is linear, and $R$ is a ratio of *changes*. A DC source contributes no change. Its whole job, setting $I_D$ and with it $g_m$ and $r_{ds}$, was done when we found the bias, and those are now just numbers in the model. By superposition the test source alone produces $i_t$ ([Chapter 1](#/l/bk01-two)).

        **Why a voltage?** Either kind works. A test voltage $v_t$ with an unknown current $i_t$, or a test current $i_t$ with an unknown voltage $v_t$, give the same ratio. Use whichever makes the algebra shorter: when the current through a chain of parts is obvious, a test current is often quicker.
      `, { box: { fig: box, cap: 'Whatever is inside, the node is characterized by one number: $R = v_t/i_t$.' } }),
      RF(md`
        ### Example 1: the output of a common-source stage

        **The circuit.** $M_1$ has its source grounded and its gate driven by $v_{in}$ riding on a bias $V_B$; a resistor $R_D$ connects its drain to $V_{DD}$. We want $R_{out}$, the resistance at the drain.
        [[fig:a]]
        **Step 1: turn off the sources.** $V_{DD}$ becomes ground, so the top of $R_D$ is now grounded (the upside-down ground symbol). $V_B$ becomes a short. $v_{in} = 0$, because an output resistance is measured with the input at rest. The gate is now at ground.

        **Step 2: the test source.** $v_t$ goes on the output node; $i_t$ flows into it.
        [[fig:b]]
        **Step 3: the model.** $M_1$ becomes $g_mv_{gs}$ and $r_{ds}$ from its drain (the output) to its source (ground). Nothing touches its gate; the gate port is drawn on the left, with $v_{gs}$ marked from $G$ to $S$.
        [[fig:c]]
        **Step 4: $v_{gs}$.** The gate is at 0 and the source is at 0:
        $$v_{gs} = v_g - v_s = 0 - 0 = 0$$
        So the dependent source carries $g_m\cdot0 = 0$. A current source that carries zero current is an **open circuit**: it stays in the drawing, but no current flows through it.

        **Step 5: KCL at the output.** The current $i_t$ arriving from the test source leaves through two resistors to ground, $R_D$ and $r_{ds}$, each with $v_t$ across it:
        $$i_t = \frac{v_t}{R_D} + \frac{v_t}{r_{ds}}$$

        **Step 6: the ratio.**
        $$R_{out} = \frac{v_t}{i_t} = \frac{1}{1/R_D + 1/r_{ds}} = R_D\parallel r_{ds}$$
        With $R_D = 10\kO$ and $r_{ds} = 100\kO$: $R_{out} = \dfrac{10\times100}{10 + 100}\kO = 9.09\kO$.
      `, { a: { fig: cs0, cap: 'the circuit' }, b: { fig: cs1, cap: 'steps 1 and 2: sources off, test source on the output' }, c: { fig: cs2, cap: 'step 3: $M_1$ replaced by its model' } }),
      RF(md`
        ### Example 2: when the dependent source is alive

        **The circuit.** Now the drain sits on $V_{DD}$, the gate on a fixed bias $V_B$, and we look into the **source**.

        **Steps 1 to 3.** $V_{DD}$ and $V_B$ become ground, so the drain and the gate are both at 0. The test source drives the source node. The transistor becomes its model:
        [[fig:a]]
        **Step 4: $v_{gs}$.** The gate is at 0 and the source is at $v_t$:
        $$v_{gs} = 0 - v_t = -v_t$$
        This time the dependent source is **alive**. It carries $g_m(-v_t)$ from drain to source; in other words, $g_mv_t$ flows *up*, from the source to the drain.

        **Step 5: KCL at the source node.** Two currents arrive at this node: $i_t$ from the test source, and the device current $i_d$ (it flows drain to source, so it arrives here). Nothing else touches the node, so the two must add to zero:
        $$i_t + i_d = 0$$
        The device current is the dependent source plus the current in $r_{ds}$, which has $v_{ds} = 0 - v_t$ across it:
        $$i_d = g_mv_{gs} + \frac{v_{ds}}{r_{ds}} = -g_mv_t - \frac{v_t}{r_{ds}}$$
        So
        $$i_t = -i_d = g_mv_t + \frac{v_t}{r_{ds}}$$

        **Step 6: the ratio.**
        $$R = \frac{v_t}{i_t} = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{g_m}\parallel r_{ds}$$
        With $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$: $R = 1/(2.01\,\text{mS}) = 497.5\,\Omega$, almost exactly $1/g_m = 500\,\Omega$. Compare Example 1: the same transistor looked $100\kO$ from its drain.

        !!intuition A dependent source that watches its own voltage is a resistor
          Here the dependent source sits between the drain (at 0) and the source (at $v_t$), so the voltage across it, $v_{ds} = -v_t$, is exactly its controlling voltage $v_{gs} = -v_t$. Its current $g_mv_{gs} = g_mv_{ds}$ is proportional to the voltage across it and flows the same way: that is Ohm's law, with resistance $1/g_m$. Whenever a transistor's $v_{gs}$ equals its own $v_{ds}$, the transistor behaves as a resistor $1/g_m$ (in parallel with $r_{ds}$). It happens here, and again in the diode-connected transistor.
      `, { a: { svg: rowSvg([{ fig: src0, cap: 'the circuit' }, { fig: src1, cap: 'the small-signal circuit, $v_{gs} = -v_t$' }]) } }),
      R(md`
        !!key Three sign rules that prevent most Exam 2 mistakes
          1. $v_{gs} = v_g - v_s$, using small-signal node voltages: 0 at every incremental ground.
          2. The model's current $g_mv_{gs} + v_{ds}/r_{ds}$ flows **from drain to source**, for NMOS and PMOS alike. If the current you need flows the other way, it is minus that.
          3. $i_t$ is the current flowing from the test source **into** the node, and $R = v_t/i_t$. In this chapter $R$ always comes out positive; a negative $R$ means a sign slipped.

        ### Check it

        - **Limits.** Example 1: if $R_D\to\infty$ (the resistor removed), only $r_{ds}$ is left; if $r_{ds}\to\infty$, only $R_D$. Example 2: if $r_{ds}\to\infty$, $R = 1/g_m$ exactly.
        - **Units.** $1/g_m$ is $1/(\text{A/V}) = \text{V/A} = \Omega$.
        - **The two answers are 200 times apart.** $r_{ds}$ against $1/g_m$: the weak handle against the strong handle, as promised by the table at the start.

        ### What it means

        Two questions decide everything at a transistor terminal:
        1. **Does the test voltage reach $v_{gs}$?** If yes (the source, a diode), the strong handle is engaged and the resistance is about $1/g_m$. If no (the drain, with gate and source still), only the weak handle acts: about $r_{ds}$.
        2. **Is there a path for the current?** The gate offers none: $\infty$. A source whose drain hangs on an ideal current source offers none either: $\infty$ again ([the source](#/l/bk03-source)).

        ### How to recognize it

        Before any algebra, look at the terminal you are testing and say which handle it pulls. You will be right about the size every time, and the algebra only adds the corrections.

        !!mistake Common mistakes
          - Keeping $V_{DD}$ as a source. In the small-signal circuit it is **ground**, so a resistor "to $V_{DD}$" is a resistor to ground.
          - Shorting a DC current source. It is an **open circuit**.
          - Turning off the **dependent** source $g_mv_{gs}$ too. It stays; only independent sources are turned off.
          - Forgetting to set $v_{in} = 0$ when finding an output resistance.
          - Writing $v_{gs} = v_t$ when the test source is on the source. It is $-v_t$.
          - Using $i_t$ for the device current when the test current actually flows from source to drain. Then $i_d = -i_t$.
      `),
      Q(md`In the small-signal circuit, what does a gate tied to a fixed bias voltage $V_B = 1.4\,\text{V}$ become?`,
        ['Ground (an incremental ground)', 'A $1.4\\,\\text{V}$ source', 'An open circuit', 'Nothing: it is removed together with the transistor'], 0,
        [null, 'The small-signal circuit contains only changes. $V_B$ never changes, so its change is 0: a short to ground.',
          'Open is what a DC **current** source becomes. A fixed voltage becomes ground.',
          'The gate node stays in the circuit (the model needs $v_g$ to compute $v_{gs}$); it simply sits at 0.'],
        md`A node held at a fixed voltage has zero voltage change, so in the small-signal circuit it is ground. That is exactly what the course's triangle means: an **incremental ground**.`),
      Q(md`Which sources do you turn off before applying the test source?`,
        ['The independent ones: supplies, bias voltages, bias currents and the input', 'Every source, the dependent ones too', 'Only the supply $V_{DD}$', 'None: the test source is simply added'], 0,
        [null, 'The dependent source $g_mv_{gs}$ **is** the transistor. Turning it off would leave just $r_{ds}$ and give the wrong answer at a source or a diode.',
          'Bias voltages, bias currents and the input must be turned off too: none of them is part of the small-signal resistance.',
          'Then the "current" you computed would mix in DC currents and the input signal, which have nothing to do with $v_t/i_t$.'],
        md`Turn off every **independent** source (voltage sources become shorts, current sources become opens, and the input goes to zero). Keep every **dependent** source: it carries the transistor's response to $v_{gs}$.`),
      Q(md`The test source drives the **source** of an NMOS whose gate is held at a fixed voltage. What is $v_{gs}$?`,
        ['$-v_t$', '$v_t$', '$0$', '$v_d - v_t$'], 0,
        [null, 'That is $v_{sg}$. The definition is $v_{gs} = v_g - v_s = 0 - v_t$.',
          'The source moves (it is the test node), so $v_{gs}$ is not 0. Zero is the case of a drain test.',
          'That is $v_{ds}$, the voltage across $r_{ds}$, not the control voltage.'],
        md`$v_{gs} = v_g - v_s = 0 - v_t = -v_t$. The dependent source is alive and carries $g_mv_t$ from source to drain, which is why the source is a low-resistance node.`,
        { fig: F.source({}) }),
      Q(md`A DC current source $I_B$ biases a node. In the small-signal circuit it becomes:`,
        ['An open circuit', 'A short circuit', 'A resistor $1/g_m$', 'A voltage source of value $I_BR$'], 0,
        [null, 'A short is what a DC **voltage** source becomes. A current source holds its current fixed, so its current change is 0: no current can flow through it.',
          'A $1/g_m$ comes from a transistor whose $v_{gs}$ moves, not from an ideal source.',
          'An ideal current source has no fixed voltage at all; its small-signal current is zero.'],
        md`An ideal current source never changes its current, so its small-signal current is zero whatever voltage appears across it: an **open circuit** (infinite resistance).`),
      P({
        id: 'bk03-test-kill', title: 'Turn the sources off, then find the output resistance',
        q: md`A common-source stage: $R_D$ to $V_{DD}$; the gate biased by $R_G$ from $V_B$ and fed through a coupling capacitor $C_{in}$; $R_S$ under the source, bypassed by a large capacitor $C_S$. For the transistor, $r_{ds} = 60\kO$; $R_D = 12\kO$. Set the circuit up for $R_{out}$ (looking into the output) and find it.`,
        fig: killFig,
        parts: [
          { lbl: '1. In the small-signal circuit, the large bypass capacitor $C_S$ is', mc: ['a short circuit, so the source is at ground', 'an open circuit, so $R_S$ stays in the source', 'a resistor $1/(\\omega C_S)$ that we must keep'], a: 0,
            why: [null, 'A capacitor is open at **DC** (that is why $R_S$ sets the bias). For signals a large capacitor is a short.', 'It is large: at signal frequencies its impedance is negligible, so it is a short.'] },
          { lbl: '2. With $v_{in} = 0$, the gate of $M_1$ sits at', mc: ['0: it is an incremental ground', 'a small signal set by $R_G$', 'the source voltage'], a: 0,
            why: [null, '$V_B$ and $v_{in}$ are both zero in the small-signal circuit, and no current flows in $R_G$ (the gate takes none), so the gate is at 0.', 'Nothing ties the gate to the source; the gate is at 0 and the source is at 0 too.'] },
          { lbl: 'R_{out}', unit: 'kΩ', ans: 10, traps: [{ v: 12, msg: 'That is $R_D$ alone: $M_1$\'s $r_{ds}$ also connects the output to ground, in parallel.' }, { v: 72, msg: 'Branches from the output to ground are in **parallel**, not in series.' }] },
        ],
        hints: [md`The bypass capacitor shorts $R_S$, so for signals the source is grounded. The gate is at 0 too.`, md`Then $v_{gs} = 0$, the dependent source carries nothing, and the output sees $R_D$ (to the former $V_{DD}$, now ground) in parallel with $r_{ds}$.`],
        sol: md`
1. **Sources off.** $V_{DD}\to$ ground, $V_B\to$ ground, $v_{in} = 0$; $C_{in}$ and $C_S$ become shorts. So $R_S$ is shorted out and the source is at ground; the gate is at ground through $R_G$ (no current flows in $R_G$, because the gate takes none).
2. **The transistor.** $v_{gs} = 0 - 0 = 0$, so $g_mv_{gs} = 0$: only $r_{ds}$ remains from the output to ground.
3. **KCL at the output.** $i_t = v_t/R_D + v_t/r_{ds}$, so
$$R_{out} = R_D\parallel r_{ds} = \frac{12\times60}{12 + 60}\kO = \frac{720}{72}\kO = 10\kO$$`,
      }),
      P({
        id: 'bk03-test-cs', title: 'Output resistance of an NMOS and a PMOS common-source stage',
        q: md`(a) An NMOS common-source stage like Example 1 has $R_D = 20\kO$ and $r_{ds} = 50\kO$. (b) A PMOS common-source stage has its source on $V_{DD}$, its gate on the input, and its drain on the output with $R_D = 5\kO$ to ground (right); its $r_{ds} = 20\kO$. Find both output resistances.`,
        figHtml: rowSvg([{ fig: F.node(['R', {}], ['drain', { n: 'M_1' }], { look: 'R_{out}' }), cap: '(a) input off: gate at 0' }, { fig: pcsFig, cap: '(b) PMOS common source' }]),
        parts: [{ lbl: 'R_{out,a}', unit: 'kΩ', ans: 14.2857, traps: [{ v: 70, msg: 'Parallel, not series: both branches go from the output to (incremental) ground.' }] },
          { lbl: 'R_{out,b}', unit: 'kΩ', ans: 4, traps: [{ v: 25, msg: 'Parallel, not series.' }] }],
        hints: [md`Input off: in each stage $v_{gs} = 0$, so the transistor is just $r_{ds}$ from the output to an incremental ground.`, md`For the PMOS the source is on $V_{DD}$, which is ground for signals, so its $r_{ds}$ also goes from the output to ground.`],
        sol: md`
**(a)** Gate at 0 (input off), source at 0: $v_{gs} = 0$. The output sees $R_D$ up to the former $V_{DD}$ (ground) and $r_{ds}$ down to ground:
$$R_{out,a} = R_D\parallel r_{ds} = \frac{20\times50}{70}\kO = 14.29\kO$$
**(b)** Same reasoning upside down. The PMOS source is on $V_{DD}$ (ground) and its gate is at 0 (input off), so $v_{gs} = 0$ and only its $r_{ds}$ remains, from the output **up** to ground. $R_D$ goes **down** to ground:
$$R_{out,b} = R_D\parallel r_{ds} = \frac{5\times20}{25}\kO = 4\kO$$
The PMOS needed no special treatment: the same model, the same steps.`,
      }),
      P({
        id: 'bk03-test-src', title: 'Looking into a source, and what the bias does to it',
        q: md`A transistor has $g_m = 4\,\text{mS}$ and $r_{ds} = 50\kO$. Its gate is held and its drain is on $V_{DD}$. (a) Find the exact resistance looking into its source. (b) The bias current is raised four times. With $g_m = \sqrt{2\mu C_{ox}(W/L)I_D}$ and $r_{ds} = 1/(\lambda I_D)$, $g_m$ doubles to $8\,\text{mS}$ and $r_{ds}$ drops to $12.5\kO$. Find the new resistance.`,
        fig: F.source({}),
        parts: [{ lbl: 'R_a', unit: 'Ω', ans: 248.756, traps: [{ v: 50000, msg: 'That is $r_{ds}$: the drain\'s resistance. At the source the dependent source is alive ($v_{gs} = -v_t$).' }] },
          { lbl: 'R_b', unit: 'Ω', ans: 123.762 }],
        hints: [md`Example 2: $R = \dfrac{1}{g_m + 1/r_{ds}}$.`, md`$1/r_{ds} = 1/50\kO = 0.02\,\text{mS}$; in (b), $1/12.5\kO = 0.08\,\text{mS}$.`],
        sol: md`
**(a)** $v_{gs} = -v_t$ and $i_t = (g_m + 1/r_{ds})\,v_t$:
$$R_a = \frac{1}{4\,\text{mS} + 0.02\,\text{mS}} = \frac{1}{4.02\,\text{mS}} = 248.8\,\Omega\quad(1/g_m = 250\,\Omega)$$
**(b)**
$$R_b = \frac{1}{8\,\text{mS} + 0.08\,\text{mS}} = \frac{1}{8.08\,\text{mS}} = 123.8\,\Omega$$
Four times the current doubles $g_m$, so the source resistance halves. (It goes as $1/\sqrt{I_D}$.)`,
      }),
      P({
        id: 'bk03-test-vccs', title: 'A dependent source that watches its own node',
        q: md`Strip a transistor down to the essential piece. Node $X$ has a resistor $R = 1\kO$ to ground and a dependent current source that pulls $g\,v_x$ from $X$ to ground, where $v_x$ is the voltage of $X$ itself and $g = 5\,\text{mS}$. Find the resistance $R_X$ at node $X$.`,
        fig: vccsFig,
        parts: [{ lbl: 'R_X', unit: 'Ω', ans: 166.667, traps: [{ v: 1000, msg: 'The dependent source is not "off": it carries $g\\,v_t$ as soon as $v_x = v_t$.' }, { v: 200, msg: 'That is $1/g$ alone; $R$ is in parallel with it.' }] }],
        hints: [md`Put $v_t$ on $X$. Then $v_x = v_t$, and the dependent source carries $g\,v_t$ out of the node.`],
        sol: md`
1. Test source on $X$: $v_x = v_t$.
2. KCL at $X$: the test current leaves through the resistor ($v_t/R$) and through the dependent source ($g\,v_t$):
$$i_t = \frac{v_t}{R} + g\,v_t$$
3. $R_X = \dfrac{1}{1/R + g} = R\parallel\dfrac{1}{g} = 1\kO\parallel200\,\Omega = \dfrac{1000\times200}{1200}\,\Omega = 166.7\,\Omega$.

A current proportional to its own node voltage is a resistor $1/g$. In a transistor this happens whenever $v_{gs}$ follows the node being tested (the source, the diode), with $g = g_m$.`,
      }),
      P({
        id: 'bk03-test-pnode', title: 'A PMOS source node, all six steps',
        q: md`A PMOS $M_1$ ($g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$) has its drain grounded and its gate held. Its source connects to $V_{DD}$ through $R_S = 5\kO$. Find the resistance $R_X$ at the source node.`,
        fig: psrcNode,
        parts: [{ lbl: 'R_X', unit: 'Ω', ans: 819.672, traps: [{ v: 980.392, msg: 'That is the transistor branch alone. $R_S$ also connects the node to (incremental) ground: it is in parallel.' }, { v: 5000, msg: 'That is $R_S$ alone. The transistor\'s source is a low-resistance branch in parallel with it.' }] }],
        hints: [md`$V_{DD}$ is ground: $R_S$ goes from the node to ground. The PMOS has its drain at 0, its gate at 0, and its source at $v_t$.`, md`The PMOS branch is the source resistance $\dfrac{1}{g_m + 1/r_{ds}}$, exactly as for an NMOS.`],
        sol: md`
1. **Sources off.** $V_{DD}\to$ ground, the gate bias $\to$ ground. The node has two branches to ground: $R_S$, and the PMOS.
2. **The PMOS.** Gate at 0, source at $v_t$: $v_{gs} = -v_t$. Its drain is at 0, so $v_{ds} = -v_t$. The device current (drain to source) is $i_d = -g_mv_t - v_t/r_{ds}$, i.e. $(g_m + 1/r_{ds})v_t$ flows from the node down through the PMOS.
3. **KCL at the node.**
$$i_t = \frac{v_t}{R_S} + \Big(g_m + \frac{1}{r_{ds}}\Big)v_t$$
4. **The ratio.** $g_m + 1/r_{ds} = 1.02\,\text{mS}$ and $1/R_S = 0.2\,\text{mS}$:
$$R_X = \frac{1}{0.2\,\text{mS} + 1.02\,\text{mS}} = \frac{1}{1.22\,\text{mS}} = 819.7\,\Omega$$
That is $R_S\parallel\big(\tfrac{1}{g_m}\parallel r_{ds}\big) = 5\kO\parallel980.4\,\Omega$. The PMOS, drawn upside down, needed exactly the same steps as an NMOS.`,
      }),
      G('bk_mi_vgs', { need: 4 }),
    ],
  });
})();

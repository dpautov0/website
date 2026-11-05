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
  const src1 = [['gndu', [2, -0.6]], ['w', [2, -0.6], [2, 0]], ['txt', [2.15, -0.3], '$D$', { a: 'l' }], ...S.mos(2, 0, 2), ...S.gport(-0.5, 0.5, 2, 2, { gnd: true }),
    ['node', [2.65, 2], { n: 'S', side: 'b' }], ...S.test(3.3, 2)];
  const killFig = [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [2, 0]], ['term', [2, 0], { n: 'v_{out}', side: 'r' }],
    ['nmos', [1, 1], { n: 'M_1' }], ['R', [1, 2], [1, 3.2], { n: 'R_S', side: 'l' }], ['w', [1, 2], [2.4, 2]], ['C', [2.4, 2], [2.4, 3.2], { n: 'C_S' }], ['w', [1, 3.2], [2.4, 3.2]], ['gnd', [1.7, 3.2]],
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

  // ================================================================== 2. the gate
  const T14 = 'style="fill:var(--fg);font:14px var(--sans)"', T12 = 'style="fill:var(--dim);font:12.5px var(--sans)"';
  const xsec = `<svg class="schem" viewBox="0 0 520 250" width="520" role="img" aria-label="cross-section of a MOSFET: gate, oxide, channel">
    <rect class="shade" x="20" y="120" width="430" height="100"/><path d="M20,120H450V220H20Z"/>
    <rect class="plane" x="40" y="120" width="110" height="44" rx="10"/><rect class="plane" x="320" y="120" width="110" height="44" rx="10"/>
    <path class="dim" d="M40,120V154Q40,164 50,164H140Q150,164 150,154V120M320,120V154Q320,164 330,164H420Q430,164 430,154V120"/>
    <rect class="carr" x="150" y="120" width="170" height="7"/>
    <rect class="fillbg" x="150" y="105" width="170" height="15"/>
    <rect class="fillbg thick" x="150" y="76" width="170" height="29"/>
    <path d="M235,76V34M95,120V34M375,120V34"/><circle class="term" cx="235" cy="30" r="4"/><circle class="term" cx="95" cy="30" r="4"/><circle class="term" cx="375" cy="30" r="4"/>
    <text x="246" y="34" ${T14}>G</text><text x="106" y="34" ${T14}>S</text><text x="386" y="34" ${T14}>D</text>
    <text x="235" y="96" text-anchor="middle" ${T14}>gate (a plate)</text>
    <text x="95" y="146" text-anchor="middle" ${T14}>n⁺</text><text x="375" y="146" text-anchor="middle" ${T14}>n⁺</text>
    <path class="dim thin" d="M320,112H458"/><text x="462" y="116" ${T12}>oxide:</text><text x="462" y="131" ${T12}>insulator</text>
    <text x="235" y="146" text-anchor="middle" ${T12}>channel (the other plate)</text>
    <text x="235" y="208" text-anchor="middle" ${T12}>p substrate</text>
    <text x="243" y="60" ${T12}>i<tspan baseline-shift="sub" font-size="9">G</tspan> = 0</text>
  </svg>`;
  const gateModel = [
    ['V', [-0.8, 0.9], [-0.8, 2.1], { n: 'v_t', side: 'l' }], ['gnd', [-0.8, 2.1]], ['w', [-0.8, 0.9], [0.4, 0.9]], ['iarr', [-0.25, 0.9], 'r', { n: 'i_t = 0' }],
    ...S.gport(0.4, 0.9, 2.2, 2.2), ['gndu', [2.2, -1.4]], ['R', [2.2, -1.4], [2.2, 0], { n: 'R_D', side: 'l' }],
    ...S.mos(2.2, 0, 2.2), ['R', [2.85, 2.2], [2.85, 3.6], { n: 'R_S' }], ['gnd', [2.85, 3.6]],
    ['txt', [2.35, -0.25], '$D$', { a: 'l' }], ['node', [2.85, 2.2], { n: 'S', side: 'br' }],
  ];
  const divCS = [['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_D' }], ['nmos', [3, 1], { n: 'M_1' }], ['R', [3, 2], [3, 3.2], { n: 'R_S' }], ['gnd', [3, 3.2]],
    ['rail', [1.6, -1.2]], ['R', [1.6, -1.2], [1.6, 1], { n: 'R_1', s: '600\\,\\text{k}\\Omega', side: 'l' }], ['R', [1.6, 1], [1.6, 3.2], { n: 'R_2', s: '300\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [1.6, 3.2]],
    ['w', [1.6, 1], [2, 1]], ['C', [0.4, 1], [1.6, 1], { n: 'C_{in}' }], ['w', [0.4, 1], [0, 1]], F.lookL([0, 1], 'R_{in}')];
  const divSS = [['V', [-0.6, 1], [-0.6, 2.2], { n: 'v_t', side: 'l' }], ['gnd', [-0.6, 2.2]], ['w', [-0.6, 1], [2.6, 1]], ['iarr', [0, 1], 'r', { n: 'i_t' }],
    ['gndu', [1, -0.4]], ['R', [1, -0.4], [1, 1], { n: 'R_1' }], ['R', [1, 1], [1, 2.4], { n: 'R_2' }], ['gnd', [1, 2.4]],
    ['term', [2.6, 1], { n: 'G\\ (\\text{nothing attached})', side: 'r' }]];
  const stage2 = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['gnd', [1, 2]],
    ['node', [1, 0], { n: 'X', side: 'l', dot: true }], ['w', [1, 0], [2.4, 0], [2.4, 1], [2.6, 1]], ['rail', [3.6, 0]], ['nmos', [3.6, 1], { n: 'M_2' }],
    ['R', [3.6, 2], [3.6, 3.2], { n: 'R_L' }], ['gnd', [3.6, 3.2]], ['w', [1, 0], [1.6, 0], [1.6, -0.6], [2.2, -0.6]], F.lookR([2.2, -0.6], 'R_X')];
  const divRG = [['rail', [3.4, 0]], ['nmos', [3.4, 1], { n: 'M_1' }], ['R', [3.4, 2], [3.4, 3.2], { n: 'R_S' }], ['gnd', [3.4, 3.2]],
    ['rail', [1.2, -1.2]], ['R', [1.2, -1.2], [1.2, 1], { n: 'R_1', side: 'l' }], ['R', [1.2, 1], [1.2, 3.2], { n: 'R_2', side: 'l' }], ['gnd', [1.2, 3.2]],
    ['node', [1.2, 1], { n: 'M', side: 'al' }], ['R', [1.2, 1], [2.4, 1], { n: 'R_G' }], ['C', [0, 1], [1.2, 1], { n: 'C_{in}' }], ['w', [0, 1], [-0.4, 1]], F.lookL([-0.4, 1], 'R_{in}')];
  const sfRG = [['rail', [2.4, 0]], ['nmos', [2.4, 1], { n: 'M_1' }], ['w', [2.4, 2], [3.2, 2]], ['term', [3.2, 2], { n: 'v_{out}', side: 'r' }], ['R', [2.4, 2], [2.4, 3.2], { n: 'R_S' }], ['gnd', [2.4, 3.2]],
    ['R', [1.2, 1], [1.2, 2.2], { n: 'R_G', side: 'l' }], ['V', [1.2, 2.2], [1.2, 3.4], { n: 'V_B', side: 'l' }], ['gnd', [1.2, 3.4]], ['w', [1.2, 1], [1.4, 1]],
    ['C', [0, 1], [1.2, 1], { n: 'C_{in}' }], ['w', [0, 1], [-0.4, 1]], F.lookL([-0.4, 1], 'R_{in}')];

  L({
    id: 'bk03-gate', title: 'The gate: infinite', ref: 'Lecture 15',
    steps: [
      RF(md`
        ### The question

        What resistance do you see looking into the **gate** of a MOSFET? It decides the input resistance of every stage driven at a gate (common source, source follower, cascode), and it decides whether a gate hanging on a node changes that node's resistance. The answer is the simplest one in the chapter, and the reason is worth understanding exactly.

        ### The physical picture: a plate, not a wire

        Look at the device itself. The gate is a conducting plate lying on a thin layer of silicon dioxide, a very good insulator. Underneath the oxide is the channel. Gate and channel are the two plates of a capacitor:
        [[fig:x]]
        - **At DC**, no current can cross an insulator. The gate leakage of a real MOSFET is picoamperes.
        - **When the gate voltage changes**, charge moves onto and off the plate, so a current $i = C\,dv/dt$ flows. That is the gate capacitance $C_{gs}$, which matters at high frequency (Chapter 12). At the low frequencies of this chapter we treat it as open: a $1\,\text{pF}$ gate looks like $159\,\text{M}\Omega$ at $1\,\text{kHz}$, $1.6\,\text{M}\Omega$ at $100\,\text{kHz}$, and only $16\kO$ at $10\,\text{MHz}$.

        The gate is like the handle of a valve: turning it changes the flow through the pipe, but no water comes out of the handle. Or, in electrical terms, the gate is an ideal voltmeter: it senses a voltage and draws nothing.
      `, { x: { svg: xsec, cap: 'The gate and the channel are two plates with an insulator between them.' } }),
      RF(md`
        ### The model

        In the small-signal model, **nothing** connects the gate to anything. The gate node appears only through $v_{gs} = v_g - v_s$, the voltage that controls the dependent source.

        ### The derivation

        To make the point as strongly as possible, put **anything** on the drain and the source: $R_D$ from the drain to $V_{DD}$ and $R_S$ from the source to ground.
        [[fig:a]]
        **Step 1: sources off.** $V_{DD}$ becomes ground, so $R_D$ goes from the drain to ground.

        **Step 2: the test source.** $v_t$ drives the gate; $i_t$ is the current it pushes into the gate.

        **Step 3: the model.**
        [[fig:b]]
        **Step 4: $v_{gs}$.** $v_{gs} = v_t - v_s$. It is not zero, so the dependent source carries $g_m(v_t - v_s)$: the transistor really does respond to the test voltage.

        **Step 5: KCL at the gate node.** List what touches the gate node: the test source, and nothing else. There is no element between $G$ and any other node (the $+\,v_{gs}\,-$ marks a voltage, not a branch). So the current into the gate node must equal the current out of it through elements, which is zero:
        $$i_t = 0$$

        **Step 6: the ratio.**
        $$R_G = \frac{v_t}{i_t} = \frac{v_t}{0} = \infty$$

        Notice where the transistor's current goes: $g_m(v_t - v_s)$ flows from the drain node through the dependent source into the source node, then on through $R_S$ to ground and back up through $R_D$. It circulates entirely on the drain–source side. **None of it passes through the gate.**
      `, { a: { fig: F.gate({ rd: 1, rs: 1 }), cap: 'test source on the gate, resistors on the drain and the source' }, b: { fig: gateModel, cap: 'nothing is wired to $G$: $i_t = 0$ whatever the rest of the circuit does' } }),
      R(md`
        !!key Looking into a gate
          $$R_G = \infty$$
          for any transistor, NMOS or PMOS, with anything on its drain and source (at low frequency).

        ### Check it

        - **Any $R_D$, $R_S$, $r_{ds}$, $g_m$:** none of them appears in the answer, because none of them touches the gate node.
        - **Compare a BJT.** The base of a bipolar transistor does draw current, so its input resistance is finite, $r_\pi + (\beta + 1)R_E$ ([Chapter 8](#/l/bk08-base)). The difference between the two devices is exactly the base current.

        ### What it means

        A gate is a perfect listener. It follows the voltage of whatever node it is connected to without loading that node. Two consequences you will use constantly:
        1. **A gate adds no branch to a node.** When you split a node into $R_{UP}\parallel R_{DN}$ ([a node](#/l/bk03-node)), cross the gates off.
        2. **A stage driven at a gate does not load the stage before it.** In a chain of MOSFET stages, each stage's output resistance can be found as if the next stage were not there ([Chapter 5](#/l/bk05-chain)).

        ### How to recognize it

        The arrow (or the signal) arrives at the side lead of the transistor symbol, the one that does not carry the source arrow. Write $\infty$ for the transistor. **But look for the bias network:** a real amplifier has resistors on its gate to set the DC gate voltage, and the input resistance is whatever those resistors give, in parallel with the gate's $\infty$.
      `),
      RF(md`
        ### Worked example: the input resistance of a biased stage

        A common-source stage sets its gate voltage with a divider, $R_1 = 600\kO$ from $V_{DD}$ and $R_2 = 300\kO$ to ground; the input arrives through a large coupling capacitor $C_{in}$. Find $R_{in}$.
        [[fig:a]]
        **Step 1: sources off.** $V_{DD}$ becomes ground, so $R_1$ now runs from the gate node to ground, just like $R_2$. $C_{in}$ is a short for signals.

        **Step 2: test source** on the input, which (through $C_{in}$) is the gate node.

        **Step 3: list the branches leaving the gate node.** $R_1$ to ground, $R_2$ to ground, and the gate, which takes nothing.
        [[fig:b]]
        **Step 4: KCL.**
        $$i_t = \frac{v_t}{R_1} + \frac{v_t}{R_2} + 0$$
        **Step 5: the ratio.**
        $$R_{in} = R_1\parallel R_2 = \frac{600\times300}{600 + 300}\kO = \frac{180{,}000}{900}\kO = 200\kO$$
        The transistor contributed nothing, whatever its $g_m$ or $r_{ds}$ and whatever $R_D$ and $R_S$ are. The bias resistors are made large (hundreds of kΩ to MΩ) precisely so that the input resistance stays large.
      `, { a: { fig: divCS, cap: 'divider bias; we look in at the input' }, b: { fig: divSS, cap: 'the small-signal circuit: two resistors and an open gate' } }),
      R(md`
        !!mistake Common mistakes
          - Writing $1/g_m$ or $r_{ds}$ for a gate. Those belong to the source and the drain.
          - Forgetting the bias network: the input resistance of an amplifier is $R_1\parallel R_2$ (or $R_G$), not $\infty$.
          - Thinking the drain current "comes in through the gate". It comes in through the drain and leaves through the source.
          - Adding a resistor that sits in series with a gate. It carries no current, so it adds nothing to the resistance seen from the other side of it.
          - Using $\infty$ at high frequency: there the gate capacitance gives $1/(\omega C_{gs})$ (Chapter 12).
      `),
      Q(md`A test source drives the gate of a transistor with $R_S$ under its source and $R_D$ on its drain. What resistance does it see?`,
        ['$\\infty$', '$R_S(1 + g_mr_{ds})$', '$\\dfrac{1}{g_m} + R_S$', '$r_{ds} + R_S$'], 0,
        [null, 'That is what the **drain** sees of $R_S$ (degeneration). The gate is not connected to $R_S$ at all.',
          'That is a diode on $R_S$, looked into from its drain (= gate). Here the gate is a separate node with nothing attached.',
          'Those are drain–source quantities; none of them touches the gate node.'],
        md`In the model nothing is wired to the gate, so $i_t = 0$ and $R_G = \infty$, whatever is on the drain and the source.`,
        { fig: F.gate({ rd: 1, rs: 1 }) }),
      Q(md`Node $X$ has a $10\kO$ resistor up to $V_{DD}$ and is also connected to the gates of two other transistors (nothing else). What is the resistance at $X$?`,
        ['$10\\kO$', '$10\\kO\\parallel\\dfrac{1}{g_{m2}}\\parallel\\dfrac{1}{g_{m3}}$', '$\\infty$', '$3.3\\kO$'], 0,
        [null, 'A gate is not a source: it does not look like $1/g_m$. It looks like $\\infty$ and adds no branch.',
          'The resistor to $V_{DD}$ (= ground for signals) is a real branch.',
          'Gates are not resistors in parallel; they draw nothing at all.'],
        md`Each gate is an open circuit, so the only branch is the resistor: $R_X = 10\kO$.`),
      Q(md`A transistor has $C_{gs} = 0.5\,\text{pF}$. Is its gate still "infinite" at $100\,\text{MHz}$?`,
        ['No: $1/(\\omega C_{gs})\\approx3.2\\kO$', 'Yes: the oxide is an insulator at every frequency', 'No: it becomes $1/g_m$', 'Yes, as long as the transistor is saturated'], 0,
        [null, 'The oxide blocks DC, but a changing voltage moves charge onto the plates: $i = C\\,dv/dt$.',
          'The gate never looks like $1/g_m$; at high frequency it looks like a capacitor.',
          'Saturation decides which model applies, not whether the capacitance conducts.'],
        md`$|Z| = \dfrac{1}{2\pi fC} = \dfrac{1}{2\pi(10^8)(0.5\times10^{-12})} = 3.18\kO$. The "$\infty$" of this chapter is a low-frequency statement; Chapter 12 brings $C_{gs}$ back.`),
      P({
        id: 'bk03-gate-rg', title: 'A resistor in series with the gate',
        q: md`The divider $R_1 = 2\,\text{M}\Omega$, $R_2 = 1\,\text{M}\Omega$ sets the DC voltage of node $M$, and $R_G = 100\kO$ connects $M$ to the gate of $M_1$ (a common trick to keep the gate quiet at high frequency). The input comes in at $M$ through $C_{in}$. Find $R_{in}$.`,
        fig: divRG,
        parts: [{ lbl: 'R_{in}', unit: 'kΩ', ans: 666.667, traps: [{ v: 766.667, msg: '$R_G$ is in series with the gate, which is an open circuit. No current flows in $R_G$, so it adds nothing.' }, { v: 3000, msg: 'With $V_{DD}$ at ground, $R_1$ and $R_2$ both run from $M$ to ground: parallel, not series.' }] }],
        hints: [md`What current flows in $R_G$? Its far end is a gate.`],
        sol: md`
1. **Sources off:** $V_{DD}\to$ ground, so $R_1$ and $R_2$ both go from $M$ to ground.
2. **The $R_G$ branch:** $R_G$ leads to the gate, which takes no current. A resistor in series with an open circuit carries nothing: this branch is $R_G + \infty = \infty$.
3. **KCL at $M$:** $i_t = v_t/R_1 + v_t/R_2$, so
$$R_{in} = R_1\parallel R_2 = \frac{2\times1}{3}\,\text{M}\Omega = 666.7\kO$$`,
      }),
      P({
        id: 'bk03-gate-sf', title: 'Input resistance of a source follower',
        q: md`A source follower has its gate biased by $R_G = 1\,\text{M}\Omega$ from a fixed voltage $V_B$, with the input coupled through a large capacitor. $R_S = 2\kO$, $g_m = 2\,\text{mS}$. Find $R_{in}$.`,
        fig: sfRG,
        parts: [{ lbl: 'R_{in}', unit: 'MΩ', ans: 1 }],
        hints: [md`$V_B$ is an incremental ground. What does the gate add?`],
        sol: md`$V_B$ becomes ground, so $R_G$ runs from the input node to ground. The gate adds an open circuit. So $R_{in} = R_G = 1\,\text{M}\Omega$, independent of $g_m$ and $R_S$. (Compare a BJT emitter follower, whose base adds $r_\pi + (\beta + 1)R_E$ in parallel.)`,
      }),
      P({
        id: 'bk03-gate-node', title: 'A gate on an output node',
        q: md`$M_1$ (gate held) has $r_{ds1} = 80\kO$ and a drain resistor $R_D = 20\kO$. Its drain, node $X$, also drives the gate of a source follower $M_2$. Find the resistance at $X$.`,
        fig: stage2,
        parts: [{ lbl: 'R_X', unit: 'kΩ', ans: 16, traps: [{ v: 20, msg: 'That is $R_D$ alone; $M_1$\'s drain ($r_{ds1}$) is also on the node.' }] }],
        hints: [md`Three things touch $X$: $R_D$, $M_1$'s drain, and $M_2$'s gate. Which of them can carry current?`],
        sol: md`
1. $R_D$: to $V_{DD}$, i.e. to ground: a branch of $20\kO$.
2. $M_1$'s drain with its gate held and source grounded: $v_{gs1} = 0$, so the branch is $r_{ds1} = 80\kO$.
3. $M_2$'s gate: $\infty$, no branch.
$$R_X = 20\kO\parallel80\kO = \frac{1600}{100}\kO = 16\kO$$
Whatever $M_2$ does on its source side ($R_L$, its $g_m$), it does not change $R_X$.`,
      }),
      P({
        id: 'bk03-gate-cap', title: 'When the gate stops being infinite',
        q: md`A transistor has $C_{gs} = 0.2\,\text{pF}$. Find the magnitude of the gate's impedance at $1\,\text{MHz}$, and the frequency at which it falls to $10\kO$.`,
        parts: [{ lbl: '|Z|\\ \\text{at}\\ 1\\,\\text{MHz}', unit: 'kΩ', ans: 795.775 }, { lbl: 'f', unit: 'MHz', ans: 79.5775 }],
        hints: [md`$|Z| = \dfrac{1}{2\pi fC}$; solve the same formula for $f$.`],
        sol: md`
1. $|Z| = \dfrac{1}{2\pi(10^6)(0.2\times10^{-12})} = \dfrac{1}{1.257\times10^{-6}}\,\Omega = 795.8\kO$.
2. $f = \dfrac{1}{2\pi|Z|C} = \dfrac{1}{2\pi(10^4)(0.2\times10^{-12})} = 79.6\,\text{MHz}$.
Below a few MHz the gate is effectively open; near $100\,\text{MHz}$ it is a few kΩ and Chapter 12's high-frequency model takes over.`,
      }),
      P({
        id: 'bk03-gate-two', title: 'Two stages: what the gate does and does not change',
        q: md`A common-source stage $M_1$ is biased by a divider $R_1 = 1.5\,\text{M}\Omega$, $R_2 = 0.5\,\text{M}\Omega$ at its gate; it has $R_D = 10\kO$ and $r_{ds1} = 40\kO$ (source grounded). Its drain $X$ drives the gate of a source follower $M_2$ ($g_{m2} = 2\,\text{mS}$, $r_{ds2} = 50\kO$, drain on $V_{DD}$, biased from below by an ideal current source). Find (a) $R_{in}$ of the first stage, (b) the resistance at $X$, (c) the resistance at the follower's output (its source).`,
        figHtml: rowSvg([{ fig: [['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_D' }], ['nmos', [3, 1], { n: 'M_1' }], ['gnd', [3, 2]],
          ['rail', [1.6, -1.2]], ['R', [1.6, -1.2], [1.6, 1], { n: 'R_1', side: 'l' }], ['R', [1.6, 1], [1.6, 3.2], { n: 'R_2', side: 'l' }], ['gnd', [1.6, 3.2]], ['w', [1.6, 1], [2, 1]],
          ['C', [0.4, 1], [1.6, 1], { n: 'C_{in}' }], ['w', [0.4, 1], [0, 1]], F.lookL([0, 1], 'R_{in}'),
          ['node', [3, 0], { n: 'X', side: 'ar', dot: true }], ['w', [3, 0], [4, 0], [4, 1], [4.4, 1]], ['rail', [5.4, 0]], ['nmos', [5.4, 1], { n: 'M_2' }],
          ['I', [5.4, 2], [5.4, 3.2], { n: 'I_B' }], ['gnd', [5.4, 3.2]], ['w', [5.4, 2], [6.2, 2]], F.lookR([6.2, 2], 'R_{out}')] }]),
        parts: [{ lbl: 'R_{in}', unit: 'kΩ', ans: 375, traps: [{ v: 2000, msg: 'Parallel: $V_{DD}$ is ground, so $R_1$ and $R_2$ both go from the gate to ground.' }] },
          { lbl: 'R_X', unit: 'kΩ', ans: 8 },
          { lbl: 'R_{out}', unit: 'Ω', ans: 495.05 }],
        hints: [md`(a) and (b): the gates add nothing. (c) The follower's source, with its gate on $X$: when we find a resistance, $X$ is quiet (the input is off), so $M_2$'s gate is held. Its drain is on $V_{DD}$; the current source below is open.`],
        sol: md`
**(a)** $R_{in} = R_1\parallel R_2 = \dfrac{1.5\times0.5}{2.0}\,\text{M}\Omega = 375\kO$. $M_1$'s gate adds nothing.

**(b)** At $X$: $R_D$ to ground, $M_1$'s drain ($v_{gs1} = 0$ with the input off, so $r_{ds1}$), and $M_2$'s gate ($\infty$):
$$R_X = 10\kO\parallel40\kO = 8\kO$$

**(c)** With the input off nothing drives $X$, so $M_2$'s gate is at 0: a held gate. Its drain is on $V_{DD}$ (ground) and $I_B$ is open, so this is Example 2 of [the test-source method](#/l/bk03-test):
$$R_{out} = \frac{1}{g_{m2} + 1/r_{ds2}} = \frac{1}{2\,\text{mS} + 0.02\,\text{mS}} = 495.0\,\Omega$$
The second stage's gate let us treat the two stages separately.`,
      }),
      G('bk_mi_gate', { need: 3 }),
    ],
  });

  // ================================================================== 3. the drain
  const pinch = `<svg class="schem" viewBox="0 0 590 210" width="590" role="img" aria-label="a pinched-off channel">
    <rect class="shade" x="20" y="100" width="430" height="90"/><path d="M20,100H450V190H20Z"/>
    <rect class="plane" x="40" y="100" width="110" height="44" rx="10"/><rect class="plane" x="320" y="100" width="110" height="44" rx="10"/>
    <path class="dim" d="M40,100V134Q40,144 50,144H140Q150,144 150,134V100M320,100V134Q320,144 330,144H420Q430,144 430,134V100"/>
    <path class="carr" d="M150,100H292L150,112Z"/><circle class="fill" cx="292" cy="101" r="2.5"/>
    <rect class="fillbg" x="150" y="85" width="170" height="15"/><rect class="fillbg thick" x="150" y="58" width="170" height="27"/>
    <path d="M235,58V24M95,100V24M375,100V24"/><circle class="term" cx="235" cy="20" r="4"/><circle class="term" cx="95" cy="20" r="4"/><circle class="term" cx="375" cy="20" r="4"/>
    <text x="246" y="24" ${T14}>G</text><text x="106" y="24" ${T14}>S</text><text x="386" y="24" ${T14}>D</text>
    <text x="95" y="126" text-anchor="middle" ${T14}>n⁺</text><text x="375" y="126" text-anchor="middle" ${T14}>n⁺</text>
    <path class="dim thin" d="M292,104L300,160"/><text x="300" y="174" text-anchor="middle" ${T12}>pinch-off point</text>
    <text x="205" y="128" text-anchor="middle" ${T12}>channel thins out</text>
    <text x="235" y="76" text-anchor="middle" ${T14}>gate</text>
    <path class="dim thin" d="M296,94Q306,80 316,94"/><text x="462" y="64" ${T12}>raising V<tspan baseline-shift="sub" font-size="9">DS</tspan></text><text x="462" y="79" ${T12}>moves this point</text><text x="462" y="94" ${T12}>only a little</text>
    <path class="dim thin" d="M458,84H322"/>
  </svg>`;
  const ivPlot = Schem.plot({
    x: [0, 3], y: [0, 0.3], xl: 'V_{DS}\\ (\\text{V})', yl: 'I_D\\ (\\text{mA})', w: 440, h: 260,
    curves: [{ f: (v) => (v < 0.2 ? 10 * (0.2 * v - v * v / 2) * (1 + 0.05 * v) : 0.2 * (1 + 0.05 * v)) }, { f: (v) => 0.215 + 0.01 * (v - 1.5), cls: 'dash' }],
    pts: [{ x: 1.5, y: 0.215, n: 'Q' }], xt: [0, 1, 2, 3], yt: [0, 0.1, 0.2, 0.3],
  });
  const drainModel = [...S.gport(-0.8, 0.5, 2, 2, { gnd: true }), ...S.mos(2, 0, 2, { g: 'g_mv_{gs} = 0' }), ['gnd', [2.65, 2]], ['txt', [2.15, -0.3], '$D$', { a: 'l' }], ...S.test(3.3, 0)];
  const pdrainModel = [['gndu', [2, -0.6]], ['w', [2, -0.6], [2, 0]], ['txt', [2.15, -0.3], '$S$', { a: 'l' }], ...S.mos(2, 2, 0, { g: 'g_mv_{gs} = 0' }),
    ['term', [-0.8, 1.5], { n: 'G', side: 'b' }], ['gnd', [-1.4, 1.5]], ['w', [-1.4, 1.5], [-0.8, 1.5]], ['term', [-0.8, 0.6]], ['w', [-0.8, 0.6], [-0.8, 0], [2, 0]],
    ['vlab', [-0.55, 1.35], [-0.55, 0.75], { n: 'v_{gs}' }], ['node', [2.65, 2], { n: 'D', side: 'b' }], ...S.test(3.3, 2)];
  const csLoadSS = [['gndu', [1, -1.6]], ['R', [1, -1.6], [1, 0], { n: 'r_{ds2}', side: 'l' }], ['R', [1, 0], [1, 1.6], { n: 'r_{ds1}', side: 'l' }], ['gnd', [1, 1.6]],
    ['txt', [0.1, -0.8], '$M_2$', { a: 'r' }], ['txt', [0.1, 0.8], '$M_1$', { a: 'r' }], ['node', [1, 0], { n: 'v_{out}', side: 'ar' }], ...S.test(1, 0, { dx: 1.6 })];
  const mirFig = [['rail', [1, -0.4]], ['I', [1, -0.4], [1, 0.8], { n: 'I_{REF}', side: 'l' }], ['w', [1, 0.8], [1, 1]], ['nmos', [1, 2], { n: 'M_1', flip: true, dc: true }], ['gnd', [1, 3]],
    ['nmos', [3, 2], { n: 'M_2' }], ['gnd', [3, 3]], ['w', [3, 1], [3, 0.4]], F.lookDn([3, 0.4], 'R_{out}')];

  L({
    id: 'bk03-drain', title: 'The drain: $r_{ds}$, a current source', ref: 'Lecture 15',
    steps: [
      RF(md`
        ### The question

        Hold the gate and the source still. What do you see looking into the **drain**? This is the output resistance of every common-source stage (with the input turned off), of every current-source load, and of every current-mirror output. It is the large number in this chapter, and every gain is built on it.

        ### The physical picture: a waterfall

        In saturation the channel does not reach the drain. It thins out as it approaches the drain and **pinches off** a little short of it; the electrons that reach the pinch-off point are swept across the last gap by the strong field there.
        [[fig:p]]
        Think of water going over a waterfall. The flow is set upstream, by how far the gate opens the channel (that is $v_{gs}$). How far below the edge the pool lies (that is $V_{DS}$) hardly matters: lowering the pool does not pull more water over the edge. The only effect of a higher drain voltage is that the pinch-off point creeps slightly toward the source, so the channel gets a little shorter and carries a little more current: a few percent per volt. That is **channel-length modulation**, measured by $\lambda$.

        So the drain is almost a **current source**: a device whose current ignores its voltage. On the output curve, saturation is the nearly flat part, and its slope is $1/r_{ds}$:
        [[fig:iv]]
        With $I_D = 0.2\,\text{mA}$ and $\lambda = 0.05\,\text{V}^{-1}$ the curve rises only $0.01\,\text{mA}$ per volt, so
        $$r_{ds} = \frac{1}{\lambda I_D} = \frac{1}{(0.05\,\text{V}^{-1})(0.2\,\text{mA})} = 100\kO$$
        The tangent at the operating point $Q$ is the small-signal model of this curve. Here it lies right on the saturated part (with $\lambda$, the square law is a straight line there), and it shows up dashed only where it leaves the curve near $V_{DS} = 0$. Its slope is $1/r_{ds}$; extended backwards it would cross zero current at $V_{DS} = -1/\lambda = -20\,\text{V}$.

        A sense of scale, in the spirit of The Art of Electronics: $I_Dr_{ds} = 1/\lambda = 20\,\text{V}$. An ordinary resistor as "stiff" as this drain would need $20\,\text{V}$ across it to carry the same $0.2\,\text{mA}$. The transistor does it with about a volt. That is why transistors, not resistors, are used as current sources and loads.
      `, { p: { svg: pinch, cap: 'In saturation the channel pinches off before the drain.' }, iv: { svg: ivPlot, cap: '$V_{GS}$ fixed ($V_{ov} = 0.2\\,\\text{V}$): the saturated part is almost flat; its slope is $1/r_{ds}$' } }),
      RF(md`
        ### The model

        Saturation; the model of [the test-source method](#/l/bk03-test). Gate held (an incremental ground), source on its rail (ground).

        ### The derivation

        [[fig:a]]
        **Step 1: sources off.** The gate bias and the source rail become ground.

        **Step 2: test source** on the drain; $i_t$ flows into it.

        **Step 3: the model.**
        [[fig:b]]
        **Step 4: $v_{gs}$.** The gate is at 0 and the source is at 0:
        $$v_{gs} = 0 - 0 = 0$$
        The dependent source carries $g_m\cdot0 = 0$. It is still part of the model, but a current source carrying zero current is an **open circuit**.

        **Step 5: KCL at the drain.** The test current has one path to ground, through $r_{ds}$, which has $v_t$ across it:
        $$i_t = \frac{v_t}{r_{ds}}$$
        **Step 6: the ratio.**
        $$R_D = \frac{v_t}{i_t} = r_{ds}$$
      `, { a: { fig: F.drain({ look: 'R_D' }), cap: 'gate held, source grounded; look down into the drain' }, b: { fig: drainModel, cap: '$v_{gs} = 0$: only $r_{ds}$ carries current' } }),
      RF(md`
        !!key Looking into a drain (gate and source still)
          $$R_D = r_{ds} = \frac{1}{\lambda I_D}$$
          The drain of such a transistor is a current source $I_D$ with $r_{ds}$ in parallel.

        ### The PMOS: the same, upside down

        A PMOS current source has its source on $V_{DD}$ (on top), its gate on a fixed bias, and its drain at the bottom. Looking **up** into its drain:
        [[fig:c]]
        Its model has the source at the top (on $V_{DD}$, so ground), the drain at the bottom (the test node), and the dependent source pointing **up**, from drain to source. Gate at 0, source at 0, so again $v_{gs} = 0$: the dependent source is open and only $r_{ds}$ is left.
        $$R = r_{ds}$$
        Same answer, same reason. This PMOS is the "current-source load" of every high-gain common-source stage.

        ### Check it

        - **$\lambda\to0$** (no channel-length modulation): $r_{ds}\to\infty$, an ideal current source. Real transistors have $\lambda\ne0$, so real current sources are $r_{ds}$, not $\infty$.
        - **Units:** $1/(\text{V}^{-1}\cdot\text{A}) = \text{V/A} = \Omega$.
        - **Bias dependence:** double $I_D$ and $r_{ds}$ halves. The intrinsic gain $g_mr_{ds} = \dfrac{2I_D}{V_{ov}}\cdot\dfrac{1}{\lambda I_D} = \dfrac{2}{\lambda V_{ov}}$ does not depend on the current at all: $\dfrac{2}{0.05\times0.2} = 200$ ([Chapter 2](#/l/bk02-gm)).
      `, { c: { svg: rowSvg([{ fig: F.drain({ p: 1, look: 'R' }), cap: 'PMOS current source' }, { fig: pdrainModel, cap: 'its model: source on top, arrow up, $v_{gs} = 0$' }]) } }),
      RF(md`
        ### What it means

        A held gate means a fixed $v_{gs}$, and a fixed $v_{gs}$ means a fixed current, apart from the small $\lambda$ effect. "Current that barely changes when the voltage changes" is exactly what a large resistance is. Of the three terminals, the drain is the one that only pulls the weak handle.

        ### How to recognize it

        You are looking into a drain (the NMOS's top lead, the PMOS's bottom lead), the gate sits at a fixed voltage (a triangle, a bias, or a node that nothing drives), and the source sits on a rail. Write $r_{ds}$. Typical places: the input transistor of a common-source stage once the input is turned off, a PMOS current-source load, the output of a current mirror.

        ### Worked example: a common-source stage with a current-source load

        $M_1$ (NMOS) and $M_2$ (PMOS) both carry $I_D = 0.2\,\text{mA}$; $\lambda_n = 0.05\,\text{V}^{-1}$, $\lambda_p = 0.1\,\text{V}^{-1}$; $g_{m1} = 2\,\text{mS}$. Find $R_{out}$ (input off).
        [[fig:a]]
        **Step 1: each transistor.** With the input off, $M_1$'s gate is held; $M_2$'s gate is on a fixed bias. Both sources sit on rails. So each one is a drain with a still gate:
        $$r_{ds1} = \frac{1}{(0.05)(0.2\,\text{mA})} = 100\kO,\qquad r_{ds2} = \frac{1}{(0.1)(0.2\,\text{mA})} = 50\kO$$
        **Step 2: the small-signal circuit.** $r_{ds2}$ from the output up to the former $V_{DD}$, $r_{ds1}$ from the output down to ground; both dependent sources are dead.
        [[fig:b]]
        **Step 3: KCL.** $i_t = v_t/r_{ds1} + v_t/r_{ds2}$, so
        $$R_{out} = r_{ds1}\parallel r_{ds2} = \frac{100\times50}{150}\kO = 33.3\kO$$
        A preview of [Chapter 4](#/l/bk04-loads): the gain is $A_v = -g_{m1}R_{out} = -(2\,\text{mS})(33.3\kO) = -66.7$, far more than a resistor load that fits in the same supply could give.
      `, { a: { fig: F.node(['drain', { n: 'M_2' }], ['drain', { n: 'M_1' }], { look: 'R_{out}' }), cap: 'both gates still (input off)' }, b: { fig: csLoadSS, cap: 'two drains: $r_{ds1}\\parallel r_{ds2}$' } }),
      R(md`
        !!mistake Common mistakes
          - Writing $1/g_m$ at a drain. That needs $v_{gs}$ to move; here it does not.
          - Saying the dependent source "disappears". It is still there, carrying zero. If the gate or the source moved (a diode, degeneration, the K rule), it would come straight back.
          - Using $V_{DS}$ instead of $I_D$ in $r_{ds} = 1/(\lambda I_D)$.
          - Forgetting that $r_{ds}$ depends on the bias: a transistor at $1\,\text{mA}$ has five times less $r_{ds}$ than at $0.2\,\text{mA}$.
          - Drawing a PMOS with its source at the bottom. The source (with the arrow) goes on top, toward $V_{DD}$.
      `),
      Q(md`The bias current of a transistor current source is doubled (same $\lambda$). What happens to its output resistance?`,
        ['It halves', 'It doubles', 'It stays the same', 'It drops by $\\sqrt2$'], 0,
        [null, '$r_{ds} = 1/(\\lambda I_D)$: more current, **less** resistance.', '$r_{ds}$ is inversely proportional to $I_D$.', 'That is how $1/g_m$ scales (as $1/\\sqrt{I_D}$); $r_{ds}$ goes as $1/I_D$.'],
        md`$r_{ds} = 1/(\lambda I_D)$: twice the current, half the resistance. (The intrinsic gain $g_mr_{ds} = 2/(\lambda V_{ov})$ is unchanged if $V_{ov}$ is kept the same.)`),
      Q(md`A PMOS has its source on $V_{DD}$ and its gate on a fixed bias. What do you see looking up into its drain?`,
        ['$r_{ds}$', '$1/g_m$', '$\\infty$', '$\\tfrac{1}{g_m}\\parallel r_{ds}$'], 0,
        [null, 'That needs the test voltage to reach $v_{gs}$; here gate and source are both still.', 'Only an ideal current source ($\\lambda = 0$) is infinite.', 'That is a diode (gate tied to drain). This gate is held.'],
        md`Gate still, source still: $v_{gs} = 0$, the dependent source is open, and only $r_{ds}$ remains. A PMOS is the same model upside down.`,
        { fig: F.drain({ p: 1 }) }),
      Q(md`Why is $r_{ds}$ so much larger than $1/g_m$ for the same transistor?`,
        ['In saturation the current is set by $v_{gs}$; the drain voltage only nudges the pinch-off point', 'Because the drain is connected to $V_{DD}$', 'Because the gate oxide blocks the drain current', 'It is not: they are about equal'], 0,
        [null, 'The drain resistance is a property of the device, measured with the drain at a test voltage; $V_{DD}$ has nothing to do with it.',
          'The oxide blocks the **gate** current. The drain current flows freely through the channel.', 'Typically $g_mr_{ds}\\approx 50$ to $500$: two to three orders of magnitude apart.'],
        md`$v_{gs}$ controls the channel strongly ($g_m$); $v_{ds}$ only moves the pinch-off point slightly ($1/r_{ds} = \lambda I_D$). Their ratio is the intrinsic gain $g_mr_{ds} = 2/(\lambda V_{ov})$.`),
      P({
        id: 'bk03-drain-rds', title: '$r_{ds}$ from the bias',
        q: md`(a) An NMOS current source carries $I_D = 0.25\,\text{mA}$ with $\lambda = 0.02\,\text{V}^{-1}$. (b) A PMOS current source carries $0.5\,\text{mA}$ with $\lambda = 0.04\,\text{V}^{-1}$. Find the resistance looking into each drain.`,
        figHtml: rowSvg([{ fig: F.drain({ look: 'R_a' }), cap: '(a)' }, { fig: F.drain({ p: 1, look: 'R_b' }), cap: '(b)' }]),
        parts: [{ lbl: 'R_a', unit: 'kΩ', ans: 200 }, { lbl: 'R_b', unit: 'kΩ', ans: 50 }],
        hints: [md`$r_{ds} = 1/(\lambda I_D)$; $\lambda I_D$ comes out in siemens.`],
        sol: md`
**(a)** $\lambda I_D = (0.02)(0.25\,\text{mA}) = 5\,\mu\text{S}$, so $R_a = 1/(5\,\mu\text{S}) = 200\kO$.

**(b)** $\lambda I_D = (0.04)(0.5\,\text{mA}) = 20\,\mu\text{S}$, so $R_b = 50\kO$. A PMOS needs no special treatment.`,
      }),
      P({
        id: 'bk03-drain-curve', title: '$r_{ds}$ read off an output curve',
        q: md`On a measured output curve (fixed $V_{GS}$, saturation) the current is $0.505\,\text{mA}$ at $V_{DS} = 1\,\text{V}$ and $0.515\,\text{mA}$ at $V_{DS} = 3\,\text{V}$. Find $r_{ds}$, and $\lambda$ from $r_{ds} = 1/(\lambda I_D)$ with $I_D\approx0.5\,\text{mA}$.`,
        parts: [{ lbl: 'r_{ds}', unit: 'kΩ', ans: 200 }, { lbl: '\\lambda', unit: 'V^{-1}', ans: 0.01 }],
        hints: [md`$r_{ds}$ is the inverse slope: $\Delta V_{DS}/\Delta I_D$.`],
        sol: md`
1. Slope: $\dfrac{\Delta I_D}{\Delta V_{DS}} = \dfrac{0.515 - 0.505}{3 - 1}\,\dfrac{\text{mA}}{\text{V}} = 0.005\,\text{mA/V} = 5\,\mu\text{S}$.
2. $r_{ds} = 1/(5\,\mu\text{S}) = 200\kO$.
3. $\lambda = \dfrac{1}{I_Dr_{ds}} = \dfrac{1}{(0.5\,\text{mA})(200\kO)} = \dfrac{1}{100\,\text{V}} = 0.01\,\text{V}^{-1}$. The tangent would cross zero current at $V_{DS} = -1/\lambda = -100\,\text{V}$.`,
      }),
      P({
        id: 'bk03-drain-csload', title: 'A common-source stage with a current-source load',
        q: md`Both transistors carry $0.25\,\text{mA}$. $\lambda_n = 0.02\,\text{V}^{-1}$ for $M_1$, $\lambda_p = 0.04\,\text{V}^{-1}$ for the PMOS load $M_2$. Find $r_{ds1}$, $r_{ds2}$ and $R_{out}$ with the input off.`,
        fig: F.node(['drain', { n: 'M_2' }], ['drain', { n: 'M_1' }], { look: 'R_{out}' }),
        parts: [{ lbl: 'r_{ds1}', unit: 'kΩ', ans: 200 }, { lbl: 'r_{ds2}', unit: 'kΩ', ans: 100 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 66.6667, traps: [{ v: 300, msg: 'The two drains are separate branches from the output to (incremental) ground: parallel.' }] }],
        hints: [md`Each transistor has its gate still and its source on a rail: each is just its $r_{ds}$.`],
        sol: md`
1. $r_{ds1} = \dfrac{1}{(0.02)(0.25\,\text{mA})} = 200\kO$; $r_{ds2} = \dfrac{1}{(0.04)(0.25\,\text{mA})} = 100\kO$.
2. Up and down branches in parallel: $R_{out} = 200\parallel100 = \dfrac{20{,}000}{300}\kO = 66.7\kO$.`,
      }),
      P({
        id: 'bk03-drain-scale', title: 'How stiff is a transistor current source?',
        q: md`A current source has $\lambda = 0.04\,\text{V}^{-1}$. (a) What voltage would an ordinary resistor need across it to carry the same current $I_D$ with the same small-signal resistance? (b) Find $r_{ds}$ at $I_D = 0.4\,\text{mA}$.`,
        parts: [{ lbl: 'V', unit: 'V', ans: 25 }, { lbl: 'r_{ds}', unit: 'kΩ', ans: 62.5 }],
        hints: [md`A resistor $R = r_{ds}$ carrying $I_D$ has $I_Dr_{ds}$ across it.`],
        sol: md`
**(a)** $V = I_Dr_{ds} = I_D\cdot\dfrac{1}{\lambda I_D} = \dfrac{1}{\lambda} = 25\,\text{V}$, whatever the current.

**(b)** $r_{ds} = \dfrac{1}{(0.04)(0.4\,\text{mA})} = \dfrac{1}{16\,\mu\text{S}} = 62.5\kO$.`,
      }),
      P({
        id: 'bk03-drain-mirror', title: 'The output of a current mirror',
        q: md`A mirror copies $I_{REF} = 0.1\,\text{mA}$: $M_1$ is diode-connected, $M_2$ is four times wider and shares its gate. $\lambda = 0.05\,\text{V}^{-1}$ for both. (a) Find the resistance looking into $M_2$'s drain. (b) A resistor $R_L = 50\kO$ is added from that drain to $V_{DD}$. Find the resistance at the drain node now.`,
        fig: mirFig,
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 50, traps: [{ v: 200, msg: '$M_2$ is four times wider, so it carries $4I_{REF} = 0.4\\,\\text{mA}$: use that current in $r_{ds}$.' }] }, { lbl: 'R', unit: 'kΩ', ans: 25 }],
        hints: [md`$I_{D2} = 4I_{REF}$. Is $M_2$'s gate moving when you test its drain? Nothing pushes any signal current into the gate node.`],
        sol: md`
1. **Bias:** $M_2$ is four times wider with the same $V_{GS}$, so $I_{D2} = 0.4\,\text{mA}$ and $r_{ds2} = \dfrac{1}{(0.05)(0.4\,\text{mA})} = 50\kO$.
2. **The gate node:** it touches $I_{REF}$ (open), $M_1$ (a diode to ground) and $M_2$'s gate (no current). The test source on $M_2$'s drain cannot push any current into it, so $v_{g2} = 0$: a held gate.
3. **(a)** $R_{out} = r_{ds2} = 50\kO$.
4. **(b)** $R_L$ goes to $V_{DD}$ = ground: $R = 50\parallel50 = 25\kO$.`,
      }),
      G('bk_mi_drain', { need: 3 }),
    ],
  });

  // ================================================================== 4. the source
  const srdModel = [['gndu', [2, -1.4]], ['R', [2, -1.4], [2, 0], { n: 'R_D', side: 'l' }], ['iarr', [2, -0.45], 'u', { n: 'i_t', side: 'r', off: [14, 0] }],
    ['node', [2, 0], { n: 'v_d = i_tR_D', side: 'ar' }], ...S.mos(2, 0, 2), ...S.gport(-0.6, 0.5, 2, 2, { gnd: true }), ['node', [2.65, 2], { n: 'S', side: 'b' }], ...S.test(3.3, 2)];
  const sIdeal = [['rail', [1, -1.2]], ['I', [1, -1.2], [1, 0], { n: 'I_B' }], ['node', [1, 0], { n: 'D', side: 'l' }], ['nmos', [1, 1]], ['acg', [0, 1]], ['w', [1, 2], [1, 2.4]], F.lookUp([1, 2.4], 'R')];
  const sIdealModel = [['txt', [2, -0.6], '$\\text{drain node: only the device}$'], ['node', [2, 0], { n: 'D', side: 'al', dot: true }], ...S.mos(2, 0, 2), ['txt', [0.2, 1], '$v_{gs} = -v_t$', { a: 'r' }],
    ['node', [2.65, 2], { n: 'S', side: 'b' }], ...S.test(3.3, 2)];
  const thevT = [['rail', [1, 0], { n: 'V_{DD}' }], ['nmos', [1, 1], { n: 'M_1' }], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_g', side: 'l' }], ['gnd', [-0.6, 2.4]],
    ['w', [1, 2], [2, 2]], ['term', [2, 2], { n: 'S', side: 'r' }], ['I', [1, 2], [1, 3.2], { n: 'I_B' }], ['gnd', [1, 3.2]]];
  const thevE = [['Vac', [0, 0], [0, 1.4], { n: 'v_{oc}\\approx v_g', side: 'l' }], ['gnd', [0, 1.4]], ['R', [0, 0], [1.8, 0], { n: 'R_{th}\\approx 1/g_m' }],
    ['w', [1.8, 0], [2.4, 0]], ['term', [2.4, 0], { n: 'S', side: 'r' }]];
  const psrcModel = [['txt', [0.4, 1], '$v_{gs} = 0 - v_t$', { a: 'r' }], ...S.mos(2, 2, 0), ['node', [2, 0], { n: 'S', side: 'al' }],
    ['R', [2, 2], [2, 3.4], { n: 'R_D', side: 'l' }], ['gnd', [2, 3.4]], ['node', [2, 2], { n: 'D', side: 'l' }], ...S.test(3.3, 0)];
  const cgIn = [['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['acg', [0, -1]], ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]],
    ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]], ['w', [1, 2], [2, 2]], F.lookR([2, 2], 'R_{in}')];

  L({
    id: 'bk03-source', title: 'The source: about $1/g_m$', ref: 'Lectures 15–17',
    steps: [
      RF(md`
        ### The question

        Hold the gate still. What do you see looking into the **source**? This is the input resistance of a common-gate stage, the output resistance of a source follower, the resistance of the middle node of a cascode, and the resistance each capacitor sees at a source in Chapter 13. It is the small number in this chapter.

        ### The physical picture: the source follows the gate

        A MOSFET's current is set by $v_{gs} = v_g - v_s$. With the gate held, the source **is** the control handle. Push the source up by $10\,\text{mV}$: $v_{gs}$ falls by $10\,\text{mV}$, and the current falls by $g_m\times10\,\text{mV} = 20\,\mu\text{A}$ (at $g_m = 2\,\text{mS}$). The test source has to make up that $20\,\mu\text{A}$. So
        $$R\approx\frac{10\,\text{mV}}{20\,\mu\text{A}} = 500\,\Omega = \frac{1}{g_m}$$
        The source sits one $V_{GS}$ below the gate and resists any attempt to move it with the transistor's full transconductance. The Art of Electronics says it of the emitter follower: the emitter "looks like" $r_e = 25\,\Omega$ at $1\,\text{mA}$. The MOSFET version: **the source looks like $1/g_m$**, a few hundred ohms.
        [[fig:a]]
        ### The derivation: drain on $V_{DD}$

        This is Example 2 of [the test-source method](#/l/bk03-test), recalled in one line each: the drain and the gate are at 0; $v_{gs} = -v_t$; KCL at the source node gives $i_t = -i_d = g_mv_t + v_t/r_{ds}$; so
        $$R_S = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{g_m}\parallel r_{ds}\approx\frac{1}{g_m}$$
        With $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$: $497.5\,\Omega$.
      `, { a: { svg: rowSvg([{ fig: F.source({}), cap: 'gate held, drain on $V_{DD}$' }, { fig: src1, cap: '$v_{gs} = -v_t$: the dependent source is alive' }]) } }),
      RF(md`
        ### With a resistor on the drain

        Now put $R_D$ between the drain and $V_{DD}$, as in a common-gate amplifier. The current that enters the source must go somewhere: up through the transistor and out through $R_D$. On its way it raises the drain.
        [[fig:a]]
        **Step 1: sources off.** $V_{DD}$ and the gate bias become ground. So $R_D$ runs from the drain to ground, and the gate is at 0.

        **Step 2: unknowns.** The source is at $v_t$; the drain is at an unknown $v_d$.

        **Step 3: KCL at the drain.** The device current $i_d$ (drain to source) leaves the drain node through the device; $v_d/R_D$ leaves it through $R_D$. Nothing else touches the node:
        $$i_d + \frac{v_d}{R_D} = 0$$
        **Step 4: KCL at the source.** As before, only the test source and the device meet here: $i_t + i_d = 0$, so $i_d = -i_t$. Put that into Step 3:
        $$v_d = -i_dR_D = i_tR_D$$
        The test current flows up through $R_D$ and lifts the drain by $i_tR_D$.

        **Step 5: $v_{gs}$.** $v_{gs} = 0 - v_t = -v_t$.

        **Step 6: the device equation.** $i_d = g_mv_{gs} + (v_d - v_s)/r_{ds}$, with every piece now known:
        $$-i_t = -g_mv_t + \frac{i_tR_D - v_t}{r_{ds}}$$
        **Step 7: multiply every term by $r_{ds}$.**
        $$-i_tr_{ds} = -g_mr_{ds}v_t + i_tR_D - v_t$$
        **Step 8: $v_t$ terms on the left, $i_t$ terms on the right.** Add $g_mr_{ds}v_t + v_t$ to both sides and add $i_tr_{ds}$ to both sides:
        $$v_t\,(1 + g_mr_{ds}) = i_t\,(r_{ds} + R_D)$$
        **Step 9: the ratio.**
        $$R_S = \frac{v_t}{i_t} = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}$$
      `, { a: { svg: rowSvg([{ fig: F.source({ load: 'R' }), cap: '$R_D$ on the drain' }, { fig: srdModel, cap: 'the drain is no longer still: $v_d = i_tR_D$' }]) } }),
      R(md`
        !!key Looking into a source (gate still)
          $$R_S = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\frac{1}{g_m} + \frac{R_D}{g_mr_{ds}}$$
          $R_D$ is whatever is on the drain (0 if the drain is on a rail: then $R_S = \tfrac{1}{g_m}\parallel r_{ds}$). Lecture 29 writes the same thing as $\dfrac{1}{g_m}\Big(1 + \dfrac{R_L}{r_{ds}}\Big)$, using $1 + g_mr_{ds}\approx g_mr_{ds}$.

        ### Check it

        - **$R_D = 0$:** $\dfrac{r_{ds}}{1 + g_mr_{ds}} = \dfrac{1}{1/r_{ds} + g_m} = \dfrac{1}{g_m}\parallel r_{ds}$. ✓
        - **$r_{ds}\to\infty$** ($\lambda = 0$): divide top and bottom by $r_{ds}$: $\dfrac{1 + R_D/r_{ds}}{1/r_{ds} + g_m}\to\dfrac{1}{g_m}$. $R_D$ drops out completely! With an ideal transistor the drain voltage cannot affect the current, so it cannot affect the source either.
        - **$R_D\to\infty$:** $R_S\to\infty$ (next box).
        - **Numbers** ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, so $1 + g_mr_{ds} = 201$):

        | $R_D$ | $R_S = (r_{ds} + R_D)/201$ | compared with $1/g_m = 500\,\Omega$ |
        |---|---|---|
        | $0$ | $497.5\,\Omega$ | about the same |
        | $10\kO$ | $547.3\,\Omega$ | $+10\%$ |
        | $100\kO$ (another $r_{ds}$) | $995.0\,\Omega$ | about $2/g_m$ |
        | $1\,\text{M}\Omega$ | $5.47\kO$ | 11 times |
        | $\infty$ (ideal current source) | $\infty$ | |

        ### What it means: why $R_D$ is divided by $g_mr_{ds}$

        For the test current to flow, the transistor must change its current by $i_t$. It does that mostly through the strong handle: the source moves by $i_t/g_m$. But the current also flows through $R_D$ and lifts the drain by $i_tR_D$. Through the weak handle, a higher drain alone would push $i_tR_D/r_{ds}$ *more* current through the device; to cancel it, the source must move by an extra $(i_tR_D/r_{ds})/g_m = i_tR_D/(g_mr_{ds})$. That extra is the second term. The drain resistance reaches the source only through the weak handle, so it arrives **divided by the intrinsic gain**.
      `),
      RF(md`
        !!trap An ideal current source on the drain: $R_S = \infty$, not $1/g_m$
          If the drain hangs on an ideal current source $I_B$, put $R_D\to\infty$: the top of the formula grows without limit, the bottom stays at $1 + g_mr_{ds}$, so $R_S\to\infty$.
          The KCL reason is cleaner. Whatever current enters the source must leave through the drain (the gate takes none). At the drain node the only other element is $I_B$, which carries no signal current (it is open). So no current can enter the source, whatever voltage we apply: $i_t = 0$.

          The dependent source still "wants" to carry $g_mv_t$, but it cannot: $v_d$ rises until $r_{ds}$ carries exactly the opposite current. A real transistor current source ($R_D = r_{ds2}$) is the in-between case: $R_S\approx\dfrac{1}{g_m}\Big(1 + \dfrac{r_{ds2}}{r_{ds}}\Big)\approx\dfrac{2}{g_m}$ for matched devices. This is a favourite short-answer question.
        [[fig:a]]
      `, { a: { svg: rowSvg([{ fig: sIdeal, cap: 'ideal current source on the drain' }, { fig: sIdealModel, cap: '$I_B$ is open: the drain node has no other path' }]) } }),
      RF(md`
        ### The source follows the gate: a Thévenin view

        So far the gate was held. Now let the gate move by $v_g$ (drain on $V_{DD}$) and ask what the source looks like **from outside**: a Thévenin source.

        **Open-circuit voltage.** With nothing attached to the source except an ideal bias current source (open for signals), no signal current can leave the source node, so the device current is zero:
        $$g_m(v_g - v_s) - \frac{v_s}{r_{ds}} = 0\quad\Rightarrow\quad v_s = v_g\,\frac{g_mr_{ds}}{1 + g_mr_{ds}}\approx v_g$$
        **Thévenin resistance.** Turn $v_g$ off (the gate is held): that is the source resistance we just derived, $\tfrac{1}{g_m}\parallel r_{ds}$.
        [[fig:a]]
        So the source is a copy of the gate voltage with about $1/g_m$ in series. Load it with $R_L$ and you get a divider; that is the **source follower** ([Chapter 4](#/l/bk04-cd)). With $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $v_g = 10\,\text{mV}$: $v_{oc} = 10\times\tfrac{200}{201} = 9.95\,\text{mV}$; into $R_L = 2\kO$,
        $$v_s = 9.95\,\text{mV}\times\frac{2\kO}{2\kO + 0.4975\kO} = 7.97\,\text{mV}$$

        ### The PMOS: looking down into a source

        A PMOS has its source on top. Looking down into it, with the gate held and $R_D$ from the drain to ground, gives the same equations (the model arrow points up, from drain to source):
        [[fig:b]]
        $$R_S = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}$$
        Step by step: $v_{gs} = 0 - v_t$; the test current enters the source and flows **down** through the device and $R_D$, so $v_d = i_tR_D$ and $i_d = -i_t$; the device equation is identical to the NMOS one above.
      `, { a: { svg: rowSvg([{ fig: thevT, cap: 'gate driven, drain on $V_{DD}$' }, { fig: thevE, cap: 'what the source looks like from outside' }]) },
        b: { svg: rowSvg([{ fig: F.source({ p: 1, load: 'R' }), cap: 'PMOS: look down into the source' }, { fig: psrcModel, cap: 'same model, arrow up' }]) } }),
      R(md`
        ### How to recognize it

        You are looking into the lead with the arrow (the source), and the gate is held. Say "$1/g_m$". Then glance at the drain: if it sits on a rail or a resistor much smaller than $r_{ds}$, you are done; if it carries something comparable to $r_{ds}$ (another transistor), add $R_D/(g_mr_{ds})$; if it hangs on an ideal current source, the answer is $\infty$.

        !!mistake Common mistakes
          - Writing $r_{ds}$ at a source. That is the drain.
          - Ignoring a drain load comparable to $r_{ds}$: with another transistor's $r_{ds}$ on the drain the source is about $2/g_m$, not $1/g_m$.
          - Writing $1/g_m$ when the drain hangs on an **ideal** current source: it is $\infty$.
          - Dividing $R_D$ by $g_m$ instead of by $g_mr_{ds}$ (the units would even look fine).
          - Getting $v_{gs} = +v_t$: the source is the moving terminal, so $v_{gs} = -v_t$.
      `),
      Q(md`Gate held, drain on $V_{DD}$, $g_m = 4\,\text{mS}$, $r_{ds} = 100\kO$. About what do you see looking into the source?`,
        ['$250\\,\\Omega$', '$100\\kO$', '$4\\kO$', '$\\infty$'], 0,
        [null, 'That is $r_{ds}$, the drain. At the source the test voltage drives $v_{gs}$.', 'Units: $1/(4\\,\\text{mS}) = 0.25\\kO$.', 'Only a source whose drain hangs on an ideal current source is infinite.'],
        md`$\tfrac{1}{g_m}\parallel r_{ds} = 1/(4.01\,\text{mS}) = 249.4\,\Omega\approx1/g_m = 250\,\Omega$.`, { fig: F.source({}) }),
      Q(md`The drain hangs on an **ideal** current source. What do you see looking into the source (gate held)?`,
        ['$\\infty$', '$1/g_m$', '$2/g_m$', '$r_{ds}$'], 0,
        [null, 'That needs a path for the current at the drain; the ideal current source is open, so there is none.', 'That is the case of a real (transistor) current source with $r_{ds2} = r_{ds}$.', '$r_{ds}$ is the drain looked into from above.'],
        md`Current entering the source must leave through the drain, and the only other element at the drain is an open circuit. No current can flow: $R_S = \infty$. (Formula: $R_D\to\infty$.)`, { fig: sIdeal }),
      Q(md`Gate held, and the drain load is another transistor's $r_{ds}$, equal to this transistor's own $r_{ds}$. Looking into the source you see about`,
        ['$2/g_m$', '$1/g_m$', '$r_{ds}/2$', '$g_mr_{ds}^2$'], 0,
        [null, 'That ignores the drain load. $R_D/(g_mr_{ds}) = r_{ds}/(g_mr_{ds}) = 1/g_m$ is added.', 'A drain resistance reaches the source divided by $g_mr_{ds}$, not halved.', 'That is the size of a cascode looked into from the **top** drain.'],
        md`$\dfrac{r_{ds} + r_{ds}}{1 + g_mr_{ds}}\approx\dfrac{2r_{ds}}{g_mr_{ds}} = \dfrac{2}{g_m}$.`),
      Q(md`Suppose $\lambda = 0$ (so $r_{ds}\to\infty$). A $50\kO$ resistor is on the drain. What do you see looking into the source?`,
        ['$1/g_m$: the drain resistor drops out', '$1/g_m + 50\\kO$', '$\\infty$', '$50\\kO/(g_m\\cdot50\\kO)$'], 0,
        [null, 'The drain resistor is divided by $g_mr_{ds}$, which is infinite here.', 'Only an infinite drain resistance gives $\\infty$.', 'The division is by $g_mr_{ds}$, not by $g_mR_D$.'],
        md`$\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\to\dfrac{1}{g_m}$ as $r_{ds}\to\infty$. An ideal transistor's current does not care about its drain voltage, so its source does not either.`),
      P({
        id: 'bk03-src-num', title: 'A source with the drain on $V_{DD}$',
        q: md`Gate held, drain on $V_{DD}$; $g_m = 1\,\text{mS}$, $r_{ds} = 40\kO$. Find the exact resistance looking into the source.`,
        fig: F.source({}),
        parts: [{ lbl: 'R_S', unit: 'Ω', ans: 975.61, traps: [{ v: 40000, msg: 'That is $r_{ds}$: the drain, not the source.' }] }],
        hints: [md`$1/r_{ds} = 0.025\,\text{mS}$.`],
        sol: md`$R_S = \dfrac{1}{g_m + 1/r_{ds}} = \dfrac{1}{1\,\text{mS} + 0.025\,\text{mS}} = \dfrac{1}{1.025\,\text{mS}} = 975.6\,\Omega$, $2.4\%$ below $1/g_m$.`,
      }),
      P({
        id: 'bk03-src-rd', title: 'How much a drain resistor matters',
        q: md`Gate held; $g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$. Find the resistance looking into the source with (a) $R_D = 20\kO$ on the drain, (b) $R_D = 500\kO$.`,
        fig: F.source({ load: 'R' }),
        parts: [{ lbl: 'R_a', unit: 'Ω', ans: 693.069, traps: [{ v: 495.05, msg: 'That ignores $R_D$; the drain moves by $i_tR_D$.' }, { v: 20500, msg: '$R_D$ is not seen in full: it is divided by $1 + g_mr_{ds}$.' }] },
          { lbl: 'R_b', unit: 'kΩ', ans: 5.44554 }],
        hints: [md`$1 + g_mr_{ds} = 1 + 100 = 101$.`, md`$R_S = (r_{ds} + R_D)/(1 + g_mr_{ds})$.`],
        sol: md`
$g_mr_{ds} = (2\,\text{mS})(50\kO) = 100$.

**(a)** $R_S = \dfrac{50 + 20}{101}\kO = \dfrac{70}{101}\kO = 693.1\,\Omega$ (vs $1/g_m = 500\,\Omega$).

**(b)** $R_S = \dfrac{50 + 500}{101}\kO = 5.446\kO$, eleven times $1/g_m$: a large drain resistance does show up at the source.`,
      }),
      P({
        id: 'bk03-src-sym', title: 'The formula, typed',
        q: md`Gate at incremental ground, $R_D$ from the drain to incremental ground. Type the resistance looking into the source, keeping $r_{ds}$ (exact, or the $g_mr_{ds}\gg1$ form). Variables: gm, rds, RD.`,
        fig: F.source({ load: 'R' }),
        parts: [BK.ex('(rds + RD)/(1 + gm*rds)', ['gm', 'rds', 'RD'], 'R_S', { ranges: { gm: [1e-3, 1e-2], rds: [5e4, 2e5], RD: [5e4, 5e5] } })],
        hints: [md`$v_d = i_tR_D$ and $v_{gs} = -v_t$; write the device current, which is $-i_t$.`],
        sol: md`KCL: $-i_t = -g_mv_t + \dfrac{i_tR_D - v_t}{r_{ds}}$. Times $r_{ds}$ and collect: $v_t(1 + g_mr_{ds}) = i_t(r_{ds} + R_D)$.
$$R_S = \frac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\frac{1}{g_m} + \frac{R_D}{g_mr_{ds}}$$`,
      }),
      P({
        id: 'bk03-src-pmos', title: 'A PMOS source',
        q: md`A PMOS with $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$ has its gate held and $R_D = 50\kO$ from its drain to ground. Find the resistance looking down into its source.`,
        fig: F.source({ p: 1, load: 'R' }),
        parts: [{ lbl: 'R_S', unit: 'kΩ', ans: 1.96078, traps: [{ v: 0.980392, msg: 'That ignores $R_D$, which here equals $r_{ds}$: it doubles the answer.' }] }],
        hints: [md`Same formula as the NMOS: $(r_{ds} + R_D)/(1 + g_mr_{ds})$.`],
        sol: md`$g_mr_{ds} = 50$. $R_S = \dfrac{50 + 50}{51}\kO = 1.961\kO\approx2/g_m$. The PMOS model is the same model; drawn with its source on top, the equations are unchanged.`,
      }),
      P({
        id: 'bk03-src-thev', title: 'The source as a Thévenin source',
        q: md`The gate moves by $v_g = 10\,\text{mV}$; the drain is on $V_{DD}$; $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$. Find (a) the open-circuit signal voltage at the source, (b) the Thévenin resistance there, (c) the source voltage once a load $R_L = 2\kO$ connects the source to ground.`,
        fig: thevT,
        parts: [{ lbl: 'v_{oc}', unit: 'mV', ans: 9.95025 }, { lbl: 'R_{th}', unit: 'Ω', ans: 497.512 }, { lbl: 'v_s', unit: 'mV', ans: 7.96813 }],
        hints: [md`Open circuit: the device current is 0, so $g_m(v_g - v_s) = v_s/r_{ds}$.`, md`Then a divider: $v_s = v_{oc}\,\dfrac{R_L}{R_L + R_{th}}$.`],
        sol: md`
1. $v_{oc} = v_g\dfrac{g_mr_{ds}}{1 + g_mr_{ds}} = 10\,\text{mV}\times\dfrac{200}{201} = 9.950\,\text{mV}$.
2. $R_{th} = \dfrac{1}{g_m + 1/r_{ds}} = \dfrac{1}{2.01\,\text{mS}} = 497.5\,\Omega$.
3. $v_s = 9.950\,\text{mV}\times\dfrac{2000}{2000 + 497.5} = 9.950\times0.8008 = 7.968\,\text{mV}$.

Check with KCL directly: $g_m(v_g - v_s) = v_s/r_{ds} + v_s/R_L$ gives $v_s = \dfrac{2\times10}{2 + 0.01 + 0.5}\,\text{mV} = 7.968\,\text{mV}$. ✓`,
      }),
      P({
        id: 'bk03-src-cg', title: 'The input of a common-gate stage',
        q: md`A common-gate stage: $M_1$ ($g_{m1} = 2\,\text{mS}$, $r_{ds1} = 100\kO$, gate held) with a PMOS current-source load $M_2$ ($r_{ds2} = 100\kO$), and a bias resistor $R_S = 2\kO$ from the source to ground. (a) Find the resistance looking into $M_1$'s source alone. (b) Find $R_{in}$ at the source node. (c) Find $R_{in}$ if $M_2$ were an ideal current source.`,
        fig: cgIn,
        parts: [{ lbl: 'R_{S1}', unit: 'Ω', ans: 995.025, traps: [{ v: 497.512, msg: 'The drain load $r_{ds2}$ equals $r_{ds1}$: it doubles the source resistance.' }] },
          { lbl: 'R_{in}', unit: 'Ω', ans: 664.452 }, { lbl: 'R_{in,ideal}', unit: 'kΩ', ans: 2, traps: [{ v: 0.4975, msg: 'With an ideal current source on the drain, the transistor branch is **infinite**, not $1/g_m$.' }] }],
        hints: [md`The source node has two branches: $R_S$, and the transistor (a source with $R_D = r_{ds2}$ on its drain).`, md`An ideal current source on the drain makes the transistor branch infinite.`],
        sol: md`
1. **The transistor branch.** $M_2$'s gate and source are still, so it is $r_{ds2} = 100\kO$ on $M_1$'s drain:
$$R_{S1} = \frac{r_{ds1} + r_{ds2}}{1 + g_{m1}r_{ds1}} = \frac{200\kO}{201} = 995.0\,\Omega$$
2. **The node.** $R_S$ to ground in parallel: $R_{in} = 2\kO\parallel995.0\,\Omega = \dfrac{2000\times995.0}{2995.0}\,\Omega = 664.5\,\Omega$.
3. **Ideal load.** The transistor branch becomes $\infty$, leaving $R_{in} = R_S = 2\kO$. Lecture 29 writes this node as $R_S\parallel\dfrac{1}{g_m}\Big[1 + \dfrac{R_L}{r_{ds}}\Big]$.`,
      }),
      G('bk_mi_src', { need: 3 }),
    ],
  });

  // ================================================================== 5. the diode-connected transistor
  const dPlot = Schem.plot({
    x: [0, 1.8], y: [0, 0.8], xl: 'V\\ (\\text{V})', yl: 'I\\ (\\text{mA})', w: 420, h: 260,
    curves: [{ f: (v) => (v < 1 ? 0 : 1.25 * (v - 1) * (v - 1)) }, { f: (v) => 0.2 + 1 * (v - 1.4), cls: 'dash', from: 1.15, to: 1.8 }],
    pts: [{ x: 1.4, y: 0.2, n: 'Q' }], xt: [0, 0.5, 1, 1.5], yt: [0, 0.2, 0.4, 0.6, 0.8],
  });
  const dioFig = [['w', [1, 0], [1, -0.4]], F.lookDn([1, -0.4], 'R'), ['nmos', [1, 1], { dc: true }], ['gnd', [1, 2]], ['txt', [1.6, 1.4], '$I = \\tfrac12k(V - V_{TN})^2$', { a: 'l' }],
    ['vlab', [1.5, 0.05], [1.5, 1.95], { n: 'V', side: 'r' }]];
  const nDioModel = [['w', [-0.4, 0.5], [-0.4, 0], [2, 0]], ['term', [-0.4, 0.5], { n: 'G', side: 'l' }], ['term', [-0.4, 1.4]], ['w', [-0.4, 1.4], [-0.4, 2], [2, 2]],
    ['vlab', [-0.15, 0.65], [-0.15, 1.25], { n: 'v_{gs} = v_t' }], ...S.mos(2, 0, 2), ['gnd', [2.65, 2]], ['node', [2, 0], { n: 'D', side: 'a' }], ...S.test(3.3, 0)];
  const pDioModel = [['gndu', [2, -0.6]], ['w', [2, -0.6], [2, 0]], ['txt', [2.15, -0.3], '$S$', { a: 'l' }], ...S.mos(2, 2, 0),
    ['term', [-0.4, 1.5], { n: 'G', side: 'l' }], ['w', [-0.4, 1.5], [-0.4, 2], [2, 2]], ['term', [-0.4, 0.6]], ['w', [-0.4, 0.6], [-0.4, 0], [2, 0]],
    ['vlab', [-0.15, 1.35], [-0.15, 0.75], { n: 'v_{gs} = v_t' }], ['node', [2, 2], { n: 'D', side: 'b' }], ...S.test(3.3, 2)];
  const dioRSModel = [['w', [-0.2, 0.5], [-0.2, 0], [2, 0]], ['term', [-0.2, 0.5], { n: 'G', side: 'l' }], ['term', [-0.2, 1.4]], ['w', [-0.2, 1.4], [-0.2, 2], [2, 2]],
    ['vlab', [0.05, 0.65], [0.05, 1.25], { n: 'v_{gs}' }], ...S.mos(2, 0, 2), ['R', [2.65, 2], [2.65, 3.4], { n: 'R_S' }], ['gnd', [2.65, 3.4]],
    ['node', [2.65, 2], { n: 'v_s = i_tR_S', side: 'br' }], ['node', [2, 0], { n: 'D', side: 'a' }], ...S.test(3.3, 0)];
  const twoDio = [['w', [1, 0], [1, -0.4]], F.lookDn([1, -0.4], 'R'), ['nmos', [1, 1], { n: 'M_a', dc: true }], ['node', [1, 2], { n: 'X', side: 'l' }],
    ['nmos', [1, 3], { n: 'M_b', dc: true }], ['gnd', [1, 4]]];
  const dioRF = [['w', [1, 0], [1, -0.4]], F.lookDn([1, -0.4], 'R'), ['nmos', [1, 1]], ['gnd', [1, 2]], ['R', [0, 1], [0, -0.2], { n: 'R_F', side: 'l' }], ['w', [0, -0.2], [0, -0.2], [1, -0.2]]];

  L({
    id: 'bk03-diode', title: 'The diode-connected transistor', ref: 'Lectures 15–16',
    steps: [
      RF(md`
        ### The question

        Tie a transistor's gate to its own drain. What do you see looking into that node? This "diode" is the input of every current mirror, the load of a diode-loaded amplifier, and the up-branch of many Exam 2 nodes (a PMOS diode under $V_{DD}$, sometimes with a resistor).

        ### The physical picture: a transistor that watches its own drain

        Raise the drain, and the gate rises with it. The transistor sees a larger $v_{gs}$ and opens up: its current rises steeply, by $g_m$ per volt, through the strong handle. A device whose current jumps a lot for a small voltage change is a **small** resistance.

        It is called a diode because it has two terminals and conducts in one direction only, with a steep I–V curve: $I = \tfrac12k(V - V_{TN})^2$, a square law instead of the junction diode's exponential. Since $V_{DS} = V_{GS} > V_{GS} - V_{TN}$, a diode-connected transistor that conducts at all is **always in saturation**, so our model always applies to it.
        [[fig:a]]
        The small-signal resistance is the inverse slope of this curve at the operating point $Q$. For $W/L = 25$ ($k = \mu_nC_{ox}W/L = 2.5\,\text{mA/V}^2$) at $I = 0.2\,\text{mA}$: $V = 1.4\,\text{V}$, the slope is $k(V - V_{TN}) = 2.5\times0.4 = 1\,\text{mS} = g_m$, so the diode looks like $1/g_m = 1\kO$. (The tangent crosses zero at $V_{TN} + V_{ov}/2 = 1.2\,\text{V}$.)
      `, { a: { svg: rowSvg([{ fig: dioFig, cap: 'NMOS diode' }, { svg: dPlot, cap: 'its I–V curve; the dashed tangent at $Q$ has slope $g_m$' }]) } }),
      RF(md`
        ### The derivation (NMOS)

        **Step 1: sources off.** The source rail is ground.

        **Step 2: test source** on the drain, which is also the gate.

        **Step 3: the model.** The gate terminal is wired to the drain node, so the gate port sits between the drain and the source:
        [[fig:a]]
        **Step 4: $v_{gs}$.** The gate is at $v_t$ (it **is** the drain) and the source is at 0:
        $$v_{gs} = v_t - 0 = v_t$$
        **Step 5: KCL at the drain.** The test current leaves through the device: the dependent source carries $g_mv_{gs} = g_mv_t$ and $r_{ds}$ carries $v_t/r_{ds}$:
        $$i_t = g_mv_t + \frac{v_t}{r_{ds}}$$
        **Step 6: the ratio.**
        $$R = \frac{v_t}{i_t} = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{g_m}\parallel r_{ds}\approx\frac{1}{g_m}$$
        The dependent source is controlled by the voltage across itself ($v_{gs} = v_{ds} = v_t$), so it **is** a resistor $1/g_m$, sitting in parallel with $r_{ds}$. Same result as looking into a source, for the same reason.
      `, { a: { fig: nDioModel, cap: 'gate wired to drain: $v_{gs} = v_t$' } }),
      RF(md`
        ### The PMOS diode

        A PMOS diode has its source on $V_{DD}$ (on top) and its gate tied to its drain at the bottom; we look **up** into the drain. Its model: source at the top on incremental ground, dependent source pointing **up** from drain to source, gate wired to the drain at the bottom.
        [[fig:a]]
        **$v_{gs}$:** the gate is at $v_t$, the source at 0, so $v_{gs} = v_t$. **KCL at the drain:** the test current enters the drain node and leaves upward through the device: $i_t = i_d = g_mv_t + v_t/r_{ds}$. So
        $$R = \frac{1}{g_m}\parallel r_{ds}$$
        exactly as for the NMOS. You do not need to think in terms of $v_{sg}$: the shared model, with its current defined from drain to source, takes care of the signs.

        A large-signal sanity check: the PMOS delivers current from $V_{DD}$ down into the node. Raising the node lowers $V_{SG}$, so the PMOS delivers less, and the test source must make up the difference by pushing current in. Current in for a voltage up: a positive resistance, as the model says.
      `, { a: { svg: rowSvg([{ fig: F.diode({ p: 1, look: 'R' }), cap: 'PMOS diode under $V_{DD}$' }, { fig: pDioModel, cap: 'its model: arrow up, $v_{gs} = v_t$' }]) } }),
      RF(md`
        ### A resistor in series

        Put $R_S$ between the diode's source and ground.

        **Step 1: unknowns.** The drain (and gate) is at $v_t$; the source is at $v_s$.

        **Step 2: KCL at the source node.** All of $i_t$ comes down through the device and leaves through $R_S$ (the gate takes nothing), so
        $$v_s = i_tR_S$$
        **Step 3: $v_{gs}$.** $v_{gs} = v_t - v_s$, and also $v_{ds} = v_t - v_s$: the same voltage.

        **Step 4: the device current.**
        $$i_t = g_m(v_t - v_s) + \frac{v_t - v_s}{r_{ds}} = \Big(g_m + \frac{1}{r_{ds}}\Big)(v_t - i_tR_S)$$
        **Step 5: solve.** Divide by $g_m + 1/r_{ds}$ and move $i_tR_S$ across:
        $$v_t = i_tR_S + \frac{i_t}{g_m + 1/r_{ds}}\quad\Rightarrow\quad R = R_S + \frac{1}{g_m}\parallel r_{ds}$$
        [[fig:a]]
        The diode is a two-terminal resistor, so resistors in series with it simply add. A resistor **above** the diode (between the test node and the drain), or between the PMOS diode's source and $V_{DD}$, adds the same way. Example: $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 2\kO$: $R = 2\kO + 497.5\,\Omega = 2.4975\kO$.

        !!intuition No magnification
          In [degeneration](#/l/bk03-degen) a resistor under a **held** gate gets multiplied by about $g_mr_{ds}$. Here the gate is not held: it rides up with the drain, so the transistor never fights the current, and $R_S$ is seen at face value.
      `, { a: { svg: rowSvg([{ fig: F.diode({ rs: 'R_S', look: 'R' }), cap: 'diode on $R_S$' }, { fig: dioRSModel, cap: '$v_{gs} = v_{ds} = v_t - v_s$' }]) } }),
      RF(md`
        ### Two diodes in series, and a resistor from drain to gate

        **Two diodes stacked** ($M_a$ on $M_b$): each one has its gate on its own drain, so each is a two-terminal resistor $\tfrac{1}{g_m}\parallel r_{ds}$, and they are in series:
        $$R = \Big(\tfrac{1}{g_{ma}}\parallel r_{dsa}\Big) + \Big(\tfrac{1}{g_{mb}}\parallel r_{dsb}\Big)\approx\frac{1}{g_{ma}} + \frac{1}{g_{mb}}$$
        The middle node $X$ is a divider of the two: it moves by $\dfrac{1/g_{mb}}{1/g_{ma} + 1/g_{mb}}$ of the test voltage. Remember that fraction; it is a "$K$" in [the K rule](#/l/bk03-k).

        **A resistor $R_F$ from the drain to the gate** changes nothing: the gate takes no current, so there is no voltage across $R_F$ and the gate still sits at the drain voltage. Still $\tfrac{1}{g_m}\parallel r_{ds}$.
        [[fig:a]]
        ### Where the bias comes in

        $g_m$ depends on the bias: $g_m = \sqrt{2\mu C_{ox}(W/L)I_D}$ ([Chapter 2](#/l/bk02-gm)). An NMOS diode with $W/L = 25$ at $0.2\,\text{mA}$: $g_m = \sqrt{2(100\,\mu\text{A/V}^2)(25)(0.2\,\text{mA})} = 1\,\text{mS}$, so $R\approx1\kO$. A PMOS needs twice the $W/L$ for the same $g_m$ ($\mu_pC_{ox} = 50\,\mu\text{A/V}^2$): $W/L = 50$ at $0.2\,\text{mA}$ also gives $1\,\text{mS}$.

        !!key The diode-connected transistor (NMOS or PMOS)
          $$R = \frac{1}{g_m}\parallel r_{ds}\approx\frac{1}{g_m}$$
          A resistor in series with it adds: $R_S + \tfrac{1}{g_m}\parallel r_{ds}$. Two diodes in series add.

        ### Check it

        - **$r_{ds}\to\infty$:** $R = 1/g_m$ exactly. **$g_m\to0$:** $R = r_{ds}$ (a transistor whose gate does nothing is just $r_{ds}$).
        - **Slope check:** $1/g_m = 1\kO$ matches the inverse slope of the I–V curve at $Q$ above.

        ### What it means and how to recognize it

        Whenever $v_{gs}$ equals the voltage across the transistor, it acts as a resistor $1/g_m$. Recognize a diode by the wire from the gate to the drain (the "dc" loop in our drawings, on the drain side: above an NMOS, below a PMOS). Write $1/g_m$ and add anything in series.
      `, { a: { svg: rowSvg([{ fig: twoDio, cap: 'two diodes in series' }, { fig: dioRF, cap: '$R_F$ carries no current: still a diode' }]) } }),
      R(md`
        !!mistake Common mistakes
          - Writing $r_{ds}$ for a diode. The gate is not held; it moves with the drain.
          - Magnifying a series resistor ($R_S(1 + g_mr_{ds})$). That happens only under a **held** gate.
          - Getting a sign wrong for the PMOS diode and ending with a negative resistance. Use the shared model: $v_{gs} = v_t$, current from drain to source.
          - Forgetting that $g_m$ comes from the bias: $\sqrt{2\mu C_{ox}(W/L)I_D}$, with $\mu_pC_{ox}$ for a PMOS.
      `),
      Q(md`An NMOS diode has $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$. About what is its small-signal resistance?`,
        ['$500\\,\\Omega$', '$100\\kO$', '$\\infty$', '$1\\kO$'], 0,
        [null, 'That would need the gate held. Here the gate rides with the drain: $v_{gs} = v_t$.', 'A diode conducts: it is the smallest resistance a single transistor offers.', 'That is $2/g_m$, a source loaded by another $r_{ds}$. A diode is $1/g_m$.'],
        md`$\tfrac{1}{g_m}\parallel r_{ds} = 1/(2.01\,\text{mS}) = 497.5\,\Omega\approx500\,\Omega$.`, { fig: F.diode({ look: 'R' }) }),
      Q(md`A $50\kO$ resistor connects a transistor's drain to its gate (nothing else on the gate). Looking into the drain you see`,
        ['$\\tfrac{1}{g_m}\\parallel r_{ds}$: still a diode', '$50\\kO + \\tfrac{1}{g_m}$', '$r_{ds}$', '$50\\kO\\parallel r_{ds}$'], 0,
        [null, 'The resistor is not in the current path: the gate takes no current, so $R_F$ carries none.', 'The gate is not held: through $R_F$ it sits at the drain voltage.', 'No current flows in $R_F$, so it is not a branch to ground.'],
        md`No current flows through $R_F$ (the gate takes none), so the gate sits exactly at the drain voltage: $v_{gs} = v_t$, a diode.`, { fig: dioRF }),
      Q(md`A diode-connected NMOS sits on top of $R_S = 2\kO$; $g_m = 2\,\text{mS}$, $r_{ds}$ very large. Looking in from the top you see about`,
        ['$2.5\\kO$', '$2\\kO\\times(1 + g_mr_{ds})$', '$500\\,\\Omega$', '$2\\kO$'], 0,
        [null, 'That magnification needs a held gate. Here the gate moves with the drain.', 'You forgot $R_S$, which is in series.', 'You forgot the diode\'s own $1/g_m$.'],
        md`$R_S + 1/g_m = 2\kO + 0.5\kO = 2.5\kO$. A diode is a two-terminal resistor; series resistors add.`),
      Q(md`A PMOS diode (source on $V_{DD}$, gate tied to drain) has $g_m = 1\,\text{mS}$. Looking up into it you see about`,
        ['$1\\kO$, the same as an NMOS diode', '$-1\\kO$, because a PMOS is upside down', '$r_{ds}$', '$\\infty$'], 0,
        [null, 'A passive two-terminal device cannot have a negative resistance; a negative answer means a sign slip. With the shared model, $v_{gs} = v_t$ and $i_t = g_mv_t + v_t/r_{ds}$.', 'The gate moves with the drain, so $v_{gs} = v_t$: the strong handle acts.', 'The PMOS conducts from $V_{DD}$ into the node.'],
        md`Same model, same algebra: $\tfrac{1}{g_m}\parallel r_{ds}\approx1\kO$.`, { fig: F.diode({ p: 1, look: 'R' }) }),
      P({
        id: 'bk03-dio-num', title: 'A diode with $r_{ds}$',
        q: md`An NMOS diode has $g_m = 1\,\text{mS}$ and $r_{ds} = 20\kO$. Find its exact small-signal resistance.`,
        fig: F.diode({ look: 'R' }),
        parts: [{ lbl: 'R', unit: 'Ω', ans: 952.381, traps: [{ v: 1000, msg: 'That is $1/g_m$ alone; here $r_{ds}$ is small enough to matter (5%).' }, { v: 20000, msg: 'That is $r_{ds}$: the drain of a **held** transistor.' }] }],
        hints: [md`$R = 1/(g_m + 1/r_{ds})$; $1/r_{ds} = 0.05\,\text{mS}$.`],
        sol: md`$R = \dfrac{1}{1\,\text{mS} + 0.05\,\text{mS}} = \dfrac{1}{1.05\,\text{mS}} = 952.4\,\Omega$.`,
      }),
      P({
        id: 'bk03-dio-size', title: 'A PMOS diode from its size and current',
        q: md`A PMOS diode has $W/L = 100$ and carries $0.5\,\text{mA}$ ($\mu_pC_{ox} = 50\,\mu\text{A/V}^2$). Find $g_m$ and its small-signal resistance (ignore $r_{ds}$).`,
        fig: F.diode({ p: 1, look: 'R' }),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 2.23607, traps: [{ v: 3.16228, msg: 'Use $\\mu_pC_{ox} = 50\\,\\mu\\text{A/V}^2$ for a PMOS, not $100$.' }] }, { lbl: 'R', unit: 'Ω', ans: 447.214 }],
        hints: [md`$g_m = \sqrt{2\mu_pC_{ox}(W/L)I_D}$.`],
        sol: md`
1. $g_m = \sqrt{2(50\,\mu\text{A/V}^2)(100)(0.5\,\text{mA})} = \sqrt{5\times10^{-6}}\,\text{S} = 2.236\,\text{mS}$.
2. $R\approx\dfrac{1}{g_m} = 447.2\,\Omega$. (Its overdrive is $V_{ov} = 2I_D/g_m = 0.447\,\text{V}$.)`,
      }),
      P({
        id: 'bk03-dio-rs', title: 'Diodes with series resistors, NMOS and PMOS',
        q: md`(a) An NMOS diode ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$) sits on $R_S = 1\kO$. (b) A PMOS diode ($g_m = 0.5\,\text{mS}$, $r_{ds} = 200\kO$) has $R = 3\kO$ between its source and $V_{DD}$. Find the resistance looking into each drain.`,
        figHtml: rowSvg([{ fig: F.diode({ rs: 'R_S', look: 'R_a' }), cap: '(a)' }, { fig: F.diode({ p: 1, rs: 'R', look: 'R_b' }), cap: '(b)' }]),
        parts: [{ lbl: 'R_a', unit: 'kΩ', ans: 1.49751, traps: [{ v: 301, msg: 'That magnifies $R_S$ as if the gate were held. A diode just adds.' }] }, { lbl: 'R_b', unit: 'kΩ', ans: 4.9802 }],
        hints: [md`Each is $R_{series} + \tfrac{1}{g_m}\parallel r_{ds}$.`],
        sol: md`
**(a)** $\tfrac{1}{g_m}\parallel r_{ds} = 1/(2.01\,\text{mS}) = 497.5\,\Omega$; $R_a = 1\kO + 0.4975\kO = 1.4975\kO$.

**(b)** $\tfrac{1}{g_m}\parallel r_{ds} = 1/(0.5\,\text{mS} + 0.005\,\text{mS}) = 1/(0.505\,\text{mS}) = 1.980\kO$; $R_b = 3\kO + 1.980\kO = 4.980\kO$. ($V_{DD}$ is ground, so $R$ is simply in series.)`,
      }),
      P({
        id: 'bk03-dio-two', title: 'Two diodes in a stack',
        q: md`Two NMOS diodes are stacked, $M_a$ ($g_{ma} = 2\,\text{mS}$) on top of $M_b$ ($g_{mb} = 4\,\text{mS}$); ignore $r_{ds}$. Find the resistance looking into the top, and the fraction $v_X/v_t$ by which the middle node moves.`,
        fig: twoDio,
        parts: [{ lbl: 'R', unit: 'Ω', ans: 750, traps: [{ v: 166.667, msg: 'Stacked devices carry the same current: series, not parallel.' }] }, { lbl: 'v_X/v_t', unit: '', ans: 0.333333 }],
        hints: [md`Each diode is $1/g_m$; same current through both.`, md`$v_X$ is the voltage across the bottom diode: a divider.`],
        sol: md`
1. $1/g_{ma} = 500\,\Omega$, $1/g_{mb} = 250\,\Omega$, in series: $R = 750\,\Omega$.
2. The same current $i_t = v_t/750\,\Omega$ flows through both, so $v_X = i_t\times250\,\Omega$ and $\dfrac{v_X}{v_t} = \dfrac{250}{750} = \dfrac13$.`,
      }),
      P({
        id: 'bk03-dio-sym', title: 'The diode on a resistor, typed',
        q: md`A diode-connected NMOS sits on top of a resistor $R$ to ground. Type the resistance looking into the top, keeping $r_{ds}$ (the $g_mr_{ds}\gg1$ form is accepted too). Variables: gm, rds, R.`,
        fig: F.diode({ rs: 'R', look: 'R_{in}' }),
        parts: [BK.ex('R + 1/(gm + 1/rds)', ['gm', 'rds', 'R'], 'R_{in}', { ranges: { gm: [1e-3, 4e-3], rds: [1e5, 3e5], R: [200, 2000] } })],
        hints: [md`$v_s = i_tR$ and $v_{gs} = v_{ds} = v_t - v_s$.`],
        sol: md`$i_t = (g_m + 1/r_{ds})(v_t - i_tR)$, so $v_t = i_t\Big(R + \dfrac{1}{g_m + 1/r_{ds}}\Big)$:
$$R_{in} = R + \frac{1}{g_m}\parallel r_{ds}\approx R + \frac{1}{g_m}$$`,
      }),
      P({
        id: 'bk03-dio-load', title: 'A common-source stage with a diode load',
        q: md`$M_1$ ($g_{m1} = 4\,\text{mS}$, $r_{ds1} = 100\kO$) drives a PMOS diode load $M_2$ ($g_{m2} = 1\,\text{mS}$, $r_{ds2} = 50\kO$). Find $R_{out}$ (input off) and, as a preview of Chapter 4, $A_v = -g_{m1}R_{out}$.`,
        fig: F.node(['diode', { n: 'M_2' }], ['drain', { n: 'M_1' }], { look: 'R_{out}' }),
        parts: [{ lbl: 'R_{out}', unit: 'Ω', ans: 970.874, traps: [{ v: 33333.3, msg: 'That is $r_{ds1}\\parallel r_{ds2}$: it forgets that $M_2$ is a diode.' }] },
          { lbl: 'A_v', unit: '', ans: -3.8835 }],
        hints: [md`Up: the PMOS diode, $\tfrac{1}{g_{m2}}\parallel r_{ds2}$. Down: $M_1$ with its gate held, $r_{ds1}$.`],
        sol: md`
1. Up: $g_{m2} + 1/r_{ds2} = 1.02\,\text{mS}$. Down: $1/r_{ds1} = 0.01\,\text{mS}$. Parallel branches add their conductances:
$$R_{out} = \frac{1}{1.02\,\text{mS} + 0.01\,\text{mS}} = \frac{1}{1.03\,\text{mS}} = 970.9\,\Omega$$
2. $A_v = -(4\,\text{mS})(970.9\,\Omega) = -3.88$, close to $-g_{m1}/g_{m2} = -4$: a diode-loaded stage has a small gain set by the ratio of transconductances ([Chapter 4](#/l/bk04-loads)).`,
      }),
      G('bk_mi_diode', { need: 3 }),
    ],
  });

  // ================================================================== 6. degeneration: the impedance scaler
  const degModel = [...S.gport(-0.6, 0.4, 2, 2, { gnd: true }), ...S.mos(2, 0, 2), ['R', [2.65, 2], [2.65, 3.4], { n: 'R_S', side: 'l' }], ['gnd', [2.65, 3.4]],
    ['node', [2.65, 2], { n: 'v_s = i_tR_S', side: 'br' }], ['txt', [2.15, -0.3], '$D$', { a: 'l' }], ...S.test(3.3, 0)];
  const degCur = [...S.mos(2, 0, 2, { w: 1.6 }), ['w', [2, 0], [2, -0.6], [6.2, -0.6]], ['txt', [2.15, -0.85], '$D$', { a: 'l' }],
    ['iarr', [3.6, 0.5], 'd', { n: '(1 + g_mR_S)\\,i_t', side: 'r', off: [18, 0] }], ['iarr', [2, 0.5], 'u', { n: 'g_mR_S\\,i_t', side: 'l', off: [-30, 0] }],
    ['R', [2.8, 2], [2.8, 3.4], { n: 'R_S', side: 'l' }], ['gnd', [2.8, 3.4]], ['node', [2.8, 2], { n: 'i_t\\ \\text{flows on down}', side: 'br' }],
    ['V', [6.2, -0.6], [6.2, 0.6], { n: 'v_t', side: 'r' }], ['gnd', [6.2, 0.6]], ['iarr', [5.2, -0.6], 'l', { n: 'i_t' }]];
  const pdegModel = [['gndu', [2, -1.6]], ['R', [2, -1.6], [2, 0], { n: 'R_S', side: 'l' }], ['node', [2, 0], { n: 'S', side: 'al' }], ...S.mos(2, 2, 0),
    ['node', [2, 2], { n: 'D', side: 'bl' }], ['txt', [0.4, 1], '$v_{gs} = 0 - v_s$', { a: 'r' }], ...S.test(3.3, 2)];
  const degDiode = [['w', [1, 0], [1, -0.4]], F.lookDn([1, -0.4], 'R'), ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['node', [1, 2], { n: 'X', side: 'r' }],
    ['nmos', [1, 3], { n: 'M_2', dc: true }], ['gnd', [1, 4]]];

  L({
    id: 'bk03-degen', title: 'Degeneration: the impedance scaler', ref: 'Lecture 17',
    steps: [
      RF(md`
        ### The question

        Hold the gate and put a resistor $R_S$ between the source and ground. What do you see looking into the **drain**? This is the most important result of the chapter: the output resistance of a degenerated current source, the heart of every cascode, and the "$R_{DN}$" branch of most Exam 2 nodes.

        ### The physical picture: a transistor that fights back

        Push the drain up by a small $v_t$. Through the weak handle ($r_{ds}$), a little extra current starts to flow down through the transistor. That current has to go through $R_S$, so it lifts the source. With the gate held, a higher source means a **smaller $v_{gs}$**, and through the strong handle the transistor cuts its current back. The current that tried to grow is mostly cancelled.

        This is **negative feedback**: $R_S$ senses the current and turns it into a voltage that the transistor uses to oppose the change. The transistor ends up holding its current nearly constant however you push the drain, and "current that barely changes" is a very large resistance. A transistor with a resistor under its source is a far better current source than one without.
        [[fig:a]]
        Magnitudes: with $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$, a mere $R_S = 1\kO$ makes the drain look like $301\kO$, three times $r_{ds}$; $R_S = 10\kO$ makes it $2.1\,\text{M}\Omega$.
      `, { a: { fig: F.drain({ rs: 'R_S', look: 'R_{DN}' }), cap: 'gate held, $R_S$ under the source: look down into the drain' } }),
      RF(md`
        ### The derivation, every step

        **Step 1: sources off.** The gate bias becomes ground; the bottom of $R_S$ is ground.

        **Step 2: test source** on the drain: $v_d = v_t$, and $i_t$ flows in.

        **Step 3: the model.**
        [[fig:a]]
        **Step 4: KCL at the drain.** Besides the test source, only the transistor touches the drain. So the device current (drain to source) equals the test current:
        $$i_d = i_t$$
        **Step 5: KCL at the source.** The device current arrives at the source node and has one way out, down through $R_S$ (the gate takes nothing):
        $$v_s = i_tR_S$$
        **Step 6: $v_{gs}$.** The gate is at 0:
        $$v_{gs} = 0 - v_s = -i_tR_S$$
        **Step 7: the device equation.** $i_d = g_mv_{gs} + (v_d - v_s)/r_{ds}$, with Steps 4 to 6 put in:
        $$i_t = -g_mR_S\,i_t + \frac{v_t - i_tR_S}{r_{ds}}$$
        **Step 8: multiply every term by $r_{ds}$.**
        $$i_tr_{ds} = -g_mr_{ds}R_S\,i_t + v_t - R_S\,i_t$$
        **Step 9: all $i_t$ terms on the left.** Add $g_mr_{ds}R_S\,i_t + R_S\,i_t$ to both sides:
        $$i_t\,(r_{ds} + R_S + g_mr_{ds}R_S) = v_t$$
        **Step 10: the ratio.**
        $$R_{DN} = \frac{v_t}{i_t} = r_{ds} + R_S + g_mr_{ds}R_S$$
      `, { a: { fig: degModel, cap: 'all of $i_t$ flows through $R_S$: $v_s = i_tR_S$, $v_{gs} = -i_tR_S$' } }),
      RF(md`
        !!key Degeneration (gate held, $R_S$ under the source)
          $$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S = r_{ds} + R_S\,(1 + g_mr_{ds})\approx r_{ds}\,(1 + g_mR_S)$$

        ### A second way: follow the current around

        The same answer, read off the circuit with KVL. The device carries $i_t$ in total, split between its two parallel paths: $i_t = g_mv_{gs} + i_{r}$, where $i_r$ is the current in $r_{ds}$. So
        $$i_r = i_t - g_mv_{gs} = i_t + g_mR_S\,i_t = (1 + g_mR_S)\,i_t$$
        **$r_{ds}$ carries more than the test current.** The dependent source carries $g_mR_Si_t$ *backwards* (up, from source to drain), and that current circulates around the little loop through $r_{ds}$.
        [[fig:a]]
        Now KVL from the drain down to ground, through $r_{ds}$ and then $R_S$:
        $$v_t = (1 + g_mR_S)\,i_t\,r_{ds} + i_tR_S\quad\Rightarrow\quad R_{DN} = r_{ds}(1 + g_mR_S) + R_S$$
        the same three terms. This picture shows *where* the magnification lives: in the extra current that the feedback forces through $r_{ds}$. With $R_S = 1\kO$ and $g_m = 2\,\text{mS}$, $r_{ds}$ carries $3i_t$ and the dependent source $2i_t$ backwards.
      `, { a: { fig: degCur, cap: 'the circulating current: $r_{ds}$ carries $(1 + g_mR_S)\\,i_t$' } }),
      R(md`
        ### Check it

        - **$R_S = 0$:** $R_{DN} = r_{ds}$, the plain drain. ✓
        - **$g_m = 0$** (a transistor whose gate does nothing): $R_{DN} = r_{ds} + R_S$, two resistors in series. The term $g_mr_{ds}R_S$ is entirely the feedback. ✓
        - **$r_{ds}\to\infty$:** $R_{DN}\to\infty$. An ideal current source stays ideal. ✓
        - **Units:** $g_mr_{ds}$ is a pure number, so $g_mr_{ds}R_S$ is in ohms. ✓

        ### Which approximation, when

        $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$ ($g_mr_{ds} = 200$):

        | $R_S$ | $g_mR_S$ | exact $r_{ds} + R_S + g_mr_{ds}R_S$ | $r_{ds}(1 + g_mR_S)$ | $g_mr_{ds}R_S$ |
        |---|---|---|---|---|
        | $100\,\Omega$ | $0.2$ | $120.1\kO$ | $120\kO$ | $20\kO$ (useless) |
        | $1\kO$ | $2$ | $301\kO$ | $300\kO$ | $200\kO$ (33% low) |
        | $10\kO$ | $20$ | $2110\kO$ | $2100\kO$ | $2000\kO$ (5% low) |

        **$r_{ds}(1 + g_mR_S)$ is always safe** (it only drops the lone $R_S$, tiny next to $r_{ds}$). **$g_mr_{ds}R_S$ is safe only when $g_mR_S\gg1$.**

        ### What it means: the impedance scaler

        Write the result as $R_{DN} = r_{ds} + (1 + g_mr_{ds})\,R_S$. Seen from the drain, the resistor under the source is **multiplied by $1 + g_mr_{ds}$**, the intrinsic gain plus one. Put this next to [the source with a drain load](#/l/bk03-source), $R_S = (r_{ds} + R_D)/(1 + g_mr_{ds})$: seen from the source, the resistor on the drain is **divided** by the same $1 + g_mr_{ds}$.

        !!key Lecture 17: "common gate acts as an impedance scaler"
          With the gate held, a transistor scales resistances by $1 + g_mr_{ds}\approx g_mr_{ds}$: **up** when you look from the drain at what is under the source, **down** when you look from the source at what is on the drain.

        In feedback language: the loop gain is $g_mR_S$ (the voltage $R_S$ develops per unit current, times the transistor's response to it), and series feedback at the output multiplies the output resistance by one plus the loop gain: $r_{ds}(1 + g_mR_S)$. Razavi derives the same thing for the degenerated common-source stage.
      `),
      RF(md`
        ### The PMOS version

        A PMOS current source with $R_S$ between its source and $V_{DD}$, gate held, looked into from below. The model is the same model, drawn with the source on top and the dependent source pointing up:
        [[fig:a]]
        The test current enters the drain at the bottom, flows **up** through the device (that is drain to source, so $i_d = i_t$) and up through $R_S$ to $V_{DD}$ (ground): $v_s = i_tR_S$ and $v_{gs} = -i_tR_S$. The device equation is word for word the NMOS one, so
        $$R_{UP} = r_{ds} + R_S + g_mr_{ds}R_S$$
        (A large-signal square-law simulation of this PMOS circuit gives the same number to within 0.001%: the orientation needs no extra signs.)

        ### $R_S$ can be anything

        The derivation used only "$v_s = i_tR_S$": the resistance looking down from the source. So $R_S$ may be a transistor: another transistor's $r_{ds}$ (that is [the cascode](#/l/bk03-cascode)), or a diode.
        [[fig:b]]
        **Example: a diode under the source.** $M_1$ and the diode $M_2$ both have $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$. Looking down from $X$: $R_X = \tfrac{1}{g_{m2}}\parallel r_{ds2} = 497.5\,\Omega$. Then
        $$R_{DN} = r_{ds1} + R_X(1 + g_{m1}r_{ds1}) = 100\kO + 0.4975\kO\times201 = 200\kO$$
        For matched devices $R_X(1 + g_mr_{ds}) = r_{ds}$ exactly, so the diode doubles $r_{ds}$.

        ### How to recognize it

        You are looking into a drain, the gate is held, and there is something (not a rail) under the source. Find the resistance $R_S$ looking down from the source, then write $r_{ds} + R_S + g_mr_{ds}R_S$. If the gate is **not** held, this is the next section's [K rule](#/l/bk03-k).
      `, { a: { svg: rowSvg([{ fig: F.drain({ p: 1, rs: 'R_S', look: 'R_{UP}' }), cap: 'PMOS with $R_S$ to $V_{DD}$' }, { fig: pdegModel, cap: 'the same equations, arrow up' }]) },
        b: { fig: degDiode, cap: 'a diode under the source: $R_S\\to\\tfrac{1}{g_{m2}}\\parallel r_{ds2}$' } }),
      R(md`
        !!mistake Common mistakes
          - Adding $r_{ds} + R_S$ and stopping: that leaves out the feedback term $g_mr_{ds}R_S$, usually the largest.
          - Using $g_mr_{ds}R_S$ alone when $g_mR_S$ is not large (33% low at $g_mR_S = 2$).
          - Using the wrong transistor's $g_m$: the magnifying $g_m$ and $r_{ds}$ belong to the transistor you look into, not to the one under its source.
          - Applying the formula when the gate is not held (a diode, a divider): then use [the diode](#/l/bk03-diode) or [the K rule](#/l/bk03-k).
          - Confusing the resistor $R_S$ with "the resistance looking into the source" (also often called $R_S$): read which one the problem means.
      `),
      Q(md`$g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 1\kO$ under the source, gate held. About how big is the resistance looking into the drain?`,
        ['$\\approx150\\kO$', '$\\approx51\\kO$', '$\\approx100\\kO$', '$\\approx1\\kO$'], 0,
        [null, 'That is $r_{ds} + R_S$: it leaves out the feedback term $g_mr_{ds}R_S = 100\\kO$, the biggest one.', 'That is $g_mr_{ds}R_S$ alone; add $r_{ds}$ (here $g_mR_S = 2$ is not large).', 'That is $R_S$ alone; the transistor magnifies it.'],
        md`$r_{ds} + R_S + g_mr_{ds}R_S = 50 + 1 + 100 = 151\kO$; $r_{ds}(1 + g_mR_S) = 150\kO$.`, { fig: F.drain({ rs: 'R_S' }) }),
      Q(md`Why does a resistor under the source make the drain resistance **larger**?`,
        ['The current through $R_S$ raises the source and lowers $v_{gs}$, so the transistor opposes any change in its current', 'Because resistors in series add', 'Because $R_S$ raises the bias current', 'Because the gate current flows through $R_S$'], 0,
        [null, 'Series addition gives only $r_{ds} + R_S$; the real answer is much bigger because of the feedback.', 'The small-signal resistance does not come from a change in bias; and a larger $I_D$ would lower $r_{ds}$.', 'There is no gate current.'],
        md`Negative feedback: $R_S$ turns the current into a voltage at the source, the held gate turns that into a smaller $v_{gs}$, and $g_m$ turns it back into a current that opposes the change. The loop gain is $g_mR_S$.`),
      Q(md`When is $R_{DN}\approx g_mr_{ds}R_S$ (the shortest form) accurate?`,
        ['When $g_mR_S\\gg1$', 'Always, since $g_mr_{ds}\\gg1$', 'When $R_S\\ll1/g_m$', 'When $r_{ds}\\ll R_S$'], 0,
        [null, '$g_mr_{ds}\\gg1$ only lets you drop the lone $R_S$; the $r_{ds}$ term remains unless $g_mR_S\\gg1$.', 'Then the feedback is weak and $R_{DN}\\approx r_{ds}$: the shortest form would be far too small.', 'In practice $r_{ds}\\gg R_S$; if it were not, other terms would matter too.'],
        md`$R_{DN} = r_{ds}(1 + g_mR_S) + R_S$. Dropping the "1" next to $g_mR_S$ needs $g_mR_S\gg1$.`),
      Q(md`A PMOS current source has $R_S$ between its source and $V_{DD}$ and its gate on a fixed bias. Looking up into its drain you see`,
        ['$r_{ds} + R_S + g_mr_{ds}R_S$, the same as an NMOS', '$\\dfrac{r_{ds} + R_S}{1 + g_mr_{ds}}$', '$r_{ds} - R_S - g_mr_{ds}R_S$', '$r_{ds}$: $V_{DD}$ shorts $R_S$'], 0,
        [null, 'That is the formula for looking into a **source** with a resistor on the drain.', 'A passive circuit cannot give that; the PMOS needs no extra minus signs with the shared model.', '$V_{DD}$ is ground for signals, but $R_S$ still sits between the source and that ground.'],
        md`Same model, same equations, same answer. Only the drawing is upside down.`, { fig: F.drain({ p: 1, rs: 'R_S' }) }),
      P({
        id: 'bk03-deg-num', title: 'Exact and shortest forms',
        q: md`$g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 2\kO$, gate held. Find the exact $R_{DN}$ and the shortest form $g_mr_{ds}R_S$.`,
        fig: F.drain({ rs: 'R_S', look: 'R_{DN}' }),
        parts: [{ lbl: 'R_{DN}', unit: 'kΩ', ans: 152, traps: [{ v: 52, msg: 'That is $r_{ds} + R_S$: add the feedback term $g_mr_{ds}R_S$.' }] }, { lbl: 'g_mr_{ds}R_S', unit: 'kΩ', ans: 100 }],
        hints: [md`$g_mr_{ds} = 50$ and $g_mR_S = 2$.`],
        sol: md`
1. $R_{DN} = 50 + 2 + (1\,\text{mS})(50\kO)(2\kO) = 50 + 2 + 100 = 152\kO$.
2. Shortest form: $100\kO$, 34% low, because $g_mR_S = 2$ is not $\gg1$. The safe form $r_{ds}(1 + g_mR_S) = 150\kO$ is within 1.3%.`,
      }),
      P({
        id: 'bk03-deg-pmos', title: 'A degenerated PMOS current source',
        q: md`A PMOS ($g_m = 0.5\,\text{mS}$, $r_{ds} = 200\kO$) has $R_S = 4\kO$ to $V_{DD}$ and a held gate. Find the resistance looking up into its drain.`,
        fig: F.drain({ p: 1, rs: 'R_S', look: 'R_{UP}' }),
        parts: [{ lbl: 'R_{UP}', unit: 'kΩ', ans: 604, traps: [{ v: 204, msg: 'Add the feedback term $g_mr_{ds}R_S$.' }, { v: 2.0396, msg: 'That is the formula for a **source** with a drain resistor; here you look into the drain.' }] }],
        hints: [md`Same formula as the NMOS: $r_{ds} + R_S + g_mr_{ds}R_S$, with $g_mr_{ds} = 100$.`],
        sol: md`$R_{UP} = 200 + 4 + 100\times4 = 604\kO$. Upside down, same equations.`,
      }),
      P({
        id: 'bk03-deg-sym', title: 'Degeneration, typed',
        q: md`Gate held, $R_S$ from the source to ground. Type the resistance looking into the drain (exact, or a form within 3% of it). Variables: gm, rds, RS.`,
        fig: F.drain({ rs: 'R_S', look: 'R_{DN}' }),
        parts: [BK.ex('rds + RS + gm*rds*RS', ['gm', 'rds', 'RS'], 'R_{DN}', { ranges: { gm: [1e-3, 4e-3], rds: [1e5, 3e5], RS: [200, 2000] } })],
        hints: [md`$v_s = i_tR_S$, $v_{gs} = -i_tR_S$, and the device current is $i_t$.`],
        sol: md`$i_t = -g_mR_Si_t + (v_t - i_tR_S)/r_{ds}$; times $r_{ds}$ and collect:
$$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S\approx r_{ds}(1 + g_mR_S)$$
(The shortest form $g_mr_{ds}R_S$ is not accepted here: with $g_mR_S$ between 0.2 and 8 it can be far off.)`,
      }),
      P({
        id: 'bk03-deg-design', title: 'Design a current source',
        q: md`A transistor has $g_m = 2\,\text{mS}$ and $r_{ds} = 50\kO$. What $R_S$ under its source makes the drain look like $1\,\text{M}\Omega$?`,
        fig: F.drain({ rs: 'R_S', look: '1\\,\\text{M}\\Omega' }),
        parts: [{ lbl: 'R_S', unit: 'kΩ', ans: 9.40594, accept: [9.5], traps: [{ v: 10, msg: 'That uses $g_mr_{ds}R_S = 1\\,\\text{M}\\Omega$ and forgets the $r_{ds}$ term; solve the full form.' }] }],
        hints: [md`$R_{DN} = r_{ds} + R_S(1 + g_mr_{ds})$; solve for $R_S$.`],
        sol: md`$R_S = \dfrac{R_{DN} - r_{ds}}{1 + g_mr_{ds}} = \dfrac{1000 - 50}{1 + 100}\kO = \dfrac{950}{101}\kO = 9.41\kO$. (With $r_{ds}(1 + g_mR_S) = 1\,\text{M}\Omega$ you would get $9.5\kO$, also accepted.)`,
      }),
      P({
        id: 'bk03-deg-diode', title: 'A diode under the source',
        q: md`$M_1$ ($g_{m1} = 2\,\text{mS}$, $r_{ds1} = 100\kO$, gate held) sits on a diode-connected $M_2$ ($g_{m2} = 4\,\text{mS}$, $r_{ds2} = 50\kO$). Find the resistance $R_X$ looking down from $M_1$'s source, then $R_{DN}$ looking into $M_1$'s drain.`,
        fig: degDiode,
        parts: [{ lbl: 'R_X', unit: 'Ω', ans: 248.756 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 150, traps: [{ v: 100.249, msg: 'You added $R_X$ in series; it is magnified by $1 + g_{m1}r_{ds1}$.' }] }],
        hints: [md`$R_X = \tfrac{1}{g_{m2}}\parallel r_{ds2}$.`, md`Then degeneration with $R_S = R_X$: $r_{ds1} + R_X(1 + g_{m1}r_{ds1})$.`],
        sol: md`
1. $R_X = \dfrac{1}{4\,\text{mS} + 0.02\,\text{mS}} = 248.8\,\Omega$.
2. $1 + g_{m1}r_{ds1} = 201$, so $R_{DN} = 100\kO + 0.2488\kO\times201 = 100 + 50.0 = 150\kO$.`,
      }),
      P({
        id: 'bk03-deg-quality', title: 'How much better is a degenerated current source?',
        q: md`A current source runs at $I_D = 0.5\,\text{mA}$ with $V_{ov} = 0.25\,\text{V}$ and $\lambda = 0.04\,\text{V}^{-1}$. (a) Find $g_m$ and $r_{ds}$. (b) Find its output resistance with $R_S = 1\kO$ under the source. (c) The output voltage rises by $2\,\text{V}$: by how much does the current change, with $R_S$? (Without it, $2\,\text{V}/r_{ds} = 40\,\mu\text{A}$, 8% of the bias.)`,
        fig: F.drain({ rs: 'R_S', look: 'R_{out}' }),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 4 }, { lbl: 'r_{ds}', unit: 'kΩ', ans: 50 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 251 }, { lbl: '\\Delta I', unit: 'µA', ans: 7.96813 }],
        hints: [md`$g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$.`, md`$\Delta I = \Delta V/R_{out}$ (a small-signal estimate).`],
        sol: md`
**(a)** $g_m = \dfrac{2(0.5\,\text{mA})}{0.25\,\text{V}} = 4\,\text{mS}$; $r_{ds} = \dfrac{1}{(0.04)(0.5\,\text{mA})} = 50\kO$.

**(b)** $R_{out} = 50 + 1 + (4\,\text{mS})(50\kO)(1\kO) = 51 + 200 = 251\kO$.

**(c)** $\Delta I = \dfrac{2\,\text{V}}{251\kO} = 7.97\,\mu\text{A}$, 1.6% of the bias instead of 8%. One kilohm made the source five times stiffer.`,
      }),
      G('bk_mi_degen', { need: 3 }),
    ],
  });

  // ================================================================== 7. the K rule
  const kModel = [['V', [0, 0.3], [0, 1.5], { n: 'Kv_t', side: 'l' }], ['gnd', [0, 1.5]], ['w', [0, 0.3], [0.6, 0.3]], ['term', [0.6, 0.3], { n: 'G', side: 'a' }],
    ['term', [0.6, 1.2]], ['w', [0.6, 1.2], [0.6, 2], [2.4, 2]], ['vlab', [0.85, 0.45], [0.85, 1.05], { n: 'v_{gs}' }],
    ...S.mos(2.4, 0, 2), ['R', [3.05, 2], [3.05, 3.4], { n: 'R_S', side: 'l' }], ['gnd', [3.05, 3.4]], ['node', [3.05, 2], { n: 'v_s = i_tR_S', side: 'br' }],
    ['txt', [2.55, -0.3], '$D$', { a: 'l' }], ...S.test(3.7, 0)];
  const kPlot = Schem.plot({
    x: [0, 1], y: [0, 360], xl: 'K', yl: 'R_{DN}\\ (\\text{k}\\Omega)', w: 420, h: 260,
    curves: [{ f: (k) => 301 / (1 + 200 * k) }], pts: [{ x: 0, y: 301, n: '301' }, { x: 0.05, y: 27.4, n: '27' }, { x: 0.5, y: 2.98, n: '3' }],
    xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 100, 200, 300],
  });
  const kMirror = [['w', [1, 0], [1, -0.4], [3.6, -0.4]], ['w', [3, 0], [3, -0.4]], F.lookR([3.6, -0.4], 'R_{EQ}'),
    ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['node', [1, 2], { n: 'X', side: 'l' }], ['nmos', [1, 3], { n: 'M_2', dc: true }], ['gnd', [1, 4]],
    ['w', [1, 2], [1.8, 2], [1.8, 1], [2, 1]], ['nmos', [3, 1], { n: 'M_4' }], ['gnd', [3, 2]]];

  L({
    id: 'bk03-k', title: 'Gates that move: the K rule', ref: 'Problem Set 5 (f)–(i)',
    steps: [
      RF(md`
        ### The question

        So far every gate was either **held** (degeneration: a huge resistance) or **tied to its own drain** (a diode: a small one). Often a gate is driven by something in between: the middle of a resistor divider hung from the test node, the middle of a diode stack, a diode in another branch that carries the test current. How big is the drain resistance then? This is Problem Set 5 (f) to (i), and part (b) of several Exam 2 practice problems.

        ### The physical picture: a gate that helps a little

        Describe how much the gate moves with one number:
        $$v_g = K\,v_t$$
        $K = 0$ is the held gate: the transistor fights the drain (feedback through $R_S$) and the resistance is large. $K = 1$ is the diode: the gate rises with the drain, the transistor helps the current along, and the resistance is small. In between, the gate opens the channel by $g_mKv_t$, a fraction of a diode's push. Without $R_S$ the transistor would be a diode weakened by the factor $K$: about $1/(Kg_m)$.
        [[fig:a]]
        ### The model and the derivation

        The gate's driver is computed separately (next part), and here it is simply a voltage $Kv_t$: the gate takes no current, so it cannot disturb whatever drives it.
        [[fig:b]]
        **Step 1: node voltages.** $v_d = v_t$, $v_g = Kv_t$, and, since all of $i_t$ flows down through the device and $R_S$, $v_s = i_tR_S$.

        **Step 2: $v_{gs}$.**
        $$v_{gs} = Kv_t - i_tR_S$$
        **Step 3: the device current equals $i_t$.** The dependent source plus $r_{ds}$, which has $v_t - i_tR_S$ across it:
        $$i_t = g_m(Kv_t - i_tR_S) + \frac{v_t - i_tR_S}{r_{ds}}$$
        **Step 4: multiply every term by $r_{ds}$.**
        $$i_tr_{ds} = g_mr_{ds}K\,v_t - g_mr_{ds}R_S\,i_t + v_t - R_S\,i_t$$
        **Step 5: $i_t$ terms on the left, $v_t$ terms on the right.**
        $$i_t\,(r_{ds} + R_S + g_mr_{ds}R_S) = v_t\,(1 + g_mr_{ds}K)$$
        **Step 6: the ratio.**
        $$R_{DN} = \frac{v_t}{i_t} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$$
      `, { a: { fig: F.k({ look: 'R_{DN}' }), cap: 'the gate moves by $K$ times the test voltage' }, b: { fig: kModel, cap: 'the gate driven by $Kv_t$: $v_{gs} = Kv_t - i_tR_S$' } }),
      RF(md`
        !!key The K rule (the gate moves by $Kv_t$, $R_S$ under the source)
          $$R_{DN} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}\approx\frac{R_S + 1/g_m}{K}$$
          The top is the degenerated drain; the bottom is what the moving gate does. The short form needs $g_mr_{ds}K\gg1$.

        ### Check the corners

        - **$K = 0$ (gate held):** the bottom is 1: $r_{ds} + R_S + g_mr_{ds}R_S$, [degeneration](#/l/bk03-degen). ✓
        - **$K = 1$ (gate on the drain: a diode on $R_S$):** write the top as $r_{ds} + R_S(1 + g_mr_{ds})$ and divide each piece by $1 + g_mr_{ds}$:
        $$R_{DN} = \frac{r_{ds}}{1 + g_mr_{ds}} + R_S = \tfrac{1}{g_m}\parallel r_{ds} + R_S$$
        exactly [the diode on a resistor](#/l/bk03-diode). ✓
        - **$R_S = 0$:** $R_{DN} = \dfrac{r_{ds}}{1 + g_mr_{ds}K} = \dfrac{1}{1/r_{ds} + Kg_m} = r_{ds}\parallel\dfrac{1}{Kg_m}$, a diode weakened by $K$.

        ### How fast the resistance collapses

        With $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$, the top is $301\kO$ and the bottom is $1 + 200K$:
        [[fig:p]]
        $K = 0.05$ already divides the resistance by 11, down to $27.4\kO$; $K = 0.5$ gives $2.98\kO$ (short form: $(1 + 0.5)\kO/0.5 = 3\kO$); $K = 1$ gives $1.50\kO$. **A gate that moves even a few percent destroys the magnification**, because the intrinsic gain $g_mr_{ds} = 200$ multiplies $K$.
      `, { p: { svg: kPlot, cap: '$R_{DN} = 301\\kO/(1 + 200K)$: most of the drop happens below $K = 0.1$' } }),
      RF(md`
        ### Finding $K$

        Finding $K$ is the real work. Ask: **"if the test node moves by $v_t$, how far does this gate move?"** Three patterns cover the exams.

        **1. A resistor divider** $R_a$ (top), $R_b$ (bottom) hung from the test node, with the gate at the middle. The gate takes no current, so the divider is unloaded:
        $$K = \frac{R_b}{R_a + R_b}$$
        **The divider is also a branch of the node**: it carries $v_t/(R_a + R_b)$ to ground. Put it in parallel at the end.

        **Example.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$, $R_a = R_b = 10\kO$. Then $K = 0.5$; the transistor branch is $301/101 = 2.980\kO$; the divider branch is $20\kO$; so
        $$R_{EQ} = 20\kO\parallel2.980\kO = \frac{20\times2.980}{22.98}\kO = 2.594\kO$$
        [[fig:a]]
        **2. The middle of a stack that carries the test current.** The branch carries $i = v_t/R_{branch}$, and the gate's node sits at $i\times(\text{resistance below it})$:
        $$K = \frac{\text{resistance below the gate's node}}{\text{total resistance of that branch}}$$
        **Example.** Two diodes $M_a$ over $M_b$ ($g_m = 1\,\text{mS}$ each) hang from the test node; $M_c$ ($g_{mc} = 2\,\text{mS}$) has its drain on the node, its source grounded and its gate on the middle node $X$. All $r_{ds} = 100\kO$. Each diode is $1/(1.01\,\text{mS}) = 990.1\,\Omega$, so $K = 990.1/1980.2 = 0.5$; $M_c$ is $\dfrac{100\kO}{1 + 200\times0.5} = 990.1\,\Omega$; and with the stack in parallel,
        $$R_{EQ} = 1980.2\,\Omega\parallel990.1\,\Omega = 660.1\,\Omega$$
        [[fig:b]]
        **3. A diode in another branch** (Problem Set 5 (f)). The test current through one branch also flows through a diode at its bottom, and another transistor's gate sits on that diode. That gate moves by $K = \dfrac{1/g_{m}\ \text{of the diode}}{R_{branch}}$. The next example works it in full.
      `, { a: { fig: F.kdiv({ rs: 1, look: 'R_{EQ}' }), cap: 'a divider sets $K$, and is a branch too' }, b: { fig: F.kstack({ look: 'R_{EQ}' }), cap: 'a diode stack sets $K$ for $M_c$' } }),
      RF(md`
        ### Worked example: feedback through a diode

        $M_1$ (gate held) sits on the diode $M_2$; $M_4$ has its drain on the test node, its source grounded, and its gate on $X$, the top of $M_2$. All transistors $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$. Find $R_{EQ}$.
        [[fig:a]]
        **Step 1: the left branch.** $M_1$ degenerated by the diode: $R_X = \tfrac{1}{g_m}\parallel r_{ds} = 497.5\,\Omega$, so
        $$R_{b1} = r_{ds} + R_X(1 + g_mr_{ds}) = 100\kO + 0.4975\kO\times201 = 200\kO$$
        **Step 2: $K$ for $M_4$.** The left branch carries $v_t/R_{b1}$, all of it through $M_2$, so $v_X = (v_t/R_{b1})R_X$:
        $$K = \frac{R_X}{R_{b1}} = \frac{497.5}{200{,}000} = 0.002488$$
        **Step 3: $M_4$ by the K rule** ($R_S = 0$):
        $$R_{M4} = \frac{r_{ds}}{1 + g_mr_{ds}K} = \frac{100\kO}{1 + 200\times0.002488} = \frac{100\kO}{1.4975} = 66.78\kO$$
        **Step 4: the node.** $R_{EQ} = 200\kO\parallel66.78\kO = 50.06\kO$.

        A gate that moves by a quarter of a percent still cut $M_4$ from $100\kO$ to $66.8\kO$. This is the mirror-loaded differential pair's output in disguise: about $r_{ds}/2$ ([Chapter 5](#/l/bk05-diffpair)).

        ### How to recognize it

        A transistor's drain is on the test node, and its gate connects to something that **also** moves with the test node: a divider, a stack, another branch's diode. Do not split the node naively; find $K$, apply the rule, and put the $K$-setting branch in parallel.

        !!mistake Common mistakes
          - Treating the gate as held because "it is not tied to the drain". If it moves at all, $K\neq0$.
          - Forgetting that the divider or stack that sets $K$ is itself a branch of the node.
          - Computing $K$ with the gate "loading" the divider: it takes no current.
          - Using $K = 1$ for a gate on a divider: that is only for a gate wired directly to the drain.
          - Using the short form $(R_S + 1/g_m)/K$ when $g_mr_{ds}K$ is not large (tiny $K$).
      `, { a: { fig: kMirror, cap: '$M_4$\'s gate senses the current in the left branch' } }),
      Q(md`In the K rule, which situation is $K = 1$?`,
        ['The gate tied directly to the drain (a diode)', 'The gate held at a fixed voltage', 'The gate at the middle of an equal divider', 'The gate tied to the source'], 0,
        [null, 'That is $K = 0$: then the rule gives degeneration.', 'That is $K = 0.5$.', 'Then $v_{gs} = 0$ always: the transistor is just $r_{ds}$ (no rule needed).'],
        md`$K = 1$ means the gate moves exactly with the drain: a diode. The rule then gives $R_S + \tfrac{1}{g_m}\parallel r_{ds}$.`),
      Q(md`A transistor ($g_m = 2\,\text{mS}$, $r_{ds}$ large, $R_S = 0$) has its gate at the middle of an equal divider hung from its own drain. Ignoring the divider branch for a moment, the transistor looks like about`,
        ['$1\\kO$ ($= 2/g_m$)', '$500\\,\\Omega$ ($= 1/g_m$)', '$r_{ds}$', '$250\\,\\Omega$'], 0,
        [null, 'That would be $K = 1$ (a diode). Here $K = 0.5$.', 'The gate moves, so it is far smaller than $r_{ds}$.', 'Dividing by $K$ makes it **bigger** than $1/g_m$, not smaller.'],
        md`$R_S = 0$: $r_{ds}\parallel\dfrac{1}{Kg_m}\approx\dfrac{1}{0.5\times2\,\text{mS}} = 1\kO$.`),
      Q(md`You found the transistor branch with the K rule, $R_{DN} = 3\kO$, for a gate on a divider of total $20\kO$ hung from the node. The node resistance is`,
        ['$20\\kO\\parallel3\\kO = 2.6\\kO$', '$3\\kO$', '$23\\kO$', '$20\\kO$'], 0,
        [null, 'The divider also connects the node to ground: it is a branch.', 'Branches are in parallel, not series.', 'The transistor is a branch too, and the smaller one.'],
        md`Both the divider and the transistor connect the node to ground: $R_{EQ} = 20\parallel3 = 2.61\kO$.`),
      Q(md`A gate moves by only $K = 0.01$ of the drain voltage; $g_mr_{ds} = 200$, $R_S = 0$. Compared with the held gate ($K = 0$), the drain resistance is`,
        ['Three times smaller', 'About the same (1% change)', '100 times smaller', 'Twice as large'], 0,
        [null, 'The bottom is $1 + g_mr_{ds}K = 1 + 2 = 3$: the intrinsic gain amplifies the small $K$.', 'That would need $g_mr_{ds}K\\ll1$.', 'That would need $K = 0.5$.'],
        md`$R = r_{ds}/(1 + 200\times0.01) = r_{ds}/3$. Small $K$, big effect.`),
      P({
        id: 'bk03-k-sym', title: 'The K rule, typed',
        q: md`The gate of a transistor with $R_S$ in its source moves $K$ times the drain voltage. Type the **exact** resistance looking into the drain. Variables: gm, rds, RS, K.`,
        fig: F.k({ look: 'R_{DN}' }),
        parts: [BK.ex('(rds + RS + gm*rds*RS)/(1 + gm*rds*K)', ['gm', 'rds', 'RS', 'K'], 'R_{DN}', { exact: true, ranges: { gm: [1e-3, 4e-3], rds: [5e4, 2e5], RS: [200, 2000], K: [0.02, 0.9] } })],
        hints: [md`$v_s = i_tR_S$ and $v_g = Kv_t$, so $v_{gs} = Kv_t - i_tR_S$.`],
        sol: md`$i_t = g_m(Kv_t - i_tR_S) + \dfrac{v_t - i_tR_S}{r_{ds}}$. Times $r_{ds}$: $i_t(r_{ds} + R_S + g_mr_{ds}R_S) = v_t(1 + g_mr_{ds}K)$, so
$$R_{DN} = \frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$$`,
      }),
      P({
        id: 'bk03-k-div', title: 'A gate on a divider',
        q: md`$g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$, $R_S = 0.5\kO$. The divider $R_a = 60\kO$ (top), $R_b = 20\kO$ hangs from the drain node, with the gate at its middle. Find $K$, the transistor branch $R_{DN}$, and $R_{EQ}$.`,
        fig: F.kdiv({ rs: 1, look: 'R_{EQ}' }),
        parts: [{ lbl: 'K', unit: '', ans: 0.25 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 3.86538, traps: [{ v: 100.5, msg: 'That treats the gate as held ($K = 0$).' }] }, { lbl: 'R_{EQ}', unit: 'kΩ', ans: 3.68723, traps: [{ v: 3.86538, msg: 'Add the divider branch $R_a + R_b$ in parallel.' }] }],
        hints: [md`$K = R_b/(R_a + R_b)$; $g_mr_{ds} = 100$.`, md`$R_{EQ} = R_{DN}\parallel(R_a + R_b)$.`],
        sol: md`
1. $K = \dfrac{20}{80} = 0.25$.
2. Top: $r_{ds} + R_S + g_mr_{ds}R_S = 50 + 0.5 + 100\times0.5 = 100.5\kO$. Bottom: $1 + 100\times0.25 = 26$. $R_{DN} = 100.5/26 = 3.865\kO$ (short form $(0.5 + 0.5)/0.25 = 4\kO$).
3. $R_{EQ} = 80\parallel3.865 = \dfrac{80\times3.865}{83.865}\kO = 3.687\kO$.`,
      }),
      P({
        id: 'bk03-k-stack', title: 'A diode stack sets $K$',
        q: md`Diodes $M_a$ ($g_{ma} = 2\,\text{mS}$) over $M_b$ ($g_{mb} = 1\,\text{mS}$) hang from the test node (ignore their $r_{ds}$). $M_c$ ($g_{mc} = 4\,\text{mS}$, $r_{dsc} = 50\kO$) has its drain on the node, its source grounded, its gate on the middle node $X$. Find $K$, $R_{Mc}$, and $R_{EQ}$.`,
        fig: F.kstack({ look: 'R_{EQ}' }),
        parts: [{ lbl: 'K', unit: '', ans: 0.666667 }, { lbl: 'R_{Mc}', unit: 'Ω', ans: 372.208 }, { lbl: 'R_{EQ}', unit: 'Ω', ans: 298.211, traps: [{ v: 372.208, msg: 'The stack is a branch of the node too: put $1/g_{ma} + 1/g_{mb}$ in parallel.' }] }],
        hints: [md`$K$ = (resistance below $X$)/(total stack) = $\dfrac{1/g_{mb}}{1/g_{ma} + 1/g_{mb}}$.`, md`$M_c$: $R_S = 0$, so $r_{dsc}/(1 + g_{mc}r_{dsc}K)$.`],
        sol: md`
1. Stack: $500 + 1000 = 1500\,\Omega$; $K = 1000/1500 = 0.667$.
2. $g_{mc}r_{dsc} = 200$: $R_{Mc} = \dfrac{50\kO}{1 + 200\times0.667} = \dfrac{50\kO}{134.3} = 372.2\,\Omega$ (short form $1/(Kg_{mc}) = 375\,\Omega$).
3. $R_{EQ} = 1500\parallel372.2 = 298.2\,\Omega$.`,
      }),
      P({
        id: 'bk03-k-rs0', title: 'A small $K$: when the short form fails',
        q: md`$g_m = 4\,\text{mS}$, $r_{ds} = 25\kO$, $R_S = 0$. The gate sits on a divider $R_a = 90\kO$, $R_b = 10\kO$ from the drain node. Find the transistor branch exactly, the short form $1/(Kg_m)$, and $R_{EQ}$.`,
        fig: F.kdiv({ look: 'R_{EQ}' }),
        parts: [{ lbl: 'R_{DN}', unit: 'kΩ', ans: 2.27273 }, { lbl: '1/(Kg_m)', unit: 'kΩ', ans: 2.5 }, { lbl: 'R_{EQ}', unit: 'kΩ', ans: 2.22222 }],
        hints: [md`$K = 0.1$ and $g_mr_{ds} = 100$, so $g_mr_{ds}K = 10$: not $\gg1$.`],
        sol: md`
1. $K = 10/100 = 0.1$; $R_{DN} = \dfrac{25\kO}{1 + 100\times0.1} = \dfrac{25}{11}\kO = 2.273\kO$.
2. Short form $1/(0.1\times4\,\text{mS}) = 2.5\kO$: 10% high, because $g_mr_{ds}K = 10$ is not large.
3. $R_{EQ} = 100\kO\parallel2.273\kO = 2.222\kO$.`,
      }),
      P({
        id: 'bk03-k-mirror', title: 'Feedback through a diode (Problem Set 5 (f) style)',
        q: md`The circuit of the worked example, with all transistors $g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$ this time. Find the left branch $R_{b1}$, $K$ for $M_4$, $R_{M4}$, and $R_{EQ}$.`,
        fig: kMirror,
        parts: [{ lbl: 'R_{b1}', unit: 'kΩ', ans: 100 }, { lbl: 'K', unit: '', ans: 0.0049505 }, { lbl: 'R_{M4}', unit: 'kΩ', ans: 33.4437, traps: [{ v: 50, msg: 'That treats $M_4$\'s gate as held. It moves by $K v_t$, which the intrinsic gain amplifies.' }] },
          { lbl: 'R_{EQ}', unit: 'kΩ', ans: 25.062, traps: [{ v: 33.4437, msg: 'Add the left branch $R_{b1}$ in parallel.' }, { v: 33.3333, msg: 'That is $100\\kO\\parallel50\\kO$: $M_4$ treated as plain $r_{ds}$.' }] }],
        hints: [md`$R_X = 1/(2\,\text{mS} + 0.02\,\text{mS})$; $R_{b1} = r_{ds} + R_X(1 + g_mr_{ds})$ with $g_mr_{ds} = 100$.`, md`$K = R_X/R_{b1}$, then $R_{M4} = r_{ds}/(1 + g_mr_{ds}K)$.`],
        sol: md`
1. $R_X = \dfrac{1}{2\,\text{mS} + 0.02\,\text{mS}} = 495.0\,\Omega$, and $1 + g_mr_{ds} = 101$: $R_{b1} = 50\kO + 0.4950\kO\times101 = 100\kO$ (matched devices: exactly $2r_{ds}$).
2. $K = \dfrac{R_X}{R_{b1}} = \dfrac{495.0}{100{,}000} = 0.004950$.
3. $R_{M4} = \dfrac{50\kO}{1 + 100\times0.004950} = \dfrac{50\kO}{1.4950} = 33.44\kO$.
4. $R_{EQ} = 100\kO\parallel33.44\kO = \dfrac{100\times33.44}{133.44}\kO = 25.06\kO$, again about $r_{ds}/2$.`,
      }),
      G('bk_mi_k', { need: 3 }),
    ],
  });

  // ================================================================== 8. cascodes and gain boosting
  const cascModel = [...S.mos(2, 0, 2, { g: 'g_{m2}v_{gs2}', r: 'r_{ds2}' }), ...S.mos(2, 2, 4, { g: 'g_{m1}v_{gs1}', r: 'r_{ds1}' }), ['gnd', [2.65, 4]],
    ['node', [2, 2], { n: 'X', side: 'l' }], ['txt', [-0.2, 1], '$M_2$: $v_{gs2} = 0 - v_x$', { a: 'r' }], ['txt', [-0.2, 3], '$M_1$: $v_{gs1} = 0 - 0$', { a: 'r' }],
    ['txt', [2.15, -0.3], '$D_2$', { a: 'l' }], ...S.test(3.3, 0)];
  const regModel = [...S.mos(4.2, 0, 2, { g: 'g_{m1}v_{gs1}', r: 'r_{ds1}' }), ['R', [4.85, 2], [4.85, 3.4], { n: 'R_Y', side: 'l' }], ['gnd', [4.85, 3.4]],
    ['node', [4.85, 2], { n: 'Y', side: 'br' }], ['txt', [4.85, -0.35], '$M_1$'],
    ...S.mos(0.6, 0, 2, { g: 'g_{m3}v_{gs3}', r: 'r_{ds3}' }), ['gnd', [1.25, 2]], ['node', [1.25, 0], { n: 'N', side: 'a' }],
    ['txt', [1.25, 2.75], '$M_3$ ($I_B$ open)'], ['txt', [1.25, 3.35], '$v_{gs3} = v_Y$'], ['txt', [4.85, 4.15], '$v_{gs1} = v_N - v_Y$'], ...S.test(5.5, 0)];
  const midX = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_L' }], ['nmos', [1, 1], { n: 'M_2' }], ['acg', [0, 1]], ['nmos', [1, 3], { n: 'M_1' }], ['acg', [0, 3]], ['gnd', [1, 4]],
    ['node', [1, 2], { n: 'X', side: 'l' }], ['w', [1, 2], [2, 2]], F.lookR([2, 2], 'R_X')];

  L({
    id: 'bk03-cascode', title: 'Cascodes and gain boosting', ref: 'Lectures 16–17, Practice 2 #2',
    steps: [
      RF(md`
        ### The question

        Stack one held-gate transistor on top of another: $M_2$'s source sits on $M_1$'s drain, and both gates are held. What do you see looking into the top drain? This **cascode** is the largest resistance two transistors can make, and since gain is $g_mR_{out}$ ([Chapter 4](#/l/bk04-cascode)), it is how amplifiers get large gains. Exam 2 asks for it directly, for stacks of three, and for the "gain-boosted" (regulated) cascode.

        ### The physical picture: a shield

        $M_1$ alone is a current source of resistance $r_{ds1}$: its current changes a little when its drain voltage moves. The cascode transistor $M_2$ stands between $M_1$'s drain and the output and **holds that drain still**: node $X$ is a source of $M_2$, a low-resistance point (about $1/g_{m2}$ looking up). When the output swings, almost all of the swing lands across $M_2$; node $X$ barely moves, so $M_1$'s current barely changes.

        The other way to see it: $M_2$ is a [degenerated](#/l/bk03-degen) transistor whose "$R_S$" is $r_{ds1}$, and degeneration multiplies what is under the source by about $g_{m2}r_{ds2}$.
        [[fig:a]]
        ### The derivation, with both models drawn

        **Step 1: $v_{gs}$ of each transistor.** Name the middle node $X$.
        - $M_1$: gate held, source grounded: $v_{gs1} = 0 - 0 = 0$. Its dependent source is open; only $r_{ds1}$ remains, from $X$ to ground.
        - $M_2$: gate held, source at $X$: $v_{gs2} = 0 - v_x$. Alive.
        [[fig:b]]
        **Step 2: KCL at $X$.** Everything that comes down through $M_2$ (that is $i_t$) leaves through $r_{ds1}$:
        $$v_x = i_tr_{ds1}$$
        **Step 3: the current down through $M_2$.**
        $$i_t = g_{m2}v_{gs2} + \frac{v_t - v_x}{r_{ds2}} = -g_{m2}v_x + \frac{v_t - v_x}{r_{ds2}}$$
        **Step 4: substitute $v_x = i_tr_{ds1}$.**
        $$i_t = -g_{m2}r_{ds1}\,i_t + \frac{v_t - i_tr_{ds1}}{r_{ds2}}$$
        **Step 5: multiply by $r_{ds2}$.**
        $$i_tr_{ds2} = -g_{m2}r_{ds2}r_{ds1}\,i_t + v_t - i_tr_{ds1}$$
        **Step 6: collect $i_t$.**
        $$i_t\,(r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}) = v_t$$
        $$R_{out} = r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}\approx g_{m2}r_{ds2}\,r_{ds1}$$
        It is exactly the degeneration formula $r_{ds} + R_S + g_mr_{ds}R_S$ with $R_S = r_{ds1}$.
      `, { a: { fig: F.casc({ look: 'R_{out}' }), cap: 'the cascode: both gates held' }, b: { fig: cascModel, cap: 'both models; $M_1$ is just $r_{ds1}$' } }),
      R(md`
        !!key The cascode
          $$R_{out} = r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}\approx(g_{m2}r_{ds2})\,r_{ds1}$$
          The intrinsic gain of the **top** transistor times the $r_{ds}$ of the bottom one.

        ### Check it

        - **$g_{m2}\to0$:** $r_{ds1} + r_{ds2}$, two resistors in series. ✓
        - **Numbers.** Both transistors $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$: $R_{out} = 100 + 100 + 200\times100 = 20{,}200\kO = 20.2\,\text{M}\Omega$, two hundred times one transistor.
        - **The shield, quantified.** $v_x/v_t = r_{ds1}/R_{out} = 100\kO/20.2\,\text{M}\Omega = 0.5\%$: when the output moves by a volt, $X$ moves by 5 mV.

        ### Any stack: work from the bottom up

        The derivation used only the resistance under $M_2$'s source. So for any stack of held-gate transistors:

        !!method The bottom-up rule
          Reduce everything below a transistor's source to one resistance $R_x$. Looking into that transistor's drain:
          $$R_{next} = r_{ds} + R_x\,(1 + g_mr_{ds})$$
          Repeat, one transistor at a time, going up.

        **A triple cascode** ($M_3$ on $M_2$ on $M_1$, all $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$): $R_2 = 20.2\,\text{M}\Omega$ from above, then
        $$R_3 = 100\kO + 20.2\,\text{M}\Omega\times201 = 4.06\,\text{G}\Omega$$
        Why not stack ten? **Headroom.** Each transistor needs $V_{DS}\ge V_{ov}$ to stay saturated, so every added device eats a few hundred millivolts of the output swing; with a $1.8\,\text{V}$ supply two or three is the practical limit.

        **A resistor at the bottom** (Practice 2 #2(a)): $M_2$ on $M_1$ on $R_S$. Bottom-up: $R_1 = r_{ds1} + R_S(1 + g_{m1}r_{ds1})$, then $R_{out} = r_{ds2} + R_1(1 + g_{m2}r_{ds2})$.
      `),
      RF(md`
        ### The PMOS cascode

        The load of a high-gain stage is often a PMOS cascode: $M_4$ on $V_{DD}$, $M_3$ below it, both gates held, output at $M_3$'s drain. Same model upside down (both arrows point up), same algebra:
        [[fig:a]]
        $$R_{UP} = r_{ds4} + r_{ds3} + g_{m3}r_{ds3}r_{ds4}$$
        The magnifying transistor is the one next to the output ($M_3$); the one on the rail ($M_4$) supplies the $r_{ds}$ being magnified. A large-signal square-law solve of this PMOS stack agrees to better than 0.001%.

        **Worked example: a cascode amplifier with a cascode load.** Input off. Down: $M_2$ on $M_1$; up: $M_3$ under $M_4$. All $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$. Each stack is $20.2\,\text{M}\Omega$, so
        $$R_{out} = 20.2\,\text{M}\Omega\parallel20.2\,\text{M}\Omega = 10.1\,\text{M}\Omega$$
        and, as a preview of Chapter 4, $A_v = -g_{m1}R_{out} = -(2\,\text{mS})(10.1\,\text{M}\Omega)\approx-20{,}000$.

        **But with a resistor load** $R_L = 10\kO$ instead of the PMOS cascode: $R_{out} = 10\kO\parallel20.2\,\text{M}\Omega = 9.995\kO$. The cascode is wasted on a resistor: **a big resistance only helps if everything else on the node is big too.**
      `, { a: { svg: rowSvg([{ fig: F.pcasc({ look: 'R_{UP}' }), cap: 'PMOS cascode load' }, { fig: F.node(['casc', {}], ['casc', {}], { look: 'R_{out}' }), cap: 'cascode amplifier with a cascode load (input off)' }]) } }),
      RF(md`
        ### The middle node, and what the load does to it

        Looking into $X$ (Lecture 29 needs this for $C_{gs2}$): down is $r_{ds1}$; up is $M_2$'s source with the load $R_L$ on its drain, $(r_{ds2} + R_L)/(1 + g_{m2}r_{ds2})$ from [the source](#/l/bk03-source):
        $$R_X = r_{ds1}\parallel\frac{r_{ds2} + R_L}{1 + g_{m2}r_{ds2}}$$
        With $R_L = 10\kO$ (all $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$): $R_X = 100\kO\parallel547\,\Omega = 544\,\Omega$, about $1/g_m$: a quiet node. With the $20.2\,\text{M}\Omega$ cascode load: $R_X = 100\kO\parallel(20.3\,\text{M}\Omega/201) = 100\kO\parallel101\kO = 50.2\kO$. A high-impedance load makes the "low" node high.
        [[fig:a]]
      `, { a: { fig: midX, cap: 'the middle node: $r_{ds1}$ down, $M_2$\'s source up' } }),
      RF(md`
        ### Gain boosting: the regulated cascode

        Practice 2 #2(b) replaces the fixed bias on the cascode's gate with a small amplifier. $M_3$ has its gate on $Y$ (the cascode's source node), its source grounded, and its drain on $M_1$'s gate (node $N$), loaded by an ideal current source $I_B$. Everything below $Y$ is lumped into one resistance $R_Y$.
        [[fig:a]]
        **Step 1: $I_B$ is open** (an ideal current source never changes its current). So node $N$ touches only $M_3$'s drain and $M_1$'s gate.

        **Step 2: $v_{gs}$ of each transistor.** $M_3$: $v_{gs3} = v_Y - 0 = v_Y$. $M_1$: $v_{gs1} = v_N - v_Y$. The cascode's gate is no longer still.
        [[fig:b]]
        **Step 3: KCL at $N$.** Only $M_3$ touches $N$, so $M_3$'s current must be zero:
        $$0 = g_{m3}v_Y + \frac{v_N}{r_{ds3}}\quad\Rightarrow\quad v_N = -g_{m3}r_{ds3}\,v_Y = -A\,v_Y,\qquad A = g_{m3}r_{ds3}$$
        $M_3$ is a common-source amplifier from $Y$ to $N$ whose only load is its own $r_{ds3}$.

        **Step 4: $v_{gs1}$.** $v_{gs1} = -Av_Y - v_Y = -(1 + A)v_Y$: $(1 + A)$ times what a plain cascode has.

        **Step 5: KCL at $Y$.** $M_3$'s gate takes nothing, so all of $i_t$ goes into $R_Y$: $v_Y = i_tR_Y$.

        **Step 6: the current down through $M_1$.**
        $$i_t = g_{m1}v_{gs1} + \frac{v_t - v_Y}{r_{ds1}} = -g_{m1}(1 + A)R_Y\,i_t + \frac{v_t - i_tR_Y}{r_{ds1}}$$
        **Step 7: multiply by $r_{ds1}$ and collect $i_t$.**
        $$i_t\,\big[r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + A)R_Y\big] = v_t$$
        $$R_{out} = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y\approx(g_{m1}r_{ds1})(g_{m3}r_{ds3})\,R_Y$$
        **Numbers** (all $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, so $A = 200$; $R_Y = 1\kO$): plain, $100 + 1 + 200\times1 = 301\kO$; regulated, $100 + 1 + 200\times201\times1 = 40{,}301\kO = 40.3\,\text{M}\Omega$, another factor of $1 + A = 201$.

        !!intuition A watchdog on node $Y$
          In a plain cascode, when $Y$ rises by $v_Y$, $v_{gs1}$ falls by $v_Y$ and $M_1$ fights back. In the regulated cascode, $M_3$ sees $Y$ rise and pulls $M_1$'s gate **down** by $Av_Y$, so $v_{gs1}$ falls by $(1 + A)v_Y$ and $M_1$ fights $(1 + A)$ times harder. $Y$ hardly moves at all, so the current hardly changes.
      `, { a: { fig: F.reg({}), cap: 'the regulated cascode: $M_3$ drives $M_1$\'s gate' }, b: { fig: regModel, cap: 'both models; the gates are tied through the labels' } }),
      R(md`
        ### How to recognize it

        A transistor whose source sits on another transistor's drain, both gates held: write $g_{m,top}r_{ds,top}\times$(what is below). A stack: bottom-up. A small amplifier driving the cascode's gate from its own source node: multiply by another $1 + A$.

        !!mistake Common mistakes
          - $r_{ds1} + r_{ds2}$: series without the feedback.
          - Using the bottom transistor's $g_m$. The magnifier is the top one (the one you look into).
          - Forgetting what else is on the node: a $10\kO$ resistor in parallel throws the cascode's megohms away.
          - In the regulated cascode, using $A = g_{m3}r_{ds3}$ when $M_3$'s load is not an ideal current source: with a resistor $R_B$ there, $A = g_{m3}(r_{ds3}\parallel R_B)$.
          - Stacking more transistors without checking that each still has $V_{DS}\ge V_{ov}$.
      `),
      Q(md`A cascode of two identical transistors versus one of them alone: the output resistance grows by about`,
        ['$g_mr_{ds}$ (the intrinsic gain)', '2', '$g_m$', '$r_{ds}$'], 0,
        [null, 'Doubling is $r_{ds1} + r_{ds2}$: series without feedback.', 'That is not a dimensionless factor.', 'That is not dimensionless either.'],
        md`$R_{out}\approx g_{m2}r_{ds2}\cdot r_{ds1}$ versus $r_{ds1}$: a factor of $g_mr_{ds}$, typically 50 to 200.`),
      Q(md`In the cascode formula $r_{ds1} + r_{ds2} + g_{m}r_{ds2}r_{ds1}$, whose $g_m$ is it?`,
        ['The top transistor\'s ($M_2$, the one you look into)', 'The bottom transistor\'s ($M_1$)', 'The average of the two', 'Either: they carry the same current'], 0,
        [null, '$M_1$ has $v_{gs1} = 0$: its dependent source is dead and it acts only as $r_{ds1}$.', 'Only the top device\'s $v_{gs}$ responds to the test.', 'Same current, but they can have different sizes and so different $g_m$; only $M_2$\'s matters.'],
        md`$M_2$ is the degenerated transistor; $M_1$ is just its $R_S = r_{ds1}$.`, { fig: F.casc({}) }),
      Q(md`A $20\,\text{M}\Omega$ cascode drives a node that also has a $10\kO$ resistor to $V_{DD}$. The node resistance is about`,
        ['$10\\kO$', '$20\\,\\text{M}\\Omega$', '$10\\,\\text{M}\\Omega$', '$20.01\\,\\text{M}\\Omega$'], 0,
        [null, 'Parallel: the small branch wins.', 'That would need both branches to be $20\\,\\text{M}\\Omega$.', 'Branches to (incremental) ground are in parallel, not series.'],
        md`$10\kO\parallel20\,\text{M}\Omega = 9.995\kO$. The cascode only pays off with a high-impedance load.`),
      Q(md`In a regulated cascode the booster has $A = g_{m3}r_{ds3} = 50$. Compared with the plain cascode on the same $R_Y$, the output resistance is about`,
        ['51 times larger', '50 times smaller', 'unchanged', '2 times larger'], 0,
        [null, 'The booster makes $M_1$ fight harder, so the resistance goes **up**.', 'The magnification $g_{m1}r_{ds1}$ becomes $g_{m1}r_{ds1}(1 + A)$.', '$1 + A = 51$, not 2.'],
        md`$R_{out}\approx g_{m1}r_{ds1}(1 + A)R_Y$: another factor $1 + A = 51$.`),
      P({
        id: 'bk03-casc-num', title: 'An unequal cascode',
        q: md`$M_1$ (bottom) has $r_{ds1} = 50\kO$; $M_2$ (top) has $g_{m2} = 4\,\text{mS}$, $r_{ds2} = 80\kO$. Both gates held. Find $R_{out}$.`,
        fig: F.casc({ look: 'R_{out}' }),
        parts: [{ lbl: 'R_{out}', unit: 'MΩ', ans: 16.13, traps: [{ v: 0.13, msg: 'That is $r_{ds1} + r_{ds2}$: the feedback term is missing.' }] }],
        hints: [md`$g_{m2}r_{ds2} = 320$.`],
        sol: md`$R_{out} = 50\kO + 80\kO + (4\,\text{mS})(80\kO)(50\kO) = 130\kO + 16{,}000\kO = 16.13\,\text{M}\Omega$.`,
      }),
      P({
        id: 'bk03-casc-sym', title: 'The cascode, typed',
        q: md`Both gates held; $M_1$ at the bottom, $M_2$ on top. Type $R_{out}$ looking into $M_2$'s drain (exact, or the $g_mr_{ds}\gg1$ form). Variables: gm1, gm2, rds1, rds2.`,
        fig: F.casc({ look: 'R_{out}' }),
        parts: [BK.ex('rds1 + rds2 + gm2*rds2*rds1', ['gm1', 'gm2', 'rds1', 'rds2'], 'R_{out}')],
        hints: [md`$M_1$ is just $r_{ds1}$. $M_2$ is degenerated by it.`],
        sol: md`$R_{out} = r_{ds2} + r_{ds1}(1 + g_{m2}r_{ds2}) = r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}\approx g_{m2}r_{ds2}r_{ds1}$. ($g_{m1}$ does not appear.)`,
      }),
      P({
        id: 'bk03-casc-triple', title: 'A triple cascode, bottom-up',
        q: md`Three identical transistors, $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$, stacked with all gates held. Find the resistance looking into the drain of the middle one ($R_2$) and of the top one ($R_3$).`,
        fig: F.casc({ triple: 1, look: 'R_3' }),
        parts: [{ lbl: 'R_2', unit: 'MΩ', ans: 2.6 }, { lbl: 'R_3', unit: 'MΩ', ans: 132.65 }],
        hints: [md`$1 + g_mr_{ds} = 51$. $R_{next} = r_{ds} + R_{below}\times51$.`],
        sol: md`
1. $R_2 = 50\kO + 50\kO\times51 = 2600\kO = 2.6\,\text{M}\Omega$.
2. $R_3 = 50\kO + 2600\kO\times51 = 132{,}650\kO = 132.65\,\text{M}\Omega$, about $(g_mr_{ds})^2r_{ds}$.`,
      }),
      P({
        id: 'bk03-casc-pmos', title: 'A PMOS cascode load',
        q: md`$M_4$ (on $V_{DD}$) and $M_3$ (below it, output at its drain) both have $r_{ds} = 100\kO$; $g_{m3} = 1\,\text{mS}$. Gates held. Find the resistance looking up into $M_3$'s drain.`,
        fig: F.pcasc({ look: 'R_{UP}' }),
        parts: [{ lbl: 'R_{UP}', unit: 'MΩ', ans: 10.2 }],
        hints: [md`Same formula as the NMOS cascode; the magnifier is $M_3$.`],
        sol: md`$R_{UP} = r_{ds4} + r_{ds3} + g_{m3}r_{ds3}r_{ds4} = 100 + 100 + 100\times100\ (\text{k}\Omega) = 10{,}200\kO = 10.2\,\text{M}\Omega$.`,
      }),
      P({
        id: 'bk03-casc-reg', title: 'The regulated cascode with numbers',
        q: md`$M_1$: $g_{m1} = 2\,\text{mS}$, $r_{ds1} = 50\kO$, on $R_Y = 50\kO$ (another transistor's $r_{ds}$). The booster $M_3$ has $g_{m3} = 2\,\text{mS}$, $r_{ds3} = 50\kO$ and an ideal current-source load. Find $A$ and $R_{out}$, and compare with the plain cascode.`,
        fig: F.reg({ look: 'R_{out}' }),
        parts: [{ lbl: 'A', unit: '', ans: 100 }, { lbl: 'R_{out}', unit: 'MΩ', ans: 505.1, traps: [{ v: 5.1, msg: 'That is the plain cascode ($A = 0$). The booster multiplies the big term by $1 + A$.' }] }],
        hints: [md`$A = g_{m3}r_{ds3}$. $R_{out} = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + A)R_Y$.`],
        sol: md`
1. $A = (2\,\text{mS})(50\kO) = 100$.
2. $R_{out} = 50\kO + 50\kO + (100)(101)(50\kO) = 100\kO + 505{,}000\kO = 505.1\,\text{M}\Omega$.
3. Plain: $50 + 50 + 100\times50 = 5100\kO = 5.1\,\text{M}\Omega$. The booster gave a factor of about 100.`,
      }),
      P({
        id: 'bk03-casc-amp', title: 'A cascode stage with a cascode load (exam style)',
        q: md`Input off. Down: $M_2$ on $M_1$; up: $M_3$ under $M_4$; all gates held. Every transistor has $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$. Find (a) the down stack $R_n$, (b) $R_{out}$, (c) how much the middle node $X$ moves per volt at the output ($v_x/v_{out}$), (d) the resistance at $X$.`,
        fig: F.node(['casc', {}], ['casc', {}], { look: 'R_{out}' }),
        parts: [{ lbl: 'R_n', unit: 'MΩ', ans: 2.6 }, { lbl: 'R_{out}', unit: 'MΩ', ans: 1.3 }, { lbl: 'v_x/v_{out}', unit: '', ans: 0.0192308 },
          { lbl: 'R_X', unit: 'kΩ', ans: 25.4808, traps: [{ v: 0.98, msg: 'That is about $1/g_{m2}$: true only with a small load. Here the load is $2.6\\,\\text{M}\\Omega$, so $(r_{ds2} + R_{up})/(1 + g_{m2}r_{ds2})$ is large.' }] }],
        hints: [md`(a) $r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}$; the up stack is the same. (c) $X$ is a divider: $v_x = i\,r_{ds1}$ with $i = v_{out}/R_n$.`, md`(d) At $X$: down $r_{ds1}$; up $M_2$'s source with $R_{up} = 2.6\,\text{M}\Omega$ on its drain.`],
        sol: md`
**(a)** $R_n = 50 + 50 + 50\times50 = 2600\kO = 2.6\,\text{M}\Omega$.

**(b)** The up stack is identical: $R_{out} = 2.6\parallel2.6 = 1.3\,\text{M}\Omega$.

**(c)** The down stack carries $v_{out}/R_n$, which flows through $r_{ds1}$: $v_x/v_{out} = r_{ds1}/R_n = 50/2600 = 0.0192$.

**(d)** Up from $X$: $\dfrac{r_{ds2} + R_{up}}{1 + g_{m2}r_{ds2}} = \dfrac{50 + 2600}{51}\kO = 51.96\kO$; down: $50\kO$. $R_X = 50\parallel51.96 = 25.48\kO$, not $1/g_m$: with a cascode load the middle node is a high-impedance node too.`,
      }),
      P({
        id: 'bk03-casc-rs', title: 'A cascode with a resistor at the bottom',
        q: md`$M_2$ on $M_1$ on $R_S = 2\kO$, gates held; both transistors $g_m = 1\,\text{mS}$, $r_{ds} = 100\kO$. Find $R_1$ (looking into $M_1$'s drain) and $R_{out}$.`,
        fig: F.casc({ rs: 1, look: 'R_{out}' }),
        parts: [{ lbl: 'R_1', unit: 'kΩ', ans: 302 }, { lbl: 'R_{out}', unit: 'MΩ', ans: 30.602 }],
        hints: [md`Bottom-up: $R_1 = r_{ds} + R_S(1 + g_mr_{ds})$, then $R_{out} = r_{ds} + R_1(1 + g_mr_{ds})$, with $1 + g_mr_{ds} = 101$.`],
        sol: md`
1. $R_1 = 100 + 2\times101 = 302\kO$.
2. $R_{out} = 100 + 302\times101 = 100 + 30{,}502 = 30{,}602\kO = 30.6\,\text{M}\Omega$.`,
      }),
      G('bk_mi_casc', { need: 3 }),
    ],
  });

  // ================================================================== 9. a node: R_UP || R_DN
  const nodeBox = [['box', [0.4, -2], [1.6, -0.8], { n: 'up branch' }], ['w', [1, -0.8], [1, 0]], ['w', [1, -2], [1, -2.3]], ['gndu', [1, -2.3]],
    ['box', [0.4, 0.8], [1.6, 2], { n: 'down branch' }], ['w', [1, 0], [1, 0.8]], ['w', [1, 2], [1, 2.3]], ['gnd', [1, 2.3]],
    ['w', [1, 0], [2.6, 0]], ['nmos', [3.6, 0], { n: 'M_g' }], ['rail', [3.6, -1]], ['R', [3.6, 1], [3.6, 2.2], { n: 'R_L' }], ['gnd', [3.6, 2.2]],
    ['txt', [2.2, -0.4], '$\\text{a gate: }\\infty$'], ['node', [1, 0], { n: 'X', side: 'al', dot: true }],
    ['w', [1, 0], [-0.6, 0]], ['V', [-0.6, 0], [-0.6, 1.2], { n: 'v_t', side: 'l' }], ['gnd', [-0.6, 1.2]], ['iarr', [0.2, 0], 'r', { n: 'i_t' }]];
  const LT = 'style="fill:var(--fg);font:13px var(--sans)"', LD = 'style="fill:var(--dim);font:12px var(--sans)"';
  const lad = [[497.5, 326, 'source, or a diode: 1/gm ≈ 500 Ω'], [995, 298, 'source with another rds on its drain: ≈ 2/gm'], [1e4, 268, 'a typical resistor'],
    [1e5, 236, 'drain, gate held: rds = 100 kΩ'], [3.01e5, 206, 'drain with RS = 1 kΩ: rds(1 + gm RS)'], [2.02e7, 144, 'cascode: (gm rds) rds ≈ 20 MΩ'], [4.06e9, 58, 'triple cascode ≈ 4 GΩ']];
  const yOf = (R) => 340 - (Math.log10(R) - 2) * 37.5;
  const ladder = `<svg class="schem" viewBox="0 0 600 360" width="600" role="img" aria-label="the size ladder of resistances">
    <path d="M120,345V30"/>${[2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => `<path class="dim" d="M114,${yOf(10 ** d)}H120"/><text x="108" y="${yOf(10 ** d) + 4}" text-anchor="end" ${LD}>${['100 Ω', '1 kΩ', '10 kΩ', '100 kΩ', '1 MΩ', '10 MΩ', '100 MΩ', '1 GΩ', '10 GΩ'][d - 2]}</text>`).join('')}
    ${lad.map(([R, y, t]) => `<circle class="fill" cx="120" cy="${yOf(R).toFixed(1)}" r="3.6"/><path class="dim thin" d="M124,${yOf(R).toFixed(1)}L150,${y}"/><text x="156" y="${y + 4}" ${LT}>${t.replace(/\b(r|g|R)(ds|m|S)\b/g, '$1<tspan baseline-shift="sub" font-size="9">$2</tspan>')}</text>`).join('')}
    <path class="dim" d="M120,30L114,40M120,30L126,40"/><text x="156" y="26" ${LT}>gate: ∞</text><path class="dim thin" d="M124,24L150,22"/>
  </svg>`;
  const p1Node = F.node(['diodeR', { n: 'M_2', rn: 'R_1' }], ['degen', { n: 'M_1' }], { look: 'R_{eq1}', name: 'N' });
  const sfNode = F.node(['src', { n: 'M_1' }], ['drain', { n: 'M_2' }], { look: 'R_{out}' });
  const p6Node = [...F.UPB.diodeR(1, { n: 'M_3', rn: 'R_1' }), ...F.DNB.casc(1, { n: 'M_2', n2: 'M_1' }), ['node', [1, 0], { n: 'X', side: 'l' }],
    ['w', [1, 0], [2.4, 0], [2.4, 0.6], [2.6, 0.6]], ['rail', [3.6, -0.4]], ['nmos', [3.6, 0.6], { n: 'M_4' }], ['I', [3.6, 1.6], [3.6, 2.8], { n: 'I_B' }], ['gnd', [3.6, 2.8]],
    ['w', [1, 0], [1.6, 0], [1.6, -0.7], [2.2, -0.7]], F.lookR([2.2, -0.7], 'R_X')];

  L({
    id: 'bk03-node', title: 'A node: $R_{UP}\\parallel R_{DN}$', ref: 'Lecture 15, Problem Set 5',
    steps: [
      RF(md`
        ### The question

        Real circuits put several things on one node: a load above, a transistor below, maybe a gate or a bias resistor on the side. What is the resistance of the **node**? This is $R_{out}$ in every gain $A_v = -G_MR_{out}$, the $R_{EQ}$ of Exam 2's Problem 2, and the $R$ in every $1/RC$ of Chapters 12 and 13.

        ### The physical picture: currents add

        Wiggle the node by $v_t$. Every branch from the node to (incremental) ground takes its own share of current, $v_t/R_{branch}$, and the test source has to supply all of them. Currents add, so **conductances add**: the branches are in parallel. Water poured into a junction of several pipes leaves through all of them; the widest pipe takes most of it.
        [[fig:a]]
        ### Why splitting works, in three lines

        If the branches share nothing but the node and ground, each branch's current depends only on $v_t$ and its own parts: $i_{UP} = v_t/R_{UP}$, $i_{DN} = v_t/R_{DN}$. KCL at the node:
        $$i_t = \frac{v_t}{R_{UP}} + \frac{v_t}{R_{DN}}\quad\Rightarrow\quad R = \frac{v_t}{i_t} = R_{UP}\parallel R_{DN}$$
        A gate on the node adds a branch of $\infty$, which changes nothing.

        !!method The node procedure
          1. Turn off the input and the DC sources: $V_{DD}$ is ground, so "up" branches end at ground too.
          2. List every branch from the node: up, down, sideways. Cross off gates.
          3. Find each branch with this chapter's results: each one is "looking into" a drain, a source, a diode, a stack.
          4. Combine in parallel: $R = R_{UP}\parallel R_{DN}\ (\parallel\text{any other branch})$.
          5. **Check for a hidden $K$:** if some transistor's gate moves with the node (or with a node inside another branch), that branch is not independent: use [the K rule](#/l/bk03-k).
      `, { a: { fig: nodeBox, cap: 'each branch takes $v_t/R_{branch}$; the gate takes nothing' } }),
      RF(md`
        ### The size ladder

        In a parallel combination **the smallest branch wins**: the result is smaller than the smallest branch, and if one branch is a hundred times smaller than the others it **is** the answer to within about 1%. So the first thing to do at any node is to spot the small branches. With the typical transistor of this chapter ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$):
        [[fig:l]]
        Sources and diodes live near $1/g_m$; drains near $r_{ds}$ and above; gates at infinity. A node with a source or a diode on it is a **low-impedance node**, whatever else is there. A node that touches only drains (and gates) is a **high-impedance node**, and that is where voltage gain happens.
      `, { l: { svg: ladder, cap: 'typical resistances, on a log scale (each step up is ten times bigger)' } }),
      RF(md`
        ### Many examples

        All with $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$ for every transistor (input off):

        | Node | Up | Down | $R$ | Number |
        |---|---|---|---|---|
        | CS, resistor load $R_D = 10\kO$ | $R_D$ | $r_{ds1}$ | $R_D\parallel r_{ds}$ | $9.09\kO$ |
        | CS, current-source load | $r_{ds2}$ | $r_{ds1}$ | $r_{ds}/2$ | $50\kO$ |
        | CS, PMOS diode load | $\tfrac{1}{g_{m2}}\parallel r_{ds2}$ | $r_{ds1}$ | $\approx1/g_{m2}$ | $495.0\,\Omega$ |
        | source follower, current-sink bias | $\tfrac{1}{g_{m1}}\parallel r_{ds1}$ | $r_{ds2}$ | $\approx1/g_{m1}$ | $495.0\,\Omega$ |
        | cascode with a cascode load | $20.2\,\text{M}\Omega$ | $20.2\,\text{M}\Omega$ | half of each | $10.1\,\text{M}\Omega$ |
        | Practice 1 #2(a), $R_1 = R_S = 1\kO$ | $R_1 + \tfrac{1}{g_{m2}}\parallel r_{ds2}$ | $r_{ds1} + R_S(1 + g_{m1}r_{ds1})$ | $\approx R_1 + 1/g_{m2}$ | $1.490\kO$ |

        ### Worked example: Practice 1 #2(a)

        **Up:** a diode-connected PMOS $M_2$ (gate tied to its drain, which is the node $N$) with $R_1$ between its source and $V_{DD}$. **Down:** $M_1$ with its gate held and $R_S$ under its source.
        [[fig:a]]
        **Step 1: $v_{gs}$ of each transistor.** $M_2$: gate = drain = $N$, so $v_{gs2} = v_t - v_{S2}$: a diode. $M_1$: gate held, $v_{gs1} = -v_X$: degeneration. The two branches meet only at $N$ and at ground, and neither gate depends on the other branch, so they split.

        **Step 2: up.** [A diode with a resistor in series](#/l/bk03-diode): $R_{UP} = R_1 + \tfrac{1}{g_{m2}}\parallel r_{ds2} = 1\kO + 0.4975\kO = 1.4975\kO$.

        **Step 3: down.** [Degeneration](#/l/bk03-degen): $R_{DN} = r_{ds1} + R_S(1 + g_{m1}r_{ds1}) = 100 + 1\times201 = 301\kO$.

        **Step 4: combine.**
        $$R_{eq1} = 1.4975\kO\parallel301\kO = \frac{1.4975\times301}{302.5}\kO = 1.490\kO$$
        The short answer $R_1 + 1/g_{m2} = 1.5\kO$ is within 1%: the $301\kO$ branch barely matters.

        ### Worked example: the source-follower output

        $M_1$ (gate on the input, drain on $V_{DD}$) drives the output from its source; $M_2$ (gate held) sinks the bias current. Up: a source with its drain on a rail, $\tfrac{1}{g_{m1}}\parallel r_{ds1}$. Down: a drain, $r_{ds2}$.
        [[fig:b]]
        $$R_{out} = \frac{1}{g_{m1} + 1/r_{ds1} + 1/r_{ds2}} = \frac{1}{2\,\text{mS} + 0.01\,\text{mS} + 0.01\,\text{mS}} = 495.0\,\Omega$$
        Add a load $R_L = 1\kO$ and it becomes $1/(2.02\,\text{mS} + 1\,\text{mS}) = 331\,\Omega$: still dominated by $1/g_{m1}$.
      `, { a: { fig: p1Node, cap: 'Practice 1 #2(a): a PMOS diode over a degenerated NMOS' }, b: { fig: sfNode, cap: 'source follower: a source up, a drain down' } }),
      R(md`
        ### How to recognize it

        Every "find $R_{out}$" or "find $R_{EQ}$ at node X" question is this lesson. Label each branch with what you are looking into (drain, source, diode, stack), write each branch from memory, and combine. Then sanity-check against the ladder: is the answer near the smallest branch?

        !!mistake Common mistakes
          - Adding the branches in **series**. They both connect the node to ground: parallel.
          - Forgetting the branch to $V_{DD}$: $V_{DD}$ is ground for signals.
          - Counting a gate as a branch (writing $1/g_m$ for a gate): a gate is $\infty$.
          - Splitting a node where a gate moves with it (a diode in another branch driving a gate on this node): that is the K rule.
          - Forgetting to turn the input off: the input transistor's gate is held for $R_{out}$.
      `),
      Q(md`A node has a diode-connected transistor ($g_m = 2\,\text{mS}$) above it and a cascode ($20\,\text{M}\Omega$) below. About what is the node resistance?`,
        ['$500\\,\\Omega$', '$20\\,\\text{M}\\Omega$', '$10\\,\\text{M}\\Omega$', '$20.0005\\,\\text{M}\\Omega$'], 0,
        [null, 'In parallel the **smallest** branch wins.', 'That would be two equal branches.', 'Branches to (incremental) ground are in parallel, not in series.'],
        md`$500\,\Omega\parallel20\,\text{M}\Omega\approx500\,\Omega$. A diode on a node makes it a low-impedance node.`),
      Q(md`In the small-signal circuit, a resistor from a node to $V_{DD}$ is`,
        ['a branch from the node to ground', 'an open circuit', 'a branch to a $V_{DD}$ source that must be kept', 'shorted out'], 0,
        [null, 'A resistor carries current whenever there is voltage across it; its far end is at 0.', '$V_{DD}$ does not change, so in the small-signal circuit it is 0: ground.', 'Its two ends are at $v_t$ and 0, so it is not shorted.'],
        md`$V_{DD}$ is an incremental ground, so the resistor goes from the node to ground: it is one of the parallel branches.`),
      Q(md`Branches of $1\kO$, $100\kO$ and $10\,\text{M}\Omega$ meet at a node. The node resistance is closest to`,
        ['$0.99\\kO$', '$1\\kO$ exactly', '$10.1\\,\\text{M}\\Omega$', '$33\\kO$'], 0,
        [null, 'Parallel is always **below** the smallest branch: $1\\kO\\parallel100\\kO = 0.990\\kO$.', 'That is the series sum.', 'That would be an average; parallel is not an average.'],
        md`$1/(1 + 0.01 + 0.0001)\,\text{mS} = 0.990\kO$: the $1\kO$ branch dominates; the $100\kO$ one trims 1%.`),
      P({
        id: 'bk03-node-p1', title: 'Practice 1 #2(a), new numbers',
        q: md`Same circuit as the worked example (PMOS diode $M_2$ under $R_1$; $M_1$ with a held gate on $R_S$). All transistors $g_m = 4\,\text{mS}$, $r_{ds} = 25\kO$; $R_1 = 1\kO$, $R_S = 0.5\kO$. Find $R_{UP}$, $R_{DN}$ and $R_{eq1}$.`,
        fig: p1Node,
        parts: [{ lbl: 'R_{UP}', unit: 'kΩ', ans: 1.24752 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 75.5, traps: [{ v: 25.5, msg: 'Degeneration: add $g_mr_{ds}R_S$.' }] }, { lbl: 'R_{eq1}', unit: 'kΩ', ans: 1.22725, traps: [{ v: 76.7475, msg: 'Parallel, not series.' }] }],
        hints: [md`Up: $R_1 + 1/(g_m + 1/r_{ds})$. Down: $r_{ds} + R_S(1 + g_mr_{ds})$ with $g_mr_{ds} = 100$.`],
        sol: md`
1. $R_{UP} = 1\kO + \dfrac{1}{4\,\text{mS} + 0.04\,\text{mS}} = 1\kO + 247.5\,\Omega = 1.2475\kO$.
2. $R_{DN} = 25 + 0.5\times101 = 75.5\kO$.
3. $R_{eq1} = 1.2475\parallel75.5 = \dfrac{1.2475\times75.5}{76.75}\kO = 1.227\kO$.`,
      }),
      P({
        id: 'bk03-node-sf', title: 'A follower output, with and without a load',
        q: md`Source follower: $M_1$ ($g_{m1} = 2\,\text{mS}$, $r_{ds1} = 50\kO$) with its drain on $V_{DD}$; bias transistor $M_2$ below ($r_{ds2} = 50\kO$, gate held). Find $R_{out}$, then $R_{out}$ with a $1\kO$ load from the output to ground.`,
        fig: sfNode,
        parts: [{ lbl: 'R_{out}', unit: 'Ω', ans: 490.196, traps: [{ v: 25000, msg: 'That is $r_{ds1}\\parallel r_{ds2}$: $M_1$ is looked into at its **source**, about $1/g_{m1}$.' }] }, { lbl: 'R_{out,L}', unit: 'Ω', ans: 328.947 }],
        hints: [md`Up: a source with its drain on a rail. Down: a drain.`],
        sol: md`
1. Conductances: $g_{m1} + 1/r_{ds1} + 1/r_{ds2} = 2 + 0.02 + 0.02 = 2.04\,\text{mS}$, so $R_{out} = 490.2\,\Omega$.
2. With $R_L$: $2.04 + 1 = 3.04\,\text{mS}$, $R_{out,L} = 328.9\,\Omega$.`,
      }),
      P({
        id: 'bk03-node-dd', title: 'Two diodes on one node',
        q: md`A PMOS diode ($g_m = 1\,\text{mS}$) hangs from $V_{DD}$ to the node and an NMOS diode ($g_m = 2\,\text{mS}$) from the node to ground; both $r_{ds} = 50\kO$. Find the node resistance.`,
        fig: F.node(['diode', { n: 'M_2' }], ['diode', { n: 'M_1' }], { look: 'R' }),
        parts: [{ lbl: 'R', unit: 'Ω', ans: 328.947, traps: [{ v: 1480.39, msg: 'The diodes are not in series here: each goes from the node to (incremental) ground.' }] }],
        hints: [md`Each diode is $\tfrac{1}{g_m}\parallel r_{ds}$; both connect the node to ground.`],
        sol: md`Add conductances: $(1 + 0.02) + (2 + 0.02) = 3.04\,\text{mS}$, so $R = 328.9\,\Omega$, about $\tfrac{1}{g_{m1} + g_{m2}}$.`,
      }),
      P({
        id: 'bk03-node-sym', title: 'A diode-loaded output, typed',
        q: md`Common-source stage, input off: $M_1$ below (gate held), a PMOS diode $M_2$ above. Type $R_{out}$ (exact, or the $g_mr_{ds}\gg1$ form). Variables: gm2, rds1, rds2.`,
        fig: F.node(['diode', { n: 'M_2' }], ['drain', { n: 'M_1' }], { look: 'R_{out}' }),
        parts: [BK.ex('1/(gm2 + 1/rds1 + 1/rds2)', ['gm2', 'rds1', 'rds2'], 'R_{out}')],
        hints: [md`Up: $\tfrac{1}{g_{m2}}\parallel r_{ds2}$. Down: $r_{ds1}$. Parallel.`],
        sol: md`$R_{out} = r_{ds1}\parallel\tfrac{1}{g_{m2}}\parallel r_{ds2} = \dfrac{1}{g_{m2} + 1/r_{ds1} + 1/r_{ds2}}\approx\dfrac{1}{g_{m2}}$.`,
      }),
      P({
        id: 'bk03-node-ladder', title: 'Which branch matters?',
        q: md`A node has three branches (all transistors $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$): a $50\kO$ resistor to $V_{DD}$; a PMOS with its gate held and $1\kO$ between its source and $V_{DD}$; an NMOS cascode below. Find the node resistance, and pick the branch that sets it.`,
        fig: [...F.UPB.degen(1, { n: 'M_3', rn: 'R_1' }), ...F.DNB.casc(1, {}), ['w', [1, 0], [2.4, 0]], ['R', [2.4, 0], [2.4, -1.2], { n: '50\\,\\text{k}\\Omega' }], ['rail', [2.4, -1.2]],
          ['w', [2.4, 0], [3.2, 0]], F.lookR([3.2, 0], 'R')],
        parts: [{ lbl: 'R', unit: 'kΩ', ans: 42.7867 },
          { lbl: 'Which branch dominates?', mc: ['the $50\\kO$ resistor', 'the degenerated PMOS', 'the cascode', 'all three equally'], a: 0,
            why: [null, 'It is $301\\kO$: six times the resistor, so it trims the answer by about 14%, but does not set it.', 'At $20\\,\\text{M}\\Omega$ it barely matters.', 'Parallel is dominated by the smallest branch.'] }],
        hints: [md`PMOS: $r_{ds} + R_1(1 + g_mr_{ds}) = 301\kO$. Cascode: $20.2\,\text{M}\Omega$.`],
        sol: md`
1. Branches: $50\kO$; PMOS degenerated: $100 + 1\times201 = 301\kO$; cascode: $100 + 100 + 200\times100 = 20{,}200\kO$.
2. $R = 1\Big/\Big(\dfrac{1}{50} + \dfrac{1}{301} + \dfrac{1}{20{,}200}\Big)\kO = \dfrac{1}{0.02 + 0.003322 + 0.0000495}\kO = 42.79\kO$.
3. The resistor sets it; the PMOS trims 14%; the cascode is invisible.`,
      }),
      P({
        id: 'bk03-node-exam', title: 'A node with a diode, a cascode and a gate (exam style)',
        q: md`Node $X$: up, a PMOS diode $M_3$ ($g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$) with $R_1 = 1\kO$ to $V_{DD}$; down, a cascode $M_2$ on $M_1$ (both $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, gates held); and the gate of a follower $M_4$. Find $R_{UP}$, $R_{DN}$, $R_X$.`,
        fig: p6Node,
        parts: [{ lbl: 'R_{UP}', unit: 'kΩ', ans: 1.98039 }, { lbl: 'R_{DN}', unit: 'MΩ', ans: 20.2 }, { lbl: 'R_X', unit: 'kΩ', ans: 1.9802, traps: [{ v: 0.988, msg: 'Do not add a $1/g_m$ for $M_4$: a gate is an open circuit.' }] }],
        hints: [md`$M_4$'s gate adds nothing. Up: diode plus $R_1$. Down: cascode.`],
        sol: md`
1. $R_{UP} = 1\kO + \dfrac{1}{1\,\text{mS} + 0.02\,\text{mS}} = 1\kO + 0.9804\kO = 1.980\kO$.
2. $R_{DN} = 100 + 100 + 200\times100\kO = 20.2\,\text{M}\Omega$.
3. $M_4$'s gate: $\infty$. $R_X = 1.9804\kO\parallel20.2\,\text{M}\Omega = 1.9802\kO$.`,
      }),
      G('bk_mi_node', { need: 4 }),
    ],
  });

  // ================================================================== 10. chapter problems
  const gallery = rowSvg([
    { fig: F.gate({ look: 'R' }), cap: 'gate: $\\infty$' }, { fig: F.drain({}), cap: 'drain: $r_{ds}$' }, { fig: F.source({}), cap: 'source: $\\tfrac{1}{g_m}\\parallel r_{ds}$' },
    { fig: F.source({ load: 'R' }), cap: '$\\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$' }, { fig: F.diode({}), cap: 'diode: $\\tfrac{1}{g_m}\\parallel r_{ds}$' },
    { fig: F.drain({ rs: 'R_S' }), cap: '$r_{ds} + R_S + g_mr_{ds}R_S$' }, { fig: F.k({}), cap: 'K rule' }, { fig: F.casc({}), cap: 'cascode' },
    { fig: F.reg({}), cap: 'regulated cascode' }, { fig: F.node(['diode', {}], ['drain', {}], { look: 'R' }), cap: 'node: $R_{UP}\\parallel R_{DN}$' }]);
  const nLoad = [['rail', [1, -2]], ['nmos', [1, -1], { n: 'M_2', dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['gnd', [1, 2]], ['w', [1, 0], [2, 0]], F.lookR([2, 0], 'R_{out}')];
  const cgR = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['nmos', [1, 1]], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]], ['w', [1, 2], [2, 2]], F.lookR([2, 2], 'R_{in}')];
  const stackEx = [...F.UPB.casc(1, {}), ['nmos', [1, 1], { n: 'M_2' }], ['acg', [0, 1]], ['nmos', [1, 3], { n: 'M_1' }], ['acg', [0, 3]], ['R', [1, 4], [1, 5.2], { n: 'R_S' }], ['gnd', [1, 5.2]],
    ['w', [1, 0], [2, 0]], F.lookR([2, 0], 'R_{out}')];
  const cgEx = [['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['acg', [0, -1]], ['node', [1, 0], { n: 'D', side: 'l' }], ['w', [1, 0], [2, 0]], F.lookR([2, 0], 'R_{out}'),
    ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]], ['w', [1, 2], [2, 2]], F.lookR([2, 2], 'R_{in}')];
  const kEx = [['rail', [1, -2.4]], ['pmos', [1, -1.4], { n: 'M_3', dc: true }], ...F.kdiv({ rs: 1, n: 'M_1', look: 'R_X' })];
  const ALLG = ['bk_mi_vgs', 'bk_mi_gate', 'bk_mi_drain', 'bk_mi_src', 'bk_mi_diode', 'bk_mi_degen', 'bk_mi_k', 'bk_mi_casc', 'bk_mi_node', 'bk_mi_sym'];

  L({
    id: 'bk03-problems', title: 'Chapter 3 problems', kind: 'review', ref: 'Chapter 3',
    steps: [
      R(md`
        ### Chapter summary

        Every result, with the one-line reason it has the shape it has. All of them come from one model (a current $g_mv_{gs}$ plus $v_{ds}/r_{ds}$ from drain to source, nothing into the gate) and one method ([the test source](#/l/bk03-test)).

        | Looking into | Result | Why |
        |---|---|---|
        | [the gate](#/l/bk03-gate) | $\infty$ | nothing in the model touches the gate |
        | [a drain](#/l/bk03-drain), gate and source still | $r_{ds} = 1/(\lambda I_D)$ | $v_{gs} = 0$: only the weak handle acts |
        | [a source](#/l/bk03-source), gate still, drain on a rail | $\tfrac{1}{g_m}\parallel r_{ds}$ | $v_{gs} = -v_t$: the strong handle acts |
        | a source with $R_D$ on the drain | $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\approx\dfrac{1}{g_m} + \dfrac{R_D}{g_mr_{ds}}$ | the drain moves, and reaches the source only through $r_{ds}$ |
        | a source with an ideal current source on the drain | $\infty$ | no path for the current |
        | [a diode](#/l/bk03-diode), NMOS or PMOS | $\tfrac{1}{g_m}\parallel r_{ds}$ | $v_{gs} = v_{ds}$: a resistor $1/g_m$ |
        | a diode with $R$ in series | $R + \tfrac{1}{g_m}\parallel r_{ds}$ | a two-terminal resistor; the gate is not held, so no magnification |
        | [a degenerated drain](#/l/bk03-degen) | $r_{ds} + R_S + g_mr_{ds}R_S$ | negative feedback: current in $R_S$ lowers $v_{gs}$ |
        | [a drain whose gate moves by $Kv_t$](#/l/bk03-k) | $\dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$ | the moving gate helps the current, amplified by $g_mr_{ds}$ |
        | [a cascode](#/l/bk03-cascode) | $r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}$ | degeneration with $R_S = r_{ds1}$ |
        | a regulated cascode | $r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + g_{m3}r_{ds3})R_Y$ | the booster multiplies $v_{gs1}$ by $1 + A$ |
        | [a node](#/l/bk03-node) | $R_{UP}\parallel R_{DN}$ | currents add; the smallest branch wins |

        **The impedance scaler:** with the gate held, a transistor multiplies what is under its source by $1 + g_mr_{ds}$ (seen from the drain) and divides what is on its drain by the same factor (seen from the source).
      `, gallery),
      P({
        id: 'bk03-pr-three', title: 'The three looks, one transistor',
        q: md`A transistor has $g_m = 2.5\,\text{mS}$ and $r_{ds} = 80\kO$. With the other two terminals at incremental ground, what do you see looking into each terminal?`,
        figHtml: rowSvg([{ fig: F.gate({ look: 'R_G' }) }, { fig: F.drain({ look: 'R_D' }) }, { fig: F.source({ look: 'R_S' }) }]),
        parts: [{ lbl: 'R_G', mc: ['$\\infty$', '$400\\,\\Omega$', '$80\\kO$'], a: 0, why: [null, 'That is the source.', 'That is the drain.'] },
          { lbl: 'R_D', unit: 'kΩ', ans: 80 }, { lbl: 'R_S', unit: 'Ω', ans: 398.01 }],
        hints: [md`Gate: nothing attached. Drain: $v_{gs} = 0$. Source: $v_{gs} = -v_t$.`],
        sol: md`Gate $\infty$; drain $r_{ds} = 80\kO$; source $1/(2.5\,\text{mS} + 0.0125\,\text{mS}) = 398.0\,\Omega$.`,
      }),
      P({
        id: 'bk03-pr-pload', title: 'A PMOS load from its bias',
        q: md`A PMOS current-source load carries $0.25\,\text{mA}$ with $\lambda = 0.08\,\text{V}^{-1}$. The NMOS below it has $r_{ds1} = 200\kO$. Find the load's $r_{ds2}$ and the output resistance with the input off.`,
        fig: F.node(['drain', { n: 'M_2' }], ['drain', { n: 'M_1' }], { look: 'R_{out}' }),
        parts: [{ lbl: 'r_{ds2}', unit: 'kΩ', ans: 50 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 40 }],
        hints: [md`$r_{ds} = 1/(\lambda I_D)$; then two drains in parallel.`],
        sol: md`$r_{ds2} = 1/(0.08\times0.25\,\text{mA}) = 50\kO$; $R_{out} = 200\parallel50 = 40\kO$.`,
      }),
      P({
        id: 'bk03-pr-diosz', title: 'A diode from its size, with a resistor',
        q: md`An NMOS diode with $W/L = 50$ carries $0.5\,\text{mA}$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$); ignore $r_{ds}$. Find $g_m$, then the resistance looking into the diode when it sits on $R_S = 1\kO$.`,
        fig: F.diode({ rs: 'R_S', look: 'R' }),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 2.23607 }, { lbl: 'R', unit: 'kΩ', ans: 1.44721 }],
        hints: [md`$g_m = \sqrt{2\mu_nC_{ox}(W/L)I_D}$; series resistor adds.`],
        sol: md`$g_m = \sqrt{2(100\,\mu)(50)(0.5\,\text{m})} = 2.236\,\text{mS}$, so $1/g_m = 447.2\,\Omega$ and $R = 1\kO + 0.4472\kO = 1.447\kO$.`,
      }),
      P({
        id: 'bk03-pr-src2', title: 'A source loaded by a transistor',
        q: md`Gate held; $g_m = 1\,\text{mS}$, $r_{ds} = 100\kO$. The drain load is a PMOS current source with $r_{ds2} = 200\kO$. Find the resistance looking into the source.`,
        fig: F.source({ load: 'M', look: 'R' }),
        parts: [{ lbl: 'R', unit: 'kΩ', ans: 2.9703, traps: [{ v: 0.990099, msg: 'That ignores the drain load: $r_{ds2}$ is twice $r_{ds}$, so it matters a lot.' }] }],
        hints: [md`$(r_{ds} + R_D)/(1 + g_mr_{ds})$ with $R_D = r_{ds2}$.`],
        sol: md`$R = \dfrac{100 + 200}{1 + 100}\kO = \dfrac{300}{101}\kO = 2.970\kO$, three times $1/g_m$.`,
      }),
      P({
        id: 'bk03-pr-pdeg', title: 'A degenerated PMOS',
        q: md`A PMOS ($g_m = 1.5\,\text{mS}$, $r_{ds} = 60\kO$) has $R_S = 3\kO$ to $V_{DD}$ and a held gate. Find the resistance looking up into its drain.`,
        fig: F.drain({ p: 1, rs: 'R_S', look: 'R' }),
        parts: [{ lbl: 'R', unit: 'kΩ', ans: 333 }],
        hints: [md`$g_mr_{ds} = 90$.`],
        sol: md`$R = 60 + 3 + 90\times3 = 333\kO$.`,
      }),
      P({
        id: 'bk03-pr-kdiv', title: 'The K rule with a divider',
        q: md`$g_m = 1\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$; the gate sits on a divider $R_a = 40\kO$, $R_b = 10\kO$ hung from the drain. Find $K$, the transistor branch, and $R_{EQ}$.`,
        fig: F.kdiv({ rs: 1, look: 'R_{EQ}' }),
        parts: [{ lbl: 'K', unit: '', ans: 0.2 }, { lbl: 'R_{DN}', unit: 'kΩ', ans: 9.57143 }, { lbl: 'R_{EQ}', unit: 'kΩ', ans: 8.03357 }],
        hints: [md`$K = 10/50$; $g_mr_{ds} = 100$.`],
        sol: md`$K = 0.2$; $R_{DN} = \dfrac{100 + 1 + 100\times1}{1 + 100\times0.2} = \dfrac{201}{21}\kO = 9.571\kO$; $R_{EQ} = 50\parallel9.571 = 8.034\kO$.`,
      }),
      P({
        id: 'bk03-pr-cascrs', title: 'A degenerated cascode',
        q: md`$M_2$ on $M_1$ on $R_S = 1\kO$; both $g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$; gates held. Find $R_{out}$.`,
        fig: F.casc({ rs: 1, look: 'R_{out}' }),
        parts: [{ lbl: 'R_{out}', unit: 'MΩ', ans: 15.301 }],
        hints: [md`Bottom-up with $1 + g_mr_{ds} = 101$.`],
        sol: md`$R_1 = 50 + 1\times101 = 151\kO$; $R_{out} = 50 + 151\times101 = 15{,}301\kO = 15.30\,\text{M}\Omega$.`,
      }),
      P({
        id: 'bk03-pr-reg', title: 'A regulated cascode on a transistor',
        q: md`Regulated cascode: $M_1$ ($g_{m1} = 1\,\text{mS}$, $r_{ds1} = 100\kO$) sits on $R_Y = 100\kO$; the booster $M_3$ has $g_{m3} = 1\,\text{mS}$, $r_{ds3} = 100\kO$ and an ideal current-source load. Find $R_{out}$.`,
        fig: F.reg({ look: 'R_{out}' }),
        parts: [{ lbl: 'R_{out}', unit: 'MΩ', ans: 1010.2 }],
        hints: [md`$A = 100$; $R_{out} = r_{ds1} + R_Y + g_{m1}r_{ds1}(1 + A)R_Y$.`],
        sol: md`$R_{out} = 100\kO + 100\kO + (100)(101)(100\kO) = 1{,}010{,}200\kO\approx1.01\,\text{G}\Omega$.`,
      }),
      P({
        id: 'bk03-pr-nload', title: 'An NMOS load with its gate on $V_{DD}$',
        q: md`$M_2$ is an NMOS with its drain **and** gate on $V_{DD}$, its source on the output; $g_{m2} = 0.5\,\text{mS}$, $r_{ds2} = 100\kO$. $M_1$ below has $r_{ds1} = 50\kO$ (input off). Find $R_{out}$.`,
        fig: nLoad,
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 1.88679 }],
        hints: [md`Looking up into $M_2$'s **source**: its gate and drain are both at incremental ground.`],
        sol: md`Up: a source with gate and drain on a rail, $\dfrac{1}{g_{m2} + 1/r_{ds2}}$. Down: $r_{ds1}$. Conductances: $0.5 + 0.01 + 0.02 = 0.53\,\text{mS}$, so $R_{out} = 1.887\kO$.`,
      }),
      P({
        id: 'bk03-pr-sym1', title: 'Typed: a drain degenerated by a diode',
        q: md`$M_1$ (gate held) sits on a diode-connected $M_2$. Type the resistance looking into $M_1$'s drain (exact or the $g_mr_{ds}\gg1$ form). Variables: gm1, gm2, rds1, rds2.`,
        fig: degDiode,
        parts: [BK.ex('rds1 + (1/(gm2 + 1/rds2))*(1 + gm1*rds1)', ['gm1', 'gm2', 'rds1', 'rds2'], 'R')],
        hints: [md`$R_S = \tfrac{1}{g_{m2}}\parallel r_{ds2}$, then degeneration.`],
        sol: md`$R = r_{ds1} + \Big(\tfrac{1}{g_{m2}}\parallel r_{ds2}\Big)(1 + g_{m1}r_{ds1})\approx r_{ds1}\Big(1 + \dfrac{g_{m1}}{g_{m2}}\Big)$.`,
      }),
      P({
        id: 'bk03-pr-sym2', title: 'Typed: a common-gate input node',
        q: md`Gate held, $R_D$ on the drain, and a resistor $R_S$ from the source to ground. Type the resistance at the source node (exact or within 3%). Variables: gm, rds, RD, RS.`,
        fig: cgR,
        parts: [BK.ex('(RS) || ((rds + RD)/(1 + gm*rds))', ['gm', 'rds', 'RD', 'RS'], 'R_{in}', { ranges: { gm: [1e-3, 4e-3], rds: [5e4, 2e5], RD: [5e4, 5e5], RS: [200, 2000] } })],
        hints: [md`Two branches at the source node: $R_S$, and the transistor's source.`],
        sol: md`$R_{in} = R_S\parallel\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$ (Lecture 29: $R_S\parallel\tfrac{1}{g_m}[1 + R_D/r_{ds}]$).`,
      }),
      P({
        id: 'bk03-pr-rank', title: 'Rank the resistances',
        q: md`One transistor type, $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$. Pick the largest and the smallest of: (A) a drain with $R_S = 1\kO$ under the source; (B) a source with $R_D = 100\kO$ on the drain; (C) a diode on a $1\kO$ resistor; (D) a plain drain.`,
        parts: [{ lbl: 'Largest', mc: ['A', 'B', 'C', 'D'], a: 0, why: [null, '$\\approx2/g_m = 1\\kO$: small.', '$1.5\\kO$: small.', '$100\\kO$; A is three times that.'] },
          { lbl: 'Smallest', mc: ['A', 'B', 'C', 'D'], a: 1, why: ['That is the largest ($301\\kO$).', null, '$1\\kO + 0.5\\kO = 1.5\\kO$, a bit more than B.', '$100\\kO$.'] }],
        hints: [md`A: $301\kO$; B: $200\kO/201$; C: $R + 1/g_m$; D: $r_{ds}$.`],
        sol: md`A $= 301\kO$, B $= 995\,\Omega$, C $= 1.4975\kO$, D $= 100\kO$. Largest A, smallest B.`,
      }),
      P({
        id: 'bk03-pr-fb', title: 'Feedback through a diode, new numbers',
        q: md`The circuit of [the K-rule example](#/l/bk03-k) ($M_1$ held over the diode $M_2$; $M_4$'s gate on $X$), with all transistors $g_m = 1\,\text{mS}$, $r_{ds} = 200\kO$. Find $R_{b1}$, $K$, $R_{M4}$ and $R_{EQ}$.`,
        fig: kMirror,
        parts: [{ lbl: 'R_{b1}', unit: 'kΩ', ans: 400 }, { lbl: 'K', unit: '', ans: 0.00248756 }, { lbl: 'R_{M4}', unit: 'kΩ', ans: 133.555 }, { lbl: 'R_{EQ}', unit: 'kΩ', ans: 100.125 }],
        hints: [md`$R_X = 1/(1.005\,\text{mS})$; $g_mr_{ds} = 200$.`],
        sol: md`
1. $R_X = 995.0\,\Omega$; $R_{b1} = 200 + 0.995\times201 = 400\kO$.
2. $K = 995.0/400{,}000 = 0.002488$.
3. $R_{M4} = \dfrac{200}{1 + 200\times0.002488}\kO = \dfrac{200}{1.4975}\kO = 133.6\kO$.
4. $R_{EQ} = 400\parallel133.6 = 100.1\kO\approx r_{ds}/2$.`,
      }),
      P({
        id: 'bk03-pr-stack', title: 'Exam style: a cascode stack with a cascode load', big: true,
        q: md`Input off. Up: a PMOS cascode ($M_4$ on $V_{DD}$, $M_3$ below). Down: $M_2$ on $M_1$ on $R_S = 1\kO$. All transistors $g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$; all gates held. Find (a) the resistance $R_1$ looking into $M_1$'s drain, (b) $R_{DN}$, (c) $R_{UP}$, (d) $R_{out}$, (e) $R_{out}$ if a large capacitor bypassed $R_S$.`,
        fig: stackEx,
        parts: [{ lbl: 'R_1', unit: 'kΩ', ans: 151 }, { lbl: 'R_{DN}', unit: 'MΩ', ans: 15.301 }, { lbl: 'R_{UP}', unit: 'MΩ', ans: 5.1 }, { lbl: 'R_{out}', unit: 'MΩ', ans: 3.82506 }, { lbl: 'R_{out,bypassed}', unit: 'MΩ', ans: 2.55 }],
        hints: [md`$1 + g_mr_{ds} = 101$. Bottom-up for the down stack; the up stack is a plain cascode.`, md`Bypassing $R_S$ makes the down stack a plain cascode too.`],
        sol: md`
**(a)** $R_1 = r_{ds} + R_S(1 + g_mr_{ds}) = 50 + 101 = 151\kO$.

**(b)** $R_{DN} = 50 + 151\times101 = 15{,}301\kO = 15.30\,\text{M}\Omega$.

**(c)** $R_{UP} = 50 + 50\times101 = 5{,}100\kO = 5.1\,\text{M}\Omega$.

**(d)** $R_{out} = 15.30\parallel5.1 = \dfrac{15.30\times5.1}{20.40}\,\text{M}\Omega = 3.825\,\text{M}\Omega$.

**(e)** Without $R_S$ both stacks are $5.1\,\text{M}\Omega$: $R_{out} = 2.55\,\text{M}\Omega$. The degeneration helped, but the up stack now limits the output.`,
      }),
      P({
        id: 'bk03-pr-cg', title: 'Exam style: both ends of a common-gate stage', big: true,
        q: md`$M_1$ ($g_m = 2\,\text{mS}$, $r_{ds} = 50\kO$, gate held) has $R_S = 1\kO$ from its source to ground and a PMOS current-source load $M_2$ ($r_{ds2} = 50\kO$). Find (a) the resistance looking up into $M_1$'s source alone, (b) $R_{in}$ at the source node, (c) $R_{out}$ at the drain node (input off), (d) which approximation of (c) is good.`,
        fig: cgEx,
        parts: [{ lbl: 'R_{S1}', unit: 'Ω', ans: 990.099 }, { lbl: 'R_{in}', unit: 'Ω', ans: 497.512 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 37.5622, traps: [{ v: 25, msg: 'That treats $M_1$ as plain $r_{ds}$: $R_S$ degenerates it.' }] },
          { lbl: '(d) A good estimate of $R_{out}$ is', mc: ['$r_{ds2}\\parallel r_{ds1}(1 + g_mR_S)$', '$r_{ds2}\\parallel r_{ds1}$', '$1/g_m$', '$r_{ds2} + r_{ds1}$'], a: 0,
            why: [null, 'That ignores the degeneration by $R_S$, which triples $M_1$\'s drain resistance here.', 'The output is a drain node, not a source node.', 'The two branches are in parallel.'] }],
        hints: [md`(a) $(r_{ds1} + r_{ds2})/(1 + g_mr_{ds1})$. (b) put $R_S$ in parallel.`, md`(c) $M_2$ is $r_{ds2}$ up; $M_1$ with $R_S$ under its source is a degenerated drain down.`],
        sol: md`
**(a)** $\dfrac{50 + 50}{101}\kO = 990.1\,\Omega$.

**(b)** $R_{in} = 1\kO\parallel990.1\,\Omega = 497.5\,\Omega$.

**(c)** Down: $50 + 1\times101 = 151\kO$. Up: $50\kO$. $R_{out} = 50\parallel151 = 37.56\kO$.

**(d)** $r_{ds2}\parallel r_{ds1}(1 + g_mR_S) = 50\parallel150 = 37.5\kO$, within 0.2%.`,
      }),
      P({
        id: 'bk03-pr-kexam', title: 'Exam style: a node with a moving gate', big: true,
        q: md`Node $X$: a PMOS diode $M_3$ ($g_m = 1\,\text{mS}$, $r_{ds} = 100\kO$) up to $V_{DD}$; $M_1$ ($g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 2\kO$) with its drain on $X$ and its gate on a divider $R_a = 30\kO$, $R_b = 10\kO$ hung from $X$. Find $K$, the $M_1$ branch $R_K$, $R_{UP}$, and $R_X$.`,
        fig: kEx,
        parts: [{ lbl: 'K', unit: '', ans: 0.25 }, { lbl: 'R_K', unit: 'kΩ', ans: 9.84314, traps: [{ v: 502, msg: 'That is the held-gate value; the gate moves by $Kv_t$.' }] }, { lbl: 'R_{UP}', unit: 'Ω', ans: 990.099 },
          { lbl: 'R_X', unit: 'Ω', ans: 879.822 }],
        hints: [md`Three branches: the diode, $M_1$ (K rule), and the divider $R_a + R_b$.`],
        sol: md`
1. $K = 10/40 = 0.25$.
2. $g_mr_{ds} = 200$: $R_K = \dfrac{100 + 2 + 200\times2}{1 + 200\times0.25}\kO = \dfrac{502}{51}\kO = 9.843\kO$.
3. $R_{UP} = 1/(1.01\,\text{mS}) = 990.1\,\Omega$.
4. Conductances: $1.01 + 0.1016 + 0.025 = 1.1366\,\text{mS}$, so $R_X = 879.8\,\Omega$: the diode dominates.`,
      }),
      P({
        id: 'bk03-pr-pfollow', title: 'A PMOS follower output',
        q: md`$M_1$ (PMOS, $g_m = 1\,\text{mS}$, $r_{ds} = 50\kO$) has its drain grounded and its source on the output; a PMOS current source $M_2$ ($r_{ds2} = 50\kO$) feeds the output from $V_{DD}$. Input off. Find $R_{out}$.`,
        fig: F.node(['drain', { n: 'M_2' }], ['src', { n: 'M_1' }], { look: 'R_{out}' }),
        parts: [{ lbl: 'R_{out}', unit: 'Ω', ans: 961.538 }],
        hints: [md`Down: looking into a PMOS **source** whose drain is on ground. Up: a drain.`],
        sol: md`Down: $\tfrac{1}{g_m}\parallel r_{ds}$; up: $r_{ds2}$. Conductances $1 + 0.02 + 0.02 = 1.04\,\text{mS}$: $R_{out} = 961.5\,\Omega$.`,
      }),
      P({
        id: 'bk03-pr-limits', title: 'Limits you should know cold',
        q: md`Answer each from the formulas' limits.`,
        parts: [
          { lbl: '(a) Looking into a source when the drain hangs on an ideal current source:', mc: ['$\\infty$', '$1/g_m$', '$2/g_m$'], a: 0, why: [null, 'That needs a path at the drain.', 'That is a transistor current source with $r_{ds}$ equal to the device\'s.'] },
          { lbl: '(b) A degenerated drain with $\\lambda\\to0$:', mc: ['$\\infty$', '$R_S(1 + g_m)$', '$R_S$'], a: 0, why: [null, 'Not dimensionally sensible; $r_{ds}\\to\\infty$ makes every term grow.', '$r_{ds}\\to\\infty$ makes $r_{ds}(1 + g_mR_S)$ infinite.'] },
          { lbl: '(c) The K rule with $K = 1$ and $R_S = 0$:', mc: ['$\\tfrac{1}{g_m}\\parallel r_{ds}$', '$r_{ds}$', '$\\infty$'], a: 0, why: [null, 'That is $K = 0$.', 'A moving gate lowers the resistance.'] },
          { lbl: '(d) A source with $R_D$ on the drain, when $r_{ds}\\to\\infty$:', mc: ['$1/g_m$', '$\\infty$', '$R_D$'], a: 0, why: [null, '$R_D$ is divided by $g_mr_{ds}\\to\\infty$.', 'The drain resistance reaches the source divided by $g_mr_{ds}$.'] },
        ],
        hints: [md`Write each formula, then take the limit term by term.`],
        sol: md`(a) $\infty$ (no current path). (b) $\infty$ (an ideal current source stays ideal). (c) $\dfrac{r_{ds}}{1 + g_mr_{ds}} = \tfrac{1}{g_m}\parallel r_{ds}$, a diode. (d) $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}\to\dfrac{1}{g_m}$.`,
      }),
      G('bk_mi_vgs', { need: 8, pool: ALLG }),
    ],
  });
})();

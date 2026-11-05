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
        parts: [{ lbl: 'R_{in}', unit: 'MΩ', ans: 1, traps: [{ v: 1.0025, msg: 'Nothing on the source side reaches the input: the gate draws no current, so $1/g_m$ and $R_S$ do not appear.' }] }],
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
          { lbl: 'R_{out}', unit: 'Ω', ans: 495.05, traps: [{ v: 500, msg: 'Close: that is $1/g_{m2}$ alone. Keep $r_{ds2}$ in parallel: $1/(g_{m2} + 1/r_{ds2})$.' }] }],
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
        parts: [{ lbl: 'R_S', unit: 'Ω', ans: 975.61, traps: [{ v: 1000, msg: 'Close: that is $1/g_m$ alone. Keep $r_{ds}$: $1/(g_m + 1/r_{ds})$.' }, { v: 40000, msg: 'That is $r_{ds}$: the drain, not the source.' }] }],
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
        parts: [{ lbl: 'v_{oc}', unit: 'mV', ans: 9.95025 }, { lbl: 'R_{th}', unit: 'Ω', ans: 497.512 }, { lbl: 'v_s', unit: 'mV', ans: 7.96813, traps: [{ v: 8, msg: 'Close: keep $r_{ds}$ in both $v_{oc}$ and $R_{th}$.' }] }],
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
  const nDioModel = [['w', [0.4, 0.5], [0.4, 0], [2, 0]], ['term', [0.4, 0.5], { n: 'G', side: 'l' }], ['term', [0.4, 1.4]], ['w', [0.4, 1.4], [0.4, 2], [2, 2]],
    ['vlab', [0.65, 0.65], [0.65, 1.25], { n: 'v_{gs} = v_t' }], ...S.mos(2, 0, 2), ['gnd', [2.65, 2]], ['node', [2, 0], { n: 'D', side: 'a' }], ...S.test(3.3, 0)];
  const pDioModel = [['gndu', [2, -0.6]], ['w', [2, -0.6], [2, 0]], ['txt', [2.15, -0.3], '$S$', { a: 'l' }], ...S.mos(2, 2, 0),
    ['term', [0.4, 1.5], { n: 'G', side: 'l' }], ['w', [0.4, 1.5], [0.4, 2], [2, 2]], ['term', [0.4, 0.6]], ['w', [0.4, 0.6], [0.4, 0], [2, 0]],
    ['vlab', [0.65, 1.35], [0.65, 0.75], { n: 'v_{gs} = v_t' }], ['node', [2, 2], { n: 'D', side: 'b' }], ...S.test(3.3, 2)];
  const dioRSModel = [['w', [0.4, 0.5], [0.4, 0], [2, 0]], ['term', [0.4, 0.5], { n: 'G', side: 'l' }], ['term', [0.4, 1.4]], ['w', [0.4, 1.4], [0.4, 2], [2, 2]],
    ['vlab', [0.65, 0.65], [0.65, 1.25], { n: 'v_{gs}' }], ...S.mos(2, 0, 2), ['R', [2.65, 2], [2.65, 3.4], { n: 'R_S' }], ['gnd', [2.65, 3.4]],
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
        parts: [{ lbl: 'R_{out}', unit: 'Ω', ans: 970.874, traps: [{ v: 1000, msg: 'Close: keep $r_{ds2}$ and $r_{ds1}$ in parallel with $1/g_{m2}$.' }, { v: 33333.3, msg: 'That is $r_{ds1}\\parallel r_{ds2}$: it forgets that $M_2$ is a diode.' }] },
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
})();

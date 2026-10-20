/* Unit 6 — the small-signal MOSFET: bias first, then small changes; one model for NMOS and PMOS; the test-source
   method. Lecture 14–15, Handout 3. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2u6', l);

  L({
    id: 'e2-u6-picture', title: 'Bias first, then small changes', ref: 'Lectures 11–15',
    steps: [
      R(md`
        Every Exam 2 problem is about **changes**. A transistor is biased at some DC point (Exam 1's job), and a small signal wiggles around it. Near the bias point the curved square law looks straight, so the wiggles obey a **linear** circuit: the small-signal (incremental) model.

        The bias point sets two numbers, and after that the DC values never appear again:

        - $g_m$: how much the drain current changes per volt of $v_{gs}$ (the slope of $I_D$ vs $V_{GS}$).
        - $r_{ds}$: how much it changes per volt of $v_{ds}$ (the leftover slope of the "flat" saturation curve, Lecture 14).

        !!key Incremental ground
        A node that **does not move** when the signal moves is an incremental ground, even if it sits at 5 V. $V_{DD}$, a bias $V_B$, a gate tied to a fixed voltage: all ground for signals. The course draws these as an open triangle ▽.

        So the recipe for drawing the small-signal circuit is:

        | Element | Becomes |
        |---|---|
        | $V_{DD}$, any DC voltage source, a bias $V_B$ | short to ground (incremental ground) |
        | DC current source | open circuit |
        | Very large ("$\infty$") capacitor | short |
        | MOSFET in saturation, NMOS **or** PMOS | $g_mv_{gs}$ from drain to source, $r_{ds}$ across |
        | Resistor | itself |

        Why does a DC current source become an **open**? It holds its current fixed no matter what, so the *change* in its current is zero for any change in voltage: that is the definition of infinite resistance. A DC voltage source holds its voltage fixed: zero change in voltage, a short.
      `),
      Q(md`A current source $I_B$ hangs from the source of a transistor to ground. In the small-signal circuit, what is between that source node and ground?`,
        ['Nothing: the current source is an open circuit.', 'A short to ground.', 'A resistor $1/g_m$.', 'A resistor $r_{ds}$.'], 0,
        [null, 'That is what a DC *voltage* source becomes.', '$1/g_m$ is what you see looking *into* a transistor\'s source, not what a current source becomes.', 'An ideal current source has no $r_{ds}$; only a transistor used as a current source does.'],
        md`An ideal DC current source fixes the current, so its small-signal current is zero: an open. (Problem Set 5 (a), (b): $R_{EQ} = \infty$.)`),
      Q(md`In the circuit below, which nodes are incremental grounds?`,
        ['$V_{DD}$, the bottom of $R_S$, and the gate (it sits on $V_B$)', 'Only $V_{DD}$ and the bottom of $R_S$', 'Every node except $v_{out}$', 'Only the bottom of $R_S$: $V_{DD}$ is 5 V, not 0'], 0,
        [null, 'The gate is tied to a DC source $V_B$, so it cannot move either.', 'The source node moves (current through $R_S$ changes).', '"Ground" here means "does not change", not "0 V".'],
        md`Anything held by a DC source is an incremental ground. The source node and $v_{out}$ move; $V_{DD}$, the gate and the bottom of $R_S$ do not.`,
        { fig: [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }], ['nmos', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['Vac', [1, 3.2], [1, 4.2], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.2]], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['V', [-0.6, 1.4], [-0.6, 2.4], { n: 'V_B', side: 'l' }], ['gnd', [-0.6, 2.4]]] }),
      R(md`
        !!trap Check the DC state before you draw $g_m$
        A small-signal model only exists around a bias point in saturation. Practice Exam 1 asks what you get if you short a MOSFET's gate to its source:

        - **With a wire:** $V_{GS} = 0 < V_T$ at DC. The device is off: an **open circuit**.
        - **With a huge capacitor** (bias set elsewhere): the device stays biased, but $v_{gs} = 0$ for signals. The controlled source is dead and what is left is a **resistor $r_{ds}$**.
      `),
      Q(md`A MOSFET's gate is shorted to its source with a wire. What two-terminal small-signal element is left between drain and source?`,
        ['An open circuit: the device is off.', 'A resistor $r_{ds}$.', 'A resistor $1/g_m$.', 'A short.'], 0,
        [null, 'That is the capacitor version: there the device is still biased. With a wire, $V_{GS} = 0$ turns it off.', '$1/g_m$ needs the gate tied to the *drain* (a diode).', 'Nothing conducts with $V_{GS} = 0$.'],
        md`$V_{GS} = 0 < V_T$: cut-off, no channel, no small-signal model at all. Always check the DC state first.`),
    ],
  });

  L({
    id: 'e2-u6-model', title: 'One model for NMOS and PMOS', ref: 'Lecture 14, Handout 3',
    steps: [
      R(md`
        In saturation, $I_D = \tfrac12\mu C_{ox}\tfrac{W}{L}V_{ov}^2$. Wiggle $V_{GS}$ by a small $v_{gs}$ and the current changes by the slope times $v_{gs}$:
        $$i_d = \frac{\partial I_D}{\partial V_{GS}}\,v_{gs} = g_m v_{gs},\qquad g_m = \mu C_{ox}\frac{W}{L}V_{ov} = \frac{2I_D}{V_{ov}} = \sqrt{2\mu C_{ox}\tfrac{W}{L}I_D}$$

        Real saturation curves are not perfectly flat: $I_D$ still creeps up with $V_{DS}$. That slope is a conductance $1/r_{ds}$ from drain to source. Put together:

        !!key The small-signal MOSFET (Lecture 14)
        $$i_d = g_mv_{gs} + \frac{v_{ds}}{r_{ds}}\qquad(\text{flowing drain}\to\text{source inside the device})$$
        A voltage-controlled current source $g_mv_{gs}$ from drain to source, with $r_{ds}$ in parallel. The gate draws nothing.
      `, [['nmos', [1, 1], { n: '' }], ['txt', [1.25, -0.1], '$D$', { a: 'l' }], ['txt', [1.25, 2.1], '$S$', { a: 'l' }], ['txt', [-0.15, 1], '$G$', { a: 'r' }],
        ['txt', [2.1, 1], '$\\Longrightarrow$', { a: 'c' }],
        ['G', [4, 0], [4, 2], { n: 'g_mv_{gs}' }], ['w', [4, 0], [5.3, 0]], ['R', [5.3, 0], [5.3, 2], { n: 'r_{ds}' }], ['w', [4, 2], [5.3, 2]], ['term', [4, 0], { n: 'D', side: 'a' }], ['term', [4, 2], { n: 'S', side: 'b' }], ['term', [2.9, 1], { n: 'G\\ (\\text{open})', side: 'b' }]]),
      R(md`
        **The same model works for a PMOS.** For a PMOS the big current flows source to drain, $I_{SD} = \tfrac12\mu_pC_{ox}\tfrac{W}{L}(V_{SG} - |V_T|)^2$. Raise $v_{sg}$ and $i_{sd}$ grows by $g_mv_{sg}$. Now flip both signs: $i_{d}$ (drain to source) $= -i_{sd} = -g_mv_{sg} = g_mv_{gs}$. The model is literally identical. So every result in this unit (diode $1/g_m$, degeneration, cascodes) holds for PMOS with no changes.

        **Numbers to have in your head** (course parameters):

        | Situation | Result |
        |---|---|
        | $I_D = 1\,\text{mA}$, $V_{ov} = 0.2\,\text{V}$ | $g_m = 10\,\text{mS}$, $1/g_m = 100\,\Omega$ |
        | $I_D = 100\,\mu\text{A}$, $V_{ov} = 0.2\,\text{V}$ | $g_m = 1\,\text{mS}$, $1/g_m = 1\,\text{k}\Omega$ |
        | NMOS $W/L = 500$ | $K = \tfrac12(100\,\mu)(500) = 25\,\text{mA/V}^2$ |
        | $g_mr_{ds}$ ("intrinsic gain") | typically 20 to 1000; exams say "$g_mr_{ds}\gg 1$" |

        !!trap $r_{ds}\ne\infty$ on Exam 2
        Exam 1 set $\lambda = 0$ ($r_{ds} = \infty$). Most Exam 2 problems say "You may **NOT** assume $r_{ds} = \infty$" but "$g_mr_{ds}\gg 1$". That means: keep $r_{ds}$ where it is the only thing there (a current-source load, the output of a cascode), drop it where it sits next to something much smaller (in parallel with $1/g_m$).
      `),
      Q(md`The input of a PMOS common-source stage rises by 10 mV. Does the PMOS's drain current (out of its drain, toward the load) go up or down?`,
        ['Down: $v_{sg}$ falls by 10 mV, so the PMOS conducts less.', 'Up: $g_m$ is positive.', 'It depends on $r_{ds}$.', 'Up, because the PMOS model has the opposite sign.'], 0,
        [null, 'For a PMOS the controlling voltage is $v_{sg}$, which falls when the gate rises.', '$r_{ds}$ only matters if the drain voltage changes; the direction comes from $v_{sg}$.', 'The model has the *same* sign: $i_d = g_mv_{gs}$, and $v_{gs} = +10\\,\\text{mV}$ makes the drain-to-source current grow, i.e. less current comes out of the drain.'],
        md`Gate up means $v_{sg}$ down, so less current flows source to drain. In the shared model, $i_d$ (drain to source) $= g_mv_{gs} > 0$, which is the same statement: less current leaving the drain toward the load.`),
      G('e2_gm', { need: 3 }),
      P({
        id: 'e2u6-gm-meas', src: 'Practice Exam 1 · Problem 1(b)', title: 'Measure $g_m$ from two node voltages',
        q: md`In the source follower below, $v_i = 50\,\text{mV}$ at the gate, the source moves by $v_s = 40\,\text{mV}$, and $R_S = 1\kO$. Assume $r_{ds}\to\infty$. Find $i_d$ and $g_m$.`,
        fig: [['nmos', [1, 1]], ['acg', [1, 0], { dir: 'u' }], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_i', side: 'l' }], ['gnd', [-0.6, 2.4]], ['w', [1, 2], [1.8, 2]], ['term', [1.8, 2], { n: 'v_s' }], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]], ['iarr', [1, -0.3], 'd', { n: 'i_d', side: 'l', off: [-14, 0] }]],
        parts: [{ lbl: 'i_d', unit: 'µA', ans: 40 }, { lbl: 'g_m', unit: 'mS', ans: 4 }],
        hints: [md`All of $i_d$ flows through $R_S$.`, md`$v_{gs} = v_i - v_s$, and $i_d = g_mv_{gs}$.`],
        sol: md`**What to see:** the drain current has nowhere to go but $R_S$, so $R_S$ is an ammeter: $i_d = v_s/R_S = 40\,\text{mV}/1\kO = 40\,\mu\text{A}$.

The device only "feels" $v_{gs} = v_i - v_s = 10\,\text{mV}$, so $g_m = i_d/v_{gs} = 40\,\mu\text{A}/10\,\text{mV} = 4\,\text{mS}$.

Check with the follower formula: $\dfrac{v_s}{v_i} = \dfrac{g_mR_S}{1 + g_mR_S} = \dfrac{4}{5} = 0.8$ ✓.`,
      }),
    ],
  });

  L({
    id: 'e2-u6-test', title: 'The test-source method', ref: 'Lecture 15',
    steps: [
      R(md`
        "Resistance looking into a node" means: zero every independent signal source, connect a test voltage $v_t$ to the node, find the current $i_t$ it pushes in, and take $R = v_t/i_t$. Dependent sources ($g_mv_{gs}$) stay: they are part of the circuit.

        !!method Four steps
        1. Draw the small-signal circuit; kill $v_{in}$ (short it) and every bias.
        2. Put $v_t$ at the node. Label the few node voltages that are not ground.
        3. Write $v_{gs}$ **in terms of node voltages** ($v_g - v_s$). This is where most mistakes happen.
        4. KCL at the node (and at one more node if needed). Solve for $v_t/i_t$.

        **Worked: looking into the source** (gate and drain at incremental ground).
      `, F.source()),
      R(md`
        Put $v_t$ on the source. Then $v_g = 0$, $v_s = v_t$, so $v_{gs} = -v_t$. The device current, drain to source, is
        $$i_d = g_m(-v_t) + \frac{0 - v_t}{r_{ds}} = -\Big(g_m + \frac1{r_{ds}}\Big)v_t$$
        A negative drain-to-source current means current flows **up**, out of the test source and into the transistor's source: $i_t = (g_m + 1/r_{ds})v_t$, so
        $$R_S = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{g_m}\parallel r_{ds}\approx\frac{1}{g_m}$$

        **The intuition, without algebra:** pushing the source up by $v$ *reduces* $v_{gs}$ by $v$, so the channel lets $g_mv$ less current flow down. Less current flowing down out of the node is the same as $g_mv$ flowing into it. A node where $v$ volts pushes in $g_mv$ amps *is* a resistor $1/g_m$. Hold on to this picture: every impedance in Unit 7 is the same argument.
      `),
      P({
        id: 'e2u6-derive-deg', title: 'Your turn: looking into a degenerated drain',
        q: md`Gate at incremental ground, $R_S$ from source to ground, test source at the drain. Derive $R_{DN} = v_t/i_t$ (keep $r_{ds}$).`,
        fig: F.drainDeg(),
        parts: [E2.ex('rds + RS + gm*rds*RS', ['gm', 'rds', 'RS'], 'R_{DN}', { exact: true })],
        hints: [
          md`All of $i_t$ goes down through the transistor and then through $R_S$, so $v_s = i_tR_S$.`,
          md`$v_{gs} = 0 - v_s = -i_tR_S$. KCL for the device: $i_t = g_mv_{gs} + \dfrac{v_t - v_s}{r_{ds}}$.`,
          md`Multiply through by $r_{ds}$ and collect $i_t$: $i_t(r_{ds} + R_S + g_mr_{ds}R_S) = v_t$.`,
        ],
        sol: md`$v_s = i_tR_S$ (the whole test current flows through $R_S$). The device: $i_t = g_m(0 - i_tR_S) + \dfrac{v_t - i_tR_S}{r_{ds}}$. Multiply by $r_{ds}$:
$$i_tr_{ds} = -g_mr_{ds}R_Si_t + v_t - i_tR_S\ \Rightarrow\ R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$$
**Read it:** the drain sees $r_{ds}$, plus $R_S$ in series, plus $g_mr_{ds}R_S$: the source resistance magnified by the intrinsic gain. This is Problem Set 5 (c), and the one result you should be able to write in your sleep.`,
      }),
      P({
        id: 'e2u6-derive-diode', title: 'Your turn: the diode-connected transistor',
        q: md`Gate tied to drain, source grounded. Find the resistance looking in (keep $r_{ds}$).`,
        fig: F.diode(),
        parts: [E2.ex('rds || 1/gm', ['gm', 'rds'], 'R_{diode}', { exact: true })],
        hints: [md`With the gate on the drain, $v_{gs} = v_t$.`],
        sol: md`$v_{gs} = v_t - 0 = v_t$, so $i_t = g_mv_t + v_t/r_{ds}$ and $R = \dfrac{1}{g_m + 1/r_{ds}} = \dfrac1{g_m}\parallel r_{ds}\approx\dfrac1{g_m}$.

Same number as looking into a source: in both cases the test voltage appears across gate and source with a full $\pm v_t$.`,
      }),
    ],
  });
})();

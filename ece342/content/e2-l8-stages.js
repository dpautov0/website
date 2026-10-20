/* Unit 8 — single-stage amplifiers through the G_M R_out method: CS and its loads, degeneration, CG, CD, the cascode
   (three methods, one answer), numeric gains without a calculator. Lectures 11–18, Problem Set 4. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2u8', l);

  L({
    id: 'e2-u8-gmrout', title: 'The $G_MR_{out}$ method', ref: 'Lecture 15',
    steps: [
      R(md`
        Any linear circuit, seen from its output, is a Norton current source in parallel with a resistance. For an amplifier the Norton current is proportional to $v_{in}$. So instead of solving one big circuit, solve two small ones:

        !!key $A_v = -G_MR_{out}$ (Lecture 15)
        - **$G_M$**: short the output to ground. $G_M = i_{out}/v_{in}$, with $i_{out}$ the current pulled **down** into the stage out of the short.
        - **$R_{out}$**: kill $v_{in}$. $R_{out}$ is the resistance at the output: $R_{UP}\parallel R_{DN}$.
        - Then $v_{out} = -i_{out}R_{out} = -G_MR_{out}v_{in}$.

        Why it is easier: with the output shorted, the output voltage is zero, so $r_{ds}$ and the load drop out of the $G_M$ calculation. With $v_{in}$ dead, the controlled sources driven by $v_{in}$ drop out of $R_{out}$.
      `),
      R(md`
        **Common source, by the method.** Short $v_{out}$: the transistor pulls $g_mv_{in}$ down out of the short, and $R_D$, $r_{ds}$ carry nothing (zero volts across them). $G_M = g_m$. Kill $v_{in}$: up you see $R_D$, down a drain with its gate and source at ground, $r_{ds}$. So
        $$A_v = -g_m(R_D\parallel r_{ds})$$
      `, F.cs()),
      R(md`
        !!trap The sign of $G_M$
        With $G_M$ defined as current pulled **down into** the stage, a CS stage has $G_M > 0$ and an inverting gain. A **common-gate** or **common-drain** stage pushes current the other way when $v_{in}$ rises, so its $G_M$ is **negative** and $A_v = -G_MR_{out}$ comes out positive. Lecture 17 writes "$G_M = -g_m$" for the follower for exactly this reason.

        The course's own solutions are not always careful with this sign. Protect yourself: after every answer, do the one-line check "$v_{in}$ up → current down more or less → $v_{out}$ down or up" and make the sign match.

        A related short question (Practice 1 #1(a)): a box with $v_i = 100\,\text{mV}$ shows an open-circuit (Thévenin) output of $1\,\text{V}$ with $R_{TH} = 1\kO$. Then $A_v = 10$, $R_{out} = 1\kO$ and $|G_M| = A_v/R_{out} = 10\,\text{mS}$ (the Norton current is $v_{TH}/R_{TH} = 1\,\text{mA}$ per $100\,\text{mV}$).
      `),
      Q(md`To find $G_M$, why do we **short** the output instead of leaving it open?`,
        ['With $v_{out} = 0$, nothing at the output node ($R_D$, $r_{ds}$, the load) carries current, so $i_{out}$ comes only from the transconductors.', 'Because the Thévenin voltage is zero when shorted.', 'To make $R_{out}$ zero.', 'It does not matter: open or short gives the same $G_M$.'], 0,
        [null, 'The Thévenin voltage is the open-circuit one; the short gives the Norton current.', '$R_{out}$ is a property of the circuit, shorting it during the $G_M$ step does not change it.', 'Open-circuit gives $A_v$ directly, which is the hard problem we are splitting up.'],
        md`Shorted output: zero volts across every element at that node, so they carry no current. $i_{out}$ is just the sum of the transistors' currents, each easy to find. This is also why two transistors driving one output simply add their $G_M$s.`),
    ],
  });

  L({
    id: 'e2-u8-cs', title: 'Common source and its loads', ref: 'Lectures 14–16, Problem Set 4',
    steps: [
      R(md`
        The input transistor is the same in every CS stage: $G_M = g_{m1}$. Only the load changes, and the gain is $-g_{m1}\times(\text{everything at the drain})$:

        | Load (looking up) | $R_{out}$ | $A_v$ |
        |---|---|---|
        | Resistor $R_D$ | $R_D\parallel r_{ds1}$ | $-g_{m1}(R_D\parallel r_{ds1})$ |
        | Diode-connected $M_2$ | $\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}$ | $\approx -\dfrac{g_{m1}}{g_{m2}}$ |
        | Current source ($M_2$, gate held) | $r_{ds1}\parallel r_{ds2}$ | $-g_{m1}(r_{ds1}\parallel r_{ds2})$ |
        | Two loads at once (a diode and $R_D$ on the same node) | $R_D\parallel\tfrac1{g_{m2}}\parallel r_{ds1}$ | the smallest one wins |

        **Diode load: gain from geometry.** Both devices carry the same DC current, and $g_m = \sqrt{2\mu C_{ox}(W/L)I_D}$, so
        $$A_v\approx -\frac{g_{m1}}{g_{m2}} = -\sqrt{\frac{\mu_1(W/L)_1}{\mu_2(W/L)_2}}$$
        A PMOS diode load on an NMOS input picks up the mobility ratio $\mu_n/\mu_p = 2$.

        **Current-source load: the most gain one transistor can give,** about half the intrinsic gain $g_mr_{ds}$, because the drain node only sees two $r_{ds}$.
      `, F.csIsrc()),
      Q(md`An NMOS CS stage ($W/L = 200$) has a diode-connected NMOS load ($W/L = 50$). Ignoring $r_{ds}$, what is $A_v$?`,
        ['$-2$', '$-4$', '$-0.5$', '$-\\sqrt2$'], 0,
        [null, 'That is the ratio of sizes; the gain is the square root of it.', 'Upside down: the input device is the bigger one, so $|A_v| > 1$.', 'Check the ratio: $200/50 = 4$, $\\sqrt4 = 2$.'],
        md`Same current, same mobility: $|A_v| = \sqrt{200/50} = 2$, inverting. With a PMOS diode of $W/L = 50$ it would be $\sqrt{(100\cdot200)/(50\cdot50)} = \sqrt8\approx2.83$.`),
      P({
        id: 'e2u8-inv', src: 'Problem Set 4 · #2', title: 'Both devices driven: the CMOS inverter amplifier',
        q: md`Both gates are driven by $v_{in}$ ($M_1$ NMOS below, $M_2$ PMOS above). Find $A_v$ with $r_{ds}$.`,
        fig: F.inverter(),
        parts: [E2.ex('-(gm1 + gm2)*(rds1 || rds2)', ['gm1', 'gm2', 'rds1', 'rds2'], 'A_v')],
        hints: [md`Short the output. $v_{in}$ up: does $M_1$ pull more or less? Does $M_2$ push more or less?`, md`Both effects pull $v_{out}$ down, so the transconductances add.`],
        sol: md`**$G_M$** (output shorted): $M_1$ pulls $g_{m1}v_{in}$ down; the PMOS $M_2$'s $v_{sg}$ falls by $v_{in}$, so it pushes $g_{m2}v_{in}$ **less** current in from the top. Both look like current leaving the node: $G_M = g_{m1} + g_{m2}$.

**$R_{out}$**: two drains with their gates and sources dead: $r_{ds1}\parallel r_{ds2}$.
$$A_v = -(g_{m1}+g_{m2})(r_{ds1}\parallel r_{ds2})$$
In Problem Set 4 #2 the two diode-connected devices $M_3$, $M_4$ on the same node add $\tfrac1{g_{m3}}\parallel\tfrac1{g_{m4}}$ in parallel to $R_{out}$, which dominates: $A_v\approx-\dfrac{g_{m1}+g_{m2}}{g_{m3}+g_{m4}}$.`,
      }),
      P({
        id: 'e2u8-diode-rd', src: 'Lecture 16 · example (ii)', title: 'A diode above the input device, then $R_D$',
        q: md`$M_1$ (input) has a diode-connected $M_2$ between its drain and the output node, and $R_D$ from the output to $V_{DD}$. The output is taken at the top of the diode. Find $R_{out}$ (keep $r_{ds}$; exact or approximate).`,
        fig: [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }], ['nmos', [1, 1], { n: 'M_2', dc: true }], ['nmos', [1, 3], { n: 'M_1' }], ['gnd', [1, 4]], ['w', [0, 3], [-0.6, 3], [-0.6, 3.4]], ['Vac', [-0.6, 3.4], [-0.6, 4.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 4.4]]],
        parts: [E2.ex('RD || (rds1 + 1/(gm2 + 1/rds2))', ['RD', 'rds1', 'gm2', 'rds2'], 'R_{out}')],
        hints: [md`Looking down from the output: the diode $M_2$ (a $\tfrac1{g_{m2}}\parallel r_{ds2}$ element) in series with $M_1$'s drain ($r_{ds1}$, its gate is dead).`],
        sol: md`$G_M = g_{m1}$ (the diode just passes $M_1$'s current up). $R_{DN} = (\tfrac1{g_{m2}}\parallel r_{ds2}) + r_{ds1}$, so
$$R_{out} = R_D\parallel\Big[\big(\tfrac1{g_{m2}}\parallel r_{ds2}\big) + r_{ds1}\Big]\approx R_D\parallel r_{ds1}$$
The diode in series with a big $r_{ds1}$ barely matters (Lecture 16). The gain is the same as a plain CS: $-g_{m1}(R_D\parallel r_{ds1})$.`,
      }),
    ],
  });

  L({
    id: 'e2-u8-csdeg', title: 'Source degeneration', ref: 'Lectures 16–17, Problem Set 4 #1',
    steps: [
      R(md`
        Put $R_S$ under the input transistor. Now $v_{in}$ has to share itself between $v_{gs}$ and the drop across $R_S$: KVL (Lecture 16, method 1) gives
        $$v_{in} = v_{gs} + g_mv_{gs}R_S\ \Rightarrow\ v_{gs} = \frac{v_{in}}{1 + g_mR_S}$$
        so
        $$G_M = \frac{g_m}{1 + g_mR_S}\quad\Big(\text{exactly } \frac{g_m}{1 + (g_m + 1/r_{ds})R_S}\Big),\qquad R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$
        $$A_v\approx-\frac{g_mR_D}{1 + g_mR_S}\xrightarrow{g_mR_S\gg1}-\frac{R_D}{R_S}$$
      `, F.csDeg()),
      R(md`
        !!key Degeneration trades gain for predictability
        When $g_mR_S\gg1$, $G_M\to1/R_S$: **independent of the transistor** (Lecture 17: "Gm is independent of transistor parameters!"). The gain becomes a resistor ratio. The output resistance goes up by $(1 + g_mR_S)$ at the same time.

        The "resistor" in the source does not have to be a resistor. A diode-connected device ($1/g_{m3}$) gives $G_M = \dfrac{g_{m1}}{1 + g_{m1}/g_{m3}} = \dfrac{g_{m1}g_{m3}}{g_{m1}+g_{m3}}$ (Practice 5 #3). A source sitting on an ideal current source gives $G_M = 0$: no current can change, so that transistor contributes nothing to $G_M$ (Practice 4 #2, $M_3$).
      `),
      Q(md`A transistor's source sits on an ideal DC current source $I_B$. What does it contribute to the short-circuit $G_M$ at its drain?`,
        ['Nothing: its current cannot change.', '$g_m$', '$g_m/2$', '$1/R_S$ with $R_S = r_{ds}$'], 0,
        [null, 'That is for a grounded source.', 'There is no other device sharing the current here.', 'An ideal current source is infinite, so $g_m/(1 + g_m\\infty) = 0$.'],
        md`$G_M = g_m/(1 + g_mR_S)$ with $R_S = \infty$ is zero. Physically: the drain current equals $I_B$, period. (Practice 4 #2: $M_3$ drops out of $G_M$.)`),
      P({
        id: 'e2u8-csdeg-sym', title: 'Degenerated CS gain',
        q: md`Find $A_v$ for the degenerated CS stage, ignoring $r_{ds}$.`,
        fig: F.csDeg(),
        parts: [E2.ex('-gm*RD/(1 + gm*RS)', ['gm', 'RD', 'RS'], 'A_v', { exact: true })],
        hints: [md`$G_M = g_m/(1+g_mR_S)$, $R_{out} = R_D$ when $r_{ds}\to\infty$.`],
        sol: md`$A_v = -G_MR_{out} = -\dfrac{g_mR_D}{1 + g_mR_S}$. Check the limits: $R_S = 0$ gives the plain CS $-g_mR_D$; $g_mR_S\gg1$ gives $-R_D/R_S$.`,
      }),
    ],
  });

  L({
    id: 'e2-u8-cg', title: 'Common gate', ref: 'Lecture 17, Problem Set 4 #1(b)',
    steps: [
      R(md`
        Hold the gate, drive the **source**. The source is a $\approx1/g_m$ node, so $v_{in}$ (through $R_S$, if there is one) pushes a current
        $$i = \frac{v_{in}}{R_S + 1/g_m}$$
        into it, and that current flows straight up through the device into the drain node. With the output shorted, all of it lands in the short:
        $$|G_M| = \frac{1}{R_S + \frac1{g_m}\parallel r_{ds}}\approx\frac{g_m}{1 + g_mR_S},\qquad A_v = +\frac{R_{out}}{R_S + 1/g_m},\qquad R_{out} = R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$

        **Direction (the sign):** $v_{in}$ up → $v_{gs}$ down → **less** current pulled down out of the drain → $v_{out}$ up. Non-inverting.
      `, F.cg()),
      R(md`
        !!key CG in one sentence
        Same size of gain as the degenerated CS, **no inversion**, **low input resistance** ($R_{in}\approx 1/g_m$ at the source), high output resistance. It is the "current buffer": it takes a current in at a low-impedance node and delivers it at a high-impedance node.

        With no $R_S$ and $r_{ds}$ kept, the exact gain is
        $$A_v = (1 + g_mr_{ds})\frac{R_D}{R_D + r_{ds}}\approx g_m(R_D\parallel r_{ds})$$
        (the $+1$: even with $g_m = 0$, $v_{in}$ reaches the output through $r_{ds}$ and $R_D$ as a divider).
      `),
      P({
        id: 'e2u8-cg-sym', title: 'CG gain with a source resistance',
        q: md`Input through $R_S$ into the source, gate at incremental ground, $R_D$ load. Find $A_v$ with $r_{ds}$ (exact, or the approximation).`,
        fig: F.cg(),
        parts: [E2.ex('(RD || (rds + RS + gm*rds*RS))/(RS + 1/(gm + 1/rds))', ['gm', 'rds', 'RD', 'RS'], 'A_v')],
        hints: [md`$|G_M| = 1/(R_S + \tfrac1{g_m}\parallel r_{ds})$: the current through $R_S$ into a $\tfrac1{g_m}\parallel r_{ds}$ source (output shorted).`, md`$R_{out}$: $R_D$ in parallel with a degenerated drain ($R_S$ in its source, $v_{in}$ dead).`],
        sol: md`**$G_M$** (output shorted): looking into the source with the drain at ground is $\tfrac1{g_m}\parallel r_{ds}$, so the current through $R_S$ is $v_{in}/(R_S + \tfrac1{g_m}\parallel r_{ds})$, and it flows up into the shorted output. **$R_{out}$** ($v_{in}$ dead): $R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$.
$$A_v = +\frac{R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)}{R_S + \frac1{g_m}\parallel r_{ds}}\approx\frac{R_D}{R_S + 1/g_m}$$`,
      }),
      Q(md`A CG stage has its drain on an ideal current source and drives a load $R_L$ at the drain. What is the input resistance at the source when $R_L$ is removed?`,
        ['Infinite', '$1/g_m$', '$r_{ds}$', '$1/g_m + r_{ds}$'], 0,
        [null, 'Only if the drain sees a small resistance. Here it sees an open.', 'That is the drain side.', 'Look again at $\\frac{r_{ds}+R_D}{1+g_mr_{ds}}$ with $R_D\\to\\infty$.'],
        md`$R_{in} = \dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$ with $R_D\to\infty$ is infinite: the current entering the source has nowhere to go. Put $R_L$ back and $R_{in} = \dfrac{r_{ds} + R_L}{1 + g_mr_{ds}}$.`),
    ],
  });

  L({
    id: 'e2-u8-cd', title: 'Common drain: the source follower', ref: 'Lecture 17',
    steps: [
      R(md`
        Drive the gate, take the output at the source, drain at $V_{DD}$. The device and the load make a **voltage divider**: from $v_{in}$ the source looks like a $1/g_m$ "resistor" (Lecture 17 redraws it exactly that way), down to $R_L\parallel r_{ds}$:
        $$A_v = \frac{R_L\parallel r_{ds}}{(R_L\parallel r_{ds}) + 1/g_m} < 1,\qquad R_{out} = R_L\parallel\tfrac1{g_m}\parallel r_{ds},\qquad R_{in} = \infty$$

        **DC picture (level shifter):** with an ideal current source $I_B$ as the load, $I_D = I_B$ fixes $V_{GS} = V_T + V_{ov}$. The output copies the input, shifted down by $V_{GS}$: $V_{OUT} = V_{IN} - (V_T + V_{ov})$, and $A_v = \dfrac{g_mr_{ds}}{1 + g_mr_{ds}}\approx 1$.

        **Why use it:** it can drive a small load without dragging down the stage in front of it, because its input is a gate (infinite) and its output is a source ($1/g_m$, low).
      `, F.cd()),
      P({
        id: 'e2u8-cd-sym', title: 'Follower gain with $r_{ds}$',
        q: md`Find $A_v$ of the source follower with load $R_L$, keeping $r_{ds}$.`,
        fig: F.cd(),
        parts: [E2.ex('(RL || rds)/((RL || rds) + 1/gm)', ['gm', 'rds', 'RL'], 'A_v', { exact: true })],
        hints: [md`KCL at the source: $g_m(v_{in} - v_{out}) = v_{out}/(R_L\parallel r_{ds})$.`],
        sol: md`$g_m(v_{in} - v_{out}) = \dfrac{v_{out}}{R_L\parallel r_{ds}}\ \Rightarrow\ A_v = \dfrac{g_m(R_L\parallel r_{ds})}{1 + g_m(R_L\parallel r_{ds})} = \dfrac{R_L\parallel r_{ds}}{(R_L\parallel r_{ds}) + 1/g_m}$.`,
      }),
    ],
  });

  L({
    id: 'e2-u8-cascode', title: 'The cascode, three ways', ref: 'Gain computation handout, Lecture 16',
    steps: [
      R(md`
        The cascode amplifier: $M_1$ is the CS input, $M_2$ sits on top with its gate held, $R_D$ is the load. The course handout solves it three ways and gets the same answer. Knowing all three means you can pick the fastest one for any circuit.

        **1. Direct (KCL at both nodes).** Write KCL at the output and at the middle node $v_x$ with the full small-signal model, eliminate $v_x$. Reliable but slow:
        $$A_v = \frac{-g_{m1}R_D\,r_{ds1}(1 + g_{m2}r_{ds2})}{R_D + r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}$$
      `, F.cascode()),
      R(md`
        **2. $G_MR_{out}$.** Short the output. $M_1$ makes $g_{m1}v_{in}$; at the middle node it splits between $r_{ds1}$ and the source of $M_2$, which (drain shorted) looks like $\tfrac1{g_{m2}}\parallel r_{ds2}$, tiny. Almost all of it goes up through $M_2$:
        $$G_M = \frac{g_{m1}r_{ds1}(1 + g_{m2}r_{ds2})}{r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}\approx g_{m1},\qquad R_{out} = R_D\parallel(r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1})$$
        and $A_v = -G_MR_{out}$ gives the same expression.

        **3. Terminal resistance (node by node).** Find the resistance looking into $M_2$'s source with $R_D$ on its drain: $R_x = \dfrac{r_{ds2} + R_D}{1 + g_{m2}r_{ds2}}$. Then $M_1$ is a CS stage loaded by $r_{ds1}\parallel R_x$: $v_x = -g_{m1}(r_{ds1}\parallel R_x)v_{in}$. The current $v_x/R_x$ flows up through $M_2$ into $R_D$: $v_{out} = \dfrac{R_D}{R_x}v_x$. Same answer again.

        !!key What the cascode buys
        $G_M\approx g_{m1}$ (as good as a plain CS) and $R_{out}$ multiplied by $g_{m2}r_{ds2}$. With $R_D$ as the load the gain is just $\approx -g_{m1}R_D$; with a high-impedance (current-source) load it becomes $\approx -g_{m1}r_{ds1}\,g_{m2}r_{ds2}$.
      `),
      P({
        id: 'e2u8-casc-av', title: 'Cascode gain',
        q: md`Find $A_v$ for the cascode with load $R_D$, keeping every $r_{ds}$. Exact, or the approximation if your $R_D$ is small next to the cascode's $R_{out}$ (the checker uses $R_D$ between 1 and 10 kΩ).`,
        fig: F.cascode(),
        parts: [E2.ex('-gm1*RD*rds1*(1 + gm2*rds2)/(RD + rds1 + rds2 + gm2*rds1*rds2)', ['gm1', 'gm2', 'rds1', 'rds2', 'RD'], 'A_v')],
        hints: [md`$G_M\approx g_{m1}$; $R_{out} = R_D\parallel(\text{a degenerated drain with } r_{ds1}\text{ in the source})$.`],
        sol: md`$A_v = -G_MR_{out} = -\dfrac{g_{m1}R_D\,r_{ds1}(1 + g_{m2}r_{ds2})}{R_D + r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}\approx -g_{m1}R_D$ when $R_D\ll g_{m2}r_{ds2}r_{ds1}$.`,
      }),
    ],
  });

  L({
    id: 'e2-u8-numbers', title: 'Numeric gains without a calculator', ref: 'Practice 3–5, Problem 1',
    steps: [
      R(md`
        Problem 1 on three of the five practice papers is "find the numerical gain, ignore $r_{ds}$". They are designed so the arithmetic is clean. The recipe:

        1. **DC first**, only enough to get $g_m$: find each device's current (a mirror ratio, a current source, or $K V_{ov}^2$), then $g_m = 2I_D/V_{ov}$. The numbers are always like $V_{ov} = 0.2\,\text{V}$, $I_D = 1\,\text{mA}$, so $g_m = 10\,\text{mS}$, $1/g_m = 100\,\Omega$.
        2. **Small-signal circuit**: kill DC sources, $\infty$ capacitors become wires, diodes become $1/g_m$.
        3. **Name the stage(s)** and use the canonical result. Watch for an input divider: a source resistance in front of a $1/g_m$ node (Practice 4 #1: $100\,\Omega$ into a diode of $100\,\Omega$ halves the signal).

        Example, Practice 5 #1: a common-gate stage, $W/L = 500$, $1\,\text{mA}$ bias. $K = 25\,\text{mA/V}^2$, $V_{ov} = 0.2\,\text{V}$, $g_m = 10\,\text{mS}$. The input capacitor drives the source directly, so $A_v = +g_mR_D = 10\times1 = +10$.
      `),
      G('e2_stage', { need: 6 }),
    ],
  });
})();

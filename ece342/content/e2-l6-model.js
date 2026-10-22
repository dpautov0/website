/* Unit 6 — the small-signal MOSFET: bias first, then small changes; one model for NMOS and PMOS; the test-source
   method. Lecture 14–15, Handout 3. Every result is derived step by step and every transistor is drawn as its model. */
(function () {
  'use strict';
  const { R, P, G, Q } = C;
  const F = window.E2F;
  const L = (l) => E2.lesson('e2u6', l);

  // shift every point of a netlist by (dx, dy), to put two drawings side by side
  const sh = (els, dx, dy = 0) => els.map((e) => e.map((p, i) => (i > 0 && Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' ? [p[0] + dx, p[1] + dy] : p)));

  // One transistor's small-signal model, drawn the way the lectures draw it: the gate is a lone terminal (no current),
  // +v_gs− is marked from the gate to the source node, the dependent source g_m v_gs points from drain (top) to source
  // (bottom), and r_ds sits beside it. o.g / o.d / o.s say what each terminal is connected to.
  function mdl(o) {
    const gx = 1.2, e = [];
    e.push(['term', [gx, 0.4], { n: 'G', side: 'a' }], ['term', [gx, 1.4]], ['w', [gx, 1.4], [gx, 2], [3, 2]], ['vlab', [gx + 0.25, 0.55], [gx + 0.25, 1.25], { n: 'v_{gs}' }]);
    if (o.g === 'vin') e.push(['w', [gx, 0.4], [0, 0.4], [0, 1]], ['Vac', [0, 1], [0, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 2]]);
    if (o.g === 'gnd') e.push(['w', [gx, 0.4], [0.4, 0.4], [0.4, 0.7]], ['gnd', [0.4, 0.7]]);
    if (o.g === 'd') e.push(['w', [gx, 0.4], [gx, 0], [3, 0]]);
    e.push(['G', [3, 0], [3, 2], { n: 'g_mv_{gs}' }], ['w', [3, 0], [4.4, 0]], ['R', [4.4, 0], [4.4, 2], { n: 'r_{ds}' }], ['w', [3, 2], [4.4, 2]]);
    e.push(['txt', [3.15, -0.25], '$D$', { a: 'l' }], ['txt', [3.15, 2.3], '$S$', { a: 'l' }]);
    const test = (y) => [['w', [4.4, y], [5.8, y]], ['V', [5.8, y], [5.8, y + 1.2], { n: 'v_t', side: 'r' }], ['gnd', [5.8, y + 1.2]], ['iarr', [5.15, y], 'l', { n: 'i_t' }]];
    if (o.d === 'gnd') e.push(['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]]);
    if (o.d === 'RD' || o.d === 'RDout') e.push(['R', [3, -1.4], [3, 0], { n: 'R_D' }], ['gndu', [3, -1.4]]);
    if (o.d === 'RDout') e.push(['w', [4.4, 0], [5.4, 0]], ['term', [5.4, 0], { n: 'v_{out}' }]);
    if (o.d === 'test') e.push(...test(0));
    if (o.s === 'gnd') e.push(['w', [3, 2], [3, 2.5]], ['gnd', [3, 2.5]]);
    if (o.s === 'RS') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['gnd', [3, 3.4]]);
    if (o.s === 'RSvin') e.push(['R', [3, 2], [3, 3.4], { n: 'R_S' }], ['Vac', [3, 3.4], [3, 4.4], { n: 'v_{in}', side: 'l' }], ['gnd', [3, 4.4]]);
    if (o.s === 'test') e.push(...test(2));
    return e;
  }

  // the common-gate-style circuit used in the "which nodes are incremental grounds" question and the worked redraw
  const cgFig = () => [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }], ['nmos', [1, 1]],
    ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['Vac', [1, 3.2], [1, 4.2], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['V', [-0.6, 1.4], [-0.6, 2.4], { n: 'V_B', side: 'l' }], ['gnd', [-0.6, 2.4]]];

  // ================================================================================================ lesson 1
  L({
    id: 'e2-u6-picture', title: 'Bias first, then small changes', ref: 'Lectures 11–15',
    steps: [
      R(md`
        ### The plan for this lesson

        Exam 1 was about **DC**: find the bias currents and voltages. Exam 2 is about **changes**: a small signal wiggles the input, and we want to know how much the output wiggles. This lesson sets up the whole idea in three moves:

        1. Show, with algebra, **why** small changes obey a simple **linear** circuit, even though the transistor's square law is curved.
        2. Work out what every circuit element (supply, bias source, current source, capacitor, resistor) turns into when we only look at changes.
        3. Redraw one real amplifier as its small-signal circuit, so you see the whole procedure once.

        The next lesson then derives exactly what the transistor itself turns into.

        **Notation.** The course writes the same quantity three ways:
        - $V_{GS}$ (capital letter, capital subscript): the **DC bias** value, fixed.
        - $v_{gs}$ (lowercase, lowercase subscript): the **small change** (the signal).
        - $v_{GS}$ (lowercase, capital subscript): the **total**, $v_{GS} = V_{GS} + v_{gs}$.
      `),
      R(md`
        ### Why the changes obey a linear circuit

        Take an NMOS in saturation. To keep the algebra short, write $K = \tfrac12\mu_nC_{ox}\tfrac WL$ and call the DC overdrive $V_{ov} = V_{GS} - V_{TN}$.

        **Step 1: write the total current with the total voltage.** The total gate-source voltage is $V_{GS} + v_{gs}$, so the square law gives
        $$i_D = K\big(V_{GS} + v_{gs} - V_{TN}\big)^2$$
        $$i_D = K\big(V_{ov} + v_{gs}\big)^2$$

        **Step 2: expand the square.** $(a + b)^2 = a^2 + 2ab + b^2$:
        $$i_D = KV_{ov}^2 + 2KV_{ov}\,v_{gs} + K\,v_{gs}^2$$

        **Step 3: name the three pieces.**
        - $KV_{ov}^2$ is just the DC current $I_D$ (Exam 1). It does not depend on the signal.
        - $2KV_{ov}\,v_{gs}$ is **proportional** to the signal: double $v_{gs}$, double this term. That is linear.
        - $Kv_{gs}^2$ is the curvature of the square law. This is the only nonlinear piece.

        **Step 4: compare the nonlinear piece with the linear piece.** Divide one by the other:
        $$\frac{Kv_{gs}^2}{2KV_{ov}v_{gs}} = \frac{v_{gs}}{2V_{ov}}$$
        So the curvature is negligible whenever $v_{gs}\ll 2V_{ov}$. That is what "small signal" means.

        **Step 5: drop it.** The change in current is the total minus the DC part:
        $$i_d = i_D - I_D \approx 2KV_{ov}\,v_{gs}$$
        The number $2KV_{ov}$ is called the **transconductance** $g_m$ (next lesson).

        **Example.** $K = 5\,\text{mA/V}^2$, $V_{ov} = 0.2\,\text{V}$ (so $I_D = 5\,\text{m}\times0.2^2 = 0.2\,\text{mA}$), and a signal $v_{gs} = 10\,\text{mV}$.
        - Linear piece: $2\times5\,\text{m}\times0.2\times0.01 = 20\,\mu\text{A}$.
        - Square piece: $5\,\text{m}\times(0.01)^2 = 0.5\,\mu\text{A}$.
        - Ratio $0.5/20 = 2.5\%$, which matches $v_{gs}/(2V_{ov}) = 0.01/0.4 = 2.5\%$.

        !!intuition Zoom in on a curve
        Any smooth curve looks like a straight line if you zoom in far enough. The bias point picks *where* on the $I_D$-vs-$V_{GS}$ curve we sit; the small signal only explores a tiny piece around it; and on that tiny piece the curve is a straight line whose slope is $g_m$.
      `),
      R(md`
        ### What each element becomes

        Once the bias is found, **DC values never appear again**: we only track changes. So ask of every element: *how does its change in voltage relate to its change in current?*

        !!key Incremental ground
        A node that **does not move** when the signal moves is an incremental ground, even if it sits at 5 V. $V_{DD}$, a bias $V_B$, a gate tied to a fixed voltage: all ground for signals. The course draws these as an open triangle ▽.

        **1. A DC voltage source** ($V_{DD}$, a bias $V_B$). Its voltage is always exactly $V_{DD}$, whatever current flows. So its *change* in voltage is zero for any change in current. An element with zero voltage across it is a **short**. One side is usually ground, so the other side becomes an incremental ground.

        **2. A DC current source** ($I_B$). Its current is always exactly $I_B$, whatever the voltage. So its *change* in current is zero for any change in voltage. Resistance is voltage over current:
        $$R = \frac{v}{i} = \frac{v}{0} = \infty$$
        An infinite resistance is an **open circuit**: delete it.

        **3. A very large capacitor.** Its impedance is $\dfrac{1}{j\omega C}$. As $C\to\infty$ this goes to 0 at any signal frequency, so it is a **short** for signals. (At DC it is open: that is why it is used to pass the signal but block the bias.)

        **4. A resistor.** Ohm's law holds for the totals: $V + v = (I + i)R$. Subtract the DC part $V = IR$ and what is left is $v = iR$. A resistor is **itself** for signals.

        **5. A MOSFET in saturation** becomes a dependent current source $g_mv_{gs}$ with a resistor $r_{ds}$ across it. That is the next lesson.
      `),
      Q(md`A current source $I_B$ hangs from the source of a transistor to ground. In the small-signal circuit, what is between that source node and ground?`,
        ['Nothing: the current source is an open circuit.', 'A short to ground.', 'A resistor $1/g_m$.', 'A resistor $r_{ds}$.'], 0,
        [null, 'That is what a DC *voltage* source becomes.', '$1/g_m$ is what you see looking *into* a transistor\'s source, not what a current source becomes.', 'An ideal current source has no $r_{ds}$; only a transistor used as a current source does.'],
        md`An ideal DC current source fixes the current, so its small-signal current is zero: an open. (Problem Set 5 (a), (b): $R_{EQ} = \infty$.)`),
      Q(md`In the circuit below, which nodes are incremental grounds? (The signal $v_{in}$ is on, at the bottom of $R_S$.)`,
        ['$V_{DD}$ and the gate (it sits on $V_B$)', 'Only $V_{DD}$', '$V_{DD}$, the gate and the bottom of $R_S$', 'None: $V_{DD}$ is 5 V, not 0'], 0,
        [null, 'The gate is tied to a DC source $V_B$, so it cannot move either.', 'The bottom of $R_S$ is the input: it moves by exactly $v_{in}$.', '"Ground" here means "does not change", not "0 V".'],
        md`Anything held by a DC source is an incremental ground: $V_{DD}$ and the gate (held by $V_B$). The bottom of $R_S$ moves with $v_{in}$, and the source node and $v_{out}$ move too.`,
        { fig: cgFig() }),
      R(md`
        ### Worked: redraw an amplifier for small signals

        Take the circuit from the question above. The signal $v_{in}$ enters at the bottom of $R_S$, the gate is held at $V_B$, and the output is the drain.

        **Step 1: find the incremental grounds.** $V_{DD}$ is a DC source: ground. The gate is held by $V_B$: ground. Nothing else is held still.

        **Step 2: redraw each element.**
        - $R_D$ stays $R_D$, but its top end was $V_{DD}$, which is now ground. So $R_D$ now hangs from $v_{out}$ to (incremental) ground.
        - $R_S$ stays $R_S$, between the transistor's source and $v_{in}$.
        - The transistor becomes $g_mv_{gs}$ from drain to source with $r_{ds}$ across (next lesson derives this).

        **Step 3: write $v_{gs}$ in node voltages.** The gate is at incremental ground, so $v_g = 0$. Call the source node voltage $v_s$. Then
        $$v_{gs} = v_g - v_s = 0 - v_s = -v_s$$
        This one line is where most sign mistakes happen: the gate is **not** where the signal enters here, so $v_{gs}$ is set by the **source** moving.
      `, cgFig()),
      R(md`
        **Step 4: the small-signal circuit.** Here it is, drawn out. The upside-down ground bars at the top of $R_D$ mark the old $V_{DD}$ rail; the gate is wired to ground; the dependent source arrow points from drain $D$ to source $S$; $r_{ds}$ sits beside it.

        Everything in this picture is linear (resistors and a current source proportional to a voltage), so ordinary node analysis (Kirchhoff's current law, KCL) solves it. Units 7 and 8 do exactly that for every stage in the course.
      `, mdl({ g: 'gnd', d: 'RDout', s: 'RSvin' })),
      R(md`
        ### Check the DC state before you draw $g_m$

        A small-signal model only exists around a bias point **in saturation**. Practice Exam 1 asks what you get if you short a MOSFET's gate to its source. It depends on *how* you short it.

        **With a wire (left).** At DC, $V_{GS} = 0 < V_{TN}$. The device is **off**: no channel, no current, no $g_m$, no $r_{ds}$. What is left is an **open circuit**.

        **With a huge capacitor (middle).** The capacitor is open at DC, so the bias (set some other way) is untouched and the device stays in saturation. For signals the capacitor is a short, so the gate and source move together: $v_{gs} = 0$.

        **Draw that model (right).** The dependent source is $g_m\times0 = 0$: it carries nothing, so it drops out. Only $r_{ds}$ is left between drain and source. Looking into the drain you see a **resistor $r_{ds}$**.

        !!trap Same wiring, two answers
        A wire changes the DC bias (turns the device off). A capacitor changes only the signal ($v_{gs} = 0$). Always check the DC state first.
      `, [...F.gsShort(), ['txt', [0.7, 2.9], '$\\text{off: open}$'],
        ...sh(F.gsCap(), 2.6), ['txt', [4.4, 1], '$\\Rightarrow$', { a: 'c' }],
        ...sh(mdl({ g: 'gnd', s: 'gnd', d: 'test' }), 4.6), ['txt', [6.1, 3.2], '$v_{gs} = 0$']]),
      Q(md`A MOSFET's gate is shorted to its source with a wire. What two-terminal small-signal element is left between drain and source?`,
        ['An open circuit: the device is off.', 'A resistor $r_{ds}$.', 'A resistor $1/g_m$.', 'A short.'], 0,
        [null, 'That is the capacitor version: there the device is still biased. With a wire, $V_{GS} = 0$ turns it off.', '$1/g_m$ needs the gate tied to the *drain* (a diode).', 'Nothing conducts with $V_{GS} = 0$.'],
        md`$V_{GS} = 0 < V_{TN}$: cut-off, no channel, no small-signal model at all. Always check the DC state first.`),
      R(md`
        ### Summary

        - Small signal means $v_{gs}\ll 2V_{ov}$: then the square law's curvature (the $Kv_{gs}^2$ term) is negligible and the changes obey a linear circuit.
        - Bias first (Exam 1), then the bias point sets $g_m$ and $r_{ds}$; after that DC values never appear again.

        | Element | Becomes, for small signals | Why |
        |---|---|---|
        | $V_{DD}$, any DC voltage source, a bias $V_B$ | short to ground (incremental ground) | its voltage never changes |
        | DC current source | open circuit | its current never changes |
        | Very large ("$\infty$") capacitor | short | $1/(j\omega C)\to0$ |
        | Resistor | itself | $v = iR$ for changes too |
        | MOSFET in saturation, NMOS **or** PMOS | $g_mv_{gs}$ from drain to source, $r_{ds}$ across | next lesson |
        | MOSFET with gate wired to source | open (it is off) | $V_{GS} = 0 < V_{TN}$ |
      `),
    ],
  });

  // ================================================================================================ lesson 2
  L({
    id: 'e2-u6-model', title: 'One model for NMOS and PMOS', ref: 'Lecture 14, Handout 3',
    steps: [
      R(md`
        ### The plan for this lesson

        The last lesson showed that small changes obey a linear circuit. This lesson builds the piece that goes in place of the transistor. We will:

        1. Derive $g_m$, the change in drain current per volt of $v_{gs}$, from the square law, and write it three equivalent ways.
        2. Derive $r_{ds}$, the change in drain current per volt of $v_{ds}$.
        3. Put the two together into **the** small-signal model, and draw it.
        4. Use it once on a common source amplifier, so you see the model in action.
        5. Show that a PMOS gives **exactly the same** model, so there is only one thing to remember.
      `),
      R(md`
        ### Deriving $g_m$

        **Step 1: the square law** (saturation, ignoring $r_{ds}$ for now):
        $$I_D = \tfrac12\mu_nC_{ox}\tfrac WL\,(V_{GS} - V_{TN})^2$$

        **Step 2: $g_m$ is the slope.** By definition, $g_m$ is how much $I_D$ changes per volt of $V_{GS}$ at the bias point:
        $$g_m = \frac{\partial I_D}{\partial V_{GS}}$$

        **Step 3: differentiate.** The derivative of $(V_{GS} - V_{TN})^2$ is $2(V_{GS} - V_{TN})$, and the 2 cancels the $\tfrac12$:
        $$g_m = \tfrac12\mu_nC_{ox}\tfrac WL\times2(V_{GS} - V_{TN}) = \mu_nC_{ox}\tfrac WL\,V_{ov}$$
        (This is the $2KV_{ov}$ from the expansion in the last lesson: $2\times\tfrac12\mu_nC_{ox}\tfrac WL\times V_{ov}$.)

        **Step 4: the small-signal current.** For a small change $v_{gs}$, the current changes by slope times change:
        $$i_d = g_m\,v_{gs}$$
      `),
      R(md`
        ### Two more ways to write $g_m$

        Problems give you different things ($I_D$ and $V_{ov}$, or $I_D$ and $W/L$), so it pays to have $g_m$ in terms of each pair.

        **Form 2: in terms of $I_D$ and $V_{ov}$.** Divide the square law by $V_{ov}$:
        $$\frac{I_D}{V_{ov}} = \tfrac12\mu_nC_{ox}\tfrac WL\,V_{ov} = \tfrac12 g_m$$
        Multiply both sides by 2:
        $$g_m = \frac{2I_D}{V_{ov}}$$

        **Form 3: in terms of $I_D$ and $W/L$.** Solve the square law for $V_{ov}$:
        $$V_{ov}^2 = \frac{2I_D}{\mu_nC_{ox}(W/L)}\quad\Rightarrow\quad V_{ov} = \sqrt{\frac{2I_D}{\mu_nC_{ox}(W/L)}}$$
        Put that into Form 1, $g_m = \mu_nC_{ox}\tfrac WL V_{ov}$, and move everything under one square root:
        $$g_m = \mu_nC_{ox}\tfrac WL\sqrt{\frac{2I_D}{\mu_nC_{ox}(W/L)}} = \sqrt{\frac{\big(\mu_nC_{ox}\tfrac WL\big)^2\,2I_D}{\mu_nC_{ox}\tfrac WL}} = \sqrt{2\mu_nC_{ox}\tfrac WL\,I_D}$$

        **Example.** NMOS, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $W/L = 100$, $I_D = 200\,\mu\text{A}$.
        - Overdrive: $200\,\mu = \tfrac12(100\,\mu)(100)V_{ov}^2 = (5\,\text{mA/V}^2)\,V_{ov}^2$, so $V_{ov}^2 = 0.04$ and $V_{ov} = 0.2\,\text{V}$.
        - Form 1: $g_m = (100\,\mu)(100)(0.2) = 2\,\text{mS}$.
        - Form 2: $g_m = \dfrac{2(200\,\mu)}{0.2} = 2\,\text{mS}$.
        - Form 3: $g_m = \sqrt{2(100\,\mu)(100)(200\,\mu)} = \sqrt{4\times10^{-6}} = 2\,\text{mS}$.

        All three agree, as they must. So $1/g_m = 500\,\Omega$.

        !!intuition Which form tells you what
        At a fixed overdrive, $g_m = 2I_D/V_{ov}$ grows **in proportion** to the current. For a fixed transistor size, $g_m = \sqrt{2\mu C_{ox}(W/L)I_D}$ grows only as the **square root** of the current. Doubling $I_D$ in a given transistor gives only $\sqrt2\times$ more $g_m$.
      `),
      R(md`
        ### Where $r_{ds}$ comes from

        Real saturation curves are not perfectly flat: $I_D$ still creeps up as $V_{DS}$ grows (channel-length modulation, Lecture 14). The square law with that effect is
        $$I_D = \tfrac12\mu_nC_{ox}\tfrac WL\,V_{ov}^2\,(1 + \lambda V_{DS})$$
        where $\lambda$ (units 1/V) measures how much the curve tilts.

        **Step 1: the slope with respect to $V_{DS}$.** Only the last bracket contains $V_{DS}$, and its derivative is $\lambda$:
        $$\frac{\partial I_D}{\partial V_{DS}} = \tfrac12\mu_nC_{ox}\tfrac WL\,V_{ov}^2\,\lambda$$

        **Step 2: recognise $I_D$.** Since $\lambda V_{DS}\ll1$, the factor $\tfrac12\mu_nC_{ox}\tfrac WL V_{ov}^2$ is almost exactly $I_D$:
        $$\frac{\partial I_D}{\partial V_{DS}}\approx\lambda I_D$$

        **Step 3: a slope of current vs voltage is a conductance.** Its inverse is a resistance, called $r_{ds}$:
        $$r_{ds} = \frac{1}{\lambda I_D}$$
        So a change $v_{ds}$ adds a current $v_{ds}/r_{ds}$ flowing drain to source.

        **Example.** $\lambda = 0.05\,\text{V}^{-1}$, $I_D = 200\,\mu\text{A}$: $r_{ds} = \dfrac{1}{0.05\times200\,\mu} = \dfrac{1}{10\,\mu} = 100\kO$. With the $g_m = 2\,\text{mS}$ from above, the **intrinsic gain** is $g_mr_{ds} = 2\,\text{m}\times100\,\text{k} = 200$.

        Exam 1 used $\lambda = 0$: then $r_{ds} = 1/0 = \infty$, a perfectly flat curve.
      `),
      R(md`
        ### Putting it together: the small-signal model

        **Step 1: the current depends on two voltages.** $I_D$ depends on both $V_{GS}$ and $V_{DS}$, so a small change in each adds up (slope times change, for each):
        $$i_d = \frac{\partial I_D}{\partial V_{GS}}\,v_{gs} + \frac{\partial I_D}{\partial V_{DS}}\,v_{ds}$$
        $$i_d = g_m v_{gs} + \frac{v_{ds}}{r_{ds}}$$

        **Step 2: read each term as a circuit element**, both carrying current from drain to source:
        - $g_mv_{gs}$ is a current set by a voltage elsewhere ($v_{gs}$): a **voltage-controlled current source**, arrow from drain to source.
        - $v_{ds}/r_{ds}$ is a current set by the voltage across itself: a **resistor $r_{ds}$** from drain to source.
        - The gate is insulated by the oxide, so **no current** flows into the gate. The gate is a lone terminal whose only job is to set $v_{gs}$.

        !!key The small-signal MOSFET (Lecture 14)
        $$i_d = g_mv_{gs} + \frac{v_{ds}}{r_{ds}}\qquad(\text{flowing drain}\to\text{source inside the device})$$
        A voltage-controlled current source $g_mv_{gs}$ from drain to source, with $r_{ds}$ in parallel. The gate draws nothing. (The lectures and the Exam 1 paper label the controlling voltage $v_x$ and draw the source as $g_mv_x$: same thing, $v_x = v_{gs}$.)
      `, [['nmos', [1, 1], { n: '' }], ['txt', [1.25, -0.1], '$D$', { a: 'l' }], ['txt', [1.25, 2.1], '$S$', { a: 'l' }], ['txt', [-0.15, 1], '$G$', { a: 'r' }],
        ['txt', [2.1, 1], '$\\Longrightarrow$', { a: 'c' }],
        ['G', [4, 0], [4, 2], { n: 'g_mv_{gs}' }], ['w', [4, 0], [5.3, 0]], ['R', [5.3, 0], [5.3, 2], { n: 'r_{ds}' }], ['w', [4, 2], [5.3, 2]], ['term', [4, 0], { n: 'D', side: 'a' }], ['term', [4, 2], { n: 'S', side: 'b' }], ['term', [2.9, 1], { n: 'G\\ (\\text{open})', side: 'b' }]]),
      R(md`
        ### Using the model: a common source amplifier

        Before going on, let us use the model once. A **common source** amplifier: the input $v_{in}$ is on the gate, the source is grounded, and a resistor $R_D$ goes from the drain (the output) up to $V_{DD}$.

        **Step 1: incremental grounds.** $V_{DD}$ is ground. The source is wired to ground.

        **Step 2: which node is which, and what is $v_{gs}$?**
        - Gate: connected to the input, so $v_g = v_{in}$.
        - Source: grounded, so $v_s = 0$.
        - Drain: the output, $v_d = v_{out}$.
        $$v_{gs} = v_g - v_s = v_{in} - 0 = v_{in}$$
      `, F.cs()),
      R(md`
        **Step 3: draw the model** (below). The transistor's dependent source $g_mv_{gs} = g_mv_{in}$ points from the output down to ground; $r_{ds}$ sits beside it; $R_D$ goes from the output up to incremental ground (the old $V_{DD}$).

        **Step 4: KCL at the output.** Add up the currents **leaving** the output node; they must total zero.
        - Down through the dependent source: $g_mv_{in}$.
        - Down through $r_{ds}$ (voltage $v_{out}$ across it): $\dfrac{v_{out}}{r_{ds}}$.
        - Up through $R_D$ to incremental ground (voltage $v_{out}$ across it): $\dfrac{v_{out}}{R_D}$.
        $$g_mv_{in} + \frac{v_{out}}{r_{ds}} + \frac{v_{out}}{R_D} = 0$$

        **Step 5: collect $v_{out}$.** Move the $g_m$ term across:
        $$v_{out}\Big(\frac{1}{r_{ds}} + \frac{1}{R_D}\Big) = -g_mv_{in}$$
        Divide; $\dfrac{1}{1/r_{ds} + 1/R_D}$ is $r_{ds}\parallel R_D$:
        $$A_v = \frac{v_{out}}{v_{in}} = -g_m\,(R_D\parallel r_{ds})$$

        **Example.** $g_m = 2\,\text{mS}$, $R_D = 10\kO$, $r_{ds} = 100\kO$.
        - $R_D\parallel r_{ds} = \dfrac{10\times100}{10 + 100}\kO = \dfrac{1000}{110}\kO = 9.09\kO$.
        - $A_v = -(2\,\text{mS})(9.09\kO) = -18.2$.

        !!intuition What the circuit is doing
        The transistor turns the input voltage into a current $g_mv_{in}$; that current has to flow through whatever resistance sits at the drain, $R_D\parallel r_{ds}$, and that turns it back into a voltage. The minus sign: more gate voltage pulls **more** current down, which pulls the output **down**.
      `, mdl({ g: 'vin', d: 'RDout', s: 'gnd' })),
      R(md`
        ### The same model works for a PMOS

        In a PMOS, the large current flows from **source to drain**, and it is controlled by $V_{SG}$:
        $$I_{SD} = \tfrac12\mu_pC_{ox}\tfrac WL\,(V_{SG} - |V_{TP}|)^2$$

        **Step 1: linearise it exactly as before**, with the PMOS's own natural directions. Its $g_m = \mu_pC_{ox}\tfrac WL(V_{SG} - |V_{TP}|)$ and its $r_{ds} = 1/(\lambda I_{SD})$, both positive numbers:
        $$i_{sd} = g_mv_{sg} + \frac{v_{sd}}{r_{ds}}$$

        **Step 2: flip every direction to the NMOS convention.** A current source-to-drain is minus a current drain-to-source, and the same for voltages:
        $$i_d = -i_{sd},\qquad v_{sg} = -v_{gs},\qquad v_{sd} = -v_{ds}$$

        **Step 3: substitute.**
        $$i_d = -\Big(g_m(-v_{gs}) + \frac{-v_{ds}}{r_{ds}}\Big) = g_mv_{gs} + \frac{v_{ds}}{r_{ds}}$$
        The two minus signs cancel. This is **exactly** the NMOS model: $g_mv_{gs}$ from drain to source, $r_{ds}$ across. In the picture the PMOS's source happens to be on top, so the arrow (drain to source) points **up**.

        **Example.** PMOS, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $W/L = 200$, $I_{SD} = 200\,\mu\text{A}$. Then $200\,\mu = \tfrac12(50\,\mu)(200)V_{ov}^2 = (5\,\text{mA/V}^2)V_{ov}^2$, so $V_{ov} = 0.2\,\text{V}$ and $g_m = 2I_D/V_{ov} = 2\,\text{mS}$. The PMOS needed twice the $W/L$ of the NMOS above for the same $g_m$, because $\mu_p C_{ox}$ is half of $\mu_n C_{ox}$.

        So every result in this unit (diode $1/g_m$, degeneration, cascodes) holds for PMOS with no changes.
      `, [['pmos', [1, 1], { n: '' }], ['txt', [1.25, -0.1], '$S$', { a: 'l' }], ['txt', [1.25, 2.1], '$D$', { a: 'l' }], ['txt', [-0.15, 1], '$G$', { a: 'r' }],
        ['txt', [2.1, 1], '$\\Longrightarrow$', { a: 'c' }],
        ['G', [4, 2], [4, 0], { n: 'g_mv_{gs}' }], ['w', [4, 0], [5.3, 0]], ['R', [5.3, 0], [5.3, 2], { n: 'r_{ds}' }], ['w', [4, 2], [5.3, 2]], ['term', [4, 0], { n: 'S', side: 'a' }], ['term', [4, 2], { n: 'D', side: 'b' }], ['term', [2.9, 1], { n: 'G\\ (\\text{open})', side: 'b' }]]),
      Q(md`The input of a PMOS common source stage rises by 10 mV. Does the PMOS's drain current (out of its drain, toward the load) go up or down?`,
        ['Down: $v_{sg}$ falls by 10 mV, so the PMOS conducts less.', 'Up: $g_m$ is positive.', 'It depends on $r_{ds}$.', 'Up, because the PMOS model has the opposite sign.'], 0,
        [null, 'For a PMOS the controlling voltage is $v_{sg}$, which falls when the gate rises.', '$r_{ds}$ only matters if the drain voltage changes; the direction comes from $v_{sg}$.', 'The model has the *same* sign: $i_d = g_mv_{gs}$, and $v_{gs} = +10\\,\\text{mV}$ makes the drain-to-source current grow, i.e. less current comes out of the drain.'],
        md`Gate up means $v_{sg}$ down, so less current flows source to drain. In the shared model, $i_d$ (drain to source) $= g_mv_{gs} > 0$, which is the same statement: less current leaving the drain toward the load.`),
      R(md`
        ### When can you drop $r_{ds}$?

        !!trap $r_{ds}\ne\infty$ on Exam 2
        Exam 1 set $\lambda = 0$ ($r_{ds} = \infty$). Most Exam 2 problems say "You may **NOT** assume $r_{ds} = \infty$" but "$g_mr_{ds}\gg 1$". That means: keep $r_{ds}$ where it is the only thing there (a current-source load, the output of a cascode), drop it where it sits next to something much smaller (in parallel with $1/g_m$).

        **Example of the rule.** With $g_m = 2\,\text{mS}$ and $r_{ds} = 100\kO$: $\dfrac1{g_m}\parallel r_{ds} = \dfrac{0.5\times100}{100.5}\kO = 497.5\,\Omega$, within 0.5% of $1/g_m = 500\,\Omega$. Dropping $r_{ds}$ there is fine. But if $r_{ds}$ is the **only** thing at a node, dropping it would turn $100\kO$ into $\infty$: wrong.
      `),
      G('e2_gm', { need: 3 }),
      P({
        id: 'e2u6-gm-meas', src: 'Practice Exam 1 · Problem 1(b)', title: 'Measure $g_m$ from two node voltages',
        q: md`In the source follower below, $v_i = 50\,\text{mV}$ at the gate, the source moves by $v_s = 40\,\text{mV}$, and $R_S = 1\kO$. Assume $r_{ds}\to\infty$. Find $i_d$ and $g_m$.`,
        fig: [['nmos', [1, 1]], ['acg', [1, 0], { dir: 'u' }], ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_i', side: 'l' }], ['gnd', [-0.6, 2.4]], ['w', [1, 2], [1.8, 2]], ['term', [1.8, 2], { n: 'v_s' }], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]], ['iarr', [1, -0.3], 'd', { n: 'i_d', side: 'l', off: [-14, 0] }]],
        parts: [{ lbl: 'i_d', unit: 'µA', ans: 40 }, { lbl: 'g_m', unit: 'mS', ans: 4 }],
        hints: [md`Draw the model: drain at incremental ground, gate on $v_i$, source on $R_S$. The gate draws no current, so all of $i_d$ flows through $R_S$.`, md`$v_{gs} = v_g - v_s = v_i - v_s$, and $i_d = g_mv_{gs}$.`],
        sol: md`**Step 1: the model.** Drain at incremental ground (the triangle), gate on $v_i$, source on $R_S$ to ground. With $r_{ds}\to\infty$ the transistor is just $g_mv_{gs}$ from drain to source.

**Step 2: $i_d$.** The current coming down out of the source has only one place to go: $R_S$. So $R_S$ works as an ammeter:
$$i_d = \frac{v_s}{R_S} = \frac{40\,\text{mV}}{1\kO} = 40\,\mu\text{A}$$

**Step 3: $v_{gs}$.** The gate is at $v_i$, the source at $v_s$:
$$v_{gs} = v_i - v_s = 50 - 40 = 10\,\text{mV}$$

**Step 4: $g_m$.**
$$g_m = \frac{i_d}{v_{gs}} = \frac{40\,\mu\text{A}}{10\,\text{mV}} = 4\,\text{mS}$$

**Check** with the follower formula (KCL at the source, $g_m(v_i - v_s) = v_s/R_S$, so $v_s/v_i = g_mR_S/(1 + g_mR_S)$): $\dfrac{4}{1 + 4} = 0.8$, and $40/50 = 0.8$ ✓.`,
      }),
      R(md`
        ### Summary

        | Quantity | Formula | Example ($\mu_nC_{ox} = 100\,\mu$, $W/L = 100$, $I_D = 200\,\mu\text{A}$) |
        |---|---|---|
        | Overdrive | $V_{ov} = \sqrt{2I_D/(\mu C_{ox}W/L)}$ | $0.2\,\text{V}$ |
        | Transconductance | $g_m = \mu C_{ox}\tfrac WL V_{ov} = \dfrac{2I_D}{V_{ov}} = \sqrt{2\mu C_{ox}\tfrac WL I_D}$ | $2\,\text{mS}$ ($1/g_m = 500\,\Omega$) |
        | Output resistance | $r_{ds} = 1/(\lambda I_D)$ | $100\kO$ at $\lambda = 0.05\,\text{V}^{-1}$ |
        | Intrinsic gain | $g_mr_{ds}$ | 200 |
        | The model (NMOS **and** PMOS) | $i_d = g_mv_{gs} + v_{ds}/r_{ds}$, drain to source; gate open | |

        **Numbers to have in your head** (course parameters):

        | Situation | Result |
        |---|---|
        | $I_D = 1\,\text{mA}$, $V_{ov} = 0.2\,\text{V}$ | $g_m = 10\,\text{mS}$, $1/g_m = 100\,\Omega$ |
        | $I_D = 100\,\mu\text{A}$, $V_{ov} = 0.2\,\text{V}$ | $g_m = 1\,\text{mS}$, $1/g_m = 1\,\text{k}\Omega$ |
        | NMOS $W/L = 500$ | $K = \tfrac12(100\,\mu)(500) = 25\,\text{mA/V}^2$ |
        | $g_mr_{ds}$ ("intrinsic gain") | typically 20 to 1000; exams say "$g_mr_{ds}\gg 1$" |
      `),
    ],
  });

  // ================================================================================================ lesson 3
  L({
    id: 'e2-u6-test', title: 'The test-source method', ref: 'Lecture 15',
    steps: [
      R(md`
        ### The plan for this lesson

        Almost every Exam 2 question asks "what resistance do you see looking into this node?". The reason: once you know the resistance at each node, gains come out as (current) × (resistance), and Units 7 and 8 are built entirely from that. This lesson gives the one method that answers every such question, and uses it on the four basic cases:

        1. looking into a transistor's **source**;
        2. looking into its **drain**;
        3. looking into the drain when a resistor sits under the source (**degeneration**);
        4. looking into a **diode-connected** transistor.

        **The method.** "Resistance looking into a node" means: turn off every independent signal source, connect a **test voltage** $v_t$ to the node, find the current $i_t$ it pushes in, and take $R = v_t/i_t$. Dependent sources ($g_mv_{gs}$) **stay**: they are not signals, they are part of the transistor.

        !!method Four steps
        1. Draw the small-signal circuit; kill $v_{in}$ (short it) and every bias.
        2. Put $v_t$ at the node. Label the few node voltages that are not ground.
        3. Write $v_{gs}$ **in terms of node voltages** ($v_g - v_s$). This is where most mistakes happen.
        4. KCL at the node (and at one more node if needed). Solve for $v_t/i_t$.
      `),
      R(md`
        ### Case 1: looking into the source

        The transistor's gate is held by a bias (the triangle) and its drain is on $V_{DD}$. We look up into the source.

        **Step 1: incremental grounds.** The gate is on a fixed bias: $v_g = 0$. The drain is on $V_{DD}$: $v_d = 0$.

        **Step 2: the test source.** Connect $v_t$ to the source, so $v_s = v_t$.

        **Step 3: $v_{gs}$.**
        $$v_{gs} = v_g - v_s = 0 - v_t = -v_t$$
      `, F.source()),
      R(md`
        **Step 4: draw the model** (below): $g_mv_{gs}$ from drain (at incremental ground) to source (at $v_t$), $r_{ds}$ beside it, gate grounded.

        **Step 5: current through the transistor, drain to source.** Use the model with $v_{gs} = -v_t$ and $v_{ds} = v_d - v_s = 0 - v_t$:
        $$i_{ds} = g_mv_{gs} + \frac{v_{ds}}{r_{ds}} = g_m(-v_t) + \frac{-v_t}{r_{ds}} = -\Big(g_m + \frac1{r_{ds}}\Big)v_t$$

        **Step 6: KCL at the source node.** Two currents flow **into** this node: $i_t$ from the test source, and $i_{ds}$ coming down through the transistor. Nothing else touches it, so they sum to zero:
        $$i_t + i_{ds} = 0\quad\Rightarrow\quad i_t = -i_{ds} = \Big(g_m + \frac1{r_{ds}}\Big)v_t$$

        **Step 7: the resistance.**
        $$R_S = \frac{v_t}{i_t} = \frac{1}{g_m + 1/r_{ds}} = \frac{1}{g_m}\parallel r_{ds}\approx\frac{1}{g_m}$$

        **Example.** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$: $R_S = \dfrac{1}{2\,\text{m} + 0.01\,\text{m}} = \dfrac{1}{2.01\,\text{mS}} = 497.5\,\Omega\approx\dfrac1{g_m} = 500\,\Omega$.

        !!intuition Why a source looks like $1/g_m$
        Pushing the source up by $v$ *reduces* $v_{gs}$ by $v$, so the channel lets $g_mv$ less current flow down. Less current flowing down out of the node is the same as $g_mv$ flowing into it. A node where $v$ volts pushes in $g_mv$ amps *is* a resistor $1/g_m$. Hold on to this picture: every impedance in Unit 7 is the same argument.
      `, mdl({ g: 'gnd', d: 'gnd', s: 'test' })),
      R(md`
        ### Case 2: looking into the drain

        Now the gate is on a bias and the source is grounded, and we look down into the drain.

        **Step 1: node voltages.** $v_g = 0$ (bias), $v_s = 0$ (ground), $v_d = v_t$.

        **Step 2: $v_{gs}$.**
        $$v_{gs} = 0 - 0 = 0$$
        So the dependent source is $g_m\times0 = 0$: it carries no current, as if it were not there.

        **Step 3: what is left.** Only $r_{ds}$, from $v_t$ to ground:
        $$i_t = \frac{v_t}{r_{ds}}\quad\Rightarrow\quad R_D = r_{ds}$$

        **Example.** $r_{ds} = 100\kO$, so $R_D = 100\kO$: 200 times the $500\,\Omega$ seen at the source of the same transistor.

        !!intuition Sources are low, drains are high
        Moving the source changes $v_{gs}$, so the transistor fights back with $g_m$: a low resistance. Moving the drain does not change $v_{gs}$, so only the weak $r_{ds}$ slope responds: a high resistance.
      `, mdl({ g: 'gnd', s: 'gnd', d: 'test' })),
      R(md`
        ### Case 3: setting up the degenerated drain

        Put a resistor $R_S$ between the source and ground, gate still on a bias, and look into the drain. Try it yourself in the next problem; here is the setup.

        **Step 1: node voltages.** $v_g = 0$, $v_d = v_t$, and the source node now **moves**: call its voltage $v_s$.

        **Step 2: $v_{gs}$.**
        $$v_{gs} = 0 - v_s = -v_s$$

        **Step 3: the model** is drawn below. Notice: the gate draws no current, so the test current $i_t$ goes down through the transistor (dependent source plus $r_{ds}$) and then **all** of it goes through $R_S$. That gives $v_s = i_tR_S$.
      `, mdl({ g: 'gnd', s: 'RS', d: 'test' })),
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
        sol: md`**Step 1: the source voltage.** All of $i_t$ flows through $R_S$: $v_s = i_tR_S$. So $v_{gs} = 0 - v_s = -i_tR_S$.

**Step 2: current through the transistor**, drain to source, equals $i_t$:
$$i_t = g_mv_{gs} + \frac{v_d - v_s}{r_{ds}} = -g_mi_tR_S + \frac{v_t - i_tR_S}{r_{ds}}$$

**Step 3: multiply through by $r_{ds}$.**
$$i_tr_{ds} = -g_mr_{ds}R_S\,i_t + v_t - i_tR_S$$

**Step 4: collect the $i_t$ terms on the left.**
$$i_t\big(r_{ds} + R_S + g_mr_{ds}R_S\big) = v_t$$
$$R_{DN} = \frac{v_t}{i_t} = r_{ds} + R_S + g_mr_{ds}R_S$$

**Read it:** the drain sees $r_{ds}$, plus $R_S$ in series, plus $g_mr_{ds}R_S$: the source resistance magnified by the intrinsic gain. Check: $R_S = 0$ gives back Case 2, $r_{ds}$ ✓. This is Problem Set 5 (c), and the one result you should be able to write in your sleep.`,
      }),
      P({
        id: 'e2u6-deg-num', title: 'Put numbers in: the degenerated drain',
        q: md`Same circuit: $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$. Find $R_{DN}$, and the factor by which adding $R_S$ raised it above plain $r_{ds}$.`,
        fig: F.drainDeg(),
        parts: [{ lbl: 'R_{DN}', unit: 'kΩ', ans: 301 }, { lbl: 'R_{DN}/r_{ds}', unit: '', ans: 3.01 }],
        hints: [md`$R_{DN} = r_{ds} + R_S + g_mr_{ds}R_S$. Work out $g_mr_{ds}$ first.`],
        sol: md`**Step 1:** $g_mr_{ds} = (2\,\text{mS})(100\kO) = 200$.

**Step 2:** $g_mr_{ds}R_S = 200\times1\kO = 200\kO$.

**Step 3:** $R_{DN} = 100 + 1 + 200 = 301\kO$.

**Step 4:** $301/100 = 3.01$. A mere $1\kO$ under the source tripled the drain resistance, because it is multiplied by $g_mr_{ds} = 200$. (Same as $r_{ds}(1 + g_mR_S) + R_S = 100(1 + 2) + 1$.)`,
      }),
      R(md`
        ### Case 4: setting up the diode-connected transistor

        A **diode-connected** transistor has its gate wired to its own drain; the source is grounded. Look into the drain (which is also the gate).

        **Step 1: node voltages.** The test source sits on the drain, and the gate is the same node: $v_d = v_g = v_t$. The source is grounded: $v_s = 0$.

        **Step 2: $v_{gs}$.**
        $$v_{gs} = v_t - 0 = v_t$$

        **Step 3: the model** is drawn below; the wire from the gate terminal runs over to the drain. Finish it in the next problem.
      `, mdl({ g: 'd', s: 'gnd', d: 'test' })),
      P({
        id: 'e2u6-derive-diode', title: 'Your turn: the diode-connected transistor',
        q: md`Gate tied to drain, source grounded. Find the resistance looking in (keep $r_{ds}$).`,
        fig: F.diode(),
        parts: [E2.ex('rds || 1/gm', ['gm', 'rds'], 'R_{diode}', { exact: true })],
        hints: [md`With the gate on the drain, $v_{gs} = v_t$.`],
        sol: md`**Step 1:** $v_{gs} = v_t - 0 = v_t$ and $v_{ds} = v_t$.

**Step 2:** all of $i_t$ goes down through the transistor:
$$i_t = g_mv_{gs} + \frac{v_{ds}}{r_{ds}} = g_mv_t + \frac{v_t}{r_{ds}} = \Big(g_m + \frac1{r_{ds}}\Big)v_t$$

**Step 3:**
$$R = \frac{v_t}{i_t} = \frac{1}{g_m + 1/r_{ds}} = \frac1{g_m}\parallel r_{ds}\approx\frac1{g_m}$$

**Example:** $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$ gives $497.5\,\Omega$.

Same number as looking into a source: in both cases the test voltage appears across gate and source with a full $\pm v_t$. Here the dependent source carries $g_mv_t$ with $v_t$ across it, so it simply *is* a resistor $1/g_m$.`,
      }),
      R(md`
        ### Summary

        The method, every time: kill the sources, put $v_t$ on the node, write $v_{gs} = v_g - v_s$, KCL, solve $v_t/i_t$.

        | Looking into | Gate | Other terminal | $v_{gs}$ | Resistance | $g_m = 2\,\text{mS}$, $r_{ds} = 100\kO$, $R_S = 1\kO$ |
        |---|---|---|---|---|---|
        | Source | incremental ground | drain at incremental ground | $-v_t$ | $\dfrac1{g_m}\parallel r_{ds}\approx\dfrac1{g_m}$ | $497.5\,\Omega$ |
        | Drain | incremental ground | source grounded | $0$ | $r_{ds}$ | $100\kO$ |
        | Drain, degenerated | incremental ground | $R_S$ to ground | $-i_tR_S$ | $r_{ds} + R_S + g_mr_{ds}R_S$ | $301\kO$ |
        | Diode (gate on drain) | on the drain | source grounded | $v_t$ | $\dfrac1{g_m}\parallel r_{ds}\approx\dfrac1{g_m}$ | $497.5\,\Omega$ |
        | Gate | | | | $\infty$ (no gate current) | $\infty$ |
      `),
    ],
  });
})();

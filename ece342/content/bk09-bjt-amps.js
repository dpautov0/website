/* Book Chapter 9 — BJT amplifiers. The common emitter (G_M, R_out, R_in; a source resistance; r_o; an active load), the
   common emitter with R_E (Lecture 24's exact G_m, then the r_e picture), the common base and the emitter follower
   (Lecture 24's G_m, R_in, R_out), the cascode, real amplifiers with bias networks and capacitors (DC -> g_m -> gain),
   and chains that mix BJTs and MOSFETs. Every formula and number here was checked against an independent nodal solve
   (and a DC solve for bias points). Figures: window.BK6 (js/gens-bk-a6.js); drills: GENS.bk9_*. */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const F = window.BK6;
  const ss = F.ss;
  const L = (l) => BK.lesson('bk09', l);
  const ex = (...a) => BK.ex(...a);

  // ================================================================== 9.1 the common emitter
  L({
    id: 'bk09-ce', title: 'The common emitter', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Chapter 9 at a glance

        Chapter 8 found what each BJT terminal looks like. This chapter puts those pieces to work: the four single-transistor amplifiers of Lecture 24 (common emitter, common emitter with $R_E$, common base, emitter follower), the cascode, real circuits with bias networks and capacitors, and chains of stages that mix BJTs and MOSFETs.

        **What you need first.** [Chapter 8](#/l/bk08-base) (the terminal resistances) and the gain method of [Chapter 4](#/l/bk04-norton), in one line: short the output and find $G_M = i_{out}/v_{in}$ with $i_{out}$ flowing **from the short into the stage**; turn the input off and find $R_{out}$; then $A_v = -G_MR_{out}$.

        **What you will be able to do.** Derive $G_M$, $R_{out}$, $R_{in}$ and $A_v$ for every stage from the hybrid-$\pi$ model, exactly as Lecture 24 does; check each one with the quick $r_e$ picture of The Art of Electronics; and do a full exam problem from the DC bias to the number.

        | Stage | $G_M$ | $R_{out}$ ($r_o\to\infty$) | $R_{in}$ | $A_v$ |
        |---|---|---|---|---|
        | common emitter | $g_m$ | $R_C$ | $r_\pi$ | $-g_mR_C$ |
        | with $R_E$ | $\dfrac{g_m}{1 + \frac{\beta + 1}{\beta}g_mR_E}$ | $R_C$ | $r_\pi + (\beta + 1)R_E$ | $\approx-\dfrac{R_C}{r_e + R_E}$ |
        | common base | $\dfrac{-1}{\frac{R_B + r_\pi}{\beta} + \frac{\beta + 1}{\beta}R_E}$ | $R_C$ | $R_E + \dfrac{R_B + r_\pi}{\beta + 1}$ | $\approx+\dfrac{R_C}{R_{in}}$ |
        | emitter follower | $\dfrac{-(\beta + 1)}{r_\pi + R_B}$ | $R_E\parallel\dfrac{r_\pi + R_B}{\beta + 1}$ | $R_B + r_\pi + (\beta + 1)R_E$ | $\approx1$ |

        Two notes on Lecture 24's notation. It writes $G_m$ on some pages and $G_M$ on others for the same short-circuit transconductance; we write $G_M$ throughout. And it calls the test source $V_T$, $I_T$; we write $v_t$, $i_t$, to keep $V_T = 25\,\text{mV}$ for the thermal voltage.
      `),
      RF(md`
        ### The question

        The common emitter is *the* BJT amplifier: large, inverting gain, and the most likely stage in Problem 1 of the exam. The signal enters at the **base**, leaves at the **collector**, and the **emitter** sits on its rail, common to input and output. We want $G_M$, $R_{out}$, $R_{in}$ and the gain, first in Lecture 24's ideal form, then with a source resistance, $r_o$, and an active load.

        [[fig:c]]
      `, { c: { fig: F.amp({ kind: 'ce' }), cap: 'The common emitter: input at the base, output at the collector, emitter grounded.' } }),
      R(md`
        ### The physical picture

        The input wiggles $V_{BE}$. The collector current follows exponentially, so a small wiggle $v_{be}$ makes $i_c = g_mv_{be}$: the BJT is a **voltage-controlled current source**. $R_C$ turns that current back into a voltage: $v_{out} = -i_cR_C$.

        The minus sign is physical. More base voltage means more collector current, more drop across $R_C$, and the collector falls.

        A lovely consequence (The Art of Electronics): since $g_m = I_C/V_T$,
        $$|A_v| = g_mR_C = \frac{I_CR_C}{V_T} = \frac{\text{DC voltage across }R_C}{25\,\text{mV}}$$
        Drop $5\,\text{V}$ across $R_C$ and the gain is 200, whatever the current. A MOSFET's $g_m = 2I_D/V_{ov}$ gives $2I_DR_D/V_{ov}$ instead, with $V_{ov}$ (a few hundred mV) in place of $25\,\text{mV}$: that is why BJT stages have so much more gain.
      `),
      RF(md`
        ### $G_M$: short the output (Lecture 24)

        Replace the transistor by its model ($r_o\to\infty$), put $v_{in}$ on the base, ground the emitter, and short the collector to ground. $V_{CC}$ is incremental ground, so $R_C$ runs from the collector to ground.

        [[fig:m]]

        1. **$R_C$ carries nothing:** both its ends are at 0 V (one is ground, the other is shorted to ground).
        2. **The control voltage:** the base is at $v_{in}$ and the emitter at 0, so $v_\pi = v_{in}$.
        3. **The output current:** the only element that can carry current into the collector node is the controlled source, so everything it draws comes from the short: $i_{out} = g_mv_\pi = g_mv_{in}$.

        $$G_M = \frac{i_{out}}{v_{in}} = g_m$$
        Positive, as for every common-source or common-emitter stage: the output current flows from the short **into** the stage.
      `, { m: { fig: ss({ b: 'vin', e: 'gnd', c: 'RCshort' }), cap: 'Finding $G_M$: output shorted, $i_{out}$ flows from the short into the collector.' } }),
      RF(md`
        ### $R_{out}$ and $R_{in}$ (Lecture 24)

        **$R_{out}$:** turn $v_{in}$ off (the base is grounded) and put a test source on the collector. Now $v_\pi = 0$, the controlled source carries nothing, and the test source sees only $R_C$: $i_t = v_t/R_C$, so $R_{out} = R_C$.

        [[fig:o]]

        **$R_{in}$:** a test source on the base sees $r_\pi$ to the grounded emitter, and nothing else ([Chapter 8](#/l/bk08-base)): $R_{in} = r_\pi$.

        [[fig:i]]

        !!key The common emitter (Lecture 24)
          $$G_M = g_m,\qquad R_{out} = R_C,\qquad R_{in} = r_\pi,\qquad A_v = -G_MR_{out} = -g_mR_C$$
      `, { o: { fig: ss({ b: 'gnd', e: 'gnd', c: 'RCtest' }), cap: '$R_{out}$: input off, so $v_\\pi = 0$ and only $R_C$ remains.' }, i: { fig: ss({ b: 'test', e: 'gnd', c: 'RC' }), cap: '$R_{in}$: the base sees $r_\\pi$.' } }),
      R(md`
        ### Check it

        - **Sign:** inverting, as the physical picture said. ✓
        - **Units:** siemens times ohms. ✓
        - **One number:** $I_C = 1\,\text{mA}$, $R_C = 5\kO$: $A_v = -40\,\text{mS}\times5\kO = -200$; and $I_CR_C/V_T = 5\,\text{V}/25\,\text{mV} = 200$. ✓
        - **MOSFET twin:** the [common source](#/l/bk04-cs), $-g_mR_D$ with $R_{in} = \infty$. The only visible difference is $R_{in} = r_\pi$.
      `),
      RF(md`
        ### With a source resistance $R_B$: the input divider

        Real sources have resistance. Put $R_B$ between $v_{in}$ and the base.

        [[fig:c]]

        Short the output again. The emitter is grounded, so the base current flows through $R_B$ and $r_\pi$ in series: $i_b = v_{in}/(R_B + r_\pi)$ and $v_\pi = i_br_\pi = v_{in}\dfrac{r_\pi}{R_B + r_\pi}$. Then
        $$G_M = g_m\frac{r_\pi}{R_B + r_\pi} = \frac{\beta}{R_B + r_\pi}$$
        $R_{out}$ does not change (input off still means $v_\pi = 0$), so $A_v = -\dfrac{\beta R_C}{R_B + r_\pi}$, and the source sees $R_{in} = R_B + r_\pi$.

        [[fig:m]]

        !!trap The MOSFET habit that costs points
          A resistor in series with a gate does nothing. A resistor in series with a **base** forms a divider with $r_\pi$. With $R_B = r_\pi$ the gain halves.
      `, { c: { fig: F.amp({ kind: 'ce', RB: true }), cap: 'A source resistance $R_B$ in front of the base.' }, m: { fig: ss({ b: 'vinRB', e: 'gnd', c: 'RCshort' }), cap: '$R_B$ and $r_\\pi$ divide $v_{in}$ before it reaches $v_\\pi$.' } }),
      RF(md`
        ### With $r_o$, and with an active load

        **$r_o$.** With the output shorted, $r_o$ has 0 V across it and carries nothing, so $G_M$ is unchanged. With the input off it sits in parallel with $R_C$: $R_{out} = R_C\parallel r_o$, and $A_v = -g_m(R_C\parallel r_o)$.

        **An active load.** Replace $R_C$ by a PNP current source (base held). Looking up into its collector you see $r_{o2}$ ([Chapter 8](#/l/bk08-collector)), so
        $$A_v = -g_m(r_{o1}\parallel r_{o2})$$
        With an ideal current source the ceiling is the **intrinsic gain** $g_mr_o = \dfrac{I_C}{V_T}\cdot\dfrac{V_A}{I_C} = \dfrac{V_A}{V_T}$: $100\,\text{V}/25\,\text{mV} = 4000$, at any current. A MOSFET's intrinsic gain is $2/(\lambda V_{ov})$, typically tens.

        [[fig:a]]
      `, { a: { fig: F.amp({ kind: 'ce', load: 'pnp' }), cap: 'A common emitter with a PNP current-source load: $A_v = -g_m(r_{o1}\\parallel r_{o2})$.' } }),
      R(md`
        ### Worked example

        $I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$, $R_C = 10\kO$, and a source resistance $R_B = 5\kO$. Find $G_M$, $R_{out}$, $A_v$ and the resistance the source sees.

        1. $g_m = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$, $r_\pi = 100/20\,\text{mS} = 5\kO$, $r_o = 50\,\text{V}/0.5\,\text{mA} = 100\kO$.
        2. $G_M = g_m\dfrac{r_\pi}{R_B + r_\pi} = 20\,\text{mS}\times\dfrac{5}{10} = 10\,\text{mS}$.
        3. $R_{out} = R_C\parallel r_o = 10\parallel100 = 9.09\kO$.
        4. $A_v = -G_MR_{out} = -10\,\text{mS}\times9.09\kO = -90.9$.
        5. The source sees $R_B + r_\pi = 10\kO$.

        !!mistake Common mistakes
          - **$G_M = g_m$ with a source resistance.** $R_B$ and $r_\pi$ divide the input first.
          - **A positive gain.** The common emitter inverts.
          - **Ignoring $r_o$ when $V_A$ is given,** or when the load is a current source (then $r_o$ *is* the output resistance).
          - **$R_{in} = \infty$.** A base draws current: $R_{in} = r_\pi$.
      `),
      Q(md`A common emitter drops $4\,\text{V}$ (DC) across its collector resistor. Without knowing $I_C$ or $R_C$ separately, what is $|A_v|$ (with $r_o\to\infty$)?`,
        [md`$160$`, md`$40$`, md`$4$`, md`It depends on $I_C$`], 0,
        [null, md`That is $g_m$ in mS at $1\,\text{mA}$. The gain is $I_CR_C/V_T$.`, md`That is the DC drop in volts, not a gain.`, md`$g_mR_C = (I_C/V_T)R_C$: only the product $I_CR_C$ matters.`],
        md`$|A_v| = g_mR_C = \dfrac{I_CR_C}{V_T} = \dfrac{4\,\text{V}}{25\,\text{mV}} = 160$.`),
      Q(md`A common emitter is driven from a source whose resistance equals $r_\pi$. Compared with driving the base directly, the gain is...`,
        [md`halved`, md`unchanged`, md`doubled`, md`divided by $\beta$`], 0,
        [null, md`True for a MOSFET gate, which draws nothing. A base draws current, so $R_B$ and $r_\pi$ divide $v_{in}$.`, md`A series resistor can only lose signal here.`, md`$G_M = \beta/(R_B + r_\pi)$, and with $R_B = r_\pi$ that is exactly $g_m/2$.`],
        md`$v_\pi = v_{in}r_\pi/(r_\pi + R_B) = v_{in}/2$: half the drive, half the gain.`),
      Q(md`What is the largest gain a single BJT common emitter can reach with $V_A = 50\,\text{V}$?`,
        [md`About $2000$, at any bias current`, md`About $200$`, md`It grows without limit as $I_C$ grows`, md`About $\beta$`], 0,
        [null, md`That is a typical resistor-load gain. With an ideal current-source load the output resistance is $r_o$.`, md`$g_m$ grows with $I_C$, but $r_o = V_A/I_C$ shrinks just as fast.`, md`$\beta$ is a current gain; the voltage gain ceiling is $V_A/V_T$.`],
        md`$g_mr_o = V_A/V_T = 50/0.025 = 2000$: the intrinsic gain, independent of $I_C$.`),
      P({
        id: 'bk09-ce-1', title: 'Warm-up: the bare common emitter',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 120$, $R_C = 3\kO$, $r_o\to\infty$, input directly on the base. Find $g_m$, $G_M$, $R_{out}$, $R_{in}$ and $A_v$.`,
        fig: F.amp({ kind: 'ce' }),
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 80 }, { lbl: 'G_M', unit: 'mS', ans: 80 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 3 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 1.5 }, { lbl: 'A_v', unit: '', ans: -240, traps: [{ v: 240, msg: 'The common emitter inverts: more base voltage, more drop across $R_C$.' }] }],
        sol: md`$g_m = 2\,\text{mA}/25\,\text{mV} = 80\,\text{mS} = G_M$. $R_{out} = R_C = 3\kO$. $R_{in} = r_\pi = 120/80\,\text{mS} = 1.5\kO$. $A_v = -80\,\text{mS}\times3\kO = -240$ (check: $I_CR_C/V_T = 6\,\text{V}/25\,\text{mV} = 240$).`,
      }),
      P({
        id: 'bk09-ce-2', title: 'Source resistance and $r_o$',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$, $R_C = 4\kO$, source resistance $R_B = 2.5\kO$. Find $G_M$, $R_{out}$ and $A_v$.`,
        fig: F.amp({ kind: 'ce', RB: true }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 20, traps: [{ v: 40, msg: 'That is $g_m$. $R_B$ and $r_\\pi$ divide the input first.' }] }, { lbl: 'R_{out}', unit: 'kΩ', ans: 3.84615 }, { lbl: 'A_v', unit: '', ans: -76.923 }],
        hints: [md`$r_\pi = 2.5\kO = R_B$: half of $v_{in}$ reaches $v_\pi$.`, md`With the output shorted $r_o$ carries nothing; with the input off it is in parallel with $R_C$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 100\kO$.
2. $G_M = g_m\,r_\pi/(r_\pi + R_B) = 40\times0.5 = 20\,\text{mS}$.
3. $R_{out} = 4\parallel100 = 3.846\kO$.
4. $A_v = -20\,\text{mS}\times3.846\kO = -76.9$.`,
      }),
      P({
        id: 'bk09-ce-3', title: 'The gain, typed',
        q: md`Type $A_v$ for a common emitter with source resistance $R_B$, collector resistor $R_C$ and $r_o$ included. Use \`gm\`, \`rpi\`, \`beta\`, \`RC\`, \`ro\`, \`RB\`.`,
        fig: F.amp({ kind: 'ce', RB: true }),
        parts: [ex('-gm*(RC || ro)*rpi/(rpi + RB)', ['gm', 'rpi', 'beta', 'RC', 'ro', 'RB'], 'A_v', { exact: true })],
        sol: md`$$A_v = -g_m(R_C\parallel r_o)\frac{r_\pi}{r_\pi + R_B} = -\frac{\beta(R_C\parallel r_o)}{r_\pi + R_B}$$ (the same thing, since $g_mr_\pi = \beta$).`,
      }),
      P({
        id: 'bk09-ce-4', title: 'An active load',
        q: md`$Q_1$ (NPN, $V_{A,n} = 80\,\text{V}$) and its PNP current-source load $Q_2$ ($V_{A,p} = 40\,\text{V}$) both carry $0.5\,\text{mA}$. Find $r_{o1}$, $r_{o2}$, $R_{out}$ and $A_v$.`,
        fig: F.amp({ kind: 'ce', load: 'pnp' }),
        parts: [{ lbl: 'r_{o1}', unit: 'kΩ', ans: 160 }, { lbl: 'r_{o2}', unit: 'kΩ', ans: 80 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 53.333 }, { lbl: 'A_v', unit: '', ans: -1066.67 }],
        sol: md`$r_{o1} = 80/0.5\,\text{mA} = 160\kO$, $r_{o2} = 80\kO$, $R_{out} = 160\parallel80 = 53.3\kO$. $g_m = 20\,\text{mS}$, so $A_v = -20\,\text{mS}\times53.3\kO = -1067$. (In general $A_v = -\dfrac{1}{V_T}\cdot\dfrac{V_{A,n}V_{A,p}}{V_{A,n} + V_{A,p}}$: the current cancels.)`,
      }),
      P({
        id: 'bk09-ce-5', title: 'Gain from the DC drop',
        q: md`You need $A_v = -100$ from a common emitter with a resistor load, and $V_{CC} = 10\,\text{V}$. What DC voltage must drop across $R_C$? With $I_C = 0.5\,\text{mA}$, what $R_C$ is that? Where does the collector sit (DC)?`,
        parts: [{ lbl: 'V_{RC}', unit: 'V', ans: 2.5 }, { lbl: 'R_C', unit: 'kΩ', ans: 5 }, { lbl: 'V_C', unit: 'V', ans: 7.5 }],
        sol: md`$|A_v| = I_CR_C/V_T$, so $I_CR_C = 100\times25\,\text{mV} = 2.5\,\text{V}$, $R_C = 2.5\,\text{V}/0.5\,\text{mA} = 5\kO$, and $V_C = 10 - 2.5 = 7.5\,\text{V}$. A gain of 200 would need $5\,\text{V}$ across $R_C$, leaving less room for the output to swing.`,
      }),
      R(md`
        ### Drill

        Common emitters, NPN and PNP, with source resistances, $r_o$ and active loads. Find $g_m$ and $r_\pi$ first, then $G_M$, then $R_{out}$.
      `),
      G('bk9_ce', { need: 4 }),
    ],
  });

  // ================================================================== 9.2 the common emitter with R_E
  const tFig = [
    ['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_C', side: 'l' }], ['npn', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_E', side: 'l' }], ['gnd', [1, 3.2]],
    ['txt', [1.3, 2.25], '$\\leftarrow v_e\\approx v_{in}$', { a: 'l' }], ['txt', [1.3, 0.3], '$\\leftarrow i_c = \\alpha i_e$', { a: 'l' }], ['iarr', [1, 2.75], 'd', { n: 'i_e', side: 'r', off: [16, 0] }],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
  ];
  L({
    id: 'bk09-cedeg', title: 'The common emitter with $R_E$', ref: 'Lecture 24',
    steps: [
      RF(md`
        ### The question

        Put a resistor $R_E$ between the emitter and ground. The gain drops, but it becomes predictable, set by two resistors instead of by $g_m$; the input resistance rises by $(\beta + 1)R_E$; and the stage becomes more linear. Lecture 24 derives the exact $G_M$ with one KVL; The Art of Electronics writes the gain in one line with $r_e$. We do both and show they are the same.

        [[fig:c]]
      `, { c: { fig: F.amp({ kind: 'ce', RE: true }), cap: 'The common emitter with emitter degeneration.' } }),
      R(md`
        ### The physical picture

        $R_E$ is negative feedback. Raise $v_{in}$: the collector current rises, the emitter current rises, and the emitter climbs by $i_eR_E$, which subtracts from $v_{be}$. **The emitter follows the base**, so most of $v_{in}$ ends up across $R_E$ instead of across the junction.

        In the T-model view ([Chapter 7](#/l/bk07-tmodel)), $v_{in}$ is applied across the junction's $r_e$ and $R_E$ in series, so $i_e = v_{in}/(r_e + R_E)$. A fraction $\alpha$ of it is collector current, which flows through $R_C$. With $R_E\gg r_e$ the gain is $-R_C/R_E$: a ratio of two resistors, independent of $\beta$, $I_C$ and temperature.
      `, tFig),
      RF(md`
        ### $G_M$, exactly (Lecture 24)

        Short the output and replace the transistor by its model ($r_o\to\infty$).

        [[fig:m]]

        1. **The output current.** $R_C$ carries nothing (both ends at 0 V), so $i_{out}$ is the controlled source's current: $i_{out} = g_mv_\pi$.
        2. **The base current.** It flows through $r_\pi$: $i_b = v_\pi/r_\pi = i_{out}/(g_mr_\pi) = i_{out}/\beta$.
        3. **The emitter current.** $R_E$ carries both: $i_{out} + i_{out}/\beta$.
        4. **KVL** around the loop $v_{in}\to r_\pi\to R_E\to$ ground:
        $$v_{in} = v_\pi + \Big[i_{out} + \frac{i_{out}}{\beta}\Big]R_E$$
        5. **Substitute $v_\pi = i_{out}/g_m$:**
        $$v_{in} = i_{out}\Big[\frac{1}{g_m} + \Big(1 + \frac{1}{\beta}\Big)R_E\Big]$$

        $$G_M = \frac{g_m}{1 + \frac{\beta + 1}{\beta}g_mR_E}\approx\frac{g_m}{1 + g_mR_E}\quad(\beta\gg1)$$
      `, { m: { fig: ss({ b: 'vin', e: 'RE', c: 'RCshort' }), cap: 'Lecture 24\'s $G_M$ circuit: KVL from $v_{in}$ through $r_\\pi$ and $R_E$.' } }),
      RF(md`
        ### $R_{out}$ and $R_{in}$ (Lecture 24)

        **$R_{out}$.** Input off, test source on the collector. The same loop now reads $0 = v_\pi + \big[g_mv_\pi + g_mv_\pi/\beta\big]R_E$, that is $v_\pi\big[1 + \frac{\beta + 1}{\beta}g_mR_E\big] = 0$, so $v_\pi = 0$. The controlled source is dead and $R_{out} = R_C$.

        [[fig:o]]

        **$R_{in}$.** From [Chapter 8](#/l/bk08-base): $v_t = i_tr_\pi + (\beta + 1)i_tR_E$, so $R_{in} = r_\pi + (\beta + 1)R_E$. "Emitter resistance $R_E$ appears $(\beta + 1)$ larger looking from the base."

        !!key The common emitter with $R_E$ (Lecture 24)
          $$G_M = \frac{g_m}{1 + \frac{\beta + 1}{\beta}g_mR_E},\qquad R_{out} = R_C,\qquad R_{in} = r_\pi + (\beta + 1)R_E,\qquad A_v = -G_MR_C$$
      `, { o: { fig: ss({ b: 'gnd', e: 'RE', c: 'RCtest' }), cap: '$R_{out}$: the KVL loop forces $v_\\pi = 0$.' } }),
      R(md`
        ### The same result through $r_e$

        Pull $1/\alpha = (\beta + 1)/\beta$ out of the bracket in step 5: $\dfrac{1}{g_m} + \dfrac{\beta + 1}{\beta}R_E = \dfrac{1}{\alpha}\Big(\dfrac{\alpha}{g_m} + R_E\Big) = \dfrac{r_e + R_E}{\alpha}$, with $r_e = \alpha/g_m$. So, **exactly**,
        $$G_M = \frac{\alpha}{r_e + R_E},\qquad A_v = -\frac{\alpha R_C}{r_e + R_E}\approx-\frac{R_C}{r_e + R_E}$$
        This is The Art of Electronics' formula, and it is Lecture 24's result rearranged, not an approximation of it (apart from $\alpha\approx1$). It says what the physical picture said: $v_{in}$ drives $r_e$ and $R_E$ in series, and $\alpha$ of the emitter current reaches $R_C$.
      `),
      R(md`
        ### Check it

        - **$R_E\to0$:** $A_v\to-\alpha R_C/r_e = -g_mR_C$, the plain common emitter. ✓
        - **$R_E\gg r_e$:** $A_v\to-R_C/R_E$ (times $\alpha$). ✓
        - **One number:** $I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 10\kO$, $R_E = 1\kO$. Lecture 24: $G_M = \dfrac{40\,\text{mS}}{1 + 1.01\times40} = 0.966\,\text{mS}$, $A_v = -9.66$. With $r_e$: $-\dfrac{0.990\times10\kO}{24.75 + 1000\,\Omega} = -9.66$. ✓ The quick estimate $-R_C/R_E = -10$ is 3.5% off.
      `),
      R(md`
        ### A source resistance, and $r_o$

        **$R_B$ in front of the base.** The base current is now $v_{in}/(R_B + r_\pi + (\beta + 1)R_E)$, and $i_{out} = \beta i_b$, so
        $$G_M = \frac{\beta}{R_B + r_\pi + (\beta + 1)R_E},\qquad A_v\approx-\frac{R_C}{r_e + R_E + R_B/(\beta + 1)}$$
        The source resistance reaches the emitter circuit divided by $\beta + 1$ (the elevator of [Chapter 8](#/l/bk08-elevator)).

        **$r_o$.** It changes $G_M$ by a fraction of order $R_E/r_o$ (well under 1%). The output resistance becomes $R_C\parallel R_{coll}$, where $R_{coll} = r_o\big[1 + g_m(R_E\parallel r_\pi)\big] + R_E\parallel r_\pi$ is the degenerated collector of Chapter 8: usually megohms, so $R_{out}\approx R_C$ and Lecture 24's results stand.

        **Linearity.** The junction sees only $v_{be} = v_{in}\,r_e/(r_e + R_E)$, a fraction $1/(1 + g_mR_E)$ of the input. The exponential's distortion (Chapter 1's $v/(2V_T)$ term) falls by the same factor: degeneration trades gain for linearity.

        **Partial bypass.** Split the emitter resistor into $R_{E1}$ (left in the signal path) and $R_{E2}$ (shunted by a large capacitor). DC sees $R_{E1} + R_{E2}$, which stabilizes the bias; the signal sees only $R_{E1}$, which sets the gain. ([Section 9.6](#/l/bk09-bias) does this in full.)
      `),
      R(md`
        ### Worked example

        $I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 5\kO$, $R_E = 200\,\Omega$, source resistance $R_B = 10\kO$, $r_o\to\infty$. Find the input resistance seen by the source and $A_v$.

        1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_e = 24.75\,\Omega$.
        2. The source sees $R_B + r_\pi + (\beta + 1)R_E = 10 + 2.5 + 20.2 = 32.7\kO$.
        3. $G_M = \beta/32.7\kO = 3.058\,\text{mS}$, so $A_v = -3.058\,\text{mS}\times5\kO = -15.29$.
        4. Check with $r_e$: $-\dfrac{R_C}{r_e + R_E + R_B/(\beta + 1)} = -\dfrac{5000}{24.75 + 200 + 99.0} = -15.44$ (the 1% difference is $\alpha$).

        !!mistake Common mistakes
          - **$-R_C/R_E$ when $R_E$ is not large next to $r_e$.** With $R_E = 50\,\Omega$ at $1\,\text{mA}$ the gain is $-R_C/75\,\Omega$, not $-R_C/50\,\Omega$.
          - **$R_{in} = r_\pi + R_E$.** $R_E$ counts $\beta + 1$ times.
          - **Forgetting the source resistance's $R_B/(\beta + 1)$** in the emitter path.
          - **$G_M = g_m$.** That is the undegenerated stage.
      `),
      Q(md`$I_C = 1\,\text{mA}$, $R_C = 5\kO$, $R_E = 25\,\Omega$, $\beta$ large. About what is $A_v$?`,
        [md`About $-100$`, md`About $-200$`, md`About $-50$`, md`About $+100$`], 0,
        [null, md`That is $-g_mR_C$ (or $-R_C/R_E$): each keeps only one of the two resistances in series, $r_e$ and $R_E$. Here they are equal, which halves the gain.`, md`That needs $r_e + R_E = 100\,\Omega$. At $1\,\text{mA}$, $r_e = 25\,\Omega$.`, md`The common emitter inverts, with or without $R_E$.`],
        md`$A_v\approx-\dfrac{R_C}{r_e + R_E} = -\dfrac{5000}{25 + 25} = -100$.`),
      Q(md`Why does emitter degeneration make the gain nearly independent of $\beta$ and of the bias current?`,
        [md`With $R_E\gg r_e$, $A_v\to-R_C/R_E$: two resistors, no device parameters`, md`Because $R_E$ increases $g_m$`, md`Because $R_E$ removes the base current`, md`It does not: the gain is still $-g_mR_C$`], 0,
        [null, md`$R_E$ does not change the transistor's $g_m$; it reduces the stage's $G_M$.`, md`The base current still flows; it is what makes $R_{in}$ rise to $r_\pi + (\beta + 1)R_E$.`, md`$-g_mR_C$ is the undegenerated gain; with $R_E$ the gain is $-\alpha R_C/(r_e + R_E)$.`],
        md`$A_v = -\alpha R_C/(r_e + R_E)$. $r_e = V_T/I_E$ carries the device dependence; once $R_E\gg r_e$ it drops out, and $\alpha\approx1$.`),
      P({
        id: 'bk09-cedeg-1', title: 'Lecture 24\'s $G_M$ in numbers',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 10\kO$, $R_E = 1\kO$, $r_o\to\infty$. Find $G_M$ (exact), $A_v$, and $R_{in}$.`,
        fig: F.amp({ kind: 'ce', RE: true }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 0.966184, traps: [{ v: 40, msg: 'That is $g_m$: the undegenerated stage.' }] }, { lbl: 'A_v', unit: '', ans: -9.66184, accept: [-9.7561], traps: [{ v: -400, msg: 'That ignores $R_E$.' }] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 103.5 }],
        sol: md`
1. $g_m = 40\,\text{mS}$, $g_mR_E = 40$, $\frac{\beta + 1}{\beta} = 1.01$.
2. $G_M = \dfrac{40\,\text{mS}}{1 + 1.01\times40} = \dfrac{40\,\text{mS}}{41.4} = 0.966\,\text{mS}$ (the $\beta\gg1$ form gives $40/41 = 0.976\,\text{mS}$).
3. $A_v = -0.966\,\text{mS}\times10\kO = -9.66$.
4. $R_{in} = 2.5 + 101\times1 = 103.5\kO$.`,
      }),
      P({
        id: 'bk09-cedeg-2', title: 'The $r_e$ picture',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 8\kO$, $R_E = 150\,\Omega$, $r_o\to\infty$. Find $r_e$, the exact $A_v$, and the crude estimate $-R_C/R_E$.`,
        fig: F.amp({ kind: 'ce', RE: true }),
        parts: [{ lbl: 'r_e', unit: 'Ω', ans: 49.505, accept: [50] }, { lbl: 'A_v', unit: '', ans: -39.7022, accept: [-40] }, { lbl: '-R_C/R_E', unit: '', ans: -53.333 }],
        sol: md`
$r_e = \alpha/g_m = 0.990/20\,\text{mS} = 49.5\,\Omega$. $A_v = -\dfrac{\alpha R_C}{r_e + R_E} = -\dfrac{0.990\times8000}{199.5} = -39.70$ (with $\alpha\approx1$, $r_e\approx50\,\Omega$: $-40$). The crude $-R_C/R_E = -53.3$ is a third too high, because $R_E$ is only three times $r_e$.`,
      }),
      P({
        id: 'bk09-cedeg-3', title: 'With a source resistance, typed',
        q: md`Type $A_v$ for the common emitter with $R_E$ and a source resistance $R_B$ ($r_o\to\infty$). Use \`beta\`, \`RC\`, \`RB\`, \`rpi\`, \`RE\` (\`gm\` also available).`,
        fig: F.amp({ kind: 'ce', RE: true, RB: true }),
        parts: [ex('-beta*RC/(RB + rpi + (beta + 1)*RE)', ['beta', 'RC', 'RB', 'rpi', 'RE', 'gm'], 'A_v')],
        hints: [md`The base current is $v_{in}$ over everything the source sees; the collector current is $\beta$ times that.`],
        sol: md`$$A_v = -\frac{\beta R_C}{R_B + r_\pi + (\beta + 1)R_E}\approx-\frac{R_C}{1/g_m + R_E + R_B/\beta}$$ (the second form is accepted).`,
      }),
      P({
        id: 'bk09-cedeg-4', title: 'Design for a gain',
        q: md`A common emitter at $I_C = 1\,\text{mA}$ ($\beta = 100$, $r_o\to\infty$) has $R_C = 10\kO$. What unbypassed $R_E$ gives $A_v = -20$ exactly (use the exact $r_e$ form)? What is then $R_{in}$?`,
        parts: [{ lbl: 'R_E', unit: 'Ω', ans: 470.297, accept: [475], traps: [{ v: 500, msg: 'That is $R_C/20$: it forgets the junction\'s own $r_e$.' }] }, { lbl: 'R_{in}', unit: 'kΩ', ans: 50 }],
        sol: md`
$|A_v| = \dfrac{\alpha R_C}{r_e + R_E} = 20$ gives $r_e + R_E = \alpha R_C/20 = 0.990\times500 = 495.0\,\Omega$, so $R_E = 495.0 - 24.75 = 470.3\,\Omega$.

$R_{in} = (\beta + 1)(r_e + R_E) = 101\times495.0\,\Omega = 50.0\kO$. (A neat form: from Chapter 8, $R_{in} = (\beta + 1)(r_e + R_E)$.)`,
      }),
      P({
        id: 'bk09-cedeg-5', title: 'What $r_o$ changes in a degenerated stage',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$, $R_C = 10\kO$, $R_E = 500\,\Omega$, input directly on the base. Keeping $r_o$, find the resistance looking down into the collector, $R_{out}$, $G_M$ and $A_v$; then Lecture 24's $A_v$ with $r_o\to\infty$.`,
        fig: F.amp({ kind: 'ce', RE: true }),
        parts: [{ lbl: 'R_{coll}', unit: 'kΩ', ans: 883.75 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 9.88811 }, { lbl: 'G_M', unit: 'mS', ans: 1.885714 },
          { lbl: 'A_v', unit: '', ans: -18.6462 }, { lbl: 'A_{v,\\infty}', unit: '', ans: -18.8679 }],
        hints: [md`Input off: the base is grounded, so the collector looks like Chapter 8's degenerated collector.`, md`$G_M$ with $r_o$ differs from Lecture 24's by a fraction of order $R_E/r_o$.`],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_o = 50\kO$; $R_E\parallel r_\pi = 416.7\,\Omega$, so looking down into the collector $R_{coll} = 50\kO\times17.67 + 0.42\kO = 883.8\kO$.
2. $R_{out} = R_C\parallel R_{coll} = 10\parallel883.8 = 9.888\kO$.
3. A nodal solve with $r_o$ gives $G_M = 1.8857\,\text{mS}$; Lecture 24's $\dfrac{g_m}{1 + 1.01\,g_mR_E} = \dfrac{40\,\text{mS}}{21.2} = 1.8868\,\text{mS}$ is within 0.06%.
4. $A_v = -G_MR_{out} = -1.8857\,\text{mS}\times9.888\kO = -18.65$, against Lecture 24's $-1.8868\,\text{mS}\times10\kO = -18.87$.

$r_o$ costs 1.2% of gain, almost all of it through $R_{out}$. That is why Lecture 24 drops it.`,
      }),
      R(md`
        ### Drill

        Degenerated common emitters, NPN and PNP, sometimes with a source resistance. Lecture 24's exact form and the $r_e$ form are both accepted.
      `),
      G('bk9_cedeg', { need: 4 }),
    ],
  });
  // ================================================================== 9.3 the common base
  L({
    id: 'bk09-cb', title: 'The common base', ref: 'Lecture 24',
    steps: [
      RF(md`
        ### The question

        Hold the base, drive the **emitter**, take the output at the **collector**: the common base. Lecture 24 draws it with the base held through $R_B$ (from a DC source $V_B$) and the source's resistance $R_E$ in series with $v_{in}$, and finds $G_M$, $R_{in}$ and the gain. It is the BJT twin of the [common gate](#/l/bk04-cg), and the top half of every cascode.

        [[fig:c]]
      `, { c: { fig: F.amp({ kind: 'cb', RE: true, RB: true }), cap: 'Lecture 24\'s common base: base held through $R_B$, input through $R_E$ into the emitter.' } }),
      R(md`
        ### The physical picture

        With the base held, the emitter is the low-resistance terminal ($r_e$, [Chapter 8](#/l/bk08-emitter)). Push the emitter **up** by $v$: $v_{be}$ shrinks, the emitter current falls by $v/r_e$, and $\alpha$ of that change is collector current. Less current through $R_C$ means a smaller drop, so the collector goes **up**: the common base is **non-inverting**.

        The transistor here is a **current buffer**: it accepts a current at a low resistance (the emitter) and delivers almost all of it ($\alpha$) at a high resistance (the collector). The voltage gain comes from that resistance ratio: about $R_C/R_{in}$.
      `),
      RF(md`
        ### $G_M$ (Lecture 24)

        Short the output. $R_C$ carries nothing, so $i_{out} = g_mv_\pi$, flowing from the short into the collector and down through the controlled source to the emitter.

        [[fig:m]]

        1. **The base current** is $i_b = v_\pi/r_\pi = i_{out}/\beta$. It comes up from ground through $R_B$ and flows through $r_\pi$ into the emitter node.
        2. **The emitter current** that leaves through $R_E$ toward the source is therefore $i_{out} + i_{out}/\beta = \big(1 + \frac{1}{\beta}\big)i_{out}$.
        3. **KVL** from ground through $R_B$, $r_\pi$, $R_E$ and the source back to ground (the "KVL" loop of the lecture):
        $$0 = \frac{i_{out}}{\beta}(R_B + r_\pi) + i_{out}\Big(1 + \frac{1}{\beta}\Big)R_E + v_{in}$$
        4. **Solve:**

        $$G_M = \frac{i_{out}}{v_{in}} = \frac{-1}{\frac{R_B + r_\pi}{\beta} + \frac{\beta + 1}{\beta}R_E}\approx\frac{-1}{\frac{R_B + r_\pi}{\beta} + R_E}\quad(\beta\gg1)$$

        Negative, as for every common-gate or common-base stage: pushing the input up makes the transistor pull **less** current from the short.
      `, { m: { fig: ss({ b: 'RB', e: 'REvin', c: 'RCshort' }), cap: 'Lecture 24\'s $G_M$ circuit for the common base.' } }),
      RF(md`
        ### $R_{out}$ and $R_{in}$ (Lecture 24)

        **$R_{out}$:** with $v_{in} = 0$ the loop of step 3 reads $0 = \frac{i_c}{\beta}(R_B + r_\pi) + i_c\big(1 + \frac1\beta\big)R_E$, so the collector current is zero and $R_{out} = R_C$ ($r_o\to\infty$).

        **$R_{in}$:** put the test source below $R_E$ (where $v_{in}$ was). The emitter divides the base side by $\beta + 1$ ([Chapter 8](#/l/bk08-emitter)), and $R_E$ adds in series:
        $$R_{in} = R_E + \frac{R_B + r_\pi}{\beta + 1}$$
        "Base resistance appears $(\beta + 1)$ times smaller looking from the emitter" (Lecture 24).

        [[fig:i]]

        **The gain, and a cleaner form.** Pull $\frac{\beta + 1}{\beta} = \frac1\alpha$ out of $G_M$'s denominator: $\frac{R_B + r_\pi}{\beta} + \frac{\beta + 1}{\beta}R_E = \frac{1}{\alpha}R_{in}$. So, exactly,
        $$G_M = -\frac{\alpha}{R_{in}},\qquad A_v = -G_MR_C = +\frac{\alpha R_C}{R_{in}}$$
        The emitter current is $v_{in}/R_{in}$; $\alpha$ of it flows in $R_C$.

        !!key The common base (Lecture 24)
          $$G_M = \frac{-1}{\frac{R_B + r_\pi}{\beta} + \frac{\beta + 1}{\beta}R_E},\quad R_{out} = R_C,\quad R_{in} = R_E + \frac{R_B + r_\pi}{\beta + 1},\quad A_v = \frac{\alpha R_C}{R_{in}}$$
      `, { i: { fig: ss({ b: 'RB', e: 'REtest', c: 'RC' }), cap: '$R_{in}$: the test source sits where $v_{in}$ was, below $R_E$.' } }),
      R(md`
        ### Check it

        - **$R_B = R_E = 0$:** $R_{in} = r_e$ and $A_v = \alpha R_C/r_e = g_mR_C$: the common emitter's magnitude, with a plus sign. ✓
        - **$R_E$ large:** $A_v\to\alpha R_C/R_E$, a resistor ratio. ✓
        - **One number:** $I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 5\kO$, $R_E = 50\,\Omega$, $R_B = 0$: $R_{in} = 50 + 24.75 = 74.75\,\Omega$, $A_v = 0.990\times5000/74.75 = 66.2$. With $R_B = 10\kO$: $R_{in} = 50 + 12.5\kO/101 = 173.8\,\Omega$ and $A_v = 28.5$. An unbypassed base resistor costs more than half the gain; a bypass capacitor on the base gets it back.
      `),
      R(md`
        ### What it means, and how to recognize it

        **Recognize it:** the base goes to a held voltage (a triangle, a supply, a bypass capacitor), $v_{in}$ arrives at the emitter, $v_{out}$ leaves at the collector. Say: "common base: $R_{in}$ is an emitter, small; the gain is $+\alpha R_C/R_{in}$".

        **Uses.** A low input resistance is just right for a current input (a photodiode, a transmission line that must be terminated in $50\,\Omega$) and for the top transistor of a [cascode](#/l/bk09-cascode), where it holds the lower collector still. Driven by a voltage source with resistance $R_S$, the common base has the same gain magnitude as a degenerated common emitter with $R_E = R_S$, but no input resistance to speak of.

        **With $r_o$.** $R_{out}$ becomes $R_C$ in parallel with the degenerated collector of Chapter 8, usually megohms; the gain barely moves.

        !!mistake Common mistakes
          - **A negative gain.** The common base is non-inverting; it is $G_M$ that is negative.
          - **$R_{in} = R_E$,** forgetting the emitter itself, $(R_B + r_\pi)/(\beta + 1)$.
          - **$R_B$ at full size.** Seen from the emitter it is divided by $\beta + 1$.
          - **$R_{in} = r_\pi$.** That is the base, not the emitter.
      `),
      Q(md`In a common base, $v_{in}$ rises a little. The collector voltage...`,
        [md`rises: the emitter current falls, so less drop across $R_C$`, md`falls, as in a common emitter`, md`does not change: the base is held`, md`follows $v_{in}$ exactly`], 0,
        [null, md`In the common emitter the input raises $v_{be}$. Here it raises the emitter, which **lowers** $v_{be}$.`, md`The base is held, but the emitter moves, and the collector current follows $v_{be}$.`, md`That is a follower. The common base has gain $\alpha R_C/R_{in}$, usually much more than 1.`],
        md`Emitter up, $v_{be}$ down, current down, less drop in $R_C$: the collector rises. $A_v = +\alpha R_C/R_{in}$.`),
      Q(md`A common base at $1\,\text{mA}$ has its base held through $R_B = 10\kO$, unbypassed ($\beta = 100$, no $R_E$). About what input resistance does the source see?`,
        [md`About $124\,\Omega$`, md`About $25\,\Omega$`, md`About $12.5\kO$`, md`About $2.5\kO$`], 0,
        [null, md`That is $r_e$ alone, as if the base were held directly.`, md`That is $R_B + r_\pi$, not divided by $\beta + 1$.`, md`That is $r_\pi$: the base, not the emitter.`],
        md`$R_{in} = \dfrac{R_B + r_\pi}{\beta + 1} = \dfrac{12.5\kO}{101} = 124\,\Omega$.`),
      P({
        id: 'bk09-cb-1', title: 'Lecture 24\'s common base in numbers',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $R_C = 5\kO$, source resistance $R_E = 50\,\Omega$, base held directly ($R_B = 0$), $r_o\to\infty$. Find $R_{in}$, $G_M$ and $A_v$.`,
        fig: F.amp({ kind: 'cb', RE: true }),
        parts: [{ lbl: 'R_{in}', unit: 'Ω', ans: 74.7525, accept: [75] }, { lbl: 'G_M', unit: 'mS', ans: -13.2450, traps: [{ v: 13.2450, msg: 'For a common base $G_M$ is negative: pushing the input up makes the transistor pull less current from the short.' }] }, { lbl: 'A_v', unit: '', ans: 66.2252, accept: [66.67] }],
        sol: md`
1. $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $r_e = r_\pi/101 = 24.75\,\Omega$.
2. $R_{in} = R_E + \dfrac{r_\pi}{\beta + 1} = 50 + 24.75 = 74.75\,\Omega$.
3. $G_M = \dfrac{-1}{\frac{2500}{100} + 1.01\times50} = \dfrac{-1}{75.5\,\Omega} = -13.25\,\text{mS}$ $(= -\alpha/R_{in})$.
4. $A_v = -G_MR_C = 13.25\,\text{mS}\times5\kO = +66.2$.`,
      }),
      P({
        id: 'bk09-cb-2', title: 'An unbypassed base resistor',
        q: md`Same stage, but the base is held through $R_B = 10\kO$ (no bypass capacitor). Find $R_{in}$ and $A_v$. Then a large capacitor is added from base to ground: what is $A_v$ now?`,
        fig: F.amp({ kind: 'cb', RE: true, RB: true }),
        parts: [{ lbl: 'R_{in}', unit: 'Ω', ans: 173.762 }, { lbl: 'A_v', unit: '', ans: 28.4900, traps: [{ v: 66.2252, msg: 'That is with the base bypassed. Without the capacitor $R_B/(\\beta + 1) = 99\\,\\Omega$ joins the input resistance.' }] }, { lbl: 'A_{v,bypassed}', unit: '', ans: 66.2252 }],
        sol: md`
$R_{in} = 50 + \dfrac{10\kO + 2.5\kO}{101} = 50 + 123.8 = 173.8\,\Omega$, $A_v = \dfrac{\alpha R_C}{R_{in}} = \dfrac{0.990\times5000}{173.8} = 28.5$.
With the base bypassed, $R_B$ disappears for signals and the gain is back to $66.2$.`,
      }),
      P({
        id: 'bk09-cb-3', title: 'Lecture 24\'s $G_M$, typed',
        q: md`Type $G_M$ of the common base with $R_B$ on the base and $R_E$ in series with the source ($r_o\to\infty$). Use \`RB\`, \`rpi\`, \`beta\`, \`RE\`.`,
        fig: F.amp({ kind: 'cb', RE: true, RB: true }),
        parts: [Object.assign(ex('-1/((RB + rpi)/beta + (beta + 1)/beta*RE)', ['RB', 'rpi', 'beta', 'RE'], 'G_M'), { vars: { RE: [10, 200], RB: [1e3, 2e4], rpi: [1e3, 2e4], beta: [50, 200] } })],
        sol: md`From the KVL $0 = \frac{i_{out}}{\beta}(R_B + r_\pi) + i_{out}\big(1 + \frac1\beta\big)R_E + v_{in}$:
$$G_M = \frac{-1}{\frac{R_B + r_\pi}{\beta} + \frac{\beta + 1}{\beta}R_E}$$`,
      }),
      P({
        id: 'bk09-cb-4', title: 'A current input',
        q: md`An ideal signal current source pushes $i_{in}$ **into** the emitter of a common base ($I_C = 1\,\text{mA}$, $\beta = 100$, base held, $R_C = 10\kO$, $r_o\to\infty$). Find the input resistance and the transresistance $v_{out}/i_{in}$, with its sign.`,
        parts: [{ lbl: 'R_{in}', unit: 'Ω', ans: 24.7525, accept: [25] }, { lbl: 'v_{out}/i_{in}', unit: 'kΩ', ans: 9.90099, accept: [10], traps: [{ v: -9.90099, msg: 'Current pushed into the emitter replaces part of the transistor\'s own emitter current, so the collector current falls and the collector rises.' }] }],
        hints: [md`KCL at the emitter: $i_{in} = v_e/r_\pi + g_mv_e$ (the base is grounded, so $v_\pi = -v_e$).`],
        sol: md`
1. **KCL at the emitter** (base grounded, so $v_\pi = -v_e$): $i_{in} = \dfrac{v_e}{r_\pi} + g_mv_e$, so $v_e = i_{in}r_e$ with $r_e = 24.75\,\Omega$. That is also $R_{in}$.
2. **The collector current** through the controlled source is $g_mv_\pi = -g_mr_ei_{in} = -\alpha i_{in}$: it falls.
3. **KCL at the collector:** $v_{out}/R_C + g_mv_\pi = 0$, so $v_{out} = \alpha R_Ci_{in}$.
$$\frac{v_{out}}{i_{in}} = +\alpha R_C = 0.990\times10\kO = 9.90\kO$$
A current buffer: the current enters at $25\,\Omega$ and comes out, 99% of it, into $10\kO$.`,
      }),
      P({
        id: 'bk09-cb-5', title: 'A matched $50\\,\\Omega$ input',
        q: md`A common base must present exactly $R_{in} = 50\,\Omega$ to a $50\,\Omega$ cable, using the transistor alone (base bypassed, $R_E = 0$ inside the stage). $\beta = 100$. What emitter current does that take? The cable's source has $50\,\Omega$ resistance and $R_C = 5\kO$: what is $v_{out}/v_s$?`,
        parts: [{ lbl: 'I_E', unit: 'mA', ans: 0.5 }, { lbl: 'v_{out}/v_s', unit: '', ans: 49.505, accept: [50] }],
        sol: md`
$R_{in} = r_e = V_T/I_E = 50\,\Omega$ needs $I_E = 25\,\text{mV}/50\,\Omega = 0.5\,\text{mA}$.
From the source: the $50\,\Omega$ source resistance is in series with the emitter, so the stage is Lecture 24's common base with $R_E = 50\,\Omega$: $A_v = \dfrac{\alpha R_C}{R_E + r_e} = \dfrac{0.990\times5000}{100} = 49.5$.`,
      }),
      R(md`
        ### Drill

        Common-base stages with source resistances and base resistors. $G_M$ is negative, the gain positive.
      `),
      G('bk9_cb', { need: 4 }),
    ],
  });

  // ================================================================== 9.4 the emitter follower
  L({
    id: 'bk09-cc', title: 'The emitter follower', ref: 'Lecture 24',
    steps: [
      RF(md`
        ### The question

        Drive the base, take the output at the **emitter**, and put the collector on its supply: the common collector, better known as the **emitter follower**. Lecture 24 finds its $G_M$, $R_{in}$ and $R_{out}$ with a source resistance $R_B$. Its voltage gain is just under 1, and that is the point: it is a **buffer**.

        [[fig:c]]
      `, { c: { fig: F.amp({ kind: 'cc', RB: true }), cap: 'The emitter follower: input through $R_B$ to the base, output at the emitter.' } }),
      R(md`
        ### The physical picture

        In forward active, $V_{BE}$ hardly changes: it takes a 10× change of current to move it by 60 mV. So the emitter sits $0.7\,\text{V}$ below the base and **follows** it. That is the whole idea, and it already says $A_v\approx1$.

        Why bother? Because of the $(\beta + 1)$ rule. The source sees the load magnified, $(\beta + 1)R_E$; the load sees the source shrunk, $(R_B + r_\pi)/(\beta + 1)$. The follower is an impedance converter: it lets a weak, high-resistance source drive a heavy, low-resistance load. The gain is not quite 1 because the junction's own $r_e$ forms a divider with the load.
      `),
      RF(md`
        ### $G_M$ (Lecture 24)

        Short the output: the emitter is at 0 V, so $R_E$ carries nothing. The collector is at incremental ground. $i_{out}$ is the current from the short **into** the emitter node.

        [[fig:m]]

        1. **The control voltage.** With the emitter grounded, $R_B$ and $r_\pi$ divide the input: $v_\pi = v_{in}\dfrac{r_\pi}{R_B + r_\pi}$.
        2. **KCL at the emitter.** Into the node come $v_\pi/r_\pi$ (through $r_\pi$), $g_mv_\pi$ (through the controlled source) and $i_{out}$ (from the short); nothing leaves through $R_E$. So $i_{out} = -g_mv_\pi\big(1 + \frac{1}{\beta}\big)$.
        3. **Combine** (with $g_mr_\pi = \beta$):

        $$G_M = \frac{i_{out}}{v_{in}} = -\frac{\beta + 1}{\beta}\cdot\frac{g_mr_\pi}{R_B + r_\pi} = \frac{-1}{(r_\pi + R_B)/(\beta + 1)}$$
      `, { m: { fig: ss({ b: 'vinRB', e: 'REshort', c: 'gnd' }), cap: 'Lecture 24\'s $G_M$ circuit for the follower: the emitter shorted to ground.' } }),
      RF(md`
        ### $R_{in}$, $R_{out}$ and the gain (Lecture 24)

        **$R_{in}$** from the source: $R_B$, then the base with $R_E$ under the emitter ([Chapter 8](#/l/bk08-base)): $R_{in} = R_B + r_\pi + (\beta + 1)R_E$.

        **$R_{out}$** with the input off: looking down, $R_E$; looking up into the emitter, the base side divided by $\beta + 1$ ([Chapter 8](#/l/bk08-emitter)):
        $$R_{out} = R_E\parallel\frac{r_\pi + R_B}{\beta + 1}$$

        [[fig:o]]

        **The gain:**
        $$A_v = -G_MR_{out} = \frac{\beta + 1}{r_\pi + R_B}\Big(R_E\parallel\frac{r_\pi + R_B}{\beta + 1}\Big) = \frac{R_E}{R_E + \frac{r_\pi + R_B}{\beta + 1}}$$
        a voltage divider between the load $R_E$ and the follower's own output resistance. Multiply top and bottom by $\beta + 1$ for the view from the base: $A_v = \dfrac{(\beta + 1)R_E}{R_B + r_\pi + (\beta + 1)R_E}$, the fraction of $v_{in}$ that falls across the magnified $R_E$. Same number, two windows.

        !!key The emitter follower (Lecture 24)
          $$G_M = \frac{-1}{(r_\pi + R_B)/(\beta + 1)},\quad R_{in} = R_B + r_\pi + (\beta + 1)R_E,\quad R_{out} = R_E\parallel\frac{r_\pi + R_B}{\beta + 1},\quad A_v = \frac{R_E}{R_E + \frac{r_\pi + R_B}{\beta + 1}}$$
          A load $R_L$ on the output simply joins $R_E$: replace $R_E$ by $R_E\parallel R_L$ (in $R_{in}$ and $A_v$ too).
      `, { o: { fig: ss({ b: 'RB', e: 'REtestR', c: 'gnd' }), cap: '$R_{out}$: input off; the test current splits between $R_E$ and the emitter.' } }),
      R(md`
        ### Check it

        - **$R_E\to\infty$:** $A_v\to1$. ✓ **$R_B = 0$:** $A_v = R_E/(R_E + r_e)$, the AoE result. ✓
        - **One number:** $I_C = 1\,\text{mA}$, $\beta = 100$, $R_B = 10\kO$, $R_E = 2\kO$: $(r_\pi + R_B)/(\beta + 1) = 123.8\,\Omega$, $A_v = 2000/2123.8 = 0.942$, $R_{in} = 214.5\kO$, $R_{out} = 116.6\,\Omega$.
        - **With $r_o$:** the collector is at incremental ground, so $r_o$ hangs from the emitter to ground: replace $R_E$ by $R_E\parallel r_o$. $G_M$ does not change (with the output shorted $r_o$ carries nothing).
      `),
      R(md`
        ### The buffer, in numbers

        A sensor with $R_S = 10\kO$ must drive a $100\,\Omega$ load. Connected directly: $v_L/v_s = 100/10100 = 0.0099$, almost nothing.

        Put a follower in between ($1\,\text{mA}$, $\beta = 100$, $R_E = 1\kO$). Its load is $R_E\parallel R_L = 90.9\,\Omega$, its output resistance up the emitter is $(10\kO + 2.5\kO)/101 = 123.8\,\Omega$, so
        $$A_v = \frac{90.9}{90.9 + 123.8} = 0.42$$
        Forty times better, and the source now sees $R_{in} = 10 + 2.5 + 101\times0.0909 = 21.7\kO$ instead of $100\,\Omega$. More current (smaller $r_e$), a larger $\beta$, or a Darlington would do better still.

        **Recognize it:** input at the base, output at the emitter, collector on its supply. A **PNP follower** is the same picture upside down: $R_E$ up to $V_{CC}$, output at the emitter on top.

        !!mistake Common mistakes
          - **$A_v = 1$ exactly.** It is $R_E/(R_E + (r_\pi + R_B)/(\beta + 1))$; with a heavy load it can be far below 1.
          - **$R_{out} = R_E$,** forgetting the emitter path, which is usually much smaller.
          - **$R_{in} = r_\pi$,** forgetting $(\beta + 1)R_E$.
          - **Forgetting the load.** $R_L$ is in parallel with $R_E$ everywhere.
      `),
      Q(md`A follower ($\beta = 100$, $r_e = 25\,\Omega$, $R_B = 0$) drives $R_E\parallel R_L = 25\,\Omega$. About what is $A_v$?`,
        [md`About $0.5$`, md`About $1$`, md`About $0.99$`, md`About $100$`], 0,
        [null, md`Only when the load is much larger than the follower's output resistance $r_e$.`, md`That is a light load. Here the load equals $r_e$: a 50/50 divider.`, md`A follower never has voltage gain above 1.`],
        md`$A_v = \dfrac{25}{25 + 25} = 0.5$. A follower is only a good buffer while its load is large next to its output resistance.`),
      Q(md`Which change lowers a follower's output resistance the most when $R_B = 10\kO$ and $I_C = 1\,\text{mA}$ ($\beta = 100$)?`,
        [md`Doubling $\beta$`, md`Doubling $R_E$`, md`Halving $R_E$`, md`Removing the collector's supply bypass`], 0,
        [null, md`$R_E$ is in parallel with a much smaller $(r_\pi + R_B)/(\beta + 1)\approx124\,\Omega$; changing it barely matters.`, md`Halving $R_E$ lowers $R_{out}$ a little, but mostly loads the output.`, md`For signals the collector is already at incremental ground.`],
        md`$(r_\pi + R_B)/(\beta + 1) = r_e + R_B/(\beta + 1)$: with $R_B = 10\kO$ the $R_B/(\beta + 1)\approx99\,\Omega$ term dominates, and doubling $\beta$ halves it.`),
      P({
        id: 'bk09-cc-1', title: 'Lecture 24\'s follower in numbers',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $R_B = 10\kO$, $R_E = 2\kO$, $r_o\to\infty$. Find $G_M$, $R_{in}$, $R_{out}$ and $A_v$.`,
        fig: F.amp({ kind: 'cc', RB: true }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: -8.08 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 214.5 }, { lbl: 'R_{out}', unit: 'Ω', ans: 116.550 }, { lbl: 'A_v', unit: '', ans: 0.941725, traps: [{ v: 1, msg: 'Close, but the junction and $R_B$ form a divider with $R_E$.' }] }],
        sol: md`
1. $r_\pi = 2.5\kO$; $(r_\pi + R_B)/(\beta + 1) = 12.5\kO/101 = 123.8\,\Omega$.
2. $G_M = -1/123.8\,\Omega = -8.08\,\text{mS}$.
3. $R_{in} = 10 + 2.5 + 101\times2 = 214.5\kO$.
4. $R_{out} = 2000\parallel123.8 = 116.6\,\Omega$.
5. $A_v = -G_MR_{out} = 8.08\,\text{mS}\times116.6\,\Omega = 0.942$ $\big(= 2000/2123.8\big)$.`,
      }),
      P({
        id: 'bk09-cc-2', title: 'The follower\'s gain, typed',
        q: md`Type $A_v$ of the emitter follower with source resistance $R_B$ and emitter resistor $R_E$ ($r_o\to\infty$). Use \`RE\`, \`RB\`, \`rpi\`, \`beta\`.`,
        fig: F.amp({ kind: 'cc', RB: true }),
        parts: [Object.assign(ex('RE/(RE + (rpi + RB)/(beta + 1))', ['RE', 'RB', 'rpi', 'beta'], 'A_v'), { vars: { RE: [50, 500], RB: [2e3, 2e4], rpi: [1e3, 2e4], beta: [50, 200] } })],
        sol: md`$$A_v = \frac{R_E}{R_E + \frac{r_\pi + R_B}{\beta + 1}} = \frac{(\beta + 1)R_E}{R_B + r_\pi + (\beta + 1)R_E}$$`,
      }),
      P({
        id: 'bk09-cc-3', title: 'Buffering a heavy load',
        q: md`A source with $R_S = 10\kO$ drives a follower ($I_C = 1\,\text{mA}$, $\beta = 100$, $R_E = 1\kO$) that drives $R_L = 100\,\Omega$. Find the follower's input resistance (including $R_S$), the gain $v_L/v_s$, and the gain without the follower.`,
        fig: F.amp({ kind: 'cc', RB: 'R_S', RL: true }),
        parts: [{ lbl: 'R_{in}', unit: 'kΩ', ans: 21.6818 }, { lbl: 'A_v', unit: '', ans: 0.42348 }, { lbl: 'A_{direct}', unit: '', ans: 0.00990099 }],
        sol: md`
$R_E\parallel R_L = 90.91\,\Omega$. $R_{in} = 10 + 2.5 + 101\times0.0909 = 21.68\kO$.
$A_v = \dfrac{90.91}{90.91 + 123.76} = 0.423$. Without the follower: $100/10100 = 0.0099$.`,
      }),
      P({
        id: 'bk09-cc-4', title: 'A PNP follower',
        q: md`A PNP follower: $R_E = 1\kO$ from $V_{CC}$ to the emitter (the output), collector on ground, input directly on the base. $I_C = 2\,\text{mA}$, $\beta = 50$, $r_o\to\infty$. Find $r_\pi$, $R_{out}$ and $A_v$.`,
        fig: F.amp({ kind: 'cc', pnp: true }),
        parts: [{ lbl: 'r_\\pi', unit: 'Ω', ans: 625 }, { lbl: 'R_{out}', unit: 'Ω', ans: 12.1066, accept: [12.35] }, { lbl: 'A_v', unit: '', ans: 0.987893 }],
        sol: md`$g_m = 80\,\text{mS}$, $r_\pi = 625\,\Omega$, $r_e = 625/51 = 12.25\,\Omega$. $R_{out} = 1000\parallel12.25 = 12.11\,\Omega$. $A_v = 1000/1012.25 = 0.988$. Upside down, same formulas.`,
      }),
      P({
        id: 'bk09-cc-5', title: 'When $r_o$ matters in a follower',
        q: md`A follower with a large emitter resistor: $R_E = 10\kO$, $I_C = 1\,\text{mA}$, $\beta = 100$, $V_A = 25\,\text{V}$, $R_B = 0$. Keeping $r_o$, find $R_{in}$ and $A_v$. What would $R_{in}$ be with $r_o\to\infty$?`,
        fig: F.amp({ kind: 'cc' }),
        parts: [{ lbl: 'R_{in}', unit: 'kΩ', ans: 723.929 }, { lbl: 'A_v', unit: '', ans: 0.996547 }, { lbl: 'R_{in,\\infty}', unit: 'MΩ', ans: 1.0125 }],
        sol: md`
$r_o = 25\kO$ hangs from the emitter to the (grounded) collector, in parallel with $R_E$: $R_E\parallel r_o = 7.143\kO$.
$R_{in} = 2.5\kO + 101\times7.143\kO = 723.9\kO$ (without $r_o$: $2.5 + 1010 = 1012.5\kO$). $A_v = \dfrac{7143}{7143 + 24.75} = 0.9965$.`,
      }),
      R(md`
        ### Drill

        Followers, NPN and PNP, with source resistances and loads.
      `),
      G('bk9_cc', { need: 4 }),
    ],
  });
  // ================================================================== 9.5 the cascode amplifier
  const cascModel = [
    ...ss({ b: 'gnd', e: 'open', c: 'RCshort', s: '2', names: false }), ['w', [2, 2], [2, 3]],
    ...ss({ y: 3, b: 'vin', e: 'gnd', c: 'open', s: '1', names: false }), ['node', [2, 2.5], { n: 'X', side: 'r' }],
  ];
  L({
    id: 'bk09-cascode', title: 'The BJT cascode amplifier', ref: 'Lectures 24, 28 and 29',
    steps: [
      RF(md`
        ### The question

        Stack a common base ($Q_2$, base held) on top of a common emitter ($Q_1$): the cascode. With a resistor load it gives the common emitter's gain, but (Chapter 12) far more bandwidth; with a current-source load it gives enormous gain. We find $G_M$, $R_{out}$ and the gain, three ways.

        [[fig:c]]
      `, { c: { fig: F.cascAmp(), cap: 'The BJT cascode amplifier: $Q_1$ converts $v_{in}$ to a current, $Q_2$ passes it to the output.' } }),
      R(md`
        ### The physical picture

        $Q_1$ turns $v_{in}$ into a current, $g_{m1}v_{in}$, exactly as a common emitter does. That current must come from $Q_2$'s emitter. $Q_2$ is a [common base](#/l/bk09-cb): it accepts the current at its low-resistance emitter and hands $\alpha_2$ of it to the output. Meanwhile it holds node $X$ (and so $Q_1$'s collector) nearly still: $Q_1$ sees about $r_{e2}$ as its load and has almost no voltage gain of its own.

        The output current does not care how large the load is, because $Q_2$'s collector is a degenerated collector, about $\beta r_o$ ([Chapter 8](#/l/bk08-cascode)). So with a current-source load the voltage gain is set by that huge resistance.
      `),
      RF(md`
        ### $G_M$: short the output

        [[fig:m]]

        1. **$Q_1$:** its base is at $v_{in}$ and its emitter grounded, so it sinks $g_{m1}v_{in}$ from node $X$.
        2. **Node $X$** ($r_o\to\infty$): that current can only come out of $Q_2$'s emitter. So $Q_2$'s emitter current is $g_{m1}v_{in}$.
        3. **$Q_2$:** its collector carries $\alpha_2$ of its emitter current, and that is drawn from the short: $i_{out} = \alpha_2g_{m1}v_{in}$.

        $$G_M = \alpha_2g_{m1}\approx g_{m1}$$
        With $r_o$ kept, $r_{o1}$ steals a sliver of the current at $X$ (it competes with $r_{e2}$, which is a thousand times smaller): still $G_M\approx g_{m1}$.
      `, { m: { fig: cascModel, cap: 'The cascode with the output shorted ($r_o\\to\\infty$): $Q_1$ below, $Q_2$ above, node $X$ between.' } }),
      R(md`
        ### $R_{out}$ and the gain

        With $v_{in}$ off, $Q_1$ is just $r_{o1}$, and looking down into $Q_2$'s collector we see the [Chapter 8 cascode](#/l/bk08-cascode):
        $$R_{casc} = r_{o2}\big[1 + g_{m2}(r_{o1}\parallel r_{\pi2})\big] + r_{o1}\parallel r_{\pi2}\approx\beta r_{o2}$$
        so $R_{out} = R_C\parallel R_{casc}$ and

        !!key The cascode amplifier
          $$G_M\approx g_{m1},\qquad R_{out} = R_{load}\parallel R_{casc},\qquad A_v\approx-g_{m1}\big(R_{load}\parallel\beta r_{o2}\big)$$
          With a resistor $R_C$: $A_v\approx-g_{m1}R_C$, the common emitter's gain. With an ideal current-source load: $A_v\approx-g_{m1}\beta r_{o2} = -\beta\dfrac{V_A}{V_T}$.

        **Numbers** (reference transistors, $V_A = 100\,\text{V}$): with $R_C = 5\kO$, $G_M = 39.6\,\text{mS}$, $R_{out} = 4.997\kO$, $A_v = -198$ (a plain common emitter with the same $R_C$ and $r_o$: $-190.5$). With an ideal current-source load, $R_{out} = 9.86\,\text{M}\Omega$ and $A_v = -3.9\times10^5$. With a PNP cascode load ($V_{A,p} = 50\,\text{V}$), $R_{out} = 9.86\parallel4.93\,\text{M}\Omega = 3.23\,\text{M}\Omega$ and $A_v = -1.28\times10^5$.
      `),
      R(md`
        ### Two more ways to the same gain

        **Follow the current.** $v_{in}$ makes $g_{m1}v_{in}$ in $Q_1$; $Q_2$ passes $\alpha_2$ of it; it flows in $R_{out}$: $A_v = -\alpha_2g_{m1}R_{out}$. That is $-G_MR_{out}$ again.

        **Stage by stage.** $Q_1$ is a common emitter loaded by $Q_2$'s emitter, $r_{e2}$, so $v_x/v_{in} = -g_{m1}r_{e2}\approx-g_{m1}/g_{m2} = -1$ for equal currents (exactly $-\alpha_2$ with $r_o\to\infty$). $Q_2$ is a common base driven at its emitter: $v_{out}/v_x = g_{m2}R_{out}$. The product is $-g_{m1}R_{out}$. $Q_1$ by itself has a gain of only about $-1$: that is what removes the Miller multiplication of $C_\mu$ (Chapter 12).

        !!mistake Common mistakes
          - **$G_M = g_{m1}g_{m2}\ldots$** The current passes through $Q_2$ unchanged (times $\alpha_2$); it is not amplified twice.
          - **$R_{out} = r_{o2}$, or $g_mr_o^2$.** A BJT cascode collector is about $\beta r_{o2}$.
          - **Expecting more gain from a cascode with a resistor load.** $R_C$ dominates $R_{out}$; the gain stays $\approx-g_{m1}R_C$.
      `),
      Q(md`A BJT cascode has a $5\kO$ resistor load. Compared with a plain common emitter with the same $R_C$ and bias, its gain is...`,
        [md`about the same`, md`about $\beta$ times larger`, md`about $g_mr_o$ times larger`, md`about half`], 0,
        [null, md`$\beta r_o$ is the cascode's own output resistance, but $R_C = 5\kO$ is in parallel and dominates.`, md`The extra $R_{out}$ is wasted when a small $R_C$ sets the output resistance.`, md`$G_M\approx g_{m1}$ and $R_{out}\approx R_C$, so the gain is $\approx-g_{m1}R_C$.`],
        md`$R_{out} = R_C\parallel R_{casc}\approx R_C$ and $G_M\approx g_{m1}$: $A_v\approx-g_{m1}R_C$. The cascode's gift with a resistor load is bandwidth, not gain.`),
      Q(md`In a cascode with equal currents in $Q_1$ and $Q_2$, what is the small-signal gain from $v_{in}$ to node $X$?`,
        [md`About $-1$`, md`About $-g_{m1}R_C$`, md`About $+1$`, md`About $0$`], 0,
        [null, md`That is the whole stage. $Q_1$'s collector sees only $r_{e2}$.`, md`$X$ is $Q_2$'s emitter, and $Q_1$'s current pulls it down.`, md`$X$ does move, by $-g_{m1}r_{e2}v_{in}$.`],
        md`$v_x/v_{in} = -g_{m1}r_{e2}\approx-g_{m1}/g_{m2} = -1$.`),
      P({
        id: 'bk09-casc-1', title: 'A cascode with a resistor load',
        q: md`Reference transistors ($1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$), $R_C = 5\kO$. Find $G_M$, $R_{out}$ and $A_v$ (with $r_o$), and the gain of a plain common emitter with the same $R_C$ and $r_o$.`,
        fig: F.cascAmp(),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 39.5943, accept: [40] }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4.99747, accept: [5] }, { lbl: 'A_v', unit: '', ans: -197.871, accept: [-200] }, { lbl: 'A_{v,CE}', unit: '', ans: -190.476 }],
        sol: md`
1. $G_M\approx\alpha g_{m1} = 39.6\,\text{mS}$ (the exact nodal value with $r_o$ is $39.59\,\text{mS}$).
2. $R_{casc} = 9.86\,\text{M}\Omega$, so $R_{out} = 5\kO\parallel9.86\,\text{M}\Omega = 4.997\kO$.
3. $A_v = -39.59\,\text{mS}\times4.997\kO = -197.9$.
4. Plain common emitter: $-g_m(R_C\parallel r_o) = -40\,\text{mS}\times4.762\kO = -190.5$. The cascode wins slightly because it removes $r_o$ from the output.`,
      }),
      P({
        id: 'bk09-casc-2', title: 'Current-source loads',
        q: md`The same cascode with (a) an ideal current-source load, (b) a PNP cascode load with $V_{A,p} = 50\,\text{V}$ ($\beta = 100$, $1\,\text{mA}$). Find $R_{out}$ and $A_v$ for each.`,
        fig: F.cascAmp({ load: 'pnp' }),
        parts: [{ lbl: 'R_{out,a}', unit: 'MΩ', ans: 9.85854 }, { lbl: 'A_{v,a}', unit: '', ans: -390341 }, { lbl: 'R_{out,b}', unit: 'MΩ', ans: 3.23468 }, { lbl: 'A_{v,b}', unit: '', ans: -128075 }],
        hints: [md`The PNP cascode looks like $r_{op}[1 + g_m(r_{op}\parallel r_\pi)] + r_{op}\parallel r_\pi$ with $r_{op} = 50\kO$.`],
        sol: md`
(a) $R_{out} = R_{casc} = 9.86\,\text{M}\Omega$; $A_v = -39.59\,\text{mS}\times9.86\,\text{M}\Omega = -3.90\times10^5$.
(b) The PNP cascode: $r_{op}\parallel r_\pi = 50\parallel2.5 = 2.381\kO$, so $R_{up} = 50\kO\times96.24 + 2.4\kO = 4.814\,\text{M}\Omega$. $R_{out} = 9.86\parallel4.81 = 3.23\,\text{M}\Omega$; $A_v = -39.59\,\text{mS}\times3.23\,\text{M}\Omega = -1.28\times10^5$.`,
      }),
      P({
        id: 'bk09-casc-3', title: '$G_M$ typed',
        q: md`Type $G_M$ of the BJT cascode with $r_o\to\infty$. Use \`gm1\`, \`beta2\`.`,
        fig: F.cascAmp(),
        parts: [Object.assign(ex('gm1*beta2/(beta2 + 1)', ['gm1', 'beta2'], 'G_M'), { rtol: 1e-6 })],
        sol: md`$Q_1$ draws $g_{m1}v_{in}$ from $X$; it comes out of $Q_2$'s emitter; $\alpha_2$ of it reaches the collector: $G_M = \alpha_2g_{m1} = \dfrac{\beta_2}{\beta_2 + 1}g_{m1}$.`,
      }),
      P({
        id: 'bk09-casc-4', title: 'The gain to node $X$',
        q: md`In the cascode ($r_o\to\infty$), $Q_1$ runs at $1\,\text{mA}$ and $Q_2$ at the same current, $\beta = 100$. Find the resistance $Q_1$ sees looking into $Q_2$'s emitter and the gain $v_x/v_{in}$.`,
        fig: F.cascAmp(),
        parts: [{ lbl: 'R_X', unit: 'Ω', ans: 24.7525, accept: [25] }, { lbl: 'v_x/v_{in}', unit: '', ans: -0.990099, accept: [-1] }],
        sol: md`$R_X = r_{e2} = r_{\pi2}/(\beta + 1) = 24.75\,\Omega$; $v_x/v_{in} = -g_{m1}R_X = -40\,\text{mS}\times24.75\,\Omega = -0.990$.`,
      }),
      R(md`
        ### Drill

        Cascodes with resistor, ideal and PNP-cascode loads.
      `),
      G('bk9_casc', { need: 3 }),
    ],
  });

  // ================================================================== 9.6 real amplifiers: bias networks and capacitors
  const sp26 = [
    ['rail', [1, -3.4], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -3.4], [1, -2.2], { n: 'R_{C1}', s: '2\\,\\text{k}\\Omega' }], ['R', [1, -2.2], [1, -1], { n: 'R_{C2}', s: '2\\,\\text{k}\\Omega' }],
    ['w', [1, -2.2], [0.3, -2.2]], ['C', [0.3, -2.2], [0.3, -1], { n: '\\infty', side: 'l' }], ['w', [0.3, -1], [1, -1]],
    ['npn', [1, 0]], ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: '\\infty' }], ['w', [2.5, -1], [3, -1]], ['term', [3, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [3, -1], [3, 0.4], { n: 'R_L', s: '2\\,\\text{k}\\Omega' }], ['gnd', [3, 0.4]],
    ['R', [1, 1], [1, 2.4], { n: 'R_E', s: '2.3\\,\\text{k}\\Omega' }], ['gnd', [1, 2.4]], ['w', [1, 1], [2.3, 1]], ['C', [2.3, 1], [2.3, 2.4], { n: '\\infty' }], ['w', [2.3, 2.4], [1, 2.4]],
    ['w', [0, 0], [-0.6, 0], [-0.6, 0.2]], ['Vac', [-0.6, 0.2], [-0.6, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 1.2], [-0.6, 2.2], { n: '3\\,\\text{V}', side: 'l' }], ['gnd', [-0.6, 2.2]],
  ];
  const divCE = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 12\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: '5\\,\\text{k}\\Omega' }], ['npn', [1, 0]],
    ['R', [1, 1], [1, 2.2], { n: 'R_{E1}', s: '200\\,\\Omega' }], ['R', [1, 2.2], [1, 3.4], { n: 'R_{E2}', s: '1\\,\\text{k}\\Omega' }], ['gnd', [1, 3.4]],
    ['w', [1, 2.2], [2.1, 2.2]], ['C', [2.1, 2.2], [2.1, 3.4], { n: 'C_E' }], ['w', [2.1, 3.4], [1, 3.4]],
    ['rail', [-0.6, -2.2], { n: 'V_{CC}' }], ['R', [-0.6, -2.2], [-0.6, 0], { n: 'R_1', s: '50\\,\\text{k}\\Omega', side: 'l' }], ['R', [-0.6, 0], [-0.6, 2], { n: 'R_2', s: '10\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [-0.6, 2]],
    ['w', [-0.6, 0], [0, 0]], ['w', [-0.6, 0], [-1.2, 0]], ['C', [-1.2, 0], [-2, 0], { n: 'C_1' }], ['R', [-2, 0], [-3.2, 0], { n: 'R_S', s: '1\\,\\text{k}\\Omega' }], ['w', [-3.2, 0], [-3.2, 0.3]], ['Vac', [-3.2, 0.3], [-3.2, 1.3], { n: 'v_s', side: 'l' }], ['gnd', [-3.2, 1.3]],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: 'C_2' }], ['w', [2.5, -1], [3.2, -1]], ['R', [3.2, -1], [3.2, 0.4], { n: 'R_L', s: '10\\,\\text{k}\\Omega' }], ['gnd', [3.2, 0.4]], ['term', [3.2, -1], { n: 'v_{out}', side: 'a' }],
  ];
  const divCC = [
    ['rail', [1, -1], { n: 'V_{CC} = 10\\,\\text{V}' }], ['npn', [1, 0]], ['R', [1, 1], [1, 2.4], { n: 'R_E', s: '4.3\\,\\text{k}\\Omega' }], ['gnd', [1, 2.4]],
    ['rail', [-0.6, -1.4], { n: 'V_{CC}' }], ['R', [-0.6, -1.4], [-0.6, 0], { n: 'R_1', s: '20\\,\\text{k}\\Omega', side: 'l' }], ['R', [-0.6, 0], [-0.6, 1.6], { n: 'R_2', s: '20\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [-0.6, 1.6]],
    ['w', [-0.6, 0], [0, 0]], ['w', [-0.6, 0], [-1.2, 0]], ['C', [-1.2, 0], [-2, 0], { n: 'C_1' }], ['R', [-2, 0], [-3.2, 0], { n: 'R_S', s: '2\\,\\text{k}\\Omega' }], ['w', [-3.2, 0], [-3.2, 0.3]], ['Vac', [-3.2, 0.3], [-3.2, 1.3], { n: 'v_s', side: 'l' }], ['gnd', [-3.2, 1.3]],
    ['w', [1, 1], [1.7, 1]], ['C', [1.7, 1], [2.5, 1], { n: 'C_2' }], ['w', [2.5, 1], [3.2, 1]], ['R', [3.2, 1], [3.2, 2.4], { n: 'R_L', s: '1\\,\\text{k}\\Omega' }], ['gnd', [3.2, 2.4]], ['term', [3.2, 1], { n: 'v_{out}', side: 'a' }],
  ];
  const pnpCE = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_E', s: '2\\,\\text{k}\\Omega' }], ['w', [1, -1], [2.1, -1]], ['C', [2.1, -1], [2.1, -2.2], { n: 'C_E' }], ['w', [2.1, -2.2], [1, -2.2]],
    ['pnp', [1, 0]], ['R', [1, 1], [1, 2.4], { n: 'R_C', s: '3\\,\\text{k}\\Omega' }], ['gnd', [1, 2.4]],
    ['rail', [-0.6, -2.2], { n: 'V_{CC}' }], ['R', [-0.6, -2.2], [-0.6, 0], { n: 'R_1', s: '30\\,\\text{k}\\Omega', side: 'l' }], ['R', [-0.6, 0], [-0.6, 2], { n: 'R_2', s: '60\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [-0.6, 2]],
    ['w', [-0.6, 0], [0, 0]], ['w', [-0.6, 0], [-1.2, 0]], ['C', [-1.2, 0], [-2, 0], { n: 'C_1' }], ['w', [-2, 0], [-2.4, 0], [-2.4, 0.3]], ['Vac', [-2.4, 0.3], [-2.4, 1.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-2.4, 1.3]],
    ['w', [1, 1], [1.7, 1]], ['C', [1.7, 1], [2.5, 1], { n: 'C_2' }], ['w', [2.5, 1], [3.2, 1]], ['R', [3.2, 1], [3.2, 2.4], { n: 'R_L', s: '6\\,\\text{k}\\Omega' }], ['gnd', [3.2, 2.4]], ['term', [3.2, 1], { n: 'v_{out}', side: 'a' }],
  ];
  const cbBy = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 12\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: '5\\,\\text{k}\\Omega' }], ['npn', [1, 0]], ['w', [1, -1], [1.8, -1]], ['term', [1.8, -1], { n: 'v_{out}' }],
    ['rail', [-0.6, -2.2], { n: 'V_{CC}' }], ['R', [-0.6, -2.2], [-0.6, 0], { n: 'R_1', s: '40\\,\\text{k}\\Omega', side: 'l' }], ['R', [-0.6, 0], [-0.6, 2], { n: 'R_2', s: '20\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [-0.6, 2]],
    ['w', [-0.6, 0], [0, 0]], ['w', [0, 0], [0, 0.7]], ['C', [0, 0.7], [0, 2], { n: 'C_B', side: 'r' }], ['gnd', [0, 2]],
    ['R', [1, 1], [1, 2.4], { n: 'R_E', s: '3.3\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [1, 2.4]], ['w', [1, 1], [2, 1]], ['C', [2, 1], [2.8, 1], { n: 'C_1' }], ['R', [2.8, 1], [4, 1], { n: 'R_S', s: '50\\,\\Omega' }], ['w', [4, 1], [4, 1.3]], ['Vac', [4, 1.3], [4, 2.3], { n: 'v_s' }], ['gnd', [4, 2.3]],
  ];
  L({
    id: 'bk09-bias', title: 'Real amplifiers: bias networks, coupling and bypass capacitors', ref: 'Lectures 22–24; Spring 2026 Midterm 2 Problem 3',
    steps: [
      R(md`
        ### The question

        Every stage so far was drawn with its signal source on the base and a magic DC bias. A real amplifier must set its own operating point with resistors, and then keep the bias network out of the signal's way with capacitors. Exam 3's first problem is exactly this: **find the DC point, then $g_m$ and $r_\pi$, then the gain.** Last semester's version is [Spring 2026 Midterm 2, Problem 3](#/l/e3-sp26-bjt).
      `),
      R(md`
        ### The physical picture: two circuits in one

        The transistor must sit at a DC operating point (a collector current, and a collector voltage that keeps it in forward active), and the signal rides on top ([Chapter 1](#/l/bk01-two)). Capacitors let one circuit serve both jobs:
        - A **coupling capacitor** passes the signal but blocks DC, so the source and the load cannot disturb the bias.
        - A **bypass capacitor** across $R_E$ shorts it for signals but not for DC. DC sees $R_E$ (a stable bias, through the $(\beta + 1)R_E$ feedback); the signal does not (full gain).

        At DC every capacitor is open. At signal frequencies every big capacitor is a short, and every DC supply is ground. Two pictures, solved one after the other.

        !!method The exam procedure
          1. **DC.** Open the capacitors. Replace a divider by its Thévenin equivalent $V_{TH} = V_{CC}\dfrac{R_2}{R_1 + R_2}$, $R_{TH} = R_1\parallel R_2$. KVL around the base loop: $V_{TH} = I_BR_{TH} + 0.7 + (\beta + 1)I_BR_E$. Then $I_C = \beta I_B$.
          2. **Check forward active:** $V_C\ge V_B$ (NPN), $V_C\le V_B$ (PNP).
          3. **Small-signal parameters:** $g_m = I_C/V_T$, $r_\pi = \beta/g_m$ (and $r_o$ if $V_A$ is given).
          4. **AC circuit.** Short the capacitors, ground the supplies. Name the stage. Note what is left of $R_E$, what loads the collector ($R_C\parallel R_L$), and what the bias divider adds at the input ($R_1\parallel R_2$).
          5. **Gain:** $A_v = -G_MR_{out}$ with the chapter's results. If the source has resistance $R_S$, multiply by the input divider $\dfrac{R_{in}}{R_{in} + R_S}$.
      `),
      RF(md`
        ### Example 1: last semester's Problem 3

        [[fig:c]]

        **DC.** The base is held at $3\,\text{V}$, so the emitter sits at $2.3\,\text{V}$ and $I_E = 2.3\,\text{V}/2.3\kO = 1\,\text{mA}$. With $\beta + 1\approx\beta$ (allowed on that exam), $I_C\approx1\,\text{mA}$; exactly, $I_C = \alpha\times1\,\text{mA} = 0.990\,\text{mA}$. $V_C = 10 - 4\kO\times0.99\,\text{mA} = 6.04\,\text{V} > V_B = 3\,\text{V}$: forward active.

        **Small signal.** $g_m = 40\,\text{mS}$. The emitter capacitor makes the emitter incremental ground; the capacitor across $R_{C2}$ shorts it; $R_L$ hangs on the collector through the output capacitor. A plain common emitter with load $R_{C1}\parallel R_L = 1\kO$:
        $$A_V = -g_m(R_{C1}\parallel R_L) = -40\,\text{mS}\times1\kO = -40$$
        ($-39.6$ with the exact $I_C$.) Note what $R_{C2}$ did: it sets the DC collector voltage but is invisible to the signal.
      `, { c: { fig: sp26, cap: 'Spring 2026 Midterm 2, Problem 3.' } }),
      RF(md`
        ### Example 2: divider bias with a partly bypassed emitter

        [[fig:c]]

        **1. DC.** $V_{TH} = 12\times\dfrac{10}{60} = 2\,\text{V}$, $R_{TH} = 50\parallel10 = 8.33\kO$. Only $R_{E2}$ is bypassed, and only for signals: DC sees $R_{E1} + R_{E2} = 1.2\kO$.
        $$I_B = \frac{2 - 0.7}{8.33\kO + 101\times1.2\kO} = \frac{1.3}{129.5\kO} = 10.04\,\mu\text{A},\qquad I_C = 1.004\,\text{mA}$$

        **2. Check.** $V_B = 2 - I_BR_{TH} = 1.92\,\text{V}$, $V_C = 12 - 5\kO\times1.004\,\text{mA} = 6.98\,\text{V}$: forward active.

        **3. Parameters.** $g_m = 40.1\,\text{mS}$, $r_\pi = 2.49\kO$, $r_e = 24.7\,\Omega$.

        **4. AC circuit.** A common emitter with $R_{E1} = 200\,\Omega$ unbypassed, collector load $R_C\parallel R_L = 3.33\kO$, and the divider $R_{TH} = 8.33\kO$ from base to ground.

        **5. Gain.** From the base: $A_v = -\dfrac{\beta(R_C\parallel R_L)}{r_\pi + (\beta + 1)R_{E1}} = -\dfrac{100\times3.33\kO}{2.49 + 20.2\kO} = -14.7$ (check: $-\dfrac{R_C\parallel R_L}{r_e + R_{E1}} = -14.8$). The source sees $R_{in} = R_{TH}\parallel22.7\kO = 6.09\kO$, so from $v_s$ (with $R_S = 1\kO$): $-14.7\times\dfrac{6.09}{7.09} = -12.6$.
      `, { c: { fig: divCE, cap: 'Divider bias, $R_{E2}$ bypassed, input and output coupled.' } }),
      RF(md`
        ### Example 3: an emitter follower with divider bias

        [[fig:c]]

        **DC.** $V_{TH} = 5\,\text{V}$, $R_{TH} = 10\kO$; $I_B = \dfrac{5 - 0.7}{10\kO + 101\times4.3\kO} = 9.68\,\mu\text{A}$, $I_C = 0.968\,\text{mA}$; $g_m = 38.7\,\text{mS}$, $r_\pi = 2.58\kO$.

        **AC.** The emitter's load is $R_E\parallel R_L = 811\,\Omega$. The base looks like $r_\pi + 101\times811\,\Omega = 84.5\kO$; with the divider, $R_{in} = 10\parallel84.5 = 8.94\kO$. From the source: Thévenin at the base is $v_s\dfrac{R_{TH}}{R_{TH} + R_S}$ behind $R_S\parallel R_{TH} = 1.67\kO$, and the follower passes $\dfrac{(\beta + 1)811}{1.67\kO + 2.58\kO + 81.9\kO} = 0.951$ of it:
        $$\frac{v_{out}}{v_s} = 0.833\times0.951 = 0.792$$
        The output resistance (with the source attached) is $811\,\Omega\parallel\dfrac{1.67 + 2.58\kO}{101} = 40\,\Omega$.
      `, { c: { fig: divCC, cap: 'A follower: divider bias, coupled source and load.' } }),
      RF(md`
        ### Example 4: a PNP common emitter

        [[fig:c]]

        **DC.** The PNP's base divider: $V_{TH} = 10\times\dfrac{60}{90} = 6.67\,\text{V}$, $R_{TH} = 20\kO$. The base current flows **out** of a PNP's base, so KVL from $V_{CC}$: $V_{CC} - (\beta + 1)I_BR_E - 0.7 - I_BR_{TH} = V_{TH}$, giving $I_B = \dfrac{10 - 0.7 - 6.67}{20\kO + 101\times2\kO} = 11.9\,\mu\text{A}$ and $I_C = 1.19\,\text{mA}$. $V_B = 6.90\,\text{V}$, $V_C = 3.56\,\text{V}$: below the base, forward active.

        **AC.** $R_E$ is bypassed: a plain common emitter, upside down. $g_m = 47.4\,\text{mS}$, $r_\pi = 2.11\kO$, load $R_C\parallel R_L = 2\kO$:
        $$A_v = -g_m(R_C\parallel R_L) = -94.9,\qquad R_{in} = R_{TH}\parallel r_\pi = 1.91\kO$$
      `, { c: { fig: pnpCE, cap: 'A PNP common emitter, emitter bypassed.' } }),
      RF(md`
        ### Example 5: a common base with a bypassed base

        [[fig:c]]

        **DC.** $V_{TH} = 4\,\text{V}$, $R_{TH} = 13.3\kO$: $I_B = \dfrac{3.3}{13.3\kO + 101\times3.3\kO} = 9.52\,\mu\text{A}$, $I_C = 0.952\,\text{mA}$, $g_m = 38.1\,\text{mS}$.

        **AC.** $C_B$ grounds the base, so $R_B = 0$ for signals; the source drives the emitter through $C_1$. The emitter node sees $R_E\parallel r_e = 3.3\kO\parallel26.0\,\Omega = 25.8\,\Omega$, which forms a divider with $R_S = 50\,\Omega$; then the common base gives $g_mR_C$ from emitter to collector:
        $$\frac{v_{out}}{v_s} = \frac{25.8}{25.8 + 50}\times g_mR_C = 0.340\times190.4 = 64.8$$
        (Driven by a voltage at its emitter, a common base gives exactly $v_{out}/v_e = g_mR_C$.) Without $C_B$ the base would sit behind $R_{TH} = 13.3\kO$, adding $13.3\kO/101 = 132\,\Omega$ to the emitter and wrecking the gain.

        !!mistake Common mistakes
          - **Using the total $R_E$ in the gain** when part of it is bypassed (or the whole of it is).
          - **Forgetting the divider at the input:** $R_{in} = R_1\parallel R_2\parallel R_{in,base}$.
          - **Forgetting $R_L$** (through its coupling capacitor it is in parallel with $R_C$).
          - **Skipping the forward-active check.** If $V_C < V_B$ for an NPN, the small-signal model does not apply.
          - **PNP base current direction:** it flows **out** of the base.
      `, { c: { fig: cbBy, cap: 'A common base: divider bias, base bypassed by $C_B$, source coupled into the emitter.' } }),
      Q(md`In Example 2, someone uses the full $R_{E1} + R_{E2} = 1.2\kO$ in the gain. About what do they get, and what went wrong?`,
        [md`About $-2.7$: $R_{E2}$ is bypassed, so the signal never sees it`, md`About $-14.7$: nothing went wrong`, md`About $-133$: they dropped all of $R_E$`, md`About $-2.7$, and that is right, because DC flows through $R_{E2}$`], 0,
        [null, md`$-14.7$ is the correct answer; using $1.2\kO$ gives a much smaller gain.`, md`$-g_m(R_C\parallel R_L) = -134$ would be the fully bypassed stage.`, md`DC and signals see different circuits: the capacitor shorts $R_{E2}$ only for the signal.`],
        md`$-\dfrac{3.33\kO}{0.025 + 1.2\kO} = -2.7$, five times too small. The signal sees only $R_{E1}$: $-3.33\kO/0.225\kO = -14.8$.`),
      Q(md`A divider bias ($R_1 = 50\kO$, $R_2 = 10\kO$) feeds a common emitter whose base looks like $r_\pi = 2.5\kO$ (emitter bypassed). What input resistance does a coupled source see?`,
        [md`About $1.9\kO$`, md`About $2.5\kO$`, md`About $8.3\kO$`, md`About $62.5\kO$`], 0,
        [null, md`The divider is also connected to the base: $R_1$ and $R_2$ go to incremental ground.`, md`That is $R_1\parallel R_2$ alone; the base is in parallel too.`, md`Both divider resistors go to incremental ground (one to $V_{CC}$), so they are in parallel, not series.`],
        md`$R_{in} = R_1\parallel R_2\parallel r_\pi = 8.33\parallel2.5 = 1.92\kO$.`),
      P({
        id: 'bk09-bias-1', title: 'Example 2, your turn: the DC point',
        q: md`For the circuit of Example 2 ($\beta = 100$), find $V_{TH}$, $R_{TH}$, $I_C$ and $V_C$.`,
        fig: divCE,
        parts: [{ lbl: 'V_{TH}', unit: 'V', ans: 2 }, { lbl: 'R_{TH}', unit: 'kΩ', ans: 8.3333 }, { lbl: 'I_C', unit: 'mA', ans: 1.00360, traps: [{ v: 1.08333, msg: 'That ignores the base current through $R_{TH}$ (a stiff-divider estimate). Use the full KVL.' }] }, { lbl: 'V_C', unit: 'V', ans: 6.98199 }],
        sol: md`$V_{TH} = 2\,\text{V}$, $R_{TH} = 8.33\kO$. $I_B = 1.3\,\text{V}/(8.33\kO + 121.2\kO) = 10.04\,\mu\text{A}$, $I_C = 1.0036\,\text{mA}$, $V_C = 12 - 5.018 = 6.98\,\text{V}$.`,
      }),
      P({
        id: 'bk09-bias-2', title: 'Example 2, your turn: the gain',
        q: md`Same circuit. Find $g_m$, $r_\pi$, the gain from the base $v_b$ to $v_{out}$, the input resistance $R_{in}$ seen through $C_1$, and the overall gain $v_{out}/v_s$ ($R_S = 1\kO$).`,
        fig: divCE,
        parts: [{ lbl: 'g_m', unit: 'mS', ans: 40.1441 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.49103 }, { lbl: 'v_{out}/v_b', unit: '', ans: -14.6901, accept: [-14.8], traps: [{ v: -2.7347, msg: 'Only $R_{E1}$ is in the signal path; $R_{E2}$ is bypassed.' }, { v: -22.0351, msg: 'Include $R_L$: through $C_2$ it is in parallel with $R_C$.' }] },
          { lbl: 'R_{in}', unit: 'kΩ', ans: 6.09495, traps: [{ v: 22.691, msg: 'Include the bias divider: $R_1\\parallel R_2$ is in parallel with the base.' }] }, { lbl: 'v_{out}/v_s', unit: '', ans: -12.6196 }],
        sol: md`
$g_m = 1.0036\,\text{mA}/25\,\text{mV} = 40.14\,\text{mS}$, $r_\pi = 2.491\kO$.
From the base: $-\dfrac{\beta(R_C\parallel R_L)}{r_\pi + (\beta + 1)R_{E1}} = -\dfrac{100\times3.333\kO}{2.491 + 20.2\kO} = -14.69$.
$R_{in} = 8.333\parallel22.69 = 6.095\kO$; $v_{out}/v_s = -14.69\times\dfrac{6.095}{7.095} = -12.62$.`,
      }),
      P({
        id: 'bk09-bias-3', title: 'Example 4: the PNP stage',
        q: md`For the PNP circuit of Example 4 ($\beta = 100$), find $I_C$, $g_m$, $A_v = v_{out}/v_{in}$ and $R_{in}$.`,
        fig: pnpCE,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1.18619 }, { lbl: 'g_m', unit: 'mS', ans: 47.4474 }, { lbl: 'A_v', unit: '', ans: -94.8949 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 1.90667 }],
        sol: md`DC: $I_B = \dfrac{10 - 0.7 - 6.667}{20\kO + 202\kO} = 11.86\,\mu\text{A}$, $I_C = 1.186\,\text{mA}$. $g_m = 47.45\,\text{mS}$, $r_\pi = 2.108\kO$. $A_v = -g_m(3\parallel6\kO) = -94.9$, $R_{in} = 20\parallel2.108 = 1.907\kO$.`,
      }),
      P({
        id: 'bk09-bias-4', title: 'Example 5: the common base',
        q: md`For the common base of Example 5 ($\beta = 100$), find $I_C$, the resistance of the emitter node to ground ($R_E\parallel r_e$), and $v_{out}/v_s$.`,
        fig: cbBy,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.952015 }, { lbl: 'R_E\\parallel r_e', unit: 'Ω', ans: 25.7969 }, { lbl: 'v_{out}/v_s', unit: '', ans: 64.8021 }],
        sol: md`
DC: $I_B = 3.3\,\text{V}/346.6\kO = 9.52\,\mu\text{A}$, $I_C = 0.952\,\text{mA}$, $g_m = 38.08\,\text{mS}$, $r_e = \alpha/g_m = 26.0\,\Omega$.
AC: $R_E\parallel r_e = 25.8\,\Omega$; $v_e = v_s\dfrac{25.8}{75.8} = 0.340\,v_s$; $v_{out} = g_mR_C\,v_e = 190.4\,v_e$; so $v_{out}/v_s = 64.8$.`,
      }),
      R(md`
        ### Drill

        Full problems, DC first: divider-biased common emitters (bypassed, partly bypassed), followers, PNP stages and common bases.
      `),
      G('bk9_bias', { need: 3 }),
    ],
  });

  // ================================================================== 9.7 chains
  const chain1 = [
    ['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_{C1}', side: 'l' }], ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['w', [1, 0], [1, 0.4], [2, 0.4]], ['npn', [3, 0.4], { n: 'Q_2' }], ['rail', [3, -0.6], { n: 'V_{CC}' }], ['R', [3, 1.4], [3, 2.6], { n: 'R_{E2}', side: 'l' }], ['gnd', [3, 2.6]],
    ['w', [3, 1.4], [3.8, 1.4]], ['R', [3.8, 1.4], [3.8, 2.6], { n: 'R_L' }], ['gnd', [3.8, 2.6]], ['term', [3.8, 1.4], { n: 'v_{out}', side: 'r' }],
  ];
  const chain2 = [
    ['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_{C1}', side: 'l' }], ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['w', [1, 0], [1, 0.4], [2, 0.4], [2, 1], [2.4, 1]], ['npn', [3.4, 1], { n: 'Q_2' }], ['gnd', [3.4, 2]], ['R', [3.4, -1.2], [3.4, 0], { n: 'R_{C2}' }], ['rail', [3.4, -1.2], { n: 'V_{CC}' }],
    ['w', [3.4, 0], [4.1, 0]], ['term', [4.1, 0], { n: 'v_{out}' }],
  ];
  const chain4 = [
    ['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['w', [1, 0], [1, 0.4], [2, 0.4]], ['npn', [3, 0.4], { n: 'Q_2' }], ['rail', [3, -0.6], { n: 'V_{CC}' }], ['R', [3, 1.4], [3, 2.6], { n: 'R_E', side: 'l' }], ['gnd', [3, 2.6]],
    ['w', [3, 1.4], [3.8, 1.4]], ['R', [3.8, 1.4], [3.8, 2.6], { n: 'R_L' }], ['gnd', [3.8, 2.6]], ['term', [3.8, 1.4], { n: 'v_{out}', side: 'r' }],
  ];
  const chain5 = [
    ['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1], { n: 'Q_1' }], ['R', [-1.3, 1], [0, 1], { n: 'R_S' }], ['w', [-1.3, 1], [-1.8, 1], [-1.8, 1.3]], ['Vac', [-1.8, 1.3], [-1.8, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.8, 2.3]],
    ['R', [1, 2], [1, 3.4], { n: 'R_{E1}', side: 'l' }], ['gnd', [1, 3.4]], ['w', [1, 2], [2.4, 2]], ['npn', [3.4, 2], { n: 'Q_2' }], ['gnd', [3.4, 3]],
    ['R', [3.4, -0.2], [3.4, 1], { n: 'R_{C2}' }], ['rail', [3.4, -0.2], { n: 'V_{CC}' }], ['w', [3.4, 1], [4.1, 1]], ['term', [4.1, 1], { n: 'v_{out}' }],
  ];
  L({
    id: 'bk09-chain', title: 'Chains that mix BJTs and MOSFETs', ref: 'Lectures 24, 28–29 with Chapter 5',
    steps: [
      R(md`
        ### The question

        Real amplifiers are chains: a gain stage, a buffer, another gain stage. The new difficulty is **loading**: each stage's input resistance hangs on the previous stage's output node. A MOSFET gate does not load anything; a BJT base always does ([Chapter 8](#/l/bk08-node)). Exam 3's second problem often mixes the two.

        !!method Two ways through a chain
          **Loaded gains.** For each stage, include the next stage's input resistance in its $R_{out}$, compute $A_{vk} = -G_{Mk}R_{out,k}$ from its own input node to its output node, and multiply.

          **Thévenin.** Compute each stage's unloaded output voltage and output resistance; drive the next stage from that Thévenin source (its resistance acts like a source resistance $R_B$). Both give the same product; use one as a check on the other.
      `),
      RF(md`
        ### A common emitter into an emitter follower

        $Q_1$: $1\,\text{mA}$, $R_{C1} = 10\kO$. $Q_2$: $2\,\text{mA}$, $R_{E2} = 1\kO$, driving $R_L = 500\,\Omega$. $\beta = 100$, $r_o\to\infty$.

        [[fig:c]]

        1. **Stage 2's input:** $r_{\pi2} + (\beta + 1)(R_{E2}\parallel R_L) = 1.25\kO + 101\times333\,\Omega = 34.9\kO$.
        2. **Stage 1, loaded:** $A_{v1} = -g_{m1}(R_{C1}\parallel34.9\kO) = -40\,\text{mS}\times7.77\kO = -311$.
        3. **Stage 2 from its base** (no source resistance: the base *is* the node): $A_{v2} = \dfrac{(\beta + 1)333\,\Omega}{34.9\kO} = 0.964$.
        4. **Total:** $-311\times0.964 = -300$.

        **Check by Thévenin:** stage 1 unloaded gives $-400\,v_{in}$ behind $10\kO$; the follower with $R_B = 10\kO$ passes $\dfrac{33.7\kO}{10 + 1.25 + 33.7\kO} = 0.750$: $-400\times0.750 = -300$. ✓

        Without the follower, the common emitter would drive $500\,\Omega$ directly: $-40\,\text{mS}\times(10\kO\parallel500\,\Omega) = -19$. The buffer is worth a factor of 16.
      `, { c: { fig: chain1, cap: 'A common emitter driving an emitter follower.' } }),
      RF(md`
        ### Two common emitters: the price of a bare base

        $Q_1$ and $Q_2$ both at $1\,\text{mA}$, $R_{C1} = R_{C2} = 10\kO$, $\beta = 100$, $Q_2$'s emitter grounded.

        [[fig:c]]

        $Q_2$'s base loads node 1 with $r_{\pi2} = 2.5\kO$: $A_{v1} = -40\,\text{mS}\times(10\parallel2.5\kO) = -80$, not $-400$. $A_{v2} = -400$. Total $+32{,}000$ instead of the $160{,}000$ you would get with a MOSFET-like infinite input. (An emitter resistor under $Q_2$, or a follower between the stages, would raise the load from $2.5\kO$ to $(\beta + 1)$ times more.)
      `, { c: { fig: chain2, cap: 'Two common emitters: $Q_2$\'s base loads $Q_1$.' } }),
      RF(md`
        ### MOSFETs in the chain

        **A common emitter into a common source.** The gate draws nothing, so stage 1 is unloaded: $A_v = (-g_{m1}R_{C1})(-g_{m2}R_D)$. No loading term at all.

        **A common source into an emitter follower.** $M_1$: $g_m = 2\,\text{mS}$, $R_D = 10\kO$. $Q_2$: $1\,\text{mA}$, $\beta = 100$, $R_E = 1\kO$, $R_L = 100\,\Omega$. The follower's base presents $2.5\kO + 101\times90.9\,\Omega = 11.7\kO$:
        $$A_{v1} = -2\,\text{mS}\times(10\parallel11.7\kO) = -10.8,\qquad A_{v2} = \frac{9.18\kO}{11.68\kO} = 0.786,\qquad A_v = -8.47$$

        [[fig:c]]
      `, { c: { fig: chain4, cap: 'A common source into an emitter follower.' } }),
      RF(md`
        ### A follower in front: buffering a weak source

        A source with $R_S = 50\kO$ must drive a common emitter ($Q_2$: $1\,\text{mA}$, $R_{C2} = 5\kO$, $r_{\pi2} = 2.5\kO$). Directly: $-\dfrac{\beta R_{C2}}{R_S + r_{\pi2}} = -9.5$. Put a follower $Q_1$ ($0.5\,\text{mA}$, $R_{E1} = 10\kO$) in between: its load is $R_{E1}\parallel r_{\pi2} = 2\kO$, its gain from the source $\dfrac{101\times2\kO}{50 + 5 + 202\kO} = 0.786$, and then $Q_2$ gives $-g_{m2}R_{C2} = -200$: total $-157$. Sixteen times more.

        [[fig:c]]

        !!mistake Common mistakes
          - **Multiplying unloaded gains.** Each stage's output node is loaded by the next stage's input (unless that input is a gate).
          - **Mixing the methods.** With loaded gains, the next stage is driven from its base with no source resistance; with Thévenin, use the unloaded gain and add the source resistance.
          - **Forgetting that a follower's input includes its load:** $r_\pi + (\beta + 1)(R_E\parallel R_L)$.
      `, { c: { fig: chain5, cap: 'A follower buffering a $50\\kO$ source into a common emitter.' } }),
      Q(md`A common emitter with $R_C = 10\kO$ drives the gate of a MOSFET common source. How does the MOSFET change the first stage's gain?`,
        [md`Not at all: a gate draws no current`, md`It halves it`, md`It loads it with $1/g_m$ of the MOSFET`, md`It loads it with $r_\pi$`], 0,
        [null, md`Only a resistive load in parallel with $R_C$ would; a gate is an open circuit.`, md`$1/g_m$ is what a MOSFET's **source** looks like, not its gate.`, md`$r_\pi$ belongs to a BJT base.`],
        md`The gate is a capacitor plate: the first stage's $R_{out}$ stays $R_C$.`),
      Q(md`A common emitter ($R_C = 10\kO$) drives the base of a second common emitter whose emitter is grounded ($r_{\pi2} = 2.5\kO$). The first stage's gain is reduced to about...`,
        [md`one fifth`, md`one half`, md`nothing: bases do not load`, md`$1/\beta$`], 0,
        [null, md`$10\parallel2.5 = 2\kO$, not $5\kO$.`, md`A base draws current through $r_\pi$.`, md`The load is $r_\pi$, not $\beta$ times anything.`],
        md`$R_{out}$ falls from $10\kO$ to $10\parallel2.5 = 2\kO$: one fifth of the gain.`),
      P({
        id: 'bk09-chain-1', title: 'Common emitter into a follower',
        q: md`The first example above: $Q_1$ at $1\,\text{mA}$ with $R_{C1} = 10\kO$; $Q_2$ at $2\,\text{mA}$ with $R_{E2} = 1\kO$ and $R_L = 500\,\Omega$; $\beta = 100$, $r_o\to\infty$. Find $R_{in2}$, $A_{v1}$ (loaded), $A_{v2}$ and $A_v$.`,
        fig: chain1,
        parts: [{ lbl: 'R_{in2}', unit: 'kΩ', ans: 34.9167 }, { lbl: 'A_{v1}', unit: '', ans: -310.946, traps: [{ v: -400, msg: 'That is unloaded: $Q_2$\'s input is in parallel with $R_{C1}$.' }] }, { lbl: 'A_{v2}', unit: '', ans: 0.964200 }, { lbl: 'A_v', unit: '', ans: -299.814 }],
        sol: md`$R_{in2} = 1.25 + 101\times0.3333 = 34.92\kO$; $A_{v1} = -0.04\times(10\parallel34.92)\kO = -310.9$; $A_{v2} = 33.67/34.92 = 0.9642$; $A_v = -299.8$.`,
      }),
      P({
        id: 'bk09-chain-2', title: 'Two common emitters',
        q: md`The second example: two common emitters at $1\,\text{mA}$, $R_{C1} = R_{C2} = 10\kO$, $\beta = 100$, $r_o\to\infty$. Find $A_{v1}$, $A_{v2}$ and $A_v$.`,
        fig: chain2,
        parts: [{ lbl: 'A_{v1}', unit: '', ans: -80, traps: [{ v: -400, msg: '$Q_2$\'s base loads node 1 with $r_{\\pi2}$.' }] }, { lbl: 'A_{v2}', unit: '', ans: -400 }, { lbl: 'A_v', unit: '', ans: 32000, traps: [{ v: 160000, msg: 'That multiplies unloaded gains.' }] }],
        sol: md`$A_{v1} = -40\,\text{mS}\times(10\parallel2.5)\kO = -80$; $A_{v2} = -400$; $A_v = +32{,}000$.`,
      }),
      P({
        id: 'bk09-chain-3', title: 'A common source into a follower',
        q: md`The MOSFET example: $g_{m1} = 2\,\text{mS}$, $R_D = 10\kO$ ($r_{ds}\to\infty$); $Q_2$ at $1\,\text{mA}$, $\beta = 100$, $R_E = 1\kO$, $R_L = 100\,\Omega$. Find $A_{v1}$ and $A_v$.`,
        fig: chain4,
        parts: [{ lbl: 'A_{v1}', unit: '', ans: -10.7757, traps: [{ v: -20, msg: 'The follower\'s base loads the drain node: $R_D\\parallel R_{in2}$.' }] }, { lbl: 'A_v', unit: '', ans: -8.46960 }],
        sol: md`$R_{in2} = 2.5 + 101\times0.0909 = 11.68\kO$; $A_{v1} = -2\,\text{mS}\times(10\parallel11.68)\kO = -10.78$; $A_{v2} = 9.18/11.68 = 0.786$; $A_v = -8.47$.`,
      }),
      P({
        id: 'bk09-chain-4', title: 'A follower buffering a weak source',
        q: md`The last example: $R_S = 50\kO$, $Q_1$ at $0.5\,\text{mA}$ with $R_{E1} = 10\kO$, $Q_2$ at $1\,\text{mA}$ with $R_{C2} = 5\kO$, $\beta = 100$, $r_o\to\infty$. Find $v_{e1}/v_{in}$, $A_v$, and the gain without $Q_1$.`,
        fig: chain5,
        parts: [{ lbl: 'v_{e1}/v_{in}', unit: '', ans: 0.785992 }, { lbl: 'A_v', unit: '', ans: -157.198 }, { lbl: 'A_{direct}', unit: '', ans: -9.52381 }],
        sol: md`$R_{E1}\parallel r_{\pi2} = 2\kO$; $v_{e1}/v_{in} = \dfrac{101\times2\kO}{50 + 5 + 202\kO} = 0.786$; $A_v = 0.786\times(-200) = -157$. Directly: $-100\times5\kO/52.5\kO = -9.52$.`,
      }),
      R(md`
        ### Drill

        Two-stage chains of BJT and MOSFET stages: find the loading, then multiply.
      `),
      G('bk9_chain', { need: 3 }),
    ],
  });
  // ================================================================== Chapter 9 problems
  const exA = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 15\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: '6.8\\,\\text{k}\\Omega' }], ['npn', [1, 0]],
    ['R', [1, 1], [1, 2.2], { n: 'R_{E1}', s: '100\\,\\Omega' }], ['R', [1, 2.2], [1, 3.4], { n: 'R_{E2}', s: '1.5\\,\\text{k}\\Omega' }], ['gnd', [1, 3.4]],
    ['w', [1, 2.2], [2.1, 2.2]], ['C', [2.1, 2.2], [2.1, 3.4], { n: 'C_E' }], ['w', [2.1, 3.4], [1, 3.4]],
    ['rail', [-0.6, -2.2], { n: 'V_{CC}' }], ['R', [-0.6, -2.2], [-0.6, 0], { n: 'R_1', s: '68\\,\\text{k}\\Omega', side: 'l' }], ['R', [-0.6, 0], [-0.6, 2], { n: 'R_2', s: '12\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [-0.6, 2]],
    ['w', [-0.6, 0], [0, 0]], ['w', [-0.6, 0], [-1.2, 0]], ['C', [-1.2, 0], [-2, 0], { n: 'C_1' }], ['R', [-2, 0], [-3.2, 0], { n: 'R_S', s: '600\\,\\Omega' }], ['w', [-3.2, 0], [-3.2, 0.3]], ['Vac', [-3.2, 0.3], [-3.2, 1.3], { n: 'v_s', side: 'l' }], ['gnd', [-3.2, 1.3]],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: 'C_2' }], ['w', [2.5, -1], [3.2, -1]], ['R', [3.2, -1], [3.2, 0.4], { n: 'R_L', s: '10\\,\\text{k}\\Omega' }], ['gnd', [3.2, 0.4]], ['term', [3.2, -1], { n: 'v_{out}', side: 'a' }],
  ];
  const exB = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 9\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_E', s: '3.3\\,\\text{k}\\Omega', side: 'l' }], ['pnp', [1, 0]], ['gnd', [1, 1]],
    ['rail', [-0.6, -2.2], { n: 'V_{CC}' }], ['R', [-0.6, -2.2], [-0.6, 0], { n: 'R_1', s: '47\\,\\text{k}\\Omega', side: 'l' }], ['R', [-0.6, 0], [-0.6, 2], { n: 'R_2', s: '47\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [-0.6, 2]],
    ['w', [-0.6, 0], [0, 0]], ['w', [-0.6, 0], [-1.2, 0]], ['C', [-1.2, 0], [-2, 0], { n: 'C_1' }], ['R', [-2, 0], [-3.2, 0], { n: 'R_S', s: '5\\,\\text{k}\\Omega' }], ['w', [-3.2, 0], [-3.2, 0.3]], ['Vac', [-3.2, 0.3], [-3.2, 1.3], { n: 'v_s', side: 'l' }], ['gnd', [-3.2, 1.3]],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: 'C_2' }], ['w', [2.5, -1], [3.2, -1]], ['R', [3.2, -1], [3.2, 0.4], { n: 'R_L', s: '1\\,\\text{k}\\Omega' }], ['gnd', [3.2, 0.4]], ['term', [3.2, -1], { n: 'v_{out}', side: 'a' }],
  ];
  const exC = [
    ['rail', [1, -1.2], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -1.2], [1, 0], { n: 'R_{C1}', s: '5\\,\\text{k}\\Omega', side: 'l' }], ['npn', [1, 1], { n: 'Q_1' }], ['R', [1, 2], [1, 3.2], { n: 'R_{E1}', s: '1\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [1, 3.2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 2.3], [-0.6, 3.3], { n: '1.7\\,\\text{V}', side: 'l' }], ['gnd', [-0.6, 3.3]],
    ['w', [1, 0], [1, 0.4], [2, 0.4]], ['npn', [3, 0.4], { n: 'Q_2' }], ['rail', [3, -0.6], { n: 'V_{CC}' }], ['R', [3, 1.4], [3, 2.6], { n: 'R_{E2}', s: '4.3\\,\\text{k}\\Omega', side: 'l' }], ['gnd', [3, 2.6]],
    ['w', [3, 1.4], [3.6, 1.4]], ['C', [3.6, 1.4], [4.4, 1.4], { n: 'C' }], ['w', [4.4, 1.4], [5, 1.4]], ['R', [5, 1.4], [5, 2.6], { n: 'R_L', s: '1\\,\\text{k}\\Omega' }], ['gnd', [5, 2.6]], ['term', [5, 1.4], { n: 'v_{out}', side: 'a' }],
  ];
  const ceceRE = [
    ['rail', [1, -1.2], { n: 'V_{CC}' }], ['R', [1, -1.2], [1, 0], { n: 'R_{C1}', side: 'l' }], ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['w', [1, 0], [1, 0.4], [2, 0.4], [2, 1], [2.4, 1]], ['npn', [3.4, 1], { n: 'Q_2' }], ['R', [3.4, 2], [3.4, 3.2], { n: 'R_{E2}' }], ['gnd', [3.4, 3.2]], ['R', [3.4, -1.2], [3.4, 0], { n: 'R_{C2}' }], ['rail', [3.4, -1.2], { n: 'V_{CC}' }],
    ['w', [3.4, 0], [4.1, 0]], ['term', [4.1, 0], { n: 'v_{out}' }],
  ];
  const csce = [
    ['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_D', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['w', [1, 0], [1, 0.4], [2, 0.4], [2, 1], [2.4, 1]], ['npn', [3.4, 1], { n: 'Q_2' }], ['gnd', [3.4, 2]], ['R', [3.4, -1.2], [3.4, 0], { n: 'R_{C2}' }], ['rail', [3.4, -1.2], { n: 'V_{CC}' }],
    ['w', [3.4, 0], [4.1, 0]], ['term', [4.1, 0], { n: 'v_{out}' }],
  ];
  L({
    id: 'bk09-problems', title: 'Chapter 9 problems', kind: 'review', ref: 'Lecture 24',
    steps: [
      R(md`
        ### Chapter 9 summary

        $A_v = -G_MR_{out}$ for every stage, with $G_M$ found with the output shorted ($i_{out}$ flowing from the short into the stage) and $R_{out}$ with the input off. $r_e = \alpha/g_m\approx1/g_m$; $r_o\to\infty$ unless stated.

        | Stage | Result | Why, in one line |
        |---|---|---|
        | [common emitter](#/l/bk09-ce) | $G_M = g_m$, $R_{out} = R_C$, $R_{in} = r_\pi$, $A_v = -g_mR_C = -\dfrac{I_CR_C}{V_T}$ | $v_\pi = v_{in}$; $R_C$ turns $g_mv_{in}$ into a voltage |
        | with source resistance $R_B$ | $G_M = \dfrac{\beta}{R_B + r_\pi}$ | $R_B$ and $r_\pi$ divide the input |
        | with $r_o$ / active load | $R_{out} = R_C\parallel r_o$; $A_v = -g_m(r_{o1}\parallel r_{o2})$, at most $V_A/V_T$ | $r_o$ is a parallel path when the input is off |
        | [with $R_E$](#/l/bk09-cedeg) | $G_M = \dfrac{g_m}{1 + \frac{\beta + 1}{\beta}g_mR_E} = \dfrac{\alpha}{r_e + R_E}$, $R_{in} = r_\pi + (\beta + 1)R_E$ | $v_{in}$ lands across $r_e + R_E$ in series |
        | [common base](#/l/bk09-cb) | $R_{in} = R_E + \dfrac{R_B + r_\pi}{\beta + 1}$, $G_M = -\dfrac{\alpha}{R_{in}}$, $A_v = +\dfrac{\alpha R_C}{R_{in}}$ | the emitter current $v_{in}/R_{in}$ reaches $R_C$, times $\alpha$ |
        | [emitter follower](#/l/bk09-cc) | $G_M = -\dfrac{\beta + 1}{r_\pi + R_B}$, $R_{out} = R_E\parallel\dfrac{r_\pi + R_B}{\beta + 1}$, $A_v = \dfrac{R_E}{R_E + \frac{r_\pi + R_B}{\beta + 1}}$ | the emitter follows the base; $r_e$ divides with the load |
        | [cascode](#/l/bk09-cascode) | $G_M\approx g_{m1}$, $R_{out} = R_{load}\parallel\beta r_{o2}$ | $Q_2$ passes $Q_1$'s current and shields it |
        | [bias](#/l/bk09-bias) | DC: $I_B = \dfrac{V_{TH} - 0.7}{R_{TH} + (\beta + 1)R_E}$; AC: bypassed parts vanish, $R_{in}$ includes $R_1\parallel R_2$ | capacitors open at DC, short for signals |
        | [chains](#/l/bk09-chain) | each stage loaded by the next stage's $R_{in}$ | a base loads, a gate does not |
      `),
      RF(md`
        [[fig:a]]

        [[fig:b]]

        [[fig:c]]

        [[fig:d]]
      `, { a: { fig: F.amp({ kind: 'ce', RE: true }), cap: 'Common emitter (with $R_E$): $A_v\\approx-R_C/(r_e + R_E)$.' }, b: { fig: F.amp({ kind: 'cb', RE: true }), cap: 'Common base: $A_v = +\\alpha R_C/R_{in}$.' },
        c: { fig: F.amp({ kind: 'cc', RB: true }), cap: 'Emitter follower: $A_v\\approx1$, a buffer.' }, d: { fig: F.cascAmp(), cap: 'Cascode: $G_M\\approx g_{m1}$, $R_{out}\\approx R_{load}\\parallel\\beta r_o$.' } }),
      P({
        id: 'bk09-x-1', title: 'A low-current common emitter',
        q: md`$I_C = 0.25\,\text{mA}$, $\beta = 200$, $R_C = 20\kO$, source resistance $R_B = 10\kO$, $r_o\to\infty$. Find $r_\pi$, $G_M$, $A_v$ and the resistance the source sees.`,
        fig: F.amp({ kind: 'ce', RB: true }),
        parts: [{ lbl: 'r_\\pi', unit: 'kΩ', ans: 20 }, { lbl: 'G_M', unit: 'mS', ans: 6.66667 }, { lbl: 'A_v', unit: '', ans: -133.333 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 30 }],
        sol: md`$g_m = 10\,\text{mS}$, $r_\pi = 20\kO$, $G_M = 10\times\dfrac{20}{30} = 6.67\,\text{mS}$, $A_v = -133$, $R_{in} = 30\kO$. At low current $r_\pi$ is large, so the source resistance costs only a third.`,
      }),
      P({
        id: 'bk09-x-2', title: 'When $(\\beta + 1)/\\beta$ matters',
        q: md`$I_C = 2\,\text{mA}$, $\beta = 50$, $R_C = 2\kO$, $R_E = 100\,\Omega$, $r_o\to\infty$. Find Lecture 24's exact $G_M$, its $\beta\gg1$ approximation, $A_v$, and $R_{in}$.`,
        fig: F.amp({ kind: 'ce', RE: true }),
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 8.73362 }, { lbl: 'G_{M,approx}', unit: 'mS', ans: 8.88889 }, { lbl: 'A_v', unit: '', ans: -17.4672 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 5.725 }],
        sol: md`$g_m = 80\,\text{mS}$, $g_mR_E = 8$. Exact: $\dfrac{80}{1 + 1.02\times8} = \dfrac{80}{9.16} = 8.73\,\text{mS}$; approximate: $80/9 = 8.89\,\text{mS}$ (1.8% high, because $\beta = 50$). $A_v = -8.73\,\text{mS}\times2\kO = -17.47$. $r_\pi = 625\,\Omega$, $R_{in} = 0.625 + 51\times0.1 = 5.725\kO$.`,
      }),
      P({
        id: 'bk09-x-3', title: 'A common base with a soft base',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $R_C = 10\kO$, source resistance $R_E = 100\,\Omega$, base held through $R_B = 2\kO$, $r_o\to\infty$. Find $R_{in}$, $G_M$ and $A_v$.`,
        fig: F.amp({ kind: 'cb', RE: true, RB: true }),
        parts: [{ lbl: 'R_{in}', unit: 'Ω', ans: 169.307 }, { lbl: 'G_M', unit: 'mS', ans: -5.84795 }, { lbl: 'A_v', unit: '', ans: 58.4795 }],
        sol: md`$r_\pi = 5\kO$. $R_{in} = 100 + 7\kO/101 = 169.3\,\Omega$; $G_M = -\alpha/R_{in} = -5.848\,\text{mS}$; $A_v = +58.5$.`,
      }),
      P({
        id: 'bk09-x-4', title: 'A follower with a heavy load',
        q: md`$I_C = 4\,\text{mA}$, $\beta = 80$, $R_B = 1\kO$, $R_E = 500\,\Omega$, $R_L = 50\,\Omega$, $r_o\to\infty$. Find $R_{in}$, $R_{out}$ (with $R_E$ and $R_L$) and $A_v$.`,
        fig: F.amp({ kind: 'cc', RB: true, RL: true }),
        parts: [{ lbl: 'R_{in}', unit: 'kΩ', ans: 5.18182 }, { lbl: 'R_{out}', unit: 'Ω', ans: 13.1617 }, { lbl: 'A_v', unit: '', ans: 0.710455 }],
        sol: md`$r_\pi = 80/160\,\text{mS} = 500\,\Omega$; up the emitter $(500 + 1000)/81 = 18.52\,\Omega$; load $500\parallel50 = 45.45\,\Omega$. $R_{in} = 1 + 0.5 + 81\times0.04545 = 5.18\kO$; $R_{out} = 45.45\parallel18.52 = 13.2\,\Omega$; $A_v = 45.45/63.97 = 0.710$.`,
      }),
      P({
        id: 'bk09-x-5', title: 'An active load at any current',
        q: md`A common emitter with a PNP current-source load; $V_{A,n} = 120\,\text{V}$, $V_{A,p} = 60\,\text{V}$, both at $0.2\,\text{mA}$. Find $R_{out}$ and $A_v$. Would the gain change at $2\,\text{mA}$?`,
        fig: F.amp({ kind: 'ce', load: 'pnp' }),
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 200 }, { lbl: 'A_v', unit: '', ans: -1600 }, { lbl: 'A_v\\ (2\\,\\text{mA})', unit: '', ans: -1600 }],
        sol: md`$r_{o1} = 600\kO$, $r_{o2} = 300\kO$, $R_{out} = 200\kO$, $g_m = 8\,\text{mS}$: $A_v = -1600$. At $2\,\text{mA}$, $g_m$ is ten times larger and $R_{out}$ ten times smaller: still $-1600 = -\dfrac{1}{V_T}\dfrac{V_{A,n}V_{A,p}}{V_{A,n} + V_{A,p}}$.`,
      }),
      P({
        id: 'bk09-x-6', title: 'Common base input, typed',
        q: md`Type $R_{in}$ of Lecture 24's common base ($R_B$ on the base, $R_E$ in series with the source). Use \`RE\`, \`RB\`, \`rpi\`, \`beta\`.`,
        fig: F.amp({ kind: 'cb', RE: true, RB: true }),
        parts: [Object.assign(ex('RE + (RB + rpi)/(beta + 1)', ['RE', 'RB', 'rpi', 'beta'], 'R_{in}'), { vars: { RE: [10, 200], RB: [1e3, 2e4], rpi: [1e3, 2e4], beta: [50, 200] } })],
        sol: md`$R_{in} = R_E + \dfrac{R_B + r_\pi}{\beta + 1}$.`,
      }),
      P({
        id: 'bk09-x-7', title: 'Follower output, typed',
        q: md`Type $R_{out}$ of the emitter follower with source resistance $R_B$ and emitter resistor $R_E$. Use \`RE\`, \`RB\`, \`rpi\`, \`beta\`.`,
        fig: F.amp({ kind: 'cc', RB: true }),
        parts: [Object.assign(ex('RE || ((rpi + RB)/(beta + 1))', ['RE', 'RB', 'rpi', 'beta'], 'R_{out}'), { vars: { RB: [2e3, 2e4], RE: [50, 500], rpi: [1e3, 2e4], beta: [50, 200] } })],
        sol: md`$R_{out} = R_E\parallel\dfrac{r_\pi + R_B}{\beta + 1}$.`,
      }),
      P({
        id: 'bk09-x-8', title: 'Lecture 24\'s degenerated $G_M$, typed',
        q: md`Type $G_M$ of the common emitter with $R_E$ (no source resistance, $r_o\to\infty$). Use \`gm\`, \`beta\`, \`RE\` (\`rpi\` also available).`,
        fig: F.amp({ kind: 'ce', RE: true }),
        parts: [ex('gm/(1 + (beta + 1)/beta*gm*RE)', ['gm', 'beta', 'RE', 'rpi'], 'G_M')],
        sol: md`$G_M = \dfrac{g_m}{1 + \frac{\beta + 1}{\beta}g_mR_E}$ (the $\beta\gg1$ form $\dfrac{g_m}{1 + g_mR_E}$ and the $r_e$ form $\dfrac{\alpha}{r_e + R_E}$ are accepted).`,
      }),
      P({
        id: 'bk09-x-9', title: 'Name it',
        q: md`Name this stage and the sign of its gain.`,
        fig: cbBy,
        parts: [{ lbl: 'Which stage?', mc: [md`Common base`, md`Common emitter`, md`Emitter follower`, md`Cascode`], a: 0, why: [null, md`The input does not reach the base: $C_B$ holds the base at incremental ground.`, md`The output is at the collector, not the emitter.`, md`There is only one transistor.`] },
          { lbl: 'Sign of $A_v$', mc: [md`Positive`, md`Negative`], a: 0, why: [null, md`Input at the emitter, output at the collector, base held: non-inverting.`] }],
        sol: md`$C_B$ grounds the base for signals, the source drives the emitter through $C_1$, the output is the collector: a **common base**, non-inverting, $A_v = +\alpha R_C/R_{in}$.`,
      }),
      P({
        id: 'bk09-x-10', title: 'Gain from two DC drops',
        q: md`A degenerated common emitter drops $5\,\text{V}$ across $R_C$ and $1\,\text{V}$ across its (unbypassed) $R_E$. Find $A_v$ without knowing any resistor or current. (Exact, with $r_o\to\infty$.)`,
        parts: [{ lbl: 'A_v', unit: '', ans: -4.87805 }],
        sol: md`$A_v = -\dfrac{\alpha R_C}{r_e + R_E}$. Multiply top and bottom by $I_E$ and use $\alpha I_E = I_C$, $r_eI_E = V_T$: $A_v = -\dfrac{I_CR_C}{V_T + I_ER_E} = -\dfrac{5}{0.025 + 1} = -4.88$. Exactly. (The crude $-R_C/R_E = -V_{RC}/V_{RE} = -5$ forgets the $V_T$ that sits next to $V_{RE}$.)`,
      }),
      P({
        id: 'bk09-x-11', title: 'A cascode wasted on a simple load',
        q: md`An NPN cascode (reference transistors, $1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$) has a **single** PNP current-source load ($1\,\text{mA}$, $V_{A,p} = 50\,\text{V}$). Find $R_{out}$ and $A_v$.`,
        fig: F.cascAmp({ load: 'pnp1' }),
        parts: [{ lbl: 'R_{out}', unit: 'kΩ', ans: 49.7476 }, { lbl: 'A_v', unit: '', ans: -1969.71, traps: [{ v: -390341, msg: 'The PNP load is only $r_{op} = 50\\kO$: it sits in parallel with the cascode\'s $9.86\\,\\text{M}\\Omega$.' }] }],
        sol: md`$R_{out} = 9.86\,\text{M}\Omega\parallel50\kO = 49.75\kO$; $A_v = -39.59\,\text{mS}\times49.75\kO = -1970$. The load's $r_o$ sets the gain: cascode the load too.`,
      }),
      P({
        id: 'bk09-x-12', title: 'Two common emitters, the second degenerated',
        q: md`Like the chain of Section 9.7, but $Q_2$ has $R_{E2} = 500\,\Omega$: both at $1\,\text{mA}$, $\beta = 100$, $R_{C1} = R_{C2} = 10\kO$, $r_o\to\infty$. Find $R_{in2}$, $A_{v1}$, $A_{v2}$ and $A_v$.`,
        fig: ceceRE,
        parts: [{ lbl: 'R_{in2}', unit: 'kΩ', ans: 53 }, { lbl: 'A_{v1}', unit: '', ans: -336.508 }, { lbl: 'A_{v2}', unit: '', ans: -18.8679 }, { lbl: 'A_v', unit: '', ans: 6349.21 }],
        sol: md`$R_{in2} = 2.5 + 101\times0.5 = 53\kO$; $A_{v1} = -40\,\text{mS}\times(10\parallel53)\kO = -336.5$; $A_{v2} = -100\times10\kO/53\kO = -18.87$; $A_v = +6349$. Compare $+32{,}000$ with $Q_2$ undegenerated: $R_{E2}$ cost gain in stage 2 but saved some in stage 1.`,
      }),
      P({
        id: 'bk09-x-13', title: 'Exam-style: divider bias, partly bypassed emitter', big: true,
        q: md`$\beta = 150$, $V_{BE} = 0.7\,\text{V}$, $V_T = 25\,\text{mV}$, $r_o\to\infty$, capacitors large. (a) Find $I_C$ and check forward active. (b) Find $g_m$ and $r_\pi$. (c) Find the input resistance $R_{in}$ seen through $C_1$, the gain from the base $v_b$ to $v_{out}$, and the overall gain $v_{out}/v_s$.`,
        fig: exA,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 0.923352 }, { lbl: 'g_m', unit: 'mS', ans: 36.9341 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 4.06129 },
          { lbl: 'R_{in}', unit: 'kΩ', ans: 6.65656 }, { lbl: 'v_{out}/v_b', unit: '', ans: -31.6859, traps: [{ v: -2.4882, msg: 'Only $R_{E1}$ is in the signal path; $R_{E2}$ is bypassed.' }] }, { lbl: 'v_{out}/v_s', unit: '', ans: -29.0660 }],
        hints: [md`$V_{TH} = 2.25\,\text{V}$, $R_{TH} = 10.2\kO$; DC sees $R_{E1} + R_{E2}$.`, md`AC: $R_{E1}$ stays, $R_C\parallel R_L$ loads the collector, $R_{TH}$ is in parallel with the base.`],
        sol: md`
**(a) DC.** $V_{TH} = 15\times\dfrac{12}{80} = 2.25\,\text{V}$, $R_{TH} = 68\parallel12 = 10.2\kO$. $I_B = \dfrac{2.25 - 0.7}{10.2\kO + 151\times1.6\kO} = \dfrac{1.55}{251.8\kO} = 6.156\,\mu\text{A}$, $I_C = 0.923\,\text{mA}$. $V_B = 2.187\,\text{V}$, $V_C = 15 - 6.8\kO\times0.923\,\text{mA} = 8.72\,\text{V} > V_B$ ✓.

**(b)** $g_m = 36.93\,\text{mS}$, $r_\pi = 150/g_m = 4.061\kO$.

**(c)** Base: $r_\pi + 151\times100\,\Omega = 19.16\kO$; $R_{in} = 10.2\parallel19.16 = 6.657\kO$. Collector load $6.8\parallel10 = 4.048\kO$:
$$\frac{v_{out}}{v_b} = -\frac{150\times4.048\kO}{19.16\kO} = -31.69$$
Overall: $-31.69\times\dfrac{6.657}{6.657 + 0.6} = -29.07$.`,
      }),
      P({
        id: 'bk09-x-14', title: 'Exam-style: a PNP follower', big: true,
        q: md`$\beta = 100$, $V_{EB} = 0.7\,\text{V}$, $r_o\to\infty$, capacitors large. (a) Find $I_C$. (b) Find $g_m$. (c) Find $R_{in}$ seen through $C_1$, the gain from the base to $v_{out}$, the overall gain $v_{out}/v_s$, and the output resistance at $v_{out}$ (source connected, $R_L$ included).`,
        fig: exB,
        parts: [{ lbl: 'I_C', unit: 'mA', ans: 1.06502 }, { lbl: 'g_m', unit: 'mS', ans: 42.6009 }, { lbl: 'R_{in}', unit: 'kΩ', ans: 18.1570 }, { lbl: 'v_{out}/v_b', unit: '', ans: 0.970606 }, { lbl: 'v_{out}/v_s', unit: '', ans: 0.761035 }, { lbl: 'R_{out}', unit: 'Ω', ans: 59.1257 }],
        hints: [md`The PNP's base current flows **out** of its base into the divider: $V_B = V_{TH} + I_BR_{TH}$.`, md`AC: $V_{CC}$ is ground, so $R_E$ and $R_L$ are in parallel from the emitter to ground.`],
        sol: md`
**(a) DC.** $V_{TH} = 4.5\,\text{V}$, $R_{TH} = 23.5\kO$. KVL from $V_{CC}$: $9 - 101I_B\times3.3\kO - 0.7 - I_B\times23.5\kO = 4.5$, so $I_B = \dfrac{3.8}{356.8\kO} = 10.65\,\mu\text{A}$, $I_C = 1.065\,\text{mA}$ ($V_B = 4.75\,\text{V}$, $V_E = 5.45\,\text{V}$; the collector is grounded, below the base ✓).

**(b)** $g_m = 42.60\,\text{mS}$, $r_\pi = 2.347\kO$.

**(c)** Load $3.3\parallel1 = 0.7674\kO$. Base: $2.347 + 101\times0.7674 = 79.85\kO$; $R_{in} = 23.5\parallel79.85 = 18.16\kO$. From the base: $\dfrac{101\times0.7674}{79.85} = 0.9706$. Overall: $\times\dfrac{18.16}{18.16 + 5} = 0.761$. Output: up the emitter $\dfrac{(5\parallel23.5)\kO + 2.347\kO}{101} = 64.1\,\Omega$, in parallel with $767\,\Omega$: $59.1\,\Omega$.`,
      }),
      P({
        id: 'bk09-x-15', title: 'Exam-style: a direct-coupled common emitter and follower', big: true,
        q: md`$\beta = 100$, $V_{BE} = 0.7\,\text{V}$, $r_o\to\infty$. $Q_1$'s base is held at $1.7\,\text{V}$ DC by the input source. (a) Find $I_{C1}$, $V_{C1}$ (remember $Q_2$'s base current also flows in $R_{C1}$) and $I_{C2}$. (b) Find $R_{in2}$ at $Q_2$'s base. (c) Find $A_{v1} = v_{c1}/v_{in}$, the overall $A_v$, and $R_{out}$ at $v_{out}$.`,
        fig: exC,
        parts: [{ lbl: 'I_{C1}', unit: 'mA', ans: 0.990099 }, { lbl: 'V_{C1}', unit: 'V', ans: 5 }, { lbl: 'I_{C2}', unit: 'mA', ans: 0.990099 }, { lbl: 'R_{in2}', unit: 'kΩ', ans: 84.4684 },
          { lbl: 'A_{v1}', unit: '', ans: -4.55984 }, { lbl: 'A_v', unit: '', ans: -4.42353 }, { lbl: 'R_{out}', unit: 'Ω', ans: 68.2385 }],
        hints: [md`$I_{E1} = (1.7 - 0.7)/1\kO$.`, md`$V_{C1} = 10 - R_{C1}(I_{C1} + I_{B2})$ and $I_{E2} = (V_{C1} - 0.7)/R_{E2}$: two equations.`],
        sol: md`
**(a)** $I_{E1} = 1\,\text{mA}$, $I_{C1} = 0.990\,\text{mA}$. With $I_{B2} = I_{E2}/101$ and $I_{E2} = (V_{C1} - 0.7)/4.3\kO$: $V_{C1} = 10 - 5\kO\Big(0.990\,\text{mA} + \dfrac{V_{C1} - 0.7}{434.3\kO}\Big)$, so $V_{C1} = 5.00\,\text{V}$, $I_{E2} = 1\,\text{mA}$, $I_{C2} = 0.990\,\text{mA}$.

**(b)** $r_{\pi2} = 2.525\kO$; $R_{E2}\parallel R_L = 811.3\,\Omega$; $R_{in2} = 2.525 + 101\times0.8113 = 84.47\kO$.

**(c)** Stage 1 is a degenerated common emitter loaded by $R_{C1}\parallel R_{in2} = 4.721\kO$: $A_{v1} = -\dfrac{\alpha\times4.721\kO}{r_{e1} + R_{E1}} = -\dfrac{0.990\times4721}{1025} = -4.560$. Stage 2 from its base: $\dfrac{101\times811.3}{84.47\kO} = 0.970$. $A_v = -4.42$. $R_{out} = 811.3\parallel\dfrac{5\kO + 2.525\kO}{101} = 811.3\parallel74.5 = 68.2\,\Omega$.`,
      }),
      P({
        id: 'bk09-x-16', title: 'A MOSFET stage into a BJT stage',
        q: md`$M_1$ (common source, $g_m = 4\,\text{mS}$, $R_D = 5\kO$, $r_{ds}\to\infty$) drives $Q_2$ (common emitter, $1\,\text{mA}$, $\beta = 100$, $R_{C2} = 5\kO$, emitter grounded). Find $A_{v1}$, $A_{v2}$ and $A_v$.`,
        fig: csce,
        parts: [{ lbl: 'A_{v1}', unit: '', ans: -6.66667, traps: [{ v: -20, msg: '$Q_2$\'s base loads the drain node with $r_{\\pi2} = 2.5\\kO$.' }] }, { lbl: 'A_{v2}', unit: '', ans: -200 }, { lbl: 'A_v', unit: '', ans: 1333.33 }],
        sol: md`$A_{v1} = -4\,\text{mS}\times(5\parallel2.5)\kO = -6.67$; $A_{v2} = -40\,\text{mS}\times5\kO = -200$; $A_v = +1333$.`,
      }),
      R(md`
        ### Mixed drill

        Every Chapter 9 generator, shuffled. Eight in a row completes the chapter.
      `),
      G('bk9_ce', { need: 8, pool: ['bk9_ce', 'bk9_cedeg', 'bk9_cb', 'bk9_cc', 'bk9_casc', 'bk9_bias', 'bk9_chain'] }),
    ],
  });
})();

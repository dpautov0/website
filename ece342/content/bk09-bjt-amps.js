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
        parts: [{ lbl: 'G_M', unit: 'mS', ans: 20, traps: [{ v: 40, msg: 'That is $g_m$. $R_B$ and $r_\\pi$ divide the input first.' }] }, { lbl: 'R_{out}', unit: 'kΩ', ans: 3.84615, accept: [4] }, { lbl: 'A_v', unit: '', ans: -76.923 }],
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
    ['txt', [1.3, 2.25], '$\\leftarrow v_e\\approx v_{in}$', { a: 'l' }], ['txt', [1.3, 0.3], '$\\leftarrow i_c = \\alpha i_e$', { a: 'l' }], ['iarr', [1, 2.75], 'd', { n: 'i_e = \\tfrac{v_{in}}{r_e + R_E}', side: 'r', off: [16, 0] }],
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
        parts: [{ lbl: 'r_e', unit: 'Ω', ans: 49.505, accept: [50] }, { lbl: 'A_v', unit: '', ans: -39.8010, accept: [-40] }, { lbl: '-R_C/R_E', unit: '', ans: -53.333 }],
        sol: md`
$r_e = \alpha/g_m = 0.990/20\,\text{mS} = 49.5\,\Omega$. $A_v = -\dfrac{\alpha R_C}{r_e + R_E} = -\dfrac{0.990\times8000}{199.5} = -39.80$ (with $\alpha\approx1$, $r_e\approx50\,\Omega$: $-40$). The crude $-R_C/R_E = -53.3$ is a third too high, because $R_E$ is only three times $r_e$.`,
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
        parts: [ex('-1/((RB + rpi)/beta + (beta + 1)/beta*RE)', ['RB', 'rpi', 'beta', 'RE'], 'G_M')],
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
        parts: [ex('RE/(RE + (rpi + RB)/(beta + 1))', ['RE', 'RB', 'rpi', 'beta'], 'A_v')],
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
})();

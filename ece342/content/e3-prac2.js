/* Exam 3: practice exams E, F, G, H in the Exam 2 format (60 minutes, three problems, 100 points), continuing e3-prac.js
   (exams A–D) with new circuits. Problem 1: a BJT DC point, then g_m, r_pi and numeric gains and resistances. Problem 2:
   resistances and gains in symbols, mixing BJT and MOSFET blocks. Problem 3: frequency response (Bode plots, node
   poles, open-circuit time constants). Every solution opens with "Recognize it first". Every number and formula was
   checked against an independent solve (constant-V_BE DC model, small-signal nodal analysis with VCCS, complex nodal
   analysis for the frequency answers). Ids start with "e3pE" … "e3pH". */
(function () {
  'use strict';
  const { R, P } = C;
  const ex = (...a) => E3.ex(...a);
  const kO = (v) => `${v}\\,\\text{k}\\Omega`;
  const Vv = (v) => `${v}\\,\\text{V}`;
  const B = window.E3Bode;

  const params = md`**Parameters.** BJT: $V_{BE(on)} = 0.7\,\text{V}$ (for a PNP, $V_{EB(on)} = 0.7\,\text{V}$), $V_{CE(sat)} = 0.2\,\text{V}$, $V_T = 25\,\text{mV}$, so $g_m = I_C/V_T$ and $r_\pi = \beta/g_m$; $\beta$ and $r_o$ as given in each problem. NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. PMOS: $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$. Sign convention (as on Exam 2): $G_M$ is the short-circuit current pulled **down into** the stage per volt of input, and $A_v = -G_MR_{out}$.`;
  const howto = 'Symbolic boxes take expressions like `rpi + (beta + 1)*RE` or `rds3 || (ro2 + RE)`; `||` is "in parallel with" and binds tighter than `+`, so write `(a + b) || c` with brackets. BJT names: `gm1`, `rpi1`, `beta1`, `ro1`. Unless a part asks for the exact form, the $\\beta \\gg 1$ and $g_mr_o \\gg 1$ approximations are accepted wherever they land within 3% of the exact one. Numbers: within 1.5%; arithmetic is allowed in the box (`20*log(8)`, `1/(5e-9)`).';
  const intro = (L, extra) => R(md`
    **Exam 3 practice exam ${L}.** 60 minutes, three problems, 100 points: Problem 1 (35), Problem 2 (35), Problem 3 (30). Same format as Exam 2. Work it on paper first, with a timer, then type your answers. ${extra}

    ${params}

    **Read every solution's first paragraph even when you got the number right.** It is the "recognize it first" step: where the signal goes in, where it comes out, which terminal is common, and so which canonical stage or impedance you are looking at. That is the step to make automatic.

    ${howto}
  `);

  // ================================================================== Practice exam E
  const E1Fig = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 9\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: kO(4) }],
    ['npn', [1, 0], { n: 'Q_1' }],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: 'C_2' }], ['w', [2.5, -1], [3.1, -1]], ['term', [3.1, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [3.1, -1], [3.1, 0.4], { n: 'R_L', s: kO(12) }], ['gnd', [3.1, 0.4]],
    ['R', [1, 1], [1, 2.4], { n: 'R_E', s: kO(2.2), side: 'l' }], ['gnd', [1, 2.4]],
    ['w', [1, 1], [2, 1]], ['C', [2, 1], [2, 2.4], { n: 'C_E' }], ['w', [2, 2.4], [1, 2.4]],
    ['w', [0, 0], [-0.7, 0]], ['rail', [-0.7, -1.4], { n: 'V_{CC}' }], ['R', [-0.7, -1.4], [-0.7, 0], { n: 'R_1', s: kO(30), side: 'l' }],
    ['R', [-0.7, 0], [-0.7, 1.4], { n: 'R_2', s: kO(15), side: 'l' }], ['gnd', [-0.7, 1.4]],
    ['C', [-2.2, 0], [-1.4, 0], { n: 'C_1' }], ['w', [-1.4, 0], [-0.7, 0]],
    ['R', [-3.6, 0], [-2.2, 0], { n: 'R_S', s: '500\\,\\Omega' }], ['Vac', [-3.6, 0], [-3.6, 1.2], { n: 'v_{in}', side: 'l' }], ['gnd', [-3.6, 1.2]],
  ];
  const E2Fig = [
    ['rail', [1, -3.4], { n: 'V_{DD}' }], ['pmos', [1, -2.4], { n: 'M_3' }], ['acg', [0, -2.4]],
    ['w', [1, -1.4], [1, -1]], ['w', [1, -1.2], [2.4, -1.2]], ['term', [2.4, -1.2], { n: 'v_{out}' }],
    ['nmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]],
    ['node', [1, 1], { n: 'X', side: 'r' }],
    ['npn', [1, 2], { n: 'Q_1' }], ['gnd', [1, 3]],
    ['w', [0, 2], [-0.6, 2], [-0.6, 2.3]], ['Vac', [-0.6, 2.3], [-0.6, 3.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 3.3]],
  ];
  const E2GM = 'gm1*ro1*(1 + gm2*rds2)/(ro1*(1 + gm2*rds2) + rds2)';
  const E2Rdn = 'rds2 + ro1 + gm2*rds2*ro1';
  const E3sp = { k: -50, poles: [1e2, 1e5, 1e7], origin: 1, w0: 1e2 };
  const E3Plot = B.svg(E3sp, { exact: false, wmin: 1, wmax: 1e8, pts: [{ w: 1e3, n: '34\\,\\text{dB}' }] });
  const E3Sol = B.svg(E3sp, { show: 'both', wmin: 1, wmax: 1e8, marks: [{ w: 1e2, n: '\\omega_L' }, { w: 1e5, n: '\\omega_H' }, { w: 1e7, n: '\\omega_{p2}' }] });

  const Eex = [
    intro('E', 'No calculator needed. A divider-biased common emitter, a BJT–MOSFET cascode, and a transfer function read off a Bode plot.'),
    P({
      id: 'e3pE-1', src: 'Exam 3 practice E · Problem 1 (35 pts)', title: 'A divider-biased common emitter between a source and a load', big: true,
      q: md`$V_{CC} = 9\,\text{V}$, $\beta = 100$, $r_o = \infty$, every capacitor is infinite. $R_1 = 30\kO$ and $R_2 = 15\kO$ bias the base. $R_E = 2.2\kO$ is bypassed by $C_E$, and $R_C = 4\kO$. The source $v_{in}$ has a resistance $R_S = 500\,\Omega$ and is coupled to the base by $C_1$; the output is coupled to $R_L = 12\kO$ by $C_2$. In the DC analysis you may use $\beta + 1\approx\beta$.

(a) Replace the divider by its Thévenin equivalent: $V_{BB}$ and $R_{BB}$. (b) Find $I_C$ and $V_C$, and check that $Q_1$ is forward-active. (c) Find $g_m$ and $r_\pi$. (d) Find $R_{in}$, the resistance the source sees to the right of $C_1$. (e) Find $R_{out}$, looking back into the collector node from $R_L$ (not counting $R_L$). (f) Find $A_v = v_{out}/v_{in}$, from the source voltage to the load. (g) What would removing $C_E$ do to the gain?`,
      fig: E1Fig,
      parts: [
        { lbl: 'V_{BB}', unit: 'V', ans: 3 }, { lbl: 'R_{BB}', unit: 'kΩ', ans: 10 },
        { lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'V_C', unit: 'V', ans: 5 },
        { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 },
        { lbl: 'R_{in}', unit: 'kΩ', ans: 2, traps: [{ v: 2.5, msg: 'That is $r_\\pi$ alone. For signals $V_{CC}$ is ground, so $R_1$ and $R_2$ both run from the base to ground, in parallel with $r_\\pi$.' }, { v: 10, msg: 'That is $R_1\\parallel R_2$ alone. The base itself, $r_\\pi$, is in parallel with it.' }] },
        { lbl: 'R_{out}', unit: 'kΩ', ans: 4, traps: [{ v: 3, msg: 'That is $R_C\\parallel R_L$. $R_{out}$ is what $R_L$ sees looking back, so leave $R_L$ out.' }] },
        { lbl: 'A_v', unit: '', ans: -96, traps: [
          { v: -120, msg: 'That is the gain from the **base**. The source first loses part of $v_{in}$ in $R_S$: only $R_{in}/(R_S + R_{in}) = 0.8$ of it reaches the base.' },
          { v: -100, msg: 'Close, but the divider used $r_\\pi$ alone as the input resistance. $R_1\\parallel R_2$ also hangs on the base: $R_{in} = 2\\,\\text{k}\\Omega$, so $0.8$ of $v_{in}$ arrives.' },
          { v: -128, msg: 'That uses $R_C$ alone. $C_2$ puts $R_L$ in parallel with $R_C$ for signals: $4\\,\\text{k}\\parallel12\\,\\text{k} = 3\\,\\text{k}\\Omega$.' }] },
        { lbl: '(g) If $C_E$ were removed, $A_v$ would become about', mc: ['$-1.3$', '$-96$: $C_E$ only matters at DC', '$-48$', '$-120$'], a: 0,
          why: [null, 'At DC every capacitor is open anyway, so $C_E$ changes nothing at DC. It matters for **signals**: it is what holds the emitter at incremental ground.', 'Removing $C_E$ puts all $2.2\\,\\text{k}\\Omega$ in the emitter for signals. The gain drops to about $-(R_C\\parallel R_L)/R_E$, far more than a factor of 2.', 'That would need the emitter to stay at ground, which is exactly what $C_E$ was doing.'] },
      ],
      hints: [
        md`DC: capacitors open. The divider is a $V_{BB}$ source behind $R_{BB}$; then KVL around base, emitter and $R_E$: $V_{BB} = I_BR_{BB} + 0.7 + I_ER_E$.`,
        md`Small signal: $V_{CC}$ is ground and the capacitors are shorts. The base node has $R_1$, $R_2$ and $r_\pi$ all to ground; the emitter is at ground (through $C_E$); the collector has $R_C\parallel R_L$.`,
        md`Gain in two steps: the input divider $R_{in}/(R_S + R_{in})$, then $-g_m(R_C\parallel R_L)$ from the base to the output.`,
      ],
      sol: md`
        **Recognize it first.** The signal goes in at the **base** (through $R_S$ and $C_1$) and comes out at the **collector** (through $C_2$ to $R_L$). The emitter is tied to ground for signals by $C_E$. Emitter common: a plain **common emitter**. Expect an inverting gain of about $-g_m(R_C\parallel R_L)$ from the base, and a loss at the input: the base node is not an open circuit (it has $r_\pi$, $R_1$ and $R_2$ to ground), so the source's $R_S$ eats part of $v_{in}$.

        Work in two pictures: **DC** (capacitors open, find the bias), then **small signal** (capacitors shorts, $V_{CC}$ at ground).

        **(a) The divider as a Thévenin source.** Disconnect the base and look into the divider. Its open-circuit voltage and its resistance with $V_{CC}$ zeroed are
        $$V_{BB} = V_{CC}\frac{R_2}{R_1 + R_2} = 9\cdot\frac{15}{45} = 3\,\text{V},\qquad R_{BB} = R_1\parallel R_2 = \frac{30\cdot15}{45} = 10\kO$$
        So the base is fed from a $3\,\text{V}$ source through $10\kO$. The $10\kO$ matters because the base draws current.

        **(b) The bias.** KVL from $V_{BB}$, through $R_{BB}$, across the base-emitter junction, down $R_E$ to ground:
        $$V_{BB} = I_BR_{BB} + V_{BE} + I_ER_E$$
        Write everything in terms of $I_C$: $I_B = I_C/\beta$ and (with $\beta + 1\approx\beta$) $I_E\approx I_C$:
        $$3 = I_C\cdot\frac{10\,\text{k}}{100} + 0.7 + I_C(2.2\,\text{k})\ \Rightarrow\ 2.3 = I_C(0.1\,\text{k} + 2.2\,\text{k})\ \Rightarrow\ I_C = 1\,\text{mA}$$
        The $0.1\kO$ is $R_{BB}/\beta$: the divider's resistance seen through the base current, small next to $R_E$, so the bias barely depends on $\beta$ (that is why designers use a divider). Then
        $$V_B = 3 - (10\,\mu\text{A})(10\,\text{k}) = 2.9\,\text{V},\quad V_E = 2.2\,\text{V},\quad V_C = 9 - (1\,\text{mA})(4\,\text{k}) = 5\,\text{V}$$
        Forward-active: $V_C = 5\,\text{V} > V_B = 2.9\,\text{V}$, so the base-collector junction is reverse-biased ✓ ($V_{CE} = 2.8\,\text{V} > 0.2\,\text{V}$). (Keeping $\beta + 1 = 101$ exactly gives $I_C = 0.990\,\text{mA}$ and $V_C = 5.04\,\text{V}$.)

        **(c)** $g_m = \dfrac{I_C}{V_T} = \dfrac{1\,\text{mA}}{25\,\text{mV}} = 40\,\text{mS}$, $\quad r_\pi = \dfrac{\beta}{g_m} = \dfrac{100}{40\,\text{mS}} = 2.5\kO$.

        **(d) Input resistance.** Now the small-signal picture. $V_{CC}$ is ground, so $R_1$ runs from the base to ground, just like $R_2$. $C_E$ shorts the emitter to ground, so looking into the base you see $r_\pi$ (Lecture 24: $R_{in} = r_\pi$ for a CE). Three resistors from the base to ground, in parallel:
        $$R_{in} = R_1\parallel R_2\parallel r_\pi = 10\,\text{k}\parallel2.5\,\text{k} = \frac{10\cdot2.5}{12.5} = 2\kO$$

        **(e) Output resistance.** Set $v_{in} = 0$. Looking into the collector with $r_o = \infty$ you see an open circuit (the controlled source $g_mv_\pi$ is an ideal current source, and $v_\pi = 0$ anyway). What is left is $R_C$ to ground:
        $$R_{out} = R_C = 4\kO$$

        **(f) Gain, in two steps.** First the input divider: the source sees $R_S$ in series with $R_{in}$, so
        $$\frac{v_b}{v_{in}} = \frac{R_{in}}{R_S + R_{in}} = \frac{2}{0.5 + 2} = 0.8$$
        Then the stage: the base voltage is $v_\pi$, the collector current is $g_mv_\pi$, and it flows through everything on the collector node, $R_C\parallel R_L = 4\,\text{k}\parallel12\,\text{k} = 3\kO$:
        $$\frac{v_{out}}{v_b} = -g_m(R_C\parallel R_L) = -(40\,\text{mS})(3\kO) = -120,\qquad A_v = 0.8\times(-120) = -96$$
        **Same answer by $G_MR_{out}$.** Short the output: $i_{out} = g_mv_b = 0.8\,g_mv_{in}$, so $G_M = 32\,\text{mS}$ from the source; the output node sees $R_C\parallel R_L = 3\kO$; $A_v = -(32\,\text{mS})(3\kO) = -96$ ✓. (The exact bias, $I_C = 0.990\,\text{mA}$, gives $-95.2$.)

        **(g) Without $C_E$** the emitter carries $R_E$ for signals. The base resistance jumps to $r_\pi + (\beta + 1)R_E\approx225\kO$ (so $R_{in}\approx9.6\kO$ and $95\%$ of $v_{in}$ reaches the base), but the stage gain collapses to about $-(R_C\parallel R_L)/(R_E + 1/g_m) = -3/2.225\approx-1.35$. Overall about $-1.3$. The bypass capacitor is what lets one circuit have a stable DC bias (big $R_E$) and a big signal gain (no $R_E$ for signals).

        !!trap The three classic slips
          (1) Forgetting the input divider ($-120$): the base is not an open circuit. (2) Using $r_\pi$ alone as $R_{in}$ ($-100$): $R_1$ and $R_2$ are also on the base, because $V_{CC}$ is ground for signals. (3) Using $R_C$ alone ($-128$): $C_2$ connects $R_L$ for signals.
      `,
    }),
    P({
      id: 'e3pE-2', src: 'Exam 3 practice E · Problem 2 (35 pts)', title: 'A BJT–MOSFET cascode: a common emitter under a common gate', big: true,
      q: md`$Q_1$ (NPN) has its emitter grounded and $v_{in}$ on its base. Its collector, node $X$, is the source of $M_2$ (NMOS, gate at a fixed bias). $M_2$'s drain is the output, loaded by $M_3$ (PMOS, gate at a fixed bias, source on $V_{DD}$). Keep $r_{o1}$, $r_{ds2}$ and $r_{ds3}$. In symbols:

(a) $R_X$, looking **up** into the source of $M_2$ (exact form). (b) $R_{DN}$, looking **down** into the drain of $M_2$ with $v_{in} = 0$. (c) The transconductance $G_M$ of the whole stage. (d) $A_v = v_{out}/v_{in}$. (e) The gain to the middle node, $v_x/v_{in}$. (f) A number for (e). (g) Why this cascode has no $\beta r_o$ ceiling.`,
      fig: E2Fig,
      parts: [
        ex('(rds2 + rds3)/(1 + gm2*rds2)', ['gm2', 'rds2', 'rds3'], 'R_X'),
        ex(E2Rdn, ['gm2', 'rds2', 'ro1'], 'R_{DN}'),
        ex(E2GM, ['gm1', 'gm2', 'rds2', 'ro1'], 'G_M'),
        ex(`-(${E2GM})*(rds3 || (${E2Rdn}))`, ['gm1', 'gm2', 'rds2', 'rds3', 'ro1'], 'A_v'),
        ex('-gm1*(ro1 || ((rds2 + rds3)/(1 + gm2*rds2)))', ['gm1', 'gm2', 'rds2', 'rds3', 'ro1'], 'v_x/v_{in}'),
        { lbl: '(f) Take $I_{C1} = I_{D2} = 0.5\\,\\text{mA}$, $V_{ov2} = 0.5\\,\\text{V}$ and $r_{ds3} = r_{ds2}$. Then $v_x/v_{in}$ is about', mc: ['$-20$', '$-1$, as in every cascode', '$-2$', '$-10$'], a: 0,
          why: [null, 'The "$-1$" rule of thumb holds when the cascode device has the **same** $g_m$ as the input device. Here $g_{m1} = 20\\,\\text{mS}$ (BJT) but $g_{m2} = 2\\,\\text{mS}$ (MOSFET).', 'That is $-(g_{m1}/g_{m2})(1 + r_{ds3}/r_{ds2})$ with $g_{m1} = g_{m2}$: right for a MOS–MOS cascode, not here.', 'That is $-g_{m1}/g_{m2}$: it forgets that $r_{ds3}$ on the drain doubles $R_X$ (the factor $1 + r_{ds3}/r_{ds2} = 2$).'] },
        { lbl: '(g) Why can $R_{DN}$ here grow to about $g_{m2}r_{ds2}r_{o1}$, while a BJT cascode device stops near $\\beta r_o$?', mc: ['$M_2$ has no gate current: all the signal current entering its source leaves through its drain', 'A MOSFET\'s $g_m$ is larger than a BJT\'s', 'Because $r_{o1}$ is larger than $r_{ds2}$', 'It cannot: both are limited to about $\\beta r_o$'], a: 0,
          why: [null, 'Backwards: at the same current a BJT has about ten times the $g_m$ of a MOSFET.', 'The sizes of $r_{o1}$ and $r_{ds2}$ do not create or remove a ceiling; the ceiling comes from current leaking out of the cascode device.', 'The BJT ceiling comes from $r_\\pi$: signal current escapes through the base. A MOSFET gate has no such path.'] },
      ],
      hints: [
        md`$M_2$: gate held, in at the source, out at the drain: a common gate stacked on a common emitter, a **cascode**. $M_3$: gate held, the output touches its drain: $r_{ds3}$.`,
        md`(a) Exam 2's "source with a drain load": push $i_t$ into the source; all of it leaves through $r_{ds3}$, so $v_{out} = i_tr_{ds3}$ and $v_{gs2} = -v_x$.`,
        md`(b) With $v_{in} = 0$, $Q_1$'s collector looks like $r_{o1}$. So $M_2$ is degenerated by $r_{o1}$: $r_{ds} + R_S + g_mr_{ds}R_S$ with $R_S\to r_{o1}$.`,
        md`(e) Node $X$: $Q_1$ pulls $g_{m1}v_{in}$ out of it, and it sees $r_{o1}$ down and $R_X$ up.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base**, emitter grounded, out at the **collector**: a **common emitter**. Its collector does not go to the output; it goes into $M_2$'s source.
        - $M_2$: gate held, in at the **source**, out at the **drain**: a **common gate**. CE under CG is a **cascode**, here a BiCMOS one (BJT below, MOSFET above).
        - $M_3$: PMOS (source on top at $V_{DD}$), gate held, the output touches its **drain**: a current-source load, $r_{ds3}$.
        So: the output node is "big $\parallel$ big", fed by $G_M\approx g_{m1}$.

        **(a) $R_X$, the source of $M_2$ with $r_{ds3}$ on its drain.** Push a test current $i_t$ into node $X$ (with $Q_1$ removed). The gate draws nothing, so all of $i_t$ flows up through $M_2$ and out through $r_{ds3}$: $v_{out} = i_tr_{ds3}$. The gate is at ground, so $v_{gs2} = -v_x$. In the model the drain-to-source current is $g_{m2}v_{gs2} + (v_{out} - v_x)/r_{ds2}$, and it equals $-i_t$ (our $i_t$ flows from source to drain):
        $$-i_t = -g_{m2}v_x + \frac{i_tr_{ds3} - v_x}{r_{ds2}}$$
        Multiply by $r_{ds2}$ and collect $v_x$: $v_x(1 + g_{m2}r_{ds2}) = i_t(r_{ds2} + r_{ds3})$, so
        $$R_X = \frac{r_{ds2} + r_{ds3}}{1 + g_{m2}r_{ds2}}\approx\frac{1}{g_{m2}}\Big(1 + \frac{r_{ds3}}{r_{ds2}}\Big)$$
        "About $1/g_m$" only when the drain sits on a rail; with a current-source load as big as $r_{ds2}$ it is about $2/g_{m2}$.

        **(b) $R_{DN}$, looking down into the drain of $M_2$.** With $v_{in} = 0$, $Q_1$'s base and emitter are at ground, so its collector looks like $r_{o1}$ (the controlled source has $v_\pi = 0$). $M_2$ therefore has $r_{o1}$ in its source: the **degenerated drain** of Exam 2, with $R_S\to r_{o1}$:
        $$R_{DN} = r_{ds2} + r_{o1} + g_{m2}r_{ds2}r_{o1}\approx g_{m2}r_{ds2}\,r_{o1}$$
        Huge: about $g_{m2}r_{ds2}$ (the MOSFET's intrinsic gain, tens to a hundred) times $r_{o1}$.

        **(c) $G_M$: short the output.** $Q_1$ pulls $g_{m1}v_{in}$ out of node $X$. That current comes from two places: $r_{o1}$ (down to ground) and $M_2$'s source (from the short above). With the drain shorted, (a) with $r_{ds3}\to0$ says $M_2$'s source looks like $r_{ds2}/(1 + g_{m2}r_{ds2})\approx1/g_{m2}$, tiny next to $r_{o1}$, so almost all of it comes through $M_2$. Current divider:
        $$G_M = g_{m1}\,\frac{r_{o1}}{r_{o1} + \dfrac{r_{ds2}}{1 + g_{m2}r_{ds2}}} = \frac{g_{m1}r_{o1}(1 + g_{m2}r_{ds2})}{r_{o1}(1 + g_{m2}r_{ds2}) + r_{ds2}}\approx g_{m1}$$
        And what enters $M_2$'s source leaves its drain, every bit: a gate draws no current. (A BJT cascode device passes only $\alpha$ of it.)

        **(d) Gain.** $R_{UP} = r_{ds3}$, $R_{DN}$ from (b):
        $$A_v = -G_M\big(r_{ds3}\parallel R_{DN}\big)\approx-g_{m1}\big(r_{ds3}\parallel g_{m2}r_{ds2}r_{o1}\big)\approx-g_{m1}r_{ds3}$$
        The cascode made $R_{DN}$ so large that the load $r_{ds3}$ alone sets the gain.

        **(e) The middle node.** $Q_1$'s current $g_{m1}v_{in}$ is pulled out of $X$, and $X$ sees $r_{o1}$ down and $R_X$ up:
        $$\frac{v_x}{v_{in}} = -g_{m1}\big(r_{o1}\parallel R_X\big)\approx-g_{m1}R_X\approx-\frac{g_{m1}}{g_{m2}}\Big(1 + \frac{r_{ds3}}{r_{ds2}}\Big)$$

        **(f) Numbers.** $g_{m1} = I_C/V_T = 0.5\,\text{mA}/25\,\text{mV} = 20\,\text{mS}$; $g_{m2} = 2I_D/V_{ov} = 1\,\text{mA}/0.5\,\text{V} = 2\,\text{mS}$. With $r_{ds3} = r_{ds2}$, $R_X\approx(1/2\,\text{mS})(1 + 1) = 1\kO$, and $v_x/v_{in}\approx-(20\,\text{mS})(1\kO) = -20$. In a MOS–MOS cascode the same node moves by only about $-2$. The BJT's ten-times-larger $g_m$ makes $X$ swing; in Chapter 12 terms, $Q_1$'s $C_\mu$ gets Miller-multiplied by about $21$, so this cascode is not the bandwidth fix it would be with a BJT on top.

        **(g)** $R_{DN}$ is big because a test current pushed into the drain must all come out of the source, through $r_{o1}$, building a large $v_{gs2}$ that fights it. In a BJT cascode device part of that signal current escapes through $r_\pi$ to the held base, which caps the boost at about $g_mr_\pi = \beta$: $R\approx\beta r_o$. The MOSFET gate has no such leak, so $R_{DN}\approx g_{m2}r_{ds2}r_{o1}$ with no ceiling.

        !!key Pattern
          A cascode is always three numbers: the middle node ($R_X\approx(1/g_{m2})(1 + R_{load}/r_{ds2})$), the big output resistance (degenerated drain or collector), and $G_M\approx g_{m1}$. Mixing devices changes two details: a BJT on top leaks through $r_\pi$ ($\beta r_o$ ceiling), a MOSFET on top has a small $g_m$ (the middle node is not quiet).
      `,
    }),
    P({
      id: 'e3pE-3', src: 'Exam 3 practice E · Problem 3 (30 pts)', title: 'Reading $H(s)$ off a Bode plot: a coupling capacitor and two high poles', big: true,
      q: md`The straight-line (asymptotic) magnitude plot below belongs to an amplifier with a coupling capacitor. In its midband the amplifier **inverts**. The level of the flat part is marked; every corner sits on a decade line.

(a) The midband gain $|A_M|$ as a ratio. (b) The low corner $\omega_L$. (c) The first high corner $\omega_H$, and (d) the same corner in hertz. (e) The second high corner. (f) The straight-line $|H|$ at $\omega = 10\,\text{rad/s}$. (g) Where the rising low-frequency line crosses $0\,\text{dB}$. (h) The unity-gain frequency $\omega_u$, where the falling line crosses $0\,\text{dB}$. (i) The straight-line phase at $\omega = 10^5$, taking the midband phase of an inverting amplifier as $180^\circ$. (j) Which $H(s)$ is it?`,
      figHtml: E3Plot,
      parts: [
        { lbl: '|A_M|', unit: 'V/V', ans: 50, traps: [{ v: 34, msg: '$34$ is the level in **dB**. Undo the log: $10^{34/20} = 50$.' }] },
        { lbl: '\\omega_L', unit: 'rad/s', ans: 1e2 },
        { lbl: '\\omega_H', unit: 'rad/s', ans: 1e5 },
        { lbl: 'f_H', unit: 'kHz', ans: 1e5 / (2 * Math.PI) / 1e3, traps: [{ v: 100, msg: 'That is $\\omega_H$ in krad/s. Hertz: $f = \\omega/2\\pi$.' }] },
        { lbl: '\\omega_{p2}', unit: 'rad/s', ans: 1e7 },
        { lbl: '|H(j10)|', unit: 'dB', ans: 14 },
        { lbl: '\\omega\\ (\\text{rising line at }0\\,\\text{dB})', unit: 'rad/s', ans: 2 },
        { lbl: '\\omega_u', unit: 'rad/s', ans: 5e6, accept: [4.55e6], traps: [{ v: 1e7, msg: 'The line reaches $0\\,\\text{dB}$ before the second pole: $34\\,\\text{dB}$ at $20\\,\\text{dB/dec}$ takes $1.7$ decades from $10^5$.' }] },
        { lbl: '\\angle H(j10^5)', unit: 'deg', ans: 135, accept: [134.5, -225, -225.5], traps: [{ v: 180, msg: 'At $\\omega_H$ itself the pole has already turned $45^\\circ$: a pole\'s phase moves from $\\omega_p/10$ to $10\\,\\omega_p$.' }] },
        { lbl: '(j) The transfer function is', mc: [
          '$H(s) = -50\\,\\dfrac{s/10^2}{(1 + s/10^2)(1 + s/10^5)(1 + s/10^7)}$',
          '$H(s) = \\dfrac{-50}{(1 + s/10^2)(1 + s/10^5)(1 + s/10^7)}$',
          '$H(s) = -50\\,\\dfrac{s/10^2}{(1 + s/10^5)(1 + s/10^7)}$',
          '$H(s) = -34\\,\\dfrac{s/10^2}{(1 + s/10^2)(1 + s/10^5)(1 + s/10^7)}$'], a: 0,
          why: [null, 'With no $s$ on top the plot would be flat at low frequency and start falling at $10^2$. The plot **rises** below $10^2$: a zero at the origin.', 'Without the pole at $10^2$ the rising line would never level off before $10^5$.', '$34$ is the level in dB; the gain factor is $10^{34/20} = 50$.'] },
      ],
      hints: [
        md`Undo the dB first: $|A_M| = 10^{34/20}$. Remember $20\log_{10}2 = 6\,\text{dB}$, so $34\,\text{dB} = 40 - 6$.`,
        md`Read the slopes: $+20\,\text{dB/dec}$ at the left means a factor $s$ (a zero at the origin). The slope changes by $-20$ at each pole.`,
        md`Phase: the negative gain gives $180^\circ$, the factor $s$ adds $+90^\circ$, and each pole subtracts a $90^\circ$ ramp running from a decade below to a decade above its corner.`,
      ],
      figs: { plot: { svg: E3Sol, cap: 'Top: solid, the straight lines; dashed, the exact $|H|$ (exactly $3\\,\\text{dB}$ below the corners at $\\omega_L$ and $\\omega_H$). Bottom: the phase, starting at $270^\\circ$ (the $180^\\circ$ of the sign plus the $90^\\circ$ of $s$).' } },
      sol: md`
        **Recognize it first.** Three shapes in one plot: a line **rising** at $+20\,\text{dB/dec}$ at low frequency (the gain goes to zero at DC: a factor $s$, a zero at the origin, the signature of a coupling capacitor), a **flat** midband, then a **falling** part whose slope steepens (two poles: the transistor's capacitances). So $H(s)$ will be a gain, times $s$, over three poles. Reading a plot is just reading three things: the level, where the slope changes, and by how much.

        **(a) The midband level.** $34\,\text{dB} = 40\,\text{dB} - 6\,\text{dB}$. $40\,\text{dB}$ is $100$, and $-6\,\text{dB}$ is a factor $1/2$, so
        $$|A_M| = 10^{34/20} = \frac{100}{2} = 50$$

        **(b)** The rising line levels off at $\omega = 10^2$: the slope changes from $+20$ to $0$, a change of $-20\,\text{dB/dec}$, so there is a **pole** at $\omega_L = 10^2\,\text{rad/s}$.

        **(c)** The flat line starts falling at $10^5$: another $-20$ change, a **pole** at $\omega_H = 10^5\,\text{rad/s}$.

        **(d)** $f_H = \omega_H/2\pi = 10^5/6.28 = 15.9\,\text{kHz}$.

        **(e)** At $10^7$ the slope goes from $-20$ to $-40\,\text{dB/dec}$: a third **pole**, $\omega_{p2} = 10^7\,\text{rad/s}$.

        **(f)** $\omega = 10$ is one decade below $\omega_L$, on the $+20\,\text{dB/dec}$ line: $34 - 20 = 14\,\text{dB}$.

        **(g)** Going down from $\omega_L$, the rising line loses $20\,\text{dB}$ per decade, so it needs $34/20 = 1.7$ decades to reach $0\,\text{dB}$: $\omega = 10^{2 - 1.7} = 10^{0.3} = 2\,\text{rad/s}$. Quicker: on that line $|H| = |A_M|\,\omega/\omega_L$, which is $1$ at $\omega = \omega_L/|A_M| = 100/50 = 2$.

        **(h)** Above $\omega_H$ the line falls at $20\,\text{dB/dec}$: $|H| = |A_M|\,\omega_H/\omega$, which is $1$ at
        $$\omega_u = |A_M|\,\omega_H = 50\times10^5 = 5\times10^6\,\text{rad/s}$$
        That is below $10^7$, so the slope there really is $-20$ ✓. (Gain times bandwidth: the classic one-pole trade. The exact curve crosses at $4.55\times10^6$, pulled down by the second pole.)

        **(i) Phase at $10^5$.** Start at the far left: $-50$ contributes $180^\circ$, and the factor $s$ contributes $+90^\circ$: $270^\circ$.
        - Pole at $10^2$: its $-90^\circ$ ramp runs from $10^1$ to $10^3$; by $10^5$ it is complete: $-90^\circ$.
        - Pole at $10^5$: we are at its corner, half way along its ramp: $-45^\circ$.
        - Pole at $10^7$: its ramp starts at $10^6$: nothing yet.
        $$\angle H(j10^5)\approx270^\circ - 90^\circ - 45^\circ = 135^\circ\qquad(\text{exact: }134.5^\circ)$$
        In the midband the phase is $270 - 90 = 180^\circ$, as it must be for an inverting amplifier ✓.

        **(j)** Assemble the pieces in the lecture's $(1 + s/\omega)$ form:
        $$H(s) = -50\,\frac{s/10^2}{(1 + s/10^2)(1 + s/10^5)(1 + s/10^7)}$$
        **Check.** In the midband ($10^2\ll\omega\ll10^5$), $\dfrac{s/10^2}{1 + s/10^2}\to1$ and the other poles are $\approx1$, so $H\to-50$ ✓. Far below $10^2$, $H\approx-0.5\,s$: $|H| = 1$ at $\omega = 2$ ✓ (part g).

        [[fig:plot]]

        !!key Pattern
          A zero at the origin shows up as a line that keeps rising toward low frequency with no flat start; the pole where it levels off is the low corner $\omega_L$ (for a coupling capacitor $C$, $\omega_L = 1/(R_{seen}C)$). Write the constant so the midband comes out right: $A_M\,\dfrac{s/\omega_L}{1 + s/\omega_L}$ is $A_M$ in the midband.
      `,
    }),
  ];

  // ================================================================== Practice exam F
  const F1Fig = [
    ['rail', [1, -3.4], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -3.4], [1, -2.2], { n: 'R_{E2}', s: kO(2.2), side: 'l' }],
    ['w', [1, -2.2], [2, -2.2]], ['C', [2, -2.2], [2, -3.4], { n: 'C_E' }], ['w', [2, -3.4], [1, -3.4]],
    ['R', [1, -2.2], [1, -1], { n: 'R_{E1}', s: '200\\,\\Omega', side: 'l' }],
    ['pnp', [1, 0], { n: 'Q_1' }],
    ['R', [1, 1], [1, 2.4], { n: 'R_C', s: kO(10), side: 'l' }], ['gnd', [1, 2.4]],
    ['w', [1, 1], [1.7, 1]], ['C', [1.7, 1], [2.5, 1], { n: 'C_2', side: 'b' }], ['w', [2.5, 1], [3.1, 1]], ['term', [3.1, 1], { n: 'v_{out}', side: 'a' }],
    ['R', [3.1, 1], [3.1, 2.4], { n: 'R_L', s: kO(10) }], ['gnd', [3.1, 2.4]],
    ['w', [0, 0], [-0.7, 0]], ['rail', [-0.7, -1.4], { n: 'V_{CC}' }], ['R', [-0.7, -1.4], [-0.7, 0], { n: 'R_1', s: kO(25), side: 'l' }],
    ['R', [-0.7, 0], [-0.7, 1.4], { n: 'R_2', s: kO(100), side: 'l' }], ['gnd', [-0.7, 1.4]],
    ['C', [-2.2, 0], [-1.4, 0], { n: 'C_1' }], ['w', [-1.4, 0], [-0.7, 0]],
    ['Vac', [-2.2, 0], [-2.2, 1.2], { n: 'v_{in}', side: 'l' }], ['gnd', [-2.2, 1.2]],
  ];
  const F2Fig = [
    ['rail', [1, -3], { n: 'V_{DD}' }], ['pmos', [1, -2], { n: 'M_2' }], ['acg', [0, -2]],
    ['w', [1, -1], [1, 0]], ['w', [1, -0.7], [2.4, -0.7]], ['term', [2.4, -0.7], { n: 'v_{out}' }],
    ['R', [-0.6, -0.3], [1, -0.3], { n: 'R_F' }], ['w', [-0.6, -0.3], [-0.6, 1]],
    ['npn', [1, 1], { n: 'Q_1' }], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1]],
    ['C', [-2, 1], [-1.2, 1], { n: '\\infty' }], ['w', [-1.2, 1], [-0.6, 1]],
    ['R', [-3.4, 1], [-2, 1], { n: 'R_S' }], ['Vac', [-3.4, 1], [-3.4, 2.2], { n: 'v_{in}', side: 'l' }], ['gnd', [-3.4, 2.2]],
  ];
  const F3Fig = [
    ['rail', [1, -2.8], { n: 'V_{CC}' }], ['R', [1, -2.8], [1, -1.6], { n: 'R_L', s: kO(2), side: 'l' }],
    ['w', [1, -1.6], [1, -1]], ['w', [1, -1.6], [3, -1.6]], ['term', [3, -1.6], { n: 'v_{out}' }],
    ['C', [2.2, -1.6], [2.2, -0.4], { n: 'C_L', s: '1.5\\,\\text{pF}' }], ['gnd', [2.2, -0.4]],
    ['npn', [1, 0], { n: 'Q_1' }], ['w', [0, 0], [-1, 0]], ['acg', [-1, 0]],
    ['C', [-0.2, 0], [-0.2, -1.2], { n: 'C_\\mu', side: 'l' }], ['w', [-0.2, -1.2], [1, -1.2]],
    ['C', [-0.55, 0], [-0.55, 1.2], { n: 'C_\\pi', side: 'l' }], ['w', [-0.55, 1.2], [1, 1.2]],
    ['w', [1, 1], [1, 1.6]], ['I', [1, 1.6], [1, 2.8], { n: 'I_E', side: 'l' }], ['gnd', [1, 2.8]],
    ['w', [1, 1.6], [1.8, 1.6]], ['C', [1.8, 1.6], [2.6, 1.6], { n: '\\infty' }], ['R', [2.6, 1.6], [3.8, 1.6], { n: 'R_S', s: '75\\,\\Omega' }],
    ['Vac', [3.8, 1.6], [3.8, 2.8], { n: 'v_{in}', side: 'r' }], ['gnd', [3.8, 2.8]],
  ];
  const F2A0 = '-(gm1 - 1/RF)*(ro1 || rds2 || RF)';
  const F2r = { ranges: { gm1: [20e-3, 80e-3], RF: [20e3, 200e3], rpi1: [1e3, 5e3] } };

  const Fex = [
    intro('F', 'A PNP stage, a feedback resistor seen through Miller\'s theorem, and why a common base is fast.'),
    P({
      id: 'e3pF-1', src: 'Exam 3 practice F · Problem 1 (35 pts)', title: 'A PNP common emitter with a partly bypassed emitter', big: true,
      q: md`$V_{CC} = 10\,\text{V}$, $\beta = 100$, $r_o = \infty$, every capacitor is infinite. $Q_1$ is a **PNP**. $R_1 = 25\kO$ (from $V_{CC}$) and $R_2 = 100\kO$ (to ground) bias its base. Its emitter returns to $V_{CC}$ through $R_{E1} = 200\,\Omega$ and $R_{E2} = 2.2\kO$, and $C_E$ bypasses $R_{E2}$ only. $R_C = 10\kO$ runs from the collector to ground. $v_{in}$ is coupled to the base by $C_1$; the output is coupled to $R_L = 10\kO$ by $C_2$. In the DC analysis you may use $\beta + 1\approx\beta$.

(a) The Thévenin equivalent of the divider, $V_{BB}$ and $R_{BB}$. (b) $I_C$ and $V_C$; check that $Q_1$ is forward-active. (c) $g_m$ and $r_\pi$. (d) $R_b$, looking into the base. (e) $R_{in}$, what $v_{in}$ sees to the right of $C_1$. (f) $R_{out}$, looking back from $R_L$ (not counting $R_L$). (g) $A_v = v_{out}/v_{in}$. (h) The PNP's small-signal model.`,
      fig: F1Fig,
      parts: [
        { lbl: 'V_{BB}', unit: 'V', ans: 8 }, { lbl: 'R_{BB}', unit: 'kΩ', ans: 20 },
        { lbl: 'I_C', unit: 'mA', ans: 0.5 }, { lbl: 'V_C', unit: 'V', ans: 5 },
        { lbl: 'g_m', unit: 'mS', ans: 20 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 5 },
        { lbl: 'R_b', unit: 'kΩ', ans: 25.2, accept: [25], traps: [{ v: 245, msg: 'That puts all $2.4\\,\\text{k}\\Omega$ in the emitter. $C_E$ shorts $R_{E2}$ for signals; only $R_{E1}$ is multiplied by $\\beta + 1$.' }, { v: 5, msg: 'That is $r_\\pi$ alone: the unbypassed $R_{E1}$ shows up $(\\beta + 1)$ times bigger at the base.' }] },
        { lbl: 'R_{in}', unit: 'kΩ', ans: 11.15, accept: [11.11] },
        { lbl: 'R_{out}', unit: 'kΩ', ans: 10 },
        { lbl: 'A_v', unit: '', ans: -20, accept: [-19.8], traps: [
          { v: -100, msg: 'That forgets $R_{E1}$: it is not bypassed, so the emitter is not at incremental ground. $G_M = g_m/(1 + g_mR_{E1})$.' },
          { v: -2.02, msg: 'That puts all of $R_{E1} + R_{E2}$ in the emitter. $C_E$ shorts $R_{E2}$ for signals.' },
          { v: -40, msg: 'That uses $R_C$ alone: $C_2$ puts $R_L$ in parallel for signals.' },
          { v: 20, msg: 'A common emitter inverts, PNP or NPN.' }] },
        { lbl: '(h) For small signals, this PNP is modelled by', mc: [
          'the same hybrid-$\\pi$ as an NPN: $r_\\pi$ from base to emitter, $g_mv_\\pi$ from collector to emitter, $v_\\pi = v_b - v_e$',
          'a hybrid-$\\pi$ with the controlled source reversed (from emitter to collector)',
          'a hybrid-$\\pi$ with $g_m = I_E/V_T$ and $r_\\pi = \\beta/g_m$ measured from the collector',
          'no small-signal model: a PNP has to be analysed at DC'], a: 0,
          why: [null, 'The **bias** currents of a PNP flow the other way, but the model describes **changes**. Raise $v_b$ and $v_{EB}$ falls, so less current flows from emitter to collector: exactly what $g_mv_\\pi$ from collector to emitter says. Same model.', '$g_m = I_C/V_T$ for a PNP too (with $|I_C|$), and $r_\\pi$ sits between base and emitter, as in an NPN.', 'Every forward-active transistor has a small-signal model; Lecture 24\'s stages work for a PNP unchanged.'] },
      ],
      hints: [
        md`PNP DC: the emitter sits $0.7\,\text{V}$ **above** the base, and the base current flows **out** of the base into the divider, so $V_B = V_{BB} + I_BR_{BB}$.`,
        md`KVL from $V_{CC}$ down to the Thévenin source: $V_{CC} - I_E(R_{E1} + R_{E2}) - 0.7 - I_BR_{BB} = V_{BB}$.`,
        md`Small signal: $C_E$ shorts $R_{E2}$ (and $V_{CC}$ is ground), so only $R_{E1}$ is in the emitter. Into the base: $r_\pi + (\beta + 1)R_{E1}$. Gain: $G_M = g_m/(1 + g_mR_{E1})$ times $R_C\parallel R_L$.`,
      ],
      sol: md`
        **Recognize it first.** A PNP drawn like a PMOS: emitter on top (arrow pointing **in**), facing $V_{CC}$; collector at the bottom, facing ground. The signal enters at the **base** and leaves at the **collector**; the emitter is common, but for signals it reaches ground ($V_{CC}$) through $R_{E1}$, because $C_E$ shorts only $R_{E2}$. So this is a **common emitter with degeneration $R_{E1}$**. Expect a gain near $-(R_C\parallel R_L)/(r_e + R_{E1})$ and a base resistance near $(\beta + 1)R_{E1}$. For small signals a PNP is the same model as an NPN; only the DC needs care with directions.

        **(a) The divider.** Open-circuit voltage and resistance (with $V_{CC}$ zeroed):
        $$V_{BB} = V_{CC}\frac{R_2}{R_1 + R_2} = 10\cdot\frac{100}{125} = 8\,\text{V},\qquad R_{BB} = R_1\parallel R_2 = \frac{25\cdot100}{125} = 20\kO$$

        **(b) DC, with the PNP's directions.** The emitter current flows **from** $V_{CC}$ down through $R_{E2}$ and $R_{E1}$ **into** the emitter, so $V_E = V_{CC} - I_E(R_{E1} + R_{E2})$. The base is $0.7\,\text{V}$ below the emitter. The base current flows **out** of the base, through $R_{BB}$, into the $8\,\text{V}$ source, so the base sits **above** $V_{BB}$: $V_B = V_{BB} + I_BR_{BB}$. Put the chain together from $V_{CC}$ to $V_{BB}$:
        $$V_{CC} - I_E(R_{E1} + R_{E2}) - 0.7 - I_BR_{BB} = V_{BB}$$
        With $I_E\approx I_C$ and $I_B = I_C/\beta$:
        $$10 - 8 - 0.7 = I_C\Big(2.4\,\text{k} + \frac{20\,\text{k}}{100}\Big)\ \Rightarrow\ 1.3 = I_C(2.6\,\text{k})\ \Rightarrow\ I_C = 0.5\,\text{mA}$$
        Then $V_B = 8 + (5\,\mu\text{A})(20\,\text{k}) = 8.1\,\text{V}$, $V_E = 8.8\,\text{V}$, and the collector current flows out of the collector down through $R_C$: $V_C = (0.5\,\text{mA})(10\kO) = 5\,\text{V}$.
        Forward-active for a PNP means the collector is **below** the base: $V_C = 5\,\text{V} < V_B = 8.1\,\text{V}$ ✓ ($V_{EC} = 3.8\,\text{V} > 0.2\,\text{V}$). (With $\beta + 1$ kept exactly: $I_C = 0.495\,\text{mA}$.)

        **(c)** $g_m = \dfrac{0.5\,\text{mA}}{25\,\text{mV}} = 20\,\text{mS}$ $\big(\tfrac1{g_m} = 50\,\Omega\big)$, $\quad r_\pi = \dfrac{100}{20\,\text{mS}} = 5\kO$.

        **(d) Into the base.** For signals $V_{CC}$ is ground and $C_E$ is a short, so the emitter has only $R_{E1}$ to ground. The $(\beta + 1)$ rule (Lecture 24: $R_{in} = r_\pi + (\beta + 1)R_E$; the emitter current is $\beta + 1$ times the base current, so $R_{E1}$ looks $\beta + 1$ times bigger from the base):
        $$R_b = r_\pi + (\beta + 1)R_{E1} = 5\,\text{k} + 101(200) = 25.2\kO$$

        **(e) What the source sees.** $R_1$ (to $V_{CC}$ = ground), $R_2$ and $R_b$ all go from the base to ground:
        $$R_{in} = R_{BB}\parallel R_b = 20\,\text{k}\parallel25.2\,\text{k} = \frac{20\cdot25.2}{45.2} = 11.15\kO$$

        **(f)** Looking into the collector (with $r_o = \infty$) you see an open circuit, so $R_{out} = R_C = 10\kO$.

        **(g) Gain.** Short the output: $i_{out} = g_mv_\pi$, and KVL from the base through $r_\pi$ and $R_{E1}$ gives $v_{in} = v_\pi + (i_b + i_c)R_{E1} = v_\pi + \big(1 + \tfrac1\beta\big)g_mv_\pi R_{E1}$ (Lecture 24). So
        $$G_M = \frac{g_m}{1 + g_mR_{E1}(\beta + 1)/\beta}\approx\frac{g_m}{1 + g_mR_{E1}} = \frac{20\,\text{mS}}{1 + 4} = 4\,\text{mS}$$
        The output node sees $R_C\parallel R_L = 5\kO$:
        $$A_v = -G_M(R_C\parallel R_L) = -(4\,\text{mS})(5\kO) = -20$$
        **The Art of Electronics way:** the emitter looks like $r_e\approx1/g_m = 50\,\Omega$ in series with $R_{E1} = 200\,\Omega$, so $A_v\approx-\dfrac{R_C\parallel R_L}{r_e + R_{E1}} = -\dfrac{5000}{250} = -20$ ✓. (Exact bias and $\beta + 1$: $-19.8$.)

        **(h)** The same hybrid-$\pi$: a PNP is an NPN with every **bias** current and voltage reversed, and the small-signal model describes changes around the bias, which follow the same law.

        !!trap PNP signs at DC
          Three places to slip: the emitter is $0.7\,\text{V}$ **above** the base; the base current comes **out** of the base (so $V_B > V_{BB}$); forward-active means $V_C$ **below** $V_B$. Draw the current arrows on the schematic before writing KVL.
      `,
    }),
    P({
      id: 'e3pF-2', src: 'Exam 3 practice F · Problem 2 (35 pts)', title: 'Collector-to-base feedback: Miller\'s theorem on a resistor', big: true,
      q: md`$Q_1$ (NPN, emitter grounded) is loaded by $M_2$ (PMOS, gate at a fixed bias, source on $V_{DD}$). A resistor $R_F$ runs from the collector (the output) back to the base; it also sets the DC bias. The source $v_{in}$, with resistance $R_S$, is coupled to the base by an infinite capacitor. Keep $r_{\pi1}$, $r_{o1}$ and $r_{ds2}$. In symbols:

(a) Drive the base directly ($R_S = 0$) and short the output: $G_{M0}$. (b) $R_{out0}$, looking into the output with the base held at ground. (c) $A_{v0} = v_{out}/v_b$ with the base driven directly. (d) Miller's theorem: $R_{in}$, everything from the base to ground (including $r_{\pi1}$), in terms of $r_{\pi1}$, $R_F$ and $A_{v0}$ (the answer box calls it Av0). (e) $A_v = v_{out}/v_{in}$ with $R_S$, in terms of $A_{v0}$, $R_{in}$ and $R_S$. (f) $R_{out}$ with $R_S$ in place and $v_{in} = 0$. (g) The limit of a very large $|A_{v0}|$.`,
      fig: F2Fig,
      parts: [
        ex('gm1 - 1/RF', ['gm1', 'RF'], 'G_{M0}', F2r),
        ex('ro1 || rds2 || RF', ['ro1', 'rds2', 'RF'], 'R_{out0}', F2r),
        ex(F2A0, ['gm1', 'ro1', 'rds2', 'RF'], 'A_{v0}', F2r),
        ex('rpi1 || (RF/(1 - Av0))', ['rpi1', 'RF', 'Av0'], 'R_{in}', { ranges: { Av0: [-2000, -50], RF: [20e3, 200e3] } }),
        ex('Av0*Rin/(RS + Rin)', ['Av0', 'Rin', 'RS'], 'A_v', { ranges: { Av0: [-2000, -50] } }),
        ex('(ro1 || rds2) || ((RF + (RS || rpi1))/(1 + gm1*(RS || rpi1)))', ['gm1', 'rpi1', 'ro1', 'rds2', 'RF', 'RS'], 'R_{out}', F2r),
        { lbl: '(g) When $|A_{v0}|$ is very large (and $R_F/|A_{v0}|\\ll r_{\\pi1}$), $v_{out}/v_{in}$ approaches', mc: ['$-R_F/R_S$', '$A_{v0}$', '$-g_{m1}R_F$', '$-1$'], a: 0,
          why: [null, 'Only if $R_S = 0$. With $R_S$, the base node has a resistance of only about $R_F/|A_{v0}|$, tiny next to $R_S$, so almost all of $v_{in}$ is lost across $R_S$.', 'That is the gain from the base with a load of $R_F$ alone; it ignores the input divider.', 'That would need $R_F = R_S$.'] },
      ],
      hints: [
        md`(a)–(c): with the base driven by an ideal source, $R_F$ is just a resistor from the output to a node that the source holds. Short the output: the current through $R_F$ is $v_b/R_F$, flowing **into** the output node.`,
        md`(d) Miller: an impedance $Z_F$ from node 1 to node 2 with $v_2 = A_vv_1$ looks like $Z_F/(1 - A_v)$ from node 1 to ground. Here $A_{v0}$ is large and negative.`,
        md`(f) With $v_{in} = 0$ the base sees $R_S\parallel r_{\pi1}$ to ground, so the base moves when the output moves: $v_b = Kv_x$ with $K = \dfrac{R_S\parallel r_{\pi1}}{R_F + R_S\parallel r_{\pi1}}$. That is Exam 2's K rule.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base**, out at the **collector**, emitter grounded: a **common emitter**, with a large inverting gain.
        - $M_2$: PMOS (source on top), gate held, output on its **drain**: a current-source load, $r_{ds2}$.
        - $R_F$: a resistor from the output **back** to the input: it connects the two ends of an inverting amplifier. That is exactly Lecture 28's picture for Miller's theorem, with $Z_F = R_F$ instead of a capacitor. Expect $R_F$ to look very **small** from the base: $R_F/(1 + |A_{v0}|)$.

        **(a) $G_{M0}$.** Base driven by an ideal source $v_b$, output shorted to ground. Two currents meet at the shorted output node: $Q_1$ pulls $g_{m1}v_b$ **down** into its collector, and $R_F$ pushes $v_b/R_F$ **into** the node from the base. The short supplies the difference:
        $$i_{out} = g_{m1}v_b - \frac{v_b}{R_F}\ \Rightarrow\ G_{M0} = g_{m1} - \frac{1}{R_F}$$
        (The $1/R_F$ is current fed forward through the resistor: tiny, since $g_{m1}R_F\gg1$.)

        **(b) $R_{out0}$.** Base at ground: $v_\pi = 0$, so the controlled source is off. From the output to ground: $r_{o1}$, $r_{ds2}$ (up to $V_{DD}$ = ground) and $R_F$ (to the grounded base):
        $$R_{out0} = r_{o1}\parallel r_{ds2}\parallel R_F$$

        **(c)** $A_{v0} = -G_{M0}R_{out0} = -\Big(g_{m1} - \dfrac1{R_F}\Big)\big(r_{o1}\parallel r_{ds2}\parallel R_F\big)$, large and negative.

        **(d) Miller.** The output follows the base with gain $A_{v0}$, whatever drives the base (the collector-node KCL does not involve $R_S$). So the current into $R_F$ from the base is
        $$\frac{v_b - v_{out}}{R_F} = \frac{v_b(1 - A_{v0})}{R_F}$$
        From the base, $R_F$ therefore looks like a resistor $R_F/(1 - A_{v0})$ to ground. Add $r_{\pi1}$, which also runs from the base to ground:
        $$R_{in} = r_{\pi1}\ \Big\|\ \frac{R_F}{1 - A_{v0}}$$
        Because $A_{v0}$ is large and negative, $1 - A_{v0} = 1 + |A_{v0}|$: a $100\kO$ feedback resistor with $|A_{v0}| = 1000$ looks like $100\,\Omega$.

        **(e) With $R_S$.** The source sees $R_S$ in series with $R_{in}$, and the base-to-output gain is still $A_{v0}$:
        $$A_v = \frac{v_{out}}{v_{in}} = A_{v0}\,\frac{R_{in}}{R_S + R_{in}}$$

        **(f) $R_{out}$ with $R_S$ in place.** Zero $v_{in}$: the base now has $R_B' = R_S\parallel r_{\pi1}$ to ground, so it is **not** held. Push $v_x$ on the output. $R_F$ and $R_B'$ divide it: $v_b = Kv_x$ with $K = R_B'/(R_F + R_B')$, and the current through $R_F$ is $v_x/(R_F + R_B')$. KCL at the output:
        $$i_x = \frac{v_x}{r_{o1}\parallel r_{ds2}} + g_{m1}Kv_x + \frac{v_x}{R_F + R_B'}$$
        The last two terms together are $v_x(1 + g_{m1}R_B')/(R_F + R_B')$, so
        $$R_{out} = \big(r_{o1}\parallel r_{ds2}\big)\ \Big\|\ \frac{R_F + R_S\parallel r_{\pi1}}{1 + g_{m1}(R_S\parallel r_{\pi1})}$$
        This is Exam 2's K rule: the path through $R_F$ acts like a "diode" whose resistance shrinks by $1 + g_{m1}R_B'$. **Check:** $R_S = 0$ gives $R_B' = 0$ and the second term is $R_F$: back to (b) ✓. And $-G_MR_{out}$ with this $R_{out}$ reproduces (e), as it must (I checked it numerically).

        **(g)** With $|A_{v0}|$ huge, $R_{in}\approx R_F/|A_{v0}|$ is tiny, so
        $$A_v\approx A_{v0}\,\frac{R_F/|A_{v0}|}{R_S} = -\frac{R_F}{R_S}$$
        The base is a **virtual ground**, like an op-amp's inverting input: $v_{in}$ pushes $v_{in}/R_S$ into it, all of it flows on through $R_F$, and $v_{out} = -R_Fv_{in}/R_S$. One transistor and one resistor make an inverting amplifier whose gain no longer depends on $g_m$, $\beta$ or $r_o$.

        !!key Miller's theorem is not only for capacitors
          Any element $Z_F$ between the input and output of a gain $A$ looks like $Z_F/(1 - A)$ at the input and $Z_F/(1 - 1/A)$ at the output. For a capacitor it multiplies $C$ by $1 - A$; for a resistor it **divides** $R$ by $1 - A$. Same theorem, same Lecture 28 derivation.
      `,
    }),
    P({
      id: 'e3pF-3', src: 'Exam 3 practice F · Problem 3 (30 pts)', title: 'Why a common base is fast: node poles and time constants', big: true,
      q: md`A common-base stage: the base is held at a fixed DC voltage, an ideal current source biases the emitter at $I_C = 1\,\text{mA}$, and $v_{in}$ (resistance $R_S = 75\,\Omega$) is coupled into the emitter. The total collector load is $R_L = 2\kO$ with $C_L = 1.5\,\text{pF}$. $\beta = 100$, $r_o = \infty$, $C_\pi = 8\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$ (drawn between the transistor's terminals).

(a) $R_{in}$, looking into the emitter. (b) The midband gain $A_M = v_{out}/v_{in}$. (c) The resistance seen by $C_\pi$. (d) The resistance seen by $C_\mu$. (e) The bandwidth estimate $\omega_{-3dB}$ from open-circuit time constants. (f) The output pole $\omega_{p,out}$. (g) Why no Miller effect? (h) If the same transistor were a common emitter fed from the same $75\,\Omega$ source (same $R_L$), what would $C_\mu$'s time constant be?`,
      fig: F3Fig,
      parts: [
        { lbl: 'R_{in}', unit: 'Ω', ans: 25, accept: [24.75], traps: [{ v: 2500, msg: 'That is $r_\\pi$, the base. Looking into the **emitter** with the base held you see $r_\\pi/(\\beta + 1)\\approx1/g_m$.' }] },
        { lbl: 'A_M', unit: '', ans: 20, accept: [19.85], traps: [
          { v: 80, msg: 'That is $g_mR_L$, the gain from the emitter. The source first loses $R_S/(R_S + R_{in}) = 3/4$ of $v_{in}$: the emitter is only $25\\,\\Omega$.' },
          { v: -20, msg: 'A common base does not invert: raise the emitter and the transistor turns **down**, so the collector rises.' }] },
        { lbl: 'R_{C\\pi}', unit: 'Ω', ans: 18.75, accept: [18.61], traps: [{ v: 75, msg: 'That is $R_S$ alone. The emitter node also has the transistor\'s own $1/g_m$ to ground: $R_S\\parallel25\\,\\Omega$.' }, { v: 25, msg: 'That is the transistor alone; $R_S$ is also on the emitter node, in parallel.' }] },
        { lbl: 'R_{C\\mu}', unit: 'kΩ', ans: 2, traps: [{ v: 3.519, msg: 'That applies the bridge formula $R_{left} + R_{right} + g_mR_{left}R_{right}$. But $C_\\mu$ does not bridge input and output here: one end is the **base**, which is grounded.' }] },
        { lbl: '\\omega_{-3dB}', unit: 'rad/s', ans: 1 / 4.15e-9, accept: [2.5e8] },
        { lbl: '\\omega_{p,out}', unit: 'rad/s', ans: 2.5e8, traps: [{ v: 1 / 3e-9, msg: 'That counts $C_L$ only. $C_\\mu$ also runs from the output node to (incremental) ground: $C_\\mu + C_L = 2\\,\\text{pF}$.' }] },
        { lbl: '(g) The common base has no Miller multiplication because', mc: [
          'no capacitor connects the input node to the output node: $C_\\pi$ goes from the emitter to the grounded base, $C_\\mu$ from the collector to the grounded base',
          'its gain is positive, and Miller only applies to inverting stages',
          'its gain is smaller than a common emitter\'s',
          '$C_\\mu$ is much smaller than $C_\\pi$'], a: 0,
          why: [null, 'Miller applies to any gain: $Z_F/(1 - A)$. A capacitor across a **non**-inverting gain shrinks instead. But here there is no capacitor across the gain at all.', 'A smaller gain would shrink a Miller factor, not remove it. The point is that nothing bridges input and output.', 'In a common emitter the small $C_\\mu$ dominates precisely because it is Miller-multiplied. Size is not the reason.'] },
        { lbl: '\\tau_\\mu\\ \\text{(as a common emitter)}', unit: 'ns', ans: 3.95, accept: [4.04], traps: [{ v: 1, msg: 'That is the common base value, $R_LC_\\mu$. In a common emitter $C_\\mu$ bridges base and collector: $R_{left} + R_{right} + g_mR_{left}R_{right}$.' }] },
      ],
      hints: [
        md`Base held: it is incremental ground. So $C_\pi$ (base–emitter) hangs from the emitter node to ground, and $C_\mu$ (base–collector) hangs from the collector node to ground.`,
        md`The emitter node: $R_S$ (to the zeroed source) in parallel with what you see looking into the emitter, $r_\pi/(\beta + 1)\approx1/g_m$. The current source is open.`,
        md`One pole per node, $1/(RC)$, and here it is exact: with $r_o = \infty$ and the base grounded, the two nodes do not talk back to each other.`,
      ],
      sol: md`
        **Recognize it first.** The base is held at a DC voltage: incremental ground. The signal enters at the **emitter** and leaves at the **collector**: a **common base**. Now place the capacitors with the base at ground: $C_\pi$ (base–emitter) is a capacitor from the **input** node to ground; $C_\mu$ (base–collector) is a capacitor from the **output** node to ground, next to $C_L$. Nothing bridges input and output, so there is no Miller multiplication. Expect two simple node poles: a very fast one at the emitter (the emitter is only about $25\,\Omega$) and a slower one at the collector.

        **(a)** $g_m = 1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$, $r_\pi = 100/40\,\text{mS} = 2.5\kO$. Into the emitter with the base held (Lecture 24 summary):
        $$R_{in} = \frac{r_\pi}{\beta + 1} = \frac{2500}{101} = 24.75\,\Omega\approx\frac1{g_m} = 25\,\Omega$$
        The current source in parallel is open for signals.

        **(b) Midband gain** (all device capacitors open). The source sees $R_S$ in series with the emitter's $25\,\Omega$:
        $$\frac{v_e}{v_{in}} = \frac{25}{75 + 25} = 0.25,\qquad\frac{v_{out}}{v_e} = +g_mR_L = (40\,\text{mS})(2\kO) = 80,\qquad A_M = 0.25\times80 = 20$$
        Positive: raising the emitter lowers $v_\pi = v_b - v_e$, the collector current falls, the drop across $R_L$ falls, the collector rises. ($24.75\,\Omega$ gives $19.85$.)

        **(c) $C_\pi$.** Open $C_\mu$ and $C_L$; zero $v_{in}$. Between the emitter and ground (the base) you see $R_S$ in parallel with the emitter's own resistance:
        $$R_{C\pi} = R_S\parallel\frac1{g_m} = 75\parallel25 = 18.75\,\Omega,\qquad\tau_\pi = (18.75)(8\,\text{p}) = 0.15\,\text{ns}$$

        **(d) $C_\mu$.** Between the collector and ground: $R_L$, and looking into the collector with $r_o = \infty$ an open circuit:
        $$R_{C\mu} = R_L = 2\kO,\qquad\tau_\mu = (2\,\text{k})(0.5\,\text{p}) = 1\,\text{ns}$$
        $C_L$ sees the same node: $\tau_L = (2\,\text{k})(1.5\,\text{p}) = 3\,\text{ns}$.

        **(e) Open-circuit time constants.**
        $$\sum\tau = 0.15 + 1 + 3 = 4.15\,\text{ns},\qquad\omega_{-3dB}\approx\frac{1}{4.15\,\text{ns}} = 2.41\times10^8\,\text{rad/s}$$

        **(f) The poles exactly.** With the base grounded and $r_o = \infty$, the emitter node and the collector node are coupled only one way (the emitter voltage sets the collector current, nothing comes back), so each node is its own first-order circuit:
        $$\omega_{p,in} = \frac{1}{(18.75\,\Omega)(8\,\text{pF})} = 6.7\times10^9,\qquad\omega_{p,out} = \frac{1}{R_L(C_\mu + C_L)} = \frac{1}{(2\,\text{k})(2\,\text{p})} = 2.5\times10^8\,\text{rad/s}$$
        The output pole dominates: the exact $-3\,\text{dB}$ frequency is $2.50\times10^8$, and the time-constant estimate ($2.41\times10^8$) is slightly pessimistic, as always.

        **(g)** In a common emitter $C_\mu$ connects the input (base) to the output (collector) of an inverting gain, and Miller multiplies it by about $1 + g_mR_L$. In a common base the input is the emitter, and neither capacitor touches both the emitter and the collector.

        **(h) The same transistor as a common emitter.** Now $C_\mu$ bridges the base node ($R_{left} = R_S\parallel r_\pi = 75\parallel2500 = 72.8\,\Omega$) and the collector ($R_{right} = R_L$):
        $$R_{C\mu} = R_{left} + R_{right} + g_mR_{left}R_{right} = 72.8 + 2000 + (0.04)(72.8)(2000) = 7.90\kO,\qquad\tau_\mu = 3.95\,\text{ns}$$
        Four times the common-base value. That stage would have a $-3\,\text{dB}$ estimate of only $1.3\times10^8$, but a gain of $-78$: the common base buys its speed by taking the signal in at a $25\,\Omega$ node, which wastes most of $v_{in}$ unless the source resistance is small.

        !!key Pattern
          Ground the held terminal first, then place every capacitor: is it node-to-ground (time constant = node resistance $\times C$), or does it bridge two nodes with gain between them (the $R_{left} + R_{right} + G_mR_{left}R_{right}$ rule)? Common base and common gate (Lecture 29: $R_{gs} = R_S\parallel\tfrac1{g_m}$, $C_{gd}$ with $C_L$ at the output) have only the first kind.
      `,
    }),
  ];

  // ================================================================== Practice exam G
  const G1Fig = [
    ['rail', [0.8, -2.2], { n: '+5\\,\\text{V}' }], ['R', [0.8, -2.2], [0.8, -1], { n: 'R_{C1}', s: kO(2), side: 'l' }],
    ['npn', [0.8, 0], { n: 'Q_1' }],
    ['R', [0.8, 1], [0.8, 2.4], { n: 'R_{E1}', s: kO(4.2), side: 'l' }], ['term', [0.8, 2.4], { n: '-5\\,\\text{V}', side: 'b' }],
    ['w', [0.8, 1], [1.4, 1]], ['C', [1.4, 1], [1.4, 2.2], { n: 'C_E' }], ['gnd', [1.4, 2.2]],
    ['w', [-0.2, 0], [-0.6, 0]], ['R', [-0.6, 0], [-0.6, 1.4], { n: 'R_{B1}', s: kO(10), side: 'l' }], ['gnd', [-0.6, 1.4]],
    ['C', [-1.6, 0], [-1, 0], { n: 'C_1' }], ['w', [-1, 0], [-0.6, 0]],
    ['R', [-2.7, 0], [-1.6, 0], { n: 'R_S', s: '500\\,\\Omega' }], ['Vac', [-2.7, 0], [-2.7, 1.2], { n: 'v_{in}', side: 'l' }], ['gnd', [-2.7, 1.2]],
    ['w', [0.8, -1], [1.5, -1]], ['C', [1.5, -1], [2.1, -1], { n: 'C_2' }], ['w', [2.1, -1], [2.5, -1], [2.5, 0], [2.9, 0]],
    ['R', [2.5, 0], [2.5, 1.4], { n: 'R_{B2}', s: kO(10), side: 'l' }], ['gnd', [2.5, 1.4]],
    ['rail', [3.9, -2.2], { n: '+5\\,\\text{V}' }], ['R', [3.9, -2.2], [3.9, -1], { n: 'R_{C2}', s: kO(2), side: 'l' }],
    ['npn', [3.9, 0], { n: 'Q_2' }],
    ['R', [3.9, 1], [3.9, 2.4], { n: 'R_{E2}', s: kO(4.2), side: 'l' }], ['term', [3.9, 2.4], { n: '-5\\,\\text{V}', side: 'b' }],
    ['w', [3.9, 1], [4.5, 1]], ['C', [4.5, 1], [4.5, 2.2], { n: 'C_E' }], ['gnd', [4.5, 2.2]],
    ['w', [3.9, -1], [4.5, -1]], ['C', [4.5, -1], [5.1, -1], { n: 'C_3' }], ['w', [5.1, -1], [5.6, -1]], ['term', [5.6, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [5.6, -1], [5.6, 0.4], { n: 'R_L', s: kO(2) }], ['gnd', [5.6, 0.4]],
  ];
  const G2Fig = [
    ['rail', [0, -1], { n: 'V_{CC}' }], ['npn', [0, 0], { n: 'Q_1' }],
    ['R', [-1.4, 0], [-1, 0], { n: 'R_S' }], ['w', [-1.4, 0], [-1.9, 0], [-1.9, 0.3]], ['Vac', [-1.9, 0.3], [-1.9, 1.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.9, 1.3]],
    ['w', [0, 1], [0, 1.4], [2.4, 1.4], [2.4, 1]], ['node', [1.2, 1.4], { n: 'X', side: 'a' }],
    ['nmos', [1.2, 2.4], { n: 'M_3' }], ['acg', [0.2, 2.4]], ['gnd', [1.2, 3.4]],
    ['npn', [2.4, 0], { n: 'Q_2', flip: true }], ['acg', [3.4, 0]],
    ['rail', [2.4, -2.2], { n: 'V_{CC}' }], ['R', [2.4, -2.2], [2.4, -1], { n: 'R_C', side: 'l' }],
    ['w', [2.4, -1], [3.6, -1]], ['term', [3.6, -1], { n: 'v_{out}' }],
  ];
  const G3Fig = [
    ['rail', [2, -2.6], { n: 'V_{DD}' }], ['R', [2, -2.6], [2, -1.4], { n: 'R_L', s: kO(5), side: 'l' }],
    ['w', [2, -1.4], [2, -1]], ['w', [2, -1.4], [3.6, -1.4]], ['term', [3.6, -1.4], { n: 'v_{out}' }],
    ['C', [3, -1.4], [3, -0.2], { n: 'C_L' }], ['gnd', [3, -0.2]],
    ['nmos', [2, 0], { n: 'M_2' }], ['w', [1, 0], [0, 0]], ['acg', [0, 0]],
    ['C', [0.75, 0], [0.75, -1], { n: 'C_{gd2}', side: 'l' }], ['w', [0.75, -1], [2, -1]],
    ['C', [0.4, 0], [0.4, 1], { n: 'C_{gs2}', side: 'r' }], ['w', [0.4, 1], [2, 1]],
    ['w', [2, 1], [2, 1.4]], ['node', [2, 1.2], { n: 'X', side: 'r' }],
    ['nmos', [2, 2.4], { n: 'M_1' }], ['gnd', [2, 3.4]],
    ['w', [1, 2.4], [-0.2, 2.4]],
    ['C', [0.6, 2.4], [0.6, 1.4], { n: 'C_{gd1}', side: 'l' }], ['w', [0.6, 1.4], [2, 1.4]],
    ['C', [0.2, 2.4], [0.2, 3.4], { n: 'C_{gs1}', side: 'l' }], ['gnd', [0.2, 3.4]],
    ['R', [-1.4, 2.4], [-0.2, 2.4], { n: 'R_S', s: kO(5) }], ['Vac', [-1.4, 2.4], [-1.4, 3.6], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.4, 3.6]],
  ];
  const G2RE1 = '(RS + rpi1)/(beta1 + 1)';
  const G2X = '(rds3 || (rpi2/(beta2 + 1)))';
  const G2v = ['gm1', 'rpi1', 'beta1', 'RS', 'gm2', 'rpi2', 'beta2', 'rds3', 'RC'];

  const Gex = [
    intro('G', 'Two stages that load each other, a follower driving a common base, and what a cascode does to the bandwidth.'),
    P({
      id: 'e3pG-1', src: 'Exam 3 practice G · Problem 1 (35 pts)', title: 'Two capacitor-coupled common-emitter stages on ±5 V', big: true,
      q: md`Two identical common-emitter stages on $\pm5\,\text{V}$ supplies. In each, $R_B = 10\kO$ runs from the base to ground, $R_E = 4.2\kO$ from the emitter to $-5\,\text{V}$ (bypassed by $C_E$), and $R_C = 2\kO$ from the collector to $+5\,\text{V}$. The source $v_{in}$ ($R_S = 500\,\Omega$) is coupled to the first base by $C_1$; $C_2$ couples the first collector to the second base; $C_3$ couples the output to $R_L = 2\kO$. $\beta = 100$, $r_o = \infty$, capacitors infinite; in the DC analysis use $\beta + 1\approx\beta$.

(a) The bias of each stage: $I_C$, $V_B$ and $V_C$. (b) $g_m$ and $r_\pi$. (c) $R_{in2}$, the input resistance of the second stage (to the right of $C_2$). (d) $A_{v1} = v_{c1}/v_{b1}$, the first stage's gain from its own base. (e) $A_{v2} = v_{out}/v_{b2}$. (f) The overall $A_v = v_{out}/v_{in}$, and (g) the same in dB. (h) What if $C_2$ were replaced by a wire?`,
      fig: G1Fig,
      parts: [
        { lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'V_B', unit: 'V', ans: -0.1, traps: [{ v: 0, msg: 'The base current flows through $R_B$ to ground, so the base sits a little **below** ground: $V_B = -I_BR_B$.' }] },
        { lbl: 'V_C', unit: 'V', ans: 3 },
        { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 },
        { lbl: 'R_{in2}', unit: 'kΩ', ans: 2, traps: [{ v: 2.5, msg: 'That is $r_{\\pi2}$ alone. $R_{B2}$ also runs from the second base to ground.' }] },
        { lbl: 'A_{v1}', unit: '', ans: -40, traps: [{ v: -80, msg: 'That is $-g_mR_{C1}$, the **unloaded** gain. $C_2$ hangs the second stage\'s $R_{in2} = 2\\,\\text{k}\\Omega$ on the first collector, in parallel with $R_{C1}$.' }] },
        { lbl: 'A_{v2}', unit: '', ans: -40, traps: [{ v: -80, msg: 'That forgets $R_L$, which $C_3$ puts in parallel with $R_{C2}$.' }] },
        { lbl: 'A_v', unit: '', ans: 1280, accept: [1262], traps: [
          { v: -1280, msg: 'Two inverting stages: the signs cancel. The overall gain is positive.' },
          { v: 1600, msg: 'That forgets the input divider: only $R_{in}/(R_S + R_{in}) = 0.8$ of $v_{in}$ reaches the first base.' },
          { v: 2560, msg: 'That uses the unloaded first-stage gain ($-80$). The second stage loads the first collector.' }] },
        { lbl: '|A_v|', unit: 'dB', ans: 20 * Math.log10(1280) },
        { lbl: '(h) If $C_2$ were replaced by a wire,', mc: ['$Q_2$ would saturate: its base would sit near $V_{C1}\\approx2.5\\,\\text{V}$ instead of $-0.1\\,\\text{V}$', 'nothing would change: $C_2$ is a short for signals anyway', 'only the gain would change, by a factor of 2', '$Q_1$ would cut off'], a: 0,
          why: [null, 'For **signals** it is a short; at **DC** it is an open, and that is its job: it keeps the two bias points independent. A wire drags $Q_2$\'s base up to $Q_1$\'s collector voltage.', 'The DC problem comes first: with the base near $2.5\\,\\text{V}$, $Q_2$ would carry about $1.6\\,\\text{mA}$ and its collector would fall below its base.', '$Q_1$\'s own bias does not change much: its base and emitter network are untouched; only its collector node shifts down to about $2.5\\,\\text{V}$, still above its base.'] },
      ],
      hints: [
        md`DC of one stage: KVL from ground, through $R_B$, the base-emitter junction and $R_E$ to $-5\,\text{V}$: $0 - I_BR_B - 0.7 - I_ER_E = -5$.`,
        md`Each stage, seen from its base, is $R_B\parallel r_\pi$ to ground. That is what the source sees at stage 1, **and** what stage 1's collector sees through $C_2$.`,
        md`Chain: $A_v = \dfrac{R_{in1}}{R_S + R_{in1}}\cdot\big[-g_m(R_{C1}\parallel R_{in2})\big]\cdot\big[-g_m(R_{C2}\parallel R_L)\big]$.`,
      ],
      sol: md`
        **Recognize it first.** Each transistor takes the signal at the **base** and delivers it at the **collector**, with its emitter tied to ground for signals by $C_E$: two **common emitters** in a chain. The capacitors decide everything else: at DC they are open, so each stage has its own bias and the stages are identical; for signals they are shorts, so stage 2's input resistance becomes stage 1's load. Expect each stage to give about $-g_m\times(\text{its collector load})$, with the two minus signs cancelling.

        **(a) DC, one stage** (both are the same). The base current flows from ground **up** through $R_B$ into the base, so the base sits slightly below ground: $V_B = -I_BR_B$. KVL from ground through $R_B$, $V_{BE}$ and $R_E$ down to $-5\,\text{V}$:
        $$0 - I_BR_B - 0.7 - I_ER_E = -5\ \Rightarrow\ 4.3 = I_C\Big(\frac{R_B}{\beta} + R_E\Big) = I_C(0.1\,\text{k} + 4.2\,\text{k})\ \Rightarrow\ I_C = 1\,\text{mA}$$
        So $V_B = -(10\,\mu\text{A})(10\,\text{k}) = -0.1\,\text{V}$, $V_E = -0.8\,\text{V}$, and $V_C = 5 - (1\,\text{mA})(2\,\text{k}) = 3\,\text{V}$. Forward-active: $V_C = 3\,\text{V} > V_B = -0.1\,\text{V}$ ✓. (Exact: $I_C = 0.990\,\text{mA}$.)

        **(b)** $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$ (both stages).

        **(c) Input resistance of a stage.** For signals the emitter is grounded by $C_E$, so the base shows $r_\pi$; $R_B$ is in parallel:
        $$R_{in2} = R_{B2}\parallel r_{\pi2} = 10\,\text{k}\parallel2.5\,\text{k} = 2\kO$$
        Stage 1 has the same input resistance, $R_{in1} = 2\kO$.

        **(d) Stage 1, loaded.** $Q_1$'s collector current $g_mv_{b1}$ flows into everything on its collector node: $R_{C1}$ (to $+5\,\text{V}$ = ground) and, through $C_2$, stage 2's $R_{in2}$:
        $$A_{v1} = -g_m\big(R_{C1}\parallel R_{in2}\big) = -(40\,\text{mS})(2\,\text{k}\parallel2\,\text{k}) = -(40\,\text{mS})(1\kO) = -40$$
        Unloaded it would be $-80$: the second stage halves the first stage's gain.

        **(e) Stage 2.** Its collector sees $R_{C2}\parallel R_L = 1\kO$: $A_{v2} = -40$.

        **(f) The chain.** The input divider, then the two stages:
        $$\frac{v_{b1}}{v_{in}} = \frac{R_{in1}}{R_S + R_{in1}} = \frac{2}{2.5} = 0.8,\qquad A_v = 0.8\times(-40)\times(-40) = +1280$$
        Multiplying is legal because each stage's gain was computed with the **next** stage's input resistance as its load. (Exact bias: $+1262$.)

        **(g)** $20\log_{10}1280 = 20\log_{10}1.28 + 60 = 2.1 + 60 = 62.1\,\text{dB}$. Equivalently: $-1.9\,\text{dB}$ (the divider) $+ 32\,\text{dB} + 32\,\text{dB}$.

        **(h) Without $C_2$.** $Q_2$'s base would be wired to $Q_1$'s collector, near $2.5\,\text{V}$ (the extra current into $R_{B2}$ and $Q_2$'s base pulls it down from $3\,\text{V}$). Then $V_{E2}\approx1.8\,\text{V}$, $I_{C2}\approx(1.8 + 5)/4.2\,\text{k}\approx1.6\,\text{mA}$, and $V_{C2}\approx5 - 3.2 = 1.8\,\text{V}$: below its base, so $Q_2$ **saturates** (the full solve gives $V_{CE2}\approx0$). Coupling capacitors exist so that each stage can be biased on its own.

        !!trap Load every stage with the next one
          The most common two-stage slip is $-g_mR_C$ for the first stage ($-80$), which gives $2560$. A BJT base is not an open circuit: the next stage's $R_B\parallel r_\pi$ sits on the previous collector. With MOSFETs (gate = open) you could skip this; with BJTs you never can.
      `,
    }),
    P({
      id: 'e3pG-2', src: 'Exam 3 practice G · Problem 2 (35 pts)', title: 'A follower driving a common base (the emitter-coupled pair)', big: true,
      q: md`$Q_1$ (collector on $V_{CC}$) takes $v_{in}$ at its base through $R_S$. Its emitter, node $X$, is also the emitter of $Q_2$, whose base is held at a fixed bias; $Q_2$'s collector is the output, with $R_C$ to $V_{CC}$. $M_3$ (NMOS, gate at a fixed bias) is the bias current source at $X$. Take $r_{o1} = r_{o2} = \infty$; keep $r_{ds3}$. In symbols:

(a) $R_{E1}$, looking into $Q_1$'s emitter from $X$ (with $v_{in} = 0$). (b) $R_{E2}$, looking into $Q_2$'s emitter from $X$. (c) $R_{in}$, looking into $Q_1$'s base. (d) $v_x/v_{in}$. (e) $A_v = v_{out}/v_{in}$. (f) $R_{out}$. (g) The matched limit.`,
      fig: G2Fig,
      parts: [
        ex(G2RE1, ['gm1', 'rpi1', 'beta1', 'RS'], 'R_{E1}'),
        ex('rpi2/(beta2 + 1)', ['gm2', 'rpi2', 'beta2'], 'R_{E2}'),
        ex(`rpi1 + (beta1 + 1)*${G2X}`, G2v, 'R_{in}'),
        ex(`${G2X}/(${G2X} + ${G2RE1})`, G2v, 'v_x/v_{in}'),
        ex(`gm2*RC*${G2X}/(${G2X} + ${G2RE1})`, G2v, 'A_v'),
        ex('RC', G2v, 'R_{out}'),
        { lbl: '(g) With $R_S = 0$, $r_{ds3}\\to\\infty$, $\\beta\\gg1$ and $g_{m1} = g_{m2} = g_m$, $A_v$ becomes', mc: ['$+g_mR_C/2$', '$-g_mR_C$', '$+g_mR_C$', '$-g_mR_C/2$'], a: 0,
          why: [null, 'No inversion anywhere: $Q_1$ follows, and $Q_2$ is a common base, which does not invert.', 'That would need $v_x = v_{in}$, but $Q_2$\'s emitter ($1/g_m$) loads the follower, whose own output resistance is also $1/g_m$: $v_x = v_{in}/2$.', 'The magnitude is right, but neither stage inverts.'] },
      ],
      hints: [
        md`$Q_1$: in at the base, out at the emitter, collector on a rail: a **follower**. $Q_2$: base held, in at the emitter, out at the collector: a **common base**. $M_3$: gate held, the node $X$ sees its drain: $r_{ds3}$.`,
        md`The two $(\beta + 1)$ rules: looking into an emitter, the base side is divided by $\beta + 1$; looking into a base, the emitter side is multiplied by $\beta + 1$.`,
        md`Node $X$ is a divider: the follower is "$v_{in}$ behind $R_{E1}$", loaded by $r_{ds3}\parallel R_{E2}$. Then $Q_2$ turns $v_x$ into a collector current $-g_{m2}v_x$ (its $v_\pi = 0 - v_x$).`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base**, out at the **emitter**, collector on a rail: an **emitter follower**. It copies $v_{in}$ onto $X$ from a small resistance.
        - $Q_2$: base held, in at the **emitter**, out at the **collector**: a **common base**. Its emitter is a small resistance ($\approx1/g_{m2}$) that soaks up the follower's signal as current.
        - $M_3$: gate held, $X$ touches its drain: a current source, $r_{ds3}$ (huge).
        This "follower into common base" is half of a differential pair. Two terminal rules do everything: into an emitter, divide the base side by $\beta + 1$; into a base, multiply the emitter side by $\beta + 1$.

        **(a) $Q_1$'s emitter.** With $v_{in} = 0$ the base has $R_S$ to ground. Push $i_t$ into the emitter: it leaves through the base and collector in the ratio $1 : \beta$, so the base current is $-i_t/(\beta_1 + 1)$ and it flows through $r_{\pi1}$ and $R_S$:
        $$R_{E1} = \frac{R_S + r_{\pi1}}{\beta_1 + 1}\approx\frac{1}{g_{m1}} + \frac{R_S}{\beta_1}$$
        (Lecture 24's emitter-follower $R_{out}$, without the $R_E$.)

        **(b) $Q_2$'s emitter.** Same rule with the base held at ground ($R_B = 0$):
        $$R_{E2} = \frac{r_{\pi2}}{\beta_2 + 1}\approx\frac{1}{g_{m2}}$$

        **(c) Into $Q_1$'s base.** $Q_1$'s emitter load is everything at $X$ other than $Q_1$: $r_{ds3}$ in parallel with $Q_2$'s emitter. Multiply by $\beta_1 + 1$:
        $$R_{in} = r_{\pi1} + (\beta_1 + 1)\Big(r_{ds3}\parallel\frac{r_{\pi2}}{\beta_2 + 1}\Big)\approx r_{\pi1} + \frac{\beta_1}{g_{m2}}$$
        Since $r_{ds3}\gg1/g_{m2}$, the tail barely matters: about $2r_\pi$ when the transistors match.

        **(d) The divider at $X$.** Open-circuited, a follower's output equals its input (no emitter current, no base current, no drop in $R_S$ or $r_{\pi1}$). So $X$ is driven by $v_{in}$ through $R_{E1}$, and loaded by $R_X = r_{ds3}\parallel R_{E2}$:
        $$\frac{v_x}{v_{in}} = \frac{r_{ds3}\parallel R_{E2}}{r_{ds3}\parallel R_{E2} + R_{E1}}\approx\frac{1/g_{m2}}{1/g_{m2} + 1/g_{m1} + R_S/\beta_1}$$

        **(e) Through $Q_2$.** $Q_2$'s base is at ground, so $v_{\pi2} = -v_x$ and its collector current (into the collector) is $g_{m2}v_{\pi2} = -g_{m2}v_x$. That current is drawn through $R_C$, so $v_{out} = -(-g_{m2}v_x)R_C = g_{m2}R_Cv_x$:
        $$A_v = g_{m2}R_C\,\frac{r_{ds3}\parallel R_{E2}}{r_{ds3}\parallel R_{E2} + R_{E1}}$$
        Positive: neither stage inverts. In the $G_MR_{out}$ language, $G_M = -g_{m2}\,v_x/v_{in}$ is negative (a non-inverting stage) and $A_v = -G_MR_{out}$.

        **(f)** Looking into $Q_2$'s collector with $r_{o2} = \infty$: open. So $R_{out} = R_C$.

        **(g) Matched limit.** $R_S = 0$, $r_{ds3}\to\infty$, $g_{m1} = g_{m2} = g_m$: $R_{E1} = R_{E2} = 1/g_m$, so $v_x = v_{in}/2$ and
        $$A_v = +\frac{g_mR_C}{2}$$
        Half the common-emitter gain, without inversion, and (Chapter 12) without a Miller-multiplied $C_\mu$: no capacitor bridges $Q_2$'s input (emitter) and output (collector).

        !!key Pattern
          Two emitters tied together form a divider of two "$1/g_m$" resistances. Each follower output is "input voltage behind $(R_{base} + r_\pi)/(\beta + 1)$"; each common base turns its emitter voltage into $\mp g_mv_e$ at the collector. Write the divider, then multiply.
      `,
    }),
    P({
      id: 'e3pG-3', src: 'Exam 3 practice G · Problem 3 (30 pts)', title: 'What the cascode does to the bandwidth (Lecture 29)', big: true,
      q: md`A MOSFET cascode: $M_1$ (common source) is driven from $v_{in}$ through $R_S = 5\kO$; $M_2$ (gate held) sits on top; the load is $R_L = 5\kO$ with $C_L = 180\,\text{fF}$. Both transistors: $g_m = 4\,\text{mS}$, $r_{ds} = \infty$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 20\,\text{fF}$ (all four drawn).

(a) The DC gain. (b) The resistance seen by $C_{gs2}$. (c) The resistance seen by $C_{gd1}$. (d) The time constant of the output node. (e) $\omega_{-3dB}$ of the cascode by open-circuit time constants. (f) For comparison, $\omega_{-3dB}$ of $M_1$ alone as a common source (no $M_2$: $M_1$'s drain on $R_L$ and $C_L$), by the same method. (g) Why the difference?`,
      fig: G3Fig,
      parts: [
        { lbl: 'A_{v0}', unit: '', ans: -20, traps: [{ v: 20, msg: 'The cascode inverts, like the common source it is built on.' }] },
        { lbl: 'R_{gs2}', unit: 'Ω', ans: 250, traps: [{ v: 5000, msg: 'That is $R_L$. $C_{gs2}$ sits between node $X$ and $M_2$\'s held gate, and $X$ looks into $M_2$\'s source: $1/g_{m2}$ (with $r_{ds} = \\infty$ the drain load does not matter).' }] },
        { lbl: 'R_{gd1}', unit: 'kΩ', ans: 10.25, traps: [
          { v: 110, msg: 'That is the plain common-source value, with $R_{right} = R_L$. In the cascode $C_{gd1}$\'s right end is node $X$: $R_{right} = 1/g_{m2} = 250\\,\\Omega$.' },
          { v: 5.25, msg: 'That is $R_{left} + R_{right}$ only: add $g_{m1}R_{left}R_{right} = (4\\,\\text{m})(5\\,\\text{k})(250) = 5\\,\\text{k}\\Omega$.' }] },
        { lbl: '\\tau_{out}', unit: 'ns', ans: 1, traps: [{ v: 0.9, msg: 'That counts $C_L$ only. $C_{gd2}$ runs from the output to $M_2$\'s held gate, so it is also on the output node.' }] },
        { lbl: '\\omega_{-3dB}\\ \\text{(cascode)}', unit: 'rad/s', ans: 1 / 2.255e-9, accept: [5.82e8] },
        { lbl: '\\omega_{-3dB}\\ \\text{(common source)}', unit: 'rad/s', ans: 1 / 4.1e-9, accept: [2.61e8] },
        { lbl: '(g) The cascode is faster mainly because', mc: [
          '$M_1$\'s drain sees only $1/g_{m2}$, so $M_1$\'s gain to $X$ is about $-1$ and $C_{gd1}$ is barely Miller-multiplied',
          '$M_2$ adds gain, which raises the bandwidth',
          'the cascode has a smaller DC gain',
          'the output node sees a smaller resistance'], a: 0,
          why: [null, 'With $r_{ds} = \\infty$ both circuits have $A_{v0} = -20$; $M_2$ adds output resistance, not speed.', 'Here the DC gains are equal ($-20$): the bandwidth improved at no cost in gain.', 'The output node sees $R_L$ in both circuits; it even has a little more capacitance in the cascode ($C_{gd2}$).'] },
      ],
      hints: [
        md`Place every capacitor with $M_2$'s gate at ground: $C_{gs2}$ is from $X$ to ground, $C_{gd2}$ is from the output to ground, $C_{gs1}$ from the input node to ground, and $C_{gd1}$ **bridges** the input node and $X$.`,
        md`Node $X$: looking up into $M_2$'s source, $1/g_{m2}$ (Lecture 29: $r_{ds1}\parallel\tfrac{1}{g_{m2}}\big(1 + \tfrac{R_L}{r_{ds2}}\big)$, with $r_{ds} = \infty$).`,
        md`Bridge rule for $C_{gd1}$: $R_{left} + R_{right} + g_{m1}R_{left}R_{right}$ with $R_{left} = R_S$ and $R_{right} = R_X$.`,
      ],
      sol: md`
        **Recognize it first.** $M_1$: in at the gate, out at the drain, source grounded: a **common source**. $M_2$: gate held, in at the source, out at the drain: a **common gate**. Stacked, they are a **cascode**. With $r_{ds} = \infty$ the gain is the common source's, $-g_{m1}R_L$. Now the capacitors, with $M_2$'s gate at incremental ground: $C_{gs1}$ hangs on the input node, $C_{gs2}$ on node $X$, $C_{gd2}$ and $C_L$ on the output node, and only $C_{gd1}$ bridges two nodes, the input and $X$. The question is how big $R_X$ is.

        **(a)** $G_M = g_{m1}$ (all of $M_1$'s current goes through $M_2$), $R_{out} = R_L$ (with $r_{ds} = \infty$ the drain of $M_2$ looks infinite):
        $$A_{v0} = -g_{m1}R_L = -(4\,\text{mS})(5\kO) = -20$$

        **(b) $C_{gs2}$, between $X$ and ground.** Open the other capacitors. Looking into $M_2$'s source with its gate held: $1/g_{m2}$. Looking down into $M_1$'s drain: $r_{ds1} = \infty$. So
        $$R_{gs2} = \frac1{g_{m2}} = 250\,\Omega,\qquad\tau_{gs2} = (250)(200\,\text{f}) = 0.05\,\text{ns}$$
        (Lecture 29's general form, $R_{cgs2} = r_{ds1}\parallel\tfrac1{g_{m2}}\big(1 + \tfrac{R_L}{r_{ds2}}\big)$, reduces to this.)

        **(c) $C_{gd1}$, bridging the input node and $X$.** $R_{left} = R_S = 5\kO$ (the gate draws nothing), $R_{right} = R_X = 250\,\Omega$, and $g_{m1}$ between them (Lecture 29: $R_{cgd1} = R_S + R_{cgs2} + g_{m1}R_SR_{cgs2}$):
        $$R_{gd1} = 5\,\text{k} + 0.25\,\text{k} + (4\,\text{m})(5\,\text{k})(250) = 5.25\,\text{k} + 5\,\text{k} = 10.25\kO,\qquad\tau_{gd1} = (10.25\,\text{k})(20\,\text{f}) = 0.205\,\text{ns}$$
        The Miller term $g_{m1}R_SR_X$ is only $5\kO$, because $M_1$'s gain to $X$ is $-g_{m1}R_X = -1$.

        **(d) The output node.** $C_{gd2}$ (to the held gate) and $C_L$ are both from the output to ground, and the node sees $R_L$:
        $$\tau_{out} = R_L(C_{gd2} + C_L) = (5\,\text{k})(200\,\text{f}) = 1\,\text{ns}$$
        And $C_{gs1}$ sees $R_S$: $\tau_{gs1} = (5\,\text{k})(200\,\text{f}) = 1\,\text{ns}$.

        **(e)** $\sum\tau = 1 + 0.205 + 0.05 + 1 = 2.255\,\text{ns}$:
        $$\omega_{-3dB}\approx\frac{1}{2.255\,\text{ns}} = 4.43\times10^8\,\text{rad/s}$$

        **(f) $M_1$ alone.** Now $C_{gd1}$ bridges the gate and the **output**: $R_{gd} = 5\,\text{k} + 5\,\text{k} + (4\,\text{m})(5\,\text{k})(5\,\text{k}) = 110\kO$, $\tau_{gd} = 2.2\,\text{ns}$. With $\tau_{gs} = 1\,\text{ns}$ and $\tau_L = (5\,\text{k})(180\,\text{f}) = 0.9\,\text{ns}$:
        $$\sum\tau = 4.1\,\text{ns},\qquad\omega_{-3dB}\approx2.44\times10^8\,\text{rad/s}$$

        **(g)** Same gain, $1.8\times$ the bandwidth. In the common source $C_{gd1}$ sees $R_S$ multiplied by about $1 + g_mR_L = 21$ (the Miller effect); in the cascode its right end is node $X$, which hardly moves (gain $-1$), so the multiplier drops to about $2$. The cascode trades $C_{gd1}$'s Miller term ($2.2\to0.2\,\text{ns}$) for two small new time constants ($C_{gs2}$, $C_{gd2}$).

        **How good are the estimates?** The exact $-3\,\text{dB}$ frequencies of these circuits are $5.8\times10^8$ (cascode) and $2.6\times10^8$ (common source): the time-constant method is pessimistic, more so for the cascode, whose two largest time constants ($1\,\text{ns}$ each) belong to two different nodes and so to two separate poles. It still ranks the designs correctly and tells you which capacitor to fight.
      `,
    }),
  ];

  // ================================================================== Practice exam H
  const H1Fig = [
    ['rail', [1, -1], { n: 'V_{CC} = 10\\,\\text{V}' }], ['npn', [1, 0], { n: 'Q_1' }],
    ['R', [-1.2, 0], [0, 0], { n: 'R_S', s: kO(10) }], ['w', [-1.2, 0], [-1.7, 0], [-1.7, 0.3]],
    ['Vac', [-1.7, 0.3], [-1.7, 1.3], { n: 'v_{in}', side: 'l' }], ['V', [-1.7, 1.3], [-1.7, 2.3], { n: Vv(3.3), side: 'l' }], ['gnd', [-1.7, 2.3]],
    ['w', [1, 1], [1, 1.4], [2, 1.4]], ['R', [1, 1.4], [1, 2.6], { n: 'R_{E1}', s: kO(2.5), side: 'l' }], ['gnd', [1, 2.6]],
    ['npn', [3, 1.4], { n: 'Q_2' }],
    ['rail', [3, -0.8], { n: 'V_{CC}' }], ['R', [3, -0.8], [3, 0.4], { n: 'R_C', s: kO(5), side: 'l' }],
    ['w', [3, 0.4], [3.8, 0.4]], ['term', [3.8, 0.4], { n: 'v_{out}' }],
    ['R', [3, 2.4], [3, 3.6], { n: 'R_{E2}', s: kO(1.8), side: 'l' }], ['gnd', [3, 3.6]],
    ['w', [3, 2.4], [3.8, 2.4]], ['C', [3.8, 2.4], [3.8, 3.6], { n: 'C_E' }], ['w', [3.8, 3.6], [3, 3.6]],
  ];
  const H2Fig = [
    ['rail', [1, -4.4], { n: 'V_{DD}' }], ['pmos', [1, -3.4], { n: 'M_3' }], ['acg', [0, -3.4]],
    ['pmos', [1, -1.4], { n: 'M_4' }], ['acg', [0, -1.4]],
    ['w', [1, -0.4], [1, 0]], ['w', [1, -0.2], [2.5, -0.2]], ['term', [2.5, -0.2], { n: 'v_{out}' }],
    ['txt', [1.14, -0.56], '$\\uparrow R_{UP}$', { a: 'l', cls: 'small' }], ['txt', [1.14, 0.17], '$\\downarrow R_{DN}$', { a: 'l', cls: 'small' }],
    ['npn', [1, 1], { n: 'Q_1' }], ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]],
    ['R', [-1.2, 1], [0, 1], { n: 'R_B' }], ['w', [-1.2, 1], [-1.6, 1], [-1.6, 1.3]], ['Vac', [-1.6, 1.3], [-1.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.6, 2.3]],
  ];
  const H2up = 'rds3 + rds4 + gm4*rds4*rds3';
  const H2x = '(RE || (rpi1 + RB))';
  const H2dn = `ro1*(1 + beta1*${H2x}/(rpi1 + RB)) + ${H2x}`;
  const H2gm = 'beta1/(RB + rpi1 + (beta1 + 1)*RE)';
  const H2r = { ranges: { RB: [2e4, 1e5], RE: [100, 1000], beta1: [50, 100] } };   // R_B large enough that dropping it is caught
  // A_v: R_UP and R_DN comparable (so dropping either is caught) while g_m r_ds >= 100 (so g_m4 r_ds4 r_ds3 is accepted)
  const H2rA = { ranges: { RB: [2e4, 5e4], RE: [1e3, 5e3], beta1: [50, 100], ro1: [1e6, 3e6], gm4: [2e-3, 4e-3], rds3: [5e4, 8e4], rds4: [5e4, 8e4] } };
  const H3sp = { k: -20, poles: [1e7, 1e9], rhp: [1e10] };
  const H3Sol = B.svg(H3sp, { show: 'both', wmin: 1e6, wmax: 1e12, marks: [{ w: 1e7, n: '\\omega_{p1}' }, { w: 1e9, n: '\\omega_{p2}' }, { w: 1e10, n: '\\omega_z' }] });

  const Hex = [
    intro('H', 'A buffered two-stage amplifier, a collector whose base is not held, and a Bode plot with a right-half-plane zero.'),
    P({
      id: 'e3pH-1', src: 'Exam 3 practice H · Problem 1 (35 pts)', title: 'An emitter follower buffering a common emitter', big: true,
      q: md`$V_{CC} = 10\,\text{V}$, $\beta = 100$ for both transistors, $r_o = \infty$. The source is $v_{in}$ in series with a $3.3\,\text{V}$ DC source and $R_S = 10\kO$, driving $Q_1$'s base. $Q_1$ (collector on $V_{CC}$) has $R_{E1} = 2.5\kO$ from its emitter to ground, and its emitter drives $Q_2$'s base directly. $Q_2$ has $R_{E2} = 1.8\kO$ (bypassed by $C_E$) and $R_C = 5\kO$; the output is $Q_2$'s collector. In the DC analysis use $I_C\approx I_E$, and take $I_{E1}\approx V_{E1}/R_{E1}$ (neglect $Q_2$'s base current next to it), but keep $Q_1$'s base current in $R_S$.

(a) $V_{E1}$. (b) $I_{C1}$, $I_{C2}$ and $V_{C2}$. (c) $g_m$ and $r_\pi$ (equal for both). (d) $R_{in1}$, looking into $Q_1$'s base. (e) $R_{o1}$, looking into $Q_1$'s emitter (with $v_{in} = 0$). (f) $v_{b2}/v_{in}$. (g) $A_v = v_{out}/v_{in}$. (h) $R_{out}$. (i) The gain if the same source drove $Q_2$'s base directly (same bias, no $Q_1$).`,
      fig: H1Fig,
      parts: [
        { lbl: 'V_{E1}', unit: 'V', ans: 2.5, traps: [{ v: 2.6, msg: 'That ignores $Q_1$\'s base current in $R_S$: $I_{B1}R_S = (10\\,\\mu\\text{A})(10\\,\\text{k}\\Omega) = 0.1\\,\\text{V}$.' }] },
        { lbl: 'I_{C1}', unit: 'mA', ans: 1 }, { lbl: 'I_{C2}', unit: 'mA', ans: 1 }, { lbl: 'V_{C2}', unit: 'V', ans: 5 },
        { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 },
        { lbl: 'R_{in1}', unit: 'kΩ', ans: 128.75, accept: [127.5, 129.4], traps: [{ v: 255, msg: 'That loads $Q_1$\'s emitter with $R_{E1}$ alone. $Q_2$\'s base ($r_{\\pi2}$, its emitter is bypassed) is in parallel: $R_{E1}\\parallel r_{\\pi2} = 1.25\\,\\text{k}\\Omega$.' }] },
        { lbl: 'R_{o1}', unit: 'Ω', ans: 123.8, accept: [125] },
        { lbl: 'v_{b2}/v_{in}', unit: '', ans: 0.91 },
        { lbl: 'A_v', unit: '', ans: -182, accept: [-180.3], traps: [
          { v: -200, msg: 'That is $-g_{m2}R_C$, the gain from $Q_2$\'s base. The follower delivers $0.91$ of $v_{in}$ there, not all of it.' },
          { v: -190.6, msg: 'That loads the follower with $R_{E1}$ only. $Q_2$\'s base, $r_{\\pi2} = 2.5\\,\\text{k}\\Omega$, is also on $Q_1$\'s emitter.' }] },
        { lbl: 'R_{out}', unit: 'kΩ', ans: 5 },
        { lbl: 'A_v\\ \\text{(no buffer)}', unit: '', ans: -40, traps: [{ v: -200, msg: 'The base of $Q_2$ is only $r_\\pi = 2.5\\,\\text{k}\\Omega$: a $10\\,\\text{k}\\Omega$ source keeps only $2.5/12.5 = 0.2$ of $v_{in}$.' }] },
      ],
      hints: [
        md`DC: $V_{B1} = 3.3 - I_{B1}R_S$, $V_{E1} = V_{B1} - 0.7$, and $I_{B1} = I_{E1}/\beta = V_{E1}/(\beta R_{E1})$. One equation in $V_{E1}$.`,
        md`$Q_2$'s base is $Q_1$'s emitter: $V_{B2} = V_{E1}$, $V_{E2} = V_{E1} - 0.7$ across $R_{E2}$.`,
        md`Small signal: $Q_1$'s emitter load is $R_{E1}\parallel r_{\pi2}$ ($Q_2$'s emitter is bypassed). The follower is "$v_{in}$ behind $(R_S + r_{\pi1})/(\beta + 1)$".`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base**, out at the **emitter**, collector on $V_{CC}$: an **emitter follower**. Gain about $1$, input resistance about $(\beta + 1)\times$ its emitter load, output resistance about the base-side resistance over $\beta + 1$.
        - $Q_2$: in at the **base**, out at the **collector**, emitter bypassed: a **common emitter**, gain $-g_mR_C$ from its base.
        - Why the follower is there: $Q_2$'s base is only $r_\pi = 2.5\kO$; a $10\kO$ source would lose most of the signal in $R_S$. The follower turns $10\kO$ into about $124\,\Omega$.

        **(a) DC of $Q_1$.** The base current flows from the $3.3\,\text{V}$ source through $R_S$ **into** the base, so $V_{B1} = 3.3 - I_{B1}R_S$, and $V_{E1} = V_{B1} - 0.7$. With $I_{B1} = I_{E1}/\beta = V_{E1}/(\beta R_{E1})$:
        $$V_{E1} = 3.3 - 0.7 - \frac{V_{E1}}{\beta R_{E1}}R_S = 2.6 - V_{E1}\,\frac{10\,\text{k}}{250\,\text{k}}\ \Rightarrow\ V_{E1}(1.04) = 2.6\ \Rightarrow\ V_{E1} = 2.5\,\text{V}$$
        ($V_{B1} = 3.2\,\text{V}$: the base current drops $0.1\,\text{V}$ across $R_S$.)

        **(b)** $I_{C1}\approx I_{E1} = 2.5/2.5\,\text{k} = 1\,\text{mA}$. $Q_2$'s base is $V_{E1} = 2.5\,\text{V}$, so $V_{E2} = 1.8\,\text{V}$ and $I_{C2}\approx1.8/1.8\,\text{k} = 1\,\text{mA}$. $V_{C2} = 10 - (1\,\text{mA})(5\,\text{k}) = 5\,\text{V}$.
        Checks: $V_{C2} = 5 > V_{B2} = 2.5\,\text{V}$ ✓; $V_{C1} = 10 > V_{B1} = 3.2\,\text{V}$ ✓. (The full solve, with every base current: $I_{C1} = 1.00$, $I_{C2} = 0.99\,\text{mA}$.)

        **(c)** $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$ for both.

        **(d) Into $Q_1$'s base.** $Q_1$'s emitter sees $R_{E1}$ to ground **and** $Q_2$'s base, which (emitter bypassed) is $r_{\pi2}$ to ground: $R_{E1}\parallel r_{\pi2} = 2.5\,\text{k}\parallel2.5\,\text{k} = 1.25\kO$. The $(\beta + 1)$ rule:
        $$R_{in1} = r_{\pi1} + (\beta + 1)(R_{E1}\parallel r_{\pi2}) = 2.5\,\text{k} + 101(1.25\,\text{k}) = 128.75\kO$$
        Fifty times $r_{\pi2}$: that is the buffer's job.

        **(e) Into $Q_1$'s emitter.** The base side, $R_S + r_{\pi1}$, divided by $\beta + 1$:
        $$R_{o1} = \frac{R_S + r_{\pi1}}{\beta + 1} = \frac{12.5\,\text{k}}{101} = 123.8\,\Omega$$

        **(f) How much reaches $Q_2$'s base.** Two equivalent pictures. From the emitter: the follower is $v_{in}$ behind $R_{o1}$, loaded by $1.25\kO$:
        $$\frac{v_{b2}}{v_{in}} = \frac{1250}{1250 + 123.8} = 0.91$$
        From the base: $\dfrac{R_{in1}}{R_S + R_{in1}}\cdot\dfrac{(\beta + 1)1.25\,\text{k}}{R_{in1}} = \dfrac{126.25}{138.75} = 0.91$ ✓.

        **(g)** From $Q_2$'s base the common emitter gives $-g_mR_C = -(40\,\text{mS})(5\,\text{k}) = -200$:
        $$A_v = 0.91\times(-200) = -182\qquad(\text{exact bias: }-180)$$

        **(h)** Looking into $Q_2$'s collector ($r_o = \infty$): open. $R_{out} = R_C = 5\kO$.

        **(i) Without the buffer.** The $10\kO$ source drives $r_{\pi2} = 2.5\kO$ directly: $v_b/v_{in} = 2.5/12.5 = 0.2$ and $A_v = 0.2\times(-200) = -40$. The follower raised the gain by $4.5\times$ while having a gain of less than one itself: it is an **impedance** converter, not a voltage amplifier.

        !!key Pattern
          A follower in front of a stage turns a large source resistance $R_S$ into $(R_S + r_\pi)/(\beta + 1)$. Use it when the next stage's input resistance is small compared with $R_S$. Load the follower with everything on its emitter, including the next base.
      `,
    }),
    P({
      id: 'e3pH-2', src: 'Exam 3 practice H · Problem 2 (35 pts)', title: 'A common emitter with $R_B$ and $R_E$ under a cascode load', big: true,
      q: md`$Q_1$ (NPN) is driven by $v_{in}$ through $R_B$ and has $R_E$ from its emitter to ground; its collector is the output. The load is a PMOS cascode: $M_3$ (source on $V_{DD}$) and $M_4$ between $M_3$ and the output, both gates at fixed biases. Keep $r_{o1}$, $r_{ds3}$, $r_{ds4}$. In symbols:

(a) $R_{UP}$, looking up into $M_4$'s drain. (b) $R_{DN}$, looking down into $Q_1$'s collector with $v_{in} = 0$ (so $R_B$ runs from the base to ground: the base is **not** held). (c) $G_M$ of the stage, taking $r_{o1}\to\infty$. (d) $A_v = v_{out}/v_{in}$. (e) The limit of $R_{DN}$ for a very large $R_E$.`,
      fig: H2Fig,
      parts: [
        ex(H2up, ['gm4', 'rds3', 'rds4'], 'R_{UP}'),
        ex(H2dn, ['gm1', 'rpi1', 'beta1', 'ro1', 'RB', 'RE'], 'R_{DN}', H2r),
        ex(H2gm, ['gm1', 'rpi1', 'beta1', 'RB', 'RE'], 'G_M', H2r),
        ex(`-(${H2gm})*((${H2up}) || (${H2dn}))`, ['gm1', 'rpi1', 'beta1', 'ro1', 'RB', 'RE', 'gm4', 'rds3', 'rds4'], 'A_v', H2rA),
        { lbl: '(e) As $R_E\\to\\infty$, $R_{DN}$ approaches', mc: ['$(\\beta_1 + 1)r_{o1} + r_{\\pi1} + R_B$', '$\\infty$: more degeneration always helps', '$g_{m1}R_Er_{o1}$, without limit', '$r_{o1} + R_B$'], a: 0,
          why: [null, 'A MOSFET\'s degenerated drain grows without limit, but a BJT\'s does not: once $R_E$ is large, the test current returns through the base path ($r_{\\pi1} + R_B$) instead.', 'That is the MOSFET intuition ($g_mr_{ds}R_S$). For a BJT the current escapes through the base, which caps the boost at $\\beta$.', 'That forgets the transistor action: the controlled source still multiplies $r_{o1}$ by about $\\beta + 1$.'] },
      ],
      hints: [
        md`(a) $M_4$ has $M_3$'s drain ($r_{ds3}$) in its source: the degenerated drain, $r_{ds} + R_S + g_mr_{ds}R_S$ with $R_S\to r_{ds3}$.`,
        md`(b) Push $i_t$ into the collector. It all leaves the emitter, into $R_E$ in parallel with the base path $r_{\pi1} + R_B$: $v_e = i_tR_x$ with $R_x = R_E\parallel(r_{\pi1} + R_B)$. The base path divides $v_e$: $v_b = v_eR_B/(r_{\pi1} + R_B)$, so $v_\pi = -v_e\,r_{\pi1}/(r_{\pi1} + R_B)$.`,
        md`(c) With $r_{o1}\to\infty$: $i_c = \beta i_b$, and $i_b = v_{in}/\big(R_B + r_{\pi1} + (\beta + 1)R_E\big)$.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base** (through $R_B$), out at the **collector**, $R_E$ in the emitter: a **degenerated common emitter**. Looking down into its collector is a **degenerated collector**, with one new twist: the base is not held at ground but sits on $R_B$.
        - $M_3$, $M_4$: PMOS (sources toward $V_{DD}$), gates held: a **cascode current source**. The output touches $M_4$'s drain.
        - So: $R_{out} = R_{UP}\parallel R_{DN}$, "huge $\parallel$ big", and $A_v = -G_M(R_{UP}\parallel R_{DN})$.

        **(a) The cascode load** (Exam 2): $M_4$ is degenerated by $r_{ds3}$:
        $$R_{UP} = r_{ds3} + r_{ds4} + g_{m4}r_{ds4}r_{ds3}\approx g_{m4}r_{ds4}r_{ds3}$$

        **(b) The collector with $R_B$ and $R_E$.** Set $v_{in} = 0$ and push a test current $i_t$ into the collector. Step by step:
        1. All of $i_t$ leaves through the emitter node (the collector has nowhere else to go). At the emitter it splits between $R_E$ and the base path $r_{\pi1} + R_B$ (to ground through $R_B$). So $v_e = i_tR_x$ with $R_x = R_E\parallel(r_{\pi1} + R_B)$.
        2. The base path is a divider: $v_b = v_e\,\dfrac{R_B}{r_{\pi1} + R_B}$, so $v_\pi = v_b - v_e = -v_e\,\dfrac{r_{\pi1}}{r_{\pi1} + R_B}$.
        3. The current in $r_{o1}$ is $i_t - g_{m1}v_\pi = i_t\Big(1 + g_{m1}R_x\dfrac{r_{\pi1}}{r_{\pi1} + R_B}\Big)$, and $v_c = v_e + r_{o1}(i_t - g_{m1}v_\pi)$.
        Divide by $i_t$ and use $g_{m1}r_{\pi1} = \beta_1$:
        $$R_{DN} = r_{o1}\Big[1 + \frac{\beta_1R_x}{r_{\pi1} + R_B}\Big] + R_x,\qquad R_x = R_E\parallel(r_{\pi1} + R_B)$$
        **Checks.** $R_B = 0$: $\dfrac{\beta_1R_x}{r_{\pi1}} = g_{m1}(R_E\parallel r_{\pi1})$, the formula of practice A ✓. $R_E = 0$: $R_x = 0$, $R_{DN} = r_{o1}$ ✓.

        **(c) $G_M$** ($r_{o1}\to\infty$, output shorted). KVL around the input loop: $v_{in} = i_b(R_B + r_{\pi1}) + (\beta_1 + 1)i_bR_E$, and $i_{out} = \beta_1i_b$:
        $$G_M = \frac{\beta_1}{R_B + r_{\pi1} + (\beta_1 + 1)R_E}\approx\frac{1}{R_E + (R_B + r_{\pi1})/\beta_1}$$
        (Lecture 24's degenerated $G_m$ with the base resistance added: $R_B$ reaches the emitter divided by $\beta$.)

        **(d)**
        $$A_v = -G_M\big(R_{UP}\parallel R_{DN}\big) = -\frac{\beta_1}{R_B + r_{\pi1} + (\beta_1 + 1)R_E}\Big[(r_{ds3} + r_{ds4} + g_{m4}r_{ds4}r_{ds3})\ \Big\|\ R_{DN}\Big]$$
        (Keeping $r_{o1}$ in $G_M$ changes the result by well under $1\%$; I checked it against a full nodal solve.)

        **(e) Very large $R_E$.** Then $R_x\to r_{\pi1} + R_B$ (the base path is all that is left) and
        $$R_{DN}\to r_{o1}(1 + \beta_1) + r_{\pi1} + R_B\approx(\beta_1 + 1)r_{o1}$$
        The BJT's ceiling: the boost factor $1 + \beta R_x/(r_\pi + R_B)$ can never exceed $1 + \beta$, because the signal current escapes through the base. A MOSFET's degenerated drain, $r_{ds}(1 + g_mR_S)$, has no such ceiling. That is why this stage needs the cascode on top **and** cannot match it from below: $R_{DN}\le(\beta + 1)r_{o1}$ while $R_{UP}\approx g_{m4}r_{ds4}r_{ds3}$.

        !!key Pattern
          Looking into a collector: (1) find what the emitter node sees ($R_E$ in parallel with the path back through the base), (2) find how much of $v_e$ appears across $r_\pi$, (3) $R = r_o(1 + g_m\times\text{that resistance}\times\text{that fraction}) + R_x$. With the base held it is $r_o[1 + g_m(R_E\parallel r_\pi)] + R_E\parallel r_\pi$.
      `,
    }),
    P({
      id: 'e3pH-3', src: 'Exam 3 practice H · Problem 3 (30 pts)', title: 'A Bode plot with a right-half-plane zero', big: true,
      q: md`A common-source stage with $g_m = 2\,\text{mS}$ has, from the exact analysis of Lecture 28,
$$H(s) = -20\,\frac{1 - s/10^{10}}{(1 + s/10^7)(1 + s/10^9)}\qquad(\omega\text{ in rad/s})$$
Use straight-line Bode approximations, and take the phase of the negative DC gain as $+180^\circ$.

(a) The DC gain in dB. (b) $|H|$ at $\omega = 10^8$. (c) The unity-gain frequency $\omega_u$. (d) The slope between $10^9$ and $10^{10}$, and (e) above $10^{10}$. (f) The phase at $10^8$, (g) at $10^{10}$, (h) far above $10^{10}$. (i) The zero is at $g_m/C_{gd}$: find $C_{gd}$. (j) The DC gain is $-g_mR_L$: find $R_L$. (k) What a right-half-plane zero does.`,
      parts: [
        { lbl: '|H(0)|', unit: 'dB', ans: 20 * Math.log10(20) },
        { lbl: '|H(j10^8)|', unit: 'dB', ans: 20 * Math.log10(20) - 20, accept: [5.93] },
        { lbl: '\\omega_u', unit: 'rad/s', ans: 2e8, accept: [1.96e8] },
        { lbl: '\\text{slope}\\ (10^9\\text{ to }10^{10})', unit: 'dB/dec', ans: -40 },
        { lbl: '\\text{slope above }10^{10}', unit: 'dB/dec', ans: -20, traps: [{ v: -60, msg: 'A right-half-plane zero still **raises** the magnitude slope by $20\\,\\text{dB/dec}$: $|1 - j\\omega/\\omega_z| = |1 + j\\omega/\\omega_z|$.' }] },
        { lbl: '\\angle H(j10^8)', unit: 'deg', ans: 90, accept: [89.4, -270] },
        { lbl: '\\angle H(j10^{10})', unit: 'deg', ans: -45, accept: [-39.2, 315, 320.8], traps: [{ v: 45, msg: 'That treats the zero as a left-half-plane zero ($+45^\\circ$ at its corner). A right-half-plane zero **subtracts** phase, like a pole.' }] },
        { lbl: '\\angle H\\ (\\omega\\gg10^{10})', unit: 'deg', ans: -90, accept: [270], traps: [{ v: 90, msg: 'That adds $+90^\\circ$ for the zero. $\\angle(1 - j\\omega/\\omega_z)\\to-90^\\circ$: the right-half-plane zero takes $90^\\circ$ away.' }] },
        { lbl: 'C_{gd}', unit: 'fF', ans: 200 },
        { lbl: 'R_L', unit: 'kΩ', ans: 10 },
        { lbl: '(k) A right-half-plane zero', mc: ['raises $|H|$ by $20\\,\\text{dB/dec}$ like an ordinary zero, but takes phase away like a pole', 'lowers $|H|$ like a pole and adds phase like a zero', 'changes only the phase, not the magnitude', 'behaves exactly like a left-half-plane zero'], a: 0,
          why: [null, 'The magnitude of $1 - j\\omega/\\omega_z$ is the same as that of $1 + j\\omega/\\omega_z$: it rises. Only the angle flips sign.', 'Its magnitude rises at $20\\,\\text{dB/dec}$ above $\\omega_z$, exactly like an ordinary zero.', 'The magnitudes are equal but the phases are opposite: $-\\tan^{-1}(\\omega/\\omega_z)$ instead of $+\\tan^{-1}(\\omega/\\omega_z)$.'] },
      ],
      hints: [
        md`Magnitude: $26\,\text{dB}$ flat, $-20\,\text{dB/dec}$ from $10^7$, $-40$ from $10^9$; at $10^{10}$ the zero adds $+20$, whatever its sign.`,
        md`Phase: start at $180^\circ$. Each pole subtracts a $90^\circ$ ramp from a decade below to a decade above its corner. The right-half-plane zero **also subtracts** a $90^\circ$ ramp around $10^{10}$.`,
        md`$\omega_z = g_m/C_{gd}$, so $C_{gd} = g_m/\omega_z$. $|A_{DC}| = g_mR_L$.`,
      ],
      figs: { plot: { svg: H3Sol, cap: 'Solid: straight lines; dashed: exact. Above $10^{10}$ the magnitude turns **up** (from $-40$ to $-20\\,\\text{dB/dec}$) while the phase keeps **falling**, toward $-90^\\circ$: the signature of a right-half-plane zero.' } },
      sol: md`
        **Recognize it first.** Standard form: a DC gain of $-20$ (inverting, $26\,\text{dB}$, phase $180^\circ$), a dominant pole at $10^7$, a second pole at $10^9$, and a zero at $10^{10}$ written $(1 - s/\omega_z)$: a **right-half-plane** zero, the common source's feedforward zero $g_m/C_{gd}$ from Lecture 28. Rule for it: in magnitude it is an ordinary zero; in phase it is a pole.

        **(a)** $20\log_{10}20 = 20(1 + \log_{10}2) = 20 + 6 = 26\,\text{dB}$.

        **(b)** Flat to $10^7$, then $-20\,\text{dB/dec}$: one decade later, $26 - 20 = 6\,\text{dB}$.

        **(c)** $26\,\text{dB}$ at $20\,\text{dB/dec}$ takes $1.3$ decades: $\omega_u = 10^7\times10^{1.3} = 10^7\times20 = 2\times10^8$, below $10^9$ ✓ (one pole: $\omega_u = |A_{DC}|\,\omega_{p1}$). The exact crossing is $1.96\times10^8$.

        **(d)** Between $10^9$ and $10^{10}$ two poles are active: $-40\,\text{dB/dec}$.

        **(e)** Above $10^{10}$: $|1 - j\omega/\omega_z| = \sqrt{1 + (\omega/\omega_z)^2}$, the same as an ordinary zero, so it **adds** $+20$: $-40 + 20 = -20\,\text{dB/dec}$.

        **(f) Phase at $10^8$.** Start at $180^\circ$. Pole at $10^7$: its ramp runs from $10^6$ to $10^8$, so at $10^8$ it is complete, $-90^\circ$. Pole at $10^9$: its ramp starts at $10^8$, nothing yet. Zero at $10^{10}$: nothing yet.
        $$\angle H(j10^8)\approx180^\circ - 90^\circ = 90^\circ\qquad(\text{exact }89.4^\circ)$$

        **(g) Phase at $10^{10}$.** Both poles are complete ($-180^\circ$), and we are at the zero's corner. An ordinary zero would add $+45^\circ$ here. This one has angle $\angle(1 - j) = -45^\circ$:
        $$\angle H(j10^{10})\approx180^\circ - 90^\circ - 90^\circ - 45^\circ = -45^\circ\qquad(\text{exact }-39.2^\circ)$$

        **(h) Far above.** $\angle(1 - j\omega/\omega_z)\to-90^\circ$: $180 - 90 - 90 - 90 = -90^\circ$. With an ordinary zero it would have been $+90^\circ$, a $180^\circ$ difference.

        **(i)** $C_{gd} = \dfrac{g_m}{\omega_z} = \dfrac{2\times10^{-3}}{10^{10}} = 2\times10^{-13}\,\text{F} = 200\,\text{fF}$.

        **(j)** $g_mR_L = 20\Rightarrow R_L = 20/2\,\text{mS} = 10\kO$.

        **(k)** At frequencies near $\omega_z = g_m/C_{gd}$, the current fed forward through $C_{gd}$ (in phase with $v_{in}$) is as big as the transistor's $g_mv_{gs}$ (inverted), and above it the feedforward wins. That is why the zero is in the right half-plane and why it **costs** phase: bad news in feedback amplifiers, where phase margin matters.

        [[fig:plot]]

        !!trap Write the zero's sign into the phase
          Magnitude asymptotes cannot tell $(1 + s/\omega_z)$ from $(1 - s/\omega_z)$. The phase can: $+90^\circ$ in the end for the left-half-plane zero, $-90^\circ$ for the right-half-plane one.
      `,
    }),
  ];

  E3.lesson('e3-pracu', { id: 'e3-pE', title: 'Exam 3 practice exam E', kind: 'mock', sub: 'A divider-biased CE between a source and a load, a BJT–MOSFET cascode, $H(s)$ read off a Bode plot', steps: Eex });
  E3.lesson('e3-pracu', { id: 'e3-pF', title: 'Exam 3 practice exam F', kind: 'mock', sub: 'A PNP common emitter with a partly bypassed $R_E$, collector-to-base feedback through Miller\'s theorem, the bandwidth of a common base', steps: Fex });
  E3.lesson('e3-pracu', { id: 'e3-pG', title: 'Exam 3 practice exam G', kind: 'mock', sub: 'Two capacitor-coupled CE stages on ±5 V, a follower driving a common base, what a cascode does to the bandwidth', steps: Gex });
  E3.lesson('e3-pracu', { id: 'e3-pH', title: 'Exam 3 practice exam H', kind: 'mock', sub: 'An emitter follower buffering a CE, a collector whose base is not held under a cascode load, a Bode plot with a right-half-plane zero', steps: Hex });
})();

/* Exam 3: four practice exams (A, B, C, D) in the Exam 2 format: 60 minutes, three problems, 100 points.
   Problem 1: a BJT DC operating point, then g_m, r_pi and a numeric gain. Problem 2: resistances and gain in symbols,
   mixing BJT and MOSFET building blocks. Problem 3: frequency response (a Bode plot, Miller, open-circuit time
   constants). Every solution opens with "Recognize it first". Every answer was checked against an independent
   solve: the DC points with the constant-V_BE model, resistances and gains with a small-signal nodal solve (hybrid-pi
   with VCCS), bandwidths against the exact -3 dB frequency of the full circuit. Ids start with "e3p". */
(function () {
  'use strict';
  const { R, P } = C;
  const ex = (...a) => E3.ex(...a);
  const kO = (v) => `${v}\\,\\text{k}\\Omega`;
  const Vv = (v) => `${v}\\,\\text{V}`;

  const params = md`**Parameters.** BJT: $V_{BE(on)} = 0.7\,\text{V}$ (for a PNP, $V_{EB(on)} = 0.7\,\text{V}$), $V_{CE(sat)} = 0.2\,\text{V}$, $V_T = 25\,\text{mV}$, so $g_m = I_C/V_T$ and $r_\pi = \beta/g_m$; $\beta$ and $r_o$ as given in each problem. NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. PMOS: $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$. Sign convention (as on Exam 2): $G_M$ is the short-circuit current pulled **down into** the stage per volt of input, and $A_v = -G_MR_{out}$.`;
  const howto = 'Symbolic boxes take expressions like `rpi + (beta + 1)*RE` or `rds3 || (ro2 + RE)`; `||` is "in parallel with". BJT names: `gm1`, `rpi1`, `beta1`, `ro1`. Unless a part asks for the exact form, the $\\beta \\gg 1$ and $g_mr_o \\gg 1$ approximations are accepted wherever they land within 3% of the exact one. Numbers: within 1.5%; arithmetic is allowed in the box (`20*log(8)`, `1/(5e-9)`).';
  const intro = (L, extra) => R(md`
    **Exam 3 practice exam ${L}.** 60 minutes, three problems, 100 points: Problem 1 (35), Problem 2 (35), Problem 3 (30). Same format as Exam 2. Work it on paper first, with a timer, then type your answers. ${extra}

    ${params}

    **Read every solution's first paragraph even when you got the number right.** It is the "recognize it first" step: where the signal goes in, where it comes out, which terminal is common, and so which canonical stage or impedance you are looking at. That is the step to make automatic.

    ${howto}
  `);

  // a straight-line Bode magnitude (dashed) over the exact curve, x = log10(omega)
  const mag = (A, zs, ps) => (x) => {
    const w = Math.pow(10, x);
    let m = Math.abs(A);
    zs.forEach((z) => { m *= Math.hypot(1, w / z); });
    ps.forEach((p) => { m /= Math.hypot(1, w / p); });
    return 20 * Math.log10(m);
  };
  const bode = (o) => Schem.plot({
    w: 440, h: 250, x: o.x, y: o.y, xt: o.xt, yt: o.yt,
    xl: '\\log_{10}\\omega\\;(\\omega\\text{ in rad/s})', yl: '|H|\\ (\\text{dB})',
    curves: [{ f: o.f }, { pts: o.line, cls: 'dash ink' }], pts: o.pts || [],
  });

  // ================================================================== Practice exam A
  const A1Fig = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: kO(4) }],
    ['npn', [1, 0], { n: 'Q_1' }],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: '\\infty' }], ['w', [2.5, -1], [3.1, -1]], ['term', [3.1, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [3.1, -1], [3.1, 0.4], { n: 'R_L', s: kO(4) }], ['gnd', [3.1, 0.4]],
    ['R', [1, 1], [1, 2.2], { n: 'R_{E1}', s: '100\\,\\Omega' }], ['R', [1, 2.2], [1, 3.4], { n: 'R_{E2}', s: kO(2.2), side: 'l' }], ['gnd', [1, 3.4]],
    ['w', [1, 2.2], [2.2, 2.2]], ['C', [2.2, 2.2], [2.2, 3.4], { n: '\\infty' }], ['w', [2.2, 3.4], [1, 3.4]],
    ['w', [0, 0], [-0.6, 0], [-0.6, 0.3]], ['Vac', [-0.6, 0.3], [-0.6, 1.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 1.3], [-0.6, 2.3], { n: Vv(3), side: 'l' }], ['gnd', [-0.6, 2.3]],
  ];
  const A2Fig = [
    ['rail', [1, -3.6], { n: 'V_{DD}' }], ['R', [1, -3.6], [1, -2.4], { n: 'R_S' }],
    ['pmos', [1, -1.4], { n: 'M_2' }], ['acg', [0, -1.4]],
    ['w', [1, -0.4], [1, 0]], ['w', [1, -0.2], [2.5, -0.2]], ['term', [2.5, -0.2], { n: 'v_{out}' }],
    ['txt', [1.14, -0.56], '$\\uparrow R_{UP}$', { a: 'l', cls: 'small' }], ['txt', [1.14, 0.17], '$\\downarrow R_{DN}$', { a: 'l', cls: 'small' }],
    ['npn', [1, 1], { n: 'Q_1' }], ['R', [1, 2], [1, 3.2], { n: 'R_E' }], ['gnd', [1, 3.2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]],
  ];
  const A3 = { f: mag(100, [1e7], [1e3, 1e6]), line: [[2, 40], [3, 40], [6, -20], [7, -60], [8.5, -90]] };
  const A3Plot = bode({ x: [2, 8.5], y: [-90, 50], xt: [2, 3, 4, 5, 6, 7, 8], yt: [-80, -60, -40, -20, 0, 20, 40], f: A3.f, line: A3.line,
    pts: [{ x: 4, y: 20, n: '20\\,\\text{dB}' }, { x: 5, y: 0, n: '\\omega_u' }] });

  const Aex = [
    intro('A', 'No calculator needed: the numbers are chosen to come out by hand.'),
    P({
      id: 'e3pA-1', src: 'Exam 3 practice A · Problem 1 (35 pts)', title: 'Common emitter with a partly bypassed emitter resistor', big: true,
      q: md`$V_{CC} = 10\,\text{V}$, $\beta = 100$, $r_o = \infty$, every capacitor is infinite. The base is driven directly by a $3\,\text{V}$ DC source in series with $v_{in}$. $R_C = R_L = 4\kO$, $R_{E1} = 100\,\Omega$ (not bypassed), $R_{E2} = 2.2\kO$ (bypassed).

(a) Find $I_C$ and $V_C$, and check that $Q_1$ is forward-active. (b) Find $g_m$ and $r_\pi$. (c) Find the resistance looking into the base, $R_{in}$. (d) Find $R_{out}$, looking back into the collector node from $R_L$ (not counting $R_L$). (e) Find $A_v = v_{out}/v_{in}$.`,
      fig: A1Fig,
      parts: [
        { lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'V_C', unit: 'V', ans: 6 },
        { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 },
        { lbl: 'R_{in}', unit: 'kΩ', ans: 12.6 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4 },
        { lbl: 'A_v', unit: '', ans: -16, traps: [
          { v: -32, msg: 'That uses $R_C$ alone. The coupling capacitor puts $R_L$ in parallel with $R_C$ for signals.' },
          { v: -80, msg: 'That forgets the degeneration: $R_{E1}$ is not bypassed, so the emitter is not at ground for signals.' },
          { v: -0.86, msg: 'That puts all $2.3\\,\\text{k}\\Omega$ in the emitter. The capacitor shorts $R_{E2}$ for signals: only $R_{E1}$ degenerates.' }] },
      ],
      hints: [
        md`DC: capacitors are open. The base sits at $3\,\text{V}$, so the emitter sits at $2.3\,\text{V}$, across **both** emitter resistors.`,
        md`Small signal: the bypass capacitor shorts $R_{E2}$, so only $R_{E1}$ is in the emitter. Looking into a base with $R$ under the emitter: $r_\pi + (\beta + 1)R$.`,
        md`Degenerated stage: $G_M = \dfrac{g_m}{1 + g_mR_{E1}}$ (with $\beta \gg 1$). The output node sees $R_C\parallel R_L$.`,
      ],
      sol: md`
        **Recognize it first.** The signal goes in at the **base** and comes out at the **collector**. The emitter is the common terminal, but it reaches ground through $R_{E1}$ (the capacitor shorts $R_{E2}$ for signals). So this is a **common emitter with emitter degeneration** $R_{E1}$. Expect an inverting gain of a little less than $-(R_C\parallel R_L)/R_{E1} = -20$, and a base resistance about $(\beta + 1)R_{E1}$.

        **(a) DC.** Capacitors are open: $R_L$ carries nothing, and both emitter resistors carry the emitter current. The DC source holds the base at $3\,\text{V}$, so
        $$V_E = 3 - 0.7 = 2.3\,\text{V},\qquad I_E = \frac{2.3}{0.1\,\text{k} + 2.2\,\text{k}} = 1\,\text{mA},\qquad I_C = \frac{\beta}{\beta + 1}I_E = 0.99\,\text{mA}\approx1\,\text{mA}$$
        $$V_C = 10 - (4\,\text{k})(1\,\text{mA}) = 6\,\text{V}$$
        Forward-active: $V_C = 6\,\text{V} > V_B = 3\,\text{V}$, so the base-collector junction is reverse-biased ✓ ($V_{CE} = 3.7\,\text{V} > 0.2\,\text{V}$).

        **(b)** $g_m = I_C/V_T = 1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$, $\;r_\pi = \beta/g_m = 100/40\,\text{mS} = 2.5\kO$.

        **(c) Looking into the base.** The emitter sees $R_{E1}$ only ($R_{E2}$ is shorted). The $(\beta + 1)$ rule: everything in the emitter looks $(\beta + 1)$ times bigger from the base:
        $$R_{in} = r_\pi + (\beta + 1)R_{E1} = 2.5\,\text{k} + 101(100) = 12.6\kO$$

        **(d) Looking back into the collector.** Into the collector of a BJT with $r_o = \infty$ you see an open circuit, so only $R_C$ is left (the $10\,\text{V}$ supply is incremental ground): $R_{out} = R_C = 4\kO$.

        **(e) Gain.** Short the output: $i_{out} = g_mv_\pi$, and KVL around base, $r_\pi$ and $R_{E1}$ gives $v_{in} = v_\pi + \big(1 + \tfrac1\beta\big)g_mv_\pi R_{E1}$, so
        $$G_M = \frac{g_m}{1 + g_mR_{E1}(\beta + 1)/\beta}\approx\frac{g_m}{1 + g_mR_{E1}} = \frac{40\,\text{mS}}{1 + 4} = 8\,\text{mS}$$
        The output node sees $R_C\parallel R_L = 2\kO$:
        $$A_v = -G_M(R_C\parallel R_L) = -(8\,\text{mS})(2\kO) = -16$$
        (Keeping $I_C = 0.99\,\text{mA}$ and $\beta + 1$ exactly gives $-15.8$.)

        **Check.** The "$g_mR_E\gg1$" limit is $-(R_C\parallel R_L)/R_{E1} = -20$. Here $g_mR_{E1} = 4$ is not $\gg 1$, so the gain is $4/5$ of that. ✓

        !!trap The three classic slips
        (1) Using $R_C$ instead of $R_C\parallel R_L$: the coupling capacitor puts $R_L$ in parallel for signals ($-32$). (2) Forgetting $R_{E1}$ ($-80$). (3) Putting all $2.3\kO$ in the emitter for signals ($-0.86$): the bypass capacitor shorts $R_{E2}$. DC sees both resistors; signals see only $R_{E1}$.
      `,
    }),
    P({
      id: 'e3pA-2', src: 'Exam 3 practice A · Problem 2 (35 pts)', title: 'A PMOS current source over a degenerated common emitter', big: true,
      q: md`$M_2$ (PMOS) has its gate at a fixed bias and $R_S$ between its source and $V_{DD}$. $Q_1$ (NPN) has $R_E$ in its emitter, and $v_{in}$ drives its base. Keep $r_{ds2}$ and $r_{o1}$ unless a part says otherwise. In symbols:

(a) $R_{UP}$, looking up into the drain of $M_2$. (b) $R_{DN}$, looking down into the collector of $Q_1$ (with $v_{in} = 0$). (c) The resistance looking into the base of $Q_1$, taking $r_{o1}\to\infty$. (d) The transconductance $G_M$ of the stage (you may ignore $r_{o1}$ here). (e) $A_v = v_{out}/v_{in}$.`,
      fig: A2Fig,
      parts: [
        ex('rds2 + RS + gm2*rds2*RS', ['gm2', 'rds2', 'RS'], 'R_{UP}'),
        ex('ro1 + (RE || rpi1)*(1 + gm1*ro1)', ['gm1', 'rpi1', 'ro1', 'RE'], 'R_{DN}', { ranges: { gm1: [20e-3, 80e-3], RE: [200, 2000] } }),
        ex('rpi1 + (beta1 + 1)*RE', ['rpi1', 'beta1', 'RE'], 'R_{in}'),
        ex('gm1/(1 + gm1*RE*(beta1 + 1)/beta1)', ['gm1', 'beta1', 'RE'], 'G_M', { ranges: { gm1: [20e-3, 80e-3], RE: [200, 2000] } }),
        ex('-(gm1/(1 + gm1*RE*(beta1 + 1)/beta1))*((rds2 + RS + gm2*rds2*RS) || (ro1 + (RE || rpi1)*(1 + gm1*ro1)))', ['gm1', 'beta1', 'rpi1', 'ro1', 'RE', 'gm2', 'rds2', 'RS'], 'A_v', { ranges: { gm1: [20e-3, 80e-3], RE: [200, 2000] } }),
      ],
      hints: [
        md`$M_2$: the arrow is on the top lead (PMOS source, toward $V_{DD}$), so the output touches its **drain**, with $R_S$ between its source and its rail. That is the degenerated drain from Exam 2.`,
        md`$Q_1$ with $v_{in} = 0$: base at incremental ground, so $r_{\pi1}$ runs from the emitter to ground, **in parallel with $R_E$**. A test current into the collector leaves through $R_E\parallel r_{\pi1}$.`,
        md`(d): short the output; KVL from the base: $v_{in} = v_\pi + (i_c + i_b)R_E$ with $i_c = g_mv_\pi$, $i_b = i_c/\beta$.`,
      ],
      sol: md`
        **Recognize it first.**
        - $M_2$: PMOS (arrow on the top lead, pointing in: the source is on top, toward $V_{DD}$). The gate is held, the output wire lands on the **drain**, and there is a resistor between the source and its rail. A **degenerated drain**: big.
        - $Q_1$: the signal enters at the **base** and leaves at the **collector**, with $R_E$ in the emitter: a **degenerated common emitter**. With $v_{in} = 0$, looking into its collector is a **degenerated collector**: big.
        - So the output node is "big $\parallel$ big", fed by the stage's $G_M$. High gain.

        **(a) Degenerated MOS drain** (Exam 2, Unit 7):
        $$R_{UP} = r_{ds2} + R_S + g_{m2}r_{ds2}R_S\approx r_{ds2}(1 + g_{m2}R_S)$$

        **(b) Degenerated BJT collector.** Same idea, one twist: with the base at incremental ground, $r_{\pi1}$ goes from the emitter to ground, so the emitter sees $R_E\parallel r_{\pi1}$. Push $i_t$ into the collector; it all leaves through the emitter, so $v_e = i_t(R_E\parallel r_{\pi1})$ and $v_\pi = -v_e$. The current in $r_{o1}$ is $i_t - g_{m1}v_\pi = i_t\big(1 + g_{m1}(R_E\parallel r_{\pi1})\big)$, so
        $$R_{DN} = r_{o1} + (R_E\parallel r_{\pi1})(1 + g_{m1}r_{o1})\approx r_{o1}\big[1 + g_{m1}(R_E\parallel r_{\pi1})\big]$$
        This is the MOS formula with $R_S\to R_E\parallel r_\pi$. It can never exceed about $(\beta + 1)r_o$: once $R_E\gg r_\pi$, $g_m(R_E\parallel r_\pi)\to g_mr_\pi = \beta$. A MOSFET has no such ceiling (no gate current).

        **(c) Looking into the base**, the $(\beta + 1)$ rule:
        $$R_{in} = r_{\pi1} + (\beta_1 + 1)R_E$$

        **(d) $G_M$.** Short the output, ignore $r_{o1}$: $i_{out} = g_{m1}v_\pi$, and $v_{in} = v_\pi + \big(1 + \tfrac1{\beta_1}\big)g_{m1}v_\pi R_E$. So
        $$G_M = \frac{g_{m1}}{1 + g_{m1}R_E(\beta_1 + 1)/\beta_1}\approx\frac{g_{m1}}{1 + g_{m1}R_E}$$

        **(e) Gain.**
        $$A_v = -G_M\,(R_{UP}\parallel R_{DN}) \approx -\frac{g_{m1}}{1 + g_{m1}R_E}\Big[r_{ds2}(1 + g_{m2}R_S)\ \Big\|\ r_{o1}\big(1 + g_{m1}(R_E\parallel r_{\pi1})\big)\Big]$$

        !!key Pattern
        A current-source-loaded stage is always the same three steps: find what you see looking **up**, what you see looking **down** (each with the terminal rules), put them in parallel, multiply by $-G_M$. The only BJT twists: $r_\pi$ appears from the emitter to the held base, and resistances jump by $(\beta + 1)$ through the base.
      `,
    }),
    P({
      id: 'e3pA-3', src: 'Exam 3 practice A · Problem 3 (30 pts)', title: 'Reading a transfer function as a Bode plot', big: true,
      q: md`An amplifier has
$$H(s) = \frac{-100\,(1 + s/10^7)}{(1 + s/10^3)(1 + s/10^6)}\qquad(\omega\text{ in rad/s})$$
Use straight-line (asymptotic) Bode approximations. (a) The DC gain in dB. (b) $|H|$ in dB at $\omega = 10^4$. (c) The unity-gain frequency $\omega_u$, where the straight-line $|H|$ crosses $0\,\text{dB}$. (d) The slope between $\omega = 10^6$ and $10^7$. (e) The slope above $10^7$. (f) The phase at $\omega = 10^5$, taking the phase of a negative DC gain as $+180^\circ$.`,
      parts: [
        { lbl: '|H(0)|', unit: 'dB', ans: 40 }, { lbl: '|H(j10^4)|', unit: 'dB', ans: 20 },
        { lbl: '\\omega_u', unit: 'rad/s', ans: 1e5 },
        { lbl: '\\text{slope}\\ (10^6\\text{ to }10^7)', unit: 'dB/dec', ans: -40 },
        { lbl: '\\text{slope above }10^7', unit: 'dB/dec', ans: -20 },
        { lbl: '\\angle H(j10^5)', unit: 'deg', ans: 90, accept: [85.4, -270, -274.6] },
      ],
      hints: [
        md`Read $H(s)$ as a recipe: the constant gives the starting level ($20\log_{10}|{-100}|$) and the starting phase ($180^\circ$ for a negative number). Each pole bends the line down by $20\,\text{dB/dec}$, each zero bends it up by $20\,\text{dB/dec}$.`,
        md`List the corners in order: $10^3$ (pole), $10^6$ (pole), $10^7$ (zero). The slope is $0$, then $-20$, then $-40$, then $-20$.`,
        md`Phase: a pole costs $-45^\circ$ per decade from $\omega_p/10$ to $10\,\omega_p$ (so $-90^\circ$ in total). At $10^5$, which corners have finished, and which have not started?`,
      ],
      figs: { plot: { svg: A3Plot, cap: 'Dashed: the straight-line magnitude. Solid: the exact $|H(j\\omega)|$. The two differ by $3\\,\\text{dB}$ right at each corner and agree away from them.' } },
      sol: md`
        **Recognize it first.** This is already in the standard Bode form $A_{DC}\,\dfrac{(1 + s/\omega_z)}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})}$. Read off: $A_{DC} = -100$ (an inverting amplifier: $40\,\text{dB}$, phase $180^\circ$), poles at $10^3$ and $10^6$, a zero at $10^7$. Then just walk along the frequency axis, changing slope at each corner.

        **(a)** $20\log_{10}100 = 40\,\text{dB}$. The minus sign does not change the magnitude; it only sets the phase.

        **(b)** Flat until the first pole at $10^3$, then $-20\,\text{dB/dec}$. One decade later, at $10^4$: $40 - 20 = 20\,\text{dB}$.

        **(c)** Keep falling at $20\,\text{dB/dec}$: $0\,\text{dB}$ two decades after $10^3$, so $\omega_u = 10^5\,\text{rad/s}$ (before the second pole, so the slope is still $-20$). The exact $|H(j10^5)| = 0.995$: the straight line is excellent here, because $10^5$ is a decade or more from every corner.

        **(d)** Between $10^6$ and $10^7$ both poles are active: $-40\,\text{dB/dec}$. (The line goes from $-20\,\text{dB}$ at $10^6$ to $-60\,\text{dB}$ at $10^7$.)

        **(e)** Above $10^7$ the zero cancels one pole: $-40 + 20 = -20\,\text{dB/dec}$.

        [[fig:plot]]

        **(f) Phase at $10^5$.** Start at $+180^\circ$.
        - Pole at $10^3$: its phase moves from $10^2$ to $10^4$; by $10^5$ it is finished: $-90^\circ$.
        - Pole at $10^6$: it starts moving at $10^6/10 = 10^5$: nothing yet, $0^\circ$.
        - Zero at $10^7$: starts at $10^6$: $0^\circ$.

        $$\angle H(j10^5)\approx180^\circ - 90^\circ = 90^\circ$$
        Exact: $180^\circ - \tan^{-1}100 - \tan^{-1}0.1 + \tan^{-1}0.01 = 85.4^\circ$. The $5^\circ$ difference is the second pole's $\tan^{-1}(0.1) = 5.7^\circ$, which the straight line rounds to zero.

        !!key Pattern
        Magnitude: start at $20\log|A_{DC}|$, slope changes by $\mp20\,\text{dB/dec}$ at each pole/zero. Phase: each pole is a ramp of $-45^\circ$/decade spanning two decades centred on it; each zero is the same ramp upward. A negative $A_{DC}$ adds $180^\circ$ and nothing else.
      `,
    }),
  ];

  // ================================================================== Practice exam B
  const B1Fig = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_E', s: kO(4.9) }],
    ['pnp', [1, 0], { n: 'Q_1' }], ['gnd', [1, 1]],
    ['w', [1, -1], [1.7, -1]], ['C', [1.7, -1], [2.5, -1], { n: '\\infty' }], ['w', [2.5, -1], [3.1, -1]], ['term', [3.1, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [3.1, -1], [3.1, 0.4], { n: 'R_L', s: kO(1) }], ['gnd', [3.1, 0.4]],
    ['R', [-1.2, 0], [0, 0], { n: 'R_B', s: kO(10) }], ['w', [-1.2, 0], [-1.7, 0], [-1.7, 0.3]],
    ['Vac', [-1.7, 0.3], [-1.7, 1.3], { n: 'v_{in}', side: 'l' }], ['V', [-1.7, 1.3], [-1.7, 2.3], { n: Vv(4.3), side: 'l' }], ['gnd', [-1.7, 2.3]],
  ];
  const B2Fig = [
    ['rail', [0, -1], { n: 'V_{DD}' }], ['nmos', [0, 0], { n: 'M_1' }],
    ['w', [-1, 0], [-1.5, 0], [-1.5, 0.3]], ['Vac', [-1.5, 0.3], [-1.5, 1.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.5, 1.3]],
    ['w', [0, 1], [0, 1.6], [1, 1.6]], ['node', [0, 1.6], { n: 'X', side: 'l' }],
    ['I', [0, 1.6], [0, 2.9], { n: 'I_B', side: 'l' }], ['gnd', [0, 2.9]],
    ['npn', [2, 1.6], { n: 'Q_2' }], ['R', [2, 2.6], [2, 3.8], { n: 'R_E' }], ['gnd', [2, 3.8]],
    ['pmos', [2, -0.4], { n: 'M_3' }], ['acg', [1, -0.4]], ['rail', [2, -1.4], { n: 'V_{DD}' }],
    ['w', [2, 0.6], [2.9, 0.6]], ['term', [2.9, 0.6], { n: 'v_{out}' }],
  ];
  const B3Fig = [
    ['rail', [2, -1.2], { n: 'V_{DD}' }], ['R', [2, -1.2], [2, 0], { n: 'R_L' }],
    ['nmos', [2, 1], { n: 'M_1' }], ['gnd', [2, 2]],
    ['Vac', [-1, 1], [-1, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [-1, 2]],
    ['R', [-1, 1], [0.3, 1], { n: 'R_S' }], ['w', [0.3, 1], [1, 1]],
    ['C', [0.3, 1], [0.3, 2], { n: 'C_{gs}', side: 'l' }], ['gnd', [0.3, 2]],
    ['w', [0.7, 1], [0.7, 0]], ['C', [0.7, 0], [1.6, 0], { n: 'C_{gd}' }], ['w', [1.6, 0], [2, 0]],
    ['w', [2, 0], [3.4, 0]], ['C', [2.8, 0], [2.8, 1.2], { n: 'C_L' }], ['gnd', [2.8, 1.2]], ['term', [3.4, 0], { n: 'v_{out}' }],
  ];
  const B2Rb = '(rpi2 + (beta2 + 1)*RE)';
  const B2Rout = 'rds3 || (ro2 + (RE || rpi2)*(1 + gm2*ro2))';

  const Bex = [
    intro('B', 'A PNP, a MOSFET driving a BJT, and the classic Miller problem.'),
    P({
      id: 'e3pB-1', src: 'Exam 3 practice B · Problem 1 (35 pts)', title: 'A PNP emitter follower', big: true,
      q: md`$V_{CC} = 10\,\text{V}$, $\beta = 100$ (you may use $\beta + 1\approx\beta$ in the DC analysis), $r_o = \infty$, capacitors infinite. The PNP's base is driven by $V_{BB} = 4.3\,\text{V}$ in series with $v_{in}$ through $R_B = 10\kO$. $R_E = 4.9\kO$ runs from the emitter up to $V_{CC}$, the collector is grounded, and the output is taken at the emitter, coupled to $R_L = 1\kO$.

(a) Find $I_C$ and $V_E$, and check forward-active. (b) $g_m$ and $r_\pi$. (c) $R_{in}$, looking into the base (not counting $R_B$). (d) $R_{out}$, looking back into the emitter node from $R_L$ (not counting $R_L$). (e) $A_v = v_{out}/v_{in}$.`,
      fig: B1Fig,
      parts: [
        { lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'V_E', unit: 'V', ans: 5.1 },
        { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 },
        { lbl: 'R_{in}', unit: 'kΩ', ans: 86.4, accept: [85.6] }, { lbl: 'R_{out}', unit: 'Ω', ans: 121 },
        { lbl: 'A_v', unit: '', ans: 0.870, accept: [0.870], traps: [
          { v: 0.973, msg: 'Too close to 1. Keep $R_B$ in the base lead (at the emitter it shows up as $R_B/(\\beta + 1)$, because the base draws current) and keep $R_L$ in parallel with $R_E$ (the coupling capacitor connects it for signals).' }] },
      ],
      hints: [
        md`PNP DC: the emitter is $0.7\,\text{V}$ **above** the base, and the base current flows **out** of the base, through $R_B$, into the $4.3\,\text{V}$ source: $V_B = 4.3 + I_BR_B$.`,
        md`Write KVL from $V_{CC}$: $10 = I_ER_E + 0.7 + I_BR_B + 4.3$ with $I_B = I_E/(\beta + 1)$.`,
        md`Follower: from the base, the emitter load looks $(\beta + 1)$ times bigger; from the emitter, the base-side resistance $R_B + r_\pi$ looks $(\beta + 1)$ times smaller.`,
      ],
      sol: md`
        **Recognize it first.** A PNP, drawn the way a PMOS is: emitter on top (arrow pointing in), tied toward $V_{CC}$ through $R_E$; collector at the bottom, on ground. The signal enters at the **base** and leaves at the **emitter**; the collector sits on a rail. Collector common: an **emitter follower**. Expect a gain just under $1$, a big input resistance (the emitter load times $\beta + 1$), and a small output resistance (the base-side resistance divided by $\beta + 1$). PNP or NPN makes no difference to the small-signal model.

        **(a) DC.** For a PNP, $I_B$ flows out of the base through $R_B$ into the source, so $V_B = 4.3 + I_BR_B$, and the emitter is $0.7\,\text{V}$ above the base. KVL from $V_{CC}$ down to the source:
        $$10 = I_ER_E + 0.7 + I_BR_B + 4.3\ \Rightarrow\ 5 = I_E\Big(4.9\,\text{k} + \frac{10\,\text{k}}{\beta + 1}\Big)\approx I_E(4.9\,\text{k} + 0.1\,\text{k})$$
        $I_E = 1\,\text{mA}$, $I_C\approx1\,\text{mA}$. $V_E = 10 - 4.9 = 5.1\,\text{V}$, $V_B = 4.4\,\text{V}$. Forward-active: $V_C = 0 < V_B$, so the collector-base junction is reverse-biased ✓, and $V_{EC} = 5.1\,\text{V} > 0.2\,\text{V}$ ✓.

        **(b)** $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$.

        **(c) Looking into the base.** For signals $V_{CC}$ is ground, so $R_E$ goes to ground, and the coupling capacitor puts $R_L$ in parallel: the emitter load is $R_E\parallel R_L = 4.9\,\text{k}\parallel1\,\text{k} = 830\,\Omega$. The $(\beta + 1)$ rule:
        $$R_{in} = r_\pi + (\beta + 1)(R_E\parallel R_L) = 2.5\,\text{k} + 101(830) = 86.4\kO$$

        **(d) Looking into the emitter.** The base side is $R_B + r_\pi$, divided by $\beta + 1$:
        $$R_e = \frac{R_B + r_\pi}{\beta + 1} = \frac{12.5\,\text{k}}{101} = 124\,\Omega,\qquad R_{out} = R_E\parallel R_e = 4.9\,\text{k}\parallel124 = 121\,\Omega$$

        **(e) Gain.** Seen from the load, the follower is $v_{in}$ (its open-circuit output: no emitter current, no base current, so $v_e = v_{in}$) behind $R_e$. A divider:
        $$A_v = \frac{R_E\parallel R_L}{(R_E\parallel R_L) + R_e} = \frac{830}{830 + 124} = 0.870$$
        **Second way, same answer.** Input divider $v_b/v_{in} = \dfrac{R_{in}}{R_{in} + R_B} = \dfrac{86.4}{96.4} = 0.896$; base to emitter $\dfrac{(\beta + 1)830}{r_\pi + (\beta + 1)830} = 0.971$; product $0.870$ ✓.

        !!key MOS vs BJT follower
        A source follower's gate draws nothing, so $R_B$ would not matter and $R_{in} = \infty$. A BJT follower's base draws $i_e/(\beta + 1)$: $R_B$ shows up in $R_{out}$ (divided by $\beta + 1$) and in the gain.
      `,
    }),
    P({
      id: 'e3pB-2', src: 'Exam 3 practice B · Problem 2 (35 pts)', title: 'A source follower driving a degenerated common emitter', big: true,
      q: md`$M_1$ (NMOS) has its drain on $V_{DD}$ and its source at node $X$, biased by an ideal current source $I_B$; take $r_{ds1}\to\infty$. $X$ drives the base of $Q_2$ (NPN), which has $R_E$ in its emitter. $Q_2$'s collector is the output, loaded by $M_3$ (PMOS, gate at a fixed bias, source on $V_{DD}$). In symbols:

(a) $R_{B2}$, looking into the base of $Q_2$ (take $r_{o2}\to\infty$). (b) The resistance looking into the source of $M_1$ with its gate held. (c) $A_{v1} = v_x/v_{in}$. (d) $R_{out}$ at the output with $v_{in} = 0$ (treat $Q_2$'s base as incremental ground: $M_1$ holds it through only $1/g_{m1}$). (e) The overall $A_v = v_{out}/v_{in}$ (ignore $r_{o2}$ in $Q_2$'s $G_M$).`,
      fig: B2Fig,
      parts: [
        ex('rpi2 + (beta2 + 1)*RE', ['rpi2', 'beta2', 'RE'], 'R_{B2}'),
        ex('1/gm1', ['gm1'], 'R_{S1}', { ranges: { gm1: [2e-3, 5e-3] } }),
        ex(`gm1*${B2Rb}/(1 + gm1*${B2Rb})`, ['gm1', 'rpi2', 'beta2', 'RE'], 'A_{v1}', { ranges: { gm1: [1e-3, 2e-3], RE: [50, 100], beta2: [50, 100], rpi2: [1e3, 5e3] } }),
        ex(B2Rout, ['rds3', 'ro2', 'RE', 'rpi2', 'gm2'], 'R_{out}', { ranges: { gm2: [20e-3, 80e-3], RE: [200, 2000] } }),
        ex(`-(gm1*${B2Rb}/(1 + gm1*${B2Rb}))*(gm2/(1 + gm2*RE*(beta2 + 1)/beta2))*(${B2Rout})`, ['gm1', 'gm2', 'beta2', 'rpi2', 'ro2', 'RE', 'rds3'], 'A_v', { ranges: { gm1: [1e-3, 2e-3], gm2: [20e-3, 80e-3], RE: [50, 100], beta2: [50, 100] } }),
      ],
      hints: [
        md`$M_1$: in at the gate, out at the source, drain on a rail: a source follower. Its output resistance is what you see looking into a source with the gate held.`,
        md`A follower driving a load $R$ from $1/g_m$ is a divider: $A = \dfrac{R}{R + 1/g_m}$. Here $R$ is $Q_2$'s base resistance, which is **finite** (a MOSFET gate would be infinite).`,
        md`The output node: looking up into $M_3$'s drain (gate held, source on its rail) is $r_{ds3}$; looking down into $Q_2$'s collector is a degenerated collector, with $R_E\parallel r_{\pi2}$ in the emitter.`,
      ],
      sol: md`
        **Recognize it first.**
        - $M_1$: in at the **gate**, out at the **source**, drain on $V_{DD}$: a **source follower**. Its job is to drive $Q_2$'s base from a small resistance, $1/g_{m1}$.
        - $Q_2$: in at the **base**, out at the **collector**, $R_E$ in the emitter: a **degenerated common emitter**.
        - $M_3$: PMOS, gate held, source on its rail; the output touches its **drain**: $r_{ds3}$, big.
        - $I_B$: an ideal current source is an open circuit for signals.

        **(a)** The $(\beta + 1)$ rule: $R_{B2} = r_{\pi2} + (\beta_2 + 1)R_E$.

        **(b)** Looking into a source with the gate held and the drain on a rail: $R_{S1} = \dfrac{1}{g_{m1}}$ (in parallel with $r_{ds1} = \infty$).

        **(c)** The follower is $v_{in}$ behind $1/g_{m1}$, loaded by $R_{B2}$:
        $$A_{v1} = \frac{R_{B2}}{R_{B2} + 1/g_{m1}} = \frac{g_{m1}R_{B2}}{1 + g_{m1}R_{B2}},\qquad R_{B2} = r_{\pi2} + (\beta_2 + 1)R_E$$
        Close to $1$, but not $1$: a BJT base is a finite load. If $Q_2$ were a MOSFET, $A_{v1}$ would be exactly $1$.

        **(d) Output node.** Up: $R_{UP} = r_{ds3}$. Down: $Q_2$'s collector with the base held, so $r_{\pi2}$ sits from emitter to ground, in parallel with $R_E$:
        $$R_{DN} = r_{o2} + (R_E\parallel r_{\pi2})(1 + g_{m2}r_{o2}),\qquad R_{out} = r_{ds3}\parallel R_{DN}$$
        ($R_{DN}$ is the bigger one, so $R_{out}$ is a bit below $r_{ds3}$.)

        **(e)** $Q_2$'s gain from its own base: $G_{M2} = \dfrac{g_{m2}}{1 + g_{m2}R_E(\beta_2 + 1)/\beta_2}\approx\dfrac{g_{m2}}{1 + g_{m2}R_E}$, so $v_{out}/v_x = -G_{M2}R_{out}$. Chain them:
        $$A_v = A_{v1}\cdot\big(-G_{M2}R_{out}\big) = -\frac{g_{m1}R_{B2}}{1 + g_{m1}R_{B2}}\cdot\frac{g_{m2}}{1 + g_{m2}R_E}\cdot\Big(r_{ds3}\parallel\big[r_{o2} + (R_E\parallel r_{\pi2})(1 + g_{m2}r_{o2})\big]\Big)$$
        Multiplying is legal because $A_{v1}$ already includes the loading by $Q_2$'s base, and $Q_2$'s gain from its base voltage does not depend on what drives it.

        !!key Pattern
        In a chain, every stage's gain is computed **with the next stage's input resistance as its load**. With MOSFETs that load was a gate ($\infty$) and you could forget it. With BJTs it is $r_\pi + (\beta + 1)R_E$: always check it.
      `,
    }),
    P({
      id: 'e3pB-3', src: 'Exam 3 practice B · Problem 3 (30 pts)', title: 'Common source: Miller, a pole per node, and time constants', big: true,
      q: md`A common-source stage is driven from $R_S = 10\kO$. $g_m = 2\,\text{mS}$; the total drain load is $R_L = 10\kO$ (this already includes $r_{ds}$). $C_{gs} = 100\,\text{fF}$, $C_{gd} = 10\,\text{fF}$, $C_L = 180\,\text{fF}$.

(a) The DC gain. (b) Using Miller's theorem, the capacitance $C_{in}$ seen at the gate. (c) The input pole $\omega_{p,in}$ (Miller). (d) The zero. (e) By open-circuit time constants: the resistance seen by $C_{gd}$. (f) The $-3\,\text{dB}$ bandwidth estimate $\omega_{-3dB}$. (g) Which time constant is the largest?`,
      fig: B3Fig,
      parts: [
        { lbl: 'A_{v0}', unit: '', ans: -20 }, { lbl: 'C_{in}', unit: 'fF', ans: 310 },
        { lbl: '\\omega_{p,in}', unit: 'rad/s', ans: 1 / (10e3 * 310e-15) },
        { lbl: '\\omega_z', unit: 'rad/s', ans: 2e11 },
        { lbl: 'R_{gd}', unit: 'kΩ', ans: 220, traps: [{ v: 20, msg: 'That is $R_S + R_L$: it misses the $g_mR_SR_L$ term, the current the transistor pushes through the output while you test $C_{gd}$.' }] },
        { lbl: '\\omega_{-3dB}', unit: 'rad/s', ans: 2e8, accept: [2.18e8] },
        { lbl: '(g) The largest open-circuit time constant belongs to', mc: ['$C_{gd}$, the smallest capacitor', '$C_{gs}$', '$C_L$, the biggest capacitor', 'They are all equal'], a: 0,
          why: [null, '$R_SC_{gs} = 1\\,\\text{ns}$.', '$R_LC_L = 1.8\\,\\text{ns}$: big capacitor, but it only sees $R_L$.', 'Compute each: $1$, $2.2$ and $1.8\\,\\text{ns}$.'] },
      ],
      hints: [
        md`$C_{gd}$ connects the input and the output of an inverting gain $-A$. Miller: at the input it looks like $(1 + A)C_{gd}$ to ground.`,
        md`OCTC: open every other capacitor, put a test source across the one you want, find the resistance. A capacitor between two nodes with transconductance $g_m$ between them sees $R_{left} + R_{right} + g_mR_{left}R_{right}$.`,
        md`$\omega_{-3dB}\approx\dfrac{1}{\sum_j R_{jo}C_j}$.`,
      ],
      sol: md`
        **Recognize it first.** In at the **gate** (through $R_S$), out at the **drain**, source grounded: a **common source**, DC gain $-g_mR_L$. Now place each capacitor: $C_{gs}$ hangs from the input node to ground (the source is grounded). $C_L$ hangs from the output node to ground. $C_{gd}$ **bridges** the input and the output of an inverting gain of $20$: that is the Miller capacitor, and the one to watch.

        **(a)** $A_{v0} = -g_mR_L = -(2\,\text{mS})(10\kO) = -20$.

        **(b) Miller.** A capacitor across a gain of $-A$ looks like $(1 + A)C$ at the input:
        $$C_{in} = C_{gs} + (1 + g_mR_L)C_{gd} = 100 + 21(10) = 310\,\text{fF}$$

        **(c)** One pole per node, $1/(RC)$: the gate node sees $R_S$ and $C_{in}$:
        $$\omega_{p,in} = \frac{1}{R_SC_{in}} = \frac{1}{(10\,\text{k})(310\,\text{f})} = \frac{1}{3.1\,\text{ns}} = 3.23\times10^8\,\text{rad/s}$$
        The output node (Miller): $C_{out} = C_L + (1 + \tfrac1{g_mR_L})C_{gd} = 190.5\,\text{fF}$, $\omega_{p,out} = 1/(10\,\text{k}\cdot190.5\,\text{f}) = 5.25\times10^8\,\text{rad/s}$.

        **(d)** The zero: $\omega_z = g_m/C_{gd} = 2\,\text{m}/10\,\text{f} = 2\times10^{11}\,\text{rad/s}$, in the right half-plane (at that frequency the current fed forward through $C_{gd}$ cancels $g_mv_{gs}$). Three decades above the poles: ignore it for the bandwidth.

        **(e) Open-circuit time constants.**
        - $C_{gs}$: with $C_{gd}$ and $C_L$ open, its terminals see $R_S$. $\tau_{gs} = (10\,\text{k})(100\,\text{f}) = 1\,\text{ns}$.
        - $C_{gd}$: left node $R_{left} = R_S$, right node $R_{right} = R_L$, transconductance $g_m$ between them:
        $$R_{gd} = R_S + R_L + g_mR_SR_L = 10\,\text{k} + 10\,\text{k} + (2\,\text{m})(10\,\text{k})(10\,\text{k}) = 220\kO$$
        $\tau_{gd} = (220\,\text{k})(10\,\text{f}) = 2.2\,\text{ns}$.
        - $C_L$: sees $R_L$. $\tau_L = (10\,\text{k})(180\,\text{f}) = 1.8\,\text{ns}$.

        **(f)** $\sum\tau = 1 + 2.2 + 1.8 = 5\,\text{ns}$:
        $$\omega_{-3dB}\approx\frac{1}{5\,\text{ns}} = 2\times10^8\,\text{rad/s}\quad(f\approx31.8\,\text{MHz})$$
        The exact $-3\,\text{dB}$ frequency of this circuit is $2.18\times10^8\,\text{rad/s}$: the estimate is a little pessimistic, as it always is. (The sum of time constants is exactly the $s$-coefficient $b$ of the denominator in Lecture 28, which is why it works.) Note that the Miller input pole alone ($3.2\times10^8$) is too optimistic: it ignores the output node.

        **(g)** $C_{gd}$: the smallest capacitor has the largest time constant, because the gain multiplies the resistance it sees by about $1 + g_mR_L$.
      `,
    }),
  ];

  // ================================================================== Practice exam C
  const C1Fig = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_C', s: kO(5) }],
    ['npn', [1, 0], { n: 'Q_1' }], ['w', [1, -1], [1.9, -1]], ['term', [1.9, -1], { n: 'v_{out}' }],
    ['w', [0, 0], [-0.5, 0], [-0.5, 0.3]], ['V', [-0.5, 0.3], [-0.5, 1.3], { n: Vv(2.7), side: 'l' }], ['gnd', [-0.5, 1.3]],
    ['R', [1, 1], [1, 2.2], { n: 'R_E', s: kO(2), side: 'l' }], ['gnd', [1, 2.2]],
    ['w', [1, 1], [1.7, 1]], ['C', [1.7, 1], [2.5, 1], { n: '\\infty' }], ['R', [2.5, 1], [3.7, 1], { n: 'R_S', s: '50\\,\\Omega' }],
    ['Vac', [3.7, 1], [3.7, 2.2], { n: 'v_{in}', side: 'r' }], ['gnd', [3.7, 2.2]],
  ];
  const C2Fig = [
    ['rail', [1, -2], { n: 'V_{CC}' }], ['pnp', [1, -1], { n: 'Q_3' }], ['acg', [0, -1]],
    ['w', [1, 0], [2, 0]], ['term', [2, 0], { n: 'v_{out}' }],
    ['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]],
    ['node', [1, 2], { n: 'X', side: 'r' }],
    ['npn', [1, 3], { n: 'Q_1' }], ['gnd', [1, 4]],
    ['w', [0, 3], [-0.6, 3], [-0.6, 3.3]], ['Vac', [-0.6, 3.3], [-0.6, 4.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 4.3]],
  ];
  const C3Fig = [
    ['rail', [2, -1.2], { n: 'V_{CC}' }], ['R', [2, -1.2], [2, 0], { n: 'R_L' }],
    ['npn', [2, 1], { n: 'Q_1' }], ['gnd', [2, 2]],
    ['Vac', [-1, 1], [-1, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [-1, 2]],
    ['R', [-1, 1], [0.3, 1], { n: 'R_S' }], ['w', [0.3, 1], [1, 1]],
    ['C', [0.3, 1], [0.3, 2], { n: 'C_\\pi', side: 'l' }], ['gnd', [0.3, 2]],
    ['w', [0.7, 1], [0.7, 0]], ['C', [0.7, 0], [1.6, 0], { n: 'C_\\mu' }], ['w', [1.6, 0], [2, 0]],
    ['w', [2, 0], [3.4, 0]], ['C', [2.8, 0], [2.8, 1.2], { n: 'C_L' }], ['gnd', [2.8, 1.2]], ['term', [3.4, 0], { n: 'v_{out}' }],
  ];
  const C2Rdn = 'ro2 + (ro1 || rpi2)*(1 + gm2*ro2)';

  const Cex = [
    intro('C', 'A common base, a BJT cascode, and the bandwidth of a common emitter.'),
    P({
      id: 'e3pC-1', src: 'Exam 3 practice C · Problem 1 (35 pts)', title: 'A common-base amplifier', big: true,
      q: md`$V_{CC} = 10\,\text{V}$, $\beta = 100$, $r_o = \infty$. A DC source holds the base at $2.7\,\text{V}$. $R_E = 2\kO$ to ground, $R_C = 5\kO$. The signal $v_{in}$, with source resistance $R_S = 50\,\Omega$, is coupled into the emitter through an infinite capacitor; the output is the collector (no load).

(a) $I_C$ and $V_C$; is $Q_1$ forward-active? (b) $g_m$. (c) $R_{in}$: the resistance the source sees at the emitter node, including $R_E$ (not counting $R_S$). (d) $R_{out}$. (e) $A_v = v_{out}/v_{in}$.`,
      fig: C1Fig,
      parts: [
        { lbl: 'I_C', unit: 'mA', ans: 1 }, { lbl: 'V_C', unit: 'V', ans: 5 },
        { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'R_{in}', unit: 'Ω', ans: 24.7 },
        { lbl: 'R_{out}', unit: 'kΩ', ans: 5 },
        { lbl: 'A_v', unit: '', ans: 65.5, accept: [66.1, 66.7], traps: [
          { v: 200, msg: 'That is $g_mR_C$, the gain if $v_{in}$ reached the emitter undivided. The source has $50\\,\\Omega$ and the emitter only about $25\\,\\Omega$: most of $v_{in}$ is lost in $R_S$.' },
          { v: -66.1, msg: 'Common base does not invert: raising the emitter turns the transistor **down**, less current flows in $R_C$, and the collector rises.' }] },
      ],
      hints: [
        md`DC: the base is held at $2.7\,\text{V}$, so the emitter is at $2\,\text{V}$ across $R_E$.`,
        md`Looking into an emitter with the base held: $\dfrac{r_\pi}{\beta + 1}\approx\dfrac1{g_m}$. Here that is in parallel with $R_E$.`,
        md`Find $v_e$ with a divider ($R_S$ against $R_{in}$), then $v_{out} = +g_mR_Cv_e$.`,
      ],
      sol: md`
        **Recognize it first.** The base is tied to a DC source: incremental ground. The signal enters at the **emitter** and leaves at the **collector**. Base common: a **common-base** stage. Expect a non-inverting gain of about $g_mR_C$ **from the emitter**, an input resistance of about $1/g_m$ (tiny), and $R_{out} = R_C$.

        **(a) DC.** $V_E = 2.7 - 0.7 = 2\,\text{V}$, $I_E = 2/2\,\text{k} = 1\,\text{mA}$, $I_C = 0.99\,\text{mA}\approx1\,\text{mA}$. $V_C = 10 - (5\,\text{k})(1\,\text{m}) = 5\,\text{V}$. Forward-active: $V_C = 5\,\text{V} > V_B = 2.7\,\text{V}$ ✓.

        **(b)** $g_m = 40\,\text{mS}$ ($r_\pi = 2.5\kO$).

        **(c) Input resistance.** Into the emitter with the base held: $\dfrac{r_\pi}{\beta + 1} = \dfrac{2500}{101} = 25\,\Omega\approx\dfrac1{g_m}$. In parallel with $R_E$:
        $$R_{in} = 2\,\text{k}\parallel25 = 24.7\,\Omega$$

        **(d)** Into the collector with $r_o = \infty$: open. So $R_{out} = R_C = 5\kO$.

        **(e) Gain.** First the input divider, then the stage:
        $$\frac{v_e}{v_{in}} = \frac{R_{in}}{R_S + R_{in}} = \frac{24.7}{74.7} = 0.331,\qquad \frac{v_{out}}{v_e} = +g_mR_C = 200$$
        $$A_v = 200\times0.331 = 66\quad(65.5\text{ with }I_C = 0.99\,\text{mA})$$
        Why positive: raise the emitter with the base held, $v_\pi = -v_e$ falls, the collector current falls, less drop across $R_C$, the collector rises.

        !!trap The input divider is the whole story
        From the emitter the stage has a gain of $200$, but a mere $50\,\Omega$ of source resistance throws away two thirds of the signal, because the emitter is only $25\,\Omega$. A common base needs a low-resistance (or current) drive. Compare Lecture 24's $G_M = -1/\big[(R_B + r_\pi)/\beta + R_E(\beta + 1)/\beta\big]$ for a series emitter resistor: the same physics, $1/g_m$ in series with the source resistance.
      `,
    }),
    P({
      id: 'e3pC-2', src: 'Exam 3 practice C · Problem 2 (35 pts)', title: 'A BJT cascode with a PNP current-source load', big: true,
      q: md`$Q_1$ (input, emitter grounded) is cascoded by $Q_2$, whose base is at a fixed bias. The load is $Q_3$, a PNP with its base at a fixed bias and its emitter on $V_{CC}$. Keep every $r_o$. In symbols:

(a) $R_X$, looking up into the emitter of $Q_2$ at node $X$ (with $v_{in} = 0$). (b) $R_{DN}$, looking down into the collector of $Q_2$ (exact form). (c) $G_M$. (d) $A_v = v_{out}/v_{in}$.`,
      fig: C2Fig,
      parts: [
        ex('rpi2 || ((ro2 + ro3)/(1 + gm2*ro2))', ['gm2', 'beta2', 'rpi2', 'ro2', 'ro3'], 'R_X', { ranges: { gm2: [20e-3, 80e-3], beta2: [100, 300], ro2: [1.5e5, 3e5], ro3: [1e5, 2e5] } }),
        ex(C2Rdn, ['gm2', 'beta2', 'rpi2', 'ro1', 'ro2'], 'R_{DN}', { exact: true, ranges: { gm2: [20e-3, 80e-3] } }),
        ex('gm1*beta2/(beta2 + 1)', ['gm1', 'beta2'], 'G_M', { ranges: { gm1: [20e-3, 80e-3] } }),
        ex(`-(gm1*beta2/(beta2 + 1))*(ro3 || (${C2Rdn}))`, ['gm1', 'gm2', 'beta2', 'rpi2', 'ro1', 'ro2', 'ro3'], 'A_v', { ranges: { gm1: [20e-3, 80e-3], gm2: [40e-3, 80e-3], beta2: [100, 200], ro1: [2e5, 3e5] } }),
      ],
      hints: [
        md`$Q_3$: PNP drawn like a PMOS, emitter on top at $V_{CC}$, base held. The output touches its **collector**: $r_{o3}$.`,
        md`(a) An emitter with the base held is "about $1/g_m$", but only when the collector sits on a rail. Here the collector sees $r_{o3}$, as big as $r_{o2}$. Exam 2's version: a source with $R_D$ on the drain is $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$. The BJT adds $r_\pi$ in parallel (from the emitter to the held base).`,
        md`(b) Looking down into $Q_2$'s collector: a degenerated collector whose "emitter resistor" is $r_{o1}$, shunted by $r_{\pi2}$.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base**, emitter grounded, out at the collector: a **common emitter**. But its collector does not go to the output; it goes into $Q_2$'s emitter.
        - $Q_2$: base held, signal in at the **emitter**, out at the **collector**: a **common base**. CE + CB stacked is a **cascode**.
        - $Q_3$: PNP (emitter on top at $V_{CC}$, arrow in), base held, output on its **collector**: $r_{o3}$, a current-source load.

        **(a) Node $X$.** With the base of $Q_2$ held, $r_{\pi2}$ runs from $X$ to ground. The rest is Exam 2's "source with a drain load" with $R_D = r_{o3}$:
        $$R_X = r_{\pi2}\parallel\frac{r_{o2} + r_{o3}}{1 + g_{m2}r_{o2}}\approx\frac{1}{g_{m2}}\Big(1 + \frac{r_{o3}}{r_{o2}}\Big)$$
        About $2/g_{m2}$ when $r_{o3}\approx r_{o2}$: still small. Node $X$ hardly moves, so $Q_1$ works into almost a short (no Miller multiplication of $Q_1$'s $C_\mu$: why cascodes are fast).

        **(b) Looking down into $Q_2$'s collector.** A degenerated collector whose emitter resistor is $r_{o1}$ (looking into $Q_1$'s collector with $v_{in} = 0$), shunted by $r_{\pi2}$:
        $$R_{DN} = r_{o2} + (r_{o1}\parallel r_{\pi2})(1 + g_{m2}r_{o2})\approx g_{m2}r_{o2}\,r_{\pi2} = \beta_2r_{o2}$$
        (because $r_{o1}\gg r_{\pi2}$). A BJT cascode tops out at about $\beta r_o$; a MOS cascode reaches $g_mr_{ds}\cdot r_{ds}$. The difference is the base current: $r_\pi$ lets signal current leak around $Q_2$.

        **(c) $G_M$.** Short the output. $Q_1$ turns $v_{in}$ into $g_{m1}v_{in}$; almost all of it goes into $Q_2$'s small emitter (not into $r_{o1}$), and $Q_2$ passes the fraction $\alpha = \beta_2/(\beta_2 + 1)$ to its collector (the rest leaves through its base):
        $$G_M = g_{m1}\frac{\beta_2}{\beta_2 + 1}\approx g_{m1}$$

        **(d)**
        $$A_v = -G_M\,(r_{o3}\parallel R_{DN})\approx -g_{m1}\big(r_{o3}\parallel\beta_2r_{o2}\big)\approx -g_{m1}r_{o3}$$
        The cascode made $R_{DN}$ huge, so now the load $r_{o3}$ sets the gain. To get the full benefit you would cascode the load as well.
      `,
    }),
    P({
      id: 'e3pC-3', src: 'Exam 3 practice C · Problem 3 (30 pts)', title: 'Bandwidth of a common emitter (open-circuit time constants)', big: true,
      q: md`A common-emitter stage is biased at $I_C = 1\,\text{mA}$, $\beta = 100$, $r_o = \infty$. It is driven from $R_S = 625\,\Omega$ and its total collector load is $R_L = 2\kO$. $C_\pi = 10\,\text{pF}$, $C_\mu = 0.4\,\text{pF}$, and $C_L = 1.5\,\text{pF}$ from the output to ground. ($r_\pi$ is inside the transistor, from base to emitter; it is not drawn.)

(a) $g_m$ and $r_\pi$. (b) The DC gain $v_{out}/v_{in}$. (c) The resistance seen by $C_\pi$. (d) The resistance seen by $C_\mu$. (e) The bandwidth estimate $\omega_{-3dB}$. (f) Which capacitor limits the bandwidth?`,
      fig: C3Fig,
      parts: [
        { lbl: 'g_m', unit: 'mS', ans: 40 }, { lbl: 'r_\\pi', unit: 'kΩ', ans: 2.5 },
        { lbl: 'A_{v0}', unit: '', ans: -64, traps: [{ v: -80, msg: 'That is $-g_mR_L$ from the base. $R_S$ and $r_\\pi$ divide $v_{in}$ first: only $2.5/3.125 = 0.8$ of it reaches the base.' }] },
        { lbl: 'R_{C\\pi}', unit: 'Ω', ans: 500, traps: [{ v: 625, msg: 'That is $R_S$ alone. Unlike a MOSFET gate, a BJT base has $r_\\pi$ to ground: the base node is $R_S\\parallel r_\\pi$.' }] },
        { lbl: 'R_{C\\mu}', unit: 'kΩ', ans: 42.5, traps: [{ v: 2.5, msg: 'That is $R_{left} + R_{right}$ only. Add $g_mR_{left}R_{right}$: the Miller term.' }, { v: 52.625, msg: 'Use $R_{left} = R_S\\parallel r_\\pi = 500\\,\\Omega$, not $R_S$.' }] },
        { lbl: '\\omega_{-3dB}', unit: 'rad/s', ans: 4e7, accept: [4.13e7] },
        { lbl: '(f) The bandwidth is limited mainly by', mc: ['$C_\\mu$ (Miller-multiplied)', '$C_\\pi$ (the biggest capacitor)', '$C_L$', '$r_\\pi$'], a: 0,
          why: [null, '$\\tau_\\pi = 500\\times10\\,\\text{p} = 5\\,\\text{ns}$: big capacitor, small resistance.', '$\\tau_L = 2\\,\\text{k}\\times1.5\\,\\text{p} = 3\\,\\text{ns}$.', '$r_\\pi$ is a resistor; it only sets what $C_\\pi$ and $C_\\mu$ see.'] },
      ],
      hints: [
        md`$g_m = I_C/V_T$, $r_\pi = \beta/g_m$. The base node: $R_S$ to the source, $r_\pi$ to ground.`,
        md`$C_\pi$ (base to grounded emitter) sees everything at the base node: $R_S\parallel r_\pi$.`,
        md`$C_\mu$ bridges base and collector: $R_{left} + R_{right} + g_mR_{left}R_{right}$ with $R_{left} = R_S\parallel r_\pi$, $R_{right} = R_L$.`,
      ],
      sol: md`
        **Recognize it first.** In at the **base** (through $R_S$), out at the **collector**, emitter grounded: a **common emitter**. The BJT twist on the CS picture: $r_\pi$ is a real resistor from the base to ground, so the input node is $R_S\parallel r_\pi$ (a MOSFET gate would leave just $R_S$). $C_\pi$ sits on the input node, $C_L$ on the output node, and $C_\mu$ bridges input and output of an inverting gain: the Miller capacitor.

        **(a)** $g_m = 1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$, $r_\pi = 100/40\,\text{mS} = 2.5\kO$.

        **(b)** The base gets $\dfrac{r_\pi}{R_S + r_\pi} = \dfrac{2500}{3125} = 0.8$ of $v_{in}$; the collector gives $-g_mR_L = -80$:
        $$A_{v0} = -80\times0.8 = -64\quad(36.1\,\text{dB})$$

        **(c) $C_\pi$.** Open $C_\mu$ and $C_L$. Between base and ground you see $R_S\parallel r_\pi$:
        $$R_{C\pi} = 625\parallel2500 = 500\,\Omega,\qquad\tau_\pi = (500)(10\,\text{p}) = 5\,\text{ns}$$

        **(d) $C_\mu$.** $R_{left} = 500\,\Omega$ (the base node), $R_{right} = R_L = 2\kO$ (the collector node), $g_m$ between them:
        $$R_{C\mu} = R_{left} + R_{right} + g_mR_{left}R_{right} = 500 + 2000 + (0.04)(500)(2000) = 42.5\kO$$
        $\tau_\mu = (42.5\,\text{k})(0.4\,\text{p}) = 17\,\text{ns}$. And $C_L$: $\tau_L = (2\,\text{k})(1.5\,\text{p}) = 3\,\text{ns}$.

        **(e)** $\sum\tau = 5 + 17 + 3 = 25\,\text{ns}$:
        $$\omega_{-3dB}\approx\frac{1}{25\,\text{ns}} = 4\times10^7\,\text{rad/s}\quad(f\approx6.4\,\text{MHz})$$
        The exact $-3\,\text{dB}$ frequency of this circuit is $4.13\times10^7\,\text{rad/s}$ (the estimate is safely pessimistic).

        **(f)** $C_\mu$: $0.4\,\text{pF}$ is the smallest capacitor, but $g_mR_{left}R_{right}$ multiplies the resistance it sees by about $1 + g_mR_L = 81$. That is the Miller effect, seen through time constants.

        !!key Pattern
        Every capacitor: (1) open the others, (2) find the resistance between its two terminals with the terminal rules, (3) $\tau = RC$. Grounded caps see the node resistance. A cap from base/gate to collector/drain sees $R_{left} + R_{right} + g_mR_{left}R_{right}$.
      `,
    }),
  ];

  // ================================================================== Practice exam D (harder)
  const D1Fig = [
    ['rail', [1, -1.2], { n: 'V_{CC} = 10\\,\\text{V}' }], ['R', [1, -1.2], [1, 0], { n: 'R_{C1}', s: kO(4.3), side: 'l' }],
    ['npn', [1, 1], { n: 'Q_1' }],
    ['R', [1, 2], [1, 3.2], { n: 'R_{E1}', s: kO(1) }], ['gnd', [1, 3.2]],
    ['w', [1, 2], [0.3, 2]], ['C', [0.3, 2], [0.3, 3.2], { n: '\\infty', side: 'l' }], ['w', [0.3, 3.2], [1, 3.2]],
    ['w', [0, 1], [-0.7, 1], [-0.7, 1.3]], ['Vac', [-0.7, 1.3], [-0.7, 2.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.7, 2.3], [-0.7, 3.3], { n: Vv(1.7), side: 'l' }], ['gnd', [-0.7, 3.3]],
    ['w', [1, 0], [1.8, 0]], ['npn', [2.8, 0], { n: 'Q_2' }], ['rail', [2.8, -1], { n: 'V_{CC}' }],
    ['R', [2.8, 1], [2.8, 2.2], { n: 'R_{E2}', s: kO(2.5) }], ['gnd', [2.8, 2.2]],
    ['w', [2.8, 1], [3.6, 1]], ['term', [3.6, 1], { n: 'v_{out}' }],
  ];
  const D2Fig = [
    ['w', [1, 0], [1, -0.4], [2, -0.4], [2, 1]], ['rail', [1.5, -0.4], { n: 'V_{CC}' }],
    ['npn', [1, 1], { n: 'Q_1' }], ['npn', [2, 2], { n: 'Q_2' }],
    ['R', [2, 3], [2, 4.2], { n: 'R_E' }], ['gnd', [2, 4.2]], ['w', [2, 3], [2.8, 3]], ['term', [2.8, 3], { n: 'v_{out}' }],
    ['R', [-1.2, 1], [0, 1], { n: 'R_S' }], ['w', [-1.2, 1], [-1.6, 1], [-1.6, 1.3]], ['Vac', [-1.6, 1.3], [-1.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.6, 2.3]],
  ];
  const D3Fig = [
    ['rail', [2, -1.2], { n: 'V_{DD}' }], ['R', [2, -1.2], [2, 0], { n: 'R_D', s: kO(10) }],
    ['nmos', [2, 1], { n: 'M_1' }], ['R', [2, 2], [2, 3.2], { n: 'R_S', s: kO(1) }], ['gnd', [2, 3.2]],
    ['Vac', [-1.2, 1], [-1.2, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.2, 2]],
    ['R', [-1.2, 1], [0.2, 1], { n: 'R_G', s: kO(4) }], ['w', [0.2, 1], [1, 1]],
    ['C', [0.2, 1], [0.2, 2], { n: 'C_{gs}', side: 'l' }], ['w', [0.2, 2], [2, 2]],
    ['w', [0.6, 1], [0.6, 0]], ['C', [0.6, 0], [1.5, 0], { n: 'C_{gd}' }], ['w', [1.5, 0], [2, 0]],
    ['w', [2, 0], [3.4, 0]], ['C', [2.8, 0], [2.8, 1.2], { n: 'C_L' }], ['gnd', [2.8, 1.2]], ['term', [3.4, 0], { n: 'v_{out}' }],
  ];
  const D3dB = 20 * Math.log10(8);
  const D3Plot = bode({ x: [7, 10.5], y: [-25, 25], xt: [7, 8, 9, 10], yt: [-20, -10, 0, 10, 20], f: mag(8, [], [5e8]),
    line: [[7, D3dB], [Math.log10(5e8), D3dB], [10.5, D3dB - 20 * (10.5 - Math.log10(5e8))]],
    pts: [{ x: Math.log10(5e8), y: D3dB, n: '\\omega_{-3dB}' }, { x: Math.log10(4e9), y: 0, n: '\\omega_u' }] });
  const D2v = ['rpi1', 'beta1', 'rpi2', 'beta2', 'RE', 'RS'];
  const D2r = { ranges: { beta1: [100, 300], beta2: [100, 300] } };
  const D2Ro = '(rpi2 + (rpi1 + RS)/(beta1 + 1))/(beta2 + 1)';

  const Dex = [
    intro('D', '**Harder than A–C**: a two-stage BJT amplifier, a Darlington, and a degenerated stage\'s bandwidth with its Bode plot.'),
    P({
      id: 'e3pD-1', src: 'Exam 3 practice D · Problem 1 (35 pts)', title: 'Two stages: a common emitter into an emitter follower', big: true,
      q: md`$V_{CC} = 10\,\text{V}$, $\beta = 100$ for both transistors, $r_o = \infty$. $Q_1$'s base is at $1.7\,\text{V}$ DC plus $v_{in}$; $R_{E1} = 1\kO$ is bypassed; $R_{C1} = 4.3\kO$. $Q_2$'s base is wired to $Q_1$'s collector, its collector is on $V_{CC}$, and $R_{E2} = 2.5\kO$ is in its emitter; the output is $Q_2$'s emitter. In the DC analysis take $I_C\approx I_E$ and neglect $Q_2$'s base current next to $Q_1$'s collector current.

(a) $I_{C2}$. (b) The resistance looking into $Q_2$'s base. (c) The first stage's gain $v_{c1}/v_{in}$, loaded by $Q_2$. (d) The overall $A_v = v_{out}/v_{in}$. (e) $R_{out}$ at the output.`,
      fig: D1Fig,
      parts: [
        { lbl: 'I_{C2}', unit: 'mA', ans: 2 }, { lbl: 'R_{in2}', unit: 'kΩ', ans: 253.75 },
        { lbl: 'A_{v1}', unit: '', ans: -169.1, accept: [-169.1], traps: [{ v: -172, msg: 'That is $-g_{m1}R_{C1}$: it ignores the load $Q_2$\'s base puts on $Q_1$\'s collector.' }] },
        { lbl: 'A_v', unit: '', ans: -168.3 },
        { lbl: 'R_{out}', unit: 'Ω', ans: 53.8, traps: [{ v: 2500, msg: 'That is $R_{E2}$ alone. Looking back into the emitter you also see the follower: $(r_{\\pi2} + R_{C1})/(\\beta + 1)$.' }] },
      ],
      hints: [
        md`DC: $V_{E1} = 1.0\,\text{V}$ sets $I_{C1}$. Then $V_{C1} = 10 - I_{C1}R_{C1}$, and $Q_2$'s emitter is $0.7\,\text{V}$ below that.`,
        md`$Q_2$ is a follower: looking into its base you see $r_{\pi2} + (\beta + 1)R_{E2}$. That is the load on $Q_1$'s collector, in parallel with $R_{C1}$.`,
        md`Looking back into $Q_2$'s emitter: its base sees $R_{C1}$ (the CE's output resistance), so $(r_{\pi2} + R_{C1})/(\beta + 1)$.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base**, out at the **collector**, emitter grounded for signals (bypassed): a **common emitter**. It makes the gain, but its output resistance is $R_{C1} = 4.3\kO$.
        - $Q_2$: in at the **base** (from $Q_1$'s collector), out at the **emitter**, collector on $V_{CC}$: an **emitter follower**. Gain about $1$; it divides the output resistance by $\beta + 1$, and its big input resistance ($\approx(\beta + 1)R_{E2}$) barely loads $Q_1$.

        **(a) DC.** $V_{E1} = 1.7 - 0.7 = 1\,\text{V}$, $I_{C1}\approx1\,\text{mA}$. $V_{C1} = 10 - 4.3 = 5.7\,\text{V}$, $V_{E2} = 5.0\,\text{V}$, $I_{C2}\approx\dfrac{5}{2.5\,\text{k}} = 2\,\text{mA}$. Checks: $V_{C1} = 5.7 > V_{B1} = 1.7$ ✓; $V_{C2} = 10 > V_{B2} = 5.7$ ✓. (The neglected $I_{B2} = 20\,\mu\text{A}$ would drop $86\,\text{mV}$ in $R_{C1}$: a $1.5\%$ effect.)

        Small-signal parameters: $g_{m1} = 40\,\text{mS}$, $r_{\pi1} = 2.5\kO$; $g_{m2} = 80\,\text{mS}$, $r_{\pi2} = 1.25\kO$.

        **(b)** $R_{in2} = r_{\pi2} + (\beta + 1)R_{E2} = 1.25\,\text{k} + 101(2.5\,\text{k}) = 253.75\kO$.

        **(c)** $Q_1$'s collector sees $R_{C1}\parallel R_{in2} = 4.3\,\text{k}\parallel253.75\,\text{k} = 4.228\kO$:
        $$A_{v1} = -g_{m1}(R_{C1}\parallel R_{in2}) = -(40\,\text{m})(4.228\,\text{k}) = -169.1$$

        **(d)** From $Q_2$'s base to its emitter: $\dfrac{(\beta + 1)R_{E2}}{r_{\pi2} + (\beta + 1)R_{E2}} = \dfrac{252.5}{253.75} = 0.995$. So
        $$A_v = -169.1\times0.995 = -168.3$$
        **Same answer the Thévenin way.** $Q_1$'s collector, unloaded, is $-g_{m1}R_{C1}v_{in} = -172\,v_{in}$ behind $R_{C1}$. The follower then divides: $\dfrac{R_{E2}}{R_{E2} + (r_{\pi2} + R_{C1})/(\beta + 1)} = \dfrac{2500}{2500 + 54.95} = 0.9785$, and $-172\times0.9785 = -168.3$ ✓.

        !!trap Count $R_{C1}$ once
        Use one picture or the other: the **loaded** first-stage gain ($-169.1$, which already has $R_{in2}$) times the base-to-emitter gain ($0.995$); or the **unloaded** $-g_{m1}R_{C1}$ times the divider that contains $R_{C1}/(\beta + 1)$. Mixing them, $-169.1\times0.9785 = -165.5$, counts $R_{C1}$ twice.

        **(e)** Looking back into the output: $R_{E2}$ in parallel with the follower's emitter, whose base sees $R_{C1}$:
        $$R_{out} = R_{E2}\parallel\frac{r_{\pi2} + R_{C1}}{\beta + 1} = 2500\parallel\frac{5550}{101} = 2500\parallel55 = 53.8\,\Omega$$
        Without the follower the output resistance would be $4.3\kO$: the follower divided it by about $\beta + 1$ and lost less than $1\%$ of the gain.
      `,
    }),
    P({
      id: 'e3pD-2', src: 'Exam 3 practice D · Problem 2 (35 pts)', title: 'A Darlington follower: the $(\\beta + 1)$ rule twice', big: true,
      q: md`$Q_1$ and $Q_2$ form a Darlington: $Q_1$'s emitter drives $Q_2$'s base, and both collectors are on $V_{CC}$. $v_{in}$ drives $Q_1$'s base through $R_S$; the output is $Q_2$'s emitter, with $R_E$ to ground. Bias details are not needed; $r_o = \infty$. In symbols ($\beta_1$, $r_{\pi1}$, $\beta_2$, $r_{\pi2}$, $R_E$, $R_S$):

(a) $R_{in}$, looking into $Q_1$'s base. (b) $R_o$, looking into $Q_2$'s emitter (not counting $R_E$). (c) $A_v = v_{out}/v_{in}$. (d) How are $r_{\pi1}$ and $r_{\pi2}$ related?`,
      fig: D2Fig,
      parts: [
        ex('rpi1 + (beta1 + 1)*(rpi2 + (beta2 + 1)*RE)', D2v.slice(0, 5), 'R_{in}', D2r),
        ex(D2Ro, D2v, 'R_o', D2r),
        ex(`RE/(RE + ${D2Ro})`, D2v, 'A_v', D2r),
        { lbl: '(d) $Q_1$\'s emitter current is $Q_2$\'s base current. With equal $\\beta$, how do the two $r_\\pi$ compare?', mc: ['$r_{\\pi1}\\approx\\beta\\,r_{\\pi2}$: $Q_1$ runs at about $1/\\beta$ of $Q_2$\'s current', '$r_{\\pi1} = r_{\\pi2}$: same transistor, same $\\beta$', '$r_{\\pi1}\\approx r_{\\pi2}/\\beta$', '$r_{\\pi1}\\approx2r_{\\pi2}$'], a: 0,
          why: [null, '$r_\\pi = \\beta V_T/I_C$ depends on the bias current, and the two run at very different currents.', 'Backwards: the transistor with the **smaller** current has the **larger** $r_\\pi$.', 'No: the currents differ by a factor $\\beta + 1$, not $2$.'] },
      ],
      hints: [
        md`Work from the output back. Looking into $Q_2$'s base: $r_{\pi2} + (\beta_2 + 1)R_E$. That whole thing is $Q_1$'s emitter load.`,
        md`Work from the input forward. Looking into $Q_1$'s emitter: $(R_S + r_{\pi1})/(\beta_1 + 1)$. That is the base-side resistance of $Q_2$.`,
        md`Open-circuit, a follower's output equals its input (no emitter current, no base current, no drops). So the circuit is $v_{in}$ behind $R_o$, loaded by $R_E$.`,
      ],
      sol: md`
        **Recognize it first.** $Q_1$: in at the base, out at the emitter, collector on a rail: a **follower**. $Q_2$: the same, driven by $Q_1$. A follower driving a follower. Two rules do everything: **looking into a base**, the emitter side is multiplied by $(\beta + 1)$; **looking into an emitter**, the base side is divided by $(\beta + 1)$.

        **(a) Input, from the output back.** Into $Q_2$'s base: $r_{\pi2} + (\beta_2 + 1)R_E$. That is the load in $Q_1$'s emitter, so
        $$R_{in} = r_{\pi1} + (\beta_1 + 1)\big[r_{\pi2} + (\beta_2 + 1)R_E\big]\approx\beta_1\beta_2R_E$$

        **(b) Output, from the input forward.** Into $Q_1$'s emitter: $(R_S + r_{\pi1})/(\beta_1 + 1)$. That is the resistance in $Q_2$'s base lead, so
        $$R_o = \frac{r_{\pi2} + \dfrac{r_{\pi1} + R_S}{\beta_1 + 1}}{\beta_2 + 1}$$

        **(c)** With $R_E$ removed no current flows anywhere, so $v_{out} = v_{in}$: the output is $v_{in}$ behind $R_o$. With $R_E$:
        $$A_v = \frac{R_E}{R_E + R_o}$$

        **(d)** $I_{C1}\approx I_{E1} = I_{B2} = I_{C2}/\beta$, so $Q_1$ runs at $1/\beta$ of $Q_2$'s current and $r_{\pi1} = \beta V_T/I_{C1}\approx\beta\,r_{\pi2}$. Put that into (a): $R_{in}\approx\beta r_{\pi2} + \beta(r_{\pi2} + \beta R_E)\approx\beta^2R_E$ when $\beta R_E\gg2r_{\pi2}$. Into (b): $R_o\approx\dfrac{2r_{\pi2} + R_S/\beta}{\beta}$: about $2/g_{m2}$ plus $R_S/\beta^2$.

        !!key MOS vs BJT
        Two MOS source followers in a row would give $R_{in} = \infty$ and $R_o\approx1/g_{m2}$, and $R_S$ would never appear. With BJTs every base draws current, so resistances move between the base side and the emitter side, scaled by $(\beta + 1)$ each time you cross a transistor.
      `,
    }),
    P({
      id: 'e3pD-3', src: 'Exam 3 practice D · Problem 3 (30 pts)', title: 'A degenerated common source: time constants and the Bode plot', big: true,
      q: md`An NMOS with $g_m = 4\,\text{mS}$ and $r_{ds}\to\infty$ has $R_S = 1\kO$ from its source to ground. It is driven from $v_{in}$ through $R_G = 4\kO$; the drain load is $R_D = 10\kO$. $C_{gs} = 100\,\text{fF}$ (gate to **source**), $C_{gd} = 25\,\text{fF}$, $C_L = 75\,\text{fF}$ at the output.

(a) The DC gain. (b) The resistance seen by $C_{gs}$. (c) The resistance seen by $C_{gd}$. (d) The bandwidth estimate $\omega_{-3dB}$. Now treat the response as one pole at $\omega_{-3dB}$: (e) the straight-line $|A_v|$ in dB at DC, (f) at $\omega = 5\times10^9\,\text{rad/s}$, (g) the unity-gain frequency $\omega_u$ of the straight line.`,
      fig: D3Fig,
      parts: [
        { lbl: 'A_{v0}', unit: '', ans: -8, traps: [{ v: -40, msg: 'That is $-g_mR_D$: it forgets the degeneration, $1 + g_mR_S = 5$.' }, { v: -10, msg: 'That is $-R_D/R_S$, the $g_mR_S\\gg1$ limit. Here $g_mR_S = 4$: keep the $1/g_m$.' }] },
        { lbl: 'R_{gs}', unit: 'kΩ', ans: 1, traps: [{ v: 4, msg: 'That is $R_G$ alone. $C_{gs}$ goes from gate to **source**, and the source moves: $(R_G + R_S)/(1 + g_mR_S)$.' }, { v: 5, msg: 'That is $R_G + R_S$: divide by $1 + g_mR_S$, because the source follows the gate.' }] },
        { lbl: 'R_{gd}', unit: 'kΩ', ans: 46, traps: [{ v: 174, msg: 'That uses the full $g_m$. With source degeneration the transconductance between gate and drain is $g_m/(1 + g_mR_S) = 0.8\\,\\text{mS}$.' }, { v: 14, msg: 'That is $R_{left} + R_{right}$ only: add $g_{m,eff}R_{left}R_{right}$.' }] },
        { lbl: '\\omega_{-3dB}', unit: 'rad/s', ans: 5e8, accept: [5.24e8] },
        { lbl: '|A_v|\\ \\text{at DC}', unit: 'dB', ans: D3dB },
        { lbl: '|A_v|\\ \\text{at}\\ 5\\times10^9', unit: 'dB', ans: D3dB - 20 },
        { lbl: '\\omega_u', unit: 'rad/s', ans: 4e9 },
      ],
      hints: [
        md`Gain: $G_M = g_m/(1 + g_mR_S)$, $R_{out} = R_D$ (with $r_{ds} = \infty$ the drain looks infinite).`,
        md`$C_{gs}$ is **floating** (the source is not at ground). Lecture 29: $R_{gs} = \dfrac{R_G + R_S}{1 + g_mR_S}$: the source follows the gate, so little voltage builds across $C_{gs}$.`,
        md`$C_{gd}$: $R_{left} = R_G$, $R_{right} = R_D$, and the transconductance between them is the degenerated one, $g_m/(1 + g_mR_S)$.`,
        md`One pole: flat until $\omega_{-3dB}$, then $-20\,\text{dB/dec}$. Gain times bandwidth stays constant: $\omega_u = |A_{v0}|\,\omega_{-3dB}$.`,
      ],
      figs: { plot: { svg: D3Plot, cap: 'The one-pole approximation: flat at $18.1\\,\\text{dB}$ to $\\omega_{-3dB} = 5\\times10^8$, then $-20\\,\\text{dB/dec}$, crossing $0\\,\\text{dB}$ at $\\omega_u = 4\\times10^9\\,\\text{rad/s}$. Dashed: straight line; solid: the one-pole curve.' } },
      sol: md`
        **Recognize it first.** In at the **gate** (through $R_G$), out at the **drain**, $R_S$ in the source: a **degenerated common source**, gain $\approx-R_D/(R_S + 1/g_m)$. Now the capacitors, and this is where the degeneration bites: the source is **not** at ground, so $C_{gs}$ is a floating capacitor between gate and source. $C_{gd}$ bridges input and output. $C_L$ is on the output node.

        **(a)** $A_{v0} = -\dfrac{g_mR_D}{1 + g_mR_S} = -\dfrac{40}{5} = -8$.

        **(b) $C_{gs}$.** Test source between gate and source, other capacitors open (Lecture 29):
        $$R_{gs} = \frac{R_G + R_S}{1 + g_mR_S} = \frac{4\,\text{k} + 1\,\text{k}}{5} = 1\kO,\qquad\tau_{gs} = (1\,\text{k})(100\,\text{f}) = 0.1\,\text{ns}$$
        Why so small: when the gate moves, the source follows it, so the voltage across $C_{gs}$ hardly changes. Degeneration "bootstraps" $C_{gs}$.

        **(c) $C_{gd}$.** $R_{left} = R_G = 4\kO$ (the gate draws nothing), $R_{right} = R_D = 10\kO$ (with $r_{ds} = \infty$ the drain looks infinite, so only $R_D$), and between them the degenerated transconductance $g_{m,eff} = \dfrac{g_m}{1 + g_mR_S} = 0.8\,\text{mS}$:
        $$R_{gd} = R_{left} + R_{right} + g_{m,eff}R_{left}R_{right} = 4\,\text{k} + 10\,\text{k} + (0.8\,\text{m})(4\,\text{k})(10\,\text{k}) = 46\kO$$
        $\tau_{gd} = (46\,\text{k})(25\,\text{f}) = 1.15\,\text{ns}$. And $C_L$ sees $R_D$: $\tau_L = (10\,\text{k})(75\,\text{f}) = 0.75\,\text{ns}$.

        **(d)** $\sum\tau = 0.1 + 1.15 + 0.75 = 2\,\text{ns}$, so $\omega_{-3dB}\approx5\times10^8\,\text{rad/s}$. (Exact for this circuit: $5.24\times10^8$.)

        **(e)** $20\log_{10}8 = 18.1\,\text{dB}$.

        **(f)** $5\times10^9$ is one decade above the pole: $18.1 - 20 = -1.9\,\text{dB}$.

        **(g)** $\omega_u = |A_{v0}|\,\omega_{-3dB} = 8\times5\times10^8 = 4\times10^9\,\text{rad/s}$. (Check: $18.1\,\text{dB}$ at $20\,\text{dB/dec}$ takes $0.9$ decade: $5\times10^8\times10^{0.9} = 4\times10^9$ ✓.)

        [[fig:plot]]

        **The trade.** With $R_S = 0$: $\tau_{gs} = 0.4$, $\tau_{gd} = (4 + 10 + 160)\,\text{k}\times25\,\text{f} = 4.35$, $\tau_L = 0.75\,\text{ns}$, so $\omega_{-3dB}\approx1.8\times10^8$ with a gain of $-40$. Degeneration cut the gain by 5 and raised the bandwidth by about 2.7: it shrinks the Miller term ($g_m\to g_{m,eff}$) and bootstraps $C_{gs}$.
      `,
    }),
  ];

  E3.lesson('e3-pracu', { id: 'e3-pA', title: 'Exam 3 practice exam A', kind: 'mock', sub: 'CE with a partly bypassed $R_E$, a PMOS source over a degenerated CE, a Bode plot from $H(s)$', steps: Aex });
  E3.lesson('e3-pracu', { id: 'e3-pB', title: 'Exam 3 practice exam B', kind: 'mock', sub: 'A PNP emitter follower, a source follower driving a CE, Miller and time constants for a CS stage', steps: Bex });
  E3.lesson('e3-pracu', { id: 'e3-pC', title: 'Exam 3 practice exam C', kind: 'mock', sub: 'Common base, a BJT cascode with a PNP load, the bandwidth of a CE stage', steps: Cex });
  E3.lesson('e3-pracu', { id: 'e3-pD', title: 'Exam 3 practice exam D (harder)', kind: 'mock', sub: 'CE into an emitter follower, a Darlington, a degenerated CS: time constants and Bode', steps: Dex });
})();

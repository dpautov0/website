/* Exam 2: three new practice exams (A, B, C) in the format of the official Practice Exams 1–5: 60 minutes, three
   problems, 100 points, MOSFET small-signal circuits. Every symbolic answer was checked against an exact small-signal
   circuit solve; every numeric answer by hand and with r_ds -> infinity in the same solver. */
(function () {
  'use strict';
  const { R, P } = C;
  const ex = (...a) => E2.ex(...a);
  const F = window.E2F;
  const V = (v) => `${v}\\,\\text{V}`;

  // ------------------------------------------------------------------ figure helpers (local)
  const acgL = (x, y) => ['acg', [x, y]];                       // incremental ground hanging under a gate lead
  const lookDn = (p, n) => F.lookDn(p, n);
  const lookUp = (p, n) => F.lookUp(p, n);
  const look = (p, n, side) => F.look(p, n, side);
  const vin = (x, y, n) => F.vin(x, y, n);
  const out = (p, n) => F.out(p, n);

  const params = md`**Transistor parameters.** NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. PMOS: $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$.`;
  const howto = 'Symbolic boxes take expressions like `rds2 + (1 + gm2*rds2)*(RS || 1/gm3)`; `||` is "in parallel with". The exact result and the $g_mr_{ds} \\gg 1$ approximation are both accepted.';

  // ================================================================== Practice exam A
  const A1aFig = [
    ['Vac', [0, -0.4], [0, 0.6], { n: 'v_{in}', side: 'l' }], ['w', [0, -0.4], [1, -0.4]], ['w', [0, 0.6], [1, 0.6]],
    ['box', [1, -0.9], [3.2, 1.1], { n: 'Amplifier' }],
    ['w', [3.2, -0.4], [4.2, -0.4]], ['term', [4.2, -0.4], { n: '+\\;v_{out}', side: 'r' }],
    ['w', [3.2, 0.6], [4.2, 0.6]], ['term', [4.2, 0.6], { n: '-', side: 'r' }],
  ];
  const A1bFig = [
    ['rail', [1, -2], { n: V(3) }], ['pmos', [1, -1], { n: 'M_2', sz: '100/1', dc: true }],
    ['w', [1, 0], [1.9, 0]], out([1.9, 0], 'V_{OUT} + v_{out}'),
    ['nmos', [1, 1], { n: 'M_1', sz: '200/1' }], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }],
    ['V', [-0.6, 2.3], [-0.6, 3.3], { n: 'V_B', s: V(1.2), side: 'l' }], ['gnd', [-0.6, 3.3]],
  ];
  const A1cFig = [
    ['rail', [1, -1.2], { n: V(5) }], ['R', [1, -1.2], [1, 0], { n: 'R_D', s: '2\\kO' }],
    ['w', [1, 0], [1.6, 0]], ['C', [1.6, 0], [2.6, 0], { n: '\\infty' }], ['w', [2.6, 0], [4.2, 0]], out([4.2, 0], 'v_{out}'),
    ['R', [3.4, 0], [3.4, 1.2], { n: 'R_L', s: '2\\kO' }], ['gnd', [3.4, 1.2]],
    ['nmos', [1, 1], { sz: '500/1' }],
    ['w', [0, 1], [-0.5, 1], [-0.5, 1.4]], ['V', [-0.5, 1.4], [-0.5, 2.4], { s: V(2), side: 'l' }], ['gnd', [-0.5, 2.4]],
    ['I', [1, 2], [1, 3.2], { s: '1\\,\\text{mA}', side: 'l' }], ['gnd', [1, 3.2]],
    ['w', [1, 2], [1.6, 2]], ['C', [1.6, 2], [2.4, 2], { n: '\\infty' }], ['R', [2.4, 2], [3.6, 2], { n: 'R_S', s: '100\\,\\Omega', side: 'b' }],
    ['w', [3.6, 2], [4.2, 2]], ['Vac', [4.2, 2], [4.2, 3.2], { n: 'v_{in}' }], ['gnd', [4.2, 3.2]],
  ];
  const A2aFig = [
    ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], 'R_{EQ1}'),
    ['nmos', [1, 1], { n: 'M_2' }], acgL(0, 1), ['node', [1, 2], { n: 'X', side: 'l' }],
    ['nmos', [1, 3], { n: 'M_1' }], acgL(0, 3), ['R', [1, 4], [1, 5.2], { n: 'R_S' }], ['gnd', [1, 5.2]],
    ['w', [1, 2], [2.6, 2]], ['nmos', [2.6, 3], { n: 'M_3', flip: true, dc: true }], ['gnd', [2.6, 4]],
  ];
  const A2bFig = [
    ['rail', [1, -2.4]], ['R', [1, -2.4], [1, -1.2], { n: 'R_3' }], ['pmos', [1, -0.2], { n: 'M_2' }], acgL(0, -0.2),
    ['w', [1, 0.8], [2.4, 0.8]], look([2.4, 0.8], 'R_{EQ2}'),
    ['nmos', [1, 1.8], { n: 'M_1' }], ['R', [1, 2.8], [1, 4], { n: 'R_S' }], ['gnd', [1, 4]],
    ['w', [1, 0.8], [-0.7, 0.8]], ['R', [-0.7, 0.8], [-0.7, 1.8], { n: 'R_1', side: 'l' }], ['w', [-0.7, 1.8], [0, 1.8]],
    ['R', [-0.7, 1.8], [-0.7, 3], { n: 'R_2', side: 'l' }], ['gnd', [-0.7, 3]],
  ];
  const A3Fig = [
    ['w', [1, -1], [3, -1]], ['rail', [2, -1], { n: 'V_{DD}' }],
    ['pmos', [1, 0], { n: 'M_3', flip: true, dc: true }], ['pmos', [3, 0], { n: 'M_4' }],
    ['node', [1, 1], { n: 'v_1', side: 'l' }],
    ['nmos', [1, 2], { n: 'M_1' }], ['gnd', [1, 3]], ['w', [0, 2], [-0.5, 2], [-0.5, 2.3]], ...vin(-0.5, 2.3),
    ['w', [3, 1], [3.9, 1]], out([3.9, 1], 'v_{out}'),
    ['nmos', [3, 2], { n: 'M_2', flip: true }], ['w', [4, 2], [4.4, 2]], ['term', [4.4, 2], { n: 'v_{in}', side: 'r' }],
    ['R', [3, 3], [3, 4.2], { n: 'R_S' }], ['gnd', [3, 4.2]],
  ];

  const A = [
    R(md`
      **New practice exam A.** 60 minutes, three problems, 100 points. **No calculator** (Practice 1 and 2 say the same): every number here comes out clean by hand.

      ${params}

      Unless a problem says otherwise, every transistor is in saturation, $g_mr_{ds} \gg 1$, and you may **not** set $r_{ds} = \infty$. Sign convention (Lectures 15–16): $G_M$ is the short-circuit current pulled **down into** the stage per volt of input, and $A_v = -G_MR_{out}$.

      ${howto}
    `),
    P({
      id: 'e2ma-1a', src: 'New practice exam A · Problem 1(a) (10 pts)', title: 'A black box from two measurements', big: true,
      q: md`A black-box amplifier is driven by $v_{in} = 20\,\text{mV}$. With its output port open, $v_{out} = -400\,\text{mV}$. A $4\kO$ resistor across the output port drops it to $v_{out} = -200\,\text{mV}$. Find the open-circuit gain $A_v$, the output resistance $R_{out}$, the short-circuit transconductance $G_M$, and the gain with a $1\kO$ load instead.`,
      fig: A1aFig,
      parts: [{ lbl: 'A_v\\ (\\text{open})', unit: '', ans: -20 }, { lbl: 'R_{out}', unit: 'kΩ', ans: 4 }, { lbl: 'G_M', unit: 'mA/V', ans: 5 }, { lbl: 'A_v\\ (1\\,\\text{k}\\Omega\\ \\text{load})', unit: '', ans: -4 }],
      hints: [
        md`Any linear amplifier's output port is a Thévenin source $A_vv_{in}$ behind $R_{out}$ (or a Norton current $G_Mv_{in}$ in parallel with $R_{out}$).`,
        md`The load halved the voltage. A divider $\dfrac{R_L}{R_L + R_{out}}$ equals $\tfrac12$ when?`,
      ],
      sol: md`
        **What to see first.** Two measurements, two unknowns of a Thévenin model: the open-circuit voltage is $A_vv_{in}$, the loaded one is that voltage divided by $R_{out}$ and $R_L$.

        **Open circuit:** $A_v = \dfrac{-400}{20} = -20$.

        **Loaded:** $\dfrac{R_L}{R_L + R_{out}} = \dfrac{-200}{-400} = \tfrac12 \Rightarrow R_{out} = R_L = 4\kO$.

        **Norton:** $A_v = -G_MR_{out} \Rightarrow G_M = \dfrac{20}{4\kO} = 5\,\text{mA/V}$ (positive: it pulls current down, an inverting stage).

        **$1\kO$ load:** $A_v = -G_M(R_{out}\parallel R_L) = -5\,\text{m}\times800 = -4$. Same thing as a divider: $-20\times\dfrac{1}{1 + 4} = -4$. ✓

        !!key Pattern
        A load across the output just parallels $R_{out}$: $A_{v,\text{loaded}} = -G_M(R_{out}\parallel R_L)$. "Halves the voltage" means $R_L = R_{out}$.
      `,
    }),
    P({
      id: 'e2ma-1b', src: 'New practice exam A · Problem 1(b) (10 pts)', title: 'CS stage with a PMOS diode load', big: true,
      q: md`$M_1$ ($W/L = 200/1$) has its gate at $V_B = 1.2\,\text{V}$ plus $v_{in}$; $M_2$ is a diode-connected PMOS ($W/L = 100/1$) to $V_{DD} = 3\,\text{V}$. Ignore $r_{ds}$. Find the DC output $V_{OUT}$, both transconductances and the gain.`,
      fig: A1bFig,
      parts: [{ lbl: 'V_{OUT}', unit: 'V', ans: 1.6 }, { lbl: 'g_{m1}', unit: 'mA/V', ans: 4 }, { lbl: 'g_{m2}', unit: 'mA/V', ans: 2 }, { lbl: 'A_v', unit: '', ans: -2 }],
      hints: [
        md`$M_1$ sets the current: $V_{ov1} = 0.2\,\text{V}$. The same current flows through $M_2$; find its $V_{SG}$.`,
        md`$g_m = 2I_D/V_{ov}$ for each. A diode-connected device is a resistor $1/g_m$ to small signals.`,
      ],
      sol: md`
        **What to see first.** A common-source stage whose load is a diode: $A_v = -g_{m1}\cdot\dfrac{1}{g_{m2}}$.

        **DC.** $I_D = \tfrac12(100\mu)(200)(0.2)^2 = 0.4\,\text{mA}$. $M_2$: $0.4\,\text{m} = \tfrac12(50\mu)(100)V_{ov2}^2 \Rightarrow V_{ov2} = 0.4\,\text{V}$, $V_{SG2} = 1.4\,\text{V}$, so $V_{OUT} = 3 - 1.4 = 1.6\,\text{V}$. Check $M_1$: $V_{DS} = 1.6 \ge 0.2$ ✓.

        **Small signal.** $g_{m1} = \dfrac{2(0.4\,\text{m})}{0.2} = 4\,\text{mA/V}$, $g_{m2} = \dfrac{2(0.4\,\text{m})}{0.4} = 2\,\text{mA/V}$.
        $$A_v = -\frac{g_{m1}}{g_{m2}} = -2$$

        **Sanity:** same current, so $g_m \propto 1/V_{ov}$: the diode with twice the overdrive has half the $g_m$, and the gain is the overdrive ratio $0.4/0.2 = 2$.

        !!key Pattern
        Diode load: $|A_v| = g_{m1}/g_{m2} = V_{ov2}/V_{ov1}$ at equal currents. Small gains, but set by geometry, not by $r_{ds}$.
      `,
    }),
    P({
      id: 'e2ma-1c', src: 'New practice exam A · Problem 1(c) (10 pts)', title: 'Common gate with a source resistance', big: true,
      q: md`$W/L = 500/1$, the gate is held at $2\,\text{V}$, a $1\,\text{mA}$ source biases the source, and $v_{in}$ reaches the source through an infinite capacitor and $R_S = 100\,\Omega$. The output is coupled to $R_L = 2\kO$. Ignore $r_{ds}$. Find $g_m$, the resistance looking into the source of the transistor ($R_{in}$, not counting $R_S$), and $A_v$.`,
      fig: A1cFig,
      parts: [{ lbl: 'g_m', unit: 'mA/V', ans: 10 }, { lbl: 'R_{in}', unit: 'Ω', ans: 100 }, { lbl: 'A_v', unit: '', ans: 5 }],
      hints: [
        md`$I_D = 1\,\text{mA}$ is forced by the source; $V_{ov} = \sqrt{1\,\text{m}/25\,\text{m}}$.`,
        md`The $1\,\text{mA}$ source is an open circuit to small signals. $R_S$ and $R_{in} = 1/g_m$ form a divider for $v_s$.`,
        md`Load at the drain: $R_D\parallel R_L$ (the capacitor is a short to signals).`,
      ],
      sol: md`
        **What to see first.** Common gate: the input drives the **source**, the output is at the **drain**, gain is non-inverting.

        **DC.** $K = \tfrac12(100\mu)(500) = 25\,\text{mA/V}^2$, so $V_{ov} = 0.2\,\text{V}$ and $V_S = 2 - 1.2 = 0.8\,\text{V}$. $V_D = 5 - (1\,\text{m})(2\kO) = 3\,\text{V} \ge V_G - V_T = 1$ ✓ (saturated).

        **Small signal.** $g_m = \dfrac{2(1\,\text{m})}{0.2} = 10\,\text{mA/V}$. Looking into the source with $r_{ds} \to \infty$: $R_{in} = 1/g_m = 100\,\Omega$.

        The source node sees $v_{in}$ through $R_S$ and $1/g_m$ into the transistor: $v_s = v_{in}\cdot\dfrac{100}{100 + 100} = \tfrac12v_{in}$. The whole signal current $g_mv_s$ comes out of the drain into $R_D\parallel R_L = 1\kO$:
        $$A_v = +\frac{g_m(R_D\parallel R_L)}{1 + g_mR_S} = \frac{10\,\text{m}\times1\,\text{k}}{2} = +5$$

        **Sign check:** $v_{in}$ up raises the source, $v_{gs}$ falls, less current is pulled through $R_D$, so $v_{out}$ rises. ✓

        !!key Pattern
        Common gate $= $ degenerated CS with the input moved to the bottom of $R_S$: same magnitude $\dfrac{g_mR_D}{1 + g_mR_S}$, opposite sign.
      `,
    }),
    P({
      id: 'e2ma-2a', src: 'New practice exam A · Problem 2(a) (15 pts)', title: 'A cascode sitting on a diode', big: true,
      q: md`Find $R_{EQ1}$, looking into the drain of $M_2$. Gates marked with the triangle are incremental grounds. All devices saturated, $g_mr_{ds} \gg 1$, $r_{ds} \ne \infty$.`,
      fig: A2aFig,
      parts: [ex('rds2 + (1 + gm2*rds2)*((rds1 + RS + gm1*rds1*RS) || (1/gm3 || rds3))', ['gm1', 'rds1', 'RS', 'gm2', 'rds2', 'gm3', 'rds3'], 'R_{EQ1}')],
      hints: [
        md`$M_2$ is a gate-grounded device: $R_{EQ1} = r_{ds2} + R_X(1 + g_{m2}r_{ds2})$, where $R_X$ is everything hanging on its source.`,
        md`At $X$: looking down $M_1$ (degenerated drain) in parallel with the diode $M_3$. Which one is tiny?`,
        md`With $R_X \approx 1/g_{m3}$, the $r_{ds2}$ term is **not** negligible next to $g_{m2}r_{ds2}R_X$.`,
      ],
      sol: md`
        **What to see first.** Two canonical blocks: a **drain looking in, source degenerated by $R_X$**, and at $X$ a **diode** ($1/g_{m3}$) in parallel with a **degenerated drain** ($M_1$ with $R_S$).

        **Step 1, the source impedance of $M_2$.**
        $$R_X = \underbrace{(r_{ds1} + R_S + g_{m1}r_{ds1}R_S)}_{M_1\text{ looking down}}\ \Big\|\ \underbrace{\left(\tfrac{1}{g_{m3}}\parallel r_{ds3}\right)}_{\text{diode }M_3} \approx \frac{1}{g_{m3}}$$
        The huge $M_1$ impedance is shorted out by the diode.

        **Step 2, the degenerated drain.**
        $$R_{EQ1} = r_{ds2} + R_X(1 + g_{m2}r_{ds2}) \approx r_{ds2} + \frac{g_{m2}r_{ds2}}{g_{m3}} = r_{ds2}\left(1 + \frac{g_{m2}}{g_{m3}}\right)$$

        **Sanity check.** If $M_2$ and $M_3$ match, $R_{EQ1} \approx 2r_{ds}$: barely more than one transistor. A cascode only multiplies resistance when there is a **large** resistance under its source.

        !!trap Do not drop $r_{ds2}$ here
        "$R_{DN} \approx g_mr_{ds}R_S$" assumes $g_mR_S \gg 1$. With $R_S = 1/g_{m3}$ that product is about 1, so keep $r_{ds}(1 + g_mR_S)$.

        !!key Pattern
        Looking into a drain: $r_{ds}(1 + g_mR_{source})$. A diode at the source makes it $\approx r_{ds}(1 + g_{m2}/g_{m3})$.
      `,
    }),
    P({
      id: 'e2ma-2b', src: 'New practice exam A · Problem 2(b) (20 pts)', title: 'A gate fed from a divider on the drain', big: true,
      q: md`Find $R_{EQ2}$. $M_1$'s gate sits in the middle of the divider $R_1$, $R_2$ hung from the output node; $M_2$ (PMOS, gate at incremental ground) has $R_3$ at its source.`,
      fig: A2bFig,
      parts: [ex('(rds2 + R3 + gm2*rds2*R3) || (R1 + R2) || ((rds1 + RS + gm1*rds1*RS)/(1 + gm1*rds1*R2/(R1 + R2)))', ['gm1', 'rds1', 'RS', 'R1', 'R2', 'gm2', 'rds2', 'R3'], 'R_{EQ2}', { ranges: { R1: [1e3, 5e3], R2: [2e3, 1e4] } })],
      hints: [
        md`Three branches leave the node: up through $M_2$, down through the divider, down through $M_1$. $R_{EQ2} = R_{UP}\parallel(R_1 + R_2)\parallel R_{DN}$.`,
        md`The gate draws no current, so $v_g = Kv_x$ with $K = \dfrac{R_2}{R_1 + R_2}$ exactly.`,
        md`HW 5's rule: a drain whose gate moves by $Kv_x$ looks like $\dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$.`,
      ],
      sol: md`
        **What to see first.** A **degenerated PMOS drain** looking up, a **resistor string**, and an NMOS **drain whose gate follows the test voltage** (the $K$ rule).

        **$R_{UP}$** (gate grounded, $R_3$ at the source): $R_{UP} = r_{ds2} + R_3 + g_{m2}r_{ds2}R_3 \approx g_{m2}r_{ds2}R_3$. Huge.

        **Divider:** $R_1 + R_2$ to ground.

        **$R_{DN}$.** Apply $v_x$. The gate sees $v_g = Kv_x$, $K = \dfrac{R_2}{R_1 + R_2}$; the source sits on $R_S$. KCL with $v_s = i R_S$:
        $$i = g_{m1}(Kv_x - iR_S) + \frac{v_x - iR_S}{r_{ds1}} \;\Rightarrow\; R_{DN} = \frac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K} \approx \frac{R_S + 1/g_{m1}}{K}$$

        **Answer.**
        $$R_{EQ2} = \left(r_{ds2} + R_3 + g_{m2}r_{ds2}R_3\right)\ \Big\|\ (R_1 + R_2)\ \Big\|\ \frac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}\frac{R_2}{R_1 + R_2}}$$

        **Why it is small.** Without the divider, $M_1$ would look like $g_{m1}r_{ds1}R_S$. Tying the gate to the drain turns it into a degenerated diode: $(R_S + 1/g_{m1})$, scaled up by $1/K$ because the gate only sees a fraction of $v_x$. $K = 1$ is an ordinary diode; $K = 0$ gives back the high-impedance drain.

        !!key Pattern
        Gate moves with the drain by $K$: $R_{DN} = \dfrac{r_{ds}(1 + g_mR_S)}{1 + g_mr_{ds}K} \approx \dfrac{1/g_m + R_S}{K}$.
      `,
    }),
    P({
      id: 'e2ma-3', src: 'New practice exam A · Problem 3 (35 pts)', title: 'Two paths that fight at one output', big: true,
      q: md`$v_{in}$ drives $M_1$ (whose load is the diode $M_3$, mirrored by $M_4$) and also the gate of $M_2$ directly. Find $A_1 = v_1/v_{in}$ (10 pts), the short-circuit transconductance $G_M$ at $v_{out}$ (10 pts), $R_{out}$ (5 pts) and $A_v = v_{out}/v_{in}$ (10 pts).`,
      fig: A3Fig,
      parts: [
        ex('-gm1*(1/gm3 || rds3 || rds1)', ['gm1', 'rds1', 'gm3', 'rds3'], 'A_1'),
        ex('gm2/(1 + (gm2 + 1/rds2)*RS) - gm1*gm4*(1/gm3 || rds3 || rds1)', ['gm1', 'rds1', 'gm2', 'rds2', 'RS', 'gm3', 'rds3', 'gm4'], 'G_M', { ranges: { RS: [5e3, 2e4] } }),
        ex('rds4 || (rds2 + RS + gm2*rds2*RS)', ['gm2', 'rds2', 'RS', 'rds4'], 'R_{out}', { ranges: { RS: [5e3, 2e4] } }),
        ex('-(gm2/(1 + (gm2 + 1/rds2)*RS) - gm1*gm4*(1/gm3 || rds3 || rds1))*(rds4 || (rds2 + RS + gm2*rds2*RS))', ['gm1', 'rds1', 'gm2', 'rds2', 'RS', 'gm3', 'rds3', 'gm4', 'rds4'], 'A_v', { ranges: { RS: [5e3, 2e4] } }),
      ],
      hints: [
        md`$v_1$: a CS stage ($M_1$) loaded by a diode ($M_3$). The gate of $M_4$ draws nothing.`,
        md`Short $v_{out}$. Two currents leave the node: $M_2$ pulls a degenerated-CS current down; $M_4$ pushes $-g_{m4}v_1$ in. Watch the signs.`,
        md`$R_{out}$: looking up into $M_4$'s drain ($r_{ds4}$, its gate is fixed once $v_{in} = 0$) in parallel with looking down into $M_2$'s degenerated drain.`,
      ],
      sol: md`
        **What to see first.** Two paths from $v_{in}$ to $v_{out}$: **CS into a diode, then a mirror** ($M_1 \to M_3 \to M_4$), and a **degenerated CS** ($M_2$) straight to the output. Find each path's current into the shorted output and add them.

        **$A_1$.** $v_1 = -g_{m1}v_{in}\left(\tfrac{1}{g_{m3}}\parallel r_{ds3}\parallel r_{ds1}\right)$, so
        $$A_1 = -g_{m1}\left(\frac{1}{g_{m3}}\parallel r_{ds3}\parallel r_{ds1}\right) \approx -\frac{g_{m1}}{g_{m3}}$$

        **$G_M$** (output shorted, current pulled **down** out of $v_{out}$):
        - $M_2$ pulls $G_{m2}v_{in}$ with $G_{m2} = \dfrac{g_{m2}}{1 + (g_{m2} + 1/r_{ds2})R_S} \approx \dfrac{g_{m2}}{1 + g_{m2}R_S}$.
        - $M_4$ (PMOS, source at $V_{DD}$) sends $g_{m4}v_{sg4} = -g_{m4}v_1$ **into** the node, i.e. it pulls $g_{m4}v_1 = g_{m4}A_1v_{in}$ down.
        $$G_M = \frac{g_{m2}}{1 + (g_{m2} + \frac{1}{r_{ds2}})R_S} - g_{m1}g_{m4}\left(\frac{1}{g_{m3}}\parallel r_{ds3}\parallel r_{ds1}\right) \approx \frac{g_{m2}}{1 + g_{m2}R_S} - \frac{g_{m1}g_{m4}}{g_{m3}}$$

        **$R_{out}$.** With $v_{in} = 0$, $v_1 = 0$ too, so $M_4$ is a plain current source:
        $$R_{out} = r_{ds4}\ \Big\|\ \left(r_{ds2} + R_S + g_{m2}r_{ds2}R_S\right)$$

        **$A_v = -G_MR_{out}$.**
        $$A_v = \left[\frac{g_{m1}g_{m4}}{g_{m3}} - \frac{g_{m2}}{1 + g_{m2}R_S}\right]\left(r_{ds4}\parallel r_{ds2}(1 + g_{m2}R_S)\right)$$

        **Sign check.** $v_{in}$ up: $M_1$ pulls harder, $v_1$ falls, $M_4$ pushes **more** current into the output (up). $M_2$ pulls **more** current out (down). The paths subtract. With the degeneration, the mirror path wins, so the stage is non-inverting.

        !!key Pattern
        Several paths into one output: find each path's short-circuit current, add them with signs, multiply by the one $R_{out}$. A path through a diode and a mirror inverts twice (non-inverting at the output); a direct NMOS pull-down inverts once.
      `,
    }),
  ];

  // ================================================================== Practice exam B
  const B1Fig = [
    ['w', [0, -3], [5, -3]], ['rail', [2.5, -3], { n: 'V_{DD} = 5\\,\\text{V}' }],
    ['I', [0, -3], [0, -1.8], { s: '100\\,\\mu\\text{A}', side: 'l' }], ['w', [0, -1.8], [0, 1]],
    ['nmos', [0, 2], { n: 'M_0', sz: '1x', flip: true, dc: true }], ['gnd', [0, 3]],
    ['w', [1, 2], [2, 2]], ['nmos', [3, 2], { n: 'M_1', sz: '4x' }], ['gnd', [3, 3]],
    ['node', [3, 1], { n: 'V_A', side: 'r' }],
    ['nmos', [3, 0], { n: 'M_2', sz: '1x' }], ['w', [2, 0], [1.6, 0]], ['term', [1.6, 0], { n: 'V_B', side: 'l' }],
    ['node', [3, -1], { n: 'V_X', side: 'l' }],
    ['pmos', [3, -2], { n: 'M_3', sz: '8x', flip: true, dc: true }],
    ['pmos', [5, -2], { n: 'M_4', sz: '4x' }], ['w', [5, -1], [5.8, -1]], ['term', [5.8, -1], { n: 'V_{OUT}', side: 'r' }],
    ['R', [5, -1], [5, 0.4], { n: 'R' }], ['gnd', [5, 0.4]],
  ];
  const B2aFig = [
    ['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_1' }],
    ['pmos', [1, 0], { n: 'M_1' }], acgL(0, 0), ['node', [1, 1], { n: 'Z', side: 'l' }],
    ['w', [1, 1], [2.2, 1]], ['R', [2.2, 1], [2.2, 2.2], { n: 'R_2' }], ['gnd', [2.2, 2.2]],
    ['pmos', [1, 2], { n: 'M_2' }], acgL(0, 2), ['w', [1, 3], [1, 3.4]], lookUp([1, 3.4], 'R_{EQ1}'),
  ];
  const B2bFig = [
    ['w', [1, 0], [1, -0.5]], lookDn([1, -0.5], 'R_{EQ2}'), ['w', [1, 0], [3, 0], [3, 2]],
    ['nmos', [1, 1], { n: 'M_1' }], acgL(0, 1), ['node', [1, 2], { n: 'X', side: 'l' }],
    ['nmos', [1, 3], { n: 'M_2', flip: true, dc: true }], ['gnd', [1, 4]],
    ['nmos', [3, 3], { n: 'M_3' }], ['R', [3, 4], [3, 5.2], { n: 'R_S' }], ['gnd', [3, 5.2]],
  ];
  const B3Fig = [
    ['w', [1, -3], [3, -3]], ['rail', [2, -3], { n: 'V_{DD}' }],
    ['pmos', [1, -2], { n: 'M_2' }], acgL(0, -2), ['w', [1, -1], [1, 0]],
    ['node', [1, 0], { n: 'v_1', side: 'l' }],
    ['nmos', [1, 1], { n: 'M_1' }], acgL(0, 1),
    ['Vac', [1, 2], [1, 3.2], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 3.2]], ['txt', [1.25, 2.25], '$\\uparrow R_{in}$', { a: 'l' }],
    ['w', [1, 0], [2, 0]], ['nmos', [3, 0], { n: 'M_3' }], ['R', [3, 1], [3, 2.2], { n: 'R_S' }], ['gnd', [3, 2.2]],
    ['pmos', [3, -2], { n: 'M_4', dc: true }], ['w', [3, -1], [3.9, -1]], out([3.9, -1], 'v_{out}'),
  ];

  const B = [
    R(md`
      **New practice exam B.** 60 minutes, three problems, 100 points. **No calculator.**

      ${params}

      Problem 1 is DC (where the square law lives); Problems 2 and 3 are small-signal with $g_mr_{ds} \gg 1$ and $r_{ds} \ne \infty$. $G_M$ is the short-circuit current pulled down into the stage; $A_v = -G_MR_{out}$.

      ${howto}
    `),
    P({
      id: 'e2mb-1a', src: 'New practice exam B · Problem 1(a) (15 pts)', title: 'Mirrors, a cascode and a PMOS mirror', big: true,
      q: md`$1x = 50/1$ (NMOS and PMOS alike). Assuming every transistor is saturated, find the current $I_1$ in $M_1$, the voltage $V_X$, and the current $I_4$ in $M_4$.`,
      fig: B1Fig,
      parts: [{ lbl: 'I_1', unit: 'µA', ans: 400 }, { lbl: 'V_X', unit: 'V', ans: 3.8 }, { lbl: 'I_4', unit: 'µA', ans: 200 }],
      hints: [
        md`$M_0$ and $M_1$ share $V_{GS}$: current scales with size. $M_2$ and $M_3$ are in series with $M_1$, so they carry $I_1$ too.`,
        md`$M_3$ is a diode: invert the PMOS square law for $V_{SG3}$. $K_{1x,P} = \tfrac12(50\mu)(50) = 1.25\,\text{mA/V}^2$.`,
        md`$M_4$ shares $V_{SG}$ with $M_3$: $I_4 = I_1\times\dfrac{4}{8}$.`,
      ],
      sol: md`
        **What to see first.** An NMOS mirror ($M_0 \to M_1$) sets the stack current; a PMOS mirror ($M_3 \to M_4$) copies it to the output. $M_2$ is a cascode: it passes $I_1$ and only its gate voltage matters.

        **$I_1$.** $K_{0} = \tfrac12(100\mu)(50) = 2.5\,\text{mA/V}^2$: $V_{ov0} = \sqrt{100\mu/2.5\text{m}} = 0.2\,\text{V}$. $M_1$ is $4\times$ wider at the same $V_{GS}$: $I_1 = 400\,\mu\text{A}$.

        **$V_X$.** $M_3$ ($8x$): $K_3 = 8\times1.25\,\text{m} = 10\,\text{mA/V}^2$, $V_{ov3} = \sqrt{0.4\,\text{m}/10\,\text{m}} = 0.2\,\text{V}$, $V_{SG3} = 1.2\,\text{V}$, so $V_X = 5 - 1.2 = 3.8\,\text{V}$.

        **$I_4$.** Same $V_{SG}$, half the width: $I_4 = 400\,\mu\times\dfrac{4}{8} = 200\,\mu\text{A}$. (Check: $K_4 = 5\,\text{mA/V}^2$, $5\,\text{m}\times0.2^2 = 200\,\mu\text{A}$ ✓.)

        !!key Pattern
        Mirror: same $V_{GS}$, current $\propto W/L$. Series: same current, $V_{ov} \propto 1/\sqrt{W/L}$.
      `,
    }),
    P({
      id: 'e2mb-1b', src: 'New practice exam B · Problem 1(b) (10 pts)', title: 'Largest load before M4 leaves saturation',
      q: md`Same circuit. What is the largest $R$ that keeps $M_4$ in saturation?`,
      fig: B1Fig,
      parts: [{ lbl: 'R_{max}', unit: 'kΩ', ans: 24 }],
      hints: [md`PMOS saturation, node form: $V_D \le V_G + |V_T|$. Here $V_G = V_X$.`],
      sol: md`
        $M_4$ saturated $\iff V_{OUT} \le V_X + 1 = 4.8\,\text{V}$ (equivalently $V_{SD4} \ge V_{ov4} = 0.2\,\text{V}$).

        $V_{OUT} = I_4R = (200\,\mu)R \le 4.8 \Rightarrow R_{max} = 24\kO$.

        **Intuition:** a bigger $R$ pushes the drain up toward the source. When only $V_{ov}$ is left across the device, the mirror stops being a current source.
      `,
    }),
    P({
      id: 'e2mb-1c', src: 'New practice exam B · Problem 1(c) (10 pts)', title: 'The window for the cascode bias', big: true,
      q: md`Find the smallest and largest $V_B$ that keep both $M_1$ and $M_2$ in saturation.`,
      fig: B1Fig,
      parts: [{ lbl: 'V_{B,min}', unit: 'V', ans: 1.6 }, { lbl: 'V_{B,max}', unit: 'V', ans: 4.8 }],
      hints: [
        md`$M_2$ carries $400\,\mu\text{A}$ as $1x$: its $V_{GS2}$ is fixed, so $V_A = V_B - V_{GS2}$.`,
        md`$M_1$ needs $V_A \ge V_{G1} - V_T$. $M_2$ needs $V_X \ge V_B - V_T$.`,
      ],
      sol: md`
        $M_2$ ($1x$, $K = 2.5\,\text{mA/V}^2$) at $400\,\mu\text{A}$: $V_{ov2} = \sqrt{0.16} = 0.4\,\text{V}$, $V_{GS2} = 1.4\,\text{V}$, so $V_A = V_B - 1.4$.

        **$M_1$ saturated:** $V_A \ge V_{G1} - V_T = 1.2 - 1 = 0.2 \Rightarrow V_B \ge 1.6\,\text{V}$.

        **$M_2$ saturated:** $V_X \ge V_B - V_T \Rightarrow 3.8 \ge V_B - 1 \Rightarrow V_B \le 4.8\,\text{V}$.

        So $1.6\,\text{V} \le V_B \le 4.8\,\text{V}$. Too low and the cascode squeezes $M_1$ into triode; too high and $M_2$ itself runs out of headroom under the diode.

        !!key Pattern
        A cascode's source rides $V_{GS}$ below its gate. Bias it so the device under it keeps $V_{ov}$ across it, and so its own drain stays above $V_G - V_T$.
      `,
    }),
    P({
      id: 'e2mb-2a', src: 'New practice exam B · Problem 2(a) (15 pts)', title: 'PMOS cascode with a bleed resistor', big: true,
      q: md`Find $R_{EQ1}$, looking up into the drain of $M_2$. $R_2$ connects the middle node $Z$ to ground. All gates shown with triangles are incremental grounds.`,
      fig: B2aFig,
      parts: [ex('rds2 + (1 + gm2*rds2)*(R2 || (rds1 + R1 + gm1*rds1*R1))', ['gm1', 'rds1', 'R1', 'R2', 'gm2', 'rds2'], 'R_{EQ1}', { ranges: { R1: [5e3, 2e4] } })],
      hints: [
        md`PMOS or NMOS, the small-signal model is the same: $M_2$ looking into its drain is $r_{ds2} + R_Z(1 + g_{m2}r_{ds2})$.`,
        md`At $Z$: $R_2$ in parallel with looking into $M_1$'s drain (degenerated by $R_1$). Which one wins?`,
      ],
      sol: md`
        **What to see first.** Upside-down NMOS: a **drain looking in with a degenerated source**, where the "source resistor" is everything at $Z$.

        **At $Z$.** Looking into $M_1$'s drain: $r_{ds1} + R_1 + g_{m1}r_{ds1}R_1 \approx g_{m1}r_{ds1}R_1$, enormous. $R_2$ is in parallel with it and wins:
        $$R_Z = R_2\parallel\left(r_{ds1} + R_1 + g_{m1}r_{ds1}R_1\right) \approx R_2$$

        **Answer.**
        $$R_{EQ1} = r_{ds2} + (1 + g_{m2}r_{ds2})R_Z \approx r_{ds2}(1 + g_{m2}R_2)$$

        **Intuition.** $M_2$ multiplies whatever sits under its source by $g_{m2}r_{ds2}$. A small bleed resistor at $Z$ throws away the boost $M_1$ could have given (it would have been $\approx g_{m2}r_{ds2}\cdot g_{m1}r_{ds1}R_1$).

        !!key Pattern
        Parallel impedances at a cascode's source: the smallest one sets the result.
      `,
    }),
    P({
      id: 'e2mb-2b', src: 'New practice exam B · Problem 2(b) (15 pts)', title: 'A mirror that feeds back', big: true,
      q: md`Find $R_{EQ2}$. $M_2$ is diode-connected; $M_3$ shares its gate with $M_2$ and has $R_S$ at its source; $M_1$'s gate is an incremental ground.`,
      fig: B2bFig,
      parts: [ex('(rds3 + RS + gm3*rds3*RS) || ((rds1 + (1 + gm1*rds1)/(gm2 + 1/rds2))/(1 + gm3/((1 + (gm3 + 1/rds3)*RS)*(gm2 + 1/rds2))))', ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'RS'], 'R_{EQ2}')],
      hints: [
        md`Two branches: $M_3$ straight down, and $M_1$ into the diode. Find the current $i_1$ in the $M_1$ branch first.`,
        md`All of $i_1$ flows into the diode, so $v_X = i_1/(g_{m2} + 1/r_{ds2})$. That voltage is $M_3$'s gate.`,
        md`$M_3$ adds $G_{m3}v_X$, with $G_{m3} = \dfrac{g_{m3}}{1 + (g_{m3} + 1/r_{ds3})R_S}$, on top of $v_x/R_{d3}$.`,
      ],
      sol: md`
        **What to see first.** A **cascode on a diode** ($M_1$ over $M_2$), and a **degenerated CS** ($M_3$) whose gate is the diode node. The test current that goes down $M_1$ steers $M_3$: feedback, so the impedance drops.

        **$M_1$ branch.** $R_X = \dfrac{1}{g_{m2} + 1/r_{ds2}}$ (diode). Looking into $M_1$'s drain:
        $$R_{M1} = r_{ds1} + R_X(1 + g_{m1}r_{ds1}) \approx r_{ds1}\left(1 + \frac{g_{m1}}{g_{m2}}\right),\qquad i_1 = \frac{v_x}{R_{M1}},\quad v_X = i_1R_X$$

        **$M_3$ branch** (superposition, exact because it is linear): $i_3 = G_{m3}v_X + \dfrac{v_x}{R_{d3}}$, with $R_{d3} = r_{ds3} + R_S + g_{m3}r_{ds3}R_S$.

        **Total.** $i_x = i_1(1 + G_{m3}R_X) + \dfrac{v_x}{R_{d3}}$:
        $$R_{EQ2} = R_{d3}\ \Big\|\ \frac{R_{M1}}{1 + G_{m3}R_X} \approx r_{ds3}(1 + g_{m3}R_S)\ \Big\|\ \frac{r_{ds1}(1 + g_{m1}/g_{m2})}{1 + \dfrac{g_{m3}/g_{m2}}{1 + g_{m3}R_S}}$$

        **Sanity.** With $R_S = 0$ and matched devices: $R_{d3} = r_{ds}$ and the left branch is $2r_{ds}/2 = r_{ds}$, so $R_{EQ2} \approx r_{ds}/2$. The mirror copies $M_1$'s current into $M_3$, doubling the current for the same $v_x$.

        !!key Pattern
        A gate driven by a node your test current flows through: find that node's voltage per unit test current, then the extra transistor adds $G_m\times$(that) in parallel.
      `,
    }),
    P({
      id: 'e2mb-3', src: 'New practice exam B · Problem 3 (35 pts)', title: 'Common gate into a degenerated CS', big: true,
      q: md`$M_1$ is a common-gate stage driven at its source by an ideal source $v_{in}$, loaded by the PMOS current source $M_2$. Its output $v_1$ drives $M_3$ (degenerated by $R_S$) whose load is the diode $M_4$. Find $R_{in}$ looking into $M_1$'s source (8 pts), $A_1 = v_1/v_{in}$ (9 pts), $A_2 = v_{out}/v_1$ (9 pts) and $A_v$ (9 pts).`,
      fig: B3Fig,
      parts: [
        ex('(rds1 + rds2)/(1 + gm1*rds1)', ['gm1', 'rds1', 'rds2'], 'R_{in}'),
        ex('(1 + gm1*rds1)*rds2/(rds1 + rds2)', ['gm1', 'rds1', 'rds2'], 'A_1'),
        ex('-(gm3/(1 + (gm3 + 1/rds3)*RS))*((rds3 + RS + gm3*rds3*RS) || 1/(gm4 + 1/rds4))', ['gm3', 'rds3', 'RS', 'gm4', 'rds4'], 'A_2'),
        ex('(1 + gm1*rds1)*rds2/(rds1 + rds2)*(-(gm3/(1 + (gm3 + 1/rds3)*RS))*((rds3 + RS + gm3*rds3*RS) || 1/(gm4 + 1/rds4)))', ['gm1', 'rds1', 'rds2', 'gm3', 'rds3', 'RS', 'gm4', 'rds4'], 'A_v'),
      ],
      hints: [
        md`Looking into a source: $\dfrac{r_{ds} + R_{\text{drain}}}{1 + g_mr_{ds}}$. Here the drain load is $r_{ds2}$, not a small resistor.`,
        md`$A_1$: $v_1$ sees $r_{ds1}\parallel r_{ds2}$ and the source pushes $(g_{m1} + 1/r_{ds1})v_{in}$ into it.`,
        md`$A_2 = -G_{m3}(R_{d3}\parallel R_{diode4})$. $M_3$'s gate loads nothing, so $A_v = A_1A_2$.`,
      ],
      sol: md`
        **What to see first.** Stage 1: **common gate with a current-source load**. Stage 2: **degenerated CS with a diode load**. The stages do not load each other (a gate is an open circuit), so the gains multiply.

        **$R_{in}$.** Looking into a source with drain load $R_D$: $\dfrac{r_{ds1} + R_D}{1 + g_{m1}r_{ds1}}$. Here $R_D = r_{ds2}$:
        $$R_{in} = \frac{r_{ds1} + r_{ds2}}{1 + g_{m1}r_{ds1}} \approx \frac{1}{g_{m1}}\left(1 + \frac{r_{ds2}}{r_{ds1}}\right)$$
        About $2/g_{m1}$ for matched $r_{ds}$, **not** $1/g_m$. (With an ideal current-source load it would be infinite.)

        **$A_1$.** KCL at $v_1$: $-\dfrac{v_1}{r_{ds2}} = g_{m1}(0 - v_{in}) + \dfrac{v_1 - v_{in}}{r_{ds1}}$, so
        $$A_1 = \left(g_{m1} + \frac{1}{r_{ds1}}\right)(r_{ds1}\parallel r_{ds2}) = \frac{(1 + g_{m1}r_{ds1})r_{ds2}}{r_{ds1} + r_{ds2}} \approx g_{m1}(r_{ds1}\parallel r_{ds2})$$
        Positive and large: a common gate is non-inverting.

        **$A_2$.** $G_{m3} = \dfrac{g_{m3}}{1 + (g_{m3} + 1/r_{ds3})R_S}$, $R_{out} = (r_{ds3} + R_S + g_{m3}r_{ds3}R_S)\parallel\left(\tfrac{1}{g_{m4}}\parallel r_{ds4}\right) \approx \tfrac{1}{g_{m4}}$:
        $$A_2 = -G_{m3}R_{out} \approx -\frac{g_{m3}/g_{m4}}{1 + g_{m3}R_S}$$

        **$A_v = A_1A_2 \approx -g_{m1}(r_{ds1}\parallel r_{ds2})\cdot\dfrac{g_{m3}/g_{m4}}{1 + g_{m3}R_S}$.** One inversion, from the CS stage.

        !!key Pattern
        CG input resistance is $1/g_m$ only when the drain load is small. Put a current source on the drain and the input resistance grows to about $(1 + r_L/r_{ds})/g_m$.
      `,
    }),
  ];

  // ================================================================== Practice exam C
  const C1aFig = [
    ['w', [1, -1], [3, -1]], ['rail', [2, -1], { n: V(5) }],
    ['pmos', [1, 0], { n: 'M_1', sz: '250/1', flip: true, dc: true }], ['pmos', [3, 0], { n: 'M_2', sz: '1000/1' }],
    ['I', [1, 1], [1, 2.4], { s: '0.25\\,\\text{mA}', side: 'l' }], ['gnd', [1, 2.4]],
    ['w', [1, 1], [0.4, 1]], ['C', [0.4, 1], [-0.6, 1], { n: '\\infty' }], ['R', [-0.6, 1], [-1.8, 1], { n: 'R_S', s: '400\\,\\Omega' }],
    ['Vac', [-1.8, 1], [-1.8, 2.2], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.8, 2.2]],
    ['R', [3, 1], [3, 2.4], { n: 'R_D', s: '1\\kO' }], ['gnd', [3, 2.4]], ['w', [3, 1], [3.8, 1]], out([3.8, 1], 'v_{out}'),
  ];
  const C1bFig = [
    ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_d', side: 'r' }],
    ['nmos', [1, 1]], ['w', [1, 2], [1.8, 2]], ['term', [1.8, 2], { n: 'v_s', side: 'r' }],
    ['R', [1, 2], [1, 3.2], { n: 'R_S', s: '2\\kO' }], ['gnd', [1, 3.2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ...vin(-0.6, 1.3, 'v_g'),
  ];
  const C2aFig = [
    ['rail', [2, -1]], ['pmos', [2, 0], { n: 'M_3' }], acgL(1, 0),
    ['w', [2, 1], [3, 1]], look([3, 1], 'R_{EQ1}'),
    ['nmos', [2, 2], { n: 'M_1' }], ['R', [2, 3], [2, 4.2], { n: 'R_S' }], ['gnd', [2, 4.2]],
    ['w', [2, 1], [0.8, 1], [0.8, 1.4]], ['rail', [-0.2, 0.4]], ['nmos', [-0.2, 1.4], { n: 'M_2', flip: true }],
    ['R', [-0.2, 2.4], [-0.2, 3.6], { n: 'R', side: 'l' }], ['gnd', [-0.2, 3.6]],
    ['w', [1, 2], [0.4, 2], [0.4, 2.4], [-0.2, 2.4]],
  ];
  const C2bFig = [
    ['rail', [1, -3]], ['pmos', [1, -2], { n: 'M_3' }], acgL(0, -2),
    ['pmos', [1, 0], { n: 'M_2' }], acgL(0, 0),
    ['nmos', [1, 2], { n: 'M_1' }], acgL(0, 2),
    ['w', [1, 3], [2, 3]], look([2, 3], 'R_{EQ2}'),
    ['nmos', [1, 4], { n: 'M_4' }], acgL(0, 4), ['gnd', [1, 5]],
  ];
  const C3Fig = [
    ['w', [0, -2], [2, -2]], ['rail', [1, -2], { n: 'V_{DD}' }],
    ['pmos', [0, -1], { n: 'M_5' }], acgL(-1, -1), ['w', [0, 0], [0, 1]], ['node', [0, 0.5], { n: 'b', side: 'l' }],
    ['pmos', [2, -1], { n: 'M_4' }], acgL(1, -1),
    ['w', [2, 0], [2.9, 0]], out([2.9, 0], 'v_{out}'),
    ['w', [0, 1], [1, 1]], ['nmos', [2, 1], { n: 'M_2' }],
    ['node', [2, 2], { n: 'X', side: 'r' }],
    ['nmos', [0, 2], { n: 'M_3', flip: true }], ['w', [1, 2], [2, 2]], ['gnd', [0, 3]],
    ['nmos', [2, 3], { n: 'M_1', flip: true }], ['gnd', [2, 4]],
    ['w', [3, 3], [3.6, 3], [3.6, 3.4]], ...vin(3.6, 3.4),
  ];

  const Cx = [
    R(md`
      **New practice exam C** (a little harder than the official papers). 60 minutes, three problems, 100 points. A calculator is allowed but you should not need one.

      ${params}

      Every transistor is saturated; in Problems 2 and 3, $g_mr_{ds} \gg 1$ and $r_{ds} \ne \infty$. $G_M$ is the short-circuit current pulled down into the stage; $A_v = -G_MR_{out}$.

      ${howto}
    `),
    P({
      id: 'e2mc-1a', src: 'New practice exam C · Problem 1(a) (15 pts)', title: 'A PMOS mirror as an amplifier', big: true,
      q: md`$M_1$ (PMOS, $W/L = 250/1$) is diode-connected and biased by $0.25\,\text{mA}$; $v_{in}$ reaches its gate–drain node through an infinite capacitor and $R_S = 400\,\Omega$. $M_2$ ($W/L = 1000/1$) mirrors it into $R_D = 1\kO$. Ignore $r_{ds}$. Find $g_{m1}$, the DC current $I_2$, $g_{m2}$, and $A_v$.`,
      fig: C1aFig,
      parts: [{ lbl: 'g_{m1}', unit: 'mA/V', ans: 2.5 }, { lbl: 'I_2', unit: 'mA', ans: 1 }, { lbl: 'g_{m2}', unit: 'mA/V', ans: 10 }, { lbl: 'A_v', unit: '', ans: -5 }],
      hints: [
        md`$K_1 = \tfrac12(50\mu)(250) = 6.25\,\text{mA/V}^2$; $V_{ov1} = \sqrt{0.25/6.25}$.`,
        md`The input node sees $R_S$ in series from $v_{in}$, and the diode $1/g_{m1}$ to (incremental) $V_{DD}$. The current source is open.`,
        md`$M_2$ is $4\times$ wider at the same $V_{SG}$, so the same overdrive and $4\times$ the current.`,
      ],
      sol: md`
        **What to see first.** A **diode-connected input** (a $1/g_{m1}$ resistor) forms a divider with $R_S$; the mirror device $M_2$ is then a **CS stage** whose gate is that node.

        **DC.** $V_{ov1} = \sqrt{0.25/6.25} = 0.2\,\text{V}$, $g_{m1} = \dfrac{2(0.25\,\text{m})}{0.2} = 2.5\,\text{mA/V}$ ($1/g_{m1} = 400\,\Omega$). $M_2$: same $V_{SG}$, $4\times$ wider: $I_2 = 1\,\text{mA}$, $V_{ov2} = 0.2$, $g_{m2} = 10\,\text{mA/V}$. ($V_{OUT} = 1\,\text{V} \le V_G + 1 = 4.8$ ✓.)

        **Small signal.** $v_g = v_{in}\dfrac{1/g_{m1}}{R_S + 1/g_{m1}} = \tfrac12v_{in}$. Then $v_{out} = -g_{m2}v_gR_D$:
        $$A_v = -\frac{g_{m2}R_D}{1 + g_{m1}R_S} = -\frac{10\,\text{m}\times1\,\text{k}}{2} = -5$$

        **Sign check.** $v_{in}$ up lifts the PMOS gate, $v_{sg2}$ falls, less current into $R_D$: inverting. ✓

        !!key Pattern
        A mirror's input node is a $1/g_m$ resistor; a signal driven into it through $R_S$ is divided before the output device amplifies it by $g_{m2}R_D$.
      `,
    }),
    P({
      id: 'e2mc-1b', src: 'New practice exam C · Problem 1(b) (15 pts)', title: 'Reading a degenerated CS from three probes', big: true,
      q: md`In this degenerated common-source stage ($r_{ds} \to \infty$), probing gives $v_g = 100\,\text{mV}$, $v_s = 80\,\text{mV}$ and $v_d = -400\,\text{mV}$, with $R_S = 2\kO$. Find $i_d$, $g_m$, $R_D$ and $A_v = v_d/v_g$.`,
      fig: C1bFig,
      parts: [{ lbl: 'i_d', unit: 'µA', ans: 40 }, { lbl: 'g_m', unit: 'mA/V', ans: 2 }, { lbl: 'R_D', unit: 'kΩ', ans: 10 }, { lbl: 'A_v', unit: '', ans: -4 }],
      hints: [
        md`The same incremental current flows through $R_S$ and $R_D$ (no current into the gate).`,
        md`$g_m = i_d/v_{gs}$ with $v_{gs} = v_g - v_s$.`,
      ],
      sol: md`
        **What to see first.** One current, three voltages: $R_S$ gives the current, $v_g - v_s$ gives $v_{gs}$, $R_D$ is what turns the current into $v_d$.

        $i_d = v_s/R_S = 80\,\text{mV}/2\kO = 40\,\mu\text{A}$. $v_{gs} = 100 - 80 = 20\,\text{mV}$, so $g_m = 40\,\mu/20\,\text{m} = 2\,\text{mA/V}$.

        $R_D = -v_d/i_d = 400\,\text{mV}/40\,\mu\text{A} = 10\kO$, and $A_v = -400/100 = -4$.

        **Check with the formula:** $-\dfrac{g_mR_D}{1 + g_mR_S} = -\dfrac{2\,\text{m}\times10\,\text{k}}{1 + 4} = -4$ ✓. Note $v_s/v_g = \dfrac{g_mR_S}{1 + g_mR_S} = 0.8$: the source follows the gate, so only 20% of the input lands across $v_{gs}$.
      `,
    }),
    P({
      id: 'e2mc-2a', src: 'New practice exam C · Problem 2(a) (15 pts)', title: 'A follower drives the gate', big: true,
      q: md`Find $R_{EQ1}$. $M_2$ is a source follower from the output node to $M_1$'s gate, biased by $R$; $M_3$ is a PMOS current source.`,
      fig: C2aFig,
      parts: [ex('rds3 || ((rds1 + RS + gm1*rds1*RS)/(1 + gm1*rds1*gm2*(R || rds2)/(1 + gm2*(R || rds2))))', ['gm1', 'rds1', 'RS', 'gm2', 'rds2', 'R', 'rds3'], 'R_{EQ1}')],
      hints: [
        md`Find $K = v_{g1}/v_x$: the gain of a follower into $R\parallel r_{ds2}$.`,
        md`Then the $K$ rule: $R_{DN} = \dfrac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K}$.`,
      ],
      sol: md`
        **What to see first.** The $K$ rule again, but $K$ now comes from a **source follower** instead of a divider. Looking up: a **drain with a grounded gate**, $r_{ds3}$.

        **$K$.** Follower $M_2$ (drain at incremental ground) into $R\parallel r_{ds2}$:
        $$K = \frac{g_{m2}(R\parallel r_{ds2})}{1 + g_{m2}(R\parallel r_{ds2})} \approx \frac{R}{R + 1/g_{m2}}$$

        **$R_{DN}$.**
        $$R_{DN} = \frac{r_{ds1} + R_S + g_{m1}r_{ds1}R_S}{1 + g_{m1}r_{ds1}K} \approx \frac{R_S + 1/g_{m1}}{K} = \left(R_S + \frac{1}{g_{m1}}\right)\left(1 + \frac{1}{g_{m2}R}\right)$$

        **Answer.** $R_{EQ1} = r_{ds3}\parallel R_{DN} \approx R_{DN}$, a few hundred ohms to a few kilohms, although every device on the node is "high impedance".

        **Intuition.** The follower makes $M_1$ almost a diode: its gate tracks the drain with gain $K \approx 1$.

        !!key Pattern
        Gate tied to the drain through anything with gain $K$: the drain looks like a degenerated diode divided by $K$.
      `,
    }),
    P({
      id: 'e2mc-2b', src: 'New practice exam C · Problem 2(b) (20 pts)', title: 'Looking into a source with a cascode load', big: true,
      q: md`Find $R_{EQ2}$, looking into the node between $M_1$'s source and $M_4$'s drain. $M_2$, $M_3$ form a PMOS cascode load on $M_1$'s drain; all marked gates are incremental grounds.`,
      fig: C2bFig,
      parts: [ex('rds4 || ((rds1 + rds2 + rds3 + gm2*rds2*rds3)/(1 + gm1*rds1))', ['gm1', 'rds1', 'gm2', 'rds2', 'rds3', 'rds4'], 'R_{EQ2}')],
      hints: [
        md`Looking into a source: $\dfrac{r_{ds1} + R_D}{1 + g_{m1}r_{ds1}}$, where $R_D$ is what the drain sees.`,
        md`$R_D$ here is a cascode: $r_{ds2} + r_{ds3} + g_{m2}r_{ds2}r_{ds3}$.`,
      ],
      sol: md`
        **What to see first.** **Looking into a source** (the CG input), with a **cascode** as its drain load; in parallel, **looking into a drain** ($M_4$, $r_{ds4}$).

        **Drain load of $M_1$.** $R_D = r_{ds2} + r_{ds3} + g_{m2}r_{ds2}r_{ds3} \approx g_{m2}r_{ds2}r_{ds3}$.

        **Looking into $M_1$'s source.**
        $$R_{S1} = \frac{r_{ds1} + R_D}{1 + g_{m1}r_{ds1}} \approx \frac{g_{m2}r_{ds2}r_{ds3}}{g_{m1}r_{ds1}}$$
        The drain load is divided by $g_{m1}r_{ds1}$, but it was $g_mr_{ds}$ times bigger than $r_{ds}$ to begin with, so the result is of order $r_{ds}$, not $1/g_m$.

        **Answer.**
        $$R_{EQ2} = r_{ds4}\ \Big\|\ \frac{r_{ds1} + r_{ds2} + r_{ds3} + g_{m2}r_{ds2}r_{ds3}}{1 + g_{m1}r_{ds1}} \approx r_{ds4}\parallel\frac{g_{m2}r_{ds2}r_{ds3}}{g_{m1}r_{ds1}}$$
        Matched devices: $r_{ds}\parallel r_{ds} = r_{ds}/2$.

        !!trap The reflex "$1/g_m$ into a source"
        That is only true when the drain sees a small resistance. A transistor is an impedance **scaler**: from the source you see the drain load divided by $g_mr_{ds}$.
      `,
    }),
    P({
      id: 'e2mc-3', src: 'New practice exam C · Problem 3 (35 pts)', title: 'Gain-boosted cascode amplifier', big: true,
      q: md`$M_1$ is the input device, $M_2$ its cascode. $M_3$ (loaded by the PMOS current source $M_5$) senses $X$ and drives $M_2$'s gate. $M_4$ is the PMOS current-source load. Find the booster gain $A = -v_b/v_X$ (5 pts), $G_M$ (10 pts), $R_{out}$ (10 pts) and $A_v$ (10 pts).`,
      fig: C3Fig,
      parts: [
        ex('gm3*(rds3 || rds5)', ['gm3', 'rds3', 'rds5'], 'A'),
        ex('gm1*(gm2*(1 + gm3*(rds3 || rds5)) + 1/rds2)/(gm2*(1 + gm3*(rds3 || rds5)) + 1/rds1 + 1/rds2)', ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'rds5'], 'G_M'),
        ex('rds4 || (rds1 + rds2 + gm2*rds2*rds1*(1 + gm3*(rds3 || rds5)))', ['gm2', 'rds1', 'rds2', 'gm3', 'rds3', 'rds5', 'rds4'], 'R_{out}'),
        ex('-gm1*(gm2*(1 + gm3*(rds3 || rds5)) + 1/rds2)/(gm2*(1 + gm3*(rds3 || rds5)) + 1/rds1 + 1/rds2)*(rds4 || (rds1 + rds2 + gm2*rds2*rds1*(1 + gm3*(rds3 || rds5))))', ['gm1', 'rds1', 'gm2', 'rds2', 'gm3', 'rds3', 'rds5', 'rds4'], 'A_v'),
        { lbl: 'Which change raises $|A_v|$ the most?', mc: [
          'Replace $M_4$ with a cascoded PMOS current source.',
          'Double the booster gain $A$.',
          'Double $g_{m2}$.',
          'Remove the booster and ground $M_2$\'s gate.',
        ], a: 0, why: [null, '$R_{out}$ is already $\\approx r_{ds4}$: the NMOS side is far bigger, so more boost changes nothing.', '$g_{m2}$ only appears inside the already-huge NMOS impedance.', 'That lowers the NMOS side to $\\approx g_{m2}r_{ds2}r_{ds1}$, still much bigger than $r_{ds4}$: $|A_v|$ barely moves, and certainly does not rise.'] },
      ],
      hints: [
        md`The booster is a CS stage: $v_b = -g_{m3}(r_{ds3}\parallel r_{ds5})v_X$. So $M_2$'s $v_{gs}$ is $-(1 + A)v_X$: it behaves like a cascode with $g_{m2}(1 + A)$.`,
        md`$G_M$: short the output; $X$ sees $r_{ds1}$ down and $M_2$'s source looking up, $\approx 1/(g_{m2}(1 + A))$.`,
        md`$R_{out}$: $r_{ds4}$ in parallel with a regulated cascode, $r_{ds2} + r_{ds1} + g_{m2}r_{ds2}(1 + A)r_{ds1}$.`,
      ],
      sol: md`
        **What to see first.** A **cascode amplifier** whose cascode device is **gain-boosted**, loaded by a **current source**. $G_M$ comes from $M_1$; $R_{out}$ is the smaller of the two looking-in impedances.

        **Booster.** $M_3$ is a CS stage with load $r_{ds3}\parallel r_{ds5}$: $A = g_{m3}(r_{ds3}\parallel r_{ds5})$, and $v_b = -Av_X$.

        **$G_M$.** Output shorted. $M_2$ pulls from the output $i_2 = g_{m2}(v_b - v_X) - \dfrac{v_X}{r_{ds2}} = -\left[g_{m2}(1 + A) + \tfrac{1}{r_{ds2}}\right]v_X$, and KCL at $X$ ($M_1$ pulls $g_{m1}v_{in} + v_X/r_{ds1}$) gives
        $$G_M = g_{m1}\,\frac{g_{m2}(1 + A) + 1/r_{ds2}}{g_{m2}(1 + A) + 1/r_{ds1} + 1/r_{ds2}} \approx g_{m1}$$

        **$R_{out}$.** Looking down: a drain whose gate moves **against** its source by $A$ (regulated cascode) over $r_{ds1}$:
        $$R_{out} = r_{ds4}\ \Big\|\ \left[r_{ds1} + r_{ds2} + g_{m2}r_{ds2}(1 + A)r_{ds1}\right] \approx r_{ds4}$$
        The NMOS side is about $g_m^2r_{ds}^3$; next to $r_{ds4}$ it is an open circuit.

        **$A_v = -G_MR_{out} \approx -g_{m1}r_{ds4}$.**

        **Lesson.** Output resistance is a parallel combination, so the **weakest** side sets it. All the boosting buys nothing until the PMOS load is cascoded too (that is the multiple-choice part).

        !!key Pattern
        Gain boosting multiplies a cascode's $g_m$ by $(1 + A)$: $R_{out} \approx g_{m2}(1 + A)r_{ds2}r_{ds1}$. Always compare $R_{UP}$ and $R_{DN}$ before celebrating.
      `,
    }),
  ];

  E2.lesson('e2-mocku', { id: 'e2-mockA', title: 'New practice exam A', kind: 'mock', steps: A });
  E2.lesson('e2-mocku', { id: 'e2-mockB', title: 'New practice exam B', kind: 'mock', steps: B });
  E2.lesson('e2-mocku', { id: 'e2-mockC', title: 'New practice exam C (harder)', kind: 'mock', steps: Cx });
})();

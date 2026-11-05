/* Exam 3: practice exams I, J, K, L (L the hardest), in the Exam 2 format: 60 minutes, three problems, 100 points.
   Cumulative with Exam 2: every exam has a problem that needs a MOSFET skill (mirrors, degenerated drains, the K rule,
   cascodes, folded and regulated cascodes) together with BJTs or frequency response, and the circuits lean on PNPs and
   BiCMOS mixes, so they differ from exams A–H. Every answer was checked against an independent solve (scratch
   folder A10): DC points with a Newton solve (constant V_BE, square law), resistances and gains with small-signal
   nodal analysis (hybrid-pi and MOS models as VCCS), bandwidths with the exact -3 dB frequency of the full circuit.
   Ids start with "e3p". */
(function () {
  'use strict';
  const { R, P } = C;
  const ex = (...a) => E3.ex(...a);
  const kO = (v) => `${v}\\,\\text{k}\\Omega`;
  const Vv = (v) => `${v}\\,\\text{V}`;

  const params = md`**Parameters.** BJT: $V_{BE(on)} = 0.7\,\text{V}$ (for a PNP, $V_{EB(on)} = 0.7\,\text{V}$), $V_{CE(sat)} = 0.2\,\text{V}$, $V_T = 25\,\text{mV}$, so $g_m = I_C/V_T$ and $r_\pi = \beta/g_m$; $\beta$ and $r_o$ as given in each problem. NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$. PMOS: $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $|V_{TP}| = 1\,\text{V}$. Square law $I_D = \tfrac12\mu C_{ox}(W/L)V_{ov}^2$, $g_m = 2I_D/V_{ov}$. Sign convention (as on Exam 2): $G_M$ is the short-circuit current pulled **down into** the stage per volt of input, and $A_v = -G_MR_{out}$.`;
  const howto = 'Symbolic boxes take expressions like `rpi1 + (beta1 + 1)*RE` or `ro1 || (rds2 + RS)`; `||` is "in parallel with". Unless a part asks for the exact form, the $\\beta \\gg 1$ and $g_mr_o \\gg 1$ approximations are accepted wherever they land within 3% of the exact one. Numbers: within 1.5%; arithmetic is allowed in the box (`20*log(8)`, `1/(5e-9)`).';
  const intro = (L, extra) => R(md`
    **Exam 3 practice exam ${L}.** 60 minutes, three problems, 100 points: Problem 1 (35), Problem 2 (35), Problem 3 (30). Same format as Exam 2. Work it on paper first, with a timer, then type your answers. ${extra}

    ${params}

    **These exams are cumulative.** Each one has at least one problem where an Exam 2 MOSFET skill (a mirror, a degenerated drain, the K rule, a cascode) meets a BJT or a frequency response. When a MOSFET appears, the Exam 2 rules apply unchanged: the gate draws nothing, a source looks like about $1/g_m$, a degenerated drain looks like $r_{ds}(1 + g_mR_S)$.

    **Read every solution's first paragraph even when you got the number right.** It is the "recognize it first" step: where the signal goes in, where it comes out, which terminal is common, and so which canonical stage or impedance you are looking at. That is the step to make automatic.

    ${howto}
  `);

  // ================================================================== Practice exam I
  const I1Fig = [
    ['rail', [3, -2.2], { n: 'V_{CC} = 5\\,\\text{V}' }], ['R', [3, -2.2], [3, -1], { n: 'R_C', s: kO(4) }],
    ['npn', [3, 0], { n: 'Q_1' }],
    ['w', [3, -1], [3.6, -1]], ['C', [3.6, -1], [4.3, -1], { n: '\\infty' }], ['w', [4.3, -1], [5.6, -1]], ['term', [5.6, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [5.6, -1], [5.6, 0.4], { n: 'R_L', s: kO(4) }], ['gnd', [5.6, 0.4]],
    ['Vac', [-1.2, 0.3], [-1.2, 1.3], { n: 'v_{sig}', side: 'l' }], ['gnd', [-1.2, 1.3]],
    ['w', [-1.2, 0.3], [-1.2, 0]], ['R', [-1.2, 0], [-0.25, 0], { n: 'R_{sig}', s: '500\\,\\Omega' }], ['C', [-0.25, 0], [0.4, 0], { n: '\\infty' }], ['w', [0.4, 0], [2, 0]],
    ['R', [1.1, 0], [1.1, 1.3], { n: 'R_B', s: kO(10), side: 'l' }], ['gnd', [1.1, 1.3]],
    ['w', [3, 1], [2, 1]], ['C', [2, 1], [2, 2.1], { n: 'C_E', side: 'l' }], ['gnd', [2, 2.1]],
    ['w', [3, 1], [3, 1.2]], ['nmos', [3, 2.2], { n: 'M_2', sz: '20/1', flip: true }],
    ['nmos', [5, 2.2], { n: 'M_1', sz: '10/1', dc: true }],
    ['rail', [5, 0], { n: 'V_{CC}' }], ['R', [5, 0], [5, 1.2], { n: 'R_{ref}', s: kO(16), side: 'l' }],
    ['w', [3, 3.2], [5.4, 3.2]], ['term', [5.4, 3.2], { n: '-5\\,\\text{V}', side: 'r' }],
  ];
  const I2Fig = [
    ['rail', [2, -3.2], { n: 'V_{DD}' }], ['R', [2, -3.2], [2, -2], { n: 'R_S' }],
    ['pmos', [2, -1], { n: 'M_2' }],
    ['w', [2, 0], [3, 0]], ['term', [3, 0], { n: 'v_{out}' }],
    ['npn', [2, 1], { n: 'Q_1' }], ['gnd', [2, 2]],
    ['Vac', [-1.2, 1.3], [-1.2, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.2, 2.3]], ['w', [-1.2, 1.3], [-1.2, 1], [1, 1]],
    ['C', [0, 1], [0, 0], { n: '\\infty', side: 'l' }], ['w', [0, 0], [0, -1], [1, -1]],
    ['R', [0, -1], [-1.3, -1], { n: 'R_G' }], ['acg', [-1.3, -1]],
  ];
  const I3Fig = [
    ['rail', [2, -2.4], { n: 'V_{CC} = 5\\,\\text{V}' }], ['I', [2, -2.4], [2, -1], { n: 'I_E', s: '1\\,\\text{mA}' }],
    ['pnp', [2, 0], { n: 'Q_1' }], ['w', [2, 1], [2, 1.6]], ['gnd', [2, 1.6]],
    ['w', [2, -1], [3.7, -1]], ['term', [3.7, -1], { n: 'v_{out}' }], ['C', [3.1, -1], [3.1, 0.2], { n: 'C_L' }], ['gnd', [3.1, 0.2]],
    ['w', [1, 0], [0.4, 0]], ['C', [0.4, 0], [0.4, -1], { n: 'C_\\pi' }], ['w', [0.4, -1], [2, -1]],
    ['C', [0.4, 0], [0.4, 1], { n: 'C_\\mu' }], ['w', [0.4, 1], [2, 1]],
    ['R', [-0.9, 0], [0.4, 0], { n: 'R_S', s: kO(10) }],
    ['w', [-0.9, 0], [-1.4, 0], [-1.4, 0.3]], ['Vac', [-1.4, 0.3], [-1.4, 1.3], { n: 'v_{in}', side: 'l' }],
    ['V', [-1.4, 1.3], [-1.4, 2.3], { n: Vv(2), side: 'l' }], ['gnd', [-1.4, 2.3]],
  ];
  // C_pi's test source: the hybrid-pi of Q1 with R_S at the base and nothing but the test source at the emitter
  const I3Test = [
    ['w', [-1.2, 0], [0, 0]], ['R', [-1.2, 0], [-1.2, 1.6], { n: 'R_S', side: 'l' }], ['gnd', [-1.2, 1.6]],
    ['node', [0, 0], { n: 'B', side: 'a' }], ['R', [0, 0], [0, 1.6], { n: 'r_\\pi', side: 'l' }],
    ['vlab', [0.35, 0.25], [0.35, 1.35], { n: 'v_\\pi' }],
    ['w', [0, 1.6], [2.6, 1.6]], ['node', [2.6, 1.6], { n: 'E', side: 'r' }],
    ['G', [1.8, 0], [1.8, 1.6], { n: 'g_mv_\\pi' }], ['w', [1.8, 0], [1.8, -0.4]], ['gndu', [1.8, -0.4]],
    ['I', [2.6, -0.9], [0, -0.9], { n: 'i_t' }], ['w', [0, 0], [0, -0.9]], ['w', [2.6, -0.9], [2.6, 1.6]],
  ];

  const Iex = [
    intro('I', 'A mirror-biased common emitter on $\\pm5\\,\\text{V}$, an NPN and a PMOS sharing one output, and a PNP follower driving a capacitor.'),
    P({
      id: 'e3pI-1', src: 'Exam 3 practice I · Problem 1 (35 pts)', title: 'A common emitter biased by an NMOS current mirror', big: true,
      q: md`The rails are $V_{CC} = +5\,\text{V}$ and $-5\,\text{V}$. $Q_1$: $\beta = 100$, $r_o = \infty$. Its emitter current is set by the NMOS mirror $M_1$–$M_2$ ($M_1$: $W/L = 10/1$, $M_2$: $W/L = 20/1$; use $\lambda = 0$ for the DC analysis), with $R_{ref} = 16\kO$ from $V_{CC}$ to $M_1$'s drain. $R_B = 10\kO$ holds the base near ground, $R_C = R_L = 4\kO$, and the source has $R_{sig} = 500\,\Omega$. All capacitors are infinite.

(a) $I_{REF}$. (b) $I_C$. (c) $V_C$; check that $Q_1$ is forward-active and $M_2$ saturated. (d) $g_m$. (e) $R_{in}$, the resistance the source sees past its coupling capacitor (not counting $R_{sig}$). (f) $A_v = v_{out}/v_{sig}$. (g) Remove $C_E$ and take $\lambda = 0.01\,\text{V}^{-1}$ for $M_2$: what happens to the gain?`,
      fig: I1Fig,
      parts: [
        { lbl: 'I_{REF}', unit: 'mA', ans: 0.5, traps: [{ v: 0.5625, msg: 'That drops only $V_{TN} = 1\\,\\text{V}$ across $M_1$. A diode-connected MOSFET carrying current needs $V_{GS} = V_{TN} + V_{ov}$: solve the square law and KVL together.' }] },
        { lbl: 'I_C', unit: 'mA', ans: 0.990, accept: [1], traps: [
          { v: 0.5, msg: 'That is $I_{REF}$. $M_2$ has twice the $W/L$ of $M_1$ at the same $V_{GS}$, so it carries twice the current.' },
          { v: 0.25, msg: 'The ratio is upside down: $M_2$ (20/1) is the wider device, so it carries **more** current than $M_1$.' }] },
        { lbl: 'V_C', unit: 'V', ans: 1.04, accept: [1.0] },
        { lbl: 'g_m', unit: 'mS', ans: 39.6, accept: [40] },
        { lbl: 'R_{in}', unit: 'kΩ', ans: 2.016, accept: [2], traps: [
          { v: 2.525, msg: 'That is $r_\\pi$ alone. $R_B$ goes from the base to ground, so the source sees it in parallel with $r_\\pi$.' },
          { v: 2.5, msg: 'That is $r_\\pi$ alone. $R_B$ goes from the base to ground, so the source sees it in parallel with $r_\\pi$.' },
          { v: 10, msg: 'That is $R_B$ alone: the base itself also takes signal current, through $r_\\pi$.' }] },
        { lbl: 'A_v', unit: '', ans: -63.47, accept: [-64], traps: [
          { v: -79.2, msg: 'That is the gain from the base. The source resistance and $R_{in}$ divide $v_{sig}$ first: only $2/2.5 = 0.8$ of it reaches the base.' },
          { v: -80, msg: 'That is the gain from the base. The source resistance and $R_{in}$ divide $v_{sig}$ first: only $2/2.5 = 0.8$ of it reaches the base.' },
          { v: -126.7, msg: 'That uses $R_C$ alone. The output coupling capacitor puts $R_L$ in parallel with $R_C$ for signals.' },
          { v: -128, msg: 'That uses $R_C$ alone. The output coupling capacitor puts $R_L$ in parallel with $R_C$ for signals.' },
          { v: -66.1, msg: 'That input divider uses $r_\\pi$ alone. $R_B$ is in parallel with it: $R_{in} = 2\\,\\text{k}\\Omega$, not $2.5\\,\\text{k}\\Omega$.' },
          { v: -66.7, msg: 'That input divider uses $r_\\pi$ alone. $R_B$ is in parallel with it: $R_{in} = 2\\,\\text{k}\\Omega$, not $2.5\\,\\text{k}\\Omega$.' },
          { v: 63.47, msg: 'A common emitter inverts: base up, more collector current, more drop across $R_C$, collector down.' }] },
        { lbl: '(g) Without $C_E$ (and with $\\lambda = 0.01\\,\\text{V}^{-1}$), the gain', mc: ['collapses to about $-0.02$: the mirror\'s $r_{ds2} = 100\\,\\text{k}\\Omega$ now sits in the emitter', 'does not change: $M_2$ is a current source, which is ideal', 'falls to about $-1$: the emitter sees $1/g_{m2}$ of the mirror', 'doubles: the emitter is no longer loaded'], a: 0,
          why: [null, 'A current source is ideal for **DC**. For signals it is an open circuit, so without $C_E$ the emitter is degenerated by the largest resistance in the circuit: $A\\approx-(R_C\\parallel R_L)/r_{ds2}$.', 'Looking into the **drain** of $M_2$ (gate held) you see $r_{ds2}$, not $1/g_{m2}$. $1/g_m$ is what a **source** or a diode looks like.', 'Removing $C_E$ adds degeneration; degeneration only lowers the gain.'] },
      ],
      hints: [
        md`$M_1$ is diode-connected: $V_{GS1} = 1 + V_{ov}$, and KVL from $V_{CC}$ through $R_{ref}$ and $M_1$ down to $-5\,\text{V}$ gives $I_{REF}$. Solve it together with $I_{REF} = \tfrac12(100\,\mu)(10)V_{ov}^2$.`,
        md`$M_2$ copies $M_1$'s $V_{GS}$, so it copies the current scaled by $(W/L)_2/(W/L)_1$. That current is $Q_1$'s **emitter** current. The base current then flows through $R_B$.`,
        md`Small signal: $C_E$ shorts the emitter to ground; the source sees $R_B\parallel r_\pi$; the collector sees $R_C\parallel R_L$.`,
      ],
      sol: md`
        **Recognize it first.** In at the **base**, out at the **collector**, emitter bypassed to ground: a **common emitter**. What is new is the bias: the emitter current comes from an **NMOS current mirror** (Exam 2, Problem 1 style). For DC the mirror fixes $I_E$; for signals $M_2$ is a current source, an open circuit, and $C_E$ makes the emitter a signal ground. Expect $A_v\approx-g_m(R_C\parallel R_L)$ times the input divider.

        **(a) The reference.** $M_1$'s gate is tied to its drain, so it is saturated, and $V_{GS1} = 1 + V_{ov}$. KVL from $V_{CC}$ down to $-5\,\text{V}$:
        $$5 - (16\,\text{k})I_{REF} - (1 + V_{ov}) = -5\ \Rightarrow\ I_{REF} = \frac{9 - V_{ov}}{16\,\text{k}}$$
        The square law with $\tfrac12\mu_nC_{ox}(W/L)_1 = \tfrac12(100\,\mu)(10) = 0.5\,\text{mA/V}^2$: $I_{REF} = 0.5V_{ov}^2$ (mA). Set them equal:
        $$0.5V_{ov}^2 = \frac{9 - V_{ov}}{16}\ \Rightarrow\ 8V_{ov}^2 + V_{ov} - 9 = 0\ \Rightarrow\ V_{ov} = \frac{-1 + \sqrt{1 + 288}}{16} = 1\,\text{V}$$
        So $V_{GS1} = 2\,\text{V}$ and $I_{REF} = 0.5\,\text{mA}$. (The other root is negative: not a physical overdrive.)

        **(b) The copy.** $M_2$ has the same $V_{GS}$ (same gate, same source rail) and twice the $W/L$, so in saturation it carries twice the current: $I_{D2} = 1\,\text{mA}$. All of it is $Q_1$'s emitter current: $I_E = 1\,\text{mA}$, and
        $$I_C = \frac{\beta}{\beta + 1}I_E = \frac{100}{101}(1\,\text{mA}) = 0.990\,\text{mA}$$
        The base current $I_B = I_E/(\beta + 1) = 9.9\,\mu\text{A}$ flows from ground through $R_B$ into the base, so $V_B = -(9.9\,\mu\text{A})(10\,\text{k}) = -0.10\,\text{V}$ and $V_E = V_B - 0.7 = -0.80\,\text{V}$.

        **(c)** $V_C = 5 - (0.990\,\text{mA})(4\,\text{k}) = 1.04\,\text{V}$ (or $1.0\,\text{V}$ with $I_C\approx I_E$).
        - $Q_1$: $V_C = 1.04\,\text{V} > V_B = -0.10\,\text{V}$: the base-collector junction is reverse-biased, forward-active ✓.
        - $M_2$: $V_{DS2} = V_E - (-5) = 4.2\,\text{V}\ge V_{ov} = 1\,\text{V}$: saturated ✓, so the copy is valid.

        Notice what the mirror buys: $I_E$ does not depend on $\beta$ or on $R_B$. The base current only nudges $V_B$ by $0.1\,\text{V}$.

        **(d)** $g_m = I_C/V_T = 0.990\,\text{mA}/25\,\text{mV} = 39.6\,\text{mS}\approx40\,\text{mS}$, and $r_\pi = \beta/g_m = 2.525\kO\approx2.5\kO$.

        **(e) Small signal.** Both rails are ground, the capacitors are shorts, the mirror is an open circuit (and is shorted by $C_E$ anyway). The base node has $R_B$ to ground and $r_\pi$ to the grounded emitter:
        $$R_{in} = R_B\parallel r_\pi = 10\,\text{k}\parallel2.525\,\text{k} = 2.02\kO\approx2\kO$$

        **(f) Gain.** First the input divider, then a plain common emitter whose collector sees $R_C\parallel R_L = 2\kO$:
        $$\frac{v_b}{v_{sig}} = \frac{R_{in}}{R_{in} + R_{sig}} = \frac{2.02}{2.52} = 0.80,\qquad \frac{v_{out}}{v_b} = -g_m(R_C\parallel R_L) = -(39.6\,\text{m})(2\,\text{k}) = -79.2$$
        $$A_v = 0.80\times(-79.2) = -63.5\quad(-64\text{ with the round numbers }0.8\times80)$$

        **(g) Without $C_E$.** Now the emitter sees $M_2$'s drain with its gate held: $r_{ds2} = 1/(\lambda I_D) = 1/(0.01\times1\,\text{mA}) = 100\kO$. That is a common emitter degenerated by $100\kO$:
        $$\frac{v_{out}}{v_b}\approx-\frac{R_C\parallel R_L}{r_{ds2} + 1/g_m} = -\frac{2\,\text{k}}{100\,\text{k}} = -0.02$$
        ($R_{in}$ rises to almost $R_B$, so the divider becomes $0.95$, and $A_v\approx-0.019$.) The gain is gone.

        !!key DC sees the mirror, signals see the capacitor
        A current source in the emitter is the best possible **DC** bias (it fixes $I_E$ regardless of $\beta$) and the worst possible **signal** path (an open circuit: infinite degeneration). The bypass capacitor resolves it: at signal frequencies the emitter is grounded. Same story as a MOS source biased by a mirror and bypassed.
      `,
    }),
    P({
      id: 'e3pI-2', src: 'Exam 3 practice I · Problem 2 (35 pts)', title: 'Two transistors, one output: an NPN and a degenerated PMOS', big: true,
      q: md`$v_{in}$ drives two transistors at once: the base of $Q_1$ (NPN, emitter grounded) directly, and the gate of $M_2$ (PMOS) through an infinite capacitor; $R_G$ holds $M_2$'s gate at its DC bias. $M_2$ has $R_S$ between its source and $V_{DD}$. $M_2$'s drain and $Q_1$'s collector are joined: that node is the output. Both devices carry the same DC current and are in the active/saturation region. Keep $r_{o1}$ and $r_{ds2}$. In symbols:

(a) $R_{in}$, the resistance $v_{in}$ sees. (b) The transconductance $G_M$ of the stage. (c) $R_{out}$. (d) $A_v = v_{out}/v_{in}$. (e) A number for (d), with both devices at $0.1\,\text{mA}$: $g_{m1} = 4\,\text{mS}$, $r_{o1} = 1\,\text{M}\Omega$, $g_{m2} = 2\,\text{mS}$, $r_{ds2} = 1\,\text{M}\Omega$, $R_S = 1.5\kO$. (f) Why the two transconductances add.`,
      fig: I2Fig,
      parts: [
        ex('rpi1 || RG', ['rpi1', 'RG'], 'R_{in}', { ranges: { rpi1: [1e3, 2e4], RG: [5e3, 5e4] } }),
        ex('gm1 + gm2*rds2/(rds2 + RS + gm2*rds2*RS)', ['gm1', 'gm2', 'rds2', 'RS'], 'G_M', { ranges: { gm1: [2e-3, 10e-3], gm2: [2e-3, 10e-3], RS: [1e3, 5e3] } }),
        ex('ro1 || (rds2 + RS + gm2*rds2*RS)', ['ro1', 'rds2', 'RS', 'gm2'], 'R_{out}', { ranges: { gm2: [2e-3, 10e-3], RS: [1e3, 5e3] } }),
        ex('-(gm1 + gm2*rds2/(rds2 + RS + gm2*rds2*RS))*(ro1 || (rds2 + RS + gm2*rds2*RS))', ['gm1', 'gm2', 'ro1', 'rds2', 'RS'], 'A_v', { ranges: { gm1: [2e-3, 10e-3], gm2: [2e-3, 10e-3], RS: [1e3, 5e3] } }),
        { lbl: 'A_v\\ \\text{(numbers)}', unit: '', ans: -3600, traps: [
          { v: -3200, msg: 'That is $-g_{m1}R_{out}$: it drops $M_2$\'s own (degenerated) transconductance, $0.5\\,\\text{mS}$.' },
          { v: -3000, msg: 'That treats $M_2$ as undegenerated: $G_{M2} = g_{m2}$ and $R_{UP} = r_{ds2}$. With $R_S$, $G_{M2} = g_{m2}/(1 + g_{m2}R_S)$ and $R_{UP} = r_{ds2}(1 + g_{m2}R_S)$.' },
          { v: -4500, msg: 'That uses $r_{o1}$ alone for $R_{out}$. Looking up into $M_2$\'s drain you see $4\\,\\text{M}\\Omega$, in parallel.' }] },
        { lbl: '(f) Why do the two transconductances add instead of cancelling?', mc: ['Raising $v_{in}$ makes $Q_1$ sink more current and $M_2$ source less: both take current away from the output node', 'They do cancel: one device is NPN and the other PMOS', 'Because $R_G$ connects the gate to the base', 'Because the PMOS has a negative $g_m$'], a: 0,
          why: [null, 'Opposite device types are exactly why they **add**: the same input change turns the NPN on harder and the PMOS off, and both push the output the same way (down), as in a CMOS inverter.', '$R_G$ only sets the gate\'s DC level; for signals the coupling capacitor ties the gate to $v_{in}$.', 'No transistor has a negative $g_m$; the PMOS model is the same as the NMOS model with $i_d$ drawn from drain to source.'] },
      ],
      hints: [
        md`Name each device: $Q_1$ is in at the base, out at the collector (common emitter). $M_2$ is in at the gate, out at the drain, $R_S$ at its source: a degenerated common source. Two stages, **one** output node: "two paths into one output" from Exam 2.`,
        md`Two paths: short the output and **add** the two short-circuit currents; zero the input and put the two terminal resistances **in parallel**.`,
        md`$M_2$ with its drain shorted: $G_{M2} = \dfrac{g_{m2}}{1 + g_{m2}R_S + R_S/r_{ds2}}$. Looking up into its drain: $r_{ds2} + R_S + g_{m2}r_{ds2}R_S$.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: in at the **base**, out at the **collector**, emitter grounded: a **common emitter**.
        - $M_2$ (PMOS: arrow on the top lead, source toward $V_{DD}$): in at the **gate**, out at the **drain**, $R_S$ in its source: a **degenerated common source**.
        - Both outputs land on the **same node**. This is Exam 2's "two paths into one output": by superposition, the short-circuit currents add, and the resistances looking up and down are in parallel. (It is a CMOS inverter with one device swapped for an NPN.)

        **(a) Input.** The base has $r_{\pi1}$ to the grounded emitter. The gate draws nothing, but through the coupling capacitor $v_{in}$ also sees $R_G$, which goes to the held bias (a signal ground):
        $$R_{in} = r_{\pi1}\parallel R_G$$

        **(b) $G_M$: short the output** ($v_{out} = 0$) and add the two currents pulled down out of the output node.
        - $Q_1$: $i_{c1} = g_{m1}v_{in}$ flows from the output into the collector ($r_{o1}$ has $0\,\text{V}$ across it).
        - $M_2$: $i_{d2}$ flows from its drain (the output) to its source. With the drain at $0$: $i_{d2} = g_{m2}(v_{in} - v_s) - v_s/r_{ds2}$, and $i_{d2}$ leaves through $R_S$ to $V_{DD}$ (ground), so $v_s = i_{d2}R_S$. Then
        $$i_{d2}\Big(1 + g_{m2}R_S + \frac{R_S}{r_{ds2}}\Big) = g_{m2}v_{in}\ \Rightarrow\ G_{M2} = \frac{g_{m2}r_{ds2}}{r_{ds2} + R_S + g_{m2}r_{ds2}R_S}\approx\frac{g_{m2}}{1 + g_{m2}R_S}$$
        Both currents leave the output node, so both count with the same sign:
        $$G_M = g_{m1} + \frac{g_{m2}r_{ds2}}{r_{ds2} + R_S + g_{m2}r_{ds2}R_S}\approx g_{m1} + \frac{g_{m2}}{1 + g_{m2}R_S}$$

        **(c) $R_{out}$: zero the input.** Down: $Q_1$'s collector with base and emitter grounded, $r_{o1}$. Up: $M_2$'s drain with its gate held and $R_S$ at its source, the **degenerated drain** of Exam 2:
        $$R_{out} = r_{o1}\parallel\big(r_{ds2} + R_S + g_{m2}r_{ds2}R_S\big)$$

        **(d)** $A_v = -G_MR_{out}$, with (b) and (c) inserted.

        **(e) Numbers.** $g_{m2}R_S = (2\,\text{m})(1.5\,\text{k}) = 3$:
        $$G_{M2}\approx\frac{2\,\text{m}}{1 + 3} = 0.5\,\text{mS},\qquad G_M = 4 + 0.5 = 4.5\,\text{mS}$$
        $$R_{UP} = 1\,\text{M} + 1.5\,\text{k} + (2\,\text{m})(1\,\text{M})(1.5\,\text{k})\approx4\,\text{M}\Omega,\qquad R_{out} = 1\,\text{M}\parallel4\,\text{M} = 0.8\,\text{M}\Omega$$
        $$A_v = -(4.5\,\text{mS})(0.8\,\text{M}\Omega) = -3600$$

        **What it means.** The PMOS contributes $0.5$ of the $4.5\,\text{mS}$, and its degenerated drain ($4\,\text{M}\Omega$, four times $r_{ds2}$) keeps $R_{out}$ close to $r_{o1}$. Without $R_S$ it would add more transconductance ($G_M = 6\,\text{mS}$) but its drain would be only $r_{ds2} = 1\,\text{M}\Omega$, halving $R_{out}$ to $0.5\,\text{M}\Omega$: the gain would drop to $-3000$. Degeneration trades a little $g_m$ for a lot of output resistance.

        **(f)** Raise $v_{in}$: the NPN turns on harder and sinks more current from the output; the PMOS's $V_{SG}$ shrinks, so it sources less current into the output. Both changes take current away from the output node, so both pull $v_{out}$ down: the transconductances add.

        !!key Two paths, one output
        Short the output: currents **add** ($G_M = G_{M1} + G_{M2}$, each with its own sign). Zero the input: resistances go **in parallel**. Every terminal rule from Exam 2 (degenerated drain, $1/g_m$, $r_{ds}$) and from Exam 3 (BJT collector, base, emitter) plugs straight in.
      `,
    }),
    P({
      id: 'e3pI-3', src: 'Exam 3 practice I · Problem 3 (30 pts)', title: 'A PNP follower driving a capacitor: time constants', big: true,
      q: md`A PNP emitter follower drives a load capacitance $C_L$. An ideal current source $I_E = 1\,\text{mA}$ from $V_{CC} = 5\,\text{V}$ biases the emitter; the collector is grounded; there is no resistive load. The source is $v_{in}$ in series with a $2\,\text{V}$ DC source and $R_S = 10\kO$. $\beta = 100$, $r_o = \infty$, $C_\pi = 8\,\text{pF}$ (base to emitter), $C_\mu = 1\,\text{pF}$ (base to collector), $C_L = 10\,\text{pF}$.

(a) The DC emitter voltage $V_E$. (b) The low-frequency gain $A_{v0} = v_{out}/v_{in}$. (c) The resistance seen by $C_\mu$. (d) The resistance seen by $C_\pi$. (e) The resistance seen by $C_L$. (f) The bandwidth estimate $\omega_{-3dB}$ from open-circuit time constants. (g) For comparison, $\omega_{-3dB}$ if $C_L$ hung directly on the source through $R_S$ (no follower). (h) Which capacitor limits the follower?`,
      fig: I3Fig,
      parts: [
        { lbl: 'V_E', unit: 'V', ans: 2.799, accept: [2.8], traps: [
          { v: 2.7, msg: 'Close: that ignores the base current. A PNP\'s base current flows **out** of the base, through $R_S$, into the source: $V_B = 2 + I_BR_S = 2.1\\,\\text{V}$.' },
          { v: 1.4, msg: 'For a PNP the emitter sits $0.7\\,\\text{V}$ **above** the base, not below.' },
          { v: 1.3, msg: 'For a PNP the emitter sits $0.7\\,\\text{V}$ **above** the base, not below.' }] },
        { lbl: 'A_{v0}', unit: '', ans: 1 },
        { lbl: 'R_{C\\mu}', unit: 'kΩ', ans: 10, traps: [{ v: 2.525, msg: '$C_\\mu$ goes from the base to the grounded collector, so it sees everything at the base node: $R_S$ in parallel with the resistance looking into the base, which is infinite here.' }] },
        { lbl: 'R_{C\\pi}', unit: 'Ω', ans: 25, traps: [
          { v: 2525, msg: 'That is $r_\\pi$ alone. The emitter is not grounded: the transistor\'s own $g_mv_\\pi$ also flows through the test source, so you see $r_\\pi/(\\beta + 1)$.' },
          { v: 10000, msg: '$C_\\pi$ is not a node-to-ground capacitor here: it bridges base and emitter, which move together. Use a test source **between** them.' }] },
        { lbl: 'R_{CL}', unit: 'Ω', ans: 124, accept: [125, 123.8], traps: [
          { v: 99, msg: 'Include $r_\\pi$: looking into the emitter you see $(R_S + r_\\pi)/(\\beta + 1)$.' },
          { v: 25, msg: 'That is $r_e$: the base would have to be grounded. Here the base sees $R_S$, which shows up divided by $\\beta + 1$.' }] },
        { lbl: '\\omega_{-3dB}', unit: 'rad/s', ans: 8.74e7, accept: [8.73e7], traps: [{ v: 1e8, msg: 'That is $C_\\mu$ alone. Add every capacitor\'s time constant: $\\tau_\\pi$ and $\\tau_L$ too.' }] },
        { lbl: '\\omega_{-3dB}\\ \\text{(no follower)}', unit: 'rad/s', ans: 1e7 },
        { lbl: '(h) The follower\'s bandwidth is limited mainly by', mc: ['$C_\\mu$, charged through $R_S$', '$C_L$, the biggest capacitor', '$C_\\pi$, the second biggest', 'the current source'], a: 0,
          why: [null, 'The follower divides the resistance $C_L$ sees by $\\beta + 1$: $124\\,\\Omega\\times10\\,\\text{pF} = 1.24\\,\\text{ns}$.', '$C_\\pi$ is bootstrapped: both ends move together, and it sees only $r_e = 25\\,\\Omega$ ($0.2\\,\\text{ns}$).', 'An ideal current source is an open circuit for signals; it has no capacitance here.'] },
      ],
      hints: [
        md`DC: for a PNP, the emitter is $0.7\,\text{V}$ **above** the base, and the base current flows out of the base, through $R_S$, into the $2\,\text{V}$ source.`,
        md`OCTC: open the other capacitors, zero $v_{in}$, put a test source across the capacitor you want. $C_\mu$ goes from the base to ground (the collector). $C_\pi$ **bridges** base and emitter. $C_L$ goes from the emitter to ground.`,
        md`For $C_\pi$: inject $i_t$ into the base and take it out of the emitter. The emitter has nothing else connected, so KCL there gives $i_t = v_\pi/r_\pi + g_mv_\pi$.`,
      ],
      figs: { test: { fig: I3Test, cap: 'The test for $C_\\pi$: $Q_1$\'s hybrid-$\\pi$ model (collector grounded), $R_S$ from the base to ground, the current source open, and the test source pulling $i_t$ out of the emitter and pushing it back into the base. Every ampere of $i_t$ must leave the emitter through $r_\\pi$ and the $g_mv_\\pi$ source.' } },
      sol: md`
        **Recognize it first.** In at the **base**, out at the **emitter**, collector on ground (a rail): an **emitter follower**, drawn as a PNP (emitter on top, arrow pointing in). Gain about $1$, small output resistance: its job is to drive $C_L$. Now place the capacitors: $C_\mu$ (base to collector) goes from the input node to ground. $C_\pi$ (base to emitter) **bridges** input and output of a gain of about $+1$: it is bootstrapped, both its ends move together. $C_L$ sits on the output.

        **(a) DC.** The base current $I_B = I_E/(\beta + 1) = 9.9\,\mu\text{A}$ flows **out** of the base, through $R_S$, into the $2\,\text{V}$ source, so $V_B = 2 + (9.9\,\mu\text{A})(10\,\text{k}) = 2.10\,\text{V}$, and the emitter is $0.7\,\text{V}$ above it:
        $$V_E = 2.10 + 0.70 = 2.80\,\text{V}$$
        Checks: $V_C = 0 < V_B$, so the collector junction is reverse-biased ✓; the current source keeps $5 - 2.8 = 2.2\,\text{V}$ ✓. Small-signal values: $I_C = \alpha I_E = 0.990\,\text{mA}$, $g_m = 39.6\,\text{mS}$, $r_\pi = 2.525\kO$, and $r_e = r_\pi/(\beta + 1) = V_T/I_E = 25\,\Omega$.

        **(b) Low frequency** (capacitors open). The emitter's only load is the current source, an open circuit for signals. So no signal current can leave the emitter, hence no signal base current, hence no drop across $R_S$ or $r_\pi$: $v_{out} = v_{in}$, $A_{v0} = 1$ exactly.

        **(c) $C_\mu$.** It sees the base node. Toward the source: $R_S$ (with $v_{in}$ zeroed). Into the base: $r_\pi + (\beta + 1)\times(\text{emitter load})$, and the emitter load is infinite (current source, $C_L$ open). So
        $$R_{C\mu} = R_S = 10\kO,\qquad\tau_\mu = (10\,\text{k})(1\,\text{p}) = 10\,\text{ns}$$

        **(d) $C_\pi$.** Push $i_t$ into the base and pull it out of the emitter (figure). Nothing else touches the emitter, so KCL there: the test current is supplied by $r_\pi$ and by the transistor's own current source,
        $$i_t = \frac{v_\pi}{r_\pi} + g_mv_\pi = \frac{\beta + 1}{r_\pi}v_\pi\ \Rightarrow\ R_{C\pi} = \frac{v_\pi}{i_t} = \frac{r_\pi}{\beta + 1} = r_e = 25\,\Omega$$
        $R_S$ drops out: whatever the base does, the emitter must deliver $i_t$, and that fixes $v_\pi$. (The general follower result $r_\pi\parallel\dfrac{R_S + R_E}{1 + g_mR_E}$ gives the same with $R_E\to\infty$.) $\tau_\pi = (25)(8\,\text{p}) = 0.2\,\text{ns}$.

        [[fig:test]]

        **(e) $C_L$.** Looking back into the emitter, the base-side resistance $R_S + r_\pi$ is divided by $\beta + 1$; the current source adds nothing in parallel:
        $$R_{CL} = \frac{R_S + r_\pi}{\beta + 1} = \frac{10\,\text{k} + 2.525\,\text{k}}{101} = 124\,\Omega,\qquad\tau_L = (124)(10\,\text{p}) = 1.24\,\text{ns}$$

        **(f)** $\sum\tau = 10 + 0.2 + 1.24 = 11.44\,\text{ns}$:
        $$\omega_{-3dB}\approx\frac{1}{11.44\,\text{ns}} = 8.74\times10^7\,\text{rad/s}\quad(f\approx13.9\,\text{MHz})$$
        The exact $-3\,\text{dB}$ frequency of this circuit is $1.06\times10^8\,\text{rad/s}$: the estimate is pessimistic, as it always is, here by about $20\%$ because two time constants share the work.

        **(g) No follower.** $C_L$ charged through $R_S$: $\tau = R_SC_L = (10\,\text{k})(10\,\text{p}) = 100\,\text{ns}$, $\omega_{-3dB} = 10^7\,\text{rad/s}$. The follower is $8.7$ times faster: it divides the resistance $C_L$ sees by $\beta + 1$.

        **(h)** $C_\mu$: $10$ of the $11.44\,\text{ns}$. The follower hides $C_L$ (divided by $\beta + 1$) and $C_\pi$ (bootstrapped), but $C_\mu$ hangs on the input node and sees the full $R_S$. To make the follower faster, drive it from a smaller source resistance.

        !!key A follower's three capacitors
        $C_\mu$ (input node to ground): the source resistance, in parallel with $r_\pi + (\beta + 1)R_E$. $C_\pi$ (input to output, bootstrapped): $r_\pi\parallel\dfrac{R_S + R_E}{1 + g_mR_E}$, which is $r_e$ for a current-source bias. $C_L$ (output): $R_E\parallel\dfrac{R_S + r_\pi}{\beta + 1}$.
      `,
    }),
  ];

  // ================================================================== Practice exam J
  const J1Fig = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 5\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_E', s: kO(2), side: 'l' }],
    ['pnp', [1, 0], { n: 'Q_1' }],
    ['w', [1, -1], [1.9, -1]], ['C', [1.9, -1], [1.9, 0.1], { n: 'C_E', side: 'l' }], ['gnd', [1.9, 0.1]],
    ['w', [0, 0], [-0.6, 0], [-0.6, 0.3]], ['Vac', [-0.6, 0.3], [-0.6, 1.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 1.3], [-0.6, 2.3], { n: Vv(2.3), side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['node', [1, 1], { n: 'A', side: 'l' }],
    ['nmos', [1, 2], { n: 'M_1', sz: '20/1', flip: true, dc: true }], ['gnd', [1, 3]],
    ['nmos', [3, 2], { n: 'M_2', sz: '40/1' }], ['gnd', [3, 3]],
    ['rail', [3, -0.2], { n: 'V_{DD} = 5\\,\\text{V}' }], ['R', [3, -0.2], [3, 1], { n: 'R_D', s: kO(1.5) }],
    ['w', [3, 1], [4, 1]], ['term', [4, 1], { n: 'v_{out}' }],
  ];
  // J-1's small-signal model: Q1 (emitter at signal ground) is g_m v_in from A to ground; M1's diode is 1/g_m1; M2 copies
  const J1Model = [
    ['G', [0, 0], [0, 1.6], { n: 'g_mv_{in}', side: 'l' }], ['w', [0, 0], [1.3, 0]], ['node', [0.65, 0], { n: 'A', side: 'a' }],
    ['R', [1.3, 0], [1.3, 1.6], { n: '1/g_{m1}' }],
    ['G', [3.2, 0], [3.2, 1.6], { n: 'g_{m2}v_a', side: 'l' }], ['w', [3.2, 0], [4.2, 0]], ['R', [4.2, 0], [4.2, 1.6], { n: 'R_D' }],
    ['node', [3.7, 0], { n: 'v_{out}', side: 'a' }],
    ['w', [0, 1.6], [4.2, 1.6]], ['gnd', [2.25, 1.6]],
  ];
  const J2Fig = [
    ['rail', [2, -3.2], { n: 'V_{CC}' }], ['R', [2, -3.2], [2, -2], { n: 'R_E' }],
    ['pnp', [2, -1], { n: 'Q_1' }],
    ['w', [1, -1], [-0.4, -1], [-0.4, -0.7]], ['Vac', [-0.4, -0.7], [-0.4, 0.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.4, 0.3]],
    ['w', [2, 0], [3.4, 0]], ['term', [3.4, 0], { n: 'v_{out}' }],
    ['nmos', [2, 1], { n: 'M_2' }], ['R', [2, 2], [2, 3.2], { n: 'R_S' }], ['gnd', [2, 3.2]],
    ['w', [2, 0], [0.4, 0]], ['R', [0.4, 0], [0.4, 1], { n: 'R_1' }], ['w', [0.4, 1], [1, 1]], ['R', [0.4, 1], [0.4, 2.2], { n: 'R_2' }], ['gnd', [0.4, 2.2]],
  ];
  const J3Fig = [
    ['rail', [1, -2.2], { n: 'V_{CC}' }], ['R', [1, -2.2], [1, -1], { n: 'R_E', s: '100\\,\\Omega', side: 'l' }],
    ['w', [1, -2.2], [1.9, -2.2]], ['C', [1.9, -2.2], [1.9, -1], { n: 'C_E', s: '1\\,\\mu\\text{F}' }], ['w', [1.9, -1], [1, -1]],
    ['pnp', [1, 0], { n: 'Q_1' }],
    ['R', [1, 1], [1, 2.2], { n: 'R_C', s: kO(5), side: 'l' }], ['gnd', [1, 2.2]],
    ['w', [1, 1], [2.8, 1]], ['C', [2.1, 1], [2.1, 2.2], { n: 'C_L', s: '2\\,\\text{pF}' }], ['gnd', [2.1, 2.2]], ['term', [2.8, 1], { n: 'v_{out}' }],
    ['w', [0, 0], [-0.6, 0], [-0.6, 0.3]], ['Vac', [-0.6, 0.3], [-0.6, 1.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 1.3], [-0.6, 2.3], { n: 'V_B', side: 'l' }], ['gnd', [-0.6, 2.3]],
  ];
  const J3Plot = E3Bode.svg({ k: -40, zeros: [1e4], poles: [5e4, 1e8] }, { show: 'both', wmin: 1e2, wmax: 1e10, yl: '|A_v|_{\\text{dB}}',
    marks: [{ w: 1e4, n: '\\omega_z' }, { w: 5e4, n: '\\omega_{p1}' }, { w: 1e8, n: '\\omega_{p2}' }],
    pts: [{ w: 1e3, n: '32\\,\\text{dB}', side: 'dr' }, { w: 1e6, n: '46\\,\\text{dB}', side: 'ur' }] });
  const J2RDN = '(rds2 + RS + gm2*rds2*RS)/(1 + gm2*rds2*R2/(R1 + R2))';
  const J2RUP = '(ro1 + (RE || rpi1)*(1 + gm1*ro1))';
  const J2GM = 'gm1/(1 + gm1*RE*(beta1 + 1)/beta1)';
  const J2r = { gm1: [20e-3, 80e-3], RE: [200, 2000], gm2: [5e-3, 20e-3], RS: [1e3, 1e4], R1: [2e3, 8e3], R2: [2e3, 8e3] };

  const Jex = [
    intro('J', 'A PNP stage feeding an NMOS current mirror, the K rule under a PNP, and what a finite bypass capacitor does to the frequency response.'),
    P({
      id: 'e3pJ-1', src: 'Exam 3 practice J · Problem 1 (35 pts)', title: 'A PNP common emitter feeding an NMOS current mirror', big: true,
      q: md`$V_{CC} = V_{DD} = 5\,\text{V}$. $Q_1$ (PNP, $\beta = 100$, $r_o = \infty$) has $R_E = 2\kO$ to $V_{CC}$, bypassed by $C_E$ (infinite); its base sits at $2.3\,\text{V}$ DC plus $v_{in}$. Its collector current flows into $M_1$ (diode-connected NMOS, $W/L = 20/1$), which is mirrored by $M_2$ ($W/L = 40/1$) into $R_D = 1.5\kO$. Take $\lambda = 0$.

(a) $I_C$. (b) $V_{GS1}$, the DC voltage of node $A$. (c) The DC output voltage $V_{OUT}$; check that $Q_1$ is forward-active and $M_2$ saturated. (d) $R_{in}$, looking into the base. (e) $R_A$, the small-signal resistance from node $A$ to ground. (f) The gain to node $A$, $v_a/v_{in}$. (g) $A_v = v_{out}/v_{in}$. (h) Why is the sign what it is?`,
      fig: J1Fig,
      parts: [
        { lbl: 'I_C', unit: 'mA', ans: 0.990, accept: [1] },
        { lbl: 'V_{GS1}', unit: 'V', ans: 1.995, accept: [2], traps: [{ v: 1, msg: 'That is $V_{TN}$ alone. $M_1$ carries about $1\\,\\text{mA}$, so it needs an overdrive: $V_{GS} = V_{TN} + \\sqrt{I/(\\tfrac12\\mu_nC_{ox}W/L)}$.' }] },
        { lbl: 'V_{OUT}', unit: 'V', ans: 2.03, accept: [2], traps: [{ v: 3.5, msg: 'That copies $M_1$\'s current one to one. $M_2$ is twice as wide at the same $V_{GS}$: it carries twice the current, about $2\\,\\text{mA}$.' }] },
        { lbl: 'R_{in}', unit: 'kΩ', ans: 2.525, accept: [2.5], traps: [{ v: 204.5, msg: 'The emitter is bypassed: $R_E$ is shorted for signals, so it does not get multiplied by $\\beta + 1$.' }] },
        { lbl: 'R_A', unit: 'Ω', ans: 502.5, accept: [500], traps: [{ v: 2525, msg: 'Node $A$ is $Q_1$\'s **collector** (an open circuit with $r_o = \\infty$) and $M_1$\'s diode. Only the diode counts: $1/g_{m1}$.' }] },
        { lbl: 'v_a/v_{in}', unit: '', ans: -19.9, accept: [-20], traps: [{ v: 19.9, msg: 'Base up means $V_{EB}$ down: the PNP delivers **less** current into the diode, so node $A$ falls.' }] },
        { lbl: 'A_v', unit: '', ans: 118.8, accept: [120], traps: [
          { v: -118.8, msg: 'Count the inversions: the PNP-into-diode step inverts ($v_a$ falls), and $M_2$ into $R_D$ inverts again. Two inversions: non-inverting.' },
          { v: -120, msg: 'Count the inversions: the PNP-into-diode step inverts ($v_a$ falls), and $M_2$ into $R_D$ inverts again. Two inversions: non-inverting.' },
          { v: 59.4, msg: 'That drops the mirror\'s gain of 2: $M_2$ has twice $M_1$\'s $W/L$, so $g_{m2} = 2g_{m1}$ and the signal current is doubled.' },
          { v: 60, msg: 'That drops the mirror\'s gain of 2: $M_2$ has twice $M_1$\'s $W/L$, so $g_{m2} = 2g_{m1}$ and the signal current is doubled.' }] },
        { lbl: '(h) $A_v$ is positive because', mc: ['the PNP-into-diode step and the $M_2$-into-$R_D$ step each invert, and two inversions cancel', 'PNP transistors do not invert', 'current mirrors invert the signal current', 'the emitter is bypassed'], a: 0,
          why: [null, 'A PNP common emitter inverts just like an NPN one: here $v_a/v_{in} = -20$.', 'A mirror copies the current **with the same sign** (here $\\times2$); the inversion happens when $M_2$\'s drain current flows through $R_D$ from the supply.', 'Bypassing removes degeneration (more gain); it does not change the sign.'] },
      ],
      hints: [
        md`DC: $V_E = 2.3 + 0.7 = 3.0\,\text{V}$, so $I_E = (5 - 3)/2\,\text{k}$. $M_1$ carries $I_C$: $I_C = \tfrac12(100\,\mu)(20)V_{ov}^2$. $M_2$ has the same $V_{GS}$ and twice the $W/L$.`,
        md`Small signal: $Q_1$ (emitter grounded by $C_E$) is a current $g_mv_{in}$ pulled out of node $A$; $M_1$'s diode is $1/g_{m1}$ to ground; $M_2$ turns $v_a$ back into a current $g_{m2}v_a$, through $R_D$.`,
        md`$g_{m2}/g_{m1} = 2$ (same $V_{ov}$, twice the current). So the mirror is a current gain of $2$.`,
      ],
      figs: { model: { fig: J1Model, cap: 'J-1 small-signal model. Both rails and the bypassed emitter are ground. $Q_1$ is the current source $g_mv_{in}$ out of node $A$ (into its collector), $M_1$ is the resistor $1/g_{m1}$, and $M_2$ is the current $g_{m2}v_a$ drawn from the output ($v_a$ is the voltage of node $A$).' } },
      sol: md`
        **Recognize it first.**
        - $Q_1$: a PNP (emitter on top, arrow in), in at the **base**, out at the **collector**, emitter bypassed: a **common emitter**. Its output current goes into node $A$.
        - $M_1$: gate tied to drain, a **diode-connected** NMOS: from node $A$ it looks like $1/g_{m1}$. It is the reference side of a **mirror**.
        - $M_2$: same gate, same source as $M_1$, twice as wide: a mirror with a current gain of 2 (Exam 2: "mirrors carry signal"). Its drain current flows through $R_D$.

        The signal goes current → voltage → current → voltage: $Q_1$ turns $v_{in}$ into a current, $M_1$ turns it into $v_a$, $M_2$ turns $v_a$ back into twice the current, and $R_D$ turns that into $v_{out}$.

        **(a) DC.** $V_E = 2.3 + 0.7 = 3.0\,\text{V}$, $I_E = (5 - 3)/2\,\text{k} = 1\,\text{mA}$, $I_C = \alpha I_E = 0.990\,\text{mA}$.

        **(b)** All of $I_C$ flows into $M_1$, so $I_C = \tfrac12(100\,\mu)(20)V_{ov}^2 = (1\,\text{mA/V}^2)V_{ov}^2$: $V_{ov} = \sqrt{0.990} = 0.995\,\text{V}$ and $V_{GS1} = 1.995\,\text{V}\approx2\,\text{V}$.

        **(c)** $M_2$ has the same $V_{GS}$ and twice the $W/L$: $I_{D2} = 2I_C = 1.98\,\text{mA}$. $V_{OUT} = 5 - (1.98\,\text{mA})(1.5\,\text{k}) = 2.03\,\text{V}$.
        - $Q_1$: $V_C = V_A = 2.0\,\text{V} < V_B = 2.3\,\text{V}$: the collector junction is reverse-biased, forward-active ✓ ($V_{EC} = 1.0\,\text{V} > 0.2\,\text{V}$).
        - $M_2$: $V_{DS2} = 2.03\,\text{V}\ge V_{ov} = 0.995\,\text{V}$: saturated ✓. ($M_1$ is a diode: always saturated.)

        **Small-signal values.** $g_m = I_C/V_T = 39.6\,\text{mS}$, $r_\pi = \beta/g_m = 2.525\kO$; $g_{m1} = 2I_C/V_{ov} = 1.99\,\text{mS}$; $g_{m2} = 2(1.98)/0.995 = 3.98\,\text{mS} = 2g_{m1}$.

        **(d)** The emitter is grounded by $C_E$, so the base sees only $r_\pi$: $R_{in} = 2.525\kO\approx2.5\kO$.

        **(e)** Node $A$: looking into $Q_1$'s collector you see an open circuit ($r_o = \infty$); looking into $M_1$ you see a diode. $R_A = 1/g_{m1} = 502\,\Omega\approx500\,\Omega$.

        **(f)** Draw the model (figure). KCL at $A$: the current pulled out of $A$ by $Q_1$, $g_mv_{in}$, must be supplied by the diode: $g_{m1}v_a = -g_mv_{in}$, so
        $$\frac{v_a}{v_{in}} = -\frac{g_m}{g_{m1}} = -\frac{39.6}{1.99} = -19.9$$
        A BJT working into a MOS diode: the gain is the ratio of transconductances. With $g_m = I/V_T$ and $g_{m1} = 2I/V_{ov}$ it is $V_{ov}/(2V_T) = 0.995/0.05 = 19.9$, whatever the current.

        [[fig:model]]

        **(g)** $M_2$ draws $g_{m2}v_a$ from the output node; $R_D$ supplies it: $v_{out} = -g_{m2}v_aR_D$. So
        $$A_v = \frac{v_{out}}{v_{in}} = \frac{g_{m2}}{g_{m1}}\,g_mR_D = 2\times(39.6\,\text{mS})(1.5\kO) = +118.8\approx+120$$
        In the $G_MR_{out}$ language: short the output, and the current pulled into the stage is $i_{d2} = g_{m2}v_a = -2g_mv_{in}$, so $G_M = -2g_m$ (negative, like a follower), $R_{out} = R_D$ (with $r_{ds2} = \infty$), and $A_v = -G_MR_{out} = +2g_mR_D$.

        **(h)** Base up, $V_{EB}$ down, less PNP current into the diode, $v_a$ down (first inversion); $M_2$ carries less current, less drop across $R_D$, $v_{out}$ up (second inversion).

        !!key A mirror is a current amplifier
        The diode converts current to voltage ($\times1/g_{m1}$), the copy converts it back ($\times g_{m2}$): current gain $g_{m2}/g_{m1} = (W/L)_2/(W/L)_1$, with **no** sign change. Feeding it from a BJT gives a large, non-inverting gain set by $g_m$ of the BJT, the size ratio, and $R_D$.
      `,
    }),
    P({
      id: 'e3pJ-2', src: 'Exam 3 practice J · Problem 2 (35 pts)', title: 'The K rule under a degenerated PNP', big: true,
      q: md`$Q_1$ (PNP) has $R_E$ from its emitter to $V_{CC}$ and $v_{in}$ on its base; its collector is the output, node $X$. Below it, $M_2$ (NMOS) has $R_S$ in its source, and its gate is driven from its own drain by the divider $R_1$ (from $X$ to the gate) and $R_2$ (from the gate to ground). Keep $r_{o1}$ and $r_{ds2}$. In symbols:

(a) $R_{DN}$, looking down into $M_2$'s drain (the transistor only, not the divider). (b) $R_{UP}$, looking up into $Q_1$'s collector with $v_{in} = 0$. (c) $R_{out}$, the total resistance at node $X$. (d) $G_M$ of the stage (you may ignore $r_{o1}$ here). (e) $A_v = v_{out}/v_{in}$. (f) A limit check.`,
      fig: J2Fig,
      parts: [
        ex(J2RDN, ['gm2', 'rds2', 'RS', 'R1', 'R2'], 'R_{DN}', { ranges: J2r }),
        ex(J2RUP, ['gm1', 'rpi1', 'ro1', 'RE'], 'R_{UP}', { ranges: J2r }),
        ex(`${J2RUP} || (${J2RDN}) || (R1 + R2)`, ['gm1', 'rpi1', 'ro1', 'RE', 'gm2', 'rds2', 'RS', 'R1', 'R2'], 'R_{out}', { ranges: J2r }),
        ex(J2GM, ['gm1', 'beta1', 'RE'], 'G_M', { ranges: J2r }),
        ex(`-(${J2GM})*(${J2RUP} || (${J2RDN}) || (R1 + R2))`, ['gm1', 'beta1', 'rpi1', 'ro1', 'RE', 'gm2', 'rds2', 'RS', 'R1', 'R2'], 'A_v', { ranges: J2r }),
        { lbl: '(f) Set $R_S = 0$ and $R_1 = 0$ (so the gate is tied to the drain). Then $R_{DN}$ becomes', mc: ['$r_{ds2}\\parallel\\dfrac{1}{g_{m2}}$: a diode-connected transistor', '$r_{ds2}$: a current source', '$r_{ds2}(1 + g_{m2}R_2)$: a degenerated drain', '$\\dfrac{R_1 + R_2}{R_2}\\cdot\\dfrac{1}{g_{m2}}$, which blows up'], a: 0,
          why: [null, '$r_{ds2}$ is what you see when the gate is **held** ($K = 0$). With $R_1 = 0$ the gate follows the drain fully: $K = 1$.', 'Degeneration needs a resistor in the **source**; here $R_S = 0$. $R_2$ only sets $K$.', 'With $R_1 = 0$, $(R_1 + R_2)/R_2 = 1$: nothing blows up. That is the diode, $1/g_{m2}$.'] },
      ],
      hints: [
        md`$M_2$'s gate is not held: the divider puts $v_g = Kv_x$ with $K = R_2/(R_1 + R_2)$ (the gate draws no current, so the divider is unloaded). That is Exam 2's **K rule**: $R = \dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$.`,
        md`$Q_1$ with $v_{in} = 0$: its base is grounded for signals, so $r_{\pi1}$ goes from the emitter to ground, **in parallel with $R_E$**. A degenerated collector: $r_o + (R_E\parallel r_\pi)(1 + g_mr_o)$.`,
        md`Node $X$ has three things on it: $Q_1$'s collector, $M_2$'s drain, and the divider $R_1 + R_2$ to ground.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: PNP (emitter on top, through $R_E$ to $V_{CC}$), in at the **base**, out at the **collector**: a **degenerated common emitter**. Looking into its collector with the base held: a **degenerated collector**, big.
        - $M_2$: its gate is tied to a tap on a divider from its own drain. The gate **moves** with the drain, by $K = R_2/(R_1 + R_2)$: Exam 2's **K rule**, here with $R_S$ in the source. Expect something like a diode scaled up by $1/K$ and by the degeneration: small.
        - So the output node is "big $\parallel$ small $\parallel(R_1 + R_2)$": the small ones set the gain.

        **(a) The K rule, derived.** Apply $v_x$ to the drain; then $v_g = Kv_x$. The current $i_x$ into the drain leaves through $R_S$ (the gate takes nothing), so $v_s = i_xR_S$. The model:
        $$i_x = g_{m2}(v_g - v_s) + \frac{v_x - v_s}{r_{ds2}} = g_{m2}Kv_x - g_{m2}R_Si_x + \frac{v_x}{r_{ds2}} - \frac{R_Si_x}{r_{ds2}}$$
        Collect terms and multiply by $r_{ds2}$:
        $$i_x\big(r_{ds2} + R_S + g_{m2}r_{ds2}R_S\big) = v_x\big(1 + g_{m2}r_{ds2}K\big)\ \Rightarrow\ R_{DN} = \frac{r_{ds2} + R_S + g_{m2}r_{ds2}R_S}{1 + g_{m2}r_{ds2}K},\quad K = \frac{R_2}{R_1 + R_2}$$
        With $g_{m2}r_{ds2}K\gg1$: $R_{DN}\approx\dfrac{R_S + 1/g_{m2}}{K}$. A degenerated diode, scaled up by $1/K$.

        **(b) Degenerated collector.** With $v_{in} = 0$, $r_{\pi1}$ runs from the emitter to ground, in parallel with $R_E$. A test current into the collector leaves through $R_E\parallel r_{\pi1}$, so $v_e = i_t(R_E\parallel r_{\pi1})$ and $v_\pi = -v_e$; the current in $r_{o1}$ is $i_t(1 + g_{m1}(R_E\parallel r_{\pi1}))$:
        $$R_{UP} = r_{o1} + (R_E\parallel r_{\pi1})(1 + g_{m1}r_{o1})\approx r_{o1}\big[1 + g_{m1}(R_E\parallel r_{\pi1})\big]$$
        (For a PNP the model is the same; only the drawing is upside down.)

        **(c)** Everything on node $X$, in parallel:
        $$R_{out} = R_{UP}\parallel R_{DN}\parallel(R_1 + R_2)$$
        In practice $R_{UP}$ is megohms and the other two are kilohms, so $R_{out}\approx R_{DN}\parallel(R_1 + R_2)$.

        **(d)** Short the output; KVL from the base: $v_{in} = v_\pi + (i_c + i_b)R_E$ with $i_c = g_{m1}v_\pi$, $i_b = i_c/\beta_1$ (Lecture 24):
        $$G_M = \frac{g_{m1}}{1 + g_{m1}R_E(\beta_1 + 1)/\beta_1}\approx\frac{g_{m1}}{1 + g_{m1}R_E}$$

        **(e)**
        $$A_v = -G_M\,\big[R_{UP}\parallel R_{DN}\parallel(R_1 + R_2)\big]\approx-\frac{\dfrac{R_S + 1/g_{m2}}{K}\parallel(R_1 + R_2)}{R_E + 1/g_{m1}}$$
        A ratio of resistances, as for any degenerated stage loaded by a diode: about (what the load looks like)/(what the emitter looks like).

        **(f) Limit check.** $R_1 = 0$ makes $K = 1$, and $R_S = 0$ removes the degeneration: $R_{DN} = \dfrac{r_{ds2}}{1 + g_{m2}r_{ds2}} = r_{ds2}\parallel\dfrac{1}{g_{m2}}$, the diode ✓. The other end, $K = 0$ (gate held): $R_{DN} = r_{ds2} + R_S + g_{m2}r_{ds2}R_S$, the degenerated drain ✓.

        !!key The K rule, one line
        A drain whose gate moves by $Kv_x$: numerator = the degenerated drain ($K = 0$), denominator $= 1 + g_mr_{ds}K$. $K$ comes from whatever drives the gate: a divider here, a diode connection ($K = 1$), or a follower.
      `,
    }),
    P({
      id: 'e3pJ-3', src: 'Exam 3 practice J · Problem 3 (30 pts)', title: 'A finite bypass capacitor: the transfer function of a common emitter', big: true,
      q: md`A PNP common emitter: $R_E = 100\,\Omega$ from the emitter to $V_{CC}$, bypassed by $C_E = 1\,\mu\text{F}$ (**not** infinite); $R_C = 5\kO$ from the collector to ground, with a load capacitance $C_L = 2\,\text{pF}$. The base is driven by an ideal source ($V_B$ plus $v_{in}$). $I_C = 1\,\text{mA}$; take $\beta\gg1$ (ignore the base current) and $r_o = \infty$; ignore $C_\pi$ and $C_\mu$.

(a) The DC gain $A_v(0)$ (where $C_E$ is open). (b) The mid-band gain (where $C_E$ is a short but $C_L$ is still open). (c) Show that $A_v(s) = -\dfrac{g_mR_C}{1 + g_mZ_E}\cdot\dfrac{1}{1 + sR_CC_L}$ with $Z_E = R_E\parallel\dfrac{1}{sC_E}$, and find the zero $\omega_z$. (d) The pole $\omega_{p1}$ set by $C_E$. (e) The pole $\omega_{p2}$ set by $C_L$. (f) The straight-line $|A_v|$ in dB at $\omega = 2\times10^4\,\text{rad/s}$. (g) The straight-line phase at $\omega = 10^6\,\text{rad/s}$ (take the phase of a negative gain as $+180^\circ$). (h) What $C_E$ would put $\omega_{p1}$ at $100\,\text{rad/s}$?`,
      fig: J3Fig,
      parts: [
        { lbl: 'A_v(0)', unit: '', ans: -40, traps: [{ v: -50, msg: 'That is $-R_C/R_E$, the $g_mR_E\\gg1$ limit. Here $g_mR_E = 4$: keep the $1/g_m$, $A = -R_C/(R_E + 1/g_m)$.' }, { v: -200, msg: 'At DC the capacitor is open, so $R_E$ degenerates the stage. $-g_mR_C$ is the gain once $C_E$ shorts $R_E$.' }] },
        { lbl: 'A_{v,\\text{mid}}', unit: '', ans: -200 },
        { lbl: '\\omega_z', unit: 'rad/s', ans: 1e4, traps: [{ v: 5e4, msg: 'That is the pole. The zero is where $C_E$\'s impedance equals $R_E$ alone: $1/(R_EC_E)$.' }] },
        { lbl: '\\omega_{p1}', unit: 'rad/s', ans: 5e4, traps: [{ v: 1e4, msg: 'That is the zero, $1/(R_EC_E)$. The pole is $(1 + g_mR_E)$ times higher: the capacitor sees $R_E$ in parallel with $1/g_m$.' }] },
        { lbl: '\\omega_{p2}', unit: 'rad/s', ans: 1e8 },
        { lbl: '|A_v(j2\\times10^4)|', unit: 'dB', ans: 38.06, accept: [38.4], traps: [{ v: 32.04, msg: 'Past the zero at $10^4$ the straight line rises at $+20\\,\\text{dB/dec}$: $2\\times$ the frequency adds $6\\,\\text{dB}$.' }] },
        { lbl: '\\angle A_v(j10^6)', unit: 'deg', ans: 180, accept: [-180, 181.7, -178.3] },
        { lbl: 'C_E\\ (\\omega_{p1} = 100)', unit: 'µF', ans: 500, traps: [{ v: 100, msg: 'That puts the **zero** at $100\\,\\text{rad/s}$. The pole is at $(1 + g_mR_E)/(R_EC_E)$: you need $5\\times$ more.' }] },
      ],
      hints: [
        md`$g_m = 40\,\text{mS}$, so $g_mR_E = 4$. With an impedance $Z_E$ in the emitter, the degenerated $G_M = g_m/(1 + g_mZ_E)$ still holds (the derivation never used that $Z_E$ was real).`,
        md`$1 + g_mZ_E = 1 + \dfrac{g_mR_E}{1 + sR_EC_E} = \dfrac{(1 + g_mR_E) + sR_EC_E}{1 + sR_EC_E}$. Divide top and bottom by $1 + g_mR_E$ to reach the $(1 + s/\omega)$ form.`,
        md`Straight lines: $32\,\text{dB}$ flat, $+20\,\text{dB/dec}$ from $\omega_z$ to $\omega_{p1}$, flat at $46\,\text{dB}$, then $-20\,\text{dB/dec}$ after $\omega_{p2}$.`,
      ],
      figs: { bode: { svg: J3Plot, cap: 'The transfer function of J-3. Solid: straight lines; dashed: exact. The shelf from $32$ to $46\\,\\text{dB}$ is the bypass capacitor taking over from $R_E$; the roll-off at $10^8$ is $C_L$.' } },
      sol: md`
        **Recognize it first.** In at the **base**, out at the **collector**, with something in the emitter: a **degenerated common emitter** (a PNP, drawn emitter-up). The only twist is that the degeneration is now an **impedance**, $Z_E = R_E\parallel\dfrac1{sC_E}$, which changes with frequency: at DC it is $R_E$ (full degeneration), at high frequency it is a short (no degeneration). So the gain climbs from $-R_C/(R_E + 1/g_m)$ to $-g_mR_C$: one zero and one pole. $C_L$ adds the usual output pole.

        **(a)** $g_m = I_C/V_T = 40\,\text{mS}$, $g_mR_E = 4$. At DC, $C_E$ is open:
        $$A_v(0) = -\frac{g_mR_C}{1 + g_mR_E} = -\frac{200}{5} = -40\quad(32.0\,\text{dB})$$

        **(b)** Mid-band, $C_E$ shorts $R_E$: $A_{v,\text{mid}} = -g_mR_C = -200$ ($46.0\,\text{dB}$).

        **(c) The transfer function.** The degenerated-CE derivation (short the output, KVL from the base: $v_{in} = v_\pi + g_mv_\pi Z_E$) never used that the emitter element was a resistor, so $G_M = g_m/(1 + g_mZ_E)$. The output node is $R_C\parallel\dfrac1{sC_L} = \dfrac{R_C}{1 + sR_CC_L}$. Now
        $$1 + g_mZ_E = 1 + \frac{g_mR_E}{1 + sR_EC_E} = \frac{(1 + g_mR_E) + sR_EC_E}{1 + sR_EC_E}$$
        so
        $$A_v(s) = -\frac{g_mR_C}{1 + g_mR_E}\cdot\frac{1 + sR_EC_E}{1 + s\,\dfrac{R_EC_E}{1 + g_mR_E}}\cdot\frac{1}{1 + sR_CC_L}$$
        The zero: $\omega_z = \dfrac1{R_EC_E} = \dfrac1{(100)(1\,\mu)} = 10^4\,\text{rad/s}$.

        **(d)** The pole: $\omega_{p1} = \dfrac{1 + g_mR_E}{R_EC_E} = 5\times10^4\,\text{rad/s}$. Read it as one pole per node: $C_E$ sees $R_E$ in parallel with the resistance looking into the emitter, $1/g_m = 25\,\Omega$; $100\parallel25 = 20\,\Omega$, and $1/(20\cdot1\,\mu) = 5\times10^4$ ✓.

        **(e)** $\omega_{p2} = \dfrac1{R_CC_L} = \dfrac1{(5\,\text{k})(2\,\text{p})} = 10^8\,\text{rad/s}$. In standard form:
        $$A_v(s) = -40\,\frac{1 + s/10^4}{(1 + s/(5\times10^4))(1 + s/10^8)}$$
        Check: the shelf rises by $\omega_{p1}/\omega_z = 5$, from $40$ to $200$ ✓.

        [[fig:bode]]

        **(f)** $2\times10^4$ is past the zero and before the pole, on the $+20\,\text{dB/dec}$ segment: $32.0 + 20\log_{10}2 = 32.0 + 6.0 = 38.1\,\text{dB}$. (Exact: $38.4\,\text{dB}$.)

        **(g)** At $10^6$: the zero has finished ($+90^\circ$ by $10^5$), the first pole has finished ($-90^\circ$ by $5\times10^5$), and the second pole has not started (it starts at $10^7$). Straight line: $180^\circ + 90^\circ - 90^\circ = 180^\circ$. (Exact: $181.7^\circ$.) Mid-band is a plain inverting amplifier.

        **(h)** $\omega_{p1} = \dfrac{1 + g_mR_E}{R_EC_E} = 100$ gives $C_E = \dfrac{5}{(100)(100)} = 500\,\mu\text{F}$.

        !!key Why bypass capacitors are huge
        The capacitor does not fight $R_E$ alone; it fights $R_E\parallel(1/g_m)$, about $20\,\Omega$ here. To be a short down to low frequencies it needs $\omega\gg1/(20\,\Omega\cdot C_E)$: hundreds of microfarads for audio. The gain only reaches $-g_mR_C$ above $\omega_{p1}$, not above $\omega_z$.
      `,
    }),
  ];

  // ================================================================== Practice exam K
  const K1Fig = [
    ['rail', [1, -2.4], { n: 'V_{DD} = 5\\,\\text{V}' }], ['pmos', [1, -1.4], { n: 'M_2', sz: '40/1', dc: true }],
    ['w', [1, -0.4], [1, 0]], ['npn', [1, 1], { n: 'Q_1' }],
    ['w', [1, -0.4], [2, -0.4]], ['C', [2, -0.4], [2.8, -0.4], { n: '\\infty' }], ['w', [2.8, -0.4], [3.4, -0.4]], ['term', [3.4, -0.4], { n: 'v_{out}', side: 'a' }],
    ['R', [3.4, -0.4], [3.4, 0.9], { n: 'R_L', s: '500\\,\\Omega' }], ['gnd', [3.4, 0.9]],
    ['R', [1, 2], [1, 3.2], { n: 'R_E', s: kO(1), side: 'l' }], ['gnd', [1, 3.2]],
    ['w', [1, 2], [1.8, 2]], ['C', [1.8, 2], [1.8, 3.2], { n: 'C_E' }], ['w', [1.8, 3.2], [1, 3.2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 2.3], [-0.6, 3.3], { n: Vv(1.7), side: 'l' }], ['gnd', [-0.6, 3.3]],
  ];
  const K2Fig = [
    ['rail', [2, -2.4], { n: 'V_{DD}' }], ['R', [2, -2.4], [2, -1], { n: 'R_F' }], ['node', [2, -1], { n: 'F', side: 'ar' }],
    ['w', [2, -1], [0.6, -1]], ['nmos', [0.6, 0], { n: 'M_1' }], ['gnd', [0.6, 1]],
    ['w', [-0.4, 0], [-0.9, 0], [-0.9, 0.3]], ['Vac', [-0.9, 0.3], [-0.9, 1.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.9, 1.3]],
    ['pnp', [2, 0], { n: 'Q_2', flip: true }], ['acg', [3, 0]],
    ['w', [2, 1], [3.6, 1]], ['term', [3.6, 1], { n: 'v_{out}' }],
    ['nmos', [2, 2], { n: 'M_3' }], ['acg', [1, 2]], ['gnd', [2, 3]],
  ];
  const K3Fig = [
    ['rail', [2, -2.4], { n: 'V_{CC}' }], ['R', [2, -2.4], [2, -1], { n: 'R_E', s: '75\\,\\Omega' }],
    ['pnp', [2, 0], { n: 'Q_1' }],
    ['R', [2, 1], [2, 2.4], { n: 'R_C', s: kO(5), side: 'l' }], ['gnd', [2, 2.4]],
    ['w', [2, 1], [3.8, 1]], ['term', [3.8, 1], { n: 'v_{out}' }], ['C', [3.2, 1], [3.2, 2.2], { n: 'C_L' }], ['gnd', [3.2, 2.2]],
    ['w', [1, 0], [0.4, 0]], ['C', [0.4, 0], [0.4, -1], { n: 'C_\\pi' }], ['w', [0.4, -1], [2, -1]],
    ['C', [0.4, 0], [0.4, 1], { n: 'C_\\mu' }], ['w', [0.4, 1], [2, 1]],
    ['R', [-0.9, 0], [0.4, 0], { n: 'R_S', s: kO(10) }],
    ['w', [-0.9, 0], [-1.4, 0], [-1.4, 0.3]], ['Vac', [-1.4, 0.3], [-1.4, 1.3], { n: 'v_{in}', side: 'l' }],
    ['V', [-1.4, 1.3], [-1.4, 2.3], { n: 'V_B', side: 'l' }], ['gnd', [-1.4, 2.3]],
  ];
  const K2r = { gm1: [2e-3, 40e-3], rds1: [3e5, 1e6], RF: [3e3, 1e4], gm2: [30e-3, 80e-3], beta2: [150, 300] };
  const K2RE = 'rpi2 || ((ro2 + rds3)/(1 + gm2*ro2))';
  const K2RUP = '(ro2 + (RF || rds1 || rpi2)*(1 + gm2*ro2))';
  const K2GM = 'gm1*(gm2 + 1/ro2)/(1/RF + 1/rds1 + (beta2 + 1)/rpi2 + 1/ro2)';

  const Kex = [
    intro('K', 'A BJT on a MOS diode load, a BiCMOS folded cascode, and what emitter degeneration does to the bandwidth.'),
    P({
      id: 'e3pK-1', src: 'Exam 3 practice K · Problem 1 (35 pts)', title: 'A common emitter on a PMOS diode load', big: true,
      q: md`$V_{DD} = 5\,\text{V}$. $Q_1$ (NPN, $\beta = 100$, $r_o = \infty$): base at $1.7\,\text{V}$ DC plus $v_{in}$, $R_E = 1\kO$ to ground bypassed by $C_E$ (infinite). Its collector load is $M_2$, a diode-connected PMOS ($W/L = 40/1$, $\lambda = 0$) with its source on $V_{DD}$. The output is the collector; in part (f) a load $R_L = 500\,\Omega$ is coupled to it through an infinite capacitor.

(a) $I_C$. (b) The DC output voltage $V_{OUT}$; is $Q_1$ forward-active? (c) $R_{in}$, looking into the base. (d) $R_{out}$, the small-signal resistance at the output without $R_L$. (e) $A_v = v_{out}/v_{in}$ without $R_L$. (f) $A_v$ with $R_L$ connected. (g) The $W/L$ of $M_2$ that would give $|A_v| = 40$ without $R_L$, at the same current. (h) Why can't you keep raising the gain this way?`,
      fig: K1Fig,
      parts: [
        { lbl: 'I_C', unit: 'mA', ans: 0.990, accept: [1] },
        { lbl: 'V_{OUT}', unit: 'V', ans: 3.005, accept: [3], traps: [{ v: 4, msg: 'That drops only $|V_{TP}|$ across $M_2$. A diode carrying $1\\,\\text{mA}$ needs an overdrive too: $V_{SG} = 1 + V_{ov}$.' }] },
        { lbl: 'R_{in}', unit: 'kΩ', ans: 2.525, accept: [2.5], traps: [{ v: 103.5, msg: 'The emitter is bypassed: $R_E$ is a short for signals, so it is not multiplied by $\\beta + 1$.' }] },
        { lbl: 'R_{out}', unit: 'Ω', ans: 502.5, accept: [500] },
        { lbl: 'A_v', unit: '', ans: -19.9, accept: [-20], traps: [{ v: 19.9, msg: 'A common emitter inverts, whatever its load.' }] },
        { lbl: 'A_v\\ \\text{with}\\ R_L', unit: '', ans: -9.93, accept: [-10], traps: [{ v: -19.9, msg: 'The coupling capacitor puts $R_L$ in parallel with the diode\'s $1/g_{m2}$ for signals, and $500\\,\\Omega$ against $500\\,\\Omega$ halves the gain.' }] },
        { lbl: '(W/L)_2', unit: '', ans: 9.9, accept: [10], traps: [{ v: 20, msg: '$g_{m2} = \\sqrt{2\\mu_pC_{ox}(W/L)I_D}$ grows only as the **square root** of $W/L$. To halve $g_{m2}$ at the same current you need a quarter of the $W/L$.' }] },
        { lbl: '(h) What stops you from raising $|A_v|$ further by shrinking $M_2$?', mc: ['Headroom: $V_{SG} = 1 + V_{ov}$ grows with the gain and pulls the collector down until $Q_1$ saturates', '$g_{m1}$ falls as $M_2$ shrinks', '$M_2$ leaves saturation', '$r_\\pi$ starts to load the output'], a: 0,
          why: [null, '$I_C$ is set by the base and emitter ($I_E = 1\\,\\text{mA}$), not by the load, so $g_{m1}$ does not change.', 'A diode-connected MOSFET has $V_{SD} = V_{SG}$, so it is always saturated.', '$r_\\pi$ is at the base; with $r_o = \\infty$ nothing at the base touches the collector.'] },
      ],
      hints: [
        md`DC: $V_E = 1.7 - 0.7 = 1.0\,\text{V}$ sets $I_E$. All of $I_C$ goes through $M_2$: $I_C = \tfrac12(50\,\mu)(40)V_{ov}^2$, and $V_{OUT} = 5 - (1 + V_{ov})$.`,
        md`A diode-connected transistor looks like $1/g_m$ (Exam 2). With $r_o = \infty$, $R_{out} = 1/g_{m2}$ and $A_v = -g_{m1}/g_{m2}$.`,
        md`$\dfrac{g_{m1}}{g_{m2}} = \dfrac{I/V_T}{2I/V_{ov}} = \dfrac{V_{ov}}{2V_T}$: the gain is set by $M_2$'s overdrive alone.`,
      ],
      sol: md`
        **Recognize it first.** In at the **base**, out at the **collector**, emitter bypassed: a **common emitter**. Its load is a **diode-connected PMOS** (gate tied to drain), which from its drain looks like $1/g_{m2}$ (Exam 2's diode load). So $A_v = -g_{m1}(1/g_{m2})$: the ratio of a BJT's transconductance to a MOSFET's at the same current.

        **(a)** $V_E = 1.7 - 0.7 = 1.0\,\text{V}$, $I_E = 1\,\text{V}/1\,\text{k} = 1\,\text{mA}$, $I_C = \alpha I_E = 0.990\,\text{mA}$.

        **(b)** $M_2$ carries $I_C$: $\tfrac12(50\,\mu)(40) = 1\,\text{mA/V}^2$, so $V_{ov} = \sqrt{0.990} = 0.995\,\text{V}$ and $V_{SG} = 1.995\,\text{V}$:
        $$V_{OUT} = 5 - 1.995 = 3.005\,\text{V}$$
        $V_C = 3.0\,\text{V} > V_B = 1.7\,\text{V}$: forward-active ✓ ($V_{CE} = 2.0\,\text{V}$).

        **(c)** Emitter bypassed: $R_{in} = r_\pi = \beta/g_{m1} = 100/39.6\,\text{mS} = 2.525\kO$.

        **(d)** Looking into $Q_1$'s collector: open ($r_o = \infty$). Looking into the diode: apply $v_x$ to its drain. The gate is tied to the drain and the source sits on $V_{DD}$ (a signal ground), so $v_{gs} = v_x$, and the model gives $i_x = g_{m2}v_{gs} = g_{m2}v_x$ flowing in at the drain: a resistance $1/g_{m2}$. With $g_{m2} = 2I/V_{ov} = 2(0.990)/0.995 = 1.99\,\text{mS}$:
        $$R_{out} = \frac{1}{g_{m2}} = 502\,\Omega$$

        **(e)** $A_v = -g_{m1}R_{out} = -(39.6\,\text{mS})(502\,\Omega) = -19.9$. Look at it as a ratio:
        $$|A_v| = \frac{g_{m1}}{g_{m2}} = \frac{I/V_T}{2I/V_{ov}} = \frac{V_{ov}}{2V_T} = \frac{0.995}{0.05} = 19.9$$
        The current cancels: the gain depends only on $M_2$'s overdrive. (Exam 2's all-MOS version gave $\sqrt{(W/L)_1/(W/L)_2}$; a BJT's $g_m$ is so large that one ordinary diode already gives a gain of 20.)

        **(f)** With $R_L$: the output node sees $502\parallel500 = 251\,\Omega$, so $A_v = -(39.6\,\text{m})(251) = -9.93$. A diode load has a **low** output resistance, so a modest load halves the gain.

        **(g)** $|A_v| = V_{ov}/(2V_T) = 40$ needs $V_{ov} = 2\,\text{V}$. At $I = 0.990\,\text{mA}$:
        $$\frac{W}{L} = \frac{2I}{\mu_pC_{ox}V_{ov}^2} = \frac{2(0.990\,\text{m})}{(50\,\mu)(4)} = 9.9\approx10$$
        Then $V_{SG} = 3\,\text{V}$ and $V_{OUT} = 2\,\text{V}$: still above $V_B = 1.7\,\text{V}$, but only just.

        **(h)** Every factor of gain costs $2V_T = 50\,\text{mV}$ of overdrive, taken from the collector's headroom. $|A_v| = 60$ would need $V_{SG} = 4\,\text{V}$, $V_{OUT} = 1\,\text{V} < V_B$: $Q_1$ saturates. That is why high gain needs a current-source load instead of a diode.

        !!key A transistor on a diode
        Gain $= -g_{m,\text{amp}}/g_{m,\text{load}}$. BJT on a MOS diode: $-V_{ov}/(2V_T)$. MOS on a MOS diode: $-\sqrt{(W/L)_1/(W/L)_2}$ (same current, same mobility). The output resistance is low, about $1/g_{m,\text{load}}$, so the stage drives loads poorly.
      `,
    }),
    P({
      id: 'e3pK-2', src: 'Exam 3 practice K · Problem 2 (35 pts)', title: 'A BiCMOS folded cascode: NMOS in, PNP cascode', big: true,
      q: md`A folded cascode. $M_1$ (NMOS, source grounded) takes $v_{in}$ at its gate; its drain is the fold node $F$, which $R_F$ ties to $V_{DD}$. $Q_2$ (PNP, base at a fixed bias) has its emitter at $F$ and its collector at the output; $M_3$ (NMOS, gate at a fixed bias) is the output's current source. Keep $r_{ds1}$, $r_{o2}$ and $r_{ds3}$. In symbols:

(a) $R_{E2}$, looking into $Q_2$'s emitter from node $F$ (with the output loaded only by $M_3$). (b) $R_{UP}$, looking up into $Q_2$'s collector from the output, with $v_{in} = 0$. (c) $R_{out}$. (d) $G_M$ of the stage. (e) $A_v = v_{out}/v_{in}$. (f) Why $R_{UP}$ stops growing once $R_F$ is large.`,
      fig: K2Fig,
      parts: [
        ex(K2RE, ['gm2', 'beta2', 'rpi2', 'ro2', 'rds3'], 'R_{E2}', { ranges: K2r }),
        ex(K2RUP, ['gm2', 'beta2', 'rpi2', 'ro2', 'RF', 'rds1'], 'R_{UP}', { ranges: K2r }),
        ex(`rds3 || ${K2RUP}`, ['gm2', 'beta2', 'rpi2', 'ro2', 'RF', 'rds1', 'rds3'], 'R_{out}', { ranges: K2r }),
        ex(K2GM, ['gm1', 'gm2', 'beta2', 'rpi2', 'ro2', 'RF', 'rds1'], 'G_M', { ranges: K2r }),
        ex(`-(${K2GM})*(rds3 || ${K2RUP})`, ['gm1', 'gm2', 'beta2', 'rpi2', 'ro2', 'RF', 'rds1', 'rds3'], 'A_v', { ranges: K2r }),
        { lbl: '(f) As $R_F\\to\\infty$, $R_{UP}$ levels off near $(\\beta_2 + 1)r_{o2}$ because', mc: ['$r_{\\pi2}$, from $F$ to the held base, takes over as the emitter\'s degeneration, and $g_{m2}r_{\\pi2} = \\beta_2$', '$r_{ds1}$ is in parallel with $R_F$', 'the output current source $M_3$ is in parallel', 'a PNP has a lower $\\beta$ than an NPN'], a: 0,
          why: [null, '$r_{ds1}$ does sit in parallel with $R_F$, but it is large; the ceiling is set by the much smaller $r_{\\pi2}$, which a MOS cascode would not have.', '$M_3$ limits $R_{out}$, not $R_{UP}$: $R_{UP}$ is defined looking up, without $M_3$.', 'The ceiling is $(\\beta + 1)r_o$ for any BJT, NPN or PNP; the cause is the base current, i.e. $r_\\pi$.'] },
      ],
      hints: [
        md`Name the pieces: $M_1$ is a common source whose drain current is **folded**: it is pulled out of node $F$, where $Q_2$'s emitter supplies most of it. $Q_2$ (base held, in at the emitter, out at the collector) is a **common base**. Together: a folded cascode (Exam 2), with a PNP as the cascode device.`,
        md`(a) An emitter with the base held: its current can leave through $r_{\pi2}$ (into the base) or through the collector into $r_{ds3}$. The second path is Exam 2's "source with a drain load", $(r_o + R_D)/(1 + g_mr_o)$.`,
        md`(b) A degenerated collector: the emitter sees $R_F\parallel r_{ds1}$ to ground **and** $r_{\pi2}$ to the held base. (d) Short the output: $M_1$'s current $g_{m1}v_{in}$ divides at $F$ between $R_F\parallel r_{ds1}$ and $Q_2$'s emitter (about $1/g_{m2}$); $Q_2$ passes $\alpha$ of its share to the output.`,
      ],
      sol: md`
        **Recognize it first.**
        - $M_1$: in at the **gate**, out at the **drain**, source grounded: a **common source**, but its drain is not the output.
        - $Q_2$: PNP drawn emitter-up, **base held**, in at the **emitter** (node $F$), out at the **collector**: a **common base**. A CS feeding a CB is a cascode; because the CB is a PNP hanging from $V_{DD}$, the signal current turns around at $F$: a **folded cascode**.
        - $M_3$: gate held, the output's current source: $r_{ds3}$ looking down.
        - $R_F$ supplies the DC current of both $M_1$ and $Q_2$; for signals it is a resistor from $F$ to ground.

        **(a) Into $Q_2$'s emitter** (base held: $v_\pi = -v_e$). A test current into the emitter has two ways out: into the base through $r_{\pi2}$, or across the transistor into the collector node and down $r_{ds3}$. KCL at the collector: what arrives through $r_{o2}$ and the $g_{m2}v_\pi$ source leaves through $r_{ds3}$, which gives Exam 2's source-with-a-drain-load result for the second path:
        $$R_{E2} = r_{\pi2}\parallel\frac{r_{o2} + r_{ds3}}{1 + g_{m2}r_{o2}}\approx\frac{1}{g_{m2}}\Big(1 + \frac{r_{ds3}}{r_{o2}}\Big)$$
        About $2/g_{m2}$ when $r_{ds3}\approx r_{o2}$: still small, so $F$ is a low-impedance node.

        **(b) Into $Q_2$'s collector.** A **degenerated collector**: the emitter sees $R_F\parallel r_{ds1}$ (to ground with $v_{in} = 0$) and $r_{\pi2}$ (to the held base), all in parallel. Push $i_t$ into the collector; it leaves through that parallel combination, so $v_e = i_t(R_F\parallel r_{ds1}\parallel r_{\pi2})$ and $v_\pi = -v_e$; the current in $r_{o2}$ is $i_t\big(1 + g_{m2}(R_F\parallel r_{ds1}\parallel r_{\pi2})\big)$:
        $$R_{UP} = r_{o2} + (R_F\parallel r_{ds1}\parallel r_{\pi2})(1 + g_{m2}r_{o2})\approx r_{o2}\big[1 + g_{m2}(R_F\parallel r_{\pi2})\big]$$

        **(c)** $R_{out} = r_{ds3}\parallel R_{UP}$. Usually $R_{UP}\gg r_{ds3}$, so the output current source sets $R_{out}$: to use the cascode fully, cascode $M_3$ too.

        **(d) $G_M$: short the output.** Now $Q_2$'s emitter looks like $r_{\pi2}\parallel\dfrac{r_{o2}}{1 + g_{m2}r_{o2}}\approx1/g_{m2}$. $M_1$ pulls $g_{m1}v_{in}$ out of $F$; that current is supplied by $R_F\parallel r_{ds1}$ and by $Q_2$'s emitter, which split it like any current divider, and $Q_2$ passes $\alpha_2$ of its emitter current on to the collector. Writing KCL at $F$ exactly:
        $$G_M = g_{m1}\,\frac{g_{m2} + 1/r_{o2}}{\dfrac1{R_F} + \dfrac1{r_{ds1}} + \dfrac{\beta_2 + 1}{r_{\pi2}} + \dfrac1{r_{o2}}}\approx g_{m1}\,\alpha_2\,\frac{R_F}{R_F + 1/g_{m2}}\approx g_{m1}$$
        Sign: $v_{in}$ up, $M_1$ pulls more current from $F$, $F$ falls, $Q_2$'s $V_{EB}$ falls, $Q_2$ delivers less current into the output: the output loses current, $G_M > 0$.

        **(e)**
        $$A_v = -G_MR_{out}\approx-g_{m1}\Big(r_{ds3}\parallel r_{o2}\big[1 + g_{m2}(R_F\parallel r_{\pi2})\big]\Big)$$

        **(f) The $\beta r_o$ ceiling.** As $R_F$ grows, $R_F\parallel r_{\pi2}\to r_{\pi2}$ and $g_{m2}r_{\pi2} = \beta_2$: $R_{UP}\to(\beta_2 + 1)r_{o2}$. The base current gives the signal a path around the cascode device. A PMOS cascode (gate draws nothing) would keep growing as $g_{m2}r_{ds2}R_F$.

        !!key Folded cascode, the two questions
        (1) Where does the input transistor's current go? It divides at the fold node; the cascode device's emitter/source ($\approx1/g_m$) wins against a big $R_F$, so $G_M\approx g_{m1}$. (2) What does the output see looking up? A degenerated collector (or drain) whose emitter resistance is everything at the fold node, plus $r_\pi$ for a BJT.
      `,
    }),
    P({
      id: 'e3pK-3', src: 'Exam 3 practice K · Problem 3 (30 pts)', title: 'Emitter degeneration and the bandwidth (time constants with $r_\\pi$)', big: true,
      q: md`A PNP common emitter with an unbypassed emitter resistor: $R_E = 75\,\Omega$ from the emitter to $V_{CC}$, $R_C = 5\kO$ from the collector to ground. $v_{in}$ (with the DC bias $V_B$) drives the base through $R_S = 10\kO$. $I_C = 1\,\text{mA}$, $\beta = 100$, $r_o = \infty$. $C_\pi = 8\,\text{pF}$, $C_\mu = 0.125\,\text{pF}$, and $C_L = 1.5\,\text{pF}$ from the output to ground.

(a) $R_{in}$, looking into the base. (b) The DC gain $A_{v0} = v_{out}/v_{in}$. (c) The resistance seen by $C_\pi$. (d) The resistance seen by $C_\mu$. (e) $\omega_{-3dB}$ by open-circuit time constants. (f) Now bypass $R_E$ with a large capacitor: $\omega_{-3dB}$ by the same method. (g) What did the degeneration do?`,
      fig: K3Fig,
      parts: [
        { lbl: 'R_{in}', unit: 'kΩ', ans: 10.075, accept: [10], traps: [{ v: 2.5, msg: 'That is $r_\\pi$ alone: $R_E$ is in the emitter and is seen $(\\beta + 1)$ times bigger from the base.' }] },
        { lbl: 'A_{v0}', unit: '', ans: -24.91, accept: [-25], traps: [
          { v: -49.6, msg: 'That is the gain from the **base**. $R_S$ and $R_{in}\\approx10\\,\\text{k}\\Omega$ divide $v_{in}$ first: only half reaches the base.' },
          { v: -50, msg: 'That is the gain from the **base**. $R_S$ and $R_{in}\\approx10\\,\\text{k}\\Omega$ divide $v_{in}$ first: only half reaches the base.' },
          { v: -66.7, msg: 'That is $-R_C/R_E$, the $g_mR_E\\gg1$ limit; here $g_mR_E = 3$, so keep the $1/g_m$. And divide by the input divider.' },
          { v: -40, msg: 'That is the bypassed stage. With $R_E$ in the emitter, $G_M = g_m/(1 + g_mR_E)\\approx10\\,\\text{mS}$.' }] },
        { lbl: 'R_{C\\pi}', unit: 'kΩ', ans: 1.255, accept: [1.25], traps: [
          { v: 2.5, msg: 'That is $r_\\pi$ alone. The emitter is not grounded: test **between** base and emitter. The degenerated path $(R_S + R_E)/(1 + g_mR_E)$ is in parallel.' },
          { v: 5.02, msg: 'That is the base node to ground. $C_\\pi$ goes from base to **emitter**, and the emitter moves with the base.' },
          { v: 2.52, msg: 'That is $(R_S + R_E)/(1 + g_mR_E)$ alone. $r_\\pi$ is also directly across $C_\\pi$, in parallel.' }] },
        { lbl: 'R_{C\\mu}', unit: 'kΩ', ans: 259.1, accept: [260], traps: [
          { v: 1010, msg: 'That uses the full $g_m$ in the bridge term. With degeneration, the base-to-collector transconductance is $G_M = g_m/(1 + g_mR_E)\\approx10\\,\\text{mS}$.' },
          { v: 10.0, msg: 'That is $R_{left} + R_{right}$ only. Add $G_MR_{left}R_{right}$: the Miller term.' },
          { v: 510, msg: 'That uses $R_{left} = R_S$. The base node also has $R_{in}\\approx10\\,\\text{k}\\Omega$ to ground through the transistor: $R_{left} = R_S\\parallel R_{in}\\approx5\\,\\text{k}\\Omega$.' }] },
        { lbl: '\\omega_{-3dB}', unit: 'rad/s', ans: 2.003e7, accept: [2e7], traps: [{ v: 1.345e7, msg: 'That is the bypassed stage\'s bandwidth.' }] },
        { lbl: '\\omega_{-3dB}\\ \\text{(bypassed)}', unit: 'rad/s', ans: 1.345e7, accept: [1.34e7] },
        { lbl: '(g) Compared with the bypassed stage, degeneration', mc: ['cut the gain from $40$ to $25$ and raised the bandwidth from $1.34\\times10^7$ to $2.0\\times10^7$: mostly by shrinking the Miller term of $C_\\mu$', 'raised both the gain and the bandwidth', 'left the bandwidth unchanged: the capacitors are the same', 'raised the bandwidth only by shrinking $C_L$\'s time constant'], a: 0,
          why: [null, 'Degeneration always lowers the gain: $G_M$ drops from $g_m$ to about $g_m/(1 + g_mR_E)$.', 'Same capacitors, different resistances: degeneration changes what $C_\\pi$ and $C_\\mu$ see.', '$C_L$ sees $R_C$ in both cases ($7.5\\,\\text{ns}$). The change is in $\\tau_\\mu$ ($51\\to32\\,\\text{ns}$) and $\\tau_\\pi$ ($16\\to10\\,\\text{ns}$).'] },
      ],
      hints: [
        md`$g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$, $g_mR_E = 3$. Degenerated stage: $G_M = \dfrac{g_m}{1 + g_mR_E(\beta + 1)/\beta}\approx10\,\text{mS}$ and $R_{in} = r_\pi + (\beta + 1)R_E$.`,
        md`$C_\pi$ (base to emitter): Lecture 29's $\dfrac{R_G + R_S}{1 + g_mR_S}$ for a degenerated CS, with the BJT's $r_\pi$ in parallel: $r_\pi\parallel\dfrac{R_S + R_E}{1 + g_mR_E}$ (here $R_S$ is the base resistance).`,
        md`$C_\mu$: the bridge rule $R_{left} + R_{right} + G_MR_{left}R_{right}$, with $R_{left} = R_S\parallel R_{in}$ (the base node), $R_{right} = R_C$, and the degenerated $G_M$.`,
      ],
      sol: md`
        **Recognize it first.** In at the **base**, out at the **collector**, $R_E$ in the emitter: a **degenerated common emitter** (a PNP drawn emitter-up; the small-signal model is the same as for an NPN). This is Lecture 29's degenerated common source with the BJT's two twists: the base draws current ($R_{in}$ is finite, and $r_\pi$ sits right across $C_\pi$), and $G_M$ carries a $(\beta + 1)/\beta$. Capacitors: $C_\pi$ bridges base and emitter (floating, because the emitter moves); $C_\mu$ bridges base and collector (the Miller capacitor); $C_L$ is on the output node.

        **(a)** $g_m = 40\,\text{mS}$, $r_\pi = 2.5\kO$. The $(\beta + 1)$ rule: $R_{in} = r_\pi + (\beta + 1)R_E = 2.5\,\text{k} + 101(75) = 10.075\kO\approx10\kO$.

        **(b)** The input divider: $v_b/v_{in} = R_{in}/(R_S + R_{in}) = 10.075/20.075 = 0.502$. The stage: $G_M = \dfrac{g_m}{1 + g_mR_E(\beta + 1)/\beta} = \dfrac{40\,\text{m}}{1 + 3.03} = 9.93\,\text{mS}\approx10\,\text{mS}$. So
        $$A_{v0} = -0.502\times(9.93\,\text{m})(5\,\text{k}) = -24.9\approx-25$$

        **(c) $C_\pi$.** Open $C_\mu$ and $C_L$, zero $v_{in}$, inject $i_t$ into the base and take it out of the emitter. KCL at the base: $i_t = v_b/R_S + v_\pi/r_\pi$. KCL at the emitter: what arrives through $r_\pi$ and the $g_m$ source leaves through $R_E$ or the test source: $v_\pi/r_\pi + g_mv_\pi = v_e/R_E + i_t$. Eliminate $v_b$ and $v_e = v_b - v_\pi$:
        $$R_{C\pi} = \frac{v_\pi}{i_t} = \frac{R_S + R_E}{1 + g_mR_E + (R_S + R_E)/r_\pi} = r_\pi\parallel\frac{R_S + R_E}{1 + g_mR_E}$$
        $$R_{C\pi} = 2.5\,\text{k}\parallel\frac{10.075\,\text{k}}{4} = 2.5\,\text{k}\parallel2.52\,\text{k} = 1.25\kO,\qquad\tau_\pi = (1.25\,\text{k})(8\,\text{p}) = 10\,\text{ns}$$
        Check: $R_E = 0$ gives $r_\pi\parallel R_S$, the plain CE ✓; $r_\pi\to\infty$ gives Lecture 29's MOS result ✓.

        **(d) $C_\mu$.** Bridge rule. Left node (base) to ground: $R_S$ in parallel with the transistor's input, $R_{in}$ (with $r_o = \infty$ the collector does not affect the base): $R_{left} = 10\,\text{k}\parallel10.075\,\text{k} = 5.02\kO$. Right node (collector): $R_{right} = R_C = 5\kO$ (the collector itself is an open circuit). The transconductance from the base voltage to the collector current is the degenerated $G_M\approx10\,\text{mS}$:
        $$R_{C\mu} = R_{left} + R_{right} + G_MR_{left}R_{right} = 5\,\text{k} + 5\,\text{k} + (10\,\text{m})(5\,\text{k})(5\,\text{k}) = 260\kO$$
        ($259\kO$ with the unrounded values.) $\tau_\mu = (260\,\text{k})(0.125\,\text{p}) = 32.5\,\text{ns}$.

        **(e)** $C_L$ sees $R_C$: $\tau_L = (5\,\text{k})(1.5\,\text{p}) = 7.5\,\text{ns}$. $\sum\tau = 10 + 32.5 + 7.5 = 50\,\text{ns}$:
        $$\omega_{-3dB}\approx\frac{1}{50\,\text{ns}} = 2.0\times10^7\,\text{rad/s}$$
        (Exact for this circuit: $2.07\times10^7$.)

        **(f) Bypassed.** Now the emitter is grounded: $R_{C\pi} = R_S\parallel r_\pi = 2\kO$ ($16\,\text{ns}$); $R_{C\mu} = 2\,\text{k} + 5\,\text{k} + (40\,\text{m})(2\,\text{k})(5\,\text{k}) = 407\kO$ ($50.9\,\text{ns}$); $\tau_L = 7.5\,\text{ns}$. $\sum\tau = 74.4\,\text{ns}$, $\omega_{-3dB} = 1.34\times10^7\,\text{rad/s}$, with $A_{v0} = -\tfrac{2.5}{12.5}(40\,\text{m})(5\,\text{k}) = -40$.

        **(g)** Gain $40\to25$, bandwidth $1.34\to2.0\times10^7$. The Miller term shrank because the base-to-collector transconductance fell from $g_m$ to $G_M$ (even though $R_{left}$ grew), and $C_\pi$ is partly bootstrapped. The gain-bandwidth products are similar ($5.4$ vs $5.0\times10^8$): degeneration trades gain for bandwidth.

        !!key Degenerated CE, the three resistances
        $C_\pi$: $r_\pi\parallel\dfrac{R_S + R_E}{1 + g_mR_E}$. $C_\mu$: $R_{left} + R_C + G_MR_{left}R_C$ with $R_{left} = R_S\parallel[r_\pi + (\beta + 1)R_E]$ and $G_M\approx\dfrac{g_m}{1 + g_mR_E}$. $C_L$: $R_C$ (with $r_o = \infty$).
      `,
    }),
  ];

  // ================================================================== Practice exam L (hardest)
  const L1Fig = [
    ['rail', [1, -2.2], { n: 'V_{CC} = 5\\,\\text{V}' }], ['R', [1, -2.2], [1, -1], { n: 'R_{E1}', s: kO(1), side: 'l' }],
    ['w', [1, -2.2], [1.8, -2.2]], ['C', [1.8, -2.2], [1.8, -1], { n: 'C_E' }], ['w', [1.8, -1], [1, -1]],
    ['pnp', [1, 0], { n: 'Q_1' }],
    ['w', [0, 0], [-0.6, 0], [-0.6, 0.3]], ['Vac', [-0.6, 0.3], [-0.6, 1.3], { n: 'v_{in}', side: 'l' }], ['V', [-0.6, 1.3], [-0.6, 2.3], { n: Vv(3.3), side: 'l' }], ['gnd', [-0.6, 2.3]],
    ['node', [1, 1], { n: 'X', side: 'l' }], ['R', [1, 1], [1, 2.2], { n: 'R_{C1}', s: kO(2), side: 'l' }], ['gnd', [1, 2.2]],
    ['w', [1, 1], [1.5, 1], [1.5, 1.6], [2, 1.6]],
    ['nmos', [3, 1.6], { n: 'M_2', sz: '20/1' }],
    ['rail', [3, -0.8], { n: 'V_{DD}' }], ['R', [3, -0.8], [3, 0.6], { n: 'R_{D2}', s: kO(12) }],
    ['w', [3, 0.6], [4, 0.6]], ['term', [4, 0.6], { n: 'v_{out}' }],
    ['R', [3, 2.6], [3, 3.8], { n: 'R_{S2}', s: kO(2) }], ['gnd', [3, 3.8]],
  ];
  const L2Fig = [
    ['nmos', [2, 0], { n: 'M_2' }], ['w', [2, -1], [2, -1.4]], ['term', [2, -1.4], { n: '\\downarrow R_{out}', side: 'r' }],
    ['node', [2, 1], { n: 'X', side: 'r' }], ['nmos', [2, 2], { n: 'M_1' }], ['acg', [1, 2]], ['gnd', [2, 3]],
    ['npn', [0.4, 1], { n: 'Q_3', flip: true }], ['w', [1.4, 1], [2, 1]], ['gnd', [0.4, 2]],
    ['w', [0.4, 0], [1, 0]], ['node', [0.7, 0], { n: 'Y', side: 'a' }],
    ['pmos', [0.4, -1], { n: 'M_4' }], ['acg', [-0.6, -1]], ['rail', [0.4, -2], { n: 'V_{DD}' }],
  ];
  const L3Fig = [
    ['rail', [2, -1], { n: 'V_{CC}' }], ['pnp', [2, 0], { n: 'Q_1' }],
    ['w', [1, 0], [0.4, 0]], ['C', [0.4, 0], [0.4, -1], { n: 'C_\\pi' }], ['w', [0.4, -1], [2, -1]],
    ['C', [0.4, 0], [0.4, 1], { n: 'C_\\mu' }], ['w', [0.4, 1], [2, 1]],
    ['R', [-0.9, 0], [0.4, 0], { n: 'R_S', s: kO(1.25) }],
    ['w', [-0.9, 0], [-1.4, 0], [-1.4, 0.3]], ['Vac', [-1.4, 0.3], [-1.4, 1.3], { n: 'v_{in}', side: 'l' }],
    ['V', [-1.4, 1.3], [-1.4, 2.3], { n: 'V_B', side: 'l' }], ['gnd', [-1.4, 2.3]],
    ['w', [2, 1], [3.8, 1]], ['term', [3.8, 1], { n: 'v_{out}' }], ['C', [3.2, 1], [3.2, 2.2], { n: 'C_L' }], ['gnd', [3.2, 2.2]],
    ['nmos', [2, 2], { n: 'M_2' }], ['acg', [1, 2]], ['gnd', [2, 3]],
  ];
  // Lecture 28's model of the CS/CE stage, with this problem's values in it
  const L3Model = [
    ['Vac', [-1, 0.3], [-1, 1.6], { n: 'v_{TH}' }], ['gnd', [-1, 1.6]], ['w', [-1, 0.3], [-1, 0]],
    ['R', [-1, 0], [0, 0], { n: 'R_{TH}' }], ['node', [0, 0], { n: 'X', side: 'r' }],
    ['C', [0, 0], [0, 1.6], { n: 'C_{in}' }],
    ['w', [0, 0], [0, -0.9]], ['C', [0, -0.9], [1.85, -0.9], { n: 'C_{xy}' }], ['w', [1.85, -0.9], [1.85, 0]],
    ['node', [1.85, 0], { n: 'Y', side: 'ar' }], ['G', [1.85, 0], [1.85, 1.6], { n: 'g_mv_X', side: 'l' }],
    ['w', [1.85, 0], [3.4, 0]], ['R', [2.6, 0], [2.6, 1.6], { n: 'R_L' }], ['C', [3.4, 0], [3.4, 1.6], { n: 'C_{out}' }],
    ['node', [3.4, 0], { n: 'v_{out}', side: 'a' }],
    ['w', [0, 1.6], [3.4, 1.6]], ['gnd', [0.9, 1.6]],
  ];
  const L2RX = '(rds1 || rpi3)';
  const L2A = 'gm3*(ro3 || rds4)';

  const Lex = [
    intro('L', '**The hardest of the set**: a DC-coupled PNP-to-NMOS amplifier, a regulated cascode with a BJT booster, and Lecture 28\'s exact two-pole analysis of an actively loaded stage.'),
    P({
      id: 'e3pL-1', src: 'Exam 3 practice L · Problem 1 (35 pts)', title: 'A DC-coupled PNP into a degenerated NMOS', big: true,
      q: md`$V_{CC} = V_{DD} = 5\,\text{V}$. $Q_1$ (PNP, $\beta = 100$, $r_o = \infty$): base at $3.3\,\text{V}$ DC plus $v_{in}$; $R_{E1} = 1\kO$ to $V_{CC}$, bypassed by $C_E$ (infinite); $R_{C1} = 2\kO$ from its collector (node $X$) to ground. Node $X$ drives $M_2$'s gate **directly** (no coupling capacitor). $M_2$ (NMOS, $W/L = 20/1$) has $R_{S2} = 2\kO$ (not bypassed) and $R_{D2} = 12\kO$; the output is its drain. Take $I_C\approx I_E$ ($\alpha\approx1$), and $\lambda = 0$ except in part (g).

(a) $V_X$. (b) $I_{D2}$. (c) $V_{OUT}$; check that $Q_1$ is forward-active and $M_2$ saturated. (d) $g_{m2}$. (e) The first stage's gain $A_{v1} = v_x/v_{in}$. (f) $A_v = v_{out}/v_{in}$. (g) With $\lambda = 0.01\,\text{V}^{-1}$, the resistance looking down into $M_2$'s drain. (h) Why does (e) need no loading correction?`,
      fig: L1Fig,
      parts: [
        { lbl: 'V_X', unit: 'V', ans: 2.0, accept: [1.98] },
        { lbl: 'I_{D2}', unit: 'mA', ans: 0.25, accept: [0.2434], traps: [{ v: 1, msg: 'That puts all $2\\,\\text{V}$ across $V_{GS2}$. $R_{S2}$ carries $I_{D2}$ too: $V_X = V_{GS2} + I_{D2}R_{S2}$, a quadratic in $V_{ov}$.' }] },
        { lbl: 'V_{OUT}', unit: 'V', ans: 2.0, accept: [2.08] },
        { lbl: 'g_{m2}', unit: 'mS', ans: 1, accept: [0.987], traps: [{ v: 0.5, msg: '$g_m = 2I_D/V_{ov} = 2(0.25\\,\\text{mA})/0.5\\,\\text{V}$: do not forget the 2.' }] },
        { lbl: 'A_{v1}', unit: '', ans: -80, accept: [-79.2] },
        { lbl: 'A_v', unit: '', ans: 320, accept: [315.4], traps: [
          { v: -320, msg: 'Two inverting stages in a row: the overall gain is positive.' },
          { v: 960, msg: 'That forgets $M_2$\'s degeneration: its stage gain is $-g_{m2}R_{D2}/(1 + g_{m2}R_{S2}) = -4$, not $-12$.' },
          { v: 480, msg: 'That uses $-R_{D2}/R_{S2} = -6$, the $g_mR_S\\gg1$ limit. Here $g_{m2}R_{S2} = 2$: keep the $1/g_m$, $-12/3 = -4$.' }] },
        { lbl: 'R_{DN2}', unit: 'MΩ', ans: 1.202, accept: [1.2], traps: [{ v: 0.4, msg: 'That is $r_{ds2}$ alone. $R_{S2}$ degenerates the drain: $r_{ds} + R_S + g_mr_{ds}R_S$.' }] },
        { lbl: '(h) $A_{v1} = -g_{m1}R_{C1}$ needs no loading correction because', mc: ['$M_2$\'s gate draws no current, so nothing but $R_{C1}$ loads node $X$', '$R_{S2}$ is not bypassed', '$Q_1$ has $r_o = \\infty$', 'the coupling is DC'], a: 0,
          why: [null, '$R_{S2}$ matters for the second stage\'s gain, but it is behind the gate, which draws nothing. (Through a BJT base it **would** load $X$: $r_\\pi + (\\beta + 1)R_{S2}$.)', '$r_o = \\infty$ removes a resistance **inside** $Q_1$; the question is what the next stage hangs on $X$.', 'DC coupling is about the bias; for signals a coupling capacitor would be a short anyway.'] },
      ],
      hints: [
        md`DC: $V_{E1} = 3.3 + 0.7 = 4.0\,\text{V}$, so $I_{E1} = 1\,\text{mA}$ and $V_X = I_{C1}R_{C1}$ (the gate takes nothing).`,
        md`$M_2$: KVL from the gate: $V_X = (1 + V_{ov}) + I_{D2}R_{S2}$ with $I_{D2} = \tfrac12(100\,\mu)(20)V_{ov}^2 = (1\,\text{mA/V}^2)V_{ov}^2$.`,
        md`Each stage on its own: $-g_{m1}R_{C1}$, then a degenerated CS $-\dfrac{g_{m2}R_{D2}}{1 + g_{m2}R_{S2}}$. Multiply.`,
      ],
      sol: md`
        **Recognize it first.**
        - $Q_1$: PNP (emitter on top), in at the **base**, out at the **collector**, emitter bypassed: a **common emitter**.
        - $M_2$: in at the **gate**, out at the **drain**, $R_{S2}$ unbypassed: a **degenerated common source**.
        - The two are **DC-coupled**: $Q_1$'s collector voltage *is* $M_2$'s gate bias. So the DC must be solved in order (Exam 2 style for $M_2$), and for signals two inverting stages give a **positive** gain.

        **(a)** $V_{E1} = 3.3 + 0.7 = 4.0\,\text{V}$, $I_{E1} = (5 - 4)/1\,\text{k} = 1\,\text{mA}\approx I_{C1}$. The gate draws nothing, so all of $I_{C1}$ flows in $R_{C1}$: $V_X = (1\,\text{mA})(2\,\text{k}) = 2.0\,\text{V}$.

        **(b) $M_2$, Exam 2 style.** KVL from the gate to ground: $V_X = V_{GS2} + I_{D2}R_{S2}$, with $V_{GS2} = 1 + V_{ov}$ and $I_{D2} = \tfrac12(100\,\mu)(20)V_{ov}^2 = (1\,\text{mA/V}^2)V_{ov}^2$:
        $$2 = 1 + V_{ov} + (2\,\text{k})(1\,\text{m})V_{ov}^2\ \Rightarrow\ 2V_{ov}^2 + V_{ov} - 1 = 0\ \Rightarrow\ V_{ov} = \frac{-1 + \sqrt{1 + 8}}{4} = 0.5\,\text{V}$$
        $I_{D2} = 0.25\,\text{mA}$, $V_{S2} = (0.25\,\text{m})(2\,\text{k}) = 0.5\,\text{V}$, $V_{GS2} = 1.5\,\text{V}$ ✓ ($0.5 + 1.5 = 2$).

        **(c)** $V_{OUT} = 5 - (0.25\,\text{mA})(12\,\text{k}) = 2.0\,\text{V}$.
        - $M_2$: $V_{DS2} = 2.0 - 0.5 = 1.5\,\text{V}\ge V_{ov} = 0.5\,\text{V}$: saturated ✓.
        - $Q_1$: $V_{C1} = 2.0\,\text{V} < V_{B1} = 3.3\,\text{V}$: collector junction reverse-biased, forward-active ✓.

        (Keeping $\alpha = 0.99$: $V_X = 1.98\,\text{V}$, $I_{D2} = 0.243\,\text{mA}$, $V_{OUT} = 2.08\,\text{V}$, and the final gain $315$: a DC-coupled chain passes every small change on, which is why the problem fixes $\alpha\approx1$.)

        **(d)** $g_{m1} = 1\,\text{mA}/25\,\text{mV} = 40\,\text{mS}$; $g_{m2} = 2I_{D2}/V_{ov} = 2(0.25\,\text{m})/0.5 = 1\,\text{mS}$.

        **(e)** Node $X$: $R_{C1}$ to ground, $Q_1$'s collector (open, $r_o = \infty$), $M_2$'s gate (open). So $A_{v1} = -g_{m1}R_{C1} = -(40\,\text{m})(2\,\text{k}) = -80$.

        **(f)** $M_2$, degenerated: $A_{v2} = -\dfrac{g_{m2}R_{D2}}{1 + g_{m2}R_{S2}} = -\dfrac{12}{1 + 2} = -4$. Chain them (legal, because $A_{v1}$ already includes everything $M_2$ hangs on $X$, which is nothing):
        $$A_v = (-80)(-4) = +320$$

        **(g) Degenerated drain.** $r_{ds2} = 1/(\lambda I_D) = 1/(0.01\times0.25\,\text{m}) = 400\kO$, and
        $$R_{DN2} = r_{ds2} + R_{S2} + g_{m2}r_{ds2}R_{S2} = 400\,\text{k} + 2\,\text{k} + (1\,\text{m})(400\,\text{k})(2\,\text{k}) = 1.20\,\text{M}\Omega$$
        In parallel with $R_{D2} = 12\kO$ it changes $R_{out}$ by $1\%$: ignoring $\lambda$ was safe, thanks to the degeneration.

        **(h)** A gate is a capacitor plate: no DC or signal current. A BJT second stage would hang $r_\pi + (\beta + 1)R_E$ on node $X$ and pull $A_{v1}$ down.

        !!key BiCMOS chains
        Put the BJT where you need $g_m$ (gain per milliamp) and the MOSFET where you need an infinite input resistance. A MOS gate never loads the stage before it; a BJT base always does, by $r_\pi + (\beta + 1)Z_E$.
      `,
    }),
    P({
      id: 'e3pL-2', src: 'Exam 3 practice L · Problem 2 (35 pts)', title: 'A regulated cascode whose booster is a BJT', big: true,
      q: md`A gain-boosted (regulated) cascode current source. $M_1$ (NMOS, gate held) is the bottom device; $M_2$ (NMOS) is the cascode, with its source at node $X$. $M_2$'s gate (node $Y$) is not held: it is driven by $Q_3$ (NPN), whose base is at $X$, emitter grounded, and collector at $Y$, loaded by $M_4$ (PMOS current source, gate held). Keep $r_{ds1}$, $r_{ds2}$, $r_{o3}$, $r_{ds4}$. In symbols:

(a) The booster's gain magnitude $A = |v_y/v_x|$. (b) $R_X$, the resistance from $X$ to ground **not** counting $M_2$. (c) $R_{out}$, looking down into $M_2$'s drain. Numbers: $g_{m2} = 1\,\text{mS}$, $r_{ds1} = r_{ds2} = 100\kO$; $Q_3$ at $0.1\,\text{mA}$ with $\beta = 100$; $r_{o3} = r_{ds4} = 1\,\text{M}\Omega$. (d) $R_{out}$. (e) The plain cascode ($M_2$'s gate held, no $Q_3$). (f) Compare with an NMOS booster of the same gain. (g) DC: $Q_3$ fixes $V_X$. What is the largest overdrive $M_1$ can have and stay saturated?`,
      fig: L2Fig,
      parts: [
        ex(L2A, ['gm3', 'ro3', 'rds4'], 'A'),
        ex(L2RX, ['rds1', 'rpi3'], 'R_X'),
        ex(`rds2 + ${L2RX} + gm2*rds2*${L2RX}*(1 + ${L2A})`, ['gm2', 'rds2', 'rds1', 'rpi3', 'gm3', 'ro3', 'rds4'], 'R_{out}'),
        { lbl: 'R_{out}\\ \\text{(numbers)}', unit: 'MΩ', ans: 4002, accept: [4000], traps: [
          { v: 20010, msg: 'That uses $R_X = r_{ds1}$. $Q_3$\'s base hangs $r_{\\pi3} = 25\\,\\text{k}\\Omega$ on node $X$ too: $R_X = r_{ds1}\\parallel r_{\\pi3} = 20\\,\\text{k}\\Omega$.' },
          { v: 20000, msg: 'That uses $R_X = r_{ds1}$. $Q_3$\'s base hangs $r_{\\pi3} = 25\\,\\text{k}\\Omega$ on node $X$ too: $R_X = r_{ds1}\\parallel r_{\\pi3} = 20\\,\\text{k}\\Omega$.' },
          { v: 10.2, msg: 'That is the plain cascode: the booster multiplies the $g_{m2}r_{ds2}R_X$ term by $1 + A$.' }] },
        { lbl: 'R_{out}\\ \\text{(plain cascode)}', unit: 'MΩ', ans: 10.2, accept: [10] },
        { lbl: '(f) An NMOS booster with the same $A = 2000$ would give', mc: ['about $20\\,\\text{G}\\Omega$, five times more: no $r_{\\pi3}$ on node $X$', 'the same $4\\,\\text{G}\\Omega$: only $A$ matters', 'less, because a MOSFET has a smaller $g_m$', 'about $10\\,\\text{M}\\Omega$: a MOS booster cannot boost'], a: 0,
          why: [null, '$A$ is the same, but the degeneration under $M_2$ is not: the BJT\'s base puts $r_{\\pi3}$ in parallel with $r_{ds1}$ ($R_X = 20\\,\\text{k}\\Omega$ instead of $100\\,\\text{k}\\Omega$).', 'The problem fixes $A$; $g_m$ only enters through $A$. What changes is $R_X$.', 'Exam 2\'s regulated cascode used an NMOS booster: it multiplies $R_{out}$ by $1 + A$.'] },
        { lbl: 'V_{ov1,\\max}', unit: 'V', ans: 0.7, traps: [{ v: 1.7, msg: '$M_1$\'s drain sits at $V_X = V_{BE3} = 0.7\\,\\text{V}$. Saturation needs $V_{DS1}\\ge V_{ov1}$, so $V_{ov1}\\le0.7\\,\\text{V}$.' }] },
      ],
      hints: [
        md`$Q_3$ is a common emitter: in at its base ($X$), out at its collector ($Y$), loaded by $r_{ds4}$ and its own $r_{o3}$ ($M_2$'s gate takes nothing).`,
        md`Node $X$ without $M_2$: $M_1$'s drain (gate held) is $r_{ds1}$; $Q_3$'s base (emitter grounded) is $r_{\pi3}$. In parallel.`,
        md`Test current into $M_2$'s drain: it all flows into $R_X$, so $v_x = i_tR_X$ and $v_g = -Av_x$. Then $i_t = g_{m2}(v_g - v_x) + (v_t - v_x)/r_{ds2}$: the gate moves **against** the source.`,
      ],
      sol: md`
        **Recognize it first.**
        - $M_1$: gate held, source grounded: a current source, $r_{ds1}$ looking into its drain.
        - $M_2$: a cascode on top of $M_1$, but its gate is **not** held: $Q_3$ watches $X$ and drives $M_2$'s gate the opposite way. This is Exam 2's **regulated (gain-boosted) cascode**: if $X$ rises, $Q_3$ pulls $Y$ down hard, $M_2$'s $v_{gs}$ shrinks by $(1 + A)$ times as much, and $M_2$ fights back $(1 + A)$ times harder.
        - The BJT twist: $Q_3$'s base draws current, so $r_{\pi3}$ hangs on node $X$, right where the degeneration of $M_2$ is.

        **(a) The booster.** $Q_3$ is a common emitter: base $X$, emitter grounded, collector $Y$ loaded by $r_{ds4}$ ($M_4$'s drain, gate held) and $r_{o3}$; $M_2$'s gate takes nothing. So $v_y = -g_{m3}(r_{o3}\parallel r_{ds4})v_x$:
        $$A = g_{m3}(r_{o3}\parallel r_{ds4})$$

        **(b) Node $X$ without $M_2$:** $r_{ds1}$ (into $M_1$'s drain) in parallel with $r_{\pi3}$ (into $Q_3$'s base, emitter grounded; with the collector not feeding back, the base looks like $r_\pi$):
        $$R_X = r_{ds1}\parallel r_{\pi3}$$

        **(c) $R_{out}$.** Push $i_t$ into $M_2$'s drain. The gate takes nothing, so $i_t$ leaves $M_2$'s source and flows into $R_X$: $v_x = i_tR_X$, and the booster sets $v_g = -Av_x$. $M_2$'s model:
        $$i_t = g_{m2}(v_g - v_x) + \frac{v_t - v_x}{r_{ds2}} = -g_{m2}(1 + A)v_x + \frac{v_t - v_x}{r_{ds2}}$$
        Solve for $v_t$ and divide by $i_t$:
        $$R_{out} = r_{ds2} + R_X + g_{m2}r_{ds2}R_X(1 + A)\approx g_{m2}r_{ds2}\,(r_{ds1}\parallel r_{\pi3})\,g_{m3}(r_{o3}\parallel r_{ds4})$$
        Check: $A = 0$ and no $r_{\pi3}$ gives the plain cascode $r_{ds2} + r_{ds1} + g_{m2}r_{ds2}r_{ds1}$ ✓.

        **(d) Numbers.** $Q_3$: $g_{m3} = 0.1\,\text{m}/25\,\text{m} = 4\,\text{mS}$, $r_{\pi3} = 100/4\,\text{mS} = 25\kO$. $A = (4\,\text{m})(1\,\text{M}\parallel1\,\text{M}) = 2000$. $R_X = 100\,\text{k}\parallel25\,\text{k} = 20\kO$.
        $$R_{out} = 100\,\text{k} + 20\,\text{k} + (1\,\text{m})(100\,\text{k})(20\,\text{k})(2001) = 4.0\times10^9\,\Omega = 4.0\,\text{G}\Omega$$

        **(e) Plain cascode:** $100\,\text{k} + 100\,\text{k} + (1\,\text{m})(100\,\text{k})(100\,\text{k}) = 10.2\,\text{M}\Omega$. The booster multiplied $R_{out}$ by about $390$, not by $A = 2000$.

        **(f)** An NMOS booster with the same $A$ leaves $R_X = r_{ds1} = 100\kO$: $R_{out}\approx(1\,\text{m})(100\,\text{k})(100\,\text{k})(2001) = 20\,\text{G}\Omega$, five times more. The factor lost is $r_{ds1}/(r_{ds1}\parallel r_{\pi3}) = 5$: the BJT booster's base current. Written another way, $R_{out}\approx g_{m2}r_{ds2}\,r_{\pi3}g_{m3}(\dots) = \beta_3\,g_{m2}r_{ds2}(r_{o3}\parallel r_{ds4})$: the $\beta$ ceiling, again.

        **(g)** $Q_3$'s base-emitter junction holds $V_X = V_{BE3} = 0.7\,\text{V}$, which is $M_1$'s $V_{DS}$. Saturation needs $V_{DS1}\ge V_{ov1}$: $V_{ov1}\le0.7\,\text{V}$. (An NMOS booster would hold $V_X$ at its own $V_{GS}\ge1\,\text{V}$: the BJT booster saves headroom, which is why it is used.)

        !!key The moving-gate rules, in one place
        Gate moving **with** the drain by $K$ (K rule): divide by $1 + g_mr_{ds}K$. Gate moving **against** the source by $A$ (regulated cascode): the $g_mr_{ds}R_S$ term grows by $1 + A$. With a BJT anywhere in the loop, look for the $r_\pi$ it hangs on a node.
      `,
    }),
    P({
      id: 'e3pL-3', src: 'Exam 3 practice L · Problem 3 (30 pts)', title: 'Lecture 28 exactly: an actively loaded PNP stage, pole splitting', big: true,
      q: md`$Q_1$ (PNP) has its emitter on $V_{CC}$ and its collector at the output; $M_2$ (NMOS, gate held) is its load. $v_{in}$ (with the bias $V_B$) drives the base through $R_S = 1.25\kO$. $I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$ for $Q_1$, $\lambda = 0.01\,\text{V}^{-1}$ for $M_2$. $C_\pi = 4.8\,\text{pF}$, $C_\mu = 0.2\,\text{pF}$, $C_L = 0.75\,\text{pF}$ (output to ground). Use Lecture 28: with $R_{TH} = R_S\parallel r_\pi$ and $R_L = r_o\parallel r_{ds2}$,
$$\frac{v_{out}}{v_{TH}} = \frac{(sC_\mu - g_m)R_L}{as^2 + bs + 1},\quad a = R_{TH}R_L(C_\pi C_\mu + C_LC_\mu + C_\pi C_L),\quad b = (1 + g_mR_L)C_\mu R_{TH} + R_{TH}C_\pi + R_L(C_\mu + C_L)$$

(a) The DC gain $v_{out}/v_{in}$. (b) $b$. (c) $a$. (d) The dominant pole $\omega_{p1}\approx1/b$. (e) The second pole $\omega_{p2}\approx b/a$. (f) The zero. (g) The input pole from Miller's theorem alone. (h) The "simple Miller" output pole, $1/\big(R_L[C_L + (1 + \tfrac{1}{g_mR_L})C_\mu]\big)$. (i) Why (h) is so far from (e).`,
      fig: L3Fig,
      parts: [
        { lbl: 'A_{v0}', unit: '', ans: -1600, traps: [{ v: -2000, msg: 'That is $-g_mR_L$ from the base. $R_S$ and $r_\\pi$ divide $v_{in}$ first: $v_{TH} = 0.8\\,v_{in}$.' }, { v: -4000, msg: 'That uses $R_L = r_o$ alone. The NMOS load\'s $r_{ds2} = 200\\,\\text{k}\\Omega$ is in parallel: $R_L = 100\\,\\text{k}\\Omega$.' }] },
        { lbl: 'b', unit: 'ns', ans: 500, traps: [{ v: 100, msg: 'That drops the Miller factor $(1 + g_mR_L) = 2001$ on $C_\\mu R_{TH}$.' }, { v: 601, msg: 'That uses $R_S$ for $R_{TH}$. The base node also has $r_\\pi$ to ground: $R_{TH} = R_S\\parallel r_\\pi = 1\\,\\text{k}\\Omega$.' }] },
        { lbl: 'a', unit: 's^2', ans: 4.71e-16 },
        { lbl: '\\omega_{p1}', unit: 'rad/s', ans: 2e6, accept: [2.004e6], traps: [{ v: 2.47e6, msg: 'That is the Miller input pole alone: it leaves out the output node\'s $R_L(C_\\mu + C_L) = 95\\,\\text{ns}$ in $b$.' }] },
        { lbl: '\\omega_{p2}', unit: 'rad/s', ans: 1.062e9, accept: [1.06e9, 1.0596e9], traps: [{ v: 1.05e7, msg: 'That is the "simple Miller" output pole, which is wrong here: see part (i).' }] },
        { lbl: '\\omega_z', unit: 'rad/s', ans: 1e11 },
        { lbl: '\\omega_{p,in}\\ \\text{(Miller)}', unit: 'rad/s', ans: 2.469e6, accept: [2.47e6] },
        { lbl: '\\omega_{p,out}\\ \\text{(simple Miller)}', unit: 'rad/s', ans: 1.0525e7, accept: [1.05e7] },
        { lbl: '(i) The simple Miller output pole is a hundred times too low because', mc: ['near $\\omega_{p2}$ the capacitors hold the base, $C_\\mu$ and $C_\\pi$ divide the collector voltage onto it, and the transistor becomes diode-like (a K rule): the output sees about $1.25\\,\\text{k}\\Omega$, not $R_L = 100\\,\\text{k}\\Omega$', 'Miller\'s theorem is only valid for resistors', 'the right-half-plane zero cancels the output pole', '$C_L$ is too small to matter at the output'], a: 0,
          why: [null, 'Miller\'s theorem holds for any impedance at a given frequency. The error is using the **DC** gain $-g_mR_L$ at a frequency where the gain has already collapsed.', 'The zero is at $10^{11}$, two decades above $\\omega_{p2}$: it does not cancel anything.', '$C_L$ is most of the output capacitance in both pictures. What differs is the **resistance** the output sees: $100\\,\\text{k}\\Omega$ versus about $1.25\\,\\text{k}\\Omega$.'] },
      ],
      hints: [
        md`$g_m = 20\,\text{mS}$, $r_\pi = 5\kO$, $r_o = V_A/I_C = 200\kO$, $r_{ds2} = 1/(\lambda I) = 200\kO$. So $R_{TH} = 1.25\,\text{k}\parallel5\,\text{k} = 1\kO$, $v_{TH} = 0.8\,v_{in}$, $R_L = 100\kO$, $g_mR_L = 2000$.`,
        md`$b$ is exactly the sum of the open-circuit time constants: $R_{TH}C_\pi + (R_{TH} + R_L + g_mR_{TH}R_L)C_\mu + R_LC_L$.`,
        md`For two well-separated poles, $as^2 + bs + 1\approx(1 + s/\omega_{p1})(1 + s/\omega_{p2})$ gives $b\approx1/\omega_{p1}$ and $a = 1/(\omega_{p1}\omega_{p2})$, so $\omega_{p2}\approx b/a$.`,
      ],
      figs: { model: { fig: L3Model, cap: 'Lecture 28\'s model, filled in for this stage: $R_{TH} = R_S\\parallel r_\\pi = 1\\,\\text{k}\\Omega$, $v_{TH} = 0.8\\,v_{in}$; $C_{in} = C_\\pi$ (base to the emitter, a signal ground), the bridging $C_{xy} = C_\\mu$, $C_{out} = C_L$; $R_L = r_o\\parallel r_{ds2} = 100\\,\\text{k}\\Omega$. The PNP uses the same model as an NPN.' } },
      sol: md`
        **Recognize it first.** In at the **base** (through $R_S$), out at the **collector**, emitter on a rail: a **common emitter** (a PNP, emitter on top). Its load is $M_2$ with the gate held: a current source, $r_{ds2}$. So the collector node is high-impedance, $R_L = r_o\parallel r_{ds2}$, the gain is large, and $C_\mu$ bridges an inverting gain of 2000: the Miller effect will dominate. This is exactly Lecture 28's CE model (figure), so we use its exact $a$, $b$.

        **The numbers to plug in.** $g_m = 0.5\,\text{m}/25\,\text{m} = 20\,\text{mS}$, $r_\pi = 100/20\,\text{m} = 5\kO$, $r_o = 100/0.5\,\text{m} = 200\kO$, $r_{ds2} = 1/(0.01\times0.5\,\text{m}) = 200\kO$. Thévenin at the base: $R_{TH} = 1.25\,\text{k}\parallel5\,\text{k} = 1\kO$, $v_{TH} = \tfrac{5}{6.25}v_{in} = 0.8\,v_{in}$. $R_L = 100\kO$, $g_mR_L = 2000$.

        [[fig:model]]

        **(a)** $A_{v0} = 0.8\times(-g_mR_L) = 0.8\times(-2000) = -1600$ ($64\,\text{dB}$).

        **(b)** Term by term:
        $$b = \underbrace{(2001)(0.2\,\text{p})(1\,\text{k})}_{400.2\,\text{ns}} + \underbrace{(1\,\text{k})(4.8\,\text{p})}_{4.8\,\text{ns}} + \underbrace{(100\,\text{k})(0.95\,\text{p})}_{95\,\text{ns}} = 500\,\text{ns}$$
        Same thing as open-circuit time constants: $\tau_\pi = R_{TH}C_\pi = 4.8\,\text{ns}$; $\tau_\mu = (R_{TH} + R_L + g_mR_{TH}R_L)C_\mu = (1\,\text{k} + 100\,\text{k} + 2\,\text{M})(0.2\,\text{p}) = 420.2\,\text{ns}$; $\tau_L = R_LC_L = 75\,\text{ns}$; sum $500\,\text{ns}$ ✓. That is why OCTC works: $\sum\tau$ **is** $b$.

        **(c)** $a = (1\,\text{k})(100\,\text{k})\big[(4.8)(0.2) + (0.75)(0.2) + (4.8)(0.75)\big]\,\text{pF}^2 = 10^8\times4.71\times10^{-24} = 4.71\times10^{-16}\,\text{s}^2$.

        **(d)** $\omega_{p1}\approx1/b = 2.0\times10^6\,\text{rad/s}$. (The exact roots of $as^2 + bs + 1$ are $2.004\times10^6$ and $1.060\times10^9$; the exact $-3\,\text{dB}$ frequency is $2.004\times10^6$.)

        **(e)** $\omega_{p2}\approx b/a = \dfrac{500\times10^{-9}}{4.71\times10^{-16}} = 1.06\times10^9\,\text{rad/s}$: more than two decades above $\omega_{p1}$, so the dominant-pole picture is excellent.

        **(f)** $\omega_z = g_m/C_\mu = 20\,\text{m}/0.2\,\text{p} = 10^{11}\,\text{rad/s}$, in the right half-plane (the numerator is $sC_\mu - g_m$).

        **(g) Miller alone.** $C_{in} = C_\pi + (1 + g_mR_L)C_\mu = 4.8 + 400.2 = 405\,\text{pF}$, $\omega_{p,in} = 1/(R_{TH}C_{in}) = 1/(405\,\text{ns}) = 2.47\times10^6$: $23\%$ optimistic, because it leaves out the output node's $95\,\text{ns}$.

        **(h)** $C_{out} = C_L + (1 + \tfrac1{2000})C_\mu = 0.95\,\text{pF}$, $\omega_{p,out} = 1/(100\,\text{k}\times0.95\,\text{p}) = 1.05\times10^7$: a hundred times below the true $\omega_{p2}$.

        **(i) Pole splitting, seen with the K rule.** Near $\omega_{p2}\sim10^9$ the base node is held by its capacitors: $C_\pi$'s impedance there, $1/(10^9\cdot4.8\,\text{p})\approx200\,\Omega$, is far below $R_{TH} = 1\kO$. So $C_\mu$ and $C_\pi$ form a capacitive divider from the collector to the base, and the base moves by $K = \dfrac{C_\mu}{C_\mu + C_\pi} = \dfrac{0.2}{5}$ of the collector voltage. A transistor whose control terminal follows its output by $K$ is Exam 2's K rule: the collector looks like
        $$\frac{1}{g_mK} = \frac{C_\pi + C_\mu}{g_mC_\mu} = \frac{5\,\text{p}}{(20\,\text{m})(0.2\,\text{p})} = 1.25\kO\quad\text{instead of }R_L = 100\kO$$
        The output node's capacitance is $C_L$ plus $C_\mu$ in series with $C_\pi$: $0.75 + 0.19 = 0.94\,\text{pF}$. So $\omega_{p2}\approx1/(1.25\,\text{k}\times0.94\,\text{p}) = 8.5\times10^8$, the textbook pole-splitting estimate $g_mC_\mu/(C_\pi C_\mu + C_\pi C_L + C_\mu C_L)$, close to $b/a$. The simple Miller formula keeps $R_L = 100\kO$ and misses that the transistor has become diode-like through $C_\mu$: that is the factor of 100. Use Miller for the **input** pole; for the second pole use $b/a$.

        !!key Lecture 28 in three lines
        $b = \sum\tau$ (the OCTC sum) $\Rightarrow\omega_{p1}\approx1/b$. $a$ = products of pairs $\Rightarrow\omega_{p2}\approx b/a$. Zero at $+g_m/C_\mu$. Miller gets the first pole roughly right and the second one badly wrong.
      `,
    }),
  ];

  E3.lesson('e3-pracu', { id: 'e3-pI', title: 'Exam 3 practice exam I', kind: 'mock', sub: 'A mirror-biased CE on $\\pm5\\,\\text{V}$, an NPN and a degenerated PMOS on one output, a PNP follower driving a capacitor', steps: Iex });
  E3.lesson('e3-pracu', { id: 'e3-pJ', title: 'Exam 3 practice exam J', kind: 'mock', sub: 'A PNP CE into an NMOS mirror, the K rule under a degenerated PNP, a finite bypass capacitor and its Bode plot', steps: Jex });
  E3.lesson('e3-pracu', { id: 'e3-pK', title: 'Exam 3 practice exam K', kind: 'mock', sub: 'A CE on a PMOS diode load, a BiCMOS folded cascode with a PNP, emitter degeneration and the bandwidth', steps: Kex });
  E3.lesson('e3-pracu', { id: 'e3-pL', title: 'Exam 3 practice exam L (hardest)', kind: 'mock', sub: 'A DC-coupled PNP into a degenerated NMOS, a regulated cascode with a BJT booster, Lecture 28 exactly: pole splitting', steps: Lex });
})();

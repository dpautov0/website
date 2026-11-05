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
    ['w', [3, -1], [3.8, -1]], ['C', [3.8, -1], [4.6, -1], { n: '\\infty' }], ['w', [4.6, -1], [6.6, -1]], ['term', [6.6, -1], { n: 'v_{out}', side: 'a' }],
    ['R', [6.6, -1], [6.6, 0.4], { n: 'R_L', s: kO(4) }], ['gnd', [6.6, 0.4]],
    ['Vac', [-1.8, 0.3], [-1.8, 1.3], { n: 'v_{sig}', side: 'l' }], ['gnd', [-1.8, 1.3]],
    ['w', [-1.8, 0.3], [-1.8, 0]], ['R', [-1.8, 0], [-0.6, 0], { n: 'R_{sig}', s: '500\\,\\Omega' }], ['C', [-0.6, 0], [0.2, 0], { n: '\\infty' }], ['w', [0.2, 0], [2, 0]],
    ['R', [1.1, 0], [1.1, 1.3], { n: 'R_B', s: kO(10), side: 'l' }], ['gnd', [1.1, 1.3]],
    ['w', [3, 1], [2, 1]], ['C', [2, 1], [2, 2.1], { n: 'C_E', side: 'l' }], ['gnd', [2, 2.1]],
    ['w', [3, 1], [3, 1.2]], ['nmos', [3, 2.2], { n: 'M_2', sz: '20/1', flip: true }],
    ['nmos', [5, 2.2], { n: 'M_1', sz: '10/1', dc: true }],
    ['rail', [5, 0], { n: 'V_{CC}' }], ['R', [5, 0], [5, 1.2], { n: 'R_{ref}', s: kO(16) }],
    ['w', [3, 3.2], [5.8, 3.2]], ['term', [5.8, 3.2], { n: '-5\\,\\text{V}', side: 'r' }],
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
    ['G', [1.8, 0], [1.8, 1.6], { n: 'g_mv_\\pi' }], ['w', [1.8, 0], [1.8, -0.5]], ['gnd', [1.8, -0.5]],
    ['I', [0, -0.9], [2.6, -0.9], { n: 'i_t' }], ['w', [0, 0], [0, -0.9]], ['w', [2.6, -0.9], [2.6, 1.6]],
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

(a) $R_{in}$, the resistance $v_{in}$ sees. (b) The transconductance $G_M$ of the stage. (c) $R_{out}$. (d) $A_v = v_{out}/v_{in}$. (e) A number for (d) with $g_{m1} = 40\,\text{mS}$, $r_{o1} = 100\kO$, $g_{m2} = 2\,\text{mS}$, $r_{ds2} = 100\kO$, $R_S = 2\kO$. (f) Why the two transconductances add.`,
      fig: I2Fig,
      parts: [
        ex('rpi1 || RG', ['rpi1', 'RG'], 'R_{in}', { ranges: { rpi1: [1e3, 2e4], RG: [5e3, 5e4] } }),
        ex('gm1 + gm2*rds2/(rds2 + RS + gm2*rds2*RS)', ['gm1', 'gm2', 'rds2', 'RS'], 'G_M', { ranges: { gm1: [2e-3, 10e-3], gm2: [2e-3, 10e-3], RS: [1e3, 5e3] } }),
        ex('ro1 || (rds2 + RS + gm2*rds2*RS)', ['ro1', 'rds2', 'RS', 'gm2'], 'R_{out}', { ranges: { gm2: [2e-3, 10e-3], RS: [1e3, 5e3] } }),
        ex('-(gm1 + gm2*rds2/(rds2 + RS + gm2*rds2*RS))*(ro1 || (rds2 + RS + gm2*rds2*RS))', ['gm1', 'gm2', 'ro1', 'rds2', 'RS'], 'A_v', { ranges: { gm1: [2e-3, 10e-3], gm2: [2e-3, 10e-3], RS: [1e3, 5e3] } }),
        { lbl: 'A_v\\ \\text{(numbers)}', unit: '', ans: -3369, accept: [-3367], traps: [
          { v: -3340, msg: 'That is $-g_{m1}R_{out}$: it drops $M_2$\'s own (degenerated) transconductance, $0.4\\,\\text{mS}$.' },
          { v: -2020, msg: 'That treats $M_2$ as undegenerated: $G_{M2} = g_{m2}$ and $R_{UP} = r_{ds2}$. With $R_S$, $G_{M2} = g_{m2}/(1 + g_{m2}R_S)$ and $R_{UP} = r_{ds2}(1 + g_{m2}R_S)$.' },
          { v: -4040, msg: 'That uses $r_{o1}$ alone for $R_{out}$. Looking up into $M_2$\'s drain you see $502\\,\\text{k}\\Omega$, in parallel.' }] },
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

        **(e) Numbers.** $g_{m2}R_S = 4$:
        $$G_{M2} = \frac{2\,\text{m}}{1 + 4 + 0.02} = 0.40\,\text{mS},\qquad G_M = 40 + 0.40 = 40.4\,\text{mS}$$
        $$R_{UP} = 100\,\text{k} + 2\,\text{k} + (2\,\text{m})(100\,\text{k})(2\,\text{k}) = 502\kO,\qquad R_{out} = 100\,\text{k}\parallel502\,\text{k} = 83.4\kO$$
        $$A_v = -(40.4\,\text{mS})(83.4\kO) = -3.37\times10^3$$

        **What it means.** The degenerated PMOS adds only $1\%$ to $G_M$ (its $g_m$ is small and divided by $1 + g_{m2}R_S = 5$), but its drain resistance, $5\times$ bigger than $r_{ds2}$, keeps $R_{out}$ close to $r_{o1}$. Without $R_S$ the PMOS would add $2\,\text{mS}$ but halve $R_{out}$ to $50\kO$: the gain would drop to $-2020$.

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
        { lbl: 'A_{v0}', unit: '', ans: 1, traps: [{ v: 0.99, msg: 'With only a current source on the emitter, no signal current can leave it, so no base current flows and nothing drops across $R_S$ or $r_\\pi$: the gain is exactly $1$.' }] },
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
      figs: { test: { fig: I3Test, cap: 'The test for $C_\\pi$: $Q_1$\'s hybrid-$\\pi$ model (collector grounded), $R_S$ from the base to ground, the current source open, and $i_t$ pushed into the base and out of the emitter. Every ampere of $i_t$ must leave the emitter through $r_\\pi$ and the $g_mv_\\pi$ source.' } },
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

  E3.lesson('e3-pracu', { id: 'e3-pI', title: 'Exam 3 practice exam I', kind: 'mock', sub: 'A mirror-biased CE on $\\pm5\\,\\text{V}$, an NPN and a degenerated PMOS on one output, a PNP follower driving a capacitor', steps: Iex });
})();

/* Unit 2 — nonlinear circuits, operating points and incremental (small-signal) models. */
(function () {
  const { R, P, G } = C;
  const X = window.EXAM;

  const ps21fig = [
    ['Vac', [0, 0], [0, 1], { n: 'v_s', s: '20\\,\\text{mV}\\sin\\omega t', side: 'l' }], ['V', [0, 1], [0, 2], { n: 'V_S', s: '10\\,\\text{V}', side: 'l' }], ['gnd', [0, 2]],
    ['w', [0, 0], [0, -0.4]], ['R', [0, -0.4], [2, -0.4], { n: 'R_S', s: '2\\kO' }],
    ['X', [2, -0.4], [2, 2], { n: 'I(V)' }], ['gnd', [2, 2]], ['iarr', [2, -0.1], 'd', { n: 'I', side: 'l', off: [-14, 0] }],
    ['vlab', [2.5, 0.2], [2.5, 1.4], { n: 'V', side: 'r' }],
  ];
  const ps22fig = [
    ['V', [0, 0.6], [0, 1.6], { n: 'V_S', s: '10\\,\\text{V}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0]],
    ['R', [0, 0], [2, 0], { n: 'R', s: '2\\kO' }], ['X', [2, 0], [2, 1.4], { n: 'g(I_1)' }], ['X', [2, 1.4], [2, 2.8], { n: 'f(V_2)' }], ['gnd', [2, 2.8]],
    ['iarr', [2, 0.2], 'd', { n: 'I_0', side: 'l', off: [-14, 0] }],
    ['vlab', [2.55, 0.15], [2.55, 1.25], { n: 'V_1' }], ['vlab', [2.55, 1.55], [2.55, 2.65], { n: 'V_2' }],
  ];

  const PS2 = [
    P({
      id: 'PS2-1', src: 'Problem Set 2 · #1', title: 'Piecewise-linear device with a small signal', big: true,
      q: md`The device obeys
$$I(V)=\begin{cases}0, & V<0\\ V/3\,\text{k}\Omega, & 0\le V<3\,\text{V}\\ 1\,\text{mA}+\dfrac{V-3}{4\,\text{k}\Omega}, & V\ge 3\,\text{V}\end{cases}$$
Find the operating point, the incremental resistance, and the small-signal voltage and current amplitudes at the device.`,
      fig: ps21fig,
      parts: [{ lbl: 'V_0', unit: 'V', ans: 19 / 3 }, { lbl: 'I_0', unit: 'mA', ans: 11 / 6 }, { lbl: 'r_d', unit: 'kΩ', ans: 4 }, { lbl: '|v_o|', unit: 'mV', ans: 40 / 3 }, { lbl: '|i_o|', unit: 'µA', ans: 10 / 3 }],
      hints: [
        md`Load line: $I = (10 - V)/2\,\text{k}\Omega$. Guess the $V \ge 3$ segment and solve.`,
        md`Verify that $V_0 \ge 3\,\text{V}$. That check is its own graded step on the homework.`,
        md`Small signal: kill the 10 V (short). Then $v_s$ drives $R_S$ in series with $r_d$.`,
      ],
      sol: md`**DC** (assume $V\ge3$): $\dfrac{10-V}{2} = 1 + \dfrac{V-3}{4} \xrightarrow{\times4} 20 - 2V = V + 1 \Rightarrow V_0 = 19/3 = 6.33\,\text{V}$, $I_0 = (10 - 6.33)/2 = 1.833\,\text{mA}$.

**Verify:** $6.33 \ge 3$. ✓ Plugging into the device law also gives $1 + 3.33/4 = 1.833$. ✓

**Linearise:** slope of that segment is $1/4\kO$, so $r_d = 4\kO$.

**Small signal:** $v_o = 20\,\text{mV}\cdot\dfrac{4}{2+4} = 13.33\,\text{mV}$, $i_o = \dfrac{20\,\text{mV}}{6\kO} = 3.33\,\mu\text{A}$.

**Total:** $V(t) = 6.33\,\text{V} + 13.33\,\text{mV}\sin\omega t$, $I(t) = 1.833\,\text{mA} + 3.33\,\mu\text{A}\sin\omega t$.`,
    }),
    P({
      id: 'PS2-2', src: 'Problem Set 2 · #2', title: 'Two nonlinear elements in series', big: true,
      q: md`$V_1 = g_1(I_1) = 1000I_1 + 5000I_1^2$, and
$$I_2 = f(V_2) = \begin{cases}0, & V_2 < 1\,\text{V}\\ 0.001(V_2-1), & 1 \le V_2 < 4\,\text{V}\\ 0.003 + 0.0005(V_2 - 4), & V_2 \ge 4\,\text{V}\end{cases}$$
Find the operating point, both incremental resistances, and the total small-signal resistance seen by a small change in $V_S$.`,
      fig: ps22fig,
      parts: [{ lbl: 'I_0', unit: 'mA', ans: 2.24371 }, { lbl: 'V_{1,0}', unit: 'V', ans: 2.26888 }, { lbl: 'V_{2,0}', unit: 'V', ans: 3.24371 }, { lbl: 'r_1', unit: 'Ω', ans: 1022.44 }, { lbl: 'r_2', unit: 'Ω', ans: 1000 }, { lbl: 'R_{total}', unit: 'Ω', ans: 4022.44 }],
      hints: [
        md`Series circuit: one current $I_0$ everywhere. Guess the middle segment of $f$: $V_2 = 1 + 1000I_0$.`,
        md`KVL: $10 = 2000I_0 + (1000I_0 + 5000I_0^2) + (1 + 1000I_0)$. That's a quadratic.`,
        md`$r_1 = dg_1/dI$ at $I_0$; $r_2 = 1/\text{slope of } f$ on its middle segment.`,
      ],
      sol: md`KVL on the middle segment: $5000I_0^2 + 4000I_0 - 9 = 0 \Rightarrow I_0 = 2.244\,\text{mA}$.

$V_{1,0} = 1000(0.002244) + 5000(0.002244)^2 = 2.269\,\text{V}$, $V_{2,0} = 1 + 2.244 = 3.244\,\text{V}$.

**Verify:** $1 \le 3.244 < 4$ ✓, and $4.487 + 2.269 + 3.244 = 10.00\,\text{V}$ ✓.

**Linearise:** $r_1 = 1000 + 10000I_0 = 1022\,\Omega$, $r_2 = 1/0.001 = 1000\,\Omega$.

**Small signal:** all in series: $R_{total} = 2000 + 1022 + 1000 = 4022\,\Omega$.

Cross-check: differentiating the KVL quadratic gives $dI_0/dV_S = 1/(10000I_0 + 4000) = 1/4022$. Same number.`,
    }),
  ];

  X.P1P1b = P({
    id: 'P1-P1b', src: 'Midterm practice · P1(b)', title: 'First-order Taylor from two data points',
    q: md`A nonlinear circuit gives $v_{OUT} = 2\,\text{V}$ at $v_{IN} = 1\,\text{V}$, and $v_{OUT} = 2.4\,\text{V}$ at $v_{IN} = 1.1\,\text{V}$. Using a first-order Taylor approximation, find $v_{OUT}$ at $v_{IN} = 0.95\,\text{V}$.`,
    parts: [{ lbl: 'v_{OUT}', unit: 'V', ans: 1.8 }],
    hints: [md`Slope $= \Delta v_{OUT}/\Delta v_{IN}$: that's the small-signal gain.`],
    sol: md`Slope $= 0.4/0.1 = 4$. $v_{OUT}(0.95) \approx 2 + 4(-0.05) = 1.8\,\text{V}$.`,
  });

  X.F23P1c = P({
    id: 'F23-P1c', src: 'Midterm · Fall 2023 · P1(c)', title: 'Is it superposition?',
    q: md`True or false: when we compute the total current of a nonlinear circuit as $i_D = I_D + i_d$ (DC plus incremental), we are using the superposition property.`,
    parts: [{ mc: [
      'False. Superposition needs a linear circuit. $I_D + i_d$ comes from a first-order Taylor expansion about the operating point, which is an approximation.',
      'True. The DC and AC responses are computed separately and added.',
      'True, because the small-signal circuit is linear.',
      'False, because $i_d$ is not small.',
    ], a: 0, why: [null, 'Adding separately computed responses is what superposition *looks* like, but the theorem only applies to linear circuits.', 'The small-signal circuit is linear, but the split into $I_D + i_d$ is justified by linearisation, not by superposition.', 'Size isn\'t the issue; linearity is.'] }],
    sol: md`**False.** Superposition is a theorem about **linear** circuits, and this one isn't. The split $i_D = I_D + i_d$ comes from a first-order Taylor expansion: $I_D$ is the exact nonlinear DC solution, and $i_d$ is an *approximate* linear correction valid for small perturbations. (Superposition *does* legitimately apply inside the small-signal circuit, since that circuit is linear.)`,
  });

  C.unit({
    id: 'u2', num: 'Unit 2', title: 'Nonlinear Circuits and Small-Signal Models',
    blurb: 'Operating points, load lines, piecewise-linear devices, first-order Taylor linearisation, incremental resistance, and the two-pass DC-then-small-signal method.',
    lessons: [
      {
        id: 'u2-loadline', title: 'Nonlinear devices and the load line',
        steps: [
          R(md`
            Put a nonlinear device in a circuit and the equations stop being linear: a diode gives $I = I_Se^{V/V_T}$, which you can't combine with $I = (V_S - V)/R$ in closed form.

            **The load line** is the graphical fix. Whatever linear network surrounds the device, reduce it to its Thévenin equivalent ($\VTH$, $\RTH$). The device must then satisfy both
            $$I = f(V)\quad\text{(the device)}\qquad\text{and}\qquad I = \frac{\VTH - V}{\RTH}\quad\text{(the load line)}$$
            and the **operating point** $Q = (V_0, I_0)$ is where they cross.

            The load line is a straight line with intercepts $V = \VTH$ (open circuit) and $I = \VTH/\RTH$ (short circuit), and slope $-1/\RTH$. Sketching it often tells you immediately which piece of a device curve you're on.
          `),
          G('loadline', { need: 3 }),
          P({
            q: md`A device with $I = 0$ for $V < 2\,\text{V}$ and $I = (V-2)/2\kO$ above is connected across $R_2$ of a divider: $V_S = 12\,\text{V}$, $R_1 = R_2 = 4\kO$. Find its operating point.`,
            fig: [['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: '12\\,\\text{V}', side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [2, 0], { n: 'R_1', s: '4\\kO' }], ['R', [2, 0], [2, 2], { n: 'R_2', s: '4\\kO' }], ['w', [2, 0], [3.4, 0]], ['X', [3.4, 0], [3.4, 2], { n: '\\text{device}' }], ['w', [0, 1.5], [0, 2], [3.4, 2]], ['gnd', [2, 2]]],
            parts: [{ lbl: 'V_0', unit: 'V', ans: 4 }, { lbl: 'I_0', unit: 'mA', ans: 1 }],
            hints: [md`Thévenize everything except the device: $\VTH = 6\,\text{V}$, $\RTH = R_1\pl R_2 = 2\kO$.`],
            sol: md`The device sees $\VTH = 6\,\text{V}$ behind $\RTH = 2\kO$. On its sloped part: $\dfrac{6 - V}{2} = \dfrac{V-2}{2} \Rightarrow V_0 = 4\,\text{V}$, $I_0 = 1\,\text{mA}$. Check: $4 > 2$. ✓ This is the Unit 1 toolkit feeding straight into nonlinear analysis.`,
          }),
        ],
      },
      {
        id: 'u2-pwl', title: 'Piecewise-linear devices: assume, solve, verify',
        steps: [
          R(md`
            A **piecewise-linear** device is linear on each segment. That makes the analysis exact and quick, if you do it in three steps:

            !!method Assume, solve, verify
            1. **Assume** a segment (or a diode on/off, or a transistor region).
            2. **Solve** the now-linear circuit with that segment's equation.
            3. **Verify** the answer lies inside the segment you assumed. If it doesn't, pick another segment and repeat.

            !!trap The graded step
            Problem Set 2 lists "verify the operating point lies in the region assumed" as its own numbered task. On the exam it's worth points by itself. Always write the one-line check.

            The same method runs through every later unit: "assume the diode is ON" and "assume the MOSFET is saturated" are exactly this.
          `),
          G('pwl_q', { need: 3 }),
        ],
      },
      {
        id: 'u2-taylor', title: 'Linearisation: the Taylor idea',
        steps: [
          R(md`
            Near an operating point $x_0$, any smooth function is nearly a straight line:
            $$f(x_0 + \Delta x) \;\approx\; \underbrace{f(x_0)}_{\text{DC}} \;+\; \underbrace{f'(x_0)\,\Delta x}_{\text{small signal}}$$

            The constant term is the **large-signal (DC)** solution. The derivative term is **linear in $\Delta x$**. So if the signal is small, the *changes* in a nonlinear circuit obey a linear circuit, and all of Unit 1 applies to them.

            "Small" means small enough that the next term, $\tfrac12 f''(x_0)\Delta x^2$, is negligible compared with the linear one. For a diode, that's roughly $v_d \lesssim 5\,\text{mV}$.

            You don't even need the formula for $f$: two nearby measurements give the slope directly.
          `),
          X.P1P1b,
          G('two_point', { need: 3 }),
        ],
      },
      {
        id: 'u2-rinc', title: 'Incremental resistance',
        steps: [
          R(md`
            Linearising a two-terminal nonlinear element turns it into a **resistor** for small signals:

            !!key The one definition
            $$r = \left.\frac{dV}{dI}\right|_{Q} = \frac{1}{\text{slope of the } I\text{–}V \text{ curve at } Q}$$

            It shows up in four disguises:

            | Device given as | Incremental resistance |
            |---|---|
            | Exponential $I = I_Se^{V/V_T}$ | $r_d = V_T/I_{D0}$ |
            | Piecewise-linear $I(V)$ | $1/(\text{slope of the active segment})$ |
            | $V = g(I)$ | $r = g'(I_0)$ |
            | $I = f(V)$ | $r = 1/f'(V_0)$ |

            **The value depends on where you're biased.** The same device is a different resistor at a different operating point. That's why the DC pass always comes first.
          `),
          G('deriv_r', { need: 4 }),
        ],
      },
      {
        id: 'u2-twopass', title: 'The two-pass method',
        steps: [
          R(md`
            Every small-signal problem, on the homework and on the exam, is solved in the same two passes.

            !!method DC pass, then small-signal pass
            1. **DC pass.** Set every small signal to zero. Solve the nonlinear circuit for the operating point of every nonlinear element (use a simplified model and assume/verify).
            2. **Linearise.** Compute each element's incremental parameter *at that operating point*: $r_d$, $g_m$, $K$, ...
            3. **Small-signal pass.** Redraw with DC sources switched off, nonlinear elements replaced by their incremental models, resistors unchanged, linear dependent sources unchanged. Solve this linear circuit.
            4. **Recombine** if asked: total = DC + incremental.

            !!key What each element becomes in the small-signal circuit
            | Element | Becomes |
            |---|---|
            | DC voltage source | **short** (its value can't change) |
            | DC current source | **open** |
            | Resistor | itself |
            | Nonlinear two-terminal device | its incremental resistance $r$ |
            | Linear dependent source ($g_mv_x$) | itself, unchanged |
            | Nonlinear dependent source | linear source with gain = derivative at $Q$ |
          `),
          P({
            q: md`In the small-signal circuit, a DC **current** source becomes...`,
            parts: [{ mc: ['an open circuit', 'a short circuit', 'a resistor equal to its incremental resistance', 'unchanged'], a: 0, why: [null, 'A short is what a DC *voltage* source becomes.', 'An ideal current source has infinite incremental resistance, which is an open circuit.', 'Its DC value contributes nothing to the *changes*.'] }],
            sol: md`An ideal current source's current can't change, so any increment through it is zero: it's an **open** circuit for small signals.`,
          }),
          P({
            q: md`A nonlinear element has $V = 0.5I + 200I^2$ (V, A). It sits in series with $R = 100\,\Omega$ across $V_S$, and the DC current is $I_0 = 0.5\,\text{A}$. A small change $\Delta V_S = 10\,\text{mV}$ is applied. What is $\Delta I$?`,
            parts: [{ lbl: '\\Delta I', unit: 'mA', ans: 10 / (100 + 0.5 + 200) * 1000 / 1000 }],
            hints: [md`$r = dV/dI = 0.5 + 400I_0$ at the operating point.`, md`Small-signal circuit: $\Delta V_S$ across $R$ in series with $r$.`],
            sol: md`$r = 0.5 + 400(0.5) = 200.5\,\Omega$. Small signal: $\Delta I = \dfrac{10\,\text{mV}}{100 + 200.5} = 0.0333\,\text{mA} = 33.3\,\mu\text{A}$.`,
          }),
          X.F23P1c,
        ],
      },
      {
        id: 'u2-nlsrc', title: 'Nonlinear controlled sources',
        steps: [
          R(md`
            Dependent sources can be nonlinear too, and this shows up on **three of the six** past midterms plus Problem Set 2. The rule is the same as for a two-terminal device: **differentiate at the operating point.**

            | Large-signal law | Incremental source | Seen on |
            |---|---|---|
            | $I = G_Mv_X^2/V_A$ (VCCS) | $i = \dfrac{2G_MV_{X0}}{V_A}v_x$ | PS2 #3, Fall 2022 P2 |
            | $I = G_Mv_X^3/V_A^2$ (VCCS) | $i = \dfrac{3G_MV_{X0}^2}{V_A^2}v_x$ | practice paper P2 |
            | $V = Av_X^3$ (VCVS) | $v = 3AV_{X0}^2\,v_x$ | Fall 2023 P2 |

            !!trap $G_M$ is not the answer
            $G_M$ is a large-signal coefficient. The small-signal gain $K$ depends on the DC value $V_{X0}$, which you only know after the DC pass. That's why these problems always need both passes.
          `),
          G('nl_src', { need: 4 }),
        ],
      },
      {
        id: 'u2-ps2', title: 'Problem Set 2 (Problems 1–2)', kind: 'pset',
        steps: [
          R(md`Problems 1 and 2 of Problem Set 2. Problem 3 needs diode models, so it comes in Unit 3, right after you learn them.`),
          ...PS2,
        ],
      },
      {
        id: 'u2-check', title: 'Checkpoint: small-signal fundamentals', kind: 'checkpoint',
        steps: [
          G('pwl_q', { need: 2 }),
          G('deriv_r', { need: 2 }),
          G('nl_src', { need: 2 }),
          G('two_point', { need: 2 }),
          G('loadline', { need: 2 }),
        ],
      },
    ],
  });
})();

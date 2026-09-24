/* Unit 3 — diodes: large-signal models, DC analysis, small-signal model.
   Includes Problem Set 2 #3 and every past-midterm "Problem 2". */
(function () {
  const { R, P, G } = C;
  const X = window.EXAM;
  const ex = (expr, vars, lbl, disp) => ({ lbl, expr, vars, disp });

  // three / two diode clamp with a square-law VCCS (PS2 #3 and Fall 2022 P2)
  const clampFig = (n) => {
    const gap = 3 / n;
    const d = [];
    for (let i = 0; i < n; i++) d.push(['D', [1.6, -0.4 + i * gap], [1.6, -0.4 + (i + 1) * gap], { n: `D_${i + 1}`, side: 'l' }]);
    return [
      ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }],
      ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.6, -0.4], { n: 'R_S' }], ...d,
      ['w', [1.6, -0.4], [2.9, -0.4]], ['I', [2.9, -0.4], [2.9, 2.6], { n: '\\tfrac{G_Mv_X^2}{V_A}' }],
      ['R', [2.9, -0.4], [4.4, -0.4], { n: 'R_1' }], ['w', [4.4, -0.4], [4.4, 0.4]], ['term', [4.4, 0.4]], ['term', [4.4, 1.7]], ['w', [4.4, 1.7], [4.4, 2.6]],
      ['vlab', [4.65, 0.5], [4.65, 1.6], { n: 'v_X' }],
      ['w', [4.4, -0.4], [5.6, -0.4]], ['R', [5.6, -0.4], [5.6, 2.6], { n: 'R_2' }],
      ['w', [0, 2.2], [0, 2.6], [5.6, 2.6]], ['gnd', [2.9, 2.6]],
    ];
  };

  X.PS23 = P({
    id: 'PS2-3', src: 'Problem Set 2 · #3', title: 'Incremental model: three diodes and a square-law source', big: true,
    q: md`$V_{IN} = 5\,\text{V}$, $R_S = 600\,\Omega$, $R_1 = 400\,\Omega$, $R_2 = 1000\,\Omega$, $G_M = 2\,\text{mA/V}$, $V_A = 1\,\text{V}$, $V_T = 25\,\text{mV}$, $I_S = 10^{-14}\,\text{A}$. The source is $\tfrac{G_Mv_X^2}{V_A}$ with $v_X$ the voltage across $R_2$. Find the DC voltage $V_{A0}$ at the diode node, the diode current, the incremental resistance of **one** diode, and the incremental transconductance $K$ of the controlled source.`,
    fig: clampFig(3),
    parts: [{ lbl: 'V_{A0}', unit: 'V', ans: 1.8437, tol: { rel: 0.004 } }, { lbl: 'I_{D0}', unit: 'mA', ans: 0.4747, tol: { rel: 0.03 } }, { lbl: 'r_d', unit: 'Ω', ans: 52.67, tol: { rel: 0.03 } }, { lbl: 'K', unit: 'mA/V', ans: 5.268, tol: { rel: 0.01 } }],
    hints: [
      md`Try the constant-voltage model first: 3 diodes ON would clamp the node at 2.1 V. Compute the diode current KCL leaves over. Is it positive?`,
      md`It comes out negative, so CVD is inconsistent. That's why $I_S$ is given: each diode drops $V_A/3$, so $I_D = I_Se^{V_A/(3V_T)}$. Solve the KCL at the diode node iteratively (try 1.84 V and 1.85 V).`,
      md`$v_X = V_A\dfrac{R_2}{R_1+R_2}$. $K = \dfrac{dI}{dv_X} = \dfrac{2G_MV_{X0}}{V_A}$.`,
    ],
    sol: md`**CVD check.** ON would give $V_A = 2.1$, $V_X = 1.5$, and $I_D = \frac{2.9}{600} - (2\text{m})(1.5)^2 - \frac{2.1}{1400} = 4.83 - 4.5 - 1.5 = -1.17\,\text{mA}$. Negative, so CVD is inconsistent here.

**Exponential model.** KCL at the diode node:
$$\frac{5 - V_A}{600} = 10^{-14}e^{V_A/0.075} + 2\text{m}\left(\frac{V_A}{1.4}\right)^2 + \frac{V_A}{1400}$$
$V_A = 1.85$: RHS $5.33 >$ LHS $5.25$. $V_A = 1.84$: RHS $5.22 <$ LHS $5.27$. Converges to $V_{A0} = 1.844\,\text{V}$, $I_{D0} = 0.475\,\text{mA}$, $V_{X0} = 1.317\,\text{V}$.

**Incremental parameters:** $r_d = 25/0.475 = 52.7\,\Omega$ per diode ($158\,\Omega$ for the string), $K = \dfrac{2(2\text{m})(1.317)}{1} = 5.27\,\text{mA/V}$.

**Model:** $v_{in} \to 600\,\Omega \to$ node $A$; from $A$ to ground: $158\,\Omega$ and a VCCS $5.27\,\text{mA/V}\cdot v_x$; $A \to 400\,\Omega \to B$; $B \to 1000\,\Omega \to$ ground; $v_x = v_B$.`,
  });

  X.F22P2 = P({
    id: 'F22-P2', src: 'Midterm · Fall 2022 · P2 (35 pts)', title: 'Incremental model: two diodes and a square-law source', big: true,
    q: md`Same circuit as Problem Set 2 #3 but with **two** diodes and no $I_S$ given: $V_{IN} = 5\,\text{V}$, $R_S = 600\,\Omega$, $R_1 = 400\,\Omega$, $R_2 = 1000\,\Omega$, $G_M = 2\,\text{mA/V}$, $V_A = 1\,\text{V}$, $V_T = 25\,\text{mV}$. Use the constant-voltage model. Give the diode current, the incremental resistance per diode, $K$, and (bonus) the small-signal gain $v_x/v_{in}$.`,
    fig: clampFig(2),
    parts: [{ lbl: 'I_{D0}', unit: 'mA', ans: 3 }, { lbl: 'r_d', unit: 'Ω', ans: 25 / 3 }, { lbl: 'K', unit: 'mA/V', ans: 4 }, { lbl: 'v_x/v_{in}', unit: 'V/V', ans: 0.018248, tol: { rel: 0.02 } }],
    hints: [md`Two diodes ON clamp the node at 1.4 V, so $V_X = 1.4\cdot\frac{1000}{1400} = 1.0\,\text{V}$. Check the leftover diode current is positive.`, md`$K = \dfrac{2G_MV_{X0}}{V_A}$.`, md`For the gain: nodal at the diode node with $2r_d$, $K v_x$ (with $v_x = v_A/1.4$), and $R_1 + R_2$ to ground.`],
    sol: md`**DC:** $V_A = 1.4$, $V_X = 1.0\,\text{V}$. $I_{RS} = 3.6/600 = 6\,\text{mA}$, $I_{src} = 2\text{m}(1)^2 = 2\,\text{mA}$, $I_{R_1} = 1.4/1400 = 1\,\text{mA}$, so $I_D = 6 - 2 - 1 = 3\,\text{mA} > 0$. ✓

**Incremental:** $r_d = 25/3 = 8.33\,\Omega$ (pair: $16.7\,\Omega$). $K = \dfrac{2(2\text{m})(1.0)}{1} = 4\,\text{mA/V}$.

**Model:** $v_{in} \to 600 \to A$; $A \to 16.7\,\Omega \to$ gnd; $A \to 4\,\text{mA/V}\cdot v_x \to$ gnd; $A \to 400 \to B \to 1000 \to$ gnd; $v_x = v_B$.

**Gain:** $v_A\left(\frac{1}{600} + \frac{1}{16.7} + \frac{4\text{m}}{1.4} + \frac{1}{1400}\right) = \frac{v_{in}}{600} \Rightarrow v_A = 0.0255v_{in}$, $v_x = v_A/1.4 = 0.0182v_{in}$. The diodes' tiny $r_d$ swamps everything.`,
  });

  X.P1P2 = P({
    id: 'P1-P2', src: 'Midterm practice · P2 (30 pts)', title: 'Diodes with two small-signal inputs', big: true,
    q: md`$V_{IN} = 10.6\,\text{V}$, $I_{IN} = 0.3\,\text{mA}$, $R_1 = R_2 = 4\kO$, $V_T = 25\,\text{mV}$, CVD with $V_{D0} = 0.7\,\text{V}$. The small-signal inputs $v_{in}$ and $i_{in}$ are independent. Find $I_{D0}$, the incremental resistance of one diode, and an expression for $v_{out}$ in terms of $v_{in}$ and $i_{in}$ (numbers for the coefficients).`,
    fig: [
      ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
      ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_1' }], ['I', [1.8, -0.4], [1.8, 2.2], { n: 'I_{IN}' }], ['gnd', [1.8, 2.2]],
      ['w', [1.8, -0.4], [3.2, -0.4]], ['Iac', [3.2, -0.4], [3.2, 2.2], { n: 'i_{in}', side: 'r' }], ['gnd', [3.2, 2.2]],
      ['R', [3.2, -0.4], [4.8, -0.4], { n: 'R_2' }], ['D', [4.8, -0.4], [4.8, 0.9]], ['D', [4.8, 0.9], [4.8, 2.2]], ['gnd', [4.8, 2.2]],
      ['w', [4.8, -0.4], [5.6, -0.4]], ['term', [5.6, -0.4], { n: 'V_{OUT}+v_{out}' }],
    ],
    parts: [{ lbl: 'I_{D0}', unit: 'mA', ans: 1 }, { lbl: 'r_d', unit: 'Ω', ans: 25 }, ex('(50/8050)*(vin - 4000*iin)', { vin: [1e-3, 0.1], iin: [1e-6, 1e-4] }, 'v_{out}', { vin: 'v_{in}', iin: 'i_{in}' })],
    hints: [
      md`DC: the diodes clamp $V_{OUT} = 1.4\,\text{V}$. KCL at the middle node with $I_{IN}$ pulling out.`,
      md`Small signal: $I_{IN}$ → open, $V_{IN}$ → short, diodes → $2r_d = 50\,\Omega$. Use superposition over $v_{in}$ and $i_{in}$ (allowed: the small-signal circuit is linear).`,
    ],
    sol: md`**DC:** $V_{OUT} = 1.4$. KCL at the middle node: $\dfrac{10.6 - V_N}{4} = 0.3 + \dfrac{V_N - 1.4}{4} \Rightarrow V_N = 5.4\,\text{V}$, so $I_{D0} = \dfrac{5.4 - 1.4}{4} = 1\,\text{mA}$.

**Linearise:** $r_d = 25\,\Omega$ each, $2r_d = 50\,\Omega$.

**Small signal.** $v_N = (v_{in} - R_1i_{in})\dfrac{R_2 + 2r_d}{R_1 + R_2 + 2r_d}$ and $v_{out} = v_N\dfrac{2r_d}{R_2 + 2r_d}$:
$$v_{out} = \frac{2r_d}{R_1 + R_2 + 2r_d}\,(v_{in} - R_1i_{in}) = \frac{v_{in} - 4000\,i_{in}}{161}$$`,
  });

  const nodeOut = (x, y, label) => [['w', [x, y], [x + 0.8, y]], ['term', [x + 0.8, y], { n: label }]];

  X.P4P2 = P({
    id: 'P4-P2', src: 'Midterm practice · P2 (30 pts)', title: 'Diode clamp with a current-source load',
    q: md`$V_{IN} = 5\,\text{V}$, $R_1 = 600\,\Omega$, $I_{OUT} = 5\,\text{mA}$, $V_T = 25\,\text{mV}$, CVD $0.7\,\text{V}$. (i) Find $V_{OUT}$ and $I_{IN}$. (ii) Find $v_{out}$ for $v_{in} = 1\,\text{mV}$ ($i_{out} = 0$). (iii) Find $v_{out}$ for $i_{out} = 1\,\mu\text{A}$ ($v_{in} = 0$).`,
    fig: [
      ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
      ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_1' }], ['iarr', [0.9, -0.4], 'r', { n: 'I_{IN}', off: [0, 13], side: 'b' }],
      ['D', [1.8, -0.4], [1.8, 0.9]], ['D', [1.8, 0.9], [1.8, 2.2]], ['gnd', [1.8, 2.2]],
      ['w', [1.8, -0.4], [4.2, -0.4]], ['I', [3, -0.4], [3, 2.2], { n: 'I_{OUT}' }], ['gnd', [3, 2.2]], ['Iac', [4.2, -0.4], [4.2, 2.2], { n: 'i_{out}' }], ['gnd', [4.2, 2.2]],
      ...nodeOut(4.2, -0.4, 'V_{OUT}+v_{out}'),
    ],
    parts: [{ lbl: 'V_{OUT}', unit: 'V', ans: 1.4 }, { lbl: 'I_{IN}', unit: 'mA', ans: 6 }, { lbl: 'v_{out}\\text{ (ii)}', unit: 'µV', ans: 1000 * 50 / 650 }, { lbl: 'v_{out}\\text{ (iii)}', unit: 'µV', ans: -600 * 50 / 650 }],
    hints: [md`DC: $V_{OUT} = 1.4\,\text{V}$; the diodes carry $I_{IN} - I_{OUT}$. Check it's positive.`, md`Small signal: $I_{OUT}$ → open; the diodes are $2r_d$. (ii) is a divider; (iii) is $-i_{out}$ times the resistance seen at the output.`],
    sol: md`**DC:** $V_{OUT} = 1.4\,\text{V}$, $I_{IN} = \dfrac{5-1.4}{600} = 6\,\text{mA}$, $I_D = 6 - 5 = 1\,\text{mA}$, so $r_d = 25\,\Omega$, $2r_d = 50\,\Omega$.

**(ii)** $v_{out} = 1\,\text{mV}\cdot\dfrac{50}{600+50} = 76.9\,\mu\text{V}$.

**(iii)** The output sees $R_1\pl 2r_d = 600\pl50 = 46.2\,\Omega$, and $i_{out}$ is pulled *out*: $v_{out} = -1\,\mu\text{A}\times46.2\,\Omega = -46.2\,\mu\text{V}$.`,
  });

  X.P5P2 = P({
    id: 'P5-P2', src: 'Midterm practice · P2 (30 pts)', title: 'Diode string with series resistor',
    q: md`$V_{IN} = 4\,\text{V}$, $I_1 = 48\,\text{mA}$, $R_1 = R_3 = 50\,\Omega$, $R_2 = 100\,\Omega$, $V_T = 25\,\text{mV}$, CVD $0.7\,\text{V}$. Find $(V_{OUT}, I_{OUT})$, then $v_{out}$ and $i_{out}$ for $v_{in} = 40\,\text{mV}$.`,
    fig: [
      ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
      ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_1' }], ['I', [1.8, -0.4], [1.8, 2.2], { n: 'I_1' }], ['gnd', [1.8, 2.2]],
      ['R', [1.8, -0.4], [3.6, -0.4], { n: 'R_2' }], ['D', [3.6, -0.4], [3.6, 0.35]], ['D', [3.6, 0.35], [3.6, 1.1]], ['R', [3.6, 1.1], [3.6, 2.2], { n: 'R_3' }], ['gnd', [3.6, 2.2]],
      ['iarr', [3.6, 0.35], 'd', { n: 'I_{OUT}+i_{out}', off: [22, 0] }],
      ...nodeOut(3.6, -0.4, 'V_{OUT}+v_{out}'),
    ],
    parts: [{ lbl: 'V_{OUT}', unit: 'V', ans: 1.45 }, { lbl: 'I_{OUT}', unit: 'mA', ans: 1 }, { lbl: 'v_{out}', unit: 'mV', ans: 16 }, { lbl: 'i_{out}', unit: 'mA', ans: 0.16 }],
    hints: [md`Let $I = I_{OUT}$. Then $V_{OUT} = 1.4 + 50I$ and the middle node is $V_{OUT} + 100I$. KCL at the middle node gives $I$.`, md`Small signal: $I_1$ open; the output branch is $2r_d + R_3$. The middle node sees $R_2 + 2r_d + R_3$ to ground.`],
    sol: md`**DC:** with $I = I_{OUT}$ (kΩ→Ω, work in V and A): $V_{OUT} = 1.4 + 50I$, $V_N = 1.4 + 150I$. KCL at $N$: $\frac{4 - 1.4 - 150I}{50} = 0.048 + I \Rightarrow 0.2 = 200I \Rightarrow I_{OUT} = 1\,\text{mA}$, $V_{OUT} = 1.45\,\text{V}$.

**Linearise:** $r_d = 25\,\Omega$, branch $= 2r_d + R_3 = 100\,\Omega$.

**Small signal:** $v_N = 40\,\text{mV}\cdot\dfrac{200}{50 + 200} = 32\,\text{mV}$, $i_{out} = 32\,\text{mV}/200\,\Omega = 0.16\,\text{mA}$, $v_{out} = i_{out}(2r_d + R_3) = 16\,\text{mV}$.`,
  });

  X.F23P2 = P({
    id: 'F23-P2', src: 'Midterm · Fall 2023 · P2 (35 pts)', title: 'Diode clamp driving a cubic VCVS', big: true,
    q: md`$V_{IN} = 2.4\,\text{V}$, $R_y = 1\kO$, $R_1 = 1\kO$ (and $R_2 = 1\kO$, not used in this figure), $A = \tfrac{1}{0.14}\,\text{V}^{-2}$, $V_T = 25\,\text{mV}$, CVD $0.7\,\text{V}$. The dependent source is a **voltage** source $Av_X^3$. Find $I_{OUT}$, the incremental resistance of one diode, and the amplitude of $v_{out}$ for $v_{in} = 0.01\sin(\omega_ct)\,\text{V}$. You may use $1000 + 50 \approx 1000$.`,
    fig: [
      ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
      ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_y' }], ['D', [1.8, -0.4], [1.8, 0.9]], ['D', [1.8, 0.9], [1.8, 2.2]], ['gnd', [1.8, 2.2]],
      ['w', [1.8, -0.4], [2.7, -0.4], [2.7, 0.2]], ['term', [2.7, 0.2]], ['term', [2.7, 1.4]], ['w', [2.7, 1.4], [2.7, 2.2]], ['gnd', [2.7, 2.2]], ['vlab', [2.95, 0.3], [2.95, 1.3], { n: 'v_X' }],
      ['E', [4, 0.2], [4, 1.4], { n: 'Av_X^3' }], ['w', [4, 1.4], [4, 2.2]], ['gnd', [4, 2.2]], ['w', [4, 0.2], [4, -0.4], [5.4, -0.4]],
      ['iarr', [4.7, -0.4], 'r', { n: 'I_{OUT}+i_{out}' }], ['R', [5.4, -0.4], [5.4, 2.2], { n: 'R_1' }], ['gnd', [5.4, 2.2]],
      ...nodeOut(5.4, -0.4, 'V_{OUT}+v_{out}'),
    ],
    parts: [{ lbl: 'I_{OUT}', unit: 'mA', ans: 19.6 }, { lbl: 'r_d', unit: 'Ω', ans: 25 }, { lbl: '|v_{out}|', unit: 'mV', ans: 21, accept: [20] }],
    hints: [md`DC: diodes clamp $V_X = 1.4\,\text{V}$ (current $\dfrac{2.4 - 1.4}{1\}text{k} = 1\,\text{mA}$). $V_{OUT} = A(1.4)^3$.`, md`Small signal: $v_x = v_{in}\frac{2r_d}{R_y + 2r_d}$. The VCVS gain is $dV/dv_X = 3AV_{X0}^2$.`],
    sol: md`**DC:** $V_X = 1.4\,\text{V}$, diode current $1\,\text{mA}$ (> 0 ✓). $V_{OUT} = \dfrac{1.4^3}{0.14} = \dfrac{2.744}{0.14} = 19.6\,\text{V}$, $I_{OUT} = 19.6/1\text{k} = 19.6\,\text{mA}$.

**Linearise:** $r_d = 25\,\Omega$ (pair $50\,\Omega$). VCVS gain $= 3AV_{X0}^2 = \dfrac{3(1.96)}{0.14} = 42$.

**Small signal:** $v_x = v_{in}\dfrac{50}{1000+50} \approx \dfrac{v_{in}}{20}$, so $v_{out} = 42\cdot\dfrac{0.01}{20}\sin\omega_ct = 21\,\text{mV}\sin\omega_ct$. (Exactly: $20\,\text{mV}$ without the approximation.)`,
  });

  X.P6P2 = P({
    id: 'P6-P2', src: 'Midterm practice · P2 (30 pts)', title: 'Cubic VCCS: symbolic small-signal gain', big: true,
    q: md`The dependent source is $I_X = G_M\dfrac{V_X^3}{V_A^2}$. Let $K$ be its incremental transconductance at the operating point. (i) Express $K$ in terms of $G_M$, $V_{X0}$, $V_A$. (ii) Find $v_{out}/v_{in}$ in terms of $K$, $R_1$, $R_2$, $R_L$. You don't need the operating point.`,
    fig: [
      ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
      ['w', [0, 0.2], [0, -0.4], [1.2, -0.4]], ['term', [1.2, -0.4]], ['term', [1.2, 0.6]], ['vlab', [0.95, -0.3], [0.95, 0.5], { n: 'V_X', side: 'l' }],
      ['w', [1.2, 0.6], [1.2, 1], [3.6, 1]], ['R', [1.8, 1], [1.8, 2.2], { n: 'R_1' }], ['gnd', [1.8, 2.2]],
      ['I', [2.5, -0.6], [2.5, 1], { n: 'G_M\\tfrac{V_X^3}{V_A^2}', side: 'l' }], ['R', [3.6, -0.6], [3.6, 1], { n: 'R_2' }],
      ['w', [2.5, -0.6], [3.6, -0.6], [4.8, -0.6]], ['R', [4.8, -0.6], [4.8, 2.2], { n: 'R_L' }], ['gnd', [4.8, 2.2]],
      ...nodeOut(4.8, -0.6, 'V_{OUT}+v_{out}'),
    ],
    parts: [
      ex('3*GM*VX0^2/VA^2', { GM: [1e-4, 1e-2], VX0: [0.2, 3], VA: [0.5, 3] }, 'K', { GM: 'G_M', VX0: 'V_{X0}', VA: 'V_A' }),
      ex('-K*R2*RL/(K*R1*R2 + RL + R1 + R2)', { K: [1e-4, 1e-2], R1: [100, 1e4], R2: [100, 1e4], RL: [100, 1e4] }, 'v_{out}/v_{in}', { K: 'K', R1: 'R_1', R2: 'R_2', RL: 'R_L' }),
    ],
    hints: [md`$K = dI_X/dV_X$ at $V_{X0}$.`, md`The current that flows up through $R_L$ (namely $-v_{out}/R_L$) must come back down through $R_1$. So $v_S = -\dfrac{R_1v_{out}}{R_L}$ and $v_x = v_{in} - v_S$.`, md`KCL at the output node: $Kv_x + \dfrac{v_{out} - v_S}{R_2} + \dfrac{v_{out}}{R_L} = 0$.`],
    sol: md`**(i)** $K = \dfrac{dI_X}{dV_X}\Big|_{V_{X0}} = \dfrac{3G_MV_{X0}^2}{V_A^2}$.

**(ii)** The output node's only path to ground is $R_L$; the current coming up through $R_L$, $-v_{out}/R_L$, returns through $R_1$: $v_S = -\dfrac{R_1v_{out}}{R_L}$, so $v_x = v_{in} + \frac{R_1}{R_L}v_{out}$. KCL at the output:
$$Kv_x + \frac{v_{out}(1 + R_1/R_L)}{R_2} + \frac{v_{out}}{R_L} = 0\;\Rightarrow\;\frac{v_{out}}{v_{in}} = \frac{-KR_2R_L}{KR_1R_2 + R_L + R_1 + R_2}$$`,
  });

  C.unit({
    id: 'u3', num: 'Unit 3', title: 'Diodes',
    blurb: 'The exponential law and 60 mV/decade, constant-voltage and iterative DC analysis, which-diodes-are-on reasoning, the incremental resistance, and full diode small-signal problems.',
    lessons: [
      {
        id: 'u3-exp', title: 'The exponential diode',
        steps: [
          R(md`
            A diode conducts easily one way (anode → cathode) and hardly at all the other way. Its large-signal law:
            $$I_D = I_S\left(e^{V_D/(nV_T)} - 1\right) \approx I_Se^{V_D/(nV_T)}\quad(\text{forward bias})$$
            - $I_S \approx 10^{-15}\,\text{A}$: the scale current, proportional to junction area. It doubles every $5^\circ\text{C}$.
            - $V_T = 25\,\text{mV}$ at room temperature (thermal voltage). $n = 1$ for integrated diodes (assume this).
            - Reverse bias: $I_D \approx -I_S$, which is negligible.

            Inverting: $V_D = V_T\ln\dfrac{I_D}{I_S}$.

            !!key 60 mV per decade
            $$V_{D2} - V_{D1} = V_T\ln\frac{I_{D2}}{I_{D1}} = 2.3V_T\log_{10}\frac{I_{D2}}{I_{D1}} \approx 60\,\text{mV}\times(\text{decades})$$
            From $10^{-15}\,\text{A}$ to $1\,\text{mA}$ is 12 decades, about $12\times60 = 0.72\,\text{V}$. **That's why a conducting diode always sits near 0.7 V**, and why the constant-voltage model works.
          `),
          G('diode_exp', { need: 2 }),
          G('decade', { need: 2 }),
        ],
      },
      {
        id: 'u3-models', title: 'Simplified diode models',
        steps: [
          R(md`
            The exponential can't be solved by hand in a circuit, so we use piecewise-linear approximations:

            | Model | ON | OFF | Use it for |
            |---|---|---|---|
            | Ideal | short ($V_D = 0$) | open | logic-level reasoning |
            | **Constant voltage drop (CVD)** | $V_D = 0.7\,\text{V}$ | open | **the exam default** |
            | Battery + resistance (BPR) | $0.7\,\text{V}$ in series with $r$ | open | more accuracy |
            | Exponential | $I_Se^{V_D/V_T}$ | $\approx 0$ | when $I_S$ is given |

            With CVD, a string of $n$ conducting diodes drops $0.7n$ volts, whatever the current.
          `),
          G('cvd_series', { need: 3 }),
        ],
      },
      {
        id: 'u3-onoff', title: 'Which diodes are on? Assume and verify',
        steps: [
          R(md`
            Unit 2's method again: **assume** each diode's state, **solve**, **verify**.

            !!method Diode states
            - Assumed **ON** (CVD): replace with a $0.7\,\text{V}$ source. Verify the diode current comes out **positive** (anode → cathode).
            - Assumed **OFF**: replace with an open. Verify the voltage across it is **below 0.7 V**.
            - If a check fails, flip that diode's assumption and resolve.

            A common trap: a diode string in parallel with a resistor. Assume ON, and KCL tells you how much current is left for the diodes after the resistor takes its share. If that leftover is negative, the diodes are actually off, and the node is set by the resistors alone. Problem Set 2 #3 is exactly this situation.
          `),
          G('cvd_branch', { need: 4 }),
        ],
      },
      {
        id: 'u3-iterate', title: 'The iterative method',
        steps: [
          R(md`
            When the exponential model is required (for instance when $I_S$ is given and CVD fails), iterate:

            !!method Iteration (from the course notes)
            1. Assume ON; start with $V_D = 0.7\,\text{V}$.
            2. Current from the **linear** part of the circuit: $I_D = \dfrac{V_S - V_D}{R}$.
            3. Update the diode voltage: $V_D = V_T\ln\dfrac{I_D}{I_S}$.
            4. Repeat 2–3 until $V_D$ changes by less than about $0.01\,\text{V}$ (usually 2–3 rounds).
            5. Confirm the ON assumption.

            It converges fast because the diode voltage barely changes: a 10% change in current moves $V_D$ by only $25\,\text{mV}\times\ln 1.1 \approx 2.4\,\text{mV}$.

            **Example (notes):** $5\,\text{V}$, $1\kO$, $I_S = 6.9\times10^{-16}$: $4.30\,\text{mA} \to 0.737\,\text{V} \to 4.26\,\text{mA} \to 0.736\,\text{V}$. Converged.
          `),
          G('iterate', { need: 2 }),
        ],
      },
      {
        id: 'u3-rd', title: 'The diode small-signal model',
        steps: [
          R(md`
            Linearise the exponential at the operating point $Q = (V_{D0}, I_{D0})$:
            $$\left.\frac{dI_D}{dV_D}\right|_Q = \frac{I_S}{V_T}e^{V_{D0}/V_T} = \frac{I_{D0}}{V_T}$$

            !!key Diode incremental resistance
            $$r_d = \frac{nV_T}{I_{D0}} = \frac{25\,\text{mV}}{I_{D0}}\quad(n=1)$$
            For small signals, the diode is just this **resistor**. It depends only on the DC current.

            Handy values: $0.5\,\text{mA} \to 50\,\Omega$, $1\,\text{mA} \to 25\,\Omega$, $2\,\text{mA} \to 12.5\,\Omega$, $5\,\text{mA} \to 5\,\Omega$. Past papers were written calculator-free, so their numbers land on these. A clean $r_d$ is still a good sanity check with a calculator.

            Diodes in series each get their own $r_d$, and they add. The model is accurate for $|v_d| \lesssim 5\,\text{mV}$.

            !!trap Don't carry the 0.7 V
            The $0.7\,\text{V}$ is a DC quantity. It disappears in the small-signal circuit; only $r_d$ remains.
          `),
          G('rd', { need: 3 }),
        ],
      },
      {
        id: 'u3-ss', title: 'Complete diode small-signal problems',
        steps: [
          R(md`
            Put it together: this is exam Problem 2.

            !!method The full procedure
            1. **DC:** signals off, diodes CVD. Find every diode's $I_{D0}$ (verify ON). Find any controlling DC voltages too.
            2. **Linearise:** $r_d = V_T/I_{D0}$ per diode; differentiate any nonlinear controlled source.
            3. **Small signal:** DC voltage sources → short, DC current sources → open, diodes → $r_d$. **Label every element with a number.** That's where the "draw the incremental model" points are.
            4. **Solve** the linear circuit (dividers, nodal, superposition over independent small inputs).
          `),
          G('diode_ss', { need: 3 }),
          G('diode_isrc', { need: 2 }),
        ],
      },
      {
        id: 'u3-ps23', title: 'Problem Set 2 (Problem 3)', kind: 'pset',
        steps: [
          R(md`The last problem of Problem Set 2, now that you have diode models. Note what happens when you try CVD first; it's a useful lesson in checking assumptions.`),
          X.PS23,
        ],
      },
      {
        id: 'u3-exam', title: 'Past midterms: Problem 2', kind: 'exam',
        steps: [
          R(md`Every Problem 2 from the past midterms, redrawn. All of them are the same recipe: DC with CVD → $r_d$ (and $K$ for a nonlinear source) → linear small-signal circuit. Budget about 15–20 minutes each.`),
          X.F22P2, X.F23P2, X.P1P2, X.P4P2, X.P5P2, X.P6P2,
        ],
      },
      {
        id: 'u3-check', title: 'Checkpoint: diodes', kind: 'checkpoint',
        steps: [
          G('cvd_branch', { need: 2 }),
          G('diode_ss', { need: 2 }),
          G('diode_isrc', { need: 2 }),
          G('rd', { need: 2 }),
          G('decade', { need: 1 }),
        ],
      },
    ],
  });
})();

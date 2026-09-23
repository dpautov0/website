/* s26.js — material from the Spring 2026 Midterm 1 (the most recent paper, from a graded copy).
   Adds four lessons inside Units 1, 2 and 4, the transcribed paper, two mock midterms written in
   its style, and the grader's deductions. Loaded after the unit files; inserts into them. */
(function () {
  const { R, P, G } = C;
  const X = window.EXAM;
  const unit = (id) => COURSE.units.find((u) => u.id === id);
  const lesson = (uid, lid) => unit(uid).lessons.find((l) => l.id === lid);
  const insertAfter = (uid, afterId, ...ls) => {
    const u = unit(uid);
    u.lessons.splice(u.lessons.findIndex((l) => l.id === afterId) + 1, 0, ...ls);
  };
  const VR = { GM: [1e-4, 1e-2], VT: [0.1, 2], R1: [100, 1e4], VOUT: [0.1, 5], IX: [1e-5, 1e-2], IS: [1e-15, 1e-12] };
  const VD = { GM: 'G_M', VT: 'V_T', R1: 'R_1', VOUT: 'V_{OUT}', IX: 'I_X', IS: 'I_S' };
  const ex = (expr, names, lbl) => ({ lbl, expr, vars: Object.fromEntries(names.map((k) => [k, VR[k]])), disp: VD });
  const half = '\\tfrac12X';

  // ================================================================ the Spring 2026 paper
  X.S26P1a = P({
    id: 'S26-P1a', src: 'Midterm · Spring 2026 · P1(a)', title: 'Scaling a linear black box',
    q: md`In the linear circuit in the Figure below when $R_2 = \infty$ and $V_1 = 1\,\text{V}$, we find $V_2 = 2\,\text{V}$. Furthermore, when $R_2 = 0$ and $V_1 = 2\,\text{V}$, then $I_2 = 1\,\text{A}$. Find $V_2$ and $I_2$ when $R_2 = 2\,\Omega$ and $V_1 = 3\,\text{V}$.`,
    fig: FIGS.blackbox({ src: 'V' }),
    parts: [{ lbl: '\\RTH', unit: 'Ω', ans: 4 }, { lbl: 'V_2', unit: 'V', ans: 2 }, { lbl: 'I_2', unit: 'A', ans: 1 }],
    hints: [
      md`$R_2 = \infty$ is the **open-circuit** test: $V_{OC} = 2\,\text{V}$ at $V_1 = 1$. $R_2 = 0$ is the **short-circuit** test: $I_{SC} = 1\,\text{A}$ at $V_1 = 2$.`,
      md`Linear and source-free, so both scale with $V_1$: $\VTH = 2V_1$ and $\IN = 0.5V_1$. They were measured at **different** $V_1$, so scale before dividing.`,
    ],
    sol: md`**Open circuit** ($R_2 = \infty$): $V_{OC} = 2\,\text{V}$ at $V_1 = 1\,\text{V}$ $\Rightarrow \VTH = 2V_1$.

**Short circuit** ($R_2 = 0$): $I_{SC} = 1\,\text{A}$ at $V_1 = 2\,\text{V}$ $\Rightarrow \IN = 0.5V_1$.

$\RTH = \dfrac{\VTH}{\IN} = \dfrac{2V_1}{0.5V_1} = 4\,\Omega$, independent of $V_1$.

**At $V_1 = 3\,\text{V}$:** $\VTH = 6\,\text{V}$, $\IN = 1.5\,\text{A}$, so
$$I_2 = \frac{6}{4 + 2} = 1\,\text{A},\qquad V_2 = I_2R_2 = 2\,\text{V}.$$

!!trap How points were lost on this problem
The graded copy lost 7.5 of 25 points here: not naming the open-/short-circuit cases (−1.5), not scaling $V_{OC}$ and $I_{SC}$ to $V_1 = 3\,\text{V}$ (−3), not stating $\VTH = 2V_1$ (−2), and a wrong route to $V_2$ (−1). It computed $\RTH = 2\,\Omega$ by mixing a measurement at $V_1 = 1$ with one at $V_1 = 2$ without scaling.`,
  });

  X.S26P1b = P({
    id: 'S26-P1b', src: 'Midterm · Spring 2026 · P1(b)', title: 'Gain from a sinusoid, applied to two tones',
    q: md`In the non-linear circuit in the Figure below, when the input voltage $v_{IN} = 1\,\text{V}$, the output voltage $v_{OUT} = 2\,\text{V}$. If the input voltage is $v_{IN} = 1 + 0.1\sin(\omega_ct)\,\text{V}$, the output voltage changes to $v_{OUT} = 2 - 0.2\sin(\omega_ct)\,\text{V}$. Determine the output voltage if the input voltage is $v_{IN} = 1 - 0.1\sin(\omega_1t) + 0.2\cos(\omega_2t)\,\text{V}$.`,
    fig: FIGS.blackbox({ nonlinear: true, load: false, inName: 'v_{IN}', outName: 'v_{OUT}' }),
    parts: [{ lbl: 'A_v', unit: 'V/V', ans: -2 }, { lbl: 'v_{OUT}\\text{ DC value}', unit: 'V', ans: 2 }, { lbl: '\\text{coefficient of }\\sin(\\omega_1t)', unit: 'V', ans: 0.2 }, { lbl: '\\text{coefficient of }\\cos(\\omega_2t)', unit: 'V', ans: -0.4 }],
    hints: [md`$A_v = -0.2/0.1$. The output tone is inverted.`, md`Same DC input, so same operating point and same gain. Apply it to each tone separately and add.`],
    sol: md`$A_v = \dfrac{-0.2}{0.1} = -2$ about the operating point $(1\,\text{V}, 2\,\text{V})$.

The new input has the same DC value, so the same linearisation applies. The incremental model is linear, so the two small tones superpose:
$$v_{OUT} = 2 + (-2)(-0.1)\sin(\omega_1t) + (-2)(0.2)\cos(\omega_2t) = 2 + 0.2\sin(\omega_1t) - 0.4\cos(\omega_2t)\ \text{V}$$
(Full marks on the graded copy.)`,
  });

  X.S26P2 = P({
    id: 'S26-P2', src: 'Midterm · Spring 2026 · P2 (35 pts)', title: 'From the gain back to the operating point', big: true,
    q: md`Consider the circuit shown below that uses a **two terminal** nonlinear element $X$ whose current $i_X$ between the terminals is related to the voltage $v_X$ across it by $i_X = \dfrac{G_Mv_X^2}{2V_T}$, where $G_M$ and $V_T$ are known constants. Now, if the incremental gain of the circuit is $A_v = \dfrac{v_{out}}{v_{in}} = \dfrac13$, answer the following:
(a) sketch the incremental model of the circuit, and find an expression for the incremental resistance $r_x = v_x/i_x$ of the element $X$ in terms of $G_M$, $V_T$, and the DC voltage $V_{OUT}$.
(b) compute the DC operating point voltages $V_{OUT}$ and $V_{IN}$ in terms of $G_M$, $V_T$, and $R_1$.`,
    fig: FIGS.shuntX(),
    parts: [ex('VT/(GM*VOUT)', ['GM', 'VT', 'VOUT'], 'r_x'), ex('2*VT/(GM*R1)', ['GM', 'VT', 'R1'], 'V_{OUT}'), ex('4*VT/(GM*R1)', ['GM', 'VT', 'R1'], 'V_{IN}')],
    hints: [
      md`$\dfrac{1}{r_x} = \dfrac{di_X}{dv_X}\Big|_{V_{OUT}} = \dfrac{G_MV_{OUT}}{V_T}$.`,
      md`Incremental model: $V_{IN}$ shorted, $v_{in}$ drives $R_1$ into $r_x$. That's a **divider**, $A_v = \dfrac{r_x}{R_1 + r_x}$.`,
      md`$\tfrac13$ means $r_x = R_1/2$. Then solve for $V_{OUT}$, and get $V_{IN}$ from DC KVL: $V_{IN} = V_{OUT} + R_1i_X$.`,
    ],
    sol: md`**(a)** Incremental model: $v_{in}$ (DC source shorted) → $R_1$ → output node → $r_x$ → ground.
$$\frac{1}{r_x} = \frac{di_X}{dv_X} = \frac{G_MV_X}{V_T},\qquad V_X = V_{OUT}\;\Rightarrow\; r_x = \frac{V_T}{G_MV_{OUT}}$$

**(b)** $A_v = \dfrac{r_x}{R_1 + r_x} = \dfrac13 \Rightarrow r_x = \dfrac{R_1}{2}$. So $\dfrac{V_T}{G_MV_{OUT}} = \dfrac{R_1}{2}$:
$$V_{OUT} = \frac{2V_T}{G_MR_1},\qquad V_{IN} = V_{OUT} + R_1\frac{G_MV_{OUT}^2}{2V_T} = V_{OUT} + V_{OUT} = \frac{4V_T}{G_MR_1}$$

!!trap The 10-point mistake
The graded copy got (a) right, then wrote $v_{out}/v_{in} = r_x/R_1$, forgetting that $R_1$ and $r_x$ form a divider. That gave $V_{OUT} = \tfrac25V_{IN}$ and cost both (b) parts (−5, −5). Always draw the incremental model and read the divider off it.`,
  });

  X.S26P3 = P({
    id: 'S26-P3', src: 'Midterm · Spring 2026 · P3 (40 pts)', title: 'Current-source-fed stack, PMOS mirror, R₁,max', big: true,
    q: md`Determine voltage $V_1$, $V_2$, $V_3$, and the maximum value of resistor $R_1$ such that transistor $M_4$ remains in saturation when $I_1 = 0.5\,\text{mA}$, $I_2 = 0.25\,\text{mA}$, $1X = \tfrac{250}{1}$, and $V_{DD} = 5\,\text{V}$. Please show all steps for full credit.

*Note: the printed figure labels $M_3$ and $M_4$ as $1X$. The graded copy crosses these out and marks both $\tfrac12X$, and earns full marks with $\tfrac12X$, so there was almost certainly a correction during the exam. Only $\tfrac12X$ gives calculator-free numbers. This version uses $\tfrac12X$.*`,
    fig: FIGS.stackMirror({ s1: '1X', s2: '1X', s3: half, s4: half, i1s: '0.5\\,\\text{mA}', i2s: '0.25\\,\\text{mA}', vdd: 'V_{DD}=5\\,\\text{V}' }),
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.2 }, { lbl: 'V_2', unit: 'V', ans: 2.4 }, { lbl: 'V_3', unit: 'V', ans: 3.6 }, { lbl: 'R_{1,max}', unit: 'kΩ', ans: 18.4 }],
    hints: [
      md`$I_1 = 0.5\,\text{mA}$ flows through $M_3$, $M_2$ and $M_1$. All are diode-connected, so each drops its own $V_{GS}$ (or $V_{SG}$).`,
      md`$M_1$, $M_2$ ($1X$): $\tfrac12(100\mu)(250) = 12.5\,\text{mA/V}^2$. $M_3$ ($\tfrac12X$ PMOS): $\tfrac12(50\mu)(125) = 3.125\,\text{mA/V}^2$.`,
      md`$M_4$ = $M_3$ (same size, same $V_{SG}$), so it carries 0.5 mA, of which $I_2$ takes 0.25. Saturation: $V_D \le V_G + |V_T|$.`,
    ],
    sol: md`**$V_1$:** $0.5 = 12.5V_{ov}^2 \Rightarrow V_{ov} = 0.2$, $V_1 = 1.2\,\text{V}$.
**$V_2$:** $M_2$ is identical and carries the same current: $V_2 = 1.2 + 1.2 = 2.4\,\text{V}$.
**$V_3$:** $M_3$: $0.5 = 3.125V_{ov}^2 \Rightarrow V_{ov} = 0.4$, $V_{SG} = 1.4$, so $V_3 = 5 - 1.4 = 3.6\,\text{V}$.

**$R_{1,max}$:** $M_4$ has $M_3$'s $V_{SG}$ and size, so $I_{M4} = 0.5\,\text{mA}$. KCL at its drain: $I_{R_1} = 0.5 - 0.25 = 0.25\,\text{mA}$. Saturation needs $V_D \le V_G + |V_T| = 3.6 + 1 = 4.6\,\text{V}$:
$$R_{1,max} = \frac{4.6\,\text{V}}{0.25\,\text{mA}} = 18.4\kO$$
(Full marks on the graded copy.)`,
  });

  // ================================================================ mock midterm C (Spring 2026 style)
  const MC1a = P({
    id: 'MC-P1a', src: 'Mock midterm C · P1(a)', title: 'Scaling with a current-source drive',
    q: md`In the linear circuit in the Figure below, when $R_2 = \infty$ and $I_1 = 2\,\text{mA}$, we find $V_2 = 4\,\text{V}$. Furthermore, when $R_2 = 0$ and $I_1 = 1\,\text{mA}$, then $I_2 = 0.5\,\text{mA}$. Find $V_2$ and $I_2$ when $R_2 = 4\kO$ and $I_1 = 3\,\text{mA}$.`,
    fig: FIGS.blackbox({ src: 'I' }),
    parts: [{ lbl: '\\RTH', unit: 'kΩ', ans: 4 }, { lbl: 'V_2', unit: 'V', ans: 3 }, { lbl: 'I_2', unit: 'mA', ans: 0.75 }],
    hints: [md`Open circuit: $\VTH = 2\,\text{V/mA}\cdot I_1$. Short circuit: $\IN = 0.5\,I_1$.`],
    sol: md`Open circuit ($R_2 = \infty$): $\VTH = 2\kO\cdot I_1$. Short circuit ($R_2 = 0$): $\IN = 0.5I_1$. $\RTH = 2/0.5 = 4\kO$.

At $I_1 = 3\,\text{mA}$: $\VTH = 6\,\text{V}$, $I_2 = \dfrac{6}{4 + 4} = 0.75\,\text{mA}$, $V_2 = 0.75\times4 = 3\,\text{V}$.`,
  });
  const MC1b = P({
    id: 'MC-P1b', src: 'Mock midterm C · P1(b)', title: 'Cosine test, mixed tones',
    q: md`In the non-linear circuit below, when $v_{IN} = 2\,\text{V}$ the output is $v_{OUT} = 1\,\text{V}$. If $v_{IN} = 2 + 0.05\cos(\omega_ct)\,\text{V}$, the output becomes $v_{OUT} = 1 + 0.15\cos(\omega_ct)\,\text{V}$. Determine $v_{OUT}$ for $v_{IN} = 2 - 0.1\cos(\omega_1t) + 0.02\sin(\omega_2t)\,\text{V}$.`,
    fig: FIGS.blackbox({ nonlinear: true, load: false, inName: 'v_{IN}', outName: 'v_{OUT}' }),
    parts: [{ lbl: 'A_v', unit: 'V/V', ans: 3 }, { lbl: 'v_{OUT}\\text{ DC value}', unit: 'V', ans: 1 }, { lbl: '\\text{coefficient of }\\cos(\\omega_1t)', unit: 'V', ans: -0.3 }, { lbl: '\\text{coefficient of }\\sin(\\omega_2t)', unit: 'V', ans: 0.06 }],
    sol: md`$A_v = 0.15/0.05 = 3$. Same DC point, so: $v_{OUT} = 1 - 0.3\cos(\omega_1t) + 0.06\sin(\omega_2t)\,\text{V}$.`,
  });
  const MC2 = P({
    id: 'MC-P2', src: 'Mock midterm C · P2 (35 pts)', title: 'Cubic element, gain 1/4', big: true,
    q: md`The circuit below uses a two terminal nonlinear element $X$ with $i_X = \dfrac{G_Mv_X^3}{3V_T^2}$, where $G_M$ and $V_T$ are known constants. The incremental gain is $A_v = \dfrac{v_{out}}{v_{in}} = \dfrac14$.
(a) Sketch the incremental model and find $r_x = v_x/i_x$ in terms of $G_M$, $V_T$ and $V_{OUT}$.
(b) Compute $V_{OUT}$ and $V_{IN}$ in terms of $G_M$, $V_T$ and $R_1$.`,
    fig: FIGS.shuntX(),
    parts: [ex('VT^2/(GM*VOUT^2)', ['GM', 'VT', 'VOUT'], 'r_x'), ex('VT*sqrt(3/(GM*R1))', ['GM', 'VT', 'R1'], 'V_{OUT}'), ex('2*VT*sqrt(3/(GM*R1))', ['GM', 'VT', 'R1'], 'V_{IN}')],
    hints: [md`$\dfrac{di_X}{dv_X} = \dfrac{G_Mv_X^2}{V_T^2}$.`, md`Divider: $\dfrac{r_x}{R_1 + r_x} = \dfrac14 \Rightarrow r_x = R_1/3$.`],
    sol: md`**(a)** $r_x = \dfrac{V_T^2}{G_MV_{OUT}^2}$.

**(b)** $r_x = R_1/3 \Rightarrow V_{OUT}^2 = \dfrac{3V_T^2}{G_MR_1} \Rightarrow V_{OUT} = V_T\sqrt{\dfrac{3}{G_MR_1}}$.
$V_{IN} = V_{OUT} + R_1\dfrac{G_MV_{OUT}^3}{3V_T^2} = V_{OUT}(1 + 1) = 2V_T\sqrt{\dfrac{3}{G_MR_1}}$.`,
  });
  const mc3Fig = [
    ['w', [0, 0], [4.2, 0]], ['rail', [2, 0], { n: 'V_{DD}=5\\,\\text{V}' }],
    ['pmos', [0, 1], { n: 'P_1', sz: '2X', flip: true }], ['w', [1, 1], [1, 2], [0, 2]], ['node', [0, 2], { n: 'V_1', side: 'l' }],
    ['pmos', [0, 3], { n: 'P_2', sz: '2X', flip: true }], ['w', [1, 3], [1, 4], [0, 4]], ['node', [0, 4], { n: 'V_2', side: 'l' }],
    ['I', [0, 4], [0, 5.4], { n: 'I_1', s: '0.4\\,\\text{mA}', side: 'l' }], ['node', [0, 5.4], { n: 'V_3', side: 'l' }],
    ['nmos', [0, 6.4], { n: 'M_3', sz: '1X', flip: true, dc: true }], ['gnd', [0, 7.4]],
    ['w', [1, 6.4], [2, 6.4]], ['nmos', [3, 6.4], { n: 'M_4', sz: '2X' }], ['gnd', [3, 7.4]],
    ['R', [3, 0], [3, 2.6], { n: 'R_1' }], ['w', [3, 2.6], [3, 5.4]], ['node', [3, 4.4], { n: 'V_O', side: 'r' }],
    ['I', [4.2, 0], [4.2, 2.6], { n: 'I_2', s: '0.2\\,\\text{mA}' }], ['w', [4.2, 2.6], [4.2, 3.4], [3, 3.4]],
  ];
  const MC3 = P({
    id: 'MC-P3', src: 'Mock midterm C · P3 (40 pts)', title: 'Upside-down version: PMOS stack, NMOS mirror', big: true,
    q: md`Determine voltage $V_1$, $V_2$, $V_3$, and the maximum value of resistor $R_1$ such that transistor $M_4$ remains in saturation when $I_1 = 0.4\,\text{mA}$, $I_2 = 0.2\,\text{mA}$, $1X = \tfrac{200}{1}$, and $V_{DD} = 5\,\text{V}$. ($I_2$ pushes current *into* the output node from $V_{DD}$.)`,
    fig: mc3Fig,
    parts: [{ lbl: 'V_1', unit: 'V', ans: 3.8 }, { lbl: 'V_2', unit: 'V', ans: 2.6 }, { lbl: 'V_3', unit: 'V', ans: 1.2 }, { lbl: 'R_{1,max}', unit: 'kΩ', ans: 8 }],
    hints: [md`$2X$ PMOS: $\tfrac12(50\mu)(400) = 10\,\text{mA/V}^2$; $1X$ NMOS: $10\,\text{mA/V}^2$ too.`, md`$M_4$ ($2X$) mirrors $M_3$ ($1X$): twice the current. At the output node, $R_1$ and $I_2$ both supply $M_4$: $I_{R_1} = I_{M4} - I_2$.`, md`NMOS saturation: $V_D \ge V_G - V_T$.`],
    sol: md`**PMOS stack** (0.4 mA, $10\,\text{mA/V}^2$): $V_{ov} = 0.2$, $V_{SG} = 1.2$ each: $V_1 = 3.8\,\text{V}$, $V_2 = 2.6\,\text{V}$.
**$M_3$** ($1X$, $10\,\text{mA/V}^2$): $V_3 = 1.2\,\text{V}$.
**$M_4$** ($2X$): $0.8\,\text{mA}$. $R_1$ supplies $0.8 - 0.2 = 0.6\,\text{mA}$ from $V_{DD}$.
**Saturation:** $V_O = 5 - 0.6\text{m}\cdot R_1 \ge V_G - V_T = 0.2 \Rightarrow R_{1,max} = \dfrac{4.8}{0.6\,\text{mA}} = 8\kO$.`,
  });

  // ================================================================ mock midterm D (Spring 2026 style)
  const MD1a = P({
    id: 'MD-P1a', src: 'Mock midterm D · P1(a)', title: 'Scaling a linear black box',
    q: md`In the linear circuit in the Figure below, when $R_2 = \infty$ and $V_1 = 2\,\text{V}$, we find $V_2 = 3\,\text{V}$. Furthermore, when $R_2 = 0$ and $V_1 = 4\,\text{V}$, then $I_2 = 2\,\text{A}$. Find $V_2$ and $I_2$ when $R_2 = 1.5\,\Omega$ and $V_1 = 6\,\text{V}$.`,
    fig: FIGS.blackbox({ src: 'V' }),
    parts: [{ lbl: '\\RTH', unit: 'Ω', ans: 3 }, { lbl: 'V_2', unit: 'V', ans: 3 }, { lbl: 'I_2', unit: 'A', ans: 2 }],
    sol: md`$\VTH = 1.5V_1$ (open circuit), $\IN = 0.5V_1$ (short circuit), $\RTH = 3\,\Omega$. At $V_1 = 6$: $\VTH = 9\,\text{V}$, $I_2 = 9/(3 + 1.5) = 2\,\text{A}$, $V_2 = 3\,\text{V}$.`,
  });
  const MD1b = P({
    id: 'MD-P1b', src: 'Mock midterm D · P1(b)', title: 'Inverting nonlinear block',
    q: md`In the non-linear circuit below, $v_{IN} = 0.5\,\text{V}$ gives $v_{OUT} = 3\,\text{V}$, and $v_{IN} = 0.5 + 0.02\sin(\omega_ct)\,\text{V}$ gives $v_{OUT} = 3 - 0.1\sin(\omega_ct)\,\text{V}$. Determine $v_{OUT}$ for $v_{IN} = 0.5 + 0.04\cos(\omega_1t) - 0.01\sin(\omega_2t)\,\text{V}$.`,
    fig: FIGS.blackbox({ nonlinear: true, load: false, inName: 'v_{IN}', outName: 'v_{OUT}' }),
    parts: [{ lbl: 'A_v', unit: 'V/V', ans: -5 }, { lbl: 'v_{OUT}\\text{ DC value}', unit: 'V', ans: 3 }, { lbl: '\\text{coefficient of }\\cos(\\omega_1t)', unit: 'V', ans: -0.2 }, { lbl: '\\text{coefficient of }\\sin(\\omega_2t)', unit: 'V', ans: 0.05 }],
    sol: md`$A_v = -0.1/0.02 = -5$. $v_{OUT} = 3 - 0.2\cos(\omega_1t) + 0.05\sin(\omega_2t)\,\text{V}$.`,
  });
  const MD2 = P({
    id: 'MD-P2', src: 'Mock midterm D · P2 (35 pts)', title: 'Exponential element in series', big: true,
    q: md`A two terminal element $X$ with $i_X = I_Se^{v_X/V_T}$ sits in series between the source and the output; $R_1$ goes from the output to ground. The incremental gain is $A_v = \dfrac{v_{out}}{v_{in}} = \dfrac12$.
(a) Sketch the incremental model and give $r_x$ in terms of $V_T$ and the DC current $I_X$.
(b) Find $I_X$, $V_{OUT}$ and $V_{IN}$ in terms of $V_T$, $I_S$ and $R_1$.`,
    fig: FIGS.seriesX(),
    parts: [ex('VT/IX', ['VT', 'IX'], 'r_x'), ex('VT/R1', ['VT', 'R1'], 'I_X'), ex('VT', ['VT', 'R1'], 'V_{OUT}'), ex('VT + VT*ln(VT/(IS*R1))', ['VT', 'R1', 'IS'], 'V_{IN}')],
    hints: [md`Series element: the divider is $A_v = \dfrac{R_1}{R_1 + r_x}$.`, md`$\tfrac12 \Rightarrow r_x = R_1$. Then $V_{OUT} = R_1I_X$ and $V_X = V_T\ln(I_X/I_S)$.`],
    sol: md`**(a)** $r_x = \dfrac{V_T}{I_X}$. The model is $v_{in}$ → $r_x$ → output → $R_1$ → ground.

**(b)** $\dfrac{R_1}{R_1 + r_x} = \dfrac12 \Rightarrow r_x = R_1 \Rightarrow I_X = \dfrac{V_T}{R_1}$. Then $V_{OUT} = R_1I_X = V_T$, $V_X = V_T\ln\dfrac{V_T}{I_SR_1}$, and $V_{IN} = V_{OUT} + V_X = V_T + V_T\ln\dfrac{V_T}{I_SR_1}$.`,
  });
  const MD3 = P({
    id: 'MD-P3', src: 'Mock midterm D · P3 (40 pts)', title: 'Unequal stack, 4× PMOS mirror', big: true,
    q: md`Determine $V_1$, $V_2$, $V_3$, the current in $M_4$, and the maximum value of $R_1$ such that $M_4$ remains in saturation when $I_1 = 0.2\,\text{mA}$, $I_2 = 0.6\,\text{mA}$, $1X = \tfrac{100}{1}$, and $V_{DD} = 5\,\text{V}$.`,
    fig: FIGS.stackMirror({ s1: '1X', s2: '4X', s3: half, s4: '2X', i1s: '0.2\\,\\text{mA}', i2s: '0.6\\,\\text{mA}', vdd: 'V_{DD}=5\\,\\text{V}' }),
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.2 }, { lbl: 'V_2', unit: 'V', ans: 2.3 }, { lbl: 'V_3', unit: 'V', ans: 3.6 }, { lbl: 'I_{M4}', unit: 'mA', ans: 0.8 }, { lbl: 'R_{1,max}', unit: 'kΩ', ans: 23 }],
    hints: [md`$4X$ at the same current has half the overdrive of $1X$.`, md`$\tfrac12X$ PMOS: $\tfrac12(50\mu)(50) = 1.25\,\text{mA/V}^2$. $M_4$ ($2X$) is $4\times M_3$.`],
    sol: md`$M_1$ ($1X$, $5\,\text{mA/V}^2$): $V_{ov} = 0.2$, $V_1 = 1.2$. $M_2$ ($4X$): $V_{ov} = 0.1$, $V_2 = 1.2 + 1.1 = 2.3\,\text{V}$. $M_3$ ($\tfrac12X$, $1.25\,\text{mA/V}^2$): $V_{ov} = 0.4$, $V_3 = 5 - 1.4 = 3.6\,\text{V}$.
$M_4$ ($2X = 4\times M_3$): $0.8\,\text{mA}$; $I_{R_1} = 0.8 - 0.6 = 0.2\,\text{mA}$. $R_{1,max} = \dfrac{3.6 + 1}{0.2\,\text{mA}} = 23\kO$.`,
  });

  // ================================================================ new lessons inside the units
  insertAfter('u1', 'u1-blackbox', {
    id: 'u1-scaling', title: 'Scaling a black box with its source',
    steps: [
      R(md`
        This is the pattern from the **Spring 2026** Problem 1(a). A linear circuit with **no internal independent sources** is driven by $V_1$, and you're told what happens at its output for two special loads, measured at **different** source values.

        !!key Everything scales with the source
        By homogeneity, every voltage and current in a source-free linear circuit is proportional to $V_1$:
        $$\VTH = \alpha V_1,\qquad \IN = \beta V_1,\qquad \RTH = \frac{\VTH}{\IN} = \frac{\alpha}{\beta}\ \ (\text{independent of } V_1)$$

        The two special loads measure these directly:
        - $R_2 = \infty$ (**open circuit**): the $V_2$ you see is $V_{OC} = \VTH$.
        - $R_2 = 0$ (**short circuit**): the $I_2$ you see is $I_{SC} = \IN$.

        !!method How it's graded (from the Spring 2026 rubric)
        1. **Name** the open-circuit and short-circuit cases.
        2. **Write the scaling**: $\VTH = \alpha V_1$, $\IN = \beta V_1$.
        3. **Scale both to the new $V_1$** before combining them.
        4. $\RTH = \VTH/\IN$; then $I_2 = \VTH/(\RTH + R_2)$ and $V_2 = I_2R_2$.

        !!trap The common mistake
        Dividing a $V_{OC}$ measured at $V_1 = 1$ by an $I_{SC}$ measured at $V_1 = 2$ gives the wrong $\RTH$. Put both at the same $V_1$ first. This cost a real student 5 points.

        **Worked example (Spring 2026).** $R_2 = \infty$, $V_1 = 1$: $V_2 = 2$, so $\VTH = 2V_1$. $R_2 = 0$, $V_1 = 2$: $I_2 = 1$, so $\IN = 0.5V_1$. $\RTH = 4\,\Omega$. At $V_1 = 3$, $R_2 = 2\,\Omega$: $I_2 = 6/(4+2) = 1\,\text{A}$, $V_2 = 2\,\text{V}$.
      `),
      G('bb_scale', { need: 4 }),
      P({
        q: md`When the source of a source-free linear circuit doubles, what happens to its Thévenin resistance?`,
        parts: [{ mc: ['It stays the same', 'It doubles', 'It halves', 'It quadruples'], a: 0, why: [null, '$\\VTH$ and $\\IN$ both double; their ratio doesn\'t change.', '$\\RTH$ is found with the source switched off, so it can\'t depend on the source value.', 'Nothing here is squared.'] }],
        sol: md`Unchanged. $\RTH$ is defined with independent sources off, and $\VTH/\IN = \alpha/\beta$ doesn't involve $V_1$.`,
      }),
      P({
        q: md`Now the linear circuit **contains an internal independent source**. With $C$–$D$ open, $V_1 = 1\,\text{V}$ gives $V_2 = 2\,\text{V}$ and $V_1 = 3\,\text{V}$ gives $V_2 = 4\,\text{V}$. What is the open-circuit $V_2$ when $V_1 = 5\,\text{V}$?`,
        parts: [{ lbl: 'V_2', unit: 'V', ans: 6 }],
        hints: [md`With an internal source, $V_{OC}$ is **affine** in $V_1$: $V_{OC} = aV_1 + b$ (superposition: one part from $V_1$, one from the internal source). Two measurements fix $a$ and $b$.`],
        sol: md`$V_{OC} = aV_1 + b$: $a + b = 2$, $3a + b = 4 \Rightarrow a = 1$, $b = 1$. At $V_1 = 5$: $V_{OC} = 6\,\text{V}$. Pure scaling ($V_{OC} \propto V_1$) would have wrongly predicted $10\,\text{V}$. That's the affine trap from the linearity lesson.`,
      }),
    ],
  });

  insertAfter('u2', 'u2-taylor', {
    id: 'u2-sines', title: 'Sinusoidal test signals and several tones',
    steps: [
      R(md`
        The **Spring 2026** Problem 1(b) takes the two-data-point idea one step further. Instead of two DC points, you get a **sinusoid**, and then a new input with **two different tones**.

        !!key Reading the gain off a sinusoid
        If $v_{IN} = V_{IN} + a\sin(\omega t)$ produces $v_{OUT} = V_{OUT} + b\sin(\omega t)$, the small-signal gain at that operating point is
        $$A_v = \frac{b}{a}$$
        **with sign**: an output of $-0.2\sin$ for an input of $+0.1\sin$ means $A_v = -2$ (an inverted output).

        !!key Several small tones at once
        The incremental model is **linear**, so each small tone is multiplied by the same $A_v$ and the results add (superposition works *inside* the small-signal model). The DC part stays $V_{OUT}$ as long as the DC input is unchanged:
        $$v_{IN} = V_{IN} + p\sin(\omega_1t) + q\cos(\omega_2t)\;\Rightarrow\; v_{OUT} = V_{OUT} + A_vp\sin(\omega_1t) + A_vq\cos(\omega_2t)$$

        !!trap Two conditions
        This only works if the signals are **small** (first-order Taylor) and the **DC input is the same** as in the measurement. Change the DC input and the operating point moves, and so does the gain.

        **Worked example (Spring 2026).** $1 \to 2$; $1 + 0.1\sin \to 2 - 0.2\sin$, so $A_v = -2$. For $v_{IN} = 1 - 0.1\sin(\omega_1t) + 0.2\cos(\omega_2t)$: $v_{OUT} = 2 + 0.2\sin(\omega_1t) - 0.4\cos(\omega_2t)$.
      `),
      G('sine_gain', { need: 4 }),
      P({
        q: md`A nonlinear block has small-signal gain $-2$ about $v_{IN} = 1\,\text{V}$. You now apply $v_{IN} = 1.5 + 0.1\sin(\omega t)$. Can you conclude the output tone is $-0.2\sin(\omega t)$?`,
        parts: [{ mc: ['No. The DC input moved, so the operating point and gain may differ.', 'Yes. The gain is a property of the circuit.', 'Yes, because $0.1$ is small.', 'No, because sinusoids can\'t be linearised.'], a: 0, why: [null, 'For a nonlinear circuit, the gain depends on where it\'s biased.', 'Small amplitude is necessary but not sufficient: the DC point must match too.', 'They can; that\'s the whole point of the incremental model.'] }],
        sol: md`No. The incremental gain is the slope at a specific operating point. At $1.5\,\text{V}$ the slope is generally different.`,
      }),
    ],
  });

  insertAfter('u2', 'u2-nlsrc', {
    id: 'u2-inverse', title: 'Working backward: from gain to operating point',
    steps: [
      R(md`
        The **Spring 2026** Problem 2 (35 points) turns the usual problem around. Instead of "find the operating point, then the gain", it **gives you the gain** and asks for the operating point. It works because $r_x$ depends on the DC operating point.

        !!method Recipe
        1. **Differentiate** the element law: $\dfrac1{r_x} = \dfrac{di_X}{dv_X}\Big|_Q$. Write $r_x$ as a function of the DC voltage (or current).
        2. **Draw the incremental model**: DC sources shorted, element → $r_x$.
        3. **Write the gain from the model.** Element from output to ground: $A_v = \dfrac{r_x}{R_1 + r_x}$. Element in series: $A_v = \dfrac{R_1}{R_1 + r_x}$.
        4. **Set it equal to the given gain** → a number times $R_1$ for $r_x$.
        5. **Solve step 1's formula** for the DC voltage.
        6. **DC KVL** for anything else ($V_{IN} = V_{OUT} + R_1I_X$).

        !!trap Read the divider off the model
        On the real exam, $v_{out}/v_{in} = r_x/R_1$ (instead of $r_x/(R_1+r_x)$) cost 10 points. Draw the model; the divider is then obvious.

        **Worked example (Spring 2026).** $i_X = G_Mv_X^2/(2V_T)$, shunt, $A_v = \tfrac13$. Then $r_x = V_T/(G_MV_{OUT})$; $\tfrac13 \Rightarrow r_x = R_1/2$; so $V_{OUT} = 2V_T/(G_MR_1)$; and $V_{IN} = V_{OUT} + R_1\frac{G_MV_{OUT}^2}{2V_T} = 2V_{OUT} = 4V_T/(G_MR_1)$.

        | Element law | $r_x$ |
        |---|---|
        | $i = \frac{G_Mv^2}{2V_T}$ | $\frac{V_T}{G_MV_X}$ |
        | $i = \frac{G_Mv^3}{3V_T^2}$ | $\frac{V_T^2}{G_MV_X^2}$ |
        | $i = I_Se^{v/V_T}$ | $\frac{V_T}{I_X}$ |
      `),
      P({
        q: md`Numeric version of the Spring 2026 circuit: $i_X = G_Mv_X^2/(2V_T)$ with $G_M = 2\,\text{mA/V}$, $V_T = 1\,\text{V}$, $R_1 = 1\kO$, and the incremental gain is $\tfrac13$. Find $r_x$, $V_{OUT}$ and $V_{IN}$.`,
        fig: FIGS.shuntX(),
        parts: [{ lbl: 'r_x', unit: 'Ω', ans: 500 }, { lbl: 'V_{OUT}', unit: 'V', ans: 1 }, { lbl: 'V_{IN}', unit: 'V', ans: 2 }],
        hints: [md`$r_x = R_1/2$. Then $r_x = V_T/(G_MV_{OUT})$.`],
        sol: md`$r_x = R_1/2 = 500\,\Omega$. $V_{OUT} = \dfrac{V_T}{G_Mr_x} = \dfrac{1}{(2\text{m})(500)} = 1\,\text{V}$. $i_X = \dfrac{2\text{m}\cdot1}{2} = 1\,\text{mA}$, so $V_{IN} = 1 + (1\text{k})(1\text{m}) = 2\,\text{V}$.`,
      }),
      G('inverse_op', { need: 4 }),
    ],
  });

  insertAfter('u4', 'u4-stack', {
    id: 'u4-stackmirror', title: 'A current source between stacks',
    steps: [
      R(md`
        The **Spring 2026** Problem 3 (40 points) combines everything from this unit in one circuit:
        - A current source $I_1$ sits **between** a diode-connected PMOS above it and a stack of diode-connected NMOS below it. The same $I_1$ flows through all of them, so each drops its own $V_{GS}$ ($V_{SG}$).
        - The diode-connected PMOS sets the gate of a **PMOS mirror** $M_4$: same $V_{SG}$, so current scales with size.
        - $M_4$'s drain feeds a node with **both a resistor $R_1$ and a current sink $I_2$**. By KCL, $R_1$ only carries what's left: $I_{R_1} = I_{M4} - I_2$.
        - The saturation shortcut gives the limit: $V_D = I_{R_1}R_1 \le V_G + |V_T|$, so
          $$R_{1,max} = \frac{V_G + |V_T|}{I_{M4} - I_2}$$

        !!tip Why the PMOS was $\tfrac12X$
        $\mu_pC_{ox}$ is half of $\mu_nC_{ox}$, so a $\tfrac12X$ PMOS has a quarter of a $1X$ NMOS's $k'$. At the same current, its overdrive is **twice** as large (0.4 V vs 0.2 V). That's how the exam keeps every number clean.

        !!trap Two things to check
        The current source needs headroom ($V_3 > V_2$), and every device must actually be on. Do the one-line check.
      `),
      X.S26P3,
      G('stack_mirror_rmax', { need: 3 }),
    ],
  });

  // ================================================================ Unit 5: the paper, two mocks, playbook, drill pool
  insertAfter('u5', 'u5-playbook',
    {
      id: 'u5-s26', title: 'Past paper: Spring 2026 (most recent)', kind: 'exam',
      steps: [
        R(md`
          Midterm 1, Feb 19, 2026, from a graded copy. Closest to your exam's format (yours allows calculators). 50 minutes.

          !!trap What the graders took points off for
          - **P1(a):** not identifying the open-circuit or short-circuit case (−1.5); not scaling $V_{OC}$ and $I_{SC}$ to the new $V_1$ (−3); not stating $\VTH = 2V_1$ (−2); a wrong method for $V_2$ (−1).
          - **P2(b):** a wrong gain expression ($r_x/R_1$ instead of the divider) made both $V_{OUT}$ and $V_{IN}$ wrong (−5, −5).
          - **P3:** "show all steps for full credit." Full marks required every $V_{GS}$, the KCL at the output, and the saturation inequality written out.
        `),
        X.S26P1a, X.S26P1b, X.S26P2, X.S26P3,
      ],
    },
    { id: 'u5-mockC', title: 'Mock midterm C (Spring 2026 style)', kind: 'mock', steps: [R(md`Original, Spring 2026 format. 50 minutes.`), MC1a, MC1b, MC2, MC3] },
    { id: 'u5-mockD', title: 'Mock midterm D (Spring 2026 style)', kind: 'mock', steps: [R(md`Original, Spring 2026 format. 50 minutes.`), MD1a, MD1b, MD2, MD3] },
  );

  lesson('u5', 'u5-playbook').steps.push(R(md`
    ### The latest paper sets the template
    The **Spring 2026** midterm is the closest thing to your exam:
    - **P1 (25):** short answers. (a) Scale a linear black box with its source: open circuit → $\VTH$, short circuit → $\IN$, scale both, then combine. (b) Read $A_v$ off a sinusoid (sign included) and apply it to a two-tone input.
    - **P2 (35):** a two-terminal nonlinear element with a symbolic law. **Given the gain**, find $r_x$ and then the DC operating point, all symbolic.
    - **P3 (40):** a current source feeding a diode-connected PMOS above and a diode-connected NMOS stack below; a PMOS mirror into $R_1$ in parallel with a current sink; find the node voltages and $R_{1,max}$.

    Its rubric rewards **naming what you're doing**: "this is the open-circuit case", "$\VTH = 2V_1$", "$I_{R_1} = I_{M4} - I_2$ by KCL", "saturation: $V_D \le V_G + |V_T|$". Write those sentences.
  `));

  const mixed = lesson('u5', 'u5-mixed').steps.find((s) => s.t === 'gen');
  mixed.opts.pool.push('bb_scale', 'sine_gain', 'inverse_op', 'stack_mirror_rmax');
})();

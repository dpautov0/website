/* paper-s26.js — Spring 2026 Midterm 1 as a typed paper: each question with a show/hide answer toggle.
   Step type 'paper' (see engine.js): { html | head, figs, items: [{ q, ans, sol, figs }] }. */
(function () {
  const u5 = COURSE.units.find((u) => u.id === 'u5');
  const V = '\\,\\text{V}', mA = '\\,\\text{mA}';

  // ---------------------------------------------------------------- figures
  const bbIn = (v) => [
    ['V', [0, 0.5], [0, 1.5], { n: 'V_1', s: v, side: 'l' }],
    ['w', [0, 0.5], [0, 0], [1.3, 0]], ['w', [0, 1.5], [0, 2], [1.3, 2]],
    ['box', [1.3, -0.35], [3.3, 2.35], { n: 'Linear<br/>circuit' }],
  ];
  const oc = [...bbIn('1' + V),
    ['w', [3.3, 0], [4.3, 0]], ['w', [3.3, 2], [4.3, 2]], ['term', [4.3, 0]], ['term', [4.3, 2]],
    ['vlab', [4.3, 0.4], [4.3, 1.6], { n: 'V_{OC} = 2' + V }]];
  const sc = [...bbIn('2' + V),
    ['w', [3.3, 0], [4.3, 0], [4.3, 2], [3.3, 2]],
    ['iarr', [4.3, 1], 'd', { n: 'I_{SC} = 1\\,\\text{A}', side: 'r' }]];
  const th = [
    ['V', [0, 0.5], [0, 1.5], { n: '\\VTH', s: '6' + V, side: 'l' }],
    ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: '\\RTH', s: '4\\,\\Omega' }],
    ['w', [1.8, 0], [3.2, 0]], ['iarr', [2.5, 0], 'r', { n: 'I_2' }],
    ['R', [3.2, 0], [3.2, 2], { n: 'R_2', s: '2\\,\\Omega', side: 'l' }], ['w', [0, 1.5], [0, 2], [3.2, 2]],
    ['vlab', [3.9, 0.3], [3.9, 1.7], { n: 'V_2' }]];

  const f = (v) => 4 / (1 + v * v);                         // any smooth curve through Q with slope -2
  const qplot = Schem.plot({
    x: [0, 2.5], y: [0, 4.4], xl: 'v_{IN}\\,(\\text{V})', yl: 'v_{OUT}\\,(\\text{V})', xt: [0, 1, 2], yt: [0, 2, 4],
    curves: [{ f, cls: 'dc' }, { f: (v) => 4 - 2 * v, from: 0.4, to: 1.6, cls: 'dash' }],
    pts: [{ x: 1, y: 2, n: 'Q' }],
  });

  const relabel = (fig, names) => fig.map((e) => {
    const o = e.find((x) => x && typeof x === 'object' && !Array.isArray(x));
    const n = o && names[o.n];
    return n ? e.map((x) => (x === o ? Object.assign({}, o, { n }) : x)) : e;
  });
  const ssX = relabel(DRAW.ss(FIGS.shuntX(), { side: 'l' }), { i_X: 'i_x', v_X: 'v_x' });
  const dcX = relabel(FIGS.shuntX().map((e) => (e[0] === 'Vac' ? ['w', e[1], e[2]] : e)), { 'V_{OUT}+v_{out}': 'V_{OUT}', i_X: 'I_X', v_X: 'V_X' });

  const half = '\\tfrac12X';
  const p3 = FIGS.stackMirror({ s1: '1X', s2: '1X', s3: half, s4: half, i1s: '0.5' + mA, i2s: '0.25' + mA, vdd: 'V_{DD}=5' + V });
  const p3sol = [
    ...p3.map((e) => {
      const o = e.find((x) => x && typeof x === 'object' && !Array.isArray(x));
      const val = o && e[0] === 'node' && { V_1: '1.2', V_2: '2.4', V_3: '3.6' }[o.n];
      return val ? [e[0], e[1], Object.assign({}, o, { n: `${o.n} = ${val}${V}` })] : e;
    }),
    ['iarr', [3, 2.5], 'd', { n: 'I_{D4} = 0.5' + mA, side: 'r' }],
    ['iarr', [3, 3.35], 'd', { n: 'I_{R_1} = 0.25' + mA, side: 'l', off: [-14, 0] }],
  ];

  // ---------------------------------------------------------------- the paper
  const cover = {
    t: 'paper',
    html: `
      <div class="pp-title"><span>ECE342</span><span>Midterm I</span><span>Spring 2026</span></div>
      <div class="pp-meta"><span>Test date: 02/19/2026</span><span>3 problems</span><span>Calculators not allowed</span><span>No additional sheets</span></div>
      <table class="pp-pts">
        <tr><td>1.</td><td>(25 points)</td></tr><tr><td>2.</td><td>(35 points)</td></tr><tr><td>3.</td><td>(40 points)</td></tr>
        <tr><td>Total</td><td>(100 points)</td></tr>
      </table>
      <p class="pp-sub">Transistor parameters</p>
      <table class="pp-par">
        <tr><td>NMOS:</td><td>$k_n' = \\mu_nC_{ox} = 100\\,\\mu\\text{A/V}^2;\\ \\ V_{tn} = 1\\,\\text{V};\\ \\ \\lambda_n = 0$</td></tr>
        <tr><td>PMOS:</td><td>$k_p' = \\mu_pC_{ox} = 50\\,\\mu\\text{A/V}^2;\\ \\ V_{tp} = -1\\,\\text{V};\\ \\ \\lambda_p = 0$</td></tr>
      </table>`,
  };

  const P1 = {
    t: 'paper',
    head: md`**PROBLEM 1. (25 points)** Answer the following **short answer** questions. Show the intermediate steps in your solution:`,
    items: [
      {
        q: md`**(a)** In the linear circuit in Figure below when $R_2 = \infty$ and $V_1 = 1\,\text{V}$, we find $V_2 = 2\,\text{V}$. Furthermore, when $R_2 = 0$ and $V_1 = 2\,\text{V}$, then $I_2 = 1\,\text{A}$. Find $V_2$ and $I_2$ when $R_2 = 2\,\Omega$ and $V_1 = 3\,\text{V}$.

[[fig:q]]`,
        ans: md`$V_2 = 2\,\text{V}$, $\quad I_2 = 1\,\text{A}$`,
        sol: md`$R_2 = \infty$ is the **open-circuit** test, so $V_{OC} = \VTH$:
[[fig:oc]]
The circuit is linear and $V_1$ is its only source, so $\VTH \propto V_1$: $\VTH = 2V_1$.

$R_2 = 0$ is the **short-circuit** test, so $I_{SC} = \IN$:
[[fig:sc]]
$\IN = 0.5V_1$. Both were measured at different $V_1$, so divide the scaled forms:
$$\RTH = \frac{\VTH}{\IN} = \frac{2V_1}{0.5V_1} = 4\,\Omega$$

At $V_1 = 3\,\text{V}$: $\VTH = 6\,\text{V}$.
[[fig:th]]
$$I_2 = \frac{\VTH}{\RTH + R_2} = \frac{6}{4 + 2} = 1\,\text{A},\qquad V_2 = I_2R_2 = 2\,\text{V}$$`,
        figs: {
          q: { fig: FIGS.blackbox({ src: 'V' }) },
          oc: { fig: oc, cap: '$R_2 = \\infty$, $V_1 = 1\\,\\text{V}$' },
          sc: { fig: sc, cap: '$R_2 = 0$, $V_1 = 2\\,\\text{V}$' },
          th: { fig: th, cap: 'Thévenin equivalent at $V_1 = 3\\,\\text{V}$, with $R_2 = 2\\,\\Omega$' },
        },
      },
      {
        q: md`**(b)** In the non-linear circuit in the Figure below, when the input voltage $v_{IN} = 1\,\text{V}$, the output voltage $v_{OUT} = 2\,\text{V}$. If the input voltage is $v_{IN} = 1 + 0.1\sin(\omega_ct)\,\text{V}$, the output voltage changes to $v_{OUT} = 2 - 0.2\sin(\omega_ct)\,\text{V}$. Determine the output voltage if the input voltage is $v_{IN} = 1 - 0.1\sin(\omega_1t) + 0.2\cos(\omega_2t)\,\text{V}$.

[[fig:q]]`,
        ans: md`$v_{OUT} = 2 + 0.2\sin(\omega_1t) - 0.4\cos(\omega_2t)\,\text{V}$`,
        sol: md`The DC input is $1\,\text{V}$ both times, so the operating point is the same: $Q = (1\,\text{V},\ 2\,\text{V})$. Near $Q$ the curve is its tangent line, with slope
$$A_v = \frac{\Delta v_{OUT}}{\Delta v_{IN}} = \frac{-0.2}{0.1} = -2$$
[[fig:q2]]
The incremental model is linear, so each small tone is multiplied by $A_v$ and the results add:
$$\begin{aligned} v_{OUT} &= 2 + (-2)(-0.1)\sin(\omega_1t) + (-2)(0.2)\cos(\omega_2t)\\ &= 2 + 0.2\sin(\omega_1t) - 0.4\cos(\omega_2t)\,\text{V}\end{aligned}$$`,
        figs: {
          q: { fig: FIGS.blackbox({ nonlinear: true, load: false, inName: 'v_{IN}', outName: 'v_{OUT}' }) },
          q2: { svg: qplot, cap: 'the real curve is unknown; near $Q$ only its slope matters (dashed tangent, slope $-2$)' },
        },
      },
    ],
  };

  const P2 = {
    t: 'paper',
    head: md`**PROBLEM 2. (35 points)** Consider the circuit shown below that uses a **two terminal** nonlinear element $X$ whose current $i_X$ between the terminals is related to the voltage $v_X$ across it by the expression $i_X = \dfrac{G_Mv_X^2}{2V_T}$, where $G_M$ and $V_T$ are known constants.

[[fig:q]]
Now, if the incremental gain of the circuit above is $A_v = \dfrac{v_{out}}{v_{in}} = \dfrac13$, answer the following:`,
    figs: { q: { fig: FIGS.shuntX() } },
    items: [
      {
        q: md`**(a)** sketch the incremental model of the circuit in the figure above, and find an expression for the incremental resistance $r_x = v_x/i_x$ of the element $X$ in terms of $G_M$, $V_T$, and the DC voltage $V_{OUT}$.`,
        ans: md`$r_x = \dfrac{V_T}{G_MV_{OUT}}$`,
        sol: md`Incremental model: DC source $V_{IN}$ becomes a short, $X$ becomes the resistor $r_x$.
[[fig:ss]]
$X$ sits between the output and ground, so its DC voltage is $V_X = V_{OUT}$.
$$\frac{1}{r_x} = \frac{di_X}{dv_X}\bigg|_{V_X} = \frac{2G_MV_X}{2V_T} = \frac{G_MV_{OUT}}{V_T}\qquad\Rightarrow\qquad r_x = \frac{V_T}{G_MV_{OUT}}$$`,
        figs: { ss: { fig: ssX, cap: 'incremental model' } },
      },
      {
        q: md`**(b)** compute the DC operating point voltages $V_{OUT}$ and $V_{IN}$ in terms of $G_M$, $V_T$, and $R_1$.`,
        ans: md`$V_{OUT} = \dfrac{2V_T}{G_MR_1}$, $\quad V_{IN} = \dfrac{4V_T}{G_MR_1}$`,
        sol: md`In the incremental model, $R_1$ and $r_x$ form a **divider**:
$$A_v = \frac{r_x}{R_1 + r_x} = \frac13\qquad\Rightarrow\qquad r_x = \frac{R_1}{2}$$
Set this equal to the result of (a):
$$\frac{V_T}{G_MV_{OUT}} = \frac{R_1}{2}\qquad\Rightarrow\qquad V_{OUT} = \frac{2V_T}{G_MR_1}$$
For $V_{IN}$ use the DC circuit ($v_{in} = 0$):
[[fig:dc]]
$$V_{IN} = V_{OUT} + R_1I_X,\qquad I_X = \frac{G_MV_{OUT}^2}{2V_T}$$
$$R_1I_X = \frac{R_1G_MV_{OUT}}{2V_T}\cdot V_{OUT} = \frac{R_1G_M}{2V_T}\cdot\frac{2V_T}{G_MR_1}\cdot V_{OUT} = V_{OUT}$$
$$V_{IN} = 2V_{OUT} = \frac{4V_T}{G_MR_1}$$`,
        figs: { dc: { fig: dcX, cap: 'DC circuit: $v_{in}$ off' } },
      },
    ],
  };

  const P3 = {
    t: 'paper',
    head: md`**PROBLEM 3. (40 points)**`,
    items: [{
      q: md`Determine voltage $V_1$, $V_2$, $V_3$, and the maximum value of resistor $R_1$ such that transistor $M_4$ remains in saturation when $I_1 = 0.5\,\text{mA}$, $I_2 = 0.25\,\text{mA}$, $1X = \dfrac{250}{1}$, and $V_{DD} = 5\,\text{V}$. Please show all steps for full credit.

[[fig:q]]`,
      ans: md`$V_1 = 1.2\,\text{V}$, $\quad V_2 = 2.4\,\text{V}$, $\quad V_3 = 3.6\,\text{V}$, $\quad R_{1,max} = 18.4\kO$`,
      sol: md`$I_1$ flows down through $M_3$, $M_2$ and $M_1$. Each is diode-connected ($V_D = V_G$), so each is in saturation and drops its own $V_{GS}$ (or $V_{SG}$).

**$M_1$** ($1X$ NMOS):
$$\tfrac12k_n'\tfrac{W}{L} = \tfrac12\times 100\,\mu\text{A/V}^2\times 250 = 12.5\,\text{mA/V}^2$$
$$V_{ov}^2 = \frac{0.5\,\text{mA}}{12.5\,\text{mA/V}^2} = 0.04\,\text{V}^2\qquad\Rightarrow\qquad V_{ov} = 0.2\,\text{V},\quad V_1 = V_{GS1} = 1.2\,\text{V}$$

**$M_2$**: same size and same current as $M_1$, so the same $V_{GS} = 1.2\,\text{V}$:
$$V_2 = V_1 + 1.2 = 2.4\,\text{V}$$

**$M_3$** ($\tfrac12X$ PMOS):
$$\tfrac12k_p'\tfrac{W}{L} = \tfrac12\times 50\,\mu\text{A/V}^2\times 125 = 3.125\,\text{mA/V}^2$$
$$V_{ov}^2 = \frac{0.5}{3.125} = 0.16\,\text{V}^2\qquad\Rightarrow\qquad V_{ov} = 0.4\,\text{V},\quad V_{SG3} = 1.4\,\text{V}$$
$$V_3 = V_{DD} - V_{SG3} = 5 - 1.4 = 3.6\,\text{V}$$
Check: $V_3 > V_2$, so the source $I_1$ has room.

**$R_{1,max}$**: $M_4$ has the same size as $M_3$ and the same $V_{SG}$ (gates tied, sources at $V_{DD}$), so in saturation it copies $I_{D4} = 0.5\,\text{mA}$.

KCL at the drain of $M_4$:
$$I_{R_1} = I_{D4} - I_2 = 0.5 - 0.25 = 0.25\,\text{mA}$$
PMOS saturation, $V_{SD} \ge V_{SG} - |V_{tp}|$, is the same as $V_D \le V_G + |V_{tp}|$:
$$V_D = I_{R_1}R_1 \le 3.6 + 1 = 4.6\,\text{V}$$
$$R_{1,max} = \frac{4.6\,\text{V}}{0.25\,\text{mA}} = 18.4\kO$$
[[fig:sol]]`,
      figs: {
        q: { fig: p3 },
        sol: { fig: p3sol, cap: 'solved: node voltages and branch currents' },
      },
    }],
  };

  const at = u5.lessons.findIndex((l) => l.id === 'u5-playbook') + 1;
  u5.lessons.splice(at, 0, {
    id: 'u5-s26-paper', title: 'Midterm 1, Spring 2026 (typed)', kind: 'paper',
    steps: [cover, P1, P2, P3],
  });
})();

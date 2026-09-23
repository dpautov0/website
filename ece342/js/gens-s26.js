/* gens-s26.js — generators modelled on the Spring 2026 Midterm 1 problems:
   black-box scaling (P1a), sinusoidal small-signal gain (P1b), gain -> operating point (P2),
   current-source-fed stack with a PMOS mirror, load resistor and current sink (P3). */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick;
  const GENS = window.GENS, FIGS = window.FIGS;
  const { tryUntil, clean, kO, Vv } = window.GEN_HELPERS;
  const xs = (m) => (m === 0.25 ? '\\tfrac14X' : m === 0.5 ? '\\tfrac12X' : `${m}X`);
  const sgn = (x) => (x < 0 ? '-' : '+');

  // ================================================================ figures
  FIGS.blackbox = (o = {}) => [
    o.src === 'I' ? ['I', [0, 1.5], [0, 0.5], { n: 'I_1', side: 'l' }] : ['V', [0, 0.5], [0, 1.5], { n: o.inName || 'V_1', side: 'l' }],
    ['w', [0, 0.5], [0, 0], [1.3, 0]], ['w', [0, 1.5], [0, 2], [1.3, 2]],
    ['term', [0.75, 0], { n: 'A', side: 'a' }], ['term', [0.75, 2], { n: 'B', side: 'b' }],
    ['box', [1.3, -0.35], [3.3, 2.35], { n: o.nonlinear ? 'Non-linear<br/>circuit' : 'Linear<br/>circuit' }],
    ['w', [3.3, 0], [o.load === false ? 4.1 : 4.6, 0]], ['w', [3.3, 2], [o.load === false ? 4.1 : 4.6, 2]],
    ['term', [3.95, 0], { n: 'C', side: 'a' }], ['term', [3.95, 2], { n: 'D', side: 'b' }],
    ['vlab', [3.95, 0.4], [3.95, 1.6], { n: o.outName || 'V_2', side: 'l' }],
    ...(o.load === false ? [] : [['R', [4.6, 0], [4.6, 2], { n: 'R_2' }], ['iarr', [4.6, 0.55], 'd', { n: 'I_2', off: [20, 0] }]]),
  ];

  FIGS.shuntX = () => [
    ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
    ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_1' }],
    ['w', [1.8, -0.4], [3, -0.4]], ['term', [3, -0.4], { n: 'V_{OUT}+v_{out}' }],
    ['X', [1.8, -0.4], [1.8, 2.2]], ['gnd', [1.8, 2.2]],
    ['iarr', [1.8, 0.15], 'd', { n: 'i_X', side: 'l', off: [-15, 0] }], ['vlab', [2.2, 0.35], [2.2, 1.45], { n: 'v_X' }],
  ];

  FIGS.seriesX = () => [
    ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
    ['w', [0, 0.2], [0, -0.4]], ['X', [0, -0.4], [2, -0.4]], ['vlab', [0.45, -0.8], [1.55, -0.8], { n: 'v_X', side: 'a' }],
    ['iarr', [0.35, -0.4], 'r', { n: 'i_X', off: [0, 14], side: 'b' }],
    ['R', [2, -0.4], [2, 2.2], { n: 'R_1' }], ['gnd', [2, 2.2]],
    ['w', [2, -0.4], [3.1, -0.4]], ['term', [3.1, -0.4], { n: 'V_{OUT}+v_{out}' }],
  ];

  // Spring 2026 P3 topology: PMOS diode (M3) -> I1 -> NMOS diode M2 -> NMOS diode M1; M4 mirrors M3 into R1 || I2.
  FIGS.stackMirror = (o = {}) => [
    ['w', [0, 0], [3, 0]], ['rail', [1.5, 0], { n: o.vdd || 'V_{DD}' }],
    ['pmos', [0, 1], { n: 'M_3', sz: o.s3, flip: true }], ['w', [1, 1], [1, 2], [0, 2]], ['node', [0, 2], { n: 'V_3', side: 'l' }],
    ['I', [0, 2], [0, 3.4], { n: 'I_1', s: o.i1s, side: 'l' }], ['node', [0, 3.4], { n: 'V_2', side: 'l' }],
    ['nmos', [0, 4.4], { n: 'M_2', sz: o.s2, flip: true, dc: true }], ['node', [0, 5.4], { n: 'V_1', side: 'l' }],
    ['nmos', [0, 6.4], { n: 'M_1', sz: o.s1, flip: true, dc: true }], ['gnd', [0, 7.4]],
    ['w', [1, 1], [2, 1]], ['pmos', [3, 1], { n: 'M_4', sz: o.s4 }],
    ['w', [3, 2], [3, 3], [4.4, 3]], ['R', [3, 3], [3, 4.6], { n: 'R_1' }], ['gnd', [3, 4.6]],
    ['I', [4.4, 3], [4.4, 4.6], { n: 'I_2', s: o.i2s }], ['gnd', [4.4, 4.6]],
  ];

  // ================================================================ P1(a) style: scale the black box
  GENS.bb_scale = () => {
    const isI = Math.random() < 0.3;
    const c = tryUntil(() => {
      const kv = pick([0.5, 1, 1.5, 2, 3]), RTH = pick([1, 2, 3, 4, 5, 6]);
      const ki = kv / RTH;
      const Sa = pick([1, 2, 3]), Sb = pick([1, 2, 4]), Sc = pick([2, 3, 4, 5, 6]), RL = pick([1, 2, 3, 4, 6]);
      const VOCa = kv * Sa, ISCb = ki * Sb, VTHc = kv * Sc, I2 = VTHc / (RTH + RL);
      return { kv, RTH, ki, Sa, Sb, Sc, RL, VOCa, ISCb, VTHc, ISCc: ki * Sc, I2, V2: I2 * RL };
    }, (o) => clean(o.ISCb, 3) && clean(o.I2, 3) && clean(o.V2, 3) && o.Sc !== o.Sa && o.Sc !== o.Sb);
    const S = isI ? 'I_1' : 'V_1', su = isI ? '\\,\\text{mA}' : '\\,\\text{V}', ru = isI ? '\\kO' : '\\,\\Omega', iu = isI ? '\\,\\text{mA}' : '\\,\\text{A}';
    return {
      q: `In the linear circuit in the Figure below, when $R_2 = \\infty$ and $${S} = ${c.Sa}${su}$, we find $V_2 = ${f(c.VOCa)}\\,\\text{V}$. Furthermore, when $R_2 = 0$ and $${S} = ${c.Sb}${su}$, then $I_2 = ${f(c.ISCb)}${iu}$. Find $V_2$ and $I_2$ when $R_2 = ${c.RL}${ru}$ and $${S} = ${c.Sc}${su}$.`,
      fig: FIGS.blackbox({ src: isI ? 'I' : 'V' }),
      parts: [{ lbl: '\\RTH', unit: isI ? 'kΩ' : 'Ω', ans: c.RTH }, { lbl: 'V_2', unit: 'V', ans: c.V2 }, { lbl: 'I_2', unit: isI ? 'mA' : 'A', ans: c.I2 }],
      hints: [
        md`$R_2 = \infty$ is an **open circuit**, so that $V_2$ is $V_{OC} = \VTH$. $R_2 = 0$ is a **short circuit**, so that $I_2$ is $I_{SC} = \IN$. Say so explicitly; the rubric awards points for it.`,
        `No internal sources, so by homogeneity both scale with the source: $\\VTH = (\\text{const})\\cdot ${S}$ and $\\IN = (\\text{const})\\cdot ${S}$. Find each constant from its own measurement.`,
        md`$\RTH = \VTH/\IN$ doesn't depend on the source. Then $I_2 = \VTH/(\RTH + R_2)$ and $V_2 = I_2R_2$.`,
      ],
      sol: `**Open circuit** ($R_2 = \\infty$): $V_{OC} = ${f(c.VOCa)}\\,\\text{V}$ at $${S} = ${c.Sa}$, so $\\VTH = ${f(c.kv)}\\,${S}$.

**Short circuit** ($R_2 = 0$): $I_{SC} = ${f(c.ISCb)}$ at $${S} = ${c.Sb}$, so $\\IN = ${f(c.ki)}\\,${S}$.

$\\RTH = \\dfrac{\\VTH}{\\IN} = \\dfrac{${f(c.kv)}}{${f(c.ki)}} = ${c.RTH}${ru}$, the same at every source value.

**Scale to $${S} = ${c.Sc}$:** $\\VTH = ${f(c.VTHc)}\\,\\text{V}$, $\\IN = ${f(c.ISCc)}${iu}$. With $R_2 = ${c.RL}${ru}$:
$$I_2 = \\frac{${f(c.VTHc)}}{${c.RTH} + ${c.RL}} = ${f(c.I2)}${iu},\\qquad V_2 = I_2R_2 = ${f(c.V2)}\\,\\text{V}$$`,
    };
  };

  // ================================================================ P1(b) style: gain from a sinusoid, apply to new tones
  GENS.sine_gain = () => {
    const X0 = pick([0.5, 1, 2]), Y0 = pick([1, 2, 3, 5]);
    const a = pick([0.05, 0.1, 0.2]), A = pick([-5, -4, -3, -2, -1.5, 2, 3, 4, 0.5]);
    const b = A * a;
    const p = pick([0.1, -0.1, 0.05, -0.05, 0.02]), q = pick([0.2, -0.1, 0.1, -0.2, 0.04]);
    const useCos = Math.random() < 0.3;
    const t = (c, fn, w) => `${sgn(c)} ${f(Math.abs(c))}\\${fn}(${w})`;
    const measIn = `${X0} ${t(a, useCos ? 'cos' : 'sin', '\\omega_ct')}`, measOut = `${Y0} ${t(b, useCos ? 'cos' : 'sin', '\\omega_ct')}`;
    const newIn = `${X0} ${t(p, 'sin', '\\omega_1t')} ${t(q, 'cos', '\\omega_2t')}`;
    const ans = `${Y0} ${t(A * p, 'sin', '\\omega_1t')} ${t(A * q, 'cos', '\\omega_2t')}`;
    return {
      q: `In the non-linear circuit in the Figure below, when the input voltage $v_{IN} = ${X0}\\,\\text{V}$, the output voltage $v_{OUT} = ${Y0}\\,\\text{V}$. If the input voltage is $v_{IN} = ${measIn}\\,\\text{V}$, the output voltage changes to $v_{OUT} = ${measOut}\\,\\text{V}$. Determine the output voltage if the input voltage is $v_{IN} = ${newIn}\\,\\text{V}$.`,
      fig: FIGS.blackbox({ nonlinear: true, load: false, inName: 'v_{IN}', outName: 'v_{OUT}' }),
      parts: [{ lbl: 'A_v', unit: 'V/V', ans: A }, { lbl: 'v_{OUT}\\text{ DC value}', unit: 'V', ans: Y0 }, { lbl: '\\text{coefficient of }\\sin(\\omega_1t)', unit: 'V', ans: A * p }, { lbl: '\\text{coefficient of }\\cos(\\omega_2t)', unit: 'V', ans: A * q }],
      hints: [
        md`The small-signal gain is the ratio of the output and input amplitudes at the same frequency, **with sign**. An output that goes down when the input goes up means a negative gain.`,
        md`The DC input hasn't changed, so the operating point and the gain haven't either. Each small tone is multiplied by the same gain (the incremental model is linear, so superposition holds for the tones), and the DC value is unchanged.`,
      ],
      sol: `**Gain:** $A_v = \\dfrac{\\Delta v_{OUT}}{\\Delta v_{IN}} = \\dfrac{${f(b)}}{${f(a)}} = ${f(A)}$${A < 0 ? ' (the output tone is inverted)' : ''}.

**New input:** same DC point ($${X0}\\,\\text{V}$), so the same gain applies to each small tone, and by superposition in the linear incremental model:
$$v_{OUT} = ${ans}\\ \\text{V}$$`,
    };
  };

  // ================================================================ P2 style: the gain is given — find r_x and the operating point
  GENS.inverse_op = () => {
    const n = pick([2, 3, 4, 5]);
    const kind = pick(['sq', 'sq', 'cube', 'exp', 'series']);
    const V = { GM: [1e-4, 1e-2], VT: [0.1, 2], R1: [100, 1e4], VOUT: [0.1, 5], VX: [0.1, 5], IS: [1e-15, 1e-12] };
    const D = { GM: 'G_M', VT: 'V_T', R1: 'R_1', VOUT: 'V_{OUT}', VX: 'V_X', IS: 'I_S' };
    const ex = (expr, names, lbl) => ({ lbl, expr, vars: Object.fromEntries(names.map((k) => [k, V[k]])), disp: D });
    const gain = `A_v = \\dfrac{v_{out}}{v_{in}} = \\dfrac{1}{${n}}`;
    if (kind === 'sq') {
      const vin = (n - 1) * (n + 1) / 2;
      return {
        q: md`Consider the circuit shown below that uses a **two terminal** nonlinear element $X$ whose current $i_X$ is related to the voltage $v_X$ across it by $i_X = \dfrac{G_Mv_X^2}{2V_T}$, where $G_M$ and $V_T$ are known constants. If the incremental gain of the circuit is `.concat(`$${gain}$, (a) find an expression for the incremental resistance $r_x = v_x/i_x$ of $X$ in terms of $G_M$, $V_T$ and the DC voltage $V_{OUT}$; (b) compute the DC operating point voltages $V_{OUT}$ and $V_{IN}$ in terms of $G_M$, $V_T$ and $R_1$.`),
        fig: FIGS.shuntX(),
        parts: [ex('VT/(GM*VOUT)', ['GM', 'VT', 'VOUT'], 'r_x'), ex(`${n - 1}*VT/(GM*R1)`, ['GM', 'VT', 'R1'], 'V_{OUT}'), ex(`${vin}*VT/(GM*R1)`, ['GM', 'VT', 'R1'], 'V_{IN}')],
        hints: [md`$\dfrac{1}{r_x} = \dfrac{di_X}{dv_X}\Big|_Q = \dfrac{G_MV_X}{V_T}$, and $V_X = V_{OUT}$ here.`, md`Incremental model: $v_{in}$, $R_1$ and $r_x$ form a **divider**: $A_v = \dfrac{r_x}{R_1 + r_x}$. (Not $r_x/R_1$: that exact slip cost 10 points on the real exam.)`, md`Set that equal to $1/${n}$, solve for $r_x$ in terms of $R_1$, then for $V_{OUT}$. $V_{IN}$ comes from DC KVL: $V_{IN} = V_{OUT} + R_1i_X$.`],
        sol: `**(a)** $\\dfrac{di_X}{dv_X} = \\dfrac{G_MV_X}{V_T}$, so $r_x = \\dfrac{V_T}{G_MV_{OUT}}$ (since $V_X = V_{OUT}$).

**(b)** Incremental model: $V_{IN}$ shorted, $v_{in}$ in series with $R_1$, $X$ replaced by $r_x$. Divider: $\\dfrac{r_x}{R_1 + r_x} = \\dfrac{1}{${n}} \\Rightarrow r_x = \\dfrac{R_1}{${n - 1}}$.

So $\\dfrac{V_T}{G_MV_{OUT}} = \\dfrac{R_1}{${n - 1}} \\Rightarrow V_{OUT} = \\dfrac{${n - 1}V_T}{G_MR_1}$.

DC KVL: $V_{IN} = V_{OUT} + R_1\\dfrac{G_MV_{OUT}^2}{2V_T} = V_{OUT}\\left(1 + \\tfrac{${n - 1}}{2}\\right) = \\dfrac{${f(vin)}V_T}{G_MR_1}$.`,
      };
    }
    if (kind === 'cube') {
      const m = (n + 2) / 3;
      return {
        q: `A two terminal nonlinear element $X$ obeys $i_X = \\dfrac{G_Mv_X^3}{3V_T^2}$ and is connected as shown. The incremental gain is $${gain}$. (a) Find $r_x$ in terms of $G_M$, $V_T$ and $V_{OUT}$. (b) Find $V_{OUT}$ and $V_{IN}$ in terms of $G_M$, $V_T$ and $R_1$.`,
        fig: FIGS.shuntX(),
        parts: [ex('VT^2/(GM*VOUT^2)', ['GM', 'VT', 'VOUT'], 'r_x'), ex(`VT*sqrt(${n - 1}/(GM*R1))`, ['GM', 'VT', 'R1'], 'V_{OUT}'), ex(`${f(m, 6)}*VT*sqrt(${n - 1}/(GM*R1))`, ['GM', 'VT', 'R1'], 'V_{IN}')],
        hints: [md`$\dfrac{di_X}{dv_X} = \dfrac{G_Mv_X^2}{V_T^2}$ at $v_X = V_{OUT}$.`, md`Divider: $\dfrac{r_x}{R_1+r_x} = \dfrac{1}{${n}}$, so $r_x = R_1/${n - 1}$.`],
        sol: `**(a)** $r_x = \\dfrac{V_T^2}{G_MV_{OUT}^2}$.

**(b)** $r_x = \\dfrac{R_1}{${n - 1}} \\Rightarrow V_{OUT}^2 = \\dfrac{${n - 1}V_T^2}{G_MR_1} \\Rightarrow V_{OUT} = V_T\\sqrt{\\dfrac{${n - 1}}{G_MR_1}}$.

$V_{IN} = V_{OUT} + R_1\\dfrac{G_MV_{OUT}^3}{3V_T^2} = V_{OUT}\\left(1 + \\dfrac{${n - 1}}{3}\\right) = ${f(m, 4)}\\,V_T\\sqrt{\\dfrac{${n - 1}}{G_MR_1}}$.`,
      };
    }
    if (kind === 'exp') {
      return {
        q: `A two terminal element $X$ behaves like a diode: $i_X = I_Se^{v_X/V_T}$. It is connected as shown, and the incremental gain is $${gain}$. Find the DC current $I_X$ through $X$, the DC drop across $R_1$ ($V_{IN} - V_{OUT}$), and $V_{OUT}$, in terms of $V_T$, $R_1$ and $I_S$.`,
        fig: FIGS.shuntX(),
        parts: [ex(`${n - 1}*VT/R1`, ['VT', 'R1'], 'I_X'), ex(`${n - 1}*VT`, ['VT'], 'V_{IN}-V_{OUT}'), ex(`VT*ln(${n - 1}*VT/(IS*R1))`, ['VT', 'R1', 'IS'], 'V_{OUT}')],
        hints: [md`For an exponential element, $r_x = V_T/I_X$: it depends only on the DC current.`, md`Divider gives $r_x = R_1/${n - 1}$. Then $V_{OUT} = V_T\ln(I_X/I_S)$ (type ln).`],
        sol: `$r_x = \\dfrac{V_T}{I_X}$ and $\\dfrac{r_x}{R_1 + r_x} = \\dfrac{1}{${n}} \\Rightarrow r_x = \\dfrac{R_1}{${n - 1}}$, so $I_X = \\dfrac{${n - 1}V_T}{R_1}$.

Then $V_{IN} - V_{OUT} = R_1I_X = ${n - 1}V_T$, and $V_{OUT} = V_T\\ln\\dfrac{I_X}{I_S} = V_T\\ln\\dfrac{${n - 1}V_T}{I_SR_1}$.`,
      };
    }
    // series square-law element
    const den = 2 * (n - 1) * (n - 1);
    return {
      q: `This time the nonlinear element $X$ ($i_X = \\dfrac{G_Mv_X^2}{2V_T}$) sits **in series** between the source and the output, and $R_1$ goes from the output to ground. The incremental gain is $${gain}$. (a) Find $r_x$ in terms of $G_M$, $V_T$ and the DC voltage $V_X$ across $X$. (b) Find $V_{OUT}$ and $V_{IN}$ in terms of $G_M$, $V_T$ and $R_1$.`,
      fig: FIGS.seriesX(),
      parts: [ex('VT/(GM*VX)', ['GM', 'VT', 'VX'], 'r_x'), ex(`VT/(${den}*GM*R1)`, ['GM', 'VT', 'R1'], 'V_{OUT}'), ex(`${2 * n - 1}*VT/(${den}*GM*R1)`, ['GM', 'VT', 'R1'], 'V_{IN}')],
      hints: [md`Same derivative as before, but now evaluated at $V_X = V_{IN} - V_{OUT}$.`, md`The divider flips: $A_v = \dfrac{R_1}{R_1 + r_x}$, so $r_x = ${n - 1}R_1$.`, md`$V_{OUT} = R_1i_X$ and $V_{IN} = V_X + V_{OUT}$.`],
      sol: `**(a)** $r_x = \\dfrac{V_T}{G_MV_X}$.

**(b)** $\\dfrac{R_1}{R_1 + r_x} = \\dfrac{1}{${n}} \\Rightarrow r_x = ${n - 1}R_1 \\Rightarrow V_X = \\dfrac{V_T}{${n - 1}G_MR_1}$.

$V_{OUT} = R_1\\dfrac{G_MV_X^2}{2V_T} = \\dfrac{V_T}{${den}G_MR_1}$, and $V_{IN} = V_X + V_{OUT} = \\dfrac{${2 * n - 1}V_T}{${den}G_MR_1}$.`,
    };
  };

  // ================================================================ P3 style: stack fed by I1, PMOS mirror into R1 || I2
  GENS.stack_mirror_rmax = () => {
    const c = tryUntil(() => {
      const u = pick([100, 125, 200, 250]), vov = pick([0.2, 0.4]);
      const kn = 0.5 * 100e-6 * u, I1 = kn * vov * vov;
      const s1 = pick([1, 4, 0.25]), s2 = pick([1, 4, 0.25]), p3 = pick([0.5, 2, 8]), m = pick([0.5, 1, 2, 3]);
      const v1 = vov / Math.sqrt(s1), v2 = vov / Math.sqrt(s2), v3 = vov * Math.sqrt(2 / p3);
      const V1 = 1 + v1, V2 = V1 + 1 + v2, V3 = 5 - 1 - v3;
      const I4 = I1 * m, I2 = I4 * pick([0.25, 0.5, 0.75]), IR = I4 - I2, Rmax = (V3 + 1) / IR;
      return { u, vov, I1, s1, s2, p3, p4: p3 * m, m, v1, v2, v3, V1, V2, V3, I4, I2, IR, Rmax };
    }, (o) => o.V3 > o.V2 + 0.3 && clean(o.I1 * 1e3, 3) && clean(o.I2 * 1e3, 3) && clean(o.Rmax / 1000, 2) && o.v1 <= 0.8 && o.v2 <= 0.8);
    const mA = (i) => `${f(i * 1e3)}\\,\\text{mA}`;
    return {
      q: `Determine voltage $V_1$, $V_2$, $V_3$, the current in $M_4$, and the maximum value of resistor $R_1$ such that transistor $M_4$ remains in saturation when $I_1 = ${mA(c.I1)}$, $I_2 = ${mA(c.I2)}$, $1X = \\tfrac{${c.u}}{1}$, and $V_{DD} = 5\\,\\text{V}$.`,
      fig: FIGS.stackMirror({ s1: xs(c.s1), s2: xs(c.s2), s3: xs(c.p3), s4: xs(c.p4), i1s: mA(c.I1), i2s: mA(c.I2), vdd: 'V_{DD}' }),
      parts: [{ lbl: 'V_1', unit: 'V', ans: c.V1 }, { lbl: 'V_2', unit: 'V', ans: c.V2 }, { lbl: 'V_3', unit: 'V', ans: c.V3 }, { lbl: 'I_{M4}', unit: 'mA', ans: c.I4 * 1e3 }, { lbl: 'R_{1,max}', unit: 'kΩ', ans: c.Rmax / 1000 }],
      hints: [
        md`$I_1$ flows through the whole left column: $M_3$ above it and $M_2$, $M_1$ below. All three are diode-connected, so each is saturated and drops its own $V_{GS}$.`,
        md`Watch the PMOS: $\mu_pC_{ox}$ is half, so a PMOS needs twice the width for the same overdrive.`,
        md`$M_4$ has $M_3$'s $V_{SG}$: current scales by size. KCL at its drain: $I_{R_1} = I_{M4} - I_2$. PMOS saturation needs $V_D \le V_G + |V_T|$.`,
      ],
      sol: `$1X$: NMOS $\\tfrac12(100\\mu)(${c.u}) = ${f(0.05 * c.u)}\\,\\text{mA/V}^2$; PMOS $1X$ is half that.

**NMOS stack** ($${mA(c.I1)}$ each): $M_1$ (${xs(c.s1).replace('\\tfrac14', '¼')}): $V_{ov} = ${f(c.v1)}$, so $V_1 = ${f(c.V1)}\\,\\text{V}$. $M_2$ (${xs(c.s2).replace('\\tfrac14', '¼')}): $V_{ov} = ${f(c.v2)}$, so $V_2 = ${f(c.V1)} + ${f(1 + c.v2)} = ${f(c.V2)}\\,\\text{V}$.

**$M_3$** (${xs(c.p3).replace('\\tfrac12', '½')} PMOS): $V_{ov} = ${f(c.v3)}$, $V_{SG} = ${f(1 + c.v3)}$, so $V_3 = 5 - ${f(1 + c.v3)} = ${f(c.V3)}\\,\\text{V}$.

**$M_4$** (${f(c.m)}\\times$ the size of $M_3$, same $V_{SG}$): $I_{M4} = ${mA(c.I4)}$. KCL at its drain: $I_{R_1} = ${f(c.I4 * 1e3)} - ${f(c.I2 * 1e3)} = ${mA(c.IR)}$.

**Saturation:** $V_D = I_{R_1}R_1 \\le V_G + |V_T| = ${f(c.V3 + 1)}\\,\\text{V} \\Rightarrow R_{1,max} = \\dfrac{${f(c.V3 + 1)}}{${f(c.IR * 1e3)}\\,\\text{mA}} = ${kO(c.Rmax)}$.`,
    };
  };
})();

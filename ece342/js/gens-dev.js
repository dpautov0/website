/* gens-dev.js — randomized problems for diodes and MOSFET DC analysis.
   Course parameters: µnCox = 100 µA/V², µpCox = 50 µA/V², |VT| = 1 V, λ = 0, VT(thermal) = 25 mV. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick;
  const GENS = window.GENS, FIGS = window.FIGS;
  const { tryUntil, clean, kO, Vv, mA, k, pk } = window.GEN_HELPERS;
  const VT = 0.025, KN = 100e-6, KP = 50e-6, VTH = 1;
  const uA = (i) => `${f(i * 1e6)}\\,\\mu\\text{A}`;
  const cur = (i) => (Math.abs(i) < 1e-3 ? { unit: 'µA', ans: i * 1e6 } : { unit: 'mA', ans: i * 1e3 });
  const curTeX = (i) => (Math.abs(i) < 1e-3 ? uA(i) : mA(i));
  const xs = (m) => (m === 0.25 ? '\\tfrac14X' : m === 0.5 ? '\\tfrac12X' : `${m}X`);

  // ================================================================ figures
  FIGS.nbias = (o = {}) => [
    ['rail', [2, 0], { n: o.vdds }], ['R', [2, 0], [2, 1.2], { n: 'R_D', s: o.RDs }],
    ['iarr', [2, 0.6], 'd', { n: 'I_D', side: 'l', off: [-15, 0] }],
    ['w', [2, 1.2], [2.9, 1.2]], ['term', [2.9, 1.2], { n: 'V_D' }],
    ['nmos', [2, 2.2], { sz: o.wls }],
    ['R', [2, 3.2], [2, 4.4], { n: 'R_S', s: o.RSs }], ['gnd', [2, 4.4]],
    ['w', [2, 3.2], [2.9, 3.2]], ['term', [2.9, 3.2], { n: 'V_S' }],
    ['w', [1, 2.2], [0, 2.2], [0, 2.9]], ['V', [0, 2.9], [0, 3.9], { s: o.vgs, side: 'l' }], ['gnd', [0, 3.9]],
  ];
  FIGS.pbias = (o = {}) => [
    ['rail', [2, 0], { n: o.vdds }], ['R', [2, 0], [2, 1.2], { n: 'R_S', s: o.RSs }],
    ['iarr', [2, 0.6], 'd', { n: 'I_D', side: 'l', off: [-15, 0] }],
    ['w', [2, 1.2], [2.9, 1.2]], ['term', [2.9, 1.2], { n: 'V_S' }],
    ['pmos', [2, 2.2], { sz: o.wls }],
    ['R', [2, 3.2], [2, 4.4], { n: 'R_D', s: o.RDs }], ['gnd', [2, 4.4]],
    ['w', [2, 3.2], [2.9, 3.2]], ['term', [2.9, 3.2], { n: 'V_D' }],
    ['w', [1, 2.2], [0, 2.2], [0, 2.9]], ['V', [0, 2.9], [0, 3.9], { s: o.vgs, side: 'l' }], ['gnd', [0, 3.9]],
  ];
  // NMOS mirror: I_REF into diode-connected M1 (gate on right), M2 output into R_D.
  FIGS.nmirror = (o = {}) => {
    const fig = [
      ['w', [1, 0], [3, 0]], ['rail', [2, 0], { n: o.vdds || 'V_{DD}' }],
      ['I', [1, 0], [1, 1.5], { n: 'I_{REF}', s: o.irefs, side: 'l' }],
      ['nmos', [1, 2.5], { n: 'M_1', sz: o.s1, flip: true, dc: true }], ['gnd', [1, 3.5]],
      ['nmos', [3, 2.5], { n: 'M_2', sz: o.s2 }], ['gnd', [3, 3.5]],
    ];
    if (o.RD !== false) fig.push(['R', [3, 0], [3, 1.5], { n: 'R_D', s: o.RDs }], ['node', [3, 1.5], { n: o.out || 'V_{out}', side: 'r' }]);
    else fig.push(['w', [3, 1.5], [3, 1.1]], ['term', [3, 1.1], { n: 'I_{out}\\downarrow', side: 'r' }]);
    return fig;
  };
  // PMOS mirror: diode-connected M1 at top-left sinks I_REF to ground; M2 sources into R_D.
  FIGS.pmirror = (o = {}) => [
    ['w', [1, 0], [3, 0]], ['rail', [2, 0], { n: o.vdds || 'V_{DD}' }],
    ['pmos', [1, 1], { n: 'M_1', sz: o.s1, flip: true }], ['w', [2, 1], [2, 2], [1, 2]],
    ['I', [1, 2], [1, 3.5], { n: 'I_{REF}', s: o.irefs, side: 'l' }], ['gnd', [1, 3.5]],
    ['pmos', [3, 1], { n: 'M_2', sz: o.s2 }], ['R', [3, 2], [3, 3.5], { n: 'R_D', s: o.RDs }], ['gnd', [3, 3.5]],
    ['node', [3, 2], { n: 'V_{out}', side: 'r' }],
  ];

  // ================================================================ diodes
  GENS.rd = () => {
    const ID = pick([0.25, 0.5, 1, 2, 2.5, 5]) * 1e-3, n = pick([1, 1, 2, 3]);
    const r = n * VT / ID;
    return {
      fig: FIGS.dstring(n, 'I_{D0} = ' + mA(ID)),
      q: `${n > 1 ? `${n} identical diodes in series carry` : 'A diode carries'} a DC current $I_{D0} = ${mA(ID)}$ ($V_T = 25\\,\\text{mV}$, $n=1$). What incremental resistance does ${n > 1 ? 'the string' : 'it'} present to small signals?`,
      parts: [{ lbl: n > 1 ? 'r_{\\text{string}}' : 'r_d', unit: 'Ω', ans: r }],
      hints: ['$r_d = V_T/I_{D0}$ per diode.', n > 1 ? 'Series resistances add: the string is $n\\,r_d$.' : 'Only the DC current matters, not the signal.'],
      sol: `$r_d = \\dfrac{25\\,\\text{mV}}{${f(ID * 1e3)}\\,\\text{mA}} = ${f(VT / ID)}\\,\\Omega$${n > 1 ? ` per diode, so the string is $${n}\\times${f(VT / ID)} = ${f(r)}\\,\\Omega$` : ''}.`,
    };
  };

  GENS.decade = () => {
    const mode = pick(['dv', 'ratio']);
    if (mode === 'dv') {
      const ratio = pick([2, 4, 10, 100, 1000]);
      const dv = VT * Math.log(ratio) * 1e3;
      return {
      fig: FIGS.diode1('V_D', 'I_D'),
        q: `By how much must a diode's forward voltage increase to multiply its current by ${ratio}? Use the exponential model with $V_T = 25\\,\\text{mV}$.`,
        parts: [{ lbl: '\\Delta V_D', unit: 'mV', ans: dv, accept: [60 * Math.log10(ratio)] }],
        hints: ['$I_{D2}/I_{D1} = e^{\\Delta V/V_T}$, so $\\Delta V = V_T\\ln(I_{D2}/I_{D1})$.'],
        sol: `$\\Delta V = V_T\\ln ${ratio} = 25\\,\\text{mV}\\times${f(Math.log(ratio))} = ${f(dv)}\\,\\text{mV}$. The rule of thumb is $\\approx 60\\,\\text{mV}$ per decade ($2.3V_T$), so a factor of 10 costs only about $58$–$60\\,\\text{mV}$.`,
      };
    }
    const dv = pick([18, 25, 50, 60, 120]) * 1e-3;
    const ratio = Math.exp(dv / VT);
    return {
      fig: FIGS.diode1('V_D', 'I_D'),
      q: `A diode's forward voltage rises by $${f(dv * 1e3)}\\,\\text{mV}$. By what factor does its current increase? ($V_T = 25\\,\\text{mV}$)`,
      parts: [{ lbl: 'I_{D2}/I_{D1}', unit: '', ans: ratio }],
      hints: ['$I_{D2}/I_{D1} = e^{\\Delta V/V_T}$.'],
      sol: `$e^{${f(dv * 1e3)}/25} = e^{${f(dv / VT)}} = ${f(ratio)}$.`,
    };
  };

  GENS.diode_exp = () => {
    const IS = pick([1e-15, 1e-14, 6.9e-16]);
    if (Math.random() < 0.5) {
      const VD = pick([0.6, 0.65, 0.7, 0.72, 0.75]);
      const ID = IS * Math.exp(VD / VT);
      const c = cur(ID);
      return {
      fig: FIGS.diode1('V_D', 'I_D'),
        q: `A diode with $I_S = ${f(IS)}\\,\\text{A}$ has $V_D = ${f(VD)}\\,\\text{V}$ across it. Find $I_D$ ($V_T = 25\\,\\text{mV}$, $n=1$).`,
        parts: [{ lbl: 'I_D', unit: c.unit, ans: c.ans }],
        hints: ['$I_D = I_Se^{V_D/V_T}$ in forward bias (the $-1$ is negligible).'],
        sol: `$I_D = ${f(IS)}\\,e^{${f(VD)}/0.025} = ${f(IS)}\\,e^{${f(VD / VT)}} = ${curTeX(ID)}$.`,
      };
    }
    const ID = pick([0.1, 0.5, 1, 2, 5, 10]) * 1e-3;
    const VD = VT * Math.log(ID / IS);
    return {
      fig: FIGS.diode1('V_D', 'I_D'),
      q: `A diode with $I_S = ${f(IS)}\\,\\text{A}$ carries $I_D = ${mA(ID)}$. Find $V_D$ ($V_T = 25\\,\\text{mV}$).`,
      parts: [{ lbl: 'V_D', unit: 'V', ans: VD, tol: { rel: 0.005 } }],
      hints: ['$V_D = V_T\\ln(I_D/I_S)$.'],
      sol: `$V_D = 0.025\\ln\\dfrac{${f(ID)}}{${f(IS)}} = ${Vv(VD)}$. This is why a conducting diode almost always sits between 0.6 and 0.8 V.`,
    };
  };

  function diodeString(x, y0, n, gap = 0.9) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(['D', [x, y0 + i * gap], [x, y0 + (i + 1) * gap]]);
    return out;
  }

  GENS.cvd_series = () => {
    const n = pick([1, 2, 3]), Vs = pick([3, 5, 6, 9, 10]), R = pk([1, 2, 5]);
    const on = Vs > 0.7 * n;
    const ID = on ? (Vs - 0.7 * n) / R : 0;
    const fig = [
      ['V', [0, 0.6], [0, 1.6], { n: 'V_S', s: Vv(Vs), side: 'l' }], ['w', [0, 0.6], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R', s: kO(R) }], ...diodeString(2, 0, n), ['w', [2, 0.9 * n], [2, Math.max(2, 0.9 * n)]],
      ['w', [0, 1.6], [0, Math.max(2, 0.9 * n)], [2, Math.max(2, 0.9 * n)]], ['gnd', [0, Math.max(2, 0.9 * n)]],
      ['iarr', [2, 0.45], 'd', { n: 'I_D' }],
    ];
    return {
      q: `Using the constant-voltage-drop model ($V_{D0} = 0.7\\,\\text{V}$), find the diode current.`,
      fig, parts: [{ lbl: 'I_D', unit: 'mA', ans: ID * 1e3 }],
      hints: [`Assume all ${n} diode${n > 1 ? 's are' : ' is'} ON, so each drops 0.7 V. Then check the current comes out positive.`],
      sol: on
        ? `ON: the string drops $${n}\\times0.7 = ${f(0.7 * n)}\\,\\text{V}$. $I_D = \\dfrac{${f(Vs)} - ${f(0.7 * n)}}{${k(R)}} = ${mA(ID)} > 0$. Consistent.`
        : `Assuming ON would need $${f(0.7 * n)}\\,\\text{V}$ but only $${f(Vs)}\\,\\text{V}$ is available, giving negative current. So the string is **off**: $I_D = 0$.`,
    };
  };

  GENS.cvd_branch = () => {
    const c = tryUntil(() => {
      const n = pick([1, 2, 3]), Vs = pick([3, 4, 5, 6, 8]), R1 = pk([1, 2, 3]), R2 = pk([1, 2, 3, 4]);
      const Von = 0.7 * n;
      let ID = (Vs - Von) / R1 - Von / R2;
      const on = ID > 0;
      const V = on ? Von : Vs * R2 / (R1 + R2);
      if (!on) ID = 0;
      return { n, Vs, R1, R2, on, V, ID, IDtest: (Vs - Von) / R1 - Von / R2 };
    }, (o) => Math.abs(o.IDtest) > 0.1e-3 && clean(o.V, 3) && clean(o.ID * 1e3, 3));
    const fig = [
      ['V', [0, 0.6], [0, 1.6], { n: 'V_S', s: Vv(c.Vs), side: 'l' }], ['w', [0, 0.6], [0, 0]],
      ['R', [0, 0], [2, 0], { n: 'R_1', s: kO(c.R1) }], ['node', [2, 0], { n: 'V_X', side: 'a' }],
      ...diodeString(2, 0, c.n), ['w', [2, 0.9 * c.n], [2, 2.8]],
      ['w', [2, 0], [3.6, 0]], ['R', [3.6, 0], [3.6, 2.8], { n: 'R_2', s: kO(c.R2) }],
      ['w', [0, 1.6], [0, 2.8], [3.6, 2.8]], ['gnd', [0, 2.8]],
    ];
    return {
      q: 'Constant-voltage model, $V_{D0} = 0.7\\,\\text{V}$. Find $V_X$ and the current through the diode string. (Decide whether the string conducts.)',
      fig, parts: [{ lbl: 'V_X', unit: 'V', ans: c.V }, { lbl: 'I_D', unit: 'mA', ans: c.ID * 1e3 }],
      hints: [`Assume ON: $V_X = ${f(0.7 * c.n)}\\,\\text{V}$. Then KCL at $V_X$ gives the diode current as whatever is left over after $R_2$ takes its share.`, 'If that leftover is negative, the assumption failed. Remove the diodes and recompute $V_X$ as a divider.'],
      sol: c.on
        ? `Assume ON: $V_X = ${f(0.7 * c.n)}\\,\\text{V}$. $I_{R_1} = \\frac{${c.Vs}-${f(0.7 * c.n)}}{${k(c.R1)}} = ${mA((c.Vs - 0.7 * c.n) / c.R1)}$, $I_{R_2} = \\frac{${f(0.7 * c.n)}}{${k(c.R2)}} = ${mA(0.7 * c.n / c.R2)}$, so $I_D = ${mA(c.ID)} > 0$. Consistent.`
        : `Assume ON: KCL gives $I_D = ${mA(c.IDtest)} < 0$, which is impossible. So the string is **OFF**: $V_X = ${c.Vs}\\cdot\\frac{${k(c.R2)}}{${k(c.R1)}+${k(c.R2)}} = ${Vv(c.V)}$, $I_D = 0$. Check: $${f(c.V)} < ${f(0.7 * c.n)}\\,\\text{V}$, so the diodes are indeed below their turn-on voltage.`,
    };
  };

  GENS.iterate = () => {
    const Vs = pick([3, 5, 10]), R = pk([1, 2]), IS = pick([1e-15, 1e-14, 6.9e-16]);
    const I1 = (Vs - 0.7) / R, V1 = VT * Math.log(I1 / IS);
    let lo = 0, hi = Vs;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; ((Vs - m) / R - IS * Math.exp(m / VT) > 0) ? (lo = m) : (hi = m); }
    const VD = (lo + hi) / 2, ID = (Vs - VD) / R;
    return {
      fig: FIGS.vrd(Vv(Vs), kO(R)),
      q: `$V_S = ${Vs}\\,\\text{V}$ drives a diode ($I_S = ${f(IS)}\\,\\text{A}$) through $R = ${k(R)}\\kO$. Run the iterative method starting from $V_D = 0.7\\,\\text{V}$: give the diode voltage after the first update, and the converged current.`,
      parts: [{ lbl: 'V_D^{(1)}', unit: 'V', ans: V1, tol: { rel: 0.005 } }, { lbl: 'I_D', unit: 'mA', ans: ID * 1e3, tol: { rel: 0.005 } }],
      hints: ['Step 1: $I_D = (V_S - 0.7)/R$. Step 2: $V_D = V_T\\ln(I_D/I_S)$. Repeat until $V_D$ stops changing (2–3 rounds).'],
      sol: `Round 1: $I = \\frac{${Vs}-0.7}{${k(R)}} = ${mA(I1)}$, $V_D = 0.025\\ln\\frac{${f(I1)}}{${f(IS)}} = ${Vv(V1)}$.\n\nRound 2: $I = \\frac{${Vs}-${f(V1)}}{${k(R)}} = ${mA((Vs - V1) / R)}$, and so on. It converges to $V_D = ${Vv(VD)}$, $I_D = ${mA(ID)}$. The current barely moves because the diode voltage barely moves.`,
    };
  };

  GENS.diode_ss = () => {
    const n = pick([1, 2]), R = pk([1, 2, 4]);
    const c = tryUntil(() => { const Vs = pick([2, 3, 4, 5, 6, 8]) + (n === 2 ? 0.4 : 0.7); return { Vs, ID: (Vs - 0.7 * n) / R }; }, (o) => o.ID > 0 && clean(o.ID * 1e3, 3));
    const rd = VT / c.ID, rt = n * rd, vs = pick([5, 10, 20]) * 1e-3;
    const vo = vs * rt / (R + rt);
    const fig = [
      ['Vac', [0, 0], [0, 1], { n: 'v_s', side: 'l' }], ['V', [0, 1], [0, 2], { n: 'V_S', s: Vv(c.Vs), side: 'l' }], ['gnd', [0, 2]],
      ['w', [0, 0], [0, -0.4], [0.4, -0.4]], ['R', [0.4, -0.4], [2.2, -0.4], { n: 'R', s: kO(R) }],
      ...diodeString(2.2, -0.4, n, 1.2 * (2.4 / (1.2 * n)) / 1), ['w', [2.2, -0.4 + 2.4], [2.2, 2]], ['gnd', [2.2, 2]],
      ['w', [2.2, -0.4], [3, -0.4]], ['term', [3, -0.4], { n: 'v_o' }],
    ];
    return {
      q: `A small signal $v_s = ${f(vs * 1e3)}\\,\\text{mV}$ (amplitude) rides on $V_S = ${f(c.Vs)}\\,\\text{V}$. Using CVD ($0.7\\,\\text{V}$) for the DC pass and $V_T = 25\\,\\text{mV}$, find $I_{D0}$, the incremental resistance of the diode${n > 1 ? ' string' : ''}, and the small-signal amplitude $v_o$ across it.`,
      fig, parts: [{ lbl: 'I_{D0}', unit: 'mA', ans: c.ID * 1e3 }, { lbl: n > 1 ? 'r_{\\text{string}}' : 'r_d', unit: 'Ω', ans: rt }, { lbl: 'v_o', unit: 'mV', ans: vo * 1e3 }],
      hints: ['DC pass: $v_s = 0$, diodes are 0.7 V each.', '$r_d = V_T/I_{D0}$ per diode.', 'Small-signal circuit: $V_S$ shorted, diodes replaced by $r_d$. $v_o$ comes from a divider between $R$ and the string.'],
      sol: `**DC:** $I_{D0} = \\frac{${f(c.Vs)} - ${f(0.7 * n)}}{${k(R)}} = ${mA(c.ID)}$.\n\n**Linearise:** $r_d = 25/${f(c.ID * 1e3)} = ${f(rd)}\\,\\Omega$${n > 1 ? `, string $= ${f(rt)}\\,\\Omega$` : ''}.\n\n**Small signal:** $v_o = ${f(vs * 1e3)}\\,\\text{mV}\\cdot\\dfrac{${f(rt)}}{${f(R)} + ${f(rt)}} = ${f(vo * 1e3)}\\,\\text{mV}$. The diode strongly attenuates the signal because $r_d \\ll R$.`,
    };
  };

  GENS.diode_isrc = () => {
    const c = tryUntil(() => {
      const VIN = pick([3, 4, 5, 6]), R1 = pick([100, 200, 300, 400, 500, 600]), n = 2;
      const IIN = (VIN - 1.4) / R1, IOUT = pick([1, 2, 3, 4, 5]) * 1e-3, ID = IIN - IOUT;
      return { VIN, R1, IIN, IOUT, ID };
    }, (o) => o.ID > 0.2e-3 && clean(o.IIN * 1e3, 3) && clean(o.ID * 1e3, 3));
    const rt = 2 * VT / c.ID;
    const a = rt / (c.R1 + rt), rp = c.R1 * rt / (c.R1 + rt);
    const fig = [
      ['Vac', [0, 0.4], [0, 1.4], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.4], [0, 2.4], { n: 'V_{IN}', s: Vv(c.VIN), side: 'l' }], ['gnd', [0, 2.4]],
      ['w', [0, 0.4], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R_1', s: kO(c.R1) }], ['iarr', [1.2, 0], 'r', { n: 'I_{IN}', off: [0, 13], side: 'b' }],
      ...diodeString(1.8, 0.35, 2, 0.9), ['w', [1.8, 0], [1.8, 0.35]], ['w', [1.8, 2.15], [1.8, 2.4]], ['gnd', [1.8, 2.4]],
      ['w', [1.8, 0], [3, 0]], ['I', [3, 0.6], [3, 1.8], { n: 'I_{OUT}', s: mA(c.IOUT) }], ['w', [3, 0], [3, 0.6]], ['w', [3, 1.8], [3, 2.4]], ['gnd', [3, 2.4]],
      ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'V_{OUT}+v_{out}' }],
    ];
    return {
      q: `CVD model ($0.7\\,\\text{V}$), $V_T = 25\\,\\text{mV}$. (i) Find $I_{IN}$ and the diode current. (ii) Find $v_{out}$ for a small $v_{in} = 1\\,\\text{mV}$ (the current source is an ideal DC source).`,
      fig, parts: [{ lbl: 'I_{IN}', unit: 'mA', ans: c.IIN * 1e3 }, { lbl: 'I_{D0}', unit: 'mA', ans: c.ID * 1e3 }, { lbl: 'v_{out}', unit: 'µV', ans: 1e-3 * a * 1e6 }],
      hints: ['DC: the two diodes clamp $V_{OUT} = 1.4\\,\\text{V}$. $I_{IN} = (V_{IN} - 1.4)/R_1$, and the diodes get $I_{IN} - I_{OUT}$.', 'Small signal: the DC current source becomes an **open**. Then $v_{out}$ comes from a divider between $R_1$ and $2r_d$.'],
      sol: `**DC:** $V_{OUT} = 1.4\\,\\text{V}$, $I_{IN} = \\frac{${c.VIN} - 1.4}{${f(c.R1)}} = ${mA(c.IIN)}$, $I_{D0} = ${f(c.IIN * 1e3)} - ${f(c.IOUT * 1e3)} = ${mA(c.ID)}$.\n\n**Small signal:** $2r_d = \\frac{2(25\\,\\text{mV})}{${f(c.ID * 1e3)}\\,\\text{mA}} = ${f(rt)}\\,\\Omega$. $v_{out} = 1\\,\\text{mV}\\cdot\\frac{${f(rt)}}{${f(c.R1)}+${f(rt)}} = ${f(a * 1e3)}\\,\\mu\\text{V}$.\n\n(If instead a small $i_{out}$ were pulled from the output, $v_{out} = -i_{out}(R_1\\pl 2r_d) = -i_{out}\\cdot${f(rp)}\\,\\Omega$.)`,
    };
  };

  // ================================================================ MOSFETs
  GENS.mos_region = () => {
    const pm = Math.random() < 0.4;
    const reg = pick(['cut', 'tri', 'sat', 'sat']);
    let VG, VS, VD;
    if (!pm) {
      VS = pick([0, 0, 0.5, 1]);
      if (reg === 'cut') { VG = VS + pick([0.2, 0.5, 0.8]); VD = pick([1, 2, 3, 5]); }
      else {
        const vov = pick([0.2, 0.4, 0.5, 1, 1.5]); VG = VS + 1 + vov;
        VD = reg === 'sat' ? VS + vov + pick([0, 0.3, 1, 2]) : VS + vov * pick([0.2, 0.5, 0.8]);
      }
    } else {
      VS = pick([5, 5, 3.3, 3]);
      if (reg === 'cut') { VG = VS - pick([0.2, 0.5, 0.8]); VD = pick([0, 1, 2]); }
      else {
        const vov = pick([0.2, 0.4, 0.5, 1]); VG = VS - 1 - vov;
        VD = reg === 'sat' ? VS - vov - pick([0, 0.3, 1, 2]) : VS - vov * pick([0.2, 0.5, 0.8]);
      }
    }
    const opts = ['Cut-off', 'Triode (linear)', 'Saturation'];
    const a = { cut: 0, tri: 1, sat: 2 }[reg];
    const vgs = pm ? VS - VG : VG - VS;
    const why = pm
      ? `$V_{SG} = ${f(VS)} - ${f(VG)} = ${f(vgs)}\\,\\text{V}$ ${vgs < 1 ? '$<|V_T|$ so it is **off**.' : `$\\Rightarrow V_{ov} = ${f(vgs - 1)}\\,\\text{V}$. Saturation needs $V_D \\le V_G + |V_T| = ${f(VG + 1)}\\,\\text{V}$; here $V_D = ${f(VD)}\\,\\text{V}$, so **${reg === 'sat' ? 'saturation' : 'triode'}**.`}`
      : `$V_{GS} = ${f(VG)} - ${f(VS)} = ${f(vgs)}\\,\\text{V}$ ${vgs < 1 ? '$<V_T$ so it is **off**.' : `$\\Rightarrow V_{ov} = ${f(vgs - 1)}\\,\\text{V}$. Saturation needs $V_D \\ge V_G - V_T = ${f(VG - 1)}\\,\\text{V}$; here $V_D = ${f(VD)}\\,\\text{V}$, so **${reg === 'sat' ? 'saturation' : 'triode'}**.`}`;
    return {
      fig: FIGS.mosNodes(pm, f(VG), f(VS), f(VD)),
      q: `An ${pm ? '**PMOS**' : '**NMOS**'} transistor ($|V_T| = 1\\,\\text{V}$) has $V_G = ${f(VG)}\\,\\text{V}$, $V_S = ${f(VS)}\\,\\text{V}$, $V_D = ${f(VD)}\\,\\text{V}$. Which region is it in?`,
      parts: [{ mc: opts, a }],
      hints: [pm ? 'First check $V_{SG}$ against $|V_T|$. Then use the shortcut: saturation iff $V_D \\le V_G + |V_T|$.' : 'First check $V_{GS}$ against $V_T$. Then use the shortcut: saturation iff $V_D \\ge V_G - V_T$.'],
      sol: why,
    };
  };

  GENS.mos_id = () => {
    const pm = Math.random() < 0.3;
    const WL = pick([10, 20, 25, 40, 50, 100, 125, 200]), vov = pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1]);
    const kp = pm ? KP : KN;
    const ID = 0.5 * kp * WL * vov * vov;
    const c = cur(ID);
    const vg = 1 + vov;
    return {
      fig: FIGS.mosBias(pm, `${f(vg)}\\,\\text{V}`, `W/L=${WL}`),
      q: `An ${pm ? 'PMOS' : 'NMOS'} with $W/L = ${WL}$ ($\\mu_${pm ? 'p' : 'n'}C_{ox} = ${pm ? 50 : 100}\\,\\mu\\text{A/V}^2$, $|V_T| = 1\\,\\text{V}$) has $V_{${pm ? 'SG' : 'GS'}} = ${f(vg)}\\,\\text{V}$ and is in saturation. Find $I_D$.`,
      parts: [{ lbl: 'I_D', unit: c.unit, ans: c.ans }],
      hints: ['$I_D = \\tfrac12\\mu C_{ox}\\tfrac{W}{L}V_{ov}^2$ with $V_{ov} = |V_{GS}| - |V_T|$.'],
      sol: `$V_{ov} = ${f(vg)} - 1 = ${f(vov)}\\,\\text{V}$. $I_D = \\tfrac12(${pm ? 50 : 100}\\,\\mu)(${WL})(${f(vov)})^2 = ${curTeX(ID)}$.`,
    };
  };

  GENS.mos_vgs = () => {
    const WL = pick([25, 50, 100, 125, 200, 250, 400, 500]), vov = pick([0.1, 0.2, 0.3, 0.4, 0.5]);
    const ID = 0.5 * KN * WL * vov * vov;
    return {
      fig: FIGS.mosBias(false, '?', `W/L=${WL}`, `I_D = ${curTeX(ID)}`),
      q: `An NMOS ($W/L = ${WL}$, $\\mu_nC_{ox} = 100\\,\\mu\\text{A/V}^2$, $V_T = 1\\,\\text{V}$) carries $I_D = ${curTeX(ID)}$ in saturation. Find $V_{GS}$.`,
      parts: [{ lbl: 'V_{GS}', unit: 'V', ans: 1 + vov }],
      hints: ['Invert the square law: $V_{ov} = \\sqrt{2I_D/(\\mu_nC_{ox}W/L)}$, then add $V_T$.'],
      sol: `$\\tfrac12\\mu_nC_{ox}\\tfrac{W}{L} = ${f(0.5 * KN * WL * 1e3)}\\,\\text{mA/V}^2$. $V_{ov}^2 = \\dfrac{${f(ID * 1e3)}}{${f(0.5 * KN * WL * 1e3)}} = ${f(vov * vov)}\\Rightarrow V_{ov} = ${f(vov)}\\,\\text{V}$, $V_{GS} = ${f(1 + vov)}\\,\\text{V}$.`,
    };
  };

  function nbiasCase() {
    return tryUntil(() => {
      const WL = pick([50, 100, 125, 200, 250, 400, 500]), vov = pick([0.2, 0.3, 0.4, 0.5]);
      const ID = 0.5 * KN * WL * vov * vov, RS = pick([100, 200, 250, 400, 500, 1000]);
      const VS = ID * RS, VG = 1 + vov + VS;
      const RD = pick([250, 500, 750, 1000, 1250, 1500, 2000]), VDD = pick([2, 3, 5]);
      const VD = VDD - ID * RD;
      return { WL, vov, ID, RS, VS, VG, RD, VDD, VD, RDmax: (VDD - (VG - 1)) / ID };
    }, (o) => clean(o.VG, 2) && clean(o.ID * 1e3, 3) && o.VS <= 1.5 && o.VD >= o.VG - 1 + 0.05 && o.VD < o.VDD);
  }

  GENS.mos_rs_bias = () => {
    const c = nbiasCase();
    const kq = 0.5 * KN * c.WL;
    // quadratic in ID: kq*RS^2 ID^2 - (2 kq RS (VG-1) + 1) ID + kq (VG-1)^2 = 0
    const a = kq * c.RS * c.RS, b = -(2 * kq * c.RS * (c.VG - 1) + 1), cc = kq * (c.VG - 1) ** 2;
    const disc = Math.sqrt(b * b - 4 * a * cc);
    const r1 = (-b - disc) / (2 * a), r2 = (-b + disc) / (2 * a);
    const fig = FIGS.nbias({ vdds: Vv(c.VDD), RDs: kO(c.RD), RSs: kO(c.RS), wls: `W/L=${c.WL}`, vgs: Vv(c.VG) });
    return {
      q: `NMOS: $\\mu_nC_{ox} = 100\\,\\mu\\text{A/V}^2$, $V_T = 1\\,\\text{V}$, $W/L = ${c.WL}$. Find $I_D$, $V_S$, $V_D$, and the largest $R_D$ that keeps the device in saturation.`,
      fig,
      parts: [{ lbl: 'I_D', unit: 'mA', ans: c.ID * 1e3 }, { lbl: 'V_S', unit: 'V', ans: c.VS }, { lbl: 'V_D', unit: 'V', ans: c.VD }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: c.RDmax / 1000 }],
      hints: [
        'Assume saturation. The gate is fixed but the source rises with current: $V_{GS} = V_G - I_DR_S$.',
        'Substitute into $I_D = \\tfrac12k\\tfrac{W}{L}(V_{GS}-1)^2$ to get a quadratic in $I_D$. One root gives $V_{GS} < V_T$. Reject it.',
        'Saturation shortcut: $V_D \\ge V_G - V_T$. That bounds $R_D$ directly.',
      ],
      sol: `$\\tfrac12\\mu_nC_{ox}\\tfrac{W}{L} = ${f(kq * 1e3)}\\,\\text{mA/V}^2$ and $V_{GS} = ${f(c.VG)} - ${f(c.RS)}I_D$:\n\n$$I_D = ${f(kq * 1e3)}\\text{m}\\,(${f(c.VG - 1)} - ${f(c.RS)}I_D)^2$$\n\nRoots: $I_D = ${mA(r1)}$ or $${mA(r2)}$. The larger one makes $V_{GS} = ${f(c.VG)} - ${f(r2 * c.RS)} < V_T$, so reject it.\n\n$I_D = ${mA(c.ID)}$, $V_S = ${Vv(c.VS)}$, $V_D = ${c.VDD} - ${f(c.ID * c.RD)} = ${Vv(c.VD)}$. Check: $V_{DS} = ${f(c.VD - c.VS)} \\ge V_{ov} = ${f(c.vov)}$. Saturated.\n\n**$R_{D,max}$:** $V_D \\ge V_G - V_T = ${f(c.VG - 1)}\\,\\text{V}$ $\\Rightarrow$ $R_{D,max} = \\dfrac{${c.VDD} - ${f(c.VG - 1)}}{${f(c.ID * 1e3)}\\,\\text{mA}} = ${kO(c.RDmax)}$.`,
    };
  };

  GENS.pmos_rs_bias = () => {
    const c = tryUntil(() => {
      const WL = pick([100, 125, 200, 250, 400, 500]), vov = pick([0.2, 0.4, 0.5, 0.8]);
      const ID = 0.5 * KP * WL * vov * vov, RS = pick([100, 200, 250, 500]), VDD = pick([3, 5]);
      const VS = VDD - ID * RS, VG = VS - 1 - vov, RD = pick([250, 500, 750, 1000]);
      const VD = ID * RD;
      return { WL, vov, ID, RS, VDD, VS, VG, RD, VD, RDmax: (VG + 1) / ID };
    }, (o) => o.VG >= 0.2 && clean(o.VG, 2) && clean(o.ID * 1e3, 3) && o.VD <= o.VG + 1 - 0.05);
    const fig = FIGS.pbias({ vdds: Vv(c.VDD), RDs: kO(c.RD), RSs: kO(c.RS), wls: `W/L=${c.WL}`, vgs: Vv(c.VG) });
    return {
      q: `PMOS: $\\mu_pC_{ox} = 50\\,\\mu\\text{A/V}^2$, $|V_T| = 1\\,\\text{V}$, $W/L = ${c.WL}$. Find $I_D$, $V_S$, $V_D$ and $R_{D,max}$ for saturation.`,
      fig,
      parts: [{ lbl: 'I_D', unit: 'mA', ans: c.ID * 1e3 }, { lbl: 'V_S', unit: 'V', ans: c.VS }, { lbl: 'V_D', unit: 'V', ans: c.VD }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: c.RDmax / 1000 }],
      hints: ['Work in magnitudes: $V_{SG} = V_S - V_G = (V_{DD} - I_DR_S) - V_G$.', 'PMOS saturation shortcut: $V_D \\le V_G + |V_T|$.'],
      sol: `$\\tfrac12\\mu_pC_{ox}\\tfrac{W}{L} = ${f(0.5 * KP * c.WL * 1e3)}\\,\\text{mA/V}^2$, $V_{SG} = ${f(c.VDD - c.VG)} - ${f(c.RS)}I_D$. Solving the quadratic and rejecting the root with $V_{SG} < 1$: $I_D = ${mA(c.ID)}$.\n\n$V_S = ${c.VDD} - ${f(c.ID * c.RS)} = ${Vv(c.VS)}$, $V_D = I_DR_D = ${Vv(c.VD)}$. Check: $V_{SD} = ${f(c.VS - c.VD)} \\ge V_{ov} = ${f(c.vov)}$.\n\n**$R_{D,max}$:** $V_D \\le V_G + 1 = ${f(c.VG + 1)}\\,\\text{V}$ $\\Rightarrow$ $R_{D,max} = ${f(c.VG + 1)}/${f(c.ID * 1e3)}\\,\\text{mA} = ${kO(c.RDmax)}$.`,
    };
  };

  GENS.diode_conn = () => {
    const pm = Math.random() < 0.35;
    const WL = pick([25, 50, 100, 125, 200, 400]), vov = pick([0.1, 0.2, 0.4, 0.5]);
    const I = 0.5 * (pm ? KP : KN) * WL * vov * vov;
    return {
      q: `A current source forces $${curTeX(I)}$ through a **diode-connected** ${pm ? 'PMOS' : 'NMOS'} (gate tied to drain), $W/L = ${WL}$. Find $V_{${pm ? 'SG' : 'GS'}}$.`,
      fig: pm
        ? [['rail', [1, 0], { n: 'V_{DD}' }], ['pmos', [1, 1], { flip: true }], ['w', [2, 1], [2, 2], [1, 2]], ['I', [1, 2], [1, 3.4], { s: curTeX(I), side: 'l' }], ['gnd', [1, 3.4]]]
        : [['rail', [1, 0], { n: 'V_{DD}' }], ['I', [1, 0], [1, 1.4], { s: curTeX(I), side: 'l' }], ['nmos', [1, 2.4], { flip: true, dc: true }], ['gnd', [1, 3.4]]],
      parts: [{ lbl: `V_{${pm ? 'SG' : 'GS'}}`, unit: 'V', ans: 1 + vov }],
      hints: ['Gate tied to drain means $V_{DS} = V_{GS} \\ge V_{ov}$. A diode-connected transistor that conducts is **always** saturated.', 'So just invert the saturation law.'],
      sol: `Saturated automatically. $V_{ov} = \\sqrt{\\dfrac{2(${f(I * 1e3)}\\,\\text{m})}{(${pm ? 50 : 100}\\,\\mu)(${WL})}} = ${f(vov)}\\,\\text{V}$, so $V_{${pm ? 'SG' : 'GS'}} = ${f(1 + vov)}\\,\\text{V}$.`,
    };
  };

  GENS.mirror_ratio = () => {
    const pm = Math.random() < 0.35;
    const sz = [0.25, 0.5, 1, 2, 3, 4, 6, 8];
    const s1 = pick([1, 2, 4]), s2 = pick(sz.filter((x) => x !== s1));
    const Iref = pick([50, 100, 200, 400]) * 1e-6;
    const Iout = Iref * s2 / s1;
    const fig = pm ? FIGS.pmirror({ s1: xs(s1), s2: xs(s2), irefs: uA(Iref) }) : FIGS.nmirror({ s1: xs(s1), s2: xs(s2), irefs: uA(Iref), RD: false });
    const c = cur(Iout);
    return {
      q: `${pm ? 'PMOS' : 'NMOS'} current mirror. $M_1$ is ${xs(s1).replace(/\\tfrac14/, '¼').replace(/\\tfrac12/, '½')}-sized and $M_2$ is ${xs(s2).replace(/\\tfrac14/, '¼').replace(/\\tfrac12/, '½')}-sized. With $M_2$ in saturation, what current does it carry?`,
      fig, parts: [{ lbl: 'I_{out}', unit: c.unit, ans: c.ans }],
      hints: ['$M_1$ and $M_2$ share the same gate and source voltages, so they have the same $V_{GS}$.', 'Same $V_{GS}$ ⇒ current scales with $W/L$.'],
      sol: `Same $V_{GS}$ ⇒ $\\dfrac{I_{out}}{I_{REF}} = \\dfrac{(W/L)_2}{(W/L)_1} = \\dfrac{${s2}}{${s1}}$, so $I_{out} = ${uA(Iref)}\\times${f(s2 / s1)} = ${curTeX(Iout)}$. Nothing about $V_{DD}$ or the load matters, as long as $M_2$ stays saturated.`,
    };
  };

  GENS.stack_vov = () => {
    const unit = pick([100, 125, 200, 500]), vov1 = pick([0.2, 0.4]);
    const I = 0.5 * KN * unit * vov1 * vov1;
    const sizes = U.shuffle([0.25, 1, 4]).slice(0, pick([2, 3]));
    const n = sizes.length;
    const vovs = sizes.map((m) => vov1 / Math.sqrt(m));
    const vgs = vovs.map((v) => 1 + v);
    // node voltages from the bottom: device 0 is at the bottom
    const nodes = []; let acc = 0;
    for (let i = 0; i < n; i++) { acc += vgs[i]; nodes.push(acc); }
    const fig = [['rail', [1, -0.2], { n: 'V_{DD}' }], ['I', [1, -0.2], [1, 1], { s: curTeX(I), side: 'l' }]];
    for (let i = 0; i < n; i++) {
      const y = 2 + (n - 1 - i) * 2;          // device i centre (bottom device lowest)
      fig.push(['nmos', [1, y], { flip: true, dc: true, sz: xs(sizes[i]) }]);
    }
    fig.push(['gnd', [1, 2 + (n - 1) * 2 + 1]]);
    const labels = ['V_1', 'V_2', 'V_3'];
    for (let i = 0; i < n; i++) fig.push(['node', [1, 2 + (n - 1 - i) * 2 - 1], { n: labels[i], side: 'l' }]);
    return {
      q: `$1X = ${unit}/1$. A current source pushes $${curTeX(I)}$ down through a stack of diode-connected NMOS. Find the node voltages, bottom-up (${labels.slice(0, n).map((x) => `$${x}$`).join(', ')}).`,
      fig, parts: labels.slice(0, n).map((l, i) => ({ lbl: l, unit: 'V', ans: nodes[i] })),
      hints: [`The ${xs(1)} device carries $${curTeX(I)}$: find its $V_{ov}$ first.`, 'Same current through every device ⇒ $V_{ov} \\propto 1/\\sqrt{W/L}$: $4X$ halves it, $\\tfrac14X$ doubles it.', 'Each node is the one below it plus that device\'s $V_{GS} = 1 + V_{ov}$.'],
      sol: `For $1X$: $V_{ov} = \\sqrt{\\dfrac{2(${f(I * 1e3)}\\text{m})}{(100\\mu)(${unit})}} = ${f(vov1)}\\,\\text{V}$.\n\n${sizes.map((m, i) => `- ${xs(m)}: $V_{ov} = ${f(vovs[i])}$, $V_{GS} = ${f(vgs[i])}\\,\\text{V}$`).join('\n')}\n\nStacking from ground: ${labels.slice(0, n).map((l, i) => `$${l} = ${f(nodes[i])}\\,\\text{V}$`).join(', ')}.`,
    };
  };

  GENS.mirror_rmax = () => {
    const c = tryUntil(() => {
      const unit = pick([50, 100, 125, 200]), vov = pick([0.2, 0.4]);
      const s1 = pick([1, 2]), s2 = pick([1, 2, 4]);
      const Iref = 0.5 * KN * unit * s1 * vov * vov, Iout = Iref * s2 / s1, VDD = pick([3, 5]);
      return { unit, vov, s1, s2, Iref, Iout, VDD, Rmax: (VDD - vov) / Iout };
    }, (o) => clean(o.Iref * 1e3, 3) && clean(o.Rmax / 1000, 2));
    const fig = FIGS.nmirror({ s1: xs(c.s1), s2: xs(c.s2), irefs: curTeX(c.Iref), vdds: `${c.VDD}\\,\\text{V}` });
    return {
      q: `$1X = ${c.unit}/1$, $V_{DD} = ${c.VDD}\\,\\text{V}$. Find $M_1$'s $V_{GS}$, the mirrored current, and the largest $R_D$ that keeps $M_2$ saturated.`,
      fig, parts: [{ lbl: 'V_{GS1}', unit: 'V', ans: 1 + c.vov }, { lbl: 'I_{out}', unit: 'mA', ans: c.Iout * 1e3 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: c.Rmax / 1000 }],
      hints: ['$M_1$ is diode-connected: invert the square law for its $V_{GS}$.', 'Mirror ratio = size ratio.', 'Saturation of $M_2$: $V_D \\ge V_G - V_T = V_{ov}$.'],
      sol: `$M_1$: $V_{ov} = ${f(c.vov)}$, $V_{GS1} = ${f(1 + c.vov)}\\,\\text{V}$. $I_{out} = ${curTeX(c.Iref)}\\times\\frac{${c.s2}}{${c.s1}} = ${curTeX(c.Iout)}$.\n\n$M_2$ saturated needs $V_{D2} = V_{DD} - I_{out}R_D \\ge V_G - V_T = ${f(c.vov)}\\,\\text{V}$, so $R_{D,max} = \\dfrac{${c.VDD} - ${f(c.vov)}}{${f(c.Iout * 1e3)}\\,\\text{mA}} = ${kO(c.Rmax)}$.`,
    };
  };

  GENS.size_for_current = () => {
    const unit = pick([50, 100, 125, 200]), VG = pick([1.2, 1.4, 1.5, 2]), vov = VG - 1, mult = pick([0.25, 0.5, 1, 2, 4, 8]);
    const I = 0.5 * KN * unit * mult * vov * vov;
    return {
      fig: FIGS.mosBias(false, `${f(VG)}\\,\\text{V}`, '?X', `I = ${curTeX(I)}`),
      q: `An NMOS has its source grounded and its gate at $${f(VG)}\\,\\text{V}$. It must carry $${curTeX(I)}$ in saturation. With $1X = ${unit}/1$, how many $X$ wide must it be?`,
      parts: [{ lbl: 'W/L\\ \\text{in units of }X', unit: '', ans: mult }],
      hints: ['$V_{ov} = V_{GS} - 1$ is fixed by the gate. Solve the square law for $W/L$, then divide by the size of $1X$.'],
      sol: `$V_{ov} = ${f(vov)}\\,\\text{V}$. $\\dfrac{W}{L} = \\dfrac{2I}{\\mu_nC_{ox}V_{ov}^2} = \\dfrac{2(${f(I * 1e3)}\\text{m})}{(100\\mu)(${f(vov * vov)})} = ${f(unit * mult)}$, i.e. $${f(mult)}X$.`,
    };
  };

  GENS.gm_calc = () => {
    const WL = pick([50, 100, 200, 400]), vov = pick([0.1, 0.2, 0.4, 0.5]);
    const ID = 0.5 * KN * WL * vov * vov, gm = 2 * ID / vov;
    return {
      fig: FIGS.mosBias(false, null, `W/L=${WL}`, `I_D = ${curTeX(ID)}`),
      q: `An NMOS ($W/L = ${WL}$) is biased in saturation at $I_D = ${curTeX(ID)}$. Find its transconductance $g_m$.`,
      parts: [{ lbl: 'g_m', unit: 'mA/V', ans: gm * 1e3 }],
      hints: ['$g_m = \\partial I_D/\\partial V_{GS} = \\mu_nC_{ox}\\tfrac{W}{L}V_{ov} = 2I_D/V_{ov}$. Find $V_{ov}$ first.'],
      sol: `$V_{ov} = \\sqrt{2I_D/(\\mu_nC_{ox}W/L)} = ${f(vov)}\\,\\text{V}$, so $g_m = 2I_D/V_{ov} = ${f(gm * 1e3)}\\,\\text{mA/V}$.`,
    };
  };
})();

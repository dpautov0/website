/* gens-bk-a4.js — randomized drills for the book's Chapter 5 (several MOSFETs): mirrors (DC copy and small signal),
   gain chains with loading, two paths into one output, signal through mirrors, the folded cascode, the differential
   pair, and the DC bias of stacks. Every generated problem carries its random parameters in p._v, and every answer
   was checked against an independent nodal / Newton solve on hundreds of draws (scratchpad A4/genverify.py).
   Course parameters: mu_n C_ox = 100 uA/V^2, mu_p C_ox = 50 uA/V^2, V_TN = |V_TP| = 1 V. */
(function () {
  'use strict';
  const GENS = window.GENS;
  const f = U.fmt, pick = U.pick;
  const par = (...r) => 1 / r.reduce((s, x) => s + 1 / x, 0);
  const UN = 100e-6, UP = 50e-6, VT = 1;
  // ---------------------------------------------------------------- formatting
  const KO = (r) => `${f(r / 1e3, 4)}\\,\\text{k}\\Omega`;
  const RT = (r) => (r < 1e3 ? `${f(r, 4)}\\,\\Omega` : r < 1e6 ? KO(r) : `${f(r / 1e6, 4)}\\,\\text{M}\\Omega`);
  const MS = (g) => `${f(g * 1e3, 4)}\\,\\text{mS}`;
  const UA = (i) => `${f(i * 1e6, 4)}\\,\\mu\\text{A}`;
  const VV = (v) => `${f(v, 4)}\\,\\text{V}`;
  // a numeric answer box; traps closer than 3% to a right answer are dropped (a right answer must never hit a trap)
  const num = (lbl, unit, ans, o = {}) => {
    const p = { lbl, unit, ans };
    const good = [ans, ...(o.accept || [])];
    if (o.accept && o.accept.length) p.accept = o.accept.filter((a) => Math.abs(a - ans) > 0.012 * Math.abs(ans));
    const t = (o.traps || []).filter((x) => isFinite(x.v) && good.every((v) => Math.abs(x.v - v) > 0.03 * Math.abs(v)));
    if (t.length) p.traps = t;
    return p;
  };
  // a resistance box in a sensible unit (value in ohms)
  const res = (lbl, r, o = {}) => {
    const [unit, s] = r < 1e3 ? ['Ω', 1] : r < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6];
    return num(lbl, unit, r * s, { accept: (o.accept || []).map((a) => a * s), traps: (o.traps || []).map((x) => ({ v: x.v * s, msg: x.msg })) });
  };
  const T = {};          // formula functions, exposed for the independent check
  window.BK4 = { T, num, res, KO, RT, MS, UA, VV };

  // ---------------------------------------------------------------- figure pieces
  const vin = (x, y, n = 'v_{in}') => [['Vac', [x, y], [x, y + 1], { n, side: 'l' }], ['gnd', [x, y + 1]]];
  const nmirror = (o = {}) => [
    ['rail', [1, -0.6], { n: o.vdd ? `V_{DD} = ${o.vdd}\\,\\text{V}` : 'V_{DD}' }], ['I', [1, -0.6], [1, 0.6], { n: 'I_{REF}', s: o.iref || '', side: 'l' }], ['w', [1, 0.6], [1, 1]],
    ['nmos', [1, 2], { n: 'M_1', sz: o.s1, flip: true, dc: true }], ['gnd', [1, 3]],
    ['nmos', [3, 2], { n: 'M_2', sz: o.s2 }], ['gnd', [3, 3]],
    ...(o.rd ? [['rail', [3, -0.6]], ['R', [3, -0.6], [3, 1], { n: 'R_D' }], ['node', [3, 1], { n: 'V_D', side: 'r' }]]
      : [['w', [3, 1], [3, 0.2]], ['term', [3, 0.2], { n: o.look ? '\\downarrow R_{out}' : 'I_{out}\\downarrow', side: 'r' }]]),
  ];
  const pmirror = (o = {}) => [
    ['w', [1, -0.6], [3, -0.6]], ['rail', [2, -0.6], { n: o.vdd ? `V_{DD} = ${o.vdd}\\,\\text{V}` : 'V_{DD}' }],
    ['pmos', [1, 0.4], { n: 'M_1', sz: o.s1, flip: true, dc: true }], ['pmos', [3, 0.4], { n: 'M_2', sz: o.s2 }],
    ['w', [1, 1.4], [1, 1.8]], ['I', [1, 1.8], [1, 3], { n: 'I_{REF}', s: o.iref || '', side: 'l' }], ['gnd', [1, 3]],
    ...(o.rl ? [['w', [3, 1.4], [3, 1.8]], ['R', [3, 1.8], [3, 3], { n: 'R_L' }], ['gnd', [3, 3]], ['node', [3, 1.6], { n: 'V_D', side: 'r' }]]
      : [['w', [3, 1.4], [3, 2]], ['term', [3, 2], { n: o.look ? '\\uparrow R_{out}' : 'I_{out}\\downarrow', side: 'r' }]]),
  ];
  const cascMirror = () => [
    ['rail', [1, -1.6], { n: 'V_{DD}' }], ['I', [1, -1.6], [1, -0.4], { n: 'I_{REF}', side: 'l' }], ['w', [1, -0.4], [1, 0]],
    ['nmos', [1, 1], { n: 'M_3', flip: true, dc: true }], ['nmos', [1, 3], { n: 'M_1', flip: true, dc: true }], ['gnd', [1, 4]],
    ['nmos', [3, 1], { n: 'M_4' }], ['nmos', [3, 3], { n: 'M_2' }], ['gnd', [3, 4]],
    ['w', [3, 0], [3, -0.6]], ['term', [3, -0.6], { n: '\\downarrow R_{out}', side: 'r' }],
  ];
  window.BK4.fig = { vin, nmirror, pmirror, cascMirror };

  // ================================================================ 1. mirrors: DC copy by size
  // NMOS: R_D from V_DD to the copy's drain; PMOS: R_L from the copy's drain to ground.
  T.mirrorDC = (v) => {
    const mu = v.type === 'n' ? UN : UP;
    const vov = Math.sqrt(2 * v.iref / (mu * v.wl1));
    const iout = v.iref * v.wl2 / v.wl1;
    const vg = v.type === 'n' ? VT + vov : v.vdd - VT - vov;
    // edge: NMOS V_D = V_G - V_TN; PMOS V_D = V_G + |V_TP|
    const rmax = v.type === 'n' ? (v.vdd - (vg - VT)) / iout : (vg + VT) / iout;
    return { vov, vgs: VT + vov, iout, vg, rmax };
  };
  GENS.bk_mirror = () => {
    const type = pick(['n', 'n', 'p']);
    const mu = type === 'n' ? UN : UP;
    let wl1, vov, iref;
    for (let k = 0; k < 50; k++) {
      wl1 = pick(type === 'n' ? [10, 20, 25, 40, 50, 100] : [20, 40, 50, 80, 100, 200]);
      vov = pick([0.1, 0.2, 0.2, 0.3, 0.4]);
      iref = 0.5 * mu * wl1 * vov * vov;
      if (iref >= 9.9e-6 && iref <= 200.1e-6) break;
    }
    const N = pick([0.5, 2, 3, 4, 5]);
    const wl2 = wl1 * N;
    const vdd = pick([3, 3.3, 5, 5]);
    const v = { type, wl1, wl2, iref, vdd };
    const r = T.mirrorDC(v);
    const nm = type === 'n';
    const fig = nm ? nmirror({ vdd, rd: true }) : pmirror({ vdd, rl: true });
    const sz = (w) => `${f(w)}/1`;
    return {
      _v: v,
      fig,
      q: md`${nm ? 'An NMOS' : 'A PMOS'} current mirror. $I_{REF} = ${UA(iref)}$ flows ${nm ? 'into the diode-connected $M_1$' : 'out of the diode-connected $M_1$ (down to ground)'}; $(W/L)_1 = ${sz(wl1)}$, $(W/L)_2 = ${sz(wl2)}$, $V_{DD} = ${f(vdd)}\,\text{V}$. ${nm ? '$\\mu_nC_{ox} = 100\\,\\mu\\text{A/V}^2$, $V_{TN} = 1\\,\\text{V}$' : '$\\mu_pC_{ox} = 50\\,\\mu\\text{A/V}^2$, $|V_{TP}| = 1\\,\\text{V}$'}, ignore $\lambda$ for DC. Find ${nm ? '$V_{GS}$' : '$V_{SG}$'} of the mirror, the copied current $I_{out}$, and the largest ${nm ? '$R_D$' : '$R_L$'} that keeps $M_2$ in saturation.`,
      parts: [
        num(nm ? 'V_{GS}' : 'V_{SG}', 'V', r.vgs, { traps: [{ v: r.vov, msg: 'That is the overdrive. Add the threshold: $V_{GS} = V_{TN} + V_{ov}$.' }] }),
        num('I_{out}', 'µA', r.iout * 1e6, { traps: [{ v: iref * Math.sqrt(N) * 1e6, msg: 'The copy has the same $V_{ov}$, so the current scales with $W/L$ itself, not its square root.' }, { v: iref / N * 1e6, msg: 'Upside down: the wider device carries more current.' }, { v: iref * N * N * 1e6, msg: 'The ratio is $(W/L)_2/(W/L)_1$, not its square.' }] }),
        num(nm ? 'R_{D,max}' : 'R_{L,max}', 'kΩ', r.rmax * 1e-3, { traps: nm
          ? [{ v: (vdd - r.vg) / r.iout * 1e-3, msg: 'The edge is $V_D = V_G - V_{TN}$, one threshold **below** the gate, not $V_D = V_G$.' }, { v: vdd / r.iout * 1e-3, msg: 'The drain cannot go all the way to 0 V: it must stay at least $V_{ov}$ above ground.' }]
          : [{ v: r.vg / r.iout * 1e-3, msg: 'The PMOS edge is $V_D = V_G + |V_{TP}|$: the drain may sit one threshold **above** the gate.' }, { v: vdd / r.iout * 1e-3, msg: 'The drain cannot rise all the way to $V_{DD}$: it must stay at least $V_{ov}$ below it.' }] }),
      ],
      hints: [
        md`Diode: $I_{REF} = \tfrac12\mu C_{ox}(W/L)_1V_{ov}^2$, so $V_{ov} = \sqrt{2I_{REF}/(\mu C_{ox}(W/L)_1)}$.`,
        md`Same ${nm ? '$V_{GS}$' : '$V_{SG}$'}, same $V_{ov}$: $I_{out} = I_{REF}\,(W/L)_2/(W/L)_1$.`,
        nm ? md`NMOS saturation as node voltages: $V_D \ge V_G - V_{TN}$. Then $R_D = (V_{DD} - V_D)/I_{out}$.` : md`PMOS saturation as node voltages: $V_D \le V_G + |V_{TP}|$. Then $R_L = V_D/I_{out}$.`,
      ],
      sol: md`
1. **The diode sets the overdrive.** $V_{ov} = \sqrt{\dfrac{2I_{REF}}{\mu C_{ox}(W/L)_1}} = \sqrt{\dfrac{2(${f(iref * 1e6)}\,\mu\text{A})}{(${nm ? 100 : 50}\,\mu\text{A/V}^2)(${f(wl1)})}} = ${f(r.vov, 4)}\,\text{V}$, so ${nm ? '$V_{GS}$' : '$V_{SG}$'} $= 1 + ${f(r.vov, 4)} = ${VV(r.vgs)}$. ${nm ? `The shared gate sits at $V_G = ${VV(r.vg)}$.` : `The shared gate sits at $V_G = V_{DD} - V_{SG} = ${VV(r.vg)}$.`}
2. **The copy.** $M_2$ has the same ${nm ? '$V_{GS}$' : '$V_{SG}$'}, hence the same $V_{ov}$; its current scales with $W/L$: $I_{out} = ${UA(iref)}\times\dfrac{${f(wl2)}}{${f(wl1)}} = ${UA(r.iout)}$.
3. **The edge of saturation.** ${nm
    ? `NMOS: $V_D \\ge V_G - V_{TN} = ${f(r.vg, 4)} - 1 = ${VV(r.vg - VT)}$. A bigger $R_D$ drops more voltage and pulls the drain down, so the largest $R_D$ puts the drain exactly there: $R_{D,max} = \\dfrac{V_{DD} - V_D}{I_{out}} = \\dfrac{${f(vdd)} - ${f(r.vg - VT, 4)}}{${UA(r.iout)}} = ${KO(r.rmax)}$.`
    : `PMOS: $V_D \\le V_G + |V_{TP}| = ${f(r.vg, 4)} + 1 = ${VV(r.vg + VT)}$. A bigger $R_L$ lifts the drain, so the largest $R_L$ puts the drain exactly there: $R_{L,max} = \\dfrac{V_D}{I_{out}} = \\dfrac{${f(r.vg + VT, 4)}}{${UA(r.iout)}} = ${KO(r.rmax)}$.`}

**Check:** $M_2$'s own overdrive from its current is $\sqrt{2(${f(r.iout * 1e6, 4)}\,\mu\text{A})/((${nm ? 100 : 50}\,\mu\text{A/V}^2)(${f(wl2)}))} = ${f(r.vov, 4)}\,\text{V}$, the same as $M_1$'s, as it must be.`,
    };
  };

  // ================================================================ 1b. mirrors: small signal (R_in, R_out, current gain)
  T.mirrorSS = (v) => {
    const vov = Math.sqrt(2 * v.iref / (UN * v.wl1));
    const i2 = v.iref * v.wl2 / v.wl1;
    const gm1 = 2 * v.iref / vov, gm2 = 2 * i2 / vov;
    const rds1 = 1 / (v.lam * v.iref), rds2 = 1 / (v.lam * i2);
    const rin = par(1 / gm1, rds1);
    const rout = v.casc ? rds2 + rds2 + gm2 * rds2 * rds2 : rds2;   // cascode: M4 = M2 in size and current
    const ai = gm2 / (gm1 + 1 / rds1);
    return { vov, i2, gm1, gm2, rds1, rds2, rin, rout, ai };
  };
  GENS.bk_mirrorss = () => {
    const casc = Math.random() < 0.3;
    let wl1, vov, iref;
    for (let k = 0; k < 50; k++) {
      wl1 = pick([10, 20, 25, 40, 50, 100]);
      vov = pick([0.2, 0.2, 0.25, 0.4]);
      iref = 0.5 * UN * wl1 * vov * vov;
      if (iref >= 9.9e-6 && iref <= 200.1e-6) break;
    }
    const N = pick([1, 2, 2, 3, 4]);
    const wl2 = wl1 * N;
    const lam = pick([0.02, 0.05, 0.1]);
    const v = { wl1, wl2, iref, lam, casc };
    const r = T.mirrorSS(v);
    const parts = [
      res('R_{in}', r.rin, { accept: [1 / r.gm1], traps: [{ v: r.rds1, msg: 'The diode is not a drain with a held gate: its gate follows the node, so it looks like $1/g_{m1}$.' }] }),
      res('R_{out}', r.rout, { accept: casc ? [r.gm2 * r.rds2 * r.rds2] : [], traps: casc ? [{ v: r.rds2, msg: 'That is the simple mirror. The cascode device multiplies it by about $g_{m4}r_{ds4}$.' }, { v: 2 * r.rds2, msg: 'Stacking is not series addition: the cascode device scales the resistance under it by $1 + g_{m4}r_{ds4}$.' }] : [{ v: 1 / r.gm2, msg: 'That is what a diode or a source looks like. The copy\'s gate is held by the diode, so only $r_{ds2}$ is left.' }, { v: r.rin, msg: 'That is the input (diode) side.' }] }),
      num('i_{out}/i_{in}', '', r.ai, { accept: [N], traps: [{ v: 1 / N, msg: 'Upside down: the copy carries $g_{m2}/g_{m1}$ times the input.' }] }),
    ];
    const sz = (w) => `${f(w)}/1`;
    return {
      _v: v,
      fig: casc ? cascMirror() : nmirror({ look: true }),
      q: md`${casc ? `A cascode NMOS mirror: $M_1$ and $M_3$ are diode-connected and carry $I_{REF}$; $M_2$ copies it and $M_4$ (same size and current as $M_2$, gate on $M_3$'s gate) is stacked on top. ` : 'An NMOS current mirror. '}$I_{REF} = ${UA(iref)}$, $(W/L)_1 = ${sz(wl1)}$, $(W/L)_2 = ${sz(wl2)}$${casc ? ' $= (W/L)_4$' : ''}, $\lambda = ${f(lam)}\,\text{V}^{-1}$ for every device ($\lambda$ only through $r_{ds} = 1/(\lambda I_D)$). The reference source is ideal. Find the small-signal resistance looking into the diode node ($R_{in}$, $M_1$'s drain), the output resistance $R_{out}$, and the small-signal current gain $i_{out}/i_{in}$ (a signal $i_{in}$ added to $I_{REF}$, output held at a fixed voltage).`,
      parts,
      hints: [
        md`DC first: $V_{ov} = \sqrt{2I_{REF}/(\mu_nC_{ox}(W/L)_1)}$, $I_{D2} = I_{REF}(W/L)_2/(W/L)_1$, then $g_m = 2I_D/V_{ov}$ and $r_{ds} = 1/(\lambda I_D)$ for each device.`,
        md`Diode node: $R_{in} = \tfrac1{g_{m1}}\parallel r_{ds1}$. ${casc ? 'Output: the reference is ideal, so both gate nodes are still; $M_4$ is a drain with $r_{ds2}$ under its source: $r_{ds4} + r_{ds2} + g_{m4}r_{ds4}r_{ds2}$.' : 'Output: the reference is ideal, so the gate node is still and $M_2$ is just $r_{ds2}$.'}`,
        md`Current gain: $v_a = i_{in}/(g_{m1} + 1/r_{ds1})$, then $i_{out} = g_{m2}v_a$.`,
      ],
      sol: md`
1. **DC.** $V_{ov} = \sqrt{2(${f(iref * 1e6)}\,\mu\text{A})/((100\,\mu\text{A/V}^2)(${f(wl1)}))} = ${f(r.vov, 4)}\,\text{V}$. $I_{D1} = ${UA(iref)}$, $I_{D2} = ${UA(r.i2)}$${casc ? ' (and $M_4$ carries the same)' : ''}.
2. **Small-signal parameters.** $g_{m1} = \dfrac{2I_{D1}}{V_{ov}} = ${MS(r.gm1)}$ ($1/g_{m1} = ${RT(1 / r.gm1)}$), $r_{ds1} = \dfrac{1}{\lambda I_{D1}} = ${RT(r.rds1)}$; $g_{m2} = ${MS(r.gm2)}$, $r_{ds2} = ${RT(r.rds2)}$.
3. **Input (diode node).** A test voltage on the diode node is its own $v_{gs}$: $i_t = g_{m1}v_t + v_t/r_{ds1}$, so $R_{in} = \tfrac{1}{g_{m1}}\parallel r_{ds1} = ${RT(r.rin)}$ (about $1/g_{m1}$).
4. **Output.** The ideal reference is an open circuit, so nothing drives the gate node${casc ? 's' : ''}: ${casc ? `both stay at 0. $M_4$ has a held gate and $M_2$ ($r_{ds2}$) under its source, so $R_{out} = r_{ds4} + r_{ds2} + g_{m4}r_{ds4}r_{ds2} = ${RT(r.rout)}$, about $g_{m2}r_{ds2}$ (${f(r.gm2 * r.rds2, 4)}) times the simple mirror's $${RT(r.rds2)}$.` : `$v_{gs2} = 0$ and only $r_{ds2}$ carries current: $R_{out} = r_{ds2} = ${RT(r.rout)}$.`}
5. **Current gain.** $v_a = \dfrac{i_{in}}{g_{m1} + 1/r_{ds1}}$, $i_{out} = g_{m2}v_a$: $\dfrac{i_{out}}{i_{in}} = \dfrac{${f(r.gm2 * 1e3, 4)}}{${f(r.gm1 * 1e3, 4)} + ${f(1e3 / r.rds1, 4)}} = ${f(r.ai, 4)}$, essentially the size ratio ${f(N)}.`,
    };
  };

  // ================================================================ 2. chains: CS -> CS, CS -> CG, CS -> follower -> R_L
  const chainFigs = {
    cscs: () => [
      ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_{D1}', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
      ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4),
      ['w', [1, 0], [1.8, 0], [1.8, 1], [2, 1]], ['node', [1.4, 0], { n: 'v_1', side: 'a' }],
      ['rail', [3, -1.2]], ['R', [3, -1.2], [3, 0], { n: 'R_{D2}' }], ['nmos', [3, 1], { n: 'M_2' }], ['gnd', [3, 2]],
      ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'v_{out}', side: 'r' }],
    ],
    cscg: () => [
      ['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_{D2}', side: 'l' }], ['w', [1, -1], [1.8, -1]], ['term', [1.8, -1], { n: 'v_{out}', side: 'r' }],
      ['nmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]],
      ['w', [1, 1], [3, 1]], ['node', [2, 1], { n: 'v_1', side: 'b' }], ['rail', [3, -0.4]], ['R', [3, -0.4], [3, 1], { n: 'R_{D1}' }],
      ['nmos', [1, 2], { n: 'M_1' }], ['gnd', [1, 3]], ['w', [0, 2], [-0.6, 2], [-0.6, 2.4]], ...vin(-0.6, 2.4),
    ],
    cscd: () => [
      ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_{D1}', side: 'l' }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
      ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4),
      ['w', [1, 0], [1.8, 0], [1.8, 1], [2, 1]], ['node', [1.4, 0], { n: 'v_1', side: 'a' }],
      ['rail', [3, 0]], ['nmos', [3, 1], { n: 'M_2' }], ['w', [3, 2], [3.8, 2]], ['term', [3.8, 2], { n: 'v_{out}', side: 'r' }],
      ['R', [3, 2], [3, 3.2], { n: 'R_L' }], ['gnd', [3, 3.2]],
    ],
  };
  Object.assign(window.BK4.fig, { chain: chainFigs });
  T.chain = (v) => {
    const r = {};
    if (v.kind === 'cscs') { r.A1 = -v.gm1 * par(v.RD1, v.rds1); r.A2 = -v.gm2 * par(v.RD2, v.rds2); }
    if (v.kind === 'cscg') {
      r.Rin2 = (v.rds2 + v.RD2) / (1 + v.gm2 * v.rds2);
      r.A1 = -v.gm1 * par(v.RD1, v.rds1, r.Rin2); r.A2 = (v.gm2 + 1 / v.rds2) * par(v.RD2, v.rds2);
      r.A1free = -v.gm1 * par(v.RD1, v.rds1);
    }
    if (v.kind === 'cscd') { const Rp = par(v.rds2, v.RL); r.A1 = -v.gm1 * par(v.RD1, v.rds1); r.A2 = v.gm2 * Rp / (1 + v.gm2 * Rp); }
    r.Av = r.A1 * r.A2;
    return r;
  };
  GENS.bk_chain = () => {
    const kind = pick(['cscs', 'cscg', 'cscg', 'cscd']);
    const v = {
      kind, gm1: pick([0.5, 1, 2, 4]) * 1e-3, rds1: pick([50, 100, 200]) * 1e3, RD1: pick([5, 10, 20]) * 1e3,
      gm2: pick([0.5, 1, 2, 4]) * 1e-3, rds2: pick([50, 100, 200]) * 1e3, RD2: pick([5, 10, 20]) * 1e3, RL: pick([0.5, 1, 2, 5]) * 1e3,
    };
    const r = T.chain(v);
    const g = (x) => f(x, 4);
    const m2 = kind === 'cscd' ? `$g_{m2} = ${MS(v.gm2)}$, $r_{ds2} = ${KO(v.rds2)}$, $R_L = ${RT(v.RL)}$` : `$g_{m2} = ${MS(v.gm2)}$, $r_{ds2} = ${KO(v.rds2)}$, $R_{D2} = ${KO(v.RD2)}$`;
    const what = { cscs: 'a common source whose drain $v_1$ drives the **gate** of a second common source', cscg: 'a common source whose drain $v_1$ drives the **source** of a common gate $M_2$ (gate held)', cscd: 'a common source whose drain $v_1$ drives the **gate** of a source follower $M_2$ with $R_L$ on its source' }[kind];
    const parts = [];
    if (kind === 'cscg') parts.push(res('R_{in2}', r.Rin2, { accept: [1 / v.gm2], traps: [{ v: v.rds2, msg: 'That is $r_{ds2}$. A source with its gate held is about $1/g_{m2}$.' }] }));
    parts.push(num('A_1', '', r.A1, { traps: kind === 'cscg' ? [{ v: r.A1free, msg: 'That ignores the loading: $R_{in2}$ sits in parallel at $v_1$.' }] : [] }));
    parts.push(num('A_2', '', r.A2, { traps: kind === 'cscd' ? [{ v: 1, msg: 'A follower\'s gain is $g_mR/(1 + g_mR)$ with $R = r_{ds2}\\parallel R_L$: below 1.' }] : kind === 'cscg' ? [{ v: -r.A2, msg: 'A common gate does not invert.' }] : [] }));
    parts.push(num('A_v', '', r.Av, { traps: kind === 'cscg' ? [{ v: r.A1free * r.A2, msg: 'That multiplies the gains without the loading at $v_1$.' }, { v: -r.Av, msg: 'Count the inversions: only the common source inverts.' }] : [{ v: -r.Av, msg: kind === 'cscs' ? 'Two inversions: positive.' : 'One inversion (the common source): negative.' }] }));
    const s1 = kind === 'cscg'
      ? `1. **Loading.** $v_1$ touches $M_2$'s **source**: $R_{in2} = \\dfrac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}} = \\dfrac{${KO(v.rds2)} + ${KO(v.RD2)}}{1 + ${g(v.gm2 * v.rds2)}} = ${RT(r.Rin2)}$.
2. **$A_1$.** $R_{D1}\\parallel r_{ds1}\\parallel R_{in2} = ${RT(par(v.RD1, v.rds1, r.Rin2))}$, so $A_1 = -(${MS(v.gm1)})(${RT(par(v.RD1, v.rds1, r.Rin2))}) = ${g(r.A1)}$.
3. **$A_2$.** Driven at the source: $G_{M2} = -(g_{m2} + 1/r_{ds2})$, $R_{out2} = R_{D2}\\parallel r_{ds2} = ${KO(par(v.RD2, v.rds2))}$: $A_2 = (${MS(v.gm2 + 1 / v.rds2)})(${KO(par(v.RD2, v.rds2))}) = ${g(r.A2)}$.`
      : kind === 'cscs'
        ? `1. **Loading.** $v_1$ touches a **gate**: $R_{in2} = \\infty$, no loading.
2. **$A_1$.** $A_1 = -g_{m1}(R_{D1}\\parallel r_{ds1}) = -(${MS(v.gm1)})(${KO(par(v.RD1, v.rds1))}) = ${g(r.A1)}$.
3. **$A_2$.** $A_2 = -g_{m2}(R_{D2}\\parallel r_{ds2}) = -(${MS(v.gm2)})(${KO(par(v.RD2, v.rds2))}) = ${g(r.A2)}$.`
        : `1. **Loading.** $v_1$ touches a **gate**: no loading.
2. **$A_1$.** $A_1 = -g_{m1}(R_{D1}\\parallel r_{ds1}) = -(${MS(v.gm1)})(${KO(par(v.RD1, v.rds1))}) = ${g(r.A1)}$.
3. **$A_2$ (follower).** Output shorted, $M_2$ pushes $g_{m2}v_1$ into it: $G_{M2} = -g_{m2}$; $R_{out2} = \\tfrac1{g_{m2}}\\parallel r_{ds2}\\parallel R_L$. With $R = r_{ds2}\\parallel R_L = ${RT(par(v.rds2, v.RL))}$: $A_2 = \\dfrac{g_{m2}R}{1 + g_{m2}R} = \\dfrac{${g(v.gm2 * par(v.rds2, v.RL))}}{1 + ${g(v.gm2 * par(v.rds2, v.RL))}} = ${g(r.A2)}$.`;
    return {
      _v: v,
      fig: chainFigs[kind](),
      q: md`The chain is ${what}. $g_{m1} = ${MS(v.gm1)}$, $r_{ds1} = ${KO(v.rds1)}$, $R_{D1} = ${KO(v.RD1)}$; ${m2}. Find ${kind === 'cscg' ? '$R_{in2}$ (looking into $M_2$ from $v_1$), ' : ''}$A_1 = v_1/v_{in}$, $A_2 = v_{out}/v_1$ and $A_v$.`,
      parts,
      hints: [
        md`What touches $v_1$? A gate draws nothing; a source with its gate held is about $1/g_m$: $R_{in2} = \dfrac{r_{ds2} + R_{D2}}{1 + g_{m2}r_{ds2}}$.`,
        md`$A_1 = -g_{m1}(R_{D1}\parallel r_{ds1}\parallel R_{in2})$; $A_2$ by $G_MR_{out}$ with an ideal $v_1$.`,
      ],
      sol: md`
${s1}
4. **Multiply.** $A_v = A_1A_2 = (${g(r.A1)})(${g(r.A2)}) = ${g(r.Av)}$. ${kind === 'cscs' ? 'Two inversions: positive.' : 'One inversion (the common source): negative.'}${kind === 'cscg' ? ` Without the loading you would have written $(${g(r.A1free)})(${g(r.A2)}) = ${g(r.A1free * r.A2)}$.` : ''}`,
    };
  };

  // ================================================================ 3. two paths into one output
  const pathFigs = {
    inv: (rs) => [
      ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['nmos', [1, 1], { n: 'M_1' }],
      ...(rs ? [['R', [1, 2], [1, 3.2], { n: 'R_S' }], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]]),
      ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}', side: 'r' }],
      ['w', [0, -1], [-0.3, -1], [-0.3, 1], [0, 1]], ['w', [-0.3, 0], [-0.9, 0], [-0.9, 0.4]], ...vin(-0.9, 0.4),
    ],
    fight: () => [
      ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
      ['node', [1.7, 0], { n: 'v_1', side: 'a' }], ['w', [1, 0], [2.4, 0], [2.4, -1], [3, -1]],
      ['rail', [4, -2]], ['pmos', [4, -1], { n: 'M_4' }], ['nmos', [4, 1], { n: 'M_3' }], ['gnd', [4, 2]],
      ['w', [4, 0], [4.8, 0]], ['term', [4.8, 0], { n: 'v_{out}', side: 'r' }],
      ['w', [0, 1], [-1, 1], [-1, 1.4]], ...vin(-1, 1.4),
      ['w', [-0.4, 1], [-0.4, 2.9], [2.6, 2.9], [2.6, 1], [3, 1]],
    ],
  };
  Object.assign(window.BK4.fig, { paths: pathFigs });
  T.paths = (v) => {
    const r = {};
    if (v.kind === 'inv') {
      r.G1 = v.RS ? v.gm1 / (1 + (v.gm1 + 1 / v.rds1) * v.RS) : v.gm1;
      r.GM = r.G1 + v.gm2;
      r.RDN = v.RS ? v.rds1 + v.RS + v.gm1 * v.rds1 * v.RS : v.rds1;
      r.Rout = par(v.rds2, r.RDN);
    } else {
      r.A1 = -v.gm1 / (v.gm2 + 1 / v.rds1 + 1 / v.rds2);
      r.GM = v.gm3 + v.gm4 * r.A1;
      r.Rout = par(v.rds3, v.rds4);
    }
    r.Av = -r.GM * r.Rout;
    return r;
  };
  GENS.bk_paths = () => {
    const kind = pick(['inv', 'fight', 'fight']);
    const G = () => pick([0.5, 1, 2, 4]) * 1e-3, Rd = () => pick([50, 100, 200]) * 1e3;
    let v, r;
    for (let k = 0; k < 40; k++) {
      v = kind === 'inv' ? { kind, gm1: G(), rds1: Rd(), gm2: G(), rds2: Rd(), RS: pick([0, 0, 1e3, 2e3]) }
        : { kind, gm1: G(), gm2: G(), gm3: G(), gm4: G(), rds1: Rd(), rds2: Rd(), rds3: Rd(), rds4: Rd() };
      r = T.paths(v);
      if (Math.abs(r.GM) > 0.15e-3) break;          // keep clear of an exact cancellation
    }
    const g = (x) => f(x, 4);
    const parts = [];
    if (kind === 'fight') parts.push(num('A_1', '', r.A1, { traps: [{ v: -r.A1, msg: 'A common source with a diode load inverts.' }] }));
    parts.push(num('G_M', 'mS', r.GM * 1e3, { traps: kind === 'fight' ? [{ v: (v.gm3 - v.gm4 * r.A1) * 1e3, msg: 'The PMOS gate sees an inverted copy ($A_1 < 0$): its term is $g_{m4}A_1$, negative.' }]
      : [{ v: (r.G1 - v.gm2) * 1e3, msg: 'Both gates see $v_{in}$: both transistors pull current out of the output, so the terms add.' }, ...(v.RS ? [{ v: (v.gm1 + v.gm2) * 1e3, msg: 'The degenerated branch delivers $g_{m1}/(1 + (g_{m1} + 1/r_{ds1})R_S)$, not $g_{m1}$.' }] : [])] }));
    parts.push(res('R_{out}', r.Rout, { traps: kind === 'inv' && v.RS ? [{ v: par(v.rds1, v.rds2), msg: 'Looking down you see a degenerated drain, $r_{ds1} + R_S + g_{m1}r_{ds1}R_S$.' }] : [] }));
    parts.push(num('A_v', '', r.Av, { traps: [{ v: -r.Av, msg: 'Check the sign of $G_M$: $A_v = -G_MR_{out}$.' }] }));
    const q = kind === 'inv'
      ? md`A push-pull stage: $v_{in}$ drives the NMOS $M_1$ (${v.RS ? `degenerated by $R_S = ${KO(v.RS)}$` : 'source on ground'}) and the PMOS $M_2$ (source on $V_{DD}$); their drains form the output. $g_{m1} = ${MS(v.gm1)}$, $r_{ds1} = ${KO(v.rds1)}$, $g_{m2} = ${MS(v.gm2)}$, $r_{ds2} = ${KO(v.rds2)}$. Find $G_M$ (current pulled out of the shorted output per volt of $v_{in}$), $R_{out}$ and $A_v$.`
      : md`Two paths: $M_3$ (gate at $v_{in}$) on the output, and $M_1$ (gate at $v_{in}$) with the diode-connected PMOS $M_2$ at node $v_1$, which drives the PMOS $M_4$ on the output. $g_{m1} = ${MS(v.gm1)}$, $g_{m2} = ${MS(v.gm2)}$, $g_{m3} = ${MS(v.gm3)}$, $g_{m4} = ${MS(v.gm4)}$; $r_{ds1} = ${KO(v.rds1)}$, $r_{ds2} = ${KO(v.rds2)}$, $r_{ds3} = ${KO(v.rds3)}$, $r_{ds4} = ${KO(v.rds4)}$. Find $A_1 = v_1/v_{in}$, $G_M$, $R_{out}$ and $A_v$.`;
    const sol = kind === 'inv'
      ? md`
1. **Output shorted.** Both gates see $v_{in}$. ${v.RS ? `The degenerated branch delivers $G_{M1} = \dfrac{g_{m1}}{1 + (g_{m1} + 1/r_{ds1})R_S} = \dfrac{${MS(v.gm1)}}{1 + ${g((v.gm1 + 1 / v.rds1) * v.RS)}} = ${MS(r.G1)}$; the PMOS delivers $g_{m2} = ${MS(v.gm2)}$.` : `Each pulls $g_mv_{in}$ out of the output: $${MS(v.gm1)}$ and $${MS(v.gm2)}$.`} Total $G_M = ${MS(r.GM)}$.
2. **$v_{in} = 0$.** Up: $r_{ds2} = ${KO(v.rds2)}$. Down: ${v.RS ? `$r_{ds1} + R_S + g_{m1}r_{ds1}R_S = ${RT(r.RDN)}$` : `$r_{ds1} = ${KO(v.rds1)}$`}. $R_{out} = ${RT(r.Rout)}$.
3. $A_v = -G_MR_{out} = -(${MS(r.GM)})(${RT(r.Rout)}) = ${g(r.Av)}$.`
      : md`
1. **Node $v_1$** (KCL, currents leaving): $g_{m1}v_{in} + v_1(g_{m2} + 1/r_{ds1} + 1/r_{ds2}) = 0$, so $A_1 = -\dfrac{${MS(v.gm1)}}{${MS(v.gm2 + 1 / v.rds1 + 1 / v.rds2)}} = ${g(r.A1)}$.
2. **Output shorted.** $i_{out} = g_{m3}v_{in} + g_{m4}v_1$: $G_M = ${MS(v.gm3)} + (${MS(v.gm4)})(${g(r.A1)}) = ${MS(r.GM)}$. ${r.GM < 0 ? 'The PMOS push wins.' : 'The direct NMOS path wins.'}
3. **$v_{in} = 0$** makes $v_1 = 0$, so $R_{out} = r_{ds3}\parallel r_{ds4} = ${RT(r.Rout)}$.
4. $A_v = -G_MR_{out} = ${g(r.Av)}$ (${r.Av > 0 ? 'non-inverting' : 'inverting'}).`;
    return {
      _v: v, fig: kind === 'inv' ? pathFigs.inv(v.RS) : pathFigs.fight(), q, parts, sol,
      hints: [md`Short the output and add the current each transistor pulls out of it; a gate on $v_1$ contributes $g_mA_1$, sign included.`, md`$R_{out}$ with $v_{in} = 0$: every internal node driven only by $v_{in}$ is still.`],
    };
  };

  // ================================================================ 4. mirrors that carry signal
  const sigFigs = {
    cs: () => [
      ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', flip: true, dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
      ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4), ['node', [1, 0], { n: 'a', side: 'l' }],
      ['rail', [3, -2]], ['pmos', [3, -1], { n: 'M_3' }], ['R', [3, 0], [3, 1.4], { n: 'R_L' }], ['gnd', [3, 1.4]], ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'v_{out}', side: 'r' }],
    ],
    cg: () => [
      ['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2', flip: true, dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]],
      ['node', [1, 0], { n: 'a', side: 'l' }], ['R', [1, 2], [1, 3.2], { n: 'R_S' }], ...vin(1, 3.2),
      ['rail', [3, -2]], ['pmos', [3, -1], { n: 'M_3' }], ['R', [3, 0], [3, 1.4], { n: 'R_L' }], ['gnd', [3, 1.4]], ['w', [3, 0], [3.8, 0]], ['term', [3.8, 0], { n: 'v_{out}', side: 'r' }],
    ],
    dio: () => [
      ['rail', [1, -0.6]], ['I', [1, -0.6], [1, 0.6], { n: 'I_B', side: 'l' }], ['w', [1, 0.6], [1, 1]],
      ['nmos', [1, 2], { n: 'M_1', flip: true, dc: true }], ['gnd', [1, 3]], ['node', [1, 1], { n: 'a', side: 'ar' }],
      ['w', [1, 1], [-0.2, 1]], ['R', [-0.2, 1], [-1.6, 1], { n: 'R_S' }], ['w', [-1.6, 1], [-1.8, 1]], ['C', [-1.8, 1], [-2.6, 1], { n: '\\infty' }], ['w', [-2.6, 1], [-2.8, 1], [-2.8, 1.4]], ...vin(-2.8, 1.4),
      ['nmos', [3, 2], { n: 'M_2' }], ['gnd', [3, 3]], ['rail', [3, -0.6]], ['R', [3, -0.6], [3, 1], { n: 'R_L' }], ['w', [3, 1], [3.8, 1]], ['term', [3.8, 1], { n: 'v_{out}', side: 'r' }],
    ],
  };
  Object.assign(window.BK4.fig, { sig: sigFigs });
  T.sig = (v) => {
    const r = {};
    if (v.kind === 'cs') {
      r.va = -v.gm1 / (v.gm2 + 1 / v.rds1 + 1 / v.rds2);
      r.GM = v.gm3 * r.va; r.Rout = par(v.RL, v.rds3);
    } else if (v.kind === 'cg') {
      r.Ra = 1 / (v.gm2 + 1 / v.rds2);
      r.Rin1 = (v.rds1 + r.Ra) / (1 + v.gm1 * v.rds1);
      r.GM = v.gm3 * r.Ra / (v.RS + r.Rin1); r.Rout = par(v.RL, v.rds3);
    } else {
      r.Ra = 1 / (v.gm1 + 1 / v.rds1);
      r.va = r.Ra / (v.RS + r.Ra);
      r.GM = v.gm2 * r.va; r.Rout = par(v.RL, v.rds2);
    }
    r.Av = -r.GM * r.Rout;
    return r;
  };
  GENS.bk_sigmirror = () => {
    const kind = pick(['cs', 'cs', 'cg', 'dio']);
    const N = pick([1, 2, 3, 4]);
    const gb = pick([0.5, 1, 2]) * 1e-3, rb = pick([100, 200]) * 1e3;
    let v;
    if (kind === 'cs') v = { kind, N, gm1: pick([0.5, 1, 2]) * 1e-3, rds1: pick([100, 200]) * 1e3, gm2: gb, rds2: rb, gm3: N * gb, rds3: rb / N, RL: pick([5, 10, 20]) * 1e3 };
    else if (kind === 'cg') v = { kind, N, gm1: pick([0.5, 1, 2]) * 1e-3, rds1: pick([100, 200]) * 1e3, gm2: gb, rds2: rb, gm3: N * gb, rds3: rb / N, RS: pick([0.5, 1, 2]) * 1e3, RL: pick([5, 10, 20]) * 1e3 };
    else v = { kind, N, gm1: gb, rds1: rb, gm2: N * gb, rds2: rb / N, RS: pick([0.5, 1, 2]) * 1e3, RL: pick([5, 10, 20]) * 1e3 };
    const r = T.sig(v);
    const g = (x) => f(x, 4);
    const sz = N === 1 ? 'the same size as' : `${N} times wider than`;
    let q, parts, sol;
    if (kind === 'cs') {
      q = md`A common source $M_1$ pulls its current through the diode-connected PMOS $M_2$ (node $a$); the PMOS $M_3$, ${sz} $M_2$, copies it into $R_L$. $g_{m1} = ${MS(v.gm1)}$, $r_{ds1} = ${KO(v.rds1)}$; $g_{m2} = ${MS(v.gm2)}$, $r_{ds2} = ${KO(v.rds2)}$; $g_{m3} = ${MS(v.gm3)}$, $r_{ds3} = ${KO(v.rds3)}$; $R_L = ${KO(v.RL)}$. Find $v_a/v_{in}$, $G_M$, $R_{out}$ and $A_v$.`;
      parts = [num('v_a/v_{in}', '', r.va, { accept: [-v.gm1 / v.gm2] }), num('G_M', 'mS', r.GM * 1e3, { traps: [{ v: -r.GM * 1e3, msg: 'Current is pushed **into** the output when $v_{in}$ rises: $G_M$ (pulled out) is negative.' }] }),
        res('R_{out}', r.Rout), num('A_v', '', r.Av, { traps: [{ v: -r.Av, msg: 'The mirror turns the pull into a push: the stage is non-inverting.' }] })];
      sol = md`
1. **Node $a$** (KCL, currents leaving): $g_{m1}v_{in} + v_a(g_{m2} + 1/r_{ds1} + 1/r_{ds2}) = 0$, so $\dfrac{v_a}{v_{in}} = -\dfrac{${MS(v.gm1)}}{${MS(v.gm2 + 1 / v.rds1 + 1 / v.rds2)}} = ${g(r.va)}$.
2. **Output shorted.** $M_3$'s source is $V_{DD}$, so $v_{gs3} = v_a$ and it pulls $g_{m3}v_a$ out of the output: $G_M = (${MS(v.gm3)})(${g(r.va)}) = ${MS(r.GM)}$. Negative: when $v_{in}$ rises, $M_3$ pushes current in.
3. **$v_{in} = 0$** makes $v_a = 0$: $R_{out} = R_L\parallel r_{ds3} = ${RT(r.Rout)}$.
4. $A_v = -G_MR_{out} = +${g(r.Av)}$, close to $g_{m1}\tfrac{g_{m3}}{g_{m2}}R_L = ${g(v.gm1 * N * v.RL)}$ without the $r_{ds}$'s.`;
    } else if (kind === 'cg') {
      q = md`A common gate $M_1$ (gate held) is driven at its source through $R_S$; its drain feeds the diode-connected PMOS $M_2$ (node $a$), and the PMOS $M_3$, ${sz} $M_2$, copies the current into $R_L$. $g_{m1} = ${MS(v.gm1)}$, $r_{ds1} = ${KO(v.rds1)}$; $g_{m2} = ${MS(v.gm2)}$, $r_{ds2} = ${KO(v.rds2)}$; $g_{m3} = ${MS(v.gm3)}$, $r_{ds3} = ${KO(v.rds3)}$; $R_S = ${RT(v.RS)}$, $R_L = ${KO(v.RL)}$. Find the resistance $R_{in1}$ looking up into $M_1$'s source, $G_M$ and $A_v$.`;
      parts = [res('R_{in1}', r.Rin1, { accept: [1 / v.gm1] }), num('G_M', 'mS', r.GM * 1e3), num('A_v', '', r.Av, { traps: [{ v: -r.Av, msg: 'A common gate alone does not invert, but here its current is mirrored: $v_{in}$ up means less current through the diode, $v_a$ up, and $M_3$ pushes less.' }] })];
      sol = md`
1. **Into $M_1$'s source.** Its drain sees only the diode, $R_a = \dfrac{1}{g_{m2} + 1/r_{ds2}} = ${RT(r.Ra)}$, so $R_{in1} = \dfrac{r_{ds1} + R_a}{1 + g_{m1}r_{ds1}} = ${RT(r.Rin1)}$.
2. **The signal current.** $i = \dfrac{v_{in}}{R_S + R_{in1}}$ flows from $v_{in}$ up through $M_1$ into node $a$ and out through the diode, so $v_a = iR_a$ (it **rises** with $v_{in}$).
3. **Output shorted.** $M_3$ pulls $g_{m3}v_a$ out of the output: $G_M = \dfrac{g_{m3}R_a}{R_S + R_{in1}} = ${MS(r.GM)}$.
4. $R_{out} = R_L\parallel r_{ds3} = ${RT(r.Rout)}$ and $A_v = -G_MR_{out} = ${g(r.Av)}$: **inverting**, about $-\tfrac{g_{m3}}{g_{m2}}\tfrac{R_L}{R_S + 1/g_{m1}}$.`;
    } else {
      q = md`A current-input amplifier: $v_{in}$ drives the diode-connected NMOS $M_1$ (biased by the ideal $I_B$) through a large coupling capacitor and $R_S$; $M_2$, ${sz} $M_1$, shares its gate and drives $R_L$ (to $V_{DD}$). $g_{m1} = ${MS(v.gm1)}$, $r_{ds1} = ${KO(v.rds1)}$; $g_{m2} = ${MS(v.gm2)}$, $r_{ds2} = ${KO(v.rds2)}$; $R_S = ${RT(v.RS)}$, $R_L = ${KO(v.RL)}$. Find $v_a/v_{in}$ and $A_v$.`;
      parts = [num('v_a/v_{in}', '', r.va, { traps: [{ v: 1, msg: 'The diode is a small resistor ($1/g_{m1}$): it forms a divider with $R_S$.' }] }), num('A_v', '', r.Av, { traps: [{ v: -r.Av, msg: '$M_2$ is a common source from node $a$: inverting.' }] })];
      sol = md`
1. **The diode is a resistor.** $R_a = \tfrac1{g_{m1}}\parallel r_{ds1} = ${RT(r.Ra)}$ (the ideal $I_B$ is open, the capacitor a short, $M_2$'s gate draws nothing).
2. **Divider.** $\dfrac{v_a}{v_{in}} = \dfrac{R_a}{R_S + R_a} = ${g(r.va)}$.
3. **The copy.** $M_2$ pulls $g_{m2}v_a$ out of the output, which sees $R_L\parallel r_{ds2} = ${RT(r.Rout)}$: $A_v = -g_{m2}\dfrac{v_a}{v_{in}}(R_L\parallel r_{ds2}) = ${g(r.Av)}$.`;
    }
    return {
      _v: v, fig: sigFigs[kind](), q, parts, sol,
      hints: [md`The diode converts current to voltage ($\approx1/g_m$); the copy converts it back ($g_m$). Find the diode node's voltage first.`, md`Then short the output for $G_M$, and set $v_{in} = 0$ for $R_{out}$ (the diode node goes still).`],
    };
  };

  // ================================================================ 5. the folded cascode and current division
  // M1 NMOS input (drain X), M3 PMOS current source into X, M4 PMOS common gate (source X, drain = out),
  // optional M2 (NMOS, drain on V_DD, gate held, source X); load R_D or an NMOS cascode sink M5 on M6.
  const foldedFig = (o = {}) => [
    ...(o.m2 ? [['rail', [1, -0.6]], ['nmos', [1, 0.4], { n: 'M_2' }], ['acg', [0, 0.4]]] : []),
    ['node', [1, 1.4], { n: 'X', side: o.m2 ? 'l' : 'al' }], ['nmos', [1, 2.4], { n: 'M_1' }], ['gnd', [1, 3.4]],
    ['w', [0, 2.4], [-0.6, 2.4], [-0.6, 2.8]], ...vin(-0.6, 2.8),
    ['w', [1, 1.4], [3, 1.4]], ['rail', [3, -0.6]], ['pmos', [3, 0.4], { n: 'M_3' }], ['acg', [2, 0.4]],
    ['pmos', [3, 2.4], { n: 'M_4', flip: true }], ['acg', [4, 2.4], { dir: 'u' }], ['w', [3, 3.4], [3.9, 3.4]], ['term', [3.9, 3.4], { n: 'v_{out}', side: 'r' }],
    ...(o.casc ? [['nmos', [3, 4.4], { n: 'M_5' }], ['acg', [2, 4.4]], ['nmos', [3, 6.4], { n: 'M_6' }], ['acg', [2, 6.4]], ['gnd', [3, 7.4]]]
      : [['R', [3, 3.4], [3, 4.6], { n: 'R_D' }], ['gnd', [3, 4.6]]]),
  ];
  Object.assign(window.BK4.fig, { folded: foldedFig });
  T.folded = (v) => {
    const RX = v.m2 ? par(v.rds1, v.rds3, 1 / (v.gm2 + 1 / v.rds2)) : par(v.rds1, v.rds3);
    const R4 = 1 / (v.gm4 + 1 / v.rds4);
    const GM = v.gm1 * RX / (RX + R4);
    const RUP = v.rds4 + RX * (1 + v.gm4 * v.rds4);
    const RDN = v.casc ? v.rds5 + v.rds6 + v.gm5 * v.rds5 * v.rds6 : v.RD;
    const Rout = par(RUP, RDN);
    return { RX, R4, GM, RUP, RDN, Rout, Av: -GM * Rout };
  };
  GENS.bk_folded = () => {
    const m2 = Math.random() < 0.4, casc = Math.random() < 0.35;
    const G = () => pick([0.5, 1, 2]) * 1e-3, Rd = () => pick([100, 200]) * 1e3;
    const v = { m2, casc, gm1: G(), rds1: Rd(), rds3: Rd(), gm4: G(), rds4: Rd() };
    if (m2) Object.assign(v, { gm2: G(), rds2: Rd() });
    if (casc) Object.assign(v, { gm5: G(), rds5: Rd(), rds6: Rd() }); else v.RD = pick([5, 10, 20]) * 1e3;
    const r = T.folded(v);
    const g = (x) => f(x, 4);
    const given = [`$g_{m1} = ${MS(v.gm1)}$`, `$r_{ds1} = ${KO(v.rds1)}$`, ...(m2 ? [`$g_{m2} = ${MS(v.gm2)}$`, `$r_{ds2} = ${KO(v.rds2)}$`] : []), `$r_{ds3} = ${KO(v.rds3)}$`, `$g_{m4} = ${MS(v.gm4)}$`, `$r_{ds4} = ${KO(v.rds4)}$`,
      ...(casc ? [`$g_{m5} = ${MS(v.gm5)}$`, `$r_{ds5} = ${KO(v.rds5)}$`, `$r_{ds6} = ${KO(v.rds6)}$`] : [`$R_D = ${KO(v.RD)}$`])].join(', ');
    const parts = [
      res('R_X', r.RX, { traps: m2 ? [{ v: par(v.rds1, v.rds3), msg: '$M_2$\'s source is also at $X$: add $\\tfrac1{g_{m2}}\\parallel r_{ds2}$ in parallel.' }] : [] }),
      num('G_M', 'mS', r.GM * 1e3, { accept: m2 ? [] : [v.gm1 * 1e3], traps: m2 ? [{ v: v.gm1 * 1e3, msg: 'With $M_2$ at $X$, the current divides between two sources: only the part entering $M_4$ reaches the output.' }] : [] }),
      res('R_{out}', r.Rout, { traps: [{ v: casc ? par(v.rds4, r.RDN) : par(v.RD, v.rds4), msg: '$M_4$ is degenerated by $R_X$: looking up you see $r_{ds4} + R_X(1 + g_{m4}r_{ds4})$, not $r_{ds4}$.' }] }),
      num('A_v', '', r.Av, { traps: [{ v: -r.Av, msg: 'Inverting: $v_{in}$ up pulls $X$ down, which turns $M_4$ (a PMOS) down.' }] }),
    ];
    return {
      _v: v, fig: foldedFig({ m2, casc }),
      q: md`A folded cascode${m2 ? ' with the extra device $M_2$ (NMOS, drain on $V_{DD}$, gate held, source at $X$)' : ''}: $M_1$ pulls on node $X$, $M_3$ is a PMOS current source into $X$, and the PMOS common gate $M_4$ (source at $X$, gate held) carries the signal to the output, loaded by ${casc ? 'the NMOS cascode current sink $M_5$ on $M_6$ (gates held)' : '$R_D$'}. ${given}. Find $R_X$ (everything at $X$ except $M_4$), $G_M$, $R_{out}$ and $A_v$.`,
      parts,
      hints: [md`Output shorted, $M_4$ looks like $\tfrac1{g_{m4}}\parallel r_{ds4}$ from $X$. $M_1$'s current $g_{m1}v_{in}$ divides between $R_X$ and $M_4$: $G_M = g_{m1}\dfrac{R_X}{R_X + 1/(g_{m4} + 1/r_{ds4})}$.`, md`$R_{out} = [r_{ds4} + R_X(1 + g_{m4}r_{ds4})]\parallel R_{DN}$.`],
      sol: md`
1. **$R_X$.** ${m2 ? `$r_{ds1}\\parallel r_{ds3}\\parallel(\\tfrac1{g_{m2}}\\parallel r_{ds2}) = ${RT(r.RX)}$: $M_2$'s source dominates.` : `$r_{ds1}\\parallel r_{ds3} = ${RT(r.RX)}$.`}
2. **Current division.** $M_4$ from $X$ (output shorted): $\tfrac1{g_{m4}}\parallel r_{ds4} = ${RT(r.R4)}$. The share of $g_{m1}v_{in}$ that enters $M_4$: $\dfrac{R_X}{R_X + ${RT(r.R4).replace(/\\,/g, '\\,')}} = ${g(r.GM / v.gm1)}$, so $G_M = ${MS(r.GM)}$.
3. **Looking up** into $M_4$'s drain: $r_{ds4} + R_X(1 + g_{m4}r_{ds4}) = ${RT(r.RUP)}$. **Looking down:** ${casc ? `$r_{ds5} + r_{ds6} + g_{m5}r_{ds5}r_{ds6} = ${RT(r.RDN)}$` : `$R_D = ${KO(v.RD)}$`}. $R_{out} = ${RT(r.Rout)}$.
4. $A_v = -G_MR_{out} = ${g(r.Av)}$.`,
    };
  };
})();

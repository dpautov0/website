/* gens-e2.js — randomized Exam 2 drills: node impedances built from canonical blocks, single-stage gains, g_m from
   the bias, two-stage chains, sign checks and the K rule. Every answer comes from the exact formula; where a problem
   allows it, the g_m r_ds >> 1 approximation is accepted too (part.accept). */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick;
  const GENS = window.GENS;
  const par = U.par;
  const KO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
  const MS = (g) => `${f(g * 1000, 3)}\\,\\text{mS}`;
  // a resistance answer in a sensible unit, with the approximation accepted as well
  const resPart = (lbl, exact, approx) => {
    const [unit, s] = exact < 1e3 ? ['Ω', 1] : exact < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6];
    const p = { lbl, unit, ans: exact * s };
    if (approx !== undefined && Math.abs(approx - exact) > 0.012 * exact) p.accept = [approx * s];
    return p;
  };
  const resTeX = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : r < 1e6 ? KO(r) : `${f(r / 1e6, 3)}\\,\\text{M}\\Omega`);
  const look = ['w', [1, 0], [2, 0]];
  const lookT = ['term', [2, 0], { n: '\\leftarrow R_{EQ}', side: 'r' }];

  // ================================================================ R_UP || R_DN from canonical blocks
  const DOWN = {
    nI: { fig: () => [['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['gnd', [1, 2]]],
      r: (p) => p.r1, ap: (p) => p.r1, say: 'gate held, source grounded: looking into a drain, $R_{DN} = r_{ds1}$' },
    nD: { fig: () => [['nmos', [1, 1], { n: 'M_1', dc: true }], ['gnd', [1, 2]]],
      r: (p) => 1 / (p.g1 + 1 / p.r1), ap: (p) => 1 / p.g1, say: 'diode-connected: $R_{DN} = \\frac{1}{g_{m1}}\\parallel r_{ds1}$' },
    nDeg: { fig: (p) => [['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_1', s: KO(p.R1) }], ['gnd', [1, 3.2]]],
      r: (p) => p.r1 + p.R1 + p.g1 * p.r1 * p.R1, ap: (p) => p.r1 * (1 + p.g1 * p.R1), say: 'gate held, $R_1$ in the source: $R_{DN} = r_{ds1} + R_1 + g_{m1}r_{ds1}R_1$' },
    nDR: { fig: (p) => [['nmos', [1, 1], { n: 'M_1', dc: true }], ['R', [1, 2], [1, 3.2], { n: 'R_1', s: KO(p.R1) }], ['gnd', [1, 3.2]]],
      r: (p) => p.R1 + 1 / (p.g1 + 1 / p.r1), ap: (p) => p.R1 + 1 / p.g1, say: 'a diode with $R_1$ under it: $R_{DN} = R_1 + \\frac{1}{g_{m1}}\\parallel r_{ds1}$' },
    nCas: { fig: () => [['nmos', [1, 1], { n: 'M_1' }], ['acg', [0, 1]], ['nmos', [1, 3], { n: 'M_0' }], ['acg', [0, 3]], ['gnd', [1, 4]]],
      r: (p) => 2 * p.r1 + p.g1 * p.r1 * p.r1, ap: (p) => p.g1 * p.r1 * p.r1, say: 'a cascode ($M_0$ identical to $M_1$): $R_{DN} = 2r_{ds1} + g_{m1}r_{ds1}^2$' },
  };
  const UP = {
    R: { fig: (p) => [['R', [1, -1.4], [1, 0], { n: 'R_2', s: KO(p.R2) }], ['rail', [1, -1.4]]], r: (p) => p.R2, ap: (p) => p.R2, say: 'a resistor to $V_{DD}$: $R_{UP} = R_2$' },
    pI: { fig: () => [['pmos', [1, -1], { n: 'M_2' }], ['acg', [0, -1]], ['rail', [1, -2]]], r: (p) => p.r2, ap: (p) => p.r2, say: 'PMOS with its gate held: $R_{UP} = r_{ds2}$' },
    pD: { fig: () => [['pmos', [1, -1], { n: 'M_2', dc: true }], ['rail', [1, -2]]], r: (p) => 1 / (p.g2 + 1 / p.r2), ap: (p) => 1 / p.g2, say: 'diode-connected PMOS: $R_{UP} = \\frac{1}{g_{m2}}\\parallel r_{ds2}$' },
    pDeg: { fig: (p) => [['pmos', [1, -1], { n: 'M_2' }], ['acg', [0, -1]], ['R', [1, -3.2], [1, -2], { n: 'R_2', s: KO(p.R2) }], ['rail', [1, -3.2]]],
      r: (p) => p.r2 + p.R2 + p.g2 * p.r2 * p.R2, ap: (p) => p.r2 * (1 + p.g2 * p.R2), say: 'PMOS with $R_2$ in its source: $R_{UP} = r_{ds2} + R_2 + g_{m2}r_{ds2}R_2$' },
  };
  const randDev = () => ({ g: pick([1, 2, 4, 5]) * 1e-3, r: pick([20, 50, 100, 200]) * 1e3 });

  GENS.e2_updn = () => {
    const dk = pick(Object.keys(DOWN)), uk = pick(Object.keys(UP));
    const d1 = randDev(), d2 = randDev();
    const p = { g1: d1.g, r1: d1.r, g2: d2.g, r2: d2.r, R1: pick([1, 2, 5, 10]) * 1e3, R2: pick([2, 5, 10, 20]) * 1e3 };
    const D = DOWN[dk], Up = UP[uk];
    const rd = D.r(p), ru = Up.r(p), req = par(rd, ru), ap = par(D.ap(p), Up.ap(p));
    const uses = (k) => (Up.fig(p).concat(D.fig(p))).some((e) => (e[0] === 'nmos' || e[0] === 'pmos') && e[2] && e[2].n === k);
    const devs = [uses('M_1') ? `$M_1$: $g_m = ${MS(p.g1)}$, $r_{ds} = ${KO(p.r1)}$` : '', uses('M_0') ? '$M_0$ is identical to $M_1$' : '', uses('M_2') ? `$M_2$: $g_m = ${MS(p.g2)}$, $r_{ds} = ${KO(p.r2)}$` : ''].filter(Boolean).join('; ');
    return {
      fig: [...Up.fig(p), ...D.fig(p), look, lookT],
      q: `Find the small-signal resistance $R_{EQ}$ at the node. ${devs}. Triangles are incremental grounds.`,
      parts: [resPart('R_{EQ}', req, ap)],
      hints: ['Split the node: $R_{EQ} = R_{UP}\\parallel R_{DN}$. Each branch is one canonical stage.', `Down: ${D.say}. Up: ${Up.say}.`],
      sol: `**Down:** ${D.say} $= ${resTeX(rd)}$.\n\n**Up:** ${Up.say} $= ${resTeX(ru)}$.\n\n$$R_{EQ} = R_{UP}\\parallel R_{DN} = ${resTeX(ru)}\\parallel ${resTeX(rd)} = ${resTeX(req)}$$\n\nThe smaller branch dominates: ${ru < rd ? 'looking up' : 'looking down'} is the low-resistance side.${Math.abs(ap - req) > 0.012 * req ? ` (With the $g_mr_{ds}\\gg1$ approximations: ${resTeX(ap)}, also accepted.)` : ''}`,
    };
  };

  // ================================================================ the K rule with a resistor divider on the gate
  GENS.e2_k = () => {
    const g = pick([1, 2, 4]) * 1e-3, r = pick([50, 100, 200]) * 1e3, RS = pick([1, 2, 5]) * 1e3;
    const Ra = pick([50, 100, 200]) * 1e3, Rb = pick([50, 100, 200]) * 1e3;
    const K = Rb / (Ra + Rb);
    const rdn = (r + RS + g * r * RS) / (1 + g * r * K), req = par(rdn, Ra + Rb);
    const apx = par(RS / K + 1 / (g * K), Ra + Rb);
    return {
      fig: [['nmos', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S', s: KO(RS) }], ['gnd', [1, 3.2]], ['w', [1, 0], [1, -0.4], [2.2, -0.4]], ['term', [2.2, -0.4], { n: '\\leftarrow R_{EQ}', side: 'r' }],
        ['w', [1, -0.4], [-1, -0.4]], ['R', [-1, -0.4], [-1, 1], { n: 'R_a', s: KO(Ra), side: 'l' }], ['R', [-1, 1], [-1, 2.4], { n: 'R_b', s: KO(Rb), side: 'l' }], ['gnd', [-1, 2.4]], ['w', [-1, 1], [0, 1]]],
      q: `$g_m = ${MS(g)}$, $r_{ds} = ${KO(r)}$. The gate hangs on a divider from the drain. Find $R_{EQ}$.`,
      parts: [resPart('R_{EQ}', req, apx)],
      hints: ['Two branches from the node: the divider $R_a + R_b$, and the transistor. The gate draws no current, so it does not load the divider.', 'The gate moves by $K = R_b/(R_a + R_b)$ times the test voltage. Use $R_{DN} = \\dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$.'],
      sol: `$K = \\dfrac{R_b}{R_a + R_b} = ${f(K, 3)}$. Transistor branch:\n$$R_{DN} = \\frac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K} = ${resTeX(rdn)}$$\nIt is about $\\dfrac{R_S + 1/g_m}{K}$: a diode with $R_S$, divided by $K$. Divider branch: $R_a + R_b = ${resTeX(Ra + Rb)}$.\n$$R_{EQ} = ${resTeX(rdn)}\\parallel${resTeX(Ra + Rb)} = ${resTeX(req)}$$`,
    };
  };

  // ================================================================ single-stage gains (numbers)
  const inL = (gx, y) => [['w', [gx, y], [gx - 0.6, y], [gx - 0.6, y + 0.4]], ['Vac', [gx - 0.6, y + 0.4], [gx - 0.6, y + 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [gx - 0.6, y + 1.4]]];
  const outT = (p) => ['term', p, { n: 'v_{out}', side: 'r' }];
  const STAGES = {
    cs() {
      const gm = pick([1, 2, 4, 5]) * 1e-3, RD = pick([5, 10, 20]) * 1e3, r = pick([20, 50, 100]) * 1e3;
      const Av = -gm * par(RD, r);
      return { fig: [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D', s: KO(RD) }], ['w', [1, 0], [1.8, 0]], outT([1.8, 0]), ['nmos', [1, 1]], ['gnd', [1, 2]], ...inL(0, 1)],
        q: `$g_m = ${MS(gm)}$, $r_{ds} = ${KO(r)}$ (do not ignore it).`, Av,
        sol: `$G_M = g_m$, $R_{out} = R_D\\parallel r_{ds} = ${KO(par(RD, r))}$, so $A_v = -g_mR_{out} = ${f(Av, 4)}$.` };
    },
    csdeg() {
      const gm = pick([2, 4, 5, 10]) * 1e-3, RD = pick([5, 10, 20]) * 1e3, RS = pick([0.5, 1, 2]) * 1e3;
      const Av = -gm * RD / (1 + gm * RS);
      return { fig: [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D', s: KO(RD) }], ['w', [1, 0], [1.8, 0]], outT([1.8, 0]), ['nmos', [1, 1]], ['R', [1, 2], [1, 3.2], { n: 'R_S', s: KO(RS) }], ['gnd', [1, 3.2]], ...inL(0, 1)],
        q: `$g_m = ${MS(gm)}$, ignore $r_{ds}$.`, Av,
        sol: `$G_M = \\dfrac{g_m}{1 + g_mR_S} = \\dfrac{${MS(gm)}}{${f(1 + gm * RS)}}$, $R_{out} = R_D$: $A_v = -\\dfrac{g_mR_D}{1 + g_mR_S} = ${f(Av, 4)}$. Compare $-R_D/R_S = ${f(-RD / RS)}$: close when $g_mR_S \\gg 1$.` };
    },
    cg() {
      const gm = pick([2, 4, 5, 10]) * 1e-3, RD = pick([5, 10, 20]) * 1e3, RS = pick([0.1, 0.25, 0.5, 1]) * 1e3;
      const Av = RD / (RS + 1 / gm);
      return { fig: [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D', s: KO(RD) }], ['w', [1, 0], [1.8, 0]], outT([1.8, 0]), ['nmos', [1, 1]], ['acg', [0, 1]],
        ['R', [1, 2], [1, 3.2], { n: 'R_S', s: RS < 1e3 ? `${RS}\\,\\Omega` : KO(RS) }], ['Vac', [1, 3.2], [1, 4.2], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.2]]],
        q: `Common gate, $g_m = ${MS(gm)}$, ignore $r_{ds}$.`, Av,
        sol: `The source is a $1/g_m = ${f(1 / gm)}\\,\\Omega$ node, so $v_{in}$ drives $i = v_{in}/(R_S + 1/g_m)$ through the device into $R_D$: $A_v = +\\dfrac{R_D}{R_S + 1/g_m} = ${f(Av, 4)}$. **Positive**: CG does not invert.` };
    },
    cd() {
      const gm = pick([1, 2, 4, 5, 10]) * 1e-3, RL = pick([0.1, 0.2, 0.5, 1, 2]) * 1e3;
      const Av = RL / (RL + 1 / gm);
      return { fig: [['rail', [1, 0]], ['nmos', [1, 1]], ['w', [1, 2], [1.8, 2]], outT([1.8, 2]), ['R', [1, 2], [1, 3.2], { n: 'R_L', s: RL < 1e3 ? `${RL}\\,\\Omega` : KO(RL) }], ['gnd', [1, 3.2]], ...inL(0, 1)],
        q: `Source follower, $g_m = ${MS(gm)}$, ignore $r_{ds}$.`, Av,
        sol: `A divider between $1/g_m = ${f(1 / gm)}\\,\\Omega$ (looking up into the source) and $R_L$: $A_v = \\dfrac{R_L}{R_L + 1/g_m} = ${f(Av, 4)}$.` };
    },
    diode() {
      const pm = Math.random() < 0.5;
      const w1 = pick([50, 100, 200, 400]), w2 = pick([25, 50, 100, 200, 400]);
      const Av = -Math.sqrt((100 * w1) / ((pm ? 50 : 100) * w2));
      const top = pm ? ['pmos', [1, -1], { n: 'M_2', dc: true, sz: `${w2}/1` }] : ['nmos', [1, -1], { n: 'M_2', dc: true, sz: `${w2}/1` }];
      return { fig: [['rail', [1, -2]], top, ['w', [1, 0], [1.8, 0]], outT([1.8, 0]), ['nmos', [1, 1], { n: 'M_1', sz: `${w1}/1` }], ['gnd', [1, 2]], ...inL(0, 1)],
        q: `Ignore $r_{ds}$ (and body effect). Course parameters.`, Av,
        sol: `Same current in both, so $\\dfrac{g_{m1}}{g_{m2}} = \\sqrt{\\dfrac{\\mu_1(W/L)_1}{\\mu_2(W/L)_2}} = \\sqrt{\\dfrac{100\\times${w1}}{${pm ? 50 : 100}\\times${w2}}}$. $A_v = -g_{m1}\\cdot\\dfrac{1}{g_{m2}} = ${f(Av, 4)}$.${pm ? ' The PMOS has half the mobility, which doubles the ratio under the root.' : ''}` };
    },
    inv() {
      const g1 = pick([1, 2, 4]) * 1e-3, g2 = pick([1, 2, 4]) * 1e-3, r1 = pick([50, 100]) * 1e3, r2 = pick([50, 100]) * 1e3;
      const Av = -(g1 + g2) * par(r1, r2);
      return { fig: [['rail', [1, -2]], ['pmos', [1, -1], { n: 'M_2' }], ['w', [1, 0], [1.8, 0]], outT([1.8, 0]), ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]],
        ['w', [0, -1], [-0.3, -1], [-0.3, 1], [0, 1]], ['w', [-0.3, 0], [-0.9, 0], [-0.9, 0.4]], ['Vac', [-0.9, 0.4], [-0.9, 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.9, 1.4]]],
        q: `$M_1$: $g_m = ${MS(g1)}$, $r_{ds} = ${KO(r1)}$. $M_2$: $g_m = ${MS(g2)}$, $r_{ds} = ${KO(r2)}$.`, Av,
        sol: `Both transistors push the output the same way, so $G_M = g_{m1} + g_{m2} = ${MS(g1 + g2)}$; $R_{out} = r_{ds1}\\parallel r_{ds2} = ${KO(par(r1, r2))}$. $A_v = ${f(Av, 4)}$.` };
    },
  };
  GENS.e2_stage = (o = {}) => {
    const k = pick(o.only || Object.keys(STAGES));
    const s = STAGES[k]();
    return {
      fig: s.fig, q: `Find the small-signal gain $A_v = v_{out}/v_{in}$. ${s.q}`,
      parts: [{ lbl: 'A_v', unit: '', ans: s.Av }],
      hints: ['Name the stage first (where does $v_{in}$ enter, where is $v_{out}$ taken?). Then use its $G_M$ and $R_{out}$.', 'Sign: common source inverts; common gate and common drain do not.'],
      sol: s.sol,
    };
  };

  // ================================================================ g_m from the bias
  GENS.e2_gm = () => {
    const pm = Math.random() < 0.4;
    const k = pm ? 50e-6 : 100e-6;
    const WL = pick([50, 100, 200, 250, 500, 1000]), vov = pick([0.1, 0.2, 0.4]);
    const I = 0.5 * k * WL * vov * vov, gm = 2 * I / vov;
    const form = pick(['vov', 'id']);
    const Is = I < 1e-3 ? `${f(I * 1e6)}\\,\\mu\\text{A}` : `${f(I * 1e3)}\\,\\text{mA}`;
    return {
      q: form === 'vov'
        ? `A ${pm ? 'PMOS' : 'NMOS'} with $W/L = ${WL}/1$ has $|V_{GS}| = ${f(1 + vov)}\\,\\text{V}$ (course parameters). Find $I_D$, $g_m$ and $1/g_m$.`
        : `A ${pm ? 'PMOS' : 'NMOS'} with $W/L = ${WL}/1$ carries $I_D = ${Is}$ in saturation. Find $V_{ov}$, $g_m$ and $1/g_m$.`,
      parts: form === 'vov'
        ? [{ lbl: 'I_D', unit: 'mA', ans: I * 1e3 }, { lbl: 'g_m', unit: 'mS', ans: gm * 1e3 }, { lbl: '1/g_m', unit: 'Ω', ans: 1 / gm }]
        : [{ lbl: 'V_{ov}', unit: 'V', ans: vov }, { lbl: 'g_m', unit: 'mS', ans: gm * 1e3 }, { lbl: '1/g_m', unit: 'Ω', ans: 1 / gm }],
      hints: [`$K = \\tfrac12\\mu C_{ox}\\tfrac{W}{L} = \\tfrac12(${pm ? 50 : 100}\\,\\mu)(${WL}) = ${f(0.5 * k * WL * 1e3)}\\,\\text{mA/V}^2$.`, '$g_m = 2I_D/V_{ov}$, the one formula on the sheet.'],
      sol: `$K = ${f(0.5 * k * WL * 1e3)}\\,\\text{mA/V}^2$, $V_{ov} = ${f(vov)}\\,\\text{V}$, $I_D = KV_{ov}^2 = ${Is}$.\n\n$g_m = \\dfrac{2I_D}{V_{ov}} = ${f(gm * 1e3)}\\,\\text{mS}$, so $1/g_m = ${f(1 / gm)}\\,\\Omega$.`,
    };
  };

  // ================================================================ two-stage chains
  GENS.e2_chain = () => {
    const kind = pick(['diodeCs', 'csFollower', 'csCg']);
    if (kind === 'diodeCs') {
      const g1 = pick([2, 4, 8]) * 1e-3, g2 = pick([1, 2, 4]) * 1e-3, g3 = pick([1, 2, 5]) * 1e-3, RD = pick([2, 5, 10]) * 1e3;
      const A1 = -g1 / g2, A2 = -g3 * RD;
      return {
        fig: [['rail', [1, -2]], ['nmos', [1, -1], { n: 'M_2', dc: true }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ...inL(0, 1),
          ['w', [1, 0], [2.4, 0], [2.4, 1]], ['node', [1.7, 0], { n: 'v_1', side: 'a' }], ['nmos', [3.4, 1], { n: 'M_3' }], ['gnd', [3.4, 2]], ['R', [3.4, -1.2], [3.4, 0], { n: 'R_D', s: KO(RD) }], ['rail', [3.4, -1.2]],
          ['w', [3.4, 0], [4.2, 0]], outT([4.2, 0])],
        q: `$g_{m1} = ${MS(g1)}$, $g_{m2} = ${MS(g2)}$, $g_{m3} = ${MS(g3)}$; ignore $r_{ds}$. Find $A_1 = v_1/v_{in}$ and $A_v = v_{out}/v_{in}$.`,
        parts: [{ lbl: 'A_1', unit: '', ans: A1 }, { lbl: 'A_v', unit: '', ans: A1 * A2 }],
        hints: ['$M_3$\'s gate draws no current, so stage 1 sees only the diode $M_2$: $1/g_{m2}$.', 'Two inverting stages: the total gain is positive.'],
        sol: `Stage 1: CS with a diode load, $A_1 = -g_{m1}/g_{m2} = ${f(A1)}$ (the gate of $M_3$ does not load it). Stage 2: CS with $R_D$, $A_2 = -g_{m3}R_D = ${f(A2)}$. $A_v = A_1A_2 = ${f(A1 * A2)}$, positive (two inversions).`,
      };
    }
    if (kind === 'csFollower') {
      const g1 = pick([1, 2, 4]) * 1e-3, R1 = pick([5, 10, 20]) * 1e3, g2 = pick([2, 5, 10]) * 1e-3, RL = pick([0.2, 0.5, 1]) * 1e3;
      const A1 = -g1 * R1, A2 = RL / (RL + 1 / g2);
      return {
        fig: [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_1', s: KO(R1) }], ['nmos', [1, 1], { n: 'M_1' }], ['gnd', [1, 2]], ...inL(0, 1),
          ['w', [1, 0], [2.4, 0], [2.4, 1]], ['node', [1.7, 0], { n: 'v_1', side: 'a' }], ['nmos', [3.4, 1], { n: 'M_2' }], ['rail', [3.4, 0]],
          ['R', [3.4, 2], [3.4, 3.2], { n: 'R_L', s: `${RL}\\,\\Omega` }], ['gnd', [3.4, 3.2]], ['w', [3.4, 2], [4.2, 2]], outT([4.2, 2])],
        q: `$g_{m1} = ${MS(g1)}$, $g_{m2} = ${MS(g2)}$; ignore $r_{ds}$. Find $A_1 = v_1/v_{in}$ and $A_v$.`,
        parts: [{ lbl: 'A_1', unit: '', ans: A1 }, { lbl: 'A_v', unit: '', ans: A1 * A2 }],
        hints: ['The follower is driven at its gate: no loading on $v_1$.', 'Follower gain: $R_L/(R_L + 1/g_{m2})$.'],
        sol: `$A_1 = -g_{m1}R_1 = ${f(A1)}$. Follower: $A_2 = \\dfrac{R_L}{R_L + 1/g_{m2}} = ${f(A2, 4)}$. $A_v = ${f(A1 * A2, 4)}$. The follower costs a little gain but can drive the small $R_L$, which would have wrecked $R_1$ if tied straight to it.`,
      };
    }
    // CS into the source of a CG device: current division at node X
    const g1 = pick([1, 2, 4]) * 1e-3, g2 = pick([2, 5, 10]) * 1e-3, RX = pick([0.2, 0.5, 1, 2]) * 1e3, RD = pick([5, 10, 20]) * 1e3;
    const frac = RX / (RX + 1 / g2), Av = -g1 * frac * RD;
    return {
      fig: [['rail', [1, -2.2]], ['R', [1, -2.2], [1, -1], { n: 'R_D', s: KO(RD) }], ['w', [1, -1], [1.8, -1]], outT([1.8, -1]), ['nmos', [1, 0], { n: 'M_2' }], ['acg', [0, 0]],
        ['node', [1, 1], { n: 'X', side: 'l' }], ['w', [1, 1], [2.2, 1]], ['R', [2.2, 1], [2.2, -0.4], { n: 'R_X', s: RX < 1e3 ? `${RX}\\,\\Omega` : KO(RX) }], ['rail', [2.2, -0.4]],
        ['nmos', [1, 2], { n: 'M_1' }], ['gnd', [1, 3]], ...inL(0, 2)],
      q: `$g_{m1} = ${MS(g1)}$, $g_{m2} = ${MS(g2)}$; ignore $r_{ds}$. Find $A_v$.`,
      parts: [{ lbl: 'A_v', unit: '', ans: Av }],
      hints: ['$M_1$ pulls $g_{m1}v_{in}$ out of node $X$. Where does that current come from: $R_X$ or the source of $M_2$?', 'Current division: the $M_2$ branch looks like $1/g_{m2}$.'],
      sol: `$M_1$ pulls $g_{m1}v_{in}$ from $X$. It splits between $R_X$ and the $1/g_{m2} = ${f(1 / g2)}\\,\\Omega$ source of $M_2$: the share through $M_2$ is $\\dfrac{R_X}{R_X + 1/g_{m2}} = ${f(frac, 3)}$. That current comes down through $R_D$: $A_v = -g_{m1}\\dfrac{R_X}{R_X + 1/g_{m2}}R_D = ${f(Av, 4)}$. (Lecture 16, example iii.)`,
    };
  };

  // ================================================================ signs
  GENS.e2_sign = () => {
    const kinds = [['CS', -1], ['CG', 1], ['CD', 1], ['cascode', -1], ['CS with degeneration', -1], ['CMOS inverter amplifier', -1]];
    const n = pick([2, 3]);
    const chain = Array.from({ length: n }, () => pick(kinds));
    const sgn = chain.reduce((s, c) => s * c[1], 1);
    return {
      q: `A chain of stages, each driving the next: ${chain.map((c) => `**${c[0]}**`).join(' → ')}. What is the sign of the overall gain?`,
      parts: [{ mc: [sgn > 0 ? 'Positive (non-inverting)' : 'Negative (inverting)', sgn > 0 ? 'Negative (inverting)' : 'Positive (non-inverting)'], a: 0, why: [null, 'Count only the inverting stages: CS-type stages (including the cascode and the inverter) invert; CG and CD do not.'] }],
      sol: `Inverting stages here: ${chain.filter((c) => c[1] < 0).length}. ${chain.filter((c) => c[1] < 0).length % 2 ? 'An odd number: the gain is negative.' : 'An even number: the gain is positive.'} CS, degenerated CS, cascode and inverter all invert; CG and CD do not.`,
    };
  };
})();

/* gens-bk-a6.js — Book Chapters 8 (Looking into a BJT) and 9 (BJT amplifiers): the figure library both chapters draw
   with (window.BK6), the formulas, and the randomized drills. Every formula here was checked against an independent
   small-signal nodal solve (scratch checks), and every generator was run on hundreds of random draws against it. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, par = U.par;
  const GENS = window.GENS;
  const VT = 0.025;

  // ================================================================ formatting
  const KO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
  const RT = (r) => (r < 1e3 ? `${f(r, 3)}\\,\\Omega` : r < 1e6 ? KO(r) : `${f(r / 1e6, 3)}\\,\\text{M}\\Omega`);
  const MS = (g) => `${f(g * 1e3, 3)}\\,\\text{mS}`;
  const MA = (i) => `${f(i * 1e3, 3)}\\,\\text{mA}`;
  const VV = (v) => `${f(v, 3)}\\,\\text{V}`;

  // ================================================================ small-signal pictures (hybrid-pi)
  // One BJT laid out the way Lecture 24 draws it: B at the top left, r_pi down to the emitter rail, the controlled
  // source g_m v_pi from C (top) down to E, r_o (o.ro) to its right. Incremental ground everywhere a supply was.
  //   o.b: base side    'gnd' | 'RB' | 'vin' | 'vinRB' | 'test' | 'testRB' | 'C' (tied to C) | 'RBC' (R_B from C) | 'open'
  //   o.e: emitter side 'gnd' | 'RE' | 'REvin' | 'vin' | 'test' | 'REtest' | 'REout' | 'REshort' | 'REtestR' | 'open'
  //   o.c: collector    'gnd' | 'RC' | 'RCshort' | 'RCtest' | 'RCout' | 'test' | 'short' | 'open'
  //   o.x, o.y: offset; o.s: subscript for this transistor's symbols ('1', '2'); o.lab: names {RB, RE, RC}
  //   o.cur: draw the currents of the derivation ('base' | 'emit' | 'coll' | 'diode')
  function ss(o = {}) {
    const x0 = o.x || 0, y0 = o.y || 0;
    const p = (x, y) => [x0 + x, y0 + y];
    const s = o.s || '';
    const N = Object.assign({ RB: 'R_B', RE: 'R_E', RC: 'R_C' }, o.lab || {});
    const rpi = s ? `r_{\\pi${s}}` : 'r_\\pi', vpi = s ? `v_{\\pi${s}}` : 'v_\\pi', gm = s ? `g_{m${s}}` : 'g_m', ro = s ? `r_{o${s}}` : 'r_o';
    const xr = o.ro ? 3.4 : 2;                     // right edge of the transistor
    const e = [
      ['R', p(0, 0), p(0, 2), { n: rpi, side: 'l' }], ['vlab', p(0.33, 0.32), p(0.33, 1.68), { n: vpi }],
      ['w', p(0, 2), p(xr, 2)], ['G', p(2, 0), p(2, 2), { n: `${gm}${vpi}` }],
    ];
    if (o.ro) e.push(['w', p(2, 0), p(3.4, 0)], ['R', p(3.4, 0), p(3.4, 2), { n: ro }]);
    if (o.names !== false) e.push(['txt', p(0.1, -0.24), '$B$', { a: 'l' }], ['txt', p(2.12, -0.22), '$C$', { a: 'l' }], ['txt', p(0.88, 2.25), '$E$', { a: 'r' }]);
    // ---- base
    const B = o.b || 'gnd';
    if (B === 'gnd') e.push(['w', p(0, 0), p(-0.7, 0), p(-0.7, 0.35)], ['gnd', p(-0.7, 0.35)]);
    if (B === 'RB') e.push(['R', p(-1.5, 0), p(0, 0), { n: N.RB }], ['w', p(-1.5, 0), p(-1.5, 0.35)], ['gnd', p(-1.5, 0.35)]);
    if (B === 'vin') e.push(['w', p(0, 0), p(-1.2, 0), p(-1.2, 0.5)], ['Vac', p(-1.2, 0.5), p(-1.2, 1.5), { n: 'v_{in}', side: 'l' }], ['gnd', p(-1.2, 1.5)]);
    if (B === 'vinRB') e.push(['R', p(-1.5, 0), p(0, 0), { n: N.RB }], ['w', p(-1.5, 0), p(-2.1, 0), p(-2.1, 0.5)], ['Vac', p(-2.1, 0.5), p(-2.1, 1.5), { n: 'v_{in}', side: 'l' }], ['gnd', p(-2.1, 1.5)]);
    if (B === 'test') e.push(['w', p(0, 0), p(-1.4, 0)], ['V', p(-1.4, 0), p(-1.4, 1.2), { n: 'v_t', side: 'l' }], ['gnd', p(-1.4, 1.2)], ['iarr', p(-0.75, 0), 'r', { n: 'i_t' }]);
    if (B === 'testRB') e.push(['R', p(-1.5, 0), p(0, 0), { n: N.RB }], ['w', p(-1.5, 0), p(-2.5, 0)], ['V', p(-2.5, 0), p(-2.5, 1.2), { n: 'v_t', side: 'l' }], ['gnd', p(-2.5, 1.2)], ['iarr', p(-2.0, 0), 'r', { n: 'i_t' }]);
    if (B === 'C') e.push(['w', p(0, 0), p(0, -0.6), p(2, -0.6), p(2, 0)]);
    if (B === 'RBC') e.push(['w', p(0, 0), p(0, -0.6)], ['R', p(0, -0.6), p(2, -0.6), { n: N.RB }], ['w', p(2, -0.6), p(2, 0)]);
    // ---- emitter (the emitter node is drawn at x = 1)
    const E = o.e || 'gnd';
    if (E === 'gnd') e.push(['w', p(1, 2), p(1, 2.4)], ['gnd', p(1, 2.4)]);
    if (/^RE/.test(E)) e.push(['R', p(1, 2), p(1, 3.4), { n: N.RE, side: 'l' }]);
    if (E === 'RE' || E === 'REout' || E === 'REshort' || E === 'REtestR') e.push(['gnd', p(1, 3.4)]);
    if (E === 'REvin') e.push(['Vac', p(1, 3.4), p(1, 4.4), { n: 'v_{in}', side: 'l' }], ['gnd', p(1, 4.4)]);
    if (E === 'vin') e.push(['w', p(1, 2), p(1, 2.3)], ['Vac', p(1, 2.3), p(1, 3.3), { n: 'v_{in}', side: 'l' }], ['gnd', p(1, 3.3)]);
    if (E === 'test') e.push(['w', p(1, 2), p(1, 2.5)], ['V', p(1, 2.5), p(1, 3.7), { n: 'v_t', side: 'l' }], ['gnd', p(1, 3.7)], ['iarr', p(1, 2.3), 'u', { n: 'i_t' }]);
    if (E === 'REtest') e.push(['V', p(1, 3.4), p(1, 4.6), { n: 'v_t', side: 'l' }], ['gnd', p(1, 4.6)], ['iarr', p(1, 3.0), 'u', { n: 'i_t', off: [14, 0] }]);
    if (E === 'REout') e.push(['w', p(xr, 2), p(xr + 0.8, 2)], ['term', p(xr + 0.8, 2), { n: 'v_{out}' }]);
    if (E === 'REshort') e.push(['w', p(xr, 2), p(xr + 1.4, 2), p(xr + 1.4, 2.5)], ['gnd', p(xr + 1.4, 2.5)], ['iarr', p(xr + 0.75, 2), 'l', { n: 'i_{out}', side: 'b' }]);
    if (E === 'REtestR') e.push(['w', p(xr, 2), p(xr + 1.4, 2)], ['V', p(xr + 1.4, 2), p(xr + 1.4, 3.2), { n: 'v_t' }], ['gnd', p(xr + 1.4, 3.2)], ['iarr', p(xr + 0.75, 2), 'l', { n: 'i_t', side: 'b' }]);
    // ---- collector (node C at x = 2, y = 0)
    const Cc = o.c || 'gnd';
    if (Cc === 'gnd') e.push(['w', p(2, 0), p(2, -0.5)], ['gndu', p(2, -0.5)]);
    if (/^RC/.test(Cc)) e.push(['R', p(2, -1.4), p(2, 0), { n: N.RC, side: 'l' }], ['gndu', p(2, -1.4)]);
    if (Cc === 'RCshort' || Cc === 'short') e.push(['w', p(xr, 0), p(xr + 1.4, 0), p(xr + 1.4, 0.5)], ['gnd', p(xr + 1.4, 0.5)], ['iarr', p(xr + 0.75, 0), 'l', { n: 'i_{out}' }]);
    if (Cc === 'RCtest' || Cc === 'test') e.push(['w', p(xr, 0), p(xr + 1.4, 0)], ['V', p(xr + 1.4, 0), p(xr + 1.4, 1.2), { n: 'v_t' }], ['gnd', p(xr + 1.4, 1.2)], ['iarr', p(xr + 0.75, 0), 'l', { n: 'i_t' }]);
    if (Cc === 'RCout') e.push(['w', p(xr, 0), p(xr + 0.8, 0)], ['term', p(xr + 0.8, 0), { n: 'v_{out}' }]);
    return e;
  }

  // ================================================================ transistor-level pictures
  // NPN at [1, 1]: C [1, 0], B [0, 1], E [1, 2]. PNP at [1, 1]: E [1, 0] (on top, toward V_CC), B [0, 1], C [1, 2].
  const term = (pt, n, side) => ['term', pt, { n, side }];
  const inL = (pt, n = 'R_{in}') => term(pt, `${n}\\rightarrow`, 'l');
  const upA = (pt, n = 'R') => term(pt, `\\uparrow ${n}`, 'r');
  const dnA = (pt, n = 'R') => term(pt, `\\downarrow ${n}`, 'r');
  const vinAt = (x, y, n = 'v_{in}') => [['Vac', [x, y], [x, y + 1], { n, side: 'l' }], ['gnd', [x, y + 1]]];

  // Looking into the base. o: { RE, RB, RC, pnp, n }
  function lookB(o = {}) {
    const e = [];
    if (!o.pnp) {
      e.push(['npn', [1, 1], { n: o.n || '' }]);
      if (o.RC) e.push(['R', [1, -1.2], [1, 0], { n: o.RC === true ? 'R_C' : o.RC }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
      else e.push(['rail', [1, 0], { n: 'V_{CC}' }]);
      if (o.RE) e.push(['R', [1, 2], [1, 3.2], { n: o.RE === true ? 'R_E' : o.RE }], ['gnd', [1, 3.2]]);
      else e.push(['gnd', [1, 2]]);
    } else {
      e.push(['pnp', [1, 1], { n: o.n || '' }]);
      if (o.RE) e.push(['R', [1, -1.2], [1, 0], { n: o.RE === true ? 'R_E' : o.RE }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
      else e.push(['rail', [1, 0], { n: 'V_{CC}' }]);
      if (o.RC) e.push(['R', [1, 2], [1, 3.2], { n: o.RC === true ? 'R_C' : o.RC }], ['gnd', [1, 3.2]]);
      else e.push(['gnd', [1, 2]]);
    }
    if (o.RB) e.push(['R', [-1.3, 1], [0, 1], { n: o.RB === true ? 'R_B' : o.RB }], ['w', [-1.3, 1], [-1.8, 1]], inL([-1.8, 1], o.look));
    else e.push(['w', [0, 1], [-0.7, 1]], inL([-0.7, 1], o.look));
    return e;
  }
  // Looking into the emitter, base held (through R_B). o: { RB, RC, pnp }
  function lookE(o = {}) {
    const e = [];
    const base = o.RB ? [['R', [-1.3, 1], [0, 1], { n: o.RB === true ? 'R_B' : o.RB }], ['acg', [-1.3, 1]]] : [['acg', [0, 1]]];
    if (!o.pnp) {
      e.push(['npn', [1, 1], { n: o.n || '' }], ...base);
      if (o.RC) e.push(['R', [1, -1.2], [1, 0], { n: o.RC === true ? 'R_C' : o.RC }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
      else e.push(['rail', [1, 0], { n: 'V_{CC}' }]);
      e.push(['w', [1, 2], [1, 2.5]], upA([1, 2.5], o.look));
    } else {
      e.push(['pnp', [1, 1], { n: o.n || '' }], ...base);
      if (o.RC) e.push(['R', [1, 2], [1, 3.2], { n: o.RC === true ? 'R_C' : o.RC }], ['gnd', [1, 3.2]]);
      else e.push(['gnd', [1, 2]]);
      e.push(['w', [1, 0], [1, -0.5]], dnA([1, -0.5], o.look));
    }
    return e;
  }
  // Looking into the collector, base held (through R_B), R_E optional. o: { RE, RB, pnp }
  function lookC(o = {}) {
    const e = [];
    const base = o.RB ? [['R', [-1.3, 1], [0, 1], { n: o.RB === true ? 'R_B' : o.RB }], ['acg', [-1.3, 1]]] : [['acg', [0, 1]]];
    if (!o.pnp) {
      e.push(['npn', [1, 1], { n: o.n || '' }], ...base);
      if (o.RE) e.push(['R', [1, 2], [1, 3.2], { n: o.RE === true ? 'R_E' : o.RE }], ['gnd', [1, 3.2]]);
      else e.push(['gnd', [1, 2]]);
      e.push(['w', [1, 0], [1, -0.5]], dnA([1, -0.5], o.look));
    } else {
      e.push(['pnp', [1, 1], { n: o.n || '' }], ...base);
      if (o.RE) e.push(['R', [1, -1.2], [1, 0], { n: o.RE === true ? 'R_E' : o.RE }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
      else e.push(['rail', [1, 0], { n: 'V_{CC}' }]);
      e.push(['w', [1, 2], [1, 2.5]], upA([1, 2.5], o.look));
    }
    return e;
  }
  // Diode-connected BJT. o: { RB (collector-to-base resistor), RE, pnp }
  function diode(o = {}) {
    const e = [];
    if (!o.pnp) {
      if (o.RB) e.push(['npn', [1, 1], { n: o.n || '' }], ['R', [0, 1], [0, -0.4], { n: o.RB === true ? 'R_B' : o.RB, side: 'l' }], ['w', [0, -0.4], [1, -0.4], [1, 0]], ['w', [1, -0.4], [1, -0.9]], dnA([1, -0.9], o.look));
      else e.push(['npn', [1, 1], { n: o.n || '', dc: true }], ['w', [1, 0], [1, -0.5]], dnA([1, -0.5], o.look));
      if (o.RE) e.push(['R', [1, 2], [1, 3.2], { n: o.RE === true ? 'R_E' : o.RE }], ['gnd', [1, 3.2]]);
      else e.push(['gnd', [1, 2]]);
    } else {
      e.push(['rail', [1, 0], { n: 'V_{CC}' }]);
      if (o.RB) e.push(['pnp', [1, 1], { n: o.n || '' }], ['R', [0, 1], [0, 2.4], { n: o.RB === true ? 'R_B' : o.RB, side: 'l' }], ['w', [0, 2.4], [1, 2.4], [1, 2]], ['w', [1, 2.4], [1, 2.9]], upA([1, 2.9], o.look));
      else e.push(['pnp', [1, 1], { n: o.n || '', dc: true }], ['w', [1, 2], [1, 2.5]], upA([1, 2.5], o.look));
    }
    return e;
  }

  window.BK6 = { ss, lookB, lookE, lookC, diode, term, inL, upA, dnA, vinAt, KO, RT, MS, MA, VV, VT, f, par };

  // ================================================================ answer boxes
  // A resistance answer in a sensible unit. accepts: other forms that count as right (the beta >> 1 forms; only those
  // within 4% of the exact value are kept); traps: known slips with a message (kept only if more than 3% away from
  // every accepted value, so a trap can never block a right answer).
  function resBox(lbl, exact, accepts = [], traps = []) {
    const [unit, s] = exact < 1e3 ? ['Ω', 1] : exact < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6];
    const p = { lbl, unit, ans: exact * s };
    const acc = accepts.filter((a) => isFinite(a) && Math.abs(a - exact) > 0.01 * exact && Math.abs(a - exact) < 0.04 * exact);
    if (acc.length) p.accept = acc.map((a) => a * s);
    const good = [exact, ...acc];
    const t = traps.filter((x) => isFinite(x.v) && x.v > 0 && good.every((v) => Math.abs(x.v - v) > 0.03 * v));
    if (t.length) p.traps = t.map((x) => ({ v: x.v * s, msg: x.msg }));
    return p;
  }
  // a plain number box (gains, mS, mA): same rules for accepts and traps
  function numBox(lbl, unit, ans, accepts = [], traps = []) {
    const p = { lbl, unit, ans };
    const acc = accepts.filter((a) => isFinite(a) && Math.abs(a - ans) > 0.01 * Math.abs(ans) && Math.abs(a - ans) < 0.04 * Math.abs(ans));
    if (acc.length) p.accept = acc;
    const good = [ans, ...acc];
    const t = traps.filter((x) => isFinite(x.v) && good.every((v) => Math.abs(x.v - v) > 0.03 * Math.abs(v)));
    if (t.length) p.traps = t;
    return p;
  }

  // ================================================================ one random BJT
  const dev = (IC, beta, VA) => { const gm = IC / VT; return { IC, beta, VA: VA || Infinity, gm, rpi: beta / gm, ro: VA ? VA / IC : Infinity, re: beta / ((beta + 1) * gm) }; };
  const randDev = (o = {}) => dev(pick(o.IC || [0.25, 0.5, 1, 1, 2]) * 1e-3, pick(o.beta || [50, 80, 100, 100, 120, 150, 200]), pick(o.VA || [25, 50, 100]));
  const devLine = (q, ro) => `$I_C = ${MA(q.IC)}$, $\\beta = ${q.beta}$${ro ? `, $V_A = ${q.VA}\\,\\text{V}$` : ''}`;
  const devSteps = (q, ro) => `$g_m = \\dfrac{I_C}{V_T} = \\dfrac{${MA(q.IC)}}{25\\,\\text{mV}} = ${MS(q.gm)}$, $\\;r_\\pi = \\dfrac{\\beta}{g_m} = \\dfrac{${q.beta}}{${MS(q.gm)}} = ${RT(q.rpi)}$${ro ? `, $\\;r_o = \\dfrac{V_A}{I_C} = ${RT(q.ro)}$` : ''}.`;
  const nicR = [100, 200, 220, 330, 470, 500, 680, 1000, 1500, 2000, 2200, 3300, 4700, 5000, 10000, 20000];
  const Rname = (n, v) => ({ n, s: RT(v).replace(/\\,/g, '\\,') });

  // ================================================================ formulas (r_o = Infinity means "ignored")
  // looking into the base: R_B in series, Z_E between the emitter and ground (r_o in parallel when the collector is held)
  const fBase = (q, RB, ZE, withRo) => RB + q.rpi + (q.beta + 1) * (withRo ? par(ZE, q.ro) : ZE);
  // looking into the emitter: base through R_B; collector through R_C (with r_o) or held
  const fEmit = (q, RB, RC, withRo) => {
    if (!withRo) return (RB + q.rpi) / (q.beta + 1);
    if (!isFinite(RC)) return RB + q.rpi;
    return (RB + q.rpi) * (RC + q.ro) / (RB + RC + q.rpi + (q.beta + 1) * q.ro);
  };
  // looking into the collector: base through R_B, R_E under the emitter (r_o kept)
  const fColl = (q, RE, RB = 0) => {
    if (!isFinite(RE)) return q.ro * (1 + q.gm * q.rpi) + q.rpi + RB;
    const Rp = par(RE, q.rpi + RB);
    return q.ro * (1 + q.gm * Rp * q.rpi / (q.rpi + RB)) + Rp;
  };
  Object.assign(window.BK6, { resBox, numBox, dev, randDev, devLine, devSteps, fBase, fEmit, fColl });

  // ================================================================ bk8_base: looking into the base
  GENS.bk8_base = () => {
    const pnp = Math.random() < 0.35;
    const q = randDev();
    const variant = pick(['plain', 'plain', 'plain', 'ro', 'cs']);
    const RE = variant === 'cs' ? Infinity : pick([0, 100, 200, 220, 470, 500, 1000, 2000].filter((r) => variant === 'plain' || r > 0));
    const RB = pick([0, 0, 1000, 2000, 5000, 10000]);
    const withRo = variant !== 'plain';
    const R = fBase(q, RB, RE, withRo);
    const ZE = withRo ? par(RE, q.ro) : RE;
    // figure
    let fig;
    if (variant === 'cs') {
      fig = pnp ? [['I', [1, -1.2], [1, 0], { n: 'I_{EE}' }], ['rail', [1, -1.2], { n: 'V_{CC}' }], ['pnp', [1, 1]], ['gnd', [1, 2]]]
        : [['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1]], ['I', [1, 2], [1, 3.2], { n: 'I_{EE}' }], ['gnd', [1, 3.2]]];
      fig.push(...(RB ? [['R', [-1.3, 1], [0, 1], { n: 'R_B', s: RT(RB) }], ['w', [-1.3, 1], [-1.8, 1]], inL([-1.8, 1])] : [['w', [0, 1], [-0.7, 1]], inL([-0.7, 1])]));
    } else fig = lookB({ pnp, RE: RE ? `R_E = ${RT(RE)}` : false, RB: RB ? `R_B = ${RT(RB)}` : false });
    const what = variant === 'cs' ? `The emitter is biased by an ideal current source${pnp ? ' from $V_{CC}$' : ''}; keep $r_o$ (the collector is at incremental ground).`
      : variant === 'ro' ? 'Keep $r_o$ (the collector is at incremental ground).' : 'Ignore $r_o$.';
    const q1 = `A${pnp ? ' PNP' : 'n NPN'} runs at ${devLine(q, withRo)}. ${RE && isFinite(RE) ? `$R_E = ${RT(RE)}$ ${pnp ? 'connects the emitter to $V_{CC}$' : 'connects the emitter to ground'}` : variant === 'cs' ? '' : 'The emitter is on its rail'}${RB ? `${RE && isFinite(RE) ? ', and ' : variant === 'cs' ? '' : '; '}$R_B = ${RT(RB)}$ is in series with the base` : ''}${(RE && isFinite(RE)) || RB || variant !== 'cs' ? '. ' : ''}${what} Find $r_\\pi$ and the resistance looking into the base.`;
    const accB = RB + q.rpi + q.beta * ZE;                                // beta instead of beta + 1
    const traps = [
      { v: RB + q.rpi + (isFinite(ZE) ? ZE : 0), msg: 'That adds the emitter-side resistance once. It carries $(\\beta + 1)$ times the base current, so it counts $\\beta + 1$ times.' },
      { v: (q.beta + 1) * (RB + q.rpi) + (q.beta + 1) * ZE, msg: 'Only the emitter side is multiplied by $\\beta + 1$. $R_B$ and $r_\\pi$ carry the base current itself.' },
      { v: RB + q.rpi, msg: 'That ignores what hangs under the emitter.' },
    ];
    if (variant === 'cs') traps.push({ v: RB + q.rpi + q.ro, msg: '$r_o$ is on the emitter side here (the collector is grounded for signals), so it is multiplied by $\\beta + 1$.' });
    const parts = [resBox('r_\\pi', q.rpi), resBox('R_{in}', R, [accB], traps)];
    const ZEtex = variant === 'cs' ? 'r_o' : variant === 'ro' ? 'R_E\\parallel r_o' : 'R_E';
    const sol = `**1. The device.** ${devSteps(q, withRo)}

**2. What lies under the emitter?** ${variant === 'cs' ? `The current source is open for signals, so the only path from the emitter to incremental ground is $r_o$ (to the ${pnp ? 'collector, which is grounded' : 'collector on $V_{CC}$'}): $Z_E = r_o = ${RT(q.ro)}$.`
      : variant === 'ro' ? `$R_E$ to ${pnp ? '$V_{CC}$' : 'ground'} and $r_o$ to the held collector, in parallel: $Z_E = R_E\\parallel r_o = ${RT(ZE)}$.`
        : RE ? `$R_E = ${RT(RE)}$ to ${pnp ? '$V_{CC}$, which is incremental ground' : 'ground'}.` : 'Nothing: the emitter is on its rail, $Z_E = 0$.'}${pnp ? ' (A PNP is drawn upside down, but its small-signal model is the NPN\'s.)' : ''}

**3. Look in.** The base current $i_t$ flows through ${RB ? '$R_B$ and ' : ''}$r_\\pi$; the emitter side carries $(\\beta + 1)i_t$:
$$R_{in} = ${RB ? 'R_B + ' : ''}r_\\pi${ZE ? ` + (\\beta + 1)(${ZEtex})` : ''} = ${RB ? `${RT(RB)} + ` : ''}${RT(q.rpi)}${ZE ? ` + ${q.beta + 1}\\times${RT(ZE)}` : ''} = ${RT(R)}$$
${ZE ? `The emitter side contributes $${RT((q.beta + 1) * ZE)}$ of it. (With $\\beta$ in place of $\\beta + 1$: $${RT(accB)}$, also accepted.)` : 'With the emitter on its rail the base sees only the junction.'}`;
    return { fig, q: q1, parts, hints: ['Find $g_m$ and $r_\\pi$ first.', 'From the base: $R_B + r_\\pi + (\\beta + 1)\\times$(whatever lies between the emitter and incremental ground).'], sol, _v: { g: 'base', pnp, IC: q.IC, beta: q.beta, VA: q.VA, RE, RB, withRo } };
  };

  // ================================================================ bk8_emit: looking into the emitter
  GENS.bk8_emit = () => {
    const pnp = Math.random() < 0.35;
    const q = randDev();
    const variant = pick(['plain', 'plain', 'plain', 'ro', 'RC', 'cs']);
    const RB = pick(variant === 'plain' ? [0, 1000, 2000, 5000, 10000, 20000] : [0, 0, 1000, 5000, 10000]);
    const withRo = variant !== 'plain';
    const RC = variant === 'RC' ? pick([2000, 5000, 10000, 20000, 50000]) : variant === 'cs' ? Infinity : 0;
    const R = fEmit(q, RB, RC, withRo);
    let fig;
    if (variant === 'cs') {
      const base = RB ? [['R', [-1.3, 1], [0, 1], { n: 'R_B', s: RT(RB) }], ['acg', [-1.3, 1]]] : [['acg', [0, 1]]];
      fig = pnp ? [['pnp', [1, 1]], ...base, ['I', [1, 2], [1, 3.2], { n: 'I_C' }], ['gnd', [1, 3.2]], ['w', [1, 0], [1, -0.5]], dnA([1, -0.5])]
        : [['npn', [1, 1]], ...base, ['I', [1, -1.2], [1, 0], { n: 'I_C' }], ['rail', [1, -1.2], { n: 'V_{CC}' }], ['w', [1, 2], [1, 2.5]], upA([1, 2.5])];
    } else fig = lookE({ pnp, RB: RB ? `R_B = ${RT(RB)}` : false, RC: variant === 'RC' ? `R_C = ${RT(RC)}` : false });
    const where = variant === 'cs' ? `An ideal current source feeds the collector; keep $r_o$.`
      : variant === 'RC' ? `$R_C = ${RT(RC)}$ is on the collector; keep $r_o$.` : variant === 'ro' ? 'The collector is on its rail; keep $r_o$.' : 'Ignore $r_o$.';
    const qq = `A${pnp ? ' PNP' : 'n NPN'} runs at ${devLine(q, withRo)}. Its base is ${RB ? `held through $R_B = ${RT(RB)}$` : 'held (incremental ground)'}. ${where} Find $r_\\pi$ and the resistance looking into the emitter.`;
    const accs = [];
    if (variant === 'plain') accs.push(1 / q.gm + RB / q.beta, 1 / q.gm + RB / (q.beta + 1));
    if (variant === 'ro') accs.push(par(q.ro, 1 / q.gm + RB / q.beta), (RB + q.rpi) / (q.beta + 1));
    if (variant === 'RC') accs.push((RB + q.rpi) / (q.beta + 1) * (1 + RC / q.ro), (1 / q.gm + RB / q.beta) * (1 + RC / q.ro));
    const traps = [
      { v: 1 / q.gm, msg: RB ? 'That is $1/g_m$ alone: the base resistor adds $R_B/(\\beta + 1)$.' : 'Close to the right size; check the collector side.' },
      { v: RB + q.rpi, msg: 'That is the resistance of the base loop. Seen from the emitter it is divided by $\\beta + 1$.' },
      { v: (q.beta + 1) * (RB + q.rpi), msg: 'Multiplying by $\\beta + 1$ is the rule for looking into the base. From the emitter, divide.' },
    ].filter((t) => variant !== 'cs' || t.v !== RB + q.rpi);
    if (variant === 'cs') traps.push({ v: (RB + q.rpi) / (q.beta + 1), msg: 'That assumes the collector current can change. The current source pins it, so every change of emitter current is base current.' });
    const parts = [resBox('r_\\pi', q.rpi), resBox('R', R, accs, traps)];
    let step;
    if (variant === 'plain') step = `$$R = \\frac{R_B + r_\\pi}{\\beta + 1} = \\frac{${RT(RB)} + ${RT(q.rpi)}}{${q.beta + 1}} = ${RT(R)}$$${RB ? `Split it: $r_e = r_\\pi/(\\beta + 1) = ${RT(q.rpi / (q.beta + 1))}$ from the junction, $R_B/(\\beta + 1) = ${RT(RB / (q.beta + 1))}$ from the base resistor.` : 'That is $r_e\\approx1/g_m$.'}`;
    else if (variant === 'ro') step = `$r_o$ runs from the emitter to the held collector: one more path to ground, in parallel.
$$R = r_o\\parallel\\frac{R_B + r_\\pi}{\\beta + 1} = ${RT(q.ro)}\\parallel${RT((RB + q.rpi) / (q.beta + 1))} = ${RT(R)}$$`;
    else if (variant === 'RC') step = `With $R_C$ and $r_o$ the exact result is
$$R = \\frac{(R_B + r_\\pi)(R_C + r_o)}{R_B + R_C + r_\\pi + (\\beta + 1)r_o} = \\frac{(${RT(RB + q.rpi)})(${RT(RC + q.ro)})}{${RT(RB + RC + q.rpi + (q.beta + 1) * q.ro)}} = ${RT(R)}$$
The estimate $\\dfrac{R_B + r_\\pi}{\\beta + 1}\\Big(1 + \\dfrac{R_C}{r_o}\\Big) = ${RT((RB + q.rpi) / (q.beta + 1) * (1 + RC / q.ro))}$ is also accepted.`;
    else step = `The current source pins the collector current, so a change of emitter current can only be base current, through ${RB ? '$r_\\pi$ and $R_B$' : '$r_\\pi$'} (let $R_C\\to\\infty$ in the exact formula):
$$R = R_B + r_\\pi = ${RT(R)}$$
Not small at all: compare $r_e = ${RT(q.re)}$ with the collector free to move.`;
    const sol = `**1. The device.** ${devSteps(q, withRo)}

**2. Look in.** The base path (${RB ? '$R_B$ and ' : ''}$r_\\pi$) carries $i_x$, the controlled source adds $\\beta i_x$, so the emitter divides the base side by $\\beta + 1$.${pnp ? ' (PNP: the emitter is on top, but the model is the NPN\'s.)' : ''}
${step}`;
    return { fig, q: qq, parts, hints: ['$r_\\pi = \\beta/g_m$.', 'From the emitter: $(R_B + r_\\pi)/(\\beta + 1)$, then think about what $r_o$ and the collector side add.'], sol, _v: { g: 'emit', pnp, IC: q.IC, beta: q.beta, VA: q.VA, RB, RC, withRo } };
  };

  // ================================================================ bk8_elev: the (beta + 1) rule through two transistors
  GENS.bk8_elev = () => {
    const kind = pick(['darlIn', 'darlOut', 'pair', 'pair', 'follow']);
    const beta = pick([50, 100, 100, 150, 200]);
    const vb = { g: 'elev', kind, beta };
    let fig, qq, parts, sol, hints;
    if (kind === 'darlIn' || kind === 'darlOut') {
      const IC2 = pick([0.5, 1, 2, 4]) * 1e-3;
      const q2 = dev(IC2, beta), IC1 = (beta / (beta + 1)) * IC2 / beta, q1 = dev(IC1, beta);
      Object.assign(vb, { IC2 });
      if (kind === 'darlIn') {
        const RE = pick([100, 200, 500, 1000, 2000]);
        vb.RE = RE;
        const R2 = q2.rpi + (beta + 1) * RE, Rin = q1.rpi + (beta + 1) * R2;
        fig = [['npn', [1, 1], { n: 'Q_1' }], ['npn', [2, 3], { n: 'Q_2' }], ['w', [1, 2], [1, 3]], ['w', [1, 0], [1, -0.4], [2, -0.4], [2, 2]], ['rail', [1.5, -0.4], { n: 'V_{CC}' }],
          ['R', [2, 4], [2, 5.2], { n: 'R_E', s: RT(RE) }], ['gnd', [2, 5.2]], ['w', [0, 1], [-0.7, 1]], inL([-0.7, 1])];
        qq = `A Darlington pair: $Q_1$'s emitter drives $Q_2$'s base, both collectors on $V_{CC}$, $R_E = ${RT(RE)}$ under $Q_2$. $Q_2$ runs at $I_{C2} = ${MA(IC2)}$; $\\beta = ${beta}$ for both; $r_o\\to\\infty$. Find $r_{\\pi2}$, $r_{\\pi1}$, the resistance looking into $Q_2$'s base, and $R_{in}$ at $Q_1$'s base.`;
        const accIn = beta * q2.rpi + beta * (q2.rpi + beta * RE);
        parts = [resBox('r_{\\pi2}', q2.rpi), resBox('r_{\\pi1}', q1.rpi, [beta * q2.rpi]), resBox('R_{in2}', R2, [q2.rpi + beta * RE], [{ v: q2.rpi + RE, msg: '$R_E$ counts $\\beta + 1$ times from $Q_2$\'s base.' }]),
          resBox('R_{in}', Rin, [accIn], [{ v: q1.rpi + (beta + 1) * RE, msg: 'That skips a floor: under $Q_1$\'s emitter is all of $Q_2$\'s input, $r_{\\pi2} + (\\beta + 1)R_E$.' }, { v: R2, msg: 'That is one floor ($Q_2$ alone). $Q_1$ multiplies it by $\\beta + 1$ again.' }, { v: q2.rpi + q2.rpi + 2 * (beta + 1) * RE, msg: 'The multipliers compound: $(\\beta + 1)^2$, not $2(\\beta + 1)$.' }])];
        sol = `**1. The two transistors.** $g_{m2} = ${MS(q2.gm)}$, $r_{\\pi2} = \\beta/g_{m2} = ${RT(q2.rpi)}$. $Q_1$ supplies $Q_2$'s base current: $I_{E1} = I_{C2}/\\beta = ${f(IC2 / beta * 1e6, 4)}\\,\\mu\\text{A}$, so $I_{C1} = \\alpha I_{E1} = ${f(IC1 * 1e6, 4)}\\,\\mu\\text{A}$ and $r_{\\pi1} = \\beta V_T/I_{C1} = ${RT(q1.rpi)}$ $= (\\beta + 1)r_{\\pi2}$.

**2. First floor (into $Q_2$'s base):** $R_{in2} = r_{\\pi2} + (\\beta + 1)R_E = ${RT(q2.rpi)} + ${beta + 1}\\times${RT(RE)} = ${RT(R2)}$.

**3. Second floor (into $Q_1$'s base):** $R_{in2}$ hangs under $Q_1$'s emitter, so
$$R_{in} = r_{\\pi1} + (\\beta + 1)R_{in2} = ${RT(q1.rpi)} + ${beta + 1}\\times${RT(R2)} = ${RT(Rin)}$$
About $\\beta^2R_E = ${RT(beta * beta * RE)}$, plus the two $r_\\pi$ terms.`;
        hints = ['$I_{E1} = I_{B2}$, so $Q_1$ runs at $1/\\beta$ of $Q_2$\'s current: $r_{\\pi1} = (\\beta + 1)r_{\\pi2}$.', 'Ride up from the bottom: into $Q_2$\'s base first.'];
      } else {
        const RB = pick([10, 20, 50, 100, 200]) * 1e3;
        vb.RB = RB;
        const R1 = (RB + q1.rpi) / (beta + 1), R = (q2.rpi + R1) / (beta + 1);
        fig = [['npn', [1, 1], { n: 'Q_1' }], ['npn', [2, 3], { n: 'Q_2' }], ['w', [1, 2], [1, 3]], ['w', [1, 0], [1, -0.4], [2, -0.4], [2, 2]], ['rail', [1.5, -0.4], { n: 'V_{CC}' }],
          ['R', [-1.3, 1], [0, 1], { n: 'R_B', s: RT(RB) }], ['acg', [-1.3, 1]], ['w', [2, 4], [2, 4.5]], upA([2, 4.5])];
        qq = `A Darlington pair with $Q_1$'s base held through $R_B = ${RT(RB)}$. $Q_2$ runs at $I_{C2} = ${MA(IC2)}$, $\\beta = ${beta}$ for both, $r_o\\to\\infty$. Find $r_{\\pi1}$, the resistance looking into $Q_1$'s emitter, and the resistance looking up into $Q_2$'s emitter.`;
        parts = [resBox('r_{\\pi1}', q1.rpi, [beta * q2.rpi]), resBox('R_{e1}', R1, [1 / q1.gm + RB / beta], [{ v: RB + q1.rpi, msg: 'From $Q_1$\'s emitter the base side is divided by $\\beta + 1$.' }]),
          resBox('R', R, [(q2.rpi + 1 / q1.gm + RB / beta) / beta], [{ v: R1, msg: 'That is one floor down. Add $r_{\\pi2}$ and divide by $\\beta + 1$ again.' }, { v: q2.re, msg: 'That is $Q_2$\'s $r_e$ alone, as if its base were grounded.' }])];
        sol = `**1. The two transistors.** $r_{\\pi2} = ${RT(q2.rpi)}$ at $${MA(IC2)}$; $Q_1$ runs at $I_{C1} = \\alpha I_{C2}/\\beta = ${f(IC1 * 1e6, 4)}\\,\\mu\\text{A}$, so $r_{\\pi1} = (\\beta + 1)r_{\\pi2} = ${RT(q1.rpi)}$.

**2. First floor down (into $Q_1$'s emitter):** $R_{e1} = \\dfrac{R_B + r_{\\pi1}}{\\beta + 1} = \\dfrac{${RT(RB + q1.rpi)}}{${beta + 1}} = ${RT(R1)}$.

**3. Second floor down:** $R_{e1}$ is $Q_2$'s base resistance:
$$R = \\frac{r_{\\pi2} + R_{e1}}{\\beta + 1} = \\frac{${RT(q2.rpi + R1)}}{${beta + 1}} = ${RT(R)}$$
$R_B$ arrives divided by $(\\beta + 1)^2$: worth only $${RT(RB / (beta + 1) / (beta + 1))}$ at the bottom.`;
        hints = ['$r_{\\pi1} = (\\beta + 1)r_{\\pi2}$: $Q_1$ runs at $1/\\beta$ of $Q_2$\'s current.', 'Ride down: first $Q_1$\'s emitter, then $Q_2$\'s emitter.'];
      }
    } else if (kind === 'pair') {
      const IEE = pick([0.5, 1, 2, 4]) * 1e-3;
      const q = dev(IEE / 2 * beta / (beta + 1), beta);
      const RB1 = pick([0, 0, 1000, 5000, 10000]), RB2 = pick([0, 0, 1000, 5000, 10000]);
      Object.assign(vb, { IEE, RB1, RB2 });
      const Ze = (RB2 + q.rpi) / (beta + 1), Rin = RB1 + q.rpi + (beta + 1) * Ze;
      fig = [['rail', [1, 0], { n: 'V_{CC}' }], ['rail', [3, 0], { n: 'V_{CC}' }], ['npn', [1, 1], { n: 'Q_1' }], ['npn', [3, 1], { n: 'Q_2', flip: true }],
        ['w', [1, 2], [1, 2.4], [3, 2.4], [3, 2]], ['I', [2, 2.4], [2, 3.6], { n: 'I_{EE}', s: MA(IEE) }], ['gnd', [2, 3.6]],
        ...(RB2 ? [['R', [4, 1], [5.3, 1], { n: 'R_{B2}', s: RT(RB2) }], ['acg', [5.3, 1]]] : [['acg', [4, 1]]]),
        ...(RB1 ? [['R', [-1.3, 1], [0, 1], { n: 'R_{B1}', s: RT(RB1) }], ['w', [-1.3, 1], [-1.8, 1]], inL([-1.8, 1])] : [['w', [0, 1], [-0.7, 1]], inL([-0.7, 1])])];
      qq = `Two matched NPNs share their emitters; an ideal source $I_{EE} = ${MA(IEE)}$ biases them and splits equally. ${RB2 ? `$Q_2$'s base is held through $R_{B2} = ${RT(RB2)}$` : '$Q_2$\'s base is held'}${RB1 ? `, and $R_{B1} = ${RT(RB1)}$ is in series with $Q_1$'s base` : ''}. $\\beta = ${beta}$, $r_o\\to\\infty$. Find $r_\\pi$, the resistance $Q_1$'s emitter sees looking into $Q_2$'s emitter, and $R_{in}$ at $Q_1$'s base.`;
      parts = [resBox('r_\\pi', q.rpi, [beta * VT / (IEE / 2)]), resBox('Z_E', Ze, [(RB2 + beta * VT / (IEE / 2)) / (beta + 1), 2 * VT / IEE + RB2 / beta]),
        resBox('R_{in}', Rin, [RB1 + 2 * beta * VT / (IEE / 2) + RB2], [{ v: RB1 + q.rpi, msg: 'That treats $Q_1$\'s emitter as grounded. It sees $Q_2$\'s emitter.' }, { v: RB1 + q.rpi + (beta + 1) * (RB2 + q.rpi), msg: 'From $Q_1$\'s emitter, $Q_2$ looks like its **emitter** (divided by $\\beta + 1$), not its base.' }])];
      sol = `**1. The device.** Each transistor carries $I_E = I_{EE}/2 = ${MA(IEE / 2)}$, so $I_C = \\alpha I_E = ${MA(q.IC)}$, $g_m = ${MS(q.gm)}$, $r_\\pi = ${RT(q.rpi)}$ (rounding $I_C$ to $${MA(IEE / 2)}$ gives $${RT(beta * VT / (IEE / 2))}$: fine).

**2. Down into $Q_2$'s emitter** (base held${RB2 ? ' through $R_{B2}$' : ''}): $Z_E = \\dfrac{${RB2 ? 'R_{B2} + ' : ''}r_\\pi}{\\beta + 1} = ${RT(Ze)}$. The tail source is open for signals.

**3. Up into $Q_1$'s base:**
$$R_{in} = ${RB1 ? 'R_{B1} + ' : ''}r_\\pi + (\\beta + 1)Z_E = ${RB1 ? `${RT(RB1)} + ` : ''}${RT(q.rpi)} + ${RT((beta + 1) * Ze)} = ${RT(Rin)}$$
${RB2 ? '$R_{B2}$ went down one floor and came back up: it appears at full size.' : 'For a matched pair: $2r_\\pi$.'}`;
      hints = ['Each transistor runs at half of $I_{EE}$.', 'Down into $Q_2$\'s emitter (divide), then up into $Q_1$\'s base (multiply).'];
    } else {
      const IC1 = pick([0.25, 0.5, 1]) * 1e-3, IC2 = pick([0.5, 1, 2]) * 1e-3, RE2 = pick([100, 200, 470, 1000]);
      const q1 = dev(IC1, beta), q2 = dev(IC2, beta);
      Object.assign(vb, { IC1, IC2, RE2 });
      const R2 = q2.rpi + (beta + 1) * RE2, R1 = q1.rpi + (beta + 1) * R2;
      fig = [['rail', [1, 0], { n: 'V_{CC}' }], ['npn', [1, 1], { n: 'Q_1' }], ['w', [1, 2], [1, 3], [2, 3]], ['I', [1, 3], [1, 4.4], { n: 'I_1' }], ['gnd', [1, 4.4]],
        ['npn', [3, 3], { n: 'Q_2' }], ['R', [3, 4], [3, 5.2], { n: 'R_{E2}', s: RT(RE2) }], ['gnd', [3, 5.2]], ['R', [3, 0.6], [3, 2], { n: 'R_C' }], ['rail', [3, 0.6], { n: 'V_{CC}' }],
        ['w', [3, 2], [3.8, 2]], ['term', [3.8, 2], { n: 'v_{out}', side: 'r' }], ['w', [0, 1], [-0.7, 1]], inL([-0.7, 1])];
      qq = `An emitter follower $Q_1$ ($I_{C1} = ${MA(IC1)}$, biased by its own current source $I_1$) drives the base of $Q_2$ ($I_{C2} = ${MA(IC2)}$, $R_{E2} = ${RT(RE2)}$ under its emitter). $\\beta = ${beta}$, $r_o\\to\\infty$. Find the resistance looking into $Q_2$'s base and into $Q_1$'s base.`;
      parts = [resBox('R_{in2}', R2, [q2.rpi + beta * RE2], [{ v: q2.rpi + RE2, msg: '$R_{E2}$ counts $\\beta + 1$ times from $Q_2$\'s base.' }]),
        resBox('R_{in1}', R1, [q1.rpi + beta * (q2.rpi + beta * RE2)], [{ v: q1.rpi + R2, msg: '$R_{in2}$ hangs under $Q_1$\'s emitter: it is multiplied by $\\beta + 1$.' }, { v: q1.rpi + (beta + 1) * q2.rpi, msg: 'That forgets $Q_2$\'s own emitter resistor.' }])];
      sol = `**1. Devices.** $r_{\\pi1} = \\beta V_T/I_{C1} = ${RT(q1.rpi)}$, $r_{\\pi2} = ${RT(q2.rpi)}$.

**2. Into $Q_2$'s base:** $R_{in2} = r_{\\pi2} + (\\beta + 1)R_{E2} = ${RT(q2.rpi)} + ${beta + 1}\\times${RT(RE2)} = ${RT(R2)}$.

**3. Into $Q_1$'s base.** $I_1$ is open for signals, so $Q_1$'s emitter sees only $R_{in2}$:
$$R_{in1} = r_{\\pi1} + (\\beta + 1)R_{in2} = ${RT(q1.rpi)} + ${beta + 1}\\times${RT(R2)} = ${RT(R1)}$$`;
      hints = ['A current source is open for signals.', 'Bottom up: $Q_2$\'s base first.'];
    }
    return { fig, q: qq, parts, hints, sol, _v: vb };
  };
})();

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

  // One amplifier stage at transistor level. o.kind: 'ce' | 'cb' | 'cc'; o.pnp (ce, cc); o.RB (series base resistor, or
  // for cb the base resistor to incremental ground); o.RE (ce: emitter resistor; cb: source resistance in series with
  // v_in; cc: the emitter resistor); o.RC; o.load 'pnp' (an active PNP load instead of R_C, NPN ce); o.RL (a load).
  // Labels: pass a TeX string, or true for the default name.
  function amp(o = {}) {
    const e = [], lab = (v, d) => (v === true || v === undefined ? d : v);
    const pnp = !!o.pnp;
    let out;
    e.push([pnp ? 'pnp' : 'npn', [1, 1], { n: o.n || '' }]);
    if (o.kind === 'cc') {
      if (!pnp) { e.push(['rail', [1, 0], { n: 'V_{CC}' }], ['R', [1, 2], [1, 3.2], { n: lab(o.RE, 'R_E'), side: 'l' }], ['gnd', [1, 3.2]]); out = [1, 2]; }
      else { e.push(['gnd', [1, 2]], ['R', [1, -1.2], [1, 0], { n: lab(o.RE, 'R_E'), side: 'l' }], ['rail', [1, -1.2], { n: 'V_{CC}' }]); out = [1, 0]; }
    } else if (o.kind === 'cb') {
      e.push(['R', [1, -1.2], [1, 0], { n: lab(o.RC, 'R_C'), side: 'l' }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
      if (o.RE) e.push(['R', [1, 2], [1, 3.2], { n: lab(o.RE, 'R_E'), side: 'l' }], ['Vac', [1, 3.2], [1, 4.2], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.2]]);
      else e.push(['Vac', [1, 2], [1, 3], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 3]]);
      e.push(...(o.RB ? [['R', [-1.3, 1], [0, 1], { n: lab(o.RB, 'R_B') }], ['acg', [-1.3, 1]]] : [['acg', [0, 1]]]));
      out = [1, 0];
    } else if (!pnp) {
      if (o.load === 'pnp') e.push(['pnp', [1, -1], { n: 'Q_2' }], ['acg', [0, -1]], ['rail', [1, -2], { n: 'V_{CC}' }]);
      else e.push(['R', [1, -1.2], [1, 0], { n: lab(o.RC, 'R_C'), side: 'l' }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
      e.push(...(o.RE ? [['R', [1, 2], [1, 3.2], { n: lab(o.RE, 'R_E'), side: 'l' }], ['gnd', [1, 3.2]]] : [['gnd', [1, 2]]]));
      out = [1, 0];
    } else {
      e.push(['R', [1, 2], [1, 3.2], { n: lab(o.RC, 'R_C'), side: 'l' }], ['gnd', [1, 3.2]]);
      e.push(...(o.RE ? [['R', [1, -1.2], [1, 0], { n: lab(o.RE, 'R_E'), side: 'l' }], ['rail', [1, -1.2], { n: 'V_{CC}' }]] : [['rail', [1, 0], { n: 'V_{CC}' }]]));
      out = [1, 2];
    }
    if (o.kind !== 'cb') {
      if (o.RB) e.push(['R', [-1.3, 1], [0, 1], { n: lab(o.RB, 'R_B') }], ['w', [-1.3, 1], [-1.8, 1], [-1.8, 1.3]], ['Vac', [-1.8, 1.3], [-1.8, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.8, 2.3]]);
      else e.push(['w', [0, 1], [-0.6, 1], [-0.6, 1.3]], ['Vac', [-0.6, 1.3], [-0.6, 2.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.3]]);
    }
    const [ox, oy] = out;
    if (o.RL) e.push(['w', [ox, oy], [2.2, oy]], ['R', [2.2, oy], [2.2, oy + 1.2], { n: lab(o.RL, 'R_L') }], ['gnd', [2.2, oy + 1.2]], ['w', [2.2, oy], [2.8, oy]], ['term', [2.8, oy], { n: 'v_{out}' }]);
    else e.push(['w', [ox, oy], [1.8, oy]], ['term', [1.8, oy], { n: 'v_{out}' }]);
    return e;
  }
  // the cascode amplifier: Q_1 (input at its base) under Q_2 (base held); load R_C, an ideal source, or a PNP cascode
  function cascAmp(o = {}) {
    const e = [['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['gnd', [1, 4]], ['node', [1, 2], { n: 'X', side: 'r' }],
      ['w', [0, 3], [-0.6, 3], [-0.6, 3.3]], ['Vac', [-0.6, 3.3], [-0.6, 4.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 4.3]], ['w', [1, 0], [1.8, 0]], ['term', [1.8, 0], { n: 'v_{out}' }]];
    if (o.load === 'I') e.push(['I', [1, -1.2], [1, 0], { n: 'I_{C}' }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
    else if (o.load === 'pnp') e.push(['pnp', [1, -1], { n: 'Q_3' }], ['acg', [0, -1]], ['pnp', [1, -3], { n: 'Q_4' }], ['acg', [0, -3]], ['rail', [1, -4], { n: 'V_{CC}' }]);
    else e.push(['R', [1, -1.2], [1, 0], { n: o.RC || 'R_C', side: 'l' }], ['rail', [1, -1.2], { n: 'V_{CC}' }]);
    return e;
  }

  window.BK6 = { ss, lookB, lookE, lookC, diode, amp, cascAmp, term, inL, upA, dnA, vinAt, KO, RT, MS, MA, VV, VT, f, par };

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
  // ================================================================ bk8_coll: looking into the collector
  GENS.bk8_coll = () => {
    const pnp = Math.random() < 0.35;
    const q = randDev({ VA: [25, 40, 50, 100] });
    const variant = pick(['plain', 'RE', 'RE', 'RE', 'RB', 'ceil']);
    const RE = variant === 'plain' ? 0 : variant === 'ceil' ? Infinity : pick([100, 200, 500, 1000, 2000, 5000, 10000]);
    const RB = variant === 'RB' ? pick([1000, 2000, 5000, 10000]) : 0;
    const R = fColl(q, RE, RB);
    let fig;
    if (variant === 'ceil') {
      fig = pnp ? [['I', [1, -1.2], [1, 0], { n: 'I_{EE}' }], ['rail', [1, -1.2], { n: 'V_{CC}' }], ['pnp', [1, 1]], ['acg', [0, 1]], ['w', [1, 2], [1, 2.5]], upA([1, 2.5])]
        : [['npn', [1, 1]], ['acg', [0, 1]], ['I', [1, 2], [1, 3.2], { n: 'I_{EE}' }], ['gnd', [1, 3.2]], ['w', [1, 0], [1, -0.5]], dnA([1, -0.5])];
    } else fig = lookC({ pnp, RE: RE ? `R_E = ${RT(RE)}` : false, RB: RB ? `R_B = ${RT(RB)}` : false });
    const Rp = isFinite(RE) ? par(RE, q.rpi + RB) : q.rpi;
    const qq = `A${pnp ? ' PNP' : 'n NPN'} runs at ${devLine(q, true)}. Its base is ${RB ? `held through $R_B = ${RT(RB)}$` : 'held'}; ${variant === 'plain' ? 'its emitter is on its rail' : variant === 'ceil' ? 'its emitter is fed by an ideal current source' : `$R_E = ${RT(RE)}$ connects its emitter to ${pnp ? '$V_{CC}$' : 'ground'}`}. Find $r_o$ and the resistance looking into the collector.`;
    const traps = [{ v: q.ro, msg: 'That is $r_o$ alone. Something under the emitter degenerates it.' }];
    if (variant === 'RE') traps.push({ v: q.ro * (1 + q.gm * RE) + RE, msg: 'That is the MOSFET formula. The held base sits behind $r_\\pi$, in parallel with $R_E$: use $R_E\\parallel r_\\pi$.' });
    if (variant === 'RB') traps.push({ v: fColl(q, RE, 0), msg: 'That treats the base as held directly. Through $R_B$, only $r_\\pi/(r_\\pi + R_B)$ of the emitter\'s rise reaches $v_\\pi$.' });
    const accs = variant === 'ceil' ? [q.beta * q.ro, (q.beta + 1) * q.ro] : [];
    const parts = [resBox('r_o', q.ro), resBox('R', R, accs, variant === 'plain' ? [{ v: 1 / q.gm, msg: 'That is $1/g_m$: the emitter, not the collector.' }] : traps)];
    let step;
    if (variant === 'plain') step = `Base and emitter held: $v_\\pi = 0$, the controlled source is dead, $R = r_o = ${RT(R)}$.`;
    else if (variant === 'ceil') step = `The current source is open, so the emitter's only exit is $r_\\pi$ to the held base: every bit of $i_t$ becomes base current. That is the ceiling:
$$R = r_o(1 + g_mr_\\pi) + r_\\pi = (\\beta + 1)r_o + r_\\pi = ${RT(R)}$$`;
    else if (variant === 'RE') step = `$r_\\pi = ${RT(q.rpi)}$, so $R_E\\parallel r_\\pi = ${RT(Rp)}$ and $g_m(R_E\\parallel r_\\pi) = ${f(q.gm * Rp, 4)}$:
$$R = r_o\\big[1 + g_m(R_E\\parallel r_\\pi)\\big] + R_E\\parallel r_\\pi = ${RT(q.ro)}\\times${f(1 + q.gm * Rp, 4)} + ${RT(Rp)} = ${RT(R)}$$
${q.gm * RE > 1.05 * q.gm * Rp ? `(The MOSFET formula with $R_E$ would give $${RT(q.ro * (1 + q.gm * RE) + RE)}$: too high, because the base leaks part of the feedback.)` : ''}`;
    else step = `$r_\\pi = ${RT(q.rpi)}$. With the base behind $R_B$, the leak path is $r_\\pi + R_B = ${RT(q.rpi + RB)}$: the emitter rises by $i_t\\,(R_E\\parallel(r_\\pi + R_B)) = i_t\\times${RT(Rp)}$, and only $r_\\pi/(r_\\pi + R_B) = ${f(q.rpi / (q.rpi + RB), 3)}$ of that reaches $v_\\pi$:
$$R = r_o\\Big[1 + g_m\\frac{r_\\pi}{r_\\pi + R_B}\\big(R_E\\parallel(r_\\pi + R_B)\\big)\\Big] + R_E\\parallel(r_\\pi + R_B) = ${RT(R)}$$
With the base held directly it would be $${RT(fColl(q, RE, 0))}$.`;
    const sol = `**1. The device.** ${devSteps(q, true)}

**2. Look in.** ${pnp ? '(A PNP: upside down, same model.) ' : ''}${step}`;
    return { fig, q: qq, parts, hints: ['$r_o = V_A/I_C$, $r_\\pi = \\beta/g_m$.', 'The emitter rises by $i_t(R_E\\parallel r_\\pi)$; $r_o$ carries $i_t[1 + g_m(R_E\\parallel r_\\pi)]$.'], sol, _v: { g: 'coll', pnp, IC: q.IC, beta: q.beta, VA: q.VA, RE: isFinite(RE) ? RE : null, RB } };
  };

  // ================================================================ bk8_diode: the diode-connected BJT
  GENS.bk8_diode = () => {
    const variant = pick(['plain', 'plain', 'RB', 'RB', 'RE']);
    const pnp = variant !== 'RE' && Math.random() < 0.35;
    const withRo = variant !== 'RE' && Math.random() < 0.6;
    const q = randDev();
    const RB = variant === 'RB' ? pick([1000, 2000, 5000, 10000, 20000, 50000]) : 0;
    const RE = variant === 'RE' ? pick([50, 100, 200, 470, 1000]) : 0;
    const base = (RB + q.rpi) / (q.beta + 1);
    const R = variant === 'RE' ? base + RE : withRo ? par(q.ro, base) : base;
    const fig = diode({ pnp, RB: RB ? `R_B = ${RT(RB)}` : false, RE: RE ? `R_E = ${RT(RE)}` : false });
    const qq = `A diode-connected ${pnp ? 'PNP' : 'NPN'}${RB ? ` with $R_B = ${RT(RB)}$ from its collector to its base (instead of a wire)` : ''}${RE ? ` with $R_E = ${RT(RE)}$ from its emitter to ground` : ''} runs at ${devLine(q, withRo)}. ${withRo ? 'Keep $r_o$.' : 'Ignore $r_o$.'} Find the resistance looking in.`;
    const accs = variant === 'RE' ? [1 / q.gm + RE] : withRo ? [par(q.ro, 1 / q.gm + RB / q.beta), base] : [1 / q.gm + RB / q.beta];
    const traps = [{ v: q.rpi + RB, msg: 'That is the base path alone. The collector draws $\\beta$ times the base current too: divide by $\\beta + 1$.' }, { v: q.ro, msg: 'That is $r_o$: a collector with its base **held**. Here the base moves with the collector.' }];
    if (RE) traps.push({ v: base + (q.beta + 1) * RE, msg: 'From the top of the diode, $R_E$ carries the same current you supply: it adds once, not $\\beta + 1$ times.' }, { v: base, msg: 'That ignores $R_E$, which carries the whole current.' });
    if (RB) traps.push({ v: (q.rpi) / (q.beta + 1), msg: 'That ignores $R_B$: the base current flows through it.' });
    const parts = [resBox('R', R, accs, traps)];
    let step;
    if (variant === 'plain') step = withRo ? `$v_\\pi = v_t$, so the top node feeds $r_\\pi$, the controlled source ($g_mv_t$) and $r_o$:
$$R = \\frac{1}{g_m + 1/r_\\pi + 1/r_o} = \\frac{1}{${MS(q.gm)} + ${MS(1 / q.rpi)} + ${MS(1 / q.ro)}} = ${RT(R)}$$`
      : `$v_\\pi = v_t$; the top node feeds $r_\\pi$ and the controlled source: $R = r_\\pi\\parallel\\dfrac1{g_m} = \\dfrac{r_\\pi}{\\beta + 1} = ${RT(R)}\\approx1/g_m$.`;
    else if (variant === 'RB') step = `The base current $i_b = v_t/(R_B + r_\\pi)$ flows through $R_B$ and $r_\\pi$; the collector draws $\\beta i_b$ more:
$$\\frac{R_B + r_\\pi}{\\beta + 1} = \\frac{${RT(RB + q.rpi)}}{${q.beta + 1}} = ${RT(base)}$$
${withRo ? `In parallel with $r_o = ${RT(q.ro)}$: $R = ${RT(R)}$.` : `$R = ${RT(R)}$.`}`;
    else step = `The whole test current flows down through the junction ($r_e = r_\\pi/(\\beta + 1) = ${RT(base)}$) and then through $R_E$, in series:
$$R = r_e + R_E = ${RT(base)} + ${RT(RE)} = ${RT(R)}$$`;
    const sol = `**1. The device.** ${devSteps(q, withRo)}

**2. Look in.** ${pnp ? '(A PNP diode hangs from $V_{CC}$; same model.) ' : ''}${step}`;
    return { fig, q: qq, parts, hints: ['A diode-connected BJT is a diode carrying the total current: about $1/g_m$.', RB ? 'The base current flows through $R_B + r_\\pi$; the terminal carries $\\beta + 1$ times it.' : RE ? '$R_E$ carries the same current as the terminal.' : '$v_\\pi = v_t$.'], sol, _v: { g: 'diode', variant, pnp, withRo, IC: q.IC, beta: q.beta, VA: q.VA, RB, RE } };
  };

  // ================================================================ bk8_casc: cascodes
  GENS.bk8_casc = () => {
    const kind = pick(['bjt', 'bjt', 'pnp', 'mosTop', 'bjtTop', 'RE']);
    const q = randDev({ IC: [0.25, 0.5, 1, 2], VA: [25, 50, 100], beta: [50, 100, 100, 200] });
    const Vov = pick([0.2, 0.25, 0.4, 0.5]), lam = pick([0.02, 0.05, 0.1]);
    const gmM = 2 * q.IC / Vov, rds = 1 / (lam * q.IC);
    const RE = kind === 'RE' ? pick([200, 500, 1000, 2000]) : 0;
    let R, fig, qq, step, parts;
    const bjtLine = `$I_C = ${MA(q.IC)}$, $\\beta = ${q.beta}$, $V_A = ${q.VA}\\,\\text{V}$`;
    const mosLine = `the NMOS carries the same current with $V_{ov} = ${f(Vov)}\\,\\text{V}$ and $\\lambda = ${f(lam)}\\,\\text{V}^{-1}$`;
    if (kind === 'bjt' || kind === 'pnp' || kind === 'RE') {
      const Rlow = kind === 'RE' ? fColl(q, RE) : q.ro;
      R = q.ro * (1 + q.gm * par(Rlow, q.rpi)) + par(Rlow, q.rpi);
      fig = kind === 'pnp' ? [['rail', [1, -0.2], { n: 'V_{CC}' }], ['pnp', [1, 0.8], { n: 'Q_1' }], ['acg', [0, 0.8]], ['pnp', [1, 2.8], { n: 'Q_2' }], ['acg', [0, 2.8]], ['w', [1, 3.8], [1, 4.3]], upA([1, 4.3], 'R_{out}')]
        : [['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['acg', [0, 3]], ...(RE ? [['R', [1, 4], [1, 5.2], { n: 'R_E', s: RT(RE) }], ['gnd', [1, 5.2]]] : [['gnd', [1, 4]]]), ['w', [1, 0], [1, -0.5]], dnA([1, -0.5], 'R_{out}')];
      qq = `Two matched ${kind === 'pnp' ? 'PNPs (a cascode load hanging from $V_{CC}$)' : 'NPNs'} form a cascode current source, both bases held${RE ? `, with $R_E = ${RT(RE)}$ under the bottom transistor's emitter` : ''}. ${bjtLine}. Find the resistance $Q_1$ presents to node $X$ (between the transistors) and $R_{out}$.`;
      step = `**2. The bottom transistor** (base held${RE ? ', degenerated by $R_E$' : ', emitter on its rail'}) looks like ${RE ? `a degenerated collector: $R_X = r_o[1 + g_m(R_E\\parallel r_\\pi)] + R_E\\parallel r_\\pi = ${RT(Rlow)}$.` : `$R_X = r_o = ${RT(Rlow)}$.`}

**3. The top transistor** is a collector with $R_E\\to R_X$: $R_X\\parallel r_\\pi = ${RT(par(Rlow, q.rpi))}$, so
$$R_{out} = r_o\\big[1 + g_m(R_X\\parallel r_\\pi)\\big] + R_X\\parallel r_\\pi = ${RT(R)}$$
Ceiling: $(\\beta + 1)r_o + r_\\pi = ${RT((q.beta + 1) * q.ro + q.rpi)}$. ${RE ? 'The bottom degeneration barely helps: the top transistor was already at its ceiling.' : ''}`;
      parts = [resBox('R_X', Rlow), resBox('R_{out}', R, [], [{ v: q.ro * q.gm * q.ro, msg: 'That is $g_mr_o^2$, the MOSFET cascode. The top BJT\'s base current caps it near $\\beta r_o$.' }, { v: 2 * q.ro, msg: 'That only adds the two $r_o$: the top transistor\'s feedback multiplies.' }, { v: q.ro * (1 + q.gm * Rlow) + Rlow, msg: 'That uses $R_X$ instead of $R_X\\parallel r_\\pi$.' }])];
    } else if (kind === 'mosTop') {
      R = rds + q.ro + gmM * rds * q.ro;
      fig = [['nmos', [1, 1], { n: 'M_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['acg', [0, 3]], ['gnd', [1, 4]], ['w', [1, 0], [1, -0.5]], dnA([1, -0.5], 'R_{out}')];
      qq = `A BiCMOS cascode current source: an NMOS $M_2$ on top of an NPN $Q_1$, both control terminals held. The NPN has ${bjtLine}; ${mosLine}. Find $g_m$ and $r_{ds}$ of the NMOS and $R_{out}$.`;
      step = `**2. $Q_1$** (base and emitter held) is $r_{o1} = ${RT(q.ro)}$.

**3. $M_2$** is a MOSFET degenerated by $r_{o1}$; its gate draws no current, so there is no ceiling:
$$R_{out} = r_{ds2} + r_{o1} + g_{m2}r_{ds2}r_{o1} = ${RT(rds)} + ${RT(q.ro)} + ${MS(gmM)}\\times${RT(rds)}\\times${RT(q.ro)} = ${RT(R)}$$`;
      parts = [numBox('g_{m2}', 'mS', gmM * 1e3), resBox('r_{ds2}', rds), resBox('R_{out}', R, [], [{ v: q.ro * (1 + gmM * par(q.ro, q.rpi)), msg: 'A gate draws no current: no $\\parallel r_\\pi$ here.' }])];
    } else {
      R = q.ro * (1 + q.gm * par(rds, q.rpi)) + par(rds, q.rpi);
      fig = [['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['nmos', [1, 3], { n: 'M_1' }], ['acg', [0, 3]], ['gnd', [1, 4]], ['w', [1, 0], [1, -0.5]], dnA([1, -0.5], 'R_{out}')];
      qq = `A BiCMOS cascode current source: an NPN $Q_2$ on top of an NMOS $M_1$, both control terminals held. The NPN has ${bjtLine}; ${mosLine}. Find $r_{ds1}$ and $R_{out}$.`;
      step = `**2. $M_1$** (gate and source held) is $r_{ds1} = ${RT(rds)}$.

**3. $Q_2$** is a collector degenerated by $r_{ds1}$, with its base leak: $r_{ds1}\\parallel r_\\pi = ${RT(par(rds, q.rpi))}$,
$$R_{out} = r_o\\big[1 + g_m(r_{ds1}\\parallel r_\\pi)\\big] + r_{ds1}\\parallel r_\\pi = ${RT(R)}$$
The BJT on top brings back the ceiling, $(\\beta + 1)r_o + r_\\pi = ${RT((q.beta + 1) * q.ro + q.rpi)}$.`;
      parts = [resBox('r_{ds1}', rds), resBox('R_{out}', R, [], [{ v: rds + q.ro + q.gm * rds * q.ro, msg: 'That is the MOSFET-on-top formula. A BJT on top leaks through $r_\\pi$: use $r_{ds1}\\parallel r_\\pi$.' }])];
    }
    const sol = `**1. The devices.** ${devSteps(q, true)}${kind === 'mosTop' || kind === 'bjtTop' ? ` NMOS: $g_m = 2I_D/V_{ov} = ${MS(gmM)}$, $r_{ds} = 1/(\\lambda I_D) = ${RT(rds)}$.` : ''}

${step}`;
    return { fig, q: qq, parts, hints: ['The bottom device, with its control terminal held, is just its output resistance (or a degenerated one).', 'The top device is a collector (or drain) degenerated by that resistance.'], sol, _v: { g: 'casc', kind, IC: q.IC, beta: q.beta, VA: q.VA, Vov, lam, RE } };
  };
  // ================================================================ bk8_node: R_UP || R_DN || side branch
  // The node X is at [2, 2]. Above it (to V_CC), below it (to ground), and optionally a base or a gate to its right.
  GENS.bk8_node = () => {
    const I = pick([0.25, 0.5, 1, 2]) * 1e-3;
    const beta = pick([50, 100, 100, 200]);
    const VAn = pick([50, 100]), VAp = pick([25, 50]);
    const qn = dev(I, beta, VAn), qp = dev(I, beta, VAp);
    const lamM = pick([0.02, 0.05, 0.1]), rdsM = 1 / (lamM * I);
    const up = pick(['R', 'pnp', 'pnpRE', 'pnpD', 'pmos', 'npnE']);
    const dn = pick(['R', 'npn', 'npnRE', 'nmos', 'npnD']);
    const side = pick(['none', 'base', 'base', 'gate']);
    const RC = pick([2000, 5000, 10000, 20000]), REu = pick([200, 500, 1000, 2000]), REd = pick([200, 500, 1000, 2000]), RBu = pick([0, 1000, 10000]);
    const IC3 = pick([0.5, 1, 2]) * 1e-3, RE3 = pick([0, 500, 1000, 2000, 5000]);
    const q3 = dev(IC3, beta);
    const e = [];
    const lines = [];
    let Rup, Rdn, upTxt, dnTxt;
    // above
    if (up === 'R') { e.push(['rail', [2, 0.6], { n: 'V_{CC}' }], ['R', [2, 0.6], [2, 2], { n: 'R_C', s: RT(RC), side: 'l' }]); Rup = RC; upTxt = `$R_{UP} = R_C = ${RT(RC)}$ ($V_{CC}$ is incremental ground).`; }
    else if (up === 'pnp' || up === 'pnpRE') {
      e.push(['pnp', [2, 1], { n: 'Q_2' }], ['acg', [1, 1]]);
      if (up === 'pnpRE') e.push(['R', [2, -0.2], [2, 0], { n: 'R_{E2}', s: RT(REu) }], ['rail', [2, -0.2], { n: 'V_{CC}' }]); else e.push(['rail', [2, 0], { n: 'V_{CC}' }]);
      Rup = up === 'pnpRE' ? fColl(qp, REu) : qp.ro;
      lines.push(`$Q_2$ (PNP, base held): $${f(I * 1e3)}\\,\\text{mA}$, $V_A = ${VAp}\\,\\text{V}$${up === 'pnpRE' ? `, $R_{E2} = ${RT(REu)}$` : ''}`);
      upTxt = up === 'pnpRE' ? `$Q_2$ is a degenerated collector: $r_{o2} = ${RT(qp.ro)}$, $R_{E2}\\parallel r_\\pi = ${RT(par(REu, qp.rpi))}$, so $R_{UP} = r_{o2}[1 + g_m(R_{E2}\\parallel r_\\pi)] + R_{E2}\\parallel r_\\pi = ${RT(Rup)}$.` : `$Q_2$'s base and emitter are held: $R_{UP} = r_{o2} = V_A/I = ${RT(Rup)}$.`;
    } else if (up === 'pnpD') {
      e.push(['rail', [2, 0], { n: 'V_{CC}' }], ['pnp', [2, 1], { n: 'Q_2', dc: true }]);
      Rup = par(1 / qp.gm, qp.rpi, qp.ro);
      lines.push(`$Q_2$ (PNP diode): $${f(I * 1e3)}\\,\\text{mA}$, $V_A = ${VAp}\\,\\text{V}$`);
      upTxt = `$Q_2$ is a diode: $R_{UP} = \\dfrac{1}{g_m + 1/r_\\pi + 1/r_o} = ${RT(Rup)}\\approx1/g_m$.`;
    } else if (up === 'pmos') {
      e.push(['rail', [2, 0], { n: 'V_{DD}' }], ['pmos', [2, 1], { n: 'M_2' }], ['acg', [1, 1]]);
      Rup = rdsM; lines.push(`$M_2$ (PMOS, gate held): $\\lambda = ${f(lamM)}\\,\\text{V}^{-1}$ at $${f(I * 1e3)}\\,\\text{mA}$`);
      upTxt = `$M_2$'s gate and source are held: $R_{UP} = r_{ds2} = 1/(\\lambda I_D) = ${RT(Rup)}$.`;
    } else {
      e.push(['rail', [2, 0], { n: 'V_{CC}' }], ['npn', [2, 1], { n: 'Q_2' }], ...(RBu ? [['R', [-0.3, 1], [1, 1], { n: 'R_{B2}', s: RT(RBu) }], ['acg', [-0.3, 1]]] : [['acg', [1, 1]]]));
      Rup = par(qn.ro, (RBu + qn.rpi) / (beta + 1));
      lines.push(`$Q_2$ (NPN, collector on $V_{CC}$, base held${RBu ? ` through $R_{B2} = ${RT(RBu)}$` : ''}): $${f(I * 1e3)}\\,\\text{mA}$, $V_A = ${VAn}\\,\\text{V}$`);
      upTxt = `The node touches $Q_2$'s **emitter**: $\\dfrac{${RBu ? 'R_{B2} + ' : ''}r_\\pi}{\\beta + 1} = ${RT((RBu + qn.rpi) / (beta + 1))}$, in parallel with $r_o = ${RT(qn.ro)}$ (collector held): $R_{UP} = ${RT(Rup)}$.`;
    }
    // below
    if (dn === 'R') { e.push(['R', [2, 2], [2, 3.4], { n: 'R_D', s: RT(RC), side: 'l' }], ['gnd', [2, 3.4]]); Rdn = RC; dnTxt = `$R_{DN} = ${RT(RC)}$.`; }
    else if (dn === 'npn' || dn === 'npnRE') {
      e.push(['npn', [2, 3], { n: 'Q_1' }], ['acg', [1, 3]]);
      if (dn === 'npnRE') e.push(['R', [2, 4], [2, 5.2], { n: 'R_{E1}', s: RT(REd) }], ['gnd', [2, 5.2]]); else e.push(['gnd', [2, 4]]);
      Rdn = dn === 'npnRE' ? fColl(qn, REd) : qn.ro;
      lines.push(`$Q_1$ (NPN, base held): $${f(I * 1e3)}\\,\\text{mA}$, $V_A = ${VAn}\\,\\text{V}$${dn === 'npnRE' ? `, $R_{E1} = ${RT(REd)}$` : ''}`);
      dnTxt = dn === 'npnRE' ? `$Q_1$ is a degenerated collector: $R_{E1}\\parallel r_\\pi = ${RT(par(REd, qn.rpi))}$, $R_{DN} = ${RT(Rdn)}$.` : `$Q_1$'s base and emitter are held: $R_{DN} = r_{o1} = ${RT(Rdn)}$.`;
    } else if (dn === 'nmos') {
      e.push(['nmos', [2, 3], { n: 'M_1' }], ['acg', [1, 3]], ['gnd', [2, 4]]);
      Rdn = rdsM; lines.push(`$M_1$ (NMOS, gate held): $\\lambda = ${f(lamM)}\\,\\text{V}^{-1}$ at $${f(I * 1e3)}\\,\\text{mA}$`);
      dnTxt = `$M_1$: $R_{DN} = r_{ds1} = ${RT(Rdn)}$.`;
    } else {
      e.push(['npn', [2, 3], { n: 'Q_1', dc: true }], ['gnd', [2, 4]]);
      Rdn = par(1 / qn.gm, qn.rpi, qn.ro);
      lines.push(`$Q_1$ (NPN diode): $${f(I * 1e3)}\\,\\text{mA}$, $V_A = ${VAn}\\,\\text{V}$`);
      dnTxt = `$Q_1$ is a diode: $R_{DN} = ${RT(Rdn)}\\approx1/g_m$.`;
    }
    // side branch and the look-in terminal
    let Rside = Infinity, sideTxt = '';
    if (side === 'base') {
      e.push(['w', [2, 2], [3, 2]], ['npn', [4, 2], { n: 'Q_3' }], ['rail', [4, 1], { n: 'V_{CC}' }], ...(RE3 ? [['R', [4, 3], [4, 4.2], { n: 'R_{E3}', s: RT(RE3) }], ['gnd', [4, 4.2]]] : [['gnd', [4, 3]]]));
      Rside = q3.rpi + (beta + 1) * RE3;
      lines.push(`$Q_3$ (NPN, base on the node): $${MA(IC3)}$${RE3 ? `, $R_{E3} = ${RT(RE3)}$` : ', emitter grounded'}, $r_{o3}$ ignored`);
      sideTxt = `The node drives $Q_3$'s **base**, a path to ground: $R_{side} = r_{\\pi3} + (\\beta + 1)R_{E3} = ${RT(q3.rpi)}${RE3 ? ` + ${beta + 1}\\times${RT(RE3)}` : ''} = ${RT(Rside)}$.`;
    } else if (side === 'gate') {
      e.push(['w', [2, 2], [3, 2]], ['nmos', [4, 2], { n: 'M_3' }], ['rail', [4, 1], { n: 'V_{DD}' }], ['R', [4, 3], [4, 4.2], { n: 'R_S' }], ['gnd', [4, 4.2]]);
      lines.push('$M_3$ (NMOS source follower, gate on the node)');
      sideTxt = '$M_3$\'s **gate** hangs on the node: a gate draws no current, so it adds no path.';
    }
    const tx = up === 'pnpD' ? 0.4 : 1.3;
    e.push(['w', [2, 2], [tx, 2]], term([tx, 2], 'R_X\\rightarrow', 'l'), ['node', [2, 2], { n: 'X', side: 'ar' }]);
    const RX = par(Rup, Rdn, Rside);
    const qq = `Find the small-signal resistance of node $X$ to ground. $\\beta = ${beta}$ for every BJT. ${lines.join('; ')}.`;
    const parts = [resBox('R_{UP}', Rup), resBox('R_{DN}', Rdn)];
    if (side === 'base') parts.push(resBox('R_{side}', Rside, [q3.rpi + beta * RE3], [{ v: q3.rpi + RE3, msg: '$R_{E3}$ counts $\\beta + 1$ times from the base.' }]));
    parts.push(resBox('R_X', RX, [], [{ v: Rup + Rdn, msg: 'Paths from one node to ground are in parallel, not in series.' }, ...(side === 'base' ? [{ v: par(Rup, Rdn), msg: 'That leaves out $Q_3$\'s base: a base is a path to ground (unlike a gate).' }] : [])]));
    const small = Rup <= Math.min(Rdn, Rside) ? 'up' : Rdn <= Rside ? 'down' : 'the base';
    const sol = `**1. Up.** ${upTxt}

**2. Down.** ${dnTxt}

${side !== 'none' ? `**3. Sideways.** ${sideTxt}

` : ''}**${side !== 'none' ? 4 : 3}. Combine in parallel:** $R_X = ${side === 'base' ? `${RT(Rup)}\\parallel${RT(Rdn)}\\parallel${RT(Rside)}` : `${RT(Rup)}\\parallel${RT(Rdn)}`} = ${RT(RX)}$. The smallest path (${small}) matters most.`;
    return { fig: e, q: qq, parts, hints: ['Name the terminal that touches the node for each transistor, and what sits on its other terminals.', 'A base is a path to ground; a gate is not. Paths combine in parallel.'], sol, _v: { g: 'node', I, beta, VAn, VAp, lamM, up, dn, side, RC, REu, REd, RBu, IC3, RE3 } };
  };
  // ================================================================ Chapter 9: single stages
  const Rch = [2000, 3000, 4000, 5000, 8000, 10000, 20000];
  const lbl = (n, v) => (v ? `${n} = ${RT(v)}` : false);

  // ---------------------------------------------------------------- bk9_ce: the common emitter
  GENS.bk9_ce = () => {
    const active = Math.random() < 0.25;
    const pnp = !active && Math.random() < 0.3;
    const q = randDev();
    const RB = pick([0, 0, 1000, 2000, 5000, 10000]);
    const withRo = active || Math.random() < 0.5;
    const RC = pick(Rch), VAp = pick([25, 50]);
    const ro2 = VAp / q.IC;
    const GM = q.gm * q.rpi / (q.rpi + RB);
    const Rout = active ? par(q.ro, ro2) : withRo ? par(RC, q.ro) : RC;
    const Av = -GM * Rout, Rin = RB + q.rpi;
    const fig = amp({ kind: 'ce', pnp, RB: lbl('R_B', RB), RC: lbl('R_C', RC), load: active ? 'pnp' : undefined });
    const qq = `A${pnp ? ' PNP' : 'n NPN'} common emitter: ${devLine(q, withRo)}${active ? `; the load is a PNP current source (base held) with $V_{A,p} = ${VAp}\\,\\text{V}$ at the same current` : `, $R_C = ${RT(RC)}$`}${RB ? `, source resistance $R_B = ${RT(RB)}$` : ', input directly on the base'}.${withRo ? '' : ' Ignore $r_o$.'} Find $g_m$, $G_M$, $R_{out}$, $A_v$ and the resistance the source sees.`;
    const parts = [numBox('g_m', 'mS', q.gm * 1e3), numBox('G_M', 'mS', GM * 1e3, [], RB ? [{ v: q.gm * 1e3, msg: 'That is $g_m$. $R_B$ and $r_\\pi$ divide the input before it reaches $v_\\pi$.' }, { v: -GM * 1e3, msg: 'For a common emitter $G_M > 0$: the output current flows from the short into the collector.' }] : [{ v: -GM * 1e3, msg: 'For a common emitter $G_M > 0$: the output current flows from the short into the collector.' }]),
      resBox('R_{out}', Rout, [], active ? [{ v: q.ro, msg: 'The load\'s $r_{o2}$ is in parallel.' }, { v: ro2, msg: '$Q_1$\'s own $r_{o1}$ is in parallel.' }] : withRo ? [] : [{ v: par(RC, 100 / q.IC), msg: 'No $V_A$ is given: ignore $r_o$.' }]),
      numBox('A_v', '', Av, [], [{ v: -Av, msg: 'The common emitter inverts.' }, ...(RB ? [{ v: -q.gm * Rout, msg: 'That ignores the input divider $r_\\pi/(r_\\pi + R_B)$.' }] : []), ...(withRo && !active ? [{ v: -GM * RC, msg: 'With $V_A$ given, $r_o$ is in parallel with $R_C$.' }] : [])]),
      resBox('R_{in}', Rin, [], [{ v: q.rpi * (RB ? 0 : 1) + (RB ? q.rpi : 0) + (q.beta + 1) * RB, msg: 'Nothing is under the emitter; $R_B$ just adds.' }])];
    const sol = `**1. The device.** ${devSteps(q, withRo)}${active ? ` The load: $r_{o2} = ${VAp}\\,\\text{V}/${MA(q.IC)} = ${RT(ro2)}$.` : ''}

**2. $G_M$ (output shorted).** ${RB ? `The base current flows through $R_B$ and $r_\\pi$ (the emitter is grounded), so $v_\\pi = v_{in}\\dfrac{r_\\pi}{r_\\pi + R_B}$ and $G_M = g_m\\dfrac{r_\\pi}{r_\\pi + R_B} = ${MS(q.gm)}\\times\\dfrac{${RT(q.rpi)}}{${RT(q.rpi + RB)}} = ${MS(GM)}$.` : `$v_\\pi = v_{in}$, so $G_M = g_m = ${MS(GM)}$.`}${withRo ? ' ($r_o$ has 0 V across it and does not matter here.)' : ''}

**3. $R_{out}$ (input off, $v_\\pi = 0$).** ${active ? `Down: $r_{o1} = ${RT(q.ro)}$; up into the PNP's collector: $r_{o2} = ${RT(ro2)}$. $R_{out} = ${RT(Rout)}$.` : withRo ? `$R_C\\parallel r_o = ${RT(RC)}\\parallel${RT(q.ro)} = ${RT(Rout)}$.` : `$R_{out} = R_C = ${RT(RC)}$.`}${pnp ? ' (PNP: upside down, same model; $V_{CC}$ is ground.)' : ''}

**4. Gain:** $A_v = -G_MR_{out} = -${MS(GM)}\\times${RT(Rout)} = ${f(Av, 4)}$.

**5. The source sees** ${RB ? '$R_B + r_\\pi$' : '$r_\\pi$'} $= ${RT(Rin)}$.`;
    return { fig, q: qq, parts, hints: ['$g_m = I_C/V_T$, $r_\\pi = \\beta/g_m$.', RB ? 'A source resistance divides the input with $r_\\pi$.' : '$G_M = g_m$; $R_{out}$ is what the collector sees with the input off.'], sol, _v: { g: 'ce', pnp, active, IC: q.IC, beta: q.beta, VA: q.VA, VAp, RB, RC, withRo } };
  };

  // ---------------------------------------------------------------- bk9_cedeg: with R_E
  GENS.bk9_cedeg = () => {
    const pnp = Math.random() < 0.3;
    const q = randDev();
    const RE = pick([100, 200, 250, 470, 500, 1000, 2000]), RC = pick(Rch), RB = pick([0, 0, 1000, 5000, 10000]);
    const b = q.beta, den = RB + q.rpi + (b + 1) * RE;
    const GM = b / den, Av = -GM * RC, Rin = den;
    const fig = amp({ kind: 'ce', pnp, RE: lbl('R_E', RE), RC: lbl('R_C', RC), RB: lbl('R_B', RB) });
    const qq = `A${pnp ? ' PNP' : 'n NPN'} common emitter with an unbypassed emitter resistor: ${devLine(q, false)}, $R_C = ${RT(RC)}$, $R_E = ${RT(RE)}$${RB ? `, source resistance $R_B = ${RT(RB)}$` : ''}; $r_o\\to\\infty$. Find $G_M$ (exact), $A_v$, and the input resistance the source sees.`;
    const GMa = 1 / (1 / q.gm + RE + RB / b), Ava = -RC / (q.re + RE + RB / (b + 1));
    const parts = [numBox('G_M', 'mS', GM * 1e3, [GMa * 1e3], [{ v: q.gm * 1e3, msg: 'That is $g_m$: the undegenerated stage.' }]),
      numBox('A_v', '', Av, [Ava, -RC * GMa], [{ v: -RC / RE, msg: `That is $-R_C/R_E$, which ignores $r_e = ${RT(q.re)}$${RB ? ' and $R_B/(\\beta + 1)$' : ''} in series with $R_E$.` }, { v: -q.gm * RC, msg: 'That ignores $R_E$.' }, { v: -Av, msg: 'The common emitter inverts.' }]),
      resBox('R_{in}', Rin, [RB + q.rpi + b * RE], [{ v: RB + q.rpi + RE, msg: '$R_E$ counts $\\beta + 1$ times from the base.' }])];
    const sol = `**1. The device.** ${devSteps(q, false)} $r_e = r_\\pi/(\\beta + 1) = ${RT(q.re)}$.

**2. $G_M$ (output shorted).** KVL from the source through ${RB ? '$R_B$, ' : ''}$r_\\pi$ and $R_E$ (Lecture 24): $v_{in} = ${RB ? '\\frac{i_{out}}{\\beta}R_B + ' : ''}\\frac{i_{out}}{g_m} + \\big(1 + \\frac1\\beta\\big)i_{out}R_E$, so
$$G_M = \\frac{\\beta}{${RB ? 'R_B + ' : ''}r_\\pi + (\\beta + 1)R_E} = \\frac{${b}}{${RT(den)}} = ${MS(GM)}$$
${RB ? '' : `(the same as $\\dfrac{g_m}{1 + \\frac{\\beta + 1}{\\beta}g_mR_E}$).`}

**3. Gain.** $R_{out} = R_C$ ($r_o\\to\\infty$): $A_v = -G_MR_C = ${f(Av, 4)}$. With $r_e$: $-\\dfrac{R_C}{r_e + R_E${RB ? ' + R_B/(\\beta + 1)' : ''}} = ${f(Ava, 4)}$ (the small difference is $\\alpha$).${pnp ? ' (PNP: same model, upside down.)' : ''}

**4. Input:** the source sees $${RB ? 'R_B + ' : ''}r_\\pi + (\\beta + 1)R_E = ${RT(Rin)}$.`;
    return { fig, q: qq, parts, hints: ['Lecture 24: $v_{in} = v_\\pi + (1 + 1/\\beta)i_{out}R_E$ with $i_{out} = g_mv_\\pi$.', 'Quick check: $A_v\\approx-R_C/(r_e + R_E + R_B/(\\beta + 1))$.'], sol, _v: { g: 'cedeg', pnp, IC: q.IC, beta: q.beta, RE, RC, RB } };
  };

  // ---------------------------------------------------------------- bk9_cb: the common base
  GENS.bk9_cb = () => {
    const q = randDev();
    const RE = pick([0, 25, 50, 100, 200, 500]), RB = pick([0, 0, 1000, 5000, 10000]), RC = pick(Rch);
    const b = q.beta, alpha = b / (b + 1);
    const Rin = RE + (RB + q.rpi) / (b + 1), GM = -alpha / Rin, Av = alpha * RC / Rin;
    const fig = amp({ kind: 'cb', RE: lbl('R_E', RE), RB: lbl('R_B', RB), RC: lbl('R_C', RC) });
    const qq = `A common base: ${devLine(q, false)}, $R_C = ${RT(RC)}$, ${RE ? `source resistance $R_E = ${RT(RE)}$ in series with $v_{in}$` : '$v_{in}$ directly on the emitter'}, base ${RB ? `held through $R_B = ${RT(RB)}$ (no bypass capacitor)` : 'held'}; $r_o\\to\\infty$. Find $R_{in}$ (seen by $v_{in}$), $G_M$ and $A_v$.`;
    const Rina = RE + 1 / q.gm + RB / b;
    const parts = [resBox('R_{in}', Rin, [Rina], [{ v: RE || (RB + q.rpi), msg: 'Add the emitter itself: the base side divided by $\\beta + 1$.' }, { v: RE + RB + q.rpi, msg: 'From the emitter, the base side is divided by $\\beta + 1$.' }, { v: RE + q.rpi, msg: 'That is $r_\\pi$, the base. The emitter is $r_\\pi/(\\beta + 1)$.' }]),
      numBox('G_M', 'mS', GM * 1e3, [-1e3 / Rina, -1e3 / ((RB + q.rpi) / b + RE)], [{ v: -GM * 1e3, msg: 'For a common base $G_M < 0$.' }]),
      numBox('A_v', '', Av, [RC / Rina, RC / Rin], [{ v: -Av, msg: 'The common base does not invert.' }, ...(RE ? [{ v: RC / RE, msg: 'That is $R_C/R_E$: it forgets the emitter\'s own resistance.' }] : [])])];
    const sol = `**1. The device.** ${devSteps(q, false)} $r_e = ${RT(q.re)}$.

**2. $R_{in}$.** The emitter divides the base side by $\\beta + 1$${RE ? '; $R_E$ adds in series' : ''}:
$$R_{in} = ${RE ? 'R_E + ' : ''}\\frac{${RB ? 'R_B + ' : ''}r_\\pi}{\\beta + 1} = ${RE ? `${RT(RE)} + ` : ''}${RT((RB + q.rpi) / (b + 1))} = ${RT(Rin)}$$

**3. $G_M$** (Lecture 24's KVL, output shorted): $G_M = \\dfrac{-1}{\\frac{R_B + r_\\pi}{\\beta} + \\frac{\\beta + 1}{\\beta}R_E} = -\\dfrac{\\alpha}{R_{in}} = ${MS(GM)}$.

**4. Gain:** $A_v = -G_MR_C = \\dfrac{\\alpha R_C}{R_{in}} = \\dfrac{${f(alpha, 4)}\\times${RT(RC)}}{${RT(Rin)}} = ${f(Av, 4)}$, non-inverting.`;
    return { fig, q: qq, parts, hints: ['$R_{in} = R_E + (R_B + r_\\pi)/(\\beta + 1)$.', '$G_M = -\\alpha/R_{in}$; $A_v = +\\alpha R_C/R_{in}$.'], sol, _v: { g: 'cb', IC: q.IC, beta: q.beta, RE, RB, RC } };
  };

  // ---------------------------------------------------------------- bk9_cc: the emitter follower
  GENS.bk9_cc = () => {
    const pnp = Math.random() < 0.3;
    const q = randDev();
    const RB = pick([0, 1000, 5000, 10000, 50000]), RE = pick([500, 1000, 2000, 5000]), RL = pick([0, 0, 100, 200, 500, 1000]);
    const withRo = Math.random() < 0.3;
    const b = q.beta;
    const REp = par(RE, RL || Infinity, withRo ? q.ro : Infinity);
    const up = (q.rpi + RB) / (b + 1);
    const GM = -(b + 1) / (q.rpi + RB), Rout = par(REp, up), Av = REp / (REp + up), Rin = RB + q.rpi + (b + 1) * REp;
    const fig = amp({ kind: 'cc', pnp, RB: lbl('R_B', RB), RE: lbl('R_E', RE), RL: lbl('R_L', RL) });
    const qq = `A${pnp ? ' PNP' : 'n NPN'} emitter follower: ${devLine(q, withRo)}, $R_E = ${RT(RE)}$${RB ? `, source resistance $R_B = ${RT(RB)}$` : ''}${RL ? `, load $R_L = ${RT(RL)}$ on the output` : ''}.${withRo ? ' Keep $r_o$ (the collector is on its supply).' : ' Ignore $r_o$.'} Find $G_M$, $R_{in}$, $R_{out}$ (everything on the output node included) and $A_v$.`;
    const upa = 1 / q.gm + RB / b;
    const parts = [numBox('G_M', 'mS', GM * 1e3, [-1e3 / upa], [{ v: -GM * 1e3, msg: 'With the output shorted, current flows out of the stage into the short: $G_M < 0$ for a follower.' }]),
      resBox('R_{in}', Rin, [RB + q.rpi + b * REp], [{ v: RB + q.rpi, msg: 'Something hangs under the emitter: add $(\\beta + 1)$ times it.' }, { v: RB + q.rpi + (b + 1) * RE, msg: RL || withRo ? `Under the emitter is $R_E\\parallel${RL ? 'R_L' : ''}${RL && withRo ? '\\parallel' : ''}${withRo ? 'r_o' : ''}$, not $R_E$ alone.` : '' }].filter((t) => t.msg)),
      resBox('R_{out}', Rout, [par(REp, upa)], [{ v: REp, msg: 'That is the load side alone. The emitter looking up is in parallel with it, and it is much smaller.' }, { v: up, msg: 'Include $R_E$' + (RL ? ' and $R_L$' : '') + ': they hang on the same node.' }]),
      numBox('A_v', '', Av, [REp / (REp + upa)], [{ v: 1, msg: 'Close, but the emitter\'s output resistance and the load form a divider.' }, { v: -Av, msg: 'A follower does not invert.' }])];
    const sol = `**1. The device.** ${devSteps(q, withRo)}

**2. Load on the emitter:** $R_E${RL ? '\\parallel R_L' : ''}${withRo ? '\\parallel r_o' : ''} = ${RT(REp)}$${withRo ? ' ($r_o$ runs to the grounded collector)' : ''}.

**3. $G_M$** (emitter shorted; Lecture 24): $G_M = \\dfrac{-(\\beta + 1)}{r_\\pi + R_B} = \\dfrac{-${b + 1}}{${RT(q.rpi + RB)}} = ${MS(GM)}$.

**4. $R_{out}$:** looking up, $\\dfrac{r_\\pi + R_B}{\\beta + 1} = ${RT(up)}$; in parallel with $${RT(REp)}$: $R_{out} = ${RT(Rout)}$.

**5. Gain:** $A_v = -G_MR_{out} = \\dfrac{${RT(REp)}}{${RT(REp)} + ${RT(up)}} = ${f(Av, 4)}$.

**6. Input:** $R_{in} = ${RB ? 'R_B + ' : ''}r_\\pi + (\\beta + 1)\\times${RT(REp)} = ${RT(Rin)}$.${pnp ? ' (PNP: $R_E$ hangs from $V_{CC}$, the output is the emitter on top; same model.)' : ''}`;
    return { fig, q: qq, parts, hints: ['Everything on the emitter node is in parallel: $R_E$, the load, and $r_o$ if kept.', '$A_v = R_{load}/(R_{load} + (r_\\pi + R_B)/(\\beta + 1))$.'], sol, _v: { g: 'cc', pnp, IC: q.IC, beta: q.beta, VA: q.VA, RB, RE, RL, withRo } };
  };
})();

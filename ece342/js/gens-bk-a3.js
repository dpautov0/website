/* gens-bk-a3.js — Chapter 4 (single-stage MOSFET amplifiers): the chapter's figure library (window.BK4F, shared with
   content/bk04-mos-amps.js) and its randomized drills (GENS.bk_*). Every formula here was checked against an
   independent nodal solve of the small-signal circuit. */
(function () {
  'use strict';
  const f = U.fmt;

  // ================================================================ figures
  // Circuits: NMOS at [x, y] has D [x, y-1], S [x, y+1], G [x-1, y]; PMOS has S on top [x, y-1], D below [x, y+1].
  const F = {};
  const vsrc = (x, y, n = 'v_{in}') => [['Vac', [x, y], [x, y + 1], { n, side: 'l' }], ['gnd', [x, y + 1]]];
  const out = (p, n = 'v_{out}') => ['term', p, { n, side: 'r' }];
  const rail = (p, n = 'V_{DD}') => ['rail', p, { n }];
  // the input at a gate [gx, gy]: v_in alone, or riding on a DC bias source (o.bias = its label)
  const gin = (gx, gy, o = {}) => (o.bias
    ? [['w', [gx, gy], [gx - 0.7, gy], [gx - 0.7, gy + 0.3]], ['Vac', [gx - 0.7, gy + 0.3], [gx - 0.7, gy + 1.3], { n: o.vin || 'v_{in}', side: 'l' }],
      ['V', [gx - 0.7, gy + 1.3], [gx - 0.7, gy + 2.5], { n: o.bias, side: 'l' }], ['gnd', [gx - 0.7, gy + 2.5]]]
    : [['w', [gx, gy], [gx - 0.6, gy], [gx - 0.6, gy + 0.4]], ...vsrc(gx - 0.6, gy + 0.4, o.vin || 'v_{in}')]);
  F.gin = gin; F.vsrc = vsrc; F.out = out;

  // ---- single stages
  F.cs = (o = {}) => [rail([1, -1.2]), ['R', [1, -1.2], [1, 0], { n: 'R_D', s: o.RD }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['nmos', [1, 1], { n: 'M_1', sz: o.sz }], ['gnd', [1, 2]], ...gin(0, 1, o)];
  F.csP = (o = {}) => [rail([1, 0]), ['pmos', [1, 1], { n: 'M_1', sz: o.sz }], ['w', [1, 2], [1.8, 2]], out([1.8, 2]),
    ['R', [1, 2], [1, 3.2], { n: 'R_D', s: o.RD }], ['gnd', [1, 3.2]], ...gin(0, 1, o)];
  F.csDiodeP = (o = {}) => [rail([1, -2]), ['pmos', [1, -1], { n: 'M_2', sz: o.sz2, dc: true }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['nmos', [1, 1], { n: 'M_1', sz: o.sz1 }], ['gnd', [1, 2]], ...gin(0, 1, o)];
  F.csDiodeN = (o = {}) => [rail([1, -2]), ['nmos', [1, -1], { n: 'M_2', sz: o.sz2, dc: true }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['nmos', [1, 1], { n: 'M_1', sz: o.sz1 }], ['gnd', [1, 2]], ...gin(0, 1, o)];
  F.csIsrc = (o = {}) => [rail([1, -2]), ['pmos', [1, -1], { n: 'M_2', sz: o.sz2 }], ['acg', [0, -1]], ['txt', [-0.25, -1.3], '$V_B$', { a: 'r' }],
    ['w', [1, 0], [1.8, 0]], out([1.8, 0]), ['nmos', [1, 1], { n: 'M_1', sz: o.sz1 }], ['gnd', [1, 2]], ...gin(0, 1, o)];
  F.inv = (o = {}) => [rail([1, -2]), ['pmos', [1, -1], { n: 'M_2', sz: o.sz2 }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['nmos', [1, 1], { n: 'M_1', sz: o.sz1 }], ['gnd', [1, 2]],
    ['w', [0, -1], [-0.4, -1], [-0.4, 1], [0, 1]], ['w', [-0.4, 0], [-1, 0], [-1, 0.4]], ...vsrc(-1, 0.4)];
  F.csDeg = (o = {}) => [rail([1, -1.2]), ['R', [1, -1.2], [1, 0], { n: 'R_D', s: o.RD }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['nmos', [1, 1], { n: 'M_1', sz: o.sz }], ['R', [1, 2], [1, 3.2], { n: 'R_S', s: o.RS }], ['gnd', [1, 3.2]], ...gin(0, 1, o)];
  F.cg = (o = {}) => [rail([1, -1.2]), ['R', [1, -1.2], [1, 0], { n: 'R_D', s: o.RD }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['nmos', [1, 1], { n: 'M_1', sz: o.sz }], ['acg', [0, 1]], ['txt', [-0.25, 0.7], '$V_B$', { a: 'r' }],
    ...(o.noRS ? vsrc(1, 2) : [['R', [1, 2], [1, 3.2], { n: 'R_S', s: o.RS }], ...vsrc(1, 3.2)])];
  F.cd = (o = {}) => [rail([1, 0]), ['nmos', [1, 1], { n: 'M_1', sz: o.sz }], ['w', [1, 2], [1.8, 2]], out([1.8, 2]),
    ['R', [1, 2], [1, 3.2], { n: 'R_L', s: o.RL }], ['gnd', [1, 3.2]], ...gin(0, 1, o)];
  F.cdI = (o = {}) => [rail([1, 0]), ['nmos', [1, 1], { n: 'M_1', sz: o.sz }], ['w', [1, 2], [1.8, 2]], out([1.8, 2]),
    ['nmos', [1, 3], { n: 'M_2' }], ['acg', [0, 3]], ['gnd', [1, 4]], ...gin(0, 1, o)];
  F.casc = (o = {}) => [rail([1, -1.2]), ['R', [1, -1.2], [1, 0], { n: 'R_D', s: o.RD }], ['w', [1, 0], [1.8, 0]], out([1.8, 0]),
    ['nmos', [1, 1], { n: 'M_2' }], ['acg', [0, 1]], ['txt', [-0.25, 0.7], '$V_B$', { a: 'r' }], ['node', [1, 2], { n: 'x', side: 'r' }],
    ['nmos', [1, 3], { n: 'M_1' }], ['gnd', [1, 4]], ...gin(0, 3, o)];

  // ---- small-signal models
  // One MOSFET, drawn the way the course draws it: drain node at [x, y], source node at [x, y + 2], the dependent
  // source g_m v_gs from drain to source, r_ds beside it (o.rds = false leaves it out), and the gate as an open
  // terminal at [gx, y + 0.4] with a second terminal tied to the source, so +v_gs- sits between them.
  // o.up: PMOS drawn source-on-top (source node [x, y], drain node [x, y + 2]); the arrow still runs drain -> source.
  function mm(x, y, o = {}) {
    const sp = o.sp ?? 1.6, gx = x - (o.gdx ?? 1.8);
    const e = [];
    const top = [x, y], bot = [x, y + 2];
    e.push(o.up ? ['G', bot, top, { n: o.g ?? 'g_mv_{gs}', side: o.gside || 'r' }] : ['G', top, bot, { n: o.g ?? 'g_mv_{gs}', side: o.gside || 'r' }]);
    if (o.rds !== false) e.push(['w', top, [x + sp, y]], ['R', [x + sp, y], [x + sp, y + 2], { n: o.rds || 'r_{ds}' }], ['w', bot, [x + sp, y + 2]]);
    if (o.gate !== false) {
      if (o.up) {
        e.push(['term', [gx, y + 1.6], { n: o.G ?? 'G', side: 'b' }], ['term', [gx, y + 0.6]], ['w', [gx, y + 0.6], [gx, y], top],
          ['vlab', [gx + 0.25, y + 1.45], [gx + 0.25, y + 0.75], { n: o.vgs || 'v_{gs}' }]);
      } else {
        e.push(['term', [gx, y + 0.4], { n: o.G ?? 'G', side: 'a' }], ['term', [gx, y + 1.4]], ['w', [gx, y + 1.4], [gx, y + 2], bot],
          ['vlab', [gx + 0.25, y + 0.55], [gx + 0.25, y + 1.25], { n: o.vgs || 'v_{gs}' }]);
      }
    }
    if (o.letters !== false) {
      e.push(['txt', [x + 0.15, y - 0.22], o.up ? '$S$' : '$D$', { a: 'l' }], ['txt', [x + 0.15, y + 2.25], o.up ? '$D$' : '$S$', { a: 'l' }]);
    }
    return e;
  }
  F.mm = mm;
  // what hangs on the gate terminal of mm(x, y): v_in to ground on the left, or a ground
  const gVin = (x, y, o = {}) => { const gx = x - (o.gdx ?? 1.8); const yy = o.up ? y + 1.6 : y + 0.4; return [['w', [gx, yy], [gx - 1.1, yy], [gx - 1.1, yy + 0.5]], ...vsrc(gx - 1.1, yy + 0.5, o.vin || 'v_{in}')]; };
  const gGnd = (x, y, o = {}) => { const gx = x - (o.gdx ?? 1.8); const yy = o.up ? y + 1.6 : y + 0.4; return [['w', [gx, yy], [gx - 0.7, yy], [gx - 0.7, yy + 0.4]], ['gnd', [gx - 0.7, yy + 0.4]]]; };
  // output attachments at node p (to the right): a short to ground with i_out, a test source with i_t, or a terminal
  const shortAt = (p, len = 1.5) => [['w', p, [p[0] + len, p[1]], [p[0] + len, p[1] + 0.6]], ['gnd', [p[0] + len, p[1] + 0.6]],
    ['iarr', [p[0] + len * 0.5, p[1]], 'l', { n: 'i_{out}' }], ['txt', [p[0] + len + 0.15, p[1] + 0.3], '$\\text{short}$', { a: 'l' }]];
  const testAt = (p, len = 1.5, n = 'v_t') => [['w', p, [p[0] + len, p[1]]], ['V', [p[0] + len, p[1]], [p[0] + len, p[1] + 1.2], { n, side: 'r' }],
    ['gnd', [p[0] + len, p[1] + 1.2]], ['iarr', [p[0] + len * 0.5, p[1]], 'l', { n: 'i_t' }]];
  const outAt = (p, len = 1, n = 'v_{out}') => [['w', p, [p[0] + len, p[1]]], out([p[0] + len, p[1]], n)];
  Object.assign(F, { gVin, gGnd, shortAt, testAt, outAt });

  // the common source model: mode 'short' (G_M), 'test' (R_out), 'open' (direct KCL); o.rds false drops r_ds
  F.csM = (mode = 'short', o = {}) => {
    const sp = 1.6;
    const g = mode === 'test' ? (o.dead ? 'g_m\\cdot 0' : 'g_mv_{gs}') : (o.g || 'g_mv_{gs}');
    const e = [...mm(3, 0, { g, rds: o.rds }), ['R', [3, -1.4], [3, 0], { n: 'R_D' }], ['gndu', [3, -1.4]], ['w', [3, 2], [3, 2.5]], ['gnd', [3, 2.5]]];
    e.push(...(mode === 'test' ? gGnd(3, 0) : gVin(3, 0)));
    const dn = o.rds === false ? [3, 0] : [3 + sp, 0];
    if (mode === 'short') e.push(...shortAt(dn));
    if (mode === 'test') e.push(...testAt(dn));
    if (mode === 'open') e.push(...outAt(dn));
    return e;
  };

  // the PMOS common source model, drawn source-on-top like the circuit: mode 'short' | 'test'
  F.csPM = (mode = 'short') => {
    const e = [...mm(3, 0, { up: true }), ['w', [3, 0], [3, -0.6]], ['gndu', [3, -0.6]], ['R', [3, 2], [3, 3.4], { n: 'R_D' }], ['gnd', [3, 3.4]]];
    e.push(...(mode === 'test' ? gGnd(3, 0, { up: true }) : gVin(3, 0, { up: true })));
    if (mode === 'short') e.push(...shortAt([4.6, 2]));
    if (mode === 'test') e.push(...testAt([4.6, 2]));
    return e;
  };

  // ---- plots: Schem.plot plus TeX annotations at data coordinates, t = [{x, y, s, a: 'l' | 'r' | 'c'}]
  const flabel = (x, y, s, a = 'c') => {
    const w = 190, h = 56, fx = a === 'l' ? x : a === 'r' ? x - w : x - w / 2;
    const jc = a === 'l' ? 'flex-start' : a === 'r' ? 'flex-end' : 'center';
    return `<foreignObject x="${fx.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" class="lbl small"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:center"><span style="text-align:${a === 'r' ? 'right' : a === 'l' ? 'left' : 'center'}">$${s}$</span></div></foreignObject>`;
  };
  F.plot = (o, t = []) => {
    const W = o.w || 400, H = o.h || 250, ml = 46, mr = 18, mt = 16, mb = 38;
    const X = (x) => ml + (x - o.x[0]) / (o.x[1] - o.x[0]) * (W - ml - mr);
    const Y = (y) => H - mb - (y - o.y[0]) / (o.y[1] - o.y[0]) * (H - mt - mb);
    return Schem.plot(o).replace(/<\/svg>$/, t.map((a) => flabel(X(a.x), Y(a.y), a.s, a.a)).join('') + '</svg>');
  };
  // the common source on its output curves: K = 1 mA/V^2, V_TN = 1 V, lambda = 0, V_DD = 5 V, R_D = 10 kOhm
  F.loadLine = () => {
    const I = (vgs) => (v) => { const ov = vgs - 1; return v < ov ? 2 * ov * v - v * v : ov * ov; };
    return F.plot({ x: [0, 5.5], y: [0, 0.55], xl: 'V_{DS}\\ (\\text{V})', yl: 'I_D\\ (\\text{mA})', w: 440, h: 280,
      xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      curves: [{ f: I(1.6), cls: 'dc' }, { f: I(1.5) }, { f: I(1.4), cls: 'dc' }, { f: (v) => (5 - v) / 10, cls: 'dash', to: 5 }],
      pts: [{ x: 1.4, y: 0.36, n: '' }, { x: 2.5, y: 0.25, n: 'Q' }, { x: 3.4, y: 0.16, n: '' }] },
    [{ x: 4.0, y: 0.39, s: 'V_{GS} = 1.6\\,\\text{V}', a: 'l' }, { x: 4.0, y: 0.28, s: 'V_{GS} = 1.5\\,\\text{V}', a: 'l' }, { x: 4.0, y: 0.19, s: 'V_{GS} = 1.4\\,\\text{V}', a: 'l' },
      { x: 0.9, y: 0.525, s: '\\text{load line: } I_D = (V_{DD} - V_{DS})/R_D', a: 'l' }]);
  };
  // the common source transfer curve (same numbers): off, saturation (the amplifier), triode; tangent at Q
  F.csTransfer = () => {
    const vout = (vin) => { if (vin <= 1) return 5; const ov = vin - 1, vs = 5 - 10 * ov * ov; if (vs >= ov) return vs; const b = 20 * ov + 1; return (b - Math.sqrt(b * b - 200)) / 20; };
    return F.plot({ x: [0, 3], y: [0, 5.5], xl: 'V_{in}\\ (\\text{V})', yl: 'V_{out}\\ (\\text{V})', w: 440, h: 280, xt: [0, 1, 2, 3], yt: [0, 1, 2, 3, 4, 5],
      curves: [{ f: vout }, { f: (x) => 2.5 - 10 * (x - 1.5), from: 1.28, to: 1.72, cls: 'dash' }], pts: [{ x: 1.5, y: 2.5, n: 'Q' }] },
    [{ x: 0.5, y: 4.6, s: '\\text{off}' }, { x: 2.0, y: 3.4, s: '\\text{saturation}' }, { x: 2.5, y: 1.0, s: '\\text{triode}' },
      { x: 1.36, y: 4.75, s: '\\text{tangent: slope } {-10}', a: 'l' }]);
  };

  // ---- the Norton picture
  // the whole amplifier as a box, driven by v_in, with something attached at its output (o.ext: 'load' | 'vsrc')
  F.ampBox = (o = {}) => [
    ['box', [0, -0.7], [3, 2.1], { n: 'linear<br/>small-signal<br/>circuit' }],
    ['Vac', [-1.3, 0.3], [-1.3, 1.3], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.3, 1.3]], ['w', [-1.3, 0.3], [-1.3, 0], [0, 0]],
    ['w', [3, 0], [4.8, 0]], ['node', [4.1, 0], { n: 'v_{out}', side: 'a' }], ['iarr', [3.6, 0], 'l', { n: 'i_x', side: 'b', off: [0, 12] }],
    ...(o.ext === 'vsrc' ? [['V', [4.8, 0], [4.8, 1.4], { n: 'v_{out}', side: 'r' }]] : [['X', [4.8, 0], [4.8, 1.4], { n: '\\text{anything}', side: 'r' }]]),
    ['gnd', [4.8, 1.4]],
  ];
  // the Norton equivalent: G_M v_in pulls current down out of the output node, R_out beside it.
  // mode: 'ix' (current i_x coming in), 'open', 'short' (i_out), 'test' (v_in = 0, test source), 'load' (R_L)
  F.norton = (mode = 'open') => {
    const e = [['box', [-0.5, -0.6], [3, 2.6], { n: '' }],
      ['G', [0.5, 0], [0.5, 2], { n: mode === 'test' ? 'G_M\\cdot 0' : 'G_Mv_{in}', side: 'l' }], ['w', [0.5, 0], [4, 0]],
      ['R', [2, 0], [2, 2], { n: 'R_{out}' }], ['w', [0.5, 2], [2, 2]], ['gnd', [1.25, 2]]];
    if (mode === 'open' || mode === 'ix') e.push(out([4, 0]));
    if (mode === 'ix') e.push(['iarr', [3.4, 0], 'l', { n: 'i_x' }]);
    if (mode === 'short') e.push(['w', [4, 0], [4, 0.7]], ['gnd', [4, 0.7]], ['iarr', [3.4, 0], 'l', { n: 'i_{out}' }], ['txt', [4.15, 0.35], '$\\text{short}$', { a: 'l' }]);
    if (mode === 'test') e.push(['V', [4, 0], [4, 1.3], { n: 'v_t', side: 'r' }], ['gnd', [4, 1.3]], ['iarr', [3.4, 0], 'l', { n: 'i_t' }]);
    if (mode === 'load') e.push(['w', [4, 0], [5, 0]], out([5, 0]), ['R', [4, 0], [4, 1.6], { n: 'R_L' }], ['gnd', [4, 1.6]]);
    return e;
  };
  // Norton exercise: an abstract small-signal circuit with a resistor straight from the input to the output
  F.ffM = () => [
    ['Vac', [0, 0.6], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0], [0.6, 0]],
    ['R', [0.6, 0], [2.4, 0], { n: 'R_F' }], ['w', [2.4, 0], [5.2, 0]],
    ['G', [2.8, 0], [2.8, 2], { n: 'g_mv_{in}', side: 'l' }], ['R', [4.4, 0], [4.4, 2], { n: 'R_1' }], ['w', [2.8, 2], [4.4, 2]], ['gnd', [3.6, 2]],
    out([5.2, 0]),
  ];

  window.BK4F = F;

  // ================================================================ drills
  const GENS = window.GENS;
  const pick = U.pick, par = U.par;
  const KO = (r) => `${f(r / 1000, 3)}\\,\\text{k}\\Omega`;
  const MS = (g) => `${f(g * 1000, 3)}\\,\\text{mS}`;
  const OH = (r) => (Math.abs(r) < 1e3 ? `${f(r, 3)}\\,\\Omega` : Math.abs(r) < 1e6 ? KO(r) : `${f(r / 1e6, 3)}\\,\\text{M}\\Omega`);
  const VV = (v) => (Math.abs(v) < 1 ? `${f(v * 1000, 3)}\\,\\text{mV}` : `${f(v, 3)}\\,\\text{V}`);
  const MA = (i) => (Math.abs(i) < 1e-3 ? `${f(i * 1e6, 3)}\\,\\mu\\text{A}` : `${f(i * 1e3, 3)}\\,\\text{mA}`);
  const G4 = (x) => f(x, 4);
  // an answer box: value in SI, shown in `unit` (scale = display/SI). accept: other SI values that count as right;
  // traps: known slips {v (SI), msg}, dropped when they sit within 2% of a right answer. key: names the quantity.
  function box(lbl, val, unit, scale, o = {}) {
    const p = { lbl, unit, ans: val * scale };
    if (o.key) p.key = o.key;
    const acc = (o.accept || []).filter((a) => isFinite(a) && Math.abs(a - val) > 0.012 * Math.abs(val));
    if (acc.length) p.accept = acc.map((a) => a * scale);
    const good = [val, ...acc];
    const tr = (o.traps || []).filter((t) => isFinite(t.v) && good.every((g) => Math.abs(t.v - g) > 0.035 * Math.abs(g)));
    if (tr.length) p.traps = tr.map((t) => ({ v: t.v * scale, msg: t.msg }));
    return p;
  }
  const resBox = (lbl, val, o = {}) => { const [u, s] = val < 1e3 ? ['Ω', 1] : val < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6]; return box(lbl, val, u, s, o); };
  const gBox = (lbl, val, o = {}) => box(lbl, val, 'mS', 1e3, o);
  const nBox = (lbl, val, o = {}) => box(lbl, val, '', 1, o);
  window.BK4 = { box, resBox, gBox, nBox, KO, MS, OH, VV, MA };

  // ---------------------------------------------------------------- 1. the Norton picture, from measurements
  GENS.bk_norton = () => {
    const form = pick(['meas', 'meas', 'loads', 'load']);
    const s = Math.random() < 0.65 ? 1 : -1;                    // sign of G_M: most stages here invert
    const word = s > 0 ? 'inverting' : 'non-inverting';
    if (form === 'meas') {
      const vin = pick([10, 20, 50]) * 1e-3, Ro = pick([1, 2, 2.5, 4, 5, 8, 10]) * 1e3, gmm = pick([1, 2, 4, 5, 8, 10]) * 1e-3, RL = pick([1, 2, 4, 5, 10]) * 1e3;
      const GMv = s * gmm, Av = -GMv * Ro, voc = Av * vin, isc = GMv * vin, AvL = -GMv * par(Ro, RL);
      return {
        fig: F.ampBox(),
        q: `An amplifier is driven with $v_{in} = ${VV(vin)}$. With its output open, $v_{out} = ${VV(voc)}$. With its output shorted to ground, a current of $${MA(Math.abs(isc))}$ flows ${isc > 0 ? '**from the short into** the amplifier' : '**out of** the amplifier **into** the short'}. Find $A_v$, $G_M$ (with its sign) and $R_{out}$, then the gain once a $${KO(RL)}$ load is connected.`,
        parts: [nBox('A_v', Av, { key: 'Av' }), gBox('G_M', GMv, { key: 'GM' }),
          resBox('R_{out}', Ro, { key: 'Ro' }),
          nBox('A_v\\text{ with the load}', AvL, { key: 'AvL', traps: [{ v: -GMv * RL, msg: 'That uses the load alone. The load sits in parallel with $R_{out}$.' }, { v: -GMv * (Ro + RL), msg: 'Series? The load runs from the output to ground, the same two nodes as $R_{out}$: parallel.' }] })],
        hints: ['Open output: $A_v = v_{out}/v_{in}$. Shorted output: $G_M = i_{out}/v_{in}$, counting $i_{out}$ positive when it flows from the short **into** the stage.',
          '$R_{out} = A_v/(-G_M)$. With a load, $A_v = -G_M(R_{out}\\parallel R_L)$.'],
        sol: `1. Open output: $A_v = \\dfrac{${VV(voc)}}{${VV(vin)}} = ${G4(Av)}$ (${word}).
2. Shorted output: $i_{out} = ${isc > 0 ? '+' : '-'}${MA(Math.abs(isc))}$ (${isc > 0 ? 'it flows from the short into the stage, the positive direction' : 'it flows out of the stage, so it counts negative'}). $G_M = \\dfrac{i_{out}}{v_{in}} = ${MS(GMv)}$.
3. $A_v = -G_MR_{out}$, so $R_{out} = \\dfrac{A_v}{-G_M} = \\dfrac{${G4(Av)}}{${G4(-GMv * 1e3)}\\,\\text{mS}} = ${KO(Ro)}$. (The same as $|v_{oc}|/|i_{sc}|$, the Thévenin resistance.)
4. With the load: $R_{out}\\parallel R_L = ${KO(Ro)}\\parallel${KO(RL)} = ${KO(par(Ro, RL))}$, and $G_M$ is unchanged (the load carries nothing when the output is shorted). $A_v = -(${MS(GMv)})(${KO(par(Ro, RL))}) = ${G4(AvL)}$.

Sign check: ${s > 0 ? 'current is pulled out of the output when $v_{in}$ rises, so the output falls: inverting.' : 'current is pushed into the output when $v_{in}$ rises, so the output rises: non-inverting.'}`,
        _v: { k: 'norton', p: { GM: GMv, Ro, RL }, a: { Av, GM: GMv, Ro, AvL } },
      };
    }
    if (form === 'loads') {
      // unloaded gain A0, loaded gain AL = A0 * RL/(Ro + RL)
      const [Ro, RL] = pick([[3e3, 1e3], [1e3, 1e3], [4e3, 1e3], [2e3, 2e3], [6e3, 2e3], [9e3, 1e3], [5e3, 5e3], [8e3, 2e3]]);
      const vin = pick([10, 20, 50, 100]) * 1e-3, gmm = pick([1, 2, 2.5, 4, 5]) * 1e-3;
      const GMv = s * gmm, A0 = -GMv * Ro, AL = -GMv * par(Ro, RL);
      return {
        fig: F.ampBox(),
        q: `An ${word} amplifier gives $v_{out} = ${VV(A0 * vin)}$ for $v_{in} = ${VV(vin)}$ with nothing connected. With a $${KO(RL)}$ load on its output, the same input gives $v_{out} = ${VV(AL * vin)}$. Find $R_{out}$ and $G_M$ (with its sign).`,
        parts: [resBox('R_{out}', Ro, { key: 'Ro' }), gBox('G_M', GMv, { key: 'GM' })],
        hints: ['Unloaded: $A_0 = -G_MR_{out}$. Loaded: $A_L = -G_M(R_{out}\\parallel R_L)$. Divide one by the other: $G_M$ cancels.',
          '$\\dfrac{A_L}{A_0} = \\dfrac{R_L}{R_{out} + R_L}$.'],
        sol: `1. $A_0 = ${G4(A0)}$, $A_L = ${G4(AL)}$.
2. Divide: $\\dfrac{A_L}{A_0} = \\dfrac{R_{out}\\parallel R_L}{R_{out}} = \\dfrac{R_L}{R_{out} + R_L}$, so $${G4(AL / A0)} = \\dfrac{${KO(RL)}}{R_{out} + ${KO(RL)}}$.
3. Solve: $R_{out} + ${KO(RL)} = \\dfrac{${KO(RL)}}{${G4(AL / A0)}} = ${KO(Ro + RL)}$, so $R_{out} = ${KO(Ro)}$.
4. $G_M = -\\dfrac{A_0}{R_{out}} = -\\dfrac{${G4(A0)}}{${KO(Ro)}} = ${MS(GMv)}$.`,
        _v: { k: 'norton', p: { GM: GMv, Ro, RL }, a: { Ro, GM: GMv } },
      };
    }
    const Ro = pick([0.5, 1, 2, 5, 10, 20, 50]) * 1e3, RL = pick([0.5, 1, 2, 5, 10, 20]) * 1e3, gmm = pick([0.5, 1, 2, 4, 5]) * 1e-3;
    const GMv = s * gmm, A0 = -GMv * Ro, AL = -GMv * par(Ro, RL);
    return {
      fig: F.norton('load'),
      q: `A stage has $G_M = ${MS(GMv)}$ and $R_{out} = ${KO(Ro)}$. Find its gain with nothing connected, and with a load $R_L = ${KO(RL)}$ at its output.`,
      parts: [nBox('A_v\\text{ unloaded}', A0, { key: 'Av' }), nBox('A_v\\text{ with }R_L', AL, { key: 'AvL', traps: [{ v: -GMv * RL, msg: 'That is $-G_MR_L$: the load is in parallel with $R_{out}$, both carry the signal current.' }, { v: -GMv * (Ro + RL), msg: 'The load and $R_{out}$ share the same two nodes: parallel, not series.' }] })],
      hints: ['$A_v = -G_MR_{out}$; the sign of $G_M$ decides inverting or not.', 'With the load, the resistance at the output is $R_{out}\\parallel R_L$.'],
      sol: `1. Unloaded: $A_v = -G_MR_{out} = -(${MS(GMv)})(${KO(Ro)}) = ${G4(A0)}$.
2. Loaded: $R_{out}\\parallel R_L = ${KO(par(Ro, RL))}$, so $A_v = -(${MS(GMv)})(${KO(par(Ro, RL))}) = ${G4(AL)}$.

${s > 0 ? '$G_M > 0$: the stage pulls current out of its output when $v_{in}$ rises, so it inverts.' : '$G_M < 0$: the stage pushes current into its output when $v_{in}$ rises, so it does not invert.'} The load can only shrink the resistance at the output, so it can only shrink $|A_v|$.`,
      _v: { k: 'norton', p: { GM: GMv, Ro, RL }, a: { Av: A0, AvL: AL } },
    };
  };
})();

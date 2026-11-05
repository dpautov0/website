/* gens-bk-a8.js — Book Chapters 12 (transistor capacitances, poles at nodes, Miller) and 13 (open-circuit time
   constants). Holds (1) window.BK8, the figure library and formula kit used by content/bk12-hf.js and
   content/bk13-octc.js: stage circuits drawn with their capacitors, small-signal and test-source pictures, physical
   pictures (cross-sections), a plotter with log axes, the open-circuit resistance of every capacitor of every stage,
   and a small complex nodal solver for exact bandwidths; and (2) the generators GENS.bk_*.
   Every formula here was checked against an independent complex nodal analysis (scratchpad a8/solver.py): the
   open-circuit resistances on 10,200 random circuits, and each generator on at least 200 random draws. Each generated
   problem carries _chk (its inputs) so the outside script can recompute it. */
(function () {
  'use strict';
  const f = U.fmt, pick = U.pick, par = U.par;
  const GENS = window.GENS;
  const INF = Infinity;

  // ================================================================ formatting
  const RT = (r) => (r === INF ? '\\infty' : E3.resTeX(r));
  const CT = (c) => (c < 0.9995e-12 ? `${f(c * 1e15, 3)}\\,\\text{fF}` : `${f(c * 1e12, 3)}\\,\\text{pF}`);
  const TT = (t) => (t < 0.9995e-9 ? `${f(t * 1e12, 3)}\\,\\text{ps}` : `${f(t * 1e9, 3)}\\,\\text{ns}`);
  const WT = (w) => (w >= 0.9995e9 ? `${f(w / 1e9, 3)}\\,\\text{Grad/s}` : w >= 0.9995e6 ? `${f(w / 1e6, 3)}\\,\\text{Mrad/s}` : `${f(w / 1e3, 3)}\\,\\text{krad/s}`);
  const FT = (hz) => (hz >= 0.9995e9 ? `${f(hz / 1e9, 3)}\\,\\text{GHz}` : hz >= 0.9995e6 ? `${f(hz / 1e6, 3)}\\,\\text{MHz}` : `${f(hz / 1e3, 3)}\\,\\text{kHz}`);
  const GT = (g) => `${f(g * 1e3, 3)}\\,\\text{mS}`;
  const IT = (i) => (i < 0.9995e-3 ? `${f(i * 1e6, 3)}\\,\\mu\\text{A}` : `${f(i * 1e3, 3)}\\,\\text{mA}`);
  const KOs = (r) => `${f(r / 1e3, 3)}\\kO`;       // shown resistor values on figures

  // a numeric answer box in a sensible unit. traps closer than 3% to the answer (or to an accepted value) are dropped
  const UNITS = {
    w: [[1e9, 'Grad/s'], [1e6, 'Mrad/s'], [1e3, 'krad/s'], [1, 'rad/s']],
    f: [[1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz'], [1, 'Hz']],
    t: [[1e-9, 'ns'], [1e-12, 'ps']],
    C: [[1e-12, 'pF'], [1e-15, 'fF']],
    R: [[1e6, 'MΩ'], [1e3, 'kΩ'], [1, 'Ω']],
    g: [[1e-3, 'mS']],
    x: [[1, '']],
  };
  function num(lbl, v, kind, traps = [], accept = []) {
    const L = UNITS[kind];
    const [sc, u] = L.find(([s]) => Math.abs(v) >= s * 0.9995) || L[L.length - 1];
    const p = { lbl, ans: v / sc };
    if (u) p.unit = u;
    const acc = accept.filter((a) => isFinite(a) && Math.abs(a - v) > 0.012 * Math.abs(v));
    if (acc.length) p.accept = acc.map((a) => a / sc);
    const t = traps.filter((x) => isFinite(x.v) && Math.abs(x.v - v) > 0.03 * Math.abs(v) && !acc.some((a) => Math.abs(x.v - a) < 0.03 * Math.abs(a)));
    const seen = [];
    const tt = t.filter((x) => { if (seen.some((y) => Math.abs(y - x.v) < 0.02 * Math.abs(x.v))) return false; seen.push(x.v); return true; });
    if (tt.length) p.traps = tt.map((x) => ({ v: x.v / sc, msg: x.msg }));
    return p;
  }

  // ================================================================ drawing helpers
  // a TeX label in the same form schem.js writes them (figlabels.js lifts it into the HTML layer, KaTeX typesets it)
  function lab(x, y, html, anchor = 'c', cls = '') {
    const w = 190, h = 56;
    let fx = x - w / 2, fy = y - h / 2, jc = 'center', ai = 'center', ta = 'center';
    if (anchor === 'l') { fx = x; jc = 'flex-start'; ta = 'left'; }
    if (anchor === 'r') { fx = x - w; jc = 'flex-end'; ta = 'right'; }
    if (anchor === 't') { fy = y; ai = 'flex-start'; }
    if (anchor === 'b') { fy = y - h; ai = 'flex-end'; }
    return `<foreignObject x="${fx}" y="${fy}" width="${w}" height="${h}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">${html}</span></div></foreignObject>`;
  }
  const words = (t) => `<span class="ptxt">${t}</span>`;

  // a plot with linear or logarithmic axes. Axis ranges are in axis units: decades for a log axis ([6, 10] = 10^6..10^10).
  // o.xt / o.yt: [{ v, t }] ticks (axis units, TeX label); o.curves: [{ f(x) -> y in real units, cls, from, to, n, at, pos }]
  // o.areas: [{ f, g, from, to }] shaded between two functions; o.marks: [{ x, n }] dashed verticals (x in real units)
  // o.pts: [{ x, y, n, pos }] dots
  function plot2(o) {
    const W = o.w || 460, H = o.h || 250, ml = o.ml || 52, mr = o.mr || 18, mt = o.mt || 32, mb = o.mb || 44;
    const tx = (x) => (o.logx ? Math.log10(x) : x), ty = (y) => (o.logy ? Math.log10(y) : y);
    const X = (a) => ml + (a - o.x[0]) / (o.x[1] - o.x[0]) * (W - ml - mr);
    const Y = (a) => H - mb - (a - o.y[0]) / (o.y[1] - o.y[0]) * (H - mt - mb);
    const clampY = (a) => Math.max(o.y[0] - 0.02 * (o.y[1] - o.y[0]), Math.min(o.y[1] + 0.02 * (o.y[1] - o.y[0]), a));
    const sample = (fn, a, b, n = 220) => {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const xa = a + (b - a) * i / n, xr = o.logx ? 10 ** xa : xa, yr = fn(xr);
        if (isFinite(yr) && (!o.logy || yr > 0)) pts.push([X(xa), Y(clampY(ty(yr)))]);
      }
      return pts;
    };
    let s = `<svg class="plot" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="plot">`;
    for (const t of (o.xt || [])) s += `<path class="grid" d="M${X(t.v)},${Y(o.y[0])}V${Y(o.y[1])}"/>` + lab(X(t.v), Y(o.y[0]) + 4, `<span class="tick">${t.t}</span>`, 't');
    for (const t of (o.yt || [])) s += `<path class="grid" d="M${X(o.x[0])},${Y(t.v)}H${X(o.x[1])}"/>` + lab(X(o.x[0]) - 5, Y(t.v), `<span class="tick">${t.t}</span>`, 'r');
    for (const a of (o.areas || [])) {
      const lo = a.from ?? o.x[0], hi = a.to ?? o.x[1];
      const top = sample(a.f, lo, hi, 120), bot = sample(a.g, lo, hi, 120).reverse();
      s += `<path d="M${[...top, ...bot].map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z" style="fill:var(--tint);stroke:none"/>`;
    }
    s += `<path class="axis" d="M${X(o.x[0])},${Y(o.y[1])}V${Y(o.y[0])}H${X(o.x[1])}"/>`;
    for (const m of (o.marks || [])) {
      const xm = X(tx(m.x));
      s += `<path d="M${xm},${Y(o.y[0])}V${Y(o.y[1])}" style="stroke:var(--dim);stroke-width:1;stroke-dasharray:4 3;fill:none"/>`;
      if (m.n) s += lab(xm, Y(o.y[1]) - 2, m.n, 'b', 'small');
    }
    for (const c of (o.curves || [])) {
      const pts = sample(c.f, c.from ?? o.x[0], c.to ?? o.x[1]);
      if (pts.length) s += `<path class="curve ${c.cls || ''}" d="M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}"/>`;
      if (c.n !== undefined) {
        const xa = c.at, xr = o.logx ? 10 ** xa : xa, ya = ty(c.f(xr));
        const pos = c.pos || 'a';
        const px = X(xa), py = Y(clampY(ya));
        s += pos === 'a' ? lab(px, py - 6, c.n, 'b', 'small') : pos === 'b' ? lab(px, py + 6, c.n, 't', 'small') : pos === 'r' ? lab(px + 6, py, c.n, 'l', 'small') : lab(px - 6, py, c.n, 'r', 'small');
      }
    }
    for (const p of (o.pts || [])) {
      const px = X(tx(p.x)), py = Y(ty(p.y));
      s += `<circle class="fill" cx="${px}" cy="${py}" r="3.6"/>`;
      if (p.n) s += (p.pos === 'l' ? lab(px - 7, py, p.n, 'r', 'small') : p.pos === 'b' ? lab(px, py + 7, p.n, 't', 'small') : p.pos === 'a' ? lab(px, py - 7, p.n, 'b', 'small') : lab(px + 7, py - 7, p.n, 'l', 'small'));
    }
    if (o.xl) s += lab((X(o.x[0]) + X(o.x[1])) / 2, H - 2, o.xl, 'b', 'small');
    if (o.yl) s += lab(X(o.x[0]) - 30, Y(o.y[1]) - 14, o.yl, 'l', 'small');
    return s + '</svg>';
  }
  const dec = (k) => ({ v: k, t: `$10^{${k}}$` });

  // ================================================================ stage circuits with their capacitors
  // o.hi: key of the capacitor to box; o.v: shown values {RS, RL, Cgs, ...} (TeX); o.caps: which capacitors to draw
  // (default all); o.noC: none; o.cdb: draw C_db separately at the output; o.csb: draw C_sb (where it matters)
  const capN = (o, key, name) => (o.hi === key ? `\\boxed{${name}}` : name);
  const has = (o, key) => !o.noC && (!o.caps || o.caps.includes(key));
  const sv = (o, key) => (o.v ? o.v[key] : undefined);
  const RLb = (o, key, name, side) => ({ n: name, s: sv(o, key), side });
  const CLb = (o, key, name, side) => ({ n: capN(o, key, name), s: sv(o, key), side });
  const vin = (x, y, n = 'v_{in}') => [['Vac', [x, y], [x, y + 1], { n, side: 'l' }], ['gnd', [x, y + 1]]];
  const outT = (x, y, n = 'v_{out}') => ['term', [x, y], { n, side: 'r' }];
  const NM = (dev) => (dev === 'npn' ? { K: ['Cpi', 'Cmu'], N: ['C_\\pi', 'C_\\mu'], sup: 'V_{CC}' } : { K: ['Cgs', 'Cgd'], N: ['C_{gs}', 'C_{gd}'], sup: 'V_{DD}' });

  const F = {};
  // common source / common emitter: v_in through R_S to the gate; R_L to the supply; output at the drain
  F.cs = (o = {}, dev = 'nmos') => {
    const { K, N, sup } = NM(dev);
    const xL = o.cdb ? 4.8 : 4.0;
    return [
      ...vin(-0.6, 1.5), ['w', [-0.6, 1.5], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], RLb(o, 'RS', 'R_S')], ['w', [0.8, 1], [2, 1]],
      [dev, [3, 1], { n: o.dn }], ['gnd', [3, 2]],
      ['rail', [3, -2], { n: sup }], ['R', [3, -2], [3, -0.6], RLb(o, 'RL', 'R_L')], ['w', [3, -0.6], [3, 0]],
      ...(has(o, K[0]) ? [['C', [1.1, 1], [1.1, 2.4], CLb(o, K[0], N[0], 'l')], ['gnd', [1.1, 2.4]]] : []),
      ...(has(o, K[1]) ? [['w', [1.6, 1], [1.6, -0.6]], ['C', [1.6, -0.6], [3, -0.6], CLb(o, K[1], N[1])]] : []),
      ...(o.cdb && has(o, 'Cdb') ? [['C', [3.8, 0], [3.8, 1.4], CLb(o, 'Cdb', 'C_{db}')], ['gnd', [3.8, 1.4]]] : []),
      ...(has(o, 'CL') ? [['C', [xL, 0], [xL, 1.4], CLb(o, 'CL', 'C_L')], ['gnd', [xL, 1.4]]] : []),
      ['w', [3, 0], [xL + 0.8, 0]], outT(xL + 0.8, 0),
    ];
  };
  F.ce = (o = {}) => F.cs(o, 'npn');
  // common source with source degeneration, the notes' names: R_G in series with the gate, R_S under the source
  F.csdeg = (o = {}) => [
    ...vin(-0.6, 1.5), ['w', [-0.6, 1.5], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], RLb(o, 'RG', 'R_G')], ['w', [0.8, 1], [2, 1]],
    ['nmos', [3, 1]], ['w', [3, 2], [3, 2.6]], ['R', [3, 2.6], [3, 3.9], RLb(o, 'RS', 'R_S')], ['gnd', [3, 3.9]],
    ['rail', [3, -2], { n: 'V_{DD}' }], ['R', [3, -2], [3, -0.6], RLb(o, 'RL', 'R_L')], ['w', [3, -0.6], [3, 0]],
    ...(has(o, 'Cgs') ? [['C', [1.1, 1], [1.1, 2.6], CLb(o, 'Cgs', 'C_{gs}', 'l')], ['w', [1.1, 2.6], [3, 2.6]]] : []),
    ...(has(o, 'Cgd') ? [['w', [1.6, 1], [1.6, -0.6]], ['C', [1.6, -0.6], [3, -0.6], CLb(o, 'Cgd', 'C_{gd}')]] : []),
    ...(has(o, 'CL') ? [['C', [4, 0], [4, 1.4], CLb(o, 'CL', 'C_L')], ['gnd', [4, 1.4]]] : []),
    ['w', [3, 0], [4.8, 0]], outT(4.8, 0),
  ];
  // common emitter with R_E (the BJT twin of the degenerated common source)
  F.cedeg = (o = {}) => [
    ...vin(-0.6, 1.5), ['w', [-0.6, 1.5], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], RLb(o, 'RS', 'R_S')], ['w', [0.8, 1], [2, 1]],
    ['npn', [3, 1]], ['w', [3, 2], [3, 2.6]], ['R', [3, 2.6], [3, 3.9], RLb(o, 'RE', 'R_E')], ['gnd', [3, 3.9]],
    ['rail', [3, -2], { n: 'V_{CC}' }], ['R', [3, -2], [3, -0.6], RLb(o, 'RL', 'R_L')], ['w', [3, -0.6], [3, 0]],
    ...(has(o, 'Cpi') ? [['C', [1.1, 1], [1.1, 2.6], CLb(o, 'Cpi', 'C_\\pi', 'l')], ['w', [1.1, 2.6], [3, 2.6]]] : []),
    ...(has(o, 'Cmu') ? [['w', [1.6, 1], [1.6, -0.6]], ['C', [1.6, -0.6], [3, -0.6], CLb(o, 'Cmu', 'C_\\mu')]] : []),
    ...(has(o, 'CL') ? [['C', [4, 0], [4, 1.4], CLb(o, 'CL', 'C_L')], ['gnd', [4, 1.4]]] : []),
    ['w', [3, 0], [4.8, 0]], outT(4.8, 0),
  ];
  // common gate / common base: v_in through R_S into the source; the gate is held (incremental ground, the triangle)
  F.cg = (o = {}, dev = 'nmos') => {
    const { K, N, sup } = NM(dev);
    return [
      [dev, [3, 1]], ['acg', [2, 1]],
      ['w', [3, 2], [3, 2.6]], ['R', [0.8, 2.6], [3, 2.6], RLb(o, 'RS', 'R_S', 'b')], ...vin(0.2, 2.6), ['w', [0.2, 2.6], [0.8, 2.6]],
      ['rail', [3, -1.6], { n: sup }], ['R', [3, -1.6], [3, 0], RLb(o, 'RL', 'R_L')],
      ...(has(o, K[0]) ? [['C', [3, 2.6], [3, 3.9], CLb(o, K[0], N[0])], ['acg', [3, 3.9]]] : []),
      ...(has(o, K[1]) ? [['C', [3.9, 0], [3.9, 1.3], CLb(o, K[1], N[1])], ['acg', [3.9, 1.3]]] : []),
      ...(has(o, 'CL') ? [['C', [5.4, 0], [5.4, 1.3], CLb(o, 'CL', 'C_L')], ['gnd', [5.4, 1.3]]] : []),
      ['w', [3, 0], [6.4, 0]], outT(6.4, 0),
    ];
  };
  F.cb = (o = {}) => F.cg(o, 'npn');
  // source / emitter follower: drain on the supply (incremental ground), output at the source with R_L to ground
  F.sf = (o = {}, dev = 'nmos') => {
    const { K, N, sup } = NM(dev);
    return [
      ...vin(-0.6, 1.5), ['w', [-0.6, 1.5], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], RLb(o, 'RS', 'R_S')], ['w', [0.8, 1], [2, 1]],
      [dev, [3, 1]], ['w', [3, 0], [3, -0.6]], ['rail', [3, -0.6], { n: sup }],
      ['w', [3, 2], [3, 2.6]], ['R', [3, 2.6], [3, 3.9], RLb(o, 'RL', 'R_L')], ['gnd', [3, 3.9]],
      ...(has(o, K[0]) ? [['C', [1.1, 1], [1.1, 2.6], CLb(o, K[0], N[0], 'l')], ['w', [1.1, 2.6], [3, 2.6]]] : []),
      ...(has(o, K[1]) ? [['C', [1.6, 1], [1.6, -0.6], CLb(o, K[1], N[1], 'l')], ['w', [1.6, -0.6], [3, -0.6]]] : []),
      ...(has(o, 'CL') ? [['C', [4, 2.6], [4, 3.9], CLb(o, 'CL', 'C_L')], ['gnd', [4, 3.9]]] : []),
      ['w', [3, 2.6], [4.8, 2.6]], outT(4.8, 2.6),
    ];
  };
  F.ef = (o = {}) => F.sf(o, 'npn');
  // cascode: M1 (input) under M2 (gate held); node X between them. dev 'npn' gives the BJT cascode
  F.casc = (o = {}, dev = 'nmos') => {
    const b = dev === 'npn';
    const nm = b ? ['Q_1', 'Q_2'] : ['M_1', 'M_2'];
    const K = b ? ['Cpi1', 'Cmu1', 'Cpi2', 'Cmu2'] : ['Cgs1', 'Cgd1', 'Cgs2', 'Cgd2'];
    const N = b ? ['C_{\\pi1}', 'C_{\\mu1}', 'C_{\\pi2}', 'C_{\\mu2}'] : ['C_{gs1}', 'C_{gd1}', 'C_{gs2}', 'C_{gd2}'];
    return [
      ...vin(-0.6, 3.5), ['w', [-0.6, 3.5], [-0.6, 3]], ['R', [-0.6, 3], [0.8, 3], RLb(o, 'RS', 'R_S')], ['w', [0.8, 3], [2, 3]],
      [dev, [3, 3], { n: nm[0] }], ['gnd', [3, 4]],
      [dev, [3, 1], { n: nm[1] }], ['acg', [2, 1]], ['txt', [3.32, 1.7], '$X$'],
      ['rail', [3, -1.6], { n: b ? 'V_{CC}' : 'V_{DD}' }], ['R', [3, -1.6], [3, 0], RLb(o, 'RL', 'R_L')],
      ...(has(o, K[0]) ? [['C', [1.1, 3], [1.1, 4.4], CLb(o, K[0], N[0], 'l')], ['gnd', [1.1, 4.4]]] : []),
      ...(has(o, K[1]) ? [['C', [1.6, 3], [1.6, 2], CLb(o, K[1], N[1], 'l')], ['w', [1.6, 2], [3, 2]]] : []),
      ...(has(o, K[2]) ? [['w', [3, 2], [4.4, 2]], ['C', [4.4, 2], [4.4, 3.3], CLb(o, K[2], N[2])], ['acg', [4.4, 3.3]]] : []),
      ...(has(o, K[3]) ? [['C', [3.9, 0], [3.9, 1.2], CLb(o, K[3], N[3])], ['acg', [3.9, 1.2]]] : []),
      ...(has(o, 'CL') ? [['C', [5.5, 0], [5.5, 1.2], CLb(o, 'CL', 'C_L')], ['gnd', [5.5, 1.2]]] : []),
      ['w', [3, 0], [6.4, 0]], outT(6.4, 0),
    ];
  };
  F.bjtcasc = (o = {}) => F.casc(o, 'npn');

  // ================================================================ small-signal pictures
  const M = {};
  // NMOS high-frequency model (Lecture 28): C_gs, C_gd, g_m v_gs, r_ds, and the junctions C_db, C_sb to the bulk (ground)
  M.mosHF = () => [
    ['term', [-0.8, 0], { n: 'G', side: 'l' }], ['w', [-0.8, 0], [1.4, 0]],
    ['C', [0.4, 0], [0.4, 2], { n: 'C_{gs}', side: 'l' }], ['vlab', [1.4, 0.35], [1.4, 1.65], { n: 'v_{gs}' }],
    ['w', [1.4, 0], [1.4, -1]], ['C', [1.4, -1], [3.4, -1], { n: 'C_{gd}' }], ['w', [3.4, -1], [3.4, 0]],
    ['G', [3.4, 0], [3.4, 2], { n: 'g_mv_{gs}', side: 'l' }], ['w', [3.4, 0], [6.2, 0]], ['R', [4.5, 0], [4.5, 2], { n: 'r_{ds}' }],
    ['C', [5.5, 0], [5.5, 1.3], { n: 'C_{db}' }], ['gnd', [5.5, 1.3]], ['term', [6.2, 0], { n: 'D', side: 'r' }],
    ['w', [0.4, 2], [4.5, 2]], ['C', [1.9, 2], [1.9, 3.2], { n: 'C_{sb}', side: 'l' }], ['gnd', [1.9, 3.2]],
    ['w', [3, 2], [3, 2.7]], ['term', [3, 2.7], { n: 'S', side: 'r' }],
  ];
  // NPN high-frequency model (Lecture 28): C_b and C_je from base to emitter (C_pi = C_b + C_je), r_pi, C_mu, g_m v_pi, r_o
  M.bjtHF = (split = true) => [
    ['term', [-1, 0], { n: 'B', side: 'l' }], ['w', [-1, 0], [2.4, 0]],
    ...(split ? [['C', [-0.2, 0], [-0.2, 2], { n: 'C_b', side: 'l' }], ['C', [0.8, 0], [0.8, 2], { n: 'C_{je}' }]]
      : [['C', [0.3, 0], [0.3, 2], { n: 'C_\\pi', side: 'l' }]]),
    ['R', [2, 0], [2, 2], { n: 'r_\\pi', side: 'l' }], ['vlab', [2.4, 0.35], [2.4, 1.65], { n: 'v_\\pi' }],
    ['w', [2.4, 0], [2.4, -1]], ['C', [2.4, -1], [4.2, -1], { n: 'C_\\mu' }], ['w', [4.2, -1], [4.2, 0]],
    ['G', [4.2, 0], [4.2, 2], { n: 'g_mv_\\pi', side: 'l' }], ['w', [4.2, 0], [6, 0]], ['R', [5.3, 0], [5.3, 2], { n: 'r_o' }],
    ['term', [6, 0], { n: 'C', side: 'r' }],
    ['w', [split ? -0.2 : 0.3, 2], [5.3, 2]], ['w', [3.4, 2], [3.4, 2.7]], ['term', [3.4, 2.7], { n: 'E', side: 'r' }],
  ];
  // the f_T test: drive the gate with a current, short the drain, measure the drain current
  M.ftTest = () => [
    ['Iac', [0, 2], [0, 0], { n: 'i_{in}', side: 'l' }], ['gnd', [0, 2]], ['w', [0, 0], [2, 0]],
    ['C', [1, 0], [1, 2], { n: 'C_{gs}', side: 'l' }], ['gnd', [1, 2]], ['vlab', [1.4, 0.35], [1.4, 1.65], { n: 'v_{gs}' }],
    ['C', [2, 0], [3.4, 0], { n: 'C_{gd}' }], ['w', [3.4, 0], [4.8, 0]],
    ['G', [3.4, 0], [3.4, 2], { n: 'g_mv_{gs}', side: 'l' }], ['gnd', [3.4, 2]],
    ['w', [4.8, 0], [4.8, 2]], ['gnd', [4.8, 2]], ['iarr', [4.8, 1.1], 'u', { n: 'i_{out}', side: 'r' }],
    ['node', [3.4, 0], { n: 'D', side: 'a' }],
  ];
  // one node: a Thevenin source driving a capacitor
  M.nodeRC = (o = {}) => [
    ...vin(0, 1, o.vn || 'v_{TH}'), ['w', [0, 1], [0, 0]], ['R', [0, 0], [1.6, 0], { n: o.rn || 'R_{TH}' }], ['w', [1.6, 0], [3, 0]],
    ['node', [2.3, 0], { n: o.xn || 'v_X', side: 'a', dot: true }], ['C', [3, 0], [3, 1.2], { n: o.cn || 'C' }], ['gnd', [3, 1.2]],
  ];
  // a node with something up, something down, and a capacitor to ground
  M.nodeUD = (o = {}) => [
    ['acg', [1, -1.4], { dir: 'u' }], ['R', [1, -1.4], [1, 0], { n: o.up || 'R_{UP}' }], ['R', [1, 0], [1, 1.4], { n: o.dn || 'R_{DN}' }], ['gnd', [1, 1.4]],
    ['node', [1, 0], { n: o.x || 'X', side: 'l', dot: true }], ['w', [1, 0], [2.4, 0]], ['C', [2.4, 0], [2.4, 1.4], { n: o.c || 'C' }], ['gnd', [2.4, 1.4]],
  ];
  // the lecture's three node examples (transistor capacitances ignored)
  M.ex1 = () => [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_L' }], ['w', [1, 0], [2.6, 0]], outT(2.6, 0),
    ['C', [2, 0], [2, 1.2], { n: 'C_L' }], ['gnd', [2, 1.2]], ['nmos', [1, 1]], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ...vin(-0.6, 1.4)];
  M.ex2 = () => [['rail', [3, -1.2], { n: 'V_{DD}' }], ['R', [3, -1.2], [3, 0], { n: 'R_L' }], ['w', [3, 0], [4.6, 0]], outT(4.6, 0),
    ['C', [4, 0], [4, 1.2], { n: 'C_L' }], ['gnd', [4, 1.2]], ['nmos', [3, 1]], ['gnd', [3, 2]],
    ['R', [0.2, 1], [1.4, 1], { n: 'R_S' }], ['w', [1.4, 1], [2, 1]], ['node', [1.7, 1], { n: 'X', side: 'a' }],
    ['C', [1.7, 1], [1.7, 2.2], { n: 'C_{in}', side: 'l' }], ['gnd', [1.7, 2.2]],
    ['w', [0.2, 1], [-0.4, 1], [-0.4, 1.4]], ...vin(-0.4, 1.4)];
  M.ex3 = () => [['rail', [1, -1.2], { n: 'V_{DD}' }], ['R', [1, -1.2], [1, 0], { n: 'R_L' }], ['w', [1, 0], [2.6, 0]], outT(2.6, 0),
    ['C', [2, 0], [2, 1.2], { n: 'C_L' }], ['gnd', [2, 1.2]], ['nmos', [1, 1]], ['acg', [0, 1]],
    ['w', [1, 2], [1, 2.3]], ['node', [1, 2.3], { n: 'X', side: 'l' }], ['w', [1, 2.3], [2.2, 2.3]],
    ['C', [2.2, 2.3], [2.2, 3.5], { n: 'C_{in}' }], ['gnd', [2.2, 3.5]],
    ['R', [1, 2.3], [1, 3.5], { n: 'R_S', side: 'l' }], ['Vac', [1, 3.5], [1, 4.5], { n: 'v_{in}', side: 'l' }], ['gnd', [1, 4.5]]];
  // small-signal model of example 2: the gate node, then a current source into the drain node
  M.ex2ss = () => [
    ...vin(-0.6, 1.4), ['w', [-0.6, 1.4], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], { n: 'R_S' }], ['w', [0.8, 1], [1.6, 1]],
    ['node', [1.2, 1], { n: 'v_X', side: 'a', dot: true }], ['C', [1.6, 1], [1.6, 2.2], { n: 'C_{in}' }], ['gnd', [1.6, 2.2]],
    ['G', [3.2, 0.4], [3.2, 2.2], { n: 'g_mv_X', side: 'l' }], ['gnd', [3.2, 2.2]], ['w', [3.2, 0.4], [5.4, 0.4]],
    ['C', [4.1, 0.4], [4.1, 1.6], { n: 'C_L' }], ['gnd', [4.1, 1.6]], ['R', [4.9, 0.4], [4.9, 1.6], { n: 'R_L' }], ['gnd', [4.9, 1.6]],
    outT(5.4, 0.4),
  ];
  // small-signal model of example 3 (common gate, r_ds ignored): the input node is the source
  M.ex3ss = () => [
    ...vin(-0.6, 1.4), ['w', [-0.6, 1.4], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], { n: 'R_S' }], ['w', [0.8, 1], [3.2, 1]],
    ['node', [1.2, 1], { n: 'v_X', side: 'a', dot: true }], ['C', [1.8, 1], [1.8, 2.2], { n: 'C_{in}' }], ['gnd', [1.8, 2.2]],
    ['G', [3.2, -0.6], [3.2, 1], { n: 'g_mv_{gs} = -g_mv_X', side: 'l' }], ['w', [3.2, -0.6], [5.4, -0.6]],
    ['C', [4.1, -0.6], [4.1, 0.6], { n: 'C_L' }], ['gnd', [4.1, 0.6]], ['R', [4.9, -0.6], [4.9, 0.6], { n: 'R_L' }], ['gnd', [4.9, 0.6]],
    outT(5.4, -0.6), ['txt', [3.42, -0.85], '$D$'], ['txt', [3.42, 1.27], '$S$'],
  ];
  // Lecture 28's two-node model of the CS and CE stages
  M.twoNode = (o = {}) => [
    ...vin(-0.6, 1.4, 'v_{TH}'), ['w', [-0.6, 1.4], [-0.6, 1]],
    ['R', [-0.6, 1], [0.8, 1], { n: 'R_{TH}' }], ['w', [0.8, 1], [1.7, 1]], ['node', [1.2, 1], { n: 'X', side: 'a', dot: true }],
    ['C', [1.2, 1], [1.2, 2.2], { n: 'C_{in}', side: 'l' }], ['gnd', [1.2, 2.2]], ['vlab', [1.6, 1.3], [1.6, 2.0], { n: 'v_X' }],
    ['w', [1.7, 1], [1.7, -0.2]], ['C', [1.7, -0.2], [3.3, -0.2], { n: o.hiXY ? '\\boxed{C_{xy}}' : 'C_{xy}' }], ['w', [3.3, -0.2], [3.3, 0.4]],
    ['G', [3.3, 0.4], [3.3, 2.2], { n: 'g_mv_X', side: 'l' }], ['gnd', [3.3, 2.2]], ['w', [3.3, -0.2], [6.1, -0.2]], ['node', [3.9, -0.2], { n: 'Y', side: 'a', dot: true }],
    ['C', [4.3, -0.2], [4.3, 1], { n: 'C_{out}' }], ['gnd', [4.3, 1]], ['R', [5.5, -0.2], [5.5, 1], { n: 'R_L' }], ['gnd', [5.5, 1]], outT(6.1, -0.2),
  ];
  // the CS small-signal model with every capacitor (Lecture 28, page 2)
  M.csSS = () => [
    ...vin(-0.6, 1.4), ['w', [-0.6, 1.4], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], { n: 'R_S' }], ['w', [0.8, 1], [1.8, 1]],
    ['C', [1.2, 1], [1.2, 2.2], { n: 'C_{gs}', side: 'l' }], ['gnd', [1.2, 2.2]], ['vlab', [1.6, 1.3], [1.6, 2.0], { n: 'v_{gs}' }],
    ['w', [1.8, 1], [1.8, -0.2]], ['C', [1.8, -0.2], [3.3, -0.2], { n: 'C_{gd}' }], ['w', [3.3, -0.2], [3.3, 0.4]],
    ['G', [3.3, 0.4], [3.3, 2.2], { n: 'g_mv_{gs}', side: 'l' }], ['gnd', [3.3, 2.2]], ['w', [3.3, -0.2], [6.8, -0.2]],
    ['C', [4.1, -0.2], [4.1, 1], { n: 'C_{db}' }], ['gnd', [4.1, 1]], ['C', [5.1, -0.2], [5.1, 1], { n: 'C_L' }], ['gnd', [5.1, 1]],
    ['R', [6.1, -0.2], [6.1, 1], { n: 'R_L' }], ['gnd', [6.1, 1]], outT(6.8, -0.2),
  ];
  // the CE small-signal model (r_pi at the base)
  M.ceSS = () => [
    ...vin(-0.6, 1.4), ['w', [-0.6, 1.4], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], { n: 'R_S' }], ['w', [0.8, 1], [2.6, 1]],
    ['C', [1.2, 1], [1.2, 2.2], { n: 'C_\\pi', side: 'l' }], ['gnd', [1.2, 2.2]], ['R', [2, 1], [2, 2.2], { n: 'r_\\pi', side: 'l' }], ['gnd', [2, 2.2]],
    ['vlab', [2.35, 1.3], [2.35, 2.0], { n: 'v_\\pi' }],
    ['w', [2.6, 1], [2.6, -0.2]], ['C', [2.6, -0.2], [4, -0.2], { n: 'C_\\mu' }], ['w', [4, -0.2], [4, 0.4]],
    ['G', [4, 0.4], [4, 2.2], { n: 'g_mv_\\pi', side: 'l' }], ['gnd', [4, 2.2]], ['w', [4, -0.2], [6.4, -0.2]],
    ['C', [4.9, -0.2], [4.9, 1], { n: 'C_L' }], ['gnd', [4.9, 1]], ['R', [5.7, -0.2], [5.7, 1], { n: 'R_L' }], ['gnd', [5.7, 1]], outT(6.4, -0.2),
  ];
  // Miller: an impedance between two nodes, and its two grounded replacements
  M.millerZ = () => [
    ['w', [0, 0.4], [0, 0], [0.9, 0]], ['node', [0, 0], { n: '1', side: 'a', dot: true }], ['box', [0.9, -0.35], [2.5, 0.35], { n: '$Z_F$' }],
    ['w', [2.5, 0], [3.4, 0], [3.4, 0.4]], ['node', [3.4, 0], { n: '2', side: 'a', dot: true }],
    ['vlab', [-0.3, 0.55], [-0.3, 1.45], { n: 'v_1', side: 'l' }], ['gnd', [0, 1.6]],
    ['vlab', [3.7, 0.55], [3.7, 1.45], { n: 'v_2' }], ['gnd', [3.4, 1.6]],
    ['txt', [4.65, 0.8], '$\\Longleftrightarrow$'],
    ['w', [5.6, 0.4], [5.6, 0]], ['node', [5.6, 0], { n: '1', side: 'a', dot: true }], ['box', [5.3, 0.4], [5.9, 1.2], { n: '$Z_1$' }], ['w', [5.6, 1.2], [5.6, 1.6]], ['gnd', [5.6, 1.6]],
    ['w', [7.2, 0.4], [7.2, 0]], ['node', [7.2, 0], { n: '2', side: 'a', dot: true }], ['box', [6.9, 0.4], [7.5, 1.2], { n: '$Z_2$' }], ['w', [7.2, 1.2], [7.2, 1.6]], ['gnd', [7.2, 1.6]],
  ];
  M.millerA = (o = {}) => [['term', [0, 1], { n: 'v_{in}', side: 'l' }], ['w', [0, 1], [1, 1]], ['box', [1, 0.4], [2.6, 1.6], { n: `$${o.gain || '-A_0'}$` }], ['w', [2.6, 1], [3.8, 1]], outT(3.8, 1),
    ['w', [0.5, 1], [0.5, -0.3]], ['C', [0.5, -0.3], [3.2, -0.3], { n: o.cf || 'C_F' }], ['w', [3.2, -0.3], [3.2, 1]], ['node', [0.5, 1], { n: '1', side: 'b', dot: true }], ['node', [3.2, 1], { n: '2', side: 'b', dot: true }]];
  M.millerB = (o = {}) => [['term', [0, 1], { n: 'v_{in}', side: 'l' }], ['w', [0, 1], [1, 1]], ['box', [1, 0.4], [2.6, 1.6], { n: `$${o.gain || '-A_0'}$` }], ['w', [2.6, 1], [3.8, 1]], outT(3.8, 1),
    ['C', [0.5, 1], [0.5, 2.2], { n: o.c1 || '(1 + A_0)C_F', side: 'l' }], ['gnd', [0.5, 2.2]], ['C', [3.2, 1], [3.2, 2.2], { n: o.c2 || '\\left(1 + \\tfrac{1}{A_0}\\right)C_F' }], ['gnd', [3.2, 2.2]]];
  // the CS stage after Miller's split (Lecture 28, page 6)
  M.csMiller = (o = {}, dev = 'nmos') => {
    const b = dev === 'npn';
    return [
      ...vin(-0.6, 1.5), ['w', [-0.6, 1.5], [-0.6, 1]], ['R', [-0.6, 1], [0.8, 1], { n: 'R_S' }], ['w', [0.8, 1], [3, 1]],
      ['C', [1.2, 1], [1.2, 2.3], { n: b ? 'C_\\pi' : 'C_{gs}', side: 'l' }], ['gnd', [1.2, 2.3]],
      ['C', [2.2, 1], [2.2, 2.3], { n: 'C_1' }], ['gnd', [2.2, 2.3]],
      [dev, [4, 1]], ['gnd', [4, 2]],
      ['rail', [4, -1.6], { n: b ? 'V_{CC}' : 'V_{DD}' }], ['R', [4, -1.6], [4, 0], { n: 'R_L' }],
      ['w', [4, 0], [6.4, 0]], ['C', [4.8, 0], [4.8, 1.3], { n: 'C_2' }], ['gnd', [4.8, 1.3]], ['C', [5.7, 0], [5.7, 1.3], { n: 'C_L' }], ['gnd', [5.7, 1.3]],
      outT(6.4, 0),
    ];
  };

  // ================================================================ test-source pictures (OCTC, Lecture 29)
  const T = {};
  // the bridge rule: node 1 with R_left, node 2 with R_right and a transconductor; a test current through the gap
  T.bridge = (o = {}) => [
    ['node', [0, 0], { n: 'v_1', side: 'l', dot: true }], ['R', [0, 0], [0, 1.5], { n: o.rl || 'R_{left}', side: 'l' }], ['gnd', [0, 1.5]],
    ['w', [0, 0], [0, -1]], ['I', [0, -1], [3.4, -1], { n: o.test ? 'I_T' : '\\boxed{C}' }], ['w', [3.4, -1], [3.4, 0]],
    ['node', [3.4, 0], { n: 'v_2', side: 'a' }], ['w', [2.4, 0], [4.4, 0]],
    ['G', [2.4, 0], [2.4, 1.5], { n: o.gm || 'G_mv_1', side: 'l' }], ['gnd', [2.4, 1.5]],
    ['R', [4.4, 0], [4.4, 1.5], { n: o.rr || 'R_{right}' }], ['gnd', [4.4, 1.5]],
  ];
  T.bridgeC = (o = {}) => T.bridge(o).map((e) => (e[0] === 'I' ? ['C', e[1], e[2], { n: '\\boxed{C}' }] : e));
  // CS, tau_cgs: a test voltage where C_gs was (Lecture 29, page 3)
  T.csGs = () => [
    ['R', [0, 0], [1.6, 0], { n: 'R_S' }], ['w', [0, 0], [0, 1.2]], ['gnd', [0, 1.2]], ['w', [1.6, 0], [2.2, 0]],
    ['V', [2.2, 0], [2.2, 1.2], { n: 'V_T', side: 'l' }], ['gnd', [2.2, 1.2]], ['iarr', [1.9, 0], 'l', { n: 'I_T', side: 'a' }],
    ['G', [3.8, 0], [3.8, 1.2], { n: 'g_mV_T', side: 'l' }], ['gnd', [3.8, 1.2]], ['w', [3.8, 0], [4.8, 0]], ['R', [4.8, 0], [4.8, 1.2], { n: 'R_L' }], ['gnd', [4.8, 1.2]],
  ];
  // CS, tau_cgd: a test current where C_gd was (Lecture 29, page 3)
  T.csGd = (o = {}) => [
    ['R', [0, 0], [1.4, 0], { n: o.rs || 'R_S' }], ['w', [0, 0], [0, 1.2]], ['gnd', [0, 1.2]], ['w', [1.4, 0], [1.9, 0]],
    ['node', [1.9, 0], { n: 'v_1', side: 'b', dot: true }],
    ['I', [1.9, 0], [3.5, 0], { n: 'I_T' }], ['txt', [2.7, -0.78], '$V_T = v_2 - v_1$'],
    ['w', [3.5, 0], [5.4, 0]], ['node', [5.4, 0], { n: 'v_2', side: 'r' }],
    ['G', [4.1, 0], [4.1, 1.2], { n: o.gm || 'g_mv_1', side: 'l' }], ['gnd', [4.1, 1.2]], ['R', [5, 0], [5, 1.2], { n: o.rl || 'R_L' }], ['gnd', [5, 1.2]],
  ];
  // degenerated CS, tau_cgs: test voltage between gate and source (Lecture 29, page 4); r_ds drawn
  T.degGs = (o = {}) => [
    ['R', [0, 0], [1.4, 0], { n: 'R_G' }], ['w', [0, 0], [0, 1.2]], ['gnd', [0, 1.2]], ['w', [1.4, 0], [2, 0]],
    ['V', [2, 0], [2, 2], { n: 'V_T', side: 'l' }], ['iarr', [1.7, 0], 'l', { n: 'I_T', side: 'a' }],
    ['w', [2, 2], [4.4, 2]], ['node', [2.6, 2], { n: 'v_s', side: 'b', dot: true }],
    ['G', [3.6, 0.2], [3.6, 2], { n: 'g_mV_T', side: 'l' }],
    ...(o.rds === false ? [] : [['R', [4.4, 0.2], [4.4, 2], { n: 'r_{ds}' }]]),
    ['w', [3.6, 0.2], [5.4, 0.2]], ['R', [5.4, 0.2], [5.4, 1.4], { n: 'R_L' }], ['gnd', [5.4, 1.4]], ['node', [4.9, 0.2], { n: 'v_d', side: 'a' }],
    ['R', [3, 2], [3, 3.3], { n: 'R_S', side: 'l' }], ['gnd', [3, 3.3]],
  ];
  // follower bridge (C_gs of a source follower, or of a degenerated stage): the gate node, the source node, g_m v_t
  T.follow = (o = {}) => [
    ['node', [0, 0], { n: 'v_g', side: 'l', dot: true }], ['R', [0, 0], [0, 1.4], { n: o.rg || 'R_S', side: 'l' }], ['gnd', [0, 1.4]],
    ['w', [0, 0], [0, -1]], ['I', [0, -1], [3, -1], { n: 'I_T' }], ['w', [3, -1], [3, 0]],
    ['node', [3, 0], { n: 'v_s', side: 'r', dot: true }], ['R', [3, 0], [3, 1.4], { n: o.rs || 'R_L' }], ['gnd', [3, 1.4]],
    ['G', [1.8, 1.4], [1.8, 0], { n: o.gm || 'g_mv_{gs}', side: 'l' }], ['gnd', [1.8, 1.4]], ['w', [1.8, 0], [3, 0]],
  ];

  // ================================================================ physical pictures
  const X = {};
  // capacitor glyph across a gap, vertical (plates horizontal) at x from y1 to y2
  const capV = (x, y1, y2, cls = '') => { const m = (y1 + y2) / 2; return `<path class="${cls}" d="M${x},${y1}V${m - 4}M${x - 9},${m - 4}H${x + 9}M${x - 9},${m + 4}H${x + 9}M${x},${m + 4}V${y2}"/>`; };
  X.mosCross = () => {
    let s = '<svg class="schem" viewBox="-6 -4 592 318" width="560" role="img" aria-label="NMOS cross-section with its capacitances">';
    // body (p-substrate)
    s += '<path class="shade nodecl" d="M20,150H560V280H20Z"/><path class="nodecl" d="M20,150H560V280H20Z"/>';
    // n+ source and drain
    s += '<path class="nodecl" style="fill:var(--card-2)" d="M60,150V180Q60,200 80,200H180Q200,200 200,180V150Z"/>';
    s += '<path class="nodecl" style="fill:var(--card-2)" d="M380,150V180Q380,200 400,200H500Q520,200 520,180V150Z"/>';
    // depletion edges around the junctions
    s += '<path class="dash nodecl" d="M52,150V182Q52,208 80,208H180Q208,208 208,182V150"/>';
    s += '<path class="dash nodecl" d="M372,150V182Q372,208 400,208H500Q528,208 528,182V150"/>';
    // oxide and gate (the gate overlaps source and drain by L_ov)
    s += '<path class="nodecl" style="fill:var(--card-2)" d="M180,120H400V150H180Z"/>';
    s += '<path class="fillbg nodecl" d="M180,86H400V120H180Z"/><path class="thick nodecl" d="M180,86H400V120H180Z"/>';
    // channel: inversion layer, thinning toward the drain and pinched off before it (saturation)
    s += '<path class="carr nodecl" d="M200,150H352V151Q300,156 200,160Z"/><path class="nodecl" style="stroke:var(--accent);stroke-width:1.6" d="M200,160Q300,156 352,151"/>';
    // terminals
    s += '<path d="M108,150V30M290,86V30M472,150V30M290,280V300"/>';
    s += lab(108, 26, '$S$', 'b') + lab(290, 26, '$G$', 'b') + lab(472, 26, '$D$', 'b') + lab(300, 300, '$B$', 'l');
    // capacitor glyphs: oxide (gate-channel), the two overlaps, the two junctions
    s += capV(255, 120, 150) + capV(390, 120, 150) + capV(190, 120, 150);
    s += capV(160, 200, 236) + capV(470, 200, 236);
    s += lab(267, 135, '$C_{gs}$', 'l') + lab(402, 135, '$C_{gd}$', 'l') + lab(178, 135, words('overlap'), 'r');
    s += lab(172, 220, '$C_{sb}$', 'l') + lab(482, 220, '$C_{db}$', 'l');
    s += lab(105, 172, '$n^+$') + lab(455, 172, '$n^+$') + lab(290, 103, words('gate')) + lab(45, 262, '$p$', 'l');
    s += lab(206, 172, words('channel'), 'l') + lab(356, 166, words('pinch-off'), 'r');
    return s + '</svg>';
  };
  // the BJT as a slab: n+ emitter, thin p base, n collector; above it, the electrons stored in the base
  X.bjtCross = () => {
    let s = '<svg class="schem" viewBox="-6 -6 572 318" width="560" role="img" aria-label="BJT slab with the base charge and its capacitances">';
    const yT = 200, yB = 260, xE = 30, x1 = 200, x2 = 290, xC = 540;
    // regions
    s += `<path class="nodecl" style="fill:var(--card-2)" d="M${xE},${yT}H${x1}V${yB}H${xE}Z"/>`;
    s += `<path class="shade nodecl" d="M${x1},${yT}H${x2}V${yB}H${x1}Z"/>`;
    s += `<path class="nodecl" style="fill:var(--card-2)" d="M${x2},${yT}H${xC}V${yB}H${x2}Z"/>`;
    s += `<path class="nodecl" d="M${xE},${yT}H${xC}V${yB}H${xE}Z"/>`;
    // depletion regions (dashed boundaries)
    s += `<path class="dash nodecl" d="M${x1 - 8},${yT}V${yB}M${x1 + 8},${yT}V${yB}M${x2 - 10},${yT}V${yB}M${x2 + 26},${yT}V${yB}"/>`;
    s += lab((xE + x1) / 2, 230, `$n^+$ ${words('emitter')}`) + lab((x1 + x2) / 2, 230, `$p$ ${words('base')}`) + lab((x2 + 30 + xC) / 2, 230, `$n$ ${words('collector')}`);
    // terminals
    s += `<path d="M${xE},${yB - 30}H${xE - 16}M${xC},${yB - 30}H${xC + 16}M${(x1 + x2) / 2},${yB}V${yB + 22}"/>`;
    s += lab(xE - 18, yB - 30, '$E$', 'r') + lab(xC + 18, yB - 30, '$C$', 'l') + lab((x1 + x2) / 2 + 6, yB + 24, '$B$', 'l');
    // junction capacitor labels under the depletion layers
    s += lab(x1, yB + 30, '$C_{je}$', 't') + lab(x2 + 8, yB + 30, '$C_\\mu$', 't');
    s += `<path class="dim nodecl" d="M${x1},${yB + 4}V${yB + 26}M${x2 + 8},${yB + 4}V${yB + 26}"/>`;
    // electrons stored in the base: n(x) falls linearly from the emitter edge to ~0 at the collector edge
    const b0 = 180, top1 = 90, top2 = 50;
    s += `<path class="nodecl" style="stroke:var(--dim)" d="M${x1 + 8},${b0}V30M${x1 + 8},${b0}H${x2 - 10}"/>`;
    s += `<path class="carr nodecl" d="M${x1 + 8},${b0}V${top1}L${x2 - 10},${b0}Z"/>`;
    s += `<path class="nodecl" style="stroke:var(--accent);stroke-width:2" d="M${x1 + 8},${top1}L${x2 - 10},${b0}"/>`;
    s += `<path class="dash nodecl" d="M${x1 + 8},${top2}L${x2 - 10},${b0}"/>`;
    s += lab(x1 + 2, 30, '$n(x)$', 'r') + lab(x1 + 30, 140, '$Q_F$', 'c');
    s += lab(x2 - 26, 92, `${words('more')} $V_{BE}$: $+\\Delta Q_F$`, 'l');
    s += lab(x2 + 46, 150, `${words('stored charge')} $Q_F = \\tau_FI_C$<br/>$C_b = \\dfrac{dQ_F}{dV_{BE}} = \\tau_Fg_m$`, 'l');
    return s + '</svg>';
  };

  // ================================================================ the open-circuit resistance of every capacitor
  // p: gm, rds (MOS) or gm, rpi, ro (BJT; beta = gm rpi), RS, RL (+ RG for csdeg, RE for cedeg), capacitances in p.C.
  // Returns [{ key, tex, R, kind: 'gnd' | 'bridge' | 'follow' }] in the drawing's order. Checked against a 10,200-case
  // random nodal solve (scratchpad a8/check_formulas.py).
  const srcR = (gm, rds, RD) => (rds === INF ? 1 / gm : (rds + RD) / (1 + gm * rds));     // looking into a source
  const STG = {
    cs: (p) => { const Rr = par(p.RL, p.rds ?? INF); return [
      { key: 'Cgs', tex: 'C_{gs}', R: p.RS, kind: 'gnd' },
      { key: 'Cgd', tex: 'C_{gd}', R: p.RS + Rr + p.gm * p.RS * Rr, kind: 'bridge', Rl: p.RS, Rr },
      { key: 'CL', tex: 'C_L', R: Rr, kind: 'gnd' }]; },
    ce: (p) => { const Rl = par(p.RS, p.rpi), Rr = par(p.RL, p.ro ?? INF); return [
      { key: 'Cpi', tex: 'C_\\pi', R: Rl, kind: 'gnd' },
      { key: 'Cmu', tex: 'C_\\mu', R: Rl + Rr + p.gm * Rl * Rr, kind: 'bridge', Rl, Rr },
      { key: 'CL', tex: 'C_L', R: Rr, kind: 'gnd' }]; },
    csdeg: (p) => {
      const rds = p.rds ?? INF;
      if (rds === INF) return [
        { key: 'Cgs', tex: 'C_{gs}', R: (p.RG + p.RS) / (1 + p.gm * p.RS), kind: 'follow' },
        { key: 'Cgd', tex: 'C_{gd}', R: p.RG + p.RL + p.gm * p.RG * p.RL / (1 + p.gm * p.RS), kind: 'bridge', Rl: p.RG, Rr: p.RL, GM: p.gm / (1 + p.gm * p.RS) },
        { key: 'CL', tex: 'C_L', R: p.RL, kind: 'gnd' }];
      const Rx = rds + p.RS + p.gm * rds * p.RS, Rr = par(p.RL, Rx), GM = p.gm * rds / Rx;
      return [
        { key: 'Cgs', tex: 'C_{gs}', R: ((p.RG + p.RS) * (rds + p.RL) + p.RG * p.RS) / (p.RL + Rx), kind: 'follow' },
        { key: 'Cgd', tex: 'C_{gd}', R: p.RG + Rr + GM * p.RG * Rr, kind: 'bridge', Rl: p.RG, Rr, GM },
        { key: 'CL', tex: 'C_L', R: Rr, kind: 'gnd' }];
    },
    cedeg: (p) => {
      const beta = p.gm * p.rpi, Rb = par(p.RS, p.rpi + (beta + 1) * p.RE), GM = p.gm / (1 + p.gm * p.RE * (beta + 1) / beta);
      return [
        { key: 'Cpi', tex: 'C_\\pi', R: par(p.rpi, (p.RS + p.RE) / (1 + p.gm * p.RE)), kind: 'follow' },
        { key: 'Cmu', tex: 'C_\\mu', R: Rb + p.RL + GM * Rb * p.RL, kind: 'bridge', Rl: Rb, Rr: p.RL, GM },
        { key: 'CL', tex: 'C_L', R: p.RL, kind: 'gnd' }];
    },
    cg: (p) => { const rds = p.rds ?? INF, Ro = rds === INF ? p.RL : par(p.RL, rds + p.RS + p.gm * rds * p.RS); return [
      { key: 'Cgs', tex: 'C_{gs}', R: par(p.RS, srcR(p.gm, rds, p.RL)), kind: 'gnd' },
      { key: 'Cgd', tex: 'C_{gd}', R: Ro, kind: 'gnd' },
      { key: 'CL', tex: 'C_L', R: Ro, kind: 'gnd' }]; },
    cb: (p) => {
      const ro = p.ro ?? INF, RE = par(p.RS, p.rpi), Rc = ro === INF ? INF : ro * (1 + p.gm * RE) + RE, Ro = par(p.RL, Rc);
      return [
        { key: 'Cpi', tex: 'C_\\pi', R: par(p.RS, p.rpi, srcR(p.gm, ro, p.RL)), kind: 'gnd' },
        { key: 'Cmu', tex: 'C_\\mu', R: Ro, kind: 'gnd' },
        { key: 'CL', tex: 'C_L', R: Ro, kind: 'gnd' }];
    },
    sf: (p) => { const RL = par(p.RL, p.rds ?? INF); return [
      { key: 'Cgs', tex: 'C_{gs}', R: (p.RS + RL) / (1 + p.gm * RL), kind: 'follow' },
      { key: 'Cgd', tex: 'C_{gd}', R: p.RS, kind: 'gnd' },
      { key: 'CL', tex: 'C_L', R: par(RL, 1 / p.gm), kind: 'gnd' }]; },
    ef: (p) => { const beta = p.gm * p.rpi; return [
      { key: 'Cpi', tex: 'C_\\pi', R: par(p.rpi, (p.RS + p.RL) / (1 + p.gm * p.RL)), kind: 'follow' },
      { key: 'Cmu', tex: 'C_\\mu', R: par(p.RS, p.rpi + (beta + 1) * p.RL), kind: 'gnd' },
      { key: 'CL', tex: 'C_L', R: par(p.RL, (p.rpi + p.RS) / (beta + 1)), kind: 'gnd' }]; },
    casc: (p) => {
      const r1 = p.rds1 ?? INF, r2 = p.rds2 ?? INF, RX = par(r1, srcR(p.gm2, r2, p.RL));
      const Ro = (r1 === INF || r2 === INF) ? p.RL : par(p.RL, r1 + r2 + p.gm2 * r2 * r1);
      return [
        { key: 'Cgs1', tex: 'C_{gs1}', R: p.RS, kind: 'gnd' },
        { key: 'Cgd1', tex: 'C_{gd1}', R: p.RS + RX + p.gm1 * p.RS * RX, kind: 'bridge', Rl: p.RS, Rr: RX },
        { key: 'Cgs2', tex: 'C_{gs2}', R: RX, kind: 'gnd' },
        { key: 'Cgd2', tex: 'C_{gd2}', R: Ro, kind: 'gnd' },
        { key: 'CL', tex: 'C_L', R: Ro, kind: 'gnd' }];
    },
    bjtcasc: (p) => {
      const r1 = p.ro1 ?? INF, r2 = p.ro2 ?? INF, Rl = par(p.RS, p.rpi1), RX = par(r1, p.rpi2, srcR(p.gm2, r2, p.RL));
      const RE = par(r1, p.rpi2), Rc = r2 === INF ? INF : r2 * (1 + p.gm2 * RE) + RE, Ro = par(p.RL, Rc);
      return [
        { key: 'Cpi1', tex: 'C_{\\pi1}', R: Rl, kind: 'gnd' },
        { key: 'Cmu1', tex: 'C_{\\mu1}', R: Rl + RX + p.gm1 * Rl * RX, kind: 'bridge', Rl, Rr: RX },
        { key: 'Cpi2', tex: 'C_{\\pi2}', R: RX, kind: 'gnd' },
        { key: 'Cmu2', tex: 'C_{\\mu2}', R: Ro, kind: 'gnd' },
        { key: 'CL', tex: 'C_L', R: Ro, kind: 'gnd' }];
    },
  };

  // ================================================================ a small complex nodal solver (exact bandwidths)
  // elements: ['R', a, b, ohms] ['C', a, b, farads] ['G', a, b, cp, cn, gm] (current gm(v_cp - v_cn) from a to b)
  // ['V', a] (the 1 V input source from node a to ground). Node 0 is ground. Returns v(out) at s = j*w.
  const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]], csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
  function cxSolve(els, nN, w, out) {
    // node voltages 1..nN, plus one source current row
    const n = nN + 1, A = Array.from({ length: n }, () => Array.from({ length: n }, () => [0, 0])), b = Array.from({ length: n }, () => [0, 0]);
    const st = (i, j, y) => { if (i && j) A[i - 1][j - 1] = cadd(A[i - 1][j - 1], y); };
    const two = (a, c, y) => { st(a, a, y); st(c, c, y); st(a, c, [-y[0], -y[1]]); st(c, a, [-y[0], -y[1]]); };
    for (const e of els) {
      if (e[0] === 'R') two(e[1], e[2], [1 / e[3], 0]);
      else if (e[0] === 'C') two(e[1], e[2], [0, w * e[3]]);
      else if (e[0] === 'G') { const [, a, c, cp, cn, g] = e; st(a, cp, [g, 0]); st(a, cn, [-g, 0]); st(c, cp, [-g, 0]); st(c, cn, [g, 0]); }
      else if (e[0] === 'V') { A[e[1] - 1][n - 1] = cadd(A[e[1] - 1][n - 1], [1, 0]); A[n - 1][e[1] - 1] = [1, 0]; b[n - 1] = [1, 0]; }
    }
    // Gaussian elimination with partial pivoting
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.hypot(...A[r][c]) > Math.hypot(...A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
      for (let r = c + 1; r < n; r++) {
        if (!A[r][c][0] && !A[r][c][1]) continue;
        const k = cdiv(A[r][c], A[c][c]);
        for (let j = c; j < n; j++) A[r][j] = csub(A[r][j], cmul(k, A[c][j]));
        b[r] = csub(b[r], cmul(k, b[c]));
      }
    }
    const x = Array(n);
    for (let r = n - 1; r >= 0; r--) {
      let acc = b[r];
      for (let j = r + 1; j < n; j++) acc = csub(acc, cmul(A[r][j], x[j]));
      x[r] = cdiv(acc, A[r][r]);
    }
    return x[out - 1];
  }
  // the stages as element lists (input: node 1 = the ideal source), mirroring the drawings
  const mosEl = (D, Gt, S, gm, rds) => [['G', D, S, Gt, S, gm], ...(rds !== undefined && rds !== INF ? [['R', D, S, rds]] : [])];
  const NETS = {
    cs: (p) => ({ out: 3, n: 3, els: [['V', 1], ['R', 1, 2, p.RS], ...mosEl(3, 2, 0, p.gm, p.rds), ['R', 3, 0, p.RL], ['C', 2, 0, p.C.Cgs], ['C', 2, 3, p.C.Cgd], ['C', 3, 0, p.C.CL]] }),
    ce: (p) => ({ out: 3, n: 3, els: [['V', 1], ['R', 1, 2, p.RS], ['R', 2, 0, p.rpi], ...mosEl(3, 2, 0, p.gm, p.ro), ['R', 3, 0, p.RL], ['C', 2, 0, p.C.Cpi], ['C', 2, 3, p.C.Cmu], ['C', 3, 0, p.C.CL]] }),
    csdeg: (p) => ({ out: 3, n: 4, els: [['V', 1], ['R', 1, 2, p.RG], ...mosEl(3, 2, 4, p.gm, p.rds), ['R', 4, 0, p.RS], ['R', 3, 0, p.RL], ['C', 2, 4, p.C.Cgs], ['C', 2, 3, p.C.Cgd], ['C', 3, 0, p.C.CL]] }),
    cedeg: (p) => ({ out: 3, n: 4, els: [['V', 1], ['R', 1, 2, p.RS], ['R', 2, 4, p.rpi], ...mosEl(3, 2, 4, p.gm, p.ro), ['R', 4, 0, p.RE], ['R', 3, 0, p.RL], ['C', 2, 4, p.C.Cpi], ['C', 2, 3, p.C.Cmu], ['C', 3, 0, p.C.CL]] }),
    cg: (p) => ({ out: 3, n: 3, els: [['V', 1], ['R', 1, 2, p.RS], ...mosEl(3, 0, 2, p.gm, p.rds), ['R', 3, 0, p.RL], ['C', 2, 0, p.C.Cgs], ['C', 3, 0, p.C.Cgd], ['C', 3, 0, p.C.CL]] }),
    cb: (p) => ({ out: 3, n: 3, els: [['V', 1], ['R', 1, 2, p.RS], ['R', 2, 0, p.rpi], ...mosEl(3, 0, 2, p.gm, p.ro), ['R', 3, 0, p.RL], ['C', 2, 0, p.C.Cpi], ['C', 3, 0, p.C.Cmu], ['C', 3, 0, p.C.CL]] }),
    sf: (p) => ({ out: 3, n: 3, els: [['V', 1], ['R', 1, 2, p.RS], ...mosEl(0, 2, 3, p.gm, p.rds), ['R', 3, 0, p.RL], ['C', 2, 3, p.C.Cgs], ['C', 2, 0, p.C.Cgd], ['C', 3, 0, p.C.CL]] }),
    ef: (p) => ({ out: 3, n: 3, els: [['V', 1], ['R', 1, 2, p.RS], ['R', 2, 3, p.rpi], ...mosEl(0, 2, 3, p.gm, p.ro), ['R', 3, 0, p.RL], ['C', 2, 3, p.C.Cpi], ['C', 2, 0, p.C.Cmu], ['C', 3, 0, p.C.CL]] }),
    casc: (p) => ({ out: 4, n: 4, els: [['V', 1], ['R', 1, 2, p.RS], ...mosEl(3, 2, 0, p.gm1, p.rds1), ...mosEl(4, 0, 3, p.gm2, p.rds2), ['R', 4, 0, p.RL],
      ['C', 2, 0, p.C.Cgs1], ['C', 2, 3, p.C.Cgd1], ['C', 3, 0, p.C.Cgs2], ['C', 4, 0, p.C.Cgd2], ['C', 4, 0, p.C.CL]] }),
    bjtcasc: (p) => ({ out: 4, n: 4, els: [['V', 1], ['R', 1, 2, p.RS], ['R', 2, 0, p.rpi1], ...mosEl(3, 2, 0, p.gm1, p.ro1), ['R', 3, 0, p.rpi2], ...mosEl(4, 0, 3, p.gm2, p.ro2), ['R', 4, 0, p.RL],
      ['C', 2, 0, p.C.Cpi1], ['C', 2, 3, p.C.Cmu1], ['C', 3, 0, p.C.Cpi2], ['C', 4, 0, p.C.Cmu2], ['C', 4, 0, p.C.CL]] }),
  };
  // |H(jw)| and the exact -3 dB frequency (first crossing of |H(0)|/sqrt 2, by a sweep and bisection)
  function hmag(kind, p, w) { const N = NETS[kind](p); const v = cxSolve(N.els, N.n, w, N.out); return Math.hypot(v[0], v[1]); }
  function w3db(kind, p) {
    const h0 = hmag(kind, p, 0), tgt = h0 / Math.SQRT2;
    let lo = 1e3, prev = lo;
    for (let k = 0; k <= 400; k++) {
      const w = 10 ** (3 + k * 0.03);
      if (hmag(kind, p, w) < tgt) { let a = prev, b = w; for (let i = 0; i < 60; i++) { const m = Math.sqrt(a * b); if (hmag(kind, p, m) < tgt) b = m; else a = m; } return Math.sqrt(a * b); }
      prev = w; lo = w;
    }
    return INF;
  }
  // every capacitor's open-circuit time constant, grouped where capacitors share both ends (C_gd + C_L in a CG)
  function octc(kind, p) {
    const rows = STG[kind](p).map((r) => Object.assign({}, r, { C: p.C[r.key], tau: r.R * p.C[r.key] }));
    const sum = rows.reduce((a, r) => a + r.tau, 0);
    return { rows, sum, west: 1 / sum };
  }

  // ================================================================ Chapter 12 generators
  const MS = (g) => `${f(g * 1e3, 3)}\\,\\text{mS}`;
  // CS / CE parameter sets and Lecture 28's two-node model
  function csParams(dev) {
    if (dev === 'bjt') {
      const IC = pick([0.25, 0.5, 1]) * 1e-3, gm = IC / 0.025, beta = 100;
      return { dev, IC, gm, beta, rpi: beta / gm, RS: pick([1, 2, 2.5, 5]) * 1e3, RL: pick([2, 4, 5]) * 1e3,
        C: { Cpi: pick([2, 4, 5, 10]) * 1e-12, Cmu: pick([0.1, 0.2, 0.25, 0.5]) * 1e-12, CL: pick([0.5, 1, 2]) * 1e-12 } };
    }
    return { dev, gm: pick([2, 4, 5]) * 1e-3, RS: pick([2, 4, 5, 10]) * 1e3, RL: pick([4, 5, 8, 10]) * 1e3,
      C: { Cgs: pick([50, 100, 200]) * 1e-15, Cgd: pick([10, 20, 25]) * 1e-15, CL: pick([100, 200, 300]) * 1e-15 } };
  }
  function twoNode(p) {
    const bj = p.dev === 'bjt';
    const RTH = bj ? par(p.RS, p.rpi) : p.RS, k = bj ? p.rpi / (p.RS + p.rpi) : 1;
    const Cin = bj ? p.C.Cpi : p.C.Cgs, Cxy = bj ? p.C.Cmu : p.C.Cgd, Cout = p.C.CL, RL = p.RL, gm = p.gm;
    const a = RTH * RL * (Cin * Cxy + Cout * Cxy + Cin * Cout);
    const b = (1 + gm * RL) * Cxy * RTH + RTH * Cin + RL * (Cxy + Cout);
    const d = Math.sqrt(b * b - 4 * a);
    return { RTH, k, Cin, Cxy, Cout, RL, gm, a, b, r1: 2 / (b + d), r2: (b + d) / (2 * a), wz: gm / Cxy,
      tMil: (1 + gm * RL) * Cxy * RTH, tIn: RTH * Cin, tOut: RL * (Cxy + Cout), CM: (1 + gm * RL) * Cxy, C2: (1 + 1 / (gm * RL)) * Cxy,
      win: 1 / (RTH * (Cin + (1 + gm * RL) * Cxy)), wout: 1 / (RL * (Cout + (1 + 1 / (gm * RL)) * Cxy)), A0: -gm * RL * k,
      names: bj ? { in: 'C_\\pi', xy: 'C_\\mu' } : { in: 'C_{gs}', xy: 'C_{gd}' } };
  }
  const csShown = (p) => (p.dev === 'bjt'
    ? { RS: KOs(p.RS), RL: KOs(p.RL), Cpi: CT(p.C.Cpi), Cmu: CT(p.C.Cmu), CL: CT(p.C.CL) }
    : { RS: KOs(p.RS), RL: KOs(p.RL), Cgs: CT(p.C.Cgs), Cgd: CT(p.C.Cgd), CL: CT(p.C.CL) });
  const csDev = (p) => (p.dev === 'bjt'
    ? `$I_C = ${IT(p.IC)}$ (so $g_m = I_C/V_T = ${MS(p.gm)}$), $\\beta = ${p.beta}$ (so $r_\\pi = \\beta/g_m = ${RT(p.rpi)}$), $r_o\\to\\infty$`
    : `$g_m = ${MS(p.gm)}$, $r_{ds}\\to\\infty$ ($C_L$ includes $C_{db}$)`);
  const csFig = (p, hi) => (p.dev === 'bjt' ? F.ce({ v: csShown(p), hi }) : F.cs({ v: csShown(p), hi }));

  // ---------------------------------------------------------------- MOS capacitances from the geometry, and f_T
  GENS.bk_cap_mos = () => {
    const W = pick([10, 20, 30, 40, 50, 60]), L = pick([0.5, 1, 2]), Lov = pick([0.05, 0.1]), Vov = pick([0.1, 0.2, 0.25, 0.3]), Cox = 2.5;
    const WLC = W * L * Cox * 1e-15, Cov = W * Lov * Cox * 1e-15, Cgs = (2 / 3) * WLC + Cov, Cgd = Cov;
    const gm = 100e-6 * (W / L) * Vov, wT = gm / (Cgs + Cgd), fT = wT / (2 * Math.PI);
    return {
      q: `An NMOS has $W = ${W}\\,\\mu\\text{m}$, $L = ${L}\\,\\mu\\text{m}$, gate overlap $L_{ov} = ${Lov}\\,\\mu\\text{m}$ on each side, $C_{ox} = 2.5\\,\\text{fF}/\\mu\\text{m}^2$ ($\\mu_nC_{ox} = 100\\,\\mu\\text{A/V}^2$), and is biased in saturation at $V_{ov} = ${Vov}\\,\\text{V}$. Find $C_{gs}$, $C_{gd}$, $g_m$ and the transit frequency $f_T = \\dfrac{g_m}{2\\pi(C_{gs} + C_{gd})}$.`,
      parts: [
        num('C_{gs}', Cgs, 'C', [{ v: WLC + Cov, msg: 'In saturation the channel is pinched off at the drain end: only $\\tfrac{2}{3}$ of $WLC_{ox}$ belongs to $C_{gs}$.' }, { v: (2 / 3) * WLC, msg: 'Add the source-side overlap $WL_{ov}C_{ox}$.' }]),
        num('C_{gd}', Cgd, 'C', [{ v: Cgd + WLC / 3, msg: 'The channel does not reach the drain in saturation: $C_{gd}$ is only the overlap.' }]),
        num('g_m', gm, 'g'),
        num('f_T', fT, 'f', [{ v: wT, msg: 'That is $\\omega_T$ in rad/s. Divide by $2\\pi$ for hertz.' }, { v: gm / Cgs / (2 * Math.PI), msg: 'Use $C_{gs} + C_{gd}$: with the drain shorted, both capacitors hang on the gate.' }]),
      ],
      hints: [`$WLC_{ox} = ${W}\\times${L}\\times2.5\\,\\text{fF} = ${f(WLC * 1e15, 4)}\\,\\text{fF}$; the overlap is $WL_{ov}C_{ox}$.`, '$g_m = \\mu_nC_{ox}\\tfrac{W}{L}V_{ov}$.'],
      sol: `**Gate-oxide capacitance of the whole gate:** $WLC_{ox} = ${W}\\,\\mu\\text{m}\\times${L}\\,\\mu\\text{m}\\times2.5\\,\\text{fF}/\\mu\\text{m}^2 = ${f(WLC * 1e15, 4)}\\,\\text{fF}$. **Each overlap:** $WL_{ov}C_{ox} = ${W}\\times${Lov}\\times2.5 = ${f(Cov * 1e15, 4)}\\,\\text{fF}$.

**In saturation** the channel charge tapers to zero at the drain end, so the gate sees two thirds of $WLC_{ox}$ through the source, plus the source overlap; the drain sees only its overlap:
$$C_{gs} = \\tfrac{2}{3}WLC_{ox} + WL_{ov}C_{ox} = ${f((2 / 3) * WLC * 1e15, 4)} + ${f(Cov * 1e15, 4)} = ${CT(Cgs)},\\qquad C_{gd} = WL_{ov}C_{ox} = ${CT(Cgd)}$$

**Transconductance:** $g_m = \\mu_nC_{ox}\\tfrac{W}{L}V_{ov} = 100\\,\\mu\\text{A/V}^2\\times${f(W / L, 3)}\\times${Vov}\\,\\text{V} = ${MS(gm)}$.

**Transit frequency:**
$$\\omega_T = \\frac{g_m}{C_{gs} + C_{gd}} = \\frac{${MS(gm)}}{${CT(Cgs + Cgd)}} = ${WT(wT)},\\qquad f_T = \\frac{\\omega_T}{2\\pi} = ${FT(fT)}$$
Without the overlaps it would be $\\tfrac{3}{2}\\mu_nV_{ov}/L^2$ (with $\\mu_n = 0.04\\,\\text{m}^2/\\text{V·s}$): $${FT(1.5 * 0.04 * Vov / (L * 1e-6) ** 2 / (2 * Math.PI))}$. The overlaps cost speed, and a shorter $L$ buys it back as $1/L^2$.`,
      _chk: { k: 'cap_mos', W, L, Lov, Vov, Cgs, Cgd, gm, fT },
    };
  };

  // ---------------------------------------------------------------- the BJT: C_b from the stored base charge, and f_T
  GENS.bk_cap_bjt = () => {
    const IC = pick([0.1, 0.2, 0.5, 1, 2, 5]) * 1e-3, tF = pick([10, 20, 50]) * 1e-12, Cje = pick([0.1, 0.2, 0.5]) * 1e-12, Cmu = pick([0.05, 0.1, 0.2]) * 1e-12;
    const gm = IC / 0.025, Cb = tF * gm, Cpi = Cb + Cje, wT = gm / (Cpi + Cmu), fT = wT / (2 * Math.PI);
    return {
      q: `An NPN has a forward transit time $\\tau_F = ${f(tF * 1e12, 3)}\\,\\text{ps}$, $C_{je} = ${CT(Cje)}$ and $C_\\mu = ${CT(Cmu)}$, and runs at $I_C = ${IT(IC)}$ ($V_T = 25\\,\\text{mV}$). Find $g_m$, the base-charging capacitance $C_b$, $C_\\pi$, and $f_T = \\dfrac{g_m}{2\\pi(C_\\pi + C_\\mu)}$.`,
      parts: [
        num('g_m', gm, 'g'),
        num('C_b', Cb, 'C', [{ v: tF * IC, msg: 'That is $\\tau_FI_C = Q_F$, the stored charge itself (in coulombs). The capacitance is how fast it grows with $V_{BE}$: $C_b = dQ_F/dV_{BE} = \\tau_Fg_m$.' }]),
        num('C_\\pi', Cpi, 'C', [{ v: Cb, msg: '$C_\\pi = C_b + C_{je}$: add the base–emitter depletion capacitance.' }]),
        num('f_T', fT, 'f', [{ v: wT, msg: 'That is $\\omega_T$ in rad/s. Divide by $2\\pi$.' }, { v: gm / Cpi / (2 * Math.PI), msg: 'Include $C_\\mu$: with the collector shorted it also hangs on the base.' }]),
      ],
      hints: ['$g_m = I_C/V_T$.', '$Q_F = \\tau_FI_C$, so $C_b = dQ_F/dV_{BE} = \\tau_F\\,dI_C/dV_{BE} = \\tau_Fg_m$.'],
      sol: `$g_m = I_C/V_T = ${IT(IC)}/25\\,\\text{mV} = ${MS(gm)}$.

**Base charging.** The electrons in transit across the base are a stored charge $Q_F = \\tau_FI_C$. Raising $V_{BE}$ raises $I_C$ and so the stored charge: $C_b = \\dfrac{dQ_F}{dV_{BE}} = \\tau_Fg_m = ${f(tF * 1e12, 3)}\\,\\text{ps}\\times${MS(gm)} = ${CT(Cb)}$.

$C_\\pi = C_b + C_{je} = ${CT(Cb)} + ${CT(Cje)} = ${CT(Cpi)}$.

$$\\omega_T = \\frac{g_m}{C_\\pi + C_\\mu} = \\frac{${MS(gm)}}{${CT(Cpi + Cmu)}} = ${WT(wT)},\\qquad f_T = ${FT(fT)}$$
${Cb > 3 * (Cje + Cmu) ? `Here $C_b$ dominates, so $\\omega_T$ is close to its ceiling $1/\\tau_F = ${WT(1 / tF)}$: more current would barely help.` : `Here the fixed capacitances $C_{je} + C_\\mu$ still matter, so more current would raise $f_T$ (toward the ceiling $1/\\tau_F = ${WT(1 / tF)}$).`}`,
      _chk: { k: 'cap_bjt', IC, tF, Cje, Cmu, gm, Cb, Cpi, fT },
    };
  };

  // ---------------------------------------------------------------- one pole per node
  const NODE_K = ['gate', 'base', 'source', 'emitter', 'drain', 'collector', 'sfout', 'efin'];
  GENS.bk_node_pole = (opts = {}) => {
    const k = pick(opts.kinds || NODE_K);
    const bj = ['base', 'emitter', 'collector', 'efin'].includes(k);
    const p = bj ? (() => { const IC = pick([0.5, 1, 2]) * 1e-3, gm = IC / 0.025, beta = pick([100, 200]); return { IC, gm, beta, rpi: beta / gm }; })() : { gm: pick([1, 2, 4, 5]) * 1e-3 };
    p.RS = pick([0.5, 1, 2, 5, 10]) * 1e3; p.RL = pick([1, 2, 5, 10]) * 1e3; p.rds = pick([50, 100, 200]) * 1e3; p.ro = pick([50, 100]) * 1e3;
    const Cv = pick([0.2, 0.5, 1, 2, 5]) * 1e-12;
    let R, fig, what, cname, why, traps = [];
    const v = { RS: KOs(p.RS), RL: KOs(p.RL) };
    if (k === 'gate') { cname = 'C_{gs}'; R = p.RS; fig = F.cs({ caps: ['Cgs'], hi: 'Cgs', v: Object.assign(v, { Cgs: CT(Cv) }) });
      what = 'the gate node of a common source ($C_{gd}$ ignored)'; why = 'The gate draws no current, so the only path from the gate node to ground is $R_S$ (to the zeroed source).';
      traps = [{ v: par(p.RS, 1 / p.gm), msg: 'A gate is an open circuit: the transistor adds nothing in parallel here.' }]; }
    if (k === 'base') { cname = 'C_\\pi'; R = par(p.RS, p.rpi); fig = F.ce({ caps: ['Cpi'], hi: 'Cpi', v: Object.assign(v, { Cpi: CT(Cv) }) });
      what = 'the base node of a common emitter ($C_\\mu$ ignored)'; why = 'Two paths to ground: $R_S$ to the zeroed source, and $r_\\pi$ through the grounded emitter. A base is not a gate.';
      traps = [{ v: p.RS, msg: 'That is the MOSFET answer. The base also has $r_\\pi$ to ground (through the grounded emitter).' }, { v: p.RS + p.rpi, msg: 'Both paths go from the base to ground: parallel, not series.' }]; }
    if (k === 'source') { cname = 'C_{gs}'; R = par(p.RS, 1 / p.gm); fig = F.cg({ caps: ['Cgs'], hi: 'Cgs', v: Object.assign(v, { Cgs: CT(Cv) }) });
      what = 'the input (source) node of a common gate ($r_{ds}$ ignored)'; why = 'Looking up into the source with the gate held you see $1/g_m$; in parallel with $R_S$ down to the zeroed source.';
      traps = [{ v: p.RS, msg: 'The source node also has the transistor on it: about $1/g_m$, in parallel with $R_S$.' }]; }
    if (k === 'emitter') { cname = 'C_\\pi'; R = par(p.RS, p.rpi / (p.beta + 1)); fig = F.cb({ caps: ['Cpi'], hi: 'Cpi', v: Object.assign(v, { Cpi: CT(Cv) }) });
      what = 'the input (emitter) node of a common base ($r_o$ ignored)'; why = 'Looking into the emitter with the base held you see $r_\\pi/(\\beta + 1)\\approx 1/g_m$; in parallel with $R_S$.';
      traps = [{ v: p.RS, msg: 'The emitter node also has the transistor on it: $r_\\pi/(\\beta + 1)\\approx1/g_m$.' }, { v: par(p.RS, p.rpi), msg: 'Looking into an emitter, $r_\\pi$ is divided by $\\beta + 1$.' }]; }
    if (k === 'drain') { cname = 'C_L'; R = par(p.RL, p.rds); fig = F.cs({ caps: ['CL'], hi: 'CL', v: Object.assign(v, { CL: CT(Cv) }) });
      what = `the output (drain) node of a common source with $r_{ds} = ${RT(p.rds)}$`; why = 'With the input zeroed the gate is at 0, so the transistor is just $r_{ds}$ from the drain to ground, in parallel with $R_L$.';
      traps = [{ v: p.RL, msg: 'Keep $r_{ds}$: it also runs from the drain to ground.' }, { v: par(p.RL, 1 / p.gm), msg: 'A drain is not a source: the transistor adds $r_{ds}$, not $1/g_m$.' }]; }
    if (k === 'collector') { cname = 'C_L'; R = par(p.RL, p.ro); fig = F.ce({ caps: ['CL'], hi: 'CL', v: Object.assign(v, { CL: CT(Cv) }) });
      what = `the output (collector) node of a common emitter with $r_o = ${RT(p.ro)}$`; why = 'With the input zeroed $v_\\pi = 0$, so the BJT is just $r_o$ from the collector to ground, in parallel with $R_L$.';
      traps = [{ v: p.RL, msg: 'Keep $r_o$: it also runs from the collector to ground.' }]; }
    if (k === 'sfout') { cname = 'C_L'; R = par(p.RL, 1 / p.gm); fig = F.sf({ caps: ['CL'], hi: 'CL', v: Object.assign(v, { CL: CT(Cv) }) });
      what = 'the output (source) node of a source follower ($r_{ds}$ ignored)'; why = 'The gate sits at 0 (no current in $R_S$), so looking up into the source you see $1/g_m$, in parallel with $R_L$.';
      traps = [{ v: p.RL, msg: 'The output is a source: the transistor adds about $1/g_m$ in parallel, and it is small.' }]; }
    if (k === 'efin') { cname = 'C_\\mu'; R = par(p.RS, p.rpi + (p.beta + 1) * p.RL); fig = F.ef({ caps: ['Cmu'], hi: 'Cmu', v: Object.assign(v, { Cmu: CT(Cv) }) });
      what = 'the input (base) node of an emitter follower ($C_\\pi$ ignored; $C_\\mu$ runs from the base to $V_{CC}$)'; why = 'Two paths: $R_S$, and the base looking in, $r_\\pi + (\\beta + 1)R_L$ (the $(\\beta + 1)$ rule).';
      traps = [{ v: p.RS, msg: 'A base draws current: looking in you see $r_\\pi + (\\beta + 1)R_L$, in parallel with $R_S$.' }, { v: par(p.RS, p.rpi), msg: 'The emitter is not grounded: $R_L$ appears $(\\beta + 1)$ times bigger from the base.' }]; }
    const w = 1 / (R * Cv), fr = w / (2 * Math.PI);
    const devT = bj ? `$I_C = ${IT(p.IC)}$ ($g_m = ${MS(p.gm)}$), $\\beta = ${p.beta}$ ($r_\\pi = ${RT(p.rpi)}$)` : `$g_m = ${MS(p.gm)}$`;
    return {
      fig,
      q: `The boxed capacitor $${cname} = ${CT(Cv)}$ sits on ${what}. ${devT}. Find the resistance from that node to ground (input zeroed) and the pole it makes, in rad/s and in Hz.`,
      parts: [
        BK.res('R_{node}', R, undefined, traps),
        num('\\omega_p', w, 'w', traps.map((t) => ({ v: 1 / (t.v * Cv), msg: t.msg }))),
        num('f_p', fr, 'f', [{ v: w, msg: 'That is $\\omega_p$ in rad/s; $f = \\omega/2\\pi$.' }]),
      ],
      hints: ['Zero $v_{in}$ (its resistor stays), then list every path from the node to ground: resistors, and what each transistor terminal looks like (gate: open, base: $r_\\pi$ and more, source/emitter: about $1/g_m$, drain/collector: $r_{ds}$/$r_o$).', '$\\omega_p = 1/(RC)$ and $f_p = \\omega_p/2\\pi$.'],
      sol: `**The node.** ${why}
$$R = ${RT(R)}$$
**The pole.** $\\omega_p = \\dfrac{1}{RC} = \\dfrac{1}{${RT(R)}\\times${CT(Cv)}} = \\dfrac{1}{${TT(R * Cv)}} = ${WT(w)}$, and $f_p = \\omega_p/2\\pi = ${FT(fr)}$.

**Recognize it.** ${R < 1.5e3 && (k === 'source' || k === 'emitter' || k === 'sfout') ? 'A capacitor on a source or emitter node sees something small, so its pole is fast.' : 'Big resistance (a gate fed from a big $R_S$, a drain, a collector) means a slow node.'}`,
      _chk: { k: 'node', kind: k, p, C: Cv, R, w },
    };
  };

  // ---------------------------------------------------------------- the CS/CE stage exactly (Lecture 28)
  GENS.bk_cs_exact = (opts = {}) => {
    const p = csParams(opts.dev || pick(['mos', 'mos', 'bjt']));
    const t = twoNode(p), N = t.names, bj = p.dev === 'bjt';
    const parts = [];
    if (bj) parts.push(BK.res('R_{TH}', t.RTH, undefined, [{ v: p.RS, msg: 'The base also has $r_\\pi$ to ground: Thévenin of $v_{in}$, $R_S$ and $r_\\pi$ gives $R_S\\parallel r_\\pi$.' }]));
    parts.push(num('b', t.b, 't', [{ v: t.tIn + t.tOut + t.Cxy * t.RTH, msg: `The ${N.xy} term carries the factor $1 + g_mR_L$.` }, { v: t.tIn + t.tOut + t.gm * t.RL * t.Cxy * t.RTH, msg: 'The factor is $1 + g_mR_L$, not $g_mR_L$.' }]));
    parts.push(num('\\omega_{p1}\\approx1/b', 1 / t.b, 'w', [], [t.r1]));
    parts.push(num('\\omega_{p2}\\approx b/a', t.b / t.a, 'w', [], [t.r2]));
    parts.push(num('\\omega_z', t.wz, 'w'));
    return {
      fig: csFig(p),
      q: `A common ${bj ? 'emitter' : 'source'} as in Lecture 28: ${csDev(p)}, $R_S = ${KOs(p.RS)}$, $R_L = ${KOs(p.RL)}$, $${N.in} = ${CT(t.Cin)}$, $${N.xy} = ${CT(t.Cxy)}$, $C_L = ${CT(t.Cout)}$. Its transfer function is $\\dfrac{v_{out}}{v_{TH}} = \\dfrac{(C_{xy}s - g_m)R_L}{as^2 + bs + 1}$. ${bj ? 'Find $R_{TH}$, then ' : 'Find '}$b$, the dominant-pole estimates of both poles, and the zero.`,
      parts,
      hints: [bj ? 'Two-node model: $R_{TH} = R_S\\parallel r_\\pi$, $C_{in} = C_\\pi$, $C_{xy} = C_\\mu$, $C_{out} = C_L$.' : 'Two-node model: $R_{TH} = R_S$, $C_{in} = C_{gs}$, $C_{xy} = C_{gd}$, $C_{out} = C_L$.',
        '$b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$ and $a = R_{TH}R_L(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out})$.', '$\\omega_{p1}\\approx1/b$, $\\omega_{p2}\\approx b/a$, $\\omega_z = g_m/C_{xy}$.'],
      sol: `**Map to the two-node model.** ${bj ? `The base has $r_\\pi = ${RT(p.rpi)}$ to ground, so Thévenin of $v_{in}$, $R_S$, $r_\\pi$: $R_{TH} = R_S\\parallel r_\\pi = ${RT(t.RTH)}$ and $v_{TH} = ${f(t.k, 3)}\\,v_{in}$.` : '$R_{TH} = R_S$, $v_{TH} = v_{in}$ (a gate draws no current).'} $C_{in} = ${N.in}$, $C_{xy} = ${N.xy}$, $C_{out} = C_L$; $g_mR_L = ${f(t.gm * t.RL, 4)}$.

**The $s$ coefficient, term by term:**
$$b = \\underbrace{(1 + g_mR_L)C_{xy}R_{TH}}_{${TT(t.tMil)}} + \\underbrace{R_{TH}C_{in}}_{${TT(t.tIn)}} + \\underbrace{R_L(C_{xy} + C_{out})}_{${TT(t.tOut)}} = ${TT(t.b)}$$
**The $s^2$ coefficient:** $a = R_{TH}R_L(C_{in}C_{xy} + C_{out}C_{xy} + C_{in}C_{out}) = ${f(t.a, 4)}\\,\\text{s}^2$.

**Dominant-pole estimates:** $\\omega_{p1}\\approx\\dfrac1b = ${WT(1 / t.b)}$ and $\\omega_{p2}\\approx\\dfrac ba = ${WT(t.b / t.a)}$. The exact roots of $as^2 + bs + 1$ are $${WT(t.r1)}$ and $${WT(t.r2)}$: the poles are ${f(t.r2 / t.r1, 3)} times apart, so the estimates are off by ${f(100 * Math.abs(1 / t.b / t.r1 - 1), 2)}% and ${f(100 * Math.abs(t.b / t.a / t.r2 - 1), 2)}%.

**Zero:** $\\omega_z = g_m/C_{xy} = ${MS(t.gm)}/${CT(t.Cxy)} = ${WT(t.wz)}$, in the right half plane, far above both poles.

**Read it.** The Miller term $(1 + g_mR_L)C_{xy}R_{TH}$ is ${f(100 * t.tMil / t.b, 3)}% of $b$${t.tMil > 0.4 * t.b && t.Cxy < Math.min(t.Cin, t.Cout) ? `, although $${N.xy}$ is the smallest capacitor` : ''}.`,
      _chk: { k: 'cs_exact', p, b: t.b, a: t.a, RTH: t.RTH },
    };
  };

  // ---------------------------------------------------------------- Miller's theorem
  GENS.bk_miller = () => {
    const kind = pick(['inv', 'inv', 'fol', 'res']);
    if (kind === 'inv') {
      const A = pick([4, 9, 19, 24, 49, 99]), CF = pick([10, 20, 50, 100]) * 1e-15;
      const C1 = (1 + A) * CF, C2 = (1 + 1 / A) * CF;
      return {
        figHtml: Schem.render(M.millerA({ gain: `-${A}` })),
        q: `A capacitor $C_F = ${CT(CF)}$ connects the input and output of an inverting amplifier with gain $v_2/v_1 = -${A}$. Use Miller's theorem: what capacitance does it look like at the input (node 1 to ground), and at the output (node 2 to ground)?`,
        parts: [num('C_1', C1, 'C', [{ v: A * CF, msg: 'The factor is $1 - A_v = 1 + ' + A + '$, not ' + A + '.' }, { v: CF, msg: 'The far end moves the opposite way, so the capacitor charges $1 + A_0$ times harder than a grounded one.' }]),
          num('C_2', C2, 'C', [{ v: C1, msg: 'At the output the factor is $1 - 1/A_v = 1 + 1/' + A + '$.' }])],
        hints: ['$C_1 = (1 - A_v)C_F$, $C_2 = (1 - 1/A_v)C_F$ with $A_v = -' + A + '$.'],
        sol: `$A_v = -${A}$. Node 1 draws $(v_1 - v_2)sC_F = v_1(1 - A_v)sC_F$, the current of a capacitor $(1 - A_v)C_F$ to ground:
$$C_1 = (1 + ${A})\\times${CT(CF)} = ${CT(C1)},\\qquad C_2 = \\Big(1 + \\frac{1}{${A}}\\Big)${CT(CF)} = ${CT(C2)}$$
The input sees ${1 + A} times $C_F$: a $${CT(CF)}$ capacitor across a gain of $-${A}$ loads the input like $${CT(C1)}$. The output sees about $C_F$ itself.`,
        _chk: { k: 'miller', kind, A: -A, CF, C1, C2 },
      };
    }
    if (kind === 'fol') {
      const g = pick([0.75, 0.8, 0.9, 0.95]), CF = pick([100, 200, 500]) * 1e-15, C1 = (1 - g) * CF;
      return {
        figHtml: Schem.render(M.millerA({ gain: `+${g}` })),
        q: `A capacitor $C_F = ${CT(CF)}$ connects the input and output of a follower with gain $v_2/v_1 = +${g}$ (think of $C_{gs}$ of a source follower). What capacitance does the input see?`,
        parts: [num('C_1', C1, 'C', [{ v: (1 + g) * CF, msg: 'The gain is positive: $1 - A_v = 1 - ' + g + '$.' }, { v: CF, msg: 'The far end follows the input, so the capacitor barely charges.' }])],
        hints: ['$C_1 = (1 - A_v)C_F$ with $A_v = +' + g + '$.'],
        sol: `$C_1 = (1 - A_v)C_F = (1 - ${g})\\times${CT(CF)} = ${CT(C1)}$. The output follows the input, so only $${f(1 - g, 3)}$ of the input swing appears across $C_F$: it is **bootstrapped**, ${f(1 / (1 - g), 3)} times smaller than it looks.`,
        _chk: { k: 'miller', kind, A: g, CF, C1 },
      };
    }
    const A = pick([9, 19, 49, 99]), RF = pick([10, 50, 100, 200]) * 1e3, R1 = RF / (1 + A);
    return {
      q: `A resistor $R_F = ${RT(RF)}$ connects the input and output of an inverting amplifier with gain $-${A}$. What resistance does it look like from the input to ground?`,
      parts: [BK.res('R_1', R1, undefined, [{ v: RF * (1 + A), msg: 'Dividing an impedance by $1 - A_v$ makes it smaller, not bigger.' }, { v: RF / A, msg: 'The factor is $1 + A_0 = ' + (1 + A) + '$.' }])],
      hints: ['$Z_1 = Z_F/(1 - A_v)$.'],
      sol: `$Z_1 = \\dfrac{Z_F}{1 - A_v} = \\dfrac{${RT(RF)}}{1 + ${A}} = ${RT(R1)}$. The output swings ${A} times the input the other way, so $R_F$ carries ${1 + A} times the current a grounded $R_F$ would. This is why the input of an inverting op-amp stage looks like a near short (a "virtual ground").`,
      _chk: { k: 'miller', kind, A: -A, RF, R1 },
    };
  };

  // ---------------------------------------------------------------- CS / CE with Miller: two node poles
  GENS.bk_cs_miller = (opts = {}) => {
    const p = csParams(opts.dev || pick(['mos', 'bjt']));
    const t = twoNode(p), N = t.names, bj = p.dev === 'bjt';
    const dom = t.win < t.wout ? 0 : 1;
    return {
      fig: csFig(p),
      q: `Common ${bj ? 'emitter' : 'source'}: ${csDev(p)}, $R_S = ${KOs(p.RS)}$, $R_L = ${KOs(p.RL)}$, $${N.in} = ${CT(t.Cin)}$, $${N.xy} = ${CT(t.Cxy)}$, $C_L = ${CT(t.Cout)}$. Split $${N.xy}$ with Miller's theorem (gain $-g_mR_L$) and find the input pole, the output pole, and which one sets the bandwidth.`,
      parts: [
        num(`(1 + g_mR_L)${N.xy}`, t.CM, 'C', [{ v: t.gm * t.RL * t.Cxy, msg: 'The Miller factor is $1 + g_mR_L$.' }]),
        num('\\omega_{p,in}', t.win, 'w', [{ v: 1 / (t.RTH * t.Cin), msg: 'Add the Miller capacitance to ' + N.in + '.' }, ...(bj ? [{ v: 1 / (p.RS * (t.Cin + t.CM)), msg: 'At a base the resistance is $R_S\\parallel r_\\pi$, not $R_S$.' }] : [])]),
        num('\\omega_{p,out}', t.wout, 'w', [{ v: 1 / (t.RL * t.Cout), msg: 'The output side gets $C_2 = (1 + 1/g_mR_L)' + N.xy + '$ too.' }]),
        { lbl: 'Which pole sets the bandwidth?', mc: ['The input pole', 'The output pole'], a: dom, why: dom === 0 ? [null, `The output pole is at $${WT(t.wout)}$, above the input pole.`] : [`The input pole is at $${WT(t.win)}$, above the output pole.`, null] },
      ],
      hints: [`Miller: $C_1 = (1 + g_mR_L)${N.xy}$ at the input, $C_2 = (1 + \\tfrac{1}{g_mR_L})${N.xy}$ at the output.`, bj ? 'The base node sees $R_S\\parallel r_\\pi$.' : 'The gate node sees $R_S$.'],
      sol: `$g_mR_L = ${f(t.gm * t.RL, 4)}$, so $C_1 = ${f(1 + t.gm * t.RL, 4)}\\times${CT(t.Cxy)} = ${CT(t.CM)}$ and $C_2 = ${f(1 + 1 / (t.gm * t.RL), 4)}\\times${CT(t.Cxy)} = ${CT(t.C2)}$.

**Input node** (${bj ? `$R_S\\parallel r_\\pi = ${RT(t.RTH)}$` : `$R_S = ${RT(t.RTH)}$`}):
$$\\omega_{p,in} = \\frac{1}{${RT(t.RTH)}\\times(${CT(t.Cin)} + ${CT(t.CM)})} = \\frac{1}{${TT(1 / t.win)}} = ${WT(t.win)}$$
**Output node** ($R_L$):
$$\\omega_{p,out} = \\frac{1}{${RT(t.RL)}\\times(${CT(t.Cout)} + ${CT(t.C2)})} = \\frac{1}{${TT(1 / t.wout)}} = ${WT(t.wout)}$$
The **${dom === 0 ? 'input' : 'output'}** pole is lower and sets the bandwidth. For comparison, the exact dominant pole (Lecture 28's quadratic) is $${WT(t.r1)}$${dom === 0 ? `: Miller's input pole is ${f(100 * (t.win / t.r1 - 1), 2)}% high because it leaves out the output's share of $b$ ($${TT(t.tOut)}$).` : ': when the output is the slow node, use $1/b$ (or the next chapter\'s time constants) rather than one Miller pole.'}`,
      _chk: { k: 'cs_miller', p, win: t.win, wout: t.wout, CM: t.CM },
    };
  };

  // ---------------------------------------------------------------- common gate, follower, cascode at high frequency
  GENS.bk_hf_stage = (opts = {}) => {
    const k = pick(opts.kinds || ['cg', 'sf', 'casc']);
    const gm = pick([2, 4, 5]) * 1e-3, RS = pick([1, 2, 4, 5, 10]) * 1e3, RL = pick([2, 4, 5, 8, 10]) * 1e3;
    const Cgs = pick([100, 200]) * 1e-15, Cgd = pick([10, 20, 25]) * 1e-15, CL = pick([100, 200, 300]) * 1e-15;
    const C = { Cgs, Cgd, CL, Cgs1: Cgs, Cgd1: Cgd, Cgs2: Cgs, Cgd2: Cgd };
    const v = { RS: KOs(RS), RL: KOs(RL) };
    if (k === 'cg') {
      const Rin = par(RS, 1 / gm), win = 1 / (Rin * Cgs), wout = 1 / (RL * (Cgd + CL));
      const p = { gm, RS, RL, C }, wex = w3db('cg', p);
      return {
        fig: F.cg({ v: Object.assign(v, { Cgs: CT(Cgs), Cgd: CT(Cgd), CL: CT(CL) }) }),
        q: `Common gate: $g_m = ${MS(gm)}$, $r_{ds}\\to\\infty$, $R_S = ${KOs(RS)}$, $R_L = ${KOs(RL)}$, $C_{gs} = ${CT(Cgs)}$, $C_{gd} = ${CT(Cgd)}$, $C_L = ${CT(CL)}$. The gate is held. Find the pole at the input (source) node and the pole at the output node.`,
        parts: [num('\\omega_{p,in}', win, 'w', [{ v: 1 / (RS * Cgs), msg: 'The source node also has the transistor: $1/g_m$ in parallel with $R_S$.' }]),
          num('\\omega_{p,out}', wout, 'w', [{ v: 1 / (RL * CL), msg: '$C_{gd}$ runs from the drain to the held gate: it adds to $C_L$.' }, { v: 1 / (RL * (CL + (1 + gm * RL) * Cgd)), msg: 'No Miller here: the gate does not move, so $C_{gd}$ is just a capacitor to ground.' }])],
        hints: ['Input node: $R_S\\parallel\\tfrac1{g_m}$ with $C_{gs}$ (the gate is incremental ground).', 'Output node: $R_L$ with $C_{gd} + C_L$.'],
        sol: `**Input.** The source node sees $R_S\\parallel\\tfrac{1}{g_m} = ${RT(RS)}\\parallel${RT(1 / gm)} = ${RT(Rin)}$, and $C_{gs}$ hangs from it to the held gate:
$$\\omega_{p,in} = \\frac{1}{${RT(Rin)}\\times${CT(Cgs)}} = ${WT(win)}$$
**Output.** $C_{gd}$ goes from the drain to the held gate, so it simply adds to $C_L$; the drain node sees $R_L$:
$$\\omega_{p,out} = \\frac{1}{${RT(RL)}\\times${CT(Cgd + CL)}} = ${WT(wout)}$$
No capacitor bridges a gain, so there is no Miller multiplication. The output pole is ${f(win / wout, 3)} times lower and sets the bandwidth (an exact solve gives $${WT(wex)}$).`,
        _chk: { k: 'hf', kind: k, p, win, wout, wex },
      };
    }
    if (k === 'sf') {
      const RLs = pick([1, 2, 5]) * 1e3, A = gm * RLs / (1 + gm * RLs), Cin = Cgd + Cgs * (1 - A), win = 1 / (RS * Cin);
      const p = { gm, RS, RL: RLs, C }, wex = w3db('sf', p);
      return {
        fig: F.sf({ v: { RS: KOs(RS), RL: KOs(RLs), Cgs: CT(Cgs), Cgd: CT(Cgd), CL: CT(CL) } }),
        q: `Source follower: $g_m = ${MS(gm)}$, $r_{ds}\\to\\infty$, $R_S = ${KOs(RS)}$, $R_L = ${KOs(RLs)}$, $C_{gs} = ${CT(Cgs)}$, $C_{gd} = ${CT(Cgd)}$. Find the low-frequency gain, the capacitance the input node sees (Miller on $C_{gs}$), and the input pole.`,
        parts: [num('A_v', A, 'x', [{ v: gm * RLs, msg: 'A follower\'s gain is $\\dfrac{g_mR_L}{1 + g_mR_L}$, just under 1.' }]),
          num('C_{in}', Cin, 'C', [{ v: Cgd + Cgs, msg: 'The source follows the gate, so $C_{gs}$ is bootstrapped: multiply it by $1 - A_v$.' }, { v: Cgs * (1 - A), msg: 'Add $C_{gd}$: it runs from the gate to $V_{DD}$, an incremental ground.' }]),
          num('\\omega_{p,in}', win, 'w')],
        hints: ['$A_v = g_mR_L/(1 + g_mR_L)$.', '$C_{in} = C_{gd} + (1 - A_v)C_{gs}$; the gate node sees $R_S$.'],
        sol: `$A_v = \\dfrac{g_mR_L}{1 + g_mR_L} = \\dfrac{${f(gm * RLs, 3)}}{${f(1 + gm * RLs, 3)}} = ${f(A, 4)}$.

**Input capacitance.** $C_{gd}$ goes from the gate to $V_{DD}$: it counts fully. $C_{gs}$ bridges the gate and the source, which follows with gain $A_v$: Miller gives $(1 - A_v)C_{gs} = C_{gs}/(1 + g_mR_L) = ${CT(Cgs * (1 - A))}$.
$$C_{in} = ${CT(Cgd)} + ${CT(Cgs * (1 - A))} = ${CT(Cin)},\\qquad \\omega_{p,in} = \\frac{1}{R_SC_{in}} = \\frac{1}{${RT(RS)}\\times${CT(Cin)}} = ${WT(win)}$$
A common source with the same transistor would load the gate with $C_{gs}$ plus a multiplied $C_{gd}$; the follower hides almost all of $C_{gs}$. (An exact solve with $C_L = ${CT(CL)}$ at the output gives a bandwidth of $${WT(wex)}$.)`,
        _chk: { k: 'hf', kind: k, p, A, Cin, win, wex },
      };
    }
    // cascode, identical transistors, r_ds ignored
    const RX = 1 / gm, Cin = Cgs + 2 * Cgd, win = 1 / (RS * Cin), wX = 1 / (RX * (Cgs + 2 * Cgd)), wout = 1 / (RL * (Cgd + CL));
    const tA = gm * RL, wcs = 1 / (RS * (Cgs + (1 + tA) * Cgd));
    const p = { gm1: gm, gm2: gm, RS, RL, C }, wex = w3db('casc', p);
    return {
      fig: F.casc({ v: { RS: KOs(RS), RL: KOs(RL) } }),
      q: `Cascode with identical transistors: $g_m = ${MS(gm)}$, $r_{ds}\\to\\infty$, $C_{gs} = ${CT(Cgs)}$, $C_{gd} = ${CT(Cgd)}$ each; $R_S = ${KOs(RS)}$, $R_L = ${KOs(RL)}$, $C_L = ${CT(CL)}$. Find the gain from the gate of $M_1$ to node $X$, the input pole (Miller on $C_{gd1}$), and the output pole.`,
      parts: [num('v_X/v_{g1}', -1, 'x', [{ v: -tA, msg: 'That is the gain to the output. $C_{gd1}$ ends on node $X$, which only sees $1/g_{m2}$.' }]),
        num('\\omega_{p,in}', win, 'w', [{ v: wcs, msg: 'That is the plain common source: there $C_{gd}$ bridged a gain of $-g_mR_L$. Here the gain across $C_{gd1}$ is only $-1$.' }]),
        num('\\omega_{p,out}', wout, 'w', [{ v: 1 / (RL * CL), msg: '$C_{gd2}$ runs from the output to the held gate of $M_2$: add it to $C_L$.' }])],
      hints: ['Node $X$ sees the source of $M_2$: $1/g_{m2}$. Gain gate-to-$X$: $-g_{m1}/g_{m2}$.', 'Input: $C_{gs1} + (1 + 1)C_{gd1}$ with $R_S$. Output: $R_L$ with $C_{gd2} + C_L$.'],
      sol: `**Node $X$** is the source of $M_2$ (gate held): $R_X = 1/g_{m2} = ${RT(RX)}$. The gain from the gate of $M_1$ to $X$ is $-g_{m1}R_X = -g_{m1}/g_{m2} = -1$.

**Input.** Miller on $C_{gd1}$ with gain $-1$: $C_1 = (1 + 1)C_{gd1} = ${CT(2 * Cgd)}$.
$$\\omega_{p,in} = \\frac{1}{R_S(C_{gs1} + 2C_{gd1})} = \\frac{1}{${RT(RS)}\\times${CT(Cin)}} = ${WT(win)}$$
**Node $X$** (for completeness): $C_{gs2}$ plus the output side of $C_{gd1}$, $(1 + 1)C_{gd1}$, on $1/g_m$: $${WT(wX)}$, far out.

**Output.** $C_{gd2}$ goes to the held gate of $M_2$, so it adds to $C_L$:
$$\\omega_{p,out} = \\frac{1}{${RT(RL)}\\times${CT(Cgd + CL)}} = ${WT(wout)}$$
A plain common source with the same parts would have its input pole at $${WT(wcs)}$ (Miller factor $${f(1 + tA, 3)}$ instead of $2$). Exact cascode bandwidth: $${WT(wex)}$.`,
      _chk: { k: 'hf', kind: 'casc', p, win, wout, wX, wex },
    };
  };

  window.BK8 = { F, M, T, X, lab, words, plot2, dec, STG, NETS, hmag, w3db, octc, srcR, num, RT, CT, TT, WT, FT, GT, IT, KOs, MS, INF, twoNode, csParams };
})();

/* draw.js — helpers that turn a problem's own schematic into the circuits its solution uses:
   the incremental (small-signal) model, and the test-source setup for R_TH. Also side-by-side rows. */
(function () {
  'use strict';
  const D = {};
  const optOf = (e) => e.find((x) => x && typeof x === 'object' && !Array.isArray(x)) || {};
  const ptsOf = (e) => e.filter(Array.isArray);
  const after = (n) => (typeof n === 'string' && n.includes('+') ? n.split('+').pop() : n);
  const same = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;

  const PINS2 = new Set(['R', 'V', 'I', 'E', 'G', 'D', 'Vac', 'Iac', 'X', 'C']);
  const onSeg = (p, a, b) => (Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(p[0] - a[0]) < 1e-6 && p[1] >= Math.min(a[1], b[1]) - 1e-6 && p[1] <= Math.max(a[1], b[1]) + 1e-6)
    || (Math.abs(a[1] - b[1]) < 1e-6 && Math.abs(p[1] - a[1]) < 1e-6 && p[0] >= Math.min(a[0], b[0]) - 1e-6 && p[0] <= Math.max(a[0], b[0]) + 1e-6);
  const prune = (fig) => {
    const pins = [], segs = [];
    for (const e of fig) {
      const P = ptsOf(e);
      if (e[0] === 'w') { P.forEach((p, i) => { pins.push(p); if (i) segs.push([P[i - 1], p]); }); }
      else if (PINS2.has(e[0])) pins.push(P[0], P[1]);
      else if (e[0] === 'nmos' || e[0] === 'pmos') { const [x, y] = P[0]; const gx = optOf(e).flip ? x + 1 : x - 1; pins.push([x, y - 1], [x, y + 1], [gx, y]); }
      else if (e[0] === 'term' || e[0] === 'rail') pins.push(P[0]);
    }
    return fig.filter((e) => !((e[0] === 'gnd' || e[0] === 'gndu') && !pins.some((p) => same(p, e[1])) && !segs.some(([a, b]) => onSeg(e[1], a, b))));
  };
  D.prune = prune;

  // Several drawings side by side, each with a caption (captions may contain $TeX$).
  D.row = (items) => ({
    svg: `<div class="figrow">${items.map((it) => `<div>${it.svg || Schem.render(it.fig, it.opts || {})}${it.cap ? `<figcaption>${it.cap}</figcaption>` : ''}</div>`).join('')}</div>`,
  });

  // Incremental model of a drawn circuit.
  //   DC V source -> short, DC I source -> open, diode -> r_d, X -> r_x, rail -> AC ground,
  //   a source labelled "DC+ac" keeps only its ac part, labels "V+v" become "v".
  //   o.src maps a (nonlinear) source's label to its linearised label; o.rd / o.rx label the resistors.
  D.ss = (fig, o = {}) => prune(fig.flatMap((e) => {
    const t = e[0], P = ptsOf(e), q = optOf(e);
    const keep = (o.keep || []).includes(q.n);
    switch (t) {
      case 'V': return keep ? [e] : (q.n && q.n.includes('+') ? [['Vac', P[0], P[1], { n: after(q.n), side: q.side }]] : [['w', P[0], P[1]]]);
      case 'I': {
        if (o.src && o.src[q.n]) return [['G', P[0], P[1], { n: o.src[q.n], side: q.side }]];
        if (keep) return [e];
        return q.n && q.n.includes('+') ? [['Iac', P[0], P[1], { n: after(q.n), side: q.side }]] : [];
      }
      case 'D': return [['R', P[0], P[1], { n: o.rd ?? 'r_d', s: o.rds, side: o.side ?? q.side }]];
      case 'X': return [['R', P[0], P[1], { n: (o.rxs && o.rxs[q.n]) || o.rx || 'r_x', side: o.side ?? q.side }]];
      case 'E': case 'G': return (o.src && o.src[q.n]) ? [[t, P[0], P[1], Object.assign({}, q, { n: o.src[q.n] })]] : [e];
      case 'rail': return [['gndu', P[0]]];
      case 'term': case 'node': return [[t, P[0], Object.assign({}, q, { n: after(q.n) })]];
      case 'vlab': return [[t, P[0], P[1], Object.assign({}, q, { n: after(q.n) })]];
      case 'iarr': return [[t, P[0], ...e.slice(1).filter((x) => typeof x === 'string'), Object.assign({}, q, { n: after(q.n) })]];
      default: return [e];
    }
  }));

  // Test-source setup for R_TH: independent sources off (V short, I open), dependent sources kept,
  // v_t attached at o.at. The source's minus side goes to ground unless o.ref gives the other port node.
  // o.ground: points of input terminals to tie to ground; o.drop: terminals to remove.
  D.test = (fig, o) => {
    const base = fig.flatMap((e) => {
      const t = e[0], P = ptsOf(e), q = optOf(e);
      if ((t === 'V' || t === 'Vac') && !(o.keep || []).includes(q.n)) return [['w', P[0], P[1]]];
      if ((t === 'I' || t === 'Iac') && !(o.keep || []).includes(q.n)) return [];
      if (t === 'rail' && o.railGnd) return [['gndu', P[0]]];
      if (t === 'term' && (o.ground || []).some((g) => same(g, P[0]))) return [['gnd', P[0]]];
      if (t === 'term' && (o.drop || []).some((g) => same(g, P[0]))) return [];
      if (t === 'term' && same(P[0], o.at)) return [[t, P[0], Object.assign({}, q, { side: 'a' })]];
      if ((o.remove || []).includes(q.n)) return [];
      return [e];
    });
    const xs = fig.flatMap((e) => ptsOf(e).map((p) => p[0]));
    const [x, y] = o.at;
    const X = o.x ?? Math.max(...xs) + 1;
    const h = o.h ?? 1.3;
    const add = [['w', [x, y], [X, y]], ['V', [X, y], [X, y + h], { n: 'v_t', side: 'r' }], ['iarr', [(x + X) / 2, y], 'l', { n: 'i_t' }]];
    if (o.ref) add.push(['w', [X, y + h], [X, o.ref[1]], o.ref]);
    else add.push(['gnd', [X, y + h]]);
    return prune(base.concat(add));
  };

  // Independent sources switched off (V short, I open), everything else unchanged.
  D.off = (fig, o = {}) => prune(fig.flatMap((e) => {
    const t = e[0], P = ptsOf(e), q = optOf(e);
    if ((t === 'V' || t === 'Vac') && !(o.keep || []).includes(q.n)) return [['w', P[0], P[1]]];
    if ((t === 'I' || t === 'Iac') && !(o.keep || []).includes(q.n)) return [];
    return [e];
  }));
  D.optOf = optOf;

  // ================================================================ figure builders used by generators
  const F = window.FIGS;
  const V = (x) => `${U.fmt(x)}\\,\\text{V}`;
  F.diode1 = (v, i) => [['term', [0, -0.4]], ['w', [0, -0.4], [0, 0]], ['D', [0, 0], [0, 1.4]], ['w', [0, 1.4], [0, 1.8]], ['term', [0, 1.8]],
    ['vlab', [0.45, 0.1], [0.45, 1.3], { n: v }], ['iarr', [0, -0.25], 'd', { n: i, side: 'l', off: [-16, 0] }]];
  F.dstring = (n, lbl) => {
    const f = [['term', [0, -0.4]], ['w', [0, -0.4], [0, 0]], ['iarr', [0, -0.25], 'd', { n: lbl, side: 'l', off: [-16, 0] }]];
    for (let i = 0; i < n; i++) f.push(['D', [0, i * 1.1], [0, (i + 1) * 1.1]]);
    f.push(['w', [0, n * 1.1], [0, n * 1.1 + 0.4]], ['term', [0, n * 1.1 + 0.4]]);
    return f;
  };
  F.vrd = (vs, r) => [['V', [0, 0.5], [0, 1.5], { n: 'V_S', s: vs, side: 'l' }], ['w', [0, 0.5], [0, 0]], ['R', [0, 0], [1.8, 0], { n: 'R', s: r }], ['D', [1.8, 0], [1.8, 2]],
    ['w', [0, 1.5], [0, 2], [1.8, 2]], ['gnd', [0.9, 2]], ['vlab', [2.25, 0.2], [2.25, 1.8], { n: 'V_D' }], ['iarr', [1.8, 0.3], 'd', { n: 'I_D', side: 'l', off: [-14, 0] }]];
  F.vrx = (vs, r) => [['Vac', [0, 0.2], [0, 1.2], { n: 'v_s', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_S', s: V(vs), side: 'l' }], ['gnd', [0, 2.2]], ['w', [0, 0.2], [0, -0.4]],
    ['R', [0, -0.4], [1.8, -0.4], { n: 'R', s: U.si(r, 'Ω') }], ['X', [1.8, -0.4], [1.8, 2.2], { n: 'I(V)' }], ['gnd', [1.8, 2.2]], ['vlab', [2.3, 0.1], [2.3, 1.7], { n: 'V' }]];
  F.pwlPlot = (c) => {
    const Imax = c.Vs / c.R * 1e3;
    const I = (v) => (v < c.Va ? 0 : v < c.Vb ? (v - c.Va) / c.r1 * 1e3 : c.Ib * 1e3 + (v - c.Vb) / c.r2 * 1e3);
    return Schem.plot({ x: [0, c.Vs * 1.05], y: [0, Imax * 1.1], xl: 'V\\,(\\text{V})', yl: 'I\\,(\\text{mA})',
      xt: Array.from({ length: Math.floor(c.Vs) + 1 }, (_, i) => i).filter((i) => i % (c.Vs > 6 ? 2 : 1) === 0), yt: [0, +U.fmt(Imax / 2, 2), +U.fmt(Imax, 2)],
      curves: [{ f: I, cls: 'dc' }, { f: (v) => (c.Vs - v) / c.R * 1e3, from: 0, to: c.Vs }], pts: [{ x: c.V0, y: c.I0 * 1e3, n: 'Q' }] });
  };
  F.mosNodes = (pm, vg, vs, vd) => [[pm ? 'pmos' : 'nmos', [1, 1]], ['w', [1, 0], [1, -0.3]], ['w', [0, 1], [-0.4, 1]], ['w', [1, 2], [1, 2.3]],
    ['term', [-0.4, 1], { n: `V_G = ${vg}\\,\\text{V}`, side: 'l' }],
    ['term', [1, -0.3], { n: pm ? `V_S = ${vs}\\,\\text{V}` : `V_D = ${vd}\\,\\text{V}` }], ['term', [1, 2.3], { n: pm ? `V_D = ${vd}\\,\\text{V}` : `V_S = ${vs}\\,\\text{V}` }]];
  F.mosBias = (pm, vgs, sz, id) => (pm
    ? [['pmos', [1, 1], { sz }], ['rail', [1, 0], { n: 'V_{DD}' }], ['w', [0, 1], [-0.4, 1]], ['term', [-0.4, 1], { n: vgs ? `V_{SG} = ${vgs}` : 'G', side: 'l' }],
      ['w', [1, 2], [1, 2.5]], ['term', [1, 2.5], { n: 'D' }], ...(id ? [['iarr', [1, 2.25], 'd', { n: id, side: 'l', off: [-16, 0] }]] : [])]
    : [['nmos', [1, 1], { sz }], ['gnd', [1, 2]], ['w', [0, 1], [-0.6, 1]], ['V', [-0.6, 1], [-0.6, 2.2], { n: 'V_{GS}', s: vgs && vgs !== '?' ? vgs : (vgs === '?' ? '?' : undefined), side: 'l' }], ['gnd', [-0.6, 2.2]],
      ['w', [1, 0], [1, -0.5]], ['term', [1, -0.5], { n: 'D' }], ...(id ? [['iarr', [1, -0.25], 'd', { n: id, side: 'l', off: [-16, 0] }]] : [])]);
  F.elemVI = () => [['term', [0, -0.4]], ['w', [0, -0.4], [0, 0]], ['X', [0, 0], [0, 1.6], { n: '\\text{device}' }], ['w', [0, 1.6], [0, 2]], ['term', [0, 2]],
    ['vlab', [0.55, 0.1], [0.55, 1.5], { n: 'V' }], ['iarr', [0, -0.25], 'd', { n: 'I', side: 'l', off: [-16, 0] }]];
  F.depsrc = (t) => [['term', [0, 0]], ['term', [0, 1.6]], ['vlab', [0.3, 0.2], [0.3, 1.4], { n: 'v_X' }],
    [t === 'vcvs' ? 'E' : 'G', [1.8, 0], [1.8, 1.6], { n: t === 'sq' ? '\\tfrac{G_M\\,v_X^2}{V_A}' : t === 'cube' ? '\\tfrac{G_M\\,v_X^3}{V_A^2}' : 'A\\,v_X^3' }],
    ['w', [1.8, 0], [2.8, 0]], ['w', [1.8, 1.6], [2.8, 1.6]], ['term', [2.8, 0]], ['term', [2.8, 1.6]]];
  F.cascade2 = (load) => [
    ['V', [0, 0.6], [0, 1.6], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.6]], ['w', [0, 0.6], [0, 0], [1, 0]], ['term', [1, 0]], ['term', [1, 0.9]], ['vlab', [1.25, 0.1], [1.25, 0.8], { n: 'v_{x1}' }],
    ['w', [1, 0.9], [1, 1.6], [load ? 4.9 : 3.9, 1.6]], ['gnd', [2.2, 1.6]], ['G', [2.2, 0], [2.2, 1.6], { n: 'g_{m1}v_{x1}' }], ['w', [2.2, 0], [6, 0]], ['R', [3.9, 0], [3.9, 1.6], { n: 'R_1' }],
    ...(load ? [['R', [4.9, 0], [4.9, 1.6], { n: 'R_{in2}' }]] : []),
    ['term', [6, 0]], ['term', [6, 0.9]], ['vlab', [6.25, 0.1], [6.25, 0.8], { n: 'v_{x2}' }], ['w', [6, 0.9], [6, 1.6], [8.6, 1.6]], ['gnd', [7.2, 1.6]],
    ['G', [7.2, 0], [7.2, 1.6], { n: 'g_{m2}v_{x2}' }], ['w', [7.2, 0], [9.4, 0]], ['R', [8.6, 0], [8.6, 1.6], { n: 'R_2' }], ['term', [9.4, 0], { n: 'v_{out}' }]];

  window.DRAW = D;
})();

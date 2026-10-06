/* bands.js — drawings for semiconductor devices, on top of pfig.js. Every function returns an SVG string.
   Energies are in eV (any zero), positions in arbitrary units; the kit maps them onto the page.

   BD.diagram(o)   band diagram vs position: Ec, Ev, Ei, EF (or Fn, Fp), dopant levels, carriers, field, dimensions
     o = { w, h, x:[a,b], E:[lo,hi], Ec, Ev, Ei, EF, Fn, Fp  (number or x => eV; Ei/EF/Fn/Fp may be omitted),
           lab:{Ec:'E_c', …}, donors:{E, n}, acceptors:{E, n}, el:n, holes:n, dims:[{x, a, b, tex, at}],
           field:'right'|'left', xl:'x', marks:[{x, tex}], note }
   BD.ek(o)        E–k sketch: o.kind = 'direct' | 'indirect' | 'mass' (two curvatures)
   BD.fermi(o)     f(E) with E up the page: o.T = list of kT values in eV (0 draws the step), o.E = [lo, hi] (E−EF, eV)
   BD.dos(o)       the four-panel picture: band diagram, N(E), f(E), carriers; o.type = 'n' | 'i' | 'p'
   BD.bands3()     metal / semiconductor / insulator band filling side by side
   BD.cell(kind,o) cubic unit cell: 'sc' | 'bcc' | 'fcc' | 'diamond'; o.plane = '100' | '110' | '111' shades a plane
   BD.bar(o)       a bar with contacts: length, cross-section, applied voltage, current and field arrows
   BD.slab(o)      light entering a slab and I(x) = I0 e^{-αx}
   BD.prof(o)      a carrier profile or decay plot (thin wrapper on PF.plot) */
(function () {
  'use strict';
  const fig = (o) => PF.fig(o);
  const val = (v, x) => (typeof v === 'function' ? v(x) : v);
  const has = (v) => v !== undefined && v !== null && v !== false;

  // ---------------------------------------------------------------- band diagram vs position
  function diagram(o = {}) {
    const W = o.w || 300, H = o.h || 160, L = 34, T = 14;
    const [xa, xb] = o.x || [0, 1];
    const lv = ['Ec', 'Ev', 'Ei', 'EF', 'Fn', 'Fp'].filter((k) => has(o[k]));
    // energy window: everything drawn, plus a margin
    let lo = Infinity, hi = -Infinity;
    for (const k of lv) for (let i = 0; i <= 20; i++) { const e = val(o[k], xa + (xb - xa) * i / 20); lo = Math.min(lo, e); hi = Math.max(hi, e); }
    if (o.E) [lo, hi] = o.E; else { const m = (hi - lo) * 0.12 || 0.1; lo -= m; hi += m; }
    const X = (x) => L + (x - xa) / (xb - xa) * W;
    const Y = (e) => T + (hi - e) / (hi - lo) * H;
    const f = fig({ alt: o.alt || 'band diagram' });
    const LAB = Object.assign({ Ec: 'E_c', Ev: 'E_v', Ei: 'E_i', EF: 'E_F', Fn: 'F_n', Fp: 'F_p' }, o.lab || {});
    const CLS = { Ec: 'curve', Ev: 'curve', Ei: 'dash dim', EF: 'ef', Fn: 'qf', Fp: 'qf' };
    const flat = (k) => typeof o[k] !== 'function';
    const path = (k) => {
      const pts = [];
      for (let i = 0; i <= 80; i++) { const x = xa + (xb - xa) * i / 80; pts.push([X(x), Y(val(o[k], x))]); }
      return flat(k) ? [pts[0], pts[pts.length - 1]] : pts;
    };
    // shading: the conduction band above Ec and the valence band below Ev
    if (o.shade !== false && has(o.Ec) && has(o.Ev)) {
      const top = path('Ec'), bot = path('Ev');
      f.add(`<path class="shade nodecl" d="M${top.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}L${X(xb)},${T - 4}L${X(xa)},${T - 4}Z"/>`);
      f.add(`<path class="shade nodecl" d="M${bot.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}L${X(xb)},${T + H + 4}L${X(xa)},${T + H + 4}Z"/>`);
      f.track(X(xa), T - 4, X(xb), T + H + 4);
    }
    for (const k of lv) f.pl(path(k), { cls: CLS[k] });
    // labels at the right-hand end (left-hand end for o.labLeft keys)
    for (const k of lv) {
      if (LAB[k] === '') continue;
      const left = (o.labLeft || []).includes(k);
      const x = left ? xa : xb, e = val(o[k], x);
      f.label(left ? X(x) - 6 : X(x) + 6, Y(e), LAB[k], left ? 'r' : 'l', k === 'Ei' ? 'accent' : '');
    }
    // dopant levels: short dashes, with ions (+ for donors, − for acceptors) when o.ions
    const ions = (d, sign) => {
      const n = d.n || 7;
      for (let i = 0; i < n; i++) {
        const x = xa + (xb - xa) * (i + 0.5) / n, y = Y(val(d.E, x));
        f.line(X(x) - 7, y, X(x) + 7, y, { cls: 'thin' });
        // an ionized dopant: + (donor gave its electron away) or − (acceptor took one) just right of its level
        if (d.ionized) f.add(`<path class="glyph" d="M${X(x) + 10},${y}H${X(x) + 16}${sign > 0 ? `M${X(x) + 13},${y - 3}V${y + 3}` : ''}"/>`);
      }
      if (d.lab) f.label(X(xa) - 6, Y(val(d.E, xa)), d.lab, 'r', 'small');
    };
    if (o.donors) ions(o.donors, +1);
    if (o.acceptors) ions(o.acceptors, -1);
    // carriers: electrons as dots just above Ec, holes as open circles just below Ev
    const dy = (hi - lo) * 0.035;
    for (let i = 0; i < (o.el || 0); i++) { const x = xa + (xb - xa) * (i + 0.5) / o.el; f.dot(X(x), Y(val(o.Ec, x) + dy) - 2, 2.6); }
    for (let i = 0; i < (o.holes || 0); i++) { const x = xa + (xb - xa) * (i + 0.5) / o.holes; f.circle(X(x), Y(val(o.Ev, x) - dy) + 2, 2.6, { cls: 'bgfill' }); }
    // vertical dimension arrows between two energies at position x
    for (const d of (o.dims || [])) {
      const ya = Y(val(o[d.a] ?? d.a, d.x)), yb = Y(val(o[d.b] ?? d.b, d.x));
      f.line(X(d.x), ya, X(d.x), yb, { cls: 'dim', arrow: 'both', hs: 5 });
      f.label(X(d.x) + (d.at === 'l' ? -5 : 5), (ya + yb) / 2, d.tex, d.at === 'l' ? 'r' : 'l', 'small');
    }
    for (const m of (o.marks || [])) { f.line(X(m.x), T - 2, X(m.x), T + H + 2, { cls: 'dash dim thin' }); if (m.tex) f.label(X(m.x), T + H + 8, m.tex, 't', 'small accent'); }
    // energy axis
    if (o.axis !== false) { f.line(L - 18, T + H, L - 18, T - 2, { cls: 'dim', arrow: 'end', hs: 5 }); f.label(L - 18, T - 6, 'E', 'b', 'small accent'); }
    if (o.xl) { f.line(X(xa), T + H + 26, X(xb), T + H + 26, { cls: 'dim', arrow: 'end', hs: 5 }); f.label(X(xb) + 6, T + H + 26, o.xl, 'l', 'small accent'); }
    if (o.field) {
      const y = T + H + (o.xl ? 46 : 28), a = X(xa + (xb - xa) * 0.35), b = X(xa + (xb - xa) * 0.65);
      if (o.field === 'right') f.arrow(a, y, b, y, { cls: 'thick', hs: 8 }); else f.arrow(b, y, a, y, { cls: 'thick', hs: 8 });
      f.label((a + b) / 2, y + 8, o.fieldLab || '\\mathscr{E}', 't');
    }
    if (o.note) f.text(X((xa + xb) / 2), T + H + (o.xl ? 40 : 18), o.note, 't');
    return f.svg();
  }

  // ---------------------------------------------------------------- E(k)
  function ek(o = {}) {
    const f = fig({ alt: 'E versus k' });
    const cx = 150, y0 = 190, Wk = 110, kind = o.kind || 'direct';
    f.line(cx - Wk - 10, y0 + 18, cx + Wk + 20, y0 + 18, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + Wk + 24, y0 + 18, 'k', 'l', 'small accent');
    f.line(cx, y0 + 34, cx, 12, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 5, 10, 'E', 'bl', 'small accent');
    const par = (k0, e0, a, sgn, from = -Wk, to = Wk) => { const pts = []; for (let k = from; k <= to; k += 4) pts.push([cx + k, e0 - sgn * a * (k - k0) * (k - k0)]); return pts; };
    if (kind === 'mass') {
      f.pl(par(0, 150, 0.03, 1, -60, 60), { cls: 'curve' });
      f.pl(par(0, 150, 0.0075, 1, -Wk, Wk), { cls: 'curve dash' });
      f.label(cx + 46, 64, '\\text{sharp: small } m^*', 'l', 'small');
      f.label(cx + Wk - 4, 112, '\\text{flat: large } m^*', 'bl', 'small');
      f.label(cx - 6, 156, 'E_c', 'tr', 'small');
      return f.svg();
    }
    const vb = 150, cbMin = 70, k0 = kind === 'direct' ? 0 : 62;
    f.pl(par(0, vb, 0.007, -1).filter(([, y]) => y <= y0 + 10), { cls: 'curve' });
    f.pl(par(k0, cbMin, 0.007, 1, -Wk, Wk).filter(([, y]) => y >= 14), { cls: 'curve' });
    f.label(cx - Wk + 2, vb + 30, '\\text{valence}', 'r', 'small accent');
    f.label(cx - Wk - 4, 30, '\\text{conduction}', 'r', 'small accent');
    if (kind === 'direct') {
      f.arrow(cx, vb - 3, cx, cbMin + 5, { cls: 'thick', hs: 7 });
      f.label(cx + 8, (vb + cbMin) / 2, 'h\\nu = E_g', 'l');
      f.text(cx, y0 + 30, 'direct: photon alone, same k', 't');
    } else {
      f.arrow(cx, vb - 3, cx, cbMin + 34, { cls: 'dash', hs: 6 });
      f.arrow(cx + 3, cbMin + 34, cx + k0 - 4, cbMin + 2, { cls: 'thick', hs: 7 });
      f.label(cx - 8, (vb + cbMin + 30) / 2, 'h\\nu', 'r');
      f.label(cx + k0 / 2 + 8, cbMin + 30, '\\text{phonon}', 'l', 'small');
      f.line(cx + k0, y0 + 14, cx + k0, y0 + 22, { cls: 'dim' }); f.label(cx + k0, y0 + 24, 'k_0', 't', 'small');
      f.text(cx, y0 + 40, 'indirect: needs a phonon for the momentum', 't');
    }
    return f.svg();
  }

  // ---------------------------------------------------------------- Fermi function, E up the page
  function fermi(o = {}) {
    const [lo, hi] = o.E || [-0.2, 0.2];
    const Ts = o.T || [0, 0.0259, 0.06];
    const curves = Ts.map((kT, i) => ({
      pts: kT === 0 ? [[1, lo], [1, 0], [0, 0], [0, hi]] : Array.from({ length: 121 }, (_, j) => { const E = lo + (hi - lo) * j / 120; return [1 / (1 + Math.exp(E / kT)), E]; }),
      cls: i === 0 ? '' : i === 1 ? 'dash' : 'dim',
    }));
    const p = PF.plot({ w: o.w || 260, h: o.h || 220, x: [0, 1.15], y: [lo, hi], xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[0, 'E_F']], xl: 'f(E)', yl: 'E', curves, ml: 40 });
    return p;
  }

  // ---------------------------------------------------------------- band diagram + N(E) + f(E) + carriers
  function dos(o = {}) {
    const type = o.type || 'i';
    const Ec = 1, Ev = 0, EF = type === 'n' ? 0.82 : type === 'p' ? 0.18 : 0.5, kT = 0.06, lo = -0.45, hi = 1.45;
    const H = 200, Wp = 90, gap = 26, T = 10;
    const Y = (e) => T + (hi - e) / (hi - lo) * H;
    const f = fig({ alt: 'density of states, Fermi function and carriers' });
    const panel = (i) => 36 + i * (Wp + gap);
    // 1: band diagram
    let x0 = panel(0);
    f.add(`<path class="shade nodecl" d="M${x0},${Y(Ec)}H${x0 + Wp}V${Y(hi)}H${x0}Z"/><path class="shade nodecl" d="M${x0},${Y(Ev)}H${x0 + Wp}V${Y(lo)}H${x0}Z"/>`);
    f.line(x0, Y(Ec), x0 + Wp, Y(Ec), { cls: 'curve' }); f.line(x0, Y(Ev), x0 + Wp, Y(Ev), { cls: 'curve' });
    f.line(x0, Y(EF), x0 + Wp, Y(EF), { cls: 'ef' });
    f.label(x0 - 4, Y(Ec), 'E_c', 'r', 'small'); f.label(x0 - 4, Y(Ev), 'E_v', 'r', 'small'); f.label(x0 - 4, Y(EF), 'E_F', 'r', 'small');
    f.label(x0 + Wp / 2, T + H + 6, '\\text{bands}', 't', 'small accent');
    // 2: density of states ∝ √(E−Ec), √(Ev−E)
    x0 = panel(1);
    const Ns = (e) => (e > Ec ? Math.sqrt(e - Ec) : e < Ev ? Math.sqrt(Ev - e) : 0);
    const nmax = Math.sqrt(hi - Ec);
    const cpts = [], vpts = [];
    for (let i = 0; i <= 60; i++) { const e = Ec + (hi - Ec) * i / 60; cpts.push([x0 + Ns(e) / nmax * Wp * 0.9, Y(e)]); }
    for (let i = 0; i <= 60; i++) { const e = Ev - (Ev - lo) * i / 60; vpts.push([x0 + Ns(e) / nmax * Wp * 0.9, Y(e)]); }
    f.line(x0, T, x0, T + H, { cls: 'dim' });
    f.pl(cpts, { cls: 'curve' }); f.pl(vpts, { cls: 'curve' });
    f.line(x0, Y(EF), x0 + Wp, Y(EF), { cls: 'ef' });
    f.label(x0 + Wp / 2, T + H + 6, 'N(E)', 't', 'small accent');
    // 3: f(E)
    x0 = panel(2);
    const fE = (e) => 1 / (1 + Math.exp((e - EF) / kT));
    const fp = []; for (let i = 0; i <= 120; i++) { const e = lo + (hi - lo) * i / 120; fp.push([x0 + fE(e) * Wp * 0.9, Y(e)]); }
    f.line(x0, T, x0, T + H, { cls: 'dim' }); f.line(x0 + Wp * 0.9, T, x0 + Wp * 0.9, T + H, { cls: 'grid nodecl' });
    f.pl(fp, { cls: 'curve' });
    f.line(x0, Y(EF), x0 + Wp, Y(EF), { cls: 'ef' });
    f.label(x0 + Wp / 2, T + H + 6, 'f(E)', 't', 'small accent');
    f.label(x0 + Wp * 0.9, T - 2, '1', 'b', 'small accent');
    // 4: carriers: N(E) f(E) above Ec, N(E)[1 − f(E)] below Ev
    x0 = panel(3);
    const nE = (e) => Ns(e) * (e > Ec ? fE(e) : 1 - fE(e));
    // each band is scaled on its own (the majority fills the panel, the minority is drawn small but visible)
    const peak = (a, b) => { let m = 0; for (let i = 0; i <= 200; i++) m = Math.max(m, nE(a + (b - a) * i / 200)); return m || 1e-30; };
    const mt = peak(Ec, hi), mb = peak(lo, Ev), big = Math.max(mt, mb);
    const wTop = Wp * (mt >= big * 0.999 ? 0.9 : 0.22), wBot = Wp * (mb >= big * 0.999 ? 0.9 : 0.22);
    const band = (a, b, m, w) => { const pts = []; for (let i = 0; i <= 80; i++) { const e = a + (b - a) * i / 80; pts.push([x0 + nE(e) / m * w, Y(e)]); } return pts; };
    const top = band(Ec, hi, mt, wTop), bot = band(lo, Ev, mb, wBot);
    f.line(x0, T, x0, T + H, { cls: 'dim' });
    f.add(`<path class="carr nodecl" d="M${x0},${Y(Ec)}L${top.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}L${x0},${Y(hi)}Z"/>`);
    f.add(`<path class="carr nodecl" d="M${x0},${Y(lo)}L${bot.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}L${x0},${Y(Ev)}Z"/>`);
    f.pl(top, { cls: 'thin' }); f.pl(bot, { cls: 'thin' });
    f.line(x0, Y(Ec), x0 + Wp, Y(Ec), { cls: 'dash dim thin' }); f.line(x0, Y(Ev), x0 + Wp, Y(Ev), { cls: 'dash dim thin' });
    f.label(x0 + Wp * 0.55, Y(Ec) - 26, 'n_0', 'c', 'small'); f.label(x0 + Wp * 0.55, Y(Ev) + 26, 'p_0', 'c', 'small');
    f.label(x0 + Wp / 2, T + H + 6, '\\text{carriers}', 't', 'small accent');
    return f.svg();
  }

  // ---------------------------------------------------------------- metal / semiconductor / insulator
  function bands3() {
    const f = fig({ alt: 'band filling in a metal, a semiconductor and an insulator' });
    const W = 74, gap = 34, T = 10, H = 170;
    const box = (x, y1, y2, fillTo) => {
      f.rect(x, y1, W, y2 - y1);
      if (fillTo !== undefined) f.add(`<path class="carr nodecl" d="M${x},${Math.max(fillTo, y1)}H${x + W}V${y2}H${x}Z"/>`);
    };
    // metal: a band only partly filled (or two overlapping), so empty states sit right above the electrons
    let x = 10;
    box(x, T + 20, T + 160, T + 90);
    f.label(x + W / 2, T + H + 6, '\\text{metal}', 't', 'small');
    f.label(x + W + 4, T + 90, 'E_F', 'l', 'small');
    // semiconductor: small gap, valence full, a few electrons excited
    x += W + gap;
    box(x, T + 10, T + 70); box(x, T + 100, T + 160, T + 100);
    for (let i = 0; i < 4; i++) f.dot(x + 12 + i * 16, T + 64, 2.2);
    for (let i = 0; i < 4; i++) f.circle(x + 12 + i * 16, T + 106, 2.4, { cls: 'bgfill' });
    f.dim(x + W + 6, T + 70, x + W + 6, T + 100, 'E_g\\approx1\\,\\text{eV}', { at: 'r' });
    f.label(x + W / 2, T + H + 6, '\\text{semiconductor}', 't', 'small');
    // insulator: big gap, valence full, conduction empty
    x += W + gap + 50;
    box(x, T, T + 40); box(x, T + 120, T + 160, T + 120);
    f.dim(x + W + 6, T + 40, x + W + 6, T + 120, 'E_g\\gtrsim5\\,\\text{eV}', { at: 'r' });
    f.label(x + W / 2, T + H + 6, '\\text{insulator}', 't', 'small');
    return f.svg();
  }

  // ---------------------------------------------------------------- cubic cells
  function cell(kind = 'sc', o = {}) {
    const a = o.a || 100;
    const f = fig({ proj: { ox: 60, oy: 150, s: 1, kx: 0.5, ang: 215 }, alt: `${kind} unit cell` });
    const P = (x, y, z) => f.p3(x * a, y * a, z * a);
    if (o.plane) {
      const poly = { '100': [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], '110': [[1, 0, 0], [0, 1, 0], [0, 1, 1], [1, 0, 1]], '111': [[1, 0, 0], [0, 1, 0], [0, 0, 1]] }[o.plane];
      f.add(`<path class="plane nodecl" d="M${poly.map((p) => P(...p).map((v) => v.toFixed(1)).join(',')).join('L')}Z"/>`);
    }
    f.box3(a, a, a);
    const atoms = [];
    for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) atoms.push([x, y, z]);
    if (kind === 'bcc') atoms.push([0.5, 0.5, 0.5]);
    if (kind === 'fcc' || kind === 'diamond') atoms.push([0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]);
    const inner = kind === 'diamond' ? [[0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]] : [];
    if (kind === 'diamond') {
      // each inner atom bonds to its four nearest FCC neighbours
      const near = (p) => atoms.filter((q) => Math.abs(Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) - Math.sqrt(3) / 4) < 1e-6);
      for (const p of inner) for (const q of near(p)) { const A = P(...p), B = P(...q); f.line(A[0], A[1], B[0], B[1], { cls: 'dim thin' }); }
    }
    const back = (p) => p[0] === 0 && (p[1] === 0 || p[2] === 0) && !(p[1] === 0 && p[2] === 0) ? false : (p[0] === 0 && p[1] === 0 && p[2] === 0);
    for (const p of atoms) { const [x, y] = P(...p); f.circle(x, y, o.r || 6, { cls: back(p) ? 'bgfill dash' : 'bgfill' }); }
    for (const p of inner) { const [x, y] = P(...p); f.circle(x, y, (o.r || 6) - 0.5, { cls: 'atomb' }); }
    if (o.dim !== false) { const A = P(1, 0, 0), B = P(1, 1, 0); f.dim(A[0], A[1], B[0], B[1], 'a', { off: 14, at: 'b' }); }
    if (o.axes) { const O = P(0, 0, 0); f.label(O[0] - 10, O[1] + 10, '\\text{origin}', 'tr', 'small accent'); }
    if (o.cap) f.text(P(0.5, 0.5, 0)[0], P(1, 1, 0)[1] + 36, o.cap, 't');
    return f.svg();
  }

  // ---------------------------------------------------------------- a bar with contacts
  function bar(o = {}) {
    const f = fig({ alt: 'semiconductor bar with contacts' });
    const x0 = 40, y0 = 60, Lp = 230, Hp = 46, dx = 26, dy = 16;
    f.add(`<path class="shade nodecl" d="M${x0},${y0}H${x0 + Lp}V${y0 + Hp}H${x0}Z"/>`);
    f.rect(x0, y0, Lp, Hp);
    f.pl([[x0, y0], [x0 + dx, y0 - dy], [x0 + Lp + dx, y0 - dy], [x0 + Lp, y0]]);
    f.pl([[x0 + Lp + dx, y0 - dy], [x0 + Lp + dx, y0 + Hp - dy], [x0 + Lp, y0 + Hp]]);
    f.hatchBand([[x0 - 10, y0 - 2], [x0, y0 - 2], [x0, y0 + Hp + 2], [x0 - 10, y0 + Hp + 2]]);
    f.hatchBand([[x0 + Lp, y0 - 2], [x0 + Lp + 10, y0 - 2], [x0 + Lp + 10, y0 + Hp + 2], [x0 + Lp, y0 + Hp + 2]]);
    if (o.label) f.label(x0 + Lp / 2, y0 + Hp / 2, o.label, 'c');
    f.dim(x0, y0 + Hp, x0 + Lp, y0 + Hp, o.L || 'L', { off: 16, at: 'b' });
    // cross-section A on the end face
    f.line(x0 + Lp + dx / 2 + 2, y0 + Hp / 2 - dy / 2, x0 + Lp + 44, y0 + Hp / 2 - dy / 2 - 22, { cls: 'dim thin' });
    f.label(x0 + Lp + 47, y0 + Hp / 2 - dy / 2 - 22, o.A || 'A', 'l');
    // circuit: wires from the contacts to a source below
    const yb = y0 + Hp + 64;
    f.pl([[x0 - 10, y0 + Hp / 2], [x0 - 26, y0 + Hp / 2], [x0 - 26, yb], [x0 + Lp / 2 - 14, yb]]);
    f.pl([[x0 + Lp + 10, y0 + Hp / 2], [x0 + Lp + 26, y0 + Hp / 2], [x0 + Lp + 26, yb], [x0 + Lp / 2 + 14, yb]]);
    f.line(x0 + Lp / 2 - 14, yb - 12, x0 + Lp / 2 - 14, yb + 12, { cls: 'thick' });
    f.line(x0 + Lp / 2 + 14, yb - 6, x0 + Lp / 2 + 14, yb + 6, { cls: 'thick' });
    f.label(x0 + Lp / 2 - 22, yb - 14, '+', 'c', 'small'); f.label(x0 + Lp / 2, yb + 14, o.V || 'V', 't');
    // the + terminal (left) drives current to the right through the bar
    if (o.arrows !== false) {
      f.arrow(x0 + 40, y0 - dy - 18, x0 + 120, y0 - dy - 18, { hs: 7 }); f.label(x0 + 124, y0 - dy - 18, o.I || 'I', 'l');
      f.arrow(x0 + 150, y0 + Hp / 2, x0 + 210, y0 + Hp / 2, { cls: 'thick', hs: 7 }); f.label(x0 + 180, y0 + Hp / 2 - 6, '\\mathscr{E}', 'b');
    }
    return f.svg();
  }

  // ---------------------------------------------------------------- light into a slab
  function slab(o = {}) {
    const alpha = o.alpha || 1, d = o.d || 2.2;
    return PF.plot({
      w: o.w || 330, h: o.h || 190, x: [-0.7, 3], y: [0, 1.15], xt: [[0, '0'], [d, o.dl || 'd']], yt: [[1, 'I_0']],
      curves: [{ pts: [[-0.7, 1], [0, 1]], cls: 'dash' }, { f: (x) => Math.exp(-alpha * x), from: 0, to: d, lab: o.lab || 'I_0e^{-\\alpha x}', labAt: d * 0.45, dy: -12 }, { pts: [[d, Math.exp(-alpha * d)], [3, Math.exp(-alpha * d)]], cls: 'dash' }],
      vlines: [[0, ''], [d, '']], xl: 'x', yl: 'I(x)',
    });
  }

  // ---------------------------------------------------------------- profiles and decays
  const prof = (o) => PF.plot(Object.assign({ w: 330, h: 190 }, o));

  window.BD = { diagram, ek, fermi, dos, bands3, cell, bar, slab, prof };
})();

/* Unit 6 — Separation of variables, Cartesian (Lecture 11 pp. 3–5, Lecture 12 pp. 1–4; Griffiths 3.3.1:
   Ex. 3.3 slot, Ex. 3.4 pipe, Ex. 3.5 3-D pipe; HW 5 Prob 3.17; Discussion 4 Probs 3.15, 3.18). */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  const PI = Math.PI;

  // ================================================================ numerics used by the figures
  const shr = (k, x, b) => Math.exp(k * (x - b)) * (1 - Math.exp(-2 * k * x)) / (1 - Math.exp(-2 * k * b));   // sinh(kx)/sinh(kb)
  const chr = (k, x, b) => Math.exp(k * (Math.abs(x) - b)) * (1 + Math.exp(-2 * k * Math.abs(x))) / (1 + Math.exp(-2 * k * b)); // cosh(kx)/cosh(kb)
  // coefficient lists C_n / V0 (a = 1)
  const cConst = (n) => (n % 2 ? 4 / (n * PI) : 0);
  const cStrips = (n) => (n % 4 === 2 ? 8 / (n * PI) : 0);
  const cHalf = (n) => 2 / (n * PI) * (1 - Math.cos(n * PI / 2));
  const cRamp = (n) => 2 / (n * PI) * (n % 2 ? 1 : -1);
  // slot V/V0 with a = 1
  const slotV = (cf, N) => (x, y) => { let s = 0; for (let n = 1; n <= N; n++) { const c = cf(n); if (c) s += c * Math.exp(-n * PI * x) * Math.sin(n * PI * y); } return s; };
  const slotExact = (x, y) => 2 / PI * Math.atan(Math.sin(PI * y) / Math.sinh(PI * x));

  // ================================================================ drawing helpers (screen px, y down)
  // Label placement in open space: same geometry as the checker's audit, plus a margin.
  const segHits = (s, B) => {
    const [x1, y1, x2, y2] = s; let t0 = 0, t1 = 1;
    const dx = x2 - x1, dy = y2 - y1, Pp = [-dx, dx, -dy, dy], Qv = [x1 - B.x0, B.x1 - x1, y1 - B.y0, B.y1 - y1];
    for (let k = 0; k < 4; k++) {
      if (Math.abs(Pp[k]) < 1e-12) { if (Qv[k] < 0) return false; continue; }
      const r = Qv[k] / Pp[k];
      if (Pp[k] < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return t1 - t0 > 1e-9;
  };
  const TAGOFF = { r: [1, 0, 'l'], l: [-1, 0, 'r'], t: [0, -1, 'b'], b: [0, 1, 't'], tr: [0.8, -0.8, 'bl'], tl: [-0.8, -0.8, 'br'], br: [0.8, 0.8, 'tl'], bl: [-0.8, 0.8, 'tr'] };
  function boxOf(x, y, t, anchor) {
    const sz = PF.texSize(t);
    const bx = /l/.test(anchor) && anchor !== 'c' ? x : /r/.test(anchor) ? x - sz.w : x - sz.w / 2;
    const by = /t/.test(anchor) ? y : /b/.test(anchor) ? y - sz.h : y - sz.h / 2;
    return { x0: bx, y0: by, x1: bx + sz.w, y1: by + sz.h };
  }
  function isFree(f, B, m = 3) {
    const T = { x0: B.x0 + 4 - m, y0: B.y0 + 3 - m, x1: B.x1 - 4 + m, y1: B.y1 - 3 + m };
    if (f.segs.some((s) => segHits(s, T))) return false;
    if (f.labs.some((L) => Math.min(T.x1, L.x1 - 4) - Math.max(T.x0, L.x0 + 4) > -m && Math.min(T.y1, L.y1 - 3) - Math.max(T.y0, L.y0 + 3) > -m)) return false;
    if (f.dots.some(([x, y, r]) => x + r > T.x0 && x - r < T.x1 && y + r > T.y0 && y - r < T.y1)) return false;
    if (f.keepOut && f.keepOut.some((K) => Math.min(T.x1, K[2]) - Math.max(T.x0, K[0]) > 0 && Math.min(T.y1, K[3]) - Math.max(T.y0, K[1]) > 0)) return false;
    if (f.hatches && f.hatches.length) {
      const inPoly = (px, py, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; } return c; };
      for (let a = 0; a <= 4; a++) for (let b = 0; b <= 2; b++) { const px = T.x0 + (T.x1 - T.x0) * a / 4, py = T.y0 + (T.y1 - T.y0) * b / 2; if (f.hatches.some((h) => inPoly(px, py, h))) return false; }
    }
    return true;
  }
  // put label t near point (x, y): first free side among `sides`, growing the gap if needed
  function put(f, x, y, t, sides = ['tr', 'r', 'tl', 'l', 't', 'b', 'br', 'bl'], gap = 7, cls = '') {
    for (const g of [gap, gap + 5, gap + 10, gap + 16]) for (const at of sides) {
      const m = TAGOFF[at];
      const B = boxOf(x + m[0] * g, y + m[1] * g, t, m[2]);
      if (isFree(f, B)) return f.label(x + m[0] * g, y + m[1] * g, t, m[2], cls);
    }
    return f.tag(x, y, t, sides[0], gap, cls);
  }
  // pad the view box around every label (the size estimate runs short for wide symbols like \Rightarrow)
  function widen(f) { for (const L of f.labs) { const w = L.x1 - L.x0, e = 0.18 * w + 6; f.track(L.x0 - e, L.y0 - 4, L.x1 + e, L.y1 + 4); } return f; }
  // function plot (same look as PF.plot); curve labels are placed automatically in open space
  function plt(o) {
    const W = o.w || 300, H = o.h || 170, ml = o.ml ?? 44, mr = o.mr ?? 22, mt = o.mt ?? 18, mb = o.mb ?? 34;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
    const Y = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
    const f = PF.fig({ pad: 4 });
    const tick = (v) => (Array.isArray(v) ? v : [v, String(v)]);
    for (const t of (o.xt || [])) { const [v, s] = tick(t); f.line(X(v), Y(y0), X(v), Y(y1), { cls: 'grid nodecl' }); f.label(X(v), Y(y0) + 5, s, 't', 'small accent'); }
    for (const t of (o.yt || [])) { const [v, s] = tick(t); f.line(X(x0), Y(v), X(x1), Y(v), { cls: 'grid nodecl' }); f.label(X(x0) - 6, Y(v), s, 'r', 'small accent'); }
    const ya = (o.zero && y0 < 0 && y1 > 0) ? 0 : y0;
    f.line(X(x0), Y(ya), X(x1), Y(ya), { cls: 'axisl', arrow: 'end', hs: 6 });
    f.line(X(x0), Y(y0), X(x0), Y(y1), { cls: 'axisl', arrow: 'end', hs: 6 });
    for (const [v, s] of (o.vlines || [])) { f.line(X(v), Y(y0), X(v), Y(y1), { cls: 'dash dim' }); if (s) f.label(X(v) + 4, Y(y1) + 2, s, 'tl', 'small accent'); }
    for (const [v, s] of (o.hlines || [])) { f.line(X(x0), Y(v), X(x1), Y(v), { cls: 'dash dim' }); if (s) f.label(X(x1) - 2, Y(v) - 3, s, 'br', 'small accent'); }
    const drawn = [];
    for (const c of (o.curves || [])) {
      let pts = c.pts;
      if (c.f) { pts = []; const a = c.from ?? x0, b = c.to ?? x1, N = c.n || 240; for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; const y = c.f(x); if (isFinite(y)) pts.push([x, y]); } }
      let seg = [];
      const flush = () => { if (seg.length > 1) f.pl(seg.map((p) => [X(p[0]), Y(p[1])]), { cls: 'curve ' + (c.cls || '') }); seg = []; };
      for (const p of pts) { if (p[1] < y0 - 1e-9 || p[1] > y1 + 1e-9) flush(); else seg.push(p); }
      flush();
      drawn.push([c, pts]);
    }
    if (o.xl) f.label(X(x1) + 10, Y(ya), o.xl, 'l', 'small');
    if (o.yl) f.label(X(x0) + 6, Y(y1) - 2, o.yl, 'bl', 'small');
    for (const p of (o.pts || [])) f.dot(X(p.x), Y(p.y), 3.2);
    for (const p of (o.pts || [])) if (p.lab) put(f, X(p.x), Y(p.y), p.lab, p.sides || ['tr', 'tl', 'br', 'bl', 'r', 'l'], 6, 'small');
    for (const [c, pts] of drawn) {
      if (!c.lab) continue;
      const inside = pts.filter((p) => p[1] >= y0 && p[1] <= y1);
      const order = [];
      if (c.labAt !== undefined) order.push(c.labAt);
      for (let k = 1; k <= 11; k++) order.push(x0 + (x1 - x0) * (k % 2 ? 0.5 + (k >> 1) * 0.08 : 0.5 - (k >> 1) * 0.08));
      let done = false;
      for (const xa of order) {
        const p = inside.reduce((b, q) => (Math.abs(q[0] - xa) < Math.abs(b[0] - xa) ? q : b), inside[0]);
        if (!p) break;
        search: for (const g of [7, 11, 16]) for (const at of (c.sides || ['tr', 'br', 'tl', 'bl', 't', 'b'])) {
          const m = TAGOFF[at], lx = X(p[0]) + m[0] * g, ly = Y(p[1]) + m[1] * g, B = boxOf(lx, ly, c.lab, m[2]);
          if (B.x0 < 0 || B.x1 > W + 30 || B.y0 < -4 || B.y1 > H) continue;
          if (isFree(f, B)) { f.label(lx, ly, c.lab, m[2], 'small'); done = true; break search; }
        }
        if (done) break;
      }
      if (!done) f.label(X(x1) - 4, Y(y1) + 4, c.lab, 'tr', 'small');
    }
    f.track(0, 0, W, H); widen(f);
    return f.svg().replace('class="schem pfig', 'class="schem pfig pplot');
  }

  // Equipotential lines by marching squares. fn(x,y) in physical units; box [x0,x1,y0,y1]; S = px per unit;
  // screen origin: physical (x0, y0) sits at (0, 0) and y grows up. Negative levels dashed.
  function contours(f, fn, box, S, levels, o = {}) {
    const [x0, x1, y0, y1] = box, nx = o.nx || 72, ny = o.ny || Math.max(24, Math.round(nx * (y1 - y0) / (x1 - x0)));
    const G = [];
    for (let i = 0; i <= nx; i++) { G.push([]); for (let j = 0; j <= ny; j++) G[i].push(fn(x0 + (x1 - x0) * i / nx, y0 + (y1 - y0) * j / ny)); }
    const sx = (i) => (x1 - x0) * i / nx * S, sy = (j) => -(y1 - y0) * j / ny * S;
    for (const L of levels) {
      let d = '';
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const v = [G[i][j] - L, G[i + 1][j] - L, G[i + 1][j + 1] - L, G[i][j + 1] - L];
        if (v.some((t) => !isFinite(t))) continue;
        const cr = [], P2 = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
        for (let e = 0; e < 4; e++) {
          const a = v[e], b = v[(e + 1) % 4];
          if ((a < 0) !== (b < 0)) { const t = a / (a - b), p = P2[e], q = P2[(e + 1) % 4]; cr.push([sx(p[0] + (q[0] - p[0]) * t), sy(p[1] + (q[1] - p[1]) * t)]); }
        }
        const seg = (p, q) => { d += `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}`; };
        if (cr.length === 2) seg(cr[0], cr[1]);
        else if (cr.length === 4) { const c = (v[0] + v[1] + v[2] + v[3]) / 4; if ((c < 0) === (v[0] < 0)) { seg(cr[0], cr[3]); seg(cr[1], cr[2]); } else { seg(cr[0], cr[1]); seg(cr[2], cr[3]); } }
      }
      if (d) f.add(`<path class="${L < 0 ? 'dim thin dash' : (o.cls || 'dim thin')} nodecl" d="${d}"/>`);
    }
    f.track(0, -(y1 - y0) * S, (x1 - x0) * S, 0);
    return f;
  }

  // The slot of Ex. 3.3 seen down the z-axis. Corner (x = 0, y = 0) at screen (0, 0).
  // o: end, top, bot (TeX), split: [lowLab, highLab], left (region x < 0), inside, dimA, bcn, pts [[x/a, y/a, lab, at]], map {fn, levels}
  function slot(o = {}) {
    const f = PF.fig();
    const a = o.a || 110, L = o.L || 230, s = o.left ? -1 : 1, X = (x) => s * x;
    if (o.map) contours(f, (x, y) => o.map.fn(s > 0 ? x : -x, y), s > 0 ? [0.004, L / a, 0, 1] : [-L / a, -0.004, 0, 1], a, o.map.levels, { nx: 90 });
    const xa = Math.min(X(4), X(L)), xb = Math.max(X(4), X(L));
    f.plane(xa, xb, 0, { side: 'below' });
    f.plane(xa, xb, -a, { side: 'above' });
    f.line(X(L), 0, X(L + 24), 0, { cls: 'dim dash' });
    f.line(X(L), -a, X(L + 24), -a, { cls: 'dim dash' });
    if (!o.bare) {
      f.label(X(L * 0.6), 16, o.bot ?? 'V=0', 't', 'small');
      f.label(X(L * 0.6), -a - 16, o.top ?? 'V=0', 'b', 'small');
    }
    const side = o.left ? 'right' : 'left', an = o.left ? 'l' : 'r';
    const pieces = o.pieces || (o.split ? [[0, 0.5, o.split[0]], [0.5, 1, o.split[1]]] : [[0, 1, o.end ?? 'V_0(y)']]);
    pieces.forEach(([p0, p1, lab], i) => {
      f.wall(0, -p1 * a + (p1 === 1 ? 3 : 2.5), -p0 * a - (p0 === 0 ? 3 : 2.5), { side });
      if (!o.bare && lab) f.label(X(-16), -(p0 + p1) / 2 * a, lab === '0' ? 'V=0' : lab, an);
      if (!o.bare && i > 0 && o.pt0 !== false && !o.map) f.label(X(8), -p0 * a, o.pt0 ? o.pt0[i - 1] : 'a/2', o.left ? 'r' : 'l', 'small accent');
    });
    if (o.bare) { if (o.extra) o.extra(f, a, L, X); return widen(f).svg(); }
    // axes: y along the strip, x along the bottom plate
    f.line(0, -a - 14, 0, -a - 36, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(X(5), -a - 34, 'y', o.left ? 'r' : 'l', 'small accent');
    if (o.left) { f.line(22, 0, 48, 0, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(50, 0, 'x', 'l', 'small accent'); }
    else { f.line(L + 26, 0, L + 46, 0, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(L + 48, 0, 'x', 'l', 'small accent'); }
    f.label(X(-15), 9, o.y0Lab || '0', an, 'small accent');
    f.label(X(-15), -a - 7, o.aLab || 'a', an, 'small accent');
    if (o.dimA) f.dim(X(L - 26), 0, X(L - 26), -a, o.aLab || 'a', { at: o.left ? 'l' : 'r' });
    if (o.inside) f.label(X(L * 0.45), -a / 2, o.inside, 'c');
    if (o.bcn) {
      f.text(X(L * 0.25), 16, '#1', 't');
      f.text(X(L * 0.25), -a - 16, '#2', 'b');
      f.text(X(-16), -a / 2 + 20, '#3', o.left ? 'l' : 'r');
      f.text(X(L + 12), -a / 2, '#4', o.left ? 'r' : 'l');
    }
    for (const p of (o.pts || [])) { f.dot(X(p[0] * a), -p[1] * a, 2.8); if (p[2]) f.tag(X(p[0] * a), -p[1] * a, p[2], p[3] || 'tr', 7); }
    for (const t of (o.notes || [])) f.label(X(t[0]), t[1], t[2], t[3] || 'c', t[4] || 'small');
    if (o.extra) o.extra(f, a, L, X);
    return widen(f).svg();
  }

  // A rectangular cross-section (pipe / 2-D box). Lower-left corner at (0,0); w, h in px.
  // o: L, R, T, B face labels (TeX); xt/yt corner ticks; dims {w, h}; center (x from -b to b); pts; map; inside
  function box(o = {}) {
    const f = PF.fig();
    const w = o.w || 170, h = o.h || 110, g = 3;
    if (o.map) contours(f, o.map.fn, o.map.box, o.map.S, o.map.levels, { nx: o.map.nx || 80 });
    f.plane(g, w - g, 0, { side: 'below' });
    f.plane(g, w - g, -h, { side: 'above' });
    f.wall(0, -h + g, -g, { side: 'left' });
    f.wall(w, -h + g, -g, { side: 'right' });
    const cx = o.center ? 0.74 * w : w / 2, fv = (t) => (t === '0' ? 'V=0' : t);
    if (o.B !== undefined) { if (o.center) f.label(w / 2, 34, fv(o.B), 't'); else f.label(cx, 15, fv(o.B), 't'); }
    if (o.T !== undefined) f.label(cx, -h - 15, fv(o.T), 'b');
    if (o.L !== undefined) f.label(-16, -h / 2, fv(o.L), 'r');
    if (o.R !== undefined) f.label(w + 16, -h / 2, fv(o.R), 'l');
    if (o.center) {
      f.line(w / 2, 6, w / 2, -h - 30, { cls: 'dim dash thin' });
      f.label(w / 2 + 4, -h - 30, 'y', 'bl', 'small accent');
      f.label(-4, 15, '-b', 'tr', 'small accent'); f.label(w + 4, 15, 'b', 'tl', 'small accent');
      f.label(w / 2 - 4, 15, '0', 'tr', 'small accent');
    } else if (o.axes !== false) {
      f.line(0, -h - 14, 0, -h - 34, { cls: 'dim', arrow: 'end', hs: 6 });
      f.label(5, -h - 32, o.yl || 'y', 'l', 'small accent');
      f.line(w + 14, 0, w + 34, 0, { cls: 'dim', arrow: 'end', hs: 6 });
      f.label(w + 36, 0, o.xl || 'x', 'l', 'small accent');
      f.label(-15, 9, '0', 'r', 'small accent');
    }
    for (const t of (o.xt || [])) f.label(t[0], 15, t[1], 't', 'small accent');
    for (const t of (o.yt || [])) f.label(-15, -t[0], t[1], 'r', 'small accent');
    if (o.dims && o.dims.w) f.dim(0, 30, w, 30, o.dims.w, { at: 'b' });
    if (o.dims && o.dims.h) f.dim(w + 30, 0, w + 30, -h, o.dims.h, { at: 'r' });
    if (o.inside) f.label(w / 2, -h / 2, o.inside, 'c');
    for (const p of (o.pts || [])) { f.dot(p[0], -p[1], 2.8); if (p[2]) f.tag(p[0], -p[1], p[2], p[3] || 'tr', 7); }
    for (const t of (o.notes || [])) f.label(t[0], t[1], t[2], t[3] || 'c', t[4] || 'small');
    return widen(f).svg();
  }

  // 3-D slot (Griffiths Fig. 3.17): x right, y up, z toward the viewer.
  function slot3d() {
    const f = PF.fig({ proj: { ox: 70, oy: 150, s: 1 } });
    const P3 = (x, y, z) => f.p3(z, x, y);
    const a = 80, L = 210, Z = 70;
    const poly = (pts, cls) => f.poly(pts.map((p) => P3(...p)), { cls });
    poly([[0, 0, -Z], [L, 0, -Z], [L, 0, Z], [0, 0, Z]], 'shade');
    poly([[0, a, -Z], [L, a, -Z], [L, a, Z], [0, a, Z]], 'shade');
    poly([[0, 3, -Z], [0, a - 3, -Z], [0, a - 3, Z], [0, 3, Z]], 'shade');
    const l3 = (p, q, cls) => { const A = P3(...p), B = P3(...q); f.line(A[0], A[1], B[0], B[1], { cls }); };
    l3([0, 0, Z], [L, 0, Z]); l3([L, 0, Z], [L, 0, -Z]); l3([0, 0, -Z], [L, 0, -Z], 'dim dash');
    l3([0, a, Z], [L, a, Z]); l3([L, a, Z], [L, a, -Z]); l3([0, a, -Z], [L, a, -Z]); l3([0, a, Z], [0, a, -Z]);
    l3([0, 3, Z], [0, a - 3, Z], 'thick'); l3([0, 3, -Z], [0, a - 3, -Z], 'dim');
    l3([0, 0, Z], [0, 0, -Z], 'dim dash');
    const ax = (p, q, lab, an) => { const A = P3(...p), B = P3(...q); f.arrow(A[0], A[1], B[0], B[1], { cls: 'dim', hs: 6 }); f.label(B[0] + (an === 'l' ? 4 : -4), B[1], lab, an, 'small accent'); };
    ax([L, 0, 0], [L + 40, 0, 0], 'x', 'l');
    ax([0, a, 0], [0, a + 40, 0], 'y', 'l');
    ax([0, 0, Z], [0, 0, Z + 45], 'z', 'r');
    const t1 = P3(L * 0.55, a, -Z); f.label(t1[0], t1[1] - 8, 'V=0', 'b', 'small');
    const t2 = P3(L * 0.55, 0, Z); f.label(t2[0], t2[1] + 12, 'V=0', 't', 'small');
    const t3 = P3(0, a / 2, Z); f.label(t3[0] - 8, t3[1], 'V_0(y)', 'r');
    const t4 = P3(0, a, Z); f.label(t4[0] - 6, t4[1] - 4, 'a', 'br', 'small accent');
    return widen(f).svg();
  }

  // Function plots across the slot (y from 0 to a)
  const across = (curves, o = {}) => plt(Object.assign({ w: 300, h: 170, x: [0, 1], y: [-1.25, 1.25], zero: true, xl: 'y/a', xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1'], [-1, '-1']], curves }, o));

  // tiny sketches for method-recognition questions
  function miniPlates() {
    const f = PF.fig();
    f.plane(0, 120, 0, { side: 'above' }); f.plane(0, 120, 60, { side: 'below' });
    f.label(122, -4, 'V=0', 'bl', 'small'); f.label(122, 64, 'V=0', 'tl', 'small');
    f.charge(60, 30, { q: '+', lab: 'q', at: 'r' });
    return widen(f).svg();
  }
  function miniBox() { return box({ w: 110, h: 70, L: 'V_1', R: 'V_3', T: 'V_2', B: 'V_4', axes: false }); }
  function miniBall() {
    const f = PF.fig();
    f.circle(50, 40, 34, { cls: 'shade' }); f.circle(50, 40, 34);
    f.label(50, 40, '\\rho', 'c');
    return widen(f).svg();
  }
  function miniSphere() {
    const f = PF.fig();
    f.hatchBand(f.arcPts(40, 40, 30, 30, 0, 360)); f.circle(40, 40, 30);
    f.label(40, 2, 'V=0', 'b', 'small');
    f.charge(110, 40, { q: '+', lab: 'q', at: 't' });
    return widen(f).svg();
  }

  // ================================================================ figures used in several places
  const SLOT = slot({ dimA: true });
  const SLOT_BC = slot({ bcn: true });
  const SLOT3D = slot3d();
  const METHODS = PF.row([{ svg: miniPlates(), cap: '(A)' }, { svg: miniBox(), cap: '(B)' }, { svg: miniBall(), cap: '(C)' }, { svg: miniSphere(), cap: '(D)' }]).svg;

  const sh1 = across([
    { f: (y) => Math.sin(PI * y), lab: 'n=1', labAt: 0.42, dy: -10 },
    { f: (y) => Math.sin(2 * PI * y), cls: 'dim', lab: 'n=2', labAt: 0.18, dy: -14 },
    { f: (y) => Math.sin(3 * PI * y), cls: 'dash', lab: 'n=3', labAt: 0.86, dy: 18 },
  ], { yl: 'Y(y)' });
  const sh2 = plt({ w: 300, h: 170, x: [0, 1.5], y: [0, 1.15], xl: 'x/a', yl: 'X(x)', xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1']],
    curves: [{ f: (x) => Math.exp(-PI * x), lab: 'e^{-\\pi x/a}', labAt: 0.42, dy: -4 }, { f: (x) => Math.exp(-2 * PI * x), cls: 'dim', lab: 'e^{-2\\pi x/a}', labAt: 0.22, dy: 14 }, { f: (x) => Math.exp(-3 * PI * x), cls: 'dash' }] });

  // ---------------------------------------------------------------- Lesson 2 figures
  const ROLES = slot({ top: 'V=0\\;\\Rightarrow\\;k=n\\pi/a', bot: 'V=0\\;\\Rightarrow\\;D=0', end: 'V_0(y)\\;\\Rightarrow\\;C_n', notes: [[244, -55, 'V\\to0\\;\\Rightarrow\\;A=0', 'l']] });
  const modeMap = (n) => slot({ a: 56, L: 112, bare: true, map: { fn: (x, y) => Math.exp(-n * PI * x) * Math.sin(n * PI * y), levels: [-0.9, -0.65, -0.4, -0.15, 0.15, 0.4, 0.65, 0.9] } });
  const MODES = PF.row([{ svg: modeMap(1), cap: '$n=1$' }, { svg: modeMap(2), cap: '$n=2$' }, { svg: modeMap(3), cap: '$n=3$' }]);
  const ORTH = PF.row([
    { svg: plt({ w: 250, h: 150, x: [0, 1], y: [-0.8, 0.8], zero: true, xl: 'y/a', xt: [[0.5, '\\tfrac12'], [1, '1']], curves: [{ f: (y) => Math.sin(PI * y) * Math.sin(2 * PI * y), lab: '\\sin(\\pi y/a)\\,\\sin(2\\pi y/a)', labAt: 0.62 }] }), cap: '$n \\ne m$: as much area below the axis as above. Integral $0$.' },
    { svg: plt({ w: 250, h: 150, x: [0, 1], y: [0, 1.25], xl: 'y/a', xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1']], hlines: [[0.5, '']], curves: [{ f: (y) => Math.sin(2 * PI * y) ** 2, lab: '\\sin^2(2\\pi y/a)', labAt: 0.5 }] }), cap: '$n = m$: average value $\\tfrac12$ (dashed). Integral $\\tfrac{a}{2}$.' },
  ]);
  const LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const SLOT_MAP = slot({ end: 'V_0', map: { fn: slotExact, levels: LEVELS } });
  const SLOT_SIN3 = slot({ end: 'V_0\\sin(3\\pi y/a)' });
  const SLOT_SIN3_MAP = slot({ end: 'V_0\\sin(3\\pi y/a)', map: { fn: (x, y) => Math.exp(-3 * PI * x) * Math.sin(3 * PI * y), levels: [-0.9, -0.7, -0.5, -0.3, -0.1, 0.1, 0.3, 0.5, 0.7, 0.9] } });
  const SLOT_2A = slot({ end: 'V_0', aLab: '2a', dimA: true, pts: [[0.5, 0.5, 'P', 'tr']] });

  // ---------------------------------------------------------------- Lesson 3 figures
  const partial = (N) => (y) => { let s = 0; for (let n = 1; n <= N; n += 2) s += 4 / (n * PI) * Math.sin(n * PI * y); return s; };
  const GIBBS = plt({ w: 330, h: 190, x: [0, 1], y: [0, 1.4], xl: 'y/a', yl: 'V(0,y)/V_0', xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1']], hlines: [[1, '']],
    curves: [{ f: partial(1), cls: 'dim', lab: '1\\ \\text{term}', labAt: 0.5, sides: ['t', 'tr', 'tl'] }, { f: partial(5), cls: 'dash', lab: '3\\ \\text{terms}', labAt: 0.17, sides: ['tr', 't', 'tl'] }, { f: partial(21), n: 600, lab: '11\\ \\text{terms}', labAt: 0.62, sides: ['b', 'br', 'bl'] }] });
  const FAR = plt({ w: 330, h: 190, x: [0, 1.5], y: [0, 1.35], xl: 'x/a', yl: 'V(x,a/2)/V_0', xt: [[0.5, '\\tfrac12'], [1, '1'], [1.5, '\\tfrac32']], yt: [[1, '1']],
    curves: [{ f: (x) => slotExact(Math.max(x, 1e-6), 0.5) }, { f: (x) => 4 / PI * Math.exp(-PI * x), cls: 'dash' }] });
  const mapIn = (fn) => slot({ a: 56, L: 112, bare: true, map: { fn, levels: LEVELS } });
  const READMAPS = PF.row([
    { svg: mapIn((x, y) => 1 - y), cap: '(A)' },
    { svg: mapIn(slotExact), cap: '(B)' },
    { svg: mapIn((x, y) => Math.max(0, 1 - x / 2)), cap: '(C)' },
    { svg: mapIn((x, y) => { let s = 0; for (let n = 1; n < 60; n += 2) s += 4 / (n * PI) * chr(n * PI, x - 1, 1) * Math.sin(n * PI * y); return s; }), cap: '(D)' },
  ]);
  const SLOT_NUM = slot({ end: 'V_0=100\\,\\text{V}', aLab: '2\\,\\text{cm}', dimA: true, pts: [[1.5, 0.5, 'P', 'tr']] });
  const SLOT_Q = slot({ end: 'V_0', pts: [[0.25, 0.25, 'Q', 'tr']] });

  // ---------------------------------------------------------------- Lesson 4 figures
  // coefficient spectrum: bars C_n/V0, n = 1..N (theory and solutions only: it shows which n survive)
  function bars(cf, o = {}) {
    const N = o.N || 8, W = o.w || 200, H = o.h || 110, f = PF.fig({ pad: 4 });
    const vals = []; for (let n = 1; n <= N; n++) vals.push(cf(n));
    const vmax = o.vmax || Math.max(...vals.map(Math.abs), 1e-9), neg = vals.some((v) => v < -1e-9);
    const ml = 36, mr = 6, mt = 10, mb = 22;
    const y0 = neg ? (H - mb + mt) / 2 : H - mb, sc = (neg ? (H - mb - mt) / 2 : H - mb - mt) / vmax;
    const dx = (W - ml - mr) / N, bw = dx * 0.5;
    f.line(ml - 4, y0, W - mr + 2, y0, { cls: 'axisl' });
    vals.forEach((v, i) => {
      const xc = ml + dx * (i + 0.5);
      if (Math.abs(v) > 1e-9) f.rect(xc - bw / 2, Math.min(y0, y0 - v * sc), bw, Math.abs(v * sc), { cls: 'fill dimfill' });
      f.label(xc, H - mb + 6, String(i + 1), 't', 'small accent');
    });
    f.line(ml - 10, y0 - vmax * sc, ml - 5, y0 - vmax * sc, { cls: 'axisl' });
    f.label(ml - 12, y0 - vmax * sc, o.top || (+vmax.toFixed(2)).toString(), 'r', 'small accent');
    f.label(W / 2 + ml / 2, H + 4, 'n', 't', 'small accent');
    return widen(f).svg();
  }
  const SYMM = across([
    { f: (y) => Math.sin(PI * y), lab: 'n=1', labAt: 0.5, sides: ['t', 'tr', 'tl'] },
    { f: (y) => Math.sin(2 * PI * y), cls: 'dim', lab: 'n=2', labAt: 0.25 },
    { f: (y) => Math.sin(3 * PI * y), cls: 'dash', lab: 'n=3', labAt: 0.85 },
  ], { yl: '\\sin(n\\pi y/a)', vlines: [[0.5, '']] });
  const shape = (fn, o = {}) => plt(Object.assign({ w: 150, h: 104, x: [0, 1], y: [-1.25, 1.25], zero: true, ml: 26, mr: 16, mt: 10, mb: 22, xt: [[1, 'a']], yt: [[1, 'V_0']], curves: [{ f: fn, n: 400 }] }, o));
  const SHAPES = PF.row([
    { svg: shape(() => 1), cap: '(1) $V_0$' },
    { svg: shape((y) => (y < 0.5 ? 1 : -1)), cap: '(2) $\\pm V_0$ strips' },
    { svg: shape((y) => (y < 0.5 ? 1 : 0)), cap: '(3) lower half' },
    { svg: shape((y) => y), cap: '(4) ramp $V_0y/a$' },
    { svg: shape((y) => Math.sin(PI * y)), cap: '(5) $V_0\\sin(\\pi y/a)$' },
    { svg: shape((y) => 4 * y * (1 - y)), cap: '(6) $\\tfrac{4V_0}{a^2}y(a-y)$' },
  ]);
  const BARS = PF.row([
    { svg: bars(cConst), cap: '(1) odd $n$' },
    { svg: bars(cStrips), cap: '(2) $n = 2, 6, 10, \\dots$' },
    { svg: bars(cHalf), cap: '(3) all but $4, 8, \\dots$' },
    { svg: bars(cRamp), cap: '(4) alternating signs' },
    { svg: bars((n) => (n === 1 ? 1 : 0)), cap: '(5) $n = 1$ only' },
    { svg: bars((n) => (n % 2 ? 32 / (n * PI) ** 3 : 0)), cap: '(6) odd $n$, $\\propto 1/n^3$' },
  ]);
  const STRIPS = slot({ split: ['+V_0', '-V_0'] });
  const stripsV = slotV(cStrips, 400);
  const STRIPS_MAP = slot({ split: ['+V_0', '-V_0'], map: { fn: stripsV, levels: [-0.9, -0.7, -0.5, -0.3, -0.1, 0.1, 0.3, 0.5, 0.7, 0.9] },
    extra: (f, a, L) => { f.line(44, -a / 2, L, -a / 2, { cls: 'dim dash thin' }); f.label(L + 30, -a / 2, 'V=0', 'l', 'small'); } });
  const STACK = PF.row([
    { svg: slot({ a: 56, L: 120, bare: true, pieces: [[0, 1, '']], extra: (f, a, L) => { f.label(-14, -a / 2, 'V_0', 'r', 'small'); f.label(L / 2, -a - 14, 'V=0', 'b', 'small'); f.label(L / 2, 14, 'V=0', 't', 'small'); } }), cap: 'Lower half: a slot of width $a/2$ with a strip at $+V_0$.' },
    { svg: slot({ a: 56, L: 120, bare: true, pieces: [[0, 1, '']], extra: (f, a, L) => { f.label(-14, -a / 2, '-V_0', 'r', 'small'); f.label(L / 2, -a - 14, 'V=0', 'b', 'small'); f.label(L / 2, 14, 'V=0', 't', 'small'); } }), cap: 'Upper half: the same slot, flipped, at $-V_0$.' },
  ]);
  const HALF = slot({ split: ['V_0', '0'] });
  const RAMP = slot({ end: 'V_0\\,y/a' });
  const CSTRIP = slot({ pieces: [[0, 0.25, '0'], [0.25, 0.75, 'V_0'], [0.75, 1, '0']], pt0: ['a/4', '3a/4'] });
  const PARAB = slot({ end: '\\tfrac{4V_0}{a^2}\\,y(a-y)' });

  // ---------------------------------------------------------------- Lesson 5 figures
  const xfun = (fn, o = {}) => plt(Object.assign({ w: 160, h: 112, x: [0, 1], y: [0, 1.15], ml: 24, mr: 16, mt: 10, mb: 22, xt: [[1, 'b']], yt: [[1, '1']], curves: [{ f: fn }] }, o));
  const XFUNCS = PF.row([
    { svg: xfun((x) => Math.exp(-PI * x), { x: [0, 1.5], xt: [] }), cap: '$e^{-kx}$: dies far away' },
    { svg: xfun((x) => shr(PI, x, 1)), cap: '$\\sinh kx$: zero at $x = 0$' },
    { svg: xfun((x) => shr(PI, 1 - x, 1)), cap: '$\\sinh k(b-x)$: zero at $x = b$' },
    { svg: xfun((x) => chr(PI, x, 1), { x: [-1, 1], xt: [[-1, '-b'], [1, 'b']] }), cap: '$\\cosh kx$: even in $x$' },
  ]);
  const G_HW = box({ L: '0', R: 'V_0(y)', T: '0', B: '0', xt: [[170, 'b']], yt: [[110, 'a']] });
  const G_EX34 = box({ center: true, L: 'V_0', R: 'V_0', T: '0', B: '0', w: 190 });
  const G_ANTI = box({ center: true, L: '-V_0', R: '+V_0', T: '0', B: '0', w: 190 });
  const G_LEFT = box({ L: 'V_0(y)', R: '0', T: '0', B: '0', xt: [[170, 'b']], yt: [[110, 'a']] });
  const G_TOP = box({ T: 'V_0(x)', L: '0', R: '0', B: '0', w: 130, xt: [[130, 'a']], yt: [[110, 'b']] });
  const G_ADJ = box({ L: 'V_1', B: 'V_2', T: '0', R: '0', xt: [[170, 'b']], yt: [[110, 'a']] });
  const SLOT_LEFT = slot({ left: true, end: 'V_0' });
  const SLOT_MID = slot({ end: 'V_0', aLab: 'a/2', y0Lab: '-a/2' });
  const K0 = slot({ top: 'V=V_1', end: 'V=0' });
  const k0V = (x, y) => { let s = y; for (let n = 1; n <= 300; n++) s += 2 * (n % 2 ? -1 : 1) / (n * PI) * Math.exp(-n * PI * x) * Math.sin(n * PI * y); return s; };
  const K0_MAP = slot({ top: 'V=V_1', end: 'V=0', map: { fn: k0V, levels: LEVELS } });
  const K0B = slot({ top: 'V=V_1', end: 'V_1', pts: [[0.5, 0.5, 'P', 'tr']] });

  // ---------------------------------------------------------------- Lesson 6 figures
  const ex34V = (b) => (x, y) => { let s = 0; for (let n = 1; n < 200; n += 2) s += 4 / (n * PI) * chr(n * PI, x, b) * Math.sin(n * PI * y); return s; };
  const hwV = (b) => (x, y) => { let s = 0; for (let n = 1; n < 200; n += 2) s += 4 / (n * PI) * shr(n * PI, x, b) * Math.sin(n * PI * y); return s; };
  const EX34_MAP = box({ center: true, L: 'V_0', R: 'V_0', T: '0', B: '0', w: 220, h: 110, map: { fn: ex34V(1), box: [-1, 1, 0, 1], S: 110, levels: LEVELS } });
  const HW_MAP = box({ L: '0', R: 'V_0', T: '0', B: '0', w: 165, h: 110, xt: [[165, 'b']], yt: [[110, 'a']], map: { fn: hwV(1.5), box: [0, 1.5, 0, 1], S: 110, levels: LEVELS } });
  const SUPER = PF.row([
    { svg: box({ w: 110, h: 80, T: 'V_1', R: 'V_2', L: '0', B: '0', axes: false }), cap: '$V$' },
    { svg: box({ w: 110, h: 80, T: 'V_1', R: '0', L: '0', B: '0', axes: false }), cap: '$=\\;V^{(1)}$' },
    { svg: box({ w: 110, h: 80, T: '0', R: 'V_2', L: '0', B: '0', axes: false }), cap: '$+\\;V^{(2)}$' },
  ]);
  const sq = (T, R, B, L, s = 76) => box({ w: s, h: s, T, R, B, L, axes: false, pts: [[s / 2, s / 2]] });
  const ROT = PF.row([
    { svg: sq('V_0', '0', '0', '0'), cap: '(1)' }, { svg: sq('0', 'V_0', '0', '0'), cap: '(2)' },
    { svg: sq('0', '0', 'V_0', '0'), cap: '(3)' }, { svg: sq('0', '0', '0', 'V_0'), cap: '(4)' },
    { svg: sq('V_0', 'V_0', 'V_0', 'V_0'), cap: '(1)+(2)+(3)+(4)' },
  ]);
  const SQ1 = box({ T: 'V_0', R: '0', B: '0', L: '0', w: 110, h: 110, xt: [[110, 'a']], yt: [[110, 'a']], pts: [[55, 55, 'C', 'tr']] });
  const BOX_TOP = box({ T: 'V_0', L: '0', R: '0', B: '0', w: 150, h: 110, xt: [[150, 'a']], yt: [[110, 'b']] });
  const SQ_OPP = box({ L: 'V_0', R: 'V_0', T: '0', B: '0', w: 110, h: 110, xt: [[110, 'a']], yt: [[110, 'a']], pts: [[27.5, 55, 'P', 'tr']] });
  const SQ_4V = box({ T: '30\\,\\text{V}', R: '20\\,\\text{V}', B: '10\\,\\text{V}', L: '40\\,\\text{V}', w: 110, h: 110, axes: false, pts: [[55, 55, 'C', 'tr']] });
  const EX34_BA = box({ center: true, L: 'V_0', R: 'V_0', T: '0', B: '0', w: 220, h: 110, pts: [[110, 55, 'C', 'tr']] });
  const RECT21 = box({ T: 'V_0', L: '0', R: '0', B: '0', w: 220, h: 110, xt: [[220, '2a']], yt: [[110, 'a']], pts: [[110, 55, 'C', 'tr']] });
  const ADJ2 = box({ T: 'V_0', R: 'V_0', B: '0', L: '0', w: 110, h: 110, xt: [[110, 'a']], yt: [[110, 'a']], pts: [[55, 55, 'C', 'tr']] });

  // ---------------------------------------------------------------- Lesson 7 figures
  // cube 0..a in x (toward the viewer), y (right), z (up); top face shaded and labelled (Griffiths Fig. 3.23)
  function cube(o = {}) {
    const A = o.A || 100, f = PF.fig({ proj: { ox: 60, oy: 175, s: 1 } });
    f.box3(A, A, A, { shadeTop: true });
    f.axes3(A + 45, { box: [A, A, A] });
    const t = f.p3(A / 2, A / 2, A);
    f.line(t[0], t[1], t[0] + 18, t[1] - 44, { cls: 'dim thin' });
    f.label(t[0] + 20, t[1] - 46, o.top || 'V_0', 'bl');
    const e1 = f.p3(A, A / 2, 0); f.label(e1[0], e1[1] + 6, 'a', 't', 'small');
    const e2 = f.p3(A, A, A * 0.55); f.label(e2[0] + 7, e2[1], 'a', 'l', 'small');
    const e3 = f.p3(A / 2, A, 0); f.label(e3[0] + 7, e3[1] + 5, 'a', 'tl', 'small');
    if (o.ground !== false) {
      const g = f.p3(A / 2, A, A * 0.78);
      f.line(g[0], g[1], g[0] + 44, g[1], { cls: 'thin' });
      f.ground(g[0] + 44, g[1]);
      f.text(g[0] + 58, g[1] + 6, o.groundText || 'other five faces grounded', 'l');
    }
    for (const p of (o.pts || [])) { const q = f.p3(...p[0]); f.dot(q[0], q[1], 2.8); if (p[1]) put(f, q[0], q[1], p[1], ['tr', 'tl', 'r', 'l']); }
    return widen(f).svg();
  }
  const CUBE = cube();
  const CUBE_SINE = cube({ top: 'V_0\\sin\\frac{\\pi x}{a}\\sin\\frac{\\pi y}{a}' });
  const CUBE_C = cube({ pts: [[[50, 50, 50], 'C']] });
  // semi-infinite rectangular pipe along x (Griffiths Fig. 3.22), drawn so that its live end x = 0 faces the viewer
  function pipe3d(o = {}) {
    const f = PF.fig({ proj: { ox: 40, oy: 150, s: 1, ang: 322, kx: 0.6 } });
    const a = o.a || 80, b = o.b || 90, L = o.L || 190;
    const P3 = (x, y, z) => f.p3(z, x, y);
    const end = [[0, 0, 0], [0, a, 0], [0, a, b], [0, 0, b]].map((p) => P3(...p));
    f.add(`<path class="shade nodecl" d="M${[[0, a, 0], [L, a, 0], [L, a, b], [0, a, b]].map((p) => P3(...p).map((v) => v.toFixed(1)).join(',')).join('L')}Z"/>`);
    f.add(`<path class="shade nodecl" d="M${end.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z"/>`);
    f.poly(end, { cls: 'thick' });
    const l3 = (p, q, cls) => { const A = P3(...p), B = P3(...q); f.line(A[0], A[1], B[0], B[1], { cls }); };
    l3([0, 0, 0], [L, 0, 0], 'dim dash'); l3([0, a, 0], [L, a, 0]); l3([0, a, b], [L, a, b]); l3([0, 0, b], [L, 0, b]);
    l3([L, a, 0], [L + 30, a, 0], 'dim dash'); l3([L, a, b], [L + 30, a, b], 'dim dash'); l3([L, 0, b], [L + 30, 0, b], 'dim dash');
    const c = P3(0, a / 2, b / 2);
    f.line(c[0], c[1], c[0] - 34, c[1] - 52, { cls: 'dim thin' });
    f.label(c[0] - 36, c[1] - 54, o.end || 'V_0(y,z)', 'br');
    const tp = P3(L * 0.55, a, b / 2); f.line(tp[0], tp[1], tp[0] + 10, tp[1] - 34, { cls: 'dim thin' }); f.label(tp[0] + 12, tp[1] - 36, '\\text{all four walls: } V=0', 'bl', 'small');
    const ea = P3(0, a / 2, b); f.label(ea[0] - 7, ea[1], 'a', 'r', 'small');
    const eb = P3(0, 0, b / 2); f.label(eb[0] - 6, eb[1] + 6, 'b', 'tr', 'small');
    // axis key
    const k0 = [c[0] - 70, c[1] + 70];
    const kx = P3(40, 0, 0), ky = P3(0, 40, 0), kz = P3(0, 0, 40), O = P3(0, 0, 0);
    const ar = (Q, lab, an) => { const dx = Q[0] - O[0], dy = Q[1] - O[1]; f.arrow(k0[0], k0[1], k0[0] + dx * 0.8, k0[1] + dy * 0.8, { cls: 'dim', hs: 6 }); f.label(k0[0] + dx * 0.8 + (an === 'l' ? 4 : an === 'r' ? -4 : 0), k0[1] + dy * 0.8 + (an === 'b' ? -3 : an === 't' ? 3 : 0), lab, an, 'small accent'); };
    ar(kx, 'x', 'l'); ar(ky, 'y', 'b'); ar(kz, 'z', 't');
    for (const p of (o.pts || [])) { const q = P3(...p[0]); f.dot(q[0], q[1], 2.8); if (p[1]) put(f, q[0], q[1], p[1], ['tr', 'tl', 'r', 'l']); }
    return widen(f).svg();
  }
  const PIPE3D = pipe3d();
  const PIPE_SQ = pipe3d({ b: 80, end: 'V_0', pts: [[[80, 40, 40], 'P']] });
  // slice y = a/2 of the cube solution (x horizontal, z up)
  const cubeV = (x, y, z, N = 21) => { let s = 0; for (let n = 1; n <= N; n += 2) for (let m = 1; m <= N; m += 2) { const g = PI * Math.hypot(n, m); s += 16 / (PI * PI * n * m) * Math.sin(n * PI * x) * Math.sin(m * PI * y) * shr(g, z, 1); } return s; };
  const CUBE_SLICE = box({ w: 120, h: 120, T: 'V_0', L: '0', R: '0', B: '0', xl: 'x', yl: 'z', xt: [[120, 'a']], yt: [[120, 'a']], map: { fn: (x, z) => cubeV(x, 0.5, z), box: [0, 1, 0, 1], S: 120, levels: [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], nx: 60 }, pts: [[60, 60]] });

  C.unit({
    id: 'u6', num: 'Unit 6', title: 'Separation of variables: Cartesian',
    blurb: 'Solving Laplace\'s equation in slots, pipes and boxes: product solutions, choosing sin/cos vs exponentials/sinh/cosh, Fourier\'s trick, superposition of faces, 3-D boxes, and exam strategy.',
    lessons: [
      // ============================================================ LESSON 1
      {
        id: 'u6-idea', title: 'When to separate, and the product ansatz',
        steps: [
          RF(md`
            Images work when a few point charges can fake the boundary. Most boundary-value problems are not like that: a box whose walls sit at different potentials, a slot closed off by a live strip, a cube with a live lid. For those you solve Laplace's equation directly. The method is **separation of variables** (Lecture 11, Griffiths 3.3.1).

            Use it when all three hold:

            1. **No charge in the region**, so $\nabla^2 V = 0$ (Laplace, not Poisson).
            2. **Every boundary is a coordinate surface**: planes $x = \text{const}$, $y = \text{const}$ here (spheres $r = \text{const}$ in Unit 7).
            3. **$V$ is given on every boundary**, including a limiting value far away. By the uniqueness theorem that fixes $V$ completely.

            The lecture's example (Griffiths Ex. 3.3) is the **slot**: two grounded metal plates at $y = 0$ and $y = a$, closed off at $x = 0$ by a strip held at $V_0(y)$ and insulated from the plates. Everything extends to $\pm\infty$ in $z$.

            [[fig:s3]]

            [[fig:s2]]

            !!key Boundary conditions (the lecture's numbering)
              1. $V(x,y)\big|_{y=0} = 0$ (bottom plate)
              2. $V(x,y)\big|_{y=a} = 0$ (top plate)
              3. $V(x,y)\big|_{x=0} = V_0(y)$ (the end strip)
              4. $V(x,y) \to 0$ as $x \to \infty$

            Nothing depends on $z$, so $\partial^2 V/\partial z^2 = 0$ and the problem is two-dimensional:

            $$\frac{\partial^2 V}{\partial x^2} + \frac{\partial^2 V}{\partial y^2} = 0 .$$

            BC #4 is not stated in the problem. It is physics: far from the only live surface, between two grounded plates, the potential has to die out.
          `, { s3: { svg: SLOT3D, cap: 'The slot in 3-D (Griffiths Fig. 3.17). The end strip (front edge drawn thick) is insulated from both plates.' }, s2: { svg: SLOT_BC, cap: 'The same slot seen down the $z$-axis, with the four boundary conditions numbered as in lecture.' } }),

          Q(md`Which of these four problems is a job for separation of variables?`,
            [md`(A) A point charge $q$ midway between two grounded parallel plates.`, md`(B) A long rectangular pipe whose four walls are held at given potentials $V_1,\dots,V_4$, with nothing inside.`, md`(C) A uniformly charged solid ball.`, md`(D) A point charge $q$ outside a grounded metal sphere.`], 1,
            [md`There is a point charge *in* the region, so $\nabla^2 V \ne 0$ there. That is an image problem (an infinite row of alternating images).`, null, md`A symmetric charge distribution: Gauss's law gives $\vb E$ in one line. There is no boundary-value problem to solve.`, md`Charge in the region again. The standard tool is the image $q' = -qR/a$ at $b = R^2/a$.`],
            md`(B) has all three signs: no charge inside (Laplace), flat walls along $x = \text{const}$ and $y = \text{const}$, and $V$ given on each wall. Point charges inside the region point to images; symmetric charge distributions point to Gauss.`,
            { figHtml: METHODS }),

          Q(md`Between the plates of the slot, why do we solve Laplace's equation rather than Poisson's?`,
            [md`Because the plates are grounded.`, md`Because the problem is two-dimensional.`, md`Because there is no charge in the region between the plates. The induced charge sits on the conductor surfaces, which are the boundaries.`, md`Because the strip is insulated from the plates.`], 2,
            [md`Grounding sets boundary *values*. It says nothing about whether there is charge in the region.`, md`Poisson's equation can be two-dimensional too. Dimension is not the point.`, null, md`The insulation lets the strip sit at a different potential from the plates. It does not remove charge from the region.`],
            md`Poisson: $\nabla^2 V = -\rho/\varepsilon_0$. In the open space between the plates $\rho = 0$. All the charge is on the metal, and the metal surfaces are where the boundary conditions are imposed.`,
            { figHtml: SLOT }),

          Q(md`Why is the slot a two-dimensional problem?`,
            [md`The plates and the strip extend to $\pm\infty$ in $z$ and nothing changes along $z$, so $\partial^2 V/\partial z^2 = 0$.`, md`Because $V = 0$ at $z = \pm\infty$.`, md`Because the plates are thin.`, md`Because $E_z = 0$ on the plates.`], 0,
            [null, md`No condition at $z = \pm\infty$ is used. The potential is simply the same at every $z$.`, md`Thickness is irrelevant. What matters is that the setup looks identical at every $z$.`, md`$E_z = 0$ everywhere, not just on the plates, and that is a consequence of $V$ not depending on $z$.`],
            md`If you slide along $z$ the configuration does not change, so neither does $V$. Then $\partial V/\partial z = 0$ and the $z$ term drops out of the Laplacian (the blue note in the lecture: "0 since no variation in $z$").`,
            { figHtml: SLOT3D }),

          Q(md`BC #4, $V \to 0$ as $x \to \infty$, is not in the problem statement. Why is it right?`,
            [md`It is a choice of the zero of potential.`, md`Gauss's law requires it.`, md`Far from the only live surface, between grounded plates, the potential must die out.`, md`The uniqueness theorem requires $V = 0$ at infinity in every problem.`], 2,
            [md`The zero is already fixed by the grounded plates ($V = 0$ there). BC #4 is a consequence, not a choice.`, md`Gauss's law alone does not tell you how $V$ behaves far down the slot.`, null, md`Uniqueness needs $V$ *specified* on every boundary. It does not say the value is zero; here the physics does.`],
            md`Griffiths: "as you get farther and farther away from the 'hot' strip at $x = 0$, the potential should drop to zero." Far down the slot you are surrounded by grounded metal on both sides and the strip is far behind you.`,
            { figHtml: SLOT_BC }),

          RF(md`
            ### Look for product solutions

            Try

            $$V(x,y) = X(x)\,Y(y).$$

            The lecture calls this "an extreme simplification since only a very small number of functions obey this form." For example $V = 5x + 6y$ solves Laplace's equation and is not a single product. But the products are special, and **sums** of them build every solution you need.

            Substitute:

            $$\frac{d^2X}{dx^2}\,Y(y) + X(x)\,\frac{d^2Y}{dy^2} = 0 .$$

            Divide by $X(x)Y(y)$:

            $$\underbrace{\frac{1}{X}\frac{d^2X}{dx^2}}_{\text{only }x} + \underbrace{\frac{1}{Y}\frac{d^2Y}{dy^2}}_{\text{only }y} = 0 .$$

            !!key Why each piece must be a constant
              Call the pieces $f(x)$ and $g(y)$, with $f(x) + g(y) = 0$ for every $x$ and $y$. Hold $y$ fixed and change $x$: $g$ does not change, so $f$ cannot change either. So $f$ is a constant and $g$ is minus the same constant. Griffiths: "the whole method rides on it."

            $$\frac{1}{X}\frac{d^2X}{dx^2} = k^2, \qquad \frac{1}{Y}\frac{d^2Y}{dy^2} = -k^2 .$$

            (The notes write the second one as $\tfrac{1}{Y(y)}\tfrac{d^2X}{dx^2} = -k^2$. That is a copying slip; it is $Y''$ over $Y$.)

            One partial differential equation has become two ordinary ones, with the solutions you know:

            $$X(x) = Ae^{kx} + Be^{-kx}, \qquad Y(y) = C\sin ky + D\cos ky .$$

            Four constants $A, B, C, D$ (and $k$) are left. The boundary conditions fix them.
          `),

          Q(md`After dividing by $XY$ you have $f(x) + g(y) = 0$, where $f = X''/X$ and $g = Y''/Y$. Why must $f$ be a constant?`,
            [md`Because Laplace's equation is linear.`, md`Because $X$ must be an exponential.`, md`Because the boundary values are constants.`, md`Change $x$ at fixed $y$: $g(y)$ stays put and the sum must stay $0$, so $f$ cannot change.`], 3,
            [md`Linearity is what lets you *add* solutions later. It is not why $f$ is constant.`, md`That is a consequence of $f$ being a (positive) constant, not the reason.`, md`The argument uses only the differential equation, before any boundary condition enters.`, null],
            md`A function of $x$ alone plus a function of $y$ alone equals zero for **all** $(x, y)$. Freeze $y$: the second term is a fixed number, so the first term is fixed too, at every $x$. Hence $f(x) = k^2$ and $g(y) = -k^2$.`,
            { nofig: 'pure logic of the separation step' }),

          Q(md`Which is the general solution of $\dfrac{d^2X}{dx^2} = k^2 X$ with $k > 0$?`,
            [md`$X = A\sin kx + B\cos kx$`, md`$X = Ae^{kx} + Be^{-kx}$`, md`$X = A + Bx$`, md`$X = Ae^{kx}$`], 1,
            [md`That solves $X'' = -k^2X$: $(\sin kx)'' = -k^2\sin kx$.`, null, md`That solves $X'' = 0$, the special case $k = 0$.`, md`A second-order equation has two independent solutions. Keep both until a boundary condition removes one.`],
            md`Try $e^{\lambda x}$: $\lambda^2 = k^2$, so $\lambda = \pm k$. Equivalent forms: $A'\cosh kx + B'\sinh kx$. Which form is most convenient depends on the region (Lesson 5).`,
            { nofig: 'an ODE fact' }),

          Q(md`A student says: "$V = 5x + 6y$ solves Laplace's equation but is not a product $X(x)Y(y)$, so separation of variables can never find it." What is the best reply?`,
            [md`True. Separation only reaches a small family of solutions and this is outside it.`, md`$5x + 6y$ does not solve Laplace's equation.`, md`$5x + 6y = 5\,(x)(1) + 6\,(1)(y)$, a sum of two product solutions (separation constant $0$). Sums of products are exactly what the method builds.`, md`It is unphysical, so it does not matter.`], 2,
            [md`It is reachable: $x\cdot 1$ and $1\cdot y$ are products (they are the $k = 0$ solutions $X'' = 0$, $Y'' = 0$). The method always ends with a *sum* of products.`, md`Both second derivatives of a linear function are zero, so $\nabla^2 V = 0$.`, null, md`It is perfectly physical: it is the potential of a uniform field $\vb E = -(5, 6)$.`],
            md`One product is very restrictive. The power of the method is superposition: Laplace's equation is linear, so any sum of product solutions is a solution. Linear pieces like $x$ and $y$ come from the separation constant $k = 0$, which you will need when two parallel plates sit at different potentials (Lesson 5).`,
            { nofig: 'about a formula, no geometry' }),

          RF(md`
            ### Which variable oscillates?

            The sign of the separation constant is a choice, and the boundary conditions make it for you (the lecture: "the sign is chosen with the boundary conditions in mind").

            - $Y$ must vanish at **both** $y = 0$ and $y = a$. A sine can do that. An exponential combination $Ce^{ky} + De^{-ky}$ crosses zero at most once, so it cannot. So $Y$ gets the **negative** constant: $Y'' = -k^2Y$, sines and cosines.
            - $X$ must die as $x \to \infty$. A sine never dies; $e^{-kx}$ does. So $X$ gets the **positive** constant: $X'' = +k^2X$, exponentials.

            [[fig:sh]]

            !!key Rule
              The direction with **two** zero boundaries gets $\sin$/$\cos$. The other direction gets $e^{\pm kx}$ (or $\cosh$/$\sinh$). The two constants add to zero, so once one is $-k^2$ the other is $+k^2$.

            !!intuition Curvature has to balance
              $\nabla^2 V = 0$ says the curvature along $x$ cancels the curvature along $y$. If $V$ bends like a sine across the slot (curving back toward zero), it has to bend the other way along the slot: exponential growth or decay. More wiggles across (bigger $k$) means faster decay along. The mode $\sin(3\pi y/a)$ dies like $e^{-3\pi x/a}$, three times faster than $\sin(\pi y/a)$.
          `, { sh: PF.row([{ svg: sh1, cap: 'Across the slot: $\\sin(n\\pi y/a)$ vanishes at both plates.' }, { svg: sh2, cap: 'Along the slot: $e^{-n\\pi x/a}$ dies out, faster for larger $n$.' }]) }),

          Q(md`In the slot, which coordinate gets the sines and cosines?`,
            [md`$x$, because it runs to infinity.`, md`Both $x$ and $y$; each gets $-k^2$.`, md`It does not matter; either choice works.`, md`$y$, because $V$ must vanish at both $y = 0$ and $y = a$.`], 3,
            [md`A sine never dies out, so it cannot meet $V \to 0$ as $x \to \infty$.`, md`The two constants must add to zero. In 2-D they cannot both be negative.`, md`The wrong choice leaves only $V = 0$ (next question).`, null],
            md`Look for the direction with two zero boundaries: here $y = 0$ and $y = a$. Sines fit between two zeros; exponentials do not. The leftover direction ($x$) gets exponentials.`,
            { figHtml: SLOT }),

          Q(md`Suppose you chose $X''/X = -k^2$ and $Y''/Y = +k^2$ instead. What happens when you apply BCs #1 and #2?`,
            [md`$Y = Ce^{ky} + De^{-ky}$ cannot vanish at both $y = 0$ and $y = a$ unless $C = D = 0$, so only $V = 0$ survives.`, md`Nothing changes; you get $k = n\pi/a$ from the $x$ direction instead.`, md`You get valid solutions that oscillate along the slot.`, md`The Fourier series just converges more slowly.`], 0,
            [null, md`Quantization comes from a function that must vanish at two places. In this choice that function is the exponential in $y$, which cannot.`, md`An oscillating $X$ never decays, so BC #4 fails too.`, md`There is no series left to converge: only the trivial solution satisfies the BCs.`],
            md`$Y(0) = C + D = 0$ gives $Y = 2C\sinh ky$, and $\sinh(ka) \ne 0$ for $k \ne 0$, so $C = 0$. Separation always "works" algebraically; the boundary conditions tell you which sign gives non-trivial solutions.`,
            { figHtml: SLOT_BC }),

          Q(md`How many zeros can $Ce^{ky} + De^{-ky}$ have ($k \ne 0$, $C$ and $D$ not both zero)?`,
            [md`None, ever.`, md`At most one.`, md`Exactly two.`, md`Infinitely many when $C = -D$.`], 1,
            [md`$C = 1$, $D = -1$ gives $2\sinh ky$, which is zero at $y = 0$.`, null, md`Setting it to zero gives $e^{2ky} = -D/C$, which has at most one solution.`, md`$C = -D$ gives $2C\sinh ky$, which vanishes only at $y = 0$.`],
            md`$Ce^{ky} + De^{-ky} = 0 \iff e^{2ky} = -D/C$. The exponential is monotonic, so there is one solution if $-D/C > 0$ and none otherwise. That is why exponentials (and $\sinh$, $\cosh$) can never satisfy *two* zero boundary conditions, and sines must be used in that direction.

            [[fig:z]]`,
            { nofig: 'a property of a function', figs: { z: { svg: plt({ w: 300, h: 170, x: [0, 1], y: [-1.3, 1.6], zero: true, xl: 'y/a', xt: [[1, '1']], yt: [[1, '1']], curves: [{ f: (y) => Math.sinh(PI * y) / Math.sinh(PI), lab: '\\sinh', labAt: 0.86, dy: 10 }, { f: (y) => Math.cosh(PI * y) / Math.cosh(PI), cls: 'dim', lab: '\\cosh', labAt: 0.62, dy: -10 }, { f: (y) => Math.exp(-PI * y) - 0.3 * Math.exp(PI * y) / 7, cls: 'dash', lab: 'e^{-ky}-c\\,e^{ky}', labAt: 0.62, dy: 14 }] }), cap: 'Combinations of $e^{\\pm ky}$ cross zero at most once.' } } }),

          Q(md`More wiggles across means faster decay along. The term with $\sin(3\pi y/a)$ in the slot comes with which $x$-dependence?`,
            [md`$e^{-\pi x/a}$`, md`$e^{-\pi x/3a}$`, md`$e^{-3\pi x/a}$`, md`$\sin(3\pi x/a)$`], 2,
            [md`The decay rate is the same $k$ that appears in the sine. Here $k = 3\pi/a$, not $\pi/a$.`, md`Inverted: a larger $k$ means *faster* decay, so the length scale is $a/3\pi$, not $3a/\pi$.`, null, md`Along the slot the function must decay, not oscillate.`],
            md`The same $k$ appears in both factors: $X'' = k^2X$, $Y'' = -k^2Y$. With $Y = \sin(3\pi y/a)$, $k = 3\pi/a$, so $X = e^{-3\pi x/a}$. High harmonics die fast: by $x = a$ the $n = 3$ term is down by $e^{-3\pi} \approx 8\times10^{-5}$.`,
            { figHtml: SLOT }),

          RF(md`
            ### The master recipe

            Everything in this unit follows the same steps. Learn them as a checklist; exams reward writing them out in order.

            !!method Separation of variables, Cartesian
              1. **Draw** the region. Write each boundary value next to its face. Number the BCs, including the one at infinity.
              2. **Check** that the region is charge-free (Laplace) and bounded by coordinate planes.
              3. **Separate**: $V = X(x)Y(y)$, so $X''/X + Y''/Y = 0$, each piece constant.
              4. **Choose the sign**: the variable with two zero BCs gets $-k^2$ (sin/cos); the other gets $+k^2$ ($e^{\pm kx}$, or $\cosh$/$\sinh$).
              5. **Apply the zero (homogeneous) BCs**: they kill terms ($D = 0$, $A = 0$) and quantize $k = n\pi/a$.
              6. **Superpose**: $V = \sum_n C_n X_n(x)\sin(n\pi y/a)$. The sum still meets every zero BC.
              7. **Apply the last BC** (the live face) with Fourier's trick: $C_n = \dfrac{2}{a}\displaystyle\int_0^a V_0(y)\sin\dfrac{n\pi y}{a}\,dy$.
              8. **Simplify and check**: which $n$ survive, each BC, the sign, a symmetric point, the far field.

            Why the live face goes last: a zero condition survives addition ($0 + 0 = 0$), so every term can carry it. A condition like $V = V_0$ does not: two terms that each equal $V_0$ on a face add to $2V_0$ there. So the zero BCs go into each term, and the live face goes into the coefficients.
          `),

          Q(md`Which boundary condition of the slot is imposed last, through the coefficients $C_n$?`,
            [md`BC #4, $V \to 0$ as $x \to \infty$.`, md`BC #2, $V = 0$ at $y = a$.`, md`BC #1, $V = 0$ at $y = 0$.`, md`BC #3, $V = V_0(y)$ at $x = 0$.`], 3,
            [md`Homogeneous. It goes into every term: it removes $e^{+kx}$ ($A = 0$).`, md`Homogeneous. It quantizes $k = n\pi/a$.`, md`Homogeneous. It removes the cosine ($D = 0$).`, null],
            md`BC #3 is the only one with a non-zero value. You can't build it into each term (a single sine can't match a general $V_0(y)$, and each term carrying the full $V_0$ would over-count). Instead you add up terms and choose the weights $C_n$ so the sum equals $V_0(y)$.`,
            { figHtml: SLOT_BC }),

          Q(md`A **homogeneous** boundary condition means:`,
            [md`$V = 0$ on that boundary (or $V \to 0$ there), so any sum of terms that each satisfy it also satisfies it.`, md`$V$ is the same constant everywhere on that boundary.`, md`The boundary is a conductor.`, md`The boundary is at infinity.`], 0,
            [null, md`$V = V_0 \ne 0$ on a face is uniform but **not** homogeneous: two solutions that each have $V_0$ there add up to $2V_0$.`, md`A conductor makes $V$ uniform on that surface, not zero. The live strip is a conductor too.`, md`BC #4 is homogeneous, but so are BCs #1 and #2 at finite $y$.`],
            md`"Homogeneous" means "zero", so that it is preserved under adding solutions and under multiplying by constants. Those are the conditions you can impose term by term. The non-zero one is fitted last with the coefficients.`,
            { figHtml: SLOT_BC }),

          RF(md`
            !!key Patterns to remember
              - Recognize the type: charge-free region, flat boundaries at given potentials, so separation of variables. A point charge inside the region points to images instead.
              - $V = XY$, divide by $XY$: each piece is a constant, $+k^2$ and $-k^2$.
              - Two zero BCs in one direction: $\sin$/$\cos$ there. A direction running to infinity: $e^{-kx}$.
              - The same $k$ sets the wiggles across and the decay along: more wiggles, faster decay.
              - Zero BCs go into every term. The live face goes into the coefficients, last.
          `),
        ],
      },
      // ============================================================ LESSON 2
      {
        id: 'u6-slot', title: 'The slot, one boundary condition at a time',
        steps: [
          RF(md`
            Start from the separated solution (Lecture 11 p. 4):

            $$V(x,y) = \left(Ae^{kx} + Be^{-kx}\right)\left(C\sin ky + D\cos ky\right).$$

            Now spend the boundary conditions one at a time, in the lecture's order. The three homogeneous (zero) ones go first.

            **BC #1**, $V(x,0) = 0$. At $y = 0$ the second bracket is $C\cdot 0 + D\cdot 1 = D$. For $V$ to vanish there at every $x$, $D = 0$ ("since $\cos 0 = 1$"). So $Y = C\sin ky$.

            **BC #4**, $V \to 0$ as $x \to \infty$. $e^{kx}$ blows up, so $A = 0$ ("since $e^{kx} \to \infty$"). So $X = Be^{-kx}$.

            Combine the constants (the lecture's "$BC$, call this $C$"):

            $$V(x,y) = C\,e^{-kx}\sin ky .$$

            **BC #2**, $V(x,a) = 0$. Now $\sin ka = 0$, so $ka = n\pi$:

            $$k = \frac{n\pi}{a}, \qquad n = 1, 2, 3, \dots$$

            $n = 0$ gives $V = 0$, which is useless. Negative $n$ gives nothing new: $\sin(-ky) = -\sin ky$ is the same function with the sign absorbed into $C$.

            [[fig:roles]]

            !!key What each boundary condition did
              | BC | kind | what it does |
              |---|---|---|
              | #1: $V = 0$ at $y = 0$ | homogeneous | kills $\cos ky$: $D = 0$ |
              | #4: $V \to 0$ as $x \to \infty$ | homogeneous | kills $e^{+kx}$: $A = 0$ |
              | #2: $V = 0$ at $y = a$ | homogeneous | quantizes $k = n\pi/a$ |
              | #3: $V = V_0(y)$ at $x = 0$ | live | fixes the coefficients $C_n$ (Fourier's trick, below) |
          `, { roles: { svg: ROLES, cap: 'The job of each boundary condition in the slot.' } }),

          Q(md`Apply BC #1, $V(x, 0) = 0$, to $V = (Ae^{kx} + Be^{-kx})(C\sin ky + D\cos ky)$. What do you learn?`,
            [md`$C = 0$`, md`$D = 0$`, md`$A = 0$`, md`$k = 0$`], 1,
            [md`$C$ multiplies $\sin ky$, which is already zero at $y = 0$. BC #1 says nothing about $C$.`, null, md`$A$ multiplies $e^{kx}$. Removing it is the job of BC #4 (the condition far away).`, md`$k = 0$ would make $\sin ky$ vanish everywhere and leave a trivial solution.`],
            md`At $y = 0$: $\sin 0 = 0$ and $\cos 0 = 1$, so $V(x, 0) = (Ae^{kx} + Be^{-kx})\,D$. This must vanish for every $x$, and the $x$-bracket isn't identically zero (else $V \equiv 0$), so $D = 0$.`,
            { figHtml: SLOT_BC }),

          Q(md`Which boundary condition forces $A = 0$ (the coefficient of $e^{kx}$)?`,
            [md`BC #1: $V = 0$ at $y = 0$.`, md`BC #2: $V = 0$ at $y = a$.`, md`BC #3: $V = V_0(y)$ at $x = 0$.`, md`BC #4: $V \to 0$ as $x \to \infty$.`], 3,
            [md`BC #1 acts on the $y$-function; it removes the cosine.`, md`BC #2 also acts on the $y$-function; it quantizes $k$.`, md`BC #3 fixes the coefficients at the very end. It can't remove a growing exponential.`, null],
            md`$e^{kx}$ with $k > 0$ grows without bound as $x \to \infty$, so a non-zero $A$ would violate BC #4. In a *finite* box there is no such condition and $e^{kx}$ stays (it becomes part of a $\sinh$ or $\cosh$, Lesson 6).`,
            { figHtml: SLOT_BC }),

          Q(md`Why can't $k$ be any positive number once BC #2 is applied?`,
            [md`Because $V_0(y)$ is given at $x = 0$.`, md`Because $e^{-kx}$ must decay.`, md`Because BC #2 needs $\sin ka = 0$, so $ka = n\pi$.`, md`Because $k$ must be an integer.`], 2,
            [md`$V_0(y)$ fixes the coefficients, not the allowed $k$.`, md`$e^{-kx}$ decays for **every** $k > 0$; decay doesn't single out values.`, null, md`$k$ has units of 1/length. It is $n\pi/a$, not an integer.`],
            md`$C e^{-kx}\sin ka = 0$ for all $x$ requires $\sin ka = 0$: $ka = \pi, 2\pi, 3\pi, \dots$. Two zero boundary conditions in the same direction always quantize the separation constant: a whole number of half-waves must fit across the slot.`,
            { figHtml: SLOT_BC }),

          Q(md`Why are $n = 0$ and negative $n$ left out of $k = n\pi/a$?`,
            [md`$n = 0$ gives $V = 0$ everywhere; negative $n$ repeat the positive ones with the sign absorbed into $C_n$.`, md`$n = 0$ is needed for a constant term, but negative $n$ are not allowed.`, md`Negative $n$ give cosines, which BC #1 removed.`, md`Both make $1/n$ blow up.`], 0,
            [null, md`With $k = 0$, $\sin ky = 0$ identically (and the $k = 0$ linear solutions can't vanish on both plates either). There is no constant term in the slot.`, md`$\sin(-ky) = -\sin ky$: still a sine.`, md`$1/n$ appears only in the constant-$V_0$ coefficients. The reason is more basic: no new functions.`],
            md`$k = 0$: $\sin(0\cdot y) = 0$, so the term is zero. $k < 0$: $\sin(-|k|y) = -\sin|k|y$, the same shape, so it adds nothing a positive $n$ doesn't already give. (It would also turn $e^{-kx}$ into a growing exponential.)`,
            { nofig: 'about the index n' }),

          Q(md`After BCs #1, #2 and #4, one term $C\,e^{-n\pi x/a}\sin(n\pi y/a)$ is left for each $n$. Which boundary conditions does one such term satisfy?`,
            [md`All four.`, md`BCs #1, #2 and #4 exactly; BC #3 only if $V_0(y)$ happens to be proportional to $\sin(n\pi y/a)$.`, md`Only BCs #1 and #2.`, md`Only BC #3.`], 1,
            [md`At $x = 0$ the term is $C\sin(n\pi y/a)$: a single sine. A constant strip, for instance, is not a single sine.`, null, md`It also dies far away, so BC #4 holds too.`, md`Backwards: #3 is the one it generally misses.`],
            md`This is the lecture's "issue 2": we have an infinite set of solutions and no obvious way to satisfy BC #3. Griffiths: "unless $V_0(y)$ just happens to have the form $\sin(n\pi y/a)$ for some integer $n$, we simply can't fit the final boundary condition." The fix is to add them up.`,
            { figHtml: SLOT_BC }),

          RF(md`
            ### Two issues, one fix

            The lecture lists two issues at this point:

            1. We have an infinite set of solutions, one for each $n$.
            2. We have no obvious way to satisfy BC #3.

            The fix is **superposition**. Laplace's equation is linear: if $\nabla^2 V_1 = 0$ and $\nabla^2 V_2 = 0$, then $\nabla^2(V_1 + V_2) = 0$. Every term vanishes on both plates and far away, so any sum does too. So

            $$V(x,y) = \sum_{n=1}^{\infty} C_n\, e^{-n\pi x/a}\sin\!\left(\frac{n\pi y}{a}\right)$$

            satisfies Laplace's equation and BCs #1, #2, #4 for **any** choice of the $C_n$.

            [[fig:modes]]

            BC #3 becomes one equation for all the coefficients at once:

            $$V_0(y) = \sum_{n=1}^{\infty} C_n \sin\!\left(\frac{n\pi y}{a}\right), \qquad 0 < y < a .$$

            That is a Fourier sine series. The sines are **complete**: any reasonable $V_0(y)$, even one with a finite number of jumps, can be written this way (Dirichlet's theorem). So the right $C_n$ exist. Next: how to find them.
          `, { modes: { svg: MODES.svg, cap: 'Equipotentials of single terms $e^{-n\\pi x/a}\\sin(n\\pi y/a)$ (dashed: negative). Each one vanishes on both plates and dies along the slot; higher $n$ dies faster.' } }),

          Q(md`In the series $V = \sum C_n e^{-n\pi x/a}\sin(n\pi y/a)$, why is $V(x, 0) = 0$ still true, whatever the $C_n$ are?`,
            [md`Because the $C_n$ are chosen to make it vanish.`, md`Because the sines are orthogonal.`, md`It isn't; only each separate term vanishes.`, md`Each term is zero at $y = 0$, and a sum of zeros is zero.`], 3,
            [md`The $C_n$ are chosen to fit BC #3. BC #1 holds for *any* $C_n$.`, md`Orthogonality is used to *find* the $C_n$. It has nothing to do with BC #1.`, md`If every term is zero at $y = 0$, so is the sum.`, null],
            md`This is why homogeneous conditions are imposed term by term: they survive superposition. That leaves only the live face to be matched by the coefficients.`,
            { figHtml: SLOT_BC }),

          Q(md`Two potentials $V_1$ and $V_2$ both solve Laplace's equation in the slot, and both equal $V_0$ on the end strip. Does $V_1 + V_2$ satisfy BC #3?`,
            [md`No. It equals $2V_0$ on the strip: a non-zero boundary value is not preserved by adding.`, md`Yes, by superposition.`, md`Yes, if $V_1$ and $V_2$ are both products $X(x)Y(y)$.`, md`Only if $V_0$ is a constant.`], 0,
            [null, md`Superposition guarantees $\nabla^2(V_1 + V_2) = 0$. It does not preserve a non-zero boundary value.`, md`Being a product changes nothing: on the strip the sum is still $V_0 + V_0$.`, md`$V_0 + V_0 = 2V_0$ for a constant too.`],
            md`Zero conditions add to zero; non-zero ones add up. That is the whole reason the live face is handled last, by choosing the weights $C_n$ so the *sum* hits $V_0(y)$.`,
            { figHtml: SLOT }),

          Q(md`What does it mean that the functions $\sin(n\pi y/a)$, $n = 1, 2, \dots$, are **complete** on $0 < y < a$?`,
            [md`Each one vanishes at $y = 0$ and $y = a$.`, md`They are orthogonal to each other.`, md`Any reasonable function $V_0(y)$ on $(0, a)$, even one with finitely many jumps, can be written as $\sum C_n\sin(n\pi y/a)$.`, md`The series has infinitely many terms.`], 2,
            [md`True, but that's what lets them satisfy BCs #1 and #2. Completeness is a different property.`, md`That is orthogonality, the property used to *compute* the $C_n$. Completeness guarantees the expansion exists.`, null, md`Infinitely many functions isn't enough: e.g. the even-$n$ sines alone are infinite but not complete.`],
            md`Completeness = "you can build anything from them" (the lecture: "they can represent any function even if it has a finite number of discontinuities", via Dirichlet's theorem). Orthogonality = "you can pick out one coefficient at a time". The method needs both.`,
            { nofig: 'definition' }),

          RF(md`
            ### Fourier's trick

            The sines are **orthogonal** on $0 \le y \le a$ (the in-class question: "what does that mean?"):

            $$\int_0^a \sin\!\left(\frac{n\pi y}{a}\right)\sin\!\left(\frac{m\pi y}{a}\right)dy = \frac{a}{2}\,\delta_{nm}, \qquad \delta_{nm} = \begin{cases}1, & n = m\\ 0, & n \ne m\end{cases}$$

            Why: for $n \ne m$ the product has as much area above the axis as below. For $n = m$ the integrand is $\sin^2$, whose average over whole half-waves is $\tfrac12$, so the integral is $\tfrac12\cdot a$.

            [[fig:orth]]

            Multiply both sides of $V_0(y) = \sum_n C_n\sin(n\pi y/a)$ by $\sin(m\pi y/a)$ and integrate from $0$ to $a$:

            $$\int_0^a V_0(y)\sin\!\left(\frac{m\pi y}{a}\right)dy = \sum_{n=1}^{\infty} C_n \int_0^a \sin\!\left(\frac{n\pi y}{a}\right)\sin\!\left(\frac{m\pi y}{a}\right)dy = \sum_{n=1}^{\infty} C_n\,\frac{a}{2}\,\delta_{nm} = \frac{a}{2}\,C_m .$$

            Every term but $n = m$ dies. Renaming $m \to n$:

            !!key Fourier's trick (Griffiths Eq. 3.34)
              $$C_n = \frac{2}{a}\int_0^a V_0(y)\sin\!\left(\frac{n\pi y}{a}\right)dy$$

            Two slips in the notes on this page, in case you compare: a stray $dy$ appears on the right before anything has been integrated, and the middle step is written $\sum C_n\delta_{mn}$, dropping the $\tfrac{a}{2}$. The last expression, $\tfrac{a}{2}C_m$, is right.
          `, { orth: ORTH }),

          Q(md`$\displaystyle\int_0^a \sin^2\!\left(\frac{3\pi y}{a}\right)dy = \;?$`,
            [md`$a$`, md`$0$`, md`$\dfrac{a}{3}$`, md`$\dfrac{a}{2}$`], 3,
            [md`That would need $\sin^2 = 1$ everywhere. Its average is $\tfrac12$.`, md`$\sin^2 \ge 0$, so the integral can't be zero. Zero is for *different* $n$ and $m$.`, md`The answer does not depend on $n$: three half-waves of average $\tfrac12$ over length $a$ still give $\tfrac a2$.`, null],
            md`$\sin^2\theta = \tfrac12(1 - \cos 2\theta)$. The cosine integrates to zero over whole periods, leaving $\tfrac12\cdot a$. Same for every $n \ge 1$.`,
            { nofig: 'a standard integral' }),

          Q(md`$\displaystyle\int_0^a \sin\!\left(\frac{2\pi y}{a}\right)\sin\!\left(\frac{5\pi y}{a}\right)dy = \;?$`,
            [md`$0$`, md`$\dfrac{a}{2}$`, md`$\dfrac{a}{7}$`, md`$-\dfrac{a}{2}$`], 0,
            [null, md`$\tfrac a2$ is the $n = m$ value. Here $n = 2 \ne m = 5$.`, md`There's no such formula; the product-to-sum terms each integrate to zero.`, md`The integral of a product of two *different* sines is zero, not negative.`],
            md`$\sin A\sin B = \tfrac12[\cos(A - B) - \cos(A + B)]$. Here both cosines, $\cos(3\pi y/a)$ and $\cos(7\pi y/a)$, integrate to $\tfrac{a}{3\pi}\sin 3\pi = 0$ and $\tfrac{a}{7\pi}\sin 7\pi = 0$ over $[0, a]$.`,
            { nofig: 'a standard integral' }),

          Q(md`Where does the factor $\dfrac{2}{a}$ in $C_n = \dfrac{2}{a}\displaystyle\int_0^a V_0(y)\sin\dfrac{n\pi y}{a}\,dy$ come from?`,
            [md`It makes $C_n$ the average value of $V_0(y)$.`, md`It undoes the $\tfrac{a}{2}$ that orthogonality leaves on the other side.`, md`It is a convention; any constant would do.`, md`It normalizes the exponentials $e^{-n\pi x/a}$.`], 1,
            [md`For a constant $V_0$ the result is $\tfrac{4V_0}{n\pi}$ (odd $n$), not $V_0$. It isn't an average.`, null, md`Change it and the series no longer equals $V_0(y)$ at $x = 0$: BC #3 fails. Forgetting it is a classic exam error.`, md`At $x = 0$ the exponentials are all $1$; they play no role in the trick.`],
            md`$\int_0^a V_0\sin(m\pi y/a)\,dy = \tfrac{a}{2}C_m$, so $C_m = \tfrac{2}{a}\int\dots$. If you use $\tfrac{1}{a}$ instead, your series reproduces $V_0/2$ on the strip.`,
            { nofig: 'about a formula' }),

          Q(md`Over which interval do you integrate in Fourier's trick for the slot?`,
            [md`$0$ to $\infty$ along $x$.`, md`$-a$ to $a$.`, md`$0$ to $a/2$.`, md`$0$ to $a$, across the slot, where the sines are orthogonal.`], 3,
            [md`The trick is applied on the live face $x = 0$, across it. $x$ doesn't appear.`, md`The sines are orthogonal on $[0, a]$ with value $\tfrac a2$. On $[-a, a]$ the value would be $a$ and the formula would change.`, md`Half the interval breaks orthogonality: $\int_0^{a/2}\sin\tfrac{\pi y}{a}\sin\tfrac{2\pi y}{a}dy \ne 0$.`, null],
            md`Integrate over the live face, the full width $0 \le y \le a$. That's the interval on which $\int\sin\sin = \tfrac a2\delta_{nm}$. If $V_0(y)$ is piecewise, split the integral into pieces, but together they still cover $0$ to $a$.`,
            { figHtml: SLOT }),

          Q(md`Why multiply by $\sin(m\pi y/a)$ and not by, say, $\cos(m\pi y/a)$?`,
            [md`Multiplying by $\sin(m\pi y/a)$ and integrating kills every term except $n = m$, because the sines are orthogonal on $[0, a]$. A cosine doesn't: $\int_0^a\cos\tfrac{\pi y}{a}\sin\tfrac{2\pi y}{a}\,dy = \tfrac{4a}{3\pi} \ne 0$.`, md`Cosines would work just as well.`, md`Because $V_0(y)$ is an odd function.`, md`Because BC #1 removed the cosines, so they can't appear in an integral.`], 0,
            [null, md`Cosines are not orthogonal to these sines on $[0, a]$, so every term would survive and you'd get one equation with infinitely many unknowns.`, md`$V_0(y)$ lives on $(0, a)$; its parity is not the point.`, md`The multiplier is your choice. What matters is which multiplier isolates a single coefficient.`],
            md`Fourier's trick works because of orthogonality. Multiply by a member of the same orthogonal family that appears in the series.`,
            { nofig: 'about the integral' }),

          RF(md`
            ### The constant strip, $V_0(y) = V_0$

            $$C_n = \frac{2V_0}{a}\int_0^a \sin\!\left(\frac{n\pi y}{a}\right)dy = \frac{2V_0}{a}\cdot\frac{a}{n\pi}\Big[-\cos\frac{n\pi y}{a}\Big]_0^a = \frac{2V_0}{n\pi}\left(1 - \cos n\pi\right).$$

            With $\cos n\pi = (-1)^n$:

            $$C_n = \begin{cases} 0, & n \text{ even},\\[2pt] \dfrac{4V_0}{n\pi}, & n \text{ odd}.\end{cases}$$

            The notes skip the factor $\tfrac{a}{m\pi}$ from integrating the sine (they write $-V_0\cos\tfrac{m\pi y}{a}\big|_0^a = \tfrac{a}{2}C_m$), and then write $\tfrac{4V_0}{n\pi}$ where the index is $m$. The final result is right; if your own algebra doesn't reproduce it, that missing $\tfrac{a}{m\pi}$ is why.

            !!key The slot (Griffiths Eq. 3.36)
              $$V(x,y) = \frac{4V_0}{\pi}\sum_{n = 1,3,5,\dots}\frac{1}{n}\,e^{-n\pi x/a}\sin\!\left(\frac{n\pi y}{a}\right)$$

            Even $n$ drop out because $\sin(n\pi y/a)$ with even $n$ has as much positive as negative area across the slot, so a constant has zero overlap with it.

            [[fig:map]]

            Check it against every BC:

            - #1, #2: every sine vanishes at $y = 0$ and $y = a$.
            - #4: every term dies as $x \to \infty$.
            - #3: at $x = 0$ the series is the sine series of the constant $V_0$.
            - Range: $0 < V < V_0$ inside, between the boundary values, as it must be (no maxima or minima inside a charge-free region).

            This series can be summed (Griffiths Eq. 3.37): $V = \dfrac{2V_0}{\pi}\tan^{-1}\!\left(\dfrac{\sin(\pi y/a)}{\sinh(\pi x/a)}\right)$. You don't need it, but it is handy for numerical checks.
          `, { map: { svg: SLOT_MAP, cap: 'Equipotentials $V = 0.1V_0, 0.2V_0, \\dots, 0.9V_0$ of the slot with a constant strip. They crowd at the corners, where $V$ jumps from $V_0$ to $0$.' } }),

          Q(md`For a constant strip, why are all the even-$n$ coefficients zero?`,
            [md`Because $\sin(n\pi/2) = 0$ for even $n$.`, md`Each even-$n$ sine has equal positive and negative area across the slot, so its overlap with a constant is zero.`, md`Even terms decay too fast to matter.`, md`Because $V_0$ is an even function.`], 1,
            [md`True but irrelevant: that is the value at the midpoint. $C_n$ is an integral over the whole width.`, null, md`Decay along $x$ has nothing to do with the coefficients at $x = 0$; the even ones are exactly zero.`, md`The relevant symmetry is about $y = a/2$ (Lesson 4), and the coefficients come from the integral, not a parity label.`],
            md`$\int_0^a\sin(n\pi y/a)\,dy = \tfrac{a}{n\pi}(1 - \cos n\pi)$, which is $0$ for even $n$. Picture $n = 2$: one positive hump, one negative hump, equal size. A constant weights them equally, so they cancel.`,
            { figHtml: sh1 }),

          Q(md`$C_1 = \dfrac{4V_0}{\pi} \approx 1.27\,V_0$ is bigger than $V_0$. Doesn't that make the potential at the strip too big?`,
            [md`Yes: it's a slip, $C_1$ should be $V_0$.`, md`Yes: the series overshoots $V_0$ everywhere on the strip.`, md`No: the other terms bring the sum back down. At $y = a/2$: $\tfrac{4V_0}{\pi}\left(1 - \tfrac13 + \tfrac15 - \dots\right) = \tfrac{4V_0}{\pi}\cdot\tfrac{\pi}{4} = V_0$.`, md`No: $C_1$ is the potential at the corner.`], 2,
            [md`$C_1 = \tfrac{2}{a}V_0\int_0^a\sin\tfrac{\pi y}{a}dy = \tfrac{4V_0}{\pi}$. It's correct.`, md`The full series equals $V_0$ at every interior point of the strip. Overshoot happens only in truncated sums near the corners (Gibbs).`, null, md`At the corner every term is zero.`],
            md`A single half-sine has to be taller than the flat top it imitates, since it starts and ends at zero. The $n = 3, 5, \dots$ terms, with alternating signs at the middle, pull the sum down to exactly $V_0$. Far down the slot only the first term survives, and then the "1.27" is real: $V \approx \tfrac{4V_0}{\pi}e^{-\pi x/a}\sin(\pi y/a)$.`,
            { figHtml: SLOT }),

          Q(md`Inside the slot with a constant strip $V_0 > 0$, the potential is:`,
            [md`Between $0$ and $V_0$ everywhere.`, md`Above $V_0$ near the corners (Gibbs).`, md`Negative close to the plates.`, md`Exactly $V_0/2$ on the midline $y = a/2$.`], 0,
            [null, md`Gibbs overshoot is a property of *truncated* sums on the boundary, not of the true potential.`, md`Every term is positive near the plates... more simply: a harmonic function takes its extreme values on the boundary, which is at $0$ and $V_0$.`, md`On the midline $V$ falls from $V_0$ (at the strip) toward $0$ (far away).`],
            md`Solutions of Laplace's equation have no local maxima or minima inside the region (the averaging property from Lecture 9). So $V$ lies between the smallest and largest boundary values: $0 < V < V_0$. Use this as a sanity check on any answer.`,
            { figHtml: SLOT_MAP }),

          Q(md`What are the units of the coefficients $C_n$ in $V = \sum C_n e^{-n\pi x/a}\sin(n\pi y/a)$?`,
            [md`Dimensionless.`, md`Volts per meter.`, md`Volt-meters.`, md`Volts.`], 3,
            [md`The exponential and the sine are dimensionless, so $C_n$ carries the units of $V$.`, md`That is a field. Nothing in the series is differentiated.`, md`$\tfrac{2}{a}\int_0^a V_0\sin(\dots)\,dy$: $\tfrac{1}{\text{m}}\times\text{V}\cdot\text{m} = \text{V}$.`, null],
            md`A quick dimension check catches a missing $\tfrac{2}{a}$: without it $C_n$ would come out in volt-meters.`,
            { nofig: 'units' }),

          P({
            title: 'A slot whose end is a single sine',
            q: md`The plates of the slot at $y = 0$ and $y = a$ are grounded. The end strip at $x = 0$ is held at

            $$V_0(y) = V_0\sin\!\left(\frac{3\pi y}{a}\right).$$

            Find $V(x, y)$ in the slot.`,
            figHtml: SLOT_SIN3,
            hints: [
              md`Same slot, same homogeneous BCs (#1, #2, #4). So the general solution is the same series, $V = \sum C_n e^{-n\pi x/a}\sin(n\pi y/a)$. Only BC #3 has changed.`,
              md`Write BC #3: $\sum_n C_n\sin(n\pi y/a) = V_0\sin(3\pi y/a)$. Compare the two sides term by term.`,
              md`If you prefer the integral: $C_n = \tfrac{2}{a}\int_0^a V_0\sin\tfrac{3\pi y}{a}\sin\tfrac{n\pi y}{a}\,dy = \tfrac{2}{a}V_0\tfrac{a}{2}\delta_{n3}$.`,
            ],
            parts: [
              { lbl: 'V(x,y)', expr: 'V0*exp(-3*pi*x/a)*sin(3*pi*y/a)', vars: { V0: [1, 3], x: [0, 2], y: [0.1, 0.9], a: [1, 2] }, accepts: ['V0*sin(3*pi*y/a)*exp(-3*pi*x/a)', 'V0*sin(3*pi*y/a)/exp(3*pi*x/a)'] },
              { lbl: md`$V(a/6,\,a/6)/V_0$ (a number)`, ans: Math.exp(-PI / 2), unit: '' },
              { lbl: md`Apart from the plates, where inside the slot is $V = 0$?`, mc: [md`Nowhere.`, md`On the lines $y = a/3$ and $y = 2a/3$, at every $x$.`, md`On the line $y = a/2$.`, md`On the line $x = a/3$.`], a: 1, why: [md`$\sin(3\pi y/a)$ has zeros inside $(0, a)$.`, null, md`$\sin(3\pi/2) = -1$: the midline is where $|V|$ is largest.`, md`The $x$-dependence is a decaying exponential, which never vanishes.`] },
            ],
            sol: md`
              **Boundary conditions** (region $x > 0$, $0 < y < a$):

              1. $V(x, 0) = 0$ (homogeneous)
              2. $V(x, a) = 0$ (homogeneous)
              3. $V(0, y) = V_0\sin(3\pi y/a)$ (live)
              4. $V \to 0$ as $x \to \infty$ (homogeneous)

              BCs #1, #4, #2 are the lecture's, so exactly as before: $D = 0$, $A = 0$, $k = n\pi/a$, and

              $$V = \sum_{n=1}^{\infty} C_n\,e^{-n\pi x/a}\sin\!\left(\frac{n\pi y}{a}\right).$$

              BC #3: $\sum C_n\sin(n\pi y/a) = V_0\sin(3\pi y/a)$. The right side already is the $n = 3$ term, so $C_3 = V_0$ and every other $C_n = 0$. (Fourier's trick agrees: $C_n = \tfrac{2}{a}V_0\cdot\tfrac{a}{2}\delta_{n3}$.)

              $$V(x,y) = V_0\,e^{-3\pi x/a}\sin\!\left(\frac{3\pi y}{a}\right).$$

              At $(a/6, a/6)$: $V = V_0 e^{-\pi/2}\sin(\pi/2) = 0.208\,V_0$.

              [[fig:m]]

              Zero lines: $\sin(3\pi y/a) = 0$ at $y = a/3$ and $y = 2a/3$. The potential is positive in the bottom and top thirds, negative in the middle third, at every $x$; the pattern only fades with distance, on the length scale $a/3\pi$.

              **Checks.** Each BC holds by inspection. $\nabla^2V = \left(\tfrac{3\pi}{a}\right)^2V - \left(\tfrac{3\pi}{a}\right)^2V = 0$.

              **What to remember:** if $V_0(y)$ is already a sum of sines $\sin(n\pi y/a)$, read off the coefficients. No integral needed.
            `,
            figs: { m: { svg: SLOT_SIN3_MAP, cap: 'Equipotentials of $V_0e^{-3\\pi x/a}\\sin(3\\pi y/a)$ (dashed: negative). The zero lines sit at $y = a/3$ and $2a/3$.' } },
          }),

          P({
            title: 'A wider slot',
            q: md`The slot is rebuilt with its grounded plates at $y = 0$ and $y = 2a$. The end strip at $x = 0$ is at the constant potential $V_0$. Point P is at $(a, a)$, on the midline.

            (a) Which values of $k$ are allowed? (b) Find $V$ at P. (c) Compare with the original slot of width $a$.`,
            figHtml: SLOT_2A,
            hints: [
              md`List the BCs. Only BC #2 has moved: $V = 0$ at $y = 2a$.`,
              md`BC #2 now needs $\sin(k\cdot 2a) = 0$.`,
              md`The coefficients come from Fourier's trick over the new width $2a$. Then evaluate the series at $x = a$, $y = a$; the first term or two are plenty.`,
            ],
            parts: [
              { lbl: md`(a) Allowed $k$:`, mc: [md`$k = n\pi/a$`, md`$k = n\pi/(2a)$`, md`$k = 2n\pi/a$`, md`$k = n\pi/a$, odd $n$ only`], a: 1, why: [md`That fits $n$ half-waves into width $a$, not $2a$.`, null, md`Backwards: a wider slot allows *smaller* $k$.`, md`Which $n$ survive is decided by the coefficients, later. BC #2 alone gives $\sin(2ka) = 0$.`] },
              { lbl: md`(b) $V(\text{P})/V_0$ (a number)`, ans: 0.26096, unit: '' },
              { lbl: md`(c) Compared with the width-$a$ slot, the potential along the midline is:`, mc: [md`The same function of $x$.`, md`The same function of $x$ divided by the width: a wider slot lets the potential reach proportionally farther.`, md`Twice as large at every $x$.`, md`Half as large at every $x$.`], a: 1, why: [md`The decay rate is $\pi/\text{width}$, which halves when the width doubles.`, null, md`The boundary values ($0$ and $V_0$) are the same, so the size can't double.`, md`At the strip it is still $V_0$; only the length scale changes.`] },
            ],
            sol: md`
              **Boundary conditions** (region $x > 0$, $0 < y < 2a$):

              1. $V(x, 0) = 0$ (homogeneous) $\Rightarrow D = 0$
              2. $V(x, 2a) = 0$ (homogeneous) $\Rightarrow \sin(2ka) = 0$, so $k = \dfrac{n\pi}{2a}$
              3. $V(0, y) = V_0$ (live) $\Rightarrow C_n$
              4. $V \to 0$ as $x \to \infty$ (homogeneous) $\Rightarrow A = 0$

              $$V = \sum_n C_n\,e^{-n\pi x/2a}\sin\!\left(\frac{n\pi y}{2a}\right), \qquad C_n = \frac{2}{2a}\int_0^{2a}V_0\sin\!\left(\frac{n\pi y}{2a}\right)dy = \frac{2V_0}{n\pi}(1 - \cos n\pi).$$

              So $C_n = \tfrac{4V_0}{n\pi}$ for odd $n$, as before: the coefficients don't depend on the width.

              At P: $\dfrac{n\pi x}{2a} = \dfrac{n\pi}{2}$ and $\sin\dfrac{n\pi y}{2a} = \sin\dfrac{n\pi}{2} = +1, -1, +1, \dots$ for $n = 1, 3, 5$:

              $$V(\text{P}) = \frac{4V_0}{\pi}\left(e^{-\pi/2} - \tfrac13 e^{-3\pi/2} + \tfrac15e^{-5\pi/2} - \dots\right) = \frac{4V_0}{\pi}(0.20788 - 0.00299 + 0.00008) = 0.261\,V_0 .$$

              One term alone gives $0.265\,V_0$, within 1.5%.

              **Scaling.** Everything depends on $x/w$ and $y/w$, where $w$ is the plate separation. P sits at $x/w = y/w = \tfrac12$, the same relative spot as $(a/2, a/2)$ in the original slot, so it has the same potential, $0.261\,V_0$. A wider slot lets the potential reach proportionally farther (decay length $w/\pi$).
            `,
          }),

          RF(md`
            !!key Patterns to remember
              - Apply the zero BCs first, one at a time: $y = 0$ kills $\cos$, $x \to \infty$ kills $e^{+kx}$, $y = a$ quantizes $k = n\pi/a$.
              - Superpose all $n$. Zero BCs survive the sum; the live face doesn't, so it fixes the coefficients.
              - Orthogonality: $\int_0^a\sin\tfrac{n\pi y}{a}\sin\tfrac{m\pi y}{a}dy = \tfrac{a}{2}\delta_{nm}$. Fourier: $C_n = \tfrac{2}{a}\int_0^a V_0(y)\sin\tfrac{n\pi y}{a}dy$.
              - Constant strip: $C_n = \tfrac{4V_0}{n\pi}$, odd $n$ only. $V = \tfrac{4V_0}{\pi}\sum_{\text{odd}}\tfrac1n e^{-n\pi x/a}\sin\tfrac{n\pi y}{a}$.
              - If $V_0(y)$ is already a sum of these sines, read the coefficients off.
              - Check: each BC, $V$ between the boundary values, units of $C_n$ are volts.
          `),
        ],
      },
      // ============================================================ LESSON 3
      {
        id: 'u6-converge', title: 'Why it works, and how the series behaves',
        steps: [
          RF(md`
            Assuming $V = X(x)Y(y)$ looked like throwing away almost every solution. Four facts show nothing was lost:

            1. **Linearity.** Sums of solutions of $\nabla^2 V = 0$ are solutions.
            2. **Zero BCs survive sums.** Each term vanishes on the plates and far away, so the sum does too.
            3. **Completeness.** The functions $\sin(n\pi y/a)$, $n = 1, 2, \dots$ can represent any $V_0(y)$ on $(0, a)$ with finitely many jumps, so the last BC can always be met.
            4. **Uniqueness.** A function that satisfies Laplace's equation and every BC **is** the solution. There is no other one that the product form might have missed.

            So the method is: find enough special solutions (products), add them up to fit the boundary, and let uniqueness certify the result.

            !!intuition Why each separated piece is a constant, once more
              $X''/X$ is built from $X$ alone, so it can't depend on $y$. It equals $-Y''/Y$, which can't depend on $x$. Something that depends on neither $x$ nor $y$ is a constant. That one line is where the PDE splits into two ODEs.
          `),

          Q(md`You found $V = \tfrac{4V_0}{\pi}\sum_{\text{odd}}\tfrac1n e^{-n\pi x/a}\sin\tfrac{n\pi y}{a}$ by *assuming* product solutions. How do you know it is *the* potential in the slot and not just one of several?`,
            [md`Because Fourier series are unique.`, md`It satisfies Laplace's equation and all four BCs, and by the uniqueness theorem only one function does that.`, md`Because the series converges.`, md`You don't; other solutions could exist that aren't sums of products.`], 1,
            [md`That says the coefficients are unique once you use sines. It doesn't rule out a completely different function.`, null, md`Convergence makes it a well-defined function. It doesn't make it the only solution.`, md`Uniqueness rules them out: two solutions with the same boundary values would differ by a harmonic function that is zero on every boundary, which is zero.`],
            md`This is the same logic as the method of images: produce *any* function that satisfies Laplace's equation in the region and matches $V$ on every boundary, and uniqueness guarantees it's the answer. Separation is a systematic way of producing one.`,
            { figHtml: SLOT_BC }),

          Q(md`Which property guarantees that coefficients $C_n$ **exist** that make $\sum C_n\sin(n\pi y/a) = V_0(y)$?`,
            [md`Orthogonality of the sines.`, md`Linearity of Laplace's equation.`, md`Completeness of the sines on $(0, a)$.`, md`Uniqueness of the solution.`], 2,
            [md`Orthogonality lets you *compute* the $C_n$ once you know they exist. It doesn't promise they exist.`, md`Linearity lets you add solutions. It doesn't say the sum can match an arbitrary $V_0(y)$.`, null, md`Uniqueness certifies the answer after you've built it.`],
            md`Completeness (Dirichlet's theorem in the lecture): the sines span every reasonable function on the interval. Each property has a job: completeness (it can be done), orthogonality (how to do it), linearity (the sum is still a solution), uniqueness (it is the answer).`,
            { nofig: 'about properties of the method' }),

          Q(md`You keep only the terms $n = 1, 3, 5, \dots, 99$ of the slot series. Is the result a solution of Laplace's equation?`,
            [md`Yes. Each term is, so the finite sum is. It meets BCs #1, #2, #4 exactly and BC #3 only approximately.`, md`No. Only the full infinite series solves Laplace's equation.`, md`Yes, and it meets all four BCs exactly.`, md`No. Truncating breaks BC #1.`], 0,
            [null, md`Every single term solves Laplace's equation, and so does any finite sum of them.`, md`At $x = 0$ the truncated sum is only an approximation to $V_0$ (with Gibbs ringing near the corners).`, md`Every term is zero at $y = 0$, so any partial sum is too.`],
            md`A partial sum is an exact solution of Laplace's equation with slightly wrong data on the live face. That's why it's so accurate inside the slot: the error on the strip dies off like the higher harmonics themselves.`,
            { figHtml: SLOT_BC }),

          RF(md`
            ### How the series converges, and the Gibbs phenomenon

            On the strip itself ($x = 0$) the coefficients fall off only like $1/n$, so convergence there is slow. Inside the slot each term carries $e^{-n\pi x/a}$, and the series converges fast.

            At the corners the boundary value jumps: the strip is at $V_0$, the plate next to it at $0$. Every sine is zero at $y = 0$ and $y = a$, so the series gives exactly $0$ at the corners. (A sine series converges to the middle of a jump in the *odd* extension, which runs from $-V_0$ to $+V_0$; the middle is $0$.) Just inside, partial sums overshoot and ring: the **Gibbs phenomenon** (the lecture's sketch on L12-4: "the function oscillates at the edges").

            [[fig:gibbs]]

            !!key Gibbs in numbers
              For the constant strip the partial sums peak at about $1.18\,V_0$ near each corner however many terms you keep: an overshoot of $0.18\,V_0$, about 9% of the full jump $2V_0$ of the odd extension. More terms squeeze the ringing toward the corner; they don't shrink it. At any fixed interior point the series still converges to $V_0$.
          `, { gibbs: { svg: GIBBS, cap: 'Partial sums of $V(0, y)$ for the constant strip: $n = 1$ only, $n \\le 5$, $n \\le 21$ (odd $n$). The dashed line is $V_0$.' } }),

          Q(md`On the strip, at its midpoint $(0, a/2)$, the full series for the constant strip converges to:`,
            [md`$\dfrac{4V_0}{\pi}$`, md`$V_0/2$`, md`$0$`, md`$V_0$`], 3,
            [md`That's the first term alone. The other terms alternate in sign there and bring the sum down.`, md`$V_0/2$ is what a sine series gives at a *jump*. The midpoint of the strip is not a jump.`, md`$0$ is the value at the corners, where every sine vanishes.`, null],
            md`At $y = a/2$: $\tfrac{4V_0}{\pi}\left(1 - \tfrac13 + \tfrac15 - \tfrac17 + \dots\right) = \tfrac{4V_0}{\pi}\cdot\tfrac{\pi}{4} = V_0$ (Leibniz series). The series reproduces BC #3 at every point where $V_0(y)$ is continuous.`,
            { figHtml: GIBBS }),

          Q(md`At the corner $(x, y) = (0, 0)$, where the strip meets the bottom plate, the series gives:`,
            [md`$V_0$`, md`$0$, because every $\sin(n\pi y/a)$ vanishes at $y = 0$.`, md`$V_0/2$, the average of the two sides of the jump.`, md`It diverges.`], 1,
            [md`The strip is at $V_0$ just above the corner, but the series is a sum of sines, all zero at $y = 0$.`, null, md`The average of $0$ (plate) and $V_0$ (strip) is a natural guess, but a sine series converges to the middle of the jump of its odd extension ($-V_0$ to $+V_0$): $0$.`, md`Every term is exactly zero there, so the sum is $0$.`],
            md`The corner is a genuine discontinuity in the boundary data (in reality a thin insulating gap). The potential near it depends on direction; the series just reports $0$ exactly at $y = 0$, then rises steeply.`,
            { figHtml: SLOT }),

          Q(md`You keep more and more terms of the constant-strip series and plot $V(0, y)$. Near the corner $y \to 0$ the overshoot:`,
            [md`Disappears once you keep about 20 terms.`, md`Grows without bound.`, md`Stays at about 9% of the jump (peak $\approx 1.18V_0$), but moves closer to the corner and gets narrower.`, md`Moves to the middle of the strip.`], 2,
            [md`It never disappears for finite $N$; it only gets narrower.`, md`It saturates near $1.179V_0$.`, null, md`The middle converges nicely; the trouble is at the jumps.`],
            md`Numerically the peak of the partial sum is $1.200V_0$ with 2 terms, $1.188V_0$ with 3, $1.181V_0$ with 6, $1.1797V_0$ with 11 and $1.1790V_0$ with 51, always just inside the corner, at about $y = a/(n_{\max} + 1)$. This is a property of truncated Fourier series at a jump, not of the real potential.`,
            { figHtml: GIBBS }),

          Q(md`At which point do you need the **most** terms of the series to get $V$ to 1%?`,
            [md`$(0.02a,\; 0.02a)$, right next to the corner.`, md`$(a,\; a/2)$`, md`$(2a,\; a/4)$`, md`All points need the same number.`], 0,
            [null, md`At $x = a$ the $n = 3$ term is down by $e^{-2\pi}/3 \approx 6\times10^{-4}$ relative to $n = 1$. One term is enough.`, md`Even farther out; one term is plenty.`, md`The factor $e^{-n\pi x/a}$ makes convergence much faster away from the strip.`],
            md`Close to the live face the higher harmonics haven't decayed ($e^{-n\pi x/a} \approx 1$ when $x \ll a/n\pi$), and close to the corner $V$ changes fast. Far down the slot one term does it.`,
            { figHtml: SLOT_BC }),

          RF(md`
            ### Far down the slot

            Each term decays like $e^{-n\pi x/a}$. The first decays slowest, so a fraction of a width from the end only $n = 1$ is left:

            $$V(x,y) \approx \frac{4V_0}{\pi}\,e^{-\pi x/a}\sin\!\left(\frac{\pi y}{a}\right) \qquad (x \gtrsim a/2).$$

            How good? The next term is $n = 3$. On the midline its size relative to $n = 1$ is $\tfrac13e^{-2\pi x/a}$: 1.4% at $x = a/2$, 0.06% at $x = a$.

            [[fig:far]]

            The potential falls by a factor $e$ every $a/\pi \approx 0.32a$ along the slot, and by $e^{-\pi} \approx 1/23$ every full width. A wider slot lets the potential reach proportionally farther.

            The field follows from $\vb E = -\nabla V$. Far down the slot, $E_x = \dfrac{4V_0}{a}\,e^{-\pi x/a}\sin(\pi y/a)$: for $V_0 > 0$ it points away from the strip and is strongest on the midline.
          `, { far: { svg: FAR, cap: 'Potential on the midline $y = a/2$: exact (solid) and the one-term approximation (dashed). They agree within 1.5% for $x \\ge a/2$.' } }),

          WG.sep({ bc: 'const', geo: 'slot', n: 1, title: 'The slot: slide the number of terms, watch the boundary fill in and the far field stay put' }),

          Q(md`Far down the slot ($x \gg a$), the potential across the slot looks like:`,
            [md`A single half-sine, $\sin(\pi y/a)$, with an amplitude that decays like $e^{-\pi x/a}$.`, md`A constant $V_0$ across the slot.`, md`A straight line in $y$.`, md`A sum of all harmonics with comparable weights.`], 0,
            [null, md`It must still vanish on both plates.`, md`A straight line can't vanish at both $y = 0$ and $y = a$ unless it's zero.`, md`Higher harmonics die like $e^{-n\pi x/a}$, much faster than $n = 1$.`],
            md`The lowest mode wins at large distance, the same way the lowest-order multipole wins far from a charge distribution: everything else dies faster.`,
            { figHtml: SLOT_MAP }),

          Q(md`Far down the slot, by what factor does the potential on the midline drop between $x = a$ and $x = 2a$?`,
            [md`$\tfrac12$`, md`$e^{-1} \approx 0.37$`, md`$e^{-\pi} \approx 0.043$`, md`$e^{-2\pi} \approx 0.0019$`], 2,
            [md`The decay is exponential, not $1/x$.`, md`That's a drop over a distance $a/\pi$, not $a$.`, null, md`That's the decay of the $n = 2$ term (which is absent for a constant strip anyway), or of $n = 1$ over $2a$.`],
            md`$V \approx \tfrac{4V_0}{\pi}e^{-\pi x/a}$ on the midline, so moving by $\Delta x = a$ multiplies $V$ by $e^{-\pi} \approx 1/23$.`,
            { figHtml: FAR }),

          Q(md`Over what distance does the far-field potential fall by a factor $e$?`,
            [md`$a$`, md`$\pi a$`, md`$a/2$`, md`$a/\pi$`], 3,
            [md`Over $a$ it falls by $e^{\pi} \approx 23$.`, md`Inverted: the exponent is $\pi x/a$.`, md`That's not where the exponent equals 1.`, null],
            md`$e^{-\pi x/a} = e^{-1}$ at $x = a/\pi \approx 0.32a$. The decay length is the slot width over $\pi$, set by the longest half-wave that fits across.`,
            { figHtml: FAR }),

          Q(md`At $(a/2, a/2)$ in the constant-strip slot, how big is the $n = 3$ term compared with the $n = 1$ term?`,
            [md`About $\tfrac13$.`, md`About $\tfrac{1}{27}$.`, md`About $1.4\%$, and of opposite sign.`, md`About $e^{-3\pi/2} \approx 0.9\%$, same sign.`], 2,
            [md`That's the ratio of the coefficients alone; the exponentials differ too.`, md`$1/n^3$ is the parabola's coefficient decay, not this.`, null, md`You need the *ratio* of exponentials, $e^{-3\pi/2}/e^{-\pi/2} = e^{-\pi}$, and $\sin(3\pi/2) = -1$ flips the sign.`],
            md`Ratio $= \dfrac{\tfrac13e^{-3\pi/2}\sin(3\pi/2)}{e^{-\pi/2}\sin(\pi/2)} = -\tfrac13e^{-\pi} = -0.0144$. So at half a width from the strip, one term is already good to 1.4%.`,
            { figHtml: SLOT }),

          Q(md`Far down the slot ($V_0 > 0$), which way does $\vb E$ point on the midline?`,
            [md`In $+\hat{\mathbf x}$, away from the strip.`, md`In $-\hat{\mathbf x}$, toward the strip.`, md`In $\pm\hat{\mathbf y}$, toward the plates.`, md`It is zero on the midline.`], 0,
            [null, md`$\vb E$ points toward *lower* potential. $V$ decreases with $x$, so $\vb E$ points along $+x$.`, md`On the midline $\partial V/\partial y \propto \cos(\pi/2) = 0$, so there is no $y$-component there.`, md`$E_x = -\partial V/\partial x = \tfrac{\pi}{a}V \ne 0$.`],
            md`$E_x = -\dfrac{\partial V}{\partial x} \approx \dfrac{4V_0}{a}e^{-\pi x/a}\sin\dfrac{\pi y}{a} > 0$. Off the midline $\vb E$ also has a $y$-component pointing toward the nearer plate, where field lines end on induced negative charge.`,
            { figHtml: SLOT }),

          Q(md`Which equipotential map could be the slot with a constant strip at $V_0$ on the left and grounded plates?`,
            [md`(A)`, md`(B)`, md`(C)`, md`(D)`], 1,
            [md`Lines parallel to the plates mean $V$ depends on $y$ only. Then it couldn't be zero on both plates while positive between them.`, null, md`Vertical lines mean $V$ depends on $x$ only. Then $V$ would be non-zero on the plates, violating BCs #1 and #2.`, md`Contours crowd at both ends, as if the far end were live too. With a single live strip, $V \to 0$ far away (BC #4).`],
            md`Read a map by checking every boundary: contours must meet the plates only at the corners (the plates are a single equipotential, $V = 0$), crowd near the live strip, and fade with distance. Only (B) does all three.`,
            { figHtml: READMAPS.svg }),

          Q(md`Two slots, widths $a$ and $2a$, both with constant strips at $V_0$. At a distance $x = a$ down the midline, which has the larger potential?`,
            [md`The narrow slot.`, md`The wide slot.`, md`They are equal.`, md`It depends on $V_0$.`], 1,
            [md`Narrow plates sit close to the midline and pin $V$ to zero sooner.`, null, md`The decay length is $\text{width}/\pi$, so they can't be equal.`, md`Both scale with $V_0$; the ratio doesn't.`],
            md`$V \approx \tfrac{4V_0}{\pi}e^{-\pi x/w}$ on the midline: at $x = a$ that's $0.055V_0$ for $w = a$ and $0.26V_0$ for $w = 2a$. Grounded plates close together screen the strip quickly.`,
            { figHtml: SLOT_2A }),

          P({
            title: 'How far does the strip reach?',
            q: md`A slot has grounded plates $2\ \text{cm}$ apart. Its end strip is held at $V_0 = 100\ \text{V}$. Use the one-term approximation.

            (a) Find $V$ at P, $3\ \text{cm}$ down the slot on the midline. (b) How far down the midline is $V = 1\ \text{V}$? (c) Find $E_x$ there.`,
            figHtml: SLOT_NUM,
            hints: [
              md`Far from the strip only $n = 1$ matters: $V \approx \tfrac{4V_0}{\pi}e^{-\pi x/a}\sin(\pi y/a)$ with $a = 2\ \text{cm}$. Is P "far"? Check $x/a$.`,
              md`For (b) set $\tfrac{4V_0}{\pi}e^{-\pi x/a} = 1\ \text{V}$ and solve for $x$ with a logarithm.`,
              md`For (c), $E_x = -\partial V/\partial x$. Differentiating $e^{-\pi x/a}$ just brings down $\pi/a$.`,
            ],
            parts: [
              { lbl: md`(a) $V(\text{P})$ in volts`, ans: 1.1438, unit: 'V' },
              { lbl: md`(b) $x$ in cm`, ans: 3.0855, unit: 'cm' },
              { lbl: md`(c) $E_x$ in V/m`, ans: 157.08, unit: 'V/m' },
            ],
            sol: md`
              **Boundary conditions** (region $x > 0$, $0 < y < a$, $a = 2\ \text{cm}$): #1 $V = 0$ at $y = 0$; #2 $V = 0$ at $y = a$; #3 $V = 100\ \text{V}$ at $x = 0$ (live); #4 $V \to 0$ as $x \to \infty$. This is the lecture's slot, so

              $$V = \frac{4V_0}{\pi}\sum_{\text{odd } n}\frac1n e^{-n\pi x/a}\sin\frac{n\pi y}{a} \approx \frac{4V_0}{\pi}e^{-\pi x/a}\sin\frac{\pi y}{a}.$$

              (a) P: $x/a = 1.5$, $y/a = 0.5$. $V = \tfrac{400}{\pi}e^{-1.5\pi}\cdot 1 = 127.3 \times 0.00898 = 1.14\ \text{V}$. The $n = 3$ term is smaller by $\tfrac13e^{-3\pi} \approx 3\times10^{-5}$: negligible. (The exact series gives $1.1438\ \text{V}$ too.)

              (b) $\tfrac{400}{\pi}e^{-\pi x/a} = 1 \Rightarrow x = \tfrac{a}{\pi}\ln\tfrac{400}{\pi} = \tfrac{2\ \text{cm}}{\pi}\times 4.847 = 3.09\ \text{cm}$.

              (c) $E_x = -\dfrac{\partial V}{\partial x} = \dfrac{\pi}{a}V = \dfrac{\pi}{0.02\ \text{m}}\times 1\ \text{V} = 157\ \text{V/m}$, pointing away from the strip.

              **Checks.** $V$ is far below $V_0$ after 1.5 widths ($e^{-1.5\pi} \approx 1\%$ times $4/\pi$). Units: $\tfrac{\pi}{a}\cdot V$ is V/m.
            `,
          }),

          P({
            title: 'Close to the strip one term is not enough',
            q: md`For the slot with a constant strip $V_0$, find $V$ at Q $= (a/4,\, a/4)$:

            (a) with the $n = 1$ term only; (b) with the first three non-zero terms ($n = 1, 3, 5$). (c) Why is one term worse here than at $(a/2, a/2)$?`,
            figHtml: SLOT_Q,
            hints: [
              md`Write out the terms of $\tfrac{4V_0}{\pi}\sum_{\text{odd}}\tfrac1n e^{-n\pi x/a}\sin\tfrac{n\pi y}{a}$ at $x = y = a/4$.`,
              md`$\sin(n\pi/4)$ for $n = 1, 3, 5$ is $+\tfrac{1}{\sqrt2}, +\tfrac{1}{\sqrt2}, -\tfrac{1}{\sqrt2}$.`,
              md`Compare $e^{-3\pi/4}/e^{-\pi/4}$ with $e^{-3\pi/2}/e^{-\pi/2}$.`,
            ],
            parts: [
              { lbl: md`(a) one term: $V(\text{Q})/V_0$`, ans: 0.41049, unit: '' },
              { lbl: md`(b) three terms: $V(\text{Q})/V_0$`, ans: 0.43539, unit: '' },
              { lbl: md`(c) One term is worse at Q because:`, mc: [md`Q is closer to the strip, so the higher harmonics have decayed less: the $n = 3$ term is $\tfrac13e^{-\pi/2} \approx 7\%$ of $n = 1$ there.`, md`Q is off the midline, where the series doesn't converge.`, md`The coefficients are different at Q.`, md`It isn't worse; both are equally good.`], a: 0, why: [null, md`The series converges at every interior point.`, md`The $C_n$ are numbers; they don't depend on the point.`, md`At $(a/2, a/2)$ the error is 1.4%; at Q it's about 6%.`] },
            ],
            sol: md`
              **Terms at Q** ($x = y = a/4$), with $\tfrac{4}{\pi} = 1.2732$:

              | $n$ | $\tfrac1n e^{-n\pi/4}$ | $\sin(n\pi/4)$ | term$/V_0$ |
              |---|---|---|---|
              | 1 | $0.45594$ | $0.70711$ | $+0.41049$ |
              | 3 | $0.03159$ | $0.70711$ | $+0.02844$ |
              | 5 | $0.00394$ | $-0.70711$ | $-0.00355$ |

              (a) $0.410\,V_0$. (b) $0.410 + 0.028 - 0.004 = 0.435\,V_0$. The exact value (closed form $\tfrac{2}{\pi}\tan^{-1}\tfrac{\sin(\pi/4)}{\sinh(\pi/4)}$) is $0.4350\,V_0$, so three terms are good to 0.1% and one term is 6% low.

              (c) The size of the $n = 3$ term relative to $n = 1$ is $\tfrac13e^{-2\pi x/a}\times\tfrac{\sin(3\pi y/a)}{\sin(\pi y/a)}$. At $x = a/4$ the exponential is $e^{-\pi/2} = 0.21$; at $x = a/2$ it is $e^{-\pi} = 0.043$. Closer to the live face, more terms matter.

              **What to remember:** one term is a far-field tool. Within about $a/3$ of the live face, keep a few terms.
            `,
          }),

          RF(md`
            !!key Patterns to remember
              - Linearity + completeness let a sum of products match any boundary data; uniqueness certifies the result.
              - A partial sum solves Laplace exactly and meets the zero BCs exactly; only the live face is approximate.
              - At jumps in $V_0(y)$ the series converges to the middle of the jump and partial sums overshoot by about 9% of the jump (Gibbs). Interior points converge fine.
              - Far field: the lowest mode, $\tfrac{4V_0}{\pi}e^{-\pi x/a}\sin\tfrac{\pi y}{a}$. Decay length $a/\pi$; factor $e^{-\pi} \approx 1/23$ per width.
              - Near the live face, keep several terms.
          `),
        ],
      },
      // ============================================================ LESSON 4
      {
        id: 'u6-fourier', title: 'Fourier coefficients: the toolbox',
        steps: [
          RF(md`
            Every slot or box problem ends with the same step: expand the potential on the live face in sines,

            $$C_n = \frac{2}{a}\int_0^a V_0(y)\sin\!\left(\frac{n\pi y}{a}\right)dy .$$

            You need only a handful of integrals, and none of them is on the formula sheet:

            | integral | value |
            |---|---|
            | $\displaystyle\int_0^{c}\sin\frac{n\pi y}{a}\,dy$ | $\dfrac{a}{n\pi}\left(1 - \cos\dfrac{n\pi c}{a}\right)$ |
            | $\displaystyle\int_0^{a}\sin\frac{n\pi y}{a}\,dy$ | $\dfrac{a}{n\pi}(1 - \cos n\pi)$, i.e. $\dfrac{2a}{n\pi}$ for odd $n$, $0$ for even $n$ |
            | $\displaystyle\int_0^{a}y\sin\frac{n\pi y}{a}\,dy$ | $-\dfrac{a^2\cos n\pi}{n\pi} = (-1)^{n+1}\dfrac{a^2}{n\pi}$ |
            | $\displaystyle\int_0^{a}y(a-y)\sin\frac{n\pi y}{a}\,dy$ | $\dfrac{2a^3}{(n\pi)^3}(1 - \cos n\pi)$ |
            | $\displaystyle\int_0^{a}\sin\frac{n\pi y}{a}\sin\frac{m\pi y}{a}\,dy$ | $\dfrac{a}{2}\delta_{nm}$ |

            Values to keep at hand: $\cos n\pi = (-1)^n$; $\cos(n\pi/2) = 0, -1, 0, +1$ for $n = 1, 2, 3, 4$ (then it repeats); $\sin(n\pi/2) = 1, 0, -1, 0$.

            If $V_0(y)$ is already a sum of the sines $\sin(n\pi y/a)$, skip the integral and read off the coefficients.
          `),

          Q(md`The live end of a slot is held at $V_0(y) = V_0\sin(\pi y/a)$. What are the coefficients?`,
            [md`$C_1 = V_0$, all other $C_n = 0$.`, md`$C_n = \dfrac{4V_0}{n\pi}$ for odd $n$.`, md`$C_1 = \dfrac{4V_0}{\pi}$, others zero.`, md`$C_1 = V_0/2$, others zero.`], 0,
            [null, md`That's the constant strip. A single sine needs only itself.`, md`$\tfrac{4V_0}{\pi}$ is the first coefficient of a *constant*; here the boundary already is the $n = 1$ mode.`, md`Fourier's trick gives $C_1 = \tfrac2a\cdot V_0\cdot\tfrac a2 = V_0$. The $\tfrac12$ cancels against the $\tfrac2a$.`],
            md`$V = V_0e^{-\pi x/a}\sin(\pi y/a)$ exactly: one term, no series. This is the boundary condition that makes the far-field approximation exact everywhere.`,
            { figHtml: slot({ end: 'V_0\\sin(\\pi y/a)' }) }),

          Q(md`The live end is held at $V_0(y) = V_0\left[2\sin(\pi y/a) - \sin(4\pi y/a)\right]$. What is $C_4$?`,
            [md`$V_0$`, md`$-V_0$`, md`$0$`, md`$-V_0/2$`], 1,
            [md`Watch the sign: the $\sin(4\pi y/a)$ term enters with $-1$.`, null, md`$\sin(4\pi y/a)$ is present in $V_0(y)$, so $C_4 \ne 0$.`, md`No factor of $\tfrac12$: comparing coefficients of identical sines gives them directly.`],
            md`Match term by term: $C_1 = 2V_0$, $C_4 = -V_0$, all others zero. So $V = 2V_0e^{-\pi x/a}\sin\tfrac{\pi y}{a} - V_0e^{-4\pi x/a}\sin\tfrac{4\pi y}{a}$. The $n = 4$ part dies four times faster.`,
            { figHtml: slot({ end: 'V_0[2\\sin(\\pi y/a)-\\sin(4\\pi y/a)]' }) }),

          RF(md`
            ### Use symmetry before you integrate

            Reflect the slot in its midline, $y \to a - y$. The sines respond as

            $$\sin\!\left(\frac{n\pi(a-y)}{a}\right) = -\cos(n\pi)\,\sin\!\left(\frac{n\pi y}{a}\right) = (-1)^{n+1}\sin\!\left(\frac{n\pi y}{a}\right).$$

            So the odd-$n$ sines are **symmetric** about $y = a/2$ and the even-$n$ sines are **antisymmetric**.

            [[fig:symm]]

            !!key Symmetry rule
              - $V_0(y)$ symmetric about $a/2$ (same value at $y$ and $a - y$): only **odd** $n$.
              - $V_0(y)$ antisymmetric about $a/2$ (opposite values at $y$ and $a - y$): only **even** $n$.
              - Neither: write it as a symmetric part plus an antisymmetric part; each feeds its own set of $n$.

            Why: the integral over $[0, a]$ of a symmetric function times an antisymmetric one is zero; the two halves cancel.

            A corollary: on the midline every even-$n$ term vanishes ($\sin(n\pi/2) = 0$ for even $n$), so the potential on the midline depends only on the **symmetric part** of $V_0(y)$.
          `, { symm: { svg: SYMM, cap: 'Odd $n$: symmetric about $y = a/2$ (dashed line). Even $n$: antisymmetric.' } }),

          Q(md`Which boundary potential $V_0(y)$ has **only odd** $n$ in its sine series?`,
            [md`$V_0\,y/a$`, md`$+V_0$ for $y < a/2$, $-V_0$ for $y > a/2$`, md`$V_0$ for $a/4 < y < 3a/4$, zero elsewhere`, md`$V_0\sin(2\pi y/a)$`], 2,
            [md`The ramp is neither symmetric nor antisymmetric about $a/2$, so it has both odd and even $n$.`, md`Antisymmetric: only even $n$.`, null, md`That's the single even mode $n = 2$.`],
            md`The centered strip looks the same after $y \to a - y$, so it is symmetric about the midline and only odd $n$ survive. (Its $C_n = \tfrac{2V_0}{n\pi}\left[\cos\tfrac{n\pi}{4} - \cos\tfrac{3n\pi}{4}\right]$ is indeed zero for every even $n$.)`,
            { figHtml: CSTRIP }),

          Q(md`Which boundary potential has **only even** $n$?`,
            [md`$V_0$ (constant)`, md`$V_0\left(1 - \dfrac{2y}{a}\right)$`, md`$\dfrac{4V_0}{a^2}\,y(a-y)$`, md`$V_0$ for $y < a/2$, $0$ above`], 1,
            [md`Symmetric: odd $n$ only.`, null, md`Symmetric about $a/2$ (a parabola peaked in the middle): odd $n$ only.`, md`Neither symmetric nor antisymmetric: both odd and even $n$ (all except multiples of 4).`],
            md`$f(y) = 1 - 2y/a$ goes from $+1$ at $y = 0$ to $-1$ at $y = a$ through $0$ at the midline: $f(a - y) = -f(y)$. Antisymmetric, so only even $n$. Check one: $C_1 \propto \int_0^a(1 - 2y/a)\sin\tfrac{\pi y}{a}dy = \tfrac{2a}{\pi} - \tfrac2a\cdot\tfrac{a^2}{\pi} = 0$.`,
            { figHtml: slot({ end: 'V_0(1-2y/a)' }) }),

          Q(md`On the midline $y = a/2$, a slot with the ramp $V_0y/a$ on its end and a slot with $V_0$ on the lower half of its end (zero on the upper half) have **exactly the same** potential at every $x$. Why?`,
            [md`Both have the same average value, $V_0/2$, and the average is all that matters.`, md`Coincidence of the first coefficient only; they differ at larger $n$.`, md`Both have the same symmetric part about $a/2$ (the constant $V_0/2$), and the antisymmetric parts feed only even $n$, which vanish on the midline.`, md`It isn't true; the ramp is larger.`], 2,
            [md`The average alone is not enough: a centered strip with the same average gives a different midline potential. It is the whole symmetric part that matters.`, md`All their odd coefficients agree: $\tfrac{2V_0}{n\pi}$ for both.`, null, md`Check: the odd coefficients are $\tfrac{2V_0}{n\pi}$ for both, and even terms vanish on the midline.`],
            md`Symmetric part of the ramp: $\tfrac12\left(\tfrac{y}{a} + \tfrac{a-y}{a}\right)V_0 = \tfrac{V_0}{2}$. Symmetric part of the half-strip: $\tfrac12(V_0 + 0) = \tfrac{V_0}{2}$. So on the midline both equal the slot with a constant strip at $V_0/2$: $V(x, a/2) = \tfrac{2V_0}{\pi}\sum_{\text{odd}}\tfrac{(-1)^{(n-1)/2}}{n}e^{-n\pi x/a}$.`,
            { figHtml: PF.row([{ svg: RAMP, cap: 'ramp' }, { svg: HALF, cap: 'lower half' }]).svg }),

          RF(md`
            ### The catalog

            | $V_0(y)$ on the live face | $C_n$ | which $n$ survive |
            |---|---|---|
            | (1) $V_0$ | $\dfrac{4V_0}{n\pi}$ | odd |
            | (2) $+V_0$ below $a/2$, $-V_0$ above | $\dfrac{8V_0}{n\pi}$ | $n = 2, 6, 10, \dots$ |
            | (3) $V_0$ below $a/2$, $0$ above | $\dfrac{2V_0}{n\pi}\left(1 - \cos\dfrac{n\pi}{2}\right)$ | all except $4, 8, 12, \dots$ |
            | (4) $V_0\,y/a$ | $(-1)^{n+1}\dfrac{2V_0}{n\pi}$ | all, alternating sign |
            | (5) $V_0\sin(\pi y/a)$ | $C_1 = V_0$ | $n = 1$ only |
            | (6) $\dfrac{4V_0}{a^2}\,y(a-y)$ | $\dfrac{32V_0}{(n\pi)^3}$ | odd |

            [[fig:shapes]]

            [[fig:bars]]

            Read the catalog with the symmetry rule: (1), (5) and (6) are symmetric, so odd $n$ only; (2) is antisymmetric, so even $n$ only; (3) and (4) are neither, so both. Row (3) is half of row (1) plus half of row (2). Boundary data add, so coefficients add.

            !!intuition How fast the coefficients fall
              A jump in $V_0(y)$, including a jump to the grounded plate at $y = 0$ or $y = a$, gives $C_n \sim 1/n$. A continuous $V_0(y)$ that is zero at both ends but has a kink (a triangle) gives $1/n^2$. Smooth and zero at the ends, like the parabola, gives $1/n^3$. Smoother boundary data, faster convergence, less Gibbs.
          `, { shapes: { svg: SHAPES.svg, cap: 'The six boundary potentials of the catalog, plotted across the live face.' }, bars: { svg: BARS.svg, cap: 'Their coefficients $C_n/V_0$ for $n = 1$ to $8$.' } }),

          Q(md`For the $\pm V_0$ strips (row 2), why is $C_4 = 0$ even though $n = 4$ is even?`,
            [md`On each half of the strip, $\sin(4\pi y/a)$ runs through one full wave, so a constant on that half integrates to zero.`, md`Because $\cos(2\pi) = 1$ makes the whole formula vanish for every even $n$.`, md`It isn't zero; $C_4 = \dfrac{2V_0}{\pi}$.`, md`Because only odd $n$ survive for any strip pattern.`], 0,
            [null, md`$n = 2$ and $n = 6$ are even and survive. The bracket $1 - 2\cos\tfrac{n\pi}{2} + \cos n\pi$ is $4$ for $n = 2, 6, 10$ and $0$ for $n = 4, 8$.`, md`Plug in: $1 - 2\cos 2\pi + \cos 4\pi = 1 - 2 + 1 = 0$.`, md`Odd $n$ need a symmetric $V_0(y)$. The strips are antisymmetric: odd $n$ are exactly the ones that die.`],
            md`Think of each half as its own slot of width $a/2$. On the lower half, $\sin(n\pi y/a) = \sin\!\big(\tfrac{n}{2}\cdot\tfrac{\pi y}{a/2}\big)$ is the $(n/2)$-th mode of the half-width slot. A constant only feeds the *odd* modes of that slot, so $n/2$ must be odd: $n = 2, 6, 10$.`,
            { figHtml: STRIPS }),

          Q(md`$V_0$ on the lower half of the end, $0$ on the upper half (row 3). Why is $C_4 = 0$?`,
            [md`Because the upper half is grounded.`, md`Because $\int_0^{a/2}\sin(4\pi y/a)\,dy = 0$: one full wave fits in the lower half.`, md`Because $4$ is even.`, md`Because $\sin(4\pi\cdot\tfrac12) = 0$.`], 1,
            [md`The grounded upper half contributes nothing to the integral, true, but that alone doesn't zero $C_4$; $C_2$ survives.`, null, md`$C_2 = \tfrac{2V_0}{\pi} \ne 0$ is even too.`, md`That's the value of the sine at the midpoint, not the integral.`],
            md`$\int_0^{a/2}\sin\tfrac{4\pi y}{a}dy = \tfrac{a}{4\pi}(1 - \cos 2\pi) = 0$. The formula $C_n = \tfrac{2V_0}{n\pi}(1 - \cos\tfrac{n\pi}{2})$ is zero exactly when $n$ is a multiple of 4.`,
            { figHtml: HALF }),

          Q(md`For the ramp $V_0y/a$ (row 4) the coefficients alternate in sign, $+, -, +, \dots$ Where does the alternation come from?`,
            [md`From the factor $\cos n\pi = (-1)^n$ in $\int_0^a y\sin\tfrac{n\pi y}{a}dy = -\tfrac{a^2\cos n\pi}{n\pi}$: the ramp is largest at $y = a$, where $\sin(n\pi y/a)$ approaches zero with slope sign $(-1)^n$.`, md`From an error; all coefficients should be positive since $V_0(y) \ge 0$.`, md`From the factor $\sin(n\pi/2)$.`, md`From the exponentials $e^{-n\pi x/a}$.`], 0,
            [null, md`A positive function can have negative coefficients: they shape it. Here $\sum(-1)^{n+1}\tfrac{2}{n\pi}\sin\tfrac{n\pi y}{a} = \tfrac{y}{a}$ on $(0, a)$.`, md`$\sin(n\pi/2)$ would give $+, 0, -, 0$, not $+, -, +, -$.`, md`The exponentials are positive and are not part of $C_n$.`],
            md`Integrate by parts: $\int_0^a y\sin ky\,dy = \left[-\tfrac{y\cos ky}{k}\right]_0^a + \int_0^a\tfrac{\cos ky}{k}dy = -\tfrac{a\cos ka}{k}$, with $ka = n\pi$. The boundary term at $y = a$ is what survives, and it carries $\cos n\pi$.`,
            { figHtml: RAMP }),

          Q(md`Which boundary potential gives coefficients that fall off like $1/n^3$?`,
            [md`$V_0$ (constant)`, md`$V_0\,y/a$`, md`$\dfrac{4V_0}{a^2}\,y(a-y)$`, md`$\pm V_0$ strips`], 2,
            [md`A constant jumps to $0$ at the plates: $1/n$.`, md`The ramp jumps from $V_0$ to $0$ at $y = a$: $1/n$.`, null, md`Jumps (at both plates and in the middle): $1/n$.`],
            md`The parabola is continuous, vanishes at both plates, and is smooth inside: $C_n = \tfrac{32V_0}{(n\pi)^3}$ for odd $n$. Its series converges so fast that the single term $1.032V_0\sin(\pi y/a)$ is within $0.043V_0$ of the parabola everywhere on the face. Rule: jumps give $1/n$, kinks give $1/n^2$, smooth data that vanishes at the ends gives $1/n^3$.`,
            { figHtml: SHAPES.svg }),

          Q(md`The ramp $V_0y/a$ ends at $V_0$ next to the grounded top plate. At $(x, y) = (0, a)$, what does its sine series give?`,
            [md`$V_0$`, md`$V_0/2$`, md`$0$`, md`It diverges.`], 2,
            [md`The ramp approaches $V_0$ as $y \to a$, but every sine vanishes at $y = a$.`, md`$V_0/2$ is the middle of the physical jump ($V_0$ to $0$), but a sine series converges to the middle of the jump of its *odd periodic extension*, which runs from $V_0$ to $-V_0$ at $y = a$.`, null, md`Every term is zero there.`],
            md`Every $\sin(n\pi y/a)$ is zero at $y = a$, so the series is $0$ there, with Gibbs ringing just below. Where $V_0(y)$ doesn't vanish at an end, expect $1/n$ coefficients and ringing at that corner.`,
            { figHtml: RAMP }),

          Q(md`$V_0$ on the middle half of the end ($a/4 < y < 3a/4$), $0$ on the outer quarters. What is the sign of $C_3$?`,
            [md`Positive, because $V_0 > 0$.`, md`Zero, by symmetry.`, md`Negative: $\sin(3\pi y/a)$ is negative over most of the middle half, where the strip sits.`, md`It depends on $a$.`], 2,
            [md`A coefficient measures overlap with $\sin(3\pi y/a)$, which is negative on $a/3 < y < 2a/3$, the heart of the strip.`, md`The strip is symmetric, which kills the *even* $n$. $n = 3$ is odd.`, null, md`$C_n$ is a number times $V_0$; the width $a$ cancels.`],
            md`$C_3 = \tfrac{2V_0}{3\pi}\left[\cos\tfrac{3\pi}{4} - \cos\tfrac{9\pi}{4}\right] = \tfrac{2V_0}{3\pi}(-\sqrt2) = -0.300V_0$. Negative $C_3$ narrows the $n = 1$ hump toward the center, which is what a centered strip needs.`,
            { figHtml: CSTRIP }),

          Q(md`For the $\pm V_0$ strips, a student integrates only over the lower strip and gets $C_n = \dfrac{2V_0}{n\pi}\left(1 - \cos\dfrac{n\pi}{2}\right)$. What problem did they actually solve?`,
            [md`The strips problem, correctly.`, md`$V_0$ on the lower half and $0$ on the upper half.`, md`A constant $V_0$ over the whole end.`, md`A strip at $-V_0$ on the upper half only.`], 1,
            [md`The upper strip at $-V_0$ also contributes: $-\tfrac{2V_0}{a}\int_{a/2}^a\sin\tfrac{n\pi y}{a}dy$.`, null, md`That would be $\tfrac{2V_0}{n\pi}(1 - \cos n\pi)$, over the whole width.`, md`The lower-half integral describes the lower strip.`],
            md`Leaving out a piece of the live face is the same as setting it to zero there. The full strips answer is $\tfrac{2V_0}{n\pi}\left[1 - 2\cos\tfrac{n\pi}{2} + \cos n\pi\right]$. Always integrate over the whole width $0$ to $a$, piece by piece.`,
            { figHtml: STRIPS }),

          Q(md`A student uses $C_n = \dfrac{1}{a}\displaystyle\int_0^a V_0(y)\sin\dfrac{n\pi y}{a}\,dy$. What does their final answer get wrong?`,
            [md`Nothing; it's only a normalization convention.`, md`Every coefficient is half as big, so the series gives $V_0(y)/2$ on the live face: BC #3 fails.`, md`Only the even coefficients are wrong.`, md`The series no longer satisfies Laplace's equation.`], 1,
            [md`The $\tfrac{2}{a}$ isn't optional: it comes from $\int_0^a\sin^2 = \tfrac{a}{2}$.`, null, md`The missing factor of 2 hits every coefficient equally.`, md`Each term still solves Laplace's equation; only the boundary values are off.`],
            md`Check BC #3 at the end of every problem: put $x = 0$ (or the live face) into your series and see whether you get the right boundary value at one convenient point, e.g. the midpoint.`,
            { nofig: 'about a formula' }),

          P({
            id: 'D4-3.15', src: 'Discussion 4 · Griffiths 3.15', title: 'The slot with ±V₀ strips', big: true,
            q: md`Find the potential in the infinite slot of Ex. 3.3 if the boundary at $x = 0$ consists of two metal strips: one, from $y = 0$ to $y = a/2$, is held at a constant potential $V_0$, and the other, from $y = a/2$ to $y = a$, is at potential $-V_0$.`,
            figHtml: STRIPS,
            hints: [
              md`This is the slot of Ex. 3.3 with new data on the end. Write the four BCs. #1, #2, #4 are unchanged, so the general solution $V = \sum C_n e^{-n\pi x/a}\sin(n\pi y/a)$ is unchanged. Only the coefficients change.`,
              md`Fourier's trick with a piecewise $V_0(y)$: split the integral at $a/2$, $C_n = \tfrac{2}{a}\left[\int_0^{a/2}V_0\sin\tfrac{n\pi y}{a}dy - \int_{a/2}^{a}V_0\sin\tfrac{n\pi y}{a}dy\right]$.`,
              md`You should get $C_n = \tfrac{2V_0}{n\pi}\left[1 - 2\cos\tfrac{n\pi}{2} + \cos n\pi\right]$. Tabulate the bracket for $n = 1$ to $8$.`,
              md`Check with symmetry: $V_0(y)$ is antisymmetric about $a/2$, so only even $n$ can appear, and $V = 0$ on the whole midline.`,
            ],
            parts: [
              { lbl: md`Which $n$ have $C_n \ne 0$?`, mc: [md`All odd $n$`, md`All even $n$`, md`$n = 2, 6, 10, 14, \dots$`, md`$n = 4, 8, 12, \dots$`], a: 2, why: [md`Odd $n$ are symmetric about $a/2$; the strips are antisymmetric, so every odd coefficient vanishes.`, md`The bracket is $0$ for $n = 4, 8, \dots$: those modes have a full wave on each half.`, null, md`Those are exactly the even $n$ whose bracket $1 - 2 + 1$ vanishes.`] },
              { lbl: 'C_2', expr: '4*V0/pi', vars: { V0: [1, 5] }, accepts: ['8*V0/(2*pi)'] },
              { lbl: md`$C_6/V_0$ (a number)`, ans: 8 / (6 * PI), unit: '' },
              { lbl: md`What is $V$ on the midplane $y = a/2$?`, mc: [md`$V_0/2$`, md`$0$ at every $x$`, md`$V_0e^{-\pi x/a}$`, md`It equals $V_0$ near the strip and decays.`], a: 1, why: [md`The two strips are equal and opposite; the midplane is halfway between them.`, null, md`Every surviving term has $\sin(n\pi/2) = 0$ for even $n$.`, md`At the strip the midplane sits exactly at the gap between $+V_0$ and $-V_0$.`] },
              { lbl: md`$V(a/2,\, a/4)/V_0$ (a number; one or two terms suffice)`, ans: 0.054987, unit: '' },
            ],
            sol: md`
              **Boundary conditions** (region $x > 0$, $0 < y < a$):

              1. $V(x, 0) = 0$ (homogeneous) $\Rightarrow D = 0$
              2. $V(x, a) = 0$ (homogeneous) $\Rightarrow k = n\pi/a$
              3. $V(0, y) = +V_0$ for $0 < y < a/2$, $-V_0$ for $a/2 < y < a$ (live) $\Rightarrow C_n$
              4. $V \to 0$ as $x \to \infty$ (homogeneous) $\Rightarrow A = 0$

              BCs #1, #2, #4 are those of Ex. 3.3, so exactly as in lecture

              $$V(x,y) = \sum_{n=1}^{\infty} C_n\,e^{-n\pi x/a}\sin\!\left(\frac{n\pi y}{a}\right).$$

              **Fourier's trick**, splitting the live face at $a/2$:

              $$C_n = \frac{2}{a}\left[V_0\int_0^{a/2}\sin\frac{n\pi y}{a}\,dy - V_0\int_{a/2}^{a}\sin\frac{n\pi y}{a}\,dy\right] = \frac{2V_0}{a}\cdot\frac{a}{n\pi}\left[\left(1 - \cos\frac{n\pi}{2}\right) - \left(\cos\frac{n\pi}{2} - \cos n\pi\right)\right]$$

              $$C_n = \frac{2V_0}{n\pi}\left[1 - 2\cos\frac{n\pi}{2} + \cos n\pi\right].$$

              | $n$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
              |---|---|---|---|---|---|---|---|---|
              | bracket | $0$ | $4$ | $0$ | $0$ | $0$ | $4$ | $0$ | $0$ |

              So $C_n = \dfrac{8V_0}{n\pi}$ for $n = 2, 6, 10, \dots$ (that is, $n = 4j + 2$) and zero otherwise:

              $$V(x,y) = \frac{8V_0}{\pi}\sum_{n = 2, 6, 10, \dots}\frac{1}{n}\,e^{-n\pi x/a}\sin\!\left(\frac{n\pi y}{a}\right).$$

              [[fig:map]]

              **Why only $n = 2, 6, 10$.** The data is antisymmetric about $y = a/2$, so only even $n$ survive and $V(x, a/2) = 0$. The midplane is then an equipotential at $0$, exactly like a grounded plate. Each half is the lecture's slot with width $a/2$ and a constant strip ($+V_0$ below, $-V_0$ above):

              [[fig:stack]]

              The width-$a/2$ slot has modes $\sin\tfrac{m\pi y}{a/2} = \sin\tfrac{2m\pi y}{a}$ with $m$ odd and coefficients $\tfrac{4V_0}{m\pi}$. With $n = 2m$: $n = 2, 6, 10$ and $C_n = \tfrac{4V_0}{m\pi} = \tfrac{8V_0}{n\pi}$. Same answer, no integral.

              **A number.** At $(a/2, a/4)$: $V = \tfrac{8V_0}{2\pi}e^{-\pi}\sin\tfrac{\pi}{2} + \tfrac{8V_0}{6\pi}e^{-3\pi}\sin\tfrac{3\pi}{2} = (0.05502 - 0.00003)V_0 = 0.0550\,V_0$. It equals the lecture slot's value at $(a, a/2)$, as the stacking picture says it must.

              **Checks.** BC #3 at $y = a/4$: $\tfrac{8V_0}{\pi}\left(\tfrac12 - \tfrac16 + \tfrac1{10} - \dots\right) = \tfrac{8V_0}{\pi}\cdot\tfrac{\pi}{8} = V_0$. Correct sign: positive below the midline, negative above. Far field: $V \approx \tfrac{4V_0}{\pi}e^{-2\pi x/a}\sin\tfrac{2\pi y}{a}$, which dies twice as fast as the constant strip's far field, because the effective width is $a/2$.

              **What to remember:** split the integral at the jumps and cover the whole width; then use symmetry to predict which $n$ survive and to check the result.
            `,
            figs: { map: { svg: STRIPS_MAP, cap: 'Equipotentials of the strips solution; dashed contours are negative. The midplane is the $V = 0$ line.' }, stack: { svg: STACK.svg, cap: 'The strips problem is two stacked copies of the lecture slot with width $a/2$.' } },
          }),

          WG.sep({ bc: 'strips', geo: 'slot', n: 2, title: 'The ±V₀ strips: only n = 2, 6, 10, … appear' }),

          P({
            title: 'A strip on the lower half only',
            q: md`The end of the slot is made of two insulated strips: the lower one ($0 < y < a/2$) is held at $V_0$, the upper one ($a/2 < y < a$) is grounded. The plates are grounded.

            (a) Find $C_1$ to $C_4$. (b) Which statement is true? (c) Find $V$ at $(a,\, a/2)$.`,
            figHtml: HALF,
            hints: [
              md`BCs #1, #2, #4 as in lecture, so the same series. BC #3: $V_0(y) = V_0$ for $y < a/2$, $0$ above.`,
              md`$C_n = \tfrac{2}{a}\int_0^{a/2}V_0\sin\tfrac{n\pi y}{a}dy$: the grounded half adds nothing.`,
              md`At $y = a/2$ the even terms vanish, and at $x = a$ the $n = 3$ term is tiny.`,
            ],
            parts: [
              { lbl: md`$C_1/V_0$`, ans: 2 / PI, unit: '' },
              { lbl: md`$C_2/V_0$`, ans: 2 / PI, unit: '' },
              { lbl: md`$C_3/V_0$`, ans: 2 / (3 * PI), unit: '' },
              { lbl: md`$C_4/V_0$`, ans: 0, unit: '' },
              { lbl: md`(b) Which is true?`, mc: [md`These coefficients are the average of the constant-strip and the $\pm V_0$-strips coefficients.`, md`Only odd $n$ appear, as for the constant strip.`, md`The coefficients are those of the constant strip divided by 2.`, md`$C_n = 0$ for all even $n$.`], a: 0, why: [null, md`$C_2 = \tfrac{2V_0}{\pi} \ne 0$.`, md`That gets the odd ones right but misses the even ones ($n = 2, 6, \dots$).`, md`$C_2 \ne 0$; only multiples of 4 vanish.`] },
              { lbl: md`(c) $V(a, a/2)/V_0$`, ans: 0.027494, unit: '' },
            ],
            sol: md`
              **Boundary conditions:** #1 $V(x, 0) = 0$, #2 $V(x, a) = 0$, #4 $V \to 0$ as $x \to \infty$ (all homogeneous, as in lecture); #3 $V(0, y) = V_0$ for $0 < y < a/2$, $0$ for $a/2 < y < a$ (live). So $V = \sum C_n e^{-n\pi x/a}\sin\tfrac{n\pi y}{a}$ with

              $$C_n = \frac{2}{a}\int_0^{a/2}V_0\sin\frac{n\pi y}{a}\,dy = \frac{2V_0}{n\pi}\left(1 - \cos\frac{n\pi}{2}\right).$$

              (a) $C_1 = \tfrac{2V_0}{\pi} = 0.637V_0$, $C_2 = \tfrac{2V_0}{2\pi}\cdot 2 = \tfrac{2V_0}{\pi} = 0.637V_0$, $C_3 = \tfrac{2V_0}{3\pi} = 0.212V_0$, $C_4 = \tfrac{2V_0}{4\pi}(1 - 1) = 0$.

              (b) The data is half the constant strip plus half the $\pm V_0$ strips: $\tfrac12(V_0) + \tfrac12(+V_0) = V_0$ below, $\tfrac12(V_0) + \tfrac12(-V_0) = 0$ above. So $C_n = \tfrac12\cdot\tfrac{4V_0}{n\pi}$ (odd $n$) $+ \tfrac12\cdot\tfrac{8V_0}{n\pi}$ ($n = 2, 6, \dots$). Superposition works on boundary data as well as on solutions.

              (c) On the midline only odd $n$ contribute: $V(a, a/2) = \tfrac{2V_0}{\pi}\left(e^{-\pi} - \tfrac13e^{-3\pi} + \dots\right) = 0.0275\,V_0$. That is exactly half the constant-strip value at the same point, as (b) predicts.
            `,
          }),

          P({
            title: 'A ramp on the end',
            q: md`The end of the slot is held at $V_0(y) = V_0\,y/a$ (a resistive strip with $0$ at the bottom and $V_0$ at the top, insulated from the top plate). Find $C_1$, $C_2$, $C_3$, and $V$ at $(a, a/2)$.`,
            figHtml: RAMP,
            hints: [
              md`Same slot, same series. You need $\tfrac{2}{a}\int_0^a V_0\tfrac{y}{a}\sin\tfrac{n\pi y}{a}dy$.`,
              md`Integrate by parts, or use $\int_0^a y\sin\tfrac{n\pi y}{a}dy = -\tfrac{a^2\cos n\pi}{n\pi}$.`,
              md`On the midline the even terms vanish.`,
            ],
            parts: [
              { lbl: md`$C_1/V_0$`, ans: 2 / PI, unit: '' },
              { lbl: md`$C_2/V_0$`, ans: -1 / PI, unit: '' },
              { lbl: md`$C_3/V_0$`, ans: 2 / (3 * PI), unit: '' },
              { lbl: md`$V(a, a/2)/V_0$`, ans: 0.027494, unit: '' },
            ],
            sol: md`
              **BCs:** #1, #2, #4 homogeneous as in lecture; #3 $V(0, y) = V_0y/a$ (live). So $V = \sum C_n e^{-n\pi x/a}\sin\tfrac{n\pi y}{a}$ with

              $$C_n = \frac{2V_0}{a^2}\int_0^a y\sin\frac{n\pi y}{a}\,dy = \frac{2V_0}{a^2}\left(-\frac{a^2\cos n\pi}{n\pi}\right) = (-1)^{n+1}\frac{2V_0}{n\pi}.$$

              $C_1 = \tfrac{2V_0}{\pi} = 0.637V_0$, $C_2 = -\tfrac{V_0}{\pi} = -0.318V_0$, $C_3 = \tfrac{2V_0}{3\pi} = 0.212V_0$.

              At $(a, a/2)$: even terms vanish, so $V = \tfrac{2V_0}{\pi}e^{-\pi} - \tfrac{2V_0}{3\pi}e^{-3\pi} + \dots = 0.0275V_0$. The same as the half-strip, because the ramp and the half-strip share the symmetric part $V_0/2$.

              **Check.** At $x = 0$, $y = a/2$: $\tfrac{2V_0}{\pi}\left(1 - \tfrac13 + \tfrac15 - \dots\right) + (\text{even terms} = 0) = \tfrac{2V_0}{\pi}\cdot\tfrac{\pi}{4} = \tfrac{V_0}{2}$. Correct: the ramp is $V_0/2$ at mid-height.
            `,
          }),

          P({
            title: 'A centered strip: compute C₁ and C₃',
            q: md`The end of the slot has three insulated strips: the middle one ($a/4 < y < 3a/4$) is at $V_0$, the outer two are grounded. Find $C_1$, $C_2$ and $C_3$, and estimate $V$ at $(a, a/2)$ with one term.`,
            figHtml: CSTRIP,
            hints: [
              md`$C_n = \tfrac{2}{a}\int_{a/4}^{3a/4}V_0\sin\tfrac{n\pi y}{a}dy$. The grounded strips contribute nothing.`,
              md`$\int_{a/4}^{3a/4}\sin\tfrac{n\pi y}{a}dy = \tfrac{a}{n\pi}\left[\cos\tfrac{n\pi}{4} - \cos\tfrac{3n\pi}{4}\right]$.`,
              md`The data is symmetric about $a/2$: what does that say about $C_2$?`,
            ],
            parts: [
              { lbl: md`$C_1/V_0$`, ans: 0.90032, unit: '' },
              { lbl: md`$C_2/V_0$`, ans: 0, unit: '' },
              { lbl: md`$C_3/V_0$`, ans: -0.30011, unit: '' },
              { lbl: md`one-term $V(a, a/2)/V_0$`, ans: 0.038906, unit: '' },
            ],
            sol: md`
              **BCs:** #1, #2, #4 as in lecture (homogeneous). #3: $V(0, y) = V_0$ for $a/4 < y < 3a/4$, $0$ otherwise (live).

              $$C_n = \frac{2V_0}{a}\cdot\frac{a}{n\pi}\left[\cos\frac{n\pi}{4} - \cos\frac{3n\pi}{4}\right] = \frac{2V_0}{n\pi}\left[\cos\frac{n\pi}{4} - \cos\frac{3n\pi}{4}\right].$$

              - $n = 1$: $\tfrac{2V_0}{\pi}\left[\tfrac{\sqrt2}{2} + \tfrac{\sqrt2}{2}\right] = \tfrac{2\sqrt2}{\pi}V_0 = 0.900V_0$.
              - $n = 2$: $\cos\tfrac{\pi}{2} - \cos\tfrac{3\pi}{2} = 0$. Expected: symmetric data, odd $n$ only.
              - $n = 3$: $\tfrac{2V_0}{3\pi}\left[-\tfrac{\sqrt2}{2} - \tfrac{\sqrt2}{2}\right] = -\tfrac{2\sqrt2}{3\pi}V_0 = -0.300V_0$.

              [[fig:b]]

              $C_3 < 0$: the third harmonic is negative in the middle third of the face, which is where the strip is, and positive near the plates, where the data is zero. A negative $C_3$ pushes the sum down near the plates and up in the middle.

              One term at $(a, a/2)$: $0.900V_0\,e^{-\pi} = 0.0389V_0$ (the $n = 3$ correction is $-0.300e^{-3\pi}\times(-1) \approx +2\times10^{-5}$).
            `,
            figs: { b: { svg: bars((n) => 2 / (n * PI) * (Math.cos(n * PI / 4) - Math.cos(3 * n * PI / 4))), cap: 'Coefficients $C_n/V_0$ of the centered strip.' } },
          }),

          P({
            title: 'A smooth bump on the end',
            q: md`The end of the slot is held at $V_0(y) = \dfrac{4V_0}{a^2}\,y(a - y)$, a parabola that is $0$ at both plates and $V_0$ in the middle. Find $C_1$ and $C_3/C_1$, and $V$ at $(a, a/2)$.`,
            figHtml: PARAB,
            hints: [
              md`Symmetric about $a/2$: odd $n$ only.`,
              md`Use $\int_0^a y(a - y)\sin\tfrac{n\pi y}{a}dy = \tfrac{2a^3}{(n\pi)^3}(1 - \cos n\pi)$.`,
              md`With coefficients falling like $1/n^3$, one term is excellent everywhere except right at the face.`,
            ],
            parts: [
              { lbl: md`$C_1/V_0$`, ans: 32 / PI ** 3, unit: '' },
              { lbl: md`$C_3/C_1$`, ans: 1 / 27, unit: '' },
              { lbl: md`$V(a, a/2)/V_0$`, ans: 0.044599, unit: '' },
            ],
            sol: md`
              **BCs:** #1, #2, #4 homogeneous as in lecture. #3: $V(0, y) = \tfrac{4V_0}{a^2}y(a - y)$ (live).

              $$C_n = \frac{2}{a}\cdot\frac{4V_0}{a^2}\cdot\frac{2a^3}{(n\pi)^3}(1 - \cos n\pi) = \frac{16V_0}{(n\pi)^3}(1 - \cos n\pi) = \frac{32V_0}{(n\pi)^3}\ \ (n \text{ odd}).$$

              $C_1 = \tfrac{32}{\pi^3}V_0 = 1.032V_0$, $C_3 = \tfrac{32}{27\pi^3}V_0$, so $C_3/C_1 = \tfrac{1}{27}$.

              $V(a, a/2) = 1.032V_0e^{-\pi} - 0.0382V_0e^{-3\pi} = 0.0446V_0$.

              **Why so fast:** the parabola vanishes at both plates (no jumps) and is smooth, so the coefficients fall like $1/n^3$. Even on the face, $C_1\sin(\pi y/a)$ alone differs from the parabola by at most $0.043V_0$ (about 4%), and one width away the error is below $10^{-5}V_0$.
            `,
          }),

          RF(md`
            !!key Patterns to remember
              - $C_n = \tfrac{2}{a}\int_0^a V_0(y)\sin\tfrac{n\pi y}{a}dy$; split at jumps; cover the whole width.
              - Know: $\int_0^c\sin = \tfrac{a}{n\pi}(1 - \cos\tfrac{n\pi c}{a})$, $\int_0^a y\sin = -\tfrac{a^2\cos n\pi}{n\pi}$, $\int_0^a y(a - y)\sin = \tfrac{2a^3}{(n\pi)^3}(1 - \cos n\pi)$.
              - Symmetric about $a/2$: odd $n$. Antisymmetric: even $n$. The midline sees only the symmetric part.
              - $\pm V_0$ strips: $\tfrac{8V_0}{n\pi}$, $n = 2, 6, 10$; it's two stacked half-width slots.
              - Boundary data add, so coefficients add (half-strip = half constant + half strips).
              - Jumps: $1/n$. Kinks: $1/n^2$. Smooth and zero at the ends: $1/n^3$.
          `),
        ],
      },
      // ============================================================ LESSON 5
      {
        id: 'u6-choose', title: 'Choosing the functions: exp, sinh, cosh, sin, cos, and k = 0',
        steps: [
          RF(md`
            ### The non-oscillating direction

            $X'' = k^2X$ has two independent solutions. Any pair spans them, and picking the right pair saves algebra:

            $$X(x) = Ae^{kx} + Be^{-kx} = A'\cosh kx + B'\sinh kx = A''\sinh k(b - x) + B''\sinh kx .$$

            | region or condition in $x$ | keep | why |
            |---|---|---|
            | $0 < x < \infty$, $V \to 0$ far away | $e^{-kx}$ | $e^{+kx}$ blows up |
            | $-\infty < x < 0$, $V \to 0$ far away | $e^{+kx}$ | $e^{-kx}$ blows up as $x \to -\infty$ |
            | $V = 0$ at $x = 0$ | $\sinh kx$ | $\sinh 0 = 0$, while $\cosh 0 = 1$ |
            | $V = 0$ at $x = b$ | $\sinh k(b - x)$ | vanishes at $x = b$ |
            | the same potential at $x = \pm b$ | $\cosh kx$ | even in $x$ |
            | opposite potentials at $x = \pm b$ | $\sinh kx$ | odd in $x$ |

            [[fig:xf]]

            Recall $\cosh u = \tfrac12(e^u + e^{-u})$ and $\sinh u = \tfrac12(e^u - e^{-u})$: $\cosh 0 = 1$, $\sinh 0 = 0$, and both grow like $\tfrac12e^u$ for large $u$.

            Using $Ae^{kx} + Be^{-kx}$ in a finite box is never *wrong*; you just solve for $A$ and $B$ by hand. Picking $\sinh$ or $\cosh$ builds the zero BC or the symmetry in from the start, so one constant is left per $n$.
          `, { xf: { svg: XFUNCS.svg, cap: 'The four $x$-functions you will use ($k = \\pi/a$, $b = a$).' } }),

          Q(md`Region $0 < x < b$. The face $x = 0$ is grounded and the face $x = b$ is live; $y = 0$ and $y = a$ are grounded. Which $x$-function goes with $\sin(n\pi y/a)$?`,
            [md`$e^{-n\pi x/a}$`, md`$\cosh(n\pi x/a)$`, md`$\sin(n\pi x/a)$`, md`$\sinh(n\pi x/a)$`], 3,
            [md`$e^{0} = 1$, so it doesn't vanish at the grounded face $x = 0$. (A combination $e^{kx} - e^{-kx}$ does: that's $2\sinh kx$.)`, md`$\cosh 0 = 1$: it can't meet $V = 0$ at $x = 0$.`, md`The $x$ direction has only one zero face; the sines belong to $y$, which has two.`, null],
            md`$\sinh(n\pi x/a)$ is zero at $x = 0$ and grows toward the live face. This is the geometry of HW Problem 3.17 (Lesson 6).`,
            { figHtml: G_HW }),

          Q(md`Region $x > 0$, extending to infinity, with $V \to 0$ far away. Which $x$-function do you keep?`,
            [md`$\sinh kx$`, md`$\cosh kx$`, md`$e^{+kx}$`, md`$e^{-kx}$`], 3,
            [md`$\sinh kx$ contains $\tfrac12e^{kx}$ and blows up.`, md`$\cosh kx$ blows up too.`, md`It grows without bound; BC #4 forces its coefficient to zero.`, null],
            md`For a semi-infinite region the condition at infinity kills $e^{+kx}$, which also rules out $\sinh$ and $\cosh$ (each contains $e^{+kx}$). Only $e^{-kx}$ survives.`,
            { figHtml: SLOT }),

          Q(md`Ex. 3.4: region $-b < x < b$, both faces $x = \pm b$ at $V_0$, plates at $y = 0, a$ grounded. Which $x$-function?`,
            [md`$\sinh kx$`, md`$e^{-kx}$`, md`$e^{-k|x|}$`, md`$\cosh kx$`], 3,
            [md`$\sinh$ is odd: it would give $-V_0$ at $x = -b$.`, md`It isn't symmetric, and nothing forces decay: the region is finite.`, md`It has a kink at $x = 0$, so it doesn't solve $X'' = k^2X$ there (its second derivative has a spike).`, null],
            md`The setup is symmetric under $x \to -x$, so $V(-x, y) = V(x, y)$. In $Ae^{kx} + Be^{-kx}$ that forces $A = B$: $\cosh kx$. Griffiths does exactly this.`,
            { figHtml: G_EX34 }),

          Q(md`Same box $-b < x < b$, but the face at $x = +b$ is at $+V_0$ and the face at $x = -b$ is at $-V_0$. Which $x$-function?`,
            [md`$\cosh kx$`, md`$\sinh kx$`, md`$e^{kx}$`, md`$\sinh k(b - x)$`], 1,
            [md`$\cosh$ is even; it would give the same sign on both faces.`, null, md`Not odd in $x$, so it can't give opposite values at $\pm b$ with one coefficient per $n$.`, md`That vanishes at $x = b$, where the potential is $+V_0$.`],
            md`Antisymmetric data, $V(-x, y) = -V(x, y)$, forces $A = -B$: $\sinh kx$. Then $V = 0$ on the whole plane $x = 0$, like a grounded sheet.`,
            { figHtml: G_ANTI }),

          Q(md`Region $0 < x < b$ with the **left** face $x = 0$ live and the right face $x = b$ grounded. Which $x$-function?`,
            [md`$\sinh kx$`, md`$\cosh k(b - x)$`, md`$e^{-kx}$`, md`$\sinh k(b - x)$`], 3,
            [md`That vanishes at the live face and not at the grounded one: backwards.`, md`$\cosh 0 = 1$: it doesn't vanish at $x = b$.`, md`It doesn't vanish at $x = b$ (and there's no infinity to decay toward).`, null],
            md`Measure from the grounded face: $\sinh k(b - x)$ is zero at $x = b$ and largest at $x = 0$. It solves $X'' = k^2X$ just as well as $\sinh kx$.`,
            { figHtml: G_LEFT }),

          Q(md`In Ex. 3.4, could you use $Ae^{kx} + Be^{-kx}$ instead of $\cosh kx$?`,
            [md`Yes. The symmetry $V(-x, y) = V(x, y)$ then forces $A = B$, which is $2A\cosh kx$.`, md`No. Exponentials only work in semi-infinite regions.`, md`Yes, but you must set $A = 0$ as in the slot.`, md`No. The result would not be symmetric.`], 0,
            [null, md`They are a perfectly good basis anywhere; $\cosh$ and $\sinh$ are just combinations of them.`, md`$A = 0$ was the slot's BC #4. Here the region is finite and $e^{kx}$ is harmless.`, md`With $A = B$ it is exactly symmetric.`],
            md`Griffiths does it this way: "the situation is symmetric with respect to $x$, so $V(-x, y) = V(x, y)$, and it follows that $A = B$." Same answer, one more line.`,
            { figHtml: G_EX34 }),

          Q(md`A slot open toward **negative** $x$ (region $x < 0$), live strip at $x = 0$, $V \to 0$ as $x \to -\infty$. Which $x$-function?`,
            [md`$e^{-kx}$`, md`$e^{+kx}$`, md`$\sinh kx$`, md`$\cosh kx$`], 1,
            [md`For $x \to -\infty$, $e^{-kx} = e^{k|x|}$ blows up.`, null, md`Contains $e^{-kx}$, which blows up as $x \to -\infty$.`, md`Blows up at both ends.`],
            md`Keep whichever exponential decays in the direction the region extends. Here $V = \tfrac{4V_0}{\pi}\sum_{\text{odd}}\tfrac1n e^{+n\pi x/a}\sin\tfrac{n\pi y}{a}$, the mirror image of the lecture's slot.`,
            { figHtml: SLOT_LEFT }),

          RF(md`
            ### The oscillating direction: sin or cos?

            Put the sines where the zeros are. With plates at $y = 0$ and $y = a$, $\sin(n\pi y/a)$ vanishes on both; $\cos$ doesn't vanish at $y = 0$, which is why BC #1 kills it. If you put the origin on the midline instead (plates at $y = \pm a/2$), the functions that vanish on both plates are $\cos(n\pi y/a)$ with odd $n$ and $\sin(n\pi y/a)$ with even $n$: the same functions, shifted. Put the origin at a corner and you never have to think about this.

            **Which constant is negative.** The direction with two zero BCs gets $-k^2$ and oscillates. The other direction gets $+k^2$ and grows or decays. In 3-D two directions oscillate and the third gets $+(k^2 + l^2)$ (Lesson 7).

            **The same $k$ in both factors.** $\sin(ky)\,e^{-kx}$, $\sin(ky)\sinh(kx)$ and $\sin(ky)\cosh(kx)$ solve Laplace's equation; $\sin(ky)\,e^{-2kx}$ does not, and neither does $\sinh(kx)\sinh(ky)$ (both factors curve the same way, so the curvatures add instead of cancelling).
          `),

          Q(md`Someone writes the slot answer as $\dfrac{4V_0}{\pi}\sum_{\text{odd}}\dfrac1n e^{-n\pi x/a}\cos\dfrac{n\pi y}{a}$. Which boundary condition fails?`,
            [md`BC #1: $\cos 0 = 1$, so $V(x, 0) \ne 0$.`, md`BC #4: the terms don't decay.`, md`Only BC #3.`, md`None; cosines work as well.`], 0,
            [null, md`$e^{-n\pi x/a}$ still decays.`, md`It fails at the plates before you even get to BC #3.`, md`At $y = 0$ every cosine is $1$; the plate would not be grounded.`],
            md`Using $\cos$ where $V$ must vanish is the most common slip in this topic. Before anything else, check: does every term vanish on every grounded face?`,
            { figHtml: SLOT_BC }),

          Q(md`A box has grounded faces at $x = 0$, $x = a$ and $y = 0$; the face $y = b$ is live. Which product solutions do you use?`,
            [md`$\sinh(n\pi x/a)\sin(n\pi y/b)$`, md`$\sin(n\pi x/a)\sinh(n\pi y/a)$`, md`$\sin(n\pi x/a)\,e^{-n\pi y/a}$`, md`$\cos(n\pi x/a)\sinh(n\pi y/a)$`], 1,
            [md`Backwards: $x$ has the two zero faces, so $x$ gets the sines.`, null, md`The region is finite in $y$, and $V$ must vanish at $y = 0$: $\sinh$, not a decaying exponential.`, md`$\cos$ doesn't vanish at $x = 0$.`],
            md`Two zero faces in $x$: $\sin(n\pi x/a)$, $k = n\pi/a$. Zero at $y = 0$: $\sinh(ky)$ with the **same** $k$, so $\sinh(n\pi y/a)$, not $\sinh(n\pi y/b)$. The live face at $y = b$ fixes the coefficients: $C_n\sinh(n\pi b/a) = \tfrac{2}{a}\int_0^a V_0(x)\sin\tfrac{n\pi x}{a}dx$.`,
            { figHtml: G_TOP }),

          Q(md`Which of these is **not** a solution of $\nabla^2V = 0$?`,
            [md`$e^{kx}\sin ky$`, md`$\cosh kx\,\sin ky$`, md`$\sin kx\,\sinh ky$`, md`$\sinh kx\,\sinh ky$`], 3,
            [md`$\partial_x^2 \to k^2$, $\partial_y^2 \to -k^2$: they cancel.`, md`$\cosh'' = k^2\cosh$, $\sin'' = -k^2\sin$: they cancel.`, md`Roles swapped, still $-k^2 + k^2 = 0$.`, null],
            md`$\nabla^2(\sinh kx\sinh ky) = 2k^2\sinh kx\sinh ky \ne 0$. The two separation constants must add to zero, so one factor must oscillate and the other grow or decay.`,
            { nofig: 'checking functions' }),

          Q(md`Which $x$-dependence pairs with $\sin(2\pi y/a)$ in a solution of Laplace's equation for a slot running to $x = +\infty$?`,
            [md`$e^{-\pi x/a}$`, md`$e^{-2\pi x/a}$`, md`$e^{-4\pi^2x/a^2}$`, md`$\sinh(2\pi x/a)$`], 1,
            [md`The decay constant must equal the $k$ in the sine: $2\pi/a$, not $\pi/a$.`, null, md`The exponent should be linear in $k$, not $k^2$: $X'' = k^2X$ gives $e^{-kx}$.`, md`Right $k$, but $\sinh$ blows up as $x \to \infty$.`],
            md`$\sin(ky)$ forces $Y''/Y = -k^2$, so $X''/X = +k^2$ with the same $k = 2\pi/a$: $X = e^{-2\pi x/a}$ in a semi-infinite region.`,
            { figHtml: SLOT }),

          Q(md`The plates of a slot are at $y = -a/2$ and $y = +a/2$ (origin on the midline), and the end strip is at a constant $V_0$. Which $y$-functions appear?`,
            [md`$\sin(n\pi y/a)$ with odd $n$`, md`$\cos(n\pi y/a)$ with odd $n$`, md`$\cos(n\pi y/a)$, all $n$`, md`$\sin(2n\pi y/a)$`], 1,
            [md`$\sin(\pi y/a)$ at $y = a/2$ is $1$, not $0$: it doesn't vanish on the plates in these coordinates.`, null, md`$\cos(2\pi y/a)$ at $y = \pm a/2$ is $-1$: even $n$ cosines don't vanish on the plates.`, md`These vanish on the plates but are odd in $y$; a constant (even) strip has no overlap with them.`],
            md`$\cos(n\pi y/a) = 0$ at $y = \pm a/2$ exactly for odd $n$. These are the lecture's $\sin(n\pi y'/a)$, $n$ odd, written in the shifted coordinate $y = y' - a/2$. Same physics; corner origins are easier.`,
            { figHtml: SLOT_MID }),

          Q(md`In Ex. 3.4 the $n$-th term is $C_n\cosh(n\pi x/a)\sin(n\pi y/a)$ with $C_n\cosh(n\pi b/a)$ fixed by the faces. At the center $x = 0$, relative to its size on the faces, the $n$-th term is:`,
            [md`Unchanged, since $\cosh 0 = 1$.`, md`Reduced by $e^{-n\pi}$.`, md`Reduced by $1/\sinh(n\pi b/a)$.`, md`Reduced by $1/\cosh(n\pi b/a)$, tiny for large $n$.`], 3,
            [md`$\cosh 0 = 1$, but the face value carries $\cosh(n\pi b/a)$, which is large.`, md`Only if $b = a$, and even then it's $1/\cosh(n\pi)$, about $2e^{-n\pi}$.`, md`$\sinh$ belongs to problems with a grounded face at $x = 0$.`, null],
            md`Each term is $\tfrac{4V_0}{n\pi}\tfrac{\cosh(n\pi x/a)}{\cosh(n\pi b/a)}\sin\tfrac{n\pi y}{a}$ (odd $n$). The ratio $\cosh(n\pi x/a)/\cosh(n\pi b/a)$ is $1$ on the faces and $1/\cosh(n\pi b/a)$ at the center. High harmonics don't penetrate: the middle of a long box sees only $n = 1$.`,
            { figHtml: G_EX34 }),

          RF(md`
            ### When $k = 0$ is needed

            $k = 0$ gives $X'' = 0$ and $Y'' = 0$: $X = A + Bx$, $Y = C + Dy$, so

            $$V_{k=0} = (A + Bx)(C + Dy),$$

            any combination of $1$, $x$, $y$ and $xy$. In the lecture's slot they were useless: no straight line vanishes on both plates. They are needed when the pair of faces that should carry the sines is **not both zero**, for example a slot whose two plates are at different potentials. Every sine vanishes on both plates, so no sum of sines can produce a non-zero plate.

            !!method Making the boundary conditions homogeneous
              If the plates at $y = 0$ and $y = a$ are at $0$ and $V_1$, write $V = V_1\dfrac{y}{a} + W$. The linear piece is a $k = 0$ solution that carries both plates (and the far field). $W$ then has zero BCs on both plates, and you solve for it with the usual series.

            ### Worked example: plates at different potentials

            The bottom plate ($y = 0$) is grounded, the top plate ($y = a$) is held at $V_1$, and the end strip at $x = 0$ is grounded and insulated from the top plate. Find $V$ for $x > 0$.

            [[fig:k0]]

            **Boundary conditions** (region $x > 0$, $0 < y < a$):

            1. $V(x, 0) = 0$ (homogeneous)
            2. $V(x, a) = V_1$ (**not** homogeneous)
            3. $V(0, y) = 0$ (homogeneous)
            4. $V \to V_1\,y/a$ as $x \to \infty$: far from the end the plates are an infinite capacitor (not zero)

            No direction has two zero BCs, so the plain recipe fails. Split $V = V_1\dfrac{y}{a} + W$. The linear piece satisfies Laplace's equation and BCs #1, #2 and #4 by itself. Then $W$ must satisfy

            1. $W(x, 0) = 0$; 2. $W(x, a) = V_1 - V_1 = 0$; 3. $W(0, y) = -V_1\,y/a$; 4. $W \to 0$.

            That is the lecture's slot with the ramp $-V_1y/a$ on its end (Lesson 4): $C_n = -(-1)^{n+1}\dfrac{2V_1}{n\pi} = (-1)^n\dfrac{2V_1}{n\pi}$. So

            $$V(x,y) = V_1\frac{y}{a} + \frac{2V_1}{\pi}\sum_{n=1}^{\infty}\frac{(-1)^n}{n}\,e^{-n\pi x/a}\sin\!\left(\frac{n\pi y}{a}\right).$$

            [[fig:k0map]]

            **Checks.** $y = 0$: $0$. $y = a$: $V_1 + 0$. $x = 0$: the series is the sine series of $-V_1y/a$ and cancels the linear piece. $x \to \infty$: $V_1y/a$. At $(a/2, a/2)$: $V = \tfrac{V_1}{2} - \tfrac{2V_1}{\pi}\left(e^{-\pi/2} - \tfrac13e^{-3\pi/2} + \dots\right) = 0.370\,V_1$, below the far-field value $V_1/2$ because the grounded end pulls it down.
          `, { k0: { svg: K0, cap: 'The slot with its plates at different potentials, closed by a grounded strip.' }, k0map: { svg: K0_MAP, cap: 'Equipotentials $0.1V_1, \\dots, 0.9V_1$: parallel to the plates far away (the $k = 0$ piece), bent down near the grounded end.' } }),

          Q(md`Why can't a sum of $e^{-n\pi x/a}\sin(n\pi y/a)$ terms alone describe a slot whose top plate is at $V_1 \ne 0$?`,
            [md`It can, with enough terms.`, md`Because $V_1$ is a constant.`, md`Every term vanishes at $y = a$, so any sum is $0$ there, not $V_1$.`, md`Because the series would diverge.`], 2,
            [md`No number of terms helps: each one is exactly zero on the top plate.`, md`Being constant isn't the problem; being non-zero on a face where every sine vanishes is.`, null, md`Convergence isn't the issue; the BC is.`],
            md`The sines were chosen to vanish on both plates. When a plate isn't at zero, first subtract a simple solution (here $V_1y/a$) that takes the plate's value, so that what remains has zero plates.`,
            { figHtml: K0 }),

          Q(md`In the slot with its bottom plate grounded and top plate at $V_1$ (end strip grounded), what is $V$ far down the slot?`,
            [md`$0$`, md`$V_1/2$ everywhere`, md`$V_1\,y/a$`, md`$V_1$`], 2,
            [md`The plates are at different potentials, so the field between them doesn't die out.`, md`That's only the midline value.`, null, md`That's only the top plate.`],
            md`Far from the end, nothing depends on $x$, so $\partial^2V/\partial y^2 = 0$: a straight line from $0$ to $V_1$. This is the $k = 0$ term, and it's why BC #4 is $V \to V_1y/a$, not $V \to 0$.`,
            { figHtml: K0 }),

          Q(md`Which functions are the $k = 0$ separable solutions of the 2-D Laplace equation?`,
            [md`Constants only.`, md`$x^2 - y^2$`, md`$e^xe^y$`, md`$(A + Bx)(C + Dy)$`], 3,
            [md`$X'' = 0$ allows $A + Bx$, not just $A$.`, md`It does solve Laplace's equation, but it is not a $k = 0$ product: $x^2$ doesn't satisfy $X'' = 0$.`, md`$\nabla^2(e^{x+y}) = 2e^{x+y} \ne 0$.`, null],
            md`$X'' = 0 \Rightarrow X = A + Bx$; $Y'' = 0 \Rightarrow Y = C + Dy$. Combinations of $1$, $x$, $y$, $xy$. They carry uniform fields and plates at different potentials.`,
            { nofig: 'about functions' }),

          Q(md`A box has two **adjacent** live faces ($x = 0$ at $V_1$, $y = 0$ at $V_2$) and two grounded ones. How do you solve it?`,
            [md`Use sines in both $x$ and $y$.`, md`Use only $k = 0$ terms.`, md`It can't be done by separation of variables.`, md`Superpose two problems, each with one live face and the other three grounded.`], 3,
            [md`Sines in $x$ need zeros at $x = 0$ and $x = b$, but $x = 0$ is live.`, md`A linear function can't match arbitrary data on two faces.`, md`It can: split it into two problems.`, null],
            md`Neither direction has two zero faces, so no single expansion works. Solve "only $x = 0$ live" (sines in $y$) and "only $y = 0$ live" (sines in $x$), then add. On each face exactly one subproblem is live and the other contributes zero, so every BC comes out right (Lesson 6).`,
            { figHtml: G_ADJ }),

          Q(md`In the slot, a student keeps $A\,e^{+kx}$ "to be general". Which boundary condition does that violate?`,
            [md`BC #1`, md`BC #2`, md`BC #3`, md`BC #4`], 3,
            [md`BC #1 is about the cosine at $y = 0$.`, md`BC #2 quantizes $k$; the exponential doesn't affect it.`, md`BC #3 could even be met; the problem is far away.`, null],
            md`$e^{+kx}$ grows without bound, so $V \to 0$ at infinity requires $A = 0$. Keeping growing exponentials in a semi-infinite region is a standard exam error.`,
            { figHtml: SLOT_BC }),

          P({
            title: 'Top plate and end at the same potential',
            q: md`The top plate of a slot and its end strip are connected and held at $V_1$. The bottom plate ($y = 0$) is grounded and insulated from both. Find $V(x, y)$ for $x > 0$ and the value at P $= (a/2, a/2)$.`,
            figHtml: K0B,
            hints: [
              md`List the BCs. Which ones are zero? The top plate is not, so a $k = 0$ piece is needed.`,
              md`Write $V = V_1y/a + W$. Find the BCs for $W$; the end becomes $W(0, y) = V_1 - V_1y/a$.`,
              md`$\tfrac{2}{a}\int_0^a\left(1 - \tfrac{y}{a}\right)\sin\tfrac{n\pi y}{a}dy = \tfrac{2}{n\pi}$ for every $n$.`,
              md`Check: $U = V_1 - V$ has the bottom plate at $V_1$ and the top plate and end at $0$: the worked example upside down.`,
            ],
            parts: [
              { lbl: md`$V(\text{P})/V_1$`, ans: 0.63048, unit: '' },
              { lbl: md`The coefficients of $W$ are:`, mc: [md`$\dfrac{2V_1}{n\pi}$ for every $n$`, md`$\dfrac{4V_1}{n\pi}$, odd $n$`, md`$(-1)^n\dfrac{2V_1}{n\pi}$`, md`$\dfrac{2V_1}{n\pi}$, even $n$ only`], a: 0, why: [null, md`That's for a constant $V_1$ on the end; here $W(0, y) = V_1(1 - y/a)$, not $V_1$.`, md`That's the worked example, whose $W(0, y) = -V_1y/a$.`, md`$1 - y/a$ is neither symmetric nor antisymmetric about $a/2$, so both odd and even $n$ appear.`] },
              { lbl: md`Far down the slot, $V \to$`, mc: [md`$0$`, md`$V_1$`, md`$V_1y/a$`, md`$V_1(1 - y/a)$`], a: 2, why: [md`The plates are at different potentials.`, md`The bottom plate is at $0$.`, null, md`Upside down: $V$ must be $0$ on the bottom plate.`] },
            ],
            sol: md`
              **Boundary conditions** (region $x > 0$, $0 < y < a$):

              1. $V(x, 0) = 0$ (homogeneous)
              2. $V(x, a) = V_1$ (not homogeneous)
              3. $V(0, y) = V_1$ (live)
              4. $V \to V_1y/a$ as $x \to \infty$

              **Make the plates homogeneous:** $V = V_1\tfrac{y}{a} + W$, with $W(x, 0) = W(x, a) = 0$, $W \to 0$, and $W(0, y) = V_1 - V_1\tfrac{y}{a}$. So $W = \sum C_n e^{-n\pi x/a}\sin\tfrac{n\pi y}{a}$ with

              $$C_n = \frac{2V_1}{a}\int_0^a\left(1 - \frac{y}{a}\right)\sin\frac{n\pi y}{a}\,dy = \frac{2V_1}{a}\left[\frac{a}{n\pi}(1 - \cos n\pi) + \frac{a\cos n\pi}{n\pi}\right] = \frac{2V_1}{n\pi}.$$

              $$V(x,y) = V_1\frac{y}{a} + \frac{2V_1}{\pi}\sum_{n=1}^{\infty}\frac{1}{n}\,e^{-n\pi x/a}\sin\frac{n\pi y}{a}.$$

              At P only odd $n$ contribute ($\sin\tfrac{n\pi}{2} = 0$ for even $n$): $V = \tfrac{V_1}{2} + \tfrac{2V_1}{\pi}\left(e^{-\pi/2} - \tfrac13e^{-3\pi/2} + \tfrac15e^{-5\pi/2}\right) = (0.5 + 0.1305)V_1 = 0.630\,V_1$.

              **Cross-check without a series.** $U = V_1 - V$ is $V_1$ on the bottom plate and $0$ on the top plate and the end: the worked example flipped upside down ($y \to a - y$). On the midline the flip does nothing, so $U(\text{P}) = 0.370V_1$ and $V(\text{P}) = V_1 - 0.370V_1 = 0.630V_1$.

              **What to remember:** if a pair of opposite faces isn't both zero, peel off a $k = 0$ (linear) solution first.
            `,
          }),

          P({
            title: 'A slot that opens to the left',
            q: md`The region is $x < 0$, $0 < y < a$: grounded plates at $y = 0$ and $y = a$ run off to $x \to -\infty$, and the end strip at $x = 0$ is held at a constant $V_0$. Find $V$ and its value at $(-a, a/2)$.`,
            figHtml: SLOT_LEFT,
            hints: [
              md`List the BCs. Which exponential survives as $x \to -\infty$?`,
              md`Everything else is the lecture's slot.`,
            ],
            parts: [
              { lbl: md`Which $x$-dependence?`, mc: [md`$e^{-n\pi x/a}$`, md`$e^{+n\pi x/a}$`, md`$\sinh(n\pi x/a)$`, md`$\cosh(n\pi x/a)$`], a: 1, why: [md`For negative $x$ this grows as $x \to -\infty$.`, null, md`Contains the growing exponential.`, md`Blows up as $x \to -\infty$.`] },
              { lbl: md`$V(-a, a/2)/V_0$`, ans: 0.054987, unit: '' },
            ],
            sol: md`
              **Boundary conditions** (region $x < 0$): #1 $V(x, 0) = 0$; #2 $V(x, a) = 0$; #3 $V(0, y) = V_0$ (live); #4 $V \to 0$ as $x \to -\infty$.

              #4 now kills $e^{-kx}$ (which blows up for $x \to -\infty$), so $X = e^{+kx}$. #1, #2 as before. #3 by Fourier's trick, exactly as in lecture:

              $$V(x,y) = \frac{4V_0}{\pi}\sum_{n\ \text{odd}}\frac1n\,e^{n\pi x/a}\sin\frac{n\pi y}{a}\qquad(x < 0).$$

              It's the mirror image of the lecture's slot: $V(x, y) = V_{\text{slot}}(-x, y)$. At $(-a, a/2)$: $\tfrac{4V_0}{\pi}\left(e^{-\pi} - \tfrac13e^{-3\pi} + \dots\right) = 0.0550V_0$.
            `,
          }),

          P({
            title: 'Pick the product solutions',
            q: md`For each cross-section, pick the product solution that satisfies all the zero boundary conditions. Only the labelled faces are live; faces labelled $0$ are grounded.

            [[fig:four]]`,
            figs: { four: { svg: PF.row([{ svg: G_HW, cap: '(A)' }, { svg: G_LEFT, cap: '(B)' }, { svg: G_TOP, cap: '(C)' }, { svg: G_EX34, cap: '(D)' }]).svg } },
            hints: [
              md`In each, find the direction with two grounded faces: it gets the sines.`,
              md`In the other direction: zero at $x = 0$ gives $\sinh kx$; zero at $x = b$ gives $\sinh k(b - x)$; equal live faces at $\pm b$ give $\cosh kx$.`,
            ],
            parts: [
              { lbl: md`(A)`, mc: [md`$\sinh\tfrac{n\pi x}{a}\sin\tfrac{n\pi y}{a}$`, md`$\cosh\tfrac{n\pi x}{a}\sin\tfrac{n\pi y}{a}$`, md`$\sin\tfrac{n\pi x}{b}\sinh\tfrac{n\pi y}{b}$`, md`$e^{-n\pi x/a}\sin\tfrac{n\pi y}{a}$`], a: 0, why: [null, md`$\cosh$ is $1$ at the grounded face $x = 0$.`, md`The sines belong to $y$: that's where the two grounded faces are.`, md`Not zero at $x = 0$, and the box is finite.`] },
              { lbl: md`(B)`, mc: [md`$\sinh\tfrac{n\pi x}{a}\sin\tfrac{n\pi y}{a}$`, md`$\sinh\tfrac{n\pi(b-x)}{a}\sin\tfrac{n\pi y}{a}$`, md`$\cosh\tfrac{n\pi(b-x)}{a}\sin\tfrac{n\pi y}{a}$`, md`$\sin\tfrac{n\pi x}{b}\sinh\tfrac{n\pi y}{a}$`], a: 1, why: [md`That's zero at the live face and not at the grounded face $x = b$.`, null, md`$\cosh 0 = 1$: not zero at $x = b$.`, md`$x$ has a live face, so it can't carry the sines.`] },
              { lbl: md`(C)`, mc: [md`$\sinh\tfrac{n\pi x}{a}\sin\tfrac{n\pi y}{b}$`, md`$\sin\tfrac{n\pi x}{a}\cosh\tfrac{n\pi y}{a}$`, md`$\sin\tfrac{n\pi x}{a}\sinh\tfrac{n\pi y}{b}$`, md`$\sin\tfrac{n\pi x}{a}\sinh\tfrac{n\pi y}{a}$`], a: 3, why: [md`$y$ has the live face; $x$ has the two grounded faces.`, md`$\cosh$ is $1$ at the grounded face $y = 0$.`, md`The $k$ in $\sinh$ must equal the $k$ in the sine, $n\pi/a$.`, null] },
              { lbl: md`(D)`, mc: [md`$\sinh\tfrac{n\pi x}{a}\sin\tfrac{n\pi y}{a}$`, md`$e^{-n\pi|x|/a}\sin\tfrac{n\pi y}{a}$`, md`$\cosh\tfrac{n\pi x}{a}\sin\tfrac{n\pi y}{a}$`, md`$\cosh\tfrac{n\pi x}{b}\sin\tfrac{n\pi y}{a}$`], a: 2, why: [md`Odd in $x$: it would put $-V_0$ on the left face.`, md`Not a solution at $x = 0$ (kink).`, null, md`The $k$ must match the sine's: $n\pi/a$.`] },
            ],
            sol: md`
              The rule each time: find the direction with **two** grounded faces; it gets $\sin(n\pi\,\cdot/\text{width})$. The other direction gets the hyperbolic function **with the same $k$** that satisfies its remaining zero BC (or symmetry).

              - (A) Zero faces $y = 0, a$ and $x = 0$: $\sinh(n\pi x/a)\sin(n\pi y/a)$; live face $x = b$ fixes $C_n$. (HW Prob. 3.17.)
              - (B) Zero faces $y = 0, a$ and $x = b$: $\sinh(n\pi(b - x)/a)\sin(n\pi y/a)$; live face $x = 0$.
              - (C) Zero faces $x = 0, a$ and $y = 0$: $\sin(n\pi x/a)\sinh(n\pi y/a)$; live face $y = b$.
              - (D) Zero faces $y = 0, a$; equal live faces at $x = \pm b$: $\cosh(n\pi x/a)\sin(n\pi y/a)$. (Ex. 3.4.)
            `,
          }),

          RF(md`
            !!key Patterns to remember
              - Two zero faces in a direction: sines there, $k = n\pi/\text{width}$.
              - The other direction, same $k$: $e^{-kx}$ (runs to $+\infty$), $e^{+kx}$ (runs to $-\infty$), $\sinh kx$ (zero at $x = 0$), $\sinh k(b - x)$ (zero at $x = b$), $\cosh kx$ (equal faces at $\pm b$), $\sinh kx$ (opposite faces at $\pm b$).
              - $\cos$ where $V$ must vanish, $e^{+kx}$ in a semi-infinite region, or mismatched $k$'s: the classic errors.
              - Plates at different potentials: peel off the $k = 0$ piece $V_1y/a$ first; the rest has zero plates.
              - Two adjacent live faces: split into one-live-face problems and add.
          `),
        ],
      },
      // ============================================================ LESSON 6
      {
        id: 'u6-boxes', title: 'Closed pipes: cosh, sinh, and adding faces',
        steps: [
          RF(md`
            ### Griffiths Ex. 3.4: a pipe with two live sides

            Two grounded plates at $y = 0$ and $y = a$ are joined at $x = \pm b$ by strips held at $V_0$ (insulated at the corners). The pipe runs along $z$, so again $V = V(x, y)$.

            [[fig:setup]]

            **Boundary conditions** (region $-b < x < b$, $0 < y < a$):

            1. $V(x, 0) = 0$ (homogeneous) $\Rightarrow D = 0$
            2. $V(x, a) = 0$ (homogeneous) $\Rightarrow k = n\pi/a$
            3. $V(b, y) = V_0$ (live)
            4. $V(-b, y) = V_0$ (live)

            $y$ has the two zero faces, so $Y = \sin(n\pi y/a)$ as before. In $x$ the region is **finite**, so nothing kills $e^{kx}$. Instead use symmetry: the setup is unchanged under $x \to -x$, so $V(-x, y) = V(x, y)$, which forces $A = B$ in $Ae^{kx} + Be^{-kx}$: $X = \cosh kx$. Then

            $$V(x,y) = \sum_n C_n\cosh\!\left(\frac{n\pi x}{a}\right)\sin\!\left(\frac{n\pi y}{a}\right).$$

            BC #3: $\sum C_n\cosh(n\pi b/a)\sin(n\pi y/a) = V_0$. That is the constant-strip Fourier problem with $C_n\cosh(n\pi b/a)$ in place of $C_n$: $C_n\cosh(n\pi b/a) = \tfrac{4V_0}{n\pi}$ for odd $n$. BC #4 then holds automatically because $\cosh$ is even.

            !!key Griffiths Eq. 3.42
              $$V(x,y) = \frac{4V_0}{\pi}\sum_{n\ \text{odd}}\frac{1}{n}\,\frac{\cosh(n\pi x/a)}{\cosh(n\pi b/a)}\,\sin\!\left(\frac{n\pi y}{a}\right)$$

            [[fig:map]]

            Each term is the boundary term times $\cosh(n\pi x/a)/\cosh(n\pi b/a)$: exactly $1$ on the live faces and smallest at the center. Two live faces in one problem are fine here because they are *opposite* each other; the $y$ direction still has its two zero faces.
          `, { setup: { svg: G_EX34, cap: 'Griffiths Fig. 3.20 seen down the pipe ($z$ out of the page).' }, map: { svg: EX34_MAP, cap: 'Equipotentials $0.1V_0, \\dots, 0.9V_0$ for $b = a$. The center sits at only $0.11V_0$.' } }),

          Q(md`In Ex. 3.4, why can't you set $A = 0$ (drop $e^{kx}$) as in the slot?`,
            [md`The region is finite in $x$; there is no condition at infinity, and $e^{kx}$ stays bounded for $|x| < b$.`, md`Because the faces at $\pm b$ are live.`, md`Because $\cosh$ is required by Laplace's equation.`, md`You can; the answer is the same.`], 0,
            [null, md`Live faces fix coefficients; they don't remove functions. The reason is that nothing blows up in a finite region.`, md`Laplace's equation allows $e^{kx}$, $e^{-kx}$ or any combination. $\cosh$ comes from the symmetry.`, md`Then $V(-b, y)$ would be tiny for large $n$ and BC #4 would fail.`],
            md`$A = 0$ in the slot came from BC #4, "$V \to 0$ as $x \to \infty$". In a closed pipe that condition doesn't exist, so both exponentials stay and the symmetry decides the combination.`,
            { figHtml: G_EX34 }),

          Q(md`Along the midline $y = a/2$ of Ex. 3.4, where is $V$ smallest?`,
            [md`At the faces $x = \pm b$.`, md`At the center $x = 0$.`, md`At $x = \pm b/2$.`, md`It is constant along the midline.`], 1,
            [md`The faces are at $V_0$, the largest value anywhere.`, null, md`$\cosh(n\pi x/a)$ has its minimum at $x = 0$, not at $\pm b/2$.`, md`$\cosh$ varies with $x$.`],
            md`$V$ is fed from both ends and sags in the middle: every term has $\cosh(n\pi x/a)$, minimum at $x = 0$. For $b = a$ the center value is $\tfrac{4V_0}{\pi}\sum_{\text{odd}}\tfrac{(-1)^{(n-1)/2}}{n\cosh(n\pi)} = 0.110V_0$.`,
            { figHtml: EX34_MAP }),

          Q(md`Ex. 3.4 with $b = a/2$, so the cross-section is a square. What is $V$ at its center?`,
            [md`$V_0/4$`, md`$V_0/2$`, md`$V_0/\sqrt2$`, md`$\dfrac{4V_0}{\pi}$`], 1,
            [md`That's a square with *one* live side. Here two sides are live.`, null, md`No square roots arise; it's a superposition argument.`, md`That exceeds $V_0$, impossible inside (no maxima in a charge-free region).`],
            md`Rotate the problem by $90°$: now the plates are live and the strips grounded. Add the two: all four sides at $V_0$, so $V = V_0$ everywhere. The center is the same point in both, so each gives $V_0/2$. The series agrees: $\tfrac{4V_0}{\pi}\sum_{\text{odd}}\tfrac{(-1)^{(n-1)/2}}{n\cosh(n\pi/2)} = 0.500V_0$.`,
            { figHtml: box({ center: true, L: 'V_0', R: 'V_0', T: '0', B: '0', w: 110, h: 110 }) }),

          Q(md`Make Ex. 3.4 very long ($b \gg a$). Near the face $x = b$, the potential looks like:`,
            [md`The lecture's slot, measured inward from the face: $\cosh(n\pi x/a)/\cosh(n\pi b/a) \approx e^{-n\pi(b - x)/a}$.`, md`A constant $V_0$ everywhere.`, md`A linear function of $x$.`, md`Half the slot solution, because two faces share the potential.`], 0,
            [null, md`It still vanishes on the plates.`, md`Linear pieces would need plates at different potentials.`, md`Far from the other face, that face has no influence: you get the full slot, not half.`],
            md`For $b \gg a$, $\cosh(n\pi x/a)/\cosh(n\pi b/a) \to e^{n\pi(x - b)/a}$ near $x = b$: the slot with the strip at $x = b$. Limits like this are a quick way to check a closed-box answer.`,
            { figHtml: G_EX34 }),

          P({
            id: 'HW5-3.17', src: 'HW 5 · Griffiths 3.17', title: 'A rectangular pipe with three grounded sides', big: true,
            q: md`A rectangular pipe, running parallel to the $z$-axis (from $-\infty$ to $+\infty$), has three grounded metal sides, at $y = 0$, $y = a$, and $x = 0$. The fourth side, at $x = b$, is maintained at a specified potential $V_0(y)$.

            (a) Develop a general formula for the potential inside the pipe.

            (b) Find the potential explicitly, for the case $V_0(y) = V_0$ (a constant).`,
            figHtml: G_HW,
            hints: [
              md`Laplace in 2-D (nothing depends on $z$). Write the four BCs and mark which are zero. Which direction has two zero faces?`,
              md`$y$ has the zero faces at $y = 0$ and $y = a$: $Y = \sin(n\pi y/a)$, $k = n\pi/a$. In $x$ the region is finite ($0 < x < b$) and $V = 0$ at $x = 0$. Which combination of $e^{\pm kx}$ vanishes at $x = 0$?`,
              md`$X = \sinh(n\pi x/a)$. Superpose, then impose $V(b, y) = V_0(y)$ with Fourier's trick. The unknown is $C_n\sinh(n\pi b/a)$.`,
              md`For (b) you already know the Fourier coefficients of a constant: $\tfrac{4V_0}{n\pi}$ for odd $n$.`,
            ],
            parts: [
              { lbl: md`Which $x$-dependence goes with $\sin(n\pi y/a)$?`, mc: [md`$e^{-n\pi x/a}$`, md`$\cosh(n\pi x/a)$`, md`$\sinh(n\pi x/a)$`, md`$\sin(n\pi x/b)$`], a: 2, why: [md`$e^{0} = 1$: not zero at the grounded side $x = 0$; and the pipe is finite in $x$.`, md`$\cosh 0 = 1$: not zero at $x = 0$.`, null, md`$x$ has only one grounded side, so it can't carry sines; and the $k$ must match the $y$-sines.`] },
              { lbl: md`(a) The coefficients in $V = \sum C_n\sinh\frac{n\pi x}{a}\sin\frac{n\pi y}{a}$ are`, mc: [md`$C_n = \dfrac{2}{a}\displaystyle\int_0^a V_0(y)\sin\frac{n\pi y}{a}\,dy$`, md`$C_n = \dfrac{2}{a\sinh(n\pi b/a)}\displaystyle\int_0^a V_0(y)\sin\frac{n\pi y}{a}\,dy$`, md`$C_n = \dfrac{2}{b\sinh(n\pi b/a)}\displaystyle\int_0^b V_0(y)\sin\frac{n\pi y}{a}\,dy$`, md`$C_n = \dfrac{2}{a\cosh(n\pi b/a)}\displaystyle\int_0^a V_0(y)\sin\frac{n\pi y}{a}\,dy$`], a: 1, why: [md`At $x = b$ each term carries $\sinh(n\pi b/a)$, which must be divided out.`, null, md`The live side spans $0 < y < a$; the orthogonality interval is $[0, a]$ with value $a/2$.`, md`The $x$-function is $\sinh$, so it's $\sinh(n\pi b/a)$ that appears at $x = b$.`] },
              { lbl: md`(b) $C_1$ for constant $V_0$`, expr: '4*V0/(pi*sinh(pi*b/a))', vars: { V0: [1, 3], b: [0.5, 2], a: [0.5, 2] }, accepts: ['4*V0/pi/sinh(pi*b/a)'] },
              { lbl: md`(b) For $b = a$, $V$ at the center $(a/2, a/2)$ in units of $V_0$`, ans: 0.25, unit: '' },
              { lbl: md`For $b \gg a$, near the live side the potential looks like`, mc: [md`a constant $V_0$`, md`the lecture's slot, with $e^{-n\pi(b - x)/a}$`, md`a linear function $V_0x/b$`, md`Ex. 3.4's $\cosh$ solution`], a: 1, why: [md`It still vanishes on the plates $y = 0, a$.`, null, md`That would need the plates to vary in potential along $x$.`, md`There is only one live side; nothing is symmetric in $x$.`] },
            ],
            sol: md`
              **Setup.** Infinite along $z$, nothing depends on $z$: $\dfrac{\partial^2V}{\partial x^2} + \dfrac{\partial^2V}{\partial y^2} = 0$ inside, no charge.

              **Boundary conditions** (region $0 < x < b$, $0 < y < a$):

              1. $V(x, 0) = 0$ (homogeneous) $\Rightarrow D = 0$
              2. $V(x, a) = 0$ (homogeneous) $\Rightarrow k = n\pi/a$
              3. $V(0, y) = 0$ (homogeneous) $\Rightarrow X \propto \sinh kx$
              4. $V(b, y) = V_0(y)$ (live) $\Rightarrow C_n$ by Fourier's trick

              There is no condition at infinity: the region is finite in $x$.

              **Separate.** $y$ has two zero faces, so $Y'' = -k^2Y$: $Y = C\sin ky + D\cos ky$. BC #1: $D = 0$. BC #2: $\sin ka = 0$, $k = n\pi/a$. In $x$: $X = Ae^{kx} + Be^{-kx}$. BC #3: $X(0) = A + B = 0$, so $X = A(e^{kx} - e^{-kx}) = 2A\sinh kx$.

              **(a)** Superpose:

              $$V(x,y) = \sum_{n=1}^{\infty} C_n\sinh\!\left(\frac{n\pi x}{a}\right)\sin\!\left(\frac{n\pi y}{a}\right).$$

              BC #4: $\sum_n\left[C_n\sinh\tfrac{n\pi b}{a}\right]\sin\tfrac{n\pi y}{a} = V_0(y)$. Fourier's trick gives the bracket:

              $$C_n\sinh\!\left(\frac{n\pi b}{a}\right) = \frac{2}{a}\int_0^a V_0(y)\sin\!\left(\frac{n\pi y}{a}\right)dy .$$

              **(b)** For constant $V_0$ the integral is the lecture's: $C_n\sinh(n\pi b/a) = \tfrac{4V_0}{n\pi}$ for odd $n$, $0$ for even $n$:

              $$V(x,y) = \frac{4V_0}{\pi}\sum_{n = 1,3,5,\dots}\frac{1}{n}\,\frac{\sinh(n\pi x/a)}{\sinh(n\pi b/a)}\,\sin\!\left(\frac{n\pi y}{a}\right).$$

              [[fig:map]]

              **Checks.**

              - $x = 0$: $\sinh 0 = 0$. $x = b$: the ratio is $1$ and the series is the sine series of $V_0$. $y = 0, a$: every sine vanishes.
              - $b = a$, center: $V = \tfrac{4V_0}{\pi}\sum_{\text{odd}}\tfrac{(-1)^{(n-1)/2}}{n}\tfrac{\sinh(n\pi/2)}{\sinh(n\pi)} = \tfrac{2V_0}{\pi}\sum_{\text{odd}}\tfrac{(-1)^{(n-1)/2}}{n\cosh(n\pi/2)}$. Partial sums: $0.2537$ ($n = 1$), $0.2499$ ($n \le 3$), $0.25000$ ($n \le 5$). Exactly $V_0/4$, as the rotation argument below demands.
              - $b \gg a$: near $x = b$, $\tfrac{\sinh(n\pi x/a)}{\sinh(n\pi b/a)} \approx e^{-n\pi(b - x)/a}$: the lecture's slot, seen from the live side.

              **What to remember:** a grounded face at $x = 0$ means $\sinh$; divide by the $\sinh$ at the live face so the $x$-factor is $1$ there; then it is the same Fourier problem as the slot.
            `,
            figs: { map: { svg: HW_MAP, cap: 'Equipotentials $0.1V_0, \\dots, 0.9V_0$ of part (b) for $b = 1.5a$.' } },
          }),

          WG.sep({ bc: 'const', geo: 'pipe', n: 3, title: 'HW 3.17: three grounded sides, the side x = b live. Change b/a and the boundary data.' }),

          Q(md`In the HW 3.17 answer each term carries $\dfrac{\sinh(n\pi x/a)}{\sinh(n\pi b/a)}$. Why divide by $\sinh(n\pi b/a)$?`,
            [md`To make the series converge.`, md`It comes from the orthogonality integral.`, md`It normalizes the sines.`, md`So the $x$-factor equals $1$ on the live side, where the coefficients are fitted.`], 3,
            [md`It does help convergence, but that's a side effect.`, md`Orthogonality gives $\tfrac{a}{2}$, not a $\sinh$.`, md`The sines are untouched.`, null],
            md`Fit the data at $x = b$: there the term is $C_n\sinh(n\pi b/a)\sin(n\pi y/a)$, so Fourier's trick determines the product $C_n\sinh(n\pi b/a)$. Writing the answer with the ratio makes every term equal to its boundary value on the live side and zero on the grounded one.`,
            { figHtml: G_HW }),

          RF(md`
            ### More than one live face: add problems

            The recipe needs a direction with two zero faces. When several faces are live, split the problem: one subproblem per live face, with that face at its given potential and **every other face grounded**. Each subproblem is a standard box. Add the solutions.

            [[fig:super]]

            Why it works: Laplace's equation is linear, so the sum solves it. On any face exactly one subproblem is live; all the others are zero there. So the sum takes the right value on every face, and by uniqueness it is the answer.

            Opposite live faces can sometimes be handled in one go (Ex. 3.4), because the other direction still has its two zero faces. **Adjacent** live faces never can: no direction is left with two zero faces.
          `, { super: { svg: SUPER.svg, cap: 'A box with two live faces is the sum of two boxes with one live face each.' } }),

          Q(md`A box has three live faces and one grounded face. With the "one live face at a time" recipe, how many subproblems do you solve?`,
            [md`One`, md`Two`, md`Three`, md`Four`], 2,
            [md`A single expansion needs a direction with two zero faces; there isn't one.`, md`Each live face needs its own subproblem (unless two live faces are opposite and you use the Ex. 3.4 trick).`, null, md`The grounded face contributes nothing; it needs no subproblem.`],
            md`One subproblem per live face. In each, the other three faces (including the other live ones) are set to zero. The grounded face stays zero in all three.`,
            { figHtml: box({ T: 'V_1', R: 'V_2', B: 'V_3', L: '0', axes: false }) }),

          Q(md`$V = V^{(1)} + V^{(2)}$, where $V^{(1)}$ has only the top face live ($V_1$) and $V^{(2)}$ has only the right face live ($V_2$). What is $V$ on the top face?`,
            [md`$V_1 + V_2$`, md`$V_1$`, md`$V_2$`, md`$(V_1 + V_2)/2$`], 1,
            [md`$V^{(2)}$ is zero on the top face: in that subproblem the top face is grounded.`, null, md`$V_2$ belongs to the right face.`, md`No averaging: each face is live in exactly one subproblem.`],
            md`On the top face $V^{(1)} = V_1$ (its live face) and $V^{(2)} = 0$ (grounded there in subproblem 2). That's the whole reason to ground every other face in each subproblem.`,
            { figHtml: SUPER.svg }),

          RF(md`
            ### Center values without a series

            **Square, one side at $V_0$, three grounded.** Rotate the problem by $90°$, three times. The four problems added have every side at $V_0$, and the solution of that is $V = V_0$ everywhere (a constant satisfies Laplace's equation; uniqueness). The center sits at the same place relative to the live side in all four, so each contributes the same: $4V_c = V_0$, so $V_c = V_0/4$.

            [[fig:rot]]

            **Cube, one face at $V_0$, five grounded:** six faces, same argument, $V_c = V_0/6$ (Discussion Problem 3.18 asks you to check your series against this).

            More generally: the center of a square is the **average** of its four side potentials, and the center of a cube is the average of its six face potentials (each face at a constant).

            The argument needs identical rotated copies, so it **fails for a non-square rectangle**: a long side takes up more of the "view" from the center than a short side. For a $2a \times a$ rectangle with one long side at $V_0$ the center is at $0.445V_0$, not $V_0/4$.
          `, { rot: { svg: ROT.svg, cap: 'Four rotated copies add up to a square with every side at $V_0$, where $V = V_0$ everywhere.' } }),

          Q(md`A square pipe has one side at $V_0$ and three grounded. What is $V$ at the center?`,
            [md`$V_0/2$`, md`$V_0/3$`, md`$V_0/4$`, md`$V_0/\pi$`], 2,
            [md`That's for two live sides.`, md`A square has four sides, and by rotation each contributes equally.`, null, md`Close numerically ($0.318$) but not the answer.`],
            md`Four rotated copies add up to "all sides at $V_0$", whose solution is $V_0$ everywhere; the center gets $V_0/4$ from each. HW 3.17 with $b = a$ confirms it: $0.2537, 0.2499, 0.2500$.`,
            { figHtml: SQ1 }),

          Q(md`A square pipe has two **adjacent** sides at $V_0$ and two grounded. What is $V$ at the center?`,
            [md`$V_0/4$`, md`$V_0/2$`, md`$3V_0/4$`, md`It can't be found without a series.`], 1,
            [md`That's one live side.`, null, md`That's three live sides.`, md`Superposition and symmetry give it directly.`],
            md`Superpose two one-side problems: $V_0/4 + V_0/4 = V_0/2$. Adjacent or opposite doesn't matter for the center value; it does matter for how you'd write the series.`,
            { figHtml: ADJ2 }),

          Q(md`A $2a \times a$ rectangular pipe has one **long** side at $V_0$, the rest grounded. The potential at the center is:`,
            [md`exactly $V_0/4$`, md`less than $V_0/4$`, md`more than $V_0/4$`, md`exactly $V_0/2$`], 2,
            [md`The rotation argument needs a square: rotating a rectangle doesn't give a copy of itself.`, md`The long live side is close to the center and wide: it dominates.`, null, md`Superposition gives $2V_{\text{long}} + 2V_{\text{short}} = V_0$, so one long side gives less than $V_0/2$ as long as the short sides contribute anything.`],
            md`Series: $\tfrac{2V_0}{\pi}\sum_{\text{odd}}\tfrac{(-1)^{(n-1)/2}}{n\cosh(n\pi/4)} = 0.445V_0$. Each short side, live alone, gives $0.055V_0$, and $2(0.445) + 2(0.055) = 1$, as the "all sides at $V_0$" check requires.`,
            { figHtml: RECT21 }),

          Q(md`A square pipe has **all four** sides at $V_0$. What is $V$ inside?`,
            [md`$V_0$ everywhere.`, md`$V_0$ at the walls, less in the middle.`, md`$V_0$ at the walls, more in the middle.`, md`$4V_0$ at the center.`], 0,
            [null, md`A sag in the middle would be a minimum inside a charge-free region: impossible.`, md`A bump would be a maximum: impossible.`, md`Adding four copies of $V_0/4$ gives $V_0$, not $4V_0$.`],
            md`$V = V_0$ satisfies Laplace's equation and every BC, so by uniqueness it is the answer: a closed metal box at one potential has no field inside. Every superposition check in this lesson leans on this fact.`,
            { figHtml: sq('V_0', 'V_0', 'V_0', 'V_0', 110) }),

          Q(md`A cube has its top face at $+V_0$, its bottom face at $-V_0$, and the four side faces grounded. What is $V$ at the center?`,
            [md`$V_0/6$`, md`$V_0/3$`, md`$0$`, md`$-V_0/6$`], 2,
            [md`That's the top face alone.`, md`That's top and bottom both at $+V_0$.`, null, md`That's the bottom face alone.`],
            md`Superpose: top alone gives $+V_0/6$, bottom alone gives $-V_0/6$. They cancel. In fact the whole mid-plane $z = a/2$ is at $V = 0$ by antisymmetry.`,
            { figHtml: (() => { const f = PF.fig({ proj: { ox: 60, oy: 150, s: 1 } }); f.box3(100, 100, 100, { shadeTop: true }); const t = f.p3(50, 50, 100), b = f.p3(100, 50, 0); f.label(t[0], t[1] - 30, '+V_0', 'b'); f.line(t[0], t[1] - 2, t[0], t[1] - 28, { cls: 'dim thin' }); f.label(b[0], b[1] + 14, '-V_0\\ \\text{(bottom)}', 't'); f.text(f.p3(0, 100, 50)[0] + 14, f.p3(0, 100, 50)[1], 'sides grounded', 'l'); return widen(f).svg(); })() }),

          P({
            title: 'A box with a live lid',
            q: md`A long pipe has the rectangular cross-section $0 < x < a$, $0 < y < b$. The top side ($y = b$) is held at $V_0$; the other three sides are grounded. (a) Write $V(x, y)$. (b) Find $V$ at the center for $b = a$ and (c) for $b = 2a$.`,
            figHtml: BOX_TOP,
            hints: [
              md`Which direction has two grounded sides? That one gets the sines, with $k = n\pi/a$.`,
              md`In $y$: zero at $y = 0$, so $\sinh(n\pi y/a)$. Divide by its value at the live side.`,
              md`For (b) use the rotation argument. For (c) one or two terms of the series are enough; $\sinh u/\sinh 2u = 1/(2\cosh u)$.`,
            ],
            parts: [
              { lbl: md`(a) $V = \frac{4V_0}{\pi}\sum_{\text{odd}}\frac1n\,F_n$, where $F_n$ is`, mc: [md`$\sin\frac{n\pi y}{b}\,\frac{\sinh(n\pi x/b)}{\sinh(n\pi a/b)}$`, md`$\sin\frac{n\pi x}{a}\,\frac{\cosh(n\pi y/a)}{\cosh(n\pi b/a)}$`, md`$\sin\frac{n\pi x}{a}\,\frac{\sinh(n\pi y/a)}{\sinh(n\pi b/a)}$`, md`$\sin\frac{n\pi x}{a}\,e^{-n\pi(b - y)/a}$`], a: 2, why: [md`The two grounded sides facing each other are $x = 0$ and $x = a$: the sines go in $x$.`, md`$\cosh$ isn't zero at the grounded bottom $y = 0$.`, null, md`That isn't zero at $y = 0$ (only approximately, for $b \gg a$).`] },
              { lbl: md`(b) center, $b = a$: $V/V_0$`, ans: 0.25, unit: '' },
              { lbl: md`(c) center, $b = 2a$: $V/V_0$`, ans: 0.054885, unit: '' },
            ],
            sol: md`
              **Boundary conditions** (region $0 < x < a$, $0 < y < b$):

              1. $V(0, y) = 0$ (homogeneous)
              2. $V(a, y) = 0$ (homogeneous) $\Rightarrow$ sines in $x$, $k = n\pi/a$
              3. $V(x, 0) = 0$ (homogeneous) $\Rightarrow \sinh(n\pi y/a)$
              4. $V(x, b) = V_0$ (live) $\Rightarrow C_n\sinh(n\pi b/a) = \tfrac{4V_0}{n\pi}$, odd $n$

              (a) This is HW 3.17 turned on its side:

              $$V(x,y) = \frac{4V_0}{\pi}\sum_{n\ \text{odd}}\frac1n\,\sin\frac{n\pi x}{a}\,\frac{\sinh(n\pi y/a)}{\sinh(n\pi b/a)}.$$

              (b) $b = a$: a square with one live side, so $V_0/4$ by rotation.

              (c) $b = 2a$, center $(a/2, a)$: $\dfrac{\sinh(n\pi)}{\sinh(2n\pi)} = \dfrac{1}{2\cosh n\pi}$, so

              $$V = \frac{2V_0}{\pi}\left(\frac{1}{\cosh\pi} - \frac{1}{3\cosh 3\pi} + \dots\right) = \frac{2V_0}{\pi}(0.08627 - 0.00005) = 0.0549V_0 .$$

              The live lid is a full width $a$ away from the center and the grounded sides are only $a/2$ away, so very little reaches the center. (It matches the $2a \times a$ rectangle with a short side live.)
            `,
          }),

          P({
            title: 'Two opposite sides live',
            q: md`A square pipe of side $a$ has its left and right sides ($x = 0$ and $x = a$) at $V_0$ and its bottom and top grounded. (a) What is $V$ at the center? (b) Find $V$ at P $= (a/4, a/2)$.`,
            figHtml: SQ_OPP,
            hints: [
              md`(a) needs no series: superpose with the rotated problem.`,
              md`(b) This is Ex. 3.4 with the origin moved to $x = a/2$ and half-width $a/2$: use $\cosh\big(n\pi(x - a/2)/a\big)$.`,
              md`At P, $x - a/2 = -a/4$. Two terms are plenty.`,
            ],
            parts: [
              { lbl: md`(a) $V(\text{center})/V_0$`, ans: 0.5, unit: '' },
              { lbl: md`(b) $V(\text{P})/V_0$`, ans: 0.63594, unit: '' },
            ],
            sol: md`
              **BCs:** #1 $V(x, 0) = 0$, #2 $V(x, a) = 0$ (homogeneous, sines in $y$); #3 $V(0, y) = V_0$, #4 $V(a, y) = V_0$ (live, symmetric about $x = a/2$).

              (a) Rotating by $90°$ swaps live and grounded sides; the two problems add to "all sides at $V_0$". Same center, so $V_c = V_0/2$.

              (b) Symmetric about $x = a/2$, so use $\cosh$ about the middle (Ex. 3.4 with $b = a/2$):

              $$V = \frac{4V_0}{\pi}\sum_{n\ \text{odd}}\frac1n\,\frac{\cosh\big(n\pi(x - a/2)/a\big)}{\cosh(n\pi/2)}\,\sin\frac{n\pi y}{a}.$$

              At P: $\cosh(n\pi/4)/\cosh(n\pi/2)$ and $\sin(n\pi/2) = 1, -1, 1$:

              $$V = \frac{4V_0}{\pi}\left(\frac{1.3246}{2.5092} - \frac13\cdot\frac{5.3228}{55.663} + \frac15\cdot\frac{25.387}{1287.98}\right) = \frac{4V_0}{\pi}(0.5279 - 0.0319 + 0.0039) = 0.636V_0 .$$

              **Check:** P is closer to a live side than the center is, and $0.636V_0 > 0.5V_0$. Good.
            `,
          }),

          P({
            title: 'Four sides, four potentials',
            q: md`A long square pipe has its four sides held at $10$, $20$, $30$ and $40\ \text{V}$ (insulated from each other at the corners). (a) What is the potential at the center? (b) What if the $40\ \text{V}$ side is grounded instead?`,
            figHtml: SQ_4V,
            hints: [md`Superpose four one-side problems. Each contributes $\tfrac14$ of its side's potential at the center.`],
            parts: [
              { lbl: md`(a) $V(\text{C})$ in volts`, ans: 25, unit: 'V' },
              { lbl: md`(b) $V(\text{C})$ in volts`, ans: 15, unit: 'V' },
            ],
            sol: md`
              Four subproblems, one live side each (others grounded). By the rotation argument each gives $\tfrac14$ of its side potential at the center:

              (a) $V_c = \tfrac14(10 + 20 + 30 + 40) = 25\ \text{V}$. (b) $V_c = \tfrac14(10 + 20 + 30 + 0) = 15\ \text{V}$.

              No series needed. On an exam, this is the check to run on any series answer for a square.
            `,
          }),

          P({
            title: 'Ex. 3.4 with a long pipe',
            q: md`Ex. 3.4 with $b = a$: the cross-section is $2a$ wide and $a$ tall, the short sides at $x = \pm a$ are at $V_0$, the long sides are grounded. Find $V$ at the center.`,
            figHtml: EX34_BA,
            hints: [
              md`Use Griffiths Eq. 3.42 at $x = 0$, $y = a/2$.`,
              md`$\cosh 0 = 1$; you need $\cosh\pi \approx 11.59$ and $\cosh 3\pi \approx 6195.8$.`,
            ],
            parts: [{ lbl: md`$V(\text{C})/V_0$`, ans: 0.10977, unit: '' }],
            sol: md`
              **BCs:** $V = 0$ at $y = 0, a$ (homogeneous, sines in $y$); $V = V_0$ at $x = \pm a$ (live, symmetric: $\cosh$). Eq. 3.42 with $b = a$ at the center:

              $$V = \frac{4V_0}{\pi}\left(\frac{1}{\cosh\pi} - \frac{1}{3\cosh 3\pi} + \dots\right) = \frac{4V_0}{\pi}(0.08627 - 0.00005) = 0.1098V_0 .$$

              **Check with superposition:** this is the $2a \times a$ rectangle with both *short* sides live: $2 \times 0.0549V_0 = 0.1098V_0$. The long grounded sides are only $a/2$ from the center; the live sides are $a$ away.
            `,
          }),

          RF(md`
            !!key Patterns to remember
              - Finite in $x$: no condition at infinity; keep both exponentials and let a zero face ($\sinh$) or a symmetry ($\cosh$) pick the combination.
              - Write the $x$-factor as a ratio, $\sinh(n\pi x/a)/\sinh(n\pi b/a)$ or $\cosh(n\pi x/a)/\cosh(n\pi b/a)$: it is $1$ on the live face, so the coefficients are the plain Fourier ones.
              - Several live faces: one subproblem per live face, every other face grounded; add.
              - Center checks: square $=$ average of the four sides ($V_0/4$ for one live side); cube $=$ average of six faces ($V_0/6$). Not valid for non-square rectangles.
              - Limit checks: $b \gg a$ turns a closed pipe into the slot.
          `),
        ],
      },
      // @@NEXT_LESSON@@
    ],
  });
})();

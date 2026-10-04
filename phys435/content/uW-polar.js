/* Unit W — Polar coordinates and harder separation (Griffiths 4th ed. 3.3, Probs 3.24–3.26; multipole moments 3.4).
   Built around the Spring 2026 Hour Exam 1 (Problem 1: a wedge/annular sector in polar coordinates;
   Problem 2: dipole moment of a ball with +rho0 / -rho0 hemispheres). Verification scripts: scratchpad/p435/verify/uW_verify*.py */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  const PI = Math.PI, D = PI / 180;

  // ================================================================ label placement in open space (same geometry as the checker)
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
  const inPoly = (px, py, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; } return c; };
  function isFree(f, B, m = 3) {
    const T = { x0: B.x0 + 4 - m, y0: B.y0 + 3 - m, x1: B.x1 - 4 + m, y1: B.y1 - 3 + m };
    if (f.segs.some((s) => segHits(s, T))) return false;
    if (f.labs.some((L) => Math.min(T.x1, L.x1 - 4) - Math.max(T.x0, L.x0 + 4) > -m && Math.min(T.y1, L.y1 - 3) - Math.max(T.y0, L.y0 + 3) > -m)) return false;
    if (f.dots.some(([x, y, r]) => x + r > T.x0 && x - r < T.x1 && y + r > T.y0 && y - r < T.y1)) return false;
    if (f.hatches && f.hatches.length) {
      for (let a = 0; a <= 4; a++) for (let b = 0; b <= 2; b++) { const px = T.x0 + (T.x1 - T.x0) * a / 4, py = T.y0 + (T.y1 - T.y0) * b / 2; if (f.hatches.some((h) => inPoly(px, py, h))) return false; }
    }
    return true;
  }
  // label t near (x, y): the first free side among `sides`, growing the gap if needed
  // like put, but returns false (drawing nothing) when no free spot is found
  function tryPut(f, x, y, t, sides, gap = 7, cls = '') {
    for (const g of [gap, gap + 5, gap + 10, gap + 16, gap + 24]) for (const at of sides) {
      const m = TAGOFF[at];
      const B = boxOf(x + m[0] * g, y + m[1] * g, t, m[2]);
      if (isFree(f, B)) { f.label(x + m[0] * g, y + m[1] * g, t, m[2], cls); return true; }
    }
    return false;
  }
  function put(f, x, y, t, sides = ['tr', 'r', 'tl', 'l', 't', 'b', 'br', 'bl'], gap = 7, cls = '') {
    for (const g of [gap, gap + 5, gap + 10, gap + 16, gap + 24]) for (const at of sides) {
      const m = TAGOFF[at];
      const B = boxOf(x + m[0] * g, y + m[1] * g, t, m[2]);
      if (isFree(f, B)) return f.label(x + m[0] * g, y + m[1] * g, t, m[2], cls);
    }
    return f.tag(x, y, t, sides[0], gap, cls);
  }
  // screen direction (degrees CCW from +x) -> preferred label sides, nearest first
  const SIDES = ['r', 'tr', 't', 'tl', 'l', 'bl', 'b', 'br'];
  const sidesToward = (deg) => { const i = ((Math.round(deg / 45) % 8) + 8) % 8; return [SIDES[i], SIDES[(i + 1) % 8], SIDES[(i + 7) % 8], SIDES[(i + 2) % 8], SIDES[(i + 6) % 8]]; };
  function widen(f) { for (const L of f.labs) { const w = L.x1 - L.x0, e = 0.18 * w + 6; f.track(L.x0 - e, L.y0 - 4, L.x1 + e, L.y1 + 4); } return f; }
  const pol = (r, deg, c = [0, 0]) => [c[0] + r * Math.cos(deg * D), c[1] - r * Math.sin(deg * D)];
  // diagonal lines in short pieces (the runtime declutter then sees the line, not its bounding box)
  const sub = (x1, y1, x2, y2, step = 7) => { const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step)); return [...Array(n + 1)].map((_, i) => [x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); };
  const dl = (f, x1, y1, x2, y2, o = {}) => f.pl(sub(x1, y1, x2, y2), o);
  const shadeP = (f, pts) => { pts.forEach((p) => f.track(p[0], p[1])); f.add(`<path class="shade nodecl" d="M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z"/>`); };
  const plus = (f, x, y, s = 3.2) => { f.line(x - s, y, x + s, y, { cls: 'thin' }); f.line(x, y - s, x, y + s, { cls: 'thin' }); };
  const minus = (f, x, y, s = 3.2) => f.line(x - s, y, x + s, y, { cls: 'thin' });
  // axis arrow with its letter placed in open space
  const axis = (f, x1, y1, x2, y2, lab, sides) => { f.arrow(x1, y1, x2, y2, { cls: 'dim', hs: 6 }); if (lab) put(f, x2, y2, lab, sides || sidesToward(Math.atan2(y1 - y2, x2 - x1) / D), 5, 'small accent'); };
  // angle arc at c from a0 to a1 (deg) with its label in open space
  const ang = (f, c, r, a0, a1, lab) => { f.pl(f.arcPts(c[0], c[1], r, r, a0, a1), { cls: 'dim thin' }); if (lab) { const p = pol(r + 3, (a0 + a1) / 2, c); if (!tryPut(f, p[0], p[1], lab, sidesToward((a0 + a1) / 2), 4, 'small')) put(f, c[0], c[1], lab, sidesToward((a0 + a1) / 2 + 180), 6, 'small'); } };
  // dimension arrow with the label in open space
  const dimL = (f, x1, y1, x2, y2, lab, sides) => { f.pl(sub(x1, y1, x2, y2), { cls: 'dim', arrow: 'both', hs: 6 }); if (lab) put(f, (x1 + x2) / 2, (y1 + y2) / 2, lab, sides || ['t', 'r', 'b', 'l'], 5, 'small'); };

  // function plot with curve labels placed in open space
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
    for (const [v, s] of (o.hlines || [])) { f.line(X(x0), Y(v), X(x1), Y(v), { cls: 'dash dim' }); if (s) f.label(X(x1) - 2, Y(v) - 3, s, 'br', 'small accent'); }
    for (const [v, s] of (o.vlines || [])) { f.line(X(v), Y(y0), X(v), Y(y1), { cls: 'dash dim' }); if (s) f.label(X(v) + 4, Y(y1) + 2, s, 'tl', 'small accent'); }
    const drawn = [];
    for (const c of (o.curves || [])) {
      let pts = []; const a = c.from ?? x0, b = c.to ?? x1, N = c.n || 240;
      for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; const y = c.f(x); if (isFinite(y)) pts.push([x, y]); }
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
        const p = inside.reduce((bb, q) => (Math.abs(q[0] - xa) < Math.abs(bb[0] - xa) ? q : bb), inside[0]);
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

  // ================================================================ the wedge / annular sector (vertex at the origin, wall 1 along +x)
  // o: al (deg), a (inner radius px, 0 = vertex inside the region), b (outer radius px), open (no outer arc: walls run out to L),
  //    w0, wA, inner, outer: boundary labels (TeX; omit for none). metal0/metalA false: that wall is not drawn as metal.
  //    ticks: true -> 'a', 'b' marks under wall 1. O: label the vertex. pts: [[r, deg, lab]]. Ptheta: [r, deg] field point with theta arc.
  function wedge(o = {}) {
    const f = PF.fig();
    const al = o.al ?? 60, a = o.a ?? 0, b = o.b ?? 150, open = !!o.open, L = o.L ?? (open ? 170 : b), g = a || !open ? 4 : 0;
    const rIn = a ? a + g : (o.r0 || 0), rOut = open ? L : b - g, t = 9;
    // region tint
    const outerPts = f.arcPts(0, 0, open ? L : b, open ? L : b, 0, al);
    const innerPts = a ? f.arcPts(0, 0, a, a, al, 0) : [[0, 0]];
    if (o.tint !== false) shadeP(f, outerPts.concat(innerPts));
    if (o.map) {
      const Rm = open ? L : b;
      cmap(f, (x, y) => {
        const r = Math.hypot(x, y); let th = Math.atan2(-y, x); if (th < -1e-9) th += 2 * PI;
        if (r < a + 0.5 || r > Rm - 0.5 || th > al * D - 1e-3 || th < 1e-3) return NaN;
        return o.map.fn(r, th);
      }, [-Rm, -Rm, Rm, Rm], o.map.levels, { h: o.map.h || 3, track: false });
    }
    const wall = (deg, side, metal) => {
      const n = pol(1, deg + side * 90), p1 = pol(rIn, deg), p2 = pol(rOut, deg);
      if (metal !== false) f.hatchBand([p1, p2, [p2[0] + n[0] * t, p2[1] + n[1] * t], [p1[0] + n[0] * t, p1[1] + n[1] * t]]);
      dl(f, p1[0], p1[1], p2[0], p2[1], { cls: metal === false ? 'dim dash' : 'thick' });
      if (open) { const p3 = pol(L + 26, deg); dl(f, p2[0], p2[1], p3[0], p3[1], { cls: 'dim dash' }); }
    };
    wall(0, -1, o.metal0); wall(al, 1, o.metalA);
    if (a) { for (const d of [0, al]) { const p = pol(a - 2, d); dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); } }
    if (!open && o.outerArc !== false) {
      f.hatchBand(f.arcPts(0, 0, b, b, 0, al).concat(f.arcPts(0, 0, b + t, b + t, al, 0)));
      f.pl(f.arcPts(0, 0, b, b, 0, al), { cls: 'thick' });
    }
    if (a && o.innerArc !== false) {
      f.hatchBand(f.arcPts(0, 0, a, a, 0, al).concat(f.arcPts(0, 0, a - t, a - t, al, 0)));
      f.pl(f.arcPts(0, 0, a, a, 0, al), { cls: 'thick' });
    }
    // field point (drawn before labels so they avoid it)
    if (o.Ptheta) { const [rp, dp] = o.Ptheta, p = pol(rp, dp); dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); }
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); f.dot(q[0], q[1], 2.8); }
    f.dot(0, 0, 2.2);
    // angle mark at the vertex
    const ar = o.ar ?? (a ? Math.min(0.5 * a, 24) : 26);
    if (o.angLab !== false) ang(f, [0, 0], ar, 0, al, o.angLab || '\\alpha');
    if (o.Ptheta) ang(f, [0, 0], o.Ptheta[2] || ar + 18, 0, o.Ptheta[1], '\\theta');
    // labels
    const rm = o.rm ?? (rIn + rOut) / 2;
    if (o.w0) { const p = pol(rm, 0); put(f, p[0], p[1] + t, o.w0, ['b', 'bl', 'br'], 6, 'small'); }
    if (o.wA) { const n = pol(t, al + 90), p = pol(o.rmA ?? rm, al); put(f, p[0] + n[0], p[1] + n[1], o.wA, sidesToward(al + 90), 6, 'small'); }
    if (o.outer && !open) { const p = pol(b + t, o.outerAt ?? al / 2); put(f, p[0], p[1], o.outer, sidesToward(o.outerAt ?? al / 2), 6, 'small'); }
    if (o.far && open) { const p = pol(L + 10, al / 2); put(f, p[0], p[1], o.far, sidesToward(al / 2), 6, 'small'); }
    if (o.inner && a) { const ia = o.innerAt ?? al / 2, p = pol(a + 3, ia); put(f, p[0], p[1], o.inner, sidesToward(ia), 4, 'small'); }
    if (o.O !== false) put(f, 0, 0, 'O', sidesToward(al / 2 + 180), 5, 'small accent');
    if (o.ticks) {
      if (a) { const p = pol(a, 0); put(f, p[0], p[1] + t, 'a', ['b', 'bl', 'br'], 4, 'small accent'); }
      if (!open) { const p = pol(b, 0); put(f, p[0], p[1] + t, 'b', ['b', 'br', 'bl'], 4, 'small accent'); }
    }
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); if (p[2]) put(f, q[0], q[1], p[2], p[3] ? [p[3]] .concat(['tr', 'tl', 'r', 'l', 'br', 'bl']) : ['tr', 'tl', 'r', 'l', 'br', 'bl'], 5); }
    if (o.Ptheta && o.Ptheta[3] !== false) { const q = pol(o.Ptheta[0], o.Ptheta[1]); put(f, q[0], q[1], 'P', ['tr', 'r', 't', 'tl'], 5); }
    if (o.inside) { const p = pol(o.insideR ?? (rIn + rOut) / 2, o.insideAt ?? al / 2); put(f, p[0], p[1], o.inside, ['r', 'l', 't', 'b'], 2); }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // equipotentials by marching squares on a screen-pixel grid; fn(x, y) -> value (NaN outside the region)
  function cmap(f, fn, box, levels, o = {}) {
    const [x0, y0, x1, y1] = box, h = o.h || 3, nx = Math.ceil((x1 - x0) / h), ny = Math.ceil((y1 - y0) / h);
    const G = [];
    if (o.track !== false) f.track(x0, y0, x1, y1);
    for (let i = 0; i <= nx; i++) { G.push([]); for (let j = 0; j <= ny; j++) G[i].push(fn(x0 + i * h, y0 + j * h)); }
    for (const L of levels) {
      let d = '';
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const v = [G[i][j] - L, G[i + 1][j] - L, G[i + 1][j + 1] - L, G[i][j + 1] - L];
        if (v.some((t) => !isFinite(t))) continue;
        const cr = [], P2 = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
        for (let e = 0; e < 4; e++) {
          const p0 = v[e], p1 = v[(e + 1) % 4];
          if ((p0 < 0) !== (p1 < 0)) { const t = p0 / (p0 - p1), p = P2[e], q = P2[(e + 1) % 4]; cr.push([x0 + (p[0] + (q[0] - p[0]) * t) * h, y0 + (p[1] + (q[1] - p[1]) * t) * h]); }
        }
        const seg = (p, q) => { d += `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}`; };
        if (cr.length === 2) seg(cr[0], cr[1]);
        else if (cr.length === 4) { seg(cr[0], cr[1]); seg(cr[2], cr[3]); }
      }
      if (d) f.add(`<path class="${L < 0 ? 'dim thin dash' : 'dim thin'} nodecl" d="${d}"/>`);
    }
    return f;
  }

  // ================================================================ cylinder cross-sections (axis out of the page)
  // o: R, metal, shell, lab [tex, deg] list of boundary labels placed outside, a (inner radius for coax), aMetal, aLab [tex, deg],
  //    axes, field (uniform E0 x-hat arrows far away), phi (deg: radius to a surface point with the phi arc), line {d, lab}, pts, inside
  function cyl(o = {}) {
    const f = PF.fig();
    const R = o.R ?? 58, a = o.a || 0;
    if (o.pre) o.pre(f, R);
    if (o.tint) { if (a) shadeP(f, f.arcPts(0, 0, R, R, 0, 360).concat(f.arcPts(0, 0, a, a, 360, 0))); else shadeP(f, f.arcPts(0, 0, R, R, 0, 360)); }
    if (o.field) {
      for (const y of [-1.5, -0.75, 0, 0.75, 1.5]) {
        f.arrow(-2.5 * R, y * R, -1.55 * R, y * R, { cls: 'dim', hs: 6 });
        f.arrow(1.55 * R, y * R, 2.5 * R, y * R, { cls: 'dim', hs: 6 });
      }
    }
    if (o.outerMetal) { f.hatchBand(f.arcPts(0, 0, R + 9, R + 9, 0, 360).concat(f.arcPts(0, 0, R, R, 360, 0))); }
    if (o.metal) f.hatchBand(f.arcPts(0, 0, R, R, 0, 360));
    f.circle(0, 0, R, { cls: o.metal || o.shell || o.outerMetal ? 'thick' : (o.circCls || '') });
    if (a) {
      if (o.aMetal) f.hatchBand(f.arcPts(0, 0, a, a, 0, 360));
      f.circle(0, 0, a, { cls: 'thick' });
    }
    if (o.axes !== false) {
      const e = o.axesExt || 1.45 * R + (o.outerMetal ? 12 : 0);
      f.line(-e, 0, -R - 2, 0, { cls: 'dim dash thin' });
      if (!o.metal && !a) f.line(-R + 2, 0, R - 2, 0, { cls: 'dim dash thin' });
      if (!o.metal && a && !o.aMetal) f.line(-a + 2, 0, a - 2, 0, { cls: 'dim dash thin' });
      if (a && !o.metal) { f.line(-R + 2, 0, -a - 2, 0, { cls: 'dim dash thin' }); f.line(a + 2, 0, R - 2, 0, { cls: 'dim dash thin' }); }
      axis(f, R + 2, 0, e + 18, 0, 'x', ['r', 'br', 'tr']);
      f.line(0, e, 0, R + 2, { cls: 'dim dash thin' });
      if (!o.metal && !a) f.line(0, R - 2, 0, -R + 2, { cls: 'dim dash thin' });
      if (a && !o.metal) { f.line(0, R - 2, 0, a + 2, { cls: 'dim dash thin' }); f.line(0, -a - 2, 0, -R + 2, { cls: 'dim dash thin' }); if (!o.aMetal) f.line(0, a - 2, 0, -a + 2, { cls: 'dim dash thin' }); }
      axis(f, 0, -R - 2, 0, -e - 18, 'y', ['t', 'tr', 'tl']);
    }
    if (o.line) { f.charge(o.line.d, 0, { q: '+' }); }
    if (o.phi !== undefined) {
      const p = pol(R, o.phi); dl(f, 0, 0, p[0], p[1], { cls: 'dim thin' }); f.dot(p[0], p[1], 2.4);
      ang(f, [0, 0], o.phiR || 0.32 * R, 0, o.phi, '\\phi');
    }
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); f.dot(q[0], q[1], 2.8); }
    if (o.Rdim) { const p = pol(R, o.Rdim[0]); dimL(f, 0, 0, p[0], p[1], o.Rdim[1] || 'R', o.Rdim[2]); }
    if (o.adim) { const p = pol(a, o.adim[0]); dimL(f, 0, 0, p[0], p[1], o.adim[1] || 'a', o.adim[2]); }
    for (const [tex, deg, rr] of (o.lab || [])) { const p = pol((rr || R) + (o.outerMetal ? 14 : 5), deg); put(f, p[0], p[1], tex, sidesToward(deg), 5, 'small'); }
    for (const [tex, deg] of (o.aLab || [])) { const p = pol(a + 4, deg); put(f, p[0], p[1], tex, sidesToward(deg), 4, 'small'); }
    if (o.field) put(f, -2.0 * R, -1.5 * R, o.fieldLab || '\\vb E_0', ['t', 'tl', 'tr'], 5);
    if (o.line) put(f, o.line.d, 0, o.line.lab || '\\lambda', ['tr', 't', 'r', 'br'], 9);
    if (o.lineDim) dimL(f, 0, 30 + (o.R ?? 58) * 0, o.line.d, 30, '', []);
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); if (p[2]) put(f, q[0], q[1], p[2], ['tr', 'tl', 'r', 'l', 'br', 'bl'], 5); }
    if (o.inside) put(f, o.inside[1] || 0, o.inside[2] || 0, o.inside[0], ['r', 't', 'b', 'l'], 2);
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // ================================================================ charge distributions in a ball (z up). o: R, kind, P [r, deg from +z], labs
  function ball(o = {}) {
    const f = PF.fig();
    const R = o.R ?? 62, kind = o.kind || 'pm';
    const up = f.arcPts(0, 0, R, R, 0, 180), dn = f.arcPts(0, 0, R, R, 180, 360);
    if (kind === 'pm' || kind === 'cos' || kind === 'full') { shadeP(f, up); shadeP(f, dn); }
    if (kind === 'north') shadeP(f, up);
    if (kind === 'shellpm') { f.pl(up, { cls: 'thick' }); f.pl(dn, { cls: 'thick' }); }
    else if (kind === 'north') { f.pl(up); f.pl(dn, { cls: 'dim dash' }); f.line(-R, 0, R, 0); }
    else f.circle(0, 0, R);
    if (kind === 'pm') {
      f.line(-R + 2, 0, R - 2, 0, { cls: 'dim dash thin' });
      for (const [x, y] of [[-0.55, 0.3], [0.5, 0.33], [-0.2, 0.68], [0.28, 0.66], [-0.75, 0.12], [0.76, 0.14]]) { plus(f, x * R, -y * R); minus(f, x * R, y * R); }
    }
    if (kind === 'north') for (const [x, y] of [[-0.55, 0.3], [0.5, 0.33], [-0.2, 0.68], [0.28, 0.66], [-0.75, 0.12], [0.76, 0.14]]) plus(f, x * R, -y * R);
    if (kind === 'shellpm') {
      for (let d = 20; d < 180; d += 32) { const p = pol(R + 8, d); plus(f, p[0], p[1], 2.6); const q = pol(R + 8, -d); minus(f, q[0], q[1], 2.6); }
      f.line(-R + 2, 0, R - 2, 0, { cls: 'dim dash thin' });
    }
    // z axis
    const zt = o.zTop ?? R + 42;
    f.line(0, R + 16, 0, R + 2, { cls: 'dim dash thin' });
    f.line(0, R - 2, 0, -R + 2, { cls: 'dim dash thin' });
    axis(f, 0, -R - 2, 0, -zt, 'z', ['t', 'tr', 'tl']);
    if (o.P) {
      const [rp, th] = o.P, p = pol(rp, 90 - th);
      dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); f.dot(p[0], p[1], 2.8);
      ang(f, [0, 0], o.thR || 0.3 * R, Math.min(90, 90 - th), Math.max(90, 90 - th), '\\theta');
    }
    if (o.Rdim) { const p = pol(R, o.Rdim); dimL(f, 0, 0, p[0], p[1], 'R', ['t', 'tl', 'r']); }
    if (o.P && o.Plab !== false) { const p = pol(o.P[0], 90 - o.P[1]); put(f, p[0], p[1], o.Plab || 'P', ['tr', 'r', 't', 'tl'], 5); }
    for (const [tex, deg, rr] of (o.labs || [])) { const p = pol((rr || R) + 6, deg); put(f, p[0], p[1], tex, sidesToward(deg), 5, 'small'); }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // ================================================================ Lesson 1 figures
  // plane polar coordinates: a point P at (s, phi), the circle s = const and the ray phi = const through it
  function fPolar() {
    const f = PF.fig();
    const s0 = 120, ph = 35, P0 = pol(s0, ph);
    f.pl(f.arcPts(0, 0, s0, s0, -8, 110), { cls: 'dim dash thin' });
    const e = pol(178, ph); dl(f, P0[0], P0[1], e[0], e[1], { cls: 'dim dash thin' });
    dl(f, 0, 0, P0[0], P0[1], { cls: 'thin' });
    axis(f, -24, 0, 175, 0, 'x', ['r', 'br']);
    axis(f, 0, 24, 0, -150, 'y', ['t', 'tr']);
    f.dot(P0[0], P0[1], 3);
    // unit vectors at P
    const sh = pol(28, ph, P0), ph2 = pol(28, ph + 90, P0);
    f.arrow(P0[0], P0[1], sh[0], sh[1], { hs: 6 }); f.arrow(P0[0], P0[1], ph2[0], ph2[1], { hs: 6 });
    ang(f, [0, 0], 30, 0, ph, '\\phi');
    const m = pol(s0 * 0.55, ph); put(f, m[0], m[1], 's', ['tl', 't', 'l'], 5, 'small');
    put(f, sh[0], sh[1], '\\hat{\\mathbf s}', ['r', 'tr', 'br'], 3, 'small');
    put(f, ph2[0], ph2[1], '\\hat{\\boldsymbol\\phi}', ['t', 'tl', 'l'], 3, 'small');
    put(f, P0[0], P0[1], 'P', ['bl', 'b', 'l'], 5);
    const c = pol(s0, 95); put(f, c[0], c[1], 's=\\text{const}', ['tl', 't', 'l'], 5, 'small');
    put(f, e[0], e[1], '\\phi=\\text{const}', ['r', 'tr', 't'], 4, 'small');
    return widen(f).svg();
  }
  // the kinds of region: disk (origin inside), exterior (infinity inside), annulus, wedge
  function region(kind, o = {}) {
    const f = PF.fig(), R = 44, a = 20;
    if (kind === 'disk') { shadeP(f, f.arcPts(0, 0, R, R, 0, 360)); f.circle(0, 0, R, { cls: 'thick' }); f.dot(0, 0, 2.2); }
    if (kind === 'ext') { f.rect(-78, -62, 156, 124, { cls: 'dim dash thin' }); f.add(`<path class="shade nodecl" d="M-78,-62L78,-62L78,62L-78,62Z M${R},0${f.arcPts(0, 0, R, R, 0, 360).map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')}Z" fill-rule="evenodd"/>`); f.circle(0, 0, R, { cls: 'thick' }); f.dot(0, 0, 2.2); }
    if (kind === 'ann') { shadeP(f, f.arcPts(0, 0, R, R, 0, 360).concat(f.arcPts(0, 0, a, a, 360, 0))); f.circle(0, 0, R, { cls: 'thick' }); f.circle(0, 0, a, { cls: 'thick' }); f.dot(0, 0, 2.2); }
    if (kind === 'wedge') { shadeP(f, f.arcPts(0, 0, R + 10, R + 10, 0, 60).concat([[0, 0]])); f.line(0, 0, R + 10, 0, { cls: 'thick' }); dl(f, 0, 0, ...pol(R + 10, 60), { cls: 'thick' }); f.pl(f.arcPts(0, 0, R + 10, R + 10, 0, 60), { cls: 'thick' }); f.dot(0, 0, 2.2); }
    if (o.lab) put(f, 0, 0, o.lab, ['b', 'bl', 'br'], 6, 'small accent');
    f.track(-80, -64, 80, 64);
    return widen(f).svg();
  }
  const REGIONS = PF.row([
    { svg: region('disk'), cap: '(A) inside a circle: the origin is in the region' },
    { svg: region('ext'), cap: '(B) outside a circle: infinity is in the region' },
    { svg: region('ann'), cap: '(C) annulus: neither' },
    { svg: region('wedge'), cap: '(D) wedge: walls at two angles' },
  ]);
  // three geometries side by side for the comparison table
  function miniSlot() {
    const f = PF.fig();
    f.plane(0, 130, 0, { side: 'below' }); f.plane(0, 130, -70, { side: 'above' }); f.wall(0, -68, -2, { side: 'left' });
    f.line(130, 0, 150, 0, { cls: 'dim dash' }); f.line(130, -70, 150, -70, { cls: 'dim dash' });
    put(f, -10, -35, 'V_0', ['l'], 4, 'small'); put(f, 70, 10, 'V=0', ['b'], 4, 'small'); put(f, 70, -80, 'V=0', ['t'], 4, 'small');
    return widen(f).svg();
  }
  const COMPARE = PF.row([
    { svg: miniSlot(), cap: 'Cartesian: a slot' },
    { svg: wedge({ al: 50, a: 0, b: 110, w0: 'V=0', wA: 'V=0', outer: 'V_0', O: false, angLab: '\\alpha' }), cap: 'Polar: a wedge' },
    { svg: ball({ kind: 'none', R: 50, labs: [['V_0(\\theta)', 40]] }), cap: 'Spherical: a sphere' },
  ]);
  const FULLvsWEDGE = PF.row([
    { svg: cyl({ R: 56, lab: [['V(R,\\phi)', 40]], phi: 150 }), cap: 'Full circle: $\\phi$ and $\\phi + 2\\pi$ are the same point.' },
    { svg: wedge({ al: 75, a: 0, b: 120, w0: 'V=0', wA: 'V=0', outer: 'V_0', O: false }), cap: 'Wedge: the walls at $\\phi = 0$ and $\\phi = \\alpha$ are boundaries.' },
  ]);
  const COAX = cyl({ R: 72, a: 28, aMetal: true, outerMetal: true, lab: [['V=0', 40]], aLab: [['V_0', 135]], Rdim: [-35, 'b', ['br', 'b', 'r']], adim: [-130, 'a', ['bl', 'l', 'b']] });
  const COAX2 = cyl({ R: 72, a: 28, aMetal: true, outerMetal: true, lab: [['V_1', 40]], aLab: [['V=0', 135]], Rdim: [-35, 'b', ['br', 'b', 'r']], adim: [-130, 'a', ['bl', 'l', 'b']] });
  const ANNULUS = cyl({ R: 76, a: 38, aMetal: true, lab: [['V_0\\cos\\phi', 62]], aLab: [['V_0', 130]], phi: 28, phiR: 52, adim: [210, 'a', ['bl', 'l', 'b']], Rdim: [-60, 'b', ['r', 'br', 'tr']] });
  const SLIT = (() => {   // a plane with a half-line cut: the wedge of angle 2*pi
    const f = PF.fig();
    shadeP(f, [[-120, -90], [120, -90], [120, 90], [-120, 90]]);
    f.hatchBand([[0, -2], [125, -2], [125, 2], [0, 2]]); f.line(0, 0, 125, 0, { cls: 'thick' });
    f.dot(0, 0, 2.4);
    ang(f, [0, 0], 22, 2, 358, '2\\pi');
    put(f, 70, -4, 'V=0', ['t', 'tl'], 6, 'small'); put(f, 70, 4, 'V=0', ['b', 'bl'], 6, 'small');
    put(f, 0, 0, 'O', ['l', 'bl'], 8, 'small accent');
    return widen(f).svg();
  })();
  const PIPE_HALF = cyl({ R: 58, lab: [['+V_0', 60], ['-V_0', 300]], extra: (f) => { f.dot(-58, 0, 2.6); f.dot(58, 0, 2.6); } });

  // extra setup figures for the added conceptual MCs (lesson 1)
  const HALFANN = wedge({ al: 180, a: 40, b: 120, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', O: false, angLab: '\\pi' });
  const RHALF = cyl({ R: 58, lab: [['V_0', 30], ['V=0', 150]], extra: (f) => { f.dot(0, -58, 2.6); f.dot(0, 58, 2.6); } });
  const CIRC_HALF = cyl({ R: 60, lab: [['V(R,\\phi)', 40]], extra: (f) => { f.pl(f.arcPts(0, 0, 30, 30, 0, 360), { cls: 'dim dash thin' }); const p = pol(30, 235); put(f, p[0], p[1], 's=R/2', ['bl', 'b', 'l'], 4, 'small'); } });

  // ================================================================ Lesson 1
  const L1 = {
    id: 'uW-polar', title: 'Laplace in polar coordinates (no z dependence)',
    steps: [
      RF(md`
        Problem 1 on last spring's Hour Exam 1 was a separation-of-variables problem in **plane polar coordinates**: a wedge between two radii, with walls at two angles. The Cartesian slot and the sphere don't cover it. This lesson builds the polar machinery from scratch. The next lesson works the exam problem itself.

        **When polar coordinates are the right tool.** Use them when

        1. nothing depends on $z$ (long pipes, wires, wedges and slits that run forever along $z$), so the problem lives in a plane, and
        2. every boundary is a **circle** $s = \text{const}$ or a **ray** $\phi = \text{const}$.

        [[fig:polar]]

        The Laplacian in cylindrical coordinates is on the formula sheet. With $\partial/\partial z = 0$ it is
        $$\nabla^2 V = \frac{1}{s}\frac{\partial}{\partial s}\!\left(s\,\frac{\partial V}{\partial s}\right) + \frac{1}{s^2}\frac{\partial^2 V}{\partial \phi^2} = 0 .$$

        !!trap Same coordinates, two alphabets
          Griffiths calls the plane polar coordinates $(s, \phi)$. The exam called them $(r, \theta)$ and the potential $\Phi$. They are the **same** coordinates: $r$ is the distance from the $z$-axis and $\theta$ is the angle in the plane, measured from a fixed ray. This $\theta$ is **not** the spherical polar angle from the $z$-axis, and there are no Legendre polynomials anywhere in this problem. Read the geometry, not the letters.

        | Griffiths (this lesson) | Spring 2026 exam (next lesson) |
        |---|---|
        | $V(s,\phi)$ | $\Phi(r,\theta)$ |
        | $s$ = distance from the axis | $r$ |
        | $\phi$ = angle in the plane | $\theta$ |
      `, { polar: { svg: fPolar(), cap: 'Plane polar coordinates. The boundaries polar separation can handle are circles $s = \\text{const}$ and rays $\\phi = \\text{const}$. The $z$-axis points out of the page.' } }),

      Q(md`Which of these problems is a job for polar separation of variables $V(s,\phi) = R(s)\Psi(\phi)$?`,
        [md`A point charge between two grounded parallel plates`,
          md`A sphere whose surface is held at $V_0\cos\theta$`,
          md`A finite cylinder (length $L$) whose top face is held at $V_0$`,
          md`An infinitely long pipe of radius $R$ whose surface is held at $V_0\cos\phi$`],
        3,
        [md`There is charge inside the region (Poisson, not Laplace), and the plates are planes, not circles or rays. Images handle this one.`,
          md`A sphere is a surface $r = \text{const}$ in **spherical** coordinates. That is the $R(r)P_\ell(\cos\theta)$ machinery, not polar.`,
          md`A finite cylinder has end faces, so $V$ depends on $z$. Plane polar separation needs $\partial V/\partial z = 0$.`,
          null],
        md`The pipe is infinitely long, so nothing depends on $z$, and its surface is a circle $s = R$. Both conditions hold. Recognising the coordinate system from the shape of the boundaries is the first point on the exam.`,
        { figHtml: PF.row([{ svg: cyl({ R: 50, lab: [['V_0\\cos\\phi', 40]] }), cap: 'pipe, cross-section' }]).svg }),

      Q(md`On the exam the potential was written $\Phi(r,\theta)$ in a wedge $0 < \theta < \alpha$ between $r = a$ and $r = b$. What is $\theta$?`,
        [md`The angle from the $z$-axis, as in spherical coordinates`,
          md`The angle in the plane perpendicular to the edge of the wedge, the same as Griffiths' $\phi$`,
          md`The opening angle of the wedge`,
          md`The angle between $\vb E$ and the wall`],
        1,
        [md`That is the spherical $\theta$. A wedge's walls are half-planes through the $z$-axis, so they sit at fixed angles **in the plane**. This is polar, not spherical.`,
          null,
          md`The opening angle is the constant $\alpha$. $\theta$ is the variable that runs from $0$ to $\alpha$.`,
          md`$\theta$ is a coordinate of the field point, not a property of the field.`],
        md`In plane polar coordinates $(r,\theta)$ is Griffiths' $(s,\phi)$. If you see Legendre polynomials in your wedge solution, you used the wrong Laplacian.`,
        { figHtml: wedge({ al: 55, a: 50, b: 150, Ptheta: [110, 30, 40] }) }),

      Q(md`Why does the $\partial^2 V/\partial z^2$ term drop out of the Laplacian for the pipe in the first question?`,
        [md`Because the pipe is a conductor`,
          md`Because $V$ is zero on the $z$-axis`,
          md`Because $s$ and $z$ are independent coordinates`,
          md`Because the pipe and its boundary values are the same at every $z$, so $V$ cannot depend on $z$`],
        3,
        [md`Being a conductor doesn't make anything $z$-independent. A finite metal can has $z$-dependence.`,
          md`Nothing says $V = 0$ on the axis. Inside the $V_0\cos\phi$ pipe, $V$ vanishes on the axis, but that is a result, not the reason.`,
          md`Independent coordinates can still both appear in $V$. The geometry is what removes $z$.`,
          null],
        md`Translational symmetry: shift the whole problem along $z$ and nothing changes, so by uniqueness $V$ is unchanged too. Hence $\partial V/\partial z = 0$. The same argument removed $z$ from the Cartesian slot.`,
        { figHtml: cyl({ R: 50, lab: [['V_0\\cos\\phi', 40]] }) }),

      RF(md`
        ### Separating the variables

        Try a product, $V(s,\phi) = R(s)\,\Psi(\phi)$. Substitute into Laplace's equation, multiply by $s^2$ and divide by $R\Psi$:
        $$\underbrace{\frac{s}{R}\frac{d}{ds}\!\left(s\,\frac{dR}{ds}\right)}_{\text{only } s} + \underbrace{\frac{1}{\Psi}\frac{d^2\Psi}{d\phi^2}}_{\text{only }\phi} = 0 .$$
        A function of $s$ plus a function of $\phi$ is zero everywhere only if each is a constant, and the two constants add to zero:
        $$\frac{d^2\Psi}{d\phi^2} = -k^2\,\Psi, \qquad s\,\frac{d}{ds}\!\left(s\,\frac{dR}{ds}\right) = k^2 R .$$

        **Why the minus sign goes with the angle.** The angular function must either come back to itself after a full turn ($\phi \to \phi + 2\pi$) or vanish on two walls. Both need an **oscillating** function, and oscillation needs $-k^2$:
        $$\Psi(\phi) = A\cos k\phi + B\sin k\phi .$$
        With $+k^2$ you would get $e^{\pm k\phi}$, which never repeats and can vanish at most once. This is the same rule as the slot: the direction with two homogeneous conditions gets the sines.

        **The radial equation: try a power.** $s\,\frac{d}{ds}\!\left(s\,\frac{dR}{ds}\right) = k^2R$ is an *Euler (equidimensional) equation*: every derivative comes with one factor of $s$, so a power $s^\lambda$ keeps its form. Substitute $R = s^\lambda$:
        $$s\frac{d}{ds}\!\left(s\cdot\lambda s^{\lambda-1}\right) = s\frac{d}{ds}\left(\lambda s^\lambda\right) = \lambda^2 s^\lambda = k^2 s^\lambda \;\Rightarrow\; \lambda = \pm k .$$
        $$R(s) = C\,s^{k} + D\,s^{-k}\qquad (k \neq 0).$$

        !!method The Euler trick (works for every radial equation in this course)
          If each derivative in an ODE is multiplied by the same power of the variable ($s\,d/ds$, $r^2\,d^2/dr^2$, ...), try $s^\lambda$ and solve for $\lambda$.
          - Polar: $\lambda^2 = k^2$, so $s^{k}$ and $s^{-k}$.
          - Spherical: $\frac{d}{dr}\!\left(r^2\frac{dR}{dr}\right) = \ell(\ell+1)R$ gives $\lambda(\lambda+1) = \ell(\ell+1)$, so $r^\ell$ and $r^{-(\ell+1)}$.
          On the exam, "found by trying $R = r^\lambda$" earns the point for the radial solution.
      `),

      Q(md`Substitute $R = s^\lambda$ into $s\dfrac{d}{ds}\!\left(s\dfrac{dR}{ds}\right) = k^2R$. What condition on $\lambda$ do you get?`,
        [md`$\lambda(\lambda+1) = k^2$`, md`$\lambda^2 = -k^2$`, md`$\lambda^2 = k^2$`, md`$\lambda = k^2$`],
        2,
        [md`That is the spherical pattern, $\frac{d}{dr}(r^2R')$. Here $s\,\frac{d}{ds}(s\,\lambda s^{\lambda-1}) = \lambda^2 s^\lambda$: no $+1$.`,
          md`Sign error. The radial equation has $+k^2$ on the right (the angular one has $-k^2$), so $\lambda$ is real.`,
          null,
          md`Each $s\,d/ds$ brings down one factor $\lambda$, and there are two of them: $\lambda^2$.`],
        md`$s\,d/ds$ acting on $s^\lambda$ gives $\lambda s^\lambda$. Do it twice: $\lambda^2 s^\lambda = k^2 s^\lambda$, so $\lambda = \pm k$ and $R = Cs^k + Ds^{-k}$.`,
        { nofig: 'pure algebra on the radial ODE' }),

      Q(md`A student separates $V = R(s)\Psi(\phi)$ but picks $\Psi'' = +k^2\Psi$ for a problem where the region is the full circle around the axis. What goes wrong?`,
        [md`Nothing: the sign of the separation constant is a free choice`,
          md`The radial solutions become $s^{\pm k}$ instead of $\cos$ and $\sin$`,
          md`$\Psi$ would blow up at $\phi = 0$`,
          md`$\Psi = Ae^{k\phi} + Be^{-k\phi}$ can't satisfy $\Psi(\phi + 2\pi) = \Psi(\phi)$ unless $k = 0$, so the only solutions left are trivial`],
        3,
        [md`The sign is a free choice only in the sense that the wrong one leaves you with no useful solutions. The boundary conditions decide it.`,
          md`With $+k^2$ for $\Psi$ the radial equation gets $-k^2$, and the radial solutions become $\cos(k\ln s)$ and $\sin(k\ln s)$, not powers. And the real problem is the periodicity.`,
          md`$e^{\pm k\phi}$ is finite at $\phi = 0$. The failure is that it never comes back to its starting value.`,
          null],
        md`A full turn returns you to the same point, so $V(s,\phi+2\pi) = V(s,\phi)$. Exponentials grow or decay monotonically and never repeat. Only the oscillating choice $\Psi'' = -k^2\Psi$ works. (The opposite choice is not useless in general: in a sector whose *arcs* are grounded and whose *wall* is live, the radial direction carries the two zeros and gets $\sin(k\ln s)$. That is the hard variant in the next lesson.)`,
        { figHtml: cyl({ R: 50, lab: [['V(R,\\phi)', 40]], phi: 130, phiR: 18 }) }),

      Q(md`Check one radial solution: is $R(s) = s^{-3}$ a solution of $s\dfrac{d}{ds}\!\left(s\dfrac{dR}{ds}\right) = k^2R$, and for which $k$?`,
        [md`Yes, for $k = -3$ only`, md`No, only positive powers solve it`, md`Yes, for $k = 9$`, md`Yes, for $k = 3$`],
        3,
        [md`$k$ enters only as $k^2$, so $k = 3$ and $k = -3$ are the same equation. By convention $k > 0$ and the two solutions are $s^{k}$ and $s^{-k}$.`,
          md`$s\frac{d}{ds}\left(s\cdot(-3)s^{-4}\right) = s\frac{d}{ds}\left(-3s^{-3}\right) = 9s^{-3}$. Negative powers work.`,
          md`$\lambda^2 = k^2$ with $\lambda = -3$ gives $k^2 = 9$, so $k = 3$, not $9$.`,
          null],
        md`$s\,\frac{dR}{ds} = -3s^{-3}$, then $s\,\frac{d}{ds}(-3s^{-3}) = 9s^{-3} = 3^2\,s^{-3}$. So $s^{-3}$ is the decaying partner of $s^3$ for $k = 3$.`,
        { nofig: 'pure algebra on the radial ODE' }),

      Q(md`Which of these is **not** a solution of Laplace's equation in plane polar coordinates?`,
        [md`$s^2\cos2\phi$`, md`$s^2\cos\phi$`, md`$\dfrac{\sin\phi}{s}$`, md`$\ln s$`],
        1,
        [md`The power and the angular frequency match: $s^{k}\cos k\phi$ with $k = 2$. It is $x^2 - y^2$, a harmonic polynomial.`,
          null,
          md`$s^{-1}\sin\phi$ is $s^{-k}\sin k\phi$ with $k = 1$, the 2-D dipole. It solves Laplace wherever $s \ne 0$.`,
          md`$\ln s$ is the $k = 0$ radial solution: $\frac1s\frac{d}{ds}\left(s\cdot\frac1s\right) = 0$.`],
        md`The power of $s$ and the angular frequency must match: $s^{\pm k}$ goes with $\cos k\phi$ and $\sin k\phi$. For $s^2\cos\phi$ the radial part gives $\frac1s\partial_s(s\cdot2s\cos\phi) = 4\cos\phi$ and the angular part gives $\frac{1}{s^2}\partial_\phi^2(s^2\cos\phi) = -\cos\phi$, so $\nabla^2V = 3\cos\phi \ne 0$. A mismatched pair means you forgot that both separated equations share the same $k$.`,
        { nofig: 'pure algebra: which functions are harmonic' }),

      Q(md`Write $s^2\cos2\phi$ in Cartesian coordinates.`,
        [md`$x^2 + y^2$`, md`$2xy$`, md`$x^2 - y^2$`, md`$x^2$`],
        2,
        [md`$x^2 + y^2 = s^2$ has no angular part, and $\nabla^2(x^2+y^2) = 4 \ne 0$: it is not harmonic.`,
          md`$2xy = s^2\sin2\phi$, the sine partner.`,
          null,
          md`$\nabla^2 x^2 = 2 \ne 0$. And $x^2 = s^2\cos^2\phi$ contains a $k = 0$ piece.`],
        md`$s^2\cos2\phi = s^2(\cos^2\phi - \sin^2\phi) = x^2 - y^2$. The inside solutions $s^k\cos k\phi$ and $s^k\sin k\phi$ are the real and imaginary parts of $(x + iy)^k$: $x$, $y$, $x^2 - y^2$, $2xy$, ... Seeing them as polynomials tells you at once that they are smooth on the axis, which is why the inside of a pipe keeps $s^{+k}$.`,
        { nofig: 'pure algebra: coordinate conversion' }),

      RF(md`
        ### The $k = 0$ solutions: $\ln s$ and $\phi$

        For $k = 0$ the power trick gives $s^0$ twice, one solution short. Solve directly:

        - Angle: $\Psi'' = 0 \Rightarrow \Psi = A + B\phi$.
        - Radius: $s\,\frac{d}{ds}\!\left(s\frac{dR}{ds}\right) = 0 \Rightarrow s\frac{dR}{ds} = D \Rightarrow R = C + D\ln s$.

        You have met $\ln s$ before: the potential of an infinite line charge is $V = -\dfrac{\lambda}{2\pi\varepsilon_0}\ln s + \text{const}$. So **a $\ln s$ term means net charge on the axis** (or on a conductor around it), with $\lambda = -2\pi\varepsilon_0\times(\text{coefficient of }\ln s)$. The $\phi$ term is a potential that climbs linearly with angle: $V = V_0\phi/\alpha$ is exactly what you get between two metal walls held at $0$ and $V_0$ that meet along the axis.

        The $k = 0$ product is $(A + B\phi)(C + D\ln s)$, which contains $1$, $\ln s$, $\phi$ and $\phi\ln s$. All four solve Laplace's equation.

        ### The general solution (Griffiths Prob. 3.24)

        When the region goes **all the way around** the axis, the point $(s,\phi + 2\pi)$ is the point $(s,\phi)$, so $V$ must be single-valued: $V(s,\phi+2\pi) = V(s,\phi)$. That forces $k$ to be an integer and kills $\phi$ and $\phi\ln s$. What remains is
        $$V(s,\phi) = a_0 + b_0\ln s + \sum_{k=1}^{\infty}\Big[s^{k}\left(a_k\cos k\phi + b_k\sin k\phi\right) + s^{-k}\left(c_k\cos k\phi + d_k\sin k\phi\right)\Big].$$

        !!key Read the general solution term by term
          - $a_0$: a constant (the average value of $V$ on any circle, in a region with no $\ln s$).
          - $b_0\ln s$: net line charge $\lambda = -2\pi\varepsilon_0 b_0$ inside the circle.
          - $s\cos\phi = x$ and $s\sin\phi = y$: a **uniform field**. $-E_0 s\cos\phi$ is the field $E_0\,\hat{\mathbf x}$.
          - $s^{-1}\cos\phi$: a **2-D dipole** (two opposite line charges close together).
          - Higher $k$: higher multipoles in 2-D, falling off as $s^{-k}$ outside or growing as $s^k$ inside.
      `),

      Q(md`Outside a long charged wire you find $V = 5 - 3\ln(s/s_0)$ (SI units, $V$ in volts). What is the charge per unit length on the wire?`,
        [md`$\lambda = -6\pi\varepsilon_0$`, md`$\lambda = 3$`, md`$\lambda = 6\pi\varepsilon_0$`, md`$\lambda = 10\pi\varepsilon_0$`],
        2,
        [md`Sign error. $V = -\dfrac{\lambda}{2\pi\varepsilon_0}\ln s$, so a coefficient of $-3$ means $\lambda/(2\pi\varepsilon_0) = +3$.`,
          md`The coefficient of $\ln s$ is $-\lambda/(2\pi\varepsilon_0)$, not $\lambda$. Units: $\lambda$ is C/m, the coefficient is volts.`,
          null,
          md`The constant $5$ is just the reference level. It carries no charge.`],
        md`Match $b_0\ln s$ with $-\dfrac{\lambda}{2\pi\varepsilon_0}\ln s$: $b_0 = -3$, so $\lambda = -2\pi\varepsilon_0 b_0 = 6\pi\varepsilon_0$ (in C/m when $V$ is in volts). Positive $\lambda$ makes $V$ fall with distance, as it should.`,
        { figHtml: cyl({ R: 20, axes: false, shell: true, lab: [['\\lambda', 45]], pts: [[70, 20, 's']] }) }),

      Q(md`In the general solution for a region that wraps all the way around the axis, why is there no $B\phi$ term?`,
        [md`$\phi$ does not satisfy Laplace's equation`,
          md`It would make $V$ infinite at $\phi = 2\pi$`,
          md`$V(s,\phi + 2\pi)$ would differ from $V(s,\phi)$ by $2\pi B$, but they are the same point`,
          md`It is absorbed into $a_0$`],
        2,
        [md`$\nabla^2\phi = \frac{1}{s^2}\frac{\partial^2\phi}{\partial\phi^2} = 0$. It is a perfectly good solution. It is just not single-valued.`,
          md`$B\cdot 2\pi$ is finite. The problem is that it differs from the value at $\phi = 0$, which is the same point in space.`,
          null,
          md`$a_0$ is a constant. $B\phi$ varies with angle, so it can't be absorbed.`],
        md`Going once around the axis brings you back to the same point, where $V$ has one value. $B\phi$ would jump by $2\pi B$. In a **wedge** the walls stop you from going around, so $B\phi$ is allowed there, and it is the only way to have the two walls at different potentials.`,
        { figHtml: cyl({ R: 50, lab: [['V(R,\\phi)', 40]], phi: 350, phiR: 18 }) }),

      Q(md`In a wedge $0<\phi<\alpha$ the $k = 0$ product $(A + B\phi)(C + D\ln s)$ contains a $\phi\ln s$ term. Is $\phi\ln s$ a solution of Laplace's equation?`,
        [md`Yes: $\frac1s\frac{\partial}{\partial s}\left(s\frac{\partial}{\partial s}\right)$ kills $\ln s$ and $\frac{\partial^2}{\partial\phi^2}$ kills $\phi$`,
          md`No: the product of two solutions is never a solution`,
          md`Only for $\alpha = \pi$`,
          md`No: $\ln s$ is only allowed when there is a line charge`],
        0,
        [null,
          md`Products of solutions are not solutions **in general**, but separated products $R(s)\Psi(\phi)$ with matching separation constants are, by construction.`,
          md`Laplace's equation is local. Whether $\phi\ln s$ solves it has nothing to do with the opening angle.`,
          md`$\ln s$ is a fine solution anywhere the origin is excluded. Its coefficient tells you about charge enclosed, but it solves Laplace either way.`],
        md`$\frac1s\partial_s(s\,\partial_s(\phi\ln s)) = \frac1s\partial_s(\phi) = 0$ and $\frac{1}{s^2}\partial_\phi^2(\phi\ln s) = 0$. It rarely appears in exam answers, but you should know it is there when the wedge walls are at different potentials **and** the potential varies along them like $\ln s$.`,
        { nofig: 'pure algebra on the k = 0 solutions' }),

      Q(md`Why do the $k = 0$ solutions have to be worked out separately?`,
        [md`For $k = 0$ the trial power gives $\lambda^2 = 0$, a double root: $s^0$ twice. The missing second solution is $\ln s$ (and $\phi$ for the angle)`,
          md`Because $k = 0$ is never allowed by the boundary conditions`,
          md`Because $\cos(0\cdot\phi) = 1$ does not solve the angular equation`,
          md`Because $\ln s$ is infinite at $s = 0$, so it must be handled with a limit`],
        0,
        [null,
          md`$k = 0$ is often essential: the coax ($a_0 + b_0\ln s$) and two plates at different potentials ($V_0\phi/\alpha$) are pure $k = 0$.`,
          md`$\Psi = 1$ does solve $\Psi'' = 0$. The trouble is that $\Psi'' = 0$ has a second solution, $\phi$, which $\cos$ and $\sin$ don't produce.`,
          md`Blowing up at the axis decides when you **drop** $\ln s$, not why it appears. It comes from solving $(sR')' = 0$.`],
        md`A second-order ODE needs two independent solutions. For $k\ne0$ they are $s^{k}$ and $s^{-k}$ (and $\cos k\phi$, $\sin k\phi$). At $k = 0$ both pairs collapse ($s^{\pm0} = 1$, $\sin 0 = 0$), so solve directly: $(sR')' = 0 \Rightarrow R = C + D\ln s$, and $\Psi'' = 0 \Rightarrow \Psi = A + B\phi$. Forgetting this case is the most common way to lose the coax or the two-plate answer.`,
        { nofig: 'about the ODE, not a geometry' }),

      Q(md`A student combines terms from different families and writes $V = \ln s\,\cos\phi$. Is it a solution of Laplace's equation?`,
        [md`Yes: $\ln s$ and $\cos\phi$ each appear in the general solution`,
          md`Yes, but only away from the axis`,
          md`No, because $\ln s$ is not allowed when the region wraps around`,
          md`No: $\ln s$ belongs to $k = 0$ and $\cos\phi$ to $k = 1$; the product leaves $\nabla^2 V = -\dfrac{\ln s\cos\phi}{s^2}$`],
        3,
        [md`Appearing in the general solution separately doesn't make every product a solution. Only $R_k(s)\Psi_k(\phi)$ with the **same** $k$ work.`,
          md`Away from the axis it still fails: $\nabla^2V = -\ln s\cos\phi/s^2 \ne 0$ at a generic point.`,
          md`$\ln s$ is single-valued and is allowed around a full circle (it carries net charge). The problem is the mismatch with $\cos\phi$.`,
          null],
        md`The radial part is $\frac1s\partial_s\left(s\cdot\frac{\cos\phi}{s}\right) = 0$, the angular part is $\frac{1}{s^2}\partial_\phi^2(\ln s\cos\phi) = -\frac{\ln s\cos\phi}{s^2}$. They don't cancel. Each separated product uses one $k$ for both factors: $1$ and $\ln s$ go with $1$ and $\phi$; $s^{\pm1}$ go with $\cos\phi$ and $\sin\phi$.`,
        { nofig: 'pure algebra on a trial function' }),

      RF(md`
        ### Who decides $k$? The region, or the walls

        **Full circle.** If the region wraps around the axis (a pipe, an annulus, everything outside a cylinder), single-valuedness forces $k = 1, 2, 3, \dots$, and the $\phi$ and $\phi\ln s$ terms are gone. You keep **both** $\cos k\phi$ and $\sin k\phi$, and the boundary function decides which appear.

        **Wedge.** If metal walls sit at $\phi = 0$ and $\phi = \alpha$, single-valuedness says nothing (you can't go around). The walls do the job instead. With both walls grounded:

        - $\Psi(0) = 0$ kills $\cos k\phi$;
        - $\Psi(\alpha) = 0$ needs $\sin k\alpha = 0$, so $k\alpha = n\pi$: $$k = \frac{n\pi}{\alpha},\qquad n = 1, 2, 3, \dots$$

        Now $k$ need not be an integer. A $60^\circ$ wedge ($\alpha = \pi/3$) has $k = 3, 6, 9, \dots$; a right-angle corner has $k = 2, 4, 6,\dots$; the outside of a right-angle metal corner ($\alpha = 3\pi/2$) has $k = \tfrac23, \tfrac43, 2, \dots$.

        [[fig:fw]]

        !!key Where each constraint comes from
          - Full circle: $k \in \{1,2,3,\dots\}$ from single-valuedness; $\cos$ and $\sin$ both kept; $\phi$ dropped.
          - Grounded walls at $0$ and $\alpha$: $\sin(n\pi\phi/\alpha)$ only; $k = n\pi/\alpha$.
          - Walls at **different** potentials: you need the $k = 0$ term $V_0\phi/\alpha$ as well (next lesson).
      `, { fw: { svg: FULLvsWEDGE.svg, cap: 'Single-valuedness quantizes $k$ on a full circle; the walls quantize it in a wedge.' } }),

      Q(md`A wedge has grounded metal walls at $\phi = 0$ and $\phi = \pi/3$. Which angular functions appear in the solution?`,
        [md`$\sin(n\phi)$, $n = 1, 2, 3, \dots$`,
          md`$\cos(3n\phi)$ and $\sin(3n\phi)$`,
          md`$\sin(n\pi\phi/3)$`,
          md`$\sin(3n\phi)$, $n = 1, 2, 3, \dots$`],
        3,
        [md`$\sin(n\phi)$ vanishes at $\phi = \pi/3$ only when $n$ is a multiple of $3$. Integer $k$ comes from going around a full circle, which a wedge doesn't do.`,
          md`$\cos$ is killed by the grounded wall at $\phi = 0$.`,
          md`Wrong formula: $k = n\pi/\alpha = n\pi/(\pi/3) = 3n$. $\sin(n\pi\phi/3)$ would vanish at $\phi = 3$, not $\pi/3$.`,
          null],
        md`$\Psi(0)=0$ kills $\cos$. $\sin(k\pi/3) = 0$ needs $k = 3n$. So $\sin 3\phi, \sin 6\phi, \dots$. Check: $\sin(3\cdot\pi/3) = \sin\pi = 0$.`,
        { figHtml: wedge({ al: 60, a: 0, b: 120, w0: 'V=0', wA: 'V=0', outer: 'V_0', O: false }) }),

      Q(md`The region is the whole plane **except** a grounded half-line (a thin metal sheet, seen edge-on) along $\phi = 0$. Think of it as a wedge of opening $\alpha = 2\pi$. Which $k$ are allowed?`,
        [md`$k = 1, 2, 3, \dots$ (integers, because the region goes all the way around)`,
          md`$k = \tfrac12, 1, \tfrac32, 2, \dots$`,
          md`$k = 2, 4, 6, \dots$`,
          md`Only $k = 0$`],
        1,
        [md`The sheet blocks the way around: you can't go from $\phi = 0^+$ to $\phi = 2\pi^-$ without crossing it. Single-valuedness is replaced by $V = 0$ on both faces of the sheet.`,
          null,
          md`That would be $\alpha = \pi/2$. Here $k = n\pi/(2\pi) = n/2$.`,
          md`$k = 0$ gives $A + B\phi$, which can't be zero at both $\phi = 0$ and $2\pi$ unless it is zero everywhere.`],
        md`$k = n\pi/\alpha = n/2$. The half-integer modes $\sin(\phi/2)$, $\sin(3\phi/2),\dots$ are new. Near the edge the lowest one dominates, $V \propto s^{1/2}\sin(\phi/2)$, so $E \propto s^{-1/2}$: the field **diverges** at a sharp edge. The next lesson shows why.`,
        { figHtml: SLIT }),

      Q(md`A half-annulus $a<s<b$, $0<\phi<\pi$: the flat edges (both halves of the diameter) and the inner arc are grounded, and the outer arc is at $V_0$. The allowed $k$ turn out to be integers. Why?`,
        [md`Because the region goes all the way around the axis`,
          md`Because the grounded walls at $\phi = 0$ and $\phi = \alpha = \pi$ give $k = n\pi/\alpha = n$`,
          md`Because every polar problem has integer $k$`,
          md`Because the outer arc is at a constant potential`],
        1,
        [md`It only goes halfway round. Single-valuedness plays no part here; the walls quantize $k$.`,
          null,
          md`A $60^\circ$ wedge has $k = 3, 6, 9, \dots$ and the outside of a right-angle edge has $k = \tfrac23, \tfrac43, \dots$ Integers are special.`,
          md`The arc's data fix the coefficients by Fourier's trick. They don't decide which $k$ are allowed.`],
        md`Same rule as every wedge: $\Psi(0) = 0$ kills $\cos k\phi$, and $\sin k\pi = 0$ gives $k = n$. The integers come from $\alpha = \pi$, not from going around. The difference shows in the angular functions: only $\sin n\phi$ here, while a full annulus keeps both $\cos n\phi$ and $\sin n\phi$.`,
        { figHtml: HALFANN }),

      Q(md`For a full pipe, a student tries the angular function $\cos(\phi/2)$. What goes wrong?`,
        [md`Nothing: $k = \tfrac12$ is allowed whenever the pipe is grounded`,
          md`$\cos(\phi/2)$ does not solve $\Psi'' = -k^2\Psi$`,
          md`$\cos\!\left(\dfrac{\phi + 2\pi}{2}\right) = -\cos\dfrac{\phi}{2}$: going once around flips the sign, so $V$ would have two values at the same point`,
          md`The radial partner $s^{1/2}$ blows up on the axis`],
        2,
        [md`Half-integer $k$ needs a cut: a grounded sheet you can't cross (the wedge of angle $2\pi$). A full pipe has no cut.`,
          md`It does solve it, with $k = \tfrac12$. The failure is periodicity, not the ODE.`,
          null,
          md`$s^{1/2} \to 0$ at the axis, which is finite. That isn't the issue.`],
        md`Around a full circle $V(s,\phi + 2\pi) = V(s,\phi)$, and $\cos k\phi$ satisfies this only for integer $k$. With $k = \tfrac12$ the potential would jump across the ray $\phi = 0$, which can't happen in empty space. Half-integers are right only when a grounded sheet along that ray makes it a boundary, as in the slit problem.`,
        { figHtml: cyl({ R: 50, lab: [['V(R,\\phi)', 40]], phi: 130, phiR: 18 }) }),

      Q(md`A pipe's surface is held at $V(R,\phi) = V_0$ for $0<\phi<\pi$ and $-V_0$ for $\pi<\phi<2\pi$ (two insulated halves). Which angular functions appear?`,
        [md`$\sin k\phi$ with $k = 1, 3, 5, \dots$ only`,
          md`$\cos k\phi$ with $k$ odd`,
          md`$\sin(k\phi/2)$`,
          md`All $\cos k\phi$ and $\sin k\phi$`],
        0,
        [null,
          md`The boundary function is odd about $\phi = 0$ (it flips sign under $\phi \to -\phi$), so its cosine coefficients vanish.`,
          md`The region wraps all the way around: $k$ must be an integer.`,
          md`All are *allowed*, but the coefficients of $\cos k\phi$ and of even-$k$ sines come out zero. The question asks which appear.`],
        md`$V(R,\phi)$ is odd under $\phi\to-\phi$, so no cosines; and $V(R,\phi+\pi) = -V(R,\phi)$, which only odd $k$ satisfy. So $\sin\phi, \sin 3\phi, \dots$ with coefficients $\dfrac{4V_0}{k\pi}$, like the slot. The cylinders lesson of this unit solves it.`,
        { figHtml: PIPE_HALF }),

      RF(md`
        ### Which radial powers survive

        The radial functions are $s^k$ and $s^{-k}$ (and $1$, $\ln s$ for $k=0$). The region decides which ones are allowed:

        [[fig:regions]]

        | region | contains | drop | keep |
        |---|---|---|---|
        | (A) inside a circle, or a pie slice with its tip | the axis $s = 0$ | $s^{-k}$ and $\ln s$ (infinite at $s = 0$) | $1$, $s^{k}$ |
        | (B) outside a circle, or a wedge out to infinity | $s \to \infty$ | $s^{k}$ (infinite far away), except $-E_0s\cos\phi$ when a uniform field is imposed | $1$, $\ln s$ if there's net charge, $s^{-k}$ |
        | (C) annulus, or a wedge between two arcs | neither | nothing | both $s^k$ and $s^{-k}$ (and $1$, $\ln s$) |

        !!trap Infinity in two dimensions
          In 3-D you set $V \to 0$ at infinity. In 2-D you can't if there is net charge per length: $\ln s$ grows without bound. If the problem says the object is neutral (or $V$ stays finite far away), $\ln s$ is dropped and $V \to a_0$, a constant. If the object carries $\lambda$, keep $b_0\ln s$ with $b_0 = -\lambda/(2\pi\varepsilon_0)$, and pick the reference point where the problem tells you to (often the surface).

        !!intuition Why $s^{-k}$ is "outside" and $s^k$ is "inside"
          Inside a circle the potential must be smooth at the center, and $s^k\cos k\phi$ is just a polynomial in $x$ and $y$ (for $k = 1$ it is $x$). Outside, the effect of the boundary pattern must fade with distance: $s^{-k}$. Higher $k$ means finer angular detail, and finer detail dies faster as you move away from the boundary, in both directions. Same story as $e^{-n\pi x/a}$ in the slot.
      `, { regions: { svg: REGIONS.svg, cap: 'The region decides which radial powers survive. The dot marks the axis $s = 0$.' } }),

      Q(md`The region is a pie slice $0 < s < b$, $0<\phi<\alpha$, with the tip of the slice (the axis) inside the region. Which radial functions do you keep for $k = n\pi/\alpha$?`,
        [md`$s^{-k}$ only`, md`Both $s^k$ and $s^{-k}$`, md`$\ln s$ only`, md`$s^{k}$ only`],
        3,
        [md`$s^{-k} \to \infty$ at the tip $s = 0$, which is part of the region.`,
          md`Both are kept only when the origin is excluded (an inner arc at $s = a$).`,
          md`$\ln s$ is the $k = 0$ radial function, and it also blows up at $s = 0$.`,
          null],
        md`The tip is in the region, $V$ is finite there, so $s^{-k}$ is out. This is the polar version of "inside a sphere, drop $r^{-(\ell+1)}$".`,
        { figHtml: wedge({ al: 60, a: 0, b: 140, w0: 'V=0', wA: 'V=0', outer: 'V_0', ticks: true }) }),

      Q(md`The region is the inside of a circle (the axis is in it). Which of the $k = 0$ functions $1$, $\ln s$, $\phi$, $\phi\ln s$ survive?`,
        [md`Only $1$`, md`$1$ and $\ln s$`, md`$1$ and $\phi$`, md`All four`],
        0,
        [null,
          md`$\ln s \to -\infty$ on the axis, which is in the region. (It would mean a line charge on the axis, and the region is empty.)`,
          md`$\phi$ is not single-valued around the full circle.`,
          md`$\phi$ and $\phi\ln s$ fail single-valuedness, and $\ln s$ and $\phi\ln s$ blow up on the axis.`],
        md`Two filters: the axis (finiteness) removes $\ln s$ and $\phi\ln s$; going around (single-valuedness) removes $\phi$ and $\phi\ln s$. Only the constant is left, which is why the center of a pipe sits at the average of its boundary values.`,
        { figHtml: region('disk') }),

      Q(md`The region is everything outside a circle of radius $R$, there is no net charge per length, and $V$ stays bounded far away. Which form is right?`,
        [md`$a_0 + b_0\ln s + \sum_k s^{k}(\dots)$`,
          md`$\sum_k s^{-k}(\dots)$, with $a_0 = 0$ necessarily`,
          md`$\sum_k (s^{k} + s^{-k})(\dots)$`,
          md`$a_0 + \sum_k s^{-k}\left(c_k\cos k\phi + d_k\sin k\phi\right)$`],
        3,
        [md`$s^k$ grows without bound far away, and $\ln s$ needs net charge. Both are out.`,
          md`In 2-D nothing forces $a_0 = 0$: a constant is a solution and stays bounded. A pipe at $V_0(2+\sin3\phi)$ has $V\to 2V_0$ far away.`,
          md`Keeping both powers is for an annulus. Here infinity is in the region.`,
          null],
        md`Infinity in the region kills $s^{k}$; no net charge kills $\ln s$ (its coefficient is $-\lambda/(2\pi\varepsilon_0)$); single-valuedness kills $\phi$. What remains is a constant plus decaying multipoles. If a uniform field is imposed, add the one allowed growing term $-E_0s\cos\phi$.`,
        { figHtml: region('ext') }),

      Q(md`A long wire carries charge $\lambda>0$ per unit length and nothing else is around. What does $V$ do as $s\to\infty$?`,
        [md`$V\to0$, as in 3-D`,
          md`$V\to$ a constant`,
          md`$V \approx -\dfrac{\lambda}{2\pi\varepsilon_0}\ln s + \text{const}$, which decreases without bound`,
          md`$V$ falls off like $1/s$`],
        2,
        [md`You can't set $V = 0$ at infinity in 2-D when $\lambda\ne0$: $\ln s$ never levels off.`,
          md`A constant far away means zero net charge per length. Gauss's law needs $E_s = \lambda/(2\pi\varepsilon_0s)$, whose integral is a logarithm.`,
          null,
          md`$1/s$ is the potential of a 2-D dipole ($k = 1$). The net-charge term is $k = 0$: $\ln s$.`],
        md`$E_s = \dfrac{\lambda}{2\pi\varepsilon_0s}$ integrates to $-\dfrac{\lambda}{2\pi\varepsilon_0}\ln s$. The reference point has to be at a finite distance (often the wire's surface). This is why the "infinity in the region" row of the table keeps $\ln s$ only when there is net charge.`,
        { figHtml: cyl({ R: 20, axes: false, shell: true, lab: [['\\lambda', 45]], pts: [[70, 20, 's']] }) }),

      Q(md`A wedge of opening $\alpha$ runs from an inner arc at $s = a$ out to infinity, with $V \to 0$ far away. Which radial function goes with $\sin(n\pi\phi/\alpha)$?`,
        [md`$s^{n\pi/\alpha}$`, md`$s^{n\pi/\alpha} - a^{2n\pi/\alpha}s^{-n\pi/\alpha}$`, md`$\ln(s/a)$`, md`$s^{-n\pi/\alpha}$`],
        3,
        [md`It grows without bound as $s \to \infty$, violating $V\to0$.`,
          md`That is the combination that **vanishes at $s = a$**, used when the inner arc is grounded and the region is bounded by an outer arc. Here the region goes to infinity.`,
          md`$\ln s$ belongs to $k = 0$, which grounded walls kill.`,
          null],
        md`Infinity is in the region and $V\to0$ there, so $s^{+k}$ is out. The inner arc's value $V(a,\phi)$ then fixes the coefficients of $s^{-k}$.`,
        { figHtml: wedge({ al: 90, a: 45, open: true, L: 140, w0: 'V=0', wA: 'V=0', inner: 'V(a,\\phi)', far: 'V\\to0' }) }),

      Q(md`An annulus $a < s < b$ has its inner surface grounded and its outer surface held at $V_0\cos\phi$. Which radial function goes with $\cos\phi$?`,
        [md`$s$`, md`$1/s$`, md`$s - \dfrac{a^2}{s}$`, md`$s + \dfrac{a^2}{s}$`],
        2,
        [md`$s\cos\phi$ alone is not zero at $s = a$. You need both powers because neither the axis nor infinity is in the region.`,
          md`$\cos\phi/s$ alone isn't zero at $s = a$ either.`,
          null,
          md`$s + a^2/s$ equals $2a$ at $s = a$, not $0$. Sign error.`],
        md`Keep both: $C s + D/s$. The grounded inner surface needs $Ca + D/a = 0$, so $D = -Ca^2$ and the combination is $s - a^2/s$. Then $V(b,\phi) = V_0\cos\phi$ fixes $C = V_0/(b - a^2/b)$.`,
        { figHtml: cyl({ R: 70, a: 30, aMetal: true, lab: [['V_0\\cos\\phi', 40]], aLab: [['V=0', 130]] }) }),

      Q(md`Outside a neutral cylinder, the general solution is $a_0 + b_0\ln s + \sum_k s^{-k}(c_k\cos k\phi + d_k\sin k\phi)$ (plus any imposed field). Which condition kills $b_0$?`,
        [md`$V$ finite at $s = 0$`,
          md`Zero net charge: by Gauss's law the coefficient of $\ln s$ is $-\lambda/(2\pi\varepsilon_0)$, and here $\lambda = 0$`,
          md`$V \to 0$ at infinity, which kills every term`,
          md`Single-valuedness`],
        1,
        [md`$s = 0$ is inside the cylinder, not in the region of interest.`,
          null,
          md`$V\to0$ does not kill every term: the $s^{-k}$ terms vanish at infinity anyway. And it is often not available: with an imposed field $V$ grows like $-E_0s\cos\phi$, and a neutral 2-D object can sit at a constant $a_0 \ne 0$.`,
          md`$\ln s$ is single-valued. Single-valuedness kills $\phi$, not $\ln s$.`],
        md`$b_0 = -\lambda/(2\pi\varepsilon_0)$ by Gauss's law: the $\ln s$ term carries all the net charge per length. Neutral cylinder: $b_0 = 0$.`,
        { figHtml: cyl({ R: 50, metal: true, lab: [['\\lambda=0', 40]] }) }),

      Q(md`An annulus $a<s<b$: you want $V(a,\phi) = V_1$ and $V(b,\phi) = V_2$ (both constants). Which terms of the general solution do you need?`,
        [md`$a_0$ and $b_0\ln s$`,
          md`$a_0$ only`,
          md`$s\cos\phi$ and $s^{-1}\cos\phi$`,
          md`$a_0$ and $B\phi$`],
        0,
        [null,
          md`A constant can match one value, not two.`,
          md`The boundary values don't depend on $\phi$, so every $k \ge 1$ coefficient vanishes by Fourier's trick.`,
          md`$\phi$ is not single-valued, and the boundary values don't depend on angle anyway.`],
        md`Only $k = 0$ survives: $V = a_0 + b_0\ln s$, the coaxial-cable potential. Two conditions, two constants. The worked example below does it.`,
        { figHtml: cyl({ R: 70, a: 30, aMetal: true, outerMetal: true, lab: [['V_2', 40]], aLab: [['V_1', 130]] }) }),

      RF(md`
        ### Reading the modes off the boundary data

        On a full circle you rarely need the Fourier integrals. Rewrite the boundary function as a sum of $\cos k\phi$ and $\sin k\phi$ with trig identities, or use its symmetries to see which coefficients vanish:

        - even in $\phi$ ($\phi\to-\phi$) ⇒ cosines only; odd ⇒ sines only;
        - unchanged under a half-turn ($\phi\to\phi+\pi$) ⇒ even $k$ only; sign flip under a half-turn ⇒ odd $k$ only;
        - nonzero average ⇒ a constant $a_0$.

        Each mode then gets its own radial power: $(s/R)^k$ inside, $(R/s)^k$ outside.
      `),

      Q(md`A pipe's surface is held at $V(R,\phi) = V_0\sin^2\phi$. Which terms appear in $V$ inside?`,
        [md`Only $k = 2$: $(s/R)^2\sin2\phi$`,
          md`A constant and $(s/R)^2\cos2\phi$`,
          md`$k = 1$ and $k = 2$`,
          md`A constant and all even $k$`],
        1,
        [md`$\sin^2\phi$ is not $\sin2\phi$. Use $\sin^2\phi = \tfrac12 - \tfrac12\cos2\phi$: a constant plus a **cosine**.`,
          null,
          md`$\sin^2\phi$ is unchanged by $\phi\to\phi+\pi$, so no odd $k$ can appear.`,
          md`The identity has exactly two terms. Fourier's trick gives zero for $k = 4, 6, \dots$`],
        md`$V_0\sin^2\phi = \tfrac{V_0}{2} - \tfrac{V_0}{2}\cos2\phi$, so $V_{\text{in}} = \tfrac{V_0}{2} - \tfrac{V_0}{2}\left(\tfrac sR\right)^2\cos2\phi$. Always try a trig identity before integrating: products and powers of $\sin$ and $\cos$ are finite Fourier sums.`,
        { figHtml: cyl({ R: 56, lab: [['V_0\\sin^2\\phi', 40]] }) }),

      Q(md`The pipe is held at $V(R,\phi) = V_0\cos^3\phi$. Which $k$ appear?`,
        [md`$k = 3$ only`, md`$k = 0$, $1$, $2$ and $3$`, md`All odd $k$`, md`$k = 1$ and $k = 3$`],
        3,
        [md`$\cos^3\phi$ is not $\cos3\phi$: $\cos^3\phi = \tfrac34\cos\phi + \tfrac14\cos3\phi$.`,
          md`$\cos^3\phi$ flips sign under $\phi\to\phi+\pi$, so even $k$ (including the constant) are absent.`,
          md`Odd-only is right, but the series stops: a cube of $\cos\phi$ contains nothing above $k = 3$.`,
          null],
        md`$\cos3\phi = 4\cos^3\phi - 3\cos\phi$, so $\cos^3\phi = \tfrac34\cos\phi + \tfrac14\cos3\phi$. Inside: $V_0\left[\tfrac34\tfrac sR\cos\phi + \tfrac14\left(\tfrac sR\right)^3\cos3\phi\right]$. Near the axis the $k = 1$ part wins, so the field there is uniform, $-\tfrac{3V_0}{4R}\hat{\mathbf x}$.`,
        { figHtml: cyl({ R: 56, lab: [['V_0\\cos^3\\phi', 40]] }) }),

      Q(md`The pipe is held at $V(R,\phi) = V_0\sin\phi\cos\phi$. What is $V$ inside?`,
        [md`$\dfrac{V_0}{2}\left(\dfrac sR\right)^2\sin2\phi$`, md`$V_0\dfrac sR\sin\phi\cos\phi$`, md`$\dfrac{V_0}{2}\,\dfrac sR\,\sin2\phi$`, md`$\dfrac{V_0}{2} + \dfrac{V_0}{2}\left(\dfrac sR\right)^2\cos2\phi$`],
        0,
        [null,
          md`Multiplying the boundary function by $s/R$ doesn't make a solution. The power must match the mode: $\sin\phi\cos\phi = \tfrac12\sin2\phi$ is $k = 2$, so it needs $(s/R)^2$.`,
          md`Right mode, wrong power: $k = 2$ goes with $s^2$.`,
          md`That is $V_0\cos^2\phi$. $\sin\phi\cos\phi$ has no constant part and is a sine.`],
        md`$\sin\phi\cos\phi = \tfrac12\sin2\phi$: one mode, $k = 2$ sine. Inside, $V = \tfrac{V_0}{2}(s/R)^2\sin2\phi = \tfrac{V_0}{R^2}xy$, a saddle. Outside it would be $\tfrac{V_0}{2}(R/s)^2\sin2\phi$.`,
        { figHtml: cyl({ R: 56, lab: [['V_0\\sin\\phi\\cos\\phi', 40]] }) }),

      Q(md`The pipe is held at $V(R,\phi) = V_0|\sin\phi|$. Which Fourier terms appear?`,
        [md`$\sin k\phi$ with odd $k$`, md`$k = 1$ only`, md`A constant and $\cos k\phi$ with even $k$`, md`All $\cos k\phi$ and $\sin k\phi$`],
        2,
        [md`$|\sin\phi|$ is even under $\phi\to-\phi$, so it has no sine terms at all.`,
          md`$|\sin\phi|$ is not $\sin\phi$: it is never negative, so it has a nonzero average, and it has kinks at $\phi = 0, \pi$ that one mode can't make.`,
          null,
          md`Two symmetries remove most of them: evenness in $\phi$ kills the sines, and $|\sin(\phi+\pi)| = |\sin\phi|$ kills odd $k$.`],
        md`Even in $\phi$ ⇒ cosines only. Unchanged under $\phi\to\phi+\pi$ ⇒ even $k$ only. The average is $\tfrac{2V_0}{\pi}$, so $V(R,\phi) = \tfrac{2V_0}{\pi} - \tfrac{4V_0}{\pi}\left(\tfrac{\cos2\phi}{3} + \tfrac{\cos4\phi}{15} + \dots\right)$. Reading the symmetries first tells you which integrals are zero before you do any.`,
        { figHtml: cyl({ R: 56, lab: [['V_0|\\sin\\phi|', 40]] }) }),

      Q(md`A pipe is split into two insulated halves: $V = V_0$ on the right half ($-\pi/2<\phi<\pi/2$) and $V = 0$ on the left half. Which terms appear?`,
        [md`$\sin k\phi$ with odd $k$, as for the $\pm V_0$ split`,
          md`$\cos k\phi$ with odd $k$, and no constant`,
          md`A constant and all $\cos k\phi$`,
          md`The constant $V_0/2$ and $\cos k\phi$ with odd $k$`],
        3,
        [md`These data are even in $\phi$ (the right half is symmetric about the $x$-axis), so no sines. The $\pm V_0$ split was odd.`,
          md`The average is $V_0/2$, not zero. You need the constant.`,
          md`$V - V_0/2$ flips sign under $\phi\to\phi+\pi$, so the even $k\ge2$ vanish.`,
          null],
        md`Write $V = \tfrac{V_0}{2} + \left(V - \tfrac{V_0}{2}\right)$. The second piece is $\pm V_0/2$: even in $\phi$ (cosines) and odd under a half-turn (odd $k$). Fourier gives $A_k = \tfrac{2V_0}{k\pi}\sin\tfrac{k\pi}{2}$: $\tfrac{2V_0}{\pi}$, $-\tfrac{2V_0}{3\pi}$, $\tfrac{2V_0}{5\pi}$, ...`,
        { figHtml: RHALF }),

      Q(md`A pipe is held at $V_0(\cos\phi + \cos2\phi)$. Close to the axis, which part controls the field?`,
        [md`The $\cos2\phi$ part, because higher modes have more structure`,
          md`The $\cos\phi$ part: it goes as $s/R$, while the $\cos2\phi$ part goes as $(s/R)^2$, which is much smaller near the axis`,
          md`Both equally, since they have the same amplitude on the pipe`,
          md`Neither: the field is zero on the axis`],
        1,
        [md`Higher modes are **weaker** inside: each extra power of $s/R$ suppresses them more toward the axis.`,
          null,
          md`Equal on the pipe, but inside they scale differently: $s/R$ versus $(s/R)^2$.`,
          md`The $k = 1$ term gives a uniform field $-\tfrac{V_0}{R}\hat{\mathbf x}$, which is nonzero on the axis.`],
        md`$V_{\text{in}} = V_0\left[\tfrac sR\cos\phi + \left(\tfrac sR\right)^2\cos2\phi\right]$. Near the axis the field is the uniform $k = 1$ field, $-\tfrac{V_0}{R}\hat{\mathbf x}$, plus a correction proportional to $s$. Far outside the same ordering holds: $R/s$ beats $(R/s)^2$. The lowest mode present always dominates far from the boundary that drives it.`,
        { figHtml: cyl({ R: 56, lab: [['V_0(\\cos\\phi+\\cos2\\phi)', 40]] }) }),

      Q(md`Inside a pipe, $V = 3 + 2\dfrac sR\cos\phi - \left(\dfrac sR\right)^2\sin2\phi$ (in volts). What is the average of $V$ around the circle $s = R/2$?`,
        [md`$3$ V`, md`$4$ V`, md`$3.75$ V`, md`It depends on where you start on the circle`],
        0,
        [null,
          md`That adds the $k = 1$ amplitude at $s = R/2$. Every $\cos k\phi$ and $\sin k\phi$ averages to zero around a full circle.`,
          md`The $k = 2$ term averages to zero too; only the constant survives the average.`,
          md`An average over a full circle doesn't depend on the starting point.`],
        md`$\frac{1}{2\pi}\oint\cos k\phi\,d\phi = 0$ for $k \ge 1$, so the average on any circle $s<R$ is $a_0 = 3$ V, the value at the center. In a charge-free region with no $\ln s$ term, the average on a circle doesn't depend on its radius: the 2-D mean-value property.`,
        { figHtml: CIRC_HALF }),

      RF(md`
        ### The same logic in three coordinate systems

        [[fig:cmp]]

        Separation of variables always runs the same way: product ansatz, two ODEs, choose the sign of the constant so the direction with two homogeneous conditions oscillates, then let each boundary condition do one job.

        | | Cartesian (slot) | Polar (pipe, wedge) | Spherical (azimuthal symmetry) |
        |---|---|---|---|
        | ansatz | $X(x)Y(y)$ | $R(s)\Psi(\phi)$ | $R(r)P_\ell(\cos\theta)$ |
        | oscillating factor | $\sin ky$, $\cos ky$ | $\sin k\phi$, $\cos k\phi$ | $P_\ell(\cos\theta)$ |
        | other factor | $e^{\pm kx}$, $\sinh$, $\cosh$ | $s^{k}$, $s^{-k}$ | $r^\ell$, $r^{-(\ell+1)}$ |
        | constant $= 0$ case | $a + bx$, $c + dy$ | $\ln s$, $\phi$ | none new ($\ell = 0$: $1$ and $1/r$) |
        | what quantizes | two plates: $k = n\pi/a$ | full circle: $k\in\mathbb Z$; walls: $k = n\pi/\alpha$ | regularity at $\theta = 0,\pi$: integer $\ell$ |
        | orthogonality | $\int_0^a \sin\sin\,dy = \frac a2\delta$ | $\int_0^{\alpha}\sin\sin\,d\phi = \frac{\alpha}{2}\delta$; $\int_0^{2\pi}\cos\cos\,d\phi = \pi\delta$ | $\int_0^\pi P_\ell P_{\ell'}\sin\theta\,d\theta = \frac{2}{2\ell+1}\delta$ |
        | "far away" kills | $e^{+kx}$ | $s^{k}$ | $r^{\ell}$ |
        | "origin in region" kills | (n/a) | $s^{-k}$, $\ln s$ | $r^{-(\ell+1)}$ |

        !!key The pattern
          The oscillating functions live along the boundary where the potential is **given**; the growing/decaying pair lives in the direction **away from** that boundary. The polar case is the slot wrapped around a corner: the angle plays the part of $y$, and $\ln s$ plays the part of $x$ (indeed $s^{\pm k} = e^{\pm k\ln s}$).
      `, { cmp: { svg: COMPARE.svg, cap: 'Three geometries, one method.' } }),

      Q(md`In the slot, $V \propto e^{-n\pi x/a}\sin(n\pi y/a)$. In a pie slice, $V \propto s^{n\pi/\alpha}\sin(n\pi\phi/\alpha)$. What plays the role of $x$ in the polar problem?`,
        [md`$s$`, md`$\phi$`, md`$-\ln s$ (distance from the live arc, measured logarithmically)`, md`$s^2$`],
        2,
        [md`$V$ depends on $s$ as a power, not as an exponential. Write $s^k = e^{k\ln s}$ to see the match.`,
          md`$\phi$ plays the part of $y$: it is the direction with the two grounded walls, where the sines live.`,
          null,
          md`No: the exponent is $k\ln s$, not $ks^2$.`],
        md`$s^{k} = e^{k\ln s} = e^{-k(\ln b - \ln s)}\,b^k$. The mode decays exponentially in $\ln(b/s)$, the "logarithmic distance" from the live arc at $s = b$, just as the slot modes decay in $x$. This is why polar coordinates feel like a slot bent around the corner.`,
        { figHtml: PF.row([{ svg: miniSlot(), cap: 'slot' }, { svg: wedge({ al: 55, a: 0, b: 110, w0: 'V=0', wA: 'V=0', outer: 'V_0', O: false }), cap: 'pie slice' }]).svg }),

      Q(md`A Cartesian slot needs $\sinh$ and $\cosh$ when it is closed at both ends ($0 < x < b$). What is the polar analog?`,
        [md`A wedge closed by arcs at $s = a$ and $s = b$, which keeps both $s^k$ and $s^{-k}$`,
          md`A pie slice with its tip in the region`,
          md`A full circle`,
          md`A wedge out to infinity`],
        0,
        [null,
          md`The tip kills $s^{-k}$, like $x\to\infty$ killing $e^{kx}$: that is the semi-infinite slot.`,
          md`A full circle changes the angular quantization, not which radial powers you keep.`,
          md`Infinity kills $s^{k}$: again the semi-infinite case.`],
        md`Two radial boundaries means two radial conditions, so you need both independent solutions. The combination $(s/a)^k - (a/s)^k$ that vanishes at $s = a$ is the polar version of $\sinh k(x)$, vanishing at $x = 0$. In fact $(s/a)^k - (a/s)^k = 2\sinh(k\ln(s/a))$.`,
        { figHtml: wedge({ al: 55, a: 45, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0' }) }),

      Q(md`Substitute $u = \ln s$ (so $s\,\dfrac{d}{ds} = \dfrac{d}{du}$) into the radial equation $s\dfrac{d}{ds}\!\left(s\dfrac{dR}{ds}\right) = k^2R$. What do you get?`,
        [md`$\dfrac{d^2R}{du^2} = k^2R$`, md`$\dfrac{d^2R}{du^2} = -k^2R$`, md`$\dfrac{d^2R}{du^2} + \dfrac{dR}{du} = k^2R$`, md`$\dfrac{dR}{du} = kR$`],
        0,
        [null,
          md`The sign stays: the radial equation has $+k^2$. With $-k^2$ you would get $\cos(k\ln s)$, the case where the radial direction oscillates.`,
          md`That is what the **spherical** operator $\frac{d}{dr}\left(r^2\frac{dR}{dr}\right)$ becomes with $u = \ln r$. The extra first derivative is why its roots are $\ell$ and $-(\ell+1)$.`,
          md`The equation is second order; $s\frac{d}{ds}$ appears twice.`],
        md`$s\frac{d}{ds}$ is exactly $\frac{d}{du}$, so $s\frac{d}{ds}\left(s\frac{dR}{ds}\right) = \frac{d^2R}{du^2}$. The radial equation is the slot's $X'' = k^2X$ in the variable $\ln s$. So $R = e^{\pm ku} = s^{\pm k}$, or equally $\cosh(k\ln s)$ and $\sinh(k\ln s)$. Every slot trick ($\sinh$ that vanishes at one end, $\cosh$ symmetric about the middle) has a polar twin with $x \to \ln s$.`,
        { nofig: 'change of variable in the radial ODE' }),

      Q(md`The $k\ne0$ radial solution $\dfrac{\sinh(k\ln s)}{k} = \dfrac{s^k - s^{-k}}{2k}$ is perfectly good for any $k>0$. What does it become as $k\to0$?`,
        [md`$0$`, md`$1$`, md`$\ln s$`, md`$s$`],
        2,
        [md`The numerator goes to $0$, but so does the denominator $2k$. Expand before taking the limit.`,
          md`That is the limit of $\cosh(k\ln s)$, the other solution.`,
          null,
          md`$s$ is not a $k = 0$ solution at all: $s\frac{d}{ds}\left(s\cdot1\right) = s \ne 0$.`],
        md`$s^{\pm k} = e^{\pm k\ln s} \approx 1 \pm k\ln s$, so $\frac{s^k - s^{-k}}{2k} \to \ln s$, just as $\frac{\sinh kx}{k} \to x$. The $\ln s$ that the power trick seemed to miss is the limit of the $\sinh$-type combination: the $k = 0$ case is not an exception but the end of the family.`,
        { nofig: 'a limit of the radial functions' }),

      Q(md`For the sphere the radial solutions are $r^\ell$ and $r^{-(\ell+1)}$, not $r^{\pm\ell}$. Why the asymmetry, when polar gives the symmetric $s^{\pm k}$?`,
        [md`Spheres have a different charge distribution`,
          md`It is a convention; $r^{-\ell}$ works too`,
          md`Because $P_\ell$ is not periodic`,
          md`The spherical radial operator $\frac{d}{dr}(r^2\frac{d}{dr})$ gives $\lambda(\lambda+1) = \ell(\ell+1)$, whose roots are $\ell$ and $-\ell-1$`],
        3,
        [md`The radial solutions are properties of the differential operator, not of any charge distribution.`,
          md`Try it: $\frac{d}{dr}(r^2\cdot(-\ell)r^{-\ell-1}) = \ell(\ell-1)r^{-\ell}$, not $\ell(\ell+1)r^{-\ell}$.`,
          md`Periodicity affects the angular functions, not the radial roots.`,
          null],
        md`$r^2$ inside the derivative (from the area $4\pi r^2$ growing) shifts the roots. In polar the circumference grows like $s$, giving $s\frac{d}{ds}(s\frac{d}{ds})$ and symmetric roots $\pm k$. Monopoles show the same thing: $1/r$ in 3-D, $\ln s$ in 2-D.`,
        { nofig: 'compares two ODEs' }),

      RF(md`
        ### Worked example: the coaxial cable ($k = 0$ only)

        A long metal wire of radius $a$ is held at $V_0$; a grounded metal tube of inner radius $b$ surrounds it. Find $V$ between them.

        [[fig:coax]]

        **Region:** $a < s < b$, all $\phi$. No charge there, so Laplace.

        **Boundary conditions:**
        1. $V(a,\phi) = V_0$
        2. $V(b,\phi) = 0$

        **Which terms.** The region wraps around, so integer $k$ and no $\phi$ term. Neither BC depends on $\phi$; Fourier's trick on either circle gives zero for every $k\ge1$ coefficient. Left: $V = a_0 + b_0\ln s$.

        **Apply.** BC 2: $a_0 = -b_0\ln b$, so $V = b_0\ln(s/b)$. BC 1: $b_0\ln(a/b) = V_0$. So
        $$V(s) = V_0\,\frac{\ln(b/s)}{\ln(b/a)} .$$

        **Check.** $V(a) = V_0$, $V(b) = \ln 1 = 0$. The field is $E_s = -\dfrac{dV}{ds} = \dfrac{V_0}{s\ln(b/a)}$, which is $\dfrac{\lambda}{2\pi\varepsilon_0 s}$ with $\lambda = \dfrac{2\pi\varepsilon_0V_0}{\ln(b/a)}$ on the wire, the formula-sheet line-charge field. The capacitance per length is $\lambda/V_0 = 2\pi\varepsilon_0/\ln(b/a)$.
      `, { coax: { svg: COAX, cap: 'Coaxial cable: wire of radius $a$ at $V_0$, grounded tube of radius $b$.' } }),

      P({
        title: 'Coax with the outer conductor live',
        q: md`Same geometry, but now the wire ($s = a$) is grounded and the outer tube ($s = b$) is held at $V_1$. Find $V(s)$ for $a<s<b$, the surface charge on the wire, and the charge per unit length on the wire.`,
        figHtml: COAX2,
        hints: [md`Nothing depends on $\phi$, so only the $k = 0$ terms $a_0 + b_0\ln s$ survive.`,
          md`Write the two BCs: $V(a) = 0$, $V(b) = V_1$. Two equations, two unknowns.`,
          md`For a conductor, $\sigma = \varepsilon_0 E_n$ with $\hat n$ pointing out of the metal into the region: here $+\hat{\mathbf s}$ on the wire.`],
        parts: [
          { lbl: md`$V(s)$`, expr: 'V1*ln(s/a)/ln(b/a)', vars: { V1: [1, 3], s: [1.2, 1.8], a: [0.5, 1], b: [2, 3] }, accepts: ['V1*(ln(s)-ln(a))/(ln(b)-ln(a))'] },
          { lbl: md`$\sigma$ on the surface of the wire`, expr: '-eps0*V1/(a*ln(b/a))', vars: { eps0: [0.5, 2], V1: [1, 3], a: [0.5, 1], b: [2, 3] } },
          { lbl: md`Charge per unit length on the wire, $\lambda_a$`, expr: '-2*pi*eps0*V1/ln(b/a)', vars: { eps0: [0.5, 2], V1: [1, 3], a: [0.5, 1], b: [2, 3] } },
        ],
        sol: md`
          **Region** $a<s<b$. **BCs:** (1) $V(a,\phi) = 0$; (2) $V(b,\phi) = V_1$. No $\phi$-dependence, so $V = a_0 + b_0\ln s$.

          BC 1: $a_0 = -b_0\ln a$, so $V = b_0\ln(s/a)$. BC 2: $b_0\ln(b/a) = V_1$.
          $$V(s) = V_1\,\frac{\ln(s/a)}{\ln(b/a)}.$$

          **Wire.** $E_s = -\dfrac{dV}{ds} = -\dfrac{V_1}{s\ln(b/a)}$. On the wire the normal out of the metal is $+\hat{\mathbf s}$, so
          $$\sigma_a = \varepsilon_0E_s(a) = -\frac{\varepsilon_0V_1}{a\ln(b/a)}, \qquad \lambda_a = 2\pi a\,\sigma_a = -\frac{2\pi\varepsilon_0V_1}{\ln(b/a)} .$$

          **Checks.** For $V_1 > 0$ the field points inward, toward the lower potential, so the wire is negative. Compare the example: swapping which conductor is live flips the sign of $\lambda_a$ and swaps $\ln(b/s)\leftrightarrow\ln(s/a)$. And $b_0 = V_1/\ln(b/a)$ matches $b_0 = -\lambda_a/(2\pi\varepsilon_0)$: the $\ln s$ coefficient reports the charge inside.
        `,
      }),

      P({
        title: 'Annulus with a constant and a cosine (Kou-level)', big: true,
        q: md`A metal rod of radius $a$ is held at $V_0$. It is surrounded by a thin cylindrical shell of radius $b$, made of insulated strips, whose potential is $V(b,\phi) = V_0\cos\phi$. Nothing depends on $z$.

          (a) Write the region and the boundary conditions. (b) Which terms of the general solution survive? (c) Find $V(s,\phi)$ for $a<s<b$. (d) Evaluate $V$ for $b = 2a$ at $s = 1.5a$, $\phi = 0$ and at $s = 1.5a$, $\phi = \pi$, in units of $V_0$.`,
        figHtml: ANNULUS,
        hints: [md`Region $a<s<b$, full circle: integer $k$, both $s^k$ and $s^{-k}$, plus $a_0 + b_0\ln s$.`,
          md`Fourier's trick on either circle: the inner BC has only a $k = 0$ part, the outer BC has only $k = 0$ (zero average) and $k = 1$ cosine parts. So only $k = 0$ and $k = 1$ (cosine) survive.`,
          md`Superpose two easy problems: (i) inner $V_0$, outer $0$ (the coax example); (ii) inner $0$, outer $V_0\cos\phi$ (the $s - a^2/s$ combination).`],
        parts: [
          { lbl: md`Which terms survive?`, mc: [md`$a_0 + b_0\ln s + (c_1 s + d_1 s^{-1})\cos\phi$`, md`$a_0 + c_1 s\cos\phi$`, md`$b_0\ln s + d_1 s^{-1}\cos\phi$`, md`$a_0 + b_0\ln s + \sum_k (c_ks^k + d_ks^{-k})\cos k\phi$ with all $k$ nonzero`], a: 0,
            why: [null, md`One constant can't give $V_0$ on the inner circle **and** zero average on the outer one; and $s\cos\phi$ alone can't vanish at $s = a$.`, md`You need a constant: $\ln s$ alone is zero only at $s = 1$, in whatever units.`, md`Fourier's trick on both circles gives zero for every $k \ge 2$: the boundary data contain no $\cos 2\phi$, $\cos 3\phi, \dots$`] },
          { lbl: md`$V(s,\phi)$`, expr: 'V0*ln(b/s)/ln(b/a) + V0*cos(phi)*(s - a^2/s)/(b - a^2/b)', vars: { V0: [1, 2], s: [1.2, 1.8], phi: [0, 3], a: [0.5, 1], b: [2, 3] }, accepts: ['V0*(ln(b)-ln(s))/(ln(b)-ln(a)) + V0*b*cos(phi)*(s^2-a^2)/(s*(b^2-a^2))'] },
          { lbl: md`$V(1.5a, 0)/V_0$ for $b = 2a$`, ans: 0.97059, unit: '' },
          { lbl: md`$V(1.5a, \pi)/V_0$ for $b = 2a$`, ans: -0.14052, unit: '' },
        ],
        sol: md`
          **(a) Region:** $a<s<b$, all $\phi$; no charge, so $\nabla^2V = 0$.

          **BCs:**
          1. $V(a,\phi) = V_0$ (the rod)
          2. $V(b,\phi) = V_0\cos\phi$ (the shell)

          **(b)** Full circle: $k$ integer, no $\phi$ term. Neither the axis nor infinity is in the region, so keep $s^{k}$, $s^{-k}$, $1$ and $\ln s$. Fourier's trick on each circle: the data have a $k = 0$ part (BC 1: $V_0$; BC 2: $0$) and a $\cos\phi$ part (BC 1: $0$; BC 2: $V_0$). Every other coefficient vanishes. So
          $$V = a_0 + b_0\ln s + \left(c_1 s + \frac{d_1}{s}\right)\cos\phi .$$

          **(c)** Match the two pieces separately (they are orthogonal on each circle).

          $k = 0$: $a_0 + b_0\ln a = V_0$ and $a_0 + b_0\ln b = 0$ give $V_0\dfrac{\ln(b/s)}{\ln(b/a)}$.

          $k = 1$: $c_1a + d_1/a = 0$ and $c_1b + d_1/b = V_0$ give $d_1 = -c_1a^2$ and $c_1 = \dfrac{V_0}{b - a^2/b}$.
          $$V(s,\phi) = V_0\,\frac{\ln(b/s)}{\ln(b/a)} + V_0\,\frac{s - a^2/s}{b - a^2/b}\cos\phi .$$

          **(d)** $b = 2a$, $s = 1.5a$: $\dfrac{\ln(4/3)}{\ln 2} = 0.4150$ and $\dfrac{1.5 - 1/1.5}{2 - 0.5} = 0.5556$. So $V(1.5a,0) = 0.4150 + 0.5556 = 0.9706\,V_0$ and $V(1.5a,\pi) = 0.4150 - 0.5556 = -0.1405\,V_0$.

          **Checks.** At $s = a$: $\ln(b/a)/\ln(b/a) = 1$ and $a - a^2/a = 0$, so $V = V_0$ for every $\phi$. At $s = b$: $0 + V_0\cos\phi$. Both BCs hold. Each BC fixed exactly two constants: that is why the annulus needs both radial powers.

          **What to remember.** With a constant and a $\cos\phi$ on the boundaries, solve the $k = 0$ problem and the $k = 1$ problem separately and add. Never mix the $\ln s$ part into the $k = 1$ part.
        `,
      }),

      P({
        title: 'The separation, step by step (exam style)', big: true,
        q: md`Laplace's equation in plane polar coordinates with no $z$-dependence is $\dfrac1s\dfrac{\partial}{\partial s}\!\left(s\dfrac{\partial V}{\partial s}\right) + \dfrac{1}{s^2}\dfrac{\partial^2V}{\partial\phi^2} = 0$. Answer the steps of the derivation the way the exam grades them (one point each).`,
        figHtml: fPolar(),
        hints: [md`Multiply by $s^2/(R\Psi)$ to separate.`, md`The angle oscillates. The radial equation is equidimensional: try $s^\lambda$.`],
        parts: [
          { lbl: md`After substituting $V = R(s)\Psi(\phi)$, you multiply the equation by`, mc: [md`$\dfrac{1}{R\Psi}$`, md`$\dfrac{s^2}{R\Psi}$`, md`$s^2$`, md`$\dfrac{s}{R\Psi}$`], a: 1,
            why: [md`Then the angular term still carries $1/s^2$, so it isn't a function of $\phi$ alone.`, null, md`Without dividing by $R\Psi$ the terms still mix $s$ and $\phi$.`, md`One factor of $s$ short: the angular term keeps a $1/s$.`] },
          { lbl: md`The angular equation is`, mc: [md`$\Psi'' = k^2\Psi$`, md`$\Psi'' = -k^2\Psi$`, md`$\Psi'' = -k(k+1)\Psi$`, md`$\Psi' = -k\Psi$`], a: 1,
            why: [md`Exponentials can't be periodic or vanish on two walls.`, null, md`That is the spherical pattern for the radial part.`, md`The equation is second order.`] },
          { lbl: md`For $k \ne 0$ the radial solutions are`, mc: [md`$s^{k}$ and $s^{-(k+1)}$`, md`$e^{ks}$ and $e^{-ks}$`, md`$s^{k}$ and $s^{-k}$`, md`$\cos(ks)$ and $\sin(ks)$`], a: 2,
            why: [md`Spherical, not polar.`, md`Those solve $R'' = k^2R$, not the Euler equation.`, null, md`That would need a $-k^2$ on the radial side.`] },
          { lbl: md`For $k = 0$ the radial solutions are`, mc: [md`$1$ and $s$`, md`$1$ and $\ln s$`, md`$1$ and $1/s$`, md`$\ln s$ only`], a: 1,
            why: [md`$s\frac{d}{ds}(s\cdot 1) = s \ne 0$. $s$ is not a $k = 0$ solution.`, null, md`$1/s$ belongs to $k = 1$.`, md`Second-order equation: two solutions, $1$ and $\ln s$.`] },
        ],
        sol: md`
          Substitute $V = R\Psi$: $\dfrac{\Psi}{s}(sR')' + \dfrac{R}{s^2}\Psi'' = 0$. Multiply by $s^2/(R\Psi)$:
          $$\frac{s}{R}(sR')' + \frac{\Psi''}{\Psi} = 0 .$$
          First term depends only on $s$, second only on $\phi$; each is a constant. The angle must oscillate (periodic, or zero on two walls), so $\Psi'' = -k^2\Psi$, $\Psi = A\cos k\phi + B\sin k\phi$, and $s(sR')' = k^2R$.

          Try $R = s^\lambda$: $\lambda^2 = k^2$, so $R = Cs^k + Ds^{-k}$. For $k = 0$: $(sR')' = 0 \Rightarrow sR' = D \Rightarrow R = C + D\ln s$, and $\Psi = A + B\phi$.

          **What to remember.** Four lines and four points: separate with $s^2/(R\Psi)$, minus sign on the angle, try $s^\lambda$, don't forget $k = 0$ ($\ln s$ and $\phi$).
        `,
      }),

      RF(md`
        !!key Patterns to remember (polar separation)
          - Use it when nothing depends on $z$ and the boundaries are circles and rays. On the exam the coordinates may be called $(r,\theta)$: same thing.
          - $V = R(s)\Psi(\phi)$; multiply by $s^2/(R\Psi)$; $\Psi'' = -k^2\Psi$ (the angle oscillates); $s(sR')' = k^2R$.
          - Radial: try $s^\lambda$ ⇒ $s^{\pm k}$. For $k = 0$: $1$, $\ln s$ and $1$, $\phi$.
          - Full circle ⇒ $k$ integer, no $\phi$. Grounded walls at $0$ and $\alpha$ ⇒ $\sin(n\pi\phi/\alpha)$, $k = n\pi/\alpha$.
          - Origin in region ⇒ drop $s^{-k}$, $\ln s$. Infinity in region ⇒ drop $s^k$ (except an imposed uniform field). Annulus ⇒ keep both.
          - $b_0\ln s$ ⇔ net line charge $\lambda = -2\pi\varepsilon_0 b_0$. In 2-D you can't set $V = 0$ at infinity if $\lambda \ne 0$.
      `),
    ],
  };

  // ================================================================ Lesson 2 numerics (series used by the solution figures)
  // annular sector a<r<b, 0<theta<alpha, inner arc + walls grounded, outer arc V0 (the exam problem); r in units of a
  const examPhi = (r, th, alpha, ba, N = 61) => {
    let s = 0;
    for (let n = 1; n <= N; n += 2) { const k = n * PI / alpha; s += 4 / (n * PI) * Math.sin(k * th) * (Math.pow(r / ba, k) - Math.pow(1 / (r * ba), k)) / (1 - Math.pow(1 / ba, 2 * k)); }
    return s;
  };
  // pie slice 0<r<b (r in units of b), walls grounded, arc V0
  const pieFn = (r, th, alpha, N = 81) => { let s = 0; for (let n = 1; n <= N; n += 2) { const k = n * PI / alpha; s += 4 / (n * PI) * Math.pow(r, k) * Math.sin(k * th); } return s; };

  // ================================================================ Lesson 2 figures
  const EXAM = wedge({ al: 60, a: 55, b: 170, inner: '\\#1:\\ \\Phi(a,\\theta)=0', w0: '\\#2:\\ \\Phi(r,0)=0', wA: '\\#3:\\ \\Phi(r,\\alpha)=0', outer: '\\#4:\\ \\Phi(b,\\theta)=V_0', ticks: true });
  const EXAM_MAP = wedge({ al: 60, a: 55, b: 165, ticks: true, outer: 'V_0', w0: '0', wA: '0', inner: '0',
    map: { fn: (r, th) => examPhi(r / 55, th, PI / 3, 3), levels: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] } });
  const ROLES = wedge({ al: 60, a: 55, b: 170, inner: 'D=-Ca^{2k}', w0: 'A=0', wA: 'k=n\\pi/\\alpha', outer: 'C_n', ticks: true });
  const PIE = wedge({ al: 60, a: 0, b: 160, w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=V_0', ticks: true });
  const PIE_P = wedge({ al: 60, a: 0, b: 160, w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=V_0', ticks: true, angLab: '\\alpha=\\pi/3', Ptheta: [80, 30, 46] });
  const PIE_MAP = wedge({ al: 60, a: 0, b: 160, outer: 'V_0', w0: '0', wA: '0', map: { fn: (r, th) => pieFn(r / 160, th, PI / 3), levels: [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] } });
  const NOTCH = wedge({ al: 60, a: 0, b: 120, open: true, L: 120, w0: '\\text{metal}', wA: '\\text{metal}', angLab: '\\alpha<\\pi' });
  const CORNER = wedge({ al: 270, a: 0, open: true, L: 95, w0: '\\text{metal}', wA: '\\text{metal}', angLab: '\\alpha=3\\pi/2', ar: 22 });
  const TIPS = PF.row([{ svg: NOTCH, cap: '(A) a notch cut into metal: the field region is a sharp wedge' }, { svg: CORNER, cap: '(B) outside a right-angle metal edge: the field region is a reflex wedge' }]);
  const TIPPLOT = plt({ w: 330, h: 200, x: [0, 1], y: [0, 3], xl: 'r', yl: '|\\vb E|\\propto r^{\\pi/\\alpha-1}', xt: [[1, '1']], yt: [[1, '1'], [2, '2']],
    curves: [
      { f: (r) => r, lab: '\\alpha=\\pi/2', labAt: 0.8, sides: ['br', 'b', 'r'] },
      { f: () => 1, cls: 'dim', lab: '\\alpha=\\pi', labAt: 0.62, sides: ['t', 'tr'] },
      { f: (r) => Math.pow(r, -1 / 3), cls: 'dash', lab: '\\alpha=3\\pi/2', labAt: 0.3, sides: ['tr', 't', 'r'] },
      { f: (r) => Math.pow(r, -1 / 2), lab: '\\alpha=2\\pi', labAt: 0.12, sides: ['r', 'tr', 'br'] },
    ] });
  const OUTW = wedge({ al: 90, a: 50, open: true, L: 160, w0: '\\Phi=0', wA: '\\Phi=0', inner: '\\Phi=V_0', far: '\\Phi\\to0', ticks: true });
  const OUTW_P = wedge({ al: 90, a: 50, open: true, L: 160, w0: '\\Phi=0', wA: '\\Phi=0', inner: '\\Phi=V_0', far: '\\Phi\\to0', ticks: true, Ptheta: [100, 45, 70], angLab: '\\pi/2' });
  const REV = wedge({ al: 60, a: 55, b: 170, inner: '\\Phi=V_0', w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=0', ticks: true });
  const REV_P = wedge({ al: 90, a: 70, b: 140, inner: '\\Phi=V_0', w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=0', ticks: true, angLab: '\\pi/2', Ptheta: [105, 45, 40] });
  const TWOWALL = wedge({ al: 55, a: 0, r0: 8, open: true, L: 160, w0: '\\Phi=0', wA: '\\Phi=V_0', O: false, angLab: '\\alpha' });
  const TWOWALL_AB = wedge({ al: 55, a: 0, r0: 8, open: true, L: 170, w0: '\\Phi=0', wA: '\\Phi=V_0', O: false, angLab: '\\alpha',
    extra: (f) => { for (const r of [70, 140]) { const p = pol(r, 55); f.dot(p[0], p[1], 2.4); put(f, p[0], p[1], r === 70 ? 'a' : 'b', ['l', 'bl', 'tl'], 14, 'small accent'); } } });
  const QA_SIN = wedge({ al: 90, a: 60, b: 150, inner: '\\Phi=0', w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=V_0\\sin 2\\theta', ticks: true, angLab: '\\pi/2', outerAt: 40 });
  const QA_SIN_P = wedge({ al: 90, a: 60, b: 150, inner: '\\Phi=0', w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=V_0\\sin 2\\theta', ticks: true, angLab: '\\pi/2', outerAt: 55, Ptheta: [100, 22.5, 50] });
  const QA_RAMP = wedge({ al: 90, a: 60, b: 150, inner: '\\Phi=0', w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=V_0\\theta', ticks: true, angLab: '\\pi/2', outerAt: 40, Ptheta: [100, 45, 40] });
  const EXAM_NUM = wedge({ al: 90, a: 70, b: 140, inner: '\\Phi=0', w0: '\\Phi=0', wA: '\\Phi=0', outer: '\\Phi=V_0', ticks: true, angLab: '\\pi/2', Ptheta: [105, 45, 40] });
  const HARD = wedge({ al: 90, a: 70, b: 140, inner: '\\Phi=0', w0: '\\Phi=0', wA: '\\Phi=V_0', outer: '\\Phi=0', ticks: true, angLab: '\\pi/2', Ptheta: [99, 45, 40] });
  const PIE2 = wedge({ al: 90, a: 0, b: 150, w0: '\\Phi=0', wA: '\\Phi=V_0', outer: '\\Phi=0', ticks: true, angLab: '\\pi/2', ar: 44, Ptheta: [100, 45, 22] });
  const SUPER = PF.row([
    { svg: wedge({ al: 60, a: 45, b: 125, inner: '0', w0: '0', wA: 'V_0', outer: '0', O: false, angLab: false }), cap: '$\\Phi$' },
    { svg: wedge({ al: 60, a: 45, b: 125, inner: 'V_0\\theta/\\alpha', w0: '0', wA: 'V_0', outer: 'V_0\\theta/\\alpha', O: false, angLab: false }), cap: '$=\\;V_0\\theta/\\alpha$' },
    { svg: wedge({ al: 60, a: 45, b: 125, inner: '-V_0\\theta/\\alpha', w0: '0', wA: '0', outer: '-V_0\\theta/\\alpha', O: false, angLab: false }), cap: '$+\\;\\Phi_2$' },
  ]);
  const BISECT = plt({ w: 330, h: 190, x: [1, 2], y: [0, 1.15], xl: 'r/a', yl: '\\Phi(r,\\pi/4)/V_0', xt: [[1, '1'], [1.5, '1.5'], [2, '2']], yt: [[1, '1']],
    curves: [
      { f: (r) => examPhi(r, PI / 4, PI / 2, 2, 401), lab: '\\text{full series}', labAt: 1.75, sides: ['br', 'b', 'r'] },
      { f: (r) => examPhi(r, PI / 4, PI / 2, 2, 1), cls: 'dash', lab: '\\text{first term}', labAt: 1.4, sides: ['tl', 't', 'l'] },
    ], pts: [{ x: 1.5, y: examPhi(1.5, PI / 4, PI / 2, 2, 401) }] });

  // extra setup figures for the added conceptual MCs (lesson 2)
  const NOTCH45 = wedge({ al: 45, a: 0, b: 120, open: true, L: 120, w0: '\\text{metal}', wA: '\\text{metal}', angLab: '\\pi/4' });
  const W120 = wedge({ al: 120, a: 0, b: 120, open: true, L: 120, w0: '\\text{metal}', wA: '\\text{metal}', angLab: '2\\pi/3' });
  const HALFARC = wedge({ al: 60, a: 55, b: 165, inner: '0', w0: '0', wA: '0', outer: 'V_0', outerAt: 14, ticks: true,
    extra: (f) => { const g = pol(165, 30); f.dot(g[0], g[1], 2.4); const p = pol(174, 47); put(f, p[0], p[1], '0', sidesToward(47), 6, 'small'); } });
  const HUMP = wedge({ al: 60, a: 55, b: 165, inner: '0', w0: '0', wA: '0', outer: 'f(\\theta)', ticks: true });
  const COSARC = wedge({ al: 60, a: 55, b: 165, inner: '0', w0: '0', wA: '0', outer: 'V_0\\cos(\\pi\\theta/\\alpha)', ticks: true });
  const TWOV = wedge({ al: 55, a: 0, r0: 8, open: true, L: 160, w0: '\\Phi=V_1', wA: '\\Phi=V_2', O: false, angLab: '\\alpha' });

  // ================================================================ Lesson 2
  const L2 = {
    id: 'uW-wedge', title: 'Wedges and sectors',
    steps: [
      RF(md`
        ### The Spring 2026 exam problem

        This was Problem 1 on last spring's Hour Exam 1. Read it, look at the figure, and before reading on decide which terms you will keep.

        !!key The problem
          A region is bounded by two metal walls at $\theta = 0$ and $\theta = \alpha$ and two metal arcs at $r = a$ and $r = b$, all insulated from each other at the corners. Nothing depends on $z$. The inner arc and both walls are grounded; the outer arc is held at $V_0$. Find $\Phi(r,\theta)$ inside.

        [[fig:exam]]

        **Region of interest:** $a<r<b$, $0<\theta<\alpha$. No charge, so $\nabla^2\Phi = 0$.

        **Boundary conditions** (the exam's numbering):
        1. $\Phi(a,\theta) = 0$
        2. $\Phi(r,0) = 0$
        3. $\Phi(r,\alpha) = 0$
        4. $\Phi(b,\theta) = V_0$

        **How it was graded (11 points):**

        | step | points |
        |---|---|
        | the boundary conditions ($R(a) = 0$; $\Theta(0) = 0$; $\Theta(\alpha) = 0$) | 2 (1, ½, ½) |
        | separating $\Phi = R(r)\Theta(\theta)$ | 1 |
        | solving for $\Theta$ | 1 |
        | solving for $R$ | 1 |
        | applying the homogeneous BCs | 2 |
        | superposition | 1 |
        | Fourier coefficients | 2 |
        | final answer | 1 |

        !!key Setting it up is most of the grade
          The boundary conditions, separating, and writing the two general solutions are 5 of 11 points, and applying the zero conditions brings it to 7. None of it needs the final formula. On the exam, write the region, the numbered BCs and the general solutions **first**, even if you are unsure how the rest goes.
      `, { exam: { svg: EXAM, cap: 'Spring 2026 Exam 1, Problem 1: an annular sector. Small gaps at the corners insulate the pieces from each other.' } }),

      Q(md`Before solving: which of the four boundary conditions is the **inhomogeneous** one, the one Fourier's trick will be used on at the end?`,
        [md`#1, $\Phi(a,\theta) = 0$`, md`#2 and #3 together`, md`#4, $\Phi(b,\theta) = V_0$`, md`None: all four are used to quantize $k$`],
        2,
        [md`A zero condition is homogeneous: it kills or relates constants in each product term separately.`,
          md`The walls are grounded: homogeneous. They quantize $k$.`,
          null,
          md`Only the two walls quantize $k$. #1 relates $C$ and $D$; #4 fixes the $C_n$.`],
        md`Same strategy as the slot: use every zero condition on the single product term, superpose, and save the one nonzero condition for Fourier's trick. If there were two nonzero conditions you would split the problem into two (superposition).`,
        { figHtml: EXAM }),

      Q(md`In the exam problem, which separated equation gets the **negative** constant?`,
        [md`The radial one, because $r$ runs between two arcs`,
          md`Either; the answer is the same`,
          md`Neither; $k = 0$ here`,
          md`The angular one, $\Theta'' = -k^2\Theta$, because $\Theta$ must vanish at both walls $\theta = 0$ and $\theta = \alpha$`],
        3,
        [md`Both arcs bound $r$, but only one of them (the inner) is zero. The direction with **two zero** conditions is $\theta$.`,
          md`With $+k^2$ on the angle, $\Theta = $ sinh/cosh can't vanish at two walls, so only the trivial solution is left.`,
          md`$k = 0$ gives $\Theta = A + B\theta$, which grounded walls force to zero.`,
          null],
        md`Two homogeneous conditions in $\theta$ → oscillating $\Theta$ → $\Theta'' = -k^2\Theta$. The radial equation then has $+k^2$ and power-law solutions.`,
        { figHtml: EXAM }),

      Q(md`Which radial functions do you keep in the exam problem?`,
        [md`$r^{k}$ only, because the region is bounded`,
          md`$r^{-k}$ only, because the outer arc is the live one`,
          md`Both $r^k$ and $r^{-k}$, because neither $r = 0$ nor $r = \infty$ is in the region`,
          md`$\ln r$ only`],
        2,
        [md`Bounded or not isn't the test. The test is whether $r = 0$ is in the region. Here it isn't ($r > a$).`,
          md`Which arc is live doesn't decide which powers are allowed. Both are allowed; BC #1 then fixes their ratio.`,
          null,
          md`$\ln r$ is the $k = 0$ radial function, and $k = 0$ is killed by the grounded walls.`],
        md`An annular sector is like an annulus: neither the origin nor infinity is in it. Keep both powers; the inner arc condition then picks the combination $(r/a)^k - (a/r)^k$.`,
        { figHtml: EXAM }),

      Q(md`In the exam problem, what job does BC #3, $\Phi(r,\alpha) = 0$, do?`,
        [md`It kills the $\cos k\theta$ term`,
          md`It quantizes $k$: $\sin k\alpha = 0$, so $k = n\pi/\alpha$`,
          md`It fixes $D = -Ca^{2k}$`,
          md`It fixes the $C_n$ by Fourier's trick`],
        1,
        [md`That is BC #2, $\Theta(0) = 0$, which sets $A = 0$.`,
          null,
          md`That is BC #1, the grounded inner arc, which acts on $R(r)$.`,
          md`That is BC #4, the only inhomogeneous condition, used last.`],
        md`Each BC has one job. #2 kills $\cos$; #3 quantizes $k$; #1 ties $D$ to $C$; #4 fixes the $C_n$. Writing the job next to each BC is a quick way to make sure your solution uses all four.`,
        { figHtml: EXAM }),

      Q(md`The exam says the four metal pieces are insulated from each other at the corners. Why does that matter?`,
        [md`The gaps make $\Phi$ discontinuous everywhere inside the region`,
          md`It changes the allowed values of $k$`,
          md`It means the BCs hold only away from the corners, so Fourier's trick fails`,
          md`Touching pieces would form one conductor at one potential, so the arc could not be at $V_0$ while the walls are at $0$`],
        3,
        [md`Inside the region $\Phi$ is smooth (it solves Laplace). Only at the two corner points does the boundary value jump from $V_0$ to $0$.`,
          md`$k$ is fixed by the two grounded walls, $k = n\pi/\alpha$, gaps or not.`,
          md`Two isolated points don't change an integral over $\theta$. Fourier's trick works fine; the series just converges slowly near the corners.`,
          null],
        md`Metal pieces in contact are one conductor, which is an equipotential. To hold different faces at different potentials you need insulating gaps. In the idealized problem the gaps are infinitely thin, so they only show up as jumps of the boundary data at the corners.`,
        { figHtml: EXAM }),

      RF(md`
        ### Steps 1–3: separate, solve, apply the zero conditions

        **Separate.** $\Phi(r,\theta) = R(r)\Theta(\theta)$. Multiply Laplace's equation by $r^2/(R\Theta)$:
        $$\frac{r}{R}\frac{d}{dr}\!\left(r\frac{dR}{dr}\right) = k^2,\qquad \frac{1}{\Theta}\frac{d^2\Theta}{d\theta^2} = -k^2 .$$
        The negative constant goes with $\theta$ because $\theta$ is an angle with two grounded walls: $\Theta$ must oscillate.

        **Solve.**
        $$\Theta(\theta) = A\cos k\theta + B\sin k\theta, \qquad R(r) = Cr^{k} + Dr^{-k}\ \ (\text{try } R = r^\lambda:\ \lambda^2 = k^2).$$

        **Apply the homogeneous BCs** (one product term at a time):
        - **#2** $\Theta(0) = 0 \Rightarrow A = 0$.
        - **#3** $\Theta(\alpha) = B\sin k\alpha = 0 \Rightarrow k\alpha = n\pi$, so $k = \dfrac{n\pi}{\alpha}$, $n = 1,2,3,\dots$
        - **#1** $R(a) = Ca^{k} + Da^{-k} = 0 \Rightarrow D = -Ca^{2k}$. Then $R = C\left(r^k - a^{2k}r^{-k}\right) = Ca^k\left[\left(\tfrac ra\right)^k - \left(\tfrac ar\right)^k\right]$. Absorb $a^k$ (and $B$) into one constant $C_n$.

        What about $k = 0$? It gives $(A_0 + B_0\theta)(C_0 + D_0\ln r)$; #2 and #3 force $A_0 = B_0 = 0$. Gone.

        [[fig:roles]]

        **One product per $n$:**
        $$\Phi_n(r,\theta) = C_n\,\sin\!\left(\frac{n\pi\theta}{\alpha}\right)\left[\left(\frac ra\right)^{n\pi/\alpha} - \left(\frac ar\right)^{n\pi/\alpha}\right].$$
        Each one satisfies #1, #2, #3. None of them alone can satisfy #4.
      `, { roles: { svg: ROLES, cap: 'What each boundary condition does. Only the outer arc is left for the end.' } }),

      Q(md`Why does $\Theta(\alpha) = 0$ give $k = n\pi/\alpha$ rather than $k = n$, as for a full pipe?`,
        [md`Because $\sin k\alpha = 0$ requires $k\alpha$ to be a multiple of $\pi$; only a full circle forces integer $k$`,
          md`Because $\alpha$ is in degrees`,
          md`It should be $k = n$; the $\alpha$ doesn't belong there`,
          md`Because $\cos k\alpha = 0$`],
        0,
        [null,
          md`Angles in these formulas are in radians. For $\alpha = \pi/2$: $k = 2n$.`,
          md`$\sin(n\alpha)$ is zero only when $n\alpha$ is a multiple of $\pi$, which for general $\alpha$ fails. $k = n\pi/\alpha$ is right.`,
          md`$A = 0$ removed the cosine already; the condition is on $\sin k\alpha$.`],
        md`The zeros of $\sin$ are at multiples of $\pi$. With walls at $0$ and $\alpha$, the half-wavelengths must fit: $n$ half-waves in an angle $\alpha$. A full circle has no walls; there $k$ is fixed by $2\pi$-periodicity instead.`,
        { figHtml: wedge({ al: 75, a: 0, b: 120, w0: '\\Theta(0)=0', wA: '\\Theta(\\alpha)=0', O: false, outerArc: false }) }),

      Q(md`In the wedge that runs from an inner arc at $V_0$ out to infinity (grounded walls, $\Phi\to0$ far away), which condition quantizes $k$?`,
        [md`The inner arc at $V_0$`, md`$\Phi\to0$ at infinity`, md`The two grounded walls`, md`Finiteness at $r = 0$`],
        2,
        [md`The live arc is the inhomogeneous condition. It fixes the coefficients at the end, by Fourier's trick.`,
          md`$\Phi\to0$ removes $r^{+k}$. It decides which radial power survives, not which $k$ exist.`,
          null,
          md`$r = 0$ is not in this region: it stops at the inner arc $r = a$.`],
        md`Quantization always comes from the pair of homogeneous conditions in the oscillating direction: $\Theta(0) = \Theta(\alpha) = 0 \Rightarrow k = n\pi/\alpha$. Then infinity picks $r^{-k}$, and the arc fixes the $c_n$. One job per condition.`,
        { figHtml: OUTW }),

      Q(md`A student writes $R(r) = C\left[(r/a)^k - (a/r)^k\right]$. Which boundary condition is this built to satisfy?`,
        [md`#4, the outer arc at $V_0$`, md`#2, the wall $\theta = 0$`, md`Finiteness at $r = 0$`, md`#1, the grounded inner arc`],
        3,
        [md`At $r = b$ the bracket is $(b/a)^k - (a/b)^k \ne 0$; #4 is matched later by choosing $C_n$.`,
          md`The walls constrain $\Theta$, not $R$.`,
          md`$r = 0$ is not in the region, and $(a/r)^k$ would blow up there anyway.`,
          null],
        md`At $r = a$ the bracket is $1 - 1 = 0$, for every $k$. That is BC #1. Writing $R$ in this dimensionless form also makes the Fourier step cleaner: at $r = b$ the bracket is the number $(b/a)^k - (a/b)^k$.`,
        { figHtml: EXAM }),

      Q(md`Suppose instead that the **inner** arc were at $V_0$ and the outer arc grounded. Which radial combination goes with $\sin(n\pi\theta/\alpha)$?`,
        [md`$(r/a)^k - (a/r)^k$`, md`$(b/r)^k - (r/b)^k$`, md`$r^{-k}$ only`, md`$(r/b)^k + (b/r)^k$`],
        1,
        [md`That one vanishes at $r = a$, but now $r = a$ is the live arc.`,
          null,
          md`The outer arc is at finite $r = b$; you need the combination that vanishes there, which needs both powers.`,
          md`At $r = b$ this is $2$, not $0$. Sign error.`],
        md`The grounded arc decides which combination: it must vanish at $r = b$. $(b/r)^k - (r/b)^k$ does, and it is positive inside ($r<b$), so the $C_n$ come out positive. Practice problem below.`,
        { figHtml: REV }),

      RF(md`
        ### Steps 4–5: superpose and use Fourier's trick

        **Superpose:**
        $$\Phi(r,\theta) = \sum_{n=1}^{\infty} C_n\,\sin\!\left(\frac{n\pi\theta}{\alpha}\right)\left[\left(\frac ra\right)^{n\pi/\alpha} - \left(\frac ar\right)^{n\pi/\alpha}\right].$$

        **Apply #4** at $r = b$:
        $$V_0 = \sum_n C_n\left[\left(\tfrac ba\right)^{n\pi/\alpha} - \left(\tfrac ab\right)^{n\pi/\alpha}\right]\sin\!\left(\frac{n\pi\theta}{\alpha}\right),\qquad 0<\theta<\alpha.$$
        This is a Fourier sine series on $(0,\alpha)$. The sines are orthogonal there:
        $$\int_0^\alpha \sin\!\left(\frac{n\pi\theta}{\alpha}\right)\sin\!\left(\frac{m\pi\theta}{\alpha}\right)d\theta = \frac{\alpha}{2}\,\delta_{nm}.$$
        Multiply by $\sin(m\pi\theta/\alpha)$ and integrate from $0$ to $\alpha$:
        $$C_m\left[\left(\tfrac ba\right)^{m\pi/\alpha} - \left(\tfrac ab\right)^{m\pi/\alpha}\right]\frac{\alpha}{2} = V_0\int_0^\alpha\sin\!\left(\frac{m\pi\theta}{\alpha}\right)d\theta = \frac{V_0\,\alpha}{m\pi}\left(1 - \cos m\pi\right).$$

        **Result** (with $(-1)^n = \cos n\pi$):
        $$\boxed{\Phi(r,\theta) = \sum_{n=1}^{\infty} C_n\sin\!\left(\frac{n\pi\theta}{\alpha}\right)\left[\left(\frac ra\right)^{n\pi/\alpha} - \left(\frac ar\right)^{n\pi/\alpha}\right],\quad C_n = \frac{2V_0}{\pi n}\,\frac{1 - (-1)^n}{\left(\frac ba\right)^{n\pi/\alpha} - \left(\frac ab\right)^{n\pi/\alpha}}}$$
        Only odd $n$ survive, with $C_n = \dfrac{4V_0}{n\pi}\Big/\left[\left(\tfrac ba\right)^{n\pi/\alpha} - \left(\tfrac ab\right)^{n\pi/\alpha}\right]$.

        [[fig:map]]

        **Checks.**
        - $r = a$: every bracket vanishes, so $\Phi = 0$ (#1). $\theta = 0, \alpha$: every sine vanishes (#2, #3).
        - $r = b$: the brackets cancel the denominators and you get $\sum_{\text{odd}}\frac{4V_0}{n\pi}\sin(n\pi\theta/\alpha)$, the sine series of $V_0$ (#4), the same series as the slot.
        - Units: $C_n$ is volts; the brackets are pure numbers.
        - Limit $a \to 0$: $(a/r)^k \to 0$ and $(a/b)^k \to 0$, so $\Phi \to \sum \frac{4V_0}{n\pi}(r/b)^{k}\sin k\theta$, the pie slice. Good.
      `, { map: { svg: EXAM_MAP, cap: 'Equipotentials of the solution for $\\alpha = \\pi/3$, $b = 3a$, at $0.1V_0, 0.2V_0, \\dots, 0.9V_0$. They crowd toward the corners where the live arc meets the grounded walls.' } }),

      Q(md`Why do only odd $n$ appear in the exam answer?`,
        [md`Because $(b/a)^{k} - (a/b)^k$ vanishes for even $n$`,
          md`Because even $n$ violate BC #1`,
          md`Because $\int_0^\alpha \sin(n\pi\theta/\alpha)\,d\theta = \frac{\alpha}{n\pi}(1-\cos n\pi)$ vanishes for even $n$: a constant $V_0$ is symmetric about the bisector, and even modes are antisymmetric about it`,
          md`Because the wedge angle $\alpha$ is less than $\pi$`],
        2,
        [md`That bracket is never zero for $b \ne a$.`,
          md`Every product term satisfies #1 by construction.`,
          null,
          md`Odd-$n$-only is about the shape of the boundary data, not about $\alpha$.`],
        md`$\sin(n\pi\theta/\alpha)$ with even $n$ is odd about $\theta = \alpha/2$; a constant is even about it. Their overlap is zero. If the outer arc were at $V_0$ on only one half, even $n$ would come back.`,
        { figHtml: EXAM }),

      Q(md`The outer arc of the exam sector is held at $V_0$ for $0<\theta<\alpha/2$ and at $0$ for $\alpha/2<\theta<\alpha$ (insulated halves). Which $n$ appear in the sine series of the arc data?`,
        [md`Odd $n$ only, as before`, md`Even $n$ only`, md`All $n$ except multiples of $4$`, md`All $n$`],
        2,
        [md`Odd-only needs data symmetric about the bisector. Half on, half off is not.`,
          md`The data aren't antisymmetric about the bisector either, so odd $n$ survive too.`,
          null,
          md`Close, but $\int_0^{\alpha/2}\sin\frac{n\pi\theta}{\alpha}\,d\theta = \frac{\alpha}{n\pi}\left(1 - \cos\frac{n\pi}{2}\right)$, which is zero for $n = 4, 8, \dots$`],
        md`$c_n = \frac{2V_0}{n\pi}\left(1 - \cos\frac{n\pi}{2}\right)$: $n = 1, 2, 3$ give $\frac{2V_0}{\pi}$, $\frac{2V_0}{\pi}$, $\frac{2V_0}{3\pi}$, and $n = 4$ gives $0$. Lopsided data bring back even modes, just as in a slot with only half a face live.`,
        { figHtml: HALFARC }),

      Q(md`The outer arc is held at a hump $f(\theta) = V_0\,\dfrac{\theta(\alpha - \theta)}{\alpha^2}$, symmetric about the bisector. Which $n$ appear?`,
        [md`Odd $n$ only`, md`$n = 1$ only, since the hump looks like one half-wave`, md`Even $n$ only`, md`All $n$`],
        0,
        [null,
          md`It looks like $\sin(\pi\theta/\alpha)$ but isn't one: the coefficients for $n = 3, 5, \dots$ are small but not zero.`,
          md`Even modes are antisymmetric about the bisector; their overlap with a symmetric hump is zero.`,
          md`The symmetry kills every even $n$.`],
        md`Symmetric about $\theta = \alpha/2$ ⇒ only the modes symmetric about it: odd $n$. The coefficients are $\frac{8V_0}{\pi^3n^3}$ for odd $n$, so $n = 3$ is $\frac{1}{27}$ of $n = 1$ and the first term is excellent even on the arc. Smooth data that vanish at the walls converge fast; a step (constant $V_0$ against grounded walls) converges slowly.`,
        { figHtml: HUMP }),

      Q(md`The outer arc is held at $V_0\cos(\pi\theta/\alpha)$: $+V_0$ next to one wall, $-V_0$ next to the other. Which $n$ appear in the sine series?`,
        [md`$n = 1$ only`, md`Even $n$ only`, md`Odd $n$ only`, md`None: a cosine can't be expanded in sines`],
        1,
        [md`$\cos(\pi\theta/\alpha)$ is not $\sin(\pi\theta/\alpha)$; its $n = 1$ coefficient is $0$.`,
          null,
          md`The data are antisymmetric about the bisector, so the symmetric (odd-$n$) modes drop out.`,
          md`Any reasonable function on $(0,\alpha)$ has a sine series; it just converges slowly where the function doesn't vanish at the ends.`],
        md`$\cos(\pi\theta/\alpha)$ changes sign under $\theta\to\alpha-\theta$, and so do the even-$n$ sines. So only even $n$ appear, with $c_n = \frac{4nV_0}{\pi(n^2-1)}$: $\frac{8V_0}{3\pi}$, $\frac{16V_0}{15\pi}$, ... The rule: symmetric data ⇒ odd $n$; antisymmetric data ⇒ even $n$.`,
        { figHtml: COSARC }),

      Q(md`A student's answer to the exam problem is $\Phi = \sum_{n\text{ odd}}\dfrac{4V_0}{n\pi}\left(\dfrac rb\right)^{n\pi/\alpha}\sin\dfrac{n\pi\theta}{\alpha}$. Which boundary condition does it violate?`,
        [md`#4, $\Phi(b,\theta) = V_0$`, md`#2, $\Phi(r,0) = 0$`, md`#3, $\Phi(r,\alpha) = 0$`, md`#1, $\Phi(a,\theta) = 0$`],
        3,
        [md`At $r = b$ every $(r/b)^k = 1$ and the sum is the sine series of $V_0$: #4 holds.`,
          md`Every term has $\sin 0 = 0$: #2 holds.`,
          md`Every term has $\sin n\pi = 0$: #3 holds.`,
          null],
        md`At $r = a$ the terms are $\frac{4V_0}{n\pi}(a/b)^{k}\sin k\theta \ne 0$. This is the pie-slice answer: the student dropped $r^{-k}$ as if the tip were in the region. The fix is the combination $(r/a)^k - (a/r)^k$. Always test your final answer against every numbered BC; each failure costs points.`,
        { figHtml: EXAM }),

      Q(md`Where in the region does the exam series converge most slowly (need the most terms)?`,
        [md`Near the inner arc, $r \approx a$`, md`At the center of the region`, md`Near the corners $(b, 0)$ and $(b,\alpha)$, where the live arc meets a grounded wall`, md`It converges equally fast everywhere`],
        2,
        [md`Near $r = a$ every term carries a small bracket; few terms are needed.`,
          md`In the middle the high-$n$ terms are suppressed by $(r/b)^{n\pi/\alpha}$ (roughly); a few terms suffice.`,
          null,
          md`High modes die like $(r/b)^{n\pi/\alpha}$ away from the live arc, so convergence depends strongly on position.`],
        md`At the live arc itself the series is the sine series of a step function and converges slowly (Gibbs ringing at the corners, where $\Phi$ jumps from $V_0$ to $0$). Move inward and the $n$-th term is damped by roughly $(r/b)^{n\pi/\alpha}$.`,
        { figHtml: EXAM }),

      Q(md`If the outer arc were held at $V_0\sin(\pi\theta/\alpha)$ instead of $V_0$, how many terms would the answer have?`,
        [md`One: $n = 1$ only`, md`All odd $n$`, md`All $n$`, md`Two: $n = 1$ and $n = 2$`],
        0,
        [null,
          md`The boundary function is already the $n = 1$ mode; orthogonality gives zero for every other $n$.`,
          md`Same reason.`,
          md`$\sin(\pi\theta/\alpha)$ has no overlap with $\sin(2\pi\theta/\alpha)$.`],
        md`Read it off without integrating: $C_1\left[(b/a)^{\pi/\alpha} - (a/b)^{\pi/\alpha}\right] = V_0$. The answer is a single product term. This "the boundary data is one mode" shortcut saves a lot of time on exams; look for it first.`,
        { figHtml: wedge({ al: 60, a: 55, b: 165, inner: '0', w0: '0', wA: '0', outer: 'V_0\\sin(\\pi\\theta/\\alpha)', ticks: true }) }),

      Q(md`On the grounded wall $\theta = 0$ of the exam sector, which components of $\vb E$ are nonzero just inside the region?`,
        [md`$E_r$ only`, md`Both $E_r$ and $E_\theta$`, md`$E_\theta$ only, perpendicular to the wall`, md`Neither: the wall is grounded`],
        2,
        [md`$E_r = -\partial_r\Phi$, and $\Phi = 0$ all along the wall, so its derivative along the wall is zero.`,
          md`The tangential component of $\vb E$ at a conductor's surface is zero.`,
          null,
          md`Grounded means $\Phi = 0$ on the wall, not $\vb E = 0$ next to it. The field meets the wall head-on and ends on induced charge.`],
        md`Along the wall $\Phi(r,0) = 0$ for every $r$, so $E_r = -\partial_r\Phi = 0$ there: no tangential field at a conductor. The normal component $E_\theta = -\frac1r\partial_\theta\Phi$ is what remains, and it gives the surface charge.`,
        { figHtml: EXAM }),

      Q(md`For $V_0>0$, what is the sign of the induced surface charge on the grounded walls of the exam sector?`,
        [md`Negative everywhere on the walls`, md`Positive everywhere`, md`Zero, because the walls are grounded`, md`It changes sign along each wall`],
        0,
        [null,
          md`Positive charge sits on a conductor that is at a **higher** potential than its surroundings. The walls are at $0$ and the inside is above $0$.`,
          md`A grounded conductor carries whatever charge keeps it at $0$; here that is nonzero.`,
          md`$\Phi>0$ at every interior point (it lies between the boundary values $0$ and $V_0$), so the field points into the walls all along them.`],
        md`Inside, $0<\Phi<V_0$, so $\Phi$ rises as you leave a wall and $\vb E$ points back into it. With $\hat{\mathbf n}$ into the region, $\sigma = \varepsilon_0\vb E\cdot\hat{\mathbf n}<0$. The positive charge sits on the live arc. Near the inner corners, where two grounded faces meet at $90^\circ$, $\sigma\to0$; near the outer corners, next to the live arc, it is largest.`,
        { figHtml: EXAM }),

      Q(md`Which expression gives the surface charge on the wall $\theta = 0$?`,
        [md`$\sigma = -\varepsilon_0\dfrac{\partial\Phi}{\partial r}\Big|_{\theta=0}$`,
          md`$\sigma = +\dfrac{\varepsilon_0}{r}\dfrac{\partial\Phi}{\partial\theta}\Big|_{\theta=0}$`,
          md`$\sigma = -\varepsilon_0\dfrac{\partial\Phi}{\partial\theta}\Big|_{\theta=0}$`,
          md`$\sigma = -\dfrac{\varepsilon_0}{r}\dfrac{\partial\Phi}{\partial\theta}\Big|_{\theta=0}$`],
        3,
        [md`$\partial_r$ is the derivative **along** the wall; it is zero there. You need the normal derivative.`,
          md`Sign error. On this wall the normal into the region is $+\hat{\boldsymbol\theta}$. The $+$ sign belongs to the **other** wall, where the normal is $-\hat{\boldsymbol\theta}$.`,
          md`Missing $1/r$: the angular part of the polar gradient is $\frac1r\partial_\theta$. Without it the units are wrong.`,
          null],
        md`$\sigma = \varepsilon_0\vb E\cdot\hat{\mathbf n}$ with $\hat{\mathbf n}$ pointing out of the metal into the region. On $\theta = 0$, $\hat{\mathbf n} = \hat{\boldsymbol\theta}$ and $E_\theta = -\frac1r\partial_\theta\Phi$. Check the units: $\Phi/r$ is a field.`,
        { figHtml: EXAM }),

      P({
        title: 'Pie slice: the tip is in the region',
        q: md`A pie-slice region $0<r<b$, $0<\theta<\alpha$ has grounded walls at $\theta = 0$ and $\theta = \alpha$ and its arc at $r = b$ held at $V_0$ (insulated from the walls). The tip $r = 0$ is part of the region.

          (a) Which radial function goes with $\sin(n\pi\theta/\alpha)$? (b) Find the coefficient of $(r/b)^{n\pi/\alpha}\sin(n\pi\theta/\alpha)$ for odd $n$. (c) For $\alpha = \pi/3$, evaluate $\Phi(b/2, \pi/6)$ in units of $V_0$ with the full series, and (d) with the first term only.`,
        figHtml: PIE_P,
        hints: [md`Same walls as the exam problem, so the same $\Theta$ and $k = n\pi/\alpha$.`, md`The tip is in the region: $\Phi$ finite at $r = 0$ kills $r^{-k}$.`, md`Fourier on the arc: the same sine series of a constant, $\frac{4V_0}{n\pi}$ for odd $n$.`],
        parts: [
          { lbl: md`(a) Radial function`, mc: [md`$(r/b)^{n\pi/\alpha}$`, md`$(b/r)^{n\pi/\alpha}$`, md`$(r/b)^{n\pi/\alpha} - (b/r)^{n\pi/\alpha}$`, md`$\ln(r/b)$`], a: 0,
            why: [null, md`Blows up at the tip, which is in the region.`, md`Also blows up at $r = 0$, and it vanishes at $r = b$, the live arc.`, md`$k = 0$ is killed by the grounded walls, and $\ln r$ blows up at the tip.`] },
          { lbl: md`(b) Coefficient for odd $n$`, expr: '4*V0/(n*pi)', vars: { V0: [1, 3], n: [1, 9] } },
          { lbl: md`(c) $\Phi(b/2,\pi/6)/V_0$ for $\alpha = \pi/3$ (full series)`, ans: 0.15833, unit: '' },
          { lbl: md`(d) The first term alone`, ans: 0.15915, unit: '' },
        ],
        sol: md`
          **Region:** $0\le r<b$, $0<\theta<\alpha$. **BCs:** (1) $\Phi(r,0) = 0$; (2) $\Phi(r,\alpha) = 0$; (3) $\Phi(b,\theta) = V_0$; (4) $\Phi$ finite at $r = 0$.

          (1), (2) give $\sin(n\pi\theta/\alpha)$, $k = n\pi/\alpha$. (4) kills $r^{-k}$. So $\Phi = \sum_n c_n (r/b)^{k}\sin k\theta$ (writing $r/b$ makes the arc value just $c_n$). (3) is the sine series of $V_0$ on $(0,\alpha)$:
          $$c_n = \frac{2}{\alpha}\int_0^\alpha V_0\sin\frac{n\pi\theta}{\alpha}\,d\theta = \frac{2V_0}{n\pi}(1-\cos n\pi) = \frac{4V_0}{n\pi}\ (n \text{ odd}).$$
          $$\Phi(r,\theta) = \frac{4V_0}{\pi}\sum_{n\text{ odd}}\frac1n\left(\frac rb\right)^{n\pi/\alpha}\sin\frac{n\pi\theta}{\alpha}.$$

          [[fig:map]]

          **Numbers** ($\alpha = \pi/3$, so $k = 3n$; $r = b/2$, $\theta = \pi/6$, so $\sin k\theta = \sin(n\pi/2)$):
          - $n = 1$: $\frac{4}{\pi}\cdot\frac18\cdot 1 = 0.15915$
          - $n = 3$: $\frac{4}{3\pi}\cdot\frac{1}{512}\cdot(-1) = -0.00083$
          - $n = 5$: $+0.000008$

          Full: $0.15833\,V_0$. The first term is within $0.5\%$: the factor $(1/2)^{3n}$ kills the higher modes fast. Halfway to the tip of a sharp wedge the potential is already tiny ($0.16V_0$, much less than the $0.5V_0$ you might guess), because the walls are close together there.

          **Near the tip** only $n = 1$ matters: $\Phi \approx \frac{4V_0}{\pi}(r/b)^{3}\sin 3\theta$. The field goes like $r^2$: deep in a sharp notch the field dies. That is the subject of the next section.
        `,
        figs: { map: { svg: PIE_MAP, cap: 'Equipotentials of the pie slice ($\\alpha = \\pi/3$) at $0.05V_0$, $0.1V_0$, $0.2V_0, \\dots$: they crowd toward the arc and spread out near the tip.' } },
      }),

      Q(md`Near the tip of a pie slice, why does the $n = 1$ term dominate the series?`,
        [md`Each higher mode carries $r^{n\pi/\alpha}$, an extra factor $r^{(n-1)\pi/\alpha}$ compared with $n = 1$, which goes to zero at the tip`,
          md`The higher Fourier coefficients $\frac{4V_0}{n\pi}$ are smaller`,
          md`The grounded walls cancel the higher modes near the tip`,
          md`Only $n = 1$ satisfies the wall conditions near the tip`],
        0,
        [null,
          md`The coefficients shrink only like $1/n$, which can't make a term negligible. The radial powers do the work.`,
          md`Each mode satisfies the wall conditions on its own; nothing cancels between them.`,
          md`Every $\sin(n\pi\theta/\alpha)$ vanishes on both walls at every $r$.`],
        md`The $n$-th term relative to the first is roughly $\frac1n(r/b)^{(n-1)\pi/\alpha}$. For $\alpha = \pi/3$ at $r = b/2$ the $n = 3$ term is already $0.5\%$ of the first. That is why the behaviour at the vertex ($E\propto r^{\pi/\alpha - 1}$) comes from the lowest mode alone.`,
        { figHtml: PIE }),

      Q(md`Where in the pie slice ($\alpha = \pi/3$, arc at $V_0$) is the first term of the series the best approximation to the full answer?`,
        [md`Near the live arc $r = b$`, md`Near the tip`, md`Close to the walls`, md`Equally good everywhere`],
        1,
        [md`On the arc the series is the sine series of a constant: it needs many terms there, especially near the corners.`,
          null,
          md`Near a wall every term is small, but the higher terms are not smaller **relative** to the first than elsewhere at the same $r$.`,
          md`The higher terms carry $(r/b)^{3n}$, so their weight depends strongly on $r$.`],
        md`Term $n$ carries $(r/b)^{n\pi/\alpha} = (r/b)^{3n}$. Toward the tip the higher modes fade much faster than the first. At $r = b/2$ the first term is within $0.5\%$; on the arc itself it is off by more than $25\%$ in places (it gives $\frac{4}{\pi}V_0$ at the middle of the arc instead of $V_0$).`,
        { figHtml: PIE }),

      RF(md`
        ### The field near the vertex: sharp notches and sharp edges

        Close to the vertex ($r \to 0$, tip in the region) every higher mode is suppressed by an extra power of $r$, so the lowest mode wins:
        $$\Phi \approx c_1\,r^{\pi/\alpha}\sin\frac{\pi\theta}{\alpha},\qquad |\vb E| \sim \left|\frac{\partial\Phi}{\partial r}\right| \propto r^{\pi/\alpha - 1}.$$
        The surface charge on the walls follows the field: $\sigma = \varepsilon_0E_\perp \propto r^{\pi/\alpha-1}$.

        [[fig:tips]]

        | wedge (field region) | $\pi/\alpha - 1$ | near the vertex |
        |---|---|---|
        | notch, $\alpha = \pi/3$ | $2$ | $E\propto r^2 \to 0$ |
        | inside a right-angle corner, $\alpha = \pi/2$ | $1$ | $E \propto r \to 0$ |
        | flat surface, $\alpha = \pi$ | $0$ | $E$ finite, constant |
        | outside a right-angle edge, $\alpha = 3\pi/2$ | $-\tfrac13$ | $E\propto r^{-1/3} \to \infty$ |
        | edge of a thin sheet, $\alpha = 2\pi$ | $-\tfrac12$ | $E \propto r^{-1/2}\to\infty$ |

        [[fig:plot]]

        !!intuition The lightning rod
          Where the metal pokes **out** into the field region ($\alpha > \pi$), the field and the charge density pile up and diverge at the edge; in a hollow ($\alpha < \pi$) the field dies. This is why charge collects on sharp points, why sparks and corona discharge start at edges and tips, and why high-voltage hardware is rounded. A lightning rod is a deliberately sharp point. (A real edge has some small radius of curvature, which caps the divergence, but the field is still much larger there than on the flat parts.)
      `, { tips: { svg: TIPS.svg, cap: 'Two corners. The hatched lines are faces of a metal block; the field region is the wedge of angle $\\alpha$ outside the metal.' }, plot: { svg: TIPPLOT, cap: 'How $|\\vb E|$ scales near the vertex for four opening angles (arbitrary units).' } }),

      Q(md`A charged metal cube has edges where two faces meet at $90^\circ$. Seen from outside, the field region at an edge is a wedge of angle $\alpha = 3\pi/2$. How does the field behave as you approach the edge?`,
        [md`It goes to zero like $r$`, md`It stays finite`, md`It diverges like $r^{-1/3}$`, md`It diverges like $r^{-2}$`],
        2,
        [md`That is the **inside** of a right-angle corner ($\alpha = \pi/2$), a hollow.`,
          md`Only a flat surface ($\alpha = \pi$) gives a finite, constant field.`,
          null,
          md`$r^{-2}$ is a point-charge field, far too strong. The exponent is $\pi/\alpha - 1 = 2/3 - 1 = -1/3$.`],
        md`$\pi/\alpha - 1 = \frac{2}{3} - 1 = -\frac13$. The divergence is mild but real: the surface charge density on a cube is largest along the edges and corners.`,
        { figHtml: CORNER }),

      Q(md`A metal box has a $90^\circ$ **inside** corner (a room corner, seen from inside). Where on the walls near that corner is the surface charge density smallest?`,
        [md`Right at the corner line: $\sigma \propto r \to 0$`, md`It is the same everywhere`, md`It diverges at the corner`, md`Far from the corner`],
        0,
        [null,
          md`Only a flat wall has uniform $\sigma$ near a point.`,
          md`Divergence happens at protruding edges ($\alpha > \pi$), not hollows.`,
          md`Far from the corner the walls look flat and $\sigma$ is ordinary; it is the corner that suppresses it.`],
        md`Field region angle $\alpha = \pi/2$: $\sigma \propto r^{\pi/\alpha - 1} = r$. Field lines can't get into a hollow corner. (Cartesian check: $\Phi \propto xy$ near the corner, $E \propto \sqrt{x^2+y^2}$.)`,
        { figHtml: wedge({ al: 90, a: 0, b: 110, open: true, L: 110, w0: '\\text{metal}', wA: '\\text{metal}', angLab: '\\pi/2' }) }),

      Q(md`A notch cut into a metal block has a field region of opening $\alpha = \pi/4$. Near the bottom of the notch, how does $|\vb E|$ scale with the distance $r$ from the vertex?`,
        [md`$r^{4}$`, md`$r^{3}$`, md`$r^{-3/4}$`, md`$r^{1/4}$`],
        1,
        [md`$r^{\pi/\alpha} = r^4$ is how the **potential** grows. The field is one derivative down.`,
          null,
          md`That is $r^{\alpha/\pi - 1}$, with the ratio upside down. A narrow notch shields; its field can't diverge.`,
          md`Upside-down exponent again: it is $\pi/\alpha = 4$, not $1/4$.`],
        md`$\Phi \approx c\,r^{\pi/\alpha}\sin(\pi\theta/\alpha) = c\,r^4\sin4\theta$, so $|\vb E| \propto r^{\pi/\alpha - 1} = r^3$. The narrower the notch, the faster the field dies toward its bottom. (The allowed $k$ here are $4, 8, 12, \dots$)`,
        { figHtml: NOTCH45 }),

      Q(md`Two metal faces meet at an inside angle of $120^\circ$, so the field region near the edge is a wedge with $\alpha = 2\pi/3$. How does the surface charge density on the faces behave near the edge?`,
        [md`$\sigma \propto r^{3/2}$`, md`$\sigma \propto r^{-1/2}$, diverging`, md`$\sigma$ stays constant`, md`$\sigma \propto r^{1/2}$, going to zero`],
        3,
        [md`$r^{3/2} = r^{\pi/\alpha}$ is the potential's power. $\sigma$ follows the field, one power lower.`,
          md`Divergence needs a protruding edge, $\alpha > \pi$. A $120^\circ$ hollow has $\alpha < \pi$.`,
          md`Constant $\sigma$ is the flat case, $\alpha = \pi$.`,
          null],
        md`$\sigma = \varepsilon_0E_\perp \propto r^{\pi/\alpha - 1} = r^{3/2 - 1} = r^{1/2}$. Any hollow ($\alpha<\pi$) starves its corner of charge; the wider the hollow, the slower the decrease, until the exponent reaches $0$ at $\alpha = \pi$.`,
        { figHtml: W120 }),

      Q(md`The field region outside a right-angle metal edge is a wedge with $\alpha = 3\pi/2$, with metal on both faces. Which $k$ are allowed?`,
        [md`$k = \tfrac23, \tfrac43, 2, \dots$`, md`$k = \tfrac32, 3, \tfrac92, \dots$`, md`$k = 1, 2, 3, \dots$`, md`$k = 2, 4, 6, \dots$`],
        0,
        [null,
          md`That is $n\alpha/\pi$, upside down. The rule is $k = n\pi/\alpha$.`,
          md`Integers need $\alpha = \pi$ (or a full circle). This region is three quarters of a turn.`,
          md`That is the **inside** of a right-angle corner, $\alpha = \pi/2$.`],
        md`$k = n\pi/\alpha = \frac{2n}{3}$. The lowest, $k = \tfrac23<1$, is what makes the field diverge at the edge: $E\propto r^{k-1} = r^{-1/3}$. Any $\alpha > \pi$ gives a lowest $k$ below $1$, and a divergent field.`,
        { figHtml: CORNER }),

      P({
        title: 'Lightning rods: the vertex exponent',
        q: md`Near the vertex of a wedge-shaped field region of opening $\alpha$ bounded by metal at one potential, $\Phi \approx c\,r^{\pi/\alpha}\sin(\pi\theta/\alpha)$ (measuring $\Phi$ from the metal's potential).

          (a) Give the exponent $p$ in $|\vb E| \propto r^{p}$. (b) Its value for the region outside a right-angle edge, $\alpha = 3\pi/2$. (c) For the edge of a thin sheet, $\alpha = 2\pi$. (d) Which opening is the threshold between a vanishing and a divergent field?`,
        figHtml: TIPS.svg,
        hints: [md`$E_r = -\partial\Phi/\partial r$ and $E_\theta = -\frac1r\partial\Phi/\partial\theta$: both lower the power of $r$ by one.`, md`Plug in the numbers.`],
        parts: [
          { lbl: md`(a) $p$`, expr: 'pi/alpha - 1', vars: { alpha: [0.5, 6] } },
          { lbl: md`(b) $p$ for $\alpha = 3\pi/2$`, ans: -0.3333, unit: '' },
          { lbl: md`(c) $p$ for $\alpha = 2\pi$`, ans: -0.5, unit: '' },
          { lbl: md`(d) Threshold`, mc: [md`$\alpha = \pi/2$`, md`$\alpha = \pi$`, md`$\alpha = 3\pi/2$`, md`$\alpha = 2\pi$`], a: 1,
            why: [md`At $\pi/2$, $p = 1$: the field vanishes.`, null, md`At $3\pi/2$, $p = -1/3$: already divergent.`, md`At $2\pi$, $p = -1/2$: already divergent.`] },
        ],
        sol: md`
          $E_r = -c\frac{\pi}{\alpha}r^{\pi/\alpha - 1}\sin\frac{\pi\theta}{\alpha}$ and $E_\theta = -c\frac{\pi}{\alpha}r^{\pi/\alpha-1}\cos\frac{\pi\theta}{\alpha}$, so $|\vb E| = c\frac{\pi}{\alpha}r^{\pi/\alpha - 1}$ (in fact independent of $\theta$).

          (a) $p = \pi/\alpha - 1$. (b) $\frac23 - 1 = -\frac13$. (c) $\frac12 - 1 = -\frac12$. (d) $p = 0$ at $\alpha = \pi$: a flat conductor.

          **Why the lowest mode:** the next mode is $r^{2\pi/\alpha}$, smaller by a factor $r^{\pi/\alpha}$, which vanishes as $r\to0$ for any $\alpha$.

          **What to remember:** $\sigma$ and $E$ near an edge scale as $r^{\pi/\alpha - 1}$; protruding edges ($\alpha>\pi$) diverge, hollows ($\alpha<\pi$) vanish.
        `,
      }),

      P({
        title: 'A wedge out to infinity',
        q: md`A wedge with grounded walls at $\theta = 0$ and $\theta = \alpha$ extends from a metal arc at $r = a$ (held at $V_0$, insulated from the walls) out to infinity, where $\Phi \to 0$.

          (a) Which radial function goes with $\sin(n\pi\theta/\alpha)$? (b) For $\alpha = \pi/2$, evaluate $\Phi(2a,\pi/4)/V_0$ from the full series, and (c) from the first term.`,
        figHtml: OUTW_P,
        hints: [md`Infinity is in the region: drop $r^{+k}$.`, md`At $r = a$ you need the sine series of $V_0$, so normalise the radial function to $1$ there: $(a/r)^k$.`],
        parts: [
          { lbl: md`(a) Radial function`, mc: [md`$(r/a)^{n\pi/\alpha}$`, md`$(a/r)^{n\pi/\alpha}$`, md`$(r/a)^{n\pi/\alpha} - (a/r)^{n\pi/\alpha}$`, md`$\ln(r/a)$`], a: 1,
            why: [md`Grows without bound as $r\to\infty$.`, null, md`This vanishes at $r = a$, the live arc, and grows at infinity.`, md`$k = 0$ is killed by the grounded walls.`] },
          { lbl: md`(b) $\Phi(2a,\pi/4)/V_0$, full series`, ans: 0.31192, unit: '' },
          { lbl: md`(c) First term only`, ans: 0.31831, unit: '' },
        ],
        sol: md`
          **BCs:** (1) $\Phi(r,0) = 0$; (2) $\Phi(r,\alpha) = 0$; (3) $\Phi(a,\theta) = V_0$; (4) $\Phi\to0$ as $r\to\infty$.

          (1), (2): $\sin(n\pi\theta/\alpha)$. (4): no $r^{k}$. (3): the sine series of $V_0$:
          $$\Phi(r,\theta) = \frac{4V_0}{\pi}\sum_{n\text{ odd}}\frac1n\left(\frac ar\right)^{n\pi/\alpha}\sin\frac{n\pi\theta}{\alpha}.$$
          This is the pie slice turned inside out ($r/b \to a/r$): inversion $r \to a^2/r$ maps one onto the other.

          **Numbers** ($\alpha = \pi/2$: $k = 2n$; $r = 2a$: $(a/r)^{k} = 4^{-n}$; $\theta = \pi/4$: $\sin(n\pi/2)$):
          $n = 1$: $\frac4\pi\cdot\frac14 = 0.31831$; $n = 3$: $-\frac{4}{3\pi}\cdot\frac1{64} = -0.00663$; $n = 5$: $+0.00025$. Full: $0.31192\,V_0$. The first term is $2\%$ high.
        `,
      }),

      P({
        title: 'The exam sector, reversed',
        q: md`Same annular sector as the exam ($a<r<b$, $0<\theta<\alpha$, grounded walls), but now the **inner** arc is at $V_0$ and the **outer** arc is grounded.

          (a) Which radial combination goes with $\sin(n\pi\theta/\alpha)$? (b) For $\alpha = \pi/2$, $b = 2a$, evaluate $\Phi(1.5a,\pi/4)/V_0$. (c) What does the **sum** of this answer and the exam answer describe?`,
        figHtml: REV_P,
        hints: [md`Now the radial function must vanish at $r = b$.`, md`Normalise it to $1$ at $r = a$ and the coefficients are again the sine series of $V_0$.`],
        parts: [
          { lbl: md`(a) Radial combination`, mc: [md`$(r/a)^k - (a/r)^k$`, md`$(b/r)^k - (r/b)^k$`, md`$(b/r)^k$`, md`$(r/b)^k$`], a: 1,
            why: [md`Vanishes at $r = a$, the live arc.`, null, md`Not zero at $r = b$.`, md`Not zero at $r = b$ either.`] },
          { lbl: md`(b) $\Phi(1.5a,\pi/4)/V_0$`, ans: 0.38040, unit: '' },
          { lbl: md`(c) The sum describes`, mc: [md`Both arcs at $V_0$, walls grounded`, md`Everything at $V_0$`, md`Nothing physical`, md`Both arcs grounded, walls at $V_0$`], a: 0,
            why: [null, md`The walls stay grounded in both problems, so they stay grounded in the sum.`, md`Superposition: the sum satisfies Laplace with the summed boundary values.`, md`The walls are zero in both pieces.`] },
        ],
        sol: md`
          **BCs:** (1) $\Phi(a,\theta) = V_0$; (2) $\Phi(r,0) = 0$; (3) $\Phi(r,\alpha) = 0$; (4) $\Phi(b,\theta) = 0$.

          (2), (3): $\sin k\theta$, $k = n\pi/\alpha$. (4): $R(b) = 0 \Rightarrow R \propto (b/r)^k - (r/b)^k$. (1): normalise by the value at $r = a$:
          $$\Phi = \sum_{n\text{ odd}}\frac{4V_0}{n\pi}\,\sin k\theta\;\frac{(b/r)^{k} - (r/b)^{k}}{(b/a)^{k} - (a/b)^{k}} .$$

          **Numbers** ($k = 2n$, $b/r = 4/3$, $b/a = 2$, $\sin(n\pi/2)$): $n = 1$: $\frac4\pi\cdot\frac{(16/9) - (9/16)}{4 - 1/4} = 1.2732\times0.3241 = 0.4126$; $n = 3$: $-0.0361$; $n = 5$: $+0.0044$; $n = 7$: $-0.0006$; ... total $0.3804\,V_0$.

          (c) The exam answer at the same point is $0.5498\,V_0$. The sum, $0.9302\,V_0$, is the potential with **both** arcs at $V_0$ and the walls grounded: it satisfies all four summed boundary conditions, so by uniqueness it is that potential. It is below $V_0$ because the grounded walls pull it down.
        `,
      }),

      RF(md`
        ### The $k = 0$ term: walls at different potentials

        Two metal plates meet along the $z$-axis at angle $\alpha$ (insulated from each other at the edge). One is grounded and one is at $V_0$. No arcs: the region is the whole wedge, $0<r<\infty$.

        [[fig:tw]]

        **BCs:** (1) $\Phi(r,0) = 0$; (2) $\Phi(r,\alpha) = V_0$.

        !!trap Sines can't do this
          Every $\sin(n\pi\theta/\alpha)$ is **zero** at $\theta = \alpha$. No sum of them can equal $V_0$ there. And there is no arc on which to do a Fourier expansion. You need the $k = 0$ solution, which you might have thrown away: $\Theta = A + B\theta$.

        The $k = 0$ term $A + B\theta$ (times the $r$-independent radial solution $1$) does it at once: $A = 0$, $B = V_0/\alpha$,
        $$\Phi(r,\theta) = \frac{V_0\,\theta}{\alpha}.$$
        It satisfies Laplace ($\partial^2\theta/\partial\theta^2 = 0$), both BCs, and nothing else is needed, so by uniqueness (plus suitable behaviour at $0$ and $\infty$) it is the answer. The equipotentials are rays; the field lines are circular arcs from one plate to the other:
        $$\vb E = -\frac1r\frac{\partial\Phi}{\partial\theta}\,\hat{\boldsymbol\theta} = -\frac{V_0}{\alpha r}\,\hat{\boldsymbol\theta}.$$
        The field falls like $1/r$ because the arc from plate to plate has length $\alpha r$.
      `, { tw: { svg: TWOWALL, cap: 'Two plates meeting at an angle, one grounded and one at $V_0$, insulated at the edge.' } }),

      Q(md`In the two-plate problem, a student writes $\Phi = \sum_n C_n r^{n\pi/\alpha}\sin(n\pi\theta/\alpha)$ and tries to fit $\Phi(r,\alpha) = V_0$. Why does this fail?`,
        [md`The radial powers are wrong`,
          md`Every term vanishes at $\theta = \alpha$, so the sum is $0$ there, not $V_0$`,
          md`The series converges too slowly`,
          md`It needs cosines instead`],
        1,
        [md`The powers are fine; the angular functions are the problem.`,
          null,
          md`Convergence isn't the issue: the sum is identically zero on the wall.`,
          md`Cosines would spoil $\Phi(r,0) = 0$, and $\cos(n\pi\theta/\alpha)$ at $\alpha$ is $\pm1$ for every $r$, which can't match a constant $V_0$ with $r$-dependent coefficients.`],
        md`The sines were chosen to vanish on both walls. A nonzero wall needs the $k = 0$ term $V_0\theta/\alpha$. In Cartesian language: the slot with its top plate at $V_1$ needs the $k=0$ term $V_1y/a$.`,
        { figHtml: TWOWALL }),

      Q(md`A pie slice $0<r<b$, $0<\theta<\alpha$ has **both** walls held at $V_0$ (they touch at the vertex) and its arc grounded (insulated from the walls). What is the efficient first step?`,
        [md`Expand $V_0$ in $\sin(n\pi\theta/\alpha)$ and fit the walls`,
          md`Use $V_0\theta/\alpha$ for the walls`,
          md`Use $\cos(n\pi\theta/\alpha)$, which is nonzero on the walls`,
          md`Write $\Phi = V_0 + \Phi_2$: the constant fixes both walls, and $\Phi_2$ has grounded walls and the arc at $-V_0$`],
        3,
        [md`Sines vanish on both walls; no sum of them equals $V_0$ there.`,
          md`$V_0\theta/\alpha$ is $0$ on the wall $\theta = 0$, not $V_0$.`,
          md`$\cos(n\pi\theta/\alpha)$ takes the values $1$ and $(-1)^n$ on the two walls with $r$-dependent coefficients; it can't give $V_0$ for every $r$.`,
          null],
        md`The constant is the $k = 0$ solution with $B = 0$. Then $\Phi_2 = -\sum_{n\text{ odd}}\frac{4V_0}{n\pi}(r/b)^{k}\sin k\theta$, and $\Phi = V_0 - (\text{pie-slice answer})$. Symmetric idea to the slot with both plates at $V_1$.`,
        { figHtml: wedge({ al: 60, a: 0, b: 140, r0: 8, w0: '\\Phi=V_0', wA: '\\Phi=V_0', outer: '\\Phi=0', O: false }) }),

      Q(md`Two plates meet at angle $\alpha$ (insulated at the edge): $\Phi = V_1$ on $\theta = 0$ and $\Phi = V_2$ on $\theta = \alpha$. What is $\Phi$ between them?`,
        [md`$\dfrac{(V_1 + V_2)\,\theta}{\alpha}$`, md`$V_1 + \dfrac{(V_2 - V_1)\,\theta}{\alpha}$`, md`$\dfrac{V_2\,\theta}{\alpha}$`, md`$V_1 + \dfrac{V_2\,\theta}{\alpha}$`],
        1,
        [md`At $\theta = 0$ this gives $0$, not $V_1$.`,
          null,
          md`That grounds the first plate. You need the constant $V_1$ too.`,
          md`At $\theta = \alpha$ this gives $V_1 + V_2$.`],
        md`Both pieces are $k = 0$ solutions: the constant $A$ and $B\theta$. The first wall gives $A = V_1$, the second $B\alpha = V_2 - V_1$. Check both walls before moving on: it takes five seconds and catches most sign slips.`,
        { figHtml: TWOV }),

      P({
        title: 'Two plates at an angle: field and charge',
        q: md`For the two plates at angle $\alpha$ (wall $\theta = 0$ grounded, wall $\theta = \alpha$ at $V_0$), find (a) $E_\theta$, (b) the surface charge density on the grounded plate, (c) the charge per unit length ($z$) on the live plate between $r = a$ and $r = b$.`,
        figHtml: TWOWALL_AB,
        hints: [md`$\Phi = V_0\theta/\alpha$. Use the polar gradient: $E_\theta = -\frac1r\partial_\theta\Phi$.`, md`$\sigma = \varepsilon_0\,\vb E\cdot\hat{\mathbf n}$ with $\hat{\mathbf n}$ pointing from the metal into the field region: $+\hat{\boldsymbol\theta}$ on the plate at $\theta = 0$, $-\hat{\boldsymbol\theta}$ on the plate at $\theta = \alpha$.`, md`Integrate $\sigma$ along the plate: $\int_a^b\sigma\,dr$.`],
        parts: [
          { lbl: md`(a) $E_\theta$`, expr: '-V0/(alpha*r)', vars: { V0: [1, 3], alpha: [0.5, 3], r: [0.5, 3] } },
          { lbl: md`(b) $\sigma$ on the grounded plate ($\theta = 0$)`, expr: '-eps0*V0/(alpha*r)', vars: { eps0: [0.5, 2], V0: [1, 3], alpha: [0.5, 3], r: [0.5, 3] } },
          { lbl: md`(c) Charge per length on the live plate, $a<r<b$`, expr: 'eps0*V0*ln(b/a)/alpha', vars: { eps0: [0.5, 2], V0: [1, 3], alpha: [0.5, 3], a: [0.5, 1], b: [2, 4] }, accepts: ['eps0*V0*(ln(b)-ln(a))/alpha'] },
        ],
        sol: md`
          (a) $\Phi = V_0\theta/\alpha \Rightarrow E_r = 0$, $E_\theta = -\dfrac1r\dfrac{V_0}{\alpha} = -\dfrac{V_0}{\alpha r}$. For $V_0>0$ the field circles from the live plate toward the grounded one (the $-\hat{\boldsymbol\theta}$ direction).

          (b) On the plate at $\theta = 0$ the normal into the region is $+\hat{\boldsymbol\theta}$: $\sigma_0 = \varepsilon_0E_\theta = -\dfrac{\varepsilon_0V_0}{\alpha r}$. Negative, as it should be on the lower-potential plate.

          (c) On the plate at $\theta = \alpha$ the normal into the region is $-\hat{\boldsymbol\theta}$: $\sigma_\alpha = -\varepsilon_0E_\theta = +\dfrac{\varepsilon_0V_0}{\alpha r}$. Then
          $$\lambda = \int_a^b\frac{\varepsilon_0V_0}{\alpha r}\,dr = \frac{\varepsilon_0V_0}{\alpha}\ln\frac ba .$$

          **Checks.** Equal and opposite charges on matching stretches of the two plates. The $1/r$ density means the total charge diverges logarithmically both at the edge and far away, which is why real problems put arcs or gaps there.
        `,
      }),

      P({
        title: 'Quarter annulus with a single mode on the arc (Kou-level)', big: true,
        q: md`A quarter-annulus $a<r<b$, $0<\theta<\pi/2$ has its inner arc and both walls grounded. The outer arc is held at $\Phi(b,\theta) = V_0\sin2\theta$.

          (a) List the BCs and find $\Phi(r,\theta)$. (b) For $b = 2a$, find $E_r$ and $E_\theta$ at $r = 1.5a$, $\theta = \pi/8$, in units of $V_0/a$. (c) Find the surface charge density on the wall $\theta = 0$, and (d) on the inner arc.`,
        figHtml: QA_SIN_P,
        hints: [
          md`$\alpha = \pi/2 \Rightarrow k = 2n$. The boundary data $\sin 2\theta$ is exactly the $n = 1$ mode: one term, no integrals.`,
          md`Radial: $(r/a)^2 - (a/r)^2$ (vanishes at $r = a$), divided by its value at $r = b$.`,
          md`$E_r = -\partial_r\Phi$, $E_\theta = -\frac1r\partial_\theta\Phi$. $\sigma = \varepsilon_0\vb E\cdot\hat{\mathbf n}$, $\hat{\mathbf n}$ into the region: $+\hat{\boldsymbol\theta}$ on the wall $\theta = 0$, $+\hat{\mathbf r}$ on the inner arc.`],
        parts: [
          { lbl: md`(a) $\Phi(r,\theta)$`, expr: 'V0*sin(2*theta)*b^2*(r^4 - a^4)/(r^2*(b^4 - a^4))', vars: { V0: [1, 2], theta: [0.1, 1.4], r: [1.1, 1.9], a: [0.5, 1], b: [2, 3] }, accepts: ['V0*sin(2*theta)*((r/a)^2-(a/r)^2)/((b/a)^2-(a/b)^2)'] },
          { lbl: md`(b) $E_r$ at $(1.5a,\pi/8)$, units $V_0/a$`, ans: -0.67743, unit: '' },
          { lbl: md`(b) $E_\theta$ at $(1.5a,\pi/8)$, units $V_0/a$`, ans: -0.45395, unit: '' },
          { lbl: md`(c) $\sigma(r)$ on the wall $\theta = 0$`, expr: '-2*eps0*V0*b^2*(r^4 - a^4)/(r^3*(b^4 - a^4))', vars: { eps0: [0.5, 2], V0: [1, 2], r: [1.1, 1.9], a: [0.5, 1], b: [2, 3] } },
          { lbl: md`(d) $\sigma(\theta)$ on the inner arc`, expr: '-4*eps0*V0*a*b^2*sin(2*theta)/(b^4 - a^4)', vars: { eps0: [0.5, 2], V0: [1, 2], theta: [0.1, 1.4], a: [0.5, 1], b: [2, 3] } },
        ],
        sol: md`
          **(a) Region** $a<r<b$, $0<\theta<\pi/2$. **BCs:**
          1. $\Phi(a,\theta) = 0$
          2. $\Phi(r,0) = 0$
          3. $\Phi(r,\pi/2) = 0$
          4. $\Phi(b,\theta) = V_0\sin2\theta$

          #2, #3: $\sin(2n\theta)$. #1: $(r/a)^{2n} - (a/r)^{2n}$. #4 is the $n = 1$ mode alone, so by orthogonality only $n = 1$ survives:
          $$\Phi = V_0\sin 2\theta\,\frac{(r/a)^2 - (a/r)^2}{(b/a)^2 - (a/b)^2} = V_0\sin2\theta\,\frac{b^2(r^4 - a^4)}{r^2(b^4-a^4)} .$$

          **(b)** Write $\Phi = K\sin2\theta\,(r^2 - a^4/r^2)$ with $K = \dfrac{V_0b^2}{b^4 - a^4}$.
          $$E_r = -K\sin2\theta\left(2r + \frac{2a^4}{r^3}\right),\qquad E_\theta = -\frac{2K\cos2\theta}{r}\left(r^2 - \frac{a^4}{r^2}\right).$$
          With $a = 1$, $b = 2$, $r = 1.5$, $\theta = \pi/8$: $K = 4/15$, $\sin(\pi/4) = \cos(\pi/4) = 0.7071$; $E_r = -\frac{4}{15}(0.7071)(3 + 0.5926) = -0.6774\,V_0/a$; $E_\theta = -\frac{2(4/15)(0.7071)}{1.5}(2.25 - 0.4444) = -0.4539\,V_0/a$.

          Directions make sense: $\Phi$ grows toward the live arc, so $E$ points inward ($E_r<0$); and at $\theta = \pi/8$, below the bisector, $\Phi \propto \sin2\theta$ still grows with $\theta$, so $E_\theta < 0$ (the field points back toward the wall $\theta = 0$).

          **(c)** On $\theta = 0$: $\sigma = \varepsilon_0E_\theta(r,0) = -\dfrac{2\varepsilon_0V_0b^2(r^4-a^4)}{r^3(b^4-a^4)}$. Zero at the inner corner $r = a$, largest near the live arc.

          **(d)** On $r = a$: $\sigma = \varepsilon_0E_r(a,\theta) = -K\varepsilon_0\sin2\theta\,(2a + 2a) = -\dfrac{4\varepsilon_0V_0ab^2\sin2\theta}{b^4-a^4}$.

          Both are negative: every grounded surface faces a region at higher potential. The live arc carries the matching positive charge.
        `,
      }),

      P({
        title: 'Quarter annulus with a ramp on the arc',
        q: md`Same quarter-annulus ($a<r<b$, $0<\theta<\pi/2$; inner arc and walls grounded), but the outer arc is held at $\Phi(b,\theta) = V_0\theta$.

          (a) Find the Fourier coefficients $c_n$ in $V_0\theta = \sum_n c_n\sin 2n\theta$ on $0<\theta<\pi/2$. (b) For $b = 2a$, evaluate $\Phi(1.5a, \pi/4)/V_0$.`,
        figHtml: QA_RAMP,
        hints: [md`$c_n = \dfrac{2}{\pi/2}\displaystyle\int_0^{\pi/2}V_0\theta\sin 2n\theta\,d\theta$. Integrate by parts.`, md`The radial factor normalised to $1$ at $r = b$: $\dfrac{(r/a)^{2n} - (a/r)^{2n}}{(b/a)^{2n} - (a/b)^{2n}}$.`],
        parts: [
          { lbl: md`(a) $c_1/V_0$`, ans: 1, unit: '' },
          { lbl: md`(a) $c_2/V_0$`, ans: -0.5, unit: '' },
          { lbl: md`(a) $c_n$ for odd $n$`, expr: 'V0/n', vars: { V0: [1, 3], n: [1, 9] } },
          { lbl: md`(b) $\Phi(1.5a,\pi/4)/V_0$`, ans: 0.43181, unit: '' },
        ],
        sol: md`
          **BCs:** (1) $\Phi(a,\theta) = 0$; (2) $\Phi(r,0) = 0$; (3) $\Phi(r,\pi/2) = 0$; (4) $\Phi(b,\theta) = V_0\theta$.

          (2), (3), (1) give the same modes as before: $\sin2n\theta\,[(r/a)^{2n} - (a/r)^{2n}]$.

          **(a)** By parts, with $\int\theta\sin 2n\theta\,d\theta = -\dfrac{\theta\cos2n\theta}{2n} + \dfrac{\sin2n\theta}{4n^2}$:
          $$c_n = \frac{4V_0}{\pi}\left[-\frac{\theta\cos 2n\theta}{2n}\right]_0^{\pi/2} = \frac{4V_0}{\pi}\left(-\frac{\pi}{4n}\cos n\pi\right) = \frac{(-1)^{n+1}V_0}{n}.$$
          ($\sin 2n\theta$ vanishes at both ends.) So $c_1 = V_0$, $c_2 = -V_0/2$, $c_3 = V_0/3$, ... All $n$ appear, with alternating signs, because a ramp is not symmetric about the bisector.

          **(b)**
          $$\Phi = \sum_{n=1}^\infty\frac{(-1)^{n+1}V_0}{n}\sin 2n\theta\,\frac{(r/a)^{2n} - (a/r)^{2n}}{(b/a)^{2n} - (a/b)^{2n}}.$$
          At $\theta = \pi/4$, $\sin(n\pi/2)$ kills even $n$. $n = 1$: $1\cdot\frac{2.25 - 0.4444}{4 - 0.25} = 0.4815$; $n = 3$: $\frac13(-1)\frac{11.39 - 0.088}{64 - 0.0156} = -0.0589$; $n = 5$: $+0.0113$; $n = 7$: $-0.0025$; ... Sum: $0.4318\,V_0$.

          **Check:** the arc value at $\theta = \pi/4$ is $V_0\pi/4 = 0.785\,V_0$; at $r = 1.5a$, partway in, the potential is lower, as it should be.
        `,
      }),

      P({
        title: 'The exam sector by the numbers',
        q: md`Take the exam's answer with $\alpha = \pi/2$ and $b = 2a$. At the point $r = 1.5a$, $\theta = \pi/4$ find (a) the first term of the series, (b) the full potential, (c) $E_r$ and (d) $E_\theta$, in units of $V_0$ and $V_0/a$.`,
        figHtml: EXAM_NUM,
        hints: [md`$k = 2n$, odd $n$ only, $\sin(2n\cdot\pi/4) = \sin(n\pi/2) = \pm1$.`, md`$E_r = -\sum C_n\sin k\theta\,\frac{k}{r}\left[(r/a)^k + (a/r)^k\right]$.`, md`On the bisector, symmetry: is $\Phi$ a maximum in $\theta$ there?`],
        parts: [
          { lbl: md`(a) First term, $\Phi_1/V_0$`, ans: 0.61304, unit: '' },
          { lbl: md`(b) Full series, $\Phi/V_0$`, ans: 0.54980, unit: '' },
          { lbl: md`(c) $E_r$ in units of $V_0/a$`, ans: -0.98790, unit: '' },
          { lbl: md`(d) $E_\theta$`, mc: [md`$0$, by symmetry about the bisector`, md`Positive`, md`Negative`, md`Infinite`], a: 0,
            why: [null, md`The setup is symmetric under $\theta \to \alpha - \theta$, so $\Phi$ is stationary in $\theta$ on the bisector.`, md`Same symmetry argument.`, md`Nothing is singular inside the region.`] },
        ],
        sol: md`
          $C_n = \dfrac{4V_0}{n\pi}\Big/\left[2^{2n} - 2^{-2n}\right]$ for odd $n$; at the point, $\sin k\theta = \sin(n\pi/2)$ and the bracket is $1.5^{2n} - 1.5^{-2n}$.

          **(a)** $n = 1$: $\dfrac{4}{\pi}\cdot\dfrac{2.25 - 0.4444}{4 - 0.25} = 1.2732\times0.4815 = 0.6130$.

          **(b)** $n = 3$: $-\dfrac{4}{3\pi}\cdot\dfrac{11.39 - 0.0878}{64 - 0.0156} = -0.0750$; $n = 5$: $+0.0143$; $n = 7$: $-0.0032$; ... total $0.5498\,V_0$. The first term is $11\%$ high: the point is close enough to the live arc that higher modes matter.

          [[fig:bis]]

          **(c)** $E_r = -\partial_r\Phi = -\sum C_n\sin k\theta\,\dfrac kr\left[(r/a)^k + (a/r)^k\right]$. Summing: $E_r = -0.988\,V_0/a$ (first term alone: $-1.220$). Negative: the field points inward, away from the live outer arc.

          **(d)** $\partial_\theta\sin k\theta = k\cos(n\pi/2) = 0$ for odd $n$: $E_\theta = 0$ on the bisector. Symmetry would have told you without computing.
        `,
        figs: { bis: { svg: BISECT, cap: '$\\Phi$ along the bisector: the full series (solid) and the first term (dashed). The dot is the point $r = 1.5a$.' } },
      }),

      Q(md`For the exam sector ($\alpha = \pi/2$, $b = 2a$) at $r = 1.5a$ on the bisector, the first term is $11\%$ above the full series. For the pie slice ($\alpha = \pi/3$) at $r = b/2$ it is within $0.5\%$. What makes the difference?`,
        [md`The exam series contains even $n$ as well`,
          md`The exam's Fourier coefficients are larger`,
          md`The inner arc adds a second series`,
          md`The exam point is closer to the live arc ($r/b = 0.75$), and $k = 2n$ grows more slowly than $3n$, so the higher modes are damped much less`],
        3,
        [md`Both series have odd $n$ only: a constant on the arc is symmetric about the bisector.`,
          md`Both use the same $\frac{4V_0}{n\pi}$ from the constant on the arc.`,
          md`The inner arc is grounded; it only shapes the radial function. There is one series.`,
          null],
        md`The $n = 3$ term relative to $n = 1$ is roughly $\frac13(0.75)^4 \approx 0.1$ at the exam point and $\frac13(0.5)^6 \approx 0.005$ for the pie slice. Two things set the damping: how far you are from the live arc, and how fast $k$ grows with $n$ (a narrower wedge damps faster).`,
        { figHtml: EXAM_NUM }),

      RF(md`
        ### The hard variant: walls at different potentials **and** arcs present

        Now combine the two difficulties: the annular sector $a<r<b$, $0<\theta<\alpha$ with the wall $\theta = \alpha$ at $V_0$ and **everything else grounded** (wall $\theta = 0$ and both arcs).

        The walls are no longer both zero, so the sines don't fit; but the arcs are not consistent with $V_0\theta/\alpha$ either (they are grounded). The trick is **superposition**: subtract the simple solution that fixes the walls.
        $$\Phi = \frac{V_0\theta}{\alpha} + \Phi_2 .$$

        [[fig:sup]]

        $V_0\theta/\alpha$ satisfies Laplace and both wall conditions. So $\Phi_2$ must have **grounded walls** (now sines work again) and arcs at $0 - V_0\theta/\alpha = -V_0\theta/\alpha$. That is the exam problem with nonzero data on **both** arcs. Expand $-V_0\theta/\alpha$ in sines:
        $$-\frac{V_0\theta}{\alpha} = \sum_n g_n\sin\frac{n\pi\theta}{\alpha},\qquad g_n = -\frac2\alpha\int_0^\alpha\frac{V_0\theta}{\alpha}\sin\frac{n\pi\theta}{\alpha}\,d\theta = \frac{2V_0(-1)^n}{n\pi}.$$
        For each $n$ you need a radial function equal to $1$ at **both** $r = a$ and $r = b$: $R_n = Ar^k + Br^{-k}$ with $R_n(a) = R_n(b) = 1$ gives
        $$R_n(r) = \frac{r^{k} + (ab)^{k}r^{-k}}{a^{k} + b^{k}},\qquad k = \frac{n\pi}{\alpha}.$$
        $$\boxed{\Phi = \frac{V_0\theta}{\alpha} + \sum_{n=1}^\infty\frac{2V_0(-1)^n}{n\pi}\,\sin\frac{n\pi\theta}{\alpha}\,\frac{r^{k} + (ab)^{k}r^{-k}}{a^{k} + b^{k}}}$$

        !!method Superposition recipe for two kinds of inhomogeneous boundary
          1. Find the simplest function that satisfies Laplace and the troublesome conditions (here $V_0\theta/\alpha$ for the walls).
          2. Subtract it. The remainder satisfies Laplace with **homogeneous** conditions where the troublesome ones were, and modified data elsewhere.
          3. Solve the remainder by the usual sine-series method. Its data are the old data minus the simple function.

        !!intuition Another route
          You could instead put the oscillation in $r$: with both arcs grounded, the functions $\sin\!\left(\mu\ln(r/a)\right)$ with $\mu = m\pi/\ln(b/a)$ vanish on both arcs, and the angular partner is $\sinh(\mu\theta)$. That gives $\Phi = \sum_{m\text{ odd}}\frac{4V_0}{m\pi}\sin(\mu\ln\frac ra)\frac{\sinh\mu\theta}{\sinh\mu\alpha}$, the same function written in a different basis. (This is the case where the "wrong" sign of the separation constant is the right one.) Both series give the same numbers below.
      `, { sup: { svg: SUPER.svg, cap: 'Superposition: the wall problem $V_0\\theta/\\alpha$ (solved), plus a problem with grounded walls and arcs at $-V_0\\theta/\\alpha$.' } }),

      Q(md`In the superposition $\Phi = V_0\theta/\alpha + \Phi_2$, what boundary values does $\Phi_2$ have on the **inner arc** $r = a$ (which is grounded in the original problem)?`,
        [md`$0$`, md`$V_0$`, md`$-V_0\theta/\alpha$`, md`$V_0\theta/\alpha$`],
        2,
        [md`The original arc is $0$, but $V_0\theta/\alpha$ isn't zero there, so $\Phi_2$ has to cancel it.`,
          md`$\Phi_2$ on the arc must make the total zero, and $V_0\theta/\alpha$ varies with $\theta$.`,
          null,
          md`Sign error: total $= V_0\theta/\alpha + \Phi_2 = 0 \Rightarrow \Phi_2 = -V_0\theta/\alpha$.`],
        md`Total on the arc: $V_0\theta/\alpha + \Phi_2(a,\theta) = 0$. So $\Phi_2(a,\theta) = -V_0\theta/\alpha$, and the same on the outer arc. Its walls are $0 - 0 = 0$ and $V_0 - V_0 = 0$: homogeneous, so sines work.`,
        { figHtml: HARD }),

      Q(md`Why is $R_n(r) = \dfrac{r^{k} + (ab)^{k}r^{-k}}{a^{k} + b^{k}}$ the right radial function in the hard variant?`,
        [md`It vanishes at $r = a$`, md`It equals $1$ at both $r = a$ and $r = b$, because $\Phi_2$ has the **same** data on both arcs`, md`It vanishes at $r = b$`, md`It is finite at $r = 0$`],
        1,
        [md`Plug in $r = a$: $(a^k + b^k)/(a^k + b^k) = 1$, not $0$.`,
          null,
          md`At $r = b$ it equals $1$ too.`,
          md`$r = 0$ is not in the region; this has an $r^{-k}$ term.`],
        md`Both arcs carry $-V_0\theta/\alpha$, so each mode needs the same coefficient $g_n$ at $r = a$ and $r = b$. The radial function must therefore be $1$ at both ends. It sags in between (minimum at $r = \sqrt{ab}$, symmetric under $r\to ab/r$). If the arcs had different data you would add two pieces, one vanishing at each arc.`,
        { figHtml: HARD }),

      Q(md`In the hard variant, after subtracting $V_0\theta/\alpha$, the arcs carry $-V_0\theta/\alpha$. Which modes appear in its sine series?`,
        [md`Odd $n$ only, as for a constant`, md`Even $n$ only`, md`$n = 1$ only`, md`All $n$, with alternating signs: $g_n = \dfrac{2V_0(-1)^n}{n\pi}$`],
        3,
        [md`A ramp is not symmetric about the bisector, so even modes survive.`,
          md`A ramp isn't antisymmetric about the bisector either (its average isn't zero), so odd modes survive too.`,
          md`A ramp is not a single sine mode.`,
          null],
        md`$\theta$ on $(0,\alpha)$ is neither symmetric nor antisymmetric about $\alpha/2$, so every $n$ appears. Integrating by parts, $\int_0^\alpha\theta\sin\frac{n\pi\theta}{\alpha}\,d\theta = -\frac{\alpha^2}{n\pi}\cos n\pi$, which is where the $(-1)^n$ comes from.`,
        { figHtml: HARD }),

      Q(md`In the hard variant you want a **single** series, with no superposition. Which separated factor has to oscillate?`,
        [md`The angular factor $\sin(n\pi\theta/\alpha)$, as always`,
          md`Neither: $V_0\theta/\alpha$ alone does it`,
          md`The angular factor $\cos(n\pi\theta/\alpha)$`,
          md`The radial factor, $\sin\!\big(\mu\ln(r/a)\big)$, because the two zero conditions in one direction are now the two arcs`],
        3,
        [md`Every $\sin(n\pi\theta/\alpha)$ vanishes on the live wall, so no sine series in $\theta$ alone can reach $V_0$ there. That route needs the subtraction first.`,
          md`$V_0\theta/\alpha$ is not zero on the grounded arcs.`,
          md`$\cos(n\pi\theta/\alpha)$ equals $1$ on the grounded wall $\theta = 0$, so it breaks that condition.`,
          null],
        md`The rule never changes: the direction with **two homogeneous conditions** oscillates. Here $r$ has two (both arcs grounded) and $\theta$ has only one. In polar coordinates "oscillate in $r$" means oscillate in $\ln r$: $\sin(\mu\ln(r/a))$, with an angular partner that vanishes on the grounded wall.`,
        { figHtml: HARD }),

      Q(md`In that radial-oscillation route, what must $\mu$ be so that $\sin\!\big(\mu\ln(r/a)\big)$ also vanishes on the outer arc $r = b$?`,
        [md`$\mu = \dfrac{m\pi}{\ln(b/a)}$`, md`$\mu = \dfrac{m\pi}{b - a}$`, md`$\mu = \dfrac{m\pi}{\alpha}$`, md`$\mu = \dfrac{m\ln(b/a)}{\pi}$`],
        0,
        [null,
          md`The argument is $\mu\ln(r/a)$, not $\mu(r - a)$. The "width" of the radial interval is $\ln(b/a)$.`,
          md`$m\pi/\alpha$ quantizes angular modes between the walls. Here the zeros are on the arcs.`,
          md`Upside down: you need $\mu\ln(b/a) = m\pi$.`],
        md`$\sin(\mu\ln(b/a)) = 0 \Rightarrow \mu\ln(b/a) = m\pi$. It is the slot's $k = n\pi/a$ with the plate separation replaced by the logarithmic width $\ln(b/a)$. A thin sector ($b$ close to $a$) has a small $\ln(b/a)$ and a large $\mu$, so the modes die quickly away from the live wall.`,
        { figHtml: HARD }),

      Q(md`Which angular function goes with $\sin\!\big(\mu\ln(r/a)\big)$ in that route?`,
        [md`$\sin(\mu\theta)$`, md`$\cosh(\mu\theta)$`, md`$\sinh(\mu\theta)$`, md`$\theta$`],
        2,
        [md`With the radial factor oscillating, the separation constant has the other sign and the angular equation is $\Theta'' = +\mu^2\Theta$: no sines.`,
          md`$\cosh(\mu\theta) = 1$ at $\theta = 0$, but that wall is grounded.`,
          null,
          md`$\theta$ is the $k = 0$ solution; it doesn't pair with $\mu \ne 0$.`],
        md`For $R = \sin(\mu\ln(r/a))$, $r\frac{d}{dr}\left(r\frac{dR}{dr}\right) = -\mu^2R$, so $\Theta'' = +\mu^2\Theta$ and $\Theta = A\cosh\mu\theta + B\sinh\mu\theta$. The grounded wall $\theta = 0$ kills $\cosh$. The live wall then fixes the coefficients: $\Phi = \sum_{m\text{ odd}}\frac{4V_0}{m\pi}\sin\left(\mu\ln\frac ra\right)\frac{\sinh\mu\theta}{\sinh\mu\alpha}$.`,
        { figHtml: HARD }),

      P({
        title: 'The hard variant by the numbers (Kou-level)', big: true,
        q: md`Annular sector $a<r<b$, $0<\theta<\pi/2$, $b = 2a$. The wall $\theta = \pi/2$ is at $V_0$; the wall $\theta = 0$ and both arcs are grounded (all insulated at the corners).

          (a) What is the first step? (b) Give the coefficient $g_1$ of $\sin2\theta$ in the expansion of $-V_0\theta/\alpha$, in units of $V_0$. (c) Give $R_n(r)$ in terms of $r, a, b, k$. (d) Evaluate $\Phi$ at $r = \sqrt2\,a$, $\theta = \pi/4$, in units of $V_0$.`,
        figHtml: HARD,
        hints: [md`Subtract $V_0\theta/\alpha$ to make the walls homogeneous.`, md`$g_n = \dfrac{2V_0(-1)^n}{n\pi}$.`, md`$R_n$ must be $1$ on both arcs.`, md`At $\theta = \pi/4$, $\sin(n\pi/2)$ kills even $n$; at $r = \sqrt{ab}$, $R_n = \dfrac{2(ab)^{k/2}}{a^k + b^k}$.`],
        parts: [
          { lbl: md`(a) First step`, mc: [md`Write $\Phi = V_0\theta/\alpha$: it already matches both walls`, md`Subtract $V_0\theta/\alpha$ so that the walls become homogeneous`, md`Use $\sin(n\pi\theta/\alpha)$ directly and fit the wall`, md`Use images`],
            a: 1, why: [md`$V_0\theta/\alpha$ matches the walls but not the arcs: on $r = a$ and $r = b$ it equals $V_0\theta/\alpha \ne 0$, while the arcs are grounded. It is only the first piece.`, null, md`Every sine vanishes at $\theta = \alpha$; it can't fit $V_0$.`, md`No finite set of image charges makes this boundary.`] },
          { lbl: md`(b) $g_1/V_0$`, ans: -0.63662, unit: '' },
          { lbl: md`(c) $R_n(r)$`, expr: '(r^k + (a*b)^k/r^k)/(a^k + b^k)', vars: { r: [1.1, 1.9], a: [0.5, 1], b: [2, 3], k: [1, 4] }, accepts: ['((r/b)^k + (a/r)^k)/((a/b)^k + 1)'] },
          { lbl: md`(d) $\Phi(\sqrt2a,\pi/4)/V_0$`, ans: 0.036181, unit: '' },
        ],
        sol: md`
          **Region** $a<r<b$, $0<\theta<\pi/2$. **BCs:**
          1. $\Phi(a,\theta) = 0$
          2. $\Phi(r,0) = 0$
          3. $\Phi(r,\pi/2) = V_0$
          4. $\Phi(b,\theta) = 0$

          **(a)** $\Phi = \dfrac{2V_0\theta}{\pi} + \Phi_2$. $\Phi_2$ has walls at $0$ and arcs at $-2V_0\theta/\pi$.

          **(b)** $g_n = \dfrac{2V_0(-1)^n}{n\pi}$: $g_1 = -\dfrac{2}{\pi}V_0 = -0.6366\,V_0$.

          **(c)** $R_n = \dfrac{r^k + (ab)^kr^{-k}}{a^k + b^k}$, $k = 2n$.

          **(d)** At $\theta = \pi/4$: $\dfrac{2V_0\theta}{\pi} = 0.5V_0$. Odd $n$ only; $\sin(n\pi/2) = \pm1$; $(-1)^n = -1$. At $r = \sqrt{ab} = \sqrt2a$, $R_n = \dfrac{2\cdot 2^{n}}{1 + 4^{n}}$.
          - $n = 1$: $-\frac{2}{\pi}\cdot\frac{4}{5} = -0.5093$
          - $n = 3$: $-\frac{2}{3\pi}(-1)\cdot\frac{16}{65} = +0.0522$
          - $n = 5$: $-0.0080$, $n = 7$: $+0.0013$, ...

          $\Phi_2 = -0.4638\,V_0$, so $\Phi = 0.5 - 0.4638 = 0.0362\,V_0$.

          [Check by the other route: $\sum_{m\text{ odd}}\frac{4}{m\pi}\sin(\mu\ln\sqrt2)\frac{\sinh(\mu\pi/4)}{\sinh(\mu\pi/2)}$ with $\mu = m\pi/\ln2$ gives $0.0362$ as well.]

          **Why so small?** The arcs are close together ($\ln(b/a) = 0.69$) compared with the angular width, so the grounded arcs dominate the middle of the region; the wall at $V_0$ is felt only near $\theta = \pi/2$.
        `,
      }),

      Q(md`Which list of boundary conditions matches the figure (a pie slice of opening $\pi/2$, tip in the region)?`,
        [md`$\Phi(r,0) = 0$, $\Phi(r,\pi/2) = V_0$, $\Phi(b,\theta) = 0$, $\Phi(a,\theta) = 0$`,
          md`$\Phi(r,0) = 0$, $\Phi(r,\pi/2) = 0$, $\Phi(b,\theta) = V_0$, $\Phi$ finite at $r = 0$`,
          md`$\Phi(r,0) = 0$, $\Phi(r,\pi/2) = V_0$, $\Phi(b,\theta) = 0$, $\Phi$ finite at $r = 0$`,
          md`$\Phi(r,0) = 0$, $\Phi(r,\pi/2) = V_0$, $\Phi(b,\theta) = 0$, $\Phi\to0$ as $r\to\infty$`],
        2,
        [md`There is no inner arc: the tip $r = 0$ is part of the region. Its condition is finiteness, not a value on $r = a$.`,
          md`Wrong live face: in the figure the wall $\theta = \pi/2$ is at $V_0$ and the arc is grounded.`,
          null,
          md`The region stops at the arc $r = b$; infinity is not in it.`],
        md`Read each face of the figure: wall $\theta = 0$ at $0$, wall $\theta = \pi/2$ at $V_0$, arc at $0$. The tip is in the region, so the fourth condition is regularity there, which kills $r^{-k}$ (and $\ln r$). The live wall then calls for the $k = 0$ term $2V_0\theta/\pi$.`,
        { figHtml: PIE2 }),

      P({
        title: 'Pie slice with one live wall',
        q: md`A pie slice $0<r<b$, $0<\theta<\pi/2$: the wall $\theta = 0$ and the arc $r = b$ are grounded, the wall $\theta = \pi/2$ is at $V_0$ (insulated at the corners). The tip is in the region.

          (a) Find the coefficient of $(r/b)^{2}\sin2\theta$ in $\Phi - 2V_0\theta/\pi$, in units of $V_0$. (b) Evaluate $\Phi(b/2,\pi/4)/V_0$.`,
        figHtml: PIE2,
        hints: [md`Subtract $2V_0\theta/\pi$. The remainder has grounded walls and arc data $-2V_0\theta/\pi$.`, md`The tip kills $r^{-k}$; normalise to $1$ at $r = b$: $(r/b)^{2n}$.`, md`Coefficients: $\dfrac{2V_0(-1)^n}{n\pi}$.`],
        parts: [
          { lbl: md`(a) Coefficient of $(r/b)^2\sin2\theta$`, ans: -0.63662, unit: '' },
          { lbl: md`(b) $\Phi(b/2,\pi/4)/V_0$`, ans: 0.34404, unit: '' },
        ],
        sol: md`
          **BCs:** (1) $\Phi(r,0) = 0$; (2) $\Phi(r,\pi/2) = V_0$; (3) $\Phi(b,\theta) = 0$; (4) finite at $r = 0$.

          $\Phi = \dfrac{2V_0\theta}{\pi} + \Phi_2$, with $\Phi_2 = \sum_n \dfrac{2V_0(-1)^n}{n\pi}\left(\dfrac rb\right)^{2n}\sin 2n\theta$ (grounded walls, tip regular, arc value $-2V_0\theta/\pi$).

          **(a)** $n = 1$: $-\dfrac{2}{\pi} = -0.6366$.

          **(b)** $r = b/2$, $\theta = \pi/4$: $\frac{2\theta}{\pi} = 0.5$. $n = 1$: $-\frac2\pi\cdot\frac14 = -0.1592$; $n = 3$: $-\frac{2}{3\pi}\cdot\frac{1}{64}\cdot(-1) = +0.0033$; $n = 5$: $-0.0001$. $\Phi = 0.5 - 0.1560 = 0.3440\,V_0$.

          **Closed form** (a bonus, not needed on an exam): the sum is a logarithm series, $\sum\frac{(-1)^{n+1}}{n}w^n = \ln(1+w)$ with $w = (r/b)^2e^{2i\theta}$, giving
          $$\Phi = \frac{2V_0}{\pi}\left[\theta - \arg\!\left(1 + \frac{r^2}{b^2}e^{2i\theta}\right)\right].$$
          At $(b/2,\pi/4)$: $\frac2\pi[0.7854 - \arctan(1/4)] = 0.3440$. At $r = b$: $\arg(1 + e^{2i\theta}) = \theta$, so $\Phi = 0$. Good.
        `,
      }),

      RF(md`
        !!key Patterns to remember (wedges and sectors)
          - Write the region and the **numbered BCs** first; separating and writing $\Theta$ and $R$ is most of the exam's points.
          - Grounded walls at $0$ and $\alpha$ ⇒ $\sin(n\pi\theta/\alpha)$, $k = n\pi/\alpha$ (not integer in general).
          - Radial function: tip in region ⇒ $(r/b)^k$; infinity in region ⇒ $(a/r)^k$; inner arc grounded ⇒ $(r/a)^k - (a/r)^k$; outer arc grounded ⇒ $(b/r)^k - (r/b)^k$; same data on both arcs ⇒ $\dfrac{r^k + (ab)^kr^{-k}}{a^k+b^k}$.
          - Fourier on $(0,\alpha)$: $\int_0^\alpha\sin\sin\,d\theta = \frac\alpha2\delta_{nm}$. A constant gives $\frac{4V_0}{n\pi}$, odd $n$.
          - Walls at different potentials ⇒ the $k = 0$ term $V_0\theta/\alpha$; with arcs too, subtract it first.
          - Near a vertex, $E \propto r^{\pi/\alpha - 1}$: hollows ($\alpha<\pi$) shield, edges ($\alpha>\pi$) concentrate charge.
          - $\vb E = -\partial_r\Phi\,\hat{\mathbf r} - \frac1r\partial_\theta\Phi\,\hat{\boldsymbol\theta}$; $\sigma = \varepsilon_0\vb E\cdot\hat{\mathbf n}$ with $\hat{\mathbf n}$ out of the metal.
      `),
    ],
  };

  // ================================================================ Lesson 3 figures
  // an infinite cylinder seen obliquely (axis vertical)
  function cyl3d(lab) {
    const f = PF.fig(), R = 46, h = 140, ry = 13;
    f.ellipse(0, -h, R, ry);
    f.ellipse(0, 0, R, ry, { half: 'front' }); f.ellipse(0, 0, R, ry, { half: 'back', cls: 'dim dash' });
    f.line(-R, 0, -R, -h); f.line(R, 0, R, -h);
    for (const x of [-R, R]) { f.line(x, -h, x, -h - 24, { cls: 'dim dash' }); f.line(x, 0, x, 24, { cls: 'dim dash' }); }
    f.line(0, 30, 0, -h + ry + 2, { cls: 'dim dash thin' });
    axis(f, 0, -h - ry - 2, 0, -h - 46, 'z', ['t', 'tr']);
    dimL(f, 0, -h, R - 1, -h, '', []);
    put(f, R / 2, -h, 'R', ['b', 'bl', 'br'], 4, 'small');
    put(f, R, -h / 2, lab, ['r', 'tr', 'br'], 8, 'small');
    return widen(f).svg();
  }
  const CYL3D = cyl3d('V(R,\\phi)\\ \\text{given}');
  const PIPE_COS = cyl({ R: 60, lab: [['V_0\\cos\\phi', 40]], phi: 145, phiR: 20 });
  const PIPE_COS2 = cyl({ R: 60, lab: [['V_0\\cos^2\\phi', 40]] });
  const PIPE_HALF_P = cyl({ R: 60, lab: [['+V_0', 60], ['-V_0', 300]], pts: [[30, 90, 'P']], extra: (f) => { f.dot(-60, 0, 2.6); f.dot(60, 0, 2.6); } });
  // shell with a sign pattern drawn as + / - marks just outside
  function shellMarks(kpat, o = {}) {
    return cyl({ R: o.R || 58, shell: true, lab: o.lab, extra: (f) => {
      const R = o.R || 58;
      for (let d = 0; d < 360; d += o.step || 12) {
        const v = kpat(d * D); if (Math.abs(v) < 0.3) continue;
        const p = pol(R + 7, d); (v > 0 ? plus : minus)(f, p[0], p[1], 2.4);
      }
    } });
  }
  const SHELL5 = shellMarks((p) => Math.sin(5 * p), { step: 9, lab: [['\\sigma_0\\sin5\\phi', 27, 70]] });
  const SHELL1 = shellMarks((p) => Math.cos(p), { lab: [['\\sigma_0\\cos\\phi', 50, 66]] });
  const SHELL1P = shellMarks((p) => 1 + Math.cos(p) - 0.31, { step: 15, lab: [['\\sigma_0(1+\\cos\\phi)', 50, 66]] });
  const IN_FIELD = cyl({ R: 50, metal: true, field: true, lab: [['\\text{neutral}', 125]] });
  const IN_FIELD_Q = cyl({ R: 50, metal: true, field: true, lab: [['\\lambda', 125]] });
  const fieldV = (x, y, R) => { const s2 = x * x + y * y; return s2 < R * R ? NaN : -(x - R * R * x / s2) / R; };
  const IN_FIELD_MAP = cyl({ R: 50, metal: true, axes: false,
    pre: (f, R) => cmap(f, (x, y) => fieldV(x, y, R), [-130, -100, 130, 100], [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2], { h: 3 }),
    extra: (f) => { f.line(0, -98, 0, -54, { cls: 'dim thin' }); f.line(0, 54, 0, 98, { cls: 'dim thin' }); } });
  const SIGPLOT = plt({ w: 330, h: 200, x: [0, PI], y: [-3.3, 3.3], zero: true, xl: '\\text{angle}', yl: '\\sigma/(\\varepsilon_0E_0)', xt: [[PI / 2, '\\pi/2'], [PI, '\\pi']], yt: [[2, '2'], [3, '3'], [-2, '-2'], [-3, '-3']],
    curves: [{ f: (t) => 3 * Math.cos(t), lab: '\\text{sphere: }3\\cos\\theta', labAt: 0.9, sides: ['r', 'tr'] }, { f: (t) => 2 * Math.cos(t), cls: 'dash', lab: '\\text{cylinder: }2\\cos\\phi', labAt: 2.5, sides: ['tr', 't', 'tl'] }] });
  const COAXCOS = cyl({ R: 72, a: 32, aMetal: true, shell: true, lab: [['V_0\\cos\\phi', 40]], aLab: [['V=0', 130]], adim: [215, 'a', ['bl', 'l', 'b']], Rdim: [-55, 'b', ['r', 'br', 'tr']] });
  const LINECYL = cyl({ R: 46, metal: true, lab: [['V=0', 120]], line: { d: 130, lab: '\\lambda' }, axesExt: 160, extra: (f) => dimL(f, 0, 40, 130, 40, 'd', ['b']) });
  const LINECYL_IMG = cyl({ R: 60, axes: false, circCls: 'dash dim', line: { d: 110, lab: '\\lambda' }, extra: (f) => {
    const b = 60 * 60 / 110; f.charge(b, 0, { q: '-', image: true }); f.line(-60, 0, 120, 0, { cls: 'dim dash thin' });
    put(f, b, 0, '-\\lambda', ['b', 'bl', 'br'], 10, 'accent'); dimL(f, 0, 30, b, 30, 'R^2/d', ['b', 'br']); } });

  // extra setup figures for the added conceptual MCs (lesson 3)
  const FIELD_G = cyl({ R: 50, metal: true, field: true, lab: [['V=0', 125]] });
  const COAX_PM = cyl({ R: 72, a: 28, aMetal: true, outerMetal: true, lab: [['-\\lambda', 40]], aLab: [['+\\lambda', 135]] });
  const SHELL0 = shellMarks(() => 1, { step: 15, lab: [['\\sigma_0', 50, 66]] });
  const SHELL2 = shellMarks((p) => Math.cos(2 * p), { step: 12, lab: [['\\sigma_0\\cos2\\phi', 50, 66]] });
  const SHELL3 = shellMarks((p) => Math.cos(3 * p), { step: 10, lab: [['\\sigma_0\\cos3\\phi', 50, 66]] });
  const SHELL_Q = cyl({ R: 50, shell: true, lab: [['\\sigma(\\phi)', 40]] });
  const SHELL_IN_PIPE = cyl({ R: 72, a: 32, outerMetal: true, lab: [['V=0', 40]], aLab: [['\\sigma(\\phi)', 130]] });
  const LINE_NEUTRAL = cyl({ R: 46, metal: true, lab: [['\\text{neutral}', 120]], line: { d: 130, lab: '\\lambda' }, axesExt: 160, extra: (f) => dimL(f, 0, 40, 130, 40, 'd', ['b']) });
  const LINE_INSIDE = cyl({ R: 70, outerMetal: true, lab: [['V=0', 40]], line: { d: 34, lab: '\\lambda' } });

  // ================================================================ Lesson 3
  const L3 = {
    id: 'uW-cyl', title: 'Full circles: cylinders',
    steps: [
      RF(md`
        ### Pipes: the region goes all the way around

        An infinitely long pipe of radius $R$ has its surface held at some $V(R,\phi)$ (made of insulated strips running along $z$). Find $V$ inside and outside.

        [[fig:c3]]

        The region wraps around the axis, so $k$ is an integer and there is no $\phi$ term. Then:

        **Inside** ($s<R$, axis in the region: drop $s^{-k}$ and $\ln s$):
        $$V_{\text{in}} = a_0 + \sum_{k=1}^\infty\left(\frac sR\right)^{k}\left(A_k\cos k\phi + B_k\sin k\phi\right).$$
        **Outside** ($s>R$; drop $s^{k}$; drop $\ln s$ if the pipe and everything inside it are neutral, so $V$ stays bounded):
        $$V_{\text{out}} = a_0 + \sum_{k=1}^\infty\left(\frac Rs\right)^{k}\left(A_k\cos k\phi + B_k\sin k\phi\right).$$
        Writing the powers as $(s/R)^k$ and $(R/s)^k$ makes both equal $1$ on the pipe, so **the same coefficients** serve inside and outside: they are just the Fourier coefficients of $V(R,\phi)$.

        **Fourier's trick on a full circle.** For integers $k, m \ge 1$:
        $$\int_0^{2\pi}\cos k\phi\cos m\phi\,d\phi = \pi\delta_{km},\quad \int_0^{2\pi}\sin k\phi\sin m\phi\,d\phi = \pi\delta_{km},\quad \int_0^{2\pi}\sin k\phi\cos m\phi\,d\phi = 0 .$$
        $$a_0 = \frac1{2\pi}\int_0^{2\pi}V(R,\phi)\,d\phi,\qquad A_k = \frac1\pi\int_0^{2\pi}V(R,\phi)\cos k\phi\,d\phi,\qquad B_k = \frac1\pi\int_0^{2\pi}V(R,\phi)\sin k\phi\,d\phi .$$

        !!trap $\pi$, not $\pi/2$ or $2\pi$
          Over a full period the average of $\cos^2 k\phi$ is $\tfrac12$, so the integral is $\tfrac12\cdot2\pi = \pi$. The constant term is different: $\int_0^{2\pi}1\,d\phi = 2\pi$, so $a_0$ carries $\frac{1}{2\pi}$. On a wedge $(0,\alpha)$ with sines only, the normalization was $\alpha/2$.

        !!key The center is the average
          $V_{\text{in}}(0) = a_0$, the average of $V$ around the pipe. This is the mean-value property of Laplace's equation, now in 2-D.
      `, { c3: { svg: CYL3D, cap: 'An infinitely long pipe. Nothing depends on $z$.' } }),

      Q(md`A pipe's surface is held at $V(R,\phi) = V_0(2 + \sin 3\phi)$. What is $V$ on the axis?`,
        [md`$3V_0$`, md`$0$`, md`$2V_0$`, md`$V_0$`],
        2,
        [md`$\sin 3\phi$ averages to zero around the circle; it doesn't add to the center value.`,
          md`The constant part doesn't vanish at the center; only the $k\ge1$ parts do (they carry $(s/R)^k$).`,
          null,
          md`The $\sin3\phi$ amplitude is $V_0$, but it contributes $(s/R)^3 = 0$ at the axis.`],
        md`Center value = average around the circle = $2V_0$. Every $k\ge1$ term carries $(s/R)^k$, zero on the axis.`,
        { figHtml: cyl({ R: 56, lab: [['V_0(2+\\sin3\\phi)', 40]] }) }),

      Q(md`Same pipe, $V(R,\phi) = V_0(2+\sin3\phi)$. Assuming the configuration is neutral, what is $V$ far away ($s\gg R$)?`,
        [md`$0$`, md`$2V_0$`, md`It grows like $\ln s$`, md`$V_0\sin3\phi$`],
        1,
        [md`Outside, the constant $a_0$ survives (no charge per length means no $\ln s$, but nothing removes the constant). $V\to a_0$.`,
          null,
          md`A $\ln s$ term means net charge per length; a neutral configuration has none.`,
          md`The $\sin3\phi$ part falls off like $(R/s)^3$.`],
        md`$V_{\text{out}} = 2V_0 + V_0(R/s)^3\sin3\phi \to 2V_0$. In 2-D a neutral object at a nonzero potential sits in a region whose potential tends to a constant, not to zero. (In 3-D a sphere at $2V_0$ would need charge and fall like $1/r$; in 2-D a constant is itself a solution.)`,
        { figHtml: cyl({ R: 56, lab: [['V_0(2+\\sin3\\phi)', 40]] }) }),

      Q(md`For $V(R,\phi) = V_0\cos\phi$, which is $V_{\text{in}}$?`,
        [md`$V_0\dfrac{R}{s}\cos\phi$`, md`$V_0\cos\phi$ (the same everywhere)`, md`$V_0\dfrac{s}{R}\cos\phi$`, md`$V_0\dfrac{s^2}{R^2}\cos\phi$`],
        2,
        [md`That one blows up on the axis. It is $V_{\text{out}}$.`,
          md`$\cos\phi$ alone does not solve Laplace: $\frac{1}{s^2}\partial_\phi^2\cos\phi = -\cos\phi/s^2 \ne 0$.`,
          null,
          md`$s^2$ goes with $\cos2\phi$, not $\cos\phi$.`],
        md`$k = 1$ and the axis is in the region: $s^1\cos\phi$. Normalise to $V_0$ at $s = R$. Note $s\cos\phi = x$: $V_{\text{in}} = V_0x/R$, a **uniform** field $\vb E = -(V_0/R)\,\hat{\mathbf x}$ inside.`,
        { figHtml: PIPE_COS }),

      Q(md`A student solves the pipe with $V(R,\phi) = V_0\sin2\phi$ and writes, for the **inside**, $V = V_0\left(\dfrac Rs\right)^2\sin2\phi$. Which condition does this violate?`,
        [md`$V(R,\phi) = V_0\sin2\phi$`, md`Laplace's equation`, md`Single-valuedness in $\phi$`, md`$V$ finite on the axis`],
        3,
        [md`At $s = R$ it gives $V_0\sin2\phi$: the boundary condition holds.`,
          md`$s^{-2}\sin2\phi$ is a solution ($k = 2$).`,
          md`$\sin2\phi$ is single-valued.`,
          null],
        md`$(R/s)^2 \to\infty$ at $s = 0$, which is inside the pipe. Inside you need $(s/R)^2$. The student wrote the outside solution.`,
        { figHtml: cyl({ R: 56, lab: [['V_0\\sin2\\phi', 40]] }) }),

      RF(md`
        ### Worked example: $V(R,\phi) = V_0\cos\phi$

        **BCs:** (1) $V(R,\phi) = V_0\cos\phi$; (2) $V$ finite on the axis; (3) $V$ bounded as $s\to\infty$ (no net charge).

        The boundary data are a single Fourier mode, $k = 1$ cosine. By orthogonality every other coefficient is zero:
        $$V_{\text{in}} = V_0\,\frac sR\cos\phi = \frac{V_0}{R}\,x,\qquad V_{\text{out}} = V_0\,\frac Rs\cos\phi .$$

        - Inside: a uniform field $\vb E = -\dfrac{V_0}{R}\hat{\mathbf x}$. The equipotentials are vertical lines.
        - Outside: a **2-D dipole**, $V \propto \cos\phi/s$, field $\propto 1/s^2$ (a 3-D dipole falls as $1/r^3$).
        - If the pipe is a thin shell, the charge it must carry follows from the jump in $\partial V/\partial s$ (next section): $\sigma = -\varepsilon_0\left[\partial_sV_{\text{out}} - \partial_sV_{\text{in}}\right]_{R} = \dfrac{2\varepsilon_0V_0}{R}\cos\phi$.

        !!intuition Inside is a polynomial, outside is its inversion
          $s^k\cos k\phi = \text{Re}\,(x+iy)^k$: inside solutions are harmonic polynomials ($x$, $x^2-y^2$, ...). Outside solutions are the same with $s\to R^2/s$. Matching on $s = R$ is automatic once both are normalised to the boundary data.
      `),

      Q(md`Inside the pipe with $V(R,\phi) = V_0\cos\phi$, what do the equipotentials look like?`,
        [md`Circles around the axis`, md`Rays from the axis`, md`Straight lines parallel to the $y$-axis`, md`Straight lines parallel to the $x$-axis`],
        2,
        [md`Circles would mean $V$ depends only on $s$.`, md`Rays would mean $V$ depends only on $\phi$.`, null, md`$V = V_0x/R$ changes along $x$, so the level lines run along $y$.`],
        md`$V_{\text{in}} = V_0s\cos\phi/R = V_0x/R$, so $V = \text{const}$ means $x = \text{const}$: vertical lines, with a uniform field along $-\hat{\mathbf x}$.`,
        { figHtml: PIPE_COS }),

      P({
        title: 'A pipe split into two halves',
        q: md`A pipe of radius $R$ is split along its length into two insulated halves: $V = +V_0$ for $0<\phi<\pi$ and $-V_0$ for $\pi<\phi<2\pi$.

          (a) Find the coefficient $B_k$ of $(s/R)^k\sin k\phi$ for odd $k$. (b) Evaluate $V$ at $P$: $s = R/2$, $\phi = \pi/2$, in units of $V_0$. (c) Find $E_y$ on the axis. (d) What is $V$ at $s = 2R$, $\phi = \pi/2$?`,
        figHtml: PIPE_HALF_P,
        hints: [md`$V(R,\phi)$ is odd in $\phi$: sines only. $B_k = \frac1\pi\int_0^{2\pi}V\sin k\phi\,d\phi$.`, md`Near the axis only $k = 1$ matters for the field: $V \approx B_1 y/R$.`, md`Outside, $(R/s)^k$ at $s = 2R$ equals $(s/R)^k$ at $s = R/2$.`],
        parts: [
          { lbl: md`(a) $B_k$, odd $k$`, expr: '4*V0/(k*pi)', vars: { V0: [1, 3], k: [1, 9] } },
          { lbl: md`(b) $V(R/2,\pi/2)/V_0$`, ans: 0.59033, unit: '' },
          { lbl: md`(c) $E_y$ on the axis`, expr: '-4*V0/(pi*R)', vars: { V0: [1, 3], R: [0.5, 3] } },
          { lbl: md`(d) $V(2R,\pi/2)/V_0$`, ans: 0.59033, unit: '' },
        ],
        sol: md`
          **BCs:** (1) $V(R,\phi) = \pm V_0$ on the two halves; (2) finite on the axis; (3) bounded far away.

          **(a)** $a_0 = 0$ (average zero) and $A_k = 0$ (odd function). $B_k = \frac1\pi\left[\int_0^\pi V_0\sin k\phi\,d\phi - \int_\pi^{2\pi}V_0\sin k\phi\,d\phi\right] = \frac{2V_0}{k\pi}(1 - \cos k\pi) = \frac{4V_0}{k\pi}$ for odd $k$.
          $$V_{\text{in}} = \frac{4V_0}{\pi}\sum_{k\text{ odd}}\frac1k\left(\frac sR\right)^k\sin k\phi,\qquad V_{\text{out}} = \frac{4V_0}{\pi}\sum_{k\text{ odd}}\frac1k\left(\frac Rs\right)^k\sin k\phi .$$

          **(b)** At $s = R/2$, $\phi = \pi/2$: $\frac4\pi\left[\frac12 - \frac13\cdot\frac18 + \frac15\cdot\frac1{32} - \dots\right] = \frac4\pi\arctan\frac12 = 0.5903$. (The series $\sum_{k\text{ odd}}\frac{(-1)^{(k-1)/2}x^k}{k} = \arctan x$.) The closed form inside is $V = \frac{2V_0}{\pi}\arctan\dfrac{2Rs\sin\phi}{R^2 - s^2}$; at $P$ it gives $\frac2\pi\arctan\frac43 = 0.5903$. Same.

          **(c)** Near the axis $V \approx \frac{4V_0}{\pi}\frac{s\sin\phi}{R} = \frac{4V_0}{\pi R}y$, so $E_y = -\dfrac{4V_0}{\pi R}$: the field points from the $+$ half to the $-$ half.

          **(d)** $(R/s)^k$ at $2R$ equals $(1/2)^k$, so $V(2R,\pi/2) = V(R/2,\pi/2) = 0.5903V_0$. Inside and outside are mirror images under $s\to R^2/s$.
        `,
      }),

      Q(md`In the split-pipe problem, why are there no even-$k$ terms?`,
        [md`Because $V(R,\phi+\pi) = -V(R,\phi)$, and only odd $k$ change sign under $\phi\to\phi+\pi$`,
          md`Because even $k$ are not single-valued`,
          md`Because $\sin k\phi$ with even $k$ is zero on the axis`,
          md`Because the field must be finite`],
        0,
        [null,
          md`Every integer $k$ is single-valued.`,
          md`Every $k\ge1$ term is zero on the axis.`,
          md`Even terms are perfectly finite; they just have zero coefficient here.`],
        md`$\sin k(\phi+\pi) = (-1)^k\sin k\phi$. Boundary data that flip sign under a half-turn can only contain modes that do the same: odd $k$. Same reason the slot with a constant strip had odd $n$ only.`,
        { figHtml: PIPE_HALF }),

      P({
        title: 'A pipe at $V_0\\cos^2\\phi$ (Kou-level)', big: true,
        q: md`A pipe of radius $R$ has $V(R,\phi) = V_0\cos^2\phi$ and nothing else around (no net charge per length anywhere, so $V$ stays bounded far away).

          (a) Find $V_{\text{in}}(s,\phi)$. (b) Find $V_{\text{out}}(s,\phi)$. (c) If the pipe is a thin insulating shell carrying a surface charge that produces this potential, find $\sigma(\phi)$. (d) What does $V_{\text{out}}$ tend to far away?`,
        figHtml: PIPE_COS2,
        hints: [md`$\cos^2\phi = \frac12 + \frac12\cos2\phi$: read off the coefficients, no integrals.`, md`$k = 0$: the constant. $k = 2$: $(s/R)^2$ inside, $(R/s)^2$ outside. $\ln s$ is out because there's no net charge.`, md`$\sigma = -\varepsilon_0\left[\partial_s V_{\text{out}} - \partial_sV_{\text{in}}\right]_{s=R}$.`],
        parts: [
          { lbl: md`(a) $V_{\text{in}}$`, expr: 'V0/2 + V0*s^2*cos(2*phi)/(2*R^2)', vars: { V0: [1, 3], s: [0.2, 0.9], R: [1, 1.5], phi: [0, 3] }, accepts: ['V0/2 + V0*(s/R)^2*(2*cos(phi)^2-1)/2'] },
          { lbl: md`(b) $V_{\text{out}}$`, expr: 'V0/2 + V0*R^2*cos(2*phi)/(2*s^2)', vars: { V0: [1, 3], s: [1.6, 3], R: [1, 1.5], phi: [0, 3] } },
          { lbl: md`(c) $\sigma(\phi)$`, expr: '2*eps0*V0*cos(2*phi)/R', vars: { eps0: [0.5, 2], V0: [1, 3], R: [1, 2], phi: [0, 3] } },
          { lbl: md`(d) $V_{\text{out}}$ far away`, mc: [md`$0$`, md`$V_0/2$`, md`$V_0$`, md`$-\infty$`], a: 1,
            why: [md`The constant $a_0 = V_0/2$ is a solution outside too, and nothing kills it.`, null, md`$V_0$ is the maximum on the pipe; far away only the average survives.`, md`That would need a $\ln s$ term, i.e. net charge.`] },
        ],
        sol: md`
          **BCs:** (1) $V(R,\phi) = V_0\cos^2\phi$; (2) finite on the axis; (3) bounded far away; (4) $V$ continuous at $s = R$ (both solutions use the same data, so this is automatic).

          $\cos^2\phi = \frac12 + \frac12\cos2\phi$: only $k = 0$ and $k = 2$.

          **(a)** $V_{\text{in}} = \dfrac{V_0}{2} + \dfrac{V_0}{2}\left(\dfrac sR\right)^2\cos2\phi$. (In Cartesian: $\frac{V_0}{2} + \frac{V_0}{2R^2}(x^2 - y^2)$, a saddle.)

          **(b)** $V_{\text{out}} = \dfrac{V_0}{2} + \dfrac{V_0}{2}\left(\dfrac Rs\right)^2\cos2\phi$.

          **(c)** $\partial_sV_{\text{in}} = \frac{V_0s}{R^2}\cos2\phi \to \frac{V_0}{R}\cos2\phi$; $\partial_sV_{\text{out}} = -\frac{V_0R^2}{s^3}\cos2\phi \to -\frac{V_0}{R}\cos2\phi$. So $\sigma = -\varepsilon_0\left(-\frac{2V_0}{R}\right)\cos2\phi = \dfrac{2\varepsilon_0V_0}{R}\cos2\phi$. The constant part needs no charge (its slope is zero on both sides). Net charge per length: $\int\sigma R\,d\phi = 0$, consistent with no $\ln s$.

          **(d)** $V_0/2$.

          !!trap The constant outside
            In 3-D you would write $V_{\text{out}} = \frac{V_0}{2}\frac Rr$ for the $\ell = 0$ part. In 2-D the analog would be $\ln s$, which needs net charge. With no charge the $k = 0$ part outside is just the constant $V_0/2$.
        `,
      }),

      RF(md`
        ### Charged shells: continuity plus the jump

        If a cylindrical shell carries a surface charge $\sigma(\phi)$ (and no potential is specified), you solve inside and outside separately and glue them with the boundary conditions at a charged surface:

        **BCs at $s = R$:**
        1. $V_{\text{in}}(R,\phi) = V_{\text{out}}(R,\phi)$ (V is continuous)
        2. $\dfrac{\partial V_{\text{out}}}{\partial s} - \dfrac{\partial V_{\text{in}}}{\partial s}\Big|_{s=R} = -\dfrac{\sigma(\phi)}{\varepsilon_0}$ (the normal field jumps by $\sigma/\varepsilon_0$)

        plus: finite on the axis, bounded far away (if neutral).

        **Worked example (Griffiths 4th ed. Prob. 3.26):** $\sigma(\phi) = \sigma_0\sin5\phi$ on a long cylinder of radius $R$.

        [[fig:s5]]

        Only $k = 5$, sine, can match. Continuity is automatic if you write
        $$V_{\text{in}} = A\left(\frac sR\right)^5\sin5\phi,\qquad V_{\text{out}} = A\left(\frac Rs\right)^5\sin5\phi .$$
        Jump: $\partial_sV_{\text{out}} - \partial_sV_{\text{in}} = -\dfrac{5A}{R} - \dfrac{5A}{R} = -\dfrac{10A}{R}$ (times $\sin5\phi$). Set equal to $-\sigma_0/\varepsilon_0$: $A = \dfrac{\sigma_0R}{10\varepsilon_0}$.
        $$V_{\text{in}} = \frac{\sigma_0R}{10\varepsilon_0}\left(\frac sR\right)^5\sin5\phi,\qquad V_{\text{out}} = \frac{\sigma_0R}{10\varepsilon_0}\left(\frac Rs\right)^5\sin5\phi .$$

        !!key General rule
          $\sigma = \sigma_0\cos k\phi$ (or $\sin k\phi$) on a cylinder gives amplitude $A = \dfrac{\sigma_0R}{2k\varepsilon_0}$. Compare the sphere: $\sigma_0P_\ell(\cos\theta)$ gives $A = \dfrac{\sigma_0R}{(2\ell+1)\varepsilon_0}$. The $2k$ comes from the two slopes $k/R$ and $k/R$; on the sphere the slopes are $\ell/R$ and $(\ell+1)/R$.
      `, { s5: { svg: SHELL5, cap: 'Surface charge $\\sigma_0\\sin5\\phi$: ten alternating lobes around the cylinder.' } }),

      Q(md`For the $\sigma_0\sin5\phi$ cylinder, how does the field behave near the axis?`,
        [md`It is uniform`, md`It vanishes like $s^4$`, md`It diverges like $1/s$`, md`It vanishes like $s$`],
        1,
        [md`A uniform field comes from the $k = 1$ term, which is absent here.`,
          null,
          md`Nothing is singular: the axis is inside an empty region.`,
          md`That would be $k = 2$.`],
        md`$V_{\text{in}} \propto s^5$, so $E \propto s^4$. Fine angular structure on the boundary is invisible deep inside: higher $k$ dies faster away from the shell. Same for the outside, where $V\propto s^{-5}$.`,
        { figHtml: SHELL5 }),

      Q(md`At a charged cylindrical shell, which pair of conditions do you impose?`,
        [md`$V$ continuous, and $\partial V/\partial s$ continuous`,
          md`$V = 0$ on the shell, and $\partial V/\partial s$ jumps by $\sigma/\varepsilon_0$`,
          md`$V$ continuous, and $\partial V/\partial s$ jumps: $\partial_sV_{\text{out}} - \partial_sV_{\text{in}} = -\sigma/\varepsilon_0$`,
          md`$\partial V/\partial\phi$ jumps by $\sigma/\varepsilon_0$`],
        2,
        [md`If $\partial_sV$ were continuous there would be no surface charge.`,
          md`Nothing grounds the shell. A charged insulating shell has whatever potential its charge produces.`,
          null,
          md`The tangential field ($\propto\partial_\phi V$) is continuous across any surface charge. Only the normal component jumps.`],
        md`$E_{\perp}$ jumps by $\sigma/\varepsilon_0$ and $E_\parallel$ is continuous; in terms of $V$, $V$ is continuous and $-\partial_sV$ jumps by $\sigma/\varepsilon_0$ going outward.`,
        { figHtml: SHELL1 }),

      Q(md`A long, thin **insulating** shell of radius $R$ carries $\sigma_0\cos\phi$, with nothing else around. Which of these is **not** a boundary condition of the problem?`,
        [md`$V(R,\phi) = 0$`,
          md`$V_{\text{in}}(R,\phi) = V_{\text{out}}(R,\phi)$`,
          md`$V_{\text{in}}$ finite on the axis`,
          md`$\partial_sV_{\text{out}} - \partial_sV_{\text{in}} = -\dfrac{\sigma_0\cos\phi}{\varepsilon_0}$ at $s = R$`],
        0,
        [null,
          md`Continuity of $V$ holds across any surface charge. It is one of the two matching conditions.`,
          md`The axis is in the inner region and carries no charge, so $V$ is finite there. It kills $s^{-k}$ inside.`,
          md`This is the jump condition; it is what puts the charge into the problem.`],
        md`An insulating shell is not an equipotential, and nothing grounds it. Its potential is whatever the charge produces, and here it varies around the shell. "Grounded" or "held at $V_0$" are conditions for conductors; for a charged insulator you match across the surface instead.`,
        { figHtml: SHELL1 }),

      Q(md`A thin cylindrical shell carries $\sigma = \sigma_0\cos2\phi$. Writing $V_{\text{in}} = A(s/R)^2\cos2\phi$ and $V_{\text{out}} = A(R/s)^2\cos2\phi$, what is $A$?`,
        [md`$\dfrac{\sigma_0R}{2\varepsilon_0}$`, md`$\dfrac{\sigma_0R}{4\varepsilon_0}$`, md`$\dfrac{\sigma_0R}{5\varepsilon_0}$`, md`$\dfrac{\sigma_0R}{3\varepsilon_0}$`],
        1,
        [md`That is the $k = 1$ result. The slopes are $k/R$ on each side, so $k = 2$ gives $4A/R$ in total.`,
          null,
          md`$2\ell + 1 = 5$ is the **sphere** with $\sigma_0P_2(\cos\theta)$. The cylinder uses $2k$.`,
          md`$3$ is the sphere's $\ell = 1$ factor.`],
        md`Slopes at $s = R$: inside $\frac{2A}{R}$, outside $-\frac{2A}{R}$. The jump condition gives $-\frac{4A}{R} = -\frac{\sigma_0}{\varepsilon_0}$, so $A = \frac{\sigma_0R}{4\varepsilon_0} = \frac{\sigma_0R}{2k\varepsilon_0}$ with $k = 2$.`,
        { figHtml: SHELL2 }),

      Q(md`A thin cylindrical shell carries a **uniform** $\sigma_0$. What is $V$ inside?`,
        [md`$-\dfrac{\sigma_0R}{\varepsilon_0}\ln s$`, md`Proportional to $s\cos\phi$`, md`Proportional to $s^2$`, md`A constant: there is no field inside`],
        3,
        [md`$\ln s$ blows up on the axis, which is inside. The $\ln s$ belongs to the outside.`,
          md`Uniform $\sigma$ has no $\cos\phi$ part; Fourier's trick gives only $k = 0$.`,
          md`$s^2$ alone doesn't solve Laplace; it would need charge inside.`,
          null],
        md`Only $k = 0$ appears. Inside, the axis kills $\ln s$ and leaves a constant. Outside, $V = c - \frac{\sigma_0R}{\varepsilon_0}\ln\frac sR$, whose slope at $s = R$ is $-\frac{\sigma_0}{\varepsilon_0}$, exactly the required jump from the inside slope $0$. Gauss's law says the same: no enclosed charge, no field.`,
        { figHtml: SHELL0 }),

      Q(md`A thin insulating shell of radius $a$ carrying $\sigma(\phi)$ sits inside a coaxial grounded metal pipe of radius $b$. Which set of conditions determines $V$?`,
        [md`$V(a,\phi) = 0$ and $V(b,\phi) = 0$`,
          md`$V$ finite on the axis; $V$ continuous at $s = a$; $V\to\text{const}$ as $s\to\infty$`,
          md`$V$ finite on the axis; $V$ continuous at $s = a$; $\partial_sV_{\text{out}} - \partial_sV_{\text{in}} = -\sigma/\varepsilon_0$ at $s = a$; $V(b,\phi) = 0$`,
          md`$V$ continuous at $s = a$; $\partial_sV$ continuous at $s = a$; $V(b,\phi) = 0$`],
        2,
        [md`The insulating shell is not an equipotential and isn't grounded; you match across it instead.`,
          md`The region stops at the metal pipe, so infinity isn't in it. And this set misses the jump that puts the charge in.`,
          null,
          md`A continuous slope means no surface charge at $s = a$.`],
        md`Two regions: $0\le s<a$ (the axis is inside: finite there) and $a<s<b$ (keep both powers, and $\ln s$). Glue them at $s = a$ with continuity plus the jump, and ground at $s = b$. Per mode that is four conditions for four constants.`,
        { figHtml: SHELL_IN_PIPE }),

      P({
        title: 'A shell with $\\sigma_0\\cos\\phi$',
        q: md`A long thin cylindrical shell of radius $R$ carries $\sigma(\phi) = \sigma_0\cos\phi$. Find (a) $V_{\text{in}}$, (b) $E_x$ inside, (c) $V_{\text{out}}$. (d) A sphere with $\sigma_0\cos\theta$ has a uniform interior field $\sigma_0/(3\varepsilon_0)$. Why is the cylinder's larger?`,
        figHtml: SHELL1,
        hints: [md`Only $k = 1$, cosine. Write $V_{\text{in}} = A(s/R)\cos\phi$, $V_{\text{out}} = A(R/s)\cos\phi$.`, md`Jump: $-\frac{A}{R} - \frac AR = -\frac{\sigma_0}{\varepsilon_0}$.`],
        parts: [
          { lbl: md`(a) $V_{\text{in}}$`, expr: 'sigma0*s*cos(phi)/(2*eps0)', vars: { sigma0: [1, 3], eps0: [0.5, 2], s: [0.1, 0.9], phi: [0, 3] } },
          { lbl: md`(b) $E_x$ inside`, expr: '-sigma0/(2*eps0)', vars: { sigma0: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(c) $V_{\text{out}}$`, expr: 'sigma0*R^2*cos(phi)/(2*eps0*s)', vars: { sigma0: [1, 3], eps0: [0.5, 2], R: [1, 1.5], s: [1.6, 3], phi: [0, 3] } },
          { lbl: md`(d) Why $\frac12$ for the cylinder vs $\frac13$ for the sphere?`, mc: [md`The cylinder has more charge per area`, md`The sphere's outside potential falls faster ($r^{-2}$ vs $s^{-1}$), so a larger share of the jump in slope happens outside`, md`The cylinder is a conductor`, md`They are the same; the factor is a convention`], a: 1,
            why: [md`Both have the same $\sigma_0$.`, null, md`It is an insulating shell.`, md`$\frac{\sigma_0}{2\varepsilon_0}$ vs $\frac{\sigma_0}{3\varepsilon_0}$ are genuinely different fields.`] },
        ],
        sol: md`
          **BCs:** (1) $V$ continuous at $s = R$; (2) $\partial_sV_{\text{out}} - \partial_sV_{\text{in}} = -\sigma_0\cos\phi/\varepsilon_0$; (3) finite on the axis; (4) bounded far away.

          $V_{\text{in}} = A\frac sR\cos\phi$, $V_{\text{out}} = A\frac Rs\cos\phi$ (continuity built in). Slopes at $R$: $\frac AR$ inside, $-\frac AR$ outside. Jump: $-\frac{2A}{R} = -\frac{\sigma_0}{\varepsilon_0}$, so $A = \frac{\sigma_0R}{2\varepsilon_0}$.

          (a) $V_{\text{in}} = \dfrac{\sigma_0}{2\varepsilon_0}s\cos\phi = \dfrac{\sigma_0}{2\varepsilon_0}x$. (b) $E_x = -\dfrac{\sigma_0}{2\varepsilon_0}$: from the positive side ($\phi = 0$) toward the negative side, as it should. (c) $V_{\text{out}} = \dfrac{\sigma_0R^2}{2\varepsilon_0}\dfrac{\cos\phi}{s}$.

          (d) The jump $\sigma_0/\varepsilon_0$ is shared between the inside slope and the outside slope. Cylinder: slopes $1\cdot\frac AR$ and $1\cdot\frac AR$, so the inside gets $\frac12$. Sphere: $A\frac rR\cos\theta$ inside (slope $\frac AR$) and $A\frac{R^2}{r^2}\cos\theta$ outside (slope $-\frac{2A}R$), so the jump is $\frac{3A}{R}$ and the inside gets $\frac13$ of it.
        `,
      }),

      Q(md`Inside the $\sigma_0\cos\phi$ shell the field is uniform, $E_x = -\dfrac{\sigma_0}{2\varepsilon_0}$, so just inside at $\phi = 0$, $E_s = -\dfrac{\sigma_0}{2\varepsilon_0}$. What is $E_s$ just **outside** at $\phi = 0$?`,
        [md`$+\dfrac{\sigma_0}{2\varepsilon_0}$`, md`$-\dfrac{\sigma_0}{2\varepsilon_0}$, the same`, md`$+\dfrac{\sigma_0}{\varepsilon_0}$`, md`$0$`],
        0,
        [null,
          md`If $E_s$ were continuous there would be no charge at $\phi = 0$, but $\sigma(0) = \sigma_0$.`,
          md`That adds the full jump to zero. The jump is $E_{\text{out}} - E_{\text{in}} = \sigma_0/\varepsilon_0$, starting from $-\sigma_0/(2\varepsilon_0)$.`,
          md`A zero field outside would make the jump only $\sigma_0/(2\varepsilon_0)$.`],
        md`$E_{s,\text{out}} - E_{s,\text{in}} = \frac{\sigma_0}{\varepsilon_0}$ at $\phi = 0$: $-\frac{\sigma_0}{2\varepsilon_0} + \frac{\sigma_0}{\varepsilon_0} = +\frac{\sigma_0}{2\varepsilon_0}$. The positive strip pushes field both ways: outward outside, inward (toward $-x$) inside. The jump splits evenly because both radial slopes are $1/R$.`,
        { figHtml: SHELL1 }),

      Q(md`Outside the $\sigma_0\cos\phi$ shell, $V = \dfrac{\sigma_0R^2}{2\varepsilon_0}\dfrac{\cos\phi}{s}$. How does $|\vb E|$ fall off?`,
        [md`$1/s$`, md`$1/s^3$, like a dipole`, md`Exponentially`, md`$1/s^2$`],
        3,
        [md`$1/s$ is the falloff of the potential. The field is one derivative down.`,
          md`$1/r^3$ is the 3-D dipole field. A line dipole is one power slower.`,
          md`Exponential decay appears in the slot ($e^{-n\pi x/a}$), not for powers of $s$.`,
          null],
        md`$E_s = \frac{\sigma_0R^2\cos\phi}{2\varepsilon_0s^2}$ and $E_\phi = \frac{\sigma_0R^2\sin\phi}{2\varepsilon_0s^2}$, so $|\vb E| = \frac{\sigma_0R^2}{2\varepsilon_0s^2}$, the same in every direction. Seen from far away the shell is a line dipole along $\hat{\mathbf x}$ with moment $\pi R^2\sigma_0$ per unit length: in 2-D, dipole potential $\propto1/s$ and field $\propto1/s^2$.`,
        { figHtml: SHELL1 }),

      Q(md`A shell carries $\sigma = \sigma_0\cos3\phi$. Far away, how does $V$ fall off?`,
        [md`$1/s$, like every neutral distribution in 2-D`, md`$\ln s$`, md`$1/s^4$, like a 3-D octupole`, md`$1/s^3$`],
        3,
        [md`$1/s$ is the line dipole ($k = 1$). This charge has only a $k = 3$ component.`,
          md`$\ln s$ needs net charge, and $\oint\cos3\phi\,d\phi = 0$.`,
          md`3-D intuition again. In 2-D the $k$-th multipole potential falls as $s^{-k}$.`,
          null],
        md`Only $k = 3$ matches, so $V_{\text{out}} = \frac{\sigma_0R}{6\varepsilon_0}\left(\frac Rs\right)^3\cos3\phi$. Six alternating lobes cancel each other quickly at a distance. Finer pattern, faster falloff, both outward and toward the axis.`,
        { figHtml: SHELL3 }),

      RF(md`
        ### A metal pipe in a uniform field (Griffiths 4th ed. Prob. 3.25)

        An infinitely long, neutral metal pipe of radius $R$ is placed with its axis along $z$ in an otherwise uniform field $\vb E_0 = E_0\hat{\mathbf x}$.

        [[fig:f]]

        **Region:** $s>R$. **BCs:**
        1. $V(R,\phi) = 0$
        2. $V \to -E_0s\cos\phi$ as $s\to\infty$ (the applied field, $-E_0x$)

        **Why $V = 0$ on the pipe:** the applied potential $-E_0x$ is zero on the plane $x = 0$. The setup is antisymmetric under $x\to-x$ (field reversed), so the neutral pipe's potential must equal its own negative: zero. Same argument as the sphere in a uniform field.

        **Which terms.** #2 allows only one growing term, $-E_0s\cos\phi$; it also says no $\ln s$ (neutral) and fixes nothing else. So
        $$V = a_0 - E_0s\cos\phi + \sum_k s^{-k}\left(c_k\cos k\phi + d_k\sin k\phi\right).$$
        #1 for every $\phi$: $a_0 = 0$; $k = 1$ cosine: $-E_0R + c_1/R = 0 \Rightarrow c_1 = E_0R^2$; all other $c_k, d_k = 0$.
        $$V(s,\phi) = -E_0\left(s - \frac{R^2}{s}\right)\cos\phi,\qquad \sigma = -\varepsilon_0\frac{\partial V}{\partial s}\Big|_{R} = 2\varepsilon_0E_0\cos\phi .$$

        [[fig:map]]

        **Compare the sphere** (Griffiths Ex. 3.8): $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$ and $\sigma = 3\varepsilon_0E_0\cos\theta$.

        [[fig:sig]]

        !!intuition Why 2 for the cylinder and 3 for the sphere
          $\sigma = \varepsilon_0E_s$ at the surface $=$ (applied field) $+$ (field of the induced charge). The induced term must cancel the applied potential on the surface; its radial slope there decides how much it adds to the normal field. Cylinder: $\frac{R^2}{s}$ has slope $1\times$ at $s = R$, so $E_s = E_0 + E_0 = 2E_0\cos\phi$. Sphere: $\frac{R^3}{r^2}$ has slope $2\times$, so $E_r = E_0 + 2E_0 = 3E_0\cos\theta$. A 2-D dipole falls off more slowly ($1/s$ vs $1/r^2$), so it is "flatter" at the surface and adds less.
      `, { f: { svg: IN_FIELD, cap: 'A neutral metal pipe across a uniform field.' }, map: { svg: IN_FIELD_MAP, cap: 'Equipotentials $V = \\pm0.5, \\pm1, \\dots$ (units $E_0R$). They bend around the pipe; the pipe itself is the $V = 0$ equipotential, joined to the plane $x = 0$.' }, sig: { svg: SIGPLOT, cap: 'Induced surface charge around a cylinder ($2\\cos\\phi$) and a sphere ($3\\cos\\theta$) in the same field.' } }),

      Q(md`For the pipe in a uniform field, what kills the $\ln s$ term?`,
        [md`$V(R,\phi) = 0$`, md`The pipe is neutral: $\ln s$ would carry a net charge per length $-2\pi\varepsilon_0b_0$`, md`Single-valuedness`, md`The field is uniform`],
        1,
        [md`$a_0 + b_0\ln R = 0$ is one equation for two constants; it can't kill $b_0$ alone.`,
          null,
          md`$\ln s$ is single-valued.`,
          md`The uniform part is the $s\cos\phi$ term; it says nothing about $\ln s$.`],
        md`The $\ln s$ coefficient is fixed by Gauss's law, not by the potential on the pipe. Neutral pipe: $b_0 = 0$. A charged pipe (next problem) keeps $-\frac{\lambda}{2\pi\varepsilon_0}\ln(s/R)$.`,
        { figHtml: IN_FIELD }),

      Q(md`Translate into boundary conditions: "a long grounded metal pipe of radius $R$ is placed in a field that is uniform, $E_0\hat{\mathbf x}$, far away".`,
        [md`$V(R,\phi) = 0$ and $V\to0$ as $s\to\infty$`,
          md`$V(R,\phi) = V_0$ and $V\to -E_0x$ as $s\to\infty$`,
          md`$V(R,\phi) = 0$ and $V\to -E_0s\cos\phi$ as $s\to\infty$`,
          md`$\partial V/\partial s = 0$ at $s = R$ and $V\to -E_0s\cos\phi$`],
        2,
        [md`$V\to0$ far away contradicts the uniform field there; the potential of a uniform field grows like $-E_0x$.`,
          md`Grounded means $V = 0$, not $V_0$.`,
          null,
          md`$\partial V/\partial s = 0$ at the surface would mean no field just outside, hence no surface charge. A metal surface in a field does carry induced charge; the metal condition is $V = \text{const}$.`],
        md`"Grounded" → $V = 0$ on the metal. "Uniform field far away" → $V \to -E_0x = -E_0s\cos\phi$ (plus a constant, fixed here to $0$ by symmetry). These two BCs pin down $V = -E_0(s - R^2/s)\cos\phi$.`,
        { figHtml: cyl({ R: 50, metal: true, field: true, lab: [['V=0', 125]] }) }),

      Q(md`If the pipe in the uniform field is **isolated and neutral** rather than grounded, what replaces $V(R,\phi) = 0$?`,
        [md`$\partial V/\partial s = 0$ on the pipe`,
          md`$V(R,\phi) = -E_0R\cos\phi$`,
          md`Nothing; the problem is underdetermined`,
          md`$V(R,\phi) = V_c$, an unknown constant, together with zero net charge (no $\ln s$ term)`],
        3,
        [md`That says no surface charge; but a conductor in a field does get induced charge.`,
          md`That is the applied potential, not a conductor (not constant on the surface).`,
          md`"Equipotential + given total charge" is enough for uniqueness (the second uniqueness theorem).`,
          null],
        md`A conductor is an equipotential at an unknown $V_c$; the charge condition fixes $V_c$. Here $b_0 = 0$ (neutral), and the antisymmetry $x\to-x$ forces $V_c = 0$, so the answer is the same as for the grounded pipe. Note: in 2-D, "grounded" and "neutral" coincide only because of this symmetry.`,
        { figHtml: IN_FIELD }),

      Q(md`What is the net force per unit length on the neutral pipe in the uniform field?`,
        [md`Zero: equal and opposite induced charges sit in equal and opposite fields`, md`$2\pi\varepsilon_0E_0^2R$ along $+x$`, md`Along $-x$, toward the source of the field`, md`It depends on the sign of $E_0$`],
        0,
        [null, md`The induced charge $\propto\cos\phi$ is symmetric front-to-back; a uniform field pushes $+$ and $-$ equally.`, md`A neutral object in a **uniform** field feels no net force; it would need a field gradient.`, md`Reversing $E_0$ reverses the induced charge too; the force stays zero.`],
        md`Net charge zero and uniform applied field: $\vb F = \lambda_{\text{net}}\vb E_0 = 0$. (In a non-uniform field it would be pulled toward stronger field.)`,
        { figHtml: IN_FIELD }),

      Q(md`Where on the pipe is the induced surface charge largest, and what is it?`,
        [md`At $\phi = \pm\pi/2$, $\sigma = 2\varepsilon_0E_0$`, md`At $\phi = 0$, $\sigma = \varepsilon_0E_0$`, md`At $\phi = 0$, $\sigma = 3\varepsilon_0E_0$`, md`At $\phi = 0$, $\sigma = 2\varepsilon_0E_0$`],
        3,
        [md`$\cos(\pm\pi/2) = 0$: the top and bottom are uncharged.`,
          md`That forgets the induced charge's own field; you get $E_0 + E_0$.`,
          md`$3$ is the sphere.`,
          null],
        md`$\sigma = 2\varepsilon_0E_0\cos\phi$, maximal on the downstream side $\phi = 0$, where the field lines leave the metal (field lines start on positive charge). The upstream side $\phi = \pi$ carries $-2\varepsilon_0E_0$.`,
        { figHtml: IN_FIELD }),

      Q(md`A grounded metal cylinder and a grounded metal sphere of the same radius sit in the same uniform field $E_0$ (the cylinder's axis perpendicular to the field). What is the ratio of their largest induced surface charge densities, cylinder : sphere?`,
        [md`$1:1$`, md`$3:2$`, md`$1:2$`, md`$2:3$`],
        3,
        [md`The field at a conductor's surface is the applied field **plus** the field of the induced charge, and the induced part differs: $E_0$ for the cylinder, $2E_0$ for the sphere.`,
          md`Upside down: the sphere has $3\varepsilon_0E_0$, the cylinder $2\varepsilon_0E_0$.`,
          md`$1:2$ compares only the induced parts ($E_0$ vs $2E_0$), not the total surface fields $2E_0$ and $3E_0$.`,
          null],
        md`Cylinder: $\sigma = 2\varepsilon_0E_0\cos\phi$. Sphere: $\sigma = 3\varepsilon_0E_0\cos\theta$. The induced 2-D dipole potential $R^2\cos\phi/s$ has radial slope $1\times$ at the surface; the 3-D dipole $R^3\cos\theta/r^2$ has slope $2\times$. So the surface field is $E_0 + E_0$ for the cylinder and $E_0 + 2E_0$ for the sphere.`,
        { figHtml: FIELD_G }),

      Q(md`Just outside the neutral pipe in the uniform field $E_0\hat{\mathbf x}$, on the downstream side ($\phi = 0$), how strong is the field?`,
        [md`$E_0$: the applied field is unchanged at the surface`, md`$2E_0$, pointing radially out of the pipe`, md`$3E_0$`, md`$0$, because the pipe shields it`],
        1,
        [md`The induced charge adds its own field. At $\phi = 0$ it adds another $E_0$ outward.`,
          null,
          md`$3E_0$ is the sphere.`,
          md`Shielding happens **inside** the metal. Outside, the field lines crowd onto the surface.`],
        md`$E_s = -\partial_sV = E_0\left(1 + \frac{R^2}{s^2}\right)\cos\phi$, which is $2E_0$ at $s = R$, $\phi = 0$. The field lines bunch up where they converge onto the front and back of the pipe, and the field doubles there.`,
        { figHtml: IN_FIELD }),

      Q(md`Same pipe in the uniform field. What is the field just outside the surface at the top of the pipe ($\phi = \pi/2$)?`,
        [md`Zero`, md`$E_0\hat{\mathbf x}$, as far away`, md`$2E_0\hat{\mathbf x}$, sped up around the pipe`, md`$E_0$, pointing radially outward`],
        0,
        [null,
          md`At a conductor's surface the field has no tangential part, and $\hat{\mathbf x}$ is tangent to the pipe at the top.`,
          md`That is the flow of an ideal fluid around a cylinder, which must run tangent to the surface. A conductor's field must be normal to it.`,
          md`$E_s = 2E_0\cos\phi$, which is $0$ at $\phi = \pi/2$.`],
        md`On the metal $\vb E$ is normal, and $E_s = 2E_0\cos\phi = 0$ at the top. So $\vb E = 0$ there and $\sigma = 0$: that is where the induced charge changes sign. Moving away from the surface, the field grows back toward $E_0$.`,
        { figHtml: IN_FIELD }),

      Q(md`Far from the neutral pipe in the uniform field, the pipe's own contribution to $V$ (the induced charge's potential) falls off as`,
        [md`$1/s^2$, like a dipole`, md`$\ln s$`, md`$1/s$`, md`$1/s^3$`],
        2,
        [md`$1/r^2$ is the **3-D** dipole. A line dipole in 2-D gives $\cos\phi/s$.`,
          md`$\ln s$ is the net-charge term, and the pipe is neutral.`,
          null,
          md`Too fast: $1/s^3$ would be a $k = 3$ multipole.`],
        md`$V = -E_0s\cos\phi + E_0R^2\frac{\cos\phi}{s}$. The second term is a 2-D dipole: two opposite line charges close together, potential $\propto\cos\phi/s$, field $\propto1/s^2$. Everything in 2-D is one power slower than in 3-D: monopole $\ln s$ vs $1/r$, dipole $1/s$ vs $1/r^2$.`,
        { figHtml: IN_FIELD }),

      Q(md`A line dipole with moment $p'$ per unit length has $V = \dfrac{p'\cos\phi}{2\pi\varepsilon_0s}$. What is the induced dipole moment per unit length of the neutral pipe in the field $E_0\hat{\mathbf x}$?`,
        [md`$2\pi\varepsilon_0R^2E_0$`, md`$4\pi\varepsilon_0R^3E_0$`, md`$\pi\varepsilon_0R^2E_0$`, md`$\varepsilon_0R^2E_0$`],
        0,
        [null,
          md`That is the **sphere**'s induced moment, with units C·m. A moment per unit length has units C.`,
          md`Off by $2$. Match $E_0R^2\cos\phi/s$ with $p'\cos\phi/(2\pi\varepsilon_0s)$.`,
          md`Missing the $2\pi$ from the line-charge potential.`],
        md`Match the induced term: $E_0R^2\frac{\cos\phi}{s} = \frac{p'\cos\phi}{2\pi\varepsilon_0s} \Rightarrow p' = 2\pi\varepsilon_0R^2E_0$. Check directly: $p' = \oint\sigma\,x\,dl = \int_0^{2\pi}2\varepsilon_0E_0\cos\phi\cdot R\cos\phi\cdot R\,d\phi = 2\pi\varepsilon_0E_0R^2$.`,
        { figHtml: IN_FIELD }),

      P({
        title: 'A charged metal pipe in a uniform field (Kou-level)', big: true,
        q: md`The metal pipe of radius $R$ now carries charge $\lambda$ per unit length and sits in the uniform field $E_0\hat{\mathbf x}$. Take $V = 0$ on the pipe.

          (a) List the BCs and find $V(s,\phi)$ for $s>R$. (b) Find $\sigma(\phi)$. (c) For $\lambda = 2\pi\varepsilon_0E_0R$, at what angle $\phi$ (between $0$ and $\pi$) is $\sigma = 0$? (d) What is the smallest $\lambda>0$ for which $\sigma\ge0$ everywhere?`,
        figHtml: IN_FIELD_Q,
        hints: [md`Superpose: the neutral-pipe solution plus a charged-pipe solution. Both are zero on the pipe.`, md`A charged pipe alone: $-\frac{\lambda}{2\pi\varepsilon_0}\ln(s/R)$, zero at $s = R$.`, md`$\sigma = -\varepsilon_0\partial_sV|_R$; set it to zero and solve for $\cos\phi$.`],
        parts: [
          { lbl: md`(a) $V(s,\phi)$`, expr: '-E0*(s - R^2/s)*cos(phi) - lambda*ln(s/R)/(2*pi*eps0)', vars: { E0: [1, 3], s: [1.6, 3], R: [1, 1.5], phi: [0, 3], lambda: [1, 3], eps0: [0.5, 2] }, accepts: ['-E0*(s - R^2/s)*cos(phi) - lambda*(ln(s)-ln(R))/(2*pi*eps0)'] },
          { lbl: md`(b) $\sigma(\phi)$`, expr: '2*eps0*E0*cos(phi) + lambda/(2*pi*R)', vars: { E0: [1, 3], R: [1, 1.5], phi: [0, 3], lambda: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`(c) $\phi$ where $\sigma = 0$ (radians)`, ans: 2.0944, unit: '' },
          { lbl: md`(d) Smallest $\lambda$ with $\sigma\ge0$ everywhere`, expr: '4*pi*eps0*E0*R', vars: { eps0: [0.5, 2], E0: [1, 3], R: [0.5, 2] } },
        ],
        sol: md`
          **(a) BCs:** (1) $V(R,\phi) = 0$; (2) $V \to -E_0s\cos\phi - \frac{\lambda}{2\pi\varepsilon_0}\ln s + \text{const}$ far away (applied field plus the line-charge field required by Gauss's law). Now $b_0 = -\lambda/(2\pi\varepsilon_0)$ is fixed by the charge. Then #1 fixes $a_0 = -b_0\ln R$ and $c_1 = E_0R^2$ as before:
          $$V = -E_0\left(s - \frac{R^2}{s}\right)\cos\phi - \frac{\lambda}{2\pi\varepsilon_0}\ln\frac sR .$$

          **(b)** $\sigma = -\varepsilon_0\partial_sV\big|_R = 2\varepsilon_0E_0\cos\phi + \dfrac{\lambda}{2\pi R}$. Check: $\int_0^{2\pi}\sigma R\,d\phi = \lambda$.

          **(c)** $\cos\phi = -\dfrac{\lambda}{4\pi\varepsilon_0E_0R} = -\dfrac12 \Rightarrow \phi = \dfrac{2\pi}{3} = 2.094$ (and $-2\pi/3$). The neutral line moves upstream from $\pm\pi/2$.

          **(d)** $\sigma \ge 0$ at $\phi = \pi$ needs $\frac{\lambda}{2\pi R} \ge 2\varepsilon_0E_0$, so $\lambda \ge 4\pi\varepsilon_0E_0R$.

          **What to remember.** Charge and applied field separate cleanly: the $\ln s$ term carries the charge, the $s^{\pm1}\cos\phi$ terms carry the field. The reference $V = 0$ on the pipe is a choice you are told; in 2-D with net charge you can't use infinity.
        `,
      }),

      Q(md`The metal pipe in the uniform field now carries net charge $\lambda$ per length. Far away, which part of the **pipe's own** contribution to $V$ dominates?`,
        [md`The induced dipole, $\propto\cos\phi/s$`, md`A constant`, md`The line-charge term, $-\dfrac{\lambda}{2\pi\varepsilon_0}\ln s$`, md`A $1/s^2$ term`],
        2,
        [md`$1/s$ dies away while $\ln s$ keeps growing in magnitude. With $\lambda \ne 0$ the monopole wins.`,
          md`A constant has no field. The net charge makes a field $\lambda/(2\pi\varepsilon_0s)$ at any distance.`,
          null,
          md`There is no $k = 2$ term here at all, and it would fall faster than the others anyway.`],
        md`$V = -E_0\left(s - \frac{R^2}{s}\right)\cos\phi - \frac{\lambda}{2\pi\varepsilon_0}\ln\frac sR$. The pipe's own part is a line charge plus a line dipole, and the first nonzero multipole wins far away, just as in 3-D. Here that is the monopole ($k = 0$).`,
        { figHtml: IN_FIELD_Q }),

      Q(md`Outside a long charged insulating shell, $V = 4 - 3\ln\dfrac sR + 2\dfrac Rs\cos\phi$ (in volts). Which part tells you the shell's net charge per unit length?`,
        [md`The constant $4$`, md`Only the coefficient of $\ln s$: $\lambda = 2\pi\varepsilon_0\cdot3$`, md`The coefficient of $\cos\phi/s$`, md`Both the $\ln s$ and the $\cos\phi/s$ coefficients`],
        1,
        [md`A constant carries no field and no charge; it only sets the reference level.`,
          null,
          md`The $\cos\phi/s$ term is a line dipole. Its charge integrates to zero around the shell.`,
          md`Only $k = 0$ carries net charge: Gauss's law over a big circle needs $\oint E_s\,s\,d\phi$, and every $\cos k\phi$ term integrates to zero.`],
        md`$\oint E_s\,s\,d\phi = \lambda/\varepsilon_0$. The $\ln s$ term gives $E_s = 3/s$, so $\lambda = 2\pi\varepsilon_0\cdot3 = 6\pi\varepsilon_0$ C/m; the dipole term adds $\int\cos\phi\,d\phi = 0$. The $\ln s$ coefficient counts the charge; everything else describes how the charge is arranged.`,
        { figHtml: SHELL_Q }),

      Q(md`A coaxial cable: the inner wire carries $+\lambda$ per length and the outer tube $-\lambda$. What is $V$ outside the tube?`,
        [md`$-\dfrac{\lambda}{2\pi\varepsilon_0}\ln s + \text{const}$`, md`Proportional to $1/s$`, md`A constant: there is no field outside`, md`It depends on the tube's thickness`],
        2,
        [md`The $\ln s$ coefficient counts **all** the charge inside the circle, and $+\lambda - \lambda = 0$.`,
          md`$1/s$ needs a $\cos\phi$ asymmetry. Everything here is symmetric about the axis.`,
          null,
          md`Gauss's law cares only about the enclosed charge, not about the tube's thickness.`],
        md`By symmetry only the $k = 0$ terms $a_0 + b_0\ln s$ appear, and $b_0 = -\lambda_{\text{enc}}/(2\pi\varepsilon_0) = 0$ outside. So $E = 0$ and $V$ is constant there. This is why a coaxial cable produces no field outside itself.`,
        { figHtml: COAX_PM }),

      P({
        title: 'Coaxial cylinders with an angular potential',
        q: md`A grounded metal rod of radius $a$ is surrounded by a coaxial thin shell of radius $b$ held at $V(b,\phi) = V_0\cos\phi$.

          (a) Find $V(s,\phi)$ for $a<s<b$. (b) Find $\sigma(\phi)$ on the rod. (c) For $b = 2a$, evaluate $V(1.5a, 0)/V_0$. (d) What is the net charge per length on the rod?`,
        figHtml: COAXCOS,
        hints: [md`Only $k = 1$ cosine; keep both $s$ and $1/s$ (annulus).`, md`The rod is grounded: $Ca + D/a = 0$.`, md`$\sigma = \varepsilon_0E_s$ at $s = a$ (normal out of the rod is $+\hat{\mathbf s}$).`],
        parts: [
          { lbl: md`(a) $V(s,\phi)$`, expr: 'V0*cos(phi)*(s - a^2/s)/(b - a^2/b)', vars: { V0: [1, 3], s: [1.1, 1.9], a: [0.5, 1], b: [2, 3], phi: [0, 3] }, accepts: ['V0*b*cos(phi)*(s^2-a^2)/(s*(b^2-a^2))'] },
          { lbl: md`(b) $\sigma(\phi)$ on the rod`, expr: '-2*eps0*V0*b*cos(phi)/(b^2 - a^2)', vars: { eps0: [0.5, 2], V0: [1, 3], a: [0.5, 1], b: [2, 3], phi: [0, 3] } },
          { lbl: md`(c) $V(1.5a,0)/V_0$ for $b = 2a$`, ans: 0.55556, unit: '' },
          { lbl: md`(d) Net charge per length on the rod`, mc: [md`$0$`, md`$-2\pi\varepsilon_0V_0$`, md`$\dfrac{2\pi\varepsilon_0V_0}{\ln(b/a)}$`, md`It depends on $\phi$`], a: 0,
            why: [null, md`$\int\cos\phi\,d\phi = 0$ over a full turn.`, md`That is the coax with a constant potential difference; here the shell's average is zero.`, md`Net charge is a single number, the integral over $\phi$.`] },
        ],
        sol: md`
          **BCs:** (1) $V(a,\phi) = 0$; (2) $V(b,\phi) = V_0\cos\phi$.

          (a) $V = (Cs + D/s)\cos\phi$; (1): $D = -Ca^2$; (2): $C(b - a^2/b) = V_0$.
          $$V = V_0\cos\phi\,\frac{s - a^2/s}{b - a^2/b} .$$

          (b) $E_s = -\partial_sV = -V_0\cos\phi\,\dfrac{1 + a^2/s^2}{b - a^2/b}$; at $s = a$: $-\dfrac{2V_0\cos\phi}{b - a^2/b}$. $\sigma = \varepsilon_0E_s(a) = -\dfrac{2\varepsilon_0V_0b\cos\phi}{b^2 - a^2}$. Negative on the side facing the positive part of the shell, as induction suggests.

          (c) $\dfrac{1.5 - 0.6667}{2 - 0.5} = 0.5556$.

          (d) $0$: no $\ln s$ term.
        `,
      }),

      RF(md`
        ### A line charge beside a grounded pipe (connects to the images unit)

        A line charge $\lambda$ runs parallel to a grounded metal pipe of radius $R$, a distance $d > R$ from its axis.

        [[fig:lc]]

        **Region:** outside the pipe, $s>R$, except the line itself. **BCs:**
        1. $V(R,\phi) = 0$ (grounded pipe)
        2. near the line, $V \to -\dfrac{\lambda}{2\pi\varepsilon_0}\ln(\text{distance to the line})$ (the given charge)
        3. $V$ stays bounded as $s\to\infty$ (no leftover $\ln s$)

        BC 3 is what "grounded" means in 2-D: you can't put the zero at infinity, so instead you require that nothing grows far away. Since a net charge per length always brings a growing $\ln s$, the pipe must carry exactly $-\lambda$.

        **Images.** For a cylinder the image of a line charge is a line charge $-\lambda$ (same magnitude, not $-\lambda R/d$ as for a sphere's point charge) at distance $R^2/d$ from the axis, plus a constant: on the pipe the pair gives $\frac{\lambda}{2\pi\varepsilon_0}\ln\frac Rd$, the same at every point of the circle, so add $\frac{\lambda}{2\pi\varepsilon_0}\ln\frac dR$ to ground it. The induced surface charge is
        $$\sigma(\phi) = -\frac{\lambda}{2\pi R}\,\frac{d^2 - R^2}{R^2 + d^2 - 2Rd\cos\phi},$$
        and it adds up to exactly $-\lambda$ per length.

        **Separation.** The same answer comes from expanding the line charge's potential on circles, $\ln|\vb s - \vb d| = \ln d - \sum_{k\ge1}\frac1k\left(\frac sd\right)^k\cos k\phi$ for $s<d$, and adding $s^{-k}\cos k\phi$ terms to cancel each mode on the pipe. Images are faster here; separation is the general method when the boundary data aren't produced by a simple charge.

        [[fig:img]]
      `, { lc: { svg: LINECYL, cap: 'Line charge $\\lambda$ parallel to a grounded pipe.' }, img: { svg: LINECYL_IMG, cap: 'The image: $-\\lambda$ at $R^2/d$ (the pipe drawn dashed, replaced by the image).' } }),

      Q(md`A line charge $\lambda$ is at distance $d$ from the axis of a grounded pipe of radius $R$. How much charge per unit length is induced on the pipe?`,
        [md`$-\lambda R/d$`, md`$0$`, md`$-\lambda$`, md`$-\lambda d/R$`],
        2,
        [md`That is the sphere's image rule ($q' = -qR/a$). For a cylinder and a line charge the image is $-\lambda$.`,
          md`Zero induced charge is the isolated neutral pipe. Then the image system would need an extra $+\lambda$ on the axis, and the total charge $\lambda$ would make $V$ grow like $\ln s$ far away.`,
          null,
          md`The image strength is exactly $-\lambda$. Any total other than $-\lambda$ (line plus pipe) leaves a net $\ln s$ term, and $V$ grows without bound far away.`],
        md`The image line has strength $-\lambda$ at $R^2/d$, so the induced charge per length is $-\lambda$. In 2-D, "grounded" means the pipe is an equipotential **and** $V$ stays bounded far away (BC 3). That forces the line and the pipe together to be neutral, so the full $-\lambda$ goes onto the pipe.`,
        { figHtml: LINECYL }),

      Q(md`For the line charge $\lambda>0$ beside the grounded pipe, where is the induced charge density largest in magnitude?`,
        [md`On the side nearest the line charge`, md`On the far side`, md`At the top and bottom ($\phi = \pm\pi/2$)`, md`It is uniform, because the pipe is an equipotential`],
        0,
        [null,
          md`The far side is shielded by the pipe itself and sees the weakest field.`,
          md`Nothing special happens at $\pm\pi/2$; $|\sigma|$ decreases steadily from the near side to the far side.`,
          md`Equipotential doesn't mean uniform charge. The charge arranges itself so that the potential is uniform, and that takes more charge where the line is close.`],
        md`$|\sigma| \propto \dfrac{1}{R^2 + d^2 - 2Rd\cos\phi}$, largest at $\phi = 0$, where the distance to the line is smallest. All of it is negative (for $\lambda>0$), attracted toward the line.`,
        { figHtml: LINECYL }),

      Q(md`The line charge $\lambda$ now sits beside an **isolated, neutral** metal pipe instead of a grounded one. Which image system reproduces the field outside?`,
        [md`$-\lambda$ at $R^2/d$ only, as for the grounded pipe`, md`$-\lambda R/d$ at $R^2/d$`, md`No image: a neutral pipe has no induced charge`, md`$-\lambda$ at $R^2/d$ plus $+\lambda$ on the axis`],
        3,
        [md`That puts $-\lambda$ on the pipe, which is the grounded case. A neutral pipe must carry zero net charge.`,
          md`$-qR/a$ is the sphere's rule. For a line charge and a cylinder the image strength is $-\lambda$.`,
          md`Neutral means zero **net** charge. Induced $+$ and $-$ charge still separate.`,
          null],
        md`The pair ($\lambda$ at $d$, $-\lambda$ at $R^2/d$) makes the circle an equipotential. A line charge on the axis is also constant on that circle, so adding $+\lambda$ there keeps the circle an equipotential and brings the pipe's net charge back to zero. Same trick as for a neutral sphere (an extra image at the center).`,
        { figHtml: LINE_NEUTRAL }),

      Q(md`The line charge is moved farther and farther from the grounded pipe ($d \to \infty$). What happens to the total induced charge per length on the pipe?`,
        [md`It shrinks like $-\lambda R/d$, as for a grounded sphere`, md`It shrinks to zero exponentially`, md`It stays exactly $-\lambda$`, md`It grows like $\ln(d/R)$`],
        2,
        [md`That is the 3-D sphere, where $q' = -qR/a$. In 2-D the image strength is $-\lambda$ for every $d$.`,
          md`Nothing exponential appears: the image charge doesn't depend on $d$ at all.`,
          null,
          md`The total is fixed at $-\lambda$; only its distribution changes with $d$.`],
        md`In 2-D, "grounded" means the pipe is at the same potential as far away, and any net line charge would make $V$ grow like $\ln s$. So line plus pipe must be neutral for every $d$, and the pipe carries $-\lambda$. As $d$ grows the charge only spreads more evenly: $\sigma(0)/\sigma(\pi) = \left(\frac{d+R}{d-R}\right)^2 \to 1$.`,
        { figHtml: LINECYL }),

      Q(md`A line charge $\lambda$ sits **inside** a grounded pipe, at distance $d<R$ from its axis. Where is the image that makes the pipe an equipotential?`,
        [md`$-\lambda$ at distance $R - d$ from the axis`, md`$-\lambda$ at distance $R^2/d$ from the axis, outside the pipe`, md`$-\lambda R/d$ at $R^2/d$`, md`$-\lambda$ on the axis`],
        1,
        [md`For a circle the image distance is never "$R$ minus something"; the rule is $d\,d' = R^2$.`,
          null,
          md`For a cylinder the image strength is $-\lambda$, not $-\lambda R/d$.`,
          md`A line charge on the axis is constant on the circle, so it can't cancel the variation that the off-center line produces around the pipe.`],
        md`The same rule works both ways: $d\,d' = R^2$, so $d' = R^2/d > R$. The image always sits on the far side of the boundary from the region of interest, here outside the pipe. Inside, $V$ is the potential of $\lambda$ and its image, plus a constant that makes the pipe zero.`,
        { figHtml: LINE_INSIDE }),

      P({
        title: 'Line charge and grounded pipe: numbers',
        q: md`For the line charge $\lambda$ at distance $d$ from the axis of a grounded pipe of radius $R$: (a) where is the image? (b) Find $\sigma$ at the point of the pipe nearest the line ($\phi = 0$). (c) For $d = 3R$, find the ratio $\sigma(0)/\sigma(\pi)$.`,
        figHtml: LINECYL,
        hints: [md`Image $-\lambda$ at $R^2/d$.`, md`Use $\sigma(\phi) = -\frac{\lambda}{2\pi R}\frac{d^2-R^2}{R^2+d^2-2Rd\cos\phi}$ and factor $d^2 - R^2$.`],
        parts: [
          { lbl: md`(a) Distance of the image from the axis`, expr: 'R^2/d', vars: { R: [0.5, 1], d: [1.5, 3] } },
          { lbl: md`(b) $\sigma(0)$`, expr: '-lambda*(d + R)/(2*pi*R*(d - R))', vars: { lambda: [1, 3], R: [0.5, 1], d: [1.5, 3] } },
          { lbl: md`(c) $\sigma(0)/\sigma(\pi)$ for $d = 3R$`, ans: 4, unit: '' },
        ],
        sol: md`
          (a) $R^2/d$, on the line joining the axis to $\lambda$.

          (b) At $\phi = 0$: $R^2 + d^2 - 2Rd = (d - R)^2$, so $\sigma(0) = -\dfrac{\lambda}{2\pi R}\dfrac{(d-R)(d+R)}{(d-R)^2} = -\dfrac{\lambda}{2\pi R}\dfrac{d+R}{d-R}$.

          (c) $\sigma(\pi) = -\dfrac{\lambda}{2\pi R}\dfrac{d-R}{d+R}$. Ratio $= \left(\dfrac{d+R}{d-R}\right)^2 = (4/2)^2 = 4$. The near side carries four times the density of the far side.
        `,
      }),

      P({
        title: 'A shell with $\\sigma_0(1+\\cos\\phi)$ (Kou-level)', big: true,
        q: md`A thin cylindrical shell of radius $R$ carries $\sigma(\phi) = \sigma_0(1 + \cos\phi)$. Take $V = 0$ at the average over the shell (i.e. the $k = 0$ part of $V$ is zero at $s = R$).

          (a) Write the BCs. (b) Find $V_{\text{in}}$. (c) Find $V_{\text{out}}$. (d) Find the field far away (leading term) in terms of $\sigma_0$, $R$, $s$.`,
        figHtml: SHELL1P,
        hints: [md`Two pieces: the uniform $\sigma_0$ (a $k = 0$ problem with $\ln s$ outside) and $\sigma_0\cos\phi$ (the earlier problem).`, md`Uniform piece: $\lambda = 2\pi R\sigma_0$; inside $V$ is constant (no field), outside $-\frac{\lambda}{2\pi\varepsilon_0}\ln(s/R)$.`, md`Far away the $\ln s$ term dominates: $E_s \approx \frac{\lambda}{2\pi\varepsilon_0 s}$.`],
        parts: [
          { lbl: md`(b) $V_{\text{in}}$`, expr: 'sigma0*s*cos(phi)/(2*eps0)', vars: { sigma0: [1, 3], eps0: [0.5, 2], s: [0.1, 0.9], phi: [0, 3] } },
          { lbl: md`(c) $V_{\text{out}}$`, expr: '-sigma0*R*ln(s/R)/eps0 + sigma0*R^2*cos(phi)/(2*eps0*s)', vars: { sigma0: [1, 3], eps0: [0.5, 2], R: [1, 1.5], s: [1.6, 3], phi: [0, 3] }, accepts: ['-sigma0*R*(ln(s)-ln(R))/eps0 + sigma0*R^2*cos(phi)/(2*eps0*s)'] },
          { lbl: md`(d) $E_s$ far away`, expr: 'sigma0*R/(eps0*s)', vars: { sigma0: [1, 3], eps0: [0.5, 2], R: [1, 1.5], s: [5, 9] } },
        ],
        sol: md`
          **(a) BCs at $s = R$:** (1) $V_{\text{in}} = V_{\text{out}}$; (2) $\partial_sV_{\text{out}} - \partial_sV_{\text{in}} = -\sigma_0(1+\cos\phi)/\varepsilon_0$. Also (3) finite on the axis, (4) only the $\ln s$ that the net charge requires outside, (5) the reference: $k = 0$ part zero at $s = R$.

          **$k = 0$ piece.** Inside: constant $c$ (no $\ln s$ at the axis). Outside: $c + b_0\ln(s/R)$ (continuity). Jump: $\frac{b_0}{R} - 0 = -\frac{\sigma_0}{\varepsilon_0} \Rightarrow b_0 = -\frac{\sigma_0R}{\varepsilon_0} = -\frac{\lambda}{2\pi\varepsilon_0}$ with $\lambda = 2\pi R\sigma_0$. Reference: $c = 0$.

          **$k = 1$ piece.** As before: $\frac{\sigma_0}{2\varepsilon_0}s\cos\phi$ inside, $\frac{\sigma_0R^2}{2\varepsilon_0}\frac{\cos\phi}{s}$ outside.

          (b) $V_{\text{in}} = \dfrac{\sigma_0}{2\varepsilon_0}s\cos\phi$: a uniform field $-\frac{\sigma_0}{2\varepsilon_0}\hat{\mathbf x}$; the uniform part of $\sigma$ adds nothing inside (a charged cylinder has no field inside).

          (c) $V_{\text{out}} = -\dfrac{\sigma_0R}{\varepsilon_0}\ln\dfrac sR + \dfrac{\sigma_0R^2}{2\varepsilon_0}\dfrac{\cos\phi}{s}$.

          (d) $E_s \approx \dfrac{\sigma_0R}{\varepsilon_0s} = \dfrac{\lambda}{2\pi\varepsilon_0s}$: far away only the net charge matters, the formula-sheet line charge.
        `,
      }),

      RF(md`
        !!key Patterns to remember (full circles)
          - Inside: $a_0 + \sum (s/R)^k(\dots)$. Outside: $a_0 + b_0\ln s + \sum (R/s)^k(\dots)$, with $b_0 = -\lambda/(2\pi\varepsilon_0)$.
          - Full-circle Fourier: $a_0 = \frac{1}{2\pi}\int V\,d\phi$, $A_k = \frac1\pi\int V\cos k\phi\,d\phi$, $B_k = \frac1\pi\int V\sin k\phi\,d\phi$. Look for single-mode data first ($\cos^2\phi = \frac12 + \frac12\cos2\phi$).
          - Center value = average on the circle. Neutral 2-D object: $V \to a_0$ far away, not $0$.
          - Charged shell: $V$ continuous, $\partial_sV_{\text{out}} - \partial_sV_{\text{in}} = -\sigma/\varepsilon_0$. $\sigma_0\cos k\phi$ gives amplitude $\frac{\sigma_0R}{2k\varepsilon_0}$.
          - Metal pipe in $E_0\hat{\mathbf x}$: $V = -E_0(s - R^2/s)\cos\phi$, $\sigma = 2\varepsilon_0E_0\cos\phi$ (sphere: $3\varepsilon_0E_0\cos\theta$).
          - Line charge near a grounded pipe: image $-\lambda$ at $R^2/d$; induced charge $-\lambda$.
      `),
    ],
  };

  // ================================================================ Lesson 4 figures
  const BALL = ball({ kind: 'pm', Rdim: 200, labs: [['+\\rho_0', 140], ['-\\rho_0', 220]] });
  const BALL_P = ball({ kind: 'pm', P: [135, 40], labs: [['+\\rho_0', 140], ['-\\rho_0', 220]] });
  const BALL_EQ = ball({ kind: 'pm', P: [135, 90], thR: 22, labs: [['+\\rho_0', 140], ['-\\rho_0', 220]] });
  const BALL_EXTX = ball({ kind: 'pm', labs: [['+\\rho_0', 140], ['-\\rho_0', 220]], extra: (f) => {
    for (const y of [-40, 0, 40]) { f.arrow(-150, y, -96, y, { cls: 'dim', hs: 6 }); f.arrow(96, y, 150, y, { cls: 'dim', hs: 6 }); }
    put(f, 150, -40, '\\vb E_0', ['r', 'tr'], 6); axis(f, 64, 70, 100, 70, 'x', ['r', 'br']);
  } });
  const RING = (() => {
    const f = PF.fig();
    f.ellipse(0, 0, 70, 18, { half: 'front', cls: 'thick' }); f.ellipse(0, 0, 70, 18, { half: 'back', cls: 'thick' });
    f.line(0, 60, 0, 22, { cls: 'dim dash thin' }); f.line(0, 14, 0, -14, { cls: 'dim dash thin' });
    axis(f, 0, -22, 0, -80, 'z', ['t', 'tr']);
    f.dot(0, 0, 2.2); put(f, 70, 0, '\\lambda', ['r', 'tr', 'br'], 6, 'small');
    return widen(f).svg();
  })();
  const BALL_AX = ball({ kind: 'pm', zTop: 150, labs: [['+\\rho_0', 140], ['-\\rho_0', 220]], extra: (f) => { f.dot(0, -118, 2.8); put(f, 0, -118, 'P\\ (z)', ['r', 'tr'], 6); } });
  const SHELLPM = ball({ kind: 'shellpm', Rdim: 200, labs: [['+\\sigma_0', 125, 70], ['-\\sigma_0', 235, 70]] });
  const HEMI = ball({ kind: 'north', Rdim: 155, labs: [['\\rho_0', 135]] });
  const BALLCOS = ball({ kind: 'full', Rdim: 200, labs: [['\\rho=\\rho_0\\cos\\theta', 40]] });
  const BALLRSIN = ball({ kind: 'full', Rdim: 200, labs: [['\\rho=kr\\sin\\theta', 40]] });
  const BALL_EXT = ball({ kind: 'pm', labs: [['+\\rho_0', 140], ['-\\rho_0', 220]], extra: (f) => {
    for (const x of [-120, -100, 100, 120]) f.arrow(x, 60, x, -60, { cls: 'dim', hs: 6 });
    put(f, 120, -60, '\\vb E_0', ['r', 'tr'], 6);
  } });
  // one octant of a ball, oblique view (x toward the viewer, y right, z up)
  function octant(o = {}) {
    const f = PF.fig({ proj: { ox: 0, oy: 0, s: 1 } }), R = 90;
    const arc = (fn) => [...Array(31)].map((_, i) => f.p3(...fn(i / 30 * PI / 2)));
    const xy = arc((t) => [R * Math.cos(t), R * Math.sin(t), 0]), xz = arc((t) => [R * Math.cos(t), 0, R * Math.sin(t)]), yz = arc((t) => [0, R * Math.cos(t), R * Math.sin(t)]);
    shadeP(f, xy.concat(yz.slice(1)).concat(xz.slice().reverse().slice(1)));
    f.pl(xy, { cls: 'thick' }); f.pl(xz, { cls: 'thick' }); f.pl(yz, { cls: 'thick' });
    for (const [p, q] of [[[0, 0, 0], [R, 0, 0]], [[0, 0, 0], [0, R, 0]], [[0, 0, 0], [0, 0, R]]]) { const A = f.p3(...p), B = f.p3(...q); dl(f, A[0], A[1], B[0], B[1], { cls: 'dim dash thin' }); }
    const ax = (q, lab) => { const A = f.p3(...q.map((v) => v * R)), B = f.p3(...q.map((v) => v * (R + 45))); axis(f, A[0], A[1], B[0], B[1], lab); };
    ax([1, 0, 0], 'x'); ax([0, 1, 0], 'y'); ax([0, 0, 1], 'z');
    const c = f.p3(R * 0.35, R * 0.35, R * 0.35); put(f, c[0], c[1], o.lab || '\\rho_0', ['r', 'tr', 'br'], 2);
    const e = f.p3(0, R * 0.5, 0); put(f, e[0], e[1], 'R', ['b', 'br'], 4, 'small');
    return widen(f).svg();
  }
  const OCT = octant();
  // solution sketch: the dipole term's field at three points around the +/- ball
  const DIPDIR = ball({ kind: 'full', labs: [['+\\rho_0', 140], ['-\\rho_0', 220]], zTop: 160, extra: (f) => {
    f.arrow(0, 30, 0, -30, { cls: 'thick', hs: 8 }); put(f, 0, 6, '\\vb p', ['r', 'l', 'br', 'bl'], 5);
    f.dot(0, -120, 2.6); f.arrow(0, -120, 0, -146, { hs: 6 });
    f.dot(130, 0, 2.6); f.arrow(130, 0, 130, 24, { hs: 6 });
    f.dot(-130, 0, 2.6); f.arrow(-130, 0, -130, 24, { hs: 6 });
    put(f, 0, -132, '\\theta=0', ['r', 'tr'], 8, 'small'); put(f, 130, 0, '\\theta=90^\\circ', ['t', 'tr', 'r'], 8, 'small');
  } });
  // disk slicing for the exact axis potential
  const DISKS = (() => {
    const f = PF.fig(), R = 62, zp = 26, a = Math.sqrt(R * R - zp * zp);
    shadeP(f, f.arcPts(0, 0, R, R, 0, 180)); shadeP(f, f.arcPts(0, 0, R, R, 180, 360)); f.circle(0, 0, R);
    f.line(-R + 2, 0, R - 2, 0, { cls: 'dim dash thin' });
    f.rect(-a, -zp - 3, 2 * a, 6, { cls: 'thick' });
    f.line(0, R + 14, 0, R + 2, { cls: 'dim dash thin' }); f.line(0, R - 2, 0, -zp - 4, { cls: 'dim dash thin' }); f.line(0, -zp + 4, 0, -R - 70, { cls: 'dim dash thin' });
    axis(f, 0, -R - 70, 0, -R - 100, 'z', ['t', 'tr']);
    f.dot(0, -R - 50, 2.8); put(f, 0, -R - 50, 'P', ['r', 'tr'], 6);
    dl(f, a, -zp, 0, -R - 50, { cls: 'dim thin' });
    put(f, a, -zp, 'z\'', ['r', 'br'], 8, 'small');
    put(f, a / 2, -zp - 3, '\\sqrt{R^2-z\'^2}', ['t', 'tl'], 18, 'small');
    return widen(f).svg();
  })();
  const AXPLOT = plt({ w: 330, h: 200, x: [1, 4], y: [0.85, 1.03], xl: 'z/R', yl: 'V_{\\text{exact}}/V_{\\text{dip}}', xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[0.9, '0.9'], [1, '1']], hlines: [[1, '']],
    curves: [{ f: (z) => (2 * Math.pow(z * z + 1, 1.5) - 2 * z * z * z - 3 * z) / (6 * z) / (1 / (8 * z * z)), lab: '\\text{exact}/\\text{dipole}', labAt: 1.8, sides: ['br', 'b'] }], pts: [{ x: 2, y: 0.9618 }] });

  // extra setup figures for the added conceptual MCs (lesson 4)
  // point charges in the xz-plane (x right, z up); list: { x, z, q: '+'|'-', lab }
  function qfig(list, o = {}) {
    const f = PF.fig();
    const xr = o.xr ?? 95, zr = o.zr ?? 95;
    if (o.x !== false) { f.line(-xr, 0, xr, 0, { cls: 'dim dash thin' }); axis(f, xr, 0, xr + 22, 0, 'x', ['r', 'br', 'tr']); }
    f.line(0, zr, 0, -zr, { cls: 'dim dash thin' }); axis(f, 0, -zr, 0, -zr - 22, 'z', ['t', 'tr', 'tl']);
    if (o.O !== false) f.dot(0, 0, 2.2);
    for (const c of list) f.charge(c.x, -c.z, { q: c.q });
    if (o.extra) o.extra(f);
    for (const c of list) put(f, c.x, -c.z, c.lab, c.sides || ['tr', 'tl', 'r', 'l', 'br', 'bl'], 11);
    if (o.O !== false) put(f, 0, 0, 'O', ['bl', 'br', 'l', 'tl'], 6, 'small accent');
    return widen(f).svg();
  }
  const TWOQ = qfig([{ x: 0, z: 60, q: '+', lab: '+q' }, { x: 60, z: 0, q: '-', lab: '-q' }]);
  const ONEQ = qfig([{ x: 0, z: 60, q: '+', lab: '+q', sides: ['l', 'tl', 'bl'] }], { x: false, extra: (f) => dimL(f, 34, 0, 34, -60, 'a', ['r', 'tr', 'br']) });
  const THREEQ = qfig([{ x: 0, z: 60, q: '+', lab: '+2q' }, { x: 60, z: 0, q: '-', lab: '-q', sides: ['tr', 'br', 't'] }, { x: -60, z: 0, q: '-', lab: '-q', sides: ['tl', 'bl', 't'] }]);
  const LINQUAD = qfig([{ x: 0, z: 55, q: '+', lab: '+q', sides: ['l', 'tl', 'bl'] }, { x: 0, z: 0, q: '-', lab: '-2q', sides: ['l', 'tl', 'bl'] }, { x: 0, z: -55, q: '+', lab: '+q', sides: ['l', 'tl', 'bl'] }],
    { x: false, O: false, extra: (f) => { dimL(f, 34, 0, 34, -55, 'd', ['r']); dimL(f, 34, 0, 34, 55, 'd', ['r']); } });
  const DIPCOL = qfig([{ x: 0, z: 50, q: '+', lab: '+q', sides: ['l', 'tl', 'bl'] }, { x: 0, z: -50, q: '-', lab: '-q', sides: ['l', 'tl', 'bl'] }], { x: false, O: false });
  const QROW = PF.row([{ svg: DIPCOL, cap: '(A)' }, { svg: ball({ kind: 'full', R: 50, labs: [['\\rho_0', 40]] }), cap: '(B)' }, { svg: LINQUAD, cap: '(C)' }]);
  const OFFBALL = (() => {
    const f = PF.fig(), c = -72, r0 = 36;
    shadeP(f, f.arcPts(0, c, r0, r0, 0, 360)); f.circle(0, c, r0);
    f.line(0, 30, 0, c - r0 - 2, { cls: 'dim dash thin' });
    axis(f, 0, c - r0 - 2, 0, c - r0 - 30, 'z', ['t', 'tr', 'tl']);
    f.dot(0, 0, 2.4); f.dot(0, c, 2.4);
    put(f, 0, 0, 'O', ['l', 'bl', 'tl'], 6, 'small accent');
    put(f, 0, c, 'Q', ['r', 'tr', 'br'], 8);
    dimL(f, 62, 0, 62, c, 'd', ['r', 'tr', 'br']);
    return widen(f).svg();
  })();
  const PM_PTS = [[-0.55, 0.3], [0.5, 0.33], [-0.2, 0.68], [0.28, 0.66], [-0.75, 0.12], [0.76, 0.14]];
  const BALL_FLIP = ball({ kind: 'full', labs: [['-\\rho_0', 140], ['+\\rho_0', 220]], extra: (f) => {
    f.line(-60, 0, 60, 0, { cls: 'dim dash thin' });
    for (const [x, y] of PM_PTS) { minus(f, x * 62, -y * 62); plus(f, x * 62, y * 62); }
  } });
  const BALLCOS2 = ball({ kind: 'full', Rdim: 200, labs: [['\\rho=\\rho_0\\cos^2\\theta', 40]] });
  const BALL_IN = ball({ kind: 'pm', P: [35, 40], labs: [['+\\rho_0', 140], ['-\\rho_0', 220]] });

  // ================================================================ Lesson 4
  const L4 = {
    id: 'uW-multipole', title: 'Moments of lopsided charge: the Spring 2026 Problem 2 family',
    steps: [
      RF(md`
        ### The exam problem

        Problem 2 on last spring's Hour Exam 1:

        !!key The problem
          A solid ball of radius $R$ has charge density $\rho = +\rho_0$ in its northern hemisphere ($z>0$) and $\rho = -\rho_0$ in its southern hemisphere. Find the leading term of the electric field far away.

        [[fig:b]]

        **The multipole expansion** (Griffiths 3.4): far from a localized distribution,
        $$V(\vb r) = \frac{1}{4\pi\varepsilon_0}\left[\frac{Q}{r} + \frac{\vb p\cdot\hat{\mathbf r}}{r^2} + \dots\right],\qquad Q = \int\rho\,d\tau',\qquad \vb p = \int\vb r'\,\rho(\vb r')\,d\tau' .$$
        The leading term is the first one that doesn't vanish. So the job is: compute $Q$; if it is zero, compute $\vb p$.

        In spherical coordinates the source position is
        $$\vb r' = r'\left(\sin\theta'\cos\phi'\,\hat{\mathbf x} + \sin\theta'\sin\phi'\,\hat{\mathbf y} + \cos\theta'\,\hat{\mathbf z}\right),\qquad d\tau' = r'^2\sin\theta'\,dr'\,d\theta'\,d\phi' .$$

        !!method Symmetry before integrals
          1. Total charge: equal and opposite hemispheres ⇒ $Q = 0$. The monopole field is zero.
          2. Which components of $\vb p$: $\rho$ doesn't depend on $\phi'$, and $\int_0^{2\pi}\cos\phi'\,d\phi' = \int_0^{2\pi}\sin\phi'\,d\phi' = 0$ ⇒ $p_x = p_y = 0$. Only $p_z$.
          3. Sign of $p_z$: $\vb p$ points from the negative charge toward the positive charge ⇒ $+\hat{\mathbf z}$.
          Then do the one integral that's left.
      `, { b: { svg: BALL, cap: 'Spring 2026 Exam 1, Problem 2: a ball with $+\\rho_0$ in the north and $-\\rho_0$ in the south.' } }),

      Q(md`For the $\pm\rho_0$ ball, why is there no monopole field?`,
        [md`Because the ball is a conductor`, md`Because the two hemispheres have equal volumes and opposite densities, so $Q = 0$`, md`Because the monopole term always vanishes for a sphere`, md`Because the field inside a sphere is zero`],
        1,
        [md`It is a fixed charge distribution, not a conductor.`, null, md`A uniformly charged ball has a pure monopole field.`, md`The question is about the far field, and the field inside this ball isn't zero anyway.`],
        md`$Q = \rho_0\cdot\tfrac23\pi R^3 - \rho_0\cdot\tfrac23\pi R^3 = 0$. With no net charge the $1/r$ term is absent, and the dipole term leads.`,
        { figHtml: BALL }),

      Q(md`Which components of $\vb p$ are nonzero for the $\pm\rho_0$ ball?`,
        [md`$p_x$, $p_y$ and $p_z$`, md`$p_x$ and $p_y$ only`, md`None: $\vb p = 0$`, md`$p_z$ only`],
        3,
        [md`$p_x \propto \int_0^{2\pi}\cos\phi'\,d\phi' = 0$ because $\rho$ has no $\phi'$-dependence; same for $p_y$.`,
          md`Backwards: the asymmetry is along $z$.`,
          md`$Q = 0$ doesn't make $\vb p$ zero: a neutral object with separated charge has a dipole moment.`,
          null],
        md`Rotate the ball about $z$: nothing changes, so $\vb p$ can't have a sideways part. Only $p_z$ survives.`,
        { figHtml: BALL }),

      Q(md`Which way does $\vb p$ point?`,
        [md`$-\hat{\mathbf z}$`, md`Radially outward`, md`$+\hat{\mathbf z}$, from the negative hemisphere toward the positive one`, md`It depends on where you put the origin`],
        2,
        [md`$\vb p = \int\vb r'\rho\,d\tau'$: positive charge at positive $z'$ and negative charge at negative $z'$ both give positive $z'\rho$.`, md`A dipole moment is a single vector, not a field.`, null, md`$Q = 0$, so $\vb p$ is the same for every origin.`],
        md`Both halves contribute positively: $z'>0$ with $\rho>0$, and $z'<0$ with $\rho<0$. The dipole points from $-$ to $+$, like a pair $-q$ below $+q$.`,
        { figHtml: BALL }),

      Q(md`The ball is flipped: $-\rho_0$ in the northern hemisphere and $+\rho_0$ in the southern one. What is $\vb p$?`,
        [md`$-\dfrac{\pi R^4\rho_0}{2}\hat{\mathbf z}$`, md`$+\dfrac{\pi R^4\rho_0}{2}\hat{\mathbf z}$, since only the size matters`, md`$0$`, md`$-\dfrac{\pi R^4\rho_0}{4}\hat{\mathbf z}$`],
        0,
        [null,
          md`The sign of $\vb p$ is physical: it decides which way the far field points on the axis and which way the ball turns in an external field.`,
          md`Flipping the charges flips $\vb p$; it doesn't remove it.`,
          md`Both halves still contribute equally, so the magnitude is unchanged. $\pi R^4\rho_0/4$ is one hemisphere alone.`],
        md`Every $\rho$ changes sign, so $\vb p = \int\vb r'\rho\,d\tau'$ does too. The dipole still points from $-$ to $+$, now downward. Far away on the $+z$ axis the field then points **down**, toward the ball.`,
        { figHtml: BALL_FLIP }),

      Q(md`Charge $+q$ sits at $(0,0,d)$ and $-q$ at $(d,0,0)$. What is $\vb p$?`,
        [md`$qd(\hat{\mathbf x} - \hat{\mathbf z})$`, md`$qd\,\hat{\mathbf x}$`, md`$0$, because $Q = 0$`, md`$qd(-\hat{\mathbf x} + \hat{\mathbf z})$`],
        3,
        [md`Sign error: $\vb p$ points from the negative charge **to** the positive one.`,
          md`Each charge contributes $q_i\vb r_i$. You need both, and $+q$ contributes along $\hat{\mathbf z}$.`,
          md`$Q = 0$ makes $\vb p$ independent of the origin, not zero.`,
          null],
        md`$\vb p = \sum q_i\vb r_i = q(0,0,d) - q(d,0,0) = qd(-1,0,1)$. It points from $-q$ to $+q$ and has length $\sqrt2\,qd$: charge times separation. Since $Q = 0$, any other origin gives the same answer.`,
        { figHtml: TWOQ }),

      Q(md`Charge $+2q$ sits at $(0,0,a)$, and $-q$ at $(a,0,0)$ and at $(-a,0,0)$. What is $\vb p$?`,
        [md`$0$, because the charges balance`, md`$qa\,\hat{\mathbf z}$`, md`$2qa\,\hat{\mathbf z}$`, md`$2qa\,\hat{\mathbf z} - 2qa\,\hat{\mathbf x}$`],
        2,
        [md`Balanced charge means $Q = 0$, not $\vb p = 0$. The positive charge sits above the negative charge's center.`,
          md`The top charge is $2q$, so it contributes $2qa\hat{\mathbf z}$.`,
          null,
          md`The two $-q$ charges sit at $\pm a\hat{\mathbf x}$; their $x$-contributions cancel.`],
        md`$\vb p = 2q(a\hat{\mathbf z}) - q(a\hat{\mathbf x}) - q(-a\hat{\mathbf x}) = 2qa\hat{\mathbf z}$. Shortcut: the negative charge's center is at the origin and the positive charge's is at $a\hat{\mathbf z}$, so $\vb p = (2q)(a\hat{\mathbf z})$.`,
        { figHtml: THREEQ }),

      RF(md`
        ### The integral

        $$p_z = \int\rho\,r'\cos\theta'\,r'^2\sin\theta'\,dr'\,d\theta'\,d\phi' = 2\pi\int_0^R\!\!\int_0^\pi\rho\,r'^3\sin\theta'\cos\theta'\,d\theta'\,dr' .$$
        The $\phi'$ integral gave $2\pi$. Split $\theta'$ at the equator:
        $$p_z = 2\pi\rho_0\int_0^Rr'^3dr'\left[\int_0^{\pi/2}\sin\theta'\cos\theta'\,d\theta' - \int_{\pi/2}^{\pi}\sin\theta'\cos\theta'\,d\theta'\right] = 2\pi\rho_0\cdot\frac{R^4}{4}\left[\frac12 - \left(-\frac12\right)\right] = \frac{\pi R^4\rho_0}{2}.$$
        $$\vb p = \frac{\pi R^4\rho_0}{2}\,\hat{\mathbf z}.$$

        **Dipole potential and field** ($\vb p = p\hat{\mathbf z}$):
        $$V_{\text{dip}} = \frac{1}{4\pi\varepsilon_0}\frac{p\cos\theta}{r^2} = \frac{\rho_0R^4\cos\theta}{8\varepsilon_0r^2},\qquad \vb E_{\text{dip}} = \frac{1}{4\pi\varepsilon_0}\frac{p}{r^3}\left(2\cos\theta\,\hat{\mathbf r} + \sin\theta\,\hat{\boldsymbol\theta}\right) = \frac{\rho_0R^4}{8\varepsilon_0r^3}\left(2\cos\theta\,\hat{\mathbf r} + \sin\theta\,\hat{\boldsymbol\theta}\right).$$

        [[fig:dir]]

        **Direction check.** Above the ball ($\theta = 0$): $\vb E = \frac{2p}{4\pi\varepsilon_0r^3}\hat{\mathbf r}$, pointing up, away from the positive half. Beside it ($\theta = 90^\circ$): $\vb E = \frac{p}{4\pi\varepsilon_0r^3}\hat{\boldsymbol\theta}$, and $\hat{\boldsymbol\theta}$ points **down** at the equator: field lines leave the top and curl round to the bottom. **Units:** $\rho_0R^4$ is $(\text{C/m}^3)(\text{m}^4) = \text{C·m}$, the units of a dipole moment.

        !!trap The two classic slips
          - Forgetting that $\cos\theta'$ changes sign: integrating $\sin\theta'\cos\theta'$ over $0$ to $\pi$ with $+\rho_0$ everywhere gives zero. The sign flip of $\rho$ is what makes $p$ nonzero.
          - Dropping the $\vb r'$ in $\vb p$ (writing $r'^2$ instead of $r'^3$): the moment has one more power of length than the charge.
      `, { dir: { svg: DIPDIR, cap: 'Direction of the dipole field at the pole and at the equator.' } }),

      Q(md`What are the SI units of $\vb p$?`,
        [md`C`, md`C/m`, md`C·m`, md`C·m²`],
        2,
        [md`That is charge. $\vb p$ weights each charge by its position.`, md`Not a density.`, null, md`That would be a quadrupole moment ($\int r'^2\rho\,d\tau'$).`],
        md`$\vb p = \int\vb r'\rho\,d\tau'$: length × charge. Check any answer: $\rho_0R^4$ and $\sigma_0R^3$ are both C·m.`,
        { nofig: 'units only' }),

      Q(md`Which of these has the units of a dipole moment ($\rho_0$ in C/m³, $\sigma_0$ in C/m², $\lambda$ in C/m, $R$ in m)?`,
        [md`$\dfrac{\pi R^3\rho_0}{2}$`, md`$\dfrac{\pi R^4\rho_0}{2}$`, md`$2\pi R^2\sigma_0$`, md`$\lambda R$`],
        1,
        [md`$R^3\rho_0$ is a charge (C).`, null, md`$R^2\sigma_0$ is a charge.`, md`$\lambda R$ is a charge too: C/m times m.`],
        md`A dipole moment is charge times length, C·m, and $R^4\rho_0$ has units $\text{m}^4\cdot\text{C/m}^3$. Each kind of density needs one more power of $R$ than it takes to make a charge: $\rho_0R^4$, $\sigma_0R^3$, $\lambda R^2$. A quick units check catches the classic dropped $r'$ in $\int\vb r'\rho\,d\tau'$.`,
        { nofig: 'units only' }),

      Q(md`The $\pm\rho_0$ ball's radius is doubled, with the same $\rho_0$. By what factor does $p$ grow?`,
        [md`$2$`, md`$4$`, md`$8$`, md`$16$`],
        3,
        [md`$p$ is not proportional to $R$ alone: both the charge and the lever arm grow.`,
          md`$R^2$ is how a surface charge's total charge grows.`,
          md`$8$ is how the **charge** of each hemisphere grows ($R^3$). The lever arm adds one more factor of $2$.`,
          null],
        md`$p = \frac{\pi R^4\rho_0}{2}$: charge $\propto R^3$ times separation $\propto R$. Doubling $R$ gives $2^4 = 16$. A units check ($\rho_0R^4$ is C·m) gives the power immediately.`,
        { figHtml: BALL }),

      Q(md`At a point beside the ball, on the equatorial plane ($\theta = 90^\circ$), which way does $\vb E_{\text{dip}}$ point?`,
        [md`Up, $+\hat{\mathbf z}$`, md`Radially outward`, md`Radially inward`, md`Down, $-\hat{\mathbf z}$`],
        3,
        [md`At $\theta = 90^\circ$, $\hat{\boldsymbol\theta} = -\hat{\mathbf z}$, and $E_\theta>0$.`, md`$E_r\propto 2\cos\theta = 0$ there.`, md`$E_r = 0$ there.`, null],
        md`$\vb E = \frac{p}{4\pi\varepsilon_0r^3}\hat{\boldsymbol\theta}$ and $\hat{\boldsymbol\theta}$ points toward increasing $\theta$, i.e. down at the equator. Antiparallel to $\vb p$, half the on-axis strength.`,
        { figHtml: BALL_EQ }),

      Q(md`Far from a neutral object you measure $V \approx -\dfrac{C\cos\theta}{r^2}$ with $C>0$. Which way does $\vb p$ point?`,
        [md`$+\hat{\mathbf z}$`, md`Radially outward`, md`You can't tell without the charge distribution`, md`$-\hat{\mathbf z}$`],
        3,
        [md`$+\hat{\mathbf z}$ would give $V>0$ above the object ($\theta = 0$). Here $V<0$ there.`,
          md`$\vb p$ is one fixed vector, not a field.`,
          md`The dipole term alone fixes $\vb p$: compare with $\frac{p_z\cos\theta}{4\pi\varepsilon_0r^2}$.`,
          null],
        md`$\frac{p_z\cos\theta}{4\pi\varepsilon_0r^2} = -\frac{C\cos\theta}{r^2} \Rightarrow p_z = -4\pi\varepsilon_0C<0$. Negative $V$ above means the negative charge is on top, so $\vb p$ points down. Reading signs off the potential is quicker than redoing the integral.`,
        { nofig: 'reading a formula' }),

      Q(md`Can you use $V \approx \dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$ (plus higher terms) at a point **inside** the $\pm\rho_0$ ball?`,
        [md`Yes, the expansion is valid everywhere if you keep enough terms`, md`No: the expansion assumes every source point is closer to the origin than the field point ($r'<r$)`, md`Only on the $z$-axis`, md`Yes, and the dipole term alone is exact inside`],
        1,
        [md`The series in powers of $r'/r$ diverges when some of the charge lies farther out than the field point.`,
          null,
          md`The axis is not special; the condition is on $r$ versus $r'$.`,
          md`Inside the ball the potential is finite at the center, while $\cos\theta/r^2$ blows up there.`],
        md`The expansion comes from $\frac{1}{|\vb r - \vb r'|} = \sum_\ell\frac{r'^\ell}{r^{\ell+1}}P_\ell(\cos\gamma)$, valid for $r'<r$. Outside the ball that holds for all of the charge. Inside it fails for the charge at larger radius; you would need a direct integral instead.`,
        { figHtml: BALL_IN }),

      Q(md`Does the answer $\vb p = \frac{\pi R^4\rho_0}{2}\hat{\mathbf z}$ depend on where you put the origin?`,
        [md`Yes, always`, md`No, because $Q = 0$`, md`No, because the ball is symmetric`, md`Only if the origin is outside the ball`],
        1,
        [md`Shifting the origin by $\vb d$ changes $\vb p$ by $-Q\vb d$; with $Q = 0$ that is nothing.`, null, md`Symmetry isn't the reason: a non-symmetric neutral object also has an origin-independent $\vb p$.`, md`Location of the origin doesn't matter at all when $Q = 0$.`],
        md`$\vb p' = \int(\vb r' - \vb d)\rho\,d\tau' = \vb p - Q\vb d$. For neutral distributions the dipole moment is intrinsic. For charged ones it isn't (the hemisphere problem below).`,
        { figHtml: BALL }),

      P({
        title: 'The same ball, split the other way', big: true,
        q: md`Now the ball of radius $R$ has $\rho = +\rho_0$ for $x>0$ and $\rho = -\rho_0$ for $x<0$ (split by the $yz$-plane). Find (a) which components of $\vb p$ survive, (b) the nonzero component, (c) $V_{\text{dip}}(r,\theta,\phi)$ in spherical coordinates, (d) $E_x$ on the $+x$ axis at distance $x$.`,
        figHtml: ball({ kind: 'full', labs: [['+\\rho_0', 30], ['-\\rho_0', 150]], extra: (f) => {
          f.line(-62, 0, 62, 0, { cls: 'dim dash thin' });
          for (const [x, y] of [[0.3, 0.55], [0.62, 0.2], [0.35, -0.3], [0.65, -0.45], [0.25, 0.05], [0.4, -0.7]]) { plus(f, x * 62, -y * 62); minus(f, -x * 62, -y * 62); }
          axis(f, 64, 0, 100, 0, 'x', ['r', 'br']);
        } }),
        hints: [md`Rotate the exam answer: the asymmetry is now along $x$.`, md`$\vb p\cdot\hat{\mathbf r} = p\,\hat{\mathbf x}\cdot\hat{\mathbf r} = p\sin\theta\cos\phi$.`, md`On the $+x$ axis the field of a dipole along $x$ is $\frac{2p}{4\pi\varepsilon_0x^3}$ along $+x$.`],
        parts: [
          { lbl: md`(a) Surviving components`, mc: [md`$p_z$ only, as in the exam`, md`$p_x$ and $p_y$`, md`All three`, md`$p_x$ only`], a: 3,
            why: [md`The split is now across the $yz$-plane; $z\to-z$ leaves $\rho$ unchanged, so $p_z = 0$.`, md`$y\to-y$ leaves $\rho$ unchanged, so $p_y = 0$.`, md`Only the direction across the split survives.`, null] },
          { lbl: md`(b) $p_x$`, expr: 'pi*R^4*rho0/2', vars: { R: [0.5, 2], rho0: [1, 3] } },
          { lbl: md`(c) $V_{\text{dip}}(r,\theta,\phi)$`, expr: 'rho0*R^4*sin(theta)*cos(phi)/(8*eps0*r^2)', vars: { rho0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], r: [3, 6], theta: [0, 3], phi: [0, 6] } },
          { lbl: md`(d) $E_x$ on the $+x$ axis`, expr: 'rho0*R^4/(4*eps0*x^3)', vars: { rho0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], x: [3, 6] } },
        ],
        sol: md`
          (a) Reflections $y\to-y$ and $z\to-z$ leave $\rho$ unchanged, so $p_y = p_z = 0$; $x\to-x$ flips it, so $p_x \ne 0$.

          (b) The ball is the exam ball rotated by $90^\circ$, so $p_x = \dfrac{\pi R^4\rho_0}{2}$. (Direct: $p_x = \int x'\rho\,d\tau'$, and by the same shell argument $2\pi\rho_0\frac{R^4}{4}$.)

          (c) $V_{\text{dip}} = \dfrac{\vb p\cdot\hat{\mathbf r}}{4\pi\varepsilon_0r^2} = \dfrac{\rho_0R^4\sin\theta\cos\phi}{8\varepsilon_0r^2}$. With the dipole off the $z$-axis, $V$ depends on $\phi$: the azimuthal-symmetry formulas with $P_\ell(\cos\theta)$ no longer apply directly. Use $\vb p\cdot\hat{\mathbf r}$.

          (d) On the dipole's own axis: $E_x = \dfrac{2p}{4\pi\varepsilon_0x^3} = \dfrac{\rho_0R^4}{4\varepsilon_0x^3}$.

          **What to remember.** Identify the axis of asymmetry first; the integral is the same, only the direction changes.
        `,
      }),

      P({
        title: 'A shell with $\\pm\\sigma_0$ hemispheres',
        q: md`A thin spherical shell of radius $R$ carries $+\sigma_0$ on its northern hemisphere and $-\sigma_0$ on its southern one. Find (a) $Q$, (b) $p_z$, (c) the dipole potential far away. (d) Check: build the solid $\pm\rho_0$ ball out of such shells and recover $\pi R^4\rho_0/2$. Which integral does that?`,
        figHtml: SHELLPM,
        hints: [md`On the shell, $\vb r' = R\hat{\mathbf r}'$ and $da' = R^2\sin\theta'\,d\theta'\,d\phi'$.`, md`$p_z = \int\sigma R\cos\theta'\,R^2\sin\theta'\,d\theta'\,d\phi'$.`],
        parts: [
          { lbl: md`(a) $Q$`, mc: [md`$0$`, md`$4\pi R^2\sigma_0$`, md`$2\pi R^2\sigma_0$`, md`$-2\pi R^2\sigma_0$`], a: 0, why: [null, md`Half the area is negative.`, md`That is the charge of one hemisphere.`, md`That is the southern hemisphere only.`] },
          { lbl: md`(b) $p_z$`, expr: '2*pi*R^3*sigma0', vars: { R: [0.5, 2], sigma0: [1, 3] } },
          { lbl: md`(c) $V_{\text{dip}}(r,\theta)$`, expr: 'sigma0*R^3*cos(theta)/(2*eps0*r^2)', vars: { sigma0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], r: [3, 6], theta: [0, 3] } },
          { lbl: md`(d) The shell-by-shell check is`, mc: [md`$\int_0^R 2\pi r'^3\rho_0\,dr'$`, md`$\int_0^R 2\pi r'^2\rho_0\,dr'$`, md`$\int_0^R 4\pi r'^3\rho_0\,dr'$`, md`$\int_0^R 2\pi r'^4\rho_0\,dr'$`], a: 0,
            why: [null, md`One power of $r'$ short: $p$ of a shell of radius $r'$ goes as $r'^3$.`, md`$2\pi$, not $4\pi$: the shell's $p$ is $2\pi r'^3\sigma$.`, md`One power too many.`] },
        ],
        sol: md`
          (a) $Q = 0$.

          (b) $p_z = 2\pi R^3\sigma_0\left[\int_0^{\pi/2}\sin\theta'\cos\theta'\,d\theta' - \int_{\pi/2}^\pi\sin\theta'\cos\theta'\,d\theta'\right] = 2\pi R^3\sigma_0\left(\tfrac12 + \tfrac12\right) = 2\pi R^3\sigma_0$.

          (c) $V_{\text{dip}} = \dfrac{2\pi R^3\sigma_0\cos\theta}{4\pi\varepsilon_0r^2} = \dfrac{\sigma_0R^3\cos\theta}{2\varepsilon_0r^2}$.

          (d) A shell of radius $r'$ and thickness $dr'$ in the solid ball carries $\sigma = \pm\rho_0\,dr'$, so it contributes $dp = 2\pi r'^3\rho_0\,dr'$. Then $p = \int_0^R2\pi r'^3\rho_0\,dr' = \frac{\pi R^4\rho_0}{2}$. Same answer: a good way to check the exam integral.

          **Check against the Legendre method** (Griffiths Prob. 3.23): the $\ell = 1$ outside coefficient for a shell with $\sigma(\theta)$ is $B_1 = \frac{R^3}{2\varepsilon_0}\int_0^\pi\sigma\cos\theta\sin\theta\,d\theta = \frac{\sigma_0R^3}{2\varepsilon_0}$, matching (c).
        `,
      }),

      Q(md`The $\pm\sigma_0$ shell and the $\pm\rho_0$ ball have hemispheres carrying charges $\pm Q_h$. Write $p = Q_h\,d$. Which object has the larger effective separation $d$?`,
        [md`The ball: $d = 3R/4$`, md`The shell: $d = R$ (each hemispherical shell's charge is centered at $z = \pm R/2$), versus $d = 3R/4$ for the ball`, md`They are equal`, md`The ball: $d = R$`],
        1,
        [md`$3R/4$ is the ball's value, but it is the smaller one.`, null, md`The shell's charge sits farther from the center.`, md`The center of charge of a solid hemisphere is at $3R/8$, so $d = 3R/4$.`],
        md`Shell: $Q_h = 2\pi R^2\sigma_0$, $p = 2\pi R^3\sigma_0 = Q_h R$. Ball: $Q_h = \frac23\pi R^3\rho_0$, $p = \frac{\pi R^4\rho_0}{2} = \frac34Q_hR$. Pushing charge outward increases $p$.`,
        { figHtml: PF.row([{ svg: SHELLPM, cap: 'shell' }, { svg: BALL, cap: 'ball' }]).svg }),

      P({
        title: 'One hemisphere alone: when $Q \\ne 0$',
        q: md`Now only the northern half is charged: $\rho = \rho_0$ for $z>0$, nothing below. (a) Find $Q$. (b) Find $p_z$ about the center of the sphere. (c) Find the point on the $z$-axis about which $\vb p = 0$. (d) What is the leading far-field term?`,
        figHtml: HEMI,
        hints: [md`$Q = \rho_0\cdot\frac23\pi R^3$.`, md`$p_z = 2\pi\rho_0\frac{R^4}{4}\int_0^{\pi/2}\sin\theta'\cos\theta'\,d\theta'$.`, md`Shift the origin by $d\hat{\mathbf z}$: $p' = p - Qd$.`],
        parts: [
          { lbl: md`(a) $Q$`, expr: '2*pi*R^3*rho0/3', vars: { R: [0.5, 2], rho0: [1, 3] } },
          { lbl: md`(b) $p_z$ about the center`, expr: 'pi*R^4*rho0/4', vars: { R: [0.5, 2], rho0: [1, 3] } },
          { lbl: md`(c) $z$ about which $\vb p = 0$`, expr: '3*R/8', vars: { R: [0.5, 2] } },
          { lbl: md`(d) Leading far-field term`, mc: [md`Monopole, $\dfrac{Q}{4\pi\varepsilon_0r}$`, md`Dipole, because $p\ne0$`, md`Quadrupole`, md`None`], a: 0,
            why: [null, md`With $Q\ne0$ the $1/r$ term dominates; the dipole is a correction.`, md`The monopole is nonzero and comes first.`, md`$Q \ne 0$.`] },
        ],
        sol: md`
          (a) $Q = \frac23\pi R^3\rho_0$.

          (b) $p_z = 2\pi\rho_0\cdot\frac{R^4}{4}\cdot\frac12 = \frac{\pi R^4\rho_0}{4}$, half the exam answer (only the top half contributes now).

          (c) $p' = p - Qd = 0 \Rightarrow d = \dfrac{p}{Q} = \dfrac{\pi R^4\rho_0/4}{2\pi R^3\rho_0/3} = \dfrac{3R}{8}$: the centroid of a solid hemisphere. About the center of charge, the dipole moment of a charged object vanishes.

          (d) The monopole. The value of $\vb p$ for a charged object is a statement about where you put the origin, not about the object alone.
        `,
      }),

      Q(md`A charged object's dipole moment is computed about two different origins and gives two different answers. Which is true?`,
        [md`One of the calculations is wrong`, md`Both can be right: $\vb p$ depends on the origin when $Q\ne0$`, md`The object must be neutral`, md`The dipole moment is only defined about the center of mass`],
        1,
        [md`Not necessarily: $\vb p' = \vb p - Q\vb d$.`, null, md`The opposite: neutral objects give origin-independent $\vb p$.`, md`Any origin is allowed; the expansion is just organized differently.`],
        md`With $Q\ne0$, moving the origin trades dipole for monopole. Choosing the center of charge as origin makes $\vb p = 0$, which is the "best" expansion point.`,
        { figHtml: HEMI }),

      Q(md`A uniformly charged ball (total charge $Q$) is centered at $z = d$ on the $z$-axis. What is its dipole moment about the origin?`,
        [md`$0$: a uniform ball has no dipole moment`, md`$-Qd\,\hat{\mathbf z}$`, md`It depends on the radius of the ball`, md`$Qd\,\hat{\mathbf z}$`],
        3,
        [md`Only about its own center. With $Q\ne0$, $\vb p$ depends on the origin.`,
          md`Sign: $\vb p = \int\vb r'\rho\,d\tau'$, and the charge sits at positive $z'$ on average.`,
          md`$\int\vb r'\rho\,d\tau' = Q\,\vb r_{\text{center}}$ for any spherically symmetric ball; the radius drops out.`,
          null],
        md`Write $\vb r' = d\hat{\mathbf z} + \vb u$ with $\vb u$ measured from the ball's center: $\vb p = Qd\hat{\mathbf z} + \int\vb u\rho\,d\tau' = Qd\hat{\mathbf z} + 0$. This is $\vb p' = \vb p - Q\vb d$ run backwards. The far field is still led by $Q/(4\pi\varepsilon_0r)$; the "dipole" only says that the charge is off-center.`,
        { figHtml: OFFBALL }),

      Q(md`A single charge $+q$ sits at $z = a$. What is $\vb p$ about the origin $O$, and about the charge's own position?`,
        [md`$qa\,\hat{\mathbf z}$ about $O$; $0$ about the charge`, md`$0$ about both: one charge can't be a dipole`, md`$qa\,\hat{\mathbf z}$ about both`, md`$-qa\,\hat{\mathbf z}$ about $O$; $0$ about the charge`],
        0,
        [null,
          md`About $O$ the definition gives $q\vb r = qa\hat{\mathbf z}$. For a charged object the "dipole moment" measures how far its charge is from the chosen origin.`,
          md`About the charge itself $\vb r' = 0$, so $\vb p = 0$. With $Q\ne0$ the answer depends on the origin.`,
          md`$\vb p = q\vb r$, with $\vb r$ pointing from the origin to the charge: $+a\hat{\mathbf z}$.`],
        md`$\vb p = q\vb r'$ depends on where $\vb r'$ is measured from. The expansion about $O$ has a dipole term $\frac{qa\cos\theta}{4\pi\varepsilon_0r^2}$, which is just the first correction for the charge being off-center. Choosing the charge's position as the origin removes it.`,
        { figHtml: ONEQ }),

      P({
        title: 'A ball with $\\rho = \\rho_0\\cos\\theta$',
        q: md`A ball of radius $R$ has $\rho = \rho_0\cos\theta$. Find (a) $Q$, (b) $p_z$. (c) Is the potential outside exactly the dipole potential?`,
        figHtml: BALLCOS,
        hints: [md`$\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$.`, md`$p_z = 2\pi\rho_0\frac{R^4}{4}\int_0^\pi\cos^2\theta'\sin\theta'\,d\theta'$.`, md`$\cos\theta = P_1(\cos\theta)$: which Legendre moments can be nonzero?`],
        parts: [
          { lbl: md`(a) $Q$`, mc: [md`$0$`, md`$\frac43\pi R^3\rho_0$`, md`$\pi R^3\rho_0$`, md`$\frac23\pi R^3\rho_0$`], a: 0, why: [null, md`That would be uniform $\rho_0$.`, md`$\int\cos\theta\sin\theta\,d\theta = 0$.`, md`The south half cancels the north half.`] },
          { lbl: md`(b) $p_z$`, expr: 'pi*R^4*rho0/3', vars: { R: [0.5, 2], rho0: [1, 3] } },
          { lbl: md`(c) Exactly dipole outside?`, mc: [md`Yes: only the $\ell = 1$ moment is nonzero, because $\rho\propto P_1(\cos\theta)$`, md`No, there is a quadrupole correction`, md`No, there is a monopole`, md`Only on the axis`], a: 0,
            why: [null, md`$\int P_2(\cos\theta)\cos\theta\sin\theta\,d\theta = 0$ by orthogonality.`, md`$Q = 0$.`, md`The argument uses orthogonality for every direction.`] },
        ],
        sol: md`
          (a) $Q = 2\pi\rho_0\frac{R^3}{3}\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$.

          (b) $p_z = 2\pi\rho_0\frac{R^4}{4}\cdot\frac23 = \frac{\pi R^4\rho_0}{3}$. Smaller than the $\pm\rho_0$ ball's $\frac{\pi R^4\rho_0}{2}$: this density fades to zero at the equator, while the step density is $\pm\rho_0$ right up to it.

          (c) The $\ell$-th moment is $\int r'^\ell P_\ell(\cos\theta')\rho\,d\tau' \propto \int_0^\pi P_\ell(\cos\theta')P_1(\cos\theta')\sin\theta'\,d\theta' = 0$ for $\ell\ne1$. So outside, $V = \dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$ exactly, $p = \frac{\pi R^4\rho_0}{3}$.
        `,
      }),

      P({
        title: 'A ball with $\\rho = kr\\sin\\theta$',
        q: md`A ball of radius $R$ has $\rho = kr\sin\theta$. Find (a) $Q$ and (b) $\vb p$. (c) What is the first correction to the monopole field far away?`,
        figHtml: BALLRSIN,
        hints: [md`$\int_0^\pi\sin^2\theta\,d\theta = \pi/2$.`, md`Under $z\to-z$ ($\theta\to\pi-\theta$), $\sin\theta$ is unchanged: the distribution is symmetric about the equatorial plane.`],
        parts: [
          { lbl: md`(a) $Q$`, expr: 'pi^2*k*R^4/4', vars: { k: [1, 3], R: [0.5, 2] } },
          { lbl: md`(b) $\vb p$`, mc: [md`$0$`, md`$\frac{\pi^2kR^5}{8}\hat{\mathbf z}$`, md`$\frac{\pi kR^5}{4}\hat{\mathbf z}$`, md`$\frac{\pi^2 kR^5}{8}\hat{\mathbf x}$`], a: 0,
            why: [null, md`$\int_0^\pi\sin^2\theta\cos\theta\,d\theta = 0$.`, md`Same: the $z$ integral vanishes by symmetry.`, md`$\int_0^{2\pi}\cos\phi\,d\phi = 0$.`] },
          { lbl: md`(c) First correction`, mc: [md`Dipole, $\propto 1/r^2$`, md`Quadrupole, $\propto 1/r^3$`, md`Octupole, $\propto 1/r^4$`, md`None; the field is exactly monopole`], a: 1,
            why: [md`$\vb p = 0$.`, null, md`The quadrupole moment is nonzero, so it comes first.`, md`The distribution isn't spherically symmetric, so higher moments survive.`] },
        ],
        sol: md`
          (a) $Q = \int kr'\sin\theta'\,r'^2\sin\theta'\,dr'\,d\theta'\,d\phi' = 2\pi k\frac{R^4}{4}\cdot\frac\pi2 = \frac{\pi^2kR^4}{4}$.

          (b) $p_z \propto \int_0^\pi\sin^2\theta'\cos\theta'\,d\theta' = \left[\tfrac13\sin^3\theta'\right]_0^\pi = 0$; $p_x$, $p_y$ vanish by the $\phi'$ integral. $\vb p = 0$. Parity: the density is even under $z\to-z$, and $p_z$ needs an odd one.

          (c) The $\ell = 2$ moment: $\int r'^2P_2(\cos\theta')\rho\,d\tau' = -\frac{\pi^2kR^6}{48} \ne 0$. So $V = \frac{Q}{4\pi\varepsilon_0r} + \frac{1}{4\pi\varepsilon_0}\left(-\frac{\pi^2kR^6}{48}\right)\frac{P_2(\cos\theta)}{r^3} + \dots$ The charge is concentrated near the equator (an oblate blob), which the negative quadrupole reflects.
        `,
      }),

      RF(md`
        ### Parity: which moments vanish without computing

        The full expansion (azimuthal symmetry, origin at the center) is
        $$V(r,\theta) = \frac{1}{4\pi\varepsilon_0}\sum_{\ell = 0}^\infty\frac{q_\ell}{r^{\ell+1}}P_\ell(\cos\theta),\qquad q_\ell = \int r'^\ell P_\ell(\cos\theta')\,\rho\,d\tau' .$$
        $q_0 = Q$, $q_1 = p_z$, $q_2$ is the quadrupole, $q_3$ the octupole.

        **Reflection $z\to -z$** ($\theta'\to\pi-\theta'$, $\cos\theta'\to-\cos\theta'$) sends $P_\ell \to (-1)^\ell P_\ell$. So:
        - If $\rho$ is **odd** under $z\to-z$ (the $\pm\rho_0$ ball, the $\pm\sigma_0$ shell, $\rho_0\cos\theta$), every **even** $\ell$ vanishes: $Q = 0$, quadrupole $= 0$, ... Only $p$, octupole, ... survive.
        - If $\rho$ is **even** ($kr\sin\theta$, a uniform ball, the equatorial ring), every **odd** $\ell$ vanishes: $\vb p = 0$, octupole $= 0$.

        For the exam ball: the quadrupole vanishes, so the first correction to the dipole field is the **octupole**:
        $$q_3 = 2\pi\rho_0\frac{R^6}{6}\left[\int_0^1P_3(x)\,dx - \int_{-1}^0P_3(x)\,dx\right] = 2\pi\rho_0\frac{R^6}{6}\cdot2\left(-\frac18\right) = -\frac{\pi\rho_0R^6}{12}.$$
        Relative to the dipole term it is down by $(R/r)^2$, not $R/r$: the dipole approximation is unusually good for this ball.
      `),

      Q(md`For the $\pm\rho_0$ ball (origin at the center), which multipole moments are zero by symmetry alone?`,
        [md`All odd $\ell$ (dipole, octupole, ...)`, md`Only the monopole`, md`All even $\ell$ (monopole, quadrupole, ...)`, md`All of them except the dipole`],
        2,
        [md`Backwards: odd $\rho$ kills even moments.`, md`The quadrupole vanishes too, by the same reflection argument.`, null, md`The octupole $q_3 = -\pi\rho_0R^6/12$ is not zero.`],
        md`$\rho$ is odd under $z\to-z$ and $P_\ell$ has parity $(-1)^\ell$, so $q_\ell = 0$ for even $\ell$. The odd moments generally survive.`,
        { figHtml: BALL }),

      Q(md`A uniformly charged ring lies in the $xy$-plane, centered on the origin. Which moments vanish?`,
        [md`All of them`, md`All odd $\ell$; the even ones (including $Q$ and the quadrupole) survive`, md`All even $\ell$`, md`Only the dipole`],
        1,
        [md`$Q \ne 0$.`, null, md`The ring is even under $z\to-z$, so it is the odd ones that vanish.`, md`The octupole vanishes too.`],
        md`The ring is symmetric under $z\to-z$, so every odd $q_\ell$ vanishes. $\vb p = 0$, and the first correction to $Q/r$ is a quadrupole.`,
        { figHtml: RING }),

      Q(md`A uniformly charged ring ($Q>0$, radius $R$) lies in the $xy$-plane. What is the sign of its quadrupole moment $q_2 = \int r'^2P_2(\cos\theta')\,dq$?`,
        [md`Negative: $q_2 = -\tfrac12QR^2$`, md`Positive, because the charge is spread out`, md`Zero, by symmetry`, md`It depends on $R$`],
        0,
        [null,
          md`Spread out **in the equatorial plane** means $\theta' = 90^\circ$, where $P_2(0) = -\tfrac12$. Positive $q_2$ is charge stretched along the $z$-axis.`,
          md`The ring is even under $z\to-z$: that kills the odd moments, not $q_2$.`,
          md`$R$ sets the size, $-\tfrac12QR^2$, not the sign.`],
        md`All the charge is at $r' = R$, $\theta' = 90^\circ$: $q_2 = QR^2P_2(0) = -\tfrac12QR^2$. Squashed (oblate) charge gives $q_2<0$; stretched (prolate) charge gives $q_2>0$. The $kr\sin\theta$ ball, concentrated near the equator, also has $q_2<0$.`,
        { figHtml: RING }),

      Q(md`A ball has $\rho = \rho_0\cos^2\theta$. Which statement about its moments (origin at the center) is right?`,
        [md`$\vb p = 0$, but $Q$ and the quadrupole are nonzero`,
          md`$Q = 0$, because $\cos^2\theta$ averages out like $\cos\theta$`,
          md`Only $Q$ is nonzero, so the field outside is exactly monopole`,
          md`$\vb p \ne 0$, because the density is largest at the poles`],
        0,
        [null,
          md`$\cos^2\theta\ge0$ everywhere, so the total charge is positive: $Q = \tfrac{4}{9}\pi R^3\rho_0$.`,
          md`$\cos^2\theta = \tfrac13 + \tfrac23P_2(\cos\theta)$ contains $P_2$, so the quadrupole is nonzero.`,
          md`Charge piles up at **both** poles equally. The density is even under $z\to-z$, so $p_z = 0$.`],
        md`Parity: $\rho$ is even under $z\to-z$, so every odd moment vanishes ($\vb p = 0$). In Legendre polynomials, $\cos^2\theta = \tfrac13P_0 + \tfrac23P_2$, so exactly $Q$ and $q_2$ survive (here $q_2 = \tfrac{8}{75}\pi R^5\rho_0>0$: a prolate blob). Outside, the potential is exactly monopole plus quadrupole.`,
        { figHtml: BALLCOS2 }),

      Q(md`A charge distribution is odd under inversion through the origin: $\rho(-\vb r) = -\rho(\vb r)$. Which moments vanish about the origin?`,
        [md`All odd $\ell$: dipole, octupole, ...`, md`None in general`, md`Only $Q$`, md`All even $\ell$: $Q$, the quadrupole, ...`],
        3,
        [md`Backwards. An odd density pairs $+$ at $\vb r$ with $-$ at $-\vb r$, and that pair **adds** to $\vb p$.`,
          md`Symmetry does kill half of them: the moments of even order pair up and cancel.`,
          md`The quadrupole cancels too: it weights $\vb r$ and $-\vb r$ with the same even polynomial.`,
          null],
        md`The moment of order $\ell$ weights $\rho$ with polynomials of degree $\ell$ in $x', y', z'$, which have parity $(-1)^\ell$. An odd $\rho$ times an even polynomial integrates to zero. So $Q$, the quadrupole, ... vanish, while $\vb p$, the octupole, ... can survive. The $\pm\rho_0$ ball and the pair of opposite octants are both like this.`,
        { nofig: 'a symmetry rule' }),

      Q(md`Which of these has $Q = 0$ and $\vb p = 0$ but a **nonzero** quadrupole moment?`,
        [md`(A) $+q$ at $z = d$, $-q$ at $z = -d$`, md`(B) a uniformly charged ball`, md`(C) $+q$ at $z = \pm d$, $-2q$ at the origin`, md`A single point charge at the origin`],
        2,
        [md`(A) is a pure dipole: $p_z = 2qd \ne 0$, and $q_2 = qd^2 - qd^2 = 0$.`,
          md`(B) is spherically symmetric: only $Q$ survives, and every higher moment is zero.`,
          null,
          md`A point charge at the origin has $Q\ne0$ and every higher moment zero.`],
        md`For (C): $Q = q - 2q + q = 0$, $p_z = qd - qd = 0$, and $q_2 = \sum q_iz_i^2 = 2qd^2$. A quadrupole with the lower moments zero needs charge that is stretched (or squashed) along an axis without being lopsided.`,
        { figHtml: QROW.svg }),

      Q(md`Charges $+q$, $-2q$, $+q$ sit on the $z$-axis at $z = d$, $0$, $-d$. Far away, how does the leading term of $V$ fall off?`,
        [md`$1/r$`, md`$1/r^2$`, md`$1/r^3$`, md`$1/r^4$`],
        2,
        [md`$Q = q - 2q + q = 0$: no monopole.`,
          md`$p_z = qd + 0 - qd = 0$: no dipole.`,
          null,
          md`The quadrupole $q_2 = \sum q_iz_i^2 = 2qd^2$ is nonzero, so the leading term comes before $1/r^4$.`],
        md`Check the moments in order: $Q = 0$, $\vb p = 0$, $q_2 = qd^2 + qd^2 = 2qd^2 \ne 0$. The leading term is the quadrupole, $V\approx\frac{1}{4\pi\varepsilon_0}\frac{2qd^2}{r^3}P_2(\cos\theta)$: two back-to-back dipoles whose dipole moments cancel.`,
        { figHtml: LINQUAD }),

      Q(md`Far from that quadrupole, you double your distance. By what factor does $|\vb E|$ drop?`,
        [md`$4$`, md`$8$`, md`$2$`, md`$16$`],
        3,
        [md`$4$ is a point charge's field ($1/r^2$).`, md`$8$ is a dipole's field ($1/r^3$), or the quadrupole's **potential**.`, md`No multipole field falls as $1/r$ in 3-D.`, null],
        md`Quadrupole $V\propto1/r^3$, so $E\propto1/r^4$, and doubling $r$ divides $E$ by $2^4 = 16$. The pattern: the $\ell$-th multipole has $V\propto r^{-(\ell+1)}$ and $E\propto r^{-(\ell+2)}$.`,
        { figHtml: LINQUAD }),

      Q(md`For the exam ball, how big is the error of the dipole approximation at distance $r$, relative to the dipole term?`,
        [md`Of order $R/r$`, md`Of order $(R/r)^3$`, md`Zero`, md`Of order $(R/r)^2$`],
        3,
        [md`That would need a quadrupole, which vanishes by parity.`, md`The next surviving term (octupole) is only two powers down.`, md`The octupole is nonzero.`, null],
        md`Dipole $\propto q_1/r^2$, octupole $\propto q_3/r^4$: ratio $\sim(R/r)^2$. Numerically $\frac{q_3}{q_1} = -\frac{R^2}{6}$, so on the axis the correction is $-\frac16(R/z)^2$ of the dipole term.`,
        { figHtml: BALL_P }),

      P({
        title: 'The exact potential on the axis, by disks (Kou-level)', big: true,
        q: md`For the $\pm\rho_0$ ball, find $V$ exactly on the $z$-axis for $z>R$ by slicing the ball into disks, then compare with the multipole expansion.

          (a) Give $V(z)$. (b) Evaluate $V_{\text{exact}}/V_{\text{dip}}$ at $z = 2R$. (c) Expand $V(z)$ in powers of $R/z$; give the $1/z^4$ term. (d) Which multipole is that term?`,
        figHtml: BALL_AX,
        hints: [md`A disk of radius $a$ with surface charge $\sigma$, at height $z'$ below the point, gives $\frac{\sigma}{2\varepsilon_0}\left(\sqrt{(z-z')^2 + a^2} - (z - z')\right)$ on its axis.`,
          md`A slice of thickness $dz'$ has $\sigma = \pm\rho_0\,dz'$ and $a^2 = R^2 - z'^2$, so $(z-z')^2 + a^2 = z^2 + R^2 - 2zz'$.`,
          md`$\int\sqrt{z^2 + R^2 - 2zz'}\,dz' = -\frac{(z^2+R^2-2zz')^{3/2}}{3z}$.`],
        parts: [
          { lbl: md`(a) $V(z)$ for $z>R$`, expr: 'rho0*(2*(z^2+R^2)^(3/2) - 2*z^3 - 3*R^2*z)/(6*eps0*z)', vars: { rho0: [1, 3], eps0: [0.5, 2], R: [0.5, 1], z: [1.2, 4] } },
          { lbl: md`(b) $V_{\text{exact}}/V_{\text{dip}}$ at $z = 2R$`, ans: 0.96181, unit: '' },
          { lbl: md`(c) The $1/z^4$ term`, expr: '-rho0*R^6/(48*eps0*z^4)', vars: { rho0: [1, 3], eps0: [0.5, 2], R: [0.5, 1], z: [1.2, 4] } },
          { lbl: md`(d) That term is the`, mc: [md`quadrupole`, md`octupole`, md`monopole`, md`dipole`], a: 1,
            why: [md`A quadrupole on the axis goes as $1/z^3$, and it vanishes here by parity.`, null, md`$Q = 0$.`, md`The dipole is the $1/z^2$ term.`] },
        ],
        sol: md`
          [[fig:disks]]

          **(a)** North half ($0<z'<R$, $+\rho_0$) and south half ($-R<z'<0$, $-\rho_0$):
          $$V = \frac{\rho_0}{2\varepsilon_0}\left[\int_0^R\left(\sqrt{z^2+R^2-2zz'} - (z-z')\right)dz' - \int_{-R}^0\left(\sqrt{z^2+R^2-2zz'} - (z-z')\right)dz'\right].$$
          The square-root integrals: $\int_0^R = \frac{(z^2+R^2)^{3/2} - (z-R)^3}{3z}$, $\int_{-R}^0 = \frac{(z+R)^3 - (z^2+R^2)^{3/2}}{3z}$ (using $\sqrt{(z\mp R)^2} = z\mp R$ for $z>R$). The linear ones: $\int_0^R(z-z')dz' = zR - \frac{R^2}{2}$, $\int_{-R}^0(z-z')dz' = zR + \frac{R^2}2$. With $(z-R)^3 + (z+R)^3 = 2z^3 + 6zR^2$:
          $$V(z) = \frac{\rho_0}{6\varepsilon_0z}\left[2(z^2+R^2)^{3/2} - 2z^3 - 3R^2z\right].$$

          **(b)** $z = 2R$: $V = \frac{\rho_0R^2}{12\varepsilon_0}\left[2\cdot5^{3/2} - 16 - 6\right] = 0.03006\,\frac{\rho_0R^2}{\varepsilon_0}$. Dipole: $\frac{\rho_0R^4}{8\varepsilon_0z^2} = 0.03125\,\frac{\rho_0R^2}{\varepsilon_0}$. Ratio $0.962$.

          **(c)** $(z^2+R^2)^{3/2} = z^3\left(1 + \frac32u^2 + \frac38u^4 - \frac1{16}u^6 + \dots\right)$, $u = R/z$. Then
          $$V = \frac{\rho_0R^4}{8\varepsilon_0z^2} - \frac{\rho_0R^6}{48\varepsilon_0z^4} + \dots$$
          The first term is exactly $\frac{p}{4\pi\varepsilon_0z^2}$ with $p = \frac{\pi R^4\rho_0}{2}$. The $z^{-3}$ term is absent (no quadrupole).

          **(d)** Octupole: $\frac{q_3}{4\pi\varepsilon_0z^4}P_3(1)$ with $q_3 = -\frac{\pi\rho_0R^6}{12}$ gives $-\frac{\rho_0R^6}{48\varepsilon_0z^4}$. Matches.

          [[fig:ratio]]
        `,
        figs: { disks: { svg: DISKS, cap: 'Slice the ball into disks of radius $\\sqrt{R^2 - z\'^2}$; each contributes its on-axis disk potential at $P$.' }, ratio: { svg: AXPLOT, cap: 'Exact axis potential divided by the dipole term. It approaches $1$ like $1 - \\frac16(R/z)^2$.' } },
      }),

      P({
        title: 'Charge in one octant',
        q: md`Uniform charge density $\rho_0$ fills the part of a ball of radius $R$ with $x, y, z > 0$ (one eighth). About the center of the ball, find (a) $Q$, (b) $p_x$ (and by symmetry $p_y$, $p_z$), (c) $|\vb p|$, (d) the point about which $\vb p = 0$ (give its $x$-coordinate).`,
        figHtml: OCT,
        hints: [md`$Q = \frac18\cdot\frac43\pi R^3\rho_0$.`, md`$p_x = \rho_0\int r'\sin\theta'\cos\phi'\,r'^2\sin\theta'\,dr'\,d\theta'\,d\phi'$ with $\theta', \phi'\in(0,\pi/2)$.`, md`$\int_0^{\pi/2}\sin^2\theta'\,d\theta' = \pi/4$, $\int_0^{\pi/2}\cos\phi'\,d\phi' = 1$.`],
        parts: [
          { lbl: md`(a) $Q$`, expr: 'pi*R^3*rho0/6', vars: { R: [0.5, 2], rho0: [1, 3] } },
          { lbl: md`(b) $p_x$`, expr: 'pi*R^4*rho0/16', vars: { R: [0.5, 2], rho0: [1, 3] } },
          { lbl: md`(c) $|\vb p|$`, expr: 'sqrt(3)*pi*R^4*rho0/16', vars: { R: [0.5, 2], rho0: [1, 3] } },
          { lbl: md`(d) $x$ of the center of charge`, expr: '3*R/8', vars: { R: [0.5, 2] } },
        ],
        sol: md`
          (a) $Q = \frac{\pi R^3\rho_0}{6}$.

          (b) $p_x = \rho_0\frac{R^4}{4}\cdot\frac\pi4\cdot1 = \frac{\pi R^4\rho_0}{16}$. The octant is symmetric under swapping $x, y, z$, so $p_y = p_z = \frac{\pi R^4\rho_0}{16}$. (Check $p_z$: $\rho_0\frac{R^4}{4}\cdot\frac12\cdot\frac\pi2$, the same.)

          (c) $|\vb p| = \sqrt3\,\frac{\pi R^4\rho_0}{16}$, along $(\hat{\mathbf x} + \hat{\mathbf y} + \hat{\mathbf z})/\sqrt3$.

          (d) $\vb p/Q = \frac{3R}{8}(1,1,1)$: the centroid of the octant. With $Q\ne0$ this $\vb p$ is origin-dependent; the far field is led by $Q/(4\pi\varepsilon_0r)$.
        `,
      }),

      Q(md`Put $+\rho_0$ in the octant $x,y,z>0$ and $-\rho_0$ in the opposite octant $x,y,z<0$ (both inside radius $R$). What is $\vb p$?`,
        [md`$0$, because $Q = 0$`, md`$\dfrac{\pi R^4\rho_0}{16}(\hat{\mathbf x} + \hat{\mathbf y} + \hat{\mathbf z})$`, md`$\dfrac{\pi R^4\rho_0}{8}(\hat{\mathbf x} + \hat{\mathbf y} + \hat{\mathbf z})$`, md`$\dfrac{\pi R^4\rho_0}{8}\hat{\mathbf z}$`],
        2,
        [md`$Q = 0$ makes $\vb p$ origin-independent, not zero.`, md`That is one octant's contribution; the negative octant at negative positions adds the same again.`, null, md`All three components are equal by symmetry.`],
        md`The negative octant is the positive one inverted through the origin with the sign flipped, so it contributes $(-\rho_0)(-\vb r')$: the same as the positive one. Total $2\cdot\frac{\pi R^4\rho_0}{16}$ per component. The distribution is odd under inversion $\vb r\to-\vb r$, so every even moment (monopole, quadrupole) vanishes.`,
        { figHtml: OCT }),

      P({
        title: 'Field on the axis and the equator; energy in an external field',
        q: md`For the exam ball (dipole $p = \frac{\pi R^4\rho_0}{2}\hat{\mathbf z}$), in the dipole approximation: (a) $E_z$ on the $+z$ axis at distance $z$; (b) $E_z$ on the equatorial plane at distance $r$. The ball is then placed in a uniform external field $\vb E_0 = E_0\hat{\mathbf z}$ (produced by distant charges). (c) Its energy $U$; (d) the stable orientation.`,
        figHtml: BALL_EXT,
        hints: [md`On the axis $\theta = 0$: $\vb E = \frac{2p}{4\pi\varepsilon_0z^3}\hat{\mathbf z}$. On the equator: $\vb E = -\frac{p}{4\pi\varepsilon_0r^3}\hat{\mathbf z}$.`, md`$U = -\vb p\cdot\vb E_0$, torque $\vb p\times\vb E_0$.`],
        parts: [
          { lbl: md`(a) $E_z$ on the axis`, expr: 'rho0*R^4/(4*eps0*z^3)', vars: { rho0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], z: [3, 6] } },
          { lbl: md`(b) $E_z$ on the equator`, expr: '-rho0*R^4/(8*eps0*r^3)', vars: { rho0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], r: [3, 6] } },
          { lbl: md`(c) $U$`, expr: '-pi*R^4*rho0*E0/2', vars: { rho0: [1, 3], R: [0.5, 1], E0: [1, 3] } },
          { lbl: md`(d) Stable orientation`, mc: [md`$\vb p$ along $\vb E_0$ (north hemisphere downstream)`, md`$\vb p$ opposite to $\vb E_0$`, md`$\vb p$ perpendicular to $\vb E_0$`, md`Every orientation is equally stable`], a: 0,
            why: [null, md`That is the maximum of $U = -pE_0\cos\vartheta$: unstable.`, md`There the torque $pE_0$ is largest; it is not an equilibrium.`, md`$U$ depends on the angle.`] },
        ],
        sol: md`
          (a) $E_z = \dfrac{2p}{4\pi\varepsilon_0z^3} = \dfrac{2}{4\pi\varepsilon_0z^3}\dfrac{\pi R^4\rho_0}{2} = \dfrac{\rho_0R^4}{4\varepsilon_0z^3}$.

          (b) $E_z = -\dfrac{p}{4\pi\varepsilon_0r^3} = -\dfrac{\rho_0R^4}{8\varepsilon_0r^3}$: half the axis value, pointing down.

          (c) $U = -\vb p\cdot\vb E_0 = -\dfrac{\pi R^4\rho_0E_0}{2}$. (Exact for a uniform external field: $U = \int\rho V_{\text{ext}}d\tau'$ with $V_{\text{ext}} = -E_0z'$ gives $-E_0\int z'\rho\,d\tau' = -p_zE_0$, no approximation.)

          (d) The torque $\vb p\times\vb E_0$ turns $\vb p$ toward $\vb E_0$; $U$ is minimum there: the positive half points downstream. The net force is zero (neutral object, uniform field).
        `,
      }),

      Q(md`The $\pm\rho_0$ ball sits in a uniform field $\vb E_0 = E_0\hat{\mathbf x}$ (perpendicular to $\vb p$). Which is true?`,
        [md`Net force $pE_0$ along $x$`, md`No force and no torque`, md`Net force zero, torque $pE_0$ about the $y$-axis turning $\vb p$ toward $+\hat{\mathbf x}$`, md`Net force and torque both zero because $Q = 0$`],
        2,
        [md`A uniform field exerts no net force on a neutral object.`, md`$\vb p\times\vb E_0 \ne 0$ when they are perpendicular.`, null, md`$Q = 0$ kills the force, not the torque.`],
        md`$\vb F = Q\vb E_0 = 0$; $\vb N = \vb p\times\vb E_0 = pE_0\,\hat{\mathbf z}\times\hat{\mathbf x} = pE_0\hat{\mathbf y}$. It rotates $\vb p$ from $+z$ toward $+x$.`,
        { figHtml: BALL_EXTX }),

      Q(md`The $\pm\rho_0$ ball sits in a uniform field $\vb E_0$. In which orientation is the torque on it largest?`,
        [md`$\vb p$ parallel to $\vb E_0$`, md`$\vb p$ antiparallel to $\vb E_0$`, md`$\vb p$ perpendicular to $\vb E_0$`, md`The torque is zero in every orientation, because $Q = 0$`],
        2,
        [md`Parallel is the stable equilibrium: $\vb p\times\vb E_0 = 0$.`,
          md`Antiparallel is also an equilibrium (an unstable one); the torque is zero there.`,
          null,
          md`$Q = 0$ makes the **force** vanish in a uniform field. The torque is $\vb p\times\vb E_0$, which needs only $\vb p$.`],
        md`$|\vb N| = pE_0\sin\vartheta$, largest at $\vartheta = 90^\circ$. The energy $U = -pE_0\cos\vartheta$ is steepest there and flat at $0$ and $180^\circ$, the two equilibria.`,
        { figHtml: BALL_EXT }),

      Q(md`The ball's dipole is tilted $30^\circ$ away from a uniform field $\vb E_0$. What is the magnitude of the torque?`,
        [md`$\tfrac12pE_0$`, md`$\tfrac{\sqrt3}{2}pE_0$`, md`$pE_0$`, md`$0$, because the net force is zero`],
        0,
        [null,
          md`That uses $\cos30^\circ$. The torque is $|\vb p\times\vb E_0| = pE_0\sin\vartheta$; the cosine belongs to the energy.`,
          md`$pE_0$ is the maximum, at $90^\circ$.`,
          md`Zero force doesn't mean zero torque: the two hemispheres are pushed opposite ways along different lines.`],
        md`$N = pE_0\sin30^\circ = \tfrac12pE_0$, turning $\vb p$ toward $\vb E_0$. Remember the pair: torque $\propto\sin\vartheta$, energy $U = -pE_0\cos\vartheta$.`,
        { figHtml: BALL_EXT }),

      Q(md`How much work must you do to turn the ball slowly from $\vb p$ parallel to $\vb E_0$ to $\vb p$ antiparallel?`,
        [md`$pE_0$`, md`$2pE_0$`, md`$0$, because both end states are equilibria`, md`$-2pE_0$`],
        1,
        [md`That only takes you to $90^\circ$: $U$ goes from $-pE_0$ to $0$.`,
          null,
          md`Being equilibria doesn't make their energies equal: $U = -pE_0$ and $+pE_0$.`,
          md`Sign: you push against the torque, so you do positive work.`],
        md`$W = U_{\text{final}} - U_{\text{initial}} = (+pE_0) - (-pE_0) = 2pE_0$. For the exam ball, $2pE_0 = \pi R^4\rho_0E_0$.`,
        { figHtml: BALL_EXT }),

      Q(md`On the exam you computed $p_z$ for the $\pm\rho_0$ ball and got $0$. Which slip most likely caused it?`,
        [md`Using $r'^3$ instead of $r'^2$`, md`Using $+\rho_0$ for both hemispheres, so $\int_0^\pi\sin\theta'\cos\theta'\,d\theta' = 0$`, md`Using $2\pi$ for the $\phi'$ integral`, md`Putting the origin at the center`],
        1,
        [md`$r'^3$ is correct ($r'$ from $\vb r'$, $r'^2$ from $d\tau'$).`, null, md`$2\pi$ is correct; $\rho$ doesn't depend on $\phi'$.`, md`The origin choice doesn't matter for a neutral object.`],
        md`$\sin\theta'\cos\theta'$ is antisymmetric about the equator. Only the sign change of $\rho$ makes the two halves add. A zero here should make you suspicious: a $+$ top and $-$ bottom obviously form a dipole.`,
        { figHtml: BALL }),

      RF(md`
        !!key Patterns to remember (dipole moments)
          - Leading far-field term: the first nonzero of $Q$, $\vb p$, quadrupole, ... Compute $Q$ first.
          - $\vb p = \int\vb r'\rho\,d\tau'$ with $\vb r' = r'(\sin\theta'\cos\phi', \sin\theta'\sin\phi', \cos\theta')$. Units C·m.
          - No $\phi'$-dependence ⇒ only $p_z$. Odd under $z\to-z$ ⇒ even moments vanish; even ⇒ odd moments vanish.
          - $\pm\rho_0$ ball: $\vb p = \frac{\pi R^4\rho_0}{2}\hat{\mathbf z}$; $\pm\sigma_0$ shell: $2\pi R^3\sigma_0\hat{\mathbf z}$; $\rho_0\cos\theta$ ball: $\frac{\pi R^4\rho_0}{3}\hat{\mathbf z}$ (exactly dipole outside).
          - $\vb E_{\text{dip}} = \frac{p}{4\pi\varepsilon_0r^3}(2\cos\theta\,\hat{\mathbf r} + \sin\theta\,\hat{\boldsymbol\theta})$: up on the axis, down (half as strong) on the equator.
          - $Q\ne0$ ⇒ $\vb p$ depends on the origin: $\vb p' = \vb p - Q\vb d$; it vanishes about the center of charge.
          - In a uniform field: $\vb F = 0$, $\vb N = \vb p\times\vb E$, $U = -\vb p\cdot\vb E$.
      `),
    ],
  };
  const LESSONS = [L1,L2,L3,L4];
  C.unit({ id: 'uW', num: 'Unit W', title: 'Polar coordinates and harder separation',
    blurb: 'Separation of variables in plane polar coordinates (wedges, sectors, pipes) and the dipole moments of lopsided charge, built around last spring\'s Hour Exam 1.',
    lessons: LESSONS });
})();

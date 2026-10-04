/* Unit D — Separation-of-variables ladder (Cartesian and 2-D polar), easy to brutal.
   Pushes two lessons into the unit registered by uD-0.js. Verification scripts: scratchpad/p435/verify/uD_sep_*.py */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
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
  function tryPut(f, x, y, t, sides, gap = 7, cls = '') {
    for (const g of [gap, gap + 5, gap + 10, gap + 16, gap + 24]) for (const at of sides) {
      const m = TAGOFF[at];
      const B = boxOf(x + m[0] * g, y + m[1] * g, t, m[2]);
      if (isFree(f, B)) { f.label(x + m[0] * g, y + m[1] * g, t, m[2], cls); return true; }
    }
    return false;
  }
  function put(f, x, y, t, sides = ['tr', 'r', 'tl', 'l', 't', 'b', 'br', 'bl'], gap = 7, cls = '') {
    for (const g of [gap, gap + 5, gap + 10, gap + 16, gap + 24, gap + 34]) for (const at of sides) {
      const m = TAGOFF[at];
      const B = boxOf(x + m[0] * g, y + m[1] * g, t, m[2]);
      if (isFree(f, B)) return f.label(x + m[0] * g, y + m[1] * g, t, m[2], cls);
    }
    for (const g of [gap, gap + 10, gap + 24]) for (const at of ['tr', 'r', 'tl', 'l', 't', 'b', 'br', 'bl']) {
      const m = TAGOFF[at];
      const B = boxOf(x + m[0] * g, y + m[1] * g, t, m[2]);
      if (isFree(f, B)) return f.label(x + m[0] * g, y + m[1] * g, t, m[2], cls);
    }
    return f.tag(x, y, t, sides[0], gap, cls);
  }
  const SIDES = ['r', 'tr', 't', 'tl', 'l', 'bl', 'b', 'br'];
  const sidesToward = (deg) => { const i = ((Math.round(deg / 45) % 8) + 8) % 8; return [SIDES[i], SIDES[(i + 1) % 8], SIDES[(i + 7) % 8], SIDES[(i + 2) % 8], SIDES[(i + 6) % 8]]; };
  function widen(f) { for (const L of f.labs) { const w = L.x1 - L.x0, e = 0.18 * w + 6; f.track(L.x0 - e, L.y0 - 4, L.x1 + e, L.y1 + 4); } return f; }
  const pol = (r, deg, c = [0, 0]) => [c[0] + r * Math.cos(deg * D), c[1] - r * Math.sin(deg * D)];
  const sub = (x1, y1, x2, y2, step = 7) => { const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step)); return [...Array(n + 1)].map((_, i) => [x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); };
  const dl = (f, x1, y1, x2, y2, o = {}) => f.pl(sub(x1, y1, x2, y2), o);
  const shadeP = (f, pts) => { pts.forEach((p) => f.track(p[0], p[1])); f.add(`<path class="shade nodecl" d="M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z"/>`); };
  const axis = (f, x1, y1, x2, y2, lab, sides) => { f.arrow(x1, y1, x2, y2, { cls: 'dim', hs: 6 }); if (lab) put(f, x2, y2, lab, sides || sidesToward(Math.atan2(y1 - y2, x2 - x1) / D), 5, 'small accent'); };
  const ang = (f, c, r, a0, a1, lab) => { f.pl(f.arcPts(c[0], c[1], r, r, a0, a1), { cls: 'dim thin' }); if (lab) { const p = pol(r + 3, (a0 + a1) / 2, c); if (!tryPut(f, p[0], p[1], lab, sidesToward((a0 + a1) / 2), 4, 'small')) put(f, c[0], c[1], lab, sidesToward((a0 + a1) / 2 + 180), 6, 'small'); } };
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
      const pts = []; const a = c.from ?? x0, b = c.to ?? x1, N = c.n || 240;
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

  // ================================================================ Cartesian: a rectangle (pipe cross-section, or a slot when open)
  // Lower-left corner at (0, 0), y up (screen y = -y). o: w, h (px); B, T, L, R face labels (TeX; null = no label);
  // ins: { B, T, L, R } true -> insulating face (dashed, no metal); open: true -> no right face, plates run on (slot);
  // Lp: [[y0frac, y1frac, lab]] -> left face made of insulated pieces; xt, yt: corner ticks for the width / height;
  // pts: [[x, y, lab, sides]] (px, y up); axes: false to omit the small x-y glyph; extra(f)
  function rbox(o = {}) {
    const f = PF.fig();
    const w = o.w ?? 170, h = o.h ?? 110, g = 3, t = 10, ext = 30, ins = o.ins || {}, open = !!o.open;
    const xr = open ? w + ext : w;
    if (o.tint !== false) shadeP(f, [[0, 0], [xr, 0], [xr, -h], [0, -h]]);
    const hface = (y, side, isIns) => {
      if (isIns) dl(f, g, y, (open ? w : w - g), y, { cls: 'thick dash' });
      else f.plane(g, open ? w : w - g, y, { side });
    };
    hface(0, 'below', ins.B); hface(-h, 'above', ins.T);
    if (open) { f.line(w, 0, w + ext, 0, { cls: 'dim dash' }); f.line(w, -h, w + ext, -h, { cls: 'dim dash' }); }
    if (o.Lp) {
      o.Lp.forEach(([p0, p1]) => f.wall(0, -p1 * h + (p1 === 1 ? g : 2.5), -p0 * h - (p0 === 0 ? g : 2.5), { side: 'left' }));
    } else if (ins.L) dl(f, 0, -h + g, 0, -g, { cls: 'thick dash' });
    else f.wall(0, -h + g, -g, { side: 'left' });
    if (!open) { if (ins.R) dl(f, w, -h + g, w, -g, { cls: 'thick dash' }); else f.wall(w, -h + g, -g, { side: 'right' }); }
    for (const p of (o.pts || [])) f.dot(p[0], -p[1], 2.8);
    if (o.pre) o.pre(f, w, h);
    const lab = (t0) => (t0 === '0' ? 'V=0' : t0);
    if (o.T != null) put(f, o.Tx ?? w / 2, -h - (ins.T ? 2 : t), lab(o.T), ['t', 'tr', 'tl'], 6, 'small');
    if (o.B != null) put(f, o.Bx ?? w / 2, ins.B ? 2 : t, lab(o.B), ['b', 'br', 'bl'], 6, 'small');
    if (o.Lp) o.Lp.forEach(([p0, p1, lb]) => { if (lb != null) put(f, -t, -(p0 + p1) / 2 * h, lab(lb), ['l', 'tl', 'bl'], 6, 'small'); });
    else if (o.L != null) put(f, ins.L ? -2 : -t, -h / 2, lab(o.L), ['l', 'tl', 'bl'], 6, 'small');
    if (o.R != null && !open) put(f, ins.R ? w + 2 : w + t, -h / 2, lab(o.R), ['r', 'tr', 'br'], 6, 'small');
    if (o.far) put(f, w + ext + 4, -h / 2, o.far, ['r', 'tr', 'br'], 4, 'small');
    if (o.xt) put(f, w, t, o.xt, ['br', 'b', 'r'], 4, 'small accent');
    if (o.yt) put(f, -t, -h, o.yt, ['tl', 'l', 't'], 4, 'small accent');
    if (o.axes !== false) { axis(f, -40, 38, -18, 38, 'x', ['r', 'br']); axis(f, -40, 38, -40, 16, 'y', ['t', 'tl']); }
    for (const p of (o.pts || [])) if (p[2]) put(f, p[0], -p[1], p[2], p[3] || ['tr', 'tl', 'br', 'bl', 'r', 'l'], 5);
    if (o.inside) put(f, o.inside[1], -o.inside[2], o.inside[0], ['r', 'l', 't', 'b'], 2, 'small');
    if (o.extra) o.extra(f, w, h);
    return widen(f).svg();
  }

  // a 3-D box 0<x<a, 0<y<b, 0<z<c with a live lid (oblique view)
  function box3(o = {}) {
    const a = o.a ?? 70, b = o.b ?? 70, c = o.c ?? 70;
    const f = PF.fig({ proj: { ox: 0, oy: 0, s: 1 } });
    f.box3(a, b, c, { shadeTop: true });
    const top = f.p3(a / 2, b / 2, c);
    put(f, top[0], top[1] - 2, o.top || 'V_0', ['t', 'tr', 'tl'], 26, 'small');
    const side = f.p3(a, b / 2, c / 2);
    put(f, side[0], side[1], o.sides || '\\text{other faces } V=0', ['bl', 'b', 'l'], 30, 'small');
    const X = f.p3(a, 0, 0), Y = f.p3(0, b, 0), Z = f.p3(0, 0, c);
    put(f, X[0], X[1], o.al || 'a', ['bl', 'l', 'b'], 5, 'small accent');
    put(f, Y[0], Y[1], o.bl || 'a', ['br', 'r', 'b'], 5, 'small accent');
    put(f, Z[0], Z[1], o.cl || 'c', ['l', 'tl', 'bl'], 6, 'small accent');
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // ================================================================ polar: the wedge / annular sector (vertex at the origin, wall 1 along +x)
  // o: al (deg), a (inner radius px, 0 = tip in the region), b (outer radius px), open (no outer arc), w0, wA, inner, outer, far: labels;
  //    metal0/metalA false: that wall is insulating (dashed); outerP: [[deg0, deg1, lab]] outer arc in insulated pieces;
  //    ticks: 'a','b' marks; pts: [[r, deg, lab, side]]; angLab; O: vertex label
  function wedge(o = {}) {
    const f = PF.fig();
    const al = o.al ?? 60, a = o.a ?? 0, b = o.b ?? 150, open = !!o.open, L = o.L ?? (open ? 170 : b), gp = a || !open ? 4 : 0;
    const rIn = a ? a + gp : (o.r0 || 0), rOut = open ? L : b - gp, t = 9;
    const outerPts = f.arcPts(0, 0, open ? L : b, open ? L : b, 0, al);
    const innerPts = a ? f.arcPts(0, 0, a, a, al, 0) : [[0, 0]];
    if (o.tint !== false) shadeP(f, outerPts.concat(innerPts));
    const wall = (deg, side, metal) => {
      const n = pol(1, deg + side * 90), p1 = pol(rIn, deg), p2 = pol(rOut, deg);
      if (metal !== false) f.hatchBand([p1, p2, [p2[0] + n[0] * t, p2[1] + n[1] * t], [p1[0] + n[0] * t, p1[1] + n[1] * t]]);
      dl(f, p1[0], p1[1], p2[0], p2[1], { cls: metal === false ? 'thick dash' : 'thick' });
      if (open) { const p3 = pol(L + 26, deg); dl(f, p2[0], p2[1], p3[0], p3[1], { cls: 'dim dash' }); }
    };
    wall(0, -1, o.metal0); wall(al, 1, o.metalA);
    if (a) { for (const d of [0, al]) { const p = pol(a - 2, d); dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); } }
    if (!open && o.outerP) {
      for (const [d0, d1] of o.outerP) {
        const e0 = d0 === 0 ? 0 : d0 + 1.6, e1 = d1 === al ? al : d1 - 1.6;
        f.hatchBand(f.arcPts(0, 0, b, b, e0, e1).concat(f.arcPts(0, 0, b + t, b + t, e1, e0)));
        f.pl(f.arcPts(0, 0, b, b, e0, e1), { cls: 'thick' });
      }
    } else if (!open && o.outerArc !== false) {
      f.hatchBand(f.arcPts(0, 0, b, b, 0, al).concat(f.arcPts(0, 0, b + t, b + t, al, 0)));
      f.pl(f.arcPts(0, 0, b, b, 0, al), { cls: 'thick' });
    }
    if (a && o.innerArc !== false) {
      f.hatchBand(f.arcPts(0, 0, a, a, 0, al).concat(f.arcPts(0, 0, a - t, a - t, al, 0)));
      f.pl(f.arcPts(0, 0, a, a, 0, al), { cls: 'thick' });
    }
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); f.dot(q[0], q[1], 2.8); }
    if (o.rays) for (const d of o.rays) { const p = pol(a ? a + 6 : 0, d), q = pol(rOut - 6, d); dl(f, p[0], p[1], q[0], q[1], { cls: 'dim dash thin' }); }
    f.dot(0, 0, 2.2);
    const ar = o.ar ?? (a ? Math.min(0.5 * a, 24) : 26);
    if (o.angLab !== false) ang(f, [0, 0], ar, 0, al, o.angLab || '\\alpha');
    const rm = o.rm ?? (rIn + rOut) / 2;
    if (o.w0) { const p = pol(rm, 0); put(f, p[0], p[1] + t, o.w0, ['b', 'bl', 'br'], 6, 'small'); }
    if (o.wA) { const n = pol(o.metalA === false ? 2 : t, al + 90), p = pol(o.rmA ?? rm, al); put(f, p[0] + n[0], p[1] + n[1], o.wA, sidesToward(al + 90), 6, 'small'); }
    if (o.outer && !open) { const p = pol(b + t, o.outerAt ?? al / 2); put(f, p[0], p[1], o.outer, sidesToward(o.outerAt ?? al / 2), 6, 'small'); }
    if (o.outerP && !open) for (const [d0, d1, lb] of o.outerP) { if (!lb) continue; const p = pol(b + t, (d0 + d1) / 2); put(f, p[0], p[1], lb, sidesToward((d0 + d1) / 2), 5, 'small'); }
    if (o.far && open) { const p = pol(L + 10, al / 2); put(f, p[0], p[1], o.far, sidesToward(al / 2), 6, 'small'); }
    if (o.inner && a) { const ia = o.innerAt ?? al / 2, p = pol(a + 3, ia); put(f, p[0], p[1], o.inner, sidesToward(ia), 4, 'small'); }
    if (o.O !== false) put(f, 0, 0, 'O', sidesToward(al / 2 + 180), 5, 'small accent');
    if (o.ticks) {
      if (a) { const p = pol(a, 0); put(f, p[0], p[1] + t, o.aLab || 'a', ['b', 'bl', 'br'], 4, 'small accent'); }
      if (!open) { const p = pol(b, 0); put(f, p[0], p[1] + t, o.bLab || 'b', ['b', 'br', 'bl'], 4, 'small accent'); }
    }
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); if (p[2]) put(f, q[0], q[1], p[2], p[3] ? [p[3]].concat(['tr', 'tl', 'r', 'l', 'br', 'bl']) : ['tr', 'tl', 'r', 'l', 'br', 'bl'], 5); }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // ================================================================ cylinder cross-sections (axis out of the page)
  // o: R, a (inner radius), aMetal, outerMetal, lab [[tex, deg]], aLab [[tex, deg]], pts, phi (deg), Rdim, adim, cut (deg: radial metal wall), gaps [deg]
  function cyl(o = {}) {
    const f = PF.fig();
    const R0 = o.R ?? 58, a = o.a || 0;
    if (o.tint !== false) { if (a) shadeP(f, f.arcPts(0, 0, R0, R0, 0, 360).concat(f.arcPts(0, 0, a, a, 360, 0))); else if (!o.ext) shadeP(f, f.arcPts(0, 0, R0, R0, 0, 360)); }
    if (o.ext) f.add(`<path class="shade nodecl" d="M-${R0 * 1.7},-${R0 * 1.4}L${R0 * 1.7},-${R0 * 1.4}L${R0 * 1.7},${R0 * 1.4}L-${R0 * 1.7},${R0 * 1.4}Z M${R0},0${f.arcPts(0, 0, R0, R0, 0, 360).map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')}Z" fill-rule="evenodd"/>`), f.track(-R0 * 1.7, -R0 * 1.4, R0 * 1.7, R0 * 1.4);
    if (o.outerMetal) f.hatchBand(f.arcPts(0, 0, R0 + 9, R0 + 9, 0, 360).concat(f.arcPts(0, 0, R0, R0, 360, 0)));
    f.circle(0, 0, R0, { cls: 'thick' });
    if (a) { if (o.aMetal) f.hatchBand(f.arcPts(0, 0, a, a, 0, 360)); f.circle(0, 0, a, { cls: 'thick' }); }
    if (o.cut !== undefined) { const p = pol(a + 1, o.cut), q = pol(R0 - 1, o.cut); f.hatchBand([[p[0], p[1] - 2.5], [q[0], q[1] - 2.5], [q[0], q[1] + 2.5], [p[0], p[1] + 2.5]]); f.line(p[0], p[1], q[0], q[1], { cls: 'thick' }); }
    for (const d of (o.gaps || [])) { const p = pol(R0, d); f.dot(p[0], p[1], 2.6); }
    if (!a) f.dot(0, 0, 2.0);
    if (o.phi !== undefined) { const p = pol(R0, o.phi); dl(f, 0, 0, p[0], p[1], { cls: 'dim thin' }); ang(f, [0, 0], o.phiR || 0.3 * R0, 0, o.phi, '\\phi'); f.line(a ? a + 2 : 2, 0, R0 * 0.5, 0, { cls: 'dim dash thin' }); }
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); f.dot(q[0], q[1], 2.8); }
    if (o.Rdim) { const p = pol(R0, o.Rdim[0]); dimL(f, 0, 0, p[0], p[1], o.Rdim[1] || 'R', o.Rdim[2]); }
    for (const [tex, deg] of (o.lab || [])) { const p = pol(R0 + (o.outerMetal ? 14 : 5), deg); put(f, p[0], p[1], tex, sidesToward(deg), 5, 'small'); }
    for (const [tex, deg] of (o.aLab || [])) { const p = pol(a + 4, deg); put(f, p[0], p[1], tex, sidesToward(deg), 4, 'small'); }
    for (const p of (o.pts || [])) { const q = pol(p[0], p[1]); if (p[2]) put(f, q[0], q[1], p[2], ['tr', 'tl', 'r', 'l', 'br', 'bl'], 5); }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // ================================================================ figures for the concept ladder
  const BOX_TOP = rbox({ T: 'V_0', B: '0', L: '0', R: '0', xt: 'a', yt: 'b' });
  const SQ_TOP = rbox({ w: 120, h: 120, T: 'V_0', B: '0', L: '0', R: '0', xt: 'a', yt: 'a' });
  const SLOT_V0 = rbox({ open: true, w: 190, h: 100, L: 'V_0', T: '0', B: '0', yt: 'a', far: 'x\\to\\infty' });
  const BOX_LT = rbox({ L: 'V_1', T: 'V_2', R: '0', B: '0', xt: 'a', yt: 'b' });
  const BOX_R = rbox({ L: '0', T: '0', B: '0', R: 'V_0', xt: 'a', yt: 'b' });
  const BOX_LR = rbox({ L: 'V_0', R: 'V_0', T: '0', B: '0', xt: 'a', yt: 'b' });
  const SLOT_TOPV0 = rbox({ open: true, w: 190, h: 100, L: '0', T: 'V_0', B: '0', yt: 'a' });
  const SLOT_SIN2 = rbox({ open: true, w: 190, h: 100, L: 'V_0\\sin^2(\\pi y/a)', T: '0', B: '0', yt: 'a' });
  const SLOT_STEP3 = rbox({ open: true, w: 190, h: 105, Lp: [[0, 1 / 3, 'V_0'], [1 / 3, 1, '0']], T: '0', B: '0', yt: 'a', extra: (f, w, h) => put(f, 4, -h / 3, 'a/3', ['r', 'tr', 'br'], 4, 'small accent') });
  const BOX_NEU = rbox({ ins: { L: true, R: true }, L: '\\partial_x V=0', R: '\\partial_x V=0', B: '0', T: 'V_0(x)', xt: 'a', yt: 'b' });
  const BOX_NEU0 = rbox({ ins: { L: true, R: true }, L: '\\partial_x V=0', R: '\\partial_x V=0', B: '0', T: 'V_0', xt: 'a', yt: 'b' });
  const BOX_NEULIN = rbox({ ins: { L: true, R: true }, L: '\\partial_x V=0', R: '\\partial_x V=0', B: '0', T: 'V_0\\,x/a', xt: 'a', yt: 'b', extra: (f, w, h) => dl(f, w / 2, -4, w / 2, -h + 4, { cls: 'dim dash thin' }) });
  const BOX_FAR = rbox({ B: 'V_0(x)', T: '0', L: '0', R: '0', xt: 'a', yt: 'b' });
  const SQ_4 = rbox({ w: 120, h: 120, L: 'V_0', T: 'V_0', R: '-V_0', B: '0', xt: 'a', yt: 'a', pts: [[60, 60, 'C']] });
  const SLOT_PLATES = rbox({ open: true, w: 190, h: 100, L: '0', T: 'V_0', B: 'V_0', yt: 'a' });
  const WIDE_BOX = rbox({ w: 220, h: 110, T: 'V_0', B: '0', L: '0', R: '0', xt: '2a', yt: 'a', pts: [[110, 55, 'C']] });
  const SQ_CORNER = rbox({ w: 130, h: 130, T: 'V_0', B: '0', L: '0', R: '0', xt: 'a', yt: 'a', extra: (f, w, h) => {
    const rho = 34, ph = 50 * D, P0 = [rho * Math.sin(ph), -h + rho * Math.cos(ph)];
    dl(f, 0, -h, P0[0], P0[1], { cls: 'dim dash thin' }); f.dot(P0[0], P0[1], 2.6);
    ang(f, [0, -h], 15, -90, 50 - 90, '\\phi');
    put(f, P0[0], P0[1], 'P', ['br', 'r', 'b'], 5);
  } });
  const BOX3D = box3({ a: 80, b: 80, c: 70, bl: 'b', cl: 'c' });
  const BOX3D_DEEP = box3({ a: 60, b: 60, c: 150, cl: 'c\\gg a' });
  // end-data shapes for the coefficient-decay question
  const shapeFig = (fn) => plt({ w: 150, h: 104, ml: 26, mr: 12, mt: 12, mb: 24, x: [0, 1], y: [0, 1.15], xt: [[1, 'a']], yt: [[1, 'V_0']], xl: 'y', curves: [{ f: fn, n: 300 }] });
  const SHAPES = PF.row([
    { svg: shapeFig(() => 1), cap: '(A) constant' },
    { svg: shapeFig((y) => y), cap: '(B) ramp $V_0y/a$' },
    { svg: shapeFig((y) => 1 - Math.abs(2 * y - 1)), cap: '(C) tent' },
    { svg: shapeFig((y) => Math.sin(PI * y)), cap: '(D) one sine' },
  ]);

  const WEDGE_PIE = wedge({ al: 55, b: 150, w0: 'V=0', wA: 'V=0', outer: 'V_0' });
  const WEDGE_PIE3 = wedge({ al: 60, b: 150, w0: 'V=0', wA: 'V=0', outer: 'V_0', angLab: '\\pi/3' });
  const EXAM = wedge({ al: 60, a: 55, b: 150, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', ticks: true });
  const EXAM_PTS = wedge({ al: 90, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', ticks: true, bLab: '2a', angLab: '\\pi/2', pts: [[133, 45, 'P'], [105, 45, 'Q'], [133, 9, 'R', 'tl']] });
  const EXAM_NEAR = wedge({ al: 90, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', ticks: true, bLab: '2a', angLab: '\\pi/2', pts: [[84, 45, 'A', 'tl'], [105, 45, 'B', 'tl'], [139.3, 45, 'C', 'tl']] });
  const EXAM_SIN = wedge({ al: 60, a: 55, b: 150, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0\\sin(\\pi\\theta/\\alpha)', ticks: true, rays: [30], pts: [[91, 30, 'P', 'tl']] });
  const NEU_PIE = wedge({ al: 55, b: 150, w0: 'V=0', wA: '\\partial_\\theta\\Phi=0', metalA: false, outer: 'V_0' });
  const NARROW = wedge({ al: 18, a: 70, b: 190, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', ticks: true, ar: 30 });
  const PIE_TWO = wedge({ al: 60, b: 150, w0: 'V=0', wA: 'V_0', outer: 'V_0' });
  const SECTOR_SYM = wedge({ al: 60, a: 50, b: 150, w0: 'V=0', wA: 'V_0', inner: 'V=0', outer: 'V_0', ticks: true, bLab: '3a', angLab: '\\pi/3', rays: [30], pts: [[86.6, 30, 'P', 'tl']] });
  const REENTRANT = wedge({ al: 270, b: 100, w0: 'V=0', wA: 'V=0', outer: 'V_0', angLab: '3\\pi/2', ar: 22 });
  const tipW = (al, lab) => wedge({ al, open: true, L: 80, w0: 'V_0', wA: 'V_0', angLab: lab, ar: 18, O: false, rm: 50 });
  const WEDGE_TIPS = PF.row([
    { svg: tipW(90, '\\pi/2'), cap: '(A) $\\alpha = \\pi/2$' },
    { svg: tipW(180, '\\pi'), cap: '(B) $\\alpha = \\pi$' },
    { svg: tipW(270, '3\\pi/2'), cap: '(C) $\\alpha = 3\\pi/2$' },
  ]);
  const INV = PF.row([
    { svg: wedge({ al: 60, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', ticks: true, bLab: '2a' }), cap: '$\\Phi_{\\text{out}}$: outer arc live' },
    { svg: wedge({ al: 60, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V_0', outer: 'V=0', ticks: true, bLab: '2a' }), cap: '$\\Phi_{\\text{in}}$: inner arc live' },
  ]);
  const regionMini = (kind) => {
    const f = PF.fig(), R0 = 40, a = 18;
    if (kind === 'disk') { shadeP(f, f.arcPts(0, 0, R0, R0, 0, 360)); f.circle(0, 0, R0, { cls: 'thick' }); f.dot(0, 0, 2.2); }
    if (kind === 'ext') { f.add(`<path class="shade nodecl" d="M-70,-56L70,-56L70,56L-70,56Z M${R0},0${f.arcPts(0, 0, R0, R0, 0, 360).map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')}Z" fill-rule="evenodd"/>`); f.circle(0, 0, R0, { cls: 'thick' }); f.dot(0, 0, 2.2); }
    if (kind === 'ann') { shadeP(f, f.arcPts(0, 0, R0, R0, 0, 360).concat(f.arcPts(0, 0, a, a, 360, 0))); f.circle(0, 0, R0, { cls: 'thick' }); f.circle(0, 0, a, { cls: 'thick' }); f.dot(0, 0, 2.2); }
    f.track(-70, -56, 70, 56);
    return f.svg();
  };
  const REGIONS = PF.row([
    { svg: regionMini('disk'), cap: '(A) inside a circle' },
    { svg: regionMini('ext'), cap: '(B) outside a circle' },
    { svg: regionMini('ann'), cap: '(C) between two circles' },
  ]);
  const ANN = cyl({ R: 72, a: 30, aMetal: true, lab: [['V(b,\\phi)', 40]], aLab: [['V_0', 135]], phi: 150, phiR: 44 });
  const EXT_COS = cyl({ R: 50, ext: true, lab: [['V_0\\cos\\phi', 40]] });
  const DISK_RAMP = cyl({ R: 64, lab: [['V_0\\,\\phi/2\\pi', 55]], phi: 120, gaps: [0] });
  const CUT_ANN = cyl({ R: 72, a: 28, aMetal: true, cut: 0, lab: [['V=0', 120]], aLab: [['V_0', 135]], extra: (f) => put(f, 50, 4, '\\text{wall } V=0', ['b', 'br'], 8, 'small') });

  // ================================================================ Lesson A: concept ladder
  const LA = {
    id: 'uD-sep-concepts', title: 'Separation ladder: concepts, easy → brutal',
    steps: [
      RF(md`
        One page of tools, then the ladder. Everything below is 2-D Laplace, $\lap V = 0$, in a region with no charge.

        **Haven't learned polar yet?** Polar here is a flat $(r, \theta)$ plane with nothing depending on $z$; it is **not** spherical. Do [Laplace in polar coordinates](#/l/uW-polar) and [Wedges and sectors](#/l/uW-wedge) first (and [Unit 6](#/l/u6-idea) for boxes), then come back.

        | Coordinates | Pieces for separation constant $k \ne 0$ | The $k = 0$ piece |
        |---|---|---|
        | Cartesian $(x, y)$ | $\sin kx,\ \cos kx$ times $\sinh ky,\ \cosh ky$ (or $e^{\pm ky}$) | $(A + Bx)(C + Dy)$ |
        | Polar $(r, \theta)$ | $\sin k\theta,\ \cos k\theta$ times $r^{k},\ r^{-k}$ | $(A + B\ln r)(C + D\theta)$ |
        | 3-D box | $\sin k_1x\,\sin k_2y$ times $\sinh\!\big(\sqrt{k_1^2+k_2^2}\,z\big)$ | rarely needed |

        In polar coordinates $\theta$ plays the role of the oscillating direction and $\ln r$ plays the role of the decaying one: $r^{\pm k} = e^{\pm k\ln r}$. So a wedge is a slot drawn in $(\ln r, \theta)$.

        !!method The recipe, every time
            1. Name the region. Number the boundary conditions BC #1, #2, ...
            2. Find the two faces that face each other and are both homogeneous (both $0$, or both "insulating"). That direction gets $\sin$/$\cos$; the other gets $\sinh$/$\cosh$/$e^{\pm}$ (Cartesian) or $r^{\pm k}$ (polar).
            3. Apply the homogeneous BCs term by term: they quantize $k$ and kill or fix the mix of the two radial/hyperbolic pieces.
            4. Apply the one live face last, with Fourier's trick.
            5. More than one live face: superpose one-live-face problems. Live faces facing each other along the oscillating direction: subtract the $k = 0$ solution first.
      `),

      R(md`
        ### Level 1: recognize
        Which function goes where. These should take ten seconds each.
      `),
      Q(md`A long pipe has cross-section $0<x<a$, $0<y<b$. The top ($y = b$) is held at $V_0$; the other three sides are grounded. Which product solutions do you build $V$ from?`,
        [md`$\sin(n\pi y/b)\,\sinh(n\pi x/b)$`, md`$\sin(n\pi x/a)\,\sinh(n\pi y/a)$`, md`$\sin(n\pi x/a)\,e^{-n\pi y/a}$`, md`$\sinh(n\pi x/a)\,\sin(n\pi y/a)$`], 1,
        [md`A sine in $y$ must vanish at $y = 0$ and $y = b$, but $y = b$ is the live face, where $V = V_0$.`, null,
          md`The box is closed at $y = b$; nothing goes to infinity, so you can't drop $e^{+ky}$. Both exponentials combine into $\sinh$ once you impose $V(x, 0) = 0$.`,
          md`$\sinh$ is zero at only one point, so it can't satisfy both $V(0, y) = 0$ and $V(a, y) = 0$. And $\sin(n\pi y/a)$ has the wrong period for a box of height $b$.`],
        md`The grounded faces $x = 0$ and $x = a$ face each other, so $X(x)$ must vanish twice: $\sin(n\pi x/a)$. Laplace forces the $y$ part to have the opposite-sign constant, so it is hyperbolic, and $V(x, 0) = 0$ picks $\sinh(n\pi y/a)$. The live face $y = b$ is matched last by Fourier.`,
        { figHtml: BOX_TOP }),
      Q(md`In 2-D Cartesian separation, $X''/X = -Y''/Y = $ const. How do you decide which direction gets the oscillating functions?`,
        [md`It is always $x$.`, md`It is the longer side of the box.`, md`It is the direction pointing toward the live face.`, md`It is the direction in which both ends are homogeneous (two grounded faces facing each other).`], 3,
        [md`The labels don't matter. Rotate the box and the answer rotates with it.`,
          md`Length has nothing to do with it. A wide box with a live short side still has the sines across the short direction.`,
          md`That direction is where $V$ climbs from $0$ to $V_0$ without coming back to zero: $\sinh$, $\cosh$ or $e^{\pm}$.`, null],
        md`A sine is the only separated function that can be zero at two places. So it goes in the direction with a homogeneous condition at **both** ends. The other direction then carries $\sinh$/$\cosh$/exponentials, which can be zero at most once and so can reach the live face.`,
        { nofig: 'a rule, not a geometry' }),
      Q(md`Pie slice $0<r<b$, $0<\theta<\alpha$: both walls grounded, the arc at $V_0$. The tip $r = 0$ is part of the region. Which product solutions?`,
        [md`$r^{n\pi/\alpha}\sin(n\pi\theta/\alpha)$`, md`$r^{-n\pi/\alpha}\sin(n\pi\theta/\alpha)$`, md`$r^{n}\sin n\theta$`, md`$(A + B\ln r)$ times a constant`], 0,
        [null, md`$r^{-k}$ blows up at the tip, which is inside the region.`,
          md`$\sin n\theta$ with integer $n$ is for a full circle. Every one of them vanishes at $\theta = \alpha$ only if $\alpha$ is a multiple of $\pi$; for a general opening most of them don't.`,
          md`That's the $k = 0$ piece. Its angular part $C + D\theta$ must vanish at both walls, so it is zero.`],
        md`The walls are the two homogeneous faces facing each other (in the $\theta$ direction), so $\Theta = \sin k\theta$ with $\sin k\alpha = 0$: $k = n\pi/\alpha$. The radial pieces are $r^{\pm k}$, and the tip being in the region kills $r^{-k}$.`,
        { figHtml: WEDGE_PIE }),
      Q(md`Which region needs **both** $s^n$ and $s^{-n}$ for each $n$, plus a $\ln s$ term?`,
        [md`(A), inside a circle`, md`(B), outside a circle`, md`(C), between two circles`, md`None: each region keeps exactly one power`], 2,
        [md`The origin is in the region: $s^{-n}$ and $\ln s$ blow up there.`,
          md`Infinity is in the region: $s^{n}$ grows there (unless a uniform field is imposed), and $\ln s$ grows unless there is net charge.`,
          null, md`The annulus contains neither $0$ nor $\infty$, so nothing rules out either power.`],
        md`You drop a term only when it misbehaves somewhere in the region. The annulus excludes both the origin and infinity, so every piece stays, and the two boundary circles fix the two coefficients for each $n$.`,
        { figHtml: REGIONS.svg }),

      R(md`
        ### Level 2: set up
        The numbered BC list, and what each condition does.
      `),
      Q(md`The slot: plates $y = 0$ and $y = a$ grounded, end $x = 0$ at $V_0$, open toward $x \to \infty$. In which order do you use the four conditions?`,
        [md`The end first to fix the coefficients, then the plates.`, md`$x\to\infty$ first, then the end, then the plates.`, md`Plates (quantize $k$), then $x\to\infty$ (kill $e^{+kx}$), then the end (Fourier).`, md`Any order: they all have to hold anyway.`], 2,
        [md`You can't compute coefficients before you know the functions. Fourier needs the sine set that the plates produce.`,
          md`Fourier on the end before quantizing $k$ would leave a continuum of $k$ values: the plates must come first.`, null,
          md`Only homogeneous conditions can be imposed term by term. The live face involves the whole sum, so it has to be last.`],
        md`Homogeneous conditions first: each one restricts every product term separately (plates: $\sin(n\pi y/a)$; far away: $e^{-n\pi x/a}$). The inhomogeneous one, the live end, is matched by the whole sum, with Fourier's trick.`,
        { figHtml: SLOT_V0 }),
      Q(md`The exam sector: $a<r<b$, $0<\theta<\alpha$, walls and inner arc grounded, outer arc at $V_0$. How many of the four BCs are homogeneous?`,
        ['1', '2', '3', '4'], 2,
        [md`The two walls are homogeneous too, not only the inner arc.`, md`Don't forget the inner arc $\Phi(a, \theta) = 0$.`, null, md`$\Phi(b, \theta) = V_0$ is not zero: it can't be imposed term by term.`],
        md`$\Phi(r, 0) = 0$, $\Phi(r, \alpha) = 0$, $\Phi(a, \theta) = 0$ are homogeneous; $\Phi(b,\theta) = V_0$ is the one live face. Three restrictions on each term, then one Fourier step.`,
        { figHtml: EXAM }),
      Q(md`In the same sector, which condition(s) fix $k = n\pi/\alpha$?`,
        [md`$\Phi(b, \theta) = V_0$`, md`$\Phi(a, \theta) = 0$`, md`Laplace's equation itself`, md`$\Phi(r, 0) = 0$ and $\Phi(r, \alpha) = 0$`], 3,
        [md`That's the Fourier step. It sets the coefficients $C_n$, after $k$ is known.`,
          md`That's a radial condition. It fixes the mix of $r^{k}$ and $r^{-k}$.`,
          md`Laplace is satisfied by every $k$. It's the boundary that picks the allowed ones.`, null],
        md`$\Theta = A\sin k\theta + B\cos k\theta$. Wall $\theta = 0$: $B = 0$. Wall $\theta = \alpha$: $\sin k\alpha = 0$, so $k = n\pi/\alpha$. The two walls are what quantize $k$, just as the two plates do in the slot.`,
        { figHtml: EXAM }),
      Q(md`A problem says "the end strip is insulated from the plates". What does that sentence do to the boundary conditions?`,
        [md`It lets the strip sit at $V_0$ while the plates sit at $0$; the potential jumps at the tiny gaps.`, md`It makes $\partial V/\partial n = 0$ on the strip.`, md`It means the strip carries no charge.`, md`It forces $V$ to be continuous at the corners, so $V_0$ must be $0$.`], 0,
        [null, md`That is an insulating **wall** (no field into it). Here the strip is metal, insulated only from its neighbours.`,
          md`A battery holds the strip at $V_0$. It carries whatever charge that takes.`,
          md`The gap is exactly what allows the jump. Without it, plates and strip would be one conductor at one potential.`],
        md`Metal pieces in contact are one equipotential. "Insulated from" means separate pieces, so each face can be given its own value. The price is a discontinuity at the corner, which is why the series misbehaves there.`,
        { figHtml: SLOT_V0 }),
      Q(md`A pipe $0<x<a$, $0<y<b$ has its left side at $V_1$, its top at $V_2$, and the other two sides grounded. What is the first step?`,
        [md`Subtract a linear function that matches both live faces.`, md`Split into two problems, each with one live face, and add the answers.`, md`Use $\sin$ in both $x$ and $y$.`, md`Expand both live faces in one Fourier series.`], 1,
        [md`No linear function equals $V_1$ on $x = 0$, $V_2$ on $y = b$ and $0$ on the other two sides.`, null,
          md`$\sin\cdot\sin$ isn't harmonic: Laplace needs the two separation constants to have opposite signs.`,
          md`The faces lie along different variables and need different sine sets ($\sin(n\pi y/b)$ on the left face, $\sin(n\pi x/a)$ on the top).`],
        md`Laplace is linear and the BCs add: (left at $V_1$, rest grounded) + (top at $V_2$, rest grounded) has the right values on all four sides. Each piece is a one-live-face problem with its own orientation of $\sin$ and $\sinh$.`,
        { figHtml: BOX_LT }),

      R(md`
        ### Level 3: standard
        The textbook cases, plus the checks that catch mistakes without computing.
      `),
      Q(md`Square pipe of side $a$: top at $V_0$, other three sides grounded. Without a series, what is $V$ at the center?`,
        [md`$V_0/2$`, md`$\approx 0.254\,V_0$, the first term`, md`$V_0/\pi$`, md`$V_0/4$`], 3,
        [md`That averages the top and bottom only and ignores the two grounded sides.`,
          md`$\frac{4}{\pi}\frac{\sinh(\pi/2)}{\sinh\pi} = 0.2537$ is only the $n = 1$ term. The full series gives exactly $0.2500$.`,
          md`No argument produces $1/\pi$ here.`, null],
        md`Rotate the problem four times so each side takes a turn being live. The four solutions add to the problem with all sides at $V_0$, whose answer is $V = V_0$ everywhere. At the center all four contribute equally, so each gives $V_0/4$. Use this to check a series answer.`,
        { figHtml: SQ_TOP }),
      Q(md`For the slot with constant end $V_0$, $C_1 = 4V_0/\pi \approx 1.27\,V_0$, more than the strip's potential. What does that mean?`,
        [md`An error: no coefficient can exceed the boundary value.`, md`The potential exceeds $V_0$ somewhere inside.`, md`Nothing is wrong: one sine overshoots a flat top; $n = 3, 5, \ldots$ pull the sum back to $V_0$.`, md`It means you should have used $\cos$.`], 2,
        [md`Coefficients are amplitudes in a sine expansion. The fundamental of a flat-topped profile is taller than the profile.`,
          md`With no charge inside, $V$ has no interior maximum. Inside, $V < V_0$ everywhere.`, null,
          md`The grounded plates force $\sin$; $\cos$ doesn't vanish at $y = 0$.`],
        md`$\frac{4}{\pi}\left(\sin u + \frac13\sin 3u + \ldots\right) = 1$ on $0<u<\pi$. The first sine alone reaches $4/\pi$ in the middle; the others subtract there and add near the plates. Far down the slot only $n = 1$ survives, and $V \approx 1.27\,V_0\,e^{-\pi x/a}\sin(\pi y/a)$ is small anyway.`,
        { figHtml: SLOT_V0 }),
      Q(md`Pie slice of opening $\alpha = \pi/3$: walls grounded, arc at $V_0$, tip included. How does $|\vb E|$ behave at the tip?`,
        [md`Diverges like $1/r$`, md`Diverges like $r^{-1/2}$`, md`Finite and nonzero`, md`Vanishes like $r^2$`], 3,
        [md`$1/r$ comes from $V_0\theta/\alpha$, which appears only when the two walls are at **different** potentials.`,
          md`$r^{-1/2}$ is the field at the edge of a thin sheet, $\alpha = 2\pi$.`,
          md`That's the flat case, $\alpha = \pi$, where the lowest mode is $r\sin\theta = y$.`, null],
        md`Lowest mode: $r^{\pi/\alpha}\sin(\pi\theta/\alpha) = r^3\sin 3\theta$. Each derivative lowers the power by one, so $|\vb E| \propto r^{\pi/\alpha - 1} = r^2 \to 0$. Inside a sharp concave corner the field dies off.`,
        { figHtml: WEDGE_PIE3 }),
      Q(md`Pie slice with grounded walls and the arc at a constant $V_0$. Why do only odd $n$ appear?`,
        [md`$\int_0^\alpha \sin(n\pi\theta/\alpha)\,d\theta = \frac{\alpha}{n\pi}(1 - \cos n\pi) = 0$ for even $n$: even modes are odd about the bisector, the data is even.`, md`Even $n$ blow up at the tip.`, md`Even $n$ don't vanish on the walls.`, md`The $r^{-k}$ terms cancel them.`], 0,
        [null, md`Every $r^{n\pi/\alpha}$ is finite at the tip.`, md`Every $\sin(n\pi\theta/\alpha)$ vanishes at both walls; that's how $k$ was chosen.`, md`$r^{-k}$ was already dropped because the tip is in the region.`],
        md`Reflect about the bisector, $\theta \to \alpha - \theta$: $\sin(n\pi\theta/\alpha) \to -(-1)^n\sin(n\pi\theta/\alpha)$. Even-$n$ modes flip sign, so a symmetric boundary profile has no even-$n$ content. Spot the symmetry before integrating.`,
        { figHtml: WEDGE_PIE }),
      Q(md`In the exam sector, which radial function goes with $\sin(n\pi\theta/\alpha)$? ($k = n\pi/\alpha$.)`,
        [md`$r^{k} - r^{-k}$`, md`$(r/b)^k - (b/r)^k$`, md`$(r/a)^k + (a/r)^k$`, md`$(r/a)^k - (a/r)^k$`], 3,
        [md`That vanishes at $r = 1$, not at $r = a$, and it isn't dimensionless.`,
          md`That vanishes at the outer arc, which is the live one.`,
          md`That equals $2$ at $r = a$, where $\Phi$ must be $0$.`, null],
        md`BC $\Phi(a, \theta) = 0$ must hold term by term: $A a^k + B a^{-k} = 0$. Writing the result in ratios, $(r/a)^k - (a/r)^k$, makes the zero at $r = a$ obvious and keeps everything dimensionless.`,
        { figHtml: EXAM }),
      Q(md`Slot with constant end $V_0$. Roughly how far down the slot does $V$ on the midline fall to $1\%$ of $V_0$?`,
        [md`$0.15\,a$`, md`$1.5\,a$`, md`$4.6\,a$`, md`$15\,a$`], 1,
        [md`Far too short. The decay length is $a/\pi \approx 0.32a$, and you need several of them.`, null,
          md`That's $\ln 100$ in units of $a$, which forgets the $\pi$ in $e^{-\pi x/a}$.`,
          md`Ten times too long. Each $a/\pi$ of distance cuts $V$ by $e$.`],
        md`One term: $\frac{4V_0}{\pi}e^{-\pi x/a} = 0.01V_0 \Rightarrow x = \frac{a}{\pi}\ln 127 = 1.54\,a$. The exact closed form gives the same to three digits. The fringe of a slot dies within about one and a half widths: the decay length is (width)$/\pi$.`,
        { figHtml: SLOT_V0 }),
      Q(md`Why is there no $k = 0$ term $(A + B\ln r)(C + D\theta)$ in the exam answer?`,
        [md`The grounded walls force $C + D\theta$ to vanish at $\theta = 0$ and $\theta = \alpha$, so $C = D = 0$.`, md`$\ln r$ blows up at $r = 0$.`, md`$k = 0$ isn't a solution of Laplace's equation.`, md`It is absorbed into the $n = 1$ term.`], 0,
        [null, md`$r = 0$ is not in the region $a<r<b$, so that's not the reason.`,
          md`It is: $\ln r$ and $\theta$ are both harmonic in 2-D.`,
          md`Different modes are independent (orthogonal in $\theta$); nothing gets absorbed.`],
        md`The $k = 0$ angular function is linear in $\theta$. Two zeros (grounded walls) kill a linear function. If the walls were at **different** potentials, $D\theta$ would survive: that's the $V_0\theta/\alpha$ you subtract in harder problems.`,
        { figHtml: EXAM }),
      Q(md`Box $0<x<a$, $0<y<b$, $0<z<c$; lid $z = c$ at $V_0$, other faces grounded. Which $z$-function multiplies $\sin(n\pi x/a)\sin(m\pi y/b)$?`,
        [md`$\sinh(n\pi z/a)$`, md`$\sin\!\left(\pi z\sqrt{n^2/a^2 + m^2/b^2}\right)$`, md`$e^{-\pi z\sqrt{n^2/a^2 + m^2/b^2}}$`, md`$\sinh\!\left(\pi z\sqrt{n^2/a^2 + m^2/b^2}\right)$`], 3,
        [md`That's the 2-D answer. In 3-D both transverse wavenumbers add: $k_z^2 = k_x^2 + k_y^2$.`,
          md`Two negative constants force the third to be positive: hyperbolic, not oscillating.`,
          md`The box is closed: $V(z = 0) = 0$ picks $\sinh$, and nothing goes to infinity.`, null],
        md`$X''/X + Y''/Y + Z''/Z = 0$ with $X''/X = -(n\pi/a)^2$ and $Y''/Y = -(m\pi/b)^2$ gives $Z''/Z = (n\pi/a)^2 + (m\pi/b)^2$. The lowest mode decays faster than in 2-D because it has to fit two directions at once.`,
        { figHtml: BOX3D }),
      Q(md`A long cylinder's surface ($s = R$) is held at $V_0\cos\phi$; there is nothing else and $V \to 0$ far away. What is $V$ outside?`,
        [md`$V_0\,(s/R)\cos\phi$`, md`$V_0\,(R/s)^2\cos\phi$`, md`$V_0\cos\phi + V_0\ln(s/R)$`, md`$V_0\,(R/s)\cos\phi$`], 3,
        [md`That's the inside answer. It grows without bound outside.`,
          md`In 2-D polar the radial powers are $s^{\pm n}$ with the same $n$ as $\cos n\phi$: here $n = 1$. $(R/s)^2$ is a 3-D (spherical) habit.`,
          md`A $\ln s$ term means net charge per length. The data averages to zero, so there is none; and $V_0\cos\phi$ alone doesn't decay.`, null],
        md`Outside, infinity is in the region: keep $s^{-n}$ only. The boundary is the single mode $\cos\phi$, so $V = V_0(R/s)\cos\phi$. It is a 2-D dipole field.`,
        { figHtml: EXT_COS }),

      R(md`
        ### Level 4: one twist
        One thing is different from the textbook: two nonzero faces, a non-constant profile, an insulating wall, a face at infinity, or a trap.
      `),
      Q(md`Slot: bottom plate grounded, top plate at $V_0$, end $x = 0$ grounded. What is the first step?`,
        [md`Subtract $V_0y/a$. The rest has grounded plates and end data $-V_0y/a$.`, md`Use $\sin(n\pi y/a)$ directly and fit the top plate.`, md`Use $\cosh$ in $y$.`, md`Expand $V_0$ along the top plate in a Fourier series in $x$.`], 0,
        [null, md`Every $\sin(n\pi y/a)$ is zero at $y = a$. No sum of them can be $V_0$ on the top plate.`,
          md`Then the plates aren't homogeneous and nothing quantizes $k$.`,
          md`The plate runs from $x = 0$ to $\infty$. There is no finite interval with homogeneous ends to build a Fourier series on.`],
        md`The live faces face each other along $y$, the direction that should oscillate. Remove that with the $k = 0$ solution $V_0y/a$ (the parallel-plate field). Then $V - V_0y/a$ is an ordinary slot problem with the end at $-V_0y/a$. Far down the slot $V \to V_0y/a$, as it must.`,
        { figHtml: SLOT_TOPV0 }),
      Q(md`Pipe $0<x<a$, $0<y<b$: sides $x = 0$ and $x = a$ both at $V_0$, top and bottom grounded. Which $x$-function goes with $\sin(n\pi y/b)$?`,
        [md`$\sinh(n\pi x/b)$`, md`$\cosh\!\big(n\pi(x - a/2)/b\big)$`, md`$e^{-n\pi x/b}$`, md`$\cos(n\pi x/a)$`], 1,
        [md`It vanishes at $x = 0$, which is live.`, null,
          md`That handles the face at $x = 0$ only. The face at $x = a$ is also live, and the box is closed there.`,
          md`$y$ already oscillates; $x$ must be hyperbolic.`],
        md`The problem is symmetric about $x = a/2$. Measured from the center line, the even hyperbolic function is $\cosh$. Normalised, the $x$ factor is $\cosh(k(x - a/2))/\cosh(ka/2)$, equal to $1$ on both live sides. Choosing the origin at the symmetry line lets symmetry pick the function for you.`,
        { figHtml: BOX_LR }),
      Q(md`Pipe $0<x<a$, $0<y<b$ with only the right side $x = a$ at $V_0$. A student writes $V = \sum C_n\sin(n\pi x/a)\sinh(n\pi y/a)$. Which condition rules this form out at once, whatever the $C_n$?`,
        [md`$V(x, 0) = 0$`, md`$V(0, y) = 0$`, md`$V(a, y) = V_0$`, md`$V(x, b) = 0$`], 2,
        [md`$\sinh 0 = 0$: satisfied.`, md`$\sin 0 = 0$: satisfied.`, null,
          md`This one fails for nonzero $C_n$ too, but $C_n = 0$ would satisfy it. No choice at all satisfies the live face.`],
        md`$\sin(n\pi) = 0$, so every term vanishes on the live face. The sine went in the wrong direction. The homogeneous pair facing each other is $y = 0$ and $y = b$, so the answer is $\sum C_n\sin(n\pi y/b)\sinh(n\pi x/b)$. Before computing anything, check that your form can be nonzero on the live face.`,
        { figHtml: BOX_R }),
      Q(md`Slot end held at $V_0\sin^2(\pi y/a)$. Which $n$ appear in the sine series?`,
        [md`$n = 0$ and $n = 2$ only, since $\sin^2 u = \frac12(1 - \cos 2u)$`, md`$n = 2$ only`, md`All $n$`, md`Odd $n$ only, infinitely many`], 3,
        [md`That's a **cosine** identity. Constants and $\cos(2\pi y/a)$ aren't in the allowed set: they don't vanish at the plates.`,
          md`$\sin(2\pi y/a)$ is odd about the midline; the data is even about it.`,
          md`The data is symmetric about $y = a/2$, which kills every even $n$.`, null],
        md`You must expand in the functions the plates allow, $\sin(n\pi y/a)$. The coefficients are $\frac{8V_0}{3\pi}, 0, -\frac{8V_0}{15\pi}, 0, -\frac{8V_0}{105\pi}, \ldots$: odd $n$ only, falling like $1/n^3$ because the data and its slope are continuous at the plates. Only data already shaped like $\sin(n\pi y/a)$ gives a single term.`,
        { figHtml: SLOT_SIN2 }),
      Q(md`Slot end held at $V_0$ for $0<y<a/3$ and grounded for $a/3<y<a$. Which coefficients vanish?`,
        [md`All even $n$`, md`$n = 3, 6, 9, \ldots$`, md`$n = 6, 12, 18, \ldots$`, md`None`], 2,
        [md`$C_2 \propto 1 - \cos(2\pi/3) = 1.5 \ne 0$. The data has no symmetry about the midline.`,
          md`$C_3 \propto 1 - \cos\pi = 2 \ne 0$.`, null,
          md`$C_6 \propto 1 - \cos 2\pi = 0$.`],
        md`$C_n = \frac{2}{a}\int_0^{a/3} V_0\sin\frac{n\pi y}{a}dy = \frac{2V_0}{n\pi}\left(1 - \cos\frac{n\pi}{3}\right)$, zero exactly when $n/6$ is an integer. Those modes complete whole periods over the live strip.`,
        { figHtml: SLOT_STEP3 }),
      Q(md`Box $0<x<a$, $0<y<b$: side walls insulating ($\partial V/\partial x = 0$), bottom grounded, top held at some $V_0(x)$. Which $x$-functions?`,
        [md`$\sin(n\pi x/a)$, $n \ge 1$`, md`$\cos(n\pi x/a)$, $n \ge 1$`, md`$\cos(n\pi x/a)$, $n \ge 0$, with the $n = 0$ term paired with $A + By$`, md`$\cosh$ in $x$`], 2,
        [md`$\sin$ has nonzero slope at $x = 0$ and $x = a$, which violates $\partial V/\partial x = 0$.`,
          md`This misses $n = 0$. Without it you can't represent the average of $V_0(x)$.`, null,
          md`$\cosh$ has zero slope at only one point; it can't satisfy both walls.`],
        md`Zero slope at both ends gives $\cos(n\pi x/a)$, and now $n = 0$ (a constant) is allowed. Its partner in $y$ is the $k = 0$ solution $A + By$, and $V(x, 0) = 0$ leaves $By$. The top data's average feeds this linear term; the rest feeds the $\cos\cdot\sinh$ terms.`,
        { figHtml: BOX_NEU }),
      Q(md`Same box with insulating side walls, bottom grounded, and the top at a **constant** $V_0$. What is $V$?`,
        [md`$V_0y/b$, exactly`, md`$\sum_{n\ \text{odd}}\frac{4V_0}{n\pi}\sin\frac{n\pi x}{a}\frac{\sinh(n\pi y/a)}{\sinh(n\pi b/a)}$`, md`$V_0$`, md`$V_0y/b$ plus a cosine series with coefficients $4V_0/(n\pi)$`], 0,
        [null, md`That's the answer for **grounded** side walls. Here the walls have $\partial V/\partial x = 0$, and this sum doesn't.`,
          md`It isn't $0$ on the grounded bottom.`,
          md`A constant has zero $\cos(n\pi x/a)$ content for $n \ge 1$.`],
        md`Only the $n = 0$ mode is needed. $V_0y/b$ satisfies Laplace, both insulating walls (no $x$ dependence), $V = 0$ at the bottom and $V_0$ at the top. Uniqueness says it is the answer: the field is uniform and parallel to the insulating walls, which is exactly what "no flux through the wall" means.`,
        { figHtml: BOX_NEU0 }),
      Q(md`Pie slice $0<r<b$, $0<\theta<\alpha$: wall $\theta = 0$ grounded, wall $\theta = \alpha$ insulating ($\partial_\theta\Phi = 0$), arc at $V_0$. Which angular functions?`,
        [md`$\sin(n\pi\theta/\alpha)$`, md`$\sin\!\big((n - \tfrac12)\pi\theta/\alpha\big)$`, md`$\cos(n\pi\theta/\alpha)$`, md`$\sin(2n\pi\theta/\alpha)$`], 1,
        [md`Its slope at $\theta = \alpha$ is $\propto\cos n\pi = \pm1 \ne 0$.`, null,
          md`It doesn't vanish on the grounded wall $\theta = 0$.`,
          md`That is still zero at $\theta = \alpha$ in value, not in slope.`],
        md`$\Theta = \sin k\theta$ (grounded at $0$) with $\cos k\alpha = 0$ (zero slope at $\alpha$): $k = (n - \frac12)\pi/\alpha$, a quarter wave. Equivalently: an insulating wall acts like a mirror. This wedge is half of a wedge of opening $2\alpha$ with both walls grounded, cut along its symmetry line.`,
        { figHtml: NEU_PIE }),
      Q(md`Box $0<x<a$, $0<y<b$: bottom at $V_0(x)$, the other sides grounded. The $y$-factor is $\dfrac{\sinh(n\pi(b - y)/a)}{\sinh(n\pi b/a)}$. What does it become as $b \to \infty$?`,
        [md`$1$`, md`$\sinh(n\pi y/a)$`, md`$\cosh(n\pi y/a)$`, md`$e^{-n\pi y/a}$`], 3,
        [md`Then $V$ wouldn't decay away from the live face, and the far wall's $V = 0$ would be lost.`,
          md`That grows with $y$; it belongs to a live face at the top.`, md`$\cosh$ grows with $y$ and never vanishes, so it can't decay away from the live face.`, null],
        md`$\dfrac{\sinh(k(b - y))}{\sinh kb} = \dfrac{e^{k(b - y)} - e^{-k(b-y)}}{e^{kb} - e^{-kb}} \to e^{-ky}$. Sending a grounded face to infinity turns $\sinh$ into a decaying exponential: the closed box becomes the slot.`,
        { figHtml: BOX_FAR }),
      Q(md`Near the vertex of a wedge-shaped field region with both walls at the same potential, $|\vb E| \propto r^{\pi/\alpha - 1}$. For which opening is the field at the vertex finite and nonzero?`,
        [md`(A), $\alpha = \pi/2$`, md`(B), $\alpha = \pi$`, md`(C), $\alpha = 3\pi/2$`, md`None of them`], 1,
        [md`$r^{2 - 1} = r \to 0$: the field vanishes in a concave corner.`, null,
          md`$r^{2/3 - 1} = r^{-1/3}$: it diverges at a convex edge. That's why sharp edges spark.`,
          md`(B) works: $r^0$.`],
        md`$\alpha = \pi$ is a flat plane, so the vertex is just a point on a flat conductor: the field there is finite and nonzero, $\Phi \approx c\,r\sin\theta = c\,y$. Sharper inward corners ($\alpha < \pi$) shield, outward edges ($\alpha > \pi$) concentrate.`,
        { figHtml: WEDGE_TIPS.svg }),
      Q(md`Why is the $\phi$ term (the $k = 0$ angular solution $C + D\phi$) dropped to just $C$ in a full annulus, but kept as $V_0\theta/\alpha$ in a wedge?`,
        [md`In a full circle $\phi$ and $\phi + 2\pi$ are the same point, so $V$ must be periodic, and $D\phi$ is not.`, md`$\phi$ isn't harmonic.`, md`$\phi$ blows up at the origin.`, md`Because the boundary data are even in $\phi$.`], 0,
        [null, md`It is: $\frac{1}{s^2}\partial_\phi^2\phi = 0$.`,
          md`The origin isn't in the annulus, and $\phi$ is bounded anyway.`,
          md`Periodicity rules it out for any data, even or not.`],
        md`Single-valuedness is a boundary condition in disguise: it replaces the two walls of a wedge. It also forces $k = n$, an integer. A wedge has real walls instead, so $\theta$ is a genuine coordinate on an interval and $D\theta$ is allowed.`,
        { figHtml: ANN }),
      Q(md`Slot: both plates at $V_0$, the end $x = 0$ grounded. What is $V$?`,
        [md`$V_{\text{slot}}(x, y)$, the standard answer with the end at $V_0$`, md`$V_0e^{-\pi x/a}$`, md`$V_0$ everywhere`, md`$V_0 - V_{\text{slot}}(x, y)$`], 3,
        [md`That has the potentials reversed: $V_0$ on the end and $0$ on the plates.`,
          md`It isn't harmonic ($\partial_x^2$ gives $(\pi/a)^2V \ne 0$ with nothing to cancel it), and it equals $V_0$ on the grounded end.`,
          md`The end is grounded.`, null],
        md`Constant $V_0$ minus the standard slot: plates $V_0 - 0 = V_0$, end $V_0 - V_0 = 0$, and far away $V \to V_0$. Adding a constant is the cheapest superposition there is.`,
        { figHtml: SLOT_PLATES }),
      Q(md`A student writes $\Phi = \sum C_n\sin(n\pi\theta/\alpha)(r/b)^{n\pi/\alpha}$ for the exam sector. Which BC does it violate?`,
        [md`$\Phi(r, 0) = 0$`, md`$\Phi(a, \theta) = 0$`, md`$\Phi(b, \theta) = V_0$`, md`$\Phi$ finite at $r = 0$`], 1,
        [md`$\sin 0 = 0$: satisfied.`, null,
          md`$C_n = 4V_0/(n\pi)$ (odd $n$) matches it.`,
          md`$r = 0$ isn't in the region, so this isn't a condition at all.`],
        md`That's the pie-slice answer. At $r = a$ it gives $\sum C_n(a/b)^{k}\sin k\theta \ne 0$. With an inner arc you need both $r^{k}$ and $r^{-k}$, combined to vanish at $r = a$: $(r/a)^k - (a/r)^k$.`,
        { figHtml: EXAM }),

      R(md`
        ### Level 5: exam level
        Reason about the exam sector and the box without computing. Most exam points are for these steps.
      `),
      Q(md`In the exam sector, which BC fixes the ratio of the $r^{k}$ and $r^{-k}$ pieces?`,
        [md`$\Phi(a, \theta) = 0$`, md`$\Phi(b, \theta) = V_0$`, md`The walls`, md`Finiteness at $r = 0$`], 0,
        [null, md`That sets the overall size $C_n$ of each mode, after the shape is fixed.`,
          md`The walls fix $k$, not the radial mix.`, md`$r = 0$ is outside the region.`],
        md`Each mode is $\sin k\theta\,(A_nr^k + B_nr^{-k})$. BC $\Phi(a,\theta)=0$ gives $B_n = -A_na^{2k}$ for every $n$, which is the combination $(r/a)^k - (a/r)^k$. Then $\Phi(b,\theta) = V_0$ fixes the remaining constant.`,
        { figHtml: EXAM }),
      Q(md`Exam sector with $\alpha = \pi/2$, $b = 2a$. Rank $\Phi$ at $P = (1.9a, \pi/4)$, $Q = (1.5a, \pi/4)$, $R = (1.9a, \pi/20)$ without computing.`,
        [md`$P > Q > R$`, md`$P > R > Q$`, md`$Q > P > R$`, md`$R > P > Q$`], 1,
        [md`$R$ is $0.1a$ from the live arc and $0.3a$ from the grounded wall: it is much nearer $V_0$ than $Q$, which sits midway between the arcs.`, null,
          md`$Q$ is farther from the live arc than $P$, with the same distance to the walls.`,
          md`$R$ and $P$ are equally close to the live arc, but $R$ is also near a grounded wall.`],
        md`Near a face, $\Phi$ is close to that face's value. $P$: $0.1a$ from the arc, far from both walls, $\Phi = 0.917V_0$. $R$: $0.1a$ from the arc but $0.30a$ from a grounded wall, $\Phi = 0.790V_0$. $Q$: halfway between the arcs, $\Phi = 0.550V_0$. Use this to sanity-check any computed value.`,
        { figHtml: EXAM_PTS }),
      Q(md`In a narrow sector ($\alpha \ll 1$, walls grounded, outer arc live), the first mode $(r/b)^{\pi/\alpha}$ falls by a factor $e$ over what distance in from the live arc?`,
        [md`$b\alpha/\pi$: the arc's width divided by $\pi$`, md`$b/\pi$`, md`$b\alpha$`, md`$b\pi/\alpha$`], 0,
        [null, md`That ignores the opening. A narrower wedge confines the field more, so the decay must depend on $\alpha$.`,
          md`That's the width of the arc itself, missing the factor $1/\pi$.`, md`That grows as the wedge narrows, backwards.`],
        md`$(r/b)^{\pi/\alpha} = e^{-1}$ when $\ln(b/r) = \alpha/\pi$, so $b - r \approx b\alpha/\pi$. The arc's width is $b\alpha$, so the decay length is (width)$/\pi$, the same rule as the slot's $a/\pi$. A narrow wedge looks like a slot.`,
        { figHtml: NARROW }),
      Q(md`Four problems in the exam sector: only the outer arc at $V_0$; only the inner arc at $V_0$; only the wall $\theta = 0$ at $V_0$; only $\theta = \alpha$ at $V_0$ (the rest grounded each time). What is the sum of the four solutions?`,
        [md`$4V_0$`, md`$0$`, md`$V_0$ everywhere in the sector`, md`$V_0$ on the boundary only`], 2,
        [md`Each face is live in exactly one of the four problems, so the boundary values add to $V_0$, not $4V_0$.`,
          md`The boundary values add to $V_0$ on every face.`, null,
          md`The sum solves Laplace with $V_0$ on the whole boundary, and by uniqueness that's $V_0$ inside too.`],
        md`This is the cheap check from the square pipe, in polar form. It also gives a free answer: (wall $\theta = \alpha$ live) $= V_0 - $ (the other three).`,
        { figHtml: EXAM }),
      Q(md`Partial sums of the exam series, evaluated on the live arc near the corner $\theta \to 0$, peak at about what value once you keep more than a few dozen terms?`,
        [md`$V_0$`, md`$1.09\,V_0$`, md`$1.18\,V_0$`, md`They grow without bound as you add terms`], 2,
        [md`The convergence isn't uniform near a jump: the overshoot persists.`,
          md`$9\%$ is of the **jump**. The odd extension jumps from $-V_0$ to $+V_0$, a jump of $2V_0$, so the overshoot is $0.18V_0$.`, null,
          md`The peak stays bounded; it only moves toward the corner as $N$ grows.`],
        md`This is the Gibbs phenomenon: $\max\frac{4}{\pi}\sum_{n\ \text{odd}}^{N}\frac{\sin n\theta}{n} \to 1.179$. Numerically: $1.1791$ for $N = 51$ and $1.1790$ for $N = 201$. Inside the region ($r < b$) the factor $(r/b)^k$ damps it away.`,
        { figHtml: EXAM }),
      Q(md`Which statement about the exam-sector series is true?`,
        [md`At the corner $r = b$, $\theta = 0$ it converges to $V_0$.`, md`Inside ($a<r<b$) the terms fall geometrically, like $(r/b)^{n\pi/\alpha}/n$, so it converges fast except near the live arc.`, md`On the live arc it converges uniformly to $V_0$.`, md`It converges only for $r < b$ and diverges on the arc.`], 1,
        [md`Every term has $\sin 0 = 0$, so it gives $0$ there: the midpoint of the odd extension's jump from $-V_0$ to $V_0$.`, null,
          md`Not near the corners, where Gibbs overshoot persists.`,
          md`On the arc it is the Fourier sine series of $V_0$, which converges (slowly) to $V_0$ at every $\theta$ strictly between the walls.`],
        md`At $r < b$ the radial factor is about $(r/b)^k$, a geometric damping. On the arc, $r = b$, only the slow $1/n$ of the Fourier coefficients remains. The closer a point is to the live arc, the more terms you need.`,
        { figHtml: EXAM }),
      Q(md`Exam sector with the outer arc at $V_0\sin(\pi\theta/\alpha)$ instead of $V_0$. With $k = \pi/\alpha$, what is $\Phi$ at $P$ ($r = \sqrt{ab}$, $\theta = \alpha/2$)?`,
        [md`$V_0/2$`, md`$V_0(a/b)^{k/2}$`, md`$\dfrac{4V_0}{\pi}\dfrac{1}{(b/a)^{k/2} + (a/b)^{k/2}}$`, md`$\dfrac{V_0}{(b/a)^{k/2} + (a/b)^{k/2}}$`], 3,
        [md`The radial factor isn't linear. At $\sqrt{ab}$ it is $1/[(b/a)^{k/2} + (a/b)^{k/2}] < 1/2$.`,
          md`That's the pie-slice factor $(r/b)^k$, which ignores the grounded inner arc.`,
          md`The data is a single mode with coefficient $V_0$; the $4/\pi$ belongs to constant data.`, null],
        md`One term: $\Phi = V_0\sin k\theta\,\dfrac{(r/a)^k - (a/r)^k}{(b/a)^k - (a/b)^k}$. At $r = \sqrt{ab}$ write $u = (b/a)^{k/2}$: the ratio is $\dfrac{u - 1/u}{u^2 - 1/u^2} = \dfrac{1}{u + 1/u}$. For $k = 2$, $b = 2a$: $0.4V_0$.`,
        { figHtml: EXAM_SIN }),
      Q(md`Square pipe: left side $V_0$, top $V_0$, right side $-V_0$, bottom grounded (insulated at the corners). What is $V$ at the center $C$?`,
        [md`$V_0/2$`, md`$0$`, md`$3V_0/4$`, md`$V_0/4$`], 3,
        [md`That counts only the two $+V_0$ sides.`, md`The $-V_0$ side cancels only one of the two $+V_0$ sides.`, md`That ignores the sign of the right side.`, null],
        md`Each side contributes a quarter of its potential at the center: $\frac14(V_0 + V_0 - V_0 + 0) = V_0/4$.`,
        { figHtml: SQ_4 }),
      Q(md`End profiles for a slot, all with the same height $V_0$. For which ones do the Fourier coefficients fall like $1/n$ (the slowest)?`,
        [md`(A) and (B)`, md`(B) and (C)`, md`(C) only`, md`(A) only`], 0,
        [null, md`The tent (C) is continuous and zero at both plates; only its slope jumps, so its coefficients fall like $1/n^2$.`,
          md`(C) is the faster one ($1/n^2$), and (D) is a single term.`,
          md`The ramp (B) reaches $V_0$ at $y = a$, where the plate is at $0$: that's a jump too.`],
        md`What matters is the odd extension: a jump in value gives $1/n$, a jump in slope gives $1/n^2$. Constant: $\frac{4V_0}{n\pi}$ (odd $n$). Ramp: $\frac{2V_0}{n\pi}(-1)^{n+1}$. Tent: $\frac{8V_0}{n^2\pi^2}\sin\frac{n\pi}{2}$. One sine: $C_1 = V_0$ and nothing else.`,
        { figHtml: SHAPES.svg }),
      Q(md`A long box with square cross-section $a\times a$ and depth $c \gg a$ has its lid at $V_0$ and all other faces grounded. Far below the lid (depth $d$ below it, $a \ll d$, and still many $a$ above the bottom), $V$ falls like:`,
        [md`$e^{-\pi d/a}$`, md`$e^{-2\pi d/a}$`, md`$e^{-\sqrt2\,\pi d/a}$`, md`$1/d$`], 2,
        [md`That's the 2-D slot. Here the lowest mode is $\sin(\pi x/a)\sin(\pi y/a)$, with two transverse wavenumbers.`,
          md`That would be the $(n, m) = (2, 0)$ wavenumber, which isn't an allowed mode; and even $n$ vanish for a constant lid.`, null,
          md`Power laws come from open space. A closed metal tube cuts the field off exponentially.`],
        md`$k = \pi\sqrt{n^2 + m^2}/a$, lowest at $n = m = 1$: $\sqrt2\,\pi/a$. A 3-D pipe screens faster than a 2-D slot of the same width.`,
        { figHtml: BOX3D_DEEP }),
      Q(md`Exam sector ($\alpha = \pi/2$, $b = 2a$). Which point needs the most terms for $1\%$ accuracy?`,
        [md`$A$, at $r = 1.2a$`, md`$B$, at $r = 1.5a$`, md`$C$, at $r = 1.99a$`, md`They all need the same number`], 2,
        [md`Near the grounded arc the terms fall like $(r/b)^{2n} \approx 0.36^n$: two terms suffice.`,
          md`Three terms are enough here.`, null,
          md`The damping factor $(r/b)^k$ depends on $r$, so the count does too.`],
        md`The $n$-th term is about $\frac{4}{n\pi}(r/b)^{2n}$. At $r = 1.99a$ that's $0.995^{2n}/n$, which barely decays: $22$ nonzero terms for $1\%$, versus $8$ at $1.9a$, $3$ at $1.5a$, $2$ at $1.2a$. Points close to the live face are expensive.`,
        { figHtml: EXAM_NEAR }),
      Q(md`Two exam sectors with the same $a$ and $b = 2a$ but openings $\alpha = \pi/2$ and $\alpha = \pi/4$. Compare $\Phi$ on the bisector at $r = 1.5a$.`,
        [md`They're equal: $\Phi$ on the bisector depends only on $r$.`, md`Larger for $\alpha = \pi/4$`, md`Larger for $\alpha = \pi/2$`, md`It depends on $V_0$.`], 2,
        [md`The walls are grounded, and a narrower wedge puts them closer to the point.`,
          md`Backwards: closer grounded walls pull $\Phi$ down.`, null,
          md`Both are proportional to $V_0$; the ratio is fixed.`],
        md`$k = n\pi/\alpha$ is larger for the narrow wedge, so $(r/b)^k$ dies faster away from the live arc. Numbers: $0.550V_0$ for $\alpha = \pi/2$, $0.376V_0$ for $\alpha = \pi/4$.`,
        { figHtml: EXAM }),

      R(md`
        ### Level 6: harder than the exam
        Symmetry tricks, singular corners, Neumann data, single-valuedness and limits. Each needs one idea that isn't in the recipe.
      `),
      Q(md`In the exam sector, what is the total charge per unit length on the grounded wall $\theta = 0$ (ideal, zero-width gaps)?`,
        [md`Finite and negative`, md`Zero`, md`Infinite: $\sigma \propto 1/(\text{distance to the corner at } r = b)$, whose integral diverges logarithmically`, md`Finite and positive`], 2,
        [md`$\sigma$ is negative, but its integral doesn't converge.`,
          md`$\sigma < 0$ everywhere on the wall (it faces a region at higher potential).`, null,
          md`The wall is grounded and faces higher potential, so $\sigma < 0$.`],
        md`Near the corner where the grounded wall meets the live arc, the region looks like a quarter-plane with walls at $0$ and $V_0$: $\Phi \approx V_0\cdot\frac{\text{angle}}{\pi/2}$, so $E \propto 1/\rho$ and $\int\sigma\,d\rho$ diverges like $\ln\rho$. In the series, with $\Phi = \sum C_n\sin k\theta\,[(r/a)^k - (a/r)^k]$ and $C_n = \dfrac{4V_0}{n\pi[(b/a)^k - (a/b)^k]}$, integrating $\sigma = -\dfrac{\varepsilon_0}{r}\partial_\theta\Phi\big|_{\theta=0}$ from $a$ to $b$ gives $\lambda = -\varepsilon_0\sum C_n[(b/a)^k + (a/b)^k - 2]$, whose terms tend to $4V_0/(n\pi)$: a harmonic series. Partial sums grow by about $1.47\,\varepsilon_0V_0$ per decade of $N$. A real gap of width $g$ makes it finite, $\propto\ln(b/g)$.`,
        { figHtml: EXAM }),
      Q(md`Sector $a<r<b$ with $b = 3a$, $\alpha = \pi/3$: wall $\theta = 0$ and the inner arc grounded, wall $\theta = \alpha$ and the outer arc at $V_0$. What is $\Phi$ at $P = (\sqrt3\,a, \pi/6)$?`,
        [md`$V_0/2$, by symmetry`, md`Less than $V_0/2$, because $P$ is nearer the grounded inner arc ($0.73a$ vs $1.27a$)`, md`$V_0/3$`, md`It can't be found without summing the series`], 0,
        [null, md`Distance in $r$ is the wrong measure. Laplace in polar form is symmetric in $\ln r$, and $\sqrt{ab}$ is halfway in $\ln r$.`,
          md`There's no reason for $1/3$.`, md`A symmetry gives it exactly.`],
        md`Map $\theta \to \alpha - \theta$ and $r \to ab/r$ (inversion through $\sqrt{ab}$). Both maps preserve Laplace in 2-D and swap the grounded faces with the live ones. So $V_0 - \Phi$ solves the same problem, and uniqueness gives $\Phi(r, \theta) = V_0 - \Phi(ab/r, \alpha - \theta)$. At the fixed point $(\sqrt{ab}, \alpha/2)$, $\Phi = V_0/2$. The series confirms it: $0.50000$.`,
        { figHtml: SECTOR_SYM }),
      Q(md`$\Phi_{\text{out}}$: outer arc live; $\Phi_{\text{in}}$: inner arc live (walls and the other arc grounded), with $b = 2a$. Which equals $\Phi_{\text{out}}(1.5a, \theta)$?`,
        [md`$\Phi_{\text{in}}(1.5a, \theta)$`, md`$\Phi_{\text{in}}(4a/3, \theta)$`, md`$V_0 - \Phi_{\text{in}}(1.5a, \theta)$`, md`$\Phi_{\text{in}}(3a/4, \theta)$`], 1,
        [md`At the same point the live face is near in one problem and far in the other; they're not equal.`, null,
          md`The walls are grounded in both problems, so the two don't add to $V_0$.`,
          md`$3a/4$ is outside the region. The inversion is through $\sqrt{ab}$, not $a$.`],
        md`Under $r \to ab/r$, $\left(\frac{b}{r}\right)^k - \left(\frac{r}{b}\right)^k \to \left(\frac{r}{a}\right)^k - \left(\frac{a}{r}\right)^k$: the inner-live radial factor becomes the outer-live one. With $ab = 2a^2$, $1.5a \to 4a/3$.`,
        { figHtml: INV.svg }),
      Q(md`Pie slice: wall $\theta = 0$ grounded, wall $\theta = \alpha$ and the arc both at $V_0$ (insulated at the corners). How does $|\vb E|$ behave at the tip?`,
        [md`Vanishes like $r^{\pi/\alpha - 1}$`, md`Finite`, md`Diverges like $r^{\pi/\alpha - 1}$ only when $\alpha > \pi$`, md`Diverges like $1/r$ for every $\alpha$`], 3,
        [md`That's when both walls are at the same potential. Here the $V_0\theta/\alpha$ term is present.`,
          md`$E_\theta = -\frac1r\partial_\theta(V_0\theta/\alpha) = -V_0/(\alpha r)$ is infinite at the tip.`,
          md`The $1/r$ piece doesn't care about $\alpha$.`, null],
        md`$\Phi = V_0\theta/\alpha + \sum c_n(r/b)^{n\pi/\alpha}\sin(n\pi\theta/\alpha)$. The series terms are tame at the tip, but the $k = 0$ piece gives $|\vb E| = V_0/(\alpha r)$. Two conductors at different potentials meeting at a point always give a $1/r$ field (and an infinite total charge, finite only because real gaps have width).`,
        { figHtml: PIE_TWO }),
      Q(md`Box $a\times b$, insulating side walls, bottom grounded, top at $V_0x/a$. What is $V$ on the midline $x = a/2$?`,
        [md`$V_0y/(2b)$ exactly`, md`$V_0y/(2b)$ plus small $\sinh$ corrections`, md`$V_0/2$ for all $y$`, md`$\frac{V_0}{2}\frac{\sinh(\pi y/a)}{\sinh(\pi b/a)}$`], 0,
        [null, md`The corrections are $c_n\cos(n\pi/2)\sinh(\ldots)$. Odd $n$ have $\cos(n\pi/2) = 0$, and even-$n$ coefficients of $x/a$ vanish.`,
          md`$V$ must be $0$ at the grounded bottom.`, md`That's a one-mode guess with the wrong $x$-function.`],
        md`$V = \frac{V_0}{2}\frac{y}{b} + \sum c_n\cos\frac{n\pi x}{a}\frac{\sinh(n\pi y/a)}{\sinh(n\pi b/a)}$ with $c_n = -\frac{4V_0}{n^2\pi^2}$ for odd $n$ and $0$ for even $n$. On $x = a/2$ every surviving cosine is zero. Equivalently: $V - \frac{V_0y}{2b}$ is odd about $x = a/2$.`,
        { figHtml: BOX_NEULIN }),
      Q(md`A disk-shaped region of radius $R$ (no charge inside) has $V(R, \phi) = V_0\,\phi/2\pi$ for $0 \le \phi < 2\pi$, a ramp with a jump at $\phi = 0$. What is $V$ at the center?`,
        [md`$0$`, md`$V_0/\pi$`, md`Undefined, because the data jumps at $\phi = 0$`, md`$V_0/2$`], 3,
        [md`$0$ is the value at only one boundary point; the center sees the whole circle.`,
          md`No such factor: the center value is a plain average.`,
          md`The jump is on the boundary. Inside, $V$ is smooth.`, null],
        md`Only $s^0$ survives at $s = 0$, and its coefficient is the average of the boundary data: $\frac{1}{2\pi}\int_0^{2\pi}\frac{V_0\phi}{2\pi}d\phi = V_0/2$. You can't use a $D\phi$ term for the ramp: periodicity forbids it, so the ramp goes into the Fourier series as $\frac{V_0}{2} - \sum\frac{V_0}{n\pi}(s/R)^n\sin n\phi$.`,
        { figHtml: DISK_RAMP }),
      Q(md`Square pipe, top at $V_0$, side $x = 0$ grounded. Very close to the top-left corner (distance $\rho \ll a$), with $\phi$ measured from the grounded side as drawn, $V \approx$ ?`,
        [md`$V_0/2$ in every direction`, md`$V_0\,\phi/(\pi/2)$`, md`$0$, because every term of the series vanishes at the corner`, md`$V_0\,\rho/a$`], 1,
        [md`The value depends on the direction from which you approach the corner.`, null,
          md`The series gives $0$ **at** the corner, but the limit from inside depends on the direction.`,
          md`The leading behaviour near the corner doesn't depend on $\rho$.`],
        md`Zoom in: the corner is a wedge of opening $\pi/2$ with one wall at $0$ and the other at $V_0$. Its $k = 0$ solution is $V_0\phi/(\pi/2)$, and every other mode carries a positive power of $\rho$. Numerically at $\rho = 0.002a$: $\phi = \pi/8, \pi/4, 3\pi/8$ give $0.250, 0.500, 0.750\ V_0$. Cartesian corners are polar wedges.`,
        { figHtml: SQ_CORNER }),
      Q(md`Box $0<x<2a$, $0<y<a$: top at $V_0$, the rest grounded. Without a series, $V$ at the center $C$ is:`,
        [md`exactly $V_0/4$`, md`less than $V_0/4$`, md`between $V_0/4$ and $V_0/2$`, md`more than $V_0/2$`], 2,
        [md`The square argument needs all four sides equivalent at the center. Here the long sides are closer to $C$ than the short ones.`,
          md`The top is one of the two nearest sides, so it contributes more than a short side.`, null,
          md`Top and bottom contribute equally, and both sides contribute something, so $2T < V_0$.`],
        md`Superpose the four one-side problems: $2T + 2S = V_0$, where $T$ is a long side's contribution at $C$ and $S$ a short side's. The long sides are nearer and bigger, so $T > S$, hence $V_0/4 < T < V_0/2$. The series gives $T = 0.445V_0$ (and $S = 0.055V_0$).`,
        { figHtml: WIDE_BOX }),
      Q(md`Pie region of opening $\alpha = 3\pi/2$ (outside a right-angle metal corner), walls grounded, arc $r = b$ at $V_0$. What is the lowest mode, and what does the field do at the vertex?`,
        [md`$r^{2/3}\sin(2\theta/3)$; $|\vb E| \propto r^{-1/3}$, infinite`, md`$r^{2}\sin 2\theta$; $|\vb E| \propto r$, zero`, md`$r^{3/2}\sin(3\theta/2)$; $|\vb E| \propto r^{1/2}$, zero`, md`$r^{-2/3}\sin(2\theta/3)$; $|\vb E| \propto r^{-5/3}$`], 0,
        [null, md`That's the inside corner, $\alpha = \pi/2$.`,
          md`$k = \pi/\alpha = 2/3$, not $3/2$.`,
          md`$r^{-k}$ blows up at the vertex, which is in the region, so it's dropped. The field itself still diverges, but more weakly.`],
        md`$k = \pi/\alpha = 2/3 < 1$. $\Phi \propto r^{2/3}$ is finite at the vertex, but its slope isn't: $|\vb E| \propto r^{-1/3}$. Outside corners concentrate charge and field; this is the lightning-rod effect in its mildest form.`,
        { figHtml: REENTRANT }),
      Q(md`A rod (radius $a$) sits inside a grounded coaxial shell (radius $b$). A grounded flat metal wall joins them along $\phi = 0$, and the rod is held at $V_0$ (insulated from the wall). Which angular functions does the region $a<s<b$, $0<\phi<2\pi$ need?`,
        [md`$\sin n\phi$ and $\cos n\phi$ with integer $n$, as for any full annulus`, md`$\sin(n\phi/2)$, $n = 1, 2, \ldots$`, md`Only the $\ln s$ term: the rod alone has no $\phi$ dependence`, md`$\sin(2n\phi)$`], 1,
        [md`The cut removes single-valuedness: $\phi = 0$ and $\phi = 2\pi$ are now two different faces of the wall.`, null,
          md`The grounded wall at $\phi = 0$ forces $V = 0$ there, so $V$ must depend on $\phi$.`,
          md`$\sin(2n\phi)$ also vanishes at $\phi = \pi/2$, where nothing is grounded: that throws away needed modes.`],
        md`With the wall, the region is a wedge of opening $\alpha = 2\pi$: $k = n\pi/\alpha = n/2$. Half-integer modes such as $\sin(\phi/2)$ appear. A full circle forbids them because they change sign under $\phi \to \phi + 2\pi$; the wall is what makes them legal. The $k = 0$ piece $C + D\phi$ is killed by the two grounded faces of the wall.`,
        { figHtml: CUT_ANN }),
    ],
  };

  // ================================================================ numerics for the solution plots
  const C12 = (n) => (n % 2 ? 4 / (n * PI) / (1 - Math.pow(4, -2 * n)) : 0);            // exam sector, alpha = pi/2, b = 2a; multiplies (r/b)^{2n} - (a^2/(r b))^{2n}...
  const examPhi = (r, t, N = 400) => { let s = 0; for (let n = 1; n <= N; n += 2) s += C12(n) * Math.sin(2 * n * t) * (Math.pow(r / 2, 2 * n) - Math.pow(1 / (2 * r), 2 * n)); return s; };
  const examPartial = (r, t, M) => { let s = 0; for (let m = 1; m <= M; m++) { const n = 2 * m - 1; s += C12(n) * Math.sin(2 * n * t) * (Math.pow(r / 2, 2 * n) - Math.pow(1 / (2 * r), 2 * n)); } return s; };
  const sigWall = (r) => { let s = 0; for (let n = 1; n <= 801; n += 2) s += C12(n) * 2 * n * (Math.pow(r / 2, 2 * n) + 0 - Math.pow(1 / (2 * r), 2 * n)); return -s / r; };

  // ================================================================ problem figures
  const P1F = wedge({ al: 45, b: 160, w0: 'V=0', wA: 'V=0', outer: 'V_0\\sin4\\theta', angLab: '\\pi/4' });
  const P1S = wedge({ al: 45, b: 160, w0: '\\#1\\;\\Phi=0', wA: '\\#2\\;\\Phi=0', outer: '\\#4\\;\\Phi=V_0\\sin4\\theta', angLab: '\\pi/4', O: false, extra: (f) => put(f, 0, 0, '\\#3\\;\\Phi\\text{ finite}', ['bl', 'l', 'b'], 6, 'small') });
  const P2F = wedge({ al: 180, a: 55, b: 110, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', angLab: '\\pi', ticks: true, pts: [[82.5, 90, 'P', 'tr']] });
  const P2S = wedge({ al: 180, a: 55, b: 110, w0: '\\#1', wA: '\\#2', inner: '\\#3', outer: '\\#4\\;\\Phi=V_0', angLab: '\\pi', O: false });
  const P3F = rbox({ w: 130, h: 130, T: 'V_0\\sin(\\pi x/a)', R: 'V_0\\sin(\\pi y/a)', L: '0', B: '0', xt: 'a', yt: 'a', pts: [[65, 65, 'C', ['br', 'tr']], [65, 97.5, 'P', ['tr', 'br']]] });
  const P3S = PF.row([
    { svg: rbox({ w: 110, h: 110, T: 'V_0\\sin(\\pi x/a)', R: '0', L: '0', B: '0', axes: false }), cap: '$V_A = V_0\\sin\\frac{\\pi x}{a}\\dfrac{\\sinh(\\pi y/a)}{\\sinh\\pi}$' },
    { svg: rbox({ w: 110, h: 110, T: '0', R: 'V_0\\sin(\\pi y/a)', L: '0', B: '0', axes: false }), cap: '$V_B = V_0\\sin\\frac{\\pi y}{a}\\dfrac{\\sinh(\\pi x/a)}{\\sinh\\pi}$' },
  ]);
  const P4F = wedge({ al: 60, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', angLab: '\\pi/3', ticks: true, bLab: '2a', rays: [30], pts: [[99, 30, 'P', 'tl']] });
  const P5F = rbox({ open: true, w: 200, h: 110, L: 'V_0(1-2y/a)', T: '0', B: '0', yt: 'a', far: 'x\\to\\infty', pts: [[27.5, 27.5, 'P', ['tr', 'r']]] });
  const P5S = plt({ w: 260, h: 150, x: [0, 1], y: [-1.15, 1.15], zero: true, xt: [[0.5, 'a/2'], [1, 'a']], yt: [[1, 'V_0'], [-1, '-V_0']], xl: 'y', yl: 'V(0,y)', curves: [{ f: (y) => 1 - 2 * y, lab: '\\text{data}' }] });
  const P6F = wedge({ al: 60, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V_0\\sin3\\theta', outer: 'V=0', angLab: '\\pi/3', ticks: true, bLab: '2a' });
  const P7F = wedge({ al: 45, b: 160, w0: 'V=0', wA: '\\partial_\\theta\\Phi=0', metalA: false, outer: 'V_0', angLab: '\\pi/4', pts: [[80, 45, 'P', 'tl']] });
  const P7S = wedge({ al: 90, b: 140, w0: 'V=0', wA: 'V=0', outer: 'V_0', angLab: '\\pi/2', rays: [45], O: false });
  const P8F = rbox({ open: true, w: 200, h: 110, L: '0', T: 'V_0', B: '0', yt: 'a', far: 'x\\to\\infty', pts: [[55, 55, 'P', ['tr', 'r']]] });
  const P8S = rbox({ open: true, w: 200, h: 110, L: '-V_0y/a', T: '0', B: '0', yt: 'a', axes: false });
  const P9F = wedge({ al: 90, a: 50, open: true, L: 160, w0: 'V=0', wA: 'V_0', inner: 'V=0', far: 'r\\to\\infty', angLab: '\\pi/2', pts: [[100, 45, 'P', 'tr']] });
  const P9S = wedge({ al: 90, a: 50, open: true, L: 160, w0: '\\#1\\;\\psi=0', wA: '\\#2\\;\\psi=0', inner: '\\#3\\;\\psi=-V_0\\theta/\\alpha', far: '\\#4\\;\\psi\\to0', angLab: '\\pi/2', O: false });
  const P10F = wedge({ al: 90, b: 150, w0: 'V=0', wA: 'V_0', outer: 'V_0', angLab: '\\pi/2', pts: [[75, 45, 'P', 'tr']] });
  const P10S = wedge({ al: 90, b: 150, w0: '\\psi=0', wA: '\\psi=0', outer: '\\psi=V_0(1-\\theta/\\alpha)', angLab: '\\pi/2', O: false });
  const P11F = rbox({ w: 220, h: 110, L: 'V_0', T: '2V_0', R: '0', B: '0', xt: '2a', yt: 'a', pts: [[110, 55, 'C']] });
  const P11S = PF.row([
    { svg: rbox({ w: 160, h: 80, L: 'V_0', T: '0', R: '0', B: '0', axes: false }), cap: '$V_L$: left side live' },
    { svg: rbox({ w: 160, h: 80, L: '0', T: '2V_0', R: '0', B: '0', axes: false }), cap: '$V_T$: top live' },
  ]);
  const P12F = wedge({ al: 90, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', angLab: '\\pi/2', ticks: true, bLab: '2a', pts: [[105, 0, 'P', 'tr'], [70, 45, 'Q', 'tr']] });
  const P12S = plt({ w: 280, h: 170, x: [1, 2], y: [-6, 0.5], zero: true, xt: [[1, 'a'], [1.5, '1.5a'], [2, '2a']], yt: [[-2, '-2'], [-4, '-4']], xl: 'r', yl: '\\sigma/(\\varepsilon_0V_0/a)', curves: [{ f: (r) => sigWall(r), from: 1, to: 1.985, n: 200 }], pts: [{ x: 1.5, y: sigWall(1.5), lab: 'P' }] });
  const P13F = wedge({ al: 90, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outerP: [[0, 30, '0'], [30, 60, 'V_0'], [60, 90, '0']], angLab: '\\pi/2', ticks: true, bLab: '2a', pts: [[105, 45, 'P', 'tl']] });
  const P14F = cyl({ R: 70, lab: [['V_0', 45], ['V=0', 225]], gaps: [0, 90, 180, 270], pts: [[35, 45, 'P']], extra: (f) => { f.line(-90, 0, -72, 0, { cls: 'dim dash thin' }); axis(f, 72, 0, 96, 0, 'x', ['r']); f.line(0, 90, 0, 72, { cls: 'dim dash thin' }); axis(f, 0, -72, 0, -96, 'y', ['t']); } });
  const P14S = plt({ w: 280, h: 150, x: [0, 2 * PI], y: [-0.25, 1.25], zero: true, xt: [[PI / 2, '\\pi/2'], [PI, '\\pi'], [2 * PI, '2\\pi']], yt: [[1, 'V_0'], [0.25, '\\tfrac14']], xl: '\\phi', yl: 'V(R,\\phi)', hlines: [[0.25, '']], curves: [{ f: (p) => (p < PI / 2 ? 1 : 0), n: 600 }] });
  const P15F = rbox({ w: 130, h: 130, ins: { L: true, R: true }, L: '\\partial_x V=0', R: '\\partial_x V=0', T: 'V_0\\,x/a', B: '0', xt: 'a', yt: 'a', pts: [[0, 65, 'P', ['r', 'tr']], [130, 65, 'Q', ['l', 'tl']], [65, 65, 'C', ['tr', 'br']]] });
  const P16F = wedge({ al: 90, a: 70, b: 140, w0: 'V=0', wA: 'V=0', inner: 'V=0', outer: 'V_0', angLab: '\\pi/2', ticks: true, bLab: '2a', rays: [45], pts: [[105, 45, 'P_1', 'tl'], [133, 45, 'P_2', 'tl']] });
  const P16S = plt({ w: 300, h: 180, x: [0.5, 8.5], y: [0.45, 1.2], xt: [1, 2, 3, 4, 5, 6, 7, 8], yt: [[0.5498, '0.550'], [0.9174, '0.917']], xl: 'N', yl: '\\text{partial sum}/V_0', hlines: [[0.5498, ''], [0.9174, '']],
    curves: [{ f: (x) => examPartial(1.5, PI / 4, Math.max(1, Math.round(x))), n: 400, lab: 'r=1.5a', sides: ['br', 'tr'] }, { f: (x) => examPartial(1.9, PI / 4, Math.max(1, Math.round(x))), n: 400, cls: 'dash', lab: 'r=1.9a' }] });
  const P17F = wedge({ al: 90, a: 70, b: 140, w0: 'V=0', wA: 'V_0', inner: 'V=0', outer: 'V_0', angLab: '\\pi/2', ticks: true, bLab: '2a', pts: [[99, 45, 'P', 'tl'], [99, 22.5, 'Q', 'tr']] });
  const P17S = wedge({ al: 90, a: 70, b: 140, w0: '\\psi=0', wA: '\\psi=0', inner: '\\psi=-V_0\\theta/\\alpha', outer: '\\psi=V_0(1-\\theta/\\alpha)', angLab: '\\pi/2', O: false });
  const P18F = cyl({ R: 76, a: 38, aMetal: true, lab: [['V_0', 90], ['V=0', 270]], aLab: [['V=0', 135]], gaps: [0, 180], pts: [[53.7, 90, 'P'], [53.7, 0, 'Q']] });

  // ================================================================ Lesson B: problem ladder
  const LB = {
    id: 'uD-sep-problems', title: 'Separation ladder: problems, easy → brutal',
    steps: [
      R(md`
        ### Level 1: recognize
        One warm-up: spot a single-mode answer.
      `),
      P({
        title: 'Pie slice with a single-mode arc',
        q: md`A pie slice $0<r<b$, $0<\theta<\pi/4$ has both walls grounded. Its arc $r = b$ (insulated strips) is held at $\Phi(b,\theta) = V_0\sin4\theta$. The tip is in the region.

          (a) Find $\Phi(r,\theta)$. (b) Evaluate $\Phi(b/2, \pi/8)$ in units of $V_0$. (c) What does $|\vb E|$ do at the tip?`,
        figHtml: P1F,
        hints: [md`Walls homogeneous and facing each other in $\theta$: $\sin(n\pi\theta/\alpha)$ with $\alpha = \pi/4$, so $\sin 4n\theta$.`, md`The tip is in the region: drop $r^{-4n}$.`, md`Compare the arc data with the $n = 1$ mode before doing any integral.`],
        parts: [
          { lbl: md`(a) $\Phi(r,\theta)$`, expr: 'V0*(r/b)^4*sin(4*theta)', vars: { V0: [1, 3], r: [0.2, 1], b: [1, 2], theta: [0.1, 0.7] }, accepts: ['V0*r^4*sin(4*theta)/b^4'] },
          { lbl: md`(b) $\Phi(b/2,\pi/8)/V_0$`, ans: 0.0625, unit: '' },
          { lbl: md`(c) $|\vb E|$ at the tip`, mc: [md`Diverges like $1/r$`, md`Vanishes like $r^3$`, md`Finite and nonzero`, md`Diverges like $r^{-3}$`], a: 1,
            why: [md`$1/r$ needs walls at different potentials (a $V_0\theta/\alpha$ term).`, null, md`That's the flat case $\alpha = \pi$.`, md`$r^{-4}$ was dropped; nothing in $\Phi$ grows toward the tip.`] },
        ],
        sol: md`
          **Region** $0<r<b$, $0<\theta<\pi/4$. **BCs:**
          1. $\Phi(r, 0) = 0$
          2. $\Phi(r, \pi/4) = 0$
          3. $\Phi$ finite at $r = 0$ (tip in the region)
          4. $\Phi(b, \theta) = V_0\sin4\theta$

          [[fig:bc]]

          #1 and #2 (homogeneous, facing each other): $\Theta = \sin k\theta$ with $\sin(k\pi/4) = 0$, so $k = 4n$. #3 kills $r^{-4n}$. So $\Phi = \sum_n C_n r^{4n}\sin4n\theta$.

          #4: $\sum C_n b^{4n}\sin 4n\theta = V_0\sin4\theta$. The data **is** the $n = 1$ mode, so by orthogonality $C_1b^4 = V_0$ and every other $C_n = 0$:
          $$\Phi = V_0\left(\frac{r}{b}\right)^4\sin4\theta.$$

          **(b)** $(1/2)^4\sin(\pi/2) = 1/16 = 0.0625$.

          **(c)** $\Phi \propto r^4$, so $|\vb E| \propto r^3 \to 0$, consistent with $r^{\pi/\alpha - 1}$.

          **Check:** $r^4\sin4\theta = \operatorname{Im}(x + iy)^4$, a harmonic polynomial. **Remember:** if the boundary data is one of the allowed modes, the answer is one term. Look before you integrate.
        `,
        figs: { bc: { svg: P1S, cap: 'The four boundary conditions.' } },
      }),

      R(md`
        ### Level 2: set up
        The exam template with a different opening. All the points are in the setup.
      `),
      P({
        title: 'A half-annulus trough',
        q: md`A long trough: region $a<r<b$, $0<\theta<\pi$ (upper half of an annulus). The flat base ($\theta = 0$ and $\theta = \pi$) and the inner half-cylinder $r = a$ are grounded; the outer half-cylinder $r = b$ is at $V_0$. All pieces are insulated from each other.

          Write $\Phi = \sum_n C_n\sin(n\theta)\,R_n(r)$ with $R_n(b) = 1$. (a) Which $R_n$? (b) Expanded in powers of $r$, the $n = 1$ term contains $c_1\,(r/a)\sin\theta$. Find $c_1$. (c) For $b = 2a$, evaluate $\Phi$ at P $= (1.5a, \pi/2)$ in units of $V_0$, and (d) the first term alone.`,
        figHtml: P2F,
        hints: [md`$\alpha = \pi$, so $k = n\pi/\alpha = n$, an integer.`, md`The inner arc is grounded: the radial function must vanish at $r = a$.`, md`Normalised to $1$ at $r = b$, the coefficients are just the sine series of $V_0$ on $(0, \pi)$.`],
        parts: [
          { lbl: md`(a) $R_n(r)$`, mc: [md`$\dfrac{(r/a)^n - (a/r)^n}{(b/a)^n - (a/b)^n}$`, md`$(r/b)^n$`, md`$\dfrac{r^n - r^{-n}}{b^n - b^{-n}}$`, md`$\dfrac{\ln(r/a)}{\ln(b/a)}$`], a: 0,
            why: [null, md`That's for a region containing $r = 0$. Here $r = a$ is a grounded arc, and $(a/b)^n \ne 0$.`, md`It vanishes at $r = 1$, not at $r = a$, and isn't dimensionless.`, md`That's the $k = 0$ radial function. The grounded base kills the $k = 0$ mode.`] },
          { lbl: md`(b) $c_1$`, expr: '4*V0*a*b/(pi*(b^2-a^2))', vars: { V0: [1, 3], a: [0.5, 1], b: [1.5, 3] }, accepts: ['4*V0/(pi*(b/a-a/b))'] },
          { lbl: md`(c) $\Phi(1.5a, \pi/2)/V_0$ for $b = 2a$`, ans: 0.58397, unit: '' },
          { lbl: md`(d) First term alone`, ans: 0.70736, unit: '' },
        ],
        sol: md`
          **Region** $a<r<b$, $0<\theta<\pi$. **BCs:**
          1. $\Phi(r, 0) = 0$
          2. $\Phi(r, \pi) = 0$
          3. $\Phi(a, \theta) = 0$
          4. $\Phi(b, \theta) = V_0$

          [[fig:bc]]

          #1, #2: $\sin k\pi = 0 \Rightarrow k = n$. #3: $A_na^n + B_na^{-n} = 0$, giving $(r/a)^n - (a/r)^n$; normalise so $R_n(b) = 1$. #4: $\sum C_n\sin n\theta = V_0$ on $(0,\pi)$, so
          $$C_n = \frac{2}{\pi}\int_0^\pi V_0\sin n\theta\,d\theta = \frac{4V_0}{n\pi}\ (n\text{ odd}),\quad 0\ (n\text{ even}).$$
          This is the exam answer with $\alpha = \pi$.

          **(b)** $C_1 = 4V_0/\pi$, and $R_1 = \dfrac{(r/a) - (a/r)}{(b/a) - (a/b)}$, so the coefficient of $(r/a)\sin\theta$ is $c_1 = \dfrac{4V_0}{\pi}\dfrac{1}{b/a - a/b} = \dfrac{4V_0ab}{\pi(b^2 - a^2)}$. (The matching $-(a/r)\sin\theta$ piece has the same coefficient.)

          **(c)** $b = 2a$, $r = 1.5a$, $\sin(n\pi/2) = +1, -1, +1, \ldots$ for $n = 1, 3, 5$:
          $n = 1$: $\frac{4}{\pi}\cdot\frac{1.5 - 0.667}{2 - 0.5} = 0.7074$; $n = 3$: $-\frac{4}{3\pi}\cdot\frac{3.375 - 0.296}{8 - 0.125} = -0.1659$; $n = 5$: $+0.0594$; $n = 7$: $-0.0242$; $n = 9$: $+0.0106$; ... Sum: $0.5840\,V_0$.

          **(d)** $0.7074\,V_0$, $21\%$ high. With $k = n$ (a wide region), higher modes decay slowly in $r$: an opening of $\pi$ needs more terms than the exam's $\pi/2$.

          **Remember:** the template is (walls → $k$) → (inner arc → radial mix) → (outer arc → Fourier). Write the four BCs first; that's where most of the points are.
        `,
        figs: { bc: { svg: P2S, cap: 'BCs #1 to #4; #1 and #2 quantize $k$, #3 fixes the radial combination, #4 is the Fourier step.' } },
      }),

      R(md`
        ### Level 3: standard
        Full problems that follow the recipe without surprises.
      `),
      P({
        title: 'Two single-mode faces on a square',
        q: md`A square pipe $0<x<a$, $0<y<a$ has its left and bottom sides grounded. The top is held at $V_0\sin(\pi x/a)$ and the right side at $V_0\sin(\pi y/a)$ (insulated strips).

          (a) Find $V(x,y)$. (b) Find $V$ at the center C, and (c) at P $= (a/2, 3a/4)$, in units of $V_0$.`,
        figHtml: P3F,
        hints: [md`Two live faces: superpose two one-face problems.`, md`Each live face carries a single mode. No integrals.`, md`At the center, $\sinh(\pi/2)/\sinh\pi = 1/(2\cosh(\pi/2))$.`],
        parts: [
          { lbl: md`(a) $V(x,y)$`, expr: 'V0*(sin(pi*x/a)*sinh(pi*y/a) + sin(pi*y/a)*sinh(pi*x/a))/sinh(pi)', vars: { V0: [1, 3], a: [2, 3], x: [0.2, 1.8], y: [0.2, 1.8] } },
          { lbl: md`(b) $V(C)/V_0$`, ans: 0.39854, unit: '' },
          { lbl: md`(c) $V(P)/V_0$`, ans: 0.59359, unit: '' },
        ],
        sol: md`
          **Region** the square. **BCs:** 1. $V(0,y) = 0$; 2. $V(x,0) = 0$; 3. $V(x,a) = V_0\sin(\pi x/a)$; 4. $V(a,y) = V_0\sin(\pi y/a)$.

          Split: $V = V_A + V_B$ with only the top live in $V_A$ and only the right side live in $V_B$.

          [[fig:split]]

          $V_A$: the grounded pair $x = 0, a$ faces each other, so $\sin(n\pi x/a)\sinh(n\pi y/a)$. The top data is the $n = 1$ mode: $V_A = V_0\sin\frac{\pi x}{a}\dfrac{\sinh(\pi y/a)}{\sinh\pi}$. $V_B$ is the same with $x \leftrightarrow y$.
          $$V = \frac{V_0}{\sinh\pi}\left[\sin\frac{\pi x}{a}\sinh\frac{\pi y}{a} + \sin\frac{\pi y}{a}\sinh\frac{\pi x}{a}\right].$$

          **(b)** $2V_0\dfrac{\sinh(\pi/2)}{\sinh\pi} = \dfrac{V_0}{\cosh(\pi/2)} = 0.3985\,V_0$.

          **(c)** $\dfrac{\sinh(3\pi/4) + \sin(3\pi/4)\sinh(\pi/2)}{\sinh\pi} = \dfrac{5.228 + 0.7071\times2.301}{11.549} = 0.5936$.

          **Checks:** symmetric under $x \leftrightarrow y$, as the setup is. Each live face peaks at $V_0$, and the center gets about $0.2V_0$ from each. **Remember:** one live face per sub-problem, and orient $\sin$/$\sinh$ separately for each.
        `,
        figs: { split: { svg: P3S.svg, cap: 'Superposition: one live face at a time.' } },
      }),
      P({
        title: 'A 60° annular sector',
        q: md`Annular sector $a<r<b$, $0<\theta<\pi/3$, $b = 2a$: walls and inner arc grounded, outer arc at $V_0$. Write $\Phi = \sum_n C_n\sin(k_n\theta)\left[(r/a)^{k_n} - (a/r)^{k_n}\right]$.

          (a) What is $k_n$? (b) Find $C_1$ in units of $V_0$. (c) Evaluate $\Phi$ at P $= (\sqrt2\,a, \pi/6)$ in units of $V_0$, and (d) the first term alone.`,
        figHtml: P4F,
        hints: [md`$k_n = n\pi/\alpha$ with $\alpha = \pi/3$.`, md`$C_n = \dfrac{4V_0}{n\pi\left[(b/a)^{k_n} - (a/b)^{k_n}\right]}$ for odd $n$.`, md`At $\theta = \pi/6$ (the bisector), $\sin(3n\pi/6) = \sin(n\pi/2) = \pm1$.`],
        parts: [
          { lbl: md`(a) $k_n$`, mc: [md`$n$`, md`$3n$`, md`$6n$`, md`$3n/2$`], a: 1,
            why: [md`Integer $n$ is for an opening of $\pi$ (or a full circle).`, null, md`$\sin 6n\theta$ vanishes at $\theta = \pi/6$ too, an extra node with nothing grounded there; it skips half the modes.`, md`$\sin(3n\pi/6)$ at $\theta = \pi/3$ isn't zero for odd $n$.`] },
          { lbl: md`(b) $C_1/V_0$`, ans: 0.16168, unit: '' },
          { lbl: md`(c) $\Phi(P)/V_0$`, ans: 0.38271, unit: '' },
          { lbl: md`(d) First term alone`, ans: 0.40014, unit: '' },
        ],
        sol: md`
          **BCs:** 1. $\Phi(r,0) = 0$; 2. $\Phi(r,\pi/3) = 0$; 3. $\Phi(a,\theta) = 0$; 4. $\Phi(b,\theta) = V_0$.

          #1, #2: $k_n = 3n$. #3: $(r/a)^{3n} - (a/r)^{3n}$. #4: sine series of the constant $V_0$ on $(0, \pi/3)$, $\frac{4V_0}{n\pi}$ for odd $n$, divided by the radial factor at $r = b$:
          $$C_n = \frac{4V_0}{n\pi\left[2^{3n} - 2^{-3n}\right]}.$$

          **(b)** $C_1 = \dfrac{4}{\pi(8 - 0.125)}V_0 = 0.16168\,V_0$.

          **(c)** At $r = \sqrt2a$: $(\sqrt2)^{3n} - (\sqrt2)^{-3n}$, which is $2.475$ for $n = 1$. $n = 1$: $0.16168\times2.475 = 0.40014$. $n = 3$: $-\dfrac{4}{3\pi}\cdot\dfrac{22.63 - 0.044}{512} = -0.01873$. $n = 5$: $+0.0014$; $n = 7$: $-0.0001$. Sum: $0.3827\,V_0$.

          **(d)** $0.4001\,V_0$, $4.6\%$ high.

          **Check:** $P$ sits at $r = \sqrt{ab}$, halfway in $\ln r$, and on the bisector. In a $90^\circ$ sector the same point would be higher; the closer walls of the $60^\circ$ sector pull it down.
        `,
      }),
      P({
        title: 'A slot whose end changes sign',
        q: md`The plates $y = 0$ and $y = a$ of a slot are grounded. The end strip at $x = 0$ is a resistive strip held at $V_0(1 - 2y/a)$: $+V_0$ at the bottom, $-V_0$ at the top (insulated from both plates). Write $V = \sum C_ne^{-n\pi x/a}\sin(n\pi y/a)$.

          (a) Which $n$ appear? (b) Find $C_2$. (c) Evaluate $V$ at P $= (a/4, a/4)$ in units of $V_0$. (d) What is $V$ on the midline $y = a/2$?`,
        figHtml: P5F,
        hints: [md`Look at the symmetry of the data about $y = a/2$ before integrating.`, md`$\int_0^a y\sin\frac{n\pi y}{a}dy = -\dfrac{a^2(-1)^n}{n\pi}$.`, md`Every surviving mode has a node at $y = a/2$.`],
        parts: [
          { lbl: md`(a) Which $n$?`, mc: [md`Odd $n$ only`, md`All $n$`, md`Even $n$ only`, md`$n = 1$ only`], a: 2,
            why: [md`Odd-$n$ modes are even about the midline; this data is odd about it.`, md`The data's antisymmetry kills half of them.`, null, md`The data isn't a single sine.`] },
          { lbl: md`(b) $C_2/V_0$`, ans: 0.63662, unit: '' },
          { lbl: md`(c) $V(P)/V_0$`, ans: 0.13048, unit: '' },
          { lbl: md`(d) $V(x, a/2)$`, mc: [md`$0$ for every $x$`, md`$V_0e^{-2\pi x/a}$`, md`$V_0/2$`, md`It oscillates in $x$`], a: 0,
            why: [null, md`$\sin(2\pi y/a) = 0$ at $y = a/2$.`, md`The data is $0$ at $y = a/2$ and every mode vanishes there.`, md`The $x$ dependence is a decaying exponential, never oscillating.`] },
        ],
        sol: md`
          **BCs:** 1. $V(x, 0) = 0$; 2. $V(x, a) = 0$; 3. $V \to 0$ as $x \to \infty$; 4. $V(0, y) = V_0(1 - 2y/a)$.

          #1, #2: $\sin(n\pi y/a)$. #3: $e^{-n\pi x/a}$. #4: Fourier.

          [[fig:data]]

          **(a)** The data is odd about $y = a/2$; modes with odd $n$ are even about it, so they drop out. Directly:
          $$C_n = \frac{2V_0}{a}\int_0^a\left(1 - \frac{2y}{a}\right)\sin\frac{n\pi y}{a}dy = \frac{2V_0}{n\pi}\left[1 + (-1)^n\right] = \frac{4V_0}{n\pi}\ (n\text{ even}).$$

          **(b)** $C_2 = \dfrac{2V_0}{\pi} = 0.6366\,V_0$.

          **(c)** With $n = 2m$: $V = \frac{2V_0}{\pi}\sum_m\frac1m e^{-2m\pi x/a}\sin\frac{2m\pi y}{a}$. At $(a/4, a/4)$: $\frac{2}{\pi}\left[e^{-\pi/2} + 0 - \frac13e^{-3\pi/2} + \ldots\right] = \frac{2}{\pi}(0.2079 - 0.0030 + \ldots) = 0.1305$. Closed-form check: $\frac{2V_0}{\pi}\tan^{-1}\dfrac{\sin(2\pi y/a)}{e^{2\pi x/a} - \cos(2\pi y/a)} = 0.1305\,V_0$.

          **(d)** $0$: the midline is an equipotential at $0$, so each half is the slot problem of width $a/2$ with a constant end.

          **Remember:** a sign-changing end that is odd about the middle behaves like a slot half as wide: decay length $a/2\pi$ instead of $a/\pi$.
        `,
        figs: { data: { svg: P5S, cap: 'The end data: odd about $y = a/2$.' } },
      }),

      R(md`
        ### Level 4: one twist
        Each problem breaks one assumption of the textbook case.
      `),
      P({
        title: 'Driving the inner arc with one mode',
        q: md`Annular sector $a<r<b$, $0<\theta<\pi/3$: walls and **outer** arc grounded; the **inner** arc held at $V_0\sin3\theta$.

          (a) Find $\Phi(r,\theta)$. (b) For $b = 2a$, evaluate $\Phi(1.5a, \pi/6)$ in units of $V_0$. (c) Find the surface charge density on the outer arc. (d) Find the charge per unit length on the outer arc.`,
        figHtml: P6F,
        hints: [md`$k = 3n$; the data is the $n = 1$ mode.`, md`Now the radial function must vanish at $r = b$: $(b/r)^3 - (r/b)^3$, normalised to $1$ at $r = a$.`, md`On the outer arc the normal into the region is $-\hat{\mathbf r}$, so $\sigma = \varepsilon_0\vb E\cdot(-\hat{\mathbf r}) = \varepsilon_0\,\partial\Phi/\partial r$ at $r = b$.`],
        parts: [
          { lbl: md`(a) $\Phi(r,\theta)$`, expr: 'V0*sin(3*theta)*a^3*(b^6-r^6)/(r^3*(b^6-a^6))', vars: { V0: [1, 2], theta: [0.1, 1], r: [1.1, 1.9], a: [0.5, 1], b: [2, 3] }, accepts: ['V0*sin(3*theta)*((b/r)^3-(r/b)^3)/((b/a)^3-(a/b)^3)'] },
          { lbl: md`(b) $\Phi(1.5a,\pi/6)/V_0$, $b = 2a$`, ans: 0.24743, unit: '' },
          { lbl: md`(c) $\sigma(\theta)$ on the outer arc`, expr: '-6*eps0*V0*a^3*b^2*sin(3*theta)/(b^6-a^6)', vars: { eps0: [0.5, 2], V0: [1, 2], theta: [0.1, 1], a: [0.5, 1], b: [2, 3] } },
          { lbl: md`(d) $\lambda$ on the outer arc`, expr: '-4*eps0*V0*a^3*b^3/(b^6-a^6)', vars: { eps0: [0.5, 2], V0: [1, 2], a: [0.5, 1], b: [2, 3] } },
        ],
        sol: md`
          **BCs:** 1. $\Phi(r,0) = 0$; 2. $\Phi(r,\pi/3) = 0$; 3. $\Phi(b,\theta) = 0$; 4. $\Phi(a,\theta) = V_0\sin3\theta$.

          #1, #2: $\sin 3n\theta$. #3 (now the grounded arc is the outer one): $(b/r)^{3n} - (r/b)^{3n}$. #4 is the $n = 1$ mode alone:
          $$\Phi = V_0\sin3\theta\,\frac{(b/r)^3 - (r/b)^3}{(b/a)^3 - (a/b)^3} = V_0\sin3\theta\,\frac{a^3(b^6 - r^6)}{r^3(b^6 - a^6)}.$$

          **(b)** $a = 1$, $b = 2$, $r = 1.5$, $\sin(\pi/2) = 1$: $\dfrac{64 - 11.39}{3.375\times63} = 0.2474$.

          **(c)** $\partial_r\Phi = V_0\sin3\theta\,\dfrac{a^3}{b^6 - a^6}\left(-\dfrac{3b^6}{r^4} - 3r^2\right)$. At $r = b$: $-\dfrac{6V_0a^3b^2\sin3\theta}{b^6 - a^6}$. So
          $$\sigma_{\text{outer}} = -\frac{6\varepsilon_0V_0a^3b^2}{b^6 - a^6}\sin3\theta.$$

          **(d)** $\lambda = \int_0^{\pi/3}\sigma\,b\,d\theta$, with $\int_0^{\pi/3}\sin3\theta\,d\theta = 2/3$: $\lambda = -\dfrac{4\varepsilon_0V_0a^3b^3}{b^6 - a^6}$.

          **Checks:** $\sigma < 0$ on a grounded surface facing a region at positive potential. As $b \to \infty$, $\lambda \to 0$: a far-away arc picks up little charge.
        `,
      }),
      P({
        title: 'A wedge with one insulating wall',
        q: md`Pie slice $0<r<b$, $0<\theta<\pi/4$. The wall $\theta = 0$ is grounded metal; the wall $\theta = \pi/4$ is an insulator with no surface charge and no field inside it, so $\partial\Phi/\partial\theta = 0$ there. The arc $r = b$ is at $V_0$.

          (a) Find $k_1$ and (b) $k_2$. (c) Find the coefficient $c_n$ in $\Phi = \sum c_n(r/b)^{k_n}\sin k_n\theta$. (d) Evaluate $\Phi$ at P $= (b/2, \pi/4)$, on the insulating wall, in units of $V_0$. (e) Why does the answer match a $90^\circ$ pie slice with both walls grounded?`,
        figHtml: P7F,
        hints: [md`$\Theta = \sin k\theta$ from the grounded wall; zero slope at $\pi/4$ means $\cos(k\pi/4) = 0$.`, md`$c_n = \dfrac{2}{\alpha}\displaystyle\int_0^\alpha V_0\sin k_n\theta\,d\theta$: the functions $\sin k_n\theta$ are still orthogonal on $(0,\alpha)$.`, md`An insulating wall is a mirror.`],
        parts: [
          { lbl: md`(a) $k_1$`, ans: 2, unit: '' },
          { lbl: md`(b) $k_2$`, ans: 6, unit: '' },
          { lbl: md`(c) $c_n$`, expr: '4*V0/((2*n-1)*pi)', vars: { V0: [1, 3], n: [1, 9] } },
          { lbl: md`(d) $\Phi(P)/V_0$`, ans: 0.31192, unit: '' },
          { lbl: md`(e) Why the match?`, mc: [md`Coincidence of the numbers`, md`The $90^\circ$ slice is symmetric about its bisector, so $\partial_\theta\Phi = 0$ there; its lower half is this problem`, md`Insulators and grounded metal give the same BC`, md`Both have $k = 2n$`], a: 1,
            why: [md`It's exact, for every point, by uniqueness.`, null, md`They don't: one fixes $\Phi$, the other fixes $\partial_n\Phi$.`, md`The $90^\circ$ slice has $k = 2n$ with odd $n$ only, i.e. $2, 6, 10$: the same set as $2(2n - 1)$ here. That's a consequence, not the reason.`] },
        ],
        sol: md`
          **BCs:** 1. $\Phi(r,0) = 0$; 2. $\partial_\theta\Phi(r,\pi/4) = 0$; 3. $\Phi$ finite at $r = 0$; 4. $\Phi(b,\theta) = V_0$.

          #1: $\sin k\theta$. #2: $k\cos(k\pi/4) = 0 \Rightarrow k\pi/4 = (n - \frac12)\pi \Rightarrow k_n = 2(2n - 1) = 2, 6, 10, \ldots$ #3: $r^{k}$ only.

          #4: the $\sin k_n\theta$ are orthogonal on $(0, \pi/4)$ (they're eigenfunctions of the same problem), so
          $$c_n = \frac{2}{\pi/4}\int_0^{\pi/4}V_0\sin k_n\theta\,d\theta = \frac{8V_0}{\pi k_n}\left(1 - \cos\frac{k_n\pi}{4}\right) = \frac{8V_0}{\pi k_n} = \frac{4V_0}{(2n - 1)\pi}.$$

          **(d)** At $r = b/2$, $\theta = \pi/4$: $\sin(k_n\pi/4) = (-1)^{n+1}$.
          $\frac{4}{\pi}\left[\frac14 - \frac13\cdot\frac{1}{64} + \frac15\cdot\frac{1}{1024} - \ldots\right] = 0.3119$.

          **(e)** Reflect the region across $\theta = \pi/4$ to get a $90^\circ$ slice with both walls grounded and arc at $V_0$. Its solution is symmetric about $\theta = \pi/4$, so $\partial_\theta\Phi = 0$ there: restricted to the lower half, it satisfies all four BCs here. By uniqueness it's the same function.

          [[fig:mirror]]

          Closed form of the $90^\circ$ slice: $\Phi = \frac{2V_0}{\pi}\tan^{-1}\dfrac{2\rho^2\sin2\theta}{1 - \rho^4}$, $\rho = r/b$, which gives $0.3119$ at P too.

          **Remember:** a Neumann (insulating) wall is a mirror. It turns $\sin(n\pi\theta/\alpha)$ into quarter-wave modes $\sin((n - \frac12)\pi\theta/\alpha)$.
        `,
        figs: { mirror: { svg: P7S, cap: 'Mirror image across the insulating wall: a $90^\\circ$ slice with both walls grounded.' } },
      }),
      P({
        title: 'A slot with a live top plate',
        q: md`Slot $0<y<a$, $x>0$: bottom plate grounded, top plate at $V_0$, end strip $x = 0$ grounded (insulated from the top plate).

          Write $V = V_0y/a + \sum b_ne^{-n\pi x/a}\sin(n\pi y/a)$. (a) Find $b_1$ and (b) $b_2$ in units of $V_0$. (c) Evaluate $V$ at P $= (a/2, a/2)$ in units of $V_0$. (d) What does $V$ approach for $x \gg a$?`,
        figHtml: P8F,
        hints: [md`$V_0y/a$ handles both plates. What's left must vanish on both plates and equal $-V_0y/a$ on the end.`, md`$\frac{2}{a}\int_0^a y\sin\frac{n\pi y}{a}dy = \frac{2a(-1)^{n+1}}{n\pi}$.`, md`At $y = a/2$ only odd $n$ contribute.`],
        parts: [
          { lbl: md`(a) $b_1/V_0$`, ans: -0.63662, unit: '' },
          { lbl: md`(b) $b_2/V_0$`, ans: 0.31831, unit: '' },
          { lbl: md`(c) $V(P)/V_0$`, ans: 0.36952, unit: '' },
          { lbl: md`(d) For $x \gg a$`, mc: [md`$0$`, md`$V_0/2$`, md`$V_0\sin(\pi y/a)$`, md`$V_0y/a$`], a: 3,
            why: [md`The top plate is at $V_0$ all the way out; $V$ can't vanish far away.`, md`That's only the midline value of the limit.`, md`That's the shape of the first correction, which dies off.`, null] },
        ],
        sol: md`
          **BCs:** 1. $V(x,0) = 0$; 2. $V(x,a) = V_0$; 3. $V(0,y) = 0$; 4. $V$ bounded as $x\to\infty$.

          #1 and #2 face each other along $y$ but are not both homogeneous. Subtract the $k = 0$ (parallel-plate) solution: $\psi = V - V_0y/a$ has $\psi(x,0) = \psi(x,a) = 0$, $\psi(0, y) = -V_0y/a$, $\psi \to 0$.

          [[fig:rem]]

          $\psi = \sum b_ne^{-n\pi x/a}\sin(n\pi y/a)$ with
          $$b_n = -\frac{2V_0}{a^2}\int_0^a y\sin\frac{n\pi y}{a}dy = -\frac{2V_0(-1)^{n+1}}{n\pi}.$$

          **(a), (b)** $b_1 = -2V_0/\pi = -0.6366V_0$; $b_2 = +V_0/\pi = 0.3183V_0$.

          **(c)** $V = \frac12V_0 + \sum b_ne^{-n\pi/2}\sin(n\pi/2)$. $n = 1$: $-0.6366\times0.2079 = -0.1323$. $n = 3$: $-\frac{2}{3\pi}e^{-3\pi/2}(-1) = +0.0019$. Sum: $0.3695\,V_0$.

          **(d)** $\psi \to 0$, so $V \to V_0y/a$: the uniform field between plates.

          **Check:** at P the end's influence lowers $V$ from $0.5V_0$ to $0.37V_0$, sensible half a width from a grounded end.
        `,
        figs: { rem: { svg: P8S, cap: 'The remainder $\\psi = V - V_0y/a$: an ordinary slot with end data $-V_0y/a$.' } },
      }),
      P({
        title: 'An open wedge beyond a grounded arc',
        q: md`Wedge $r>a$, $0<\theta<\pi/2$: wall $\theta = 0$ grounded, wall $\theta = \pi/2$ at $V_0$, the arc $r = a$ grounded (all insulated from each other). $\Phi$ stays finite as $r\to\infty$.

          (a) Find the coefficient $c_1$ in $\Phi = V_0\theta/\alpha + \sum c_n(a/r)^{2n}\sin2n\theta$. (b) Evaluate $\Phi$ at P $= (2a, \pi/4)$ in units of $V_0$. (c) What is $\Phi$ far away?`,
        figHtml: P9F,
        hints: [md`Subtract $V_0\theta/\alpha$ to make the walls homogeneous.`, md`Infinity is in the region: keep $r^{-k}$, drop $r^{k}$.`, md`The arc data for the remainder is $-V_0\theta/\alpha$. Its sine coefficients are $\dfrac{2V_0(-1)^n}{n\pi}$.`],
        parts: [
          { lbl: md`(a) $c_1/V_0$`, ans: -0.63662, unit: '' },
          { lbl: md`(b) $\Phi(P)/V_0$`, ans: 0.34404, unit: '' },
          { lbl: md`(c) As $r\to\infty$`, mc: [md`$0$`, md`$V_0/2$ everywhere`, md`$V_0\theta/\alpha$`, md`It grows like $\ln r$`], a: 2,
            why: [md`The live wall runs out to infinity; $\Phi$ can't vanish there.`, md`Only on the bisector.`, null, md`A $\ln r$ term would violate BC #4 (finite as $r\to\infty$), and the walls, which hold $0$ and $V_0$ at every $r$, fix the $k = 0$ piece as $V_0\theta/\alpha$ with no $r$ dependence.`] },
        ],
        sol: md`
          **Region** $r>a$, $0<\theta<\pi/2$. **BCs:** 1. $\Phi(r,0) = 0$; 2. $\Phi(r,\pi/2) = V_0$; 3. $\Phi(a,\theta) = 0$; 4. $\Phi$ finite as $r\to\infty$.

          #1, #2 face each other in $\theta$ but are not both zero. $\Phi = V_0\theta/\alpha + \psi$ with $\psi$ zero on both walls:

          [[fig:rem]]

          $\psi = \sum\sin2n\theta\,(A_nr^{2n} + B_nr^{-2n})$; #4 kills $A_n$. #3: $\sum B_na^{-2n}\sin2n\theta = -V_0\theta/\alpha$ on $(0, \alpha)$:
          $$c_n = \frac{2}{\alpha}\int_0^\alpha\left(-\frac{V_0\theta}{\alpha}\right)\sin\frac{n\pi\theta}{\alpha}d\theta = \frac{2V_0(-1)^n}{n\pi}.$$

          **(a)** $c_1 = -2V_0/\pi = -0.6366V_0$.

          **(b)** $(a/r)^{2n} = 4^{-n}$, $\sin(n\pi/2)$ kills even $n$: $\Phi = 0.5 + \left[-\frac{2}{\pi}\cdot\frac14\right] + \left[-\frac{2}{3\pi}\cdot\frac{1}{64}(-1)\right] + \ldots = 0.5 - 0.1592 + 0.0033 - \ldots = 0.3440\,V_0$.

          **(c)** Every $(a/r)^{2n} \to 0$, leaving the two-plate solution $V_0\theta/\alpha$. A grounded arc at $r = a$ only matters within a few $a$.
        `,
        figs: { rem: { svg: P9S, cap: 'After subtracting $V_0\\theta/\\alpha$: walls homogeneous, the arc carries $-V_0\\theta/\\alpha$.' } },
      }),

      R(md`
        ### Level 5: exam level
        Multi-part problems at the level of last year's Problem 1.
      `),
      P({
        title: 'Pie slice with a live wall and a live arc', big: true,
        q: md`Pie slice $0<r<b$, $0<\theta<\pi/2$, tip included. The wall $\theta = 0$ is grounded. The wall $\theta = \pi/2$ **and** the arc $r = b$ are both at $V_0$ (insulated from the grounded wall at the tip).

          (a) What do you subtract first? (b) Find $c_n$ in $\Phi = \dfrac{2V_0\theta}{\pi} + \sum c_n\left(\dfrac rb\right)^{2n}\sin2n\theta$. (c) Evaluate $\Phi$ at P $= (b/2, \pi/4)$ in units of $V_0$, and (d) with only the $n = 1$ term. (e) Your answer to (c) equals $1 - 0.34404$, one minus the previous problem's answer. Why?`,
        figHtml: P10F,
        hints: [md`The two walls are not both homogeneous: subtract the $k = 0$ solution that matches them.`, md`The remainder's arc data is $V_0 - V_0\theta/\alpha = V_0(1 - \theta/\alpha)$. Its sine coefficients are $\dfrac{2V_0}{n\pi}$ for every $n$.`, md`For (e): inversion $r \to ab/r$ and reflection $\theta \to \alpha - \theta$ both preserve Laplace in 2-D.`],
        parts: [
          { lbl: md`(a) Subtract`, mc: [md`$V_0r/b$`, md`$V_0$`, md`$2V_0\theta/\pi$`, md`$V_0\ln(r/b)$`], a: 2,
            why: [md`$r$ alone isn't harmonic in 2-D polar ($\nabla^2 r = 1/r$), and it doesn't vanish on the wall $\theta = 0$.`, md`A constant fixes the wall $\theta = \pi/2$ and the arc but breaks the grounded wall.`, null, md`$\ln(r/b)$ blows up at the tip, which is in the region.`] },
          { lbl: md`(b) $c_n$`, expr: '2*V0/(n*pi)', vars: { V0: [1, 3], n: [1, 9] } },
          { lbl: md`(c) $\Phi(P)/V_0$`, ans: 0.65596, unit: '' },
          { lbl: md`(d) $n = 1$ only`, ans: 0.65915, unit: '' },
          { lbl: md`(e) Why $1 - 0.34404$?`, mc: [md`Coincidence`, md`Inverting $r \to ab/r$ and reflecting $\theta \to \alpha - \theta$ turns that problem into "$V_0$ minus this one"`, md`Both use the same coefficients $2V_0/(n\pi)$`, md`Superposition of the two problems gives $V_0$ everywhere`], a: 1,
            why: [md`It's exact, by uniqueness.`, null, md`The coefficients there are $2V_0(-1)^n/(n\pi)$, different signs; the match comes from a symmetry.`, md`Different regions ($r<b$ vs $r>a$) can't be superposed directly.`] },
        ],
        sol: md`
          **Region** $0<r<b$, $0<\theta<\pi/2$. **BCs:**
          1. $\Phi(r, 0) = 0$
          2. $\Phi(r, \pi/2) = V_0$
          3. $\Phi$ finite at $r = 0$
          4. $\Phi(b, \theta) = V_0$

          **(a)** #1 and #2 are the pair facing each other in $\theta$, but #2 is not zero. The $k = 0$ solution $C + D\theta$ fixes both: $2V_0\theta/\pi$. Then $\psi = \Phi - 2V_0\theta/\pi$ is zero on both walls, finite at the tip, and $\psi(b,\theta) = V_0(1 - 2\theta/\pi)$.

          [[fig:rem]]

          **(b)** $\psi = \sum c_n(r/b)^{2n}\sin2n\theta$ (#3 kills $r^{-2n}$), with
          $$c_n = \frac{4}{\pi}\int_0^{\pi/2}V_0\left(1 - \frac{2\theta}{\pi}\right)\sin2n\theta\,d\theta = \frac{2V_0}{n\pi}.$$
          No $(-1)^n$: the constant part gives $\frac{2V_0}{n\pi}[1 - (-1)^n]$ and the ramp gives $\frac{2V_0}{n\pi}(-1)^n$.

          **(c)** At P: $(r/b)^{2n} = 4^{-n}$, $\sin(n\pi/2)$: $0.5 + \frac{2}{\pi}\left[\frac14 - \frac13\cdot\frac{1}{64} + \frac15\cdot\frac{1}{1024} - \ldots\right] = 0.5 + 0.1560 = 0.6560\,V_0$.

          **(d)** $0.5 + \frac{2}{\pi}\cdot\frac14 = 0.6592\,V_0$, $0.5\%$ high.

          **(e)** Take the previous open wedge (walls $0$ and $V_0$, grounded arc at $r = a$) and map $r \to ab/r$: its region $r>a$ becomes $r<b$ with a grounded arc at $r = b$. Reflect $\theta \to \alpha - \theta$: now the live wall is at $\theta = 0$. Subtract from $V_0$: wall $\theta = 0$ at $0$, wall $\theta = \alpha$ at $V_0$, arc at $V_0$. That's this problem, so $\Phi_{\text{here}}(b/2, \pi/4) = V_0 - \Phi_{\text{prev}}(2a, \pi/4)$.

          **Also:** the field at the tip diverges like $V_0/(\alpha r)$ because the two walls are at different potentials.
        `,
        figs: { rem: { svg: P10S, cap: 'The remainder $\\psi = \\Phi - 2V_0\\theta/\\pi$.' } },
      }),
      P({
        title: 'A wide box with two live sides', big: true,
        q: md`A long pipe has the cross-section $0<x<2a$, $0<y<a$. The left side is at $V_0$, the top at $2V_0$, the other two sides grounded (insulated at the corners).

          (a) Write the left-side contribution $V_L$. (b) Find $V_L$ and (c) $V_T$ (top contribution) at the center C, in units of $V_0$. (d) The total $V(C)/V_0$. (e) Check (b) and (c) with a symmetry argument.`,
        figHtml: P11F,
        hints: [md`Two one-live-face problems. For $V_L$ the grounded pair facing each other is top/bottom; for $V_T$ it's left/right.`, md`$V_L = \sum\frac{4V_0}{n\pi}\sin\frac{n\pi y}{a}\dfrac{\sinh(n\pi(2a - x)/a)}{\sinh 2n\pi}$ (odd $n$).`, md`$V_T = \sum\frac{8V_0}{n\pi}\sin\frac{n\pi x}{2a}\dfrac{\sinh(n\pi y/2a)}{\sinh(n\pi/2)}$ (odd $n$).`, md`(e): with all four sides at $V_0$, $V = V_0$. The two long sides contribute equally at C, and so do the two short ones.`],
        parts: [
          { lbl: md`(a) $x$-factor in $V_L$`, mc: [md`$\sinh(n\pi x/a)$`, md`$e^{-n\pi x/a}$`, md`$\dfrac{\sinh(n\pi(2a - x)/a)}{\sinh 2n\pi}$`, md`$\dfrac{\cosh(n\pi(x - a)/a)}{\cosh n\pi}$`], a: 2,
            why: [md`That vanishes at $x = 0$, the live side.`, md`The box is closed at $x = 2a$, where $V$ must vanish; $e^{-kx}$ doesn't.`, null, md`$\cosh$ is for two equal live sides; the right side is grounded.`] },
          { lbl: md`(b) $V_L(C)/V_0$`, ans: 0.054885, unit: '' },
          { lbl: md`(c) $V_T(C)/V_0$`, ans: 0.89023, unit: '' },
          { lbl: md`(d) $V(C)/V_0$`, ans: 0.94512, unit: '' },
          { lbl: md`(e) Let $T$ be the center value with one long side at $V_0$ (the rest grounded), and $S$ the center value with one short side at $V_0$. They satisfy`, mc: [md`$T + S = V_0/2$`, md`$T = S = V_0/4$`, md`$T + S = V_0$`, md`$T - S = V_0/2$`], a: 0,
            why: [null, md`That's the square. The long sides are closer to C.`, md`There are two of each: $2T + 2S = V_0$.`, md`No symmetry gives a difference.`] },
        ],
        sol: md`
          **Region** $0<x<2a$, $0<y<a$. **BCs:** 1. $V(0,y) = V_0$; 2. $V(x,a) = 2V_0$; 3. $V(2a,y) = 0$; 4. $V(x,0) = 0$.

          [[fig:split]]

          **(a)** $V_L$: top and bottom grounded, so $\sin(n\pi y/a)$; the right side grounded, so the $x$-factor vanishes at $x = 2a$; normalise to $1$ at $x = 0$:
          $$V_L = \sum_{n\ \text{odd}}\frac{4V_0}{n\pi}\sin\frac{n\pi y}{a}\frac{\sinh(n\pi(2a - x)/a)}{\sinh 2n\pi}.$$

          **(b)** At C, $(a, a/2)$: $\frac{4}{\pi}\frac{\sinh\pi}{\sinh2\pi} = \frac{4}{\pi}\cdot\frac{1}{2\cosh\pi} = 0.05492$ for $n = 1$; $n = 3$: $-\frac{4}{3\pi}\cdot\frac{1}{2\cosh3\pi} = -0.00003$. $V_L = 0.05488\,V_0$.

          **(c)** $V_T$: left and right grounded, width $2a$, so $\sin(n\pi x/2a)$ and $\sinh(n\pi y/2a)$. At C: $\frac{8}{\pi}\frac{\sinh(\pi/4)}{\sinh(\pi/2)} = 0.9612$ for $n = 1$; $n = 3$: $-\frac{8}{3\pi}\frac{\sinh(3\pi/4)}{\sinh(3\pi/2)} = -0.0797$; $n = 5$: $+0.0100$; $n = 7$: $-0.0015$; ... $V_T = 0.8902\,V_0$.

          **(d)** $0.9451\,V_0$.

          **(e)** All four sides at $V_0$ gives $V_0$, so $2T + 2S = V_0$. From (b), $S = 0.0549V_0$; from (c), $T = 0.8902/2 = 0.4451V_0$. $T + S = 0.5000V_0$. The near, long faces dominate.
        `,
        figs: { split: { svg: P11S.svg, cap: 'Superpose the left-live and top-live problems.' } },
      }),
      P({
        title: 'Charge on the walls of the exam sector', big: true,
        q: md`Take the exam sector with $\alpha = \pi/2$ and $b = 2a$: $\Phi = \sum_{n\ \text{odd}}C_n\sin2n\theta\left[(r/a)^{2n} - (a/r)^{2n}\right]$, $C_n = \dfrac{4V_0}{n\pi\left[4^n - 4^{-n}\right]}$.

          (a) Find $\sigma$ on the grounded wall $\theta = 0$ at P ($r = 1.5a$), and (b) on the inner arc at Q ($\theta = \pi/4$), both in units of $\varepsilon_0V_0/a$. (c) Just above P, which way does $\vb E$ point?`,
        figHtml: P12F,
        hints: [md`$\sigma = \varepsilon_0\vb E\cdot\hat{\mathbf n}$, with $\hat{\mathbf n}$ pointing from the metal into the field region: $+\hat{\boldsymbol\theta}$ on the wall $\theta = 0$, $+\hat{\mathbf r}$ on the inner arc.`, md`Wall: $\sigma = -\dfrac{\varepsilon_0}{r}\partial_\theta\Phi\Big|_{\theta = 0} = -\dfrac{\varepsilon_0}{r}\sum C_n\,2n\left[(r/a)^{2n} - (a/r)^{2n}\right]$.`, md`Inner arc: $\sigma = -\varepsilon_0\partial_r\Phi\big|_{r = a} = -\varepsilon_0\sum C_n\sin2n\theta\,\dfrac{4n}{a}$.`],
        parts: [
          { lbl: md`(a) $\sigma(P)$, units $\varepsilon_0V_0/a$`, ans: -1.2571, unit: '' },
          { lbl: md`(b) $\sigma(Q)$, units $\varepsilon_0V_0/a$`, ans: -1.2832, unit: '' },
          { lbl: md`(c) $\vb E$ just above P`, mc: [md`Along $+\hat{\boldsymbol\theta}$, away from the wall`, md`Along $-\hat{\boldsymbol\theta}$, into the wall`, md`Along $\hat{\mathbf r}$, parallel to the wall`, md`Zero, since the wall is grounded`], a: 1,
            why: [md`$E_\theta = \sigma/\varepsilon_0 < 0$.`, null, md`The tangential field at a conductor is zero.`, md`Grounded means $\Phi = 0$, not $\vb E = 0$. Charge sits on the wall, so the normal field is nonzero.`] },
        ],
        sol: md`
          **BCs** (as on the exam): 1. $\Phi(r,0) = 0$; 2. $\Phi(r,\pi/2) = 0$; 3. $\Phi(a,\theta) = 0$; 4. $\Phi(b,\theta) = V_0$. The charge densities come from the normal derivatives at the metal.

          **(a)** $E_\theta = -\frac1r\partial_\theta\Phi$, and at $\theta = 0$, $\partial_\theta\sin2n\theta = 2n$. With $a = 1$, $r = 1.5$:
          $n = 1$: $C_1 = \frac{4}{\pi(3.75)} = 0.3395$, term $0.3395\times2\times(2.25 - 0.444) = 1.226$. $n = 3$: $C_3 = 0.00663$, term $0.00663\times6\times11.30 = 0.4498$. $n = 5$: $0.1434$; $n = 7$: $0.0454$; ... sum $1.8856$ (the terms fall like $0.5625^n$, so keep about ten). $\sigma = -\varepsilon_0\cdot1.8856/1.5 = -1.257\,\varepsilon_0V_0/a$.

          [[fig:sig]]

          **(b)** $\partial_r[(r/a)^k - (a/r)^k]$ at $r = a$ is $2k/a$, with $k = 2n$. $\sigma = -\varepsilon_0\sum C_n\sin(n\pi/2)\,4n/a$: $n = 1$: $1.358$; $n = 3$: $-0.0796$; $n = 5$: $+0.0050$; ... $\sigma = -1.283\,\varepsilon_0V_0/a$.

          **(c)** $E_\theta(P) = \sigma/\varepsilon_0 < 0$: the field points into the wall, from high potential toward the grounded metal.

          **Beyond:** $\sigma$ on the wall grows without bound as $r \to b$ (the plot), like $1/(b - r)$, because a grounded wall meets a live arc there. The total charge on the wall diverges logarithmically for ideal zero-width gaps.
        `,
        figs: { sig: { svg: P12S, cap: '$\\sigma$ along the grounded wall $\\theta = 0$. It diverges at the corner with the live arc.' } },
      }),
      P({
        title: 'Only the middle third of the arc is live', big: true,
        q: md`Exam sector with $\alpha = \pi/2$, $b = 2a$, walls and inner arc grounded. The outer arc is made of three insulated strips: the middle one ($\pi/6<\theta<\pi/3$) is at $V_0$, the outer two are grounded.

          Write the arc data as $\sum g_n\sin2n\theta$. (a) Find $g_1$, (b) $g_2$, (c) $g_3$ in units of $V_0$. (d) Evaluate $\Phi$ at P $= (1.5a, \pi/4)$ in units of $V_0$.`,
        figHtml: P13F,
        hints: [md`$g_n = \dfrac{2}{\pi/2}\displaystyle\int_{\pi/6}^{\pi/3}V_0\sin2n\theta\,d\theta$.`, md`The data is symmetric about the bisector: even $n$ vanish.`, md`$\Phi = \sum g_n\sin2n\theta\,\dfrac{(r/a)^{2n} - (a/r)^{2n}}{(b/a)^{2n} - (a/b)^{2n}}$.`],
        parts: [
          { lbl: md`(a) $g_1/V_0$`, ans: 0.63662, unit: '' },
          { lbl: md`(b) $g_2/V_0$`, ans: 0, unit: '' },
          { lbl: md`(c) $g_3/V_0$`, ans: -0.42441, unit: '' },
          { lbl: md`(d) $\Phi(P)/V_0$`, ans: 0.38618, unit: '' },
        ],
        sol: md`
          **BCs:** 1. $\Phi(r,0) = 0$; 2. $\Phi(r,\pi/2) = 0$; 3. $\Phi(a,\theta) = 0$; 4. $\Phi(b,\theta) = V_0$ for $\pi/6<\theta<\pi/3$, $0$ otherwise.

          #1 to #3 are the exam's, so the modes are the same; only the Fourier step changes.
          $$g_n = \frac{4V_0}{\pi}\left[-\frac{\cos2n\theta}{2n}\right]_{\pi/6}^{\pi/3} = \frac{2V_0}{n\pi}\left[\cos\frac{n\pi}{3} - \cos\frac{2n\pi}{3}\right].$$

          **(a)** $n = 1$: $\frac{2}{\pi}[0.5 + 0.5] = 0.6366$. **(b)** $n = 2$: $\cos\frac{2\pi}{3} - \cos\frac{4\pi}{3} = 0$. **(c)** $n = 3$: $\frac{2}{3\pi}[-1 - 1] = -0.4244$. ($n = 5$: $+0.1273$; $n = 6$: $0$.)

          **(d)** $\sin(2n\pi/4) = \sin(n\pi/2)$; radial ratio $\frac{1.5^{2n} - 1.5^{-2n}}{4^n - 4^{-n}}$: $0.4815$ ($n = 1$), $0.1766$ ($n = 3$), $0.0563$ ($n = 5$).
          $\Phi = 0.6366(0.4815) - 0.4244(-1)(0.1766) + 0.1273(0.0563) - \ldots = 0.3065 + 0.0750 + 0.0072 - \ldots = 0.3862\,V_0$.

          **Check:** only a third of the arc is live, yet $\Phi(P)$ is $70\%$ of the fully-live exam value $0.550V_0$. Plausible: the live strip is the part of the arc closest to P, and the grounded strips sit next to the grounded walls, where the fully-live arc contributed little anyway.
        `,
      }),

      R(md`
        ### Level 6: harder than the exam
        Neumann data, a full circle, symmetry shortcuts and convergence. Each needs an idea beyond the recipe.
      `),
      P({
        title: 'A disk region with one live quadrant', big: true,
        q: md`A long thin-walled pipe of radius $R$ is made of four insulated quarter strips. The strip $0<\phi<\pi/2$ is at $V_0$; the other three are grounded. There is no charge inside.

          With $V = A_0 + \sum_{n\ge1}(s/R)^n(A_n\cos n\phi + B_n\sin n\phi)$: (a) find $V$ at the center; (b) $A_1$ and (c) $B_2$ in units of $V_0$; (d) evaluate $V$ at P $= (R/2, \pi/4)$; (e) find $|\vb E|$ at the center in units of $V_0/R$.`,
        figHtml: P14F,
        hints: [md`The origin is in the region: $s^n$ only, no $\ln s$. Single-valuedness: integer $n$, no $\phi$ term.`, md`$A_0$ is the average of the boundary data. $A_n = \frac1\pi\int V\cos n\phi\,d\phi$, $B_n = \frac1\pi\int V\sin n\phi\,d\phi$.`, md`Near the center only $n = 1$ is linear in $x, y$: $V \approx A_0 + (A_1x + B_1y)/R$.`],
        parts: [
          { lbl: md`(a) $V(0)/V_0$`, ans: 0.25, unit: '' },
          { lbl: md`(b) $A_1/V_0$`, ans: 0.31831, unit: '' },
          { lbl: md`(c) $B_2/V_0$`, ans: 0.31831, unit: '' },
          { lbl: md`(d) $V(P)/V_0$`, ans: 0.56861, unit: '' },
          { lbl: md`(e) $|\vb E(0)|$, units $V_0/R$`, ans: 0.45016, unit: '' },
        ],
        sol: md`
          **Region** $s<R$, all $\phi$. **BCs:** 1. $V$ finite at $s = 0$; 2. $V(s, \phi + 2\pi) = V(s, \phi)$; 3. $V(R,\phi) = V_0$ for $0<\phi<\pi/2$, else $0$.

          #2 forces integer $n$ and removes the $D\phi$ term; #1 removes $s^{-n}$ and $\ln s$.

          [[fig:data]]

          **(a)** $A_0 = \frac{1}{2\pi}\int_0^{\pi/2}V_0\,d\phi = V_0/4$. Only $A_0$ survives at $s = 0$: the center value is the boundary average.

          **(b), (c)** $A_n = \frac{V_0}{\pi}\int_0^{\pi/2}\cos n\phi\,d\phi = \frac{V_0\sin(n\pi/2)}{n\pi}$, $B_n = \frac{V_0}{n\pi}\left(1 - \cos\frac{n\pi}{2}\right)$. So $A_1 = V_0/\pi$, $B_1 = V_0/\pi$, $A_2 = 0$, $B_2 = \frac{V_0}{2\pi}\cdot2 = V_0/\pi$.

          **(d)** At $s = R/2$, $\phi = \pi/4$: $0.25 + \frac12\cdot\frac{1}{\pi}(\cos\frac\pi4 + \sin\frac\pi4) + \frac14\cdot\frac{1}{\pi}\sin\frac\pi2 + \ldots = 0.25 + 0.2251 + 0.0796 + \ldots = 0.5686\,V_0$. Poisson's integral for the disk gives the same.

          **(e)** $V \approx \frac{V_0}{4} + \frac{V_0}{\pi R}(x + y)$, so $\vb E(0) = -\frac{V_0}{\pi R}(\hat{\mathbf x} + \hat{\mathbf y})$, $|\vb E| = \frac{\sqrt2}{\pi}\frac{V_0}{R} = 0.4502\,V_0/R$, pointing away from the live quadrant.
        `,
        figs: { data: { svg: P14S, cap: 'Boundary data around the circle; its average is $V_0/4$.' } },
      }),
      P({
        title: 'Insulating side walls and a ramp on top', big: true,
        q: md`Square region $0<x<a$, $0<y<a$. The side walls $x = 0$ and $x = a$ are insulators with no surface charge and no field behind them, so the normal field vanishes: $\partial V/\partial x = 0$ there. The bottom is grounded and the top is a resistive strip at $V_0x/a$.

          Write $V = A_0\dfrac{y}{a} + \sum_{n\ge1}c_n\cos\dfrac{n\pi x}{a}\dfrac{\sinh(n\pi y/a)}{\sinh n\pi}$. (a) Find $A_0$ and (b) $c_1$ in units of $V_0$. (c) Find $V$ at the center C, (d) at P $= (0, a/2)$ and (e) at Q $= (a, a/2)$, in units of $V_0$.`,
        figHtml: P15F,
        hints: [md`Zero slope at both walls: $\cos(n\pi x/a)$ with $n \ge 0$. The $n = 0$ partner in $y$ is linear.`, md`$A_0$ is the average of the top data; $c_n = \frac2a\int_0^aV_0\frac xa\cos\frac{n\pi x}{a}dx$.`, md`At $x = a/2$, $\cos(n\pi/2) = 0$ for odd $n$.`, md`$V(0, y) + V(a, y)$: use $x \to a - x$.`],
        parts: [
          { lbl: md`(a) $A_0/V_0$`, ans: 0.5, unit: '' },
          { lbl: md`(b) $c_1/V_0$`, ans: -0.40528, unit: '' },
          { lbl: md`(c) $V(C)/V_0$`, ans: 0.25, unit: '' },
          { lbl: md`(d) $V(P)/V_0$`, ans: 0.16883, unit: '' },
          { lbl: md`(e) $V(Q)/V_0$`, ans: 0.33117, unit: '' },
        ],
        sol: md`
          **BCs:** 1. $\partial_xV(0,y) = 0$; 2. $\partial_xV(a,y) = 0$; 3. $V(x,0) = 0$; 4. $V(x,a) = V_0x/a$.

          #1, #2: $\cos(n\pi x/a)$, $n = 0, 1, 2, \ldots$ For $n = 0$ the $y$ partner is $A + By$; for $n \ge 1$ it is $\sinh$/$\cosh$. #3 keeps $y$ and $\sinh$.

          **(a)** #4 with orthogonality, $n = 0$: $A_0 = \frac1a\int_0^aV_0\frac xa dx = V_0/2$.

          **(b)** $c_n = \frac{2V_0}{a^2}\int_0^ax\cos\frac{n\pi x}{a}dx = \frac{2V_0[(-1)^n - 1]}{n^2\pi^2}$: $-\frac{4V_0}{n^2\pi^2}$ for odd $n$, $0$ for even $n$. $c_1 = -4V_0/\pi^2 = -0.4053V_0$.

          **(c)** $\cos(n\pi/2) = 0$ for every odd $n$: $V(C) = \frac{V_0}{2}\cdot\frac12 = 0.25V_0$, exactly.

          **(d)** $\cos 0 = 1$: $V = 0.25 - \frac{4}{\pi^2}\left[\frac{\sinh(\pi/2)}{\sinh\pi} + \frac19\frac{\sinh(3\pi/2)}{\sinh3\pi} + \ldots\right] = 0.25 - 0.4053(0.1993 + 0.0010 + \ldots) = 0.1688\,V_0$.

          **(e)** $\cos n\pi = -1$ for odd $n$, so the corrections flip sign: $0.25 + 0.0812 = 0.3312\,V_0$. Check: $V(P) + V(Q) = 0.5V_0 = 2V(C)$, because $V(x, y) + V(a - x, y)$ solves the problem with top data $V_0$, whose answer is $V_0y/a$.

          **Remember:** insulating walls bring $\cos$ and a $k = 0$ mode; the $k = 0$ mode carries the average of the data.
        `,
      }),
      P({
        title: 'How many terms do you need?', big: true,
        q: md`Exam sector with $\alpha = \pi/2$, $b = 2a$, on the bisector $\theta = \pi/4$. Count only the nonzero terms ($n = 1, 3, 5, \ldots$).

          (a) Find $\Phi(P_1)$, $r = 1.5a$, in units of $V_0$. (b) By what percentage is the one-term value high? (c) How many terms until every later partial sum is within $1\%$ of the full value, at $P_1$? (d) The same at $P_2$, $r = 1.9a$.`,
        figHtml: P16F,
        hints: [md`$C_n\sin(n\pi/2)[(r/a)^{2n} - (a/r)^{2n}] \approx \pm\frac{4V_0}{n\pi}(r/b)^{2n}$ for large $n$.`, md`The signs alternate, so the error after a term is about the size of the next term.`, md`At $P_1$: $(0.75)^{2n} = 0.5625^n$. At $P_2$: $0.95^{2n} = 0.9025^n$.`],
        parts: [
          { lbl: md`(a) $\Phi(P_1)/V_0$`, ans: 0.5498, unit: '' },
          { lbl: md`(b) One-term error, percent`, ans: 11.5, unit: '' },
          { lbl: md`(c) Terms needed at $P_1$`, ans: 3, unit: '' },
          { lbl: md`(d) Terms needed at $P_2$`, ans: 8, unit: '' },
        ],
        sol: md`
          **BCs** are the exam's: 1. $\Phi(r,0) = 0$; 2. $\Phi(r,\pi/2) = 0$; 3. $\Phi(a,\theta) = 0$; 4. $\Phi(b,\theta) = V_0$. On the bisector the $n$-th nonzero term has sign $(-1)^{(n-1)/2}$.

          **(a)** Partial sums at $r = 1.5a$: $0.6130, 0.5381, 0.5524, 0.5492, 0.5500, \ldots \to 0.5498\,V_0$.

          **(b)** $(0.6130 - 0.5498)/0.5498 = 11.5\%$.

          **(c)** The $1\%$ band is $0.5443$ to $0.5553$. The second partial sum ($0.5381$) is outside, the third ($0.5524$) and all later ones inside: **3 terms**.

          **(d)** At $r = 1.9a$, $\Phi = 0.9174V_0$, band $0.9082$ to $0.9266$. Partial sums: $1.1317, 0.8197, 0.9722, 0.8835, 0.9397, 0.9022, 0.9281, 0.9098, \ldots$ The seventh ($0.9281$) is still out; from the eighth on they stay in: **8 terms**.

          [[fig:ps]]

          **Rule:** the terms fall like $(r/b)^{\pi n/\alpha}/n$, so the count grows like $1/\ln(b/r)$ as the point approaches the live face. Right on the arc the damping is gone: $32$ nonzero terms at $\theta = \pi/4$, more toward the corners, and next to the corners the overshoot never goes away (Gibbs). An exam answer at a point well inside: one or two terms, and say how big the next one is.
        `,
        figs: { ps: { svg: P16S, cap: 'Partial sums vs the number of nonzero terms $N$, with the full values dashed.' } },
      }),
      P({
        title: 'Two live faces, two grounded faces: the symmetric sector', big: true,
        q: md`Annular sector $a<r<b$, $b = 2a$, $0<\theta<\pi/2$. The wall $\theta = \pi/2$ and the outer arc are at $V_0$; the wall $\theta = 0$ and the inner arc are grounded (all insulated at the corners).

          Write $\Phi = V_0\theta/\alpha + \psi$. (a) Find the sine coefficients of $\psi$'s inner-arc data, $g_1$, and (b) of its outer-arc data, $h_1$, in units of $V_0$. (c) Find $\Phi$ at P $= (\sqrt2\,a, \pi/4)$ and (d) at Q $= (\sqrt2\,a, \pi/8)$, in units of $V_0$. (e) What is $\Phi(\sqrt2\,a, 3\pi/8)$?`,
        figHtml: P17F,
        hints: [md`$\psi$ is zero on both walls. Inner-arc data: $-V_0\theta/\alpha$. Outer-arc data: $V_0(1 - \theta/\alpha)$.`, md`Each mode: $\sin2n\theta\,(A_nr^{2n} + B_nr^{-2n})$ with two conditions, $A_na^{2n} + B_na^{-2n} = g_n$ and $A_nb^{2n} + B_nb^{-2n} = h_n$.`, md`For (c): look for a symmetry that maps the problem to "$V_0$ minus itself".`],
        parts: [
          { lbl: md`(a) $g_1/V_0$`, ans: -0.63662, unit: '' },
          { lbl: md`(b) $h_1/V_0$`, ans: 0.63662, unit: '' },
          { lbl: md`(c) $\Phi(P)/V_0$`, ans: 0.5, unit: '' },
          { lbl: md`(d) $\Phi(Q)/V_0$`, ans: 0.39660, unit: '' },
          { lbl: md`(e) $\Phi(\sqrt2\,a, 3\pi/8)$`, mc: [md`$\Phi(Q)$, by reflection about the bisector`, md`$V_0/2$`, md`$2\Phi(Q)$`, md`$V_0 - \Phi(Q)$`], a: 3,
            why: [md`Reflection alone swaps the walls' potentials, so it maps $\Phi$ to a different problem, not to itself.`, md`Only the bisector point is fixed by the symmetry.`, md`No linearity argument gives a factor $2$.`, null] },
        ],
        sol: md`
          **BCs:** 1. $\Phi(r,0) = 0$; 2. $\Phi(r,\pi/2) = V_0$; 3. $\Phi(a,\theta) = 0$; 4. $\Phi(b,\theta) = V_0$.

          Subtract $V_0\theta/\alpha$ (it fixes #1 and #2). Then $\psi$ has homogeneous walls, $\psi(a,\theta) = -V_0\theta/\alpha$ and $\psi(b,\theta) = V_0(1 - \theta/\alpha)$.

          [[fig:rem]]

          **(a), (b)** On $(0,\alpha)$: $-\frac{V_0\theta}{\alpha} \to g_n = \frac{2V_0(-1)^n}{n\pi}$, so $g_1 = -0.6366V_0$. $V_0(1 - \frac\theta\alpha) \to h_n = \frac{2V_0}{n\pi}$, so $h_1 = +0.6366V_0$.

          Each mode: solve $A_na^{k} + B_na^{-k} = g_n$, $A_nb^{k} + B_nb^{-k} = h_n$ ($k = 2n$). Two arcs live means two radial pieces, both active.

          **(c)** Symmetry: map $r \to ab/r$ and $\theta \to \alpha - \theta$. This sends wall $0 \leftrightarrow$ wall $\alpha$ and inner arc $\leftrightarrow$ outer arc, exchanging the grounded faces with the live ones. So $V_0 - \Phi(ab/r, \alpha - \theta)$ solves the same problem, and by uniqueness
          $$\Phi(r, \theta) = V_0 - \Phi\!\left(\frac{ab}{r}, \alpha - \theta\right).$$
          P $= (\sqrt{ab}, \alpha/2)$ is a fixed point: $\Phi(P) = V_0/2$. The series gives $0.50000$.

          **(d)** Summing the modes at $r = \sqrt2a$, $\theta = \pi/8$: $\Phi(Q) = 0.3966\,V_0$.

          **(e)** $(\sqrt2a, 3\pi/8)$ is the image of Q, so $\Phi = V_0 - 0.3966V_0 = 0.6034V_0$.

          **Remember:** in 2-D polar, $r \to ab/r$ is a symmetry of Laplace. It swaps the arcs of an annular sector. Look for it before summing anything.
        `,
        figs: { rem: { svg: P17S, cap: 'After subtracting $V_0\\theta/\\alpha$, both arcs carry data.' } },
      }),
      P({
        title: 'A half-live shell around a grounded rod', big: true,
        q: md`A grounded rod of radius $a$ sits on the axis of a thin shell of radius $b = 2a$ made of two insulated halves: $V_0$ for $0<\phi<\pi$ (upper half) and $0$ for $\pi<\phi<2\pi$.

          (a) Which terms appear in $V(s,\phi)$ for $a<s<b$? (b) Evaluate $V$ at P $= (\sqrt2\,a, \pi/2)$ and (c) at Q $= (\sqrt2\,a, 0)$, in units of $V_0$. (d) Find the charge per unit length on the rod.`,
        figHtml: P18F,
        hints: [md`Full circle: integer $n$, no $\phi$ term. Annulus: both $s^n$ and $s^{-n}$, and the $\ln s$ term.`, md`The data's average is $V_0/2$; its sine coefficients are $\frac{2V_0}{n\pi}$ for odd $n$; no cosines.`, md`On the rod, only the $\ln s$ term carries net charge: $\int_0^{2\pi}\sin n\phi\,d\phi = 0$.`],
        parts: [
          { lbl: md`(a) Terms`, mc: [md`$\ln s$ and $\sin n\phi\,[(s/a)^n - (a/s)^n]$ for odd $n$`, md`A constant and $\sin n\phi\,(s/b)^n$ for odd $n$`, md`$\sin n\phi$ and $\cos n\phi$ for all $n$, no $\ln s$`, md`$\phi$ and $\ln s$`], a: 0,
            why: [null, md`A constant can't vanish on the grounded rod, and $(s/b)^n$ ignores the inner boundary.`, md`The data has a nonzero average, which needs the $k = 0$ radial piece $\ln s$; and it has no cosine content.`, md`$\phi$ isn't single-valued around the full circle.`] },
          { lbl: md`(b) $V(P)/V_0$`, ans: 0.49948, unit: '' },
          { lbl: md`(c) $V(Q)/V_0$`, ans: 0.25, unit: '' },
          { lbl: md`(d) $\lambda_{\text{rod}}$`, expr: '-pi*eps0*V0/ln(b/a)', vars: { eps0: [0.5, 2], V0: [1, 3], a: [0.5, 1], b: [1.5, 3] } },
        ],
        sol: md`
          **Region** $a<s<b$, all $\phi$. **BCs:** 1. $V(a,\phi) = 0$; 2. $V(b,\phi) = V_0$ ($0<\phi<\pi$), $0$ ($\pi<\phi<2\pi$); 3. $V(s,\phi + 2\pi) = V(s,\phi)$.

          **(a)** #3: integer $n$, no $D\phi$. The $k = 0$ piece is $A + B\ln s$; #1 makes it $B\ln(s/a)$. For $n \ge 1$, #1 gives $(s/a)^n - (a/s)^n$. The data is $\frac{V_0}{2} + \sum_{n\ \text{odd}}\frac{2V_0}{n\pi}\sin n\phi$, so
          $$V = \frac{V_0}{2}\frac{\ln(s/a)}{\ln(b/a)} + \sum_{n\ \text{odd}}\frac{2V_0}{n\pi}\sin n\phi\,\frac{(s/a)^n - (a/s)^n}{(b/a)^n - (a/b)^n}.$$

          **(b)** $\ln\sqrt2/\ln 2 = \frac12$, so the first piece is $0.25V_0$. Series at $\phi = \pi/2$: $n = 1$: $\frac2\pi\cdot\frac{1.4142 - 0.7071}{1.5} = 0.3001$; $n = 3$: $-\frac{2}{3\pi}\cdot\frac{2.828 - 0.354}{7.875} = -0.0667$; $n = 5$: $+0.0218$; $n = 7$: $-0.0080$; $n = 9$: $+0.0031$; ... sum $0.2495$. $V(P) = 0.4995\,V_0$.

          **(c)** $\sin 0 = 0$: only the $\ln$ term, $V(Q) = 0.25\,V_0$. Q points at the gap, where the two halves' influences balance.

          **(d)** $\sigma = -\varepsilon_0\,\partial_sV$ at $s = a$ (normal $+\hat{\mathbf s}$ into the region). Integrating $\sigma a\,d\phi$ around the rod, the $\sin n\phi$ terms drop out:
          $$\lambda = -2\pi a\varepsilon_0\cdot\frac{V_0}{2a\ln(b/a)} = -\frac{\pi\varepsilon_0V_0}{\ln(b/a)}.$$
          That's the coax result with the shell at its average potential $V_0/2$.
        `,
      }),
      RF(md`
        !!key Patterns to remember
            - The oscillating direction is the one with homogeneous faces at **both** ends. Check that your form can be nonzero on the live face.
            - Order: homogeneous BCs term by term (quantize $k$, fix the radial mix), the live face last (Fourier).
            - Two live faces: superpose. Live faces facing each other along the oscillating direction: subtract the $k = 0$ solution ($V_0y/a$, $V_0\theta/\alpha$).
            - Wedge: $k = n\pi/\alpha$; tip field $r^{\pi/\alpha - 1}$; walls at different potentials give $1/r$.
            - Insulating wall: $\cos$, a quarter-wave, or a mirror; and a $k = 0$ mode that carries the average.
            - Full circle: integer $n$, no $\phi$ term; center value = boundary average; annulus adds $\ln s$, which carries the net charge.
            - Checks without series: four-face superposition, symmetry, inversion $r \to ab/r$, the decay length (width)$/\pi$.
      `),
    ],
  };

  COURSE.units.find((u) => u.id === 'uD').lessons.push(LA, LB);
})();

/* Unit 2 — Electric potential (Lecture 4, Lecture 5, Lecture 6 pp. 1–2; Griffiths 2.3). */
(function () {
  'use strict';
  const { RF, P, Q, G } = C;
  const DEG = Math.PI / 180;

  // ================================================================== drawing helpers
  // arrows of a vector field given in math coordinates (y up); w = world half-width of the box
  const vfield = (f, fn, cx, cy, h, n, w, o = {}) => f.field((X, Y) => {
    const v = fn((X - cx) / h * w, -(Y - cy) / h * w);
    return v ? [v[0], -v[1]] : null;
  }, [cx - h, cy - h, cx + h, cy + h], n, n, Object.assign({ len: 16, mag: true }, o));

  // polyline with an arrowhead a fraction t of the way along it
  const pathArrow = (f, pts, o = {}) => {
    f.pl(pts, o);
    const seg = [];
    let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    const want = (o.t ?? 0.5) * tot;
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const l = seg[i - 1];
      if (l > 0 && acc + l >= want) {
        const u = (want - acc) / l, dx = (pts[i][0] - pts[i - 1][0]) / l, dy = (pts[i][1] - pts[i - 1][1]) / l;
        const x = pts[i - 1][0] + u * l * dx, y = pts[i - 1][1] + u * l * dy;
        f.head(x + dx * 3.5, y + dy * 3.5, dx, dy, { hs: o.hs || 6, cls: o.cls });
        break;
      }
      acc += l;
    }
    return f;
  };

  // field line through (x0,y0) following +E (world coordinates, y up)
  const traceLine = (E, x0, y0, o = {}) => {
    const h = o.h || 0.02, nmax = o.n || 3000, box = o.box || [-3, -3, 3, 3];
    const pts = [[x0, y0]];
    let x = x0, y = y0;
    for (let i = 0; i < nmax; i++) {
      const a = E(x, y), ma = Math.hypot(a[0], a[1]);
      if (!isFinite(ma) || ma === 0) break;
      const b = E(x + 0.5 * h * a[0] / ma, y + 0.5 * h * a[1] / ma), mb = Math.hypot(b[0], b[1]);
      if (!isFinite(mb) || mb === 0) break;
      x += h * b[0] / mb; y += h * b[1] / mb;
      pts.push([x, y]);
      if (x < box[0] || x > box[2] || y < box[1] || y > box[3]) break;
      if (o.stop && o.stop(x, y)) break;
    }
    return pts;
  };

  // join marching-squares segments into polylines
  const chain = (segs) => {
    const key = (p) => `${Math.round(p[0] * 20)},${Math.round(p[1] * 20)}`;
    const ends = new Map();
    segs.forEach((s, i) => s.forEach((p) => { const k = key(p); if (!ends.has(k)) ends.set(k, []); ends.get(k).push(i); }));
    const used = segs.map(() => false), lines = [];
    for (let i = 0; i < segs.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      const line = [segs[i][0], segs[i][1]];
      for (let pass = 0; pass < 2; pass++) {
        for (;;) {
          const tail = line[line.length - 1];
          const j = (ends.get(key(tail)) || []).find((m) => !used[m]);
          if (j === undefined) break;
          used[j] = true;
          line.push(key(segs[j][0]) === key(tail) ? segs[j][1] : segs[j][0]);
        }
        line.reverse();
      }
      lines.push(line);
    }
    return lines;
  };
  // contour lines of fn(X,Y) (screen coordinates) at value lev inside box, n cells across
  const contour = (fn, box, n, lev) => {
    const [x0, y0, x1, y1] = box, nx = n, ny = Math.max(2, Math.round(n * (y1 - y0) / (x1 - x0)));
    const dx = (x1 - x0) / nx, dy = (y1 - y0) / ny, v = [];
    for (let i = 0; i <= nx; i++) { v.push([]); for (let j = 0; j <= ny; j++) v[i].push(fn(x0 + i * dx, y0 + j * dy) - lev); }
    const cut = (xa, ya, va, xb, yb, vb) => { const t = va / (va - vb); return [xa + t * (xb - xa), ya + t * (yb - ya)]; };
    const segs = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const xa = x0 + i * dx, ya = y0 + j * dy, xb = xa + dx, yb = ya + dy;
      const c = [v[i][j], v[i + 1][j], v[i + 1][j + 1], v[i][j + 1]];
      if (!c.every(isFinite)) continue;
      const e = [];
      if ((c[0] > 0) !== (c[1] > 0)) e.push(cut(xa, ya, c[0], xb, ya, c[1]));
      if ((c[1] > 0) !== (c[2] > 0)) e.push(cut(xb, ya, c[1], xb, yb, c[2]));
      if ((c[2] > 0) !== (c[3] > 0)) e.push(cut(xb, yb, c[2], xa, yb, c[3]));
      if ((c[3] > 0) !== (c[0] > 0)) e.push(cut(xa, yb, c[3], xa, ya, c[0]));
      if (e.length === 2) segs.push(e);
      else if (e.length === 4) { segs.push([e[0], e[1]]); segs.push([e[2], e[3]]); }
    }
    return chain(segs);
  };
  const drawContours = (f, fn, box, n, levels, cls = 'thin') => {
    for (const lev of levels) for (const ln of contour(fn, box, n, lev)) if (ln.length > 2) f.pl(ln, { cls });
  };

  // small + and - signs drawn as glyphs (for charge distributions)
  const plus = (f, x, y, s = 3.6) => { f.track(x - s, y - s, x + s, y + s); return f.add(`<path class="glyph" d="M${x - s},${y}H${x + s}M${x},${y - s}V${y + s}"/>`); };
  const minus = (f, x, y, s = 3.6) => { f.track(x - s, y - s, x + s, y + s); return f.add(`<path class="glyph" d="M${x - s},${y}H${x + s}"/>`); };
  // label joined to its point by a thin leader line (for crowded spots); the label starts where the leader ends
  const callout = (f, px, py, lx, ly, t, anchor, cls = 'small') => {
    const L = Math.hypot(lx - px, ly - py) || 1;
    f.line(px + (lx - px) / L * 5, py + (ly - py) / L * 5, lx, ly, { cls: 'dim thin' });
    f.label(lx, ly, t, anchor, cls);
    return f;
  };
  // a row of parallel arrows standing for a uniform field, with its label to the right
  const fieldLegend = (f, x, y, lab, n = 3, len = 40, gap = 13) => {
    for (let k = 0; k < n; k++) f.arrow(x, y + k * gap, x + len, y + k * gap, { hs: 5 });
    if (lab) f.label(x + len + 8, y + (n - 1) * gap / 2, lab, 'l', 'small');
    return f;
  };

  // function plot (same look as PF.plot) with a hook to draw on top: extra(f, X, Y)
  const gplot = (o) => {
    const W = o.w || 300, H = o.h || 190, ml = o.ml ?? 40, mr = o.mr ?? 20, mt = o.mt ?? 16, mb = o.mb ?? 30;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
    const Y = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
    const f = PF.fig({ pad: 4 });
    const tk = (v) => (Array.isArray(v) ? v : [v, String(v)]);
    for (const t of (o.xt || [])) { const [v, s] = tk(t); f.line(X(v), Y(y0), X(v), Y(y1), { cls: 'grid nodecl' }); f.label(X(v), Y(y0) + 5, s, 't', 'small accent'); }
    for (const t of (o.yt || [])) { const [v, s] = tk(t); f.line(X(x0), Y(v), X(x1), Y(v), { cls: 'grid nodecl' }); f.label(X(x0) - 6, Y(v), s, 'r', 'small accent'); }
    const ya = (y0 < 0 && y1 > 0) ? 0 : y0, xa = o.yax ?? x0;
    f.line(X(x0), Y(ya), X(x1), Y(ya), { cls: 'axisl', arrow: 'end', hs: 6 });
    f.line(X(xa), Y(y0), X(xa), Y(y1), { cls: 'axisl', arrow: 'end', hs: 6 });
    for (const [v, s] of (o.vlines || [])) { f.line(X(v), Y(y0), X(v), Y(y1), { cls: 'dash dim' }); if (s) f.label(X(v) + 4, Y(y1) + 2, s, 'tl', 'small accent'); }
    for (const [v, s] of (o.hlines || [])) { f.line(X(x0), Y(v), X(x1), Y(v), { cls: 'dash dim' }); if (s) f.label(X(x1) + 4, Y(v), s, 'l', 'small accent'); }
    for (const c of (o.curves || [])) {
      const a = c.from ?? x0, b = c.to ?? x1, N = c.n || 240, pts = [];
      for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N, y = c.f(x); if (isFinite(y)) pts.push([x, y]); }
      let seg = [];
      const flush = () => { if (seg.length > 1) f.pl(seg.map((p) => [X(p[0]), Y(p[1])]), { cls: 'curve ' + (c.cls || '') }); seg = []; };
      for (const p of pts) { if (p[1] < y0 - 1e-9 || p[1] > y1 + 1e-9) flush(); else seg.push(p); }
      flush();
      if (c.lab) { const at = c.labAt ?? b; f.label(X(at) + (c.dx ?? 4), Y(Math.min(Math.max(c.f(at), y0), y1)) + (c.dy ?? -8), c.lab, c.anchor || 'l', 'small'); }
    }
    for (const p of (o.pts || [])) { f.dot(X(p.x), Y(p.y), 3); if (p.lab) f.label(X(p.x) + 6, Y(p.y) - 6, p.lab, p.anchor || 'bl', 'small'); }
    if (o.extra) o.extra(f, X, Y);
    if (o.xl && o.xlAbove) f.label(X(x1) + 2, Y(ya) - 5, o.xl, 'br', 'small');
    else if (o.xl) f.label(X(x1) + 2, Y(ya) + (o.xlDy ?? 14), o.xl, 'tr', 'small');
    if (o.yl) f.label(X(xa) + 6, Y(y1) - 2, o.yl, 'bl', 'small');
    f.track(0, 0, W, H);
    return f.svg().replace('class="schem pfig', 'class="schem pfig pplot');
  };
  // small graph for "which graph" questions; four of them in a row labelled A-D
  const thumb = (curves, o = {}) => gplot(Object.assign({ w: 170, h: 120, ml: 22, mr: 14, mt: 12, mb: 24, x: [0, 3.2], y: [0, 1.25], xt: [[1, 'R']], xl: 'r', yl: 'V' }, o, { curves }));
  const rowABCD = (svgs) => PF.row(svgs.map((s, i) => ({ svg: s, cap: 'ABCDE'[i] }))).svg;

  // ================================================================== Lesson 1 figures
  const figSwirl = () => {
    const f = PF.fig();
    const cx = 110, cy = 105, h = 84;
    f.axes(cx, cy, { x: [-h - 16, h + 18], y: [-h - 16, h + 18], xl: 'x', yl: 'y' });
    vfield(f, (x, y) => [-y, x], cx, cy, h, 6, 1, { len: 22 });
    return f.svg();
  };

  const figSinZ = () => {
    const f = PF.fig();
    const ox = 30, oy = 214;
    f.axes(ox, oy, { x: [0, 255], y: [0, 205], xl: 'y', yl: 'z' });
    for (let j = 0; j <= 8; j++) {
      const s = Math.sin(j * Math.PI / 4), Y = oy - 16 - j * 22;
      for (let i = 0; i < 5; i++) {
        const X = ox + 48 + i * 42;
        if (Math.abs(s) < 0.05) f.dot(X, Y, 1.5, { cls: 'dimfill' });
        else f.arrow(X - 15 * s, Y, X + 15 * s, Y, { hs: 5 });
      }
    }
    f.label(ox + 262, oy - 16 - 2 * 22, md`kz=\tfrac{\pi}{2}`, 'l', 'small accent');
    f.label(ox + 262, oy - 16 - 6 * 22, md`kz=\tfrac{3\pi}{2}`, 'l', 'small accent');
    return f.svg();
  };

  const figSph = () => {
    const f = PF.fig();
    const ox = 50, oy = 180, th = 40 * DEG, r = 125;
    f.line(ox, oy + 8, ox, oy - 160, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(ox + 5, oy - 164, 'z', 'bl', 'small accent');
    f.dot(ox, oy, 2.2);
    f.tag(ox, oy, 'O', 'bl', 6, 'small');
    const px = ox + r * Math.sin(th), py = oy - r * Math.cos(th);
    f.line(ox, oy, px, py, { cls: 'dim' });
    f.dot(px, py, 3);
    f.angle(ox, oy, 34, 50, 90, md`\theta`);
    f.label((ox + px) / 2 + 9, (oy + py) / 2 + 4, 'r', 'tl', 'small');
    const ur = [Math.sin(th), -Math.cos(th)], ut = [Math.cos(th), Math.sin(th)];
    f.arrow(px, py, px + 34 * ur[0], py + 34 * ur[1]);
    f.tag(px + 34 * ur[0], py + 34 * ur[1], md`\uv r`, 'tr', 5);
    f.arrow(px, py, px + 34 * ut[0], py + 34 * ut[1]);
    f.tag(px + 34 * ut[0], py + 34 * ut[1], md`\hat{\boldsymbol\theta}`, 'r', 5);
    return f.svg();
  };

  const figDipole = () => {
    const f = PF.fig();
    const S = 62, cx = 130, cy = 120, a = 0.5;
    const E = (x, y) => {
      const r1 = Math.hypot(x, y - a), r2 = Math.hypot(x, y + a);
      return [x / r1 ** 3 - x / r2 ** 3, (y - a) / r1 ** 3 - (y + a) / r2 ** 3];
    };
    const toS = (p) => [cx + S * p[0], cy - S * p[1]];
    const box = [-1.95, -1.75, 1.95, 1.75];
    for (let k = 0; k < 12; k++) {
      const ang = (k * 30 + 15) * DEG;
      const pts = traceLine(E, 0.1 * Math.cos(ang), a + 0.1 * Math.sin(ang), { h: 0.015, box, stop: (x, y) => Math.hypot(x, y + a) < 0.1 });
      pathArrow(f, pts.map(toS), { t: 0.5, hs: 6 });
    }
    f.charge(cx, cy - S * a, { q: '+' });
    f.charge(cx, cy + S * a, { q: '-' });
    return f.svg();
  };

  // wobbly closed loop through a and b
  const blob = (cx, cy, rx, ry, a0, a1) => {
    const pts = [], N = Math.ceil(Math.abs(a1 - a0) / 4);
    for (let i = 0; i <= N; i++) {
      const t = (a0 + (a1 - a0) * i / N) * DEG, k = 1 + 0.07 * Math.sin(3 * t) + 0.04 * Math.cos(5 * t);
      pts.push([cx + rx * k * Math.cos(t), cy - ry * k * Math.sin(t)]);
    }
    return pts;
  };
  const figLoopPaths = () => {
    const f = PF.fig();
    const cx = 150, cy = 95, rx = 108, ry = 60;
    const top = blob(cx, cy, rx, ry, 180, 35), bot = blob(cx, cy, rx, ry, 180, 395);
    pathArrow(f, top, { t: 0.42 });
    pathArrow(f, bot, { t: 0.5 });
    const A = top[0], B = top[top.length - 1];
    f.dot(A[0], A[1], 3.4); f.dot(B[0], B[1], 3.4);
    f.tag(A[0], A[1], 'a', 'l', 8);
    f.tag(B[0], B[1], 'b', 'tr', 7);
    f.label(cx - 20, cy - ry - 14, md`(\text{i})`, 'b', 'small');
    f.label(cx, cy + ry + 12, md`(\text{ii})`, 't', 'small');
    return f.svg();
  };

  // uniform field E0 x-hat; kind 'q': origin and (d,h,0); kind 'abc': points A, B, C and two paths
  const figUniform = (kind) => {
    const f = PF.fig();
    const O = [40, 186];
    f.axes(O[0], O[1], { x: [-6, 250], y: [-6, 172], xl: 'x', yl: 'y' });
    if (kind === 'q') {
      fieldLegend(f, 70, 22, md`\vb E=E_0\,\uv x`);
      const Pp = [O[0] + 180, O[1] - 118];
      f.dot(O[0], O[1], 3); f.tag(O[0], O[1], 'O', 'bl', 6, 'small');
      f.dot(Pp[0], Pp[1], 3.4); f.tag(Pp[0], Pp[1], '(d,h,0)', 'tr', 6);
      f.dim(O[0], O[1], Pp[0], O[1], 'd', { off: 18, at: 'b' });
      f.dim(Pp[0], O[1], Pp[0], Pp[1], 'h', { off: 18, at: 'r' });
    } else {
      fieldLegend(f, 76, 18, md`\vb E=(250\un{V/m})\,\uv x`, 2, 40, 14);
      const B = [O[0] + 160, O[1] - 120], Cc = [O[0], O[1] - 120], K = [O[0] + 160, O[1]];
      pathArrow(f, [O, B], { t: 0.55, cls: 'thick' });
      pathArrow(f, [O, K], { t: 0.55, cls: 'dash' }); pathArrow(f, [K, B], { t: 0.55, cls: 'dash' });
      f.dot(O[0], O[1], 3.4); f.tag(O[0], O[1], 'A', 'bl', 6);
      f.dot(B[0], B[1], 3.4); f.tag(B[0], B[1], 'B', 'tr', 6);
      f.dot(Cc[0], Cc[1], 3.4); f.tag(Cc[0], Cc[1], 'C', 'tl', 6);
      f.label(111.6, 114.8, '1', 'c', 'small');
      f.label(208, 140, '2', 'l', 'small');
      f.dim(O[0], O[1], K[0], K[1], md`0.40\un{m}`, { off: 18, at: 'b' });
      f.dim(K[0], K[1], B[0], B[1], md`0.30\un{m}`, { off: 34, at: 'r' });
    }
    return f.svg();
  };

  const figAlongE = () => {
    const f = PF.fig();
    fieldLegend(f, 20, 20, md`\vb E`);
    f.dot(90, 98, 3.2); f.tag(90, 98, '1', 'bl', 6, 'small');
    f.arrow(90, 98, 160, 98, { cls: 'thick', hs: 8 });
    f.dot(160, 98, 3.2); f.tag(160, 98, '2', 'br', 6, 'small');
    f.label(125, 106, md`d\vb l`, 't', 'small');
    return f.svg();
  };

  const figSaddle = () => {
    const f = PF.fig();
    const cx = 120, cy = 110, S = 46, half = 100;
    const V = (X, Y) => { const x = (X - cx) / S, y = -(Y - cy) / S; return x * x - y * y; };
    const box = [cx - half, cy - half, cx + half, cy + half];
    f.rect(box[0], box[1], 2 * half, 2 * half, { cls: 'dim thin' });
    drawContours(f, V, box, 80, [-2, 2], 'dim thin');
    f.line(box[0], box[1], box[2], box[3], { cls: 'dash dim' });
    f.line(box[0], box[3], box[2], box[1], { cls: 'dash dim' });
    f.line(cx, box[3] + 6, cx, box[1] - 10, { cls: 'dim', arrow: 'end', hs: 6 });
    f.line(box[0] - 6, cy, box[2] + 10, cy, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(box[2] + 14, cy, 'x', 'l', 'small accent');
    f.label(cx + 5, box[1] - 12, 'y', 'bl', 'small accent');
    f.label(cx - 46, cy - 14, 'V>0', 'c', 'small');
    f.label(cx - 20, cy + 52, 'V<0', 'c', 'small');
    f.dot(cx + S, cy - S, 3.4);
    f.tag(cx + S, cy - S, 'P', 'tl', 6);
    f.text(box[2] - 4, box[3] + 14, 'dashed: V = 0', 'tr');
    return f.svg();
  };

  const figPath3D = () => {
    const g = PF.fig({ proj: { ox: 70, oy: 170, s: 1 } });
    g.axes3(150, { labels: ['x', 'y', 'z'] });
    const P0 = g.p3(0, 0, 0), P1 = g.p3(100, 0, 0), P2 = g.p3(100, 110, 0), P3 = g.p3(100, 110, 95);
    g.line(P0[0], P0[1], P1[0], P1[1], { cls: 'thick', arrow: 'end', hs: 8 });
    g.line(P1[0], P1[1], P2[0], P2[1], { cls: 'thick', arrow: 'end', hs: 8 });
    g.line(P2[0], P2[1], P3[0], P3[1], { cls: 'thick', arrow: 'end', hs: 8 });
    g.dot(P3[0], P3[1], 3.2);
    g.tag(P3[0], P3[1], '(x,y,z)', 'tr', 6);
    g.tag(P0[0], P0[1], 'O', 'tl', 6, 'small');
    g.label((P0[0] + P1[0]) / 2 - 10, (P0[1] + P1[1]) / 2 - 14, '1', 'c', 'small');
    g.label((P1[0] + P2[0]) / 2, P1[1] - 6, '2', 'b', 'small');
    g.label(P2[0] + 7, (P2[1] + P3[1]) / 2, '3', 'l', 'small');
    g.tag(P1[0], P1[1], '(x,0,0)', 'br', 7, 'small');
    g.tag(P2[0], P2[1], '(x,y,0)', 'br', 7, 'small');
    return g.svg();
  };

  // ================================================================== Lesson 2 figures
  const figLandscape = () => {
    const s = PF.fig();
    const base = 150, c = 140, Hf = (x) => 2100 / Math.hypot(x - c, 15);
    const pts = [];
    for (let x = 20; x <= 260; x += 2) pts.push([x, base - Hf(x)]);
    s.pl(pts);
    s.line(14, base, 272, base, { cls: 'dim', arrow: 'end', hs: 6 });
    s.label(276, base, 'x', 'l', 'small accent');
    s.label(c + 16, base - Hf(c) + 4, 'V(x)', 'l', 'small');
    for (const x0 of [100, 116, 164, 180]) {
      const x1 = x0 + (x0 < c ? -16 : 16);
      s.arrow(x0, base - Hf(x0) - 7, x1, base - Hf(x1) - 7, { hs: 5 });
    }
    for (const x0 of [76, 110]) s.arrow(x0, base + 16, x0 - 26, base + 16, { hs: 5 });
    for (const x0 of [170, 204]) s.arrow(x0, base + 16, x0 + 26, base + 16, { hs: 5 });
    s.label(c, base + 16, md`\vb E`, 'c', 'small');
    const t = PF.fig();
    const cx = 100, cy = 100;
    for (const r of [12, 24, 47, 92]) t.circle(cx, cy, r, { cls: 'dim' });
    for (let k = 0; k < 8; k++) {
      const a = (k * 45 + 22.5) * DEG;
      t.arrow(cx + 53 * Math.cos(a), cy - 53 * Math.sin(a), cx + 82 * Math.cos(a), cy - 82 * Math.sin(a), { hs: 5 });
    }
    t.charge(cx, cy, { q: '+', r: 6 });
    return PF.row([
      { svg: s.svg(), cap: 'Side view: height = V' },
      { svg: t.svg(), cap: 'Top view: contours and E' },
    ]);
  };

  // +q at (-1,0), -q at (1,0); equipotentials, the V = 0 line and labelled points
  const figDipoleMap = () => {
    const f = PF.fig();
    const S = 60, cx = 180, cy = 125;
    const toS = (x, y) => [cx + S * x, cy - S * y];
    const V = (X, Y) => { const x = (X - cx) / S, y = -(Y - cy) / S; return 1 / Math.max(Math.hypot(x + 1, y), 0.03) - 1 / Math.max(Math.hypot(x - 1, y), 0.03); };
    const box = [cx - 2.9 * S, cy - 2 * S, cx + 2.9 * S, cy + 2 * S];
    f.rect(box[0], box[1], box[2] - box[0], box[3] - box[1], { cls: 'dim thin' });
    drawContours(f, V, box, 160, [-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5], 'thin');
    f.line(cx, box[1], cx, box[3], { cls: 'dash dim' });
    f.label(cx + 4, box[1] + 3, 'V=0', 'tl', 'small accent');
    f.charge(...toS(-1, 0), { q: '+' });
    f.charge(...toS(1, 0), { q: '-' });
    const A = toS(-0.45, 0);
    f.dot(A[0], A[1], 3.4);
    callout(f, A[0], A[1], A[0], cy - 52, 'A', 'b');
    const pts = { B: [0, 1.3, 'r'], C: [2.3, 1.3, 'r'], D: [-2.2, -1.4, 'r'] };
    for (const [k, [x, y, at]] of Object.entries(pts)) { const p = toS(x, y); f.dot(p[0], p[1], 3.4); f.tag(p[0], p[1], k, at, 7); }
    return f.svg();
  };

  const figChordMap = () => {
    const f = PF.fig();
    const cx = 130, cy = 120;
    for (const r of [26, 52, 96]) f.circle(cx, cy, r, { cls: 'dim' });
    f.charge(cx, cy, { q: '+', lab: 'q', at: 'r' });
    const Pp = [cx + 96 * Math.cos(150 * DEG), cy - 96 * Math.sin(150 * DEG)], Qq = [cx + 96 * Math.cos(30 * DEG), cy - 96 * Math.sin(30 * DEG)];
    pathArrow(f, [Pp, Qq], { t: 0.62, cls: 'thick' });
    f.dot(Pp[0], Pp[1], 3.4); f.tag(Pp[0], Pp[1], 'P', 'tl', 7);
    f.dot(Qq[0], Qq[1], 3.4); f.tag(Qq[0], Qq[1], 'Q', 'tr', 7);
    f.text(cx + 100, cy + 70, 'circles: equipotentials', 'l');
    return f.svg();
  };

  const figRefShift = () => {
    const f = PF.fig();
    f.charge(60, 80, { q: '+' }); f.charge(96, 122, { q: '-' }); f.charge(50, 150, { q: '+' });
    f.ellipse(70, 116, 52, 62, { cls: 'dash dim' });
    f.text(70, 190, 'source charges', 't');
    const pts = { A: [210, 60, 'tr'], B: [262, 150, 'r'], "\\mathcal O'": [168, 196, 'r'] };
    for (const [k, [x, y, at]] of Object.entries(pts)) { f.dot(x, y, 3.4); f.tag(x, y, k, at, 7); }
    return f.svg();
  };

  // point charge with one or two field points
  const figPointQ = (sign, two, labs) => {
    const f = PF.fig();
    const q0 = [40, 80];
    f.charge(q0[0], q0[1], { q: sign, lab: sign === '-' ? '-q' : (labs && labs.q) || 'q', at: 't' });
    const d1 = two ? 90 : 170;
    f.line(q0[0] + 8, q0[1], q0[0] + (two ? 2 * d1 : d1) + 14, q0[1], { cls: 'dash dim' });
    f.dot(q0[0] + d1, q0[1], 3.4);
    f.tag(q0[0] + d1, q0[1], (labs && labs.p1) || 'P', 't', 8);
    f.dim(q0[0], q0[1], q0[0] + d1, q0[1], (labs && labs.r1) || 'r', { off: 20, at: 'b' });
    if (two) {
      f.dot(q0[0] + 2 * d1, q0[1], 3.4);
      f.tag(q0[0] + 2 * d1, q0[1], (labs && labs.p2) || 'P_2', 't', 8);
      f.dim(q0[0], q0[1], q0[0] + 2 * d1, q0[1], (labs && labs.r2) || '2r', { off: 46, at: 'b' });
    }
    return f.svg();
  };

  // infinite line charge (side view) with a reference cylinder of radius a and field points
  // o.ref: draw the reference cylinder; o.pts: [[distance px, dim label, point label]]; o.callout: [d, text] for a point inside the cylinder
  const figLine = (o = {}) => {
    const f = PF.fig();
    const x = 70, y0 = 30, y1 = 210, ym = 120;
    f.line(x, y0, x, y1, { cls: 'thick' });
    f.line(x, y0 - 16, x, y0 - 2, { cls: 'dash dim' }); f.line(x, y1 + 2, x, y1 + 16, { cls: 'dash dim' });
    for (const yy of [40, 88, 150, 182, 204]) plus(f, x - 9, yy);
    f.label(x + 6, y0 - 4, md`\lambda`, 'l');
    if (o.ref !== false) {
      const a = 34;
      f.ellipse(x, ym, a, 10, { cls: 'dash dim' });
      f.ellipse(x, ym - 60, a, 10, { cls: 'dash dim' });
      f.line(x - a, ym - 60, x - a, ym + 50, { cls: 'dash dim' }); f.line(x + a, ym - 60, x + a, ym + 50, { cls: 'dash dim' });
      f.label(x + a + 8, ym - 60, md`V=0\text{ at }s=a`, 'l', 'small accent');
    }
    if (o.callout) {
      const [d, t] = o.callout;
      f.dot(x + d, ym, 3.4);
      callout(f, x + d, ym, x + 80, ym - 34, t, 'bl');
    }
    const pts = o.callout ? [] : (o.pts || [[150, 's', 'P']]);
    pts.forEach(([d, lab, plab], i) => {
      f.dot(x + d, ym, 3.4);
      if (plab) f.tag(x + d, ym, plab, 't', 8);
      if (lab) { f.dim(x, ym, x + d, ym, '', { off: 22 + 26 * i }); f.label(x + d / 2, ym + 28 + 26 * i, lab, 't', 'small'); }
    });
    return f.svg();
  };

  const figPlane = () => {
    const f = PF.fig();
    const y = 130;
    f.poly([[20, y + 14], [220, y + 14], [270, y - 14], [70, y - 14]], { cls: 'shade' });
    f.poly([[20, y + 14], [220, y + 14], [270, y - 14], [70, y - 14]]);
    for (const xx of [60, 86, 112, 176, 202, 228]) plus(f, xx, y + (xx > 200 ? -3 : 3));
    f.label(228, y + 18, md`\sigma`, 'tl', 'small');
    f.line(145, y, 145, 26, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(150, 24, 'z', 'bl', 'small accent');
    f.dot(145, 64, 3.4); f.tag(145, 64, 'P', 'r', 8);
    f.dim(145, y, 145, 64, '', { off: -22 });
    f.label(116, 97, 'z', 'r', 'small');
    f.text(282, y - 4, 'plane z = 0', 'l');
    return f.svg();
  };

  // V(r) of a positive and a negative point charge
  const figPointV = () => gplot({
    w: 300, h: 200, x: [0, 4], y: [-1.6, 1.6], xl: 'r', yl: 'V', yt: [[0, '0']],
    curves: [{ f: (r) => 1 / r, from: 0.55, lab: '+q', labAt: 3.4, dy: -10 }, { f: (r) => -1 / r, from: 0.55, cls: 'dash', lab: '-q', labAt: 3.4, dy: 6 }],
  });

  // ================================================================== Lesson 1
  const L1 = {
    id: 'u2-curl', title: 'The curl test and the potential',
    steps: [
      RF(md`
        ### A very special kind of vector field

        In Unit 1 you showed that the field of any static charge distribution has zero curl:

        $$\curl\vb E = 0 .$$

        That is a strong constraint. A general vector field has three independent component functions. An electrostatic field does not: its components are tied together by

        $$\frac{\partial E_x}{\partial y}=\frac{\partial E_y}{\partial x},\qquad \frac{\partial E_y}{\partial z}=\frac{\partial E_z}{\partial y},\qquad \frac{\partial E_z}{\partial x}=\frac{\partial E_x}{\partial z},$$

        which are the three components of $\curl\vb E=0$ written out:

        $$\curl\vb E=\left(\frac{\partial E_z}{\partial y}-\frac{\partial E_y}{\partial z}\right)\uv x+\left(\frac{\partial E_x}{\partial z}-\frac{\partial E_z}{\partial x}\right)\uv y+\left(\frac{\partial E_y}{\partial x}-\frac{\partial E_x}{\partial y}\right)\uv z .$$

        So the first question to ask of any proposed field is: **is its curl zero everywhere?** If not, no arrangement of static charges, however clever, can produce it.

        !!intuition What curl looks like
          Put a tiny paddle wheel in the field. If it spins, the curl is nonzero there. Field lines that swirl around in closed loops fail the test. So do straight, parallel field lines whose strength changes as you move sideways across them: the push on one side of the wheel is stronger than on the other. Static field lines never close on themselves; they start on positive charges and end on negative charges (or at infinity).
      `),
      WG.fields({ f: 'swirl' }),
      Q(md`**Lecture 4 in-class question, field 1.** Could $\vb E = C\,(-y\,\uv x + x\,\uv y)$, with $C$ a constant, be the field of some static charge distribution? Its arrows are drawn below.`,
        [md`Yes. Its divergence is zero, so it is the field in a charge-free region.`,
          md`Yes. It is the field of a uniform line charge along the $z$ axis.`,
          md`No. $\curl\vb E = 2C\,\uv z \neq 0$, so no static charges can make it.`,
          md`Only if $C<0$, so that the arrows circulate clockwise.`], 2,
        [md`Zero divergence only says there is no charge. An electrostatic field must also have zero curl, and this one has $\curl\vb E = 2C\,\uv z$.`,
          md`A line charge on the $z$ axis gives a field pointing radially away from the axis, $\propto\uv s/s$. This field points around the axis and grows with distance.`,
          null,
          md`The sign of $C$ only reverses the sense of circulation. The curl is $2C\,\uv z$, nonzero for any $C\neq0$.`],
        md`
          $E_z=0$ and nothing depends on $z$, so only the $\uv z$ component of the curl can survive:

          $$(\curl\vb E)_z=\frac{\partial E_y}{\partial x}-\frac{\partial E_x}{\partial y}=\frac{\partial (Cx)}{\partial x}-\frac{\partial (-Cy)}{\partial y}=2C .$$

          The field lines are circles around the $z$ axis (counter-clockwise seen from $+z$ when $C>0$). Going once around a circle of radius $s$ you always move with the field, so $\oint\vb E\cdot d\vb l = (Cs)(2\pi s)\neq0$. Stokes agrees: $\int(\curl\vb E)\cdot d\vb a=2C\cdot\pi s^2$. A static field can never circulate like this.
        `, { figHtml: figSwirl(), title: 'A swirling field' }),
      Q(md`**Field 2 from the same question:** $\vb E = E_0\sin(kz)\,\uv y$. All its field lines are straight and parallel to $\uv y$ (drawn below in the $yz$ plane). Is it an electrostatic field?`,
        [md`Yes. Straight, parallel field lines cannot circulate.`,
          md`Yes, because $\divg\vb E = 0$.`,
          md`No, because $\divg\vb E \neq 0$.`,
          md`No. $\curl\vb E = -E_0k\cos(kz)\,\uv x \neq 0$.`], 3,
        [md`Straightness is not enough. Take a thin rectangular loop in the $yz$ plane with its long sides along $\uv y$ at two heights $z$. The field is stronger along one side than the other, so $\oint\vb E\cdot d\vb l\neq0$.`,
          md`$\divg\vb E=\partial_y\big(E_0\sin kz\big)=0$ is true, but zero divergence is not the test. The curl must vanish too.`,
          md`The divergence is zero here: $E_y$ does not depend on $y$. The problem is the curl.`,
          null],
        md`
          Only $E_y$ is nonzero and it depends only on $z$, so the only surviving curl term is

          $$(\curl\vb E)_x = \frac{\partial E_z}{\partial y}-\frac{\partial E_y}{\partial z} = 0 - E_0k\cos(kz).$$

          This is a shear pattern: the push along $\uv y$ at one height differs from the push at a neighbouring height, so a paddle wheel with its axle along $\uv x$ spins. Check the curl even when the field lines look harmless.
        `, { figHtml: figSinZ(), title: 'Straight lines, still not electrostatic' }),
      Q(md`**Field 3:** $\vb E = \dfrac{qC}{4\pi\ep r^3}\left(2\cos\theta\,\uv r+\sin\theta\,\hat{\boldsymbol\theta}\right)$ in spherical coordinates ($q$ and $C$ constants). Is it electrostatic, and if so, what produces it?`,
        [md`No. The $\hat{\boldsymbol\theta}$ component makes the field lines curve, and curved lines mean curl.`,
          md`Yes. It is the field of a single point charge $qC$ at the origin.`,
          md`Yes. Its curl is zero. It is the far field of a dipole: charges $\pm q$ a distance $C$ apart along the $z$ axis.`,
          md`No. Its magnitude falls as $1/r^3$, and Coulomb fields fall as $1/r^2$.`], 2,
        [md`Curved field lines are fine; circulation is what is forbidden. The $\hat{\boldsymbol\phi}$ component of the curl, $\tfrac1r\big[\partial_r(rE_\theta)-\partial_\theta E_r\big]$, has two terms that cancel.`,
          md`A point charge gives a purely radial field $\propto\uv r/r^2$. This one has a $\hat{\boldsymbol\theta}$ part and falls as $1/r^3$.`,
          null,
          md`Each charge gives $1/r^2$, but far away the fields of $+q$ and $-q$ nearly cancel, leaving $1/r^3$. A superposition of Coulomb fields is still electrostatic.`],
        md`
          Use the spherical curl from the formula sheet. With $E_\phi=0$ and nothing depending on $\phi$, the $\uv r$ and $\hat{\boldsymbol\theta}$ components vanish at once. The $\hat{\boldsymbol\phi}$ component:

          $$(\curl\vb E)_\phi = \frac1r\left[\frac{\partial}{\partial r}\left(\frac{qC\sin\theta}{4\pi\ep r^2}\right)-\frac{\partial}{\partial\theta}\left(\frac{2qC\cos\theta}{4\pi\ep r^3}\right)\right] = \frac1r\left[-\frac{2qC\sin\theta}{4\pi\ep r^3}+\frac{2qC\sin\theta}{4\pi\ep r^3}\right]=0 .$$

          It is the field of a dipole $\vb p = qC\,\uv z$ (charges $\pm q$ separated by $C$), valid for $r\gg C$. Every field line starts on $+q$ and ends on $-q$:

          [[fig:dip]]

          !!trap The lecture sketch
            In the Lecture 4 sketch the upper arcs point from $+q$ to $-q$ but the lower arcs point back from $-q$ to $+q$, so the lines would form closed loops. That is exactly what a curl-free field cannot do. In a correct sketch every line leaves $+q$ and ends on $-q$, on both sides.
        `, { figHtml: figSph(), figs: { dip: { svg: figDipole(), cap: md`Dipole field lines, $+q$ above $-q$ ($\vb p$ along $+\uv z$).` } }, title: 'The dipole field' }),
      Q(md`Which of these could be an electrostatic field? ($k$ is a constant.)`,
        [md`$k\,(y\,\uv x - x\,\uv y)$`,
          md`$k\,x\,\uv y$`,
          md`$k\,(yz\,\uv x + xz\,\uv y - xy\,\uv z)$`,
          md`$k\,(y\,\uv x + x\,\uv y)$`], 3,
        [md`$(\curl\vb E)_z=\partial_x(-kx)-\partial_y(ky)=-2k\neq0$. A clockwise swirl.`,
          md`$(\curl\vb E)_z=\partial_x(kx)=k\neq0$. Straight lines along $\uv y$ whose strength grows with $x$: a shear, like field 2.`,
          md`$(\curl\vb E)_x=\partial_y(-kxy)-\partial_z(kxz)=-2kx\neq0$. The minus sign on the $\uv z$ term spoils it; with $+xy\,\uv z$ it would pass.`,
          null],
        md`
          For $k(y\,\uv x + x\,\uv y)$: $\partial_xE_y = k = \partial_yE_x$, and nothing depends on $z$, so $\curl\vb E=0$. It equals $-\nabla V$ with $V=-kxy$; its field lines are hyperbolas.

          Quick test in practice: compare the three cross-derivative pairs. If you can guess a $V$ with $-\nabla V$ equal to the field, you are done.
        `, { nofig: 'pure curl test on formulas; the fields themselves are the setup' }),
      RF(md`
        ### From zero curl to path independence

        Stokes' theorem turns the local statement into a global one:

        $$\int_{\mathcal S}(\curl\vb E)\cdot d\vb a=\oint_{\mathcal P}\vb E\cdot d\vb l \quad\Longrightarrow\quad \oint\vb E\cdot d\vb l = 0 \ \text{ for every closed loop.}$$

        Take two points $a$ and $b$ on a loop. Going out along path (i) and back along path (ii) gives zero:

        $$\int_{a}^{b}\vb E\cdot d\vb l\,\Big|_{(\text{i})}+\int_{b}^{a}\vb E\cdot d\vb l\,\Big|_{(\text{ii})}=0 .$$

        [[fig:loop]]

        You can deform path (i) into any shape and this still holds. Reversing the direction of path (ii) flips its sign, so $\int_a^b\vb E\cdot d\vb l$ is the same along (i) and (ii): it depends only on the end points. That is what lets you define a function of position. Pick a reference point $\mathcal O$ and set

        $$V(\vb r)\equiv-\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l .$$

        $V$ is the **electric potential**, and $V(\mathcal O)=0$. Between two points,

        $$V(b)-V(a)=-\int_{\mathcal O}^{b}\vb E\cdot d\vb l+\int_{\mathcal O}^{a}\vb E\cdot d\vb l=-\int_a^b\vb E\cdot d\vb l .$$

        The minus sign is a convention, chosen so that $V$ goes **up** when you move **against** the field.
      `, { loop: { svg: figLoopPaths(), cap: 'Two paths from $a$ to $b$. Out along (i) and back along (ii) is a closed loop.' } }),
      Q(md`In an electrostatic field, $\displaystyle\int_a^b\vb E\cdot d\vb l = 5$ V along path (i). What is it along path (ii), from the same $a$ to the same $b$?`,
        [md`$-5$ V, because path (ii) curves the other way`,
          md`$5$ V`,
          md`$0$, because the two paths together make a closed loop`,
          md`It depends on how long path (ii) is.`], 1,
        [md`Both integrals run from $a$ to $b$. Only reversing the direction (from $b$ to $a$) flips the sign.`,
          null,
          md`The closed-loop integral (out along (i), back along (ii)) is zero. That makes the two $a\to b$ integrals equal, not zero.`,
          md`Length does not matter for a curl-free field. Only the end points do.`],
        md`Out along (i) and back along (ii) is a closed loop: $5\text{ V}+\int_{b}^{a}\vb E\cdot d\vb l\,\big|_{(\text{ii})}=0$. Reversing (ii) flips the sign, so $\int_a^b\vb E\cdot d\vb l\,\big|_{(\text{ii})}=5$ V. Then $V(b)-V(a)=-5$ V, whatever path you use.`,
        { figHtml: figLoopPaths() }),
      Q(md`Why must $\int\vb E\cdot d\vb l$ be path-independent before $V(\vb r)=-\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l$ makes sense?`,
        [md`Because the reference point has to be at infinity.`,
          md`Because $V$ is a vector and needs a definite direction.`,
          md`Because Gauss's law only holds for closed surfaces.`,
          md`Otherwise different paths from $\mathcal O$ to $\vb r$ would give different numbers, and $V$ would not be a single-valued function of position.`], 3,
        [md`The reference point can be anywhere. Path independence is needed whatever $\mathcal O$ you pick.`,
          md`$V$ is a scalar: the integrand $\vb E\cdot d\vb l$ is a dot product, a number.`,
          md`Gauss's law concerns $\divg\vb E$. Path independence comes from $\curl\vb E=0$ through Stokes' theorem.`,
          null],
        md`A function assigns one value to each point. If the line integral depended on the route, "the potential at $\vb r$" would have one value per path. Chain of logic: zero curl ⇒ zero loop integrals ⇒ path independence ⇒ $V$ well defined. For a swirl like $C(-y\,\uv x+x\,\uv y)$ no potential exists at all.`,
        { figHtml: figLoopPaths() }),
      Q(md`A closed loop winds around a point charge $q$ (the charge is inside the region the loop encloses). What is $\oint\vb E\cdot d\vb l$ around the loop?`,
        [md`$q/\ep$`,
          md`It depends on the shape of the loop.`,
          md`$0$`,
          md`Nonzero, because the loop "links" the charge.`], 2,
        [md`$q/\ep$ is the flux through a closed **surface** around $q$ (Gauss). A line integral around a loop is a different thing.`,
          md`For any static field $\oint\vb E\cdot d\vb l=0$ for every loop, whatever its shape.`,
          null,
          md`Linking matters for magnetic fields around currents (Ampère). A point charge's field is radial; going around and back, the radial pieces cancel exactly.`],
        md`Along the loop, $\vb E\cdot d\vb l=\dfrac{q}{4\pi\ep}\dfrac{dr}{r^2}$ (only the radial part of $d\vb l$ counts). Integrated around a closed path, $r$ returns to its start, so the total is $\dfrac{q}{4\pi\ep}\left[-\dfrac1r\right]_{r_0}^{r_0}=0$. Griffiths uses exactly this argument to prove $\curl\vb E=0$.`,
        { figHtml: (() => { const f = PF.fig(); const pts = blob(130, 90, 100, 62, 0, 360); pathArrow(f, pts, { t: 0.3 }); f.charge(115, 96, { q: '+', lab: 'q', at: 'r' }); return f.svg(); })() }),
      RF(md`
        ### $\vb E = -\nabla V$

        The fundamental theorem for gradients says $V(b)-V(a)=\int_a^b(\nabla V)\cdot d\vb l$. Compare with $V(b)-V(a)=-\int_a^b\vb E\cdot d\vb l$. Both hold for every pair of points and every path, so the integrands match:

        $$\boxed{\vb E=-\nabla V}$$

        Three functions $E_x, E_y, E_z$ come from one scalar $V$. That is no coincidence: zero curl is what ties the components together. If you know $V$, you get $\vb E$ by differentiating, with no vector sums.

        !!key Reading $dV=-\vb E\cdot d\vb l$
          Move along $\vb E$ and $V$ drops. Move against $\vb E$ and $V$ rises. Move perpendicular to $\vb E$ and $V$ does not change.

        !!trap Which way the logic runs
          The notes say $\curl(\nabla V)=0$ "implies that any irrotational vector field can be written as the gradient of a scalar function". As worded, that runs backwards: $\curl(\nabla V)=0$ shows that every **gradient** is curl-free. The converse (curl-free ⇒ gradient) is what the Stokes and path-independence argument above proves. Both statements are true in a region without holes; just know which argument proves which.
      `),
      Q(md`You move a short distance $d\vb l$ in the direction $\vb E$ points, from point 1 to point 2. The potential`,
        [md`increases`,
          md`stays the same`,
          md`decreases`,
          md`increases for a positive test charge and decreases for a negative one`], 2,
        [md`With $d\vb l$ along $\vb E$, $\vb E\cdot d\vb l>0$, so $dV=-\vb E\cdot d\vb l<0$.`,
          md`$V$ stays constant only when you move perpendicular to $\vb E$.`,
          null,
          md`$V$ belongs to the field alone; no test charge appears in $V=-\int\vb E\cdot d\vb l$. (The potential energy $qV$ does depend on the sign of $q$; that is Unit 3.)`],
        md`$dV = \nabla V\cdot d\vb l = -\vb E\cdot d\vb l = -|\vb E|\,|d\vb l|<0$. The field points "downhill", from high potential to low.`,
        { figHtml: figAlongE() }),
      Q(md`In the uniform field $\vb E=E_0\,\uv x$ ($E_0>0$), take $V=0$ at the origin. What is $V$ at the point $(d,\,h,\,0)$?`,
        [md`$+E_0d$`,
          md`$-E_0d$`,
          md`$-E_0\sqrt{d^2+h^2}$`,
          md`$-E_0(d+h)$`], 1,
        [md`Sign: the $x$ part of the trip is along $\vb E$, so $V$ must drop.`,
          null,
          md`Only the component of the displacement along $\vb E$ counts: $\vb E\cdot d\vb l=E_0\,dx$. The $y$ motion adds nothing.`,
          md`The $h$ step is perpendicular to $\vb E$ and changes nothing.`],
        md`$V(\vb r)=-\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l=-\int_0^d E_0\,dx=-E_0d$, for any path. In a uniform field $V=-E_0x+\text{const}$, so the equipotentials are the planes $x=\text{const}$, perpendicular to $\vb E$.`,
        { figHtml: figUniform('q') }),
      P({
        title: 'Two paths in a uniform field',
        q: md`The field in a region is uniform, $\vb E=(250\un{V/m})\,\uv x$. Point $A$ is at the origin, $B$ at $(0.40\un{m},\,0.30\un{m})$, and $C$ at $(0,\,0.30\un{m})$. Find $V_B-V_A$ along the straight path 1, and $V_C-V_A$. Then say what path 2 (the dashed L) gives.`,
        figHtml: figUniform('abc'),
        hints: [
          md`$V_B-V_A=-\int_A^B\vb E\cdot d\vb l$, and with a uniform field only the displacement along $\uv x$ matters.`,
          md`$\vb E\cdot d\vb l=E_x\,dx$. From $A$ to $B$, $\Delta x=0.40$ m. From $A$ to $C$, $\Delta x=0$.`,
        ],
        parts: [
          { lbl: 'V_B-V_A', ans: -100, unit: 'V' },
          { lbl: 'V_C-V_A', ans: 0, unit: 'V' },
          { lbl: md`Along path 2 (first along $x$, then along $y$), $V_B-V_A$ is`, mc: [md`also $-100$ V`, md`larger in magnitude, since path 2 is longer`, md`$0$, since the two legs cancel`], a: 0, why: [null, md`Path length is irrelevant for a curl-free field. Leg 1 gives $-E_0(0.40\text{ m})$; leg 2 is perpendicular to $\vb E$ and gives nothing.`, md`The legs do not cancel: leg 1 gives $-100$ V and leg 2 gives $0$.`] },
        ],
        sol: md`
          $\vb E\cdot d\vb l=(250\un{V/m})\,dx$ for any path, since $\vb E$ has only an $x$ component.

          - $V_B-V_A=-(250\un{V/m})(0.40\un{m})=-100$ V.
          - $V_C-V_A=-(250\un{V/m})(0)=0$: $AC$ is perpendicular to $\vb E$, so $A$ and $C$ sit on the same equipotential plane.
          - Path 2: the $x$ leg gives $-100$ V, the $y$ leg gives $0$, total $-100$ V, the same as path 1, as path independence demands.

          **What to remember:** in a uniform field $\Delta V=-E\,\Delta x_\parallel$, where $\Delta x_\parallel$ is the displacement along the field. Moving perpendicular to $\vb E$ costs nothing.
        `,
      }),
      Q(md`$V(x,y,z)=V_0\dfrac{x^2-y^2}{a^2}$. What is $\vb E$ at the point $P=(a,\,a,\,0)$, where $V=0$? (The figure shows the $z=0$ plane with $a$ as the unit of length; the solid curves are $V=\pm2V_0$.)`,
        [md`$\vb 0$, because $V=0$ there`,
          md`$\dfrac{2V_0}{a}\left(\uv x-\uv y\right)$`,
          md`$\dfrac{2V_0}{a}\left(\uv x+\uv y\right)$`,
          md`$\dfrac{2V_0}{a}\left(-\uv x+\uv y\right)$`], 3,
        [md`$\vb E$ depends on how $V$ changes, not on its value. The dashed lines in the figure have $V=0$ all along them, yet the contours around them are not flat.`,
          md`That is $+\nabla V$. You need the minus sign: $\vb E=-\nabla V$.`,
          md`The $x$ component has the wrong sign: $E_x=-\partial V/\partial x=-2V_0x/a^2<0$ at $P$. (This option is $\nabla V$ with the minus sign from the $-y^2$ dropped: two slips at once.)`,
          null],
        md`$\nabla V=\dfrac{V_0}{a^2}\left(2x\,\uv x-2y\,\uv y\right)$, so $\vb E=-\nabla V=\dfrac{2V_0}{a^2}\left(-x\,\uv x+y\,\uv y\right)$. At $(a,a,0)$: $\vb E=\dfrac{2V_0}{a}(-\uv x+\uv y)$, of magnitude $2\sqrt2\,V_0/a$, pointing from the $V>0$ region toward the $V<0$ region, across the contour lines. The value of $V$ at a point is set by the reference; only its changes matter.`,
        { figHtml: figSaddle() }),
      RF(md`
        ### Finding $V$ from a given $\vb E$

        !!method Recipe
          1. **Check the curl.** If $\curl\vb E\neq0$ anywhere, stop: no potential exists.
          2. **Pick the reference point** $\mathcal O$ (often the origin, or infinity).
          3. **Pick a path** from $\mathcal O$ to a general point $(x,y,z)$. Any path gives the same answer, so choose one that makes the integral easy: straight legs parallel to the axes.
          4. **On each leg only one coordinate changes,** so $\vb E\cdot d\vb l$ is one component times $dx'$, $dy'$ or $dz'$, with the other coordinates frozen at their values on that leg.
          5. **Check:** $-\nabla V$ must give back $\vb E$.

        [[fig:path]]

        ### Worked example

        $\vb E = k\left[(2xy+z)\,\uv x + x^2\,\uv y + x\,\uv z\right]$, reference at the origin.

        **Curl.** $\partial_xE_y=2kx=\partial_yE_x$; $\partial_zE_x=k=\partial_xE_z$; $\partial_yE_z=0=\partial_zE_y$. All three pairs match, so $\curl\vb E=0$.

        **Leg 1,** $(0,0,0)\to(x,0,0)$: here $y=z=0$, so $E_x=k(0+0)=0$. Contribution: $0$.

        **Leg 2,** $(x,0,0)\to(x,y,0)$: $x$ fixed, $z=0$, $d\vb l=dy'\,\uv y$: $\int_0^y kx^2\,dy'=kx^2y$.

        **Leg 3,** $(x,y,0)\to(x,y,z)$: $d\vb l=dz'\,\uv z$: $\int_0^z kx\,dz'=kxz$.

        $$V(x,y,z)=-\left(0+kx^2y+kxz\right)=-k\left(x^2y+xz\right).$$

        **Check.** $-\nabla V=k\left[(2xy+z)\,\uv x+x^2\,\uv y+x\,\uv z\right]$, the field we started with.

        !!trap Freeze the other coordinates on each leg
          On leg 1, $y=0$ and $z=0$. If you integrate $E_x=k(2xy+z)$ with "$y$" and "$z$" left as symbols, leg 1 alone gives $k(x^2y+xz)$, and the later legs then count the same terms a second time.
      `, { path: { svg: figPath3D(), cap: 'The usual path: along $x$, then $y$, then $z$.' } }),
      P({
        title: 'Potential from a given field',
        q: md`$\vb E = k\left[(2x+y^2)\,\uv x + 2xy\,\uv y + 3z^2\,\uv z\right]$, with $k$ a constant. (a) Is it a possible electrostatic field? (b) Find $V(x,y,z)$ with the reference point at the origin.`,
        nofig: 'field given by a formula; the integration path is drawn in the hints and solution',
        hints: [
          md`Curl first: compare $\partial_xE_y$ with $\partial_yE_x$, and so on for the other two pairs.`,
          md`Integrate from the origin along $x$, then $y$, then $z$:

          [[fig:path]]`,
          md`Leg 1 ($y=z=0$): $E_x=2kx'$. Leg 2 ($z=0$, $x$ fixed): $E_y=2kxy'$. Leg 3 ($x,y$ fixed): $E_z=3kz'^2$. Then $V=-(\text{sum of the three})$.`,
        ],
        parts: [
          { lbl: md`(a) Is $\curl\vb E=0$?`, mc: [md`Yes`, md`No: $\partial_xE_y\neq\partial_yE_x$`, md`No: the $z$ component depends on $z$`], a: 0, why: [null, md`$\partial_xE_y=2ky$ and $\partial_yE_x=2ky$. They agree.`, md`$E_z$ depending on $z$ is harmless: the curl involves only $\partial_xE_z$ and $\partial_yE_z$, which vanish.`] },
          { lbl: 'V', expr: '-k*(x^2 + x*y^2 + z^3)', vars: { k: [0.5, 2], x: [-2, 2], y: [-2, 2], z: [-2, 2] }, accepts: ['-k*x^2 - k*x*y^2 - k*z^3'] },
        ],
        sol: md`
          **(a)** $\partial_xE_y=2ky=\partial_yE_x$; $\partial_yE_z=0=\partial_zE_y$; $\partial_zE_x=0=\partial_xE_z$. So $\curl\vb E=0$ and a potential exists.

          **(b)** Along the three legs:

          [[fig:path]]

          - Leg 1: $\int_0^x 2kx'\,dx'=kx^2$.
          - Leg 2: $\int_0^y 2kxy'\,dy'=kxy^2$.
          - Leg 3: $\int_0^z 3kz'^2\,dz'=kz^3$.

          $$V(x,y,z)=-k\left(x^2+xy^2+z^3\right).$$

          **Check:** $-\nabla V=k\left[(2x+y^2)\,\uv x+2xy\,\uv y+3z^2\,\uv z\right]$, and $V(0,0,0)=0$.
        `,
        figs: { path: { svg: figPath3D(), cap: 'Legs 1, 2, 3 from the origin to $(x,y,z)$.' } },
      }),
      P({
        id: 'HW2-2.21', src: 'HW 2 · Griffiths 2.21', title: 'Which field is impossible?', big: true,
        q: md`
          One of these is an impossible electrostatic field. Which one?

          (a) $\vb E = k\left[xy\,\uv x + 2yz\,\uv y + 3xz\,\uv z\right]$;

          (b) $\vb E = k\left[y^2\,\uv x + (2xy + z^2)\,\uv y + 2yz\,\uv z\right]$.

          Here $k$ is a constant with the appropriate units. For the *possible* one, find the potential, using the *origin* as your reference point. Check your answer by computing $\nabla V$. [*Hint:* You must select a specific path to integrate along. It doesn't matter *what* path you choose, since the answer is path-independent, but you simply cannot integrate unless you have a definite path in mind.]
        `,
        nofig: 'fields given by formulas; the integration path is drawn in the hints and solution',
        hints: [
          md`An electrostatic field must have zero curl. Compute $\curl\vb E$ for each. One fails at once (try the $\uv z$ component: $\partial_xE_y-\partial_yE_x$).`,
          md`For the possible field, integrate from the origin along straight legs parallel to the axes:

          [[fig:path]]`,
          md`Leg 1: $y=z=0$, so $E_x=ky^2=0$. Leg 2: $z=0$, $x$ fixed, $E_y=2kxy'$. Leg 3: $x,y$ fixed, $E_z=2kyz'$. Then $V=-(\text{sum})$.`,
        ],
        parts: [
          { lbl: md`Which field is impossible?`, mc: [md`(a)`, md`(b)`, md`both`, md`neither`], a: 0, why: [null, md`(b) passes: $\partial_xE_y=2ky=\partial_yE_x$, $\partial_yE_z=2kz=\partial_zE_y$, $\partial_zE_x=0=\partial_xE_z$.`, md`(b) has zero curl; only (a) fails.`, md`(a) fails: $\partial_xE_y=0$ but $\partial_yE_x=kx$.`] },
          { lbl: md`$\curl\vb E$ for field (a) is`, mc: [md`$\vb 0$`, md`$-k\left(2y\,\uv x+3z\,\uv y+x\,\uv z\right)$`, md`$k\left(2y\,\uv x+3z\,\uv y+x\,\uv z\right)$`, md`$k\left(2z\,\uv x+3x\,\uv y+y\,\uv z\right)$`], a: 1, why: [md`Then (a) would be possible. For instance $(\curl\vb E)_z=\partial_x(2kyz)-\partial_y(kxy)=-kx$.`, null, md`Sign: $(\curl\vb E)_x=\partial_y(3kxz)-\partial_z(2kyz)=0-2ky$.`, md`Redo each component: $(\curl\vb E)_x=\partial_yE_z-\partial_zE_y=-2ky$, so the $\uv x$ term involves $y$.`] },
          { lbl: 'V (for the possible field)', expr: '-k*(x*y^2 + y*z^2)', vars: { k: [0.5, 2], x: [-2, 2], y: [-2, 2], z: [-2, 2] }, accepts: ['-k*x*y^2 - k*y*z^2'] },
        ],
        sol: md`
          **Which is impossible.**

          (a) $\curl\vb E = k\left[\big(\partial_y(3xz)-\partial_z(2yz)\big)\uv x+\big(\partial_z(xy)-\partial_x(3xz)\big)\uv y+\big(\partial_x(2yz)-\partial_y(xy)\big)\uv z\right]=-k\left(2y\,\uv x+3z\,\uv y+x\,\uv z\right)\neq0.$

          (b) $\curl\vb E = k\left[(2z-2z)\,\uv x+(0-0)\,\uv y+(2y-2y)\,\uv z\right]=0.$

          So (a) is impossible and (b) is a possible electrostatic field.

          **Potential of (b).** Reference at the origin; path along the three legs:

          [[fig:path]]

          - Leg 1, $(0,0,0)\to(x,0,0)$: $y=z=0$, so $\vb E\cdot d\vb l=E_x\,dx'=k(0)^2\,dx'=0$.
          - Leg 2, $(x,0,0)\to(x,y,0)$: $z=0$, so $\vb E\cdot d\vb l=E_y\,dy'=k(2xy'+0)\,dy'$, giving $\int_0^y 2kxy'\,dy'=kxy^2$.
          - Leg 3, $(x,y,0)\to(x,y,z)$: $\vb E\cdot d\vb l=E_z\,dz'=2kyz'\,dz'$, giving $kyz^2$.

          $$V(x,y,z)=-\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l=-k\left(xy^2+yz^2\right).$$

          **Check.** $\nabla V=-k\left[y^2\,\uv x+(2xy+z^2)\,\uv y+2yz\,\uv z\right]=-\vb E$, and $V(0,0,0)=0$.

          **Why this works.** Zero curl guarantees every path gives the same $V$, so you choose the path that turns each leg into a one-variable integral. Doing the legs in another order (say $z$ first) must give the same $V$, a good independent check.
        `,
        figs: { path: { svg: figPath3D(), cap: 'Integration path: legs 1, 2, 3.' } },
      }),
      RF(md`
        !!key Patterns to remember
          - Test for "could this be electrostatic": $\curl\vb E=0$ everywhere. Swirls fail; so do straight field lines whose strength varies sideways.
          - $\curl\vb E=0$ ⇔ $\oint\vb E\cdot d\vb l=0$ ⇔ $\int_a^b\vb E\cdot d\vb l$ is path-independent ⇔ $\vb E=-\nabla V$.
          - $V(b)-V(a)=-\int_a^b\vb E\cdot d\vb l$. Along $\vb E$, $V$ drops; across $\vb E$, it stays put.
          - $V$ from $\vb E$: axis-parallel legs, the other coordinates frozen on each leg, then check with $-\nabla V$.
          - $\vb E$ from $V$: differentiate. The value of $V$ at a point says nothing about $\vb E$ there.
      `),
    ],
  };

  // ================================================================== Lesson 2
  const L2 = {
    id: 'u2-landscape', title: 'Reading V: landscape, reference point, units',
    steps: [
      RF(md`
        ### The landscape picture

        Think of $V(\vb r)$ as the height of a landscape (Lecture 4's "mountain range"). Then $-\nabla V$ points in the direction of steepest descent, so

        - $\vb E$ points **downhill**, from high $V$ to low $V$;
        - $|\vb E|$ is the **steepness**: large where the contour lines crowd together;
        - $\vb E$ is **perpendicular to the contour lines**. A surface of constant $V$ is an **equipotential**. Along one, $dV=-\vb E\cdot d\vb l=0$, so $\vb E$ has no component along it.

        A positive point charge is a peak and a negative one a pit. Field lines run down the slopes from peaks to pits.

        [[fig:land]]
      `, { land: { svg: figLandscape().svg, cap: 'A positive charge as a hill: $\\vb E$ points down the slopes, perpendicular to the contour circles.' } }),
      Q(md`The figure shows equipotentials of a $+q$ (left) and a $-q$ (right), drawn at equal steps of $V$. At which labelled point is $|\vb E|$ largest?`,
        [md`$A$`, md`$B$`, md`$C$`, md`$D$`], 0,
        [null,
          md`At $B$ the contours are widely spaced: $V$ changes slowly there.`,
          md`$C$ is far from both charges, where the contours are farthest apart.`,
          md`$D$ is beyond $+q$ on the far side, in a region of sparse contours.`],
        md`$|\vb E|=|\nabla V|$ is the rate of change of $V$ with distance. With contours drawn at equal steps of $V$, the field is strongest where they are closest together: between the charges, near $A$. There both charges push the same way, from $+q$ toward $-q$.`,
        { figHtml: figDipoleMap() }),
      Q(md`Same figure. Point $B$ lies on the dashed line, where $V=0$. Which way does $\vb E$ point at $B$?`,
        [md`Along the dashed line, upward`,
          md`Perpendicular to the dashed line, toward the $-q$ side ($+x$)`,
          md`Perpendicular to the dashed line, toward the $+q$ side ($-x$)`,
          md`Nowhere: $\vb E=0$ at $B$ because $V=0$ there`], 1,
        [md`Moving along an equipotential does not change $V$, so $\vb E$ has no component along it.`,
          null,
          md`$\vb E$ points downhill, from the $+q$ side ($V>0$) toward the $-q$ side ($V<0$).`,
          md`$V=0$ is just a value set by the reference at infinity. The slope of $V$ across the line is not zero.`],
        md`$\vb E$ is perpendicular to the equipotential through $B$ and points toward lower $V$. On the left $V>0$, on the right $V<0$, so $\vb E$ points to the right. Check by superposition: the push away from $+q$ and the pull toward $-q$ both have $+x$ components, and their vertical components cancel on the bisector.`,
        { figHtml: figDipoleMap() }),
      Q(md`Can two equipotential surfaces with **different** values of $V$ ever cross?`,
        [md`Yes, at points where $\vb E=0$.`,
          md`No. A point on both would have two different values of $V$.`,
          md`Yes, very close to a point charge, where $V$ blows up.`,
          md`Only where the field lines also cross.`], 1,
        [md`Where $\vb E=0$ a single equipotential can cross **itself** (the figure-eight around two equal charges). Two different values still cannot meet.`,
          null,
          md`Near a point charge the equipotentials are nested spheres. They get closer together but never touch.`,
          md`Field lines do not cross either (except at points where $\vb E=0$), but that is a separate fact.`],
        md`$V$ is a single-valued function: each point has one value. So the $V=3$ V surface and the $V=5$ V surface can never share a point. Equipotentials of different values nest, like contour lines on a map.`,
        { figHtml: figChordMap() }),
      Q(md`$P$ and $Q$ lie on the same equipotential circle around $q$, but the straight path from $P$ to $Q$ cuts across other equipotentials. What is $\int_P^Q\vb E\cdot d\vb l$ along the straight path?`,
        [md`Positive, because the path crosses contours`,
          md`It cannot be found without doing the integral.`,
          md`$|\vb E|$ times the length of the chord`,
          md`$0$`], 3,
        [md`On the way in the path climbs ($V$ rises) and on the way out it descends by the same amount. The pieces cancel.`,
          md`Path independence gives it without any integration: it equals $V(P)-V(Q)$.`,
          md`$\vb E$ is not uniform and is not parallel to the chord.`,
          null],
        md`$\int_P^Q\vb E\cdot d\vb l=V(P)-V(Q)=0$, for any path between them, because both points have the same potential. Along the chord the integrand is not zero everywhere: it is negative on the first half (moving inward against the outward field) and positive on the second, and the two halves cancel.`,
        { figHtml: figChordMap() }),
      RF(md`
        ### Only differences matter: the reference point

        The value of $V$ at a single point means nothing by itself. Move the reference from $\mathcal O$ to $\mathcal O'$ and every potential shifts by the same constant:

        $$V'(\vb r)=-\int_{\mathcal O'}^{\vb r}\vb E\cdot d\vb l=\underbrace{-\int_{\mathcal O'}^{\mathcal O}\vb E\cdot d\vb l}_{\text{constant }K}\;-\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l=K+V(\vb r).$$

        Differences $V(b)-V(a)$ do not change, and neither does the field: $-\nabla(V+K)=-\nabla V$. It works like altitude: "height above sea level" and "height above Denver" differ by a constant, and every slope is the same.

        The usual choice is $V(\infty)=0$: a point far from all the charges. In the lab the reference is the Earth, "ground": the 120 V of a wall outlet is measured relative to it. (Large solar and magnetic storms can shift ground potentials.)
      `),
      Q(md`You compute $V$ for some charges with $V(\infty)=0$ and find $V=50$ V at the point $\mathcal O'$. A classmate uses $\mathcal O'$ as the reference instead. Compared with yours, the classmate's potential is`,
        [md`the same everywhere, since physics cannot depend on the reference`,
          md`lower by 50 V at $\mathcal O'$ only, and unchanged far away`,
          md`lower by 50 V everywhere, with the same $\vb E$`,
          md`shifted by different amounts at different points, so $\vb E$ changes too`], 2,
        [md`The physics (fields, differences) is the same, but the numbers change: the classmate's $V(\mathcal O')=0$ while yours is 50 V.`,
          md`The shift is one constant added everywhere: $V'=V-50$ V, including far away, where the classmate gets $V'(\infty)=-50$ V.`,
          null,
          md`$V'-V=-\int_{\mathcal O'}^{\mathcal O}\vb E\cdot d\vb l$ does not depend on the field point. A constant shift leaves $\vb E=-\nabla V$ unchanged.`],
        md`$V'(\vb r)=V(\vb r)+K$, and $V'(\mathcal O')=0$ fixes $K=-50$ V. So $V'=V-50$ V everywhere and $\vb E'=-\nabla V'=-\nabla V=\vb E$. This is the Lecture 4 in-class question: does the constant change the electric field? No.`,
        { figHtml: figRefShift() }),
      Q(md`Two students use different reference points for the same charges. At $A$ they get $V_A=12$ V and $V'_A=-3$ V. At $B$ the first student gets $V_B=20$ V. What does the second student get at $B$?`,
        [md`$20$ V`, md`$35$ V`, md`$5$ V`, md`$-11$ V`], 2,
        [md`The two potentials differ by a constant at every point, including $B$: $V'-V=-15$ V.`,
          md`Wrong sign of the shift: $V'_A-V_A=-3-12=-15$ V, so $V'$ is lower.`,
          null,
          md`That would flip the difference $V_B-V_A=8$ V. Differences are the same for both students.`],
        md`$V'=V+K$ with $K=V'_A-V_A=-15$ V, so $V'_B=20-15=5$ V. Check: $V_B-V_A=8$ V and $V'_B-V'_A=5-(-3)=8$ V. Differences agree.`,
        { figHtml: figRefShift() }),
      RF(md`
        ### The potential of a point charge

        Lecture 4 example. Put $q$ at the origin, where $\vb E=\dfrac{q}{4\pi\ep}\dfrac{\uv r}{r^2}$. In-class question: what should $\mathcal O$ be? Infinity, where the field dies off. Integrate inward along a radial line, $d\vb l=dr'\,\uv r$:

        $$V(r)=-\int_\infty^r\frac{q}{4\pi\ep}\frac{dr'}{r'^2}=\frac{q}{4\pi\ep}\left[\frac1{r'}\right]_\infty^r=\frac{q}{4\pi\ep r}.$$

        Choosing infinity kills the lower limit. The minus sign in the definition makes $V$ positive near a positive charge: positive charges are hills, negative charges are pits, and $\vb E$ points outward (downhill) from $+q$. And $V\propto1/r$ while $E\propto1/r^2$: the potential dies off more slowly than the field.

        [[fig:pv]]

        !!trap $V$ is a scalar
          The notes write "$\vec V=-\int\dots$" with an arrow on $V$. The potential has no direction: $\vb E\cdot d\vb l$ is a dot product, so $V$ is a plain number at each point.
      `, { pv: { svg: figPointV(), cap: 'Potential of $+q$ (a hill) and $-q$ (a pit), with $V(\\infty)=0$.' } }),
      Q(md`What is the potential a distance $r$ from a point charge $-q$ ($q>0$), with $V(\infty)=0$?`,
        [md`$+\dfrac{q}{4\pi\ep r}$, since a potential is a magnitude`,
          md`$-\dfrac{q}{4\pi\ep r^2}$`,
          md`$-\dfrac{q}{4\pi\ep r}$`,
          md`$0$, because the field points inward`], 2,
        [md`$V$ carries the sign of the charge. A negative charge is a pit: $V<0$ all around it.`,
          md`$1/r^2$ belongs to the field. Integrating $1/r'^2$ gives $1/r$.`,
          null,
          md`$V=-\int_\infty^r\vb E\cdot d\vb l$ works for either direction of $\vb E$. Here $E_r=-\tfrac{q}{4\pi\ep r^2}$ and the integral gives $-\tfrac{q}{4\pi\ep r}$.`],
        md`Same integral with $q\to-q$: $V=-\dfrac{q}{4\pi\ep r}$. Coming in from infinity you move along $\vb E$ (it points toward $-q$), so $V$ keeps dropping below zero.`,
        { figHtml: figPointQ('-', false) }),
      Q(md`You move from $P$, a distance $r$ from a point charge, to $P_2$ at $2r$. By what factors do $V$ and $|\vb E|$ change?`,
        [md`$V$ halves; $|\vb E|$ drops to a quarter`,
          md`Both drop to a quarter.`,
          md`Both halve.`,
          md`$V$ drops to a quarter; $|\vb E|$ halves.`], 0,
        [null,
          md`Only the field goes as $1/r^2$; $V\propto1/r$.`,
          md`$|\vb E|\propto1/r^2$, so doubling $r$ divides it by 4.`,
          md`Swapped: $V\propto1/r$ and $E\propto1/r^2$.`],
        md`$V=\dfrac{q}{4\pi\ep r}\propto\dfrac1r$ and $E=\left|\dfrac{dV}{dr}\right|=\dfrac{q}{4\pi\ep r^2}\propto\dfrac1{r^2}$. Differentiating lowers the power by one.`,
        { figHtml: figPointQ('+', true) }),
      P({
        title: 'Point-charge potentials with numbers',
        q: md`A point charge $q=2.0$ nC sits at the origin. Use $\dfrac{1}{4\pi\ep}=8.99\times10^9\ \text{N·m}^2/\text{C}^2$ and $V(\infty)=0$. Find the potential at $P_1$, 10 cm away, and at $P_2$, 30 cm away, and the difference $V(P_1)-V(P_2)$.`,
        figHtml: figPointQ('+', true, { q: '2.0\\text{ nC}', p1: 'P_1', p2: 'P_2', r1: '10\\text{ cm}', r2: '30\\text{ cm}' }),
        hints: [md`$V=\dfrac{1}{4\pi\ep}\dfrac{q}{r}$ with $r$ in metres and $q$ in coulombs.`, md`$V(P_1)-V(P_2)=\dfrac{q}{4\pi\ep}\left(\dfrac1{0.10}-\dfrac1{0.30}\right)$.`],
        parts: [
          { lbl: 'V(P_1)', ans: 179.8, unit: 'V' },
          { lbl: 'V(P_2)', ans: 59.93, unit: 'V' },
          { lbl: 'V(P_1)-V(P_2)', ans: 119.87, unit: 'V' },
        ],
        sol: md`
          $\dfrac{q}{4\pi\ep}=(8.99\times10^9)(2.0\times10^{-9})=17.98$ V·m.

          - $V(P_1)=17.98/0.10=179.8$ V.
          - $V(P_2)=17.98/0.30=59.9$ V.
          - $V(P_1)-V(P_2)=119.8$ V. This difference would be the same with any reference point.

          Going from 10 cm to 30 cm the potential drops by a factor of 3 (not 9: that is the field).
        `,
      }),
      RF(md`
        ### When infinity cannot be the reference

        $V(\infty)=0$ works when the charge sits in a finite region: far away $E\sim1/r^2$ and $\int^\infty E\,dr$ converges. For the idealized distributions that extend to infinity it fails.

        **Infinite plane,** $\vb E=\dfrac{\sigma}{2\ep}\,\uv n$: $\ V(z)=-\displaystyle\int_\infty^z\dfrac{\sigma}{2\ep}\,dz'=-\dfrac{\sigma}{2\ep}(z-\infty)$, infinite at every point.

        **Infinite line,** $\vb E=\dfrac{\lambda}{2\pi\ep s}\,\uv s$: $\ \displaystyle\int^\infty\frac{ds}{s}=\ln s\,\Big|^\infty$ diverges, only logarithmically, but it diverges.

        The cure: put $\mathcal O$ somewhere finite, on the plane or at some radius $s=a$ from the line. Real charge distributions are finite, so this only arises in textbook idealizations.

        ### Worked example: an infinite line charge

        Uniform $\lambda$ on the $z$ axis, reference $V=0$ at $s=a$. Integrate radially from $s'=a$ to $s'=s$, with $d\vb l=ds'\,\uv s$:

        $$V(s)=-\int_a^s\frac{\lambda}{2\pi\ep s'}\,ds'=-\frac{\lambda}{2\pi\ep}\ln\frac{s}{a}.$$

        [[fig:line]]

        **Check:** $-\nabla V=-\dfrac{\partial V}{\partial s}\,\uv s=\dfrac{\lambda}{2\pi\ep s}\,\uv s$, the field we started from. For $\lambda>0$, $V>0$ inside $s<a$ and $V<0$ outside: still downhill away from the line. Moving the reference from $a$ to $a'$ adds the constant $\dfrac{\lambda}{2\pi\ep}\ln\dfrac{a'}{a}$ everywhere, as it must.
      `, { line: { svg: figLine(), cap: 'Line charge $\\lambda$ with the reference cylinder $s=a$ (dashed) and a field point at distance $s$.' } }),
      Q(md`For an infinite uniform line charge, why can't you use $V(\infty)=0$?`,
        [md`Because $\vb E=0$ at infinity`,
          md`Because the total charge is infinite, which makes $V$ negative`,
          md`You can; it just gives $V=0$ everywhere`,
          md`Because $\int^\infty\dfrac{ds}{s}$ diverges, so $-\int_\infty^s\vb E\cdot d\vb l$ is infinite at every point`], 3,
        [md`$\vb E\to0$ at infinity is true here too. The trouble is that it falls only as $1/s$, too slowly for the integral to converge.`,
          md`The sign is not the issue; convergence is. Every point would get an infinite value.`,
          md`The integral does not give 0. It diverges, so no finite value can be assigned.`,
          null],
        md`$V(s)=-\displaystyle\int_\infty^s\frac{\lambda}{2\pi\ep s'}\,ds'=\frac{\lambda}{2\pi\ep}\Big[\ln\infty-\ln s\Big]$, infinite. Differences like $V(s_1)-V(s_2)=\dfrac{\lambda}{2\pi\ep}\ln\dfrac{s_2}{s_1}$ are finite, which is all that is physical, so you just choose a finite reference radius.`,
        { figHtml: figLine({ ref: false }) }),
      Q(md`Positive line charge $\lambda$, reference $V=0$ at $s=a$. At $s=a/2$ the potential is`,
        [md`negative`, md`positive`, md`zero`, md`infinite`], 1,
        [md`Moving from $s=a$ inward you go against the outward field, so $V$ rises above zero.`,
          null,
          md`Only the reference radius $s=a$ has $V=0$.`,
          md`$V$ diverges only at $s=0$, on the line itself.`],
        md`$V(a/2)=-\dfrac{\lambda}{2\pi\ep}\ln\dfrac12=+\dfrac{\lambda\ln2}{2\pi\ep}>0$. Closer to a positive line is uphill.`,
        { figHtml: figLine({ callout: [17, md`P\ (s=a/2)`] }) }),
      Q(md`For a line charge you move the reference from $s=a$ to $s=2a$. The potential at every point`,
        [md`increases by $\dfrac{\lambda\ln2}{2\pi\ep}$`,
          md`decreases by $\dfrac{\lambda\ln2}{2\pi\ep}$`,
          md`doubles`,
          md`is unchanged`], 0,
        [null,
          md`Test at $s=2a$: before, $V(2a)=-\dfrac{\lambda\ln2}{2\pi\ep}<0$; after, $V(2a)=0$. It went up.`,
          md`A reference change adds a constant; it never rescales $V$.`,
          md`The zero moved, so every value shifts (by the same constant).`],
        md`$V_{\text{new}}(s)=-\dfrac{\lambda}{2\pi\ep}\ln\dfrac{s}{2a}=-\dfrac{\lambda}{2\pi\ep}\ln\dfrac sa+\dfrac{\lambda\ln2}{2\pi\ep}$. Same shape, shifted up; $\vb E$ unchanged.`,
        { figHtml: figLine() }),
      P({
        title: 'Potential of an infinite plane',
        q: md`An infinite plane at $z=0$ carries uniform $\sigma>0$. Its field is $\dfrac{\sigma}{2\ep}$, pointing away from the plane on both sides. Using the plane itself as the reference ($V=0$ at $z=0$), find $V(z)$ above the plane, $z>0$. Then decide what happens below.`,
        figHtml: figPlane(),
        hints: [md`$V(z)=-\int_0^z\vb E\cdot d\vb l$ along the $z$ axis, starting on the plane.`, md`Above the plane $\vb E\cdot d\vb l=+\dfrac{\sigma}{2\ep}\,dz'$.`, md`Below, the field points down ($-\uv z$), and you integrate from 0 to a negative $z$.`],
        parts: [
          { lbl: 'V(z)\\ (z>0)', expr: '-sigma*z/(2*eps0)', vars: { sigma: [0.5, 2], z: [0.2, 3], eps0: [0.5, 2] } },
          { lbl: md`For $z<0$ (below the plane), $V$ is`, mc: [md`$-\dfrac{\sigma|z|}{2\ep}$, the mirror image`, md`$+\dfrac{\sigma|z|}{2\ep}$`, md`$0$`], a: 0, why: [null, md`Below the plane the field points down, and moving down you move along it, so $V$ drops there too.`, md`$\vb E\neq0$ below the plane, so $V$ changes.`] },
        ],
        sol: md`
          Above: $V(z)=-\displaystyle\int_0^z\frac{\sigma}{2\ep}\,dz'=-\frac{\sigma z}{2\ep}$.

          Below: $\vb E=-\dfrac{\sigma}{2\ep}\uv z$, so $V(z)=-\displaystyle\int_0^z\left(-\frac{\sigma}{2\ep}\right)dz'=\frac{\sigma z}{2\ep}=-\frac{\sigma|z|}{2\ep}$ for $z<0$.

          Together, $V(z)=-\dfrac{\sigma|z|}{2\ep}$: a tent with its peak on the charged plane, and a kink there.

          [[fig:tent]]

          The kink at $z=0$ is no accident. Going up through the plane, the slope $dV/dz$ drops from $+\tfrac{\sigma}{2\ep}$ to $-\tfrac{\sigma}{2\ep}$, a change of $-\sigma/\ep$. That is the boundary condition $\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-\dfrac{\sigma}{\ep}$ of Lesson 7. With $V(\infty)=0$ you would have $V=-\infty$ everywhere, which is why the reference had to be finite.
        `,
        figs: { tent: { svg: gplot({ w: 280, h: 170, x: [-3, 3], y: [-1.6, 0.4], xl: 'z', yl: 'V', xt: [[0, '0']], yt: [], curves: [{ f: (z) => -0.5 * Math.abs(z) }] }), cap: md`$V(z)=-\sigma|z|/(2\ep)$: a tent peaked on the plane.` } },
      }),
      P({
        title: 'Potential difference near a line charge',
        q: md`A long straight wire carries $\lambda=3.0$ nC/m. Find $V(P_1)-V(P_2)$, where $P_1$ is 2.0 cm and $P_2$ is 5.0 cm from the wire. Use $\ep=8.85\times10^{-12}$ C²/(N·m²).`,
        figHtml: figLine({ ref: false, pts: [[50, md`2\un{cm}`, 'P_1'], [125, md`5\un{cm}`, 'P_2']] }),
        hints: [md`You do not need a reference point for a difference: $V(P_1)-V(P_2)=-\int_{P_2}^{P_1}\vb E\cdot d\vb l=\int_{s_1}^{s_2}E\,ds$.`, md`$\displaystyle\int_{s_1}^{s_2}\frac{\lambda}{2\pi\ep s}\,ds=\frac{\lambda}{2\pi\ep}\ln\frac{s_2}{s_1}$.`],
        parts: [{ lbl: 'V(P_1)-V(P_2)', ans: 49.43, unit: 'V' }],
        sol: md`
          $V(P_1)-V(P_2)=\dfrac{\lambda}{2\pi\ep}\ln\dfrac{s_2}{s_1}=\dfrac{3.0\times10^{-9}}{2\pi(8.85\times10^{-12})}\ln\dfrac{5.0}{2.0}=(53.9\text{ V})(0.916)=49.4$ V.

          Positive, as it should be: $P_1$ is closer to the positive wire, uphill. Only the ratio $s_2/s_1$ enters, so centimetres are fine here.
        `,
      }),
      RF(md`
        ### $V$ is not potential energy

        Units: $\vb E$ is in N/C; $V=-\int\vb E\cdot d\vb l$ is in N·m/C $=$ J/C, which is a **volt**. So $V$ is energy **per unit charge**, and N/C $=$ V/m, the usual unit for fields.

        The name "potential" invites confusion with "potential energy". They are different: $V$ is a property of the source charges, with no test charge anywhere in its definition. Unit 3 shows that the work needed to bring a charge $Q$ from the reference point to $\vb r$ is $Q\,V(\vb r)$; that is where the two connect.
      `),
      Q(md`Which of these is **not** a correct unit for the potential $V$?`,
        [md`J/C`, md`N·m/C`, md`V`, md`N/C`], 3,
        [md`J/C is the definition of the volt.`, md`N·m $=$ J, so N·m/C $=$ J/C $=$ V.`, md`The volt is the unit of potential.`, null],
        md`N/C is the unit of $\vb E$ (also written V/m). The potential is a field times a distance: N/C × m $=$ J/C $=$ V.`,
        { nofig: 'units question' }),
      Q(md`At point $P$ the potential is $V_P=200$ V (with $V(\infty)=0$). Which statement is correct?`,
        [md`Any charge placed at $P$ has 200 J of potential energy.`,
          md`A charge $Q$ at $P$ has potential energy $QV_P$; for $Q=-1$ nC that is $-200$ nJ.`,
          md`The field at $P$ is 200 V/m.`,
          md`$V_P$ doubles if you place $2Q$ at $P$ instead of $Q$.`], 1,
        [md`$V$ is energy per unit charge. The energy depends on the charge you put there: $QV_P$.`,
          null,
          md`The value of $V$ at one point says nothing about the field there; $\vb E$ depends on how $V$ changes.`,
          md`$V_P$ is set by the source charges. The test charge does not change it.`],
        md`$V$ is a property of the sources (J per C). The energy of a particular charge $Q$ placed there is $QV_P$ (Unit 3). It can be negative: a negative charge is "downhill" where $V$ is high.`,
        { nofig: 'meaning of V versus energy; no geometry involved' }),
      RF(md`
        !!key Patterns to remember
          - $\vb E$ points downhill in $V$, perpendicular to equipotentials; $|\vb E|$ is large where equipotentials crowd.
          - Equipotentials of different values never meet. $\int_a^b\vb E\cdot d\vb l=0$ between any two points at the same potential.
          - Only differences of $V$ are physical. Changing $\mathcal O$ adds one constant everywhere; $\vb E$ does not change.
          - Point charge: $V=\dfrac{q}{4\pi\ep r}$ with $V(\infty)=0$; the sign of $V$ is the sign of $q$; $V\propto1/r$ versus $E\propto1/r^2$.
          - Charge extending to infinity (line, plane): pick a finite reference. Line: $V=-\dfrac{\lambda}{2\pi\ep}\ln\dfrac sa$. Plane: $V=-\dfrac{\sigma|z|}{2\ep}$.
          - $V$ is in volts (J/C): energy per unit charge, not energy.
      `),
    ],
  };

  // ================================================================== Lesson 3 figures
  const figSlab = () => {
    const f = PF.fig();
    const xl = 110, xr = 190, yt = 34, yb = 166, ya = 100;
    f.rect(xl, yt, xr - xl, yb - yt, { cls: 'shade' });
    f.line(xl, yt, xl, yb); f.line(xr, yt, xr, yb);
    for (const yy of [52, 76, 124, 148]) for (const xx of [128, 150, 172]) plus(f, xx, yy);
    f.line(20, ya, 280, ya, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(284, ya, 'x', 'l', 'small accent');
    f.label(xl, yb + 6, '-d', 't', 'small'); f.label(xr, yb + 6, 'd', 't', 'small');
    f.label(150, yt - 6, md`\rho>0`, 'b', 'small');
    return f.svg();
  };
  const figSlabV = () => gplot({
    w: 280, h: 170, x: [-1.6, 1.6], y: [0, 1.3], yax: 0, xl: 'x', yl: 'V', xt: [[-1, '-d'], [1, 'd']],
    curves: [{ f: (x) => 1 - x * x, from: -1, to: 1 }],
    extra: (f, X, Y) => { f.label(X(0) + 8, Y(1) - 4, 'V_0', 'bl', 'small'); },
  });
  const figTriangle = () => {
    const f = PF.fig();
    const N = { r: [200, 34], E: [60, 214], V: [340, 214] };
    for (const [k, [x, y]] of Object.entries(N)) { f.circle(x, y, 18, { cls: 'dim' }); f.label(x, y, { r: md`\rho`, E: md`\vb E`, V: 'V' }[k], 'c'); }
    const pair = (A, B, n1, n2) => {
      const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], p = [-u[1], u[0]];
      const off = (P, s, d) => [P[0] + s * u[0] + d * p[0], P[1] + s * u[1] + d * p[1]];
      const a1 = off(A, 26, 7), b1 = off(B, -26, 7), a2 = off(B, -26, -7), b2 = off(A, 26, -7);
      f.arrow(a1[0], a1[1], b1[0], b1[1], { hs: 6 }); f.arrow(a2[0], a2[1], b2[0], b2[1], { hs: 6 });
      const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      f.label(m[0] + 20 * p[0], m[1] + 20 * p[1], n1, 'c', 'small');
      f.label(m[0] - 20 * p[0], m[1] - 20 * p[1], n2, 'c', 'small');
    };
    pair(N.r, N.E, '1', '2'); pair(N.r, N.V, '3', '4'); pair(N.E, N.V, '5', '6');
    return f.svg();
  };
  const figSphereR = () => {
    const f = PF.fig();
    const cx = 100, cy = 100, R = 70;
    f.circle(cx, cy, R);
    f.line(cx, cy, cx + R * Math.cos(30 * DEG), cy - R * Math.sin(30 * DEG), { cls: 'dim' });
    f.label(123.3, 70.4, 'R', 'c', 'small');
    const e = [cx + 45 * Math.cos(-60 * DEG), cy - 45 * Math.sin(-60 * DEG)];
    f.line(cx, cy, e[0], e[1], { cls: 'dim' });
    f.dot(e[0], e[1], 3.2);
    f.label(100.9, 125.5, 'r', 'c', 'small');
    f.dot(cx, cy, 2);
    return f.svg();
  };
  const figPlates = () => {
    const f = PF.fig();
    f.line(60, 30, 60, 170, { cls: 'thick' }); f.line(200, 30, 200, 170, { cls: 'thick' });
    for (let k = 0; k < 6; k++) { plus(f, 50, 42 + k * 24); minus(f, 210, 42 + k * 24); }
    f.label(60, 22, md`+\sigma`, 'b', 'small'); f.label(200, 22, md`-\sigma`, 'b', 'small');
    f.label(130, 100, md`\rho=0`, 'c', 'small');
    return f.svg();
  };
  const figYukawaV = () => gplot({
    w: 300, h: 190, x: [0, 4], y: [0, 3], xl: 'r', yl: 'V', xt: [[1, '1/\\lambda'], [2, '2/\\lambda']], yt: [[1, 'A\\lambda']],
    curves: [{ f: (r) => 1 / r, from: 0.3, cls: 'dash' }, { f: (r) => Math.exp(-r) / r, from: 0.2 }],
  });
  const figYukawaCloud = () => {
    const f = PF.fig();
    const cx = 100, cy = 100;
    const rings = [[18, 6, 0], [30, 9, 20], [44, 11, 5], [60, 12, 15], [78, 12, 0]];
    for (const [r, n, a0] of rings) for (let k = 0; k < n; k++) { const a = (a0 + k * 360 / n) * DEG; minus(f, cx + r * Math.cos(a), cy - r * Math.sin(a), 3); }
    f.charge(cx, cy, { q: '+' });
    f.circle(cx, cy, 92, { cls: 'dash dim' });
    return f.svg();
  };
  const figYukawaQ = () => gplot({
    w: 300, h: 180, x: [0, 6], y: [0, 1.2], xl: 'r', yl: 'Q_{\\text{enc}}', xt: [[1, '1/\\lambda'], [3, '3/\\lambda']], yt: [[1, '4\\pi\\varepsilon_0A']],
    curves: [{ f: (r) => Math.exp(-r) * (1 + r), from: 0 }],
  });

  // ================================================================== Lesson 3
  const L3 = {
    id: 'u2-poisson', title: "Poisson's equation",
    steps: [
      RF(md`
        ### A differential equation for $V$

        Combine $\vb E=-\nabla V$ with Gauss's law in differential form, $\divg\vb E=\rho/\ep$:

        $$\divg\vb E=\divg(-\nabla V)=-\lap V=\frac{\rho}{\ep}\quad\Longrightarrow\quad\boxed{\lap V=-\frac{\rho}{\ep}}\qquad\text{(Poisson's equation)}$$

        with $\lap=\dfrac{\partial^2}{\partial x^2}+\dfrac{\partial^2}{\partial y^2}+\dfrac{\partial^2}{\partial z^2}$ in Cartesian coordinates; the spherical and cylindrical forms are on the formula sheet. Where there is no charge it becomes **Laplace's equation**, $\lap V=0$. Unit 4 is about solving that one.

        What about the other equation, $\curl\vb E=0$? It puts **no** condition on $V$, because $\curl(\nabla V)=0$ for every function. One scalar equation does the work of the two vector equations for $\vb E$.

        Poisson's equation together with boundary conditions fixes $V$. That is how simulation software finds potentials: it puts space on a grid and solves $\lap V=-\rho/\ep$ numerically, with $V$ given on the edges.

        !!intuition What the sign says
          In one dimension $V''=-\rho/\ep$. Positive charge makes $V''<0$: the graph of $V$ bends downward, a hilltop. Negative charge makes a valley. No charge means no curvature: in 1-D, $V$ is a straight line there and cannot have a peak or a dip.
      `),
      Q(md`In one dimension Poisson's equation reads $\dfrac{d^2V}{dx^2}=-\dfrac{\rho}{\ep}$. Inside the slab of positive charge shown, the graph of $V(x)$ is`,
        [md`concave up, like a valley`, md`a straight line`, md`concave down, like a hilltop`, md`zero everywhere`], 2,
        [md`Concave up means $V''>0$, which needs $\rho<0$.`,
          md`A straight line has $V''=0$: no charge (Laplace). Inside the slab $\rho\neq0$.`,
          null,
          md`$V$ can take any value; only its curvature is fixed by $\rho$.`],
        md`$V''=-\rho/\ep<0$, so $V$ curves downward inside the slab: a hilltop, as you would expect for positive charge. Outside the slab $\rho=0$, $V''=0$, and $V$ continues as straight lines.`,
        { figHtml: figSlab() }),
      Q(md`Once you write $\vb E=-\nabla V$, which condition does $\curl\vb E=0$ impose on $V$?`,
        [md`$\lap V=0$`, md`None: $\curl(\nabla V)=0$ for every function $V$`, md`$\nabla V=0$`, md`$V$ must vanish at infinity`], 1,
        [md`That is Laplace's equation. It comes from Gauss's law with $\rho=0$, not from the curl.`,
          null,
          md`That would make $\vb E=0$ everywhere.`,
          md`The reference point is a choice, not a consequence of the curl.`],
        md`The curl of a gradient is identically zero. Writing $\vb E=-\nabla V$ builds $\curl\vb E=0$ in automatically, so only Gauss's law is left, and it becomes Poisson's equation.`,
        { nofig: 'vector identity; nothing to draw' }),
      Q(md`$V$ depends only on the spherical radius $r$. Which expression is $\lap V$?`,
        [md`$\dfrac{d^2V}{dr^2}$`, md`$\dfrac{1}{r}\dfrac{d}{dr}\left(r\dfrac{dV}{dr}\right)$`, md`$\dfrac{1}{r^2}\dfrac{d^2}{dr^2}\left(r^2V\right)$`, md`$\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{dV}{dr}\right)$`], 3,
        [md`That is the Cartesian form. In spherical coordinates the area grows as $r^2$, which adds a first-derivative term.`,
          md`That is the cylindrical form, for $V(s)$.`,
          md`Close, but not the same. (The form $\tfrac1r\tfrac{d^2}{dr^2}(rV)$ does work.)`,
          null],
        md`From the formula sheet, $\lap V=\dfrac{1}{r^2}\dfrac{\partial}{\partial r}\left(r^2\dfrac{\partial V}{\partial r}\right)+(\text{angular terms})$, and the angular terms vanish when $V=V(r)$. The $r^2$ is the area factor: flux through a sphere is $4\pi r^2E_r$.`,
        { nofig: 'formula recognition' }),
      RF(md`
        ### The equation runs "backwards"

        Lecture 5 opens with a complaint: Poisson's equation is backwards from what you usually want. Given $V$, it hands you $\rho$ by differentiating. Usually you know $\rho$ and want $V$. Inverting $\lap$ properly takes Green's functions (graduate E&M). Lesson 4 does it physically, by adding up point charges:

        $$V(\vb r)=\kq\int\frac{\rho(\vb r\,')}{\srm}\,d\tau' .$$

        The three quantities $\rho$, $\vb E$, $V$ and the six relations between them (Griffiths Fig. 2.35):

        [[fig:tri]]

        | Arrow | Direction | Relation |
        |---|---|---|
        | 1 | $\rho\to\vb E$ | $\vb E=\kq\displaystyle\int\frac{\rho\,\srh}{\srm^2}\,d\tau'$ |
        | 2 | $\vb E\to\rho$ | $\divg\vb E=\rho/\ep$ (with $\curl\vb E=0$) |
        | 3 | $\rho\to V$ | $V=\kq\displaystyle\int\frac{\rho}{\srm}\,d\tau'$ |
        | 4 | $V\to\rho$ | $\lap V=-\rho/\ep$ |
        | 5 | $\vb E\to V$ | $V=-\displaystyle\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l$ |
        | 6 | $V\to\vb E$ | $\vb E=-\nabla V$ |

        Arrows toward $\rho$ (2, 4) and arrow 6 are differentiations: easy. Arrows 1, 3, 5 are integrations: harder, and of these, 3 has no unit vector in it.
      `, { tri: { svg: figTriangle(), cap: 'The triangle of electrostatics. Each arrow is one relation in the table.' } }),
      Q(md`You know $\rho$ everywhere for a localized charge distribution with no useful symmetry, and you want $\vb E$. Which route is usually least work?`,
        [md`Arrow 1: integrate Coulomb's law for $\vb E$ directly`,
          md`Arrow 3 then arrow 6: integrate for the scalar $V$, then take $-\nabla V$`,
          md`Gauss's law with a cleverly chosen surface`,
          md`Solve $\lap V=-\rho/\ep$ by guessing`],
        1,
        [md`It works, but it is three integrals (one per component), each with the unit vector $\srh$ to resolve.`,
          null,
          md`Gauss's law gives $\vb E$ only when symmetry makes $|\vb E|$ constant on the surface. Here there is none.`,
          md`Guessing works only in special cases; Unit 4 has systematic methods for $\rho=0$ regions with boundaries.`],
        md`The $V$ integral is one scalar integral with no components. Once you have $V(\vb r)$ as a function of position (not just on an axis), $\vb E=-\nabla V$ is differentiation. Lesson 4 is built on this route.`,
        { figHtml: figTriangle() }),
      Q(md`In some region $V(x)=V_0\dfrac{x^2}{a^2}$, with no dependence on $y$ or $z$. What is $\rho$ there?`,
        [md`$-\dfrac{2\ep V_0}{a^2}$`, md`$+\dfrac{2\ep V_0}{a^2}$`, md`$0$, because $V=0$ at $x=0$`, md`$-\dfrac{\ep V_0}{a^2}$`], 0,
        [null,
          md`Sign: $\rho=-\ep\lap V$, and $\lap V=+2V_0/a^2$.`,
          md`Poisson's equation is local: $\rho$ comes from the curvature of $V$, which is the same everywhere here.`,
          md`$\dfrac{d^2}{dx^2}\left(x^2\right)=2$, not 1.`],
        md`$\lap V=\dfrac{d^2V}{dx^2}=\dfrac{2V_0}{a^2}$, so $\rho=-\ep\lap V=-\dfrac{2\ep V_0}{a^2}$: a uniform negative density. A valley-shaped $V$ means negative charge.`,
        { nofig: 'V given as a formula' }),
      RF(md`
        ### Worked example: what charge makes this potential?

        $V(x)=V_0\left(1-\dfrac{x^2}{d^2}\right)$ for $|x|<d$, with $V_0>0$.

        [[fig:sv]]

        **Charge:** $\rho=-\ep\dfrac{d^2V}{dx^2}=-\ep\left(-\dfrac{2V_0}{d^2}\right)=\dfrac{2\ep V_0}{d^2}$, uniform and positive: a charged slab.

        **Field:** $\vb E=-\dfrac{dV}{dx}\,\uv x=\dfrac{2V_0x}{d^2}\,\uv x$. It points away from the mid-plane on both sides and vanishes at $x=0$, as symmetry demands.

        **Check with Gauss's law:** a pillbox from $-x$ to $x$ with faces of area $A$ has flux $2EA$ and encloses $\rho\cdot2xA$, so $E=\rho x/\ep=2V_0x/d^2$. The two routes agree.
      `, { sv: { svg: figSlabV(), cap: 'The given potential inside the slab.' } }),
      P({
        title: 'Charge density from a potential',
        q: md`Inside a sphere of radius $R$, the potential is $V(r)=V_0\left(\dfrac{r}{R}\right)^3$, with $V_0>0$. Find the charge density $\rho(r)$ for $r<R$, and the direction of $\vb E$ inside.`,
        figHtml: figSphereR(),
        hints: [
          md`$\rho=-\ep\lap V$. $V$ depends only on $r$, so use $\lap V=\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{dV}{dr}\right)$.`,
          md`$\dfrac{dV}{dr}=\dfrac{3V_0r^2}{R^3}$, so $r^2\dfrac{dV}{dr}=\dfrac{3V_0r^4}{R^3}$.`,
        ],
        parts: [
          { lbl: '\\rho(r)', expr: '-12*eps0*V0*r/R^3', vars: { eps0: [0.5, 2], V0: [0.5, 3], r: [0.2, 1], R: [1.2, 2.5] }, accepts: ['-12*eps0*V0*r/(R^3)'] },
          { lbl: md`Inside the sphere, $\vb E$ points`, mc: [md`radially outward`, md`radially inward`, md`nowhere: $\vb E=0$`], a: 1, why: [md`$V$ increases outward, so downhill is inward.`, null, md`$dV/dr\neq0$ for $r>0$, so $\vb E\neq0$.`] },
        ],
        sol: md`
          $\dfrac{dV}{dr}=\dfrac{3V_0r^2}{R^3}$, so

          $$\lap V=\frac{1}{r^2}\frac{d}{dr}\left(\frac{3V_0r^4}{R^3}\right)=\frac{12V_0r}{R^3},\qquad \rho=-\ep\lap V=-\frac{12\ep V_0\,r}{R^3}.$$

          Negative, and growing in size with $r$ (for $V_0>0$). The field $\vb E=-\dfrac{dV}{dr}\uv r=-\dfrac{3V_0r^2}{R^3}\uv r$ points inward, toward the center, where $V$ is lowest. An inward field means negative enclosed charge, consistent with $\rho<0$.

          **Check with Gauss:** $Q_{\text{enc}}(r)=\int_0^r\rho\,4\pi r'^2dr'=-\dfrac{12\ep V_0}{R^3}\cdot\pi r^4$, and $\ep\oint\vb E\cdot d\vb a=\ep\left(-\dfrac{3V_0r^2}{R^3}\right)4\pi r^2=-\dfrac{12\pi\ep V_0r^4}{R^3}$. They agree.
        `,
      }),
      Q(md`The infinite-line potential $V(s)=-\dfrac{\lambda}{2\pi\ep}\ln\dfrac sa$ is valid for $s>0$. What is $\lap V$ there?`,
        [md`$-\dfrac{\lambda}{2\pi\ep s^2}$`, md`$-\dfrac{\lambda}{\ep}$`, md`$0$`, md`$\dfrac{\lambda}{2\pi\ep s}$`], 2,
        [md`That is $\dfrac{d^2V}{ds^2}$ alone. The cylindrical Laplacian is $\dfrac1s\dfrac{d}{ds}\left(s\dfrac{dV}{ds}\right)$, and $s\,dV/ds$ is constant.`,
          md`$\lambda$ is a line density (C/m), not a volume density. Away from the line, $\rho=0$.`,
          null,
          md`That is $-dV/ds$, the field, not the Laplacian.`],
        md`$s\dfrac{dV}{ds}=-\dfrac{\lambda}{2\pi\ep}$ is a constant, so $\lap V=\dfrac1s\dfrac{d}{ds}(\text{const})=0$: no charge away from the line. All the charge sits on $s=0$, where $V$ blows up. The point charge is the same story: $\lap\dfrac1r=0$ for $r>0$, with everything concentrated at the origin.`,
        { figHtml: figLine({ ref: false, pts: [[150, 's', 'P']] }) }),
      Q(md`$V=\dfrac{k}{r}$ (with $k$ a constant) satisfies $\lap V=0$ for every $r>0$. What does Poisson's equation say about the origin?`,
        [md`Nothing: $\rho=0$ everywhere.`,
          md`There is a point charge $q=4\pi\ep k$ there, since $\lap\dfrac1r=-4\pi\delta^3(\vb r)$.`,
          md`There is a point charge $-4\pi\ep k$ there.`,
          md`There is a charge density $k/r^3$ near the origin.`], 1,
        [md`Then $\vb E=k\,\uv r/r^2$ would have flux $4\pi k$ through every sphere around the origin with no charge inside, contradicting Gauss's law.`,
          null,
          md`Sign: $\rho=-\ep\lap V=-\ep k\left(-4\pi\delta^3\right)=+4\pi\ep k\,\delta^3$.`,
          md`$\rho$ vanishes for every $r>0$. All of it is concentrated at a single point.`],
        md`From Unit 0: $\divg(\uv r/r^2)=4\pi\delta^3(\vb r)$ and $\nabla(1/r)=-\uv r/r^2$, so $\lap(1/r)=-4\pi\delta^3(\vb r)$. Then $\rho=-\ep\lap V=4\pi\ep k\,\delta^3(\vb r)$: a point charge $q=4\pi\ep k$. That is just $V=\dfrac{q}{4\pi\ep r}$ read backwards. You need this in Discussion 3 below.`,
        { nofig: 'identity for 1/r' }),
      Q(md`Between two oppositely charged plates there is no charge. Which statement about the region between them is correct?`,
        [md`$V=0$ there.`, md`$\vb E=0$ there.`, md`$\lap V=0$ there, but $V$ and $\vb E$ need not vanish.`, md`$V$ must be constant there.`], 2,
        [md`The plates are at different potentials, and $V$ changes steadily from one to the other.`,
          md`The field between charged plates is the strongest anywhere in the setup.`,
          null,
          md`Constant $V$ is one solution of Laplace's equation, but so is $V=-E_0x+C$, which is what you get here.`],
        md`$\rho=0$ means $\lap V=0$, nothing more. Here $V$ is linear in $x$ (zero curvature) and $\vb E$ is uniform. Laplace's equation constrains the curvature of $V$, not its value or slope.`,
        { figHtml: figPlates() }),
      Q(md`Simulation software finds $V$ by solving $\lap V=-\rho/\ep$ on a grid. Besides $\rho$, what must you give it?`,
        [md`The value of $\vb E$ at every grid point`,
          md`Nothing else; $\rho$ alone fixes $V$`,
          md`The total charge only`,
          md`Boundary conditions: $V$ (or its normal derivative) on the edges of the region`], 3,
        [md`If you knew $\vb E$ everywhere you would not need to solve anything.`,
          md`Add any solution of Laplace's equation to $V$ and $\rho$ is unchanged. The boundary values pick out the right one.`,
          md`The total charge is far too little information to fix $V(\vb r)$.`,
          null],
        md`Poisson's equation determines $V$ only up to a solution of $\lap V=0$. Boundary conditions remove that freedom (the uniqueness theorems of Unit 4 make this precise). Lecture 4: "Poisson's eqⁿ + boundary conditions allows us to find $V$ directly from a charge distribution."`,
        { nofig: 'statement about numerical methods' }),
      RF(md`
        !!method Reading the charge off a given potential
          1. **Field:** $\vb E=-\nabla V$. For $V(r)$ only, $\vb E=-\dfrac{dV}{dr}\uv r$.
          2. **Smooth part:** $\rho=-\ep\lap V$ (or $\ep\divg\vb E$) wherever $V$ is smooth.
          3. **Singular points:** where $V\sim c/r$, there is a point charge $4\pi\ep c$. Check with the flux of $\vb E$ through a tiny sphere.
          4. **Total charge:** Gauss's law on a huge sphere: $Q=\ep\oint\vb E\cdot d\vb a=4\pi\ep r^2E_r$ as $r\to\infty$.
      `),
      P({
        id: 'D3-2.51', src: 'Discussion 3 · Griffiths 2.51', title: 'A screened point charge', big: true,
        q: md`The electric potential of some configuration is given by the expression

          $$V(\vb r)=A\frac{e^{-\lambda r}}{r},$$

          where $A$ and $\lambda$ are constants. Find the electric field $\vb E(\vb r)$, the charge density $\rho(r)$, and the total charge $Q$. [*Answer:* $\rho=\ep A\left(4\pi\delta^3(\vb r)-\lambda^2e^{-\lambda r}/r\right)$]

          (The graph shows the given $V(r)$, solid, for $A>0$, with $r$ in units of $1/\lambda$. The dashed curve is $A/r$, for comparison.)`,
        figHtml: figYukawaV(),
        hints: [
          md`$V$ depends only on $r$, so $\vb E=-\dfrac{dV}{dr}\,\uv r$. Use the product rule on $e^{-\lambda r}\cdot r^{-1}$.`,
          md`For $r>0$: $\rho=\ep\divg\vb E=\dfrac{\ep}{r^2}\dfrac{d}{dr}\left(r^2E_r\right)$. You should find $r^2E_r=Ae^{-\lambda r}(1+\lambda r)$.`,
          md`At the origin, $\vb E\to A\,\uv r/r^2$: a point-charge field. Write $\vb E=f(r)\,\uv r/r^2$ with $f=Ae^{-\lambda r}(1+\lambda r)$ and use $\divg(f\vb A)=f\,\divg\vb A+\vb A\cdot\nabla f$ with $\divg(\uv r/r^2)=4\pi\delta^3(\vb r)$.`,
          md`Total charge: integrate $\rho$ over all space ($\int_0^\infty re^{-\lambda r}dr=1/\lambda^2$), or use Gauss's law on a sphere of radius $r\to\infty$.`,
        ],
        parts: [
          { lbl: 'E_r', expr: 'A*exp(-lambda*r)*(1+lambda*r)/r^2', vars: { A: [0.5, 2], lambda: [0.3, 2], r: [0.2, 3] }, accepts: ['A*exp(-lambda*r)/r^2 + A*lambda*exp(-lambda*r)/r'] },
          { lbl: '\\rho\\ (r>0)', expr: '-eps0*A*lambda^2*exp(-lambda*r)/r', vars: { eps0: [0.5, 2], A: [0.5, 2], lambda: [0.3, 2], r: [0.2, 3] } },
          { lbl: md`What sits at the origin?`, mc: [md`a point charge $4\pi\ep A$`, md`nothing; $\rho$ is just large there`, md`a point charge $-4\pi\ep A$`, md`a point charge $A$`], a: 0, why: [null, md`$\rho$ for $r>0$ goes as $1/r$, which integrates to a finite charge near 0. The $1/r^2$ field at the origin needs a genuine point charge.`, md`Near the origin $V\approx A/r$, the potential of a positive charge $4\pi\ep A$ (for $A>0$).`, md`Units: $A$ is in V·m. The charge is $4\pi\ep A$.`] },
          { lbl: 'Q_{\\text{total}}', ans: 0, unit: '' },
        ],
        sol: md`
          **Field.** $\dfrac{dV}{dr}=A\left(\dfrac{-\lambda e^{-\lambda r}}{r}-\dfrac{e^{-\lambda r}}{r^2}\right)=-\dfrac{Ae^{-\lambda r}(1+\lambda r)}{r^2}$, so

          $$\vb E=-\frac{dV}{dr}\,\uv r=A\,e^{-\lambda r}\,\frac{1+\lambda r}{r^2}\,\uv r .$$

          **Charge for $r>0$.** $r^2E_r=Ae^{-\lambda r}(1+\lambda r)$, and $\dfrac{d}{dr}\left[e^{-\lambda r}(1+\lambda r)\right]=-\lambda e^{-\lambda r}(1+\lambda r)+\lambda e^{-\lambda r}=-\lambda^2re^{-\lambda r}$. So

          $$\rho=\frac{\ep}{r^2}\frac{d}{dr}\left(r^2E_r\right)=-\ep A\lambda^2\frac{e^{-\lambda r}}{r}\qquad(r>0).$$

          **The origin.** Write $\vb E=f(r)\,\dfrac{\uv r}{r^2}$ with $f(r)=Ae^{-\lambda r}(1+\lambda r)$, $f(0)=A$. Then

          $$\divg\vb E=f\,\divg\!\left(\frac{\uv r}{r^2}\right)+\frac{\uv r}{r^2}\cdot\nabla f=4\pi A\,\delta^3(\vb r)+\frac{f'(r)}{r^2},$$

          using $f(r)\delta^3(\vb r)=f(0)\delta^3(\vb r)$. Hence

          $$\rho=\ep A\left(4\pi\delta^3(\vb r)-\lambda^2\frac{e^{-\lambda r}}{r}\right),$$

          the quoted answer: a point charge $q=4\pi\ep A$ at the origin plus a cloud of the opposite sign.

          **Total charge.** $Q=4\pi\ep A-\ep A\lambda^2\displaystyle\int_0^\infty\frac{e^{-\lambda r}}{r}\,4\pi r^2\,dr=4\pi\ep A-4\pi\ep A\lambda^2\cdot\frac{1}{\lambda^2}=0.$

          Gauss's law agrees: the charge inside radius $r$ is $\ep\,4\pi r^2E_r=4\pi\ep A\,e^{-\lambda r}(1+\lambda r)$, which starts at $4\pi\ep A$ and falls to 0 as $r\to\infty$.

          [[fig:cloud]]

          [[fig:qenc]]

          **What it is.** A positive point charge wrapped in a negative cloud of exactly opposite total charge: a **screened** charge. Far away ($r\gg1/\lambda$) the cloud cancels the charge and $V$ dies exponentially instead of as $1/r$. This is how a charge looks inside a plasma or an electrolyte (Debye screening); $1/\lambda$ is the screening length.

          **What to remember:** differentiate for the smooth part, and look for a $1/r$ singularity to find hidden point charges. Gauss's law at large $r$ gives the total charge in one line.
        `,
        figs: {
          cloud: { svg: figYukawaCloud(), cap: 'Point charge $4\\pi\\varepsilon_0A$ at the center, inside a negative cloud whose density falls off as $e^{-\\lambda r}/r$.' },
          qenc: { svg: figYukawaQ(), cap: 'Charge enclosed within radius $r$: it starts at $4\\pi\\varepsilon_0A$ and is screened to zero.' },
        },
      }),
      RF(md`
        !!key Patterns to remember
          - Poisson: $\lap V=-\rho/\ep$. Laplace where $\rho=0$. Mind the minus sign: positive charge makes $V$ bend down (a hilltop).
          - $\curl\vb E=0$ is automatic once $\vb E=-\nabla V$; Poisson carries all of Gauss's law.
          - From $V$ to $\rho$: differentiate. Use the right Laplacian ($\tfrac{1}{r^2}\tfrac{d}{dr}r^2\tfrac{d}{dr}$ for spheres, $\tfrac1s\tfrac{d}{ds}s\tfrac{d}{ds}$ for cylinders).
          - A $c/r$ singularity hides a point charge $4\pi\ep c$, because $\lap\tfrac1r=-4\pi\delta^3(\vb r)$.
          - Total charge: Gauss on a huge sphere, $Q=4\pi\ep r^2E_r$ as $r\to\infty$.
          - From $\rho$ to $V$: integrate (Lesson 4). Poisson plus boundary conditions also fixes $V$ (Unit 4).
      `),
    ],
  };

  // ================================================================== Lesson 4 figures
  const shorten = (A, B, s0, s1) => {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
    return [A[0] + u[0] * s0, A[1] + u[1] * s0, B[0] - u[0] * s1, B[1] - u[1] * s1];
  };
  const figVectors = () => {
    const f = PF.fig();
    const O = [30, 190], Pp = [260, 50], q1 = [90, 60], q2 = [190, 175];
    f.arrow(...shorten(O, Pp, 0, 4), { hs: 7 });
    f.arrow(...shorten(O, q1, 0, 9), { hs: 7 });
    f.arrow(...shorten(O, q2, 0, 9), { hs: 7 });
    f.arrow(...shorten(q1, Pp, 9, 4), { cls: 'dash dim', hs: 6 });
    f.arrow(...shorten(q2, Pp, 9, 4), { cls: 'dash dim', hs: 6 });
    f.charge(q1[0], q1[1], { q: '', lab: 'q_1', at: 'tl' });
    f.charge(q2[0], q2[1], { q: '', lab: 'q_2', at: 'br' });
    f.dot(Pp[0], Pp[1], 3.4); f.tag(Pp[0], Pp[1], 'P', 'tr', 6);
    f.dot(O[0], O[1], 2.4); f.tag(O[0], O[1], 'O', 'bl', 6, 'small');
    f.label(154.4, 135.4, md`\vb r`, 'c', 'small');
    f.label(32.7, 112.4, md`\vb r_1'`, 'c', 'small');
    f.label(111.5, 198.4, md`\vb r_2'`, 'c', 'small');
    f.label(175, 40, md`\srm_1`, 'c', 'small');
    f.label(239, 120.3, md`\srm_2`, 'c', 'small');
    return f.svg();
  };
  const figSquare = () => {
    const f = PF.fig();
    f.rect(40, 40, 120, 120, { cls: 'dash dim' });
    for (const [x, y, at] of [[40, 40, 'tl'], [160, 40, 'tr'], [160, 160, 'br'], [40, 160, 'bl']]) f.charge(x, y, { q: '+', lab: '+q', at });
    f.dot(100, 100, 3.4); f.tag(100, 100, 'P', 'r', 7);
    f.dim(40, 160, 160, 160, 'a', { off: 22, at: 'b' });
    return f.svg();
  };
  const figDipoleMid = () => {
    const f = PF.fig();
    f.line(48, 70, 192, 70, { cls: 'dash dim' });
    f.charge(40, 70, { q: '+', lab: '+q', at: 'b' });
    f.charge(200, 70, { q: '-', lab: '-q', at: 'b' });
    f.dot(120, 70, 3.4); f.tag(120, 70, 'M', 'b', 7);
    f.dim(40, 70, 200, 70, 'd', { off: -24, at: 't' });
    return f.svg();
  };
  const fig2q = () => {
    const f = PF.fig();
    f.line(10, 80, 330, 80, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(334, 80, 'x', 'l', 'small accent');
    f.charge(60, 80, { q: '+', lab: '+2q', at: 't' });
    f.charge(180, 80, { q: '-', lab: '-q', at: 't' });
    f.line(60, 89, 60, 96, { cls: 'dim' }); f.label(60, 100, '0', 't', 'small');
    f.line(180, 89, 180, 96, { cls: 'dim' }); f.label(180, 100, 'd', 't', 'small');
    return f.svg();
  };
  const fig3charges = () => {
    const f = PF.fig();
    const S = 40, O = [50, 200], at = (x, y) => [O[0] + S * x, O[1] - S * y];
    const q1 = at(0, 0), q2 = at(3, 0), q3 = at(0, 4), Pp = at(3, 4);
    f.rect(q3[0], q3[1], 3 * S, 4 * S, { cls: 'dash dim' });
    f.charge(...q1, { q: '+', lab: md`+4.0\text{ nC}`, at: 'bl' });
    f.charge(...q2, { q: '-', lab: md`-2.0\text{ nC}`, at: 'r' });
    f.charge(...q3, { q: '+', lab: md`+1.0\text{ nC}`, at: 'tr' });
    f.dot(...Pp, 3.4); f.tag(...Pp, 'P', 'tr', 7);
    f.dot(O[0] + 1.5 * S, O[1], 3); f.tag(O[0] + 1.5 * S, O[1], 'M', 't', 7);
    f.dim(...q1, ...q2, md`3.0\un{cm}`, { off: 26, at: 'b' });
    f.dim(...q3, ...q1, md`4.0\un{cm}`, { off: 26, at: 'l' });
    return f.svg();
  };
  const figSegment = () => {
    const f = PF.fig();
    const cx = 150, ya = 180, L = 90, zP = 50, xe = cx + 60;
    f.line(20, ya, 290, ya, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(294, ya, 'x', 'l', 'small accent');
    f.line(cx, ya + 14, cx, 22, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 5, 20, 'z', 'bl', 'small accent');
    f.line(cx - L, ya, cx + L, ya, { cls: 'thick' });
    f.line(xe - 5, ya - 6, xe - 5, ya + 6, { cls: 'dim' }); f.line(xe + 5, ya - 6, xe + 5, ya + 6, { cls: 'dim' });
    f.line(xe, ya, cx, zP, { cls: 'dash' });
    f.dot(cx, zP, 3.4); f.tag(cx, zP, 'P', 'r', 8);
    f.label(cx - L, ya + 6, '-L', 't', 'small'); f.label(cx + L, ya + 6, 'L', 't', 'small');
    f.label(xe, ya + 6, 'x', 't', 'small'); f.label(xe + 10, ya - 8, 'dx', 'bl', 'small');
    f.label(192.7, 109.1, md`\srm`, 'c', 'small');
    f.label(cx - 50, ya - 8, md`\lambda`, 'b', 'small');
    f.dim(cx, ya, cx, zP, '', { off: -22 }); f.label(cx - 30, (ya + zP) / 2, 'z', 'r', 'small');
    return f.svg();
  };
  const figSegEnd = () => {
    const f = PF.fig();
    const x0 = 60, ya = 170, L = 180, zP = 50;
    f.line(x0 - 20, ya, x0 + L + 40, ya, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(x0 + L + 44, ya, 'x', 'l', 'small accent');
    f.line(x0, ya + 12, x0, 22, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(x0 + 5, 20, 'z', 'bl', 'small accent');
    f.line(x0, ya, x0 + L, ya, { cls: 'thick' });
    f.dot(x0, zP, 3.4); f.tag(x0, zP, 'P', 'r', 8);
    f.label(x0 + L / 2, ya - 8, md`\lambda`, 'b', 'small');
    f.dim(x0, ya, x0 + L, ya, 'L', { off: 22, at: 'b' });
    f.dim(x0, ya, x0, zP, '', { off: -24 }); f.label(x0 - 30, (ya + zP) / 2, 'z', 'r', 'small');
    return f.svg();
  };
  // ring of radius R (perspective), field point on the axis, piece dq and its distance to P
  const figRing = () => {
    const f = PF.fig();
    const cx = 150, cy = 170, rx = 100, ry = 32, zP = 50;
    f.ellipse(cx, cy, rx, ry);
    f.line(cx, cy + 40, cx, 22, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 5, 20, 'z', 'bl', 'small accent');
    const dq = [cx + rx * Math.cos(-40 * DEG), cy - ry * Math.sin(-40 * DEG)];
    f.dot(dq[0], dq[1], 3); f.tag(dq[0], dq[1], 'dq', 'br', 6, 'small');
    f.line(dq[0], dq[1], cx, zP, { cls: 'dash' });
    f.dot(cx, zP, 3.4); f.tag(cx, zP, 'P', 'l', 8);
    const rp = [cx + rx * Math.cos(160 * DEG), cy - ry * Math.sin(160 * DEG)];
    f.line(cx, cy, rp[0], rp[1], { cls: 'dim' });
    f.label(104.0, 155.6, 'R', 'c', 'small');
    f.label(198.8, 113.2, md`\srm`, 'c', 'small');
    f.dim(cx, cy, cx, zP, '', { off: 120 }); f.label(cx + 126, (cy + zP) / 2, 'z', 'l', 'small');
    return f.svg();
  };
  const figRingLumped = () => {
    const f = PF.fig();
    const cx = 100, cy = 100, R = 70;
    f.circle(cx, cy, R);
    for (let a = 100; a <= 200; a += 10) plus(f, cx + 61 * Math.cos(a * DEG), cy - 61 * Math.sin(a * DEG), 3.2);
    f.dot(cx, cy, 3.2); f.tag(cx, cy, 'C', 'bl', 6);
    f.line(cx, cy, cx + R, cy, { cls: 'dim' }); f.label(cx + 35, cy - 8, 'R', 'b', 'small');
    return f.svg();
  };
  const figHalfRing = () => {
    const f = PF.fig();
    const cx = 150, cy = 150, rx = 100, ry = 30;
    f.ellipse(cx, cy, rx, ry);
    for (let a = 100; a <= 260; a += 16) plus(f, cx + (rx - 9) * Math.cos(a * DEG), cy - (ry - 6) * Math.sin(a * DEG), 3.2);
    for (let a = -80; a <= 80; a += 16) minus(f, cx + (rx - 9) * Math.cos(a * DEG), cy - (ry - 6) * Math.sin(a * DEG), 3.2);
    f.line(cx, cy + 40, cx, 22, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 5, 20, 'z', 'bl', 'small accent');
    f.dot(cx, 60, 3.4); f.tag(cx, 60, 'P', 'l', 8);
    f.label(cx - rx - 8, cy, md`+Q/2`, 'r', 'small'); f.label(cx + rx + 8, cy, md`-Q/2`, 'l', 'small');
    return f.svg();
  };
  const fig234 = () => {
    const a = PF.fig();
    a.line(20, 150, 180, 150, { cls: 'dim' });
    a.charge(40, 150, { q: '+', lab: '+q', at: 'tl' }); a.charge(160, 150, { q: '+', lab: '+q', at: 'tr' });
    a.line(100, 150, 100, 46, { cls: 'dash dim' });
    a.dot(100, 40, 3.4); a.tag(100, 40, 'P', 'r', 7);
    a.label(106, 100, 'z', 'l', 'small');
    a.dim(40, 150, 160, 150, 'd', { off: 26, at: 'b' });
    const b = PF.fig();
    b.line(40, 150, 160, 150, { cls: 'thick' });
    b.label(60, 142, md`\lambda`, 'b', 'small');
    b.line(100, 150, 100, 46, { cls: 'dash dim' });
    b.dot(100, 40, 3.4); b.tag(100, 40, 'P', 'r', 7);
    b.label(106, 100, 'z', 'l', 'small');
    b.dim(40, 150, 160, 150, '2L', { off: 22, at: 'b' });
    const c = PF.fig();
    c.ellipse(100, 150, 70, 30, { cls: 'shade' });
    c.ellipse(100, 150, 70, 30);
    c.label(60, 150, md`\sigma`, 'c', 'small');
    c.line(100, 150, 170, 150, { cls: 'dim' }); c.label(135, 144, 'R', 'b', 'small');
    c.line(100, 150, 100, 46, { cls: 'dash dim' });
    c.dot(100, 40, 3.4); c.tag(100, 40, 'P', 'r', 7);
    c.label(106, 84, 'z', 'l', 'small');
    return PF.row([{ svg: a.svg(), cap: '(a) Two point charges' }, { svg: b.svg(), cap: '(b) Uniform line charge' }, { svg: c.svg(), cap: '(c) Uniform surface charge' }]).svg;
  };
  // disk sliced into rings (solution of HW 2.26c)
  const figDiskRings = () => {
    const f = PF.fig();
    const cx = 140, cy = 170, rx = 110, ry = 34, zP = 40;
    f.ellipse(cx, cy, rx, ry);
    f.ellipse(cx, cy, 62, 19, { cls: 'dim' }); f.ellipse(cx, cy, 72, 22, { cls: 'dim' });
    f.line(cx, cy + 40, cx, 20, { cls: 'dim', arrow: 'end', hs: 6 });
    f.dot(cx, zP, 3.4); f.tag(cx, zP, 'P', 'l', 10);
    const p = [cx + 67 * Math.cos(-30 * DEG), cy - 20.5 * Math.sin(-30 * DEG)];
    f.line(p[0], p[1], cx, zP, { cls: 'dash' });
    f.label(181, 105, md`\srm`, 'l', 'small');      // no \sqrt in figure labels: KaTeX draws it as an inner svg
    callout(f, cx + 67 * Math.cos(200 * DEG), cy - 20.5 * Math.sin(200 * DEG), 28, 232, md`\text{ring } r',\ dr'`, 'tr');
    f.dim(cx, cy, cx + rx, cy, '', { off: 0 });
    f.label(cx + rx + 6, cy, 'R', 'l', 'small');
    return f.svg();
  };
  // +q and -q with an off-axis field point (solution of the HW 2.26 twist)
  const figPMoff = () => {
    const f = PF.fig();
    f.line(20, 160, 260, 160, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(264, 160, 'x', 'l', 'small accent');
    f.line(140, 172, 140, 22, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(145, 20, 'z', 'bl', 'small accent');
    f.charge(80, 160, { q: '+', lab: '+q', at: 'b' }); f.charge(200, 160, { q: '-', lab: '-q', at: 'b' });
    f.dot(140, 60, 3.4); f.tag(140, 60, 'P', 'l', 8);
    const Pq = [172, 60];
    f.dot(Pq[0], Pq[1], 3.4); f.tag(Pq[0], Pq[1], "P'", 'tr', 6);
    f.line(...shorten([80, 160], Pq, 9, 4), { cls: 'dash dim' });
    f.line(...shorten([200, 160], Pq, 9, 4), { cls: 'dash dim' });
    f.dim(140, 60, 172, 60, '', { off: -14 }); f.label(156, 40, 'x', 'b', 'small');
    return f.svg();
  };
  const figAnnulus = () => {
    const f = PF.fig();
    const cx = 150, cy = 170, zP = 50;
    const outer = f.arcPts(cx, cy, 100, 30, 0, 360), inner = f.arcPts(cx, cy, 50, 15, 360, 0);
    f.add(`<path class="shade nodecl" d="M${outer.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}ZM${inner.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z"/>`);
    f.ellipse(cx, cy, 100, 30); f.ellipse(cx, cy, 50, 15);
    f.line(cx, cy + 36, cx, 22, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 5, 20, 'z', 'bl', 'small accent');
    f.dot(cx, zP, 3.4); f.tag(cx, zP, 'P', 'l', 8);
    f.line(cx, cy, cx + 50, cy, { cls: 'dim' }); f.label(cx + 60, cy - 2, 'a', 'bl', 'small');
    f.line(cx, cy, cx - 100, cy, { cls: 'dim' }); f.label(cx - 106, cy - 6, 'b', 'br', 'small');
    callout(f, 215, 188, 262, 205, md`\sigma`, 'l');
    f.dim(cx, cy, cx, zP, '', { off: 120 }); f.label(cx + 126, (cy + zP) / 2, 'z', 'l', 'small');
    return f.svg();
  };
  // solid cylinder on the z axis; o.slice draws a disk of thickness dz' at height z'
  const figCylinder = (o = {}) => {
    const f = PF.fig();
    const cx = 120, cy = 175, hl = 60, R = 50, ry = 14, zP = 40, yt = cy - hl, yb = cy + hl;
    f.ellipse(cx, yt, R, ry);
    f.line(cx - R, yt, cx - R, yb); f.line(cx + R, yt, cx + R, yb);
    f.ellipse(cx, yb, R, ry, { half: 'front' }); f.ellipse(cx, yb, R, ry, { half: 'back', cls: 'dash dim' });
    f.line(cx, yb + 24, cx, zP + 5, { cls: 'dash dim' });
    f.dot(cx, cy, 2.6);
    f.dot(cx, zP, 3.4); f.tag(cx, zP, 'P', 'l', 8);
    f.line(cx, yt, cx + R, yt, { cls: 'dim' }); f.label(cx + R + 6, yt, 'R', 'l', 'small');
    f.dim(cx - R, yt, cx - R, yb, 'L', { off: 20, at: 'l' });
    f.dim(cx, cy, cx, zP, '', { off: 90 }); f.label(cx + 96, (cy + zP) / 2, 'z', 'l', 'small');
    if (o.slice) {
      const ys = cy - 22;
      f.ellipse(cx, ys, R, ry, { cls: 'dim' }); f.ellipse(cx, ys - 7, R, ry, { cls: 'dim' });
      callout(f, cx - 30, ys + 6, 20, ys + 40, md`dz'\text{ at }z'`, 'tr');
    } else f.label(100, 190, md`\rho`, 'c', 'small');
    return f.svg();
  };

  // ================================================================== Lesson 4
  const L4 = {
    id: 'u2-superpose', title: 'V from charge distributions',
    steps: [
      RF(md`
        ### Potentials add as plain numbers

        Fields superpose, $\vb E=\vb E_1+\vb E_2+\dots$ Integrate each from the common reference point (Lecture 4):

        $$V=-\int_{\mathcal O}^{\vb r}\vb E_1\cdot d\vb l-\int_{\mathcal O}^{\vb r}\vb E_2\cdot d\vb l-\dots=V_1+V_2+\dots$$

        This is an ordinary sum of numbers: no components, no unit vectors, no geometry to resolve. That is the main practical reason to find $V$ first and take $\vb E=-\nabla V$ at the end.

        Lecture 5 builds the general formula step by step. A charge $q$ at $\vb r\,'$ gives, at the field point $\vb r$,

        $$V(\vb r)=\frac{q}{4\pi\ep\srm},\qquad \srm=|\vb r-\vb r\,'|,$$

        where $\srm$ (Griffiths' script r) is the distance **from the source to the field point**. Add a second charge and you add a second term; for $N$ charges,

        $$V(\vb r)=\frac{q_1}{4\pi\ep\srm_1}+\frac{q_2}{4\pi\ep\srm_2}+\dots=\kq\sum_{i=1}^{N}\frac{q_i}{\srm_i}.$$

        [[fig:vec]]

        All of these have $V(\infty)=0$ built in, since each term came from a point charge with that reference.
      `, { vec: { svg: figVectors(), cap: 'Position vectors $\\mathbf r$ (field point) and $\\mathbf r\'_i$ (sources); the dashed separations have lengths $\\mathfrak r_i$.' } }),
      Q(md`Four equal charges $+q$ sit at the corners of a square of side $a$. At the center $P$:`,
        [md`$V=0$ and $\vb E=0$, since everything cancels by symmetry`,
          md`$V=\dfrac{\sqrt2\,q}{\pi\ep a}$ and $\vb E=0$`,
          md`$V=0$ and $\vb E\neq0$`,
          md`$V=\dfrac{q}{\pi\ep a}$ and $\vb E=0$`], 1,
        [md`The field vectors cancel in pairs, but potentials are positive numbers that add.`,
          null,
          md`Backwards: the vectors cancel and the scalars add.`,
          md`That uses distance $a$. Each corner is $a/\sqrt2$ from the center.`],
        md`Each charge is $a/\sqrt2$ from $P$, so $V=4\cdot\dfrac{q}{4\pi\ep(a/\sqrt2)}=\dfrac{\sqrt2\,q}{\pi\ep a}$. The four field vectors point away from their corners and cancel in opposite pairs. $\vb E=0$ at a point does not mean $V=0$ there.`,
        { figHtml: figSquare() }),
      Q(md`Charges $+q$ and $-q$ are a distance $d$ apart. At the midpoint $M$:`,
        [md`$V=0$ and $\vb E=0$`, md`$V\neq0$ and $\vb E=0$`, md`$V=0$, and $\vb E\neq0$ pointing toward $+q$`, md`$V=0$, and $\vb E\neq0$ pointing toward $-q$`], 3,
        [md`The potentials cancel, but both fields point the same way, from $+q$ toward $-q$.`,
          md`$M$ is equally far from equal and opposite charges: $V=\tfrac{q}{4\pi\ep(d/2)}-\tfrac{q}{4\pi\ep(d/2)}=0$.`,
          md`$\vb E$ points away from $+q$ and toward $-q$; both point toward $-q$.`,
          null],
        md`$V_M=0$, but $\vb E_M=2\cdot\dfrac{q}{4\pi\ep(d/2)^2}=\dfrac{2q}{\pi\ep d^2}$, pointing toward $-q$. $V=0$ at a point says nothing about the field there; the slope of $V$ across $M$ is steep.`,
        { figHtml: figDipoleMid() }),
      Q(md`A charge $+2q$ sits at $x=0$ and $-q$ at $x=d$. Where on the $x$ axis (at finite distance) is $V=0$?`,
        [md`only at $x=2d/3$`, md`at $x=d/3$ and at $x=-d$`, md`at $x=2d/3$ and at $x=2d$`, md`nowhere, because the charges are unequal`], 2,
        [md`There is a second point beyond $-q$: $\dfrac{2}{x}=\dfrac{1}{x-d}$ gives $x=2d$.`,
          md`At $x=d/3$: $\tfrac{2}{d/3}-\tfrac{1}{2d/3}=\tfrac{6}{d}-\tfrac{1.5}{d}\neq0$. The zero is closer to the smaller charge, not the larger.`,
          null,
          md`$V$ is a signed sum. It vanishes wherever $\dfrac{2q}{r_1}=\dfrac{q}{r_2}$, i.e. $r_1=2r_2$.`],
        md`$V=0$ needs $\dfrac{2q}{r_1}=\dfrac{q}{r_2}$: twice as far from $+2q$ as from $-q$. Between the charges, $x=2(d-x)$ gives $x=2d/3$; beyond $-q$, $x=2(x-d)$ gives $x=2d$. To the left of $+2q$ you are always closer to the bigger charge, so no zero there. In 3-D the $V=0$ surface is a sphere through these two points (center $x=4d/3$, radius $2d/3$).`,
        { figHtml: fig2q() }),
      Q(md`In $V(\vb r)=\kq\displaystyle\int\frac{\rho(\vb r\,')}{\srm}\,d\tau'$, what is $\srm$?`,
        [md`the distance from the origin to the field point $\vb r$`,
          md`the distance from the source point $\vb r\,'$ to the field point $\vb r$`,
          md`the distance from the origin to the source point $\vb r\,'$`,
          md`the radius of the charge distribution`], 1,
        [md`That is $r=|\vb r|$. It only equals $\srm$ when the source sits at the origin.`,
          null,
          md`That is $r'=|\vb r\,'|$, the location of the source.`,
          md`A fixed size cannot be the integration variable's distance; $\srm$ changes from piece to piece.`],
        md`$\srm=|\vb r-\vb r\,'|$: for each piece $dq$ at $\vb r\,'$, its own distance to where you are evaluating $V$. Getting $\srm$ right in terms of the integration variable is most of the work in these problems.`,
        { figHtml: figVectors() }),
      P({
        title: 'Three point charges',
        q: md`Charges $+4.0$ nC at the origin, $-2.0$ nC at $(3.0\un{cm},\,0)$ and $+1.0$ nC at $(0,\,4.0\un{cm})$. Find the potential (with $V(\infty)=0$) at $P=(3.0\un{cm},\,4.0\un{cm})$ and at $M=(1.5\un{cm},\,0)$. Use $\dfrac{1}{4\pi\ep}=8.99\times10^9$ N·m²/C².`,
        figHtml: fig3charges(),
        hints: [md`$V=\kq\sum q_i/\srm_i$. Find each distance first.`, md`From $P$: 5.0 cm (3-4-5 triangle), 4.0 cm and 3.0 cm. From $M$: 1.5 cm, 1.5 cm and $\sqrt{1.5^2+4.0^2}$ cm.`],
        parts: [
          { lbl: 'V(P)', ans: 569.4, unit: 'V' },
          { lbl: 'V(M)', ans: 1409.1, unit: 'V' },
        ],
        sol: md`
          **At $P$:** distances $\srm_1=5.0$ cm, $\srm_2=4.0$ cm, $\srm_3=3.0$ cm.

          $$V_P=8.99\times10^9\left(\frac{4.0}{0.050}-\frac{2.0}{0.040}+\frac{1.0}{0.030}\right)\times10^{-9}=8.99\,(80-50+33.3)=569\text{ V}.$$

          **At $M$:** $\srm_1=\srm_2=1.5$ cm, $\srm_3=\sqrt{1.5^2+4.0^2}=4.27$ cm.

          $$V_M=8.99\left(\frac{4.0-2.0}{0.015}+\frac{1.0}{0.0427}\right)=8.99\,(133.3+23.4)=1409\text{ V}.$$

          No vectors at all: the negative charge simply enters with a minus sign. Getting $\vb E$ at $P$ the same way would need three vectors broken into components.
        `,
      }),
      RF(md`
        ### Continuous distributions

        Chop the charge into pieces $dq$, each a point charge, and add:

        $$V(\vb r)=\kq\int\frac{dq}{\srm},\qquad dq=\lambda\,dl'\ \text{(line)},\quad \sigma\,da'\ \text{(surface)},\quad \rho\,d\tau'\ \text{(volume)}.$$

        This is on the formula sheet. It has $V(\infty)=0$ built in, so it works only for charge confined to a finite region. For an infinite line or plane the integral diverges.

        !!method Recipe for $V$ from a distribution
          1. Draw the source piece $dq$ at $\vb r\,'$ and the field point $\vb r$.
          2. Write $dq$ and the distance $\srm$ from $dq$ to the field point in terms of the integration variable.
          3. Integrate $dq/\srm$. No components.
          4. If you need $\vb E$, take $-\nabla V$, with care about which variables $V$ is known in.
      `),
      RF(md`
        ### Worked example (Lecture 5): a line segment, by potential

        A uniform line charge $\lambda$ runs along the $x$ axis from $-L$ to $L$. Find $V$, then $\vb E$, at height $z$ above the center.

        [[fig:seg]]

        **1. One piece.** The bit $dx$ at position $x$ carries $dq=\lambda\,dx$ and sits $\srm=\sqrt{x^2+z^2}$ from the field point:

        $$dV=\kq\frac{\lambda\,dx}{\sqrt{x^2+z^2}}.$$

        **2. Add them up.** With $\displaystyle\int\frac{dx}{\sqrt{x^2+z^2}}=\ln\left(x+\sqrt{x^2+z^2}\right)$,

        $$V(z)=\frac{\lambda}{4\pi\ep}\Big[\ln\left(x+\sqrt{x^2+z^2}\right)\Big]_{-L}^{L}=\frac{\lambda}{4\pi\ep}\ln\left(\frac{L+\sqrt{L^2+z^2}}{-L+\sqrt{L^2+z^2}}\right).$$

        **3. The field.** $\vb E=-\nabla V=\left(-\dfrac{\partial V}{\partial x},-\dfrac{\partial V}{\partial y},-\dfrac{\partial V}{\partial z}\right)$. Let $s=\sqrt{L^2+z^2}$, so $ds/dz=z/s$:

        $$\frac{\partial V}{\partial z}=\frac{\lambda}{4\pi\ep}\,\frac zs\left[\frac{1}{L+s}-\frac{1}{s-L}\right]=\frac{\lambda}{4\pi\ep}\,\frac zs\cdot\frac{-2L}{s^2-L^2}=-\frac{\lambda}{4\pi\ep}\,\frac{2L}{z\sqrt{z^2+L^2}},$$

        using $s^2-L^2=z^2$. On the axis

        $$\vb E=\kq\,\frac{2\lambda L}{z\sqrt{z^2+L^2}}\,\uv z,$$

        the same as the direct Coulomb integral (Griffiths Ex. 2.2), with much less work.

        **Check.** Far away ($z\gg L$): $V\to\kq\dfrac{2\lambda L}{z}$ and $E\to\kq\dfrac{2\lambda L}{z^2}$: a point charge $Q=2\lambda L$.

        !!trap You cannot get $E_x$ from $V(z)$
          The notes write $\vb E=(0,0,\text{not }0)$ "as we found previously". But $V(z)$ was computed only on the $z$ axis. It says nothing about how $V$ changes when you step off the axis in $x$ or $y$, so $\partial V/\partial x$ cannot be read off it. Here $E_x=E_y=0$ because of the symmetry of the segment, not because "$V(z)$ has no $x$ in it". Without such symmetry you need $V$ at general points before you differentiate. (The notes also set the scalar $-\partial V/\partial z$ equal to a vector; it should read $\vb E=-\dfrac{\partial V}{\partial z}\uv z$.)
      `, { seg: { svg: figSegment(), cap: 'Lecture 5: a segment from $-L$ to $L$; the piece $dx$ at $x$ is $\\mathfrak r=\\sqrt{x^2+z^2}$ from P.' } }),
      Q(md`You have $V(z)$ for points on the $z$ axis only. Which components of $\vb E$ on the axis can you compute from it?`,
        [md`All three: $E_x=-\partial V/\partial x=0$ because $V(z)$ contains no $x$.`,
          md`Only $E_z$. $E_x$ and $E_y$ need $V$ off the axis.`,
          md`None; $V$ must be known everywhere before you can differentiate at all.`,
          md`Only $E_x$ and $E_y$.`], 1,
        [md`$V(z)$ is the potential restricted to the line $x=y=0$. Its lack of $x$ just reflects that restriction, not how $V$ varies in $x$.`,
          null,
          md`Differentiating along the axis is fine: $E_z=-dV/dz$ only needs $V$ along the axis.`,
          md`Backwards: $z$ is the direction $V(z)$ does vary in.`],
        md`$\partial V/\partial z$ only needs $V$ along the axis, which you have. $\partial V/\partial x$ needs $V$ at $(\delta x,0,z)$, which you do not. The transverse components on the axis vanish only when symmetry says so. HW 2.26 below has a case where they do not.`,
        { figHtml: figSegment() }),
      Q(md`For the segment, how does $V(z)$ behave far away ($z\gg L$)?`,
        [md`$V\approx\dfrac{\lambda}{4\pi\ep}\ln\dfrac{2L}{z}$`, md`$V\to0$ faster than any power of $z$`, md`$V\approx\kq\dfrac{2\lambda L}{z^2}$`, md`$V\approx\kq\dfrac{2\lambda L}{z}$`], 3,
        [md`A logarithm belongs to the opposite limit, very close to a long segment (and there the prefactor is $\tfrac{\lambda}{2\pi\ep}$). This one even turns negative for $z>2L$. Far away the segment looks like a point charge.`,
          md`$V\to0$, but only as $1/z$: from far away the segment is a point charge $2\lambda L$.`,
          md`$1/z^2$ is the field. The potential of a point charge goes as $1/z$.`,
          null],
        md`$\dfrac{L+s}{s-L}=\dfrac{(L+s)^2}{z^2}$ so $V=\dfrac{\lambda}{2\pi\ep}\ln\dfrac{L+\sqrt{L^2+z^2}}{z}$. For $z\gg L$, $\ln\left(\dfrac Lz+\sqrt{1+\dfrac{L^2}{z^2}}\right)\approx\dfrac Lz$, so $V\approx\dfrac{\lambda L}{2\pi\ep z}=\kq\dfrac{2\lambda L}{z}$. Always run this check: the total charge seen from far away.`,
        { figHtml: figSegment() }),
      Q(md`And very close to the middle of a long segment ($z\ll L$)?`,
        [md`$V\approx\kq\dfrac{2\lambda L}{z}$`, md`$V\approx\dfrac{\lambda}{4\pi\ep}\ln\dfrac Lz$`, md`$V\approx\dfrac{\lambda}{2\pi\ep}\ln\dfrac{2L}{z}$`, md`$V$ is nearly constant`], 2,
        [md`That is the far limit, where the segment looks like a point.`,
          md`Missing a factor of 2 in two places: $V=\dfrac{\lambda}{2\pi\ep}\ln\dfrac{L+\sqrt{L^2+z^2}}{z}$ and $L+\sqrt{L^2+z^2}\to2L$.`,
          null,
          md`$V$ grows like $-\ln z$ as you approach; the field $\dfrac{\lambda}{2\pi\ep z}$ is large, not small.`],
        md`With $z\ll L$, $\sqrt{L^2+z^2}\approx L$ and $V\approx\dfrac{\lambda}{2\pi\ep}\ln\dfrac{2L}{z}$: the infinite-line potential $-\dfrac{\lambda}{2\pi\ep}\ln\dfrac{s}{a}$ with the reference effectively at $a=2L$. A finite length is what makes $V(\infty)=0$ usable; as $L\to\infty$ the constant $\ln 2L$ blows up, exactly the divergence of Lesson 2.`,
        { figHtml: figSegment() }),
      P({
        title: 'Above one end of a segment',
        q: md`A segment of length $L$ with uniform $\lambda$ lies on the $x$ axis from $0$ to $L$. Find $V(z)$ at height $z$ directly above the left end, then $E_z=-\partial V/\partial z$ there. (Compare Discussion 1 · Griffiths 2.3, which finds $\vb E$ at this point directly.)`,
        figHtml: figSegEnd(),
        hints: [
          md`Same steps as the Lecture 5 example: $dq=\lambda\,dx$ and $\srm=\sqrt{x^2+z^2}$, but now $x$ runs from $0$ to $L$.`,
          md`$V=\dfrac{\lambda}{4\pi\ep}\ln\dfrac{L+\sqrt{L^2+z^2}}{z}$. Differentiate the log: $\dfrac{d}{dz}\ln\left(L+\sqrt{L^2+z^2}\right)=\dfrac{z/\sqrt{L^2+z^2}}{L+\sqrt{L^2+z^2}}$.`,
          md`Think about $E_x$: is there any symmetry that kills it here?`,
        ],
        parts: [
          { lbl: 'V(z)', expr: 'lambda/(4*pi*eps0)*ln((L+sqrt(L^2+z^2))/z)', vars: { lambda: [0.5, 2], eps0: [0.5, 2], L: [0.5, 2], z: [0.3, 2] }, accepts: ['lambda/(4*pi*eps0)*(ln(L+sqrt(L^2+z^2)) - ln(z))'] },
          { lbl: 'E_z', expr: 'lambda*L/(4*pi*eps0*z*sqrt(z^2+L^2))', vars: { lambda: [0.5, 2], eps0: [0.5, 2], L: [0.5, 2], z: [0.3, 2] } },
          { lbl: md`Is $E_x=0$ at this point?`, mc: [md`Yes: $V(z)$ does not depend on $x$.`, md`No: $E_x\neq0$ (it points in $-x$, away from the segment), and $V(z)$ on the axis cannot tell you that.`, md`Yes, by symmetry.`], a: 1, why: [md`$V(z)$ is known only on the line $x=0$; it cannot give $\partial V/\partial x$.`, null, md`There is no left-right symmetry: all the charge is on the $+x$ side, so it pushes the field point toward $-x$.`] },
        ],
        sol: md`
          $$V(z)=\frac{\lambda}{4\pi\ep}\int_0^L\frac{dx}{\sqrt{x^2+z^2}}=\frac{\lambda}{4\pi\ep}\ln\frac{L+\sqrt{L^2+z^2}}{z}.$$

          Differentiate, with $s=\sqrt{L^2+z^2}$:

          $$\frac{\partial V}{\partial z}=\frac{\lambda}{4\pi\ep}\left[\frac{z/s}{L+s}-\frac1z\right]=\frac{\lambda}{4\pi\ep}\,\frac{z^2-s(L+s)}{zs(L+s)}=-\frac{\lambda}{4\pi\ep}\,\frac{L}{zs},$$

          since $z^2-sL-s^2=-L(L+s)$. So $E_z=\dfrac{\lambda}{4\pi\ep}\dfrac{L}{z\sqrt{z^2+L^2}}$, which matches the $\uv z$ part of Griffiths 2.3.

          **The trap.** Griffiths 2.3 also has $E_x=\dfrac{\lambda}{4\pi\ep z}\left(\dfrac{z}{\sqrt{z^2+L^2}}-1\right)\neq0$. Your $V(z)$ cannot produce it: to get $E_x$ you would need $V(x,z)$ near $x=0$. This is the general warning from the lecture example, and here it bites.

          **Checks.** $z\gg L$: $V\approx\dfrac{\lambda L}{4\pi\ep z}$, a point charge $\lambda L$. Half of the Lecture 5 segment gives half of its $V$ at the center height, as it should.
        `,
      }),
      RF(md`
        ### A ring of charge: no integral needed

        A ring of radius $R$ carries total charge $Q$. Every piece of it is the same distance from a point on the axis, $\srm=\sqrt{R^2+z^2}$, so

        $$V(z)=\kq\int\frac{dq}{\srm}=\kq\frac{1}{\sqrt{R^2+z^2}}\int dq=\kq\frac{Q}{\sqrt{R^2+z^2}}.$$

        [[fig:ring]]

        That holds even if the charge is spread unevenly around the ring: $V$ only cares about distances. For a uniform ring, symmetry makes $\vb E$ point along $z$ on the axis, and

        $$E_z=-\frac{\partial V}{\partial z}=\kq\frac{Qz}{(R^2+z^2)^{3/2}}.$$

        Limits: at the center ($z=0$) $V=\kq\dfrac QR$ and $E_z=0$; far away ($z\gg R$) $V\to\kq\dfrac Qz$.
      `, { ring: { svg: figRing(), cap: 'Every piece $dq$ of the ring is the same distance $\\mathfrak r=\\sqrt{R^2+z^2}$ from P.' } }),
      Q(md`A ring of radius $R$ carries total charge $Q$, but all of it is bunched on one third of the ring. What is $V$ at the center $C$?`,
        [md`$\kq\dfrac{Q}{R}$, the same as for a uniform ring`,
          md`Less than for a uniform ring, since the charges are not spread out`,
          md`$0$, since the charge is lopsided`,
          md`$\dfrac13\kq\dfrac{Q}{R}$`], 0,
        [null,
          md`Each $dq$ is still at distance $R$ from the center, so each contributes $\kq\,dq/R$ whatever its position on the ring.`,
          md`Lopsidedness affects $\vb E$ (it no longer cancels at $C$), not $V$.`,
          md`All of $Q$ is still on the ring, at distance $R$. Nothing is lost.`],
        md`$V_C=\kq\displaystyle\int\frac{dq}{R}=\kq\frac QR$. The field at $C$ is a different story: the bunched charge pushes $\vb E$ away from that side, so $\vb E\neq0$ at $C$. Potential is blind to direction; field is not.`,
        { figHtml: figRingLumped() }),
      Q(md`On the axis of a uniform ring (charge $Q>0$), where is $V$ largest, and what is $E_z$ there?`,
        [md`At $z=R/\sqrt2$, where the field is largest`, md`At the center, where $E_z=0$`, md`At the center, where $E_z$ is largest`, md`Far away, where $E_z\to0$`], 1,
        [md`The field magnitude peaks at $z=R/\sqrt2$, but $V$ peaks where its slope is zero.`,
          null,
          md`At a maximum of $V$ the slope $dV/dz$ vanishes, so $E_z=0$ there.`,
          md`Far away $V\to0$, its smallest value.`],
        md`$V(z)=\kq\dfrac{Q}{\sqrt{R^2+z^2}}$ is largest at $z=0$, where $E_z=-dV/dz=0$. Where $V$ is flat the field vanishes; where $V$ is steepest ($z=\pm R/\sqrt2$) the field is strongest. Do not confuse "big $V$" with "big $E$".`,
        { figHtml: figRing() }),
      P({
        title: 'A charged ring with numbers',
        q: md`A uniform ring of radius $R=4.0$ cm carries $Q=5.0$ nC. On its axis, $z=3.0$ cm from the center, find $V$ (with $V(\infty)=0$) and $E_z$. Use $\dfrac{1}{4\pi\ep}=8.99\times10^9$ N·m²/C².`,
        figHtml: figRing(),
        hints: [md`$\srm=\sqrt{R^2+z^2}=5.0$ cm for every piece of the ring.`, md`$E_z=\kq\dfrac{Qz}{(R^2+z^2)^{3/2}}$.`],
        parts: [
          { lbl: 'V', ans: 899.0, unit: 'V' },
          { lbl: 'E_z', ans: 10788, unit: 'V/m' },
        ],
        sol: md`
          $V=\dfrac{(8.99\times10^9)(5.0\times10^{-9})}{0.050}=899$ V.

          $E_z=\dfrac{(8.99\times10^9)(5.0\times10^{-9})(0.030)}{(0.050)^3}=\dfrac{1.349}{1.25\times10^{-4}}=1.08\times10^4$ V/m.

          Check the relation: $E_z=V\cdot\dfrac{z}{R^2+z^2}=899\cdot\dfrac{0.030}{0.0025}=1.08\times10^4$ V/m.
        `,
      }),
      P({
        id: 'HW2-2.26', src: 'HW 2 · Griffiths 2.26', title: 'Potentials above three distributions', big: true,
        q: md`Using Eqs. 2.27 and 2.30, find the potential at a distance $z$ above the center of the charge distributions in Fig. 2.34. In each case, compute $\vb E=-\nabla V$, and compare your answers with Ex. 2.1, Ex. 2.2, and Prob. 2.6, respectively. Suppose that we changed the right-hand charge in Fig. 2.34a to $-q$; what then is the potential at $P$? What field does that suggest? Compare your answer to Prob. 2.2, and explain carefully any discrepancy.

          (Eq. 2.27: $V=\kq\sum q_i/\srm_i$; Eq. 2.30: $V=\kq\int\lambda\,dl'/\srm$ and $\kq\int\sigma\,da'/\srm$. In (a) the charges are at $x=\pm d/2$; in (b) the segment has length $2L$; in (c) the disk has radius $R$. Take $z>0$.)`,
        figHtml: fig234(),
        hints: [
          md`(a) Both charges are $\sqrt{z^2+(d/2)^2}$ from $P$. Just add.`,
          md`(b) is the Lecture 5 example. (c) Slice the disk into rings of radius $r'$ and width $dr'$: $dq=\sigma\,2\pi r'\,dr'$, all at $\srm=\sqrt{r'^2+z^2}$.`,
          md`For the fields: on the axis only $E_z=-\partial V/\partial z$ can be found, and here symmetry kills $E_x,E_y$.`,
          md`The twist: with $-q$ on the right, $V=0$ on the whole $z$ axis, so $-\partial V/\partial z=0$. But $\vb E$ is not zero (Prob. 2.2). Write $V$ at an off-axis point $(x,0,z)$ and differentiate with respect to $x$.`,
        ],
        parts: [
          { lbl: 'V_a(z)', expr: '2*q/(4*pi*eps0*sqrt(z^2+d^2/4))', vars: { q: [0.5, 2], eps0: [0.5, 2], z: [0.3, 2], d: [0.3, 2] }, accepts: ['q/(2*pi*eps0*sqrt(z^2+d^2/4))', '4*q/(4*pi*eps0*sqrt(4*z^2+d^2))'] },
          { lbl: 'E_z\\ \\text{for (a)}', expr: '2*q*z/(4*pi*eps0*(z^2+d^2/4)^(3/2))', vars: { q: [0.5, 2], eps0: [0.5, 2], z: [0.3, 2], d: [0.3, 2] } },
          { lbl: 'V_b(z)', expr: 'lambda/(4*pi*eps0)*ln((L+sqrt(L^2+z^2))/(-L+sqrt(L^2+z^2)))', vars: { lambda: [0.5, 2], eps0: [0.5, 2], L: [0.5, 2], z: [0.3, 2] }, accepts: ['lambda/(2*pi*eps0)*ln((L+sqrt(L^2+z^2))/z)'] },
          { lbl: 'V_c(z)', expr: 'sigma/(2*eps0)*(sqrt(R^2+z^2) - z)', vars: { sigma: [0.5, 2], eps0: [0.5, 2], R: [0.5, 2], z: [0.2, 2] } },
          { lbl: 'E_z\\ \\text{for (c)}', expr: 'sigma/(2*eps0)*(1 - z/sqrt(R^2+z^2))', vars: { sigma: [0.5, 2], eps0: [0.5, 2], R: [0.5, 2], z: [0.2, 2] } },
          { lbl: md`With the right-hand charge changed to $-q$, the potential at $P$ is`, mc: [md`$0$`, md`$\dfrac{2q}{4\pi\ep\sqrt{z^2+d^2/4}}$`, md`$\dfrac{q\,d}{4\pi\ep(z^2+d^2/4)^{3/2}}$`, md`undefined`], a: 0, why: [null, md`That is the $+q,+q$ answer. With opposite charges at equal distances the terms cancel.`, md`That is the size of the field (Prob. 2.2), not the potential.`, md`It is perfectly defined: two equal and opposite terms.`] },
          { lbl: md`$V=0$ all along the $z$ axis "suggests" $\vb E=0$ there. What is actually true?`, mc: [md`$\vb E=0$ on the axis, and Prob. 2.2 contains an error.`, md`$\vb E\neq0$: it is $\kq\dfrac{qd}{(z^2+d^2/4)^{3/2}}\,\uv x$, because $V$ changes as you step off the axis in $x$.`, md`$\vb E\neq0$, but it points along $\uv z$.`], a: 1, why: [md`Prob. 2.2 is right; the potential argument is incomplete. Knowing $V$ only on the axis cannot give $\partial V/\partial x$.`, null, md`$E_z=-\partial V/\partial z=0$ on the axis really is zero (the $z$ components of the two fields cancel). The surviving component is $E_x$.`] },
        ],
        sol: md`
          **(a) Two charges $+q$.** Each is $\srm=\sqrt{z^2+(d/2)^2}$ from $P$:

          $$V=\frac{1}{4\pi\ep}\frac{2q}{\sqrt{z^2+(d/2)^2}},\qquad E_z=-\frac{\partial V}{\partial z}=\frac{1}{4\pi\ep}\frac{2qz}{\left(z^2+(d/2)^2\right)^{3/2}},$$

          matching Ex. 2.1. ($E_x=E_y=0$ by the left-right symmetry.)

          **(b) Segment of length $2L$.** This is the Lecture 5 example:

          $$V=\frac{\lambda}{4\pi\ep}\ln\left(\frac{L+\sqrt{L^2+z^2}}{-L+\sqrt{L^2+z^2}}\right),\qquad E_z=\frac{1}{4\pi\ep}\frac{2\lambda L}{z\sqrt{z^2+L^2}},$$

          matching Ex. 2.2.

          **(c) Disk of radius $R$.** Slice it into rings: a ring of radius $r'$ and width $dr'$ carries $dq=\sigma\,2\pi r'\,dr'$, all of it at $\srm=\sqrt{r'^2+z^2}$.

          [[fig:rings]]

          $$V=\frac{1}{4\pi\ep}\int_0^R\frac{2\pi\sigma r'\,dr'}{\sqrt{r'^2+z^2}}=\frac{\sigma}{2\ep}\Big[\sqrt{r'^2+z^2}\Big]_0^R=\frac{\sigma}{2\ep}\left(\sqrt{R^2+z^2}-z\right),$$

          $$E_z=-\frac{\partial V}{\partial z}=\frac{\sigma}{2\ep}\left(1-\frac{z}{\sqrt{R^2+z^2}}\right),$$

          matching Prob. 2.6. (For $z>0$; for $z<0$ replace $z$ by $|z|$ in $V$.)

          **The twist: $+q$ on the left, $-q$ on the right.** On the axis both charges are at the same distance, so $V=\dfrac{q}{4\pi\ep\srm}-\dfrac{q}{4\pi\ep\srm}=0$ for every $z$. Then $-\partial V/\partial z=0$, which "suggests" $\vb E=0$. But Prob. 2.2 gives

          $$\vb E=\frac{1}{4\pi\ep}\frac{qd}{\left(z^2+(d/2)^2\right)^{3/2}}\,\uv x,$$

          pointing from $+q$ toward $-q$.

          **The discrepancy.** $V=0$ only on the $z$ axis. Step off to $P'=(x,0,z)$:

          [[fig:off]]

          $$V(x,z)=\frac{q}{4\pi\ep}\left[\frac{1}{\sqrt{(x+d/2)^2+z^2}}-\frac{1}{\sqrt{(x-d/2)^2+z^2}}\right].$$

          $$E_x=-\frac{\partial V}{\partial x}\bigg|_{x=0}=\frac{q}{4\pi\ep}\left[\frac{d/2}{\left(z^2+d^2/4\right)^{3/2}}+\frac{d/2}{\left(z^2+d^2/4\right)^{3/2}}\right]=\frac{1}{4\pi\ep}\frac{qd}{\left(z^2+d^2/4\right)^{3/2}},$$

          exactly Prob. 2.2. Knowing $V$ along one line gives only the derivative along that line. The potential is zero on the axis but it is sloped across it.

          **What to remember.** $V$ first, $\vb E$ second is the efficient route, but you must know $V$ in a neighbourhood (in every direction you differentiate), not just along a line. Symmetry is what usually rescues the axis-only calculation; with $\pm q$ there is no symmetry that kills $E_x$.
        `,
        figs: {
          rings: { svg: figDiskRings(), cap: 'A ring of radius $r\'$ and width $dr\'$: every bit of it is $\\mathfrak r=\\sqrt{r\'^2+z^2}$ from P.' },
          off: { svg: figPMoff(), cap: md`Off-axis point $P'$: now the two distances differ, and $V$ is no longer zero.` },
        },
      }),
      Q(md`A ring carries $+Q/2$ spread over its left half and $-Q/2$ over its right half. On its axis $V=0$ at every height. What is $\vb E$ at $P$ on the axis?`,
        [md`$\vb E=0$, since $V=0$ all along the axis`,
          md`$\vb E$ points along the axis, away from the ring`,
          md`$\vb E\neq0$ and horizontal, pointing from the $+$ half toward the $-$ half`,
          md`It cannot be determined without the full $V(x,y,z)$`], 2,
        [md`Same trap as HW 2.26: $V=0$ along a line says nothing about the slope across it.`,
          md`The axial pushes from the two halves cancel ($+$ pushes up, $-$ pulls down by the same amount).`,
          null,
          md`You do not need $V$ to reason about the direction: superposing the two halves' fields gives it at once. (To compute it from $V$, you would need $V$ off the axis.)`],
        md`Each $+$ piece pushes $P$ away from itself and each $-$ piece pulls $P$ toward itself. Along the axis these cancel; sideways they add, from the $+$ side toward the $-$ side. The same lesson as the $\pm q$ part of HW 2.26.`,
        { figHtml: figHalfRing() }),
      RF(md`
        ### The disk: limits, and a warning

        From HW 2.26(c), the disk's potential on its axis is $V(z)=\dfrac{\sigma}{2\ep}\left(\sqrt{R^2+z^2}-z\right)$ for $z>0$.

        - **Far away** ($z\gg R$): $\sqrt{R^2+z^2}\approx z+\dfrac{R^2}{2z}$, so $V\approx\dfrac{\sigma R^2}{4\ep z}=\kq\dfrac{\sigma\pi R^2}{z}$, a point charge $Q=\sigma\pi R^2$.
        - **Huge disk** ($R\to\infty$): $V\to\infty$ at every $z$. This is the infinite plane again: the charge reaches infinity and the reference at infinity is unusable. The field is fine: $E_z\to\dfrac{\sigma}{2\ep}$.
        - **On the disk** ($z\to0^+$): $V\to\dfrac{\sigma R}{2\ep}$, finite, while $E_z\to\dfrac{\sigma}{2\ep}$. Just below, $E_z\to-\dfrac{\sigma}{2\ep}$: the field jumps by $\sigma/\ep$ across the disk while $V$ does not jump. Lesson 6 shows this is always so.

        The widget compares the disk's field with its two limits.
      `),
      WG.disk(),
      Q(md`Far from a uniformly charged disk ($z\gg R$), its on-axis potential is approximately`,
        [md`$\dfrac{\sigma}{2\ep}\,z$`, md`$\dfrac{\sigma R}{2\ep}$`, md`zero, since $\sqrt{R^2+z^2}-z\to0$`, md`$\kq\dfrac{\sigma\pi R^2}{z}$`], 3,
        [md`A potential growing with distance would be the infinite plane with a reference on the plane, and with the opposite sign. A finite disk looks like a point from far away.`,
          md`That is the value right at the disk's center.`,
          md`It does go to zero, but as $1/z$, and the question is how.`,
          null],
        md`$\sqrt{R^2+z^2}-z=\dfrac{R^2}{\sqrt{R^2+z^2}+z}\approx\dfrac{R^2}{2z}$, so $V\approx\dfrac{\sigma R^2}{4\ep z}=\dfrac{1}{4\pi\ep}\dfrac{\pi R^2\sigma}{z}$. Total charge over distance: always the far-field check.`,
        { figHtml: fig234() }),
      Q(md`As the disk radius $R\to\infty$, the on-axis $V(z)=\dfrac{\sigma}{2\ep}\left(\sqrt{R^2+z^2}-z\right)$ blows up, yet $E_z\to\dfrac{\sigma}{2\ep}$ stays finite. Why?`,
        [md`The formula assumed $V(\infty)=0$, which fails once the charge itself extends to infinity; differences of $V$, and hence $\vb E$, stay finite.`,
          md`An infinite plane has infinite total charge, so its field is infinite too, and the formula for $E_z$ is wrong.`,
          md`The square root should be expanded first; done correctly, $V$ stays finite.`,
          md`$V$ blows up only at $z=0$.`], 0,
        [null,
          md`The field of an infinite plane is the finite $\tfrac{\sigma}{2\ep}$ (Gauss). Only the potential, referenced to infinity, misbehaves.`,
          md`For fixed $z$, $\sqrt{R^2+z^2}\approx R\to\infty$. No expansion rescues it.`,
          md`The divergence is at every $z$: each value carries the same infinite constant $\tfrac{\sigma R}{2\ep}$.`],
        md`$V(z)=\dfrac{\sigma}{2\ep}\left(\sqrt{R^2+z^2}-z\right)\approx\dfrac{\sigma R}{2\ep}-\dfrac{\sigma z}{2\ep}$ for $R\gg z$. The huge constant $\dfrac{\sigma R}{2\ep}$ is an artifact of the reference at infinity. Drop it (move the reference to the plane) and you get $V=-\dfrac{\sigma z}{2\ep}$, the result from Lesson 2.`,
        { nofig: 'limit of a formula; the disk is drawn above' }),
      P({
        title: 'A flat annulus',
        q: md`A flat ring (annulus) has inner radius $a$, outer radius $b$, and uniform surface charge $\sigma$. Find $V(z)$ on its axis, a height $z>0$ above the center, and then $E_z$.`,
        figHtml: figAnnulus(),
        hints: [md`Same ring slicing as the disk, but $r'$ runs from $a$ to $b$.`, md`$\displaystyle\int\frac{r'\,dr'}{\sqrt{r'^2+z^2}}=\sqrt{r'^2+z^2}$.`],
        parts: [
          { lbl: 'V(z)', expr: 'sigma/(2*eps0)*(sqrt(b^2+z^2) - sqrt(a^2+z^2))', vars: { sigma: [0.5, 2], eps0: [0.5, 2], a: [0.2, 0.8], b: [1, 2], z: [0.1, 2] } },
          { lbl: 'E_z', expr: 'sigma*z/(2*eps0)*(1/sqrt(a^2+z^2) - 1/sqrt(b^2+z^2))', vars: { sigma: [0.5, 2], eps0: [0.5, 2], a: [0.2, 0.8], b: [1, 2], z: [0.1, 2] } },
        ],
        sol: md`
          $$V(z)=\frac{1}{4\pi\ep}\int_a^b\frac{\sigma\,2\pi r'\,dr'}{\sqrt{r'^2+z^2}}=\frac{\sigma}{2\ep}\left(\sqrt{b^2+z^2}-\sqrt{a^2+z^2}\right).$$

          $$E_z=-\frac{\partial V}{\partial z}=\frac{\sigma z}{2\ep}\left(\frac{1}{\sqrt{a^2+z^2}}-\frac{1}{\sqrt{b^2+z^2}}\right).$$

          **Checks.** $a\to0$ gives the disk. At the center ($z=0$), $E_z=0$ (a hole in the middle, so no charge right below you), while $V=\dfrac{\sigma(b-a)}{2\ep}$. Far away, $V\approx\dfrac{\sigma(b^2-a^2)}{4\ep z}=\kq\dfrac{\sigma\pi(b^2-a^2)}{z}$, the total charge over $z$. Superposition view: annulus = disk $b$ minus disk $a$.
        `,
      }),
      P({
        id: 'HW3-2.28', src: 'HW 3 · Griffiths 2.28', title: 'Solid cylinder, on its axis', big: true,
        q: md`Find the potential on the axis of a uniformly charged solid cylinder, a distance $z$ from the center. The length of the cylinder is $L$, its radius is $R$, and the charge density is $\rho$. Use your result to calculate the electric field at this point. (Assume that $z>L/2$.)`,
        figHtml: figCylinder(),
        hints: [
          md`Build the cylinder from thin disks. A disk at height $z'$ (with $-L/2<z'<L/2$) and thickness $dz'$ has surface charge $\sigma\to\rho\,dz'$ and sits a distance $z-z'$ below the field point.`,
          md`Use the disk result: $dV=\dfrac{\rho\,dz'}{2\ep}\left(\sqrt{R^2+(z-z')^2}-(z-z')\right)$. Substitute $u=z-z'$, which runs from $z-L/2$ to $z+L/2$.`,
          md`$\displaystyle\int\sqrt{R^2+u^2}\,du=\frac12\left[u\sqrt{R^2+u^2}+R^2\ln\left(u+\sqrt{R^2+u^2}\right)\right]$.`,
          md`For the field, differentiate under the integral: $\dfrac{d}{dz}\displaystyle\int_{z-L/2}^{z+L/2}g(u)\,du=g(z+L/2)-g(z-L/2)$.`,
        ],
        parts: [
          { lbl: 'V(z)', expr: 'rho/(4*eps0)*((z+L/2)*sqrt(R^2+(z+L/2)^2) - (z-L/2)*sqrt(R^2+(z-L/2)^2) + R^2*ln((z+L/2+sqrt(R^2+(z+L/2)^2))/(z-L/2+sqrt(R^2+(z-L/2)^2))) - 2*z*L)', vars: { rho: [0.5, 2], eps0: [0.5, 2], R: [0.3, 1.5], L: [0.5, 2], z: [1.2, 3] } },
          { lbl: 'E_z', expr: 'rho/(2*eps0)*(L + sqrt(R^2+(z-L/2)^2) - sqrt(R^2+(z+L/2)^2))', vars: { rho: [0.5, 2], eps0: [0.5, 2], R: [0.3, 1.5], L: [0.5, 2], z: [1.2, 3] } },
          { lbl: md`Far away ($z\gg L,R$), $E_z$ should approach`, mc: [md`$\dfrac{\rho\pi R^2L}{4\pi\ep z^2}$`, md`$\dfrac{\rho L}{2\ep}$`, md`$\dfrac{\rho\pi R^2L}{4\pi\ep z}$`], a: 0, why: [null, md`That is a constant: the field of an infinite slab, not of a finite object far away.`, md`That has the $1/z$ of a potential, not a field.`] },
        ],
        sol: md`
          **Slice into disks.** A disk at height $z'$ of thickness $dz'$ is a disk of surface charge $\rho\,dz'$, a distance $u=z-z'$ below $P$. Its potential at $P$ (HW 2.26c) is

          [[fig:slice]]

          $$dV=\frac{\rho\,dz'}{2\ep}\left(\sqrt{R^2+u^2}-u\right).$$

          **Add the disks.** With $u=z-z'$ ($dz'=-du$), $z'$ from $-L/2$ to $L/2$ means $u$ from $z+L/2$ down to $z-L/2$:

          $$V(z)=\frac{\rho}{2\ep}\int_{z-L/2}^{z+L/2}\left(\sqrt{R^2+u^2}-u\right)du .$$

          Using $\int\sqrt{R^2+u^2}\,du=\frac12\left[u\sqrt{R^2+u^2}+R^2\ln\left(u+\sqrt{R^2+u^2}\right)\right]$ and $\int u\,du=u^2/2$, with $u_\pm=z\pm L/2$ and $u_+^2-u_-^2=2zL$:

          $$V(z)=\frac{\rho}{4\ep}\left[u_+\sqrt{R^2+u_+^2}-u_-\sqrt{R^2+u_-^2}+R^2\ln\frac{u_++\sqrt{R^2+u_+^2}}{u_-+\sqrt{R^2+u_-^2}}-2zL\right].$$

          **Field.** $V=\frac{\rho}{2\ep}\int_{u_-}^{u_+}g(u)\,du$ with $g=\sqrt{R^2+u^2}-u$, and both limits move with $z$:

          $$E_z=-\frac{dV}{dz}=-\frac{\rho}{2\ep}\big[g(u_+)-g(u_-)\big]=\frac{\rho}{2\ep}\left[L+\sqrt{R^2+(z-L/2)^2}-\sqrt{R^2+(z+L/2)^2}\right].$$

          **Checks.** Both formulas agree with a direct numerical volume integral over the cylinder. Three quick checks you can do by hand:

          - Far away: $\sqrt{R^2+(z+L/2)^2}-\sqrt{R^2+(z-L/2)^2}\approx L-\dfrac{R^2L}{2z^2}$, so $E_z\approx\dfrac{\rho R^2L}{4\ep z^2}=\dfrac{1}{4\pi\ep}\dfrac{\rho\pi R^2L}{z^2}$: the total charge as a point.
          - $E_z>0$ for $\rho>0$: the field points away from the cylinder.
          - $R\to0$ with $\rho\pi R^2=\lambda$ fixed should give a line segment. Then $E_z\approx\dfrac{\lambda}{4\pi\ep}\left(\dfrac{1}{z-L/2}-\dfrac{1}{z+L/2}\right)$, the field beyond the end of a segment.

          **What to remember.** Build hard shapes from easy ones you already know (point → ring → disk → cylinder), and differentiate before integrating when you only need the field: the derivative of an integral with moving limits is just the integrand at the limits.
        `,
        figs: { slice: { svg: figCylinder({ slice: true }), cap: md`A slice at height $z'$ is a disk with surface charge $\rho\,dz'$, a distance $z-z'$ below $P$.` } },
      }),
      RF(md`
        !!key Patterns to remember
          - Superpose potentials as signed numbers: $V=\kq\sum q_i/\srm_i$ or $\kq\int dq/\srm$, with $\srm$ measured from each source piece to the field point.
          - $V=0$ and $\vb E=0$ are independent facts: a square of equal charges has $\vb E=0$, $V\neq0$ at the center; a dipole has $V=0$, $\vb E\neq0$ at the midpoint.
          - Ring: every piece at the same distance, so $V=\kq\dfrac{Q}{\sqrt{R^2+z^2}}$ with no integral. Disk = rings; cylinder = disks; annulus = disk minus disk.
          - $\vb E=-\nabla V$ needs $V$ in every direction you differentiate. Axis-only $V$ gives only $E_z$ on the axis.
          - Always check: far away $V\to\kq Q_{\text{tot}}/r$; near a long line $V\approx\dfrac{\lambda}{2\pi\ep}\ln\dfrac{(\text{length})}{z}$; infinite size breaks $V(\infty)=0$.
      `),
    ],
  };

  // ================================================================== Lesson 5 figures
  // spherical shell: o.pin / o.pout add field points inside / outside
  const figShell = (o = {}) => {
    const f = PF.fig();
    const cx = 110, cy = 110, R = 70;
    f.circle(cx, cy, R, { cls: 'thick' });
    f.line(cx, cy, cx + R * Math.cos(45 * DEG), cy - R * Math.sin(45 * DEG), { cls: 'dim' });
    f.label(126.9, 77.5, 'R', 'c', 'small');
    f.dot(cx, cy, 2.2);
    f.label(48, 40, o.lab || md`\sigma`, 'c', 'small');
    if (o.pin) { f.dot(cx - 30, cy + 30, 3.2); f.tag(cx - 30, cy + 30, 'P_1', 'r', 7); }
    if (o.pout) { f.dot(cx + 105, cy + 40, 3.2); f.tag(cx + 105, cy + 40, 'P_2', 'r', 7); }
    return f.svg();
  };
  const figShellEV = () => PF.row([
    { svg: gplot({ w: 230, h: 150, x: [0, 4], y: [0, 1.25], xt: [[1, 'R']], xl: 'r', yl: 'E', curves: [{ f: () => 0, from: 0, to: 1 }, { f: (r) => 1 / (r * r), from: 1, to: 4 }], extra: (f, X, Y) => f.line(X(1), Y(0), X(1), Y(1), { cls: 'dash dim' }) }), cap: 'E(r): zero inside, a jump at R' },
    { svg: gplot({ w: 230, h: 150, x: [0, 4], y: [0, 1.25], xt: [[1, 'R']], yt: [[1, 'V_R']], xl: 'r', yl: 'V', curves: [{ f: () => 1, from: 0, to: 1 }, { f: (r) => 1 / r, from: 1, to: 4 }] }), cap: 'V(r): flat inside, continuous at R' },
  ]).svg;
  const figTwoShells = (o = {}) => {
    const f = PF.fig();
    const cx = 120, cy = 120;
    f.circle(cx, cy, 45, { cls: 'thick' }); f.circle(cx, cy, 95, { cls: 'thick' });
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx + 45 * Math.cos(150 * DEG), cy - 45 * Math.sin(150 * DEG), { cls: 'dim' });
    f.label(106, 99.2, 'a', 'c', 'small');
    f.line(cx, cy, cx + 95 * Math.cos(30 * DEG), cy - 95 * Math.sin(30 * DEG), { cls: 'dim' });
    f.label(176.9, 74.5, 'b', 'c', 'small');
    f.label(cx, cy + 49, o.qa || 'q_a', 't', 'small');
    f.label(cx, cy + 99, o.qb || 'q_b', 't', 'small');
    return f.svg();
  };
  const figTwoShellsV = () => gplot({
    w: 300, h: 170, x: [0, 4], y: [0, 1], xt: [[1, 'a'], [2, 'b']], xl: 'r', yl: 'V',
    curves: [{ f: () => 0.75, from: 0, to: 1 }, { f: (r) => 1 / r - 0.25, from: 1, to: 2 }, { f: (r) => 0.5 / r, from: 2, to: 4 }],
  });
  const figSolidSphere = () => {
    const f = PF.fig();
    const cx = 110, cy = 110, R = 70;
    f.circle(cx, cy, R, { cls: 'shade' }); f.circle(cx, cy, R);
    const ex = cx + R * Math.cos(30 * DEG), ey = cy - R * Math.sin(30 * DEG);
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
      const x = cx + 20 * i, y = cy + 20 * j;
      if (Math.hypot(x - cx, y - cy) > 58 || (i === 0 && j === 0)) continue;
      const t = ((x - cx) * (ex - cx) + (y - cy) * (ey - cy)) / (R * R);
      const d = Math.hypot(x - cx - t * (ex - cx), y - cy - t * (ey - cy));
      if (t > -0.1 && t < 1.1 && d < 10) continue;
      plus(f, x, y, 3);
    }
    f.line(cx, cy, ex, ey, { cls: 'dim' });
    f.label(cx + 24, cy - 26, 'R', 'c', 'small');
    f.dot(cx, cy, 2.2);
    f.label(36, 36, md`q`, 'c', 'small');
    return f.svg();
  };
  const figSolidSphereV = () => PF.row([
    { svg: gplot({ w: 240, h: 160, x: [0, 4], y: [0, 1.7], xt: [[1, 'R']], yt: [[1, 'V_R'], [1.5, '\\tfrac32V_R']], xl: 'r', yl: 'V', curves: [{ f: (r) => (3 - r * r) / 2, from: 0, to: 1 }, { f: (r) => 1 / r, from: 1, to: 4 }] }), cap: 'V(r): parabola inside, 1/r outside, smooth at R' },
    { svg: gplot({ w: 240, h: 160, x: [0, 4], y: [0, 1.2], xt: [[1, 'R']], xl: 'r', yl: 'E', curves: [{ f: (r) => r, from: 0, to: 1 }, { f: (r) => 1 / (r * r), from: 1, to: 4 }] }), cap: 'E(r): linear inside, 1/r² outside, no jump' },
  ]).svg;
  const figCoax = (o = {}) => {
    const f = PF.fig();
    const cx = 110, cy = 110, a = 40, b = 95;
    f.circle(cx, cy, a, { cls: 'shade' }); f.circle(cx, cy, a);
    f.circle(cx, cy, b, { cls: 'thick' });
    for (let k = 0; k < 12; k++) minus(f, cx + 104 * Math.cos((k * 30 + 15) * DEG), cy - 104 * Math.sin((k * 30 + 15) * DEG), 3.2);
    f.dot(cx, cy, 2.6);
    f.label(222, 34, md`-\sigma`, 'c', 'small');
    if (o.gauss) {
      f.circle(cx, cy, 20, { cls: 'dash' }); f.circle(cx, cy, 70, { cls: 'dash' });
      callout(f, cx + 20 * Math.cos(240 * DEG), cy - 20 * Math.sin(240 * DEG), 60, 228, 's<a', 't');
      callout(f, cx + 70 * Math.cos(300 * DEG), cy - 70 * Math.sin(300 * DEG), 170, 228, 'a<s<b', 't');
    } else {
      f.line(cx, cy, cx + a * Math.cos(50 * DEG), cy - a * Math.sin(50 * DEG), { cls: 'dim' });
      f.label(115.2, 88.3, 'a', 'c', 'small');
      f.line(cx, cy, cx + b * Math.cos(-30 * DEG), cy - b * Math.sin(-30 * DEG), { cls: 'dim' });
      f.label(158.7, 149.7, 'b', 'c', 'small');
      f.label(100, 125, md`\rho`, 'c', 'small');
    }
    return f.svg();
  };
  const figCoaxV = () => gplot({
    w: 300, h: 170, x: [0, 3.2], y: [0, 1.25], xt: [[1, 'a'], [2.5, 'b']], xl: 's', yl: 'V(s)-V(b)',
    curves: [{ f: (s) => (1 + 2 * Math.log(2.5) - s * s) / (1 + 2 * Math.log(2.5)), from: 0, to: 1 }, { f: (s) => 2 * Math.log(2.5 / s) / (1 + 2 * Math.log(2.5)), from: 1, to: 2.5 }, { f: () => 0, from: 2.5, to: 3.2 }],
  });
  const figThickShell = () => {
    const f = PF.fig();
    const cx = 120, cy = 120, a = 40, b = 90;
    const outer = f.arcPts(cx, cy, b, b, 0, 360), inner = f.arcPts(cx, cy, a, a, 360, 0);
    f.add(`<path class="shade nodecl" d="M${outer.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}ZM${inner.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z"/>`);
    f.circle(cx, cy, a); f.circle(cx, cy, b);
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx + a * Math.cos(135 * DEG), cy - a * Math.sin(135 * DEG), { cls: 'dim' });
    f.label(cx - 7, cy - 21, 'a', 'c', 'small');
    f.line(cx, cy, cx + b * Math.cos(20 * DEG), cy - b * Math.sin(20 * DEG), { cls: 'dim' });
    f.label(cx + 52, cy - 27, 'b', 'c', 'small');
    callout(f, cx, cy + 65, cx, cy + 112, md`\rho=\rho_0a^2/r^2`, 't');
    return f.svg();
  };
  // given field of a uniform thick shell (a = 1, b = 2), scaled to 1 at r = b
  const Ethick = (r) => (r < 1 ? 0 : r < 2 ? (r ** 3 - 1) / (1.75 * r * r) : 4 / (r * r));
  const Vthick = (r) => (r < 1 ? 1 : r < 2 ? (6 - r * r / 2 - 1 / r) / 4.5 : 7 / (4.5 * r));

  // ================================================================== Lesson 5
  const L5 = {
    id: 'u2-spheres', title: 'Shells, spheres and cylinders: sketching V',
    steps: [
      RF(md`
        ### Work inward from the reference point

        When Gauss's law hands you $\vb E$ (spherical or cylindrical symmetry), get $V$ by integrating the field inward from the reference:

        $$V(r)=-\int_\infty^r E_r(r')\,dr' .$$

        The formula for $E$ changes from region to region, so **split the integral at every radius where it changes**, and in each piece use the field that holds there.

        **Spherical shell** (radius $R$, total charge $q$; Griffiths Ex. 2.7). Gauss gives $E=0$ inside and $E=\dfrac{q}{4\pi\ep r^2}$ outside.

        - Outside ($r>R$): $V(r)=-\displaystyle\int_\infty^r\frac{q\,dr'}{4\pi\ep r'^2}=\frac{q}{4\pi\ep r}$.
        - Inside ($r<R$): $V(r)=-\displaystyle\int_\infty^R\frac{q\,dr'}{4\pi\ep r'^2}-\int_R^r 0\,dr'=\frac{q}{4\pi\ep R}$.

        [[fig:ev]]

        Inside, $V$ is **constant, not zero**: $\vb E=-\nabla V=0$ only needs $V$ to be flat. The constant is whatever $V$ was when you arrived at the shell. Griffiths: you must always work your way in from the reference point, because that is where the potential is "nailed down". The potential inside depends on everything outside too.
      `, { ev: { svg: figShellEV(), cap: 'Spherical shell, with $V_R=\\tfrac{q}{4\\pi\\varepsilon_0R}$. Lecture 5 draws the same $E(r)$ graph.' } }),
      Q(md`Inside a uniformly charged spherical shell (radius $R$, charge $q$, $V(\infty)=0$), at a point $P_1$ the potential is`,
        [md`zero, since $\vb E=0$ inside`, md`$\dfrac{q}{4\pi\ep R}$, the same everywhere inside`, md`$\dfrac{q}{4\pi\ep r}$, as if all the charge were at the center`, md`undefined, since there is no charge at $P_1$`], 1,
        [md`$\vb E=0$ means $V$ does not change inside, not that it is zero. You arrive at the shell with $V=\tfrac{q}{4\pi\ep R}$ and stay there.`,
          null,
          md`Outside, the shell acts like a point charge. Inside, that formula would give a varying $V$ and a nonzero field.`,
          md`$V$ is defined everywhere; the integral from infinity to $P_1$ is perfectly finite.`],
        md`Integrate inward: from $\infty$ to $R$ you collect $\dfrac{q}{4\pi\ep R}$; from $R$ to $P_1$ the field is zero and you collect nothing. Every point inside has the same potential as the shell itself.`,
        { figHtml: figShell({ pin: true }) }),
      Q(md`A second, larger concentric shell (radius $R_2>R$, charge $Q_2$) is added around the first one. For points inside the inner shell,`,
        [md`neither $V$ nor $\vb E$ changes`, md`$V$ is unchanged, but $\vb E$ becomes nonzero`, md`$\vb E$ stays zero, but $V$ shifts by the constant $\dfrac{Q_2}{4\pi\ep R_2}$`, md`both change`], 2,
        [md`$\vb E$ is unchanged, but $V$ is not: the new shell contributes its own constant $\tfrac{Q_2}{4\pi\ep R_2}$ everywhere inside it.`,
          md`The outer shell's field is zero everywhere inside it (Gauss), so $\vb E$ stays zero.`,
          null,
          md`The field inside is still zero. Only $V$ shifts.`],
        md`Superpose: inside both shells $V=\dfrac{q}{4\pi\ep R}+\dfrac{Q_2}{4\pi\ep R_2}$, still constant, so $\vb E=0$. Gauss's law says exterior spherical charge produces no field inside; there is no such rule for $V$ (Griffiths makes exactly this point).`,
        { figHtml: figTwoShells({ qa: 'q', qb: 'Q_2' }) }),
      Q(md`On a graph of $V(r)$ for a spherically symmetric charge, the slope $dV/dr$ at some radius equals`,
        [md`$-E_r$ there`, md`$+E_r$ there`, md`$|\vb E|$ there`, md`the charge enclosed within $r$`], 0,
        [null,
          md`Sign: $\vb E=-\nabla V$, so $E_r=-dV/dr$.`,
          md`Only up to a sign: where $V$ rises outward, $E_r<0$.`,
          md`The enclosed charge sets $E_r$ (through Gauss), and $E_r$ sets the slope, but the slope is not the charge.`],
        md`$E_r=-\dfrac{dV}{dr}$. So a falling $V(r)$ means an outward field; a flat $V$ means no field; a steep drop means a strong field. Reading $E$ off a $V$ graph is just reading slopes.`,
        { nofig: 'definition; the graphs are just above' }),
      Q(md`At the shell's surface $r=R$, the graph of $V(r)$ is`,
        [md`discontinuous, jumping by $\sigma/\ep$`, md`continuous, with a continuous slope`, md`continuous, but its slope jumps: a corner (kink)`, md`undefined right at $r=R$`], 2,
        [md`$E$ jumps by $\sigma/\ep$ at $R$. $V$, the integral of $E$, cannot jump: a finite field over a zero distance gives zero change.`,
          md`The slope is $-E_r$, which jumps from $0$ to $-\tfrac{q}{4\pi\ep R^2}$ at $R$.`,
          null,
          md`Both formulas give $V(R)=\tfrac{q}{4\pi\ep R}$; it is perfectly defined.`],
        md`$V$ is continuous everywhere (a finite field integrated over a vanishing distance gives nothing), but $dV/dr=-E_r$ jumps where $E$ jumps, at the surface charge. So surface charge shows up as a **kink** in $V$. Lessons 6 and 7 make this the general rule.`,
        { figHtml: figShell() }),
      RF(md`
        ### The same shell from the integral (Griffiths Ex. 2.8)

        You can also get the shell's potential from $V=\kq\displaystyle\int\frac{\sigma\,da'}{\srm}$. Put $P$ on the $z$ axis; by the law of cosines $\srm^2=R^2+z^2-2Rz\cos\theta'$, and $da'=R^2\sin\theta'\,d\theta'\,d\phi'$:

        $$4\pi\ep V(z)=2\pi R^2\sigma\int_0^\pi\frac{\sin\theta'\,d\theta'}{\sqrt{R^2+z^2-2Rz\cos\theta'}}=\frac{2\pi R\sigma}{z}\left[\sqrt{(R+z)^2}-\sqrt{(R-z)^2}\right].$$

        The trap is the second root: $\sqrt{(R-z)^2}=|R-z|$, which is $z-R$ outside and $R-z$ inside. That gives $V=\dfrac{R^2\sigma}{\ep z}$ outside and $V=\dfrac{R\sigma}{\ep}$ inside: the same as before, with $q=4\pi R^2\sigma$. Here Gauss was faster; for shapes without symmetry the integral is the only route.
      `),
      Q(md`In the shell integral, for a point inside ($z<R$), $\sqrt{(R-z)^2}$ must be taken as`,
        [md`$z-R$`, md`$\pm(R-z)$, either sign`, md`$R+z$`, md`$R-z$`], 3,
        [md`That is negative for $z<R$, and a square root is never negative. With it you would get $V=\tfrac{R^2\sigma}{\ep z}$ inside, which blows up at the center.`,
          md`The square root is the positive root, by definition. Only one choice is right in each region.`,
          md`That is the other root, $\sqrt{(R+z)^2}$.`,
          null],
        md`$\sqrt{x^2}=|x|$. Inside, $R-z>0$, so the root is $R-z$, and the bracket becomes $(R+z)-(R-z)=2z$, giving the constant $V=R\sigma/\ep$. Outside it is $z-R$, giving $2R$ and $V\propto1/z$.`,
        { figHtml: figShell({ pin: true }) }),
      RF(md`
        ### Worked example: two concentric shells

        Thin shells of radii $a<b$ carry $q_a$ and $q_b$. Superpose two single-shell results (each: constant inside, $\tfrac{1}{4\pi\ep}\tfrac{q}{r}$ outside):

        [[fig:two]]

        - $r>b$: $V=\dfrac{q_a+q_b}{4\pi\ep r}$.
        - $a<r<b$: $V=\dfrac{q_a}{4\pi\ep r}+\dfrac{q_b}{4\pi\ep b}$ (outside shell $a$, inside shell $b$).
        - $r<a$: $V=\dfrac{q_a}{4\pi\ep a}+\dfrac{q_b}{4\pi\ep b}$, constant.

        Check continuity: at $r=b$ the first two agree; at $r=a$ the last two agree. The graph below is for $q_b=-q_a/2$ and $b=2a$: flat inside, a corner at each shell, $1/r$ shapes in between.

        [[fig:twoV]]
      `, { two: { svg: figTwoShells(), cap: 'Concentric shells of radii $a$ and $b$.' }, twoV: { svg: figTwoShellsV(), cap: md`$V(r)$ for $q_b=-q_a/2$ and $b=2a$: continuous, with kinks at $a$ and $b$.` } }),
      P({
        title: 'Two shells with numbers',
        q: md`A thin shell of radius $a=5.0$ cm carries $+3.0$ nC; a concentric thin shell of radius $b=10$ cm carries $-1.0$ nC. With $V(\infty)=0$ and $\dfrac{1}{4\pi\ep}=8.99\times10^9$ N·m²/C², find $V$ at the center, at $r=8.0$ cm and at $r=20$ cm.`,
        figHtml: figTwoShells({ qa: md`+3.0\text{ nC}`, qb: md`-1.0\text{ nC}` }),
        hints: [md`Superpose the two shells. Each gives $\kq\dfrac qR$ inside itself and $\kq\dfrac qr$ outside.`, md`At $r=8$ cm you are outside shell $a$ but inside shell $b$.`],
        parts: [
          { lbl: 'V(0)', ans: 449.5, unit: 'V' },
          { lbl: 'V(8\\text{ cm})', ans: 247.2, unit: 'V' },
          { lbl: 'V(20\\text{ cm})', ans: 89.9, unit: 'V' },
        ],
        sol: md`
          - Center: $8.99\times10^9\left(\dfrac{3.0\times10^{-9}}{0.050}-\dfrac{1.0\times10^{-9}}{0.10}\right)=8.99\,(60-10)=449$ V.
          - $r=8$ cm: $8.99\left(\dfrac{3.0}{0.080}-\dfrac{1.0}{0.10}\right)=8.99\,(37.5-10)=247$ V.
          - $r=20$ cm: $8.99\left(\dfrac{3.0-1.0}{0.20}\right)=89.9$ V.

          The outer shell lowers $V$ by the same 89.9 V everywhere inside it (at the center and at 8 cm alike), because inside a shell its contribution is constant.
        `,
      }),
      Q(md`A point charge $+q$ sits at the center of a thin spherical shell of radius $R$ carrying $-q$. Which graph is $V(r)$ (with $V(\infty)=0$)?`,
        ['A', 'B', 'C', 'D'], 2,
        [md`That is the point charge alone. The shell adds $-\tfrac{q}{4\pi\ep R}$ inside and cancels the field outside.`,
          md`$V$ cannot jump at $R$: the field near the shell is finite, so $V$ is continuous.`,
          null,
          md`Outside, the total charge is zero, so $\vb E=0$ and $V$ stays at its value at infinity, zero. It cannot keep falling.`],
        md`Outside, the net charge is zero: $\vb E=0$ and $V=V(\infty)=0$. Inside, superpose: $V=\dfrac{q}{4\pi\ep}\left(\dfrac1r-\dfrac1R\right)$, which falls to zero exactly at $R$ and then stays there. Continuous, with a kink at $R$ (the shell's surface charge).`,
        { figHtml: rowABCD([
          thumb([{ f: (r) => 1 / r, from: 0.77 }], { y: [-1.1, 1.3] }),
          thumb([{ f: (r) => 1 / r, from: 0.77, to: 1 }, { f: () => 0, from: 1 }], { y: [-1.1, 1.3] }),
          thumb([{ f: (r) => 1 / r - 1, from: 0.44, to: 1 }, { f: () => 0, from: 1 }], { y: [-1.1, 1.3] }),
          thumb([{ f: (r) => 1 / r - 1, from: 0.44 }], { y: [-1.1, 1.3], xlAbove: true }),
        ]) }),
      P({
        id: 'D2-2.22', src: 'Discussion 2 · Griffiths 2.22', title: 'Uniformly charged solid sphere', big: true,
        q: md`Find the potential inside and outside a uniformly charged solid sphere whose radius is $R$ and whose total charge is $q$. Use infinity as your reference point. Compute the gradient of $V$ in each region, and check that it yields the correct field. Sketch $V(r)$.`,
        figHtml: figSolidSphere(),
        hints: [
          md`Gauss first: outside $E=\dfrac{q}{4\pi\ep r^2}$; inside, the enclosed charge is $q\,r^3/R^3$, so $E=\dfrac{qr}{4\pi\ep R^3}$.`,
          md`Outside: integrate from $\infty$ to $r$. Inside: split, $V(r)=-\int_\infty^R E_{\text{out}}\,dr'-\int_R^r E_{\text{in}}\,dr'$.`,
          md`$\int_R^r\dfrac{qr'}{4\pi\ep R^3}dr'=\dfrac{q}{8\pi\ep R^3}\left(r^2-R^2\right)$. Mind the minus sign in front.`,
        ],
        parts: [
          { lbl: 'V\\ (r>R)', expr: 'q/(4*pi*eps0*r)', vars: { q: [0.5, 2], eps0: [0.5, 2], r: [1.2, 3] } },
          { lbl: 'V\\ (r<R)', expr: 'q/(8*pi*eps0*R)*(3 - r^2/R^2)', vars: { q: [0.5, 2], eps0: [0.5, 2], R: [1.5, 3], r: [0.2, 1.4] }, accepts: ['q*(3*R^2 - r^2)/(8*pi*eps0*R^3)'] },
          { lbl: md`$V(0)/V(R)$`, ans: 1.5, unit: '' },
          { lbl: md`Inside, $-\nabla V$ equals`, mc: [md`$\dfrac{qr}{4\pi\ep R^3}\,\uv r$`, md`$\dfrac{q}{4\pi\ep r^2}\,\uv r$`, md`$-\dfrac{qr}{4\pi\ep R^3}\,\uv r$`, md`$\vb 0$`], a: 0, why: [null, md`That is the outside field. Inside, only the charge within $r$ counts, and it grows as $r^3$.`, md`Sign: $dV/dr=-\tfrac{qr}{4\pi\ep R^3}<0$, so $-dV/dr>0$: outward, as it must be for $q>0$.`, md`$V$ varies inside (it is a parabola), so its gradient is not zero. Zero field inside belongs to a shell.`] },
        ],
        sol: md`
          **Field from Gauss.** Outside, $E=\dfrac{q}{4\pi\ep r^2}$. Inside, a Gaussian sphere of radius $r$ encloses $q\dfrac{r^3}{R^3}$, so $E=\dfrac{qr}{4\pi\ep R^3}$. Both radial.

          **Outside** ($r>R$):

          $$V(r)=-\int_\infty^r\frac{q}{4\pi\ep r'^2}\,dr'=\frac{q}{4\pi\ep r}.$$

          **Inside** ($r<R$): split at $R$, using the field that holds in each piece:

          $$V(r)=-\int_\infty^R\frac{q\,dr'}{4\pi\ep r'^2}-\int_R^r\frac{q\,r'}{4\pi\ep R^3}\,dr'=\frac{q}{4\pi\ep R}-\frac{q}{8\pi\ep R^3}\left(r^2-R^2\right)=\frac{q}{8\pi\ep R}\left(3-\frac{r^2}{R^2}\right).$$

          **Gradient check.** Outside: $-\nabla V=\dfrac{q}{4\pi\ep r^2}\uv r$. Inside: $-\dfrac{dV}{dr}\uv r=-\dfrac{q}{8\pi\ep R}\left(-\dfrac{2r}{R^2}\right)\uv r=\dfrac{qr}{4\pi\ep R^3}\uv r$. Both match.

          **Sketch.**

          [[fig:sv]]

          - At $R$ both formulas give $\dfrac{q}{4\pi\ep R}$: continuous.
          - The slopes also match at $R$ (both $-\dfrac{q}{4\pi\ep R^2}$): no kink, because there is no surface charge. The field is continuous there.
          - At the center $V=\dfrac32\dfrac{q}{4\pi\ep R}$, the maximum, with zero slope ($E=0$).

          **What to remember.** Split the integral wherever the field formula changes, work in from the reference, and check continuity of $V$ at each boundary (a good catch for algebra slips). A smooth join means no surface charge; a corner would mean surface charge.
        `,
        figs: { sv: { svg: figSolidSphereV(), cap: 'Solid sphere, $V_R=\\tfrac{q}{4\\pi\\varepsilon_0R}$.' } },
      }),
      Q(md`For the uniformly charged solid sphere ($q>0$), where is $V$ largest?`,
        [md`At the surface, where $|\vb E|$ is largest`, md`At the center, where $\vb E=0$`, md`It is the same everywhere inside, as for a shell`, md`At infinity`], 1,
        [md`$V$ keeps rising as you go inward past the surface, because $\vb E$ still points outward there.`,
          null,
          md`That is the shell. Inside a solid sphere the field is not zero, so $V$ is not flat.`,
          md`$V(\infty)=0$ is the smallest value for positive charge.`],
        md`Going inward against an outward field, $V$ rises all the way to the center, where the field finally vanishes and $V$ peaks at $\dfrac32\dfrac{q}{4\pi\ep R}$. Maximum of $V$ ⇔ zero slope ⇔ zero field.`,
        { figHtml: figSolidSphere() }),
      Q(md`At the surface of the uniformly charged **solid** sphere, the graph of $V(r)$`,
        [md`has a kink, because the formula for $V$ changes there`,
          md`has a jump`,
          md`is smooth: $V$ and $dV/dr$ are both continuous, since there is no surface charge`,
          md`has a kink, because $\rho$ jumps from its value to zero`], 2,
        [md`A change of formula does not by itself mean a kink. Compare slopes: both sides give $-\tfrac{q}{4\pi\ep R^2}$.`,
          md`$V$ never jumps across a surface with finite field.`,
          null,
          md`A jump in $\rho$ makes $V''$ jump (Poisson), not $V'$. A kink in $V$ needs surface charge.`],
        md`$E$ is continuous at $R$ ($\tfrac{qr}{4\pi\ep R^3}\to\tfrac{q}{4\pi\ep R^2}$), so the slope of $V$ is continuous. Only a sheet of charge (finite charge in zero thickness) makes the field, and hence the slope of $V$, jump. A jump in volume density only changes the curvature.`,
        { figHtml: figSolidSphere() }),
      P({
        id: 'HW2-2.25', src: 'HW 2 · Griffiths 2.25', title: 'Coaxial cable: axis to outer cylinder', big: true,
        q: md`For the configuration shown below, find the potential difference between a point on the axis and a point on the outer cylinder. Note that it is not necessary to commit yourself to a particular reference point, if you use Eq. 2.22.

          (The configuration is the long coaxial cable of Discussion 1 · Problem 2.17: a uniform volume charge density $\rho$ on the inner cylinder of radius $a$, and on the outer thin cylindrical shell of radius $b$ a negative surface charge of just the right size to make the cable neutral. Eq. 2.22: $V(\vb b)-V(\vb a)=-\int_{\vb a}^{\vb b}\vb E\cdot d\vb l$.)`,
        figHtml: figCoax(),
        hints: [
          md`Eq. 2.22 along a radial line from the axis ($s=0$) to the outer cylinder ($s=b$): $V(0)-V(b)=\displaystyle\int_0^b E_s\,ds$. No reference point needed.`,
          md`Fields from Gauss (Discussion 1): $s<a$: $E=\dfrac{\rho s}{2\ep}$; $a<s<b$: $E=\dfrac{\rho a^2}{2\ep s}$; $s>b$: $E=0$.`,
          md`Split the integral at $s=a$: $\displaystyle\int_0^a\frac{\rho s}{2\ep}ds+\int_a^b\frac{\rho a^2}{2\ep s}ds$.`,
        ],
        parts: [
          { lbl: 'V(0)-V(b)', expr: 'rho*a^2/(4*eps0)*(1 + 2*ln(b/a))', vars: { rho: [0.5, 2], eps0: [0.5, 2], a: [0.2, 0.8], b: [1, 2.5] }, accepts: ['rho*a^2/(4*eps0) + rho*a^2/(2*eps0)*ln(b/a)'] },
          { lbl: md`For $\rho>0$, which is at the higher potential?`, mc: [md`the axis`, md`the outer cylinder`, md`they are equal, since the cable is neutral`], a: 0, why: [null, md`The field points outward between them (the inner charge is positive), and $V$ drops along the field.`, md`Neutrality kills the field outside; between the conductors $E\neq0$, so there is a potential difference.`] },
        ],
        sol: md`
          **Field (Gauss, Discussion 1 · 2.17).** Use a Gaussian cylinder of radius $s$ and length $\ell$:

          [[fig:gauss]]

          - $s<a$: $E\,2\pi s\ell=\dfrac{\rho\pi s^2\ell}{\ep}$, so $E=\dfrac{\rho s}{2\ep}$.
          - $a<s<b$: $E\,2\pi s\ell=\dfrac{\rho\pi a^2\ell}{\ep}$, so $E=\dfrac{\rho a^2}{2\ep s}$.
          - $s>b$: the enclosed charge is zero, so $E=0$.

          **Potential difference** (Eq. 2.22, radial path, $d\vb l=ds\,\uv s$):

          $$V(0)-V(b)=-\int_b^0 E_s\,ds=\int_0^b E_s\,ds=\int_0^a\frac{\rho s}{2\ep}\,ds+\int_a^b\frac{\rho a^2}{2\ep s}\,ds=\frac{\rho a^2}{4\ep}+\frac{\rho a^2}{2\ep}\ln\frac ba .$$

          $$\boxed{V(0)-V(b)=\frac{\rho a^2}{4\ep}\left[1+2\ln\frac ba\right]}$$

          Positive: the axis is higher, since the field points outward everywhere between them.

          [[fig:vs]]

          **Why no reference point.** Eq. 2.22 involves only the two end points. An infinite cylinder would normally make $V(\infty)=0$ unusable, but you never needed it. (Here, since $E=0$ outside the neutral cable, $V$ is in fact constant beyond $b$, and setting $V(\infty)=0$ would also have worked.)

          **Checks.** Units: $\rho a^2/\ep$ is (C/m³)(m²)/(C²/N·m²) = N·m/C = V. As $b\to a$ (outer shell right on the surface), only the inner part survives: $\tfrac{\rho a^2}{4\ep}$.
        `,
        figs: {
          gauss: { svg: figCoax({ gauss: true }), cap: 'Gaussian cylinders (dashed) inside the core and between the conductors.' },
          vs: { svg: figCoaxV(), cap: md`$V(s)-V(b)$ for $b=2.5a$: a parabola in the core, a logarithm between, flat outside.` },
        },
      }),
      Q(md`For the **neutral** coaxial cable above, could you have used $V(\infty)=0$ after all?`,
        [md`No: for any infinitely long distribution the potential diverges at infinity.`,
          md`Yes: outside the cable $\vb E=0$, so $V$ is constant from $b$ out to infinity and setting it to zero is harmless.`,
          md`Yes, but only because $\rho>0$.`,
          md`No: the outer shell's negative charge makes $V(\infty)=-\infty$.`], 1,
        [md`The divergence comes from a field that falls off too slowly ($1/s$). Here the field is exactly zero outside, so nothing diverges.`,
          null,
          md`The sign of $\rho$ does not matter; neutrality does.`,
          md`The shell's charge exactly cancels the core's, so beyond $b$ there is no field and $V$ does not change.`],
        md`The rule "no $V(\infty)=0$ for infinite distributions" is about the integral $\int^\infty E\,ds$ diverging. For a neutral cable $E=0$ beyond $b$, so $V(b)=V(\infty)$ and you may call it zero. For a charged line it really does diverge.`,
        { figHtml: figCoax() }),
      P({
        title: 'Potential at the center of a thick shell',
        q: md`A thick spherical shell, $a\le r\le b$, carries charge density $\rho(r)=\rho_0\dfrac{a^2}{r^2}$ (no charge elsewhere). Find $E$ in the shell region and the potential at the center, with $V(\infty)=0$.`,
        figHtml: figThickShell(),
        hints: [
          md`Gauss: $Q_{\text{enc}}(r)=\displaystyle\int_a^r\rho_0\frac{a^2}{r'^2}\,4\pi r'^2\,dr'=4\pi\rho_0a^2(r-a)$ for $a<r<b$.`,
          md`$V(0)=\displaystyle\int_0^\infty E\,dr$, split at $a$ and $b$. $E=0$ for $r<a$.`,
          md`$\displaystyle\int_a^b\frac{r-a}{r^2}\,dr=\ln\frac ba+\frac ab-1$, and the outside piece gives $\dfrac{b-a}{b}$.`,
        ],
        parts: [
          { lbl: 'E\\ (a<r<b)', expr: 'rho0*a^2*(r-a)/(eps0*r^2)', vars: { rho0: [0.5, 2], a: [0.3, 0.8], r: [0.9, 1.4], eps0: [0.5, 2] } },
          { lbl: 'V(0)', expr: 'rho0*a^2/eps0*ln(b/a)', vars: { rho0: [0.5, 2], a: [0.3, 0.8], b: [1, 2], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Field.** For $a<r<b$: $E\cdot4\pi r^2=\dfrac{4\pi\rho_0a^2(r-a)}{\ep}$, so $E=\dfrac{\rho_0a^2(r-a)}{\ep r^2}$. Outside: $E=\dfrac{\rho_0a^2(b-a)}{\ep r^2}$. Inside the hole: $E=0$.

          **Potential at the center.** $V(0)=-\int_\infty^0E\,dr=\int_0^\infty E\,dr$:

          $$V(0)=0+\frac{\rho_0a^2}{\ep}\int_a^b\frac{r-a}{r^2}\,dr+\frac{\rho_0a^2(b-a)}{\ep}\int_b^\infty\frac{dr}{r^2}=\frac{\rho_0a^2}{\ep}\left[\ln\frac ba+\frac ab-1\right]+\frac{\rho_0a^2}{\ep}\cdot\frac{b-a}{b}=\frac{\rho_0a^2}{\ep}\ln\frac ba .$$

          The $a/b$ terms cancel. Check: if $b\to a$ the shell disappears and $V(0)\to0$. (This is Griffiths 4th ed. Prob. 2.23 with $k=\rho_0a^2$.)
        `,
      }),
      Q(md`An infinitely long thin cylindrical shell of radius $R$ carries charge $\lambda>0$ per unit length. Taking $V=0$ on the shell itself, which graph is $V(s)$?`,
        ['A', 'B', 'C', 'D'], 0,
        [null,
          md`Sign: moving outward you go along the outward field, so $V$ must decrease outside.`,
          md`That is a line charge on the axis. Inside a cylindrical shell the field is zero, so $V$ is flat there.`,
          md`That curve levels off, like a sphere's $1/r$. Outside a cylinder $V=-\tfrac{\lambda}{2\pi\ep}\ln\tfrac sR$ keeps falling without bound.`],
        md`Gauss: $E=0$ inside, $E=\dfrac{\lambda}{2\pi\ep s}$ outside. With $V(R)=0$: flat zero inside, and $V=-\dfrac{\lambda}{2\pi\ep}\ln\dfrac sR$ outside, decreasing forever (logarithmically). Continuous at $R$, with a kink there from the surface charge.`,
        { figHtml: rowABCD([
          thumb([{ f: () => 0, from: 0, to: 1 }, { f: (s) => -Math.log(s), from: 1 }], { y: [-1.3, 1.3], xl: 's', xlAbove: true }),
          thumb([{ f: () => 0, from: 0, to: 1 }, { f: (s) => Math.log(s), from: 1 }], { y: [-1.3, 1.3], xl: 's' }),
          thumb([{ f: (s) => -Math.log(s), from: 0.3 }], { y: [-1.3, 1.3], xl: 's', xlAbove: true }),
          thumb([{ f: () => 0, from: 0, to: 1 }, { f: (s) => -(1 - 1 / s) * 1.6, from: 1 }], { y: [-1.3, 1.3], xl: 's', xlAbove: true }),
        ]) }),
      Q(md`The first graph shows $E(r)$ for a spherically symmetric charge distribution (outward positive). Which of A–D is $V(r)$, with $V(\infty)=0$?

        [[fig:given]]`,
        ['A', 'B', 'C', 'D'], 3,
        [md`That is the $E$ graph itself, not $V$. $V$ is largest where you have climbed the most against the field: at the center.`,
          md`Corners in $V$ need jumps in $E$. This $E$ never jumps (it starts from zero at $a$, and at $b$ it only changes slope), so $V$ has no corners.`,
          md`$E=0$ inside means $V$ is flat there, not zero. $V$ cannot jump up at $a$.`,
          null],
        md`Read slopes: $V'=-E$. For $r<a$, $E=0$: $V$ flat. For $a<r<b$, $E$ grows: $V$ falls ever more steeply. For $r>b$, $V\propto1/r$. Since $E$ is continuous everywhere, $V$ has no corners. This is a uniform thick shell; the charge is a volume density, so there are no kinks.`,
        { figs: { given: { svg: gplot({ w: 260, h: 150, x: [0, 4], y: [0, 1.15], xt: [[1, 'a'], [2, 'b']], xl: 'r', yl: 'E', curves: [{ f: Ethick, from: 0, to: 4, n: 400 }] }), cap: md`Given: $E(r)$.` } },
          figHtml: rowABCD([
            thumb([{ f: Ethick, from: 0, n: 300 }], { xt: [[1, 'a'], [2, 'b']] }),
            thumb([{ f: () => 1, from: 0, to: 1 }, { f: (r) => 1 - 0.222 * (r - 1), from: 1, to: 2 }, { f: (r) => 1.556 / r, from: 2 }], { xt: [[1, 'a'], [2, 'b']] }),
            thumb([{ f: () => 0, from: 0, to: 1 }, { f: Vthick, from: 1 }], { xt: [[1, 'a'], [2, 'b']] }),
            thumb([{ f: Vthick, from: 0, n: 300 }], { xt: [[1, 'a'], [2, 'b']] }),
          ]) }),
      RF(md`
        !!key Patterns to remember
          - With Gauss-friendly symmetry: find $E$ region by region, then $V(r)=-\int_{\text{ref}}^rE\,dr'$, splitting at every boundary and working inward from the reference.
          - Inside a hollow shell: $\vb E=0$ and $V=$ const $=$ its value at the shell, not zero. Charge outside changes $V$ inside but not $\vb E$.
          - $V$ is continuous everywhere. Slope $=-E_r$: surface charge makes a corner; volume charge only bends the curve.
          - Point charge or sphere: $1/r$ outside. Infinite cylinder: $-\ln s$ outside, never levels off. Neutral systems: $V$ flat outside.
          - Solid sphere: $V=\dfrac{q}{8\pi\ep R}\left(3-\dfrac{r^2}{R^2}\right)$ inside, $\dfrac32$ of the surface value at the center.
          - Potential differences (Eq. 2.22) never need a reference point.
      `),
    ],
  };

  // ================================================================== Lesson 6 figures
  const figShellEjump = () => gplot({
    w: 300, h: 180, x: [0, 3], y: [0, 1.25], xt: [[1.2, 'R']], xl: 'r', yl: 'E',
    curves: [{ f: () => 0, from: 0, to: 1.2 }, { f: (r) => (1.2 / r) ** 2, from: 1.2, to: 3 }],
    extra: (f, X, Y) => {
      f.line(X(1.2), Y(0), X(1.2), Y(1), { cls: 'dash dim' });
      f.line(X(1.2) - 9, Y(0) - 3, X(1.2) - 9, Y(1) + 3, { cls: 'dim', arrow: 'both', hs: 5 });
      f.label(X(1.2) - 15, Y(0.5), md`\Delta E=\sigma/\varepsilon_0`, 'r', 'small');
    },
  });
  const figShellEnum = () => gplot({
    w: 300, h: 180, x: [0, 0.6], y: [0, 5.5], xt: [[0.2, '0.20']], yt: [[4.5, '4.5']], xl: md`r\ (\text{m})`, yl: md`E\ (\text{kV/m})`,
    curves: [{ f: () => 0, from: 0, to: 0.2 }, { f: (r) => 4.5 * (0.2 / r) ** 2, from: 0.2, to: 0.6 }],
    extra: (f, X, Y) => f.line(X(0.2), Y(0), X(0.2), Y(4.5), { cls: 'dash dim' }),
  });
  const figPillbox = () => {
    const f = PF.fig();
    const y0 = 110;
    f.line(20, y0, 300, y0, { cls: 'thick' });
    f.label(298, y0 + 8, md`\sigma`, 'tr', 'small');
    f.line(110, 90, 210, 90); f.line(110, 90, 110, y0); f.line(210, 90, 210, y0);
    f.line(110, y0, 110, 130, { cls: 'dash' }); f.line(210, y0, 210, 130, { cls: 'dash' }); f.line(110, 130, 210, 130, { cls: 'dash' });
    f.arrow(160, 88, 160, 48, { hs: 7 });
    f.label(167, 60, md`E^{\perp}_{\text{above}}`, 'l', 'small');
    f.arrow(160, 172, 160, 134, { hs: 7 });
    f.label(167, 158, md`E^{\perp}_{\text{below}}`, 'l', 'small');
    f.label(128, 84, 'A', 'b', 'small');
    f.dim(110, 90, 110, 130, '', { off: 14 });
    f.label(90, 97, md`\epsilon`, 'r', 'small');
    f.arrow(266, y0, 266, 74, { hs: 7 });
    f.label(272, 80, md`\uv n`, 'l', 'small');
    f.text(30, 74, 'above', 'l');
    f.text(30, 150, 'below', 'l');
    return f.svg();
  };
  const figLoopBC = () => {
    const f = PF.fig();
    const y0 = 110, xa = 110, xb = 230, yt = 96, yb = 124;
    f.line(20, y0, 300, y0, { cls: 'thick' });
    f.label(298, y0 + 8, md`\sigma`, 'tr', 'small');
    pathArrow(f, [[xb, yt], [xa, yt]], { t: 0.5 });
    f.line(xa, yt, xa, y0); f.line(xb, y0, xb, yt);
    f.line(xa, y0, xa, yb, { cls: 'dash' }); f.line(xb, yb, xb, y0, { cls: 'dash' });
    pathArrow(f, [[xa, yb], [xb, yb]], { t: 0.5, cls: 'dash' });
    f.arrow(130, 66, 200, 66, { hs: 7 });
    f.label(165, 58, md`E^{\parallel}_{\text{above}}`, 'b', 'small');
    f.arrow(130, 178, 200, 178, { hs: 7 });
    f.label(165, 186, md`E^{\parallel}_{\text{below}}`, 't', 'small');
    f.dim(xa, yb, xb, yb, '', { off: 14 });
    f.label(170, 144, 'l', 't', 'small');
    f.label(100, 95, md`\epsilon`, 'r', 'small');
    f.text(30, 74, 'above', 'l'); f.text(30, 150, 'below', 'l');
    return f.svg();
  };
  const figNormal = () => {
    const f = PF.fig();
    const S = (x) => 128 - 0.0016 * (x - 160) ** 2;
    const pts = [];
    for (let x = 20; x <= 300; x += 5) pts.push([x, S(x)]);
    f.pl(pts, { cls: 'thick' });
    f.dot(160, S(160), 3.2);
    f.arrow(160, S(160) - 4, 160, S(160) - 46, { hs: 7 });
    f.label(167, S(160) - 40, md`\uv n`, 'l', 'small');
    f.text(40, 50, 'above: the side n points into', 'l');
    f.text(40, 170, 'below', 'l');
    f.label(300, S(300) + 8, md`\sigma`, 'tl', 'small');
    return f.svg();
  };
  const figFlatSurface = () => {
    const f = PF.fig();
    const y0 = 110;
    f.line(20, y0, 300, y0, { cls: 'thick' });
    f.dot(160, y0, 3.2); f.tag(160, y0, 'P', 'br', 6);
    f.arrow(160, y0 - 4, 160, y0 - 50, { hs: 7 }); f.label(167, y0 - 42, md`\uv n=\uv z`, 'l', 'small');
    f.text(30, 60, 'above: z > 0', 'l'); f.text(30, 140, 'below: z < 0', 'l');
    f.arrow(250, 180, 290, 180, { cls: 'dim', hs: 6 }); f.label(294, 180, 'x', 'l', 'small accent');
    f.arrow(250, 180, 250, 140, { cls: 'dim', hs: 6 }); f.label(254, 138, 'z', 'bl', 'small accent');
    f.label(24, y0 + 8, md`\sigma`, 'tl', 'small');
    return f.svg();
  };
  const figSheetVsConductor = () => {
    const a = PF.fig();
    a.line(20, 100, 200, 100, { cls: 'thick' });
    for (let x = 30; x <= 190; x += 20) plus(a, x, 92, 3);
    for (const x of [50, 110, 170]) { a.arrow(x, 80, x, 50, { hs: 6 }); a.arrow(x, 112, x, 142, { hs: 6 }); }
    a.label(178, 62, md`\sigma/2\varepsilon_0`, 'l', 'small'); a.label(178, 130, md`\sigma/2\varepsilon_0`, 'l', 'small');
    const b = PF.fig();
    b.hatchBand([[20, 100], [200, 100], [200, 150], [20, 150]]);
    b.line(20, 100, 200, 100, { cls: 'thick' });
    for (let x = 30; x <= 190; x += 20) plus(b, x, 92, 3);
    for (const x of [50, 110, 170]) b.arrow(x, 80, x, 30, { hs: 6 });
    b.label(178, 52, md`\sigma/\varepsilon_0`, 'l', 'small');
    b.text(206, 125, 'E = 0 inside', 'l');
    return PF.row([{ svg: a.svg(), cap: '(a) Isolated sheet' }, { svg: b.svg(), cap: '(b) Surface of a conductor' }]).svg;
  };
  const figConductorPt = (o = {}) => {
    const f = PF.fig();
    f.hatchBand([[20, 130], [250, 130], [250, 185], [20, 185]]);
    f.line(20, 130, 250, 130, { cls: 'thick' });
    f.text(256, 158, 'conductor', 'l');
    f.arrow(50, 128, 50, 88, { hs: 7 }); f.label(56, 94, md`\uv n`, 'l', 'small');
    if (o.field) {
      for (const x of [120, 165, 210]) f.arrow(x, 126, x, 90, { hs: 6 });
      f.label(216, 100, md`\sigma/\varepsilon_0`, 'l', 'small');
      f.text(256, 178, 'E = 0 inside', 'l');
      for (const x of [98, 142, 187, 232]) plus(f, x, 122, 2.6);
    }
    if (o.p) { f.dot(180, 80, 3.2); f.tag(180, 80, 'P', 'r', 7); f.dim(180, 130, 180, 80, '', { off: -22 }); f.label(152, 105, o.d || '', 'r', 'small'); }
    return f.svg();
  };
  // E(r): surface charge at a (jump) and a volume shell a<r<b (no jump at b)
  const figEjumpKink = () => gplot({
    w: 280, h: 170, x: [0, 4], y: [0, 1.25], xt: [[1, 'a'], [2, 'b']], xl: 'r', yl: 'E',
    curves: [{ f: () => 0, from: 0, to: 1 }, { f: (r) => (0.6 + (3.4 / 7) * (r ** 3 - 1)) / (r * r), from: 1, to: 2 }, { f: (r) => 4 / (r * r), from: 2, to: 4 }],
    extra: (f, X, Y) => f.line(X(1), Y(0), X(1), Y(0.6), { cls: 'dash dim' }),
  });
  const figEtwoJumps = () => gplot({
    w: 300, h: 200, x: [0, 0.4], y: [0, 10], xt: [[0.1, '0.10'], [0.2, '0.20']], yt: [[9, '9.0'], [2.25, '2.25'], [0.75, '0.75']], xl: md`r\ (\text{m})`, yl: md`E\ (\text{kV/m})`,
    curves: [{ f: () => 0, from: 0, to: 0.1 }, { f: (r) => 9 * (0.1 / r) ** 2, from: 0.1, to: 0.2 }, { f: (r) => 0.75 * (0.2 / r) ** 2, from: 0.2, to: 0.4 }],
    extra: (f, X, Y) => { f.line(X(0.1), Y(0), X(0.1), Y(9), { cls: 'dash dim' }); f.line(X(0.2), Y(0.75), X(0.2), Y(2.25), { cls: 'dash dim' }); },
  });

  // ================================================================== Lesson 6
  const L6 = {
    id: 'u2-bc', title: 'Boundary conditions I: the jump in E',
    steps: [
      RF(md`
        ### Where the field jumps: the charged shell (Lecture 5)

        Lecture 5 introduces boundary conditions with the uniformly charged spherical shell. Gauss's law on a sphere inside ($Q_{\text{enc}}=0$) and on one outside gives

        $$E=0\quad(r<R),\qquad E=\frac{\sigma R^2}{\ep r^2}\quad(r>R).$$

        Just outside, $E=\sigma/\ep$. So crossing the shell, the field jumps from $0$ to $\sigma/\ep$:

        [[fig:jump]]

        "This discontinuity always occurs near a sheet charge." This lesson shows why, for any surface (curved or flat, uniform or not), and pins down exactly which part of $\vb E$ jumps. Lesson 7 does the same for $V$.

        !!key The boundary conditions in one place (each is derived below)
          At a surface carrying charge density $\sigma$, with $\uv n$ the unit normal pointing from "below" to "above":
          1. $E^\perp_{\text{above}}-E^\perp_{\text{below}}=\dfrac{\sigma}{\ep}$ (pillbox and Gauss's law)
          2. $E^\parallel_{\text{above}}=E^\parallel_{\text{below}}$ (thin loop and $\oint\vb E\cdot d\vb l=0$)
          3. Together: $\vb E_{\text{above}}-\vb E_{\text{below}}=\dfrac{\sigma}{\ep}\,\uv n$
          4. $V_{\text{above}}=V_{\text{below}}$ and $\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-\dfrac{\sigma}{\ep}$ (Lesson 7)

          These are **not** on the formula sheet. Know them, and know where each comes from.
      `, { jump: { svg: figShellEjump(), cap: 'Lecture 5: the shell\'s field jumps by $\\sigma/\\varepsilon_0$ at $r=R$.' } }),
      Q(md`From the graph, by how much does $E$ jump at the shell?`,
        [md`$\dfrac{\sigma}{2\ep}$`, md`$\dfrac{\sigma}{\ep}$`, md`$\dfrac{\sigma R}{\ep}$`, md`$\dfrac{4\pi R^2\sigma}{\ep}$`], 1,
        [md`$\tfrac{\sigma}{2\ep}$ is the field on **one** side of an isolated flat sheet. The jump from one side to the other is twice that.`,
          null,
          md`Units: $\sigma R/\ep$ is a potential (V), not a field. It is in fact the shell's potential $V(R)$.`,
          md`That is $q/\ep$, the total flux through a sphere around the shell, not a field.`],
        md`Just outside, $E=\dfrac{\sigma R^2}{\ep R^2}=\dfrac{\sigma}{\ep}$; just inside, $E=0$. The jump is $\sigma/\ep$. Watch the classic slip: $\tfrac{\sigma}{2\ep}$ is the isolated-sheet field on each side, and the jump across that sheet is again $\tfrac{\sigma}{2\ep}-\left(-\tfrac{\sigma}{2\ep}\right)=\tfrac{\sigma}{\ep}$.`,
        { figHtml: figShellEjump() }),
      P({
        title: 'Read σ off an E(r) graph',
        q: md`The graph shows the measured $E(r)$ (radial, outward positive) around a thin spherical shell of radius $0.20$ m: zero inside, $4.5$ kV/m just outside. Find the surface charge density $\sigma$ and the shell's total charge $q$. Use $\ep=8.85\times10^{-12}$ C²/(N·m²).`,
        figHtml: figShellEnum(),
        hints: [md`The boundary condition: $E^\perp_{\text{out}}-E^\perp_{\text{in}}=\sigma/\ep$, with "above" = outside.`, md`$q=4\pi R^2\sigma$. Check it with $E=\kq\dfrac{q}{R^2}$ just outside.`],
        parts: [
          { lbl: '\\sigma', ans: 39.83, unit: 'nC/m²' },
          { lbl: 'q', ans: 20.02, unit: 'nC' },
        ],
        sol: md`
          **Boundary condition used:** $E^\perp_{\text{above}}-E^\perp_{\text{below}}=\sigma/\ep$, with "above" = outside, $\uv n=\uv r$.

          $\sigma=\ep\,(4500-0)\ \text{V/m}=(8.85\times10^{-12})(4500)=3.98\times10^{-8}$ C/m² $=39.8$ nC/m².

          $q=4\pi R^2\sigma=4\pi(0.20)^2(3.98\times10^{-8})=2.0\times10^{-8}$ C $=20.0$ nC.

          Check: $\kq\dfrac{q}{R^2}=\dfrac{(8.99\times10^9)(2.0\times10^{-8})}{0.040}=4.5\times10^3$ V/m. The jump in $E$ measures the local $\sigma$ directly, with no Gaussian surface needed.
        `,
      }),
      RF(md`
        ### $E^\perp$: the pillbox

        Take a tiny patch of any charged surface; close up it looks flat. Straddle it with a Gaussian pillbox: lids of area $A$ just above and just below, height $\epsilon$. (Lecture 5 draws it on a tilted sheet; here it is side-on.)

        [[fig:pb]]

        Let $E^\perp$ be the component along $\uv n$ (upward is positive on **both** sides). The top lid's outward normal is $+\uv n$ and the bottom lid's is $-\uv n$, so Gauss's law gives

        $$\oint\vb E\cdot d\vb a=E^\perp_{\text{above}}A-E^\perp_{\text{below}}A+(\text{side walls})=\frac{Q_{\text{enc}}}{\ep}=\frac{\sigma A}{\ep}.$$

        Now let $\epsilon\to0$. The side walls have area proportional to $\epsilon$, so their flux vanishes; that is the only place $E^\parallel$ could have entered. Any volume charge inside contributes $\rho A\epsilon\to0$. What is left:

        $$\boxed{E^\perp_{\text{above}}-E^\perp_{\text{below}}=\frac{\sigma}{\ep}}$$

        In the lecture's words: $\vb E$ points the same way on both lids but $d\vb a$ points in opposite directions, which is where the minus sign comes from. "Evidently the result for the spherical shell is general." Where $\sigma=0$, $E^\perp$ is continuous, even where the volume charge density jumps (the surface of a uniformly charged solid sphere, for example).
      `, { pb: { svg: figPillbox(), cap: 'Side view of the Gaussian pillbox. Its height $\\epsilon$ is exaggerated; it shrinks to zero.' } }),
      Q(md`Why does $E^\parallel$ drop out of the pillbox calculation?`,
        [md`$E^\parallel=0$ at any charged surface.`,
          md`$E^\parallel$ only passes through the side walls, whose area goes to zero as the height $\epsilon\to0$.`,
          md`$E^\parallel$ on the top lid cancels $E^\parallel$ on the bottom lid.`,
          md`Gauss's law only applies to perpendicular fields.`], 1,
        [md`$E^\parallel$ can be anything; it just has to be the same on both sides (the loop argument).`,
          null,
          md`$E^\parallel$ lies in the plane of each lid, so it contributes no flux through the lids at all; there is nothing to cancel.`,
          md`Gauss's law counts the flux of the whole field. $E^\parallel$ simply has no flux through the lids.`],
        md`Flux through a lid is $\vb E\cdot\uv n\,A=E^\perp A$; $E^\parallel$ is along the lid. The parallel component only crosses the side walls, of area (perimeter)$\times\epsilon\to0$. So the pillbox says nothing about $E^\parallel$, and you need a different tool for it: the loop.`,
        { figHtml: figPillbox() }),
      Q(md`In $E^\perp_{\text{above}}A-E^\perp_{\text{below}}A=\dfrac{\sigma A}{\ep}$, where does the minus sign come from?`,
        [md`The field below always points down.`,
          md`The charge below the surface is negative.`,
          md`On the bottom lid the outward normal is $-\uv n$, so its flux is $-E^\perp_{\text{below}}A$, with $E^\perp_{\text{below}}$ measured along $+\uv n$.`,
          md`It is a convention that subtracts the field of the other charges.`], 2,
        [md`$E^\perp_{\text{below}}$ is measured along $+\uv n$ and can have either sign. The minus sign is there whatever its direction.`,
          md`The sign of the charge enters through $\sigma$ on the right side, not through this minus sign.`,
          null,
          md`Nothing is being subtracted on purpose; it is just the direction of the bottom lid's area vector.`],
        md`Outward area vectors: $+A\uv n$ on top, $-A\uv n$ on the bottom. With both $E^\perp$'s measured along $+\uv n$, the fluxes are $+E^\perp_{\text{above}}A$ and $-E^\perp_{\text{below}}A$. Lecture: "$\vb E$ points in the same direction but $d\vb A$ points in opposite directions on the surface."`,
        { figHtml: figPillbox() }),
      Q(md`As the pillbox height $\epsilon\to0$, what charge does it enclose?`,
        [md`$\sigma A$ plus $\rho A\epsilon$ from any volume charge, which stays finite`,
          md`nothing, since the box has no volume left`,
          md`only $\sigma A$: a volume charge contributes $\rho A\epsilon\to0$`,
          md`all the charge within a distance $\sqrt A$ of the patch`], 2,
        [md`$\rho A\epsilon$ goes to zero with $\epsilon$. A finite volume density has no charge in zero thickness.`,
          md`The surface charge sits exactly on the surface, inside the box for every $\epsilon>0$: $\sigma A$ stays.`,
          null,
          md`Only charge inside the closed surface counts in Gauss's law.`],
        md`That is why only **surface** charge makes $E^\perp$ jump. A jump in volume density $\rho$ (like the edge of a solid sphere) leaves $\vb E$ continuous; it only changes how fast $E$ varies.`,
        { figHtml: figPillbox() }),
      RF(md`
        ### $E^\parallel$: the thin loop

        Now take a thin rectangular loop standing across the surface: two long sides of length $l$ parallel to it, one just above and one just below, and two short ends of height $\epsilon$.

        [[fig:loop]]

        For an electrostatic field $\oint\vb E\cdot d\vb l=0$. As $\epsilon\to0$ the ends contribute nothing (finite field times vanishing length), and the long sides give

        $$\oint\vb E\cdot d\vb l=E^\parallel_{\text{above}}\,l-E^\parallel_{\text{below}}\,l=0\quad\Longrightarrow\quad\boxed{E^\parallel_{\text{above}}=E^\parallel_{\text{below}}}$$

        (minus because the loop runs the opposite way along the lower side). Turn the loop to face any tangent direction and the same holds: **every** tangential component is continuous. Surface charge only pushes perpendicular to itself, on net.
      `, { loop: { svg: figLoopBC(), cap: 'Side view of the thin loop (Lecture 5, blue in the notes). Its height $\\epsilon$ shrinks to zero.' } }),
      Q(md`Which law gives the continuity of $E^\parallel$ across a surface charge?`,
        [md`$\oint\vb E\cdot d\vb l=0$, i.e. $\curl\vb E=0$`, md`Gauss's law`, md`the superposition principle`, md`Poisson's equation`], 0,
        [null,
          md`Gauss's law (the pillbox) gives the $E^\perp$ condition, not this one.`,
          md`Superposition explains the result (the patch's own field is perpendicular), but the derivation uses the loop.`,
          md`Poisson's equation is Gauss's law in terms of $V$; it gives the $\partial V/\partial n$ jump, not this.`],
        md`Two Maxwell equations, two conditions: $\divg\vb E=\rho/\ep$ (Gauss, via the pillbox) controls $E^\perp$; $\curl\vb E=0$ (via the loop and Stokes) controls $E^\parallel$.`,
        { figHtml: figLoopBC() }),
      Q(md`Why do the two short ends of the loop drop out?`,
        [md`$\vb E$ is perpendicular to them.`, md`They cancel each other.`, md`$E^\parallel=0$ there.`, md`Their length $\epsilon\to0$ while $\vb E$ stays finite.`], 3,
        [md`$E^\perp$ runs along the short ends and is generally nonzero there; it is not perpendicular to them.`,
          md`They need not cancel: $E^\perp$ is different just above and just below. They vanish individually.`,
          md`The ends are along $\uv n$; $E^\parallel$ is irrelevant to them.`,
          null],
        md`Each end contributes about $E^\perp\epsilon$, which goes to zero as $\epsilon\to0$ no matter what $E^\perp$ is. That is the trick in both derivations: shrink the dimension across the surface so that only the faces parallel to it survive.`,
        { figHtml: figLoopBC() }),
      RF(md`
        ### One vector equation, and which way $\uv n$ points

        Combine the two (Lecture 6). With $\uv n$ the unit normal pointing from "below" to "above",

        $$\boxed{\vb E_{\text{above}}-\vb E_{\text{below}}=\frac{\sigma}{\ep}\,\uv n}$$

        "$\vb E_{\text{above}}$ denotes the field on the side toward which $\uv n$ points." The labels are yours to choose: call the other side "above" and $\uv n$ flips, the left side flips sign too, and the equation says the same thing. For a closed surface (sphere, cylinder) the usual choice is "above" = outside, $\uv n=\uv r$ or $\uv s$.

        [[fig:nhat]]

        !!intuition Where the jump comes from
          Split the field near a point of the surface into the part made by a tiny patch of surface right there and the part made by everything else. Close enough, the patch looks like an infinite plane: it gives $+\tfrac{\sigma}{2\ep}\uv n$ just above and $-\tfrac{\sigma}{2\ep}\uv n$ just below. Everything else is smooth through the patch. So $\vb E_{\text{above}}=\vb E_{\text{other}}+\tfrac{\sigma}{2\ep}\uv n$ and $\vb E_{\text{below}}=\vb E_{\text{other}}-\tfrac{\sigma}{2\ep}\uv n$: the whole jump comes from the local patch (Griffiths' footnote to Eq. 2.33).

        !!method Using the boundary conditions on given fields
          1. Pick "above" and draw $\uv n$ pointing into it.
          2. Split each field into its component along $\uv n$ and its components along the surface.
          3. Tangential parts must agree. If they do not, the data are impossible.
          4. $\sigma=\ep\left(\vb E_{\text{above}}-\vb E_{\text{below}}\right)\cdot\uv n$.
      `, { nhat: { svg: figNormal(), cap: 'A charged surface, with $\\hat{\\mathbf n}$ pointing from "below" into "above".' } }),
      Q(md`At a point of a charged surface, $\vb E_{\text{below}}=0$ and $\vb E_{\text{above}}=-(5.0\text{ kV/m})\,\uv n$: the field above points toward the surface. What is $\sigma$?`,
        [md`$+44.3$ nC/m²`, md`$-88.5$ nC/m²`, md`$0$, since the field below is zero`, md`$-44.3$ nC/m²`], 3,
        [md`Sign: $(\vb E_{\text{above}}-\vb E_{\text{below}})\cdot\uv n=-5.0$ kV/m. Field lines arriving at a surface end on negative charge.`,
          md`That treats the jump as $\tfrac{\sigma}{2\ep}$ (the one-sided field of an isolated sheet), giving $\sigma=2\ep\,\Delta E$. The whole jump, $-5.0$ kV/m, equals $\sigma/\ep$.`,
          md`A zero field on one side is exactly the conductor case; the surface still carries charge.`,
          null],
        md`$\sigma=\ep\left(\vb E_{\text{above}}-\vb E_{\text{below}}\right)\cdot\uv n=(8.85\times10^{-12})(-5000)=-4.43\times10^{-8}$ C/m². Field pointing into a surface means negative charge there.`,
        { figHtml: figNormal() }),
      Q(md`You relabel the two sides, calling the old "below" side "above", so $\uv n$ flips. In $\vb E_{\text{above}}-\vb E_{\text{below}}=\dfrac{\sigma}{\ep}\uv n$,`,
        [md`both sides change sign, and $\sigma$ is unchanged`, md`$\sigma$ changes sign`, md`only the right side changes sign, so the equation now fails`, md`nothing changes on either side`], 0,
        [null,
          md`$\sigma$ is a physical property of the surface. It cannot depend on what you call the sides.`,
          md`The left side flips too: the old $\vb E_{\text{below}}$ is now $\vb E_{\text{above}}$.`,
          md`Swapping labels swaps the two fields in the difference, which flips its sign, and $\uv n$ flips as well.`],
        md`New labels: $\vb E'_{\text{above}}-\vb E'_{\text{below}}=\vb E_{\text{below}}-\vb E_{\text{above}}=-\tfrac{\sigma}{\ep}\uv n=\tfrac{\sigma}{\ep}\uv n'$. Same physics. Griffiths: "it doesn't matter which side you call above". Just stay consistent within one problem.`,
        { figHtml: figNormal() }),
      Q(md`At a point of a charged surface (the $xy$ plane, $\uv n=\uv z$), which pair could be the fields just above and just below? (kV/m)`,
        [md`above $(2,\,0,\,5)$, below $(3,\,0,\,5)$`, md`above $(2,\,1,\,5)$, below $(2,\,-1,\,1)$`, md`above $(2,\,0,\,5)$, below $(2,\,0,\,1)$`, md`above $(0,\,0,\,5)$, below $(2,\,0,\,1)$`], 2,
        [md`$E_x$ differs (2 versus 3). Tangential components must be continuous.`,
          md`$E_y$ flips sign across the surface. Tangential components must be continuous.`,
          null,
          md`$E_x$ is 0 above and 2 below: a tangential jump, impossible.`],
        md`Only $E_z$ (the normal component) may jump. In the third pair $E_x$ and $E_y$ match and $E_z$ jumps by $5-1=4$ kV/m, so $\sigma=\ep\cdot4000\text{ V/m}=35.4$ nC/m². The other three pairs each have a tangential component that changes across the surface.`,
        { figHtml: figFlatSurface() }),
      Q(md`Just above a surface $\vb E=(2.0\text{ kV/m})\,\uv n$ and just below $\vb E=(5.0\text{ kV/m})\,\uv n$: the field points the same way on both sides but is weaker above. What is $\sigma$?`,
        [md`$+26.6$ nC/m²`, md`$-26.6$ nC/m²`, md`$+62.0$ nC/m²`, md`$0$, since the field points the same way on both sides`], 1,
        [md`Sign: above minus below is $2.0-5.0=-3.0$ kV/m.`,
          null,
          md`That adds the two fields. The boundary condition uses their difference.`,
          md`Direction is not the test; the normal component changed from 5.0 to 2.0 kV/m, so there is charge.`],
        md`$\sigma=\ep(2.0-5.0)\text{ kV/m}=-3.0\times10^3\,\ep=-2.66\times10^{-8}$ C/m². Some field lines arriving from below end on the surface: negative charge.`,
        { figHtml: figFlatSurface() }),
      Q(md`Near a point of a charged surface, write $\vb E_{\text{above}}=\vb E_{\text{other}}+\tfrac{\sigma}{2\ep}\uv n$ and $\vb E_{\text{below}}=\vb E_{\text{other}}-\tfrac{\sigma}{2\ep}\uv n$. What is $\vb E_{\text{other}}$?`,
        [md`the field of the whole surface charge`,
          md`the field of all charges except the tiny patch at that point; it is continuous through the patch`,
          md`the average of $\vb E_{\text{above}}$ and $\vb E_{\text{below}}$, which is always zero`,
          md`the external field applied to the surface, before it was charged`], 1,
        [md`The local patch is the part that has been split off; $\vb E_{\text{other}}$ excludes it.`,
          null,
          md`It is the average, but it need not vanish: at a conductor's surface the average is $\tfrac{\sigma}{2\ep}\uv n$.`,
          md`$\vb E_{\text{other}}$ includes the rest of the surface charge too, not just outside sources.`],
        md`The patch acts like an infinite plane at close range ($\pm\tfrac{\sigma}{2\ep}\uv n$); every other charge is a finite distance away, so its field is smooth through the patch. The difference therefore comes entirely from the patch. This is also the field a patch of charge feels (the average), which matters when you compute forces on surface charge.`,
        { figHtml: figNormal() }),
      RF(md`
        ### Worked example: σ from the fields on both sides

        At a point $P$ on a charged surface (the $xy$ plane), the fields just below and just above are

        $$\vb E_{\text{below}}=(2.0\,\uv x+3.0\,\uv z)\ \text{kV/m},\qquad \vb E_{\text{above}}=(2.0\,\uv x+8.0\,\uv z)\ \text{kV/m}.$$

        [[fig:flat]]

        **Boundary conditions to use** ("above" is $z>0$, $\uv n=\uv z$):

        1. $E^\parallel$ continuous: $E_x$ and $E_y$ must match.
        2. $E^\perp_{\text{above}}-E^\perp_{\text{below}}=\sigma/\ep$.

        **Check 1:** $E_x=2.0$ on both sides, $E_y=0$ on both. Consistent.

        **Use 2:** $\sigma=\ep(8.0-3.0)\text{ kV/m}=(8.85\times10^{-12})(5000)=4.43\times10^{-8}$ C/m² $=44.3$ nC/m².

        Positive: more field leaves the surface upward than arrives from below.
      `, { flat: { svg: figFlatSurface(), cap: md`The surface $z=0$ seen edge-on, with $\uv n=\uv z$.` } }),
      P({
        title: 'Find σ from the fields on both sides',
        q: md`Two points on a charged sheet lying in the $xy$ plane. Take "above" to be $z>0$.

          (1) At $P_1$: $\vb E_{\text{below}}=(1.5\,\uv x-2.0\,\uv y-4.0\,\uv z)$ kV/m and $\vb E_{\text{above}}=(1.5\,\uv x-2.0\,\uv y+2.0\,\uv z)$ kV/m.

          (2) At $P_2$: $\vb E_{\text{above}}=-1.0\,\uv z$ kV/m and $\vb E_{\text{below}}=+3.0\,\uv z$ kV/m.

          Find $\sigma$ at each point (in nC/m²; $\ep=8.85\times10^{-12}$ C²/(N·m²)).`,
        figHtml: figFlatSurface(),
        hints: [md`List the conditions first: tangential components continuous; $E_z$ jumps by $\sigma/\ep$.`, md`$\sigma=\ep\,(E_{z,\text{above}}-E_{z,\text{below}})$. Keep the signs of the $z$ components.`],
        parts: [
          { lbl: md`At $P_1$, are the tangential components consistent?`, mc: [md`yes`, md`no, $E_x$ differs`, md`no, $E_z$ differs`], a: 0, why: [null, md`$E_x=1.5$ kV/m on both sides (and $E_y=-2.0$ on both).`, md`$E_z$ is the normal component; it is allowed to jump.`] },
          { lbl: '\\sigma(P_1)', ans: 53.10, unit: 'nC/m²' },
          { lbl: '\\sigma(P_2)', ans: -35.40, unit: 'nC/m²' },
        ],
        sol: md`
          **Conditions:** $E^\parallel$ (here $E_x,E_y$) continuous; $E_{z,\text{above}}-E_{z,\text{below}}=\sigma/\ep$.

          **$P_1$:** $E_x$ and $E_y$ match. $\sigma=\ep(2.0-(-4.0))\text{ kV/m}=6.0\times10^3\,\ep=53.1$ nC/m². Below the sheet the field points down (away from the sheet) and above it points up: field leaving on both sides, positive charge.

          **$P_2$:** $\sigma=\ep(-1.0-3.0)\text{ kV/m}=-4.0\times10^3\,\ep=-35.4$ nC/m². Both fields point toward the sheet: field lines end there, negative charge.
        `,
      }),
      RF(md`
        ### An isolated sheet versus the surface of a conductor

        The jump is always $\sigma/\ep$. How it splits between the two sides depends on the other charges.

        [[fig:svc]]

        - **Isolated flat sheet:** by symmetry the field is $\tfrac{\sigma}{2\ep}$ pointing away on both sides. Jump: $\tfrac{\sigma}{2\ep}-\left(-\tfrac{\sigma}{2\ep}\right)=\tfrac{\sigma}{\ep}$.
        - **Surface of a conductor:** in electrostatics $\vb E=0$ inside a conductor (Unit 3 shows why). With "below" = inside, $\vb E_{\text{below}}=0$, so just outside
          $$\vb E_{\text{outside}}=\frac{\sigma}{\ep}\,\uv n,\qquad \sigma=\ep\,\vb E_{\text{outside}}\cdot\uv n,$$
          with $\uv n$ pointing out of the conductor. That is twice the isolated sheet's field: the rest of the conductor's charge cancels the patch's field inside and doubles it outside.
        - **Parallel plates** (Griffiths Ex. 2.6): $\pm\sigma$ give $\sigma/\ep$ between the plates and $0$ outside. At each plate the jump is again $\pm\sigma/\ep$, with $\vb E=0$ on the outer side, just like a conductor surface.

        Since $E^\parallel$ is continuous and zero inside the conductor, $E^\parallel=0$ just outside too: the field leaves a conductor perpendicular to its surface.
      `, { svc: { svg: figSheetVsConductor(), cap: md`Same $\sigma$, same jump $\sigma/\ep$, different split between the two sides.` } }),
      Q(md`An isolated flat sheet and the flat face of a conductor carry the same $\sigma>0$. Which statement is correct?`,
        [md`The conductor's field outside is half the sheet's.`,
          md`The jump in $E^\perp$ is $\sigma/\ep$ for the conductor but $\tfrac{\sigma}{2\ep}$ for the sheet.`,
          md`The jump is $\sigma/\ep$ for both; the sheet has $\tfrac{\sigma}{2\ep}$ on each side, the conductor $\tfrac{\sigma}{\ep}$ outside and $0$ inside.`,
          md`Both have $\tfrac{\sigma}{2\ep}$ on each side, since only the local $\sigma$ matters.`], 2,
        [md`Backwards: the conductor's outside field is $\sigma/\ep$, twice the sheet's $\tfrac{\sigma}{2\ep}$.`,
          md`The jump is fixed by the local $\sigma$ alone: $\sigma/\ep$ for both. Only the split differs.`,
          null,
          md`The jump depends only on the local $\sigma$, but the individual fields depend on all the other charges. Inside a conductor the field is zero.`],
        md`The boundary condition fixes the difference, $\sigma/\ep$, not the individual values. The isolated sheet splits it symmetrically; the conductor puts all of it outside, because the conductor's other charges arrange themselves to cancel the field inside.`,
        { figHtml: figSheetVsConductor() }),
      Q(md`Just outside a conductor, $E=3.0$ kV/m pointing away from the surface. What is $\sigma$ there?`,
        [md`$+26.6$ nC/m²`, md`$+53.1$ nC/m²`, md`$-26.6$ nC/m²`, md`$0$, since $\vb E=0$ inside`], 0,
        [null,
          md`That uses the isolated-sheet formula $E=\tfrac{\sigma}{2\ep}$, so $\sigma=2\ep E$. At a conductor the field inside is zero and the whole jump is outside: $E_{\text{out}}=\sigma/\ep$.`,
          md`Field pointing away from the surface means positive charge.`,
          md`$\vb E=0$ inside is exactly why the jump, $3.0$ kV/m, is all on the outside. The surface is charged.`],
        md`$\sigma=\ep E_{\text{outside}}\cdot\uv n=(8.85\times10^{-12})(3000)=2.66\times10^{-8}$ C/m². The boundary condition with $\vb E_{\text{inside}}=0$.`,
        { figHtml: figConductorPt() }),
      Q(md`Just outside the surface of a conductor in electrostatic equilibrium, can $\vb E$ have a component parallel to the surface?`,
        [md`Yes, if the surface charge is not uniform.`,
          md`Yes, near sharp edges.`,
          md`No: $E^\parallel$ is continuous, and it is zero inside the conductor, so it is zero just outside.`,
          md`Only if the conductor is not grounded.`], 2,
        [md`A non-uniform $\sigma$ changes $E^\perp$ from point to point, but $E^\parallel$ is still continuous and still zero inside.`,
          md`Near edges the field is strong, but it is still perpendicular to the surface right at the surface.`,
          null,
          md`Grounding changes the conductor's potential and charge, not this boundary condition.`],
        md`$E^\parallel_{\text{outside}}=E^\parallel_{\text{inside}}=0$. The field meets a conductor at right angles. Equivalently, the surface is an equipotential, and $\vb E$ is always perpendicular to equipotentials (Lesson 2).`,
        { figHtml: figConductorPt() }),
      P({
        title: 'Two shells from an E(r) graph',
        q: md`The graph shows $E(r)$ (radial, outward positive) for two concentric thin shells of radii $0.10$ m and $0.20$ m. Just outside the inner shell $E=9.0$ kV/m; just inside the outer shell $E=2.25$ kV/m; just outside it $E=0.75$ kV/m. Find the surface charge densities $\sigma_1$ (inner) and $\sigma_2$ (outer). Use $\ep=8.85\times10^{-12}$ C²/(N·m²).`,
        figHtml: figEtwoJumps(),
        hints: [md`At each shell: $E_{\text{just out}}-E_{\text{just in}}=\sigma/\ep$ ("above" = outside).`, md`Inside the inner shell $E=0$.`],
        parts: [
          { lbl: '\\sigma_1', ans: 79.65, unit: 'nC/m²' },
          { lbl: '\\sigma_2', ans: -13.28, unit: 'nC/m²' },
          { lbl: md`The total charge of the two shells together is`, mc: [md`positive`, md`negative`, md`zero`], a: 0, why: [null, md`Outside both shells $E>0$ (outward), so by Gauss the total enclosed charge is positive.`, md`$E\neq0$ outside both shells, so the total is not zero.`] },
        ],
        sol: md`
          **Condition at each shell:** $E^\perp_{\text{out}}-E^\perp_{\text{in}}=\sigma/\ep$, with "above" = outside.

          - Inner shell: $\sigma_1=\ep(9.0-0)\text{ kV/m}=(8.85\times10^{-12})(9000)=79.7$ nC/m².
          - Outer shell: $\sigma_2=\ep(0.75-2.25)\text{ kV/m}=-1.5\times10^3\,\ep=-13.3$ nC/m².

          Check with charges: $q_1=4\pi(0.10)^2\sigma_1=10.0$ nC and $q_2=4\pi(0.20)^2\sigma_2=-6.7$ nC. Outside, $\kq\dfrac{q_1+q_2}{(0.20)^2}=\dfrac{(8.99\times10^9)(3.3\times10^{-9})}{0.040}=0.75$ kV/m. Consistent.
        `,
      }),
      Q(md`This $E(r)$ graph (outward positive) belongs to a spherically symmetric charge distribution. Where is there **surface** charge?`,
        [md`at $r=a$ only`, md`at $r=b$ only`, md`at both $a$ and $b$`, md`nowhere: the field is finite everywhere`], 0,
        [null,
          md`At $b$ the graph has a corner but no jump. A corner in $E$ means the volume charge stops there, not a surface charge.`,
          md`Only $a$ has a jump in $E$. At $b$, $E$ is continuous.`,
          md`A finite field can still jump. A jump is the signature of surface charge, and there is one at $a$.`],
        md`Surface charge ⇔ jump in $E^\perp$. At $a$ the field jumps from 0 to a finite value: a charged shell. Between $a$ and $b$, $E$ grows instead of falling as $1/r^2$, so charge is being added there: volume charge. At $b$ it stops, and the graph turns over with a corner but no jump.`,
        { figHtml: figEjumpKink() }),
      RF(md`
        !!key Patterns to remember
          - $\vb E_{\text{above}}-\vb E_{\text{below}}=\dfrac{\sigma}{\ep}\uv n$, $\uv n$ from below to above. Only the normal component jumps; every tangential component is continuous.
          - Pillbox (Gauss) gives the $E^\perp$ condition; thin loop ($\oint\vb E\cdot d\vb l=0$) gives the $E^\parallel$ condition. Shrink the thickness to zero in both.
          - The jump is $\sigma/\ep$, never $\tfrac{\sigma}{2\ep}$. The split depends on other charges: isolated sheet $\pm\tfrac{\sigma}{2\ep}$; conductor $\tfrac{\sigma}{\ep}$ outside, 0 inside.
          - Reading graphs: a jump in $E$ means surface charge; a corner in $E$ means volume charge starting or stopping.
          - Field into a surface means negative $\sigma$; field out of it, positive.
          - Data with a tangential mismatch across a surface are impossible.
      `),
    ],
  };

  // ================================================================== Lesson 7 figures
  const figVcont = () => {
    const f = PF.fig();
    const y0 = 110;
    f.line(20, y0, 300, y0, { cls: 'thick' });
    f.label(24, y0 + 8, md`\sigma`, 'tl', 'small');
    f.dot(160, 130, 3.2); f.tag(160, 130, 'a', 'r', 8);
    f.dot(160, 90, 3.2); f.tag(160, 90, 'b', 'r', 8);
    f.arrow(160, 126, 160, 95, { hs: 6 });
    f.text(30, 74, 'above', 'l'); f.text(30, 150, 'below', 'l');
    f.text(200, 60, 'path length → 0', 'l');
    return f.svg();
  };
  const figTent = () => gplot({
    w: 300, h: 170, x: [-2, 2], y: [0, 1.2], xt: [[0, '0']], xl: 'x', yl: 'V', vlines: [[0, md`\sigma>0`]],
    curves: [{ f: (x) => 1 - 0.4 * Math.abs(x) }],
  });
  const figKinkV = () => gplot({
    w: 300, h: 170, x: [-2, 2], y: [0, 12], xt: [[-1, '-1'], [1, '1']], yt: [[10, '10']], xl: md`x\ (\text{m})`, yl: md`V\ (\text{V})`, vlines: [[0, 'sheet']],
    curves: [{ f: (x) => (x < 0 ? 10 + 4 * x : 10 - 2 * x) }],
  });
  const figVshellNum = () => gplot({
    w: 300, h: 180, x: [0, 0.6], y: [0, 1050], xt: [[0.15, '0.15']], yt: [[900, '900']], xl: md`r\ (\text{m})`, yl: md`V\ (\text{V})`,
    curves: [{ f: () => 900, from: 0, to: 0.15 }, { f: (r) => 135 / r, from: 0.15, to: 0.6 }],
  });
  const figV2kinks = () => gplot({
    w: 300, h: 180, x: [0, 0.6], y: [0, 600], xt: [[0.1, '0.10'], [0.3, '0.30']], yt: [[500, '500'], [100, '100']], xl: md`r\ (\text{m})`, yl: md`V\ (\text{V})`,
    curves: [{ f: () => 500, from: 0, to: 0.1 }, { f: (r) => 60 / r - 100, from: 0.1, to: 0.3 }, { f: (r) => 30 / r, from: 0.3, to: 0.6 }],
  });
  const figVplates = () => gplot({
    w: 320, h: 170, x: [-1, 8.5], y: [0, 12], xt: [[0, '0'], [2, '2'], [4, '4'], [6, '6']], yt: [[10, '10']], xl: md`x\ (\text{cm})`, yl: md`V\ (\text{V})`,
    curves: [{ f: (x) => (x < 0 ? 0 : x < 2 ? 5 * x : x < 4 ? 10 : x < 6 ? 10 - 5 * (x - 4) : 0), n: 400 }],
  });
  const figConductorSphere = () => {
    const f = PF.fig();
    const cx = 100, cy = 100, R = 60;
    f.hatchBand(f.arcPts(cx, cy, R, R, 0, 360));
    f.circle(cx, cy, R, { cls: 'thick' });
    f.line(cx, cy, cx + R, cy, { cls: 'dim' });
    f.label(cx + R + 6, cy, md`R=0.10\text{ m}`, 'l', 'small');
    f.label(30, 30, md`V_0=1.0\text{ kV}`, 'c', 'small');
    return f.svg();
  };
  const fig231 = () => {
    const a = PF.fig();
    a.line(20, 90, 160, 90, { cls: 'thick' });
    for (let x = 30; x <= 150; x += 20) plus(a, x, 82, 3);
    a.label(166, 90, md`\sigma`, 'l', 'small');
    const b = PF.fig();
    b.line(50, 30, 50, 150, { cls: 'thick' }); b.line(130, 30, 130, 150, { cls: 'thick' });
    for (let y = 40; y <= 140; y += 20) { plus(b, 42, y, 3); minus(b, 138, y, 3); }
    b.label(50, 22, md`+\sigma`, 'b', 'small'); b.label(130, 22, md`-\sigma`, 'b', 'small');
    b.label(16, 90, '(\\text{i})', 'c', 'small'); b.label(90, 90, '(\\text{ii})', 'c', 'small'); b.label(170, 90, '(\\text{iii})', 'c', 'small');
    const c = PF.fig();
    c.circle(80, 90, 50, { cls: 'thick' });
    c.line(80, 90, 80 + 50 * Math.cos(45 * DEG), 90 - 50 * Math.sin(45 * DEG), { cls: 'dim' });
    c.label(91, 66, 'R', 'c', 'small');
    c.label(30, 30, md`\sigma`, 'c', 'small');
    const d = PF.fig();
    d.ellipse(40, 90, 14, 40);
    d.line(40, 50, 200, 50); d.line(40, 130, 200, 130);
    d.ellipse(200, 90, 14, 40, { half: 'front' }); d.pl(d.arcPts(200, 90, 14, 40, 90, 270), { cls: 'dash dim' });
    d.line(40, 90, 40, 50, { cls: 'dim' }); d.label(24, 70, 'R', 'r', 'small');
    d.label(120, 42, md`\sigma`, 'b', 'small');
    return PF.row([{ svg: a.svg(), cap: '(a) Ex. 2.5: plane' }, { svg: b.svg(), cap: '(a) Ex. 2.6: two planes' }, { svg: c.svg(), cap: '(a), (c) shell' }, { svg: d.svg(), cap: '(b) long tube' }]).svg;
  };
  const fig231sol = () => {
    const a = PF.fig();
    a.line(20, 90, 160, 90, { cls: 'thick' });
    for (const x of [40, 90, 140]) { a.arrow(x, 82, x, 52, { hs: 6 }); a.arrow(x, 98, x, 128, { hs: 6 }); }
    a.label(146, 62, md`\tfrac{\sigma}{2\varepsilon_0}`, 'l', 'small'); a.label(146, 118, md`\tfrac{\sigma}{2\varepsilon_0}`, 'l', 'small');
    const b = PF.fig();
    b.line(50, 30, 50, 150, { cls: 'thick' }); b.line(130, 30, 130, 150, { cls: 'thick' });
    for (const y of [50, 90, 130]) b.arrow(58, y, 122, y, { hs: 6 });
    b.label(90, 72, md`\sigma/\varepsilon_0`, 'c', 'small');
    b.label(22, 90, '0', 'c', 'small'); b.label(158, 90, '0', 'c', 'small');
    const c = PF.fig();
    c.circle(80, 90, 40, { cls: 'thick' });
    for (let k = 0; k < 8; k++) { const t = (k * 45 + 22.5) * DEG; c.arrow(80 + 48 * Math.cos(t), 90 - 48 * Math.sin(t), 80 + 72 * Math.cos(t), 90 - 72 * Math.sin(t), { hs: 6 }); }
    c.label(80, 90, md`E=0`, 'c', 'small');
    return PF.row([{ svg: a.svg(), cap: 'plane: ±σ/2ε₀' }, { svg: b.svg(), cap: 'two planes: σ/ε₀ between' }, { svg: c.svg(), cap: 'shell: 0 inside' }]).svg;
  };
  const figTubeE = () => gplot({
    w: 280, h: 170, x: [0, 4], y: [0, 1.25], xt: [[1, 'R']], yt: [[1, '\\sigma/\\varepsilon_0']], xl: 's', yl: 'E',
    curves: [{ f: () => 0, from: 0, to: 1 }, { f: (s) => 1 / s, from: 1, to: 4 }],
    extra: (f, X, Y) => f.line(X(1), Y(0), X(1), Y(1), { cls: 'dash dim' }),
  });
  const figShellV28 = () => gplot({
    w: 280, h: 170, x: [0, 4], y: [0, 1.25], xt: [[1, 'R']], yt: [[1, '\\tfrac{R\\sigma}{\\varepsilon_0}']], xl: 'r', yl: 'V',
    curves: [{ f: () => 1, from: 0, to: 1 }, { f: (r) => 1 / r, from: 1, to: 4 }],
  });
  // V(r) for positive shells at R and 2R, normalized
  const V2pos = (r) => (r < 1 ? 1 : r < 2 ? (1 / r + 0.5) / 1.5 : 2 / (1.5 * r));
  // thin spherical shell with regions I (inside) and II (outside) and the normal n = r-hat
  const figShellRegions = () => {
    const f = PF.fig();
    const cx = 120, cy = 115, R = 70;
    f.circle(cx, cy, R, { cls: 'thick' });
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx + R * Math.cos(150 * DEG), cy - R * Math.sin(150 * DEG), { cls: 'dim' });
    f.label(95, 88, 'R', 'c', 'small');
    f.label(128, 142, md`\text{I}`, 'c');
    f.label(222, 62, md`\text{II}`, 'c');
    f.label(50, 42, md`\sigma`, 'c', 'small');
    const a = -30 * DEG, s0 = [cx + R * Math.cos(a), cy - R * Math.sin(a)], s1 = [cx + (R + 34) * Math.cos(a), cy - (R + 34) * Math.sin(a)];
    f.arrow(s0[0], s0[1], s1[0], s1[1], { hs: 7 });
    f.tag(s1[0], s1[1], md`\uv n=\uv r`, 'r', 5);
    return f.svg();
  };
  // end view of a long charged tube, regions I and II, reference V = 0 on the tube
  const figTubeRegions = () => {
    const f = PF.fig();
    const cx = 110, cy = 110, R = 60;
    f.circle(cx, cy, R, { cls: 'thick' });
    for (let k = 0; k < 12; k++) plus(f, cx + (R + 9) * Math.cos((k * 30 + 15) * DEG), cy - (R + 9) * Math.sin((k * 30 + 15) * DEG), 3);
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx + R * Math.cos(-40 * DEG), cy - R * Math.sin(-40 * DEG), { cls: 'dim' });
    f.label(143, 118, 'R', 'c', 'small');
    f.label(92, 96, md`\text{I}`, 'c');
    f.label(222, 40, md`\text{II}`, 'c');
    f.label(28, 40, md`\sigma`, 'c', 'small');
    f.text(cx, cy + R + 26, 'V = 0 on the tube (reference)', 't');
    return f.svg();
  };

  // ================================================================== Lesson 7
  const L7 = {
    id: 'u2-bcv', title: 'Boundary conditions II: V, conductors, and drill',
    steps: [
      RF(md`
        ### $V$ is continuous

        Take a point $a$ just below the surface and a point $b$ just above it. Then

        $$V(b)-V(a)=-\int_a^b\vb E\cdot d\vb l .$$

        As the path shrinks to zero length the field stays finite (it only jumps), so the integral goes to zero (Griffiths Eq. 2.34):

        $$\boxed{V_{\text{above}}=V_{\text{below}}}$$

        [[fig:cont]]

        ### Its normal derivative jumps

        $\vb E=-\nabla V$ turns the field condition into one on $\nabla V$ (Lecture 6):

        $$\nabla V_{\text{above}}-\nabla V_{\text{below}}=-\frac{\sigma}{\ep}\,\uv n,\qquad\text{or}\qquad\boxed{\frac{\partial V_{\text{above}}}{\partial n}-\frac{\partial V_{\text{below}}}{\partial n}=-\frac{\sigma}{\ep}},\qquad \frac{\partial V}{\partial n}\equiv\nabla V\cdot\uv n .$$

        The derivatives **along** the surface do not jump: $V$ is continuous at every point of the surface, so its slopes along the surface agree on the two sides. Only the slope **across** the surface changes. On a graph of $V$ along a line crossing the surface, surface charge appears as a corner:

        - $\sigma>0$: crossing in the $\uv n$ direction, the slope drops by $\sigma/\ep$. The corner points up (a ridge).
        - $\sigma<0$: the corner points down (a valley).
        - $V$ itself never jumps. (A jump would need an infinite field in zero thickness, a "dipole layer", which is outside this course.)

        [[fig:tent]]

        !!trap The sign
          The minus in $\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-\dfrac{\sigma}{\ep}$ comes from $\vb E=-\nabla V$. Check it on the isolated sheet, $V=-\dfrac{\sigma}{2\ep}|z|$: slope $-\tfrac{\sigma}{2\ep}$ above and $+\tfrac{\sigma}{2\ep}$ below, difference $-\tfrac{\sigma}{\ep}$.
      `, { cont: { svg: figVcont(), cap: md`From $a$ just below to $b$ just above: a path of vanishing length.` }, tent: { svg: figTent(), cap: md`$V$ along a line crossing a positively charged surface: continuous, with a corner.` } }),
      Q(md`Across a surface carrying charge $\sigma\neq0$, which quantities are continuous?`,
        [md`$V$ and $E^\perp$`, md`$\vb E$ only`, md`$V$, $E^\parallel$ and $E^\perp$`, md`$V$ and $E^\parallel$`], 3,
        [md`$E^\perp$ is the component that jumps, by $\sigma/\ep$.`,
          md`$\vb E$ is the quantity with a jump (in its normal part). $V$ is continuous.`,
          md`$E^\perp$ jumps; otherwise $\sigma$ would be zero.`,
          null],
        md`$V$ (path of zero length) and $E^\parallel$ (thin loop) are continuous. $E^\perp$ and $\partial V/\partial n$ jump. Surface charge is invisible in $V$ itself and in the tangential field, and shows up only in the normal direction.`,
        { figHtml: figVcont() }),
      Q(md`A student's answer for $V$ jumps by 5 V at a charged surface. What would such a jump require?`,
        [md`A large surface charge, with $\sigma$ proportional to the 5 V jump`,
          md`An infinite field across zero thickness (a dipole layer), not an ordinary surface charge`,
          md`Nothing unusual: $V$ always jumps by $\sigma/\ep$ times the thickness`,
          md`A conductor on one side`], 1,
        [md`Surface charge makes the slope of $V$ jump, not $V$ itself.`,
          null,
          md`For a surface of zero thickness that product is zero. $V$ is continuous.`,
          md`A conductor's surface still has $V$ continuous: the outside value at the surface equals the conductor's constant value.`],
        md`$\Delta V=-\int\vb E\cdot d\vb l$ over a vanishing path can only be nonzero if $\vb E$ is infinite there. Ordinary surface charge gives a finite (jumping) field, so $V$ is continuous. When a calculation gives a jump in $V$, look for an algebra slip, typically a wrong constant when splitting an integral.`,
        { figHtml: figVcont() }),
      Q(md`$V$ depends only on $x$. Moving in the $+x$ direction across a charged plane at $x=0$, the slope of $V$ changes from $+4.0$ V/m to $-2.0$ V/m. With $\uv n=+\uv x$, what is $\sigma$? (SI units, slopes in V/m)`,
        [md`$-6\ep$`, md`$+2\ep$`, md`$-2\ep$`, md`$+6\ep$`], 3,
        [md`Sign: $\partial V/\partial n$ above minus below is $-2-4=-6$ V/m, and that equals $-\sigma/\ep$.`,
          md`The change in slope is $-2-(+4)=-6$, not the sum.`,
          md`Use the change in slope, $-6$ V/m, not one side's slope.`,
          null],
        md`$\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-2-4=-6\ \text{V/m}=-\dfrac{\sigma}{\ep}$, so $\sigma=+6\ep\approx5.3\times10^{-11}$ C/m². Positive: $V$ has a ridge at the plane, and the field points away from it on both sides ($E_x=-4$ V/m on the left, $+2$ V/m on the right).`,
        { figHtml: figKinkV() }),
      Q(md`On a graph of $V$ along a line crossing a charged surface, how does **negative** surface charge show up?`,
        [md`as a corner pointing up (a ridge)`, md`as a jump down`, md`as a corner pointing down (a valley)`, md`as a smooth minimum`], 2,
        [md`A ridge is positive charge: the slope drops as you cross.`,
          md`$V$ never jumps at a surface charge.`,
          null,
          md`A smooth minimum has continuous slope, which means no surface charge (volume charge only).`],
        md`$\sigma<0$ makes the slope **increase** by $|\sigma|/\ep$ as you cross along $\uv n$: from falling to rising, a V-shaped valley. Negative charges are pits in the landscape; a negative sheet is a crease at the bottom of a valley.`,
        { figHtml: figTent() }),
      Q(md`Which derivatives of $V$ are continuous across a charged surface?`,
        [md`all of them, since $V$ is continuous`,
          md`only the normal derivative $\partial V/\partial n$`,
          md`none of them`,
          md`the derivatives along the surface; only $\partial V/\partial n$ jumps`], 3,
        [md`Continuity of a function does not make its slope continuous: think of $|x|$.`,
          md`Backwards: the normal derivative is the one that jumps.`,
          md`The tangential derivatives are continuous: they are $-E^\parallel$, which is continuous.`,
          null],
        md`Tangential derivatives are $-E^\parallel$ (continuous); the normal derivative is $-E^\perp$ (jumps by $-\sigma/\ep$). Since $V$ is the same function on both faces of the surface, its rates of change along the surface must agree.`,
        { figHtml: figNormal() }),
      Q(md`Going outward through a thin spherical shell, the slope $dV/dr$ changes from $-3.0$ kV/m just inside to $-1.0$ kV/m just outside. What is $\sigma$ on the shell?`,
        [md`$+17.7$ nC/m²`, md`$+35.4$ nC/m²`, md`$-35.4$ nC/m²`, md`$-17.7$ nC/m²`], 3,
        [md`Sign: $\partial V/\partial n$ out minus in is $(-1)-(-3)=+2$ kV/m $=-\sigma/\ep$, so $\sigma<0$.`,
          md`That uses the sum of the slopes, $-4$ kV/m. The condition uses their difference, $(-1)-(-3)=+2$ kV/m.`,
          md`The change in slope is 2.0 kV/m, not 4.0.`,
          null],
        md`"Above" = outside, $\uv n=\uv r$: $(-1.0)-(-3.0)=+2.0$ kV/m $=-\sigma/\ep$, so $\sigma=-2000\,\ep=-1.77\times10^{-8}$ C/m². In field terms: the outward field drops from 3.0 to 1.0 kV/m across the shell, so the shell is negative (it partly screens positive charge inside it).`,
        { figHtml: figShell() }),
      RF(md`
        ### Worked example: σ from a V(r) graph

        A thin spherical shell of radius $0.15$ m. Measured: $V=900$ V everywhere inside; outside, $V=\dfrac{135\ \text{V·m}}{r}$.

        [[fig:vs]]

        **Boundary conditions to use** ("above" = outside, $\uv n=\uv r$, so $\partial V/\partial n=\partial V/\partial r$):

        1. $V_{\text{out}}=V_{\text{in}}$ at $r=R$.
        2. $\dfrac{\partial V_{\text{out}}}{\partial r}-\dfrac{\partial V_{\text{in}}}{\partial r}=-\dfrac{\sigma}{\ep}$ at $r=R$.

        **Check 1:** $135/0.15=900$ V. Continuous, as it must be.

        **Use 2:** inside the slope is $0$; outside $\dfrac{dV}{dr}=-\dfrac{135}{r^2}=-\dfrac{135}{0.0225}=-6000$ V/m at $R$. So $-6000-0=-\sigma/\ep$ and

        $$\sigma=6000\,\ep=5.31\times10^{-8}\ \text{C/m}^2=53.1\ \text{nC/m}^2 .$$

        Cross-check with the total charge: $q=4\pi R^2\sigma=15.0$ nC, and $\kq\dfrac{q}{R}=900$ V. The corner in $V$ is the surface charge.
      `, { vs: { svg: figVshellNum(), cap: md`$V(r)$ of the shell: flat inside, $135/r$ outside.` } }),
      P({
        title: 'Two shells from a V(r) graph',
        q: md`The graph shows $V(r)$ for two concentric thin shells at $r=0.10$ m and $r=0.30$ m: $V=500$ V for $r<0.10$ m; $V=\dfrac{60}{r}-100$ (volts, $r$ in metres) between the shells; $V=\dfrac{30}{r}$ outside. Find $\sigma_1$ and $\sigma_2$. Use $\ep=8.85\times10^{-12}$ C²/(N·m²).`,
        figHtml: figV2kinks(),
        hints: [md`First check $V$ is continuous at both radii. Then at each shell use $\dfrac{\partial V_{\text{out}}}{\partial r}-\dfrac{\partial V_{\text{in}}}{\partial r}=-\dfrac{\sigma}{\ep}$.`, md`Slopes: between the shells $dV/dr=-60/r^2$; outside $dV/dr=-30/r^2$; inside $0$.`],
        parts: [
          { lbl: md`Is $V$ continuous at both shells?`, mc: [md`yes`, md`no, it jumps at 0.10 m`, md`no, it jumps at 0.30 m`], a: 0, why: [null, md`At 0.10 m: $60/0.10-100=500$ V, equal to the inside value.`, md`At 0.30 m: $60/0.30-100=100$ V and $30/0.30=100$ V.`] },
          { lbl: '\\sigma_1', ans: 53.10, unit: 'nC/m²' },
          { lbl: '\\sigma_2', ans: -2.950, unit: 'nC/m²' },
        ],
        sol: md`
          **Conditions at each shell** ("above" = outside): $V$ continuous; $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma/\ep$.

          **Continuity:** $r=0.10$: $500$ V on both sides. $r=0.30$: $100$ V on both sides.

          **Inner shell:** slope inside $0$, just outside $-60/(0.10)^2=-6000$ V/m. $\sigma_1=-\ep(-6000-0)=6000\,\ep=53.1$ nC/m².

          **Outer shell:** just inside $-60/(0.30)^2=-666.7$ V/m, just outside $-30/(0.30)^2=-333.3$ V/m. Difference $+333.3$ V/m, so $\sigma_2=-333.3\,\ep=-2.95$ nC/m².

          Check with charges: $q_1=4\pi(0.10)^2\sigma_1=6.67$ nC gives $\kq q_1=60$ V·m, the coefficient between the shells; $q_2=4\pi(0.30)^2\sigma_2=-3.34$ nC, and $\kq(q_1+q_2)=30$ V·m, the coefficient outside. The outer shell's corner is gentle because its $\sigma$ is small.
        `,
      }),
      RF(md`
        ### At the surface of a conductor

        Inside a conductor in equilibrium $\vb E=0$ and $V$ is constant. Take "below" = inside and $\uv n$ pointing out. The boundary conditions give, just outside,

        $$\vb E=\frac{\sigma}{\ep}\,\uv n\qquad\text{and}\qquad \sigma=-\ep\,\frac{\partial V}{\partial n}\quad(\text{Griffiths Eqs. 2.48, 2.49}),$$

        since $\partial V_{\text{below}}/\partial n=0$. So you can read the surface charge off the potential just outside a conductor: wherever $V$ falls steeply away from the surface, $\sigma$ is large and positive.

        [[fig:cond]]

        The surface is an equipotential, so $\vb E$ just outside is perpendicular to it (no tangential component, by continuity of $E^\parallel$ with the zero field inside). The method of images and separation of variables use $\sigma=-\ep\,\partial V/\partial n$ constantly: find $V$ outside a conductor, then differentiate at the surface to get the induced charge.
      `, { cond: { svg: figConductorPt({ field: true }), cap: md`At a conductor the whole jump $\sigma/\ep$ is on the outside, and the field leaves perpendicular to the surface.` } }),
      Q(md`Just outside a conductor, $V$ falls by 20 V over the first 1.0 mm out from the surface (a uniform field there). What is $\sigma$ at that spot?`,
        [md`$+354$ nC/m²`, md`$-177$ nC/m²`, md`$0$, since $V$ is constant on a conductor`, md`$+177$ nC/m²`], 3,
        [md`That uses the isolated-sheet formula $E=\tfrac{\sigma}{2\ep}$, i.e. $\sigma=2\ep E$. At a conductor the field inside is zero, so the whole jump is outside: $\sigma=\ep E_{\text{out}}$, with no factor of 2.`,
          md`Sign: $\partial V/\partial n=-2.0\times10^4$ V/m, and $\sigma=-\ep\,\partial V/\partial n>0$.`,
          md`$V$ is constant on and inside the conductor, but it changes outside; the outside slope gives $\sigma$.`,
          null],
        md`$\dfrac{\partial V}{\partial n}=\dfrac{-20\text{ V}}{1.0\times10^{-3}\text{ m}}=-2.0\times10^4$ V/m, so $\sigma=-\ep\dfrac{\partial V}{\partial n}=(8.85\times10^{-12})(2.0\times10^4)=1.77\times10^{-7}$ C/m². $V$ falling away from the surface means a field pointing out of it: positive charge.`,
        { figHtml: figConductorPt({ p: true, d: md`1.0\text{ mm}` }) }),
      Q(md`The surface of a conductor is an equipotential. What does that tell you about $\vb E$ just outside?`,
        [md`$\vb E=0$ just outside too`, md`$\vb E$ is parallel to the surface`, md`$|\vb E|$ is the same at every point of the surface`, md`$\vb E$ is perpendicular to the surface`], 3,
        [md`$\vb E=0$ inside; just outside $E=\sigma/\ep$, which is zero only where $\sigma=0$.`,
          md`Backwards: moving along an equipotential does not change $V$, so $\vb E$ has no component along it.`,
          md`$|\vb E|=\sigma/\ep$ follows $\sigma$, which is generally not uniform (it piles up at sharp points).`,
          null],
        md`$dV=-\vb E\cdot d\vb l=0$ for every $d\vb l$ along the surface, so $\vb E$ has no tangential part: it is normal to the surface, with size $\sigma/\ep$.`,
        { figHtml: figConductorPt() }),
      Q(md`At a conductor's surface the field just outside is $\sigma/\ep$, but an isolated sheet with the same $\sigma$ gives only $\tfrac{\sigma}{2\ep}$ on each side. Where does the extra $\tfrac{\sigma}{2\ep}$ outside come from?`,
        [md`From the conductor's atoms, which double the charge at the surface`,
          md`The two cases have different $\sigma$, since a conductor holds charge on both faces`,
          md`From the external field that charged the conductor`,
          md`From the rest of the conductor's charge, which cancels the local patch's field inside and adds to it outside`], 3,
        [md`$\sigma$ is the same by assumption; nothing doubles it.`,
          md`Take one face with the same $\sigma$ as the sheet; the local patch is identical. The difference is in the other charges.`,
          md`There need be no external field at all (an isolated charged conductor works the same way).`,
          null],
        md`Split the field as before: patch $\pm\tfrac{\sigma}{2\ep}\uv n$ plus $\vb E_{\text{other}}$. Inside the conductor the total is zero, so $\vb E_{\text{other}}=+\tfrac{\sigma}{2\ep}\uv n$ there; it is continuous through the patch, so outside the total is $\tfrac{\sigma}{2\ep}+\tfrac{\sigma}{2\ep}=\tfrac{\sigma}{\ep}$. (Griffiths uses this average field to get the pressure on a conductor's surface.)`,
        { figHtml: figSheetVsConductor() }),
      P({
        title: 'σ on a conducting sphere from ∂V/∂n',
        q: md`A conducting sphere of radius $R=0.10$ m is held at $V_0=1.0$ kV (with $V(\infty)=0$). Outside, $V=V_0R/r$. Use the boundary condition on $\partial V/\partial n$ to find the surface charge density, then the total charge. ($\ep=8.85\times10^{-12}$ C²/(N·m²).)`,
        figHtml: figConductorSphere(),
        hints: [md`Inside the conductor $V=V_0$, so $\partial V/\partial r=0$ there.`, md`Just outside, $\dfrac{\partial V}{\partial r}=-\dfrac{V_0R}{r^2}\Big|_R=-\dfrac{V_0}{R}$. Then $\sigma=-\ep\left(\dfrac{\partial V_{\text{out}}}{\partial r}-\dfrac{\partial V_{\text{in}}}{\partial r}\right)$.`],
        parts: [
          { lbl: '\\sigma', ans: 88.50, unit: 'nC/m²' },
          { lbl: 'q', ans: 11.12, unit: 'nC' },
        ],
        sol: md`
          **Conditions at $r=R$** ("above" = outside): $V$ continuous ($V_0R/R=V_0$, consistent); $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma/\ep$.

          $\partial_rV_{\text{out}}=-V_0/R=-1.0\times10^4$ V/m and $\partial_rV_{\text{in}}=0$, so

          $$\sigma=\ep\frac{V_0}{R}=(8.85\times10^{-12})(1.0\times10^4)=8.85\times10^{-8}\text{ C/m}^2=88.5\text{ nC/m}^2 .$$

          $q=4\pi R^2\sigma=4\pi(0.010)(8.85\times10^{-8})=1.11\times10^{-8}$ C $=11.1$ nC. Check: $\kq\dfrac qR=\dfrac{(8.99\times10^9)(1.11\times10^{-8})}{0.10}=1.0$ kV.
        `,
      }),
      P({
        id: 'HW3-2.31', src: 'HW 3 · Griffiths 2.31', title: 'Checking the boundary conditions', big: true,
        q: md`
          (a) Check that the results of Exs. 2.5 and 2.6, and Prob. 2.11, are consistent with Eq. 2.33.

          (b) Use Gauss's law to find the field inside and outside a long hollow cylindrical tube, which carries a uniform surface charge $\sigma$. Check that your result is consistent with Eq. 2.33.

          (c) Check that the result of Ex. 2.8 is consistent with boundary conditions 2.34 and 2.36.

          (Ex. 2.5: infinite plane, $\tfrac{\sigma}{2\ep}$ away from it on each side. Ex. 2.6: planes $+\sigma$ and $-\sigma$. Prob. 2.11: spherical shell by Gauss's law. Ex. 2.8: potential of a spherical shell, $V=R\sigma/\ep$ inside and $\tfrac{R^2\sigma}{\ep r}$ outside. Eq. 2.33: $\vb E_{\text{above}}-\vb E_{\text{below}}=\tfrac{\sigma}{\ep}\uv n$; 2.34: $V_{\text{above}}=V_{\text{below}}$; 2.36: $\tfrac{\partial V_{\text{above}}}{\partial n}-\tfrac{\partial V_{\text{below}}}{\partial n}=-\tfrac{\sigma}{\ep}$.)
        `,
        figHtml: fig231(),
        hints: [
          md`In every part: choose "above" and $\uv n$ first, then write each field as a multiple of $\uv n$ just above and just below.`,
          md`(a) Two planes: the field is $\sigma/\ep$ (pointing from $+\sigma$ to $-\sigma$) between them and zero outside. Check each plate separately with its own $\sigma$.`,
          md`(b) Gaussian cylinder of radius $s$ and length $\ell$, coaxial with the tube. Inside it encloses nothing; outside it encloses $\sigma\,2\pi R\ell$.`,
          md`(c) "Above" = outside, so $\partial/\partial n=\partial/\partial r$. Evaluate both $V$'s and both slopes at $r=R$.`,
        ],
        parts: [
          { lbl: md`(a) For the infinite plane, $\vb E_{\text{above}}-\vb E_{\text{below}}$ is`, mc: [md`$\vb 0$, since the two fields have equal size`, md`$\dfrac{\sigma}{2\ep}\uv n$`, md`$\dfrac{\sigma}{\ep}\uv n$`, md`$\dfrac{2\sigma}{\ep}\uv n$`], a: 2, why: [md`Equal size but opposite directions: $\tfrac{\sigma}{2\ep}\uv n-\left(-\tfrac{\sigma}{2\ep}\uv n\right)$.`, md`That is the field on one side, not the difference.`, null, md`Each side contributes $\tfrac{\sigma}{2\ep}$, so the difference is $\tfrac{\sigma}{\ep}$.`] },
          { lbl: md`(a) Two planes, at the right plate ($-\sigma$), with $\uv n=+\uv x$ pointing out of the gap: $\vb E_{\text{above}}-\vb E_{\text{below}}=$`, mc: [md`$+\dfrac{\sigma}{\ep}\uv x$`, md`$\vb 0$`, md`$-\dfrac{\sigma}{2\ep}\uv x$`, md`$-\dfrac{\sigma}{\ep}\uv x$`], a: 3, why: [md`Above (outside) the field is 0 and below (in the gap) it is $+\tfrac{\sigma}{\ep}\uv x$: the difference is negative, matching the plate's $-\sigma$.`, md`The field is $\sigma/\ep$ in the gap and 0 outside: there is a jump.`, md`The field in the gap is $\sigma/\ep$ (both plates add), not $\tfrac{\sigma}{2\ep}$.`, null] },
          { lbl: 'E\\ \\text{outside the tube}\\ (s>R)', expr: 'sigma*R/(eps0*s)', vars: { sigma: [0.5, 2], R: [0.5, 1.2], eps0: [0.5, 2], s: [1.5, 3] } },
          { lbl: md`(b) Jump in $E_s$ at $s=R$, in units of $\sigma/\ep$`, ans: 1, unit: '' },
          { lbl: md`(c) At $r=R$, Ex. 2.8 gives $V_{\text{in}}$ and $V_{\text{out}}$ equal to`, mc: [md`$\dfrac{R\sigma}{\ep}$ on both sides`, md`$\dfrac{R\sigma}{\ep}$ inside and $0$ outside`, md`$\dfrac{R\sigma}{\ep}$ inside and $\dfrac{R\sigma}{2\ep}$ outside`, md`$0$ inside and $\dfrac{R\sigma}{\ep}$ outside`], a: 0, why: [null, md`Outside, $V=\tfrac{R^2\sigma}{\ep r}$, which at $r=R$ is $\tfrac{R\sigma}{\ep}$.`, md`$\tfrac{R^2\sigma}{\ep R}=\tfrac{R\sigma}{\ep}$; no factor of 1/2.`, md`Inside, $V=\tfrac{R\sigma}{\ep}$, constant but not zero.`] },
          { lbl: md`(c) $\dfrac{\partial V_{\text{out}}}{\partial r}-\dfrac{\partial V_{\text{in}}}{\partial r}$ at $r=R$, in units of $\sigma/\ep$`, ans: -1, unit: '' },
        ],
        sol: md`
          In every part, "above" is the side $\uv n$ points into, and Eq. 2.33 says $\vb E_{\text{above}}-\vb E_{\text{below}}=\tfrac{\sigma}{\ep}\uv n$.

          [[fig:fields]]

          **(a) Ex. 2.5, infinite plane.** Above: $+\tfrac{\sigma}{2\ep}\uv n$; below: $-\tfrac{\sigma}{2\ep}\uv n$. Difference $\tfrac{\sigma}{\ep}\uv n$. Consistent.

          **Ex. 2.6, two planes** ($+\sigma$ on the left, $-\sigma$ on the right). The field is $\tfrac{\sigma}{\ep}\uv x$ between them and 0 outside.
          - Left plate, $\uv n=+\uv x$ (from region (i) into region (ii)): $\tfrac{\sigma}{\ep}\uv x-0=\tfrac{(+\sigma)}{\ep}\uv x$. Consistent.
          - Right plate, $\uv n=+\uv x$ (from (ii) into (iii)): $0-\tfrac{\sigma}{\ep}\uv x=\tfrac{(-\sigma)}{\ep}\uv x$. Consistent with charge $-\sigma$.

          **Prob. 2.11, spherical shell.** Inside $\vb E=0$; just outside $\vb E=\tfrac{\sigma R^2}{\ep R^2}\uv r=\tfrac{\sigma}{\ep}\uv r$. With $\uv n=\uv r$: difference $\tfrac{\sigma}{\ep}\uv r$. Consistent.

          **(b) Long tube.** Gaussian cylinder of radius $s$, length $\ell$, coaxial with the tube. By symmetry $\vb E=E(s)\,\uv s$ and only the curved side has flux.
          - $s<R$: $E\cdot2\pi s\ell=0$, so $\vb E=0$.
          - $s>R$: $E\cdot2\pi s\ell=\dfrac{\sigma\,2\pi R\ell}{\ep}$, so $\vb E=\dfrac{\sigma R}{\ep s}\,\uv s$.

          At $s=R$, with $\uv n=\uv s$: $\vb E_{\text{out}}-\vb E_{\text{in}}=\dfrac{\sigma R}{\ep R}\uv s-0=\dfrac{\sigma}{\ep}\uv s$. Consistent.

          [[fig:tube]]

          **(c) Ex. 2.8.** $V=\dfrac{R\sigma}{\ep}$ for $r\le R$ and $V=\dfrac{R^2\sigma}{\ep r}$ for $r\ge R$. "Above" = outside, $\uv n=\uv r$.
          - **2.34:** at $r=R$ both give $\dfrac{R\sigma}{\ep}$. Continuous.
          - **2.36:** $\dfrac{\partial V_{\text{out}}}{\partial r}\Big|_R=-\dfrac{R^2\sigma}{\ep R^2}=-\dfrac{\sigma}{\ep}$ and $\dfrac{\partial V_{\text{in}}}{\partial r}=0$. Difference: $-\dfrac{\sigma}{\ep}$. Consistent.

          [[fig:v28]]

          **What to remember.** Every check has the same three moves: choose $\uv n$, write the fields (or slopes) just on either side as multiples of $\uv n$, subtract. The jump always matches the local $\sigma$, whatever the rest of the configuration does.
        `,
        figs: {
          fields: { svg: fig231sol(), cap: md`Fields for part (a): at every sheet the jump is $\sigma/\ep$ along $\uv n$.` },
          tube: { svg: figTubeE(), cap: md`Tube: $E(s)$ jumps from $0$ to $\sigma/\ep$ at $s=R$, then falls as $1/s$.` },
          v28: { svg: figShellV28(), cap: md`Ex. 2.8: $V(r)$ is continuous at $R$; its slope jumps from $0$ to $-\sigma/\ep$.` },
        },
      }),
      Q(md`Two thin shells, at $R$ and $2R$, both positively charged (no other charge). Which graph is $V(r)$, with $V(\infty)=0$?`,
        ['A', 'B', 'C', 'D'], 3,
        [md`This has a corner only at $R$. The outer shell's charge must make a corner at $2R$ too.`,
          md`$V$ cannot jump at $2R$; only its slope can.`,
          md`A smooth curve with no flat part means volume charge everywhere and no field-free region. Inside the inner shell $\vb E=0$, so $V$ must be flat there.`,
          null],
        md`Flat inside $R$ (no field); $\tfrac1r$-shaped between, plus a constant from the outer shell; $\tfrac1r$ outside with the total charge. At each shell $V$ is continuous with a downward-bending corner (positive $\sigma$: the slope drops as you go out).`,
        { figHtml: rowABCD([
          thumb([{ f: (r) => (r < 1 ? 1 : (1 / r + 0.5) / 1.5), from: 0 }], { xt: [[1, 'R'], [2, '2R']] }),
          thumb([{ f: () => 1, from: 0, to: 1 }, { f: (r) => (1 / r + 0.5) / 1.5, from: 1, to: 2 }, { f: (r) => 1 / (1.5 * r), from: 2 }], { xt: [[1, 'R'], [2, '2R']] }),
          thumb([{ f: (r) => 1 / Math.sqrt(1 + 0.6 * r * r), from: 0 }], { xt: [[1, 'R'], [2, '2R']] }),
          thumb([{ f: V2pos, from: 0, n: 400 }], { xt: [[1, 'R'], [2, '2R']] }),
        ]) }),
      Q(md`For a uniformly charged thin spherical shell, which of $E(r)$, $V(r)$ and $dV/dr$ are discontinuous at $r=R$?`,
        [md`all three`, md`only $V(r)$`, md`only $E(r)$`, md`$E(r)$ and $dV/dr$, but not $V(r)$`], 3,
        [md`$V$ is continuous: $\tfrac{q}{4\pi\ep R}$ from both sides.`,
          md`Backwards: $V$ is the continuous one.`,
          md`$dV/dr=-E_r$, so it jumps exactly when $E_r$ does.`,
          null],
        md`$E_r$ jumps by $\sigma/\ep$; $dV/dr=-E_r$ jumps by $-\sigma/\ep$; $V$ is continuous with a corner. Lecture 5's $E(r)$ graph and Lesson 5's $V(r)$ graph show both.`,
        { figHtml: figShell() }),
      Q(md`Along a line crossing a plane at $x=0$, $V(x)$ is a single straight line with the same slope on both sides. What is $\sigma$ on the plane?`,
        [md`It depends on the slope.`, md`It depends on the value of $V$ at $x=0$.`, md`$0$`, md`$\ep$ times the slope`], 2,
        [md`The slope gives the field, $E_x=-dV/dx$, which is the same on both sides. Only a change of slope signals surface charge.`,
          md`$V(0)$ depends on the reference point; it says nothing about the charge.`,
          null,
          md`That would be a conductor-type formula, which needs zero field on one side. Here the field is the same on both sides: no jump.`],
        md`No change in $\partial V/\partial n$ means no surface charge. A uniform field passing straight through a plane does not need any charge on it.`,
        { nofig: 'described in words; a straight line' }),
      Q(md`For a spherical shell you take "above" to be the outside. Then`,
        [md`$\uv n=-\uv r$ and $\dfrac{\partial V}{\partial n}=-\dfrac{\partial V}{\partial r}$`, md`$\uv n=\uv r$ and $\dfrac{\partial V}{\partial n}=\dfrac{\partial V}{\partial r}$`, md`$\uv n$ is tangent to the shell`, md`$\uv n=\uv r$ and $\dfrac{\partial V}{\partial n}=\dfrac1r\dfrac{\partial V}{\partial\theta}$`], 1,
        [md`$\uv n$ points from below (inside) to above (outside): that is $+\uv r$.`,
          null,
          md`The normal is perpendicular to the surface: radial for a sphere.`,
          md`$\tfrac1r\tfrac{\partial V}{\partial\theta}$ is a tangential derivative (along the shell).`],
        md`$\uv n$ always points into the "above" region. For a sphere with "above" = outside, $\uv n=\uv r$ and $\nabla V\cdot\uv r=\partial V/\partial r$. Then 2.36 reads $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma/\ep$.`,
        { figHtml: figShell() }),
      P({
        title: 'Four planes from V(x)',
        q: md`Four large parallel planes sit at $x=0$, $2$, $4$ and $6$ cm. The potential depends only on $x$ and is shown in the graph: $0$ for $x<0$, rising linearly to 10 V at $x=2$ cm, flat at 10 V up to $x=4$ cm, falling linearly to 0 at $x=6$ cm, and 0 beyond. Find the surface charge density on each plane and $E_x$ in $0<x<2$ cm. ($\ep=8.85\times10^{-12}$ C²/(N·m²).)`,
        figHtml: figVplates(),
        hints: [md`Slopes: $0$, $+500$ V/m, $0$, $-500$ V/m, $0$ (10 V over 2 cm is 500 V/m).`, md`At each plane, with $\uv n=+\uv x$: $\sigma=-\ep\left(\dfrac{dV}{dx}\Big|_{\text{right}}-\dfrac{dV}{dx}\Big|_{\text{left}}\right)$.`],
        parts: [
          { lbl: '\\sigma(x=0)', ans: -4.425, unit: 'nC/m²' },
          { lbl: '\\sigma(x=2\\text{ cm})', ans: 4.425, unit: 'nC/m²' },
          { lbl: '\\sigma(x=4\\text{ cm})', ans: 4.425, unit: 'nC/m²' },
          { lbl: '\\sigma(x=6\\text{ cm})', ans: -4.425, unit: 'nC/m²' },
          { lbl: 'E_x\\ (0<x<2\\text{ cm})', ans: -500, unit: 'V/m' },
          { lbl: md`What could the region $2<x<4$ cm be?`, mc: [md`the inside of a conducting slab`, md`a slab of uniform positive charge`, md`empty space with a uniform field`], a: 0, why: [null, md`Uniform volume charge would curve $V$ (Poisson). Here $V$ is flat.`, md`A flat $V$ means zero field, not a uniform nonzero one.`] },
        ],
        sol: md`
          **Condition at each plane** ($\uv n=+\uv x$, "above" = the right side): $\sigma=-\ep\big(V'_{\text{right}}-V'_{\text{left}}\big)$. $V$ is continuous everywhere on the graph, as it must be.

          | plane | slope left (V/m) | slope right (V/m) | $\sigma$ |
          |---|---|---|---|
          | $x=0$ | $0$ | $+500$ | $-500\,\ep=-4.43$ nC/m² |
          | $x=2$ cm | $+500$ | $0$ | $+500\,\ep=+4.43$ nC/m² |
          | $x=4$ cm | $0$ | $-500$ | $+500\,\ep=+4.43$ nC/m² |
          | $x=6$ cm | $-500$ | $0$ | $-500\,\ep=-4.43$ nC/m² |

          Field: $E_x=-dV/dx=-500$ V/m in $0<x<2$ cm (pointing from the $+$ plane at 2 cm to the $-$ plane at 0), zero in $2<x<4$ cm, $+500$ V/m in $4<x<6$ cm.

          **Picture:** a conducting slab at 10 V between two grounded plates, both faces of the slab positive. The total charge is zero, so the field outside vanishes. Ridges in $V$ (at 2 and 4 cm) are positive, valleys (at 0 and 6 cm) negative.
        `,
      }),
      RF(md`
        ### Summary: every boundary condition

        At a surface with charge density $\sigma$, $\uv n$ pointing from "below" into "above":

        | Quantity | Across the surface |
        |---|---|
        | $E^\perp$ | jumps: $E^\perp_{\text{above}}-E^\perp_{\text{below}}=\sigma/\ep$ (pillbox) |
        | $E^\parallel$ | continuous (thin loop) |
        | $\vb E$ | $\vb E_{\text{above}}-\vb E_{\text{below}}=\dfrac{\sigma}{\ep}\uv n$ |
        | $V$ | continuous (path of zero length) |
        | $\partial V/\partial n$ | jumps: $\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-\dfrac{\sigma}{\ep}$ |
        | tangential derivatives of $V$ | continuous |
        | conductor surface | $\vb E_{\text{out}}=\dfrac{\sigma}{\ep}\uv n$, $\sigma=-\ep\dfrac{\partial V}{\partial n}$, $\vb E\perp$ surface |

        !!key Patterns to remember
          - Always pick "above" and $\uv n$ first, and list the conditions before using them.
          - $\sigma$ from fields: $\ep(\vb E_{\text{above}}-\vb E_{\text{below}})\cdot\uv n$. From potentials: $-\ep$ times the change in normal slope.
          - Graph reading: $V$ never jumps; a corner in $V$ (a jump in $E$) is surface charge; a ridge is positive, a valley negative. Curvature without a corner is volume charge.
          - Conductor: zero field inside, so the whole jump is outside: $E=\sigma/\ep$, perpendicular to the surface.
          - These conditions are what Unit 4 uses to fix the constants in solutions of Laplace's equation.

        Below: a drill that serves every multiple-choice question in this unit at random.
      `),
      G('concept', { need: 5, units: ['u2'] }),
    ],
  };

  C.unit({
    id: 'u2', num: 'Unit 2', title: 'Electric potential',
    blurb: 'Curl-free fields and V, E = −∇V, reference points, superposing V, Poisson\'s equation, V(r) of spheres and cylinders, and boundary conditions at surface charge.',
    lessons: [L1, L2, L3, L4, L5, L6, L7],
  });
})();

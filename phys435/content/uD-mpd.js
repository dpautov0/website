/* Unit D drill ladders: multipole expansion and delta functions in charge density (Griffiths 1.5, 2.2, 3.4).
   Pushes four lessons into the drill holding unit (registered by uD-0.js).
   Every answer is checked in scratchpad/p435/verify/uD_mpd_mp.py and uD_mpd_delta.py. */
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
    if (tryPut(f, x, y, t, sides, gap, cls)) return f;
    const all = ['tr', 'r', 'tl', 'l', 't', 'b', 'br', 'bl'];
    for (const g of [gap + 32, gap + 42, gap + 54]) for (const at of all) {
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
  const plus = (f, x, y, s = 3.2) => { f.line(x - s, y, x + s, y, { cls: 'thin' }); f.line(x, y - s, x, y + s, { cls: 'thin' }); };
  const minus = (f, x, y, s = 3.2) => f.line(x - s, y, x + s, y, { cls: 'thin' });
  const axis = (f, x1, y1, x2, y2, lab, sides) => { f.arrow(x1, y1, x2, y2, { cls: 'dim', hs: 6 }); if (lab) put(f, x2, y2, lab, sides || sidesToward(Math.atan2(y1 - y2, x2 - x1) / D), 5, 'small accent'); };
  const ang = (f, c, r, a0, a1, lab) => { f.pl(f.arcPts(c[0], c[1], r, r, a0, a1), { cls: 'dim thin' }); if (lab) { const p = pol(r + 3, (a0 + a1) / 2, c); if (!tryPut(f, p[0], p[1], lab, sidesToward((a0 + a1) / 2), 4, 'small')) put(f, c[0], c[1], lab, sidesToward((a0 + a1) / 2 + 180), 6, 'small'); } };
  const dimL = (f, x1, y1, x2, y2, lab, sides) => { f.pl(sub(x1, y1, x2, y2), { cls: 'dim', arrow: 'both', hs: 6 }); if (lab) put(f, (x1 + x2) / 2, (y1 + y2) / 2, lab, sides || ['t', 'r', 'b', 'l'], 5, 'small'); };
  const varr = (f, x1, y1, x2, y2, o = {}) => f.pl(sub(x1, y1, x2, y2), Object.assign({ arrow: 'end', hs: 7 }, o));

  // charge tints: blue = +, red = -, opacity ~ magnitude. Not a conductor (no hatching), so labels may sit on a tint.
  const r1 = (v) => Math.round(v * 10) / 10;
  const dpath = (pts) => `M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z`;
  const TCOL = { '+': 'var(--primary, #3f7fd8)', '-': 'var(--bad)' };
  function chg(f, pts, sign, op) {
    pts.forEach((p) => f.track(p[0], p[1]));
    f.add(`<path class="nodecl" style="fill:${TCOL[sign]};fill-opacity:${op ?? (sign === '+' ? 0.26 : 0.18)};stroke:none" d="${dpath(pts)}"/>`);
    return f;
  }
  // a thick tinted stroke along a curve (line or surface charge seen edge-on)
  function stint(f, pts, sign, op = 0.7, w = 5) {
    pts.forEach((p) => f.track(p[0], p[1]));
    f.add(`<path class="nodecl" style="fill:none;stroke:${TCOL[sign]};stroke-width:${w};stroke-opacity:${op}" d="M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}"/>`);
    return f;
  }
  // signed density g in [-1, 1] -> tint
  const gtint = (f, pts, g, max = 0.34) => { if (Math.abs(g) > 0.02) chg(f, pts, g > 0 ? '+' : '-', Math.abs(g) * max); };

  // function plot with labels placed in open space
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
    for (const sp of (o.spikes || [])) { f.arrow(X(sp.x), Y(ya), X(sp.x), Y(sp.h), { hs: 7 }); }
    if (o.xl) f.label(X(x1) + 10, Y(ya), o.xl, 'l', 'small');
    if (o.yl) f.label(X(x0) + 6, Y(y1) - 2, o.yl, 'bl', 'small');
    for (const sp of (o.spikes || [])) if (sp.lab) put(f, X(sp.x), Y(sp.h), sp.lab, sp.sides || ['r', 'tr', 'l', 'tl'], 5, 'small');
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
      if (!done) put(f, X(x1) - 4, Y(y1) + 4, c.lab, ['bl', 'l', 'b'], 4, 'small');
    }
    f.track(0, 0, W, H); widen(f);
    return f.svg().replace('class="schem pfig', 'class="schem pfig pplot');
  }

  // ================================================================ multipole figures
  // ball cross-section (z up). kind: 'hemi' | 'hemishell' | 'cos' | 'cos2' | 'zlin' | 'uni' | 'cosshell'
  // o: R, P: [r, thetaDeg], Plab, labs: [[tex, screenDeg, r]], extra(f, R), noZ, Rdim (screen deg), half (dashed R/2 circle)
  function ball(o = {}) {
    const f = PF.fig();
    const Rr = o.R ?? 60, kind = o.kind || 'hemi';
    const sector = (r0, r1, a0, a1) => f.arcPts(0, 0, r1, r1, a0, a1, 6).concat(r0 ? f.arcPts(0, 0, r0, r0, a1, a0, 6) : [[0, 0]]);
    const byTheta = (r0, r1, g) => {          // g(theta in rad) -> signed tint; 15-degree sectors on both sides of the z axis
      for (let t = 0; t < 180; t += 15) {
        const gm = g((t + 7.5) * D);
        gtint(f, sector(r0, r1, 90 - t - 15, 90 - t), gm); gtint(f, sector(r0, r1, 90 + t, 90 + t + 15), gm);
      }
    };
    if (kind === 'hemi') { chg(f, f.arcPts(0, 0, Rr, Rr, 0, 180), '+'); chg(f, f.arcPts(0, 0, Rr, Rr, 180, 360), '-'); }
    if (kind === 'hemishell') { const h = Rr / 2; chg(f, f.arcPts(0, 0, Rr, Rr, 0, 180).concat(f.arcPts(0, 0, h, h, 180, 0)), '+'); chg(f, f.arcPts(0, 0, Rr, Rr, 180, 360).concat(f.arcPts(0, 0, h, h, 360, 180)), '-'); }
    if (kind === 'cos') byTheta(0, Rr, Math.cos);
    if (kind === 'cos2') { byTheta(0, Rr / 2, Math.cos); byTheta(Rr / 2, Rr, (t) => -Math.cos(t)); }
    if (kind === 'zlin') for (let z = -Rr; z < Rr; z += Rr / 6) {
      const zm = z + Rr / 12, h1 = Math.sqrt(Math.max(0, Rr * Rr - z * z)), h2 = Math.sqrt(Math.max(0, Rr * Rr - (z + Rr / 6) ** 2));
      const a0 = Math.asin(Math.max(-1, Math.min(1, z / Rr))) / D, a1 = Math.asin(Math.max(-1, Math.min(1, (z + Rr / 6) / Rr))) / D;
      const right = f.arcPts(0, 0, Rr, Rr, a0, a1, 4), left = f.arcPts(0, 0, Rr, Rr, 180 - a1, 180 - a0, 4);
      void h1; void h2;
      gtint(f, right.concat(left).map((p) => [p[0], p[1]]), zm / Rr);
    }
    if (kind === 'uni') chg(f, f.arcPts(0, 0, Rr, Rr, 0, 360), '+');
    f.circle(0, 0, Rr);
    if (kind === 'hemi' || kind === 'hemishell') {
      f.line(-Rr + 2, 0, Rr - 2, 0, { cls: 'dim dash thin' });
      const marks = kind === 'hemi' ? [[-0.55, 0.3], [0.5, 0.33], [-0.2, 0.7], [0.3, 0.68], [-0.78, 0.14], [0.78, 0.16]] : [[-0.62, 0.55], [0.6, 0.58], [-0.25, 0.84], [0.28, 0.84], [-0.86, 0.22], [0.86, 0.24]];
      for (const [x, y] of marks) { plus(f, x * Rr, -y * Rr); minus(f, x * Rr, y * Rr); }
    }
    if (kind === 'hemishell' || kind === 'cos2' || o.half) f.circle(0, 0, Rr / 2, { cls: 'dim dash thin' });
    if (!o.noZ) {
      const zt = o.zTop ?? Rr + 40;
      f.line(0, Rr + 14, 0, Rr + 2, { cls: 'dim dash thin' });
      f.line(0, Rr - 2, 0, -Rr + 2, { cls: 'dim dash thin' });
      axis(f, 0, -Rr - 2, 0, -zt, 'z', ['t', 'tr', 'tl']);
    }
    if (o.P) {
      const [rp, th] = o.P, p = pol(rp, 90 - th);
      dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); f.dot(p[0], p[1], 2.8);
      if (th > 3) ang(f, [0, 0], o.thR || 0.32 * Rr, Math.min(90, 90 - th), Math.max(90, 90 - th), '\\theta');
    }
    if (o.Rdim !== undefined) { const p = pol(Rr, o.Rdim); dimL(f, 0, 0, p[0], p[1], 'R', o.Rsides || ['t', 'tl', 'r', 'b']); }
    if (o.P && o.Plab !== false) { const p = pol(o.P[0], 90 - o.P[1]); put(f, p[0], p[1], o.Plab || 'P', ['tr', 'r', 't', 'tl'], 5); }
    for (const [tex, deg, rr] of (o.labs || [])) { const p = pol((rr || Rr) + 6, deg); put(f, p[0], p[1], tex, sidesToward(deg), 5, 'small'); }
    if (o.extra) o.extra(f, Rr);
    return widen(f).svg();
  }

  // thin shell (cross-section) with a surface density sig(theta) in [-1,1] drawn as a tinted band
  function shell(o = {}) {
    const f = PF.fig();
    const Rr = o.R ?? 60, w = 7;
    for (let t = 0; t < 180; t += 10) {
      const g = o.sig((t + 5) * D);
      const band = (a0, a1) => f.arcPts(0, 0, Rr + w, Rr + w, a0, a1, 4).concat(f.arcPts(0, 0, Rr, Rr, a1, a0, 4));
      gtint(f, band(90 - t - 10, 90 - t), g, 0.6); gtint(f, band(90 + t, 90 + t + 10), g, 0.6);
    }
    f.circle(0, 0, Rr); f.circle(0, 0, Rr + w, { cls: 'thin' });
    f.line(0, Rr + w + 14, 0, Rr + w + 2, { cls: 'dim dash thin' });
    f.line(0, Rr - 2, 0, -Rr + 2, { cls: 'dim dash thin' });
    axis(f, 0, -Rr - w - 2, 0, -Rr - w - 38, 'z', ['t', 'tr', 'tl']);
    f.dot(0, 0, 2);
    if (o.Rdim !== undefined) { const p = pol(Rr, o.Rdim); dimL(f, 0, 0, p[0], p[1], 'R', ['t', 'b', 'r', 'l']); }
    if (o.lab) put(f, Rr * 0.72 + w, -Rr * 0.72 - w, o.lab, ['tr', 'r', 't'], 6);
    if (o.extra) o.extra(f, Rr);
    return widen(f).svg();
  }

  // point charges in a plane. o: u (px per unit), ch: [[x, y, '+'|'-', 'lab', side]], ax: ['x','z'], xr, yr (axis ranges in units), P: [x, y, lab], ticks
  function pts2(o = {}) {
    const f = PF.fig();
    const u = o.u ?? 40, ax = o.ax || ['x', 'z'];
    const xr = o.xr || [-2.6, 2.6], yr = o.yr || [-2.6, 2.6];
    axis(f, xr[0] * u, 0, xr[1] * u, 0, ax[0], ['r', 'br', 'tr']);
    axis(f, 0, -yr[0] * u, 0, -yr[1] * u, ax[1], ['t', 'tr', 'tl']);
    for (const [x, y] of (o.grid || [])) { f.line(x * u, 0, x * u, -y * u, { cls: 'dim dash thin' }); f.line(0, -y * u, x * u, -y * u, { cls: 'dim dash thin' }); }
    for (const c of o.ch) f.charge(c[0] * u, -c[1] * u, { q: c[2] });
    for (const t of (o.ticks || [])) { const [v, lab, which] = t; if (which === 'y') { f.line(-4, -v * u, 4, -v * u, { cls: 'dim' }); put(f, -4, -v * u, lab, ['l', 'bl', 'tl'], 4, 'small accent'); } else { f.line(v * u, -4, v * u, 4, { cls: 'dim' }); put(f, v * u, 4, lab, ['b', 'br', 'bl'], 4, 'small accent'); } }
    for (const c of o.ch) if (c[3]) put(f, c[0] * u, -c[1] * u, c[3], c[4] ? [c[4], 'tr', 'tl', 'r', 'l', 'br', 'bl'] : ['tr', 'tl', 'r', 'l', 'br', 'bl', 't', 'b'], 11);
    if (o.P) { const [x, y, lab] = o.P; f.dot(x * u, -y * u, 2.8); put(f, x * u, -y * u, lab || 'P', ['tr', 'r', 't', 'br'], 6); }
    if (o.extra) o.extra(f, u);
    return widen(f).svg();
  }

  // straight rod along z from -L to L with a linear density lam0 z/L (or 'uni' = uniform +)
  function rod(o = {}) {
    const f = PF.fig();
    const Lp = o.L ?? 70, w = 7;
    if (o.kind === 'uni') chg(f, [[-w / 2, -Lp], [w / 2, -Lp], [w / 2, Lp], [-w / 2, Lp]], '+', 0.4);
    else for (let z = -Lp; z < Lp; z += Lp / 5) { const g = (z + Lp / 10) / Lp; gtint(f, [[-w / 2, -z], [w / 2, -z], [w / 2, -z - Lp / 5], [-w / 2, -z - Lp / 5]], g, 0.7); }
    f.rect(-w / 2, -Lp, w, 2 * Lp, { cls: 'thin' });
    f.line(0, Lp + 18, 0, Lp + 2, { cls: 'dim dash thin' });
    axis(f, 0, -Lp - 2, 0, -Lp - 34, 'z', ['t', 'tr', 'tl']);
    f.line(-14, 0, -w / 2 - 2, 0, { cls: 'dim thin' }); f.line(w / 2 + 2, 0, 14, 0, { cls: 'dim thin' });
    put(f, -14, 0, '0', ['l'], 3, 'small accent');
    dimL(f, 24, 0, 24, -Lp, 'L', ['r']); dimL(f, 24, 0, 24, Lp, 'L', ['r']);
    if (o.lab) put(f, -w / 2, -Lp * 0.55, o.lab, ['l', 'tl', 'bl'], 8);
    if (o.extra) o.extra(f, Lp);
    return widen(f).svg();
  }

  // oblique 3-D frame (x toward the viewer, y right, z up)
  const fig3 = () => PF.fig({ proj: { ox: 0, oy: 0, s: 1 } });
  function ax3(g, L, labs = ['x', 'y', 'z'], Ls) {
    const O = g.p3(0, 0, 0), ends = [g.p3(Ls ? Ls[0] : L, 0, 0), g.p3(0, Ls ? Ls[1] : L, 0), g.p3(0, 0, Ls ? Ls[2] : L)];
    ends.forEach((E, i) => axis(g, O[0], O[1], E[0], E[1], labs[i], [['bl', 'b', 'l'], ['r', 'tr', 'br'], ['t', 'tr', 'tl']][i]));
  }
  // ring (or disk) of radius Rr in the xy-plane with density g(phi) in [-1,1]
  function ring3(o = {}) {
    const g = fig3(), Rr = o.R ?? 70, N = 36;
    const P3 = (ph, r = Rr) => g.p3(r * Math.cos(ph), r * Math.sin(ph), 0);
    for (let i = 0; i < N; i++) {
      const a0 = i * 2 * PI / N, a1 = (i + 1) * 2 * PI / N, gm = o.dens((a0 + a1) / 2);
      if (o.disk) { const pts = [g.p3(0, 0, 0)]; for (let k = 0; k <= 3; k++) pts.push(P3(a0 + (a1 - a0) * k / 3)); gtint(g, pts, gm, 0.4); }
      else if (Math.abs(gm) > 0.02) stint(g, [0, 1, 2, 3].map((k) => P3(a0 + (a1 - a0) * k / 3)), gm > 0 ? '+' : '-', Math.abs(gm) * 0.85, 5);
    }
    const ring = []; for (let i = 0; i <= 72; i++) ring.push(P3(i * 2 * PI / 72));
    g.pl(ring, { cls: o.disk ? '' : 'thin' });
    ax3(g, Rr + 40, ['x', 'y', 'z']);
    if (o.phiAt !== undefined) {
      const ph = o.phiAt * D, p = P3(ph), O = g.p3(0, 0, 0);
      dl(g, O[0], O[1], p[0], p[1], { cls: 'dim dash thin' });
      const arc = []; for (let k = 0; k <= 12; k++) arc.push(P3(ph * k / 12, Rr * 0.35));
      g.pl(arc, { cls: 'dim thin' });
      const m = P3(ph * 0.5, Rr * 0.35); put(g, m[0], m[1], '\\phi', ['b', 'br', 'r'], 4, 'small');
    }
    if (o.lab) { const p = P3(o.labPhi ?? 3 * PI / 4); put(g, p[0], p[1], o.lab, ['tr', 't', 'tl', 'r'], 8); }
    if (o.Rlab) { const p = P3(-PI / 3); const O = g.p3(0, 0, 0); dimL(g, O[0], O[1], p[0], p[1], 'R', ['b', 'bl', 'r']); }
    if (o.extra) o.extra(g, Rr, P3);
    return widen(g).svg();
  }

  // dipole arrow p at the origin (along +z), with a field point at (r, theta)
  function dip(o = {}) {
    const f = PF.fig();
    const len = o.len ?? 30;
    const dir = (o.pdeg ?? 90);
    const t = pol(len / 2, dir), b = pol(-len / 2, dir);
    f.charge(t[0] + (t[0] - b[0]) * 0.25, t[1] + (t[1] - b[1]) * 0.25, { q: '+', r: 5 });
    f.charge(b[0] - (t[0] - b[0]) * 0.25, b[1] - (t[1] - b[1]) * 0.25, { q: '-', r: 5 });
    f.arrow(b[0], b[1], t[0], t[1], { cls: 'thick', hs: 7 });
    put(f, 0, 0, o.plab || '\\mathbf p', o.psides || ['l', 'r', 'bl'], 12);
    if (o.zaxis !== false) { f.line(0, len + 6, 0, len / 2 + 14, { cls: 'dim dash thin' }); axis(f, 0, -len / 2 - 14, 0, -(o.zTop ?? 110), 'z', ['t', 'tr', 'tl']); }
    for (const P0 of (o.pts || [])) {
      const [rp, th, lab] = P0, p = pol(rp, 90 - th);
      dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); f.dot(p[0], p[1], 2.8);
      if (lab) put(f, p[0], p[1], lab, ['tr', 'r', 'br', 't'], 6);
      if (P0[3]) ang(f, [0, 0], P0[3], Math.min(90, 90 - th), Math.max(90, 90 - th), '\\theta');
    }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // a dipole (charges +-q a distance d apart, at angle alpha to a uniform field E pointing right)
  function dipInField(o = {}) {
    const f = PF.fig();
    for (const y of [-60, -20, 20, 60]) f.arrow(-110, y, 110, y, { cls: 'dim', hs: 7 });
    put(f, 110, -60, o.Elab || '\\mathbf E_0', ['r', 'tr'], 4);
    const al = o.al ?? 30, len = 60;
    const t = pol(len / 2, al), b = pol(-len / 2, al);
    dl(f, b[0], b[1], t[0], t[1], { cls: 'thick' });
    f.charge(t[0], t[1], { q: '+', r: 6 }); f.charge(b[0], b[1], { q: '-', r: 6 });
    f.line(0, 0, 50, 0, { cls: 'dim dash thin' });
    if (o.alab !== false) ang(f, [0, 0], 30, 0, al, o.alab || '\\alpha');
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // two dipoles (both along z): 'axis' (one above the other) or 'side' (side by side), with separation d
  function twoDip(o = {}) {
    const f = PF.fig();
    const dd = 110, len = 34, s2 = o.s2 ?? 1;
    const one = (x, y, s) => { f.arrow(x, y + s * len / 2, x, y - s * len / 2, { cls: 'thick', hs: 8 }); };
    if (o.mode === 'side') {
      one(0, 0, 1);
      if (o.free) { f.circle(dd, 0, len / 2, { cls: 'dim dash thin' }); f.dot(dd, 0, 2.6); } else one(dd, 0, s2);
      f.line(0, len / 2 + 16, dd, len / 2 + 16, { cls: 'dim dash thin' });
      dimL(f, 0, len / 2 + 30, dd, len / 2 + 30, 'd', ['b']);
      put(f, 0, 0, '\\mathbf p_1', ['l'], 8); put(f, dd, 0, o.free ? '\\mathbf p_2\\ ?' : '\\mathbf p_2', ['r'], o.free ? len / 2 + 6 : 8);
    } else {
      one(0, 0, 1); one(0, -dd, s2);
      f.line(0, len / 2 + 8, 0, len / 2 + 20, { cls: 'dim dash thin' });
      dimL(f, 34, 0, 34, -dd, 'd', ['r']);
      put(f, 0, 0, '\\mathbf p_1', ['l'], 8); put(f, 0, -dd, '\\mathbf p_2', ['l'], 8);
      axis(f, 0, -dd - len / 2 - 6, 0, -dd - len / 2 - 36, 'z', ['t', 'tr']);
    }
    return widen(f).svg();
  }

  // generic lumpy object with + and - regions, a source point r' and a far field point P (the expansion picture)
  function blob(o = {}) {
    const f = PF.fig();
    const sh = []; for (let i = 0; i <= 48; i++) { const t = i / 48 * 2 * PI; const rr = 38 + 7 * Math.sin(3 * t) + 4 * Math.cos(2 * t); sh.push([rr * Math.cos(t), -rr * Math.sin(t) * 0.85]); }
    chg(f, sh.filter((p, i) => i <= 24).concat([[0, 0]]), '+', 0.24);
    chg(f, sh.filter((p, i) => i >= 24).concat([[0, 0]]), '-', 0.18);
    f.poly(sh.slice(0, -1));
    f.dot(0, 0, 2.2); put(f, 0, 0, 'O', ['bl', 'l', 'b'], 4, 'small');
    const P0 = [210, -70];
    if (o.vectors !== false) {
      const sp = [16, -18];
      varr(f, 0, 0, sp[0], sp[1], { cls: 'thin', hs: 5 }); f.dot(sp[0], sp[1], 2.2);
      put(f, sp[0], sp[1], "\\mathbf r'", ['tr', 'r', 't'], 4, 'small');
      varr(f, 0, 0, P0[0] - 4, P0[1] + 1.3, { cls: 'thin', hs: 6 });
      put(f, P0[0] * 0.55, P0[1] * 0.55, '\\mathbf r', ['tl', 't', 'b'], 5, 'small');
      ang(f, [0, 0], 30, Math.atan2(-P0[1], P0[0]) / D, Math.atan2(-sp[1], sp[0]) / D, '\\alpha');
    }
    f.dot(P0[0], P0[1], 2.8); put(f, P0[0], P0[1], 'P', ['r', 'tr', 't'], 5);
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // octant patches on a ball (oblique). oct: [[sx, sy, sz, sign]]
  function octBall(o = {}) {
    const g = fig3(), Rr = o.R ?? 62;
    const arc = (fn) => { const a = []; for (let k = 0; k <= 12; k++) { const t = k / 12 * PI / 2; a.push(g.p3(...fn(t))); } return a; };
    for (const [sx, sy, sz, sg] of (o.oct || [])) {
      const xz = arc((t) => [sx * Rr * Math.cos(t), 0, sz * Rr * Math.sin(t)]);
      const zy = arc((t) => [0, sy * Rr * Math.sin(t), sz * Rr * Math.cos(t)]);
      const yx = arc((t) => [sx * Rr * Math.sin(t), sy * Rr * Math.cos(t), 0]);
      chg(g, xz.concat(zy, yx), sg, sg === '+' ? 0.32 : 0.24);
      for (const pts of [xz, zy, yx]) g.pl(pts, { cls: 'thin' });
    }
    const O = g.p3(0, 0, 0);
    const outline = []; for (let k = 0; k <= 72; k++) outline.push([O[0] + Rr * Math.cos(k * 5 * D), O[1] - Rr * Math.sin(k * 5 * D)]);
    g.pl(outline, { cls: 'dim dash thin' });
    ax3(g, Rr + 38);
    if (o.extra) o.extra(g, Rr);
    return widen(g).svg();
  }

  // ================================================================ delta-function figures
  // radial field arrows around the origin; fn(r) = signed radial magnitude (px units); circles at radii rs with labels
  function radial(o = {}) {
    const f = PF.fig();
    const W = o.W ?? 120;
    const rs = o.rs || [];
    for (const [rr, lab, cls] of rs) f.circle(0, 0, rr, { cls: cls || 'dash dim' });
    f.field((x, y) => { const r = Math.hypot(x, y); if (r < 14 || r > W) return null; for (const [rr] of rs) if (Math.abs(r - rr) < 10) return null; const m = o.fn(r); if (!m) return [0, 0]; return [m * x / r, m * y / r]; }, [-W, -W, W, W], o.n ?? 9, o.n ?? 9, { len: 14, mag: o.mag !== false });
    f.dot(0, 0, 2.6);
    if (o.olab !== false) put(f, 0, 0, o.olab || 'O', ['bl', 'br', 'tl'], 5, 'small');
    for (const [rr, lab, , deg] of rs) if (lab) { const p = pol(rr, deg ?? -35); put(f, p[0], p[1], lab, sidesToward(deg ?? -35), 5, 'small'); }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }
  // concentric regions (no field drawn): radii [[px, lab]], with region labels [[tex, r, deg]]
  function rings(o = {}) {
    const f = PF.fig();
    for (const [rr, , cls] of o.rs) f.circle(0, 0, rr, { cls: cls || '' });
    if (o.tint) for (const [r0, r1v, sg, op] of o.tint) chg(f, f.arcPts(0, 0, r1v, r1v, 0, 360).concat(r0 ? f.arcPts(0, 0, r0, r0, 360, 0) : []), sg, op);
    f.dot(0, 0, 2.6);
    for (const [rr, lab, , deg] of o.rs) if (lab) { const p = pol(rr, deg ?? 0); dimL(f, 0, 0, p[0], p[1], lab, ['t', 'b', 'l', 'r']); }
    for (const [tex, rr, deg] of (o.labs || [])) { const p = pol(rr, deg); put(f, p[0], p[1], tex, ['r', 'l', 't', 'b'], 2, 'small'); }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }
  // 1-D axis with delta spikes: sp = [[x(px), lab]]
  function spikes(o = {}) {
    const f = PF.fig();
    const x0 = o.x0 ?? -130, x1 = o.x1 ?? 150;
    axis(f, x0, 0, x1, 0, o.xl || 'x', ['r', 'br']);
    for (const [x, lab, h] of (o.sp || [])) { f.arrow(x, 0, x, -(h ?? 70), { cls: 'thick', hs: 7 }); if (lab) put(f, x, -(h ?? 70), lab, ['t', 'tr', 'tl'], 5, 'small'); }
    for (const [x, lab] of (o.ticks || [])) { f.line(x, -4, x, 4, { cls: 'dim' }); put(f, x, 4, lab, ['b', 'br', 'bl'], 4, 'small accent'); }
    if (o.curve) { const pts = []; for (let x = x0 + 4; x <= x1 - 10; x += 3) pts.push([x, -o.curve(x)]); f.pl(pts, { cls: 'curve dim' }); if (o.clab) put(f, pts[pts.length - 1][0], pts[pts.length - 1][1], o.clab, ['tr', 't', 'r', 'tl'], 5, 'small'); }
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }
  // a point r0 in 3-D (oblique axes) with dashed projections and an optional dashed sphere (integration region) of screen radius Rs
  function point3(o = {}) {
    const g = fig3(), u = o.u ?? 30;
    const [x, y, z] = o.r0;
    if (o.Rs) { const O = g.p3(0, 0, 0); const c = []; for (let k = 0; k <= 72; k++) c.push([O[0] + o.Rs * Math.cos(k * 5 * D), O[1] - o.Rs * Math.sin(k * 5 * D)]); g.pl(c, { cls: 'dash dim' }); }
    ax3(g, o.L ?? 120);
    const P0 = g.p3(x * u, y * u, z * u), F = g.p3(x * u, y * u, 0);
    if (x || y) { const A = g.p3(x * u, 0, 0), B = g.p3(0, y * u, 0); if (x) dl(g, A[0], A[1], F[0], F[1], { cls: 'dim dash thin' }); if (y && x) dl(g, B[0], B[1], F[0], F[1], { cls: 'dim dash thin' }); }
    if (z) dl(g, F[0], F[1], P0[0], P0[1], { cls: 'dim dash thin' });
    g.dot(P0[0], P0[1], 3);
    put(g, P0[0], P0[1], o.lab || '\\mathbf r_0', ['tr', 'r', 't', 'tl'], 6);
    for (const [v, lab, which] of (o.ticks || [])) { const T = which === 'x' ? g.p3(v * u, 0, 0) : which === 'y' ? g.p3(0, v * u, 0) : g.p3(0, 0, v * u); g.dot(T[0], T[1], 1.8); put(g, T[0], T[1], lab, which === 'z' ? ['l', 'tl'] : ['b', 'bl', 'br'], 4, 'small accent'); }
    if (o.Rs && o.Rlab) { const O = g.p3(0, 0, 0); const p = pol(o.Rs, 205, O); put(g, p[0], p[1], o.Rlab, ['bl', 'l', 'b'], 5, 'small'); }
    if (o.extra) o.extra(g, u);
    return widen(g).svg();
  }
  // 2-D cross-section of a long cylinder s = a with a line charge on the axis
  function cyl2(o = {}) {
    const f = PF.fig(), A = o.a ?? 60;
    if (o.tint) chg(f, f.arcPts(0, 0, A, A, 0, 360), o.tint, 0.18);
    f.circle(0, 0, A, { cls: o.cls || '' });
    f.charge(0, 0, { q: o.q ?? '+', r: 5 });
    axis(f, A + 8, 0, A + 44, 0, 'x', ['r', 'br']);
    f.line(-A - 30, 0, -9, 0, { cls: 'dim dash thin' }); f.line(9, 0, A - 2, 0, { cls: 'dim dash thin' });
    f.line(0, A + 30, 0, 9, { cls: 'dim dash thin' }); f.line(0, -9, 0, -A + 2, { cls: 'dim dash thin' });
    axis(f, 0, -A - 8, 0, -A - 40, 'y', ['t', 'tr']);
    const p = pol(A, 225); dimL(f, 0, 0, p[0], p[1], 'a', ['l', 'b', 't']);
    if (o.lab) put(f, 0, 0, o.lab, ['tr', 'r'], 10, 'small');
    if (o.extra) o.extra(f, A);
    return widen(f).svg();
  }
  // field point P at (r, theta) with the z axis and the origin only (nothing about the source is drawn)
  function polarPt(o = {}) {
    const f = PF.fig();
    axis(f, 0, 40, 0, -120, 'z', ['t', 'tr']);
    f.dot(0, 0, 3); put(f, 0, 0, 'O', ['l', 'bl', 'tl'], 6, 'small');
    const p = pol(110, 40); dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); f.dot(p[0], p[1], 2.8);
    put(f, p[0], p[1], 'P', ['tr', 'r', 't'], 5);
    ang(f, [0, 0], 34, 40, 90, '\\theta');
    put(f, p[0] * 0.5, p[1] * 0.5, 'r', ['br', 'b', 'r'], 4, 'small');
    if (o.lab) put(f, 60, 40, o.lab, ['r', 'br', 'b'], 6, 'small');
    return widen(f).svg();
  }
  // a cube [0,a]^3 with the origin at a corner (oblique)
  function cube(o = {}) {
    const g = PF.fig({ proj: { ox: 0, oy: 0, s: 1 } }), a = 80;
    g.box3(a, a, a);
    g.dot(...g.p3(0, 0, 0), 3);
    ax3(g, 0, ['x', 'y', 'z'], [a + 40, a + 40, a + 40]);
    const O = g.p3(0, 0, 0); put(g, O[0], O[1], o.olab || 'O', ['tl', 'l', 'bl'], 6, 'small');
    const Y = g.p3(0, a, 0); put(g, Y[0], Y[1], 'a', ['b', 'br'], 6, 'small accent');
    if (o.extra) o.extra(g, a);
    return widen(g).svg();
  }
  // parallel sheets (edge-on vertical lines) at screen x positions with labels
  function sheets(o = {}) {
    const f = PF.fig();
    axis(f, o.x0 ?? -120, 0, o.x1 ?? 130, 0, 'x', ['r', 'br']);
    for (const [x, sg, lab] of o.sh) {
      if (sg) stint(f, [[x, -60], [x, 60]], sg, 0.7, 5);
      f.line(x, -60, x, 60, { cls: 'thin' });
      if (lab) put(f, x, -60, lab, ['t', 'tr', 'tl'], 5, 'small');
    }
    for (const [x, lab] of (o.ticks || [])) put(f, x, 4, lab, ['b', 'br', 'bl'], 6, 'small accent');
    if (o.slab) chg(f, [[o.slab[0], -60], [o.slab[1], -60], [o.slab[1], 60], [o.slab[0], 60]], o.slab[2], 0.16);
    if (o.extra) o.extra(f);
    return widen(f).svg();
  }

  // ===================================================================================================
  //  Lesson 1: multipole concepts
  // ===================================================================================================
  const F_BLOB = blob();
  const F_BLOB_PLAIN = blob({ vectors: false });
  const F_PAIR_DIAG = pts2({ ch: [[1, 1, '+', '+q', 'tr'], [-1, -1, '-', '-q', 'bl']], ticks: [[1, 'a'], [-1, '-a'], [1, 'a', 'y'], [-1, '-a', 'y']], grid: [[1, 1], [-1, -1]] });
  const F_SQUARE = pts2({ ch: [[1, 1, '+', '+q'], [-1, 1, '-', '-q'], [-1, -1, '+', '+q'], [1, -1, '-', '-q']], ax: ['x', 'y'], ticks: [[1, 'a'], [1, 'a', 'y']] });
  const F_RING_COS = ring3({ dens: Math.cos, lab: md`\lambda = \lambda_0\cos\phi`, phiAt: 50, Rlab: true });
  const F_RING_SIN = ring3({ dens: Math.sin, lab: md`\lambda = \lambda_0\sin\phi`, phiAt: 50, Rlab: true });
  const F_SYMXY = (() => {
    const g = fig3(), Rr = 60;
    // a body symmetric under x -> -x and y -> -y but lopsided in z: denser + charge low, - charge high
    const O = g.p3(0, 0, 0);
    chg(g, f2(O, Rr, 0, 180), '-', 0.16); chg(g, f2(O, Rr * 0.8, 180, 360, 0.7), '+', 0.3);
    function f2(c, r, a0, a1, sq = 1) { const pts = []; for (let k = 0; k <= 30; k++) { const t = (a0 + (a1 - a0) * k / 30) * D; pts.push([c[0] + r * Math.cos(t), c[1] - r * Math.sin(t) * sq]); } return pts.concat([[c[0], c[1]]]); }
    const out = []; for (let k = 0; k <= 72; k++) { const t = k * 5 * D; out.push([O[0] + Rr * Math.cos(t), O[1] - Rr * Math.sin(t) * (t < PI ? 1 : 0.7)]); }
    g.pl(out);
    ax3(g, Rr + 40);
    return widen(g).svg();
  })();
  const F_SHELL_SIG = shell({ sig: (t) => Math.cos(t) * 0.8 + 0.2, lab: md`\sigma(\theta)`, Rdim: 200 });
  const F_ORIGIN_SHIFT = (() => {
    const f = PF.fig();
    const sh = []; for (let i = 0; i <= 40; i++) { const t = i / 40 * 2 * PI; const rr = 34 + 5 * Math.sin(2 * t); sh.push([30 + rr * Math.cos(t), -20 - rr * Math.sin(t) * 0.8]); }
    chg(f, sh, '+', 0.22); f.poly(sh.slice(0, -1));
    f.dot(-80, 50, 2.8); put(f, -80, 50, 'O', ['bl', 'l', 'b'], 5);
    f.dot(80, 60, 2.8); put(f, 80, 60, "O'", ['br', 'r', 'b'], 5);
    varr(f, -80, 50, 76, 59.7, { cls: 'thin', hs: 6 }); put(f, 0, 55, '\\mathbf a', ['b', 'bl', 'br'], 6, 'small');
    put(f, 30, -20, 'Q \\ne 0', ['tr', 't', 'r'], 40, 'small');
    return widen(f).svg();
  })();
  const F_BALL_HEMI = ball({ kind: 'hemi', labs: [[md`+\rho_0`, 35], [md`-\rho_0`, -35]], Rdim: 200 });
  const F_BALL_COS = ball({ kind: 'cos', labs: [[md`\rho_0\cos\theta`, 35]], Rdim: 200 });
  const F_HEMI_VS_COS = PF.row([{ svg: ball({ kind: 'hemi', labs: [[md`+\rho_0`, 35], [md`-\rho_0`, -35]] }), cap: '(1) $\\pm\\rho_0$ halves' }, { svg: ball({ kind: 'cos', labs: [[md`\rho_0\cos\theta`, 35]] }), cap: '(2) $\\rho_0\\cos\\theta$' }]).svg;
  const F_ROD = rod({ lab: md`\lambda = \lambda_0 z/L` });
  const F_SHELL_K1 = shell({ sig: (t) => (1 + Math.cos(t)) / 2, lab: md`\sigma = k(1+\cos\theta)`, Rdim: 200 });
  const F_DIP_SPHERE = dip({ extra: (f) => { f.circle(0, 0, 80, { cls: 'dim dash thin' }); } , zTop: 120 });
  const F_DIP_E90 = dipInField({ al: 90, alab: false, extra: (f) => { f.pl(f.arcPts(0, 0, 22, 22, 0, 90), { cls: 'dim thin' }); put(f, 16, -16, '90^\\circ', ['tr', 'r'], 6, 'small'); } });
  const F_DIP_E30 = dipInField({ al: 35 });
  const F_PTS_SHIFT = pts2({ ch: [[0, 1, '+', '+2q', 'r'], [0, -1, '-', '-q', 'r']], ticks: [[1, 'a', 'y'], [-1, '-a', 'y']], xr: [-1.6, 1.8], yr: [-2, 2.6] });
  const F_CROSS = pts2({ ch: [[1, 0, '+', '+q', 'b'], [-1, 0, '+', '+q', 'b'], [0, 1, '-', '-q', 'r'], [0, -1, '-', '-q', 'r']], ax: ['x', 'y'], ticks: [[1, 'a', 'x']], extra: (f) => { f.circle(0, 0, 4.5, { cls: 'dim' }); f.dot(0, 0, 1.6); put(f, 0, 0, md`z\ (\text{out of page})`, ['bl', 'tl'], 26, 'small'); } });
  const F_DIP_THETA = dip({ pts: [[95, 50, 'P', 28]], zTop: 120 });
  const F_Q_DIP_PERP = (() => {
    const f = PF.fig();
    f.charge(0, 0, { q: '+', lab: 'q', at: 'l' });
    f.line(8, 0, 150, 0, { cls: 'dim dash thin' });
    f.arrow(160, 16, 160, -16, { cls: 'thick', hs: 7 });
    put(f, 160, -16, '\\mathbf p', ['r', 'tr'], 6);
    dimL(f, 0, 30, 160, 30, 'r', ['b']);
    axis(f, 196, 0, 236, 0, 'x', ['r']);
    axis(f, 196, 0, 196, -40, 'y', ['t']);
    return widen(f).svg();
  })();
  const F_Q_DIP_PAR = (() => {
    const f = PF.fig();
    f.charge(0, 0, { q: '+', lab: 'q', at: 'l' });
    f.line(8, 0, 140, 0, { cls: 'dim dash thin' });
    f.arrow(144, 0, 178, 0, { cls: 'thick', hs: 7 });
    put(f, 178, 0, '\\mathbf p', ['r', 'tr'], 6);
    dimL(f, 0, 24, 161, 24, 'r', ['b']);
    return widen(f).svg();
  })();
  const F_DIP_FLIP = dipInField({ al: 0, alab: false });
  const F_SHELL2R = PF.row([{ svg: shell({ sig: (t) => Math.cos(t), R: 34 }), cap: 'radius $R$' }, { svg: shell({ sig: (t) => Math.cos(t), R: 68 }), cap: 'radius $2R$' }]).svg;
  const F_ROD_RING = PF.row([{ svg: rod({ kind: 'uni', lab: 'Q' }), cap: 'rod, $-L<z<L$' }, { svg: ring3({ dens: () => 0.8, lab: 'Q', R: 55 }), cap: 'ring in the $xy$-plane' }]).svg;
  const F_QUAD_V = (() => {
    const f = PF.fig();
    f.circle(0, 0, 26, { cls: 'dim dash' });
    axis(f, 0, -30, 0, -110, 'z', ['t', 'tr']);
    f.line(0, 30, 0, 50, { cls: 'dim dash thin' });
    const p = pol(100, 40); dl(f, 0, 0, p[0], p[1], { cls: 'dim dash thin' }); f.dot(p[0], p[1], 2.8);
    put(f, p[0], p[1], md`V \approx \dfrac{A(3\cos^2\theta-1)}{r^3}`, ['r', 'tr', 'br'], 6, 'small');
    ang(f, [0, 0], 40, 40, 90, '\\theta');
    return widen(f).svg();
  })();
  const F_PAIR_AXIS = pts2({ ch: [[0, 0.5, '+', '+q', 'l'], [0, -0.5, '-', '-q', 'l']], ticks: [[0.5, 'd/2', 'y']], P: [0, 2.3, 'P'], xr: [-1.4, 1.6], yr: [-1.2, 2.9] });
  const F_HEMISHELL = ball({ kind: 'hemishell', labs: [[md`+\rho_0`, 35], [md`-\rho_0`, -35]], extra: (f, Rr) => { const p = pol(Rr / 2, 200); dimL(f, 0, 0, p[0], p[1], 'R/2', ['b', 'bl', 'l']); } });
  const F_BALL_Q = ball({ kind: 'hemi', labs: [[md`+\rho_0`, 145], [md`-\rho_0`, -35]], zTop: 150, noZ: true, extra: (f, Rr) => { f.charge(0, -Rr - 70, { q: '+', lab: 'q', at: 'l' }); f.line(0, -Rr - 2, 0, -Rr - 62, { cls: 'dim dash thin' }); f.line(Rr + 4, 0, Rr + 30, 0, { cls: 'dim thin' }); f.line(10, -Rr - 70, Rr + 30, -Rr - 70, { cls: 'dim thin' }); dimL(f, Rr + 22, 0, Rr + 22, -Rr - 70, 'D', ['r']); } });
  const F_RING_E = ring3({ dens: Math.cos, lab: md`\lambda_0\cos\phi`, extra: (g) => { for (const y of [150, 205]) { const a = g.p3(0, y, -30), b = g.p3(0, y, 40); g.arrow(a[0], a[1], b[0], b[1], { cls: 'dim', hs: 6 }); } const t = g.p3(0, 205, 40); put(g, t[0], t[1], '\\mathbf E_0', ['tr', 't', 'r'], 5); } });
  const F_PM_Q = pts2({ ch: [[0, 0, '+', '+Q', 'r'], [0, 1.5, '-', '-Q', 'r']], ticks: [[1.5, 'b', 'y']], xr: [-1.4, 1.6], yr: [-1, 2.6] });
  const F_TWO_SIDE = twoDip({ mode: 'side' });
  const F_TWO_AXIS = twoDip({ mode: 'axis' });
  const F_TWO_FREE = twoDip({ mode: 'side', free: true });
  const F_FOUR = PF.row([
    { svg: ball({ kind: 'hemi', R: 40, noZ: true }), cap: '(A)' }, { svg: ball({ kind: 'cos', R: 40, noZ: true }), cap: '(B)' },
    { svg: pts2({ ch: [[0, 0.6, '+'], [0, -0.6, '-']], xr: [-0.8, 0.8], yr: [-1, 1.4], u: 34 }), cap: '(C)' }, { svg: shell({ sig: (t) => (t < PI / 2 ? 1 : -1), R: 38 }), cap: '(D)' }]).svg;
  const F_BALL_AXIS2R = ball({ kind: 'hemi', P: [120, 0], Plab: 'P', labs: [[md`+\rho_0`, 145], [md`-\rho_0`, -145]], zTop: 150, extra: (f, Rr) => { f.line(Rr + 4, 0, Rr + 30, 0, { cls: 'dim thin' }); f.line(6, -120, Rr + 30, -120, { cls: 'dim thin' }); dimL(f, Rr + 22, 0, Rr + 22, -120, '2R', ['r']); } });
  const F_ISO = blob({ vectors: false, extra: (f) => { f.circle(0, 0, 150, { cls: 'dim dash thin' }); } });
  const F_OCT_ALT = octBall({ oct: [[1, 1, 1, '+'], [1, -1, 1, '-'], [1, 1, -1, '-'], [1, -1, -1, '+']] });
  const F_COND_Q = (() => {
    const f = PF.fig();
    f.hatchBand(f.arcPts(0, 0, 40, 40, 0, 360)); f.circle(0, 0, 40, { cls: 'thick' });
    f.charge(200, 0, { q: '+', lab: 'q', at: 'r' });
    f.line(42, 0, 192, 0, { cls: 'dim dash thin' });
    dimL(f, 0, 56, 200, 56, 'D', ['b']);
    put(f, -28, -28, md`\text{neutral}`, ['tl', 'l', 't'], 6, 'small');
    const p = pol(40, 120); dimL(f, 0, 0, p[0], p[1], 'R', ['l', 'tl', 't']);
    return widen(f).svg();
  })();

  const L_MPC = {
    id: 'uD-mp-concepts', title: 'Multipoles: concept ladder',
    steps: [
      RF(md`
        ### Level 1: recognize

        Far from a localized charge distribution, expand $1/\srm$ in powers of $r'/r$. Griffiths 3.4 gives

        $$V(\vb r) = \frac{1}{4\pi\varepsilon_0}\left[\frac{Q}{r} + \frac{\vb p\cdot\uv r}{r^2} + \frac{1}{r^3}\int r'^2P_2(\cos\alpha)\,\rho\,d\tau' + \cdots\right]$$

        with $Q = \int\rho\,d\tau'$ (monopole), $\vb p = \int\vb r'\rho\,d\tau'$ (dipole moment, units C·m), and $\alpha$ the angle between $\vb r$ and $\vb r'$. The $\ell$-th term goes as $1/r^{\ell+1}$, its field as $1/r^{\ell+2}$. Each term is smaller than the one before by about $d/r$, where $d$ is the size of the object.

        [[fig:exp]]

        !!key The first nonzero moment wins far away
            Find the lowest $\ell$ whose moment is nonzero. That term alone sets how fast $V$ and $\vb E$ fall off. For two point charges, $\vb p$ points from $-q$ to $+q$.
      `, { exp: { svg: F_BLOB, cap: 'Source point $\\mathbf r\'$ inside the distribution, field point $P$ at $\\mathbf r$, angle $\\alpha$ between them.' } }),

      Q(md`The object in the figure is neutral ($Q = 0$) and has $\vb p\ne0$. Far away, how does $V$ fall off?`,
        [md`$1/r$`, md`$1/r^2$`, md`$1/r^3$`, md`$e^{-r/d}$`], 1,
        [md`$1/r$ is the monopole term, and its coefficient is $Q = 0$.`, null, md`$1/r^3$ is the next term (quadrupole) or the dipole's **field**. The dipole **potential** is $1/r^2$.`, md`No multipole term decays exponentially; that happens only with screening by mobile charge.`],
        md`$Q = 0$ kills the $1/r$ term, and $\vb p\ne0$ makes the $1/r^2$ term the leading one: $V\approx\dfrac{\vb p\cdot\uv r}{4\pi\varepsilon_0r^2}$.`,
        { figHtml: F_BLOB_PLAIN }),

      Q(md`$+q$ sits at $(x,z) = (a, a)$ and $-q$ at $(-a,-a)$. What is $\vb p$?`,
        [md`$2qa(\hat{\mathbf x} + \hat{\mathbf z})$`, md`$-2qa(\hat{\mathbf x} + \hat{\mathbf z})$`, md`$qa(\hat{\mathbf x} + \hat{\mathbf z})$`, md`$0$, because $Q = 0$`], 0,
        [null, md`Sign flipped: $\vb p$ points from $-q$ toward $+q$, here up and to the right.`, md`$\sum q_i\vb r_i = q(a,a) + (-q)(-a,-a) = 2qa(1,1)$. Both charges contribute; you counted one.`, md`$Q = 0$ means $\vb p$ is the same about every origin, not that it is zero.`],
        md`$\vb p = \sum q_i\vb r_i = q\,a(\hat{\mathbf x} + \hat{\mathbf z}) + (-q)(-a)(\hat{\mathbf x} + \hat{\mathbf z}) = 2qa(\hat{\mathbf x} + \hat{\mathbf z})$. Magnitude $2\sqrt2\,qa$ = charge times separation ($2\sqrt2\,a$), pointing from $-q$ to $+q$.`,
        { figHtml: F_PAIR_DIAG }),

      Q(md`Four charges sit on the corners of a square, alternating in sign. Far away, how does the leading term of $V$ fall off?`,
        [md`$1/r$`, md`$1/r^2$`, md`$1/r^3$`, md`It is exactly zero everywhere`], 2,
        [md`$Q = q - q + q - q = 0$.`, md`$\vb p = q[(a,a) - (-a,a) + (-a,-a) - (a,-a)] = q(0,0) = 0$: each diagonal pair cancels.`, null, md`$V$ is zero on the $z$-axis and on the lines $x = 0$, $y = 0$ by symmetry, but not everywhere: near a $+q$ corner it is clearly positive.`],
        md`$Q = 0$ and $\vb p = 0$, so the leading term is the quadrupole, $V\propto1/r^3$. Two dipoles pointing opposite ways, side by side, make a quadrupole.`,
        { figHtml: F_SQUARE }),

      Q(md`What are the SI units of the quadrupole coefficient $\int r'^2P_2(\cos\alpha)\,\rho\,d\tau'$?`,
        [md`C`, md`C·m`, md`C/m²`, md`C·m²`], 3,
        [md`That is the monopole $Q$.`, md`That is the dipole moment.`, md`That is a surface density.`, null],
        md`$\rho\,d\tau'$ is a charge, and $r'^2$ adds m²; $P_2$ is a pure number. In general the $\ell$-th moment has units C·m$^\ell$, so that the term $\dfrac{(\text{C·m}^\ell)}{4\pi\varepsilon_0r^{\ell+1}}$ always has the units of $Q/(4\pi\varepsilon_0r)$, volts.`,
        { figHtml: F_BLOB }),

      RF(md`
        ### Level 2: set up

        To compute $\vb p = \int\vb r'\,dq$, write the position of the source point in Cartesian unit vectors (they are constant, so they come out of the integral):

        $$\vb r' = r'(\sin\theta'\cos\phi'\,\hat{\mathbf x} + \sin\theta'\sin\phi'\,\hat{\mathbf y} + \cos\theta'\,\hat{\mathbf z})$$

        and pick $dq$: $\lambda R\,d\phi'$ on a ring, $\sigma R^2\sin\theta'\,d\theta'\,d\phi'$ on a shell, $\rho\,r'^2\sin\theta'\,dr'\,d\theta'\,d\phi'$ in a volume.

        Before integrating, use symmetry. If $\rho$ is even under $x\to-x$, then $p_x = \int x'\rho\,d\tau' = 0$ (odd integrand). Same for $y$ and $z$.

        !!trap The origin matters when $Q\ne0$
            Moving the origin by $\vb a$ replaces every $\vb r'$ by $\vb r' - \vb a$, so $\vb p\to\vb p - Q\vb a$. Only for a neutral object is $\vb p$ a property of the object alone.
      `),

      Q(md`A ring of radius $R$ in the $xy$-plane carries $\lambda = \lambda_0\cos\phi$. Which integral is $\vb p$?`,
        [md`$\displaystyle\int_0^{2\pi}R\,\lambda_0\cos\phi'\,d\phi'\;\hat{\mathbf x}$`,
          md`$\displaystyle\int_0^{2\pi}R(\cos\phi'\,\hat{\mathbf x} + \sin\phi'\,\hat{\mathbf y})\,\lambda_0\cos\phi'\,R\,d\phi'$`,
          md`$\displaystyle\int_0^{2\pi}R(\cos\phi'\,\hat{\mathbf x} + \sin\phi'\,\hat{\mathbf y})\,\lambda_0\cos\phi'\,d\phi'$`,
          md`$\displaystyle\int_0^{2\pi}R\,\hat{\mathbf z}\,\lambda_0\cos\phi'\,R\,d\phi'$`], 1,
        [md`That is the total charge $Q$ (and it is $0$), with a unit vector stuck on. The lever arm $\vb r'$ is missing.`, null, md`$dl = R\,d\phi'$, not $d\phi'$: one factor of $R$ is missing, so the units come out C instead of C·m.`, md`The ring lies in the $xy$-plane: $\vb r'$ has no $z$-component there.`],
        md`$\vb p = \int\vb r'\lambda\,dl$ with $\vb r' = R(\cos\phi'\,\hat{\mathbf x} + \sin\phi'\,\hat{\mathbf y})$ and $dl = R\,d\phi'$. The $\hat{\mathbf y}$ part has $\int\sin\phi'\cos\phi'\,d\phi' = 0$, the $\hat{\mathbf x}$ part $\int\cos^2\phi' = \pi$: $\vb p = \pi R^2\lambda_0\,\hat{\mathbf x}$.`,
        { figHtml: F_RING_COS }),

      Q(md`A charge distribution satisfies $\rho(-x,y,z) = \rho(x,y,z)$ and $\rho(x,-y,z) = \rho(x,y,z)$, but has no symmetry under $z\to-z$. Which components of $\vb p$ can be nonzero?`,
        [md`$p_x$, $p_y$ and $p_z$`, md`$p_x$ and $p_y$`, md`None`, md`$p_z$ only`], 3,
        [md`$p_x = \int x'\rho\,d\tau'$ has an odd integrand when $\rho$ is even in $x$, so it vanishes. Same for $p_y$.`, md`Backwards: the symmetric directions are exactly the ones whose components vanish.`, md`Nothing forces $p_z = 0$: more $+$ charge up top than below gives $p_z>0$.`, null],
        md`Even in $x$ kills $p_x$; even in $y$ kills $p_y$. Only $p_z$ survives, and it is nonzero whenever the $+$ and $-$ charge sit at different heights, as in the picture.`,
        { figHtml: F_SYMXY }),

      Q(md`A thin shell of radius $R$ carries $\sigma(\theta)$. Which integral is $p_z$?`,
        [md`$\displaystyle\int\sigma(\theta')\,R^2\sin\theta'\,d\theta'\,d\phi'$`, md`$\displaystyle\int R\,\sigma(\theta')\,R^2\sin\theta'\,d\theta'\,d\phi'$`, md`$\displaystyle\int R\cos\theta'\,\sigma(\theta')\,R^2\sin\theta'\,d\theta'\,d\phi'$`, md`$\displaystyle\int R\cos\theta'\,\sigma(\theta')\,R^2\,d\theta'\,d\phi'$`], 2,
        [md`That is $Q$.`, md`That uses $|\vb r'| = R$ instead of its $z$-component $R\cos\theta'$.`, null, md`The area element on a sphere is $R^2\sin\theta'\,d\theta'\,d\phi'$; the $\sin\theta'$ is missing.`],
        md`$p_z = \int z'\,dq$ with $z' = R\cos\theta'$ and $dq = \sigma R^2\sin\theta'\,d\theta'\,d\phi'$. Substituting $u = \cos\theta'$ turns it into $2\pi R^3\int_{-1}^{1}u\,\sigma\,du$.`,
        { figHtml: F_SHELL_SIG }),

      Q(md`An object has total charge $Q\ne0$ and dipole moment $\vb p$ about $O$. What is its dipole moment about $O'$, located at $\vb a$ (measured from $O$)?`,
        [md`$\vb p + Q\vb a$`, md`$\vb p - Q\vb a$`, md`$\vb p$`, md`$Q\vb a$`], 1,
        [md`Sign: positions measured from $O'$ are $\vb r' - \vb a$, so the shift subtracts.`, null, md`That holds only when $Q = 0$.`, md`That drops the original $\vb p$ and has the wrong sign. Test it on a point charge $Q$ sitting at $O$: $\vb p = 0$ about $O$, and about $O'$ its position is $-\vb a$, so $\vb p' = -Q\vb a$.`],
        md`$\vb p' = \int(\vb r' - \vb a)\rho\,d\tau' = \vb p - Q\vb a$. Choosing $\vb a = \vb p/Q$ (the "center of charge") makes $\vb p' = 0$; about that point the far field is monopole plus quadrupole.`,
        { figHtml: F_ORIGIN_SHIFT }),

      RF(md`
        ### Level 3: solve the standard case

        Most moment integrals factor into one radial and one angular integral. The three angular integrals you need over and over:

        $$\int_0^\pi\cos\theta\sin\theta\,d\theta = 0,\qquad \int_0^\pi\cos^2\theta\sin\theta\,d\theta = \frac23,\qquad \int_0^{\pi/2}\cos\theta\sin\theta\,d\theta = \frac12$$

        A fast estimate: $p\approx(\text{charge of each sign})\times(\text{distance between the two centers of charge})$. For the $\pm\rho_0$ ball the halves carry $\pm\frac23\pi R^3\rho_0$ with centers at $\pm\frac38R$, so $p = \frac23\pi R^3\rho_0\cdot\frac34R = \frac{\pi R^4\rho_0}{2}$.

        The dipole field and how a dipole responds to an outside field:

        $$\vb E_{\text{dip}} = \frac{p}{4\pi\varepsilon_0r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\hat{\boldsymbol\theta}\right),\qquad \vb N = \vb p\times\vb E,\qquad U = -\vb p\cdot\vb E,\qquad \vb F = (\vb p\cdot\nabla)\vb E$$

        [[fig:hemi]]
      `, { hemi: { svg: F_BALL_HEMI, cap: 'The Spring 2026 exam ball: $+\\rho_0$ in the northern half, $-\\rho_0$ in the southern half.' } }),

      Q(md`Ball (1) has $\pm\rho_0$ halves; ball (2), the same size, has $\rho = \rho_0\cos\theta$. What is $p_{(2)}/p_{(1)}$? (Predict before computing: $|\cos\theta|\le1$.)`,
        [md`$1$`, md`$\dfrac32$`, md`$\dfrac23$`, md`$\dfrac12$`], 2,
        [md`$|\rho_0\cos\theta|<\rho_0$ almost everywhere, so ball (2) has less charge in each half; it can't match ball (1).`, md`Larger than 1 is impossible for the same reason.`, null, md`Close, but the angular integrals give $\frac23$: $\int_0^\pi\cos^2\theta\sin\theta\,d\theta = \frac23$ against $2\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta = 1$.`],
        md`$p_{(2)} = 2\pi\rho_0\dfrac{R^4}{4}\cdot\dfrac23 = \dfrac{\pi R^4\rho_0}{3}$ and $p_{(1)} = 2\pi\rho_0\dfrac{R^4}{4}\cdot1 = \dfrac{\pi R^4\rho_0}{2}$. Ratio $\frac23$. The radial integral is the same, so the ratio is just the ratio of angular integrals, $\int|\cos\theta|\cos\theta\ldots$ vs $\int\cos^2\theta\ldots$.`,
        { figHtml: F_HEMI_VS_COS }),

      Q(md`A rod from $z = -L$ to $z = L$ carries $\lambda = \lambda_0 z/L$. What is $\vb p$?`,
        [md`$0$, because the rod is neutral`, md`$\dfrac{\lambda_0L^2}{3}\hat{\mathbf z}$`, md`$\lambda_0L\,\hat{\mathbf z}$`, md`$\dfrac{2\lambda_0L^2}{3}\hat{\mathbf z}$`], 3,
        [md`Neutral means $Q = 0$; $\vb p$ needs the charge weighted by position, and here $z\lambda\ge0$ everywhere.`, md`That is the integral over half the rod, $\int_0^L z\cdot\lambda_0z/L\,dz$. The bottom half adds the same again: negative charge at negative $z$.`, md`$\lambda_0L$ has units of charge, not C·m.`, null],
        md`$p_z = \int_{-L}^{L}z\,\dfrac{\lambda_0z}{L}\,dz = \dfrac{\lambda_0}{L}\cdot\dfrac{2L^3}{3} = \dfrac{2\lambda_0L^2}{3}$. Each half carries $\pm\lambda_0L/2$ with centers at $\pm\frac23L$: $\frac{\lambda_0L}{2}\cdot\frac43L$ agrees.`,
        { figHtml: F_ROD }),

      Q(md`A shell of radius $R$ carries $\sigma = k(1 + \cos\theta)$ (never negative). What are $Q$ and $\vb p$ about the center?`,
        [md`$Q = 0$, $\vb p = \dfrac{4\pi R^3k}{3}\hat{\mathbf z}$`, md`$Q = 4\pi R^2k$, $\vb p = \dfrac{4\pi R^3k}{3}\hat{\mathbf z}$`, md`$Q = 4\pi R^2k$, $\vb p = 0$, because $\sigma$ never changes sign`, md`$Q = 4\pi R^2k$, $\vb p = \dfrac{16\pi R^3k}{3}\hat{\mathbf z}$`], 1,
        [md`The constant part $k$ is a uniform shell with charge $4\pi R^2k$.`, null, md`A dipole moment doesn't need negative charge: more charge on top than on the bottom gives $p_z>0$ about the center.`, md`The uniform part adds nothing to $\vb p$ about the center (it is symmetric). Only $k\cos\theta$ contributes.`],
        md`Split $\sigma = k + k\cos\theta$. The uniform part gives $Q = 4\pi R^2k$ and no dipole moment about the center. The $\cos\theta$ part gives $Q = 0$ and $p_z = 2\pi R^3k\cdot\frac23 = \frac43\pi R^3k$. Because $Q\ne0$, this $\vb p$ belongs to the center; about the point $z = p/Q = R/3$ it would vanish.`,
        { figHtml: F_SHELL_K1 }),

      Q(md`On a sphere centered on a point dipole $\vb p = p\,\hat{\mathbf z}$, where does $\vb E$ point purely tangentially ($E_r = 0$)?`,
        [md`At the poles, $\theta = 0$ and $\pi$`, md`Nowhere`, md`At $\theta = 54.7^\circ$ and $125.3^\circ$`, md`On the equator, $\theta = 90^\circ$`], 3,
        [md`At the poles $E_\theta\propto\sin\theta = 0$, so the field is purely **radial** there.`, md`$E_r\propto2\cos\theta$ vanishes on the equator.`, md`There $E_z = 0$ (the field is horizontal), but $E_r\ne0$.`, null],
        md`$E_r = \dfrac{2p\cos\theta}{4\pi\varepsilon_0r^3}$ is zero only at $\theta = 90^\circ$. There $\vb E = \dfrac{p}{4\pi\varepsilon_0r^3}\hat{\boldsymbol\theta} = -\dfrac{p}{4\pi\varepsilon_0r^3}\hat{\mathbf z}$: tangential and antiparallel to $\vb p$.`,
        { figHtml: F_DIP_SPHERE }),

      Q(md`A dipole sits at $90^\circ$ to a uniform field $\vb E_0$. What are the magnitude of the torque and the energy $U = -\vb p\cdot\vb E_0$?`,
        [md`$N = pE_0$, $U = 0$`, md`$N = 0$, $U = -pE_0$`, md`$N = pE_0$, $U = -pE_0$`, md`$N = 0$, $U = 0$`], 0,
        [null, md`That is the aligned dipole ($\theta = 0$), the stable equilibrium.`, md`$U = -pE_0\cos90^\circ = 0$, not $-pE_0$.`, md`$|\vb p\times\vb E_0| = pE_0\sin90^\circ$ is the **largest** torque, not zero.`],
        md`$N = pE_0\sin\theta$ is largest at $90^\circ$, and $U = -pE_0\cos\theta = 0$ there. The torque turns $\vb p$ toward $\vb E_0$, lowering $U$ toward $-pE_0$.`,
        { figHtml: F_DIP_E90 }),

      Q(md`What is the net force on a dipole in a **uniform** field $\vb E_0$, for a general orientation?`,
        [md`$pE_0$ along $\vb E_0$`, md`$pE_0\sin\alpha$, perpendicular to $\vb p$`, md`Zero`, md`$qE_0$ on the positive end only`], 2,
        [md`The forces $+q\vb E_0$ and $-q\vb E_0$ on the two ends cancel exactly in a uniform field.`, md`$pE_0\sin\alpha$ is the torque, not a force.`, null, md`Both ends feel a force; they are equal and opposite.`],
        md`$\vb F = (\vb p\cdot\nabla)\vb E_0 = 0$ when $\vb E_0$ is constant. A uniform field only twists a dipole. To push or pull it, the field must change in space: the stronger end wins.`,
        { figHtml: F_DIP_E30 }),

      Q(md`A ring of radius $R$ in the $xy$-plane carries $\lambda = \lambda_0\sin\phi$. What is $\vb p$?`,
        [md`$\pi R^2\lambda_0\,\hat{\mathbf x}$`, md`$\pi R^2\lambda_0\,\hat{\mathbf y}$`, md`$2\pi R^2\lambda_0\,\hat{\mathbf y}$`, md`$0$`], 1,
        [md`That is the $\cos\phi$ ring. Here the positive charge is at $\phi = 90^\circ$, on the $+y$ side.`, null, md`$\int_0^{2\pi}\sin^2\phi\,d\phi = \pi$, not $2\pi$.`, md`$Q = 0$, but $\vb p\ne0$: positive charge on the $+y$ side, negative on the $-y$ side.`],
        md`$p_y = \int R\sin\phi\cdot\lambda_0\sin\phi\cdot R\,d\phi = \pi R^2\lambda_0$; $p_x\propto\int\sin\phi\cos\phi = 0$. Same as the $\cos\phi$ ring, rotated by $90^\circ$.`,
        { figHtml: F_RING_SIN }),

      RF(md`
        !!key Standard moments, to recognize on sight
            | distribution | $Q$ | $\vb p$ (about the center) |
            |---|---|---|
            | $\pm q$ a distance $d$ apart | $0$ | $qd$, from $-q$ to $+q$ |
            | ball, $\pm\rho_0$ halves | $0$ | $\frac12\pi R^4\rho_0\,\hat{\mathbf z}$ |
            | ball, $\rho_0\cos\theta$ | $0$ | $\frac13\pi R^4\rho_0\,\hat{\mathbf z}$ |
            | shell, $k\cos\theta$ | $0$ | $\frac43\pi R^3k\,\hat{\mathbf z}$ |
            | shell, $\pm\sigma_0$ halves | $0$ | $2\pi R^3\sigma_0\,\hat{\mathbf z}$ |
            | ring, $\lambda_0\cos\phi$ | $0$ | $\pi R^2\lambda_0\,\hat{\mathbf x}$ |
            | rod, $\lambda_0z/L$ on $(-L, L)$ | $0$ | $\frac23\lambda_0L^2\,\hat{\mathbf z}$ |

            The powers of $R$ follow from units: a volume density needs $R^4$, a surface density $R^3$, a line density $R^2$.
      `),

      R(md`
        ### Level 4: one twist

        Each question changes one thing about a standard case: a charged object, a moved origin, a non-uniform field, a field point off the axis.
      `),

      Q(md`$+2q$ sits at $z = a$ and $-q$ at $z = -a$. About which point on the $z$-axis is $\vb p = 0$?`,
        [md`$z = a/3$`, md`$z = 3a$`, md`None: with $Q\ne0$ there's no such point`, md`$z = 0$`], 1,
        [md`$p_z$ about the origin is $2qa - q(-a) = 3qa$, and $Q = q$: the point is $p_z/Q = 3a$, not $a/3$.`, null, md`It is the opposite: only when $Q\ne0$ can you always find such a point, $\vb a = \vb p/Q$.`, md`About the origin $p_z = 3qa\ne0$.`],
        md`$\vb p' = \vb p - Q\vb a = 0$ at $a_z = \dfrac{3qa}{q} = 3a$. The "center of charge" of a mixed-sign pair can lie **outside** the charges: the $-q$ pulls it away from the $+2q$, beyond it. Check about $z = 3a$: $2q(a - 3a) + (-q)(-a - 3a) = -4qa + 4qa = 0$.`,
        { figHtml: F_PTS_SHIFT }),

      Q(md`$+q$ sits at $(\pm a, 0, 0)$ and $-q$ at $(0, \pm a, 0)$. What is $V$ on the $z$-axis, exactly?`,
        [md`$\propto1/z^3$, the quadrupole term`, md`$\propto1/z^5$`, md`$\propto1/z$`, md`Exactly $0$ for every $z$`], 3,
        [md`The configuration has a quadrupole moment, but its potential vanishes along $z$; there is no $1/z^3$ term on this line.`, md`Every term vanishes on this line, not just the first few.`, md`$Q = 0$.`, null],
        md`Every point on the $z$-axis is the same distance $\sqrt{z^2+a^2}$ from all four charges, so $V = \dfrac{1}{4\pi\varepsilon_0}\dfrac{2q - 2q}{\sqrt{z^2+a^2}} = 0$. A nonzero quadrupole can still give $V = 0$ along particular directions; read the geometry before expanding.`,
        { figHtml: F_CROSS }),

      Q(md`For a dipole $\vb p = p\,\hat{\mathbf z}$, at what polar angle $\theta$ (between $0$ and $90^\circ$) is $\vb E$ horizontal, perpendicular to $\vb p$?`,
        [md`$45^\circ$`, md`$54.7^\circ$, where $\cos^2\theta = \frac13$`, md`$60^\circ$`, md`$90^\circ$`], 1,
        [md`$E_z\propto3\cos^2\theta - 1 = \frac12$ at $45^\circ$, not zero.`, null, md`$3\cos^2 60^\circ - 1 = -\frac14\ne0$.`, md`On the equator $\vb E\propto-\hat{\mathbf z}$: vertical, antiparallel to $\vb p$.`],
        md`$E_z = E_r\cos\theta - E_\theta\sin\theta\propto2\cos^2\theta - \sin^2\theta = 3\cos^2\theta - 1$. Zero at $\cos\theta = 1/\sqrt3$, $\theta = 54.7^\circ$. Above that cone the field has an upward component, below it downward: that is how the field lines loop back.`,
        { figHtml: F_DIP_THETA }),

      Q(md`A point charge $q$ sits at the origin. A small dipole at $(r, 0, 0)$ points along $+\hat{\mathbf y}$, perpendicular to the line joining them. What is the force on the dipole?`,
        [md`Zero, because $\vb p\perp\vb E$`, md`$\dfrac{qp}{4\pi\varepsilon_0r^3}$ along $-\hat{\mathbf x}$, toward $q$`, md`$\dfrac{qp}{4\pi\varepsilon_0r^3}$ along $+\hat{\mathbf y}$, along $\vb p$`, md`$\dfrac{2qp}{4\pi\varepsilon_0r^3}$ along $-\hat{\mathbf x}$`], 2,
        [md`$\vb p\perp\vb E$ makes the energy $-\vb p\cdot\vb E$ zero, not the force. The force depends on how $\vb E$ changes along $\vb p$.`, md`"Toward $q$" is the answer for a dipole lying along the line to $q$ (and then the size is $\dfrac{2qp}{4\pi\varepsilon_0r^3}$). Here $\vb p$ is perpendicular to that line, and $\vb F = p\,\partial\vb E/\partial y$ points along $\hat{\mathbf y}$.`, null, md`That is the radial (aligned) dipole: $p\,\partial E_x/\partial x = -2qp/(4\pi\varepsilon_0r^3)$.`],
        md`$\vb F = p\,\dfrac{\partial\vb E}{\partial y}$. Moving in $y$ from $(r,0,0)$, $\vb E = \dfrac{q(x,y,z)}{4\pi\varepsilon_0(x^2+y^2+z^2)^{3/2}}$ gains a $y$-component $\dfrac{qy}{4\pi\varepsilon_0r^3}$, so $\vb F = \dfrac{qp}{4\pi\varepsilon_0r^3}\hat{\mathbf y}$. Check with Newton's third law: the dipole's field at $q$ (on the dipole's equator) is $-\dfrac{p}{4\pi\varepsilon_0r^3}\hat{\mathbf y}$, so $q$ feels $-\dfrac{qp}{4\pi\varepsilon_0r^3}\hat{\mathbf y}$ and the dipole the opposite.`,
        { figHtml: F_Q_DIP_PERP }),

      Q(md`A dipole points directly away from a positive point charge $q$ a distance $r$ away. What is the force on it?`,
        [md`$\dfrac{2qp}{4\pi\varepsilon_0r^3}$, toward $q$`, md`$\dfrac{2qp}{4\pi\varepsilon_0r^3}$, away from $q$`, md`Zero: it is aligned with the field`, md`$\dfrac{qp}{4\pi\varepsilon_0r^3}$, toward $q$`], 0,
        [null, md`The near end is $-$, attracted; the far end is $+$, repelled more weakly (farther away). Net: toward $q$.`, md`Aligned means zero torque, not zero force; the field is not uniform.`, md`$\partial_r(1/r^2) = -2/r^3$: the factor 2 is from the derivative.`],
        md`$F_r = p\,\dfrac{\partial E_r}{\partial r} = p\,\dfrac{\partial}{\partial r}\dfrac{q}{4\pi\varepsilon_0r^2} = -\dfrac{2qp}{4\pi\varepsilon_0r^3}$. A dipole aligned with a field is pulled into the stronger field. That is why a charged comb picks up neutral paper bits: the induced dipole is always aligned.`,
        { figHtml: F_Q_DIP_PAR }),

      Q(md`How much work does it take to rotate a dipole slowly from aligned with a uniform $\vb E_0$ to anti-aligned?`,
        [md`$pE_0$`, md`$0$, because the force is zero`, md`$2pE_0$`, md`$-2pE_0$`], 2,
        [md`That gets you from $0^\circ$ to $90^\circ$ only.`, md`The force is zero, but the torque isn't; rotating against a torque takes work.`, null, md`You do positive work against the torque; the energy goes up.`],
        md`$W = U(180^\circ) - U(0^\circ) = (+pE_0) - (-pE_0) = 2pE_0$. Equivalently $\int_0^\pi pE_0\sin\theta\,d\theta = 2pE_0$.`,
        { figHtml: F_DIP_FLIP }),

      Q(md`Two shells carry the same $\sigma = k\cos\theta$, one of radius $R$ and one of radius $2R$. What is $p_{2R}/p_R$?`,
        [md`$2$`, md`$4$`, md`$16$`, md`$8$`], 3,
        [md`The lever arm doubles, but so does each linear dimension of the area.`, md`That counts the area ($\times4$) but forgets the lever arm ($\times2$).`, md`That would be a volume density ($R^4$); a surface density gives $R^3$.`, null],
        md`$p = \frac43\pi R^3k$: area $\times4$, lever arm $\times2$, total $\times8$. Check the power with units: $k$ in C/m² needs $R^3$ to make C·m.`,
        { figHtml: F_SHELL2R }),

      Q(md`A uniform rod ($-L<z<L$) and a uniform ring (radius $R$, in the $xy$-plane) each carry charge $Q>0$. What are the signs of their quadrupole moments $q_2 = \int r'^2P_2(\cos\theta')\,dq$?`,
        [md`Both positive`, md`Both negative`, md`Rod negative, ring positive`, md`Rod $+\frac13QL^2$, ring $-\frac12QR^2$`], 3,
        [md`On the ring $\theta' = 90^\circ$ and $P_2(0) = -\frac12$.`, md`On the rod $\theta' = 0$ or $\pi$ and $P_2(\pm1) = 1$.`, md`Swapped. Charge stretched **along** the axis is positive, charge spread **around** it is negative.`, null],
        md`Rod: $q_2 = \int_{-L}^{L}z^2\cdot1\cdot\dfrac{Q}{2L}dz = \dfrac{QL^2}{3}$ (prolate, positive). Ring: every point has $r' = R$, $\theta' = 90^\circ$, so $q_2 = R^2P_2(0)Q = -\dfrac{QR^2}{2}$ (oblate, negative). The sign of $q_2$ tells you cigar vs pancake.`,
        { figHtml: F_ROD_RING }),

      Q(md`Far from a neutral object, with azimuthal symmetry about $z$, $V\approx\dfrac{A(3\cos^2\theta - 1)}{r^3}$ with $A>0$. Which arrangement fits?`,
        [md`$+q$ at $z = \pm d$, $-2q$ at the origin`, md`$-q$ at $z = \pm d$, $+2q$ at the origin`, md`$+q$ at $z = d$, $-q$ at $z = -d$`, md`$+q$ at $x = \pm d$, $-2q$ at the origin`], 0,
        [null, md`That has $q_2 = -2qd^2<0$: $V<0$ on the axis far away.`, md`That is a dipole, $V\propto\cos\theta/r^2$.`, md`That isn't symmetric about $z$; its potential depends on $\phi$.`],
        md`On the axis $3\cos^2\theta - 1 = 2>0$, so $V>0$ along $\pm z$: the positive charge sits out on the axis. $+q$ at $\pm d$ with $-2q$ at the center gives $q_2 = 2qd^2$, so $A = \dfrac{qd^2}{4\pi\varepsilon_0}$.`,
        { figHtml: F_QUAD_V }),

      Q(md`For $+q$ at $z = d/2$ and $-q$ at $z = -d/2$, compare the exact $V$ at a point $P$ on the $+z$ axis with the dipole approximation $\dfrac{qd}{4\pi\varepsilon_0z^2}$.`,
        [md`Exact is smaller`, md`Exact is larger`, md`They are equal: the quadrupole term vanishes`, md`It depends on the sign of $q$`], 1,
        [md`Expand: $\dfrac{1}{z - d/2} - \dfrac{1}{z + d/2} = \dfrac{d}{z^2 - d^2/4}>\dfrac{d}{z^2}$.`, null, md`The quadrupole vanishes, but the octupole ($\propto1/z^4$) doesn't.`, md`Flipping $q$ flips both sides; the exact one is still larger in magnitude.`],
        md`$V_{\text{exact}} = \dfrac{q}{4\pi\varepsilon_0}\dfrac{d}{z^2 - d^2/4} = \dfrac{qd}{4\pi\varepsilon_0z^2}\left(1 + \dfrac{d^2}{4z^2} + \cdots\right)$. The near charge counts a little more than the dipole term allows for.`,
        { figHtml: F_PAIR_AXIS }),

      R(md`
        ### Level 5: exam level

        Exam problems combine a moment calculation with a consequence: the far field, a force, an error estimate, the next term.
      `),

      Q(md`Only the shell $R/2<r<R$ of the ball is charged: $+\rho_0$ in the northern half, $-\rho_0$ in the southern half; the core $r<R/2$ is empty. What is $p_z$?`,
        [md`$\dfrac{\pi R^4\rho_0}{4}$, half the full ball's value because half the radius is removed`, md`$\dfrac{\pi R^4\rho_0}{32}$`, md`$\dfrac{7\pi R^4\rho_0}{16}$`, md`$\dfrac{15\pi R^4\rho_0}{32}$`], 3,
        [md`$p\propto\int r^3\,dr\propto R^4$, so removing the core removes only $(1/2)^4 = 1/16$ of it.`, md`That is the core's contribution, the part that was removed.`, md`That uses $R^3$ scaling (the charge) instead of $R^4$.`, null],
        md`$p_z = \dfrac{\pi\rho_0}{2}\left(R^4 - (R/2)^4\right) = \dfrac{15}{16}\cdot\dfrac{\pi R^4\rho_0}{2} = \dfrac{15\pi R^4\rho_0}{32}$. The outer shell holds most of the dipole moment: it has more charge **and** a longer lever arm.`,
        { figHtml: F_HEMISHELL }),

      Q(md`For $\pm q$ a distance $d$ apart, what is the fractional error of the dipole approximation on the axis at distance $z\gg d$?`,
        [md`$\dfrac{d}{2z}$`, md`$\dfrac{d^2}{4z^2}$`, md`$\dfrac{d^2}{z^2}$`, md`$\dfrac{d^3}{8z^3}$`], 1,
        [md`A first-order error would come from a quadrupole term, and the pair's quadrupole moment about its center is zero.`, null, md`Missing the $(1/2)^2$: the charges sit at $\pm d/2$.`, md`The error series has only even powers of $d/z$ for this symmetric pair, and it starts at the second.`],
        md`$V_{\text{exact}}/V_{\text{dip}} = \dfrac{z^2}{z^2 - d^2/4} = 1 + \dfrac{d^2}{4z^2} + \cdots$. At $z = 5d$ the error is 1%. The next term after the dipole is the octupole because the symmetric pair has no quadrupole.`,
        { figHtml: F_PAIR_AXIS }),

      Q(md`The $\pm\rho_0$ ball ($\vb p\parallel+\hat{\mathbf z}$) sits a distance $D\gg R$ below a positive point charge $q$ on the $z$-axis. Which way is the net force on the ball?`,
        [md`Toward $q$ (up)`, md`Away from $q$ (down)`, md`Zero, because the ball is neutral`, md`Sideways`], 1,
        [md`Its positive half is the closer one, and it is repelled more strongly than the negative half is attracted.`, null, md`Neutral objects feel forces in non-uniform fields; $\vb F = (\vb p\cdot\nabla)\vb E\ne0$.`, md`Everything is symmetric about the $z$-axis.`],
        md`On the axis below $q$, $E_z = -\dfrac{q}{4\pi\varepsilon_0(D - z)^2}$ and $\dfrac{\partial E_z}{\partial z} = -\dfrac{2q}{4\pi\varepsilon_0D^3}$ at the ball. $F_z = p\,\dfrac{\partial E_z}{\partial z}<0$: pushed away. Here $\vb p$ points against $\vb E$ (the field of $q$ points down at the ball), the unstable orientation, so the ball is pushed toward the weaker field.`,
        { figHtml: F_BALL_Q }),

      Q(md`The ring with $\lambda = \lambda_0\cos\phi$ (in the $xy$-plane) sits in a uniform field $\vb E_0 = E_0\hat{\mathbf z}$. What is the torque?`,
        [md`$\pi R^2\lambda_0E_0\,\hat{\mathbf y}$`, md`$-\pi R^2\lambda_0E_0\,\hat{\mathbf y}$`, md`$\pi R^2\lambda_0E_0\,\hat{\mathbf z}$`, md`$0$, because the ring is neutral`], 1,
        [md`$\hat{\mathbf x}\times\hat{\mathbf z} = -\hat{\mathbf y}$, not $+\hat{\mathbf y}$.`, null, md`$\vb p\times\vb E_0$ is perpendicular to $\vb E_0 = E_0\hat{\mathbf z}$.`, md`Neutral objects still feel a torque when $\vb p\ne0$.`],
        md`$\vb p = \pi R^2\lambda_0\,\hat{\mathbf x}$, so $\vb N = \vb p\times\vb E_0 = \pi R^2\lambda_0E_0(\hat{\mathbf x}\times\hat{\mathbf z}) = -\pi R^2\lambda_0E_0\,\hat{\mathbf y}$. This rotates the positive side ($+x$) up toward $+z$, turning $\vb p$ toward $\vb E_0$.`,
        { figHtml: F_RING_E }),

      Q(md`For the same ring ($\lambda = \lambda_0\cos\phi$, origin at its center), what is the quadrupole term?`,
        [md`Zero in every direction`, md`$-\tfrac12QR^2$ with $Q$ the charge on the positive half`, md`Nonzero only along $\hat{\mathbf x}$`, md`It can't be computed without $\phi$-symmetry`], 0,
        [null, md`That is the result for a **uniform** ring. Here $\lambda$ is odd under $x\to-x$, and every quadrupole integrand ($x'^2$, $y'^2$, $x'y'$, ...) is either even in $x'$ or odd in $y'$.`, md`Along $\hat{\mathbf x}$ the integrand $\lambda_0\cos\phi\,(3\cos^2\phi - 1)$ integrates to zero too.`, md`Griffiths' form $\int r'^2P_2(\cos\alpha)\,dq$ works for any distribution; you just can't factor out $\phi$.`],
        md`Under $x\to-x$ (i.e. $\phi\to\pi-\phi$), $\lambda\to-\lambda$. The quadrupole density $r'^2P_2(\cos\alpha)$ is a quadratic form in $x', y'$: the $x'^2$ and $y'^2$ parts are even in $x'$ (so they cancel against odd $\lambda$), and the $x'y'$ part is odd in $y'$ while $\lambda$ is even in $y'$. So every quadrupole component vanishes, and after the dipole the next term is the octupole, $\propto1/r^4$.`,
        { figHtml: F_RING_COS }),

      Q(md`Two equal dipoles, both $\parallel+\hat{\mathbf z}$, sit side by side a distance $d$ apart along $x$. What is the force between them?`,
        [md`Attractive, $\dfrac{6p^2}{4\pi\varepsilon_0d^4}$`, md`Attractive, $\dfrac{3p^2}{4\pi\varepsilon_0d^4}$`, md`Repulsive, $\dfrac{3p^2}{4\pi\varepsilon_0d^4}$`, md`Zero, since each sits where the other's $E_x = 0$`], 2,
        [md`That is the head-to-tail (on-axis) case, which attracts.`, md`Right size, wrong sign: parallel dipoles side by side repel (like charges are nearer each other than unlike ones).`, null, md`The force depends on the derivative $\partial\vb E/\partial z$ of the other dipole's field, not on $\vb E$ itself, and it is nonzero.`],
        md`At $(d, 0, 0)$ the field of $\vb p_1$ is $\vb E = \dfrac{1}{4\pi\varepsilon_0}\dfrac{3(\vb p_1\cdot\uv r)\uv r - \vb p_1}{r^3}$. $F_x = p\,\dfrac{\partial E_x}{\partial z} = p\cdot\dfrac{3p}{4\pi\varepsilon_0d^4}$ (from the $3z\,x/r^5$ term), pointing away from $\vb p_1$: repulsion, half the size of the on-axis attraction.`,
        { figHtml: F_TWO_SIDE }),

      Q(md`$+Q$ sits at the origin and $-Q$ at $z = b$. About which point does the quadrupole moment $q_2$ vanish?`,
        [md`The origin`, md`The midpoint $z = b/2$`, md`The point $z = b$`, md`None: $q_2 = -Qb^2$ about every point`], 1,
        [md`About the origin $q_2 = (-Q)b^2P_2(1) = -Qb^2$.`, null, md`By the same arithmetic, $q_2 = Qb^2$ there.`, md`$q_2$ depends on the origin whenever $\vb p\ne0$; only the lowest nonzero moment is origin-independent.`],
        md`About the midpoint the charges sit at $\mp b/2$: $q_2 = Q(b/2)^2 - Q(b/2)^2 = 0$. The lowest nonzero moment ($\vb p = -Qb\,\hat{\mathbf z}$) is the same about every origin; the next one is not. Choosing the center well can kill it, which makes the expansion converge faster.`,
        { figHtml: F_PM_Q }),

      R(md`
        ### Level 6: harder than the exam

        Reason without computing: parity, which terms survive, what a surviving term implies.
      `),

      Q(md`Which of these has an exterior potential that is **exactly** a pure dipole for every $r>R$ (no higher terms at all)?`,
        [md`(A) the ball with $\pm\rho_0$ halves`, md`(B) the ball with $\rho_0\cos\theta$`, md`(C) two point charges $\pm q$`, md`(D) the shell with $\pm\sigma_0$ halves`], 1,
        [md`A step function in $\cos\theta$ contains $P_1, P_3, P_5, \ldots$: the octupole $q_3 = -\pi R^6\rho_0/12$ is not zero.`, null, md`The pair has an octupole too: $V_{\text{exact}} = V_{\text{dip}}(1 + d^2/4z^2 + \cdots)$ on the axis.`, md`Same step function as (A), on a shell.`],
        md`$\rho_0\cos\theta = \rho_0P_1(\cos\theta)$, so every moment $\int r'^\ell P_\ell(\cos\theta')\rho\,d\tau'$ with $\ell\ne1$ vanishes by Legendre orthogonality. Any angular profile that is a single $P_1$ gives an exactly-dipole exterior; a step contains every odd $\ell$.`,
        { figHtml: F_FOUR }),

      Q(md`For the $\pm\rho_0$ ball, the octupole moment is $q_3 = -\dfrac{\pi R^6\rho_0}{12}$. At $P$, a distance $z = 2R$ up the axis, by about how much is the dipole approximation off?`,
        [md`It is too high by about $4\%$`, md`It is too low by about $4\%$`, md`It is too high by about $25\%$`, md`It is exact: there's no quadrupole`], 0,
        [null, md`$q_3<0$ makes the octupole term negative on the $+z$ axis, so the exact $V$ is **below** the dipole term.`, md`The ratio is $\dfrac{q_3}{p\,z^2} = -\dfrac{R^2}{6z^2}$, which is $-\frac1{24}$ at $z = 2R$, not $-\frac14$.`, md`No quadrupole, but the octupole is there.`],
        md`On the axis $V = \dfrac{1}{4\pi\varepsilon_0}\left(\dfrac{p}{z^2} + \dfrac{q_3}{z^4} + \cdots\right)$, so the correction is $\dfrac{q_3}{pz^2} = \dfrac{-\pi R^6\rho_0/12}{(\pi R^4\rho_0/2)z^2} = -\dfrac{R^2}{6z^2} = -\dfrac{1}{24}$ at $z = 2R$. The dipole term overestimates by about 4%. Note the sign is opposite to the point pair, where the exact $V$ is larger.`,
        { figHtml: F_BALL_AXIS2R }),

      Q(md`Can the far potential of a localized charge distribution be $V\approx C/r^3$ with **no** angular dependence (and no $1/r$, $1/r^2$ terms)?`,
        [md`Yes: that is a quadrupole`, md`Yes, if $Q = 0$ and $\vb p = 0$`, md`Yes: that is an octupole`, md`No: $\nabla^2(1/r^3) = 6/r^5\ne0$, so it would require charge out at that distance`], 3,
        [md`A quadrupole potential carries $P_2(\cos\alpha)$-type angular dependence; it is never isotropic.`, md`$Q = \vb p = 0$ makes the leading term $1/r^3$, but that term is still $\propto r^{-3}P_2$-like, never a constant times $r^{-3}$.`, md`The octupole falls as $1/r^4$.`, null],
        md`Outside the charge, every term of the expansion solves Laplace's equation: $r^{-(\ell+1)}P_\ell(\cos\theta)$. The only isotropic solution is $\ell = 0$, $1/r$. An isotropic $1/r^3$ has $\nabla^2(r^{-3}) = \frac{1}{r^2}\frac{d}{dr}(r^2\cdot(-3r^{-4})) = 6r^{-5}$, so $\rho\ne0$ there: the charge isn't localized after all.`,
        { figHtml: F_ISO }),

      Q(md`A ball has $\rho = \rho_0\,\text{sign}(xyz)$: alternating $\pm\rho_0$ in the eight octants. What is the leading far-field term?`,
        [md`Dipole, $1/r^2$`, md`Quadrupole, $1/r^3$`, md`Octupole, $V\propto1/r^4$`, md`Nothing: all moments vanish`], 2,
        [md`$p_x = \int x\rho$ is odd in $y$ (since $\rho$ is odd in $y$ and $x$ is even in $y$), so it vanishes; same for $p_y$, $p_z$.`, md`Each quadrupole integrand ($x^2$, $xy$, ...) is even in at least one coordinate, in which $\rho$ is odd.`, null, md`$\int xyz\,\rho\,d\tau = \rho_0\int|xyz|\,d\tau>0$, and $xyz$ is an $\ell = 3$ harmonic.`],
        md`$\rho$ is odd in $x$, in $y$ and in $z$ separately. A moment survives only if its polynomial is also odd in all three, and the lowest such polynomial is $xyz$, of degree 3. So $Q$, $\vb p$ and the quadrupole vanish, and $V\propto1/r^4$ far away.`,
        { figHtml: F_OCT_ALT }),

      Q(md`$\vb p_1 = p\,\hat{\mathbf z}$ is fixed at the origin. A second dipole $\vb p_2$, free to rotate, is held at $(d, 0, 0)$, on $\vb p_1$'s equatorial plane. Which orientation of $\vb p_2$ has the lowest energy?`,
        [md`Parallel to $\vb p_1$`, md`Pointing along $+\hat{\mathbf x}$, away from $\vb p_1$`, md`Antiparallel to $\vb p_1$`, md`All orientations have the same energy`], 2,
        [md`On the equator $\vb E_1 = -\dfrac{p}{4\pi\varepsilon_0d^3}\hat{\mathbf z}$; parallel gives $U>0$, the highest energy.`, md`$E_1$ has no $x$-component there, so $U = 0$ for that orientation; you can do better.`, null, md`$U = -\vb p_2\cdot\vb E_1$ depends on the angle.`],
        md`$\vb p_2$ lines up with the local field of $\vb p_1$, which on the equator points opposite to $\vb p_1$. So side-by-side dipoles prefer to be antiparallel (and the parallel side-by-side pair repels). On the axis, where $\vb E_1\parallel\vb p_1$, they prefer head-to-tail.`,
        { figHtml: F_TWO_FREE }),

      Q(md`A neutral conducting sphere sits a large distance $D$ from a point charge $q$. The field of $q$ induces a dipole in the sphere. How does the attractive force fall off with $D$?`,
        [md`$1/D^2$`, md`$1/D^5$`, md`$1/D^3$`, md`It is zero: the sphere is neutral`], 1,
        [md`That would need net charge on the sphere.`, null, md`That is the force on a **fixed** dipole. Here $p$ itself is $\propto E\propto1/D^2$.`, md`Neutral objects are attracted by induced dipoles.`],
        md`The induced moment is $p\propto E\propto1/D^2$, and the force is $p\,\partial E/\partial D\propto\dfrac{1}{D^2}\cdot\dfrac{1}{D^3} = \dfrac{1}{D^5}$. The image-charge solution confirms it: expanding the exact force on $q$ gives $\dfrac{q^2R^3}{2\pi\varepsilon_0D^5}$ at leading order (Level 6 of the problems).`,
        { figHtml: F_COND_Q }),

      RF(md`
        !!method Patterns to remember
            - Find the first nonzero moment; it sets the falloff ($V\sim1/r^{\ell+1}$).
            - Parity in each coordinate kills components before you integrate. Odd under inversion: only odd $\ell$ survive.
            - The lowest nonzero moment is origin-independent; the higher ones are not.
            - $\vb N = \vb p\times\vb E$, $U = -\vb p\cdot\vb E$, $\vb F = (\vb p\cdot\nabla)\vb E$. A uniform field only twists.
            - The angular profile decides which $\ell$ appear: a single $\cos\theta$ is pure $\ell = 1$; a step is all odd $\ell$.
      `),
    ],
  };

  // ===================================================================================================
  //  Lesson 2: multipole problems
  // ===================================================================================================
  const FP_TWO = pts2({ ch: [[0, 1, '+', '+3q', 'r'], [0, -2, '-', '-q', 'r']], ticks: [[1, 'a', 'y'], [-2, '-2a', 'y']], xr: [-1.6, 1.8], yr: [-2.8, 2.4] });
  const FP_TWO_SOL = pts2({ ch: [[0, 1, '+', '+3q', 'r'], [0, -2, '-', '-q', 'r']], ticks: [[1, 'a', 'y'], [-2, '-2a', 'y']], xr: [-1.6, 1.8], yr: [-2.8, 3.2],
    extra: (f, u) => { f.line(-12, -2.5 * u, 12, -2.5 * u, { cls: 'thick' }); put(f, -12, -2.5 * u, md`z_0 = \tfrac52a`, ['l', 'tl', 'bl'], 6, 'small'); } });
  const FP_ROD = rod({ lab: md`\lambda = \lambda_0z/L`, extra: (f, Lp) => { f.dot(0, -Lp - 20, 2.8); put(f, 0, -Lp - 20, 'P', ['l', 'r'], 6); } });
  const FP_DIAMOND = pts2({ ch: [[1, 0, '+', '+q', 'b'], [0, 1, '+', '+q', 'r'], [-1, 0, '-', '-q', 'b'], [0, -1, '-', '-q', 'r']], ax: ['x', 'y'], ticks: [[1, 'a', 'y']], xr: [-1.8, 3.6], P: [3.1, 0, 'P'] });
  const FP_BALLZ = ball({ kind: 'zlin', labs: [[md`\rho = \rho_0z/R`, 35]], Rdim: 200, P: [125, 90], Plab: 'P', zTop: 110 });
  const FP_DISK = ring3({ dens: Math.cos, disk: true, lab: md`\sigma = \sigma_0\cos\phi`, phiAt: 50, Rlab: true });
  const FP_WATER = dipInField({ al: 30, Elab: md`\mathbf E_0` });
  const FP_RING = ring3({ dens: Math.cos, lab: md`\lambda_0\cos\phi`, Rlab: true, phiAt: 50 });
  const FP_BQ = (() => {
    const f = PF.fig(), Rr = 34;
    chg(f, f.arcPts(0, 0, Rr, Rr, 0, 360), '+'); f.circle(0, 0, Rr);
    put(f, 24, 24, '+Q', ['br', 'r'], 4, 'small');
    f.charge(0, -120, { q: '-' }); put(f, 0, -120, '-Q', ['r', 'tr'], 10);
    f.line(0, -Rr - 2, 0, -112, { cls: 'dim dash thin' }); f.line(0, Rr + 2, 0, Rr + 16, { cls: 'dim dash thin' });
    axis(f, 0, -128, 0, -160, 'z', ['t', 'tr']);
    dimL(f, -26, 0, -26, -120, 'b', ['l']);
    const p = pol(Rr, -30); dimL(f, 0, 0, p[0], p[1], 'R', ['b', 'br', 'r']);
    return widen(f).svg();
  })();
  const FP_COS2 = ball({ kind: 'cos2', Rdim: 210, extra: (f, Rr) => { const p = pol(Rr / 2, -40); dimL(f, 0, 0, p[0], p[1], ''); put(f, p[0], p[1], 'R/2', ['br', 'r', 'b'], 3, 'small'); const a = pol(Rr * 0.28, 125), b = pol(Rr * 0.8, 50); f.dot(a[0], a[1], 2); f.line(a[0], a[1], -Rr - 18, -Rr - 14, { cls: 'dim thin' }); put(f, -Rr - 18, -Rr - 14, md`+\rho_0\cos\theta\ (r<R/2)`, ['l', 'tl', 't'], 3, 'small'); f.dot(b[0], b[1], 2); f.line(b[0], b[1], Rr + 18, -Rr - 14, { cls: 'dim thin' }); put(f, Rr + 18, -Rr - 14, md`-\rho_0\cos\theta\ (R/2<r<R)`, ['r', 'tr', 't'], 3, 'small'); } });
  const FP_OCT = octBall({ oct: [[1, 1, 1, '+'], [1, 1, -1, '-']] });
  const FP_OCT_SOL = octBall({ oct: [[1, 1, 1, '+'], [1, 1, -1, '-']], extra: (g, Rr) => {
    const O = g.p3(0, 0, 0), n = g.p3(Rr * 1.35, 0, Rr * 1.35);
    dl(g, O[0], O[1], n[0], n[1], { cls: 'dash' }); g.dot(n[0], n[1], 2.8); put(g, n[0], n[1], md`\hat{\mathbf n} = \tfrac{1}{\sqrt2}(\hat{\mathbf x} + \hat{\mathbf z})`, ['l', 'tl', 'bl'], 6, 'small'); } });
  const FP_SHPOLY = shell({ sig: (t) => (1 + 2 * Math.cos(t) + 3 * Math.cos(t) ** 2) / 6, lab: md`\sigma = \sigma_0(1 + 2\cos\theta + 3\cos^2\theta)`, Rdim: 200 });
  const FP_THREE = pts2({ ch: [[0, 1, '+', '+2q', 'r'], [0, 0, '-', '-q', 'br'], [0, -2, '-', '-q', 'r']], ticks: [[1, 'a', 'y'], [-2, '-2a', 'y']], xr: [-1.6, 1.8], yr: [-2.8, 2.6] });
  const FP_BALL_Q = F_BALL_Q;
  const FP_BALL_Q_SOL = ball({ kind: 'hemi', zTop: 150, noZ: true, extra: (f, Rr) => {
    f.charge(0, -Rr - 70, { q: '+', lab: 'q', at: 'r' }); f.line(0, -Rr - 2, 0, -Rr - 62, { cls: 'dim dash thin' });
    f.arrow(-34, 22, -34, -22, { cls: 'thick', hs: 7 }); put(f, -34, -22, '\\mathbf p', ['l', 'tl'], 6);
    f.arrow(Rr + 26, -10, Rr + 26, 30, { cls: 'thick', hs: 8 }); put(f, Rr + 26, 30, '\\mathbf F', ['r', 'br'], 6);
    for (const x of [-18, 18]) f.arrow(x, -Rr - 34, x, -Rr - 8, { cls: 'dim', hs: 5 });
    put(f, 18, -Rr - 34, md`\mathbf E_q`, ['r', 'tr'], 6, 'small'); } });
  const FP_COND = F_COND_Q;

  const L_MPP = {
    id: 'uD-mp-problems', title: 'Multipoles: problem ladder',
    steps: [
      R(md`
        ### Level 1: recognize

        Short computations with point charges and a line charge. The goal is speed: $Q$, then $\vb p$, then what the far field looks like.
      `),

      P({
        id: 'uD-mp-p1', title: 'Unequal charges: where does p vanish?',
        q: md`$+3q$ sits at $z = a$ and $-q$ at $z = -2a$. Find (a) $Q$, (b) $p_z$ about the origin, (c) the point $z_0$ on the axis about which $\vb p = 0$, (d) the leading far-field term.`,
        figHtml: FP_TWO,
        hints: [md`$Q = \sum q_i$ and $p_z = \sum q_iz_i$.`, md`About $z_0$: $p_z' = p_z - Qz_0$.`],
        parts: [
          { lbl: md`(a) $Q$`, expr: '2*q', vars: { q: [1, 3] } },
          { lbl: md`(b) $p_z$`, expr: '5*q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`(c) $z_0$`, expr: '5*a/2', vars: { a: [0.5, 2] } },
          { lbl: md`(d) The leading far-field term is`, mc: [md`the monopole, $\dfrac{2q}{4\pi\varepsilon_0r}$`, md`the dipole, $\dfrac{5qa\cos\theta}{4\pi\varepsilon_0r^2}$`, md`the quadrupole`, md`zero`], a: 0,
            why: [null, md`The dipole term is there, but $Q\ne0$ makes the $1/r$ term dominate far away.`, md`Lower terms are nonzero.`, md`$Q = 2q\ne0$.`] },
        ],
        sol: md`
          (a) $Q = 3q - q = 2q$.

          (b) $p_z = 3q\cdot a + (-q)(-2a) = 5qa$. Both terms are positive: positive charge up, negative charge down.

          (c) $p_z - Qz_0 = 0$ gives $z_0 = \dfrac{5qa}{2q} = \dfrac52a$. Check: positions from $z_0$ are $-\frac32a$ and $-\frac92a$, and $3q(-\tfrac32a) - q(-\tfrac92a) = 0$.

          [[fig:sol]]

          (d) $Q\ne0$, so the monopole term leads. Expanding about $z_0$ instead of the origin removes the $1/r^2$ term entirely, so the first correction there is $1/r^3$.

          **Remember:** for a charged object, $\vb p$ is a bookkeeping choice; for a neutral one it is physics.
        `,
        figs: { sol: { svg: FP_TWO_SOL, cap: 'About $z_0 = 5a/2$, above both charges, the dipole moment vanishes.' } },
      }),

      P({
        id: 'uD-mp-p2', title: 'A rod with λ ∝ z',
        q: md`A rod from $z = -L$ to $z = L$ carries $\lambda = \lambda_0z/L$. (a) What is $Q$? (b) Find $p_z$. (c) In the dipole approximation, find $E_z$ at a point $P$ on the axis at $z\gg L$.`,
        figHtml: FP_ROD,
        hints: [md`$\lambda$ is odd in $z$.`, md`$p_z = \int_{-L}^{L}z\lambda\,dz$.`, md`On the axis, $\vb E_{\text{dip}} = \dfrac{2p}{4\pi\varepsilon_0z^3}\hat{\mathbf z}$.`],
        parts: [
          { lbl: md`(a) $Q$ is`, mc: [md`$0$`, md`$\lambda_0L$`, md`$2\lambda_0L$`, md`$\lambda_0L/2$`], a: 0,
            why: [null, md`$\int_{-L}^{L}\lambda_0z/L\,dz = 0$: the halves cancel.`, md`That would be a uniform $\lambda_0$.`, md`That is the charge on the top half only.`] },
          { lbl: md`(b) $p_z$`, expr: '2*lambda0*L^2/3', vars: { lambda0: [1, 3], L: [0.5, 2] } },
          { lbl: md`(c) $E_z$ at $P$`, expr: 'lambda0*L^2/(3*pi*eps0*z^3)', vars: { lambda0: [1, 3], L: [0.5, 2], eps0: [0.5, 2], z: [5, 9] }, accepts: ['2*(2*lambda0*L^2/3)/(4*pi*eps0*z^3)'] },
        ],
        sol: md`
          (a) $\lambda$ is odd in $z$, so $Q = 0$.

          (b) $p_z = \dfrac{\lambda_0}{L}\displaystyle\int_{-L}^{L}z^2\,dz = \dfrac{2\lambda_0L^2}{3}$.

          (c) $E_z = \dfrac{2p_z}{4\pi\varepsilon_0z^3} = \dfrac{\lambda_0L^2}{3\pi\varepsilon_0z^3}$.

          **Check:** units: $\lambda_0L^2$ is C·m, over $\varepsilon_0z^3$ gives V/m. The next term is the octupole ($\lambda$ is odd, so the quadrupole vanishes), down by $(L/z)^2$.
        `,
      }),

      R(md`
        ### Level 2: set up
      `),

      P({
        id: 'uD-mp-p3', title: 'Four charges on a diamond',
        q: md`In the $xy$-plane: $+q$ at $(a,0)$ and $(0,a)$, $-q$ at $(-a,0)$ and $(0,-a)$. Find (a) $p_x$ and (b) $p_y$. (c) Find $V$ in the dipole approximation at $P = (x, 0, 0)$ with $x\gg a$. (d) On the $x$-axis, how does the first correction to (c) fall off?`,
        figHtml: FP_DIAMOND,
        hints: [md`$\vb p = \sum q_i\vb r_i$; the two $-q$ charges at negative positions add, not subtract.`, md`$V_{\text{dip}} = \dfrac{\vb p\cdot\uv r}{4\pi\varepsilon_0r^2}$ with $\uv r = \hat{\mathbf x}$ at $P$.`, md`For (d), write the exact $V$ at $P$ and expand: the two charges on the $y$-axis are at equal distances $\sqrt{x^2+a^2}$.`],
        parts: [
          { lbl: md`(a) $p_x$`, expr: '2*q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`(b) $p_y$`, expr: '2*q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`(c) $V_{\text{dip}}(P)$`, expr: 'q*a/(2*pi*eps0*x^2)', vars: { q: [1, 3], a: [0.5, 2], eps0: [0.5, 2], x: [6, 10] } },
          { lbl: md`(d) The first correction on the $x$-axis falls as`, mc: [md`$1/x^4$`, md`$1/x^3$`, md`$1/x^5$`, md`there is none: the dipole term is exact here`], a: 0,
            why: [null, md`The quadrupole term vanishes on this line: the $(0,\pm a)$ pair cancels exactly at $P$, and the $(\pm a, 0)$ pair alone is a pure dipole plus odd terms.`, md`Too high; the octupole term ($1/x^4$) is there.`, md`The pair on the $x$-axis gives $\dfrac{1}{x-a} - \dfrac{1}{x+a} = \dfrac{2a}{x^2}\left(1 + \dfrac{a^2}{x^2} + \cdots\right)$.`] },
        ],
        sol: md`
          (a), (b) $\vb p = q(a,0) + q(0,a) - q(-a,0) - q(0,-a) = 2qa(\hat{\mathbf x} + \hat{\mathbf y})$, so $p_x = p_y = 2qa$, $|\vb p| = 2\sqrt2\,qa$ along the diagonal.

          (c) At $P$, $\uv r = \hat{\mathbf x}$, so $V = \dfrac{p_x}{4\pi\varepsilon_0x^2} = \dfrac{qa}{2\pi\varepsilon_0x^2}$. Only the component of $\vb p$ along $\uv r$ matters.

          (d) Exactly: the $(0,\pm a)$ charges cancel at $P$, and $\dfrac{q}{4\pi\varepsilon_0}\left(\dfrac{1}{x-a} - \dfrac{1}{x+a}\right) = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac{2a}{x^2} + \dfrac{2a^3}{x^4} + \cdots\right)$. The correction is $\propto1/x^4$.
        `,
      }),

      P({
        id: 'uD-mp-p4', title: 'A ball with ρ ∝ z',
        q: md`A ball of radius $R$ has $\rho = \rho_0z/R$ (that is, $\rho_0\dfrac{r}{R}\cos\theta$). (a) Is it neutral? (b) Find $p_z$. (c) In the dipole approximation, find $E_z$ at a point $P$ on the equatorial plane at distance $r\gg R$. (d) Find $p_z$ divided by $p_z$ of the ball with $\rho = \rho_0\cos\theta$.`,
        figHtml: FP_BALLZ,
        hints: [md`Odd in $z$: neutral.`, md`$p_z = \int z\rho\,d\tau = \dfrac{\rho_0}{R}\int r^2\cos^2\theta\,r^2\sin\theta\,dr\,d\theta\,d\phi$.`, md`On the equator $\vb E_{\text{dip}} = -\dfrac{\vb p}{4\pi\varepsilon_0r^3}$.`],
        parts: [
          { lbl: md`(a) The ball is`, mc: [md`neutral`, md`positive overall`, md`negative overall`, md`it depends on $R$`], a: 0,
            why: [null, md`For every $+$ point at $z$ there's a $-$ point at $-z$ with the opposite density.`, md`Same reason.`, md`The cancellation is exact at every radius.`] },
          { lbl: md`(b) $p_z$`, expr: '4*pi*rho0*R^4/15', vars: { rho0: [1, 3], R: [0.5, 2] } },
          { lbl: md`(c) $E_z$ at $P$`, expr: '-rho0*R^4/(15*eps0*r^3)', vars: { rho0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], r: [4, 8] } },
          { lbl: md`(d) $p_z/p_z^{(\rho_0\cos\theta)}$`, ans: 0.8, unit: '' },
        ],
        sol: md`
          (a) $\rho(-z) = -\rho(z)$: neutral.

          (b) $p_z = \dfrac{\rho_0}{R}\cdot\dfrac{R^5}{5}\cdot\dfrac23\cdot2\pi = \dfrac{4\pi\rho_0R^4}{15}$ (radial $\int_0^Rr^4dr$, angular $\int\cos^2\theta\sin\theta\,d\theta = \frac23$, azimuthal $2\pi$).

          (c) $E_z = -\dfrac{p_z}{4\pi\varepsilon_0r^3} = -\dfrac{\rho_0R^4}{15\varepsilon_0r^3}$: on the equator the dipole field points opposite to $\vb p$.

          (d) $\dfrac{4\pi/15}{\pi/3} = \dfrac45$. The extra factor $r/R<1$ weakens the density near the center, and the center has the shortest lever arm, so only 20% is lost. Same angular profile ($\cos\theta$), so this exterior field is also exactly dipole.
        `,
      }),

      R(md`
        ### Level 3: solve the standard case
      `),

      P({
        id: 'uD-mp-p5', title: 'A disk with σ = σ₀ cos φ',
        q: md`A thin disk of radius $R$ in the $xy$-plane carries $\sigma = \sigma_0\cos\phi$ (in plane polar coordinates $s, \phi$ on the disk). Find (a) $p_x$, (b) $V$ in the dipole approximation on the $x$-axis at $x\gg R$. (c) What is the dipole-order $V$ on the $z$-axis?`,
        figHtml: FP_DISK,
        hints: [md`$dq = \sigma\,s\,ds\,d\phi$ and $x' = s\cos\phi$.`, md`$p_x = \sigma_0\int_0^Rs^2\,ds\int_0^{2\pi}\cos^2\phi\,d\phi$.`],
        parts: [
          { lbl: md`(a) $p_x$`, expr: 'pi*sigma0*R^3/3', vars: { sigma0: [1, 3], R: [0.5, 2] } },
          { lbl: md`(b) $V$ on the $x$-axis`, expr: 'sigma0*R^3/(12*eps0*x^2)', vars: { sigma0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], x: [5, 9] } },
          { lbl: md`(c) On the $z$-axis, $V_{\text{dip}}$ is`, mc: [md`$\dfrac{\sigma_0R^3}{12\varepsilon_0z^2}$`, md`$\dfrac{\sigma_0R^3}{6\varepsilon_0z^2}$`, md`negative`, md`$0$, because $\vb p\perp\uv r$ there`], a: 3,
            why: [md`That is the value along $\vb p$ (the $x$-axis); on the $z$-axis $\vb p\cdot\uv r = 0$.`, md`Twice the $x$-axis value, and the $x$-axis value doesn't apply here anyway: on the $z$-axis $\vb p\cdot\uv r = 0$.`, md`It is exactly zero, by symmetry: every point on the $z$-axis is equidistant from $\pm$ partners.`, null] },
        ],
        sol: md`
          (a) $p_x = \int s\cos\phi\cdot\sigma_0\cos\phi\cdot s\,ds\,d\phi = \sigma_0\dfrac{R^3}{3}\pi = \dfrac{\pi\sigma_0R^3}{3}$. ($p_y\propto\int\sin\phi\cos\phi = 0$, $Q\propto\int\cos\phi = 0$.)

          (b) $V = \dfrac{p_x}{4\pi\varepsilon_0x^2} = \dfrac{\sigma_0R^3}{12\varepsilon_0x^2}$.

          (c) $\vb p\cdot\hat{\mathbf z} = 0$. In fact $V = 0$ exactly on the $z$-axis: the charge at $(s,\phi)$ and at $(s,\pi-\phi)$ are equal and opposite and equidistant from any point on the axis.

          **Compare:** the ring of radius $R$ with $\lambda_0\cos\phi$ has $p = \pi R^2\lambda_0$. The disk is a stack of such rings with $\lambda_0 = \sigma_0\,ds$: $\int_0^R\pi s^2\sigma_0\,ds = \frac13\pi\sigma_0R^3$.
        `,
      }),

      P({
        id: 'uD-mp-p6', title: 'A water molecule in a field',
        q: md`A water molecule has $p = 6.2\times10^{-30}$ C·m. It sits in a uniform field $E_0 = 2.0\times10^{6}$ V/m, at $\alpha = 30^\circ$ to the field. (a) The torque on it, in units of $10^{-24}$ N·m. (b) The largest possible torque, same units. (c) The work to turn it from aligned to anti-aligned, in units of $10^{-24}$ J. (d) The ratio of (c) to $k_BT$ at 300 K ($k_B = 1.381\times10^{-23}$ J/K). (e) What does (d) tell you?`,
        figHtml: FP_WATER,
        hints: [md`$N = pE_0\sin\alpha$.`, md`$W = U(\pi) - U(0) = 2pE_0$.`],
        parts: [
          { lbl: md`(a) $N$ at $30^\circ$ ($10^{-24}$ N·m)`, ans: 6.2, unit: '' },
          { lbl: md`(b) $N_{\max}$ ($10^{-24}$ N·m)`, ans: 12.4, unit: '' },
          { lbl: md`(c) $W$ ($10^{-24}$ J)`, ans: 24.8, unit: '' },
          { lbl: md`(d) $W/k_BT$`, ans: 0.00599, unit: '' },
          { lbl: md`(e) So, in water vapor at room temperature in this field,`, mc: [md`thermal motion wins: the molecules are only very slightly aligned`, md`the molecules are almost perfectly aligned`, md`the molecules are pushed along the field`, md`the molecules are pulled apart`], a: 0,
            why: [null, md`Alignment would need $pE_0\gg k_BT$; here it is over 100 times smaller.`, md`A uniform field exerts no net force on a dipole.`, md`$10^6$ V/m is far too weak to ionize or split a molecule.`] },
        ],
        sol: md`
          (a) $N = pE_0\sin30^\circ = 6.2\times10^{-30}\cdot2.0\times10^6\cdot0.5 = 6.2\times10^{-24}$ N·m.

          (b) $N_{\max} = pE_0 = 12.4\times10^{-24}$ N·m, at $90^\circ$.

          (c) $W = 2pE_0 = 24.8\times10^{-24}$ J.

          (d) $k_BT = 4.14\times10^{-21}$ J, so $W/k_BT = 0.0060$.

          (e) Thermal kicks are about 170 times bigger than the orientation energy, so the average alignment is tiny (of order $pE_0/3k_BT$). This is why a gas's polarization is proportional to $E$, the linear response used in Chapter 4.
        `,
      }),

      R(md`
        ### Level 4: one twist
      `),

      P({
        id: 'uD-mp-p7', title: 'The cos φ ring, everywhere',
        q: md`A ring of radius $R$ in the $xy$-plane carries $\lambda = \lambda_0\cos\phi$. (a) Find $p_x$. (b) Write the dipole potential at a general far point $(r, \theta, \phi)$. (c) In the dipole approximation, find $E_x$ at a far point on the $z$-axis, a height $z$ above the ring. (d) What is the **exact** $V$ on the $z$-axis?`,
        figHtml: FP_RING,
        hints: [md`$\vb p = \pi R^2\lambda_0\,\hat{\mathbf x}$ (Level 2 of the concept ladder).`, md`$\hat{\mathbf x}\cdot\uv r = \sin\theta\cos\phi$.`, md`A point on the $z$-axis lies on the dipole's equatorial plane, where $\vb E = -\vb p/(4\pi\varepsilon_0z^3)$.`],
        parts: [
          { lbl: md`(a) $p_x$`, expr: 'pi*R^2*lambda0', vars: { R: [0.5, 2], lambda0: [1, 3] } },
          { lbl: md`(b) $V_{\text{dip}}(r,\theta,\phi)$`, expr: 'R^2*lambda0*sin(theta)*cos(phi)/(4*eps0*r^2)', vars: { R: [0.5, 1], lambda0: [1, 3], eps0: [0.5, 2], r: [4, 8], theta: [0.2, 2.9], phi: [0, 6] } },
          { lbl: md`(c) $E_x$ on the $z$-axis`, expr: '-R^2*lambda0/(4*eps0*z^3)', vars: { R: [0.5, 1], lambda0: [1, 3], eps0: [0.5, 2], z: [4, 8] } },
          { lbl: md`(d) The exact $V$ on the $z$-axis is`, mc: [md`$\dfrac{R^2\lambda_0}{4\varepsilon_0z^2}$`, md`$\dfrac{2\pi R\lambda_0}{4\pi\varepsilon_0\sqrt{z^2+R^2}}$`, md`$\propto1/z^4$`, md`$0$ at every height`], a: 3,
            why: [md`On the axis $\sin\theta = 0$.`, md`That would be a uniform ring with $\lambda_0$; here $\int\lambda\,dl = 0$.`, md`Every point of the ring is the same distance $\sqrt{z^2+R^2}$ away, so only $Q$ matters, and $Q = 0$: no term survives.`, null] },
        ],
        sol: md`
          (a) $p_x = \int_0^{2\pi}R\cos\phi'\cdot\lambda_0\cos\phi'\cdot R\,d\phi' = \pi R^2\lambda_0$.

          (b) $V = \dfrac{\vb p\cdot\uv r}{4\pi\varepsilon_0r^2} = \dfrac{\pi R^2\lambda_0\sin\theta\cos\phi}{4\pi\varepsilon_0r^2} = \dfrac{R^2\lambda_0\sin\theta\cos\phi}{4\varepsilon_0r^2}$. The angular factor $\sin\theta\cos\phi = x/r$ is just $\cos$ of the angle from $\vb p$.

          (c) The $z$-axis is perpendicular to $\vb p$, i.e. on the equatorial plane: $\vb E = -\dfrac{\vb p}{4\pi\varepsilon_0z^3}$, $E_x = -\dfrac{R^2\lambda_0}{4\varepsilon_0z^3}$.

          (d) Every ring element is at distance $\sqrt{z^2+R^2}$, so $V = \dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{\sqrt{z^2+R^2}} = 0$. (The field there isn't zero: $V$ varies off the axis.)
        `,
      }),

      P({
        id: 'uD-mp-p8', title: 'A charged ball and a point charge',
        q: md`A uniformly charged ball (charge $+Q$, radius $R$) is centered at the origin; a point charge $-Q$ sits at $z = b$ ($b>R$). About the origin, find (a) $p_z$ and (b) $q_2 = \int r'^2P_2(\cos\theta')\,dq$. (c) About which point does $q_2$ vanish? (d) Find $V$ at a far point on the $+z$ axis to order $1/z^3$ (expansion about the origin).`,
        figHtml: FP_BQ,
        hints: [md`Outside itself a uniform ball acts as a point charge at its center, for every multipole: its own moments about its center are $Q$ and nothing else.`, md`The point charge at $z = b$ has $r' = b$, $\theta' = 0$, $P_2(1) = 1$.`],
        parts: [
          { lbl: md`(a) $p_z$`, expr: '-Q*b', vars: { Q: [1, 3], b: [1, 3] } },
          { lbl: md`(b) $q_2$`, expr: '-Q*b^2', vars: { Q: [1, 3], b: [1, 3] } },
          { lbl: md`(c) $q_2 = 0$ about`, mc: [md`the origin`, md`the point charge`, md`the midpoint $z = b/2$`, md`no point`], a: 2,
            why: [md`About the origin $q_2 = -Qb^2$.`, md`About $z = b$, the ball is at distance $b$: $q_2 = Qb^2$.`, null, md`At the midpoint the two contributions $\pm Q(b/2)^2$ cancel.`] },
          { lbl: md`(d) $V(z)$ to order $1/z^3$`, expr: '-Q*b/(4*pi*eps0*z^2) - Q*b^2/(4*pi*eps0*z^3)', vars: { Q: [1, 3], b: [0.5, 1], eps0: [0.5, 2], z: [5, 9] } },
        ],
        sol: md`
          (a) The ball contributes nothing to $\vb p$ about its center, so $p_z = (-Q)b = -Qb$: from the $-Q$ toward the $+Q$, i.e. down.

          (b) $q_2 = (-Q)b^2P_2(1) = -Qb^2$.

          (c) About $z = b/2$: $Q(b/2)^2 - Q(b/2)^2 = 0$. The same pair about its own midpoint is a pure dipole plus octupole.

          (d) $V = \dfrac{1}{4\pi\varepsilon_0}\left(\dfrac{-Qb}{z^2} + \dfrac{-Qb^2}{z^3}\right)$. Exact check: $\dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1z - \dfrac{1}{z-b}\right) = -\dfrac{Qb}{4\pi\varepsilon_0z^2}\left(1 + \dfrac bz + \cdots\right)$, the same.

          **Lesson:** a badly chosen origin generates spurious higher moments. Here the $1/z^3$ term is just the dipole term written about the wrong center.
        `,
      }),

      P({
        id: 'uD-mp-p9', title: 'Two dipoles on one axis',
        q: md`$\vb p_1 = p\,\hat{\mathbf z}$ at the origin and $\vb p_2 = p\,\hat{\mathbf z}$ at $z = d$. (a) Find the interaction energy $U = -\vb p_2\cdot\vb E_1$. (b) Find $F_z$ on $\vb p_2$. (c) Attract or repel? (d) Flip $\vb p_2$. What is $F_z$ now?`,
        figHtml: F_TWO_AXIS,
        hints: [md`On the axis of $\vb p_1$, $\vb E_1 = \dfrac{2p}{4\pi\varepsilon_0z^3}\hat{\mathbf z}$.`, md`$F_z = -\dfrac{\partial U}{\partial d}$, with the orientation held fixed.`],
        parts: [
          { lbl: md`(a) $U$`, expr: '-p^2/(2*pi*eps0*d^3)', vars: { p: [1, 3], eps0: [0.5, 2], d: [1, 3] } },
          { lbl: md`(b) $F_z$ on $\vb p_2$`, expr: '-3*p^2/(2*pi*eps0*d^4)', vars: { p: [1, 3], eps0: [0.5, 2], d: [1, 3] } },
          { lbl: md`(c) They`, mc: [md`attract`, md`repel`, md`feel no force`, md`feel only a torque`], a: 0,
            why: [null, md`$F_z<0$ on the upper dipole: toward the lower one.`, md`The field of $\vb p_1$ varies as $1/z^3$; its gradient is not zero.`, md`On the axis, $\vb p_2\parallel\vb E_1$: no torque, only the force.`] },
          { lbl: md`(d) $F_z$ with $\vb p_2 = -p\,\hat{\mathbf z}$`, expr: '3*p^2/(2*pi*eps0*d^4)', vars: { p: [1, 3], eps0: [0.5, 2], d: [1, 3] } },
        ],
        sol: md`
          (a) $U = -p\cdot\dfrac{2p}{4\pi\varepsilon_0d^3} = -\dfrac{p^2}{2\pi\varepsilon_0d^3}$.

          (b) $F_z = -\dfrac{dU}{dd} = -\dfrac{3p^2}{2\pi\varepsilon_0d^4}$. Equivalently $F_z = p\,\partial_zE_{1z} = p\cdot\left(-\dfrac{6p}{4\pi\varepsilon_0d^4}\right)$.

          (c) Attract: head-to-tail puts $-$ next to $+$.

          (d) Everything flips sign: $+\dfrac{3p^2}{2\pi\varepsilon_0d^4}$, repulsion.

          **Scaling:** dipole–dipole forces go as $1/d^4$ (field $1/d^3$, one more derivative). Compare the side-by-side pair: repulsive and half as large.
        `,
      }),

      R(md`
        ### Level 5: exam level

        These are the Spring 2026 Problem 2 family, pushed. Write $Q$, the symmetry argument and $\vb p$, then the consequence.
      `),

      P({
        id: 'uD-mp-p10', title: 'A cos θ ball with a reversed outer layer', big: true,
        q: md`A ball of radius $R$ has $\rho = +\rho_0\cos\theta$ for $r<R/2$ and $\rho = -\rho_0\cos\theta$ for $R/2<r<R$. (a) Is it neutral? (b) Find $p_z$. (c) Find $V(r,\theta)$ for $r>R$. Is it exact? (d) Find $E_z$ just outside the north pole, on the axis at $r = R^+$, using (c). (e) If the boundary between the layers were at $r = R_1$ instead of $R/2$, which $R_1$ would make $\vb p = 0$?`,
        figHtml: FP_COS2,
        hints: [md`Both layers are $\propto\cos\theta$, so each contributes only to $\ell = 1$.`, md`$p_z = 2\pi\cdot\frac23\left[\rho_0\int_0^{R/2}r^3\,dr - \rho_0\int_{R/2}^{R}r^3\,dr\right]$: one $r$ from the lever arm $z = r\cos\theta$, two from $d\tau$.`, md`For (e), set $R_1^4 = R^4 - R_1^4$.`],
        parts: [
          { lbl: md`(a) $Q$ is`, mc: [md`$0$`, md`positive`, md`negative`, md`undefined`], a: 0,
            why: [null, md`$\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$ in each layer.`, md`Each layer is neutral on its own.`, md`It is a well-defined integral, and it vanishes.`] },
          { lbl: md`(b) $p_z$`, expr: '-7*pi*rho0*R^4/24', vars: { rho0: [1, 3], R: [0.5, 2] } },
          { lbl: md`(c) $V(r,\theta)$ for $r>R$`, expr: '-7*rho0*R^4*cos(theta)/(96*eps0*r^2)', vars: { rho0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], r: [2, 5], theta: [0.1, 3] } },
          { lbl: md`Is (c) exact for $r>R$?`, mc: [md`Yes: only $\ell = 1$ is present`, md`No: there is an octupole correction`, md`No: there is a quadrupole correction`, md`Only on the axis`], a: 0,
            why: [null, md`$\cos\theta = P_1$ in both layers; by orthogonality every $\ell\ne1$ moment vanishes.`, md`A quadrupole needs a $P_2$ component in the angular profile, and $\cos\theta$ has none.`, md`Exactness doesn't depend on direction here.`] },
          { lbl: md`(d) $E_z$ at the north pole, $r = R^+$`, expr: '-7*rho0*R/(48*eps0)', vars: { rho0: [1, 3], R: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`(e) $R_1$`, expr: 'R/2^(1/4)', vars: { R: [0.5, 2] }, accepts: ['R*2^(-0.25)', '2^(3/4)*R/2'] },
        ],
        sol: md`
          (a) Each layer has $\int\cos\theta\sin\theta\,d\theta = 0$: $Q = 0$.

          (b) $p_z = \int r\cos\theta\,\rho\,r^2\sin\theta\,dr\,d\theta\,d\phi$. The angular part gives $2\pi\cdot\frac23 = \frac{4\pi}{3}$; the radial part gives $\rho_0\left[\frac{r^4}{4}\right]_0^{R/2} - \rho_0\left[\frac{r^4}{4}\right]_{R/2}^{R} = \frac{\rho_0R^4}{4}\left(\frac{1}{16} - \frac{15}{16}\right) = -\frac{7\rho_0R^4}{32}$. So $p_z = \frac{4\pi}{3}\cdot\left(-\frac{7\rho_0R^4}{32}\right) = -\frac{7\pi\rho_0R^4}{24}$.

          [[fig:p]]

          The outer layer wins (more volume, longer lever arm), so $\vb p$ points **down** even though the inner core is positive on top.

          (c) $V = \dfrac{p_z\cos\theta}{4\pi\varepsilon_0r^2} = -\dfrac{7\rho_0R^4\cos\theta}{96\varepsilon_0r^2}$, exact for $r>R$, because only $P_1$ is present.

          (d) On the axis $E_z = \dfrac{2p_z}{4\pi\varepsilon_0r^3}$; at $r = R$: $-\dfrac{7\rho_0R}{48\varepsilon_0}$. Exact, since (c) is exact outside.

          (e) $R_1^4 = R^4 - R_1^4$, so $R_1 = R/2^{1/4}\approx0.84R$. The core must take 84% of the radius to balance the outer layer's longer arms.
        `,
        figs: { p: { svg: ball({ kind: 'cos2', noZ: false, extra: (f) => { f.arrow(-14, -20, -14, 22, { cls: 'thick', hs: 8 }); put(f, -14, 22, '\\mathbf p', ['l', 'bl'], 6); } }), cap: 'The outer layer dominates: $\\mathbf p$ points along $-\\hat{\\mathbf z}$.' } },
      }),

      P({
        id: 'uD-mp-p11', title: 'Two stacked octants', big: true,
        q: md`Inside a ball of radius $R$: $+\rho_0$ fills the octant $x, y, z>0$ and $-\rho_0$ fills the octant directly below it ($x, y>0$, $z<0$); the rest is empty. (a) $Q$? (b) Which components of $\vb p$ survive? (c) Find $p_z$. (d) Find $\int xz\,\rho\,d\tau$. (e) Find $V$ at a far point a distance $r$ along $\hat{\mathbf n} = (\hat{\mathbf x} + \hat{\mathbf z})/\sqrt2$, to order $1/r^3$, using $r'^2P_2(\cos\alpha) = \frac12\left[3(\hat{\mathbf n}\cdot\vb r')^2 - r'^2\right]$. (f) Along the $z$-axis, what happens to the $1/r^3$ term?`,
        figHtml: FP_OCT,
        hints: [md`$\rho$ is odd under $z\to-z$ and has no other symmetry. Moments whose polynomial is even in $z$ vanish.`, md`One octant: $\int z\,d\tau = \dfrac{R^4}{4}\cdot\dfrac12\cdot\dfrac{\pi}{2} = \dfrac{\pi R^4}{16}$.`, md`$(\hat{\mathbf n}\cdot\vb r')^2 = \frac12(x'^2 + 2x'z' + z'^2)$; only the $x'z'$ term is odd in $z'$.`, md`$\int_{\text{octant}}xz\,d\tau = \dfrac{R^5}{5}\int_0^{\pi/2}\sin^2\theta\cos\theta\,d\theta\int_0^{\pi/2}\cos\phi\,d\phi = \dfrac{R^5}{15}$.`],
        parts: [
          { lbl: md`(a) $Q$ is`, mc: [md`$0$`, md`$\pi R^3\rho_0/6$`, md`$\pi R^3\rho_0/3$`, md`$-\pi R^3\rho_0/6$`], a: 0,
            why: [null, md`That is one octant; the other cancels it.`, md`Opposite signs: they subtract.`, md`Equal volumes, opposite densities: they cancel.`] },
          { lbl: md`(b) Nonzero components of $\vb p$`, mc: [md`$p_x$ and $p_y$ only`, md`all three`, md`none`, md`$p_z$ only`], a: 3,
            why: [md`$x\rho$ is odd in $z$ (both octants have the same $x$ values, opposite $\rho$): $p_x = 0$; same for $p_y$.`, md`The $x$ and $y$ parts cancel between the two octants.`, md`$z\rho\ge0$ everywhere, so $p_z>0$.`, null] },
          { lbl: md`(c) $p_z$`, expr: 'pi*rho0*R^4/8', vars: { rho0: [1, 3], R: [0.5, 2] } },
          { lbl: md`(d) $\int xz\,\rho\,d\tau$`, expr: '2*rho0*R^5/15', vars: { rho0: [1, 3], R: [0.5, 2] } },
          { lbl: md`(e) $V$ along $\hat{\mathbf n}$ to order $1/r^3$`, expr: 'sqrt(2)*rho0*R^4/(64*eps0*r^2) + rho0*R^5/(20*pi*eps0*r^3)', vars: { rho0: [1, 3], R: [0.5, 1], eps0: [0.5, 2], r: [3, 6] } },
          { lbl: md`(f) On the $z$-axis the $1/r^3$ term`, mc: [md`vanishes`, md`doubles`, md`changes sign`, md`is the same as along $\hat{\mathbf n}$`], a: 0,
            why: [null, md`Along $\hat{\mathbf z}$, $r'^2P_2 = \frac12(3z'^2 - r'^2)$ is even in $z'$, and $\rho$ is odd in $z$.`, md`It is zero, so it can't change sign.`, md`Only the $x'z'$ cross term survived along $\hat{\mathbf n}$; it is absent along $\hat{\mathbf z}$.`] },
        ],
        sol: md`
          (a) $Q = 0$.

          (b) The two octants have the same $(x,y)$ footprint and opposite densities, so any integrand that doesn't change sign with $z$ cancels: $Q$, $p_x$, $p_y$, and every quadrupole piece except those with one factor of $z$ ($xz$, $yz$).

          (c) $p_z = 2\rho_0\cdot\dfrac{\pi R^4}{16} = \dfrac{\pi\rho_0R^4}{8}$: the lower octant has $-\rho_0$ at negative $z$, which adds.

          (d) Same doubling: $2\rho_0\cdot\dfrac{R^5}{15} = \dfrac{2\rho_0R^5}{15}$.

          (e) Dipole term: $\dfrac{\vb p\cdot\hat{\mathbf n}}{4\pi\varepsilon_0r^2} = \dfrac{\pi\rho_0R^4/(8\sqrt2)}{4\pi\varepsilon_0r^2} = \dfrac{\sqrt2\,\rho_0R^4}{64\varepsilon_0r^2}$.

          Quadrupole term: $\frac12[3(\hat{\mathbf n}\cdot\vb r')^2 - r'^2] = \frac34(x'^2 + z'^2) + \frac32x'z' - \frac12r'^2$. Only $\frac32x'z'$ survives against the odd $\rho$: $\int r'^2P_2\,\rho\,d\tau = \frac32\cdot\frac{2\rho_0R^5}{15} = \frac{\rho_0R^5}{5}$, so the term is $\dfrac{\rho_0R^5}{20\pi\varepsilon_0r^3}$.

          [[fig:n]]

          (f) Along $\hat{\mathbf z}$ there is no cross term, so the quadrupole contribution vanishes there; the first correction to the dipole is $1/r^4$ along the axis.

          **Why this is hard:** the quadrupole is not zero, but it is invisible along the symmetry axis you'd naturally check. Off-axis directions pick up the $x'z'$ moment.
        `,
        figs: { n: { svg: FP_OCT_SOL, cap: 'The far direction $\\hat{\\mathbf n}$ lies in the $xz$-plane, halfway between $\\hat{\\mathbf x}$ and $\\hat{\\mathbf z}$.' } },
      }),

      P({
        id: 'uD-mp-p12', title: 'A shell with a polynomial σ(θ)', big: true,
        q: md`A shell of radius $R$ carries $\sigma = \sigma_0(1 + 2\cos\theta + 3\cos^2\theta)$. Find (a) $Q$, (b) $p_z$, (c) $q_2 = \int R^2P_2(\cos\theta')\,\sigma\,da'$. (d) Find $V$ on the $+z$ axis for $z>R$. (e) Does the exterior potential have an octupole term?`,
        figHtml: FP_SHPOLY,
        hints: [md`Rewrite $\sigma$ in Legendre polynomials: $\cos^2\theta = \frac13 + \frac23P_2(\cos\theta)$.`, md`Then $\sigma = \sigma_0[2P_0 + 2P_1 + 2P_2]$. Orthogonality gives each moment from one term: $\int_{-1}^1P_\ell^2\,du = \dfrac{2}{2\ell+1}$.`, md`The moment of order $\ell$ is $2\pi R^{\ell+2}\int_{-1}^1P_\ell(u)\,\sigma(u)\,du$.`],
        parts: [
          { lbl: md`(a) $Q$`, expr: '8*pi*R^2*sigma0', vars: { R: [0.5, 2], sigma0: [1, 3] } },
          { lbl: md`(b) $p_z$`, expr: '8*pi*R^3*sigma0/3', vars: { R: [0.5, 2], sigma0: [1, 3] } },
          { lbl: md`(c) $q_2$`, expr: '8*pi*R^4*sigma0/5', vars: { R: [0.5, 2], sigma0: [1, 3] } },
          { lbl: md`(d) $V(z)$, $z>R$`, expr: '(2*sigma0*R^2/eps0)*(1/z + R/(3*z^2) + R^2/(5*z^3))', vars: { R: [0.5, 1], sigma0: [1, 3], eps0: [0.5, 2], z: [1.5, 4] } },
          { lbl: md`(e) Octupole term?`, mc: [md`Yes, from the $\cos^2\theta$ term`, md`Yes, since $\sigma$ is not symmetric`, md`No: $\sigma$ contains only $P_0$, $P_1$, $P_2$`, md`Only inside the shell`], a: 2,
            why: [md`$\cos^2\theta$ is a mix of $P_0$ and $P_2$; it has no $P_3$ part.`, md`Asymmetry gives odd moments, but only $P_1$ appears, not $P_3$.`, null, md`Inside, the expansion is in $r^\ell$, and the question is about the exterior.`] },
        ],
        sol: md`
          Write $\sigma$ in Legendre polynomials: $1 + 2\cos\theta + 3\cos^2\theta = 1 + 2P_1 + (1 + 2P_2) = 2 + 2P_1 + 2P_2$.

          (a) $Q = 2\pi R^2\int_{-1}^1\sigma\,du = 2\pi R^2\sigma_0\cdot2\cdot2 = 8\pi R^2\sigma_0$.

          (b) $p_z = 2\pi R^3\int_{-1}^1u\,\sigma\,du = 2\pi R^3\sigma_0\cdot2\cdot\dfrac23 = \dfrac{8\pi R^3\sigma_0}{3}$.

          (c) $q_2 = 2\pi R^4\int_{-1}^1P_2\,\sigma\,du = 2\pi R^4\sigma_0\cdot2\cdot\dfrac25 = \dfrac{8\pi R^4\sigma_0}{5}$.

          (d) Only $\ell = 0, 1, 2$ appear, so outside the expansion stops: on the axis ($P_\ell(1) = 1$),

          $$V = \frac{1}{4\pi\varepsilon_0}\left(\frac{Q}{z} + \frac{p_z}{z^2} + \frac{q_2}{z^3}\right) = \frac{2\sigma_0R^2}{\varepsilon_0}\left(\frac1z + \frac{R}{3z^2} + \frac{R^2}{5z^3}\right)$$

          exactly. Check at $z = R$: $\dfrac{2\sigma_0R}{\varepsilon_0}\cdot\dfrac{23}{15}$, finite as it must be on a surface charge.

          (e) No. **Pattern:** a polynomial of degree $n$ in $\cos\theta$ contains $P_\ell$ only up to $\ell = n$, so the exterior potential stops at $1/r^{n+1}$.
        `,
      }),

      P({
        id: 'uD-mp-p13', title: 'Three charges to order 1/r³', big: true,
        q: md`On the $z$-axis: $+2q$ at $z = a$, $-q$ at $z = 0$, $-q$ at $z = -2a$. Find (a) $p_z$, (b) $q_2$. (c) Using the expansion through $1/r^3$, find $V$ at $z = 10a$ in units of $\dfrac{q}{4\pi\varepsilon_0a}$, and (d) the exact value there in the same units. (e) Find $V$ on the equatorial plane ($\theta = 90^\circ$) to order $1/r^3$.`,
        figHtml: FP_THREE,
        hints: [md`$Q = 0$, so $\vb p$ and the first nonzero term are origin-independent, but $q_2$ is not: use the origin given.`, md`On the axis, $V = \dfrac{1}{4\pi\varepsilon_0}\left(\dfrac{p_z}{z^2} + \dfrac{q_2}{z^3}\right)$.`, md`On the equator, $P_1(0) = 0$ and $P_2(0) = -\frac12$.`],
        parts: [
          { lbl: md`(a) $p_z$`, expr: '4*q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`(b) $q_2$`, expr: '-2*q*a^2', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`(c) $V(10a)$, expansion`, ans: 0.038, unit: '' },
          { lbl: md`(d) $V(10a)$, exact`, ans: 0.03889, unit: '' },
          { lbl: md`(e) $V(r, 90^\circ)$`, expr: 'q*a^2/(4*pi*eps0*r^3)', vars: { q: [1, 3], a: [0.5, 1], eps0: [0.5, 2], r: [5, 9] } },
        ],
        sol: md`
          $Q = 2q - q - q = 0$.

          (a) $p_z = 2q\cdot a + 0 + (-q)(-2a) = 4qa$.

          (b) $q_2 = \sum q_iz_i^2P_2(\pm1) = 2qa^2 - q\cdot4a^2 = -2qa^2$.

          (c) $V = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac{4a}{100a^2} - \dfrac{2a^2}{1000a^3}\right) = \dfrac{q}{4\pi\varepsilon_0a}(0.040 - 0.002) = 0.038$.

          (d) $\dfrac{q}{4\pi\varepsilon_0a}\left(\dfrac29 - \dfrac1{10} - \dfrac1{12}\right) = 0.03889$. The remaining 2% is the octupole ($\propto1/z^4$), about $(a/z)^2$ relative to the dipole, as expected.

          (e) $V = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q_2P_2(0)}{r^3} = \dfrac{qa^2}{4\pi\varepsilon_0r^3}$. The dipole term vanishes on the equator, so the quadrupole leads there.
        `,
      }),

      R(md`
        ### Level 6: harder than the exam
      `),

      P({
        id: 'uD-mp-p14', title: 'The exam ball near a point charge', big: true,
        q: md`The ball with $+\rho_0$ (north half) and $-\rho_0$ (south half), radius $R$, is centered at the origin; a point charge $q$ sits at $z = D$ with $D\gg R$. (a) In the dipole approximation find $F_z$ on the ball. (b) Find the ball's energy $U$ in the field of $q$. (c) The ball's octupole moment is $q_3 = -\pi R^6\rho_0/12$, and all even moments vanish. Writing $F_z = F_z^{(a)}\left(1 + c\,\dfrac{R^2}{D^2} + \cdots\right)$, find $c$. (d) Is there a torque?`,
        figHtml: FP_BALL_Q,
        hints: [md`$\vb F = (\vb p\cdot\nabla)\vb E_q$ with $E_{q,z} = -\dfrac{q}{4\pi\varepsilon_0(D - z)^2}$ on the axis below $q$.`, md`For (c), use Newton's third law: the force on the ball is minus the force on $q$, which is $q$ times the ball's field at $z = D$. That field has a dipole part and an octupole part.`, md`On the axis, an $\ell$-pole term $\dfrac{q_\ell}{4\pi\varepsilon_0z^{\ell+1}}$ has $E_z = \dfrac{(\ell+1)q_\ell}{4\pi\varepsilon_0z^{\ell+2}}$.`],
        parts: [
          { lbl: md`(a) $F_z$`, expr: '-q*R^4*rho0/(4*eps0*D^3)', vars: { q: [1, 3], R: [0.5, 1], rho0: [1, 3], eps0: [0.5, 2], D: [4, 8] } },
          { lbl: md`(b) $U$`, expr: 'q*R^4*rho0/(8*eps0*D^2)', vars: { q: [1, 3], R: [0.5, 1], rho0: [1, 3], eps0: [0.5, 2], D: [4, 8] } },
          { lbl: md`(c) $c$`, ans: -0.3333, unit: '' },
          { lbl: md`(d) Torque on the ball`, mc: [md`$pE_q$, turning $\vb p$ around`, md`zero because the ball is neutral`, md`zero: $\vb p\parallel\vb E_q$ (antiparallel)`, md`it can't be found without the octupole`], a: 2,
            why: [md`$|\vb p\times\vb E| = pE\sin180^\circ = 0$. (It is an unstable equilibrium: tilt it and the torque flips it.)`, md`Neutral objects can feel torques; the reason here is the alignment.`, null, md`Axial symmetry already forces the torque to vanish, to every order.`] },
        ],
        sol: md`
          (a) $p = \frac12\pi R^4\rho_0$. At the ball, $\dfrac{\partial E_{q,z}}{\partial z} = -\dfrac{2q}{4\pi\varepsilon_0D^3}$, so $F_z = -\dfrac{2qp}{4\pi\varepsilon_0D^3} = -\dfrac{qR^4\rho_0}{4\varepsilon_0D^3}$: pushed away.

          [[fig:f]]

          (b) $U = -\vb p\cdot\vb E_q = -p\left(-\dfrac{q}{4\pi\varepsilon_0D^2}\right) = \dfrac{qR^4\rho_0}{8\varepsilon_0D^2}$. Check: $F_z = -\partial U/\partial D$ with the ball fixed and $q$ moved is the force on $q$; the force on the ball is the opposite, $-\dfrac{qR^4\rho_0}{4\varepsilon_0D^3}$, matching (a).

          (c) The ball's axial field at $z = D$: $E_z = \dfrac{1}{4\pi\varepsilon_0}\left(\dfrac{2p}{D^3} + \dfrac{4q_3}{D^5} + \cdots\right)$. The force on the ball is $-qE_z$, so

          $$\frac{F_z}{F_z^{(a)}} = 1 + \frac{2q_3}{pD^2} = 1 + \frac{2(-\pi R^6\rho_0/12)}{(\pi R^4\rho_0/2)D^2} = 1 - \frac{R^2}{3D^2}$$

          so $c = -\frac13$. At $D = 3R$ the dipole result is about 4% too large.

          (d) Zero, by axial symmetry.

          **Method worth remembering:** the force of a point charge on any distribution is $-q\vb E_{\text{dist}}$ at the charge, so the multipole expansion of the distribution's own field gives the force order by order.
        `,
        figs: { f: { svg: FP_BALL_Q_SOL, cap: 'The field of $q$ points down at the ball, opposite to $\\mathbf p$: the ball is pushed toward the weaker field, away from $q$.' } },
      }),

      P({
        id: 'uD-mp-p15', title: 'A neutral conductor attracted by an induced dipole', big: true,
        q: md`A neutral conducting sphere of radius $R$ sits a distance $D\gg R$ from a point charge $q$. In a nearly uniform field $\vb E_0$, the sphere acquires $\vb p = 4\pi\varepsilon_0R^3\vb E_0$ (Griffiths Ex. 3.8). (a) Find $p$. (b) Find the magnitude of the force between them, to leading order. (c) Find the interaction energy, using $U = -\frac12\vb p\cdot\vb E_0$ for an induced dipole. (d) Using the image charges for a neutral sphere ($-qR/D$ at $R^2/D$ from the center, and $+qR/D$ at the center), find the exact force divided by (b) at $D = 4R$.`,
        figHtml: FP_COND,
        hints: [md`$E_0 = \dfrac{q}{4\pi\varepsilon_0D^2}$ at the sphere.`, md`$F = p\,\dfrac{\partial E}{\partial D}$ in magnitude, attractive (the induced dipole is aligned with the field).`, md`The $\frac12$ in $U$ accounts for the work done building up the induced dipole.`],
        parts: [
          { lbl: md`(a) $p$`, expr: 'q*R^3/D^2', vars: { q: [1, 3], R: [0.5, 1], D: [4, 8] } },
          { lbl: md`(b) $|F|$`, expr: 'q^2*R^3/(2*pi*eps0*D^5)', vars: { q: [1, 3], R: [0.5, 1], eps0: [0.5, 2], D: [4, 8] } },
          { lbl: md`(c) $U$`, expr: '-q^2*R^3/(8*pi*eps0*D^4)', vars: { q: [1, 3], R: [0.5, 1], eps0: [0.5, 2], D: [4, 8] } },
          { lbl: md`(d) $F_{\text{exact}}/F_{(b)}$ at $D = 4R$`, ans: 1.1022, unit: '' },
        ],
        sol: md`
          (a) $p = 4\pi\varepsilon_0R^3\cdot\dfrac{q}{4\pi\varepsilon_0D^2} = \dfrac{qR^3}{D^2}$, pointing away from $q$ (for $q>0$), aligned with the field.

          (b) $|F| = p\left|\dfrac{\partial E}{\partial D}\right| = \dfrac{qR^3}{D^2}\cdot\dfrac{2q}{4\pi\varepsilon_0D^3} = \dfrac{q^2R^3}{2\pi\varepsilon_0D^5}$, attractive.

          (c) $U = -\frac12pE_0 = -\dfrac{q^2R^3}{8\pi\varepsilon_0D^4}$. Check: $-\dfrac{dU}{dD} = -\dfrac{q^2R^3}{2\pi\varepsilon_0D^5}$, attraction of the same size as (b).

          (d) The exact force on $q$ from the images is $\dfrac{q^2}{4\pi\varepsilon_0}\left[\dfrac{R/D}{(D - R^2/D)^2} - \dfrac{R/D}{D^2}\right]$ (attractive). At $D = 4R$ this is $\dfrac{q^2}{4\pi\varepsilon_0R^2}\cdot0.002153$, versus $\dfrac{q^2}{4\pi\varepsilon_0R^2}\cdot0.001953$ from (b): ratio $1.102$. Expanding in $R/D$: $1 + \dfrac{3R^2}{2D^2} + \cdots$; the induced quadrupole and higher add the rest.

          **Pattern:** an induced moment brings an extra power of $1/D$ for each order, so neutral polarizable objects feel short-range forces.
        `,
      }),

      RF(md`
        !!method Patterns to remember
            - Moments: write $Q$ first. If $Q\ne0$, every $\vb p$ needs an origin; if $Q = 0$, it doesn't.
            - A density that is a single Legendre polynomial in $\cos\theta$ gives a single term outside, exactly. Rewrite polynomials in $\cos\theta$ as $P_\ell$'s first.
            - A quadrupole can hide along a symmetry axis; check a general direction with $\frac12[3(\hat{\mathbf n}\cdot\vb r')^2 - r'^2]$.
            - Forces on a neutral body come from field gradients: $1/D^3$ for a fixed dipole near a point charge, $1/D^4$ between two dipoles, $1/D^5$ for an induced dipole.
            - The force of a point charge on a distribution is $-q\vb E_{\text{dist}}$ at the charge: expand the distribution's field to get corrections.
      `),
    ],
  };

  // ===================================================================================================
  //  Lesson 3: delta-function concepts
  // ===================================================================================================
  const FD_RAD = radial({ fn: (r) => 1 / (r * r), rs: [[24, '\\epsilon', 'dash dim', -40]] });
  const FD_RAD1 = radial({ fn: (r) => 1 / r, rs: [] });
  const FD_INV = plt({ x: [0, 4], y: [0, 4], xl: 'r', yl: 'V', curves: [{ f: (r) => 1 / r, from: 0.25, lab: 'V = 1/r', labAt: 2.2 }] });
  const FD_SPIKE0 = spikes({ sp: [[0, '\\delta(x)']], ticks: [[0, '0']] });
  const FD_PT = point3({ r0: [1.6, 2, 1.8], lab: "q\\ \\text{at}\\ \\mathbf r_0" });
  const FD_EA = plt({ x: [0, 4], y: [0, 5], xl: 'r', yl: 'E_r', curves: [{ f: (r) => (1 + r) / (r * r), from: 0.3, lab: md`E_r = \dfrac{A(1 + r/a)}{r^2}`, labAt: 2.4 }], xt: [[1, 'a']] });
  const FD_SHELL = rings({ rs: [[60, 'R']], extra: (f) => { stint(f, f.arcPts(0, 0, 60, 60, 0, 360), '+', 0.5, 5); put(f, 42, -42, 'Q', ['tr', 'r'], 8); } });
  const FD_SHEET = sheets({ sh: [[0, '+', '\\sigma']], ticks: [[0, '0']], x0: -110, x1: 110 });
  const FD_JUMP = radial({ fn: (r) => (r < 60 ? 0.6 : 1.8 * (60 / r) ** 2), rs: [[60, 'R', '', -30]], mag: true, n: 11, W: 130 });
  const FD_VGEN = plt({ x: [0, 4], y: [0, 4], xl: 'r', yl: 'V', curves: [{ f: (r) => 1 / r + 0.6 * Math.exp(-r), from: 0.28, lab: 'V(r)', labAt: 2 }] });
  const FD_D3X = spikes({ sp: [[0, '\\delta(3x)']], ticks: [[-60, '-1'], [0, '0'], [60, '1']] });
  const FD_DX2 = spikes({ sp: [[-60, '', 70], [60, md`\delta(x^2 - 4)`, 70]], ticks: [[-60, '-2'], [0, '0'], [60, '2']] });
  const FD_LINE = radial({ fn: (r) => 1 / r, rs: [], olab: md`\lambda\ \text{(line, out of page)}` });
  const FD_LINE_V = (() => {
    const f = PF.fig();
    f.charge(0, 0, { q: '+', r: 6 });
    put(f, 0, 0, md`\lambda\ (\text{line, out of page})`, ['bl', 'b', 'l'], 10, 'small');
    const p0 = pol(10, 30), p = pol(110, 30);
    dl(f, p0[0], p0[1], p[0], p[1], { cls: 'dim dash thin' }); f.dot(p[0], p[1], 2.8);
    put(f, p[0], p[1], 'P', ['tr', 'r', 't'], 5);
    put(f, p[0] * 0.55, p[1] * 0.55, 's', ['tl', 't', 'l'], 5, 'small');
    return widen(f).svg();
  })();
  const FD_SCR = plt({ x: [0, 5], y: [0, 4], xl: 'r', yl: 'E_r', curves: [{ f: (r) => 1 / (r * r * (1 + r) ** 2), from: 0.3, lab: md`\dfrac{A}{r^2(1+r/a)^2}`, labAt: 1.6 }], xt: [[1, 'a']] });
  const FD_DCOS = spikes({ xl: '\\theta', sp: [[60, md`\delta(\cos\theta)`]], ticks: [[-60, '0'], [60, '\\pi/2'], [120, '\\pi']], x0: -70, x1: 150 });
  const FD_ECOS = plt({ x: [0, 8], y: [-1.5, 3], zero: true, xl: 'r', yl: 'E_r', curves: [{ f: (r) => 3 * Math.cos(r) / (r * r + 0.6), from: 0.5, lab: md`\dfrac{A\cos(r/a)}{r^2}`, labAt: 3.2 }] });
  const FD_ELN = plt({ x: [0, 6], y: [-3, 1.2], zero: true, xl: 'r', yl: 'E_r', curves: [{ f: (r) => Math.log(r) / (r * r), from: 0.45, lab: md`\dfrac{A\ln(r/a)}{r^2}`, labAt: 3.5 }], xt: [[1, 'a']] });
  const FD_SPH = point3({ r0: [1.8, 2.2, 2], lab: '\\mathbf r_0 = (r_0,\\theta_0,\\phi_0)' });
  const FD_DIPV = polarPt({ lab: md`V = \dfrac{Az}{r^3}` });
  const FD_DPRIME = (() => { const f = PF.fig(); axis(f, -120, 0, 130, 0, 'z', ['r', 'br']); f.arrow(-6, 0, -6, 60, { cls: 'thick', hs: 7 }); f.arrow(6, 0, 6, -60, { cls: 'thick', hs: 7 }); put(f, 6, -60, md`-p\,\delta'(z)`, ['tr', 'r'], 5, 'small'); return widen(f).svg(); })();
  const FD_CYL = cyl2({ a: 60 });
  const FD_FAR = plt({ x: [0, 6], y: [0, 4], xl: 'r', yl: 'r^2E_r', curves: [{ f: (r) => 1 + 2 * (1 - Math.exp(-r)), from: 0.02 }], yt: [[1, 'A'], [3, '3A']] });
  const FD_VEXP = plt({ x: [0, 5], y: [0, 4], xl: 'r', yl: 'V', curves: [{ f: (r) => Math.exp(-r) * (1 + r) / r, from: 0.28, lab: md`\dfrac{Ae^{-r/a}(1 + r/a)}{r}`, labAt: 1.6 }], xt: [[1, 'a']] });
  const FD_AB = rings({ rs: [[40, 'a', '', 200], [85, 'b', '', 330]] });
  const FD_VDISC = plt({ x: [0, 4], y: [0, 3.2], xl: 'r', yl: 'V', curves: [{ f: (r) => 1 / r, from: 0.35, to: 1.5 }, { f: (r) => 1.2 / (r * r), from: 1.5, to: 4 }], vlines: [[1.5, 'R']] });
  const FD_V1R2 = rings({ rs: [[50, 'R']], extra: (f) => { f.circle(0, 0, 110, { cls: 'dim dash thin' }); put(f, 78, -78, md`V\propto\dfrac{1}{r^2}`, ['tr', 'r'], 6, 'small'); } });
  const FD_GREEN = point3({ r0: [1.2, 2.6, 1.4], lab: "\\mathbf r'" });
  const FD_CUBE = cube();
  const FD_ENDPT = spikes({ xl: 'r', sp: [[-100, md`\delta(r)`]], ticks: [[-100, '0']], x0: -100, x1: 150 });
  const FD_STEP = plt({ x: [-3, 3], y: [-0.4, 1.6], zero: true, xl: 'x', yl: 'V', curves: [{ f: (x) => (x < 0 ? 0.02 : NaN), from: -3, to: 0 }, { f: (x) => (x > 0 ? 1 : NaN), from: 0.001, to: 3 }], yt: [[1, 'V_0']], xt: [[0, '0']], mr: 30 });
  const FD_VDELTA = spikes({ sp: [[0, md`V = A\,\delta(x)`, 70]], ticks: [[0, '0']] });
  const FD_EXPRAD = radial({ fn: (r) => 1 / (r * r), rs: [] });

  const L_DC = {
    id: 'uD-delta-concepts', title: 'Delta functions in ρ: concept ladder',
    steps: [
      RF(md`
        ### Level 1: recognize

        $\delta^3(\vb r - \vb r_0)$ is zero except at $\vb r_0$ and integrates to 1 over any volume containing $\vb r_0$; its units are 1/m³. A point charge $q$ at $\vb r_0$ is the density $\rho = q\,\delta^3(\vb r - \vb r_0)$.

        The identity behind every point charge: the field $\uv r/r^2$ has zero divergence for $r>0$, yet its flux through any sphere around the origin is $4\pi$. All of that flux comes from the origin:

        $$\nabla\cdot\left(\frac{\uv r}{r^2}\right) = 4\pi\delta^3(\vb r),\qquad \nabla^2\frac1r = -4\pi\delta^3(\vb r),\qquad \nabla^2\frac{1}{|\vb r - \vb r'|} = -4\pi\delta^3(\vb r - \vb r')$$

        [[fig:rad]]
      `, { rad: { svg: FD_RAD, cap: 'The field $\\hat{\\mathbf r}/r^2$: no divergence anywhere you can see, but flux $4\\pi$ through every sphere around $O$, however small.' } }),

      Q(md`What is $\nabla\cdot\left(\dfrac{\uv r}{r^2}\right)$, including the origin?`,
        [md`$0$ everywhere`, md`$\dfrac{1}{r^3}$`, md`$\delta^3(\vb r)$`, md`$4\pi\delta^3(\vb r)$`], 3,
        [md`True only for $r>0$. The flux through a small sphere of radius $\epsilon$ is $\dfrac{1}{\epsilon^2}\cdot4\pi\epsilon^2 = 4\pi$, not $0$.`, md`For $r>0$ the formula gives $\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot\dfrac{1}{r^2}\right) = 0$, not $1/r^3$.`, md`The flux is $4\pi$, so the weight of the spike is $4\pi$.`, null],
        md`For $r>0$: $\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot\dfrac{1}{r^2}\right) = 0$. The divergence theorem on a sphere of any radius gives $4\pi$. So the divergence is a spike at the origin with weight $4\pi$: $4\pi\delta^3(\vb r)$.`,
        { figHtml: FD_RAD }),

      Q(md`What is $\nabla^2\left(\dfrac1r\right)$?`,
        [md`$-4\pi\delta^3(\vb r)$`, md`$+4\pi\delta^3(\vb r)$`, md`$0$ everywhere`, md`$\dfrac{2}{r^3}$`], 0,
        [null, md`$\nabla(1/r) = -\uv r/r^2$: the minus sign carries through.`, md`Zero only for $r>0$; the origin carries the spike.`, md`$\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot\left(-\dfrac{1}{r^2}\right)\right) = 0$ for $r>0$, not $2/r^3$.`],
        md`$\nabla\dfrac1r = -\dfrac{\uv r}{r^2}$, so $\nabla^2\dfrac1r = -4\pi\delta^3(\vb r)$. With $V = \dfrac{q}{4\pi\varepsilon_0r}$: $\nabla^2V = -\dfrac{q}{\varepsilon_0}\delta^3(\vb r) = -\rho/\varepsilon_0$ with $\rho = q\delta^3$. The minus sign is Poisson's.`,
        { figHtml: FD_INV }),

      Q(md`What are the units of $\delta^3(\vb r)$?`,
        [md`None (dimensionless)`, md`1/m`, md`1/m³`, md`m³`], 2,
        [md`$\int\delta^3\,d\tau = 1$, and $d\tau$ has units m³, so $\delta^3$ must carry 1/m³.`, md`That is the one-dimensional $\delta(x)$.`, null, md`Inverted.`],
        md`$\int\delta^3(\vb r)\,d\tau = 1$ (dimensionless) and $d\tau$ is m³, so $\delta^3$ is 1/m³. Then $q\,\delta^3$ is C/m³, a charge density, as it should be.`,
        { figHtml: FD_SPIKE0 }),

      Q(md`$V(\vb r) = \dfrac{q}{4\pi\varepsilon_0|\vb r - \vb r_0|}$. What is $\rho$?`,
        [md`$q\,\delta^3(\vb r)$`, md`$q\,\delta^3(\vb r - \vb r_0)$`, md`$-q\,\delta^3(\vb r - \vb r_0)$`, md`$4\pi q\,\delta^3(\vb r - \vb r_0)$`], 1,
        [md`The spike sits where $|\vb r - \vb r_0| = 0$, at $\vb r_0$, not the origin.`, null, md`$\rho = -\varepsilon_0\nabla^2V$, and $\nabla^2$ of $1/|\vb r - \vb r_0|$ is $-4\pi\delta^3$: the two minus signs cancel.`, md`The $4\pi$ cancels against the $4\pi$ in $4\pi\varepsilon_0$.`],
        md`$\rho = -\varepsilon_0\nabla^2V = -\varepsilon_0\cdot\dfrac{q}{4\pi\varepsilon_0}\cdot(-4\pi)\delta^3(\vb r - \vb r_0) = q\,\delta^3(\vb r - \vb r_0)$.`,
        { figHtml: FD_PT }),

      RF(md`
        ### Level 2: set up

        **From E.** For $r>0$, $\rho = \varepsilon_0\nabla\cdot\vb E$ with the spherical formula $\dfrac{1}{r^2}\dfrac{d}{dr}(r^2E_r)$. Then test the origin: the charge inside a tiny sphere is $4\pi\varepsilon_0\lim_{r\to0}r^2E_r$.

        - limit finite and nonzero: a point charge $q_0\,\delta^3(\vb r)$;
        - limit zero: no point charge;
        - limit infinite: not a physical distribution (infinite charge near the origin).

        **From V.** For $r>0$, $\rho = -\varepsilon_0\nabla^2V$. At the origin, $V\approx\dfrac{q_0}{4\pi\varepsilon_0r}$ identifies $q_0 = 4\pi\varepsilon_0\lim_{r\to0}rV$.

        **Surfaces are deltas too.** A jump in $E_r$ at $r = R$ means $\sigma = \varepsilon_0(E_{\text{out}} - E_{\text{in}})$, i.e. a term $\sigma\,\delta(r - R)$ in $\rho$. A sheet at $z = 0$ is $\sigma\,\delta(z)$.

        !!trap The divergence formula is blind at the origin and at jumps
            $\frac{1}{r^2}\frac{d}{dr}(r^2E_r)$ only works where $E_r$ is smooth. Every place it can't see (the origin, a surface where $E_r$ jumps) must be checked by flux or by a jump condition.
      `),

      Q(md`$E_r = \dfrac{A(1 + r/a)}{r^2}$ everywhere. What is the charge?`,
        [md`A point charge $4\pi\varepsilon_0A$ at the origin, plus $\rho = \dfrac{\varepsilon_0A}{ar^2}$ for $r>0$`, md`Only $\rho = \dfrac{\varepsilon_0A}{ar^2}$; no point charge`, md`Only a point charge $4\pi\varepsilon_0A$`, md`A point charge $A$ plus $\rho = \dfrac{A}{ar^2}$`], 0,
        [null, md`$r^2E_r = A(1 + r/a)\to A\ne0$: there is a point charge.`, md`The $r/a$ part gives $r^2E_r = Ar/a$, whose derivative $A/a$ is not zero.`, md`Missing $\varepsilon_0$ and $4\pi\varepsilon_0$; check units: $A$ is V·m.`],
        md`$r^2E_r = A + Ar/a$. The constant $A$ is the point charge: $q_0 = 4\pi\varepsilon_0A$. The derivative gives $\rho = \dfrac{\varepsilon_0}{r^2}\cdot\dfrac{A}{a}$. (That cloud grows without limit in total charge: $Q_{\text{enc}} = 4\pi\varepsilon_0A(1 + r/a)$.)`,
        { figHtml: FD_EA }),

      Q(md`A thin spherical shell of radius $R$ carries total charge $Q$ uniformly. Which $\rho$ describes it?`,
        [md`$Q\,\delta(r - R)$`, md`$\dfrac{Q}{4\pi R^2}\delta(r - R)$`, md`$\dfrac{Q}{\frac43\pi R^3}\delta(r - R)$`, md`$\dfrac{Q}{2\pi R}\delta(r - R)$`], 1,
        [md`$\int Q\delta(r - R)\,4\pi r^2\,dr = 4\pi R^2Q$, not $Q$. Units are also off: C/m.`, null, md`That divides by a volume; the $\delta$ already supplies 1/m, so you need 1/m².`, md`That would be a ring's normalization.`],
        md`$\sigma = \dfrac{Q}{4\pi R^2}$ and $\rho = \sigma\,\delta(r - R)$. Check: $\int\rho\,d\tau = \sigma\int\delta(r - R)\,4\pi r^2\,dr = \sigma\cdot4\pi R^2 = Q$.`,
        { figHtml: FD_SHELL }),

      Q(md`An infinite sheet at $z = 0$ carries surface density $\sigma$. What is $\rho$?`,
        [md`$\sigma\,\delta^3(\vb r)$`, md`$\sigma\,\delta(x)\delta(y)$`, md`$\sigma\,\delta(z)$`, md`$\dfrac{\sigma}{z}$`], 2,
        [md`That is a single point.`, md`That is a line along $z$.`, null, md`Not localized on the sheet, and infinite at it in the wrong way.`],
        md`$\int\rho\,dz$ across the sheet must give $\sigma$: $\int\sigma\,\delta(z)\,dz = \sigma$. One $\delta$ for each direction in which the charge is squeezed: one for a sheet, two for a line, three for a point.`,
        { figHtml: FD_SHEET }),

      Q(md`$E_r$ is constant at $E_1$ just inside $r = R$ and $E_2$ just outside. What is the surface charge on $r = R$?`,
        [md`$\varepsilon_0(E_2 - E_1)$`, md`$\varepsilon_0(E_1 - E_2)$`, md`$\dfrac{E_2 - E_1}{\varepsilon_0}$`, md`$0$, since $E_r$ is finite on both sides`], 0,
        [null, md`Outside minus inside: positive surface charge makes the field jump **up** going outward.`, md`$\sigma$ has $\varepsilon_0$ in the numerator: $\Delta E = \sigma/\varepsilon_0$.`, md`Finite but discontinuous: the jump is the surface charge.`],
        md`Gauss on a thin pillbox: $E_2 - E_1 = \sigma/\varepsilon_0$. In $\rho$ it is $\varepsilon_0(E_2 - E_1)\,\delta(r - R)$, which is $\varepsilon_0\dfrac{d}{dr}$ of a step: the derivative of a jump is a delta.`,
        { figHtml: FD_JUMP }),

      Q(md`Given $V(r)$ near the origin, which quantity is the point charge at the origin?`,
        [md`$\lim_{r\to0}V$`, md`$4\pi\varepsilon_0\lim_{r\to0}r^2V$`, md`$-\varepsilon_0\nabla^2V$ evaluated at $r = 0$`, md`$4\pi\varepsilon_0\lim_{r\to0}rV$`], 3,
        [md`For a point charge $V\to\infty$; a finite $V(0)$ means no point charge.`, md`That is the $E$-test ($r^2E_r$); for $V\propto1/r$ it gives $0$.`, md`The formula $-\varepsilon_0\nabla^2V$ is undefined at the origin; that is the whole problem.`, null],
        md`Near a point charge $V\approx\dfrac{q_0}{4\pi\varepsilon_0r}$, so $q_0 = 4\pi\varepsilon_0\lim_{r\to0}rV$. Equivalent to the flux test, since $-r^2\dfrac{dV}{dr}\to\dfrac{q_0}{4\pi\varepsilon_0}$ too.`,
        { figHtml: FD_VGEN }),

      RF(md`
        ### Level 3: solve the standard case

        Two one-dimensional rules handle most integrals:

        $$\delta(kx) = \frac{\delta(x)}{|k|},\qquad \delta(g(x)) = \sum_{\text{roots }x_i}\frac{\delta(x - x_i)}{|g'(x_i)|}$$

        In two dimensions the line charge plays the role of the point charge: $\nabla\cdot\left(\dfrac{\hat{\mathbf s}}{s}\right) = 2\pi\delta(x)\delta(y)$ and $\nabla^2\ln s = 2\pi\delta(x)\delta(y)$. The test for a line charge on the axis is $2\pi\varepsilon_0\lim_{s\to0}sE_s$.
      `),

      Q(md`What is $\displaystyle\int_{-1}^{1}\delta(3x)\,dx$?`,
        [md`$3$`, md`$1$`, md`$\dfrac13$`, md`$0$`], 2,
        [md`Inverted: squeezing the argument makes the spike narrower, so the area shrinks.`, md`$\delta(3x)$ is not $\delta(x)$: substitute $u = 3x$, $dx = du/3$.`, null, md`The spike at $x = 0$ is inside the interval.`],
        md`$\delta(3x) = \delta(x)/3$. Units say the same: $\delta(3x)$ must integrate in $u = 3x$ to 1, so in $x$ it integrates to $\frac13$.`,
        { figHtml: FD_D3X }),

      Q(md`What is $\displaystyle\int_0^\infty x^3\,\delta(x^2 - 4)\,dx$?`,
        [md`$2$`, md`$8$`, md`$4$`, md`$0$`], 0,
        [null, md`$x^3$ at the root is 8, but you must divide by $|g'(2)| = 4$.`, md`Dividing by $2$ instead of $|g'(2)| = 2x = 4$.`, md`That also counts the root $x = -2$, whose $\dfrac{(-2)^3}{4} = -2$ cancels the $+2$. But $x = -2$ is outside $(0,\infty)$.`],
        md`$g(x) = x^2 - 4$ has roots $\pm2$; only $x = 2$ is in range, with $|g'(2)| = 4$. So the integral is $\dfrac{2^3}{4} = 2$.`,
        { figHtml: FD_DX2 }),

      Q(md`An infinite line charge $\lambda$ lies on the $z$-axis, with $\vb E = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat{\mathbf s}$. What is $\rho$?`,
        [md`$\lambda\,\delta(s)$`, md`$\lambda\,\delta^3(\vb r)$`, md`$0$ everywhere, because $\nabla\cdot(\hat{\mathbf s}/s) = 0$`, md`$\lambda\,\delta(x)\delta(y)$`], 3,
        [md`$\delta(s)$ alone has the wrong units (1/m) and an endpoint problem at $s = 0$; you need a 2-D delta, 1/m².`, md`That is one point; the charge is spread along all $z$.`, md`Zero only for $s>0$. The flux per unit length through a small cylinder is $\lambda/\varepsilon_0$.`, null],
        md`$\nabla\cdot\left(\dfrac{\hat{\mathbf s}}{s}\right) = 2\pi\delta(x)\delta(y)$, so $\rho = \varepsilon_0\cdot\dfrac{\lambda}{2\pi\varepsilon_0}\cdot2\pi\delta(x)\delta(y) = \lambda\,\delta(x)\delta(y)$: C/m per unit area of cross-section.`,
        { figHtml: FD_LINE }),

      Q(md`$V = -\dfrac{\lambda}{2\pi\varepsilon_0}\ln(s/s_0)$, the line-charge potential. What is $\nabla^2V$?`,
        [md`$0$ everywhere`, md`$-\dfrac{\lambda}{\varepsilon_0}\delta(x)\delta(y)$`, md`$+\dfrac{\lambda}{2\pi\varepsilon_0s^2}$`, md`$+\dfrac{\lambda}{\varepsilon_0}\delta(x)\delta(y)$`], 1,
        [md`$\nabla^2\ln s = \frac1s\frac{d}{ds}(s\cdot\frac1s) = 0$ only for $s>0$.`, null, md`That is $d^2V/ds^2$, not the cylindrical Laplacian $\frac1s\frac{d}{ds}(s\frac{dV}{ds})$, which is $0$ for $s>0$.`, md`Sign: $\nabla^2V = -\rho/\varepsilon_0$, and $\rho>0$ for $\lambda>0$.`],
        md`$\nabla^2\ln s = 2\pi\delta(x)\delta(y)$, so $\nabla^2V = -\dfrac{\lambda}{2\pi\varepsilon_0}\cdot2\pi\delta(x)\delta(y) = -\dfrac{\lambda}{\varepsilon_0}\delta(x)\delta(y)$: Poisson with $\rho = \lambda\delta(x)\delta(y)$.`,
        { figHtml: FD_LINE_V }),

      Q(md`$E_r = \dfrac{A}{r^2(1 + r/a)^2}$, $A>0$. What is the total charge (point charge plus everything else)?`,
        [md`$4\pi\varepsilon_0A$`, md`$-4\pi\varepsilon_0A$`, md`$0$`, md`infinite`], 2,
        [md`That is the point charge at the origin. The cloud cancels it.`, md`That is the cloud alone.`, null, md`$r^2E_r\to0$ far away, so the enclosed charge goes to zero.`],
        md`Near the origin $r^2E_r\to A$: point charge $4\pi\varepsilon_0A$. Far away $r^2E_r\approx\dfrac{Aa^2}{r^2}\to0$, so $Q_{\text{tot}} = 0$. The cloud carries $-4\pi\varepsilon_0A$, screening the point charge. **Total charge from the far field: $Q_{\text{tot}} = 4\pi\varepsilon_0\lim_{r\to\infty}r^2E_r$.**`,
        { figHtml: FD_SCR }),

      Q(md`What is $\displaystyle\int_0^\pi g(\theta)\,\delta(\cos\theta)\sin\theta\,d\theta$?`,
        [md`$g(0)$`, md`$g(\pi/2)$`, md`$-g(\pi/2)$, because $d(\cos\theta) = -\sin\theta\,d\theta$`, md`$0$`], 1,
        [md`$\cos\theta = 0$ at $\theta = \pi/2$, not $0$.`, null, md`The minus sign from $du = -\sin\theta\,d\theta$ is cancelled by the flipped limits: $\theta$ from $0$ to $\pi$ is $u$ from $1$ to $-1$, so the integral is $\int_{-1}^{1}g\,\delta(u)\,du$.`, md`The root $\pi/2$ is inside $(0,\pi)$.`],
        md`With $u = \cos\theta$: $\int_{-1}^{1}g(\theta(u))\,\delta(u)\,du = g(\pi/2)$. This is why $\delta(\cos\theta)$ is the natural way to pin charge to the $xy$-plane in spherical coordinates.`,
        { figHtml: FD_DCOS }),

      Q(md`What is $\nabla\cdot\left(\dfrac{\uv r}{r}\right)$, including the origin?`,
        [md`$\dfrac{1}{r^2} + 4\pi\delta^3(\vb r)$`, md`$4\pi\delta^3(\vb r)$`, md`$0$`, md`$\dfrac{1}{r^2}$, with no delta`], 3,
        [md`The flux through a sphere of radius $\epsilon$ is $\frac1\epsilon\cdot4\pi\epsilon^2 = 4\pi\epsilon\to0$: nothing sits at the origin.`, md`That is $\uv r/r^2$.`, md`$\frac{1}{r^2}\frac{d}{dr}(r^2\cdot\frac1r) = \frac{1}{r^2}$, not 0.`, null],
        md`$r^2\cdot\dfrac1r = r\to0$, so the flux test finds no point source. The $1/r^2$ is integrable ($\int\frac{1}{r^2}4\pi r^2\,dr$ is finite), so it is an ordinary density. Only $1/r^2$-type fields hide a delta.`,
        { figHtml: FD_RAD1 }),

      R(md`
        ### Level 4: one twist

        Now the fields are disguised: extra factors, logarithms, angular dependence, Cartesian forms.
      `),

      Q(md`$E_r = \dfrac{A\cos(r/a)}{r^2}$ for all $r>0$. What is the charge?`,
        [md`A point charge $4\pi\varepsilon_0A$ plus $\rho = -\dfrac{\varepsilon_0A\sin(r/a)}{ar^2}$`, md`Only $\rho = -\dfrac{\varepsilon_0A\sin(r/a)}{ar^2}$`, md`A point charge $4\pi\varepsilon_0A$ and nothing else`, md`No point charge, because $\cos(r/a)$ oscillates`], 0,
        [null, md`$r^2E_r = A\cos(r/a)\to A$: there is a point charge.`, md`$\frac{d}{dr}\cos(r/a)\ne0$, so the cloud is there too.`, md`What matters is the limit at the origin, $\cos0 = 1$.`],
        md`$q_0 = 4\pi\varepsilon_0\lim r^2E_r = 4\pi\varepsilon_0A$. For $r>0$: $\rho = \dfrac{\varepsilon_0}{r^2}\dfrac{d}{dr}A\cos(r/a) = -\dfrac{\varepsilon_0A\sin(r/a)}{ar^2}$, alternating in sign in shells.`,
        { figHtml: FD_ECOS }),

      Q(md`$E_r = \dfrac{A\ln(r/a)}{r^2}$ ($A>0$) is claimed for all $r>0$. What is at the origin?`,
        [md`A point charge $-4\pi\varepsilon_0A$`, md`No point charge`, md`A point dipole`, md`Nothing physical: $Q_{\text{enc}}(r) = 4\pi\varepsilon_0A\ln(r/a)\to-\infty$ as $r\to0$`], 3,
        [md`$r^2E_r = A\ln(r/a)$ has no finite limit.`, md`The limit isn't zero either; it diverges.`, md`A dipole has zero flux through small spheres; here the flux diverges.`, null],
        md`The enclosed charge $4\pi\varepsilon_0r^2E_r$ diverges logarithmically as $r\to0$, and $\rho = \dfrac{\varepsilon_0A}{r^3}$ has an infinite positive integral near the origin. An infinite negative point charge would be needed to balance it: not a physical distribution. **When $r^2E_r$ has no finite limit, say so; don't invent a delta.**`,
        { figHtml: FD_ELN }),

      Q(md`In spherical coordinates, what is $\delta^3(\vb r - \vb r_0)$ for $\vb r_0 = (r_0, \theta_0, \phi_0)$ (not on the $z$-axis)?`,
        [md`$\delta(r - r_0)\delta(\theta - \theta_0)\delta(\phi - \phi_0)$`, md`$\dfrac{\delta(r - r_0)\delta(\theta - \theta_0)\delta(\phi - \phi_0)}{r^2\sin\theta}$`, md`$\dfrac{\delta(r - r_0)\delta(\theta - \theta_0)\delta(\phi - \phi_0)}{r^2}$`, md`$r^2\sin\theta\,\delta(r - r_0)\delta(\theta - \theta_0)\delta(\phi - \phi_0)$`], 1,
        [md`Then $\int\delta^3\,d\tau = r_0^2\sin\theta_0\ne1$, and the units are 1/m, not 1/m³.`, null, md`The $\sin\theta$ from $d\tau$ is not cancelled.`, md`Multiplied instead of divided.`],
        md`$d\tau = r^2\sin\theta\,dr\,d\theta\,d\phi$, so dividing by the Jacobian makes the integral 1. Equivalently $\dfrac{\delta(r - r_0)\delta(\cos\theta - \cos\theta_0)\delta(\phi - \phi_0)}{r^2}$.`,
        { figHtml: FD_SPH }),

      Q(md`$V = \dfrac{Az}{r^3}$ everywhere ($r$ the spherical radius). What is the charge?`,
        [md`A point charge $4\pi\varepsilon_0A$ at the origin`, md`A point dipole $\vb p = 4\pi\varepsilon_0A\,\hat{\mathbf z}$ at the origin, nothing else`, md`$\rho = -\varepsilon_0\nabla^2V\ne0$ for $r>0$`, md`No charge at all, since $V\to0$ at infinity`], 1,
        [md`$z/r^3 = \cos\theta/r^2$: a dipole potential. The flux through any sphere around the origin is zero, so there is no net point charge.`, null, md`$\nabla^2(\cos\theta/r^2) = 0$ for $r>0$ (it is the $\ell = 1$ exterior solution).`, md`$V\ne0$, and $V$ is singular at the origin: there is a source there.`],
        md`$V = \dfrac{A\cos\theta}{r^2} = \dfrac{\vb p\cdot\uv r}{4\pi\varepsilon_0r^2}$ with $\vb p = 4\pi\varepsilon_0A\,\hat{\mathbf z}$. In $\rho$ it is $-\vb p\cdot\nabla\delta^3(\vb r)$: zero net charge, but a dipole moment. A $1/r$ singularity in $V$ is a point charge; $\cos\theta/r^2$ is a point dipole.`,
        { figHtml: FD_DIPV }),

      Q(md`A point dipole has $\rho = -p\,\dfrac{\partial}{\partial z}\delta^3(\vb r)$. What is $\int z\,\rho\,d\tau$?`,
        [md`$-p$`, md`$0$`, md`$p$`, md`It diverges`], 2,
        [md`Integration by parts flips the sign once: $-\int z\,\partial_z\delta = +\int\delta\,\partial_zz$.`, md`That is $\int\rho\,d\tau$, the net charge.`, null, md`Derivatives of deltas are fine inside integrals against smooth functions.`],
        md`$\int z\left(-p\,\partial_z\delta^3\right)d\tau = p\int\delta^3\,\partial_z z\,d\tau = p$. So this $\rho$ has $Q = 0$ and $p_z = p$: a $+$ spike just above a $-$ spike, squeezed together.`,
        { figHtml: FD_DPRIME }),

      Q(md`In 2-D: $\vb E = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat{\mathbf s}$ for $s<a$, and $\vb E = 0$ for $s>a$. What sits on the cylinder $s = a$?`,
        [md`$\sigma = +\dfrac{\lambda}{2\pi a}$`, md`$\sigma = -\dfrac{\lambda}{a}$`, md`$\sigma = -\dfrac{\lambda}{2\pi a}$`, md`Nothing: $E$ is finite on both sides`], 2,
        [md`$E_s$ drops to zero going out, so $\sigma<0$.`, md`Missing $2\pi$: the charge per length on the cylinder is $\sigma\cdot2\pi a = -\lambda$.`, null, md`Finite but discontinuous: a jump means surface charge.`],
        md`$\sigma = \varepsilon_0(E_{\text{out}} - E_{\text{in}}) = -\dfrac{\lambda}{2\pi a}$. Per unit length that is $-\lambda$: a coaxial cable, neutral overall.`,
        { figHtml: FD_CYL }),

      Q(md`$r^2E_r$ (plotted) rises from $A$ at the origin to $3A$ far away. What is the total charge, and how much of it is in the cloud ($r>0$)?`,
        [md`Total $4\pi\varepsilon_0A$; cloud $0$`, md`Total $8\pi\varepsilon_0A$; cloud $8\pi\varepsilon_0A$`, md`Can't tell without $\rho$`, md`Total $12\pi\varepsilon_0A$; cloud $8\pi\varepsilon_0A$`], 3,
        [md`$4\pi\varepsilon_0A$ is the point charge only.`, md`The cloud is $8\pi\varepsilon_0A$, but the total includes the point charge.`, md`$Q_{\text{enc}}(r) = 4\pi\varepsilon_0r^2E_r$ gives everything at once.`, null],
        md`$Q_{\text{enc}}(r) = 4\pi\varepsilon_0r^2E_r$. At $r\to0$: the point charge $4\pi\varepsilon_0A$. At $r\to\infty$: the total $12\pi\varepsilon_0A$. The cloud is the difference. You never needed $\rho$ itself.`,
        { figHtml: FD_FAR }),

      R(md`
        ### Level 5: exam level

        The exam pattern: given a piecewise $\vb E$ or $V$, find $\rho$ everywhere (origin, volume, surfaces) and check that it adds up to what the far field says.
      `),

      Q(md`$V = \dfrac{Ae^{-r/a}(1 + r/a)}{r}$. What is the total charge?`,
        [md`$4\pi\varepsilon_0A$`, md`$-4\pi\varepsilon_0A$`, md`infinite`, md`$0$`], 3,
        [md`That is the point charge alone ($rV\to A$).`, md`That is the cloud alone.`, md`$V$ and $\vb E$ decay exponentially; nothing diverges.`, null],
        md`Far away $V$ falls faster than any power, so $r^2E_r\to0$: $Q_{\text{tot}} = 0$. The point charge $4\pi\varepsilon_0A$ (from $rV\to A$) is exactly cancelled by the cloud.`,
        { figHtml: FD_VEXP }),

      Q(md`For the same $V$, $\rho = \dfrac{\varepsilon_0Ae^{-r/a}(a - r)}{a^3r}$ for $r>0$. Which description is right?`,
        [md`The cloud is negative everywhere, screening the point charge`, md`The cloud is positive for $r<a$ and negative for $r>a$; the net cloud charge is $-4\pi\varepsilon_0A$`, md`The cloud is positive everywhere`, md`The cloud is negative for $r<a$ and positive for $r>a$`], 1,
        [md`$(a - r)>0$ for $r<a$: the cloud starts positive.`, null, md`$(a - r)<0$ for $r>a$.`, md`Sign swapped; $A, a>0$.`],
        md`The sign of $\rho$ is the sign of $a - r$. The cloud adds positive charge near the core and more negative charge outside, for a net $-4\pi\varepsilon_0A$. You can see it in $Q_{\text{enc}}(r) = 4\pi\varepsilon_0Ae^{-r/a}(1 + r/a + r^2/a^2)$: it rises at first, then decays.`,
        { figHtml: FD_VEXP }),

      Q(md`$E_r = \dfrac{k}{r^2}$ for $r<a$, $\dfrac{k}{a^2}$ for $a<r<b$, $0$ for $r>b$ ($k>0$). What sits on the spheres $r = a$ and $r = b$?`,
        [md`$\sigma_a = 0$ and $\sigma_b = -\dfrac{\varepsilon_0k}{a^2}$`, md`$\sigma_a = -\dfrac{\varepsilon_0k}{a^2}$ and $\sigma_b = 0$`, md`$\sigma_a = \sigma_b = 0$`, md`$\sigma_a = \dfrac{\varepsilon_0k}{a^2}$ and $\sigma_b = -\dfrac{\varepsilon_0k}{b^2}$`], 0,
        [null, md`$E_r$ is continuous at $a$ ($k/a^2$ on both sides) and jumps at $b$.`, md`At $r = b$ the field drops from $k/a^2$ to $0$.`, md`No jump at $a$; and the jump at $b$ is from $k/a^2$, not $k/b^2$.`],
        md`$\sigma = \varepsilon_0(E_{\text{out}} - E_{\text{in}})$. At $a$: $\frac{k}{a^2} - \frac{k}{a^2} = 0$. At $b$: $0 - \frac{k}{a^2}$. A kink in $E_r$ (at $a$) is not a surface charge; only a jump is.`,
        { figHtml: FD_AB }),

      Q(md`$V = A/r$ for $r<R$ and $V = B/r^2$ for $r>R$, with $B\ne AR$. What is on the sphere $r = R$?`,
        [md`A surface charge only`, md`A dipole layer: $V$ jumps, so $E_r$ has a $\delta(r - R)$ and $\rho$ has a $\delta'(r - R)$`, md`Nothing; only the jump in $E_r$ matters`, md`A point charge`], 1,
        [md`A surface charge makes $E$ jump, not $V$. A jump in $V$ needs more.`, null, md`A jump in $V$ means an infinite $E$ at the surface; that is a source.`, md`Point charges live at points, not on spheres.`],
        md`$E_r = -dV/dr$ contains $-(V_{\text{out}} - V_{\text{in}})\delta(r - R)$, and $\rho = \varepsilon_0\nabla\cdot\vb E$ then contains $\delta'$: two opposite sheets pressed together, a dipole layer. (When $E_r$ also jumps, an ordinary surface charge sits there too; the jump in $V$ is what demands the dipole layer.) Physical charge layers of finite thickness can't make $V$ jump, which is why problems assume $V$ continuous: here $B = AR$.`,
        { figHtml: FD_VDISC }),

      Q(md`Outside a ball, $V$ is exactly $\propto1/r^2$ with no angular dependence. What does that imply?`,
        [md`The ball is a pure dipole`, md`Nothing: $1/r^2$ solves Laplace's equation`, md`The ball has a quadrupole moment`, md`There is charge outside the ball, out to infinity: $\nabla^2(1/r^2) = 2/r^4\ne0$`], 3,
        [md`A dipole's $V$ carries $\cos\theta$.`, md`$\frac{1}{r^2}\frac{d}{dr}\left(r^2\cdot\left(-\frac{2}{r^3}\right)\right) = \frac{2}{r^4}\ne0$.`, md`A quadrupole falls as $1/r^3$ with $P_2$ angular dependence.`, null],
        md`The only spherically symmetric solutions of Laplace's equation are $1/r$ and constants. $V\propto1/r^2$ needs $\rho = -\varepsilon_0\nabla^2V\propto-1/r^4$, a cloud extending to infinity. Its total converges ($\int r^{-4}r^2\,dr$), which is how $Q_{\text{tot}}$ can be $0$ while $V\ne0$.`,
        { figHtml: FD_V1R2 }),

      Q(md`What is $\nabla'^2\dfrac{1}{|\vb r - \vb r'|}$, taking derivatives with respect to the source point $\vb r'$?`,
        [md`$+4\pi\delta^3(\vb r - \vb r')$`, md`$-4\pi\delta^3(\vb r - \vb r')$`, md`$0$`, md`$-4\pi\delta^3(\vb r')$`], 1,
        [md`Each derivative flips sign, but $\nabla'^2$ has two of them.`, null, md`Zero only away from $\vb r' = \vb r$.`, md`The spike is at $\vb r' = \vb r$, not at the origin.`],
        md`$1/|\vb r - \vb r'|$ is symmetric in $\vb r$ and $\vb r'$, so $\nabla'^2$ gives the same $-4\pi\delta^3(\vb r - \vb r')$. That symmetry is why the potential at $\vb r$ from a charge at $\vb r'$ equals the potential at $\vb r'$ from the same charge at $\vb r$.`,
        { figHtml: FD_GREEN }),

      R(md`
        ### Level 6: harder than the exam
      `),

      Q(md`What is $\displaystyle\int_{\text{cube}}\nabla\cdot\left(\frac{\uv r}{r^2}\right)d\tau$ over the cube $0<x, y, z<a$, whose corner is at the origin?`,
        [md`$4\pi$`, md`$0$, since the origin is on the boundary`, md`$\dfrac{\pi}{2}$`, md`$\dfrac{4\pi}{6}$`], 2,
        [md`The cube only sees one-eighth of the directions out of the origin.`, md`Do the flux directly: the three far faces have nonzero flux.`, null, md`The cube's six faces don't split solid angle equally around a corner; the relevant fraction is one octant, $1/8$.`],
        md`Use the divergence theorem: the three faces through the origin have $\uv r$ tangent, so no flux. The three far faces see all directions in one octant, solid angle $4\pi/8$, so the flux is $\pi/2$. Corner deltas count with the fraction of solid angle inside: $\frac18$ here, $\frac12$ on a flat face.`,
        { figHtml: FD_CUBE }),

      Q(md`Someone writes a point charge at the origin as $\rho = \dfrac{q\,\delta(r)}{4\pi r^2}$. What goes wrong?`,
        [md`Nothing: it integrates to $q$`, md`It describes a shell, not a point`, md`It has the wrong units`, md`$\int_0^\infty\delta(r)\,dr$ is ambiguous (the spike sits on the endpoint; by symmetry it is $\frac12$), so this gives $q/2$ or is undefined`], 3,
        [md`$\int\rho\,d\tau = q\int_0^\infty\delta(r)\,dr$, and that integral sits on the endpoint $r = 0$.`, md`$\delta(r - R)$ would be a shell; $\delta(r)$ puts it at the center.`, md`$\delta(r)/r^2$ is 1/m³; units are fine.`, null],
        md`Use $\delta^3(\vb r)$, which is defined in Cartesian coordinates and integrates to exactly 1. Radial deltas $\delta(r - R)$ are safe for $R>0$; at $R = 0$ they hit the edge of the integration range.`,
        { figHtml: FD_ENDPT }),

      Q(md`$V = V_0$ for $x>0$ and $V = 0$ for $x<0$ (a step). What is at $x = 0$?`,
        [md`A sheet with $\sigma = \varepsilon_0V_0$`, md`A dipole layer with dipole moment per area $\varepsilon_0V_0$, pointing toward $+x$ (the high side)`, md`A dipole layer pointing toward $-x$`, md`Nothing: $E = 0$ on both sides`], 1,
        [md`A sheet gives a kink in $V$ (a jump in $E$), not a jump in $V$.`, null, md`$\vb p$ points from $-$ to $+$, and $V$ is higher on the $+$ side.`, md`$E = -V_0\delta(x)\hat{\mathbf x}$: infinite at the layer.`],
        md`$E_x = -V_0\delta(x)$, so $\rho = \varepsilon_0\dfrac{dE_x}{dx} = -\varepsilon_0V_0\delta'(x)$. Then $\int\rho\,dx = 0$ and $\int x\rho\,dx = \varepsilon_0V_0$. Between $+\sigma$ (right) and $-\sigma$ (left) a distance $\epsilon$ apart, $\Delta V = \sigma\epsilon/\varepsilon_0$: the dipole layer.`,
        { figHtml: FD_STEP }),

      Q(md`$V = A\,\delta(x)$ (1-D). What charge distribution is this?`,
        [md`A sheet of charge at $x = 0$`, md`A dipole layer`, md`$\rho = 0$: $V$ is zero away from $x = 0$`, md`A quadrupole layer: $\rho = -\varepsilon_0A\,\delta''(x)$, three sheets ($+, -2, +$ for $A<0$) squeezed together, with $Q = 0$ and dipole moment $0$`], 3,
        [md`A sheet gives a kink in $V$.`, md`A dipole layer gives a step in $V$.`, md`$V$ is zero away from the origin, but singular there: something must sit at $x = 0$.`, null],
        md`$\rho = -\varepsilon_0V'' = -\varepsilon_0A\delta''(x)$. Its moments: $\int\rho = 0$, $\int x\rho = 0$, $\int x^2\rho = -2\varepsilon_0A$. Sheets $+\sigma, -2\sigma, +\sigma$ at $-h, 0, h$ give $V$ with area $-\sigma h^2/\varepsilon_0$, a narrowing bump that becomes $A\delta(x)$ with $A = -\sigma h^2/\varepsilon_0$. Physically meaningless at finite energy, but a clean exercise in reading derivatives of deltas: each extra derivative is one more layer of cancellation.`,
        { figHtml: FD_VDELTA }),

      Q(md`What is $\displaystyle\int_{\text{all space}}e^{-r/a}\,\nabla\cdot\left(\frac{\uv r}{r^2}\right)d\tau$?`,
        [md`$4\pi$`, md`$0$`, md`$4\pi a$`, md`It diverges`], 0,
        [null, md`$\nabla\cdot(\uv r/r^2)$ is zero for $r>0$, but the delta at the origin picks up $e^0 = 1$.`, md`The delta picks the value at a point; there is no length.`, md`$e^{-r/a}$ is finite at the origin.`],
        md`$\int e^{-r/a}\,4\pi\delta^3(\vb r)\,d\tau = 4\pi e^0 = 4\pi$. Check by parts: $-\int\frac{\uv r}{r^2}\cdot\nabla e^{-r/a}\,d\tau = \int\frac{e^{-r/a}}{ar^2}4\pi r^2\,dr = 4\pi$. Same answer, no delta needed.`,
        { figHtml: FD_EXPRAD }),

      RF(md`
        !!method Patterns to remember
            - Point charge at the origin: $4\pi\varepsilon_0\lim r^2E_r$ (from $\vb E$) or $4\pi\varepsilon_0\lim rV$ (from $V$). Finite and nonzero means a delta; infinite means unphysical.
            - Total charge: $4\pi\varepsilon_0\lim_{r\to\infty}r^2E_r$. The cloud is total minus point.
            - Jumps: in $E_\perp$ a surface charge ($\delta$ in $\rho$); in $V$ a dipole layer ($\delta'$ in $\rho$).
            - $\cos\theta/r^2$ in $V$ is a point dipole, not a charge. In 2-D, $\ln s$ and $\hat{\mathbf s}/s$ are line charges ($2\pi\delta^2$).
            - $\delta(g(x)) = \sum\delta(x - x_i)/|g'(x_i)|$; in spherical coordinates divide by $r^2\sin\theta$.
      `),
    ],
  };

  // ===================================================================================================
  //  Lesson 4: delta-function problems
  // ===================================================================================================
  const FQ_R0 = point3({ r0: [1, 2, 2], Rs: 60, Rlab: md`\text{ball, radius }2`, ticks: [[1, '1', 'x'], [2, '2', 'y'], [2, '2', 'z']] });
  const FQ_AXIS = (() => {
    const f = PF.fig();
    axis(f, 0, 30, 0, -130, 'z', ['t', 'tr']);
    f.dot(0, 0, 3); put(f, 0, 0, 'O', ['l', 'bl'], 6);
    f.dot(0, -70, 3); put(f, 0, -70, 'z = a', ['l', 'tl'], 6, 'small');
    f.dot(110, -50, 2.8); dl(f, 0, 0, 110, -50, { cls: 'dim dash thin' }); dl(f, 0, -70, 110, -50, { cls: 'dim dash thin' }); put(f, 110, -50, 'P', ['r', 'tr'], 5);
    put(f, 55, -25, 'r', ['br', 'b'], 4, 'small'); put(f, 55, -60, md`|\mathbf r - a\hat{\mathbf z}|`, ['tr', 't', 'r'], 5, 'small');
    return widen(f).svg();
  })();
  const FQ_SLAB = plt({ x: [-2, 2], y: [-1.3, 1.3], zero: true, xl: 'x', yl: 'E_x', curves: [{ f: (x) => (x > 0 ? 1 - x : NaN), from: 0.001, to: 1 }, { f: (x) => (x < 0 ? -1 - x : NaN), from: -1, to: -0.001 }, { f: () => 0.0, from: -2, to: -1 }, { f: () => 0.0, from: 1, to: 2 }], xt: [[-1, '-d'], [1, 'd']], yt: [[1, 'E_0'], [-1, '-E_0']] });
  const FQ_SPK = spikes({ sp: [[60, md`\delta(2x - 4)`]], ticks: [[0, '0'], [60, '2']], x0: -60, curve: (x) => 6 * Math.exp((x - 60) / 50), clab: 'e^x' });
  const FQ_EIN = plt({ x: [0, 1.5], y: [0, 6], xl: 'r', yl: 'E_r', curves: [{ f: (r) => (r < 1 ? 1 / (r * r) - 1 : 0), from: 0.38, to: 1.5, lab: md`A\left(\dfrac{1}{r^2} - \dfrac{1}{R^2}\right)`, labAt: 0.62 }], xt: [[1, 'R']] });
  const FQ_CYL = cyl2({ a: 60 });
  const FQ_SPH = point3({ r0: [0, 2, 2], Rs: 90, Rlab: md`\text{radius }3a`, ticks: [[2, '2a', 'y'], [2, '2a', 'z']] });
  const FQ_ES = plt({ x: [0, 1.5], y: [0, 5], xl: 's', yl: 'E_s', curves: [{ f: (s) => (s < 1 ? 1 / s - s : 0), from: 0.2, to: 1.5, lab: md`\dfrac{\lambda}{2\pi\varepsilon_0}\left(\dfrac1s - \dfrac{s}{a^2}\right)`, labAt: 0.45 }], xt: [[1, 'a']] });
  const FQ_AB = rings({ rs: [[40, 'a', '', 200], [85, 'b', '', 330]] });
  const FQ_AB_SOL = rings({ rs: [[40, '', 'dim dash thin'], [85, '']], tint: [[40, 85, '+', 0.22]], extra: (f) => { stint(f, f.arcPts(0, 0, 85, 85, 0, 360), '-', 0.7, 5); f.charge(0, 0, { q: '+', r: 6 }); put(f, 0, -12, 'q_0', ['t', 'tr'], 4, 'small'); put(f, 58, -30, md`\rho\propto\tfrac1r`, ['r', 'tr'], 4, 'small'); put(f, 62, -62, md`\sigma_b<0`, ['tr', 'r'], 6, 'small'); } });
  const FQ_RV = rings({ rs: [[60, 'R', '', 210]], labs: [[md`V = A/r`, 0, -90], [md`V = B/r^2`, 90, 30]] });
  const FQ_RV_SOL = rings({ rs: [[60, '']], extra: (f) => { stint(f, f.arcPts(0, 0, 60, 60, 0, 360), '+', 0.6, 5); f.add(`<path class="nodecl" style="fill:var(--bad);fill-opacity:.14;stroke:none" d="${dpath(f.arcPts(0, 0, 130, 130, 0, 360).concat(f.arcPts(0, 0, 64, 64, 360, 0)))}"/>`); f.track(-130, -130, 130, 130); f.charge(0, 0, { q: '+', r: 6 }); put(f, 0, -10, 'q_0', ['t'], 4, 'small'); put(f, 44, -44, md`\sigma>0`, ['tr', 'r'], 8, 'small'); put(f, 100, -40, md`\rho\propto-\tfrac{1}{r^4}`, ['r', 'tr'], 4, 'small'); } });
  const FQ_DIPCLOUD = polarPt({ lab: md`V = \dfrac{A\cos\theta\,e^{-r/a}}{r^2}` });
  const FQ_RING = ring3({ dens: () => 0.8, lab: 'Q', Rlab: true });

  const L_DP = {
    id: 'uD-delta-problems', title: 'Delta functions in ρ: problem ladder',
    steps: [
      R(md`
        ### Level 1: recognize
      `),

      P({
        id: 'uD-delta-p1', title: 'Picking out values',
        q: md`$\vb r_0 = (1, 2, 2)$ (lengths in m). Evaluate (a) $\displaystyle\int_{\text{all space}}(r^2 + 2)\,\delta^3(\vb r - \vb r_0)\,d\tau$; (b) $\displaystyle\int_{\text{all space}}(\vb r\cdot\vb c)\,\delta^3(\vb r - \vb r_0)\,d\tau$ with $\vb c = (3, 0, -1)$; (c) the integral in (a), but over the ball of radius 2 centered at the origin; (d) the same over the ball of radius 4.`,
        figHtml: FQ_R0,
        hints: [md`$\int f(\vb r)\,\delta^3(\vb r - \vb r_0)\,d\tau = f(\vb r_0)$ if $\vb r_0$ is inside the region, $0$ if outside.`, md`$|\vb r_0| = \sqrt{1 + 4 + 4} = 3$.`],
        parts: [
          { lbl: md`(a)`, ans: 11, unit: '' },
          { lbl: md`(b)`, ans: 1, unit: '' },
          { lbl: md`(c)`, ans: 0, unit: '' },
          { lbl: md`(d)`, ans: 11, unit: '' },
        ],
        sol: md`
          (a) $r_0^2 + 2 = 9 + 2 = 11$.

          (b) $\vb r_0\cdot\vb c = 3 + 0 - 2 = 1$.

          (c) $|\vb r_0| = 3>2$: the spike is outside the ball, so the integral is $0$.

          (d) $3<4$: inside, so $11$.

          **Remember:** the delta asks one question, "is the spike inside the region?", and then evaluates the rest of the integrand there.
        `,
      }),

      P({
        id: 'uD-delta-p2', title: 'Read the charges off V',
        q: md`$V(\vb r) = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac{1}{|\vb r - a\hat{\mathbf z}|} - \dfrac{1}{r}\right)$ everywhere. (a) What is $\rho$? (b) What is the total charge? (c) Find $p_z$.`,
        figHtml: FQ_AXIS,
        hints: [md`Apply $\nabla^2\dfrac{1}{|\vb r - \vb r'|} = -4\pi\delta^3(\vb r - \vb r')$ to each term.`, md`$\vb p = \int\vb r\,\rho\,d\tau$.`],
        parts: [
          { lbl: md`(a) $\rho$`, mc: [md`$q\,\delta^3(\vb r)$ only`, md`$q\,\delta^3(\vb r - a\hat{\mathbf z}) + q\,\delta^3(\vb r)$`, md`$q\,\delta^3(\vb r - a\hat{\mathbf z}) - q\,\delta^3(\vb r)$`, md`$-q\,\delta^3(\vb r - a\hat{\mathbf z}) + q\,\delta^3(\vb r)$`], a: 2,
            why: [md`Both terms are singular, so both are point charges.`, md`The second term has a minus sign: a negative charge.`, null, md`Signs swapped: $+\dfrac{q}{4\pi\varepsilon_0|\vb r - a\hat{\mathbf z}|}$ is a positive charge at $a\hat{\mathbf z}$.`] },
          { lbl: md`(b) Total charge`, mc: [md`$2q$`, md`$q$`, md`$0$`, md`$-q$`], a: 2,
            why: [md`The two charges have opposite signs.`, md`Count both charges.`, null, md`They cancel exactly.`] },
          { lbl: md`(c) $p_z$`, expr: 'q*a', vars: { q: [1, 3], a: [0.5, 2] } },
        ],
        sol: md`
          (a) $\rho = -\varepsilon_0\nabla^2V = q\,\delta^3(\vb r - a\hat{\mathbf z}) - q\,\delta^3(\vb r)$.

          (b) $q - q = 0$.

          (c) $p_z = \int z\rho\,d\tau = q\cdot a - q\cdot0 = qa$. Far away $V\approx\dfrac{qa\cos\theta}{4\pi\varepsilon_0r^2}$.
        `,
      }),

      R(md`
        ### Level 2: set up
      `),

      P({
        id: 'uD-delta-p3', title: 'A sheet inside a neutralizing slab',
        q: md`In 1-D: $E_x = E_0(1 - |x|/d)$ for $0<x<d$, $E_x = -E_0(1 - |x|/d)$ for $-d<x<0$, and $E_x = 0$ for $|x|>d$ (see the plot). Find (a) the surface charge at $x = 0$, (b) $\rho$ for $0<|x|<d$, (c) the surface charge at $x = \pm d$, (d) the total charge per unit area.`,
        figHtml: FQ_SLAB,
        hints: [md`In 1-D, $\rho = \varepsilon_0\,dE_x/dx$ where $E_x$ is smooth, and $\sigma = \varepsilon_0(E_{\text{right}} - E_{\text{left}})$ at a jump.`, md`At $x = 0$, $E_x$ jumps from $-E_0$ to $+E_0$.`],
        parts: [
          { lbl: md`(a) $\sigma(0)$`, expr: '2*eps0*E0', vars: { eps0: [0.5, 2], E0: [1, 3] } },
          { lbl: md`(b) $\rho$`, expr: '-eps0*E0/d', vars: { eps0: [0.5, 2], E0: [1, 3], d: [0.5, 2] } },
          { lbl: md`(c) $\sigma(\pm d)$`, mc: [md`$-\varepsilon_0E_0$`, md`$+\varepsilon_0E_0$`, md`$0$`, md`$-2\varepsilon_0E_0$`], a: 2,
            why: [md`$E_x\to0$ continuously at $x = \pm d$; no jump, no sheet.`, md`No jump there.`, null, md`The negative charge is spread through the slab, not on its faces.`] },
          { lbl: md`(d) Total per unit area`, mc: [md`$2\varepsilon_0E_0$`, md`$0$`, md`$-2\varepsilon_0E_0$`, md`$\varepsilon_0E_0$`], a: 1,
            why: [md`That is the sheet alone; the slab carries $-\dfrac{\varepsilon_0E_0}{d}\cdot2d$.`, null, md`That is the slab alone.`, md`Add the sheet and the slab.`] },
        ],
        sol: md`
          (a) $\sigma = \varepsilon_0(E_0 - (-E_0)) = 2\varepsilon_0E_0$, i.e. a term $2\varepsilon_0E_0\,\delta(x)$ in $\rho$.

          (b) For $0<x<d$: $\varepsilon_0\dfrac{d}{dx}E_0(1 - x/d) = -\dfrac{\varepsilon_0E_0}{d}$. For $-d<x<0$: $\varepsilon_0\dfrac{d}{dx}[-E_0(1 + x/d)] = -\dfrac{\varepsilon_0E_0}{d}$. Uniform and negative.

          (c) $E_x$ is continuous at $\pm d$ (it reaches 0): no surface charge.

          (d) $2\varepsilon_0E_0 - \dfrac{\varepsilon_0E_0}{d}\cdot2d = 0$, consistent with $E = 0$ outside on both sides.

          $\rho(x) = 2\varepsilon_0E_0\,\delta(x) - \dfrac{\varepsilon_0E_0}{d}$ for $|x|<d$.
        `,
      }),

      P({
        id: 'uD-delta-p4', title: 'Four delta integrals',
        q: md`Evaluate (a) $\displaystyle\int_{-\infty}^{\infty}e^x\,\delta(2x - 4)\,dx$; (b) $\displaystyle\int_{-3}^{3}x^2\,\delta(x^2 - 4)\,dx$; (c) $\displaystyle\int_0^\pi\theta\,\delta\!\left(\cos\theta - \tfrac12\right)d\theta$ (note: no $\sin\theta$); (d) $\displaystyle\int_0^3(x^2 + 1)\,\delta(x - 5)\,dx$.`,
        figHtml: FQ_SPK,
        hints: [md`$\delta(g(x)) = \sum\dfrac{\delta(x - x_i)}{|g'(x_i)|}$.`, md`In (c), $g(\theta) = \cos\theta - \frac12$ has its root at $\pi/3$ with $|g'| = \sin(\pi/3)$.`],
        parts: [
          { lbl: md`(a)`, ans: 3.6945, unit: '' },
          { lbl: md`(b)`, ans: 2, unit: '' },
          { lbl: md`(c)`, ans: 1.2092, unit: '' },
          { lbl: md`(d)`, ans: 0, unit: '' },
        ],
        sol: md`
          (a) $\delta(2x - 4) = \frac12\delta(x - 2)$: $\frac12e^2 = 3.69$.

          (b) Roots $\pm2$, both in range, $|g'| = 4$ at each: $\dfrac{4}{4} + \dfrac{4}{4} = 2$.

          (c) Root $\theta = \pi/3$, $|g'| = \sin(\pi/3) = \frac{\sqrt3}{2}$: $\dfrac{\pi/3}{\sqrt3/2} = \dfrac{2\pi}{3\sqrt3} = 1.209$. (With a $\sin\theta$ in the integrand it would cancel, giving just $\pi/3$.)

          (d) The spike at $x = 5$ is outside $[0, 3]$: $0$.
        `,
      }),

      R(md`
        ### Level 3: solve the standard case
      `),

      P({
        id: 'uD-delta-p5', title: 'A point charge with a 1/r cloud',
        q: md`$\vb E = A\left(\dfrac{1}{r^2} - \dfrac{1}{R^2}\right)\uv r$ for $r<R$, and $\vb E = 0$ for $r>R$. Find (a) the point charge at the origin, (b) $\rho$ for $0<r<R$, (c) the surface charge at $r = R$, (d) $V(r)$ for $r<R$ (with $V(\infty) = 0$).`,
        figHtml: FQ_EIN,
        hints: [md`$q_0 = 4\pi\varepsilon_0\lim_{r\to0}r^2E_r$.`, md`$r^2E_r = A - Ar^2/R^2$.`, md`$V(r) = \int_r^R E_r\,dr'$ since $V = 0$ for $r\ge R$.`],
        parts: [
          { lbl: md`(a) $q_0$`, expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [1, 3] } },
          { lbl: md`(b) $\rho$`, expr: '-2*eps0*A/(R^2*r)', vars: { eps0: [0.5, 2], A: [1, 3], R: [1, 2], r: [0.2, 0.9] } },
          { lbl: md`(c) $\sigma(R)$`, mc: [md`$0$`, md`$-\dfrac{\varepsilon_0A}{R^2}$`, md`$+\dfrac{\varepsilon_0A}{R^2}$`, md`$-4\pi\varepsilon_0A$`], a: 0,
            why: [null, md`$E_r(R^-) = A(1/R^2 - 1/R^2) = 0$: no jump.`, md`No jump, so no sheet.`, md`That is a total charge, and it is in the cloud, not on the surface.`] },
          { lbl: md`(d) $V(r)$`, expr: 'A*(1/r - 2/R + r/R^2)', vars: { A: [1, 3], R: [1, 2], r: [0.2, 0.9] } },
        ],
        sol: md`
          (a) $r^2E_r\to A$: $q_0 = 4\pi\varepsilon_0A$.

          (b) $\rho = \dfrac{\varepsilon_0}{r^2}\dfrac{d}{dr}\left(A - \dfrac{Ar^2}{R^2}\right) = -\dfrac{2\varepsilon_0A}{R^2r}$.

          (c) $E_r$ is continuous at $R$ (both sides $0$): $\sigma = 0$.

          (d) $V = \displaystyle\int_r^RA\left(\frac{1}{r'^2} - \frac{1}{R^2}\right)dr' = A\left(\frac1r - \frac2R + \frac{r}{R^2}\right)$.

          **Check:** cloud charge $\displaystyle\int_0^R-\frac{2\varepsilon_0A}{R^2r}4\pi r^2\,dr = -4\pi\varepsilon_0A$, cancelling $q_0$, consistent with $\vb E = 0$ outside.
        `,
      }),

      P({
        id: 'uD-delta-p6', title: 'Line charge inside a cylinder (2-D)',
        q: md`In cylindrical coordinates, $\vb E = \dfrac{\lambda}{2\pi\varepsilon_0s}\hat{\mathbf s}$ for $s<a$, and $\vb E = 0$ for $s>a$. (a) What is $\rho$ at and near the axis? (b) Find the surface charge on $s = a$. (c) Find $V(s)$ for $s<a$, with $V = 0$ for $s\ge a$. (d) Total charge per unit length?`,
        figHtml: FQ_CYL,
        hints: [md`The 2-D test: $\lambda_0 = 2\pi\varepsilon_0\lim_{s\to0}sE_s$.`, md`For $0<s<a$, $\frac1s\frac{d}{ds}(sE_s) = 0$.`],
        parts: [
          { lbl: md`(a) Near the axis`, mc: [md`$\rho = \lambda\,\delta^3(\vb r)$`, md`$\rho = 0$ everywhere inside`, md`$\rho = \dfrac{\lambda}{2\pi s}$`, md`$\rho = \lambda\,\delta(x)\delta(y)$ and nothing else for $0<s<a$`], a: 3,
            why: [md`The charge runs along the whole axis, not one point.`, md`$sE_s\to\lambda/(2\pi\varepsilon_0)\ne0$: there is a line charge.`, md`$\nabla\cdot(\hat{\mathbf s}/s) = 0$ for $s>0$: no volume charge.`, null] },
          { lbl: md`(b) $\sigma(a)$`, expr: '-lambda/(2*pi*a)', vars: { lambda: [1, 3], a: [0.5, 2] } },
          { lbl: md`(c) $V(s)$`, expr: '(lambda/(2*pi*eps0))*ln(a/s)', vars: { lambda: [1, 3], eps0: [0.5, 2], a: [1, 2], s: [0.2, 0.9] }, accepts: ['-(lambda/(2*pi*eps0))*ln(s/a)'] },
          { lbl: md`(d) Total per length`, mc: [md`$\lambda$`, md`$-\lambda$`, md`$0$`, md`$2\lambda$`], a: 2,
            why: [md`The cylinder carries $-\lambda$ per length.`, md`That is the cylinder alone.`, null, md`They have opposite signs.`] },
        ],
        sol: md`
          (a) $sE_s = \dfrac{\lambda}{2\pi\varepsilon_0}$, so the axis carries $\lambda$ per length: $\rho = \lambda\,\delta(x)\delta(y)$. For $0<s<a$ the divergence is zero.

          (b) $\sigma = \varepsilon_0(0 - E_s(a^-)) = -\dfrac{\lambda}{2\pi a}$.

          (c) $V(s) = \displaystyle\int_s^a\frac{\lambda}{2\pi\varepsilon_0s'}ds' = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac as$.

          (d) $\lambda + 2\pi a\cdot\left(-\dfrac{\lambda}{2\pi a}\right) = 0$: a coaxial cable with a grounded-looking outside.
        `,
      }),

      R(md`
        ### Level 4: one twist
      `),

      P({
        id: 'uD-delta-p7', title: 'A delta in spherical coordinates',
        q: md`$\vb r_0 = (0, 2a, 2a)$ in Cartesian coordinates. (a) Find $r_0$. (b) Find $\theta_0$ in degrees. (c) Find $\phi_0$ in degrees. (d) Evaluate $\displaystyle\int(x^2 - y^2)\,\delta^3(\vb r - \vb r_0)\,d\tau$ over the ball $r<3a$. (e) Evaluate $\displaystyle\int r^3\sin\theta\,\delta(r - r_0)\delta(\theta - \theta_0)\delta(\phi - \phi_0)\,dr\,d\theta\,d\phi$ (no Jacobian). (f) Redo (d) over the ball $r<2a$.`,
        figHtml: FQ_SPH,
        hints: [md`$\cos\theta_0 = z_0/r_0$, $\tan\phi_0 = y_0/x_0$.`, md`$x^2 - y^2 = r^2\sin^2\theta\cos2\phi$; either form works once you know the spike's location.`, md`In (e) the integration measure is $dr\,d\theta\,d\phi$, so each delta just evaluates its variable.`],
        parts: [
          { lbl: md`(a) $r_0$`, expr: '2*sqrt(2)*a', vars: { a: [0.5, 2] } },
          { lbl: md`(b) $\theta_0$ (degrees)`, ans: 45, unit: '' },
          { lbl: md`(c) $\phi_0$ (degrees)`, ans: 90, unit: '' },
          { lbl: md`(d)`, expr: '-4*a^2', vars: { a: [0.5, 2] } },
          { lbl: md`(e)`, expr: '16*a^3', vars: { a: [0.5, 2] } },
          { lbl: md`(f) Over $r<2a$`, mc: [md`$-4a^2$`, md`$-2a^2$, half the spike`, md`$0$, since $r_0 = 2\sqrt2\,a>2a$`, md`undefined`], a: 2,
            why: [md`The spike is outside the smaller ball.`, md`Half-weights only happen when the spike sits exactly on the boundary.`, null, md`It is a clean zero.`] },
        ],
        sol: md`
          (a) $r_0 = \sqrt{0 + 4a^2 + 4a^2} = 2\sqrt2\,a$.

          (b) $\cos\theta_0 = 2a/(2\sqrt2a) = 1/\sqrt2$: $\theta_0 = 45^\circ$.

          (c) $x_0 = 0$, $y_0>0$: $\phi_0 = 90^\circ$.

          (d) $r_0<3a$, so the integral is $x_0^2 - y_0^2 = 0 - 4a^2 = -4a^2$. (Spherical check: $r_0^2\sin^2\theta_0\cos2\phi_0 = 8a^2\cdot\frac12\cdot(-1)$.)

          (e) $r_0^3\sin\theta_0 = (2\sqrt2a)^3\cdot\dfrac{\sqrt2}{2} = 16a^3$. This equals $\int r^3\sin\theta\,\delta^3(\vb r - \vb r_0)\,d\tau$, because the $\dfrac{1}{r^2\sin\theta}$ inside $\delta^3$ cancels the Jacobian of $d\tau$. The common slip is to drop that factor from $\delta^3$ but keep the full $d\tau$, which gives $r_0^5\sin^2\theta_0 = 64\sqrt2\,a^5$, with the wrong units.

          (f) $2\sqrt2a\approx2.83a>2a$: outside, $0$.
        `,
      }),

      P({
        id: 'uD-delta-p8', title: 'A line charge with a uniform neutralizer',
        q: md`$\vb E = \dfrac{\lambda}{2\pi\varepsilon_0}\left(\dfrac1s - \dfrac{s}{a^2}\right)\hat{\mathbf s}$ for $s<a$, $0$ for $s>a$. Find (a) the line charge on the axis, (b) $\rho$ for $0<s<a$, (c) the surface charge on $s = a$, (d) $V(s)$ for $s<a$ with $V(a) = 0$.`,
        figHtml: FQ_ES,
        hints: [md`$\lambda_0 = 2\pi\varepsilon_0\lim_{s\to0}sE_s$.`, md`$\rho = \dfrac{\varepsilon_0}{s}\dfrac{d}{ds}(sE_s)$ for $s>0$.`],
        parts: [
          { lbl: md`(a) Line charge`, expr: 'lambda', vars: { lambda: [1, 3] } },
          { lbl: md`(b) $\rho$`, expr: '-lambda/(pi*a^2)', vars: { lambda: [1, 3], a: [0.5, 2] } },
          { lbl: md`(c) $\sigma(a)$`, mc: [md`$-\dfrac{\lambda}{2\pi a}$`, md`$0$`, md`$+\dfrac{\lambda}{2\pi a}$`, md`$-\dfrac{\lambda}{\pi a^2}$`], a: 1,
            why: [md`That was the previous problem. Here $E_s(a^-) = \frac{\lambda}{2\pi\varepsilon_0}\left(\frac1a - \frac1a\right) = 0$: no jump.`, null, md`No jump at all.`, md`That is the volume density, not a surface density.`] },
          { lbl: md`(d) $V(s)$`, expr: '(lambda/(2*pi*eps0))*(ln(a/s) - 1/2 + s^2/(2*a^2))', vars: { lambda: [1, 3], eps0: [0.5, 2], a: [1, 2], s: [0.2, 0.9] } },
        ],
        sol: md`
          (a) $sE_s = \dfrac{\lambda}{2\pi\varepsilon_0}\left(1 - \dfrac{s^2}{a^2}\right)\to\dfrac{\lambda}{2\pi\varepsilon_0}$: line charge $\lambda$.

          (b) $\rho = \dfrac{\varepsilon_0}{s}\cdot\dfrac{\lambda}{2\pi\varepsilon_0}\cdot\left(-\dfrac{2s}{a^2}\right) = -\dfrac{\lambda}{\pi a^2}$: uniform.

          (c) $E_s(a^-) = 0 = E_s(a^+)$: no surface charge. The neutralizing charge $-\lambda$ per length is spread through the volume ($-\frac{\lambda}{\pi a^2}\cdot\pi a^2$) instead of sitting on the surface.

          (d) $V = \displaystyle\int_s^aE_s\,ds' = \frac{\lambda}{2\pi\varepsilon_0}\left(\ln\frac as - \frac{a^2 - s^2}{2a^2}\right) = \frac{\lambda}{2\pi\varepsilon_0}\left(\ln\frac as - \frac12 + \frac{s^2}{2a^2}\right)$.
        `,
      }),

      R(md`
        ### Level 5: exam level

        Find every piece of $\rho$: the origin, the volume, every surface. Then add them and compare with the far field.
      `),

      P({
        id: 'uD-delta-p9', title: 'A field that switches off in two steps', big: true,
        q: md`$\vb E = \dfrac{k}{r^2}\uv r$ for $r<a$, $\dfrac{k}{a^2}\uv r$ for $a<r<b$, and $0$ for $r>b$ ($k>0$). Find (a) the point charge at the origin, (b) $\rho$ for $a<r<b$, (c) the surface charge at $r = a$ and (d) at $r = b$, (e) the total charge in the cloud $a<r<b$, (f) the total charge. (g) Find $V(a)$, with $V(\infty) = 0$.`,
        figHtml: FQ_AB,
        hints: [md`Region by region: $r<a$ is a pure point-charge field; $a<r<b$ has $r^2E_r = kr^2/a^2$.`, md`At each boundary, compare $E_r$ on the two sides.`, md`$V(a) = \int_a^bE_r\,dr$.`],
        parts: [
          { lbl: md`(a) $q_0$`, expr: '4*pi*eps0*k', vars: { eps0: [0.5, 2], k: [1, 3] } },
          { lbl: md`(b) $\rho$, $a<r<b$`, expr: '2*eps0*k/(a^2*r)', vars: { eps0: [0.5, 2], k: [1, 3], a: [0.5, 1], r: [1.1, 2] } },
          { lbl: md`(c) $\sigma_a$`, mc: [md`$\dfrac{\varepsilon_0k}{a^2}$`, md`$-\dfrac{\varepsilon_0k}{a^2}$`, md`$0$`, md`$\dfrac{k}{a^2}$`], a: 2,
            why: [md`$E_r = k/a^2$ on both sides of $r = a$.`, md`No jump at $a$.`, null, md`No jump; and $\sigma$ would need an $\varepsilon_0$.`] },
          { lbl: md`(d) $\sigma_b$`, expr: '-eps0*k/a^2', vars: { eps0: [0.5, 2], k: [1, 3], a: [0.5, 2] } },
          { lbl: md`(e) Cloud charge`, expr: '4*pi*eps0*k*(b^2 - a^2)/a^2', vars: { eps0: [0.5, 2], k: [1, 3], a: [0.5, 1], b: [1.2, 2] } },
          { lbl: md`(f) Total charge`, mc: [md`$4\pi\varepsilon_0k$`, md`$4\pi\varepsilon_0k\,b^2/a^2$`, md`$-4\pi\varepsilon_0k\,b^2/a^2$`, md`$0$`], a: 3,
            why: [md`That is the point charge alone.`, md`That is point plus cloud; the shell at $b$ cancels it.`, md`That is the shell at $b$ alone.`, null] },
          { lbl: md`(g) $V(a)$`, expr: 'k*(b - a)/a^2', vars: { k: [1, 3], a: [0.5, 1], b: [1.2, 2] } },
        ],
        sol: md`
          (a) $r^2E_r = k$ near the origin: $q_0 = 4\pi\varepsilon_0k$.

          (b) $\rho = \dfrac{\varepsilon_0}{r^2}\dfrac{d}{dr}\left(\dfrac{kr^2}{a^2}\right) = \dfrac{2\varepsilon_0k}{a^2r}$; and $\rho = 0$ for $0<r<a$ and $r>b$.

          (c) $E_r(a^-) = E_r(a^+) = k/a^2$: $\sigma_a = 0$. The field only has a kink there.

          (d) $\sigma_b = \varepsilon_0\left(0 - \dfrac{k}{a^2}\right) = -\dfrac{\varepsilon_0k}{a^2}$.

          (e) $\displaystyle\int_a^b\frac{2\varepsilon_0k}{a^2r}4\pi r^2\,dr = \frac{4\pi\varepsilon_0k(b^2 - a^2)}{a^2}$.

          (f) $4\pi\varepsilon_0k + \dfrac{4\pi\varepsilon_0k(b^2 - a^2)}{a^2} - \dfrac{\varepsilon_0k}{a^2}4\pi b^2 = 0$, consistent with $\vb E = 0$ outside.

          [[fig:sol]]

          (g) $V(a) = \displaystyle\int_a^b\frac{k}{a^2}dr = \frac{k(b - a)}{a^2}$.

          $\rho(\vb r) = 4\pi\varepsilon_0k\,\delta^3(\vb r) + \dfrac{2\varepsilon_0k}{a^2r}\Theta(r - a)\Theta(b - r) - \dfrac{\varepsilon_0k}{a^2}\delta(r - b)$.
        `,
        figs: { sol: { svg: FQ_AB_SOL, cap: 'Point charge at the center, a positive $1/r$ cloud between $a$ and $b$, and a negative shell at $b$ that cancels both.' } },
      }),

      P({
        id: 'uD-delta-p10', title: 'V = A/r inside, B/r² outside', big: true,
        q: md`$V = A/r$ for $r<R$ and $V = B/r^2$ for $r>R$ ($A>0$). (a) What must $B$ be so that there is no dipole layer at $r = R$? Use that $B$ from now on. (b) Find the point charge at the origin. (c) Find $\rho$ for $r>R$. (d) Find the surface charge at $r = R$. (e) Find the total charge. (f) What does the far field $V\propto1/r^2$ with no angular dependence tell you?`,
        figHtml: FQ_RV,
        hints: [md`No dipole layer means $V$ is continuous at $R$.`, md`$\nabla^2\dfrac{1}{r^2} = \dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot\dfrac{-2}{r^3}\right)$.`, md`$E_{\text{in}}(R) = A/R^2$; $E_{\text{out}}(R) = 2B/R^3$.`],
        parts: [
          { lbl: md`(a) $B$`, expr: 'A*R', vars: { A: [1, 3], R: [0.5, 2] } },
          { lbl: md`(b) $q_0$`, expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [1, 3] } },
          { lbl: md`(c) $\rho$, $r>R$`, expr: '-2*eps0*A*R/r^4', vars: { eps0: [0.5, 2], A: [1, 3], R: [0.5, 1], r: [1.2, 3] } },
          { lbl: md`(d) $\sigma(R)$`, expr: 'eps0*A/R^2', vars: { eps0: [0.5, 2], A: [1, 3], R: [0.5, 2] } },
          { lbl: md`(e) Total charge`, mc: [md`$4\pi\varepsilon_0A$`, md`$8\pi\varepsilon_0A$`, md`$0$`, md`$-8\pi\varepsilon_0A$`], a: 2,
            why: [md`Point charge only.`, md`Point charge plus shell; the cloud outside carries $-8\pi\varepsilon_0A$.`, null, md`That is the cloud alone.`] },
          { lbl: md`(f) The isotropic $1/r^2$ far field means`, mc: [md`the charge is not localized: a $-1/r^4$ cloud extends to infinity`, md`there is a point dipole at the origin`, md`the multipole expansion has a $1/r^2$ monopole correction`, md`nothing special`], a: 0,
            why: [null, md`A dipole potential has $\cos\theta$.`, md`Outside all charge, every term has $P_\ell$ angular dependence; an isotropic $1/r^2$ is not one of them.`, md`$\nabla^2(1/r^2)\ne0$: it is charge.`] },
        ],
        sol: md`
          (a) Continuity at $R$: $A/R = B/R^2$, so $B = AR$.

          (b) $rV\to A$: $q_0 = 4\pi\varepsilon_0A$. For $0<r<R$, $\nabla^2(1/r) = 0$: no other charge inside.

          (c) $\rho = -\varepsilon_0\cdot AR\cdot\nabla^2\dfrac{1}{r^2} = -\varepsilon_0AR\cdot\dfrac{2}{r^4} = -\dfrac{2\varepsilon_0AR}{r^4}$.

          (d) $E_{\text{in}} = A/R^2$, $E_{\text{out}} = 2AR/R^3 = 2A/R^2$: $\sigma = \varepsilon_0\dfrac{A}{R^2}$.

          (e) Cloud: $\displaystyle\int_R^\infty-\frac{2\varepsilon_0AR}{r^4}4\pi r^2\,dr = -8\pi\varepsilon_0A$. Shell: $4\pi R^2\cdot\dfrac{\varepsilon_0A}{R^2} = 4\pi\varepsilon_0A$. Total: $4\pi\varepsilon_0A + 4\pi\varepsilon_0A - 8\pi\varepsilon_0A = 0$. Check: $Q_{\text{enc}}(r) = 4\pi\varepsilon_0r^2E_r = \dfrac{8\pi\varepsilon_0AR}{r}\to0$.

          [[fig:sol]]

          (f) The charge is never fully enclosed. $Q_{\text{tot}} = 0$, yet the potential falls only as $1/r^2$, slower than any neutral localized distribution's isotropic part could.
        `,
        figs: { sol: { svg: FQ_RV_SOL, cap: 'Point charge, positive shell at $R$, and a negative cloud $\\propto1/r^4$ reaching to infinity.' } },
      }),

      P({
        id: 'uD-delta-p11', title: 'A screened charge whose cloud changes sign', big: true,
        q: md`$V = \dfrac{Ae^{-r/a}(1 + r/a)}{r}$ ($A, a>0$). Find (a) the point charge at the origin, (b) $\rho$ for $r>0$, (c) $E_r$, (d) the charge of the cloud inside $r<a$, (e) the total charge.`,
        figHtml: FD_VEXP,
        hints: [md`For spherical $V$, $\nabla^2V = \dfrac1r\dfrac{d^2}{dr^2}(rV)$. Here $rV = Ae^{-r/a}(1 + r/a)$.`, md`$\dfrac{d}{dr}(rV) = -\dfrac{Ar}{a^2}e^{-r/a}$.`, md`$Q_{\text{enc}}(r) = 4\pi\varepsilon_0r^2E_r$; the cloud inside $a$ is $Q_{\text{enc}}(a) - q_0$.`],
        parts: [
          { lbl: md`(a) $q_0$`, expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [1, 3] } },
          { lbl: md`(b) $\rho(r)$`, expr: 'eps0*A*exp(-r/a)*(a - r)/(a^3*r)', vars: { eps0: [0.5, 2], A: [1, 3], a: [0.5, 2], r: [0.2, 3] } },
          { lbl: md`(c) $E_r$`, expr: 'A*exp(-r/a)*(1 + r/a + r^2/a^2)/r^2', vars: { A: [1, 3], a: [0.5, 2], r: [0.2, 3] } },
          { lbl: md`(d) Cloud charge in $r<a$`, expr: '4*pi*eps0*A*(3*exp(-1) - 1)', vars: { eps0: [0.5, 2], A: [1, 3] } },
          { lbl: md`(e) Total charge`, mc: [md`$4\pi\varepsilon_0A$`, md`$-4\pi\varepsilon_0A$`, md`$4\pi\varepsilon_0A(3/e - 1)$`, md`$0$`], a: 3,
            why: [md`Point charge only.`, md`Cloud only.`, md`That is the cloud inside $a$ only.`, null] },
        ],
        sol: md`
          (a) $rV\to A$: $q_0 = 4\pi\varepsilon_0A$.

          (b) $u = rV = A e^{-r/a}(1 + r/a)$, $u' = -\dfrac{Ar}{a^2}e^{-r/a}$, $u'' = -\dfrac{A}{a^2}e^{-r/a}\left(1 - \dfrac ra\right)$. So $\rho = -\dfrac{\varepsilon_0}{r}u'' = \dfrac{\varepsilon_0Ae^{-r/a}(a - r)}{a^3r}$: positive for $r<a$, negative beyond.

          (c) $E_r = -V' = \dfrac{Ae^{-r/a}}{r^2}\left(1 + \dfrac ra + \dfrac{r^2}{a^2}\right)$.

          (d) $Q_{\text{enc}}(a) = 4\pi\varepsilon_0a^2E_r(a) = 12\pi\varepsilon_0A/e$, minus $q_0$: $4\pi\varepsilon_0A(3/e - 1)\approx0.10\cdot4\pi\varepsilon_0A$.

          (e) $r^2E_r\to0$: $Q_{\text{tot}} = 0$. The cloud's net charge is $-4\pi\varepsilon_0A$; its positive inner part is outweighed by its negative outer part.
        `,
      }),

      R(md`
        ### Level 6: harder than the exam
      `),

      P({
        id: 'uD-delta-p12', title: 'Deltas in V itself', big: true,
        q: md`In 1-D. (a) $V = V_0$ for $x>0$ and $0$ for $x<0$. What is $E_x$? (b) Write $\rho$ and find its dipole moment per unit area $\int x\rho\,dx$. (c) Now $V = A\,\delta(x)$. Find $\int x^2\rho\,dx$. (d) Three sheets, $+\sigma$ at $x = \pm h$ and $-2\sigma$ at $x = 0$, produce $V(x)$ with $\int V\,dx = -\sigma h^2/\varepsilon_0$ and $V = 0$ outside. As $h\to0$ with $\sigma h^2$ fixed, which $A$ does that model?`,
        figHtml: FD_STEP,
        hints: [md`$\dfrac{d}{dx}\Theta(x) = \delta(x)$, $\rho = -\varepsilon_0V''$.`, md`$\int x\,\delta'(x)\,dx = -1$ and $\int x^2\delta''(x)\,dx = 2$ (integrate by parts).`],
        parts: [
          { lbl: md`(a) $E_x$`, mc: [md`$V_0\,\delta(x)$`, md`$0$ everywhere`, md`$-V_0\,\delta(x)$`, md`$-V_0/x$`], a: 2,
            why: [md`$E = -dV/dx$: the minus sign.`, md`Zero away from $x = 0$, but $V$ jumps there.`, null, md`Not a derivative of a step.`] },
          { lbl: md`(b) $\int x\rho\,dx$`, expr: 'eps0*V0', vars: { eps0: [0.5, 2], V0: [1, 3] } },
          { lbl: md`(c) $\int x^2\rho\,dx$`, expr: '-2*eps0*A', vars: { eps0: [0.5, 2], A: [1, 3] } },
          { lbl: md`(d) $A$`, expr: '-sigma*h^2/eps0', vars: { sigma: [1, 3], h: [0.1, 0.5], eps0: [0.5, 2] } },
        ],
        sol: md`
          (a) $E_x = -\dfrac{dV}{dx} = -V_0\,\delta(x)$: an infinitely strong field squeezed into zero thickness.

          (b) $\rho = \varepsilon_0\dfrac{dE_x}{dx} = -\varepsilon_0V_0\,\delta'(x)$. $\int\rho\,dx = 0$; $\int x\rho\,dx = -\varepsilon_0V_0\int x\,\delta'(x)\,dx = \varepsilon_0V_0$. A dipole layer with moment per area $\varepsilon_0V_0$, pointing toward the high-$V$ side.

          (c) $\rho = -\varepsilon_0A\,\delta''(x)$, so $\int x^2\rho\,dx = -\varepsilon_0A\cdot2 = -2\varepsilon_0A$.

          (d) The narrowing bump of area $-\sigma h^2/\varepsilon_0$ becomes $A\,\delta(x)$ with $A = -\sigma h^2/\varepsilon_0$. Check with (c): $-2\varepsilon_0A = 2\sigma h^2 = \sum\sigma_ix_i^2$ for the three sheets.

          **The ladder:** a point charge makes $V\sim1/r$; a sheet makes a kink in $V$; a dipole layer makes a step in $V$; a quadrupole layer makes a delta in $V$. Each extra derivative in $\rho$ is one more level of cancellation.
        `,
      }),

      P({
        id: 'uD-delta-p13', title: 'A screened point dipole', big: true,
        q: md`$V = \dfrac{A\cos\theta\,e^{-r/a}}{r^2}$. (a) What is at the origin? Give its dipole moment. (b) Find $\rho$ for $r>0$. (c) What is the net charge of the cloud? (d) Find the cloud's dipole moment $p_z$. (e) Why must (d) come out as it does?`,
        figHtml: FQ_DIPCLOUD,
        hints: [md`Near the origin $V\approx A\cos\theta/r^2$.`, md`For $V = f(r)\cos\theta$: $\nabla^2V = \cos\theta\left[\dfrac{1}{r^2}(r^2f')' - \dfrac{2f}{r^2}\right]$.`, md`$p_z^{\text{cloud}} = \int r\cos\theta\,\rho\,d\tau$; the angular integral is $\int\cos^2\theta\sin\theta\,d\theta\,d\phi = \frac{4\pi}{3}$.`],
        parts: [
          { lbl: md`(a) $p_z$ of the point dipole`, expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [1, 3] } },
          { lbl: md`(b) $\rho(r,\theta)$`, expr: '-eps0*A*(r + 2*a)*exp(-r/a)*cos(theta)/(a^2*r^3)', vars: { eps0: [0.5, 2], A: [1, 3], a: [0.5, 2], r: [0.3, 3], theta: [0.2, 2.9] } },
          { lbl: md`(c) Net cloud charge`, mc: [md`$0$, because $\int\cos\theta\sin\theta\,d\theta = 0$`, md`$-4\pi\varepsilon_0A$`, md`$+4\pi\varepsilon_0A$`, md`infinite`], a: 0,
            why: [null, md`That is (d)'s dipole moment, not a charge.`, md`Every spherical shell of the cloud is neutral.`, md`The angular integral kills it shell by shell.`] },
          { lbl: md`(d) Cloud $p_z$`, expr: '-4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [1, 3] } },
          { lbl: md`(e) Because`, mc: [md`the cloud is neutral`, md`$\rho<0$ everywhere`, md`it is a coincidence of this $V$`, md`$V$ decays exponentially, so the total dipole moment (point plus cloud) is zero`], a: 3,
            why: [md`Neutral clouds can still have dipole moments.`, md`$\rho\propto-\cos\theta$: it is negative on top and positive below, not negative everywhere.`, md`Any $V$ that decays faster than $1/r^2$ has total $\vb p = 0$.`, null] },
        ],
        sol: md`
          (a) A point dipole with $\vb p = 4\pi\varepsilon_0A\,\hat{\mathbf z}$ (compare $\dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$).

          (b) With $f = Ae^{-r/a}/r^2$, the bracket $\dfrac{1}{r^2}(r^2f')' - \dfrac{2f}{r^2}$ works out to $\dfrac{A(r + 2a)e^{-r/a}}{a^2r^3}$, so $\rho = -\dfrac{\varepsilon_0A(r + 2a)e^{-r/a}\cos\theta}{a^2r^3}$: negative above the equator, positive below, opposing the point dipole.

          (c) $0$: every shell is neutral.

          (d) $p_z = \dfrac{4\pi}{3}\displaystyle\int_0^\infty r^3\left(-\frac{\varepsilon_0A(r + 2a)e^{-r/a}}{a^2r^3}\right)dr = -\frac{4\pi\varepsilon_0A}{3a^2}(a^2 + 2a^2) = -4\pi\varepsilon_0A$.

          (e) Far away the total $\vb p$ would show up as a $\cos\theta/r^2$ term. $V$ decays exponentially, so the total dipole moment is zero: the cloud exactly screens the point dipole, as the cloud in the $e^{-r/a}/r$ potential screens a point charge.
        `,
      }),

      P({
        id: 'uD-delta-p14', title: 'A ring written with deltas', big: true,
        q: md`A ring of radius $R$ in the $xy$-plane, centered at the origin, carries charge $Q$ uniformly. (a) In spherical coordinates $\rho = C\,\delta(r - R)\,\delta(\cos\theta)$: find $C$. (b) In cylindrical coordinates $\rho = C'\,\delta(s - R)\,\delta(z)$: find $C'$. (c) Using (a), compute $q_2 = \int r^2P_2(\cos\theta)\,\rho\,d\tau$. (d) Now the ring carries $\lambda = \lambda_0\cos\phi$, i.e. $\rho = \dfrac{\lambda_0\cos\phi}{R}\,\delta(r - R)\,\delta(\cos\theta)$. Compute $p_x = \int r\sin\theta\cos\phi\,\rho\,d\tau$.`,
        figHtml: FQ_RING,
        hints: [md`In spherical coordinates $d\tau = r^2\,dr\,d(\cos\theta)\,d\phi$ (up to orientation). Then $\int\rho\,d\tau = C\cdot R^2\cdot1\cdot2\pi$.`, md`In cylindrical $d\tau = s\,ds\,d\phi\,dz$.`, md`On the ring, $\theta = \pi/2$, so $P_2(0) = -\frac12$.`],
        parts: [
          { lbl: md`(a) $C$`, expr: 'Q/(2*pi*R^2)', vars: { Q: [1, 3], R: [0.5, 2] } },
          { lbl: md`(b) $C'$`, expr: 'Q/(2*pi*R)', vars: { Q: [1, 3], R: [0.5, 2] } },
          { lbl: md`(c) $q_2$`, expr: '-Q*R^2/2', vars: { Q: [1, 3], R: [0.5, 2] } },
          { lbl: md`(d) $p_x$`, expr: 'pi*R^2*lambda0', vars: { R: [0.5, 2], lambda0: [1, 3] } },
        ],
        sol: md`
          (a) $\int\rho\,d\tau = C\int\delta(r - R)r^2\,dr\int_{-1}^{1}\delta(u)\,du\int_0^{2\pi}d\phi = C\cdot R^2\cdot2\pi = Q$, so $C = \dfrac{Q}{2\pi R^2}$. Check units: $\delta(r - R)$ is 1/m, $\delta(\cos\theta)$ is dimensionless, so $C$ must be C/m².

          (b) $C'\int\delta(s - R)s\,ds\int d\phi\int\delta(z)\,dz = C'\cdot R\cdot2\pi = Q$: $C' = \dfrac{Q}{2\pi R}$, which is $\lambda$.

          (c) $q_2 = \dfrac{Q}{2\pi R^2}\cdot R^2\cdot R^2P_2(0)\cdot2\pi = -\dfrac{QR^2}{2}$.

          (d) $p_x = \displaystyle\int r\sin\theta\cos\phi\cdot\frac{\lambda_0\cos\phi}{R}\delta(r - R)\delta(\cos\theta)\,r^2\,dr\,d(\cos\theta)\,d\phi = \frac{\lambda_0}{R}\cdot R^3\cdot1\cdot\pi = \pi R^2\lambda_0$, matching the direct ring integral.

          **Pattern:** a delta for each squeezed direction, each divided by the matching metric factor, and the normalization fixed by integrating to the total charge.
        `,
      }),

      RF(md`
        !!method Patterns to remember
            - Order of work: point charge at the origin, volume $\rho$ region by region, every surface jump, then add and compare with $4\pi\varepsilon_0\lim_{r\to\infty}r^2E_r$.
            - A kink in $E$ is not a surface charge; a jump is.
            - $V$ must be continuous across ordinary charge layers; a jump in $V$ is a dipole layer.
            - In 2-D the tests use $s$: line charge $2\pi\varepsilon_0\lim sE_s$.
            - Deltas in curvilinear coordinates: divide by the metric factors ($r^2\sin\theta$, or $r^2$ with $\delta(\cos\theta)$; $s$ in cylindrical).
      `),
    ],
  };

  COURSE.units.find((u) => u.id === 'uD').lessons.push(L_MPC, L_MPP, L_DC, L_DP);
})();

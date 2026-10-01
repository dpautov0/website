/* Unit 1 — Electric field and Gauss's law (Lectures 1–3; Griffiths 2.1–2.2).
   Coulomb's law and superposition, continuous distributions (segment, ring, disk), field lines and flux,
   Gauss's law (integral form and its symmetric applications), the differential form, and curl E = 0. */
(function () {
  'use strict';
  const { RF, P, Q } = C;

  // =====================================================================================
  // Drawing helpers
  // =====================================================================================
  const D2R = Math.PI / 180;
  const fig = (o) => PF.fig(o);
  const pol = (cx, cy, r, a) => [cx + r * Math.cos(a * D2R), cy - r * Math.sin(a * D2R)];
  const r1 = (v) => Math.round(v * 10) / 10;
  const dpath = (pts) => `M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z`;

  // translucent fill for a charged region (charged matter is tinted; conductors would be hatched)
  function tint(f, pts, op = 0.18) {
    pts.forEach((p) => f.track(p[0], p[1]));
    f.add(`<path class="nodecl" style="fill:var(--dim);fill-opacity:${op};stroke:none" d="${dpath(pts)}"/>`);
    return f;
  }
  // tinted region with holes (even-odd rule): outer polygon, then any number of inner polygons
  function tintHoles(f, outer, holes, op = 0.18) {
    outer.forEach((p) => f.track(p[0], p[1]));
    f.add(`<path class="nodecl" style="fill:var(--dim);fill-opacity:${op};stroke:none;fill-rule:evenodd" d="${dpath(outer)}${holes.map(dpath).join('')}"/>`);
    return f;
  }
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = 360) => fig().arcPts(cx, cy, rx, ry, a0, a1);
  // arrowhead at fraction t of the length of a polyline
  function headAt(f, pts, t = 0.5, o = {}) {
    const seg = [];
    let L = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
    let s = t * L;
    for (let i = 1; i < pts.length; i++) {
      if (s <= seg[i - 1] || i === pts.length - 1) {
        const u = seg[i - 1] ? Math.min(1, s / seg[i - 1]) : 0;
        const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], n = Math.hypot(dx, dy) || 1;
        f.head(pts[i - 1][0] + dx * u + 3 * dx / n, pts[i - 1][1] + dy * u + 3 * dy / n, dx, dy, o);
        return f;
      }
      s -= seg[i - 1];
    }
    return f;
  }
  // field lines in the plane of the page for point charges ch = [[x, y, q], ...] (screen px, y down)
  function fieldLines(f, ch, o = {}) {
    const box = o.box, per = o.per || 8, step = 1.5, R0 = o.r0 || 9;
    const E = (x, y) => {
      let ex = 0, ey = 0;
      for (const [cx, cy, q] of ch) { const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy, r = Math.sqrt(r2); ex += q * dx / (r2 * r); ey += q * dy / (r2 * r); }
      return [ex, ey];
    };
    for (const [cx, cy, q] of ch) {
      if (q < 0 && !o.fromNeg) continue;
      const n = Math.round(per * Math.abs(q));
      for (let k = 0; k < n; k++) {
        const a = (k + (o.half ? 0.5 : 0)) * 2 * Math.PI / n + (o.rot || 0) * D2R;
        let x = cx + R0 * Math.cos(a), y = cy + R0 * Math.sin(a);
        const pts = [[x, y]], sg = q > 0 ? 1 : -1;
        for (let i = 0; i < 1500; i++) {
          const [ex, ey] = E(x, y), m = Math.hypot(ex, ey);
          if (!m) break;
          x += sg * step * ex / m; y += sg * step * ey / m;
          if (i % 3 === 2) pts.push([x, y]);
          if (x < box[0] || x > box[2] || y < box[1] || y > box[3]) { pts.push([x, y]); break; }
          if (ch.some(([qx, qy, qq]) => qq * q < 0 && Math.hypot(x - qx, y - qy) < R0)) break;
        }
        if (q < 0) pts.reverse();
        if (pts.length > 2) { f.pl(pts, { cls: 'thin' }); headAt(f, pts, o.at || 0.5, { hs: 5.5 }); }
      }
    }
    return f;
  }
  // a closed wobbly curve r(phi) around (cx, cy)
  function blobPts(cx, cy, R, wob = [[3, 0.12, 0], [2, 0.08, 40]]) {
    const pts = [];
    for (let i = 0; i < 120; i++) {
      const a = i * 3;
      let rr = R;
      for (const [m, amp, ph] of wob) rr += R * amp * Math.sin((m * a + ph) * D2R);
      pts.push(pol(cx, cy, rr, a));
    }
    return pts;
  }
  // small cross (field point marker)
  const cross = (f, x, y, s = 4) => { f.line(x - s, y - s, x + s, y + s); f.line(x - s, y + s, x + s, y - s); return f; };

  // =====================================================================================
  // Figures: Coulomb's law and superposition
  // =====================================================================================

  // separation vector: origin O, source point r', field point r, script-r from source to field point
  function figSep() {
    const f = fig();
    const O = [50, 190];
    f.line(O[0], O[1], O[0], 45, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(O[0] + 4, 42, 'z', 'bl', 'small accent');
    f.line(O[0], O[1], 290, O[1], { cls: 'dim', arrow: 'end', hs: 6 }); f.label(294, O[1] + 2, 'y', 'l', 'small accent');
    f.line(O[0], O[1], 12, 228, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(10, 232, 'x', 'tr', 'small accent');
    f.label(O[0] + 6, O[1] + 5, 'O', 'tl', 'small accent');
    const q = [100, 92], Pp = [262, 122];
    f.arrow(O[0], O[1], q[0] - 5, q[1] + 5, { hs: 6 });
    f.arrow(O[0], O[1], Pp[0] - 4, Pp[1] + 3, { hs: 6 });
    f.arrow(q[0] + 6, q[1] - 3, Pp[0] - 5, Pp[1] + 2, { cls: 'thick', hs: 8 });
    f.charge(q[0], q[1], { q: '+', lab: 'q', at: 'tl' });
    f.dot(Pp[0], Pp[1], 3.2); f.tag(Pp[0], Pp[1], 'P', 'r');
    f.label(84, 150, md`\mathbf{r}'`, 'l');
    f.label(165, 165, md`\mathbf{r}`, 't');
    f.label(184, 98, md`\sr`, 'b');
    f.text(90, 60, 'source point', 'bl');
    f.text(266, 106, 'field point', 'b');
    f.label(160, 222, md`\sr=\mathbf{r}-\mathbf{r}'`, 'c');
    return f.svg();
  }

  // source q and test charge Q with the separation vector between them
  function figQq(sq = '+', sQ = '-', lq = 'q', lQ = 'Q') {
    const f = fig();
    f.charge(60, 70, { q: sq, lab: lq, at: 't' });
    f.charge(230, 70, { q: sQ, lab: lQ, at: 't' });
    f.arrow(70, 70, 218, 70, { cls: 'dim', hs: 6 });
    f.label(145, 76, md`\sr`, 't', 'small');
    f.text(60, 92, 'source', 't'); f.text(230, 92, 'test charge', 't');
    return f.svg();
  }

  // two charges on the x axis at -d/2 and +d/2, field point P on the z axis (Ex. 2.1 / Prob. 2.2)
  function figPair(o = {}) {
    const f = fig();
    const y0 = 180, xl = 100, xr = 220, xm = 160, zP = 64;
    const neg = o.right === '-';
    f.line(20, y0, 300, y0, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(304, y0, 'x', 'l', 'small accent');
    f.line(xm, y0, xm, o.sol ? zP : 26, { cls: 'dim dash', arrow: o.sol ? '' : 'end', hs: 6 });
    if (!o.sol) f.label(xm + 4, 24, 'z', 'bl', 'small accent');
    f.charge(xl, y0, { q: '+', lab: 'q', at: 'tl' });
    f.charge(xr, y0, { q: neg ? '-' : '+', lab: neg ? '-q' : 'q', at: 'tr' });
    f.dim(xl, y0, xm, y0, 'd/2', { off: 18, at: 'b' }); f.dim(xm, y0, xr, y0, 'd/2', { off: 18, at: 'b' });
    f.dot(xm, zP, 3.2);
    f.tag(xm, zP, 'P', 'l');
    if (!o.sol) { f.label(xm + 6, 132, 'z', 'l', 'small'); return f.svg(); }
    f.line(xl, y0, xm, zP, { cls: 'dim thin' }); f.line(xr, y0, xm, zP, { cls: 'dim thin' });
    f.label(122, 125, md`\srm`, 'r', 'small');
    const L = 42, ux = 60 / Math.hypot(60, 116), uy = 116 / Math.hypot(60, 116);
    f.arrow(xm, zP, xm + ux * L, zP - uy * L, { hs: 6 }); f.label(xm + ux * L + 4, zP - uy * L, md`\mathbf{E}_1`, 'l', 'small');
    if (neg) {
      f.arrow(xm, zP, xm + ux * L, zP + uy * L, { hs: 6 }); f.label(xm + ux * L + 14, zP + uy * L - 6, md`\mathbf{E}_2`, 'l', 'small');
      f.arrow(xm, zP, xm + 2 * ux * L, zP, { cls: 'thick', hs: 8 }); f.label(xm + 2 * ux * L + 4, zP, md`\mathbf{E}`, 'l');
    } else {
      f.arrow(xm, zP, xm - ux * L, zP - uy * L, { hs: 6 }); f.label(xm - ux * L - 4, zP - uy * L, md`\mathbf{E}_2`, 'r', 'small');
      f.arrow(xm, zP, xm, zP - 2 * uy * L, { cls: 'thick', hs: 8 }); f.label(xm, zP - 2 * uy * L - 4, md`\mathbf{E}`, 'b');
    }
    f.angle(xm, zP, 40, 242.6, 270, md`\theta`);
    return f.svg();
  }

  // n equal charges on a circle (clock), one optionally missing; test charge Q at the centre
  function figClock(n = 12, missing = -1) {
    const f = fig();
    const cx = 140, cy = 120, R = 78;
    f.circle(cx, cy, R, { cls: 'dim thin dash' });
    for (let k = 0; k < n; k++) {
      const [x, y] = pol(cx, cy, R, 90 - k * 360 / n);
      if (k === missing) { f.circle(x, y, 6.5, { cls: 'dim dash' }); f.text(x, y + 12, 'empty', 't'); continue; }
      f.charge(x, y, { q: '+', r: 6.5 });
    }
    const [lx, ly] = pol(cx, cy, R + 20, 90 - 360 / n);
    f.label(lx, ly, 'q', 'c', 'small');
    f.dot(cx, cy, 3); f.tag(cx, cy, 'Q', 'r', 8);
    return f.svg();
  }

  // two charges on a line, separation d (zero-field-point questions)
  function figLineQ(lab2 = '4q', s2 = '+', o = {}) {
    const f = fig();
    const y = 70, x1 = o.x1 || 140, x2 = x1 + 150;
    f.line(10, y, x2 + 60, y, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(x2 + 64, y, 'x', 'l', 'small accent');
    f.charge(x1, y, { q: '+', lab: 'q', at: 't' }); f.charge(x2, y, { q: s2, lab: lab2, at: 't' });
    f.dim(x1, y, x2, y, 'd', { off: 18, at: 'b' });
    if (o.zero !== undefined) { const xz = x1 + o.zero * 150; f.circle(xz, y, 4, { cls: 'bgfill' }); f.tag(xz, y, md`\mathbf{E}=0`, 't', 10, 'small'); }
    return f.svg();
  }

  // three charges at corners of a square of side a, field point P at the fourth corner
  function figSquare3(sol) {
    const f = fig();
    const x0 = 80, y0 = 175, s = 115;
    f.rect(x0, y0 - s, s, s, { cls: 'dim thin dash' });
    f.charge(x0, y0 - s, { q: '+', lab: 'q', at: 'tl' });
    f.charge(x0 + s, y0 - s, { q: '+', lab: 'q', at: 'tr' });
    f.charge(x0 + s, y0, { q: '+', lab: 'q', at: 'br' });
    f.dot(x0, y0, 3.2);
    if (!sol) { f.dim(x0, y0, x0 + s, y0, 'a', { off: 18, at: 'b' }); f.tag(x0, y0, 'P', 'bl'); return f.svg(); }
    f.tag(x0, y0, 'P', 'tr', 8);
    const L = 44, d = L / 2 / Math.SQRT2;
    f.arrow(x0, y0, x0, y0 + L, { hs: 6 }); f.label(x0 + 5, y0 + L, md`\mathbf{E}_A`, 'l', 'small');
    f.arrow(x0, y0, x0 - L, y0, { hs: 6 }); f.label(x0 - L, y0 - 5, md`\mathbf{E}_C`, 'b', 'small');
    f.arrow(x0, y0, x0 - d, y0 + d, { hs: 5 });
    f.arrow(x0, y0, x0 - L - d, y0 + L + d, { cls: 'thick', hs: 8 }); f.label(x0 - L - d - 4, y0 + L + d + 2, md`\mathbf{E}`, 'r');
    f.label(x0 + 9, y0 - s + 9, 'A', 'tl', 'small accent'); f.label(x0 + s - 9, y0 - s + 9, 'B', 'tr', 'small accent'); f.label(x0 + s - 9, y0 - 9, 'C', 'br', 'small accent');
    return f.svg();
  }

  // equilateral triangle, charges +q, +q (bottom) and -q (top); field point at the centre
  function figTriangle(sol, tops = '-') {
    const f = fig();
    const cx = 150, cy = 120, R = 80;
    const V = [90, 210, 330].map((a) => pol(cx, cy, R, a));
    f.poly(V, { cls: 'dim thin dash' });
    f.charge(V[0][0], V[0][1], { q: tops, lab: tops === '-' ? '-q' : 'q', at: 't' });
    f.charge(V[1][0], V[1][1], { q: '+', lab: 'q', at: 'bl' });
    f.charge(V[2][0], V[2][1], { q: '+', lab: 'q', at: 'br' });
    f.dot(cx, cy, 3.2); f.tag(cx, cy, 'P', 'b');
    f.dim(V[1][0], V[1][1], V[2][0], V[2][1], 'a', { off: 18, at: 'b' });
    if (sol) { f.arrow(cx, cy, cx, cy - 52, { cls: 'thick', hs: 8 }); f.label(cx + 6, cy - 16, md`\mathbf{E}`, 'l'); }
    return f.svg();
  }

  // regular n-gon of charges inscribed in a circle of radius a; optional zero points at radius r0 a
  function figPolygon(n, r0) {
    const f = fig();
    const cx = 140, cy = 125, R = 92;
    const a0 = n === 4 ? 45 : 90;
    const V = [];
    for (let k = 0; k < n; k++) V.push(pol(cx, cy, R, a0 + k * 360 / n));
    f.circle(cx, cy, R, { cls: 'dim thin dash' });
    f.poly(V, { cls: 'dim thin' });
    f.line(cx, cy, V[0][0], V[0][1], { cls: 'dim thin' });
    const m0 = pol(cx, cy, R * 0.5, a0); f.label(m0[0] - 5, m0[1] - 4, 'a', 'br', 'small');
    V.forEach(([x, y]) => f.charge(x, y, { q: '+', r: 6.5 }));
    const lq = pol(cx, cy, R + 17, a0 + 360 / n); f.label(lq[0], lq[1], 'q', 'c', 'small');
    if (!r0) { f.dot(cx, cy, 2.6); return f.svg(); }
    for (let k = 0; k < n; k++) {
      const am = a0 + (k + 0.5) * 360 / n, apo = R * Math.cos(Math.PI / n);
      const e = pol(cx, cy, apo, am);
      f.line(cx, cy, e[0], e[1], { cls: 'dim dash thin' });
      const z = pol(cx, cy, r0 * R, am);
      f.circle(z[0], z[1], 4.2, { cls: 'bgfill thick' });
    }
    f.circle(cx, cy, 4.2, { cls: 'bgfill thick' });
    const z = pol(cx, cy, r0 * R, n === 4 ? 0 : 270);
    f.tag(z[0], z[1], 'r_0', n === 4 ? 't' : 'tr', 9, 'small');
    return f.svg();
  }

  // straight field-line diagrams
  function figRadial(sign = '+') {
    const f = fig();
    const cx = 120, cy = 100;
    for (let k = 0; k < 8; k++) {
      const a = k * 45, p1 = pol(cx, cy, 15, a), p2 = pol(cx, cy, 70, a);
      if (sign === '+') f.arrow(p1[0], p1[1], p2[0], p2[1], { hs: 6 }); else f.arrow(p2[0], p2[1], p1[0], p1[1], { hs: 6 });
    }
    f.charge(cx, cy, { q: sign });
    return f.svg();
  }
  function figLines(ch, o = {}) {
    const f = fig();
    fieldLines(f, ch, Object.assign({ box: [10, 10, 330, 210], per: 10 }, o));
    for (const [x, y, q] of ch) f.charge(x, y, { q: q > 0 ? '+' : '-' });
    return f.svg();
  }

  // =====================================================================================
  // Figures: continuous distributions
  // =====================================================================================

  function figDq() {
    const a = fig(), b = fig(), c = fig();
    // line
    const lp = [];
    for (let i = 0; i <= 30; i++) { const t = i / 30; lp.push([10 + 140 * t, 120 - 40 * t - 18 * Math.sin(Math.PI * t)]); }
    a.pl(lp, { cls: 'thick' });
    const e = lp[13];
    a.circle(e[0], e[1], 5, { cls: 'dim' });
    a.dot(120, 22, 3); a.tag(120, 22, 'P', 'r');
    a.arrow(e[0] + 3, e[1] - 4, 116, 25, { hs: 6 }); a.label(93.4, 55.6, md`\sr`, 'br', 'small');
    a.label(e[0] + 6, e[1] + 8, md`dl'`, 'tl', 'small'); a.label(154, 76, md`\lambda`, 'l', 'small');
    // surface
    const S = [[10, 125], [115, 125], [155, 85], [50, 85]];
    tint(b, S); b.poly(S, { cls: 'thin' });
    const sq = [[70, 111], [86, 111], [92, 104], [76, 104]];
    tint(b, sq, 0.5); b.poly(sq, { cls: 'thin' });
    b.dot(125, 22, 3); b.tag(125, 22, 'P', 'r');
    b.arrow(84, 105, 121, 26, { hs: 6 }); b.label(98, 64, md`\sr`, 'br', 'small');
    b.label(66, 108, md`da'`, 'r', 'small'); b.label(138, 112, md`\sigma`, 'l', 'small');
    // volume
    const B = blobPts(70, 100, 42, [[3, 0.1, 10], [2, 0.08, 60]]);
    tint(c, B); c.poly(B, { cls: 'thin' });
    c.rect(62, 92, 14, 14, { cls: 'thin' });
    c.dot(140, 18, 3); c.tag(140, 18, 'P', 'r');
    c.arrow(76, 92, 136, 22, { hs: 6 }); c.label(108, 52, md`\sr`, 'br', 'small');
    c.label(69, 110, md`d\tau'`, 't', 'small'); c.label(52, 82, md`\rho`, 'c', 'small');
    return PF.row([
      { svg: a.svg(), cap: md`Line: $dq=\lambda\,dl'$` },
      { svg: b.svg(), cap: md`Surface: $dq=\sigma\,da'$` },
      { svg: c.svg(), cap: md`Volume: $dq=\rho\,d\tau'$` },
    ]).svg;
  }

  // segment from -L to L, field point P at height z above the midpoint (Lecture 1-2)
  function figSegBis(mode = 'setup') {
    const f = fig();
    const y0 = 178, xc = 160, Lp = 125, zP = 62;
    f.line(15, y0, 315, y0, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(319, y0, 'x', 'l', 'small accent');
    f.line(xc - Lp, y0, xc + Lp, y0, { cls: 'thick' });
    f.label(xc + Lp - 4, y0 - 7, md`\lambda`, 'br', 'small');
    const tk = [[xc - Lp, '-L'], [xc, '0'], [xc + Lp, 'L']];
    if (mode === 'theory') tk.push([xc - 70, '-x'], [xc + 70, 'x']);
    for (const [x, t] of tk) { f.line(x, y0 - 4, x, y0 + 4, { cls: 'dim' }); f.label(x, y0 + 8, t, 't', 'small'); }
    f.line(xc, y0, xc, zP, { cls: 'dim dash' });
    f.dot(xc, zP, 3.2); f.tag(xc, zP, 'P', mode === 'theory' ? 'l' : 'r', mode === 'theory' ? 14 : 9);
    f.label(xc + 5, 134, 'z', 'l', 'small');
    if (mode === 'theory') {
      for (const sx of [-1, 1]) {
        const x = xc + sx * 70;
        f.line(x - 7, y0, x + 7, y0, { cls: 'thick' });
        f.circle(x, y0, 6, { cls: 'dim thin' });
        f.line(x, y0, xc, zP, { cls: 'dim' });
        const ux = xc - x, uy = zP - y0, n = Math.hypot(ux, uy);
        f.arrow(xc, zP, xc + ux / n * 44, zP + uy / n * 44, { hs: 6 });
      }
      f.line(xc, zP, xc, zP - 48, { cls: 'dim dash' });
      const ang = Math.atan2(y0 - zP, 70) / D2R;
      f.angle(xc, zP, 32, ang, 90, md`\theta`);
      f.label(xc + 50, 118, md`\srm`, 'l', 'small');
      f.label(xc + 70 + 9, y0 - 6, 'dq', 'bl', 'small');
      const n = Math.hypot(70, y0 - zP);
      f.label(xc + 70 / n * 44 + 4, zP - (y0 - zP) / n * 44, md`d\mathbf{E}`, 'l', 'small');
    }
    return f.svg();
  }

  // segment of length L, field point P at height z above its left end (Discussion 1, Prob. 2.3)
  function figSegEnd(sol) {
    const f = fig();
    const y0 = 178, x0 = 70, Lp = 210, zP = 62;
    f.line(x0, y0, x0 + Lp, y0, { cls: 'thick' });
    f.label(x0 + Lp - 4, y0 - 7, md`\lambda`, 'br', 'small');
    f.dim(x0, y0, x0 + Lp, y0, 'L', { off: 18, at: 'b' });
    f.line(x0, y0, x0, zP, { cls: 'dim dash' });
    f.dot(x0, zP, 3.2);
    f.tag(x0, zP, 'P', 'r');
    if (!sol) { f.dim(x0, y0, x0, zP, 'z', { off: -22, at: 'l' }); return f.svg(); }
    f.label(x0 + 5, 150, 'z', 'l', 'small');
    const xq = x0 + 125;
    f.line(xq - 7, y0, xq + 7, y0, { cls: 'thick' }); f.circle(xq, y0, 6, { cls: 'dim thin' });
    f.label(xq + 9, y0 - 6, 'dq', 'bl', 'small');
    f.line(xq, y0, x0, zP, { cls: 'dim' }); f.label(138.5, 116, md`\srm`, 'bl', 'small');
    f.label((x0 + xq) / 2, y0 - 6, 'x', 'b', 'small accent');
    const ux = x0 - xq, uy = zP - y0, n = Math.hypot(ux, uy), L = 56;
    const tx = x0 + ux / n * L, ty = zP + uy / n * L;
    f.arrow(x0, zP, tx, ty, { cls: 'thick', hs: 7 }); f.label(tx - 4, ty - 2, md`d\mathbf{E}`, 'br', 'small');
    f.line(x0, zP, x0, ty, { cls: 'dim dash' }); f.line(x0, zP, tx, zP, { cls: 'dim dash' });
    f.label(x0 + 4, 30, md`dE_z`, 'l', 'small accent'); f.label(tx, zP + 6, md`dE_x`, 't', 'small accent');
    f.angle(x0, zP, 26, -90 + Math.atan2(xq - x0, y0 - zP) / D2R, -90, md`\theta`);
    return f.svg();
  }

  // circular arc of line charge (semicircle or quarter circle) with field point at the centre
  function figArc(kind = 'semi', sol) {
    const f = fig();
    const cx = 160, cy = 150, R = 100, a1 = kind === 'semi' ? 180 : 90;
    f.pl(f.arcPts(cx, cy, R, R, 0, a1), { cls: 'thick' });
    f.dot(cx, cy, 3.2);
    f.tag(cx, cy, 'P', sol ? 'tl' : (kind === 'semi' ? 'b' : 'bl'));
    f.line(cx, cy, cx + R, cy, { cls: 'dim dash' }); f.label(cx + R / 2 + 8, cy + 4, 'R', 't', 'small');
    const lp = pol(cx, cy, R + 14, kind === 'semi' ? 140 : 70); f.label(lp[0], lp[1], md`\lambda`, 'c', 'small');
    if (sol) {
      const ph = kind === 'semi' ? 52 : 35, e = pol(cx, cy, R, ph);
      f.circle(e[0], e[1], 6, { cls: 'dim thin' });
      f.line(cx, cy, e[0], e[1], { cls: 'dim thin' });
      f.angle(cx, cy, 30, 0, ph, md`\phi`);
      const d = pol(0, 0, 40, ph + 180);
      f.arrow(cx, cy, cx + d[0], cy + d[1], { hs: 6 });
      if (kind === 'semi') {
        f.label(cx + d[0] - 3, cy + d[1] + 2, md`d\mathbf{E}`, 'tr', 'small');
        f.arrow(cx, cy, cx, cy + 62, { cls: 'thick', hs: 8 }); f.label(cx + 5, cy + 58, md`\mathbf{E}`, 'l');
      } else {
        f.label(cx + d[0] - 4, cy + d[1] - 5, md`d\mathbf{E}`, 'br', 'small');
        const t = pol(0, 0, 60, 225); f.arrow(cx, cy, cx + t[0], cy + t[1], { cls: 'thick', hs: 8 }); f.label(cx + t[0] - 4.6, cy + t[1] + 3.6, md`\mathbf{E}`, 'r');
      }
    }
    return f.svg();
  }

  // rod of length L on the x axis, field point P on the axis a distance d beyond its end
  function figRodAxis(sol) {
    const f = fig();
    const y = 90, x0 = 40, Lp = 170, xP = x0 + Lp + 90;
    f.line(10, y, 345, y, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(349, y, 'x', 'l', 'small accent');
    f.line(x0, y, x0 + Lp, y, { cls: 'thick' }); f.label(x0 + 10, y - 7, md`\lambda`, 'bl', 'small');
    f.dot(xP, y, 3.2); f.tag(xP, y, 'P', sol ? 'tl' : 't');
    f.dim(x0, y, x0 + Lp, y, 'L', { off: 18, at: 'b' });
    f.dim(x0 + Lp, y, xP, y, 'd', { off: 18, at: 'b' });
    f.label(x0, y - 9, '0', 'b', 'small accent');
    if (sol) {
      const xq = x0 + 70;
      f.circle(xq, y, 6, { cls: 'dim thin' }); f.label(xq - 8, y - 8, md`dq`, 'br', 'small');
      f.dim(xq, y, xP, y, md`L+d-x`, { off: -34, at: 't' });
      f.arrow(xP + 4, y - 16, xP + 44, y - 16, { cls: 'thick', hs: 7 }); f.label(xP + 48, y - 16, md`d\mathbf{E}`, 'l', 'small');
    }
    return f.svg();
  }

  // =====================================================================================
  // Figures: rings and disks
  // =====================================================================================
  function figRing(sol) {
    const f = fig();
    const cx = 160, cy = 190, rx = 95, ry = 32, zP = 58;
    f.ellipse(cx, cy, rx, ry, { cls: 'thick' });
    f.line(cx, cy, cx, zP - 34, { cls: 'dim dash', arrow: 'end', hs: 6 }); f.label(cx + 4, zP - 36, 'z', 'bl', 'small accent');
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx - rx, cy, { cls: 'dim' }); f.label(cx - rx / 2, cy - 4, 'r', 'b', 'small');
    f.label(cx + rx * 0.62, cy + ry * 0.8 + 4, md`\lambda`, 'tl', 'small');
    f.dot(cx, zP, 3.2);
    if (!sol) { f.tag(cx, zP, 'P', 'r'); f.label(cx + 5, 130, 'z', 'l', 'small'); return f.svg(); }
    f.tag(cx, zP, 'P', 'l', 12);
    const q = [cx + rx, cy], ux = cx - q[0], uy = zP - q[1], n = Math.hypot(ux, uy), L = 46;
    f.circle(q[0], q[1], 6, { cls: 'dim thin' }); f.label(q[0] + 9, q[1], 'dq', 'l', 'small');
    f.line(q[0], q[1], cx, zP, { cls: 'dim' }); f.label(219.5, 124, md`\srm`, 'l', 'small');
    f.arrow(cx, zP, cx + ux / n * L, zP + uy / n * L, { hs: 6 }); f.label(cx + ux / n * L - 3, zP + uy / n * L, md`d\mathbf{E}`, 'r', 'small');
    f.arrow(cx, zP, cx - ux / n * L, zP + uy / n * L, { cls: 'dim dash', hs: 6 });
    f.angle(cx, zP, 32, -90, -90 + Math.atan2(rx, cy - zP) / D2R, md`\theta`);
    return f.svg();
  }

  function figDisk(sol) {
    const f = fig();
    const cx = 160, cy = 195, rx = 118, ry = 34, zP = 58;
    tint(f, ell(cx, cy, rx, ry)); f.ellipse(cx, cy, rx, ry);
    f.line(cx, cy, cx, zP - 34, { cls: 'dim dash', arrow: 'end', hs: 6 }); f.label(cx + 4, zP - 36, 'z', 'bl', 'small accent');
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx - rx, cy, { cls: 'dim' }); if (!sol) f.label(cx - rx / 2, cy - 6, 'R', 'b', 'small');
    f.label(cx + rx * 0.72, cy + ry * 0.75 + 4, md`\sigma`, 'tl', 'small');
    f.dot(cx, zP, 3.2);
    if (!sol) { f.tag(cx, zP, 'P', 'r'); f.label(cx + 5, 126, 'z', 'l', 'small'); return f.svg(); }
    f.tag(cx, zP, 'P', 'l', 12);
    const k = ry / rx;
    f.ellipse(cx, cy, 56, 56 * k, { cls: 'thick' }); f.ellipse(cx, cy, 68, 68 * k, { cls: 'thick' });
    f.line(cx + 62, cy, cx, zP, { cls: 'dim' }); f.label(198, 126, md`\srm`, 'l', 'small');
    return f.svg();
  }

  function figAnnulus() {
    const f = fig();
    const cx = 160, cy = 195, rx = 118, ry = 34, zP = 58, ri = 48;
    tintHoles(f, ell(cx, cy, rx, ry), [ell(cx, cy, ri, ri * ry / rx)]);
    f.ellipse(cx, cy, rx, ry); f.ellipse(cx, cy, ri, ri * ry / rx);
    f.line(cx, cy, cx, zP - 34, { cls: 'dim dash', arrow: 'end', hs: 6 }); f.label(cx + 4, zP - 36, 'z', 'bl', 'small accent');
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx + ri, cy, { cls: 'dim' }); f.label(cx + ri + 5, cy, 'a', 'l', 'small');
    f.line(cx, cy, cx - rx, cy, { cls: 'dim' }); f.label(cx - rx / 2, cy - 6, 'b', 'b', 'small');
    f.label(cx + rx * 0.72, cy + ry * 0.75 + 4, md`\sigma`, 'tl', 'small');
    f.dot(cx, zP, 3.2); f.tag(cx, zP, 'P', 'r'); f.label(cx + 5, 120, 'z', 'l', 'small');
    return f.svg();
  }

  // infinite sheet with a circular hole of radius R; P on the axis of the hole
  function figHole() {
    const f = fig();
    const cx = 170, cy = 200, zP = 62;
    const outer = [[15, 228], [270, 228], [330, 170], [75, 170]];
    const hole = ell(cx, cy, 60, 18);
    tintHoles(f, outer, [hole]);
    f.poly(outer, { cls: 'thin dim' }); f.ellipse(cx, cy, 60, 18);
    f.line(cx, cy, cx, zP - 30, { cls: 'dim dash', arrow: 'end', hs: 6 }); f.label(cx + 4, zP - 32, 'z', 'bl', 'small accent');
    f.dim(cx - 60, cy, cx + 60, cy, '2R', { off: 50, at: 'b' });
    f.label(100, 182, md`\sigma`, 'c', 'small');
    f.text(335, 162, 'extends to infinity', 'br');
    f.dot(cx, zP, 3.2); f.tag(cx, zP, 'P', 'r'); f.label(cx + 5, 125, 'z', 'l', 'small');
    return f.svg();
  }

  // =====================================================================================
  // Figures: flux and Gauss's law
  // =====================================================================================

  // side view of a flat patch in a uniform field; normal da at angle theta to E
  function figFluxPatch() {
    const f = fig();
    const M = [160, 102.5], N = [Math.cos(40 * D2R), -Math.sin(40 * D2R)], T = [-N[1], N[0]];
    const A = [M[0] - 60 * T[0], M[1] - 60 * T[1]], B = [M[0] + 60 * T[0], M[1] + 60 * T[1]];
    for (const y of [20, 185]) f.arrow(30, y, 290, y, { cls: 'dim thin', hs: 6 });
    for (const y of [60, 102.5, 145]) f.arrow(30, y, 100, y, { cls: 'dim thin', hs: 6 });
    f.line(A[0], A[1], B[0], B[1], { cls: 'thick' });
    f.arrow(M[0], M[1], 222, M[1], { hs: 7 }); f.label(226, M[1], md`\mathbf{E}`, 'l');
    f.arrow(M[0], M[1], M[0] + N[0] * 56, M[1] + N[1] * 56, { cls: 'thick', hs: 8 });
    f.label(207, 63, md`d\mathbf{a}`, 'bl');
    f.angle(M[0], M[1], 32, 0, 40, md`\theta`);
    f.text(B[0] + 8, B[1], 'surface (edge on)', 'l');
    return f.svg();
  }

  // Gaussian sphere of radius r around a point charge (Lecture 2)
  function figGaussSphere() {
    const f = fig();
    const cx = 130, cy = 115, R = 55;
    for (let k = 0; k < 8; k++) { const a = k * 45, p1 = pol(cx, cy, 14, a), p2 = pol(cx, cy, 88, a); f.arrow(p1[0], p1[1], p2[0], p2[1], { cls: 'dim', hs: 6 }); }
    f.circle(cx, cy, R, { cls: 'dash' });
    const rr = pol(cx, cy, R, 22.5); f.line(cx, cy, rr[0], rr[1], { cls: 'thin' });
    const rl = pol(cx, cy, R + 12, 22.5); f.label(rl[0], rl[1], 'r', 'c', 'small');
    const s = pol(cx, cy, R, 67.5), t = pol(cx, cy, R + 24, 67.5);
    f.arrow(s[0], s[1], t[0], t[1], { cls: 'thick', hs: 7 }); f.label(t[0] + 4, t[1], md`d\mathbf{a}`, 'l', 'small');
    f.charge(cx, cy, { q: '+' }); f.label(102.3, 126.5, 'q', 'c', 'small');
    return f.svg();
  }

  // an irregular closed surface with charges inside and outside
  function figBlob(inside = [['+', '2q', 105, 100], ['-', '-q', 160, 135]], outside = [['+', '3q', 285, 70]]) {
    const f = fig();
    f.poly(blobPts(135, 115, 80), { cls: 'dash' });
    f.label(52, 40, 'S', 'c');
    for (const [s, l, x, y] of inside.concat(outside)) f.charge(x, y, { q: s, lab: l, at: 'r' });
    return f.svg();
  }

  // point charge with two concentric spheres
  function figConcentric() {
    const f = fig();
    const cx = 130, cy = 115;
    f.circle(cx, cy, 42, { cls: 'dash' }); f.circle(cx, cy, 92, { cls: 'dash' });
    f.charge(cx, cy, { q: '+', lab: 'q', at: 'b' });
    const a = pol(cx, cy, 42, 40), b = pol(cx, cy, 92, 40);
    f.label(a[0] + 4, a[1] - 4, 'S_1', 'bl', 'small'); f.label(b[0] + 4, b[1] - 4, 'S_2', 'bl', 'small');
    return f.svg();
  }

  // a charge inside a sphere but off centre, or outside it
  function figSphereQ(where = 'off') {
    const f = fig();
    const cx = 130, cy = 115, R = 70;
    f.circle(cx, cy, R, { cls: 'dash' });
    f.label(cx - R * 0.72 - 6, cy - R * 0.72 - 6, 'S', 'br', 'small');
    if (where === 'off') f.charge(cx + 34, cy + 10, { q: '+', lab: 'q', at: 'r' });
    else f.charge(cx + R + 45, cy, { q: '+', lab: 'q', at: 'r' });
    f.dot(cx, cy, 2.2);
    return f.svg();
  }

  // cube with a charge at the centre, a corner, ... ; optional shaded face (y = a, right face)
  function figCube(pos = 'center', shade = false) {
    const f = fig({ proj: { ox: 70, oy: 200, s: 1 } });
    const a = 130;
    if (shade) tint(f, [f.p3(0, a, 0), f.p3(a, a, 0), f.p3(a, a, a), f.p3(0, a, a)], 0.3);
    f.box3(a, a, a);
    const P0 = { center: [a / 2, a / 2, a / 2], corner: [0, 0, 0], face: [a / 2, a / 2, 0], edge: [0, a / 2, 0] }[pos];
    const p = f.p3(...P0);
    f.charge(p[0], p[1], { q: '+', lab: 'q', at: { corner: 'tr', edge: 'tl' }[pos] || 'r', r: 6 });
    return f.svg();
  }

  // hemispherical bowl in a uniform field
  function figHemi() {
    const f = fig();
    const cx = 160, cy = 170, R = 85;
    for (const x of [62, 100, 140, 180, 220, 258]) f.arrow(x, 250, x, 40, { cls: 'dim thin', hs: 6 });
    f.label(262, 36, md`\mathbf{E}`, 'bl', 'small');
    f.pl(f.arcPts(cx, cy, R, R, 0, 180), { cls: 'thick' });
    f.ellipse(cx, cy, R, 28, { half: 'back', cls: 'dash' }); f.ellipse(cx, cy, R, 28, { half: 'front' });
    f.line(cx, cy, cx + R, cy, { cls: 'thin' }); f.label(cx + R / 2, cy - 5, 'R', 'b', 'small');
    return f.svg();
  }

  // charged sheet edge-on with the normal fields just above and below and a thin pillbox.
  // o.above / o.below: signed lengths in units (+ = along n-hat, up); 0 = no arrow. Arrows stay outside the pillbox.
  function figSheetBC(o = {}) {
    const f = fig();
    const y = 110, L = 30;
    f.line(20, y, 300, y, { cls: 'thick' }); f.label(296, y - 6, o.slab || md`\sigma`, 'br', 'small');
    if (o.box !== false) f.rect(130, y - 22, 60, 44, { cls: 'dash' });
    const up = o.above ?? 1, dn = o.below ?? -1;
    const len = (v) => L * Math.min(1.5, Math.abs(v));
    if (up > 0) f.arrow(160, y - 26, 160, y - 26 - len(up), { hs: 7 });
    if (up < 0) f.arrow(160, y - 26 - len(up), 160, y - 26, { hs: 7 });
    if (dn < 0) f.arrow(160, y + 26, 160, y + 26 + len(dn), { hs: 7 });
    if (dn > 0) f.arrow(160, y + 26 + len(dn), 160, y + 26, { hs: 7 });
    f.label(168, y - 26 - 22, o.la || md`\mathbf{E}_{\text{above}}`, 'l', 'small');
    f.label(168, y + 26 + 22, o.lb || md`\mathbf{E}_{\text{below}}`, 'l', 'small');
    f.arrow(250, y - 8, 250, y - 40, { cls: 'dim', hs: 6 }); f.label(256, y - 32, md`\hat{\mathbf{n}}`, 'l', 'small');
    return f.svg();
  }

  // =====================================================================================
  // Figures: Gauss's law, spherical symmetry
  // =====================================================================================
  function figShell(sol) {
    const f = fig();
    const cx = 150, cy = 130, R = 68;
    f.circle(cx, cy, R, { cls: 'thick' });
    f.dot(cx, cy, 2.2);
    const e = pol(cx, cy, R, -45); f.line(cx, cy, e[0], e[1], { cls: 'dim' });
    if (sol) f.label(195, 156, 'R', 'c', 'small'); else f.label(186, 146, 'R', 'c', 'small');
    const s = pol(cx, cy, R + 12, 130); f.label(s[0], s[1], md`\sigma`, 'c', 'small');
    if (sol) {
      f.circle(cx, cy, 36, { cls: 'dash' }); f.circle(cx, cy, 104, { cls: 'dash' });
      const b = pol(cx, cy, 104, 60);
      f.label(150, 112, md`r\lt R`, 'c', 'small'); f.label(b[0] + 3, b[1] - 3, md`r\gt R`, 'bl', 'small');
      for (const ang of [10, 100, 190, 280]) { const p = pol(cx, cy, 104, ang), q2 = pol(cx, cy, 130, ang); f.arrow(p[0], p[1], q2[0], q2[1], { hs: 6 }); }
    }
    return f.svg();
  }

  function figSolid(sol, lab = md`\rho`) {
    const f = fig();
    const cx = 140, cy = 125, R = 72;
    tint(f, ell(cx, cy, R, R)); f.circle(cx, cy, R);
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx - R, cy, { cls: 'dim' }); f.label(82, 128, 'R', 't', 'small');
    f.label(cx, cy - 58, lab, 'c', 'small');
    if (sol) {
      const r = 44;
      f.circle(cx, cy, r, { cls: 'dash' });
      const p = pol(cx, cy, r, 35), q2 = pol(cx, cy, r + 24, 35);
      f.line(cx, cy, p[0], p[1], { cls: 'thin' });
      f.label(164, 118, 'r', 'tl', 'small');
      f.rect(p[0] - 4, p[1] - 4, 8, 8, { cls: 'thin' });
      f.arrow(p[0], p[1], q2[0], q2[1], { cls: 'thick', hs: 7 }); f.label(201, 80, md`d\mathbf{a}`, 'bl', 'small');
    }
    return f.svg();
  }

  // two overlapping spheres, +rho and -rho, centre separation d (Lecture 3)
  function figOverlap(sol) {
    const f = fig();
    const R = 75, c1 = [115, 120], c2 = [207.6, 120];
    tint(f, ell(c1[0], c1[1], R, R), 0.14); tint(f, ell(c2[0], c2[1], R, R), 0.14);
    f.circle(c1[0], c1[1], R); f.circle(c2[0], c2[1], R);
    f.dot(c1[0], c1[1], 2.6); f.dot(c2[0], c2[1], 2.6);
    f.label(72, 92, md`+\rho`, 'c'); f.label(252, 92, md`-\rho`, 'c');
    const e = pol(c1[0], c1[1], R, 225); f.line(c1[0], c1[1], e[0], e[1], { cls: 'dim thin' }); f.label(78, 136, 'R', 'c', 'small');
    if (!sol) {
      f.arrow(c1[0] + 4, c1[1], c2[0] - 4, c2[1], { hs: 7 });
      f.label((c1[0] + c2[0]) / 2, c1[1] + 6, md`\mathbf{d}`, 't', 'small');
      return f.svg();
    }
    f.line(c1[0] + 4, c1[1], c2[0] - 4, c2[1], { cls: 'dim dash', arrow: 'end', hs: 6 });
    f.label(128, 126, md`\mathbf{d}`, 't', 'small');
    const X = [161.3, 80];
    cross(f, X[0], X[1]);
    f.arrow(c1[0] + 3, c1[1] - 3, X[0] - 4, X[1] + 3, { hs: 6 }); f.label(133, 96, md`\mathbf{r}_+`, 'br', 'small');
    f.arrow(c2[0] - 3, c2[1] - 3, X[0] + 4, X[1] + 3, { hs: 6 }); f.label(190, 96, md`\mathbf{r}_-`, 'bl', 'small');
    for (const y of [104, 146]) f.arrow(150, y, 173, y, { cls: 'thick', hs: 6 });
    return f.svg();
  }

  // uniformly charged sphere with an off-centre spherical cavity
  function figCavity(sol) {
    const f = fig();
    const c = [150, 125], R = 92, cc = [195, 105], b = 36;
    tintHoles(f, ell(c[0], c[1], R, R), [ell(cc[0], cc[1], b, b)]);
    f.circle(c[0], c[1], R); f.circle(cc[0], cc[1], b);
    f.dot(c[0], c[1], 2.6); f.dot(cc[0], cc[1], 2.2);
    f.arrow(c[0], c[1], cc[0] - 3.3, cc[1] + 1.5, { hs: 6 }); f.label(156, 134, md`\mathbf{a}`, 't', 'small');
    const e = pol(c[0], c[1], R, 225); f.line(c[0], c[1], e[0], e[1], { cls: 'dim thin' }); f.label(113.8, 158.1, 'R', 'r', 'small');
    f.label(105, 85, md`\rho`, 'c');
    if (!sol) {
      f.line(cc[0], cc[1], cc[0] + b, cc[1], { cls: 'dim thin' }); f.label(213, 107, 'b', 't', 'small');
      f.label(cc[0], cc[1] - 14, md`\rho=0`, 'c', 'small');
      return f.svg();
    }
    const u = [45 / Math.hypot(45, 20), -20 / Math.hypot(45, 20)], w = [-u[1], u[0]];
    for (const o of [-15, 15]) { const m = [cc[0] + w[0] * o, cc[1] + w[1] * o]; f.arrow(m[0] - 12 * u[0], m[1] - 12 * u[1], m[0] + 12 * u[0], m[1] + 12 * u[1], { cls: 'thick', hs: 6 }); }
    return f.svg();
  }

  // a field that grows with r, drawn as radial arrows (for E = k r^3 r-hat)
  function figGrow() {
    const f = fig();
    const cx = 130, cy = 115;
    f.circle(cx, cy, 70, { cls: 'dash' });
    for (let k = 0; k < 8; k++) {
      const a = k * 45 + 22.5;
      for (const [r, L] of [[22, 4], [45, 10], [80, 22]]) { const p = pol(cx, cy, r, a), q2 = pol(cx, cy, r + L, a); f.arrow(p[0], p[1], q2[0], q2[1], { hs: 5 }); }
    }
    f.dot(cx, cy, 2.4);
    const e = pol(cx, cy, 70, 0); f.line(cx, cy, e[0], e[1], { cls: 'dim thin' }); f.label(cx + 80, cy, 'R', 'l', 'small');
    return f.svg();
  }

  // =====================================================================================
  // Figures: Gauss's law, cylinders and planes
  // =====================================================================================

  // infinite line charge with a coaxial Gaussian cylinder (Lecture 2); o.rod: solid cylinder of charge
  function figLineCyl(sol, o = {}) {
    const f = fig();
    const y = 110, x1 = 95, x2 = 235, r = 46, ex = 14;
    if (o.rod) { tint(f, [[10, y - 18], [330, y - 18], [330, y + 18], [10, y + 18]]); f.line(10, y - 18, 330, y - 18, { cls: 'thin' }); f.line(10, y + 18, 330, y + 18, { cls: 'thin' }); }
    else f.line(10, y, 330, y, { cls: 'thick' });
    f.label(334, y, o.rod ? md`\rho` : md`\lambda`, 'l', 'small');
    if (o.P) { f.dot(270, y - 60, 3.2); f.tag(270, y - 60, 'P', 'r'); f.dim(270, y, 270, y - 60, 's', { off: 0, at: 'l' }); }
    if (!sol && !o.show) {
      if (o.rod) f.dim(300, y, 300, y - 18, 'R', { off: 0, at: 'r' });
      return f.svg();
    }
    f.line(x1, y - r, x2, y - r, { cls: 'dash' }); f.line(x1, y + r, x2, y + r, { cls: 'dash' });
    f.ellipse(x1, y, ex, r, { cls: 'dash' });
    f.ellipse(x2, y, ex, r, { cls: 'dash' });
    f.dim(x1, y - r, x2, y - r, o.lenLab || 'l', { off: sol ? -40 : -16, at: 't' });
    f.arrow(165, y, 165, y - r + 3, { cls: 'thin', hs: 5 }); f.label(169, 76, o.rad || 's', 'l', 'small');
    if (sol) {
      for (const x of [130, 200]) { f.arrow(x, y - r, x, y - r - 26, { hs: 6 }); f.arrow(x, y + r, x, y + r + 26, { hs: 6 }); }
      f.label(204, 42, md`\mathbf{E}`, 'l', 'small');
      f.arrow(x2 + ex, y + 34, x2 + ex + 30, y + 34, { cls: 'dim', hs: 6 }); f.label(x2 + ex + 34, y + 34, md`d\mathbf{a}`, 'l', 'small');
      f.text(x2 + 6, y + r + 12, md`end caps: $\mathbf E\perp d\mathbf a$`, 'tl');
    }
    return f.svg();
  }

  // cross-section of a coaxial cable (Discussion 1, Prob. 2.17)
  function figCoax(sol) {
    const f = fig();
    const cx = 150, cy = 130, a = 44, b = 100;
    tint(f, ell(cx, cy, a, a), 0.3); f.circle(cx, cy, a);
    f.circle(cx, cy, b, { cls: 'thick' });
    if (!sol) {
      f.dot(cx, cy, 2.2);
      const ea = pol(cx, cy, a, -30); f.line(cx, cy, ea[0], ea[1], { cls: 'dim' });
      const la = pol(cx, cy, 56, -30); f.label(la[0], la[1], 'a', 'c', 'small');
      const eb = pol(cx, cy, b, 135); f.line(cx, cy, eb[0], eb[1], { cls: 'dim' });
      const lb = pol(cx, cy, 86, 150); f.label(lb[0], lb[1], 'b', 'c', 'small');
      f.label(cx + 16, cy - 16, md`\rho`, 'c', 'small');
      const s = pol(cx, cy, b + 18, 300); f.label(s[0], s[1], md`-\sigma`, 'c', 'small');
      return f.svg();
    }
    f.circle(cx, cy, 20, { cls: 'dash' }); f.circle(cx, cy, 72, { cls: 'dash' }); f.circle(cx, cy, 126, { cls: 'dash' });
    f.label(cx, cy, '(i)', 'c', 'small');
    f.label(cx, cy - 58, '(ii)', 'c', 'small');
    const p3 = pol(cx, cy, 155, 30); f.label(p3[0], p3[1], '(iii)', 'c', 'small');
    return f.svg();
  }
  function figCoaxSide() {
    const f = fig();
    const y = 100, x1 = 70, x2 = 250, a = 24, b = 56, e = 0.3;
    f.line(30, y, 330, y, { cls: 'dim dash thin' });
    f.line(x1, y - b, x2, y - b, { cls: 'thick' }); f.line(x1, y + b, x2, y + b, { cls: 'thick' });
    f.ellipse(x1, y, b * e, b, { cls: 'thick' }); f.ellipse(x2, y, b * e, b, { cls: 'thick' });
    tint(f, [[x1, y - a], [x2 + 45, y - a], [x2 + 45, y + a], [x1, y + a]], 0.3);
    f.line(x1, y - a, x2 + 45, y - a); f.line(x1, y + a, x2 + 45, y + a);
    f.ellipse(x2 + 45, y, a * e, a);
    f.label(x2 + 30, y - a - 6, md`\rho`, 'b', 'small'); f.label(x2 - 30, y - b - 6, md`-\sigma`, 'b', 'small');
    f.line(35, y - a, x1, y - a, { cls: 'dim thin' }); f.line(35, y + b, x1, y + b, { cls: 'dim thin' });
    f.dim(35, y, 35, y - a, 'a', { at: 'l' }); f.dim(35, y, 35, y + b, 'b', { at: 'l' });
    f.text((x1 + x2) / 2, y + b + 10, 'long cable, cut away', 't');
    return f.svg();
  }

  // infinite plane (in perspective) with an optional Gaussian pillbox
  function figPlane(sol) {
    const f = fig();
    const S = [[20, 160], [250, 160], [320, 100], [90, 100]];
    tint(f, S); f.poly(S, { cls: 'thin' });
    f.label(240, 142, md`\sigma`, 'c', 'small');
    if (!sol) return f.svg();
    const cx = 170, ry = 8, rx = 30, top = 70, bot = 190;
    f.ellipse(cx, top, rx, ry, { cls: 'dash' }); f.ellipse(cx, bot, rx, ry, { half: 'front', cls: 'dash' });
    f.line(cx - rx, top, cx - rx, bot, { cls: 'dash' }); f.line(cx + rx, top, cx + rx, bot, { cls: 'dash' });
    f.label(cx + rx + 4, top - 4, 'A', 'bl', 'small');
    f.arrow(cx, top - 6, cx, top - 46, { cls: 'thick', hs: 8 }); f.label(cx + 5, top - 40, md`\mathbf{E}`, 'l', 'small');
    f.arrow(cx, bot + 10, cx, bot + 50, { cls: 'thick', hs: 8 }); f.label(cx + 5, bot + 44, md`\mathbf{E}`, 'l', 'small');
    return f.svg();
  }

  // two parallel infinite planes, edge on
  function figTwoPlanes(l1 = md`+\sigma`, l2 = md`-\sigma`) {
    const f = fig();
    const x1 = 120, x2 = 220;
    f.line(x1, 20, x1, 200, { cls: 'thick' }); f.line(x2, 20, x2, 200, { cls: 'thick' });
    f.label(x1, 14, l1, 'b', 'small'); f.label(x2, 14, l2, 'b', 'small');
    f.label(60, 110, '(i)', 'c', 'small accent'); f.label(170, 110, '(ii)', 'c', 'small accent'); f.label(280, 110, '(iii)', 'c', 'small accent');
    f.text(170, 214, 'edge-on view, planes extend to infinity', 't');
    return f.svg();
  }

  // slab of thickness 2d, edge on, with y axis; sol: 'in' or 'out' Gaussian box
  function figSlab(sol, o = {}) {
    const f = fig();
    const yc = 120, h = 46, x0 = 40, x1 = 320;
    tint(f, [[x0, yc - h], [x1, yc - h], [x1, yc + h], [x0, yc + h]]);
    f.line(x0, yc - h, x1, yc - h, { cls: 'thin' }); f.line(x0, yc + h, x1, yc + h, { cls: 'thin' });
    f.line(x0, 210, x0, 25, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(x0 + 4, 22, 'y', 'bl', 'small accent');
    f.label(x0 - 6, yc, '0', 'r', 'small accent');
    f.line(x0 - 4, yc, x0 + 4, yc, { cls: 'dim' });
    f.label(x0 - 6, yc - h, o.top || 'd', 'r', 'small accent'); f.label(x0 - 6, yc + h, o.bot || '-d', 'r', 'small accent');
    f.label(290, yc, o.lab || md`\rho`, 'c', 'small');
    if (!sol) { f.text(300, yc + h + 8, 'infinite in x and z', 'tr'); return f.svg(); }
    const xa = 150, xb = 220, yy = sol === 'out' ? 78 : 30;
    f.rect(xa, yc - yy, xb - xa, 2 * yy, { cls: 'dash' });
    f.arrow((xa + xb) / 2, yc - yy, (xa + xb) / 2, yc - yy - 28, { cls: 'thick', hs: 7 });
    f.arrow((xa + xb) / 2, yc + yy, (xa + xb) / 2, yc + yy + 28, { cls: 'thick', hs: 7 });
    if (sol === 'out') f.label(xb + 4, yc - yy, md`|y|\gt d`, 'l', 'small');
    else { f.label(xb + 4, yc - yy, 'y', 'l', 'small'); f.label(xb + 4, yc + yy, '-y', 'l', 'small'); }
    f.label((xa + xb) / 2 + 5, yc - yy - 34, md`\mathbf{E}`, 'l', 'small');
    return f.svg();
  }

  // =====================================================================================
  // Figures: divergence and curl
  // =====================================================================================

  // parallel-plate capacitor (Lecture 3)
  function figCapacitor(o = {}) {
    const f = fig();
    const x1 = 80, x2 = 230, y1 = 30, y2 = 190;
    f.rect(x1 - 6, y1, 6, y2 - y1, { cls: 'thick' }); f.rect(x2, y1, 6, y2 - y1, { cls: 'thick' });
    f.label(x1 - 8, y1 - 4, '+Q', 'br', 'small'); f.label(x2 + 8, y1 - 4, '-Q', 'bl', 'small');
    for (const y of [55, 95, 135, 170]) f.arrow(x1 + 6, y, x2 - 6, y, { cls: 'dim', hs: 6 });
    if (o.box) { f.rect(96, 103, 26, 26, { cls: 'dash' }); f.text(126, 116, 'small box', 'l'); }
    if (o.point) { f.dot(160, 115, 3); f.tag(160, 115, 'P', 'r', 8); }
    f.arrow(x1, 212, x2, 212, { cls: 'dim', hs: 6 }); f.label(x2 + 4, 212, 'z', 'l', 'small accent');
    return f.svg();
  }

  // closed path made of two radial segments and two arcs around a point charge
  function figWedge() {
    const f = fig();
    const cx = 60, cy = 190, ra = 80, rb = 190, a0 = 20, a1 = 62;
    const pts = [].concat(f.arcPts(cx, cy, ra, ra, a1, a0), f.arcPts(cx, cy, rb, rb, a0, a1)).concat([pol(cx, cy, ra, a1)]);
    f.pl(pts, { cls: 'thick' });
    headAt(f, f.arcPts(cx, cy, rb, rb, a0, a1), 0.5, { hs: 7 });
    headAt(f, f.arcPts(cx, cy, ra, ra, a1, a0), 0.5, { hs: 7 });
    const s1 = [pol(cx, cy, ra, a0), pol(cx, cy, rb, a0)], s2 = [pol(cx, cy, rb, a1), pol(cx, cy, ra, a1)];
    headAt(f, s1, 0.55, { hs: 7 }); headAt(f, s2, 0.55, { hs: 7 });
    f.charge(cx, cy, { q: '+', lab: 'q', at: 'bl' });
    for (const a of [a0, a1]) { const p = pol(cx, cy, 30, a), q2 = pol(cx, cy, 62, a); f.line(p[0], p[1], q2[0], q2[1], { cls: 'dim dash thin' }); }
    const l1 = pol(cx, cy, 135, a0); f.label(l1[0] + 4, l1[1] + 4, '1', 'tl', 'small');
    const l2 = pol(cx, cy, 202, (a0 + a1) / 2); f.label(l2[0], l2[1], '2', 'bl', 'small');
    const l3 = pol(cx, cy, 135, a1); f.label(l3[0] - 6, l3[1] - 2, '3', 'br', 'small');
    const l4 = pol(cx, cy, 70, (a0 + a1) / 2); f.label(l4[0], l4[1], '4', 'tr', 'small');
    return f.svg();
  }

  // closed loop near a point charge (not enclosing it, or enclosing it)
  function figLoopQ(enclose) {
    const f = fig();
    const pts = blobPts(160, 110, 62, [[2, 0.15, 30], [3, 0.06, 0]]);
    f.poly(pts, { cls: 'thick' });
    headAt(f, pts.slice(0, 40), 0.5, { hs: 7 });
    headAt(f, pts.slice(60, 100), 0.5, { hs: 7 });
    if (enclose) f.charge(160, 112, { q: '+', lab: 'q', at: 'b' }); else f.charge(30, 112, { q: '+', lab: 'q', at: 'b' });
    f.label(214, 40, 'C', 'c', 'small');
    return f.svg();
  }

  // =====================================================================================
  // Plots
  // =====================================================================================
  const plotE = (o) => PF.plot(Object.assign({ w: 340, h: 200, zero: true }, o));
  const plotShell = () => plotE({ x: [0, 3.2], y: [0, 1.25], xl: 'r', yl: md`|\mathbf{E}|`, xt: [[1, 'R']], yt: [[1, md`\dfrac{\sigma}{\varepsilon_0}`]], ml: 50,
    curves: [{ f: () => 0, to: 1 }, { f: (r) => 1 / (r * r), from: 1 }] });
  const plotSolid = () => plotE({ x: [0, 3.2], y: [0, 1.25], xl: 'r', yl: md`|\mathbf{E}|`, xt: [[1, 'R']], yt: [[1, md`\dfrac{\rho R}{3\varepsilon_0}`]], ml: 56,
    curves: [{ f: (r) => (r < 1 ? r : 1 / (r * r)) }] });
  const plotCoax = () => plotE({ x: [0, 3.2], y: [0, 1.2], xl: 's', yl: md`|\mathbf{E}|`, xt: [[1, 'a'], [2.2, 'b']], yt: [[1, md`\dfrac{\rho a}{2\varepsilon_0}`]], ml: 56,
    curves: [{ f: (s) => (s < 1 ? s : 1 / s), to: 2.2 }, { f: () => 0, from: 2.2 }] });
  const plotSlab = () => plotE({ x: [-2.5, 2.5], y: [-1.3, 1.3], xl: 'y', yl: md`E_y`, xt: [[-1, '-d'], [1, 'd']], yt: [[1, md`\dfrac{\rho d}{\varepsilon_0}`], [-1, md`-\dfrac{\rho d}{\varepsilon_0}`]],
    curves: [{ f: (y) => (Math.abs(y) < 1 ? y : Math.sign(y)) }], ml: 62 });
  const plotRhoKr = () => plotE({ x: [0, 3.2], y: [0, 1.25], xl: 'r', yl: md`|\mathbf{E}|`, xt: [[1, 'R']], yt: [[1, md`\dfrac{kR^2}{4\varepsilon_0}`]], ml: 56,
    curves: [{ f: (r) => (r < 1 ? r * r : 1 / (r * r)) }] });
  const plotLineSeg = () => plotE({ x: [0, 4], y: [0, 4], xl: md`z/L`, yl: md`E\cdot\dfrac{4\pi\varepsilon_0 L}{\lambda}`, xt: [[1, '1'], [2, '2'], [3, '3']], yt: [[1, '1'], [2, '2'], [3, '3']], mt: 30,
    curves: [
      { f: (z) => 2 / (z * Math.sqrt(1 + z * z)), from: 0.25 },
      { f: (z) => 2 / z, from: 0.5, cls: 'dim dash' },
      { f: (z) => 2 / (z * z), from: 0.7, cls: 'dim thin' },
      { pts: [[1.9, 3.7], [2.2, 3.7]], lab: md`\text{segment}`, labAt: 2.2, dx: 6, dy: 0 },
      { pts: [[1.9, 3.17], [2.2, 3.17]], cls: 'dim dash', lab: md`\text{infinite wire}`, labAt: 2.2, dx: 6, dy: 0 },
      { pts: [[1.9, 2.64], [2.2, 2.64]], cls: 'dim thin', lab: md`\text{point charge}`, labAt: 2.2, dx: 6, dy: 0 },
    ] });
  // ring: E_z(z) on the axis, maximum at z = r / sqrt 2
  const plotRing = () => plotE({ x: [0, 4], y: [0, 0.45], xl: md`z/r`, yl: md`E_z\cdot\dfrac{4\pi\varepsilon_0 r^2}{Q}`, xt: [[Math.SQRT1_2, md`\tfrac{1}{\sqrt2}`], [1, '1'], [2, '2'], [3, '3']], yt: [[0.3849, '0.385']], mt: 30, ml: 52,
    curves: [{ f: (z) => z / Math.pow(1 + z * z, 1.5) }] });
  // radial field along the ray toward an edge midpoint, n-gon of charges (Prob. 2.59), units q/(4 pi eps0 a^2)
  const polyEr = (r, n) => { let E = 0; for (let k = 0; k < n; k++) { const dp = 2 * Math.PI * k / n - Math.PI / n, s2 = r * r + 1 - 2 * r * Math.cos(dp); E += (r - Math.cos(dp)) / Math.pow(s2, 1.5); } return E; };
  const plotPoly = () => plotE({ x: [0, 0.85], y: [-1, 1.1], xl: md`r/a`, yl: md`E_r\cdot\dfrac{4\pi\varepsilon_0 a^2}{q}`, mt: 30, ml: 40,
    xt: [[0.5469, '0.547'], [0.6889, '0.689']], yt: [[1, '1'], [-1, '-1']],
    curves: [
      { f: (r) => polyEr(r, 4), from: 0.001, to: 0.7036 },
      { f: (r) => polyEr(r, 5), from: 0.001, to: 0.805, cls: 'dash' },
      { pts: [[0.05, 0.95], [0.13, 0.95]], lab: md`n=4`, labAt: 0.13, dx: 6, dy: 0 },
      { pts: [[0.05, 0.68], [0.13, 0.68]], cls: 'dash', lab: md`n=5`, labAt: 0.13, dx: 6, dy: 0 },
    ],
    pts: [{ x: 0.5469, y: 0 }, { x: 0.6889, y: 0 }] });

  // a block of code, shown as a figure (monospace, left-aligned)
  const code = (src) => `<pre style="text-align:left;font-size:12.5px;line-height:1.4;margin:0 auto;max-width:600px;overflow-x:auto;padding:8px 10px;border:1px solid var(--line-2);border-radius:4px"><code>${src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  // a uniformly charged solid cube (tinted faces)
  function figCubeSolid() {
    const f = fig({ proj: { ox: 70, oy: 200, s: 1 } });
    const a = 130;
    const faces = [[[a, 0, 0], [a, a, 0], [a, a, a], [a, 0, a]], [[0, a, 0], [a, a, 0], [a, a, a], [0, a, a]], [[0, 0, a], [a, 0, a], [a, a, a], [0, a, a]]];
    for (const F of faces) tint(f, F.map((p) => f.p3(...p)), 0.16);
    f.box3(a, a, a);
    const c = f.p3(a, a / 2, a / 2); f.label(c[0], c[1], md`\rho`, 'c', 'small');
    return f.svg();
  }
  // an open surface S (tinted) and its closed boundary P (Stokes' theorem)
  function figStokes() {
    const f = fig();
    const P2 = blobPts(160, 110, 80, [[2, 0.12, 20], [3, 0.07, 0]]).map(([x, y]) => [x, 110 + (y - 110) * 0.55]);
    tint(f, P2, 0.16); f.poly(P2, { cls: 'thick' });
    headAt(f, P2.slice(0, 40), 0.5, { hs: 7 }); headAt(f, P2.slice(60, 100), 0.5, { hs: 7 });
    f.arrow(160, 110, 160, 40, { hs: 7 }); f.label(166, 46, md`d\mathbf{a}`, 'l', 'small');
    f.label(118, 112, 'S', 'c', 'small');
    const r = P2.reduce((m, p) => (p[0] > m[0] ? p : m), [0, 0]); f.label(r[0] + 10, r[1], 'P', 'l', 'small');
    return f.svg();
  }
  // a circulating field k/s phi-hat around a line (seen end on)
  function figVortex() {
    const f = fig();
    const cx = 120, cy = 110;
    f.field((x, y) => { const dx = x - cx, dy = y - cy, r2 = dx * dx + dy * dy; if (r2 < 300) return null; return [dy / r2, -dx / r2]; }, [30, 20, 210, 200], 7, 7, { len: 22, mag: true });
    f.dot(cx, cy, 3);
    return f.svg();
  }
  // the swirl k(y, -x, 0) (clockwise for k > 0, growing with distance) and a circle of radius R traversed counterclockwise
  function figSwirl() {
    const f = fig();
    const cx = 120, cy = 110, R = 62;
    f.field((x, y) => { const dx = x - cx, dy = y - cy; if (dx * dx + dy * dy < 100) return null; return [-dy, dx]; }, [30, 20, 210, 200], 7, 7, { len: 20, mag: true, cls: 'dim' });
    const C = f.arcPts(cx, cy, R, R, 0, 360);
    f.pl(C, { cls: 'dash' });
    headAt(f, f.arcPts(cx, cy, R, R, 30, 60), 0.5, { hs: 7 });
    headAt(f, f.arcPts(cx, cy, R, R, 210, 240), 0.5, { hs: 7 });
    f.dot(cx, cy, 2.4);
    return f.svg();
  }
  // charged surface edge-on with the tangential field drawn above it (continuity of E-parallel)
  function figTanBC() {
    const f = fig();
    const y = 110;
    f.line(20, y, 300, y, { cls: 'thick' }); f.label(296, y - 6, md`\sigma`, 'br', 'small');
    f.arrow(110, y - 30, 200, y - 30, { hs: 7 }); f.label(206, y - 30, md`E_\parallel=3E_0`, 'l', 'small');
    f.label(155, y + 30, md`E_\parallel=\ ?`, 'c', 'small');
    f.text(70, y - 30, 'east', 'r');
    f.rect(130, y - 12, 70, 24, { cls: 'dash' });
    return f.svg();
  }

  // =====================================================================================
  // Lesson 1 — Coulomb's law, the field, superposition (Lecture 1; Griffiths 2.1.1–2.1.3)
  // =====================================================================================
  const L1 = {
    id: 'u1-coulomb', title: "Coulomb's law, the field and superposition",
    steps: [
      RF(md`
        The basic problem of electrostatics: you are given **source charges** $q_1, q_2, \dots$ held fixed (no velocities, no accelerations). What force do they exert on a **test charge** $Q$ placed at a point $P$?

        For one source charge $q$ at $\vb r'$ and the test charge at $\vb r$, Coulomb's law (an experimental fact) gives

        $$\vb F=\kq\,\dfrac{qQ}{\srm^2}\,\srh,\qquad \sr=\vb r-\vb r'.$$

        [[fig:sep]]

        Keep three vectors apart. $\vb r'$ (primed) locates the **source**. $\vb r$ (unprimed) locates the **field point**. The separation vector $\sr=\vb r-\vb r'$ points **from the source to the field point**. Its length $\srm=|\sr|$ is the distance and $\srh=\sr/\srm$ is the direction. The constant $\ep=8.85\times10^{-12}\ \mathrm{C^2/(N\,m^2)}$ is the permittivity of free space.

        !!key The electric field
          Divide out the test charge. The field of $q$ at $\vb r$ is
          $$\vb E(\vb r)=\dfrac{\vb F}{Q}=\kq\,\dfrac{q}{\srm^2}\,\srh .$$
          It depends only on the source charge and on where $P$ is, not on $Q$. Once you know $\vb E$, the force on any charge $Q$ placed at $P$ is $\vb F=Q\vb E$.

        Same-sign charges repel: $\vb F$ points along $+\srh$, away from $q$. Opposite signs attract. The field of a positive charge points away from it everywhere; the field of a negative charge points toward it.
      `, { sep: { svg: figSep(), cap: md`Source charge $q$ at $\vb r'$, field point $P$ at $\vb r$. The separation vector $\sr$ runs from the source to the field point.` } }),

      Q(md`For the force on the test charge $Q$ (at $\vb r_Q$) due to the source charge $q$ (at $\vb r_q$), which vector is $\sr$ in Coulomb's law?`,
        [md`$\vb r_Q-\vb r_q$, pointing from $q$ to $Q$`, md`$\vb r_q-\vb r_Q$, pointing from $Q$ to $q$`, md`$\vb r_Q+\vb r_q$`, md`It depends on the signs of $q$ and $Q$`], 0,
        [null,
          md`That is the reversed vector. With it, two positive charges would attract. The separation vector always starts at the source and ends at the field point.`,
          md`A sum of two position vectors depends on where you put the origin, so it cannot describe the geometry between the charges. Only the difference is origin-independent.`,
          md`The signs enter through the product $qQ$ in front. $\sr$ is pure geometry: it runs from the source point to the field point whatever the charges are.`],
        md`$\sr=\vb r-\vb r'$: field point minus source point, so it points **from the source to the field point**. Here the field point is where $Q$ sits. The signs of the charges are carried by $qQ$; if $qQ<0$ the force is along $-\srh$, toward $q$.`,
        { figHtml: figQq('+', '+') }),

      Q(md`A test charge $Q$ at $P$ feels a force $\vb F$ from fixed source charges. You replace it by a test charge $2Q$ at the same point. What happens to the field $\vb E$ at $P$ and to the force on the test charge?`,
        [md`Both double`, md`$\vb E$ doubles, the force is unchanged`, md`$\vb E$ is unchanged, the force doubles`, md`Both are unchanged`], 2,
        [md`The field is made by the source charges only. The test charge does not change it.`,
          md`Backwards. $\vb E$ belongs to the sources; the force $\vb F=Q\vb E$ scales with the test charge.`,
          null,
          md`The field is unchanged, but $\vb F=Q\vb E$ is proportional to the test charge, so the force doubles.`],
        md`$\vb E(\vb r)$ is set by the source charges and the position of $P$; the test charge does not appear in it. The force is $\vb F=Q\vb E$, so doubling $Q$ doubles $\vb F$. This is why the field is useful: compute it once, then get the force on any charge you put there.`,
        { figHtml: figQq('+', '+') }),

      Q(md`The source $q$ is positive and the test charge $Q$ is negative, as drawn. Which way does the force on $Q$ point?`,
        [md`Away from $q$, along $+\srh$`, md`Toward $q$, along $-\srh$`, md`Perpendicular to the line joining them`, md`There is no force: the signs cancel`], 1,
        [md`That is the direction for like charges. Here $qQ<0$, so $\vb F$ is along $-\srh$.`,
          null,
          md`Coulomb's law is a central force: always along the line joining the two charges.`,
          md`Opposite signs do not cancel the force; they make it attractive. The product $qQ$ is negative, not zero.`],
        md`$\vb F=\kq\,\dfrac{qQ}{\srm^2}\srh$ with $qQ<0$, so $\vb F$ points along $-\srh$, from $Q$ back toward $q$: opposite charges attract.`,
        { figHtml: figQq('+', '-') }),

      Q(md`The field point $P$ is moved so that its distance from a point charge triples. By what factor does $|\vb E|$ change?`,
        [md`$1/3$`, md`$1/9$`, md`$1/27$`, md`$3$`], 1,
        [md`That would be a $1/\srm$ law, like the field of an infinite line. A point charge falls as $1/\srm^2$.`, null,
          md`$1/\srm^3$ is how a dipole field falls off far away, not a single charge.`, md`The field gets weaker with distance, not stronger.`],
        md`$|\vb E|\propto 1/\srm^2$, so tripling $\srm$ divides the field by $3^2=9$.`,
        { figHtml: figQq('+', '+') }),

      Q(md`Lecture 1 lists three features of classical electrodynamics. Which statement describes it being the first **gauge** theory?`,
        [md`It describes fields rather than forces between particles.`, md`It is Lorentz invariant: the speed of light is the same in every frame.`, md`It is written in SI units rather than CGS units.`, md`The potentials can be chosen in different gauges and still describe the same $\vb E$ and $\vb B$.`], 3,
        [md`That is the “first field theory” feature.`, md`That is the “compatible with special relativity” feature.`, md`Units are a convention for this course. The notes call CGS “more mathematically beautiful but impractical”.`, null],
        md`The three features in the notes: compatible with special relativity (Lorentz invariant), the first field theory (fields instead of forces between particles), and the first gauge theory (the potentials $V$ and $\vb A$ can be chosen in different gauges and give the same fields). The gauge idea later inspired relativistic quantum mechanics.`,
        { nofig: 'definition question about the course overview, no geometry' }),

      RF(md`
        ### Superposition
        The field of several charges is the **vector** sum of the fields each would make alone:

        $$\vb E(\vb r)=\kq\sum_{i=1}^{N}\dfrac{q_i}{\srm_i^{2}}\,\srh_i,\qquad \sr_i=\vb r-\vb r_i'.$$

        Each term has its own separation vector, from charge $i$ to the field point. You add vectors, so in practice you add components. Before computing anything, look for symmetry: a component that must cancel is one you never have to add or integrate.

        !!method Field of a few point charges
          1. Draw each separation vector from its charge to $P$.
          2. Write each magnitude $kq_i/\srm_i^2$ (with $k=1/4\pi\ep$) and draw each field arrow (away from $+$, toward $-$).
          3. Decide which components cancel by symmetry.
          4. Add the surviving components. Check a limit: far away, the set should look like a single charge equal to the net charge.

        !!trap Adding magnitudes
          $|\vb E_1+\vb E_2|\neq|\vb E_1|+|\vb E_2|$ unless the two fields are parallel. Always resolve into components first.
      `),

      RF(md`
        ### Worked example: two equal charges (Griffiths Ex. 2.1)
        Two charges $q$ sit on the $x$ axis at $x=\pm d/2$. Find $\vb E$ a height $z$ above the midpoint.

        [[fig:setup]]

        Both charges are a distance $\srm=\sqrt{z^2+(d/2)^2}$ from $P$, so the two fields have the same magnitude $\kq\,q/\srm^2$. Their $x$ components are equal and opposite (mirror symmetry about the $z$ axis), and their $z$ components add. Each $z$ component is the magnitude times $\cos\theta$, where $\theta$ is the angle between $\sr$ and the $z$ axis, $\cos\theta=z/\srm$:

        [[fig:sol]]

        $$E_z=2\cdot\kq\,\dfrac{q}{\srm^2}\cdot\dfrac{z}{\srm}=\kq\,\dfrac{2qz}{\left(z^2+d^2/4\right)^{3/2}},\qquad \vb E=E_z\,\uv z .$$

        **Checks.** For $z\gg d$ the bracket is $z^2$ and $E\to\kq\,\dfrac{2q}{z^2}$: from far away the pair looks like one charge $2q$. At $z=0$, the midpoint, $E=0$: the two pushes cancel.
      `, { setup: { svg: figPair(), cap: md`Equal charges $q$ at $x=\pm d/2$; field point $P$ on the $z$ axis.` }, sol: { svg: figPair({ sol: true }), cap: md`The $x$ components cancel; the $z$ components add.` } }),

      Q(md`In the example above, a student adds the two magnitudes and writes $|\vb E|=2kq/\srm^2$. At the height $z=d/2$, by what factor is the student's answer too large?`,
        [md`$2$`, md`$\sqrt2$`, md`It is correct`, md`$1/\sqrt2$ (it is too small)`], 1,
        [md`Each field still contributes; only the horizontal parts cancel. The lost factor is $\cos\theta$, not $1/2$.`,
          null,
          md`Adding magnitudes ignores the cancelling $x$ components. The true field is $2kq/\srm^2\cdot\cos\theta$.`,
          md`Adding magnitudes can only overestimate a vector sum.`],
        md`The true result is $E=\dfrac{2kq}{\srm^2}\cos\theta$. At $z=d/2$ the angle is $45^\circ$ ($z$ equals the horizontal distance $d/2$), so $\cos\theta=1/\sqrt2$ and the student's answer is $\sqrt2$ times too big.`,
        { figHtml: figPair() }),

      Q(md`Twelve equal charges $q$ sit at the hour marks of a clock face of radius $R$ (Griffiths 2.1). What is the net force on a test charge $Q$ at the centre?`,
        [md`$12\,kqQ/R^2$, outward`, md`$12\,kqQ/R^2$, toward 12 o'clock`, md`Zero`, md`You cannot tell without integrating`], 2,
        [md`The twelve forces point in twelve different directions. Their magnitudes do not simply add.`,
          md`Nothing singles out 12 o'clock: the arrangement looks the same after a rotation by $30^\circ$.`,
          null,
          md`No integral is needed. Symmetry settles it.`],
        md`Rotate the clock by $30^\circ$: the arrangement is unchanged, so the net force must be unchanged. The only vector that is unchanged by such a rotation is zero. (Or pair each charge with the one opposite it: their forces cancel.)`,
        { figHtml: figClock(12) }),

      Q(md`Now remove the charge at 6 o'clock. What is the force on $Q>0$ at the centre?`,
        [md`$kqQ/R^2$, pointing toward the empty 6 o'clock spot`, md`$kqQ/R^2$, pointing toward 12 o'clock`, md`$11\,kqQ/R^2$, toward 12 o'clock`, md`Zero, because the other eleven are still symmetric`], 0,
        [null,
          md`The charge at 12 o'clock is no longer balanced, and it pushes $Q$ away from 12, toward 6.`,
          md`Ten of the remaining charges still cancel in pairs. Only the 12 o'clock charge is unpaired.`,
          md`With one charge missing the arrangement is no longer symmetric under rotation.`],
        md`Superposition trick: eleven charges = twelve charges $+$ a charge $-q$ at 6 o'clock. The twelve give zero. A charge $-q$ at 6 o'clock attracts $Q$ toward 6 o'clock with magnitude $kqQ/R^2$. (Equivalently: the 12 o'clock charge has lost its partner and pushes $Q$ toward 6.)`,
        { figHtml: figClock(12, 6) }),

      Q(md`Charges $q$ and $4q$ (both positive) are a distance $d$ apart. Where on the line through them is $\vb E=0$ (apart from infinity)?`,
        [md`Between them, $d/3$ from $q$`, md`Between them, $d/5$ from $q$`, md`Between them, at the midpoint`, md`Outside, beyond $q$, a distance $d$ from $q$`], 0,
        [null,
          md`That comes from $1/x=4/(d-x)$: the field falls as $1/x^2$, so the condition is $1/x^2=4/(d-x)^2$.`,
          md`At the midpoint the $4q$ field is four times larger.`,
          md`Outside, both fields point the same way (away from both charges), so they cannot cancel.`],
        md`The fields can cancel only where they point in opposite directions: between two like charges. Set $\dfrac{kq}{x^2}=\dfrac{4kq}{(d-x)^2}$, so $d-x=2x$ and $x=d/3$. The zero sits closer to the smaller charge.`,
        { figHtml: figLineQ('4q', '+') }),

      Q(md`Now the charges are $+q$ and $-4q$, a distance $d$ apart. Where is $\vb E=0$?`,
        [md`Between them, $d/3$ from $+q$`, md`Beyond $-4q$, a distance $d$ from it`, md`Beyond $+q$ (on the side away from $-4q$), a distance $d$ from $+q$`, md`Nowhere`], 2,
        [md`Between unlike charges both fields point the same way (toward the negative charge), so they add.`,
          md`Near $-4q$ its field dominates. The zero must be on the side of the smaller charge.`,
          null,
          md`Outside the pair, on the side of the smaller charge, the fields point in opposite directions and fall off at different rates, so they cross.`],
        md`Outside, on the $+q$ side, a distance $x$ from $+q$: $\dfrac{kq}{x^2}=\dfrac{4kq}{(x+d)^2}$, so $x+d=2x$ and $x=d$. The zero is always on the side of the smaller magnitude charge, where its weaker strength is made up for by being closer.`,
        { figHtml: figLineQ('-4q', '-', { x1: 180 }) }),

      P({
        title: 'Three charges on a square',
        q: md`Charges $+q$ sit at three corners of a square of side $a$. Find the field at the empty corner $P$: its magnitude in units of $\dfrac{q}{4\pi\ep a^2}$, and its direction.`,
        figHtml: figSquare3(),
        hints: [md`Superposition of three point charges. Draw each field at $P$: each points away from its charge.`, md`Two charges are a distance $a$ away; the far corner is $a\sqrt2$ away and its field is along the diagonal.`, md`Use components along the two sides. The diagonal field contributes $\dfrac{kq}{2a^2}\cdot\dfrac{1}{\sqrt2}$ to each.`],
        parts: [
          { lbl: md`$|\vb E|$ in units of $q/(4\pi\ep a^2)$`, ans: Math.SQRT2 + 0.5 },
          { lbl: md`Direction of $\vb E$ at $P$:`, mc: [md`Along the diagonal, away from the opposite corner`, md`Along the diagonal, toward the opposite corner`, md`Along a side of the square`, md`Perpendicular to the diagonal`], a: 0,
            why: [null, md`All three charges are positive, so every field points away from its charge; the sum points away from the square.`, md`The two near charges give equal components along the two sides, so the sum lies on the diagonal.`, md`By the mirror symmetry about the diagonal through $P$ and the opposite corner, the field must lie along that diagonal.`] },
        ],
        sol: md`
          Put $P$ at the origin with $C$ on the $+x$ axis and $A$ on the $+y$ axis, so the square fills the first quadrant. Let $k=1/4\pi\ep$.

          [[fig:s]]

          - $A$ (distance $a$ above $P$): $\vb E_A=\dfrac{kq}{a^2}(-\uv y)$.
          - $C$ (distance $a$ to the right): $\vb E_C=\dfrac{kq}{a^2}(-\uv x)$.
          - $B$ (distance $a\sqrt2$ along the diagonal): magnitude $\dfrac{kq}{2a^2}$, direction $-(\uv x+\uv y)/\sqrt2$.

          Each component is $E_x=E_y=-\dfrac{kq}{a^2}\left(1+\dfrac{1}{2\sqrt2}\right)$, so
          $$|\vb E|=\sqrt2\,\dfrac{kq}{a^2}\left(1+\dfrac{1}{2\sqrt2}\right)=\left(\sqrt2+\tfrac12\right)\dfrac{kq}{a^2}\approx1.914\,\dfrac{q}{4\pi\ep a^2},$$
          pointing along the diagonal away from $B$.

          **What to remember.** Use the mirror symmetry first (here: the field must lie on the diagonal), then add only the components that survive. The near charges dominate: the far one adds only $0.5$ to $\sqrt2\approx1.41$.
        `,
        figs: { s: { svg: figSquare3(true), cap: md`The three fields at $P$ and their sum (the field from $B$ is half as strong and lies on the diagonal).` } },
      }),

      P({
        title: 'Two plus, one minus',
        q: md`Charges $+q$, $+q$ and $-q$ sit at the corners of an equilateral triangle of side $a$. Find the field at the centre $P$ of the triangle: its magnitude in units of $\dfrac{q}{4\pi\ep a^2}$, and its direction.`,
        figHtml: figTriangle(),
        hints: [md`Superposition, with a trick: what is the field at the centre if all three charges were $+q$?`, md`$-q$ at the top equals $+q$ at the top plus $-2q$ at the top.`, md`The distance from a corner to the centre of an equilateral triangle is $a/\sqrt3$.`],
        parts: [
          { lbl: md`$|\vb E|$ in units of $q/(4\pi\ep a^2)$`, ans: 6 },
          { lbl: md`Direction:`, mc: [md`Away from the $-q$ corner`, md`Toward the $-q$ corner`, md`Parallel to the bottom side`, md`Zero, because the three charges sit symmetrically around the centre`], a: 1,
            why: [md`The net effect is a charge $-2q$ at the top corner, and the field of a negative charge points toward it.`, null, md`The configuration is symmetric about the vertical line through the $-q$ corner, so $\vb E$ lies on that line.`, md`The positions are symmetric but the charges are not: three equal charges would cancel, and $-q$ breaks that.`] },
        ],
        sol: md`
          Write the configuration as three $+q$ charges plus an extra $-2q$ at the top corner. Three equal charges at the corners of an equilateral triangle give zero at the centre (rotating by $120^\circ$ leaves them unchanged). So the field is that of $-2q$ at a distance $R=a/\sqrt3$:
          $$|\vb E|=\dfrac{1}{4\pi\ep}\,\dfrac{2q}{R^2}=\dfrac{1}{4\pi\ep}\,\dfrac{2q\cdot3}{a^2}=6\,\dfrac{q}{4\pi\ep a^2},$$
          pointing toward the $-q$ corner.

          [[fig:s]]

          **Check by brute force.** Each charge is $R=a/\sqrt3$ from the centre, so each field has magnitude $kq/R^2=3kq/a^2$. The $-q$ field points up, toward $-q$. Each $+q$ field points away from its bottom corner, at $30^\circ$ above the horizontal; the horizontal parts cancel and each vertical part is $\dfrac{3kq}{a^2}\sin30^\circ$. Total: $\dfrac{3kq}{a^2}+2\cdot\dfrac{3kq}{2a^2}=\dfrac{6kq}{a^2}$, up.
        `,
        figs: { s: { svg: figTriangle(true), cap: md`The net field at the centre points toward the $-q$ corner.` } },
      }),

      P({
        id: 'HW1-2.2', src: 'HW 1 · Griffiths 2.2', title: 'Field above the midpoint of $\\pm q$', big: true,
        q: md`Find the electric field (magnitude and direction) a distance $z$ above the midpoint between equal and opposite charges ($\pm q$), a distance $d$ apart (same as Example 2.1, except that the charge at $x=+d/2$ is $-q$).`,
        figHtml: figPair({ right: '-' }),
        hints: [
          md`Superposition of two point charges, exactly as in Example 2.1. Only the sign of one charge changes, so redo the symmetry argument: which components cancel now?`,
          md`Both charges are a distance $\srm=\sqrt{z^2+d^2/4}$ from $P$, and both fields have magnitude $kq/\srm^2$. The field of $+q$ points away from it (up and to the right); the field of $-q$ points toward it (down and to the right).`,
          md`The $z$ components now cancel and the $x$ components add. Each $x$ component is $\dfrac{kq}{\srm^2}\cdot\dfrac{d/2}{\srm}$.`,
        ],
        parts: [
          { lbl: '|E|', expr: 'q*d/(4*pi*eps0*(z^2+d^2/4)^(3/2))', vars: { q: [1, 3], d: [1, 3], z: [0.5, 3], eps0: [0.5, 2] }, accepts: ['2*q*d/(pi*eps0*(4*z^2+d^2)^(3/2))'] },
          { lbl: md`Direction of $\vb E$ at $P$:`, mc: [md`$+\uv z$ (straight up)`, md`$+\uv x$, parallel to the line from $+q$ toward $-q$`, md`$-\uv x$, from $-q$ toward $+q$`, md`Along the line from $P$ to $-q$`], a: 1,
            why: [md`That is the answer for two equal charges. With opposite charges the vertical components cancel.`, null, md`Check one field: $+q$ at the left pushes $P$ to the right, and $-q$ at the right pulls $P$ to the right too.`, md`That is only the direction of the $-q$ field. Adding the $+q$ field cancels the vertical part.`] },
          { lbl: md`Far away ($z\gg d$) the field falls off as`, mc: [md`$1/z$`, md`$1/z^2$`, md`$1/z^3$`, md`It does not fall off`], a: 2,
            why: [md`$1/z$ is the infinite-line law.`, md`$1/z^2$ is the law for a net charge. Here the net charge is zero, so the leading term cancels.`, null, md`Every finite charge distribution's field goes to zero far away.`] },
        ],
        sol: md`
          **Method.** Superposition of two point charges, with symmetry to decide which components survive.

          Both charges are at distance $\srm=\sqrt{z^2+(d/2)^2}$ from $P$, so both fields have magnitude $\dfrac{1}{4\pi\ep}\dfrac{q}{\srm^2}$.

          [[fig:s]]

          - The $+q$ field points **away** from $+q$: components $\left(+\tfrac{d/2}{\srm},\ +\tfrac{z}{\srm}\right)$ times the magnitude.
          - The $-q$ field points **toward** $-q$: components $\left(+\tfrac{d/2}{\srm},\ -\tfrac{z}{\srm}\right)$ times the magnitude.

          The $z$ components cancel and the $x$ components add:
          $$\vb E=2\cdot\dfrac{1}{4\pi\ep}\dfrac{q}{\srm^2}\cdot\dfrac{d/2}{\srm}\,\uv x=\dfrac{1}{4\pi\ep}\,\dfrac{qd}{\left(z^2+d^2/4\right)^{3/2}}\,\uv x .$$

          Magnitude $\dfrac{1}{4\pi\ep}\dfrac{qd}{(z^2+d^2/4)^{3/2}}$; direction $+\uv x$, parallel to the line from $+q$ to $-q$.

          **Checks.**
          - Units: $qd/z^3$ has the units of $q/z^2$. Good.
          - $z\gg d$: $\vb E\approx\dfrac{1}{4\pi\ep}\dfrac{qd}{z^3}\uv x$. The net charge is zero, so there is no $1/z^2$ term; what is left falls as $1/z^3$. This is the field of a **dipole** with dipole moment $p=qd$ (you will meet it again later in the course).
          - $z=0$: $E=\dfrac{1}{4\pi\ep}\dfrac{8q}{d^2}$, which is $2\times\dfrac{kq}{(d/2)^2}$: at the midpoint both fields point from $+q$ toward $-q$ and add.

          **Compare with Example 2.1.** Flipping one sign swaps which component survives: equal charges give a field along $z$, opposite charges give a field along $x$.
        `,
        figs: { s: { svg: figPair({ right: '-', sol: true }), cap: md`The $+q$ field points away from $+q$, the $-q$ field toward $-q$. Their vertical parts cancel.` } },
      }),

      P({
        id: 'HW1-2.59', src: 'HW 1 · Computational 2.59', title: 'Zeros of the field inside a polygon of charges', big: true,
        q: md`Consider an $n$-sided polygon, inscribed in a circle of radius $a$, with a point charge $q$ at each vertex. The electric field is zero at the center, but there are $n$ other points inside the polygon where the field is zero. Where are these points for $n=4$ and $n=5$?

        [[fig:setup]]`,
        hints: [
          md`Start with symmetry. Reflecting the polygon in a line through the centre and a vertex, or through the centre and the midpoint of an edge, leaves it unchanged. On such a mirror line the field can have no component across the line, so on it you only need to find where the component **along** the line vanishes.`,
          md`Which mirror lines? Near the centre the field points back toward the centre (the centre is a minimum of $V$ in the plane). Near a vertex the field points away from that vertex, toward the centre. At the midpoint of an edge the two nearest charges cancel each other and the rest push **outward**. So along a ray toward an edge midpoint the radial field changes sign: inward near the centre, outward at the edge. That ray contains a zero; the ray toward a vertex does not.`,
          md`Along the ray at angle $\pi/n$ (halfway between the vertices at $0$ and $2\pi/n$), the radial field from vertex $k$ at angle $\varphi_k=2\pi k/n$ is $\dfrac{q}{4\pi\ep}\dfrac{r-a\cos(\varphi_k-\pi/n)}{\left[r^2+a^2-2ar\cos(\varphi_k-\pi/n)\right]^{3/2}}$. Sum over $k$ and find the root between $r=0$ and the edge, $r=a\cos(\pi/n)$, with a bracketing root finder.`,
        ],
        parts: [
          { lbl: md`The $n$ zeros (other than the centre) lie on the lines from the centre toward`, mc: [md`the vertices`, md`the midpoints of the edges`, md`no particular direction; you need a full 2-D search`, md`points outside the polygon`], a: 1,
            why: [md`Along a vertex ray the field points toward the centre all the way out (the nearest charge pushes inward), so it never vanishes there.`, null, md`Symmetry reduces the search to one dimension: zeros must come in a set that is unchanged by the polygon's rotations and reflections.`, md`The problem asks for zeros inside; the ones found lie inside, on the edge-midpoint rays.`] },
          { lbl: md`$n=4$: distance of each zero from the centre, in units of $a$`, ans: 0.5469 },
          { lbl: md`$n=5$: distance of each zero from the centre, in units of $a$`, ans: 0.6889 },
        ],
        sol: md`
          **1. Symmetry.** A regular polygon of equal charges is unchanged by rotations through $2\pi/n$ and by reflections in the $n$ lines through the centre and a vertex and the lines through the centre and an edge midpoint. If $\vb E=0$ at one point, it is zero at all its images under these operations, so the zeros come in sets of $n$. A point on a mirror line has $\vb E$ along that line (the component across it would flip under the reflection). So on a mirror line the 2-D problem becomes a 1-D root search for the radial component $E_r(r)$.

          **2. Which mirror lines.** In the plane the centre is a minimum of $V$ (the field near it points back toward the centre). Going toward a vertex, the field keeps pointing toward the centre: the nearest charge dominates and pushes inward. Going toward the midpoint of an edge, the two charges at the ends of that edge cancel each other at the midpoint and all the others push **outward**. So along the edge-midpoint ray $E_r$ goes from negative (near the centre) to positive (at the edge): it crosses zero. These $n$ crossings are the zeros.

          **3. The function to root-find.** Along the ray at angle $\pi/n$, the vertex $k$ sits at angle $\varphi_k=2\pi k/n$. With $\Delta_k=\varphi_k-\pi/n$,
          $$E_r(r)=\dfrac{q}{4\pi\ep}\sum_{k=0}^{n-1}\dfrac{r-a\cos\Delta_k}{\left(r^2+a^2-2ar\cos\Delta_k\right)^{3/2}} .$$
          (Numerator: the separation vector dotted into the unit vector along the ray. Denominator: the cube of its length, by the law of cosines.)

          [[fig:code]]

          [[fig:plot]]

          **4. Results.**
          - $n=4$: $r_0=0.5469\,a$, on the four lines from the centre to the edge midpoints (at $45^\circ$ to the lines toward the vertices). The edge is at $a\cos45^\circ=0.707\,a$.
          - $n=5$: $r_0=0.6889\,a$, on the five lines from the centre to the edge midpoints. The edge is at $a\cos36^\circ=0.809\,a$.

          [[fig:zeros]]

          **5. What kind of points are these?** Along the ray, $E_r<0$ inside $r_0$ and $E_r>0$ outside, so $V$ has a maximum along the ray at $r_0$. Sideways (toward either neighbouring vertex) $V$ rises. So each zero is a **saddle point** of $V$: a test charge there is in unstable equilibrium. In charge-free space $V$ can never have a true minimum (Earnshaw's theorem, a consequence of Laplace's equation, which comes later in the course).

          **Checks.** For $n=3$ the same code gives $r_0=0.2847\,a$, and for $n=6$, $r_0=0.7728\,a$. As $n$ grows the zeros move out toward the edges, where the two nearest charges dominate.
        `,
        figs: {
          setup: { svg: PF.row([{ svg: figPolygon(4), cap: md`$n=4$` }, { svg: figPolygon(5), cap: md`$n=5$` }]).svg, cap: md`Equal charges $q$ at the vertices of a regular polygon inscribed in a circle of radius $a$.` },
          code: { svg: code(`import numpy as np
from scipy.optimize import brentq

def Er(r, n, a=1.0):
    """radial field (units q/(4 pi eps0 a^2)) at distance r
    along the ray toward an edge midpoint (angle pi/n)"""
    E = 0.0
    for k in range(n):
        D = 2*np.pi*k/n - np.pi/n         # vertex angle minus ray angle
        s2 = r*r + a*a - 2*a*r*np.cos(D)  # law of cosines
        E += (r - a*np.cos(D)) / s2**1.5
    return E

for n in (4, 5):
    edge = np.cos(np.pi/n)                # distance to the edge midpoint
    r0 = brentq(Er, 0.01, 0.999*edge, args=(n,))
    print(n, r0)                          # 4 -> 0.5469, 5 -> 0.6889`), cap: 'Python: the radial field along an edge-midpoint ray and a bracketing root find.' },
          plot: { svg: plotPoly(), cap: md`$E_r$ along the ray toward an edge midpoint. It starts negative (pointing back to the centre) and changes sign at $r_0$; each curve ends at the edge.` },
          zeros: { svg: PF.row([{ svg: figPolygon(4, 0.5469), cap: md`$n=4$: $r_0=0.547\,a$` }, { svg: figPolygon(5, 0.6889), cap: md`$n=5$: $r_0=0.689\,a$` }]).svg, cap: 'The zeros (open circles) on the lines to the edge midpoints, plus the one at the centre.' },
        },
      }),

      RF(md`
        !!key Patterns to remember
          - $\sr=\vb r-\vb r'$ runs from the source to the field point. The field depends on the source and the position, never on the test charge; $\vb F=Q\vb E$.
          - Superpose vectors, not magnitudes. Kill components with symmetry before you compute.
          - Missing-charge trick: a configuration with a charge removed = the full symmetric configuration + a charge of the opposite sign at the empty spot.
          - Zeros of $\vb E$ on a line of two charges: between like charges, outside (on the side of the smaller charge) for unlike charges.
          - Net charge zero means no $1/r^2$ term far away: the field falls faster (a dipole goes as $1/r^3$).
      `),
    ],
  };

  // =====================================================================================
  // Lesson 2 — Continuous charge: lines of charge (Lecture 1 p4–5, Lecture 2 p1–2; Griffiths 2.1.4)
  // =====================================================================================
  const L2 = {
    id: 'u1-line', title: 'Continuous charge: lines of charge',
    steps: [
      RF(md`
        Real charge is spread out. Chop it into small pieces $dq$, treat each piece as a point charge, and add the fields with an integral:

        $$\vb E(\vb r)=\kq\int\dfrac{dq}{\srm^2}\,\srh,\qquad \sr=\vb r-\vb r'\ \text{ runs from the piece } dq \text{ to the field point.}$$

        [[fig:dq]]

        | distribution | density | piece | units of the density |
        |---|---|---|---|
        | line | $\lambda$ | $dq=\lambda\,dl'$ | C/m |
        | surface | $\sigma$ | $dq=\sigma\,da'$ | C/m² |
        | volume | $\rho$ | $dq=\rho\,d\tau'$ | C/m³ |

        The primes mark **source** coordinates: you integrate over where the charge is, with the field point $\vb r$ held fixed. Each of these integrals is a vector sum. (The notes write the left side as $E(\vb r)$ without the arrow; it is $\vb E(\vb r)$.)

        !!trap The unit vector cannot come out of the integral
          $\srh$ points from each piece to $P$, so its direction changes from piece to piece. Write it in Cartesian components ($\uv x,\uv y,\uv z$ are constant and do come out) and integrate each component separately, even when you use polar coordinates to do the integral.
      `, { dq: { svg: figDq(), cap: md`Each piece $dq$ is a point charge with its own separation vector to $P$.` } }),

      Q(md`A thin ring of radius $R$ carries a uniform line charge $\lambda$. Using the angle $\varphi'$ around the ring, what is the charge of a small piece of the ring?`,
        [md`$\lambda\,d\varphi'$`, md`$\lambda R^2\,d\varphi'$`, md`$2\pi R\lambda$`, md`$\lambda R\,d\varphi'$`], 3,
        [md`$d\varphi'$ is an angle, not a length. $\lambda$ is charge per length, so you need the arc length $dl'=R\,d\varphi'$.`,
          md`$R^2\,d\varphi'$ has units of area. The piece of a line has length $R\,d\varphi'$.`,
          md`That is the total charge of the ring, the integral of the piece from $0$ to $2\pi$.`, null],
        md`$dq=\lambda\,dl'$ with arc length $dl'=R\,d\varphi'$, so $dq=\lambda R\,d\varphi'$. Integrating $\varphi'$ from $0$ to $2\pi$ gives the total $2\pi R\lambda$.`,
        { figHtml: figRing() }),

      Q(md`A flat disk carries surface charge $\sigma$. In polar coordinates $(r',\varphi')$ on the disk, what is $dq$?`,
        [md`$\sigma\,dr'\,d\varphi'$`, md`$\sigma\,r'^2\,dr'\,d\varphi'$`, md`$\sigma\,r'\,dr'\,d\varphi'$`, md`$\sigma\,\pi r'^2\,d\varphi'$`], 2,
        [md`$dr'\,d\varphi'$ has units of length, not area. The polar area element is $r'\,dr'\,d\varphi'$.`,
          md`That is the spherical-volume pattern ($r^2$), not the flat polar area element.`, null,
          md`$\pi r'^2$ is the area of a whole disk of radius $r'$, not of a small patch.`],
        md`The polar area element is $da'=r'\,dr'\,d\varphi'$ (a patch $dr'$ wide and $r'\,d\varphi'$ long), so $dq=\sigma r'\,dr'\,d\varphi'$. Integrating over $\varphi'$ first gives a ring of charge $\sigma\,2\pi r'\,dr'$, which you will use for the disk.`,
        { figHtml: figDisk() }),

      Q(md`Why can't you pull $\srh$ out of $\displaystyle\int\dfrac{dq}{\srm^2}\srh$ the way you pull out constants?`,
        [md`Its length is $1$, but its direction changes from one piece $dq$ to the next.`, md`It depends on the field point $\vb r$, which varies in the integral.`, md`It is undefined at the source point.`, md`You can: it has length $1$ everywhere.`], 0,
        [null,
          md`The field point is held fixed during the integral. What varies is the source point $\vb r'$.`,
          md`The field point is not on the charge here. The problem is the changing direction.`,
          md`Length $1$ is not enough. A vector is constant only if its direction is constant too.`],
        md`The integral runs over source points $\vb r'$ with $\vb r$ fixed. Each piece sees $P$ along a different line, so $\srh$ points in different directions for different pieces. Resolve into Cartesian components, whose unit vectors are constant, and integrate each.`,
        { figHtml: figSegBis('theory') }),

      RF(md`
        !!method Setting up a field integral
          1. **Draw $dq$** at a general source point and write it ($\lambda\,dx$, $\lambda R\,d\varphi$, $\sigma\,2\pi r'dr'$, ...).
          2. **Draw $\sr$** from $dq$ to $P$. Write its length $\srm$ in terms of the integration variable.
          3. **Use symmetry** to decide which components cancel. Pair pieces that mirror each other.
          4. **Write the surviving component** with the right cosine (often $\cos\theta=z/\srm$).
          5. **Integrate** and **check limits**: far away it must look like a point charge with the total charge; close to a big object it must look like the infinite version.

        ### The lecture example: a finite line segment
        A segment from $x=-L$ to $x=L$ carries uniform $\lambda$. Find $\vb E$ at height $z$ above its midpoint. Before integrating, the professor asked three questions. Answer them first.

        [[fig:setup]]
      `, { setup: { svg: figSegBis(), cap: md`Segment of length $2L$ with uniform $\lambda$; field point $P$ on the perpendicular bisector.` } }),

      Q(md`In-class question: in which direction does the total field at $P$ point?`,
        [md`$+\uv x$`, md`Along $\sr$ from the nearest end`, md`It has no definite direction until you integrate`, md`$+\uv z$`], 3,
        [md`For every piece at $+x$ there is a piece at $-x$ whose $x$ component is opposite. They cancel.`,
          md`Every piece contributes, not only the ends, and the pieces on the two sides balance.`,
          md`Symmetry fixes the direction before any integral.`, null],
        md`Pair the piece at $x$ with the piece at $-x$. Same distance, mirror-image directions: their $x$ components cancel and their $z$ components add. The total points along $+\uv z$ (for $\lambda>0$). The notes: “$x$ component is 0 by symmetry”.`,
        { figHtml: figSegBis() }),

      Q(md`In-class question: what do you expect when $z\gg L$?`,
        [md`$\vb E\approx\kq\,\dfrac{\lambda L}{z^2}\,\uv z$`, md`$\vb E\approx\kq\,\dfrac{2\lambda L}{z^2}\,\uv z$`, md`$\vb E\approx\kq\,\dfrac{2\lambda}{z}\,\uv z$`, md`$\vb E\approx0$`], 1,
        [md`The segment has length $2L$, so its total charge is $2\lambda L$.`, null,
          md`That is the infinite-wire limit, which applies close to the line ($L\gg z$).`,
          md`It goes to zero only as $1/z^2$. The leading behaviour is that of the total charge.`],
        md`From far away any finite object looks like a point charge equal to its total charge. Here $q=2\lambda L$, so $\vb E\approx\kq\dfrac{2\lambda L}{z^2}\uv z$.`,
        { figHtml: figSegBis() }),

      Q(md`And for $L\gg z$ (very close to a long segment)?`,
        [md`$\kq\,\dfrac{2\lambda L}{z^2}\,\uv z$`, md`$\kq\,\dfrac{\lambda}{z^2}\,\uv z$`, md`$\kq\,\dfrac{2\lambda}{z}\,\uv z$`, md`$\dfrac{\lambda}{2\ep}\,\uv z$`], 2,
        [md`That is the far limit. Close to the segment, the far ends hardly matter and $L$ must drop out.`,
          md`Units: $\lambda/z^2$ has the units of $\sigma$, not of a field times $4\pi\ep$. A line field must go as $\lambda/z$.`,
          null,
          md`$\lambda/2\ep$ has the wrong units (it would need $\sigma$). That is the shape of the sheet answer.`],
        md`Close to a long segment you cannot see its ends, so it looks infinite and $L$ drops out: $\vb E\approx\kq\dfrac{2\lambda}{z}\uv z=\dfrac{\lambda}{2\pi\ep z}\uv z$, the field of an infinite straight wire. (The notes write both limits as $\vb E=$ a scalar; multiply by $\uv z$.)`,
        { figHtml: figSegBis() }),

      RF(md`
        ### The integral
        Take the piece $dq=\lambda\,dx$ at $x$ and its partner at $-x$:

        [[fig:th]]

        $$d\vb E=2\cdot\kq\,\dfrac{\lambda\,dx}{\srm^2}\cos\theta\;\uv z,\qquad \cos\theta=\dfrac{z}{\srm}=\dfrac{z}{\sqrt{x^2+z^2}} .$$

        The factor $2$ counts the two partners, so $x$ runs only from $0$ to $L$:

        $$\vb E=\dfrac{2\lambda z}{4\pi\ep}\int_0^L\dfrac{dx}{(x^2+z^2)^{3/2}}\;\uv z .$$

        Substitute $x=z\tan\theta$, $dx=z\sec^2\theta\,d\theta$, $x^2+z^2=z^2\sec^2\theta$:

        $$\int\dfrac{dx}{(x^2+z^2)^{3/2}}=\int\dfrac{z\sec^2\theta\,d\theta}{z^3\sec^3\theta}=\dfrac{1}{z^2}\int\cos\theta\,d\theta=\dfrac{\sin\theta}{z^2}=\dfrac{x}{z^2\sqrt{x^2+z^2}} .$$

        The limits: $x=0$ is $\theta=0$, and $x=L$ is $\sin\theta=L/\sqrt{L^2+z^2}$. So the integral is $\dfrac{L}{z^2\sqrt{L^2+z^2}}$ and

        $$\boxed{\ \vb E=\kq\,\dfrac{2\lambda L}{z\sqrt{z^2+L^2}}\;\uv z\ }$$

        The substitution angle is exactly the angle $\theta$ in the figure ($\tan\theta=x/z$): you are integrating over the angle at which $P$ sees each piece.

        **Checks.** For $z\gg L$, $\sqrt{z^2+L^2}\to z$ and $E\to\kq\dfrac{2\lambda L}{z^2}$, a point charge $2\lambda L$. For $L\gg z$, $\sqrt{z^2+L^2}\to L$ and $E\to\kq\dfrac{2\lambda}{z}$, the infinite wire.

        [[fig:plot]]
      `, { th: { svg: figSegBis('theory'), cap: md`The pieces at $\pm x$ give $d\vb E$ arrows that are mirror images; only their $z$ parts survive.` },
        plot: { svg: plotLineSeg(), cap: md`The segment field (solid) follows the infinite wire ($2/z$, dashed) close in and the point charge $2\lambda L$ ($2/z^2$, thin) far away.` } }),

      Q(md`At the height $z=L$ above the midpoint, what fraction of the infinite-wire field ($\lambda/2\pi\ep z$) does the segment produce?`,
        [md`$1/2$`, md`$1/4$`, md`$1$`, md`$1/\sqrt2$`], 3,
        [md`The ratio is $L/\sqrt{z^2+L^2}$, which at $z=L$ is $1/\sqrt2$, not $1/2$.`, md`That would be a $1/z^2$ comparison. The ratio is $L/\sqrt{z^2+L^2}$.`, md`Equal only in the limit $L\gg z$. A finite segment always gives less.`, null],
        md`Divide: $\dfrac{2\lambda L/(z\sqrt{z^2+L^2})}{2\lambda/z}=\dfrac{L}{\sqrt{z^2+L^2}}$. At $z=L$ that is $1/\sqrt2\approx0.71$. The segment from $-L$ to $L$ subtends $\pm45^\circ$ at $P$, so it captures a fraction $\sin45^\circ$ of what an infinite line would.`,
        { figHtml: figSegBis() }),

      Q(md`The field of a point charge falls as $1/z^2$, but the field of an infinite line falls only as $1/z$. Why?`,
        [md`As you move away, more of the line is at a comparable distance and contributes, which partly makes up for the $1/\srm^2$ of each piece.`, md`The line carries more charge than a point charge.`, md`Coulomb's law is different for line charges.`, md`Because the field lines of a line charge are parallel.`], 0,
        [null,
          md`Total charge is not the issue: a segment with the same charge still falls as $1/z^2$ far away. What matters is how much of the charge is about as close as $z$.`,
          md`Every piece obeys the same $1/\srm^2$ law. The $1/z$ comes from adding the pieces.`,
          md`The field lines of a line charge spread out radially in the plane perpendicular to the line. They spread in two dimensions instead of three, which is the Gauss's-law version of the same answer.`],
        md`At distance $z$, roughly a length $\sim z$ of the line is within distance $\sim z$ of you. That length carries charge $\sim\lambda z$, and its field is $\sim\lambda z/z^2=\lambda/z$. The farther you go, the more charge “comes into view”. You will see the same answer from Gauss's law: lines spreading over a cylinder of area $2\pi z L$ instead of a sphere.`,
        { figHtml: plotLineSeg() }),

      Q(md`The integral $\displaystyle\int\dfrac{dx}{(x^2+z^2)^{3/2}}$ shows up whenever a straight line of charge is involved. Which substitution turns it into an elementary integral?`,
        [md`$x=z\sin\theta$`, md`$u=x^2+z^2$`, md`$x=z\cosh\theta$`, md`$x=z\tan\theta$`], 3,
        [md`With $x=z\sin\theta$ you get $z^2(\sin^2\theta+1)$, which does not simplify.`,
          md`That works for $\int x\,dx/(x^2+z^2)^{3/2}$ (the other component), but here there is no factor $x$ to make $du$.`,
          md`$\cosh^2-1=\sinh^2$ would need $x^2-z^2$. Here the sign is $+$.`, null],
        md`$x=z\tan\theta$ uses $1+\tan^2\theta=\sec^2\theta$, so $(x^2+z^2)^{3/2}=z^3\sec^3\theta$ and $dx=z\sec^2\theta\,d\theta$; the integrand becomes $\cos\theta/z^2$. Keep the companion in mind: $\displaystyle\int\dfrac{x\,dx}{(x^2+z^2)^{3/2}}=-\dfrac{1}{\sqrt{x^2+z^2}}$ by $u=x^2+z^2$.`,
        { nofig: 'integration technique only' }),

      Q(md`Which of these could be the field of a line charge $\lambda$ at distance $z$ from it? (Use units only.)`,
        [md`$\dfrac{\lambda}{4\pi\ep z^2}$`, md`$\dfrac{\lambda}{2\pi\ep z}$`, md`$\dfrac{\lambda z}{4\pi\ep}$`, md`$\dfrac{\lambda}{2\ep}$`], 1,
        [md`$\dfrac{q}{4\pi\ep z^2}$ is a field; with $\lambda=q/\text{length}$ in place of $q$ this is a field divided by a length.`, null, md`That is a field times a length squared.`, md`$\sigma/2\ep$ is a field; $\lambda/2\ep$ is a field times a length.`],
        md`$\dfrac{q}{4\pi\ep z^2}$ is a field, so $\dfrac{\lambda}{4\pi\ep}$ is a field times a length, and a line-charge field must be $\dfrac{\lambda}{4\pi\ep}\times\dfrac{1}{\text{length}}$. Only $\dfrac{\lambda}{2\pi\ep z}$ qualifies. Likewise a surface-charge field is $\sigma/\ep$ times a pure number. A units check like this catches most slips in a final answer.`,
        { nofig: 'units only' }),

      P({
        title: 'On the axis of a rod',
        q: md`A rod of length $L$ on the $x$ axis, from $x=0$ to $x=L$, carries a uniform line charge $\lambda$. Find the field at the point $P$ on the axis a distance $d$ beyond the end at $x=L$.`,
        figHtml: figRodAxis(),
        hints: [md`Every piece of the rod lies on the line through $P$, so every $d\vb E$ points the same way, along $+\uv x$. Nothing cancels and there is no cosine.`, md`A piece $\lambda\,dx$ at position $x$ is a distance $L+d-x$ from $P$.`, md`$\displaystyle\int_0^L\dfrac{dx}{(L+d-x)^2}=\Big[\dfrac{1}{L+d-x}\Big]_0^L$.`],
        parts: [
          { lbl: 'E_x', expr: 'lambda*L/(4*pi*eps0*d*(d+L))', vars: { lambda: [1, 3], L: [1, 3], d: [0.5, 3], eps0: [0.5, 2] }, accepts: ['(lambda/(4*pi*eps0))*(1/d - 1/(L+d))'] },
          { lbl: md`For $d\gg L$ the result becomes`, mc: [md`$\kq\,\dfrac{\lambda}{d}$`, md`$\kq\,\dfrac{\lambda L}{d^2}$`, md`$\kq\,\dfrac{\lambda L^2}{d^3}$`, md`$\kq\,\dfrac{2\lambda}{d}$`], a: 1,
            why: [md`A $1/d$ field belongs to an infinite line. From far away a finite rod is a point.`, null, md`That is the falloff of an object with zero net charge. This rod has charge $\lambda L$.`, md`That is the infinite-wire field at distance $d$; here $P$ is on the axis of a short rod.`] },
        ],
        sol: md`
          **Method.** All pieces lie on the line through $P$, so all the $d\vb E$ point along $+\uv x$ (away from the positive rod). Add magnitudes directly; no symmetry cancellation is needed.

          [[fig:s]]

          A piece $dq=\lambda\,dx$ at $x$ is a distance $\srm=L+d-x$ from $P$:
          $$E_x=\kq\int_0^L\dfrac{\lambda\,dx}{(L+d-x)^2}=\kq\,\lambda\Big[\dfrac{1}{L+d-x}\Big]_0^L=\kq\,\lambda\left(\dfrac1d-\dfrac{1}{L+d}\right)=\kq\,\dfrac{\lambda L}{d(d+L)} .$$

          **Checks.** For $d\gg L$: $E_x\to\kq\dfrac{\lambda L}{d^2}$, a point charge $\lambda L$. For $d\to0$ the field blows up as $1/d$: you are touching the end of the rod.
        `,
        figs: { s: { svg: figRodAxis(true), cap: md`A piece $dq$ at $x$ is $L+d-x$ from $P$; every piece pushes $P$ along $+x$.` } },
      }),

      P({
        title: 'Centre of a semicircle',
        q: md`A thin wire bent into a semicircle of radius $R$ carries a uniform line charge $\lambda$. Find the field at the centre $P$ of the circle: magnitude and direction.`,
        figHtml: figArc('semi'),
        hints: [md`Every piece is the same distance $R$ from $P$. Use the angle $\phi$ around the arc as the variable: $dq=\lambda R\,d\phi$.`, md`Symmetry about the vertical line through the middle of the arc: the horizontal components cancel.`, md`A piece at angle $\phi$ gives a vertical component $-\kq\dfrac{\lambda R\,d\phi}{R^2}\sin\phi$ (pointing down, away from the arc). Integrate $\phi$ from $0$ to $\pi$.`],
        parts: [
          { lbl: '|E|', expr: 'lambda/(2*pi*eps0*R)', vars: { lambda: [1, 3], R: [0.5, 3], eps0: [0.5, 2] }, accepts: ['2*lambda/(4*pi*eps0*R)'] },
          { lbl: md`Direction (for $\lambda>0$):`, mc: [md`Along the symmetry axis, away from the arc`, md`Along the symmetry axis, toward the arc`, md`Along the diameter (the dashed line)`, md`There is no field: the arc surrounds $P$`], a: 0,
            why: [null, md`A positive piece pushes $P$ away from itself, so the sum points away from the arc.`, md`The components along the diameter cancel in mirror pairs ($\phi$ and $\pi-\phi$).`, md`The arc covers only half the circle. A full ring would give zero at its centre; a half ring does not.`] },
        ],
        sol: md`
          **Setup.** Put $P$ at the origin with the arc in the upper half plane. A piece at angle $\phi$ has $dq=\lambda R\,d\phi$ and sits at distance $R$. Its field at $P$ points away from the piece, along $-(\cos\phi,\sin\phi)$:

          [[fig:s]]

          $$d\vb E=\kq\,\dfrac{\lambda R\,d\phi}{R^2}\,(-\cos\phi\,\uv x-\sin\phi\,\uv y).$$

          The $x$ parts cancel ($\int_0^\pi\cos\phi\,d\phi=0$, mirror pairs $\phi$ and $\pi-\phi$). The $y$ part:
          $$E_y=-\kq\,\dfrac{\lambda}{R}\int_0^\pi\sin\phi\,d\phi=-\kq\,\dfrac{2\lambda}{R}=-\dfrac{\lambda}{2\pi\ep R}.$$

          So $|\vb E|=\dfrac{\lambda}{2\pi\ep R}$, pointing along the symmetry axis away from the arc.

          **Worth noticing.** This is exactly the field of an infinite straight line at distance $R$. (A half circle seen from its centre subtends the same angle, $180^\circ$, as an infinite line seen from a distance $R$, and each piece's contribution depends only on the angle it subtends.) A full ring would give zero at its centre.
        `,
        figs: { s: { svg: figArc('semi', true), cap: md`A piece at angle $\phi$ and its field at $P$; the sum points straight down, away from the arc.` } },
      }),

      P({
        title: 'Centre of a quarter circle',
        q: md`Same idea with a quarter circle: a wire bent into a quarter of a circle of radius $R$ (from the $+x$ axis to the $+y$ axis) carries uniform $\lambda$. Find the magnitude and direction of $\vb E$ at the centre.`,
        figHtml: figArc('quarter'),
        hints: [md`No cancellation this time: both components survive. Integrate $\phi$ from $0$ to $\pi/2$.`, md`$E_x=-\kq\dfrac{\lambda}{R}\int_0^{\pi/2}\cos\phi\,d\phi$ and $E_y=-\kq\dfrac{\lambda}{R}\int_0^{\pi/2}\sin\phi\,d\phi$.`],
        parts: [
          { lbl: '|E|', expr: 'sqrt(2)*lambda/(4*pi*eps0*R)', vars: { lambda: [1, 3], R: [0.5, 3], eps0: [0.5, 2] } },
          { lbl: md`Direction:`, mc: [md`Along $+\uv x$`, md`Along $-\uv y$`, md`Toward the middle of the arc, at $45^\circ$`, md`Away from the middle of the arc, at $45^\circ$ below the $-x$ axis`], a: 3,
            why: [md`Every piece pushes $P$ away from itself, and all pieces are in the first quadrant, so the field points into the third quadrant.`, md`Both components are equal by the mirror symmetry about the $45^\circ$ line.`, md`For positive charge the field points away from the charge.`, null] },
        ],
        sol: md`
          Both integrals give $1$: $\int_0^{\pi/2}\cos\phi\,d\phi=\int_0^{\pi/2}\sin\phi\,d\phi=1$. So
          $$E_x=E_y=-\kq\dfrac{\lambda}{R},\qquad |\vb E|=\sqrt2\,\kq\,\dfrac{\lambda}{R},$$
          pointing at $45^\circ$ into the third quadrant, away from the midpoint of the arc.

          [[fig:s]]

          **Check with symmetry.** The arc is symmetric about the $45^\circ$ line, so $\vb E$ must lie on that line: $E_x=E_y$. Good.
        `,
        figs: { s: { svg: figArc('quarter', true), cap: md`A piece of the arc and its field; the total points away from the arc at $45^\circ$.` } },
      }),

      P({
        id: 'D1-2.3', src: 'Discussion 1 · Griffiths 2.3', title: 'Above one end of a segment', big: true,
        q: md`Find the electric field a distance $z$ above one end of a straight line segment of length $L$ (Fig. 2.7) that carries a uniform line charge $\lambda$. Check that your formula is consistent with what you would expect for the case $z\gg L$.

        Use axes with the segment from $x=0$ to $x=L$ and $P$ at height $z$ above $x=0$.`,
        figHtml: figSegEnd(),
        hints: [
          md`Same method as the lecture example, but there is no partner piece to cancel the $x$ component. Both components survive, so you need two integrals.`,
          md`A piece $\lambda\,dx$ at $x$: $\sr=-x\,\uv x+z\,\uv z$, $\srm=\sqrt{x^2+z^2}$. So $dE_x=-\kq\dfrac{\lambda x\,dx}{(x^2+z^2)^{3/2}}$ and $dE_z=\kq\dfrac{\lambda z\,dx}{(x^2+z^2)^{3/2}}$.`,
          md`$\displaystyle\int_0^L\dfrac{dx}{(x^2+z^2)^{3/2}}=\dfrac{L}{z^2\sqrt{z^2+L^2}}$ (substitute $x=z\tan\theta$), and $\displaystyle\int_0^L\dfrac{x\,dx}{(x^2+z^2)^{3/2}}=\dfrac1z-\dfrac{1}{\sqrt{z^2+L^2}}$ (substitute $u=x^2+z^2$).`,
        ],
        parts: [
          { lbl: 'E_z', expr: 'lambda*L/(4*pi*eps0*z*sqrt(z^2+L^2))', vars: { lambda: [1, 3], L: [0.5, 3], z: [0.5, 3], eps0: [0.5, 2] } },
          { lbl: 'E_x', expr: '(lambda/(4*pi*eps0))*(1/sqrt(z^2+L^2) - 1/z)', vars: { lambda: [1, 3], L: [0.5, 3], z: [0.5, 3], eps0: [0.5, 2] }, accepts: ['-(lambda/(4*pi*eps0*z))*(1 - z/sqrt(z^2+L^2))'] },
          { lbl: md`For $z\gg L$:`, mc: [md`$E_x$ and $E_z$ both fall as $1/z^2$ and stay comparable`, md`$\vb E\to0$ faster than $1/z^2$`, md`$E_z\to\kq\dfrac{\lambda L}{z^2}$ and $E_x$ becomes negligible (it falls as $1/z^3$)`, md`$E_z\to\kq\dfrac{2\lambda L}{z^2}$`], a: 2,
            why: [md`Expand: $E_x\approx-\kq\dfrac{\lambda L^2}{2z^3}$, smaller than $E_z$ by a factor $L/2z$.`, md`The segment carries net charge $\lambda L$, so the field falls as $1/z^2$, not faster.`, null, md`That is the far field of the length-$2L$ segment. This one has length $L$ and charge $\lambda L$.`] },
        ],
        sol: md`
          **Setup.** Segment from $x=0$ to $x=L$; $P=(0,0,z)$. A piece $dq=\lambda\,dx$ at $(x,0,0)$:
          $$\sr=-x\,\uv x+z\,\uv z,\qquad \srm=\sqrt{x^2+z^2},\qquad d\vb E=\kq\,\dfrac{\lambda\,dx}{(x^2+z^2)^{3/2}}\left(-x\,\uv x+z\,\uv z\right).$$

          [[fig:s]]

          No piece has a mirror partner, so both components survive. ($\theta$ in the figure is the angle at which $P$ sees the piece, $\tan\theta=x/z$: $dE_z=dE\cos\theta$ and $dE_x=-dE\sin\theta$.)

          **$z$ component** (substitute $x=z\tan\theta$, as in lecture):
          $$E_z=\kq\,\lambda z\int_0^L\dfrac{dx}{(x^2+z^2)^{3/2}}=\kq\,\lambda z\cdot\dfrac{L}{z^2\sqrt{z^2+L^2}}=\kq\,\dfrac{\lambda L}{z\sqrt{z^2+L^2}} .$$

          **$x$ component** (substitute $u=x^2+z^2$):
          $$E_x=-\kq\,\lambda\int_0^L\dfrac{x\,dx}{(x^2+z^2)^{3/2}}=-\kq\,\lambda\Big[-\dfrac{1}{\sqrt{x^2+z^2}}\Big]_0^L=\kq\,\lambda\left(\dfrac{1}{\sqrt{z^2+L^2}}-\dfrac1z\right).$$

          $E_x<0$: the field leans away from the segment, toward $-x$. Together:
          $$\vb E=\kq\,\dfrac{\lambda}{z}\left[\left(\dfrac{z}{\sqrt{z^2+L^2}}-1\right)\uv x+\dfrac{L}{\sqrt{z^2+L^2}}\,\uv z\right].$$

          **Check $z\gg L$.** $\dfrac{1}{\sqrt{z^2+L^2}}=\dfrac1z\left(1+\dfrac{L^2}{z^2}\right)^{-1/2}\approx\dfrac1z\left(1-\dfrac{L^2}{2z^2}\right)$. Then $E_z\approx\kq\dfrac{\lambda L}{z^2}$, a point charge $q=\lambda L$, and $E_x\approx-\kq\dfrac{\lambda L^2}{2z^3}$, smaller by $L/2z$. From far away you see a point charge, as you should.

          **Second check.** Two of these segments back to back make the lecture's segment from $-L$ to $L$. Their $x$ parts cancel and their $z$ parts add to $\kq\dfrac{2\lambda L}{z\sqrt{z^2+L^2}}$, the lecture result.
        `,
        figs: { s: { svg: figSegEnd(true), cap: md`The field of a piece at $x$ leans up and away from the segment; both components survive.` } },
      }),

      RF(md`
        !!key Patterns to remember
          - $dq=\lambda\,dl'$, $\sigma\,da'$, $\rho\,d\tau'$. Arc: $dl'=R\,d\varphi'$. Polar patch: $da'=r'\,dr'\,d\varphi'$.
          - Draw $dq$, draw $\sr$ from $dq$ to $P$, kill components by symmetry, keep the survivor with its cosine, integrate in components.
          - $\displaystyle\int\dfrac{dx}{(x^2+z^2)^{3/2}}=\dfrac{x}{z^2\sqrt{x^2+z^2}}$ (via $x=z\tan\theta$) and $\displaystyle\int\dfrac{x\,dx}{(x^2+z^2)^{3/2}}=-\dfrac{1}{\sqrt{x^2+z^2}}$.
          - Segment from $-L$ to $L$, on the bisector: $\kq\dfrac{2\lambda L}{z\sqrt{z^2+L^2}}$. Far: point charge $2\lambda L$. Close: infinite wire $\dfrac{\lambda}{2\pi\ep z}$.
          - Check every answer in two limits: far away (total charge, $1/r^2$) and close to a large object (its infinite version).
      `),
    ],
  };

  // =====================================================================================
  // Lesson 3 — Rings and disks (Griffiths Probs. 2.5, 2.6)
  // =====================================================================================
  const L3 = {
    id: 'u1-ring-disk', title: 'Rings and disks',
    steps: [
      RF(md`
        ### Rings: every piece is the same distance away
        Take a ring of radius $r$ and a field point $P$ on its axis, a height $z$ above the centre. Every piece $dq$ of the ring is the same distance $\srm=\sqrt{r^2+z^2}$ from $P$, and every separation vector makes the same angle $\theta$ with the axis.

        [[fig:ring]]

        Two consequences, and they are the whole calculation:
        - The components perpendicular to the axis cancel: the piece on the opposite side of the ring has the mirror-image field.
        - The component along the axis is the same for every piece, $dE_z=\kq\dfrac{dq}{\srm^2}\cos\theta$ with $\cos\theta=z/\srm$. Since $\srm$ and $\theta$ do not change around the ring, $\int dE_z$ just adds up the charge: $\int dq$ = total charge of the ring.

        So on the axis of a ring there is nothing to integrate except the charge itself. This is why rings are the building blocks for disks, cylinders and spheres.
      `, { ring: { svg: figRing(), cap: md`Ring of radius $r$ with line charge $\lambda$; $P$ on the axis at height $z$.` } }),

      Q(md`What is the field at the centre of a uniformly charged ring ($z=0$)?`,
        [md`$\kq\,\dfrac{2\pi r\lambda}{r^2}$, along the axis`, md`Zero`, md`$\dfrac{\lambda}{2\pi\ep r}$, in the plane of the ring`, md`Infinite, because you are inside the charge`], 1,
        [md`At $z=0$ each separation vector lies in the plane of the ring ($\cos\theta=0$): there is no axial part, and the in-plane parts cancel in opposite pairs.`,
          null,
          md`That is the field at the centre of a half ring. With the full ring every piece has an opposite partner.`,
          md`The centre is a distance $r$ from every piece; nothing blows up.`],
        md`Each piece pushes the centre directly away from itself; the piece on the opposite side pushes with equal strength the other way. Everything cancels: $\vb E=0$ at the centre. On the axis formula this shows up as the factor $\cos\theta=z/\srm=0$.`,
        { figHtml: figRing() }),

      Q(md`For $P$ on the axis of the ring, which statement is right?`,
        [md`Only $E_z$ survives, and every piece contributes the same amount to it`, md`$E_z$ and the radial component both survive`, md`Only the pieces nearest $P$ contribute`, md`The field is along $\sr$ from the nearest piece`], 0,
        [null, md`The radial parts of opposite pieces cancel exactly.`, md`All pieces are equally near: every one is $\sqrt{r^2+z^2}$ away.`, md`No piece is nearest; the field is along the axis.`],
        md`Same distance and same angle for every piece, so the axial parts are identical and the perpendicular parts cancel in opposite pairs. $E_z=\kq\dfrac{\cos\theta}{\srm^2}\times(\text{total charge})$.`,
        { figHtml: figRing() }),

      P({
        id: 'HW1-2.5', src: 'HW 1 · Griffiths 2.5', title: 'Field on the axis of a ring', big: true,
        q: md`Find the electric field a distance $z$ above the center of a circular loop of radius $r$ (Fig. 2.9) that carries a uniform line charge $\lambda$.`,
        figHtml: figRing(),
        hints: [
          md`Coulomb integral for a line charge. Symmetry first: on the axis, which components survive?`,
          md`Every piece is $\srm=\sqrt{r^2+z^2}$ from $P$, and $\cos\theta=z/\srm$ is the same for every piece.`,
          md`$E_z=\kq\dfrac{z}{\srm^3}\int dq$, and $\int dq=\lambda\cdot2\pi r$.`,
        ],
        parts: [
          { lbl: 'E_z', expr: 'lambda*r*z/(2*eps0*(r^2+z^2)^(3/2))', vars: { lambda: [1, 3], r: [0.5, 3], z: [0.2, 3], eps0: [0.5, 2] }, accepts: ['(1/(4*pi*eps0))*2*pi*r*lambda*z/(r^2+z^2)^(3/2)'] },
          { lbl: md`Direction of $\vb E$ (for $\lambda>0$, $z>0$):`, mc: [md`$+\uv z$, along the axis away from the ring`, md`Radially outward in the plane of the ring`, md`$-\uv z$, toward the ring`, md`Along $\sr$ from the nearest piece`], a: 0,
            why: [null, md`On the axis the radial parts of opposite pieces cancel.`, md`A positive ring pushes $P$ away from itself.`, md`There is no nearest piece; all are at the same distance.`] },
        ],
        sol: md`
          **Method.** Coulomb integral over the ring, with symmetry doing most of the work.

          [[fig:s]]

          A piece $dq=\lambda\,dl=\lambda r\,d\varphi'$ is a distance $\srm=\sqrt{r^2+z^2}$ from $P$. Its field has magnitude $\kq\dfrac{dq}{\srm^2}$. The component perpendicular to the axis cancels against the piece on the opposite side. The axial component is the magnitude times $\cos\theta=z/\srm$, the same for every piece:
          $$E_z=\kq\,\dfrac{z}{\srm^3}\int dq=\kq\,\dfrac{z}{(r^2+z^2)^{3/2}}\,(2\pi r\lambda) .$$
          $$\vb E=\kq\,\dfrac{2\pi r\lambda\,z}{(r^2+z^2)^{3/2}}\;\uv z=\dfrac{\lambda\,r\,z}{2\ep\,(r^2+z^2)^{3/2}}\;\uv z .$$

          **Checks.**
          - $z\gg r$: $E\to\kq\dfrac{2\pi r\lambda}{z^2}$, a point charge $Q=2\pi r\lambda$.
          - $z=0$: $E=0$ at the centre.
          - $z<0$: $E_z$ changes sign, so the field points away from the ring on both sides.

          Since $E=0$ at the centre and $E\to0$ far away, there is a maximum in between. Setting $dE_z/dz=0$: $(r^2+z^2)-3z^2=0$, so $z=r/\sqrt2$.

          [[fig:p]]
        `,
        figs: { s: { svg: figRing(true), cap: md`A piece $dq$, its separation vector and its $d\vb E$; the piece opposite gives the mirror image (dashed). Only the axial parts add.` },
          p: { svg: plotRing(), cap: md`$E_z$ along the axis of a ring of charge $Q$: zero at the centre, largest at $z=r/\sqrt2$, then a point-charge falloff.` } },
      }),

      Q(md`A ring of total charge $Q$ and radius $r$: how far along the axis is the field largest?`,
        [md`At the centre`, md`At $z=r$`, md`It keeps growing as $z\to0$`, md`At $z=r/\sqrt2$`], 3,
        [md`At the centre the field is zero.`, md`Close, but $dE_z/dz=0$ gives $r^2+z^2=3z^2$, i.e. $z=r/\sqrt2\approx0.71r$.`, md`It goes to zero at the centre, not to infinity: the charge is a distance $r$ away from every axial point.`, null],
        md`$E_z\propto z/(r^2+z^2)^{3/2}$ vanishes at $z=0$ and at $z\to\infty$. Differentiate: $(r^2+z^2)^{3/2}-3z^2(r^2+z^2)^{1/2}=0$, so $r^2+z^2=3z^2$ and $z=r/\sqrt2$.

        [[fig:p]]`,
        { figHtml: figRing(), figs: { p: { svg: plotRing(), cap: md`The axial field of a ring peaks at $z=r/\sqrt2$.` } } }),

      Q(md`Half of the ring is removed (keep only the half with $x>0$). What is the field at the centre now?`,
        [md`Still zero, by symmetry`, md`$\dfrac{\lambda}{2\pi\ep r}$, in the plane of the ring, pointing away from the remaining half`, md`$\dfrac{\lambda}{2\pi\ep r}$, along the axis`, md`Half of the full-ring value at the centre`], 1,
        [md`The symmetry that made it zero needed every piece to have an opposite partner. Half the partners are gone.`,
          null,
          md`At the centre each piece's field lies in the plane of the ring; there is no axial part.`,
          md`The full ring gives zero at the centre, and half of zero is zero, which is wrong here.`],
        md`This is the semicircle from the previous lesson: each piece now has no partner across the centre, and the sum of the in-plane pushes is $\dfrac{\lambda}{2\pi\ep r}$ pointing away from the remaining arc.`,
        { figHtml: figArc('semi') }),

      RF(md`
        ### Disks: a stack of rings
        A flat disk of radius $R$ with surface charge $\sigma$ is a set of concentric rings. The ring between $r'$ and $r'+dr'$ has charge

        [[fig:d]]

        $$dq=\sigma\,(2\pi r')\,dr' \qquad(\text{circumference}\times\text{width}).$$

        Each ring gives an axial field from the ring formula with $Q\to dq$ and $r\to r'$. Add the rings by integrating $r'$ from $0$ to $R$. That is a one-variable integral of the form $\int\dfrac{r'\,dr'}{(r'^2+z^2)^{3/2}}$, which the substitution $u=r'^2+z^2$ does in one line.

        !!method Building up from known pieces
          Ring $\to$ disk (integrate over $r'$) $\to$ infinite sheet ($R\to\infty$). Ring $\to$ spherical shell (integrate over the polar angle). Segment $\to$ square loop (four segments). Whenever an object is a stack of simpler objects whose field you know, integrate the simple result instead of starting from $\int dq/\srm^2$.
      `, { d: { svg: figDisk(), cap: md`Disk of radius $R$ with surface charge $\sigma$; $P$ on the axis.` } }),

      P({
        id: 'HW1-2.6', src: 'HW 1 · Griffiths 2.6', title: 'Field on the axis of a disk', big: true,
        q: md`Find the electric field a distance $z$ above the center of a flat circular disk of radius $R$ (Fig. 2.10) that carries a uniform surface charge $\sigma$. What does your formula give in the limit $R\to\infty$? Also check the case $z\gg R$.`,
        figHtml: figDisk(),
        hints: [
          md`Do not start from scratch. Slice the disk into rings and use the ring result from Problem 2.5.`,
          md`The ring of radius $r'$ and width $dr'$ has $dq=2\pi\sigma r'\,dr'$ and gives $dE_z=\kq\dfrac{z\,dq}{(r'^2+z^2)^{3/2}}$.`,
          md`With $u=r'^2+z^2$: $\displaystyle\int_0^R\dfrac{r'\,dr'}{(r'^2+z^2)^{3/2}}=\dfrac1z-\dfrac{1}{\sqrt{z^2+R^2}}$.`,
          md`For $z\gg R$, expand $\dfrac{z}{\sqrt{z^2+R^2}}=\left(1+\dfrac{R^2}{z^2}\right)^{-1/2}\approx1-\dfrac{R^2}{2z^2}$. Keep the second term: the $1$ cancels.`,
        ],
        parts: [
          { lbl: 'E_z', expr: '(sigma/(2*eps0))*(1 - z/sqrt(z^2+R^2))', vars: { sigma: [1, 3], R: [0.5, 3], z: [0.2, 3], eps0: [0.5, 2] }, accepts: ['sigma*z/(2*eps0)*(1/z - 1/sqrt(z^2+R^2))'] },
          { lbl: md`$E_z$ in the limit $R\to\infty$`, expr: 'sigma/(2*eps0)', vars: { sigma: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`For $z\gg R$:`, mc: [md`$E_z\approx\dfrac{\sigma}{2\ep}$`, md`$E_z\approx\dfrac{\sigma R}{2\ep z}$`, md`$E_z\approx\kq\,\dfrac{\pi R^2\sigma}{z^2}$`, md`$E_z\approx0$ at every order`], a: 2,
            why: [md`That is the opposite limit, close to the disk.`, md`Expand correctly: $1-z/\sqrt{z^2+R^2}\approx R^2/2z^2$, so the field falls as $1/z^2$.`, null, md`The first terms cancel, but the next term does not. Far away the disk looks like a point charge $\pi R^2\sigma$.`] },
        ],
        sol: md`
          **Method.** Superpose rings. The ring of radius $r'$ and width $dr'$ carries $dq=\sigma\,2\pi r'\,dr'$, and by Problem 2.5 its field on the axis is along $\uv z$:

          [[fig:s]]

          $$dE_z=\kq\,\dfrac{z\,dq}{(r'^2+z^2)^{3/2}}=\dfrac{\sigma z}{2\ep}\,\dfrac{r'\,dr'}{(r'^2+z^2)^{3/2}} .$$

          Integrate with $u=r'^2+z^2$, $du=2r'\,dr'$:
          $$E_z=\dfrac{\sigma z}{2\ep}\Big[-\dfrac{1}{\sqrt{r'^2+z^2}}\Big]_0^R=\dfrac{\sigma z}{2\ep}\left(\dfrac1z-\dfrac{1}{\sqrt{z^2+R^2}}\right)=\dfrac{\sigma}{2\ep}\left(1-\dfrac{z}{\sqrt{z^2+R^2}}\right).$$

          **Limit $R\to\infty$** (an infinite plane): the second term goes to zero and
          $$E_z=\dfrac{\sigma}{2\ep},$$
          independent of $z$. This is the infinite-sheet field you will get in one line from Gauss's law.

          **Case $z\gg R$.** $\dfrac{z}{\sqrt{z^2+R^2}}=\left(1+\dfrac{R^2}{z^2}\right)^{-1/2}\approx1-\dfrac{R^2}{2z^2}$, so
          $$E_z\approx\dfrac{\sigma}{2\ep}\cdot\dfrac{R^2}{2z^2}=\dfrac{1}{4\pi\ep}\,\dfrac{\pi R^2\sigma}{z^2},$$
          the field of a point charge $q=\pi R^2\sigma$, the total charge of the disk.

          **What to remember.** Two limits, two pictures: close to the disk it looks like an infinite plane, far away like a point charge. In the far limit the leading $1$ cancels, so you must keep the next term of the expansion.
        `,
        figs: { s: { svg: figDisk(true), cap: md`The disk sliced into rings; the ring of radius $r'$ and width $dr'$ (thick) carries $dq=2\pi\sigma r'\,dr'$.` } },
      }),

      WG.disk(),

      Q(md`Move the slider in the widget to a large $R$ and look near the disk ($z\ll R$). What does the disk field look like there, and why?`,
        [md`Like a point charge, because the disk is small compared with $z$`, md`It is zero near the disk, because the field is only outside`, md`It grows without bound as $z\to0$, like a point charge`, md`Like an infinite sheet: $E\approx\sigma/2\ep$, nearly independent of $z$, because from close up you cannot see the edge`], 3,
        [md`Near the disk $z\ll R$, so it is the disk that is large, not small.`, md`Above the centre of a charged disk the field is not zero.`, md`The charge is spread out, so the field stays finite: it tends to $\sigma/2\ep$.`, null],
        md`For $z\ll R$, $z/\sqrt{z^2+R^2}\to0$ and $E_z\to\sigma/2\ep$. From close up, the disk fills your whole view like an infinite plane. Far away ($z\gg R$) it shrinks to a point charge $\pi R^2\sigma$.`,
        { figHtml: figDisk() }),

      Q(md`At the height $z=R$ above the centre of the disk, what fraction of the infinite-sheet value $\sigma/2\ep$ does the disk produce?`,
        [md`$1/2$`, md`$1-1/\sqrt2\approx0.29$`, md`$1/\sqrt2\approx0.71$`, md`$1/4$`], 1,
        [md`Put $z=R$ in the bracket: $1-\dfrac{R}{\sqrt{2R^2}}=1-\dfrac{1}{\sqrt2}$.`, null, md`$1/\sqrt2$ is the part you subtract, not what is left.`, md`$1/4$ would come from the far-field formula, which is not valid at $z=R$.`],
        md`$E_z=\dfrac{\sigma}{2\ep}\left(1-\dfrac{z}{\sqrt{z^2+R^2}}\right)$ at $z=R$ is $\dfrac{\sigma}{2\ep}\left(1-\dfrac{1}{\sqrt2}\right)\approx0.29\,\dfrac{\sigma}{2\ep}$. At a height equal to its radius, the disk already gives less than a third of the sheet value: the sheet approximation needs $z\ll R$.`,
        { figHtml: figDisk() }),

      Q(md`Why is the field of an infinite plane independent of the distance from it, even though each piece obeys $1/\srm^2$?`,
        [md`The plane's field lines are straight and parallel, and that is enough`, md`As you move away, each piece's field weakens, but more of the plane comes into view at a comparable angle; the two effects cancel exactly`, md`The plane carries infinite charge, so its field is infinite and the distance does not matter`, md`It is an approximation that fails far away`], 1,
        [md`Parallel field lines are the result, not the reason. The reason is in how the contributions add up.`, null,
          md`The field is finite ($\sigma/2\ep$) even though the total charge is infinite: the far pieces contribute less and less.`,
          md`For a truly infinite plane it is exact at every distance. For a finite disk it fails once $z$ is comparable to $R$.`],
        md`Griffiths' picture: think of the cone you look through. Moving away, each piece is farther ($1/\srm^2$ weaker), but the patch of plane inside a fixed viewing cone grows as $\srm^2$. Field of a point $\sim1/r^2$, of a line $\sim1/r$, of a plane $\sim$ constant: each extra dimension of charge removes one power of $r$.`,
        { figHtml: figPlane() }),

      Q(md`Just above the centre of the disk, $E_z\approx+\sigma/2\ep$. What is $E_z$ just **below** the centre, and what does that say?`,
        [md`$+\sigma/2\ep$: the field is continuous through the disk`, md`$0$: the field exists only on the side where you computed it`, md`$-\sigma/2\ep$: the field points away from the disk on both sides, so $E_z$ jumps by $\sigma/\ep$ across the charged surface`, md`$-\sigma/\ep$`], 2,
        [md`The formula is odd in $z$: below the disk, a positive disk pushes downward.`, md`The disk's field exists on both sides; by symmetry it points away from the disk on each side.`, null, md`Each side gets half: $\pm\sigma/2\ep$. The difference between them is $\sigma/\ep$.`],
        md`The exact on-axis result is $E_z=\dfrac{\sigma}{2\ep}\left(\dfrac{z}{|z|}-\dfrac{z}{\sqrt{z^2+R^2}}\right)$, so just above $+\sigma/2\ep$ and just below $-\sigma/2\ep$. The normal component of $\vb E$ jumps by $\sigma/\ep$ across a surface charge. This is a general **boundary condition**:
        $$E^\perp_{\text{above}}-E^\perp_{\text{below}}=\dfrac{\sigma}{\ep},$$
        which you will prove with a pillbox in the Gauss's-law lessons and use all through the boundary-value problems later.`,
        { figHtml: figSheetBC({ below: 0, la: md`E_z=+\sigma/2\varepsilon_0`, lb: md`E_z=\ ?` }) }),

      Q(md`In the $z\gg R$ check you expanded $\dfrac{z}{\sqrt{z^2+R^2}}\approx1-\dfrac{R^2}{2z^2}$. Why is it wrong to stop at the first term ($\approx1$)?`,
        [md`Because the first term is not accurate when $z\gg R$`, md`Because then $E_z\approx\dfrac{\sigma}{2\ep}(1-1)=0$: the leading terms cancel, so the physics is in the next term`, md`Because you must always keep two terms of a binomial series`, md`It is not wrong: the far field of a disk is zero`], 1,
        [md`The first term is accurate; it is just cancelled by the $1$ already in the bracket.`, null, md`Keep as many terms as you need to get the first non-zero result. Here that is the second one.`, md`The disk has charge $\pi R^2\sigma$, so far away its field is that of a point charge, not zero.`],
        md`When a bracket like $\left(1-\dfrac{z}{\sqrt{z^2+R^2}}\right)$ is a difference of nearly equal terms, expand until something survives. Here the survivor is $\dfrac{R^2}{2z^2}$, giving $\kq\dfrac{\pi R^2\sigma}{z^2}$. The same move appears in every “check the limit” step: dipoles, rings, shells.`,
        { nofig: 'series expansion only' }),

      Q(md`A ring and a disk have the same radius $R$ and the same total charge $Q$. Far out on the axis ($z\gg R$), how do their fields compare?`,
        [md`They are equal to leading order: both $\approx\kq\dfrac{Q}{z^2}$`, md`The ring's field is larger, because its charge is farther out`, md`The disk's field is larger, because its charge is spread over an area`, md`It depends on $R$`], 0,
        [null, md`Far away the distribution of the charge does not matter at leading order, only its total.`, md`Far away only the total charge matters at leading order.`, md`For $z\gg R$, $R$ drops out of the leading term.`],
        md`From far away every finite charge distribution looks like a point charge equal to its total charge. Ring: $\kq\dfrac{Qz}{(R^2+z^2)^{3/2}}\to\kq\dfrac{Q}{z^2}$. Disk: $\kq\dfrac{Q}{z^2}$ from the expansion in Problem 2.6. They differ only in the next correction, which depends on how the charge is spread.`,
        { figHtml: PF.row([{ svg: figRing(), cap: 'ring' }, { svg: figDisk(), cap: 'disk' }]).svg }),

      P({
        title: 'A disk with a hole',
        q: md`A flat annulus (a disk of radius $b$ with a concentric hole of radius $a$) carries uniform surface charge $\sigma$. Find $E_z$ on the axis at height $z$ above the centre.`,
        figHtml: figAnnulus(),
        hints: [md`Same ring decomposition as the disk; only the limits of the $r'$ integral change.`, md`$\displaystyle\int_a^b\dfrac{r'\,dr'}{(r'^2+z^2)^{3/2}}=\dfrac{1}{\sqrt{z^2+a^2}}-\dfrac{1}{\sqrt{z^2+b^2}}$.`],
        parts: [
          { lbl: 'E_z', expr: '(sigma*z/(2*eps0))*(1/sqrt(z^2+a^2) - 1/sqrt(z^2+b^2))', vars: { sigma: [1, 3], a: [0.3, 1], b: [1.5, 3], z: [0.2, 3], eps0: [0.5, 2] } },
          { lbl: md`What is $E_z$ at the centre of the hole ($z=0$)?`, mc: [md`$\sigma/2\ep$`, md`$\sigma/\ep$`, md`It is undefined`, md`$0$`], a: 3,
            why: [md`That is the value just above a full disk. The hole removes the charge right under you.`, md`Too big even for a full disk.`, md`At $z=0$ the formula is perfectly finite: the prefactor $z$ makes it vanish.`, null] },
        ],
        sol: md`
          Rings from $r'=a$ to $r'=b$:
          $$E_z=\dfrac{\sigma z}{2\ep}\int_a^b\dfrac{r'\,dr'}{(r'^2+z^2)^{3/2}}=\dfrac{\sigma z}{2\ep}\left(\dfrac{1}{\sqrt{z^2+a^2}}-\dfrac{1}{\sqrt{z^2+b^2}}\right).$$

          **Checks.**
          - $a\to0$: $\dfrac{\sigma}{2\ep}\left(1-\dfrac{z}{\sqrt{z^2+b^2}}\right)$, the full disk.
          - $z=0$: $E_z=0$. In the plane of the annulus at its centre, every ring gives zero (like the centre of a single ring).
          - Equivalent view: annulus $=$ disk of radius $b$ minus disk of radius $a$. Subtract the two disk formulas and you get the same result.
        `,
      }),

      P({
        title: 'An infinite sheet with a hole',
        q: md`An infinite plane carries uniform surface charge $\sigma$, except for a circular hole of radius $R$ cut out of it. Find $E_z$ on the axis of the hole, a height $z$ above its centre.`,
        figHtml: figHole(),
        hints: [md`Superposition: sheet with hole $=$ full sheet $+$ a disk of charge density $-\sigma$ filling the hole.`, md`Full sheet: $\sigma/2\ep$. Disk of $-\sigma$: minus the disk formula from Problem 2.6.`],
        parts: [
          { lbl: 'E_z', expr: '(sigma/(2*eps0))*z/sqrt(z^2+R^2)', vars: { sigma: [1, 3], R: [0.5, 3], z: [0.2, 3], eps0: [0.5, 2] } },
          { lbl: md`Far from the sheet ($z\gg R$), $E_z$ approaches`, mc: [md`$0$`, md`$\dfrac{\sigma}{2\ep}$`, md`$\kq\dfrac{\pi R^2\sigma}{z^2}$`, md`$\dfrac{\sigma}{\ep}$`], a: 1,
            why: [md`The hole is a small missing piece of an infinite sheet; far away the sheet still dominates.`, null, md`That is the size of the missing piece's contribution, which becomes negligible next to $\sigma/2\ep$.`, md`One sheet gives $\sigma/2\ep$, not $\sigma/\ep$.`] },
        ],
        sol: md`
          **Method: fill the hole and subtract.** The sheet with a hole is the full sheet plus a disk of charge density $-\sigma$ in the hole. Fields add:
          $$E_z=\dfrac{\sigma}{2\ep}-\dfrac{\sigma}{2\ep}\left(1-\dfrac{z}{\sqrt{z^2+R^2}}\right)=\dfrac{\sigma}{2\ep}\,\dfrac{z}{\sqrt{z^2+R^2}} .$$

          **Checks.** At $z=0$ (the centre of the hole) $E_z=0$, as at the centre of a ring. For $z\gg R$, $E_z\to\sigma/2\ep$: far away the hole does not matter. You can also get the result directly by integrating rings from $r'=R$ to $\infty$.

          **What to remember.** “Hole $=$ object $+$ negative patch” is the same superposition trick as the clock with a missing charge. It will come back with a cavity in a charged sphere.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - On the axis of a ring, $\srm$ and $\cos\theta$ are the same for every piece: $E_z=\kq\dfrac{Qz}{(r^2+z^2)^{3/2}}$. Zero at the centre, maximum at $z=r/\sqrt2$.
          - Disk $=$ rings: $dq=2\pi\sigma r'\,dr'$. On the axis $E_z=\dfrac{\sigma}{2\ep}\left(1-\dfrac{z}{\sqrt{z^2+R^2}}\right)$.
          - Close to a charged surface it looks infinite ($\sigma/2\ep$); far away it looks like a point charge.
          - Across a surface charge, $E^\perp$ jumps by $\sigma/\ep$ ($+\sigma/2\ep$ above, $-\sigma/2\ep$ below for a sheet).
          - Holes and missing pieces: add the full object and a negative patch.
          - In a far-field expansion, keep terms until something survives the cancellation.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 4 — Field lines, flux and Gauss's law (Lecture 2 p2–5; Griffiths 2.2.1)
  // =====================================================================================
  const L4 = {
    id: 'u1-flux', title: "Field lines, flux and Gauss's law",
    steps: [
      RF(md`
        ### Field lines
        You cannot draw $\vb E$ at every point, so draw **field lines**: at each point the line runs along $\vb E$, and the **density** of lines shows the strength.

        [[fig:lines]]

        - Lines start on positive charges and end on negative charges (or run off to infinity).
        - Lines never cross: at a crossing the field would have two directions at once.
        - The number of lines leaving a charge is proportional to the charge: if $q$ gets 8 lines, $2q$ gets 16.

        In three dimensions the lines from a point charge spread over a sphere of area $4\pi r^2$, so their density falls as $1/r^2$, exactly like Coulomb's law. (A flat drawing understates this: on paper the lines spread over a circle, a $1/r$ density.)
      `, { lines: { svg: PF.row([{ svg: figRadial('+'), cap: md`$+q$` }, { svg: figLines([[110, 110, 1], [230, 110, -1]]), cap: md`$+q$ and $-q$` }, { svg: figLines([[110, 110, 1], [230, 110, 1]], { half: true }), cap: md`$+q$ and $+q$` }]).svg, cap: 'Field lines of a point charge and of two charges (drawn in the plane that contains them).' } }),

      Q(md`Two field lines appear to cross at a point $P$ in empty space. What can you conclude?`,
        [md`The diagram is wrong (or $\vb E=0$ at $P$): the field has one direction at each point`, md`The field at $P$ is twice as strong`, md`There is a charge at $P$`, md`Nothing: lines from different charges are allowed to cross`], 0,
        [null, md`Strength is shown by line density, not by crossings. Two lines through one point would mean two directions.`, md`Lines meet only where they start or end on a charge. A point in empty space is not one.`, md`The lines show the total field (the superposition), which has one direction at each point. The total field's lines cannot cross.`],
        md`$\vb E$ is a single vector at each point, so only one field line passes through any point where $\vb E\ne0$. Lines can only touch where $\vb E=0$ (a neutral point, like the midpoint between two equal charges) or at a charge.`,
        { figHtml: figLines([[110, 110, 1], [230, 110, -1]]) }),

      Q(md`In the field-line picture of two equal positive charges, what is the field exactly halfway between them?`,
        [md`Twice the field of one charge`, md`It points straight up`, md`Zero`, md`It points from one charge toward the other`], 2,
        [md`The two fields there point in opposite directions (each away from its own charge).`, md`On the line joining them the vertical components are zero by symmetry.`, null, md`The two contributions are equal and opposite; neither wins.`],
        md`At the midpoint the two fields have equal magnitude and opposite directions, so $\vb E=0$. In the picture no line passes through the midpoint: the lines from each charge turn away from it.`,
        { figHtml: figLines([[110, 110, 1], [230, 110, 1]], { half: true }) }),

      Q(md`A charge $+q$ is drawn with 8 field lines. How many lines should end on a charge $-2q$ in the same drawing?`,
        [md`8`, md`4`, md`2`, md`16`], 3,
        [md`The line count must be proportional to the charge. Twice the charge, twice the lines.`, md`Fewer lines would mean a weaker charge.`, md`The number of lines is not the number of charges.`, null],
        md`The number of lines is proportional to the magnitude of the charge, the same proportion for every charge in a drawing. $|{-2q}|=2q$ gets $2\times8=16$ lines, arriving instead of leaving.`,
        { figHtml: figRadial('-') }),

      RF(md`
        ### Flux
        The **flux** of $\vb E$ through a surface $S$ counts the field lines that pass through it:

        $$\Phi_E=\int_S\vb E\cdot d\vb a .$$

        $d\vb a$ is a vector **normal** to the surface whose length is the area of the small patch. The dot product keeps only the component of $\vb E$ through the surface. For a flat surface of area $A$ in a uniform field, at angle $\theta$ between $\vb E$ and the normal,

        $$\Phi_E=EA\cos\theta .$$

        [[fig:patch]]

        For a **closed** surface the integral is written $\oint$ and $d\vb a$ points **outward** by convention. Flux out of the surface is positive; flux into it is negative. A closed surface with no charge inside has as many lines entering as leaving: zero net flux.
      `, { patch: { svg: figFluxPatch(), cap: md`A flat patch seen edge on. Only the component of $\vb E$ along the normal $d\vb a$ goes through it.` } }),

      Q(md`A flat surface of area $A$ sits in a uniform field $\vb E$, with its normal at angle $\theta$ to $\vb E$. What is the flux through it?`,
        [md`$EA$`, md`$EA\sin\theta$`, md`$E/A$`, md`$EA\cos\theta$`], 3,
        [md`Only if the normal is parallel to $\vb E$ ($\theta=0$).`, md`$\theta$ is measured between $\vb E$ and the normal, not the surface. Flux is maximal at $\theta=0$, so it goes as $\cos\theta$.`, md`Flux grows with area.`, null],
        md`$\Phi=\vb E\cdot\vb A=EA\cos\theta$. Face-on ($\theta=0$) the surface catches the most lines; edge-on ($\theta=90^\circ$) it catches none.`,
        { figHtml: figFluxPatch() }),

      Q(md`A hemispherical bowl of radius $R$ sits in a uniform field $\vb E$ parallel to its axis. What is the flux through the curved surface, with the normal pointing out of the dome (upward)?`,
        [md`$\pi R^2E$`, md`$2\pi R^2E$`, md`$4\pi R^2E$`, md`Zero, because the bowl is curved`], 0,
        [null, md`$2\pi R^2$ is the dome's area, but the field is not normal to most of it. Count the lines instead.`, md`$4\pi R^2$ is a whole sphere's area.`, md`A curved surface can catch flux; here every line that crosses the flat base also crosses the dome.`],
        md`Close the bowl with its flat base. The closed surface (dome + base) contains no charge, so its total flux is zero. The base has outward normal $-\uv z$ and flux $-\pi R^2E$, so the dome has $+\pi R^2E$. Every field line that enters through the base leaves through the dome.`,
        { figHtml: figHemi() }),

      Q(md`What is the flux of a uniform field through the **closed** surface made of the bowl and its flat base?`,
        [md`$\pi R^2E$`, md`$2\pi R^2E$`, md`Zero`, md`$-\pi R^2E$`], 2,
        [md`That is the dome alone. The base contributes $-\pi R^2E$.`, md`The flux through the two pieces cancels; it does not add.`, null, md`That is the base alone.`],
        md`Each line of a uniform field enters through the base and leaves through the dome: $-\pi R^2E+\pi R^2E=0$. In general, the net flux through any closed surface that encloses no charge is zero.`,
        { figHtml: figHemi() }),

      RF(md`
        ### Flux of a point charge through a sphere
        Lecture 2 asks for the flux of a point charge $q$ through a sphere of radius $r$ centred on it.

        [[fig:gs]]
      `, { gs: { svg: figGaussSphere(), cap: md`Charge $q$ at the centre of a sphere of radius $r$ (dashed). $d\vb a$ points outward.` } }),

      Q(md`In-class question: which coordinate system should you use for this integral?`,
        [md`Cartesian, because $\vb E$ has $x,y,z$ components`, md`Cylindrical, around any axis through $q$`, md`Spherical centred on $q$: $\vb E$ is along $\uv r$ and $r$ is constant on the surface`, md`It does not matter; all give the same work`], 2,
        [md`Possible in principle, but the sphere's boundary and $\vb E$'s direction are messy in Cartesian coordinates.`, md`The surface is not a cylinder; the area element would be awkward.`, null, md`The answer is the same in any system, but the work is not: spherical coordinates make $r$ constant and $\vb E\parallel d\vb a$.`],
        md`On a sphere centred on the charge, $d\vb a=r^2\sin\theta\,d\theta\,d\varphi\,\uv r$ with $r$ fixed, and $\vb E$ is also along $\uv r$. The dot product is a plain product and $r$ comes out of the integral.`,
        { figHtml: figGaussSphere() }),

      RF(md`
        With $d\vb a=r^2\sin\theta\,d\theta\,d\varphi\,\uv r$ (the $r^2$ is constant on the sphere):

        $$\Phi_E=\oint\left(\dfrac{q}{4\pi\ep r^2}\,\uv r\right)\cdot\left(r^2\sin\theta\,d\theta\,d\varphi\,\uv r\right)=\dfrac{q}{4\pi\ep}\underbrace{\int_0^{2\pi}\!d\varphi\int_0^{\pi}\!\sin\theta\,d\theta}_{4\pi}=\dfrac{q}{\ep}.$$

        The radius cancels: the area grows as $r^2$ and the field falls as $1/r^2$. In the field-line picture this is obvious: every line from $q$ crosses every sphere around it exactly once.
      `),

      Q(md`In-class question: why does the flux of $q$ through the sphere not depend on $r$?`,
        [md`Because $\vb E$ is the same at every radius`, md`Because the flux counts field lines, and every line from $q$ crosses each sphere around it once; the $r^2$ of the area cancels the $1/r^2$ of the field`, md`Because the sphere is a special shape; for other surfaces it would depend on size`, md`It does depend on $r$, weakly`], 1,
        [md`$\vb E$ falls as $1/r^2$. What stays fixed is $E\times$ area.`, null, md`The count of lines through a closed surface does not care about its shape either. That is Gauss's law.`, md`The cancellation is exact for a $1/r^2$ force.`],
        md`$E\propto1/r^2$ and area $\propto r^2$. Equivalently, the flux counts lines, and the number of lines leaving $q$ is fixed. The cancellation is exact only because Coulomb's law is exactly $1/r^2$.`,
        { figHtml: figConcentric() }),

      Q(md`Suppose the force law were $1/r^3$ instead of $1/r^2$. How would the flux of a point charge through a concentric sphere depend on its radius?`,
        [md`It would not depend on $r$`, md`It would grow as $r$`, md`It would fall as $1/r^2$`, md`It would fall as $1/r$`], 3,
        [md`The $r$-independence needs the area ($r^2$) and the field ($1/r^2$) to cancel exactly.`, md`A weaker-at-distance field gives less flux far away, not more.`, md`Area $\times$ field $=r^2\times r^{-3}$.`, null],
        md`Flux $\propto r^2\times r^{-3}=1/r$. Gauss's law, with its “only the enclosed charge matters”, is special to inverse-square fields: Coulomb's law and Newtonian gravity.`,
        { figHtml: figConcentric() }),

      RF(md`
        ### Gauss's law
        Since the flux only counts the lines that leave, it can only depend on the charge **enclosed**:

        $$\oint_S\vb E\cdot d\vb a=\dfrac{\Qenc}{\ep}.$$

        - **Any closed surface, any shape.** Squeeze or stretch the surface: as long as no charge crosses it, the number of lines through it does not change. The notes call Gauss's law a *topological invariant*.
        - **Charges outside contribute zero net flux.** Their lines enter the surface and leave it again. (Griffiths' proof: superpose; each charge outside gives zero, each charge inside gives $q_i/\ep$.)
        - **It is always true**, also for moving charges: it is one of Maxwell's equations.

        !!trap Flux versus field
          Gauss's law fixes the **total flux**, which depends only on $\Qenc$. The **field** at points of the surface depends on every charge, inside and outside. A charge outside changes $\vb E$ on the surface without changing the flux.
      `),

      Q(md`What is the flux of $\vb E$ through the closed surface $S$?`,
        [md`$q/\ep$`, md`$4q/\ep$`, md`$3q/\ep$`, md`$2q/\ep$`], 0,
        [null, md`The $3q$ is outside $S$: its lines go in and come back out, adding nothing.`, md`Only the outside charge? The enclosed charges count, the outside one does not.`, md`You must include the $-q$ that is inside.`],
        md`$\Qenc=2q+(-q)=q$, so $\Phi=q/\ep$. The $3q$ outside contributes zero net flux.`,
        { figHtml: figBlob() }),

      Q(md`Same surface. Does the electric field **on** $S$ depend on the charge $3q$ outside?`,
        [md`No, Gauss's law says only enclosed charge matters`, md`Only on the part of $S$ nearest $3q$`, md`No, the field on $S$ is set by $2q$ and $-q$`, md`Yes, $\vb E$ at each point of $S$ is the field of all three charges; only the total flux is unaffected by $3q$`], 3,
        [md`Gauss's law is about the flux, not the field. This is the standard trap.`, md`Coulomb fields reach everywhere. The $3q$ changes $\vb E$ at every point of $S$, more strongly where it is closer.`, md`Superposition: the field at any point is the sum of the fields of all charges.`, null],
        md`$\vb E$ on the surface is the full superposition of all three charges. The $3q$ makes $\vb E\cdot d\vb a$ positive on some patches and negative on others, and those contributions add to zero. So the flux is blind to it, but the field is not.`,
        { figHtml: figBlob() }),

      Q(md`A point charge $q$ sits inside a spherical surface $S$, but off centre. Which is true?`,
        [md`The flux is $q/\ep$, but $|\vb E|$ is not the same everywhere on $S$`, md`The flux is $q/\ep$ and $|\vb E|=q/(4\pi\ep R^2)$ everywhere on $S$`, md`The flux is less than $q/\ep$ because the charge is closer to one side`, md`The flux depends on how far the charge is from the centre`], 0,
        [null, md`$|\vb E|$ is larger on the near side and $\vb E$ is not normal to $S$. You cannot pull $E$ out of the integral.`, md`Every line from $q$ still leaves through $S$ exactly once.`, md`Gauss's law: only $\Qenc$ matters, not where it sits inside.`],
        md`The flux is $q/\ep$ wherever the charge is inside. But Gauss's law alone no longer gives you $\vb E$: on this surface $|\vb E|$ varies and $\vb E$ is not along $d\vb a$. Symmetry, not Gauss's law, is what lets you solve for $E$.`,
        { figHtml: figSphereQ('off') }),

      Q(md`The charge is now **outside** the sphere $S$. Which is true?`,
        [md`$\vb E=0$ everywhere on $S$, since the flux is zero`, md`The flux is negative because lines enter $S$`, md`The flux through $S$ is zero, but $\vb E\ne0$ on $S$`, md`The flux is $q/\ep$ because the charge's lines touch the sphere`], 2,
        [md`Zero flux means as much flux in as out, not zero field. Lines go in on the near side and out on the far side.`, md`Every line that enters also leaves. Net flux zero.`, null, md`Only enclosed charge produces net flux.`],
        md`Each field line of the outside charge that crosses $S$ crosses it twice, once in and once out, so the net flux is zero. The field on $S$ is certainly not zero. “$\Phi=0$” never implies “$\vb E=0$”.`,
        { figHtml: figSphereQ('out') }),

      P({
        title: 'Charge at the centre of a cube',
        q: md`A point charge $q$ sits at the centre of a cube. What is the flux of $\vb E$ through **one** face of the cube? Give it in units of $q/\ep$.`,
        figHtml: figCube('center'),
        hints: [md`Gauss's law gives the total flux through the closed cube. You do not need to integrate over a face.`, md`The six faces are identical as seen from the centre.`],
        parts: [{ lbl: md`$\Phi_{\text{face}}$ in units of $q/\ep$`, ans: 1 / 6 }],
        sol: md`
          The total flux through the cube is $q/\ep$ (Gauss's law; the shape of the surface does not matter). By symmetry each of the six faces gets the same share:
          $$\Phi_{\text{face}}=\dfrac{q}{6\ep}.$$

          **What to remember.** When a direct integral looks hard, close the surface, use Gauss for the total, and split it by symmetry.
        `,
      }),

      P({
        title: 'Charge at a corner of a cube',
        q: md`A charge $q$ sits at the back corner of a cube, as shown (Griffiths 2.10 in the 4th edition). What is the flux of $\vb E$ through the shaded face? Give it in units of $q/\ep$.`,
        figHtml: figCube('corner', true),
        hints: [
          md`The charge sits on the surface, so the cube does not enclose it fully. Build a bigger closed surface around it out of copies of the cube.`,
          md`Eight cubes around the corner make a big cube with $q$ at its centre. How much flux goes through the original small cube?`,
          md`Of the small cube's six faces, three touch the charge. What is $\vb E\cdot d\vb a$ on them?`,
        ],
        parts: [
          { lbl: md`$\Phi_{\text{shaded}}$ in units of $q/\ep$`, ans: 1 / 24 },
          { lbl: md`Flux through one of the three faces that touch the charge:`, mc: [md`$q/24\ep$`, md`$q/8\ep$`, md`$q/6\ep$`, md`$0$`], a: 3,
            why: [md`Those three faces contain the charge's corner; the field there lies in the face.`, md`$q/8\ep$ is the flux through the whole small cube.`, md`That is the centre-charge answer.`, null] },
        ],
        sol: md`
          **Build a symmetric closed surface.** Stack eight copies of the cube around the corner: they form a cube of twice the size with $q$ at its centre. The flux through the big cube is $q/\ep$, and the eight small cubes share it equally, so the small cube gets $q/8\ep$.

          **Split among the faces.** Three faces of the small cube contain the corner where $q$ sits. On those faces $\vb E$ points along the face (radially out from the corner, lying in the face plane), so $\vb E\cdot d\vb a=0$: no flux. The other three faces are equivalent by symmetry and share $q/8\ep$:
          $$\Phi_{\text{shaded}}=\dfrac{1}{3}\cdot\dfrac{q}{8\ep}=\dfrac{q}{24\ep}.$$

          **What to remember.** If a charge sits on a surface, extend the surface (copies, mirror images) until the charge is inside a symmetric closed surface, then divide.
        `,
      }),

      Q(md`A charge $q$ sits at the centre of one face of a cube. What is the total flux through the cube?`,
        [md`$q/\ep$`, md`$q/6\ep$`, md`$q/2\ep$`, md`$0$, because the charge is not inside`], 2,
        [md`The charge is on the surface, not inside. Half of its lines go outward away from the cube.`, md`$q/6\ep$ is one face's share when the charge is at the centre.`, null, md`A charge on the surface is half in, half out; it does not give zero.`],
        md`Put a second cube against the face: the two cubes form a box with $q$ at its centre, total flux $q/\ep$, shared equally by the two halves. Each cube gets $q/2\ep$. (A smooth surface through a point charge sees half its lines.)`,
        { figHtml: figCube('face') }),

      Q(md`A charge $q$ sits at the midpoint of an edge of a cube. What is the total flux through the cube?`,
        [md`$q/4\ep$`, md`$q/2\ep$`, md`$q/8\ep$`, md`$q/12\ep$`], 0,
        [null, md`An edge is shared by four cubes, not two.`, md`A corner is shared by eight cubes; an edge by four.`, md`The flux through the cube is the share of one cube among those that meet at the edge.`],
        md`Four cubes meet at an edge. Together they surround the charge (total $q/\ep$), so each gets $q/4\ep$.`,
        { figHtml: figCube('edge') }),

      RF(md`
        ### When is Gauss's law useful?
        Gauss's law always holds, but it gives you $\vb E$ only if you can pull $|\vb E|$ out of the integral. That needs a Gaussian surface on which

        1. $\vb E$ is parallel to $d\vb a$ (or perpendicular to it, on pieces that then carry no flux), and
        2. $|\vb E|$ is constant on the pieces that do carry flux.

        Then $\oint\vb E\cdot d\vb a=|\vb E|\times(\text{area of those pieces})$ and you can solve for $|\vb E|$. Symmetry is what guarantees both conditions, and only three symmetries do it (Lecture 2):

        | symmetry | Gaussian surface | flux |
        |---|---|---|
        | spherical | concentric sphere | $E\cdot4\pi r^2$ |
        | cylindrical (infinitely long) | coaxial cylinder | $E\cdot2\pi sL$ (ends give 0) |
        | planar (infinite plane) | pillbox straddling the plane | $E\cdot2A$ (sides give 0) |

        !!method Gauss's law, step by step
          1. Identify the symmetry. Argue what direction $\vb E$ has and what it can depend on.
          2. Draw a Gaussian surface **through the point where you want $\vb E$**, matched to the symmetry.
          3. Write the flux as $|\vb E|\times$ area (pieces with $\vb E\perp d\vb a$ give zero).
          4. Compute $\Qenc$: the charge inside the surface only. If $\rho$ is not uniform, integrate it.
          5. Solve for $|\vb E|$; restore the direction. Check limits and continuity.
      `),

      Q(md`In-class question: for which charge distribution does Gauss's law, by itself, let you find $\vb E$?`,
        [md`A uniformly charged cube`, md`A finite charged rod`, md`Two point charges`, md`An infinitely long cylinder with $\rho$ depending only on the distance from its axis`], 3,
        [md`No surface makes $|\vb E|$ constant around a cube: the field is stronger near the face centres than near the corners.`, md`Near the ends of a finite rod the field is not radial; a coaxial cylinder only gives an approximation near the middle.`, md`No symmetry makes $|\vb E|$ constant on any closed surface.`, null],
        md`Cylindrical symmetry: $\vb E$ points radially away from the axis and depends only on $s$, so a coaxial cylinder has $\vb E\parallel d\vb a$ and constant $|\vb E|$ on its curved side and $\vb E\perp d\vb a$ on its ends. For the other three, Gauss's law is still true but does not determine $\vb E$.`,
        { figHtml: figLineCyl(false, { rod: true }) }),

      Q(md`A cube carries a uniform volume charge. A student applies Gauss's law with a cube-shaped surface just outside it and writes $E\cdot6a^2=Q/\ep$. What is wrong?`,
        [md`Nothing: the cube is symmetric enough`, md`$\Qenc$ should be $Q/6$`, md`$|\vb E|$ is not constant on the faces and $\vb E$ is not normal to them, so $E$ cannot come out of the integral`, md`Gauss's law does not hold for cubes`], 2,
        [md`A cube's symmetry is not enough to make $|\vb E|$ constant on any surface.`, md`The whole charge is enclosed.`, null, md`Gauss's law holds for every closed surface. It is only not useful here.`],
        md`The flux really is $Q/\ep$. But near a face centre the field is stronger and normal to the face; near the edges it is weaker and tilted. “$E\cdot\text{area}$” assumes a constant normal field, which only spherical, cylindrical or planar symmetry provides.`,
        { figHtml: figCubeSolid() }),

      Q(md`To find the field of an infinite plane of charge, which Gaussian surface do you use?`,
        [md`A sphere centred on the plane`, md`A pillbox (short cylinder) that straddles the plane, with its axis normal to the plane`, md`A long cylinder lying in the plane`, md`A cube with one face in the plane`], 1,
        [md`On a sphere the field (normal to the plane) is not along $d\vb a$ and not constant in $\vb E\cdot d\vb a$.`, null, md`Its curved surface is partly parallel and partly perpendicular to $\vb E$, with varying angle.`, md`With one face in the plane the charge sits on the surface; and you only get flux on one side.`],
        md`$\vb E$ is normal to the plane and the same at equal distances on either side. A pillbox through the plane has lids parallel to the plane ($\vb E\parallel d\vb a$, constant $E$) and sides perpendicular to it ($\vb E\perp d\vb a$, zero flux). That gives $2AE=\sigma A/\ep$.`,
        { figHtml: figPlane() }),

      RF(md`
        !!key Patterns to remember
          - Flux $\Phi=\int\vb E\cdot d\vb a$ counts field lines; $d\vb a$ is normal, outward for closed surfaces.
          - Gauss: $\oint\vb E\cdot d\vb a=\Qenc/\ep$ for **any** closed surface. Charges outside give zero net flux but still change $\vb E$ on the surface.
          - Zero flux does not mean zero field.
          - Charge on the surface: complete the space with copies (face: $1/2$, edge: $1/4$, corner: $1/8$ of $q/\ep$ through the cube).
          - Gauss's law **finds** $\vb E$ only with spherical, cylindrical or planar symmetry: sphere, coaxial cylinder, pillbox. Otherwise it is true but useless.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 5 — Gauss's law with spherical symmetry (Griffiths 2.2.3; Lecture 3 p1–3)
  // =====================================================================================
  const L5 = {
    id: 'u1-gauss-sphere', title: "Gauss's law: spherical symmetry",
    steps: [
      RF(md`
        ### The symmetry argument
        Suppose $\rho$ depends only on the distance $r$ from a centre. Then $\vb E$ must point radially and its size can depend only on $r$. (Griffiths' argument: suppose $\vb E$ pointed “east” somewhere. Nothing in a spherically symmetric distribution picks out east over west or north; the same reasoning would prove it points west. The only direction a sphere singles out is radial.)

        Take a Gaussian sphere of radius $r$ through the field point. On it $\vb E=E(r)\,\uv r$ is parallel to $d\vb a$ and has the same size everywhere, so

        $$\oint\vb E\cdot d\vb a=E(r)\,4\pi r^2=\dfrac{\Qenc(r)}{\ep}\qquad\Longrightarrow\qquad \vb E=\dfrac{1}{4\pi\ep}\,\dfrac{\Qenc(r)}{r^2}\,\uv r .$$

        [[fig:s]]

        !!key Spherical symmetry in one line
          At radius $r$, the field is that of a point charge $\Qenc(r)$ at the centre. The charge **outside** $r$ contributes nothing.

        Outside a sphere of total charge $q$ (Griffiths Ex. 2.3), $\Qenc=q$ and $\vb E=\dfrac{q}{4\pi\ep r^2}\uv r$: exactly as if all the charge were at the centre, whatever $\rho(r)$ is.
      `, { s: { svg: figSolid(false, md`\rho(r)`), cap: md`A spherically symmetric charge distribution of radius $R$. Draw the Gaussian sphere through the point where you want $\vb E$.` } }),

      Q(md`A sphere of radius $R$ carries total charge $Q$ with a density $\rho(r)$ that depends only on $r$. What is $\vb E$ at a distance $r>R$ from the centre?`,
        [md`It depends on the details of $\rho(r)$`, md`$\dfrac{Q}{4\pi\ep R^2}\uv r$`, md`$\dfrac{Q}{4\pi\ep r^2}\uv r$`, md`$\dfrac{Q}{4\pi\ep r^2}\uv r$ only if $\rho$ is uniform`], 2,
        [md`Outside, $\Qenc=Q$ for any spherically symmetric $\rho(r)$; the details only matter inside.`, md`That is the value at the surface. Outside, the field keeps falling as $1/r^2$.`, null, md`Uniformity is not needed, only spherical symmetry.`],
        md`Gaussian sphere of radius $r>R$: $E\cdot4\pi r^2=Q/\ep$. Any spherically symmetric distribution looks like a point charge from outside.`,
        { figHtml: figSolid(false, md`\rho(r)`) }),

      Q(md`Inside a spherically symmetric distribution, at radius $r$, which charge determines $|\vb E|$?`,
        [md`All the charge, but the outer layers count less`, md`Only the charge in the shell near radius $r$`, md`The charge outside $r$, pushing inward`, md`Only the charge inside radius $r$`], 3,
        [md`The outer layers count exactly zero: a uniform spherical shell produces no field inside it.`, md`All the charge inside $r$ counts, at every depth.`, md`Spherical shells outside $r$ give zero field at $r$.`, null],
        md`$E(r)\,4\pi r^2=\Qenc(r)/\ep$. The charge outside $r$ forms spherical shells around the field point, and a uniform shell gives no field inside it.`,
        { figHtml: figSolid(true) }),

      P({
        id: 'HW1-2.12', src: 'HW 1 · Griffiths 2.12', title: 'Spherical shell', big: true,
        q: md`Use Gauss's law to find the electric field inside and outside a spherical shell of radius $R$ that carries a uniform surface charge density $\sigma$.`,
        figHtml: figShell(),
        hints: [
          md`Spherical symmetry: $\vb E=E(r)\,\uv r$. Use a concentric Gaussian sphere of radius $r$, once with $r<R$ and once with $r>R$.`,
          md`The flux through the Gaussian sphere is $E(r)\,4\pi r^2$ in both cases. The difference is $\Qenc$.`,
          md`Inside, the Gaussian sphere encloses no charge. Outside, it encloses the whole shell: $\Qenc=\sigma\cdot4\pi R^2$.`,
        ],
        parts: [
          { lbl: md`Inside ($r<R$), $|\vb E|$ is`, mc: [md`$\dfrac{\sigma}{\ep}$`, md`$\dfrac{\sigma}{2\ep}$`, md`$0$`, md`$\dfrac{\sigma r}{\ep R}$`], a: 2,
            why: [md`That is the value just outside. Inside, the Gaussian sphere encloses nothing.`, md`That is the sheet result. Here $\Qenc=0$ inside.`, null, md`A linear rise is what you get inside a **solid** sphere. A shell has no charge inside.`] },
          { lbl: md`Outside ($r>R$), $E_r$`, expr: 'sigma*R^2/(eps0*r^2)', vars: { sigma: [1, 3], R: [0.5, 2], r: [2, 5], eps0: [0.5, 2] }, accepts: ['4*pi*R^2*sigma/(4*pi*eps0*r^2)'] },
          { lbl: md`Across the shell, $E_r$ jumps from $0$ to its outside value. The size of the jump is`, mc: [md`$\sigma/\ep$`, md`$\sigma/2\ep$`, md`$0$: fields are continuous`, md`$2\sigma/\ep$`], a: 0,
            why: [null, md`Inside is $0$ and just outside is $\sigma R^2/(\ep R^2)=\sigma/\ep$.`, md`The normal component is discontinuous where there is surface charge.`, md`Just outside the field is $\sigma/\ep$, and inside it is $0$.`] },
        ],
        sol: md`
          **Symmetry.** The charge is spherically symmetric, so $\vb E=E(r)\,\uv r$. Gaussian surface: a concentric sphere of radius $r$, on which $\vb E\parallel d\vb a$ with constant size. Flux $=E(r)\,4\pi r^2$.

          [[fig:s]]

          **Inside ($r<R$).** The Gaussian sphere encloses no charge: $E\,4\pi r^2=0$, so
          $$\vb E=0\qquad(r<R).$$

          **Outside ($r>R$).** $\Qenc=\sigma\,4\pi R^2$:
          $$E\,4\pi r^2=\dfrac{4\pi R^2\sigma}{\ep}\qquad\Longrightarrow\qquad \vb E=\dfrac{\sigma R^2}{\ep r^2}\,\uv r=\dfrac{1}{4\pi\ep}\,\dfrac{q}{r^2}\,\uv r\qquad(r>R),$$
          with $q=4\pi R^2\sigma$ the total charge: outside, the shell looks like a point charge.

          [[fig:p]]

          **Boundary condition check.** Just outside, $E_r=\sigma/\ep$; just inside, $0$. The normal component jumps by exactly $\sigma/\ep$, the general rule $E^\perp_{\text{out}}-E^\perp_{\text{in}}=\sigma/\ep$ at a charged surface.

          **Compare with Prob. 2.7** (Griffiths): the same result by direct integration over the shell takes a page of law-of-cosines algebra. Gauss's law plus symmetry takes two lines.

          **What to remember.** A uniform spherical shell produces no field inside it, at **any** inside point, not only the centre. This is why only $\Qenc(r)$ matters in every spherically symmetric problem.
        `,
        figs: { s: { svg: figShell(true), cap: md`Gaussian spheres inside ($r<R$) and outside ($r>R$) the charged shell; outside, $\vb E$ is radial.` },
          p: { svg: plotShell(), cap: md`$|\vb E|(r)$ for a charged shell: zero inside, a jump of $\sigma/\ep$ at $R$, then $1/r^2$.` } },
      }),

      Q(md`A field point is inside the uniformly charged shell but far from its centre, close to the shell on one side. What is $\vb E$ there?`,
        [md`Zero, as at the centre`, md`It points away from the nearby part of the shell`, md`It points toward the nearby part of the shell`, md`It is $\sigma/2\ep$, as near a sheet`], 0,
        [null, md`The nearby charge is closer, but the far side has more charge in view; the two balance exactly for a $1/r^2$ law.`, md`For a positive shell the nearby charge would push, not pull; and in any case the contributions cancel.`, md`The sheet result needs the far side to be absent. Here the rest of the shell cancels it.`],
        md`The Gaussian sphere through that point encloses no charge, and symmetry says $\vb E$ is radial with the same size on the sphere, so $\vb E=0$ at every point inside. In terms of pieces: the near patch is closer ($1/r^2$ stronger), but the far side subtends the same solid angle with more area; they cancel exactly.`,
        { figHtml: figShell() }),

      Q(md`A point charge $q$ is placed at the centre of the charged shell (charge $Q=4\pi R^2\sigma$ on the shell). What is the field inside the shell, at $r<R$?`,
        [md`$\dfrac{1}{4\pi\ep}\dfrac{q+Q}{r^2}\uv r$`, md`$\dfrac{1}{4\pi\ep}\dfrac{q}{r^2}\uv r$`, md`$0$, because the shell shields its inside`, md`$\dfrac{1}{4\pi\ep}\dfrac{Q}{r^2}\uv r$`], 1,
        [md`The shell's charge is outside a Gaussian sphere with $r<R$.`, null, md`The shell's own field inside is zero, but it does not cancel the field of other charges. (A conductor would be a different story.)`, md`$Q$ is outside the Gaussian sphere; $q$ is inside.`],
        md`Gaussian sphere of radius $r<R$: $\Qenc=q$, so $\vb E=\dfrac{q}{4\pi\ep r^2}\uv r$. Outside, $\Qenc=q+Q$. The shell adds nothing inside; it only changes the field outside.`,
        { figHtml: figShell() }),

      RF(md`
        ### The uniformly charged solid sphere (Lecture 3)
        A ball of radius $R$ with uniform $\rho$. Inside, take a Gaussian sphere of radius $r<R$. The notes: “$E$ is constant over the shell”, “$r$ is constant and we integrate over $\sin\theta\,d\theta\,d\varphi$”:

        $$E\cdot4\pi r^2=\dfrac{\rho\cdot\tfrac43\pi r^3}{\ep}\qquad\Longrightarrow\qquad \vb E=\dfrac{\rho}{3\ep}\,\vb r\qquad(r\le R).$$

        [[fig:s]]

        Write it as a **vector**, $\vb E=\dfrac{\rho}{3\ep}\vb r$, where $\vb r$ is the vector from the centre to the field point. (The notes write $E(r)=\rho\vb r/3\ep$, a scalar equal to a vector; the vector form is what you want, and you will need it for the next example.) Outside, $\Qenc=\tfrac43\pi R^3\rho=q$:

        $$\vb E=\dfrac{\rho R^3}{3\ep r^2}\,\uv r=\dfrac{1}{4\pi\ep}\dfrac{q}{r^2}\,\uv r\qquad(r\ge R).$$

        [[fig:p]]

        The two pieces agree at $r=R$: the field is **continuous**, because there is no surface charge at $r=R$.
      `, { s: { svg: figSolid(true), cap: md`Gaussian sphere of radius $r<R$ inside the uniformly charged ball; $d\vb a$ is radial.` },
        p: { svg: plotSolid(), cap: md`$|\vb E|(r)$ for a uniform ball: linear inside, $1/r^2$ outside, continuous at $R$.` } }),

      Q(md`A student says: “Inside a charged solid sphere the field is zero, just like inside a shell.” What is the correct statement?`,
        [md`It is right for any charged sphere`, md`It is right only at the surface`, md`It is right only for a ball made of conductor, or a shell; inside a uniformly charged insulating ball $E=\rho r/3\ep$`, md`It is wrong: inside the ball the field grows as $1/r^2$ toward the centre`], 2,
        [md`A Gaussian sphere inside a solid ball encloses charge, so $E\ne0$.`, md`At the surface the field is at its largest, $\rho R/3\ep$.`, null, md`The field goes to zero at the centre; it grows linearly with $r$.`],
        md`Zero field inside needs zero enclosed charge (a shell) or a conductor (whose charges rearrange; later in the course). A uniformly charged insulating ball has $\Qenc\propto r^3$, so $E\propto r^3/r^2=r$.`,
        { figHtml: figSolid(true) }),

      Q(md`For the uniform ball, what is $E(R/2)/E(R)$, and what is $E(2R)/E(R)$?`,
        [md`$1/2$ and $1/4$`, md`$1/4$ and $1/4$`, md`$1/2$ and $1/2$`, md`$1/8$ and $1/4$`], 0,
        [null, md`Inside, $E\propto r$, not $r^2$.`, md`Outside, $E\propto1/r^2$.`, md`$1/8$ is the enclosed-charge ratio $(1/2)^3$; divide by $(1/2)^2$ for the area: $1/2$.`],
        md`Inside $E\propto r$: half the radius, half the field. Outside $E\propto1/r^2$: twice the radius, a quarter of the field.`,
        { figHtml: plotSolid() }),

      Q(md`Why is the field of the uniform ball continuous at $r=R$, while the shell's field jumps there?`,
        [md`The ball is a conductor and the shell is not`, md`Both are continuous; the jump in the shell plot is a drawing artefact`, md`The ball's field is not continuous either`, md`The normal component of $\vb E$ jumps by $\sigma/\ep$ at a surface charge. The shell has $\sigma$ at $r=R$; the ball has only volume charge, so $\sigma=0$ there`], 3,
        [md`Both are insulators with fixed charge in this problem.`, md`The shell's jump is real: $0$ inside, $\sigma/\ep$ just outside.`, md`Both formulas give $\rho R/3\ep$ at $r=R$.`, null],
        md`Boundary condition: $E^\perp_{\text{out}}-E^\perp_{\text{in}}=\sigma/\ep$. Volume charge alone never produces a jump (a thin layer of a finite $\rho$ holds a vanishing amount of charge per area). Jumps in $E^\perp$ signal surface charge.`,
        { figHtml: PF.row([{ svg: plotShell(), cap: 'shell' }, { svg: plotSolid(), cap: 'ball' }]).svg }),

      P({
        title: 'A ball with $\\rho=kr$',
        q: md`A ball of radius $R$ carries a charge density proportional to the distance from its centre, $\rho=kr$ (Griffiths 2.14 in the 4th edition). Find the field inside and outside.`,
        figHtml: figSolid(false, md`\rho=kr`),
        hints: [md`Spherical symmetry: Gaussian sphere of radius $r$.`, md`The density is not uniform, so $\Qenc$ is an integral: $\Qenc=\int_0^r\rho(r')\,4\pi r'^2\,dr'$ (thin shells of area $4\pi r'^2$ and thickness $dr'$).`, md`$\Qenc(r)=4\pi k\int_0^r r'^3\,dr'=\pi k r^4$ for $r\le R$.`],
        parts: [
          { lbl: md`$E_r$ inside ($r<R$)`, expr: 'k*r^2/(4*eps0)', vars: { k: [1, 3], r: [0.2, 1], eps0: [0.5, 2] } },
          { lbl: md`$E_r$ outside ($r>R$)`, expr: 'k*R^4/(4*eps0*r^2)', vars: { k: [1, 3], R: [0.5, 1], r: [1.5, 4], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Enclosed charge** (use a prime on the integration variable):
          $$\Qenc(r)=\int_0^r k r'\,4\pi r'^2\,dr'=\pi k r^4\quad(r\le R),\qquad \Qenc=\pi kR^4\quad(r\ge R).$$

          [[fig:s]]

          **Gauss's law**, $E\,4\pi r^2=\Qenc/\ep$:
          $$\vb E=\dfrac{kr^2}{4\ep}\,\uv r\quad(r\le R),\qquad \vb E=\dfrac{kR^4}{4\ep r^2}\,\uv r\quad(r\ge R).$$

          [[fig:p]]

          **Checks.** Continuous at $r=R$ (both give $kR^2/4\ep$). Near the centre $E\propto r^2$, rising more slowly than in a uniform ball, because there is little charge near the centre.

          **What to remember.** Non-uniform density: integrate $\rho$ over thin shells, $dq=\rho\,4\pi r'^2\,dr'$, before using Gauss's law.
        `,
        figs: { s: { svg: figSolid(true, md`\rho=kr`), cap: md`Gaussian sphere of radius $r$; the enclosed charge must be integrated.` },
          p: { svg: plotRhoKr(), cap: md`$|\vb E|(r)$ for $\rho=kr$.` } },
      }),

      P({
        title: 'Where is the field strongest?',
        q: md`A ball of radius $R$ has charge density $\rho=\rho_0\left(1-\dfrac{r}{R}\right)$: largest at the centre, falling to zero at the surface. Find $E_r(r)$ inside, and the radius at which the field is largest.`,
        figHtml: figSolid(false, md`\rho(r)`),
        hints: [md`$\Qenc(r)=\int_0^r\rho_0\left(1-\dfrac{r'}{R}\right)4\pi r'^2\,dr'$.`, md`$\Qenc=4\pi\rho_0\left(\dfrac{r^3}{3}-\dfrac{r^4}{4R}\right)$. Divide by $4\pi\ep r^2$.`, md`Set $dE/dr=0$.`],
        parts: [
          { lbl: md`$E_r$ inside`, expr: '(rho0/eps0)*(r/3 - r^2/(4*R))', vars: { rho0: [1, 3], r: [0.1, 0.9], R: [1, 1.5], eps0: [0.5, 2] }, accepts: ['rho0*r*(4*R-3*r)/(12*eps0*R)'] },
          { lbl: md`$r$ at the maximum, in units of $R$`, ans: 2 / 3 },
        ],
        sol: md`
          $$\Qenc(r)=4\pi\rho_0\int_0^r\left(r'^2-\dfrac{r'^3}{R}\right)dr'=4\pi\rho_0\left(\dfrac{r^3}{3}-\dfrac{r^4}{4R}\right).$$
          $$E_r=\dfrac{\Qenc}{4\pi\ep r^2}=\dfrac{\rho_0}{\ep}\left(\dfrac{r}{3}-\dfrac{r^2}{4R}\right).$$

          $\dfrac{dE_r}{dr}=\dfrac{\rho_0}{\ep}\left(\dfrac13-\dfrac{r}{2R}\right)=0$ at $r=\dfrac{2R}{3}$, where $E_{\max}=\dfrac{\rho_0R}{9\ep}$. At the surface $E=\dfrac{\rho_0R}{12\ep}$, which is smaller.

          **Why the maximum is inside.** Beyond $2R/3$ the extra charge you enclose is too little (the density is dropping to zero) to keep up with the $1/r^2$ spreading. The total charge is $\Qenc(R)=\pi\rho_0R^3/3$, and outside the field is $\dfrac{\rho_0R^3}{12\ep r^2}$.
        `,
      }),

      RF(md`
        ### Lecture 3 example: two overlapping spheres
        Two spheres, each of radius $R$, carry uniform densities $+\rho$ and $-\rho$. They overlap. Call $\vb d$ the vector from the positive centre to the negative centre. What is the field in the overlap region? (Griffiths 2.18 in the 4th edition; the professor: “tell me the steps”.)

        [[fig:s]]
      `, { s: { svg: figOverlap(), cap: md`Uniform spheres of $+\rho$ and $-\rho$, radius $R$, centres separated by $\vb d$. The lens in the middle is the overlap.` } }),

      Q(md`In-class question: how should you approach the overlapping spheres?`,
        [md`Gauss's law with a sphere around the overlap region`, md`Find the field of each sphere separately with Gauss's law, then add them (superposition)`, md`The overlap is neutral, so $\vb E=0$ there; no calculation needed`, md`Integrate Coulomb's law over the lens-shaped overlap`], 1,
        [md`The whole arrangement has no spherical symmetry, so no Gaussian surface makes $|\vb E|$ constant.`, null, md`Neutral charge density does not mean zero field: the field at a point depends on all the charge, not only the charge at that point.`, md`Possible in principle, but a hard integral. Each sphere separately is easy.`],
        md`The combination has no symmetry, but each sphere alone does. Use Gauss's law on each sphere (inside: $\vb E=\rho\vb r/3\ep$), then superpose. This “break it into symmetric pieces” idea is the main way to stretch Gauss's law beyond the three symmetric cases.`,
        { figHtml: figOverlap() }),

      RF(md`
        At a point in the overlap, let $\vb r_+$ be the vector from the $+$ centre to the point and $\vb r_-$ the vector from the $-$ centre. The point is **inside both** spheres, so each contributes its inside field (same formula, with $\rho\to-\rho$ for the second):

        [[fig:s]]

        $$\vb E=\dfrac{\rho}{3\ep}\,\vb r_++\dfrac{(-\rho)}{3\ep}\,\vb r_-=\dfrac{\rho}{3\ep}\left(\vb r_+-\vb r_-\right).$$

        Now $\vb r_+-\vb r_-$: going from the $+$ centre to the point, then back from the point to the $-$ centre, is just the trip from the $+$ centre to the $-$ centre. So $\vb r_+-\vb r_-=\vb d$ and

        $$\boxed{\ \vb E=\dfrac{\rho}{3\ep}\,\vb d\ }\qquad\text{in the whole overlap.}$$

        The field is **uniform**: the same size and direction at every point of the overlap, pointing from the $+$ centre toward the $-$ centre. It only works because the inside field of a uniform ball is linear in $\vb r$, so the position-dependent parts cancel.
      `, { s: { svg: figOverlap(true), cap: md`At a point in the overlap, $\vb r_+-\vb r_-=\vb d$. The field there (arrows) is uniform and parallel to $\vb d$.` } }),

      Q(md`Which way does the field in the overlap point?`,
        [md`From the $-$ centre toward the $+$ centre`, md`Radially away from the middle of the overlap`, md`Perpendicular to $\vb d$`, md`Along $\vb d$, from the $+$ centre toward the $-$ centre`], 3,
        [md`The field runs from positive to negative charge, and $\vb E=\rho\vb d/3\ep$ with $\vb d$ from $+$ to $-$.`, md`It is uniform; it has no radial pattern.`, md`$\vb E$ is a positive multiple of $\vb d$.`, null],
        md`$\vb E=\dfrac{\rho}{3\ep}\vb d$ and $\vb d$ points from the $+$ centre to the $-$ centre. Field lines run from the positive sphere to the negative one, as you would guess.`,
        { figHtml: figOverlap() }),

      Q(md`In the overlap the two densities cancel: the net charge density there is zero. Why is the field not zero?`,
        [md`Because the formula is only approximate`, md`It is zero; the overlap has no charge`, md`The field at a point depends on all the charge everywhere, not just on the charge density at that point; the parts outside the overlap are not neutral`, md`Because $\nabla\cdot\vb E\ne0$ in the overlap`], 2,
        [md`The result is exact.`, md`Neutral locally does not mean field-free.`, null, md`In the overlap $\rho=0$, so $\nabla\cdot\vb E=0$, consistent with a uniform field. Zero divergence still allows a nonzero field.`],
        md`$\rho=0$ in the overlap tells you $\nabla\cdot\vb E=0$ there, which a uniform field satisfies. The field itself comes from the uncancelled crescents of $+$ and $-$ charge on either side. Same idea as the capacitor gap in Lecture 3: $\vb E\ne0$ but $\rho=0$.`,
        { figHtml: figOverlap() }),

      P({
        title: 'Field inside an off-centre cavity',
        q: md`A ball of radius $R$ carries uniform charge density $\rho$, except inside a spherical cavity of radius $b$ that is empty. The centre of the cavity is displaced from the centre of the ball by the vector $\vb a$. Find the field inside the cavity.`,
        figHtml: figCavity(),
        hints: [md`Fill the hole: ball with cavity $=$ full ball of $+\rho$ $+$ small ball of $-\rho$ in the cavity.`, md`At a point in the cavity, use the inside formula $\rho\vb r/3\ep$ for both balls, with each $\vb r$ measured from that ball's own centre.`, md`If $\vb r$ is measured from the big centre, the vector from the cavity centre is $\vb r-\vb a$.`],
        parts: [
          { lbl: md`The field in the cavity is`, mc: [md`zero, because there is no charge in the cavity`, md`uniform, parallel to $\vb a$`, md`radial from the cavity centre`, md`radial from the ball's centre`], a: 1,
            why: [md`An empty region inside charge is not field-free unless the surroundings are symmetric about it.`, null, md`The small negative ball alone would give that; adding the big ball's field cancels the position dependence.`, md`The big ball alone would give that; adding the negative ball cancels the position dependence.`] },
          { lbl: md`$|\vb E|$ in the cavity`, expr: 'rho*a/(3*eps0)', vars: { rho: [1, 3], a: [0.5, 2], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Superposition.** Ball with cavity $=$ full ball ($+\rho$, centre at the origin) $+$ cavity-sized ball ($-\rho$, centre at $\vb a$). At a point $\vb r$ in the cavity, both balls contain the point, so both give their inside fields:
          $$\vb E=\dfrac{\rho}{3\ep}\,\vb r+\dfrac{(-\rho)}{3\ep}\,(\vb r-\vb a)=\dfrac{\rho}{3\ep}\,\vb a .$$

          [[fig:s]]

          The field in the cavity is uniform, of magnitude $\dfrac{\rho a}{3\ep}$, pointing along $\vb a$ (from the ball's centre toward the cavity's centre). This is the overlapping-spheres result again: there $\vb d$ pointed from the $+$ centre to the $-$ centre; here the “negative sphere” is the cavity at $\vb a$.

          **Check.** If the cavity is concentric ($\vb a=0$), the field in it is zero, as it must be by spherical symmetry (a Gaussian sphere inside the cavity encloses nothing).
        `,
        figs: { s: { svg: figCavity(true), cap: md`The field in the cavity is uniform and parallel to $\vb a$.` } },
      }),

      RF(md`
        !!key Patterns to remember
          - Spherical symmetry: $\vb E=\dfrac{\Qenc(r)}{4\pi\ep r^2}\uv r$. Outside: point charge. Charge at larger $r$ does nothing.
          - Shell: $0$ inside, $q/4\pi\ep r^2$ outside; $E_r$ jumps by $\sigma/\ep$ at the shell.
          - Uniform ball: $\vb E=\dfrac{\rho}{3\ep}\vb r$ inside (vector form), continuous at $R$.
          - Non-uniform $\rho(r)$: $\Qenc=\int_0^r\rho\,4\pi r'^2\,dr'$.
          - No symmetry overall but symmetric pieces: Gauss on each piece, then superpose. Overlap of $\pm\rho$ balls, or a cavity: uniform field $\dfrac{\rho}{3\ep}\vb d$.
          - Jumps in $E^\perp$ mean surface charge: $E^\perp_{\text{out}}-E^\perp_{\text{in}}=\sigma/\ep$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 6 — Gauss's law: cylinders and planes (Lecture 2 p5; Griffiths 2.2.3)
  // =====================================================================================
  const L6 = {
    id: 'u1-gauss-cyl', title: "Gauss's law: cylinders and planes",
    steps: [
      RF(md`
        ### Lecture 2 example: an infinite line of charge
        An infinitely long straight line carries charge $\lambda$ per unit length. By symmetry $\vb E$ points straight away from the line and its size depends only on the distance from the line. (The lecture calls that distance $r$ with unit vector $\uv r$; Griffiths and the homework call it $s$ with $\uv s$, the cylindrical radial coordinate. Same thing.)

        [[fig:s]]

        The professor's question: what Gaussian surface should you use?
      `, { s: { svg: figLineCyl(), cap: md`An infinite line with uniform charge $\lambda$ per unit length.` } }),

      Q(md`In-class question: what surface should you use for the infinite line?`,
        [md`A sphere centred on the line`, md`A cube around a piece of the line`, md`A flat disk pierced by the line`, md`A cylinder of radius $s$ and length $l$, coaxial with the line`], 3,
        [md`On a sphere, $\vb E$ (perpendicular to the line) is not along $d\vb a$ except on the equator.`, md`On a cube the angle between $\vb E$ and $d\vb a$ and the size of $E$ vary over each face.`, md`A disk is not a closed surface; Gauss's law needs a closed one.`, null],
        md`On the curved side of a coaxial cylinder, $\vb E$ is parallel to $d\vb a$ and has the same size everywhere (all points are a distance $s$ from the line). On the two flat ends, $\vb E$ lies in the end face, so $\vb E\cdot d\vb a=0$. Both conditions for pulling $E$ out of the integral hold.`,
        { figHtml: figLineCyl() }),

      P({
        id: 'HW1-2.13', src: 'HW 1 · Griffiths 2.13', title: 'Infinite straight wire', big: true,
        q: md`Find the electric field a distance $s$ from an infinitely long straight wire that carries a uniform line charge $\lambda$. Compare Eq. 2.9.

        (Eq. 2.9 is the $L\to\infty$ limit of the finite-segment result: $\vb E=\kq\dfrac{2\lambda}{z}$.)`,
        figHtml: figLineCyl(false, { P: true }),
        hints: [
          md`Cylindrical symmetry: $\vb E=E(s)\,\uv s$. Use a Gaussian cylinder of radius $s$ and length $l$, coaxial with the wire.`,
          md`Which parts of the cylinder carry flux? On the ends, $\vb E$ lies in the face. On the curved side, $\vb E\parallel d\vb a$ and $E$ is constant.`,
          md`Flux $=E\cdot2\pi s\,l$. Enclosed charge $=\lambda l$.`,
        ],
        parts: [
          { lbl: 'E_s', expr: 'lambda/(2*pi*eps0*s)', vars: { lambda: [1, 3], s: [0.5, 3], eps0: [0.5, 2] }, accepts: ['2*lambda/(4*pi*eps0*s)'] },
          { lbl: md`Compared with Eq. 2.9 (the $L\to\infty$ limit of the segment):`, mc: [md`It is the same field`, md`It is twice Eq. 2.9`, md`It is half of Eq. 2.9`, md`They cannot be compared: one is from Coulomb, one from Gauss`], a: 0,
            why: [null, md`Write both out: $\kq\dfrac{2\lambda}{z}=\dfrac{\lambda}{2\pi\ep z}$. They agree.`, md`Write both out: $\kq\dfrac{2\lambda}{z}=\dfrac{\lambda}{2\pi\ep z}$. They agree.`, md`Gauss's law is a consequence of Coulomb's law; both must give the same field.`] },
          { lbl: md`Why do the end caps of the Gaussian cylinder carry no flux?`, mc: [md`Because they are far from the wire`, md`Because $\vb E$ is zero on them`, md`Because $\vb E$ is perpendicular to $d\vb a$ there ($\vb E$ lies in the cap)`, md`Because their flux cancels the flux of the curved side`], a: 2,
            why: [md`They are at the same distance range as the curved side; distance is not the reason.`, md`$\vb E$ is not zero on the caps; it is radial, lying in the plane of each cap.`, null, md`The caps carry exactly zero flux; they do not cancel anything.`] },
        ],
        sol: md`
          **Symmetry.** An infinite uniform line looks the same after sliding along it, rotating around it, or flipping it end for end. So $\vb E$ points radially away from the line and depends only on $s$: $\vb E=E(s)\,\uv s$.

          **Gaussian surface.** A cylinder of radius $s$ and length $l$, coaxial with the wire (Lecture 2):

          [[fig:s]]

          - Curved side: $d\vb a=\uv s\,da$, parallel to $\vb E$, and $E(s)$ is constant on it. Flux $=E\cdot2\pi s\,l$.
          - End caps: $d\vb a=\pm\uv z\,da$, perpendicular to $\vb E$. Flux $=0$.

          **Enclosed charge.** $\Qenc=\lambda l$.

          $$E\cdot2\pi s\,l=\dfrac{\lambda l}{\ep}\qquad\Longrightarrow\qquad \vb E=\dfrac{\lambda}{2\pi\ep s}\,\uv s .$$

          **Compare Eq. 2.9.** The finite segment of length $2L$ gave $\kq\dfrac{2\lambda L}{z\sqrt{z^2+L^2}}$, which for $L\to\infty$ becomes $\kq\dfrac{2\lambda}{z}=\dfrac{\lambda}{2\pi\ep z}$. Same field, with $z\leftrightarrow s$. The Coulomb integral took a trig substitution; Gauss's law took one line, because symmetry told us the field's direction and dependence in advance.

          **What to remember.** Line: $E\propto1/s$. The length $l$ of the Gaussian cylinder always cancels; it is a bookkeeping device.
        `,
        figs: { s: { svg: figLineCyl(true), cap: md`Gaussian cylinder: on the curved side $\vb E\parallel d\vb a$; on the end caps $\vb E\perp d\vb a$.` } },
      }),

      Q(md`The Gauss's-law argument needs the line to be infinitely long. What goes wrong for a finite rod?`,
        [md`Gauss's law is false for finite rods`, md`The enclosed charge is no longer $\lambda l$`, md`Near the ends $\vb E$ is not perpendicular to the rod and its size varies along the cylinder, so $E$ cannot come out of the integral`, md`Nothing; the result is exact for any length`], 2,
        [md`Gauss's law always holds; it just stops being enough to find $\vb E$.`, md`The enclosed charge is still $\lambda l$ for a cylinder around part of the rod.`, null, md`For a finite rod you got a different, exact answer by integration: $\kq\dfrac{2\lambda L}{z\sqrt{z^2+L^2}}$.`],
        md`Without translation symmetry along the line, $\vb E$ tilts near the ends and its size changes along the rod. The flux through the Gaussian cylinder is still $\lambda l/\ep$, but it no longer equals $E\cdot2\pi sl$. Near the middle of a long rod ($s\ll L$) the infinite-line result is a good approximation.`,
        { figHtml: figSegBis() }),

      Q(md`A long solid cylinder of radius $R$ carries charge $\lambda$ per unit length, spread through its volume (any $\rho(s)$). What is the field outside it, at $s>R$?`,
        [md`It depends on how $\rho$ varies with $s$`, md`$\dfrac{\lambda}{2\pi\ep s}$, the same as a line`, md`$\dfrac{\lambda}{2\pi\ep R}$, constant outside`, md`$\dfrac{\lambda R}{2\pi\ep s^2}$`], 1,
        [md`Outside, the Gaussian cylinder encloses the whole $\lambda l$ whatever the profile.`, null, md`Outside, the field keeps falling as $1/s$.`, md`A line-like charge gives $1/s$, not $1/s^2$.`],
        md`Gaussian cylinder of radius $s>R$: $E\cdot2\pi sl=\lambda l/\ep$. From outside, any cylindrically symmetric charge looks like a line on the axis, just as any spherically symmetric charge looks like a point.`,
        { figHtml: figLineCyl(false, { rod: true }) }),

      Q(md`A long, thin cylindrical shell of radius $R$ carries uniform surface charge $\sigma$ (cross-section shown). What is the field inside it, at $s<R$?`,
        [md`$0$`, md`$\dfrac{\sigma}{2\ep}$`, md`$\dfrac{\sigma R}{\ep s}$`, md`$\dfrac{\sigma}{\ep}$`], 0,
        [null, md`That is the infinite-plane value. Inside the shell a coaxial Gaussian cylinder encloses nothing.`, md`That is the field **outside** ($s>R$): $E\cdot2\pi sl=\sigma\,2\pi Rl/\ep$.`, md`That is the value just outside the shell, at $s=R$.`],
        md`A coaxial Gaussian cylinder with $s<R$ encloses no charge, and symmetry makes $E$ the same over its curved side, so $E=0$. Outside, $E=\dfrac{\sigma R}{\ep s}$. At $s=R$ the field jumps from $0$ to $\sigma/\ep$: the boundary condition again. This is the cylindrical twin of the spherical shell.`,
        { figHtml: figShell() }),

      P({
        title: 'A cylinder with $\\rho=ks$',
        q: md`A long cylinder of radius $R$ carries a charge density proportional to the distance from its axis, $\rho=ks$ (Griffiths Ex. 2.4). Find the field inside and outside.`,
        figHtml: figLineCyl(false, { rod: true }),
        hints: [md`Gaussian cylinder of radius $s$ and length $l$. The flux is $E\cdot2\pi sl$.`, md`$\rho$ is not uniform: integrate over thin cylindrical shells, $dq=\rho\,(2\pi s'\,l)\,ds'$.`, md`$\Qenc=\int_0^s ks'\,2\pi s' l\,ds'=\dfrac23\pi k l s^3$ for $s\le R$.`],
        parts: [
          { lbl: md`$E_s$ inside ($s<R$)`, expr: 'k*s^2/(3*eps0)', vars: { k: [1, 3], s: [0.2, 1], eps0: [0.5, 2] } },
          { lbl: md`$E_s$ outside ($s>R$)`, expr: 'k*R^3/(3*eps0*s)', vars: { k: [1, 3], R: [0.5, 1], s: [1.5, 4], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Enclosed charge** in a Gaussian cylinder of radius $s$ and length $l$ (cylindrical volume element $s'\,ds'\,d\varphi\,dz$):
          $$\Qenc=\int_0^s ks'\,(2\pi s'\,l)\,ds'=\dfrac{2}{3}\pi k l s^3\quad(s\le R),\qquad \Qenc=\dfrac23\pi klR^3\quad(s\ge R).$$

          [[fig:s]]

          **Gauss's law**, $E\cdot2\pi sl=\Qenc/\ep$:
          $$\vb E=\dfrac{ks^2}{3\ep}\,\uv s\quad(s\le R),\qquad \vb E=\dfrac{kR^3}{3\ep s}\,\uv s\quad(s\ge R).$$

          **Checks.** Continuous at $s=R$. Outside, it is the field of a line with $\lambda=\tfrac23\pi kR^3$ (the charge per unit length of the cylinder).
        `,
        figs: { s: { svg: figLineCyl(true, { rod: true }), cap: md`Gaussian cylinder of radius $s$ inside the charged cylinder.` } },
      }),

      P({
        id: 'D1-2.17', src: 'Discussion 1 · Griffiths 2.17', title: 'Coaxial cable', big: true,
        q: md`A long coaxial cable (Fig. 2.26) carries a uniform volume charge density $\rho$ on the inner cylinder (radius $a$), and a uniform surface charge density on the outer cylindrical shell (radius $b$). This surface charge is negative and is of just the right magnitude that the cable as a whole is electrically neutral. Find the electric field in each of the three regions: (i) inside the inner cylinder ($s<a$), (ii) between the cylinders ($a<s<b$), (iii) outside the cable ($s>b$). Plot $|\vb E|$ as a function of $s$.

        [[fig:setup]]`,
        hints: [
          md`Cylindrical symmetry in all three regions: one coaxial Gaussian cylinder of radius $s$ and length $l$ per region. The flux is always $E\cdot2\pi sl$; only $\Qenc$ changes.`,
          md`(i) $\Qenc=\rho\,\pi s^2l$. (ii) $\Qenc=\rho\,\pi a^2l$, the whole inner cylinder.`,
          md`(iii) The cable is neutral, so $\Qenc=0$. The outer surface charge must be $\sigma=-\dfrac{\rho\pi a^2}{2\pi b}$ (charge per length divided by circumference).`,
        ],
        parts: [
          { lbl: md`(i) $E_s$ for $s<a$`, expr: 'rho*s/(2*eps0)', vars: { rho: [1, 3], s: [0.1, 0.9], eps0: [0.5, 2] } },
          { lbl: md`(ii) $E_s$ for $a<s<b$`, expr: 'rho*a^2/(2*eps0*s)', vars: { rho: [1, 3], a: [0.5, 1], s: [1.2, 3], eps0: [0.5, 2] } },
          { lbl: md`(iii) For $s>b$:`, mc: [md`$\vb E=\dfrac{\rho a^2}{2\ep s}\uv s$, the same as region (ii)`, md`$\vb E=0$`, md`$\vb E=-\dfrac{\rho a^2}{2\ep s}\uv s$`, md`$\vb E=\dfrac{\rho a^2}{2\ep b}\uv s$, constant`], a: 1,
            why: [md`The outer shell's negative charge is inside a Gaussian cylinder with $s>b$ too.`, null, md`The outer charge cancels the inner one exactly; it does not overshoot.`, md`Outside, $\Qenc=0$, so there is no field at all.`] },
          { lbl: md`Surface charge density on the outer shell, $\sigma$`, expr: '-rho*a^2/(2*b)', vars: { rho: [1, 3], a: [0.5, 1], b: [1.5, 3] } },
        ],
        sol: md`
          **Symmetry.** Everything is cylindrically symmetric and long, so $\vb E=E(s)\,\uv s$. In each region use a coaxial Gaussian cylinder of radius $s$ and length $l$. Flux $=E\cdot2\pi sl$ (the ends carry none).

          [[fig:s]]

          **(i) $s<a$.** $\Qenc=\rho\,\pi s^2 l$:
          $$E\cdot2\pi sl=\dfrac{\rho\pi s^2l}{\ep}\quad\Longrightarrow\quad \vb E=\dfrac{\rho s}{2\ep}\,\uv s .$$

          **(ii) $a<s<b$.** $\Qenc=\rho\,\pi a^2 l$ (all of the inner cylinder):
          $$\vb E=\dfrac{\rho a^2}{2\ep s}\,\uv s .$$

          **(iii) $s>b$.** The cable is neutral, so $\Qenc=0$ and $\vb E=0$.

          **The outer surface charge.** Neutrality per length $l$: $\rho\pi a^2l+\sigma\,2\pi bl=0$, so $\sigma=-\dfrac{\rho a^2}{2b}$.

          **Boundary checks.** At $s=a$: both (i) and (ii) give $\rho a/2\ep$, continuous (no surface charge at $s=a$). At $s=b$: the field drops from $\dfrac{\rho a^2}{2\ep b}$ to $0$. The jump, $-\dfrac{\rho a^2}{2\ep b}$, equals $\sigma/\ep$, exactly the surface-charge boundary condition $E^\perp_{\text{out}}-E^\perp_{\text{in}}=\sigma/\ep$.

          [[fig:p]]

          **What to remember.** Several regions, one Gaussian surface per region, same flux formula; only $\Qenc$ changes. This is why a coaxial cable's field stays inside it.
        `,
        figs: {
          setup: { svg: PF.row([{ svg: figCoaxSide(), cap: 'side view' }, { svg: figCoax(), cap: 'cross-section' }]).svg, cap: md`Inner cylinder of radius $a$ with uniform $\rho$; outer thin shell of radius $b$ with negative surface charge.` },
          s: { svg: figCoax(true), cap: md`Gaussian cylinders (seen end-on) in the three regions.` },
          p: { svg: plotCoax(), cap: md`$|\vb E|(s)$: linear inside, $1/s$ between the conductors, zero outside; the drop at $s=b$ is the outer surface charge.` },
        },
      }),

      Q(md`Why is the field outside the neutral coaxial cable zero, even though it contains charges?`,
        [md`The outer shell is a conductor and blocks the field`, md`Any Gaussian cylinder outside encloses zero net charge, and by symmetry $E$ is the same all over its curved side, so $E\cdot2\pi sl=0$`, md`The field is not zero, only very weak`, md`The charges cancel only far away; near the cable the field is nonzero`], 1,
        [md`Nothing in the problem is a conductor; the result follows from Gauss's law and symmetry alone.`, null, md`Gauss's law with $\Qenc=0$ and cylindrical symmetry gives exactly zero.`, md`The cancellation is exact at every $s>b$, not only far away.`],
        md`Zero flux alone would not imply zero field. It is zero flux **plus** symmetry ($\vb E=E(s)\uv s$, same size on the whole curved side) that forces $E=0$. A neutral but lopsided object would still have a field outside.`,
        { figHtml: figCoax() }),

      RF(md`
        ### The infinite plane: a pillbox
        An infinite plane carries uniform surface charge $\sigma$. By symmetry $\vb E$ is normal to the plane, points away from it on both sides (for $\sigma>0$), and has the same size at equal distances above and below. Use a **pillbox**: a short cylinder that straddles the plane, with lids of area $A$ parallel to it.

        [[fig:s]]

        The lids carry flux $EA$ each; the curved side carries none ($\vb E\perp d\vb a$). $\Qenc=\sigma A$:

        $$2AE=\dfrac{\sigma A}{\ep}\qquad\Longrightarrow\qquad \vb E=\dfrac{\sigma}{2\ep}\,\uv n,$$

        with $\uv n$ pointing away from the plane on each side (Griffiths Ex. 2.5). This is the $R\to\infty$ limit of the disk, obtained in one line.

        !!key Boundary condition at a charged surface
          Make the pillbox flatter and flatter until its height is zero. The side no longer carries flux, whatever the field does, and only the charge **on** the surface is enclosed. Gauss's law then gives, for **any** charged surface (close up, every surface looks flat):
          $$E^\perp_{\text{above}}-E^\perp_{\text{below}}=\dfrac{\sigma}{\ep}.$$
          The normal component jumps by $\sigma/\ep$. (The tangential component is continuous; that comes from $\curl\vb E=0$, in the last lesson of this unit.) This condition is the bridge to the boundary-value problems later in the course.
      `, { s: { svg: figPlane(true), cap: md`Gaussian pillbox straddling the plane. Flux leaves through both lids.` } }),

      Q(md`An infinite charged plane: how does the field at $1\ \text{m}$ from it compare with the field at $100\ \text{m}$?`,
        [md`They are equal`, md`The field at $100\ \text{m}$ is $10^4$ times weaker`, md`The field at $100\ \text{m}$ is $100$ times weaker`, md`The field at $100\ \text{m}$ is zero`], 0,
        [null, md`That is the point-charge law. For an infinite plane the pillbox gives $\sigma/2\ep$ at any distance.`, md`That is the line-charge law.`, md`An infinite plane's field never dies off.`],
        md`$E=\sigma/2\ep$, independent of distance: the pillbox calculation never involved the height of the lids. For a real finite sheet this holds only at distances small compared with its size.`,
        { figHtml: figPlane() }),

      Q(md`Just above a thin charged surface the field is $5E_0$, pointing away from the surface (along $\uv n$). Just below, the field is $2E_0$, also along $\uv n$ (it points toward the surface from below). What is the surface charge density there?`,
        [md`$7\ep E_0$`, md`$3\ep E_0/2$`, md`$-3\ep E_0$`, md`$3\ep E_0$`], 3,
        [md`$E^\perp_{\text{below}}$ is $+2E_0$ (it points along $+\uv n$), so you subtract it.`, md`No factor of $1/2$: the jump itself is $\sigma/\ep$.`, md`The field above is larger in the $+\uv n$ direction, so $\sigma$ is positive.`, null],
        md`$\sigma=\ep\left(E^\perp_{\text{above}}-E^\perp_{\text{below}}\right)=\ep(5E_0-2E_0)=3\ep E_0$. Of the fields, $\pm\tfrac32E_0$ is the surface's own contribution; the remaining $\tfrac72E_0$ (the same on both sides) comes from other charges.`,
        { figHtml: figSheetBC({ above: 1.25, below: 0.5, la: md`5E_0`, lb: md`2E_0` }) }),

      Q(md`A charged sheet ($\sigma>0$) sits in an external uniform field $E_0$ along its normal $\uv n$. Just above, the total normal field is $E_0+\sigma/2\ep$. What is it just below?`,
        [md`$E_0+\sigma/2\ep$`, md`$E_0-\sigma/2\ep$`, md`$-E_0-\sigma/2\ep$`, md`$E_0$`], 1,
        [md`The sheet's own field reverses across it: $+\sigma/2\ep$ above, $-\sigma/2\ep$ below.`, null, md`The external field does not reverse; only the sheet's own contribution does.`, md`The sheet still contributes below it.`],
        md`Superpose: the external field is $E_0$ on both sides; the sheet adds $+\sigma/2\ep$ above and $-\sigma/2\ep$ below. The difference is still $\sigma/\ep$: the jump in $E^\perp$ depends only on the local surface charge, never on outside sources.`,
        { figHtml: figSheetBC({ above: 1.4, below: 0, la: md`E_0+\sigma/2\varepsilon_0`, lb: md`?` }) }),

      Q(md`On a pillbox that straddles a charged plane, why is it safe to say the curved side carries no flux?`,
        [md`Because the side is short`, md`Because $\vb E$ is perpendicular to the plane, so it is parallel to the side: $\vb E\cdot d\vb a=0$ there`, md`Because there is no field at the plane`, md`Because the flux through the side cancels the lids`], 1,
        [md`Shortness matters for the boundary-condition argument with a general field. For the infinite plane the side flux is exactly zero at any height.`, null, md`There is a field on both sides of the plane.`, md`The side carries exactly zero; it cancels nothing.`],
        md`By symmetry $\vb E$ is normal to an infinite plane, so it runs along the side wall of the pillbox and $\vb E\cdot d\vb a=0$ on it. Only the lids carry flux, each $EA$, and both are outward.`,
        { figHtml: figPlane(true) }),

      RF(md`
        ### Two parallel planes (Griffiths Ex. 2.6)
        Superpose two infinite planes. Each one contributes $\sigma/2\ep$ pointing away from it (if positive) or toward it (if negative), in **every** region.

        [[fig:s]]

        With $+\sigma$ on the left and $-\sigma$ on the right: in region (ii) both fields point right and add to $\sigma/\ep$; in regions (i) and (iii) they point in opposite directions and cancel. That is the ideal parallel-plate capacitor: a uniform field $\sigma/\ep$ between the plates, nothing outside.
      `, { s: { svg: figTwoPlanes(), cap: md`Two infinite planes with $+\sigma$ and $-\sigma$, edge on; three regions.` } }),

      Q(md`Both planes carry $+\sigma$. What is the field in each region?`,
        [md`$\sigma/\ep$ between, $0$ outside`, md`$\sigma/\ep$ in all three regions`, md`$0$ everywhere`, md`$0$ between; $\sigma/\ep$ outside, pointing away from the pair`], 3,
        [md`That is the $\pm\sigma$ arrangement. With equal signs the inner fields oppose each other.`, md`Between the planes the two fields point in opposite directions.`, md`Outside, both fields point the same way (away from both planes).`, null],
        md`Between them, each plane pushes away from itself: opposite directions, they cancel. Outside, both push outward the same way: $\sigma/2\ep+\sigma/2\ep=\sigma/\ep$.`,
        { figHtml: figTwoPlanes(md`+\sigma`, md`+\sigma`) }),

      Q(md`The left plane carries $+3\sigma$ and the right plane $-\sigma$. What is the field between them?`,
        [md`$\sigma/\ep$`, md`$2\sigma/\ep$, pointing toward the right plane`, md`$3\sigma/2\ep$`, md`$4\sigma/\ep$`], 1,
        [md`That is the outside field. Between them both contributions point right and add: $\tfrac{3\sigma}{2\ep}+\tfrac{\sigma}{2\ep}$.`, null, md`That is only the left plane's contribution.`, md`Each plane contributes half its density over $\ep$, not the full density.`],
        md`Between: $\dfrac{3\sigma}{2\ep}$ (away from the left plane, so rightward) $+\dfrac{\sigma}{2\ep}$ (toward the negative right plane, also rightward) $=\dfrac{2\sigma}{\ep}$. Outside on either side: $\dfrac{3\sigma}{2\ep}-\dfrac{\sigma}{2\ep}=\dfrac{\sigma}{\ep}$, pointing away from the pair. Check the boundary condition at the left plane: $2\sigma/\ep-(-\sigma/\ep)=3\sigma/\ep$. Good.`,
        { figHtml: figTwoPlanes(md`+3\sigma`, md`-\sigma`) }),

      P({
        title: 'A uniformly charged slab',
        q: md`An infinite slab of thickness $2d$ (between $y=-d$ and $y=d$) carries uniform volume charge density $\rho$. Find $E_y$ inside the slab and above it, and plot $E_y(y)$, counting $E_y$ positive when the field points along $+y$.`,
        figHtml: figSlab(),
        hints: [
          md`Planar symmetry: $\vb E=E_y(y)\,\uv y$, and the mid-plane $y=0$ is a mirror plane, so $E_y(-y)=-E_y(y)$ and $E_y(0)=0$.`,
          md`Use a pillbox (or a box) of face area $A$ that is symmetric about $y=0$, with faces at $\pm y$. Both faces carry outward flux $|E|A$.`,
          md`Inside ($|y|<d$): $\Qenc=\rho A\cdot2y$. Outside: $\Qenc=\rho A\cdot2d$.`,
        ],
        parts: [
          { lbl: md`$E_y$ inside, $0<y<d$`, expr: 'rho*y/eps0', vars: { rho: [1, 3], y: [0.1, 1], eps0: [0.5, 2] } },
          { lbl: md`$E_y$ above the slab, $y>d$`, expr: 'rho*d/eps0', vars: { rho: [1, 3], d: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`Below the slab ($y<-d$), $E_y$ is`, mc: [md`$-\rho d/\ep$ (pointing down)`, md`$+\rho d/\ep$`, md`$0$`, md`$-\rho y/\ep$`], a: 0,
            why: [null, md`Below a positive slab the field points away from it, which is $-\uv y$.`, md`The slab's charge is enclosed by any symmetric box that reaches below it.`, md`Outside, the field does not grow with distance: $\Qenc$ stops growing at $|y|=d$.`] },
        ],
        sol: md`
          **Symmetry.** The slab is unchanged by sliding in $x$ or $z$, so $\vb E=E_y(y)\,\uv y$. It is also unchanged by the reflection $y\to-y$, so $E_y(-y)=-E_y(y)$: the field points away from the mid-plane on both sides (for $\rho>0$), and $E_y(0)=0$.

          **Gaussian box** of face area $A$, symmetric about $y=0$, with faces at $\pm y$. The flux leaves through both faces: $2A|E_y(y)|$. The sides carry none.

          [[fig:in]]

          **Inside ($0<y<d$).** $\Qenc=\rho\cdot A\cdot2y$:
          $$2AE_y=\dfrac{2\rho Ay}{\ep}\quad\Longrightarrow\quad E_y=\dfrac{\rho y}{\ep}.$$

          **Outside ($y>d$).** $\Qenc=\rho\cdot A\cdot2d$:

          [[fig:out]]

          $$E_y=\dfrac{\rho d}{\ep}\quad(y>d),\qquad E_y=-\dfrac{\rho d}{\ep}\quad(y<-d).$$

          [[fig:p]]

          **Checks.** Continuous at $y=\pm d$ (no surface charge). Outside, the slab looks like a sheet with $\sigma=2\rho d$: $\sigma/2\ep=\rho d/\ep$. Good.

          **What to remember.** For planar problems, centre the pillbox on the symmetry plane so both faces have the same $|E|$. A pillbox with one face at $y=0$ would need $E(0)$, which you know only from symmetry.
        `,
        figs: { in: { svg: figSlab('in'), cap: md`Gaussian box with faces at $\pm y$ inside the slab.` },
          out: { svg: figSlab('out'), cap: md`Gaussian box with faces outside the slab ($|y|>d$).` },
          p: { svg: plotSlab(), cap: md`$E_y(y)$: linear through the slab, constant outside.` } },
      }),

      P({
        title: 'A non-uniform slab',
        q: md`Same slab ($-d<y<d$), but now the density is $\rho=\rho_0\,y^2/d^2$. Find $E_y$ inside ($0<y<d$) and above the slab.`,
        figHtml: figSlab(false, { lab: md`\rho(y)` }),
        hints: [md`Same symmetric box with faces at $\pm y$. Now $\Qenc=A\displaystyle\int_{-y}^{y}\rho(y')\,dy'$.`, md`$\displaystyle\int_{-y}^{y}\rho_0\dfrac{y'^2}{d^2}dy'=\dfrac{2\rho_0y^3}{3d^2}$.`],
        parts: [
          { lbl: md`$E_y$ inside, $0<y<d$`, expr: 'rho0*y^3/(3*eps0*d^2)', vars: { rho0: [1, 3], y: [0.1, 1], d: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`$E_y$ above, $y>d$`, expr: 'rho0*d/(3*eps0)', vars: { rho0: [1, 3], d: [0.5, 2], eps0: [0.5, 2] } },
        ],
        sol: md`
          The density is even in $y$, so the symmetry argument is unchanged: $E_y$ is odd and the symmetric box works.
          $$2AE_y=\dfrac{A}{\ep}\int_{-y}^{y}\rho_0\dfrac{y'^2}{d^2}\,dy'=\dfrac{A}{\ep}\cdot\dfrac{2\rho_0y^3}{3d^2}\qquad\Longrightarrow\qquad E_y=\dfrac{\rho_0y^3}{3\ep d^2}\quad(0<y<d).$$
          Outside, $\Qenc$ stops growing at $y=d$: $E_y=\dfrac{\rho_0d}{3\ep}$.

          **Check.** Continuous at $y=d$. The total charge per area is $\int_{-d}^{d}\rho\,dy=\tfrac23\rho_0d$, so outside it acts like a sheet with $\sigma=\tfrac23\rho_0d$: $\sigma/2\ep=\rho_0d/3\ep$. Good.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Line or cylinder: coaxial Gaussian cylinder; ends carry no flux; $E\cdot2\pi sl=\Qenc/\ep$. Line: $\dfrac{\lambda}{2\pi\ep s}$.
          - Plane: pillbox straddling it; sides carry no flux; $\sigma/2\ep$, independent of distance.
          - Superpose planes region by region. $\pm\sigma$: $\sigma/\ep$ between, $0$ outside.
          - Slab: box symmetric about the mid-plane; linear inside, constant outside.
          - Several regions: one Gaussian surface per region; only $\Qenc$ changes.
          - Across a charged surface: $E^\perp_{\text{above}}-E^\perp_{\text{below}}=\sigma/\ep$; with only volume charge, $\vb E$ is continuous.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 7 — Gauss's law in differential form (Lecture 2 p5–8, Lecture 3 p1, p3; Griffiths 2.2.1–2.2.2)
  // =====================================================================================
  const L7 = {
    id: 'u1-div', title: "Gauss's law in differential form",
    steps: [
      RF(md`
        ### From the integral form to a local law
        The divergence theorem turns a flux through a closed surface into a volume integral over the region it bounds:

        $$\oint_S\vb v\cdot d\vb a=\int_V(\divg\vb v)\,d\tau .$$

        Apply it to Gauss's law:

        $$\oint_S\vb E\cdot d\vb a=\int_V(\divg\vb E)\,d\tau=\dfrac{\Qenc}{\ep}.$$

        Lecture 2 then asks how the enclosed charge is related to the charge density. Answer that first.
      `),

      Q(md`In-class question: how is the total charge inside a volume $V$ related to the charge density?`,
        [md`$\Qenc=\rho V$ always`, md`$\Qenc=\displaystyle\int_V\rho\,d\tau$`, md`$\Qenc=\displaystyle\oint_S\rho\,da$`, md`$\Qenc=\ep\displaystyle\int_V\rho\,d\tau$`], 1,
        [md`Only if $\rho$ is uniform. In general you add up $\rho\,d\tau$ over the volume.`, null, md`$\rho$ is charge per volume; integrating it over a surface does not give a charge.`, md`$\ep$ appears in Gauss's law, not in the definition of charge density.`],
        md`$\rho$ is charge per unit volume, so the charge in $V$ is $\int_V\rho\,d\tau$. Then $\displaystyle\int_V(\divg\vb E)\,d\tau=\int_V\dfrac{\rho}{\ep}\,d\tau$. (The notes drop the $1/\ep$ on the right in this line and restore it in the next.)`,
        { nofig: 'definition of charge density, no geometry' }),

      RF(md`
        So for **every** volume $V$,

        $$\int_V\left(\divg\vb E-\dfrac{\rho}{\ep}\right)d\tau=0 .$$

        The volume was arbitrary (the notes: “we did not specify”). If the bracket were nonzero at some point, a tiny volume around that point would make the integral nonzero. So the bracket vanishes everywhere:

        $$\boxed{\ \divg\vb E=\dfrac{\rho}{\ep}\ }\qquad\text{(Gauss's law, differential form)}$$

        - It is **local**: it relates the field near a point to the charge density **at that point**.
        - It still holds when $\vb E$ and $\rho$ depend on time. It is one of Maxwell's equations.
        - Used backwards it tells you which charge density produced a given field: $\rho=\ep\,\divg\vb E$.
      `),

      Q(md`The step from $\displaystyle\int_V\left(\divg\vb E-\rho/\ep\right)d\tau=0$ to $\divg\vb E=\rho/\ep$ is valid because`,
        [md`the integrand is positive`, md`the integral of anything over a closed surface is zero`, md`$\divg\vb E$ is constant`, md`the equation holds for every volume, including arbitrarily small ones around any point`], 3,
        [md`The integrand can have either sign; positivity is not the argument.`, md`This is a volume integral, and closed-surface integrals are not zero in general (that is the whole point of Gauss's law).`, md`Neither side needs to be constant.`, null],
        md`For one particular volume, an integral can vanish with the integrand positive in one place and negative in another. For **all** volumes, including a tiny ball around any chosen point, the integrand itself must be zero everywhere. The same argument turns every integral law into a differential one.`,
        { nofig: 'logic of the derivation, no geometry' }),

      RF(md`
        ### The divergence of $\srh/\srm^2$ and the point charge
        Lecture 2 quotes a “useful divergence” (worked out in the vector-calculus unit):

        $$\divg\left(\dfrac{\srh}{\srm^2}\right)=4\pi\,\delta^3(\sr),\qquad \delta^3(\sr)=\delta(x-x')\,\delta(y-y')\,\delta(z-z').$$

        Here $\sr=\vb r-\vb r'$ and $\nabla$ acts on $\vb r$, the field point, not on $\vb r'$. Away from $\vb r'$ the field $\srh/\srm^2$ has zero divergence (the spherical formula gives $\dfrac{1}{r^2}\dfrac{\partial}{\partial r}\left(r^2\cdot\dfrac{1}{r^2}\right)=0$). But its flux through any sphere around $\vb r'$ is $4\pi$, so all of that divergence sits at the single point $\vb r'$: a delta function.

        **Lecture example: the charge density of a point charge at the origin.** With $\vb E=\dfrac{q}{4\pi\ep}\dfrac{\uv r}{r^2}$,

        $$\rho(\vb r)=\ep\,\divg\vb E=\dfrac{\ep q}{4\pi\ep}\,\divg\left(\dfrac{\uv r}{r^2}\right)=\dfrac{q}{4\pi}\cdot4\pi\,\delta^3(\vb r)=q\,\delta^3(\vb r).$$

        Infinite at the charge, zero everywhere else, and $\int q\,\delta^3(\vb r)\,d\tau=q$. “Point charges are a useful tool but make no sense in real life.”

        **Lecture example: Gauss's law from Coulomb's law.** Take the divergence of the Coulomb integral; $\nabla$ goes inside because it acts on $\vb r$ only:

        $$\divg\vb E=\dfrac{1}{4\pi\ep}\int d\tau'\,\rho(\vb r')\,\divg\left(\dfrac{\srh}{\srm^2}\right)=\dfrac{1}{4\pi\ep}\int d\tau'\,\rho(\vb r')\,4\pi\,\delta^3(\vb r-\vb r')=\dfrac{\rho(\vb r)}{\ep}.$$

        So Gauss's law is not a new assumption: it follows from Coulomb's law and superposition. (In this line the notes write $\nabla\cdot(\sr/\srm^2)$ without the hat; it should be $\srh/\srm^2$.)
      `),

      WG.fields({ f: 'radial' }),

      Q(md`The spherical divergence formula gives $\divg(\uv r/r^2)=0$ for $r\neq0$, yet the flux of $\uv r/r^2$ through a sphere of any radius is $4\pi$. How do these fit together?`,
        [md`The divergence is a delta function at the origin, $4\pi\delta^3(\vb r)$: zero everywhere except at $r=0$, where all the flux originates`, md`The divergence theorem fails for this field`, md`The formula is wrong; the divergence is $1/r^3$`, md`The flux is actually zero`], 0,
        [null, md`The divergence theorem holds once you include the delta function; it is exactly what demands it.`, md`The formula is correct for $r\ne0$.`, md`$\oint\dfrac{\uv r}{r^2}\cdot r^2\sin\theta\,d\theta\,d\varphi\,\uv r=4\pi$.`],
        md`$\int_V\divg\left(\dfrac{\uv r}{r^2}\right)d\tau$ over a ball must equal the flux $4\pi$. A function that is zero for $r\ne0$ but integrates to $4\pi$ is $4\pi\delta^3(\vb r)$. Physically: all the field lines start at the point charge.`,
        { figHtml: figRadial('+') }),

      Q(md`What are the units of $\delta^3(\vb r)$?`,
        [md`Dimensionless`, md`$\text{m}^{-1}$`, md`$\text{m}^{-3}$`, md`$\text{m}^{3}$`], 2,
        [md`$\int\delta^3(\vb r)\,d\tau=1$ is dimensionless and $d\tau$ is a volume, so $\delta^3$ must carry 1/volume.`, md`That is the one-dimensional $\delta(x)$.`, null, md`Inverse: it must cancel the $d\tau$.`],
        md`$\int\delta^3(\vb r)\,d\tau=1$, so $\delta^3$ has units of 1/volume. Then $q\,\delta^3(\vb r)$ has units of charge per volume, a charge density, as it should.`,
        { nofig: 'units only' }),

      Q(md`What is $\displaystyle\int_V q\,\delta^3(\vb r-\vb a)\,d\tau$ when $V$ is a ball of radius $1$ centred at the origin and $|\vb a|=2$?`,
        [md`$q$`, md`$q/2$`, md`$4\pi q$`, md`$0$`], 3,
        [md`The delta function picks up $q$ only if its spike, at $\vb a$, is inside $V$.`, md`Half would be the answer if $\vb a$ were on the surface of the ball.`, md`The $4\pi$ belongs to $\divg(\srh/\srm^2)$, not to $\delta^3$ itself.`, null],
        md`$q\,\delta^3(\vb r-\vb a)$ is a point charge at $\vb a$. The ball of radius 1 does not contain $\vb a$ ($|\vb a|=2$), so it encloses no charge: $0$.`,
        { nofig: 'delta-function sifting, no geometry beyond the statement' }),

      RF(md`
        ### Finding $\rho$ from $\vb E$
        $\rho=\ep\,\divg\vb E$. Use the divergence in the coordinates the field is written in (all three are on the formula sheet):

        $$\divg\vb E=\dfrac{1}{r^2}\dfrac{\partial}{\partial r}\left(r^2E_r\right)+\dfrac{1}{r\sin\theta}\dfrac{\partial}{\partial\theta}\left(\sin\theta E_\theta\right)+\dfrac{1}{r\sin\theta}\dfrac{\partial E_\varphi}{\partial\varphi}\quad\text{(spherical)}$$

        $$\divg\vb E=\dfrac{1}{s}\dfrac{\partial}{\partial s}\left(sE_s\right)+\dfrac{1}{s}\dfrac{\partial E_\varphi}{\partial\varphi}+\dfrac{\partial E_z}{\partial z}\quad\text{(cylindrical)}$$

        !!method Charge density from a field
          1. Pick the formula that matches the components you are given ($E_r$: spherical; $E_s$: cylindrical).
          2. Keep the weights: $r^2$ inside the derivative in spherical, $s$ in cylindrical. Dropping them is the most common error.
          3. Look for points where the formula breaks (usually $r=0$ or $s=0$). A field like $1/r^2$ hides a point charge there.
          4. Check: the charge from $\int\rho\,d\tau$ must equal $\ep\times$ the flux of $\vb E$ through the boundary.
      `),

      P({
        id: 'HW1-2.9', src: 'HW 1 · Griffiths 2.9', title: 'Charge density from a field', big: true,
        q: md`Suppose the electric field in some region is found to be $\vb E=kr^3\,\uv r$, in spherical coordinates ($k$ is some constant).

        (a) Find the charge density $\rho$.

        (b) Find the total charge contained in a sphere of radius $R$, centered at the origin. (Do it two different ways.)`,
        figHtml: figGrow(),
        hints: [
          md`(a) Differential Gauss's law: $\rho=\ep\,\divg\vb E$. Only $E_r$ is nonzero, so only the first term of the spherical divergence survives.`,
          md`$\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot kr^3\right)=\dfrac{1}{r^2}\dfrac{d}{dr}\left(kr^5\right)$.`,
          md`(b) Way 1: integrate $\rho$ over the ball with $d\tau=4\pi r^2\,dr$. Way 2: integral Gauss's law, $Q=\ep\oint\vb E\cdot d\vb a$ over the sphere $r=R$.`,
        ],
        parts: [
          { lbl: md`(a) $\rho(r)$`, expr: '5*eps0*k*r^2', vars: { eps0: [0.5, 2], k: [1, 3], r: [0.2, 2] } },
          { lbl: md`(b) Total charge in the sphere of radius $R$`, expr: '4*pi*eps0*k*R^5', vars: { eps0: [0.5, 2], k: [1, 3], R: [0.5, 2] } },
          { lbl: md`The two ways in (b) are`, mc: [md`$\int\rho\,d\tau$ over the ball, and $\ep$ times the flux of $\vb E$ through the sphere $r=R$`, md`$\rho\times\tfrac43\pi R^3$, and $\int\rho\,d\tau$`, md`The flux through the sphere, and the flux through a cube around it`, md`Coulomb's law, and the divergence theorem applied to $\rho$`], a: 0,
            why: [null, md`$\rho$ is not uniform here ($\propto r^2$), so $\rho\times$volume is wrong.`, md`Both are the same method (integral Gauss's law); and the cube flux is harder to compute.`, md`The divergence theorem applies to a vector field ($\vb E$), not to the scalar $\rho$.`] },
        ],
        sol: md`
          **(a)** Only $E_r=kr^3$ is nonzero, so
          $$\rho=\ep\,\divg\vb E=\ep\,\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\,kr^3\right)=\ep\,\dfrac{1}{r^2}\,5kr^4=5\ep k\,r^2 .$$

          [[fig:s]]

          **(b), way 1: integrate the density.** Thin spherical shells, $d\tau=4\pi r^2\,dr$:
          $$Q=\int_0^R5\ep kr^2\cdot4\pi r^2\,dr=20\pi\ep k\int_0^Rr^4\,dr=4\pi\ep kR^5 .$$

          **(b), way 2: Gauss's law in integral form.** On the sphere $r=R$, $\vb E=kR^3\,\uv r$ is normal with constant size:
          $$Q=\ep\oint\vb E\cdot d\vb a=\ep\,kR^3\cdot4\pi R^2=4\pi\ep kR^5 .$$

          The two agree, as the divergence theorem guarantees.

          **Checks.** Units: $\vb E$ has units of $k\cdot\text{m}^3$, so $k$ has units of $\text{V/m}^4$; then $\ep kR^5$ is $\ep\times(\text{V/m})\times\text{m}^2$, a charge. Good. Note the weight: $\divg(kr^3\uv r)$ is $5kr^2$, not the “naive” $3kr^2$ you get by differentiating $kr^3$ alone.

          **What to remember.** $\rho=\ep\,\divg\vb E$ with the $r^2$ weight. To get a total charge you can integrate $\rho$ or, faster, take the flux of $\vb E$ through the boundary.
        `,
        figs: { s: { svg: figGrow(), cap: md`$\vb E=kr^3\uv r$: radial, growing with $r$. The sphere of radius $R$ is used in part (b).` } },
      }),

      Q(md`In spherical coordinates, $\vb E=c\,\vb r=cr\,\uv r$ (with $c$ constant). What charge density produces it?`,
        [md`$\rho=\ep c$`, md`$\rho=2\ep c$`, md`$\rho=3\ep c$`, md`$\rho=0$`], 2,
        [md`$\dfrac{d}{dr}(cr)=c$ drops the $r^2$ weight. Use $\dfrac{1}{r^2}\dfrac{d}{dr}(r^2\cdot cr)$.`, md`That is the cylindrical result for $\vb E=cs\,\uv s$.`, null, md`The field grows with $r$, so there must be charge.`],
        md`$\dfrac{1}{r^2}\dfrac{d}{dr}(cr^3)=3c$, so $\rho=3\ep c$, uniform. This is the inside of a uniform ball: $\vb E=\dfrac{\rho}{3\ep}\vb r$ from Lesson 5, run backwards.`,
        { nofig: 'the field is given as a formula' }),

      Q(md`In cylindrical coordinates, $\vb E=c\,s\,\uv s$. What is $\rho$?`,
        [md`$2\ep c$`, md`$3\ep c$`, md`$\ep c$`, md`$\ep c/s$`], 0,
        [null, md`$3\ep c$ is the spherical answer. In cylindrical coordinates the weight is $s$, not $s^2$.`, md`That forgets the $s$ weight: use $\dfrac1s\dfrac{d}{ds}(s\cdot cs)$.`, md`$\dfrac1s\dfrac{d}{ds}(cs^2)=2c$, which is constant.`],
        md`$\divg\vb E=\dfrac1s\dfrac{d}{ds}(s\cdot cs)=\dfrac1s\cdot2cs=2c$, so $\rho=2\ep c$: a uniformly charged long cylinder, whose inside field is $\dfrac{\rho s}{2\ep}$ (the coaxial-cable region (i)).`,
        { nofig: 'the field is given as a formula' }),

      Q(md`$\vb E=\dfrac{A}{r^2}\,\uv r$ everywhere (with $A$ a constant). Where is the charge, and how much?`,
        [md`Spread uniformly: $\rho=\ep A$`, md`$\rho=-2\ep A/r^3$ everywhere`, md`There is no charge anywhere`, md`Only at the origin: a point charge $q=4\pi\ep A$`], 3,
        [md`The divergence of $A\uv r/r^2$ vanishes away from the origin.`, md`That comes from differentiating $A/r^2$ without the $r^2$ weight.`, md`The flux through any sphere is $4\pi A$, so something is inside.`, null],
        md`For $r\ne0$, $\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{A}{r^2}\right)=0$. But the flux through any sphere is $4\pi A$, so $\rho=\ep A\cdot4\pi\delta^3(\vb r)$: a point charge $q=4\pi\ep A$ at the origin. Step 3 of the method: check where the formula breaks.`,
        { figHtml: figRadial('+') }),

      P({
        title: 'Read off the charge',
        q: md`A field is $\vb E=E_0\dfrac{r^2}{R^2}\,\uv r$ for $r\le R$ and $\vb E=E_0\dfrac{R^2}{r^2}\,\uv r$ for $r\ge R$. Find the charge density inside and outside, and the total charge.`,
        figHtml: figSolid(false, md`?`),
        hints: [md`$\rho=\ep\dfrac{1}{r^2}\dfrac{d}{dr}(r^2E_r)$ in each region.`, md`Inside: $\dfrac{1}{r^2}\dfrac{d}{dr}\left(\dfrac{E_0r^4}{R^2}\right)$. Outside: $\dfrac{1}{r^2}\dfrac{d}{dr}(E_0R^2)$.`, md`Total charge two ways: $\int\rho\,d\tau$ over the inside, or $\ep\times$ the flux through any sphere with $r\ge R$.`],
        parts: [
          { lbl: md`$\rho$ inside ($r<R$)`, expr: '4*eps0*E0*r/R^2', vars: { eps0: [0.5, 2], E0: [1, 3], r: [0.1, 0.9], R: [1, 2] } },
          { lbl: md`$\rho$ outside ($r>R$):`, mc: [md`$\ep E_0R^2/r^4$`, md`$-2\ep E_0R^2/r^3$`, md`$0$`, md`$4\ep E_0/R$`], a: 2,
            why: [md`Differentiate $r^2E_r=E_0R^2$, a constant: the derivative is zero.`, md`That drops the $r^2$ weight.`, null, md`That is the inside value at $r=R$; outside, the field is a pure point-charge field.`] },
          { lbl: md`Total charge`, expr: '4*pi*eps0*E0*R^2', vars: { eps0: [0.5, 2], E0: [1, 3], R: [0.5, 2] } },
        ],
        sol: md`
          **Inside.** $r^2E_r=E_0r^4/R^2$, so $\rho=\ep\dfrac{1}{r^2}\cdot\dfrac{4E_0r^3}{R^2}=\dfrac{4\ep E_0\,r}{R^2}$: the density grows linearly with $r$ (like the $\rho=kr$ ball, with $k=4\ep E_0/R^2$).

          **Outside.** $r^2E_r=E_0R^2$ is constant, so $\rho=0$: empty space, point-charge-like field.

          **Total charge.** Flux through a sphere of radius $r\ge R$: $Q=\ep\,E_0\dfrac{R^2}{r^2}\,4\pi r^2=4\pi\ep E_0R^2$. Check by integrating: $\displaystyle\int_0^R\dfrac{4\ep E_0r}{R^2}\,4\pi r^2\,dr=\dfrac{16\pi\ep E_0}{R^2}\cdot\dfrac{R^4}{4}=4\pi\ep E_0R^2$. Good.

          **What to remember.** Continuous $\vb E$ at $r=R$ means no surface charge there; a kink in $E_r(r)$ just means $\rho$ changes.
        `,
      }),

      RF(md`
        ### Divergence is local (Lecture 3)
        “It's important to remember we are considering the charge density at a fixed point.” Between the plates of a parallel-plate capacitor the field is uniform, $\vb E=\dfrac{\sigma}{\ep}\uv z$:

        [[fig:s]]

        $$\divg\vb E=\divg\left(\dfrac{\sigma}{\ep}\,\uv z\right)=0\quad\Longrightarrow\quad\text{no charge density in the region between the plates.}$$

        (The notes write $\divg\dfrac{\sigma}{\ep}$, the divergence of a scalar; it means the divergence of the uniform field $\dfrac{\sigma}{\ep}\uv z$.) A nonzero field does not need charge at that point; it needs charge somewhere. At a plate the field jumps from $0$ to $\sigma/\ep$ over zero distance, so $\divg\vb E\neq0$ there: “telling me that there is a charged object”. In fact $E_z$ jumps by $\sigma/\ep$, so $\partial E_z/\partial z=(\sigma/\ep)\,\delta(z-z_0)$ and $\rho=\sigma\,\delta(z-z_0)$: a sheet of charge, written as a volume density. That is the boundary condition $E^\perp_{\text{above}}-E^\perp_{\text{below}}=\sigma/\ep$ again, in differential form.
      `, { s: { svg: figCapacitor({ box: true }), cap: md`Parallel plates with $\pm Q$. Between them $\vb E$ is uniform; a small box there has as much flux in as out.` } }),

      Q(md`Between the capacitor plates $\vb E\ne0$. Is there charge between the plates?`,
        [md`Yes, because there is a field there`, md`Yes, a uniform density $\ep\sigma$`, md`Only near the plates`, md`No: the field is uniform, so $\divg\vb E=0$ and $\rho=0$ there`], 3,
        [md`A field at a point does not require charge at that point. The divergence, not the field, measures local charge.`, md`$\divg$ of a uniform field is zero.`, md`The field is uniform all the way across, so the divergence is zero right up to the plate surfaces.`, null],
        md`$\rho$ at a point is $\ep\,\divg\vb E$ at that point. A uniform field has zero divergence. The charge that makes the field sits on the plates.`,
        { figHtml: figCapacitor({ point: true }) }),

      Q(md`What is the net flux of $\vb E$ out of the small box between the plates?`,
        [md`$EA$, where $A$ is a face area`, md`$2EA$`, md`$\sigma A/\ep$`, md`Zero: as much flux enters through the left face as leaves through the right face`], 3,
        [md`That is only the outgoing face.`, md`The left face has inward flux, which counts as negative.`, md`That would need charge $\sigma A$ inside the box, but the box is in empty space.`, null],
        md`Uniform field: $-EA$ through the left face, $+EA$ through the right face, $0$ through the other four. Net zero, consistent with $\Qenc=0$ and with $\divg\vb E=0$.`,
        { figHtml: figCapacitor({ box: true }) }),

      Q(md`At the surface of the $+Q$ plate itself, what is $\divg\vb E$?`,
        [md`Zero, as in the gap`, md`$\sigma/\ep$`, md`It is not defined, so it does not mean anything`, md`It is infinite: a delta function, $\divg\vb E=\dfrac{\sigma}{\ep}\,\delta(z-z_0)$, because the plate carries a surface charge`], 3,
        [md`$E_z$ jumps there, so its derivative is not zero.`, md`$\sigma/\ep$ is the size of the jump in $E_z$, not the divergence. A jump over zero distance gives a delta function.`, md`It is a delta function; integrated across the plate it gives the jump $\sigma/\ep$.`, null],
        md`$E_z$ goes from $0$ (outside) to $\sigma/\ep$ (inside) across the plate. The derivative of a step is a delta function, so $\divg\vb E=(\sigma/\ep)\,\delta(z-z_0)$ and $\rho=\sigma\,\delta(z-z_0)$. The differential form “sees” the charged plate exactly where it is.`,
        { figHtml: figCapacitor() }),

      Q(md`$\vb E=k\,x\,\uv x$ in some region (Cartesian; $k$ constant). Is there charge in that region?`,
        [md`Yes, a uniform density $\rho=\ep k$`, md`No, because the field points along a fixed direction`, md`Yes, $\rho=\ep kx$`, md`Only where $x=0$`], 0,
        [null, md`A field in a fixed direction can still have divergence if its size changes along that direction.`, md`$\partial(kx)/\partial x=k$, not $kx$.`, md`The divergence is $k$ everywhere, not only at $x=0$.`],
        md`$\divg\vb E=\dfrac{\partial(kx)}{\partial x}=k$, so $\rho=\ep k$ everywhere. More field lines leave each small box than enter it, because the field is stronger on the far side. Compare the capacitor gap: same direction everywhere, but constant size, so no charge.`,
        { nofig: 'formula only; the field is given' }),

      RF(md`
        !!key Patterns to remember
          - $\divg\vb E=\rho/\ep$: divergence theorem + “for every volume”. Local; also valid for time-dependent fields.
          - $\divg(\srh/\srm^2)=4\pi\delta^3(\sr)$, with $\nabla$ acting on $\vb r$. A point charge has $\rho=q\,\delta^3(\vb r-\vb r')$.
          - $\rho=\ep\,\divg\vb E$ with the weights: $\dfrac{1}{r^2}\partial_r(r^2E_r)$, $\dfrac1s\partial_s(sE_s)$. Watch $r=0$ for hidden point charges.
          - Total charge two ways: $\int\rho\,d\tau$ or $\ep\oint\vb E\cdot d\vb a$.
          - $\vb E\ne0$ does not imply $\rho\ne0$ (capacitor gap, overlap of $\pm\rho$ spheres). A jump in $E^\perp$ is a surface charge: $\rho=\sigma\,\delta$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 8 — The curl of E (Lecture 3 p3–5; Griffiths 2.2.4)
  // =====================================================================================
  const L8 = {
    id: 'u1-curl', title: 'The curl of E',
    steps: [
      RF(md`
        ### Stokes' theorem and the curl
        Lecture 3 turns from the divergence (sources) to the curl (circulation), starting from Stokes' theorem:

        $$\int_S(\curl\vb v)\cdot d\vb a=\oint_P\vb v\cdot d\vb l .$$

        [[fig:s]]

        On the left, a flux integral over an **open** surface $S$; on the right, a line integral around the **closed** path $P$ that bounds it. (The notes say “surface integral over an open boundary”; it is an open surface, and its boundary is the closed path.) The direction around $P$ and the direction of $d\vb a$ are tied by the right-hand rule. Any surface with the same boundary gives the same answer.

        The curl itself, in Cartesian components:

        $$\curl\vb v=\begin{vmatrix}\uv x&\uv y&\uv z\\ \partial_x&\partial_y&\partial_z\\ v_x&v_y&v_z\end{vmatrix}=\left(\partial_yv_z-\partial_zv_y\right)\uv x+\left(\partial_zv_x-\partial_xv_z\right)\uv y+\left(\partial_xv_y-\partial_yv_x\right)\uv z .$$

        “The curl measures the degree to which the field rotates or circulates.” Picture a tiny paddle wheel in the field: if it spins, the curl is nonzero.
      `, { s: { svg: figStokes(), cap: md`An open surface $S$ (tinted) and its closed boundary $P$. The arrows on $P$ and the normal $d\vb a$ follow the right-hand rule.` } }),

      Q(md`In Stokes' theorem, $\displaystyle\int_S(\curl\vb v)\cdot d\vb a=\oint_P\vb v\cdot d\vb l$, what are $S$ and $P$?`,
        [md`$S$ is a closed surface and $P$ is any path on it`, md`$S$ is an open surface and $P$ is its closed boundary`, md`$S$ is a volume and $P$ its surface`, md`$S$ and $P$ are unrelated; any surface and any loop work`], 1,
        [md`A closed surface has no boundary. That is the setting of the divergence theorem, not Stokes'.`, null, md`Volume and surface is the divergence theorem.`, md`$P$ must be the boundary of $S$.`],
        md`Stokes: flux of the curl through an open surface = circulation around the edge of that surface. Divergence theorem: integral of the divergence over a volume = flux through its closed boundary surface. Same pattern, one dimension down.`,
        { figHtml: figStokes() }),

      Q(md`You want $\oint_P\vb v\cdot d\vb l$ for a given loop $P$ and you know $\curl\vb v$. Which surface may you integrate the curl over?`,
        [md`Only the flat surface spanning $P$`, md`Only a hemisphere-like surface`, md`Any surface whose boundary is $P$; all give the same flux of $\curl\vb v$`, md`A closed surface containing $P$`], 2,
        [md`The flat one is often the easiest, but any surface bounded by $P$ gives the same result.`, md`Any surface bounded by $P$ works.`, null, md`A closed surface has no boundary, so its curl flux is always zero.`],
        md`The right-hand side depends only on the loop, so the flux of $\curl\vb v$ is the same through every surface with that boundary. Pick the one that makes the integral easy.`,
        { figHtml: figStokes() }),

      RF(md`
        ### The curl of a point charge's field
        In-class example: what is $\curl\vb E$ for a point charge? Use the spherical curl (formula sheet) with

        $$\vb E=\dfrac{1}{4\pi\ep}\dfrac{q}{r^2}\,\uv r,\qquad E_\theta=0,\quad E_\varphi=0 .$$

        $$\curl\vb E=\dfrac{1}{r\sin\theta}\left[\dfrac{\partial}{\partial\theta}(\sin\theta\,E_\varphi)-\dfrac{\partial E_\theta}{\partial\varphi}\right]\uv r+\dfrac1r\left[\dfrac{1}{\sin\theta}\dfrac{\partial E_r}{\partial\varphi}-\dfrac{\partial}{\partial r}(rE_\varphi)\right]\uv\theta+\dfrac1r\left[\dfrac{\partial}{\partial r}(rE_\theta)-\dfrac{\partial E_r}{\partial\theta}\right]\uv\varphi .$$

        Every term contains either $E_\theta$ or $E_\varphi$ (both zero) or an angular derivative of $E_r$ (zero, because $E_r$ depends only on $r$). So $\curl\vb E=0$. (In the last line of the notes the $\uv\theta$ term has lost its $1/r$; harmless, it is zero anyway.)

        The widget shows the difference between a radial field (no curl) and a swirling one (curl).
      `),

      WG.fields({ f: 'swirl' }),

      Q(md`For a point charge's field, why does every term of the spherical curl vanish?`,
        [md`Because $E_r$ is zero`, md`Because $\vb E$ falls off as $1/r^2$`, md`Because of the $\sin\theta$ factors`, md`$E_\theta=E_\varphi=0$, and $E_r$ depends only on $r$, so its $\theta$ and $\varphi$ derivatives vanish`], 3,
        [md`$E_r$ is the only nonzero component.`, md`The $1/r^2$ is not needed: any $E_r(r)$ alone has zero curl.`, md`The $\sin\theta$ factors are geometry; the zeros come from the components and derivatives.`, null],
        md`The curl only involves the angular components and the angular derivatives of $E_r$. A purely radial field whose size depends only on $r$ has none of these. So any field of the form $f(r)\,\uv r$ is curl-free, not only $1/r^2$.`,
        { figHtml: figRadial('+') }),

      Q(md`Which of these fields could **not** be produced by any arrangement of static charges?`,
        [md`$\vb E=k\,(-y\,\uv x+x\,\uv y)$, a swirl around the $z$ axis`, md`$\vb E=k\,r^3\,\uv r$`, md`$\vb E=k\,x\,\uv x$`, md`$\vb E=k\,\uv z$, uniform`], 0,
        [null, md`Radial with size depending only on $r$: zero curl. (It is the field of Problem 2.9.)`, md`$\curl(kx\,\uv x)=0$: the only component depends only on its own coordinate.`, md`A uniform field has zero curl (a capacitor gap).`],
        md`$\curl\left[k(-y,x,0)\right]=2k\,\uv z\ne0$. A paddle wheel would spin in it. Electrostatic fields always have zero curl, so no set of static charges can make this field. (A changing magnetic field can: that is Faraday's law, later in the course.)`,
        { nofig: 'formula only; the swirl field is shown in the widget above' }),

      RF(md`
        ### Any static charge distribution
        In-class question: what does this say about the curl of $\vb E$ for **any** static charge distribution, and how do you prove it?

        By superposition, break the distribution into point charges. Each has a curl-free field, and the curl of a sum is the sum of the curls:

        $$\curl\vb E=\curl\sum_{i=1}^{N}\vb E_{q_i}=\curl\vb E_{q_1}+\curl\vb E_{q_2}+\dots=0+0+\dots=0 .$$

        Stokes' theorem then gives, for **every** closed loop,

        $$\oint\vb E\cdot d\vb l=0 .$$

        Griffiths' direct way to see it: for a point charge, $\vb E\cdot d\vb l$ only picks up the radial step $dr$, so $\displaystyle\int_a^b\vb E\cdot d\vb l=\dfrac{q}{4\pi\ep}\left(\dfrac{1}{r_a}-\dfrac{1}{r_b}\right)$ depends only on the endpoints. Around a closed loop $r_a=r_b$ and the integral is zero.

        !!trap Only for static charges
          The notes underline this: $\curl\vb E=0$ holds for **static** charge distributions. When magnetic fields change in time, $\curl\vb E=-\partial\vb B/\partial t$ (Faraday's law) and the loop integral is the EMF. Gauss's law, by contrast, holds in general.

        !!key Why it matters
          A curl-free field is the gradient of a scalar: the line integral of $\vb E$ is path independent, so $V(\vb r)=-\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l$ is well defined and $\vb E=-\nabla V$. That is the next unit. Also a boundary condition: around a thin rectangular loop straddling a surface, $\oint\vb E\cdot d\vb l=0$ forces the **tangential** component of $\vb E$ to be continuous across any surface, charged or not.
      `),

      Q(md`A closed path is made of two radial segments (1 and 3) and two arcs centred on a point charge $q$ (2 and 4). What is $\oint\vb E\cdot d\vb l$ around it, and why?`,
        [md`Positive, because the path goes out along 1`, md`Zero: $\vb E\perp d\vb l$ on the arcs, and the two radial pieces cover the same range of $r$ in opposite directions`, md`It depends on the angle between the radial segments`, md`$q/\ep$, because the path is near the charge`], 1,
        [md`Going out along 1 gives a positive contribution, but coming in along 3 gives exactly the opposite.`, null, md`The angle only changes the arc lengths, and the arcs contribute nothing.`, md`$q/\ep$ is a flux through a closed surface enclosing $q$. This is a line integral, and it vanishes.`],
        md`On an arc, $d\vb l$ is along $\uv\theta$ or $\uv\varphi$, perpendicular to the radial $\vb E$: zero. Along 1 you go from $r_a$ to $r_b$, along 3 from $r_b$ back to $r_a$; $\vb E$ depends only on $r$, so the two cancel. Any loop can be approximated by such radial steps and arcs, which is the whole proof.`,
        { figHtml: figWedge() }),

      Q(md`The closed loop $C$ now goes **around** the point charge. What is $\oint_C\vb E\cdot d\vb l$?`,
        [md`$q/\ep$, since the loop encloses the charge`, md`$q/2\ep$`, md`It depends on the shape of the loop`, md`Zero, as for every closed loop in an electrostatic field`], 3,
        [md`That is the flux through a closed surface. “Enclosing” a charge matters for Gauss's law, not for line integrals.`, md`No; line integrals of an electrostatic field around closed loops vanish.`, md`$\oint\vb E\cdot d\vb l=0$ for every loop, whatever its shape.`, null],
        md`$\int_a^b\vb E\cdot d\vb l=\dfrac{q}{4\pi\ep}\left(\dfrac{1}{r_a}-\dfrac{1}{r_b}\right)$ depends only on the endpoints; for a closed loop they coincide. Do not mix up the two laws: Gauss's law counts flux through a closed **surface**; $\oint\vb E\cdot d\vb l$ is around a closed **curve**.`,
        { figHtml: figLoopQ(true) }),

      Q(md`(Griffiths 2.20.) One of these is an impossible electrostatic field ($k$ is a constant). Which one?`,
        [md`$\vb E=k\left[y^2\,\uv x+(2xy+z^2)\,\uv y+2yz\,\uv z\right]$`, md`$\vb E=k\left[xy\,\uv x+2yz\,\uv y+3xz\,\uv z\right]$`, md`Both are possible`, md`Both are impossible`], 1,
        [md`Its curl is zero: $\partial_yE_z-\partial_zE_y=2z-2z=0$, $\partial_zE_x-\partial_xE_z=0-0=0$, $\partial_xE_y-\partial_yE_x=2y-2y=0$.`, null, md`Compute the curl of the second one: $\partial_yE_z-\partial_zE_y=0-2y\ne0$.`, md`The first one has zero curl, so it can be electrostatic.`],
        md`For $k(xy,\,2yz,\,3xz)$: $\curl\vb E=k\left(-2y,\,-3z,\,-x\right)\ne0$, impossible. For $k(y^2,\,2xy+z^2,\,2yz)$ the curl is zero, so it is a possible electrostatic field; in fact it is $-\nabla V$ with $V=-k(xy^2+yz^2)$.`,
        { nofig: 'formula only' }),

      Q(md`$\curl\vb E=0$ holds`,
        [md`always, it is one of Maxwell's equations in this form`, md`only inside conductors`, md`only far from charges`, md`for static charge distributions; with time-varying magnetic fields $\curl\vb E=-\partial\vb B/\partial t$`], 3,
        [md`Maxwell's equation is $\curl\vb E=-\partial\vb B/\partial t$; it reduces to zero only in statics.`, md`It holds everywhere in electrostatics, inside and outside matter.`, md`It holds everywhere in electrostatics, also at and near the charges.`, null],
        md`The notes put it in blue and underline “static”. Contrast: $\divg\vb E=\rho/\ep$ survives in electrodynamics unchanged, $\curl\vb E=0$ does not.`,
        { nofig: 'conceptual statement' }),

      Q(md`Just above a charged surface the tangential component of $\vb E$ is $3E_0$ (pointing east). What is the tangential component just below?`,
        [md`$3E_0$, pointing east: the tangential component is continuous`, md`$-3E_0$`, md`$3E_0+\sigma/\ep$`, md`It cannot be known without $\sigma$`], 0,
        [null, md`Reversal happens to the **normal** component of a sheet's own field, not the tangential one.`, md`$\sigma/\ep$ is the jump of the normal component.`, md`The tangential component does not depend on $\sigma$ at all.`],
        md`Take a thin rectangular loop straddling the surface, long sides parallel to it. $\oint\vb E\cdot d\vb l=0$ and the short sides shrink to nothing, so $E_\parallel^{\text{above}}\,\ell-E_\parallel^{\text{below}}\,\ell=0$. Together with the Gauss pillbox: $E^\perp$ jumps by $\sigma/\ep$, $E^\parallel$ is continuous.`,
        { figHtml: figTanBC() }),

      Q(md`The field $\vb E=\dfrac{k}{s}\,\uv\varphi$ circles a line (seen end on in the figure). Its curl is zero everywhere except on the line itself. Could it be an electrostatic field in the region around the line?`,
        [md`Yes, because its curl is zero there`, md`Yes, if there is charge on the line`, md`No: around a loop that circles the line, $\oint\vb E\cdot d\vb l=2\pi k\ne0$`, md`It depends on the value of $k$`], 2,
        [md`Zero curl in a region with a hole is not enough. Electrostatics needs $\oint\vb E\cdot d\vb l=0$ around every loop, including those that circle the line.`, md`Charge produces divergence, not circulation. No static charge makes a field that circulates.`, null, md`For any $k\ne0$ the loop integral is nonzero.`],
        md`On a circle of radius $s$: $\oint\dfrac{k}{s}\,s\,d\varphi=2\pi k$. An electrostatic field must give zero for every closed loop, so this is not electrostatic. (It is the shape of the **magnetic** field of a wire.)`,
        { figHtml: figVortex() }),

      P({
        title: 'Make it curl-free',
        q: md`For which value of the constant $\alpha$ is $\vb E=k\left[(\alpha xy+z^3)\,\uv x+x^2\,\uv y+3xz^2\,\uv z\right]$ a possible electrostatic field?`,
        nofig: 'the field is given as a formula',
        hints: [md`Electrostatic means $\curl\vb E=0$. Compute all three components.`, md`$(\curl\vb E)_z=\partial_xE_y-\partial_yE_x=k(2x-\alpha x)$.`, md`Check the other two components: are they already zero?`],
        parts: [
          { lbl: md`$\alpha$`, ans: 2 },
          { lbl: md`With that $\alpha$, $\oint\vb E\cdot d\vb l$ around the unit square in the $xy$ plane is`, mc: [md`$2k$`, md`$0$`, md`$k$`, md`It depends on the direction of travel`], a: 1,
            why: [md`A curl-free field has zero circulation around every loop.`, null, md`A curl-free field has zero circulation around every loop.`, md`Reversing the direction flips the sign of zero, which is still zero.`] },
        ],
        sol: md`
          $$(\curl\vb E)_x=\partial_yE_z-\partial_zE_y=0-0=0,$$
          $$(\curl\vb E)_y=\partial_zE_x-\partial_xE_z=3kz^2-3kz^2=0,$$
          $$(\curl\vb E)_z=\partial_xE_y-\partial_yE_x=2kx-\alpha kx .$$

          The field is curl-free only for $\alpha=2$. Then $\vb E=-\nabla V$ with $V=-k(x^2y+xz^3)$ (check: $-\partial_xV=k(2xy+z^3)$, $-\partial_yV=kx^2$, $-\partial_zV=3kxz^2$), and every closed loop integral vanishes by Stokes' theorem.
        `,
      }),

      P({
        title: 'Circulation of a swirl',
        q: md`For $\vb E=k\,(y\,\uv x-x\,\uv y)$, compute $\oint\vb E\cdot d\vb l$ around a circle of radius $R$ in the $xy$ plane, centred on the origin, traversed counterclockwise (seen from $+z$). Then check with Stokes' theorem.`,
        figHtml: figSwirl(),
        hints: [md`Parametrize: $\vb r=R(\cos\varphi,\sin\varphi,0)$, $d\vb l=R(-\sin\varphi,\cos\varphi,0)\,d\varphi$.`, md`On the circle $\vb E=kR(\sin\varphi,-\cos\varphi,0)$, so $\vb E\cdot d\vb l=-kR^2\,d\varphi$.`, md`Stokes: $\curl\vb E=-2k\,\uv z$, and the flat disk has area $\pi R^2$ with $d\vb a$ along $+\uv z$.`],
        parts: [
          { lbl: md`$\oint\vb E\cdot d\vb l$`, expr: '-2*pi*k*R^2', vars: { k: [1, 3], R: [0.5, 2] } },
          { lbl: md`So this field`, mc: [md`is electrostatic, since it is smooth`, md`is electrostatic only if $k<0$`, md`cannot be electrostatic`, md`is electrostatic inside the circle only`], a: 2,
            why: [md`Smoothness is not the test; zero circulation is.`, md`The sign of $k$ only flips the direction of the swirl.`, null, md`Its curl is $-2k\,\uv z$ everywhere, so it fails everywhere.`] },
        ],
        sol: md`
          **Direct.** With $\vb r=R(\cos\varphi,\sin\varphi,0)$: $\vb E=kR(\sin\varphi,-\cos\varphi,0)$ and $d\vb l=R(-\sin\varphi,\cos\varphi,0)\,d\varphi$, so
          $$\vb E\cdot d\vb l=kR^2(-\sin^2\varphi-\cos^2\varphi)\,d\varphi=-kR^2\,d\varphi,\qquad \oint\vb E\cdot d\vb l=-2\pi kR^2 .$$

          **Stokes.** $\curl\vb E=\left(\partial_xE_y-\partial_yE_x\right)\uv z=(-k-k)\,\uv z=-2k\,\uv z$. Through the disk (counterclockwise loop, so $d\vb a$ along $+\uv z$): $-2k\cdot\pi R^2$. Same.

          The field circulates (clockwise, seen from $+z$, for $k>0$), so its curl is nonzero and it cannot be an electrostatic field.
        `,
      }),

      RF(md`
        ### The unit in one picture
        Four statements about the electrostatic field, all from Coulomb's law plus superposition:

        | statement | form | use it when |
        |---|---|---|
        | Coulomb / superposition | $\vb E=\kq\displaystyle\int\dfrac{dq}{\srm^2}\srh$ | no symmetry for Gauss; points on a symmetry axis |
        | Gauss, integral | $\oint\vb E\cdot d\vb a=\Qenc/\ep$ | spherical, cylindrical or planar symmetry (or sums of them) |
        | Gauss, differential | $\divg\vb E=\rho/\ep$ | you are given $\vb E$ and need $\rho$ |
        | curl-free | $\curl\vb E=0$, $\oint\vb E\cdot d\vb l=0$ | testing whether a field is electrostatic; it lets you define $V$ |

        Boundary conditions at a charged surface follow from the last three: $E^\perp$ jumps by $\sigma/\ep$ (pillbox), $E^\parallel$ is continuous (thin loop).

        !!key Patterns to remember
          - Stokes: flux of the curl through an **open** surface = circulation around its **closed** boundary.
          - Any $f(r)\,\uv r$ is curl-free. Every static field is curl-free (superposition of point charges).
          - $\oint\vb E\cdot d\vb l=0$ for every loop, whether or not it circles a charge. Only static fields.
          - Test a candidate field: compute $\curl\vb E$. Nonzero anywhere, or nonzero circulation around some loop, means not electrostatic.
          - Curl-free $\Rightarrow$ path-independent line integrals $\Rightarrow$ a potential $V$ with $\vb E=-\nabla V$ (next unit).
      `),
    ],
  };

  const LESSONS = [L1, L2, L3, L4, L5, L6, L7, L8];

  C.unit({
    id: 'u1', num: 'Unit 1', title: "Electric field and Gauss's law",
    blurb: "Coulomb's law and superposition, fields of lines, rings and disks, flux and Gauss's law, and the divergence and curl of E.",
    lessons: LESSONS,
  });
})();

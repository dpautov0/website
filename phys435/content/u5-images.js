/* Unit 5 — The method of images (Lecture 10, Lecture 11 pp. 1–2; Griffiths 3.2). */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  const DEG = Math.PI / 180;
  const LESSONS = [];
  // Local md tag: like the global one (String.raw), but it also removes the common indentation of
  // lines 2..n, so a string may start right after the backtick and still contain tables or callouts.
  const md = (s, ...v) => {
    const L = String.raw(s, ...v).split('\n');
    if (L.length < 2) return L[0];
    const rest = L.slice(1).filter((l) => l.trim());
    const ind = rest.length ? Math.min(...rest.map((l) => l.match(/^ */)[0].length)) : 0;
    return [L[0]].concat(L.slice(1).map((l) => l.slice(Math.min(ind, l.match(/^ */)[0].length)))).join('\n');
  };

  // ================================================================ drawing helpers
  // angle arc with its label pushed well clear of the arc
  const angleL = (f, cx, cy, r, a0, a1, t, gap = 17) => {
    f.arc(cx, cy, r, a0, a1, { cls: 'dim' });
    const am = (a0 + a1) / 2 * DEG;
    f.label(cx + (r + gap) * Math.cos(am), cy - (r + gap) * Math.sin(am), t, 'c', 'small');
  };
  // side for a label placed outward from a center at angle a (radians)
  const sideOf = (a) => { const c = Math.cos(a), s = Math.sin(a); if (c > 0.38) return s > 0.38 ? 'tr' : s < -0.38 ? 'br' : 'r'; if (c < -0.38) return s > 0.38 ? 'tl' : s < -0.38 ? 'bl' : 'l'; return s > 0 ? 't' : 'b'; };

  // ---------------------------------------------------------------- field lines (2-D slice, point charges)
  function traceLine(charges, x, z, o = {}) {
    const h = o.h || 0.03, n = o.n || 700;
    const U = (x, z) => {
      let ex = 0, ez = 0;
      for (const [c, cx, cz] of charges) { const dx = x - cx, dz = z - cz, r3 = Math.pow(dx * dx + dz * dz, 1.5); ex += c * dx / r3; ez += c * dz / r3; }
      const m = Math.hypot(ex, ez) || 1;
      return [ex / m, ez / m];
    };
    const pts = [[x, z]];
    for (let i = 0; i < n; i++) {
      const k1 = U(x, z), k2 = U(x + h / 2 * k1[0], z + h / 2 * k1[1]), k3 = U(x + h / 2 * k2[0], z + h / 2 * k2[1]), k4 = U(x + h * k3[0], z + h * k3[1]);
      const nx = x + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), nz = z + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (o.floor !== undefined && nz <= o.floor) { const t = (z - o.floor) / (z - nz); pts.push([x + t * (nx - x), o.floor]); break; }
      if (o.box && (nx < o.box[0] || nx > o.box[1] || nz < o.box[2] || nz > o.box[3])) { pts.push([nx, nz]); break; }
      if (o.sinks && o.sinks.some(([sx, sz]) => Math.hypot(nx - sx, nz - sz) < 0.09)) { pts.push([nx, nz]); break; }
      x = nx; z = nz; pts.push([x, z]);
    }
    return pts;
  }
  function drawLines(f, lines, map, o = {}) {
    for (const L of lines) {
      if (L.length < 4) continue;
      const pts = L.filter((_, i) => i % 2 === 0 || i === L.length - 1).map(([x, z]) => map(x, z));
      f.pl(pts, { cls: 'thin' });
      const k = Math.min(pts.length - 2, o.atIx || 9);
      const [x1, y1] = pts[k], [x2, y2] = pts[k + 1];
      f.head(x2, y2, x2 - x1, y2 - y1, { hs: 5.5 });
    }
  }
  const starts = (cx, cz, N, r = 0.07) => [...Array(N)].map((_, k) => { const a = (k + 0.5) / N * 2 * Math.PI; return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });

  // ================================================================ plane figures
  // Side view: charge above a grounded plane. Units: d = 1 -> s px (80). Plane at y = 170.
  // o: { lab, neg, h, qx, pts: [[x, z, 'P', side]], thick, noD, dLab, planeLab, x1 }
  // In 'thick' mode the metal is a block from x = 20 to 260, and points inside it get a leader to a label outside.
  function fPlane(o = {}) {
    const f = PF.fig();
    const s = o.s || 80, X0 = 150, Y0 = 170, h = o.h ?? 1, x2 = o.thick ? 260 : (o.x2 || 320);
    const Pp = (x, z) => [X0 + x * s, Y0 - z * s];
    f.plane(20, x2, Y0, { lab: o.planeLab ?? 'V=0', t: o.thick ? 64 : 10 });
    const [qx, qy] = Pp(o.qx || 0, h);
    const ys = [qy, Y0 - s * 1.15].concat((o.pts || []).filter((p) => Math.abs(p[0]) < 0.3).map((p) => Pp(p[0], p[1])[1]));
    const top = Math.min(...ys) - 40;
    if (o.axis !== false) {
      f.line(X0, Y0, X0, top, { cls: 'dim thin', arrow: 'end', hs: 6 });
      f.label(X0 + 6, top - 2, 'z', 'bl', 'small accent');
    }
    f.charge(qx, qy, { q: o.neg ? '-' : '+', lab: o.lab ?? (o.neg ? '-q' : 'q'), at: o.at || 'r' });
    if (!o.noD) f.dim(qx - 30, qy, qx - 30, Y0, o.dLab || 'd', { at: 'l' });
    for (const [x, z, t, at] of (o.pts || [])) {
      const [px, py] = Pp(x, z);
      f.dot(px, py, 3);
      if (z < 0 && o.thick) { f.line(px + 4, py, x2 + 14, py, { cls: 'dim thin' }); f.label(x2 + 18, py, t, 'l'); } else f.tag(px, py, t, at || 'r');
    }
    return f.svg();
  }
  // Finite plate (for the "is it exact?" question)
  function fPlate() {
    const f = PF.fig();
    f.plane(90, 230, 150, { lab: 'V=0' });
    f.charge(160, 90, { q: '+', lab: 'q', at: 'r' });
    f.dim(130, 90, 130, 150, 'd', { at: 'l' });
    f.dim(90, 150, 230, 150, 'L', { off: 30, at: 'b' });
    return f.svg();
  }
  // Charge off the axis, with coordinates (for the general image rule)
  function fPlaneOff() {
    const f = PF.fig();
    const Y0 = 170, X0 = 70;
    f.plane(20, 320, Y0, { lab: 'V=0' });
    f.line(X0, Y0, X0, 40, { cls: 'dim thin', arrow: 'end', hs: 6 }); f.label(X0 + 6, 38, 'z', 'bl', 'small accent');
    f.charge(210, 90, { q: '+', lab: '(x_0,y_0,z_0)', at: 'r' });
    f.line(210, 90, 210, Y0, { cls: 'dash dim thin' });
    f.dim(180, 90, 180, Y0, 'z_0', { at: 'l' });
    return f.svg();
  }

  // Solution: q and its image, no conductor. o.pt = [x, z, 'label'] shows the distances to a field point.
  function fPair(o = {}) {
    const f = PF.fig();
    const s = o.s || 70, X0 = 170, Y0 = 150;
    const Pp = (x, z) => [X0 + x * s, Y0 - z * s];
    f.line(20, Y0, 320, Y0, { cls: 'dash' });
    f.label(324, Y0, 'z=0', 'l', 'small');
    f.text(22, Y0 + 7, 'no conductor', 'tl');
    const [ax, ay] = Pp(0, 1), [bx, by] = Pp(0, -1);
    if (o.pt) {
      const [px, py] = Pp(o.pt[0], o.pt[1]);
      f.line(ax, ay, px, py, { cls: 'dim' }); f.line(bx, by, px, py, { cls: 'dim' });
      f.dot(px, py, 3); f.tag(px, py, o.pt[2] || 'P', 'r');
      f.label((ax + px) / 2, Math.min(ay, py) - 10, '\\srm_+', 'b', 'small');
      f.label((bx + px) / 2 + 12, (by + py) / 2 + 8, '\\srm_-', 'tl', 'small');
    }
    f.charge(ax, ay, { q: '+', lab: '+q', at: 'l' });
    f.charge(bx, by, { q: '-', lab: '-q', at: 'l', image: true });
    f.dim(X0 - 40, ay, X0 - 40, Y0, ''); f.label(X0 - 46, (ay + Y0) / 2, 'd', 'r', 'small');
    f.dim(X0 - 40, Y0, X0 - 40, by, ''); f.label(X0 - 46, (by + Y0) / 2, 'd', 'r', 'small');
    return f.svg();
  }

  // Region of validity: thick conductor below, real charge above, labels beside the metal.
  function fRegions() {
    const f = PF.fig();
    const Y0 = 110;
    f.plane(20, 230, Y0, { t: 76 });
    f.charge(125, 50, { q: '+', lab: 'q', at: 'r' });
    f.label(244, 60, 'z\\ge 0:\\; V = V_{\\text{pair}}', 'l');
    f.label(244, Y0 + 38, 'z<0:\\; V=0,\\; \\vb E=0', 'l');
    f.label(125, Y0 + 82, '\\text{metal}', 't', 'small accent');
    return f.svg();
  }

  // Perspective view of the plane (lecture F10-1 / Griffiths Fig. 3.14). charges: [[zInUnits, '+'|'-', 'label', 'heightLabel']]
  function fPlane3D(o = {}) {
    const f = PF.fig({ proj: { ox: 160, oy: 175, s: 1 } });
    const c = [[110, -150], [110, 150], [-110, 150], [-110, -150]].map(([x, y]) => f.p3(x, y, 0));
    f.poly(c, { cls: 'shade nodecl' }); f.poly(c, { cls: 'thin' });
    const O = f.p3(0, 0, 0), s = o.s || 64;
    const charges = o.charges || [[1, '+', 'q']];
    const top = Math.max(1, ...charges.map((q) => q[0]));
    const Y = f.p3(0, 175, 0), X = f.p3(150, 0, 0);
    f.line(O[0], O[1], Y[0], Y[1], { cls: 'dim thin', arrow: 'end', hs: 6 }); f.label(Y[0] + 6, Y[1] + 2, 'y', 'l', 'small accent');
    f.line(O[0], O[1], X[0], X[1], { cls: 'dim thin', arrow: 'end', hs: 6 }); f.label(X[0] - 4, X[1] + 4, 'x', 'tr', 'small accent');
    f.line(O[0], O[1], O[0], O[1] - top * s - 40, { cls: 'dim thin', arrow: 'end', hs: 6 });
    f.label(O[0] + 6, O[1] - top * s - 42, 'z', 'bl', 'small accent');
    for (const [z, sg, t, hl] of charges) {
      const y = O[1] - z * s;
      f.charge(O[0], y, { q: sg, lab: t, at: 'r' });
      if (hl) f.label(O[0] - 12, y, hl, 'r', 'small');
    }
    // the back edge of the plane is at y = O[1] - 26.5; keep the d label above it
    const dLabY = (O[1] - s + O[1] - 26.5) / 2;
    if (o.dim) { f.dim(O[0] - 26, O[1] - s, O[0] - 26, O[1], ''); f.label(O[0] - 32, dLabY, 'd', 'r', 'small'); }
    const Lp = f.p3(70, -118, 0);
    f.label(Lp[0] + 6, Lp[1] - 4, o.planeLab || 'V=0', 'c', 'small');
    if (o.wire) {
      const A = f.p3(-110, 0, s), B = f.p3(110, 0, s);
      f.line(A[0], A[1], B[0], B[1], { cls: 'thick' });
      f.label(A[0] + 8, A[1] - 4, '\\lambda', 'bl');
      f.dim(O[0] + 30, O[1] - s, O[0] + 30, O[1], ''); f.label(O[0] + 36, dLabY, 'd', 'l', 'small');
      f.line(O[0], O[1] - s, O[0] + 30, O[1] - s, { cls: 'dim thin dash' });
    }
    return f.svg();
  }

  // Field lines of q above a grounded plane (they end on the plane, at right angles).
  function fLinesPlane() {
    const f = PF.fig();
    const s = 56, X0 = 180, Y0 = 170;
    const map = (x, z) => [X0 + x * s, Y0 - z * s];
    f.plane(X0 - 3 * s, X0 + 3 * s, Y0, { lab: 'V=0' });
    const ch = [[1, 0, 1], [-1, 0, -1]];
    const lines = starts(0, 1, 18).map(([x, z]) => traceLine(ch, x, z, { floor: 0, box: [-3, 3, -1, 2.7], n: 600 }));
    drawLines(f, lines, map, { atIx: 7 });
    f.charge(X0, Y0 - s, { q: '+' });
    return f.svg();
  }

  // Field lines of the pair (left) and of the real problem (right): the energy argument.
  function fHalf() {
    const mk = (real) => {
      const f = PF.fig();
      const s = 42, X0 = 130, Y0 = 130;
      const map = (x, z) => [X0 + x * s, Y0 - z * s];
      const ch = [[1, 0, 1], [-1, 0, -1]];
      const lines = starts(0, 1, 16).map(([x, z]) => traceLine(ch, x, z, real ? { floor: 0, box: [-2.9, 2.9, -2.9, 2.9], n: 700 } : { sinks: [[0, -1]], box: [-2.9, 2.9, -2.9, 2.9], n: 700 }));
      if (real) f.plane(X0 - 2.9 * s, X0 + 2.9 * s, Y0, { t: 2.9 * s - 4 });
      else f.line(X0 - 2.9 * s, Y0, X0 + 2.9 * s, Y0, { cls: 'dash dim' });
      drawLines(f, lines, map, { atIx: 6 });
      f.charge(X0, Y0 - s, { q: '+' });
      if (!real) f.charge(X0, Y0 + s, { q: '-', image: true });
      return f.svg();
    };
    return PF.row([{ svg: mk(false), cap: 'Image pair: field in both halves' }, { svg: mk(true), cap: 'Real problem: field only above, $\\vb E=0$ in the metal' }]);
  }

  // q and its image with the force on q (solution picture).
  function fForcePlane() {
    const f = PF.fig();
    const X0 = 160, Y0 = 140, s = 70;
    f.line(20, Y0, 300, Y0, { cls: 'dash' }); f.label(304, Y0, 'z=0', 'l', 'small');
    f.charge(X0, Y0 - s, { q: '+', lab: '+q', at: 'r' });
    f.charge(X0, Y0 + s, { q: '-', lab: '-q', at: 'r', image: true });
    f.arrow(X0, Y0 - s + 10, X0, Y0 - s + 48, { cls: 'thick' });
    f.label(X0 - 8, Y0 - s + 38, '\\vb F', 'r');
    f.dim(X0 + 50, Y0 - s, X0 + 50, Y0 + s, '');
    f.label(X0 + 56, Y0 - 36, '2d', 'l', 'small');
    return f.svg();
  }

  // The Gaussian hemisphere argument for the total induced charge (solution picture).
  function fGaussHemi() {
    const f = PF.fig();
    const X0 = 170, Y0 = 170, Rb = 140;
    f.plane(10, 330, Y0, { lab: 'V=0' });
    f.pl(f.arcPts(X0, Y0 - 6, Rb, Rb, 180, 0), { cls: 'dash' });
    f.line(X0 - Rb, Y0 - 6, X0 + Rb, Y0 - 6, { cls: 'dash' });
    f.charge(X0, Y0 - 50, { q: '+', lab: 'q', at: 'r' });
    return f.svg();
  }

  // σ(x) along a line through the foot of the charge, units q/d^2.
  const fSigPlane = () => PF.plot({ w: 360, h: 210, x: [-4, 4], y: [-0.18, 0.02], xl: 'x/d', yl: '\\sigma\\;(q/d^2)', zero: true,
    xt: [[-3, '-3'], [-1, '-1'], [1, '1'], [3, '3']], yt: [[-1 / (2 * Math.PI), '-\\tfrac{1}{2\\pi}']],
    curves: [{ f: (x) => -1 / (2 * Math.PI * Math.pow(x * x + 1, 1.5)) }] });

  // V along the z-axis above a grounded plane, units q/(4πε0 d), with the far-field 2d/z^2.
  const fVaxis = () => PF.plot({ w: 360, h: 210, x: [0, 6], y: [0, 2.2], xl: 'z/d', yl: 'V\\;\\big(\\tfrac{q}{4\\pi\\varepsilon_0 d}\\big)',
    xt: [[1, '1'], [2, '2'], [4, '4'], [6, '6']], yt: [[1, '1'], [2, '2']],
    curves: [{ f: (z) => 1 / Math.abs(z - 1) - 1 / (z + 1), n: 600 }, { f: (z) => 2 / (z * z), cls: 'dim dash', from: 1.6, lab: '2d^2/z^2', labAt: 4.2, dy: -16, anchor: 'l' }] });

  // normal-vector pictures: plane, sphere (charge outside), shell (charge inside)
  function fNormals() {
    const a = PF.fig();
    a.plane(10, 170, 110, {});
    a.charge(110, 50, { q: '+', lab: 'q', at: 'r' });
    a.arrow(40, 110, 40, 72, { cls: 'thick' }); a.tag(40, 72, '\\uv n', 'r', 8);
    const b = PF.fig();
    b.hatchBand(b.arcPts(60, 80, 40, 40, 0, 360)); b.circle(60, 80, 40, { cls: 'thick' });
    b.charge(150, 80, { q: '+', lab: 'q', at: 't' });
    const e = [60 + 40 * Math.cos(60 * DEG), 80 - 40 * Math.sin(60 * DEG)], e2 = [e[0] + 30 * Math.cos(60 * DEG), e[1] - 30 * Math.sin(60 * DEG)];
    b.arrow(e[0], e[1], e2[0], e2[1], { cls: 'thick' }); b.tag(e2[0], e2[1], '\\uv n', 'r', 8);
    const c = PF.fig();
    c.hatchBand(c.arcPts(80, 80, 58, 58, 0, 360).concat(c.arcPts(80, 80, 48, 48, 360, 0))); c.circle(80, 80, 48, { cls: 'thick' }); c.circle(80, 80, 58, { cls: 'thin' });
    c.charge(66, 96, { q: '+', lab: 'q', at: 'r' });
    const g = [80 + 48 * Math.cos(50 * DEG), 80 - 48 * Math.sin(50 * DEG)], g2 = [g[0] - 26 * Math.cos(50 * DEG), g[1] + 26 * Math.sin(50 * DEG)];
    c.arrow(g[0], g[1], g2[0], g2[1], { cls: 'thick' }); c.tag(g2[0], g2[1], '\\uv n', 'l', 8);
    return PF.row([{ svg: a.svg(), cap: 'Plane: $\\uv n = +\\uv z$' }, { svg: b.svg(), cap: 'Sphere, $q$ outside: $\\uv n = +\\uv r$' }, { svg: c.svg(), cap: 'Shell, $q$ inside: $\\uv n = -\\uv r$' }]);
  }
  // the same three setups without normals (question version)
  function fThreeSetups() {
    const a = PF.fig();
    a.plane(10, 170, 110, { lab: 'V=0' }); a.charge(90, 50, { q: '+', lab: 'q', at: 'r' });
    const b = PF.fig();
    b.hatchBand(b.arcPts(60, 80, 40, 40, 0, 360)); b.circle(60, 80, 40, { cls: 'thick' }); b.charge(150, 80, { q: '+', lab: 'q', at: 't' });
    b.label(18, 36, 'V=0', 'r', 'small');
    const c = PF.fig();
    c.hatchBand(c.arcPts(80, 80, 58, 58, 0, 360).concat(c.arcPts(80, 80, 48, 48, 360, 0))); c.circle(80, 80, 48, { cls: 'thick' }); c.circle(80, 80, 58, { cls: 'thin' });
    c.charge(66, 96, { q: '+', lab: 'q', at: 'r' }); c.label(140, 24, 'V=0', 'l', 'small');
    return PF.row([{ svg: a.svg(), cap: '(A) plane' }, { svg: b.svg(), cap: '(B) sphere, $q$ outside' }, { svg: c.svg(), cap: '(C) shell, $q$ inside' }]).svg;
  }

  // HW 3.7 side view with images (solution)
  function fHW37Img() {
    const f = PF.fig();
    const X0 = 150, Y0 = 200, s = 34;
    f.line(30, Y0, 280, Y0, { cls: 'dash' }); f.label(284, Y0, 'z=0', 'l', 'small');
    f.line(X0, Y0 + 3.6 * s, X0, Y0 - 3.6 * s, { cls: 'dim thin', arrow: 'end', hs: 6 }); f.label(X0 + 6, Y0 - 3.6 * s - 4, 'z', 'bl', 'small accent');
    const pts = [[3, '+', '+q', false, '3d'], [1, '-', '-2q', false, 'd'], [-1, '+', '+2q', true, '-d'], [-3, '-', '-q', true, '-3d']];
    for (const [z, sg, t, im, hl] of pts) { f.charge(X0, Y0 - z * s, { q: sg, lab: t, at: 'r', image: im }); f.label(X0 - 12, Y0 - z * s, hl, 'r', 'small'); }
    f.text(206, Y0 - 1.9 * s, 'real', 'l'); f.text(206, Y0 + 2 * s, 'images', 'l');
    return f.svg();
  }
  // two equal charges above the plane, side view (practice)
  function fTwoCharges(o = {}) {
    const f = PF.fig();
    const X0 = 170, Y0 = 170, s = 60;
    if (o.img) { f.line(20, Y0, 320, Y0, { cls: 'dash' }); f.label(324, Y0, 'z=0', 'l', 'small'); }
    else f.plane(20, 320, Y0, { lab: 'V=0' });
    f.charge(X0 - s, Y0 - s, { q: '+', lab: 'q', at: 'tl' });
    f.charge(X0 + s, Y0 - s, { q: '+', lab: 'q', at: 'tr' });
    f.dim(X0 - s, Y0 - s - 30, X0 + s, Y0 - s - 30, '2a', { at: 't' });
    f.dim(X0 + s + 34, Y0 - s, X0 + s + 34, Y0, 'a', { at: 'r' });
    if (o.mid) { f.dot(X0, Y0 - s, 3); f.tag(X0, Y0 - s, 'M', 'b'); }
    if (o.img) {
      f.charge(X0 - s, Y0 + s, { q: '-', lab: '-q', at: 'bl', image: true });
      f.charge(X0 + s, Y0 + s, { q: '-', lab: '-q', at: 'br', image: true });
    }
    return f.svg();
  }

  // Line charge seen end-on above a plane (setup, or with its image)
  function fLineSide(o = {}) {
    const f = PF.fig();
    const X0 = 160, Y0 = 160, s = 70;
    if (o.img) { f.line(20, Y0, 300, Y0, { cls: 'dash' }); f.label(304, Y0, 'z=0', 'l', 'small'); }
    else f.plane(20, 300, Y0, { lab: 'V=0' });
    f.charge(X0, Y0 - s, { q: '+', lab: '\\lambda', at: 'r' });
    if (o.img) f.charge(X0, Y0 + s, { q: '-', lab: '-\\lambda', at: 'r', image: true });
    f.dim(X0 - 32, Y0 - s, X0 - 32, Y0, 'd', { at: 'l' });
    if (o.pt) { f.dot(X0 + o.pt * s, Y0, 3); f.tag(X0 + o.pt * s, Y0, o.ptLab || 'y', 'tr'); }
    return f.svg();
  }

  // Dipole above a plane. kind: 'perp' | 'par' | 'tilt'. o.img adds the image dipole (solution).
  function fDipole(kind, o = {}) {
    const f = PF.fig();
    const X0 = 170, Y0 = 150, s = 70, L = 42;
    const ang = kind === 'perp' ? 90 : kind === 'par' ? 0 : 55;
    const u = [Math.cos(ang * DEG), -Math.sin(ang * DEG)];
    if (o.img) { f.line(30, Y0, 300, Y0, { cls: 'dash' }); f.label(304, Y0, 'z=0', 'l', 'small'); }
    else f.plane(30, 300, Y0, { lab: 'V=0' });
    const cx = X0, cy = Y0 - s;
    const labAt = (y, t, cls) => { if (kind === 'par') f.label(cx, y - 12, t, 'b', cls); else f.label(cx + (kind === 'perp' ? 12 : 18), y + (kind === 'perp' ? 0 : 6), t, 'l', cls); };
    f.arrow(cx - u[0] * L / 2, cy - u[1] * L / 2, cx + u[0] * L / 2, cy + u[1] * L / 2, { cls: 'thick' });
    labAt(cy, '\\vb p', '');
    f.dim(X0 - 80, cy, X0 - 80, Y0, 'd', { at: 'l' });
    if (o.img) {
      const v = [-u[0], u[1]];                     // (px, pz) -> (-px, +pz); screen y is -z, so the y-part keeps its sign
      const iy = Y0 + s;
      f.line(cx - v[0] * L / 2, iy - v[1] * L / 2, cx + v[0] * L / 2, iy + v[1] * L / 2, { cls: 'thick dash', arrow: 'end' });
      if (kind === 'par') f.label(cx, iy + 12, "\\vb p'", 't', 'accent');
      else f.label(cx + (kind === 'perp' ? 12 : 18), iy + 6, "\\vb p'", 'l', 'accent');
      f.dim(X0 - 80, Y0, X0 - 80, iy, 'd', { at: 'l' });
    }
    return f.svg();
  }

  // A tilted charged rod above the plane (setup, or with its mirror image)
  function fRod(o = {}) {
    const f = PF.fig();
    const Y0 = 170, A = [110, 70], B = [230, 122];
    if (o.img) { f.line(20, Y0, 320, Y0, { cls: 'dash' }); f.label(324, Y0, 'z=0', 'l', 'small'); }
    else f.plane(20, 320, Y0, { lab: 'V=0' });
    f.line(A[0], A[1], B[0], B[1], { cls: 'thick' });
    f.tag(A[0], A[1], '\\lambda', 'l', 8);
    if (o.img) { f.line(A[0], 2 * Y0 - A[1], B[0], 2 * Y0 - B[1], { cls: 'thick dash' }); f.tag(A[0], 2 * Y0 - A[1], '-\\lambda', 'l', 8, 'accent'); }
    return f.svg();
  }
  // A vertical physical dipole: +q at 2a, -q at a (setup or with images)
  function fVertDipole(o = {}) {
    const f = PF.fig();
    const X0 = 160, Y0 = 170, s = 60;
    if (o.img) { f.line(20, Y0, 300, Y0, { cls: 'dash' }); f.label(304, Y0, 'z=0', 'l', 'small'); }
    else f.plane(20, 300, Y0, { lab: 'V=0' });
    f.charge(X0, Y0 - 2 * s, { q: '+', lab: '+q', at: 'r' });
    f.charge(X0, Y0 - s, { q: '-', lab: '-q', at: 'r' });
    f.dim(X0 - 32, Y0 - 2 * s, X0 - 32, Y0 - s, 'a', { at: 'l' });
    f.dim(X0 - 32, Y0 - s, X0 - 32, Y0, 'a', { at: 'l' });
    if (o.img) {
      f.charge(X0, Y0 + s, { q: '+', lab: '+q', at: 'r', image: true });
      f.charge(X0, Y0 + 2 * s, { q: '-', lab: '-q', at: 'r', image: true });
    }
    return f.svg();
  }

  // Charge between two grounded planes (setup)
  function fTwoPlanes(o = {}) {
    const f = PF.fig();
    const yb = 190, yt = 70, X0 = 160, dpx = o.dpx || 40;
    f.plane(20, 300, yb, { lab: 'V=0' });
    f.plane(20, 300, yt, { side: 'above', lab: 'V=0' });
    f.charge(X0, yb - dpx, { q: '+', lab: 'q', at: 'r' });
    f.dim(X0 - 30, yb - dpx, X0 - 30, yb, o.dLab || 'd', { at: 'l' });
    f.dim(268, yt, 268, yb, 'L', { at: 'l' });
    f.label(24, yb + 14, 'z=0', 'tl', 'small accent'); f.label(24, yt - 14, 'z=L', 'bl', 'small accent');
    return f.svg();
  }
  // The infinite image series (solution), drawn vertically, n = -1, 0, 1.
  function fTwoPlanesImg() {
    const f = PF.fig();
    const X0 = 120, Y0 = 210, Lp = 70, dp = 22;
    const Zs = (z) => Y0 - z;
    f.add(`<rect class="shade nodecl" x="40" y="${Zs(Lp)}" width="210" height="${Lp}"/>`);
    f.line(40, Zs(0), 250, Zs(0), { cls: 'dash' }); f.label(254, Zs(0), 'z=0', 'l', 'small');
    f.line(40, Zs(Lp), 250, Zs(Lp), { cls: 'dash' }); f.label(254, Zs(Lp), 'z=L', 'l', 'small');
    f.line(X0, Zs(-2 * Lp - dp - 30), X0, Zs(2 * Lp + dp + 30), { cls: 'dim thin' });
    const list = [[dp, '+', 'q', false, 'd'], [-dp, '-', '-q', true, '-d'], [2 * Lp - dp, '-', '-q', true, '2L-d'], [2 * Lp + dp, '+', '+q', true, '2L+d'],
      [-2 * Lp + dp, '+', '+q', true, '-2L+d'], [-2 * Lp - dp, '-', '-q', true, '-2L-d']];
    for (const [z, sg, t, im, hl] of list) { f.charge(X0, Zs(z), { q: sg, lab: t, at: 'r', image: im, r: 6.5 }); f.label(X0 - 12, Zs(z), hl, 'r', 'small'); }
    f.label(X0, Zs(2 * Lp + dp + 36), '\\vdots', 'b'); f.label(X0, Zs(-2 * Lp - dp - 36), '\\vdots', 't');
    return f.svg();
  }

  // Hemispherical boss on a grounded plane, charge on the axis (setup)
  function fBoss(o = {}) {
    const f = PF.fig();
    const X0 = 170, Y0 = 170, Rp = 46, A = o.A || 2, t = 10;
    const arc = f.arcPts(X0, Y0, Rp, Rp, 180, 0);
    f.hatchBand([[20, Y0], ...arc, [320, Y0], [320, Y0 + t], [20, Y0 + t]]);
    f.pl([[20, Y0], ...arc, [320, Y0]], { cls: 'thick' });
    f.charge(X0, Y0 - A * Rp, { q: '+', lab: 'q', at: 'r' });
    const e = [X0 - Rp * Math.cos(35 * DEG), Y0 - Rp * Math.sin(35 * DEG)];
    f.line(X0, Y0, e[0], e[1], { arrow: 'end', hs: 6 });
    f.tag(e[0], e[1], 'R', 'tl', 8);
    f.dim(X0 + 44, Y0 - A * Rp, X0 + 44, Y0, 'a', { at: 'r' });
    f.label(316, Y0 + t + 4, 'V=0', 'tr', 'small');
    return f.svg();
  }
  function fBossImg(o = {}) {
    const f = PF.fig();
    const X0 = 150, Y0 = 170, Rp = 46, A = o.A || 2, b = Rp / A;
    f.line(20, Y0, 300, Y0, { cls: 'dash' }); f.label(304, Y0, 'z=0', 'l', 'small');
    f.pl(f.arcPts(X0, Y0, Rp, Rp, 0, 180), { cls: 'dash dim' });
    f.line(X0, Y0 - A * Rp - 30, X0, Y0 + A * Rp + 30, { cls: 'dim thin' });
    const L = [[A * Rp, '+', 'q', false], [b, '-', "q'", true], [-b, '+', "-q'", true], [-A * Rp, '-', '-q', true]];
    for (const [z, sg, t, im] of L) f.charge(X0, Y0 - z, { q: sg, lab: t, at: 'r', image: im, r: 6 });
    f.label(X0 - 12, Y0 - A * Rp, 'a', 'r', 'small'); f.label(X0 - 12, Y0 + A * Rp, '-a', 'r', 'small');
    f.label(X0 - 64, Y0 - b - 4, 'R^2/a', 'r', 'small'); f.label(X0 - 64, Y0 + b + 4, '-R^2/a', 'r', 'small');
    f.line(X0 - 62, Y0 - b, X0 - 9, Y0 - b, { cls: 'dim thin dash' }); f.line(X0 - 62, Y0 + b, X0 - 9, Y0 + b, { cls: 'dim thin dash' });
    return f.svg();
  }

  // Four small setups for "which one can images not do?" (A cube, B sphere, C 45° wedge, D plane at V0)
  function fFourSetups() {
    const a = PF.fig();
    a.hatchBand([[20, 30], [90, 30], [90, 100], [20, 100]]); a.rect(20, 30, 70, 70, { cls: 'thick' });
    a.charge(140, 65, { q: '+', lab: 'q', at: 't' }); a.label(55, 112, 'V=0', 't', 'small');
    const b = PF.fig();
    b.hatchBand(b.arcPts(55, 65, 36, 36, 0, 360)); b.circle(55, 65, 36, { cls: 'thick' });
    b.charge(140, 65, { q: '+', lab: 'q', at: 't' }); b.label(55, 109, 'V=0', 't', 'small');
    const c = PF.fig();
    const e = [20 + 120 * Math.cos(45 * DEG), 110 - 120 * Math.sin(45 * DEG)];
    c.plane(20, 140, 110, {}); c.hatchBand([[20, 110], e, [e[0] - 7, e[1] - 7], [13, 103]]); c.line(20, 110, e[0], e[1], { cls: 'thick' });
    c.charge(20 + 75 * Math.cos(22.5 * DEG), 110 - 75 * Math.sin(22.5 * DEG), { q: '+', lab: 'q', at: 'r' });
    c.label(136, 124, 'V=0', 'tr', 'small');
    const d = PF.fig();
    d.plane(10, 150, 100, { lab: 'V=V_0' }); d.charge(80, 45, { q: '+', lab: 'q', at: 'r' });
    return PF.row([{ svg: a.svg(), cap: '(A) cube' }, { svg: b.svg(), cap: '(B) sphere' }, { svg: c.svg(), cap: '(C) 45° wedge' }, { svg: d.svg(), cap: '(D) plane at $V_0$' }]).svg;
  }

  // ================================================================ corners and wedges
  // Two grounded half-planes at right angles, q at (a, b) (units s px).
  function fCorner(o = {}) {
    const f = PF.fig();
    const ox = 60, oy = 230, s = o.s || 60, a = o.a ?? 2, b = o.b ?? 1.5;
    f.plane(ox, ox + 260, oy, {});
    f.wall(ox, oy, oy - 210, { side: 'left' });
    f.label(ox + 256, oy + 14, 'V=0', 'tr', 'small');
    f.label(ox - 14, oy - 196, 'V=0', 'r', 'small');
    f.label(ox + 266, oy - 4, 'x', 'bl', 'small accent'); f.label(ox + 6, oy - 214, 'y', 'bl', 'small accent');
    const qx = ox + a * s, qy = oy - b * s;
    f.line(qx, qy + 8, qx, oy, { cls: 'dash dim thin' }); f.line(qx - 8, qy, ox, qy, { cls: 'dash dim thin' });
    f.charge(qx, qy, { q: o.neg ? '-' : '+', lab: o.lab || 'q', at: 'tr' });
    f.dim(ox, oy, qx, oy, o.aLab || 'a', { off: 26, at: 'b' });
    f.dim(ox, oy, ox, qy, o.bLab || 'b', { off: -26, at: 'l' });
    for (const [x, y, t, at] of (o.pts || [])) { f.dot(ox + x * s, oy - y * s, 3); f.tag(ox + x * s, oy - y * s, t, at || 'r'); }
    return f.svg();
  }
  // Image system for the corner (solution). o.forces draws the three image forces and the net. o.only2: the wrong two-image guess.
  function fCornerImg(o = {}) {
    const f = PF.fig();
    const ox = 170, oy = 150, s = o.s || 50, a = o.a ?? 2, b = o.b ?? 1.5;
    f.add(`<rect class="shade nodecl" x="${ox}" y="${oy - 135}" width="160" height="135"/>`);
    f.line(ox - 160, oy, ox + 160, oy, { cls: 'dash dim' }); f.line(ox, oy + 135, ox, oy - 135, { cls: 'dash dim' });
    const Qs = [[a, b, '+', '+q', false, o.forces ? 'tl' : 'tr'], [-a, b, '-', '-q', true, 'tl'], [a, -b, '-', '-q', true, 'br']];
    if (!o.only2) Qs.push([-a, -b, '+', '+q', true, 'bl']);
    if (!o.forces && !o.only2) f.rect(ox - a * s, oy - b * s, 2 * a * s, 2 * b * s, { cls: 'dim thin dash' });
    for (const [x, y, sg, t, im, at] of Qs) f.charge(ox + x * s, oy - y * s, { q: sg, lab: t, at, image: im });
    if (o.forces) {
      const qx = ox + a * s, qy = oy - b * s;
      f.arrow(qx - 9, qy, qx - 52, qy, { cls: 'dim' }); f.arrow(qx, qy + 9, qx, qy + 46, { cls: 'dim' });
      const r = Math.hypot(a, b), ux = a / r, uy = b / r;
      f.arrow(qx + 9 * ux, qy - 9 * uy, qx + 28 * ux, qy - 28 * uy, { cls: 'dim' });
      f.arrow(qx - 6, qy + 6, qx - 36, qy + 36, { cls: 'thick' });
      f.label(qx - 40, qy + 40, '\\vb F', 'tr');
    }
    return f.svg();
  }
  // A wedge of opening angle deg with q on the bisector (or at angle phi).
  function fWedge(deg, o = {}) {
    const f = PF.fig();
    const ox = deg > 90 ? 160 : 50, oy = 220, Lw = 230, t = 10;
    const u = [Math.cos(deg * DEG), -Math.sin(deg * DEG)];
    const nrm = [-Math.sin(deg * DEG), -Math.cos(deg * DEG)];
    f.plane(ox, ox + Lw, oy, {});
    const e = [ox + Lw * u[0], oy + Lw * u[1]];
    f.hatchBand([[ox, oy], e, [e[0] + t * nrm[0], e[1] + t * nrm[1]], [ox + t * nrm[0], oy + t * nrm[1]]]);
    f.line(ox, oy, e[0], e[1], { cls: 'thick' });
    angleL(f, ox, oy, 34, 0, deg, o.angLab || `${deg}^\\circ`);
    const phi = (o.phi ?? deg / 2) * DEG, rq = o.rq || 140;
    f.charge(ox + rq * Math.cos(phi), oy - rq * Math.sin(phi), { q: '+', lab: 'q', at: 'r' });
    f.label(ox + Lw - 4, oy + t + 4, 'V=0', 'tr', 'small');
    f.label(e[0] + 10, e[1] + 6, 'V=0', 'l', 'small');
    return f.svg();
  }
  // Images for a wedge of angle 180/n degrees, q on the bisector.
  function fWedgeImg(n) {
    const f = PF.fig();
    const cx = 150, cy = 140, r = 90, al = 180 / n;
    for (let k = 0; k < n; k++) {
      const a = k * al * DEG;
      f.line(cx - 125 * Math.cos(a), cy + 125 * Math.sin(a), cx + 125 * Math.cos(a), cy - 125 * Math.sin(a), { cls: k < 2 ? 'dash' : 'dash dim thin' });
    }
    for (let j = 0; j < 2 * n; j++) {
      const a = (al / 2 + j * al) * DEG, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
      const sg = j % 2 ? '-' : '+';
      f.charge(x, y, { q: sg, lab: j === 0 ? 'q' : (sg === '+' ? '+q' : '-q'), at: sideOf(a), image: j > 0 });
    }
    angleL(f, cx, cy, 30, 0, al, `${Math.round(al)}^\\circ`);
    return f.svg();
  }
  // 120 degree wedge: reflecting back and forth puts an image inside the wedge.
  function fWedge120() {
    const f = PF.fig();
    const cx = 150, cy = 150, r = 92, p0 = 40;
    f.line(cx, cy, cx + 130, cy, { cls: 'dash' });
    f.line(cx, cy, cx + 130 * Math.cos(120 * DEG), cy - 130 * Math.sin(120 * DEG), { cls: 'dash' });
    f.line(cx, cy, cx + 130 * Math.cos(240 * DEG), cy - 130 * Math.sin(240 * DEG), { cls: 'dash dim thin' });
    const L = [[p0, '+', 'q', false], [-p0, '-', '-q', true], [240 - p0, '-', '-q', true], [240 + p0, '+', '+q', true], [120 + p0, '+', '+q', true], [120 - p0, '-', '-q', true]];
    for (const [ang, sg, t, im] of L) {
      const a = ang * DEG, x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
      f.charge(x, y, { q: sg, lab: ang === 120 - p0 ? '' : t, at: sideOf(a), image: im });
    }
    const bad = (120 - p0) * DEG, bx = cx + r * Math.cos(bad), by = cy - r * Math.sin(bad);
    f.circle(bx, by, 14, { cls: 'thick' });
    f.tag(bx, by, '-q', 't', 20, 'accent');
    angleL(f, cx, cy, 30, 0, 120, '120^\\circ', 18);
    return f.svg();
  }

  // ================================================================ spheres
  // Metal sphere with a charge outside (setup). Units: R = 1 -> Rp px. o: { A (a/R), lab, qlab, neg, noA, ground, pts:[[r, thetaDeg, 't', side]] }
  function fSphere(o = {}) {
    const f = PF.fig();
    const Rp = o.Rp || 48, A = o.A || 2.4, cx = 70, cy = 110;
    const qx = cx + A * Rp;
    f.hatchBand(f.arcPts(cx, cy, Rp, Rp, 0, 360));
    f.circle(cx, cy, Rp, { cls: 'thick' });
    f.line(cx + Rp, cy, qx - 8, cy, { cls: 'dim thin' });
    f.dot(cx, cy, 2.4);
    const ra = 215 * DEG, ex = cx + Rp * Math.cos(ra), ey = cy - Rp * Math.sin(ra);
    f.line(cx, cy, ex, ey, { arrow: 'end', hs: 6 });
    f.tag(ex, ey, 'R', 'bl', 8);
    f.label(cx - Rp * 0.72 - 4, cy - Rp * 0.72 - 4, o.lab ?? 'V=0', 'br', 'small');
    f.charge(qx, cy, { q: o.neg ? '-' : '+', lab: o.qlab || 'q', at: 'b' });
    if (!o.noA) f.dim(cx, cy - Rp - 16, qx, cy - Rp - 16, o.aLab || 'a', { at: 't' });
    if (!o.noA) { f.line(cx, cy - 4, cx, cy - Rp - 20, { cls: 'dim thin' }); f.line(qx, cy - 9, qx, cy - Rp - 20, { cls: 'dim thin' }); }
    if (o.ground) { f.line(cx, cy + Rp, cx, cy + Rp + 14); f.ground(cx, cy + Rp + 14); }
    for (const [r, th, t, at] of (o.pts || [])) {
      const x = cx + r * Rp * Math.cos(th * DEG), y = cy - r * Rp * Math.sin(th * DEG);
      f.dot(x, y, 3); f.tag(x, y, t, at || 'r');
    }
    return f.svg();
  }
  // Image picture for the sphere (solution): the metal is gone, its surface is dashed.
  // o: { A, center: label of a center charge, centerSign, imgLab, noDims, surfLab }
  function fSphereImg(o = {}) {
    const f = PF.fig();
    const Rp = o.Rp || 56, A = o.A || 2.4, cx = 80, cy = 110;
    const qx = cx + A * Rp, bx = cx + Rp / A;
    f.circle(cx, cy, Rp, { cls: 'dash dim' });
    f.line(cx, cy, qx, cy, { cls: 'dim thin' });
    f.label(cx - Rp * 0.72 - 4, cy - Rp * 0.72 - 4, o.surfLab ?? 'V=0', 'br', 'small');
    if (o.center) f.charge(cx, cy, { q: o.centerSign || '+', lab: o.center, at: 'tl', image: true, r: 6.5 });
    else f.dot(cx, cy, 2.4);
    f.charge(bx, cy, { q: '-', lab: o.imgLab || "q'", at: 't', image: true, r: 6.5 });
    f.charge(qx, cy, { q: '+', lab: 'q', at: 't' });
    if (!o.noDims) {
      f.dim(cx, cy, bx, cy, 'b', { off: 18, at: 'b' });
      f.dim(cx, cy, qx, cy, 'a', { off: Rp + 16, at: 'b' });
    }
    return f.svg();
  }
  // The law-of-cosines triangle (lecture F10-4 / Griffiths Fig. 3.13).
  function fTriangle() {
    const f = PF.fig();
    const O = [40, 160], Qp = [110, 160], Qr = [290, 160], Pt = [150, 46];
    f.line(O[0], O[1], Qp[0] - 6, Qp[1], { cls: 'dim thin' }); f.line(Qp[0] + 6, Qp[1], Qr[0] - 6, Qr[1], { cls: 'dim thin' });
    f.line(O[0], O[1], Pt[0], Pt[1]); f.line(Qp[0], Qp[1] - 6, Pt[0], Pt[1]); f.line(Qr[0], Qr[1], Pt[0], Pt[1]);
    f.dot(O[0], O[1], 3); f.label(O[0] - 7, O[1], 'O', 'r', 'small');
    f.charge(Qp[0], Qp[1], { q: '-', lab: "q'", at: 'tl', image: true, r: 6 });
    f.charge(Qr[0], Qr[1], { q: '+', lab: 'q', at: 'tr', r: 6 });
    f.dot(Pt[0], Pt[1], 3); f.label(Pt[0] + 8, Pt[1] - 6, '\\text{point of interest}', 'bl', 'small');
    f.label((O[0] + Pt[0]) / 2 - 8, (O[1] + Pt[1]) / 2 - 4, 'r', 'br');
    f.label((Qp[0] + Pt[0]) / 2 + 8, (Qp[1] + Pt[1]) / 2 + 8, "\\srm'", 'l');
    f.label((Qr[0] + Pt[0]) / 2 + 10, (Qr[1] + Pt[1]) / 2 - 8, '\\srm', 'bl');
    angleL(f, O[0], O[1], 24, 0, Math.atan2(O[1] - Pt[1], Pt[0] - O[0]) / DEG, '\\theta', 15);
    f.dim(O[0], O[1], Qp[0], Qp[1], 'b', { off: 22, at: 'b' });
    f.dim(O[0], O[1], Qr[0], Qr[1], 'a', { off: 52, at: 'b' });
    return f.svg();
  }
  // Charge inside a grounded spherical shell (setup)
  function fShell(o = {}) {
    const f = PF.fig();
    const Rp = 80, t = 10, cx = 110, cy = 110, A = o.A ?? 0.5;
    f.hatchBand(f.arcPts(cx, cy, Rp + t, Rp + t, 0, 360).concat(f.arcPts(cx, cy, Rp, Rp, 360, 0)));
    f.circle(cx, cy, Rp, { cls: 'thick' }); f.circle(cx, cy, Rp + t, { cls: 'thin' });
    f.dot(cx, cy, 2.4);
    const ra = 130 * DEG, ex = cx + Rp * Math.cos(ra), ey = cy - Rp * Math.sin(ra);
    f.line(cx, cy, ex, ey, { arrow: 'end', hs: 6 }); f.label((cx + ex) / 2 + 9, (cy + ey) / 2 - 2, 'R', 'l');
    const qx = cx + A * Rp;
    if (A > 0) f.dim(cx, cy, qx, cy, 'a', { off: 18, at: 'b' });
    f.charge(qx, cy, { q: '+', lab: 'q', at: 'tr' });
    f.label(cx + (Rp + t) * 0.72 + 4, cy - (Rp + t) * 0.72 - 4, o.lab ?? 'V=0', 'bl', 'small');
    return f.svg();
  }
  function fShellImg(o = {}) {
    const f = PF.fig();
    const Rp = 70, cx = 90, cy = 110, A = o.A ?? 0.5, B = 1 / A;
    f.circle(cx, cy, Rp, { cls: 'dash dim' });
    f.dot(cx, cy, 2.4);
    f.line(cx, cy, cx + B * Rp, cy, { cls: 'dim thin' });
    f.charge(cx + A * Rp, cy, { q: '+', lab: 'q', at: 't' });
    f.charge(cx + B * Rp, cy, { q: '-', lab: "q'", at: 't', image: true });
    f.dim(cx, cy, cx + A * Rp, cy, 'a', { off: 20, at: 'b' });
    f.dim(cx, cy, cx + B * Rp, cy, 'b', { off: Rp + 14, at: 'b' });
    f.label(cx - Rp * 0.72 - 4, cy - Rp * 0.72 - 4, 'V=0', 'br', 'small');
    return f.svg();
  }
  // equivalence picture (lecture F11-3)
  const fEquiv = () => PF.row([{ svg: fSphere({ A: 2.2, Rp: 42 }), cap: 'Real problem' }, { svg: fSphereImg({ A: 2.2, Rp: 42, surfLab: '' }), cap: 'Image system: the same $V$ for $r>R$' }]);

  // ================================================================ plots
  const sigSph = (A) => (t) => -(A * A - 1) / (4 * Math.PI * Math.pow(1 + A * A - 2 * A * Math.cos(t), 1.5));
  const fSigSphere = (A) => PF.plot({ w: 360, h: 210, x: [0, Math.PI], y: [Math.min(-0.05, sigSph(A)(0) * 1.12), 0.02], xl: '\\theta', yl: '\\sigma\\;(q/R^2)', zero: true,
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[sigSph(A)(0), U.fmt(sigSph(A)(0), 3)]],
    curves: [{ f: sigSph(A) }] });
  // σ(θ) for a = 2R (solid) and a = 3R (dashed)
  const fSigSphere23 = () => PF.plot({ w: 360, h: 210, x: [0, Math.PI], y: [-0.27, 0.02], xl: '\\theta', yl: '\\sigma\\;(q/R^2)', zero: true,
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[sigSph(2)(0), '-0.239'], [sigSph(3)(0), '-0.080']],
    curves: [{ f: sigSph(2) }, { f: sigSph(3), cls: 'dim dash' }] });
  const fWplot = () => PF.plot({ w: 360, h: 220, x: [1, 5], y: [-1.2, 0.05], xl: 'a/R', yl: 'W\\;\\big(\\tfrac{q^2}{4\\pi\\varepsilon_0R}\\big)', zero: true,
    xt: [[2, '2'], [3, '3'], [4, '4'], [5, '5']], yt: [[-1, '-1'], [-0.5, '-0.5']],
    curves: [{ f: (A) => -0.5 / (A * A - 1), from: 1.18 }, { f: (A) => -0.25 / (A - 1), cls: 'dim dash', from: 1.2, to: 2.2 }] });

  // shared setup figures (built once)
  const FP = fPlane();

  // ================================================================ Lesson 1: the idea
  {
    const FP3 = fPlane({ pts: [[0, 3, 'P', 'r']] });
    const FPthick = fPlane({ thick: true, pts: [[0.8, -0.5, 'P']] });
    LESSONS.push({
      id: 'u5-idea', title: 'The idea: trade the conductor for image charges',
      steps: [
        RF(md`
          Lecture 10 opens with a problem you can't do with Coulomb's law alone.

          A point charge $q$ is held a height $d$ above an infinite conducting plane, and the plane is grounded. Find the potential above the plane.

          [[fig:setup]]

          The charge $q$ pulls negative charge onto the part of the plane underneath it. The potential above the plane is the potential of $q$ **plus** the potential of that induced charge, and you know neither how much charge is induced nor how it is spread. So you can't just add up Coulomb potentials.

          Treat it as a boundary-value problem instead. The lecture writes the conditions right next to the drawing.

          **Region of interest:** $z\ge0$. The only charge there is $q$ at $(0,0,d)$, so $V$ obeys Poisson's equation $\nabla^2V = -\rho/\varepsilon_0$ with that one point charge as its source.

          **Boundary conditions:**

          1. $V(x,y,0) = 0$: the plane is grounded.
          2. $V(\infty) = 0$: far from the charge ($x^2+y^2+z^2 \gg d^2$) the potential dies off.

          !!key The licence to guess: uniqueness (Unit 4)
            If $\rho$ is given in a region and $V$ is given on every boundary of that region, Poisson's equation has exactly one solution there. So **any** function that has the right $\rho$ in the region and meets every boundary condition is *the* answer, however you found it.

          (The recap at the top of the notes writes $\nabla^2 V = \rho/\varepsilon_0$. The minus sign is missing: Poisson's equation is $\nabla^2V = -\rho/\varepsilon_0$.)
        `, { setup: { svg: fPlane3D({ dim: true }), cap: md`The lecture's picture: $q$ a height $d$ above the grounded plane $z=0$.` } }),

        Q(md`The plane in the figure is **grounded**. Which boundary condition does that word give you?`,
          [md`$V(x,y,0) = 0$`, md`$\sigma = 0$ everywhere on the plane`, md`$\vb E = 0$ just above the plane`, md`The total charge on the plane is zero`], 0,
          [null,
            md`Grounded fixes the potential, not the charge. The plane carries whatever surface charge it needs; here it is nonzero everywhere.`,
            md`$\vb E = 0$ holds *inside* the metal. Just above the surface $\vb E = (\sigma/\varepsilon_0)\uv n$, which is not zero once charge is induced.`,
            md`Zero total charge describes an *isolated, neutral* conductor. A grounded conductor is connected to the earth, which supplies charge freely; this plane ends up holding $-q$.`],
          md`"Grounded" means connected to the earth, which is the zero of potential (the same zero as infinity). So the condition is $V=0$ on the whole conductor. It says nothing about how much charge the conductor holds: the earth supplies whatever is needed.

          Translating words into boundary conditions:

          | Words | Condition on the conductor |
          |---|---|
          | grounded | $V = 0$ |
          | held at potential $V_0$ | $V = V_0$ |
          | isolated, total charge $Q$ | $V$ = some constant (unknown), and $\oint\sigma\,da = Q$ |
          | isolated and neutral | the same, with $Q = 0$ |

          Add $V\to0$ at infinity when all the charges are in a finite region.`,
          { figHtml: FP }),

        Q(md`Why can't you find $V$ above the plane simply by adding up Coulomb potentials?`,
          [md`Coulomb's law does not hold near a conductor.`, md`The plane is infinite, so any Coulomb integral over it diverges.`, md`The induced surface charge is unknown: both how much there is and where it sits.`, md`The potential of a point charge is undefined at $z=0$.`], 2,
          [md`Coulomb's law and superposition always hold. If you knew every charge, including the induced charge, you could add them up.`,
            md`The induced charge turns out to total $-q$ and to fall off quickly with distance, so the integral would converge. Divergence is not the obstacle.`,
            null,
            md`A point charge's potential is singular only at the charge itself, at $z=d$. On the plane it is finite.`],
          md`Superposition is fine, but it needs all the charges, and the induced $\sigma$ is exactly what you don't know. The method of images turns this around: get $V$ from the boundary conditions first, then read $\sigma$ off $V$.`,
          { figHtml: FP }),

        Q(md`Which of these is a complete statement of the problem in the region $z\ge0$?`,
          [md`$\nabla^2V = 0$ for $z>0$, and $V(x,y,0)=0$`,
            md`$\nabla^2V = -\rho/\varepsilon_0$ with $\rho$ the point charge $q$ at $(0,0,d)$; $V(x,y,0)=0$; $V\to0$ far away`,
            md`$\nabla^2V = -\rho/\varepsilon_0$ with $\rho$ including the induced charge on the plane; $V\to0$ far away`,
            md`$\vb E = 0$ on the plane, and $V\to0$ far away`], 1,
          [md`There is a point charge in the region, so it is Poisson's equation, not Laplace's. The condition at infinity is also missing.`,
            null,
            md`The induced charge sits on the boundary, not inside the region. It enters through the condition $V=0$ on the plane, not through $\rho$. (And you don't know it.)`,
            md`$\vb E$ is not zero just above the plane; it is perpendicular to it. The surface condition for a grounded conductor is $V=0$.`],
          md`A boundary-value problem has three parts: the region ($z\ge0$), the equation in it (Poisson, with the charge that is actually in the region), and the values on **every** boundary (the plane and infinity). With all three fixed, uniqueness says there is exactly one solution.`,
          { figHtml: FP }),

        Q(md`You find a function $V_g(x,y,z)$ that satisfies Poisson's equation with the point charge at $(0,0,d)$ for $z>0$, is zero on $z=0$, and goes to zero far away. What does uniqueness let you conclude?`,
          [md`$V_g$ is the potential everywhere, including below the plane.`, md`$V_g$ is one possible potential; you still have to rule out others.`, md`$V_g$ is correct only on the plane itself.`, md`$V_g$ is the potential for $z\ge0$. It says nothing about $z<0$.`], 3,
          [md`Uniqueness covers the region where you specified $\rho$ and the boundary values. Below the plane is the metal, a different region, where $V=0$.`,
            md`That is exactly what uniqueness rules out: with $\rho$ and the boundary values fixed, there is only one solution.`,
            md`It is correct throughout the region $z\ge0$, not just on its boundary.`,
            null],
          md`This is the logic of every image problem: **right charge in the region + every boundary condition met = the answer in that region.** How you found the function doesn't matter. That is why guessing, here with an image charge, is a legitimate method.`,
          { figHtml: FP }),

        RF(md`
          ### The trick: imagine there is no conductor

          The question asked in class: if there were no conductor, how would you make the potential zero on the plane $z=0$? Put a charge $-q$ at $z=-d$, the mirror point.

          [[fig:pair]]

          For this pair of point charges, and nothing else,

          $$V(x,y,z) = \frac{q}{4\pi\varepsilon_0\,\srm_+} - \frac{q}{4\pi\varepsilon_0\,\srm_-} = \frac{q}{4\pi\varepsilon_0}\left[\frac{1}{\sqrt{x^2+y^2+(z-d)^2}} - \frac{1}{\sqrt{x^2+y^2+(z+d)^2}}\right],$$

          where $\srm_+$ and $\srm_-$ are the distances from $+q$ at $(0,0,d)$ and from $-q$ at $(0,0,-d)$ to the field point.

          Now **check it against the real problem**, one condition at a time:

          - **Charge in the region.** For $z>0$ the only charge is $q$ at $(0,0,d)$, as in the real problem; the $-q$ is below the plane. So this $V$ solves the same Poisson equation for $z>0$.
          - **Condition 1, $V(x,y,0)=0$.** A point $(x,y,0)$ is the same distance $\sqrt{x^2+y^2+d^2}$ from both charges, so the two terms cancel.
          - **Condition 2, $V(\infty)=0$.** Each term goes to zero far away.

          Every condition holds, so by uniqueness this **is** the potential of the real problem for $z\ge0$. The $-q$ is called the **image charge**: the conductor acts like a mirror for charge, with the sign flipped.

          !!intuition Why a mirror charge works
            A grounded plane is an equipotential, so the field meets it at right angles. The field of a $\pm q$ pair crosses the plane halfway between them at right angles too, by symmetry. Above the plane the two field patterns are identical, so the two potentials are identical.
        `, { pair: { svg: fPair(), cap: md`The image pair. There is no metal in this picture: $z=0$ is just the surface where the pair's $V$ happens to be zero.` } }),

        Q(md`Remove the conductor. Where should you put **one** extra charge so that $V=0$ on the whole plane $z=0$?`,
          [md`$+q$ at $(0,0,-d)$`, md`$-q$ at $(0,0,-2d)$`, md`$-q$ at $(0,0,-d)$`, md`$-q/2$ at the origin`], 2,
          [md`With the same sign the terms add: on the plane $V = \dfrac{2q}{4\pi\varepsilon_0\sqrt{x^2+y^2+d^2}}$, not zero.`,
            md`A point on the plane is $\sqrt{x^2+y^2+d^2}$ from $q$ but $\sqrt{x^2+y^2+4d^2}$ from this charge, so the two terms don't cancel.`,
            null,
            md`A charge sitting on the plane makes $V$ infinite at the origin, so $V=0$ fails there; elsewhere the distances and sizes don't match either.`],
          md`The plane has to be the perpendicular bisector of the pair, so every point on it is equidistant from both charges. Then the extra charge must be equal and opposite so the equal distances give cancelling terms: $-q$ at the mirror point $(0,0,-d)$.`,
          { figHtml: FP }),

        Q(md`Using the image solution, what is $V$ at the point $P=(0,0,3d)$?`,
          [md`$\kq\dfrac{q}{4d}$`, md`$\kq\dfrac{q}{2d}$`, md`$\kq\dfrac{3q}{4d}$`, md`$\kq\dfrac{q}{3d}$`], 0,
          [null,
            md`That is $q$ alone (distance $2d$). It leaves out the induced charge, which the image stands for.`,
            md`You added the image's potential instead of subtracting it: $\dfrac{1}{2d} + \dfrac{1}{4d}$.`,
            md`$3d$ is the distance from the plane, not from either charge. Use $\srm_+ = 3d - d$ and $\srm_- = 3d + d$.`],
          md`$\srm_+ = 3d - d = 2d$ and $\srm_- = 3d + d = 4d$, so

          $$V = \kq\left(\frac{q}{2d} - \frac{q}{4d}\right) = \kq\,\frac{q}{4d}.$$

          The induced charge cuts the potential at $P$ in half compared with $q$ alone.`,
          { figHtml: FP3 }),

        Q(md`What is the sign of $V$ in the region $z>0$?`,
          [md`Negative near the plane, positive near $q$`, md`Positive everywhere in $z>0$`, md`Zero except close to $q$`, md`It changes sign depending on $x$ and $y$`], 1,
          [md`Any point with $z>0$ is closer to $+q$ than to $-q$, so $q/\srm_+ > q/\srm_-$ and $V>0$. There is no negative region above the plane.`,
            null,
            md`$V=0$ only on the plane and at infinity.`,
            md`The comparison $\srm_+ < \srm_-$ holds for every point with $z>0$, whatever $x$ and $y$ are.`],
          md`A point with $z>0$ is on the same side as $+q$, so $\srm_+ < \srm_-$ and $V>0$. Another way to see it: $V$ is $0$ on every boundary and $+\infty$ at $q$, and a solution of Laplace's equation has no local minimum in a charge-free region, so $V$ can't dip below zero anywhere above the plane.`,
          { figHtml: FP }),

        Q(md`In the image construction, which boundary condition is the image's position and sign **chosen** to satisfy? (The others then hold on their own.)`,
          [md`$V\to0$ at infinity`, md`The charge density in $z>0$`, md`None in particular; all of them had to be tuned together`, md`$V=0$ on the plane $z=0$`], 3,
          [md`Any finite set of point charges gives $V\to0$ far away. That one comes free.`,
            md`An image anywhere below the plane leaves $\rho$ in $z>0$ unchanged. That only says where the image must *not* go; it doesn't pick the spot.`,
            md`Only the plane condition pins the image down. The other two hold for any image placed below the plane.`,
            null],
          md`Mirror point plus opposite sign is exactly what makes every point of the plane equidistant from $\pm q$ with cancelling terms. Keeping the image below the plane leaves $\rho$ in the region alone, and $V\to0$ at infinity is automatic. In every image problem the images are designed around the **conductor's surface condition**.`,
          { figHtml: FP }),

        Q(md`A classmate proposes $V = \kq\dfrac{q}{\srm_+} - \kq\dfrac{q}{\srm_-} + E_0z$ with a constant $E_0\ne0$. It has the right charge above the plane and vanishes on $z=0$. Why is it not the answer to this problem?`,
          [md`The extra term does not satisfy Laplace's equation.`, md`The extra term adds charge to the region $z>0$.`, md`It violates $V\to0$ far away, so it solves a different problem: the plane in an applied uniform field.`, md`It is also an answer: uniqueness allows any function that vanishes on the plane.`], 2,
          [md`$\nabla^2(E_0z) = 0$, so the equation is still satisfied.`,
            md`A term with $\nabla^2 = 0$ adds no charge.`,
            null,
            md`Uniqueness needs **every** boundary condition, including the one at infinity. This function grows without bound as $z\to\infty$.`],
          md`Both conditions matter. $V=0$ on the plane alone allows many solutions (add any $E_0z$); the condition at infinity picks one of them. The extra term would describe the plane sitting in a uniform external field $-E_0\uv z$, which is a different physical situation.`,
          { figHtml: FP }),

        RF(md`
          ### Two things to keep straight

          !!key Starred rule from the notes: images go outside the region of interest
            Image charges must be located outside the region where you calculate $V(\vb r)$ and $\vb E(\vb r)$. An image inside that region changes $\rho(\vb r)$ there, and then your function solves a different Poisson equation, so uniqueness no longer vouches for it.

          **The image is fictitious.** There is no charge at $z=-d$, and there is no charge anywhere inside the metal. What is real is the **induced surface charge** on top of the plane. It arranges itself so that, seen from above, it produces exactly the field of a point charge $-q$ at the mirror point. (Recall screening: the charges in a conductor move until $\vb E=0$ inside.)

          So the image formula has a region of validity:

          [[fig:regions]]

          - $z\ge0$: $V$ is the two-charge formula.
          - $z<0$, inside the metal: $V=0$ and $\vb E=0$. The two-charge formula would give a negative $V$ there, which is wrong.
        `, { regions: { svg: fRegions(), cap: md`The image formula holds only in the region of interest. The metal is at $V=0$ throughout.` } }),

        Q(md`Why must an image charge sit outside the region where you want $V$?`,
          [md`An image inside the region changes $\rho$ there, so the guess solves a different Poisson equation.`, md`An image inside the region would make $V$ infinite there, which is never allowed.`, md`The image stands for real charge, which can only be inside the conductor.`, md`An image inside the region would spoil the condition at infinity.`], 0,
          [null,
            md`$V$ is infinite at the real charge too. The problem is that the extra source isn't in the real problem.`,
            md`The image is fictitious; it doesn't stand for charge at that spot. It just has to be outside the region you solve in.`,
            md`A finite charge anywhere still gives $V\to0$ at infinity.`],
          md`Uniqueness compares functions with the **same** $\rho$ in the region. An image in the region adds a point charge there, so your function would solve a different problem. This is the starred rule in the notes, and it is how you reject wrong roots later (for the sphere).`,
          { figHtml: FP }),

        Q(md`The point $P$ is inside the metal, a distance $d/2$ below the surface. What is the actual potential at $P$?`,
          [md`$\kq\left(\dfrac{q}{\srm_+} - \dfrac{q}{\srm_-}\right)$ evaluated at $P$`, md`It can't be found without knowing $\sigma$.`, md`$0$`, md`$-\kq\dfrac{q}{d/2}$, from the image alone`], 2,
          [md`The two-charge formula is valid only for $z\ge0$. Below the plane the real situation is different: there is metal there and no charge at $z=-d$. The formula would give a negative number, which is wrong.`,
            md`Every point of a conductor is at the conductor's potential, and this one is grounded. No $\sigma$ needed.`,
            null,
            md`The image is fictitious; there is no charge at $z=-d$. Inside the metal $V$ equals the conductor's potential.`],
          md`The whole conductor is one equipotential, at $V=0$ because it is grounded. So $V(P) = 0$ and $\vb E(P) = 0$. The image formula would give a negative value at $P$, which shows it is valid only in the region of interest.`,
          { figHtml: FPthick }),

        Q(md`What is the field just **below** the surface (inside the metal) and just **above** it?`,
          [md`Below and above: the field of the $\pm q$ pair`, md`Below: $0$. Above: perpendicular to the surface, of size $|\sigma|/\varepsilon_0$`, md`Below: $|\sigma|/2\varepsilon_0$. Above: $|\sigma|/2\varepsilon_0$`, md`Below: $0$. Above: parallel to the surface`], 1,
          [md`The pair's field is the right field only above the plane. Inside the metal the field is zero.`,
            null,
            md`$\sigma/2\varepsilon_0$ on each side is the field of an isolated sheet of charge. At a conductor the field inside is zero, so the whole jump $\sigma/\varepsilon_0$ appears outside.`,
            md`A conductor's surface is an equipotential, so the field just outside has no component along it.`],
          md`Inside a conductor $\vb E=0$. Crossing a surface charge, $E^\perp$ jumps by $\sigma/\varepsilon_0$ and $E^\parallel$ is continuous (zero here). So just above, $\vb E = (\sigma/\varepsilon_0)\uv n$: perpendicular, with the whole jump on the outside.`,
          { figHtml: FP }),

        Q(md`Which statement about the image charge $-q$ is true?`,
          [md`A real charge $-q$ collects at $z=-d$ inside the metal.`, md`The induced charge is spread through the volume of the metal.`, md`The image exists physically only while $q$ is present.`, md`The real induced charge sits on the surface of the plane; above the plane its field equals that of a point charge $-q$ at $z=-d$.`], 3,
          [md`There is no charge inside a conductor in equilibrium, and nothing special happens at $z=-d$.`,
            md`In equilibrium $\rho=0$ inside a conductor; any net charge sits on its surface.`,
            md`The image is never physical. It is bookkeeping that reproduces the field of the surface charge in the region of interest.`,
            null],
          md`The image is a stand-in. The induced $\sigma$ on the surface produces, above the plane, exactly the field a point charge $-q$ at the mirror point would produce. Below the plane the two pictures disagree completely: the real field there is zero.`,
          { figHtml: FP }),

        Q(md`Replace the infinite plane by a large but finite grounded plate of width $L\gg d$, with $q$ above its middle. Is the image formula exact?`,
          [md`Yes: uniqueness still applies.`, md`No. The boundary is now just the plate, not the whole plane $z=0$, so the pair's $V$ doesn't match the real boundary conditions. It is a good approximation near the middle when $L\gg d$.`, md`Yes, as long as the plate is grounded.`, md`No, because the total induced charge would be $+q$.`], 1,
          [md`Uniqueness says the solution is unique, not that the pair's function solves this new problem. Off the edges of the plate nothing forces $V=0$ on $z=0$, and the real field wraps around the edges.`,
            null,
            md`Grounding fixes $V=0$ on the plate only. The image construction relies on $V=0$ on the entire plane.`,
            md`The induced charge is negative (it is pulled toward $q$), and for a finite plate its total is less than $q$ in size.`],
          md`The images work because the real boundary (the infinite plane) is exactly the surface where the image system has $V=0$. Change the boundary and the construction is only approximate. Near the middle of a big plate, the edges are far away and the plane result is very close.`,
          { figHtml: fPlate() }),

        Q(md`Why do the field lines meet the grounded plane at right angles?`,
          [md`The plane is an equipotential, so $\vb E$ has no component along it.`, md`Because the plane is infinite.`, md`Because $\sigma$ is uniform on the plane.`, md`Because the image is directly below $q$.`], 0,
          [null,
            md`A finite conductor is also an equipotential, and field lines meet it at right angles too. Size has nothing to do with it.`,
            md`$\sigma$ is not uniform here (it peaks under $q$), and the lines still meet the plane at right angles.`,
            md`That is a consequence, not the reason. The reason is the surface condition $V$ = constant.`],
          md`On an equipotential surface $V$ doesn't change along the surface, so $\vb E = -\nabla V$ has no tangential component there. That holds for every conductor. The image pair reproduces it because the plane is their perpendicular bisector.`,
          { figHtml: FP }),

        Q(md`A charge $q$ sits at $(x_0,y_0,z_0)$ above the grounded plane $z=0$. Where is its image?`,
          [md`$-q$ at $(-x_0,-y_0,-z_0)$`, md`$+q$ at $(x_0,y_0,-z_0)$`, md`$-q$ at $(x_0,y_0,-z_0)$`, md`$-q$ at $(0,0,-z_0)$`], 2,
          [md`That is a reflection through the origin. A point on the plane is then generally not equidistant from $q$ and the image.`,
            md`Same sign: the two terms add on the plane instead of cancelling.`,
            null,
            md`The image must be directly below the charge, not below the origin; otherwise the plane is not the perpendicular bisector.`],
          md`Reflect in the plane: keep $x$ and $y$, flip $z$, flip the sign of the charge. For any charge distribution $\rho(x,y,z)$ above the plane, the image is $-\rho(x,y,-z)$.`,
          { figHtml: fPlaneOff() }),

        RF(md`
          ### Worked example: $V$ along the axis

          On the $z$-axis above the plane ($x=y=0$, $z\ge0$):

          $$V(0,0,z) = \frac{q}{4\pi\varepsilon_0}\left(\frac{1}{|z-d|} - \frac{1}{z+d}\right).$$

          - At $z=0$: $\dfrac1d - \dfrac1d = 0$. Boundary condition 1 holds.
          - At $z=2d$: $\dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1d - \dfrac1{3d}\right) = \dfrac{q}{4\pi\varepsilon_0}\,\dfrac{2}{3d}$.
          - Far away, $z\gg d$: $\dfrac{1}{z-d} - \dfrac{1}{z+d} = \dfrac{2d}{z^2-d^2} \approx \dfrac{2d}{z^2}$, so $V \approx \dfrac{1}{4\pi\varepsilon_0}\dfrac{2qd}{z^2}$. Boundary condition 2 holds, and fast.

          [[fig:vz]]

          The last line is worth remembering. Far away, $q$ together with its induced charge has **zero net charge** and looks like a dipole of moment $p = q(2d)$. So $V$ falls off like $1/z^2$, not $1/z$.
        `, { vz: { svg: fVaxis(), cap: md`$V$ on the axis in units of $q/(4\pi\varepsilon_0 d)$: zero on the plane, infinite at $q$, then the dipole tail $2d^2/z^2$ (dashed).` } }),

        Q(md`Far above the plane ($z\gg d$, on the axis), how does $V$ fall off?`,
          [md`Like $1/z$, because the charge $q$ is still there`, md`Like $1/z^3$`, md`Exponentially, because the conductor screens $q$`, md`Like $1/z^2$: $q$ and its induced charge together are neutral and act like a dipole`], 3,
          [md`The induced charge is $-q$, so the net charge seen from far away is zero and the $1/z$ terms cancel.`,
            md`$1/z^3$ is the falloff of the dipole's **field**, not its potential.`,
            md`Screening by a conductor isn't exponential here; the leftover is a dipole potential, a power law.`,
            null],
          md`$\dfrac{1}{z-d} - \dfrac{1}{z+d} \approx \dfrac{2d}{z^2}$. The pair $\pm q$ separated by $2d$ is a dipole $p = 2qd$, so $V\approx\dfrac{1}{4\pi\varepsilon_0}\dfrac{2qd}{z^2}$ on the axis.`,
          { figHtml: FP3 }),

        P({
          title: 'Potential at a point beside the charge',
          q: md`A charge $q$ sits at $(0,0,d)$ above a grounded conducting plane, the plane $z=0$.

          (a) Find $V$ at the point $P=(2d,0,d)$, level with the charge.

          (b) Find the approximate $V$ far up the $z$-axis, $z\gg d$.`,
          figHtml: fPlane({ pts: [[2, 1, 'P', 'r']] }),
          hints: [
            md`It's the grounded-plane problem. Region $z\ge0$, conditions $V=0$ on the plane and $V\to0$ far away; the image $-q$ at $(0,0,-d)$ meets both, so $V = \kq\left(\dfrac{q}{\srm_+} - \dfrac{q}{\srm_-}\right)$ there.`,
            md`$P$ is level with $q$, a horizontal distance $2d$ away, so $\srm_+ = 2d$. The image is $2d$ lower than $q$: $\srm_-$ is the hypotenuse of a $2d$ by $2d$ right triangle.`,
            md`For (b): $\dfrac{1}{z-d} - \dfrac{1}{z+d} = \dfrac{2d}{z^2-d^2}$; drop the $d^2$ next to $z^2$.`,
          ],
          parts: [
            { lbl: md`$V(P)$`, expr: 'q/(4*pi*eps0*d)*(1/2 - 1/(2*sqrt(2)))', vars: { q: [1, 3], eps0: [0.5, 2], d: [1, 3] }, accepts: ['q*(sqrt(2)-1)/(8*sqrt(2)*pi*eps0*d)'] },
            { lbl: md`$V(0,0,z)$ for $z\gg d$`, expr: '2*q*d/(4*pi*eps0*z^2)', vars: { q: [1, 3], eps0: [0.5, 2], d: [0.1, 0.3], z: [5, 9] }, accepts: ['q*d/(2*pi*eps0*z^2)'] },
          ],
          sol: md`
            **Region of interest:** $z\ge0$, where the only charge is $q$.

            **Boundary conditions:**

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **Image:** $-q$ at $(0,0,-d)$. **Check:** (1) every point of the plane is equidistant from $\pm q$, so the two terms cancel; (2) both terms die far away; and the image is below the plane, so the charge in $z>0$ is unchanged. So for $z\ge0$

            $$V = \kq\left(\frac{q}{\srm_+} - \frac{q}{\srm_-}\right).$$

            [[fig:img]]

            **(a)** $\srm_+ = 2d$, straight across. $\srm_- = \sqrt{(2d)^2+(2d)^2} = 2\sqrt2\,d$. So

            $$V(P) = \frac{q}{4\pi\varepsilon_0 d}\left(\frac12 - \frac{1}{2\sqrt2}\right) \approx 0.146\,\frac{q}{4\pi\varepsilon_0 d}.$$

            **(b)** On the axis $\srm_+ = z-d$ and $\srm_- = z+d$:

            $$V = \frac{q}{4\pi\varepsilon_0}\,\frac{2d}{z^2-d^2} \approx \frac{1}{4\pi\varepsilon_0}\,\frac{2qd}{z^2}.$$

            **Checks.** (a) is positive and smaller than $q$'s own $\dfrac{q}{4\pi\varepsilon_0(2d)}$, since the induced charge pulls it down. (b) falls like $1/z^2$: the charge plus its induced charge is neutral and looks like a dipole $p=2qd$ from far away.
          `,
          figs: { img: { svg: fPair({ pt: [2, 1, 'P'] }), cap: md`Distances from $P$ to $q$ and to its image.` } },
        }),

        RF(md`
          !!key Patterns to remember
            - An image problem is a boundary-value problem. Name the region of interest, list the boundary conditions (conductor's condition, and $V\to0$ at infinity), then find **any** function that has the right charge in the region and meets them. Uniqueness makes it the answer.
            - Grounded plane: image $-q$ at the mirror point. It is chosen to make $V=0$ on the conductor; $V\to0$ at infinity and the right $\rho$ in the region come free.
            - Images go outside the region of interest (the starred rule). The image formula is valid only in that region; inside the metal $V=0$ and $\vb E=0$.
            - The image is fictitious. The real thing is the induced surface charge.
            - Far away, a charge plus its induced charge on a grounded plane looks like a dipole: $V\sim1/r^2$.
        `),
      ],
    });
  }

  // ================================================================ Lesson 2: induced surface charge
  {
    const FPAB = fPlane({ pts: [[0, 0, 'A', 'tl'], [1.8, 0, 'B', 'tr']] });
    LESSONS.push({
      id: 'u5-sigma', title: 'Induced surface charge on the plane',
      steps: [
        RF(md`
          ### From $V$ to $\sigma$

          The in-class question: how is the potential related to the surface charge? The answer is the boundary condition at a charged surface, read backwards. Just outside a conductor

          $$\vb E = \frac{\sigma}{\varepsilon_0}\,\uv n,$$

          where $\uv n$ is the unit normal pointing **out of the conductor**, into the region where the field is. (A pillbox across the surface gives a jump of $\sigma/\varepsilon_0$ in $E^\perp$; inside the metal $\vb E=0$, so the whole jump appears outside.) The normal component of $\vb E = -\nabla V$ is $E_n = -\partial V/\partial n$, so

          $$\sigma = -\varepsilon_0\,\frac{\partial V}{\partial n}.$$

          For the plane, $\uv n = \uv z$ (up, out of the metal), so

          $$\sigma = -\varepsilon_0\left.\frac{\partial V}{\partial z}\right|_{z=0}.$$

          !!trap Which way does $\uv n$ point?
            Out of the metal, into the field region. Plane with $q$ above: $\uv n = +\uv z$. Sphere with $q$ outside: $\uv n = +\uv r$. Charge inside a hollow shell: $\uv n = -\uv r$, toward the center. Getting it backwards flips the sign of $\sigma$.

          [[fig:normals]]
        `, { normals: fNormals() }),

        Q(md`In $\sigma = -\varepsilon_0\,\partial V/\partial n$ for this plane, which way does $\uv n$ point?`,
          [md`$-\uv z$, into the metal`, md`Along the line from the surface point toward $q$`, md`$+\uv z$, out of the metal into the region where the field is`, md`Along the plane, toward the foot of the charge`], 2,
          [md`That is the inward normal. With it you would find a positive induced charge under a positive $q$, which is backwards.`,
            md`$\uv n$ is the normal to the surface. It is fixed by the surface, not by where $q$ is.`,
            null,
            md`That is a tangential direction. The normal is perpendicular to the surface.`],
          md`The formula comes from $\vb E = (\sigma/\varepsilon_0)\uv n$ just outside a conductor, with $\uv n$ pointing out of the conductor into the field region. For this plane $\uv n = +\uv z$, so $\sigma = -\varepsilon_0\,\partial V/\partial z$ at $z=0$.`,
          { figHtml: FP }),

        Q(md`Which reasoning gives $\sigma = -\varepsilon_0\,\partial V/\partial n$ at a conductor's surface?`,
          [md`Gauss's law on a sphere around $q$`, md`The jump $E^\perp_{\text{above}} - E^\perp_{\text{below}} = \sigma/\varepsilon_0$, with $\vb E = 0$ inside the metal and $E^\perp = -\partial V/\partial n$ outside`, md`Poisson's equation applied inside the metal`, md`Charge flows until $V$ is constant, so $\sigma$ is set by $V$ itself`], 1,
          [md`A sphere around $q$ tells you about $q$, not about the charge on the plane.`,
            null,
            md`Inside the metal $\rho=0$ and $V$ is constant, so Poisson's equation just gives $0=0$ there. The surface charge shows up as a jump in the normal derivative across the surface.`,
            md`Charge does flow until $V$ is constant, but that gives the condition "$V$ = constant on the conductor", not the formula for $\sigma$. $\sigma$ depends on the slope of $V$, not on $V$.`],
          md`A pillbox straddling the surface gives $E^\perp_{\text{above}} - E^\perp_{\text{below}} = \sigma/\varepsilon_0$. Inside the metal $E=0$, so $E^\perp_{\text{above}} = \sigma/\varepsilon_0$. With $\vb E = -\nabla V$, $E^\perp = -\partial V/\partial n$. Together: $\sigma = -\varepsilon_0\,\partial V/\partial n$. Once the boundary conditions have given you $V$, this hands you the induced charge.`,
          { figHtml: FP }),

        Q(md`In which of the three setups does $\uv n$ in $\sigma = -\varepsilon_0\,\partial V/\partial n$ point toward the center, $\uv n = -\uv r$?`,
          [md`(A) only`, md`(B) only`, md`(B) and (C)`, md`(C) only`], 3,
          [md`For the plane $\uv n = +\uv z$, out of the metal toward $q$. There is no center involved.`,
            md`In (B) the field region is outside the sphere, so $\uv n$ points outward, $+\uv r$.`,
            md`In (B) the metal is inside and the field outside, so $\uv n = +\uv r$. Only the cavity has an inward normal.`,
            null],
          md`
            $\uv n$ always points out of the metal into the region where the field is. In (C) the field region is the cavity, so $\uv n$ points inward and $\sigma = +\varepsilon_0\,\partial V/\partial r$ at the inner surface.

            [[fig:n]]
          `,
          { figHtml: fThreeSetups(), figs: { n: fNormals() } }),

        RF(md`
          ### The derivation, step by step

          Start from the image potential,

          $$V = \frac{q}{4\pi\varepsilon_0}\left[\frac{1}{\sqrt{x^2+y^2+(z-d)^2}} - \frac{1}{\sqrt{x^2+y^2+(z+d)^2}}\right].$$

          Differentiate with the chain rule, $\dfrac{\partial}{\partial z}u^{-1/2} = -\tfrac12u^{-3/2}\dfrac{\partial u}{\partial z}$. The first term gives $-\tfrac12\cdot2(z-d) = d-z$ on top; the second, with its minus sign, gives $+\tfrac12\cdot2(z+d) = z+d$:

          $$\frac{\partial V}{\partial z} = \frac{q}{4\pi\varepsilon_0}\left\{\frac{d-z}{\left[x^2+y^2+(z-d)^2\right]^{3/2}} + \frac{d+z}{\left[x^2+y^2+(z+d)^2\right]^{3/2}}\right\}.$$

          At $z=0$ both denominators are $(x^2+y^2+d^2)^{3/2}$ and both numerators are $d$. The two terms **add**: the potential cancels on the plane, but its slope does not.

          $$\left.\frac{\partial V}{\partial z}\right|_{z=0} = \frac{q}{4\pi\varepsilon_0}\,\frac{2d}{(x^2+y^2+d^2)^{3/2}}$$

          Multiply by $-\varepsilon_0$:

          $$\sigma(x,y) = \frac{-qd}{2\pi\left(x^2+y^2+d^2\right)^{3/2}}.$$

          What it says:

          - **Sign:** negative everywhere for $q>0$. The positive charge pulls electrons to the surface.
          - **Peak directly under $q$:** at $x=y=0$, $\sigma = -\dfrac{q}{2\pi d^2}$.
          - **Shape:** it depends only on the distance from the foot of the charge, and far out it falls off like $(x^2+y^2)^{-3/2}$.
          - **Scaling with $d$:** bring $q$ closer and the charge piles up more tightly under it. The peak grows like $1/d^2$ and the width shrinks like $d$.

          [[fig:sig]]
        `, { sig: { svg: fSigPlane(), cap: md`$\sigma$ along a line through the foot of the charge, in units of $q/d^2$. Peak $-1/(2\pi)$ under the charge.` } }),

        Q(md`At $z=0$, what happens to the two terms of $\partial V/\partial z$, one from $+q$ and one from the image?`,
          [md`They cancel, so $\sigma=0$, just as $V$ itself is zero`, md`They cancel everywhere except directly under $q$`, md`They add, giving $\dfrac{q}{4\pi\varepsilon_0}\,\dfrac{2z}{(x^2+y^2+d^2)^{3/2}}$, which is zero at $z=0$`, md`They add, giving $\dfrac{q}{4\pi\varepsilon_0}\,\dfrac{2d}{(x^2+y^2+d^2)^{3/2}}$`], 3,
          [md`$V$'s two terms cancel on the plane, but their slopes point the same way: moving up, $q$'s potential rises and the image's (negative) potential becomes less negative. Both make $V$ increase.`,
            md`The cancellation of $V$ happens everywhere on the plane; the addition of the slopes also happens everywhere.`,
            md`The numerators are $d-z$ and $d+z$, which are both $d$ at $z=0$, not $\pm z$.`,
            null],
          md`On the plane $V=0$, but just above it $V>0$. So $\partial V/\partial z>0$ at the surface, and $\sigma = -\varepsilon_0\,\partial V/\partial z<0$. Both charges contribute equally to that slope, which is why the result has a $2d$.`,
          { figHtml: FP }),

        Q(md`Where on the plane is the induced charge density largest in size?`,
          [md`At $A$, directly under $q$`, md`At $B$, far from the foot`, md`On a ring of radius $d$ around the foot`, md`It is the same everywhere`], 0,
          [null,
            md`$|\sigma|$ falls off like $(x^2+y^2+d^2)^{-3/2}$, so it is small far from the foot.`,
            md`$(x^2+y^2+d^2)^{-3/2}$ has no maximum on a ring; it is largest where $x^2+y^2$ is smallest. On the ring of radius $d$ it is only $2^{-3/2}\approx0.35$ of the peak.`,
            md`The charge is pulled toward $q$, so it piles up under it. Uniform $\sigma$ would be the plane in a uniform field, not near a point charge.`],
          md`$\sigma(x,y) = \dfrac{-qd}{2\pi(x^2+y^2+d^2)^{3/2}}$ is largest in size where $x^2+y^2$ is smallest: at the foot, $\sigma(0,0) = -\dfrac{q}{2\pi d^2}$. At $B$, $1.8d$ away, it is $(1+3.24)^{-3/2}\approx0.11$ of that.`,
          { figHtml: FPAB }),

        Q(md`What is $\sigma$ directly under the charge?`,
          [md`$-\dfrac{q}{4\pi d^2}$`, md`$-\dfrac{q}{2\pi d^2}$`, md`$-\dfrac{q}{2\pi\varepsilon_0d^2}$`, md`$-\dfrac{qd}{2\pi}$`], 1,
          [md`That is what you get with only one of the two equal terms in $\partial V/\partial z$, that is, forgetting the image's contribution.`,
            null,
            md`$\sigma$ is a charge per area; dividing by $\varepsilon_0$ would make it a field. $E$ just above is $\sigma/\varepsilon_0$, not $\sigma$.`,
            md`Check the units: at the foot $(x^2+y^2+d^2)^{3/2} = d^3$, and $qd/d^3 = q/d^2$.`],
          md`Put $x=y=0$: $\sigma = \dfrac{-qd}{2\pi d^3} = -\dfrac{q}{2\pi d^2}$. Twice what $q$'s field alone would give at that spot, because the induced charge's own field doubles the field at the surface.`,
          { figHtml: FP }),

        Q(md`You raise the charge from height $d$ to height $2d$. What happens to the peak value of $|\sigma|$ (under the charge)?`,
          [md`It halves`, md`It stays the same, since the total is still $-q$`, md`It drops to a quarter`, md`It drops to an eighth`], 2,
          [md`The peak is $\dfrac{q}{2\pi d^2}$, which goes as $1/d^2$, not $1/d$.`,
            md`The total does stay $-q$, but it spreads over an area that grows like $d^2$, so the peak drops.`,
            null,
            md`$1/d^3$ would come from dropping the $d$ in the numerator of $\sigma$.`],
          md`Peak $|\sigma| = \dfrac{q}{2\pi d^2}$, so doubling $d$ divides it by $4$. The same total charge, $-q$, is spread over a patch whose width is proportional to $d$.`,
          { figHtml: FP }),

        RF(md`
          ### Check: the total induced charge

          The check asked in class: integrate $\sigma$ over the whole plane. Use polar coordinates in the plane, as the notes do: $r=\sqrt{x^2+y^2}$ is the distance from the foot of the charge, $\theta$ the angle around it, and $da = r\,dr\,d\theta$.

          $$Q_{\text{ind}} = \int_0^{2\pi}d\theta\int_0^\infty r\,dr\,\frac{-qd}{2\pi(r^2+d^2)^{3/2}} = -qd\int_0^\infty\frac{r\,dr}{(r^2+d^2)^{3/2}}$$

          With $u=r^2+d^2$, $\displaystyle\int\frac{r\,dr}{(r^2+d^2)^{3/2}} = -\frac{1}{(r^2+d^2)^{1/2}}$, so

          $$Q_{\text{ind}} = -qd\left[-\frac{1}{\sqrt{r^2+d^2}}\right]_0^\infty = \frac{qd}{\sqrt{r^2+d^2}}\bigg|_0^\infty = 0 - \frac{qd}{d} = -q.$$

          The total induced charge is $-q$, the same as the image charge. (The notes write the evaluated line as $\dfrac{-qd}{(r^2+d^2)^{1/2}}\Big|_0^\infty$, which would give $+q$: the minus sign of the antiderivative was dropped. The final $-q$ is right.)

          **Why it had to be $-q$.** Take a Gaussian surface made of a huge hemisphere sitting on the plane, closed by a flat disk just above the plane. It encloses $q$ and nothing else. Far away the image pair's field is a dipole field, falling like $1/r^3$, so the flux through the dome goes to zero as it grows. All of $q$'s flux, $q/\varepsilon_0$, must go down through the disk into the plane. Every field line from $q$ ends on the plane, and the charge where they end totals $-q$.

          [[fig:gauss]]

          **How it is spread.** Stop the integral at radius $r$: the charge within $r$ of the foot is $-q\left(1 - \dfrac{d}{\sqrt{r^2+d^2}}\right)$. Half of it is within $r=\sqrt3\,d$; the rest is a long, thin tail.
        `, { gauss: { svg: fGaussHemi(), cap: md`Gaussian surface (dashed): a big hemisphere on the plane, closed just above the plane. It encloses only $q$.` } }),

        Q(md`What is the total charge induced on the plane?`,
          [md`$-q/2$`, md`It depends on $d$`, md`$-q$`, md`$0$, because charge is conserved`], 2,
          [md`$-q/2$ is the charge within $\sqrt3\,d$ of the foot. The whole plane holds all of $-q$.`,
            md`$d$ cancels in the integral. A closer charge concentrates the induced charge but doesn't change the total.`,
            null,
            md`Charge is conserved, but the plane is grounded: the earth supplies the $-q$. Zero total would describe an isolated, neutral plane.`],
          md`$\displaystyle\int\sigma\,da = -q$, equal to the image charge. Every field line that leaves $q$ ends on the plane.`,
          { figHtml: FP }),

        Q(md`Which antiderivative is right? $\displaystyle\int\frac{r\,dr}{(r^2+d^2)^{3/2}} = \;?$`,
          [md`$+\dfrac{1}{(r^2+d^2)^{1/2}}$`, md`$-\dfrac{1}{(r^2+d^2)^{1/2}}$`, md`$-\dfrac{1}{2(r^2+d^2)^{1/2}}$`, md`$\tfrac12\ln(r^2+d^2)$`], 1,
          [md`Differentiate it: you get $-r(r^2+d^2)^{-3/2}$, the wrong sign. This is the sign slip in the notes' intermediate line.`,
            null,
            md`With $u = r^2+d^2$, $r\,dr = \tfrac12du$ and $\int u^{-3/2}du = -2u^{-1/2}$. The $\tfrac12$ and the $-2$ combine to $-1$, not $-\tfrac12$.`,
            md`That is $\int\dfrac{r\,dr}{r^2+d^2}$, with power $1$, not $3/2$.`],
          md`$u = r^2+d^2$, $du = 2r\,dr$: $\displaystyle\int\frac{r\,dr}{u^{3/2}} = \frac12\int u^{-3/2}du = -u^{-1/2}$. Then $-qd\left[-\dfrac{1}{\sqrt{r^2+d^2}}\right]_0^\infty = -qd\left(0+\dfrac1d\right) = -q$. Always check a total-charge integral against the image charge (or Gauss's law).`,
          { nofig: 'a calculus step with no geometry' }),

        Q(md`Why must the total induced charge on the plane be exactly $-q$?`,
          [md`Charge conservation: the plane started out neutral.`, md`For any grounded conductor, the induced charge is always minus the inducing charge.`, md`Because $\sigma$ is negative everywhere.`, md`Every field line from $q$ ends on the plane. Far away the field falls like $1/r^3$, so no flux escapes through a big hemisphere, and Gauss's law forces the plane's charge to cancel $q$.`], 3,
          [md`The plane is grounded, not isolated: charge flows in from the earth. Conservation alone says nothing about the plane's total.`,
            md`Not in general. A grounded sphere with $q$ outside picks up only $-qR/a$; some of $q$'s field lines escape to infinity.`,
            md`That fixes the sign, not the amount.`,
            null],
          md`Gauss's law on a closed surface that hugs the plane and caps the region with a far-away dome: the dome contributes no flux in the limit, so the flux into the plane is all of $q/\varepsilon_0$. The plane's charge is $-q$.`,
          { figHtml: FP }),

        Q(md`What fraction of the total induced charge lies within a distance $\sqrt3\,d$ of the foot of the charge?`,
          [md`$\tfrac13$`, md`$\tfrac12$`, md`$\tfrac34$`, md`$\tfrac{1}{\sqrt3}$`], 1,
          [md`Use $1 - \dfrac{d}{\sqrt{r^2+d^2}}$ with $r = \sqrt3\,d$: $\sqrt{3d^2+d^2} = 2d$.`,
            null,
            md`$\tfrac34$ would need $\sqrt{r^2+d^2} = 4d$, i.e. $r = \sqrt{15}\,d$.`,
            md`The fraction is $1 - d/\sqrt{r^2+d^2}$, not $d/r$.`],
          md`The charge within $r$ is $-q\left(1 - \dfrac{d}{\sqrt{r^2+d^2}}\right)$. At $r=\sqrt3\,d$, $\sqrt{r^2+d^2} = 2d$, so the fraction is $1-\tfrac12 = \tfrac12$. The other half is a long tail: even beyond $r=10d$ there is still about $10\%$.`,
          { figHtml: FP }),

        RF(md`
          ### The field just above the plane

          Just outside the metal, $\vb E = (\sigma/\varepsilon_0)\uv n$:

          $$\vb E(x,y,0^+) = -\frac{qd}{2\pi\varepsilon_0\left(x^2+y^2+d^2\right)^{3/2}}\,\uv z.$$

          It points down, into the plane, perpendicular to it everywhere. Check with the image pair: at a point on the plane, $+q$ and $-q$ each produce a field of size $\dfrac{q}{4\pi\varepsilon_0(x^2+y^2+d^2)}$. Their components along the plane cancel, and their components along $-\uv z$ add, each being the fraction $\dfrac{d}{\sqrt{x^2+y^2+d^2}}$ of that size. Same result.

          [[fig:lines]]

          The field lines leave $q$, bend over, and land on the plane at right angles. Their density where they land is $|\sigma|$: crowded under the charge, sparse far away.

          !!trap $\sigma/\varepsilon_0$, not $\sigma/2\varepsilon_0$
            $\sigma/2\varepsilon_0$ is the field of an isolated sheet of charge, half on each side. At a conductor the field inside is zero, so the whole jump appears on the outside: $E = \sigma/\varepsilon_0$.
        `, { lines: { svg: fLinesPlane(), cap: md`Field lines of $q$ above the grounded plane (computed). Every line ends on the plane, at right angles to it.` } }),

        WG.imagePlane(),

        Q(md`What is $\vb E$ just above the plane, directly under the charge?`,
          [md`$\dfrac{q}{2\pi\varepsilon_0d^2}$, pointing down into the plane`, md`$\dfrac{q}{4\pi\varepsilon_0d^2}$, pointing down`, md`$0$, because the plane is a conductor`, md`$\dfrac{q}{2\pi\varepsilon_0d^2}$, pointing up`], 0,
          [null,
            md`That is $q$'s field alone. The induced charge adds an equal amount at the surface (in the image picture, the image is also a distance $d$ away).`,
            md`$\vb E=0$ inside the metal. Just outside it is $(\sigma/\varepsilon_0)\uv n$.`,
            md`For $q>0$ the field points from $q$ toward the negative induced charge, so down. In formulas: $\sigma<0$ and $\uv n = +\uv z$, so $\vb E = (\sigma/\varepsilon_0)\uv n$ points along $-\uv z$.`],
          md`$\vb E = \dfrac{\sigma(0,0)}{\varepsilon_0}\uv z = -\dfrac{q}{2\pi\varepsilon_0d^2}\uv z$. With images: $+q$ and its image are each a distance $d$ from the foot, each giving $\dfrac{q}{4\pi\varepsilon_0d^2}$ downward. Twice $q$'s field alone.`,
          { figHtml: FP }),

        Q(md`A field line leaves $q$ heading almost straight up, a few degrees off the $+z$ axis. Where does it end?`,
          [md`At infinity: it never comes back down`, md`On the image charge at $z=-d$`, md`On the plane, far from the foot of the charge`, md`On the plane, right under the charge`], 2,
          [md`The total induced charge is $-q$, so all of $q$'s flux ends on the plane. Far away the field is a dipole field and its lines loop back. Only the single line exactly on the axis goes to infinity, and it carries no flux.`,
            md`The image isn't real, and no line can cross the plane: the field inside the metal is zero. Lines end on the surface charge.`,
            null,
            md`Lines that leave downward land near the foot. A line that leaves nearly upward has to swing around a long way first.`],
          md`Every line from $q$ ends on the plane, since the induced charge is exactly $-q$. Lines leaving downward land near the foot, where $\sigma$ is largest. Lines leaving nearly upward make a huge loop and land far out, where $\sigma$ is tiny. That is the long tail of $\sigma$.`,
          { figHtml: FP }),

        Q(md`Now the charge above the plane is **negative**, $-q$. What is the induced $\sigma$?`,
          [md`Negative, with the same shape`, md`Zero, because the plane is grounded`, md`Positive under the charge, negative far away`, md`Positive everywhere, with the same shape`], 3,
          [md`A negative charge repels electrons, leaving positive charge behind. Flip $q\to-q$ in the formula: $\sigma\to-\sigma$.`,
            md`Grounding fixes $V$, not $\sigma$. Charge flows from the earth to make $V=0$, which is exactly what produces $\sigma$.`,
            md`$\sigma$ has a single sign; the formula is $q$ times a positive function.`,
            null],
          md`The image is $+q$ at the mirror point, and everything flips sign: $\sigma = \dfrac{+qd}{2\pi(x^2+y^2+d^2)^{3/2}}$, total $+q$. The field just above points up, from the positive surface charge toward the negative charge.`,
          { figHtml: fPlane({ neg: true }) }),

        RF(md`
          ### Worked example

          $q$ at height $d$. Find $\sigma$ a distance $d$ from the foot, and the induced charge within that distance.

          **Region and boundary conditions** (the same for every grounded-plane problem): region $z\ge0$;

          1. $V=0$ on the plane;
          2. $V\to0$ far away.

          The image $-q$ at depth $d$ meets both (equidistant points on the plane; every term dies far away), so $\sigma(x,y) = \dfrac{-qd}{2\pi(x^2+y^2+d^2)^{3/2}}$.

          **$\sigma$ at $r=d$.** Put $x^2+y^2 = d^2$:

          $$\sigma = \frac{-qd}{2\pi(2d^2)^{3/2}} = -\frac{q}{4\sqrt2\,\pi d^2} \approx -0.056\,\frac{q}{d^2},$$

          which is $2^{-3/2}\approx0.35$ of the peak value $-q/(2\pi d^2)$.

          **Charge within $r=d$.** The same integral as before, stopped at $r$:

          $$Q(r) = -qd\left[\frac1d - \frac{1}{\sqrt{r^2+d^2}}\right] = -q\left(1 - \frac{d}{\sqrt{r^2+d^2}}\right),\qquad Q(d) = -q\left(1-\frac{1}{\sqrt2}\right)\approx -0.29\,q.$$

          Less than a third of the induced charge lies within one height of the foot.
        `),

        P({
          title: 'Induced charge farther out',
          q: md`
            A charge $q$ is held a height $d$ above a grounded conducting plane. Find:

            (a) the induced surface charge density at a distance $2d$ from the foot of the charge (the point $P$);

            (b) the total induced charge within a distance $2d$ of the foot;

            (c) $E_z$ just above the plane at the foot, with $+z$ pointing away from the plane toward the charge.
          `,
          figHtml: fPlane({ pts: [[2, 0, 'P', 'tr']] }),
          hints: [
            md`First $V$: region $z\ge0$, conditions $V=0$ on the plane and $V\to0$ far away, image $-q$ at $(0,0,-d)$. Then $\sigma = -\varepsilon_0\,\partial V/\partial z$ at $z=0$ gives $\sigma = \dfrac{-qd}{2\pi(x^2+y^2+d^2)^{3/2}}$.`,
            md`(a) Put $x^2+y^2 = (2d)^2$. (b) Integrate $\sigma\cdot2\pi r\,dr$ from $0$ to $2d$; the antiderivative of $r(r^2+d^2)^{-3/2}$ is $-(r^2+d^2)^{-1/2}$.`,
            md`(c) Just outside a conductor $\vb E = (\sigma/\varepsilon_0)\uv n$ with $\uv n = +\uv z$.`,
          ],
          parts: [
            { lbl: md`(a) $\sigma(P)$`, expr: '-q/(10*sqrt(5)*pi*d^2)', vars: { q: [1, 3], d: [1, 3] }, accepts: ['-q*d/(2*pi*(5*d^2)^(3/2))'] },
            { lbl: md`(b) $Q(r<2d)$`, expr: '-q*(1 - 1/sqrt(5))', vars: { q: [1, 3] }, accepts: ['q/sqrt(5) - q'] },
            { lbl: md`(c) $E_z$`, expr: '-q/(2*pi*eps0*d^2)', vars: { q: [1, 3], eps0: [0.5, 2], d: [1, 3] } },
          ],
          sol: md`
            **Region of interest:** $z\ge0$.

            **Boundary conditions:**

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **Image:** $-q$ at $(0,0,-d)$. **Check:** (1) points of the plane are equidistant from $\pm q$, so $V=0$ there; (2) both terms vanish far away; the image is outside the region. Then $\sigma = -\varepsilon_0\,\partial V/\partial z|_{z=0} = \dfrac{-qd}{2\pi(x^2+y^2+d^2)^{3/2}}$ (derived in the lesson).

            **(a)** $x^2+y^2 = 4d^2$:

            $$\sigma(P) = \frac{-qd}{2\pi(5d^2)^{3/2}} = -\frac{q}{10\sqrt5\,\pi d^2}\approx -0.0142\,\frac{q}{d^2},$$

            about $1/(5\sqrt5)\approx 9\%$ of the peak.

            **(b)** $Q(r) = -q\left(1 - \dfrac{d}{\sqrt{r^2+d^2}}\right)$, so $Q(2d) = -q\left(1 - \dfrac{1}{\sqrt5}\right)\approx -0.553\,q$.

            **(c)** At the foot $\sigma = -\dfrac{q}{2\pi d^2}$, so $E_z = \sigma/\varepsilon_0 = -\dfrac{q}{2\pi\varepsilon_0d^2}$: toward the plane, twice $q$'s own field there.

            **Checks.** Units: $q/d^2$ for $\sigma$, a fraction of $q$ for (b). Limits: $Q(r)\to-q$ as $r\to\infty$ and $\to0$ as $r\to0$. Signs: negative charge under a positive $q$, field pointing into the plane.
          `,
        }),

        P({
          title: 'A negative charge above the plane',
          q: md`
            A charge $-q$ (with $q>0$) is held a height $2a$ above a grounded conducting plane.

            (a) What is $\sigma$ directly below it?

            (b) What is the total induced charge?

            (c) Which way does the field just above the plane point?
          `,
          figHtml: fPlane({ neg: true, dLab: '2a' }),
          hints: [
            md`Same boundary conditions as always: $V=0$ on the plane, $V\to0$ far away. The image of $-q$ is $+q$ at the mirror point, a depth $2a$ below the surface.`,
            md`You can reuse $\sigma = \dfrac{-Q_{\text{real}}\,h}{2\pi(x^2+y^2+h^2)^{3/2}}$ with $Q_{\text{real}} = -q$ and height $h = 2a$.`,
          ],
          parts: [
            { lbl: md`(a) $\sigma$ at the foot`, expr: 'q/(8*pi*a^2)', vars: { q: [1, 3], a: [1, 3] } },
            { lbl: md`(b) $Q_{\text{ind}}$`, expr: 'q', vars: { q: [1, 3] } },
            { lbl: md`(c) The field just above the plane points`, mc: [md`up, away from the plane`, md`down, into the plane`, md`along the plane`], a: 0,
              why: [null, md`The surface charge is positive here, and the field points away from positive charge: up, toward the negative charge.`, md`At a conductor's surface the field is perpendicular to it.`] },
          ],
          sol: md`
            **Region of interest:** $z\ge0$, containing only the charge $-q$.

            **Boundary conditions:**

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **Image:** $+q$ at $(0,0,-2a)$. **Check:** (1) on the plane the two terms are equal and opposite; (2) both vanish far away; the image is below the plane. Everything is the earlier result with $q\to-q$ and $d\to2a$.

            **(a)**
            $$\sigma = \frac{+q(2a)}{2\pi(x^2+y^2+4a^2)^{3/2}},\qquad \sigma(0,0) = \frac{2qa}{2\pi\cdot8a^3} = \frac{q}{8\pi a^2}.$$

            **(b)** $+q$, equal to the image charge.

            **(c)** $\vb E = (\sigma/\varepsilon_0)\uv n$ with $\sigma>0$ and $\uv n = +\uv z$: up, from the positive surface charge toward $-q$.

            **Check.** Flipping the sign of the real charge flips every induced quantity. The height enters as $1/h^2$ in the peak: $\dfrac{q}{2\pi(2a)^2} = \dfrac{q}{8\pi a^2}$.
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - $\sigma = -\varepsilon_0\,\partial V/\partial n$ is the conductor's surface boundary condition read backwards, with $\uv n$ out of the metal into the field region.
            - Plane: $\sigma = \dfrac{-qd}{2\pi(x^2+y^2+d^2)^{3/2}}$, peak $-\dfrac{q}{2\pi d^2}$ under the charge, total $-q$ (equal to the image).
            - On the plane the two terms of $V$ cancel, but the two terms of $\partial V/\partial z$ add.
            - Just outside a conductor $E = \sigma/\varepsilon_0$, perpendicular to the surface. Not $\sigma/2\varepsilon_0$.
            - Every field line from $q$ ends on the plane. Half the induced charge is within $\sqrt3\,d$ of the foot; the rest is a long tail.
        `),
      ],
    });
  }

  // ================================================================ Lesson 3: force and energy
  {
    const FPneg = fPlane({ neg: true });
    LESSONS.push({
      id: 'u5-energy', title: 'Force and energy: the factor of one half',
      steps: [
        RF(md`
          ### Force on $q$

          Above the plane, the induced charge produces exactly the field of the image. So the force on $q$ is the force the image would exert on it:

          $$\vb F = \frac{1}{4\pi\varepsilon_0}\frac{q(-q)}{(2d)^2}\,\uv z = -\frac{1}{4\pi\varepsilon_0}\frac{q^2}{(2d)^2}\,\uv z = -\frac{q^2}{16\pi\varepsilon_0d^2}\,\uv z.$$

          [[fig:force]]

          - It is **attractive**, toward the plane, whatever the sign of $q$: a charge and its image always have opposite signs.
          - The distance is $2d$, from $q$ to its image, not the distance $d$ to the plane.
          - Only the image acts on $q$. A charge exerts no net force on itself, so $q$'s own field is left out.

          By Newton's third law the plane is pulled toward $q$ with a force of the same size. (You can confirm it by adding up the force on the induced charge, the pressure $\sigma^2/2\varepsilon_0$ over the whole plane: $\displaystyle\int\frac{\sigma^2}{2\varepsilon_0}\,da = \frac{q^2}{16\pi\varepsilon_0d^2}$.)
        `, { force: { svg: fForcePlane(), cap: md`The force on $q$ is the Coulomb pull of its image, a distance $2d$ away.` } }),

        Q(md`The charge above the grounded plane is **negative**. Which way is the force on it?`,
          [md`Toward the plane`, md`Away from the plane, since the plane is negative too`, md`There is no force; a grounded plane is neutral`, md`Along the plane`], 0,
          [null,
            md`The induced charge under a negative charge is positive (the image is $+q$), so the force is attractive.`,
            md`The plane carries induced charge of the opposite sign, so it pulls. Grounded means $V=0$, not uncharged.`,
            md`By symmetry the force is along the line from the charge to its image, perpendicular to the plane.`],
          md`A charge and its image always have opposite signs, so the force $\dfrac{q\cdot(-q)}{4\pi\varepsilon_0(2d)^2}$ is always attractive. A charge is always pulled toward a grounded conductor.`,
          { figHtml: FPneg }),

        Q(md`What is the size of the force on $q$?`,
          [md`$\dfrac{q^2}{4\pi\varepsilon_0d^2}$`, md`$\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$`, md`$\dfrac12\cdot\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$, since the image is fictitious`, md`$\dfrac{2q^2}{4\pi\varepsilon_0d^2}$`], 1,
          [md`$d$ is the distance to the plane. The image is a distance $2d$ from $q$.`,
            null,
            md`The half belongs to the **energy**. The field at $q$ is exactly the image's field, so the full Coulomb force acts.`,
            md`There is one image, not two, and it is $2d$ away.`],
          md`$F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{(2d)^2} = \dfrac{q^2}{16\pi\varepsilon_0d^2}$, toward the plane.`,
          { figHtml: FP }),

        Q(md`Why can you compute the force on $q$ as if the image were a real charge?`,
          [md`Because there really is a charge $-q$ inside the metal at $z=-d$.`, md`Because the plane is grounded, so it can't push on $q$ itself.`, md`By Newton's third law.`, md`Because above the plane the field is identical in the two problems, and the force on $q$ depends only on the field at $q$ (minus its own).`], 3,
          [md`There is no charge inside the metal. The real source is the surface charge.`,
            md`The plane does push (pull) on $q$; that is what you are computing. The pull comes from its induced charge.`,
            md`Newton's third law tells you the plane feels the opposite force; it doesn't tell you what the force is.`,
            null],
          md`The force on $q$ is $q$ times the field at $q$ from all the other charges. In the region $z>0$ the induced charge's field equals the image's field (that's what the image construction guarantees). So $\vb F = q\vb E_{\text{image}}(q)$.`,
          { figHtml: FP }),

        Q(md`You move the charge from height $d$ to height $d/2$. The force on it becomes:`,
          [md`$4$ times as large`, md`$2$ times as large`, md`$\sqrt2$ times as large`, md`$8$ times as large`], 0,
          [null,
            md`The force goes as $1/(2d)^2$, an inverse square, not $1/d$.`,
            md`No square roots: $F\propto1/d^2$.`,
            md`$1/d^3$ would be the falloff of a dipole's field, not of the charge-image force.`],
          md`$F = \dfrac{q^2}{4\pi\varepsilon_0(2d)^2}\propto\dfrac{1}{d^2}$: halve $d$ and $F$ quadruples. As $q$ approaches the plane the force grows without bound, just as the image approaches it.`,
          { figHtml: FP }),

        Q(md`What force does the **plane** feel?`,
          [md`None; a grounded plane is held fixed by the earth`, md`$\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$ pulling it away from $q$`, md`$\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$ pulling it toward $q$`, md`Half of that, since only half the field energy is present`], 2,
          [md`Grounding fixes its potential, not the force on it. The induced charge is pulled toward $q$.`,
            md`Opposite charges attract: the negative induced charge is pulled toward $q$.`,
            null,
            md`Forces obey Newton's third law exactly. The factor of a half belongs to the energy, not the force.`],
          md`The force on the plane is the total force on its induced charge, equal and opposite to the force on $q$. Adding up the surface pressure $\sigma^2/2\varepsilon_0$ over the plane gives the same $\dfrac{q^2}{16\pi\varepsilon_0d^2}$.`,
          { figHtml: FP }),

        RF(md`
          ### Energy: half of the two-charge value

          The energy of the real system, charge plus grounded plane, is

          $$W = -\frac{1}{4\pi\varepsilon_0}\frac{q^2}{4d}.$$

          Two **real** charges $\pm q$ a distance $2d$ apart have $W = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{2d}$. The real answer is **half** of that. This is the classic exam trap: $V$, $\vb E$ and the force are the same in the two problems above the plane, but the energy is not. Three ways to see why.

          **1. The energy lives in the field.** $W = \dfrac{\varepsilon_0}{2}\displaystyle\int E^2\,d\tau$. For the image pair, the field fills both halves of space, and by symmetry each half holds the same energy. In the real problem the field above the plane is the same, but below it $\vb E=0$ (inside the metal). Only half the energy is there.

          [[fig:half]]

          **2. The work to bring $q$ in from infinity.** At height $z$, the force on $q$ is $\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{(2z)^2}$ toward the plane, so you hold it back with $\vb F_{\text{you}} = +\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{4z^2}\,\uv z$:

          $$W = \int_\infty^d\vb F_{\text{you}}\cdot d\vb l = \frac{1}{4\pi\varepsilon_0}\int_\infty^d\frac{q^2}{4z^2}\,dz = \frac{1}{4\pi\varepsilon_0}\left[-\frac{q^2}{4z}\right]_\infty^d = -\frac{1}{4\pi\varepsilon_0}\frac{q^2}{4d}.$$

          You push only the real charge. The induced charge slides around on the plane as $q$ comes in, but that costs nothing, because the whole conductor is at $V=0$. The image "follows" $q$ for free. Assembling two real charges, you would have to move both, and the work doubles.

          **3. $W = \tfrac12\sum q_iV_i$ over the real charges.** The real charges are $q$ and the induced $\sigma$. The induced charge sits where $V=0$, so its term vanishes. At $q$, the potential from everything else (the induced charge) is the image's potential, $-\dfrac{q}{4\pi\varepsilon_0(2d)}$. So

          $$W = \tfrac12\,q\left(-\frac{q}{4\pi\varepsilon_0\,2d}\right) = -\frac{q^2}{16\pi\varepsilon_0d}.$$

          !!key The half rule (a charge near grounded conductors)
            $W = \tfrac12\,q\,V_{\text{images}}(\text{at }q)$: half of what you get by treating the images as real charges. Check it with the force: $F_z = -\dfrac{dW}{dd} = -\dfrac{q^2}{16\pi\varepsilon_0d^2}$, the force above. The two-charge energy would give twice the right force.
        `, { half: fHalf() }),

        Q(md`What is the energy of the system (charge $q$ at height $d$ plus the grounded plane)?`,
          [md`$-\dfrac{q^2}{16\pi\varepsilon_0d}$`, md`$-\dfrac{q^2}{8\pi\varepsilon_0d}$`, md`$-\dfrac{q^2}{4\pi\varepsilon_0d}$`, md`$+\dfrac{q^2}{16\pi\varepsilon_0d}$`], 0,
          [null,
            md`That is $\dfrac{1}{4\pi\varepsilon_0}\dfrac{q(-q)}{2d}$, the energy of two real charges. The image is not a real charge; the real energy is half of this.`,
            md`That uses the distance $d$ to the plane as if a charge $-q$ sat on the plane. The right distance to the image is $2d$, and then you halve.`,
            md`The charge is attracted, so you get work **out** bringing it in: the energy is negative.`],
          md`$W = \tfrac12\,q\,V_{\text{image}}(q) = \tfrac12\,q\cdot\left(-\dfrac{q}{4\pi\varepsilon_0(2d)}\right) = -\dfrac{q^2}{16\pi\varepsilon_0d}$. Equivalently, the work integral $-\displaystyle\int_\infty^d F\,dz$ with $F = -\dfrac{q^2}{16\pi\varepsilon_0z^2}$.`,
          { figHtml: FP }),

        Q(md`Using $W = \dfrac{\varepsilon_0}{2}\displaystyle\int E^2\,d\tau$, why is the real energy half the energy of the image pair?`,
          [md`Because the image charge is half as big as $q$`, md`Because the field above the plane is half as strong as the pair's field`, md`Because $\varepsilon_0$ is replaced by $\varepsilon_0/2$ inside the metal`, md`The fields above the plane are identical, but below it the real field is zero while the pair's field mirrors the upper half`], 3,
          [md`The image for a plane is $-q$, the same size as $q$.`,
            md`Above the plane the two fields are identical. That is the whole point of the construction.`,
            md`Nothing happens to $\varepsilon_0$. Inside the metal the field is simply zero.`,
            null],
          md`The pair's field is symmetric: the energy in $z<0$ equals the energy in $z>0$. The real system has the same field in $z>0$ and none in $z<0$. So it has exactly half.`,
          { figHtml: FP }),

        Q(md`As you bring $q$ in from infinity, the induced charge slides around on the plane. How much work do you do on the induced charge?`,
          [md`The same as on $q$, which is why the image picture doubles the energy`, md`Zero: it moves on an equipotential ($V=0$)`, md`Half as much as on $q$`, md`It can't be found without $\sigma$`], 1,
          [md`That would be true for two real point charges brought in together. Here the "image" is just the induced charge, and moving it costs nothing.`,
            null,
            md`It costs exactly nothing: the work to move charge between two points at the same potential is zero.`,
            md`You don't need $\sigma$: any charge moving within a region at constant potential needs no work.`],
          md`Moving charge from one point of a conductor to another means moving it between points at the same potential, so no work is done. The only work you do is on $q$ itself. With two real charges you would do work on both, which doubles the result.`,
          { figHtml: FP }),

        Q(md`In $W = \tfrac12\sum q_iV_i$, summed over the **real** charges ($q$ and the induced charge), why does the induced charge's term drop out?`,
          [md`Because the induced charge is fictitious`, md`Because the induced charge totals $-q$ and cancels $q$'s term`, md`Because the induced charge sits on the conductor, where $V=0$`, md`Because the induced charge is spread out, so its self-energy is negligible`], 2,
          [md`The **image** is fictitious; the induced charge is real. It drops out for a different reason.`,
            md`The two terms are $\tfrac12\,qV(q)$ and $\tfrac12\int\sigma V\,da$; they don't cancel each other. The second is zero on its own.`,
            null,
            md`Its self-energy isn't negligible in general. The term vanishes exactly because $V=0$ where it sits.`],
          md`$\tfrac12\displaystyle\int\sigma V\,da = 0$ because $V=0$ on the grounded plane. What remains is $\tfrac12\,q\,V_{\text{other}}(q)$, where $V_{\text{other}}$ is the potential of the induced charge at $q$, equal to the image's potential $-\dfrac{q}{4\pi\varepsilon_0(2d)}$.`,
          { figHtml: FP }),

        Q(md`A student writes the energy as $W = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q(-q)}{2d}$. What went wrong?`,
          [md`Nothing; that is the energy of the system`, md`The distance should be $d$, not $2d$`, md`The sign: the energy should be positive`, md`The image was treated as a real charge that must be assembled too; the real energy is half of this`], 3,
          [md`That is the energy of two **real** charges $\pm q$ a distance $2d$ apart, with field energy in both halves of space.`,
            md`$2d$ is the right distance from $q$ to its image. The error is elsewhere.`,
            md`The charge is attracted to the plane, so the energy is negative.`,
            null],
          md`Treating the image as real counts the field energy below the plane, which isn't there, and counts work done on the image, which costs nothing. Correct: $W = -\dfrac{q^2}{4\pi\varepsilon_0\,4d}$.`,
          { figHtml: FP }),

        Q(md`Which $W(d)$ gives the correct force through $F_z = -dW/dd$?`,
          [md`$W = -\dfrac{q^2}{16\pi\varepsilon_0d}$`, md`$W = -\dfrac{q^2}{8\pi\varepsilon_0d}$`, md`$W = -\dfrac{q^2}{16\pi\varepsilon_0d^2}$`, md`$W = -\dfrac{q^2}{4\pi\varepsilon_0d}$`], 0,
          [null,
            md`$-d/dd$ of this gives $-\dfrac{q^2}{8\pi\varepsilon_0d^2}$, twice the true force. That is the two-charge energy.`,
            md`This has the units of a force, not an energy (one too many powers of $1/d$).`,
            md`$-d/dd$ gives $-\dfrac{q^2}{4\pi\varepsilon_0d^2}$, four times the true force.`],
          md`$-\dfrac{d}{dd}\left(-\dfrac{q^2}{16\pi\varepsilon_0d}\right) = -\dfrac{q^2}{16\pi\varepsilon_0d^2}$: toward the plane, size $\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$. This is a quick exam check: the energy and the force must be consistent.`,
          { figHtml: FP }),

        Q(md`How much work must you do to pull $q$ from height $d$ all the way to infinity?`,
          [md`$-\dfrac{q^2}{16\pi\varepsilon_0d}$`, md`$0$`, md`$+\dfrac{q^2}{16\pi\varepsilon_0d}$`, md`$+\dfrac{q^2}{8\pi\varepsilon_0d}$`], 2,
          [md`That is the energy of the bound configuration. Pulling the charge away you do **positive** work against the attraction.`,
            md`The charge is attracted to the plane all the way out, so it takes work.`,
            null,
            md`That uses the two-charge energy. Only $q$ moves; the image follows for free.`],
          md`$W_{\text{you}} = W(\infty) - W(d) = 0 - \left(-\dfrac{q^2}{16\pi\varepsilon_0d}\right) = +\dfrac{q^2}{16\pi\varepsilon_0d}$.`,
          { figHtml: FP }),

        Q(md`The energy $W = -\dfrac{q^2}{16\pi\varepsilon_0d}$ is negative. What does that mean physically?`,
          [md`Assembling the system releases energy: the charge is bound to the plane, and you would have to supply $|W|$ to pull it away`, md`The calculation has a sign error; energies are positive`, md`The field energy density is negative below the plane`, md`The grounded plane does negative work on the earth`], 0,
          [null,
            md`Interaction energies can be negative. $W$ here is measured relative to the charge being infinitely far away, and an attracted charge has $W<0$.`,
            md`$\tfrac{\varepsilon_0}{2}E^2\ge0$ everywhere. The negative sign comes from comparing with the configuration at infinity; the infinite self-energy of the point charge is left out.`,
            md`The earth isn't part of the energy bookkeeping here; the plane stays at $V=0$ throughout.`],
          md`$W$ is the work to bring $q$ in from infinity (the point charge's own infinite self-energy is not counted). It is negative because the charge is attracted: the system does work on you as it comes in.`,
          { figHtml: FP }),

        RF(md`
          ### Worked example: lifting the charge

          How much work does it take to lift $q$ from height $d$ to height $2d$?

          At every height $h$ the problem is the same boundary-value problem: region $z\ge0$; (1) $V=0$ on the plane; (2) $V\to0$ far away. The image $-q$ at depth $h$ satisfies both, so the energy formula $W(h)$ holds at every height.

          **From the energy.** $W(h) = -\dfrac{q^2}{16\pi\varepsilon_0h}$, so

          $$W_{\text{lift}} = W(2d) - W(d) = -\frac{q^2}{32\pi\varepsilon_0d} + \frac{q^2}{16\pi\varepsilon_0d} = +\frac{q^2}{32\pi\varepsilon_0d}.$$

          **From the force.** At height $z$ you must push up with $\dfrac{q^2}{16\pi\varepsilon_0z^2}$:

          $$W_{\text{lift}} = \int_d^{2d}\frac{q^2}{16\pi\varepsilon_0z^2}\,dz = \frac{q^2}{16\pi\varepsilon_0}\left(\frac1d - \frac1{2d}\right) = \frac{q^2}{32\pi\varepsilon_0d}.$$

          The two agree. Using the two-charge energy would give twice this, because it pretends you also drag the image down and up.
        `),

        P({
          title: 'Lifting to three times the height',
          q: md`
            A charge $q$ sits a height $d$ above a grounded conducting plane.

            (a) How much work must you do to lift it slowly to height $3d$?

            (b) What is the force on it ($F_z$, with $+z$ pointing away from the plane) once it is at height $3d$?

            (c) A classmate uses the energy of two real charges $\pm q$ instead. By what factor is their answer to (a) off?
          `,
          figHtml: fPlane({ pts: [[0, 3, '3d', 'r']] }),
          hints: [
            md`Region $z\ge0$, conditions $V=0$ on the plane and $V\to0$ far away; image $-q$ at the mirror point. The force at height $h$ is the pull of the image, $2h$ away.`,
            md`The energy of the real system at height $h$ is $W(h) = -\dfrac{q^2}{16\pi\varepsilon_0h}$ (half the two-charge value). The work you do is $W(3d) - W(d)$.`,
            md`The two-charge energy is $-\dfrac{q^2}{8\pi\varepsilon_0h}$, exactly twice $W(h)$ at every height.`,
          ],
          parts: [
            { lbl: md`(a) $W_{\text{lift}}$`, expr: 'q^2/(24*pi*eps0*d)', vars: { q: [1, 3], eps0: [0.5, 2], d: [1, 3] }, accepts: ['(q^2/(16*pi*eps0))*(1/d - 1/(3*d))'] },
            { lbl: md`(b) $F_z$ at $3d$`, expr: '-q^2/(144*pi*eps0*d^2)', vars: { q: [1, 3], eps0: [0.5, 2], d: [1, 3] }, accepts: ['-q^2/(4*pi*eps0*(6*d)^2)'] },
            { lbl: md`(c) classmate's answer ÷ correct answer`, ans: 2 },
          ],
          sol: md`
            **Region of interest:** $z\ge0$.

            **Boundary conditions:**

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **Image:** $-q$ at the mirror point, always a distance $2h$ from $q$ when $q$ is at height $h$. **Check:** (1) the plane bisects the pair; (2) both terms die far away; the image is below the plane.

            [[fig:img]]

            **(a)** $W(h) = \tfrac12\,q\,V_{\text{image}} = -\dfrac{q^2}{16\pi\varepsilon_0h}$, so

            $$W_{\text{lift}} = W(3d) - W(d) = \frac{q^2}{16\pi\varepsilon_0}\left(\frac1d - \frac1{3d}\right) = \frac{q^2}{24\pi\varepsilon_0d}.$$

            Same from the force: $\displaystyle\int_d^{3d}\frac{q^2}{16\pi\varepsilon_0z^2}dz$.

            **(b)** At $3d$ the image is $6d$ away: $F_z = -\dfrac{q^2}{4\pi\varepsilon_0(6d)^2} = -\dfrac{q^2}{144\pi\varepsilon_0d^2}$, toward the plane.

            **(c)** The two-charge energy is twice $W(h)$ at every height, so every energy difference doubles: a factor of $2$ too big.

            **Check.** (a) is positive (you pull against an attraction) and smaller than the work to go all the way to infinity, $\dfrac{q^2}{16\pi\varepsilon_0d}$.
          `,
          figs: { img: { svg: fForcePlane(), cap: md`At any height $h$ the force is the pull of the image, $2h$ away.` } },
        }),

        P({
          title: 'Real numbers',
          q: md`
            A charge $q = 2.0\ \text{nC}$ is held $d = 1.5\ \text{cm}$ above a large grounded metal plate. ($\tfrac{1}{4\pi\varepsilon_0} = 8.99\times10^9\ \text{N m}^2/\text{C}^2$.)

            Find the size of the force on the charge, the energy of the system, and the surface charge density directly below the charge.
          `,
          figHtml: FP,
          hints: [
            md`Image $-q$ at depth $d$. Force: Coulomb's law at separation $2d$. Energy: half of the two-charge value. $\sigma$ under the charge: $-\dfrac{q}{2\pi d^2}$.`,
            md`Watch the units: $d = 0.015\ \text{m}$, $q = 2.0\times10^{-9}\ \text{C}$.`,
          ],
          parts: [
            { lbl: md`$|F|$`, ans: 39.94, unit: 'µN' },
            { lbl: md`$W$`, ans: -0.5992, unit: 'µJ' },
            { lbl: md`$\sigma$ under the charge`, ans: -1.415, unit: 'µC/m²' },
          ],
          sol: md`
            **Region of interest:** $z\ge0$, above the plate.

            **Boundary conditions:**

            1. $V=0$ on the plate (grounded; treat it as an infinite plane, since $d$ is small compared with the plate).
            2. $V\to0$ far away.

            **Image:** $-q$ at depth $d$. **Check:** the plate bisects the pair, so (1) holds; both terms die far away, so (2) holds.

            **Force.** $F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{(2d)^2} = \dfrac{(8.99\times10^9)(2.0\times10^{-9})^2}{(0.030)^2} = 4.0\times10^{-5}\ \text{N} = 39.9\ \mu\text{N}$, toward the plate.

            **Energy.** $W = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{4d} = -\dfrac{(8.99\times10^9)(4.0\times10^{-18})}{0.060} = -6.0\times10^{-7}\ \text{J} = -0.599\ \mu\text{J}$.

            **Surface charge.** $\sigma = -\dfrac{q}{2\pi d^2} = -\dfrac{2.0\times10^{-9}}{2\pi(0.015)^2} = -1.41\times10^{-6}\ \text{C/m}^2$.

            **Check.** Here $|W| = F\,d$ exactly, since $|W| = \dfrac{q^2}{16\pi\varepsilon_0 d}$ and $F = \dfrac{q^2}{16\pi\varepsilon_0d^2}$: $39.9\ \mu\text{N}\times0.015\ \text{m} = 0.599\ \mu\text{J}$.
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - Force on $q$ = Coulomb force from the images only, at the real distances (charge to image is $2d$). Always attractive toward a grounded conductor.
            - Energy is **not** the image-system energy. For a charge near grounded conductors, $W = \tfrac12\,q\,V_{\text{images}}(q)$. Plane: $W = -\dfrac{q^2}{4\pi\varepsilon_0\,4d}$, half the two-charge value.
            - Three reasons for the half: field energy only in the real region; no work to move induced charge on an equipotential; in $\tfrac12\sum qV$ the conductor's term vanishes because $V=0$ there.
            - Consistency check: $F_z = -dW/dd$.
        `),
      ],
    });
  }

  // ================================================================ Lesson 4: more plane problems
  {
    const FLINE = fLineSide();
    const FTWO = fTwoCharges();
    LESSONS.push({
      id: 'u5-planes', title: 'More plane problems: several charges, lines, dipoles, two planes',
      steps: [
        RF(md`
          ### Several charges above one plane

          Images superpose. Each real charge gets its own image: the same distance below the plane, with the opposite sign. Each real-image pair has $V=0$ on $z=0$, so the sum does too, and every image is below the plane, outside the region of interest. In general a charge distribution $\rho(x,y,z)$ above the plane has the image distribution $-\rho(x,y,-z)$: the mirror picture with every sign flipped.

          The boundary conditions are the same as for one charge. Region $z\ge0$:

          1. $V=0$ on $z=0$;
          2. $V\to0$ far away.

          **Force on one of the real charges:** add the Coulomb forces from **everything except itself**: the other real charges, its own image, and the other charges' images.
        `),

        Q(md`A thin rod with uniform charge $\lambda$ lies above a grounded plane, tilted as shown. What is its image?`,
          [md`A rod with charge $-\lambda$: the mirror image of the real rod in the plane, so it tilts the other way`, md`A rod with charge $-\lambda$, the same rod moved straight down below the plane with the same tilt`, md`A point charge $-\lambda L$ at the mirror point of the rod's center`, md`A rod with charge $+\lambda$, the mirror image of the real rod`], 0,
          [null,
            md`Every bit of charge must have its image at its own mirror point. Shifting the rod without flipping its tilt puts the images of the two ends at the wrong depths, and $V\ne0$ on the plane.`,
            md`One point charge can't cancel the potential of an extended rod at every point of the plane. Each element $\lambda\,dl$ needs its own image.`,
            md`Same sign: the potentials would add on the plane instead of cancelling.`],
          md`Image each element $\lambda\,dl$ at $(x,y,z)$ by $-\lambda\,dl$ at $(x,y,-z)$. The end that is higher above the plane has its image deeper below it, so the image rod tilts the other way: it is the reflection of the real rod.

          [[fig:img]]`,
          { figHtml: fRod(), figs: { img: { svg: fRod({ img: true }), cap: md`The image is the mirror picture, with the charge reversed.` } } }),

        Q(md`Two charges sit above a grounded plane. Which charges exert forces on the left one?`,
          [md`Only the other real charge`, md`Only its own image`, md`The other real charge, its own image, and the other charge's image`, md`All four charges, including itself`], 2,
          [md`That ignores the induced charge on the plane, which the images represent.`,
            md`The other real charge and the other charge's image (that is, the charge it induces on the plane) also act on it.`,
            null,
            md`A charge exerts no net force on itself.`],
          md`In the region above the plane the field equals that of the four point charges. The force on one real charge is its charge times the field at its position from the other three.`,
          { figHtml: FTWO }),

        P({
          id: 'HW4-3.7', src: 'HW 4 · Griffiths 3.7', title: 'Two charges above a grounded plane', big: true,
          q: md`
            Find the force on the charge $+q$ in Fig. 3.14. (The $xy$ plane is a grounded conductor.)

            *Fig. 3.14: $+q$ at height $3d$ and $-2q$ at height $d$, both on the $z$-axis, above the grounded plane $z=0$.*
          `,
          figHtml: fPlane3D({ s: 46, charges: [[3, '+', '+q', '3d'], [1, '-', '-2q', 'd']] }),
          hints: [
            md`A grounded plane with two charges above it. Write the boundary conditions first: region $z\ge0$; (1) $V=0$ on $z=0$; (2) $V\to0$ far away. Then give each real charge its own image: mirror point, opposite sign.`,
            md`Images: $-2q$ at $z=d$ gives $+2q$ at $z=-d$; $+q$ at $z=3d$ gives $-q$ at $z=-3d$. The force on $+q$ comes from three charges: the real $-2q$ and the two images. Not from $+q$ itself.`,
            md`Everything is on the $z$-axis, so only $F_z$ survives. Distances from $+q$: $2d$ to $-2q$, $4d$ to $+2q$, $6d$ to $-q$. Attraction pulls down, repulsion pushes up.`,
          ],
          parts: [
            { lbl: md`$F_z$`, expr: '-(29/72)*q^2/(4*pi*eps0*d^2)', vars: { q: [1, 3], eps0: [0.5, 2], d: [1, 3] }, accepts: ['-29*q^2/(288*pi*eps0*d^2)'] },
            { lbl: md`Which way does the net force on $+q$ point?`, mc: [md`toward the plane ($-\uv z$)`, md`away from the plane ($+\uv z$)`, md`it is zero`], a: 0,
              why: [null, md`The attraction of the real $-2q$, only $2d$ away, dominates.`, md`The three contributions $-\tfrac12$, $+\tfrac18$, $-\tfrac1{36}$ don't cancel.`] },
            { lbl: md`The real $-2q$'s contribution alone, in units of $\dfrac{q^2}{4\pi\varepsilon_0d^2}$`, ans: -0.5 },
          ],
          sol: md`
            **Region and boundary conditions.** Region $z\ge0$, above the plane.

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **Images.** Mirror each real charge and flip its sign:

            | real charge | at | image | at |
            |---|---|---|---|
            | $+q$ | $z=3d$ | $-q$ | $z=-3d$ |
            | $-2q$ | $z=d$ | $+2q$ | $z=-d$ |

            [[fig:img]]

            **Check the conditions.** On $z=0$ each real charge and its image are equidistant with opposite signs, so each pair contributes zero: condition 1 holds. Every term dies far away: condition 2 holds. Both images are below the plane, so the charge in $z>0$ is unchanged. By uniqueness the four-charge potential is correct for $z\ge0$, and so is the field at $+q$.

            **Force on $+q$** at $z=3d$, from the three other charges, all on the $z$-axis:

            - real $-2q$ at $z=d$, distance $2d$, attracts (down): $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{2q^2}{(2d)^2} = -\dfrac12\,\dfrac{q^2}{4\pi\varepsilon_0d^2}$
            - image $+2q$ at $z=-d$, distance $4d$, repels (up): $+\dfrac{1}{4\pi\varepsilon_0}\dfrac{2q^2}{(4d)^2} = +\dfrac18\,\dfrac{q^2}{4\pi\varepsilon_0d^2}$
            - image $-q$ at $z=-3d$, distance $6d$, attracts (down): $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{(6d)^2} = -\dfrac{1}{36}\,\dfrac{q^2}{4\pi\varepsilon_0d^2}$

            $$F_z = \frac{q^2}{4\pi\varepsilon_0d^2}\left(-\frac12 + \frac18 - \frac1{36}\right) = \frac{q^2}{4\pi\varepsilon_0d^2}\cdot\frac{-36+9-2}{72}$$

            $$\vb F = -\frac{29}{72}\,\frac{q^2}{4\pi\varepsilon_0d^2}\,\uv z = -\frac{29\,q^2}{288\pi\varepsilon_0d^2}\,\uv z,$$

            toward the plane.

            **Why this works / what to remember.** Images superpose, one per real charge. The force on a real charge comes from every other charge, real or image, never from itself. **Check:** without the plane the force would be just the $-\tfrac12$ term. The plane's net contribution, $+\tfrac18 - \tfrac1{36} = +\tfrac{7}{72}$, pushes $+q$ up slightly: the image of $-2q$ is a large positive charge, and it repels $+q$ more than $+q$'s own image attracts it.
          `,
          figs: { img: { svg: fHW37Img(), cap: md`Each real charge gets an image of the opposite sign at its mirror point.` } },
        }),

        P({
          title: 'Two equal charges side by side',
          q: md`
            Two charges $q$ sit at $(-a,0,a)$ and $(a,0,a)$, a height $a$ above a grounded conducting plane.

            (a) Find the force on the right-hand charge: $F_x$ and $F_z$, in units of $\dfrac{q^2}{4\pi\varepsilon_0a^2}$.

            (b) Find the potential at the midpoint $M=(0,0,a)$, in units of $\dfrac{q}{4\pi\varepsilon_0a}$.
          `,
          figHtml: fTwoCharges({ mid: true }),
          hints: [
            md`Region $z\ge0$; $V=0$ on the plane and $V\to0$ far away. Two real charges, two images: $-q$ at $(-a,0,-a)$ and $-q$ at $(a,0,-a)$.`,
            md`On the right charge: the left real charge pushes it along $+x$ (distance $2a$); its own image pulls it down (distance $2a$); the left image pulls it along the diagonal toward $(-a,0,-a)$ (distance $2\sqrt2\,a$).`,
            md`The diagonal pull has components $\dfrac{1}{(2\sqrt2a)^2}\cdot\dfrac{1}{\sqrt2}$ along $-x$ and along $-z$.`,
          ],
          parts: [
            { lbl: md`(a) $F_x$`, ans: 0.1616 },
            { lbl: md`(a) $F_z$`, ans: -0.3384 },
            { lbl: md`(b) $V(M)$`, ans: 1.1056 },
          ],
          sol: md`
            **Region of interest:** $z\ge0$.

            **Boundary conditions:**

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **Images:** $-q$ at $(-a,0,-a)$ and $-q$ at $(a,0,-a)$. **Check:** (1) each real-image pair cancels on the plane; (2) every term dies far away; both images are below the plane. So the four-charge potential is the answer above the plane.

            [[fig:img]]

            **(a)** Forces on the right charge, in units of $\dfrac{q^2}{4\pi\varepsilon_0a^2}$:

            - left real $+q$, distance $2a$, repels along $+x$: $\left(+\tfrac14,\,0\right)$
            - own image $-q$, distance $2a$ straight down, attracts: $\left(0,\,-\tfrac14\right)$
            - left image $-q$, displacement $(2a,0,2a)$, distance $2\sqrt2\,a$, attracts along $-(1,0,1)/\sqrt2$: size $\dfrac{1}{8}$, components $\left(-\dfrac{1}{8\sqrt2},\,-\dfrac{1}{8\sqrt2}\right)$

            $$F_x = \frac14 - \frac{1}{8\sqrt2} \approx 0.162,\qquad F_z = -\frac14 - \frac{1}{8\sqrt2}\approx -0.338.$$

            **(b)** $M$ is $a$ from each real charge and $\sqrt{a^2+(2a)^2} = \sqrt5\,a$ from each image:

            $$V(M) = \frac{q}{4\pi\varepsilon_0a}\left(1 + 1 - \frac{1}{\sqrt5} - \frac{1}{\sqrt5}\right) = \frac{q}{4\pi\varepsilon_0a}\cdot2\left(1-\frac{1}{\sqrt5}\right)\approx1.106\,\frac{q}{4\pi\varepsilon_0a}.$$

            **Checks.** The charge is still pulled down toward the plane and pushed sideways by its neighbour, but the neighbour's image cancels part of that push. $V(M)>0$ and less than the $2\,\dfrac{q}{4\pi\varepsilon_0a}$ of the two charges alone.
          `,
          figs: { img: { svg: fTwoCharges({ img: true }), cap: md`One image per real charge.` } },
        }),

        RF(md`
          ### A line charge parallel to the plane (Griffiths 3.10)

          An infinite line charge $\lambda$ runs parallel to a grounded plane at height $d$, along the $x$ direction, directly above the $x$-axis.

          [[fig:line3d]]

          **Region:** $z\ge0$. **Boundary conditions:**

          1. $V=0$ on $z=0$;
          2. $V\to0$ far from the wire.

          **Image:** a line charge $-\lambda$ at depth $d$, the mirror line.

          For a single infinite line charge, $V = -\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s}{s_0}$, where $s$ is the distance to the line; the reference $s_0$ is needed because one line's potential can't be set to zero at infinity. For the pair the references cancel:

          $$V(y,z) = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac{s_-}{s_+} = \frac{\lambda}{4\pi\varepsilon_0}\ln\frac{y^2+(z+d)^2}{y^2+(z-d)^2},\qquad z\ge0,$$

          with $s_\pm$ the distances to $\pm\lambda$.

          **Check.** On $z=0$, $s_+=s_-$ and $\ln1=0$: condition 1. Far away $s_-/s_+\to1$: condition 2 holds for the pair, even though it fails for one line alone. The image is below the plane.

          [[fig:lineimg]]

          The same steps as for the point charge give

          $$\sigma(y) = -\varepsilon_0\left.\frac{\partial V}{\partial z}\right|_{z=0} = -\frac{\lambda d}{\pi(y^2+d^2)},$$

          which integrates over $y$ to $-\lambda$ per unit length, the image's charge. The force per unit length on the wire is the pull of the image line, whose field at distance $2d$ is $\dfrac{\lambda}{2\pi\varepsilon_0(2d)}$:

          $$\frac{F}{L} = \frac{\lambda^2}{4\pi\varepsilon_0 d}\quad\text{toward the plane.}$$

          Compare with the point charge: $\sigma$ falls off like $1/y^2$ instead of $1/r^3$, and the force like $1/d$ instead of $1/d^2$. Lines spread their field out more slowly than points.
        `, { line3d: { svg: fPlane3D({ wire: true, charges: [] }), cap: md`A long wire with charge $\lambda$ per length, a height $d$ above the grounded plane.` },
          lineimg: { svg: fLineSide({ img: true }), cap: md`End-on view: the image is the line $-\lambda$ at the mirror position.` } }),

        Q(md`One infinite line charge has a potential that grows like $\ln s$ and can't be set to zero at infinity. Why does the image solution still satisfy $V\to0$ far from the wire?`,
          [md`It doesn't; you have to pick a reference point instead`, md`Because the plane screens the wire completely`, md`The two logarithms combine to $\ln(s_-/s_+)$, and far away $s_-/s_+\to1$`, md`Because $\lambda$ is small`], 2,
          [md`For the pair, $V = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s_-}{s_+}$ does go to zero far away, with no reference point left over.`,
            md`The plane doesn't screen the region above it; the field there is the field of $\lambda$ plus its induced charge.`,
            null,
            md`The size of $\lambda$ has nothing to do with it; the cancellation is exact for any $\lambda$.`],
          md`$-\dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s_+}{s_0} + \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s_-}{s_0} = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s_-}{s_+}$. The reference $s_0$ cancels. Far away both distances are nearly equal, so $V\to0$: the line plus its induced charge is neutral.`,
          { figHtml: FLINE }),

        Q(md`How does the induced charge density $\sigma(y)$ under the wire fall off far from it?`,
          [md`Like $1/|y|^3$, as for a point charge`, md`Like $1/y^2$`, md`Like $1/|y|$`, md`Exponentially`], 1,
          [md`That is the point charge, $\sigma\propto(x^2+y^2+d^2)^{-3/2}$. A line charge is spread along $x$, which slows the falloff.`,
            null,
            md`$1/|y|$ would make the total induced charge per length diverge (logarithmically). It is $1/y^2$, and the integral gives $-\lambda$.`,
            md`No exponentials appear; $\sigma = -\dfrac{\lambda d}{\pi(y^2+d^2)}$ is a power law.`],
          md`$\sigma(y) = -\dfrac{\lambda d}{\pi(y^2+d^2)}\approx -\dfrac{\lambda d}{\pi y^2}$ for $|y|\gg d$. Integrating, $\displaystyle\int_{-\infty}^{\infty}\frac{d\,dy}{y^2+d^2} = \pi$, so the total per length is $-\lambda$.`,
          { figHtml: FLINE }),

        Q(md`You lower the wire from height $d$ to height $d/2$. The force per unit length on it becomes:`,
          [md`$4$ times as large`, md`Unchanged`, md`$\sqrt2$ times as large`, md`$2$ times as large`], 3,
          [md`That is the point-charge scaling. Between two parallel lines the force goes as $1/(\text{distance})$, not $1/(\text{distance})^2$.`,
            md`The image line moves closer, so the pull grows.`,
            md`No square roots: $F/L\propto1/d$.`,
            null],
          md`$F/L = \lambda\cdot\dfrac{\lambda}{2\pi\varepsilon_0(2d)} = \dfrac{\lambda^2}{4\pi\varepsilon_0d}\propto\dfrac1d$. Halve $d$, double the force per length.`,
          { figHtml: FLINE }),

        P({
          title: 'A wire above a grounded plane',
          q: md`
            A long straight wire with charge $\lambda$ per unit length runs parallel to a grounded conducting plane at height $d$.

            (a) Find $E_z$ just above the plane, directly under the wire ($+z$ points away from the plane).

            (b) Find $\sigma$ on the plane at the point $P$, a horizontal distance $d$ from the point under the wire.

            (c) Find the size of the force per unit length on the wire.
          `,
          figHtml: fLineSide({ pt: 1, ptLab: 'P' }),
          hints: [
            md`Region $z\ge0$; conditions $V=0$ on the plane and $V\to0$ far away. Image: $-\lambda$ at the mirror line. The field of a line charge is $\dfrac{\lambda}{2\pi\varepsilon_0s}$ (it's on the formula sheet).`,
            md`(a) Directly below, both lines are a distance $d$ away and both fields point down. (b) $\sigma = \varepsilon_0E_z$ just above, or use $\sigma(y) = -\dfrac{\lambda d}{\pi(y^2+d^2)}$.`,
            md`(c) The wire feels only the image line's field, at distance $2d$.`,
          ],
          parts: [
            { lbl: md`(a) $E_z$`, expr: '-lambda/(pi*eps0*d)', vars: { lambda: [1, 3], eps0: [0.5, 2], d: [1, 3] } },
            { lbl: md`(b) $\sigma(P)$`, expr: '-lambda/(2*pi*d)', vars: { lambda: [1, 3], d: [1, 3] } },
            { lbl: md`(c) $F/L$`, expr: 'lambda^2/(4*pi*eps0*d)', vars: { lambda: [1, 3], eps0: [0.5, 2], d: [1, 3] } },
          ],
          sol: md`
            **Region of interest:** $z\ge0$.

            **Boundary conditions:**

            1. $V=0$ on the plane.
            2. $V\to0$ far from the wire.

            **Image:** $-\lambda$ at depth $d$. **Check:** (1) on the plane every point is equidistant from both lines, so $\ln(s_-/s_+) = 0$; (2) far away $s_-/s_+\to1$, so $V\to0$; the image is below the plane.

            [[fig:img]]

            **(a)** Each line is $d$ from the point; $\lambda$'s field points away from it (down) and $-\lambda$'s field points toward it (down):

            $$E_z = -\frac{\lambda}{2\pi\varepsilon_0d} - \frac{\lambda}{2\pi\varepsilon_0d} = -\frac{\lambda}{\pi\varepsilon_0d}.$$

            **(b)** $\sigma(y) = -\dfrac{\lambda d}{\pi(y^2+d^2)}$ with $y = d$: $\sigma = -\dfrac{\lambda}{2\pi d}$, half the value under the wire (where $\sigma = \varepsilon_0E_z = -\lambda/(\pi d)$, consistent with (a)).

            **(c)** $F/L = \lambda\cdot\dfrac{\lambda}{2\pi\varepsilon_0(2d)} = \dfrac{\lambda^2}{4\pi\varepsilon_0d}$, toward the plane.

            **Checks.** Units: $\lambda/(\varepsilon_0d)$ is a field; $\lambda/d$ is a surface density; $\lambda^2/(\varepsilon_0d)$ is a force per length. (b) at $y=0$ equals $\varepsilon_0$ times (a).
          `,
          figs: { img: { svg: fLineSide({ img: true }), cap: md`The wire and its image line, end-on.` } },
        }),

        RF(md`
          ### A dipole above the plane

          A dipole is a $+q$ and a $-q$ close together. Image each charge: the $+q$ becomes $-q$ at its mirror point and the $-q$ becomes $+q$. Draw the image arrow from its $-$ end to its $+$ end and you get the rule:

          **mirror the arrow in the plane, then reverse it.** In components, $\vb p = (p_x,p_y,p_z)\;\to\;\vb p' = (-p_x,-p_y,+p_z)$.

          [[fig:dip]]

          - $\vb p$ perpendicular to the plane: the image points the **same** way, $\vb p' = \vb p$.
          - $\vb p$ parallel to the plane: the image points the **opposite** way, $\vb p' = -\vb p$.

          Either way the dipole is attracted to the plane, and a tilted dipole is also twisted toward the perpendicular orientation (its energy is lowest there). The boundary conditions and the checks are exactly those for the point charge, applied to each end of the dipole.
        `, { dip: PF.row([{ svg: fDipole('perp', { img: true }), cap: 'Perpendicular: same direction' }, { svg: fDipole('par', { img: true }), cap: 'Parallel: reversed' }]) }),

        Q(md`A dipole points straight up, away from the grounded plane. Which way does its image dipole point?`,
          [md`Up, the same way as the real dipole`, md`Down, toward the real dipole`, md`Parallel to the plane`, md`There is no image dipole; the two image charges cancel`], 0,
          [null,
            md`Reflect the charges: the real $+q$ (top) has image $-q$ at the bottom; the real $-q$ (lower) has image $+q$ just below the plane. The image runs from $-$ (deeper) to $+$ (shallower): up.`,
            md`By symmetry the image of a vertical dipole is vertical.`,
            md`The two image charges sit at different depths, so they form a dipole.`],
          md`Rule: mirror, then reverse. Mirroring a vertical up-arrow in the plane gives a down-arrow; reversing gives up again. Components: $(0,0,p)\to(0,0,+p)$.`,
          { figHtml: fDipole('perp') }),

        Q(md`A dipole lies parallel to the grounded plane, pointing to the right. Which way does its image point?`,
          [md`To the right, parallel to the real dipole`, md`To the left, antiparallel to the real dipole`, md`Straight down`, md`Straight up`], 1,
          [md`Each end's image has the opposite sign, so the image's $+$ end is under the real $-$ end. It points left.`,
            null,
            md`The image of a horizontal dipole is horizontal: both ends are at the same depth.`,
            md`Both image charges are at the same depth, so the image dipole is horizontal.`],
          md`Mirroring a horizontal arrow in a horizontal plane leaves it unchanged; reversing it then points it left. Components: $(p,0,0)\to(-p,0,0)$.`,
          { figHtml: fDipole('par') }),

        Q(md`A dipole above the plane is tilted as shown, with components $p_x>0$ and $p_z>0$. What are the components of its image?`,
          [md`$(p_x,\,0,\,p_z)$`, md`$(-p_x,\,0,\,-p_z)$`, md`$(p_x,\,0,\,-p_z)$`, md`$(-p_x,\,0,\,p_z)$`], 3,
          [md`That copies the dipole without flipping any charge signs. The image charges have opposite signs to the real ones.`,
            md`That is just $-\vb p$. The vertical component keeps its sign, because the mirror flips it and the charge reversal flips it back.`,
            md`That is only the mirror image of the arrow. The charges also change sign, which reverses the whole arrow.`,
            null],
          md`Mirror: $(p_x,p_z)\to(p_x,-p_z)$. Reverse: $\to(-p_x,p_z)$. The horizontal part flips, the vertical part stays.

          [[fig:img]]`,
          { figHtml: fDipole('tilt'), figs: { img: { svg: fDipole('tilt', { img: true }), cap: md`The tilted dipole and its image: horizontal part reversed, vertical part kept.` } } }),

        P({
          title: 'A physical dipole standing on the plane',
          q: md`
            A charge $-q$ is held a height $a$ above a grounded conducting plane, and a charge $+q$ a height $2a$, directly above it.

            (a) Where are the image charges? Which way does the image dipole point?

            (b) Find the net force on the pair (the sum of the forces on both real charges), in units of $\dfrac{q^2}{4\pi\varepsilon_0a^2}$, with $+z$ away from the plane.
          `,
          figHtml: fVertDipole(),
          hints: [
            md`Region $z\ge0$, $V=0$ on the plane, $V\to0$ far away. Image each real charge: mirror point, opposite sign.`,
            md`The forces between the two real charges are equal and opposite, so they cancel in the net force. Only the images contribute.`,
            md`On $+q$ (at $2a$): image $-q$ at $-2a$ (distance $4a$) and image $+q$ at $-a$ (distance $3a$). On $-q$ (at $a$): image $-q$ at $-2a$ (distance $3a$) and image $+q$ at $-a$ (distance $2a$). Watch which pairs attract.`,
          ],
          parts: [
            { lbl: md`(a) The image dipole points`, mc: [md`up, the same way as the real one`, md`down, opposite to the real one`, md`sideways`], a: 0,
              why: [null, md`The images are $+q$ at $-a$ and $-q$ at $-2a$. From $-$ to $+$ is upward.`, md`All four charges are on the $z$-axis.`] },
            { lbl: md`(b) net $F_z$`, ans: -0.09028 },
          ],
          sol: md`
            **Region of interest:** $z\ge0$.

            **Boundary conditions:**

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **(a) Images.** $+q$ at $2a$ → $-q$ at $-2a$. $-q$ at $a$ → $+q$ at $-a$. **Check:** (1) each real-image pair cancels on the plane; (2) all four terms die far away; both images are below the plane. The image dipole runs from $-q$ (at $-2a$) to $+q$ (at $-a$): **up**, the same way as the real dipole (from $-q$ at $a$ to $+q$ at $2a$). That is the rule "mirror, then reverse".

            [[fig:img]]

            **(b)** The real-real forces cancel in the sum. Image forces, in units of $\dfrac{q^2}{4\pi\varepsilon_0a^2}$:

            - on $+q$: from image $-q$ (distance $4a$) attraction, down: $-\tfrac{1}{16}$; from image $+q$ (distance $3a$) repulsion, up: $+\tfrac19$
            - on $-q$: from image $-q$ (distance $3a$) repulsion, up: $+\tfrac19$; from image $+q$ (distance $2a$) attraction, down: $-\tfrac14$

            $$F_z = -\frac1{16} + \frac19 + \frac19 - \frac14 = \frac{-9+16+16-36}{144} = -\frac{13}{144}\approx-0.0903.$$

            The pair is attracted to the plane, as every dipole is.

            **Check.** A single charge $q$ at $a$ would feel $-\tfrac14$; the dipole's force is much weaker, because its far-reaching monopole part is missing.
          `,
          figs: { img: { svg: fVertDipole({ img: true }), cap: md`The real pair (solid) and the image pair (dashed).` } },
        }),

        RF(md`
          ### A plane held at $V_0$ instead of grounded

          Suppose the plane is held at $V_0\ne0$. Is the answer the image solution plus $V_0$? Look at the conditions before guessing.

          An infinite plane at $V_0$ can't have $V\to0$ in every direction: far out along the plane, $V$ is still $V_0$. So $V(\infty)=0$ is not an available boundary condition here. The natural one is: far from the charge, $V\to V_0$ (no other charges anywhere, so no field far away).

          **Region:** $z\ge0$. **Boundary conditions:**

          1. $V=V_0$ on $z=0$;
          2. $V\to V_0$ far from the charge.

          Then

          $$V = V_0 + \frac{q}{4\pi\varepsilon_0}\left(\frac{1}{\srm_+} - \frac{1}{\srm_-}\right),\qquad z\ge0.$$

          **Check.** Adding a constant doesn't change $\nabla^2V$, so the charge in the region is right. On the plane the image part is zero, so $V = V_0$: condition 1. Far away the image part dies: condition 2. By uniqueness, this is it.

          $\vb E$, $\sigma$, the force and the energy are exactly those of the grounded plane. For an infinite plane, "grounded" and "held at $V_0$" differ only in where you put the zero of potential.

          (If instead a distant electrode produces a uniform field $E_0$ above the plane, the condition far away becomes $V\to V_0 - E_0z$, and you add $-E_0z$ as well. That adds a uniform $\sigma = \varepsilon_0E_0$ to the induced charge. A different problem.)

          A sphere is another story: changing a sphere's potential changes its charge, and that changes the force. That comes in the sphere lessons.
        `),

        Q(md`The plane is held at $V_0\ne0$ instead of grounded, with $q$ above it. Which condition far away replaces $V(\infty)=0$?`,
          [md`$V\to V_0$ far from the charge`, md`Still $V\to0$ in every direction`, md`No condition is needed far away`, md`$V\to V_0/2$ halfway between the plane and infinity`], 0,
          [null,
            md`Impossible: far out along the plane $V$ is still $V_0$, so $V$ can't approach $0$ in every direction.`,
            md`Without a condition at infinity the solution isn't unique (you could add $E_0z$ for any $E_0$).`,
            md`There is no such condition; "halfway to infinity" isn't a place.`],
          md`With no other charges, the field far away vanishes, so $V$ approaches the plane's potential: $V\to V_0$. The solution is $V_0$ plus the grounded-plane image solution.`,
          { figHtml: fPlane({ planeLab: 'V=V_0' }) }),

        Q(md`For an infinite plane held at $V_0$ (with $V\to V_0$ far away) instead of grounded, how do $\sigma$ and the force on $q$ change?`,
          [md`$\sigma$ gains a uniform extra term $\varepsilon_0V_0/d$`, md`The force gains a term proportional to $qV_0$`, md`Neither changes; only $V$ shifts by the constant $V_0$`, md`Both double`], 2,
          [md`A constant added to $V$ has zero derivative, so $\sigma = -\varepsilon_0\,\partial V/\partial n$ is unchanged.`,
            md`The field is unchanged (a constant has zero gradient), so the force is unchanged.`,
            null,
            md`Nothing doubles; the field is exactly the grounded-plane field.`],
          md`$V = V_0 + V_{\text{grounded}}$. Constants drop out of $\vb E = -\nabla V$ and of $\partial V/\partial n$. For an infinite plane, holding it at $V_0$ just moves the zero of potential.`,
          { figHtml: fPlane({ planeLab: 'V=V_0' }) }),

        RF(md`
          ### A charge between two grounded planes: an infinite series

          Put $q$ at height $d$ between grounded planes at $z=0$ and $z=L$.

          [[fig:setup]]

          **Region:** $0\le z\le L$. **Boundary conditions:**

          1. $V=0$ on $z=0$;
          2. $V=0$ on $z=L$;
          3. $V\to0$ far away along the slab.

          One image is not enough. The image $-q$ at $z=-d$ fixes the bottom plane but spoils the top one. So image that image in the top plane, and so on. Reflecting back and forth gives an infinite row:

          $$-q\ \text{at}\ z = 2nL-d\ \ (\text{all integers } n),\qquad +q\ \text{at}\ z = 2nL+d\ \ (n\ne0).$$

          [[fig:series]]

          **Check.** Every image is outside the slab. Each plane is the perpendicular bisector of infinitely many $\pm$ pairs, so $V=0$ on both. Along the slab the terms die off.

          **Force on $q$.** The $+q$ images sit in pairs at equal distances above and below $q$ ($z = d\pm2nL$), so their forces cancel. The $-q$ images give

          $$F_z = \frac{q^2}{16\pi\varepsilon_0}\sum_{n=0}^{\infty}\left[\frac{1}{\big((n+1)L-d\big)^2} - \frac{1}{(nL+d)^2}\right].$$

          The $n=0$ terms are the two nearest images: $-\dfrac{1}{d^2}$ is the pull of the bottom plane (the single-plane result), and $+\dfrac{1}{(L-d)^2}$ the pull of the top plane. The rest are corrections from images farther out.

          **Convergence.** Each bracket is a difference of two nearly equal terms, so it shrinks like $1/n^3$ and the sum converges quickly. (The series for $V$ converges too: far-away images come in $\pm$ pairs that look like dipoles.)

          **Checks.** At the midplane, $d=L/2$, every bracket is zero, so $F=0$, as symmetry demands. As $d\to0$ the $-1/d^2$ term dominates and you recover the single plane.

          **Induced charges.** The bottom plane gets $-q\left(1-\dfrac dL\right)$ and the top $-q\,\dfrac dL$; the nearer plane gets more, and the total is $-q$. A quick way to see the split: smear $q$ into a uniform sheet at height $d$ (every point of the sheet is equivalent, so the split is the same as for one point charge). Between grounded plates the sheet's field is uniform on each side, with $E_{\text{below}}\,d = E_{\text{above}}(L-d)$ (both plates at $V=0$), so the charges split in the ratio $(L-d):d$.
        `, { setup: { svg: fTwoPlanes(), cap: md`A charge between two grounded planes.` }, series: { svg: fTwoPlanesImg(), cap: md`The image row ($n=-1,0,1$ shown). The real charge is in the shaded slab.` } }),

        Q(md`Why does a charge between two grounded parallel planes need infinitely many images?`,
          [md`Because the planes are infinite`, md`Because each image fixes one plane but spoils the other, so you keep reflecting`, md`Because the charge is a point`, md`It doesn't; two images (one per plane) are enough`], 1,
          [md`One infinite plane needs only one image. The number comes from having two planes facing each other.`,
            null,
            md`A point charge near one plane needs one image. The issue is the second plane.`,
            md`With one image per plane, the image $-q$ below the bottom plane makes $V\ne0$ on the top plane, and vice versa.`],
          md`Two parallel mirrors make an infinite row of reflections, like a person standing between two mirrors. Each new image fixes the plane it was reflected in and upsets the other one, and the corrections shrink with distance.`,
          { figHtml: fTwoPlanes() }),

        Q(md`The charge sits exactly halfway between the two grounded planes. What is the force on it?`,
          [md`Zero, by symmetry`, md`$\dfrac{q^2}{4\pi\varepsilon_0L^2}$ toward the bottom plane`, md`$\dfrac{q^2}{4\pi\varepsilon_0L^2}$ toward the top plane`, md`The series diverges, so it is infinite`], 0,
          [null,
            md`At the midplane the setup is symmetric under reflection, so there's no preferred direction.`,
            md`By symmetry the pulls of the two planes cancel.`,
            md`Each bracket of the force series is exactly zero at $d = L/2$, and in general the series converges like $\sum1/n^3$.`],
          md`At $d = L/2$: $(n+1)L - d = (n+\tfrac12)L = nL + d$, so every bracket vanishes. The equilibrium is unstable: move $q$ toward either plane and that plane pulls harder.`,
          { figHtml: fTwoPlanes({ dpx: 60, dLab: 'L/2' }) }),

        Q(md`The charge is a quarter of the way from the bottom plane to the top plane ($d = L/4$). How much charge is induced on the **bottom** plane?`,
          [md`$-q/2$`, md`$-q/4$`, md`$-q$`, md`$-3q/4$`], 3,
          [md`An even split happens only at the midplane.`,
            md`That is the top plane's share, $-q\,d/L$.`,
            md`$-q$ is the total on both planes together.`,
            null],
          md`Bottom: $-q(1 - d/L) = -\tfrac34q$; top: $-q\,d/L = -\tfrac14q$. The nearer plane catches more of the field lines.`,
          { figHtml: fTwoPlanes({ dpx: 30, dLab: 'L/4' }) }),

        P({
          title: 'Between two planes, off-center',
          q: md`
            A charge $q$ is placed between two grounded parallel planes a distance $L$ apart, at $d = L/4$ from the bottom plane.

            (a) What charge is induced on the bottom plane?

            (b) Find the force on $q$, $F_z$ in units of $\dfrac{q^2}{4\pi\varepsilon_0L^2}$ ($+z$ toward the top plane). Sum the image series until it is stable to about $1\%$.

            (c) What would $F_z$ be (same units) if only the bottom plane were present?
          `,
          figHtml: fTwoPlanes({ dpx: 30, dLab: 'L/4' }),
          hints: [
            md`Boundary conditions: $V=0$ on both planes, $V\to0$ far along the slab. The images: $-q$ at $2nL-d$ for all $n$, $+q$ at $2nL+d$ for $n\ne0$. The $+q$ images cancel in pairs.`,
            md`$F_z = \dfrac{q^2}{16\pi\varepsilon_0}\displaystyle\sum_{n\ge0}\left[\frac{1}{((n+1)L-d)^2} - \frac{1}{(nL+d)^2}\right]$. In units of $\dfrac{q^2}{4\pi\varepsilon_0L^2}$ that is $\tfrac14\sum$ with $L=1$, $d = 0.25$.`,
            md`The first bracket is $\dfrac{1}{0.75^2} - \dfrac{1}{0.25^2} = 1.778 - 16$. The next ones are small: about $-0.31$, $-0.065$, $-0.024$, $-0.011,\dots$`,
          ],
          parts: [
            { lbl: md`(a) $Q_{\text{bottom}}$`, expr: '-3*q/4', vars: { q: [1, 3] } },
            { lbl: md`(b) $F_z$`, ans: -3.664 },
            { lbl: md`(c) $F_z$, bottom plane only`, ans: -4 },
          ],
          sol: md`
            **Region of interest:** the slab $0\le z\le L$.

            **Boundary conditions:**

            1. $V=0$ on $z=0$.
            2. $V=0$ on $z=L$.
            3. $V\to0$ far along the slab.

            **Images:** the infinite row from the lesson. **Check:** (1) and (2) each plane is the perpendicular bisector of infinitely many $\pm$ pairs; (3) every term dies far along the slab, and the series converges; every image is outside the slab.

            [[fig:img]]

            **(a)** $Q_{\text{bottom}} = -q(1 - d/L) = -\tfrac34q$ (and $-\tfrac14q$ on the top plane).

            **(b)** In units of $\dfrac{q^2}{4\pi\varepsilon_0L^2}$, $F_z = \tfrac14\sum_{n\ge0}\left[\dfrac{1}{(n+0.75)^2} - \dfrac{1}{(n+0.25)^2}\right]$:

            | $n$ | bracket | running total | $F_z$ |
            |---|---|---|---|
            | 0 | $1.778 - 16 = -14.222$ | $-14.222$ | $-3.556$ |
            | 1 | $0.327 - 0.640 = -0.314$ | $-14.536$ | $-3.634$ |
            | 2 | $0.132 - 0.198 = -0.065$ | $-14.601$ | $-3.650$ |
            | 3 | $0.071 - 0.095 = -0.024$ | $-14.625$ | $-3.656$ |
            | 4 | $0.044 - 0.055 = -0.011$ | $-14.636$ | $-3.659$ |

            The tail adds about $-0.02$ more to the bracket sum; the limit is $F_z\approx-3.66\,\dfrac{q^2}{4\pi\varepsilon_0L^2}$, toward the bottom plane.

            **(c)** One plane: $F_z = -\dfrac{q^2}{4\pi\varepsilon_0(2d)^2} = -\dfrac{q^2}{4\pi\varepsilon_0(L/2)^2} = -4\,\dfrac{q^2}{4\pi\varepsilon_0L^2}$.

            **Check.** The top plane pulls the other way, so the net pull toward the bottom is a bit less than $4$. The leading correction, $+\tfrac14\cdot\dfrac{1}{0.75^2} = 0.44$, is the top plane's direct pull; the rest of the series takes back a little of that.
          `,
          figs: { img: { svg: fTwoPlanesImg(), cap: md`The image row for a charge between two grounded planes.` } },
        }),

        RF(md`
          !!key Patterns to remember
            - Many charges, one plane: one image per charge (mirror point, opposite sign). The force on a real charge comes from every other charge, real or image, never itself.
            - Line charge $\lambda$: image $-\lambda$; $V = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{s_-}{s_+}$; $\sigma = -\dfrac{\lambda d}{\pi(y^2+d^2)}$; $F/L = \dfrac{\lambda^2}{4\pi\varepsilon_0d}$.
            - Dipole: mirror the arrow, then reverse it: $(p_x,p_y,p_z)\to(-p_x,-p_y,+p_z)$. Always attracted.
            - Infinite plane at $V_0$: add the constant $V_0$ (with $V\to V_0$ far away). Fields, $\sigma$ and forces are unchanged.
            - Two parallel planes: an infinite image row; the force series converges like $\sum1/n^3$; zero force at the midplane.
        `),
      ],
    });
  }

  // ================================================================ Lesson 5: corners and wedges
  {
    const FC = fCorner();
    const FCaa = fCorner({ a: 1.5, b: 1.5, aLab: 'a', bLab: 'a' });
    LESSONS.push({
      id: 'u5-corner', title: 'Grounded corners and wedges',
      steps: [
        RF(md`
          ### Two grounded half-planes at a right angle (Griffiths 3.11)

          Two semi-infinite grounded conducting planes meet at a right angle along the $z$-axis: one is the plane $y=0$ (for $x>0$), the other the plane $x=0$ (for $y>0$). A charge $q$ sits between them at $(a,b,0)$.

          [[fig:setup]]

          **Region of interest:** the quarter-space $x\ge0$, $y\ge0$. **Boundary conditions:**

          1. $V=0$ on the plane $x=0$;
          2. $V=0$ on the plane $y=0$;
          3. $V\to0$ far away.

          Build the images one plane at a time.

          - Mirror $q$ in $x=0$: $-q$ at $(-a,b,0)$. Now condition 1 holds, but condition 2 doesn't: on $y=0$ this pair doesn't cancel.
          - Mirror **both** charges in $y=0$: $q\to-q$ at $(a,-b,0)$, and $-q\to+q$ at $(-a,-b,0)$.

          [[fig:img]]

          **Check.** The four charges form a $\pm$ checkerboard.

          - Condition 1: the plane $x=0$ is the perpendicular bisector of $q$ at $(a,b)$ and $-q$ at $(-a,b)$, and of $-q$ at $(a,-b)$ and $+q$ at $(-a,-b)$. Each pair cancels there.
          - Condition 2: the plane $y=0$ bisects $q$ and $-q$ at $(a,-b)$, and $-q$ at $(-a,b)$ and $+q$ at $(-a,-b)$.
          - Condition 3: every term dies far away.
          - All three images are outside the quadrant, so the charge in the region is just $q$.

          So, for $x\ge0$, $y\ge0$,

          $$V = \frac{q}{4\pi\varepsilon_0}\left[\frac{1}{\srm_1} - \frac{1}{\srm_2} - \frac{1}{\srm_3} + \frac{1}{\srm_4}\right],$$

          $$\srm_1 = \sqrt{(x-a)^2+(y-b)^2+z^2},\quad \srm_2 = \sqrt{(x+a)^2+(y-b)^2+z^2},\quad \srm_3 = \sqrt{(x-a)^2+(y+b)^2+z^2},\quad \srm_4 = \sqrt{(x+a)^2+(y+b)^2+z^2}.$$

          The $+q$ at the opposite corner is the image people forget. Without it, the image $-q$ at $(a,-b)$ has no partner across $x=0$, and $V\ne0$ on that plane.

          Far away, the four charges have zero net charge and zero dipole moment, so $V$ falls off fast (like $1/r^3$). All of $q$'s field lines end on the two half-planes: the total induced charge is $-q$, the sum of the three images.
        `, { setup: { svg: FC, cap: md`A charge in a grounded right-angle corner.` }, img: { svg: fCornerImg(), cap: md`Three images. The real region is shaded; the metal has been replaced by the images.` } }),

        Q(md`How many image charges does the right-angle corner need?`,
          [md`1`, md`2`, md`3`, md`4`], 2,
          [md`One image fixes one plane only.`,
            md`With two images ($-q$ across each plane), each image is left without a partner across the other plane, so neither plane is at $V=0$.`,
            null,
            md`Four would be counting $q$ itself. The images are the three other corners of the checkerboard.`],
          md`Reflect in one plane, then reflect both charges in the other: $-q$ at $(-a,b)$, $-q$ at $(a,-b)$, $+q$ at $(-a,-b)$. In general a wedge of angle $\pi/n$ needs $2n-1$ images; here $n=2$.`,
          { figHtml: FC }),

        Q(md`What image sits at $(-a,-b)$, diagonally across the corner from $q$?`,
          [md`$-q$`, md`$-2q$`, md`Nothing; only two images are needed`, md`$+q$`], 3,
          [md`It is the image of an image: reflecting $-q$ at $(-a,b)$ in the plane $y=0$ flips its sign back to $+q$.`,
            md`Image charges have the same size as the charge they reflect, here $q$.`,
            md`Without it the two $-q$ images spoil each other's planes: $V\ne0$ on both.`,
            null],
          md`Two reflections, two sign flips: $+q$. The pattern is a checkerboard: neighbouring corners have opposite signs, so each plane separates $\pm$ pairs.`,
          { figHtml: FC }),

        Q(md`A student uses only the two images shown: $-q$ at $(-a,b)$ and $-q$ at $(a,-b)$. Which boundary condition fails?`,
          [md`None; this is a valid solution`, md`$V=0$ fails on both planes: each image has no partner across the other plane`, md`Only $V\to0$ at infinity fails`, md`Only the charge in the region is wrong`], 1,
          [md`On the plane $x=0$, the image at $(a,-b)$ is unpaired, so $V\ne0$ there. Same story on $y=0$.`,
            null,
            md`Three point charges still give $V\to0$ far away.`,
            md`Both images are outside the quadrant, so the charge in the region is fine. The trouble is on the boundary.`],
          md`On $x=0$: $q$ and $-q$ at $(-a,b)$ cancel, but $-q$ at $(a,-b)$ contributes $-\dfrac{q}{4\pi\varepsilon_0\sqrt{a^2+(y+b)^2+z^2}}\ne0$. Adding $+q$ at $(-a,-b)$ gives it a partner. Always **check every boundary condition** after placing images.`,
          { figHtml: fCornerImg({ only2: true }) }),

        Q(md`Where does the four-charge formula give the true potential?`,
          [md`In the quadrant $x\ge0$, $y\ge0$ only`, md`Everywhere`, md`In all four quadrants, since it has the right symmetry`, md`Only on the two planes`], 0,
          [null,
            md`Outside the quadrant is metal, where $V=0$. The four-charge formula is wrong there.`,
            md`The other three quadrants contain the fictitious images; the real potential there is $0$ (it is metal).`,
            md`It is correct throughout the region of interest, not only on its boundary.`],
          md`Uniqueness certifies the formula only in the region where it has the right charge and meets the boundary conditions: $x\ge0$, $y\ge0$.`,
          { figHtml: FC }),

        Q(md`What is the electric field at the corner line itself, where the two planes meet?`,
          [md`Infinite, as at any sharp edge of a conductor`, md`$\dfrac{q}{4\pi\varepsilon_0(a^2+b^2)}$, pointing away from $q$`, md`$\sigma/\varepsilon_0$ with $\sigma = -q/(4\pi(a^2+b^2))$`, md`Zero`], 3,
          [md`Fields blow up at sharp **convex** edges that stick out. This corner is concave (the field region is inside the angle), and the field there vanishes.`,
            md`That is $q$'s field alone. The three images are at the same distance from the corner, and their fields cancel $q$'s.`,
            md`The induced charge density goes to zero at the corner, so this isn't right either.`,
            null],
          md`All four charges are a distance $\sqrt{a^2+b^2}$ from the corner. The field there is $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{\sum Q_i\vb r_i}{(a^2+b^2)^{3/2}}$, and $\sum Q_i\vb r_i$ (the dipole moment of the checkerboard) is zero. A concave corner is shielded: the field and $\sigma$ both go to zero there.`,
          { figHtml: FC }),

        RF(md`
          ### Force and energy

          The force on $q$ is the sum of the three image forces (never its own field):

          - $-q$ at $(-a,b)$, distance $2a$: pulls $q$ toward the plane $x=0$: $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{(2a)^2}\,\uv x$.
          - $-q$ at $(a,-b)$, distance $2b$: pulls $q$ toward the plane $y=0$: $-\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{(2b)^2}\,\uv y$.
          - $+q$ at $(-a,-b)$, distance $2\sqrt{a^2+b^2}$: **pushes** $q$ away from the corner, along $(a,b)$: $+\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{4(a^2+b^2)}\,\dfrac{a\,\uv x+b\,\uv y}{\sqrt{a^2+b^2}}$.

          $$\vb F = \frac{q^2}{4\pi\varepsilon_0}\left\{\left[\frac{a}{4(a^2+b^2)^{3/2}} - \frac{1}{4a^2}\right]\uv x + \left[\frac{b}{4(a^2+b^2)^{3/2}} - \frac{1}{4b^2}\right]\uv y\right\}$$

          [[fig:forces]]

          Each bracket is negative (the far repulsion is weaker than the matching attraction), so $q$ is pulled toward the corner, but less than the two planes would pull if each acted alone.

          **Energy (the work to bring $q$ in from infinity).** Use the half rule, $W = \tfrac12\,q\,V_{\text{images}}(a,b)$:

          $$W = \frac12\,q\cdot\frac{q}{4\pi\varepsilon_0}\left[-\frac{1}{2a} - \frac{1}{2b} + \frac{1}{2\sqrt{a^2+b^2}}\right] = \frac{q^2}{16\pi\varepsilon_0}\left[\frac{1}{\sqrt{a^2+b^2}} - \frac1a - \frac1b\right].$$

          It is **not** the energy $U_4$ of the four charges treated as real. The six pairs of the checkerboard split into three $q$-image pairs and three image-image pairs, and the two sets give equal sums, so $U_4 = 2\,qV_{\text{images}}$ and $W = U_4/4$. The picture: the four-charge field fills four quadrants with equal energy, the real field fills one.
        `, { forces: { svg: fCornerImg({ forces: true, a: 2, b: 2 }), cap: md`For $a=b$: two image pulls (toward each plane), one push from the far image, and the net force (thick) toward the corner.` } }),

        Q(md`$q$ sits on the diagonal, at equal distances $a$ from both planes. Which way is the force on it?`,
          [md`Toward the corner, along the diagonal`, md`Away from the corner, along the diagonal`, md`Toward one of the planes, perpendicular to it`, md`There is no force, by symmetry`], 0,
          [null,
            md`The two pulls toward the planes (each $\tfrac14$ in units of $\tfrac{q^2}{4\pi\varepsilon_0a^2}$) beat the push of the far image ($\tfrac18$).`,
            md`With $a=b$ the two pulls are equal, so the net force lies along the diagonal.`,
            md`Symmetry about the diagonal only says the force lies along the diagonal; it doesn't make it zero.`],
          md`$F_x = F_y = \dfrac{q^2}{4\pi\varepsilon_0a^2}\left(-\dfrac14 + \dfrac{1}{8\sqrt2}\right)$, both negative: the force points along $-(\uv x+\uv y)$, toward the corner.`,
          { figHtml: FCaa }),

        Q(md`What does the image $+q$ at $(-a,-b)$ do to the real charge?`,
          [md`It pulls $q$ toward the corner`, md`It pushes $q$ away from the corner, partly cancelling the other two images' pulls`, md`Nothing; images at the far corner don't count`, md`It pushes $q$ along the floor, parallel to $y=0$`], 1,
          [md`It has the same sign as $q$, so it repels.`,
            null,
            md`Every image contributes to the field at $q$; the far one is just weaker (distance $2\sqrt{a^2+b^2}$).`,
            md`The repulsion acts along the line joining the charges, which points from the far corner through $q$: away from the corner, along $(a,b)$.`],
          md`Same sign, so it repels, along the line from $(-a,-b)$ to $(a,b)$. Its size is $\dfrac{q^2}{4\pi\varepsilon_0\cdot4(a^2+b^2)}$, smaller than either pull, so the net force still points toward the corner.`,
          { figHtml: FC }),

        Q(md`How does the true energy $W$ (the work to bring $q$ in) compare with the energy $U_4$ of the four charges treated as real point charges?`,
          [md`$W = U_4$`, md`$W = U_4/2$, as for a single plane`, md`$W = 2U_4$`, md`$W = U_4/4$`], 3,
          [md`That counts field energy in three quadrants that are really metal, and work done on images.`,
            md`The half belongs to the single plane, where the image system fills two half-spaces. Here it fills four quadrants.`,
            md`The true energy is smaller in size than the image system's, not larger.`,
            null],
          md`$U_4$ has six pairs: three $q$-image pairs, summing to $q\,V_{\text{images}}(q)$, and three image-image pairs, which give the same sum by symmetry. So $U_4 = 2\,qV_{\text{images}}$, while $W = \tfrac12\,qV_{\text{images}} = U_4/4$. The four-charge field fills four equivalent quadrants; the real field fills one.`,
          { figHtml: FC }),

        Q(md`What is the total charge induced on the two half-planes together?`,
          [md`$-2q$, one $-q$ on each plane`, md`$-q$`, md`$+q$`, md`$0$`], 1,
          [md`The three images total $-q-q+q = -q$, and the induced charge equals that.`,
            null,
            md`The induced charge is pulled in by $q$, so it has the opposite sign.`,
            md`The conductor is grounded, so it can take on charge from the earth.`],
          md`Far away the checkerboard has no net charge and no dipole moment, so no flux escapes to infinity: every field line from $q$ ends on the metal. The induced total is $-q$, which equals the sum of the images, $-q-q+q$.`,
          { figHtml: FC }),

        RF(md`
          ### Worked example: charge on the diagonal

          Put $q$ at $(a,a,0)$, a distance $a$ from each plane.

          **Region:** the quadrant $x\ge0$, $y\ge0$. **Boundary conditions:**

          1. $V=0$ on $x=0$;
          2. $V=0$ on $y=0$;
          3. $V\to0$ far away.

          **Images:** $-q$ at $(-a,a)$, $-q$ at $(a,-a)$, $+q$ at $(-a,-a)$. **Check:** $x=0$ bisects the top pair and the bottom pair, $y=0$ the left pair and the right pair, each $\pm$ (conditions 1, 2); every term dies far away (3); no image is in the quadrant.

          **Force,** in units of $\dfrac{q^2}{4\pi\varepsilon_0a^2}$:

          - $-q$ at $(-a,a)$, distance $2a$: $\left(-\tfrac14,\;0\right)$
          - $-q$ at $(a,-a)$, distance $2a$: $\left(0,\;-\tfrac14\right)$
          - $+q$ at $(-a,-a)$, distance $2\sqrt2\,a$, pushing along $(1,1)/\sqrt2$: size $\tfrac18$, components $\left(\tfrac{1}{8\sqrt2},\;\tfrac{1}{8\sqrt2}\right)$

          $$F_x = F_y = -\frac14 + \frac{1}{8\sqrt2}\approx-0.162,\qquad |\vb F| = \sqrt2\,|F_x| = \frac{2\sqrt2-1}{8}\approx0.229.$$

          So $|\vb F|\approx0.229\,\dfrac{q^2}{4\pi\varepsilon_0a^2}$, along the diagonal toward the corner. Compare: one plane alone pulls with $0.25$; the two pulls together would give $0.354$; the far image's push takes back about a third of that.

          Energy: $W = \dfrac{q^2}{16\pi\varepsilon_0}\left[\dfrac{1}{\sqrt2\,a} - \dfrac2a\right]\approx-0.323\,\dfrac{q^2}{4\pi\varepsilon_0a}$.
        `),

        P({
          title: 'Charge off the diagonal of a corner',
          q: md`
            Two grounded conducting half-planes meet at a right angle. A charge $q$ sits a distance $d$ from the vertical plane and $2d$ from the horizontal one: $(a,b) = (d,2d)$.

            (a) Find $F_x$ and $F_y$ on the charge, in units of $\dfrac{q^2}{4\pi\varepsilon_0d^2}$ ($x$ away from the vertical plane, $y$ away from the horizontal one).

            (b) Find the work needed to bring $q$ in from infinity, in units of $\dfrac{q^2}{4\pi\varepsilon_0d}$.
          `,
          figHtml: fCorner({ a: 1, b: 2, s: 70, aLab: 'd', bLab: '2d' }),
          hints: [
            md`Region: the quadrant. Conditions: $V=0$ on both planes, $V\to0$ far away. Images: $-q$ at $(-d,2d)$, $-q$ at $(d,-2d)$, $+q$ at $(-d,-2d)$.`,
            md`Distances from $q$: $2d$ to the first, $4d$ to the second, $2\sqrt5\,d$ to the third. The third pushes along $(1,2)/\sqrt5$.`,
            md`Energy: $W = \tfrac12\,q\,V_{\text{images}}(q)$, not the four-charge energy.`,
          ],
          parts: [
            { lbl: md`(a) $F_x$`, ans: -0.2276 },
            { lbl: md`(a) $F_y$`, ans: -0.01778 },
            { lbl: md`(b) $W$`, ans: -0.2632 },
          ],
          sol: md`
            **Region of interest:** the quadrant $x\ge0$, $y\ge0$.

            **Boundary conditions:**

            1. $V=0$ on $x=0$.
            2. $V=0$ on $y=0$.
            3. $V\to0$ far away.

            **Images:** $-q$ at $(-d,2d)$, $-q$ at $(d,-2d)$, $+q$ at $(-d,-2d)$. **Check:** (1) the plane $x=0$ bisects $q$ with the $-q$ at $(-d,2d)$, and the $-q$ at $(d,-2d)$ with the $+q$; (2) the plane $y=0$ bisects $q$ with the $-q$ at $(d,-2d)$, and the $-q$ at $(-d,2d)$ with the $+q$; (3) every term dies far away; no image is in the quadrant.

            [[fig:img]]

            **(a)** In units of $\dfrac{q^2}{4\pi\varepsilon_0d^2}$:

            - $-q$ at $(-d,2d)$, distance $2d$: $\left(-\tfrac14,\;0\right)$
            - $-q$ at $(d,-2d)$, distance $4d$: $\left(0,\;-\tfrac1{16}\right)$
            - $+q$ at $(-d,-2d)$, distance $2\sqrt5\,d$, size $\dfrac{1}{20}$, along $(1,2)/\sqrt5$: $\left(\dfrac{1}{20\sqrt5},\;\dfrac{2}{20\sqrt5}\right) = (0.0224,\;0.0447)$

            $$F_x = -\frac14 + \frac{\sqrt5}{100}\approx-0.228,\qquad F_y = -\frac1{16} + \frac{\sqrt5}{50}\approx-0.0178.$$

            The general formula gives the same: $F_x = \dfrac{a}{4(a^2+b^2)^{3/2}} - \dfrac1{4a^2}$ with $a=1$, $b=2$.

            **(b)** $W = \dfrac{q^2}{16\pi\varepsilon_0}\left[\dfrac{1}{\sqrt5\,d} - \dfrac1d - \dfrac{1}{2d}\right] = \dfrac{q^2}{4\pi\varepsilon_0d}\cdot\dfrac14\left(\dfrac{1}{\sqrt5} - \dfrac32\right)\approx-0.263\,\dfrac{q^2}{4\pi\varepsilon_0d}$.

            **Checks.** The nearer plane ($x=0$, distance $d$) dominates: $F_x$ is close to its single-plane value $-\tfrac14$. The far plane's pull ($-\tfrac1{16}$) is almost cancelled by the $y$-part of the far image's push. Integrating $-\vb F\cdot d\vb l$ along a straight path in from infinity gives the same $W$.
          `,
          figs: { img: { svg: fCornerImg({ a: 1, b: 2, s: 45 }), cap: md`The checkerboard of images for $(a,b) = (d,2d)$.` } },
        }),

        RF(md`
          ### Other angles

          The same mirror-and-repeat construction works for a wedge of opening angle $\pi/n$ ($n = 1,2,3,\dots$): $180^\circ$ (a single plane, 1 image), $90^\circ$ (3 images), $60^\circ$ (5 images), $45^\circ$ (7 images). In general there are $2n-1$ images. The boundary-value problem is the same as for the corner: region = inside the wedge; (1) $V=0$ on one wall, (2) $V=0$ on the other, (3) $V\to0$ far away. Together with $q$, the $2n$ charges sit at the same distance from the edge, one in each of the $2n$ wedges of angle $\pi/n$ that fill the full circle, with signs alternating $+,-,+,-$ around it. Each wall bisects $\pm$ pairs, so $V=0$ on both walls.

          [[fig:w60]]

          For any other angle the construction fails. Keep reflecting and the images either never close up, or they close up with an image landing **inside** the wedge, in the region of interest. The starred rule forbids that. For a $120^\circ$ wedge, three rounds of reflection put an image of $q$ at its mirror point across the bisector of the wedge, inside the region:

          [[fig:w120]]

          For $70^\circ$, $360^\circ/70^\circ$ isn't even an integer; the reflections land at angles spaced by $10^\circ$ all around the circle, several of them inside the wedge.

          The test: **the wedge angle must divide $180^\circ$ a whole number of times.**
        `, { w60: { svg: fWedgeImg(3), cap: md`A $60^\circ$ wedge: $q$ plus 5 images around a circle, alternating in sign. The dashed lines are the walls and their reflections.` },
          w120: { svg: fWedge120(), cap: md`A $120^\circ$ wedge (walls dashed; the grey dashed line is a reflected wall): reflecting back and forth produces an image $-q$ (circled) inside the wedge. Not allowed.` } }),

        Q(md`How many image charges does a $60^\circ$ grounded wedge need?`,
          [md`$2$`, md`$3$`, md`$5$`, md`Infinitely many`], 2,
          [md`Two images fix the two walls one at a time but spoil each other; you have to keep reflecting.`,
            md`Three is the right-angle corner ($n=2$).`,
            null,
            md`For $60^\circ = 180^\circ/3$ the reflections close up after $2n = 6$ positions.`],
          md`$60^\circ = \pi/3$, so $n=3$ and there are $2n-1 = 5$ images. With $q$ they make six charges at the vertices of a regular hexagon, alternating in sign.`,
          { figHtml: fWedge(60) }),

        Q(md`How many image charges does a $45^\circ$ grounded wedge need?`,
          [md`$7$`, md`$4$`, md`$8$`, md`$3$`], 0,
          [null,
            md`Count the wedges: $360^\circ/45^\circ = 8$ positions in all, one of them the real charge.`,
            md`$8$ is the total number of charges including $q$ itself.`,
            md`$3$ is for $90^\circ$.`],
          md`$45^\circ = \pi/4$, $n=4$: $2n-1 = 7$ images. Eight charges in all, alternating in sign around a circle.`,
          { figHtml: fWedge(45) }),

        Q(md`For which wedge angle does the method of images work?`,
          [md`$72^\circ$`, md`$120^\circ$`, md`$135^\circ$`, md`$36^\circ$`], 3,
          [md`$180^\circ/72^\circ = 2.5$, not a whole number. ($72^\circ$ is $2\pi/5$, not $\pi/n$.)`,
            md`$180^\circ/120^\circ = 1.5$: an image lands inside the wedge.`,
            md`$180^\circ/135^\circ$ is not a whole number.`,
            null],
          md`The angle must be $\pi/n$: $180^\circ/36^\circ = 5$, so $n = 5$ and there are $9$ images. Angles like $72^\circ$ that divide $360^\circ$ but not $180^\circ$ fail, because the image signs must alternate around the circle, which needs an even number of sectors.`,
          { figHtml: fWedge(36, { rq: 150 }) }),

        Q(md`Why can't you solve a $70^\circ$ grounded wedge with images?`,
          [md`Because the walls are not perpendicular`, md`Repeated reflections never close up properly, and some images land inside the wedge, which would change $\rho$ in the region`, md`Because the images would have to be larger than $q$`, md`You can; it needs $2\cdot70/180$ images`], 1,
          [md`Perpendicular walls aren't required: $60^\circ$ and $45^\circ$ work too.`,
            null,
            md`Plane images always have the same size as what they reflect. The size isn't the problem.`,
            md`The number of images must be a whole number: $2n-1$ with $\pi/n$ the wedge angle.`],
          md`Reflections in the two walls generate images at angles $\pm\phi_0 + 140^\circ k$. Since $70^\circ$ doesn't divide $180^\circ$, some of those angles fall inside the wedge. An image in the region of interest breaks the starred rule: you'd be solving Poisson's equation with the wrong $\rho$.`,
          { figHtml: fWedge(70) }),

        Q(md`What goes wrong if you try images for a $120^\circ$ grounded wedge?`,
          [md`Nothing; three images are enough`, md`The images never close up, so infinitely many are needed`, md`An image of the wrong sign coincides with $q$`, md`After a few reflections an image lands inside the wedge, in the region of interest`], 3,
          [md`Check the walls after placing images: the reflections don't stop at three.`,
            md`They do close up (six positions), but one of them is inside the wedge.`,
            md`Nothing lands on $q$ itself; an image lands at the mirror point of $q$ across the wedge's bisector.`,
            null],
          md`
            With $q$ at angle $\phi_0$ (walls at $0^\circ$ and $120^\circ$), the reflections give charges at $-\phi_0$, $240^\circ-\phi_0$, $\phi_0+240^\circ$, $\phi_0+120^\circ$, and then $120^\circ-\phi_0$, which is between the walls. Forbidden.

            [[fig:bad]]
          `,
          { figHtml: fWedge(120, { phi: 40, rq: 130 }), figs: { bad: { svg: fWedge120(), cap: md`The circled image falls inside the wedge.` } } }),

        P({
          title: 'A charge in a 60° wedge',
          q: md`
            Two grounded conducting half-planes meet at $60^\circ$. A charge $q$ sits on the bisector, a distance $a$ from the edge where they meet.

            (a) How many image charges are needed?

            (b) Find the force on $q$ along the bisector, in units of $\dfrac{q^2}{4\pi\varepsilon_0a^2}$ (positive = away from the edge).
          `,
          figHtml: fWedge(60, { rq: 150 }),
          hints: [
            md`Region: inside the wedge. Conditions: $V=0$ on both walls, $V\to0$ far away. For $\pi/n$ there are $2n-1$ images on the circle of radius $a$ around the edge, alternating in sign.`,
            md`With $q$ at $30^\circ$: $-q$ at $90^\circ$ and $330^\circ$ (distance $a$), $+q$ at $150^\circ$ and $270^\circ$ (distance $\sqrt3\,a$), $-q$ at $210^\circ$ (distance $2a$).`,
            md`By symmetry only the component along the bisector survives. A chord from $30^\circ$ to $90^\circ$ makes $120^\circ$ with the outward bisector direction, so its component is $\cos120^\circ = -\tfrac12$. A chord from $150^\circ$ to $30^\circ$ makes $30^\circ$ with it.`,
          ],
          parts: [
            { lbl: md`(a) number of images`, ans: 5 },
            { lbl: md`(b) $F$ along the bisector`, ans: -0.6726 },
          ],
          sol: md`
            **Region of interest:** the wedge $0\le\phi\le60^\circ$.

            **Boundary conditions:**

            1. $V=0$ on the wall $\phi=0$.
            2. $V=0$ on the wall $\phi=60^\circ$.
            3. $V\to0$ far away.

            **(a)** $60^\circ = 180^\circ/3$, so $n=3$: $2n-1 = 5$ images. With $q$ at $30^\circ$ on a circle of radius $a$: $-q$ at $90^\circ$, $+q$ at $150^\circ$, $-q$ at $210^\circ$, $+q$ at $270^\circ$, $-q$ at $330^\circ$. Check: the wall at $0^\circ$ bisects the pairs ($30^\circ$, $330^\circ$), ($90^\circ$, $270^\circ$), ($150^\circ$, $210^\circ$), each $\pm$; the wall at $60^\circ$ bisects ($30^\circ$, $90^\circ$), ($330^\circ$, $150^\circ$), ($270^\circ$, $210^\circ$), each $\pm$. Both walls are at $V=0$ (conditions 1 and 2); every term dies far away (condition 3); no image is inside the wedge.

            [[fig:img]]

            **(b)** Components along the outward bisector $\uv u$ (the direction of $q$ from the edge), in units of $\dfrac{q^2}{4\pi\varepsilon_0a^2}$:

            - $-q$ at $90^\circ$ and $330^\circ$, distance $a$ (60° chords), attract: each $1\times\cos120^\circ = -\tfrac12$. Total $-1$.
            - $+q$ at $150^\circ$ and $270^\circ$, distance $\sqrt3\,a$, repel: each $\tfrac13\times\cos30^\circ = \dfrac{\sqrt3}{6}$. Total $\dfrac{1}{\sqrt3}\approx0.577$.
            - $-q$ at $210^\circ$, distance $2a$, straight through the edge, attracts: $-\tfrac14$.

            $$F_u = -1 + \frac{1}{\sqrt3} - \frac14\approx-0.673.$$

            Toward the edge. The components across the bisector cancel in pairs.

            **Check.** Two walls each at a distance $a\sin30^\circ = a/2$ from $q$ would, alone, pull with $\dfrac{q^2}{4\pi\varepsilon_0(2\cdot a/2)^2} = 1$ each, at $60^\circ$ to the bisector: $2\times1\times\cos60^\circ = 1$ toward the edge. The other three images reduce that to $0.67$.
          `,
          figs: { img: { svg: fWedgeImg(3), cap: md`$q$ and its five images on a circle of radius $a$.` } },
        }),

        P({
          title: 'Potential inside a corner',
          q: md`
            A charge $q$ sits at $(a,a,0)$ between two grounded half-planes that meet at a right angle.

            (a) Find $V$ at $P = (2a,a,0)$, in units of $\dfrac{q}{4\pi\varepsilon_0a}$.

            (b) What is $V$ at $(3a,0,0)$, a point on the horizontal plane?
          `,
          figHtml: fCorner({ a: 1, b: 1, s: 70, aLab: 'a', bLab: 'a', pts: [[2, 1, 'P', 'r']] }),
          hints: [
            md`Images: $-q$ at $(-a,a)$, $-q$ at $(a,-a)$, $+q$ at $(-a,-a)$. The four-term formula is valid in the quadrant.`,
            md`From $P=(2a,a)$: distance $a$ to $q$, $3a$ to $(-a,a)$, $\sqrt5\,a$ to $(a,-a)$, $\sqrt{13}\,a$ to $(-a,-a)$.`,
            md`(b) is a boundary condition.`,
          ],
          parts: [
            { lbl: md`(a) $V(P)$`, ans: 0.4968 },
            { lbl: md`(b) $V(3a,0,0)$`, ans: 0 },
          ],
          sol: md`
            **Region of interest:** the quadrant $x\ge0$, $y\ge0$.

            **Boundary conditions:**

            1. $V=0$ on $x=0$.
            2. $V=0$ on $y=0$.
            3. $V\to0$ far away.

            **Images:** $-q$ at $(-a,a)$, $-q$ at $(a,-a)$, $+q$ at $(-a,-a)$. **Check:** each wall bisects two $\pm$ pairs (conditions 1 and 2); every term dies far away (3); no image is in the quadrant. Part (b) is an explicit check of condition 2 at one point.

            [[fig:img]]

            **(a)** $\srm_1 = a$, $\srm_2 = 3a$, $\srm_3 = \sqrt{a^2+(2a)^2} = \sqrt5\,a$, $\srm_4 = \sqrt{(3a)^2+(2a)^2} = \sqrt{13}\,a$:

            $$V(P) = \frac{q}{4\pi\varepsilon_0a}\left(1 - \frac13 - \frac{1}{\sqrt5} + \frac{1}{\sqrt{13}}\right)\approx0.497\,\frac{q}{4\pi\varepsilon_0a}.$$

            **(b)** The point is on a grounded plane, so $V=0$ by boundary condition 2. (Check with the formula: $(3a,0)$ is $\sqrt5\,a$ from both $q$ and $-q$ at $(a,-a)$, and $\sqrt{17}\,a$ from both $-q$ at $(-a,a)$ and $+q$ at $(-a,-a)$. The terms cancel in pairs.)

            **Check.** $V(P)$ is about half of $q$'s own $\dfrac{q}{4\pi\varepsilon_0a}$: the induced charge on the two planes pulls it down.
          `,
          figs: { img: { svg: fCornerImg({ a: 1.5, b: 1.5 }), cap: md`The images for $q$ on the diagonal.` } },
        }),

        RF(md`
          !!key Patterns to remember
            - Right-angle corner: 3 images in a $\pm$ checkerboard, $-q$, $-q$, $+q$ (the $+q$ at the opposite corner is the one people forget).
            - Check each wall after placing images: every wall must bisect $\pm$ pairs.
            - Force: add the three image forces; for $q$ on the diagonal $|\vb F| = \dfrac{2\sqrt2-1}{8}\,\dfrac{q^2}{4\pi\varepsilon_0a^2}$ toward the corner.
            - Energy: $W = \tfrac12\,qV_{\text{images}}(q) = \dfrac{q^2}{16\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{a^2+b^2}} - \dfrac1a - \dfrac1b\right]$, a quarter of the four-charge energy.
            - Wedges: only angles $\pi/n$, with $2n-1$ images alternating in sign around a circle. Other angles put images inside the region.
            - The field vanishes at a concave corner.
        `),
      ],
    });
  }

  // ================================================================ Lesson 6: grounded sphere
  {
    const FS = fSphere();
    const FSNF = fSphere({ pts: [[1, 0, 'N', 'tr'], [1, 180, 'F', 'l']] });
    LESSONS.push({
      id: 'u5-sphere', title: 'A charge outside a grounded sphere',
      steps: [
        RF(md`
          ### The setup (end of Lecture 10)

          A point charge $q$ is a distance $a$ from the center of a grounded conducting sphere of radius $R$, with $a>R$. Find the potential outside the sphere.

          [[fig:setup]]

          The questions asked in class:

          **What are the boundary conditions?** The region of interest is $r\ge R$, outside the sphere, where the only charge is $q$.

          1. $V(R) = 0$: the whole sphere is grounded.
          2. $V(\infty) = 0$.

          **Where can the image go?** Inside the sphere. The region of interest is $r\ge R$, so by the starred rule the image must be in $r<R$. And the problem is symmetric under rotations about the line through the center and $q$, so the image sits on that line.

          So try **one** image charge $q'$ a distance $b$ from the center, on the side toward $q$. Two unknowns: its size $q'$ and its position $b$.
        `, { setup: { svg: FS, cap: md`The lecture's picture: $q$ a distance $a$ from the center of a grounded sphere of radius $R$.` } }),

        Q(md`What are the boundary conditions for the grounded sphere with $q$ outside it?`,
          [md`$V(R) = \dfrac{q}{4\pi\varepsilon_0(a-R)}$ and $V(\infty)=0$`, md`$V(R)=0$ and $V(\infty)=0$`, md`The total charge on the sphere is $0$, and $V(\infty)=0$`, md`$\vb E=0$ on the sphere's surface, and $V(\infty)=0$`], 1,
          [md`That is $q$'s potential at the nearest point of the sphere. Grounding holds the whole sphere at $0$, whatever $q$ does.`,
            null,
            md`Zero total charge describes an isolated, neutral sphere (the next lesson). A grounded sphere draws charge from the earth.`,
            md`$\vb E=0$ inside the metal; just outside, $\vb E = (\sigma/\varepsilon_0)\uv n\ne0$.`],
          md`Grounded means $V=0$ on the entire conductor, here the sphere $r=R$. Together with $V\to0$ at infinity and the single charge $q$ in $r>R$, this fixes $V$ uniquely in the region $r\ge R$.`,
          { figHtml: FS }),

        Q(md`Where can the image charge go?`,
          [md`Outside the sphere, at the mirror point across the surface`, md`At the center of the sphere`, md`Inside the sphere, on the line from the center toward $q$`, md`Anywhere inside the sphere, as long as it has the opposite sign`], 2,
          [md`That point is in the region of interest $r>R$. An image there would change $\rho$ where you are solving.`,
            md`A charge at the center has the same potential at every point of the sphere, so it can never cancel $q$'s potential, which varies over the sphere.`,
            null,
            md`It must also respect the symmetry: off the axis, its potential would break the rotational symmetry about the line through $q$.`],
          md`Starred rule: outside the region of interest, so inside the sphere. Symmetry: on the axis through $q$. The lecture's green-ink answer: "inside the sphere".`,
          { figHtml: FS }),

        Q(md`Why must the image lie on the line through the center and $q$?`,
          [md`The problem is symmetric under rotations about that line, so the induced charge, and the image that stands for it, must be too`, md`So that the image is as close to $q$ as possible`, md`Because field lines are straight lines`, md`There is no reason; it is just a lucky guess`], 0,
          [null,
            md`Closeness isn't the criterion; the image's position is fixed by the boundary condition, and it turns out to be at $R^2/a$.`,
            md`Field lines near a conductor are curved. The reason is the rotational symmetry of the setup.`,
            md`The symmetry argument tells you where to look; the boundary condition then fixes the exact spot.`],
          md`Rotate the whole setup about the line through the center and $q$: nothing changes. So the solution can't change either, and an image off the axis would break that. That leaves two unknowns, $b$ and $q'$.`,
          { figHtml: FS }),

        RF(md`
          ### The potential of the guess

          [[fig:tri]]

          Measure $\theta$ from the line through $q$. For a field point a distance $r$ from the center,

          $$V(\vb r) = \frac{1}{4\pi\varepsilon_0}\left(\frac{q}{\srm} + \frac{q'}{\srm'}\right),$$

          with $\srm$ and $\srm'$ the distances from $q$ and from $q'$ to the field point. The law of cosines in the two triangles of the figure gives

          $$\srm = \sqrt{r^2+a^2-2ra\cos\theta},\qquad \srm' = \sqrt{r^2+b^2-2rb\cos\theta}.$$

          Careful: $r$ is the distance from the **center**; $\srm$ and $\srm'$ are distances from the **charges**.

          $V(R)=0$ for every $\theta$ forces $q$ and $q'$ to have **opposite signs**: the two distances are positive, so the two terms can cancel only if the charges have opposite signs.
        `, { tri: { svg: fTriangle(), cap: md`The geometry (lecture figure). $r$ from the center $O$; $\srm'$ from $q'$; $\srm$ from $q$; $\theta$ at the center.` } }),

        Q(md`A student writes the image potential as $V = \dfrac{1}{4\pi\varepsilon_0}\left(\dfrac{q}{r} + \dfrac{q'}{r'}\right)$, with $r$ the field point's distance from the center. What is wrong?`,
          [md`Nothing; that is Eq. 3.17`, md`$r$ must be $\srm$, the distance from $q$ to the field point, $\sqrt{r^2+a^2-2ra\cos\theta}$`, md`$r$ should be replaced by $a$`, md`The $q'$ term should be $q'r$`], 1,
          [md`Eq. 3.17 uses $\srm$ and $\srm'$, the distances from the **charges**. Using the distance from the center would describe a charge at the center.`,
            null,
            md`$a$ is fixed (the charge's distance from the center); $V$ must depend on where the field point is.`,
            md`A point charge's potential goes as charge over distance, never charge times distance.`],
          md`This is the $r$-versus-$\srm$ trap. Coulomb's law uses the distance from each source, $\srm = |\vb r - \vb r_q|$, which the law of cosines turns into $\sqrt{r^2+a^2-2ra\cos\theta}$.`,
          { figHtml: fTriangle() }),

        Q(md`Why must $q'$ have the opposite sign to $q$?`,
          [md`Images always have the opposite sign, by definition`, md`Because $q'$ is inside the sphere`, md`$V(R)=0$ needs $\dfrac{q}{\srm} + \dfrac{q'}{\srm'} = 0$ on the sphere, and both distances are positive`, md`Because the sphere attracts $q$`], 2,
          [md`Not by definition: an image is whatever makes the boundary conditions work. (A neutral sphere also needs a center image with the **same** sign as $q$.)`,
            md`Being inside the sphere is about the region of interest, not about the sign.`,
            null,
            md`The attraction is a consequence of the opposite sign, not the reason for it.`],
          md`On the sphere $\dfrac{q}{\srm} = -\dfrac{q'}{\srm'}$. Both $\srm$ and $\srm'$ are positive, so $q$ and $q'$ have opposite signs. The lecture writes this at the bottom of the first page.`,
          { figHtml: FS }),

        RF(md`
          ### Finding $b$ and $q'$ (Lecture 11)

          Set $r=R$ in $V=0$:

          $$\frac{q}{\sqrt{R^2+a^2-2Ra\cos\theta}} = -\frac{q'}{\sqrt{R^2+b^2-2Rb\cos\theta}}.$$

          Square both sides and cross-multiply:

          $$q^2\left(R^2+b^2\right) - 2q^2Rb\cos\theta = q'^2\left(R^2+a^2\right) - 2q'^2Ra\cos\theta.$$

          This must hold **for all $\theta$**, because the whole sphere is at $V=0$. A constant plus a multiple of $\cos\theta$ vanishes for every $\theta$ only if both coefficients vanish. So the constant terms and the $\cos\theta$ terms must match separately:

          $$q^2\left(R^2+b^2\right) = q'^2\left(R^2+a^2\right),\qquad q^2\,b = q'^2\,a.$$

          Two equations, two unknowns. From the second, $q'^2 = q^2\,b/a$. Put that into the first and multiply by $a/q^2$:

          $$a\left(R^2+b^2\right) = b\left(R^2+a^2\right)\;\Rightarrow\;aR^2 - bR^2 + ab^2 - a^2b = 0\;\Rightarrow\;(a-b)\left(R^2-ab\right) = 0.$$

          - **$b=a$, $q'=-q$:** the "image" sits right on top of $q$ and cancels it, giving $V=0$ everywhere. It is in the region of interest, and it deletes the real charge: rejected by the starred rule.
          - **$b = R^2/a$:** then $q'^2 = q^2R^2/a^2$, and opposite sign gives

          $$b = \frac{R^2}{a},\qquad q' = -\frac{R}{a}\,q.$$

          Since $a>R$, $b<R$: the image is safely inside the sphere. And $|q'|<q$: the image is smaller than the real charge.
        `),

        Q(md`After squaring, the condition reads $q^2(R^2+b^2) - 2q^2Rb\cos\theta = q'^2(R^2+a^2) - 2q'^2Ra\cos\theta$. Why may you set the constant terms equal and the $\cos\theta$ terms equal separately?`,
          [md`Because $\cos\theta$ is small`, md`It has to hold at every point of the sphere, i.e. for all $\theta$; $A + B\cos\theta = 0$ for all $\theta$ only if $A = B = 0$`, md`Because only $\theta=0$ matters`, md`To get the fewest equations`], 1,
          [md`$\cos\theta$ runs from $-1$ to $1$; nothing is small here.`,
            null,
            md`$\theta=0$ alone gives one equation for two unknowns. The condition must hold on the whole sphere.`,
            md`Matching gives exactly the two equations needed for the two unknowns, but the reason is that the condition holds for all $\theta$.`],
          md`Rearranged: $\left[q^2(R^2+b^2) - q'^2(R^2+a^2)\right] + \left[2q'^2Ra - 2q^2Rb\right]\cos\theta = 0$ for all $\theta$. Try $\theta = \pi/2$: the first bracket is zero. Then any other $\theta$ makes the second bracket zero. This "for all $\theta$" step is the heart of the derivation.`,
          { figHtml: fTriangle() }),

        Q(md`The algebra gives $(a-b)(R^2-ab) = 0$. Which root is rejected, and why?`,
          [md`$b = R^2/a$, because it puts the image inside the sphere`, md`Neither; both describe the same physics`, md`$b=a$ (with $q'=-q$): it puts the image on top of $q$, in the region of interest, where it just cancels the real charge`, md`$b = 0$, because the image can't be at the center`], 2,
          [md`Inside the sphere is exactly where the image must be.`,
            md`$b=a$ gives $V=0$ everywhere outside: the solution of a problem with no charge at all.`,
            null,
            md`$b=0$ isn't a root of this equation.`],
          md`The root $b=a$ "solves" the boundary conditions by deleting the source: it changes $\rho$ in the region of interest. The starred rule throws it out. Keep $b = R^2/a$, $q' = -\dfrac{R}{a}q$.`,
          { figHtml: FS }),

        Q(md`Which pair has the right dimensions and the right values?`,
          [md`$b = \dfrac{R^2}{a}$, $q' = -\dfrac{R}{a}\,q$`, md`$b = \dfrac{R}{a}$, $q' = -\dfrac{R}{a}\,q$`, md`$b = \dfrac{R^2}{a}$, $q' = -\dfrac{R^2}{a^2}\,q$`, md`$b = \dfrac{a^2}{R}$, $q' = -\dfrac{a}{R}\,q$`], 0,
          [null,
            md`$R/a$ is a pure number, not a length. $b$ must be a length: $R^2/a$.`,
            md`Check $V$ at the near point: distances $a-R$ and $R-R^2/a = R(a-R)/a$; cancellation needs $q'/q = -R/a$, not $-R^2/a^2$.`,
            md`$a^2/R > a$: that puts the image outside the sphere, beyond $q$ (it is the formula for a charge **inside** a shell, with $a$ and $R$ swapped).`],
          md`$b = R^2/a$ (a length, less than $R$) and $q'/q = -R/a$ (a pure number, less than 1 in size). Quick test at the near point $\theta=0$: $\dfrac{q}{a-R} + \dfrac{q'}{R - R^2/a} = \dfrac{q}{a-R} - \dfrac{(R/a)q}{R(a-R)/a} = 0$.`,
          { figHtml: FS }),

        RF(md`
          ### The result, and checking it

          For $r\ge R$:

          $$V(r,\theta) = \frac{1}{4\pi\varepsilon_0}\left(\frac{q}{\sqrt{r^2+a^2-2ra\cos\theta}} - \frac{qR}{a\sqrt{r^2+b^2-2rb\cos\theta}}\right),\qquad b = \frac{R^2}{a}.$$

          (The notes' final line has $2Ra\cos\theta$ in the first square root. It should be $2ra\cos\theta$, with the field point's $r$, as in the law of cosines.)

          [[fig:equiv]]

          The two pictures are equivalent **only for $r\ge R$**. Inside the sphere the real $V$ is $0$.

          **Check the boundary conditions explicitly.**

          - **Condition 1, $V(R)=0$.** Put $b=R^2/a$ in the second root and multiply it by $a/R$: $\dfrac aR\sqrt{r^2+\dfrac{R^4}{a^2}-\dfrac{2rR^2}{a}\cos\theta} = \sqrt{\left(\dfrac{ra}{R}\right)^2 + R^2 - 2ra\cos\theta}$. So

          $$V(r,\theta) = \frac{q}{4\pi\varepsilon_0}\left[\frac{1}{\sqrt{r^2+a^2-2ra\cos\theta}} - \frac{1}{\sqrt{R^2+(ra/R)^2-2ra\cos\theta}}\right].$$

            At $r=R$ the two square roots are identical, so $V=0$ for every $\theta$.
          - **Condition 2, $V(\infty)=0$.** Both terms die as $r\to\infty$.
          - **Charge in the region.** $b = R^2/a < R$, so the image is inside the sphere, outside the region of interest.

          **Limits.**

          - $a\to R^+$ (the charge nearly touching): $b\to R$ and $q'\to-q$. The image approaches the surface from inside, like a mirror image. Up close the sphere looks flat, and the plane result comes back.
          - $a\to\infty$ (the charge far away): $q'\to0$ and $b\to0$. A distant charge induces almost nothing.

          Unlike the plane, the image's size **and** position both depend on where $q$ is.
        `, { equiv: fEquiv() }),

        Q(md`Where is the image formula $V = \dfrac{1}{4\pi\varepsilon_0}\left(\dfrac{q}{\srm} + \dfrac{q'}{\srm'}\right)$ the true potential?`,
          [md`Everywhere`, md`Inside the sphere, $r\le R$`, md`Only on the sphere`, md`For $r\ge R$ only`], 3,
          [md`Inside the sphere is metal at $V=0$; the formula has a fictitious charge $q'$ there.`,
            md`That is exactly where the formula is **wrong**: the real $V$ is $0$ inside a grounded conductor.`,
            md`It is right throughout the region of interest, not only on its boundary.`,
            null],
          md`"Is equivalent for $V(r>R)$", as the lecture writes under its picture. The equivalence is guaranteed by uniqueness only in the region where both setups have the same charge and the same boundary conditions.`,
          { figHtml: FS }),

        Q(md`What happens to the image as the charge approaches the surface, $a\to R^+$?`,
          [md`$b\to0$ and $q'\to0$`, md`$b\to R$ and $q'\to-q$: it becomes the mirror image, as for a plane`, md`$b\to R$ and $q'\to-q/2$`, md`$q'\to-\infty$`], 1,
          [md`That is the opposite limit, $a\to\infty$.`,
            null,
            md`$q' = -\dfrac{R}{a}q\to-q$ when $a\to R$.`,
            md`$|q'| = \dfrac{R}{a}q$ is at most $q$ for $a\ge R$.`],
          md`$b = R^2/a\to R$ and $q' = -(R/a)q\to-q$. With $a = R+d$, the image is at depth $R - b\approx d$ below the surface: a mirror image. Close up, a sphere looks like a plane.`,
          { figHtml: FS }),

        Q(md`What happens to the image as the charge moves far away, $a\to\infty$?`,
          [md`$q'\to-q$ and $b\to R$`, md`$q'\to-q$ and $b\to0$`, md`$q'\to0$ and $b\to0$`, md`$q'\to0$ and $b\to R$`], 2,
          [md`That is the limit $a\to R$.`,
            md`$q' = -(R/a)q$ shrinks as $a$ grows.`,
            null,
            md`$b = R^2/a$ shrinks toward the center as $a$ grows.`],
          md`Both $q' = -(R/a)q$ and $b = R^2/a$ go to zero like $1/a$. A far charge induces little, and what it induces is centered.`,
          { figHtml: FS }),

        Q(md`Check $V=0$ at the point of the sphere **farthest** from $q$ ($\theta=\pi$). What are the distances from that point to $q$ and to $q'$?`,
          [md`$a-R$ and $R-R^2/a$`, md`$a+R$ and $R+R^2/a$; their ratio is $a/R$, so the terms cancel`, md`$a+R$ and $R-R^2/a$`, md`$2R$ and $R$`], 1,
          [md`Those are the distances from the **nearest** point ($\theta=0$). That check works too.`,
            null,
            md`The far point and $q'$ are on opposite sides of the center, so their distances add: $R + b$.`,
            md`Neither charge is at the center or on the surface.`],
          md`$\srm = a+R$ and $\srm' = R + \dfrac{R^2}{a} = \dfrac{R(a+R)}{a}$. Then $\dfrac{q}{a+R} + \dfrac{-(R/a)q}{R(a+R)/a} = \dfrac{q}{a+R} - \dfrac{q}{a+R} = 0$. Checking two points like this takes a few seconds and catches most algebra slips.`,
          { figHtml: FSNF }),

        RF(md`
          ### Induced charge

          Outside the sphere $\uv n = \uv r$, so $\sigma = -\varepsilon_0\,\partial V/\partial r$ at $r=R$. Differentiating the two terms,

          $$\frac{\partial V}{\partial r} = \frac{1}{4\pi\varepsilon_0}\left[-\frac{q\,(r-a\cos\theta)}{\srm^3} - \frac{q'\,(r-b\cos\theta)}{\srm'^3}\right].$$

          At $r=R$, use $\srm' = \dfrac Ra\,\srm$ (that is what $V(R)=0$ says), so $\dfrac{q'}{\srm'^3} = -\dfrac{qR}{a}\cdot\dfrac{a^3}{R^3\srm^3} = -\dfrac{qa^2}{R^2\srm^3}$:

          $$\left.\frac{\partial V}{\partial r}\right|_R = \frac{q}{4\pi\varepsilon_0\srm^3}\left[-(R-a\cos\theta) + \frac{a^2}{R^2}\left(R - \frac{R^2}{a}\cos\theta\right)\right] = \frac{q}{4\pi\varepsilon_0\srm^3}\cdot\frac{a^2-R^2}{R}.$$

          So

          $$\sigma(\theta) = -\frac{q\left(a^2-R^2\right)}{4\pi R\left(R^2+a^2-2aR\cos\theta\right)^{3/2}}.$$

          - Negative everywhere (for $q>0$), largest in size at $\theta=0$, the point nearest $q$: $\sigma(0) = -\dfrac{q(a+R)}{4\pi R(a-R)^2}$. Smallest at the far point: $\sigma(\pi) = -\dfrac{q(a-R)}{4\pi R(a+R)^2}$.

          **Total induced charge.** With $da = 2\pi R^2\sin\theta\,d\theta$ and $u=\cos\theta$:

          $$Q_{\text{ind}} = -\frac{q(a^2-R^2)R}{2}\int_{-1}^{1}\frac{du}{(R^2+a^2-2aRu)^{3/2}} = -\frac{q(a^2-R^2)R}{2}\cdot\frac{1}{aR}\left[\frac{1}{a-R} - \frac{1}{a+R}\right] = -\frac{qR}{a} = q'.$$

          !!key Total induced charge = $q'$, not $-q$
            Take a Gaussian surface just outside the sphere that does not enclose $q$. The field on it is the same in the real and the image problems, so the enclosed charge is the same: the induced charge equals the image charge $q' = -qR/a$. Only part of $q$'s field lines end on the sphere; the rest go to infinity. (For the plane all of them end on it, so there it is $-q$.)

          A second check, straight from the boundary condition: the center of the sphere is in the metal, so $V(0) = 0$. All the induced charge is a distance $R$ from the center, so $0 = \dfrac{q}{4\pi\varepsilon_0a} + \dfrac{Q_{\text{ind}}}{4\pi\varepsilon_0R}$, giving $Q_{\text{ind}} = -\dfrac{R}{a}q$ without any integral.
        `),

        WG.imageSphere(),

        Q(md`Where on the sphere is the induced charge density largest in size?`,
          [md`At $F$, the far point`, md`On the equator ($\theta=\pi/2$)`, md`At $N$, the point nearest $q$`, md`It is uniform`], 2,
          [md`$|\sigma|\propto(R^2+a^2-2aR\cos\theta)^{-3/2}$ is smallest at $\theta=\pi$, where the distance to $q$ is largest.`,
            md`The equator is in between: $|\sigma|$ decreases steadily from $N$ to $F$.`,
            null,
            md`A uniform $\sigma$ would describe a sphere with no external charge nearby. The charge piles up on the side facing $q$.`],
          md`$\sigma(0)/\sigma(\pi) = \left(\dfrac{a+R}{a-R}\right)^3$: for $a = 2R$ that is $27$. The induced charge crowds onto the side facing $q$.`,
          { figHtml: FSNF }),

        Q(md`What is the total charge induced on the grounded sphere?`,
          [md`$-q$`, md`$-\dfrac{R}{a}q$`, md`$0$`, md`$-\dfrac{R^2}{a^2}q$`], 1,
          [md`That is the plane's answer. Here only part of $q$'s field lines end on the sphere.`,
            null,
            md`The sphere is grounded, not isolated; it draws charge from the earth.`,
            md`The induced charge equals the image charge, $-\dfrac Raq$.`],
          md`$\displaystyle\oint\sigma\,da = -\frac{qR}{a} = q'$. Fastest route: $V(\text{center}) = 0 = \frac{q}{4\pi\varepsilon_0a} + \frac{Q_{\text{ind}}}{4\pi\varepsilon_0R}$.`,
          { figHtml: FS }),

        Q(md`Why is the total induced charge on the grounded sphere smaller in size than $q$, when for the grounded plane it was exactly $-q$?`,
          [md`Because the sphere is smaller than the plane, so it can hold less charge`, md`Because charge leaks to the earth through the ground wire`, md`Because $q'$ is closer to $q$ than the plane's image`, md`Only some of $q$'s field lines end on the sphere; the rest go to infinity, since far away the field is that of $q+q'\ne0$`], 3,
          [md`Conductors have no capacity limit here; the amount is set by the field lines that land on it.`,
            md`The ground wire supplies whatever charge keeps $V=0$; the result is $-qR/a$.`,
            md`Distance from the image isn't what sets the induced charge.`,
            null],
          md`Far from everything, the image system looks like a point charge $q + q' = q(1 - R/a) > 0$, so flux $q(1-R/a)/\varepsilon_0$ escapes to infinity. The plane intercepts all of $q$'s flux; a sphere only a fraction $R/a$.`,
          { figHtml: FS }),

        RF(md`
          ### Force and energy

          The force on $q$ is the pull of the image, a distance $a - b = a - \dfrac{R^2}{a} = \dfrac{a^2-R^2}{a}$ away:

          $$F = \frac{1}{4\pi\varepsilon_0}\frac{q\,q'}{(a-b)^2} = -\frac{1}{4\pi\varepsilon_0}\frac{q^2Ra}{(a^2-R^2)^2}\qquad\text{(toward the sphere).}$$

          Energy, by the half rule, $W = \tfrac12\,q\,V_{q'}(a)$:

          $$W = \frac12\,q\cdot\frac{1}{4\pi\varepsilon_0}\frac{q'}{a-b} = -\frac{q^2R}{8\pi\varepsilon_0\left(a^2-R^2\right)}.$$

          Check by integrating the force: bringing $q$ in from infinity you push against $F$, so

          $$W = -\int_\infty^aF(a')\,da' = \frac{q^2R}{4\pi\varepsilon_0}\int_\infty^a\frac{a'\,da'}{(a'^2-R^2)^2} = \frac{q^2R}{4\pi\varepsilon_0}\left[-\frac{1}{2(a'^2-R^2)}\right]_\infty^a = -\frac{q^2R}{8\pi\varepsilon_0(a^2-R^2)}.$$

          **Plane limit.** Put $a = R+d$ with $d\ll R$: $a^2-R^2\approx2Rd$, so $W\approx-\dfrac{q^2}{16\pi\varepsilon_0d}$ and $F\approx-\dfrac{q^2}{16\pi\varepsilon_0d^2}$, the grounded-plane results.

          **Far away**, $F\approx-\dfrac{q^2R}{4\pi\varepsilon_0a^3}$: the induced charge $-qR/a$ shrinks as $q$ moves away, so the force falls faster than $1/a^2$.
        `),

        Q(md`The force on $q$ is the Coulomb pull of $q'$. At what distance?`,
          [md`$a-R$, the distance from $q$ to the surface`, md`$a$, the distance from $q$ to the center`, md`$a - \dfrac{R^2}{a} = \dfrac{a^2-R^2}{a}$`, md`$a + \dfrac{R^2}{a}$`], 2,
          [md`The image isn't on the surface; it is at $b = R^2/a$ from the center.`,
            md`The image isn't at the center (that is where a neutral sphere's second image goes).`,
            null,
            md`The image is on the same side of the center as $q$, so you subtract.`],
          md`$F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q\cdot(-qR/a)}{\left((a^2-R^2)/a\right)^2} = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2Ra}{(a^2-R^2)^2}$.`,
          { figHtml: FS }),

        Q(md`Which is the energy of the charge + grounded sphere system?`,
          [md`$W = -\dfrac{q^2R}{8\pi\varepsilon_0(a^2-R^2)}$`, md`$W = -\dfrac{q^2R}{4\pi\varepsilon_0(a^2-R^2)}$`, md`$W = -\dfrac{q^2}{8\pi\varepsilon_0(a-R)}$`, md`$W = -\dfrac{q^2R}{8\pi\varepsilon_0a^2}$`], 0,
          [null,
            md`That is $q\,V_{q'}(a)$, the energy of $q$ and $q'$ as two real charges. The real energy is half.`,
            md`That treats the sphere like a plane at distance $a-R$; it is only the near-surface limit (and even then the plane gives $-\dfrac{q^2}{16\pi\varepsilon_0d}$).`,
            md`That is only the far-away limit of the right answer.`],
          md`$W = \tfrac12\,qV_{q'}(a) = \tfrac12\,q\cdot\dfrac{-qR/a}{4\pi\varepsilon_0(a^2-R^2)/a}$. Check: $-dW/da = -\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2}$, the force.`,
          { figHtml: FS }),

        RF(md`
          ### Worked example: $a = 2R$

          **Region:** $r\ge R$. **Boundary conditions:**

          1. $V(R)=0$;
          2. $V\to0$ at infinity.

          **Image.** $q' = -\dfrac{R}{2R}q = -\dfrac q2$ at $b = \dfrac{R^2}{2R} = \dfrac R2$.

          [[fig:img]]

          **Check** at the near point: distances $R$ (to $q$) and $R/2$ (to $q'$): $\dfrac qR - \dfrac{q/2}{R/2} = 0$. At the far point: $3R$ and $\tfrac32R$: $\dfrac{q}{3R} - \dfrac{q/2}{3R/2} = 0$. Condition 1 holds (at every $\theta$, by the general algebra); condition 2 holds since both terms die at infinity; the image is inside the sphere.

          **Induced charge.** $\sigma(\theta) = -\dfrac{3q}{4\pi R^2}\,\dfrac{1}{(5-4\cos\theta)^{3/2}}$: $\sigma(0) = -\dfrac{3q}{4\pi R^2}\approx-0.239\,\dfrac{q}{R^2}$ and $\sigma(\pi) = -\dfrac{q}{36\pi R^2}\approx-0.0088\,\dfrac{q}{R^2}$, 27 times smaller. Total $-q/2$.

          [[fig:sig]]

          **Force.** Distance $a-b = \tfrac32R$: $F = \dfrac{q(-q/2)}{4\pi\varepsilon_0(3R/2)^2} = -\dfrac29\,\dfrac{q^2}{4\pi\varepsilon_0R^2}$, toward the sphere.

          **Energy.** $W = -\dfrac{q^2R}{8\pi\varepsilon_0(3R^2)} = -\dfrac{q^2}{24\pi\varepsilon_0R}$.
        `, { img: { svg: fSphereImg({ A: 2 }), cap: md`$a=2R$: image $-q/2$ at $R/2$. The metal is replaced by the image; its surface (dashed) is the $V=0$ surface of the pair.` },
          sig: { svg: fSigSphere(2), cap: md`$\sigma(\theta)$ for $a=2R$, in units of $q/R^2$.` } }),

        P({
          title: 'Grounded sphere, charge at three radii',
          q: md`
            A charge $q$ is a distance $a = 3R$ from the center of a grounded conducting sphere of radius $R$.

            Find the image charge and its position, the surface charge density at the nearest and farthest points of the sphere (units $q/R^2$), the force on $q$ (units $\dfrac{q^2}{4\pi\varepsilon_0R^2}$, positive = away from the sphere), and the energy (units $\dfrac{q^2}{4\pi\varepsilon_0R}$).
          `,
          figHtml: fSphere({ A: 3, Rp: 40 }),
          hints: [
            md`Region $r\ge R$; $V(R)=0$; $V\to0$ at infinity. Image $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$.`,
            md`$\sigma(\theta) = -\dfrac{q(a^2-R^2)}{4\pi R(R^2+a^2-2aR\cos\theta)^{3/2}}$; at $\theta=0$ the bracket is $(a-R)^2$, at $\theta=\pi$ it is $(a+R)^2$.`,
            md`Force: Coulomb between $q$ and $q'$ at distance $a-b$. Energy: half of $q\,V_{q'}(a)$.`,
          ],
          parts: [
            { lbl: md`$q'$`, expr: '-q/3', vars: { q: [1, 3] } },
            { lbl: md`$b$`, expr: 'R/3', vars: { R: [1, 3] } },
            { lbl: md`$\sigma$ at the nearest point`, ans: -0.07958 },
            { lbl: md`$\sigma$ at the farthest point`, ans: -0.009947 },
            { lbl: md`$F$`, ans: -0.046875 },
            { lbl: md`$W$`, ans: -0.0625 },
          ],
          sol: md`
            **Region of interest:** $r\ge R$.

            **Boundary conditions:**

            1. $V(R)=0$.
            2. $V\to0$ at infinity.

            **Image.** $q' = -\dfrac{R}{3R}q = -\dfrac q3$ at $b = \dfrac{R^2}{3R} = \dfrac R3$ (inside the sphere). Check at the near point: $\dfrac{q}{2R} - \dfrac{q/3}{2R/3} = 0$; at the far point: $\dfrac{q}{4R} - \dfrac{q/3}{4R/3} = 0$. These check condition 1 (the lesson's algebra makes it hold at every $\theta$); condition 2 holds because both terms die at infinity.

            [[fig:img]]

            **Surface charge.** $a^2 - R^2 = 8R^2$.

            - Nearest point: $\sigma(0) = -\dfrac{q\cdot8R^2}{4\pi R(2R)^3} = -\dfrac{q}{4\pi R^2}\approx-0.0796\,\dfrac{q}{R^2}$.
            - Farthest point: $\sigma(\pi) = -\dfrac{q\cdot8R^2}{4\pi R(4R)^3} = -\dfrac{q}{32\pi R^2}\approx-0.0099\,\dfrac{q}{R^2}$.

            The ratio is $\left(\dfrac{a+R}{a-R}\right)^3 = 8$.

            **Force.** $a - b = \tfrac83R$: $F = \dfrac{q(-q/3)}{4\pi\varepsilon_0(8R/3)^2} = -\dfrac{3}{64}\,\dfrac{q^2}{4\pi\varepsilon_0R^2}\approx-0.0469$. The formula $-\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2} = -\dfrac{3R^2}{64R^4}\dfrac{q^2}{4\pi\varepsilon_0}$ agrees.

            **Energy.** $W = -\dfrac{q^2R}{8\pi\varepsilon_0\cdot8R^2} = -\dfrac{1}{16}\,\dfrac{q^2}{4\pi\varepsilon_0R}$.

            **Checks.** Everything is weaker than at $a=2R$ (where $F = -\tfrac29$, $W = -\tfrac16$): the image is smaller and farther away. The total induced charge is $-q/3$.
          `,
          figs: { img: { svg: fSphereImg({ A: 3, Rp: 46 }), cap: md`$a=3R$: image $-q/3$ at $R/3$.` } },
        }),

        P({
          id: 'HW4-3.8', src: 'HW 4 · Hybrid 3.8', title: 'The grounded sphere: potential, induced charge, energy', big: true,
          q: md`
            (a) Rewrite Equation 3.17 in terms of spherical coordinates $r$, $\theta$, with the z axis being the line passing through the charge q.

            (b) Plot the induced surface charge on the sphere as a function of $\theta$. Integrate this charge to find the total induced charge.

            (c) Plot the energy of this configuration as a function of the distance a between the charge and the sphere.

            *Eq. 3.17 is the grounded-sphere image potential, $V = \dfrac{1}{4\pi\varepsilon_0}\left(\dfrac{q}{\srm} + \dfrac{q'}{\srm'}\right)$, with $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$ (Example 3.2: $q$ a distance $a$ from the center of a grounded sphere of radius $R$).*
          `,
          figHtml: FS,
          hints: [
            md`Boundary conditions: region $r\ge R$; (1) $V(R)=0$; (2) $V\to0$ at infinity. For (a), write $\srm$ and $\srm'$ with the law of cosines, put in $b = R^2/a$ and $q' = -Rq/a$, and pull the factor $R/a$ inside the second square root.`,
            md`(b) $\sigma = -\varepsilon_0\,\partial V/\partial r$ at $r=R$ ($\uv n = \uv r$). With the form from (a), the two square roots are equal at $r=R$, which makes the algebra short. Total: $da = 2\pi R^2\sin\theta\,d\theta$, substitute $u=\cos\theta$.`,
            md`(c) $W = \tfrac12\,q\,V_{q'}$ at the position of $q$ (the induced charge sits at $V=0$). Or integrate the force from infinity. Plot $W$ in units of $\dfrac{q^2}{4\pi\varepsilon_0R}$ against $a/R$.`,
          ],
          parts: [
            { lbl: md`(a) Which is Eq. 3.17 in spherical coordinates (for $r\ge R$)?`,
              mc: [md`$\dfrac{q}{4\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{r^2+a^2-2ra\cos\theta}} - \dfrac{1}{\sqrt{R^2+(ra/R)^2-2ra\cos\theta}}\right]$`,
                md`$\dfrac{q}{4\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{r^2+a^2-2Ra\cos\theta}} - \dfrac{R/a}{\sqrt{r^2+b^2-2rb\cos\theta}}\right]$`,
                md`$\dfrac{q}{4\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{r^2+a^2-2ra\cos\theta}} - \dfrac{1}{\sqrt{r^2+(R^2/a)^2-2r(R^2/a)\cos\theta}}\right]$`,
                md`$\dfrac{q}{4\pi\varepsilon_0}\left[\dfrac{1}{\sqrt{r^2+a^2-2ra\cos\theta}} + \dfrac{1}{\sqrt{R^2+(ra/R)^2-2ra\cos\theta}}\right]$`], a: 0,
              why: [null,
                md`The first root uses $R$ where the field point's $r$ belongs (the slip in the notes). The law of cosines for $\srm$ has $2ra\cos\theta$.`,
                md`This drops the size of the image: $q'/q = -R/a$, not $-1$. At $r=R$ it doesn't vanish.`,
                md`The image has the opposite sign; with a plus sign $V$ can't vanish on the sphere.`] },
            { lbl: md`(b) total induced charge`, expr: '-q*R/a', vars: { q: [1, 3], R: [1, 2], a: [3, 6] } },
            { lbl: md`(b) for $a=2R$: $\sigma(\theta=0)$ in units of $q/R^2$`, ans: -0.2387 },
            { lbl: md`(c) $W(a)$`, expr: '-q^2*R/(8*pi*eps0*(a^2-R^2))', vars: { q: [1, 3], eps0: [0.5, 2], R: [1, 2], a: [3, 6] }, accepts: ['q^2*R/(8*pi*eps0*(R^2-a^2))', '-(1/(4*pi*eps0))*q^2*R/(2*(a^2-R^2))'] },
          ],
          sol: md`
            **Region and boundary conditions.** Region $r\ge R$ (outside the sphere), where the only charge is $q$.

            1. $V(R,\theta)=0$ for all $\theta$ (grounded sphere).
            2. $V\to0$ as $r\to\infty$.

            The image $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$ is inside the sphere, outside the region.

            [[fig:img]]

            **(a)** With the $z$ axis through $q$, $\theta$ is the usual polar angle. Law of cosines: $\srm^2 = r^2+a^2-2ra\cos\theta$, $\srm'^2 = r^2+b^2-2rb\cos\theta$. So

            $$V = \frac{1}{4\pi\varepsilon_0}\left[\frac{q}{\sqrt{r^2+a^2-2ra\cos\theta}} - \frac{qR/a}{\sqrt{r^2+R^4/a^2-2rR^2\cos\theta/a}}\right].$$

            Multiply the second square root by $a/R$ (and the numerator $qR/a$ by $a/R$, giving $q$): $\dfrac aR\sqrt{r^2+\dfrac{R^4}{a^2}-\dfrac{2rR^2}{a}\cos\theta} = \sqrt{\dfrac{r^2a^2}{R^2}+R^2-2ra\cos\theta}$. Hence

            $$V(r,\theta) = \frac{q}{4\pi\varepsilon_0}\left[\frac{1}{\sqrt{r^2+a^2-2ra\cos\theta}} - \frac{1}{\sqrt{R^2+(ra/R)^2-2ra\cos\theta}}\right].$$

            **Check.** At $r=R$ both roots are $\sqrt{R^2+a^2-2Ra\cos\theta}$, so $V=0$ (condition 1). As $r\to\infty$ both terms vanish (condition 2).

            **(b)** Outside the sphere $\uv n = \uv r$. Differentiate:

            $$\frac{\partial V}{\partial r} = \frac{q}{4\pi\varepsilon_0}\left[-\frac{r-a\cos\theta}{(r^2+a^2-2ra\cos\theta)^{3/2}} + \frac{(a^2/R^2)\,r - a\cos\theta}{(R^2+(ra/R)^2-2ra\cos\theta)^{3/2}}\right].$$

            At $r=R$ both denominators are $(R^2+a^2-2Ra\cos\theta)^{3/2}$, and the numerators combine to $-R + a\cos\theta + a^2/R - a\cos\theta = (a^2-R^2)/R$:

            $$\sigma(\theta) = -\varepsilon_0\left.\frac{\partial V}{\partial r}\right|_{R} = -\frac{q\,(a^2-R^2)}{4\pi R\,(R^2+a^2-2aR\cos\theta)^{3/2}}.$$

            [[fig:sig]]

            Total, with $u = \cos\theta$ and $\displaystyle\int\frac{du}{(A-Bu)^{3/2}} = \frac{2}{B\sqrt{A-Bu}}$:

            $$Q_{\text{ind}} = \int_0^\pi\sigma\,2\pi R^2\sin\theta\,d\theta = -\frac{q(a^2-R^2)R}{2}\cdot\frac{1}{aR}\left[\frac{1}{a-R} - \frac{1}{a+R}\right] = -\frac{q(a^2-R^2)R}{2}\cdot\frac{2}{a(a^2-R^2)} = -\frac{qR}{a}.$$

            It should be $q'$: a Gaussian surface hugging the sphere (excluding $q$) sees the same field in both problems.

            **(c)** The induced charge sits at $V=0$, so $W = \tfrac12\,q\,V_{q'}(a)$ with $V_{q'}(a) = \dfrac{q'}{4\pi\varepsilon_0(a-b)} = -\dfrac{qR/a}{4\pi\varepsilon_0(a^2-R^2)/a}$:

            $$W(a) = -\frac{q^2R}{8\pi\varepsilon_0\,(a^2-R^2)} = -\frac{q^2}{4\pi\varepsilon_0R}\cdot\frac{1}{2\left[(a/R)^2-1\right]}.$$

            Check: $-\displaystyle\int_\infty^aF\,da'$ with $F = -\dfrac{q^2Ra'}{4\pi\varepsilon_0(a'^2-R^2)^2}$ gives the same.

            [[fig:W]]

            $W\to-\infty$ as $a\to R$, following the plane result $-\dfrac{q^2}{16\pi\varepsilon_0(a-R)}$ (dashed); far away $W\approx-\dfrac{q^2R}{8\pi\varepsilon_0a^2}$.

            **What to remember.** Total induced charge on a grounded sphere is $q' = -qR/a$, not $-q$. Energy is half of $q$ times the image's potential at $q$.
          `,
          figs: { img: { svg: fSphereImg(), cap: md`The image system: $q' = -\tfrac Raq$ at $b = R^2/a$; the dashed circle is where the pair's $V$ is zero.` },
            sig: { svg: fSigSphere23(), cap: md`$\sigma(\theta)$ in units of $q/R^2$: solid $a=2R$, dashed $a=3R$. The charge gathers on the side facing $q$.` },
            W: { svg: fWplot(), cap: md`$W$ in units of $q^2/(4\pi\varepsilon_0R)$ against $a/R$ (solid), with the near-surface plane limit $-\tfrac14\big/(a/R-1)$ (dashed).` } },
        }),

        RF(md`
          !!key Patterns to remember
            - Grounded sphere, $q$ at distance $a>R$: conditions $V(R)=0$, $V(\infty)=0$; image $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$, inside the sphere, on the line to $q$.
            - Derivation: set $V(R,\theta)=0$, square, and match the constant and $\cos\theta$ terms (it must hold for all $\theta$). Reject $b=a$ (image in the region).
            - Use $\srm$, $\srm'$ (distances from the charges), not $r$ (distance from the center). Check $V=0$ at $\theta=0$ and $\theta=\pi$.
            - $\sigma(\theta) = -\dfrac{q(a^2-R^2)}{4\pi R(R^2+a^2-2aR\cos\theta)^{3/2}}$, largest facing $q$; total $q' = -\dfrac Raq$, not $-q$.
            - $F = -\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2}$; $W = -\dfrac{q^2R}{8\pi\varepsilon_0(a^2-R^2)}$ (half rule). As $a\to R$ both become the plane results.
        `),
      ],
    });
  }

  // ================================================================ Lesson 7: other spheres, and a charge inside a shell
  {
    const FSN = fSphere({ lab: 'Q=0' });
    const FSV = fSphere({ lab: 'V=V_0' });
    const FSH = fShell();
    const FS2 = fSphere({ lab: '' });
    LESSONS.push({
      id: 'u5-sphere2', title: 'Neutral, charged and fixed-potential spheres; a charge inside a shell',
      steps: [
        RF(md`
          ### Changing what the sphere is held at

          The grounded solution gives the sphere $V=0$ and total charge $q' = -\dfrac Raq$. Other conditions on the sphere need one more image. Add a point charge $q''$ **at the center**:

          - It is constant on the sphere ($q''/4\pi\varepsilon_0R$), so the sphere stays an equipotential.
          - It is inside the sphere, outside the region of interest.
          - It adds $q''$ to the sphere's total charge (Gauss's law around the sphere).

          First translate the words into boundary conditions. The region of interest is $r\ge R$ every time, with $V\to0$ at infinity.

          | The sphere is... | condition on the sphere | add at the center | total charge | potential of the sphere |
          |---|---|---|---|---|
          | grounded | $V(R)=0$ | nothing | $-\dfrac Raq$ | $0$ |
          | isolated, neutral | $V(R)$ = const, total $0$ | $+\dfrac Raq$ | $0$ | $\dfrac{q}{4\pi\varepsilon_0a}$ |
          | held at $V_0$ | $V(R)=V_0$ | $4\pi\varepsilon_0RV_0$ | $4\pi\varepsilon_0RV_0 - \dfrac Raq$ | $V_0$ |
          | isolated, charge $Q$ | $V(R)$ = const, total $Q$ | $Q + \dfrac Raq$ | $Q$ | $\dfrac{1}{4\pi\varepsilon_0R}\left(Q+\dfrac Raq\right)$ |

          [[fig:img]]

          For an isolated sphere the potential is not given; it comes out of the solution. The second uniqueness theorem (Unit 4) says that fixing the **total charge** on each conductor is enough to make the solution unique.

          **Where the neutral sphere's potential comes from.** The center is inside the metal, so it is at the sphere's potential. Every induced charge is a distance $R$ from the center, so together they contribute $\dfrac{Q_{\text{total}}}{4\pi\varepsilon_0R}$ there, which is $0$ for a neutral sphere. What remains is $q$'s potential at the center: $V_{\text{sphere}} = \dfrac{q}{4\pi\varepsilon_0a}$. (The same argument for the grounded sphere, $0 = \dfrac{q}{4\pi\varepsilon_0a} + \dfrac{Q}{4\pi\varepsilon_0R}$, gives its induced charge $-\dfrac Raq$ in one line.)
        `, { img: { svg: fSphereImg({ center: "q''" }), cap: md`The grounded image $q'$ plus a second image $q''$ at the center. The dashed circle is an equipotential of this system.` } }),

        Q(md`An isolated conductor carries a total charge $Q$. Which boundary conditions describe it (besides $V\to0$ at infinity)?`,
          [md`$V$ is some constant on it, not known in advance, and $\oint\sigma\,da = Q$`, md`$V=0$ on it`, md`$\sigma = Q/A$, spread uniformly over its surface`, md`$V = \dfrac{Q}{4\pi\varepsilon_0R}$ on it, whatever charges are nearby`], 0,
          [null,
            md`That is a grounded conductor. An isolated one keeps its charge and lets its potential float.`,
            md`Nearby charges push the charge around: $\sigma$ is not uniform when $q$ is close (it isn't even uniform on a lone non-spherical conductor).`,
            md`That is the sphere's potential only when it is alone. A nearby $q$ shifts it: a neutral sphere floats to $\dfrac{q}{4\pi\varepsilon_0a}$.`],
          md`A conductor in equilibrium is always an equipotential. If it is isolated, nothing fixes the value of that potential; what is fixed is its total charge. The second uniqueness theorem says that is enough: the field is unique once each conductor's total charge is given.`,
          { figHtml: fSphere({ lab: 'Q' }) }),

        Q(md`Your image system for the grounded sphere has only $q$ in $r>R$, gives $V=0$ on $r=R$, and goes to zero at infinity. Why is it guaranteed to be the real potential outside the sphere?`,
          [md`Uniqueness: the same charge in the region and the same values on every boundary give the same solution`, md`Because image charges always work for spheres`, md`Because it also gives $V=0$ inside the sphere`, md`Because the induced charge equals $q'$`], 0,
          [null,
            md`Images work for spheres because this particular guess meets the conditions. The guarantee comes from the uniqueness theorem, not from the shape.`,
            md`It doesn't: the image formula is not $0$ inside the sphere. Inside is not part of the region, so it doesn't matter.`,
            md`That is a consequence of the solution being right, not the reason it is right.`],
          md`Uniqueness (Unit 4): two functions with the same $\rho$ in a region and the same boundary values must be equal there. The real potential and the image potential share both, so they agree for $r\ge R$. That is the whole logic of the method.`,
          { figHtml: fSphere() }),

        Q(md`You switch from a **grounded** sphere to an **isolated, neutral** one, with $q$ in the same place. Which boundary condition changes, and what does that do to the images?`,
          [md`Nothing changes; the images stay the same`, md`$V(\infty)=0$ is dropped, so the image moves off to infinity`, md`The region of interest becomes $r\le R$`, md`$V(R)=0$ is replaced by "$V(R)$ = an unknown constant, total charge $0$", so a center image $+\dfrac Raq$ is added`], 3,
          [md`The grounded sphere carries charge $-\dfrac Raq$; a neutral one can't. The solution must change.`,
            md`$V\to0$ at infinity holds in both cases; the change is on the sphere.`,
            md`The charge is still outside; the region of interest is still $r\ge R$.`,
            null],
          md`Grounded: $V(R)=0$, and the charge adjusts (to $-\dfrac Raq$). Neutral: total charge $0$, and the potential adjusts (to $\dfrac{q}{4\pi\varepsilon_0a}$). Adding $+\dfrac Raq$ at the center fixes the total without spoiling the equipotential.`,
          { figHtml: fSphere({ lab: 'Q=0' }) }),

        Q(md`The sphere is **isolated and uncharged**. Which boundary conditions describe it?`,
          [md`$V(R)=0$ and $V(\infty)=0$`, md`$V(R) = V_s$, an unknown constant; total charge on the sphere $=0$; $V(\infty)=0$`, md`$\sigma = 0$ everywhere on the sphere, and $V(\infty)=0$`, md`$V(R) = \dfrac{q}{4\pi\varepsilon_0(a-R)}$ and $V(\infty)=0$`], 1,
          [md`That is a grounded sphere. An isolated sphere is not connected to anything that fixes its potential.`,
            null,
            md`Zero **total** charge doesn't mean zero charge everywhere: $q$ separates charge on the sphere, negative on the near side and positive on the far side.`,
            md`That is $q$'s potential at the nearest point. The sphere is an equipotential, but its value isn't that.`],
          md`A conductor is always an equipotential, so $V$ is constant on the sphere, but for an isolated sphere you don't know the constant in advance. What you do know is its total charge. Uniqueness works with either kind of condition.`,
          { figHtml: FSN }),

        Q(md`A battery holds the sphere at potential $V_0$ (relative to infinity). Which boundary condition does that give?`,
          [md`$V(R,\theta) = V_0$ for every $\theta$, and $V(\infty)=0$`, md`The total charge on the sphere is $4\pi\varepsilon_0RV_0$`, md`$V = V_0$ only at the point of the sphere nearest $q$`, md`$V(R) = V_0 - \dfrac{q}{4\pi\varepsilon_0a}$`], 0,
          [null,
            md`That would be its charge without $q$. With $q$ nearby the battery adds the grounded sphere's induced charge too: the total is $4\pi\varepsilon_0RV_0 - \dfrac Raq$.`,
            md`The whole sphere is one conductor: one potential everywhere on it.`,
            md`The battery holds the sphere at exactly $V_0$; $q$ doesn't shift it.`],
          md`Held at $V_0$ means $V = V_0$ on the whole conductor, the same kind of condition as grounded ($V_0 = 0$ is grounded). The charge on the sphere is whatever the battery supplies to keep it there.`,
          { figHtml: FSV }),

        Q(md`What do you add to the grounded image system to describe an **isolated, neutral** sphere?`,
          [md`$-\dfrac Raq$ at the center`, md`$+\dfrac Raq$ at $b = \dfrac{R^2}{a}$`, md`$+q$ at the center`, md`$+\dfrac Raq$ at the center`], 3,
          [md`That doubles the negative charge; the total would be $-\dfrac{2R}{a}q$, not zero.`,
            md`On top of $q'$ it would just cancel $q'$, leaving $V\ne$ constant on the sphere.`,
            md`The total would be $q - \dfrac Raq\ne0$.`,
            null],
          md`The grounded solution has total charge $q' = -\dfrac Raq$ on the sphere. Add $q'' = +\dfrac Raq$ at the center: the total is zero, and the sphere is still an equipotential (now at $\dfrac{q''}{4\pi\varepsilon_0R} = \dfrac{q}{4\pi\varepsilon_0a}$).`,
          { figHtml: FSN }),

        Q(md`Why does the extra image go at the **center**?`,
          [md`Because the induced positive charge sits at the center`, md`Because the center is the image of infinity`, md`It is the only point where its potential is the same at every point of the sphere, so the sphere stays an equipotential; and it is outside the region of interest`, md`Because any point inside the sphere would do`], 2,
          [md`No real charge sits at the center; the induced charge is on the surface. $q''$ is a stand-in for the uniform part of it.`,
            md`Under inversion the center does correspond to infinity, but that's not why it works here; the reason is that it keeps the sphere an equipotential.`,
            null,
            md`An off-center charge has different potentials at different points of the sphere, which would spoil the equipotential condition.`],
          md`A charge at the center is equidistant from every point of the sphere, so it adds the same constant everywhere on it. It shifts the sphere's potential and total charge without breaking $V$ = constant.`,
          { figHtml: FSN }),

        Q(md`What is the potential of the isolated, **neutral** sphere?`,
          [md`$0$`, md`$\dfrac{q}{4\pi\varepsilon_0R}$`, md`$\dfrac{q}{4\pi\varepsilon_0(a-R)}$`, md`$\dfrac{q}{4\pi\varepsilon_0a}$`], 3,
          [md`Only a grounded sphere is at $0$. A neutral sphere near a positive charge floats to a positive potential.`,
            md`That would be the potential of the sphere carrying total charge $q$.`,
            md`That is $q$'s potential at the nearest point, not the sphere's potential.`,
            null],
          md`At the center (inside the metal, so at the sphere's potential), the induced charge contributes $\dfrac{0}{4\pi\varepsilon_0R} = 0$ and $q$ contributes $\dfrac{q}{4\pi\varepsilon_0a}$. Equivalently, $\dfrac{q''}{4\pi\varepsilon_0R}$ with $q'' = \dfrac Raq$.`,
          { figHtml: FSN }),

        Q(md`The sphere is held at $V_0$ by a battery. What is its total charge?`,
          [md`$4\pi\varepsilon_0RV_0$`, md`$4\pi\varepsilon_0RV_0 - \dfrac Raq$`, md`$-\dfrac Raq$`, md`$4\pi\varepsilon_0RV_0 + \dfrac Raq$`], 1,
          [md`That leaves out the charge induced by $q$ (the grounded part, $q'$).`,
            null,
            md`That is the grounded sphere ($V_0=0$).`,
            md`The induced part has the opposite sign to $q$.`],
          md`Images inside the sphere: $q' = -\dfrac Raq$ at $b$ and $q'' = 4\pi\varepsilon_0RV_0$ at the center. Gauss's law around the sphere: total $= q' + q'' = 4\pi\varepsilon_0RV_0 - \dfrac Raq$.`,
          { figHtml: FSV }),

        Q(md`The sphere is isolated and carries total charge $Q$. What charge goes at the center?`,
          [md`$Q$`, md`$Q - \dfrac Raq$`, md`$Q + \dfrac Raq$`, md`$-\dfrac Raq$`], 2,
          [md`Then the total would be $Q + q' = Q - \dfrac Raq$, not $Q$.`,
            md`The total would be $Q - \dfrac{2R}{a}q$.`,
            null,
            md`That gives total charge $-\dfrac{2R}{a}q$, not $Q$.`],
          md`The total must be $Q$, and $q'$ already contributes $-\dfrac Raq$, so $q'' = Q - q' = Q + \dfrac Raq$. The sphere's potential is then $\dfrac{q''}{4\pi\varepsilon_0R}$.`,
          { figHtml: fSphere({ lab: 'Q' }) }),

        RF(md`
          ### Force near a neutral sphere (Griffiths 3.9)

          Now $q$ feels both images: $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$ attracts, and $q'' = +\dfrac Raq$ at the center repels but is farther away.

          $$F = \frac{q}{4\pi\varepsilon_0}\left[\frac{q'}{(a-b)^2} + \frac{q''}{a^2}\right] = \frac{q^2R}{4\pi\varepsilon_0}\left[-\frac{a}{(a^2-R^2)^2} + \frac{1}{a^3}\right] = -\frac{q^2}{4\pi\varepsilon_0}\left(\frac Ra\right)^3\frac{2a^2-R^2}{(a^2-R^2)^2}.$$

          (Combine the brackets: $\dfrac{-a^4 + (a^2-R^2)^2}{a^3(a^2-R^2)^2} = \dfrac{-R^2(2a^2-R^2)}{a^3(a^2-R^2)^2}$.)

          Since $2a^2>R^2$, the force is **always attractive**: the nearer, negative image wins. A neutral conductor always attracts a charge.

          Far away ($a\gg R$), $F\approx-\dfrac{2q^2R^3}{4\pi\varepsilon_0a^5}$. The two images form a small dipole of moment $p = |q'|\,b = \dfrac{qR^3}{a^2}$, induced by $q$, and its pull falls off like $1/a^5$, much faster than the grounded sphere's $1/a^3$.

          The energy follows from the half rule with the extra term for a charged conductor, $W = \tfrac12\,qV_{\text{images}}(q) + \tfrac12\,Q_{\text{sphere}}V_{\text{sphere}}$. For the neutral sphere the second term is zero, so $W = \tfrac12\,qV_{\text{images}}(q)$ again.
        `),

        Q(md`A charge $q$ is near an isolated, **neutral** metal sphere. Which way is the force on $q$?`,
          [md`Away from the sphere, since the sphere is neutral and the center image repels`, md`Zero, since the sphere has no net charge`, md`It depends on the sign of $q$`, md`Toward the sphere`], 3,
          [md`The center image $+\dfrac Raq$ does repel, but the attracting image $-\dfrac Raq$ is closer, and it wins for every $a>R$.`,
            md`Net charge zero doesn't mean no force: $q$ separates charge on the sphere, pulling opposite charge to the near side.`,
            md`The force is proportional to $q^2$; flipping $q$ flips all the induced charges too.`,
            null],
          md`$F = -\dfrac{q^2}{4\pi\varepsilon_0}\left(\dfrac Ra\right)^3\dfrac{2a^2-R^2}{(a^2-R^2)^2}<0$ for all $a>R$. Neutral conductors attract charges, just as a rubbed comb picks up bits of paper.`,
          { figHtml: FSN }),

        Q(md`Far from a neutral sphere ($a\gg R$), how does the force on $q$ fall off?`,
          [md`Like $1/a^2$`, md`Like $1/a^3$`, md`Like $1/a^5$`, md`Like $1/a^4$`], 2,
          [md`$1/a^2$ would need net charge on the sphere. It is neutral.`,
            md`$1/a^3$ is the grounded sphere, whose induced charge $-\dfrac Raq$ is a net charge.`,
            null,
            md`Count the powers: an induced dipole $p\propto q/a^2$ in a field $\propto1/a^3$.`],
          md`The images form a dipole $p = \dfrac{qR^3}{a^2}$ (induced, so it grows as $q$ approaches). The dipole's field at $q$ is about $\dfrac{2p}{4\pi\varepsilon_0a^3}$, so $F\approx\dfrac{2q^2R^3}{4\pi\varepsilon_0a^5}$, attractive.`,
          { figHtml: FSN }),

        Q(md`At the same distance $a$, which pulls harder on $q$: a grounded sphere or an isolated neutral one?`,
          [md`The neutral one`, md`The grounded one`, md`They pull equally hard`, md`It depends on whether $a<2R$`], 1,
          [md`The neutral sphere has the extra center image $+\dfrac Raq$, which pushes $q$ away.`,
            null,
            md`They differ by the repulsion of the center image, $\dfrac{q^2R}{4\pi\varepsilon_0a^3}$.`,
            md`The grounded sphere wins at every distance: the difference is exactly the center image's push.`],
          md`$F_{\text{grounded}} - F_{\text{neutral}} = -\dfrac{q\,q''}{4\pi\varepsilon_0a^2}$. At $a = 2R$: $-\tfrac29$ versus $-\tfrac{7}{72}$ (units $\dfrac{q^2}{4\pi\varepsilon_0R^2}$). The grounded sphere can draw extra opposite charge from the earth; the neutral one can only separate its own.`,
          { figHtml: FS2 }),

        RF(md`
          ### Held at $V_0$, or carrying charge $Q$

          With a center charge $q''$ ($= 4\pi\varepsilon_0RV_0$, or $Q + \dfrac Raq$):

          $$F = \frac{q}{4\pi\varepsilon_0}\left[\frac{q''}{a^2} - \frac{qRa}{(a^2-R^2)^2}\right].$$

          If $q''$ has the same sign as $q$, the center image repels. Far away the $1/a^2$ repulsion wins. Close to the surface the image $q'$ wins, since its pull grows like $1/(a-R)^2$. So a charge and a like-charged sphere **repel at long range but attract at short range**. In between there is a distance where the force is zero (an unstable balance point).
        `),

        Q(md`A positive charge $q$ approaches an isolated sphere that carries a **positive** charge $Q$. What happens to the force?`,
          [md`It repels at all distances`, md`It attracts at all distances`, md`It attracts far away and repels close in`, md`It repels far away and attracts close in`], 3,
          [md`Close in, the image $-\dfrac Raq$ nearly touches $q$ and its pull grows without bound.`,
            md`Far away the sphere looks like a point charge $Q$ (plus a small induced dipole), so like charges repel.`,
            md`The other way round: the net charge dominates far away, the image dominates close in.`,
            null],
          md`$F = \dfrac{q}{4\pi\varepsilon_0}\left[\dfrac{Q + Rq/a}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}\right]$. As $a\to R$ the second term diverges, so the force becomes attractive. This is why a charge can stick to a like-charged conductor once it gets close enough.`,
          { figHtml: fSphere({ lab: 'Q' }) }),

        Q(md`A charge $q$ sits near a grounded sphere. You cut the ground wire (holding $q$ fixed). What changes?`,
          [md`Nothing: the sphere keeps its charge $-\dfrac Raq$ and stays at $V=0$`, md`The sphere becomes neutral and its potential jumps to $\dfrac{q}{4\pi\varepsilon_0a}$`, md`The induced charge flows back to the earth`, md`The image moves to the center`], 0,
          [null,
            md`Charge can't leave or arrive once the wire is cut. The sphere keeps exactly what it had.`,
            md`The wire is cut; there is nowhere for the charge to go.`,
            md`The charge distribution doesn't change, so the image picture doesn't either.`],
          md`Before the cut: $V=0$, total charge $-\dfrac Raq$. After the cut the conditions are "isolated, total charge $-\dfrac Raq$", and the old solution satisfies them, so by uniqueness it is still the solution. Things change only if $q$ then moves: the sphere keeps $-\dfrac Raq$ but its potential no longer stays $0$.`,
          { figHtml: fSphere({ ground: true }) }),

        RF(md`
          ### Worked example: neutral sphere, $a = 3R$

          **Conditions.** Region $r\ge R$. The sphere is an equipotential with total charge $0$; $V\to0$ at infinity.

          **Images.** $q' = -\dfrac q3$ at $b = \dfrac R3$; $q'' = +\dfrac q3$ at the center. Total $0$. The sphere is an equipotential (the pair $q,q'$ gives $0$ on it, and $q''$ adds a constant).

          [[fig:img]]

          **Potential of the sphere.** $\dfrac{q''}{4\pi\varepsilon_0R} = \dfrac{q}{4\pi\varepsilon_0\,3R}$, the potential $q$ alone makes at the center.

          **Force.** In units of $\dfrac{q^2}{4\pi\varepsilon_0R^2}$: from $q'$ at distance $\tfrac83R$, $-\dfrac13\cdot\dfrac{9}{64} = -\dfrac{3}{64}$; from $q''$ at distance $3R$, $+\dfrac13\cdot\dfrac19 = \dfrac{1}{27}$. Total $-\dfrac{3}{64}+\dfrac1{27} = -\dfrac{17}{1728}\approx-0.0098$. The formula $-\left(\tfrac13\right)^3\dfrac{17}{64}$ agrees.

          Compare: a grounded sphere at the same distance pulls with $\dfrac3{64}\approx0.047$, five times harder.
        `, { img: { svg: fSphereImg({ A: 3, Rp: 46, center: "q''" }), cap: md`Neutral sphere, $a = 3R$: $q' = -q/3$ at $R/3$ and $q'' = +q/3$ at the center.` } }),

        P({
          title: 'A neutral sphere at twice its radius',
          q: md`
            A charge $q$ is a distance $a = 2R$ from the center of an isolated, uncharged conducting sphere of radius $R$.

            Find the image charges, the potential of the sphere, and the force on $q$.
          `,
          figHtml: fSphere({ A: 2, lab: 'Q=0' }),
          hints: [
            md`Write the conditions: region $r\ge R$; $V$ = constant on the sphere (unknown); total charge on the sphere $0$; $V\to0$ at infinity.`,
            md`Start from the grounded images, $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$. Then add a center charge that makes the total zero.`,
            md`Force: add the Coulomb forces of both images on $q$. Distances $a-b$ and $a$.`,
          ],
          parts: [
            { lbl: md`$q''$ (at the center)`, expr: 'q/2', vars: { q: [1, 3] } },
            { lbl: md`$V_{\text{sphere}}$`, expr: 'q/(8*pi*eps0*R)', vars: { q: [1, 3], eps0: [0.5, 2], R: [1, 3] }, accepts: ['q/(4*pi*eps0*2*R)'] },
            { lbl: md`$F$ in units of $\dfrac{q^2}{4\pi\varepsilon_0R^2}$ (positive = away)`, ans: -0.09722 },
          ],
          sol: md`
            **Boundary conditions.** Region $r\ge R$.

            1. $V(R,\theta) = V_s$, a constant (unknown in advance).
            2. Total charge on the sphere $=0$.
            3. $V\to0$ at infinity.

            **Images.** Grounded part: $q' = -\dfrac q2$ at $b = \dfrac R2$. Center: $q'' = +\dfrac q2$, so the total is zero (condition 2). On the sphere $q$ and $q'$ give $0$ and $q''$ gives the constant $\dfrac{q/2}{4\pi\varepsilon_0R}$ (condition 1). Everything dies at infinity (condition 3). Both images are inside the sphere.

            [[fig:img]]

            **Potential.** $V_s = \dfrac{q/2}{4\pi\varepsilon_0R} = \dfrac{q}{8\pi\varepsilon_0R}$, the same as $q$'s potential at the center, $\dfrac{q}{4\pi\varepsilon_0(2R)}$.

            **Force** (units $\dfrac{q^2}{4\pi\varepsilon_0R^2}$): $q'$ at distance $\tfrac32R$: $-\dfrac12\cdot\dfrac49 = -\dfrac29$. $q''$ at distance $2R$: $+\dfrac12\cdot\dfrac14 = +\dfrac18$. Total $-\dfrac29+\dfrac18 = -\dfrac{7}{72}\approx-0.0972$, toward the sphere.

            **Check** with the formula: $\left(\tfrac12\right)^3\dfrac{2\cdot4-1}{(4-1)^2} = \dfrac18\cdot\dfrac79 = \dfrac{7}{72}$.
          `,
          figs: { img: { svg: fSphereImg({ A: 2, center: "q''" }), cap: md`$q' = -q/2$ at $R/2$ and $q'' = +q/2$ at the center.` } },
        }),

        P({
          title: 'A sphere held at V0 that exerts no force',
          q: md`
            A charge $q$ is a distance $a = 2R$ from the center of a conducting sphere of radius $R$. A battery holds the sphere at potential $V_0$ (relative to infinity).

            (a) For what $V_0$ is the force on $q$ zero?

            (b) What is the total charge on the sphere then?
          `,
          figHtml: fSphere({ A: 2, lab: 'V=V_0' }),
          hints: [
            md`Conditions: region $r\ge R$; $V(R,\theta) = V_0$; $V\to0$ at infinity. Images: the grounded pair plus $q'' = 4\pi\varepsilon_0RV_0$ at the center.`,
            md`$F = \dfrac{q}{4\pi\varepsilon_0}\left[\dfrac{q''}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}\right]$. Set it to zero at $a=2R$.`,
          ],
          parts: [
            { lbl: md`(a) $V_0$`, expr: '2*q/(9*pi*eps0*R)', vars: { q: [1, 3], eps0: [0.5, 2], R: [1, 3] }, accepts: ['(8/9)*q/(4*pi*eps0*R)'] },
            { lbl: md`(b) $Q_{\text{sphere}}$`, expr: '7*q/18', vars: { q: [1, 3] } },
          ],
          sol: md`
            **Region of interest:** $r\ge R$.

            **Boundary conditions:**

            1. $V(R,\theta) = V_0$ for every $\theta$.
            2. $V\to0$ at infinity.

            **Images.** $q' = -\dfrac q2$ at $\dfrac R2$ makes $V=0$ on the sphere together with $q$; $q'' = 4\pi\varepsilon_0RV_0$ at the center raises the sphere to $V_0$. **Check:** on the sphere $V = 0 + \dfrac{q''}{4\pi\varepsilon_0R} = V_0$ (condition 1); every term dies at infinity (condition 2); both images are inside the sphere.

            [[fig:img]]

            **(a)** Force on $q$:

            $$F = \frac{q}{4\pi\varepsilon_0}\left[\frac{q''}{(2R)^2} - \frac{q/2}{(3R/2)^2}\right] = \frac{q}{4\pi\varepsilon_0R^2}\left[\frac{q''}{4} - \frac{2q}{9}\right] = 0\;\Rightarrow\;q'' = \frac{8q}{9}.$$

            So $V_0 = \dfrac{q''}{4\pi\varepsilon_0R} = \dfrac89\,\dfrac{q}{4\pi\varepsilon_0R} = \dfrac{2q}{9\pi\varepsilon_0R}$.

            **(b)** $Q = q' + q'' = -\dfrac q2 + \dfrac{8q}{9} = \dfrac{7q}{18}$.

            **Check.** An isolated sphere with $Q = \tfrac{7}{18}q$ has $q'' = Q + \dfrac Raq = \tfrac7{18}q + \tfrac12q = \tfrac89q$: the same physical situation, so the same zero force. The balance is unstable: move $q$ closer and the image wins.
          `,
          figs: { img: { svg: fSphereImg({ A: 2, center: "q''" }), cap: md`The grounded image $q'$ plus the center charge $q'' = 4\pi\varepsilon_0RV_0$.` } },
        }),

        RF(md`
          ### A charge inside a grounded spherical shell

          Now the region of interest is **inside**: $q$ is a distance $a<R$ from the center of a hollow grounded shell of radius $R$.

          [[fig:shell]]

          **Region of interest:** $r\le R$, the cavity, where the only charge is $q$. **Boundary condition:**

          1. $V(R)=0$ (the shell is grounded).

          That is the whole boundary of this region; infinity is not part of it.

          The algebra of Lecture 11 never used $a>R$, so the same results hold:

          $$q' = -\frac Raq,\qquad b = \frac{R^2}{a}.$$

          But now $b>R$: the image is **outside** the shell, which is exactly where it must be (outside the region of interest). And $|q'|>q$: a bigger image, farther away.

          [[fig:shellimg]]

          **Check.** At the nearest point of the wall ($\theta=0$) the distances are $R-a$ to $q$ and $b-R = \dfrac{R(R-a)}{a}$ to $q'$: $\dfrac{q}{R-a} - \dfrac{(R/a)q}{R(R-a)/a} = 0$. The same works at every $\theta$. The image is outside the cavity.

          For $r\le R$, $V$ is the same two-term formula as for the outside problem. In the metal (and beyond it, for a grounded shell) $V=0$.

          - **Induced charge.** Take a Gaussian surface inside the metal of the shell. $\vb E=0$ there, so the enclosed charge is zero: the inner surface carries exactly $-q$, **not** $q'$. (This Gaussian surface encloses $q$; the image is outside it.)
          - **$\sigma$ on the inner surface.** $\uv n$ points out of the metal, into the cavity: $\uv n = -\uv r$, so $\sigma = +\varepsilon_0\,\partial V/\partial r$ at $r=R$. The result is

          $$\sigma(\theta) = -\frac{q\left(R^2-a^2\right)}{4\pi R\left(R^2+a^2-2aR\cos\theta\right)^{3/2}},$$

            piled up on the side nearest $q$, and it integrates to $-q$.
          - **Force.** Toward the image, that is, toward the nearest part of the wall: $|F| = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2Ra}{(R^2-a^2)^2}$. At the center ($a\to0$) it vanishes: the image runs off to infinity, and its field at the center, $\dfrac{|q'|}{4\pi\varepsilon_0b^2} = \dfrac{qa}{4\pi\varepsilon_0R^3}$, goes to zero.
          - **Isolated, neutral shell instead.** The inner surface still carries $-q$, and the outer surface carries $+q$, spread uniformly. Inside, $V$ shifts by a constant; the field in the cavity is unchanged.
        `, { shell: { svg: FSH, cap: md`A charge inside a grounded spherical shell.` }, shellimg: { svg: fShellImg(), cap: md`The image is outside: $q' = -\tfrac Raq$ at $b = R^2/a>R$. The dashed circle (the inner wall) is at $V=0$.` } }),

        Q(md`A charge $q$ is inside a grounded spherical shell. What are the region of interest and its boundary condition?`,
          [md`Region $r\ge R$; $V(R)=0$ and $V(\infty)=0$`, md`Region $r\le R$; $\vb E = 0$ at $r=R$`, md`Region $r\le R$; $V(R)=0$`, md`All space; $V(R)=0$`], 2,
          [md`The charge is inside; the outside of a grounded shell is shielded and has nothing to do with the field in the cavity.`,
            md`$\vb E=0$ inside the metal, not at its surface: on the inner wall $\vb E = (\sigma/\varepsilon_0)\uv n$.`,
            null,
            md`The image formula is only valid in the cavity; in the metal and outside, $V=0$.`],
          md`The cavity $r\le R$ is bounded by the grounded wall alone, so the one condition $V(R)=0$, plus the charge $q$ inside, fixes $V$ uniquely there.`,
          { figHtml: FSH }),

        Q(md`Where does the image go for a charge **inside** a grounded shell?`,
          [md`Inside the shell, at $b = \dfrac{R^2}{a}$`, md`At the mirror point $2R-a$ across the wall`, md`At the center`, md`Outside the shell, at $b = \dfrac{R^2}{a}>R$`], 3,
          [md`With $a<R$, $\dfrac{R^2}{a}>R$: it is outside. It has to be, since the region of interest is the inside.`,
            md`That is the flat-mirror guess. A curved wall needs the inversion point $R^2/a$, with a different size $q' = -\dfrac Raq$.`,
            md`A center charge gives a constant on the sphere and can't cancel $q$'s varying potential.`,
            null],
          md`Same formulas, opposite roles: $b = \dfrac{R^2}{a}$ is outside when $a<R$, which is exactly what the starred rule requires for a region of interest inside.`,
          { figHtml: FSH }),

        Q(md`How big is the image for a charge inside the shell?`,
          [md`$|q'| = q$`, md`$|q'| = \dfrac Raq$, larger than $q$`, md`$|q'| = \dfrac aRq$, smaller than $q$`, md`$|q'| = 0$, since the shell shields`], 1,
          [md`Only for a flat wall (the limit $a\to R$) is the image the same size.`,
            null,
            md`The ratio is $R/a$ in both the outside and the inside problems; inside, $a<R$ makes it bigger than 1.`,
            md`The shell shields the outside from $q$, not the inside from the wall's induced charge.`],
          md`$q' = -\dfrac Raq$ with $\dfrac Ra>1$: a larger image, farther away. It needs to be larger because it is farther from the wall than $q$ is.`,
          { figHtml: FSH }),

        Q(md`How much charge sits on the **inner** surface of the grounded shell?`,
          [md`$-\dfrac Raq$, the image charge`, md`$0$`, md`$-q\,\dfrac{R-a}{R}$`, md`$-q$`], 3,
          [md`The image is outside the Gaussian surface that matters here. Draw the surface inside the metal: it encloses $q$ and the inner-surface charge.`,
            md`The field inside the metal is zero, so the enclosed total must be zero: the inner surface cancels $q$.`,
            md`The inner surface's total doesn't depend on where $q$ is; only its distribution does.`,
            null],
          md`Gaussian surface inside the metal: $\vb E=0$, so $q + Q_{\text{inner}} = 0$. Here the induced charge is **not** equal to the image charge, unlike the outside problem. Which charge equals what depends on which charges your Gaussian surface encloses.`,
          { figHtml: FSH }),

        Q(md`Which way is the force on a charge inside a grounded shell (not at the center)?`,
          [md`Toward the nearest part of the wall`, md`Toward the center`, md`Zero, because the shell shields the inside`, md`Toward the farthest part of the wall`], 0,
          [null,
            md`The induced charge is densest on the nearest part of the wall and attracts $q$ toward it. The center is an unstable balance point.`,
            md`The shell shields the **outside** from $q$. Inside, $q$ feels its own induced charge.`,
            md`The image, and the densest induced charge, are on the near side.`],
          md`The image is outside on the same side as $q$, so it pulls $q$ outward, toward the nearest wall: $|F| = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2Ra}{(R^2-a^2)^2}$. At $a=0$ it is zero, and it grows as $q$ nears the wall.`,
          { figHtml: FSH }),

        Q(md`For the charge inside the shell, which way does $\uv n$ point in $\sigma = -\varepsilon_0\,\partial V/\partial n$ on the inner surface?`,
          [md`$+\uv r$, outward`, md`Along the surface`, md`$-\uv r$, into the cavity`, md`From the surface point toward $q$`], 2,
          [md`$+\uv r$ points into the metal here. With it, $\sigma$ would come out positive under a positive $q$, which is backwards.`,
            md`The normal is perpendicular to the surface.`,
            null,
            md`$\uv n$ is the surface normal; it doesn't depend on where $q$ is.`],
          md`Out of the metal, into the field region: here the field region is the cavity, so $\uv n = -\uv r$ and $\sigma = +\varepsilon_0\,\partial V/\partial r|_R$. That gives the negative $\sigma(\theta) = -\dfrac{q(R^2-a^2)}{4\pi R(R^2+a^2-2aR\cos\theta)^{3/2}}$.`,
          { figHtml: FSH }),

        Q(md`The shell around the charge is **isolated and neutral** instead of grounded. What happens to the field inside the cavity?`,
          [md`It changes, because the inner surface now carries less charge`, md`Nothing changes; only the potential inside shifts by a constant`, md`It becomes zero`, md`It doubles`], 1,
          [md`The inner surface still carries $-q$ (Gauss's law in the metal). The extra $+q$ goes to the outer surface, spread uniformly.`,
            null,
            md`The inner surface charge can't screen $q$ from the cavity it's in.`,
            md`The outer surface's uniform $+q$ produces no field inside the shell.`],
          md`A uniform charge on the outer surface makes a constant potential inside, so the cavity field is unchanged. The only difference: the whole inside sits at $\dfrac{q}{4\pi\varepsilon_0R_{\text{out}}}$ higher than for the grounded shell, and now there is a field $\dfrac{q}{4\pi\varepsilon_0r^2}$ outside.`,
          { figHtml: fShell({ lab: 'Q=0' }) }),

        P({
          title: 'A charge halfway to the wall of a grounded shell',
          q: md`
            A charge $q$ is at a distance $a = R/2$ from the center of a grounded spherical shell of inner radius $R$.

            Find the image charge and its distance from the center, the total charge on the inner surface, the force on $q$, and $\sigma$ at the point of the wall nearest $q$.
          `,
          figHtml: fShell({ A: 0.5 }),
          hints: [
            md`Region $r\le R$; boundary condition $V(R)=0$. The formulas $q' = -\dfrac Raq$, $b = \dfrac{R^2}{a}$ still apply, with $a<R$.`,
            md`Inner-surface charge: Gauss's law inside the metal. Force: Coulomb between $q$ and $q'$, distance $b-a$.`,
            md`$\sigma(\theta) = -\dfrac{q(R^2-a^2)}{4\pi R(R^2+a^2-2aR\cos\theta)^{3/2}}$; at $\theta=0$ the bracket is $(R-a)^2$.`,
          ],
          parts: [
            { lbl: md`$q'$`, expr: '-2*q', vars: { q: [1, 3] } },
            { lbl: md`$b$`, expr: '2*R', vars: { R: [1, 3] } },
            { lbl: md`$Q_{\text{inner}}$`, expr: '-q', vars: { q: [1, 3] } },
            { lbl: md`$|F|$ in units of $\dfrac{q^2}{4\pi\varepsilon_0R^2}$`, ans: 0.8889 },
            { lbl: md`$\sigma$ at the nearest point, in units of $q/R^2$`, ans: -0.4775 },
          ],
          sol: md`
            **Region of interest:** the cavity $r\le R$, containing only $q$.

            **Boundary condition:**

            1. $V(R)=0$ (the grounded wall is the whole boundary of the cavity).

            **Image.** $q' = -\dfrac{R}{R/2}q = -2q$ at $b = \dfrac{R^2}{R/2} = 2R$, outside the shell. Check at $\theta=0$: distances $R/2$ and $R$: $\dfrac{q}{R/2} - \dfrac{2q}{R} = 0$. At $\theta=\pi$: $\dfrac{3R}{2}$ and $3R$: $\dfrac{q}{3R/2} - \dfrac{2q}{3R} = 0$. The distance ratio is $1:2$ all around the wall, so condition 1 holds everywhere, and the image is outside the cavity.

            [[fig:img]]

            **Inner-surface charge.** Gauss's law inside the metal: $Q_{\text{inner}} = -q$ (not $-2q$).

            **Force.** $q$ and $q'$ are $2R - R/2 = \tfrac32R$ apart: $|F| = \dfrac{q\cdot2q}{4\pi\varepsilon_0(3R/2)^2} = \dfrac89\,\dfrac{q^2}{4\pi\varepsilon_0R^2}$, toward the near wall. Formula check: $\dfrac{R\cdot R/2}{(R^2-R^2/4)^2} = \dfrac{1/2}{9/16}\dfrac{1}{R^2} = \dfrac89\dfrac1{R^2}$.

            **Surface charge at the nearest point.** $R^2-a^2 = \tfrac34R^2$ and $(R-a)^3 = \tfrac18R^3$:

            $$\sigma(0) = -\frac{q\cdot\tfrac34R^2}{4\pi R\cdot\tfrac18R^3} = -\frac{6q}{4\pi R^2} = -\frac{3q}{2\pi R^2}\approx-0.477\,\frac{q}{R^2}.$$

            **Check.** A uniform spread of $-q$ would give $-\dfrac{q}{4\pi R^2}\approx-0.080\,\dfrac{q}{R^2}$; the near side holds six times that.
          `,
          figs: { img: { svg: fShellImg({ A: 0.5 }), cap: md`$a=R/2$: the image $-2q$ sits at $2R$, outside the shell.` } },
        }),

        RF(md`
          !!key Patterns to remember
            - Translate the words: grounded $\to V=0$; held at $V_0\to V=V_0$; isolated with charge $Q\to$ equipotential with total charge $Q$ (neutral: $Q=0$). Plus $V\to0$ at infinity for the outside region.
            - Sphere with $q$ outside: start from the grounded pair ($q'$ at $R^2/a$), then add a center charge: $+\dfrac Raq$ (neutral), $4\pi\varepsilon_0RV_0$ (held at $V_0$), $Q+\dfrac Raq$ (charge $Q$).
            - A neutral sphere still attracts $q$ (like $1/a^5$ far away); a like-charged sphere repels far away and attracts close in.
            - Charge inside a grounded shell: the region is the cavity; image $-\dfrac Raq$ at $R^2/a$, **outside**; inner-surface charge $-q$ (not $q'$); force toward the nearest wall; $\uv n = -\uv r$ for $\sigma$.
        `),
      ],
    });
  }

  // ================================================================ Lesson 8: the recipe and mixed practice
  {
    const FSa = fSphere();
    LESSONS.push({
      id: 'u5-recipe', title: 'The exam recipe and mixed practice',
      steps: [
        RF(md`
          ### The recipe

          !!method Image problems in six steps
            1. **The conductor and its condition.** Translate the words: grounded $\to V=0$; held at $V_0\to V=V_0$; isolated with total charge $Q$ (neutral: $Q=0$) $\to$ an equipotential carrying total charge $Q$.
            2. **Region of interest and boundary conditions.** Name the region where you want $V$ (the side of the metal where the real charge is). Write the conditions as a numbered list: the conductor's condition on each of its surfaces, and $V\to0$ at infinity if the region reaches infinity.
            3. **Place images outside the region.** Plane: mirror point, opposite sign. Several planes: keep reflecting (wedges of angle $\pi/n$ only). Sphere: $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$, then a center charge for the sphere's condition.
            4. **Verify every condition.** Evaluate $V$ on each conductor at a couple of easy points (the foot of the charge; the near and far points of a sphere). Make sure no image is in the region.
            5. **Compute what's asked.** $V$ = sum over real and image charges, valid only in the region. $\vb E = -\nabla V$. $\sigma = -\varepsilon_0\,\partial V/\partial n$ with $\uv n$ out of the metal into the region. Total induced charge from Gauss's law. Force on a real charge: Coulomb forces from the images and the other real charges, never from itself.
            6. **Energy.** For a charge near grounded or neutral conductors, $W = \tfrac12\,q\,V_{\text{images}}(q)$, or $W = -\displaystyle\int_\infty\vb F\cdot d\vb l$. Never the energy of the image system. (A conductor with charge $Q_c$ at potential $V_c$ adds $\tfrac12Q_cV_c$.)

          ### The results in one table

          | Setup | Images | Total induced charge | Force on $q$ |
          |---|---|---|---|
          | grounded plane, $q$ at height $d$ | $-q$ at the mirror point | $-q$ | $\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$, attractive |
          | line $\lambda$ at height $d$ | $-\lambda$ at the mirror line | $-\lambda$ per length | $\dfrac{\lambda^2}{4\pi\varepsilon_0d}$ per length |
          | grounded $90^\circ$ corner, $q$ at $(a,b)$ | $-q$, $-q$, $+q$ (checkerboard) | $-q$ | vector sum, toward the corner |
          | grounded wedge of angle $\pi/n$ | $2n-1$, alternating in sign | $-q$ | vector sum |
          | two parallel grounded planes | an infinite row | $-q\left(1-\tfrac dL\right)$ and $-q\,\tfrac dL$ | a converging series |
          | grounded sphere, $q$ outside at $a$ | $-\dfrac Raq$ at $\dfrac{R^2}{a}$ | $-\dfrac Raq$ | $\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2}$, attractive |
          | isolated neutral sphere | add $+\dfrac Raq$ at the center | $0$ | $\dfrac{q^2}{4\pi\varepsilon_0}\left(\dfrac Ra\right)^3\dfrac{2a^2-R^2}{(a^2-R^2)^2}$, attractive |
          | sphere held at $V_0$ | add $4\pi\varepsilon_0RV_0$ at the center | $4\pi\varepsilon_0RV_0 - \dfrac Raq$ | sum over both images |
          | grounded shell, $q$ inside at $a$ | $-\dfrac Raq$ at $\dfrac{R^2}{a}$, outside | $-q$ on the inner surface | $\dfrac{q^2Ra}{4\pi\varepsilon_0(R^2-a^2)^2}$, toward the wall |

          **Sanity checks that catch most mistakes:** $V=0$ at two points of each grounded conductor; images outside the region; units ($\dfrac{q^2}{4\pi\varepsilon_0\cdot\text{length}^2}$ for a force); limits ($a\to R$ gives the plane; $a\to\infty$ gives nothing); signs (a charge is always attracted to a grounded or neutral conductor); the factor $\tfrac12$ in the energy.
        `),

        Q(md`Which of these setups can **not** be solved exactly with image charges? (All conductors grounded or at the potential shown.)

          [[fig:four]]`,
          [md`(A) the cube`, md`(B) the sphere`, md`(C) the $45^\circ$ wedge`, md`(D) the infinite plane held at $V_0$`], 0,
          [null,
            md`The sphere works: $q' = -\dfrac Raq$ at $\dfrac{R^2}{a}$.`,
            md`$45^\circ = 180^\circ/4$, so 7 images do it.`,
            md`Add the constant $V_0$ to the grounded-plane solution.`],
          md`Images work only for special shapes: planes, wedges of angle $\pi/n$, spheres (and combinations built from them, like a hemisphere on a plane). A cube has edges and corners that no finite set of point images can make into an equipotential. For a cube you'd need numerical methods or separation of variables (next unit).`,
          { figs: { four: { svg: fFourSetups(), cap: md`Four grounded setups.` } } }),

        Q(md`A charge $q$ is a distance $4R$ from the center of a grounded sphere of radius $R$. What is the total charge on the sphere?`,
          [md`$-q$`, md`$-\dfrac q4$`, md`$-\dfrac{q}{16}$`, md`$0$`], 1,
          [md`That is the plane's answer. A sphere intercepts only a fraction $R/a$ of $q$'s field lines.`,
            null,
            md`$\dfrac{R^2}{a^2}$ is not the ratio; the image is $-\dfrac Raq$.`,
            md`The sphere is grounded, so it can pick up charge from the earth.`],
          md`$Q = q' = -\dfrac Raq = -\dfrac q4$. Quick check: $V(\text{center}) = \dfrac{q}{4\pi\varepsilon_0(4R)} + \dfrac{Q}{4\pi\varepsilon_0R} = 0$.`,
          { figHtml: fSphere({ A: 4, Rp: 36 }) }),

        Q(md`A solution writes the energy of $q$ and a grounded sphere as $W = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q\,q'}{a-b}$. What's wrong?`,
          [md`The distance should be $a-R$`, md`The sign should be positive`, md`It is missing a factor $\tfrac12$: the image is not a charge you had to assemble`, md`Nothing`], 2,
          [md`$a-b$ is the right distance between $q$ and its image.`,
            md`$q'$ has the opposite sign to $q$, so the energy is negative, as it should be for an attraction.`,
            null,
            md`This is the energy of two real charges; the real system has half.`],
          md`$W = \tfrac12\,qV_{q'}(a) = -\dfrac{q^2R}{8\pi\varepsilon_0(a^2-R^2)}$. Check with $F = -dW/da$: the full image energy would give twice the true force.`,
          { figHtml: FSa }),

        Q(md`A solution for the plane writes $\sigma = +\varepsilon_0\,\partial V/\partial z$ at $z=0$ and finds $\sigma>0$ under a positive charge. What went wrong?`,
          [md`It forgot the image charge`, md`The potential should be negative above the plane`, md`Nothing: $\sigma$ is positive there`, md`It used $\uv n = -\uv z$, pointing into the metal; $\uv n$ must point out of the metal, $+\uv z$`], 3,
          [md`With the image or without, the sign comes from the choice of $\uv n$.`,
            md`$V>0$ above the plane; that part is fine.`,
            md`A positive charge attracts negative charge: $\sigma<0$.`,
            null],
          md`$\sigma = -\varepsilon_0\,\partial V/\partial n$ with $\uv n = +\uv z$ gives $\sigma = -\varepsilon_0\,\partial V/\partial z<0$, because $V$ increases going up from the plane.`,
          { figHtml: FP }),

        Q(md`Start from a grounded sphere with $q$ outside it. Which change leaves the field **outside** the sphere unchanged?`,
          [md`Cutting the ground wire, so the sphere is isolated with the charge $-\dfrac Raq$ it already has`, md`Making the sphere neutral`, md`Holding the sphere at $V_0\ne0$`, md`Giving the sphere an extra charge $Q$`], 0,
          [null,
            md`Neutral needs an extra $+\dfrac Raq$ at the center, which changes the field outside.`,
            md`That adds $4\pi\varepsilon_0RV_0$ at the center.`,
            md`That adds $Q$ at the center.`],
          md`After the cut, the old solution still satisfies all the new conditions (isolated, equipotential, total charge $-\dfrac Raq$), so by uniqueness it is still the solution. The other three change the sphere's total charge, which adds a center image.`,
          { figHtml: fSphere({ ground: true }) }),

        Q(md`Keep the gap $d = a - R$ between $q$ and the sphere fixed and let $R\to\infty$. What do the grounded-sphere results become?`,
          [md`Everything goes to zero`, md`The grounded-plane results for a charge at height $d$`, md`The neutral-sphere results`, md`A point charge with no conductor`], 1,
          [md`The force $\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2}\to\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$, which is finite.`,
            null,
            md`The sphere is still grounded; nothing about its charge condition changes.`,
            md`The conductor is still there, right next to the charge.`],
          md`With $a = R+d$: $a^2-R^2 = d(2R+d)\approx2Rd$, $q'\to-q$, and $a-b\approx2d$. Force $\to\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$, energy $\to-\dfrac{q^2}{16\pi\varepsilon_0d}$: a big sphere seen from close by is a plane.`,
          { figHtml: FSa }),

        Q(md`A Gaussian surface hugs the outside of the grounded sphere but does not enclose $q$. How much charge does it enclose?`,
          [md`$-q$`, md`$0$`, md`$q' = -\dfrac Raq$`, md`$q + q'$`], 2,
          [md`That would mean all of $q$'s field lines end on the sphere; they don't.`,
            md`The sphere is grounded and carries induced charge.`,
            null,
            md`The surface doesn't enclose $q$.`],
          md`On that surface the real field equals the image system's field, and in the image system the surface encloses just $q'$. So the real sphere carries $q'$. (For a charge **inside** a shell, the useful Gaussian surface is in the metal and encloses $q$ instead, giving $-q$ on the inner wall.)`,
          { figHtml: FSa }),

        Q(md`For which of these is the energy **not** just $\tfrac12\,q\,V_{\text{images}}(q)$?`,
          [md`$q$ near a grounded plane`, md`$q$ near a grounded sphere`, md`$q$ near an isolated, neutral sphere`, md`$q$ near a sphere held at $V_0\ne0$ by a battery`], 3,
          [md`The plane is at $V=0$, so its term $\tfrac12\int\sigma V\,da$ vanishes.`,
            md`The grounded sphere is at $V=0$: its term vanishes.`,
            md`The neutral sphere is at $V\ne0$, but it has total charge $0$, so $\tfrac12Q_cV_c = 0$.`,
            null],
          md`In $W = \tfrac12\sum q_iV_i$ the conductor contributes $\tfrac12Q_cV_c$ (its charge times its constant potential). That is zero when $V_c=0$ (grounded) or $Q_c = 0$ (neutral). For a sphere held at $V_0$ it isn't, and the battery does work as charge flows on and off, so the bookkeeping is different.`,
          { figHtml: fSphere({ lab: 'V=V_0' }) }),

        Q(md`You have placed images for a new geometry. What is the quickest reliable check that they are right?`,
          [md`Evaluate $V$ on each conductor at a couple of easy points, and make sure no image is in the region of interest`, md`Check that the total image charge is $-q$`, md`Check that the force on $q$ is attractive`, md`Compute $\sigma$ everywhere and integrate it`], 0,
          [null,
            md`The total image charge is $-q$ for planes, but not for spheres. It isn't a test of the boundary conditions.`,
            md`An attractive force is necessary, not sufficient: many wrong image sets also attract.`,
            md`That works but is slow, and it checks the total, not the boundary condition.`],
          md`The construction is right exactly when the boundary conditions hold and the region's charge is unchanged. Checking $V$ at the nearest and farthest points of each conductor catches almost every wrong sign, size or position.`,
          { figHtml: fCorner() }),

        Q(md`Which quantity is the **same** in the real problem and in the image problem?`,
          [md`The energy`, md`The force on $q$`, md`The potential inside the metal`, md`The total charge in all of space`], 1,
          [md`The energy is half (plane, sphere) or a quarter (corner) of the image system's.`,
            null,
            md`Inside the metal the real $V$ is the conductor's potential, not the image formula.`,
            md`The image problem has extra charges that don't exist in the real one (though the induced charge mimics them outside the metal).`],
          md`Everything that is determined by the field **in the region of interest** is the same: $V$ there, $\vb E$ there, the force on $q$, and $\sigma$ (from the field just outside the metal). Things that involve the rest of space, like the energy, are not.`,
          { figHtml: FP }),

        Q(md`Which of these **can't** be the size of the force between $q$ and a grounded sphere, just from its units?`,
          [md`$\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2}$`, md`$\dfrac{q^2}{4\pi\varepsilon_0(a-R)^2}$`, md`$\dfrac{q^2R}{4\pi\varepsilon_0(a^2-R^2)}$`, md`$\dfrac{q^2R^3}{4\pi\varepsilon_0a^5}$`], 2,
          [md`$Ra/(\text{length}^4) = 1/\text{length}^2$: a force. (It is in fact the right answer.)`,
            md`$1/\text{length}^2$: dimensionally a force (it's wrong, but units can't tell).`,
            null,
            md`$R^3/a^5 = 1/\text{length}^2$: a force. (It is the neutral sphere's far-away force, up to a factor 2.)`],
          md`$\dfrac{q^2}{4\pi\varepsilon_0}$ times $1/\text{length}^2$ is a force; times $1/\text{length}$ is an energy. $\dfrac{q^2R}{4\pi\varepsilon_0(a^2-R^2)}$ has one power of length too few: it's an energy (twice the true one, in fact). A five-second units check catches many slips.`,
          { figHtml: FSa }),

        Q(md`A charge $q$ sits at the **center** of a grounded spherical shell of radius $R$. Where is its image, and what does the inside look like?`,
          [md`$-q$ at the center, so $V=0$ inside`, md`$-q$ on the shell at $r=R$`, md`$-2q$ at $b=2R$`, md`There is no finite image ($b = R^2/a\to\infty$); the induced charge $-q$ is uniform and $V = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1r - \dfrac1R\right)$ inside`], 3,
          [md`An image at the center would be in the region of interest and would cancel $q$.`,
            md`The induced charge is on the shell, but it is not a point image; by symmetry it's spread uniformly.`,
            md`That is the image for $a = R/2$, not $a=0$.`,
            null],
          md`As $a\to0$, $b = R^2/a\to\infty$ and $q' = -\dfrac Raq\to\infty$, with $q'/b = -q/R$ fixed: the image's potential inside becomes the constant $-\dfrac{q}{4\pi\varepsilon_0R}$ and its field vanishes. So $V = \dfrac{q}{4\pi\varepsilon_0r} - \dfrac{q}{4\pi\varepsilon_0R}$, zero on the wall, with a uniform $\sigma = -\dfrac{q}{4\pi R^2}$.`,
          { figHtml: fShell({ A: 0 }) }),

        P({
          title: 'Exam-style: charge above a grounded plane',
          q: md`
            A point charge $q$ is held at $(0,0,d)$ above an infinite grounded conducting plane, the $xy$ plane.

            (a) State the boundary conditions for the region above the plane.

            (b) Find $V$ at $P = (0,0,d/2)$.

            (c) Find $\sigma$ at the point $S = (\sqrt3\,d,0,0)$ on the plane.

            (d) How much work must you do to move $q$ from $(0,0,d)$ to infinity?
          `,
          figHtml: fPlane({ pts: [[0, 0.5, 'P', 'r'], [1.732, 0, 'S', 'tr']] }),
          hints: [
            md`Region $z\ge0$. The grounded plane fixes $V$ on it; the charge is localized, so $V$ dies far away.`,
            md`Image $-q$ at $(0,0,-d)$. For (b): $P$ is $d/2$ from $q$ and $3d/2$ from the image.`,
            md`(c) $\sigma = \dfrac{-qd}{2\pi(x^2+y^2+d^2)^{3/2}}$. (d) Use the energy $W(h) = -\dfrac{q^2}{16\pi\varepsilon_0h}$, not the two-charge energy.`,
          ],
          parts: [
            { lbl: md`(a) The boundary conditions are`, mc: [md`$V=0$ on $z=0$, and $V\to0$ far away`, md`$V=0$ on $z=0$ only`, md`$\sigma=0$ on $z=0$, and $V\to0$ far away`, md`$\vb E=0$ on $z=0$, and $V\to0$ far away`], a: 0,
              why: [null, md`Without the condition at infinity you could add $E_0z$ and still have $V=0$ on the plane.`, md`The plane carries induced charge; grounded fixes $V$, not $\sigma$.`, md`$\vb E=0$ inside the metal, not on its surface.`] },
            { lbl: md`(b) $V(P)$`, expr: 'q/(3*pi*eps0*d)', vars: { q: [1, 3], eps0: [0.5, 2], d: [1, 3] }, accepts: ['4*q/(3*4*pi*eps0*d)'] },
            { lbl: md`(c) $\sigma(S)$`, expr: '-q/(16*pi*d^2)', vars: { q: [1, 3], d: [1, 3] } },
            { lbl: md`(d) $W_{\text{you}}$`, expr: 'q^2/(16*pi*eps0*d)', vars: { q: [1, 3], eps0: [0.5, 2], d: [1, 3] } },
          ],
          sol: md`
            **(a) Region and boundary conditions.** Region $z\ge0$, containing only $q$.

            1. $V=0$ on $z=0$ (grounded).
            2. $V\to0$ far away.

            **Images.** $-q$ at $(0,0,-d)$. Check: every point of $z=0$ is equidistant from $\pm q$, so condition 1 holds; both terms die far away, so condition 2 holds; the image is below the plane.

            [[fig:img]]

            **(b)** $\srm_+ = d/2$, $\srm_- = 3d/2$:

            $$V(P) = \frac{q}{4\pi\varepsilon_0}\left(\frac2d - \frac{2}{3d}\right) = \frac{q}{4\pi\varepsilon_0}\cdot\frac{4}{3d} = \frac{q}{3\pi\varepsilon_0d}.$$

            **(c)** $x^2+y^2 = 3d^2$, so $(x^2+y^2+d^2)^{3/2} = 8d^3$:

            $$\sigma(S) = \frac{-qd}{2\pi\cdot8d^3} = -\frac{q}{16\pi d^2},$$

            an eighth of the peak value under the charge.

            **(d)** $W_{\text{you}} = W(\infty) - W(d) = 0 - \left(-\dfrac{q^2}{16\pi\varepsilon_0d}\right) = \dfrac{q^2}{16\pi\varepsilon_0d}$. (The two-charge energy would give twice this.)

            **Checks.** $V(P)>0$ and less than $q$'s own $\dfrac{q}{4\pi\varepsilon_0(d/2)}$. $\sigma<0$ under a positive charge. The work is positive: you pull against an attraction.
          `,
          figs: { img: { svg: fPair({ pt: [0, 0.5, 'P'] }), cap: md`The image pair; $P$ is on the axis between $q$ and the plane.` } },
        }),

        P({
          title: 'Exam-style: a charge close to a grounded sphere',
          q: md`
            A charge $q$ is a distance $a = \tfrac32R$ from the center of a grounded conducting sphere of radius $R$.

            Find the image (size and position), the force on $q$ (units $\dfrac{q^2}{4\pi\varepsilon_0R^2}$, positive = away from the sphere), the energy (units $\dfrac{q^2}{4\pi\varepsilon_0R}$), and $\sigma$ at the point of the sphere nearest $q$ (units $q/R^2$). Then compare the force with what a flat grounded plane would give at the same gap.
          `,
          figHtml: fSphere({ A: 1.5, Rp: 52 }),
          hints: [
            md`Conditions: region $r\ge R$; $V(R)=0$; $V\to0$ at infinity. $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$.`,
            md`Force: Coulomb at distance $a-b$. Energy: $\tfrac12\,q\,V_{q'}(a)$. $\sigma(0) = -\dfrac{q(a+R)}{4\pi R(a-R)^2}$.`,
            md`For the plane: the gap is $d = a - R = R/2$, and the plane's force is $\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$.`,
          ],
          parts: [
            { lbl: md`$q'$`, expr: '-2*q/3', vars: { q: [1, 3] } },
            { lbl: md`$b$`, expr: '2*R/3', vars: { R: [1, 3] } },
            { lbl: md`$F$`, ans: -0.96 },
            { lbl: md`$W$`, ans: -0.4 },
            { lbl: md`$\sigma$ at the nearest point`, ans: -0.7958 },
            { lbl: md`The plane approximation's force, same units`, ans: -1 },
          ],
          sol: md`
            **Region of interest:** $r\ge R$.

            **Boundary conditions:**

            1. $V(R)=0$.
            2. $V\to0$ at infinity.

            **Image.** $q' = -\dfrac{R}{3R/2}q = -\dfrac23q$ at $b = \dfrac{R^2}{3R/2} = \dfrac23R$. Check at the near point: $\dfrac{q}{R/2} - \dfrac{2q/3}{R/3} = 2\dfrac qR - 2\dfrac qR = 0$. At the far point: $\dfrac{q}{5R/2} - \dfrac{2q/3}{5R/3} = 0$. Those check condition 1; condition 2 holds since every term dies at infinity.

            [[fig:img]]

            **Force.** $a-b = \tfrac32R - \tfrac23R = \tfrac56R$: $F = \dfrac{q(-2q/3)}{4\pi\varepsilon_0(5R/6)^2} = -\dfrac23\cdot\dfrac{36}{25}\,\dfrac{q^2}{4\pi\varepsilon_0R^2} = -\dfrac{24}{25}\,\dfrac{q^2}{4\pi\varepsilon_0R^2}$.

            **Energy.** $W = -\dfrac{q^2R}{8\pi\varepsilon_0(a^2-R^2)} = -\dfrac{q^2R}{8\pi\varepsilon_0\cdot\tfrac54R^2} = -\dfrac25\,\dfrac{q^2}{4\pi\varepsilon_0R}$.

            **Surface charge.** $\sigma(0) = -\dfrac{q(a+R)}{4\pi R(a-R)^2} = -\dfrac{q\cdot\tfrac52R}{4\pi R\cdot\tfrac14R^2} = -\dfrac{5}{2\pi}\,\dfrac{q}{R^2}\approx-0.796\,\dfrac{q}{R^2}$.

            **Plane comparison.** Gap $d = R/2$: $F_{\text{plane}} = -\dfrac{q^2}{4\pi\varepsilon_0(2d)^2} = -\dfrac{q^2}{4\pi\varepsilon_0R^2}$. The sphere pulls slightly less ($0.96$): its surface curves away from $q$, and the image is only $\tfrac23q$.

            **Why this works.** At a gap of half a radius the sphere already looks fairly flat to $q$. As $a\to R$ the two answers agree exactly.
          `,
          figs: { img: { svg: fSphereImg({ A: 1.5, Rp: 60 }), cap: md`$a = \tfrac32R$: image $-\tfrac23q$ at $\tfrac23R$.` } },
        }),

        P({
          title: 'Exam-style: a hemispherical bump on a grounded plane',
          q: md`
            A grounded conducting plane has a hemispherical bump of radius $R$ on it (also grounded, part of the same conductor). A charge $q$ is on the symmetry axis, a distance $a$ from the center of the hemisphere.

            (a) Which set of images works?

            (b) For $a=2R$, find the force on $q$ in units of $\dfrac{q^2}{4\pi\varepsilon_0R^2}$ (positive = away from the plane).
          `,
          figHtml: fBoss(),
          hints: [
            md`Region: above the plane and outside the bump. Conditions: $V=0$ on the flat part, $V=0$ on the hemisphere, $V\to0$ far away.`,
            md`Make the sphere $r=R$ an equipotential with the sphere image of $q$. Then make the plane an equipotential by mirroring **everything** (both $q$ and its sphere image) in the plane.`,
            md`Check: the mirrored pair ($-q$ at $-a$, $+\tfrac Raq$ at $-R^2/a$) is itself a sphere-image pair, so it also gives $V=0$ on the sphere.`,
          ],
          parts: [
            { lbl: md`(a) The images are`,
              mc: [md`$-\tfrac Raq$ at $z=\tfrac{R^2}{a}$, $+\tfrac Raq$ at $z=-\tfrac{R^2}{a}$, and $-q$ at $z=-a$`, md`$-\tfrac Raq$ at $z=\tfrac{R^2}{a}$ only`, md`$-q$ at $z=-a$ only`, md`$-\tfrac Raq$ at $z=\tfrac{R^2}{a}$ and $-q$ at $z=-a$`], a: 0,
              why: [null, md`The sphere image alone leaves the flat part of the plane at $V\ne0$.`, md`The mirror image alone leaves the bump at $V\ne0$.`, md`Then the plane isn't a bisector of $\pm$ pairs: the image $-\tfrac Raq$ has no partner across the plane, so $V\ne0$ on the flat part.`] },
            { lbl: md`(b) $F$ at $a=2R$`, ans: -0.2047 },
          ],
          sol: md`
            **Region and boundary conditions.** The region above the plane and outside the bump.

            1. $V=0$ on the flat part of the plane.
            2. $V=0$ on the hemisphere.
            3. $V\to0$ far away.

            **(a) Images.** Start with the sphere image of $q$: $-\dfrac Raq$ at $z = \dfrac{R^2}{a}$. Then mirror both $q$ and that image in the plane: $-q$ at $z=-a$ and $+\dfrac Raq$ at $z=-\dfrac{R^2}{a}$.

            [[fig:img]]

            **Check.** The plane $z=0$ is the perpendicular bisector of two $\pm$ pairs ($q$ with $-q$; $-\tfrac Raq$ with $+\tfrac Raq$): condition 1. On the sphere $r=R$, $q$ and $-\tfrac Raq$ cancel (the sphere result), and so do $-q$ at $-a$ and $+\tfrac Raq$ at $-R^2/a$ (the sphere result again, with $q\to-q$): condition 2. All images are inside the sphere or below the plane, outside the region. Everything dies far away: condition 3.

            **(b)** With $a = 2R$: images $-\tfrac q2$ at $\tfrac R2$, $+\tfrac q2$ at $-\tfrac R2$, $-q$ at $-2R$. Distances from $q$: $\tfrac32R$, $\tfrac52R$, $4R$. In units of $\dfrac{q^2}{4\pi\varepsilon_0R^2}$:

            $$F = -\frac12\cdot\frac49 + \frac12\cdot\frac{4}{25} - \frac{1}{16} = -\frac29 + \frac2{25} - \frac1{16} = -\frac{737}{3600}\approx-0.205.$$

            **Checks.** Without the bump, the plane alone gives $-\tfrac1{16}\approx-0.06$ at $a=2R$. The bump reaches toward $q$, so the pull is stronger. The total induced charge is $-q$ (the sum of the images), since the conductor extends to infinity like a plane.
          `,
          figs: { img: { svg: fBossImg(), cap: md`The three images: $q' = -\tfrac Raq$ at $R^2/a$, its mirror $-q'$ at $-R^2/a$, and $-q$ at $-a$. The dashed arc is the bump's surface.` } },
        }),

        P({
          title: 'Exam-style: cut the wire, then move the charge',
          q: md`
            A charge $q$ sits at a distance $4R$ from the center of a grounded conducting sphere of radius $R$.

            (a) What is the charge on the sphere?

            (b) The ground wire is cut, with $q$ held in place. What is the sphere's potential right after the cut?

            (c) Then $q$ is carried far away. What are the sphere's final charge and potential?
          `,
          figHtml: fSphere({ A: 4, Rp: 36, ground: true }),
          hints: [
            md`(a) Grounded: conditions $V(R)=0$, $V\to0$ at infinity; the induced charge equals the image charge.`,
            md`(b) After the cut the sphere is isolated with the charge it had. Does the old solution still satisfy the new conditions?`,
            md`(c) With $q$ gone, an isolated sphere with total charge $Q$ spreads it uniformly: $V = \dfrac{Q}{4\pi\varepsilon_0R}$.`,
          ],
          parts: [
            { lbl: md`(a) $Q$`, expr: '-q/4', vars: { q: [1, 3] } },
            { lbl: md`(b) $V_{\text{sphere}}$ right after the cut`, ans: 0 },
            { lbl: md`(c) final $Q$`, expr: '-q/4', vars: { q: [1, 3] } },
            { lbl: md`(c) final $V_{\text{sphere}}$`, expr: '-q/(16*pi*eps0*R)', vars: { q: [1, 3], eps0: [0.5, 2], R: [1, 3] }, accepts: ['-(q/4)/(4*pi*eps0*R)'] },
          ],
          sol: md`
            **(a)** Region of interest: $r\ge R$. Boundary conditions while grounded:

            1. $V(R)=0$.
            2. $V\to0$ at infinity.

            Image $q' = -\dfrac{R}{4R}q = -\dfrac q4$ at $\dfrac R4$ (check at the near point: $\dfrac{q}{3R} - \dfrac{q/4}{3R/4} = 0$), so the sphere carries $Q = -\dfrac q4$.

            **(b)** After the cut the boundary conditions are:

            1. the sphere is an equipotential (value not given);
            2. its total charge is $-\dfrac q4$;
            3. $V\to0$ at infinity.

            The old solution meets all three (its sphere is an equipotential at $0$ carrying $-\dfrac q4$), so by uniqueness nothing changes: $V_{\text{sphere}} = 0$.

            **(c)** The charge is trapped: $Q = -\dfrac q4$. With $q$ gone, it spreads uniformly over the sphere, and

            $$V_{\text{sphere}} = \frac{Q}{4\pi\varepsilon_0R} = -\frac{q}{16\pi\varepsilon_0R}.$$

            **What to remember.** Grounded fixes $V$ and lets $Q$ adjust; isolated fixes $Q$ and lets $V$ adjust. When conditions change, ask what is held fixed.
          `,
        }),

        RF(md`
          !!key Exam checklist
            - Write the region of interest and a **numbered list of boundary conditions** before placing any image. After placing them, **verify each condition** explicitly.
            - Images go outside the region; they are fictitious; the real thing is the induced surface charge.
            - $\sigma = -\varepsilon_0\,\partial V/\partial n$, $\uv n$ out of the metal into the region.
            - Induced charge: plane $-q$; grounded sphere $-\dfrac Raq$; neutral sphere $0$; inner wall of a grounded shell $-q$.
            - Force: images (and other real charges) only. Energy: half rule, never the image-system energy.
            - Limits: sphere $\to$ plane as $a\to R$; nothing as $a\to\infty$.
        `),
      ],
    });
  }

  // @@LESSONS@@

  C.unit({
    id: 'u5', num: 'Unit 5', title: 'The method of images',
    blurb: 'Replace a conductor by fictitious charges placed outside the region: grounded planes, corners and spheres; induced charge, force, and the factor of one half in the energy.',
    lessons: LESSONS,
  });
})();

/* Unit 0 — Vector calculus toolkit (Griffiths Ch. 1). */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  const DEG = Math.PI / 180;

  // ======================================================================
  // drawing helpers
  // ======================================================================
  const fig3 = (ox, oy, s, extra) => PF.fig({ proj: Object.assign({ ox, oy, s }, extra || {}) });
  const pl3 = (g, pts, o) => g.pl(pts.map((p) => g.p3(p[0], p[1], p[2])), o);
  const ar3 = (g, a, b, o) => { const p = g.p3(...a), q = g.p3(...b); return g.arrow(p[0], p[1], q[0], q[1], o); };
  const lab3 = (g, p, t, anchor = 'c', cls = '') => { const q = g.p3(...p); return g.label(q[0], q[1], t, anchor, cls); };
  const tag3 = (g, p, t, at = 'r', gap = 9, cls = '') => { const q = g.p3(...p); return g.tag(q[0], q[1], t, at, gap, cls); };
  const dot3 = (g, p, r = 2.8) => { const q = g.p3(...p); return g.dot(q[0], q[1], r); };
  // points on a circle of radius R about c, in the plane of unit vectors u, v (angles in degrees)
  const circ3 = (c, u, v, R, a0, a1, N = 48) => {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const a = (a0 + (a1 - a0) * i / N) * DEG, ca = Math.cos(a), sa = Math.sin(a);
      pts.push([c[0] + R * (ca * u[0] + sa * v[0]), c[1] + R * (ca * u[1] + sa * v[1]), c[2] + R * (ca * u[2] + sa * v[2])]);
    }
    return pts;
  };
  // horizontal circle of radius R at height z: front half solid, back half dashed (viewer sits near phi = 19 deg)
  const ring3 = (g, R, z, o = {}) => {
    pl3(g, circ3([0, 0, z], [1, 0, 0], [0, 1, 0], R, -71, 109), { cls: o.cls || '' });
    pl3(g, circ3([0, 0, z], [1, 0, 0], [0, 1, 0], R, 109, 289), { cls: (o.backCls || 'dash dim') });
    return g;
  };
  // cubic Bezier through screen points
  const bez = (p0, p1, p2, p3, N = 36) => {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return pts;
  };
  // arrowhead in the middle of a polyline
  const midHead = (f, pts, frac = 0.5, o = {}) => {
    const i = Math.max(1, Math.min(pts.length - 2, Math.round((pts.length - 1) * frac)));
    f.head(pts[i][0], pts[i][1], pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1], o);
    return f;
  };
  // arrow on a straight segment with the head at the middle
  const midArrow = (f, x1, y1, x2, y2, o = {}) => { f.line(x1, y1, x2, y2, o); f.head((x1 + x2) / 2 + (x2 - x1) * 0.08, (y1 + y2) / 2 + (y2 - y1) * 0.08, x2 - x1, y2 - y1, o); return f; };
  // shorten segment a->b by d at the b end
  const shortB = (a, b, d) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [b[0] - (b[0] - a[0]) * d / L, b[1] - (b[1] - a[1]) * d / L]; };
  // out of / into the page symbols
  const outOf = (f, x, y, r = 6) => { f.circle(x, y, r, { cls: 'bgfill' }); f.dot(x, y, 1.8); return f; };
  const into = (f, x, y, r = 6) => { f.circle(x, y, r, { cls: 'bgfill' }); const d = r * 0.62; f.line(x - d, y - d, x + d, y + d, { cls: 'thin' }); f.line(x - d, y + d, x + d, y - d, { cls: 'thin' }); return f; };

  // 2-D vector field in a square frame. fn(x, y) -> [vx, vy] in math axes (y up).
  // o.L half-width (field units), o.S px per unit, o.n arrows per side, o.skip(x,y) leave out, o.extra(f, X, Y) more drawing
  const fieldFig = (fn, o = {}) => {
    const f = PF.fig();
    const L = o.L ?? 2, S = o.S ?? 45, n = o.n ?? 9, m = o.margin ?? 12;
    const X = (x) => x * S, Y = (y) => -y * S;
    f.rect(X(-L) - m, Y(L) - m, 2 * L * S + 2 * m, 2 * L * S + 2 * m, { cls: 'dim thin' });
    f.field((sx, sy) => {
      const x = sx / S, y = -sy / S;
      if (o.skip && o.skip(x, y)) return null;
      const v = fn(x, y);
      return v ? [v[0], -v[1]] : null;
    }, [X(-L), Y(L), X(L), Y(-L)], n, n, { len: o.len ?? 18, mag: o.mag ?? true });
    if (o.triad !== false) { const ox = X(-L) - m - 54, oy = Y(-L) + m; f.axes(ox, oy, { x: [0, 22], y: [0, 22], xl: o.xl || 'x', yl: o.yl || 'y' }); }
    if (o.extra) o.extra(f, X, Y);
    return f.svg();
  };
  const near0 = (r) => (x, y) => Math.hypot(x, y) < r;
  // small oblique axis triad at (ox, oy) for 3-D sketches whose own axes are not drawn
  const triad = (f, ox, oy, L = 24) => {
    f.arrow(ox, oy, ox - 0.344 * L * 1.6, oy + 0.241 * L * 1.6, { cls: 'dim', hs: 5 });
    f.arrow(ox, oy, ox + L, oy, { cls: 'dim', hs: 5 });
    f.arrow(ox, oy, ox, oy - L, { cls: 'dim', hs: 5 });
    f.label(ox - 0.344 * L * 1.6 - 3, oy + 0.241 * L * 1.6 + 2, 'x', 'tr', 'small accent');
    f.label(ox + L + 4, oy, 'y', 'l', 'small accent');
    f.label(ox + 3, oy - L - 2, 'z', 'bl', 'small accent');
    return f;
  };
  // TeX for labels (the size estimator understands \mathbf and \hat, so the overlap audit stays honest)
  const B = (c) => `\\mathbf{${c}}`;
  const H = (c) => `\\hat{\\mathbf{${c}}}`;
  const TH = '\\hat{\\boldsymbol\\theta}', PH = '\\hat{\\boldsymbol\\phi}';

  // ======================================================================
  // Lesson 1 figures: vectors and the separation vector
  // ======================================================================
  const fPos = () => {
    const g = fig3(0, 0, 1);
    g.axes3(125, { Lz: 120 });
    const Pp = [70, 95, 75], F = [70, 95, 0];
    g.l3(Pp, F, { cls: 'dim dash thin' });
    g.l3(F, [70, 0, 0], { cls: 'dim dash thin' });
    g.l3(F, [0, 95, 0], { cls: 'dim dash thin' });
    ar3(g, [0, 0, 0], Pp, { cls: 'thick' });
    dot3(g, Pp, 3);
    tag3(g, Pp, '(x,y,z)', 'r', 12);
    const m = g.p3(35, 47.5, 37.5);
    g.label(m[0] + 1, m[1] + 6, B('r'), 'tl');
    const u1 = [70 * 1.32, 95 * 1.32, 75 * 1.32];
    ar3(g, Pp, u1, { cls: 'dim' });
    tag3(g, u1, H('r'), 'tr', 6);
    return g.svg();
  };
  const fNegZ = () => {
    const f = PF.fig();
    f.axes(0, 0, { x: [-60, 80], y: [-100, 70], xl: 'x', yl: 'z' });
    [25, 50, 75].forEach((y, i) => { f.line(-4, y, 4, y, { cls: 'dim thin' }); f.label(-8, y, String(-(i + 1)), 'r', 'small accent'); });
    f.dot(0, 0, 2.4); f.label(6, -4, 'O', 'bl', 'small');
    f.dot(0, 75, 3.2); f.tag(0, 75, '(0,0,-3)', 'r', 12);
    return f.svg();
  };
  const fDot120 = () => {
    const f = PF.fig();
    const s = 38, bx = 3 * s * Math.cos(120 * DEG), by = -3 * s * Math.sin(120 * DEG);
    f.arrow(0, 0, 2 * s, 0, { cls: 'thick' });
    f.arrow(0, 0, bx, by, { cls: 'thick' });
    f.arc(0, 0, 20, 0, 120, { cls: 'dim' });
    f.label(46 * Math.cos(60 * DEG), -46 * Math.sin(60 * DEG), '120^\\circ', 'c', 'small');
    f.tag(2 * s, 0, B('A'), 'r');
    f.tag(bx, by, B('B'), 'l');
    f.dot(0, 0, 2.2);
    return f.svg();
  };
  const fTriad = () => { const g = fig3(0, 0, 1); g.axes3(85); return g.svg(); };
  const fFlux60 = () => {
    const f = PF.fig();
    f.line(-80, 0, 80, 0, { cls: 'thick' });
    const ux = Math.sin(60 * DEG), uy = -Math.cos(60 * DEG);
    for (const x0 of [-55, -5, 45]) f.arrow(x0 - ux * 36, -uy * 36, x0 + ux * 50, uy * 50, { cls: 'dim' });
    f.arrow(0, 0, 0, -80, { cls: 'thick' });
    f.tag(0, -80, H('n'), 't');
    f.arc(0, 0, 30, 30, 90, { cls: 'dim' });
    f.label(52 * Math.cos(62 * DEG), -52 * Math.sin(62 * DEG), '60^\\circ', 'c', 'small');
    f.tag(45 + ux * 50, uy * 50, B('E'), 'r');
    f.text(-80, 26, 'patch of area A, seen edge-on', 'tl');
    return f.svg();
  };
  const fPara = () => {
    const f = PF.fig(), u = 30;
    for (let i = 0; i <= 5; i++) f.line(i * u, 0, i * u, -4.5 * u, { cls: 'grid nodecl' });
    for (let j = 0; j <= 4; j++) f.line(0, -j * u, 5.5 * u, -j * u, { cls: 'grid nodecl' });
    f.poly([[0, 0], [3 * u, 0], [5 * u, -4 * u], [2 * u, -4 * u]], { cls: 'shade nodecl' });
    f.line(3 * u, 0, 5 * u, -4 * u, { cls: 'dim dash' });
    f.line(2 * u, -4 * u, 5 * u, -4 * u, { cls: 'dim dash' });
    f.arrow(0, 0, 3 * u, 0, { cls: 'thick' });
    f.arrow(0, 0, 2 * u, -4 * u, { cls: 'thick' });
    for (let i = 1; i <= 5; i++) f.label(i * u, 6, String(i), 't', 'small accent');
    for (let j = 1; j <= 4; j++) f.label(-6, -j * u, String(j), 'r', 'small accent');
    f.label(5.5 * u + 6, 0, 'x', 'l', 'small accent');
    f.label(0, -4.5 * u - 4, 'y', 'b', 'small accent');
    f.label(1.5 * u, -8, B('A'), 'b');
    f.label(0.9 * u - 4, -2 * u, B('B'), 'r');
    return f.svg();
  };
  // origin, source charge and field point; o.sr draws the separation vector
  const fSep = (o = {}) => {
    const f = PF.fig();
    const O = [0, 0], q = [70, -62], Pp = [235, -98];
    f.dot(O[0], O[1], 2.6); f.label(O[0] - 5, O[1] + 4, 'O', 'tr', 'small');
    const e1 = shortB(O, q, 9), e2 = shortB(O, Pp, 4);
    f.arrow(O[0], O[1], e1[0], e1[1], { cls: 'dim' });
    f.arrow(O[0], O[1], e2[0], e2[1], { cls: 'dim' });
    f.label(26, -40, `${B('r')}'`, 'br');
    f.label(122, -38, B('r'), 'tl');
    if (o.sr !== false) {
      const a = shortB(Pp, q, 9), b = shortB(q, Pp, 4);
      f.arrow(a[0], a[1], b[0], b[1], { cls: 'thick' });
      f.label(150, -92, md`\sr`, 'b');
    }
    f.charge(q[0], q[1], { q: '+', r: 7 });
    f.text(q[0] - 10, q[1] - 6, 'source point', 'br');
    f.dot(Pp[0], Pp[1], 3.2);
    f.text(Pp[0] + 8, Pp[1], 'field point P', 'l');
    return f.svg();
  };
  const fOrigins = () => {
    const f = PF.fig();
    const O = [0, 0], O2 = [-70, -110], q = [70, -62], Pp = [235, -98];
    for (const [A, cls] of [[O, 'dim'], [O2, 'dim dash']]) {
      const e1 = shortB(A, q, 9), e2 = shortB(A, Pp, 4);
      f.arrow(A[0], A[1], e1[0], e1[1], { cls });
      f.arrow(A[0], A[1], e2[0], e2[1], { cls });
    }
    f.dot(O[0], O[1], 2.6); f.label(O[0] - 5, O[1] + 4, 'O', 'tr', 'small');
    f.dot(O2[0], O2[1], 2.6); f.label(O2[0] - 5, O2[1] - 2, "O'", 'br', 'small');
    f.charge(q[0], q[1], { q: '+', r: 7 });
    f.text(q[0] + 9, q[1] - 9, 'charge', 'bl');
    f.dot(Pp[0], Pp[1], 3.2);
    f.text(Pp[0] + 8, Pp[1], 'field point P', 'l');
    return f.svg();
  };
  const fCircles = () => {
    const f = PF.fig();
    f.circle(0, 0, 45, { cls: 'grid' });
    f.circle(0, 0, 75, { cls: 'grid' });
    const q = [45 * Math.cos(150 * DEG), -45 * Math.sin(150 * DEG)], Pp = [75 * Math.cos(25 * DEG), -75 * Math.sin(25 * DEG)];
    f.line(0, 0, q[0], q[1], { cls: 'dim' });
    f.line(0, 0, Pp[0], Pp[1], { cls: 'dim' });
    f.line(q[0], q[1], Pp[0], Pp[1], { cls: 'dash' });
    f.dot(0, 0, 2.6); f.label(5, 7, 'O', 'tl', 'small');
    f.charge(q[0], q[1], { q: '+', r: 6 });
    f.dot(Pp[0], Pp[1], 3.2); f.tag(Pp[0], Pp[1], 'P', 'r');
    f.label(-24.5, -2.6, '3\\text{ m}', 'tr', 'small');
    f.label(38.2, -6.8, '5\\text{ m}', 'tl', 'small');
    f.label(14.5, -36, md`\srm = ?`, 'b', 'small');
    return f.svg();
  };
  const fRing = () => {
    const g = fig3(0, 0, 1);
    const R = 78, Z = 100;
    g.axes3(118, { Lz: 140 });
    ring3(g, R, 0, { cls: 'thick' });
    const sp = [R * Math.cos(50 * DEG), R * Math.sin(50 * DEG), 0], Pz = [0, 0, Z];
    g.l3([0, 0, 0], sp, { cls: 'dim dash thin' });
    dot3(g, sp, 3); tag3(g, sp, `${B('r')}'`, 'br', 8);
    dot3(g, Pz, 3.2); tag3(g, Pz, `P\\;(z\\,${H('z')})`, 'l', 10);
    const a = g.p3(...sp), b = shortB(a, g.p3(...Pz), 4);
    g.arrow(a[0], a[1], b[0], b[1]);
    const mm = g.p3(sp[0] * 0.5, sp[1] * 0.5, Z * 0.5);
    g.label(mm[0] + 8, mm[1], md`\sr`, 'l');
    return g.svg();
  };
  const fSegment = () => {
    const f = PF.fig();
    const L = 110, Z = 92, xp = 62;
    f.arrow(-L - 30, 0, L + 40, 0, { cls: 'dim', hs: 6 });
    f.label(L + 44, 2, 'x', 'l', 'small accent');
    f.hatchBand([[-L, -3], [L, -3], [L, 3], [-L, 3]]);
    f.line(-L, 0, L, 0, { cls: 'thick' });
    f.line(0, 0, 0, -Z, { cls: 'dim dash thin' });
    f.dim(0, 0, 0, -Z, 'z', { off: -18, at: 'l' });
    f.dot(0, -Z, 3.2); f.tag(0, -Z, 'P', 'r', 10);
    f.dot(xp, 0, 3); f.label(xp, 8, "x'", 't', 'small');
    f.line(xp, 0, 0, -Z, { cls: 'dim' });
    f.label(-L, 8, '-L', 't', 'small accent');
    f.label(L, 8, 'L', 't', 'small accent');
    f.label(0, 8, '0', 't', 'small accent');
    return f.svg();
  };
  const fWex = (withSr) => {
    const g = fig3(0, 0, 18);
    g.axes3(6, { Lx: 5, Ly: 5, Lz: 6.5 });
    g.l3([0, 0, 0], [0, -2.6, 0], { cls: 'dim dash thin' });
    const q = [1, 2, -1], Pp = [3, -1, 5];
    g.l3(q, [1, 2, 0], { cls: 'dim dash thin' });
    g.l3(Pp, [3, -1, 0], { cls: 'dim dash thin' });
    g.charge(...g.p3(...q), { q: '+', r: 6 });
    tag3(g, q, '(1,2,-1)', 'r', 10, 'small');
    dot3(g, Pp, 3.2); tag3(g, Pp, '(3,-1,5)', 'l', 10, 'small');
    if (withSr) { const a = shortB(g.p3(...Pp), g.p3(...q), 8), b = shortB(g.p3(...q), g.p3(...Pp), 4); g.arrow(a[0], a[1], b[0], b[1], { cls: 'thick' }); g.label(8, -36, md`\sr`, 'bl'); }
    return g.svg();
  };
  const fPrac = (withSr) => {
    const g = fig3(0, 0, 16);
    g.axes3(7, { Lx: 6, Ly: 7, Lz: 7.5 });
    const q = [4, 1, 2], Pp = [2, 5, 6];
    for (const p of [q, Pp]) {
      g.l3(p, [p[0], p[1], 0], { cls: 'dim dash thin' });
      g.l3([p[0], p[1], 0], [p[0], 0, 0], { cls: 'dim dash thin' });
      g.l3([p[0], p[1], 0], [0, p[1], 0], { cls: 'dim dash thin' });
    }
    g.charge(...g.p3(...q), { q: '+', r: 6 });
    tag3(g, q, 'q\\;(4,1,2)', 'l', 10, 'small');
    dot3(g, Pp, 3.2); tag3(g, Pp, 'P\\;(2,5,6)', 'r', 10, 'small');
    if (withSr) { const a = shortB(g.p3(...Pp), g.p3(...q), 8), b = shortB(g.p3(...q), g.p3(...Pp), 4); g.arrow(a[0], a[1], b[0], b[1], { cls: 'thick' }); lab3(g, [3, 3, 4.3], md`\sr`, 'br'); }
    return g.svg();
  };

  // ======================================================================
  // Lesson 1: vectors, products and the separation vector
  // ======================================================================
  const L1 = {
    id: 'u0-vectors', title: 'Vectors, products and the separation vector',
    steps: [
      RF(md`
        This unit is the math the whole course runs on: Griffiths Chapter 1, plus the vector calculus that Gauss's law and the curl of $\vb E$ need. The exam's formula sheet lists the curvilinear formulas and the three fundamental theorems, so the goal is to know what each object *means*, when to reach for it, and how to use the sheet without dropping a factor. Physics appears wherever it helps; the physics of Gauss's law is the ECE 329 review.

        ### Components and unit vectors

        A vector has a magnitude and a direction. In Cartesian components

        $$\vb A = A_x\,\uv x + A_y\,\uv y + A_z\,\uv z,\qquad A = |\vb A| = \sqrt{A_x^2+A_y^2+A_z^2}.$$

        A **unit vector** has length 1 and carries only a direction: $\hat{\vb A} = \vb A/A$. You add vectors component by component.

        The **position vector** of the point $(x,y,z)$ runs from the origin to that point:

        $$\vb r = x\,\uv x + y\,\uv y + z\,\uv z,\qquad r = \sqrt{x^2+y^2+z^2},\qquad \uv r = \frac{\vb r}{r}.$$

        [[fig:pos]]

        $\uv r$ points straight away from the origin, so it is a different vector at every point. The infinitesimal step from $(x,y,z)$ to $(x+dx,\,y+dy,\,z+dz)$ is $d\vb l = dx\,\uv x+dy\,\uv y+dz\,\uv z$.
      `, { pos: { svg: fPos(), cap: 'Position vector $\\vb r$ of the point $(x,y,z)$; $\\uv r$ is the unit vector along it.' } }),

      Q(md`What is $\uv r$ at the point $(0,0,-3)$?`,
        [md`$+\uv z$`, md`$-\uv z$`, md`$-3\,\uv z$`, md`$-\tfrac13\,\uv z$`], 1,
        [md`$\uv r$ points away from the origin. Below the origin, "away" is down.`, null,
          md`That is $\vb r$ itself. A unit vector has length 1: divide by $r = 3$.`,
          md`That divides $\vb r$ by $r^2 = 9$. Divide by $r$ once.`],
        md`$\uv r = \vb r/r = (-3\,\uv z)/3 = -\uv z$. It always points straight away from the origin: $+\uv z$ on the positive $z$-axis, $-\uv z$ on the negative $z$-axis. Keep this in mind for later: $\uv r$ is not a constant vector.`,
        { figHtml: fNegZ() }),

      Q(md`What is the unit vector in the direction of $\vb A = 2\,\uv x-\uv y+2\,\uv z$?`,
        [md`$\tfrac19(2\uv x-\uv y+2\uv z)$`, md`$\tfrac15(2\uv x-\uv y+2\uv z)$`, md`$\tfrac13(2\uv x-\uv y+2\uv z)$`, md`$\tfrac{1}{\sqrt3}(\uv x-\uv y+\uv z)$`], 2,
        [md`You divided by $A^2 = 9$. Divide by the magnitude $A = 3$.`,
          md`$2+1+2 = 5$ adds the components. The magnitude is the square root of the sum of their squares.`, null,
          md`Same signs, different direction: the components must keep the ratio $2:-1:2$.`],
        md`$A = \sqrt{2^2+(-1)^2+2^2} = 3$, so $\hat{\vb A} = \tfrac13(2\uv x-\uv y+2\uv z)$. Check: $(4+1+4)/9 = 1$.`,
        { nofig: 'arithmetic on components' }),

      RF(md`
        ### Dot product

        $$\vb A\cdot\vb B = AB\cos\theta = A_xB_x+A_yB_y+A_zB_z$$

        It is a scalar: the length of one vector times the component of the other along it. Positive for an acute angle, zero for perpendicular vectors, negative for an obtuse angle, and $\vb A\cdot\vb A = A^2$. To get the component of any vector along a direction, dot it with that unit vector: $A_n = \vb A\cdot\hat{\vb n}$.

        Every flux ($\vb E\cdot d\vb a$) and every line integral ($\vb E\cdot d\vb l$) in this course is a dot product. It keeps only the part of the field along the area's normal, or along the path.

        ### Cross product

        $$\vb A\times\vb B = AB\sin\theta\;\hat{\vb n} = \begin{vmatrix}\uv x&\uv y&\uv z\\ A_x&A_y&A_z\\ B_x&B_y&B_z\end{vmatrix}$$

        A vector perpendicular to both. Its direction follows the right-hand rule (fingers from $\vb A$ toward $\vb B$, thumb along $\hat{\vb n}$), and its magnitude is the area of the parallelogram the two vectors span. Order matters: $\vb B\times\vb A = -\vb A\times\vb B$, and $\vb A\times\vb A = 0$. For the basis vectors the cyclic order is positive: $\uv x\times\uv y = \uv z$, $\uv y\times\uv z = \uv x$, $\uv z\times\uv x = \uv y$.

        The triple product $\vb A\cdot(\vb B\times\vb C)$ is the volume of the box the three vectors span (up to sign), so it vanishes when they lie in one plane.

        !!intuition Which product measures what
          The dot product measures how *parallel* two vectors are ($\cos\theta$). The cross product measures how *perpendicular* they are ($\sin\theta$). Divergence will turn out to be a "dot" with $\nabla$ and curl a "cross" with $\nabla$, with the same flavour: divergence counts flow straight out, curl counts flow around.
      `),

      Q(md`In the figure $|\vb A| = 2$, $|\vb B| = 3$, and the angle between them is $120^\circ$. What is $\vb A\cdot\vb B$?`,
        [md`$3$`, md`$-3\sqrt3$`, md`$3\sqrt3$`, md`$-3$`], 3,
        [md`Right size, wrong sign: $\cos120^\circ = -\tfrac12$. An obtuse angle gives a negative dot product.`,
          md`That uses $-\sin\theta$. The dot product uses $\cos\theta$.`,
          md`That is $AB\sin\theta = |\vb A\times\vb B|$, the cross product's magnitude.`, null],
        md`$\vb A\cdot\vb B = AB\cos\theta = (2)(3)\cos120^\circ = -3$. It is negative because $\vb B$ has a component pointing *against* $\vb A$: drop a perpendicular from the tip of $\vb B$ to the line of $\vb A$ and it lands behind the origin.`,
        { figHtml: fDot120() }),

      Q(md`Using the right-handed axes shown, what is $\uv x\times\uv z$?`,
        [md`$-\uv y$`, md`$+\uv y$`, md`$+\uv z$`, md`$0$`], 0,
        [null, md`$+\uv y = \uv z\times\uv x$ (cyclic order $x\to y\to z\to x$). Reversing the order flips the sign.`,
          md`A cross product is perpendicular to both factors, so it can't point along $\uv z$.`,
          md`Only parallel vectors have a zero cross product, and $\uv x\perp\uv z$.`],
        md`Cyclic products are positive: $\uv z\times\uv x = \uv y$. $\uv x\times\uv z$ is the reverse order, so it is $-\uv y$. Right-hand check: fingers along $\uv x$ (toward you), curl them toward $\uv z$ (up), and your thumb points left, along $-\uv y$.`,
        { figHtml: fTriad() }),

      Q(md`Two vectors satisfy both $\vb A\cdot\vb B = 0$ and $\vb A\times\vb B = 0$. What can you conclude?`,
        [md`They are perpendicular.`, md`They are parallel.`, md`They are antiparallel.`, md`At least one of them is the zero vector.`], 3,
        [md`Perpendicular gives $\vb A\cdot\vb B = 0$, but then $|\vb A\times\vb B| = AB$, not zero.`,
          md`Parallel kills the cross product, but then $\vb A\cdot\vb B = AB\neq0$.`,
          md`Antiparallel gives $\vb A\cdot\vb B = -AB\ne0$.`, null],
        md`$\vb A\cdot\vb B = AB\cos\theta$ and $|\vb A\times\vb B| = AB\sin\theta$. Since $\cos\theta$ and $\sin\theta$ are never zero together, both vanish only if $AB = 0$.`,
        { nofig: 'reasoning from the definitions' }),

      Q(md`A uniform field $\vb E$ crosses a flat patch of area $A$, making a $60^\circ$ angle with the patch's normal $\hat{\vb n}$ (figure). What is the flux $\vb E\cdot\hat{\vb n}\,A$?`,
        [md`$EA$`, md`$\tfrac{\sqrt3}{2}EA$`, md`$\tfrac12EA$`, md`$0$`], 2,
        [md`That needs $\vb E$ along the normal. Only the normal component gets through.`,
          md`$\sin60^\circ$ gives the component *along* the patch, which carries no flux through it.`, null,
          md`Zero flux needs $\vb E$ to lie in the patch, $90^\circ$ from the normal.`],
        md`Flux keeps the normal component: $EA\cos60^\circ = \tfrac12EA$. This is what $\vb E\cdot d\vb a$ does in Gauss's law: tilt the field away from the normal and fewer field lines pass through.`,
        { figHtml: fFlux60() }),

      Q(md`$\vb A = 3\,\uv x$ and $\vb B = 2\,\uv x+4\,\uv y$ span the parallelogram shown. What is $|\vb A\times\vb B|$?`,
        [md`$12$`, md`$6$`, md`$3\sqrt{20}\approx13.4$`, md`$0$`], 0,
        [null, md`$6$ is $\vb A\cdot\vb B$ (and also the area of the triangle, half the parallelogram).`,
          md`$AB$ is the area only when the vectors are perpendicular. Here the angle is less than $90^\circ$.`,
          md`Zero only for parallel vectors.`],
        md`Area = base × height $= 3\times4 = 12$. The determinant agrees: $(\vb A\times\vb B)_z = A_xB_y-A_yB_x = 12$. Only the part of $\vb B$ perpendicular to $\vb A$ (the $4$) matters, just as only the parallel part matters for the dot product.`,
        { figHtml: fPara() }),

      Q(md`Two unit vectors $\hat{\vb A}$ and $\hat{\vb B}$ make a $30^\circ$ angle. Which is larger, $|\hat{\vb A}\cdot\hat{\vb B}|$ or $|\hat{\vb A}\times\hat{\vb B}|$?`,
        [md`The dot product: $\cos30^\circ\approx0.87$ beats $\sin30^\circ = 0.5$`, md`The cross product, because it is a vector and the dot product is only a number`, md`They are equal at $30^\circ$`, md`It depends on how long the vectors are`], 0,
        [null, md`Being a vector doesn't make it bigger. Compare magnitudes: $\sin30^\circ = 0.5$ against $\cos30^\circ\approx0.87$.`,
          md`They are equal at $45^\circ$, where $\sin\theta = \cos\theta$.`,
          md`Both are unit vectors, so only the angle matters.`],
        md`Nearly parallel vectors have a big dot product and a small cross product; nearly perpendicular ones the reverse. The crossover is at $45^\circ$. That is why a flux $\vb E\cdot d\vb a$ is largest when the field runs along the normal, and the work $\vb F\cdot d\vb l$ largest when the force runs along the path.`,
        { nofig: 'comparing cos and sin at one angle' }),

      Q(md`Three nonzero vectors satisfy $\vb A\cdot(\vb B\times\vb C) = 0$. What does that tell you?`,
        [md`Two of them must be parallel`, md`All three are mutually perpendicular`, md`All three lie in one plane`, md`$\vb A$ is perpendicular to both $\vb B$ and $\vb C$`], 2,
        [md`A parallel pair does give zero, but so do three vectors in one plane with no two parallel, such as $\uv x$, $\uv y$ and $\uv x+\uv y$.`,
          md`Mutually perpendicular vectors span the *largest* box: $\uv x\cdot(\uv y\times\uv z) = 1$.`, null,
          md`Then $\vb A$ is parallel to $\vb B\times\vb C$, and the triple product is $\pm A\,|\vb B\times\vb C|$, which is not zero unless $\vb B\parallel\vb C$.`],
        md`The triple product is the signed volume of the box the three vectors span. Zero volume means a flat box: $\vb B\times\vb C$ is normal to the plane of $\vb B$ and $\vb C$, and $\vb A\cdot(\vb B\times\vb C) = 0$ says $\vb A$ has no component along that normal, so it lies in the same plane.`,
        { nofig: 'geometric meaning of a formula' }),

      RF(md`
        ### Source point, field point, separation vector

        Electrostatics always involves two points: a **source point** $\vb r'$, where a charge sits, and a **field point** $\vb r$, where you want $\vb E$ or $V$. Griffiths calls the vector from source to field point "script r":

        $$\sr \equiv \vb r-\vb r',\qquad \srm = |\vb r-\vb r'|,\qquad \srh = \frac{\sr}{\srm}.$$

        [[fig:sep]]

        In components, $\sr = (x-x')\,\uv x+(y-y')\,\uv y+(z-z')\,\uv z$ and $\srm = \sqrt{(x-x')^2+(y-y')^2+(z-z')^2}$.

        Why use it: Coulomb's law only cares about where the field point is *relative to the charge*,

        $$\vb E(\vb r) = \kq\,\frac{q}{\srm^2}\,\srh = \kq\,\frac{q\,\sr}{\srm^3}.$$

        Move the origin and $\vb r$, $\vb r'$ both change, but $\sr$ does not, and neither does the physics. $\srh$ points *away from the source*, so the field of a positive charge points away from it. Writing $\vb r'-\vb r$ by mistake flips every field you compute.

        Two conventions to lock in now:

        - Primed coordinates $(x',y',z')$ label source points. They are the integration variables in $\int\rho(\vb r')\,\dfrac{\srh}{\srm^2}\,d\tau'$.
        - Unprimed coordinates label the field point. They are held fixed during that integral, and $\nabla$ acts on them only.

        !!trap Three different r's
          $\uv r$ points away from the **origin**; $\srh$ points away from the **source**. They agree only when the source is at the origin. And $\srm\neq r-r'$: magnitudes don't subtract. The distance depends on the angle between $\vb r$ and $\vb r'$.
      `, { sep: { svg: fSep(), cap: 'Source point $\\vb r\'$, field point $\\vb r$, and the separation vector $\\sr = \\vb r-\\vb r\'$ from the source to the field point.' } }),

      Q(md`The figure shows the origin $O$, a charge at $\vb r'$ and a field point $P$ at $\vb r$. In Coulomb's law $\vb E = \kq\dfrac{q}{\srm^2}\srh$, which vector is $\sr$?`,
        [md`$\vb r'-\vb r$, from the field point to the charge`, md`$\vb r-\vb r'$, from the charge to the field point`, md`$\vb r$, from the origin to the field point`, md`$\vb r'$, from the origin to the charge`], 1,
        [md`Reversed. With this choice the field of a positive charge would point toward the charge.`, null,
          md`That depends on where you put the origin. It equals $\sr$ only if the charge sits at $O$.`,
          md`That locates the charge but says nothing about where $P$ is.`],
        md`$\sr = \vb r-\vb r'$, "field point minus source point". Tip to tail: $\vb r'+\sr = \vb r$. The field of a positive charge points along $\srh$, away from the charge.`,
        { figHtml: fSep({ sr: false }) }),

      Q(md`You move the origin from $O$ to $O'$ (figure). The charge and the field point stay where they are. Which vectors change?`,
        [md`$\vb r$, $\vb r'$ and $\sr$ all change`, md`Only $\sr$ changes`, md`$\vb r$ and $\vb r'$ change; $\sr$ does not`, md`Nothing changes`], 2,
        [md`$\sr$ joins the charge to the field point. Neither point moved, so $\sr$ didn't either.`,
          md`Backwards: $\sr$ is the one vector that doesn't care about the origin.`, null,
          md`Position vectors start at the origin, so they change when it moves.`],
        md`Both position vectors change by the same amount (minus the shift of the origin), so their difference $\sr = \vb r-\vb r'$ is unchanged. The physics can't depend on where you put the origin, which is why Coulomb's law is written with $\sr$.`,
        { figHtml: fOrigins() }),

      Q(md`The field point is $5$ m from the origin and the charge is $3$ m from the origin (figure). How far apart are they?`,
        [md`$2$ m`, md`$8$ m`, md`$4$ m`, md`Anything from $2$ m to $8$ m, depending on the angle between $\vb r$ and $\vb r'$`], 3,
        [md`$r-r'$ subtracts magnitudes. That is right only if the two points lie on the same ray from $O$.`,
          md`Adding magnitudes is right only if the points are on opposite sides of $O$.`,
          md`$4 = \sqrt{5^2-3^2}$ assumes a right angle somewhere. Nothing says so.`, null],
        md`$\srm = |\vb r-\vb r'| = \sqrt{r^2+r'^2-2rr'\cos\gamma}$ (law of cosines), where $\gamma$ is the angle between $\vb r$ and $\vb r'$. It runs from $5-3 = 2$ m ($\gamma = 0$) to $5+3 = 8$ m ($\gamma = 180^\circ$).`,
        { figHtml: fCircles() }),

      Q(md`A ring of radius $R$ lies in the $xy$-plane, centred on the origin (figure). A source point on it is $\vb r' = R\cos\phi'\,\uv x+R\sin\phi'\,\uv y$; the field point is $\vb r = z\,\uv z$. What is $\srm$?`,
        [md`$\sqrt{R^2+z^2}$`, md`$z-R$`, md`$R+z$`, md`$\sqrt{R^2+z^2-2Rz\cos\phi'}$`], 0,
        [null, md`Magnitudes don't subtract.`, md`Magnitudes don't add either.`,
          md`The cross term is $2\vb r\cdot\vb r'$, and it is zero here: $\vb r$ is along $\uv z$ while $\vb r'$ lies in the $xy$-plane, for every $\phi'$.`],
        md`$\sr = \vb r-\vb r' = -R\cos\phi'\,\uv x-R\sin\phi'\,\uv y+z\,\uv z$, so $\srm^2 = R^2(\cos^2\phi'+\sin^2\phi')+z^2 = R^2+z^2$. It is the same for every point on the ring, which is what makes the ring of HW 1 easy: $\srm$ comes out of the integral. The $x$ and $y$ parts of $\sr$ contain $\cos\phi'$ and $\sin\phi'$, which integrate to zero around the ring. That is the symmetry cancellation, done by algebra.`,
        { figHtml: fRing() }),

      Q(md`A uniformly charged segment lies on the $x$-axis. A source point on it is $x'\,\uv x$ and the field point is $P = z\,\uv z$ (figure). What is $\srh$?`,
        [md`$\uv z$`, md`$\dfrac{x'\uv x-z\uv z}{\sqrt{x'^2+z^2}}$`, md`$\dfrac{-x'\uv x+z\uv z}{\sqrt{x'^2+z^2}}$`, md`$\dfrac{-x'\uv x+z\uv z}{x'^2+z^2}$`], 2,
        [md`Only the element at $x' = 0$ is straight below $P$. Every other element's $\srh$ tilts sideways.`,
          md`That is $(\vb r'-\vb r)/\srm$: it points from $P$ to the charge, the wrong way.`, null,
          md`Dividing by $\srm^2$ doesn't give a unit vector. It gives $\sr/\srm^2$, which has length $1/\srm$.`],
        md`$\sr = z\,\uv z-x'\,\uv x$ and $\srm = \sqrt{x'^2+z^2}$, so $\srh = \dfrac{-x'\uv x+z\uv z}{\sqrt{x'^2+z^2}}$. Its $z$-component $z/\srm$ is the $\cos\theta$ that survives after the $x$-components from $\pm x'$ cancel.`,
        { figHtml: fSegment() }),

      Q(md`In $\vb E(\vb r) = \kq\displaystyle\int\rho(\vb r')\,\frac{\srh}{\srm^2}\,d\tau'$, which statement is right?`,
        [md`$\vb r$ is integrated over and $\vb r'$ is held fixed`, md`Both $\vb r$ and $\vb r'$ are integrated over`, md`$\nabla$ acts on $\vb r'$, because that is where the charge is`, md`$\vb r'$ runs over the charge distribution; $\vb r$ is fixed, and $\nabla$ (as in $\nabla\cdot\vb E$) acts on $\vb r$`], 3,
        [md`Swapped. The prime marks the source points, and $d\tau'$ tells you which variable is integrated.`,
          md`The result is a function of $\vb r$: the field *at* the field point. Only $\vb r'$ is integrated out.`,
          md`$\vb E(\vb r)$ is a field over field points, so its divergence and curl differentiate with respect to $\vb r$: $\nabla$ acts on $\vb r$ only.`, null],
        md`Read the integral as "add up the contributions from every source point $\vb r'$ to the field at one fixed point $\vb r$". Afterwards $\vb r'$ is gone and $\vb E$ depends on $\vb r$ alone. That is why you can move $\nabla$ inside the integral and let it act on $\srh/\srm^2$ only.`,
        { nofig: 'notation question' }),

      RF(md`
        ### Worked example: a separation vector and a Coulomb field

        A charge $q$ sits at $(1,2,-1)$ m. Find $\sr$, $\srm$, $\srh$ and $\vb E$ at the field point $(3,-1,5)$ m.

        [[fig:wex]]

        1. Field point minus source point: $\sr = (3-1,\ -1-2,\ 5-(-1)) = (2,-3,6)$ m.
        2. $\srm = \sqrt{4+9+36} = 7$ m.
        3. $\srh = \tfrac17(2,-3,6)$. Check: $(4+9+36)/49 = 1$.
        4. $\vb E = \kq\,\dfrac{q\,\sr}{\srm^3} = \kq\,\dfrac{q\,(2\,\uv x-3\,\uv y+6\,\uv z)}{343\ \text{m}^2}$.

        The form $\sr/\srm^3$ saves you from computing $\srh$ separately. Sanity check: $|\vb E| = \kq\,\dfrac{q}{343}\cdot7 = \kq\,\dfrac{q}{49}$, which is $\kq\,q/\srm^2$ as it must be.
      `, { wex: { svg: fWex(true), cap: 'The charge at $(1,2,-1)$, the field point at $(3,-1,5)$, and $\\sr$ between them. Dashed drops show depth.' } }),

      P({
        title: 'A separation vector and a Coulomb field',
        q: md`A point charge $q$ sits at $(4,1,2)$ m and the field point $P$ is at $(2,5,6)$ m (figure). Find $\srm$, the $x$-component of $\srh$, and the $z$-component of $\vb E$ at $P$.`,
        figHtml: fPrac(false),
        hints: [
          md`This is a separation-vector problem: field point minus source point, never the other way.`,
          md`$\sr = (2-4,\ 5-1,\ 6-2)$. Then $\srm = \sqrt{\sr\cdot\sr}$.`,
          md`Use $\vb E = \kq\,q\,\dfrac{\sr}{\srm^3}$, so $E_z = \kq\,q\,\dfrac{\srm_z}{\srm^3}$, where $\srm_z$ is the $z$-component of $\sr$.`,
        ],
        parts: [
          { lbl: md`$\srm$ (m)`, ans: 6 },
          { lbl: md`$x$-component of $\srh$`, ans: -1 / 3 },
          { lbl: md`$E_z$ (lengths in m)`, expr: 'q/(216*pi*eps0)', vars: { q: [1, 3], eps0: [0.5, 2] }, accepts: ['q/(4*pi*eps0)/54', '(1/(4*pi*eps0))*q*4/216'] },
        ],
        sol: md`
          [[fig:s]]

          1. $\sr = \vb r-\vb r' = (2-4,\ 5-1,\ 6-2) = (-2,4,4)$ m.
          2. $\srm = \sqrt{4+16+16} = 6$ m.
          3. $\srh = \tfrac16(-2,4,4) = \tfrac13(-1,2,2)$, so its $x$-component is $-\tfrac13$.
          4. $E_z = \kq\,q\,\dfrac{4}{6^3} = \kq\,\dfrac{q}{54} = \dfrac{q}{216\pi\varepsilon_0}$ (in SI with lengths in m).

          **Checks.** The unit vector has length $\tfrac19(1+4+4) = 1$. $E_z>0$ for $q>0$ because $P$ is higher than the charge, so "away from the charge" includes "up".

          **What to remember.** $\sr$ is always field point minus source point, and $\vb E\propto\sr/\srm^3$ needs no separate unit vector.
        `,
        figs: { s: { svg: fPrac(true), cap: '$\\sr$ runs from the charge to $P$: $(-2,4,4)$ m.' } },
      }),

      RF(md`
        !!key Patterns to remember
          - $\sr = \vb r-\vb r'$ points from the source to the field point. Coulomb: $\vb E = \kq\,q\,\sr/\srm^3$.
          - Primed = source = integration variable. Unprimed = field point = what $\nabla$ acts on.
          - Dot product keeps the component along a direction (flux, work). Cross product is perpendicular, right-handed, and its size is an area.
          - $\uv r$ (away from the origin) and $\srh$ (away from the source) are different vectors unless the source is at the origin.
          - $\srm\neq r-r'$. For a ring on the axis, $\srm = \sqrt{R^2+z^2}$ for every source point.
      `),
    ],
  };

  // ======================================================================
  // Lesson 2 figures: curvilinear coordinates and integrals
  // ======================================================================
  const fSph3d = () => {
    const g = fig3(0, 0, 1);
    const r = 112, th = 50 * DEG, ph = 50 * DEG;
    g.axes3(118, { Lz: 128 });
    const Pp = [r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)], F = [Pp[0], Pp[1], 0];
    g.l3(Pp, F, { cls: 'dim dash thin' });
    g.l3([0, 0, 0], F, { cls: 'dim dash thin' });
    g.l3([0, 0, 0], Pp, { cls: 'thick' });
    dot3(g, Pp, 3.2); tag3(g, Pp, 'P', 'tr', 8);
    const m = g.p3(Pp[0] * 0.55, Pp[1] * 0.55, Pp[2] * 0.55);
    g.label(m[0] + 3, m[1] + 6, 'r', 'tl');
    pl3(g, circ3([0, 0, 0], [0, 0, 1], [Math.cos(ph), Math.sin(ph), 0], 40, 0, 50), { cls: 'dim' });
    lab3(g, [52 * Math.sin(25 * DEG) * Math.cos(ph), 52 * Math.sin(25 * DEG) * Math.sin(ph), 52 * Math.cos(25 * DEG)], '\\theta', 'c', 'small');
    pl3(g, circ3([0, 0, 0], [1, 0, 0], [0, 1, 0], 60, 0, 50), { cls: 'dim' });
    g.label(6, 28, '\\phi', 'c', 'small');
    return g.svg();
  };
  const fSphSide = () => {
    const f = PF.fig();
    const th = 50 * DEG, r = 100;
    f.arrow(0, 0, 0, -125, { cls: 'dim', hs: 6 }); f.label(4, -128, 'z', 'bl', 'small accent');
    f.arrow(0, 0, 135, 0, { cls: 'dim', hs: 6 }); f.label(138, 2, 's', 'l', 'small accent');
    const Px = r * Math.sin(th), Py = -r * Math.cos(th);
    f.line(0, 0, Px, Py, { cls: 'thick' });
    f.arc(0, 0, 30, 40, 90, { cls: 'dim' });
    f.label(40 * Math.cos(65 * DEG), -40 * Math.sin(65 * DEG), '\\theta', 'c', 'small');
    const L = 34;
    f.arrow(Px, Py, Px + L * Math.sin(th), Py - L * Math.cos(th));
    f.tag(Px + L * Math.sin(th), Py - L * Math.cos(th), H('r'), 'tr', 5);
    f.arrow(Px, Py, Px + L * Math.cos(th), Py + L * Math.sin(th));
    f.tag(Px + L * Math.cos(th), Py + L * Math.sin(th), TH, 'br', 5);
    into(f, Px, Py, 6);
    f.label(Px - 10, Py - 6, PH, 'br');
    f.label(Px * 0.5 + 7, Py * 0.5 + 7, 'r', 'tl');
    f.dot(0, 0, 2.2);
    return f.svg();
  };
  const fCyl3d = () => {
    const g = fig3(0, 0, 1);
    const s = 82, ph = 50 * DEG, Z = 86;
    g.axes3(118, { Lz: 130 });
    ring3(g, s, 0, { cls: 'dim thin', backCls: 'dim dash thin' });
    ring3(g, s, Z, { cls: 'dim thin', backCls: 'dim dash thin' });
    const F = [s * Math.cos(ph), s * Math.sin(ph), 0], Pp = [F[0], F[1], Z];
    g.l3(F, Pp, { cls: 'dim dash' });
    g.l3([0, 0, 0], F, { cls: 'dim dash thin' });
    g.l3([0, 0, Z], Pp, { cls: 'thick' });
    dot3(g, Pp, 3.2); tag3(g, Pp, 'P', 't', 10);
    const ms = g.p3(Pp[0] * 0.5, Pp[1] * 0.5, Z);
    g.label(ms[0], ms[1] - 4, 's', 'b');
    tag3(g, [F[0], F[1], Z * 0.5], 'z', 'r', 8, 'small');
    return g.svg();
  };
  const fCylTop = () => {
    const f = PF.fig();
    const s = 90, ph = 35 * DEG;
    f.arrow(-20, 0, 130, 0, { cls: 'dim', hs: 6 }); f.label(133, 2, 'x', 'l', 'small accent');
    f.arrow(0, 20, 0, -120, { cls: 'dim', hs: 6 }); f.label(4, -122, 'y', 'bl', 'small accent');
    f.arc(0, 0, s, -10, 100, { cls: 'dash dim' });
    const Px = s * Math.cos(ph), Py = -s * Math.sin(ph);
    f.line(0, 0, Px, Py, { cls: 'thick' });
    f.arc(0, 0, 28, 0, 35, { cls: 'dim' });
    f.label(40 * Math.cos(17 * DEG), -40 * Math.sin(17 * DEG), '\\phi', 'c', 'small');
    const L = 34;
    f.arrow(Px, Py, Px + L * Math.cos(ph), Py - L * Math.sin(ph));
    f.tag(Px + L * Math.cos(ph), Py - L * Math.sin(ph), H('s'), 'r', 5);
    f.arrow(Px, Py, Px - L * Math.sin(ph), Py - L * Math.cos(ph));
    f.tag(Px - L * Math.sin(ph), Py - L * Math.cos(ph), PH, 't', 5);
    outOf(f, Px, Py, 6);
    f.label(Px + 9, Py + 7, H('z'), 'tl', 'small');
    f.label(Px * 0.5 - 6, Py * 0.5 - 8, 's', 'br');
    f.dot(0, 0, 2.2);
    return f.svg();
  };
  const fPointY = () => {
    const g = fig3(0, 0, 1);
    g.axes3(100, { Ly: 125 });
    dot3(g, [0, 82, 0], 3.4); tag3(g, [0, 82, 0], 'P', 't', 9);
    return g.svg();
  };
  const f3412 = () => {
    const g = fig3(0, 0, 8);
    g.axes3(14, { Lx: 6, Ly: 7, Lz: 15 });
    const Pp = [3, 4, 12], F = [3, 4, 0];
    g.l3(Pp, F, { cls: 'dim dash thin' });
    g.l3(F, [3, 0, 0], { cls: 'dim dash thin' });
    g.l3(F, [0, 4, 0], { cls: 'dim dash thin' });
    dot3(g, Pp, 3.2); tag3(g, Pp, '(3,4,12)', 'r', 10);
    return g.svg();
  };
  const f022 = () => {
    const f = PF.fig(), u = 40;
    f.arrow(0, 0, 3.2 * u, 0, { cls: 'dim', hs: 6 }); f.label(3.2 * u + 4, 2, 'y', 'l', 'small accent');
    f.arrow(0, 0, 0, -3.2 * u, { cls: 'dim', hs: 6 }); f.label(4, -3.2 * u - 2, 'z', 'bl', 'small accent');
    f.line(2 * u, 0, 2 * u, -2 * u, { cls: 'dim dash thin' });
    f.line(0, -2 * u, 2 * u, -2 * u, { cls: 'dim dash thin' });
    f.label(2 * u, 6, '2', 't', 'small accent'); f.label(-6, -2 * u, '2', 'r', 'small accent');
    f.dot(2 * u, -2 * u, 3.2); f.tag(2 * u, -2 * u, '(0,2,2)', 'tr', 8);
    return f.svg();
  };
  // cross-section through the z-axis: the circle of latitude at polar angle theta is seen edge-on as a chord
  const fLat = (o = {}) => {
    const f = PF.fig();
    const R = 85, th = 60 * DEG, h = R * Math.cos(th), w = R * Math.sin(th);
    f.circle(0, 0, R);
    f.line(0, R + 16, 0, -R - 20, { cls: 'dim dash thin' }); f.label(4, -R - 20, 'z', 'bl', 'small accent');
    f.line(-w, -h, w, -h, { cls: 'thick' });
    f.line(0, 0, w, -h, { cls: 'dim' });
    f.arc(0, 0, 20, 30, 90, { cls: 'dim' });
    f.label(33 * Math.cos(60 * DEG), -33 * Math.sin(60 * DEG), '\\theta', 'c', 'small');
    f.label(w * 0.5 + 7, -h * 0.5 + 7, 'R', 'tl', 'small');
    f.dot(0, 0, 2.2);
    if (o.labels !== false) f.label(30, -h - 9, 'R\\sin\\theta', 'b', 'small');
    return f.svg();
  };
  const fCylCap = () => {
    const g = fig3(0, 0, 1);
    const R = 60, Ht = 110;
    pl3(g, circ3([0, 0, Ht], [1, 0, 0], [0, 1, 0], R, 0, 360), {});
    g.add(`<path class="shade nodecl" d="M${circ3([0, 0, Ht], [1, 0, 0], [0, 1, 0], R, 0, 360).map((p) => g.p3(...p).map((v) => Math.round(v * 10) / 10).join(',')).join('L')}Z"/>`);
    ring3(g, R, 0, { cls: '' });
    for (const a of [109, -71]) { const c = Math.cos(a * DEG), s = Math.sin(a * DEG); g.l3([R * c, R * s, 0], [R * c, R * s, Ht]); }
    g.l3([0, 0, 0], [0, 0, Ht + 50], { cls: 'dim dash thin' });
    ar3(g, [0, 0, Ht], [0, 0, Ht + 55], { cls: 'dim' }); lab3(g, [0, 0, Ht + 58], 'z', 'b', 'small accent');
    const t = g.p3(R * Math.cos(109 * DEG), R * Math.sin(109 * DEG), Ht);
    g.text(t[0] + 10, t[1] - 14, 'top cap, z = h', 'bl');
    return g.svg();
  };
  const fPaths3 = () => {
    const f = PF.fig(), u = 110;
    f.arrow(-15, 0, 1.3 * u, 0, { cls: 'dim', hs: 6 }); f.label(1.3 * u + 4, 2, 'x', 'l', 'small accent');
    f.arrow(0, 15, 0, -1.3 * u, { cls: 'dim', hs: 6 }); f.label(4, -1.3 * u - 2, 'y', 'bl', 'small accent');
    const arc = f.arcPts(0, 0, u, u, 0, 90);
    f.pl(arc, { cls: 'thick' }); midHead(f, arc, 0.5);
    midArrow(f, u, 0, 0, -u, {});
    f.line(u, 0, u, -u, { cls: 'dash' }); f.line(u, -u, 0, -u, { cls: 'dash' });
    f.head(u, -0.55 * u, 0, -1); f.head(0.45 * u, -u, -1, 0);
    f.dot(u, 0, 3); f.label(u + 4, 6, `${B('a')}\\;(1,0)`, 'tl', 'small');
    f.dot(0, -u, 3); f.label(-6, -u, `${B('b')}\\;(0,1)`, 'r', 'small');
    f.label(94, -94, '(1)', 'c', 'small');
    f.label(u * 0.42, -u * 0.5, '(2)', 'tr', 'small');
    f.label(u + 6, -u - 4, '(3)', 'bl', 'small');
    return f.svg();
  };
  const fCubeFlow = () => {
    const g = fig3(0, 0, 1);
    const a = 80;
    g.box3(a, a, a, {});
    for (const [x, z] of [[a * 0.5, a * 0.25], [a * 0.5, a * 0.75], [a * 0.15, a * 0.5], [a * 0.85, a * 0.5]]) {
      g.l3([x, -45, z], [x, 0, z], { cls: 'dim' });
      g.l3([x, a, z], [x, a + 40, z], { cls: 'dim', arrow: 'end' });
    }
    lab3(g, [a, a + 44, a + 25], `${B('v')} = v_0\\,${H('y')}`, 'l', 'small');
    const ta = g.p3(a, a * 0.5, 0);
    g.label(ta[0], ta[1] + 6, 'a', 't', 'small');
    triad(g, -100, 45, 22);
    return g.svg();
  };
  const fYdown = () => {
    const f = PF.fig(), u = 70;
    f.arrow(-20, 0, 2.6 * u, 0, { cls: 'dim', hs: 6 }); f.label(2.6 * u + 4, 2, 'y', 'l', 'small accent');
    for (const k of [0.5, 1, 1.5, 2]) f.arrow(k * u, -22, k * u + k * 16, -22, { cls: 'dim' });
    f.label(2 * u + 36, -22, `${B('v')} = y\\,${H('y')}`, 'l', 'small');
    f.line(0, 0, 2 * u, 0, { cls: 'thick' }); f.head(u, 0, -1, 0, {});
    f.dot(0, 0, 3); f.label(0, 8, 'y=0', 't', 'small accent');
    f.dot(2 * u, 0, 3); f.label(2 * u, 8, 'y=2', 't', 'small accent');
    f.text(u, 30, 'path: from y = 2 to y = 0', 't');
    return f.svg();
  };
  const fHemi = () => {
    const f = PF.fig();
    const R = 90;
    f.arc(0, 0, R, 0, 180, {});
    f.ellipse(0, 0, R, R * 0.28, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, 0, R, R * 0.28, { half: 'front', cls: 'dim' });
    for (const a of [20, 55, 90, 125, 160]) { const c = Math.cos(a * DEG), s = Math.sin(a * DEG); f.arrow(R * c, -R * s, (R + 32) * c, -(R + 32) * s); }
    f.dot(0, 0, 2.2);
    f.line(0, 31, 0, 50, { cls: 'dim thin' }); f.line(R, 6, R, 50, { cls: 'dim thin' });
    f.dim(0, 44, R, 44, 'R', { at: 'b' });
    f.label((R + 36) * Math.cos(55 * DEG) + 4, -(R + 36) * Math.sin(55 * DEG), H('r'), 'bl', 'small');
    return f.svg();
  };
  const fSphereRho = () => {
    const f = PF.fig();
    const R = 80;
    f.circle(0, 0, R, {});
    f.ellipse(0, 0, R, R * 0.28, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, 0, R, R * 0.28, { half: 'front', cls: 'dim' });
    f.arrow(0, 0, 0, -R - 30, { cls: 'dim', hs: 6 }); f.label(4, -R - 32, 'z', 'bl', 'small accent');
    const a = 35 * DEG;
    f.line(0, 0, R * Math.sin(a), -R * Math.cos(a), { cls: 'dim' });
    f.arc(0, 0, 24, 55, 90, { cls: 'dim' });
    f.label(34 * Math.cos(72 * DEG), -34 * Math.sin(72 * DEG), '\\theta', 'c', 'small');
    f.line(0, 0, -R * Math.cos(20 * DEG), R * Math.sin(20 * DEG), { cls: 'dim thin' });
    f.label(-R * 0.55, R * 0.2 + 4, 'R', 't', 'small');
    f.dot(0, 0, 2.2);
    f.label(R * 0.05, R * 0.55, '\\rho = k\\cos^2\\theta', 't', 'small');
    return f.svg();
  };
  // cross-section through the z-axis; the rim of the cap is seen edge-on
  const fCap = () => {
    const f = PF.fig();
    const R = 95, h = R * Math.cos(60 * DEG), w = R * Math.sin(60 * DEG);
    const cap = f.arcPts(0, 0, R, R, 30, 150);
    f.poly(cap, { cls: 'shade nodecl' });
    f.circle(0, 0, R, { cls: 'dim' });
    f.pl(cap, { cls: 'thick' });
    f.line(-w, -h, w, -h, { cls: 'dash' });
    f.line(0, R * 0.45, 0, -R - 26, { cls: 'dim dash thin' }); f.label(4, -R - 26, 'z', 'bl', 'small accent');
    f.line(0, 0, w, -h, { cls: 'dim' });
    f.arc(0, 0, 18, 30, 90, { cls: 'dim' });
    f.text(18, -33, '60°', 'c');
    f.label(w * 0.5 + 7, -h * 0.5 + 7, 'R', 'tl', 'small');
    f.dot(0, 0, 2.2);
    f.text(R + 8, -R * 0.75, 'cap θ ≤ 60°', 'l');
    return f.svg();
  };
  // upper hemisphere in a uniform vertical field
  const fHemiUnif = () => {
    const f = PF.fig(), R = 80;
    f.arc(0, 0, R, 0, 180, {});
    f.ellipse(0, 0, R, R * 0.28, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, 0, R, R * 0.28, { half: 'front', cls: 'dim' });
    for (const x of [-104, -52, 0, 52, 104]) f.arrow(x, 44, x, -122, { cls: 'dim' });
    f.label(112, -112, `${B('E')} = E_0\\,${H('z')}`, 'l', 'small');
    f.text(0, 56, 'upper hemisphere, radius R', 't');
    return f.svg();
  };
  // flux question: a point charge at the centre of a sphere of radius r
  const fGaussSph = () => {
    const f = PF.fig(), R = 80, a = 35 * DEG;
    f.circle(0, 0, R, {});
    f.ellipse(0, 0, R, R * 0.28, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, 0, R, R * 0.28, { half: 'front', cls: 'dim' });
    f.line(9 * Math.cos(a), -9 * Math.sin(a), R * Math.cos(a), -R * Math.sin(a), { cls: 'dim' });
    f.label(R * 0.5 * Math.cos(a) - 4, -R * 0.5 * Math.sin(a) - 6, 'r', 'br', 'small');
    f.charge(0, 0, { q: '+', r: 6 });
    f.label(-11, 0, 'q', 'r', 'small');
    return f.svg();
  };

  // ======================================================================
  // Lesson 2: curvilinear coordinates and integrals
  // ======================================================================
  const L2 = {
    id: 'u0-coords', title: 'Spherical and cylindrical coordinates; line, surface and volume integrals',
    steps: [
      RF(md`
        ### Spherical coordinates $(r,\theta,\phi)$

        - $r$: distance from the origin, $0\le r<\infty$.
        - $\theta$: polar angle, measured down from the $+z$ axis, $0\le\theta\le\pi$.
        - $\phi$: azimuthal angle, measured in the $xy$-plane from $+x$ toward $+y$, $0\le\phi<2\pi$.

        $$x = r\sin\theta\cos\phi,\qquad y = r\sin\theta\sin\phi,\qquad z = r\cos\theta$$

        [[fig:sph]]

        The unit vectors point the way each coordinate increases: $\uv r$ straight out, $\hat{\boldsymbol\theta}$ "south" along a meridian, $\hat{\boldsymbol\phi}$ "east" around a circle of latitude. They are mutually perpendicular and right-handed ($\uv r\times\hat{\boldsymbol\theta} = \hat{\boldsymbol\phi}$). From the formula sheet:

        $$\uv r = \sin\theta\cos\phi\,\uv x+\sin\theta\sin\phi\,\uv y+\cos\theta\,\uv z$$

        $$\hat{\boldsymbol\theta} = \cos\theta\cos\phi\,\uv x+\cos\theta\sin\phi\,\uv y-\sin\theta\,\uv z,\qquad \hat{\boldsymbol\phi} = -\sin\phi\,\uv x+\cos\phi\,\uv y$$

        !!key Curvilinear unit vectors change from point to point
          $\uv x,\uv y,\uv z$ are the same everywhere. $\uv r,\hat{\boldsymbol\theta},\hat{\boldsymbol\phi}$ are not: $\uv r$ is $+\uv z$ at the north pole and $-\uv z$ at the south pole. Two consequences. You can't add vectors at different points by adding their $r$-components. And you can't pull $\uv r$ (or $\hat{\boldsymbol\theta}$, $\hat{\boldsymbol\phi}$, $\uv s$) out of an integral over a surface or volume. Convert to Cartesian components first.
      `, { sph: Object.assign(PF.row([{ svg: fSph3d(), cap: 'The coordinates $r,\\theta,\\phi$ of $P$.' }, { svg: fSphSide(), cap: 'In the vertical plane through $P$: $\\uv r$ and $\\hat{\\boldsymbol\\theta}$ in the page, $\\hat{\\boldsymbol\\phi}$ into it.' }]), { cap: '' }) }),

      Q(md`At the point $P$ on the positive $y$-axis (figure), which way does $\hat{\boldsymbol\theta}$ point?`,
        [md`$+\uv z$`, md`$-\uv z$`, md`$-\uv x$`, md`$+\uv y$`], 1,
        [md`$\theta$ is measured down from $+z$. Increasing $\theta$ moves you toward the south pole, so on the equator that is straight down.`, null,
          md`That is $\hat{\boldsymbol\phi}$ at this point.`, md`That is $\uv r$ here.`],
        md`On the $y$-axis, $\theta = 90^\circ$ and $\phi = 90^\circ$, so $\hat{\boldsymbol\theta} = \cos\theta\cos\phi\,\uv x+\cos\theta\sin\phi\,\uv y-\sin\theta\,\uv z = -\uv z$. Picture walking south from the north pole: on the equator, "south" is straight down.`,
        { figHtml: fPointY() }),

      Q(md`At the same point $P$ on the positive $y$-axis, which way does $\hat{\boldsymbol\phi}$ point?`,
        [md`$+\uv x$`, md`$+\uv z$`, md`$-\uv y$`, md`$-\uv x$`], 3,
        [md`Counter-clockwise (seen from above) from the $+y$-axis takes you toward $-x$, not $+x$.`,
          md`$\hat{\boldsymbol\phi}$ is always horizontal; it has no $z$-component.`,
          md`That is $-\uv r$. $\hat{\boldsymbol\phi}$ is perpendicular to $\uv r$.`, null],
        md`$\hat{\boldsymbol\phi} = -\sin\phi\,\uv x+\cos\phi\,\uv y$ at $\phi = 90^\circ$ gives $-\uv x$. $\phi$ runs counter-clockwise seen from above: $+x$, then $+y$, then $-x$. At the $+y$-axis the next stop is $-x$.`,
        { figHtml: fPointY() }),

      Q(md`Why does $\theta$ run only from $0$ to $\pi$, while $\phi$ runs from $0$ to $2\pi$?`,
        [md`So that $\sin\theta\ge0$ and the volume element stays positive`, md`Because $\phi$ already sweeps all the way around; $\theta$ from $0$ to $\pi$ then reaches every direction exactly once`, md`Because $\theta>\pi$ would only repeat points on the equator`, md`No reason; $0$ to $2\pi$ works too if you add a factor $\tfrac12$`], 1,
        [md`That is a pleasant consequence, not the reason. The range is set by covering each direction once.`, null,
          md`Every direction with $\theta>\pi$ repeats a direction already reached with a different $\phi$, not just equator points.`,
          md`Coordinates must label each point once. The patch doesn't work either: past $\theta = \pi$, $\sin\theta$ turns negative, so $\int_0^{2\pi}\sin\theta\,d\theta = 0$ and the "halved" full-sphere integral comes out $0$, not $4\pi$.`],
        md`A half-turn of $\theta$ (north pole to south pole) combined with a full turn of $\phi$ covers every direction once. That is why the full-sphere integral is $\int_0^{2\pi}d\phi\int_0^\pi\sin\theta\,d\theta = 2\pi\cdot2 = 4\pi$.`,
        { nofig: 'definition of the coordinate ranges' }),

      Q(md`Which spherical coordinates $(r,\theta,\phi)$ describe the Cartesian point $(1,1,\sqrt2)$?`,
        [md`$(2,\ \pi/4,\ \pi/4)$`, md`$(2,\ \pi/4,\ \pi/2)$`, md`$(4,\ \pi/4,\ \pi/4)$`, md`$(2,\ \pi/3,\ \pi/4)$`], 0,
        [null, md`$\tan\phi = y/x = 1$ with $x,y>0$, so $\phi = \pi/4$.`,
          md`$r = \sqrt{1+1+2} = 2$. You forgot the square root.`,
          md`$\cos\theta = z/r = \sqrt2/2$, which gives $\theta = \pi/4$.`],
        md`$r = \sqrt{1+1+2} = 2$; $\cos\theta = z/r = \sqrt2/2$, so $\theta = \pi/4$; $\tan\phi = y/x = 1$ in the first quadrant, so $\phi = \pi/4$. Check: $x = 2\sin\tfrac\pi4\cos\tfrac\pi4 = 1$.`,
        { nofig: 'coordinate conversion arithmetic' }),

      Q(md`At the point $(0,0,1)$ a vector is $\vb A = 2\,\uv r$. At the point $(1,0,0)$ another vector is $\vb B = 3\,\uv r$. What is $\vb A\cdot\vb B$?`,
        [md`$6$`, md`$0$`, md`$5$`, md`$-6$`], 1,
        [md`That treats $\uv r$ as one fixed vector. At $(0,0,1)$, $\uv r = \uv z$; at $(1,0,0)$, $\uv r = \uv x$.`, null,
          md`A dot product multiplies matching components; it never adds them. And the two $\uv r$'s differ anyway.`,
          md`No sign flip appears: the two $\uv r$'s are perpendicular, not opposite.`],
        md`Convert first: $\vb A = 2\,\uv z$ and $\vb B = 3\,\uv x$, so $\vb A\cdot\vb B = 0$. Multiplying curvilinear components ($A_rB_r$) is only allowed when both vectors sit at the *same* point, where they share one set of unit vectors.`,
        { nofig: 'the point is to work it out from the coordinates' }),

      RF(md`
        ### Cylindrical coordinates $(s,\phi,z)$

        - $s$: distance from the $z$-**axis** (not from the origin).
        - $\phi$: the same azimuthal angle as in spherical coordinates.
        - $z$: the same as Cartesian $z$.

        $$x = s\cos\phi,\quad y = s\sin\phi,\quad z = z;\qquad \uv s = \cos\phi\,\uv x+\sin\phi\,\uv y,\quad \hat{\boldsymbol\phi} = -\sin\phi\,\uv x+\cos\phi\,\uv y$$

        [[fig:cyl]]

        $s = r\sin\theta$, so the two "radial" distances agree only in the $xy$-plane. Some books call the distance from a line charge $r$, with $\uv r$ pointing away from the line; Griffiths and this site call it $s$ to keep it apart from the spherical $r$.
      `, { cyl: Object.assign(PF.row([{ svg: fCyl3d(), cap: 'The coordinates $s,\\phi,z$ of $P$.' }, { svg: fCylTop(), cap: 'Seen from above: $\\uv s$ and $\\hat{\\boldsymbol\\phi}$ in the page, $\\uv z$ out of it.' }]), { cap: '' }) }),

      Q(md`For the point $(3,4,12)$ shown, what are the spherical $r$ and the cylindrical $s$?`,
        [md`$r = 5,\ s = 13$`, md`$r = 13,\ s = 5$`, md`$r = 13,\ s = 12$`, md`$r = s = 13$`], 1,
        [md`Swapped. $s = \sqrt{x^2+y^2}$ is the distance from the $z$-axis; $r$ is the distance from the origin.`, null,
          md`$12$ is the height $z$. The distance from the axis uses only $x$ and $y$.`,
          md`$s = r$ only in the $xy$-plane, and this point is well above it.`],
        md`$r = \sqrt{9+16+144} = 13$ and $s = \sqrt{9+16} = 5$. Equivalently $s = r\sin\theta$ with $\sin\theta = 5/13$.`,
        { figHtml: f3412() }),

      Q(md`At the point $(0,2,2)$ (figure), what is the angle between $\uv s$ and $\uv r$?`,
        [md`$0^\circ$`, md`$45^\circ$`, md`$90^\circ$`, md`$135^\circ$`], 1,
        [md`$\uv s$ and $\uv r$ coincide only in the $xy$-plane ($\theta = 90^\circ$).`, null,
          md`$90^\circ$ is the angle between $\uv s$ and $\uv z$, or between $\uv r$ and $\hat{\boldsymbol\theta}$.`,
          md`Both point partly along $+\uv y$, so the angle between them is acute.`],
        md`At $(0,2,2)$: $\uv s = \uv y$ (horizontal, away from the axis) and $\uv r = (\uv y+\uv z)/\sqrt2$. $\uv s\cdot\uv r = 1/\sqrt2$, so the angle is $45^\circ$, which is $90^\circ-\theta$. In general $\uv r = \sin\theta\,\uv s+\cos\theta\,\uv z$.`,
        { figHtml: f022() }),

      RF(md`
        ### Line, area and volume elements

        Change one coordinate a little and ask how far you moved:

        | step | spherical | cylindrical |
        |---|---|---|
        | radial | $dr$ | $ds$ |
        | polar angle | $r\,d\theta$ (arc of radius $r$) | none |
        | azimuth | $r\sin\theta\,d\phi$ (circle of radius $r\sin\theta$) | $s\,d\phi$ |
        | height | none | $dz$ |

        So $d\vb l = dr\,\uv r+r\,d\theta\,\hat{\boldsymbol\theta}+r\sin\theta\,d\phi\,\hat{\boldsymbol\phi}$ and $d\vb l = ds\,\uv s+s\,d\phi\,\hat{\boldsymbol\phi}+dz\,\uv z$ (both on the formula sheet). Multiply the three sides of the little box to get the volume element:

        $$d\tau = r^2\sin\theta\,dr\,d\theta\,d\phi\qquad\qquad d\tau = s\,ds\,d\phi\,dz$$

        [[fig:lat]]

        The area elements you will use over and over:

        - Sphere of radius $R$: $d\vb a = R^2\sin\theta\,d\theta\,d\phi\;\uv r$.
        - Curved side of a cylinder of radius $R$: $d\vb a = R\,d\phi\,dz\;\uv s$.
        - Flat disk or end cap ($z$ fixed): $d\vb a = s\,ds\,d\phi\;(\pm\uv z)$.
        - Flat face at fixed $\phi$: $d\vb a = ds\,dz\;(\pm\hat{\boldsymbol\phi})$.

        Checks to do in your head: $\int_0^{2\pi}\!\int_0^\pi R^2\sin\theta\,d\theta\,d\phi = 4\pi R^2$; $\int r^2\sin\theta\,dr\,d\theta\,d\phi$ over a ball is $\tfrac43\pi R^3$; the side of a cylinder is $2\pi RL$.
      `, { lat: { svg: fLat(), cap: 'A step $d\\phi$ moves you around the circle of latitude, radius $R\\sin\\theta$: hence $R\\sin\\theta\\,d\\phi$.' } }),

      Q(md`Why is there a $\sin\theta$ in the sphere's area element $da = R^2\sin\theta\,d\theta\,d\phi$? (Figure: a circle of latitude.)`,
        [md`It converts degrees to radians`, md`It comes from the dot product $\uv r\cdot\uv z$`, md`A step $d\phi$ moves you around a circle of latitude, whose radius $R\sin\theta$ shrinks to zero at the poles`, md`It keeps the integrand positive`], 2,
        [md`Calculus angles are in radians already; no conversion factor appears.`,
          md`$\uv r\cdot\uv z = \cos\theta$, not $\sin\theta$. The factor is geometric, not a projection.`, null,
          md`It is positive on $0\le\theta\le\pi$, but that is not why it is there.`],
        md`The patch is $R\,d\theta$ along a meridian by $R\sin\theta\,d\phi$ along the circle of latitude. Near the poles those circles are tiny, so a step in $\phi$ covers almost no ground. Without the $\sin\theta$, every latitude would count as much area as the equator.`,
        { figHtml: fLat({ labels: false }) }),

      Q(md`You compute the area of a sphere as $\int_0^{2\pi}\!\int_0^\pi R^2\,d\theta\,d\phi$, forgetting the $\sin\theta$. What do you get?`,
        [md`$4\pi R^2$ anyway`, md`$2\pi R^2$`, md`$\pi^2R^2$`, md`$2\pi^2R^2$`], 3,
        [md`$\int_0^\pi d\theta = \pi$, not $2$. The $\sin\theta$ is what turns $\pi$ into $2$.`,
          md`That is a hemisphere's area, not what the wrong integral gives.`,
          md`The $\phi$ integral gives $2\pi$, not $\pi$.`, null],
        md`$2\pi\cdot\pi\cdot R^2 = 2\pi^2R^2\approx19.7R^2$ instead of $4\pi R^2\approx12.6R^2$: the polar regions are over-counted. If a spherical area or volume comes out with $\pi^2$ in it, suspect a missing $\sin\theta$.`,
        { nofig: 'arithmetic of an integral' }),

      Q(md`For the flat top cap of the cylinder shown (radius $R$, at height $z = h$), with outward normal, what is $d\vb a$?`,
        [md`$R\,d\phi\,dz\;\uv s$`, md`$ds\,d\phi\;\uv z$`, md`$s\,ds\,d\phi\;\uv s$`, md`$s\,ds\,d\phi\;\uv z$`], 3,
        [md`That is the curved side, where $s = R$ is fixed and $\phi$, $z$ vary.`,
          md`Missing an $s$: a step $d\phi$ at radius $s$ covers a distance $s\,d\phi$.`,
          md`The normal to a flat horizontal cap is vertical, not radial.`, null],
        md`On the cap $z = h$ is fixed while $s$ and $\phi$ vary. The patch is $ds$ by $s\,d\phi$, and the outward normal is $+\uv z$: $d\vb a = s\,ds\,d\phi\;\uv z$. Check: $\int_0^{2\pi}\!\int_0^R s\,ds\,d\phi = \pi R^2$.`,
        { figHtml: fCylCap() }),

      Q(md`Which of these cannot be a volume element?`,
        [md`$dx\,dy\,dz$`, md`$r^2\sin\theta\,dr\,d\theta\,d\phi$`, md`$s\,ds\,d\phi\,dz$`, md`$r\,dr\,d\theta\,d\phi$`], 3,
        [md`Three lengths multiplied: a volume.`,
          md`$dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$ are three lengths, so their product is a volume.`,
          md`$ds$, $s\,d\phi$ and $dz$ are three lengths.`, null],
        md`Angles carry no units, so a volume element needs three powers of length. $r\,dr\,d\theta\,d\phi$ has only two: it is an area (in fact the area element of the plane in polar coordinates, with a stray $d\phi$). Counting lengths catches a missing $r$ or $s$ instantly.`,
        { nofig: 'units count' }),

      Q(md`On a sphere of radius $R$, what is the circumference of the circle of latitude at $\theta = 60^\circ$ (figure)?`,
        [md`$\pi R$`, md`$\sqrt3\,\pi R$`, md`$2\pi R$`, md`$\dfrac{\pi R}{3}$`], 1,
        [md`That uses $\cos60^\circ$. The circle's radius is its distance from the $z$-axis, $R\sin\theta$.`, null,
          md`Only the equator ($\theta = 90^\circ$) has the full circumference $2\pi R$.`,
          md`$R\theta = \pi R/3$ is the distance from the north pole along a meridian, not the distance around the circle.`],
        md`The circle's radius is $s = R\sin\theta = \tfrac{\sqrt3}{2}R$, so its circumference is $2\pi s = \sqrt3\,\pi R\approx5.4R$. A step $d\phi$ moves you $R\sin\theta\,d\phi$ along it, which is the $\sin\theta$ in $da$ and $d\tau$.`,
        { figHtml: fLat({ labels: false }) }),

      RF(md`
        ### Line, surface and volume integrals

        **Line integral.** $\int_{\mathcal P}\vb v\cdot d\vb l$ adds up the component of $\vb v$ along a path $\mathcal P$. Recipe: describe the path, write $d\vb l$ on it, dot, integrate. Use $d\vb l = dx\,\uv x+dy\,\uv y+dz\,\uv z$ with **no minus signs**, and let the limits carry the direction: a path from $y = 2$ to $y = 0$ is $\int_2^0\dots dy$. In general the answer depends on the path. Work is $W = \int\vb F\cdot d\vb l$, and $\oint$ means a closed path.

        **Surface integral (flux).** $\int_S\vb v\cdot d\vb a$, where $d\vb a$ is normal to the surface and its size is the patch's area. For a **closed** surface, $d\vb a$ points **outward**. For an open surface the sign is a choice you must state; Stokes' theorem will tie it to a direction around the edge. Only the normal component of $\vb v$ counts.

        **Volume integral.** $\int_V T\,d\tau$ of a scalar, such as the total charge $Q = \int\rho\,d\tau$. For a vector integrand, integrate Cartesian components, $\int\vb v\,d\tau = \uv x\int v_x\,d\tau+\uv y\int v_y\,d\tau+\uv z\int v_z\,d\tau$, because $\uv x$ is constant and $\uv r$ is not.

        ### Worked example: one field, three paths

        Find $\int\vb v\cdot d\vb l$ for $\vb v = y\,\uv x-x\,\uv y$ from $\vb a = (1,0,0)$ to $\vb b = (0,1,0)$ along the three paths in the figure.

        [[fig:paths]]

        1. **Quarter circle** $x = \cos t$, $y = \sin t$, $t: 0\to\pi/2$. Then $d\vb l = (-\sin t\,\uv x+\cos t\,\uv y)\,dt$ and $\vb v\cdot d\vb l = (\sin t)(-\sin t)+(-\cos t)(\cos t) = -1$ per unit $t$. Integral: $-\pi/2$.
        2. **Straight segment** $x = 1-t$, $y = t$, $t: 0\to1$. $d\vb l = (-\uv x+\uv y)\,dt$ and $\vb v\cdot d\vb l = -t-(1-t) = -1$. Integral: $-1$.
        3. **Via the corner $(1,1)$.** Up the line $x = 1$: $d\vb l = dy\,\uv y$, $\vb v\cdot d\vb l = -x\,dy = -dy$, so $\int_0^1(-dy) = -1$. Then left along $y = 1$: $d\vb l = dx\,\uv x$, $\vb v\cdot d\vb l = y\,dx = dx$, so $\int_1^0 dx = -1$. Total: $-2$.

        Three paths, three answers. This field circulates (clockwise), and a field that circulates gives path-dependent line integrals. That is the curl, coming in two lessons. Electrostatic fields will turn out *not* to do this.

        ### Worked example: a flux you will meet again

        The flux of $\vb v = \uv r/r^2$ through a sphere of radius $R$ centred on the origin: on the sphere $\vb v\cdot d\vb a = \dfrac{1}{R^2}\,R^2\sin\theta\,d\theta\,d\phi$, so

        $$\oint\vb v\cdot d\vb a = \int_0^{2\pi}\!\!\int_0^\pi\sin\theta\,d\theta\,d\phi = 4\pi,$$

        the same for every $R$. With $\vb E = \dfrac{q}{4\pi\varepsilon_0}\dfrac{\uv r}{r^2}$ this is Gauss's law for a point charge, $\Phi_E = q/\varepsilon_0$. It is also the seed of the Dirac delta function (last lesson).
      `, { paths: { svg: fPaths3(), cap: 'Paths from $\\vb a = (1,0)$ to $\\vb b = (0,1)$: (1) quarter circle, (2) straight segment, (3) via the corner $(1,1)$.' } }),

      Q(md`You want the flux of a point charge's field $\vb E = \dfrac{q}{4\pi\varepsilon_0}\dfrac{\uv r}{r^2}$ through a sphere of radius $r$ centred on the charge (figure). The first decision is the coordinate system. Which setup is right?`,
        [md`Cartesian, with $d\vb a = dx\,dy\;\uv z$`, md`Spherical, with $d\vb a = r^2\sin\theta\,d\theta\,d\phi\;\uv r$ at fixed $r$`, md`Cylindrical, with $d\vb a = s\,d\phi\,dz\;\uv s$`, md`Spherical, with $d\vb a = r^2\,d\theta\,d\phi\;\uv r$`], 1,
        [md`On a sphere the normal is $\uv r$, which changes from point to point; $dx\,dy\;\uv z$ is the area element of a horizontal plane.`,
          null,
          md`$s\,d\phi\,dz\;\uv s$ belongs to the side of a cylinder ($s$ fixed). The sphere is the surface $r$ = const.`,
          md`The $\sin\theta$ is missing. Without it the angular integral gives $2\pi^2$ instead of $4\pi$.`],
        md`Choose the coordinates in which the surface is "one coordinate = constant". The sphere is $r$ = const, so $d\vb a = r^2\sin\theta\,d\theta\,d\phi\;\uv r$, and $\vb E$ points along $\uv r$ with the same size everywhere on it. Then $\vb E\cdot d\vb a = \dfrac{q}{4\pi\varepsilon_0}\sin\theta\,d\theta\,d\phi$ (the $r^2$ cancels), and the angular integral is $4\pi$: $\Phi_E = q/\varepsilon_0$ for every $r$.`,
        { figHtml: fGaussSph() }),

      Q(md`A uniform field $\vb v = v_0\,\uv y$ passes through a closed cube of side $a$ (figure). What is the total outward flux $\oint\vb v\cdot d\vb a$?`,
        [md`$v_0a^2$`, md`$2v_0a^2$`, md`$0$`, md`$6v_0a^2$`], 2,
        [md`That is only the face where the field leaves. Where it enters, the outward $d\vb a$ points against $\vb v$, giving $-v_0a^2$.`,
          md`The entry face counts negative: its outward normal is antiparallel to $\vb v$.`, null,
          md`On four faces $\vb v$ lies in the face, so $\vb v\cdot d\vb a = 0$ there.`],
        md`Exit face $+v_0a^2$, entry face $-v_0a^2$, the four side faces $0$. Total $0$: everything that goes in comes out. A uniform field has no sources.`,
        { figHtml: fCubeFlow() }),

      Q(md`Along the path shown, running down the $y$-axis from $y = 2$ to $y = 0$, what is $\int\vb v\cdot d\vb l$ for $\vb v = y\,\uv y$?`,
        [md`$+2$`, md`$-2$`, md`$0$`, md`$-4$`], 1,
        [md`That comes from writing $d\vb l = -dy\,\uv y$ *and* running the limits from $2$ to $0$, which counts the reversal twice.`, null,
          md`Zero only if the field were perpendicular to the path.`,
          md`$\int y\,dy = y^2/2$. You dropped the $\tfrac12$.`],
        md`$d\vb l = dy\,\uv y$ (always plus signs), $\vb v\cdot d\vb l = y\,dy$, and the path runs from $2$ to $0$: $\int_2^0 y\,dy = -2$. Negative, because the path runs against the field. Let the limits carry the direction, and never also put a minus sign into $d\vb l$.`,
        { figHtml: fYdown() }),

      Q(md`On the upper hemisphere of radius $R$ (figure), is $\displaystyle\int\uv r\,da$ equal to $(2\pi R^2)\,\uv r$?`,
        [md`Yes: $|\uv r| = 1$ everywhere, and the hemisphere's area is $2\pi R^2$`, md`No: by symmetry the answer is $0$`, md`Yes, because a hemisphere is symmetric`, md`No: $\uv r$ changes direction over the surface. The horizontal parts cancel in pairs and the result points along $\uv z$, shorter than $2\pi R^2$`], 3,
        [md`"$2\pi R^2\,\uv r$" has no meaning: $\uv r$ is a different vector at each point of the surface. Which one would you use?`,
          md`The horizontal parts cancel, but every $\uv r$ on the upper hemisphere has a positive $z$-component $\cos\theta$, and those add up.`,
          md`No symmetry lets you pull a position-dependent vector out of an integral.`, null],
        md`Write $\uv r = \sin\theta\cos\phi\,\uv x+\sin\theta\sin\phi\,\uv y+\cos\theta\,\uv z$ and integrate each Cartesian component. The $\cos\phi$ and $\sin\phi$ terms vanish over $0\to2\pi$; the $z$-part gives $R^2\int_0^{2\pi}\!\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta\,d\phi = \pi R^2$. So $\int\uv r\,da = \pi R^2\,\uv z$, half the naive size, because the arrows are tilted.`,
        { figHtml: fHemi() }),

      Q(md`A uniform field $\vb E = E_0\,\uv z$ passes through the upper hemisphere of radius $R$ (figure), with $d\vb a$ pointing outward. What is the flux $\int\vb E\cdot d\vb a$?`,
        [md`$2\pi R^2E_0$`, md`$0$`, md`$\pi R^2E_0$`, md`$4\pi R^2E_0$`], 2,
        [md`Field times area assumes $\vb E$ runs along the normal everywhere. On the dome the normal is $\uv r$, tilted away from $\uv z$ except at the top.`,
          md`Zero is the flux through the *closed* surface, dome plus flat base. The dome alone passes everything that comes up through the base.`, null,
          md`That is a whole sphere's area times $E_0$, and even for a whole sphere a uniform field's flux is zero.`],
        md`$\vb E\cdot d\vb a = E_0\cos\theta\,R^2\sin\theta\,d\theta\,d\phi$, and $\int_0^{2\pi}\!\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta\,d\phi = \pi$, so the flux is $\pi R^2E_0$. Faster: the closed surface dome-plus-disk encloses no source, so what leaves through the dome equals what enters through the disk, $E_0\cdot\pi R^2$. A uniform field's flux through any surface is $E_0$ times the area of the surface's shadow on a plane perpendicular to $\vb E$.`,
        { figHtml: fHemiUnif() }),

      P({
        title: 'Charge in a sphere with angular dependence',
        q: md`A sphere of radius $R$ (figure) carries the charge density $\rho = k\cos^2\theta$, where $\theta$ is the polar angle and $k$ is a constant. Find the total charge $Q$.`,
        figHtml: fSphereRho(),
        hints: [
          md`Total charge is a volume integral of a scalar: $Q = \int\rho\,d\tau$ in spherical coordinates, with $d\tau = r^2\sin\theta\,dr\,d\theta\,d\phi$.`,
          md`The integrand is a product of a function of $r$, a function of $\theta$ and (trivially) a function of $\phi$, so the triple integral splits into three 1-D integrals.`,
          md`For $\int_0^\pi\cos^2\theta\sin\theta\,d\theta$ substitute $u = \cos\theta$, $du = -\sin\theta\,d\theta$.`,
        ],
        parts: [{ lbl: 'Q', expr: '4*pi*k*R^3/9', vars: { k: [1, 3], R: [1, 3] }, accepts: ['(4/9)*pi*k*R^3'] }],
        sol: md`
          $$Q = \int_0^{2\pi}\!\!\int_0^\pi\!\!\int_0^R k\cos^2\theta\;r^2\sin\theta\,dr\,d\theta\,d\phi = k\Big(\int_0^R r^2\,dr\Big)\Big(\int_0^\pi\cos^2\theta\sin\theta\,d\theta\Big)\Big(\int_0^{2\pi}d\phi\Big)$$

          - $\int_0^R r^2\,dr = R^3/3$.
          - With $u = \cos\theta$: $\int_0^\pi\cos^2\theta\sin\theta\,d\theta = \int_{-1}^{1}u^2\,du = \tfrac23$.
          - $\int_0^{2\pi}d\phi = 2\pi$.

          $$Q = k\cdot\frac{R^3}{3}\cdot\frac23\cdot2\pi = \frac{4\pi kR^3}{9}$$

          **Check.** If $\rho$ were $k$ everywhere you would get $\tfrac43\pi kR^3$. The average of $\cos^2\theta$ over a sphere is $\tfrac13$, and $\tfrac13\cdot\tfrac43\pi kR^3 = \tfrac49\pi kR^3$. Units: $k$ is a charge density, times a volume.

          **What to remember.** The $r^2\sin\theta$ comes with every spherical volume integral; when the integrand factorises, split it into three 1-D integrals.
        `,
      }),

      P({
        title: 'A vector surface integral',
        q: md`Compute $\displaystyle\int\uv r\,da$ over the spherical cap $0\le\theta\le60^\circ$ of a sphere of radius $R$ centred on the origin (figure). Give its $z$- and $x$-components.`,
        figHtml: fCap(),
        hints: [
          md`$\uv r$ changes direction over the cap, so it can't come out of the integral. Write it in Cartesian components first.`,
          md`$\uv r = \sin\theta\cos\phi\,\uv x+\sin\theta\sin\phi\,\uv y+\cos\theta\,\uv z$ and $da = R^2\sin\theta\,d\theta\,d\phi$.`,
          md`The $x$-component has a factor $\int_0^{2\pi}\cos\phi\,d\phi$. For the $z$-component use $\int\cos\theta\sin\theta\,d\theta = \tfrac12\sin^2\theta$.`,
        ],
        parts: [
          { lbl: md`$z$-component`, expr: '3*pi*R^2/4', vars: { R: [1, 3] }, accepts: ['0.75*pi*R^2'] },
          { lbl: md`$x$-component`, ans: 0 },
        ],
        sol: md`
          $$\int\uv r\,da = \int_0^{2\pi}\!\!\int_0^{\pi/3}\big(\sin\theta\cos\phi\,\uv x+\sin\theta\sin\phi\,\uv y+\cos\theta\,\uv z\big)\,R^2\sin\theta\,d\theta\,d\phi$$

          - $x$ and $y$: each contains $\int_0^{2\pi}\cos\phi\,d\phi = 0$ or $\int_0^{2\pi}\sin\phi\,d\phi = 0$. They vanish: around the cap, the horizontal parts of $\uv r$ cancel in pairs.
          - $z$: $R^2\cdot2\pi\int_0^{\pi/3}\cos\theta\sin\theta\,d\theta = 2\pi R^2\Big[\tfrac12\sin^2\theta\Big]_0^{\pi/3} = 2\pi R^2\cdot\tfrac38 = \tfrac34\pi R^2$.

          So $\int\uv r\,da = \tfrac34\pi R^2\,\uv z$.

          **Check.** The cap's area is $2\pi R^2(1-\cos60^\circ) = \pi R^2$, and the answer is smaller because the arrows tilt. In fact $\tfrac34\pi R^2 = \pi(R\sin60^\circ)^2$, the area of the cap's shadow on the $xy$-plane: $\uv r\cdot\uv z\,da$ is exactly the projected area.

          **What to remember.** Never pull $\uv r$, $\hat{\boldsymbol\theta}$, $\hat{\boldsymbol\phi}$ or $\uv s$ out of an integral. Convert to Cartesian components, and let symmetry kill the components it can.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - $\theta$ from $+z$, $0$ to $\pi$; $\phi$ around, $0$ to $2\pi$. $s$ is the distance from the $z$-axis, $r$ from the origin, $s = r\sin\theta$.
          - $d\tau = r^2\sin\theta\,dr\,d\theta\,d\phi$, $d\tau = s\,ds\,d\phi\,dz$. Sphere: $d\vb a = R^2\sin\theta\,d\theta\,d\phi\,\uv r$. Cylinder side: $R\,d\phi\,dz\,\uv s$. Cap: $s\,ds\,d\phi\,\uv z$.
          - A $\pi^2$ in a spherical area or volume means a missing $\sin\theta$.
          - Curvilinear unit vectors depend on position: convert to Cartesian before integrating a vector.
          - Line integrals: $d\vb l$ with plus signs, direction in the limits. Closed-surface flux: outward normal.
          - The flux of $\uv r/r^2$ through any sphere about the origin is $4\pi$.
      `),
    ],
  };

  // ======================================================================
  // Lesson 3 figures: the gradient
  // ======================================================================
  // hill with elliptical contours rx = 30k, ry = 18k (k = 1..4); T = 4 - k on contour k
  const fContour = (o = {}) => {
    const f = PF.fig();
    for (let k = 1; k <= 4; k++) {
      f.ellipse(0, 0, 30 * k, 18 * k, { cls: k === 4 ? 'dim' : '' });
      f.label(30 * k + 12, 0, String(4 - k), 'c', 'small accent');
    }
    if (o.arrows) {
      for (const t of [90, 140, 180, 230, 270]) {
        const c = Math.cos(t * DEG), s = Math.sin(t * DEG);
        const x = 75 * c, y = -45 * s;
        const gx = -c / 30, gy = s / 18;              // uphill, screen axes, magnitude ~ |grad T|
        const n = Math.hypot(gx, gy), L = 450 * n;
        f.arrow(x, y, x + L * gx / n, y + L * gy / n, { cls: 'thick', hs: 6 });
      }
    }
    if (o.P) {
      const t = 30 * DEG, x = 90 * Math.cos(t), y = -54 * Math.sin(t);
      f.dot(x, y, 3.2); f.tag(x, y, 'P', 'r', 9);
    }
    f.dot(0, 0, 2.2);
    return f.svg();
  };
  // a slope whose contours crowd together toward the right
  const fSlope = () => {
    const f = PF.fig();
    const xs = [0, 56, 100, 134, 158, 176];
    xs.forEach((x, i) => { f.line(x, -70, x, 70, { cls: i % 5 === 0 ? 'dim' : '' }); f.label(x, -76, String(i), 'b', 'small accent'); });
    f.dot(28, 20, 3.2); f.tag(28, 20, 'A', 'b', 10);
    f.dot(146, 20, 3.2); f.tag(146, 20, 'B', 'b', 10);
    f.text(-10, -85, 'T =', 'r');
    return f.svg();
  };
  const fGrad34 = () => {
    const f = PF.fig(), u = 22;
    for (let i = -1; i <= 4; i++) f.line(i * u, u, i * u, -5 * u, { cls: 'grid nodecl' });
    for (let j = -1; j <= 5; j++) f.line(-u, -j * u, 4 * u, -j * u, { cls: 'grid nodecl' });
    f.arrow(0, 0, 3 * u, -4 * u, { cls: 'thick' });
    f.label(1.5 * u + 9, -2 * u + 4, '\\nabla T', 'tl');
    f.arrow(0, 0, 0, -2 * u, { cls: 'dim dash' });
    f.label(-6, -1.2 * u, H('y'), 'r', 'small');
    f.dot(0, 0, 3);
    f.label(-5, 6, 'P', 'tr', 'small');
    return f.svg();
  };
  const fEquip = () => {
    const f = PF.fig();
    const C0 = [-200, 0];
    [[150, '10\\text{ V}'], [190, '20\\text{ V}'], [230, '30\\text{ V}']].forEach(([R, t]) => {
      f.pl(f.arcPts(C0[0], C0[1], R, R, -32, 34), {});
      const e = [C0[0] + R * Math.cos(34 * DEG), C0[1] - R * Math.sin(34 * DEG)];
      f.label(e[0], e[1] - 8, t, 'b', 'small');
    });
    const p = [C0[0] + 190 * Math.cos(4 * DEG), C0[1] - 190 * Math.sin(4 * DEG)];
    f.dot(p[0], p[1], 3.2); f.tag(p[0], p[1], 'P', 'r', 10);
    return f.svg();
  };
  const fTwoPaths = () => {
    const f = PF.fig();
    const a = [0, 0], b = [190, -60];
    const p1 = bez(a, [30, -100], [130, -125], b), p2 = bez(a, [60, 60], [160, 40], b);
    f.pl(p1, { cls: 'thick' }); midHead(f, p1, 0.5);
    f.pl(p2, { cls: 'thick dash' }); midHead(f, p2, 0.5);
    f.dot(a[0], a[1], 3.2); f.tag(a[0], a[1], B('a'), 'l', 10);
    f.dot(b[0], b[1], 3.2); f.tag(b[0], b[1], B('b'), 'r', 10);
    const m1 = p1[18], m2 = p2[18];
    f.label(m1[0], m1[1] - 12, '1', 'b', 'small');
    f.label(m2[0], m2[1] + 12, '2', 't', 'small');
    return f.svg();
  };
  const fGradPath = (o = {}) => {
    const g = fig3(0, 0, 60);
    g.axes3(2.4, { Lz: 2.4 });
    const A = [0, 0, 0], P1 = [1, 0, 0], P2 = [1, 1, 0], Bp = [1, 1, 2];
    pl3(g, [A, P1, P2, Bp], { cls: 'thick' });
    const h = (p, q) => { const a = g.p3(...p), b = g.p3(...q); g.head((a[0] + b[0]) / 2 + (b[0] - a[0]) * 0.1, (a[1] + b[1]) / 2 + (b[1] - a[1]) * 0.1, b[0] - a[0], b[1] - a[1]); };
    h(A, P1); h(P1, P2); h(P2, Bp);
    g.l3(A, Bp, { cls: 'dash' }); h(A, Bp);
    dot3(g, A, 3); dot3(g, Bp, 3.2);
    g.label(-8, -8, B('a'), 'br');
    tag3(g, Bp, `${B('b')}\\,(1,1,2)`, 'r', 10);
    g.label(-24, 0, '1', 'c', 'small');
    const m2 = g.p3(1, 0.5, 0); g.label(m2[0], m2[1] + 10, '2', 't', 'small');
    const m3 = g.p3(1, 1, 1); g.label(m3[0] + 9, m3[1], '3', 'l', 'small');
    return g.svg();
  };
  // equipotentials of a linear potential V = -E0 z
  const fLinV = () => {
    const f = PF.fig();
    f.arrow(-24, 24, -24, -112, { cls: 'dim', hs: 6 }); f.label(-20, -115, 'z', 'bl', 'small accent');
    [[0, 'V = 0', '0'], [-45, 'V = -E_0a', 'a'], [-90, 'V = -2E_0a', '2a']].forEach(([y, t, zl]) => {
      f.line(0, y, 170, y, {});
      f.label(176, y, t, 'l', 'small');
      f.label(-30, y, zl, 'r', 'small accent');
    });
    return f.svg();
  };
  // a point P at polar angle theta from the z-axis
  const fPolar = (o = {}) => {
    const f = PF.fig();
    const th = (o.th ?? 40) * DEG, r = 105;
    f.arrow(0, 20, 0, -128, { cls: 'dim', hs: 6 }); f.label(4, -130, 'z', 'bl', 'small accent');
    f.line(-30, 0, 120, 0, { cls: 'dim thin' });
    const Px = r * Math.sin(th), Py = -r * Math.cos(th);
    f.line(0, 0, Px, Py, { cls: 'thick' });
    f.arc(0, 0, 26, 90 - (o.th ?? 40), 90, { cls: 'dim' });
    f.label(37 * Math.cos((90 - (o.th ?? 40) / 2) * DEG), -37 * Math.sin((90 - (o.th ?? 40) / 2) * DEG), '\\theta', 'c', 'small');
    f.label(Px * 0.5 + 7, Py * 0.5 + 7, 'r', 'tl');
    f.dot(Px, Py, 3.2); f.tag(Px, Py, 'P', 'r', 10);
    if (o.dipole) { f.charge(0, -9, { q: '+', r: 5 }); f.charge(0, 9, { q: '-', r: 5 }); } else f.dot(0, 0, 2.2);
    return f.svg();
  };

  // ======================================================================
  // Lesson 3: the gradient
  // ======================================================================
  const L3 = {
    id: 'u0-grad', title: 'The gradient and the gradient theorem',
    steps: [
      RF(md`
        ### What the gradient is

        For a scalar function $T(x,y,z)$ (a temperature, or a potential $V$), a small step $d\vb l$ changes $T$ by

        $$dT = \frac{\partial T}{\partial x}dx+\frac{\partial T}{\partial y}dy+\frac{\partial T}{\partial z}dz = \nabla T\cdot d\vb l,\qquad \nabla T\equiv\frac{\partial T}{\partial x}\uv x+\frac{\partial T}{\partial y}\uv y+\frac{\partial T}{\partial z}\uv z.$$

        Write $dT = |\nabla T|\,|d\vb l|\cos\alpha$. For a step of fixed length, $dT$ is largest when the step points along $\nabla T$. So:

        - $\nabla T$ points in the direction of **steepest increase** of $T$.
        - $|\nabla T|$ is the **slope** in that direction: rise per unit distance.
        - A step along a level surface ($T$ = const) has $dT = 0$, so $\nabla T$ is **perpendicular to level surfaces**.
        - The rate of change along any unit vector $\hat{\vb u}$ is $\nabla T\cdot\hat{\vb u}$ (the directional derivative).
        - At a peak, a pit or a saddle point, $\nabla T = 0$.

        [[fig:hill]]

        On a contour map, gradient arrows cross the contours at right angles, point uphill, and are longest where the contours crowd together.
      `, { hill: { svg: fContour({ arrows: true }), cap: 'Contours of a hill (numbers are the values of $T$; the summit is the centre). The arrows are $\\nabla T$: perpendicular to the contours, uphill, and longest at the top and bottom where the contours are closest.' } }),

      Q(md`The map shows contours of $T$ (numbers are the values of $T$; the summit is at the centre). Which way does $\nabla T$ point at $P$?`,
        [md`Perpendicular to the contour through $P$, toward higher $T$`, md`Straight toward the summit`, md`Along the contour through $P$`, md`Perpendicular to the contour through $P$, toward lower $T$`], 0,
        [null, md`The summit direction is the steepest way up only when the contours are circles. On these ellipses the steepest way up crosses the contour at a right angle, which is not toward the centre.`,
          md`Along a contour $T$ doesn't change at all ($dT = \nabla T\cdot d\vb l = 0$). That is the direction *perpendicular* to $\nabla T$.`,
          md`That is $-\nabla T$, the steepest way *down*. (It would be the direction of $\vb E = -\nabla V$ if $T$ were a potential.)`],
        md`Moving along the contour keeps $T$ fixed, so $\nabla T\cdot d\vb l = 0$ for every step along it: $\nabla T$ is perpendicular to the contour. Of the two perpendicular directions, the gradient takes the one in which $T$ increases.`,
        { figHtml: fContour({ P: true }) }),

      Q(md`On this map (contour values of $T$ along the top), where is $|\nabla T|$ larger?`,
        [md`At $A$, where the contours are far apart`, md`At $B$, where the contours are close together`, md`The same at both, since $T$ rises by $1$ between neighbouring contours everywhere`, md`It can't be told without a formula for $T$`], 1,
        [md`Far-apart contours mean you walk a long way to gain one unit of $T$: a gentle slope.`, null,
          md`The rise per contour is the same, but the *distance* between contours is not. Slope is rise over distance.`,
          md`The map is enough: $|\nabla T|\approx\Delta T/\Delta s$, with $\Delta s$ the contour spacing you can read off.`],
        md`$|\nabla T|$ is the rise per unit distance in the steepest direction, roughly $\Delta T$ divided by the contour spacing. For equipotentials this reads: the field is strongest where the equipotentials are closest.`,
        { figHtml: fSlope() }),

      Q(md`At a point $P$, $\nabla T = 3\,\uv x+4\,\uv y$ (figure). What is the rate of change of $T$ per unit distance as you move along $+\uv y$, and what is the largest rate in any direction?`,
        [md`$4$ and $7$`, md`$3$ and $5$`, md`$4$ and $5$`, md`$5$ and $5$`], 2,
        [md`$7 = 3+4$ adds the components. The largest rate is the magnitude $\sqrt{3^2+4^2}$.`,
          md`$3$ is the rate along $\uv x$.`, null,
          md`$5$ is the rate only along $\nabla T$ itself. Along $\uv y$ you get just the $y$-component.`],
        md`The rate along a unit vector $\hat{\vb u}$ is $\nabla T\cdot\hat{\vb u}$. Along $\uv y$ that is $4$. Its largest value, $|\nabla T| = 5$, comes when $\hat{\vb u}$ points along $\nabla T$. Perpendicular to $\nabla T$ the rate is zero: that is the contour direction.`,
        { figHtml: fGrad34() }),

      Q(md`The curves are equipotentials of $V$ (figure). Which way does $\vb E = -\nabla V$ point at $P$?`,
        [md`Along the equipotential through $P$`, md`Perpendicular to it, toward higher $V$`, md`Nowhere: $\vb E = 0$, since $V$ is constant along the curve through $P$`, md`Perpendicular to it, toward lower $V$`], 3,
        [md`Along an equipotential $V$ doesn't change, so $\vb E$ has no component along it.`,
          md`That is $+\nabla V$. The minus sign in $\vb E = -\nabla V$ sends the field downhill.`,
          md`$V$ is constant *along* that curve but changes *across* it. The gradient measures the steepest change, not the change along one curve.`, null],
        md`$\nabla V$ is perpendicular to equipotentials and points toward higher $V$; the minus sign turns $\vb E$ toward lower $V$. Field lines cross equipotentials at right angles, running from high potential to low.`,
        { figHtml: fEquip() }),

      Q(md`On the contour map of the hill (numbers are values of $T$), what is $\nabla T$ at the summit, the dot at the centre?`,
        [md`$\vb 0$`, md`The largest gradient on the map, because $T$ is highest there`, md`A vector pointing straight up, out of the map`, md`Undefined, because every direction leads downhill`], 0,
        [null, md`The size of $\nabla T$ is the slope, not the height. At the top the ground is level.`,
          md`$T(x,y)$ is defined on the plane, so $\nabla T$ lies in the plane. "Up" on a hill is the value of $T$, not a direction in space.`,
          md`$T$ is smooth at the top. Every first derivative is zero there, so the gradient exists and is the zero vector.`],
        md`At a smooth maximum all first derivatives vanish, so $\nabla T = 0$: a small step in any direction changes $T$ only at second order. For a potential: wherever $V$ has a smooth peak or pit, $\vb E = -\nabla V = 0$.`,
        { figHtml: fContour({}) }),

      Q(md`The equipotentials of $V = -E_0z$ (with $E_0>0$) are the horizontal planes shown. What is $\vb E$?`,
        [md`$-E_0\,\uv z$`, md`$+E_0\,\uv z$`, md`$-E_0z\,\uv z$`, md`$\vb 0$, because $V$ is linear`], 1,
        [md`That is $\nabla V$. The minus sign in $\vb E = -\nabla V$ flips it back.`, null,
          md`The gradient differentiates: $\partial(-E_0z)/\partial z = -E_0$, a constant. No $z$ survives.`,
          md`A linear function has a constant, nonzero slope. Only a constant $V$ gives zero field.`],
        md`$\nabla V = -E_0\,\uv z$, so $\vb E = +E_0\,\uv z$. Check with the figure: $V$ drops as $z$ increases, and $\vb E$ points toward lower $V$, so up. A uniform field always has a linear potential, with equally spaced equipotential planes.`,
        { figHtml: fLinV() }),

      RF(md`
        ### The del operator

        $$\nabla = \uv x\,\frac{\partial}{\partial x}+\uv y\,\frac{\partial}{\partial y}+\uv z\,\frac{\partial}{\partial z}$$

        $\nabla$ is not a vector by itself; it is an instruction to differentiate what stands to its right. It acts in three ways, and you should always know what type of object comes out:

        | expression | acts on | gives | name |
        |---|---|---|---|
        | $\nabla T$ | a scalar | a vector | gradient |
        | $\nabla\cdot\vb v$ | a vector | a scalar | divergence |
        | $\nabla\times\vb v$ | a vector | a vector | curl |

        Type-checking catches many errors: a "divergence of a scalar" means something got mixed up. For example, in a capacitor gap you take the divergence of the vector field $\dfrac{\sigma}{\varepsilon_0}\uv z$, never of the number $\dfrac{\sigma}{\varepsilon_0}$.
      `),

      Q(md`Which expression is meaningless?`,
        [md`$\nabla(\nabla\cdot\vb v)$`, md`$\nabla\cdot(\nabla\times\vb v)$`, md`$\nabla\times(\nabla T)$`, md`$\nabla\times(\nabla\cdot\vb v)$`], 3,
        [md`$\nabla\cdot\vb v$ is a scalar, and its gradient is a perfectly good vector.`,
          md`$\nabla\times\vb v$ is a vector, so its divergence is fine (and always zero).`,
          md`$\nabla T$ is a vector, so its curl is fine (and always zero).`, null],
        md`$\nabla\cdot\vb v$ is a scalar, and the curl needs a vector. Gradient takes a scalar; divergence and curl take vectors.`,
        { nofig: 'type-checking of operators' }),

      Q(md`What kind of object is $\nabla\cdot(\nabla T)$?`,
        [md`A vector`, md`Meaningless`, md`A scalar, the Laplacian $\nabla^2T$`, md`Always zero`], 2,
        [md`A divergence is always a scalar.`, md`$\nabla T$ is a vector, so its divergence makes sense.`, null,
          md`That is $\nabla\times(\nabla T)$. The Laplacian of $T = x^2$ is $2$.`],
        md`$\nabla\cdot\nabla T = \dfrac{\partial^2T}{\partial x^2}+\dfrac{\partial^2T}{\partial y^2}+\dfrac{\partial^2T}{\partial z^2}\equiv\nabla^2T$. With $T\to V$ and $\vb E = -\nabla V$, Gauss's law becomes Poisson's equation $\nabla^2V = -\rho/\varepsilon_0$, the starting point for Laplace's equation later in the course.`,
        { nofig: 'type-checking of operators' }),

      Q(md`$T$ is a temperature in kelvin and positions are in metres. What are the units of $\nabla T$ and of $\nabla^2T$?`,
        [md`K and K`, md`K/m and K`, md`K·m and K·m²`, md`K/m and K/m²`], 3,
        [md`Each $\partial/\partial x$ divides by a length.`,
          md`The Laplacian has two derivatives, so two factors of 1/m.`,
          md`Derivatives divide by lengths; they don't multiply.`, null],
        md`Every $\nabla$ brings a 1/m. For the potential: $\vb E = -\nabla V$ is in V/m, and $\nabla^2V$ is in V/m². That matches $\rho/\varepsilon_0$: $\dfrac{\text{C/m}^3}{\text{C/(V·m)}} = \text{V/m}^2$. A units check like this catches a lost derivative or a lost $\varepsilon_0$.`,
        { nofig: 'units' }),

      RF(md`
        ### The gradient in spherical and cylindrical coordinates

        From the formula sheet:

        $$\nabla T = \frac{\partial T}{\partial r}\uv r+\frac1r\frac{\partial T}{\partial\theta}\hat{\boldsymbol\theta}+\frac{1}{r\sin\theta}\frac{\partial T}{\partial\phi}\hat{\boldsymbol\phi}\qquad\qquad \nabla T = \frac{\partial T}{\partial s}\uv s+\frac1s\frac{\partial T}{\partial\phi}\hat{\boldsymbol\phi}+\frac{\partial T}{\partial z}\uv z$$

        The $1/r$ and $1/(r\sin\theta)$ are the line element in disguise. A step $d\theta$ moves you a distance $r\,d\theta$, and the gradient is the change of $T$ per unit *distance*, so you divide by $r$. Angles are not distances.

        The results you will use most:

        $$\nabla r = \uv r,\qquad \nabla r^n = n\,r^{n-1}\,\uv r,\qquad \nabla\frac1r = -\frac{\uv r}{r^2},\qquad \nabla\frac1\srm = -\frac{\srh}{\srm^2}.$$

        The last (Griffiths Prob. 1.13) is why $V = \kq\dfrac{q}{\srm}$ gives Coulomb's field: $\vb E = -\nabla V = \kq\dfrac{q}{\srm^2}\srh$. Here $\nabla$ acts on the field point. Differentiating with respect to the source point instead flips the sign: $\nabla'\dfrac1\srm = +\dfrac{\srh}{\srm^2}$.
      `),

      Q(md`What is $\nabla(1/r)$?`,
        [md`$-\uv r/r^2$`, md`$-1/r^2$`, md`$+\uv r/r^2$`, md`$-\uv r/r$`], 0,
        [null, md`That is $d(1/r)/dr$, a scalar. The gradient is a vector: attach the direction $\uv r$.`,
          md`$1/r$ *decreases* outward, so its steepest increase is inward. The minus sign stays.`,
          md`Wrong power: $\frac{d}{dr}r^{-1} = -r^{-2}$.`],
        md`Only the $r$ term of the spherical gradient survives: $\nabla\frac1r = \frac{\partial}{\partial r}\Big(\frac1r\Big)\uv r = -\frac{\uv r}{r^2}$. So $V = \dfrac{q}{4\pi\varepsilon_0r}$ gives $\vb E = -\nabla V = \dfrac{q}{4\pi\varepsilon_0}\dfrac{\uv r}{r^2}$, outward for $q>0$.`,
        { nofig: 'one-line derivative' }),

      Q(md`Using the spherical gradient, what is $\nabla(r\cos\theta)$?`,
        [md`$\cos\theta\,\uv r-r\sin\theta\,\hat{\boldsymbol\theta}$`, md`$\cos\theta\,\uv r$`, md`$\uv r$`, md`$\cos\theta\,\uv r-\sin\theta\,\hat{\boldsymbol\theta}$`], 3,
        [md`You forgot the $1/r$ in front of $\partial/\partial\theta$. Angles are not distances.`,
          md`The $\theta$ term is missing: $r\cos\theta$ changes with $\theta$.`,
          md`That is $\nabla r$.`, null],
        md`$\dfrac{\partial}{\partial r}(r\cos\theta) = \cos\theta$ and $\dfrac1r\dfrac{\partial}{\partial\theta}(r\cos\theta) = -\sin\theta$, so $\nabla(r\cos\theta) = \cos\theta\,\uv r-\sin\theta\,\hat{\boldsymbol\theta}$. Check: $r\cos\theta = z$, so the answer must be $\uv z$, and the formula sheet indeed lists $\uv z = \cos\theta\,\uv r-\sin\theta\,\hat{\boldsymbol\theta}$.`,
        { figHtml: fPolar({}) }),

      RF(md`
        ### Worked example: a gradient at a point

        $T = x^2y+yz$. Find $\nabla T$ at $(1,2,3)$, the steepest rate of increase there, and the rate along $\hat{\vb u} = \tfrac13(2,1,2)$.

        1. Partial derivatives: $\partial_xT = 2xy$, $\partial_yT = x^2+z$, $\partial_zT = y$. At $(1,2,3)$: $\nabla T = (4,\ 4,\ 2)$.
        2. Steepest rate: $|\nabla T| = \sqrt{16+16+4} = 6$, in the direction $\tfrac13(2,2,1)$.
        3. Rate along $\hat{\vb u}$: $\nabla T\cdot\hat{\vb u} = \tfrac13(8+4+4) = \tfrac{16}{3}\approx5.33$, a little less than $6$ because $\hat{\vb u}$ is close to, but not along, $\nabla T$.

        Check: no direction can beat $|\nabla T|$, since $\nabla T\cdot\hat{\vb u}\le|\nabla T|$.
      `),

      P({
        title: 'Gradient at a point',
        q: md`$T(x,y,z) = x^2+2yz$. At the point $(1,2,2)$ find (a) the largest rate of increase of $T$ per unit distance, (b) the direction in which it occurs, and (c) the rate of change along $\hat{\vb u} = \tfrac15(3\,\uv y+4\,\uv z)$.`,
        nofig: 'pure computation at a point',
        hints: [
          md`Everything follows from the gradient vector at the point: compute $\nabla T$ first.`,
          md`$\nabla T = (2x,\ 2z,\ 2y)$. Evaluate at $(1,2,2)$.`,
          md`Largest rate $= |\nabla T|$, along $\nabla T/|\nabla T|$. Along $\hat{\vb u}$: $\nabla T\cdot\hat{\vb u}$.`,
        ],
        parts: [
          { lbl: md`(a) largest rate`, ans: 6 },
          { lbl: md`(b) Which unit vector points in the direction of steepest increase?`, mc: [md`$\tfrac13(\uv x+2\uv y+2\uv z)$`, md`$\tfrac13(2\uv x+2\uv y+\uv z)$`, md`$\tfrac15(3\uv y+4\uv z)$`, md`$\uv x$`], a: 0,
            why: [null, md`That would be $\nabla T$ at a different point. At $(1,2,2)$, $\nabla T = (2,4,4)$.`, md`That is $\hat{\vb u}$, the direction of part (c), not the gradient.`, md`$\partial_xT = 2x$ is only one of three components.`] },
          { lbl: md`(c) rate along $\hat{\vb u}$`, ans: 5.6 },
        ],
        sol: md`
          $\nabla T = 2x\,\uv x+2z\,\uv y+2y\,\uv z$, so at $(1,2,2)$: $\nabla T = (2,4,4)$.

          (a) $|\nabla T| = \sqrt{4+16+16} = 6$.

          (b) Direction $\nabla T/|\nabla T| = \tfrac13(1,2,2)$.

          (c) $\nabla T\cdot\hat{\vb u} = \tfrac15(0\cdot2+3\cdot4+4\cdot4) = \tfrac{28}{5} = 5.6$.

          **Check.** $5.6<6$, as it must be: the cosine of the angle between $\hat{\vb u}$ and $\nabla T$ is $5.6/6\approx0.93$.

          **What to remember.** The gradient vector answers every "how fast does $T$ change" question at once: dot it with the direction you care about.
        `,
      }),

      RF(md`
        ### The fundamental theorem for gradients

        Add up $dT = \nabla T\cdot d\vb l$ along any path from $\vb a$ to $\vb b$:

        $$\int_{\vb a}^{\vb b}\nabla T\cdot d\vb l = T(\vb b)-T(\vb a).$$

        This is the fundamental theorem of calculus in 3-D clothing: the integral of a derivative is the function at the ends. Two corollaries: the line integral of a gradient is **independent of the path**, and around any closed loop $\oint\nabla T\cdot d\vb l = 0$.

        [[fig:paths]]

        In electrostatics $\vb E = -\nabla V$, so

        $$\int_{\vb a}^{\vb b}\vb E\cdot d\vb l = -\big[V(\vb b)-V(\vb a)\big],\qquad V(\vb r) = -\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l$$

        The second is on the formula sheet; the first is the gradient theorem with $T = V$ and $\nabla V = -\vb E$. The path doesn't matter, which is why "the potential at a point" makes sense. The ECE 329 review builds on this.
      `, { paths: { svg: fTwoPaths(), cap: 'Two routes from $\\vb a$ to $\\vb b$. For a gradient, both give $T(\\vb b)-T(\\vb a)$.' } }),

      Q(md`For some function $T$, $\int\nabla T\cdot d\vb l$ along path 1 from $\vb a$ to $\vb b$ is $7$ (figure). What is it along path 2?`,
        [md`$7$`, md`$-7$`, md`More than $7$, because path 2 is longer`, md`It can't be told without knowing $T$`], 0,
        [null, md`$-7$ would be the integral from $\vb b$ back to $\vb a$.`,
          md`Length doesn't matter; only the end values $T(\vb b)-T(\vb a)$ do.`,
          md`You don't need $T$ itself: both integrals equal $T(\vb b)-T(\vb a)$, and path 1 says that is $7$.`],
        md`By the gradient theorem both equal $T(\vb b)-T(\vb a) = 7$. Climbing a hill, the height you gain depends only on where you start and finish.`,
        { figHtml: fTwoPaths() }),

      Q(md`For $T = xy^2$, what is $\int\nabla T\cdot d\vb l$ from $\vb a = (0,0,0)$ to $\vb b = (2,1,0)$, along either path shown (or any other)?`,
        [md`$1$`, md`$4$`, md`$2$`, md`It depends on the path`], 2,
        [md`$T(2,1,0) = 2\cdot1^2 = 2$.`, md`$4$ would come from $x^2y$; here $T = xy^2$.`, null,
          md`The integrand is a gradient, so the path doesn't matter.`],
        md`$\int_{\vb a}^{\vb b}\nabla T\cdot d\vb l = T(\vb b)-T(\vb a) = 2-0 = 2$. No parametrisation needed.`,
        { figHtml: fTwoPaths() }),

      Q(md`A field $\vb F$ has $\oint\vb F\cdot d\vb l\neq0$ around one particular closed loop. What follows?`,
        [md`$\vb F$ is a gradient, but that loop is special`, md`$\vb F$ is not the gradient of any single-valued function`, md`$\vb F = 0$ on that loop`, md`Nothing`], 1,
        [md`For a gradient, $\oint\nabla T\cdot d\vb l = 0$ around *every* loop: you come back to the same $T$.`, null,
          md`If $\vb F$ vanished on the loop, so would the integral.`, md`One loop with nonzero circulation is enough to rule out a gradient.`],
        md`If $\vb F = \nabla T$, every loop gives $T(\text{end})-T(\text{start}) = 0$. A single loop with nonzero circulation proves $\vb F$ is not a gradient. For static $\vb E = -\nabla V$, this is why $\oint\vb E\cdot d\vb l = 0$.`,
        { nofig: 'logic of the theorem' }),

      P({
        title: 'Checking the gradient theorem',
        q: md`$T = xy+2yz$. Compute $\int\nabla T\cdot d\vb l$ from $\vb a = (0,0,0)$ to $\vb b = (1,1,2)$ along the path of three straight legs shown (solid): leg 1 to $(1,0,0)$, leg 2 to $(1,1,0)$, leg 3 up to $(1,1,2)$. Then compare with the straight line (dashed) and with $T(\vb b)-T(\vb a)$.`,
        figHtml: fGradPath(),
        hints: [
          md`A line integral of a gradient: compute $\nabla T$ once, then on each leg keep only the component along the leg.`,
          md`$\nabla T = y\,\uv x+(x+2z)\,\uv y+2y\,\uv z$. On leg 1, $y = z = 0$; on leg 2, $x = 1$, $z = 0$; on leg 3, $x = y = 1$.`,
          md`Leg 3 runs along $\uv z$ from $z = 0$ to $2$ with $(\nabla T)_z = 2y = 2$.`,
        ],
        parts: [
          { lbl: md`leg 1`, ans: 0 },
          { lbl: md`leg 2`, ans: 1 },
          { lbl: md`leg 3`, ans: 4 },
          { lbl: md`straight line from $\vb a$ to $\vb b$`, ans: 5 },
        ],
        sol: md`
          $\nabla T = y\,\uv x+(x+2z)\,\uv y+2y\,\uv z$.

          - Leg 1, $(0,0,0)\to(1,0,0)$: $d\vb l = dx\,\uv x$, $(\nabla T)_x = y = 0$. Contribution $0$.
          - Leg 2, $(1,0,0)\to(1,1,0)$: $d\vb l = dy\,\uv y$, $(\nabla T)_y = x+2z = 1$. $\int_0^1 dy = 1$.
          - Leg 3, $(1,1,0)\to(1,1,2)$: $d\vb l = dz\,\uv z$, $(\nabla T)_z = 2y = 2$. $\int_0^2 2\,dz = 4$.

          Total $0+1+4 = 5$.

          Straight line: $\vb r(t) = (t,t,2t)$, $d\vb l = (1,1,2)\,dt$, and $\nabla T = (t,\ t+4t,\ 2t)$, so $\nabla T\cdot d\vb l = (t+5t+4t)\,dt = 10t\,dt$ and $\int_0^1 10t\,dt = 5$.

          And $T(1,1,2)-T(0,0,0) = 1+4 = 5$. All three agree.

          **What to remember.** For a gradient you never need the path: $T(\vb b)-T(\vb a)$. Computing along legs is how you *test* the theorem, and the same leg-by-leg method is how you will build a potential from a curl-free $\vb E$ (Lesson 6).
        `,
      }),

      P({
        title: 'A field from a potential in spherical coordinates',
        q: md`The potential of a small dipole along $z$ has the form $V(r,\theta) = \dfrac{k\cos\theta}{r^2}$, with $k$ a constant (figure). Use the spherical gradient to find $E_r$ and $E_\theta$ of $\vb E = -\nabla V$.`,
        figHtml: fPolar({ dipole: true }),
        hints: [
          md`$\vb E = -\nabla V$, and $V$ depends on $r$ and $\theta$, so you need the spherical gradient from the formula sheet.`,
          md`$E_r = -\dfrac{\partial V}{\partial r}$ and $E_\theta = -\dfrac1r\dfrac{\partial V}{\partial\theta}$. Don't drop the $1/r$.`,
        ],
        parts: [
          { lbl: 'E_r', expr: '2*k*cos(theta)/r^3', vars: { k: [1, 3], theta: [0.2, 1.4], r: [1, 3] } },
          { lbl: 'E_\\theta', expr: 'k*sin(theta)/r^3', vars: { k: [1, 3], theta: [0.2, 1.4], r: [1, 3] } },
        ],
        sol: md`
          $$E_r = -\frac{\partial}{\partial r}\Big(\frac{k\cos\theta}{r^2}\Big) = \frac{2k\cos\theta}{r^3},\qquad E_\theta = -\frac1r\frac{\partial}{\partial\theta}\Big(\frac{k\cos\theta}{r^2}\Big) = \frac{k\sin\theta}{r^3},\qquad E_\phi = 0.$$

          So $\vb E = \dfrac{k}{r^3}\big(2\cos\theta\,\uv r+\sin\theta\,\hat{\boldsymbol\theta}\big)$, the familiar dipole field.

          **Checks.** On the $z$-axis ($\theta = 0$) the field is radial, $2k/r^3$, twice as strong as at the same distance on the equator ($\theta = \pi/2$), where it is $k/r^3$ along $\hat{\boldsymbol\theta}$ (pointing in $-z$). It falls as $1/r^3$, one power faster than a point charge.

          **What to remember.** Angle derivatives in a gradient always come with a distance factor ($1/r$, $1/(r\sin\theta)$, $1/s$).
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - $\nabla T$ points to steepest increase, its size is the slope, and it is perpendicular to level surfaces. $\vb E = -\nabla V$ points downhill, perpendicular to equipotentials, strongest where they crowd.
          - Rate along $\hat{\vb u}$ is $\nabla T\cdot\hat{\vb u}$.
          - Type-check: gradient(scalar) = vector, divergence(vector) = scalar, curl(vector) = vector.
          - Curvilinear gradient: divide angle derivatives by the distance factor ($r$, $r\sin\theta$, $s$).
          - $\nabla(1/\srm) = -\srh/\srm^2$, with $\nabla$ on the field point.
          - $\int_{\vb a}^{\vb b}\nabla T\cdot d\vb l = T(\vb b)-T(\vb a)$: path-independent, zero around loops.
      `),
    ],
  };

  // ======================================================================
  // Lesson 4 figures: divergence
  // ======================================================================
  const fBox = () => {
    const f = PF.fig();
    f.rect(0, -60, 80, 60, {});
    f.arrow(-34, -30, -2, -30, { cls: 'thick' });
    f.arrow(82, -30, 140, -30, { cls: 'thick' });
    f.label(-26, -38, 'v_x(x)', 'b', 'small');
    f.label(118, -38, 'v_x(x+dx)', 'b', 'small');
    f.dim(0, 0, 80, 0, 'dx', { off: 14, at: 'b' });
    f.text(40, -30, 'dτ', 'c');
    return f.svg();
  };
  const fCapacitor = () => {
    const f = PF.fig();
    f.rect(-74, -70, 8, 140, { cls: 'thick' }); f.rect(66, -70, 8, 140, { cls: 'thick' });
    for (const y of [-48, -16, 16, 48]) f.arrow(-60, y, 58, y, { cls: 'dim' });
    f.rect(-10, -10, 20, 20, { cls: 'dash' });
    f.label(-70, -78, '+\\sigma', 'b', 'small');
    f.label(70, -78, '-\\sigma', 'b', 'small');
    f.label(0, -64, B('E'), 'b', 'small');
    return f.svg();
  };
  const fShell = () => {
    const f = PF.fig();
    f.circle(0, 0, 50, { cls: 'dash' }); f.circle(0, 0, 85, { cls: 'dash' });
    for (let k = 0; k < 6; k++) { const a = (30 + 60 * k) * DEG; f.arrow(54 * Math.cos(a), -54 * Math.sin(a), 114 * Math.cos(a), -114 * Math.sin(a), { cls: 'dim' }); }
    f.line(0, 0, 85, 0, { cls: 'dim thin' });
    f.dot(0, 0, 2.4);
    f.label(25, -12, 'r', 'c', 'small');
    f.label(67, -13, 'dr', 'c', 'small');
    return f.svg();
  };
  const fCells = () => {
    const f = PF.fig(), c = 56;
    f.rect(0, -2 * c, 3 * c, 2 * c, { cls: 'thick' });
    f.line(c, 0, c, -2 * c, { cls: 'dim thin' }); f.line(2 * c, 0, 2 * c, -2 * c, { cls: 'dim thin' }); f.line(0, -c, 3 * c, -c, { cls: 'dim thin' });
    // a shared face: what leaves one cell enters its neighbour
    f.arrow(c - 14, -1.5 * c - 6, c + 14, -1.5 * c - 6, { cls: 'dim', hs: 5 });
    f.arrow(c + 14, -1.5 * c + 6, c - 14, -1.5 * c + 6, { cls: 'dim', hs: 5 });
    f.arrow(2.5 * c - 6, -c + 14, 2.5 * c - 6, -c - 14, { cls: 'dim', hs: 5 });
    f.arrow(2.5 * c + 6, -c - 14, 2.5 * c + 6, -c + 14, { cls: 'dim', hs: 5 });
    // outer faces: net outflow
    for (const [x, y, dx, dy] of [[0.5 * c, 0, 0, 1], [1.5 * c, -2 * c, 0, -1], [3 * c, -0.5 * c, 1, 0], [0, -1.5 * c, -1, 0], [2.5 * c, 0, 0, 1]]) f.arrow(x, y, x + 24 * dx, y + 24 * dy, { cls: 'thick', hs: 6 });
    return f.svg();
  };
  const fBlob = () => {
    const f = PF.fig();
    f.ellipse(0, 0, 70, 45, { cls: 'thick' });
    for (const y of [-26, 0, 26]) {
      const pts = bez([-120, y + 18], [-40, y - 10], [40, y + 10], [120, y - 18]);
      f.pl(pts, { cls: 'dim' }); midHead(f, pts, 0.15, { cls: 'dim' }); midHead(f, pts, 0.88, { cls: 'dim' });
    }
    f.label(52, -46, 'S', 'bl', 'small');
    return f.svg();
  };
  const fSphereDiv = () => {
    const f = PF.fig();
    const R = 80;
    f.circle(0, 0, R, {});
    f.ellipse(0, 0, R, R * 0.28, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, 0, R, R * 0.28, { half: 'front', cls: 'dim' });
    f.line(0, 0, R * Math.cos(35 * DEG), -R * Math.sin(35 * DEG), { cls: 'dim' });
    f.label(R * 0.5 * Math.cos(35 * DEG) - 4, -R * 0.5 * Math.sin(35 * DEG) - 6, 'R = 2', 'br', 'small');
    f.dot(0, 0, 2.2);
    f.label(0, R * 0.55, '\\nabla\\cdot\\mathbf{v} = 5', 'c', 'small');
    return f.svg();
  };
  const fCubeBottom = () => {
    const g = fig3(0, 0, 1);
    const a = 90;
    g.add(`<path class="shade nodecl" d="M${[[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0]].map((p) => g.p3(...p).map((v) => Math.round(v * 10) / 10).join(',')).join('L')}Z"/>`);
    g.box3(a, a, a, {});
    g.axes3(150, { box: [a, a, a] });
    const c = g.p3(a / 2, a / 2, 0);
    g.text(c[0] + 30, c[1] + 26, 'bottom face, z = 0', 'tl');
    return g.svg();
  };
  const fUnitCube = () => {
    const g = fig3(0, 0, 95);
    g.box3(1, 1, 1, {});
    g.axes3(1.5, { box: [1, 1, 1] });
    const p = g.p3(1, 0.5, 0); g.label(p[0], p[1] + 8, '1', 't', 'small');
    const q = g.p3(1, 1, 0.5); g.label(q[0] + 8, q[1], '1', 'l', 'small');
    const r = g.p3(1, 0, 0.5); g.label(r[0] - 8, r[1], '1', 'r', 'small');
    return g.svg();
  };
  const fBallR = () => {
    const f = PF.fig();
    const R = 80;
    f.circle(0, 0, R, {});
    f.ellipse(0, 0, R, R * 0.28, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, 0, R, R * 0.28, { half: 'front', cls: 'dim' });
    f.line(0, 0, R * Math.cos(35 * DEG), -R * Math.sin(35 * DEG), { cls: 'dim' });
    f.label(R * 0.5 * Math.cos(35 * DEG) - 4, -R * 0.5 * Math.sin(35 * DEG) - 6, 'R', 'br', 'small');
    f.dot(0, 0, 2.2);
    f.label(4, 6, 'O', 'tl', 'small');
    return f.svg();
  };
  const fCylRL = () => {
    const g = fig3(0, 0, 1);
    const R = 60, Ht = 120;
    ring3(g, R, Ht, { cls: '', backCls: '' });
    ring3(g, R, 0, { cls: '' });
    for (const a of [109, -71]) { const c = Math.cos(a * DEG), s = Math.sin(a * DEG); g.l3([R * c, R * s, 0], [R * c, R * s, Ht]); }
    g.l3([0, 0, 0], [0, 0, Ht], { cls: 'dim dash thin' });
    ar3(g, [0, 0, Ht], [0, 0, Ht + 40], { cls: 'dim' }); lab3(g, [0, 0, Ht + 43], 'z', 'b', 'small accent');
    const r0 = g.p3(0, 0, 0), r1 = g.p3(R * Math.cos(109 * DEG), R * Math.sin(109 * DEG), 0);
    g.dim(r1[0] + 26, r1[1], r1[0] + 26, r1[1] - Ht, 'L', { at: 'r' });
    g.text(r0[0], r0[1] + 30, 'z = 0 to z = L, radius R', 't');
    return g.svg();
  };

  // ======================================================================
  // Lesson 4: divergence and the divergence theorem
  // ======================================================================
  const L4 = {
    id: 'u0-div', title: 'Divergence and the divergence theorem',
    steps: [
      RF(md`
        ### What divergence measures

        $$\nabla\cdot\vb v = \frac{\partial v_x}{\partial x}+\frac{\partial v_y}{\partial y}+\frac{\partial v_z}{\partial z}$$

        Put a tiny box around a point and count the net flux out of it, per unit volume: that is the divergence. For a box $dx\,dy\,dz$, the flow out through the right face minus the flow in through the left face is $[v_x(x+dx)-v_x(x)]\,dy\,dz = \dfrac{\partial v_x}{\partial x}\,d\tau$, and the other two pairs of faces give the other two terms.

        [[fig:box]]

        - $\nabla\cdot\vb v>0$: a **source**; more flows out than in.
        - $\nabla\cdot\vb v<0$: a **sink**.
        - $\nabla\cdot\vb v = 0$: what flows in flows out.

        Only the change of $v_x$ **along** $x$ counts (and $v_y$ along $y$, $v_z$ along $z$). A field can vary a lot and still have zero divergence if it only varies sideways (like $y\,\uv x$). Arrows that spread apart can still have zero divergence if they weaken fast enough (like $\uv r/r^2$).

        Try the presets below. For each, decide whether a small box would gain or lose flow before you reveal the answer.
      `, { box: { svg: fBox(), cap: 'A small box: the flow out through the right face minus the flow in through the left face is $\\dfrac{\\partial v_x}{\\partial x}\\,dx\\,dy\\,dz$.' } }),

      WG.fields({ f: 'spread' }),

      Q(md`The figure shows $\vb v = x\,\uv x$. What is $\nabla\cdot\vb v$?`,
        [md`$0$, because the arrows are all parallel`, md`$x$`, md`$-1$`, md`$1$`], 3,
        [md`Parallel arrows can still have divergence: these grow along their own direction, so more leaves each box than enters.`,
          md`$\partial(x)/\partial x = 1$, not $x$.`,
          md`The arrows point away from the plane $x = 0$ on both sides and grow outward: a source, so positive.`, null],
        md`$\nabla\cdot\vb v = \partial v_x/\partial x = 1$ everywhere. Any box has a stronger flow out through its far face than in through its near face.`,
        { figHtml: fieldFig((x) => [x, 0]) }),

      Q(md`The figure shows $\vb v = y\,\uv x$: the arrows change length from row to row. What is $\nabla\cdot\vb v$?`,
        [md`$0$`, md`$1$`, md`$y$`, md`$-1$`], 0,
        [null, md`$v_x = y$ doesn't change as you move along $x$, so $\partial v_x/\partial x = 0$.`,
          md`The divergence uses $\partial v_x/\partial x$, not $v_x$ itself.`,
          md`No sink: each box loses through its right face exactly what it gains through its left face.`],
        md`Only $\partial v_x/\partial x$ counts, and $v_x = y$ doesn't depend on $x$. The arrows change *sideways*, which pushes nothing into or out of a box. (This field does have a curl: next lesson.)`,
        { figHtml: fieldFig((x, y) => [y, 0]) }),

      Q(md`In the figure $\vb v = -x\,\uv x-y\,\uv y$: the arrows converge on the origin. What is $\nabla\cdot\vb v$?`,
        [md`$+2$`, md`$-2$`, md`$0$`, md`$-1$`], 1,
        [md`Converging arrows mean a sink: more enters each box than leaves.`, null,
          md`It isn't only at the origin: the flow converges everywhere.`,
          md`Both terms contribute: $\partial(-x)/\partial x+\partial(-y)/\partial y = -1-1$.`],
        md`$\nabla\cdot\vb v = -1-1 = -2$, the same at every point, not just at the origin. Every small box takes in more than it lets out.`,
        { figHtml: fieldFig((x, y) => [-x, -y]) }),

      Q(md`The figure is a slice through $\uv r/r^2$, the shape of a point charge's field. Away from the charge the arrows spread apart and get shorter. For a small cube around a point away from the charge (dashed), what is the net outward flux?`,
        [md`Positive, because the arrows spread apart`, md`Negative, because the arrows get shorter`, md`Zero: the spreading and the weakening cancel exactly`, md`Undefined, because the field is not uniform`], 2,
        [md`Spreading alone would give a positive divergence, but the arrows also weaken as $1/r^2$.`,
          md`Weakening alone would give a negative one; the spreading compensates exactly.`, null,
          md`Divergence is defined for any smooth field; non-uniform fields are the interesting case.`],
        md`The total flux through a sphere is $v_r\cdot4\pi r^2 = 4\pi$, the same at every radius, so a thin shell (or a small cube) between two spheres has no net outflow. Hence $\nabla\cdot(\uv r/r^2) = 0$ for $r\neq0$. Only $1/r^2$ has this property, which is why the space around a point charge has $\nabla\cdot\vb E = 0$.`,
        { figHtml: fieldFig((x, y) => { const r = Math.hypot(x, y); return [x / r ** 3, y / r ** 3]; }, { skip: (x, y) => Math.hypot(x, y) < 0.3 || (x > 0.85 && x < 1.65 && y > 0.85 && y < 1.65), extra: (f, X, Y) => f.rect(X(1.07), Y(1.43), X(0.36), X(0.36), { cls: 'dash' }) }) }),

      Q(md`Between the plates of a capacitor (figure) $\vb E$ is uniform and nonzero. What does $\nabla\cdot\vb E$ tell you about the gap?`,
        [md`$\rho$ is large there, because $E$ is large`, md`$\rho$ is negative there`, md`Nothing; divergence only applies to spherical charges`, md`$\rho = 0$ in the gap: a nonzero field doesn't need local charge`], 3,
        [md`Gauss's law in differential form involves *derivatives* of $\vb E$. A uniform field has zero divergence however strong it is.`,
          md`The sign of $\rho$ follows the divergence, which is zero here.`,
          md`$\nabla\cdot\vb E = \rho/\varepsilon_0$ holds at every point, for every charge distribution.`, null],
        md`$\vb E = (\sigma/\varepsilon_0)\,\uv z$ is constant, so $\nabla\cdot\vb E = 0$ and $\rho = \varepsilon_0\nabla\cdot\vb E = 0$ in the gap. The charge sits on the plates, where $\vb E$ jumps and the divergence is not zero.`,
        { figHtml: fCapacitor() }),

      Q(md`The figure shows $\vb v = +\uv x$ for $x>0$ and $\vb v = -\uv x$ for $x<0$ (dashed: the plane $x = 0$). Where is $\nabla\cdot\vb v$ nonzero?`,
        [md`Everywhere, because the arrows point away from the plane`, md`Nowhere, because every arrow has the same length`, md`Only on the plane $x = 0$, where it is a positive spike`, md`Only on the plane $x = 0$, where it is negative`], 2,
        [md`Away from the plane $\vb v$ is constant, so all its derivatives vanish there.`,
          md`Same length on each side, but $v_x$ jumps from $-1$ to $+1$ across the plane. A thin box straddling the plane loses flux through both faces.`, null,
          md`The arrows point away from the plane on both sides: a source, not a sink.`],
        md`Off the plane, $\vb v$ is uniform and $\nabla\cdot\vb v = 0$. A thin box of face area $A$ straddling the plane has outflow $2A$ while its volume shrinks to zero, so the divergence is a spike: $\nabla\cdot\vb v = 2\,\delta(x)$. This is the shape of a charged sheet's field, $\vb E = \pm\dfrac{\sigma}{2\varepsilon_0}\uv x$, whose divergence $\dfrac{\sigma}{\varepsilon_0}\delta(x)$ is just the sheet's charge.`,
        { figHtml: fieldFig((x) => [Math.sign(x), 0], { skip: (x) => Math.abs(x) < 0.1, extra: (f, X, Y) => f.line(X(0), Y(2.2), X(0), Y(-2.2), { cls: 'dash dim' }) }) }),

      Q(md`At a point $P$, $\nabla\cdot\vb E>0$. Which statement must be true?`,
        [md`The charge density at $P$ is positive`, md`$\vb E$ points away from $P$ in every direction`, md`$|\vb E|$ is large at $P$`, md`$\vb E\neq0$ at $P$`], 0,
        [null, md`Add a strong uniform field: the divergence doesn't change, yet every arrow near $P$ now points the same way.`,
          md`Divergence measures how $\vb E$ *changes*, not how big it is. A weak field can have a large divergence.`,
          md`At the centre of a uniformly charged ball $\vb E = 0$, yet $\nabla\cdot\vb E = \rho/\varepsilon_0>0$.`],
        md`$\nabla\cdot\vb E = \rho/\varepsilon_0$ is a statement about $\rho$ and nothing else. A positive divergence means a tiny box around $P$ has more flux leaving than entering. That says nothing about the size of $\vb E$ or the direction of individual arrows.`,
        { nofig: 'conceptual' }),

      RF(md`
        ### Divergence in electrostatics

        Gauss's law, turned into a statement about each point:

        $$\nabla\cdot\vb E = \frac{\rho}{\varepsilon_0}.$$

        Read it as: lines of $\vb E$ begin on positive charge and end on negative charge (or run off to infinity); in empty space they never begin or end. Because it is local, you can run it backwards: given $\vb E$, the charge that made it is $\rho = \varepsilon_0\nabla\cdot\vb E$. The ECE 329 review does the physics; here, practise the derivative.
      `),

      Q(md`In some region $\vb E = k\,(x\,\uv x+y\,\uv y+z\,\uv z)$ with $k$ constant. What is the charge density there?`,
        [md`$\rho = \varepsilon_0k$`, md`$\rho = 3\varepsilon_0k$`, md`$\rho = 3k/\varepsilon_0$`, md`$\rho = 3\varepsilon_0k\,r$`], 1,
        [md`All three terms count: $\nabla\cdot\vb E = k+k+k$.`, null,
          md`$\rho = \varepsilon_0\nabla\cdot\vb E$: multiply by $\varepsilon_0$, don't divide.`,
          md`The divergence of $k\vb r$ is the constant $3k$; no $r$ survives.`],
        md`$\nabla\cdot\vb E = 3k$, so $\rho = 3\varepsilon_0k$, uniform. This is the field inside a uniformly charged ball, $\vb E = \dfrac{\rho}{3\varepsilon_0}\vb r$, read backwards.`,
        { nofig: 'one-line derivative' }),

      RF(md`
        ### Divergence in spherical and cylindrical coordinates

        From the formula sheet:

        $$\nabla\cdot\vb v = \frac1{r^2}\frac{\partial}{\partial r}\big(r^2v_r\big)+\frac{1}{r\sin\theta}\frac{\partial}{\partial\theta}\big(\sin\theta\,v_\theta\big)+\frac{1}{r\sin\theta}\frac{\partial v_\phi}{\partial\phi}$$

        $$\nabla\cdot\vb v = \frac1s\frac{\partial}{\partial s}\big(s\,v_s\big)+\frac1s\frac{\partial v_\phi}{\partial\phi}+\frac{\partial v_z}{\partial z}$$

        **Where the $r^2$ comes from.** Take a radial field and a thin shell between $r$ and $r+dr$. The flux through a sphere of radius $r$ is $v_r\cdot4\pi r^2$. The net outflow from the shell is the flux out at $r+dr$ minus the flux in at $r$, $\dfrac{d}{dr}\big(4\pi r^2v_r\big)\,dr$. Divide by the shell's volume $4\pi r^2\,dr$:

        $$\nabla\cdot\vb v = \frac1{r^2}\frac{d}{dr}\big(r^2v_r\big).$$

        [[fig:shell]]

        So what matters is not whether $v_r$ grows or shrinks, but whether $r^2v_r$, the total flux through a sphere, grows. The $\sin\theta$ in the $\theta$ term plays the same role (circles of latitude have circumference $2\pi r\sin\theta$), and in cylindrical coordinates the flux through a coaxial cylinder is $v_s\cdot2\pi sL$, hence the $s$.

        !!method Using the formula sheet
          1. Read off the components ($v_r,v_\theta,v_\phi$ or $v_s,v_\phi,v_z$). Anything not written is zero.
          2. Multiply each by its factor ($r^2$, $\sin\theta$, $s$) *before* differentiating.
          3. Differentiate, then divide by the same factor and the prefactor.
          4. Add *all* the terms. Never apply the Cartesian formula to curvilinear components.

        Power laws worth memorising:

        $$\nabla\cdot\big(r^n\,\uv r\big) = (n+2)\,r^{n-1},\qquad\nabla\cdot\big(s^n\,\uv s\big) = (n+1)\,s^{n-1}.$$

        $\vb r = r\,\uv r$ ($n = 1$) has divergence $3$. $\uv r/r^2$ ($n=-2$) has divergence $0$ for $r\neq0$: the point charge. $\uv s/s$ ($n=-1$) has divergence $0$ for $s\neq0$: the line charge.
      `, { shell: { svg: fShell(), cap: 'A thin shell between radii $r$ and $r+dr$. Net outflow = flux through the outer sphere minus flux through the inner one: $d(4\\pi r^2v_r)$.' } }),

      Q(md`$\vb v = \uv r$: every arrow has length $1$ (figure, a slice through the origin). What is $\nabla\cdot\uv r$?`,
        [md`$0$, because $|\uv r|$ is constant`, md`$2$`, md`$1/r$`, md`$2/r$`], 3,
        [md`Constant length isn't enough: the arrows spread apart, so the flux through a sphere, $1\cdot4\pi r^2$, grows with $r$.`,
          md`You forgot the $1/r^2$ outside: $\frac{1}{r^2}\frac{d}{dr}(r^2) = \frac{2r}{r^2}$.`,
          md`$\frac{d}{dr}(r^2) = 2r$, and $2r/r^2 = 2/r$.`, null],
        md`$\nabla\cdot\uv r = \dfrac1{r^2}\dfrac{d}{dr}(r^2\cdot1) = \dfrac2r$. Arrows of fixed length that spread apart are a source everywhere. Compare $\vb r = r\,\uv r$, divergence $3$.`,
        { figHtml: fieldFig((x, y) => { const r = Math.hypot(x, y); return [x / r, y / r]; }, { mag: false, skip: near0(0.3) }) }),

      Q(md`What is $\nabla\cdot(r^2\,\uv r)$?`,
        [md`$2r$`, md`$3r$`, md`$4r$`, md`$4r^3$`], 2,
        [md`That is $\partial v_r/\partial r$ alone, the Cartesian habit. The $r^2$ must go inside the derivative.`,
          md`That is the cylindrical-style $\frac1r\frac{\partial}{\partial r}(r\cdot r^2)$. Spherical uses $r^2$.`, null,
          md`You forgot to divide by $r^2$ after differentiating $r^4$.`],
        md`$\dfrac1{r^2}\dfrac{d}{dr}(r^2\cdot r^2) = \dfrac{4r^3}{r^2} = 4r$. Shortcut: $(n+2)r^{n-1}$ with $n = 2$.`,
        { nofig: 'formula-sheet practice' }),

      Q(md`A student computes $\nabla\cdot(\uv r/r^2)$ as $\dfrac{\partial}{\partial r}\Big(\dfrac1{r^2}\Big) = -\dfrac2{r^3}$. What went wrong?`,
        [md`Nothing; that is the divergence`, md`Only the sign`, md`They should have used $\partial/\partial\theta$`, md`They left out the $r^2$: $\frac1{r^2}\frac{\partial}{\partial r}\big(r^2\cdot r^{-2}\big) = 0$ for $r\neq0$`], 3,
        [md`$\partial v_r/\partial r$ alone is not the spherical divergence; the shell area grows as $r^2$.`,
          md`The size is wrong too, not just the sign.`,
          md`$\uv r/r^2$ has no $\theta$ dependence, so the $\theta$ term is zero.`, null],
        md`For a radial field the divergence is $\frac1{r^2}\frac{\partial}{\partial r}(r^2v_r)$. With $v_r = 1/r^2$, $r^2v_r = 1$ is constant, so the divergence is $0$ for $r\neq0$. The point $r = 0$ is different, and needs the delta function (Lesson 7).`,
        { nofig: 'error analysis of a formula' }),

      Q(md`In cylindrical coordinates, what is $\nabla\cdot(s\,\uv s)$? (In the $xy$-plane this is the field shown.)`,
        [md`$1$`, md`$2$`, md`$3$`, md`$0$`], 1,
        [md`That is $\partial v_s/\partial s$ alone. The cylindrical formula is $\frac1s\frac{\partial}{\partial s}(s\,v_s)$.`, null,
          md`$3$ is $\nabla\cdot\vb r$ in 3-D. $s\,\uv s = x\,\uv x+y\,\uv y$ has no $z$-component.`,
          md`The arrows spread out and grow: a source everywhere.`],
        md`$\frac1s\frac{\partial}{\partial s}(s\cdot s) = 2$. Check in Cartesian: $s\,\uv s = x\,\uv x+y\,\uv y$, divergence $1+1 = 2$. Shortcut: $(n+1)s^{n-1}$.`,
        { figHtml: fieldFig((x, y) => [x, y]) }),

      Q(md`The uniform field $\uv z$ (figure), written in spherical components, is $\cos\theta\,\uv r-\sin\theta\,\hat{\boldsymbol\theta}$. What does the spherical divergence formula give?`,
        [md`$\dfrac{2\cos\theta}{r}$, from the $r$ term`, md`$-\dfrac{2\cos\theta}{r}$, from the $\theta$ term`, md`$0$: the $r$ and $\theta$ terms cancel`, md`$\cos\theta$`], 2,
        [md`That is only the $r$ term; the $\theta$ term contributes too.`, md`That is only the $\theta$ term.`, null,
          md`Every term carries a $1/r$; none is just $\cos\theta$.`],
        md`$r$ term: $\frac1{r^2}\frac{\partial}{\partial r}(r^2\cos\theta) = \frac{2\cos\theta}{r}$. $\theta$ term: $\frac1{r\sin\theta}\frac{\partial}{\partial\theta}\big(\sin\theta\cdot(-\sin\theta)\big) = -\frac{2\cos\theta}{r}$. Sum $0$, as it must be for a uniform field. Individual terms of a curvilinear divergence mean nothing by themselves; add them all.`,
        { figHtml: fieldFig(() => [0, 1], { n: 7, S: 40, xl: 'x', yl: 'z', extra: (f) => f.circle(0, 0, 58, { cls: 'grid' }) }) }),

      RF(md`
        ### The divergence theorem

        $$\int_V(\nabla\cdot\vb v)\,d\tau = \oint_S\vb v\cdot d\vb a$$

        $S$ is the closed surface around $V$, with $d\vb a$ pointing **outward**. Cut $V$ into tiny cells. Each cell's divergence times its volume is its own net outflow. Where two cells touch, the flux out of one is the flux into the other, so every shared face cancels and only the outer skin survives: "all the sources inside = the net flow out through the boundary."

        [[fig:cells]]

        To **test** the theorem (a standard homework task), compute the left side as one volume integral and the right side face by face, listing every face, including those that turn out to be zero, and check that they agree.

        Applied to $\vb E$ with $\nabla\cdot\vb E = \rho/\varepsilon_0$, the theorem turns $\int\rho\,d\tau/\varepsilon_0$ into $\oint\vb E\cdot d\vb a$: the integral form of Gauss's law.
      `, { cells: { svg: fCells(), cap: 'Across each shared wall, what leaves one cell enters the next (thin arrows), so interior faces cancel. Only flux through the outer boundary (thick arrows) is left.' } }),

      Q(md`$\nabla\cdot\vb v = 0$ everywhere inside the closed surface $S$, and $\vb v$ is smooth there (figure). What is the outward flux through $S$?`,
        [md`$0$`, md`Positive, if $\vb v$ points outward somewhere`, md`The surface area times the average $|\vb v|$`, md`It can't be told`], 0,
        [null, md`Flux can leave through part of the surface, but the same amount then enters elsewhere.`,
          md`That ignores the sign of $\vb v\cdot d\vb a$, which is negative where the field enters.`,
          md`The divergence theorem decides it: $\oint\vb v\cdot d\vb a = \int\nabla\cdot\vb v\,d\tau = 0$.`],
        md`$\oint_S\vb v\cdot d\vb a = \int_V\nabla\cdot\vb v\,d\tau = 0$. The lines that enter on the left leave on the right. For $\vb E$: no charge inside means zero net flux.`,
        { figHtml: fBlob() }),

      Q(md`If $\nabla\cdot\vb v = 5$ everywhere, what is the outward flux through the sphere of radius $2$ shown?`,
        [md`$20\pi$`, md`$80\pi$`, md`$\tfrac{160\pi}{3}$`, md`$0$`], 2,
        [md`$5\times4\pi$ uses $4\pi$ in place of the volume $\tfrac43\pi(2)^3$.`,
          md`$5\times4\pi(2)^2$ multiplies by the surface area. Divergence is integrated over the volume.`, null,
          md`A nonzero divergence inside means a net outflow.`],
        md`$\oint\vb v\cdot d\vb a = \int\nabla\cdot\vb v\,d\tau = 5\cdot\tfrac43\pi(2)^3 = \tfrac{160\pi}{3}$. Divergence is flux *per unit volume*, so multiply by the volume.`,
        { figHtml: fSphereDiv() }),

      Q(md`For the bottom face of the cube shown (in the plane $z = 0$), what is the outward $d\vb a$?`,
        [md`$+\uv z\,dx\,dy$`, md`$-\uv z\,dx\,dy$`, md`$+\uv x\,dy\,dz$`, md`Either sign; it doesn't matter for a closed surface`], 1,
        [md`$+\uv z$ points from the bottom face into the cube.`, null,
          md`The bottom face lies at constant $z$, so its normal is along $\uv z$.`,
          md`For a closed surface the convention is fixed (outward), and the sign decides that face's contribution.`],
        md`Outward from the bottom is down: $d\vb a = -\uv z\,dx\,dy$, so the bottom contributes $-\int v_z(x,y,0)\,dx\,dy$. Getting this sign wrong is the most common mistake in divergence-theorem checks.`,
        { figHtml: fCubeBottom() }),

      Q(md`The net outward flux of $\vb v$ through the closed surface $S$ shown is $-3$. Which statement must be true?`,
        [md`$\nabla\cdot\vb v = -3$ everywhere inside $S$`, md`$\vb v$ points inward everywhere on $S$`, md`$\nabla\cdot\vb v<0$ everywhere inside $S$`, md`$\int_V\nabla\cdot\vb v\,d\tau = -3$, so $\nabla\cdot\vb v<0$ somewhere inside`], 3,
        [md`$-3$ is the *integral* of the divergence over the volume, not its value at each point, and it need not be uniform.`,
          md`A net inflow still allows outflow through part of the surface.`,
          md`Sources and sinks can both sit inside; only their total is fixed.`, null],
        md`By the divergence theorem $\int_V\nabla\cdot\vb v\,d\tau = \oint_S\vb v\cdot d\vb a = -3$. A negative total needs a sink somewhere, though sources may be present too. For $\vb E$: a net inward flux means net negative charge inside, $Q_{\text{enc}} = \varepsilon_0\oint\vb E\cdot d\vb a<0$.`,
        { figHtml: fBlob() }),

      RF(md`
        ### Worked example: testing the divergence theorem on a cube

        $\vb v = xy\,\uv x+yz\,\uv y+zx\,\uv z$ on the unit cube $0\le x,y,z\le1$.

        [[fig:cube]]

        **Volume side.** $\nabla\cdot\vb v = y+z+x$, and $\int_0^1\!\!\int_0^1\!\!\int_0^1(x+y+z)\,dx\,dy\,dz = \tfrac12+\tfrac12+\tfrac12 = \tfrac32$.

        **Surface side**, all six faces with outward normals:

        | face | $d\vb a$ | $\vb v\cdot d\vb a$ | flux |
        |---|---|---|---|
        | $x=1$ | $+\uv x\,dy\,dz$ | $y$ | $\tfrac12$ |
        | $x=0$ | $-\uv x\,dy\,dz$ | $0$ | $0$ |
        | $y=1$ | $+\uv y\,dx\,dz$ | $z$ | $\tfrac12$ |
        | $y=0$ | $-\uv y\,dx\,dz$ | $0$ | $0$ |
        | $z=1$ | $+\uv z\,dx\,dy$ | $x$ | $\tfrac12$ |
        | $z=0$ | $-\uv z\,dx\,dy$ | $0$ | $0$ |

        Total $\tfrac32$. It checks. Notice how the outward normal flips sign on opposite faces, and how each face integral is a simple 2-D integral once you set the fixed coordinate.
      `, { cube: { svg: fUnitCube(), cap: 'The unit cube; hidden edges dashed.' } }),

      P({
        title: 'Divergence theorem on a sphere',
        q: md`Test the divergence theorem for $\vb v = r^2\,\uv r$ on the ball of radius $R$ centred on the origin (figure): find $\nabla\cdot\vb v$, the volume integral, and the surface integral.`,
        figHtml: fBallR(),
        hints: [
          md`Spherical symmetry: use the spherical divergence (only the $r$ term) and $d\tau = r^2\sin\theta\,dr\,d\theta\,d\phi$.`,
          md`$\nabla\cdot\vb v = \frac1{r^2}\frac{d}{dr}(r^4)$. On the surface, $\vb v\cdot d\vb a = R^2\cdot R^2\sin\theta\,d\theta\,d\phi$.`,
        ],
        parts: [
          { lbl: md`$\nabla\cdot\vb v$`, expr: '4*r', vars: { r: [0.5, 3] } },
          { lbl: md`$\int_V\nabla\cdot\vb v\,d\tau$`, expr: '4*pi*R^4', vars: { R: [0.5, 3] } },
          { lbl: md`$\oint_S\vb v\cdot d\vb a$`, expr: '4*pi*R^4', vars: { R: [0.5, 3] } },
        ],
        sol: md`
          $\nabla\cdot\vb v = \dfrac1{r^2}\dfrac{d}{dr}(r^2\cdot r^2) = 4r$.

          Volume: $\displaystyle\int_0^R\!\!4r\cdot4\pi r^2\,dr = 16\pi\frac{R^4}{4} = 4\pi R^4$ (the angular integral of $\sin\theta\,d\theta\,d\phi$ gives $4\pi$).

          Surface: on $r = R$, $\vb v\cdot d\vb a = R^2\cdot R^2\sin\theta\,d\theta\,d\phi$, so $\oint = R^4\cdot4\pi = 4\pi R^4$. They agree.

          **What to remember.** For radial fields in spheres, both sides collapse to 1-D integrals; the $4\pi$ comes from the angles.
        `,
      }),

      P({
        title: 'Divergence theorem on a cylinder',
        q: md`Test the divergence theorem for $\vb v = s^2\,\uv s+z\,\uv z$ on the solid cylinder of radius $R$ from $z = 0$ to $z = L$ (figure).`,
        figHtml: fCylRL(),
        hints: [
          md`Cylindrical problem: use the cylindrical divergence and $d\tau = s\,ds\,d\phi\,dz$. The closed surface has three pieces: curved side, top, bottom.`,
          md`$\nabla\cdot\vb v = \frac1s\frac{\partial}{\partial s}(s\cdot s^2)+\frac{\partial z}{\partial z}$.`,
          md`Side: $d\vb a = R\,d\phi\,dz\,\uv s$ with $v_s = R^2$. Top: $d\vb a = s\,ds\,d\phi\,\uv z$ with $v_z = L$. Bottom: outward normal $-\uv z$ and $v_z = 0$.`,
        ],
        parts: [
          { lbl: md`$\nabla\cdot\vb v$`, expr: '3*s+1', vars: { s: [0.5, 3] } },
          { lbl: md`flux through the curved side`, expr: '2*pi*R^3*L', vars: { R: [0.5, 3], L: [0.5, 3] } },
          { lbl: md`flux through the top`, expr: 'pi*R^2*L', vars: { R: [0.5, 3], L: [0.5, 3] } },
          { lbl: md`Why is the bottom's flux zero?`, mc: [md`Because $v_z = 0$ at $z = 0$`, md`Because the bottom's normal is horizontal`, md`Because the flux through the bottom cancels the top`, md`It isn't zero; it equals the top's`], a: 0,
            why: [null, md`The bottom is a flat disk at constant $z$; its normal is $-\uv z$.`, md`Top and bottom don't cancel: $v_z = z$ differs between them.`, md`At $z=0$, $v_z = 0$, so nothing crosses the bottom.`] },
          { lbl: md`$\int_V\nabla\cdot\vb v\,d\tau$`, expr: '2*pi*R^3*L + pi*R^2*L', vars: { R: [0.5, 3], L: [0.5, 3] } },
        ],
        sol: md`
          **Divergence.** $\nabla\cdot\vb v = \dfrac1s\dfrac{\partial}{\partial s}(s^3)+1 = 3s+1$.

          **Volume.** $\displaystyle\int_0^L\!\!\int_0^{2\pi}\!\!\int_0^R(3s+1)\,s\,ds\,d\phi\,dz = 2\pi L\Big(R^3+\frac{R^2}{2}\Big) = 2\pi R^3L+\pi R^2L.$

          **Surface.**
          - Curved side ($s = R$): $\vb v\cdot d\vb a = R^2\cdot R\,d\phi\,dz$, total $2\pi R^3L$.
          - Top ($z = L$): $\vb v\cdot d\vb a = L\,s\,ds\,d\phi$, total $L\cdot\pi R^2$.
          - Bottom ($z = 0$): $\vb v\cdot d\vb a = -v_z\,s\,ds\,d\phi = 0$.

          Sum $2\pi R^3L+\pi R^2L$, matching the volume integral.

          **What to remember.** List every face of the closed surface; some vanish for a reason (here $v_z = 0$ on the bottom), and you should be able to say which.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Divergence = net outflow per unit volume. Only $\partial v_x/\partial x$-type terms count; sideways variation does nothing.
          - Spherical: $\frac1{r^2}\partial_r(r^2v_r)$, cylindrical: $\frac1s\partial_s(sv_s)$. Factor in, differentiate, factor out, add all terms.
          - $\nabla\cdot(r^n\uv r) = (n+2)r^{n-1}$; $\nabla\cdot(s^n\uv s) = (n+1)s^{n-1}$. $\vb r\to3$, $\uv r\to2/r$, $\uv r/r^2\to0$ (except at $0$).
          - $\nabla\cdot\vb E = \rho/\varepsilon_0$: zero divergence where there is no charge, even if $\vb E$ is large.
          - Divergence theorem: $\int_V\nabla\cdot\vb v\,d\tau = \oint_S\vb v\cdot d\vb a$, outward normal, every face.
      `),
    ],
  };

  // ======================================================================
  // Lesson 5 figures: curl and Stokes
  // ======================================================================
  const fLoop = () => {
    const f = PF.fig(), a = 90;
    f.rect(0, -a, a, a, { cls: 'thick' });
    f.head(a / 2 + 6, 0, 1, 0); f.head(a, -a / 2 - 6, 0, -1); f.head(a / 2 - 6, -a, -1, 0); f.head(0, -a / 2 + 6, 0, 1);
    f.label(a + 9, -a / 2, 'v_y(x+dx)', 'l', 'small');
    f.label(-9, -a / 2, 'v_y(x)', 'r', 'small');
    f.label(a / 2, 9, 'v_x(y)', 't', 'small');
    f.label(a / 2, -a - 9, 'v_x(y+dy)', 'b', 'small');
    outOf(f, a / 2, -a / 2, 6);
    f.label(a / 2 + 10, -a / 2, H('z'), 'l', 'small');
    return f.svg();
  };
  const dipoleE = (x, y) => {
    const d1 = Math.hypot(x + 0.7, y) ** 3, d2 = Math.hypot(x - 0.7, y) ** 3;
    return [(x + 0.7) / d1 - (x - 0.7) / d2, y / d1 - y / d2];
  };
  const fDipole = () => fieldFig(dipoleE, { skip: (x, y) => Math.hypot(x + 0.7, y) < 0.36 || Math.hypot(x - 0.7, y) < 0.36,
    extra: (f, X, Y) => { f.charge(X(-0.7), Y(0), { q: '+', r: 6 }); f.charge(X(0.7), Y(0), { q: '-', r: 6 }); } });
  const fClosed = () => {
    const f = PF.fig();
    const pts = f.arcPts(0, 0, 62, 48, 0, 360, 72);
    f.pl(pts, { cls: 'thick' });
    for (const fr of [0.12, 0.37, 0.62, 0.87]) midHead(f, pts, fr);
    f.text(0, 62, 'a closed field line?', 't');
    return f.svg();
  };
  const fStokes = (o = {}) => {
    const f = PF.fig();
    const rx = 95, ry = 26, hy = 85;
    if (o.disk) f.ellipse(0, 0, rx, ry, { cls: 'shade nodecl' });
    f.pl(f.arcPts(0, 0, rx, hy, 0, 180), {});
    f.ellipse(0, 0, rx, ry, { half: 'back', cls: 'dash' });
    const front = f.arcPts(0, 0, rx, ry, 180, 360);
    f.pl(front, { cls: 'thick' });
    midHead(f, front, 0.28); midHead(f, front, 0.72);
    f.head(-6, -ry, -1, 0, {});
    if (o.normal !== false) { f.arrow(0, -hy, 0, -hy - 40, { cls: 'thick' }); f.tag(0, -hy - 40, `d${B('a')}`, 't', 8); }
    if (o.labels !== false) { f.label(-45, -48, 'S', 'c'); f.label(0, ry + 10, '\\mathcal{P}', 't'); }
    if (o.disk) { f.text(0, ry + 10, 'flat disk (shaded)', 't'); f.text(78, -72, 'hemisphere', 'bl'); }
    return f.svg();
  };
  const fCW = () => {
    const f = PF.fig();
    const rx = 95, ry = 26;
    f.ellipse(0, 0, rx, ry, { half: 'back', cls: '' });
    const front = f.arcPts(0, 0, rx, ry, 360, 180);
    f.pl(front, { cls: 'thick' });
    midHead(f, front, 0.28); midHead(f, front, 0.72);
    f.head(6, -ry, 1, 0, {});
    triad(f, -150, 40, 24);
    f.text(0, ry + 12, 'loop in the xy-plane', 't');
    return f.svg();
  };
  const fVortexLoop = () => fieldFig((x, y) => { const s2 = x * x + y * y; return [-y / s2, x / s2]; }, { skip: (x, y) => Math.hypot(x, y) < 0.3,
    extra: (f, X) => { const c = f.arcPts(0, 0, X(1.25), X(1.25), 0, 360, 72); f.pl(c, { cls: 'thick dash' }); midHead(f, c, 0.12); midHead(f, c, 0.62); } });
  const fSquare = () => {
    const f = PF.fig(), u = 110;
    f.axes(0, 0, { x: [0, 1.35 * u], y: [0, 1.35 * u], xl: 'x', yl: 'y' });
    f.rect(0, -u, u, u, { cls: 'thick' });
    f.head(u / 2 + 6, 0, 1, 0); f.head(u, -u / 2 - 6, 0, -1); f.head(u / 2 - 6, -u, -1, 0); f.head(0, -u / 2 + 6, 0, 1);
    f.label(-6, 6, '(0,0)', 'tr', 'small'); f.label(u + 6, 6, '(1,0)', 'tl', 'small');
    f.label(u + 6, -u - 6, '(1,1)', 'bl', 'small'); f.label(-6, -u - 6, '(0,1)', 'br', 'small');
    return f.svg();
  };
  const fCircleR = () => {
    const f = PF.fig(), R = 90;
    f.axes(0, 0, { x: [-120, 125], y: [-120, 125], xl: 'x', yl: 'y' });
    const c = f.arcPts(0, 0, R, R, 0, 360, 72);
    f.pl(c, { cls: 'thick' });
    for (const fr of [0.125, 0.375, 0.625, 0.875]) midHead(f, c, fr);
    f.line(0, 0, R * Math.cos(-30 * DEG), -R * Math.sin(-30 * DEG), { cls: 'dim' });
    f.label(34, 31, 'R', 'tr', 'small');
    return f.svg();
  };
  const r1 = (v) => Math.round(v * 10) / 10;
  const shade3 = (g, pts) => g.add(`<path class="shade nodecl" d="M${pts.map((p) => g.p3(...p).map(r1).join(',')).join('L')}Z"/>`);
  const head3 = (g, p, q) => { const a = g.p3(...p), b = g.p3(...q); g.head((a[0] + b[0]) / 2 + (b[0] - a[0]) * 0.08, (a[1] + b[1]) / 2 + (b[1] - a[1]) * 0.08, b[0] - a[0], b[1] - a[1]); };
  const fTri = (sol) => {
    const g = fig3(0, 0, 50);
    g.axes3(2.7, { Lx: 1.6 });
    const O = [0, 0, 0], Y2 = [0, 2, 0], Z2 = [0, 0, 2];
    shade3(g, [O, Y2, Z2]);
    pl3(g, [O, Y2, Z2, O], { cls: 'thick' });
    head3(g, O, Y2); head3(g, Y2, Z2); head3(g, Z2, O);
    g.label(100, 8, '2', 't', 'small'); g.label(-8, -100, '2', 'r', 'small');
    if (sol) {
      const c = g.p3(0, 2 / 3, 2 / 3);
      outOf(g, c[0], c[1], 6);
      g.label(c[0], c[1] + 11, `d${B('a')}`, 't', 'small');
      g.label(50, 8, '(i)', 't', 'small');
      g.label(58, -58, '(ii)', 'bl', 'small');
      g.label(-8, -50, '(iii)', 'r', 'small');
    }
    return g.svg();
  };
  const fQuarter = (sol) => {
    const g = fig3(0, 0, 26);
    const arc = (z) => circ3([0, 0, z], [1, 0, 0], [0, 1, 0], 2, 0, 90, 30);
    g.l3([0, 0, 0], [2, 0, 0], { cls: 'dash dim' }); g.l3([0, 0, 0], [0, 2, 0], { cls: 'dash dim' }); g.l3([0, 0, 0], [0, 0, 5], { cls: 'dash dim' });
    shade3(g, [[0, 0, 5]].concat(arc(5)));
    pl3(g, arc(0), {}); pl3(g, arc(5), {});
    g.l3([2, 0, 0], [2, 0, 5]); g.l3([0, 2, 0], [0, 2, 5]); g.l3([0, 0, 5], [2, 0, 5]); g.l3([0, 0, 5], [0, 2, 5]);
    ar3(g, [2, 0, 0], [3.4, 0, 0], { cls: 'dim', hs: 6 }); ar3(g, [0, 2, 0], [0, 3.5, 0], { cls: 'dim', hs: 6 }); ar3(g, [0, 0, 5], [0, 0, 6.3], { cls: 'dim', hs: 6 });
    const X = g.p3(3.4, 0, 0), Yp = g.p3(0, 3.5, 0), Z = g.p3(0, 0, 6.3);
    g.label(X[0] - 4, X[1] + 4, 'x', 'tr', 'small accent'); g.label(Yp[0] + 5, Yp[1], 'y', 'l', 'small accent'); g.label(Z[0] + 4, Z[1] - 2, 'z', 'bl', 'small accent');
    g.label(-27, 9, '2', 'r', 'small'); g.label(52, 7, '2', 't', 'small'); g.label(-8, -136, '5', 'br', 'small');
    if (sol) {
      const a = [Math.cos(70 * DEG), Math.sin(70 * DEG)];
      ar3(g, [2 * a[0], 2 * a[1], 2.5], [3 * a[0], 3 * a[1], 2.5], { cls: 'thick', hs: 6 });
      tag3(g, [3 * a[0], 3 * a[1], 2.5], '25\\pi', 'r', 8, 'small');
      ar3(g, [1, 1, 5], [1, 1, 6.2], { cls: 'thick', hs: 6 });
      tag3(g, [1, 1, 6.2], '15\\pi', 'r', 9, 'small');
    }
    return g.svg();
  };
  const fQuarterTop = () => {
    const f = PF.fig(), R = 90;
    f.arrow(0, 0, 125, 0, { cls: 'dim', hs: 6 }); f.label(129, 2, 'x', 'l', 'small accent');
    f.arrow(0, 0, 0, -125, { cls: 'dim', hs: 6 }); f.label(4, -128, 'y', 'bl', 'small accent');
    f.poly([[0, 0]].concat(f.arcPts(0, 0, R, R, 0, 90)), { cls: 'shade nodecl' });
    f.pl(f.arcPts(0, 0, R, R, 0, 90), { cls: 'thick' });
    f.line(0, 0, R, 0, { cls: 'thick' }); f.line(0, 0, 0, -R, { cls: 'thick' });
    f.arrow(45, 0, 45, 26, { hs: 6 }); f.label(45, 31, `-${H('y')}`, 't', 'small');
    f.arrow(0, -45, -26, -45, { hs: 6 }); f.label(-31, -45, `-${H('x')}`, 'r', 'small');
    const c = Math.cos(45 * DEG);
    f.arrow(R * c, -R * c, (R + 26) * c, -(R + 26) * c, { hs: 6 }); f.tag((R + 26) * c, -(R + 26) * c, H('s'), 'tr', 6, 'small');
    f.label(-6, 6, 'O', 'tr', 'small');
    return f.svg();
  };

  // ======================================================================
  // Lesson 5: curl and Stokes' theorem
  // ======================================================================
  const L5 = {
    id: 'u0-curl', title: "Curl and Stokes' theorem",
    steps: [
      RF(md`
        ### What curl measures

        $$\nabla\times\vb v = \begin{vmatrix}\uv x&\uv y&\uv z\\ \partial_x&\partial_y&\partial_z\\ v_x&v_y&v_z\end{vmatrix} = \Big(\frac{\partial v_z}{\partial y}-\frac{\partial v_y}{\partial z}\Big)\uv x+\Big(\frac{\partial v_x}{\partial z}-\frac{\partial v_z}{\partial x}\Big)\uv y+\Big(\frac{\partial v_y}{\partial x}-\frac{\partial v_x}{\partial y}\Big)\uv z$$

        Go around a tiny loop and add up $\vb v\cdot d\vb l$: that is the **circulation**. The component of the curl along the loop's normal is the circulation per unit area. For a small square $dx\,dy$ traversed counter-clockwise (seen from $+z$), the right and left edges give $[v_y(x+dx)-v_y(x)]\,dy$ and the bottom and top give $-[v_x(y+dy)-v_x(y)]\,dx$. The total is $\Big(\dfrac{\partial v_y}{\partial x}-\dfrac{\partial v_x}{\partial y}\Big)dx\,dy$: the $z$-component of the curl times the area.

        [[fig:loop]]

        **Paddle-wheel test.** Put a tiny paddle wheel in the flow with its axle along $\hat{\vb n}$. If the flow pushes one side harder than the other, the wheel spins and $(\nabla\times\vb v)\cdot\hat{\vb n}\neq0$. Right-hand rule: curl your fingers with the spin; your thumb gives the direction of the curl.

        Curl is about *differences across* the flow, not about whether the arrows look curved. Test the presets below: shear has straight arrows and a curl; vortex has circular arrows and (away from the axis) none.
      `, { loop: { svg: fLoop(), cap: 'A small loop in the $xy$-plane, counter-clockwise seen from $+z$ (out of the page). The edge values of $v_x$ and $v_y$ give the circulation.' } }),

      WG.fields({ f: 'swirl' }),

      Q(md`For $\vb v = -y\,\uv x+x\,\uv y$ (figure: counter-clockwise rotation, $\uv z$ out of the page), what is $\nabla\times\vb v$?`,
        [md`$0$`, md`$\uv z$`, md`$2\,\uv z$`, md`$-2\,\uv z$`], 2,
        [md`It plainly circulates: a paddle wheel anywhere would spin.`,
          md`Both $\partial_xv_y$ and $-\partial_yv_x$ contribute $1$.`, null,
          md`Counter-clockwise flow seen from $+z$ gives a curl along $+\uv z$ by the right-hand rule.`],
        md`$(\nabla\times\vb v)_z = \partial_xv_y-\partial_yv_x = 1-(-1) = 2$. For a rigid rotation $\vb v = \boldsymbol\omega\times\vb r$ the curl is $2\boldsymbol\omega$, the same at every point, not just at the centre.`,
        { figHtml: fieldFig((x, y) => [-y, x]) }),

      Q(md`$\vb v = y\,\uv x$ (figure): every arrow points along $x$. What is $\nabla\times\vb v$?`,
        [md`$-\uv z$`, md`$0$, since the arrows are straight`, md`$+\uv z$`, md`$-\uv x$`], 0,
        [null, md`Straight arrows can still circulate: a paddle wheel feels a stronger push on its top than on its bottom.`,
          md`Top faster than bottom, both to the right: the wheel turns clockwise, which is $-\uv z$ with $\uv z$ out of the page.`,
          md`For a field in the $xy$-plane that depends only on $x$ and $y$, the curl can only point along $\uv z$.`],
        md`$(\nabla\times\vb v)_z = \partial_xv_y-\partial_yv_x = 0-1 = -1$.`,
        { figHtml: fieldFig((x, y) => [y, 0]) }),

      Q(md`$\vb v = \hat{\boldsymbol\phi}/s$ (figure) circles the $z$-axis. What is its curl away from the axis?`,
        [md`$\uv z/s^2$`, md`$2\,\uv z$`, md`$0$`, md`Infinite everywhere`], 2,
        [md`Use the cylindrical formula: $\frac1s\frac{\partial}{\partial s}\big(s\cdot\frac1s\big) = 0$.`,
          md`$2\,\uv z$ belongs to rigid rotation, $s\,\hat{\boldsymbol\phi}$, whose speed grows with $s$. Here the speed falls as $1/s$.`, null,
          md`It is zero for $s\neq0$; only the axis is special.`],
        md`$(\nabla\times\vb v)_z = \frac1s\frac{\partial}{\partial s}(s\,v_\phi) = \frac1s\frac{\partial}{\partial s}(1) = 0$. A small paddle wheel feels a slower flow on its outer side, and that exactly cancels the turning from the curved path. All the circulation is concentrated on the axis.`,
        { figHtml: fieldFig((x, y) => { const s2 = x * x + y * y; return [-y / s2, x / s2]; }, { skip: near0(0.3) }) }),

      Q(md`What is the curl of any purely radial field $f(r)\,\uv r$, like the one shown?`,
        [md`$f'(r)\,\hat{\boldsymbol\phi}$`, md`Nonzero wherever $f$ decreases`, md`$f(r)/r$`, md`$0$`], 3,
        [md`Curl measures circulation, and a radial field never pushes around a loop.`,
          md`Growing or shrinking along the radius doesn't create rotation.`,
          md`That isn't even a vector.`, null],
        md`In the spherical curl every term contains $v_\theta$, $v_\phi$, or an angle derivative of $v_r$; for $v_r = f(r)$ they all vanish. This is the calculation for a point charge. Around any small loop, a radial field helps on one side exactly as much as it opposes on the other.`,
        { figHtml: fieldFig((x, y) => { const r = Math.hypot(x, y); return [x / r ** 3, y / r ** 3]; }, { skip: near0(0.3) }) }),

      Q(md`The field lines of a dipole (figure) are curved. Does that mean the field has a curl?`,
        [md`Yes: curved lines always mean rotation`, md`Only where the lines are circles`, md`No: it is an electrostatic field, so its curl is zero everywhere away from the charges`, md`Only between the charges`], 2,
        [md`Curvature of the lines is not circulation: $\hat{\boldsymbol\phi}/s$ has circular lines and no curl, $y\,\uv x$ has straight lines and a curl.`,
          md`Even circular lines can be curl-free (the vortex).`, null,
          md`Every static $\vb E$ is curl-free, including between the charges.`],
        md`An electrostatic field is a superposition of point-charge fields, each curl-free, so $\nabla\times\vb E = 0$. Curl is a local property (would a tiny paddle wheel spin?), not a property of the shape of the field lines.`,
        { figHtml: fDipole() }),

      Q(md`Could a static electric field have a field line that closes on itself, like the loop drawn?`,
        [md`Yes, around a ring of charge`, md`Yes, if the loop is small enough`, md`Only inside a conductor`, md`No: along a closed field line $\vb E\cdot d\vb l>0$ all the way round, so $\oint\vb E\cdot d\vb l>0$, but static fields have $\oint\vb E\cdot d\vb l = 0$`], 3,
        [md`The lines of a charged ring start on the ring and run off to infinity; none close.`,
          md`Size doesn't help: $\oint\vb E\cdot d\vb l = 0$ for every loop.`,
          md`Inside a conductor in equilibrium $\vb E = 0$.`, null],
        md`Along a field line $\vb E$ is parallel to $d\vb l$, so the integrand is positive everywhere. Static fields have zero curl, hence (Stokes) zero circulation. So electrostatic field lines begin on positive charge and end on negative charge or at infinity; they never close. Magnetic field lines do.`,
        { figHtml: fClosed() }),

      Q(md`Water flows along $+y$ (figure), fastest in the middle of the channel and slower toward the banks: $\vb v = v_0\big(1-x^2/b^2\big)\uv y$. Which way does a small paddle wheel at $P$, left of the centre line, spin (seen from $+z$, out of the page)?`,
        [md`Clockwise`, md`Counter-clockwise`, md`It doesn't spin: the arrows are all parallel`, md`It doesn't spin; only a wheel on the centre line would`], 1,
        [md`The wheel's right side, nearer the centre, is pushed up harder than its left side. That turns it counter-clockwise.`, null,
          md`Parallel arrows can circulate. What matters is that the speed changes *across* the flow.`,
          md`Backwards: on the centre line the speed is at its maximum, $\partial v_y/\partial x = 0$, and that is the one place a wheel does *not* spin.`],
        md`$(\nabla\times\vb v)_z = \partial v_y/\partial x = -2v_0x/b^2$. At $P$, $x<0$, so the curl points along $+\uv z$: counter-clockwise. Right of the centre the wheel turns clockwise, and on the centre line not at all. Shear flow is the classic case of straight lines with a nonzero curl.`,
        { figHtml: fieldFig((x) => [0, 1 - x * x / 5], { skip: (x, y) => Math.abs(x + 1) < 0.3 && Math.abs(y) < 0.6, extra: (f, X, Y) => { f.dot(X(-1), Y(0), 3.2); f.tag(X(-1), Y(0), 'P', 'r', 9); } }) }),

      RF(md`
        ### Curl in cylindrical and spherical coordinates

        From the formula sheet (cylindrical):

        $$\nabla\times\vb v = \Big(\frac1s\frac{\partial v_z}{\partial\phi}-\frac{\partial v_\phi}{\partial z}\Big)\uv s+\Big(\frac{\partial v_s}{\partial z}-\frac{\partial v_z}{\partial s}\Big)\hat{\boldsymbol\phi}+\frac1s\Big(\frac{\partial}{\partial s}\big(s\,v_\phi\big)-\frac{\partial v_s}{\partial\phi}\Big)\uv z$$

        The $s\,v_\phi$ has the same origin as the $s\,v_s$ in the divergence: the circulation around a circle of radius $s$ is $v_\phi\cdot2\pi s$. For a purely azimuthal field,

        $$\nabla\times\big(s^n\,\hat{\boldsymbol\phi}\big) = (n+1)\,s^{n-1}\,\uv z.$$

        Rigid rotation $s\,\hat{\boldsymbol\phi}$ ($n=1$) has curl $2\,\uv z$; $\hat{\boldsymbol\phi}/s$ ($n=-1$, the shape of the magnetic field of a wire) has zero curl except on the axis.

        Spherical, for the point charge: $E_r = \dfrac{q}{4\pi\varepsilon_0r^2}$ and $E_\theta = E_\phi = 0$. Every term of the spherical curl contains $E_\theta$, $E_\phi$, or an angle derivative of $E_r$, so $\nabla\times\vb E = 0$. By superposition, **every static charge distribution has $\nabla\times\vb E = 0$**.
      `),

      Q(md`What is $\nabla\times\big(s^2\,\hat{\boldsymbol\phi}\big)$? (Figure: the field in the $xy$-plane.)`,
        [md`$2s\,\uv z$`, md`$3s\,\uv z$`, md`$s\,\uv z$`, md`$0$`], 1,
        [md`That is $\partial v_\phi/\partial s$ alone. The formula differentiates $s\,v_\phi$.`, null,
          md`Check: $\frac1s\frac{\partial}{\partial s}(s^3) = 3s$.`,
          md`The flow speeds up outward, so a paddle wheel spins.`],
        md`$\frac1s\frac{\partial}{\partial s}(s\cdot s^2) = 3s$, along $\uv z$. Shortcut: $(n+1)s^{n-1}$ with $n = 2$.`,
        { figHtml: fieldFig((x, y) => { const s = Math.hypot(x, y); return [-y * s, x * s]; }) }),

      Q(md`Which of these fields has zero curl?`,
        [md`$x\,\uv y$`, md`$y\,\uv x$`, md`$x\,\uv x$`, md`$-y\,\uv x+x\,\uv y$`], 2,
        [md`$\partial_xv_y = 1$: curl $\uv z$.`, md`$-\partial_yv_x = -1$: curl $-\uv z$.`, null, md`Rigid rotation: curl $2\,\uv z$.`],
        md`In $x\,\uv x$ the only component depends only on its own coordinate, so every cross-derivative vanishes. It is $\nabla(x^2/2)$, a gradient, and gradients never curl. (It does have divergence $1$.)`,
        { nofig: 'quick component check' }),

      Q(md`What is $\nabla\times\vb E$ of a point charge? In the spherical curl from the formula sheet, the $\hat{\boldsymbol\theta}$ component is $\dfrac1r\Big[\dfrac{1}{\sin\theta}\dfrac{\partial E_r}{\partial\phi}-\dfrac{\partial}{\partial r}\big(rE_\phi\big)\Big]$. Why is it zero for $\vb E = \dfrac{q}{4\pi\varepsilon_0r^2}\,\uv r$?`,
        [md`Because $E_r$ falls off as $1/r^2$`, md`Because $\dfrac{1}{\sin\theta}$ vanishes`, md`Because $E_r$ depends only on $r$, so $\partial E_r/\partial\phi = 0$, and $E_\phi = 0$`, md`It isn't zero: it equals $-\dfrac1r\dfrac{\partial E_r}{\partial r}$`], 2,
        [md`The power law plays no role: any $E_r = f(r)$ gives zero. What matters is that $E_r$ has no angle dependence.`,
          md`$1/\sin\theta$ never vanishes; it blows up at the poles. The bracket is zero because both terms inside it are.`,
          null,
          md`No $\partial E_r/\partial r$ appears in the $\hat{\boldsymbol\theta}$ component; only $\partial E_r/\partial\phi$ and $\partial(rE_\phi)/\partial r$ do.`],
        md`Read off the components first: $E_r = \dfrac{q}{4\pi\varepsilon_0r^2}$, $E_\theta = E_\phi = 0$. Every term of the spherical curl is then a derivative of $E_\theta$ or $E_\phi$ (zero) or an *angle* derivative of $E_r$ (zero, since $E_r$ depends on $r$ alone). All three components vanish: $\nabla\times\vb E = 0$, for the point charge and for any radial $f(r)\,\uv r$.`,
        { nofig: 'reading the formula-sheet curl' }),

      Q(md`The curl of a point charge's field is zero. What does that tell you about the curl of the electric field of **any** static charge distribution, and how do you prove it? Which answer and proof are right?`,
        [md`Nothing general; each distribution needs its own calculation`, md`It is zero, by Gauss's law $\nabla\cdot\vb E = \rho/\varepsilon_0$`, md`It is zero only for spherically symmetric distributions, whose fields are radial`, md`It is zero: by superposition $\vb E = \sum_i\vb E_{q_i}$; the curl of a sum is the sum of the curls, and each point-charge field is curl-free`], 3,
        [md`Superposition settles every distribution at once; no new calculation is needed.`,
          md`Gauss's law fixes the divergence, not the curl. A field can have any divergence and still swirl.`,
          md`A dipole's field is not radial about any single point, yet it is curl-free. Each point charge's field is radial about its *own* charge, and that is all the proof needs.`,
          null],
        md`Break any static distribution into point charges (or elements $\rho\,d\tau'$). Each one's field is radial about its own position, so its curl is zero. The curl is linear, so $\nabla\times\vb E = \nabla\times\vb E_{q_1}+\nabla\times\vb E_{q_2}+\dots = 0$. Stokes then gives $\oint\vb E\cdot d\vb l = 0$ around every loop. This needs *static* charges: a changing magnetic field adds $-\partial\vb B/\partial t$.`,
        { nofig: 'proof strategy; no particular configuration' }),

      RF(md`
        ### Stokes' theorem

        $$\int_S(\nabla\times\vb v)\cdot d\vb a = \oint_{\mathcal P}\vb v\cdot d\vb l$$

        $S$ is an **open** surface and $\mathcal P$ its boundary, a closed loop. Tile $S$ with tiny loops all circulating the same way. Every interior edge is traversed twice in opposite directions and cancels, leaving only the rim.

        **Orientation.** The direction of $d\vb a$ and the direction around $\mathcal P$ are tied by the right-hand rule: curl the fingers of your right hand along $\mathcal P$, and your thumb gives $d\vb a$. Counter-clockwise seen from above goes with $d\vb a$ up. Flip one and you must flip the other.

        [[fig:st]]

        Consequences:

        - The flux of a curl depends only on the rim: every surface with the same boundary gives the same $\int(\nabla\times\vb v)\cdot d\vb a$. Pick the easiest one, usually flat.
        - For a closed surface (no rim), $\oint(\nabla\times\vb v)\cdot d\vb a = 0$.
        - If $\nabla\times\vb E = 0$ (electrostatics), then $\oint\vb E\cdot d\vb l = 0$ around every loop.

        To **test** Stokes: compute the flux of the curl through the surface with a chosen normal, then the line integral around the rim in the matching direction, one smooth piece at a time.
      `, { st: { svg: fStokes(), cap: 'An open surface $S$ (a dome) with rim $\\mathcal P$. Counter-clockwise around the rim, seen from above, goes with $d\\vb a$ pointing up (right-hand rule).' } }),

      Q(md`The loop shown lies in the $xy$-plane and is traversed clockwise as seen from above. For Stokes' theorem, which way must $d\vb a$ point on the flat surface inside it?`,
        [md`$+\uv z$`, md`$-\uv z$`, md`Either way`, md`Along the loop`], 1,
        [md`Counter-clockwise from above goes with $+\uv z$. Clockwise flips it.`, null,
          md`The sign of the flux of the curl depends on it; the theorem holds only with the matching orientation.`,
          md`$d\vb a$ is normal to the surface.`],
        md`Curl the fingers of your right hand along the loop (clockwise seen from above): your thumb points down, along $-\uv z$.`,
        { figHtml: fCW() }),

      Q(md`The flux of $\nabla\times\vb v$ through the flat disk is $6$. What is it through the hemisphere with the same rim, oriented consistently (figure)?`,
        [md`$6$`, md`$12$`, md`$3$`, md`It depends on $\vb v$`], 0,
        [null, md`The hemisphere's larger area doesn't matter: both fluxes equal $\oint\vb v\cdot d\vb l$ around the shared rim.`,
          md`Same reason: the area is irrelevant.`,
          md`For any $\vb v$, both surface integrals equal the same line integral.`],
        md`$\int_S(\nabla\times\vb v)\cdot d\vb a = \oint_{\mathcal P}\vb v\cdot d\vb l$ for every surface $S$ bounded by $\mathcal P$, so any two such surfaces agree. In practice, choose the easiest surface.`,
        { figHtml: fStokes({ normal: false, labels: false, disk: true }) }),

      Q(md`What is $\oint(\nabla\times\vb v)\cdot d\vb a$ over a closed surface?`,
        [md`$0$`, md`$4\pi$`, md`The enclosed volume`, md`It depends on $\vb v$`], 0,
        [null, md`$4\pi$ is the flux of $\uv r/r^2$, not of a curl.`, md`It is a flux, and it vanishes.`, md`It vanishes for every smooth $\vb v$.`],
        md`A closed surface has no rim, so the line integral in Stokes' theorem is zero. Or use the divergence theorem: $\oint(\nabla\times\vb v)\cdot d\vb a = \int\nabla\cdot(\nabla\times\vb v)\,d\tau = 0$, because the divergence of a curl is always zero.`,
        { nofig: 'follows from the theorems' }),

      Q(md`For $\vb v = \hat{\boldsymbol\phi}/s$, what is $\oint\vb v\cdot d\vb l$ counter-clockwise around a circle of radius $R$ centred on the axis (figure)?`,
        [md`$0$, since the curl is zero`, md`$2\pi R$`, md`$2\pi/R$`, md`$2\pi$`], 3,
        [md`The curl is zero everywhere *except on the axis*, and every surface spanning this circle is pierced by the axis.`,
          md`$v_\phi = 1/R$ on the circle; multiply by the circumference $2\pi R$.`,
          md`Circumference times $v_\phi$ is $2\pi R\cdot\frac1R$.`, null],
        md`$\oint\vb v\cdot d\vb l = v_\phi\cdot2\pi R = \frac1R\cdot2\pi R = 2\pi$, the same for every $R$. As with $\uv r/r^2$ and the divergence, all the curl sits on the axis: $\nabla\times(\hat{\boldsymbol\phi}/s) = 2\pi\,\delta(x)\,\delta(y)\,\uv z$. This is the magnetic field of a wire (Ampère's law, later in the course).`,
        { figHtml: fVortexLoop() }),

      Q(md`Near some point, $(\nabla\times\vb v)_z = 4$ and $\vb v$ is smooth. About how large is $\oint\vb v\cdot d\vb l$, counter-clockwise around a small circle of radius $\varepsilon$ in the $xy$-plane centred there?`,
        [md`$4$`, md`$8\pi\varepsilon$`, md`$4\pi\varepsilon^2$`, md`$0$`], 2,
        [md`The curl is circulation *per unit area*. Multiply by the area $\pi\varepsilon^2$.`,
          md`That multiplies by the circumference. Stokes multiplies the curl by an area.`, null,
          md`Zero only if the curl is zero. A small loop has a small but nonzero circulation.`],
        md`Stokes: $\oint\vb v\cdot d\vb l = \int(\nabla\times\vb v)\cdot d\vb a\approx4\cdot\pi\varepsilon^2$, since the curl is nearly constant over a small disk. Read backwards, this is the definition of the curl: circulation divided by area, as the loop shrinks.`,
        { nofig: 'definition of curl as circulation per area' }),

      RF(md`
        ### Worked example: Stokes on a square

        $\vb v = xy\,\uv x+x^2\,\uv y$ on the unit square in the $xy$-plane, counter-clockwise seen from $+z$, so $d\vb a = +\uv z\,dx\,dy$.

        [[fig:sq]]

        **Surface side.** $\nabla\times\vb v = (\partial_xv_y-\partial_yv_x)\,\uv z = (2x-x)\,\uv z = x\,\uv z$, and $\int_0^1\!\!\int_0^1x\,dx\,dy = \tfrac12$.

        **Line side**, four edges, $d\vb l$ with plus signs and the direction in the limits:

        1. Bottom, $y = 0$, $x: 0\to1$: $\vb v\cdot d\vb l = xy\,dx = 0$.
        2. Right, $x = 1$, $y: 0\to1$: $\vb v\cdot d\vb l = x^2\,dy = dy$, giving $1$.
        3. Top, $y = 1$, $x: 1\to0$: $\vb v\cdot d\vb l = x\,dx$, giving $\int_1^0x\,dx = -\tfrac12$.
        4. Left, $x = 0$, $y: 1\to0$: $\vb v\cdot d\vb l = x^2\,dy = 0$.

        Total $0+1-\tfrac12+0 = \tfrac12$. It checks.
      `, { sq: { svg: fSquare(), cap: 'The unit square, traversed counter-clockwise seen from $+z$.' } }),

      P({
        title: "Stokes' theorem on a circle",
        q: md`Test Stokes' theorem for $\vb v = -y^3\,\uv x+x^3\,\uv y$ on the disk of radius $R$ in the $xy$-plane, centred on the origin, with its rim traversed counter-clockwise (figure).`,
        figHtml: fCircleR(),
        hints: [
          md`Compute both sides. Counter-clockwise from above means $d\vb a = +\uv z\,da$.`,
          md`$(\nabla\times\vb v)_z = \partial_x(x^3)-\partial_y(-y^3)$. On the disk, write it in terms of $s$ and use $da = s\,ds\,d\phi$.`,
          md`On the rim, $x = R\cos t$, $y = R\sin t$, $d\vb l = R(-\sin t\,\uv x+\cos t\,\uv y)\,dt$. You need $\int_0^{2\pi}(\sin^4t+\cos^4t)\,dt = \tfrac{3\pi}{2}$.`,
        ],
        parts: [
          { lbl: md`$(\nabla\times\vb v)_z$`, expr: '3*(x^2+y^2)', vars: { x: [0.5, 2], y: [0.5, 2] }, accepts: ['3*x^2+3*y^2'] },
          { lbl: md`$\int_S(\nabla\times\vb v)\cdot d\vb a$`, expr: '3*pi*R^4/2', vars: { R: [0.5, 2.5] }, accepts: ['1.5*pi*R^4'] },
          { lbl: md`$\oint\vb v\cdot d\vb l$`, expr: '3*pi*R^4/2', vars: { R: [0.5, 2.5] }, accepts: ['1.5*pi*R^4'] },
        ],
        sol: md`
          **Surface.** $(\nabla\times\vb v)_z = 3x^2+3y^2 = 3s^2$. Then

          $$\int_0^{2\pi}\!\!\int_0^R3s^2\cdot s\,ds\,d\phi = 2\pi\cdot\frac{3R^4}{4} = \frac{3\pi R^4}{2}.$$

          **Line.** With $x = R\cos t$, $y = R\sin t$: $\vb v\cdot d\vb l = \big[(-R^3\sin^3t)(-R\sin t)+(R^3\cos^3t)(R\cos t)\big]dt = R^4(\sin^4t+\cos^4t)\,dt$. Using $\sin^4t+\cos^4t = 1-\tfrac12\sin^22t$, the integral over $0\to2\pi$ is $2\pi-\tfrac12\pi = \tfrac{3\pi}{2}$, so $\oint\vb v\cdot d\vb l = \dfrac{3\pi R^4}{2}$. They agree.

          **What to remember.** On circles, switch the surface integral to polar form ($da = s\,ds\,d\phi$) and parametrise the rim by the angle.
        `,
      }),

      P({
        title: 'Computing a curl',
        q: md`Find the curl of $\vb v = x^2y\,\uv x+yz\,\uv y-xz\,\uv z$.`,
        nofig: 'pure computation',
        hints: [
          md`Use the determinant, one component at a time: $(\nabla\times\vb v)_x = \partial_yv_z-\partial_zv_y$, $(\nabla\times\vb v)_y = \partial_zv_x-\partial_xv_z$, $(\nabla\times\vb v)_z = \partial_xv_y-\partial_yv_x$.`,
          md`Watch the cyclic order $x\to y\to z$: in each component, the first derivative is the "next" coordinate.`,
        ],
        parts: [
          { lbl: md`$(\nabla\times\vb v)_x$`, expr: '-y', vars: { x: [0.5, 2], y: [0.5, 2], z: [0.5, 2] } },
          { lbl: md`$(\nabla\times\vb v)_y$`, expr: 'z', vars: { x: [0.5, 2], y: [0.5, 2], z: [0.5, 2] } },
          { lbl: md`$(\nabla\times\vb v)_z$`, expr: '-x^2', vars: { x: [0.5, 2], y: [0.5, 2], z: [0.5, 2] } },
        ],
        sol: md`
          - $x$: $\partial_y(-xz)-\partial_z(yz) = 0-y = -y$.
          - $y$: $\partial_z(x^2y)-\partial_x(-xz) = 0+z = z$.
          - $z$: $\partial_x(yz)-\partial_y(x^2y) = 0-x^2 = -x^2$.

          $\nabla\times\vb v = -y\,\uv x+z\,\uv y-x^2\,\uv z$.

          **Check.** The divergence of a curl must vanish: $\partial_x(-y)+\partial_y(z)+\partial_z(-x^2) = 0$. It does.
        `,
      }),

      P({
        id: 'D2-1.34', src: 'Discussion 2 · Griffiths 1.34', title: "Stokes' theorem on a triangle", big: true,
        q: md`Test Stokes' theorem for the function $\vb v = (xy)\,\uv x+(2yz)\,\uv y+(3zx)\,\uv z$, using the triangular shaded area shown.

        The triangle lies in the $yz$-plane ($x = 0$) with corners $(0,0,0)$, $(0,2,0)$ and $(0,0,2)$. Its boundary runs from the origin out along the $y$-axis to $(0,2,0)$, along the slanted edge to $(0,0,2)$, and back down the $z$-axis to the origin, as the arrows show.`,
        figHtml: fTri(false),
        hints: [
          md`Stokes' theorem: compute $\int_S(\nabla\times\vb v)\cdot d\vb a$ and $\oint\vb v\cdot d\vb l$ separately. First fix the orientation: the given direction is counter-clockwise seen from $+x$, so $d\vb a = +\uv x\,dy\,dz$.`,
          md`$\nabla\times\vb v = -2y\,\uv x-3z\,\uv y-x\,\uv z$. Only the $x$-component matters, because $d\vb a\parallel\uv x$.`,
          md`The triangle is $y\ge0$, $z\ge0$, $y+z\le2$: $\displaystyle\int_0^2\!\!\int_0^{2-z}(-2y)\,dy\,dz$.`,
          md`On $x = 0$ only $v_y = 2yz$ survives. On the two legs along the axes either $y = 0$ or $z = 0$. On the slanted edge $z = 2-y$, with $y$ running from $2$ to $0$.`,
        ],
        parts: [
          { lbl: md`The boundary runs origin $\to(0,2,0)\to(0,0,2)\to$ origin. Which way must $d\vb a$ point on the triangle?`, mc: [md`$-\uv x$`, md`$+\uv x$`, md`Either way; Stokes' theorem holds for both`, md`Along the slanted edge`], a: 1,
            why: [md`$-\uv x$ goes with the opposite route, origin $\to(0,0,2)\to(0,2,0)\to$ origin. Seen from $+x$ (with $y$ to the right and $z$ up) the given route is counter-clockwise, so the right-hand thumb points along $+\uv x$.`, null,
              md`Flipping $d\vb a$ flips the sign of the surface integral but not of the line integral. The theorem holds only when $d\vb a$ and the direction around the rim match by the right-hand rule.`,
              md`$d\vb a$ is normal to the surface. The triangle lies in the $yz$-plane, so its normal is along $\pm\uv x$.`] },
          { lbl: md`$x$-component of $\nabla\times\vb v$`, expr: '-2*y', vars: { y: [0.5, 2] } },
          { lbl: md`$\int_S(\nabla\times\vb v)\cdot d\vb a$`, ans: -8 / 3 },
          { lbl: md`$\int\vb v\cdot d\vb l$ along the slanted edge, $(0,2,0)\to(0,0,2)$`, ans: -8 / 3 },
          { lbl: md`sum of the line integrals along the two legs on the axes`, ans: 0 },
        ],
        sol: md`
          [[fig:tri]]

          **Orientation.** The boundary goes origin $\to(0,2,0)\to(0,0,2)\to$ origin. Seen from $+x$ (with $y$ to the right and $z$ up) that is counter-clockwise, so by the right-hand rule $d\vb a = +\uv x\,dy\,dz$.

          **Curl.**

          $$\nabla\times\vb v = \Big(\partial_y(3zx)-\partial_z(2yz)\Big)\uv x+\Big(\partial_z(xy)-\partial_x(3zx)\Big)\uv y+\Big(\partial_x(2yz)-\partial_y(xy)\Big)\uv z = -2y\,\uv x-3z\,\uv y-x\,\uv z.$$

          **Surface integral.** $(\nabla\times\vb v)\cdot d\vb a = -2y\,dy\,dz$. For fixed $z$, $y$ runs from $0$ to $2-z$:

          $$\int_0^2\!\!\int_0^{2-z}(-2y)\,dy\,dz = -\int_0^2(2-z)^2\,dz = -\Big[-\frac{(2-z)^3}{3}\Big]_0^2 = -\frac83.$$

          **Line integral.** On the plane $x = 0$: $v_x = xy = 0$, $v_z = 3zx = 0$, and $v_y = 2yz$. So only $dy$ steps count, with integrand $2yz$.

          - (i) Origin $\to(0,2,0)$, along the $y$-axis: $z = 0$, so $2yz = 0$. Contribution $0$.
          - (ii) $(0,2,0)\to(0,0,2)$: on this edge $z = 2-y$, and $y$ runs from $2$ to $0$: $\displaystyle\int_2^0 2y(2-y)\,dy = -\int_0^2(4y-2y^2)\,dy = -\Big(8-\frac{16}{3}\Big) = -\frac83$.
          - (iii) $(0,0,2)\to$ origin, down the $z$-axis: $y = 0$ and $dy = 0$. Contribution $0$.

          $\oint\vb v\cdot d\vb l = 0-\tfrac83+0 = -\tfrac83$. It matches the surface integral.

          **Why the slanted edge works this way.** Writing $d\vb l = dy\,\uv y+dz\,\uv z$ with $dz = -dy$ on the edge, $\vb v\cdot d\vb l = 2yz\,dy+0$, and the limits $y: 2\to0$ carry the direction. No minus signs were put in by hand.

          **What to remember.** Fix the orientation first (right-hand rule), then use only the curl component along $d\vb a$. On each straight edge set the fixed coordinates before integrating, and let the limits give the direction. A negative answer is fine: here the field circulates clockwise as seen from $+x$.
        `,
        figs: { tri: { svg: fTri(true), cap: 'The legs (i), (ii), (iii) in order. $d\\vb a$ points along $+\\uv x$, out of the page toward you (counter-clockwise rim seen from $+x$).' } },
      }),

      P({
        id: 'HW2-1.43', src: 'HW 2 · Griffiths 1.43', title: 'Divergence and curl on a quarter-cylinder', big: true,
        q: md`(a) Find the divergence of the function

        $$\vb v = s(2+\sin^2\phi)\,\uv s+s\sin\phi\cos\phi\,\hat{\boldsymbol\phi}+3z\,\uv z.$$

        (b) Test the divergence theorem for this function, using the quarter-cylinder (radius 2, height 5) shown in Fig. 1.43.

        (c) Find the curl of $\vb v$.

        The quarter-cylinder fills $0\le s\le2$, $0\le\phi\le\pi/2$ (between the $+x$ and $+y$ axes), $0\le z\le5$.`,
        figHtml: fQuarter(false),
        hints: [
          md`Everything is in cylindrical coordinates, so use the formula sheet's cylindrical divergence and curl, and $d\tau = s\,ds\,d\phi\,dz$. For (b) the closed surface has **five** faces: the curved side, the top, the bottom, and two flat sides at $\phi = 0$ and $\phi = \pi/2$.`,
          md`(a) Multiply $v_s$ by $s$ before differentiating: $\frac1s\frac{\partial}{\partial s}\big(s^2(2+\sin^2\phi)\big)$. The $\phi$ term is $\frac1s\frac{\partial}{\partial\phi}\big(s\sin\phi\cos\phi\big)$. Simplify with $\sin^2\phi+\cos^2\phi = 1$.`,
          md`(b) Curved side $s = 2$: $d\vb a = 2\,d\phi\,dz\,\uv s$. Top $z = 5$: $s\,ds\,d\phi\,\uv z$. Bottom $z = 0$: $-\uv z$. Flat sides: $d\vb a = ds\,dz\,(\mp\hat{\boldsymbol\phi})$. What is $v_\phi$ at $\phi = 0$ and at $\phi = \pi/2$?`,
          md`You need $\int_0^{\pi/2}\sin^2\phi\,d\phi = \pi/4$. For (c), compute all three components of the cylindrical curl; in the $\uv z$ component, differentiate $s\,v_\phi = s^2\sin\phi\cos\phi$.`,
        ],
        parts: [
          { lbl: md`(a) $\nabla\cdot\vb v$`, ans: 8 },
          { lbl: md`(b) $\int_V\nabla\cdot\vb v\,d\tau$ (you may type pi)`, ans: 40 * Math.PI },
          { lbl: md`(b) flux through the curved side`, ans: 25 * Math.PI },
          { lbl: md`(b) flux through the top`, ans: 15 * Math.PI },
          { lbl: md`(b) Why do the bottom and the two flat sides contribute nothing?`, mc: [md`Bottom: $v_z = 0$ at $z = 0$. Flat sides: $v_\phi = s\sin\phi\cos\phi = 0$ at $\phi = 0$ and $\phi = \pi/2$.`, md`Their outward normals are all along $\uv s$, perpendicular to $\vb v$.`, md`Their fluxes cancel in pairs.`, md`They have zero area.`], a: 0,
            why: [null, md`The flat sides have normals $\mp\hat{\boldsymbol\phi}$ and the bottom $-\uv z$, not $\uv s$.`, md`Each one is zero on its own, not by cancellation.`, md`The flat sides are $2\times5$ rectangles and the bottom is a quarter disk.`] },
          { lbl: md`(c) $\nabla\times\vb v = $`, mc: [md`$\vb 0$`, md`$4\sin\phi\cos\phi\,\uv z$`, md`$2\sin\phi\cos\phi\,\uv z$`, md`$3\,\uv z$`], a: 0,
            why: [null, md`That adds the two terms of the $\uv z$ component instead of subtracting them.`, md`That keeps only $\frac1s\frac{\partial}{\partial s}(s\,v_\phi) = 2\sin\phi\cos\phi$ and drops $-\frac1s\frac{\partial v_s}{\partial\phi}$, which is $-2\sin\phi\cos\phi$ (from the $\sin^2\phi$ in $v_s$). The two cancel.`, md`$v_z = 3z$ depends only on $z$, which gives no curl.`] },
        ],
        sol: md`
          **(a) Divergence.** With $v_s = s(2+\sin^2\phi)$, $v_\phi = s\sin\phi\cos\phi$, $v_z = 3z$:

          $$\nabla\cdot\vb v = \frac1s\frac{\partial}{\partial s}\big(s^2(2+\sin^2\phi)\big)+\frac1s\frac{\partial}{\partial\phi}\big(s\sin\phi\cos\phi\big)+\frac{\partial(3z)}{\partial z}$$

          $$= 2(2+\sin^2\phi)+(\cos^2\phi-\sin^2\phi)+3 = 4+2\sin^2\phi+\cos^2\phi-\sin^2\phi+3 = 8.$$

          **(b) Volume side.** The divergence is constant, so $\int\nabla\cdot\vb v\,d\tau = 8\times(\text{volume}) = 8\cdot\tfrac14\pi(2)^2(5) = 40\pi$.

          **Surface side**, all five faces with outward normals:

          [[fig:faces]]

          | face | $d\vb a$ | $\vb v\cdot d\vb a$ | flux |
          |---|---|---|---|
          | curved, $s = 2$ | $2\,d\phi\,dz\,\uv s$ | $2(2+\sin^2\phi)\cdot2\,d\phi\,dz$ | $25\pi$ |
          | top, $z = 5$ | $s\,ds\,d\phi\,\uv z$ | $15\,s\,ds\,d\phi$ | $15\pi$ |
          | bottom, $z = 0$ | $-s\,ds\,d\phi\,\uv z$ | $-3(0)\,s\,ds\,d\phi$ | $0$ |
          | side $\phi = 0$ | $-ds\,dz\,\hat{\boldsymbol\phi}$ | $-s\sin0\cos0\,ds\,dz$ | $0$ |
          | side $\phi = \pi/2$ | $+ds\,dz\,\hat{\boldsymbol\phi}$ | $s\sin\tfrac\pi2\cos\tfrac\pi2\,ds\,dz$ | $0$ |

          The two nonzero ones in detail:

          - Curved side: $\displaystyle\int_0^5\!\!\int_0^{\pi/2}4(2+\sin^2\phi)\,d\phi\,dz = 4\cdot5\Big(2\cdot\frac\pi2+\frac\pi4\Big) = 20\cdot\frac{5\pi}{4} = 25\pi$.
          - Top: $\displaystyle\int_0^{\pi/2}\!\!\int_0^2 15\,s\,ds\,d\phi = 15\cdot2\cdot\frac\pi2 = 15\pi$.

          Total $25\pi+15\pi = 40\pi$. It matches the volume integral.

          Why the flat sides have outward normals $\mp\hat{\boldsymbol\phi}$: at $\phi = 0$ (the $xz$-plane) the solid lies on the $+y$ side, so outward is $-\uv y = -\hat{\boldsymbol\phi}$. At $\phi = \pi/2$ (the $yz$-plane) the solid lies on the $+x$ side, so outward is $-\uv x$, which equals $+\hat{\boldsymbol\phi}$ there. Here it doesn't matter, since $v_\phi = 0$ on both.

          **(c) Curl.**

          - $\uv s$: $\frac1s\frac{\partial v_z}{\partial\phi}-\frac{\partial v_\phi}{\partial z} = 0-0 = 0$.
          - $\hat{\boldsymbol\phi}$: $\frac{\partial v_s}{\partial z}-\frac{\partial v_z}{\partial s} = 0-0 = 0$.
          - $\uv z$: $\frac1s\Big[\frac{\partial}{\partial s}\big(s^2\sin\phi\cos\phi\big)-\frac{\partial}{\partial\phi}\big(s(2+\sin^2\phi)\big)\Big] = \frac1s\big[2s\sin\phi\cos\phi-2s\sin\phi\cos\phi\big] = 0$.

          $\nabla\times\vb v = \vb 0$.

          **A cross-check worth knowing.** Convert to Cartesian with $v_x = v_s\cos\phi-v_\phi\sin\phi$ and $v_y = v_s\sin\phi+v_\phi\cos\phi$: $v_x = 2s\cos\phi = 2x$ and $v_y = 3s\sin\phi = 3y$. So $\vb v = 2x\,\uv x+3y\,\uv y+3z\,\uv z$. Its divergence is $2+3+3 = 8$ and its curl is zero by inspection. In fact $\vb v = \nabla\big(x^2+\tfrac32y^2+\tfrac32z^2\big)$.

          **What to remember.** Multiply by $s$ before differentiating, list *every* face with its outward normal, and say why the zero faces vanish. A constant divergence makes the volume side a one-liner. When a curvilinear field looks messy, converting to Cartesian can expose a simple structure.
        `,
        figs: { faces: Object.assign(PF.row([{ svg: fQuarter(true), cap: 'Outward normals on the curved side and the top, with their fluxes.' }, { svg: fQuarterTop(), cap: 'Seen from above: the flat sides have outward normals $-\\uv y$ (at $\\phi = 0$) and $-\\uv x$ (at $\\phi = \\pi/2$).' }]), { cap: '' }) },
      }),

      RF(md`
        !!key Patterns to remember
          - Curl = circulation per unit area; paddle-wheel test; right-hand rule for direction. Look for differences *across* the flow, not curved arrows.
          - $\nabla\times(s^n\hat{\boldsymbol\phi}) = (n+1)s^{n-1}\uv z$: rigid rotation $2\uv z$; $\hat{\boldsymbol\phi}/s$ zero except on the axis. Radial fields $f(r)\uv r$: zero.
          - Every static $\vb E$ has $\nabla\times\vb E = 0$; its field lines never close.
          - Stokes: $\int_S(\nabla\times\vb v)\cdot d\vb a = \oint_{\mathcal P}\vb v\cdot d\vb l$, with the right-hand rule linking $d\vb a$ and the direction around $\mathcal P$. Any surface with the same rim gives the same flux.
          - Testing a theorem: list every face or edge, set the fixed coordinates first, let the limits carry the direction.
      `),
    ],
  };

  // ======================================================================
  // Lesson 6 figures: curl-free fields and potentials
  // ======================================================================
  const mini = (fn, cap, o = {}) => ({ svg: fieldFig(fn, Object.assign({ L: 1.5, S: 30, n: 7, len: 14, triad: false }, o)), cap });
  const fThm1 = () => {
    const f = PF.fig();
    const W = 120, Hh = 34;
    const box = (x, y, t, num, side) => {
      f.rect(x, y, W, Hh, {});
      f.label(x + W / 2, y + Hh / 2, t, 'c', 'small');
      if (side === 'l') f.label(x - 6, y + Hh / 2, num, 'r', 'small accent'); else f.label(x + W + 6, y + Hh / 2, num, 'l', 'small accent');
    };
    box(0, 0, `\\nabla\\times${B('F')} = 0`, '(1)', 'l');
    box(190, 0, `\\oint ${B('F')}\\cdot d${B('l')} = 0`, '(3)', 'r');
    box(190, 110, `\\int_{${B('a')}}^{${B('b')}}${B('F')}\\cdot d${B('l')}`, '(2)', 'r');
    box(0, 110, `${B('F')} = -\\nabla V`, '(4)', 'l');
    // plain words go through f.text: in a TeX label KaTeX would set them in math italic and drop the spaces
    f.arrow(124, 17, 186, 17, { hs: 6 }); f.text(155, 9, 'Stokes', 'b');
    f.line(250, 38, 250, 106, { arrow: 'both', hs: 6 }); f.text(258, 72, 'two paths', 'l');
    f.arrow(186, 127, 124, 127, { hs: 6 }); f.text(155, 150, 'define V', 't');
    f.arrow(60, 106, 60, 38, { hs: 6 }); f.label(52, 72, `\\nabla\\times\\nabla V = 0`, 'r', 'small');
    return f.svg();
  };
  const fLoopsAB = () => fieldFig((x, y) => { const s2 = x * x + y * y; return [-y / s2, x / s2]; }, {
    skip: (x, y) => Math.hypot(x, y) < 0.3 || (Math.abs(x) < 0.2 && Math.abs(y - 1.5) < 0.2) || Math.hypot(x - 1.4, y + 1.2) < 0.75,
    extra: (f, X, Y) => {
      const a = f.arcPts(0, 0, X(1.25), X(1.25), 0, 360, 72); f.pl(a, { cls: 'thick' }); midHead(f, a, 0.37);
      const b = f.arcPts(X(1.2), Y(-1.2), X(0.35), X(0.35), 0, 360, 36); f.pl(b, { cls: 'thick' }); midHead(f, b, 0.25);
      f.label(X(0), Y(1.6), 'A', 'c', 'small');
      f.label(X(1.85), Y(-1.2), 'B', 'c', 'small');
    } });
  const fLegs = () => {
    const g = fig3(0, 0, 60);
    g.axes3(2.4, { Lz: 2.4 });
    const A = [0, 0, 0], P1 = [1, 0, 0], P2 = [1, 1.3, 0], Bp = [1, 1.3, 1.6];
    pl3(g, [A, P1, P2, Bp], { cls: 'thick' });
    head3(g, A, P1); head3(g, P1, P2); head3(g, P2, Bp);
    dot3(g, A, 3); dot3(g, Bp, 3.2);
    g.label(-8, -8, 'O', 'br', 'small');
    tag3(g, Bp, '(x,y,z)', 'r', 10, 'small');
    g.label(-24, 0, '1', 'c', 'small');
    const m2 = g.p3(1, 0.65, 0); g.label(m2[0], m2[1] + 10, '2', 't', 'small');
    const m3 = g.p3(1, 1.3, 0.8); g.label(m3[0] + 9, m3[1], '3', 'l', 'small');
    return g.svg();
  };

  // ======================================================================
  // Lesson 6: curl-free fields and potentials
  // ======================================================================
  const L6 = {
    id: 'u0-pot', title: 'Curl-free fields, potentials and Helmholtz',
    steps: [
      RF(md`
        ### Two identities that always hold

        $$\nabla\times(\nabla T) = 0,\qquad\qquad \nabla\cdot(\nabla\times\vb A) = 0.$$

        Both come from mixed partial derivatives being equal. The $z$-component of the first is $\dfrac{\partial}{\partial x}\dfrac{\partial T}{\partial y}-\dfrac{\partial}{\partial y}\dfrac{\partial T}{\partial x} = 0$. In pictures: a gradient field has no swirl (you can't walk in a circle and keep going uphill), and a curl field has no sources (its lines never start or end).

        The other second derivatives that make sense are $\nabla\cdot(\nabla T) = \nabla^2T$, the Laplacian (Laplace's equation, later in the course), and $\nabla\times(\nabla\times\vb v) = \nabla(\nabla\cdot\vb v)-\nabla^2\vb v$.
      `),

      Q(md`Which of these is zero for every smooth $T$ and $\vb A$?`,
        [md`$\nabla\cdot(\nabla T)$`, md`$\nabla(\nabla\cdot\vb A)$`, md`$\nabla\times(\nabla\times\vb A)$`, md`$\nabla\times(\nabla T)$`], 3,
        [md`That is the Laplacian $\nabla^2T$, which is $2$ for $T = x^2$.`,
          md`For $\vb A = x^2\,\uv x$ it is $2\,\uv x$.`,
          md`For $\vb A = x^2\,\uv z$ it is $-2\,\uv z$.`, null],
        md`$\nabla\times\nabla T$ has components like $\partial_x\partial_yT-\partial_y\partial_xT = 0$. Mixed partials commute, so the curl of a gradient always vanishes. The same reason gives $\nabla\cdot(\nabla\times\vb A) = 0$.`,
        { nofig: 'operator identity' }),

      Q(md`Which of the fields shown could *not* be the curl of any vector field?`,
        [md`(A) $y\,\uv x$`, md`(B) $-y\,\uv x+x\,\uv y$`, md`(C) $x\,\uv x$`, md`(D) $x\,\uv y$`], 2,
        [md`$\nabla\cdot(y\,\uv x) = 0$, so it can be a curl; it is $\nabla\times\big(\tfrac12y^2\,\uv z\big)$.`,
          md`Divergence-free; it is $\nabla\times\big(-\tfrac12(x^2+y^2)\,\uv z\big)$.`, null,
          md`Divergence-free; it is $\nabla\times\big(-\tfrac12x^2\,\uv z\big)$.`],
        md`A curl always has zero divergence. $\nabla\cdot(x\,\uv x) = 1\ne0$ (you can see the source in picture C), so $x\,\uv x$ is not the curl of anything. The other three are divergence-free, and each is the curl of a suitable $f(x,y)\,\uv z$.`,
        { figHtml: PF.row([mini((x, y) => [y, 0], '(A)'), mini((x, y) => [-y, x], '(B)'), mini((x) => [x, 0], '(C)'), mini((x) => [0, x], '(D)')]).svg }),

      RF(md`
        ### Curl-free fields are conservative (Griffiths 1.6.2)

        For a field $\vb F$ in a region without holes, these four statements are equivalent; if one holds, they all do:

        1. $\nabla\times\vb F = 0$ everywhere.
        2. $\int_{\vb a}^{\vb b}\vb F\cdot d\vb l$ is independent of the path, for any endpoints.
        3. $\oint\vb F\cdot d\vb l = 0$ for every closed loop.
        4. $\vb F = -\nabla V$ for some scalar function $V$.

        [[fig:thm]]

        The links: (4)⇒(1) because the curl of a gradient is zero. (1)⇒(3) by Stokes. (3)⇔(2) because two paths from $\vb a$ to $\vb b$ make one loop (one of them traversed backwards). (2)⇒(4): define $V(\vb r) = -\int_{\mathcal O}^{\vb r}\vb F\cdot d\vb l$, which makes sense because the path doesn't matter. $V$ is fixed only up to an added constant, the choice of $\mathcal O$.

        "Everywhere" matters. $\hat{\boldsymbol\phi}/s$ has zero curl except on the $z$-axis, yet its circulation around the axis is $2\pi$. Every surface spanning such a loop is pierced by the axis, so Stokes gives no protection.

        **Why $\nabla\times\vb E = 0$ matters.** Every static charge distribution has $\nabla\times\vb E = 0$ (superpose point-charge fields, each curl-free). So electrostatic fields are conservative: $\oint\vb E\cdot d\vb l = 0$, and there is a potential with $\vb E = -\nabla V$, $V(\vb r) = -\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l$. It also gives a quick **test**: a proposed static $\vb E$ with a nonzero curl anywhere is impossible. Unit 2's HW 2.21 asks exactly this. It holds only for **static** charges: a changing magnetic field gives $\nabla\times\vb E = -\partial\vb B/\partial t$.
      `, { thm: { svg: fThm1(), cap: 'The four equivalent statements: (1) zero curl, (2) path-independent line integrals, (3) zero circulation around every loop, (4) a potential exists. Arrows show the arguments that link them.' } }),

      Q(md`Someone proposes the static field $\vb E = k\,(y\,\uv x-x\,\uv y)$ (figure). Is it possible?`,
        [md`No: its curl is $-2k\,\uv z\neq0$, and static fields are curl-free`, md`Yes: its divergence is zero, so it needs no charge`, md`Yes, if $k<0$`, md`Only inside a conductor`], 0,
        [null, md`Zero divergence only says no charge is needed; the curl test is separate, and it fails.`,
          md`The sign of $k$ only reverses the swirl; the curl stays nonzero.`,
          md`Inside a conductor in equilibrium $\vb E = 0$.`],
        md`$(\nabla\times\vb E)_z = \partial_xE_y-\partial_yE_x = -k-k = -2k$. Any nonzero curl rules out an electrostatic field. You can also see it from a circle of radius $R$ about the origin: $\oint\vb E\cdot d\vb l = -2\pi kR^2\neq0$.`,
        { figHtml: fieldFig((x, y) => [y, -x]) }),

      Q(md`Which of the fields shown could be an electrostatic field?`,
        [md`(A) $k\,x\,\uv y$`, md`(B) $k\,(y\,\uv x-x\,\uv y)$`, md`(C) $k\,y\,\uv x$`, md`(D) $k\,(y\,\uv x+x\,\uv y)$`], 3,
        [md`$(\nabla\times)_z = \partial_x(kx) = k\neq0$.`, md`Curl $-2k\,\uv z$: it swirls.`, md`Curl $-k\,\uv z$: shear.`, null],
        md`$k(y\,\uv x+x\,\uv y) = \nabla(kxy)$, so $\vb E = -\nabla V$ with $V = -kxy$, and its curl is zero. Its field lines are hyperbolas, curved yet curl-free. The other three shear or swirl.`,
        { figHtml: PF.row([mini((x) => [0, x], '(A)'), mini((x, y) => [y, -x], '(B)'), mini((x, y) => [y, 0], '(C)'), mini((x, y) => [y, x], '(D)')]).svg }),

      Q(md`An electrostatic field gives $\int\vb E\cdot d\vb l = 5$ V from $\vb a$ to $\vb b$ along path 1 (figure). What is $\oint\vb E\cdot d\vb l$ around the loop that goes out along path 1 and back along path 2?`,
        [md`$10$ V`, md`$5$ V`, md`$-5$ V`, md`$0$`], 3,
        [md`Coming back along path 2 *subtracts*; it doesn't add.`, md`That is only the outbound half.`, md`That is only the return half.`, null],
        md`Path independence: path 2 also gives $5$ V from $\vb a$ to $\vb b$, so coming back along it gives $-5$ V. The total is $0$, as $\nabla\times\vb E = 0$ requires.`,
        { figHtml: fTwoPaths() }),

      Q(md`$\vb v = \hat{\boldsymbol\phi}/s$ has zero curl except on the axis. Loop $A$ encircles the axis; loop $B$ does not (figure). What are the circulations $\oint\vb v\cdot d\vb l$, counter-clockwise?`,
        [md`$A$: $0$; $B$: $0$`, md`$A$: $2\pi$; $B$: $0$`, md`$A$: $2\pi$; $B$: $2\pi$`, md`$A$: $0$; $B$: $2\pi$`], 1,
        [md`Stokes for $A$ needs the curl over a surface spanning $A$, and every such surface is pierced by the axis.`, null,
          md`$B$ bounds a disk on which the curl is zero everywhere, so its circulation vanishes.`, md`Backwards.`],
        md`$B$ spans a disk where $\nabla\times\vb v = 0$, so Stokes gives $0$. Every surface spanning $A$ is pierced by the axis, where all the curl sits; the circulation is $2\pi$. Theorem 1 needs zero curl *everywhere* in a region without holes.`,
        { figHtml: fLoopsAB() }),

      Q(md`If $\vb F = -\nabla V$, how unique is $V$?`,
        [md`Unique up to an added constant`, md`Completely unique`, md`Unique up to a constant factor`, md`Not determined at all`], 0,
        [null, md`$V+7$ has the same gradient.`, md`$2V$ has twice the gradient.`,
          md`Up to a constant it is fixed: $V(\vb b)-V(\vb a) = -\int_{\vb a}^{\vb b}\vb F\cdot d\vb l$.`],
        md`Gradients ignore added constants. Choosing a reference point $\mathcal O$ with $V(\mathcal O) = 0$ removes the freedom: $V(\vb r) = -\int_{\mathcal O}^{\vb r}\vb F\cdot d\vb l$, the formula-sheet definition, usually with $\mathcal O$ at infinity.`,
        { nofig: 'definition' }),

      Q(md`In the dipole field shown, pick any field line and move along it in the direction of $\vb E$, from a point $\vb a$ to a point $\vb b$ farther along. How does $V(\vb b)$ compare with $V(\vb a)$?`,
        [md`$V(\vb b)>V(\vb a)$`, md`They are equal: a field line is an equipotential`, md`It depends on the path`, md`$V(\vb b)<V(\vb a)$`], 3,
        [md`$\vb E = -\nabla V$ points downhill in $V$, not uphill.`,
          md`Field lines cross equipotentials at right angles; they are never equipotentials themselves.`,
          md`For a static field $V(\vb b)-V(\vb a)$ is path-independent.`, null],
        md`$V(\vb b)-V(\vb a) = -\int_{\vb a}^{\vb b}\vb E\cdot d\vb l$, and along a field line $\vb E\cdot d\vb l>0$ at every step, so $V$ falls. Field lines run from high potential to low, from the $+$ charge toward the $-$ charge.`,
        { figHtml: fDipole() }),

      Q(md`A magnetic field that changes in time is present. Is $\nabla\times\vb E = 0$ still true?`,
        [md`Yes, always`, md`Only far from the magnetic field`, md`No: $\nabla\times\vb E = -\partial\vb B/\partial t$`, md`Only in vacuum`], 2,
        [md`The proof superposes Coulomb fields, so it holds only for *static* charges.`, md`Faraday's law holds everywhere, not just near the field.`, null, md`Vacuum doesn't rescue it.`],
        md`The proof of $\nabla\times\vb E = 0$ superposes Coulomb fields of static charges. With a changing magnetic field, Faraday's law gives $\nabla\times\vb E = -\partial\vb B/\partial t$, and $V$ alone no longer describes $\vb E$. Everything on this exam is static.`,
        { nofig: 'conceptual' }),

      RF(md`
        ### Worked example: testing a field and finding its potential

        $\vb E = k\big[(2xy+z)\,\uv x+x^2\,\uv y+x\,\uv z\big]$. Could it be electrostatic? If so, find $V$ with $V(0,0,0) = 0$.

        **Curl test.**

        - $x$: $\partial_yE_z-\partial_zE_y = 0-0 = 0$.
        - $y$: $\partial_zE_x-\partial_xE_z = k-k = 0$.
        - $z$: $\partial_xE_y-\partial_yE_x = 2kx-2kx = 0$.

        Curl-free, so it is possible and a potential exists.

        **Potential.** $V(x,y,z) = -\int_{\vb 0}^{\vb r}\vb E\cdot d\vb l$ along any path. Pick the three legs in the figure, from the origin to $(x,0,0)$, then to $(x,y,0)$, then to $(x,y,z)$ (primes on the integration variables):

        [[fig:legs]]

        1. Along $x'$ with $y' = z' = 0$: $E_x = k(2x'\cdot0+0) = 0$. Contribution $0$.
        2. Along $y'$ with $x$ fixed, $z' = 0$: $E_y = kx^2$, giving $kx^2y$.
        3. Along $z'$ with $x,y$ fixed: $E_z = kx$, giving $kxz$.

        So $\int\vb E\cdot d\vb l = k(x^2y+xz)$ and $V = -k(x^2y+xz)$.

        **Check.** $-\nabla V = k\big[(2xy+z)\,\uv x+x^2\,\uv y+x\,\uv z\big] = \vb E$.

        Setting the variables not yet "reached" to zero on each leg is what makes the legs easy; that is the whole trick. The ECE 329 review does this for HW 2.21.
      `, { legs: { svg: fLegs(), cap: 'The integration path: leg 1 along $x$, leg 2 along $y$, leg 3 along $z$.' } }),

      P({
        title: 'Which field is electrostatic?',
        q: md`Two proposed static fields ($k$ a constant):

        $$\vb E_1 = k\big[2xz\,\uv x+2y\,\uv y+x^2\,\uv z\big],\qquad \vb E_2 = k\big[xz\,\uv x+2y\,\uv y+x^2\,\uv z\big].$$

        One of them is impossible. Find it, and find the potential of the other with the origin as reference, $V(0,0,0) = 0$.`,
        figHtml: fLegs(),
        hints: [
          md`The test for a possible electrostatic field is the curl: it must vanish everywhere.`,
          md`Only the $y$-component of the curl can be nonzero for these fields: $\partial_zE_x-\partial_xE_z$.`,
          md`For the possible one, integrate along the legs shown: along $x'$ (with $y' = z' = 0$), then $y'$, then $z'$. Then $V = -\int\vb E\cdot d\vb l$.`,
        ],
        parts: [
          { lbl: md`Which field is impossible?`, mc: [md`$\vb E_1$`, md`$\vb E_2$`, md`Both are possible`, md`Neither is possible`], a: 1,
            why: [md`$(\nabla\times\vb E_1)_y = \partial_z(2kxz)-\partial_x(kx^2) = 2kx-2kx = 0$, and the other components vanish too.`, null, md`$(\nabla\times\vb E_2)_y = kx-2kx = -kx\neq0$.`, md`$\vb E_1$ passes the curl test.`] },
          { lbl: md`$V$ for the possible field`, expr: '-k*(x^2*z + y^2)', vars: { k: [1, 3], x: [0.5, 2], y: [0.5, 2], z: [0.5, 2] }, accepts: ['-k*x^2*z - k*y^2'] },
        ],
        sol: md`
          **Curl test.** For both fields the $x$- and $z$-components of the curl vanish (no $y$ appears in $E_x$ or $E_z$, and $E_y = 2ky$ depends only on $y$). The $y$-components:

          - $\vb E_1$: $\partial_z(2kxz)-\partial_x(kx^2) = 2kx-2kx = 0$. Possible.
          - $\vb E_2$: $\partial_z(kxz)-\partial_x(kx^2) = kx-2kx = -kx\neq0$. **Impossible.**

          **Potential of $\vb E_1$**, along the three legs:

          1. $x'$ from $0$ to $x$ at $y' = z' = 0$: $E_x = 2kx'\cdot0 = 0$.
          2. $y'$ from $0$ to $y$ at $(x, y', 0)$: $E_y = 2ky'$, giving $ky^2$.
          3. $z'$ from $0$ to $z$ at $(x,y,z')$: $E_z = kx^2$, giving $kx^2z$.

          $V = -k(x^2z+y^2)$.

          **Check.** $-\nabla V = k(2xz,\ 2y,\ x^2) = \vb E_1$.

          **What to remember.** Curl test first; only then build $V$ leg by leg, and verify with $-\nabla V$.
        `,
      }),

      RF(md`
        ### Divergence-free fields, and Helmholtz in one line

        The mirror image of Theorem 1 (Griffiths' Theorem 2): $\nabla\cdot\vb F = 0$ everywhere ⇔ the flux through every closed surface is zero ⇔ $\vb F = \nabla\times\vb A$ for some $\vb A$. Magnetic fields live here, later in the course.

        **Helmholtz theorem.** A field that goes to zero far away is completely determined by its divergence and its curl. For electrostatics, $\nabla\cdot\vb E = \rho/\varepsilon_0$ and $\nabla\times\vb E = 0$, with $\vb E\to0$ at infinity, pin down $\vb E$, and Coulomb's law is that field. The boundary condition matters: $yz\,\uv x+zx\,\uv y+xy\,\uv z$ has zero divergence and zero curl but is not zero, because it doesn't vanish at infinity.
      `),

      Q(md`Two static fields have the same divergence and the same curl everywhere, and both go to zero far away. Then they`,
        [md`are identical`, md`may differ by a constant vector`, md`differ by some gradient`, md`need not be related at all`], 0,
        [null, md`A constant vector doesn't go to zero at infinity.`,
          md`Their difference has zero divergence, zero curl and vanishes far away; Helmholtz says it is zero.`,
          md`Helmholtz says exactly that they agree.`],
        md`The difference $\vb D$ has $\nabla\cdot\vb D = 0$, $\nabla\times\vb D = 0$ and $\vb D\to0$ far away, so $\vb D = 0$. This is why $\nabla\cdot\vb E = \rho/\varepsilon_0$ and $\nabla\times\vb E = 0$ (plus the boundary condition) contain all of electrostatics.`,
        { nofig: 'statement of a theorem' }),

      Q(md`All you know about a field is that $\nabla\cdot\vb F = 0$ everywhere. Which follows?`,
        [md`Its flux through every closed surface is zero`, md`It is curl-free`, md`$\vb F = 0$ everywhere`, md`$\vb F = -\nabla V$ for some $V$`], 0,
        [null, md`Divergence and curl are independent: $-y\,\uv x+x\,\uv y$ has zero divergence and curl $2\,\uv z$.`,
          md`A uniform field and the vortex $\hat{\boldsymbol\phi}/s$ are divergence-free and not zero.`,
          md`A potential needs zero *curl*. The divergence says nothing about it.`],
        md`The divergence theorem gives $\oint\vb F\cdot d\vb a = \int\nabla\cdot\vb F\,d\tau = 0$ for every closed surface (and $\vb F = \nabla\times\vb A$ for some $\vb A$). Divergence and curl are separate pieces of information; Helmholtz needs both, plus the behaviour at infinity.`,
        { nofig: 'logic of the theorems' }),

      RF(md`
        !!key Patterns to remember
          - $\nabla\times\nabla T = 0$ and $\nabla\cdot(\nabla\times\vb A) = 0$, always.
          - Curl-free everywhere ⇔ path-independent ⇔ zero around every loop ⇔ $\vb F = -\nabla V$.
          - Test for a possible static $\vb E$: its curl must vanish. Then $V = -\int_{\mathcal O}^{\vb r}\vb E\cdot d\vb l$ along any convenient path (legs parallel to the axes), and check with $-\nabla V$.
          - Holes matter: $\hat{\boldsymbol\phi}/s$ circulates $2\pi$ around the axis despite zero curl elsewhere.
          - Helmholtz: divergence + curl + "vanishes at infinity" fix the field.
      `),
    ],
  };

  // ======================================================================
  // Lesson 7 figures: the Dirac delta function
  // ======================================================================
  const radialField = (x, y) => { const r = Math.hypot(x, y); return [x / r ** 3, y / r ** 3]; };
  const fParadox = () => fieldFig(radialField, { skip: near0(0.3), extra: (f, X) => { f.circle(0, 0, X(0.8), { cls: 'dash' }); f.circle(0, 0, X(1.6), { cls: 'dash' }); } });
  const fSph3 = () => {
    const f = PF.fig(), R = 75;
    f.circle(0, 0, R, {});
    f.ellipse(0, 0, R, R * 0.28, { half: 'back', cls: 'dash dim' });
    f.ellipse(0, 0, R, R * 0.28, { half: 'front', cls: 'dim' });
    f.line(0, 0, R * Math.cos(35 * DEG), -R * Math.sin(35 * DEG), { cls: 'dim' });
    f.label(R * 0.5 * Math.cos(35 * DEG) - 5, -R * 0.5 * Math.sin(35 * DEG) - 7, '3', 'br', 'small');
    f.dot(0, 0, 2.6); f.label(-7, 0, 'O', 'r', 'small');
    return f.svg();
  };
  const fSphOff = () => {
    const f = PF.fig(), u = 48;
    f.arrow(0, 15, 0, -4.6 * u, { cls: 'dim', hs: 6 }); f.label(4, -4.6 * u - 3, 'z', 'bl', 'small accent');
    f.circle(0, -3 * u, u, { cls: 'thick' });
    f.dot(0, -3 * u, 2.4); f.label(6, -3 * u, 'z=3', 'l', 'small');
    f.dot(0, 0, 2.6); f.label(6, 6, 'O', 'tl', 'small');
    return f.svg();
  };
  // cube of half-size a centred on the origin; hidden edges (touching the far corner) dashed
  const cubeC = (g, a) => {
    const V = [-a, a];
    for (const i of [0, 1]) for (const j of [0, 1]) {
      const hid = (p) => p.every((c) => c < 0);
      const edges = [[[V[0], V[i], V[j]], [V[1], V[i], V[j]]], [[V[i], V[0], V[j]], [V[i], V[1], V[j]]], [[V[i], V[j], V[0]], [V[i], V[j], V[1]]]];
      for (const [p, q] of edges) g.l3(p, q, { cls: (hid(p) || hid(q)) ? 'dash dim' : '' });
    }
    return g;
  };
  const fCubeO = () => {
    const g = fig3(0, 0, 45);
    cubeC(g, 1);
    dot3(g, [0, 0, 0], 2.8);
    g.label(9, -7, 'O', 'bl', 'small');
    return g.svg();
  };
  const fSpike = () => {
    const rects = PF.fig();
    rects.arrow(-90, 0, 105, 0, { cls: 'dim', hs: 6 }); rects.label(109, 2, 'x', 'l', 'small accent');
    rects.rect(-30, -30, 60, 30, { cls: 'dim' }); rects.rect(-15, -60, 30, 60, { cls: 'dim' }); rects.rect(-7.5, -120, 15, 120, {});
    rects.label(36, -36, 'n=1', 'bl', 'small'); rects.label(21, -66, 'n=2', 'bl', 'small'); rects.label(13.5, -126, 'n=4', 'bl', 'small');
    rects.label(0, 6, 'a', 't', 'small accent');
    const sp = PF.fig();
    sp.arrow(-90, 0, 105, 0, { cls: 'dim', hs: 6 }); sp.label(109, 2, 'x', 'l', 'small accent');
    sp.arrow(0, 0, 0, -122, { cls: 'thick' });
    sp.label(9, -112, '\\delta(x-a)', 'l', 'small');
    sp.text(9, -64, 'area 1', 'l');
    sp.label(0, 6, 'a', 't', 'small accent');
    return Object.assign(PF.row([{ svg: rects.svg(), cap: 'Rectangles of width $1/n$ and height $n$: area $1$ each.' }, { svg: sp.svg(), cap: 'The limit: a spike of area $1$.' }]), { cap: '' });
  };
  const fSpikeRange = (lo, hi, o = {}) => {
    const f = PF.fig(), u = 40, X = (x) => x * u;
    const x0 = o.x0 ?? 0, x1 = o.x1 ?? 4, at = o.at ?? 2;
    f.rect(X(lo), -46, X(hi) - X(lo), 46, { cls: 'shade nodecl' });
    f.arrow(X(x0 - 0.5), 0, X(x1 + 0.5), 0, { cls: 'dim', hs: 6 }); f.label(X(x1 + 0.5) + 4, 2, 'x', 'l', 'small accent');
    for (let k = x0; k <= x1; k++) { f.line(X(k), 0, X(k), 4, { cls: 'dim' }); f.label(X(k), 7, String(k), 't', 'small accent'); }
    f.arrow(X(at), 0, X(at), -80, { cls: 'thick' });
    f.label(X(at), -87, o.lab ?? '\\delta(x-2)', 'b', 'small');
    return f.svg();
  };
  const fPointZd = () => {
    const g = fig3(0, 0, 1);
    g.axes3(110, { Lz: 120 });
    const q = g.p3(0, 0, 80);
    g.charge(q[0], q[1], { q: '+', r: 6 });
    g.tag(q[0], q[1], 'q', 'r', 12);
    g.dim(-16, 0, -16, -80, 'd', { at: 'l' });
    return g.svg();
  };
  const fLineCyl = () => {
    const g = fig3(0, 0, 1);
    const R = 45, z0 = 15, z1 = 125;
    g.l3([0, 0, -20], [0, 0, 150], { cls: 'thick' });
    ring3(g, R, z0, { cls: 'dash', backCls: 'dash dim' });
    ring3(g, R, z1, { cls: 'dash', backCls: 'dash' });
    for (const a of [109, -71]) { const c = Math.cos(a * DEG), s = Math.sin(a * DEG); g.l3([R * c, R * s, z0], [R * c, R * s, z1], { cls: 'dash' }); }
    const r = g.p3(R * Math.cos(109 * DEG), R * Math.sin(109 * DEG), z0), r2 = g.p3(R * Math.cos(109 * DEG), R * Math.sin(109 * DEG), z1);
    g.dim(r[0] + 22, r[1], r2[0] + 22, r2[1], 'L', { at: 'r' });
    const top = g.p3(0, 0, 150);
    g.text(top[0] + 8, top[1], 'line charge on the z-axis', 'l');
    return g.svg();
  };
  const fSphPanel = (zc, R, below) => {
    const f = PF.fig(), u = 16;
    f.arrow(0, 14, 0, -(zc + R) * u - 26, { cls: 'dim', hs: 6 }); f.label(4, -(zc + R) * u - 29, 'z', 'bl', 'small accent');
    f.circle(0, -zc * u, R * u, { cls: 'thick' });
    f.dot(0, 0, 2.6); f.label(6, below ? 6 : -6, 'O', below ? 'tl' : 'bl', 'small');
    return f.svg();
  };
  const fThreeSpheres = () => PF.row([
    { svg: fSphPanel(0, 3, false), cap: '(a) radius 3, centre $O$' },
    { svg: fSphPanel(4, 1, true), cap: '(b) radius 1, centre $(0,0,4)$' },
    { svg: fSphPanel(1, 2, false), cap: '(c) radius 2, centre $(0,0,1)$' },
  ]).svg;
  const fCubeB = () => {
    const g = fig3(0, 0, 40);
    cubeC(g, 1);
    dot3(g, [0, 0, 0], 2.8);
    g.label(9, -7, 'O', 'bl', 'small');
    const b = [1, 2, 2];
    dot3(g, b, 3.2); tag3(g, b, `${B('b')} = (1,2,2)`, 'r', 10, 'small');
    triad(g, -105, 75, 22);
    return g.svg();
  };

  // ======================================================================
  // Lesson 7: the Dirac delta function
  // ======================================================================
  const L7 = {
    id: 'u0-delta', title: 'The Dirac delta function',
    steps: [
      RF(md`
        ### A field that is all source and no divergence

        Take $\vb v = \uv r/r^2$, the shape of a point charge's field. The spherical divergence gives

        $$\nabla\cdot\vb v = \frac1{r^2}\frac{\partial}{\partial r}\Big(r^2\cdot\frac1{r^2}\Big) = \frac1{r^2}\frac{\partial}{\partial r}(1) = 0.$$

        But the flux through a sphere of radius $R$ centred on the origin is

        $$\oint\vb v\cdot d\vb a = \int\frac{1}{R^2}\,R^2\sin\theta\,d\theta\,d\phi = 4\pi,$$

        for **every** $R$. The divergence theorem then says $\int\nabla\cdot\vb v\,d\tau = 4\pi$, not $0$. The way out: the calculation above divides by $r^2$ and is valid only for $r\neq0$. All of the divergence sits at the single point $r = 0$, where $\vb v$ blows up, and it integrates to $4\pi$ however small the sphere. Physically this is obvious: every field line of a point charge starts at the charge.

        [[fig:par]]

        The $4\pi$ is the full solid angle. The field falls as $1/R^2$ exactly as fast as the sphere's area $4\pi R^2$ grows, so every sphere catches the same flux. With $\vb E = \dfrac{q}{4\pi\varepsilon_0}\dfrac{\uv r}{r^2}$ this is Gauss's law for a point charge, $\Phi_E = q/\varepsilon_0$.
      `, { par: { svg: fParadox(), cap: 'A slice through $\\uv r/r^2$. Both dashed spheres catch the same flux, $4\\pi$, so the region between them has no net source: the source is all at the centre.' } }),

      Q(md`What is the flux of $\uv r/r^2$ through the sphere of radius $3$ centred on the origin (figure)?`,
        [md`$4\pi/9$`, md`$4\pi$`, md`$36\pi$`, md`$0$`], 1,
        [md`$1/R^2 = 1/9$ is the field strength on the sphere, but the area $4\pi R^2 = 36\pi$ grows by exactly the same factor.`, null,
          md`That is the area alone; the field on the sphere is $1/9$, not $1$.`,
          md`The divergence is zero away from the origin, but the origin is inside this sphere.`],
        md`$\oint\frac{1}{R^2}\,R^2\sin\theta\,d\theta\,d\phi = 4\pi$ for every $R$. The $R^2$ cancels; that is the whole point.`,
        { figHtml: fSph3() }),

      Q(md`What is the flux of $\uv r/r^2$ through the sphere of radius $1$ centred at $(0,0,3)$ (figure)?`,
        [md`$0$`, md`$4\pi$`, md`$4\pi/9$`, md`$\pi$`], 0,
        [null, md`$4\pi$ needs the origin, the source, inside the surface. This sphere doesn't contain it.`,
          md`$1/9$ is roughly the field strength at the sphere's centre; the net flux counts what enters as well as what leaves.`,
          md`Whatever enters on the near side leaves on the far side; nothing is left over.`],
        md`Inside this sphere $\nabla\cdot(\uv r/r^2) = 0$ everywhere (the origin is outside), so by the divergence theorem the net flux is $0$. Field lines enter on the side facing the origin and leave on the far side.`,
        { figHtml: fSphOff() }),

      Q(md`What is the flux of $\uv r/r^2$ through the surface of the cube of side $2$ centred on the origin (figure)?`,
        [md`$24$`, md`$4\pi$`, md`$0$`, md`$8$`], 1,
        [md`$24$ is the cube's surface area; the field is neither $1$ on the faces nor perpendicular to them.`, null,
          md`The origin is inside the cube.`, md`$8$ is the cube's volume.`],
        md`The flux depends only on whether the origin is enclosed, not on the surface's shape: $\int\nabla\cdot(\uv r/r^2)\,d\tau = 4\pi$ for any volume containing the origin. (The six face integrals also give $4\pi$, with much more work.) That is why Gauss's law holds for any closed surface, not only spheres.`,
        { figHtml: fCubeO() }),

      Q(md`For $\uv r/r^3$, what is the flux through a sphere of radius $R$ centred on the origin (figure)?`,
        [md`$4\pi/R$; it depends on $R$, so $\nabla\cdot(\uv r/r^3)\neq0$ away from the origin`, md`$4\pi$ for every $R$`, md`$4\pi R$`, md`$0$`], 0,
        [null, md`Only $1/r^2$ gives an $R$-independent flux: $\frac1{R^3}\cdot4\pi R^2 = \frac{4\pi}{R}$.`,
          md`Check the powers: $R^{-3}\cdot R^2 = R^{-1}$.`, md`The field points outward everywhere, so the flux is positive.`],
        md`$\frac1{R^3}\cdot4\pi R^2 = 4\pi/R$. The flux through spheres falls as $R$ grows, so the shells in between have negative divergence: $\nabla\cdot(r^{-3}\uv r) = (n+2)r^{n-1} = -r^{-4}$ with $n = -3$. The inverse-square law is special.`,
        { figHtml: fBallR() }),

      RF(md`
        ### The one-dimensional delta function

        $\delta(x)$ is an infinitely tall, infinitely narrow spike at $x = 0$ with area $1$:

        $$\delta(x) = 0\quad(x\neq0),\qquad\int_{-\infty}^{\infty}\delta(x)\,dx = 1.$$

        Think of it as the limit of rectangles of width $1/n$ and height $n$. It only makes sense inside an integral. Its units are 1/(units of $x$).

        [[fig:spike]]

        **Sifting.** $f(x)\,\delta(x-a)$ vanishes except at $x = a$, so you may replace $f(x)$ by $f(a)$:

        $$\int f(x)\,\delta(x-a)\,dx = f(a)\quad\text{if }a\text{ lies inside the range of integration, and }0\text{ if it doesn't.}$$

        **Scaling.** $\delta(kx) = \dfrac{1}{|k|}\,\delta(x)$. Substitute $u = kx$: the spike gets narrower by $|k|$, so its area is $1/|k|$ (the absolute value because a negative $k$ flips the limits). In particular $\delta(-x) = \delta(x)$. For something like $\delta(3x+1)$: find where the argument vanishes ($x = -\tfrac13$) and divide by the magnitude of its slope, $\delta(3x+1) = \tfrac13\delta\big(x+\tfrac13\big)$.
      `, { spike: fSpike() }),

      Q(md`Evaluate $\displaystyle\int_0^3x^2\,\delta(x-2)\,dx$. (The shaded band is the range of integration.)`,
        [md`$4$`, md`$0$`, md`$9$`, md`$2$`], 0,
        [null, md`The spike at $x = 2$ is inside $[0,3]$, so it counts.`,
          md`$9 = 3^2$ evaluates at the upper limit; the delta function picks $x = 2$.`,
          md`$2$ is where the spike sits; you still have to evaluate $x^2$ there.`],
        md`The delta function picks out the value of $x^2$ at $x = 2$, which lies inside the range: $2^2 = 4$.`,
        { figHtml: fSpikeRange(0, 3) }),

      Q(md`Evaluate $\displaystyle\int_0^1x^2\,\delta(x-2)\,dx$. (The shaded band is the range of integration.)`,
        [md`$4$`, md`$1$`, md`$0$`, md`$\tfrac13$`], 2,
        [md`The spike at $x = 2$ lies outside $[0,1]$.`,
          md`$1 = 1^2$ evaluates at the upper limit, where there is no spike.`, null,
          md`$\tfrac13 = \int_0^1x^2\,dx$ ignores the delta function altogether.`],
        md`The integrand is zero everywhere on $[0,1]$, because the spike sits at $x = 2$. Always check that the spike is inside the range before sifting.`,
        { figHtml: fSpikeRange(0, 1) }),

      Q(md`Evaluate $\displaystyle\int_{-2}^{2}(2x+3)\,\delta(3x)\,dx$. (The shaded band is the range of integration.)`,
        [md`$3$`, md`$9$`, md`$0$`, md`$1$`], 3,
        [md`That forgets the scaling: $\delta(3x) = \tfrac13\delta(x)$.`, md`Scaling divides by $3$; it doesn't multiply.`,
          md`The spike at $x = 0$ is inside $[-2,2]$.`, null],
        md`$\delta(3x) = \tfrac13\delta(x)$, so the integral is $\tfrac13(2\cdot0+3) = 1$. Squeezing the spike by a factor $3$ leaves a third of the area.`,
        { figHtml: fSpikeRange(-2, 2, { x0: -2, x1: 2, at: 0, lab: '\\delta(3x)' }) }),

      Q(md`If $x$ is measured in metres, what are the units of $\delta(x)$?`,
        [md`Dimensionless`, md`m`, md`$\text{m}^{-1}$`, md`$\text{m}^{-3}$`], 2,
        [md`$\int\delta(x)\,dx = 1$ is a pure number, and $dx$ carries metres, so $\delta$ must carry the inverse.`,
          md`Backwards: $\delta(x)\,dx$ is dimensionless.`, null, md`That is $\delta^3(\vb r)$: three factors of $\text{m}^{-1}$.`],
        md`$\int\delta(x)\,dx = 1$, so $\delta(x)$ has the inverse units of $x$: $\text{m}^{-1}$. Likewise $\delta^3(\vb r)$ has units $\text{m}^{-3}$, which is why $q\,\delta^3(\vb r)$ is a charge density.`,
        { nofig: 'units' }),

      Q(md`Evaluate $\displaystyle\int_0^2x^3\,\delta(2x-2)\,dx$.`,
        [md`$1$`, md`$\tfrac12$`, md`$8$`, md`$4$`], 1,
        [md`$\delta(2x-2) = \delta\big(2(x-1)\big) = \tfrac12\delta(x-1)$: the $\tfrac12$ is missing.`, null,
          md`$8 = 2^3$ evaluates at $x = 2$, but the argument $2x-2$ vanishes at $x = 1$.`, md`$4 = 8/2$ uses the wrong point.`],
        md`The argument vanishes at $x = 1$ (inside the range) and has slope $2$, so $\delta(2x-2) = \tfrac12\delta(x-1)$ and the integral is $\tfrac12\cdot1^3 = \tfrac12$.`,
        { nofig: 'pure 1-D integral' }),

      RF(md`
        ### The three-dimensional delta function, and $\nabla\cdot(\uv r/r^2) = 4\pi\delta^3$

        $$\delta^3(\vb r) = \delta(x)\,\delta(y)\,\delta(z),\qquad\int_{\text{all space}}\delta^3(\vb r)\,d\tau = 1,\qquad\int f(\vb r)\,\delta^3(\vb r-\vb a)\,d\tau = f(\vb a).$$

        It has units of 1/volume. The charge density of a point charge $q$ at $\vb r'$ is $\rho(\vb r) = q\,\delta^3(\vb r-\vb r')$: zero everywhere except at the charge, with total $\int\rho\,d\tau = q$. (A true point charge is an idealisation, but a very useful one.)

        Now the paradox has a name. $\nabla\cdot(\uv r/r^2)$ is zero for $r\neq0$, and its integral over any volume containing the origin is $4\pi$. That is exactly $4\pi\delta^3(\vb r)$:

        $$\nabla\cdot\Big(\frac{\uv r}{r^2}\Big) = 4\pi\,\delta^3(\vb r),\qquad\qquad\nabla\cdot\Big(\frac{\srh}{\srm^2}\Big) = 4\pi\,\delta^3(\sr).$$

        In the second form $\sr = \vb r-\vb r'$, and $\nabla$ acts on $\vb r$ with $\vb r'$ held fixed. Since $\nabla(1/\srm) = -\srh/\srm^2$, the same fact reads $\nabla^2\dfrac1\srm = -4\pi\,\delta^3(\sr)$.

        **The payoff.** For a point charge at the origin, $\rho = \varepsilon_0\nabla\cdot\vb E = \varepsilon_0\cdot\dfrac{q}{4\pi\varepsilon_0}\cdot4\pi\delta^3(\vb r) = q\,\delta^3(\vb r)$. For any distribution, take the divergence inside Coulomb's integral:

        $$\nabla\cdot\vb E = \kq\int\rho(\vb r')\,\nabla\cdot\Big(\frac{\srh}{\srm^2}\Big)d\tau' = \kq\int\rho(\vb r')\,4\pi\delta^3(\vb r-\vb r')\,d\tau' = \frac{\rho(\vb r)}{\varepsilon_0}.$$

        That is Gauss's law in differential form, derived from Coulomb's law. Note the hat: the integrand is $\srh/\srm^2 = \sr/\srm^3$, not $\sr/\srm^2$.
      `),

      Q(md`What is the charge density of a point charge $q$ at $(0,0,d)$ (figure)?`,
        [md`$q\,\delta(z-d)$`, md`$q\,\delta^3(\vb r-d\,\uv z)$`, md`$q\,\delta^3(\vb r)$`, md`$\dfrac{q}{4\pi d^2}\,\delta(r-d)$`], 1,
        [md`$\delta(z-d)$ alone is spread over the whole plane $z = d$ and has units $1/\text{m}$: a sheet, not a point.`, null,
          md`That puts the charge at the origin.`, md`That is a thin spherical shell of radius $d$ carrying total charge $q$.`],
        md`$\rho(\vb r) = q\,\delta^3(\vb r-d\,\uv z) = q\,\delta(x)\,\delta(y)\,\delta(z-d)$. It vanishes except at $(0,0,d)$, has units of charge per volume, and integrates to $q$.`,
        { figHtml: fPointZd() }),

      Q(md`A uniform line charge $\lambda$ lies along the whole $z$-axis. Which volume charge density describes it?`,
        [md`$\lambda\,\delta^3(\vb r)$`, md`$\lambda\,\delta(x)\,\delta(y)$`, md`$\lambda\,\delta(z)$`, md`$\lambda\,\delta(s)$`], 1,
        [md`That is a single point at the origin, and its units are C/m$^4$, not C/m$^3$.`, null,
          md`$\delta(z)$ confines charge to the plane $z = 0$, not to the axis, and $\lambda\,\delta(z)$ has units C/m$^2$.`,
          md`One delta factor gives units C/m$^2$. A line needs two delta factors, one for each direction across it.`],
        md`$\delta(x)\,\delta(y)$ pins the charge to $x = y = 0$ for every $z$. Units: (C/m)(1/m)(1/m) = C/m$^3$. Check: the charge in a length $L$ is $\int\lambda\,\delta(x)\,\delta(y)\,dx\,dy\,dz = \lambda L$. Pattern: a point needs three delta factors, a line two, a sheet one ($\sigma\,\delta(z)$).`,
        { nofig: 'writing a density' }),

      Q(md`A thin spherical shell of radius $R$ carries total charge $Q$, spread uniformly (figure). Which $\rho(\vb r)$ describes it?`,
        [md`$Q\,\delta(r-R)$`, md`$\dfrac{Q}{4\pi R^2}\,\delta^3(\vb r)$`, md`$\dfrac{3Q}{4\pi R^3}$ for $r<R$, and $0$ outside`, md`$\dfrac{Q}{4\pi R^2}\,\delta(r-R)$`], 3,
        [md`Integrate it: $\int Q\,\delta(r-R)\,r^2\sin\theta\,dr\,d\theta\,d\phi = 4\pi R^2Q$. Too big by the shell's area.`,
          md`$\delta^3(\vb r)$ puts everything at the centre.`,
          md`That is a uniformly filled ball, not a shell.`, null],
        md`The surface density is $\sigma = Q/(4\pi R^2)$, and the radial delta pins it to $r = R$: $\rho = \sigma\,\delta(r-R)$. Check: $\int\rho\,d\tau = \sigma\,R^2\cdot4\pi = Q$. Same pattern as a sheet: surface density times a delta in the coordinate normal to the surface.`,
        { figHtml: fBallR() }),

      Q(md`What is $\nabla\cdot(\uv r/r^2)$ at the point $(1,2,2)$?`,
        [md`$0$`, md`$4\pi$`, md`$4\pi/9$`, md`Infinite`], 0,
        [null, md`$4\pi$ is the integral over a volume containing the origin, not the value at a point.`,
          md`No $1/r^2$ survives in the divergence away from the origin.`, md`It is infinite only at the origin.`],
        md`Away from the origin the divergence is zero: $\frac1{r^2}\frac{d}{dr}(r^2\cdot r^{-2}) = 0$. Equivalently, $4\pi\delta^3(\vb r)$ vanishes at $(1,2,2)$.`,
        { nofig: 'evaluation at a point' }),

      Q(md`In $\nabla\cdot(\uv r/r^2) = 4\pi\delta^3(\vb r)$, where does the $4\pi$ come from?`,
        [md`From the $4\pi$ in $4\pi\varepsilon_0$`, md`From the volume $\tfrac43\pi r^3$`, md`It is the flux of $\uv r/r^2$ through any sphere around the origin: the full solid angle`, md`It is a convention that could be set to $1$`], 2,
        [md`No $\varepsilon_0$ appears in this purely mathematical identity.`, md`No volume enters; the flux doesn't depend on $R$.`, null,
          md`It is forced by the divergence theorem, not chosen.`],
        md`Integrate both sides over a ball: the left side becomes the flux $\oint\frac{\uv r}{R^2}\cdot d\vb a = 4\pi$, and the right side $4\pi\int\delta^3\,d\tau = 4\pi$. The $4\pi$ in $4\pi\varepsilon_0$ is put into Coulomb's law precisely to cancel this one, so that $\nabla\cdot\vb E = \rho/\varepsilon_0$ comes out clean.`,
        { nofig: 'conceptual' }),

      Q(md`What is $\displaystyle\int_V\nabla^2\Big(\frac1r\Big)\,d\tau$ over a ball of radius $R$ centred on the origin?`,
        [md`$0$`, md`$-4\pi$`, md`$4\pi$`, md`$-4\pi/R$`], 1,
        [md`That is the naive answer from $r\neq0$; the origin contributes everything.`, null,
          md`$\nabla(1/r) = -\uv r/r^2$ carries a minus sign.`, md`The result doesn't depend on $R$.`],
        md`$\nabla^2\frac1r = \nabla\cdot\nabla\frac1r = -\nabla\cdot\frac{\uv r}{r^2} = -4\pi\delta^3(\vb r)$, so the integral is $-4\pi$. This is why $V = \dfrac{q}{4\pi\varepsilon_0r}$ satisfies $\nabla^2V = -\rho/\varepsilon_0$ with $\rho = q\,\delta^3(\vb r)$.`,
        { nofig: 'operator identity' }),

      Q(md`For $\uv s/s$ (the shape of a line charge's field), $\nabla\cdot(\uv s/s) = 0$ for $s\neq0$. What is the outward flux through the coaxial cylinder of radius $R$ and length $L$ shown, ends included?`,
        [md`$2\pi L$`, md`$2\pi RL$`, md`$0$`, md`$4\pi$`], 0,
        [null, md`On the side $v_s = 1/R$, which cancels the $R$ in the area $2\pi RL$.`,
          md`The axis, where the source sits, is inside the cylinder.`, md`$4\pi$ is the spherical (point-charge) version.`],
        md`Side: $\frac1R\cdot2\pi RL = 2\pi L$; ends: $\vb v\perp\uv z$, so zero. The flux doesn't depend on $R$, so all the divergence sits on the axis: $\nabla\cdot(\uv s/s) = 2\pi\,\delta(x)\,\delta(y)$. Multiply by $\dfrac{\lambda}{2\pi\varepsilon_0}$ and you have Gauss's law for a line charge, $\Phi = \lambda L/\varepsilon_0$.`,
        { figHtml: fLineCyl() }),

      RF(md`
        ### Worked example: a delta-function integral (Griffiths Ex. 1.16)

        Evaluate $J = \displaystyle\int_V(r^2+2)\,\nabla\cdot\Big(\frac{\uv r}{r^2}\Big)\,d\tau$, where $V$ is the ball of radius $R$ centred on the origin.

        [[fig:ball]]

        **With the delta function.** Replace the divergence by $4\pi\delta^3(\vb r)$ and sift:

        $$J = \int_V(r^2+2)\,4\pi\delta^3(\vb r)\,d\tau = 4\pi(0^2+2) = 8\pi.$$

        Only the value of $r^2+2$ at the origin matters, so the answer doesn't depend on $R$. If $V$ did *not* contain the origin, $J$ would be $0$.

        **Check by integration by parts.** $\int f\,\nabla\cdot\vb A\,d\tau = -\int\vb A\cdot\nabla f\,d\tau+\oint f\,\vb A\cdot d\vb a$ with $f = r^2+2$ and $\vb A = \uv r/r^2$:

        - $\nabla f = 2r\,\uv r$, so $-\int\dfrac{\uv r}{r^2}\cdot2r\,\uv r\,d\tau = -\int_0^R\dfrac2r\,4\pi r^2\,dr = -4\pi R^2$.
        - On the surface $f = R^2+2$ and $\oint\dfrac{\uv r}{R^2}\cdot d\vb a = 4\pi$, giving $4\pi(R^2+2)$.

        Total $-4\pi R^2+4\pi(R^2+2) = 8\pi$. Same answer, much more work. The naive route, "the divergence is zero, so $J = 0$", is wrong.
      `, { ball: { svg: fBallR(), cap: 'The ball of radius $R$ contains the origin, where the delta function sits.' } }),

      P({
        title: 'Delta function inside and outside',
        q: md`Evaluate $\displaystyle\int_V(r^3+5)\,\nabla\cdot\Big(\frac{\uv r}{r^2}\Big)\,d\tau$ for each of the three spheres shown ($r$ is the distance from the origin $O$).`,
        figHtml: fThreeSpheres(),
        hints: [
          md`Replace $\nabla\cdot(\uv r/r^2)$ by $4\pi\delta^3(\vb r)$. The integral is $4\pi f(\vb 0)$ if the origin is inside $V$, and $0$ if not.`,
          md`$f(\vb 0) = 0^3+5 = 5$, wherever the sphere is centred, because $r$ is measured from the origin.`,
          md`For (c): the centre is $1$ from the origin and the radius is $2$. Is the origin inside?`,
        ],
        parts: [
          { lbl: md`(a)`, ans: 20 * Math.PI },
          { lbl: md`(b)`, ans: 0 },
          { lbl: md`(c)`, ans: 20 * Math.PI },
        ],
        sol: md`
          With $\nabla\cdot(\uv r/r^2) = 4\pi\delta^3(\vb r)$, each integral is $4\pi\,(r^3+5)\big|_{\vb r = \vb 0} = 4\pi\cdot5 = 20\pi$ if $V$ contains the origin, and $0$ otherwise.

          - (a) Centred on $O$: contains it. $20\pi\approx62.8$.
          - (b) Centre $(0,0,4)$, radius $1$: the nearest point to $O$ is at $z = 3$. Doesn't contain it. $0$.
          - (c) Centre $(0,0,1)$, radius $2$: $O$ is $1<2$ from the centre, so it is inside. $20\pi$.

          **Trap.** In (c) the sphere is not centred on the origin, but that changes nothing: the delta function sits at $\vb r = \vb 0$ and $f$ is evaluated there. Never evaluate $f$ at the sphere's centre.

          **What to remember.** A delta-function integral reduces to "is the spike inside the region? If so, evaluate the rest of the integrand at the spike."
        `,
      }),

      P({
        title: 'One-dimensional delta integrals',
        q: md`Evaluate:

        (a) $\displaystyle\int_{-1}^{3}(x^3-2x)\,\delta(x-2)\,dx$ (b) $\displaystyle\int_0^{\pi}\cos x\,\delta\big(x-\tfrac\pi3\big)\,dx$ (c) $\displaystyle\int_{-2}^{2}x^2\,\delta(4x-2)\,dx$ (d) $\displaystyle\int_{-\infty}^{0}\delta(x-1)\,dx$`,
        nofig: 'pure 1-D integrals; the spike picture is in the lesson above',
        hints: [
          md`For each one: where does the argument of $\delta$ vanish, and is that point inside the range?`,
          md`If the argument is $kx-b$, write $\delta(kx-b) = \frac1{|k|}\delta(x-b/k)$ before sifting.`,
        ],
        parts: [
          { lbl: md`(a)`, ans: 4 },
          { lbl: md`(b)`, ans: 0.5 },
          { lbl: md`(c)`, ans: 1 / 16 },
          { lbl: md`(d)`, ans: 0 },
        ],
        sol: md`
          (a) Spike at $x = 2\in[-1,3]$: $2^3-2\cdot2 = 4$.

          (b) Spike at $\pi/3\in[0,\pi]$: $\cos(\pi/3) = \tfrac12$.

          (c) $\delta(4x-2) = \tfrac14\delta\big(x-\tfrac12\big)$, spike at $\tfrac12\in[-2,2]$: $\tfrac14\cdot\big(\tfrac12\big)^2 = \tfrac1{16}$.

          (d) The spike is at $x = 1$, outside $(-\infty,0]$: $0$.

          **What to remember.** Locate the zero of the argument, check it is in range, divide by the magnitude of the slope, evaluate.
        `,
      }),

      P({
        title: 'Three-dimensional delta integrals',
        q: md`With $\vb a = (3,0,1)$, $\vb b = (1,2,2)$ and $\vb c = (2,-2,1)$, evaluate:

        (a) $\displaystyle\int(r^2+\vb r\cdot\vb a)\,\delta^3(\vb r-\vb b)\,d\tau$ over all space;

        (b) the same integral over the cube of side $2$ centred on the origin (figure);

        (c) $\displaystyle\int|\vb r-\vb c|^2\,\delta^3(2\vb r)\,d\tau$ over all space.`,
        figHtml: fCubeB(),
        hints: [
          md`Sifting in 3-D: $\int f(\vb r)\,\delta^3(\vb r-\vb b)\,d\tau = f(\vb b)$, provided $\vb b$ is inside the region.`,
          md`(b): the cube spans $-1\le x,y,z\le1$. Is $\vb b = (1,2,2)$ inside it?`,
          md`(c): $\delta^3(2\vb r) = \delta(2x)\,\delta(2y)\,\delta(2z)$, and each factor brings a $\tfrac12$.`,
        ],
        parts: [
          { lbl: md`(a)`, ans: 14 },
          { lbl: md`(b)`, ans: 0 },
          { lbl: md`(c)`, ans: 9 / 8 },
        ],
        sol: md`
          (a) Evaluate at $\vb r = \vb b$: $b^2 = 1+4+4 = 9$ and $\vb b\cdot\vb a = 3+0+2 = 5$. Total $14$.

          (b) $\vb b$ has $y = 2>1$, so it lies outside the cube (figure). The integral is $0$.

          (c) $\delta^3(2\vb r) = \tfrac18\delta^3(\vb r)$, a spike at the origin (not at $\vb c$). $|\vb 0-\vb c|^2 = c^2 = 4+4+1 = 9$, so the result is $\tfrac98$.

          **What to remember.** In 3-D the scaling rule applies to each of the three factors: $\delta^3(k\vb r) = \delta^3(\vb r)/|k|^3$.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - $\nabla\cdot(\uv r/r^2) = 4\pi\delta^3(\vb r)$; $\nabla\cdot(\srh/\srm^2) = 4\pi\delta^3(\sr)$ with $\nabla$ on $\vb r$. The naive calculation gives $0$ because it is only valid for $r\neq0$.
          - The $4\pi$ is the flux of $\uv r/r^2$ through any closed surface around the origin; surfaces not enclosing it get $0$.
          - Sifting: $\int f\,\delta(x-a)\,dx = f(a)$ if $a$ is in range, else $0$. $\delta(kx) = \delta(x)/|k|$. Units: 1/(units of the argument).
          - Point charge: $\rho = q\,\delta^3(\vb r-\vb r')$.
          - Delta integrals: is the spike inside the region? Then evaluate the rest at the spike, with $f$ evaluated at the spike, not at the region's centre.

        !!key The whole unit on one card
          - On the formula sheet: the curvilinear line elements, unit vectors, gradient, divergence, curl and Laplacian, and the three fundamental theorems. Know how to *use* them: factors inside the derivative ($r^2v_r$, $\sin\theta\,v_\theta$, $s\,v_s$, $s\,v_\phi$), distance factors on angle derivatives, every term added.
          - Not on the sheet, so carry it yourself: $\sr = \vb r-\vb r'$ (source to field point); $d\tau = r^2\sin\theta\,dr\,d\theta\,d\phi$ and the area elements; outward normals for closed surfaces and the right-hand rule for Stokes; $\nabla\cdot(r^n\uv r) = (n+2)r^{n-1}$; curl-free ⇔ conservative ⇔ $\vb E = -\nabla V$; $\nabla\cdot(\uv r/r^2) = 4\pi\delta^3(\vb r)$ and how to sift.
          - When in doubt, convert to Cartesian components: unit vectors stop moving and everything becomes ordinary partial derivatives.
      `),
    ],
  };

  C.unit({
    id: 'u0', num: 'Unit 0', title: 'Vector calculus toolkit',
    blurb: 'Vectors and the separation vector, curvilinear coordinates, gradient, divergence, curl, the three fundamental theorems, potentials, and the Dirac delta.',
    lessons: [L1, L2, L3, L4, L5, L6, L7],
  });
})();

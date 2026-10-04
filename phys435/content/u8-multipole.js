/* Unit 8 — Multipole expansion (Griffiths 4th ed. 3.4).
   Theory, notation and examples follow Griffiths 3.4 (book pp. 151–160). */
(function () {
  'use strict';
  const { RF, P, Q, W } = C;
  const D2R = Math.PI / 180;

  // ================================================================ drawing helpers
  // Diagonal lines are drawn as short pieces so the label declutter sees the line itself, not its bounding box.
  const sub = (x1, y1, x2, y2, step = 7) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
    return [...Array(n + 1)].map((_, i) => [x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]);
  };
  const dl = (f, x1, y1, x2, y2, o = {}) => f.pl(sub(x1, y1, x2, y2), o);
  const da = (f, x1, y1, x2, y2, o = {}) => f.pl(sub(x1, y1, x2, y2), Object.assign({ arrow: 'end' }, o));
  const shadeP = (f, pts) => { pts.forEach((p) => f.track(p[0], p[1])); f.add(`<path class="shade nodecl" d="M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z"/>`); };
  const blobPts = (cx, cy, R0, n = 90) => [...Array(n)].map((_, i) => {
    const t = i / n * 2 * Math.PI, rr = R0 * (1 + 0.15 * Math.sin(3 * t + 0.6) + 0.08 * Math.cos(2 * t));
    return [cx + rr * Math.cos(t), cy - rr * Math.sin(t)];
  });
  // small + / − marks (charge density sketches, not point charges)
  const plus = (f, x, y, s = 3.2) => { f.line(x - s, y, x + s, y, { cls: 'thin' }); f.line(x, y - s, x, y + s, { cls: 'thin' }); };
  const minus = (f, x, y, s = 3.2) => f.line(x - s, y, x + s, y, { cls: 'thin' });
  // a pure dipole: thick arrow centred at (x, y), angle in degrees CCW from +x
  const pArrow = (f, x, y, ang = 90, L = 30, lab = '\\vb p', at = 'r') => {
    const c = Math.cos(ang * D2R), s = Math.sin(ang * D2R);
    f.pl(sub(x - c * L / 2, y + s * L / 2, x + c * L / 2, y - s * L / 2, 5), { cls: 'thick', arrow: 'end', hs: 8 });
    if (lab) f.tag(x + c * L / 4, y - s * L / 4, lab, at, 10);
    return f;
  };

  // Point charges in the yz-plane (y right, z up). list entries: [sign, y, z, label, label side]; positions in units of u px.
  // o.P = [r, thetaDeg] adds a field point at that distance and polar angle (from +z toward +y).
  function yz(list, o = {}) {
    const u = o.u || 46, f = PF.fig();
    const X = (y) => y * u, Y = (z) => -z * u;
    const e = o.ext || [1.6, 1.6, 1.6, 1.6];                     // axis reach: left, right, down, up
    if (o.axes !== false) f.axes(0, 0, { x: [-e[0] * u, e[1] * u], y: [-e[2] * u, e[3] * u], xl: o.xl || 'y', yl: o.yl || 'z' });
    if (o.pre) o.pre(f, X, Y);
    if (o.P) {
      const [rr, th] = o.P, px = X(rr * Math.sin(th * D2R)), py = Y(rr * Math.cos(th * D2R));
      dl(f, 0, 0, px, py, { cls: 'dim dash thin' });
      f.dot(px, py, 3); f.tag(px, py, o.Plab || 'P', o.Pat || 'tr', 7);
      if (o.Pth !== false) f.angle(0, 0, o.Pthr || 20, Math.min(90, 90 - th), Math.max(90, 90 - th), '\\theta');
      if (o.Prl !== false) { const m = o.Prf || 0.6; f.tag(px * m, py * m, 'r', o.Prat || 'br', 6, 'small'); }
    }
    for (const c of list) f.charge(X(c[1]), Y(c[2]), { q: c[0] > 0 ? '+' : '-', lab: c[3], at: c[4] || 'r' });
    for (const L of (o.labs || [])) f.label(X(L[0]), Y(L[1]), L[2], L[3] || 'c', 'small');
    if (o.post) o.post(f, X, Y);
    return f.svg();
  }

  // ================================================================ Lesson 1 figures
  // a localized blob of charge Q and a far field point
  const fBlob = () => {
    const f = PF.fig(), pts = blobPts(0, 0, 38);
    shadeP(f, pts); f.poly(pts);
    f.label(-6, -14, 'Q', 'c');
    f.dot(0, 0, 2.4); f.tag(0, 0, 'O', 'bl', 5, 'small');
    dl(f, 0, 0, 250, -62, { cls: 'dim dash thin' });
    f.dot(250, -62, 3); f.tag(250, -62, 'P', 'r', 7);
    f.label(150, -30, 'r', 'tl', 'small');
    f.dim(-40, 56, 40, 56, 'a', { at: 'b' });
    return f.svg();
  };

  // physical dipole: +q at z = d/2, -q at z = -d/2, field point P (Griffiths Fig. 3.26)
  const fDip = (o = {}) => {
    const f = PF.fig(), h = 46, th = 55, R = 175;
    const px = -R * Math.sin(th * D2R), py = -R * Math.cos(th * D2R);
    f.line(0, 80, 0, -165, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -167, 'z', 'bl', 'small accent');
    dl(f, 0, -h, px, py, { cls: 'thin' }); dl(f, 0, 0, px, py, { cls: 'dim dash thin' }); dl(f, 0, h, px, py, { cls: 'thin' });
    f.charge(0, -h, { q: '+', lab: '+q', at: 'r' }); f.charge(0, h, { q: '-', lab: '-q', at: 'r' });
    f.dot(px, py, 3); f.tag(px, py, 'P', 'l', 7);
    f.angle(0, 0, 20, 90, 90 + th, '\\theta');
    f.dim(46, -h, 46, h, 'd', { at: 'r' });
    f.label(-72, -82, '\\srm_+', 'b', 'small');
    f.label(-32, -7, 'r', 'c', 'small');
    f.label(-62, 4, '\\srm_-', 't', 'small');
    if (o.cap) f.text(0, 104, o.cap, 'c');
    return f.svg();
  };

  // geometry of the expansion (Griffiths Fig. 3.28)
  const fGeom = () => {
    const f = PF.fig(), pts = blobPts(0, 0, 58);
    shadeP(f, pts); f.poly(pts);
    const O = [-20, 22], S = [-2, -22], Pp = [215, -46];
    f.dot(O[0], O[1], 2.6); f.tag(O[0], O[1], 'O', 'bl', 5, 'small');
    f.rect(S[0] - 4, S[1] - 4, 8, 8); f.tag(S[0], S[1], "d\\tau'", 'l', 8, 'small');
    da(f, O[0], O[1], S[0] - 1.5, S[1] + 4, { hs: 6 });
    da(f, O[0], O[1], Pp[0], Pp[1], { hs: 7 });
    da(f, S[0] + 4, S[1], Pp[0], Pp[1], { hs: 7, cls: 'dim' });
    f.dot(Pp[0], Pp[1], 3); f.tag(Pp[0], Pp[1], 'P', 'r', 7);
    const aR = Math.atan2(O[1] - Pp[1], Pp[0] - O[0]) / D2R, aS = Math.atan2(O[1] - S[1], S[0] - O[0]) / D2R;
    f.angle(O[0], O[1], 24, aR, aS, '\\alpha');
    f.label(-17, 2, "\\vb r'", 'r', 'small');
    f.label(120, -10, '\\vb r', 't', 'small');
    f.label(118, -44, '\\sr', 'b', 'small');
    return f.svg();
  };

  // Legendre polynomials P0..P3
  const LP = [(x) => 1, (x) => x, (x) => (3 * x * x - 1) / 2, (x) => (5 * x * x * x - 3 * x) / 2];
  const fLeg = () => PF.plot({
    w: 340, h: 210, x: [-1, 1], y: [-1.15, 1.15], zero: true, xl: 'x', yl: 'P_n(x)', ml: 34,
    xt: [[-1, '-1'], [0, '0'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
    curves: [
      { f: LP[0], cls: 'dim thin', lab: 'P_0', labAt: -0.62, dy: -10 },
      { f: LP[1], cls: 'dash', lab: 'P_1', labAt: 0.55, dx: 6, dy: 4 },
      { f: LP[2], lab: 'P_2', labAt: -0.86, dx: 8, dy: -2 },
      { f: LP[3], cls: 'dim', lab: 'P_3', labAt: 0.42, dx: 2, dy: 12 },
    ],
  });

  // the hierarchy: monopole, dipole, quadrupole, octopole (Griffiths Fig. 3.27)
  const fHier = () => {
    const f = PF.fig(), r = 6;
    const ch = (x, y, s) => f.charge(x, y, { q: s > 0 ? '+' : '-', r });
    ch(0, 0, 1);
    f.line(96, 0, 136, 0, { cls: 'thin' }); ch(96, 0, -1); ch(136, 0, 1);
    f.rect(204, -20, 40, 40, { cls: 'thin' }); ch(204, -20, 1); ch(244, -20, -1); ch(204, 20, -1); ch(244, 20, 1);
    const o = [16, -14], A = [[318, -12], [350, -12], [318, 20], [350, 20]];
    const B = A.map((p) => [p[0] + o[0], p[1] + o[1]]);
    f.rect(B[0][0], B[0][1], 32, 32, { cls: 'thin dim dash' });
    for (let i = 0; i < 4; i++) dl(f, A[i][0], A[i][1], B[i][0], B[i][1], { cls: 'thin' });
    f.rect(A[0][0], A[0][1], 32, 32, { cls: 'thin' });
    [1, -1, -1, 1].forEach((s, i) => ch(B[i][0], B[i][1], -s));
    [1, -1, -1, 1].forEach((s, i) => ch(A[i][0], A[i][1], s));
    const cap = [[0, 'monopole', 'V\\propto 1/r'], [116, 'dipole', 'V\\propto 1/r^2'], [224, 'quadrupole', 'V\\propto 1/r^3'], [342, 'octopole', 'V\\propto 1/r^4']];
    for (const [x, w, t] of cap) { f.text(x, 46, w, 'c'); f.label(x, 64, t, 'c', 'small'); }
    return f.svg();
  };

  // two opposite dipoles side by side
  const fQuadPair = () => {
    const f = PF.fig();
    f.line(0, -24, 0, 24, { cls: 'thin' }); f.line(56, -24, 56, 24, { cls: 'thin' });
    f.charge(0, -24, { q: '+', lab: '+q', at: 'l' }); f.charge(0, 24, { q: '-', lab: '-q', at: 'l' });
    f.charge(56, -24, { q: '-', lab: '-q', at: 'r' }); f.charge(56, 24, { q: '+', lab: '+q', at: 'r' });
    f.dim(0, 46, 56, 46, 'a', { at: 'b' }); f.dim(-44, -24, -44, 24, 'a', { at: 'l' });
    return f.svg();
  };

  const fOrigin1 = () => yz([[1, 0, 0, 'q', 'br']], { P: [2.6, 50], ext: [1, 2.4, 0.9, 2.4] });
  const fTwoPlus = () => yz([[1, 0, 1, '+q', 'r'], [1, 0, -1, '+q', 'r']], { labs: [[-0.14, 0.5, 'a', 'r'], [-0.14, -0.5, 'a', 'r']], ext: [1.2, 1.6, 1.7, 1.7] });
  const fBelow = () => yz([[1, 0, -1, 'q', 'r']], { labs: [[-0.14, -0.5, 'b', 'r']], P: [2.6, 40], ext: [1, 2.2, 1.6, 2.4] });
  const fL1P1 = () => yz([[1, 0, 1, '+2q', 'l'], [-1, 0, -1, '-q', 'l']], { labs: [[-0.13, 0.5, 'a', 'r'], [-0.13, -0.5, 'a', 'r']], P: [3, 45], Prat: 'br', ext: [1.3, 2.5, 1.6, 2.6] });
  const fLinQ = () => yz([[1, 0, 1, '+q', 'l'], [-1, 0, 0, '-2q', 'br'], [1, 0, -1, '+q', 'l']], { labs: [[-0.13, 0.5, 'd', 'r'], [-0.13, -0.5, 'd', 'r']], P: [3, 50], ext: [1.3, 2.6, 1.6, 2.6] });
  const fDipZ = () => yz([[1, 0, 0.5, '+q', 'l'], [-1, 0, -0.5, '-q', 'l']], { u: 52, ext: [0.6, 2.3, 1.4, 2.4], P: [2.7, 45], Pthr: 46,
    post: (f, X, Y) => f.dim(X(-1), Y(0.5), X(-1), Y(-0.5), 'd', { at: 'l' }) });

  // the field point is outside every source point: r > r' for all of them
  const fConv = () => {
    const f = PF.fig(), pts = blobPts(0, 0, 40);
    shadeP(f, pts); f.poly(pts);
    f.circle(0, 0, 52, { cls: 'dim dash thin' });
    f.dot(0, 0, 2.4); f.tag(0, 0, 'O', 'bl', 5, 'small');
    dl(f, 0, 0, 36.8, -36.8, { cls: 'dim thin' });
    f.label(16, -24, "r'_{\\max}", 'r', 'small');
    dl(f, 0, 0, 200, -34, { cls: 'dim dash thin' });
    f.dot(200, -34, 3); f.tag(200, -34, 'P', 'r', 7);
    f.label(130, -14, 'r', 't', 'small');
    return f.svg();
  };
  // a neutral blob: positive on one side, negative on the other
  const fBlobN = () => {
    const f = PF.fig(), pts = blobPts(0, 0, 40);
    shadeP(f, pts); f.poly(pts);
    [[-22, -12], [-28, 8], [-12, 20], [-14, -26]].forEach(([x, y]) => plus(f, x, y));
    [[18, -18], [26, 4], [12, 22], [6, -4]].forEach(([x, y]) => minus(f, x, y));
    f.dim(-46, 60, 46, 60, 'a', { at: 'b' });
    f.text(78, -40, 'total charge 0', 'l');
    return f.svg();
  };

  // ================================================================ figures for the added conceptual questions
  const fEq90 = () => yz([[1, 0, 1, 'q', 'r']], { labs: [[-0.14, 0.5, 'd', 'r']], P: [2.8, 90], Pat: 't', ext: [1, 3.3, 0.6, 1.6] });
  const fStack = () => yz([], { pre: (f, X, Y) => { pArrow(f, X(0), Y(0.8), 90, 30, '\\vb p', 'r'); pArrow(f, X(0), Y(-0.8), 90, 30, '\\vb p', 'r'); },
    labs: [[-0.14, 0.4, 's', 'r'], [-0.14, -0.4, 's', 'r']], ext: [1, 1.4, 1.6, 1.7] });
  const fDipPlane = () => {
    const f = PF.fig();
    f.plane(20, 260, 140, { lab: 'V=0' });
    pArrow(f, 140, 70, 0, 34, '\\vb p', 't');
    f.dim(100, 70, 100, 140, 'd', { at: 'l' });
    return f.svg();
  };
  const fCubeRho = () => {
    const g = PF.fig({ proj: { ox: 60, oy: 170, s: 1 } });
    g.box3(110, 110, 110, { shadeTop: true });
    g.text(100, 210, 'uniform charge density, total Q, centred on the origin', 't');
    return g.svg();
  };
  const fDipQ = () => {
    const f = PF.fig();
    pArrow(f, 0, 0, 90, 30, '\\vb p', 'l');
    f.charge(150, 0, { q: '+', lab: 'q', at: 't' });
    f.dim(0, 34, 150, 34, 'r', { at: 'b' });
    return f.svg();
  };
  const fDipDip = () => {
    const f = PF.fig();
    pArrow(f, 0, 0, 90, 30, '\\vb p_1', 'l');
    pArrow(f, 150, 0, 90, 30, '\\vb p_2', 'r');
    f.dim(0, 34, 150, 34, 'r', { at: 'b' });
    return f.svg();
  };
  const fSphE = () => {
    const f = PF.fig(), R = 36;
    f.hatchBand(f.arcPts(0, 0, R, R, 0, 360)); f.circle(0, 0, R, { cls: 'thick' });
    for (const x of [-92, -64, 64, 92]) f.arrow(x, 62, x, -62);
    f.tag(92, -62, 'E_0\\,\\uv z', 'r', 6);
    f.label(0, R + 14, 'Q = 0', 't', 'small');
    return f.svg();
  };
  const fFlat = () => {
    const g = PF.fig({ proj: { ox: 120, oy: 110, s: 1 } });
    const pts = [...Array(72)].map((_, i) => { const t = i / 72 * 2 * Math.PI; return g.p3(60 * Math.cos(t), 70 * Math.sin(t), 0); });
    shadeP(g, pts); g.poly(pts);
    g.line(120, 150, 120, 20, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(124, 18, 'z', 'bl', 'small accent');
    g.label(200, 110, '\\sigma(x,y)', 'l', 'small');
    return g.svg();
  };

  // ================================================================ Lesson 1
  const L1 = {
    id: 'u8-expansion', title: 'Far away: the multipole expansion',
    steps: [
      RF(md`
        Far from a localized charge distribution, it looks like a point charge: $V \approx \kq\dfrac{Q}{r}$, with $Q$ the total charge. You have used this as a check many times. It leaves two questions open:

        - If $Q = 0$ (a neutral molecule), is the potential far away just zero? It is small, but it is not zero, and it has a definite shape.
        - If $Q \neq 0$, how good is $\kq\dfrac{Q}{r}$ at a given distance, and what is the next correction?

        The **multipole expansion** answers both. It writes the exact potential as a series in powers of $1/r$, where $r$ is the distance from an origin placed in or near the charges. Each term falls off one power of $r$ faster than the one before, so far away only the first nonzero term matters.

        ### First example: the physical dipole (Griffiths Ex. 3.10)

        Put $+q$ at $z = d/2$ and $-q$ at $z = -d/2$. The field point $P$ is a distance $r$ from the origin at polar angle $\theta$, and $\srm_\pm$ are its distances from the two charges.

        [[fig:dip]]

        Exact: $V = \kq\left(\dfrac{q}{\srm_+} - \dfrac{q}{\srm_-}\right)$. By the law of cosines,

        $$\srm_\pm^2 = r^2 + \left(\frac d2\right)^2 \mp rd\cos\theta = r^2\left(1 \mp \frac dr\cos\theta + \frac{d^2}{4r^2}\right).$$

        For $r \gg d$, drop the $\dfrac{d^2}{4r^2}$ term and use $(1+x)^{-1/2} \approx 1 - \tfrac12 x$:

        $$\frac{1}{\srm_\pm} \approx \frac1r\left(1 \pm \frac{d}{2r}\cos\theta\right) \quad\Rightarrow\quad \frac{1}{\srm_+} - \frac{1}{\srm_-} \approx \frac{d\cos\theta}{r^2},$$

        $$V(r,\theta) \approx \kq\,\frac{qd\cos\theta}{r^2}.$$

        The two $1/r$ pieces cancel because the net charge is zero. What survives falls like $1/r^2$, one power faster than a point charge. It is positive above the plane $z = 0$ (closer to $+q$), negative below it, and zero on it.

        !!intuition Why one extra power of $1/r$
          Each charge alone gives $\pm\dfrac{q}{4\pi\varepsilon_0 r}$. The two differ only because the charges sit at slightly different places, so what is left is a *difference*: roughly $d$ times the rate of change of $1/r$, which is $d/r^2$. Every time the leading piece cancels, you pay one more factor of (size of the distribution)/$r$.
      `, { dip: { svg: fDip(), cap: 'Physical dipole: $+q$ at $z=d/2$, $-q$ at $z=-d/2$; field point $P$ at $(r,\\theta)$.' } }),

      Q(md`A charge distribution of size $a$ has total charge $Q \neq 0$. At a point $P$ a distance $r \gg a$ away, which is the best simple approximation to $V$?`,
        [md`$\dfrac{Q}{4\pi\varepsilon_0 r^2}$`, md`It depends on the shape of the distribution, even at leading order`, md`$\dfrac{Q}{4\pi\varepsilon_0 r}$`, md`$0$, since $P$ is very far away`], 2,
        [md`$1/r^2$ is how the *field* of a point charge falls off, not the potential. The units are not volts either.`,
          md`The shape enters only through the correction terms, which are smaller by factors of order $a/r$. At leading order only the total charge matters.`,
          null,
          md`$V \to 0$ as $r \to \infty$, but you were asked for its approximate value at large $r$: $\dfrac{Q}{4\pi\varepsilon_0 r}$ is small, not zero.`],
        md`Far away, every charge element is at nearly the same distance $r$ from $P$, so $V \approx \kq\dfrac1r\displaystyle\int\rho\,d\tau' = \kq\dfrac{Q}{r}$. This is the monopole term. The corrections (dipole, quadrupole, ...) are smaller by factors of order $a/r$.`,
        { figHtml: fBlob() }),

      Q(md`For the physical dipole in the figure, with $r \gg d$ and $\theta$ fixed (not $90^\circ$), you double $r$. What happens to $V$?`,
        [md`It drops to $\tfrac14$ of its value`, md`It drops to $\tfrac12$`, md`It drops to $\tfrac18$`, md`It does not change, because the charges cancel`], 0,
        [null,
          md`Halving is the $1/r$ law of a single charge. Here the $1/r$ pieces of $+q$ and $-q$ cancel, leaving $V \propto 1/r^2$.`,
          md`$1/r^3$ is how the dipole's *field* falls off. Its potential goes as $1/r^2$.`,
          md`The charges cancel only at leading order. The difference $\dfrac{1}{\srm_+} - \dfrac{1}{\srm_-} \approx \dfrac{d\cos\theta}{r^2}$ is not zero.`],
        md`$V \approx \kq\dfrac{qd\cos\theta}{r^2}$, so doubling $r$ divides $V$ by 4. Rule of thumb: monopole potentials go as $1/r$, dipole as $1/r^2$, quadrupole as $1/r^3$.`,
        { figHtml: fDip() }),

      Q(md`Where is the potential of the physical dipole *exactly* zero (not just approximately)?`,
        [md`Only at infinity`, md`On the $z$ axis`, md`On a sphere of radius $d/2$ around the origin`, md`On the whole plane $z = 0$`], 3,
        [md`On the plane $z = 0$ it vanishes at every finite point too.`,
          md`On the $+z$ axis $P$ is closer to $+q$, so $V > 0$; on the $-z$ axis $V < 0$.`,
          md`That sphere passes through both charges, where $V$ blows up, and most of its points are not equidistant from them.`,
          null],
        md`Every point of the plane $z = 0$ is equidistant from $+q$ and $-q$ ($\srm_+ = \srm_-$), so the exact $V = \kq\left(\dfrac{q}{\srm_+} - \dfrac{q}{\srm_-}\right)$ is zero there. The approximation agrees: it is proportional to $\cos\theta$, and $\cos 90^\circ = 0$.`,
        { figHtml: fDip() }),

      RF(md`
        ### Expanding $1/\srm$ for any distribution

        For any distribution, $V(\vb r) = \kq\displaystyle\int\frac{\rho(\vb r')}{\srm}\,d\tau'$. In the figure, $\vb r'$ locates the source element $d\tau'$, $\vb r$ locates the field point $P$, and $\alpha$ is the **angle between $\vb r$ and $\vb r'$**.

        [[fig:geom]]

        Law of cosines: $\srm^2 = r^2 + r'^2 - 2rr'\cos\alpha = r^2\left[1 + \left(\dfrac{r'}{r}\right)^2 - 2\dfrac{r'}{r}\cos\alpha\right]$. Write $\srm = r\sqrt{1+\epsilon}$ with $\epsilon = \dfrac{r'}{r}\left(\dfrac{r'}{r} - 2\cos\alpha\right)$, expand $(1+\epsilon)^{-1/2} = 1 - \tfrac12\epsilon + \tfrac38\epsilon^2 - \dots$, and collect powers of $r'/r$. The coefficients come out as the Legendre polynomials from Unit 8:

        $$\frac{1}{\srm} = \frac1r\sum_{n=0}^{\infty}\left(\frac{r'}{r}\right)^nP_n(\cos\alpha) = \frac1r\left[1 + \frac{r'}{r}\cos\alpha + \left(\frac{r'}{r}\right)^2\frac{3\cos^2\alpha - 1}{2} + \cdots\right]\qquad (r' < r).$$

        ($1/\srm$ is called the *generating function* of the Legendre polynomials. Griffiths labels the order $n$ here; it is the same index as the $\ell$ of Unit 8.) Put this inside the integral. $r$ is a constant as far as the integration over the source is concerned, so it comes out:

        $$\boxed{V(\vb r) = \kq\sum_{n=0}^{\infty}\frac{1}{r^{n+1}}\int (r')^nP_n(\cos\alpha)\,\rho(\vb r')\,d\tau'}$$

        Written out,

        $$V = \kq\left[\frac1r\int\rho\,d\tau' + \frac{1}{r^2}\int r'\cos\alpha\,\rho\,d\tau' + \frac{1}{r^3}\int (r')^2\,\frac{3\cos^2\alpha - 1}{2}\,\rho\,d\tau' + \cdots\right].$$

        The series is **exact** at any field point outside the whole distribution ($r > r'$ for every source point). It becomes an **approximation** when you keep only the first few terms.

        | $n$ | name | $V$ falls like | $E$ falls like |
        |---|---|---|---|
        | 0 | monopole | $1/r$ | $1/r^2$ |
        | 1 | dipole | $1/r^2$ | $1/r^3$ |
        | 2 | quadrupole | $1/r^3$ | $1/r^4$ |
        | 3 | octopole | $1/r^4$ | $1/r^5$ |

        !!key What $\alpha$ is
          $\alpha$ is the angle at the origin between the direction to the field point and the direction to the source element. It changes as you sweep over the source, and it changes when you move $P$. It equals the polar angle $\theta'$ of the source only when $P$ is on the $+z$ axis, which is what makes on-axis calculations easy (Lesson 4).

        !!trap $\alpha$ is not $\theta$
          $\theta$ is the polar angle of the field point. Replacing $P_n(\cos\alpha)$ by $P_n(\cos\theta)$ inside the integral is the classic mistake: the integral would then ignore where the charge actually is.

        ### Legendre recap (Unit 8)

        | $P_0(x)$ | $P_1(x)$ | $P_2(x)$ | $P_3(x)$ |
        |---|---|---|---|
        | $1$ | $x$ | $\tfrac12(3x^2-1)$ | $\tfrac12(5x^3-3x)$ |

        $P_n(1) = 1$ and $P_n(-1) = (-1)^n$. Even $n$ gives an even polynomial, odd $n$ an odd one: $P_n(-x) = (-1)^nP_n(x)$. Here $x = \cos\alpha$.

        [[fig:leg]]
      `, { geom: { svg: fGeom(), cap: 'Source element $d\\tau\'$ at $\\vb r\'$, field point $P$ at $\\vb r$, separation $\\sr = \\vb r - \\vb r\'$; $\\alpha$ is the angle between $\\vb r$ and $\\vb r\'$ (Griffiths Fig. 3.28).' }, leg: { svg: fLeg(), cap: 'The first four Legendre polynomials on $-1 \\le x \\le 1$.' } }),

      Q(md`In the multipole expansion, what is the angle $\alpha$?`,
        [md`The polar angle $\theta$ of the field point $P$`, md`The angle between $\vb r$ (to the field point) and $\vb r'$ (to the source element)`, md`The angle between $\vb r'$ and the separation vector $\sr$`, md`The polar angle $\theta'$ of the source element, always`], 1,
        [md`$\theta$ is measured from the $z$ axis; $\alpha$ is measured from $\vb r$. They differ in general.`,
          null,
          md`In the triangle $O$, $d\tau'$, $P$ the side opposite $\srm$ faces the angle at $O$, between $\vb r$ and $\vb r'$. That is the angle in $\srm^2 = r^2 + r'^2 - 2rr'\cos\alpha$.`,
          md`Only when the field point is on the $+z$ axis. In general $\alpha$ depends on both directions.`],
        md`$\srm^2 = r^2 + r'^2 - 2rr'\cos\alpha$ is the law of cosines in the triangle $O$, $d\tau'$, $P$. The angle in it sits at $O$, between $\vb r$ and $\vb r'$. Because $\vb r$ points at the field point, $\alpha$ changes when you move $P$, and it varies over the source as you integrate.`,
        { figHtml: fGeom() }),

      Q(md`When is $\alpha$ equal to the polar angle $\theta'$ of the source element, for every source element?`,
        [md`When the source lies on the $z$ axis`, md`When $r \gg r'$`, md`When the field point $P$ is on the $+z$ axis`, md`Never; they are different angles`], 2,
        [md`For a source on the $z$ axis $\theta' = 0$ or $\pi$, but $\alpha$ still depends on where $P$ is.`,
          md`The size of $r$ does not change any angle.`,
          null,
          md`They coincide whenever $\vb r$ points along $+\uv z$: then the angle from $\vb r$ is the angle from the $z$ axis.`],
        md`$\alpha$ is the angle between $\vb r'$ and $\vb r$; $\theta'$ is the angle between $\vb r'$ and $\uv z$. If $\vb r = z\,\uv z$ with $z > 0$, they are the same angle. On the $-z$ axis, $\alpha = \pi - \theta'$.`,
        { figHtml: fGeom() }),

      Q(md`When is the multipole series for $V$ valid (convergent and exact)?`,
        [md`When $r > r'$ for every source point: $P$ is farther from the origin than every bit of charge`, md`Only when $r \gg r'$; for $r$ just above the source size it diverges`, md`Only on the $z$ axis`, md`Everywhere, including inside the distribution`], 0,
        [null,
          md`The series in $r'/r$ converges for any $r'/r < 1$. Being far away ($r \gg r'$) only means that *a few terms* already give a good approximation.`,
          md`$\alpha$ handles any direction, so the expansion holds off the axis too.`,
          md`Inside the distribution some source points have $r' > r$, and for them the series in $r'/r$ diverges.`],
        md`The expansion of $1/\srm$ is a power series in $r'/r$ that converges for $r'/r < 1$. So the full series is exact at any point farther out than the farthest charge (outside the dashed sphere in the figure). Far away the terms shrink fast, which is why truncating after one or two terms works.`,
        { figHtml: fConv() }),

      Q(md`Expanding $\dfrac{r}{\srm} = (1+\epsilon)^{-1/2}$ with $\epsilon = \dfrac{r'}{r}\left(\dfrac{r'}{r} - 2\cos\alpha\right)$, what is the coefficient of $(r'/r)^2$?`,
        [md`$\cos^2\alpha$`, md`$3\cos^2\alpha - 1$`, md`$\tfrac32\cos^2\alpha$`, md`$\tfrac12(3\cos^2\alpha - 1) = P_2(\cos\alpha)$`], 3,
        [md`Both the $-\tfrac12\epsilon$ and the $\tfrac38\epsilon^2$ terms contribute at order $(r'/r)^2$; this matches neither.`,
          md`Right shape, but twice too big: the sum is $-\tfrac12 + \tfrac32\cos^2\alpha$.`,
          md`That is only the $\tfrac38\epsilon^2$ piece. The $-\tfrac12\epsilon$ term has a $(r'/r)^2$ part too: $-\tfrac12(r'/r)^2$.`,
          null],
        md`$-\tfrac12\epsilon$ contributes $-\tfrac12(r'/r)^2$. $\tfrac38\epsilon^2$ contributes $\tfrac38\cdot 4\cos^2\alpha\,(r'/r)^2 = \tfrac32\cos^2\alpha\,(r'/r)^2$ at this order. Sum: $\tfrac12(3\cos^2\alpha - 1) = P_2(\cos\alpha)$. The same bookkeeping at every order gives $P_n$, which is why $1/\srm$ is called the generating function of the Legendre polynomials.`,
        { nofig: 'pure algebra of the binomial series' }),

      Q(md`In $V = \kq\displaystyle\sum_n \frac{1}{r^{n+1}}\int (r')^nP_n(\cos\alpha)\,\rho\,d\tau'$, how does the $n$-th term fall off with $r$ (direction held fixed)?`,
        [md`$1/r^n$`, md`$1/r^{n+1}$`, md`$1/r^{2n+1}$`, md`$1/r^{n+2}$`], 1,
        [md`Then the $n=0$ term would be constant. The monopole goes as $1/r$.`,
          null,
          md`Too fast: the dipole ($n=1$) goes as $1/r^2$, not $1/r^3$.`,
          md`That is how the *field* of the $n$-th term falls off, after one more derivative.`],
        md`The integral depends only on the direction $\uv r$ (through $\alpha$), not on $r$. So the $n$-th term is (a function of direction) times $1/r^{n+1}$: monopole $1/r$, dipole $1/r^2$, quadrupole $1/r^3$. Its field, $-\nabla V$, falls one power faster.`,
        { nofig: 'scaling of the general formula' }),

      Q(md`What are the units of the $n = 2$ moment $\displaystyle\int (r')^2P_2(\cos\alpha)\,\rho\,d\tau'$?`,
        [md`$\text{C}$`, md`$\text{C}\cdot\text{m}$`, md`$\text{C}\cdot\text{m}^2$`, md`$\text{C}/\text{m}^2$`], 2,
        [md`That is the monopole moment ($n = 0$).`, md`That is the dipole moment ($n = 1$).`, null, md`$\rho\,d\tau'$ is a charge and $(r')^2$ is a length squared; nothing divides by an area.`],
        md`$\rho\,d\tau'$ is a charge, $P_2$ is a pure number, and $(r')^2$ is in $\text{m}^2$. In general the $n$-th moment has units $\text{C}\cdot\text{m}^n$, and dividing by $4\pi\varepsilon_0 r^{n+1}$ gives volts, as it must.`,
        { nofig: 'units only' }),
      RF(md`
        ### Which term matters

        Each term is smaller than the one before by roughly (size of the distribution)/$r$: the $n$-th term carries $\dfrac{(r')^n}{r^{n+1}}$, with $r' \lesssim a$. At $r = 10a$ each successive term is down by about a factor of ten.

        !!key The first nonzero term dominates far away
          Find the lowest $n$ whose moment is not zero. Far away, $V$ is approximately that term alone, and $V \propto 1/r^{n+1}$. The later terms are corrections of relative size about $a/r$, $(a/r)^2$, and so on.

        - $Q \neq 0$: the monopole wins, $V \approx \kq\dfrac{Q}{r}$.
        - $Q = 0$ but a nonzero dipole moment: the dipole wins, $V \propto 1/r^2$.
        - $Q = 0$ and zero dipole moment: quadrupole ($1/r^3$) or higher.

        The building blocks: one charge is a monopole. Two opposite charges make a dipole. Two opposite dipoles make a quadrupole, and two opposite quadrupoles an octopole. Each step cancels the previous leading term and costs one power of $1/r$.

        [[fig:hier]]

        A point charge **at the origin** is a pure monopole: every higher moment contains $(r')^n = 0$, so $V = \kq\dfrac{q}{r}$ is exact with one term. Move the charge off the origin and every higher moment appears (Lesson 2).
      `, { hier: { svg: fHier(), cap: 'Monopole, dipole, quadrupole, octopole (Griffiths Fig. 3.27). Each is two opposite copies of the one before.' } }),

      Q(md`Which statement about the multipole series at large $r$ is correct?`,
        [md`The monopole term always dominates.`, md`The term with the largest moment (in SI units) dominates.`, md`The lowest-order term whose moment is nonzero dominates.`, md`All terms contribute comparably; you need the whole series.`], 2,
        [md`Only if $Q \neq 0$. For a neutral distribution the monopole term is zero and the dipole (or higher) takes over.`,
          md`Moments of different order have different units ($\text{C}$, $\text{C}\cdot\text{m}$, $\text{C}\cdot\text{m}^2$, ...), so comparing their sizes means nothing. What decides is the power of $1/r$.`,
          null,
          md`The $n$-th term is suppressed by about $(a/r)^n$ relative to the monopole scale; far away the higher terms are negligible.`],
        md`The $n$-th term goes as $1/r^{n+1}$, so the lowest nonzero order wins as $r \to \infty$. Each later term is a correction smaller by about $a/r$ per order.`,
        { figHtml: fHier() }),

      Q(md`Two equal and opposite dipoles sit side by side, as shown. Far away, $V$ falls off like`,
        [md`$1/r$`, md`$1/r^2$`, md`$1/r^4$`, md`$1/r^3$`], 3,
        [md`The total charge is zero, so there is no monopole term.`,
          md`The two dipole moments are equal and opposite, so the total dipole moment is zero too.`,
          md`$1/r^4$ is an octopole, which takes two opposite quadrupoles.`,
          null],
        md`$Q = 0$ and the dipole moments cancel. The first surviving term is the quadrupole, $V \propto 1/r^3$. Each cancellation costs one power of $1/r$.`,
        { figHtml: fQuadPair() }),

      Q(md`A neutral distribution of size $a$ has a nonzero dipole moment. At $r = 20a$, roughly how big is its quadrupole term compared with its dipole term?`,
        [md`About $a/r \approx 5\%$ of it, or less`, md`About the same size`, md`Larger, since it is higher order`, md`Exactly zero`], 0,
        [null,
          md`Successive terms differ by a factor of about $r'/r \lesssim a/r$, not by a factor of order one.`,
          md`Higher order means *more* factors of $a/r$, so smaller far away.`,
          md`It is small, but nothing forces it to vanish for a general distribution. (Symmetric ones can make it zero.)`],
        md`Dipole term $\sim \dfrac{qa}{r^2}$, quadrupole term $\sim \dfrac{qa^2}{r^3}$. Their ratio is about $a/r = 1/20$. That is why the dipole formula alone is a good description of a neutral molecule a few molecular sizes away.`,
        { figHtml: fBlobN() }),

      Q(md`A neutral distribution has all its charge within $r'\le a$ of the origin. You want $V$ at $r = 1.2a$. Is its leading (dipole) term alone a good approximation there?`,
        [md`Yes: the series converges for $r>a$, so the first term is enough`, md`Usually not: each higher term is smaller only by a factor of roughly $a/r\approx0.8$, so many terms matter`, md`No, because the series diverges for $r<2a$`, md`Yes, because the quadrupole term is always smaller than the dipole term`], 1,
        [md`Convergent doesn't mean fast. Close to the source the terms shrink slowly.`, null,
          md`It converges for every $r > r'_{\max} = a$; it just converges slowly when $r$ is close to $a$.`,
          md`The $n$-th term carries $(r'/r)^n$; at $r = 1.2a$ that's barely below $1$, so the quadrupole can be as big as the dipole.`],
        md`The $n$-th term is down by roughly $(a/r)^n$ relative to the lowest one. At $r = 20a$ that's $0.05$ per order, and one or two terms do. At $r = 1.2a$ it's $0.83$ per order: the series still converges, but you'd need many terms. The multipole expansion is a far-field tool.`,
        { figHtml: fConv() }),

      Q(md`A single point charge $q$ sits at the origin. Which terms of the multipole expansion are nonzero?`,
        [md`All of them, since a point charge has structure at every scale`, md`Only the monopole term, and it is exact`, md`The monopole and the dipole terms`, md`None: the expansion breaks down at $r' = 0$`], 1,
        [md`Every moment with $n \ge 1$ contains $(r')^n$, which is zero for a charge at $r' = 0$.`,
          null,
          md`The dipole moment is $q$ times its position vector, $q\cdot\vb 0 = 0$.`,
          md`$r' = 0$ is the easiest case: $\srm = r$ exactly.`],
        md`With the charge at the origin, $\srm = r$ for every field point, so $V = \kq\dfrac{q}{r}$ exactly. In the series, every moment with $n \ge 1$ carries $(r')^n = 0$.`,
        { figHtml: fOrigin1() }),

      RF(md`
        ### Point charges on the $z$ axis

        For point charges the integral becomes a sum: $\displaystyle\int (r')^nP_n(\cos\alpha)\,\rho\,d\tau' \;\to\; \sum_i q_i\,(r_i')^nP_n(\cos\alpha_i)$.

        When all the charges sit on the $z$ axis there is a shortcut. Take a charge $q$ at $z = s$ and a field point at $(r,\theta)$:

        - $s > 0$: $r' = s$ and $\alpha = \theta$, so the contribution is $q\,s^nP_n(\cos\theta)$.
        - $s < 0$: $r' = |s|$ and $\alpha = \pi - \theta$. Since $P_n(-x) = (-1)^nP_n(x)$, the contribution is $q|s|^n(-1)^nP_n(\cos\theta) = q\,s^nP_n(\cos\theta)$.

        Same formula either way:

        $$V(r,\theta) = \kq\sum_{n=0}^{\infty}\Big(\sum_i q_is_i^{\,n}\Big)\frac{P_n(\cos\theta)}{r^{n+1}}\qquad(r > \text{every } |s_i|).$$

        For collinear charges, the $n$-th moment is just $\sum_i q_is_i^{\,n}$, with the signs of the $s_i$ included.

        ### Worked example: the physical dipole to higher order

        $+q$ at $s = d/2$ and $-q$ at $s = -d/2$:

        [[fig:dz]]

        $$\sum_i q_is_i^{\,n} = q\left[\left(\frac d2\right)^n - \left(-\frac d2\right)^n\right] = \begin{cases} 0, & n \text{ even},\\[2pt] 2q\left(\dfrac d2\right)^n, & n \text{ odd}.\end{cases}$$

        - $n = 0$: $Q = 0$, no monopole.
        - $n = 1$: $qd$, so the dipole term is $\kq\dfrac{qd\cos\theta}{r^2}$, as before.
        - $n = 2$: zero. Reflecting $z \to -z$ swaps $+q$ and $-q$, so the arrangement is antisymmetric, and every even (symmetric) term must vanish.
        - $n = 3$: $\tfrac14qd^3$, so the octopole term is $\kq\dfrac{qd^3}{4}\,\dfrac{P_3(\cos\theta)}{r^4}$.

        $$V = \kq\left[\frac{qd\cos\theta}{r^2} + \frac{qd^3}{4}\,\frac{P_3(\cos\theta)}{r^4} + \cdots\right].$$

        On the axis ($\theta = 0$, every $P_n = 1$) the octopole term is $\dfrac{d^2}{4r^2}$ of the dipole term: $0.25\%$ at $r = 10d$. Check against the exact on-axis value, $V = \kq\left(\dfrac{q}{r - d/2} - \dfrac{q}{r + d/2}\right) = \kq\dfrac{qd}{r^2 - d^2/4}$: expanding, $\dfrac{qd}{r^2}\left(1 + \dfrac{d^2}{4r^2} + \cdots\right)$.
      `, { dz: { svg: fDipZ(), cap: 'Physical dipole centered on the origin, field point at $(r,\\theta)$.' } }),

      Q(md`Two charges $+q$ sit at $z = +a$ and $z = -a$. Which terms of the multipole expansion about the origin vanish?`,
        [md`All odd $n$: dipole, octopole, ...`, md`All even $n$: monopole, quadrupole, ...`, md`All terms except the monopole`, md`None of them`], 0,
        [null,
          md`The monopole moment is $2q \neq 0$, and every even moment is $qa^n + q(-a)^n = 2qa^n \neq 0$.`,
          md`$\sum q_is_i^2 = 2qa^2 \neq 0$: there is a quadrupole term.`,
          md`$\sum q_is_i = qa - qa = 0$, and the same happens for every odd $n$.`],
        md`$\sum q_is_i^{\,n} = qa^n + q(-a)^n$: $2qa^n$ for even $n$, zero for odd $n$. The arrangement is symmetric under $z \to -z$ and odd Legendre terms are antisymmetric, so they drop out. Far away $V \approx \kq\dfrac{2q}{r}$, and the first correction is the quadrupole $\kq\dfrac{2qa^2P_2(\cos\theta)}{r^3}$.`,
        { figHtml: fTwoPlus() }),

      Q(md`A single charge $q$ sits at $z = -b$, below the origin. What is the dipole ($n = 1$) term of its multipole expansion about the origin?`,
        [md`$+\kq\dfrac{qb\cos\theta}{r^2}$`, md`Zero: a single charge has no dipole moment`, md`$-\kq\dfrac{qb\cos\theta}{r^2}$`, md`$-\kq\dfrac{qb}{r^2}$, the same in every direction`], 2,
        [md`The sign of $s$ matters: $s = -b$, so $qs = -qb$.`,
          md`A single charge has zero dipole moment only about its own position. About an origin a distance $b$ away, its dipole moment is $q$ times its position vector, $-qb\,\uv z$.`,
          null,
          md`The dipole term always carries the angular factor $P_1(\cos\theta) = \cos\theta$.`],
        md`The $n = 1$ moment is $qs = -qb$, so the term is $\kq\dfrac{-qb\cos\theta}{r^2}$. Sanity check: straight below the origin ($\theta = \pi$) the charge is closer to you than the origin is, so $V$ should exceed $\kq\dfrac qr$. The correction there is $\kq\dfrac{-qb\cos\pi}{r^2} = +\kq\dfrac{qb}{r^2}$, which is positive.`,
        { figHtml: fBelow() }),

      Q(md`For the centered physical dipole ($\pm q$ at $z = \pm d/2$), how large is the error of $V \approx \kq\dfrac{qd\cos\theta}{r^2}$ on the $z$ axis at $r = 10d$?`,
        [md`About $10\%$`, md`About $0.25\%$`, md`About $1\%$`, md`Zero: on the axis the formula is exact`], 1,
        [md`That would be an error of relative size $d/r$. Here the quadrupole term vanishes, and the next nonzero term is two orders up.`,
          null,
          md`$(d/r)^2$ is $1\%$, but the octopole coefficient carries a $\tfrac14$: $\dfrac{d^2}{4r^2} = 0.25\%$.`,
          md`On the axis the exact value is $\kq\dfrac{qd}{r^2 - d^2/4}$, not $\kq\dfrac{qd}{r^2}$.`],
        md`The next nonzero term is the octopole, $\kq\dfrac{qd^3}{4}\dfrac{P_3(1)}{r^4}$. Relative to the dipole term on the axis it is $\dfrac{d^2}{4r^2} = \dfrac{1}{400} = 0.25\%$. The quadrupole term is zero by symmetry, which makes the dipole formula unusually good for a dipole centered on the origin.`,
        { figHtml: fDipZ() }),

      P({
        id: 'u8-p-axis3', title: 'Two charges on the axis: three terms',
        q: md`Charge $+2q$ sits at $z = a$ and charge $-q$ at $z = -a$. Find the first three terms (monopole, dipole, quadrupole) of the multipole expansion about the origin.`,
        figHtml: fL1P1(),
        hints: [
          md`All the charges are on the $z$ axis, so the $n$-th term is $\kq\Big(\sum_i q_is_i^{\,n}\Big)\dfrac{P_n(\cos\theta)}{r^{n+1}}$.`,
          md`List the pairs $(q_i, s_i)$: $(2q, a)$ and $(-q, -a)$. Keep the sign of each $s_i$.`,
          md`$n = 0$: $2q - q$. $n = 1$: $2q\cdot a + (-q)(-a)$. $n = 2$: $2q\,a^2 + (-q)(-a)^2$.`,
        ],
        parts: [
          { lbl: md`$\sum_i q_i$ (monopole moment)`, expr: 'q', vars: { q: [1, 3] } },
          { lbl: md`$\sum_i q_is_i$ (dipole moment $p_z$)`, expr: '3*q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`$\sum_i q_is_i^2$ (quadrupole moment)`, expr: 'q*a^2', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`On the $+z$ axis at $r = 20a$: (dipole term)/(monopole term)`, ans: 0.15, unit: '' },
        ],
        sol: md`
          Moments $\sum q_is_i^{\,n}$ with $(q_i, s_i) = (2q, a)$ and $(-q, -a)$:

          | $n$ | moment | term in $V$ |
          |---|---|---|
          | 0 | $2q - q = q$ | $\kq\dfrac{q}{r}$ |
          | 1 | $2qa + qa = 3qa$ | $\kq\dfrac{3qa\cos\theta}{r^2}$ |
          | 2 | $2qa^2 - qa^2 = qa^2$ | $\kq\dfrac{qa^2}{r^3}\,\dfrac{3\cos^2\theta - 1}{2}$ |

          $$V \approx \kq\left[\frac qr + \frac{3qa\cos\theta}{r^2} + \frac{qa^2(3\cos^2\theta - 1)}{2r^3}\right].$$

          On the $+z$ axis at $r = 20a$: $\dfrac{3qa}{r^2}\cdot\dfrac{r}{q} = \dfrac{3a}{r} = 0.15$. A $15\%$ correction is large because the charge is not centered on the origin.

          Sign check on the dipole moment: the $-q$ below the origin contributes $(-q)(-a) = +qa$, the same as a positive charge above the origin would. Both make the top side more positive.

          !!key What to remember
            For collinear charges, tabulate $\sum q_is_i^{\,n}$ order by order. Signs of the positions matter for odd $n$; for even $n$ they don't.
        `,
      }),

      P({
        id: 'u8-p-linquad', title: 'Linear quadrupole',
        q: md`Charges $+q$ sit at $z = \pm d$ and $-2q$ at the origin (a *linear quadrupole*). Find the leading term of the potential far away, and its sign in the plane $z = 0$.`,
        figHtml: fLinQ(),
        hints: [
          md`Collinear charges: compute $\sum q_is_i^{\,n}$ for $n = 0, 1, 2, \dots$ until one is nonzero.`,
          md`$n = 0$: $q + q - 2q$. $n = 1$: $qd - qd + 0$. $n = 2$: $qd^2 + qd^2 + 0$.`,
          md`The term is $\kq\Big(\sum q_is_i^2\Big)\dfrac{P_2(\cos\theta)}{r^3}$, with $P_2(\cos\theta) = \tfrac12(3\cos^2\theta - 1)$.`,
        ],
        parts: [
          { lbl: 'V(r,\\theta)', expr: 'q*d^2*(3*cos(theta)^2-1)/(4*pi*eps0*r^3)', vars: { q: [1, 3], d: [0.5, 2], r: [5, 20], theta: [0.1, 3.0], eps0: [0.5, 2] }, accepts: ['2*q*d^2*(3*cos(theta)^2-1)/(2*4*pi*eps0*r^3)'] },
          { lbl: md`Far away in the plane $z = 0$, $V$ is`, mc: [md`positive`, md`negative`, md`zero`], a: 1,
            why: [md`$P_2(0) = -\tfrac12$, so the term is negative there. A point in that plane is farther from the two $+q$'s than from the $-2q$.`, null, md`$P_2(\cos 90^\circ) = -\tfrac12 \neq 0$. The quadrupole term vanishes only where $\cos^2\theta = 1/3$.`] },
        ],
        sol: md`
          Moments: $\sum q_i = 0$, $\sum q_is_i = qd - qd = 0$, $\sum q_is_i^2 = 2qd^2$. The first nonzero one is $n = 2$:

          $$V \approx \kq\,2qd^2\,\frac{P_2(\cos\theta)}{r^3} = \frac{qd^2(3\cos^2\theta - 1)}{4\pi\varepsilon_0 r^3}.$$

          In the plane $z = 0$, $P_2(0) = -\tfrac12$, so $V \approx -\kq\dfrac{qd^2}{r^3} < 0$.

          Exact check in that plane: $V = \kq\left(\dfrac{2q}{\sqrt{r^2 + d^2}} - \dfrac{2q}{r}\right)$. With $\dfrac{1}{\sqrt{r^2+d^2}} \approx \dfrac1r - \dfrac{d^2}{2r^3}$ this is $-\kq\dfrac{qd^2}{r^3}$, matching.

          !!key What to remember
            This is two opposite physical dipoles placed tail to tail: $+q$ over $-q$ (pointing up) and $-q$ over $+q$ (pointing down), with the two $-q$'s merged into the $-2q$ at the origin. Charge and dipole moment both cancel, so $V$ falls as $1/r^3$, with the angular shape $P_2(\cos\theta)$: positive along the axis, negative around the equator.
        `,
      }),

      Q(md`In the linear quadrupole ($+q$ at $z = d$, $-2q$ at the origin, $+q$ at $z = -d$), the middle charge is nudged up by a tiny $\delta\ll d$. Far enough away, which term leads?`,
        [md`Still the quadrupole: $\delta$ is tiny`, md`The monopole`, md`The octopole`, md`The dipole, $\vb p = -2q\delta\,\uv z$: a small coefficient, but it falls off one power slower and wins at large $r$`], 3,
        [md`At moderate distances, yes. But the dipole term $\propto\delta/r^2$ beats the quadrupole term $\propto d^2/r^3$ once $r\gg d^2/\delta$.`,
          md`The total charge is still $q - 2q + q = 0$.`,
          md`An octopole needs the dipole and quadrupole to vanish; here the dipole doesn't.`, null],
        md`$Q = 0$, but $\vb p = \sum q_i\vb r_i = qd\,\uv z - 2q\delta\,\uv z - qd\,\uv z = -2q\delta\,\uv z \ne 0$. The lowest nonzero moment always wins far enough away, however small its coefficient. Symmetric arrangements kill low moments exactly; any imperfection brings them back.`,
        { figHtml: fLinQ() }),

      Q(md`Far from the (unperturbed) linear quadrupole, $V\propto\dfrac{P_2(\cos\theta)}{r^3}$. In which directions is the far potential zero?`,
        [md`On the cone $\cos^2\theta = \tfrac13$, i.e. $\theta\approx54.7^\circ$ and $125.3^\circ$`, md`On the $xy$-plane, $\theta = 90^\circ$`, md`On the $z$ axis`, md`Nowhere: $V$ is positive in every direction`], 0,
        [null, md`At $90^\circ$, $P_2(0) = -\tfrac12$: negative, not zero. The middle $-2q$ is closest there.`,
          md`On the axis $P_2(1) = 1$: the end charges are closest, and $V>0$.`,
          md`$P_2$ changes sign, so $V$ is positive near the axis and negative near the equator.`],
        md`$P_2(x) = \tfrac12(3x^2-1) = 0$ at $x^2 = \tfrac13$. Inside that cone (near the axis) the end charges dominate and $V>0$; outside it (near the equator) the $-2q$ dominates and $V<0$. Compare a dipole, whose far potential vanishes on the plane $\theta = 90^\circ$.`,
        { figHtml: fLinQ() }),

      Q(md`A dipole's field falls off like $1/r^3$. How does the field of a linear quadrupole fall off far away?`,
        [md`Like $1/r^3$ too`, md`Like $1/r^2$`, md`Like $1/r^5$`, md`Like $1/r^4$`], 3,
        [md`Only if the potentials fell off alike. The quadrupole's $V$ goes like $1/r^3$, one power faster than the dipole's.`,
          md`That's a monopole's field.`,
          md`One power too many: the gradient takes away exactly one power of $r$.`, null],
        md`$V_{\text{quad}}\propto 1/r^3$, and $\vb E = -\nabla V$ costs one more power: $|\vb E|\propto1/r^4$. In general the $n$-th term has $V\propto 1/r^{n+1}$ and $E\propto1/r^{n+2}$.`,
        { figHtml: fLinQ() }),

      RF(md`
        !!key Patterns to remember
          - $V = \kq\displaystyle\sum_n \frac{1}{r^{n+1}}\int (r')^nP_n(\cos\alpha)\,\rho\,d\tau'$, exact outside the distribution. $\alpha$ is the angle between $\vb r$ and $\vb r'$, not the polar angle of $P$.
          - The $n$-th term falls as $1/r^{n+1}$. The lowest nonzero one dominates far away; each later term is down by about (size)/$r$.
          - Charges on the $z$ axis: the $n$-th moment is $\sum_i q_is_i^{\,n}$ (signed positions), multiplied by $\dfrac{P_n(\cos\theta)}{r^{n+1}}$.
          - Symmetry kills alternate terms. Charges on the $z$ axis that are symmetric under $z \to -z$ give no odd terms; antisymmetric ones (reflection flips every charge's sign) give no even terms. For a general 3-D distribution the symmetry that matters is inversion through the origin, $\vb r \to -\vb r$ (Lesson 2).
          - The error of a truncated series is about the first neglected nonzero term.
      `),
    ],
  };

  // ================================================================ Lesson 2 figures
  const fPd = () => {
    const f = PF.fig();
    f.line(-53, 0, 53, 0, { cls: 'thin dim' });
    f.charge(-60, 0, { q: '-', lab: '-q', at: 'b' }); f.charge(60, 0, { q: '+', lab: '+q', at: 'b' });
    f.line(-46, -24, 46, -24, { arrow: 'end', hs: 7 }); f.label(0, -30, '\\vb d', 'b');
    f.label(0, 36, '\\vb p = q\\vb d', 't');
    return f.svg();
  };
  const fQ1L2 = () => yz([[-1, 0, 0, '-2q', 'br'], [1, 0, 1, '+2q', 'r']], { labs: [[-0.13, 0.5, 'd', 'r']], ext: [1, 1.6, 0.9, 1.7] });
  const fHorizDip = () => yz([[-1, -0.6, 0, '-q', 'b'], [1, 0.6, 0, '+q', 'b']], { ext: [1.4, 1.4, 0.5, 1.0],
    post: (f, X) => f.dim(X(-0.6), 46, X(0.6), 46, 'd', { at: 'b' }) });
  const fTwoDip = () => {
    const f = PF.fig(), h = 30;
    f.line(-h + 7, 0, h - 7, 0, { cls: 'thin dim' }); f.line(0, -h + 7, 0, h - 7, { cls: 'thin dim' });
    f.charge(-h, 0, { q: '-', lab: '-q', at: 'l' }); f.charge(h, 0, { q: '+', lab: '+q', at: 'r' });
    f.charge(0, -h, { q: '+', lab: '+q', at: 't' }); f.charge(0, h, { q: '-', lab: '-q', at: 'b' });
    f.dim(-h, 72, h, 72, 'd', { at: 'b' });
    f.arrow(-96, 40, -66, 40, { cls: 'dim', hs: 5 }); f.label(-62, 40, 'y', 'l', 'small accent');
    f.arrow(-96, 40, -96, 10, { cls: 'dim', hs: 5 }); f.label(-96, 6, 'z', 'b', 'small accent');
    return f.svg();
  };
  const fSquare = () => {
    const f = PF.fig(), h = 23;
    f.rect(-h, -h, 2 * h, 2 * h, { cls: 'thin dim dash' });
    f.charge(-h, -h, { q: '+', lab: '+q', at: 'tl' }); f.charge(h, -h, { q: '-', lab: '-q', at: 'tr' });
    f.charge(h, h, { q: '+', lab: '+q', at: 'br' }); f.charge(-h, h, { q: '-', lab: '-q', at: 'bl' });
    f.dot(0, 0, 2); f.tag(0, 0, 'O', 'r', 5, 'small');
    f.dim(-h, 54, h, 54, 'a', { at: 'b' });
    return f.svg();
  };
  const fDipTheta = () => yz([], { pre: (f) => pArrow(f, 0, 0, 90, 30, '\\vb p', 'tl'), P: [2.4, 120], Prat: 'tr', ext: [1.2, 2.4, 2.0, 1.4] });
  // triangle edges as short pieces (dl): a single slanted segment's bounding box would cover the whole interior,
  // and the runtime declutter would push the "O" (or a side label) out of the triangle
  const triEdges = (f, pts, o) => pts.forEach((p, i) => { const n = pts[(i + 1) % pts.length]; dl(f, p[0], p[1], n[0], n[1], o); });
  const fTri = () => {
    const f = PF.fig(), A = [0, -46], B = [-40, 23], Cc = [40, 23];
    triEdges(f, [A, B, Cc], { cls: 'thin dim dash' });
    f.charge(A[0], A[1], { q: '-', lab: '-2q', at: 't' }); f.charge(B[0], B[1], { q: '+', lab: 'q', at: 'bl' }); f.charge(Cc[0], Cc[1], { q: '+', lab: 'q', at: 'br' });
    f.dot(0, 0, 2); f.tag(0, 0, 'O', 'r', 5, 'small');
    return f.svg();
  };
  const fZpair = () => yz([[1, 0, 0, '+q', 'br'], [1, 0, 1, '+q', 'r']], { labs: [[-0.13, 0.5, 'd', 'r']], ext: [1, 1.6, 0.9, 1.7] });
  const fLimit = () => {
    const f = PF.fig();
    const pair = (x, h, l1, l2) => { f.line(x, -h, x, h, { cls: 'thin' }); f.charge(x, -h, { q: '+', lab: l1, at: 'r' }); f.charge(x, h, { q: '-', lab: l2, at: 'r' }); };
    pair(0, 36, '+q', '-q'); f.dim(-20, -36, -20, 36, 'd', { at: 'l' });
    pair(110, 18, '+2q', '-2q'); f.dim(90, -18, 90, 18, '\\tfrac d2', { at: 'l' });
    pair(220, 9, '+4q', '-4q'); f.dim(200, -9, 200, 9, '\\tfrac d4', { at: 'l' });
    f.arrow(276, 0, 306, 0, { cls: 'dim', hs: 6 });
    pArrow(f, 330, 0, 90, 30, '\\vb p', 'r');
    f.text(150, 62, 'qd = p held fixed', 'c');
    return f.svg();
  };
  const fAtom = () => {
    const f = PF.fig();
    shadeP(f, f.arcPts(0, 0, 46, 46, 0, 360)); f.circle(0, 0, 46, { cls: 'dash dim' });
    f.charge(0, 0, { q: '+', lab: '+Ze', at: 'b' });
    f.text(56, -40, 'electron cloud, total −Ze', 'l');
    return f.svg();
  };
  const fShell = () => {
    const f = PF.fig();
    f.circle(0, 0, 50);
    for (let k = 0; k < 12; k++) { const a = (k * 30 + 15) * D2R; plus(f, 41 * Math.cos(a), -41 * Math.sin(a)); }
    f.dot(0, 0, 2.4); f.tag(0, 0, 'O', 'r', 5, 'small');
    f.text(60, -40, 'uniform surface charge, total Q', 'l');
    return f.svg();
  };
  const fOff = () => {
    const f = PF.fig();
    f.axes(0, 0, { x: [-30, 170], y: [-30, 150], xl: 'y', yl: 'z' });
    dl(f, 0, 0, 130, -120, { cls: 'thin' }); dl(f, 60, 0, 130, -120, { cls: 'thin' });
    f.charge(60, 0, { q: '+', lab: 'q', at: 'b' });
    f.dot(130, -120, 3); f.tag(130, -120, 'P', 'tr', 7);
    f.tag(0, 0, 'O', 'bl', 6, 'small');
    f.label(57, -62, 'r', 'r', 'small'); f.label(104, -56, '\\srm', 'l', 'small');
    f.dim(0, 34, 60, 34, 'd', { at: 'b' });
    return f.svg();
  };
  const fShift = () => {
    const f = PF.fig(), A = [60, -50], S = [110, -140];
    f.axes(0, 0, { x: [-8, 210], y: [-8, 165], xl: 'x', yl: 'y' });
    f.line(A[0] - 6, A[1], A[0] + 140, A[1], { cls: 'dim dash thin', arrow: 'end', hs: 5 }); f.label(A[0] + 143, A[1] + 2, '\\bar x', 'l', 'small accent');
    f.line(A[0], A[1] + 6, A[0], A[1] - 122, { cls: 'dim dash thin', arrow: 'end', hs: 5 }); f.label(A[0] + 3, A[1] - 125, '\\bar y', 'bl', 'small accent');
    da(f, 0, 0, A[0], A[1], { cls: 'thick', hs: 8 });
    f.rect(S[0] - 4, S[1] - 4, 8, 8); f.tag(S[0], S[1], "d\\tau'", 'r', 8, 'small');
    da(f, 0, 0, S[0] - 3, S[1] + 4, { hs: 6 });
    da(f, A[0], A[1], S[0] - 2, S[1] + 4, { hs: 6, cls: 'dim' });
    f.tag(0, 0, 'O', 'bl', 6, 'small'); f.tag(A[0], A[1], "O'", 'br', 7, 'small');
    f.label(52, -14, '\\vb a', 'c', 'small');
    f.label(45, -70, "\\vb r'", 'r', 'small'); f.label(96, -92, "\\bar{\\vb r}'", 'l', 'small');
    return f.svg();
  };
  const fTriB = () => {
    const f = PF.fig(), A = [0, -46], B = [-40, 23], Cc = [40, 23];
    triEdges(f, [A, B, Cc], { cls: 'thin dim' });
    f.charge(A[0], A[1], { q: '-', lab: '-q', at: 't' }); f.charge(B[0], B[1], { q: '+', lab: 'q', at: 'bl' }); f.charge(Cc[0], Cc[1], { q: '+', lab: 'q', at: 'br' });
    f.tag(-20, -11.5, 'a', 'tl', 8, 'small'); f.tag(20, -11.5, 'a', 'tr', 8, 'small'); f.tag(0, 23, 'a', 'b', 8, 'small');
    return f.svg();
  };
  const fCC = () => yz([[1, 0, 0, 'q', 'br'], [1, 0, 1, '3q', 'r']], { labs: [[-0.13, 0.5, 'a', 'r']], ext: [1, 1.6, 0.9, 1.7] });
  const fL2W = () => PF.row([
    { svg: yz([[-1, 0, 0, '-q', 'br'], [1, 0, 1, '2q', 'r']], { labs: [[-0.13, 0.5, 'a', 'r']], ext: [1, 1.5, 1.4, 1.7] }), cap: '(A)' },
    { svg: yz([[1, 0, 0, '2q', 'br'], [-1, 0, -1, '-q', 'r']], { labs: [[-0.13, -0.5, 'a', 'r']], ext: [1, 1.5, 1.4, 1.7] }), cap: '(B)' },
  ]);
  const fL2P1 = () => yz([[1, 0, 1, '+2q', 'r'], [-1, 1, 0, '-q', 'b'], [1, 0, -1, '+q', 'r'], [-1, -1, 0, '-2q', 'b']],
    { labs: [[-0.13, 0.5, 'a', 'r'], [0.5, 0.13, 'a', 'b']], ext: [1.6, 1.6, 1.6, 1.7] });
  const fL2P2 = () => yz([[1, 0, 0, 'q', 'bl'], [1, 0, 1, '2q', 'l'], [-1, 1, 0, '-q', 'b']],
    { labs: [[-0.13, 0.5, 'd', 'r'], [0.5, 0.13, 'd', 'b']], ext: [1, 1.6, 1, 1.7], post: (f, X, Y) => f.tag(X(0), Y(1), "O'", 'tr', 11, 'small') });
  const fShellCos = () => {
    const f = PF.fig(), R = 58;
    f.line(0, R + 30, 0, -R - 34, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -R - 36, 'z', 'bl', 'small accent');
    f.circle(0, 0, R);
    for (const th of [12, 36, 60]) for (const s of [1, -1]) {
      plus(f, s * (R - 9) * Math.sin(th * D2R), -(R - 9) * Math.cos(th * D2R));
      minus(f, s * (R - 9) * Math.sin(th * D2R), (R - 9) * Math.cos(th * D2R));
    }
    f.line(0, 0, R, 0, { cls: 'dim thin' }); f.label(R / 2, -5, 'R', 'b', 'small');
    f.label(R + 14, -R + 4, '\\sigma = k\\cos\\theta', 'l', 'small');
    return f.svg();
  };

  // ---- widget: |V| along a ray, exact vs leading multipole term, log-log
  const MP = {
    origin: { name: 'q at the origin', ch: [[1, 0, 0]] },
    off: { name: 'q at z = a', ch: [[1, 0, 1]] },
    dip: { name: 'physical dipole ±q at z = ±a/2', ch: [[1, 0, 0.5], [-1, 0, -0.5]] },
    pair: { name: '+q and +q at z = ±a/2', ch: [[1, 0, 0.5], [1, 0, -0.5]] },
    lin: { name: 'linear quadrupole +q, −2q, +q', ch: [[1, 0, 1], [-2, 0, 0], [1, 0, -1]] },
    sq: { name: 'square quadrupole (side a)', ch: [[1, -0.5, 0.5], [-1, 0.5, 0.5], [1, 0.5, -0.5], [-1, -0.5, -0.5]] },
    three: { name: '3q at z = a, −q at the origin', ch: [[3, 0, 1], [-1, 0, 0]] },
  };
  const ORD = ['monopole', 'dipole', 'quadrupole', 'octopole', '16-pole', '32-pole'];
  const Pn = (n, x) => { if (n === 0) return 1; let p0 = 1, p1 = x; for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; } return p1; };
  const wMulti = () => W(`
    <div class="w-title">Which term wins far away? $|V|$ along a ray from the origin, on log–log axes</div>
    <div class="w-row"><label>Charges <select class="cfg">${Object.entries(MP).map(([k, v]) => `<option value="${k}"${k === 'dip' ? ' selected' : ''}>${v.name}</option>`).join('')}</select></label>
      <label>Ray angle θ <input class="th" type="range" min="0" max="180" step="5" value="30"></label><span class="w-out thv"></span></div>
    <div class="w-grid"><div class="w-plot cfgfig"></div><div class="w-plot p1"></div></div>
    <div class="w-note out"></div>`, (el) => {
    const $ = (s) => el.querySelector(s);
    const fm = (x) => (Math.abs(x) < 1e-9 ? '0' : String(+x.toFixed(3)));
    function coeffs(C, th) {
      const uy = Math.sin(th), uz = Math.cos(th);
      return [0, 1, 2, 3, 4, 5].map((n) => C.reduce((s, [q, y, z]) => {
        const rp = Math.hypot(y, z);
        if (rp < 1e-12) return s + (n === 0 ? q : 0);
        return s + q * Math.pow(rp, n) * Pn(n, (y * uy + z * uz) / rp);
      }, 0));
    }
    function draw() {
      const C = MP[$('.cfg').value].ch, deg = +$('.th').value, th = deg * D2R;
      $('.thv').textContent = `${deg}°`;
      const uy = Math.sin(th), uz = Math.cos(th);
      const V = (r) => C.reduce((s, [q, y, z]) => s + q / Math.hypot(r * uy - y, r * uz - z), 0);
      const cs = coeffs(C, th);
      const lead = cs.findIndex((c) => Math.abs(c) > 1e-9);
      let gen = 9;                                          // leading order over all directions
      for (let a = 1; a < 180; a += 7) { const k = coeffs(C, a * D2R).findIndex((c) => Math.abs(c) > 1e-9); if (k >= 0) gen = Math.min(gen, k); }
      const Q = C.reduce((s, c) => s + c[0], 0), py = C.reduce((s, c) => s + c[0] * c[1], 0), pz = C.reduce((s, c) => s + c[0] * c[2], 0);
      const f = PF.fig(), u = 40;
      f.axes(0, 0, { x: [-1.7 * u, 1.7 * u], y: [-1.7 * u, 1.7 * u], xl: 'y', yl: 'z' });
      dl(f, 0, 0, 1.65 * u * uy, -1.65 * u * uz, { cls: 'dash dim' });
      for (const [q, y, z] of C) f.charge(y * u, -z * u, { q: q > 0 ? '+' : '-' });
      $('.cfgfig').innerHTML = f.svg();
      const lg = (x) => Math.log10(Math.max(Math.abs(x), 1e-14));
      const X0 = 0, X1 = 2, Y0 = -8, Y1 = 1;                  // log10 of r/a (from a to 100a) and of |V|
      const curves = [{ f: (x) => lg(V(Math.pow(10, x))), n: 400, cls: 'dim' }];
      // the leading term alone is drawn as dots, so it stays visible where it lies on top of the exact curve
      const dots = [];
      if (lead >= 0) for (let i = 0; i <= 20; i++) { const x = X0 + (X1 - X0) * i / 20, y = lg(cs[lead]) - (lead + 1) * x; if (y >= Y0 + 0.2 && y <= Y1 - 0.1) dots.push({ x, y }); }
      $('.p1').innerHTML = PF.plot({ w: 330, h: 250, x: [X0, X1], y: [Y0, Y1], xl: 'r', yl: '|V|', ml: 52,
        xt: [[0, 'a'], [1, '10a'], [2, '100a']], yt: [[0, '1'], [-2, '10^{-2}'], [-4, '10^{-4}'], [-6, '10^{-6}'], [-8, '10^{-8}']], curves, pts: dots });
      let txt = `<p>$Q = ${fm(Q)}\\,q$, $\\ \\vb p = (p_y, p_z) = (${fm(py)}, ${fm(pz)})\\,qa$ about the origin. Units: $V$ in $\\dfrac{q}{4\\pi\\varepsilon_0 a}$, $r$ in $a$.</p>`;
      if (lead < 0) txt += '<p>$V = 0$ at every point of this ray (each point is equidistant from charges that cancel), so there is nothing to plot. Change the angle.</p>';
      else {
        txt += `<p>Along this ray the first nonzero term is $n = ${lead}$, the ${ORD[lead]}: far away $|V| \\propto 1/r^{${lead + 1}}$, a straight line of slope $-${lead + 1}$ on these axes. The dots are that term alone; the gray curve is the exact $|V|$. Where the dots sit on the curve, one term is enough.</p>`;
        if (lead > gen) txt += `<p>The ${ORD[gen]} term is the leading one in most directions, but its angular factor is zero on this ray, so the next term takes over here.</p>`;
      }
      $('.out').innerHTML = txt;
      if (window.Engine) Engine.renderMath(el);
    }
    el.querySelectorAll('select,input').forEach((i) => i.addEventListener('input', draw));
    draw();
  });

  // ================================================================ Lesson 2
  const L2 = {
    id: 'u8-moments', title: 'Monopole and dipole moments',
    steps: [
      RF(md`
        ### The monopole term

        $$V_{\rm mon}(r) = \kq\frac{Q}{r},\qquad Q = \int\rho\,d\tau'.$$

        The **monopole moment** $Q$ is just the total charge.

        ### The dipole term

        The $n = 1$ term is $\kq\dfrac{1}{r^2}\displaystyle\int r'\cos\alpha\,\rho\,d\tau'$. Since $\alpha$ is the angle between $\vb r'$ and $\vb r$, $r'\cos\alpha = \uv r\cdot\vb r'$, and $\uv r$ (fixed during the integration) comes out:

        $$V_{\rm dip}(\vb r) = \kq\frac{\uv r\cdot\vb p}{r^2},\qquad \vb p \equiv \int\vb r'\,\rho(\vb r')\,d\tau'.$$

        $\vb p$ is the **dipole moment** of the distribution. It is a vector, it does not depend on the field point, and its units are $\text{C}\cdot\text{m}$. With $\vb p$ along $z$, $\uv r\cdot\vb p = p\cos\theta$ and $V_{\rm dip} = \dfrac{p\cos\theta}{4\pi\varepsilon_0 r^2}$.

        For point charges the integral is a sum. For a physical dipole it is charge times separation:

        $$\vb p = \sum_i q_i\,\vb r_i', \qquad \vb p_{\text{pair}} = q\vb r_+' - q\vb r_-' = q\,\vb d,$$

        where $\vb d$ points **from $-q$ to $+q$**. Put $\vb p = q\vb d$ into $V_{\rm dip}$ and you get back the physical-dipole result of Lesson 1.

        [[fig:pd]]

        Dipole moments are vectors and add as vectors, because $\sum q_i\vb r_i'$ is linear in the charges.

        !!intuition What $\vb p$ measures
          For a neutral distribution, $\vb p = Q_+\,(\vb r_{+} - \vb r_{-})$, where $Q_+$ is the total positive charge and $\vb r_\pm$ are the centers of the positive and of the negative charge. So $\vb p$ is (how much charge) times (how far the plus-center sits from the minus-center), pointing from minus to plus.
      `, { pd: { svg: fPd(), cap: 'A physical dipole: $\\vb d$ runs from $-q$ to $+q$, and $\\vb p = q\\vb d$.' } }),

      Q(md`Charge $-2q$ sits at the origin and $+2q$ at $z = d$. What is the dipole moment?`,
        [md`$-2qd\,\uv z$`, md`$4qd\,\uv z$`, md`$2qd\,\uv z$`, md`$0$, since the total charge is zero`], 2,
        [md`$\vb p$ points from the negative charge to the positive one. The $+2q$ is above, so $\vb p$ points up.`,
          md`The charge at the origin contributes $(-2q)\cdot\vb 0 = 0$. Only the $+2q$ at $d\,\uv z$ counts.`,
          null,
          md`Zero total charge removes the monopole term, not the dipole term. A neutral pair is exactly the thing that has a dipole moment.`],
        md`$\vb p = \sum q_i\vb r_i' = (-2q)\,\vb 0 + (2q)(d\,\uv z) = 2qd\,\uv z$. Same as $q\vb d$ with charge $2q$ and $\vb d = d\,\uv z$ pointing from $-$ to $+$.`,
        { figHtml: fQ1L2() }),

      Q(md`A charge $-q$ sits at $y = -d/2$ and $+q$ at $y = +d/2$. Which way does $\vb p$ point?`,
        [md`Along $-\uv y$, from $+q$ toward $-q$`, md`Along $+\uv z$`, md`Along $+\uv y$, from $-q$ toward $+q$`, md`Nowhere: $p$ is a scalar`], 2,
        [md`That is the direction of the field *between* the charges. $\vb p = q\vb d$ with $\vb d$ running from $-q$ to $+q$.`,
          md`Both charges are on the $y$ axis, so $\sum q_i\vb r_i'$ has only a $y$ component.`,
          null,
          md`$\vb p = \int\vb r'\rho\,d\tau'$ is a vector; its direction is set by where the charges are.`],
        md`$\vb p = (-q)\left(-\tfrac d2\,\uv y\right) + q\left(\tfrac d2\,\uv y\right) = qd\,\uv y$, from the negative charge to the positive one. Then $V_{\rm dip} = \kq\dfrac{qd\,\uv y\cdot\uv r}{r^2}$ is positive on the $+y$ side, near $+q$.`,
        { figHtml: fHorizDip() }),

      Q(md`Two physical dipoles share a center: $\pm q$ separated by $d$ along $y$, and $\pm q$ separated by $d$ along $z$ (figure). What is the magnitude of the total dipole moment?`,
        [md`$2qd$`, md`$0$`, md`$qd$`, md`$\sqrt2\,qd$`], 3,
        [md`That adds the magnitudes. The two moments are perpendicular, so add them as vectors.`,
          md`They would cancel only if they pointed in opposite directions.`,
          md`That is the size of each one alone.`,
          null],
        md`$\vb p = qd\,\uv y + qd\,\uv z$, so $|\vb p| = \sqrt2\,qd$, pointing $45^\circ$ between $+y$ and $+z$.`,
        { figHtml: fTwoDip() }),

      Q(md`A charge distribution lies entirely in the $xy$-plane (a flat sheet with some $\sigma(x,y)$, not necessarily symmetric). Which component of its dipole moment about the origin must vanish?`,
        [md`$p_x$`, md`$p_z$`, md`All three`, md`None; it depends on $\sigma$`], 1,
        [md`$p_x = \int x'\sigma\,da'$ can be anything if $\sigma$ is lopsided along $x$.`, null,
          md`Only the component along the normal is forced to zero; $p_x$ and $p_y$ depend on $\sigma$.`,
          md`One component is fixed by geometry alone.`],
        md`$\vb p = \int\vb r'\sigma\,da'$, and every source point has $z' = 0$, so $p_z = \int z'\sigma\,da' = 0$. A flat distribution's dipole moment lies in its own plane.`,
        { figHtml: fFlat() }),

      Q(md`Charges $\pm q$ alternate around a square of side $a$ centered on the origin. Which term leads far away?`,
        [md`Monopole`, md`Dipole`, md`Quadrupole, with $V \propto 1/r^3$`, md`None: $V$ is zero far away`], 2,
        [md`$Q = q - q + q - q = 0$.`,
          md`Pair the charges along the sides: opposite sides form opposite dipoles, so $\vb p = \vb 0$. (Or note that $\rho(-\vb r) = \rho(\vb r)$ here.)`,
          null,
          md`The quadrupole moment is not zero, so $V \propto 1/r^3$: small but not zero.`],
        md`$Q = 0$. Pair the charges vertically: the left pair is a dipole pointing one way and the right pair points the opposite way, so $\vb p = \vb 0$ (pairing horizontally gives the same). The first nonzero term is the quadrupole (Griffiths Fig. 3.30).`,
        { figHtml: fSquare() }),

      Q(md`A dipole $\vb p = p\,\uv z$ sits at the origin. At the point $P$ ($\theta = 120^\circ$), $V_{\rm dip}$ is`,
        [md`positive`, md`negative`, md`zero`, md`positive or negative depending on $r$`], 1,
        [md`$\cos 120^\circ = -\tfrac12 < 0$: $P$ is on the side of the negative end.`,
          null,
          md`$V_{\rm dip} = 0$ only on the plane $\theta = 90^\circ$.`,
          md`$r$ changes only the size ($1/r^2 > 0$). The sign comes from $\cos\theta$.`],
        md`$V_{\rm dip} = \dfrac{p\cos\theta}{4\pi\varepsilon_0 r^2}$ with $\cos 120^\circ = -\tfrac12$, so $V_{\rm dip} = -\dfrac{p}{8\pi\varepsilon_0 r^2} < 0$. The half-space $\vb p$ points into is positive; the other half is negative.`,
        { figHtml: fDipTheta() }),

      RF(md`
        ### Physical and pure dipoles

        A physical dipole has a finite separation $d$, so its potential also has higher terms (the octopole in Lesson 1). $V_{\rm dip}$ is only its far-field approximation, which improves as $r$ grows or $d$ shrinks.

        A **pure (point) dipole** is the limit $d \to 0$, $q \to \infty$ with $p = qd$ fixed. The $n$-th moment of the pair is of order $qd^n = p\,d^{n-1}$, which goes to zero for $n \ge 2$. What is left is exactly $V = \kq\dfrac{\vb p\cdot\uv r}{r^2}$, everywhere except at the origin. When a problem just says "dipole", assume $r \gg d$, so the distinction does not matter.

        ### Which term leads: common arrangements

        | arrangement (origin at its center) | $Q$ | $\vb p$ | leading term |
        |---|---|---|---|
        | $q$ at the origin | $q$ | $0$ | monopole, exact |
        | $q$ off the origin | $q$ | nonzero | monopole (plus every higher term) |
        | $\pm q$, separation $d$ | $0$ | $qd$ | dipole |
        | $+q$ and $+q$, symmetric about the origin | $2q$ | $0$ | monopole; first correction is the quadrupole |
        | $+q,\,-2q,\,+q$ on a line | $0$ | $0$ | quadrupole |
        | square of alternating $\pm q$ | $0$ | $0$ | quadrupole |
        | cube of alternating $\pm q$ | $0$ | $0$ | octopole |

        !!method Finding the leading term
          1. Add up the charge. Nonzero: monopole, done.
          2. Compute $\vb p = \sum q_i\vb r_i'$ (or $\int\vb r'\rho\,d\tau'$). Nonzero: dipole.
          3. Otherwise go to the quadrupole: $\sum q_is_i^2$ for collinear charges, the $n = 2$ integral in general.

          Symmetry can settle a step without computing. If $\rho(-\vb r) = \rho(\vb r)$ (inversion through the origin leaves the charges alone), every odd moment vanishes, $\vb p$ included. If $\rho(-\vb r) = -\rho(\vb r)$, every even moment vanishes, $Q$ included.

        The widget plots $|V|$ along a ray from the origin on log–log axes. The gray curve is the exact $|V|$. The dots are the leading term alone, which lies on a straight line of slope $-(n+1)$. Far away the dots sit on the curve; near the charges they come off it. A sharp downward spike in the curve is a point where $V$ changes sign. Try these:

        - $q$ at $z = a$: at $r = a$ the monopole term alone is off by $40\%$ or more; by $r = 10a$ the error is at most about $10\%$.
        - The dipole at $\theta = 90^\circ$: $V = 0$ on the whole equatorial plane.
        - The linear quadrupole at $55^\circ$, close to the zero of $P_2(\cos\theta)$ at $54.7^\circ$. The quadrupole term is tiny on this ray, so close in the $n = 4$ term ($1/r^5$) is bigger and the curve is steeper than the dots. It settles onto them only beyond about $r = 20a$.
      `),

      wMulti(),

      Q(md`Two identical dipoles $\vb p = p\,\uv z$ sit on the $z$ axis, one at $z = s$ and one at $z = -s$ (head to tail). Far away, which term leads?`,
        [md`The quadrupole, since the two dipoles are separated`, md`The dipole, with moment $2p\,\uv z$`, md`Nothing; they cancel`, md`The monopole`], 1,
        [md`Separation adds a quadrupole correction, but the moments add to $2p$, and a nonzero dipole beats any quadrupole far away.`, null,
          md`They point the same way, so they add. Opposite dipoles side by side would cancel, as in an earlier question.`,
          md`Each dipole is neutral, so the total charge is zero.`],
        md`Moments add: $Q = 0$ and $\vb p_{\text{tot}} = 2p\,\uv z$, so $V\approx\kq\dfrac{2p\cos\theta}{r^2}$. Compare two opposite dipoles side by side, where $\vb p_{\text{tot}} = 0$ and the quadrupole leads.`,
        { figHtml: fStack() }),

      Q(md`A pure dipole lies **parallel** to a grounded plane at height $d$, pointing along $+x$. Its image is $-p\,\uv x$ at depth $d$ (Unit 5). Far above the plane, which term leads?`,
        [md`The dipole, with moment $2p$`, md`The dipole, with moment $p$`, md`The quadrupole: the real and image dipoles cancel, leaving $Q = 0$ and $\vb p = 0$`, md`The monopole`], 2,
        [md`The image dipole points the other way, so the moments subtract.`,
          md`The image's $-p$ counts too, and it cancels the real one.`, null,
          md`Dipoles carry no net charge.`],
        md`$Q = 0$ and $\vb p_{\text{tot}} = p\,\uv x - p\,\uv x = 0$, so the leading term is the quadrupole and $V\propto1/r^3$. A dipole pointing **up** is different: its image also points up, the moments add to $2p$, and the far field is a dipole field. The orientation decides the falloff.`,
        { figHtml: fDipPlane() }),

      Q(md`Charges $q$, $q$ and $-2q$ sit at the corners of an equilateral triangle. Which term leads far away?`,
        [md`Monopole`, md`Dipole`, md`Quadrupole: the arrangement is symmetric, so the dipole moment cancels`, md`Octopole`], 1,
        [md`$Q = q + q - 2q = 0$.`,
          null,
          md`Symmetric-looking is not enough. The positive charge is centered at the midpoint of the base and the negative charge at the apex: the centers are apart, so $\vb p \neq 0$.`,
          md`The dipole term is already nonzero, and it dominates.`],
        md`$Q = 0$. With the origin at the centroid $O$, $\vb r_1' + \vb r_2' + \vb r_3' = \vb 0$, so $\vb p = q\vb r_1' + q\vb r_2' - 2q\vb r_3' = -3q\,\vb r_3'$, where $\vb r_3'$ points to the $-2q$ corner. $\vb p$ points from that corner toward the middle of the opposite side: from minus toward plus. Size: $3q\cdot\dfrac{a}{\sqrt3} = \sqrt3\,qa$ for side $a$. The intuition formula agrees: $Q_+ = 2q$ times the height $\tfrac{\sqrt3}{2}a$.`,
        { figHtml: fTri() }),

      Q(md`Charge $+q$ sits at the origin and another $+q$ at $z = d$. What is the leading term, and what is the first correction?`,
        [md`Monopole $\kq\dfrac{2q}{r}$; the first correction is the quadrupole`, md`Monopole $\kq\dfrac{2q}{r}$; the first correction is the dipole, with $p = qd$`, md`Dipole, because the charges are separated`, md`Monopole only; every correction vanishes`], 1,
        [md`That is true when the pair is centered on the origin. Here $\vb p = q\cdot\vb 0 + q\,d\,\uv z = qd\,\uv z \neq 0$.`,
          null,
          md`$Q = 2q \neq 0$, so the monopole leads. The dipole term is a correction to it.`,
          md`Only a single charge at the origin has no corrections.`],
        md`$Q = 2q$, so $V \approx \kq\dfrac{2q}{r}$ far away. About this origin $\vb p = qd\,\uv z$, so the first correction is $\kq\dfrac{qd\cos\theta}{r^2}$. About the midpoint $z = d/2$ the dipole moment would vanish (next section): a dipole term in a charged object's expansion means the origin is off its center of charge.`,
        { figHtml: fZpair() }),

      Q(md`A physical dipole is shrunk toward a pure dipole: $d \to 0$ and $q \to \infty$ with $p = qd$ fixed. What happens to its higher multipole moments ($n \ge 2$)?`,
        [md`They vanish: each is of order $qd^n = p\,d^{n-1} \to 0$`, md`They stay the same, since $p$ is fixed`, md`They blow up, since $q \to \infty$`, md`They merge into the dipole term`], 0,
        [null,
          md`Fixing $p = qd$ fixes only the $n = 1$ moment. The $n = 3$ moment is $\tfrac14qd^3 = \tfrac14pd^2$, which shrinks with $d$.`,
          md`$q$ grows like $1/d$, but the $n$-th moment carries $d^n$, so the product $qd^n = pd^{n-1}$ still goes to zero for $n \ge 2$.`,
          md`Each order has its own $r$-dependence; nothing moves between terms. The higher ones simply vanish.`],
        md`For $\pm q$ at $\pm d/2$ the $n$-th moment is $2q(d/2)^n$ for odd $n$ (zero for even $n$). With $p = qd$ fixed that is $\dfrac{p\,d^{n-1}}{2^{n-1}} \to 0$ for $n \ge 3$. What survives is exactly $V = \kq\dfrac{\vb p\cdot\uv r}{r^2}$: a pure dipole.`,
        { figHtml: fLimit() }),

      Q(md`A neutral atom: a point nucleus $+Ze$ at the center of a spherically symmetric electron cloud of total charge $-Ze$. What is $V$ outside the cloud?`,
        [md`A dipole potential, since there are positive and negative charges`, md`$\kq\dfrac{Ze}{r}$`, md`A quadrupole potential`, md`Exactly zero`], 3,
        [md`The centers of positive and negative charge coincide (both at the center), so $\vb p = 0$.`,
          md`Outside the cloud its $-Ze$ cancels the nucleus.`,
          md`A spherically symmetric distribution picks out no direction, so it has no quadrupole (or any $n \ge 1$) moment.`,
          null],
        md`Gauss's law with a sphere outside the cloud: no enclosed charge and spherical symmetry, so $\vb E = 0$ and $V = 0$ there (with $V(\infty) = 0$). In multipole terms: $Q = 0$, and for a spherically symmetric distribution every moment with $n \ge 1$ vanishes, because $\int P_n(\cos\alpha)\,d\Omega' = 0$ (orthogonality to $P_0$). An atom gets a dipole moment only when something distorts it, such as an applied field (Griffiths Ch. 4).`,
        { figHtml: fAtom() }),

      Q(md`A spherical shell carries a uniform surface charge, total $Q$. About its center, which multipole moments are nonzero?`,
        [md`Only the monopole`, md`The monopole and the quadrupole`, md`All the even ones`, md`All of them, since the charge is spread out`], 0,
        [null,
          md`A uniform shell picks out no axis, so it has no quadrupole. Its exterior potential is exactly $\kq\dfrac Qr$.`,
          md`Every moment with $n \ge 1$ contains $\int P_n(\cos\alpha)\,d\Omega' = 0$.`,
          md`Spreading charge uniformly over a sphere centered on the origin gives exactly the outside potential of a point charge.`],
        md`Outside a uniform shell $V = \kq\dfrac{Q}{r}$ exactly (Gauss). The whole series is its first term, so every higher moment vanishes. This is about the shell's center; about any other origin the higher terms appear (next section).`,
        { figHtml: fShell() }),

      Q(md`A solid cube with uniform charge density, total $Q$, is centred on the origin. Beyond the monopole, which is the first nonzero term of its far potential?`,
        [md`The dipole`, md`The quadrupole`, md`The octopole`, md`None of those three: inversion symmetry kills the dipole and octopole, and the cube's symmetry kills the quadrupole too`], 3,
        [md`The cube is symmetric under $\vb r\to-\vb r$, so $\vb p = \int\vb r'\rho\,d\tau' = 0$.`,
          md`A quadrupole term needs a direction that is singled out, like a rod's axis. A cube looks the same along $x$, $y$ and $z$, and its quadrupole term cancels exactly.`,
          md`Odd terms ($n = 1, 3, \dots$) vanish for any distribution symmetric under $\vb r\to-\vb r$.`, null],
        md`Inversion symmetry kills every odd $n$. For $n = 2$, the moments are integrals like $\int(3z'^2 - r'^2)\rho\,d\tau'$ and $\int x'y'\rho\,d\tau'$. For a cube $\int x'^2\rho = \int y'^2\rho = \int z'^2\rho$, so the first kind is zero, and reflection symmetry kills the second kind. The first correction is $n = 4$: $V = \kq\dfrac Qr\left[1 + O\!\left(\dfrac{a^4}{r^4}\right)\right]$. A cube looks like a point charge to remarkable accuracy.`,
        { figHtml: fCubeRho() }),

      RF(md`
        ### Where is the origin?

        The multipole expansion is a series in $1/r$, with $r$ measured from a chosen origin. Move the origin and the series changes.

        [[fig:off]]

        A single charge at the origin is a pure monopole. Put it a distance $d$ from the origin instead (figure): the exact potential is $\kq\dfrac{q}{\srm}$, not $\kq\dfrac qr$. Its expansion about $O$ has the monopole term $\kq\dfrac qr$, a dipole term with $\vb p = q\vb d$, and every higher term too.

        How do the moments change when the origin moves by $\vb a$? The new position vectors are $\bar{\vb r}' = \vb r' - \vb a$, so

        $$\bar{\vb p} = \int(\vb r' - \vb a)\,\rho\,d\tau' = \vb p - Q\,\vb a.$$

        [[fig:shift]]

        - $Q$ never changes.
        - If $Q = 0$, then $\bar{\vb p} = \vb p$: **the dipole moment of a neutral system does not depend on the origin.** That is why "the dipole moment of a water molecule" makes sense.
        - If $Q \neq 0$, $\vb p$ depends on the origin, and "what is the dipole moment?" has to be answered with "about which origin?" You can even make it vanish: put the origin at the **center of charge** $\vb r_c = \vb p/Q$, and then $\bar{\vb p} = \vb p - Q\vb r_c = 0$.

        The potential itself does not care where you put the origin; only its split into terms changes. (More generally, the lowest nonzero moment never depends on the origin: Griffiths 4th ed. Prob. 3.52.)

        !!intuition Why the origin matters only when $Q \neq 0$
          Moving the origin shifts every position vector by the same $-\vb a$, so $\vb p$ changes by $-\vb a$ times the total charge. With equal amounts of $+$ and $-$, the shifts cancel.

        !!trap The dipole term of a charged object
          For $Q \neq 0$ the dipole term depends on the origin, so state the origin with it. Use the one the problem gives (HW 5 Prob. 3.36 measures everything from the origin). And don't drop the dipole term because the object "is not a dipole": a charge off the origin has one.
      `, { off: { svg: fOff(), cap: 'A single charge $q$ a distance $d$ from the origin; field point $P$ (Griffiths Fig. 3.32).' }, shift: { svg: fShift(), cap: 'Moving the origin from $O$ to $O\'$ by $\\vb a$: $\\bar{\\vb r}\' = \\vb r\' - \\vb a$ (Griffiths Fig. 3.33).' } }),

      Q(md`A neutral charge distribution has dipole moment $\vb p$ about $O$. You move the origin by $\vb a$. The new dipole moment is`,
        [md`$\vb p$, unchanged`, md`$\vb p - q\vb a$ for each charge, so $\vb p - Nq\vb a$ in total`, md`$-\vb p$`, md`$\vb p - |\vb p|\,\vb a$`], 0,
        [null,
          md`Each charge's term changes by $-q_i\vb a$, and these add to $-\vb a\sum q_i = -Q\vb a = 0$: the negative charges' shifts cancel the positive ones.`,
          md`A translation never flips a vector.`,
          md`Not even the right units ($\text{C}\cdot\text{m}^2$).`],
        md`$\bar{\vb p} = \vb p - Q\vb a$ with $Q = 0$. The dipole moment of a neutral object belongs to the object alone.`,
        { figHtml: fShift() }),

      Q(md`Charges $q$, $q$ and $-q$ sit at the corners of an equilateral triangle of side $a$. What is its dipole moment?`,
        [md`$qa$, pointing toward the $-q$`, md`Zero, by symmetry`, md`It depends on the origin, since $Q = q \neq 0$`, md`$2qa$`], 2,
        [md`There is no unique answer. With $Q \neq 0$ the dipole moment changes when the origin moves.`,
          md`It is zero about one special point (the center of charge), not in general.`,
          null,
          md`About which origin? Without one, no single number is right.`],
        md`$Q = q + q - q = q \neq 0$, so $\vb p$ depends on the origin ($\bar{\vb p} = \vb p - Q\vb a$). The right response is "with respect to what origin?" (Griffiths Fig. 3.34b). About the center of charge it vanishes.`,
        { figHtml: fTriB() }),

      Q(md`For the linear quadrupole ($Q = 0$ and $\vb p = 0$), you move the origin up by $c$. Does its quadrupole term change?`,
        [md`Yes: every moment depends on the origin`, md`Yes: it picks up a term $2cp$`, md`No: when $Q = 0$ and $\vb p = 0$, the quadrupole moment is the same about every origin`, md`It vanishes`], 2,
        [md`Only moments **above** the lowest nonzero one can change. The lowest one doesn't depend on the origin.`,
          md`With $\vb p = 0$ that term is zero.`, null,
          md`Moving the origin can't remove the lowest nonzero moment; it only reshuffles the higher ones.`],
        md`For charges on the axis the $n=2$ moment is $\sum q_i z_i^2$. About the new origin: $\sum q_i(z_i - c)^2 = \sum q_iz_i^2 - 2c\sum q_iz_i + c^2\sum q_i$. The last two sums are $p$ and $Q$, both zero, so nothing changes. Same rule as for the dipole moment of a neutral distribution: the leading moment doesn't care where the origin is.`,
        { figHtml: fLinQ() }),

      Q(md`A charge $q$ sits a distance $d$ from the origin (figure). Is $\kq\dfrac{q}{r}$ its exact potential?`,
        [md`Yes: a single charge is always a pure monopole`, md`Yes, as long as $r > d$`, md`No: the exact potential is $\kq\dfrac{q}{\srm}$; about $O$ it has a dipole term and every higher term`, md`No: the monopole term is zero here`], 2,
        [md`Only about its own position. About $O$ it has $\vb p = q\vb d \neq 0$.`,
          md`For $r > d$ the series converges, but its first term is not the whole series.`,
          null,
          md`$Q = q$ wherever the origin is; the monopole term is there.`],
        md`$\dfrac{1}{\srm} = \dfrac1r\displaystyle\sum_n\left(\frac dr\right)^nP_n(\cos\alpha)$, with $\alpha$ the angle between $\vb r$ and $\vb d$. Every term is present. The monopole term is the leading approximation, not the exact answer.`,
        { figHtml: fOff() }),

      Q(md`A charge $q$ sits at $z = d$. At a point on the $xy$-plane ($\theta = 90^\circ$) a distance $r\gg d$ from the origin, the dipole term vanishes. What is the first nonzero correction to $\kq\dfrac{q}{r}$ there?`,
        [md`None: $\kq\dfrac qr$ is exact on that plane`, md`$+\kq\dfrac{qd^2}{r^3}$`, md`$-\kq\dfrac{qd^2}{2r^3}$, the quadrupole term with $P_2(0) = -\tfrac12$`, md`$+\kq\dfrac{qd}{r^2}$`], 2,
        [md`The exact potential is $\kq\dfrac{q}{\sqrt{r^2+d^2}}$, slightly smaller than $\kq\dfrac qr$.`,
          md`Sign and factor: $P_2(\cos 90^\circ) = -\tfrac12$.`, null,
          md`That's the dipole term, $\kq\dfrac{qd\cos\theta}{r^2}$, which vanishes at $\theta = 90^\circ$.`],
        md`The $n=2$ term is $\kq\dfrac{qd^2P_2(\cos\theta)}{r^3}$, and $P_2(0) = -\tfrac12$. Check against the exact answer: $\dfrac{1}{\sqrt{r^2+d^2}} = \dfrac1r\left(1 - \dfrac{d^2}{2r^2}+\cdots\right)$. The point is farther from $q$ than from the origin, so $V$ is a bit below $\kq\,q/r$.`,
        { figHtml: fEq90() }),

      Q(md`Charge $q$ sits at $z = 0$ and $3q$ at $z = a$. Where should the origin go to make the dipole term vanish?`,
        [md`At $z = a/2$, the midpoint`, md`At $z = a$, on the bigger charge`, md`At $z = 3a/4$`, md`Nowhere: a charged system always has a dipole moment`], 2,
        [md`The midpoint works for equal charges. About $z = a/2$: $q\left(-\tfrac a2\right) + 3q\left(\tfrac a2\right) = qa \neq 0$.`,
          md`About $z = a$: $q(-a) + 3q\cdot 0 = -qa \neq 0$.`,
          null,
          md`For $Q \neq 0$ you can always remove $\vb p$ by putting the origin at the center of charge $\vb p/Q$.`],
        md`About the original origin $\vb p = 3qa\,\uv z$ and $Q = 4q$. The center of charge is $\vb r_c = \vb p/Q = \tfrac34a\,\uv z$, and about it $\bar{\vb p} = \vb p - Q\vb r_c = 0$. It is the charge-weighted average position, like a center of mass. (For a neutral system this fails: $\vb p$ is the same for every origin.)`,
        { figHtml: fCC() }),

      Q(md`A distribution has $Q = 2q$ and $\vb p = qb\,\uv z$ about $O$. What is its dipole moment about $O' = (0, 0, b)$?`,
        [md`$-qb\,\uv z$`, md`$qb\,\uv z$, unchanged`, md`$3qb\,\uv z$`, md`$-2qb\,\uv z$`], 0,
        [null,
          md`$\vb p$ stays the same only when $Q = 0$.`,
          md`Sign: $\bar{\vb p} = \vb p - Q\vb a$, not $\vb p + Q\vb a$. Moving the origin up makes every charge sit lower relative to it.`,
          md`That is $-Q\vb a$ alone; add the original $\vb p$.`],
        md`$\bar{\vb p} = \vb p - Q\vb a = qb\,\uv z - 2q\,(b\,\uv z) = -qb\,\uv z$. Moving the origin up by $b$ is the same as moving every charge down by $b$, which lowers $\vb p$ by $Qb$.`,
        { figHtml: fShift() }),

      Q(md`A point charge $q$ and a pure dipole $\vb p = p\,\uv z$ both sit at the origin. Far away, what do the two terms $\kq\left(\dfrac qr + \dfrac{p\cos\theta}{r^2}\right)$ look like?`,
        [md`A point charge $q$ moved to $z = p/q$`, md`A point charge $q + p$ at the origin`, md`A dipole of moment $p + q$`, md`A point charge $q$ moved to $z = -p/q$`], 0,
        [null, md`$q$ and $p$ have different units; they can't be added.`,
          md`Same problem: a charge and a dipole moment can't be added.`,
          md`Sign: moving $q$ toward $+z$ raises $V$ in the $+z$ directions, which is what a $+p\,\uv z$ dipole term does.`],
        md`A charge $q$ at $z = \delta$ has $\kq\dfrac{q}{|\vb r - \delta\uv z|} = \kq\left(\dfrac qr + \dfrac{q\delta\cos\theta}{r^2}+\cdots\right)$. Match: $q\delta = p$, so $\delta = p/q$. A dipole term on top of a monopole just says the charge is off-centre, which is why putting the origin at the "center of charge" kills the dipole term.`,
        { nofig: 'algebra of the expansion' }),

      RF(md`
        ### Worked example: one pair, two origins

        Charges $2q$ and $-q$ sit a distance $a$ apart on the $z$ axis. (A) $-q$ at the origin, $2q$ at $z = a$. (B) $2q$ at the origin, $-q$ at $z = -a$. Find $Q$, $\vb p$ and $V$ to dipole order.

        [[fig:ab]]

        (A) $Q = q$. $\vb p = (-q)\,\vb 0 + 2q\,(a\,\uv z) = 2qa\,\uv z$. So $V \approx \kq\left(\dfrac qr + \dfrac{2qa\cos\theta}{r^2}\right)$.

        (B) $Q = q$. $\vb p = 2q\,\vb 0 + (-q)(-a\,\uv z) = qa\,\uv z$. So $V \approx \kq\left(\dfrac qr + \dfrac{qa\cos\theta}{r^2}\right)$.

        Same charges, different dipole terms. Arrangement (B) is (A) seen from an origin moved up by $a$ (onto the $2q$), and the shift formula agrees: $\bar{\vb p} = 2qa\,\uv z - q\,(a\,\uv z) = qa\,\uv z$.

        Both expansions are right; each is about its own origin. In (A) the center of charge is at $\vb p/Q = 2a\,\uv z$, a distance $a$ beyond the $2q$. With mixed signs the center of charge can lie outside the charges. About that point the dipole term vanishes and the first correction is the quadrupole.
      `, { ab: { svg: fL2W().svg, cap: 'The same pair of charges with two different origins.' } }),

      P({
        id: 'u8-p-four', title: 'Dipole moment of four charges',
        q: md`Four charges, each a distance $a$ from the origin: $+2q$ at $(0,0,a)$, $-q$ at $(0,a,0)$, $+q$ at $(0,0,-a)$ and $-2q$ at $(0,-a,0)$. Find the total charge, the dipole moment, and the approximate potential far away.`,
        figHtml: fL2P1(),
        hints: [
          md`Total charge first. If it is zero, the dipole term leads and $\vb p$ does not depend on the origin.`,
          md`$\vb p = \sum q_i\vb r_i'$, one vector per charge. Keep the signs of both $q_i$ and the coordinates.`,
          md`$V_{\rm dip} = \kq\dfrac{\vb p\cdot\uv r}{r^2}$ with $\uv r\cdot\uv y = \sin\theta\sin\phi$ and $\uv r\cdot\uv z = \cos\theta$ (formula sheet).`,
        ],
        parts: [
          { lbl: md`$Q/q$`, ans: 0, unit: '' },
          { lbl: 'p_y', expr: 'q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: 'p_z', expr: 'q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: md`Far away, $V \approx$`, mc: [md`$\kq\dfrac{qa(\cos\theta + \sin\theta\sin\phi)}{r^2}$`, md`$\kq\dfrac{qa(\cos\theta + \sin\theta\cos\phi)}{r^2}$`, md`$\kq\dfrac{\sqrt2\,qa\cos\theta}{r^2}$`, md`$\kq\dfrac{qa(3\cos\theta - \sin\theta\sin\phi)}{r^2}$`], a: 0,
            why: [null, md`$\sin\theta\cos\phi$ is $\uv r\cdot\uv x$. The charges sit on the $y$ axis, so you need $\uv r\cdot\uv y = \sin\theta\sin\phi$.`, md`That would need $\vb p$ along $z$. Here $\vb p = qa(\uv y + \uv z)$ is tilted $45^\circ$.`, md`$z$-parts: $2qa$ from the $+2q$ and $-qa$ from the $+q$ at $z = -a$, total $qa$. $y$-parts: $-qa + 2qa = +qa$.`] },
        ],
        sol: md`
          $Q = 2q - q + q - 2q = 0$, so the dipole term leads (and $\vb p$ is the same about any origin).

          $$\vb p = 2q\,(a\,\uv z) + (-q)(a\,\uv y) + q\,(-a\,\uv z) + (-2q)(-a\,\uv y) = qa\,\uv y + qa\,\uv z.$$

          $|\vb p| = \sqrt2\,qa$, at $45^\circ$ between $+y$ and $+z$. Then

          $$V \approx \kq\frac{\vb p\cdot\uv r}{r^2} = \kq\frac{qa(\cos\theta + \sin\theta\sin\phi)}{r^2},$$

          using $\uv z\cdot\uv r = \cos\theta$ and $\uv y\cdot\uv r = \sin\theta\sin\phi$.

          !!key What to remember
            Group the charges by axis: the $z$-pair gives $qa\,\uv z$ and the $y$-pair gives $qa\,\uv y$, and moments add as vectors. A tilted $\vb p$ gives a $\phi$-dependent dipole potential; if you rotated $z$ to lie along $\vb p$ it would be $\dfrac{p\cos\theta'}{4\pi\varepsilon_0r^2}$ again.
        `,
      }),

      P({
        id: 'u8-p-shift', title: 'Moving the origin',
        q: md`Charges $q$ at the origin, $2q$ at $(0,0,d)$ and $-q$ at $(0,d,0)$. (a) Find $Q$ and $\vb p$ about the origin. (b) Find $\bar{\vb p}$ about $O' = (0,0,d)$, the position of the $2q$. (c) Where is the center of charge?`,
        figHtml: fL2P2(),
        hints: [
          md`(a) $\vb p = \sum q_i\vb r_i'$ about the origin.`,
          md`(b) Either measure the positions from $O'$ and redo the sum, or use $\bar{\vb p} = \vb p - Q\vb a$ with $\vb a = d\,\uv z$. Doing both is a good check.`,
          md`(c) Center of charge: $\vb r_c = \vb p/Q$.`,
        ],
        parts: [
          { lbl: 'Q', expr: '2*q', vars: { q: [1, 3] } },
          { lbl: 'p_y', expr: '-q*d', vars: { q: [1, 3], d: [0.5, 2] } },
          { lbl: 'p_z', expr: '2*q*d', vars: { q: [1, 3], d: [0.5, 2] } },
          { lbl: md`About $O'$, $\bar{\vb p} =$`, mc: [md`$-qd\,\uv y + 2qd\,\uv z$ (unchanged)`, md`$-qd\,\uv y$`, md`$-qd\,\uv y + 4qd\,\uv z$`, md`$-qd\,\uv y - 2qd\,\uv z$`], a: 1,
            why: [md`$\vb p$ stays put only when $Q = 0$. Here $Q = 2q$.`, null, md`Sign error: $\bar{\vb p} = \vb p - Q\vb a$, so the $z$-part drops by $Qd = 2qd$.`, md`That subtracts $Q\vb a$ twice: $2qd - 2qd = 0$, not $-2qd$.`] },
          { lbl: md`The center of charge is at`, mc: [md`$\left(0, -\tfrac d2, d\right)$`, md`$\left(0, \tfrac d3, \tfrac d3\right)$`, md`$(0, -d, 2d)$`, md`$(0, 0, d)$`], a: 0,
            why: [null, md`That is the plain average of the three positions. Weight each by its (signed) charge and divide by $Q = 2q$.`, md`That is $\vb p/q$; divide by $Q = 2q$ instead.`, md`That is $O'$, and about it $\bar{\vb p} = -qd\,\uv y \neq 0$.`] },
        ],
        sol: md`
          (a) $Q = q + 2q - q = 2q$, and $\vb p = q\,\vb 0 + 2q\,(d\,\uv z) + (-q)(d\,\uv y) = -qd\,\uv y + 2qd\,\uv z$.

          (b) With $\vb a = d\,\uv z$: $\bar{\vb p} = \vb p - Q\vb a = -qd\,\uv y + 2qd\,\uv z - 2qd\,\uv z = -qd\,\uv y$.

          Direct check: measured from $O'$ the charges sit at $q$: $(0,0,-d)$, $2q$: $(0,0,0)$, $-q$: $(0,d,-d)$. Then $\bar{\vb p} = q(-d\,\uv z) + 0 + (-q)(d\,\uv y - d\,\uv z) = -qd\,\uv y$. Same.

          (c) $\vb r_c = \dfrac{\vb p}{Q} = \dfrac{-qd\,\uv y + 2qd\,\uv z}{2q} = -\tfrac d2\,\uv y + d\,\uv z$, the point $\left(0, -\tfrac d2, d\right)$. About it the dipole moment is zero. It lies on the far side of the $z$ axis from the $-q$, because a negative charge pulls the weighted average away from itself.

          !!key What to remember
            For $Q \neq 0$ the dipole moment is tied to the origin. $\bar{\vb p} = \vb p - Q\vb a$ converts between origins, and the center of charge $\vb p/Q$ is the origin that removes the dipole term.
        `,
      }),

      P({
        id: 'u8-p-shellcos', title: 'Dipole moment of a shell with σ = k cos θ',
        q: md`A spherical shell of radius $R$ carries surface charge $\sigma(\theta) = k\cos\theta$ (Griffiths Ex. 3.9). (a) Find its dipole moment. (b) The exact potential outside is $V = \dfrac{kR^3}{3\varepsilon_0}\dfrac{\cos\theta}{r^2}$ (Unit 8). What does that say about the other multipole moments?`,
        figHtml: fShellCos(),
        hints: [
          md`$\vb p = \int\vb r'\,\sigma\,da'$ with $\vb r' = R\,\uv r'$ and $da' = R^2\sin\theta'\,d\theta'\,d\phi'$.`,
          md`$\uv r'$ points a different way at every point of the sphere, so write it in Cartesian form before integrating: $\uv r' = \sin\theta'\cos\phi'\,\uv x + \sin\theta'\sin\phi'\,\uv y + \cos\theta'\,\uv z$. The $x$ and $y$ parts integrate to zero over $\phi'$.`,
          md`$p_z = \displaystyle\int (R\cos\theta')(k\cos\theta')\,R^2\sin\theta'\,d\theta'\,d\phi' = 2\pi kR^3\int_0^\pi\cos^2\theta'\sin\theta'\,d\theta'$.`,
        ],
        parts: [
          { lbl: 'p_z', expr: '4*pi*R^3*k/3', vars: { k: [0.5, 3], R: [0.5, 2] } },
          { lbl: md`Compare $V_{\rm dip}$ with the exact exterior potential:`, mc: [md`They are equal, so every other multipole moment is zero`, md`They differ by a quadrupole term`, md`$V_{\rm dip}$ misses the monopole term $\kq\dfrac{Q}{r}$`, md`They agree only for $r \gg R$`], a: 0,
            why: [null, md`$V_{\rm dip} = \kq\dfrac{p\cos\theta}{r^2} = \dfrac{kR^3\cos\theta}{3\varepsilon_0r^2}$ is identical to the exact result, so there is nothing left for a quadrupole.`, md`$Q = \int k\cos\theta\,da = 0$: there is no monopole term to miss.`, md`They agree for every $r > R$: the dipole term is the whole series.`] },
        ],
        sol: md`
          (a) $Q = \int k\cos\theta'\,R^2\sin\theta'\,d\theta'\,d\phi' = 0$. For $\vb p$ use Cartesian components. The $\cos\phi'$ and $\sin\phi'$ integrals over a full turn kill $p_x$ and $p_y$. For $p_z$:

          $$p_z = \int_0^{2\pi}\!\!\int_0^\pi (R\cos\theta')(k\cos\theta')\,R^2\sin\theta'\,d\theta'\,d\phi' = 2\pi kR^3\cdot\frac23 = \frac{4\pi R^3k}{3}.$$

          (b) $V_{\rm dip} = \kq\dfrac{p\cos\theta}{r^2} = \dfrac{1}{4\pi\varepsilon_0}\cdot\dfrac{4\pi R^3k}{3}\cdot\dfrac{\cos\theta}{r^2} = \dfrac{kR^3\cos\theta}{3\varepsilon_0r^2}$, exactly the exterior potential. So for $r > R$ the dipole term is the entire series, and every other moment vanishes. The reason: $\sigma \propto \cos\theta = P_1(\cos\theta)$ is a single Legendre polynomial, and orthogonality removes every other $n$ (Lesson 4).

          !!trap Integrating a vector
            Never pull $\uv r'$ out of an integral over a sphere: it points a different way at every point. Write it in $\uv x$, $\uv y$, $\uv z$ first (Griffiths 1.4.1).
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - $V_{\rm mon} = \kq\dfrac Qr$ and $V_{\rm dip} = \kq\dfrac{\vb p\cdot\uv r}{r^2}$, with $\vb p = \int\vb r'\rho\,d\tau' = \sum q_i\vb r_i'$.
          - Physical dipole: $\vb p = q\vb d$, with $\vb d$ from $-$ to $+$. Dipole moments add as vectors.
          - Leading term: check $Q$, then $\vb p$, then the quadrupole. Inversion symmetry ($\rho(-\vb r) = \rho(\vb r)$) kills $\vb p$; looking balanced is not enough (the $q, q, -2q$ triangle).
          - $\bar{\vb p} = \vb p - Q\vb a$. The dipole moment is origin-independent exactly when $Q = 0$. For $Q \neq 0$, state the origin; the center of charge $\vb p/Q$ removes the dipole term.
          - Spherically symmetric charge: only the monopole survives.
      `),
    ],
  };

  // ================================================================ Lesson 3 figures
  // pure dipole at the origin, field point at polar angle th, with the unit vectors r-hat and theta-hat
  const fDipField = () => {
    const f = PF.fig(), th = 40 * D2R, R = 130;
    f.line(0, 60, 0, -170, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -172, 'z', 'bl', 'small accent');
    pArrow(f, 0, 0, 90, 30, '\\vb p', 'l');
    const px = R * Math.sin(th), py = -R * Math.cos(th), L = 36;
    dl(f, 0, 0, px, py, { cls: 'dim dash thin' });
    f.dot(px, py, 3); f.tag(px, py, 'P', 'l', 8);
    da(f, px, py, px + L * Math.sin(th), py - L * Math.cos(th), { hs: 6 }); f.tag(px + L * Math.sin(th), py - L * Math.cos(th), '\\uv r', 'tr', 6);
    da(f, px, py, px + L * Math.cos(th), py + L * Math.sin(th), { hs: 6 }); f.tag(px + L * Math.cos(th), py + L * Math.sin(th), '\\boldsymbol{\\hat\\theta}', 'r', 6);
    f.angle(0, 0, 26, 50, 90, '\\theta');
    f.label(50, -50, 'r', 'l', 'small');
    return f.svg();
  };
  // dipole with test points A (axis above), B (equator), C (axis below), D (cos^2 theta = 1/3); sol: draw E there
  const TH54 = Math.acos(1 / Math.sqrt(3));
  const fPts = (sol) => {
    const f = PF.fig(), u = 74, s = 13;
    f.line(0, u + 34, 0, -u - 40, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -u - 42, 'z', 'bl', 'small accent');
    pArrow(f, 0, 0, 90, 30, '\\vb p', 'l');
    const D = [u * Math.sin(TH54), -u * Math.cos(TH54)];
    dl(f, 0, 0, D[0], D[1], { cls: 'dim dash thin' });
    f.arc(0, 0, 40, 90 - TH54 / D2R, 90, { cls: 'dim' }); f.label(16, -50, '\\theta_D', 'c', 'small');
    const pts = [['A', 0, -u, 'r'], ['B', u, 0, 'tr'], ['C', 0, u, 'r'], ['D', D[0], D[1], 't']];
    for (const [n, x, y, at] of pts) { f.dot(x, y, 3); f.tag(x, y, n, at, 8); }
    if (sol) {
      f.line(0, -u, 0, -u - 2 * s, { cls: 'thick', arrow: 'end', hs: 7 });
      f.line(u, 0, u, s, { cls: 'thick', arrow: 'end', hs: 7 });
      f.line(0, u, 0, u - 2 * s, { cls: 'thick', arrow: 'end', hs: 7 });
      f.line(D[0], D[1], D[0] + Math.SQRT2 * s, D[1], { cls: 'thick', arrow: 'end', hs: 7 });
    }
    return f.svg();
  };
  // field lines: pure dipole r = C sin^2(theta), physical dipole traced numerically (both with p up)
  const clipPolys = (pts, h) => { const out = []; let cur = []; for (const p of pts) { if (Math.abs(p[0]) <= h && Math.abs(p[1]) <= h) cur.push(p); else { if (cur.length > 1) out.push(cur); cur = []; } } if (cur.length > 1) out.push(cur); return out; };
  const fPureLines = () => {
    const f = PF.fig(), h = 112;
    f.line(0, h, 0, -h, { cls: 'dim thin dash' });
    for (const Cc of [24, 44, 72, 110, 170, 260]) for (const sgn of [1, -1]) {
      const pts = [];
      for (let k = 1; k < 180; k++) { const t = k * D2R, r = Cc * Math.sin(t) ** 2; pts.push([sgn * r * Math.sin(t), -r * Math.cos(t)]); }
      clipPolys(pts, h).forEach((seg) => f.pl(seg, { cls: 'thin' }));
      const ta = Cc <= h ? 90 : 34, t = ta * D2R, r = Cc * Math.sin(t) ** 2, dr = 2 * Cc * Math.sin(t) * Math.cos(t);
      const x = sgn * r * Math.sin(t), y = -r * Math.cos(t), dx = sgn * (dr * Math.sin(t) + r * Math.cos(t)), dy = -(dr * Math.cos(t) - r * Math.sin(t));
      f.head(x, y, dx, dy, { hs: 6 });
    }
    pArrow(f, 0, 0, 90, 18, '', 'r');
    return f.svg();
  };
  const fPhysLines = () => {
    const f = PF.fig(), h = 112, d2 = 20;
    const qs = [[1, 0, -d2], [-1, 0, d2]];
    const E = (x, y) => { let ex = 0, ey = 0; for (const [q, cx, cy] of qs) { const dx = x - cx, dy = y - cy, r3 = Math.pow(dx * dx + dy * dy, 1.5); ex += q * dx / r3; ey += q * dy / r3; } return [ex, ey]; };
    f.line(0, h, 0, -h, { cls: 'dim thin dash' });
    for (const a0 of [10, 24, 40, 58, 80, 108, 140]) for (const sgn of [1, -1]) {
      let x = sgn * 8 * Math.sin(a0 * D2R), y = -d2 - 8 * Math.cos(a0 * D2R);
      const pts = [[x, y]];
      let hit = false;
      for (let i = 0; i < 2000; i++) {
        let [ex, ey] = E(x, y), m = Math.hypot(ex, ey);
        const mx = x + ex / m * 0.75, my = y + ey / m * 0.75;
        [ex, ey] = E(mx, my); m = Math.hypot(ex, ey);
        x += ex / m * 1.5; y += ey / m * 1.5;
        if (Math.abs(x) > h || Math.abs(y) > h) break;
        if (Math.hypot(x, y - d2) < 8) { hit = true; break; }
        pts.push([x, y]);
      }
      const k = hit ? pts.reduce((b, p, i) => (Math.abs(p[0]) > Math.abs(pts[b][0]) ? i : b), 0) : Math.floor(pts.length * 0.45);
      f.pl(pts, { cls: 'thin' });
      const kk = Math.min(k, pts.length - 2);
      f.head(pts[kk + 1][0], pts[kk + 1][1], pts[kk + 1][0] - pts[kk][0], pts[kk + 1][1] - pts[kk][1], { hs: 6 });
      if (!hit) {                                           // the mirror image is the part that returns to -q from below
        const mp = pts.map((p) => [p[0], -p[1]]);
        f.pl(mp, { cls: 'thin' });
        f.head(mp[kk][0], mp[kk][1], mp[kk][0] - mp[kk + 1][0], mp[kk][1] - mp[kk + 1][1], { hs: 6 });
      }
    }
    f.charge(0, -d2, { q: '+', r: 6 }); f.charge(0, d2, { q: '-', r: 6 });
    return f.svg();
  };
  const fLines = () => PF.row([{ svg: fPureLines(), cap: '(a) pure dipole' }, { svg: fPhysLines(), cap: '(b) physical dipole' }]);
  // physical dipole with a point M between the charges and a point F above them
  const fBetween = () => {
    const f = PF.fig();
    f.line(0, 90, 0, -150, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -152, 'z', 'bl', 'small accent');
    f.charge(0, -40, { q: '+', lab: '+q', at: 'l' }); f.charge(0, 40, { q: '-', lab: '-q', at: 'l' });
    f.dot(0, 0, 3); f.tag(0, 0, 'M', 'r', 8);
    f.dot(0, -120, 3); f.tag(0, -120, 'F', 'r', 8);
    return f.svg();
  };
  // Griffiths 4th ed. 3.33: dipole at the origin, points (a,0,0) and (0,0,a); oblique 3-D
  const fL3W = (sol) => {
    const g = PF.fig({ proj: { ox: 0, oy: 0, s: 1 } }), A = 80;
    g.line(-24, 0, 120, 0, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(124, 2, 'y', 'l', 'small accent');
    g.line(0, 40, 0, -130, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(3, -133, 'z', 'bl', 'small accent');
    const x0 = g.p3(-30, 0, 0), x1 = g.p3(150, 0, 0);
    da(g, x0[0], x0[1], x1[0], x1[1], { cls: 'dim', hs: 6 }); g.tag(x1[0], x1[1], 'x', 'bl', 6, 'small accent');
    pArrow(g, 0, 0, 90, 28, '\\vb p', 'r');
    const X1 = g.p3(A, 0, 0), Z1 = g.p3(0, 0, A);
    g.dot(X1[0], X1[1], 3); g.tag(X1[0], X1[1], '(a,0,0)', 'tl', 8, 'small');
    g.dot(Z1[0], Z1[1], 3); g.tag(Z1[0], Z1[1], '(0,0,a)', 'r', 8, 'small');
    if (sol) {
      g.line(X1[0], X1[1], X1[0], X1[1] + 20, { cls: 'thick', arrow: 'end', hs: 7 }); g.tag(X1[0], X1[1] + 20, '\\vb F', 'r', 8, 'small');
      g.line(Z1[0], Z1[1], Z1[0], Z1[1] - 40, { cls: 'thick', arrow: 'end', hs: 7 }); g.tag(Z1[0], Z1[1] - 40, '\\vb F', 'r', 8, 'small');
    }
    return g.svg();
  };
  const fL3P1 = (sol) => yz([], { u: 46, ext: [1.2, 2.6, 2.3, 1.4],
    pre: (f) => pArrow(f, 0, 0, 90, 28, '\\vb p', 'l'),
    post: (f, X, Y) => {
      const B = [X(1.6), Y(0)], Cc = [X(0), Y(-1.6)];
      f.dot(B[0], B[1], 3); f.tag(B[0], B[1], '(0,b,0)', 'tr', 7, 'small');
      f.dot(Cc[0], Cc[1], 3); f.tag(Cc[0], Cc[1], '(0,0,-b)', 'r', 8, 'small');
      if (sol) {
        f.line(B[0], B[1], B[0], B[1] + 20, { cls: 'thick', arrow: 'end', hs: 7 }); f.tag(B[0], B[1] + 20, '\\vb F', 'r', 8, 'small');
        f.line(Cc[0] - 14, Cc[1], Cc[0] - 14, Cc[1] - 40, { cls: 'thick', arrow: 'end', hs: 7 }); f.tag(Cc[0] - 14, Cc[1] - 40, '\\vb F', 'l', 8, 'small');
      }
    } });
  const fDip45 = () => yz([], { pre: (f) => pArrow(f, 0, 0, 90, 30, '\\vb p', 'l'), P: [2.5, 45], Prat: 'br', ext: [1.2, 2.6, 1.0, 2.6] });
  const fL3P2 = (sol) => yz([], { pre: (f) => pArrow(f, 0, 0, 90, 30, '\\vb p', 'l'), P: [2.6, 60], Prat: 'br', ext: [1.2, 2.8, 1.0, 2.2],
    post: sol ? (f, X, Y) => {
      const t = 60 * D2R, px = X(2.6 * Math.sin(t)), py = Y(2.6 * Math.cos(t)), s = 24;
      const er = 1, et = Math.sqrt(3) / 2;
      const ex = er * Math.sin(t) + et * Math.cos(t), ez = er * Math.cos(t) - et * Math.sin(t);
      da(f, px, py, px + s * ex, py - s * ez, { cls: 'thick', hs: 7 }); f.tag(px + s * ex, py - s * ez, '\\vb E', 'r', 7, 'small');
    } : null });
  // HW 5 Prob. 3.36 (Griffiths Fig. 3.38): q at (0,0,a), -q at (0,±a,0); x toward the viewer
  const f338 = () => {
    const g = PF.fig({ proj: { ox: 0, oy: 0, s: 1 } }), A = 58;
    g.line(-1.75 * A, 0, 1.75 * A, 0, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(1.75 * A + 4, 2, 'y', 'l', 'small accent');
    g.line(0, 1.3 * A, 0, -1.75 * A, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(3, -1.75 * A - 3, 'z', 'bl', 'small accent');
    const x0 = g.p3(-0.6 * A, 0, 0), x1 = g.p3(2.1 * A, 0, 0);
    da(g, x0[0], x0[1], x1[0], x1[1], { cls: 'dim', hs: 6 }); g.tag(x1[0], x1[1], 'x', 'bl', 6, 'small accent');
    g.charge(0, -A, { q: '+', lab: 'q', at: 'r' });
    g.charge(-A, 0, { q: '-', lab: '-q', at: 'b' }); g.charge(A, 0, { q: '-', lab: '-q', at: 'b' });
    g.label(-6, -A / 2, 'a', 'r', 'small'); g.label(-A / 2, -6, 'a', 'b', 'small'); g.label(A / 2, -6, 'a', 'b', 'small');
    return g.svg();
  };
  const f338sol = () => {
    const a = yz([[1, 0, 1, 'q', 'r'], [-1, -1, 0, '-q', 'b'], [-1, 1, 0, '-q', 'b']], { ext: [1.5, 1.5, 0.8, 1.6], pre: (f) => pArrow(f, 0, 0, 90, 26, '\\vb p', 'tl') });
    const f = PF.fig(), R = 96, sc = 17;
    f.circle(0, 0, R, { cls: 'dim dash thin' });
    f.charge(0, -14, { q: '+', r: 5 }); f.charge(-14, 0, { q: '-', r: 5 }); f.charge(14, 0, { q: '-', r: 5 });
    for (let k = 0; k < 12; k++) {
      const t = k * 30 * D2R, sy = Math.sin(t), cz = Math.cos(t);
      const Er = -1 + 0.5 * cz, Et = 0.25 * sy;                // two-term field at r = 4a, units q/(4 pi eps0 r^2)
      const ey = Er * sy + Et * cz, ez = Er * cz - Et * sy;      // components along y (right) and z (up)
      const x = R * sy, y = -R * cz;
      da(f, x, y, x + sc * ey, y - sc * ez, { hs: 6 });
    }
    f.label(R * 0.74 + 8, -R * 0.74 - 8, 'r = 4a', 'bl', 'small');
    return PF.row([{ svg: a, cap: 'the $-q$ pair cancels; $\\vb p = qa\\,\\uv z$' }, { svg: f.svg(), cap: 'two-term $\\vb E$ on a circle $r = 4a$' }]);
  };

  // ================================================================ Lesson 3
  const L3 = {
    id: 'u8-dipole-field', title: 'The field of a dipole',
    steps: [
      RF(md`
        ### From $V$ to $\vb E$

        Put a pure dipole at the origin, pointing along $z$:

        $$V_{\rm dip}(r,\theta) = \frac{p\cos\theta}{4\pi\varepsilon_0 r^2}.$$

        Take $\vb E = -\nabla V$ with the spherical gradient from the formula sheet:

        $$E_r = -\frac{\partial V}{\partial r} = \frac{2p\cos\theta}{4\pi\varepsilon_0 r^3},\qquad E_\theta = -\frac1r\frac{\partial V}{\partial\theta} = \frac{p\sin\theta}{4\pi\varepsilon_0 r^3},\qquad E_\phi = 0.$$

        $$\boxed{\vb E_{\rm dip}(r,\theta) = \frac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)}$$

        [[fig:geo]]

        - The field falls as $1/r^3$, one power faster than $V$: each derivative costs a power of $r$. Quadrupole fields go as $1/r^4$, and so on.
        - Magnitude: $|\vb E| = \dfrac{p}{4\pi\varepsilon_0 r^3}\sqrt{4\cos^2\theta + \sin^2\theta} = \dfrac{p}{4\pi\varepsilon_0 r^3}\sqrt{1 + 3\cos^2\theta}$. On the axis it is twice as strong as on the equator at the same $r$.

        !!trap The sign of $E_\theta$
          $\dfrac{\partial}{\partial\theta}\cos\theta = -\sin\theta$, so $E_\theta = +\dfrac{p\sin\theta}{4\pi\varepsilon_0 r^3} \ge 0$. $\boldsymbol{\hat\theta}$ points toward increasing $\theta$ ("south"). On the equator, $\boldsymbol{\hat\theta} = -\uv z$, so the field there points opposite to $\vb p$.
      `, { geo: { svg: fDipField(), cap: 'Pure dipole $\\vb p = p\\,\\uv z$ at the origin; at the field point $P$, $\\uv r$ points away from the origin and $\\boldsymbol{\\hat\\theta}$ toward increasing $\\theta$.' } }),

      Q(md`For $V_{\rm dip} = \dfrac{p\cos\theta}{4\pi\varepsilon_0 r^2}$, what is $E_\theta$?`,
        [md`$-\dfrac{p\sin\theta}{4\pi\varepsilon_0 r^3}$`, md`$\dfrac{p\sin\theta}{4\pi\varepsilon_0 r^2}$`, md`$\dfrac{2p\sin\theta}{4\pi\varepsilon_0 r^3}$`, md`$\dfrac{p\sin\theta}{4\pi\varepsilon_0 r^3}$`], 3,
        [md`Two minus signs: $E_\theta = -\tfrac1r\,\partial_\theta V$ and $\partial_\theta\cos\theta = -\sin\theta$. They cancel.`,
          md`You dropped the $\tfrac1r$ in the $\theta$-component of the gradient.`,
          md`The factor 2 belongs to $E_r$ (from $\partial_r r^{-2} = -2r^{-3}$), not to $E_\theta$.`,
          null],
        md`$E_\theta = -\dfrac1r\dfrac{\partial}{\partial\theta}\left(\dfrac{p\cos\theta}{4\pi\varepsilon_0 r^2}\right) = -\dfrac1r\cdot\dfrac{-p\sin\theta}{4\pi\varepsilon_0 r^2} = \dfrac{p\sin\theta}{4\pi\varepsilon_0 r^3}$. It is never negative for $0 \le \theta \le \pi$.`,
        { figHtml: fDipField() }),

      Q(md`Which of these fields could be electrostatic? $\vb E_1 = \dfrac{k}{r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)$ and $\vb E_2 = \dfrac{k}{r^3}\left(2\cos\theta\,\uv r - \sin\theta\,\boldsymbol{\hat\theta}\right)$, with $k$ a constant.`,
        [md`Neither: a field that changes direction from point to point has a curl`, md`Both: they differ only in the sign of one component`, md`Only $\vb E_1$`, md`Only $\vb E_2$`], 2,
        [md`Changing direction is allowed; the test is $\nabla\times\vb E = 0$. $\vb E_1$ passes: it is the dipole field, $\vb E_1 = -\nabla\left(\dfrac{k\cos\theta}{r^2}\right)$.`,
          md`The curl is not blind to that sign. In $(\nabla\times\vb E)_\phi = \dfrac1r\left[\dfrac{\partial}{\partial r}(rE_\theta) - \dfrac{\partial E_r}{\partial\theta}\right]$ the two terms cancel for $\vb E_1$ and add for $\vb E_2$.`,
          null,
          md`$\vb E_2$ is the dipole field with the sign of $E_\theta$ flipped, and that sign is what makes the curl vanish. For $\vb E_2$, $(\nabla\times\vb E)_\phi = \dfrac{4k\sin\theta}{r^4} \neq 0$.`],
        md`Neither field has a $\phi$ component or depends on $\phi$, so only $(\nabla\times\vb E)_\phi = \dfrac1r\left[\dfrac{\partial}{\partial r}(rE_\theta) - \dfrac{\partial E_r}{\partial\theta}\right]$ can be nonzero (curl from the formula sheet).

        - $\vb E_1$: $\dfrac{\partial}{\partial r}\left(\dfrac{k\sin\theta}{r^2}\right) = -\dfrac{2k\sin\theta}{r^3}$ and $\dfrac{\partial}{\partial\theta}\left(\dfrac{2k\cos\theta}{r^3}\right) = -\dfrac{2k\sin\theta}{r^3}$. They cancel, so $\nabla\times\vb E_1 = 0$. This is the curl test of the ECE 329 review: $\vb E_1$ is the dipole field with $k = \dfrac{p}{4\pi\varepsilon_0}$.
        - $\vb E_2$: now $\dfrac{\partial}{\partial r}(rE_\theta) = +\dfrac{2k\sin\theta}{r^3}$, so $(\nabla\times\vb E_2)_\phi = \dfrac{4k\sin\theta}{r^4} \neq 0$. No arrangement of static charges produces it.

        A sign slip in $E_\theta$ is not harmless: it turns the dipole field into an impossible one. Checking $\nabla\times\vb E = 0$ catches it.`,
        { figHtml: fDipField() }),

      Q(md`A dipole $\vb p = p\,\uv z$ sits at the origin. What is $\vb E$ at point $A$, on the $+z$ axis a distance $r$ away?`,
        [md`$\dfrac{2p}{4\pi\varepsilon_0 r^3}$, along $-\uv z$`, md`$\dfrac{p}{4\pi\varepsilon_0 r^3}$, along $+\uv z$`, md`$\dfrac{p}{4\pi\varepsilon_0 r^2}$, along $+\uv z$`, md`$\dfrac{2p}{4\pi\varepsilon_0 r^3}$, along $+\uv z$`], 3,
        [md`At $\theta = 0$, $E_r = \dfrac{2p}{4\pi\varepsilon_0 r^3} > 0$: outward, and outward is $+\uv z$ there.`,
          md`On the axis $E_r = \dfrac{2p\cos 0}{4\pi\varepsilon_0 r^3}$: the factor 2 is there.`,
          md`$1/r^2$ is how the potential falls off. The dipole field goes as $1/r^3$.`,
          null],
        md`$\theta = 0$: $E_\theta = 0$ and $E_r = \dfrac{2p}{4\pi\varepsilon_0 r^3}$ along $\uv r = \uv z$. On the axis the field is parallel to $\vb p$.`,
        { figHtml: fPts(false) }),

      Q(md`Same dipole. What is $\vb E$ at point $B$, on the equatorial plane a distance $r$ away?`,
        [md`$\dfrac{p}{4\pi\varepsilon_0 r^3}$, opposite to $\vb p$`, md`$\dfrac{p}{4\pi\varepsilon_0 r^3}$, parallel to $\vb p$`, md`Zero, since $V = 0$ there`, md`$\dfrac{2p}{4\pi\varepsilon_0 r^3}$, radially outward`], 0,
        [null,
          md`At $\theta = 90^\circ$ the field is $E_\theta\,\boldsymbol{\hat\theta}$, and $\boldsymbol{\hat\theta} = -\uv z$ there.`,
          md`$V = 0$ on the whole plane, but $\vb E = -\nabla V$ depends on how $V$ changes *off* the plane: above it $V > 0$, below it $V < 0$, so $\vb E$ points down.`,
          md`$E_r \propto \cos 90^\circ = 0$: there is no radial part on the equator.`],
        md`$\theta = 90^\circ$: $E_r = 0$, $E_\theta = \dfrac{p}{4\pi\varepsilon_0 r^3}$, and $\boldsymbol{\hat\theta} = -\uv z$. So $\vb E = -\dfrac{\vb p}{4\pi\varepsilon_0 r^3}$: half the axial strength, pointing back along $-\vb p$. A standard example of $V = 0$ with $\vb E \neq 0$.`,
        { figHtml: fPts(false) }),

      Q(md`Same dipole. What is $\vb E$ at point $C$, on the axis *below* the dipole ($\theta = 180^\circ$), a distance $r$ away?`,
        [md`$\dfrac{2p}{4\pi\varepsilon_0 r^3}$, along $-\uv z$, away from the dipole`, md`Zero`, md`$\dfrac{2p}{4\pi\varepsilon_0 r^3}$, along $+\uv z$, parallel to $\vb p$`, md`$\dfrac{p}{4\pi\varepsilon_0 r^3}$, along $+\uv z$`], 2,
        [md`$E_r = \dfrac{2p\cos 180^\circ}{4\pi\varepsilon_0 r^3} < 0$ means *inward*, and inward at the bottom of the axis is $+\uv z$. Below the dipole you are nearer its negative end, and field lines end on negative charge.`,
          md`Only the sign of $V$ flips below the dipole. The field is as strong as above it.`,
          null,
          md`On the axis $|E_r| = \dfrac{2p}{4\pi\varepsilon_0 r^3}$, with the factor 2.`],
        md`$\theta = \pi$: $E_\theta = 0$, $E_r = -\dfrac{2p}{4\pi\varepsilon_0 r^3}$, and $\uv r = -\uv z$, so $\vb E = +\dfrac{2p}{4\pi\varepsilon_0 r^3}\,\uv z$. On the whole axis, above and below, $\vb E$ is parallel to $\vb p$: lines leave the top, loop around, and come back in at the bottom heading up.`,
        { figHtml: fPts(false) }),

      Q(md`You double the distance from a dipole, keeping the direction fixed. The field changes by a factor of`,
        [md`$\tfrac14$`, md`$\tfrac18$`, md`$\tfrac12$`, md`$\tfrac1{16}$`], 1,
        [md`$1/r^2$ is the dipole *potential*. The field has one more power of $1/r$.`, null, md`That is how the potential of a point charge scales.`, md`$1/r^4$ is a quadrupole field.`],
        md`$E_{\rm dip} \propto 1/r^3$, so the field drops to $\tfrac18$.`,
        { figHtml: fDipField() }),

      Q(md`A point charge $q$ sits a distance $r$ from a pure dipole. You double $r$, keeping the direction. The force on the charge becomes`,
        [md`$\tfrac14$ as large`, md`$\tfrac18$ as large: it is $q$ times the dipole field, which goes like $1/r^3$`, md`$\tfrac1{16}$ as large`, md`$\tfrac12$ as large`], 1,
        [md`$1/r^2$ is for a charge near another charge. The dipole's charges nearly cancel, so its field falls faster.`, null,
          md`That would be dipole on dipole. One of the two objects here is a single charge.`,
          md`Nothing here falls off like $1/r$.`],
        md`$\vb F = q\vb E_{\text{dip}}$ and $E_{\text{dip}}\propto p/r^3$, so $F\propto 1/r^3$: doubling $r$ gives $1/8$. By Newton's third law the dipole feels the same force back, also $\propto1/r^3$.`,
        { figHtml: fDipQ() }),

      Q(md`Two pure dipoles are a distance $r$ apart, with fixed orientations. You double $r$. The force between them becomes`,
        [md`$\tfrac18$ as large`, md`$\tfrac14$ as large`, md`$\tfrac1{16}$ as large`, md`zero, since each dipole is neutral`], 2,
        [md`That's the charge-dipole force. Here the second object is a dipole too, which costs one more power of $r$.`,
          md`$1/r^2$ is for two single charges.`, null,
          md`Neutral objects still push and pull when their charges are separated; the forces just fall off faster.`],
        md`The force on dipole 2 is the difference of the forces on its two charges: $q_2\left[\vb E_1(\vb r + \vb d) - \vb E_1(\vb r)\right]\approx(\vb p_2\cdot\nabla)\vb E_1$. That is one more derivative of a $1/r^3$ field, so $F\propto1/r^4$: doubling $r$ gives $1/16$. Each extra pole on either side costs one power of $r$: charge-charge $1/r^2$, charge-dipole $1/r^3$, dipole-dipole $1/r^4$.`,
        { figHtml: fDipDip() }),

      RF(md`
        ### Coordinate-free form

        With $\uv z = \cos\theta\,\uv r - \sin\theta\,\boldsymbol{\hat\theta}$ (formula sheet), $\vb p = p\cos\theta\,\uv r - p\sin\theta\,\boldsymbol{\hat\theta}$ and $\vb p\cdot\uv r = p\cos\theta$. Then

        $$2p\cos\theta\,\uv r + p\sin\theta\,\boldsymbol{\hat\theta} = 3p\cos\theta\,\uv r - \left(p\cos\theta\,\uv r - p\sin\theta\,\boldsymbol{\hat\theta}\right) = 3(\vb p\cdot\uv r)\,\uv r - \vb p,$$

        $$\vb E_{\rm dip}(\vb r) = \kq\,\frac{3(\vb p\cdot\uv r)\,\uv r - \vb p}{r^3}.$$

        This form works for any direction of $\vb p$, with $\vb r$ measured from the dipole. Read it as a radial part of strength $3\,\vb p\cdot\uv r$ minus a copy of $\vb p$.

        The $z$-component is $E_z = E_r\cos\theta - E_\theta\sin\theta = \dfrac{p}{4\pi\varepsilon_0 r^3}(3\cos^2\theta - 1)$. Directions worth knowing:

        | where | direction of $\vb E$ | size, in units of $\dfrac{p}{4\pi\varepsilon_0 r^3}$ |
        |---|---|---|
        | on the axis, above or below | parallel to $\vb p$ | $2$ |
        | on the equatorial plane | antiparallel to $\vb p$ | $1$ |
        | $\cos^2\theta = \tfrac13$ ($\theta = 54.7^\circ$ or $125.3^\circ$) | perpendicular to $\vb p$: away from the axis at $54.7^\circ$, toward it at $125.3^\circ$ | $\sqrt2$ |

        [[fig:dirs]]

        ### Field lines

        Along a field line, $\dfrac{dr}{r\,d\theta} = \dfrac{E_r}{E_\theta} = \dfrac{2\cos\theta}{\sin\theta}$, which integrates to $r = C\sin^2\theta$. Each line leaves the dipole along $+z$, swings out to its largest distance $C$ at the equator (crossing it pointing along $-\vb p$), and comes back in from below.

        [[fig:lines]]

        A physical dipole has the same picture far away. Close in it differs: its lines start on $+q$ and end on $-q$, and between the two charges the field points from $+q$ to $-q$, opposite to $\vb p$. Blot out the middle of the two pictures and they look alike; the pure-dipole formula is valid for a physical dipole only where $r \gg d$.
      `, { dirs: { svg: fPts(true), cap: '$\\vb E$ at $A$ (axis, above), $B$ (equator), $C$ (axis, below) and $D$ ($\\cos^2\\theta_D = \\tfrac13$). Arrow lengths are proportional to $|\\vb E|$: $2 : 1 : 2 : \\sqrt2$.' }, lines: { svg: fLines().svg, cap: 'Field lines with $\\vb p$ pointing up (Griffiths Fig. 3.37). Dashed: the dipole axis.' } }),

      Q(md`At the same distance $r$ from a dipole, how does $|\vb E|$ on the axis compare with $|\vb E|$ on the equatorial plane?`,
        [md`They are equal`, md`Half as big`, md`Three times as big`, md`Twice as big`], 3,
        [md`$|\vb E| \propto \sqrt{1 + 3\cos^2\theta}$ depends on direction.`,
          md`Backwards: the axis has the stronger field.`,
          md`$\sqrt{1 + 3\cos^2\theta} = 2$ on the axis, not 3. The 3 in $3(\vb p\cdot\uv r)\uv r$ is partly cancelled by the $-\vb p$.`,
          null],
        md`$|\vb E| = \dfrac{p}{4\pi\varepsilon_0 r^3}\sqrt{1 + 3\cos^2\theta}$: $2$ on the axis and $1$ on the equator. From the coordinate-free form: on the axis $3\vb p - \vb p = 2\vb p$; on the equator $0 - \vb p$.`,
        { figHtml: fPts(false) }),

      Q(md`At point $D$, where $\cos^2\theta_D = \tfrac13$ ($\theta_D \approx 54.7^\circ$), which way does $\vb E$ point?`,
        [md`Along $\vb p$`, md`Radially away from the dipole`, md`Along $-\vb p$`, md`Perpendicular to $\vb p$, away from the axis`], 3,
        [md`$E_z \propto 3\cos^2\theta - 1 = 0$ here: there is no component along $\vb p$.`,
          md`$E_\theta \neq 0$ at $54.7^\circ$, so $\vb E$ is not radial. It is radial only on the axis.`,
          md`$E_z = 0$ at this angle.`,
          null],
        md`$E_z = \dfrac{p}{4\pi\varepsilon_0 r^3}(3\cos^2\theta - 1) = 0$. The component away from the axis is $E_r\sin\theta + E_\theta\cos\theta = \dfrac{3p\sin\theta\cos\theta}{4\pi\varepsilon_0 r^3} > 0$. So $\vb E$ points straight away from the axis, with size $\sqrt2\,\dfrac{p}{4\pi\varepsilon_0 r^3}$. For $\theta < 54.7^\circ$ (and for $\theta > 125.3^\circ$) $E_z > 0$ and the field tilts up; between $54.7^\circ$ and $125.3^\circ$ it tilts down.`,
        { figHtml: fPts(false) }),

      Q(md`$\vb p = p\,\uv z$ at the origin. Use $\vb E = \kq\dfrac{3(\vb p\cdot\uv r)\uv r - \vb p}{r^3}$ at the point $P$ in the $yz$-plane at $\theta = 45^\circ$.`,
        [md`$\dfrac{p}{4\pi\varepsilon_0 r^3}\left(\tfrac32\,\uv y + \tfrac32\,\uv z\right)$`, md`$\dfrac{p}{4\pi\varepsilon_0 r^3}\left(\tfrac32\,\uv y - \tfrac12\,\uv z\right)$`, md`$\dfrac{\sqrt2\,p}{4\pi\varepsilon_0 r^3}\,\uv r$`, md`$\dfrac{p}{4\pi\varepsilon_0 r^3}\left(\tfrac32\,\uv y + \tfrac12\,\uv z\right)$`], 3,
        [md`You forgot the $-\vb p$: $3(\vb p\cdot\uv r)\uv r = \tfrac32p(\uv y + \uv z)$, then subtract $p\,\uv z$.`,
          md`Sign slip in the $z$-part: $\tfrac32 - 1 = +\tfrac12$.`,
          md`The dipole field is radial only on the axis. Here $E_\theta \neq 0$.`,
          null],
        md`$\uv r = \dfrac{\uv y + \uv z}{\sqrt2}$, so $\vb p\cdot\uv r = p/\sqrt2$ and $3(\vb p\cdot\uv r)\,\uv r = \tfrac32p(\uv y + \uv z)$. Subtract $\vb p = p\,\uv z$: $\vb E = \dfrac{p}{4\pi\varepsilon_0 r^3}\left(\tfrac32\,\uv y + \tfrac12\,\uv z\right)$. Check against the spherical form: $|\vb E|^2 = \tfrac94 + \tfrac14 = \tfrac52$ and $1 + 3\cos^2 45^\circ = \tfrac52$.`,
        { figHtml: fDip45() }),

      Q(md`Compare a physical dipole ($\pm q$, separation $d$) with a pure dipole of the same $p = qd$. Their field lines`,
        [md`differ everywhere, because the physical dipole has higher multipoles`, md`look the same far away ($r \gg d$) and differ near the charges`, md`look the same near the charges and differ far away`, md`are identical everywhere`], 1,
        [md`The higher multipoles fall off faster ($1/r^5$ and up for this field), so far away they are negligible.`,
          null,
          md`Backwards: the finite separation matters most near the charges.`,
          md`Between the charges of a physical dipole the field is strong and points from $+q$ to $-q$; a pure dipole has nothing like that except at the single point $r = 0$.`],
        md`Far away the dipole term dominates both, so the pictures match. Close in, the physical dipole's lines start and end on its two charges, and between them $\vb E$ points opposite to $\vb p$.`,
        { figHtml: fLines().svg }),

      Q(md`The pure-dipole field lines in figure (a) look like closed loops. But electrostatic field lines never close on themselves. How do the two fit together?`,
        [md`They don't: near the dipole the field has a nonzero curl`, md`The loops close only far away, where the dipole formula is an approximation anyway`, md`Field lines are allowed to close when the total charge is zero`, md`Every line starts and ends on the dipole itself: on $+q$ and $-q$ for a physical dipole, at the point $r = 0$ for a pure one. No line circulates through charge-free space.`], 3,
        [md`$\nabla\times\vb E = 0$ everywhere except at the dipole itself. Check the curl of exactly this field and it vanishes.`,
          md`Far away the dipole formula is excellent. What matters is what happens at the center, where all the lines meet.`,
          md`$\oint\vb E\cdot d\vb l = 0$ for every loop in a charge-free region, whatever the total charge. A neutral object gets no exemption.`,
          null],
        md`Along a closed field line $\vb E$ is parallel to $d\vb l$ the whole way, so $\oint\vb E\cdot d\vb l > 0$. That is forbidden for a loop through charge-free space, where $\nabla\times\vb E = 0$ (Stokes). The dipole's lines are not such loops. In figure (b) each one leaves $+q$ and ends on $-q$; between the charges $\vb E$ points from $+q$ to $-q$, so no line runs back from $-q$ to $+q$. A pure dipole squeezes both charges into the point $r = 0$, where $\vb E$ blows up, and every line passes through that point.`,
        { figHtml: fLines().svg }),

      Q(md`On the axis *between* the two charges of a physical dipole (point $M$), which way does $\vb E$ point? Compare point $F$ on the axis above both charges.`,
        [md`Along $\vb p$ at both $M$ and $F$`, md`Zero at $M$, by symmetry`, md`Perpendicular to the axis at $M$`, md`Opposite to $\vb p$ at $M$ (from $+q$ toward $-q$), along $\vb p$ at $F$`], 3,
        [md`That holds only on the axis *outside* the charges. Between them, both charges push a positive test charge from $+q$ toward $-q$.`,
          md`At $M$ both contributions point the same way (away from $+q$, toward $-q$), so they add.`,
          md`On the axis there is no sideways component, by symmetry.`,
          null],
        md`At $M$, $+q$ pushes a positive test charge away from itself (toward $-q$) and $-q$ pulls it the same way, so $\vb E$ runs from $+q$ to $-q$, opposite to $\vb p = q\vb d$. At $F$, $+q$ is closer and wins, so $\vb E$ points up, along $\vb p$, as the dipole formula says. The pure-dipole formula does not describe the region between the charges; it needs $r \gg d$.`,
        { figHtml: fBetween() }),

      Q(md`A neutral metal sphere of radius $R$ sits in a uniform field $E_0\uv z$ (Unit 8). Outside, the induced charge adds $\dfrac{E_0R^3\cos\theta}{r^2}$ to $V$. What is that, in multipole language?`,
        [md`A pure dipole, $\vb p = 4\pi\varepsilon_0R^3E_0\,\uv z$, pointing along the applied field`, md`A pure dipole pointing against the applied field`, md`A monopole, since the sphere is charged by induction`, md`A quadrupole, since there are two induced regions`], 0,
        [null, md`Compare with $\kq\dfrac{p\cos\theta}{r^2}$: the coefficient $E_0R^3$ is positive, so $\vb p$ points along $+z$. The field pushes the induced $+$ charge to the $+z$ side.`,
          md`The sphere stays neutral: induction separates charge, it doesn't create any.`,
          md`One positive region and one negative region is exactly a dipole.`],
        md`Match $\dfrac{E_0R^3\cos\theta}{r^2} = \dfrac{1}{4\pi\varepsilon_0}\dfrac{p\cos\theta}{r^2}$: $p = 4\pi\varepsilon_0R^3E_0$. The field pushes $+$ charge toward $+z$ and $-$ charge toward $-z$, so the induced dipole points along $\vb E_0$, and it grows with the sphere's volume.`,
        { figHtml: fSphE() }),

      RF(md`
        ### Worked example: a charge near a dipole (Griffiths 4th ed. Prob. 3.33)

        A pure dipole $\vb p = p\,\uv z$ sits at the origin. Find the force on a point charge $q$ at $(a, 0, 0)$ and at $(0, 0, a)$, and the work needed to move $q$ from the first point to the second.

        [[fig:w]]

        At $(a,0,0)$: $\theta = 90^\circ$ and $\boldsymbol{\hat\theta} = -\uv z$, so $\vb E = \dfrac{p}{4\pi\varepsilon_0 a^3}\boldsymbol{\hat\theta} = -\dfrac{p}{4\pi\varepsilon_0 a^3}\,\uv z$ and

        $$\vb F = q\vb E = -\frac{qp}{4\pi\varepsilon_0 a^3}\,\uv z.$$

        The force is parallel to the dipole's axis, not toward the dipole.

        At $(0,0,a)$: $\theta = 0$, $\vb E = \dfrac{2p}{4\pi\varepsilon_0 a^3}\,\uv z$, so $\vb F = \dfrac{2qp}{4\pi\varepsilon_0 a^3}\,\uv z$: pushed away from the dipole's positive end.

        Work: $\vb E$ is conservative, so $W = q\,[V(\text{end}) - V(\text{start})]$. $V(a,0,0) = 0$ (equator) and $V(0,0,a) = \dfrac{p}{4\pi\varepsilon_0 a^2}$, so

        $$W = \frac{qp}{4\pi\varepsilon_0 a^2}.$$

        Positive for $q, p > 0$: you push the charge toward the dipole's positive end.

        !!method The field of a dipole at a given point
          1. Find $r$ and $\theta$, measured from the dipole and from the direction of $\vb p$.
          2. $E_r = \dfrac{2p\cos\theta}{4\pi\varepsilon_0 r^3}$, $E_\theta = \dfrac{p\sin\theta}{4\pi\varepsilon_0 r^3}$.
          3. Convert $\uv r$ and $\boldsymbol{\hat\theta}$ to Cartesian at that point, or use $3(\vb p\cdot\uv r)\uv r - \vb p$ directly.
          For work and energy use $V$; it is simpler than integrating $\vb E$.
      `, { w: { svg: fL3W(false), cap: 'Pure dipole at the origin; the charge $q$ is first at $(a,0,0)$, then at $(0,0,a)$. The $x$ axis points toward you.' } }),

      P({
        id: 'u8-p-force', title: 'Force and work near a dipole',
        q: md`A pure dipole $\vb p = p\,\uv z$ sits at the origin. A point charge $q$ starts at $(0, b, 0)$ and is moved to $(0, 0, -b)$. Find the $z$-component of the force on $q$ at each point, and the work you do moving it.`,
        figHtml: fL3P1(false),
        hints: [
          md`Find $\theta$ for each point: $(0,b,0)$ is on the equator; $(0,0,-b)$ is on the axis below the dipole, $\theta = \pi$.`,
          md`At $\theta = \pi$: $E_r = \dfrac{2p\cos\pi}{4\pi\varepsilon_0 b^3} < 0$ and $\uv r = -\uv z$. Two minus signs.`,
          md`The work you do is $q\,[V(\text{end}) - V(\text{start})]$ with $V = \dfrac{p\cos\theta}{4\pi\varepsilon_0 r^2}$.`,
        ],
        parts: [
          { lbl: md`$F_z$ at $(0,b,0)$`, expr: '-q*p/(4*pi*eps0*b^3)', vars: { q: [1, 3], p: [1, 3], b: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`$F_z$ at $(0,0,-b)$`, expr: '2*q*p/(4*pi*eps0*b^3)', vars: { q: [1, 3], p: [1, 3], b: [0.5, 2], eps0: [0.5, 2] }, accepts: ['q*p/(2*pi*eps0*b^3)'] },
          { lbl: 'W', expr: '-q*p/(4*pi*eps0*b^2)', vars: { q: [1, 3], p: [1, 3], b: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`The sign of $W$ means`, mc: [md`the field does the work: $+q$ is attracted toward the dipole's negative end`, md`you must push the charge against the field`, md`no net work, since both points are the same distance from the dipole`], a: 0,
            why: [null, md`$W < 0$ means the field does the work for you. Below the dipole is its negative end, which attracts $+q$.`, md`Same distance does not mean same potential: $V$ depends on $\theta$ too.`] },
        ],
        sol: md`
          At $(0,b,0)$: $\theta = 90^\circ$, so $\vb E = \dfrac{p}{4\pi\varepsilon_0 b^3}\boldsymbol{\hat\theta}$ with $\boldsymbol{\hat\theta} = -\uv z$. $F_z = -\dfrac{qp}{4\pi\varepsilon_0 b^3}$.

          At $(0,0,-b)$: $\theta = \pi$, $E_\theta = 0$, $E_r = -\dfrac{2p}{4\pi\varepsilon_0 b^3}$ and $\uv r = -\uv z$, so $\vb E = +\dfrac{2p}{4\pi\varepsilon_0 b^3}\,\uv z$ and $F_z = \dfrac{2qp}{4\pi\varepsilon_0 b^3}$: the charge is pulled up, toward the dipole.

          [[fig:s]]

          Work: $V(0,b,0) = 0$ and $V(0,0,-b) = \dfrac{p\cos\pi}{4\pi\varepsilon_0 b^2} = -\dfrac{p}{4\pi\varepsilon_0 b^2}$, so

          $$W = q\,[V(0,0,-b) - V(0,b,0)] = -\frac{qp}{4\pi\varepsilon_0 b^2}.$$

          Negative: the field does the work, pulling $+q$ toward the dipole's negative end.

          !!key What to remember
            On the axis, above or below, $\vb E$ is parallel to $\vb p$; on the equator it is antiparallel. For work, use $V$.
        `,
        figs: { s: { svg: fL3P1(true), cap: 'Forces on $q$ ($q > 0$): along $-\\uv z$ on the equator, along $+\\uv z$ below the dipole (twice as large).' } },
      }),

      P({
        id: 'u8-p-60', title: 'Dipole field at 60°',
        q: md`A pure dipole $\vb p = p\,\uv z$ sits at the origin. At a point a distance $r$ away at $\theta = 60^\circ$, find $|\vb E|$ and $E_z$ in units of $\dfrac{p}{4\pi\varepsilon_0 r^3}$, and the angle between $\vb E$ and $\uv r$.`,
        figHtml: fL3P2(false),
        hints: [
          md`In these units, $E_r = 2\cos\theta$ and $E_\theta = \sin\theta$.`,
          md`$|\vb E| = \sqrt{E_r^2 + E_\theta^2}$, and $E_z = E_r\cos\theta - E_\theta\sin\theta$ (from $\uv r\cdot\uv z = \cos\theta$, $\boldsymbol{\hat\theta}\cdot\uv z = -\sin\theta$).`,
          md`The angle between $\vb E$ and $\uv r$ is $\arctan(E_\theta/E_r)$.`,
        ],
        parts: [
          { lbl: md`$|\vb E|$`, ans: 1.3229, unit: '' },
          { lbl: md`$E_z$`, ans: -0.25, unit: '' },
          { lbl: md`angle between $\vb E$ and $\uv r$, in degrees`, ans: 40.89, unit: '' },
        ],
        sol: md`
          At $60^\circ$: $E_r = 2\cos 60^\circ = 1$ and $E_\theta = \sin 60^\circ = \tfrac{\sqrt3}{2}$.

          - $|\vb E| = \sqrt{1 + \tfrac34} = \tfrac{\sqrt7}{2} \approx 1.323$. Check: $\sqrt{1 + 3\cos^2 60^\circ} = \sqrt{1.75}$.
          - $E_z = E_r\cos\theta - E_\theta\sin\theta = \tfrac12 - \tfrac34 = -\tfrac14$. Negative: past $54.7^\circ$ the field already tilts down.
          - Angle from $\uv r$: $\arctan\dfrac{E_\theta}{E_r} = \arctan\dfrac{\sqrt3}{2} \approx 40.9^\circ$, tilted toward $\boldsymbol{\hat\theta}$.

          [[fig:s]]

          !!key What to remember
            Work in $(E_r, E_\theta)$ first, then project. $|\vb E| = \dfrac{p}{4\pi\varepsilon_0 r^3}\sqrt{1 + 3\cos^2\theta}$ is a quick check.
        `,
        figs: { s: { svg: fL3P2(true), cap: 'At $\\theta = 60^\\circ$ the field points away from the axis and slightly down.' } },
      }),

      RF(md`
        ### Charged objects: monopole plus dipole

        If $Q \neq 0$, the far field is the monopole field with the dipole field as its first correction. With $\vb p$ along $z$,

        $$\vb E \approx \kq\frac{Q}{r^2}\,\uv r + \frac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right).$$

        "The two lowest orders in the multipole expansion" means exactly these two terms: $1/r^2$ and $1/r^3$ in the field ($1/r$ and $1/r^2$ in $V$).

        !!method Two lowest orders of the far field
          1. $Q = \sum q_i$ and $\vb p = \sum q_i\vb r_i'$ about the stated origin.
          2. If you can, point $z$ along $\vb p$. Then $V \approx \kq\left(\dfrac Qr + \dfrac{p\cos\theta}{r^2}\right)$.
          3. $\vb E = -\nabla V$ in spherical coordinates: the monopole part is along $\uv r$, the dipole part is the standard one.
          4. Check units, the direction far out (sign of $Q$), and the $\phi$-dependence (none when $\vb p \parallel \uv z$).
      `),

      Q(md`An object of size $a$ has $Q \neq 0$ and $\vb p = p\,\uv z$ about the origin. Which expression gives "the two lowest orders" of its far field?`,
        [md`$\kq\dfrac{Q}{r^2}\,\uv r + \dfrac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)$`, md`$\kq\dfrac{Q}{r^2}\,\uv r$ only`, md`$\kq\left(\dfrac Qr + \dfrac{p\cos\theta}{r^2}\right)$`, md`$\dfrac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)$ only`], 0,
        [null,
          md`That is one order. The next one, the dipole field, falls as $1/r^3$.`,
          md`That is the potential, not the field.`,
          md`With $Q \neq 0$ the monopole field is the *leading* term; it can't be dropped.`],
        md`Monopole field ($1/r^2$) plus dipole field ($1/r^3$). The quadrupole field ($1/r^4$) is the next order, which the problem lets you drop.`,
        { figHtml: fBlob() }),

      Q(md`For a charged object ($Q \neq 0$), does the two-term far-field answer depend on where you put the origin?`,
        [md`No: the field is physical, so its expansion can't depend on the origin`, md`Only the monopole term changes`, md`Both terms change their form`, md`Yes: the dipole term changes, since $\bar{\vb p} = \vb p - Q\vb a$`], 3,
        [md`The *exact* field doesn't depend on the origin, but its split into terms does: $r$ and $\theta$ are measured from the origin.`,
          md`$Q$ is the same about every origin.`,
          md`The monopole term keeps the form $\kq\dfrac{Q}{r^2}\,\uv r$, with $r$ measured from the new origin.`,
          null],
        md`$Q$ is origin-independent, but $\vb p$ shifts by $-Q\vb a$. So truncated expansions about different origins differ at the dipole order; they agree once all orders are kept. Use the origin the problem gives.`,
        { figHtml: fShift() }),

      P({
        id: 'HW5-3.36', src: 'HW 5 · Griffiths 3.36', title: 'Three charges: monopole plus dipole field', big: true,
        q: md`Three point charges are located as shown in Fig. 3.38, each a distance $a$ from the origin. Find the approximate electric field at points far from the origin. Express your answer in spherical coordinates, and include the two lowest orders in the multipole expansion.`,
        figHtml: f338(),
        hints: [
          md`"Far from the origin" and "two lowest orders": find the monopole and dipole moments, write the two-term $V$, and take $-\nabla V$.`,
          md`$Q = \sum q_i$. For $\vb p = \sum q_i\vb r_i'$ read the positions off the figure: $q$ at $(0,0,a)$, $-q$ at $(0,a,0)$ and $(0,-a,0)$.`,
          md`The two $-q$'s sit symmetrically about the origin, so their dipole contributions cancel. With $\vb p$ along $z$, $V \approx \kq\left(\dfrac Qr + \dfrac{p\cos\theta}{r^2}\right)$.`,
          md`$E_r = -\partial_r V$ and $E_\theta = -\tfrac1r\,\partial_\theta V$. The dipole part is the standard $\dfrac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)$.`,
        ],
        parts: [
          { lbl: 'Q', expr: '-q', vars: { q: [1, 3] } },
          { lbl: 'p_z', expr: 'q*a', vars: { q: [1, 3], a: [0.5, 2] } },
          { lbl: 'E_r', expr: 'q*(2*a*cos(theta)-r)/(4*pi*eps0*r^3)', vars: { q: [1, 3], a: [0.5, 2], r: [5, 20], theta: [0.2, 2.9], eps0: [0.5, 2] }, accepts: ['-q/(4*pi*eps0*r^2) + 2*q*a*cos(theta)/(4*pi*eps0*r^3)', '(q/(4*pi*eps0*r^2))*(-1+2*a*cos(theta)/r)'] },
          { lbl: 'E_\\theta', expr: 'q*a*sin(theta)/(4*pi*eps0*r^3)', vars: { q: [1, 3], a: [0.5, 2], r: [5, 20], theta: [0.2, 2.9], eps0: [0.5, 2] } },
          { lbl: md`Far out on the $+z$ axis ($r \gg a$), $\vb E$ points`, mc: [md`toward the origin`, md`away from the origin`, md`along $\boldsymbol{\hat\theta}$`, md`nowhere: it is zero`], a: 0,
            why: [null, md`$E_r = \dfrac{q}{4\pi\varepsilon_0 r^2}\left(-1 + \dfrac{2a}{r}\right) < 0$ once $r > 2a$: the net $-q$ wins far away.`, md`$E_\theta \propto \sin\theta = 0$ on the axis.`, md`The two-term formula gives zero on the axis only at $r = 2a$, too close for the approximation to be trusted.`] },
        ],
        sol: md`
          **Setup.** From the figure: $q$ at $(0,0,a)$, $-q$ at $(0,a,0)$, $-q$ at $(0,-a,0)$. "Two lowest orders" means monopole plus dipole.

          **Monopole.** $Q = q - q - q = -q$. It is nonzero, so it leads.

          **Dipole**, about the given origin (the origin matters here because $Q \neq 0$):

          $$\vb p = \sum q_i\vb r_i' = q\,(a\,\uv z) + (-q)(a\,\uv y) + (-q)(-a\,\uv y) = qa\,\uv z.$$

          The two $-q$'s are mirror images through the origin, so their contributions cancel. Only the $q$ on the $z$ axis contributes.

          **Potential**, with $z$ already along $\vb p$:

          $$V(r,\theta) \approx \kq\left[-\frac qr + \frac{qa\cos\theta}{r^2}\right].$$

          **Field**, $\vb E = -\nabla V$:

          - monopole: $-\dfrac{\partial}{\partial r}\left(-\dfrac qr\right) = -\dfrac{q}{r^2}$, so $\vb E_{\rm mon} = -\kq\dfrac{q}{r^2}\,\uv r$ (inward, as for a net negative charge);
          - dipole: $\vb E_{\rm dip} = \kq\dfrac{qa}{r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)$.

          $$\vb E(r,\theta) \approx \frac{q}{4\pi\varepsilon_0}\left[-\frac{1}{r^2}\,\uv r + \frac{a}{r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)\right].$$

          In components: $E_r = \dfrac{q}{4\pi\varepsilon_0 r^2}\left(-1 + \dfrac{2a\cos\theta}{r}\right)$, $E_\theta = \dfrac{qa\sin\theta}{4\pi\varepsilon_0 r^3}$, $E_\phi = 0$.

          [[fig:s]]

          **Checks.**
          - Units: $\dfrac{q}{4\pi\varepsilon_0 r^2}$ is a field and $a/r$ is a pure number.
          - Far out, $E_r < 0$ in every direction: the net charge $-q$ wins.
          - Above ($\theta = 0$) the dipole term weakens the inward field, $-1 + \dfrac{2a}{r}$; below ($\theta = \pi$) it strengthens it, $-1 - \dfrac{2a}{r}$. That fits: the positive charge is on top.
          - No $\phi$-dependence, although the charges are not symmetric about $z$. The asymmetry first shows up at the next order (quadrupole, $1/r^4$ in $\vb E$).

          !!trap Origin dependence
            Because $Q \neq 0$, $\vb p$ depends on the origin. About the charge $q$ at $(0,0,a)$, for instance, $\bar{\vb p} = \vb p - Q\,(a\,\uv z) = 2qa\,\uv z$. The problem fixes the origin ("each a distance $a$ from the origin"), so use it.

          !!key What to remember
            Monopole and dipole moments first, then one gradient. The dipole field formula is worth knowing by heart: $\dfrac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)$.
        `,
        figs: { s: { svg: f338sol().svg, cap: 'Left: the $-q$ pair contributes no dipole moment, so $\\vb p = qa\\,\\uv z$. Right: the two-term field on a circle of radius $4a$ points inward everywhere (net $-q$), weaker above and stronger below.' } },
      }),

      RF(md`
        !!key Patterns to remember
          - $\vb E_{\rm dip} = \dfrac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right) = \kq\dfrac{3(\vb p\cdot\uv r)\,\uv r - \vb p}{r^3}$. It falls as $1/r^3$.
          - On the axis (above and below) $\vb E \parallel \vb p$ with strength 2; on the equator $\vb E$ is antiparallel with strength 1; $E_z = 0$ at $54.7^\circ$ and $125.3^\circ$.
          - $E_\theta \ge 0$: off the axis the field always has a "southward" component. Flip that sign and the field gets a curl (the curl test), so it could not be electrostatic.
          - Field lines start on $+q$ and end on $-q$; a dipole's lines only look like loops because they all pass through the dipole.
          - Charged object: monopole field plus dipole field are "the two lowest orders"; the dipole part depends on the origin.
          - Pure and physical dipoles agree far away and differ near the charges.
      `),
    ],
  };

  // ================================================================ Lesson 4 figures
  // a charge distribution, a source element at (r', theta'), the field point P on the +z axis
  const fAxisTheta = () => {
    const f = PF.fig(), R = 85, rp = 45, tp = 50 * D2R;
    shadeP(f, f.arcPts(0, 0, R, R, 0, 360)); f.circle(0, 0, R);
    f.line(0, R + 26, 0, -215, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -217, 'z', 'bl', 'small accent');
    const S = [rp * Math.sin(tp), -rp * Math.cos(tp)];
    da(f, 0, 0, S[0] - 2, S[1] + 2.5, { hs: 6 }); f.rect(S[0] - 4, S[1] - 4, 8, 8); f.tag(S[0], S[1], "d\\tau'", 'r', 8, 'small');
    f.angle(0, 0, 26, 90 - 50, 90, "\\theta'");
    f.label(24, -12, "\\vb r'", 'tl', 'small');
    f.dot(0, -190, 3); f.tag(0, -190, 'P', 'r', 8);
    f.dim(-112, 0, -112, -190, 'z', { at: 'l' });
    return f.svg();
  };
  // density sketches in a sphere cross-section: sign of g(theta) shown with + and - marks
  const fRho = (g, lab) => {
    const f = PF.fig(), R = 62;
    f.circle(0, 0, R);
    f.line(0, -R, 0, -R - 34, { cls: 'dim', arrow: 'end', hs: 6 }); f.line(0, R, 0, R + 18, { cls: 'dim' }); f.label(4, -R - 36, 'z', 'bl', 'small accent');
    for (const rr of [0.32, 0.6, 0.86]) for (const th of [12, 38, 64, 90, 116, 142, 168]) for (const sgn of [1, -1]) {
      const v = g(th * D2R);
      if (Math.abs(v) < 0.35) continue;
      const x = sgn * rr * R * Math.sin(th * D2R), y = -rr * R * Math.cos(th * D2R);
      if (Math.abs(x) < 6) continue;
      (v > 0 ? plus : minus)(f, x, y);
    }
    f.label(R + 12, -R + 6, lab, 'l', 'small');
    return f.svg();
  };
  const fRhoCos = () => fRho((t) => Math.cos(t), '\\rho = f(r)\\cos\\theta');
  const fRhoSin = () => fRho((t) => Math.sin(t), '\\rho = f(r)\\sin\\theta');
  // a ring (or a disk) seen at an angle, centred on the origin in the xy-plane, field point P on the axis
  const fRingLike = (o = {}) => {
    const f = PF.fig(), rx = 66, ry = o.ry || 30, zP = 150;
    if (o.disk) { shadeP(f, f.arcPts(0, 0, rx, ry, 0, 360)); f.ellipse(0, 0, rx, ry); } else f.ellipse(0, 0, rx, ry, { cls: 'thick' });
    f.line(0, ry + 40, 0, -zP - 36, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -zP - 38, 'z', 'bl', 'small accent');
    if (!o.center) { f.line(0, 0, rx, 0, { cls: 'dim thin' }); f.label(rx / 2, -12.5, o.rlab || 'b', 'c', 'small'); }
    if (o.center) f.charge(0, 0, { q: '+', lab: '+q', at: 'tl' });
    f.tag(-rx * 0.7, ry * 0.71, o.lab || 'Q', 'bl', 7, 'small');
    f.dot(0, -zP, 3); f.tag(0, -zP, 'P', 'r', 8);
    f.dim(-rx - 26, 0, -rx - 26, -zP, 'z', { at: 'l' });
    return f.svg();
  };
  const fRing = () => fRingLike({ lab: 'Q' });
  const fRingQ = () => fRingLike({ lab: '-q \\text{ (ring)}', center: true, ry: 34 });
  const fDisk = () => fRingLike({ disk: true, lab: '\\sigma', rlab: 'R' });
  // a rod on the z axis from -a to a, field point P off the axis
  const rodFig = (lab) => {
    const f = PF.fig(), A = 55;
    f.line(0, 80, 0, -140, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -142, 'z', 'bl', 'small accent');
    f.line(0, A, 0, -A, { cls: 'thick' }); f.line(-5, -A, 5, -A); f.line(-5, A, 5, A);
    f.label(-9, -A, 'a', 'r', 'small'); f.label(-9, A, '-a', 'r', 'small');
    dl(f, 0, 0, 110, -90, { cls: 'dim dash thin' }); f.dot(110, -90, 3); f.tag(110, -90, 'P', 'tr', 7);
    f.angle(0, 0, 22, 90 - 50.7, 90, '\\theta');
    f.label(10, 30, lab, 'l', 'small');
    return f.svg();
  };
  const lamPlot = (fn, yr, yt) => PF.plot({ w: 230, h: 160, x: [-1, 1], y: yr, zero: true, xl: 'z', yl: '\\lambda(z)', ml: 36,
    xt: [[-1, '-a'], [1, 'a']], yt, curves: [{ f: fn }] });
  const rodLam = (fn, yr, yt) => PF.row([{ svg: rodFig('\\lambda(z)') }, { svg: lamPlot(fn, yr, yt) }]).svg;
  const fSeg = () => rodFig('\\text{uniform, total } Q');
  // rod from 0 to L, P on the axis and a general point
  const fRod0L = () => {
    const f = PF.fig(), Lp = 70, zP = 165;
    f.line(0, 30, 0, -zP - 34, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -zP - 36, 'z', 'bl', 'small accent');
    f.line(0, 0, 0, -Lp, { cls: 'thick' }); f.line(-5, -Lp, 5, -Lp); f.label(9, -Lp / 2, '\\lambda', 'l', 'small');
    f.dim(-26, 0, -26, -Lp, 'L', { at: 'l' });
    f.dot(0, -zP, 3); f.tag(0, -zP, 'P', 'r', 8);
    f.dim(-64, 0, -64, -zP, 'z', { at: 'l' });
    const t = 52 * D2R, R = 175, px = R * Math.sin(t), py = -R * Math.cos(t);
    dl(f, 0, 0, px, py, { cls: 'dim dash thin' }); f.dot(px, py, 3); f.tag(px, py, '(r,\\theta)', 'r', 7, 'small');
    f.angle(0, 0, 90, 90 - 52, 90, '\\theta');
    return f.svg();
  };
  // HW 5 Prob. 3.27: the sphere and a far point on the z axis
  const f327 = (sol) => {
    const f = PF.fig(), R = 64;
    shadeP(f, f.arcPts(0, 0, R, R, 0, 360)); f.circle(0, 0, R);
    f.line(0, R, 0, R + 26, { cls: 'dim' }); f.line(0, -R, 0, -232, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(4, -234, 'z', 'bl', 'small accent');
    f.dot(0, -205, 3); f.tag(0, -205, 'P', 'r', 8);
    f.dim(96, 0, 96, -205, 'z', { at: 'r' });
    f.dot(0, 0, 2.2);
    if (!sol) {
      dl(f, 0, 0, R * 0.7071, R * 0.7071, { cls: 'dim thin' }); f.label(28, 18, 'R', 'bl', 'small');
      f.label(0, -30, '\\rho(r,\\theta)', 'c', 'small');
    } else {
      f.circle(0, 0, R / 2, { cls: 'dim dash thin' });
      for (const th of [62, 90, 118]) for (const sgn of [1, -1]) plus(f, sgn * 17 * Math.sin(th * D2R), -17 * Math.cos(th * D2R));
      for (const th of [42, 66, 90, 114, 138]) for (const sgn of [1, -1]) minus(f, sgn * 48 * Math.sin(th * D2R), -48 * Math.cos(th * D2R));
    }
    return f.svg();
  };

  // ================================================================ Lesson 4
  const L4 = {
    id: 'u8-axis', title: 'On the axis: continuous charge, line charges, HW 3.27',
    steps: [
      RF(md`
        ### On the $z$ axis, $\alpha = \theta'$

        For a field point on the $+z$ axis, $\vb r = z\,\uv z$, so the angle between $\vb r$ and $\vb r'$ is the source's own polar angle: $\alpha = \theta'$. The expansion becomes

        $$V(z) = \kq\sum_{n=0}^{\infty}\frac{1}{z^{n+1}}\int (r')^nP_n(\cos\theta')\,\rho(\vb r')\,d\tau'\qquad(z\text{ beyond the source}).$$

        Each moment is now an ordinary integral in the source's spherical coordinates, with $d\tau' = r'^2\sin\theta'\,dr'\,d\theta'\,d\phi'$. (On the $-z$ axis $\alpha = \pi - \theta'$, which multiplies the $n$-th term by $(-1)^n$.)

        [[fig:ax]]

        !!method Moments of a continuous distribution, on the axis
          1. $n = 0$: $Q = \int\rho\,d\tau'$. Nonzero: that's the answer.
          2. $n = 1$: $\int r'\cos\theta'\,\rho\,d\tau'$ (this is $p_z$).
          3. $n = 2$: $\int (r')^2\,\tfrac12(3\cos^2\theta' - 1)\,\rho\,d\tau'$.
          Stop at the first nonzero one. If $\rho = f(r')\,g(\theta')$, each moment factors into $2\pi\times$(radial integral)$\times$(angular integral), and either factor can be the one that vanishes.

        Symmetry shortcuts for a $\rho(r',\theta')$ with no $\phi'$-dependence (for such a source, reflection $z \to -z$, i.e. $\theta' \to \pi - \theta'$, does the same as inversion):

        - $\rho$ even under $\theta' \to \pi - \theta'$ (for example $\propto \sin\theta'$ or $\cos^2\theta'$): every odd-$n$ moment vanishes, because $P_n$ is odd for odd $n$.
        - $\rho$ odd (for example $\propto \cos\theta'$): every even-$n$ moment vanishes, $Q$ included.
      `, { ax: { svg: fAxisTheta(), cap: 'Field point $P$ on the $+z$ axis: the angle between $\\vb r$ and $\\vb r\'$ is just $\\theta\'$, so $\\alpha = \\theta\'$.' } }),

      Q(md`For a field point on the $+z$ axis, what does $P_n(\cos\alpha)$ inside the moment integral become?`,
        [md`$1$, because $P_n(1) = 1$`, md`Nothing simpler: $P_n(\cos\alpha)$ can't be simplified`, md`$(-1)^nP_n(\cos\theta')$`, md`$P_n(\cos\theta')$, with $\theta'$ the polar angle of the source element`], 3,
        [md`$P_n(1) = 1$ is the value at the *field point's* angle $\theta = 0$. Inside the integral the angle is $\alpha$, between $\vb r$ and $\vb r'$, and it varies over the source.`,
          md`On the axis it does simplify: $\vb r \parallel \uv z$, so $\alpha = \theta'$.`,
          md`That is the $-z$ axis, where $\alpha = \pi - \theta'$.`,
          null],
        md`$\cos\alpha = \uv r\cdot\uv r' = \uv z\cdot\uv r' = \cos\theta'$. So on the $+z$ axis each moment is $\int (r')^nP_n(\cos\theta')\,\rho\,d\tau'$, a plain integral over the source.`,
        { figHtml: fAxisTheta() }),

      Q(md`A sphere carries $\rho = f(r)\cos\theta$ for some radial function $f$. Which multipole moments vanish?`,
        [md`Only the even ones (including $Q$); the odd ones are generally nonzero`, md`Every moment except the dipole ($n = 1$)`, md`None of them, in general`, md`All of them`], 1,
        [md`Parity kills the even ones, but orthogonality does more. The angular factor is $\int_{-1}^1P_n(x)\,x\,dx$ (with $x = \cos\theta'$), and $x = P_1(x)$ is orthogonal to every $P_n$ with $n \neq 1$.`,
          null,
          md`$Q \propto \int_0^\pi\cos\theta'\sin\theta'\,d\theta' = 0$, for one.`,
          md`$n = 1$ survives: $\int_{-1}^1x\cdot x\,dx = \tfrac23 \neq 0$ (as long as the radial integral is nonzero).`],
        md`Each moment factors: $2\pi\displaystyle\int_0^R f(r')\,r'^{\,n+2}\,dr'\times\int_0^\pi P_n(\cos\theta')\cos\theta'\sin\theta'\,d\theta'$. With $x = \cos\theta'$ the angular factor is $\int_{-1}^1P_n(x)P_1(x)\,dx$, zero unless $n = 1$. So the outside potential is pure dipole, $\propto \dfrac{\cos\theta}{r^2}$, like the shell with $\sigma = k\cos\theta$ in Lesson 2. In general, if the angular dependence is a single $P_\ell(\cos\theta')$, only the $n = \ell$ moment survives.`,
        { figHtml: fRhoCos() }),

      Q(md`A sphere carries $\rho = f(r)\sin\theta$. Which moments must vanish by symmetry alone?`,
        [md`All odd $n$`, md`All even $n$`, md`All except $n = 0$`, md`None`], 0,
        [null,
          md`$\sin\theta'$ is *even* under $\theta' \to \pi - \theta'$ (same value in both hemispheres), so the even $P_n$ survive in general.`,
          md`$\sin\theta'$ is not a single Legendre polynomial in $\cos\theta'$; it has components along $P_0$, $P_2$, $P_4$, ..., so the even moments are generally nonzero.`,
          md`$\int P_n(\cos\theta')\sin^2\theta'\,d\theta'$ vanishes for odd $n$: an odd function of $\cos\theta'$ integrated over both hemispheres.`],
        md`Under $\theta' \to \pi - \theta'$, $\sin\theta'$ is unchanged and $P_n(\cos\theta')$ picks up $(-1)^n$. So the angular integral of every odd-$n$ moment cancels between the hemispheres. The even ones survive in general, though a *radial* integral can still vanish: that happens to $Q$ in HW 3.27 below.`,
        { figHtml: fRhoSin() }),

      RF(md`
        ### Exact on-axis potential $\to$ multipole moments $\to$ off-axis potential

        Often $V$ on the axis comes from one elementary integral. Expand it in powers of $1/z$ for $z$ beyond the source:

        $$V(z) = \frac{c_0}{z} + \frac{c_1}{z^2} + \frac{c_2}{z^3} + \cdots$$

        Compare with the on-axis multipole formula: $c_n = \kq\displaystyle\int (r')^nP_n(\cos\theta')\,\rho\,d\tau'$. The expansion coefficients **are** the multipole moments.

        If the source is symmetric about the $z$ axis (no $\phi$-dependence), you get the potential everywhere outside for free. The region of interest is outside a sphere, centered on the origin, that encloses all the charge. The conditions there, Unit 8 style:

        1. No charge in the region and no $\phi$-dependence, so $\lap V = 0$ gives $V = \displaystyle\sum_n\left(A_nr^n + \frac{B_n}{r^{n+1}}\right)P_n(\cos\theta)$.
        2. $V \to 0$ as $r \to \infty$. This kills every $A_n$.
        3. On the $+z$ axis $V$ must equal the known $V(z)$. There $\theta = 0$ and $P_n(1) = 1$, so $V(z) = \displaystyle\sum_n\frac{B_n}{z^{n+1}}$. Matching powers of $1/z$ fixes $B_n = c_n$.

        !!method Off-axis from on-axis (azimuthal symmetry)
          1. Find $V$ on the $+z$ axis exactly.
          2. Expand in powers of $1/z$ (for $z$ beyond the source): $V = \sum_n \dfrac{c_n}{z^{n+1}}$.
          3. Replace $\dfrac{c_n}{z^{n+1}}$ by $\dfrac{c_n\,P_n(\cos\theta)}{r^{n+1}}$.
          This is HW 5 Prob. 3.24 (the disk), worked in Unit 8.

        ### Worked example: a uniform ring (Griffiths 4th ed. Prob. 3.28)

        A ring of radius $b$ in the $xy$-plane, centered on the origin, carries total charge $Q$ spread uniformly.

        [[fig:ring]]

        Every bit of the ring is a distance $\sqrt{z^2+b^2}$ from the axis point, so $V(z) = \kq\dfrac{Q}{\sqrt{z^2 + b^2}}$. Expand with $(1 + x)^{-1/2} = 1 - \tfrac12x + \tfrac38x^2 - \cdots$ and $x = b^2/z^2$:

        $$V(z) = \kq\frac Qz\left(1 + \frac{b^2}{z^2}\right)^{-1/2} = \kq\left[\frac Qz - \frac{Qb^2}{2z^3} + \frac{3Qb^4}{8z^5} - \cdots\right].$$

        Off the axis:

        $$V(r,\theta) \approx \kq\left[\frac Qr - \frac{Qb^2}{2}\,\frac{P_2(\cos\theta)}{r^3} + \frac{3Qb^4}{8}\,\frac{P_4(\cos\theta)}{r^5}\right].$$

        - No dipole (or other odd) term: the ring is symmetric under $z \to -z$.
        - Direct check of the quadrupole: all of the charge sits at $r' = b$, $\theta' = 90^\circ$, so $\int (r')^2P_2(\cos\theta')\,dq = b^2P_2(0)\,Q = -\tfrac12Qb^2$.
        - Sign: on the axis the ring's charge is farther away ($\sqrt{z^2+b^2} > z$) than if it sat at the center, so $V$ is a bit *below* $\kq\dfrac Qz$. In the plane of the ring $P_2(0) = -\tfrac12$ and the correction is positive.
      `, { ring: { svg: fRing(), cap: 'Uniform ring of radius $b$ and charge $Q$ in the $xy$-plane; $P$ on the axis at height $z$.' } }),

      Q(md`Why does the uniform ring have no dipole term?`,
        [md`Because $Q \neq 0$`, md`Because the ring is a conductor`, md`Because the dipole term always vanishes on the axis`, md`Because the ring is symmetric under $z \to -z$, so its odd moments vanish`], 3,
        [md`$Q \neq 0$ makes the monopole lead; it says nothing about $\vb p$. A charge off the origin has both.`,
          md`Nothing here is a conductor; the reason is symmetry.`,
          md`A charge at $z = s$ has the on-axis dipole term $\kq\dfrac{qs}{z^2}$, which is not zero.`,
          null],
        md`$\vb p = \int\vb r'\,dq$, and every bit of charge at $\vb r'$ has a partner at $-\vb r'$ (diametrically opposite on the ring), so $\vb p = 0$. On the axis: $(z^2+b^2)^{-1/2}$ expands in odd powers of $1/z$ only, i.e. even $n$ only.`,
        { figHtml: fRing() }),

      Q(md`Why does the "off-axis from on-axis" trick need the source to be symmetric about the $z$ axis?`,
        [md`Because $P_n(1) = 1$ fails otherwise`, md`Without it $V$ depends on $\phi$ too, and values on one line cannot fix a function of two angles`, md`Because the series diverges off the axis`, md`It doesn't; it works for any source`], 1,
        [md`$P_n(1) = 1$ is a property of the polynomials; it never fails.`,
          null,
          md`The series converges at every point beyond the source, in any direction.`,
          md`For a source without azimuthal symmetry the exterior solution has $\phi$-dependent terms, and those can vanish on the $z$ axis, so the axis can't detect them.`],
        md`The form $V = \sum_n \dfrac{B_nP_n(\cos\theta)}{r^{n+1}}$ is the general exterior solution only when nothing depends on $\phi$. A $\phi$-dependent source needs extra terms (spherical harmonics with $m \neq 0$), which are zero on the $z$ axis, so the axis values alone cannot determine them.`,
        { figHtml: fRing() }),

      Q(md`A rod from $z = -a$ to $z = a$ carries a uniform total charge $Q$. Which powers of $1/r$ appear in its far potential?`,
        [md`All powers`, md`$1/r^2$, $1/r^4$, ...`, md`$1/r$, $1/r^3$, $1/r^5$, ...`, md`Only $1/r$`], 2,
        [md`The rod is symmetric about the origin, so the odd-$n$ terms ($1/r^2$, $1/r^4$, ...) drop out.`,
          md`Those are the odd-$n$ terms, which vanish for a source symmetric under $z \to -z$.`,
          null,
          md`Only a point charge at the origin (or a uniform sphere) gives just $1/r$. The rod has a quadrupole term.`],
        md`Moments: $\displaystyle\int_{-a}^{a}\frac{Q}{2a}\,z'^{\,n}\,dz' = \frac{Qa^n}{n+1}$ for even $n$ and $0$ for odd $n$. So $V = \kq\left[\dfrac Qr + \dfrac{Qa^2}{3}\dfrac{P_2(\cos\theta)}{r^3} + \dfrac{Qa^4}{5}\dfrac{P_4(\cos\theta)}{r^5} + \cdots\right]$ (Griffiths 4th ed. Prob. 3.44). On the axis the quadrupole correction is positive: the near half of the rod gains more than the far half loses.`,
        { figHtml: fSeg() }),

      Q(md`A rod from $z=-a$ to $z=a$ carries a uniform total charge $Q$. At the same large distance $r$, is $V$ larger on the $z$ axis (end-on) or on the $xy$-plane (broadside)?`,
        [md`On the axis: the quadrupole term $\propto P_2(\cos\theta)$ is positive there and negative broadside`, md`Broadside, where more of the rod is close by`, md`Equal: the rod looks like a point charge from far away`, md`On the axis, because the dipole term is largest there`], 0,
        [null, md`Broadside the charge is spread to both sides and is on average **farther** than $r$; end-on the near half is closer than $r$, and $1/\srm$ rewards closeness.`,
          md`At leading order, yes. The question is the first correction, which depends on direction.`,
          md`A uniform rod centred on the origin has no dipole moment.`],
        md`Exact: end-on, $V = \kq\dfrac{Q}{2a}\ln\dfrac{r+a}{r-a} = \kq\dfrac Qr\left(1 + \dfrac{a^2}{3r^2}+\cdots\right)$; broadside, $V = \kq\dfrac{Q}{a}\sinh^{-1}\dfrac ar = \kq\dfrac Qr\left(1 - \dfrac{a^2}{6r^2}+\cdots\right)$. Both corrections are the quadrupole term $\kq\dfrac{Qa^2}{3r^3}P_2(\cos\theta)$, with $P_2 = 1$ end-on and $-\tfrac12$ broadside.`,
        { figHtml: fSeg() }),

      Q(md`A uniformly charged disk (HW 5 Prob. 3.24, worked in Unit 8) lies in the $xy$-plane. Which multipole terms appear in its far potential?`,
        [md`All $n$`, md`Only even $n$: $\dfrac1r$, $\dfrac{P_2}{r^3}$, $\dfrac{P_4}{r^5}$, ...`, md`Only odd $n$`, md`Only the monopole: far away a disk is a point charge`], 1,
        [md`The disk is symmetric under $z \to -z$, so the odd terms vanish.`,
          null,
          md`Odd terms need an up-down asymmetry; the disk has none. And $Q \neq 0$, so $n = 0$ is there.`,
          md`To leading order yes, but the quadrupole ($\propto R^2$ relative) and higher terms are there: the on-axis expansion of $\sqrt{z^2+R^2} - z$ never stops.`],
        md`On the axis, for $z > R$: $V = \dfrac{\sigma}{2\varepsilon_0}\left(\sqrt{z^2+R^2} - z\right) = \dfrac{\sigma}{2\varepsilon_0}\left[\dfrac{R^2}{2z} - \dfrac{R^4}{8z^3} + \dfrac{R^6}{16z^5} - \cdots\right]$: only odd powers of $1/z$, i.e. even $n$. The first term is $\kq\dfrac{\sigma\pi R^2}{z} = \kq\dfrac Qz$, as it must be. Then $\dfrac{1}{z^{n+1}} \to \dfrac{P_n(\cos\theta)}{r^{n+1}}$ gives the far potential everywhere: part (a) of Prob. 3.24.`,
        { figHtml: fDisk() }),

      RF(md`
        ### Line charges along the axis

        For a line charge $\lambda(z')$ on the $z$ axis, the sum $\sum q_is_i^{\,n}$ of Lesson 1 becomes an integral: the $n$-th moment is $\displaystyle\int\lambda(z')\,z'^{\,n}\,dz'$, and

        $$V(r,\theta) = \kq\sum_n\left(\int\lambda(z')\,z'^{\,n}\,dz'\right)\frac{P_n(\cos\theta)}{r^{n+1}}.$$

        Parity does part of the work: an even $\lambda$ kills the odd $n$, an odd $\lambda$ kills the even $n$. Orthogonality does the rest. On $-a < z' < a$, if $\lambda(z') \propto P_\ell(z'/a)$, then every moment with $n < \ell$ vanishes ($z'^{\,n}$ is a combination of $P_0, \dots, P_n$, each orthogonal to $P_\ell$), so the leading term is the $n = \ell$ one.
      `),

      Q(md`A rod from $z = -a$ to $z = a$ carries $\lambda(z) = k\,z/a$. Which term leads far away?`,
        [md`Monopole`, md`Dipole`, md`Quadrupole`, md`Octopole`], 1,
        [md`$\displaystyle\int_{-a}^a \frac{kz'}{a}\,dz' = 0$: as much negative charge below as positive above.`,
          null,
          md`The dipole moment $\int_{-a}^a \dfrac{kz'^2}{a}\,dz' = \tfrac23ka^2$ is already nonzero.`,
          md`Lower orders are nonzero.`],
        md`Odd $\lambda$: $Q = 0$. $p = \displaystyle\int_{-a}^a\frac{kz'}{a}\,z'\,dz' = \frac{2ka^2}{3} \neq 0$. Leading term $\kq\dfrac{2ka^2}{3}\dfrac{\cos\theta}{r^2}$.`,
        { figHtml: rodLam((x) => x, [-1.25, 1.25], [[1, 'k'], [-1, '-k']]) }),

      Q(md`The same rod with $\lambda(z) = k\left(\dfrac{3z^2}{a^2} - 1\right)$. Which term leads?`,
        [md`Monopole`, md`Dipole`, md`Quadrupole`, md`Octopole`], 2,
        [md`$\displaystyle\int_{-a}^a\left(\frac{3z'^2}{a^2} - 1\right)dz' = 2a - 2a = 0$.`,
          md`$\lambda$ is even, so the dipole moment is zero.`,
          null,
          md`The quadrupole moment $\tfrac{8}{15}ka^3$ is already nonzero.`],
        md`$\lambda = 2k\,P_2(z'/a)$, so by orthogonality $Q = p = 0$ and the quadrupole leads: $\displaystyle\int_{-a}^a k\left(\frac{3z'^2}{a^2} - 1\right)z'^2\,dz' = k\left(\frac{6a^3}{5} - \frac{2a^3}{3}\right) = \frac{8ka^3}{15}$. So $V \approx \kq\dfrac{8ka^3}{15}\dfrac{P_2(\cos\theta)}{r^3}$.`,
        { figHtml: rodLam((x) => 3 * x * x - 1, [-1.3, 2.3], [[2, '2k'], [-1, '-k']]) }),

      Q(md`The same rod with $\lambda(z) = k\left(1 + \dfrac za\right)$. Which term leads?`,
        [md`Monopole`, md`Dipole`, md`Quadrupole`, md`None: every moment vanishes`], 0,
        [null,
          md`The dipole moment is nonzero ($\tfrac23ka^2$), but $Q = 2ka \neq 0$ leads.`,
          md`$Q \neq 0$.`,
          md`$\lambda \ge 0$ everywhere on the rod, so $Q > 0$.`],
        md`$Q = \displaystyle\int_{-a}^a k\left(1 + \frac{z'}{a}\right)dz' = 2ka$, so the monopole leads. The $z'/a$ part adds a dipole correction $p = \tfrac23ka^2$: the charge is bunched toward the top.`,
        { figHtml: rodLam((x) => 1 + x, [-0.3, 2.3], [[1, 'k'], [2, '2k']]) }),

      Q(md`The same rod with $\lambda(z) = k\left(\dfrac{5z^3}{a^3} - \dfrac{3z}{a}\right)$. Which term leads?`,
        [md`Dipole, since $\lambda$ is odd`, md`Monopole`, md`Quadrupole`, md`Octopole, $V \propto 1/r^4$`], 3,
        [md`Odd $\lambda$ kills $Q$ and the quadrupole, but here the dipole moment vanishes too: $\lambda = 2k\,P_3(z'/a)$ is orthogonal to $z' \propto P_1$.`,
          md`$Q = 0$ for an odd $\lambda$.`,
          md`Even moments vanish for an odd $\lambda$.`,
          null],
        md`$\lambda = 2k\,P_3(z'/a)$. Orthogonality: $\int_{-a}^aP_3(z'/a)\,z'^{\,n}\,dz' = 0$ for $n = 0, 1, 2$. Direct check for $n = 1$: $k\displaystyle\int_{-a}^a\left(\frac{5z'^4}{a^3} - \frac{3z'^2}{a}\right)dz' = k\,(2a^2 - 2a^2) = 0$. The first nonzero moment is $n = 3$: $\dfrac{8ka^4}{35}$, so $V \approx \kq\dfrac{8ka^4}{35}\dfrac{P_3(\cos\theta)}{r^4}$.`,
        { figHtml: rodLam((x) => 5 * x * x * x - 3 * x, [-2.3, 2.3], [[2, '2k'], [-2, '-2k']]) }),

      P({
        id: 'u8-p-rod', title: 'Rod from 0 to L: moments from the axis',
        q: md`A uniform line charge $\lambda$ runs along the $z$ axis from $z = 0$ to $z = L$. (a) Find $V$ exactly on the axis for $z > L$. (b) Expand it in powers of $1/z$ and read off the first three multipole moments. (c) Write the far potential off the axis, to quadrupole order.`,
        figHtml: fRod0L(),
        hints: [
          md`On the axis, $V(z) = \kq\displaystyle\int_0^L\frac{\lambda\,dz'}{z - z'}$.`,
          md`$\ln\dfrac{z}{z - L} = -\ln\left(1 - \dfrac Lz\right) = \dfrac Lz + \dfrac{L^2}{2z^2} + \dfrac{L^3}{3z^3} + \cdots$`,
          md`Or compute the moments directly: $\displaystyle\int_0^L\lambda\,z'^{\,n}\,dz' = \frac{\lambda L^{n+1}}{n+1}$. Then attach $\dfrac{P_n(\cos\theta)}{r^{n+1}}$.`,
        ],
        parts: [
          { lbl: md`$\int_0^L\lambda\,dz'$ (monopole moment)`, expr: 'lambda*L', vars: { lambda: [0.5, 3], L: [0.5, 2] } },
          { lbl: md`$\int_0^L\lambda z'\,dz'$ (dipole moment)`, expr: 'lambda*L^2/2', vars: { lambda: [0.5, 3], L: [0.5, 2] } },
          { lbl: md`$\int_0^L\lambda z'^2\,dz'$ (quadrupole moment)`, expr: 'lambda*L^3/3', vars: { lambda: [0.5, 3], L: [0.5, 2] } },
          { lbl: md`Which origin would make the dipole term vanish?`, mc: [md`$z = 0$, the bottom end`, md`$z = L/2$, the midpoint`, md`$z = L$, the top end`, md`None, since $Q \neq 0$`], a: 1,
            why: [md`About $z = 0$ the dipole moment is $\tfrac12\lambda L^2 \neq 0$: that's the case you just computed.`, null, md`About the top end the dipole moment is $-\tfrac12\lambda L^2$.`, md`For $Q \neq 0$ you can always remove $\vb p$ by putting the origin at the center of charge, $p/Q = L/2$.`] },
        ],
        sol: md`
          (a) $V(z) = \kq\displaystyle\int_0^L\frac{\lambda\,dz'}{z - z'} = \kq\,\lambda\ln\frac{z}{z - L}$.

          (b) With $-\ln(1 - x) = x + \tfrac12x^2 + \tfrac13x^3 + \cdots$ and $x = L/z$:

          $$V(z) = \kq\left[\frac{\lambda L}{z} + \frac{\lambda L^2}{2z^2} + \frac{\lambda L^3}{3z^3} + \cdots\right].$$

          Moments: $\lambda L$, $\tfrac12\lambda L^2$, $\tfrac13\lambda L^3$. Direct check: $\int_0^L\lambda z'^{\,n}\,dz' = \dfrac{\lambda L^{n+1}}{n+1}$.

          (c) The rod lies on the axis, so the source is azimuthally symmetric:

          $$V(r,\theta) \approx \kq\left[\frac{\lambda L}{r} + \frac{\lambda L^2}{2}\,\frac{\cos\theta}{r^2} + \frac{\lambda L^3}{3}\,\frac{P_2(\cos\theta)}{r^3}\right].$$

          The dipole term is there because the origin sits at the end of the rod. The center of charge is at $p/Q = L/2$; about the midpoint the dipole term vanishes and the moments are those of a centered rod of half-length $L/2$.

          !!key What to remember
            An exact on-axis integral plus a Taylor series in $1/z$ hands you every multipole moment at once. For an azimuthally symmetric source, then replace $\dfrac{1}{z^{n+1}}$ by $\dfrac{P_n(\cos\theta)}{r^{n+1}}$.
        `,
      }),

      Q(md`A point charge $+q$ sits at the center of a ring of radius $b$ that carries total charge $-q$. Far away on the $z$ axis, $V$ is`,
        [md`negative, $\approx -\kq\dfrac{qb^2}{2z^3}$`, md`positive, $\approx \kq\dfrac{qb^2}{2z^3}$`, md`zero, since $Q = 0$`, md`$\approx \kq\dfrac{qb}{z^2}$, a dipole term`], 1,
        [md`The ring's charge is farther from an axis point ($\sqrt{z^2+b^2}$) than the center is ($z$), so the $+q$ wins on the axis.`,
          null,
          md`$Q = 0$ removes the monopole only. The quadrupole is not zero.`,
          md`The arrangement is symmetric under $z \to -z$, so it has no dipole term.`],
        md`Exactly on the axis: $V = \kq\left(\dfrac qz - \dfrac{q}{\sqrt{z^2+b^2}}\right) \approx \kq\dfrac{qb^2}{2z^3} > 0$. Off the axis: $\kq\dfrac{qb^2}{2}\dfrac{P_2(\cos\theta)}{r^3}$, from the ring's $-q\,b^2P_2(0) = +\tfrac12qb^2$. Keep this picture for the next problem: negative charge spread around the equator with positive charge closer to the center gives a positive quadrupole term on the axis.`,
        { figHtml: fRingQ() }),

      P({
        id: 'HW5-3.27', src: 'HW 5 · Griffiths 3.27', title: 'Sphere with ρ ∝ (R − 2r) sin θ', big: true,
        q: md`A sphere of radius $R$, centered at the origin, carries charge density $\rho(r,\theta) = k\,\dfrac{R}{r^2}\,(R - 2r)\sin\theta$, where $k$ is a constant, and $r$, $\theta$ are the usual spherical coordinates. Find the approximate potential for points on the $z$-axis, far from the sphere.`,
        figHtml: f327(false),
        hints: [
          md`Far away on the $z$ axis: use the multipole expansion with $\alpha = \theta'$, and compute moments in order ($n = 0, 1, 2, \dots$) until one is nonzero.`,
          md`Write $\rho\,d\tau' = kR\,(R - 2r')\sin^2\theta'\,dr'\,d\theta'\,d\phi'$: the $1/r'^2$ cancels against $d\tau'$, and every moment factors into $2\pi\times$(radial)$\times$(angular).`,
          md`$n = 0$: $\int_0^R(R - 2r')\,dr' = 0$. $n = 1$: $\int_0^\pi\sin^2\theta'\cos\theta'\,d\theta' = 0$. So go to $n = 2$.`,
          md`$n = 2$: radial $\int_0^R r'^2(R - 2r')\,dr' = -\tfrac16R^4$; angular $\int_0^\pi\tfrac12(3\cos^2\theta' - 1)\sin^2\theta'\,d\theta' = -\tfrac{\pi}{16}$, using $\int_0^\pi\cos^2\theta\sin^2\theta\,d\theta = \tfrac\pi8$ and $\int_0^\pi\sin^2\theta\,d\theta = \tfrac\pi2$.`,
        ],
        parts: [
          { lbl: md`The total charge $Q$ is`, mc: [md`infinite, because $\rho \propto 1/r^2$ at the center`, md`$k\pi^2R^3$`, md`$0$`, md`$-\tfrac16k\pi^2R^5$`], a: 2,
            why: [md`$d\tau' = r'^2\sin\theta'\,dr'\,d\theta'\,d\phi'$ supplies an $r'^2$ that cancels the $1/r'^2$. The integrand is finite.`, md`That comes from dropping the $-2r'$. In fact $\int_0^R(R - 2r')\,dr' = R^2 - R^2 = 0$.`, null, md`That uses the $n = 2$ radial integral $\int r'^2(R - 2r')\,dr' = -\tfrac16R^4$ in the wrong place, and it does not even have units of charge.`] },
          { lbl: md`The dipole ($n = 1$) term vanishes because`, mc: [md`$Q = 0$, and a neutral distribution has no dipole moment`, md`$\int_0^\pi\sin^2\theta'\cos\theta'\,d\theta' = 0$: $\rho$ is the same in both hemispheres`, md`the radial integral $\int_0^R r'(R - 2r')\,dr'$ vanishes`, md`it doesn't: it is proportional to $\int_0^R r'(R - 2r')\,dr' = -\tfrac16R^3$`], a: 1,
            why: [md`Neutral distributions can have dipole moments (a physical dipole is neutral). The reason here is symmetry.`, null, md`That radial integral is $\tfrac12R^3 - \tfrac23R^3 = -\tfrac16R^3 \neq 0$. It is the angular factor that vanishes.`, md`The radial factor is nonzero, but it multiplies an angular factor that is zero.`] },
          { lbl: md`$\displaystyle\int (r')^2P_2(\cos\theta')\,\rho\,d\tau'$`, expr: 'k*pi^2*R^5/48', vars: { k: [0.5, 3], R: [0.5, 2] } },
          { lbl: md`$V$ on the $z$-axis, far away`, expr: 'k*pi*R^5/(192*eps0*z^3)', vars: { k: [0.5, 3], R: [0.5, 2], eps0: [0.5, 2], z: [5, 20] }, accepts: ['(1/(4*pi*eps0))*k*pi^2*R^5/(48*z^3)'] },
        ],
        sol: md`
          **Plan.** Far away on the $z$ axis, use the multipole expansion with $\alpha = \theta'$ and compute moments in order until one is nonzero.

          **Set up the integrals.** $d\tau' = r'^2\sin\theta'\,dr'\,d\theta'\,d\phi'$, so

          $$\rho\,d\tau' = kR\,(R - 2r')\sin^2\theta'\,dr'\,d\theta'\,d\phi'.$$

          The $1/r'^2$ cancels, nothing depends on $\phi'$ (that integral gives $2\pi$), and each moment factors:

          $$\int (r')^nP_n(\cos\theta')\,\rho\,d\tau' = 2\pi kR\int_0^R (r')^n(R - 2r')\,dr'\;\int_0^\pi P_n(\cos\theta')\sin^2\theta'\,d\theta'.$$

          **$n = 0$ (monopole).** Radial factor: $\int_0^R(R - 2r')\,dr' = R^2 - R^2 = 0$. So $Q = 0$. (The angular factor, $\int_0^\pi\sin^2\theta'\,d\theta' = \tfrac\pi2$, is multiplied by zero.)

          **$n = 1$ (dipole).** Angular factor: $\int_0^\pi\cos\theta'\sin^2\theta'\,d\theta' = \left[\tfrac13\sin^3\theta'\right]_0^\pi = 0$. So the dipole term vanishes. Symmetry: $\sin^2\theta'$ is the same in both hemispheres while $\cos\theta'$ flips sign. Every odd $n$ vanishes the same way.

          **$n = 2$ (quadrupole).**

          - Radial: $\displaystyle\int_0^R r'^2(R - 2r')\,dr' = \frac{R^4}{3} - \frac{R^4}{2} = -\frac{R^4}{6}$.
          - Angular: $\displaystyle\int_0^\pi\frac{3\cos^2\theta' - 1}{2}\,\sin^2\theta'\,d\theta' = \frac12\left(3\cdot\frac\pi8 - \frac\pi2\right) = -\frac{\pi}{16}$.

          $$\int (r')^2P_2(\cos\theta')\,\rho\,d\tau' = 2\pi kR\left(-\frac{R^4}{6}\right)\left(-\frac{\pi}{16}\right) = \frac{k\pi^2R^5}{48}.$$

          **Result.** The first nonzero term is the quadrupole:

          $$V(z) \approx \kq\,\frac{k\pi^2R^5}{48\,z^3} = \frac{k\pi R^5}{192\,\varepsilon_0 z^3}.$$

          Positive for $k > 0$. On the $-z$ axis the same holds with $z \to |z|$, since $P_2$ is even.

          [[fig:s]]

          **Checks.**
          - Units: $\dfrac{R}{r^2}(R - 2r)$ is dimensionless, so $k$ is a charge density ($\text{C/m}^3$). With $\varepsilon_0$ in $\text{C/(V\,m)}$, $\dfrac{kR^5}{\varepsilon_0 z^3}$ comes out in volts.
          - Sign: $\rho > 0$ for $r < R/2$ and $\rho < 0$ for $R/2 < r < R$, both bunched toward the equator ($\sin\theta$). The negative shell sits farther out, around the equator, so seen from the axis it is farther away than the positive core: the positive charge wins and $V > 0$. Same as the ring of $-q$ around a central $+q$.
          - Accuracy: $n = 3$ vanishes (odd), and the $n = 4$ term is $\dfrac{1}{10}\left(\dfrac Rz\right)^2$ of the quadrupole term. A numerical integration of the exact potential at $z = 10R$ agrees with the formula to $0.1\%$.
          - Off the axis (not asked): $\rho$ has no $\phi$-dependence, so $V(r,\theta) \approx \kq\dfrac{k\pi^2R^5}{48}\dfrac{P_2(\cos\theta)}{r^3}$.

          !!key What to remember
            For a separable density, factor every moment into a radial and an angular integral and look for the zero factor before computing anything. Here the radial integral kills $Q$, symmetry kills every odd moment, and the answer is the quadrupole term.
        `,
        figs: { s: { svg: f327(true), cap: 'Sign of $\\rho$: positive inside the dashed circle $r = R/2$, negative outside it, both concentrated toward the equator.' } },
      }),

      RF(md`
        !!key Patterns to remember
          - On the $+z$ axis $\alpha = \theta'$: each moment is a plain integral $\int (r')^nP_n(\cos\theta')\,\rho\,d\tau'$ with $d\tau' = r'^2\sin\theta'\,dr'\,d\theta'\,d\phi'$.
          - Separable $\rho = f(r')\,g(\theta')$: each moment is $2\pi\times$(radial)$\times$(angular). Look for the zero factor first.
          - For an azimuthally symmetric source, up-down symmetry kills the odd moments and antisymmetry kills the even ones. If $g(\theta')$ is a single $P_\ell(\cos\theta')$, only $n = \ell$ survives (orthogonality).
          - Exact on-axis $V$ $\to$ series in $1/z$ $\to$ replace $\dfrac{1}{z^{n+1}}$ by $\dfrac{P_n(\cos\theta)}{r^{n+1}}$ (azimuthal symmetry only).
          - Line charge on the axis: the $n$-th moment is $\int\lambda(z')\,z'^{\,n}\,dz'$.

        ### Unit summary

        | question | tool |
        |---|---|
        | what dominates far away | first nonzero of $Q$, $\vb p$, quadrupole, ... |
        | charges on the $z$ axis | moments $\sum_i q_is_i^{\,n}$ |
        | point charges anywhere | $Q = \sum q_i$ and $\vb p = \sum q_i\vb r_i'$ |
        | continuous source, field point on the axis | $\int (r')^nP_n(\cos\theta')\,\rho\,d\tau'$ |
        | field of the dipole term | $\dfrac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\uv r + \sin\theta\,\boldsymbol{\hat\theta}\right)$ |
        | origin moved by $\vb a$ | $\bar{\vb p} = \vb p - Q\vb a$ |
      `),
    ],
  };

  C.unit({
    id: 'u8', num: 'Unit 8', title: 'Multipole expansion',
    blurb: 'Assigned on HW 5 (Probs. 3.27, 3.36). Hour Exam I stops at separation of variables, so this is lower priority for the exam, but the homework needs it: the far-field expansion, monopole and dipole moments, the dipole field.',
    lessons: [L1, L2, L3, L4],
  });
})();

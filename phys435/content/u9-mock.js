/* Exam I toolkit, part 2 — the method chooser and two mock exams (images and separation of variables weighted,
   as last year's exam was). Every answer here was checked with sympy/scipy. */
(function () {
  'use strict';
  const { R, RF, Q } = C;
  const U5 = COURSE.units.find((u) => u.id === 'x');

  // ---------------------------------------------------------------- drawings
  const corner = (o = {}) => {                 // two grounded half-planes along +x and +y, charge at (a, b)
    const f = PF.fig();
    const ox = 40, oy = 210, s = o.s || 1;
    f.plane(ox, ox + 230, oy, { side: 'below' });
    f.wall(ox, oy - 200, oy, { side: 'left' });
    f.label(ox + 228, oy + 14, 'x', 'tl', 'small accent'); f.label(ox - 14, oy - 200, 'y', 'tr', 'small accent');
    f.label(ox + 180, oy - 10, 'V=0', 'b', 'small'); f.label(ox + 22, oy - 175, 'V=0', 'l', 'small');
    const qx = ox + 110, qy = oy - 90;
    f.charge(qx, qy, { q: '+', lab: 'q', at: 'tr' });
    f.line(qx, qy, qx, oy, { cls: 'dash dim thin' }); f.line(ox, qy, qx, qy, { cls: 'dash dim thin' });
    f.label(qx + 5, oy - 45, o.b || 'b', 'l', 'small'); f.label(ox + 55, qy - 4, o.a || 'a', 'b', 'small');
    if (o.images) {
      const ix = ox - 110, iy = oy + 90;
      f.charge(ix, qy, { q: '-', lab: '-q', at: 'tl', image: true });
      f.charge(qx, iy, { q: '-', lab: '-q', at: 'br', image: true });
      f.charge(ix, iy, { q: '+', lab: '+q', at: 'bl', image: true });
      f.line(ix, qy, qx, qy, { cls: 'dash dim thin' }); f.line(qx, qy, qx, iy, { cls: 'dash dim thin' });
    }
    return f.svg();
  };
  const sphereQ = (o = {}) => {                // grounded (or neutral) sphere, charge at distance a
    const f = PF.fig();
    const cx = 90, cy = 110, Rr = 60, A = o.A || 180;
    // in an image solution the conductor is replaced by the images: draw it dashed, not hatched
    if (o.image || o.center) f.circle(cx, cy, Rr, { cls: 'dash dim' });
    else { f.hatchBand(f.arcPts(cx, cy, Rr, Rr, 0, 360)); f.circle(cx, cy, Rr); }
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx - 42, cy - 42, { arrow: 'end', cls: 'dim' }); f.label(cx - 48, cy - 48, 'R', 'br', 'small');
    f.charge(cx + A, cy, { q: '+', lab: 'q', at: 't' });
    f.dim(cx, cy + Rr + 18, cx + A, cy + Rr + 18, o.alab || 'a', { at: 'b' });
    f.label(cx - Rr - 6, cy + Rr - 8, o.vlab || 'V=0', 'r', 'small');
    if (o.image) { f.charge(cx + o.image, cy, { q: '-', lab: "q'", at: 'b', image: true, r: 6 }); }
    if (o.center) { f.charge(cx, cy, { q: '+', lab: "q''", at: 'b', image: true, r: 6 }); }
    return f.svg();
  };
  const squarePipe = (o = {}) => {             // square cross-section, faces labelled
    const f = PF.fig();
    const x0 = 60, y0 = 30, L = 170;
    f.rect(x0, y0, L, L, { cls: 'thick' });
    f.label(x0 + L / 2, y0 - 8, o.top || 'V_0', 'b'); f.label(x0 + L / 2, y0 + L + 8, o.bottom || '0', 't');
    f.label(x0 - 8, y0 + L / 2, o.left || '0', 'r'); f.label(x0 + L + 8, y0 + L / 2, o.right || '0', 'l');
    f.axes(x0, y0 + L, { x: [0, L + 40], y: [0, L + 30], xl: 'x', yl: 'y' });
    f.label(x0 + L, y0 + L + 26, 'a', 't', 'small accent'); f.label(x0 - 18, y0, 'a', 'r', 'small accent');
    if (o.center) f.dot(x0 + L / 2, y0 + L / 2, 3);
    return f.svg();
  };
  const sphereV = (lab) => {
    const f = PF.fig();
    const cx = 110, cy = 110, Rr = 70;
    f.sphere(cx, cy, Rr);
    f.line(cx, cy + Rr + 10, cx, cy - Rr - 34, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 6, cy - Rr - 34, 'z', 'l', 'small accent');
    f.line(cx, cy, cx + Rr * 0.8, cy - Rr * 0.6, { cls: 'dim', arrow: 'end' }); f.label(cx + 36, cy - 10, 'R', 'c', 'small');
    f.label(cx + Rr * 0.75 + 12, cy - Rr * 0.75 - 6, lab, 'bl');
    return f.svg();
  };
  const linePlane = () => {
    const f = PF.fig();
    f.plane(10, 290, 140, { lab: 'V=0' });
    f.charge(150, 60, { q: '+', lab: '\\lambda\\ \\text{(line, out of page)}', at: 'r' });
    f.dim(120, 60, 120, 140, 'd', { at: 'l' });
    f.axes(30, 140, { x: [0, 0.1], y: [0, 40], xl: '', yl: 'z' });
    return f.svg();
  };
  const shellInside = () => {
    const f = PF.fig();
    const cx = 120, cy = 120, Rr = 90;
    f.hatchBand(f.arcPts(cx, cy, Rr + 10, Rr + 10, 0, 360).concat(f.arcPts(cx, cy, Rr, Rr, 360, 0)));
    f.circle(cx, cy, Rr); f.circle(cx, cy, Rr + 10, { cls: 'dim' });
    f.dot(cx, cy, 2.2);
    f.charge(cx + 45, cy, { q: '+', lab: 'q', at: 't' });
    f.dim(cx, cy + 22, cx + 45, cy + 22, 'a', { at: 'b' });
    f.line(cx, cy, cx - 64, cy - 64, { cls: 'dim', arrow: 'end' }); f.label(cx - 40, cy - 28, 'R', 'r', 'small');
    f.label(cx + Rr + 14, cy - 60, 'V=0', 'l', 'small');
    return f.svg();
  };
  const slot = (lab) => {
    const f = PF.fig();
    const x0 = 50, y0 = 30, H = 120, L = 250;
    f.plane(x0, x0 + L, y0 + H, { side: 'below' }); f.plane(x0, x0 + L, y0, { side: 'above' });
    f.line(x0, y0, x0, y0 + H, { cls: 'thick' });
    f.label(x0 + L - 20, y0 - 16, 'V=0', 'b', 'small'); f.label(x0 + L - 20, y0 + H + 16, 'V=0', 't', 'small');
    f.label(x0 - 8, y0 + H / 2, lab, 'r');
    f.label(x0 + L + 6, y0 + H / 2, 'x\\to\\infty', 'l', 'small accent');
    f.axes(x0, y0 + H, { x: [0, 0.1], y: [0, 0.1], xl: '', yl: '' });
    f.label(x0 + 4, y0 + H + 18, '0', 't', 'small accent'); f.label(x0 + 24, y0 + 10, 'y=a', 'l', 'small accent');
    return f.svg();
  };
  const cube = (top, bottom) => {
    const f = PF.fig({ proj: { ox: 60, oy: 210, s: 1.4 } });
    f.box3(110, 110, 110, { shadeTop: true });
    f.axes3(150, { box: [110, 110, 110] });
    const t = f.p3(55, 55, 110), b = f.p3(55, 55, 0);
    f.label(t[0], t[1], top, 'c');
    if (bottom) f.label(b[0], b[1] + 18, bottom, 'c');
    return f.svg();
  };
  const sphereField = () => {
    const f = PF.fig();
    const cx = 150, cy = 110, Rr = 55;
    for (let k = -3; k <= 3; k++) { const x = cx + k * 34; if (Math.abs(x - cx) < Rr + 10) { f.arrow(x, 210, x, cy + Rr + 10 + (Rr - Math.abs(x - cx)) * 0.2, { cls: 'dim', hs: 5 }); f.line(x, cy - Rr - 8, x, 10, { cls: 'dim', arrow: 'end', hs: 5 }); } else f.arrow(x, 210, x, 10, { cls: 'dim', hs: 5 }); }
    f.hatchBand(f.arcPts(cx, cy, Rr, Rr, 0, 360)); f.circle(cx, cy, Rr, { cls: 'thick' });
    f.label(cx + 3 * 34 + 10, 24, '\\vb E_0', 'l', 'small');
    return f.svg();
  };
  const ballKr = () => {
    const f = PF.fig();
    const cx = 110, cy = 100, Rr = 70;
    f.add(`<path class="shade nodecl" d="M${f.arcPts(cx, cy, Rr, Rr, 0, 360).map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z"/>`);
    f.circle(cx, cy, Rr);
    f.line(cx, cy, cx + Rr, cy, { cls: 'dim', arrow: 'end' }); f.label(cx + Rr / 2, cy - 6, 'R', 'b', 'small');
    f.label(cx - 10, cy + 30, '\\rho = kr', 'c');
    return f.svg();
  };

  // ---------------------------------------------------------------- method chooser
  const chooser = {
    id: 'x-method', title: 'Which method? A decision guide',
    steps: [
      R(md`
        Most of the exam is recognising the setup. Ask these in order.

        | What you're given | What you want | Method |
        |---|---|---|
        | A charge distribution with spherical, cylindrical or planar symmetry | $\vb E$ | Gauss's law with a sphere / coaxial cylinder / pillbox |
        | A charge distribution without that symmetry | $V$ or $\vb E$ | Integrate $V = \kq\int dq/\srm$ (a scalar: easier), then $\vb E = -\nabla V$; or integrate $\vb E$ directly using symmetry to kill components |
        | A charge distribution, and you only care far away | $V$ | Multipole expansion: the first nonzero term |
        | Point or line charge(s) next to a grounded plane, corner, or sphere | $V$, $\sigma$, force, energy | Method of images |
        | A charge-free region bounded by flat faces, with $V$ given on each face | $V$ inside | Separation of variables, Cartesian ($\sin$ along the direction with two zero faces) |
        | A sphere with $V_0(\theta)$ or $\sigma_0(\theta)$ on it, or a sphere in a uniform field | $V$ inside/outside | Separation of variables, spherical (Legendre) |
        | "Is this the solution?" or "can I guess?" | | Uniqueness: same $\rho$ in the region plus the same boundary data means the same $V$ |
        | Conductors, total charges given | charges on surfaces, $V$ | Conductor rules + Gauss (field zero in the metal) |

        !!key The three questions that decide it
          1. Is there an unknown induced charge (a conductor)? If no, it's Coulomb/Gauss/integration. If yes, it's a boundary-value problem.
          2. Is it a point/line charge next to a plane or sphere? Images.
          3. Is it a region whose faces are coordinate surfaces with $V$ given on them? Separation (Cartesian for boxes and slots, spherical for spheres).
      `),
      Q(md`A thin ring of radius $R$ carries a uniform $\lambda$. You need $\vb E$ at a point on its axis. Best approach?`,
        [md`Gauss's law with a spherical surface`, md`Integrate $V$ on the axis, then $E_z = -dV/dz$, or integrate $E_z$ directly`, md`Method of images`, md`Separation of variables in spherical coordinates`], 1,
        [md`Gauss's law always holds, but here $|\vb E|$ isn't constant on any closed surface you can draw, so it can't be pulled out of the integral.`, null, md`There's no conductor and no unknown induced charge; images replace conductors.`, md`There is no boundary on which $V$ is given; you have the charges themselves.`],
        md`The ring has a symmetry axis but not the symmetry Gauss's law needs. Integrate. On the axis every element is the same distance $\sqrt{R^2+z^2}$ away, so $V = \dfrac{\lambda 2\pi R}{4\pi\varepsilon_0\sqrt{R^2+z^2}}$ in one line, and $E_z = -\partial V/\partial z$. (Only the on-axis $E$ follows from the on-axis $V$; the transverse part would need $V$ off the axis, but it's zero on the axis by symmetry.)`,
        { figHtml: (() => { const f = PF.fig(); f.ellipse(150, 150, 90, 26); f.line(150, 165, 150, 30, { cls: 'dim', arrow: 'end' }); f.dot(150, 60); f.label(158, 60, 'P', 'l'); f.label(244, 150, '\\lambda', 'l', 'small'); f.line(150, 150, 240, 150, { cls: 'dim dash' }); f.label(195, 156, 'R', 't', 'small'); f.label(156, 105, 'z', 'l', 'small'); return f.svg(); })() }),
      Q(md`An infinitely long cylinder of radius $a$ carries $\rho(s) = ks$ inside. You want $\vb E$ everywhere. Best approach?`,
        [md`Coulomb integral over the volume`, md`Gauss's law with a coaxial cylinder of radius $s$`, md`Separation of variables in cylindrical coordinates`, md`Multipole expansion`], 1,
        [md`It would work, but it's a 3-D integral where symmetry hands you the answer in two lines.`, null, md`There's charge in the region, and nothing about boundary values; Gauss is the direct route.`, md`You want the field everywhere, including inside, not just far away.`],
        md`Cylindrical symmetry: $\vb E = E(s)\,\uv s$, constant on a coaxial cylinder, zero flux through the caps. $E\,2\pi sL = \dfrac{1}{\varepsilon_0}\int_0^s ks'\,2\pi s'L\,ds'$, so $E = \dfrac{ks^2}{3\varepsilon_0}$ inside and $\dfrac{ka^3}{3\varepsilon_0 s}$ outside.`,
        { figHtml: (() => { const f = PF.fig(); f.ellipse(60, 100, 24, 60); f.line(60, 40, 240, 40); f.line(60, 160, 240, 160); f.ellipse(240, 100, 24, 60, { half: 'front' }); f.ellipse(240, 100, 24, 60, { half: 'back', cls: 'dash dim' }); f.label(150, 100, '\\rho = ks', 'c'); f.dim(28, 100, 28, 40, 'a', { at: 'l' }); return f.svg(); })() }),
      Q(md`A point charge $q$ sits a distance $d$ from an infinite grounded metal plane. You want the force on it. Best approach?`,
        [md`Coulomb's law between $q$ and the induced charge, integrating $\sigma$ over the plane from scratch`, md`Gauss's law with a pillbox`, md`Method of images: the force from $-q$ at the mirror point`, md`Separation of variables`], 2,
        [md`The induced $\sigma$ is what you don't know in advance; images give it to you (and the force) for free.`, md`A pillbox gives the field at a surface from a known uniform $\sigma$. Here $\sigma$ is unknown and non-uniform.`, null, md`Possible in principle, but images solve it in one line.`],
        md`The induced charge on the plane produces, above the plane, exactly the field of $-q$ at the mirror point. So the force is $\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$ toward the plane.`,
        { figHtml: (() => { const f = PF.fig(); f.plane(10, 260, 130, { lab: 'V=0' }); f.charge(135, 60, { q: '+', lab: 'q' }); f.dim(170, 60, 170, 130, 'd', { at: 'r' }); return f.svg(); })() }),
      Q(md`A long metal pipe with square cross-section has three faces grounded and the fourth held at $V_0$. You want $V$ inside. Best approach?`,
        [md`Method of images`, md`Separation of variables in Cartesian coordinates`, md`Gauss's law`, md`Separation of variables in spherical coordinates`], 1,
        [md`No point charge, no image to place. The sources are the face potentials.`, null, md`There's no symmetry that makes $E$ constant on a surface, and the face charges are unknown.`, md`Flat faces are coordinate surfaces of Cartesian coordinates, not spherical.`],
        md`The boundaries are $x = 0, a$ and $y = 0, a$ with $V$ given on each, and no charge inside: the textbook case for $V = \sum C_n \sin\tfrac{n\pi x}{a}\sinh\tfrac{n\pi y}{a}$ (sine along the direction with two grounded faces).`,
        { figHtml: squarePipe({}) }),
      Q(md`A spherical shell carries $\sigma_0(\theta) = k\cos\theta$ (no conductors anywhere). You want $V$ inside and outside. Best approach?`,
        [md`Method of images`, md`Gauss's law with a concentric sphere`, md`Separation in spherical coordinates, matching $V$ continuous and $\partial V/\partial r$ jumping by $-\sigma_0/\varepsilon_0$ at $r=R$`, md`Cartesian separation of variables`], 2,
        [md`There is no conductor; the charge is given.`, md`$\sigma_0$ depends on $\theta$, so $E$ is not constant on a concentric sphere and Gauss can't be inverted. (It does tell you the total charge: zero here.)`, null, md`A sphere's surface is not a Cartesian coordinate surface.`],
        md`Write $V_{\text{in}} = \sum A_\ell r^\ell P_\ell$, $V_{\text{out}} = \sum B_\ell r^{-(\ell+1)}P_\ell$, impose continuity of $V$ and the jump in $\partial V/\partial r$. Only $\ell = 1$ appears: $V_{\text{in}} = \dfrac{k}{3\varepsilon_0}r\cos\theta$, $V_{\text{out}} = \dfrac{kR^3}{3\varepsilon_0}\dfrac{\cos\theta}{r^2}$ (Griffiths Ex. 3.9).`,
        { figHtml: sphereV('\\sigma_0(\\theta) = k\\cos\\theta') }),
      Q(md`A neutral metal sphere is placed in a uniform field $\vb E_0$. You want the field outside. Best approach?`,
        [md`Spherical separation of variables with $V \to -E_0 r\cos\theta$ far away and $V = $ const on the sphere`, md`One image charge at the center`, md`Gauss's law`, md`Cartesian separation`], 0,
        [null, md`A single point charge at the center would make the sphere charged and add a $1/r$ field. The induced charge is a dipole-like $\sigma\propto\cos\theta$, not a monopole.`, md`The induced charge is non-uniform, so no Gaussian surface has constant $E$.`, md`The boundary is a sphere.`],
        md`The far-field condition supplies the $A_1 r\cos\theta$ term ($A_1 = -E_0$), and $V = 0$ on the sphere fixes $B_1 = E_0R^3$: $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$.`,
        { figHtml: sphereField() }),
      Q(md`A charge distribution of total charge zero sits near the origin, and you only care about $V$ at distance $r$ much larger than its size. What to compute first?`,
        [md`The total charge`, md`The dipole moment $\vb p = \int \vb r'\rho\,d\tau'$`, md`The full Coulomb integral`, md`Image charges`], 1,
        [md`It's zero, so the monopole term vanishes: you need the next term.`, null, md`Unnecessary when you only want the leading far-field behaviour.`, md`No conductors.`],
        md`With $Q = 0$ the leading term is the dipole: $V \approx \dfrac{\vb p\cdot\uv r}{4\pi\varepsilon_0 r^2}$. If $\vb p$ also vanishes, go to the quadrupole.`,
        { nofig: 'abstract: any localized neutral distribution' }),
      Q(md`You guessed a potential that satisfies Laplace's equation in a charge-free region and matches $V$ on every boundary. Is it the answer?`,
        [md`Only if you derived it, not guessed it`, md`Yes: the first uniqueness theorem`, md`Only if the boundaries are conductors`, md`Only if it also matches $\partial V/\partial n$ on the boundaries`], 1,
        [md`How you found it doesn't matter. That's the whole point of the theorem.`, null, md`The theorem needs $V$ specified on the boundary, not conductors.`, md`Specifying $V$ alone is enough. Specifying both $V$ and $\partial V/\partial n$ everywhere would generally over-determine the problem.`],
        md`Uniqueness: two solutions with the same boundary values differ by a function that satisfies Laplace with zero boundary values, which must vanish everywhere (no interior extrema). This is what licenses images and separation of variables.`,
        { nofig: 'statement of a theorem' }),
      Q(md`A point charge sits inside a spherical cavity (off-center) in a neutral metal block of irregular shape. What is the field outside the block?`,
        [md`Zero, the metal shields it`, md`Like a point charge $q$ at the cavity's center`, md`Determined by the outer surface's shape: the induced $+q$ spreads over the outer surface as if the cavity weren't there`, md`Like a point charge $q$ at its actual position`], 2,
        [md`The metal shields the *inside* from outside fields, not the outside from a charge within: the outer surface ends up with $+q$.`, md`Neither the cavity's center nor the charge's position is visible outside; the outer surface distribution doesn't know about the cavity.`, null, md`The outside sees only the outer surface's $+q$, arranged as it would be on that conductor with charge $q$ and no cavity.`],
        md`$-q$ gathers on the cavity wall (Gauss with a surface in the metal), so $+q$ goes to the outer surface. The metal's field is zero, so the outer charge arranges itself as on a solid conductor with charge $q$. For a spherical block, outside = point charge $q$ at the sphere's center.`,
        { figHtml: (() => { const f = PF.fig(); const out = [[20, 60], [80, 20], [220, 30], [260, 120], [200, 190], [60, 170], [20, 60]]; f.hatchBand(out.concat(f.arcPts(130, 100, 45, 45, 360, 0))); f.poly(out.slice(0, -1)); f.circle(130, 100, 45); f.charge(116, 96, { q: '+', lab: 'q', at: 'r', r: 6 }); return f.svg(); })() }),
      Q(md`A charge $q$ is placed between two grounded parallel infinite planes. To get $V$ between them with images, how many image charges do you need?`,
        [md`One`, md`Two`, md`Three`, md`Infinitely many (images of images)`], 3,
        [md`One image fixes one plane, but then the other plane isn't at $V = 0$.`, md`Imaging in each plane once fixes neither exactly; each image needs its own image in the other plane.`, md`That's the 90° corner. Parallel planes reflect back and forth forever.`, null],
        md`Each plane acts as a mirror, and two parallel mirrors make an infinite row of images with alternating signs at spacing $2\times$ the plate gap. The series converges, so the method still works.`,
        { figHtml: (() => { const f = PF.fig(); f.plane(10, 270, 40, { side: 'above' }); f.plane(10, 270, 150, {}); f.charge(140, 80, { q: '+', lab: 'q' }); f.label(260, 30, 'V=0', 'br', 'small'); f.label(262, 168, 'V=0', 'tr', 'small'); return f.svg(); })() }),
      Q(md`Inside a hollow grounded metal box with one face held at $V_0$, where is $V$ largest?`,
        [md`At the center`, md`Somewhere inside, at the point farthest from the grounded faces`, md`On the live face`, md`On a grounded face`], 2,
        [md`The center is a weighted average, so it's below the maximum boundary value.`, md`A charge-free region can't have an interior maximum.`, null, md`Those are at $0$, the minimum.`],
        md`In a charge-free region $V$ has no local maxima or minima; extremes sit on the boundary. So the maximum is $V_0$ on the live face and the minimum $0$ on the grounded ones.`,
        { figHtml: cube('V_0') }),
    ],
  };

  // ---------------------------------------------------------------- mock exam A
  const mockA = {
    id: 'x-mock', title: 'Mock exam A', kind: 'mock',
    steps: [
      R(md`
        Closed book, formula sheet only, 50 minutes. Weighted the way last year's exam reportedly was: images and separation of variables. Write full solutions on paper, then open the answers.
      `),
      {
        t: 'paper',
        html: '<div class="pp-title"><span>PHYS 435 · Mock Hour Exam I (A)</span><span>100 pts</span></div><div class="pp-meta"><span>Problems 1–4</span><span>Formula sheet allowed</span></div>',
        items: [
          {
            q: md`
              **Problem 1 (25 pts).** Two semi-infinite grounded conducting planes meet at a right angle along the $z$-axis (the planes $x = 0$, $y>0$ and $y = 0$, $x>0$). A point charge $q$ sits at $(a, b, 0)$.

              [[fig:p1]]

              (a) Where must the image charges be, and what are they? (b) Write $V(x,y,z)$ in the region $x>0$, $y>0$. (c) Find the force on $q$ for $a = b$. (d) What is the total charge induced on the two planes? (e) How much work does it take to bring $q$ in from infinity to $(a, a, 0)$?
            `,
            figs: { p1: { svg: corner({}), cap: 'Grounded 90° corner; $q$ at $(a, b)$.' } },
            ans: md`
              - (a) $-q$ at $(-a, b, 0)$, $-q$ at $(a, -b, 0)$, $+q$ at $(-a, -b, 0)$.
              - (b) $V = \kq\left[\dfrac{1}{\srm_1} - \dfrac{1}{\srm_2} - \dfrac{1}{\srm_3} + \dfrac{1}{\srm_4}\right]$, the four distances to $q$ and its images (written out in the solution).
              - (c) $|\vb F| = \dfrac{2\sqrt2 - 1}{8}\,\dfrac{q^2}{4\pi\varepsilon_0 a^2} \approx 0.229\,\dfrac{q^2}{4\pi\varepsilon_0a^2}$, pointing at the corner.
              - (d) $-q$.
              - (e) $W = \left(-\dfrac12 + \dfrac{\sqrt2}{8}\right)\dfrac{q^2}{4\pi\varepsilon_0 a} \approx -0.323\,\dfrac{q^2}{4\pi\varepsilon_0 a}$.
            `,
            sol: md`
              **(a)** Imaging $q$ in the plane $x = 0$ gives $-q$ at $(-a, b)$; that fixes $x=0$ but spoils $y=0$. Image both charges in $y = 0$: $-q$ at $(a,-b)$ and $+q$ at $(-a,-b)$. Now every point on either plane is equidistant from a $+q$ and a $-q$ pair, so $V = 0$ on both. All three images are outside the region of interest ($x>0,y>0$), so uniqueness says this is the answer there.

              [[fig:img]]

              **(b)** With $\srm_{\pm\pm}$ the distances to the four charges:
              $$V = \kq\left[\frac{1}{\sqrt{(x-a)^2+(y-b)^2+z^2}} - \frac{1}{\sqrt{(x+a)^2+(y-b)^2+z^2}} - \frac{1}{\sqrt{(x-a)^2+(y+b)^2+z^2}} + \frac{1}{\sqrt{(x+a)^2+(y+b)^2+z^2}}\right]$$
              valid for $x \ge 0$, $y \ge 0$ (and $V = 0$ inside the metal).

              **(c)** The force on $q$ is the force from the three images (the field of the induced charge equals the images' field at $q$). With $K = \dfrac{q^2}{4\pi\varepsilon_0}$:
              - from $-q$ at $(-a,b)$, distance $2a$: attraction along $-\uv x$, $\;-\dfrac{K}{4a^2}\uv x$;
              - from $-q$ at $(a,-b)$, distance $2b$: $\;-\dfrac{K}{4b^2}\uv y$;
              - from $+q$ at $(-a,-b)$, distance $2\sqrt{a^2+b^2}$: repulsion along $(a,b)$: $\;\dfrac{K\,(a\uv x + b\uv y)}{4(a^2+b^2)^{3/2}}$.

              For $a = b$: $F_x = F_y = \dfrac{K}{a^2}\left(-\dfrac14 + \dfrac{1}{8\sqrt2}\right)$, so $|\vb F| = \sqrt2\,|F_x| = \dfrac{2\sqrt2-1}{8}\dfrac{K}{a^2}$, directed toward the corner. The repulsion from the diagonal image weakens, but doesn't beat, the two attractions.

              **(d)** Total induced charge = sum of the images: $-q - q + q = -q$. (Gauss's law: outside a large surface enclosing $q$ and the corner region, the field equals that of the image system.)

              **(e)** For one real charge and grounded conductors, $W = \tfrac12 q\,V_{\text{induced}}(\text{at }q)$, where $V_{\text{induced}}$ is the images' potential there:
              $$W = \frac12\,\frac{q}{4\pi\varepsilon_0}\left[-\frac{q}{2a} - \frac{q}{2a} + \frac{q}{2\sqrt2\,a}\right] = \left(-\frac12 + \frac{\sqrt2}{8}\right)\frac{q^2}{4\pi\varepsilon_0 a}.$$
              The $\tfrac12$ is the same "half" as for one plane: the field exists only in the quarter-space, not around the images. (Check: integrating $-\vb F\cdot d\vb l$ along the diagonal from infinity gives the same number.)
            `,
          },
          {
            q: md`
              **Problem 2 (25 pts).** A grounded conducting sphere of radius $R$ is centered at the origin. A point charge $q$ sits on the $z$-axis at $z = 3R$.

              [[fig:p2]]

              (a) Find the image charge and its position. (b) Find the force on $q$. (c) Find the induced surface charge density at the point of the sphere nearest to $q$ and at the farthest point. (d) Now the sphere is disconnected from ground with zero net charge (before $q$ is brought in). What is the force on $q$ now? (e) What is the potential of the sphere in (d)?
            `,
            figs: { p2: { svg: sphereQ({ A: 180, alab: '3R' }), cap: 'Grounded sphere, charge at $3R$ from the center.' } },
            ans: md`
              - (a) $q' = -q/3$ at $z = R/3$.
              - (b) $\dfrac{3}{64}\dfrac{q^2}{4\pi\varepsilon_0R^2}$, attractive.
              - (c) $\sigma_{\text{near}} = -\dfrac{q}{4\pi R^2}$, $\sigma_{\text{far}} = -\dfrac{q}{32\pi R^2}$.
              - (d) $\dfrac{17}{1728}\dfrac{q^2}{4\pi\varepsilon_0R^2}$, still attractive.
              - (e) $V = \dfrac{q}{12\pi\varepsilon_0 R}$.
            `,
            sol: md`
              **(a)** $q' = -\dfrac{R}{a}q = -\dfrac q3$ at $b = \dfrac{R^2}{a} = \dfrac R3$ on the line to $q$.

              [[fig:img]]

              **(b)** Distance from $q$ to $q'$: $3R - R/3 = 8R/3$.
              $$F = \frac{q\,q'}{4\pi\varepsilon_0 (8R/3)^2} = -\frac{q^2}{3}\cdot\frac{9}{64R^2}\cdot\frac{1}{4\pi\varepsilon_0} = -\frac{3}{64}\frac{q^2}{4\pi\varepsilon_0R^2}$$
              (minus = toward the sphere).

              **(c)** $\sigma(\theta) = -\dfrac{q\,(a^2-R^2)}{4\pi R\,(R^2+a^2-2aR\cos\theta)^{3/2}}$ with $a = 3R$. Nearest point ($\theta = 0$): $R^2 + 9R^2 - 6R^2 = 4R^2$, so $\sigma = -\dfrac{q\cdot8R^2}{4\pi R\cdot8R^3} = -\dfrac{q}{4\pi R^2}$. Farthest point ($\theta = \pi$): $16R^2$ inside the bracket, so $\sigma = -\dfrac{q\cdot8R^2}{4\pi R\cdot64R^3} = -\dfrac{q}{32\pi R^2}$. Eight times more charge on the near side. It integrates to $q' = -q/3$, not $-q$.

              **(d)** Neutral and isolated: add $q'' = +q/3$ at the center. It keeps the sphere an equipotential (it adds a constant on the sphere) and restores zero net charge.
              $$F = \frac{q}{4\pi\varepsilon_0}\left[\frac{-q/3}{(8R/3)^2} + \frac{q/3}{(3R)^2}\right] = \frac{q^2}{4\pi\varepsilon_0R^2}\left(-\frac{3}{64} + \frac{1}{27}\right) = -\frac{17}{1728}\frac{q^2}{4\pi\varepsilon_0R^2}$$
              Still attractive: the near image is closer than the far one. A neutral conductor always attracts a charge.

              **(e)** The sphere is one equipotential, so its potential equals $V$ at its center. There, the real charge contributes $\dfrac{q}{4\pi\varepsilon_0\,3R}$, and the induced charge (net zero, all at distance $R$) contributes $0$. So $V = \dfrac{q}{12\pi\varepsilon_0R}$. Same from the images: on the sphere $q$ and $q'$ together give $0$ (that's how $q'$ was built), so only $q''$ contributes, $\dfrac{q/3}{4\pi\varepsilon_0R}$.
            `,
          },
          {
            q: md`
              **Problem 3 (25 pts).** A long metal pipe (infinite in $z$) has a square cross-section $0 \le x \le a$, $0 \le y \le a$. The faces $x = 0$, $x = a$ and $y = 0$ are grounded; the face $y = a$ is held at constant $V_0$ (insulated from the others).

              [[fig:p3]]

              (a) Write the general solution that satisfies the three grounded faces, explaining each choice. (b) Find the coefficients. (c) Without the series, what is $V$ at the center? Then check it with the first term of your series.
            `,
            ans: md`
              - (a) $V = \sum_n C_n\sin\dfrac{n\pi x}{a}\sinh\dfrac{n\pi y}{a}$.
              - (b) $C_n = \dfrac{4V_0}{n\pi\sinh(n\pi)}$ for odd $n$, $0$ for even.
              - (c) $V_0/4$; the first term gives $0.254\,V_0$ (the series sums to $0.2500\,V_0$).
            `,
            sol: md`
              **(a)** $\nabla^2V = 0$ inside, $V = X(x)Y(y)$. The $x$ direction has two zero faces ($x = 0$, $x = a$), so it oscillates: $X = \sin(n\pi x/a)$ ($\cos$ is killed by $V(0,y) = 0$, and $V(a,y) = 0$ quantizes $k = n\pi/a$). Then $Y'' = k^2Y$: $Y = Ae^{ky} + Be^{-ky}$, and $V(x,0) = 0$ forces $A = -B$, i.e. $Y \propto \sinh(n\pi y/a)$. Superpose:
              $$V(x,y) = \sum_{n=1}^\infty C_n \sin\frac{n\pi x}{a}\sinh\frac{n\pi y}{a}.$$

              **(b)** At $y = a$: $V_0 = \sum C_n\sinh(n\pi)\sin(n\pi x/a)$. Fourier's trick: $C_n\sinh(n\pi) = \dfrac2a\displaystyle\int_0^a V_0\sin\frac{n\pi x}{a}dx = \dfrac{2V_0}{n\pi}(1-\cos n\pi)$, so $C_n = \dfrac{4V_0}{n\pi\sinh n\pi}$ for odd $n$, zero for even.

              **(c)** Superposition trick: rotate the problem four ways so each face in turn is live. The four solutions add to the problem with all four faces at $V_0$, whose solution is $V = V_0$ everywhere. At the center all four are equal by symmetry, so each is $V_0/4$.
              Series: $n = 1$: $\dfrac{4V_0}{\pi}\cdot\dfrac{\sinh(\pi/2)}{\sinh\pi}\cdot\sin\dfrac\pi2 = 1.273\times\dfrac{2.301}{11.549}V_0 = 0.2537\,V_0$; $n = 3$ adds $-0.0038\,V_0$; the sum converges to $0.2500\,V_0$.

              [[fig:sum]]
            `,
            figs: { p3: { svg: squarePipe({ center: true }), cap: 'Square pipe, top face at $V_0$.' }, sum: { svg: PF.row([{ svg: squarePipe({ top: 'V_0', center: true }), cap: 'top live' }, { svg: squarePipe({ top: '0', left: 'V_0', center: true }), cap: 'left live' }, { svg: squarePipe({ top: '0', bottom: 'V_0', center: true }), cap: 'bottom live' }, { svg: squarePipe({ top: '0', right: 'V_0', center: true }), cap: 'right live' }]).svg, cap: 'The four rotated problems add up to "all faces at $V_0$", whose solution is $V_0$ everywhere.' } },
          },
          {
            q: md`
              **Problem 4 (25 pts).** A thin spherical shell of radius $R$ (no charges anywhere else) is held at the surface potential $V_0(\theta) = V_0\cos^2\theta$.

              [[fig:p4]]

              (a) Write $V_0(\theta)$ as a sum of Legendre polynomials. (b) Find $V$ inside and outside. (c) Find the surface charge density $\sigma(\theta)$ on the shell and the total charge. (d) What is $V$ at the center, and why could you have predicted it?
            `,
            figs: { p4: { svg: sphereV('V_0\\cos^2\\theta'), cap: 'Shell held at $V_0\\cos^2\\theta$.' } },
            ans: md`
              - (a) $\cos^2\theta = \tfrac13P_0 + \tfrac23P_2(\cos\theta)$.
              - (b) $V_{\text{in}} = V_0\left[\tfrac13 + \tfrac23\tfrac{r^2}{R^2}P_2(\cos\theta)\right]$, $V_{\text{out}} = V_0\left[\tfrac13\tfrac Rr + \tfrac23\tfrac{R^3}{r^3}P_2(\cos\theta)\right]$.
              - (c) $\sigma = \dfrac{\varepsilon_0V_0}{R}\left[\tfrac13 + \tfrac{10}{3}P_2(\cos\theta)\right]$, $Q = \tfrac43\pi\varepsilon_0RV_0$.
              - (d) $V_0/3$, the average of $V_0\cos^2\theta$ over the sphere.
            `,
            sol: md`
              **(a)** $P_2 = \tfrac12(3x^2 - 1)$ gives $x^2 = \tfrac13 + \tfrac23P_2$. No integrals needed: when $V_0$ is a polynomial in $\cos\theta$, read the coefficients off.

              **(b)** Inside, $V$ must be finite at $r = 0$: only $A_\ell r^\ell$. Outside, $V \to 0$: only $B_\ell r^{-(\ell+1)}$. Match at $r = R$ term by term:
              $$V_{\text{in}} = V_0\left[\frac13 + \frac23\frac{r^2}{R^2}P_2(\cos\theta)\right], \qquad V_{\text{out}} = V_0\left[\frac13\frac Rr + \frac23\frac{R^3}{r^3}P_2(\cos\theta)\right].$$

              **(c)** $\sigma = -\varepsilon_0\left[\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r}\right]_{r=R}$:
              - $\ell = 0$: $-\varepsilon_0\left(-\dfrac{V_0}{3R} - 0\right) = \dfrac{\varepsilon_0V_0}{3R}$
              - $\ell = 2$: $-\varepsilon_0\left(-3\cdot\dfrac{2V_0}{3R} - 2\cdot\dfrac{2V_0}{3R}\right)P_2 = \dfrac{10\varepsilon_0V_0}{3R}P_2$

              So $\sigma = \dfrac{\varepsilon_0V_0}{R}\left[\dfrac13 + \dfrac{10}{3}P_2(\cos\theta)\right]$ (in general each $\ell$ contributes $(2\ell+1)\varepsilon_0/R$ times its coefficient: Prob 3.22). Only $P_0$ survives integration over the sphere: $Q = 4\pi R^2\cdot\dfrac{\varepsilon_0V_0}{3R} = \dfrac43\pi\varepsilon_0RV_0$. Check: far away $V_{\text{out}}\to\dfrac{V_0R}{3r} = \dfrac{Q}{4\pi\varepsilon_0r}$ ✓.

              **(d)** $V(0) = A_0 = V_0/3$: the potential at the center of a charge-free sphere is the average over its surface, and the average of $\cos^2\theta$ over a sphere is $\tfrac13$.
            `,
          },
        ],
        figs: {},
      },
    ],
  };
  // drawings that belong to solutions
  mockA.steps[1].items[0].figs.img = { svg: corner({ images: true }), cap: 'Three images make both planes equipotentials at $V = 0$.' };
  mockA.steps[1].items[1].figs.img = { svg: sphereQ({ A: 180, alab: '3R', image: 20 }), cap: "Image $q' = -q/3$ at $R/3$ from the center." };

  // ---------------------------------------------------------------- mock exam B
  const mockB = {
    id: 'x-mock2', title: 'Mock exam B', kind: 'mock',
    steps: [
      R(md`Same rules: 50 minutes, formula sheet only. Different geometries, same skills.`),
      {
        t: 'paper',
        html: '<div class="pp-title"><span>PHYS 435 · Mock Hour Exam I (B)</span><span>100 pts</span></div><div class="pp-meta"><span>Problems 1–5</span><span>Formula sheet allowed</span></div>',
        items: [
          {
            q: md`
              **Problem 1 (20 pts).** An infinite line charge $\lambda$ runs parallel to an infinite grounded conducting plane, a distance $d$ above it.

              [[fig:p1]]

              (a) Find $V$ above the plane. (b) Find the induced surface charge $\sigma(x)$, where $x$ is measured along the plane perpendicular to the line. (c) Find the induced charge per unit length. (d) Find the force per unit length on the line charge.
            `,
            figs: { p1: { svg: linePlane(), cap: 'Line charge parallel to a grounded plane (end view).' } },
            ans: md`
              - (a) $V = \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{\sqrt{x^2+(z+d)^2}}{\sqrt{x^2+(z-d)^2}}$.
              - (b) $\sigma = -\dfrac{\lambda d}{\pi(x^2+d^2)}$.
              - (c) $-\lambda$.
              - (d) $\dfrac{\lambda^2}{4\pi\varepsilon_0d}$ per unit length, toward the plane.
            `,
            sol: md`
              **(a)** Image: $-\lambda$ at depth $d$. A single line's potential is $-\dfrac{\lambda}{2\pi\varepsilon_0}\ln s + \text{const}$; for the pair the constants cancel:
              $$V(x,z) = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac{s_-}{s_+},\qquad s_\pm = \sqrt{x^2 + (z\mp d)^2}.$$
              On the plane $s_+ = s_-$, so $V = 0$ ✓; far away $s_-/s_+\to1$, so $V\to0$ ✓.

              **(b)** $\sigma = -\varepsilon_0\dfrac{\partial V}{\partial z}\Big|_{z=0}$. $\dfrac{\partial}{\partial z}\ln s_- = \dfrac{z+d}{s_-^2}$, $\dfrac{\partial}{\partial z}\ln s_+ = \dfrac{z-d}{s_+^2}$; at $z = 0$ the difference is $\dfrac{2d}{x^2+d^2}$. So $\sigma = -\dfrac{\lambda d}{\pi(x^2+d^2)}$.

              **(c)** $\displaystyle\int_{-\infty}^{\infty}\sigma\,dx = -\frac{\lambda d}{\pi}\cdot\frac{\pi}{d} = -\lambda$, equal to the image, as for a point charge.

              **(d)** Field of the image line at the real line (distance $2d$): $\dfrac{\lambda}{2\pi\varepsilon_0(2d)}$ toward the plane. Force per length $= \lambda E = \dfrac{\lambda^2}{4\pi\varepsilon_0d}$, attractive.
            `,
          },
          {
            q: md`
              **Problem 2 (20 pts).** A point charge $q$ is inside a grounded spherical metal shell of inner radius $R$, at distance $a = R/2$ from the center.

              [[fig:p2]]

              (a) Where is the image charge and how big is it? (b) What is the force on $q$ (magnitude and direction)? (c) What is the total charge induced on the inner surface of the shell? (d) What is $V$ at the center of the shell?
            `,
            figs: { p2: { svg: shellInside(), cap: 'Charge inside a grounded shell.' } },
            ans: md`
              - (a) $q' = -2q$ at distance $2R$ from the center, on the same side.
              - (b) $\dfrac89\dfrac{q^2}{4\pi\varepsilon_0R^2}$, toward the nearest wall (away from the center).
              - (c) $-q$.
              - (d) $\dfrac{q}{4\pi\varepsilon_0R}$.
            `,
            sol: md`
              **(a)** Same algebra as for the outside case, but now the region of interest is *inside*, so the image goes *outside*: $b = R^2/a = 2R$, $q' = -\dfrac Ra q = -2q$. It can be bigger than $q$ because it's farther away.

              **(b)** Separation $b - a = 2R - R/2 = 3R/2$. $F = \dfrac{q(-2q)}{4\pi\varepsilon_0(3R/2)^2} = -\dfrac{8}{9}\dfrac{q^2}{4\pi\varepsilon_0R^2}$ (toward the image), i.e. outward, toward the nearest part of the wall.

              **(c)** $-q$, not $q'$. A Gaussian surface inside the metal encloses $q$ plus the induced charge and has $\vb E = 0$ on it, so the induced charge must be $-q$. (The image's value $-2q$ is fiction outside the region; only inside does it reproduce the field.)

              **(d)** $V(0) = \kq\left(\dfrac{q}{a} + \dfrac{q'}{b}\right) = \kq\left(\dfrac{2q}{R} - \dfrac{2q}{2R}\right) = \dfrac{q}{4\pi\varepsilon_0R}$. (Check with $\tfrac{1}{4\pi\varepsilon_0}\left(\tfrac qa - \tfrac qR\right)$: the induced $-q$ all sits at distance $R$ from the center.)
            `,
          },
          {
            q: md`
              **Problem 3 (20 pts).** The semi-infinite slot: grounded plates at $y = 0$ and $y = a$ for $x>0$; the end $x = 0$ is held at $V_0(y) = V_0\,y/a$.

              [[fig:p3]]

              (a) Find $V(x,y)$. (b) Which term dominates far from the end, and what is $V$ there approximately? (c) Evaluate $V(a, a/2)$ to two significant figures.
            `,
            figs: { p3: { svg: slot('V_0\\,y/a'), cap: 'Slot with a ramp potential on the end.' } },
            ans: md`
              - (a) $V = \dfrac{2V_0}{\pi}\displaystyle\sum_{n=1}^\infty\frac{(-1)^{n+1}}{n}e^{-n\pi x/a}\sin\frac{n\pi y}{a}$.
              - (b) $n=1$: $V\approx\dfrac{2V_0}{\pi}e^{-\pi x/a}\sin\dfrac{\pi y}{a}$.
              - (c) $0.027\,V_0$.
            `,
            sol: md`
              **(a)** Same as Ex. 3.3 up to the last step: $V = \sum C_ne^{-n\pi x/a}\sin(n\pi y/a)$ with
              $$C_n = \frac2a\int_0^a V_0\frac ya\sin\frac{n\pi y}{a}\,dy = \frac{2V_0}{a^2}\left[-\frac{a^2}{n\pi}\cos n\pi\right] = \frac{2V_0(-1)^{n+1}}{n\pi}.$$
              (Use $\int_0^a y\sin\frac{n\pi y}{a}dy = -\frac{a^2}{n\pi}\cos n\pi$.) All $n$ appear this time: the ramp has no symmetry about $y = a/2$.

              **(b)** Each term decays as $e^{-n\pi x/a}$, so for $x\gtrsim a$ the $n = 1$ term wins: $V\approx\dfrac{2V_0}{\pi}e^{-\pi x/a}\sin\dfrac{\pi y}{a}$.

              **(c)** At $(a, a/2)$: $n=1$: $\dfrac2\pi e^{-\pi} = 0.0275$; $n = 2$: $\sin\pi = 0$; $n = 3$: $-\dfrac{2}{3\pi}e^{-3\pi}\approx -2\times10^{-5}$. So $V\approx 0.027\,V_0$.
            `,
          },
          {
            q: md`
              **Problem 4 (20 pts).** A neutral metal sphere of radius $R$ sits in a uniform field $\vb E_0 = E_0\uv z$. Then the sphere is given net charge $Q$.

              [[fig:p4]]

              (a) Write $V(r,\theta)$ outside for the neutral sphere (set $V = 0$ on the sphere). (b) Find $\sigma(\theta)$ for the neutral sphere and its maximum. (c) How do $V$ and $\sigma$ change when the sphere carries $Q$? (d) For which $Q$ is $\sigma\ge0$ everywhere?
            `,
            figs: { p4: { svg: sphereField(), cap: 'Metal sphere (later given net charge $Q$) in a uniform field.' } },
            ans: md`
              - (a) $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$.
              - (b) $\sigma = 3\varepsilon_0E_0\cos\theta$, maximum $3\varepsilon_0E_0$ at $\theta = 0$.
              - (c) Add $\dfrac{Q}{4\pi\varepsilon_0r}$ to $V$ and $\dfrac{Q}{4\pi R^2}$ to $\sigma$.
              - (d) $Q\ge 12\pi\varepsilon_0E_0R^2$.
            `,
            sol: md`
              **(a)** Far away $V\to -E_0z = -E_0r\cos\theta$ (the $A_1$ term). On the sphere $V = 0$ for all $\theta$, which needs a $B_1\cos\theta/r^2$ term with $-E_0R + B_1/R^2 = 0$: $B_1 = E_0R^3$. No other $\ell$ is needed. So $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$.

              **(b)** $\sigma = -\varepsilon_0\dfrac{\partial V}{\partial r}\Big|_R = \varepsilon_0E_0\left(1 + \dfrac{2R^3}{R^3}\right)\cos\theta = 3\varepsilon_0E_0\cos\theta$. Positive on the side the field points to, negative on the other; maximum $3\varepsilon_0E_0$ at the north pole. The field there is $3E_0$: the sphere triples the field at its poles.

              **(c)** A charged sphere alone has $V = \dfrac{Q}{4\pi\varepsilon_0r}$ outside, which is constant on the sphere and solves Laplace outside, so superpose it: $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta + \dfrac{Q}{4\pi\varepsilon_0r}$, and $\sigma$ gains the uniform $\dfrac{Q}{4\pi R^2}$.

              **(d)** $\sigma_{\min}$ is at $\theta = \pi$: $-3\varepsilon_0E_0 + \dfrac{Q}{4\pi R^2}\ge 0 \Rightarrow Q\ge 12\pi\varepsilon_0E_0R^2$.
            `,
          },
          {
            q: md`
              **Problem 5 (20 pts).** A solid ball of radius $R$ carries charge density $\rho = kr$ ($k$ constant).

              [[fig:p5]]

              (a) Find the total charge. (b) Find $\vb E$ inside and outside. (c) Find $V$ at the center (reference at infinity). (d) Find the total electrostatic energy.
            `,
            figs: { p5: { svg: ballKr(), cap: 'Ball with $\\rho = kr$.' } },
            ans: md`
              - (a) $Q = \pi kR^4$.
              - (b) $E = \dfrac{kr^2}{4\varepsilon_0}$ inside, $\dfrac{kR^4}{4\varepsilon_0r^2}$ outside (radial).
              - (c) $V(0) = \dfrac{kR^3}{3\varepsilon_0}$.
              - (d) $W = \dfrac{\pi k^2R^7}{7\varepsilon_0}$.
            `,
            sol: md`
              **(a)** $Q = \displaystyle\int_0^R kr\,4\pi r^2dr = \pi kR^4$.

              **(b)** Gauss with a sphere of radius $r$: inside, $\Qenc = \pi kr^4$, so $E\,4\pi r^2 = \pi kr^4/\varepsilon_0$, $E = \dfrac{kr^2}{4\varepsilon_0}$. Outside, $E = \dfrac{Q}{4\pi\varepsilon_0r^2} = \dfrac{kR^4}{4\varepsilon_0r^2}$. Both give $kR^2/4\varepsilon_0$ at $r = R$ (no surface charge, so no jump).

              **(c)** $V(0) = \displaystyle\int_0^\infty E\,dr = \int_0^R\frac{kr^2}{4\varepsilon_0}dr + \int_R^\infty\frac{kR^4}{4\varepsilon_0r^2}dr = \frac{kR^3}{12\varepsilon_0} + \frac{kR^3}{4\varepsilon_0} = \frac{kR^3}{3\varepsilon_0}$.

              **(d)** $W = \dfrac{\varepsilon_0}{2}\displaystyle\int E^2d\tau$: inside $\dfrac{\varepsilon_0}{2}\int_0^R\dfrac{k^2r^4}{16\varepsilon_0^2}4\pi r^2dr = \dfrac{\pi k^2R^7}{56\varepsilon_0}$; outside $\dfrac{\varepsilon_0}{2}\int_R^\infty\dfrac{k^2R^8}{16\varepsilon_0^2r^4}4\pi r^2dr = \dfrac{\pi k^2R^7}{8\varepsilon_0}$. Total $\dfrac{\pi k^2R^7}{8\varepsilon_0}\left(\dfrac17 + 1\right) = \dfrac{\pi k^2R^7}{7\varepsilon_0}$.
            `,
          },
        ],
      },
    ],
  };

  // ---------------------------------------------------------------- mock exam C: boundary-value problems only
  const planeQ = () => { const f = PF.fig(); f.plane(10, 290, 130, { lab: 'V=0' }); f.charge(150, 50, { q: '+', lab: 'q', at: 'r' }); f.dim(120, 50, 120, 130, 'd', { at: 'l' }); f.line(150, 64, 150, 126, { cls: 'dash dim thin' }); return f.svg(); };
  const squarePipe2 = () => squarePipe({ top: 'V_0', bottom: 'V_0', center: true });
  const sphereSigma = () => sphereV('\\sigma_0(3\\cos^2\\theta-1)');
  const mockC = {
    id: 'x-mock3', title: 'Mock exam C: boundary-value problems', kind: 'mock',
    steps: [
      R(md`Only images and separation of variables, the way last year's exam leaned. 50 minutes, formula sheet only. Before each solution, write the boundary conditions as a numbered list: half the points on a real exam are for setting the problem up.`),
      {
        t: 'paper',
        html: '<div class="pp-title"><span>PHYS 435 · Mock Hour Exam I (C)</span><span>100 pts</span></div><div class="pp-meta"><span>Problems 1–5</span><span>Formula sheet allowed</span></div>',
        items: [
          {
            q: md`
              **Problem 1 (20 pts).** A point charge $q$ sits a height $d$ above an infinite grounded conducting plane.

              [[fig:p1]]

              (a) Find the induced surface charge density directly below $q$. (b) Within what radius of the point directly below $q$ does half of the total induced charge lie? (c) How much work must you do to pull $q$ away to infinity? (d) A second grounded plane is now added, parallel to the first, a distance $d$ above $q$. What is the force on $q$, and how many image charges does the new problem need?
            `,
            figs: { p1: { svg: planeQ(), cap: 'Charge above a grounded plane.' } },
            ans: md`
              - (a) $\sigma(0) = -\dfrac{q}{2\pi d^2}$.
              - (b) $s = \sqrt3\,d$.
              - (c) $W = \dfrac{q^2}{16\pi\varepsilon_0 d}$ (you do positive work).
              - (d) Zero force, by symmetry; infinitely many images.
            `,
            sol: md`
              **Boundary conditions:** (1) $V = 0$ on $z = 0$; (2) $V\to0$ far away. Region: $z>0$. Image: $-q$ at $z = -d$.

              **(a)** $\sigma = -\varepsilon_0\,\partial V/\partial z|_{0} = -\dfrac{qd}{2\pi(s^2+d^2)^{3/2}}$, where $s$ is the distance along the plane from the foot of the charge. At $s = 0$: $-\dfrac{q}{2\pi d^2}$.

              **(b)** Charge within radius $s$: $\displaystyle\int_0^{s}\sigma\,2\pi s'\,ds' = -q\left(1 - \frac{d}{\sqrt{s^2+d^2}}\right)$. Half of $-q$ when $\dfrac{d}{\sqrt{s^2+d^2}} = \dfrac12$, i.e. $s = \sqrt3\,d$. Most of the induced charge is within a couple of $d$ of the foot of the charge.

              **(c)** With $q$ at height $z$, the force is the image's pull, $\dfrac{q^2}{4\pi\varepsilon_0(2z)^2}$ toward the plane. Pulling it out: $W = \displaystyle\int_d^\infty\frac{q^2}{16\pi\varepsilon_0z^2}dz = \frac{q^2}{16\pi\varepsilon_0d}$. This is minus the system's energy $-\dfrac{q^2}{16\pi\varepsilon_0d}$, as it must be: the energy goes from that value to zero.

              **(d)** The charge is now midway between two grounded planes: by symmetry the forces from the two sides cancel, so $F = 0$ (an unstable equilibrium). The images: each plane reflects the charge and every image of the other plane, giving an infinite row of alternating charges spaced $2d$ apart.
            `,
          },
          {
            q: md`
              **Problem 2 (20 pts).** A grounded conducting sphere of radius $R$ is centered at the origin. A point charge $q$ is at distance $a = 2R$ from the center.

              [[fig:p2]]

              (a) Find the image charge and its position. (b) Find the ratio of the induced surface charge density at the point nearest $q$ to that at the farthest point. (c) Find the force on $q$. (d) If the sphere is instead isolated and neutral, what is the force on $q$?
            `,
            figs: { p2: { svg: sphereQ({ A: 120, alab: '2R' }), cap: 'Grounded sphere, charge at $2R$ from the center.' } },
            ans: md`
              - (a) $q' = -q/2$ at $R/2$ from the center, toward $q$.
              - (b) $\sigma_{\text{near}}/\sigma_{\text{far}} = \left(\dfrac{a+R}{a-R}\right)^3 = 27$.
              - (c) $\dfrac{2}{9}\dfrac{q^2}{4\pi\varepsilon_0R^2}$, attractive.
              - (d) $\dfrac{7}{72}\dfrac{q^2}{4\pi\varepsilon_0R^2}$, still attractive.
            `,
            sol: md`
              **Boundary conditions:** (1) $V = 0$ on $r = R$; (2) $V\to0$ as $r\to\infty$. Region: $r>R$.

              **(a)** $q' = -\dfrac Ra q = -\dfrac q2$ at $b = \dfrac{R^2}{a} = \dfrac R2$.

              **(b)** $\sigma(\theta)\propto\dfrac{1}{(R^2+a^2-2aR\cos\theta)^{3/2}}$, so $\dfrac{\sigma(0)}{\sigma(\pi)} = \left(\dfrac{R^2+a^2+2aR}{R^2+a^2-2aR}\right)^{3/2} = \left(\dfrac{a+R}{a-R}\right)^3 = 3^3 = 27$.

              **(c)** Distance $a - b = \tfrac32R$: $F = \dfrac{q(q/2)}{4\pi\varepsilon_0(3R/2)^2} = \dfrac29\dfrac{q^2}{4\pi\varepsilon_0R^2}$, toward the sphere.

              **(d)** Neutral and isolated: add $+q/2$ at the center (keeps $V$ constant on the sphere, makes the total zero). $F = \dfrac{q^2}{4\pi\varepsilon_0R^2}\left[-\dfrac{1/2}{(3/2)^2} + \dfrac{1/2}{2^2}\right] = \dfrac{q^2}{4\pi\varepsilon_0R^2}\left(-\dfrac{16}{72} + \dfrac{9}{72}\right) = -\dfrac{7}{72}\dfrac{q^2}{4\pi\varepsilon_0R^2}$: weaker, still attractive.
            `,
          },
          {
            q: md`
              **Problem 3 (20 pts).** A long square pipe $0\le x\le a$, $0\le y\le a$: the sides $x = 0$ and $x = a$ are grounded; the sides $y = 0$ and $y = a$ are both held at $V_0$ (insulated from the others).

              [[fig:p3]]

              (a) List the boundary conditions and write a form of the general solution that already satisfies the symmetric ones. (b) Find the coefficients. (c) What is $V$ at the center (no series needed)? Check with the first term. (d) What is $\vb E$ at the center?
            `,
            figs: { p3: { svg: squarePipe2(), cap: 'Top and bottom at $V_0$, sides grounded.' } },
            ans: md`
              - (a) $V = \sum_n C_n\sin\dfrac{n\pi x}{a}\cosh\dfrac{n\pi(y-a/2)}{a}$.
              - (b) $C_n = \dfrac{4V_0}{n\pi\cosh(n\pi/2)}$ for odd $n$, $0$ for even.
              - (c) $V_0/2$; the first term gives $0.507\,V_0$.
              - (d) $\vb E = 0$.
            `,
            sol: md`
              **Boundary conditions:** (1) $V(0,y) = 0$; (2) $V(a,y) = 0$; (3) $V(x,0) = V_0$; (4) $V(x,a) = V_0$.

              **(a)** Conditions 1 and 2 are the homogeneous pair, so $x$ gets $\sin(n\pi x/a)$ with $k = n\pi/a$. Then $Y'' = k^2Y$. Conditions 3 and 4 are identical, so $V$ is symmetric about $y = a/2$: use $\cosh\big(k(y - a/2)\big)$, which is even about the midline. (Using $A\cosh ky + B\sinh ky$ also works, with more algebra.)

              **(b)** At $y = 0$: $V_0 = \sum C_n\cosh(n\pi/2)\sin(n\pi x/a)$. Fourier: $C_n\cosh\dfrac{n\pi}{2} = \dfrac{2}{a}\displaystyle\int_0^aV_0\sin\frac{n\pi x}{a}dx = \frac{4V_0}{n\pi}$ (odd $n$). Condition 4 then holds automatically by symmetry.

              **(c)** Rotating the square by $90°$ swaps the roles of the faces: the "sides live" problem plus this one equals "all four faces at $V_0$", whose solution is $V_0$ everywhere. At the center the two are equal by symmetry, so each is $V_0/2$. First term: $\dfrac{4V_0}{\pi\cosh(\pi/2)}\sin\dfrac\pi2 = \dfrac{1.273}{2.509}V_0 = 0.507\,V_0$; the series sums to $0.500\,V_0$.

              **(d)** The center is symmetric under $x\to a-x$ and $y\to a-y$, so every component of $\vb E$ must vanish there. (It's a saddle point of $V$: highest along $y$, lowest along $x$.)
            `,
          },
          {
            q: md`
              **Problem 4 (20 pts).** A spherical shell of radius $R$ carries the surface charge $\sigma_0(\theta) = \sigma_0(3\cos^2\theta - 1)$. There are no other charges.

              [[fig:p4]]

              (a) What is the total charge? (b) Find $V$ inside and outside. (c) Find $\vb E$ inside, in Cartesian components. (d) How does $V$ fall off far away, and why?
            `,
            figs: { p4: { svg: sphereSigma(), cap: 'A shell with $\\sigma_0(3\\cos^2\\theta-1)$ glued on.' } },
            ans: md`
              - (a) $0$.
              - (b) $V_{\text{in}} = \dfrac{2\sigma_0}{5\varepsilon_0R}r^2P_2(\cos\theta)$, $V_{\text{out}} = \dfrac{2\sigma_0R^4}{5\varepsilon_0}\dfrac{P_2(\cos\theta)}{r^3}$.
              - (c) $\vb E = \dfrac{\sigma_0}{5\varepsilon_0R}(2x\,\uv x + 2y\,\uv y - 4z\,\uv z)$.
              - (d) As $1/r^3$: the leading term is the quadrupole.
            `,
            sol: md`
              **Boundary conditions:** (1) $V$ finite at $r = 0$; (2) $V\to0$ as $r\to\infty$; (3) $V$ continuous at $r = R$; (4) $\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma_0(\theta)}{\varepsilon_0}$ at $r = R$.

              **(a)** $3\cos^2\theta - 1 = 2P_2(\cos\theta)$ has no $P_0$ part, so $\displaystyle\int\sigma\,da = 0$.

              **(b)** Only $\ell = 2$ appears. Conditions 1–2: $V_{\text{in}} = A\,r^2P_2$, $V_{\text{out}} = B\,r^{-3}P_2$. Condition 3: $B = AR^5$. Condition 4: $-3AR - 2AR = -\dfrac{2\sigma_0}{\varepsilon_0}$, so $A = \dfrac{2\sigma_0}{5\varepsilon_0R}$.

              **(c)** $V_{\text{in}} = \dfrac{2\sigma_0}{5\varepsilon_0R}\cdot\dfrac{3z^2 - r^2}{2} = \dfrac{\sigma_0}{5\varepsilon_0R}(2z^2 - x^2 - y^2)$. Then $\vb E = -\nabla V = \dfrac{\sigma_0}{5\varepsilon_0R}(2x, 2y, -4z)$. Check: $\nabla\cdot\vb E = 0$ inside, as it must be with no charge there.

              **(d)** Zero monopole (no net charge) and zero dipole (the pattern is even in $z$): the first surviving term is $\ell = 2$, so $V\propto 1/r^3$.
            `,
          },
          {
            q: md`
              **Problem 5 (20 pts, short answers).** For each setup, give what's asked in one line.

              (a) Slot: grounded plates at $y = 0$ and $y = a$, end $x = 0$ at $V_0(y)$, open to $x\to\infty$. Which $x$-dependence goes with $\sin(n\pi y/a)$?
              (b) The same slot, but closed by a grounded plate at $x = b$. Which $x$-dependence now?
              (c) A sphere with given $V_0(\theta)$: which radial functions do you keep outside it?
              (d) A neutral metal sphere in a uniform field $E_0\uv z$: which $\ell$ appear in $V$ outside?
              (e) The region between two concentric spheres $a<r<b$ with potentials given on both: which radial functions?
              (f) An isolated conductor carrying total charge $Q$: what are its boundary conditions?
            `,
            ans: md`
              - (a) $e^{-n\pi x/a}$.
              - (b) $\sinh\big(n\pi(b - x)/a\big)$.
              - (c) $r^{-(\ell+1)}$ only.
              - (d) Only $\ell = 1$.
              - (e) Both $r^\ell$ and $r^{-(\ell+1)}$.
              - (f) $V = V_c$ (an unknown constant) on its surface, plus $\oint\sigma\,da = -\varepsilon_0\oint\dfrac{\partial V}{\partial n}da = Q$.
            `,
            sol: md`
              - (a) $V\to0$ as $x\to\infty$ kills $e^{+n\pi x/a}$.
              - (b) It must vanish at $x = b$: $\sinh\big(n\pi(b-x)/a\big)$ does, and still allows any value at $x = 0$.
              - (c) $V\to0$ at infinity kills $r^\ell$.
              - (d) The far field is $-E_0r\cos\theta$ (pure $\ell = 1$), and $V = $ const on the sphere is matched by adding $B_1\cos\theta/r^2$; no other $\ell$ is needed. The constant is zero for a neutral sphere ($B_0 = 0$).
              - (e) Neither $r = 0$ nor $r\to\infty$ is in the region, so nothing kills either family.
              - (f) The surface is an equipotential with an unknown value, fixed by requiring the total charge to be $Q$ (the second uniqueness theorem).
            `,
          },
        ],
      },
    ],
  };

  U5.lessons.push(chooser, mockA, mockB, mockC);
  U5.lessons.push(U5.lessons.splice(U5.lessons.findIndex((l) => l.id === 'x-quiz'), 1)[0]);   // quiz last
})();

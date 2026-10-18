/* Unit 6 — Exam 1 material, condensed (Lectures 1–8), plus Homework 1–3.
   Exam 2 is cumulative and the student aced Exam 1, so these lessons refresh rather than reteach: notation, the
   essentials in a few steps, one exam-style worked problem, mistakes, checks, drills and bank questions.
     R1  r1-coulomb-gauss   Coulomb's law, the Lorentz force, Gauss's law with symmetry, flux bookkeeping
     R2  r1-div-curl        divergence, curl, current density and continuity
     R3  r1-potential       electrostatic potential: V from E, E from V, Poisson, energy
     R4  r1-conductors      conductors, boundary conditions, charged plates, concentric shells
   Then HW 1–3 (unit e2-hw, ids hw1–hw3): every problem blank, answer boxes, full solutions (official keys checked).
   Generated problems carry their raw inputs in `_in` for the offline verifier; the page ignores that field. */
(function () {
  'use strict';
  const { R, RF, Q, G, P } = C;
  const { f, p, MC, one, sol } = EM;
  const { pick } = U;
  const EPS0 = EM.eps0, QE = 1.602e-19, ME = 9.109e-31, MP = 1.673e-27, K = 1 / (4 * Math.PI * EM.eps0);

  // a numeric part with a purely relative tolerance (the engine's absolute floor of 1e-9 would accept 0 for tiny answers)
  const N = (lbl, ans, unit, rel = 0.02) => Object.assign(EM.N(lbl, ans, unit, rel), { tol: { rel, abs: 0 } });
  const M = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // options shuffled
  const FX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // natural order kept

  // ---------------------------------------------------------------- TeX helpers
  const num = (x) => EM.p(+(+x).toPrecision(4));
  // a sum of terms [coef, body]: poly([[3, 'x^2'], [-1, 'y'], [2, '']]) -> '3x^2 - y + 2'
  const poly = (terms) => {
    const t = terms.filter(([c]) => c !== 0);
    if (!t.length) return '0';
    return t.map(([c, b], i) => {
      const a = Math.abs(c), m = b ? (a === 1 ? '' : num(a)) : num(a);
      return `${i ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '')}${m}${b}`;
    }).join('');
  };
  const vecTeX = (v) => poly([[v[0], '\\hat x'], [v[1], '\\hat y'], [v[2], '\\hat z']]);
  const PARA = String.fromCharCode(10, 10);                                          // a paragraph break inside joined text
  const cf = (v, s) => (v === 1 ? s : v === -1 ? `-${s}` : `${num(v)}\\,${s}`);       // coefficient of a symbol

  // ================================================================ figures
  // Gaussian surfaces: a sphere around a point, a cylinder around a line, a pillbox through a sheet
  function gSphere() {
    const g = PF.fig({ alt: 'a point charge at the center of a dashed Gaussian sphere; D points radially outward with the same size all over the sphere' });
    const c = 62;
    g.circle(c, c, 40, { cls: 'dash' });
    g.charge(c, c, { q: '+', lab: 'Q', at: 'r' });
    for (const a of [45, 135, 225, 315]) { const t = a * Math.PI / 180; g.arrow(c + 40 * Math.cos(t), c - 40 * Math.sin(t), c + 60 * Math.cos(t), c - 60 * Math.sin(t), { hs: 6 }); }
    g.label(c + 46, c - 50, '\\mathbf D', 'bl');
    return g.svg();
  }
  function gCyl() {
    const g = PF.fig({ alt: 'a vertical line charge inside a dashed coaxial Gaussian cylinder of radius r and length L; D points radially outward through the curved side only' });
    g.line(60, 4, 60, 128, { cls: 'thick' });
    g.label(65, 4, '\\rho_l', 'tl');
    g.ellipse(60, 30, 30, 8, { cls: 'dash' });
    g.ellipse(60, 102, 30, 8, { half: 'front', cls: 'dash' });
    g.ellipse(60, 102, 30, 8, { half: 'back', cls: 'dash dim' });
    g.line(30, 30, 30, 102, { cls: 'dash' }); g.line(90, 30, 90, 102, { cls: 'dash' });
    for (const y of [50, 84]) { g.arrow(90, y, 112, y, { hs: 6 }); g.arrow(30, y, 8, y, { hs: 6 }); }
    g.dim(60, 67, 90, 67, 'r');
    g.dim(124, 30, 124, 102, 'L');
    return g.svg();
  }
  function gBox() {
    const g = PF.fig({ alt: 'a horizontal sheet of charge cut by a dashed pillbox; D points up out of the top face and down out of the bottom face, each of size rho_s over 2' });
    g.line(4, 66, 128, 66, { cls: 'thick' });
    g.label(4, 70, '\\rho_s', 'tl');
    g.rect(44, 44, 44, 44, { cls: 'dash' });
    g.arrow(66, 44, 66, 14, { hs: 6 }); g.arrow(66, 88, 66, 118, { hs: 6 });
    g.label(72, 16, 'D_n = \\rho_s/2', 'l', 'small');
    return g.svg();
  }
  // the worked example of R1: two slabs, eps0 Ez(z)
  function slabPlot() {
    const D = (z) => (z < -2 ? 0 : z < 0 ? 3 * (z + 2) : z < 1 ? 6 - 6 * z : 0);
    return PF.plot({ w: 320, h: 190, x: [-3, 2], y: [0, 7], xl: 'z\\ (\\text{m})', yl: '\\epsilon_0E_z\\ (\\text{C/m}^2)', xt: [-3, -2, -1, 0, 1, 2], yt: [3, 6], curves: [{ f: D, n: 500 }], pts: [{ x: 0, y: 6, lab: '6' }] });
  }
  // a 5 x 5 sample of a 2-D field at the integer points -2..2 (math axes, y up)
  function quiver(F, alt) {
    const g = PF.fig({ alt });
    const c = 70, s = 26;
    g.axes(c, c, { x: [-64, 66], y: [-64, 66], xl: 'x', yl: 'y' });
    g.field((X, Y) => { const v = F((X - c) / s, (c - Y) / s); return v && [v[0], -v[1]]; }, [c - 2 * s, c - 2 * s, c + 2 * s, c + 2 * s], 5, 5, { mag: true, len: 20 });
    return g.svg();
  }
  // R3: the three axis-parallel legs from O to P
  function legsFig() {
    const g = PF.fig({ alt: 'three straight legs from the origin O to P: first along x, then along y, then along z' });
    g.setProj(40, 120, 1);
    g.axes3(110, { Lx: 200, Ly: 150, Lz: 100 });
    const O = [0, 0, 0], A = [150, 0, 0], B = [150, 110, 0], Pt = [150, 110, 70];
    g.l3(O, A, { cls: 'thick', mid: true, hs: 8 }); g.l3(A, B, { cls: 'thick', mid: true, hs: 8 }); g.l3(B, Pt, { cls: 'thick', mid: true, hs: 8 });
    const o = g.p3(...O), a = g.p3(...A), b = g.p3(...B), q = g.p3(...Pt);
    g.dot(q[0], q[1]); g.tag(q[0], q[1], 'P', 'tr');
    g.tag(o[0], o[1], 'O', 'tl');
    g.label((o[0] + a[0]) / 2 - 9, (o[1] + a[1]) / 2 - 12, '1', 'br', 'small');
    g.label((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 6, '2', 't', 'small');
    g.label(b[0] + 6, b[1] - 0.3 * (b[1] - q[1]), '3', 'l', 'small');
    return g.svg();
  }
  // R4: plates at z = 0 and 3 m with a charged sheet at z = 1 m
  function platesFig() {
    const g = PF.fig({ alt: 'grounded plate at z = 0, plate at 6 V at z = 3 m, charged sheet at z = 1 m held at -3 V; E points up (3 V/m) below the sheet and down (4.5 V/m) above it' });
    const y = (z) => 150 - 40 * z;
    g.plane(30, 230, y(0), { side: 'below' });
    g.plane(30, 230, y(3), { side: 'above' });
    g.line(30, y(1), 230, y(1), { cls: 'thick dash' });
    g.label(234, y(0), 'V = 0', 'l', 'small'); g.label(234, y(1), 'V = -3\\ \\text{V}', 'l', 'small'); g.label(234, y(3), 'V = 6\\ \\text{V}', 'l', 'small');
    for (const x of [56, 206]) { g.arrow(x, y(0.15), x, y(0.85), { hs: 7 }); g.arrow(x, y(2.85), x, y(1.15), { hs: 7 }); }
    g.label(72, y(0.5), 'E_1 = 3\\,\\hat z', 'l', 'small'); g.label(72, y(2), 'E_2 = -4.5\\,\\hat z', 'l', 'small');
    g.line(14, y(0), 14, y(3.4), { cls: 'dim', arrow: 'end', hs: 6 }); g.label(14, y(3.4) - 3, 'z', 'b', 'small accent');
    return g.svg();
  }
  // R4: concentric metal sphere and metal shell
  function shellsFig() {
    const g = PF.fig({ alt: 'a metal sphere of radius a carrying Q1 inside a concentric metal shell b < r < c carrying net Q2; the shell inner surface holds -Q1 and its outer surface Q1 + Q2' });
    const c = 90;
    g.circle(c, c, 78, { cls: 'shade' }); g.circle(c, c, 58, { cls: 'bgfill' }); g.circle(c, c, 24, { cls: 'shade' });
    g.circle(c, c, 78); g.circle(c, c, 58); g.circle(c, c, 24);
    g.label(c, c - 9, 'Q_1', 'c', 'small');
    g.line(c, c, c + 19.7, c + 13.8, { cls: 'dim thin' });
    g.label(c + 26, c + 18, 'a', 'c', 'small');
    g.label(c - 30, c - 30, '-Q_1', 'c', 'small');
    g.label(c + 70, c - 74, 'Q_1 + Q_2', 'bl', 'small');
    g.label(c, c + 54, 'b', 'b', 'small'); g.label(c, c + 82, 'c', 't', 'small');
    return g.svg();
  }

  // ================================================================ R1 — Coulomb's law, forces and Gauss's law
  EM.lesson('u6', {
    id: 'r1-coulomb-gauss', topic: 'R1', order: 1, ref: 'Lectures 1–5', title: "Coulomb's law, forces and Gauss's law",
    steps: [
      R(md`
        !!key Why you care
          Every past Exam 1 opens here: point-charge fields (Summer 2017 #1(a)), slabs and their $E_z(z)$ plot (Summer 2018 #1(a), Summer 2019 #1(a), Summer 2020 #2(a)), displacement flux through a plane (Summer 2018 #1(c), Summer 2020 #1(a)), Gauss's law around a line charge (Summer 2017 #1(b)). HW 1 #2–3, #6 and HW 2 #1–6 drill the same moves. On Exam 2 they come back as Ampère's law and current sheets.

        ### Notation

        - $Q$: a point charge (C). $\rho$, $\rho_s$, $\rho_l$: charge per volume (C/m³), per area (C/m²), per length (C/m). Some exams write $\lambda$ for $\rho_l$.
        - $\mathbf E$: electric field (V/m = N/C). $\mathbf D = \epsilon_0\mathbf E$: displacement field in free space (C/m²).
        - $\epsilon_0 = 8.854\times10^{-12}$ F/m $\approx 10^{-9}/36\pi$ F/m, the value that makes exam numbers clean.
        - $\mathbf r$: where you want the field. $\mathbf r_i$: where charge $i$ sits. $\mathbf r - \mathbf r_i$ points from the charge to the field point.
        - $\oint_S\mathbf D\cdot d\mathbf S$: **displacement flux** out of a closed surface $S$ (C), with $d\mathbf S$ pointing outward. $\oint_S\mathbf E\cdot d\mathbf S$: electric flux (V·m).
        - $Q_{enc}$: the charge inside $S$. $r$: distance from the axis (cylinders) or from the center (spheres).
        - $\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B)$: the Lorentz force (N) on a charge $q$ moving at velocity $\mathbf v$ (m/s) through $\mathbf B$ (T).

        ### The idea

        A point charge's field points away from it if positive, falls as $1/R^2$, and fields add:
        $$\mathbf E(\mathbf r) = \sum_i\frac{Q_i}{4\pi\epsilon_0}\,\frac{\mathbf r - \mathbf r_i}{|\mathbf r - \mathbf r_i|^3}$$
        Gauss's law counts the charge inside any closed surface: $\oint_S\mathbf D\cdot d\mathbf S = Q_{enc}$. It always holds. It hands you $\mathbf E$ only when symmetry makes $D_n$ constant on $S$.
      `),
      R(md`
        ### Step 1: superposition, and the force

        Charges written as multiples of $4\pi\epsilon_0$ keep the arithmetic clean: $Q = 4\pi\epsilon_0$ C at 1 m gives 1 V/m.

        A test charge feels $q\mathbf E$ at rest and $q(\mathbf E + \mathbf v\times\mathbf B)$ moving. The force at $\mathbf v = 0$ gives $\mathbf E$; two more velocities along different axes give all three components of $\mathbf B$ (HW 1 #3). The magnetic part is perpendicular to $\mathbf v$, so it does no work.
      `),
      Q(md`**Predict.** $Q = 4\pi\epsilon_0$ C at $(-1, 0, 0)$ m makes $\mathbf E = \hat x$ V/m at the origin. A charge $2Q$ is added at $(0, 0, Z)$, and the field at the origin turns to point along $(\hat x + \hat z)/\sqrt2$. $Z = $`,
        ['$-\\sqrt2$ m', '$+\\sqrt2$ m', '$-2$ m', '$-1$ m'], 0,
        [null, 'A positive charge above the origin pushes the field there **down**, along $-\\hat z$.', 'At 2 m, $2Q$ gives $2/4 = 0.5$ V/m; equal $x$ and $z$ parts need 1 V/m.', 'At 1 m, $2Q$ gives 2 V/m: the field would tilt past 45°.'],
        md`The new charge must add $+\hat z$ V/m. $2Q = 8\pi\epsilon_0$ C gives $2/Z^2$ V/m pointing away from itself, so it sits below the origin with $Z^2 = 2$: $Z = -\sqrt2$ m, and then $|\mathbf E| = \sqrt2$ V/m.`, { src: 'Summer 2017 Exam 1' }),
      RF(md`
        ### Step 2: Gauss's law with symmetry

        [[fig:gauss]]

        Choose a closed surface on which $D_n$ is constant where flux crosses and zero elsewhere. Then $D_n\times(\text{area carrying flux}) = Q_{enc}$:

        | Charge | Surface | Result |
        |---|---|---|
        | point $Q$, or any spherical $\rho(r)$ | sphere of radius $r$ | $D_r = Q_{enc}/4\pi r^2$ |
        | line $\rho_l$, or any cylindrical $\rho(r)$ | coaxial cylinder, radius $r$, length $L$ | $D_r = (Q_{enc}/L)/2\pi r$ |
        | sheet $\rho_s$ | pillbox through it | $D_n = \rho_s/2$ on each side, away from it if $\rho_s > 0$ |
        | slab $\rho$, thickness $W$, center $z_c$ | pillbox centered on $z_c$ | $D_z = \rho(z - z_c)$ inside, $\pm\rho W/2$ outside |

        Inside a uniform solid, $Q_{enc}$ grows as $r^3$ (sphere) or $r^2$ (cylinder), so $D_r = \rho r/3$ or $\rho r/2$: linear in $r$ and continuous at the surface. Outside, the solid looks like a point or a line.
      `, { gauss: { svg: PF.row([{ svg: gSphere(), cap: 'Sphere: $4\\pi r^2D_r = Q_{enc}$' }, { svg: gCyl(), cap: 'Cylinder: $2\\pi rL\\,D_r = Q_{enc}$' }, { svg: gBox(), cap: 'Pillbox: $2AD_n = \\rho_sA$' }]).svg } }),
      Q(md`**Predict.** A long cylinder of radius $R$ carries a uniform charge density $\rho_0$. $|\mathbf E|$ at $r = R/2$ is how many times $|\mathbf E|$ at $r = 3R$?`,
        ['$\\tfrac32$', '$1$', '$\\tfrac16$', '$\\tfrac92$'], 0,
        [null, 'Inside, $E$ grows as $r$; outside, it falls as $1/r$. The two radii are not mirror images.', 'That is the ratio of the radii; $E$ is proportional to $r$ only inside.', 'That is the answer for a **sphere**, whose outside field falls as $1/r^2$. A cylinder\'s falls as $1/r$.'],
        md`Inside, $E = \rho_0r/2\epsilon_0 = \rho_0R/4\epsilon_0$. Outside, $E = \rho_0R^2/2\epsilon_0r = \rho_0R/6\epsilon_0$. Ratio $\tfrac{1/4}{1/6} = \tfrac32$. HW 2 #4 has exactly these radii: $-1/9\epsilon_0$ V/m at 3 cm and $-1/6\epsilon_0$ V/m at 0.5 cm, with $R = 1$ cm.`),
      R(md`
        ### Step 3: flux bookkeeping, and stacking planes

        - A closed surface sees only $Q_{enc}$. Charge outside sends in as much flux as it takes out.
        - An infinite plane catches **half** of a point charge's flux, $Q/2$, at any distance. Count it $+$ if the lines cross in the direction you were asked about, $-$ if against.
        - A charge at the center of a cube sends $Q/6$ through each face.

        Planar charge (sheets and slabs) simply adds. Each layer pushes $\mathbf D$ away from itself with half of its charge per area, so at height $z$
        $$D_z(z) = \tfrac12\left[\sigma_{\text{below}}(z) - \sigma_{\text{above}}(z)\right]$$
        where $\sigma$ is the total charge per area below or above $z$ (a slab counts $\rho$ times the thickness on that side). A neutral stack has no field outside it.
      `),
      Q(md`**Predict.** $Q_1$ sits at $(1, 0, 0)$ and $Q_2$ at $(-1, 0, 0)$. The displacement flux through the whole $x = 0$ plane, counted in the $+\hat x$ direction, is…`,
        ['$(Q_2 - Q_1)/2$', '$(Q_1 - Q_2)/2$', '$(Q_1 + Q_2)/2$', '$Q_2 - Q_1$'], 0,
        [null, 'Signs swapped: $Q_1$ is on the $+x$ side, so its lines cross the plane toward $-x$.', 'That treats both charges as if they sat on the same side.', 'A plane catches only half of each charge\'s flux.'],
        md`$Q_2$ (on the $-x$ side) sends $Q_2/2$ across along $+\hat x$; $Q_1$ (on the $+x$ side) sends $Q_1/2$ across along $-\hat x$, which counts as $-Q_1/2$. HW 2 #3 and Summer 2020 #1(a) give two such fluxes and ask for both charges.`),
      RF(md`
        ### The method

        !!method Fields from charge
          1. **Symmetry:** which way can $\mathbf E$ point, and what can it depend on? Spherical, cylindrical, planar, or none.
          2. **No symmetry:** superpose point-charge fields, or the table's lines, sheets and slabs.
          3. **Symmetry:** pick the Gaussian surface, count $Q_{enc}$, divide by the area that carries flux. Then $\mathbf E = \mathbf D/\epsilon_0$.
          4. **Check:** the sign (away from positive charge), continuity of $E$ wherever there is no surface charge, and the far field ($Q_{tot}/4\pi\epsilon_0r^2$ for anything finite).

        ### Worked example

        !!graded Problem
          Slab 1 fills $-2 < z < 0$ m with $\rho_1 = +3$ C/m³; slab 2 fills $0 < z < 1$ m with $\rho_2 = -6$ C/m³; free space elsewhere. Find $E_z$ at $z = -3, -1, 0, 0.5$ and $2$ m, and sketch $E_z(z)$.

        **1. Symmetry.** The slabs are infinite in $x$ and $y$, so $\mathbf E = E_z(z)\,\hat z$ and $D_z = \tfrac12(\sigma_{\text{below}} - \sigma_{\text{above}})$.

        **2. Charge per area.** Slab 1: $(3\ \text{C/m}^3)(2\ \text{m}) = 6$ C/m². Slab 2: $(-6\ \text{C/m}^3)(1\ \text{m}) = -6$ C/m². The stack is neutral, so $E_z = 0$ for $z < -2$ m and $z > 1$ m: at $z = -3$ m and $z = 2$ m.

        **3. Inside.** With zero net charge, $\sigma_{\text{above}} = -\sigma_{\text{below}}$ and $D_z(z) = \sigma_{\text{below}}(z)$:
        $$D_z(-1) = (3)(1) = 3\ \text{C/m}^2,\qquad D_z(0) = 6\ \text{C/m}^2,\qquad D_z(0.5) = 6 + (-6)(0.5) = 3\ \text{C/m}^2$$
        so $E_z = 3/\epsilon_0 = 3.39\times10^{11}$ V/m at $z = -1$ m and at $z = 0.5$ m, and $E_z = 6/\epsilon_0 = 6.78\times10^{11}$ V/m at $z = 0$.

        [[fig:slab]]

        **4. Sketch.** Straight lines with slope $dE_z/dz = \rho/\epsilon_0$ inside each slab ($\nabla\cdot\mathbf D = \rho$), zero outside: a triangle peaking at the interface.

        **5. Check.** Between the positive and the negative layer the field points from $+$ to $-$: along $+\hat z$. ✓ There is no sheet charge, so $E_z$ has no jumps. ✓

        !!mistake Common mistakes
          - A sheet gives $\rho_s/2\epsilon_0$ on each side. $\rho_s/\epsilon_0$ is the field just outside a **conductor**, or between two opposite sheets.
          - Using the total charge of a uniform sphere or cylinder where you need the charge **enclosed** by the Gaussian surface.
          - Applying Gauss's law with no symmetry. A finite patch looks like a sheet from close up and like a point charge from far away (Summer 2018 #1(b)).
          - Losing the sign of a plane flux: $+Q/2$ only for lines that cross in the asked direction.
          - Mixing the two fluxes: $\oint\mathbf D\cdot d\mathbf S = Q_{enc}$ in C, $\oint\mathbf E\cdot d\mathbf S = Q_{enc}/\epsilon_0$ in V·m.
          - In cylindrical problems $r$ is the distance from the axis, not from the origin.

        ### Check questions
      `, { slab: { svg: slabPlot(), cap: '$\\epsilon_0E_z(z)$: zero outside the neutral pair, rising through the positive slab, falling through the negative one.' } }),
      Q(md`The plane $z = 0$ carries $\rho_s = -4$ C/m², and the rest of space is a dielectric with $\epsilon = 2\epsilon_0$. The outward flux $\oint\mathbf D\cdot d\mathbf S$ through a sphere of radius 2 m centered at the origin is…`,
        ['$-16\\pi$ C', '$-64\\pi$ C', '$-8\\pi$ C', '$-4\\pi$ C'], 0,
        [null, 'That multiplies $\\rho_s$ by the sphere\'s surface area $4\\pi(2)^2$. The enclosed charge lies on the disk where the plane cuts the sphere, area $\\pi(2)^2$.', 'That divides by $\\epsilon_r = 2$. The flux of $\\mathbf D$ counts free charge, whatever the medium.', 'That uses a disk of radius 1 m.'],
        md`$Q_{enc} = \rho_s\,\pi(2\ \text{m})^2 = -16\pi$ C, and $\oint\mathbf D\cdot d\mathbf S = Q_{enc}$ regardless of $\epsilon$.`, { src: 'Spring 2018 Exam 1' }),
      Q(md`A line charge $\rho_l = 2$ C/m lies on the $z$-axis. The flux of $\mathbf D$ through the curved side of a coaxial cylinder ($r = 1$ m, length 2 m) is 4 C. Now the line charge is removed everywhere **outside** the cylinder; the 2 m inside remain. The flux through the curved side…`,
        ['drops below 4 C', 'stays 4 C', 'drops to zero', 'rises above 4 C'], 0,
        [null, 'The closed-surface flux stays 4 C, but a finite segment\'s field is not purely radial: part of its flux now leaves through the end caps.', 'The enclosed segment still sends out 4 C of flux, most of it through the side.', 'The caps now carry outward flux, so the side must carry less than the 4 C total, not more.'],
        md`With the infinite line, symmetry makes $\mathbf D$ radial and the caps carry nothing: all 4 C cross the side. A finite segment's field fans out near its ends, so the caps take part of the 4 C and the side carries less. Gauss's law (for the closed surface) is unchanged.`, { src: 'Summer 2017 Exam 1' }),
      Q(md`A 1 m × 1 m square patch centered at the origin on $z = 0$ carries $\rho_s = -2$ C/m². A good approximation of $\mathbf D$ on the $z$-axis **1 km** above it is…`,
        ['$-\\hat z\\,\\dfrac{1}{2\\pi\\times10^6}$ C/m²', '$-\\hat z$ C/m²', '$+\\hat z\\,\\dfrac{1}{2\\pi\\times10^6}$ C/m²', '$-\\hat z\\,\\dfrac{2}{\\pi\\times10^6}$ C/m²'], 0,
        [null, 'That is the sheet value $\\rho_s/2$, good only within a small fraction of a meter of the patch.', 'Negative charge pulls $\\mathbf D$ toward itself: downward above the patch.', 'That drops the 4 of $4\\pi r^2$.'],
        md`From 1 km the patch is a point charge $Q = \rho_sA = -2$ C: $D = Q/4\pi r^2 = -2/(4\pi\times10^6) = -1/(2\pi\times10^6)$ C/m², along $-\hat z$. From 1 cm it would be the sheet value, $-\hat z$ C/m².`, { src: 'Summer 2018 Exam 1' }),
      Q(md`$Q_1 = 2$ C sits at $(1, 0, 0)$ m and $Q_2 = -2$ C at $(-2, 0, 0)$ m. The flux $\int\mathbf D\cdot\hat x\,dy\,dz$ through the entire $x = 0$ plane is…`,
        ['$-2$ C', '$0$', '$+2$ C', '$-4$ C'], 0,
        [null, 'Zero net charge matters for a **closed** surface. A plane is open: each charge sends half its flux through it.', 'Both contributions point along $-\\hat x$: $Q_1$\'s lines leave it toward $-x$, and $Q_2$ pulls lines toward $-x$.', 'Each charge sends only half its flux through the plane.'],
        md`$Q_2$ on the $-x$ side: $+Q_2/2 = -1$ C. $Q_1$ on the $+x$ side: $-Q_1/2 = -1$ C. Total $-2$ C. The distances do not matter for an infinite plane.`, { src: 'Summer 2018 Exam 1' }),
      Q(md`Sheets with $+\rho_s$ on $z = 0$ and $-\rho_s$ on $z = d$. $E_z$ between them and above both is…`,
        ['$\\rho_s/\\epsilon_0$ between, $0$ above', '$\\rho_s/2\\epsilon_0$ between, $0$ above', '$\\rho_s/\\epsilon_0$ between and above', '$0$ between, $\\rho_s/\\epsilon_0$ above'], 0,
        [null, 'Between them both sheets push along $+z$: their halves add.', 'Above both, the two sheets push in opposite directions with equal strength.', 'Between them the fields add; outside they cancel.'],
        md`Each sheet gives $\rho_s/2\epsilon_0$, away from the positive one and toward the negative one. Between them both point along $+z$: $\rho_s/\epsilon_0$. Outside they cancel. This is the parallel-plate capacitor.`),
      Q(md`A charged bead hovers motionless 1 cm above a large horizontal sheet of uniform $\rho_s > 0$ (gravity down). You lift it to 2 cm and let go. It…`,
        ['stays put', 'falls back to 1 cm', 'accelerates upward', 'falls, because the field at 2 cm is a quarter as strong'], 0,
        [null, 'There is no restoring force: $QE$ and $mg$ are the same at every height.', 'Neither force changed, so the balance still holds.', 'Inverse-square fall-off belongs to point charges; an infinite sheet\'s field is uniform.'],
        md`$E = \rho_s/2\epsilon_0$ everywhere above the sheet, so $QE = mg$ holds at any height. HW 2 #1: $Q = 2\epsilon_0mg/\rho_s$.`),
      Q(md`A point charge $Q$ sits inside a closed cube, off center, near one face. The total $\oint\mathbf D\cdot d\mathbf S$ out of the cube is…`,
        ['$Q$', '$Q/6$', '$Q/\\epsilon_0$', 'it depends on where the charge sits'], 0,
        [null, 'That is one face\'s share when the charge is at the center.', 'That is the flux of $\\mathbf E$, not of $\\mathbf D$.', 'The position changes how the flux splits among the faces, not the total.'],
        md`Gauss's law: the total is $Q_{enc} = Q$ for any closed surface and any position inside. The near face gets more than $Q/6$, the far face less.`),
      Q(md`A solid sphere of radius $a$ carries uniform $\rho$. $|\mathbf E|$ is largest…`,
        ['at $r = a$', 'at the center', 'far away', 'nowhere in particular: it is uniform inside'], 0,
        [null, 'At the center $Q_{enc} = 0$, so $E = 0$.', 'Outside it falls as $1/r^2$.', 'Inside it grows linearly, $E = \\rho r/3\\epsilon_0$.'],
        md`$E = \rho r/3\epsilon_0$ inside and $\rho a^3/3\epsilon_0r^2$ outside: the peak is at the surface.`),
      R(md`
        ### Rapid fire: Gauss and superposition

        **The trick:** symmetry first. Sheets give $\rho_s/2$ per side, planes catch half a point charge's flux, closed surfaces see only what is inside.

        Short questions with new numbers every time: answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_r1_gauss', { need: 8 }), { id: 'r1-coulomb-gauss.r0' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('r1_slabs', { need: 2 }),
      G('r1_ball', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- R1 rapid fire
  GENS.rf_r1_gauss = () => one([
    // two parallel sheets: D_x at a point left of, between or right of them
    () => {
      const S = [-8, -6, -4, -2, 2, 4, 6, 8];
      const s1 = pick(S), s2 = pick(S), where = pick(['left', 'between', 'right']);
      const d1 = where === 'left' ? -s1 / 2 : s1 / 2;           // sheet 1 on x = -1
      const d2 = where === 'right' ? s2 / 2 : -s2 / 2;          // sheet 2 on x = +1
      const D = d1 + d2;
      const pt = { left: '(-2, 0, 0)', between: '(0, 0, 0)', right: '(2, 0, 0)' }[where];
      const o = (v) => `$${num(v)}$ C/m²`;
      return Object.assign(MC('Two sheets', md`Sheets with $\rho_{s1} = ${s1}$ C/m² on $x = -1$ m and $\rho_{s2} = ${s2}$ C/m² on $x = 1$ m. $D_x$ at $${pt}$ m is…`, o(D),
        [[o(-D), 'Sign: a sheet pushes $\\mathbf D$ away from itself if positive, toward itself if negative.'], [o(2 * D), 'Each sheet gives half its charge per area on each side, not all of it.'],
          [o(where === 'between' ? (s1 + s2) / 2 : (s1 - s2) / 2), 'Between the sheets, like charges push in opposite directions; outside both, they push the same way.'], [o(2 * d1 + d2), 'That counts sheet 1 with its full $\\rho_s$; each side gets half.']],
        md`Sheet 1 gives $${num(d1)}$, sheet 2 gives $${num(d2)}$ (each $\pm\rho_s/2$, away from a positive sheet): $D_x = ${num(D)}$ C/m².`), { _in: { s1, s2, where, D } });
    },
    // half the flux through an infinite plane
    () => {
      const S = [-6, -4, -3, -2, -1, 1, 2, 3, 4, 6];
      const q1 = pick(S), q2 = pick(S), a = pick([1, 2, 3]), b = pick([1, 2, 5]);
      const F = (q2 - q1) / 2;                                  // Q2 (x < 0) adds +Q2/2, Q1 (x > 0) adds -Q1/2
      const o = (v) => `$${num(v)}$ C`;
      return Object.assign(MC('Flux through a plane', md`$Q_1 = ${q1}$ C at $(${a}, 0, 0)$ m and $Q_2 = ${q2}$ C at $(-${b}, 0, 0)$ m. The flux of $\mathbf D$ through the whole plane $x = 0$, along $+\hat x$, is…`, o(F),
        [[o(-F), '$Q_1$ is on the $+x$ side: its flux crosses toward $-x$.'], [o(q2 - q1), 'An infinite plane catches half of each charge\'s flux.'], [o((q1 + q2) / 2), 'The charges sit on opposite sides, so their crossings count with opposite signs.'], [o(q2 / 2), 'That leaves out $Q_1$: half its flux crosses the plane too.']],
        md`$+Q_2/2 - Q_1/2 = \big(${q2} - (${q1})\big)/2 = ${num(F)}$ C, independent of the distances.`), { _in: { q1, q2, F } });
    },
    // how Gauss fields scale
    () => {
      const [q, r, w] = pick([
        ['a uniform solid sphere of radius $a$: $E(a/2)/E(a)$', '$\\tfrac12$', [['$\\tfrac14$', 'Inside a uniform sphere $E \\propto r$, not $r^2$.'], ['$\\tfrac18$', 'That is the enclosed-charge ratio; divide by the area too.'], ['$2$', 'Inside the sphere the field grows outward.']]],
        ['a uniform solid sphere of radius $a$: $E(2a)/E(a)$', '$\\tfrac14$', [['$\\tfrac12$', 'Outside, a sphere is a point charge: $1/r^2$.'], ['$\\tfrac18$', 'The enclosed charge stops growing at $r = a$.'], ['$1$', 'The field falls outside.']]],
        ['a long uniform cylinder of radius $a$: $E(2a)/E(a)$', '$\\tfrac12$', [['$\\tfrac14$', 'A line\'s field falls as $1/r$, not $1/r^2$.'], ['$1$', 'The field falls outside.'], ['$2$', 'The field falls outside.']]],
        ['a long uniform cylinder of radius $a$: $E(a/2)/E(a)$', '$\\tfrac12$', [['$\\tfrac14$', 'Inside, $E = \\rho r/2\\epsilon_0$: linear in $r$.'], ['$2$', 'Inside, the field grows outward.'], ['$\\tfrac18$', 'The charge per length grows as $r^2$; then divide by $2\\pi r$.']]],
        ['a thin spherical shell of charge, radius $a$: $E(a/2)/E(2a)$', '$0$', [['$4$', 'Inside a shell $Q_{enc} = 0$.'], ['$\\tfrac14$', 'Inside a shell $Q_{enc} = 0$.'], ['$1$', 'Inside a shell $Q_{enc} = 0$.']]],
        ['an infinite sheet: $E(2\\ \\text{m})/E(1\\ \\text{m})$', '$1$', [['$\\tfrac12$', 'A sheet\'s field does not fall with distance.'], ['$\\tfrac14$', 'Inverse square belongs to point charges.'], ['$2$', 'It does not grow either.']]],
      ]);
      return MC('Scaling', md`For ${q} = `, r, w, md`$Q_{enc}$ over the flux-carrying area. Sphere: $r^3/r^2$ inside, $1/r^2$ outside. Cylinder: $r^2/r$ inside, $1/r$ outside. Sheet: constant.`);
    },
    // enclosed charge only
    () => {
      const R0 = pick([2, 3, 4]);
      const qs = [pick([-5, -3, -2, 2, 3, 5]), pick([-4, -1, 1, 4]), pick([-6, -2, 2, 6])];
      const Qin = qs[0] + qs[1];
      const o = (v) => `$${num(v)}$ C`;
      return Object.assign(MC('Enclosed charge', md`Point charges $${qs[0]}$ C at the origin, $${qs[1]}$ C at $(0, 0, ${R0 - 1})$ m and $${qs[2]}$ C at $(${R0 + 1}, 0, 0)$ m. $\oint\mathbf D\cdot d\mathbf S$ out of the sphere of radius ${R0} m centered at the origin is…`, o(Qin),
        [[o(Qin + qs[2]), `The $${qs[2]}$ C charge is outside: its flux enters and leaves.`], [o(qs[0]), `The charge at $z = ${R0 - 1}$ m is inside the sphere too.`], [o(-Qin), 'The outward flux has the sign of the enclosed charge.'], [o(qs[0] + qs[2]), 'Check which charges are within the radius.']],
        md`Inside: $${qs[0]} + (${qs[1]}) = ${Qin}$ C. The charge at $${R0 + 1}$ m is outside the ${R0} m sphere and contributes no net flux.`), { _in: { qs, R0, Qin } });
    },
    // Coulomb at the origin from a charge on an axis
    () => {
      const k = pick([1, 2, 4, 8, 9]), d = pick([1, 2, 3]), ax = pick(['x', 'y', 'z']), s = pick([1, -1]), sq = pick([1, -1]);
      const mag = k / (d * d), dir = -s * sq;                  // field at the origin points away from a positive charge
      const o = (m, ds) => `$${num(m)}$ V/m along $${ds > 0 ? '+' : '-'}\\hat ${ax}$`;
      return Object.assign(MC('Coulomb', md`$Q = ${sq < 0 ? '-' : ''}${k === 1 ? '' : `${k}\\,`}(4\pi\epsilon_0)$ C sits at $${s * d}\,\hat ${ax}$ m. $\mathbf E$ at the origin is…`, o(mag, dir),
        [[o(mag, -dir), sq > 0 ? 'A positive charge pushes the field away from itself.' : 'A negative charge pulls the field toward itself.'], [o(k / d, dir), 'Inverse **square**: divide by $d^2$.'], [o(k * d * d, dir), 'Divide by $d^2$; do not multiply.'], [o(mag / (4 * Math.PI), dir), 'The $4\\pi\\epsilon_0$ in $Q$ cancels the one in Coulomb\'s law.']],
        md`$|\mathbf E| = \dfrac{|Q|}{4\pi\epsilon_0d^2} = \dfrac{${k}}{${d * d}}$ V/m, pointing ${sq > 0 ? 'away from' : 'toward'} the charge.`), { _in: { k, d, s, sq, mag, dir } });
    },
  ]);

  // ---------------------------------------------------------------- R1 problems
  // planar stack: charge per area below and above z (slabs {a, b, rho}, sheets {at, s})
  const stackSides = (layers, z) => {
    let below = 0, above = 0;
    for (const L of layers) {
      if (L.s !== undefined) { if (L.at < z) below += L.s; else above += L.s; continue; }
      const lo = Math.min(Math.max(z, L.a), L.b);
      below += L.rho * (lo - L.a); above += L.rho * (L.b - lo);
    }
    return { below, above, D: (below - above) / 2 };
  };
  GENS.r1_slabs = () => {
    let g = null;
    for (let k = 0; k < 200 && !g; k++) {
      const w1 = pick([1, 2]), w2 = pick([1, 2]), gap = pick([0, 1, 2]);
      const a1 = -w1 - (gap === 2 ? 1 : 0), b1 = a1 + w1, a2 = b1 + gap, b2 = a2 + w2;
      const r1 = pick([-6, -4, -3, -2, 2, 3, 4, 6]), r2 = pick([-6, -4, -3, -2, 2, 3, 4, 6]);
      const sheet = gap === 2 && pick([true, false]) ? { at: b1 + 1, s: pick([-4, -2, 2, 4]) } : null;
      const layers = [{ a: a1, b: b1, rho: r1 }, { a: a2, b: b2, rho: r2 }].concat(sheet ? [sheet] : []);
      const zs = [a1 - 1, a1 + w1 / 2, gap ? b1 + 0.5 : a2 + w2 / 2, b2 + 1];
      const sides = zs.map((z) => stackSides(layers, z));
      if (sides.every((s) => Math.abs(s.D) > 1e-9)) g = { w1, w2, gap, a1, b1, a2, b2, r1, r2, sheet, layers, zs, sides };
    }
    const { a1, b1, a2, b2, r1, r2, sheet, zs, sides } = g;
    const s1 = r1 * (b1 - a1), s2 = r2 * (b2 - a2), net = s1 + s2 + (sheet ? sheet.s : 0);
    const zt = (z) => num(z);
    return {
      title: 'Slabs of charge',
      q: md`Slab 1 fills $${zt(a1)} < z < ${zt(b1)}$ m with $\rho_1 = ${r1}$ C/m³; slab 2 fills $${zt(a2)} < z < ${zt(b2)}$ m with $\rho_2 = ${r2}$ C/m³${sheet ? `; a sheet with $\\rho_s = ${sheet.s}$ C/m² lies on $z = ${zt(sheet.at)}$ m` : ''}. Free space elsewhere. Find $\epsilon_0E_z = D_z$ at $z = ${zs.map(zt).join(',\\ ')}$ m.`,
      parts: zs.map((z, i) => N(`$\\epsilon_0E_z(${zt(z)}\\ \\text{m})$`, sides[i].D, 'C/m^2')),
      hints: ['Each layer pushes $\\mathbf D$ away from itself (if positive) with half of its charge per area.', 'Add the charge per area below and above each point: $D_z = \\tfrac12(\\sigma_{\\text{below}} - \\sigma_{\\text{above}})$. A slab counts $\\rho$ times the thickness on each side of $z$.'],
      sol: sol({
        eq: md`$D_z(z) = \tfrac12\left[\sigma_{\text{below}}(z) - \sigma_{\text{above}}(z)\right]$ (superposed sheets and slabs).`,
        sym: md`Charge per area: slab 1 $${r1}\times${b1 - a1} = ${s1}$ C/m², slab 2 $${r2}\times${b2 - a2} = ${s2}$ C/m²${sheet ? `, sheet $${sheet.s}$ C/m²` : ''}; net $${num(net)}$ C/m², so outside the stack $|D_z| = ${num(Math.abs(net) / 2)}$ C/m².`,
        sub: zs.map((z, i) => `$z = ${zt(z)}$ m: $\\sigma_{\\text{below}} = ${num(sides[i].below)}$, $\\sigma_{\\text{above}} = ${num(sides[i].above)}$, $D_z = ${num(sides[i].D)}$ C/m².`).join(PARA),
        ans: md`$\epsilon_0E_z = ${zs.map((z, i) => num(sides[i].D)).join(',\\ ')}$ C/m² at $z = ${zs.map(zt).join(',\\ ')}$ m (divide by $\epsilon_0$ for V/m).`,
        check: md`Below everything $D_z = -\sigma_{net}/2$, above everything $+\sigma_{net}/2$: field away from a net positive stack. Inside a slab the slope is $\rho$${sheet ? '; across the sheet $D_z$ jumps by $\\rho_s$' : ''}.`,
      }),
      _in: { layers: g.layers, zs, D: sides.map((s) => s.D) },
    };
  };

  GENS.r1_ball = () => {
    const shape = pick(['sphere', 'cylinder']);
    const rhoN = pick([1, 2, 5, 10, 20]), rho = rhoN * 1e-9;           // C/m^3
    const Rcm = pick([2, 5, 10, 20]), R = Rcm / 100;
    const fin = pick([0.25, 0.5, 0.8]), fout = pick([2, 3, 4]);
    const rin = fin * R, rout = fout * R;
    const sph = shape === 'sphere';
    const Qtot = sph ? rho * 4 / 3 * Math.PI * R ** 3 : rho * Math.PI * R ** 2;
    const Ein = sph ? rho * rin / (3 * EPS0) : rho * rin / (2 * EPS0);
    const Eout = sph ? Qtot / (4 * Math.PI * EPS0 * rout ** 2) : Qtot / (2 * Math.PI * EPS0 * rout);
    return {
      title: sph ? 'Uniform sphere of charge' : 'Uniform cylinder of charge',
      q: md`A ${sph ? 'sphere' : 'long cylinder'} of radius $R = ${Rcm}$ cm carries a uniform charge density $\rho = ${rhoN}$ nC/m³ in free space. Find ${sph ? 'its total charge' : 'its charge per unit length'}, and $|\mathbf E|$ at ${sph ? 'distances' : 'distances from the axis'} $r = ${num(rin * 100)}$ cm and $r = ${num(rout * 100)}$ cm.`,
      parts: [N(sph ? '$Q$' : '$\\rho_l$', Qtot * 1e12, sph ? 'pC' : 'pC/m'), N(`$|\\mathbf E|$ at $${num(rin * 100)}$ cm`, Ein, 'V/m'), N(`$|\\mathbf E|$ at $${num(rout * 100)}$ cm`, Eout, 'V/m')],
      hints: [sph ? 'Gaussian sphere: $4\\pi r^2D = Q_{enc}$, with $Q_{enc} = \\rho\\tfrac43\\pi r^3$ inside.' : 'Gaussian cylinder: $2\\pi rL\\,D = Q_{enc}$, with $Q_{enc} = \\rho\\pi r^2L$ inside.', `Inside: $E = \\rho r/${sph ? 3 : 2}\\epsilon_0$. Outside: ${sph ? '$Q/4\\pi\\epsilon_0r^2$' : '$\\rho_l/2\\pi\\epsilon_0r$'}. Lengths in meters.`],
      sol: sol({
        eq: sph ? md`$4\pi r^2\,\epsilon_0E = Q_{enc}(r)$.` : md`$2\pi rL\,\epsilon_0E = Q_{enc}(r)$.`,
        sym: sph ? md`$Q = \tfrac43\pi R^3\rho$; inside $E = \rho r/3\epsilon_0$; outside $E = Q/4\pi\epsilon_0r^2$.` : md`$\rho_l = \pi R^2\rho$; inside $E = \rho r/2\epsilon_0$; outside $E = \rho_l/2\pi\epsilon_0r$.`,
        sub: sph
          ? md`$$Q = \tfrac43\pi(${R}\ \text{m})^3(${rhoN}\times10^{-9}\ \text{C/m}^3) = ${f(Qtot)}\ \text{C},\quad E(${num(rin)}\ \text{m}) = \frac{(${rhoN}\times10^{-9})(${num(rin)})}{3\epsilon_0} = ${f(Ein)}\ \text{V/m},\quad E(${num(rout)}\ \text{m}) = \frac{Q}{4\pi\epsilon_0(${num(rout)})^2} = ${f(Eout)}\ \text{V/m}$$`
          : md`$$\rho_l = \pi(${R}\ \text{m})^2(${rhoN}\times10^{-9}\ \text{C/m}^3) = ${f(Qtot)}\ \text{C/m},\quad E(${num(rin)}\ \text{m}) = \frac{(${rhoN}\times10^{-9})(${num(rin)})}{2\epsilon_0} = ${f(Ein)}\ \text{V/m},\quad E(${num(rout)}\ \text{m}) = \frac{\rho_l}{2\pi\epsilon_0(${num(rout)})} = ${f(Eout)}\ \text{V/m}$$`,
        ans: md`${sph ? '$Q$' : '$\\rho_l$'} $= ${f(Qtot * 1e12)}$ ${sph ? 'pC' : 'pC/m'}; $|\mathbf E| = ${f(Ein)}$ V/m and $${f(Eout)}$ V/m, pointing radially outward.`,
        check: md`At $r = R$ both formulas give $\rho R/${sph ? 3 : 2}\epsilon_0 = ${f(sph ? rho * R / (3 * EPS0) : rho * R / (2 * EPS0))}$ V/m: the field is continuous at the surface.`,
      }),
      _in: { shape, rho, R, rin, rout, Qtot, Ein, Eout },
    };
  };

  // ---------------------------------------------------------------- R1 bank
  EM.BANK['r1-coulomb-gauss'] = [
    Q(md`$Q = 4\pi\epsilon_0$ C is 2 m away. The field strength it makes is…`,
      ['0.25 V/m', '0.5 V/m', '1 V/m', '$\\tfrac{1}{16\\pi}$ V/m'], 0,
      [null, 'That divides by $d$, not $d^2$.', 'That is the value at 1 m.', 'The $4\\pi\\epsilon_0$ in $Q$ cancels the one in Coulomb\'s law.'],
      md`$E = Q/4\pi\epsilon_0d^2 = 1/4$ V/m.`),
    Q(md`$+Q$ and $-Q$ sit $2d$ apart. At the midpoint, $\mathbf E$…`,
      ['has size $2Q/4\\pi\\epsilon_0d^2$, pointing toward $-Q$', 'is zero', 'has size $Q/4\\pi\\epsilon_0d^2$, toward $-Q$', 'has size $2Q/4\\pi\\epsilon_0d^2$, toward $+Q$'], 0,
      [null, 'Zero is the midpoint of two **equal** charges. Here both fields point the same way.', 'Both charges contribute equally; the fields add.', 'Fields point away from positive and toward negative charge: toward $-Q$.'],
      md`Away from $+Q$ and toward $-Q$ is the same direction at the midpoint, so the two equal fields add.`),
    Q(md`Inside a thin, uniformly charged spherical shell, $\mathbf E$ is…`,
      ['zero', 'uniform and nonzero', 'largest at the center', 'that of a point charge at the center'], 0,
      [null, 'A Gaussian sphere inside the shell encloses no charge, and symmetry makes $D_r$ constant on it.', 'Zero: $Q_{enc} = 0$.', 'The point-charge field holds only outside the shell.'],
      md`$4\pi r^2D_r = Q_{enc} = 0$ for $r$ inside the shell.`),
    Q(md`A point charge sits **outside** a closed surface. The net flux of $\mathbf D$ through the surface is…`,
      ['zero', 'half the charge', 'the charge times the solid angle the surface covers', 'negative'], 0,
      [null, 'Half the flux is what an infinite open plane catches.', 'Every line that enters also leaves.', 'Every line that enters also leaves: no net flux.'],
      md`Lines from an outside charge enter and exit; only enclosed charge produces net flux.`),
    Q(md`An infinite line charge makes $|\mathbf E| = 6$ V/m at 2 m from it. At 6 m from it, $|\mathbf E|$ is…`,
      ['2 V/m', '$\\tfrac23$ V/m', '6 V/m', '18 V/m'], 0,
      [null, 'That uses $1/r^2$; a line\'s field falls as $1/r$.', 'The field of a line does fall with distance.', 'The field falls; it does not grow.'],
      md`$E = \rho_l/2\pi\epsilon_0r \propto 1/r$: three times farther, a third of the field.`),
    Q(md`Sheet 1 ($\rho_{s1} = 8$ C/m²) lies on $x = -1$ m and sheet 2 on $x = +1$ m. For $\mathbf D = 6\hat x$ C/m² at the origin, $\rho_{s2}$ must be…`,
      ['$-4$ C/m²', '$+4$ C/m²', '$-2$ C/m²', '$-12$ C/m²'], 0,
      [null, 'A positive sheet on the right would push $\\mathbf D$ toward $-x$ at the origin, lowering it below 4.', 'That counts sheet 2 with its full $\\rho_s$ ($4 - \\rho_{s2} = 6$). Each sheet gives half.', 'That leaves out sheet 1\'s $+4$ C/m² ($-\\rho_{s2}/2 = 6$).'],
      md`$D_x = \rho_{s1}/2 - \rho_{s2}/2 = 4 - \rho_{s2}/2 = 6$, so $\rho_{s2} = -4$ C/m². (HW 2 #6(a).)`),
    Q(md`At the mid-plane of a uniformly charged infinite slab, $\mathbf E$ is…`,
      ['zero', 'largest', '$\\rho W/2\\epsilon_0$', '$\\rho W/\\epsilon_0$'], 0,
      [null, 'It is largest at the faces.', 'That is the field outside the slab.', 'That is twice the outside field.'],
      md`By symmetry the two halves push equally in opposite directions at the center: $D_z = \rho(z - z_c) = 0$ there.`),
    Q(md`A charge moves through a region with only a uniform $\mathbf B$. Its speed…`,
      ['stays constant', 'grows', 'shrinks', 'depends on the charge\'s sign'], 0,
      [null, '$q\\mathbf v\\times\\mathbf B$ is perpendicular to $\\mathbf v$: it does no work.', '$q\\mathbf v\\times\\mathbf B$ is perpendicular to $\\mathbf v$: it does no work.', 'The sign changes the turning direction, not the speed.'],
      md`The magnetic force only bends the path; only $\mathbf E$ changes the kinetic energy.`),
    Q(md`A test charge moving along $\hat z$ measures the extra force $q\mathbf v\times\mathbf B$. Which components of $\mathbf B$ does that reveal?`,
      ['$B_x$ and $B_y$', 'all three', '$B_z$ only', 'none'], 0,
      [null, '$\\hat z\\times\\hat z = 0$: motion along $z$ is blind to $B_z$.', '$\\hat z\\times B_z\\hat z = 0$.', '$\\hat z\\times(B_x\\hat x + B_y\\hat y) = B_x\\hat y - B_y\\hat x$ is not zero.'],
      md`$v\hat z\times\mathbf B = v(B_x\hat y - B_y\hat x)$. A second velocity along $x$ or $y$ is needed for $B_z$ (HW 1 #3).`),
    Q(md`$Q = 4\pi\epsilon_0$ C, in coulombs, is about…`,
      ['$\\tfrac19\\times10^{-9}$ C', '$9\\times10^{9}$ C', '$8.85\\times10^{-12}$ C', '$4\\pi$ C'], 0,
      [null, 'That is $1/4\\pi\\epsilon_0$.', 'That is $\\epsilon_0$ alone; multiply by $4\\pi$.', 'That forgets $\\epsilon_0$.'],
      md`$4\pi\epsilon_0 = 4\pi\cdot\frac{10^{-9}}{36\pi} = \frac{10^{-9}}{9}$ C, which makes 1 V/m at 1 m (Summer 2017 #1(a)i).`),
    Q(md`Slab 1 ($-2 < z < -1$ m) has $\rho = 4$ C/m³; slab 2 ($-1 < z < 1$ m) has $\rho = -2$ C/m³. $\mathbf E$ at $z = \pm3$ m is…`,
      ['zero at both', '$\\pm2/\\epsilon_0$ V/m', '$4/\\epsilon_0$ V/m at both', 'zero at $z = 3$ only'], 0,
      [null, 'Count the charge per area: $4\\times1 + (-2)\\times2 = 0$.', 'The stack is neutral.', 'A neutral stack has no field on either side.'],
      md`Net charge per area $= 4 - 4 = 0$, so outside the stack $D_z = \pm\sigma_{net}/2 = 0$ (Summer 2018 #1(a)i).`),
    Q(md`A sheet with $\rho_s = 2$ C/m² is added on $z = 0$ to some slab distribution. How does $E_z$ change?`,
      ['it drops by $1/\\epsilon_0$ below the sheet and rises by $1/\\epsilon_0$ above it', 'it rises by $2/\\epsilon_0$ everywhere', 'it changes only at $z = 0$', 'it rises by $1/\\epsilon_0$ everywhere'], 0,
      [null, 'A sheet pushes away from itself: opposite directions on its two sides.', 'A sheet\'s field fills all of space, not just its plane.', 'Below a positive sheet its field points down.'],
      md`The sheet adds $\pm\rho_s/2\epsilon_0 = \pm1/\epsilon_0$: down below, up above. $E_z$ jumps by $\rho_s/\epsilon_0 = 2/\epsilon_0$ across $z = 0$ (Summer 2019 #1(a)iii).`),
    Q(md`On a Gaussian surface, $\mathbf E$ is produced by…`,
      ['all charges, inside and outside', 'only the enclosed charge', 'only the charges outside', 'only the charge on the surface'], 0,
      [null, 'Only the **net flux** is set by the enclosed charge; the field at each point comes from every charge.', 'Outside charges change $\\mathbf E$ on the surface; they just add no net flux.', 'Charges anywhere contribute.'],
      md`That is why Gauss's law needs symmetry to give $\mathbf E$: it pins down the flux, not the field.`),
  ];

  // ================================================================ R2 — divergence, curl, currents and continuity
  EM.lesson('u6', {
    id: 'r1-div-curl', topic: 'R2', order: 2, ref: 'Lectures 2–6', title: 'Divergence, curl, currents and continuity',
    steps: [
      R(md`
        !!key Why you care
          Summer 2017 #2(a), Summer 2018 #2(a) and Summer 2020 #1(b) all ask which part of a field is electrostatic and what $\rho$ it implies; the first two add the largest "circulation per unit area" or "flux per unit volume". Summer 2020 #3(a) asks which feature of a sketch shows divergence and which shows curl; Spring 2018 #3 is a flux out of a cube. HW 1 #4 and #6, HW 2 #7–10, HW 3 #2–3. On Exam 2 the same operators run Ampère ($\nabla\times\mathbf H = \mathbf J$) and Faraday ($\nabla\times\mathbf E = -\partial\mathbf B/\partial t$).

        ### Notation

        - $\nabla = \hat x\,\partial_x + \hat y\,\partial_y + \hat z\,\partial_z$, where $\partial_x = \partial/\partial x$.
        - $\nabla\cdot\mathbf F = \partial_xF_x + \partial_yF_y + \partial_zF_z$: **divergence**, a scalar, the net flux out per unit volume.
        - $\nabla\times\mathbf F$: **curl**, a vector, the circulation per unit area around the axis it points along. Its $z$-part is $\partial_xF_y - \partial_yF_x$; the others follow by cycling $x \to y \to z$.
        - Divergence theorem: $\oint_S\mathbf F\cdot d\mathbf S = \int_V\nabla\cdot\mathbf F\,dV$. Stokes: $\oint_C\mathbf F\cdot d\mathbf l = \int_S(\nabla\times\mathbf F)\cdot d\mathbf S$, with $d\mathbf S$ tied to $C$ by the right-hand rule.
        - $\mathbf J$: volume current density (A/m²); $\mathbf J = \rho\mathbf v$ for charge density $\rho$ moving at $\mathbf v$. $I = \int_S\mathbf J\cdot d\mathbf S$: the current through $S$ (A).

        ### The idea

        Gauss's law and the static loop law, shrunk to a point:
        $$\nabla\cdot\mathbf D = \rho, \qquad \nabla\times\mathbf E = 0\ \ \text{(electrostatics)}$$
        Divergence finds charge. Curl decides whether a field can be electrostatic at all. Charge conservation is one more divergence law, $\nabla\cdot\mathbf J = -\partial\rho/\partial t$.
      `),
      RF(md`
        ### Step 1: divergence finds charge

        $\rho = \epsilon_0\nabla\cdot\mathbf E$ (C/m³). In a sketch, divergence shows as arrows that grow or shrink **along** their own direction; curl, as arrows that change **across** it.

        [[fig:ac]]
      `, { ac: { svg: PF.row([{ svg: quiver((x) => [x, 0], 'the field x times x-hat: arrows along x, growing with distance from the y-axis'), cap: '$x\\,\\hat x$: changes along itself. Divergence 1, no curl.' }, { svg: quiver((x, y) => [y, 0], 'the field y times x-hat: arrows along x, growing with y, reversed below the x-axis'), cap: '$y\\,\\hat x$: changes across itself. Curl $-\\hat z$, no divergence.' }]).svg } }),
      Q(md`**Predict.** $\mathbf D = \hat r/r^2$ C/m² ($r$ the distance from the origin). Its divergence at $r = 1$ m is…`,
        ['$0$', 'positive: the arrows point outward', 'negative: the arrows shrink along their direction', '$4\\pi$ C/m³'], 0,
        [null, 'Outward arrows alone do not make divergence: a small box at $r = 1$ m lets in as much flux as it lets out.', 'The shrinking is exactly offset by the spreading of the lines.', '$4\\pi$ C is the total charge, and it sits at the origin, not at $r = 1$ m.'],
        md`$\nabla\cdot\mathbf D = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\cdot\frac{1}{r^2}\right) = 0$ for $r \ne 0$. The field weakens along $\hat r$ exactly as fast as its lines spread apart. It is a point charge $Q = 4\pi$ C at the origin, where all of the divergence lives: $\nabla\cdot\mathbf D = 4\pi\,\delta(\mathbf r)$ (HW 2 #10).`),
      R(md`
        ### Step 2: curl decides "electrostatic"

        Each of these implies all the others:
        $$\nabla\times\mathbf E = 0 \iff \oint_C\mathbf E\cdot d\mathbf l = 0\ \text{for every}\ C \iff \mathbf E = -\nabla V \iff \int_a^b\mathbf E\cdot d\mathbf l\ \text{is path-independent}$$
        Quick test: if each component depends only on its own coordinate ($E_x(x)$, $E_y(y)$, $E_z(z)$), the curl is zero. A component that depends on another coordinate ($\hat x\sin y$) has curl unless a partner term cancels it ($y\,\hat x + x\,\hat y = \nabla(xy)$ is curl-free).

        Two identities: $\nabla\times\nabla V = 0$ (any $-\nabla V$ passes the test) and $\nabla\cdot(\nabla\times\mathbf A) = 0$.
      `),
      Q(md`**Predict.** $\mathbf E_1 = \hat x\sin(\pi x/2)$ and $\mathbf E_2 = \hat x\sin(\pi y/2)$ V/m. Which could be an electrostatic field?`,
        ['$\\mathbf E_1$ only', '$\\mathbf E_2$ only', 'both', 'neither'], 0,
        [null, '$\\mathbf E_2$ changes across its direction: $(\\nabla\\times\\mathbf E_2)_z = -\\tfrac\\pi2\\cos(\\pi y/2) \\ne 0$.', '$\\mathbf E_2$ has curl.', '$\\mathbf E_1$ depends only on its own coordinate: curl-free.'],
        md`$\nabla\times\mathbf E_1 = 0$ since $E_x$ depends only on $x$. $(\nabla\times\mathbf E_2)_z = -\partial_yE_x = -\tfrac\pi2\cos(\pi y/2) \ne 0$. $\mathbf E_1$ carries the charge, $\rho = \tfrac\pi2\epsilon_0\cos(\pi x/2)$; $\mathbf E_2$ carries the curl.`, { src: 'Summer 2018 Exam 1' }),
      R(md`
        ### Step 3: current and continuity

        $\mathbf J = \rho\mathbf v$. Electrons ($\rho < 0$) drifting along $-\hat x$ make $\mathbf J$ along $+\hat x$: whatever the carriers' sign, the current a field drives points along $\mathbf E$ (HW 1 #5(c): $J \propto q^2$).

        Charge is conserved, so current out of a closed surface drains the charge inside:
        $$\oint_S\mathbf J\cdot d\mathbf S = -\frac{dQ_{enc}}{dt}, \qquad \nabla\cdot\mathbf J = -\frac{\partial\rho}{\partial t}$$
        By Gauss's law, the outward flux of $\mathbf D$ drains with it (HW 1 #4). In steady state $\nabla\cdot\mathbf J = 0$: current lines close on themselves.
      `),
      Q(md`**Predict.** The net current out of a closed box is $+26.7$ A. Inside the box…`,
        ['$Q_{enc}$ falls at 26.7 C/s, and so does $\\oint\\mathbf D\\cdot d\\mathbf S$', '$Q_{enc}$ grows at 26.7 C/s', 'nothing changes: current only moves charge around', '$Q_{enc}$ falls, but $\\oint\\mathbf D\\cdot d\\mathbf S$ stays fixed'], 0,
        [null, 'Sign: positive outward current carries charge away.', 'Charge carried out through the walls is no longer inside.', 'Gauss\'s law ties the flux to $Q_{enc}$ at every instant.'],
        md`$dQ_{enc}/dt = -\oint\mathbf J\cdot d\mathbf S = -26.7$ A, and $\oint\mathbf D\cdot d\mathbf S = Q_{enc}$ at every instant. HW 1 #4 has exactly this number.`),
      R(md`
        ### The method

        !!method Reading a field
          1. **Curl first.** Zero: electrostatic, a potential exists, every closed circulation vanishes. Not zero: not electrostatic; a changing $\mathbf B$ makes such fields ([Faraday's law](#/l/t8-faraday)).
          2. **Divergence:** $\rho = \epsilon_0\nabla\cdot\mathbf E$.
          3. **Flux out of a closed surface:** $\int_V\rho\,dV$. One volume integral replaces six face integrals.
          4. **Circulation around a closed path:** $\int_S(\nabla\times\mathbf E)\cdot d\mathbf S$; zero for a curl-free field.

        ### Worked example

        !!graded Problem
          $\mathbf E = \mathbf E_1 + \mathbf E_2$ with $\mathbf E_1 = \hat y\sin(\pi y/2)$ V/m and $\mathbf E_2 = \hat y\cos x$ V/m. (i) Which part satisfies the electrostatic conditions? (ii) Find $\rho$. (iii) What is the largest circulation per unit area? (iv) Find $\oint_C\mathbf E\cdot d\mathbf l$ around the square $0 \le x, y \le 1$ m, counterclockwise seen from $+z$.

        **1. Curl.** $\mathbf E_1$: $E_y$ depends only on $y$, so $\nabla\times\mathbf E_1 = 0$. $\mathbf E_2$: $(\nabla\times\mathbf E_2)_z = \partial_xE_y = -\sin x \ne 0$. **$\mathbf E_1$ is the electrostatic part.**

        **2. Charge.** $\nabla\cdot\mathbf E_2 = \partial_y\cos x = 0$, so only $\mathbf E_1$ counts:
        $$\rho = \epsilon_0\,\partial_y\sin\frac{\pi y}{2} = \frac{\pi\epsilon_0}{2}\cos\frac{\pi y}{2}\ \ \text{C/m}^3$$

        **3. Circulation per unit area** is $|\nabla\times\mathbf E| = |\sin x|$, at most $1$ V/m² (at $x = \pi/2 + k\pi$).

        **4. Circulation.** Stokes, with $d\mathbf S = +\hat z\,dx\,dy$ for counterclockwise $C$:
        $$\oint_C\mathbf E\cdot d\mathbf l = \int_0^1\!\!\int_0^1(-\sin x)\,dx\,dy = \cos1 - 1 = -0.460\ \text{V}$$

        **Check** directly: only the vertical sides see $E_y$. Up the side $x = 1$: $+\cos1 = 0.540$ V. Down the side $x = 0$: $-\cos0 = -1$ V. Sum $-0.460$ V. ✓ $\mathbf E_1$ adds nothing around any loop. ✓

        !!mistake Common mistakes
          - Reading $\nabla\cdot(\hat r/r^2) = 0$ as "no charge anywhere": the charge is a point at the origin.
          - Flipping the curl's terms: $(\nabla\times\mathbf F)_z = \partial_xF_y - \partial_yF_x$, not the reverse.
          - Thinking curl and divergence exclude each other. A field can have either, both or neither; "it has curl" says nothing about $\rho$.
          - Units: $\nabla\cdot\mathbf E$ is in V/m², so $\rho = \epsilon_0\nabla\cdot\mathbf E$ is in C/m³ (several of the old keys write C/m²).
          - The sign of continuity: positive net outward current means $Q_{enc}$ **falls**.
          - Electrons move against $\mathbf J$.

        ### Check questions
      `),
      Q(md`$\mathbf E = (2x + z^2)\,\hat x + 3y^2\,\hat y + 2xz\,\hat z$. Which statement is **false**?`,
        ['The charge density is zero everywhere.', 'The field is electrostatic.', 'The field has a scalar potential $V(x, y, z)$.', '$\\oint_C\\mathbf E\\cdot d\\mathbf l = 0$ around every closed path $C$.'], 0,
        [null, 'True: every curl component vanishes, e.g. $\\partial_zE_x - \\partial_xE_z = 2z - 2z = 0$.', 'True: curl-free fields are gradients, here $V = -(x^2 + xz^2 + y^3)$.', 'True: zero curl means zero circulation (Stokes).'],
        md`$\nabla\cdot\mathbf E = 2 + 6y + 2x \ne 0$, so $\rho = \epsilon_0(2 + 2x + 6y)$: the first statement is false. The curl vanishes ($\partial_yE_z - \partial_zE_y = 0$, $\partial_zE_x - \partial_xE_z = 2z - 2z = 0$, $\partial_xE_y - \partial_yE_x = 0$), so the other three are true.`, { src: 'Spring 2018 Exam 1' }),
      Q(md`In a sketch of a 2-D field, which feature signals a nonzero **divergence**?`,
        ['arrow lengths change along the arrows\' own direction', 'arrow lengths change across the arrows\' direction', 'the arrows are long', 'the arrows all point the same way'], 0,
        [null, 'That is shear: it signals curl.', 'A strong uniform field has no divergence.', 'Parallel arrows can still grow along themselves; direction alone says nothing.'],
        md`$\partial_xE_x$ measures how $E_x$ changes along $x$: growth or shrinkage along the flow. A change across the flow ($\partial_yE_x$) feeds the curl.`, { src: 'Summer 2020 Exam 1' }),
      Q(md`$\mathbf F = y\,\hat x + 2x\,\hat y$. Then…`,
        ['$\\nabla\\times\\mathbf F = \\hat z$, $\\nabla\\cdot\\mathbf F = 0$', '$\\nabla\\times\\mathbf F = -\\hat z$, $\\nabla\\cdot\\mathbf F = 0$', '$\\nabla\\times\\mathbf F = 3\\hat z$, $\\nabla\\cdot\\mathbf F = 0$', '$\\nabla\\times\\mathbf F = \\hat z$, $\\nabla\\cdot\\mathbf F = 3$'], 0,
        [null, 'Order: $\\partial_xF_y - \\partial_yF_x = 2 - 1$, not $1 - 2$.', 'The two terms subtract.', '$F_x$ does not depend on $x$, nor $F_y$ on $y$: no divergence.'],
        md`$(\nabla\times\mathbf F)_z = \partial_x(2x) - \partial_y(y) = 1$; $\nabla\cdot\mathbf F = \partial_xy + \partial_y(2x) = 0$ (HW 2 #7(b)).`),
      Q(md`$\mathbf E = \hat x\cos x + \hat x\cos y$ V/m. The largest "circulation per unit area" anywhere is…`,
        ['1 V/m²', '2 V/m²', '0', '1 V/m'], 0,
        [null, 'Only $\\hat x\\cos y$ has curl; $\\hat x\\cos x$ is curl-free.', '$\\hat x\\cos y$ changes across its direction: it has curl.', 'Circulation per area is (V/m)/m = V/m².'],
        md`$(\nabla\times\mathbf E)_z = -\partial_y\cos y = \sin y$, at most 1 V/m². The $\hat x\cos x$ part is the electrostatic one and carries the charge, $\rho = -\epsilon_0\sin x$.`, { src: 'Summer 2017 Exam 1' }),
      Q(md`At some point the charge density is decreasing, $\partial\rho/\partial t < 0$. There, $\nabla\cdot\mathbf J$ is…`,
        ['positive: current spreads out from the point', 'negative', 'zero, because charge is conserved', 'undetermined without $\\mathbf E$'], 0,
        [null, '$\\nabla\\cdot\\mathbf J = -\\partial\\rho/\\partial t > 0$.', 'Conservation forbids creating charge, not moving it; here it moves out.', 'Continuity involves only $\\mathbf J$ and $\\rho$.'],
        md`Charge leaving a point is current diverging from it: $\nabla\cdot\mathbf J = -\partial\rho/\partial t > 0$.`),
      Q(md`$\rho = 16yz^3$ µC/m³ fills the cube $0 < x, y, z < 1$ m. The total outward $\oint\mathbf D\cdot d\mathbf S$ is…`,
        ['2 µC', '16 µC', '4 µC', '8 µC'], 0,
        [null, 'That skips the integrals: $\\int_0^1y\\,dy = \\tfrac12$, $\\int_0^1z^3dz = \\tfrac14$.', '$\\int_0^1z^3dz = \\tfrac14$, not $\\tfrac12$.', 'That forgets the $z$ integral.'],
        md`$\oint\mathbf D\cdot d\mathbf S = Q_{enc} = 16\int_0^1dx\int_0^1y\,dy\int_0^1z^3dz = 16\cdot1\cdot\tfrac12\cdot\tfrac14 = 2$ µC. No face integrals needed.`, { src: 'Spring 2018 Exam 1' }),
      Q(md`Electrons drift along $-\hat x$ in a wire. The current density $\mathbf J$ and the driving field $\mathbf E$ point…`,
        ['both along $+\\hat x$', 'both along $-\\hat x$', '$\\mathbf J$ along $-\\hat x$, $\\mathbf E$ along $+\\hat x$', '$\\mathbf J$ along $+\\hat x$, $\\mathbf E$ along $-\\hat x$'], 0,
        [null, 'Negative carriers moving along $-\\hat x$ carry current along $+\\hat x$.', '$\\mathbf J = \\rho\\mathbf v$ with $\\rho < 0$: opposite to the motion.', 'Electrons are pushed against $\\mathbf E$, so $\\mathbf E$ points along $+\\hat x$, with $\\mathbf J$.'],
        md`$\mathbf J = \rho\mathbf v$ with $\rho < 0$ and $\mathbf v$ along $-\hat x$: $\mathbf J$ along $+\hat x$. The force $-e\mathbf E$ points along $\mathbf v$, so $\mathbf E$ is along $+\hat x$ too.`),
      Q(md`$V = x^2 - yz$ and $\mathbf E = -\nabla V$. $\nabla\times\mathbf E$ is…`,
        ['$0$, as for any gradient', '$-\\hat x$', '$2\\hat x - \\hat y$', '$0$, but only because $V$ is a polynomial'], 0,
        [null, '$\\mathbf E = -2x\\,\\hat x + z\\,\\hat y + y\\,\\hat z$; its $x$-curl is $\\partial_yE_z - \\partial_zE_y = 1 - 1 = 0$.', 'That is not a curl of anything here.', '$\\nabla\\times\\nabla V = 0$ for every smooth $V$.'],
        md`$\nabla\times\nabla V = 0$ identically: mixed partial derivatives commute (HW 3 #2).`),
      R(md`
        ### Rapid fire: divergence, curl, current

        **The trick:** curl pairs a component with a **different** coordinate ($\partial_xE_y - \partial_yE_x$); divergence pairs it with its **own**. Current out drains the charge in.
      `),
      Object.assign(G('rf_r1_divcurl', { need: 8 }), { id: 'r1-div-curl.r0' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('r1_cube', { need: 2 }),
      G('r1_lorentz', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- R2 rapid fire
  // [E, its curl ('0' if none), a curl someone gets by a slip]
  const FIELDS = [
    ['x^2\\,\\hat x + y\\,\\hat y', '0', '2x\\,\\hat z'],
    ['y\\,\\hat x + x\\,\\hat y', '0', '2\\hat z'],
    ['2xy\\,\\hat x + x^2\\,\\hat y', '0', '4x\\,\\hat z'],
    ['yz\\,\\hat x + xz\\,\\hat y + xy\\,\\hat z', '0', '\\hat x + \\hat y + \\hat z'],
    ['e^{-z}\\,\\hat z', '0', '-e^{-z}\\,\\hat z'],
    ['y\\,\\hat x - x\\,\\hat y', '-2\\hat z', '2\\hat z'],
    ['z\\,\\hat x', '\\hat y', '-\\hat y'],
    ['\\sin y\\,\\hat x', '-\\cos y\\,\\hat z', '\\cos y\\,\\hat z'],
    ['x\\,\\hat y', '\\hat z', '-\\hat z'],
    ['\\cos x\\,\\hat y', '-\\sin x\\,\\hat z', '\\sin x\\,\\hat z'],
  ];
  GENS.rf_r1_divcurl = () => one([
    // electrostatic or not
    () => {
      const [F, c, w] = pick(FIELDS), free = c === '0';
      const yes = 'Yes: $\\nabla\\times\\mathbf E = 0$';
      const no = (t) => `No: $\\nabla\\times\\mathbf E = ${t}$`;
      const rho = ['Only if $\\rho = 0$', 'Charge does not matter; the curl alone decides.'];
      return MC('Electrostatic?', md`Could $\mathbf E = ${F}$ V/m be an electrostatic field?`, free ? yes : no(c),
        free ? [[no(w), 'Recompute: each curl term pairs a component with a **different** coordinate, $(\\nabla\\times\\mathbf E)_z = \\partial_xE_y - \\partial_yE_x$; here the terms cancel.'], ['No: its divergence is not zero', 'Divergence means charge, not a non-electrostatic field; only the curl decides.'], rho]
          : [[yes, 'A component depends on a coordinate other than its own, and nothing cancels it: compute the curl.'], [no(w), 'Sign: $(\\nabla\\times\\mathbf E)_z = \\partial_xE_y - \\partial_yE_x$, and cyclic.'], rho],
        md`$\nabla\times\mathbf E = ${c}$: ${free ? 'curl-free, so it is $-\\nabla V$ of some $V$.' : 'not zero, so no potential exists and it cannot be electrostatic.'}`);
    },
    // charge density from a field
    () => {
      const a = pick([-3, -2, -1, 1, 2, 3]), b = pick([-2, -1, 1, 2, 4]), c = pick([-3, -1, 1, 2, 5]);
      const Pt = [pick([-2, -1, 1, 2]), pick([-2, -1, 1, 2]), pick([-2, -1, 1, 2])];
      const div = 2 * a * Pt[0] + b * Pt[2] + c;               // E = a x^2 x + b yz y + c z z
      const o = (v) => `$${num(v)}$ V/m²`;
      return Object.assign(MC('Charge from a field', md`$\mathbf E = ${poly([[a, 'x^2\\,\\hat x'], [b, 'yz\\,\\hat y'], [c, 'z\\,\\hat z']])}$ V/m. At $(${Pt.join(', ')})$ m, $\rho/\epsilon_0 = $`, o(div),
        [[o(-div), 'Sign: $\\rho = +\\epsilon_0\\nabla\\cdot\\mathbf E$.'], [o(2 * a * Pt[0] + b * Pt[1] + c), `$\\partial_y(${poly([[b, 'yz']])}) = ${poly([[b, 'z']])}$: evaluate it at $z$, not at $y$.`], [o(a * Pt[0] ** 2 + b * Pt[1] * Pt[2] + c * Pt[2]), 'That adds the components; differentiate each by its own coordinate first.'], [o(2 * a * Pt[0] + c), `The $\\hat y$ term contributes $\\partial_y(${poly([[b, 'yz']])}) = ${poly([[b, 'z']])}$.`]],
        md`$\nabla\cdot\mathbf E = ${poly([[2 * a, 'x'], [b, 'z'], [c, '']])} = ${num(div)}$ V/m² at that point.`), { _in: { a, b, c, Pt, div } });
    },
    // continuity
    () => {
      const I = pick([2, 5, 10, 26.7, 40]), out = pick([true, false]);
      const rate = out ? -I : I;
      const o = (v) => `$dQ_{enc}/dt = ${num(v)}$ C/s`;
      return MC('Continuity', md`A net current of ${I} A flows ${out ? 'out of' : 'into'} a closed surface. The charge inside changes at…`, o(rate),
        [[o(-rate), 'Current out drains the inside: $dQ_{enc}/dt = -\\oint\\mathbf J\\cdot d\\mathbf S$.'], ['$dQ_{enc}/dt = 0$: charge is conserved', 'Conserved means it cannot vanish; it can still cross the surface.'], ['it depends on $\\mathbf E$ inside', 'Continuity needs only the current through the surface.']],
        md`$dQ_{enc}/dt = -\oint\mathbf J\cdot d\mathbf S = ${num(rate)}$ C/s.`);
    },
    // a z-curl
    () => {
      const a = pick([-3, -2, -1, 1, 2, 3]), b = pick([-3, -2, -1, 1, 2, 3, 4]);
      const o = (v) => (v === 0 ? '$0$' : `$${cf(v, '\\hat z')}$ V/m²`);
      return Object.assign(MC('Curl', md`$\mathbf E = ${poly([[a, 'y\\,\\hat x'], [b, 'x\\,\\hat y']])}$ V/m. $\nabla\times\mathbf E = $`, o(b - a),
        [[o(a - b), 'Order: $(\\nabla\\times\\mathbf E)_z = \\partial_xE_y - \\partial_yE_x$.'], [o(a + b), 'The two terms subtract.'], [o(b), 'The $\\hat x$ term depends on $y$: it contributes $-\\partial_yE_x$.']],
        md`$(\nabla\times\mathbf E)_z = \partial_x(${b}x) - \partial_y(${a}y) = ${b} - (${a}) = ${b - a}$.`), { _in: { a, b, curl: b - a } });
    },
    // current density of drifting carriers
    () => {
      const ions = pick([true, false]), ax = pick(['x', 'y', 'z']), s = pick([1, -1]), v = pick([1, 2, 5]), n = pick([1, 2, 5]);
      const J = n * 1e28 * QE * v * 1e-3, dir = s * (ions ? 1 : -1);
      const o = (d, m) => `$${f(m)}$ A/m² along $${d > 0 ? '+' : '-'}\\hat ${ax}$`;
      return Object.assign(MC('Current density', md`${ions ? 'Singly charged positive ions' : 'Electrons'}, $${n}\times10^{28}\ \text{m}^{-3}$ of them, drift at ${v} mm/s along $${s > 0 ? '+' : '-'}\hat ${ax}$. $\mathbf J = $`, o(dir, J),
        [[o(-dir, J), ions ? 'Positive carriers move along $\\mathbf J$.' : 'Electrons carry negative charge: $\\mathbf J = \\rho\\mathbf v$ points against their motion.'], [o(dir, J * 1000), 'Convert mm/s to m/s.'], [o(dir, J / QE), 'That leaves out the charge per carrier, $1.6\\times10^{-19}$ C.']],
        md`$|\mathbf J| = nev = (${n}\times10^{28})(1.602\times10^{-19}\ \text{C})(${v}\times10^{-3}\ \text{m/s}) = ${f(J)}$ A/m², ${ions ? 'along the motion' : 'against the motion'}.`), { _in: { n, v, ions, J } });
    },
  ]);

  // ---------------------------------------------------------------- R2 problems
  GENS.r1_cube = () => {
    const k = pick([2, 3, 4, 6, 8, 12, 16]), m = pick([0, 1, 2]), n = pick([0, 1, 2, 3]), pz = pick([0, 1, 2, 3]), L = pick([1, 2]);
    const Qc = k * L ** (m + 1) / (m + 1) * L ** (n + 1) / (n + 1) * L ** (pz + 1) / (pz + 1);          // µC
    const flux = Qc * 1e-6 / EPS0;
    const body = poly([[k, `${m ? `x${m > 1 ? `^${m}` : ''}` : ''}${n ? `y${n > 1 ? `^${n}` : ''}` : ''}${pz ? `z${pz > 1 ? `^${pz}` : ''}` : ''}` || '']]) || `${k}`;
    const I1 = (e) => (L === 1 ? `\\tfrac{1}{${e + 1}}` : `\\tfrac{${L ** (e + 1)}}{${e + 1}}`);
    return {
      title: 'Flux out of a cube',
      q: md`Charge density $\rho = ${body}$ µC/m³ fills the cube $0 < x, y, z < ${L}$ m in free space. Find the total outward displacement flux $\oint\mathbf D\cdot d\mathbf S$ and the total outward electric flux $\oint\mathbf E\cdot d\mathbf S$.`,
      parts: [N('$\\oint\\mathbf D\\cdot d\\mathbf S$', Qc, 'µC'), N('$\\oint\\mathbf E\\cdot d\\mathbf S$', flux, 'V·m')],
      hints: ['Gauss\'s law: no face integrals, just $Q_{enc} = \\int_V\\rho\\,dV$.', `The integral factors: $\\int_0^{${L}}x^m dx = ${L}^{m+1}/(m+1)$, and the same for $y$ and $z$.`],
      sol: sol({
        eq: md`$\oint\mathbf D\cdot d\mathbf S = Q_{enc} = \int_V\rho\,dV$; $\oint\mathbf E\cdot d\mathbf S = Q_{enc}/\epsilon_0$.`,
        sym: md`$Q_{enc} = ${k}\left(\int_0^{${L}}x^{${m}}dx\right)\left(\int_0^{${L}}y^{${n}}dy\right)\left(\int_0^{${L}}z^{${pz}}dz\right)$ µC.`,
        sub: md`$$Q_{enc} = ${k}\cdot${I1(m)}\cdot${I1(n)}\cdot${I1(pz)} = ${f(Qc)}\ \mu\text{C},\qquad \oint\mathbf E\cdot d\mathbf S = \frac{${f(Qc)}\times10^{-6}\ \text{C}}{8.854\times10^{-12}\ \text{F/m}} = ${f(flux)}\ \text{V·m}$$`,
        ans: md`$\oint\mathbf D\cdot d\mathbf S = ${f(Qc)}$ µC; $\oint\mathbf E\cdot d\mathbf S = ${f(flux)}$ V·m.`,
        check: '$\\rho \\ge 0$ throughout the cube, so the flux is outward (positive). Units: C over F/m is V·m.',
      }),
      _in: { k, m, n, pz, L, Qc, flux },
    };
  };

  GENS.r1_lorentz = () => {
    const S3 = [-3, -2, -1, 1, 2, 3];
    const q = pick([1, 2, -1]);
    const E = [pick(S3), pick(S3), pick([-2, -1, 0, 1, 2])], B = [pick(S3), pick(S3), pick(S3)];
    const a = pick([-2, -1, 1, 2, 3]), b = pick([-2, -1, 1, 2, 3]);
    const cross = (u, w) => [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const F = (v) => { const c = cross(v, B); return [0, 1, 2].map((i) => q * (E[i] + c[i])); };
    const F1 = F([0, 0, 0]), F2 = F([0, 0, a]), F3 = F([b, 0, 0]);
    const d2 = F2.map((v, i) => v - F1[i]), d3 = F3.map((v, i) => v - F1[i]);
    return {
      title: 'E and B from three force measurements',
      q: md`A test charge $q = ${q}$ C at a point feels $\mathbf F_1 = ${vecTeX(F1)}$ N at rest, $\mathbf F_2 = ${vecTeX(F2)}$ N moving at $\mathbf v_2 = ${cf(a, '\\hat z')}$ m/s, and $\mathbf F_3 = ${vecTeX(F3)}$ N moving at $\mathbf v_3 = ${cf(b, '\\hat x')}$ m/s. Find $E_x$ and the three components of $\mathbf B$.`,
      parts: [N('$E_x$', E[0], 'V/m'), N('$B_x$', B[0], 'T'), N('$B_y$', B[1], 'T'), N('$B_z$', B[2], 'T')],
      hints: ['At rest $\\mathbf F_1 = q\\mathbf E$. Subtract it: $\\mathbf F - \\mathbf F_1 = q\\,\\mathbf v\\times\\mathbf B$.', '$v\\hat z\\times\\mathbf B = v(-B_y\\hat x + B_x\\hat y)$ and $v\\hat x\\times\\mathbf B = v(-B_z\\hat y + B_y\\hat z)$.'],
      sol: sol({
        eq: md`$\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B)$.`,
        sym: md`$\mathbf E = \mathbf F_1/q$. $\mathbf F_2 - \mathbf F_1 = qa(-B_y\hat x + B_x\hat y)$ gives $B_x$ and $B_y$; $\mathbf F_3 - \mathbf F_1 = qb(-B_z\hat y + B_y\hat z)$ gives $B_z$ (and checks $B_y$).`,
        sub: md`$\mathbf E = (${vecTeX(F1)})/(${q}) = ${vecTeX(E)}$ V/m. $\mathbf F_2 - \mathbf F_1 = ${vecTeX(d2)}$, so $B_x = ${num(d2[1])}/(${q}\cdot${a}) = ${B[0]}$ T and $B_y = -(${num(d2[0])})/(${q}\cdot${a}) = ${B[1]}$ T. $\mathbf F_3 - \mathbf F_1 = ${vecTeX(d3)}$, so $B_z = -(${num(d3[1])})/(${q}\cdot${b}) = ${B[2]}$ T.`,
        ans: md`$E_x = ${E[0]}$ V/m; $\mathbf B = ${vecTeX(B)}$ T.`,
        check: md`The $\hat z$ part of $\mathbf F_3 - \mathbf F_1$ is $qbB_y = ${num(d3[2])}$ N, consistent with $B_y = ${B[1]}$ T. ✓`,
      }),
      _in: { q, E, B, a, b, F1, F2, F3 },
    };
  };

  // ---------------------------------------------------------------- R2 bank
  EM.BANK['r1-div-curl'] = [
    Q(md`$\mathbf D = \hat r/r^2$ C/m². The outward flux through a sphere of radius 5 m centered at the origin is…`,
      ['$4\\pi$ C', '$0$, since $\\nabla\\cdot\\mathbf D = 0$', '$\\tfrac{4\\pi}{25}$ C', '$100\\pi$ C'], 0,
      [null, 'The divergence is zero everywhere **except** the origin, which the sphere encloses.', '$D = 1/25$ on the sphere, but the area is $4\\pi\\cdot25$.', 'That multiplies by $r^2$ twice.'],
      md`$D_r\cdot4\pi r^2 = 4\pi$ C for any radius: the field of a point charge $4\pi$ C at the origin.`),
    Q(md`For any smooth vector field $\mathbf A$, $\nabla\cdot(\nabla\times\mathbf A)$ is…`,
      ['$0$', '$\\nabla^2\\mathbf A$', '$\\nabla(\\nabla\\cdot\\mathbf A)$', 'a vector'], 0,
      [null, 'That is a vector; the divergence of anything is a scalar.', 'That appears in the identity for the curl of a curl, not here.', 'Divergence returns a scalar.'],
      md`Curls have no divergence; that is why $\mathbf B = \nabla\times\mathbf A$ always satisfies $\nabla\cdot\mathbf B = 0$ (Topic 7).`),
    Q(md`$\mathbf F = x\,\hat x + y\,\hat y$ (HW 2 #7(a)). Its divergence and curl are…`,
      ['2 and 0', '0 and 2', '2 and $2\\hat z$', '1 and 0'], 0,
      [null, 'Swapped: each component grows along its own coordinate, which is divergence.', 'Each component depends only on its own coordinate: no curl.', 'Two components each contribute 1.'],
      md`$\partial_xx + \partial_yy = 2$; $\partial_xF_y - \partial_yF_x = 0$. Arrows point straight out and grow: pure divergence.`),
    Q(md`$\mathbf E = \sin y\,\hat x + \cos x\,\hat y$ V/m (HW 2 #8). Which is true?`,
      ['$\\rho = 0$, but the field is not electrostatic', 'it is electrostatic with $\\rho = 0$', '$\\rho = \\epsilon_0(\\cos y - \\sin x)$', 'it is electrostatic with $\\rho \\ne 0$'], 0,
      [null, '$(\\nabla\\times\\mathbf E)_z = -\\sin x - \\cos y \\ne 0$: no potential exists.', 'Each component depends only on the **other** coordinate: $\\partial_xE_x = \\partial_yE_y = 0$.', 'Its curl is not zero.'],
      md`$\nabla\cdot\mathbf E = \partial_x\sin y + \partial_y\cos x = 0$, so $\rho = 0$; but $\nabla\times\mathbf E = -(\sin x + \cos y)\hat z$. No static charge distribution makes this field; a changing $\mathbf B$ could.`),
    Q(md`$V = x^2 - 2$ V in free space (HW 2 #9). The charge density is…`,
      ['$-2\\epsilon_0$ C/m³', '$+2\\epsilon_0$ C/m³', '$0$', '$-2x\\epsilon_0$ C/m³'], 0,
      [null, 'Sign: $\\mathbf E = -2x\\,\\hat x$, so $\\nabla\\cdot\\mathbf E = -2$.', 'The potential is curved ($\\nabla^2V = 2$), so there is charge.', 'That is $\\epsilon_0E_x$, not $\\epsilon_0\\nabla\\cdot\\mathbf E$.'],
      md`$\mathbf E = -\nabla V = -2x\,\hat x$; $\rho = \epsilon_0\nabla\cdot\mathbf E = -2\epsilon_0 = -1.77\times10^{-11}$ C/m³.`),
    Q(md`In a steady current flow (nothing changes in time), $\nabla\cdot\mathbf J$ is…`,
      ['zero everywhere', 'equal to $\\rho$', 'positive where current is strong', 'equal to $\\sigma\\nabla\\cdot\\mathbf E$ and nonzero'], 0,
      [null, 'Continuity: $\\nabla\\cdot\\mathbf J = -\\partial\\rho/\\partial t$, not $\\rho$.', 'Strength is not divergence.', 'With $\\partial\\rho/\\partial t = 0$, continuity forces it to zero.'],
      md`$\nabla\cdot\mathbf J = -\partial\rho/\partial t = 0$: current lines neither start nor end.`),
    Q(md`Electrons ($n = 10^{28}$ m⁻³) drift at 1 mm/s. $|\mathbf J|$ is about…`,
      ['$1.6\\times10^{6}$ A/m²', '$1.6\\times10^{9}$ A/m²', '$10^{25}$ A/m²', '$1.6\\times10^{3}$ A/m²'], 0,
      [null, 'That uses 1 m/s.', 'That forgets the electron charge.', 'Off by $10^3$: 1 mm/s = $10^{-3}$ m/s.'],
      md`$J = nev = (10^{28})(1.6\times10^{-19})(10^{-3}) = 1.6\times10^6$ A/m²: slow drift, large current density.`),
    Q(md`Equal densities of electrons and protons start from rest in $\mathbf E = E_0\hat z$ (HW 1 #5). Their currents…`,
      ['both point along $+\\hat z$; the electrons carry almost all of it', 'cancel, since the charges are opposite', 'point opposite ways', 'are equal'], 0,
      [null, 'They move in opposite directions **and** have opposite charges: the currents add.', 'Each contributes $q\\cdot v \\propto q^2/m$, positive for both.', 'Each carrier\'s share is $\\propto 1/m$: the electron\'s is 1836 times larger.'],
      md`$J = \sum Nq\,v = \sum Nq^2E_0t/m$: both terms positive, the proton's suppressed by $m_e/m_p$.`),
    Q(md`The circulation of $\mathbf F = y\,\hat x$ around the unit square $0 \le x, y \le 1$, counterclockwise seen from $+z$, is…`,
      ['$-1$', '$+1$', '$0$', '$-2$'], 0,
      [null, 'Sign: $(\\nabla\\times\\mathbf F)_z = -\\partial_yF_x = -1$.', 'The field has curl, so the circulation need not vanish.', 'Curl $-1$ times area 1.'],
      md`Stokes: $(-1)(1) = -1$. Directly: along the top edge ($y = 1$) going $-x$: $-1$; along the bottom ($y = 0$): $F = 0$; the vertical sides see no $F_y$.`),
    Q(md`$\mathbf A = (x - y)\,\hat x + (x + y)\,\hat y + 2\,\hat z$ (HW 3 #3). $\nabla\times\mathbf A$ is…`,
      ['$2\\hat z$', '$0$', '$-2\\hat z$', '$2\\hat x + 2\\hat y$'], 0,
      [null, '$\\partial_xA_y - \\partial_yA_x = 1 - (-1) = 2$.', 'Order of terms: $\\partial_xA_y - \\partial_yA_x$.', 'Only the $z$-component survives; nothing depends on $z$.'],
      md`$(\nabla\times\mathbf A)_z = 1 + 1 = 2$. Its curl is constant, so $\nabla\times\nabla\times\mathbf A = 0$, matching $\nabla(\nabla\cdot\mathbf A) - \nabla^2\mathbf A = \nabla(2) - 0 = 0$.`),
    Q(md`$\mathbf J = x^2y\,(\hat x + \hat y + \hat z)$ A/m² in the cube $0 \le x, y, z \le 2$ m (HW 1 #4). The quickest way to the net outward current is…`,
      ['$\\int_V(2xy + x^2)\\,dV = 80/3$ A', 'six face integrals; there is no shortcut', '$\\int_V 3x^2y\\,dV$', '$J$ at the center times the surface area'], 0,
      [null, 'The divergence theorem turns the six into one.', 'That integrates the components\' sum, not the divergence.', 'Flux is not a field value times area unless the field is uniform and normal.'],
      md`$\nabla\cdot\mathbf J = \partial_x(x^2y) + \partial_y(x^2y) + \partial_z(x^2y) = 2xy + x^2$; over the cube: $16 + 32/3 = 80/3 = 26.7$ A.`),
    Q(md`$\mathbf E = \hat x\sin y - \hat y\cos y$ V/m (Summer 2020 #1(b)). Which part is electrostatic?`,
      ['$-\\hat y\\cos y$', '$\\hat x\\sin y$', 'both', 'neither'], 0,
      [null, '$\\hat x\\sin y$ changes across its direction: curl $-\\cos y\\,\\hat z$.', 'The $\\hat x\\sin y$ part has curl.', '$E_y = -\\cos y$ depends only on $y$: curl-free.'],
      md`$\nabla\times(-\hat y\cos y) = 0$; $\nabla\times(\hat x\sin y) = -\cos y\,\hat z$. The charge comes from the $\hat y$ part: $\rho = \epsilon_0\sin y$.`),
  ];

  // ================================================================ R3 — electrostatic potential
  EM.lesson('u6', {
    id: 'r1-potential', topic: 'R3', order: 3, ref: 'Lectures 5–8', title: 'Electrostatic potential',
    steps: [
      R(md`
        !!key Why you care
          Every past Exam 1 asks for $V$ from $\mathbf E$ or $\mathbf E$ from $V$: Spring 2018 #2 (circulation and $V(a) - V(b)$), Summer 2017 #2(b)–(c), Summer 2018 #2(b)–(c), Summer 2019 #2, Summer 2020 #2. HW 3 #1, #4, #5. On Exam 2 the same line integral becomes an emf, and around a loop with changing flux it is no longer zero ([Topic 10](#/l/t10-voltmeters)).

        ### Notation

        - $V$: electrostatic potential (V), the work per unit charge to bring a test charge from the reference point to where you are. The reference is where $V = 0$ (a ground, infinity, or a stated point).
        - $V(P) - V(O) = -\int_O^P\mathbf E\cdot d\mathbf l$, along any path from $O$ to $P$.
        - $\nabla V = (\partial_xV, \partial_yV, \partial_zV)$: the gradient. $\nabla^2V = \partial_x^2V + \partial_y^2V + \partial_z^2V$: the Laplacian (V/m²).
        - $W = q\,\Delta V$: work (J) done moving $q$ slowly through $\Delta V$. $e = 1.602\times10^{-19}$ C; $1\ \text{eV} = 1.602\times10^{-19}$ J; $m_e = 9.109\times10^{-31}$ kg.

        ### The idea

        In electrostatics $\oint\mathbf E\cdot d\mathbf l = 0$, so the work per charge from $O$ to $P$ does not depend on the path: it is a function of position, $V$. The field points downhill:
        $$\mathbf E = -\nabla V, \qquad \nabla^2V = -\rho/\epsilon_0$$
      `),
      RF(md`
        ### Step 1: V from E

        Integrate along any convenient path. Axis-parallel legs make each piece one-dimensional; on each leg the other coordinates sit at the values already reached:
        $$V(P) - V(O) = -\int_0^{x_P}E_x(x, 0, 0)\,dx - \int_0^{y_P}E_y(x_P, y, 0)\,dy - \int_0^{z_P}E_z(x_P, y_P, z)\,dz$$

        [[fig:legs]]

        Two results to know: a uniform field gives $V(a) - V(b) = -\mathbf E\cdot(\mathbf r_a - \mathbf r_b)$; a point charge gives $V = Q/4\pi\epsilon_0r$ (zero at infinity).
      `, { legs: { svg: legsFig(), cap: 'Legs 1, 2, 3: along $x$ with $y = z = 0$, along $y$ at $x = x_P$, along $z$ at $(x_P, y_P)$.' } }),
      Q(md`**Predict.** $\mathbf E = 2\hat x - 3\hat y + 5\hat z$ V/m, uniform. For $a = (1, 1, 0)$ m and $b = (-1, -1, 0)$ m, $V(a) - V(b) = $`,
        ['$2$ V', '$-2$ V', '$10$ V', '$0$'], 0,
        [null, 'Sign: $V(a) - V(b) = -\\mathbf E\\cdot(\\mathbf r_a - \\mathbf r_b)$, and $\\mathbf E\\cdot(\\mathbf r_a - \\mathbf r_b) = -2$ V.', 'That adds the components\' sizes; take the dot product with the displacement $(2, 2, 0)$.', 'The displacement is not perpendicular to $\\mathbf E$.'],
        md`$\mathbf r_a - \mathbf r_b = (2, 2, 0)$ m; $\mathbf E\cdot(2, 2, 0) = 4 - 6 = -2$ V; so $V(a) - V(b) = +2$ V. Going from $b$ to $a$ runs partly against $\mathbf E$ (the $-3\hat y$ part), uphill.`, { src: 'Spring 2018 Exam 1' }),
      R(md`
        ### Step 2: E from V, and back again

        $\mathbf E = -\nabla V$: differentiate. To go back, first check $\nabla\times\mathbf E = 0$ (otherwise no $V$ exists). Then look for $V$ with $-\partial_xV = E_x$, $-\partial_yV = E_y$, $-\partial_zV = E_z$: integrate $E_x$ in $x$, then add only the $y$- and $z$-terms still missing. Often you can spot it at once: $\mathbf E\cdot d\mathbf l = y\,dx + x\,dy = d(xy)$, so $V = -xy + C$.

        The constant comes from the reference: $V(O) = V_0$ fixes $C$.
      `),
      Q(md`**Predict.** $\mathbf E = y\,\hat x + x\,\hat y + \cos z\,\hat z$ V/m and $V(0, 0, 0) = 3$ V. $V(x, y, z) = $`,
        ['$3 - xy - \\sin z$ V', '$3 + xy + \\sin z$ V', '$3 - xy + \\sin z$ V', '$-xy - \\sin z$ V'], 0,
        [null, 'Sign: $\\mathbf E = -\\nabla V$, so $V$ falls along $\\mathbf E$.', '$-\\partial_z(\\sin z) = -\\cos z$, the wrong sign for $E_z$.', 'That misses the reference: at the origin it gives 0, not 3 V.'],
        md`$\mathbf E\cdot d\mathbf l = d(xy + \sin z) = -dV$, so $V = -xy - \sin z + C$ and $C = 3$ V. Check: $-\nabla V = (y, x, \cos z)$. ✓`, { src: 'Summer 2018 Exam 1' }),
      R(md`
        ### Step 3: Poisson, and energy

        Charge curves the potential: $\rho = -\epsilon_0\nabla^2V$ (the same as $\epsilon_0\nabla\cdot\mathbf E$). Where $\rho = 0$, $V$ obeys Laplace's equation and has no local maxima or minima.

        Energy is conserved: a charge released at rest gains kinetic energy $\tfrac12mv^2 = -q\,\Delta V$. An electron ($q = -e$) speeds up moving to **higher** $V$; through $\Delta V$ volts it gains $\Delta V$ eV. In the vacuum diode of HW 3 #1, $V(x)$ tells you the electron's speed at every $x$: $v = \sqrt{2eV(x)/m_e}$.
      `),
      Q(md`**Predict.** An electron leaves a cathode at rest and reaches the anode with speed $v$. The anode voltage is quadrupled. The arrival speed becomes…`,
        ['$2v$', '$4v$', '$16v$', '$v$'], 0,
        [null, 'Energy grows as $V$; speed as $\\sqrt V$.', 'Speed grows as $\\sqrt V$, not as $V^2$.', 'More voltage, more energy.'],
        md`$\tfrac12m_ev^2 = eV_a$, so $v \propto \sqrt{V_a}$: four times the voltage, twice the speed.`),
      R(md`
        ### The method

        !!method Potential problems
          1. **From $\mathbf E$ to $V$:** check $\nabla\times\mathbf E = 0$ (else no $V$ exists). Then $V(P) = V(O) - \int_O^P\mathbf E\cdot d\mathbf l$ on axis-parallel legs, or spot $\mathbf E\cdot d\mathbf l = -dV$.
          2. **From $V$ to $\mathbf E$:** $\mathbf E = -\nabla V$; field lines run downhill.
          3. **Charge:** $\rho = \epsilon_0\nabla\cdot\mathbf E = -\epsilon_0\nabla^2V$.
          4. **Energy:** $\Delta(\tfrac12mv^2) = -q\,\Delta V$; the work you do moving $q$ slowly is $W = q\,\Delta V$.
          5. **Check:** $-\nabla$ of your $V$ returns the given $\mathbf E$, and $V$ meets the reference value.

        ### Worked example

        !!graded Problem
          $\mathbf E = 2xy\,\hat x + (x^2 + 2z)\,\hat y + 2y\,\hat z$ V/m in free space. (a) Show that it is electrostatic. (b) Find $V(x, y, z)$ with $V(0, 0, 0) = 1$ V, and $V$ at $P = (1, 2, -1)$ m. (c) Find $\rho$. (d) How much work does it take to move $q = 2$ µC slowly from the origin to $P$?

        **1. Curl.** $\partial_yE_z - \partial_zE_y = 2 - 2 = 0$; $\partial_zE_x - \partial_xE_z = 0 - 0 = 0$; $\partial_xE_y - \partial_yE_x = 2x - 2x = 0$. Curl-free: a potential exists.

        **2. Potential.** $\mathbf E\cdot d\mathbf l = 2xy\,dx + x^2\,dy + 2z\,dy + 2y\,dz = d(x^2y) + d(2yz)$, so
        $$V = 1 - x^2y - 2yz\ \ \text{V},\qquad V(1, 2, -1) = 1 - 2 + 4 = 3\ \text{V}$$

        **3. Charge.** $\nabla\cdot\mathbf E = \partial_x(2xy) + \partial_y(x^2 + 2z) + \partial_z(2y) = 2y$, so $\rho = 2\epsilon_0y$ C/m³ (the same as $-\epsilon_0\nabla^2V = -\epsilon_0(-2y)$).

        **4. Work.** $W = q\,[V(P) - V(O)] = (2\times10^{-6}\ \text{C})(3 - 1\ \text{V}) = 4$ µJ.

        **5. Check.** $-\nabla V = (2xy,\ x^2 + 2z,\ 2y)$ ✓, and $V(0, 0, 0) = 1$ V ✓.

        !!mistake Common mistakes
          - The sign: $V(P) - V(O) = -\int_O^P\mathbf E\cdot d\mathbf l$. Moving along $\mathbf E$ lowers $V$.
          - On a leg, using the final values of the other coordinates too early: along the first leg $y$ and $z$ are still at the start values.
          - Hunting for a potential of a field with curl: none exists. Spring 2018 #2(b) wants the answer "not defined".
          - Forgetting the constant: only the reference value fixes $V$.
          - Units: $V$ in volts, $\mathbf E$ in V/m, $\nabla^2V$ in V/m², $\rho$ in C/m³.
          - An electron and a proton through the same $\Delta V$ gain the same energy, but the proton is $\sqrt{1836} \approx 43$ times slower.

        ### Check questions
      `),
      Q(md`Instead of $\mathbf E$, you are told $\nabla\times\mathbf E = 2\hat x - 3\hat y + 5\hat z$ V/m². What is $V(a) - V(b)$ between two given points?`,
        ['not defined: no potential exists', '$2$ V', '$-10$ V', '$10$ V'], 0,
        [null, 'That treats the curl as if it were the field.', 'A nonzero curl means the line integral depends on the path; no single number exists.', 'A nonzero curl means the line integral depends on the path; no single number exists.'],
        md`With $\nabla\times\mathbf E \ne 0$ the field is not conservative: different paths from $b$ to $a$ give different integrals, so "$V(a) - V(b)$" has no meaning.`, { src: 'Spring 2018 Exam 1' }),
      Q(md`$\nabla\times\mathbf E = 2\hat x - 3\hat y + 5\hat z$ V/m², uniform. $\oint_C\mathbf E\cdot d\mathbf l$ around the square with corners $(\pm1, \pm1, 0)$ m, counterclockwise seen from $+z$, is…`,
        ['20 V', '5 V', '0', '$-20$ V'], 0,
        [null, 'Multiply by the area, 4 m².', 'Zero only for a curl-free field.', 'Counterclockwise from $+z$ means $d\\mathbf S = +\\hat z$.'],
        md`Stokes: $\int(\nabla\times\mathbf E)\cdot\hat z\,dS = (5\ \text{V/m}^2)(2\ \text{m})^2 = 20$ V. Only the $\hat z$ part of the curl crosses a square in the $xy$-plane.`, { src: 'Spring 2018 Exam 1' }),
      Q(md`$V = \tfrac12(x^2 + y^2)$ V for $\sqrt{x^2 + y^2} < 2$ m. The field there…`,
        ['points toward the $z$-axis, with $|\\mathbf E| = r$', 'points away from the $z$-axis', 'is zero on the $z$-axis and uniform elsewhere', 'points along $\\hat z$'], 0,
        [null, '$V$ is lowest on the axis, and $\\mathbf E$ points downhill: toward it.', '$|\\mathbf E| = \\sqrt{x^2 + y^2}$ grows with $r$.', '$V$ does not depend on $z$.'],
        md`$\mathbf E = -x\,\hat x - y\,\hat y$: inward, size $r$. The minimum of $V$ is the axis, and $\rho = -2\epsilon_0$ C/m³ there and everywhere inside.`, { src: 'Summer 2019 Exam 1' }),
      Q(md`In the previous field, $\rho = 0$ for $r > 2$ m. The largest $|\mathbf E|$ within $r < 4$ m is…`,
        ['2 V/m, at $r = 2$ m', '4 V/m, at $r = 4$ m', '1 V/m, at $r = 4$ m', 'unbounded'], 0,
        [null, 'Beyond $r = 2$ m there is no charge, so the field falls as $1/r$ (cylindrical Gauss).', 'At 4 m the field has fallen to $2\\cdot2/4 = 1$ V/m, below its peak.', 'Inside, $|\\mathbf E| = r \\le 2$ V/m.'],
        md`Inside $|\mathbf E| = r$, so 2 V/m at $r = 2$ m. Outside, $E \propto 1/r$ (charge per length fixed), so it only decreases.`, { src: 'Summer 2019 Exam 1' }),
      Q(md`$\mathbf E = 2x\,\hat x - 4\sin z\,\hat z$ V/m and $V(0, 0, 0) = 4$ V. Then $V = $`,
        ['$8 - x^2 - 4\\cos z$ V', '$4 - x^2 - 4\\cos z$ V', '$4 - x^2 + 4\\cos z$ V', '$x^2 - 4\\cos z + 8$ V'], 0,
        [null, 'At the origin that gives $4 - 0 - 4 = 0$, not 4 V.', '$-\\partial_z(4\\cos z) = 4\\sin z$, the wrong sign for $E_z$.', '$-\\partial_x(x^2) = -2x$, the wrong sign for $E_x$.'],
        md`$-dV = 2x\,dx - 4\sin z\,dz = d(x^2 + 4\cos z)$, so $V = -x^2 - 4\cos z + C$; $V(0) = -4 + C = 4$ gives $C = 8$.`, { src: 'Summer 2020 Exam 1' }),
      Q(md`$E_1 = y\,\hat x - x\,\hat y$ V/m has circulation 4 V around a closed triangle (HW 3 #5). Then…`,
        ['$\\mathbf E_1$ is not electrostatic; no $V$ exists', 'a mistake was made: circulations always vanish', '$V$ exists, but only inside the triangle', 'the triangle must enclose charge'], 0,
        [null, 'They vanish only for curl-free fields; $\\nabla\\times\\mathbf E_1 = -2\\hat z$.', 'A potential is all-or-nothing in a region.', 'Charge gives divergence, not circulation.'],
        md`One nonzero circulation is enough: $\mathbf E_1$ has curl ($-2\hat z$) and no potential. Its partner $\mathbf E_2 = y\,\hat x + x\,\hat y = \nabla(xy)$ gives 0 around the same path.`),
      Q(md`An electron accelerates from rest through 2 V. Its speed is about…`,
        ['$8.4\\times10^5$ m/s', '$5.9\\times10^5$ m/s', '$1.9\\times10^4$ m/s', '$7.0\\times10^{11}$ m/s'], 0,
        [null, 'That is the speed for 1 V.', 'That uses the proton mass.', 'That is $v^2$, not $v$.'],
        md`$v = \sqrt{2eV/m_e} = \sqrt{2(1.602\times10^{-19})(2)/9.109\times10^{-31}} = 8.39\times10^5$ m/s (HW 3 #1 at the anode).`),
      Q(md`$Q = 12\,(4\pi\epsilon_0)$ C at the origin. $V(2\ \text{m}) - V(3\ \text{m})$ is…`,
        ['2 V', '$-2$ V', '$\\tfrac53$ V', '12 V'], 0,
        [null, 'Closer to a positive charge is higher potential.', 'That uses $1/r^2$; potential goes as $1/r$.', 'That is $V$ at 1 m.'],
        md`$V = 12/r$ V: $6 - 4 = 2$ V.`),
      R(md`
        ### Rapid fire: potential

        **The trick:** $V(a) - V(b) = -\int_b^a\mathbf E\cdot d\mathbf l$; downhill is along $\mathbf E$; energy in eV equals volts crossed for one electron charge.
      `),
      Object.assign(G('rf_r1_pot', { need: 8 }), { id: 'r1-potential.r0' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('r1_vfrome', { need: 2 }),
      G('r1_diode', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- R3 rapid fire
  GENS.rf_r1_pot = () => one([
    // uniform field
    () => {
      let E, A, B, d;
      do {
        E = [pick([-3, -2, -1, 1, 2, 3]), pick([-3, -2, -1, 0, 1, 2, 3]), pick([-2, 0, 1, 2, 5])];
        A = [pick([-1, 0, 1, 2]), pick([-1, 0, 1, 2]), 0]; B = [pick([-2, -1, 0, 1]), pick([-2, -1, 0, 1]), pick([0, 1])];
        d = A.map((v, i) => v - B[i]);
      } while (d.every((v) => v === 0));
      const dV = -(E[0] * d[0] + E[1] * d[1] + E[2] * d[2]);
      const o = (v) => `$${num(v)}$ V`;
      return Object.assign(MC('Uniform field', md`$\mathbf E = ${vecTeX(E)}$ V/m, uniform. $V(a) - V(b)$ for $a = (${A.join(', ')})$ m and $b = (${B.join(', ')})$ m is…`, o(dV),
        [[o(-dV), 'Sign: $V(a) - V(b) = -\\mathbf E\\cdot(\\mathbf r_a - \\mathbf r_b)$; moving along $\\mathbf E$ lowers $V$.'], [o(-(E[0] * A[0] + E[1] * A[1] + E[2] * A[2])), 'That uses $\\mathbf r_a$ alone; you need the displacement $\\mathbf r_a - \\mathbf r_b$.'], [o(Math.hypot(...E) * Math.hypot(...d)), 'Only the part of the displacement along $\\mathbf E$ counts: take the dot product.']],
        md`$\mathbf r_a - \mathbf r_b = (${d.join(', ')})$ m; $-\mathbf E\cdot(\mathbf r_a - \mathbf r_b) = ${num(dV)}$ V.`), { _in: { E, A, B, dV } });
    },
    // energy of an accelerated charge
    () => {
      const V = pick([1, 4, 9, 16, 25, 100]), who = pick(['An electron', 'A proton']);
      const o = (v) => `${num(v)} eV`;
      const q = who === 'An electron' ? md`${who} starts at rest where $V = 0$ and arrives where $V = ${V}$ V.` : md`${who} starts at rest where $V = ${V}$ V and arrives where $V = 0$.`;
      return MC('Energy', md`${q} Its kinetic energy is…`, o(V),
        [[o(2 * V), 'No factor 2: the kinetic energy is $|q|\\Delta V$ itself.'], [o(Math.sqrt(V)), 'Speed goes as $\\sqrt V$; energy goes as $V$.'], [`$${num(V * QE)}$ eV`, 'That is the energy in joules, labeled eV.'], ['0 eV', 'It moves in the direction the field pushes it: it gains energy.']],
        md`$KE = |q|\,|\Delta V| = e\times${V}$ V $= ${V}$ eV, for an electron or a proton alike.`);
    },
    // potential of a point charge
    () => {
      const k = pick([2, 4, 6, 12]), r1 = pick([1, 2]), r2 = pick([3, 4, 6]);
      const dV = k * (1 / r1 - 1 / r2);
      const o = (v) => `$${num(v)}$ V`;
      return Object.assign(MC('Point charge', md`$Q = ${k}\,(4\pi\epsilon_0)$ C at the origin. $V(${r1}\ \text{m}) - V(${r2}\ \text{m}) = $`, o(dV),
        [[o(-dV), 'Closer to a positive charge is higher potential.'], [o(k * (1 / r1 ** 2 - 1 / r2 ** 2)), 'That uses $1/r^2$: the field falls as $1/r^2$, the potential as $1/r$.'], [o(k / (r2 - r1)), 'Evaluate $Q/4\\pi\\epsilon_0r$ at each radius, then subtract.']],
        md`$V = ${k}/r$ V: $${k}\left(\tfrac{1}{${r1}} - \tfrac{1}{${r2}}\right) = ${num(dV)}$ V.`), { _in: { k, r1, r2, dV } });
    },
    // field from a potential
    () => {
      const a = pick([-3, -2, -1, 1, 2, 3]), b = pick([-4, -2, -1, 1, 2, 4]), x0 = pick([-2, -1, 1, 2]);
      const E = [-2 * a * x0, -b, 0];
      const o = (v) => `$${vecTeX(v)}$ V/m`;
      return Object.assign(MC('Field from potential', md`$V = ${poly([[a, 'x^2'], [b, 'y']])}$ V. At $(${x0}, 0, 0)$ m, $\mathbf E = $`, o(E),
        [[o(E.map((v) => -v)), 'Sign: $\\mathbf E = -\\nabla V$ points downhill.'], [o([-a * x0 * x0, -b, 0]), 'Differentiate: $\\partial_x(x^2) = 2x$.'], [o([-2 * a * x0, 0, 0]), 'The $y$-term has a slope too: $-\\partial_yV$.']],
        md`$\mathbf E = -\nabla V = ${poly([[-2 * a, 'x\\,\\hat x'], [-b, '\\hat y']])}$, which at $x = ${x0}$ is $${vecTeX(E)}$ V/m.`), { _in: { a, b, x0, E } });
    },
    // circulation from a uniform curl
    () => {
      const c = pick([-5, -3, 2, 3, 4, 6]), s = pick([1, 2, 3]), ccw = pick([true, false]);
      const val = (ccw ? 1 : -1) * c * s * s;
      const o = (v) => `$${num(v)}$ V`;
      return Object.assign(MC('Circulation', md`$\nabla\times\mathbf E = ${c}\,\hat z$ V/m², uniform. $\oint\mathbf E\cdot d\mathbf l$ around a square of side ${s} m in the $xy$-plane, ${ccw ? 'counterclockwise' : 'clockwise'} seen from $+z$, is…`, o(val),
        [[o(-val), `Right-hand rule: ${ccw ? 'counterclockwise' : 'clockwise'} from $+z$ puts $d\\mathbf S$ along $${ccw ? '+' : '-'}\\hat z$.`], [o((ccw ? 1 : -1) * c * s), 'Multiply by the area, not the side.'], ['$0$ V', 'Zero only for a curl-free field.']],
        md`Stokes: $(${c}\ \text{V/m}^2)(${ccw ? '+' : '-'}1)(${s}\ \text{m})^2 = ${num(val)}$ V.`), { _in: { c, s, ccw, val } });
    },
  ]);

  // ---------------------------------------------------------------- R3 problems
  GENS.r1_vfrome = () => {
    let A, B, Cc, V0, Pt, VP;
    do {
      A = pick([-3, -2, -1, 1, 2, 3]); B = pick([-3, -2, -1, 1, 2, 3]); Cc = pick([-4, -2, -1, 1, 2, 4]); V0 = pick([0, 1, 2, 5]);
      Pt = [pick([-2, -1, 1, 2]), pick([-2, -1, 1, 2]), pick([-2, -1, 1, 2])];
      VP = A * Pt[0] ** 2 * Pt[1] + B * Pt[1] * Pt[2] + Cc * Pt[2] + V0;          // V = A x^2 y + B y z + C z + V0
    } while (VP === 0 || VP === V0);
    const q = pick([1, 2, 5]);
    const rhoP = -2 * A * Pt[1];                                                // rho/eps0 = div E = -2 A y
    const W = q * (VP - V0);                                                    // µJ for q in µC
    const Ex = poly([[-2 * A, 'xy']]), Ey = poly([[-A, 'x^2'], [-B, 'z']]), Ez = poly([[-B, 'y'], [-Cc, '']]);
    const Vs = poly([[A, 'x^2y'], [B, 'yz'], [Cc, 'z'], [V0, '']]);
    return {
      title: 'Potential from a field',
      q: md`In free space $\mathbf E = (${Ex})\,\hat x + (${Ey})\,\hat y + (${Ez})\,\hat z$ V/m, and $V(0, 0, 0) = ${V0}$ V. Find $V$ at $P = (${Pt.join(', ')})$ m, the charge density at $P$, and the work needed to move $q = ${q}$ µC slowly from the origin to $P$.`,
      parts: [N('$V(P)$', VP, 'V'), N('$\\rho(P)/\\epsilon_0$', rhoP, 'V/m^2'), N('$W$', W, 'µJ')],
      hints: ['Check the curl, then find $V$ with $-\\partial_xV = E_x$, $-\\partial_yV = E_y$, $-\\partial_zV = E_z$. Start from the $E_x$ term.', '$\\rho/\\epsilon_0 = \\nabla\\cdot\\mathbf E$; the work is $W = q\\,[V(P) - V(O)]$.'],
      sol: sol({
        eq: md`$V(P) = V(O) - \int_O^P\mathbf E\cdot d\mathbf l$; $\rho = \epsilon_0\nabla\cdot\mathbf E$; $W = q\,\Delta V$.`,
        sym: md`$-\partial_xV = ${Ex}$ gives the $${poly([[A, 'x^2y']])}$ term; $-\partial_yV$ then needs $${poly([[B, 'yz']])}$; $-\partial_zV$ needs $${poly([[Cc, 'z']])}$. So $V = ${Vs}$ V. $\nabla\cdot\mathbf E = \partial_x(${Ex}) + \partial_y(${Ey}) + \partial_z(${Ez}) = ${poly([[-2 * A, 'y']])}$.`,
        sub: md`$V(P) = ${A}(${Pt[0]})^2(${Pt[1]}) + (${B})(${Pt[1]})(${Pt[2]}) + (${Cc})(${Pt[2]}) + ${V0} = ${VP}$ V. $\rho/\epsilon_0 = ${-2 * A}(${Pt[1]}) = ${rhoP}$ V/m². $W = (${q}\ \mu\text{C})(${VP} - ${V0}\ \text{V}) = ${W}$ µJ.`,
        ans: md`$V(P) = ${VP}$ V; $\rho(P) = ${cf(rhoP, '\\epsilon_0')}$ C/m³ $= ${f(rhoP * EPS0)}$ C/m³; $W = ${W}$ µJ.`,
        check: md`$-\nabla(${Vs}) = (${Ex},\ ${Ey},\ ${Ez})$ ✓; the curl is zero, as it must be for a gradient.`,
      }),
      _in: { A, B, Cc, V0, Pt, q, VP, rhoP, W },
    };
  };

  GENS.r1_diode = () => {
    const Va = pick([2, 5, 10, 20, 50, 100]), dmm = pick([1, 2, 4, 5, 10]), [fr, ft] = pick([[1, '1'], [0.5, '\\tfrac12'], [0.125, '\\tfrac18']]);
    const d = dmm * 1e-3;
    const v = Math.sqrt(2 * QE * Va / ME) * fr ** (2 / 3);
    const Ed = 4 / 3 * Va / d;
    const rs = 4 / 3 * EPS0 * Va / d;
    return {
      title: 'Vacuum diode',
      q: md`A vacuum diode has its cathode on $x = 0$ and its anode on $x = d = ${dmm}$ mm, with the anode at $V_a = ${Va}$ V. Between them $V(x) = V_a(x/d)^{4/3}$. Electrons leave the cathode at rest. Find an electron's speed at $x = ${ft}\,d$, the field strength at the anode, and the surface charge density on the anode.`,
      parts: [N(`$v$ at $x = ${ft}\\,d$`, v, 'm/s'), N('$|E_x|$ at the anode', Ed, 'V/m'), N('$\\rho_s$ on the anode', rs * 1e9, 'nC/m^2')],
      hints: ['Energy: $\\tfrac12m_ev^2 = eV(x)$.', '$E_x = -dV/dx$. The anode is a conductor: $\\rho_s = \\hat n\\cdot\\mathbf D$ with $\\hat n$ pointing out of the anode, along $-\\hat x$.'],
      sol: sol({
        eq: md`$\tfrac12m_ev^2 = eV(x)$; $E_x = -\dfrac{dV}{dx}$; $\rho_s = \hat n\cdot\mathbf D$ at the anode, $\hat n = -\hat x$.`,
        sym: md`$v = \sqrt{2eV_a/m_e}\,(x/d)^{2/3}$; $E_x = -\tfrac43\dfrac{V_a}{d}\left(\dfrac xd\right)^{1/3}$, so $|E_x(d)| = \tfrac43V_a/d$; $\rho_s = -\epsilon_0E_x(d) = \tfrac43\epsilon_0V_a/d$.`,
        sub: md`$$v = \sqrt{\frac{2(1.602\times10^{-19})(${Va})}{9.109\times10^{-31}}}\,\left(${fr}\right)^{2/3} = ${f(v)}\ \text{m/s},\quad |E_x(d)| = \frac{4(${Va}\ \text{V})}{3(${num(d)}\ \text{m})} = ${f(Ed)}\ \text{V/m},\quad \rho_s = \epsilon_0|E_x(d)| = ${f(rs)}\ \text{C/m}^2$$`,
        ans: md`$v = ${f(v)}$ m/s; $|E_x| = ${f(Ed)}$ V/m at the anode, pointing toward the cathode ($-\hat x$); $\rho_s = ${f(rs * 1e9)}$ nC/m², positive.`,
        check: md`The field points from the high-potential anode toward the cathode, so it pushes electrons toward the anode ✓; its lines start on the positive anode charge and end on the electrons' space charge ✓.`,
      }),
      _in: { Va, d, fr, v, Ed, rs },
    };
  };

  // ---------------------------------------------------------------- R3 bank
  EM.BANK['r1-potential'] = [
    Q(md`Along a field line, in the direction of $\mathbf E$, the potential…`,
      ['decreases', 'increases', 'stays constant', 'depends on the sign of the charge that made it'], 0,
      [null, '$\\mathbf E = -\\nabla V$: the field points downhill.', 'Equipotentials are perpendicular to field lines, not along them.', '$V$ is a property of the field, the same for any test charge.'],
      md`$dV = -\mathbf E\cdot d\mathbf l < 0$ along $\mathbf E$.`),
    Q(md`$\mathbf E = E_0\hat x$ uniform. $V(x)$ with $V(0) = 0$ is…`,
      ['$-E_0x$', '$E_0x$', '$-E_0x^2/2$', '$E_0$'], 0,
      [null, 'Sign: $V$ falls along $\\mathbf E$.', 'A uniform field gives a linear potential.', 'That is the field, not the potential.'],
      md`$V(x) - V(0) = -\int_0^xE_0\,dx' = -E_0x$.`),
    Q(md`$\mathbf E = 3x\,\hat x + y\,\hat y + 2z^2\,\hat z$ V/m and $V(0, 0, 0) = 0$ (HW 3 #4). $V(1, 2, 3)$ is…`,
      ['$-21.5$ V', '$+21.5$ V', '$-43$ V', '$-3.5$ V'], 0,
      [null, 'Sign: $V = -\\int\\mathbf E\\cdot d\\mathbf l$.', 'Twice the answer: the legs add to $\\tfrac32 + 2 + 18 = \\tfrac{43}{2}$, not 43.','That leaves out the $z$ leg: $\\int_0^32z^2dz = 18$.'],
      md`$-\left[\int_0^13x\,dx + \int_0^2y\,dy + \int_0^32z^2dz\right] = -(1.5 + 2 + 18) = -21.5$ V.`),
    Q(md`A potential has a local minimum at a point in free space. Then…`,
      ['there must be charge there', 'nothing special: potentials often have minima in charge-free space', 'the field is largest there', '$\\nabla^2V < 0$ there'], 0,
      [null, 'Laplace\'s equation ($\\rho = 0$) forbids local minima and maxima.', 'At a minimum $\\nabla V = 0$: the field is zero.', 'At a minimum the curvature is positive, so $\\rho = -\\epsilon_0\\nabla^2V < 0$.'],
      md`$\nabla^2V > 0$ at a minimum, so $\rho = -\epsilon_0\nabla^2V < 0$: negative charge (Summer 2019 #2(a): $V = \tfrac12(x^2 + y^2)$ needs $\rho = -2\epsilon_0$).`),
    Q(md`$V = x^2y + 3$ V. The charge density is…`,
      ['$-2\\epsilon_0y$ C/m³', '$+2\\epsilon_0y$ C/m³', '$-2\\epsilon_0xy$ C/m³', '0'], 0,
      [null, 'Sign: $\\rho = -\\epsilon_0\\nabla^2V$.', '$\\partial_x^2(x^2y) = 2y$; $\\partial_y^2(x^2y) = 0$.', 'The potential is curved in $x$.'],
      md`$\nabla^2V = 2y$, so $\rho = -2\epsilon_0y$ (Summer 2017 #2(b)).`),
    Q(md`$\mathbf E = \hat x\sin(\pi y/2)$ V/m. From $O = (0, 0, 0)$ to $P = (1, 1, 0)$ m, $\int_O^P\mathbf E\cdot d\mathbf l$ is…`,
      ['path dependent: 0 along $x$ first (at $y = 0$), then up; 1 V up first, then along $x$ at $y = 1$', 'always 1 V', 'always 0', 'always $2/\\pi$ V'], 0,
      [null, 'Across first, along $y = 0$, gives 0.', 'Up first, then across at $y = 1$, gives 1 V.', '$2/\\pi$ V is the straight diagonal only; other paths give other values.'],
      md`The field has curl, so the integral depends on the path (Summer 2018 #2(b)). Along $x$ at $y = 0$ then up: 0. Up then along $x$ at $y = 1$: 1 V.`),
    Q(md`A 4 µC charge is moved slowly from a point at 10 V to a point at 25 V. The work you do is…`,
      ['60 µJ', '$-60$ µJ', '100 µJ', '15 µJ'], 0,
      [null, 'Moving a positive charge uphill takes positive work.', 'That uses 25 V alone; use the difference.', 'Multiply by the charge.'],
      md`$W = q\,\Delta V = (4\ \mu\text{C})(15\ \text{V}) = 60$ µJ.`),
    Q(md`The potential of a point charge at distance $r$ (zero at infinity) is $V$. At $2r$ it is…`,
      ['$V/2$', '$V/4$', '$2V$', '$V$'], 0,
      [null, 'That is how the field scales.', 'Farther from the charge, $|V|$ shrinks.', '$V \\propto 1/r$.'],
      md`$V = Q/4\pi\epsilon_0r$; the field $E \propto 1/r^2$ goes to $E/4$.`),
    Q(md`Inside a slab of uniform $\rho$ ($|x| < 1$ m), $\mathbf E = (\rho x/\epsilon_0)\,\hat x$. With $V(0) = 0$, $V(x)$ inside is…`,
      ['$-\\rho x^2/2\\epsilon_0$', '$+\\rho x^2/2\\epsilon_0$', '$-\\rho x/\\epsilon_0$', '$-\\rho x^2/\\epsilon_0$'], 0,
      [null, 'Sign: the field points away from the center (for $\\rho > 0$), so $V$ falls outward.', 'That is $-E_x$ itself; integrate it.', 'The integral of $x$ is $x^2/2$.'],
      md`$V = -\int_0^x\rho x'/\epsilon_0\,dx' = -\rho x^2/2\epsilon_0$; for $\rho = 4$ C/m³ that is $-2x^2/\epsilon_0$ (Summer 2020 #2(a)).`),
    Q(md`Equipotential surfaces and field lines meet at…`,
      ['right angles', 'any angle', 'zero angle: they run together', '45°'], 0,
      [null, 'Along an equipotential $dV = -\\mathbf E\\cdot d\\mathbf l = 0$, so $\\mathbf E \\perp d\\mathbf l$.', 'Moving along $\\mathbf E$ changes $V$.', 'No special angle besides 90°.'],
      md`$\mathbf E = -\nabla V$ is normal to the surfaces of constant $V$.`),
    Q(md`A proton and an electron are each accelerated from rest through 100 V. Which is true?`,
      ['same kinetic energy; the electron is about 43 times faster', 'same speed', 'the proton has 1836 times more energy', 'the electron has 1836 times more energy'], 0,
      [null, 'Same energy, very different masses: $v = \\sqrt{2KE/m}$.', 'Energy is $e\\Delta V$, the same for both.', 'Energy is $e\\Delta V$, the same for both.'],
      md`Both gain 100 eV. $v \propto 1/\sqrt m$: $\sqrt{1836} \approx 43$.`),
    Q(md`Spring 2018 #2: around the square path with $\mathbf E = 2\hat x - 3\hat y + 5\hat z$ V/m (uniform), $\oint\mathbf E\cdot d\mathbf l$ is…`,
      ['0', '20 V', '$-4$ V', '8 V'], 0,
      [null, 'That would need a curl; a uniform field has none.', 'A uniform field is curl-free: zero around any closed path.', 'Opposite sides cancel exactly.'],
      md`A uniform field is $-\nabla(-\mathbf E\cdot\mathbf r)$: conservative, zero circulation.`, { src: 'Spring 2018 Exam 1' }),
  ];

  // ================================================================ R4 — conductors, boundaries and charged plates
  EM.lesson('u6', {
    id: 'r1-conductors', topic: 'R4', order: 4, ref: 'Lectures 7–8', title: 'Conductors, boundaries and charged plates',
    steps: [
      R(md`
        !!key Why you care
          Every summer Exam 1 has a plates problem (Summer 2017 #3(b), Summer 2018 #3(b), Summer 2019 #3(b), Summer 2020 #3(b)) and concentric shells (Summer 2017–2019 #3(a)); Spring 2018 #4 is a boundary jump and #5 a conducting shell pair. HW 3 #1(d), #6, #7. On Exam 2 these rules carry over to dielectrics ([Topic 1](#/l/t1-dielectrics)), capacitance and conductance ([Topic 2](#/l/t2-capacitance)), and the magnetic boundary conditions.

        ### Notation

        - **Conductor in static equilibrium:** $\mathbf E = 0$ and $\rho = 0$ inside, $V$ constant throughout, excess charge only on the surface, as $\rho_s$ (C/m²).
        - $\hat n$: unit normal at a surface. At a conductor it points **out of the metal**; at an interface, from region 1 (below) into region 2 (above).
        - $D_n = \hat n\cdot\mathbf D$: the normal component. $\mathbf E_t$: the tangential component.
        - "Grounded": held at $V = 0$. It fixes the potential, not the charge.
        - $\nabla^2V = 0$: Laplace's equation, which holds wherever $\rho = 0$; in one dimension it makes $V$ linear.

        ### The idea

        Free charge in a metal moves until it feels no force: $\mathbf E = 0$ inside, $V$ constant. The excess charge sits on the surface, and just outside the field leaves perpendicular to it with $D_n = \rho_s$. Across any charged interface, a thin pillbox and a thin closed loop give the two boundary conditions:
        $$\hat n\cdot(\mathbf D_2 - \mathbf D_1) = \rho_s, \qquad \mathbf E_{t2} = \mathbf E_{t1}$$
      `),
      RF(md`
        ### Step 1: metal, and the charge it induces

        Inside metal, $\mathbf D = 0$; just outside, $\mathbf D = \rho_s\hat n$. A Gaussian surface drawn inside a conducting shell encloses zero net charge, so the shell's **inner** surface carries $-Q_{enc}$ (minus everything inside the cavity) and its **outer** surface carries the rest of the shell's charge, $Q_{shell} + Q_{enc}$.

        [[fig:shells]]

        For concentric spheres: find $\mathbf D$ in each gap from $Q_{enc}$, set it to zero in metal, then read every surface charge as $\rho_s = \pm D_r$ at that surface. A dielectric layer divides $E$ by $\epsilon_r$ but leaves $\mathbf D$ alone ([Topic 1](#/l/t1-dielectrics)).
      `, { shells: { svg: shellsFig(), cap: 'Metal sphere $r < a$ with $Q_1$; metal shell $b < r < c$ with net $Q_2$. Inner surface $-Q_1$, outer surface $Q_1 + Q_2$.' } }),
      Q(md`**Predict.** A neutral, thick conducting spherical shell surrounds a point charge $+q$ placed **off center** in its cavity. Outside the shell, $\mathbf E$ is…`,
        ['that of $+q$ at the shell\'s center', 'zero: the metal shields it', 'that of $+q$ at its actual position', 'zero, unless the shell is grounded'], 0,
        [null, 'The outer surface carries $+q$, and its field reaches outside. Grounding would remove it.', 'The metal hides the position: only the outer surface\'s charge is felt outside.', 'Backwards: grounding is what would make it zero.'],
        md`Inner surface: $-q$, crowded near the charge, so the metal sees no field. Outer surface: $+q$, spread **uniformly** (the metal decouples it from the cavity), so outside the field is that of $+q$ at the center.`),
      R(md`
        ### Step 2: boundary conditions

        Pillbox: the normal $\mathbf D$ jumps by the free surface charge, $D_{n2} - D_{n1} = \rho_s$ with $\hat n$ from 1 into 2. Thin loop: $\mathbf E_t$ is continuous, because $\oint\mathbf E\cdot d\mathbf l = 0$. With different permittivities on the two sides, $\mathbf D_t = \epsilon\mathbf E_t$ jumps instead.

        At a metal surface region 1 is the metal ($\mathbf D_1 = 0$), which turns the jump into $\rho_s = D_n$ just outside.
      `),
      Q(md`**Predict.** Just below $y = 6$ m, $\mathbf D = 2\epsilon_0\hat x + 4\epsilon_0\hat y$ C/m²; just above, $D_y = 2\epsilon_0$ C/m² (free space on both sides). The surface charge on $y = 6$ m is…`,
        ['$-2\\epsilon_0$ C/m²', '$+2\\epsilon_0$ C/m²', '$6\\epsilon_0$ C/m²', '$0$, since $D_x$ is continuous'], 0,
        [null, 'Above minus below, with $\\hat n = +\\hat y$: $2\\epsilon_0 - 4\\epsilon_0$.', 'The jump is the difference, not the sum.', 'The tangential part says nothing about $\\rho_s$; the normal part jumps.'],
        md`$\rho_s = \hat y\cdot(\mathbf D_{\text{above}} - \mathbf D_{\text{below}}) = 2\epsilon_0 - 4\epsilon_0 = -2\epsilon_0$ C/m² (HW 3 #6(a)). Fewer field lines leave than arrive: negative charge absorbs them.`),
      RF(md`
        ### Step 3: charged plates

        Between plates (or plates and a charged sheet) $\rho = 0$, so $d^2V/dz^2 = 0$: $V$ is a straight line in each gap, kinked only where there is surface charge. Then $E_z = -\Delta V/\Delta z$ in each gap, $D_z = \epsilon_0E_z$, and:
        - on a plate, $\rho_s = \hat n\cdot\mathbf D$ with $\hat n$ pointing into the gap: $+D_z$ on the bottom plate, $-D_z$ on the top plate;
        - on a sheet between gaps, $\rho_s = D_z(\text{above}) - D_z(\text{below})$.

        The surface charges add to zero: no field escapes above or below the plates.

        [[fig:plates]]
      `, { plates: { svg: platesFig(), cap: 'The worked example below: $V$ is linear in each gap, so $\\mathbf E$ is uniform in each.' } }),
      Q(md`**Predict.** Plates on $z = 0$ (at $V = 0$) and $z = 2$ m (at $V = 4$ V), vacuum between. The surface charge on the bottom plate is…`,
        ['$-2\\epsilon_0$ C/m²', '$+2\\epsilon_0$ C/m²', '$-4\\epsilon_0$ C/m²', '$0$, since the plate is grounded'], 0,
        [null, 'The field points down, from the 4 V plate toward the grounded one, so it ends on the bottom plate: negative charge.', '$E = 4\\ \\text{V}/2\\ \\text{m} = 2$ V/m, not 4.', 'Grounded fixes $V$, not the charge.'],
        md`$E_z = -(4 - 0)/2 = -2$ V/m, so $D_z = -2\epsilon_0$; bottom plate, $\hat n = +\hat z$: $\rho_s = -2\epsilon_0$ C/m². The top plate carries $+2\epsilon_0$.`),
      R(md`
        ### The method

        !!method Conductors and boundaries
          1. **Mark the metal:** $\mathbf E = \mathbf D = 0$ and $V$ constant inside every conductor.
          2. **Fields elsewhere:** Gauss with $Q_{enc}$ (shells), or Laplace (plates: $V$ linear between known potentials).
          3. **Surface charge:** $\rho_s = \hat n\cdot(\mathbf D_2 - \mathbf D_1)$; on metal, $\rho_s = \hat n\cdot\mathbf D$ with $\hat n$ out of the metal.
          4. **Check:** the charges add up (plates: to zero; shells: to the given net charges), $\mathbf E_t$ is continuous, and field lines start on $+$ and end on $-$.

        ### Worked example

        !!graded Problem
          Conducting plates on $z = 0$ and $z = 3$ m are held at $V(0) = 0$ and $V(3) = 6$ V, with vacuum between. The plane $z = 1$ m carries a surface charge $\rho_{s1}$ that holds it at $V(1) = -3$ V. Find $\mathbf E$ below and above $z = 1$ m, and the surface charge densities $\rho_{s0}$, $\rho_{s1}$ and $\rho_{s3}$.

        **1. Potential.** $\rho = 0$ in each gap, so $V$ is linear: $V = -3z$ V for $0 < z < 1$ m; $V = -3 + 4.5(z - 1)$ V for $1 < z < 3$ m.

        **2. Fields.** $\mathbf E_1 = -\nabla V = +3\,\hat z$ V/m (from $V = 0$ down to $-3$ V: pointing up, toward lower $V$). $\mathbf E_2 = -4.5\,\hat z$ V/m. So $\mathbf D_1 = 3\epsilon_0\hat z$ and $\mathbf D_2 = -4.5\epsilon_0\hat z$ C/m².

        **3. Plates.** Bottom, $\hat n = +\hat z$: $\rho_{s0} = D_{1z} = 3\epsilon_0$ C/m². Top, $\hat n = -\hat z$: $\rho_{s3} = -D_{2z} = 4.5\epsilon_0$ C/m².

        **4. Sheet.** $\rho_{s1} = D_{2z} - D_{1z} = -4.5\epsilon_0 - 3\epsilon_0 = -7.5\epsilon_0$ C/m² $= -6.64\times10^{-11}$ C/m².

        **5. Check.** $3 + 4.5 - 7.5 = 0$ ✓. Both fields point toward the $-3$ V sheet, the lowest potential, which holds the negative charge ✓.

        !!mistake Common mistakes
          - The top plate's normal points **down**, into the gap: $\rho_s = -D_z$ there.
          - Taking "grounded" to mean "uncharged". Spring 2018 #5(b): $\mathbf E = 0$ for $r < a$ because metal with no charge inside encloses that region, not because it is grounded.
          - Using $\rho_s = \epsilon_0E_n$ at an interface between different media: use the jump in $D_n$, with each side's own $\epsilon$.
          - Forgetting induced charge: a conducting shell's inner surface holds $-Q_{enc}$, whatever its net charge.
          - Treating $\mathbf E$ as continuous across a charged sheet: $E_n$ jumps by $\rho_s/\epsilon_0$. $V$ is continuous.
          - Assuming $V$ is linear where $\rho \ne 0$: there $V$ curves (Poisson), as in the vacuum diode.

        ### Check questions
      `),
      Q(md`$\mathbf E = 4\hat r$ V/m just outside the cylinder $r = 3$ m (free space outside) and $\mathbf E = 2\hat r$ V/m just inside it, where $\epsilon = 5\epsilon_0$. The free surface charge on $r = 3$ m is…`,
        ['$-6\\epsilon_0$ C/m²', '$+2\\epsilon_0$ C/m²', '$+6\\epsilon_0$ C/m²', '$14\\epsilon_0$ C/m²'], 0,
        [null, 'That subtracts the fields; the jump is in $D = \\epsilon E$, each side with its own $\\epsilon$.', 'Order: outside minus inside, $\\hat n = +\\hat r$.', 'The jump is a difference, not a sum.'],
        md`$\rho_s = D_{out} - D_{in} = \epsilon_0(4) - 5\epsilon_0(2) = -6\epsilon_0$ C/m².`, { src: 'Spring 2018 Exam 1' }),
      Q(md`A grounded metal sphere ($r = a$) sits inside a concentric metal shell ($r = b$) at $V_0 > 0$. True or false: "$\mathbf E$ is zero for $r < a$ **because** the inner sphere is grounded."`,
        ['False', 'True'], 0,
        [null, '$\\mathbf E = 0$ inside any conductor in equilibrium, grounded or not; grounding only sets $V = 0$.'],
        md`False. The field inside metal vanishes whatever its potential; grounding fixes the value of the constant $V$, here 0.`, { src: 'Spring 2018 Exam 1' }),
      Q(md`A metal sphere ($r \le a$) holds $Q = -2$ C; a neutral metal shell occupies $b \le r \le c$ (a dielectric fills $a < r < b$). The charge density on the shell's inner surface, $r = b$, is…`,
        ['$+\\dfrac{1}{2\\pi b^2}$ C/m²', '$-\\dfrac{1}{2\\pi b^2}$ C/m²', '$0$, since the shell is neutral', '$+\\dfrac{2}{\\pi b^2}$ C/m²'], 0,
        [null, 'The inner surface carries minus the enclosed charge: $+2$ C.', 'Neutral overall: $+2$ C inside, $-2$ C outside.', 'Divide $+2$ C by the area $4\\pi b^2$.'],
        md`Inside the metal $D = 0$, so a Gaussian sphere there encloses zero: the inner surface holds $+2$ C, $\rho_s = 2/4\pi b^2 = 1/2\pi b^2$ C/m². The dielectric does not change it.`, { src: 'Summer 2017 Exam 1' }),
      Q(md`Plates on $z = 0$ and $z = 2$ m at $V(0) = 0$ and $V(2) = 4$ V; the plane $z = 1$ m is held at $V(1) = -2$ V. The surface charge on $z = 1$ m is…`,
        ['$-8\\epsilon_0$ C/m²', '$+8\\epsilon_0$ C/m²', '$-4\\epsilon_0$ C/m²', '$-2\\epsilon_0$ C/m²'], 0,
        [null, 'The $-2$ V plane is the lowest point: field lines end on it, so it is negative.', 'Below it $E_z = +2$ V/m, above it $E_z = -6$ V/m: the jump is $-6 - 2 = -8$.', 'That is $\\epsilon_0V(1)$, not a jump in $D_z$.'],
        md`$D_z = 2\epsilon_0$ below and $-6\epsilon_0$ above, so $\rho_{s1} = -6\epsilon_0 - 2\epsilon_0 = -8\epsilon_0$ C/m². The plates carry $2\epsilon_0$ (bottom) and $6\epsilon_0$ (top): total zero.`, { src: 'Summer 2018 Exam 1' }),
      Q(md`Just outside a conductor's surface, $\mathbf E$…`,
        ['is perpendicular to the surface', 'is parallel to the surface', 'is zero', 'can point any way'], 0,
        [null, 'A tangential $\\mathbf E$ outside would match one inside ($\\mathbf E_t$ continuous), but inside $\\mathbf E = 0$.', 'Only if $\\rho_s = 0$ there.', '$\\mathbf E_t$ is continuous and zero inside the metal, so only the normal part survives.'],
        md`$\mathbf E_t = 0$ inside and is continuous, so outside $\mathbf E = (\rho_s/\epsilon_0)\hat n$.`),
      Q(md`An uncharged cavity is carved inside a solid conductor that sits in a strong external field. In the cavity, $\mathbf E$ is…`,
        ['zero', 'the external field', 'half the external field', 'perpendicular to the cavity walls'], 0,
        [null, 'The conductor\'s surface charges cancel it everywhere inside, cavity included.', 'With no charge in the cavity and $V$ constant on its wall, $V$ is constant inside: no field.', 'No field crosses into a charge-free cavity.'],
        md`The cavity wall is an equipotential with no charge inside it, so $V$ is constant throughout the cavity: a Faraday cage.`),
      Q(md`In the plates problems, why do the surface charges on the two plates and the sheet always add to zero?`,
        ['the field is zero outside the plates, so a pillbox around everything encloses no charge', 'charge is conserved', 'the plates are grounded', 'by coincidence of the chosen numbers'], 0,
        [null, 'Conservation does not stop the plates from being charged; the zero field outside does.', 'Only one plate is usually grounded, and grounding fixes $V$, not $Q$.', 'It holds for any potentials.'],
        md`Inside the metal of both plates $\mathbf D = 0$; a pillbox from inside the bottom plate to inside the top plate has zero flux, so it encloses zero charge.`),
      Q(md`A metal sphere with charge $Q$ is coated with a dielectric shell of permittivity $\epsilon$ ($a < r < b$). In the dielectric…`,
        ['$D = Q/4\\pi r^2$ and $E = Q/4\\pi\\epsilon r^2$', '$D = Q/4\\pi r^2$ and $E = Q/4\\pi\\epsilon_0r^2$', '$D = \\epsilon Q/4\\pi\\epsilon_0r^2$ and $E = Q/4\\pi\\epsilon_0r^2$', '$D = E = 0$'], 0,
        [null, 'The dielectric reduces $E$: $E = D/\\epsilon$.', 'Gauss fixes $D$ from the free charge alone: $D = Q/4\\pi r^2$.', 'That is the inside of the metal, not the dielectric.'],
        md`$\oint\mathbf D\cdot d\mathbf S = Q$ gives $D$; then $E = D/\epsilon$. The bound charge on the dielectric's inner surface is what weakens $E$ (HW 3 #7).`),
      R(md`
        ### Rapid fire: conductors and boundaries

        **The trick:** metal first ($\mathbf E = 0$ inside); then $\rho_s = \hat n\cdot\Delta\mathbf D$ with $\hat n$ pointing out of the metal or from region 1 into region 2.
      `),
      Object.assign(G('rf_r1_cond', { need: 8 }), { id: 'r1-conductors.r0' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('r1_plates', { need: 2 }),
      G('r1_shells', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- R4 rapid fire
  GENS.rf_r1_cond = () => one([
    // two plates
    () => {
      const d = pick([1, 2, 4, 5]), V1 = pick([-10, -4, -2, 2, 4, 10]), top = pick([true, false]);
      const Ez = -V1 / d, s = top ? -Ez : Ez;                   // plate z = 0 at V = 0, plate z = d at V1
      const o = (v) => `$${cf(v, '\\epsilon_0')}$ C/m²`;
      return Object.assign(MC('Plates', md`Plates on $z = 0$ (at 0 V) and $z = ${d}$ m (at $${V1}$ V), vacuum between. The surface charge on the **${top ? 'top' : 'bottom'}** plate is…`, o(s),
        [[o(-s), `$\\hat n$ points out of the plate into the gap: ${top ? '$-\\hat z$ for the top plate' : '$+\\hat z$ for the bottom plate'}.`], [o(top ? V1 : -V1), 'Divide the voltage by the spacing to get the field.'], ['$0$', 'A plate at 0 V still carries charge; grounding fixes $V$, not $Q$.']],
        md`$E_z = -${V1 < 0 ? `(${V1})` : V1}/${d} = ${num(Ez)}$ V/m, $D_z = ${cf(Ez, '\\epsilon_0')}$. ${top ? 'Top plate, $\\hat n = -\\hat z$: $\\rho_s = -D_z$' : 'Bottom plate, $\\hat n = +\\hat z$: $\\rho_s = D_z$'} $= ${cf(s, '\\epsilon_0')}$ C/m².`), { _in: { d, V1, top, s } });
    },
    // the jump in D_n
    () => {
      const Db = pick([-6, -4, -2, 2, 3, 5]), s = pick([-4, -2, 2, 3, 8]);
      const Da = Db + s;
      const o = (v) => `$${num(v)}$ C/m²`;
      return Object.assign(MC('Boundary jump', md`Just below the plane $z = 0$, $D_z = ${Db}$ C/m². The plane carries $\rho_s = ${s}$ C/m². Just above it, $D_z = $`, o(Da),
        [[o(Db - s), 'Above minus below equals $+\\rho_s$, with $\\hat n = +\\hat z$.'], [o(s), 'The jump is $\\rho_s$; the field below still counts.'], [o(Db + s / 2), 'The whole $\\rho_s$, not half: the jump is the full surface charge.']],
        md`$D_z(\text{above}) = D_z(\text{below}) + \rho_s = ${Db} + (${s}) = ${Da}$ C/m².`), { _in: { Db, s, Da } });
    },
    // induced charge on a conducting shell
    () => {
      const q = pick([-3, -2, 1, 2, 5]), Qs = pick([-4, -1, 0, 2, 3]), inner = pick([true, false]);
      const ans = inner ? -q : q + Qs;
      const o = (v) => `$${num(v)}$ µC`;
      return Object.assign(MC('Induced charge', md`A point charge $${q}$ µC sits in the cavity of a thick conducting shell that carries net charge $${Qs}$ µC. The total charge on the shell's **${inner ? 'inner' : 'outer'}** surface is…`, o(ans),
        inner ? [[o(q), 'Sign: the inner surface cancels the field of the enclosed charge inside the metal.'], [o(Qs), 'The shell\'s own net charge goes to the outer surface.'], [o(-q + Qs), 'Gauss inside the metal fixes the inner surface at $-q$ alone.']]
          : [[o(Qs), 'The outer surface also carries the $+q$ that the inner surface\'s $-q$ left behind.'], [o(Qs - q), 'Inner $-q$ plus outer must equal the net $Q_s$: outer $= Q_s + q$.'], [o(q), 'The shell\'s own net charge sits there too.']],
        md`Gauss inside the metal: inner surface $-q = ${-q}$ µC. Net charge fixes the outer surface: $Q_s - (-q) = ${q + Qs}$ µC.`), { _in: { q, Qs, inner, ans } });
    },
    // tangential E across an interface
    () => {
      const Et = pick([1, 2, 3, 5]), En = pick([2, 4, 6]), er = pick([2, 3, 4]), askT = pick([true, false]);
      const ans = askT ? Et : En / er;
      const o = (v) => `$${num(v)}$ V/m`;
      return Object.assign(MC('Across an interface', md`Free space ($z < 0$) meets a dielectric with $\epsilon = ${er}\epsilon_0$ ($z > 0$); no free surface charge. Just below, $\mathbf E = ${Et}\,\hat x + ${En}\,\hat z$ V/m. Just above, $E_${askT ? 'x' : 'z'} = $`, o(ans),
        askT ? [[o(Et / er), 'The tangential **E** is continuous; it is $\\mathbf D_t$ that scales with $\\epsilon$.'], [o(Et * er), 'The tangential **E** is continuous, whatever the media.'], [o(En / er), 'That is the normal component.']]
          : [[o(En), 'The normal **D** is continuous (no free charge), so $E_z$ drops by $\\epsilon_r$.'], [o(En * er), 'Inside the denser dielectric $E_n$ is smaller, not larger.'], [o(Et), 'That is the tangential component.']],
        askT ? md`$\mathbf E_t$ is continuous: $E_x = ${Et}$ V/m on both sides.` : md`$D_z$ is continuous: $\epsilon_0(${En}) = ${er}\epsilon_0E_z$, so $E_z = ${num(En / er)}$ V/m.`), { _in: { Et, En, er, askT, ans } });
    },
    // field just outside a conductor
    () => {
      const sN = pick([-5, -2, 1, 3, 8]);
      const E = sN * 1e-9 / EPS0;
      const o = (v, out) => `$${f(Math.abs(v))}$ V/m, ${out ? 'pointing away from the surface' : 'pointing into the surface'}`;
      return Object.assign(MC('Just outside metal', md`A conductor's surface carries $\rho_s = ${sN}$ nC/m². Just outside, $\mathbf E$ is…`, o(E, sN > 0),
        [[o(E, sN < 0), sN > 0 ? 'Positive surface charge sends field lines out.' : 'Negative surface charge pulls field lines in.'], [o(E / 2, sN > 0), 'That is a lone sheet\'s $\\rho_s/2\\epsilon_0$. At a conductor all the flux goes out one side.'], [`$0$`, 'Zero is inside the metal; just outside $E = \\rho_s/\\epsilon_0$.']],
        md`$E = |\rho_s|/\epsilon_0 = ${Math.abs(sN)}\times10^{-9}/8.854\times10^{-12} = ${f(Math.abs(E))}$ V/m, normal to the surface.`), { _in: { sN, E } });
    },
  ]);

  // ---------------------------------------------------------------- R4 problems
  GENS.r1_plates = () => {
    let L, h, V0, VL, Vh, E1, E2;
    do {
      L = pick([2, 3, 4]); h = pick([1, 2, 3].filter((v) => v < L));
      V0 = pick([0, 0, 2, -2]); VL = pick([-6, -4, 3, 4, 6, 8]); Vh = pick([-6, -3, -2, 1, 5, 9, 12]);
      E1 = -(Vh - V0) / h; E2 = -(VL - Vh) / (L - h);
    } while (Math.abs(E1) < 1e-9 || Math.abs(E2) < 1e-9 || Math.abs(E2 - E1) < 1e-9);
    const s0 = E1, s1 = E2 - E1, sL = -E2;                          // in units of eps0 (C/m^2 per F/m = V/m)
    const ve = (v) => cf(v, '\\epsilon_0');
    return {
      title: 'Plates and a charged sheet',
      q: md`Conducting plates on $z = 0$ and $z = ${L}$ m are held at $V(0) = ${V0}$ V and $V(${L}) = ${VL}$ V, with vacuum between. The plane $z = ${h}$ m carries surface charge $\rho_{s1}$ that holds it at $V(${h}) = ${Vh}$ V. Find $E_z$ below and above $z = ${h}$ m, and the surface charges on the bottom plate, the sheet and the top plate (as multiples of $\epsilon_0$).`,
      parts: [N(`$E_z$ for $0 < z < ${h}$ m`, E1, 'V/m'), N(`$E_z$ for $${h} < z < ${L}$ m`, E2, 'V/m'), N('$\\rho_{s0}/\\epsilon_0$ (bottom plate)', s0, 'V/m'), N(`$\\rho_{s1}/\\epsilon_0$ (sheet)`, s1, 'V/m'), N('$\\rho_{s2}/\\epsilon_0$ (top plate)', sL, 'V/m')],
      hints: ['No charge in either gap: $V$ is linear in each. $E_z = -\\Delta V/\\Delta z$.', 'Plates: $\\rho_s = \\hat n\\cdot\\mathbf D$ with $\\hat n$ into the gap ($+\\hat z$ at the bottom, $-\\hat z$ at the top). Sheet: $D_z$ above minus $D_z$ below.'],
      sol: sol({
        eq: md`$d^2V/dz^2 = 0$ in each gap; $E_z = -dV/dz$; $\rho_s = \hat n\cdot(\mathbf D_2 - \mathbf D_1)$.`,
        sym: md`$E_1 = -\dfrac{V(${h}) - V(0)}{${h}}$, $E_2 = -\dfrac{V(${L}) - V(${h})}{${L - h}}$; $\rho_{s0} = \epsilon_0E_1$, $\rho_{s1} = \epsilon_0(E_2 - E_1)$, $\rho_{s2} = -\epsilon_0E_2$.`,
        sub: md`$E_1 = -(${Vh} - (${V0}))/${h} = ${num(E1)}$ V/m; $E_2 = -(${VL} - (${Vh}))/${L - h} = ${num(E2)}$ V/m. $\rho_{s0} = ${ve(s0)}$, $\rho_{s1} = ${num(E2)}\epsilon_0 - (${num(E1)})\epsilon_0 = ${ve(s1)}$, $\rho_{s2} = ${ve(sL)}$ C/m².`,
        ans: md`$E_z = ${num(E1)}$ V/m below and $${num(E2)}$ V/m above the sheet; $\rho_{s0} = ${ve(s0)}$, $\rho_{s1} = ${ve(s1)}$, $\rho_{s2} = ${ve(sL)}$ C/m².`,
        check: md`$${num(s0)} + (${num(s1)}) + (${num(sL)}) = 0$ ✓: no field escapes the plates. Each $\mathbf E$ points from the higher to the lower potential ✓.`,
      }),
      _in: { L, h, V0, VL, Vh, E1, E2, s0, s1, sL },
    };
  };

  GENS.r1_shells = () => {
    let a, b, c, Q1, Q2, V0;
    do {
      a = pick([0.1, 0.2]); b = a * pick([2, 3]); c = +(b + pick([0.05, 0.1])).toFixed(2);
      Q1 = pick([-5, -2, -1, 1, 2, 5]); Q2 = pick([-4, -3, -1, 1, 3, 4]);
      V0 = K * 1e-9 * ((Q1 + Q2) / c + Q1 * (1 / a - 1 / b));
    } while (Q1 + Q2 === 0 || Math.abs(V0) < 5);
    const r = +((a + b) / 2).toFixed(3);
    const E = K * Q1 * 1e-9 / r ** 2;
    const sb = -Q1 / (4 * Math.PI * b * b), sc = (Q1 + Q2) / (4 * Math.PI * c * c);        // nC/m^2
    return {
      title: 'Metal sphere in a metal shell',
      q: md`A metal sphere of radius $a = ${a}$ m carries $Q_1 = ${Q1}$ nC. A concentric metal shell, $b = ${num(b)}$ m $< r <$ $c = ${c}$ m, carries net charge $Q_2 = ${Q2}$ nC. Free space elsewhere. Find $E_r$ at $r = ${r}$ m, the surface charge densities on $r = b$ and $r = c$, and the potential of the inner sphere (zero at infinity).`,
      parts: [N(`$E_r$ at $r = ${r}$ m`, E, 'V/m'), N('$\\rho_s$ on $r = b$', sb, 'nC/m^2'), N('$\\rho_s$ on $r = c$', sc, 'nC/m^2'), N('$V$ of the inner sphere', V0, 'V')],
      hints: ['Gauss in each region; $\\mathbf E = 0$ inside the shell\'s metal, so its inner surface carries $-Q_1$ and its outer surface $Q_1 + Q_2$.', 'Integrate in from infinity: $V(a) = \\dfrac{Q_1 + Q_2}{4\\pi\\epsilon_0c} + \\dfrac{Q_1}{4\\pi\\epsilon_0}\\left(\\dfrac1a - \\dfrac1b\\right)$ (no drop across the metal).'],
      sol: sol({
        eq: md`$4\pi r^2D_r = Q_{enc}$; $\mathbf E = 0$ in metal; $\rho_s = \hat n\cdot\mathbf D$; $V(a) = -\int_\infty^a E_r\,dr$.`,
        sym: md`For $a < r < b$: $E_r = Q_1/4\pi\epsilon_0r^2$. Inner surface of the shell: $-Q_1$, so $\rho_s(b) = -Q_1/4\pi b^2$. Outer surface: $Q_1 + Q_2$, so $\rho_s(c) = (Q_1 + Q_2)/4\pi c^2$. $V(a) = \dfrac{Q_1 + Q_2}{4\pi\epsilon_0c} + \dfrac{Q_1}{4\pi\epsilon_0}\left(\dfrac1a - \dfrac1b\right)$.`,
        sub: md`$$E_r = \frac{(8.99\times10^9)(${Q1}\times10^{-9})}{(${r})^2} = ${f(E)}\ \text{V/m},\quad \rho_s(b) = \frac{${-Q1}\ \text{nC}}{4\pi(${num(b)})^2} = ${f(sb)}\ \text{nC/m}^2,\quad \rho_s(c) = \frac{${Q1 + Q2}\ \text{nC}}{4\pi(${c})^2} = ${f(sc)}\ \text{nC/m}^2$$
        $$V(a) = (8.99)\left[\frac{${Q1 + Q2}}{${c}} + (${Q1})\left(\frac{1}{${a}} - \frac{1}{${num(b)}}\right)\right]\ \text{V} = ${f(V0)}\ \text{V}$$`,
        ans: md`$E_r = ${f(E)}$ V/m; $\rho_s(b) = ${f(sb)}$ nC/m², $\rho_s(c) = ${f(sc)}$ nC/m²; $V = ${f(V0)}$ V.`,
        check: md`Outside, the system looks like a point charge $Q_1 + Q_2 = ${Q1 + Q2}$ nC ✓. The shell's two surfaces add to its net charge: $${-Q1} + ${Q1 + Q2} = ${Q2}$ nC ✓.`,
      }),
      _in: { a, b, c, Q1, Q2, r, E, sb, sc, V0 },
    };
  };

  // ---------------------------------------------------------------- R4 bank
  EM.BANK['r1-conductors'] = [
    Q(md`A charged conductor in static equilibrium. Its potential…`,
      ['is the same everywhere in and on it', 'is largest where the surface charge is densest', 'is zero inside', 'drops from the surface toward the center'], 0,
      [null, 'Surface charge density varies, the potential does not: $\\mathbf E = 0$ inside means no potential difference.', 'Constant, but not necessarily zero.', 'With $\\mathbf E = 0$ inside, $V$ cannot change.'],
      md`$\mathbf E = 0$ inside, so $V(b) - V(a) = -\int_a^b\mathbf E\cdot d\mathbf l = 0$ between any two of its points.`),
    Q(md`Where does excess charge on a solid conductor sit?`,
      ['on its outer surface', 'spread uniformly through its volume', 'at its center', 'half inside, half on the surface'], 0,
      [null, 'A charge density inside would make $\\nabla\\cdot\\mathbf E \\ne 0$, but $\\mathbf E = 0$ there.', 'Like charges repel to the farthest places they can reach.', 'Any interior charge would make a field inside.'],
      md`$\rho = \epsilon_0\nabla\cdot\mathbf E = 0$ inside, so the excess must be on the surface.`),
    Q(md`A 1 m² metal plate in free space carries $\rho_s = 3$ nC/m² on its top face. Just above that face, $E$ is about…`,
      ['339 V/m', '169 V/m', '3 V/m', '0'], 0,
      [null, 'That is $\\rho_s/2\\epsilon_0$, a lone sheet. At a conductor the flux leaves one side only.', 'That forgets $\\epsilon_0$.', 'Zero is inside the metal.'],
      md`$E = \rho_s/\epsilon_0 = 3\times10^{-9}/8.854\times10^{-12} = 339$ V/m.`),
    Q(md`Two infinite plates: $z = 0$ at $V = 0$ and $z = d$ at $V = V_0 > 0$, vacuum between. The bottom plate carries…`,
      ['$-\\epsilon_0V_0/d$', '$+\\epsilon_0V_0/d$', '$0$', '$-\\epsilon_0V_0$'], 0,
      [null, 'The field points down toward the bottom plate: lines end there, negative charge.', 'Grounded is not uncharged.', 'Divide by the spacing: $E = V_0/d$.'],
      md`$E_z = -V_0/d$, $D_z = -\epsilon_0V_0/d$, $\rho_s = \hat z\cdot\mathbf D = -\epsilon_0V_0/d$.`),
    Q(md`Across an interface with free surface charge $\rho_s$, which quantity is **always** continuous?`,
      ['the tangential $\\mathbf E$', 'the normal $\\mathbf D$', 'the normal $\\mathbf E$', 'the tangential $\\mathbf D$'], 0,
      [null, 'It jumps by $\\rho_s$.', 'It jumps by $\\rho_s$, and by the ratio of permittivities.', 'It jumps when the permittivities differ.'],
      md`$\oint\mathbf E\cdot d\mathbf l = 0$ around a thin loop straddling the interface forces $\mathbf E_{t1} = \mathbf E_{t2}$, whatever the charge.`),
    Q(md`In HW 3 #6, filling $0 < y < 6$ m with $\epsilon = 4\epsilon_0$ (same $\mathbf D$ given there) leaves which answer unchanged?`,
      ['the surface charge on $y = 6$ m', 'the field above $y = 6$ m', 'the voltage from $y = 0$ to $y = 6$ m', 'the field below $y = 0$'], 0,
      [null, '$E_x$ in the middle becomes $2\\epsilon_0/4\\epsilon_0 = 0.5$ V/m, and $E_t$ is continuous, so $D_x$ above changes.', '$E_y$ in the middle drops to 1 V/m: 6 V instead of 24 V.', 'Its $x$-part follows the middle region\'s $E_x$.'],
      md`$\rho_s = D_{y,\text{above}} - D_{y,\text{below}}$ uses only the given normal components of $\mathbf D$. Everything that goes through $\mathbf E$ changes.`),
    Q(md`A point charge $q$ sits at the center of a **grounded** conducting shell. Outside the shell, $\mathbf E$ is…`,
      ['zero', 'that of $q$', 'that of $-q$', 'that of $q/2$'], 0,
      [null, 'Grounding drains the outer surface\'s $+q$: nothing is left outside.', 'The inner surface\'s $-q$ cancels $q$ for anything outside.', 'Grounding sets the outside to zero, not to $q/2$.'],
      md`Inner surface $-q$ (always). Grounding keeps the shell at $V = 0$, the same as infinity, which leaves no charge on the outer surface: no field outside.`),
    Q(md`Spring 2018 #5: a grounded inner sphere ($r = a$) and an outer shell ($r = b$) at $V_0 > 0$. Which shell holds the positive charge?`,
      ['the outer one, at $V_0$', 'the inner one', 'neither: the gap is neutral', 'both'], 0,
      [null, 'The field points from high to low potential, inward, so lines start on the outer shell.', 'The charges are $\\pm Q$ on the two surfaces facing the gap.', 'One is $+Q$, the other $-Q$.'],
      md`$V$ falls from $V_0$ at $b$ to 0 at $a$: $\mathbf E$ points inward, starting on positive charge at $r = b$ and ending on negative charge at $r = a$. "The inner shell is positive" is false.`, { src: 'Spring 2018 Exam 1' }),
    Q(md`Between a plate at $z = 0$ and one at $z = d$, a sheet at $z = h$ is held at a potential **below** both plates. Its surface charge is…`,
      ['negative', 'positive', 'zero', 'positive or negative, depending on $h$'], 0,
      [null, 'Field lines run down to the lowest potential and end there, on negative charge.', 'The kink in $V$ needs charge: $\\rho_s = D_z(\\text{above}) - D_z(\\text{below}) < 0$.', 'Below: $E_z > 0$; above: $E_z < 0$. The jump is negative for any $h$.'],
      md`$V$ is a V-shape with its tip at the sheet: $E_z$ jumps from positive to negative, so $\rho_s < 0$ (Summer 2018 and 2020 #3(b)). A sheet held **above** both plates is positive (Summer 2017 and 2019 #3(b)).`),
    Q(md`HW 3 #1(d): in the vacuum diode, the anode's surface charge density is…`,
      ['$+\\tfrac43\\epsilon_0V_a/d$', '$-\\tfrac43\\epsilon_0V_a/d$', '$\\epsilon_0V_a/d$', '$0$, since the anode is a conductor'], 0,
      [null, 'Sign: $\\hat n$ points out of the anode, along $-\\hat x$, and $D_x(d) < 0$: the product is positive.', 'The space charge makes the field at the anode $\\tfrac43$ of the plain-capacitor value.', 'A conductor\'s charge sits on its surface; that is what is asked.'],
      md`$E_x(d) = -\tfrac43V_a/d$; $\rho_s = (-\hat x)\cdot\epsilon_0E_x\hat x = \tfrac43\epsilon_0V_a/d$ (with $V_a = 2$ V: $8\epsilon_0/3d$).`),
    Q(md`A metal sphere ($r \le 1$ m) holds $+4$ C; a dielectric $\epsilon = 2\epsilon_0$ fills $1 < r < 2$ m. In the dielectric, $\mathbf P = \mathbf D - \epsilon_0\mathbf E$ is…`,
      ['$\\dfrac{1}{2\\pi r^2}\\hat r$ C/m²', '$\\dfrac{1}{\\pi r^2}\\hat r$ C/m²', '$\\dfrac{1}{\\pi\\epsilon_0r^2}\\hat r$', '$0$'], 0,
      [null, 'That is $\\mathbf D$ itself.', 'Wrong units: $\\mathbf P$ is in C/m², like $\\mathbf D$.', 'A dielectric with $\\epsilon \\ne \\epsilon_0$ is polarized.'],
      md`$D = 4/4\pi r^2 = 1/\pi r^2$; $\epsilon_0E = D/2$; $P = D/2 = 1/2\pi r^2$ C/m² (Summer 2018 #3(a)).`, { src: 'Summer 2018 Exam 1' }),
    Q(md`Summer 2019: plates at $V(0) = 0$ and $V(2) = -4$ V, with $V(1) = 1$ V on the sheet $z = 1$ m. The bottom plate's surface charge is…`,
      ['$-\\epsilon_0$ C/m²', '$+\\epsilon_0$ C/m²', '$-5\\epsilon_0$ C/m²', '$6\\epsilon_0$ C/m²'], 0,
      [null, 'Below the sheet $V$ rises from 0 to 1 V: $E_z = -1$ V/m points down, into the bottom plate.', 'That is the top plate.', 'That is the sheet.'],
      md`$E_z = -1$ V/m, $D_z = -\epsilon_0$; with $\hat n = +\hat z$, $\rho_{s0} = -\epsilon_0$. Above: $E_z = +5$ V/m, so the top plate has $-5\epsilon_0$ and the sheet $6\epsilon_0$ (sum zero).`, { src: 'Summer 2019 Exam 1' }),
  ];

  // ================================================================ Homework 1–3
  const intro = (n, due, topics, extra = '') => R(md`**Homework ${n}** · due ${due}. ${topics}

Work each problem on paper first, with units, as you would hand it in. Then enter your answers to check them and open the solution to compare. The solutions follow the official key; where the key is wrong or terse, the solution says so.${extra}`);

  // ---------------------------------------------------------------- HW figures
  // HW 1 #2: the yz-plane with the two charges and the fields at P3, P4, P5
  function hw1Fig() {
    const g = PF.fig({ alt: 'the yz-plane: Q1 (negative) at z = -1, Q2 (positive) at z = 1; E3 = -3 z-hat at the origin, E4 = 0.78 z-hat at z = 2, E5 at y = -1 pointing mostly toward -z and slightly up' });
    const X = (z) => 150 + 50 * z, Y = (y) => 90 - 50 * y, k = 24;
    g.axes(150, 90, { x: [-125, 150], y: [-80, 50], xl: 'z', yl: 'y' });
    g.charge(X(-1), Y(0), { q: '-', lab: 'Q_1', at: 't' });
    g.charge(X(1), Y(0), { q: '+', lab: 'Q_2', at: 't' });
    g.arrow(X(0), Y(0) + 14, X(0) - 3 * k, Y(0) + 14, { cls: 'thick', hs: 7 }); g.label(X(0) - 3 * k - 4, Y(0) + 14, '\\mathbf E_3', 'r', 'small');
    g.dot(X(0), Y(0)); g.label(X(0) + 5, Y(0) + 4, 'P_3', 'tl', 'small');
    g.dot(X(2), Y(0)); g.label(X(2), Y(0) + 6, 'P_4', 't', 'small');
    g.arrow(X(2), Y(0) - 16, X(2) + 0.778 * k, Y(0) - 16, { cls: 'thick', hs: 6 }); g.label(X(2) + 0.778 * k + 3, Y(0) - 18, '\\mathbf E_4', 'l', 'small');
    g.dot(X(0), Y(-1)); g.label(X(0) + 6, Y(-1) + 2, 'P_5', 'l', 'small');
    g.arrow(X(0), Y(-1), X(0) - 1.061 * k, Y(-1) - 0.354 * k, { cls: 'thick', hs: 6 }); g.label(X(0) - 1.061 * k - 4, Y(-1) - 0.354 * k, '\\mathbf E_5', 'r', 'small');
    return g.svg();
  }
  // HW 2 #3: top view of the xy-plane
  function hw2ChargesFig() {
    const g = PF.fig({ alt: 'top view of the xy-plane: Q1 at x = 1 and Q2 at x = -1 on the x-axis; the plane x = 0 (the yz-plane) and the plane y = 1 shown as dashed lines' });
    const X = (x) => 130 + 50 * x, Y = (y) => 110 - 50 * y;
    g.axes(130, 110, { x: [-100, 105], y: [-50, 95], xl: 'x', yl: 'y' });
    g.line(X(0) + 0.01, Y(-0.9), X(0) + 0.01, Y(1.7), { cls: 'dash' }); g.label(X(0) + 5, Y(1.7), 'x = 0', 'tl', 'small');
    g.line(X(-1.8), Y(1), X(1.9), Y(1), { cls: 'dash' }); g.label(X(1.9), Y(1) - 4, 'y = 1', 'br', 'small');
    g.dot(X(1), Y(0), 3.5); g.label(X(1), Y(0) + 7, 'Q_1', 't', 'small');
    g.dot(X(-1), Y(0), 3.5); g.label(X(-1), Y(0) + 7, 'Q_2', 't', 'small');
    return g.svg();
  }
  // HW 2 #6: two vertical sheets and the origin
  function hw2SheetsFig() {
    const g = PF.fig({ alt: 'two charged sheets parallel to the yz-plane, rho_s1 on the left and rho_s2 on the right of the origin O' });
    g.axes(140, 90, { x: [-110, 110], y: [-60, 70], xl: 'x', yl: 'z' });
    g.sheet(90, 48, 155, { lab: '\\rho_{s1}' });
    g.sheet(190, 48, 155, { lab: '\\rho_{s2}' });
    g.label(144, 94, 'O', 'tl', 'small');
    return g.svg();
  }
  const hw2Ecyl = () => PF.plot({ w: 300, h: 180, x: [0, 3], y: [0, 1.15], xl: 'r', yl: '|E|/|E(R)|', xt: [[0, '0'], [1, 'R'], [2, '2R'], [3, '3R']], yt: [[1, '1']], curves: [{ f: (r) => (r < 1 ? r : 1 / r), n: 400 }] });
  const hw2Eslabs = () => PF.plot({ w: 340, h: 200, x: [-3, 3], y: [-1.3, 1.3], zero: true, xl: 'z', yl: '\\epsilon_0E_z/\\rho_0W', xt: [[-3, '-3W'], [-2, '-2W'], [-1, '-W'], [1, 'W'], [2, '2W'], [3, '3W']], yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: (z) => (z < -2 ? 1 : z < -1 ? -(z + 1) : z < 1 ? 0 : z < 2 ? -(z - 1) : -1), n: 600 }] });
  // HW 3 #1: the diode's field and charge
  const hw3Ex = () => PF.plot({ w: 300, h: 180, x: [0, 1], y: [-1.5, 0.1], zero: true, xl: 'x/d', yl: 'E_x/(V_a/d)', xt: [[0.5, '0.5'], [1, '1']], yt: [[-4 / 3, '-4/3']], curves: [{ f: (s) => -4 / 3 * Math.cbrt(s), n: 400 }] });
  const hw3rho = () => PF.plot({ w: 300, h: 180, x: [0, 1], y: [-3, 0.1], zero: true, xl: 'x/d', yl: '\\rho/(\\epsilon_0V_a/d^2)', xt: [[0.5, '0.5'], [1, '1']], yt: [[-4 / 9, '-4/9'], [-2, '-2']], curves: [{ f: (s) => -4 / 9 / Math.cbrt(s * s), from: 0.01, n: 400 }] });
  // HW 3 #5: the triangular path
  function hw3PathFig() {
    const g = PF.fig({ alt: 'a triangle in the xy-plane traversed from (-1,-1) up to (-1,1), right to (1,1), then down the diagonal back to (-1,-1)' });
    const X = (x) => 120 + 50 * x, Y = (y) => 110 - 50 * y;
    g.axes(120, 110, { x: [-90, 95], y: [-90, 90], xl: 'x', yl: 'y' });
    // arrowheads a third of the way along each edge (the midpoints sit on the axes)
    const edge = (a, b) => { g.line(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), { cls: 'thick' }); const t = 0.35; g.head(X(a[0] + (b[0] - a[0]) * t), Y(a[1] + (b[1] - a[1]) * t), X(b[0]) - X(a[0]), Y(b[1]) - Y(a[1]), { hs: 9 }); };
    edge([-1, -1], [-1, 1]); edge([-1, 1], [1, 1]); edge([1, 1], [-1, -1]);
    g.label(X(-1) - 4, Y(-1) + 2, '(-1,-1)', 'tr', 'small'); g.label(X(-1) - 4, Y(1), '(-1,1)', 'br', 'small'); g.label(X(1) + 4, Y(1), '(1,1)', 'bl', 'small');
    return g.svg();
  }
  const fig = (svg, cap) => ({ svg, cap });

  // ---------------------------------------------------------------- HW 1
  const hw1 = [
    intro(1, 'Thursday, September 3, 2026', 'Vector algebra, Coulomb fields, the Lorentz force, current density and continuity, Gauss\'s law. Six problems.',
      PARA + 'The HW 1 problem sheet itself is not among the sources: the statements below are restated from the official solutions, with the numbers and geometry the key uses.'),
    R(md`### Problem 1 · Vector algebra`),
    P({ src: 'HW 1 #1(a)–(c)', q: md`Consider
$$\mathbf A = \hat x + 3\hat y - 2\hat z,\qquad \mathbf B = \hat x + \hat y - \hat z,\qquad \mathbf C = -\hat x + 3\hat y + 2\hat z$$
(a) Find $\mathbf A - \mathbf B + 3\mathbf C$. (b) Find its magnitude $|\mathbf A - \mathbf B + 3\mathbf C|$. (c) Find the unit vector $\hat u$ along $\mathbf A + 2\mathbf B - \mathbf C$.`,
      parts: [N('(a) $x$-component', -3, ''), N('(a) $y$-component', 11, ''), N('(a) $z$-component', 5, ''), N('(b) magnitude', Math.sqrt(155), ''), N('(c) $u_x$', 4 / Math.sqrt(56), ''), N('(c) $u_y$', 2 / Math.sqrt(56), ''), N('(c) $u_z$', -6 / Math.sqrt(56), '')],
      sol: md`(a) Component by component: $x$: $1 - 1 - 3 = -3$; $y$: $3 - 1 + 9 = 11$; $z$: $-2 + 1 + 6 = 5$.
$$\mathbf A - \mathbf B + 3\mathbf C = -3\hat x + 11\hat y + 5\hat z$$
(b) $|\mathbf A - \mathbf B + 3\mathbf C| = \sqrt{9 + 121 + 25} = \sqrt{155} = 12.45$.

(c) $\mathbf A + 2\mathbf B - \mathbf C = (1 + 2 + 1)\hat x + (3 + 2 - 3)\hat y + (-2 - 2 - 2)\hat z = 4\hat x + 2\hat y - 6\hat z$, with length $\sqrt{16 + 4 + 36} = \sqrt{56} = 7.48$:
$$\hat u = \frac{4\hat x + 2\hat y - 6\hat z}{\sqrt{56}} = 0.535\,\hat x + 0.267\,\hat y - 0.802\,\hat z$$
Check: $0.535^2 + 0.267^2 + 0.802^2 = 1.00$.` }),
    P({ src: 'HW 1 #1(d)–(f)', q: md`With the same $\mathbf A$, $\mathbf B$, $\mathbf C$: (d) Find $\mathbf A\cdot\mathbf B$. (e) Find $\mathbf B\times\mathbf C$. (f) Are $\mathbf B$ and $\mathbf C$ orthogonal?`,
      parts: [N('(d) $\\mathbf A\\cdot\\mathbf B$', 6, ''), N('(e) $x$-component', 5, ''), N('(e) $y$-component', -1, ''), N('(e) $z$-component', 4, ''),
        FX('(f) $\\mathbf B$ and $\\mathbf C$ are', ['orthogonal', 'not orthogonal'], 0, [null, '$\\mathbf B\\cdot\\mathbf C = -1 + 3 - 2 = 0$.'])],
      sol: md`(d) $\mathbf A\cdot\mathbf B = (1)(1) + (3)(1) + (-2)(-1) = 6 = \mathbf B\cdot\mathbf A$.

(e)
$$\mathbf B\times\mathbf C = \begin{vmatrix}\hat x & \hat y & \hat z\\ 1 & 1 & -1\\ -1 & 3 & 2\end{vmatrix} = \hat x(2 + 3) - \hat y(2 - 1) + \hat z(3 + 1) = 5\hat x - \hat y + 4\hat z$$
and $\mathbf C\times\mathbf B = -(\mathbf B\times\mathbf C)$. Check: $(\mathbf B\times\mathbf C)\cdot\mathbf B = 5 - 1 - 4 = 0$ ✓.

(f) $\mathbf B\cdot\mathbf C = -1 + 3 - 2 = 0$: **orthogonal**.` }),

    R(md`### Problem 2 · Fields of two point charges`),
    P({ src: 'HW 1 #2', q: md`Point charges $Q_1 = -8\pi\epsilon_0$ C at $P_1 = (0, 0, -1)$ m and $Q_2 = -Q_1/2$ at $P_2 = (0, 0, 1)$ m sit in free space. (a) Find $\mathbf E$ at $P_3 = (0, 0, 0)$, $P_4 = (0, 0, 2)$ and $P_5 = (0, -1, 0)$ m. (b) Sketch each field vector with the two contributions that make it.`,
      parts: [N('$E_z$ at $P_3$', -3, 'V/m'), N('$E_z$ at $P_4$', 7 / 9, 'V/m'), N('$E_y$ at $P_5$', 1 / (2 * Math.SQRT2), 'V/m'), N('$E_z$ at $P_5$', -3 / (2 * Math.SQRT2), 'V/m')],
      figs: { e: fig(hw1Fig(), 'The three fields (scaled). $\\mathbf E_3$ points away from $Q_2$ and toward $Q_1$; $\\mathbf E_4$ is a small net push away from $Q_2$.') },
      sol: md`$Q_2 = -Q_1/2 = 4\pi\epsilon_0$ C, so $Q_1/4\pi\epsilon_0 = -2$ V·m and $Q_2/4\pi\epsilon_0 = +1$ V·m. Use $\mathbf E = \sum\frac{Q_i}{4\pi\epsilon_0}\frac{\mathbf r - \mathbf r_i}{|\mathbf r - \mathbf r_i|^3}$.

(a) $P_3$: $\mathbf r_3 - \mathbf r_1 = \hat z$, $\mathbf r_3 - \mathbf r_2 = -\hat z$:
$$\mathbf E_3 = (-2)\frac{\hat z}{1} + (1)\frac{-\hat z}{1} = -3\hat z\ \text{V/m}$$
$P_4$: $\mathbf r_4 - \mathbf r_1 = 3\hat z$, $\mathbf r_4 - \mathbf r_2 = \hat z$:
$$\mathbf E_4 = (-2)\frac{3\hat z}{27} + (1)\frac{\hat z}{1} = \tfrac79\hat z = 0.778\,\hat z\ \text{V/m}$$
$P_5$: $\mathbf r_5 - \mathbf r_1 = -\hat y + \hat z$ and $\mathbf r_5 - \mathbf r_2 = -\hat y - \hat z$, both of length $\sqrt2$:
$$\mathbf E_5 = \frac{(-2)(-\hat y + \hat z) + (1)(-\hat y - \hat z)}{2\sqrt2} = \frac{\hat y - 3\hat z}{2\sqrt2} = 0.354\,\hat y - 1.061\,\hat z\ \text{V/m}$$

(b)

[[fig:e]]

At $P_3$ both pushes point along $-\hat z$ (toward the negative $Q_1$, away from the positive $Q_2$), so they add. At $P_4$ they oppose: $Q_2$ is three times closer and wins by $1 - \tfrac29$. At $P_5$, $Q_1$ pulls toward $(0, 0, -1)$ with $1$ V/m and $Q_2$ pushes away from $(0, 0, 1)$ with $\tfrac12$ V/m; the $\hat y$ parts partly cancel.` }),

    R(md`### Problem 3 · E and B from the Lorentz force`),
    P({ src: 'HW 1 #3', q: md`A test charge $q = 1$ C at the origin feels $\mathbf F_1 = 2\hat x - \hat y$ N at rest, $\mathbf F_2 = 2\hat x - 3\hat y$ N when moving with $\mathbf v_2 = -2\hat z$ m/s, and $\mathbf F_3 = 3\hat x - 2\hat y - \hat z$ N when moving with $\mathbf v_3 = \hat x + \hat y$ m/s. Find $\mathbf E$ and $\mathbf B$ at the origin.`,
      parts: [N('$E_x$', 2, 'V/m'), N('$E_y$', -1, 'V/m'),
        M('$\\mathbf B = $', ['$\\hat x + \\hat z$ T', '$-\\hat x + \\hat z$ T', '$\\hat x - \\hat z$ T', '$\\hat x$ T'], 0,
          [null, 'Sign of $B_x$: $(-2\\hat z)\\times B_x\\hat x = -2B_x\\hat y$ must equal $-2\\hat y$.', 'The $\\hat x$ part of $\\mathbf v_3\\times\\mathbf B$ is $B_z$, and it must be $+1$.', 'With $B_z = 0$, $\\mathbf v_3\\times\\mathbf B = -\\hat z$ only, not $\\hat x - \\hat y - \\hat z$.'])],
      sol: md`$\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B)$, the same $\mathbf E$ and $\mathbf B$ in all three cases.

**At rest:** $\mathbf E = \mathbf F_1/q = 2\hat x - \hat y$ V/m.

**Second measurement:** $\mathbf F_2 - \mathbf F_1 = -2\hat y = (-2\hat z)\times(B_x\hat x + B_y\hat y + B_z\hat z) = -2B_x\hat y + 2B_y\hat x$, so $B_x = 1$ T and $B_y = 0$.

**Third measurement:** $\mathbf F_3 - \mathbf F_1 = \hat x - \hat y - \hat z = (\hat x + \hat y)\times(\hat x + B_z\hat z) = -B_z\hat y - \hat z + B_z\hat x$, so $B_z = 1$ T (all three components agree).
$$\mathbf E = 2\hat x - \hat y\ \text{V/m},\qquad \mathbf B = \hat x + \hat z\ \text{T (Wb/m}^2)$$
Motion along $\hat z$ cannot see $B_z$, which is why the third velocity is needed.` }),

    R(md`### Problem 4 · Current out of a cube`),
    P({ src: 'HW 1 #4', q: md`The current density $\mathbf J = x^2y\,(\hat x + \hat y + \hat z)$ A/m² flows in the cube $0 \le x, y, z \le 2$ m. (a) Find the net current out of the cube, $\oint_S\mathbf J\cdot d\mathbf S$, by integrating over all six faces. (b) What does the result say about the charge inside? (c) What happens to the electric flux through the cube's surface?`,
      parts: [N('(a) $\\oint\\mathbf J\\cdot d\\mathbf S$', 80 / 3, 'A'),
        M('(b) The charge inside the cube is…', ['decreasing, at 26.7 C/s', 'increasing, at 26.7 C/s', 'constant'], 0, [null, 'Positive outward current carries charge away.', 'Charge leaves through the walls; it cannot also stay.']),
        M('(c) The outward flux $\\oint\\mathbf D\\cdot d\\mathbf S$ is…', ['decreasing, with the charge', 'increasing', 'unchanged'], 0, [null, 'Gauss: the flux equals the enclosed charge, which is falling.', 'Gauss: the flux equals the enclosed charge at every instant.'])],
      sol: md`(a) On each face only the normal component counts, with $d\mathbf S$ outward:

| face | $\mathbf J\cdot\hat n$ | integral |
|---|---|---|
| $x = 0$ ($-\hat x$) | $0$ | 0 |
| $x = 2$ ($+\hat x$) | $4y$ | $\int_0^2\!\int_0^2 4y\,dy\,dz = 16$ A |
| $y = 0$ ($-\hat y$) | $0$ | 0 |
| $y = 2$ ($+\hat y$) | $2x^2$ | $\int_0^2\!\int_0^2 2x^2\,dx\,dz = 32/3$ A |
| $z = 0$ ($-\hat z$) | $-x^2y$ | $-16/3$ A |
| $z = 2$ ($+\hat z$) | $x^2y$ | $+16/3$ A |

$$\oint_S\mathbf J\cdot d\mathbf S = 16 + \tfrac{32}{3} = \tfrac{80}{3} = 26.7\ \text{A}$$
Check with the divergence theorem: $\nabla\cdot\mathbf J = 2xy + x^2$, and $\int_V(2xy + x^2)\,dV = 16 + \tfrac{32}{3}$ ✓.

(b) Continuity, $\oint_S\mathbf J\cdot d\mathbf S = -dQ_{enc}/dt$: the charge inside **decreases** at 26.7 C/s.

(c) Gauss's law, $\oint_S\mathbf D\cdot d\mathbf S = Q_{enc}$: the electric flux out of the cube decreases with the charge, at the same rate.` }),

    R(md`### Problem 5 · An electron and a proton in a uniform field`),
    P({ src: 'HW 1 #5', q: md`An electron and a proton start at rest at the origin in free space, with $\mathbf E = E_0\hat z$ and $\mathbf B = 0$. (a) Find each acceleration. (b) With $E_0 = 1$ mV/m, where is each after 1 s? (c) Many of both start this way, each with density $N = 10^{12}$ m⁻³ (the value the key's number implies). Find the total current density $\mathbf J(t)$.`,
      parts: [N('(a) electron: $a_z/E_0$', -QE / ME, 'C/kg'), N('(a) proton: $a_z/E_0$', QE / MP, 'C/kg'), N('(b) electron: $z(1\\ \\text{s})$', -0.5 * QE / ME * 1e-3 / 1e3, 'km'), N('(b) proton: $z(1\\ \\text{s})$', 0.5 * QE / MP * 1e-3 / 1e3, 'km'), N('(c) $J_z/t$', QE * QE * 1e12 * 1e-3 * (1 / ME + 1 / MP), 'A/(m^2·s)')],
      sol: md`(a) Only the electric force acts: $m\mathbf a = q\mathbf E$.
$$\mathbf a_e = -\frac{eE_0}{m_e}\hat z = -1.76\times10^{11}E_0\,\hat z,\qquad \mathbf a_p = +\frac{eE_0}{m_p}\hat z = 9.58\times10^{7}E_0\,\hat z\quad(\text{m/s}^2,\ E_0\ \text{in V/m})$$
(b) From rest at the origin, $z = \tfrac12at^2$. With $E_0 = 10^{-3}$ V/m and $t = 1$ s:
$$z_e = -\tfrac12(1.76\times10^{8})(1)^2 = -8.79\times10^7\ \text{m} = -8.79\times10^4\ \text{km},\qquad z_p = \tfrac12(9.58\times10^4) = 4.79\times10^4\ \text{m} = 47.9\ \text{km}$$
(c) $\mathbf J = \sum Nq\mathbf v$ with $\mathbf v = \mathbf at$:
$$\mathbf J = -eN\left(-\frac{eE_0}{m_e}t\right)\hat z + eN\left(\frac{eE_0}{m_p}t\right)\hat z = e^2NE_0\left(\frac{1}{m_e} + \frac{1}{m_p}\right)t\,\hat z = 28.2\,t\ \hat z\ \ \text{A/m}^2$$
Both carriers add along $\mathbf E$ (each term has $q^2$); the proton's share is $m_e/m_p = 1/1836$ of the electron's. A current growing without bound is unphysical: in a real conductor collisions cap the speed at a drift velocity, giving a steady $\mathbf J = \sigma\mathbf E$.` }),

    R(md`### Problem 6 · Charge from a field, by Gauss's law`),
    P({ src: 'HW 1 #6', q: md`Find the total charge inside the cube $-1 \le x, y, z \le 1$ m in free space for (a) $\mathbf E = ky^2z^4\cos(\pi x)\,\hat x$ and (b) $\mathbf E = ky^2z^4e^x\,\hat x$, with $k = 3$ V/m⁷.`,
      parts: [M('(a) $Q$', ['$0$', '$-\\tfrac{8}{15}\\epsilon_0k$', '$-\\tfrac{4}{15}\\epsilon_0k$', '$\\tfrac{8}{15}\\epsilon_0k$'], 0,
        [null, 'That gives both faces the same outward normal. On $x = -1$ the normal is $-\\hat x$, which flips the sign.', 'That is the flux through the $x = +1$ face alone.', 'Both faces see $\\cos(\\pm\\pi) = -1$; with opposite normals they cancel.']),
        N('(b) $Q$', 8 / 15 * EPS0 * 3 * Math.sinh(1) * 1e12, 'pC')],
      sol: md`Gauss: $Q = \oint\mathbf D\cdot d\mathbf S$ with $\mathbf D = \epsilon_0\mathbf E$. The field is along $\hat x$, so only the faces $x = \pm1$ carry flux, with outward normals $\pm\hat x$. Both face integrals contain $\int_{-1}^1y^2dy\int_{-1}^1z^4dz = \tfrac23\cdot\tfrac25 = \tfrac{4}{15}$ m⁷.

(a) $\cos(\pi) = \cos(-\pi) = -1$: the face $x = 1$ gives $-\tfrac{4}{15}\epsilon_0k$, the face $x = -1$ gives $+\tfrac{4}{15}\epsilon_0k$. **$Q = 0$.** (Equivalently, $\rho = -\pi\epsilon_0ky^2z^4\sin(\pi x)$ is odd in $x$.)

(b)
$$Q = \epsilon_0k\left(e^{1} - e^{-1}\right)\tfrac{4}{15} = \tfrac{8}{15}\epsilon_0k\sinh1 = \tfrac{8}{15}(8.854\times10^{-12})(3)(1.175) = 1.66\times10^{-11}\ \text{C} = 16.6\ \text{pC}$$` }),
  ];

  // ---------------------------------------------------------------- HW 2
  const hw2 = [
    intro(2, 'Thursday, September 10, 2026', 'Forces from a sheet, Gauss\'s law and displacement flux, cylinders, slabs and sheets, curl and divergence. Reading: Kudeki, Lectures 3–6. Ten problems.'),
    R(md`### Problem 1 · Levitating above a charged sheet`),
    P({ src: 'HW 2 #1', q: md`A particle of mass $m = 36\pi\times10^{-3}$ kg and charge $Q$ is placed at $t = 0$ a distance $d = 9.8$ m above a planar sheet with uniform charge density $\rho_s = 9.8$ µC/m². The sheet is effectively infinite, in free space. (a) What charge $Q$ makes the particle levitate motionless where it was placed? (Treat $Q$ as a test charge.) (b) Now take $Q = 1$ C. Describe the motion for $t > 0$: find the acceleration $a(t)$, the velocity $v(t)$ and the distance from the sheet, with the sheet in the plane $z = 0$.`,
      parts: [N('(a) $Q$', 2, 'µC'), N('(b) $a$', 4.9e6, 'm/s^2'),
        M('(b) distance from the sheet', ['$9.8 + 2.45\\times10^{6}\\,t^2$ m', '$9.8 + 4.9\\times10^{6}\\,t^2$ m', '$9.8 - 2.45\\times10^{6}\\,t^2$ m', '$2.45\\times10^{6}\\,t^2$ m'], 0,
          [null, 'From rest, $z = z_0 + \\tfrac12at^2$: half of $a$.', 'With $Q = 1$ C the electric push far exceeds gravity: the particle flies up.', 'It starts at 9.8 m, not on the sheet.'])],
      sol: md`The sheet's field is $E = \rho_s/2\epsilon_0$, uniform, pointing up (away from the positive sheet). Use $\epsilon_0 = 10^{-9}/36\pi$ F/m, which the numbers are built for.

(a) Balance: $QE = mg$, so
$$Q = \frac{2\epsilon_0mg}{\rho_s} = \frac{2\cdot\frac{10^{-9}}{36\pi}\cdot36\pi\times10^{-3}\cdot9.8}{9.8\times10^{-6}} = 2\times10^{-6}\ \text{C} = 2\ \mu\text{C}$$
(With $\epsilon_0 = 8.854\times10^{-12}$ F/m: 2.003 µC.)

(b) $E = \rho_s/2\epsilon_0 = 5.54\times10^5$ V/m, so
$$a = \frac{QE}{m} - g = \frac{5.54\times10^5}{0.113} - 9.8 \approx 4.9\times10^6\ \text{m/s}^2\ \text{(up, constant)}$$
$$v(t) = 4.9\times10^6\,t\ \text{m/s},\qquad z(t) = 9.8 + 2.45\times10^6\,t^2\ \text{m}$$
Gravity is negligible next to the electric force; the particle accelerates straight up from the sheet.` }),

    R(md`### Problem 2 · Flux out of a small cube`),
    P({ src: 'HW 2 #2', q: md`Gauss's law: $\oint_S\mathbf E\cdot d\mathbf S = \frac{1}{\epsilon_0}\int_V\rho\,dV$. A cube of volume $V = L^3$ with $L = 2$ mm is centered on the origin. (a) Find $\oint_S\mathbf E\cdot d\mathbf S$ if $\rho = 2$ C/m³ inside. (b) Repeat for $\rho = x^2 + y^2 + z^2$ C/m³. (c) Find $\oint_S\mathbf D\cdot d\mathbf S$ for (b). (d) Find the displacement flux in (b) through any one face of the cube.`,
      parts: [N('(a)', 16e-9 / EPS0, 'V·m'), N('(b)', 8e-15 / EPS0, 'V·m'), N('(c)', 8, 'fC'), N('(d)', 4 / 3, 'fC')],
      sol: md`(a) $Q = \rho L^3 = 2\times(2\times10^{-3})^3 = 1.6\times10^{-8}$ C:
$$\oint\mathbf E\cdot d\mathbf S = \frac{16\times10^{-9}}{\epsilon_0} = 1.81\times10^3\ \text{V·m}$$
(b) By symmetry each of the three terms gives the same integral:
$$\int_V(x^2 + y^2 + z^2)\,dV = 3\cdot L^2\int_{-L/2}^{L/2}x^2dx = 3\cdot L^2\cdot\frac{L^3}{12} = \frac{L^5}{4} = 8\times10^{-15}\ \text{C}$$
so $\oint\mathbf E\cdot d\mathbf S = 8\times10^{-15}/\epsilon_0 = 9.04\times10^{-4}$ V·m.

(c) $\oint\mathbf D\cdot d\mathbf S = Q_{enc} = 8\times10^{-15}$ C $= 8$ fC.

(d) The charge distribution looks the same from every face (it is symmetric under swapping and reflecting the axes), so each face carries one sixth: $\tfrac43\times10^{-15}$ C $= 1.33$ fC.` }),

    R(md`### Problem 3 · Two unknown charges from two fluxes`),
    P({ src: 'HW 2 #3', q: md`Unknown charges $Q_1$ and $Q_2$ sit at $(1, 0, 0)$ and $(-1, 0, 0)$. The displacement flux $\int_{yz\text{-plane}}\mathbf D\cdot\hat x\,dy\,dz$ through the whole $x = 0$ plane in the $+\hat x$ direction is $-2$ C. The displacement flux through the plane $y = 1$ in the $-\hat y$ direction is 1 C. Write two equations relating these fluxes to $Q_1$ and $Q_2$ and solve them.`,
      parts: [N('$Q_1$', 1, 'C'), N('$Q_2$', -3, 'C')],
      figs: { c: fig(hw2ChargesFig(), 'Top view. Each infinite plane catches half of each charge\'s flux.') },
      sol: md`[[fig:c]]

An infinite plane catches half of a point charge's flux, with the sign set by the direction of crossing.

$x = 0$, counted along $+\hat x$: $Q_2$ (at $x = -1$) sends $+Q_2/2$; $Q_1$ (at $x = +1$) sends its half toward $-x$, $-Q_1/2$:
$$-\tfrac12Q_1 + \tfrac12Q_2 = -2\ \text{C}$$
$y = 1$, counted along $-\hat y$: both charges are below the plane ($y = 0$), so their halves cross along $+\hat y$:
$$-\tfrac12Q_1 - \tfrac12Q_2 = 1\ \text{C}$$
Adding: $-Q_1 = -1$, so $Q_1 = 1$ C; then $Q_2 = -3$ C. Check: $(-1 - 3)/2 = -2$ ✓ and $-(1 - 3)/2 = 1$ ✓.` }),

    R(md`### Problem 4 · A charged cylinder`),
    P({ src: 'HW 2 #4', q: md`An infinitely long cylinder of radius $R = 1$ cm along the $z$-axis carries a uniform charge density $\rho_0$. Its field is radial. (a) Given $E_r = -\dfrac{1}{9\epsilon_0}$ V/m at $r = 3$ cm, use Gauss's law with a cylinder of radius 3 cm and length $L$ to find $\rho_0$. (b) Find the field inside, at $r = 0.5$ cm. (c) Show that $E$ is continuous at $r = R$, and sketch $|\mathbf E|$ for $0 < r < 3R$.`,
      parts: [N('(a) $\\rho_0$', -200 / 3, 'C/m^3'), N('(b) $D_r = \\epsilon_0E_r$ at 0.5 cm', -1 / 6, 'C/m^2')],
      figs: { p: fig(hw2Ecyl(), '$|\\mathbf E|$ grows linearly inside, peaks at $r = R$, and falls as $1/r$ outside.') },
      sol: md`(a) The caps carry no flux (the field is radial), so for $r > R$:
$$\epsilon_0E_r\,2\pi rL = \rho_0\pi R^2L\quad\Rightarrow\quad \rho_0 = \frac{2\epsilon_0E_rr}{R^2} = \frac{2\epsilon_0\left(-\frac{1}{9\epsilon_0}\right)(0.03)}{(0.01)^2} = -\frac{200}{3} = -66.7\ \text{C/m}^3$$
(b) Inside, the Gaussian cylinder encloses $\rho_0\pi r^2L$:
$$\epsilon_0E_r\,2\pi rL = \rho_0\pi r^2L\quad\Rightarrow\quad E_r = \frac{\rho_0r}{2\epsilon_0} = \frac{(-66.7)(0.005)}{2\epsilon_0} = -\frac{1}{6\epsilon_0} = -1.88\times10^{10}\ \text{V/m}$$
so $D_r = -\tfrac16$ C/m², pointing inward (negative charge).

(c) Outside $E_r = \rho_0R^2/2\epsilon_0r$, inside $E_r = \rho_0r/2\epsilon_0$. At $r = R$ both give $\rho_0R/2\epsilon_0$: continuous, since there is no surface charge.

[[fig:p]]` }),

    R(md`### Problem 5 · Two negative slabs`),
    P({ src: 'HW 2 #5', q: md`Two infinite slabs parallel to the $xy$-plane, each of width $W$ and uniform charge density $-\rho_0$: slab 1 fills $-2W < z < -W$, slab 2 fills $W < z < 2W$; no charge elsewhere. (a) Find and sketch $E_z$ for $-3W < z < 3W$ by superposing shifted single-slab fields; label the value at every break point. (b) Verify that your field satisfies $\nabla\cdot\mathbf D = \rho$ in each slab and in the free-space regions.`,
      parts: [N('$\\epsilon_0E_z/(\\rho_0W)$ for $z < -2W$', 1, ''), N('$\\epsilon_0E_z/(\\rho_0W)$ at $z = -1.5W$', 0.5, ''), M('For $-W < z < W$,', ['$E_z = 0$', '$E_z = -\\rho_0W/\\epsilon_0$', '$E_z = \\rho_0z/\\epsilon_0$'], 0, [null, 'Between the slabs their equal fields point opposite ways.', 'There is no charge between the slabs, and the two fields cancel there.']), N('$\\epsilon_0E_z/(\\rho_0W)$ for $z > 2W$', -1, '')],
      figs: { p: fig(hw2Eslabs(), 'Flat at $\\pm\\rho_0W/\\epsilon_0$ outside, zero between the slabs, linear (slope $-\\rho_0/\\epsilon_0$) inside each slab.') },
      sol: md`(a) A single slab of density $\rho$ and width $W$ gives $E_z = \rho(z - z_c)/\epsilon_0$ inside and $\pm\rho W/2\epsilon_0$ outside (away from it for $\rho > 0$). With $\rho = -\rho_0$:

Slab 1 ($z_c = -\tfrac32W$): $E_1 = +\frac{\rho_0W}{2\epsilon_0}$ for $z < -2W$; $-\frac{\rho_0}{\epsilon_0}(z + \tfrac32W)$ inside; $-\frac{\rho_0W}{2\epsilon_0}$ for $z > -W$.

Slab 2 ($z_c = +\tfrac32W$): $E_2 = +\frac{\rho_0W}{2\epsilon_0}$ for $z < W$; $-\frac{\rho_0}{\epsilon_0}(z - \tfrac32W)$ inside; $-\frac{\rho_0W}{2\epsilon_0}$ for $z > 2W$.

Sum:
$$E_z = \begin{cases}\rho_0W/\epsilon_0, & z < -2W\\ -\rho_0(z + W)/\epsilon_0, & -2W < z < -W\\ 0, & -W < z < W\\ -\rho_0(z - W)/\epsilon_0, & W < z < 2W\\ -\rho_0W/\epsilon_0, & z > 2W\end{cases}$$
Break points: $E_z = \rho_0W/\epsilon_0$ at $z = -2W$, $0$ at $z = \pm W$, $-\rho_0W/\epsilon_0$ at $z = 2W$. Outside, the field points **toward** the negative slabs.

[[fig:p]]

(b) $\nabla\cdot\mathbf D = \epsilon_0\,dE_z/dz$: inside either slab $\epsilon_0(-\rho_0/\epsilon_0) = -\rho_0$ ✓; in the three free-space regions $E_z$ is constant, so $0$ ✓.` }),

    R(md`### Problem 6 · Two sheets`),
    P({ src: 'HW 2 #6', q: md`An infinite sheet with charge density $\rho_s$ makes a field of size $\rho_s/2\epsilon_0$ pointing away from it on both sides. Two sheets lie parallel to the $yz$-plane, $\rho_{s1}$ to the left of the origin $O$ and $\rho_{s2}$ to the right. Using superposition, find the $\rho_{s2}$ that makes $\mathbf D = \epsilon_0\mathbf E = 6\hat x$ C/m² at $O$, if (a) $\rho_{s1} = 8$ C/m²; (b) $\rho_{s1} = -\rho_{s2}$.

[[fig:s]]`,
      figs: { s: fig(hw2SheetsFig(), 'Both sheets are parallel to the $yz$-plane; $O$ lies between them.') },
      parts: [N('(a) $\\rho_{s2}$', -4, 'C/m^2'), N('(b) $\\rho_{s2}$', -6, 'C/m^2')],
      sol: md`At $O$, sheet 1 (on the left) pushes along $+\hat x$ and sheet 2 (on the right) along $-\hat x$, each with half its density:
$$D_x(O) = \tfrac12\rho_{s1} - \tfrac12\rho_{s2}$$
(a) $4 - \tfrac12\rho_{s2} = 6$, so $\rho_{s2} = -4$ C/m².

(b) $\tfrac12(-\rho_{s2}) - \tfrac12\rho_{s2} = -\rho_{s2} = 6$, so $\rho_{s2} = -6$ C/m² (and $\rho_{s1} = +6$ C/m²: a capacitor, with $D = \rho_s$ between the sheets).` }),

    R(md`### Problem 7 · Curl and divergence`),
    P({ src: 'HW 2 #7', q: md`(a) Sketch $\mathbf F = x\,\hat x + y\,\hat y$ at the 25 points with $x, y \in \{-2, -1, 0, 1, 2\}$, and find $\nabla\times\mathbf F$ and $\nabla\cdot\mathbf F$. (b) Repeat for $\mathbf F = y\,\hat x + 2x\,\hat y$. (c) Select one: if $\nabla\times\mathbf F \ne 0$, the field strength varies **along** or **across** the direction of the field. (d) Select one: if $\nabla\cdot\mathbf F \ne 0$, the field strength varies **along** or **across** the direction of the field.`,
      parts: [M('(a)', ['$\\nabla\\times\\mathbf F = 0$, $\\nabla\\cdot\\mathbf F = 2$', '$\\nabla\\times\\mathbf F = 2\\hat z$, $\\nabla\\cdot\\mathbf F = 0$', '$\\nabla\\times\\mathbf F = 0$, $\\nabla\\cdot\\mathbf F = 1$'], 0, [null, 'Swapped: each component grows along its own coordinate, which is divergence.', 'Two components each contribute 1 to the divergence.']),
        M('(b)', ['$\\nabla\\times\\mathbf F = \\hat z$, $\\nabla\\cdot\\mathbf F = 0$', '$\\nabla\\times\\mathbf F = -\\hat z$, $\\nabla\\cdot\\mathbf F = 0$', '$\\nabla\\times\\mathbf F = 3\\hat z$, $\\nabla\\cdot\\mathbf F = 0$'], 0, [null, 'Order: $\\partial_xF_y - \\partial_yF_x = 2 - 1$.', 'The terms subtract.']),
        FX('(c) Curl: the strength varies', ['along', 'across'], 1, ['That is divergence.', null]),
        FX('(d) Divergence: the strength varies', ['along', 'across'], 0, [null, 'That is curl.'])],
      figs: { a: fig(quiver((x, y) => [x, y], 'the field x x-hat + y y-hat: arrows pointing radially away from the origin, longer farther out'), '(a) $x\\,\\hat x + y\\,\\hat y$: radial and growing outward.'), b: fig(quiver((x, y) => [y, 2 * x], 'the field y x-hat + 2x y-hat: arrows that swirl, pointing up and right in the first quadrant, down and left in the third'), '(b) $y\\,\\hat x + 2x\\,\\hat y$: a sheared, partly swirling pattern.') },
      sol: md`(a) $\nabla\times\mathbf F = \hat z(\partial_xy - \partial_yx) = 0$; $\nabla\cdot\mathbf F = 1 + 1 = 2$.

[[fig:a]]

(b) $\nabla\times\mathbf F = \hat z(\partial_x(2x) - \partial_y(y)) = \hat z(2 - 1) = \hat z$; $\nabla\cdot\mathbf F = \partial_xy + \partial_y(2x) = 0$.

[[fig:b]]

(c) **Across.** Curl measures circulation: a field whose strength changes as you step sideways across it (like $y\,\hat x$) pushes harder on one side of a small loop than on the other.

(d) **Along.** Divergence measures net outflow: a field that grows in its own direction (like $x\,\hat x$) carries more flux out of a small box than in.` }),

    R(md`### Problem 8 · A field with curl`),
    P({ src: 'HW 2 #8', q: md`Given $\mathbf E = \sin y\,\hat x + \cos x\,\hat y$ V/m in free space: (a) find $\nabla\times\mathbf E$ and $\nabla\times\nabla\times\mathbf E$; (b) find the $\rho$ that satisfies Gauss's law.`,
      parts: [M('(a) $\\nabla\\times\\mathbf E$', ['$-(\\sin x + \\cos y)\\,\\hat z$', '$(\\sin x + \\cos y)\\,\\hat z$', '$(\\cos y - \\sin x)\\,\\hat z$', '$0$'], 0, [null, 'Order: $\\partial_xE_y - \\partial_yE_x = -\\sin x - \\cos y$.', '$\\partial_x\\cos x = -\\sin x$ and $\\partial_y\\sin y = \\cos y$, which is then subtracted.', 'Each component depends on the **other** coordinate: there is curl.']),
        M('(a) $\\nabla\\times\\nabla\\times\\mathbf E$', ['$\\sin y\\,\\hat x + \\cos x\\,\\hat y$', '$-\\sin y\\,\\hat x - \\cos x\\,\\hat y$', '$0$'], 0, [null, 'For $f\\hat z$, the curl is $\\partial_yf\\,\\hat x - \\partial_xf\\,\\hat y$; check the signs.', 'The curl of a nonconstant vector need not vanish.']),
        M('(b) $\\rho$', ['$0$', '$\\epsilon_0(\\cos y - \\sin x)$', '$-\\epsilon_0(\\sin x + \\cos y)$'], 0, [null, 'That differentiates each component by the wrong coordinate.', 'That is the curl, not the divergence.'])],
      sol: md`(a)
$$\nabla\times\mathbf E = \hat z\left(\partial_x\cos x - \partial_y\sin y\right) = -(\sin x + \cos y)\,\hat z$$
For a field $f(x, y)\,\hat z$, $\nabla\times(f\hat z) = \partial_yf\,\hat x - \partial_xf\,\hat y$. With $f = -\sin x - \cos y$:
$$\nabla\times\nabla\times\mathbf E = \sin y\,\hat x + \cos x\,\hat y = \mathbf E$$
(b) $\nabla\cdot\mathbf E = \partial_x\sin y + \partial_y\cos x = 0$, so $\rho = \epsilon_0\nabla\cdot\mathbf E = 0$.

Not in the key, but worth noticing: this field has curl, so **no static charge distribution can produce it**. Gauss's law is satisfied with $\rho = 0$, but the field is not electrostatic; a time-varying $\mathbf B$ would be needed ([Faraday](#/l/t8-faraday)).` }),

    R(md`### Problem 9 · From a potential to the charge`),
    P({ src: 'HW 2 #9', q: md`An electrostatic potential $V(x, y, z) = x^2 - 2$ V holds in a region of free space. Find (a) $\mathbf E = -\nabla V$, (b) $\nabla\times\mathbf E$, (c) $\nabla\cdot\mathbf E$, (d) the charge density $\rho$.`,
      parts: [M('(a) $\\mathbf E$', ['$-2x\\,\\hat x$ V/m', '$2x\\,\\hat x$ V/m', '$(2 - x^2)\\,\\hat x$ V/m'], 0, [null, 'Sign: $\\mathbf E = -\\nabla V$.', 'That is $-V$, not $-\\nabla V$.']),
        M('(b) $\\nabla\\times\\mathbf E$', ['$0$', '$-2\\hat z$', '$-2\\hat x$'], 0, [null, '$E_x$ depends only on $x$: no curl.', 'That is closer to the divergence, as a vector; curl pairs different coordinates.']),
        N('(c) $\\nabla\\cdot\\mathbf E$', -2, 'V/m^2'), N('(d) $\\rho$', -2 * EPS0, 'C/m^3')],
      sol: md`(a) $\mathbf E = -\nabla(x^2 - 2) = -2x\,\hat x$ V/m.

(b) $\nabla\times\mathbf E = 0$: $E_x$ depends only on $x$ (and the curl of any gradient vanishes).

(c) $\nabla\cdot\mathbf E = \partial_x(-2x) = -2$ V/m².

(d) $\rho = \epsilon_0\nabla\cdot\mathbf E = -2\epsilon_0 = -1.77\times10^{-11}$ C/m³. A uniform negative charge: $V$ curves up ($\nabla^2V = 2 > 0$).` }),

    R(md`### Problem 10 · The field of a point source`),
    P({ src: 'HW 2 #10', q: md`Consider $\mathbf D = \dfrac{1}{r^2}\hat r$, with $r$ the distance from the origin. (a) Sketch $\mathbf D$ at the integer points $x, y \in \{-2, \dots, 2\}$, excluding the origin. (b) From the sketch, do you expect $\nabla\cdot\mathbf D$ to be positive, negative or zero? (c) Compute $\nabla\cdot\mathbf D = \partial_xD_x + \partial_yD_y + \partial_zD_z$ using $r = \sqrt{x^2 + y^2 + z^2}$ and $\hat r = (x\hat x + y\hat y + z\hat z)/r$. Is it consistent with (b)? (d) Compute it again with the spherical formula $\nabla\cdot\mathbf D = \frac{1}{r^2}\frac{\partial}{\partial r}(r^2D_r) + \frac{1}{r\sin\theta}\frac{\partial}{\partial\theta}(D_\theta\sin\theta) + \frac{1}{r\sin\theta}\frac{\partial D_\phi}{\partial\phi}$.`,
      parts: [M('(c), (d) For $r \\ne 0$, $\\nabla\\cdot\\mathbf D = $', ['$0$', '$1/r^3$', '$-2/r^3$', '$2/r^3$'], 0, [null, 'Differentiate $x/r^3$ carefully: $\\partial_x(x/r^3) = (r^2 - 3x^2)/r^5$; the three terms cancel.', 'That keeps only the $1/r^2$ fall-off and forgets the spreading of the lines.', 'That keeps only the spreading ($2/r$ times $D$) and forgets the fall-off.'])],
      figs: { q: fig(quiver((x, y) => { const r = Math.hypot(x, y); return r < 1e-9 ? null : [x / r ** 3, y / r ** 3]; }, 'the field r-hat over r squared: arrows pointing radially out from the origin, shrinking quickly with distance'), '$\\hat r/r^2$ in the $xy$-plane: radial, weakening fast.') },
      sol: md`(a)

[[fig:q]]

(b) A fair guess either way: the arrows point outward (suggesting positive divergence) but shrink along their direction (suggesting negative). The two effects turn out to cancel exactly. (The key predicts "nonzero"; the honest conclusion is that the sketch alone cannot decide.)

(c) $D_x = x/(x^2 + y^2 + z^2)^{3/2}$, so
$$\frac{\partial D_x}{\partial x} = \frac{1}{r^3} - \frac{3x^2}{r^5} = \frac{r^2 - 3x^2}{r^5}$$
and likewise for $y$ and $z$. Summing: $\nabla\cdot\mathbf D = (3r^2 - 3r^2)/r^5 = 0$ for $r \ne 0$.

(d) Only $D_r = 1/r^2$ is nonzero: $\nabla\cdot\mathbf D = \frac{1}{r^2}\frac{\partial}{\partial r}(1) = 0$. Consistent with (c).

The zero is real, not a breakdown of the formula, everywhere except the origin. The flux out of **any** sphere is $\frac{1}{r^2}\cdot4\pi r^2 = 4\pi$, so the field belongs to a point charge $4\pi$ C at the origin: $\nabla\cdot\mathbf D = 4\pi\,\delta(\mathbf r)$, all of it concentrated at $r = 0$. (The key's explanation, "a singularity at $r = 0$", points at the right place.)` }),
  ];

  // ---------------------------------------------------------------- HW 3
  const hw3 = [
    intro(3, 'Thursday, September 17, 2026', 'Potential and energy (vacuum diode), curl of a gradient, a vector identity, potentials from line integrals, circulation, boundary conditions, a metal sphere in a dielectric shell. Reading: Kudeki, Lectures 6–9. Seven problems.'),
    R(md`### Problem 1 · The vacuum diode`),
    P({ src: 'HW 3 #1', q: md`A vacuum diode has its cathode on $x = 0$ and its anode on $x = d$, the anode held at $V_a = 2$ V relative to the cathode. Electrons in transit make a charge density $\rho(x)$ in $0 < x < d$, where the potential is $V(x) = V_a(x/d)^{4/3}$. (a) Find an electron's velocity $v_e$ as a function of $x/d$ (it leaves the cathode at rest). (b) Plot $E_x(x)$. (c) Plot $\rho(x)$. (d) Find the surface charge density $\rho_s$ on the anode.`,
      parts: [N('(a) $v_e$ at the anode', Math.sqrt(2 * QE * 2 / ME), 'm/s'),
        M('(b) $E_x(x) = $', ['$-\\dfrac{4V_a}{3d}\\left(\\dfrac xd\\right)^{1/3}$', '$+\\dfrac{4V_a}{3d}\\left(\\dfrac xd\\right)^{1/3}$', '$-\\dfrac{4V_a}{3d}\\left(\\dfrac xd\\right)^{4/3}$'], 0, [null, 'Sign: $\\mathbf E = -\\nabla V$ points from the anode back toward the cathode.', 'The power drops by one when you differentiate: $\\tfrac43 - 1 = \\tfrac13$.']),
        M('(c) $\\rho(x) = $', ['$-\\dfrac{4\\epsilon_0V_a}{9d^2}\\left(\\dfrac xd\\right)^{-2/3}$', '$+\\dfrac{4\\epsilon_0V_a}{9d^2}\\left(\\dfrac xd\\right)^{-2/3}$', '$-\\dfrac{4\\epsilon_0V_a}{3d^2}\\left(\\dfrac xd\\right)^{1/3}$'], 0, [null, 'The space charge is electrons: negative.', 'Differentiate $E_x$ once more: $\\rho = \\epsilon_0\\,dE_x/dx$.']),
        N('(d) $\\rho_sd/\\epsilon_0$', 8 / 3, 'V')],
      figs: { e: fig(hw3Ex(), '$E_x$: zero at the cathode, $-\\tfrac43V_a/d$ at the anode.'), r: fig(hw3rho(), '$\\rho$: negative, diverging (integrably) at the cathode where the electrons are slowest.') },
      sol: md`(a) Energy conservation: an electron from rest at $V = 0$ has $\tfrac12m_ev_e^2 = eV(x)$:
$$v_e = \sqrt{\frac{2eV_a}{m_e}}\left(\frac xd\right)^{2/3} = 8.39\times10^5\left(\frac xd\right)^{2/3}\ \text{m/s}$$
(b)
$$E_x = -\frac{dV}{dx} = -\frac{4V_a}{3d}\left(\frac xd\right)^{1/3} = -\frac{8}{3d}\left(\frac xd\right)^{1/3}\ \text{V/m}$$
pointing toward the cathode: it pulls electrons toward the anode.

[[fig:e]]

(c) Gauss's law in differential form:
$$\rho = \epsilon_0\frac{dE_x}{dx} = -\frac{4\epsilon_0V_a}{9d^2}\left(\frac xd\right)^{-2/3} = -\frac{8\epsilon_0}{9d^2}\left(\frac xd\right)^{-2/3}\ \text{C/m}^3$$

[[fig:r]]

(d) Inside the anode $\mathbf D = 0$; the normal out of the anode into the gap is $-\hat x$, so
$$\rho_s = (-\hat x)\cdot\epsilon_0E_x(d)\,\hat x = \frac{4\epsilon_0V_a}{3d} = \frac{8\epsilon_0}{3d}\ \text{C/m}^2$$
positive. The key writes $\rho_s = \mathbf D\cdot\hat n = D_x|_{x=d}$, which taken literally has the opposite sign; its final $8\epsilon_0/3d$ is right because $\hat n = -\hat x$. Check: total charge per area, $\int_0^d\rho\,dx = -\tfrac43\epsilon_0V_a/d$, exactly cancels the anode's (the cathode carries none, since $E_x(0) = 0$).` }),

    R(md`### Problem 2 · Curl of a gradient`),
    P({ src: 'HW 3 #2', q: md`Given $V(x, y, z) = x^2 - yz$ and $\mathbf E = -\nabla V$, what is $\nabla\times\mathbf E$?`,
      parts: [M('$\\nabla\\times\\mathbf E = $', ['$0$', '$-\\hat x$', '$2\\hat x$', '$\\hat y - \\hat z$'], 0, [null, '$\\mathbf E = -2x\\,\\hat x + z\\,\\hat y + y\\,\\hat z$; the $x$-part of its curl is $\\partial_yE_z - \\partial_zE_y = 1 - 1 = 0$.', 'Every component of the curl vanishes.', 'Every component of the curl vanishes.'])],
      sol: md`$\mathbf E = -\nabla V = -2x\,\hat x + z\,\hat y + y\,\hat z$. Then $(\nabla\times\mathbf E)_x = \partial_yE_z - \partial_zE_y = 1 - 1 = 0$, and the other two components are $0 - 0$. In general $\nabla\times\nabla V = 0$ for any smooth $V$, since mixed partials commute: every field of the form $-\nabla V$ is curl-free.` }),

    R(md`### Problem 3 · A vector identity`),
    P({ src: 'HW 3 #3', q: md`For any vector field, $\nabla\times(\nabla\times\mathbf A) = \nabla(\nabla\cdot\mathbf A) - \nabla^2\mathbf A$, where $\nabla^2\mathbf A = \left(\partial_x^2 + \partial_y^2 + \partial_z^2\right)\mathbf A$ acts on each component. Verify it for $\mathbf A = (x - y)\,\hat x + (x + y)\,\hat y + 2\,\hat z$ by computing both sides.`,
      parts: [M('$\\nabla\\times\\mathbf A = $', ['$2\\hat z$', '$0$', '$-2\\hat z$'], 0, [null, '$\\partial_xA_y - \\partial_yA_x = 1 - (-1) = 2$.', 'Order: $\\partial_xA_y - \\partial_yA_x$.']),
        M('Both sides equal', ['$0$', '$2\\hat z$', '$\\nabla(2) = 2$'], 0, [null, 'That is $\\nabla\\times\\mathbf A$, one step earlier.', 'The gradient of a constant is zero.'])],
      sol: md`**Left side.** $\nabla\times\mathbf A = \hat z\left(\partial_x(x + y) - \partial_y(x - y)\right) = 2\hat z$, a constant, so $\nabla\times(\nabla\times\mathbf A) = 0$.

**Right side.** $\nabla\cdot\mathbf A = 1 + 1 + 0 = 2$, so $\nabla(\nabla\cdot\mathbf A) = 0$. Every component of $\mathbf A$ is linear (or constant), so $\nabla^2\mathbf A = 0$. Right side $= 0 - 0 = 0$ ✓.` }),

    R(md`### Problem 4 · Potential from a line integral`),
    P({ src: 'HW 3 #4', q: md`In a region, $\mathbf E = 3x\,\hat x + y\,\hat y + 2z^2\,\hat z$ V/m. (a) Find $V(1, 2, 3)$ if $V(0, 0, 0) = 0$. (b) Find $\rho$ at $(0, 0, 0)$ and at $(1, 2, 3)$.`,
      parts: [N('(a) $V(1, 2, 3)$', -21.5, 'V'), N('(b) $\\rho(0,0,0)/\\epsilon_0$', 4, 'V/m^2'), N('(b) $\\rho(1,2,3)/\\epsilon_0$', 16, 'V/m^2')],
      sol: md`(a) The field is curl-free (each component depends only on its own coordinate), so any path works. Take three legs, $(0,0,0) \to (1,0,0) \to (1,2,0) \to (1,2,3)$:
$$V(1, 2, 3) - V(0) = -\int_0^13x\,dx - \int_0^2y\,dy - \int_0^32z^2\,dz = -\left(\tfrac32 + 2 + 18\right) = -\tfrac{43}{2}\ \text{V}$$
so $V(1, 2, 3) = -21.5$ V.

(b) $\rho = \epsilon_0\nabla\cdot\mathbf E = \epsilon_0(3 + 1 + 4z) = \epsilon_0(4 + 4z)$: $\rho(0,0,0) = 4\epsilon_0 = 3.54\times10^{-11}$ C/m³ and $\rho(1,2,3) = 16\epsilon_0 = 1.42\times10^{-10}$ C/m³.` }),

    R(md`### Problem 5 · Circulation around a triangle`),
    P({ src: 'HW 3 #5', q: md`For $\mathbf E_1 = y\,\hat x - x\,\hat y$ V/m and $\mathbf E_2 = y\,\hat x + x\,\hat y$ V/m, find $\oint_C\mathbf E\cdot d\mathbf l$ along the triangle $C$ that visits, in order, $(-1, -1, 0)$, $(-1, 1, 0)$ and $(1, 1, 0)$ m and returns. Hint: $d\mathbf l = (-\hat x - \hat y)\,dx$ and $x = y$ on the slant edge of $C$ (here $dx > 0$: the edge runs toward $-x$).

[[fig:t]]`,
      figs: { t: fig(hw3PathFig(), 'Up the left side, across the top, back down the diagonal: clockwise seen from $+z$.') },
      parts: [N('$\\oint\\mathbf E_1\\cdot d\\mathbf l$', 4, 'V'), M('$\\oint\\mathbf E_2\\cdot d\\mathbf l$', ['$0$', '$4$ V', '$-4$ V', '$2$ V'], 0, [null, '$\\mathbf E_2 = \\nabla(xy)$ is curl-free: zero around any closed path.', 'Curl-free means zero, whatever the orientation.', 'Curl-free means zero.'])],
      sol: md`**$\mathbf E_1 = y\,\hat x - x\,\hat y$.**
- Left side, $x = -1$, $y: -1 \to 1$, $d\mathbf l = \hat y\,dy$: $\int_{-1}^1(-x)\,dy = \int_{-1}^1 1\,dy = 2$ V.
- Top, $y = 1$, $x: -1 \to 1$, $d\mathbf l = \hat x\,dx$: $\int_{-1}^1 y\,dx = 2$ V.
- Diagonal, $y = x$, $x: 1 \to -1$: $\mathbf E_1\cdot(\hat x + \hat y) = y - x = 0$, so 0.

$$\oint_C\mathbf E_1\cdot d\mathbf l = 4\ \text{V}$$
Stokes check: $\nabla\times\mathbf E_1 = -2\hat z$; the path is clockwise from $+z$, so $d\mathbf S = -\hat z$; area 2 m²: $(-2)(-1)(2) = 4$ V ✓. A nonzero circulation: $\mathbf E_1$ is not electrostatic.

**$\mathbf E_2 = y\,\hat x + x\,\hat y = \nabla(xy)$.** Left side: $\int_{-1}^1 x\,dy = -2$; top: $+2$; diagonal: $\int_1^{-1}2x\,dx = 0$. Total **0**, as for any gradient field.` }),

    R(md`### Problem 6 · Boundary conditions with sheets of charge`),
    P({ src: 'HW 3 #6', q: md`A static charge density $\rho = 6\,\delta(y) + \rho_s\,\delta(y - 6)$ C/m³ sits in free space. The displacement field is $\mathbf D = 2\epsilon_0\,\hat x + 4\epsilon_0\,\hat y$ C/m² for $0 < y < 6$ m, and $D_y = 2\epsilon_0$ C/m² for $y > 6$ m; $\mathbf D$ is uniform in each of the regions $y < 0$, $0 < y < 6$ m and $y > 6$ m. (a) Find $\rho_s$. (b) Find $\mathbf D$ for $y > 6$ m. (c) Find $\mathbf D$ for $y < 0$. (d) Find $\mathbf E$ in all three regions. (e) What is the voltage drop from the plane $y = 0$ to the plane $y = 6$ m? (f) Which answers change if $0 < y < 6$ m is filled with a perfect dielectric of permittivity $4\epsilon_0$ (same $\mathbf D$ there)? Explain.`,
      parts: [N('(a) $\\rho_s/\\epsilon_0$', -2, 'V/m'),
        M('(b) $\\mathbf D$ for $y > 6$ m', ['$2\\epsilon_0\\hat x + 2\\epsilon_0\\hat y$', '$2\\epsilon_0\\hat y$', '$4\\epsilon_0\\hat x + 2\\epsilon_0\\hat y$'], 0, [null, 'The tangential $E$ (here $E_x$) is continuous, so $D_x = 2\\epsilon_0$ above as well.', 'In free space on both sides, $D_x = \\epsilon_0E_x$ is unchanged.']),
        N('(c) $D_y$ for $y < 0$', 4 * EPS0 - 6, 'C/m^2'), N('(d) $E_y$ for $y < 0$', 4 - 6 / EPS0, 'V/m'), N('(e) $V(0) - V(6)$', 24, 'V'),
        M('(f) Which answers change?', ['(b), (c), (d), (e); only (a) stays', 'only (d) and (e)', 'all of them', 'none: $\\mathbf D$ is given'], 0, [null, '(b) and (c) also change: their $D_x$ follows the middle region\'s $E_x$, which drops by 4.', '(a) uses only the given normal $D$ components, which do not change.', 'The fields come from $\\mathbf D/\\epsilon$, and $\\epsilon$ changed.'])],
      sol: md`(a) Across $y = 6$ m, with $\hat n = \hat y$: $\rho_s = D_y(6^+) - D_y(6^-) = 2\epsilon_0 - 4\epsilon_0 = -2\epsilon_0$ C/m².

(b) Tangential $\mathbf E$ is continuous; both sides are free space, so $D_x = 2\epsilon_0$ above too:
$$\mathbf D = 2\epsilon_0\,\hat x + 2\epsilon_0\,\hat y\ \text{C/m}^2\quad(y > 6\ \text{m})$$
(c) Across $y = 0$ the sheet has $6$ C/m²: $D_y(0^+) - D_y(0^-) = 6$, so $D_y(0^-) = 4\epsilon_0 - 6$, and $D_x = 2\epsilon_0$ again:
$$\mathbf D = 2\epsilon_0\,\hat x + (4\epsilon_0 - 6)\,\hat y\ \text{C/m}^2 \approx 2\epsilon_0\,\hat x - 6\,\hat y\quad(y < 0)$$
(d) $\mathbf E = \mathbf D/\epsilon_0$:
$$y < 0:\ 2\hat x + \left(4 - \frac{6}{\epsilon_0}\right)\hat y \approx 2\hat x - 6.78\times10^{11}\,\hat y;\qquad 0 < y < 6:\ 2\hat x + 4\hat y;\qquad y > 6:\ 2\hat x + 2\hat y\ \ \text{V/m}$$
(e) $V(0) - V(6) = \int_0^6\mathbf E\cdot\hat y\,dy = \int_0^6 4\,dy = 24$ V. (The key writes the integrand as $4\,dz$; it means $dy$.)

(f) In the middle region $\mathbf E = \mathbf D/4\epsilon_0 = 0.5\,\hat x + \hat y$ V/m. (a) is unchanged: it uses only the given normal components of $\mathbf D$. (b) and (c) change: $E_x = 0.5$ V/m is continuous, so $D_x = 0.5\epsilon_0$ above and below. (d) changes in every region, and (e) becomes $\int_0^6 1\,dy = 6$ V.` }),

    R(md`### Problem 7 · A metal sphere in a dielectric shell`),
    P({ src: 'HW 3 #7', q: md`A metal sphere of radius $a$ with charge $Q$ is suspended in free space, surrounded out to radius $b$ by a linear dielectric of permittivity $\epsilon$ and susceptibility $\chi$ ($\epsilon = \epsilon_0(1 + \chi)$). Find (a) $\mathbf D$ and $\mathbf E$ for $r < a$; (b) for $a < r < b$; (c) for $r > b$; (d) the potential at the center, relative to infinity; (e) the polarization $\mathbf P$ and the bound charge density $\rho_b$ in the dielectric; (f) the bound surface charge on the inner and outer surfaces of the dielectric, and how the inner one affects the field.`,
      parts: [M('(b) $\\mathbf E$ for $a < r < b$', ['$\\dfrac{Q}{4\\pi\\epsilon r^2}\\hat r$', '$\\dfrac{Q}{4\\pi\\epsilon_0r^2}\\hat r$', '$\\dfrac{Q}{4\\pi r^2}\\hat r$'], 0, [null, 'The dielectric weakens $E$: $E = D/\\epsilon$.', 'That is $\\mathbf D$.']),
        M('(d) $V(0) = $', ['$\\dfrac{Q}{4\\pi}\\left[\\dfrac{1}{\\epsilon_0b} + \\dfrac{1}{\\epsilon a} - \\dfrac{1}{\\epsilon b}\\right]$', '$\\dfrac{Q}{4\\pi\\epsilon a}$', '$\\dfrac{Q}{4\\pi\\epsilon_0a}$', '$0$'], 0, [null, 'That ignores that the region beyond $b$ is free space.', 'That ignores the dielectric.', 'Inside the metal $E = 0$, but $V$ equals the (nonzero) surface potential.']),
        M('(e) $\\rho_b$ in the dielectric', ['$0$', '$-\\dfrac{\\epsilon_0\\chi Q}{4\\pi\\epsilon r^3}$', '$\\dfrac{\\chi Q}{4\\pi r^2}$'], 0, [null, '$\\mathbf P \\propto \\hat r/r^2$ has zero divergence away from the origin.', 'That is a surface-charge-like quantity, not $-\\nabla\\cdot\\mathbf P$.']),
        M('(f) Bound charge density on the inner surface $r = a$', ['$-\\dfrac{\\epsilon_0\\chi Q}{4\\pi\\epsilon a^2}$', '$+\\dfrac{\\epsilon_0\\chi Q}{4\\pi\\epsilon a^2}$', '$-\\dfrac{\\chi Q}{4\\pi a^2}$'], 0, [null, 'On the inner surface $\\hat n = -\\hat r$: $\\rho_{sb} = \\mathbf P\\cdot\\hat n < 0$ for $Q > 0$.', 'Use $\\mathbf P = \\epsilon_0\\chi\\mathbf E$, with $E$ inside the dielectric, $Q/4\\pi\\epsilon a^2$.'])],
      sol: md`The free charge $Q$ spreads uniformly over the metal surface; the fields are radial.

(a) Inside the metal: $\mathbf D = \mathbf E = 0$.

(b) Gauss with a sphere of radius $r$: $4\pi r^2D = Q$:
$$\mathbf D = \frac{Q}{4\pi r^2}\hat r,\qquad \mathbf E = \frac{\mathbf D}{\epsilon} = \frac{Q}{4\pi\epsilon r^2}\hat r$$
(c) Same enclosed free charge: $\mathbf D = \dfrac{Q}{4\pi r^2}\hat r$, $\mathbf E = \dfrac{Q}{4\pi\epsilon_0r^2}\hat r$.

(d) Integrate in from infinity (no contribution inside the metal):
$$V(0) = -\int_\infty^b\frac{Q\,dr}{4\pi\epsilon_0r^2} - \int_b^a\frac{Q\,dr}{4\pi\epsilon r^2} = \frac{Q}{4\pi}\left[\frac{1}{\epsilon_0b} + \frac{1}{\epsilon a} - \frac{1}{\epsilon b}\right]$$
(e) $\mathbf P = \mathbf D - \epsilon_0\mathbf E = \epsilon_0\chi\mathbf E = \dfrac{\epsilon_0\chi Q}{4\pi\epsilon r^2}\hat r$, and $\rho_b = -\nabla\cdot\mathbf P = -\frac{1}{r^2}\frac{d}{dr}\left(r^2P_r\right) = 0$.

(f) $\rho_{sb} = \mathbf P\cdot\hat n$ with $\hat n$ out of the dielectric:
$$r = b\ (\hat n = \hat r):\ +\frac{\epsilon_0\chi Q}{4\pi\epsilon b^2},\qquad r = a\ (\hat n = -\hat r):\ -\frac{\epsilon_0\chi Q}{4\pi\epsilon a^2}$$
(The key writes both with a generic $r^2$; evaluate at $a$ and $b$.) The inner layer has the opposite sign to $Q$: the metal's charge attracts the molecules' opposite ends. It partly cancels $Q$, which is why $E$ in the dielectric is smaller by $\epsilon_0/\epsilon$. A conducting shell would cancel it completely; the dielectric does so only partially. More in [Topic 1](#/l/t1-dielectrics).` }),
  ];

  EM.lesson('e2-hw', { id: 'hw1', title: 'HW 1 · vectors, Coulomb, Lorentz force, current, Gauss', kind: 'hw', steps: hw1 });
  EM.lesson('e2-hw', { id: 'hw2', title: 'HW 2 · Gauss\'s law, sheets and slabs, curl and divergence', kind: 'hw', steps: hw2 });
  EM.lesson('e2-hw', { id: 'hw3', title: 'HW 3 · potential, line integrals, boundary conditions', kind: 'hw', steps: hw3 });
})();

/* Homework 5 (Fall 2026): flux through a partial cone from ∮B·dS = 0, pairs of current sheets, a slab of current,
   and a cylinder with an off-axis hole. Every problem as assigned, blank, with answer boxes for every number or choice
   and full worked solutions. No official solutions were posted: these were derived and checked numerically
   (direct surface integration for #1, strip-by-strip and layer-by-layer Biot–Savart sums for #2 and #3, a filament sum
   over the holed cross-section for #4). Figures are redrawn. */
(function () {
  'use strict';
  const { R, P } = C;
  const { N } = EM;
  const MU0 = 4 * Math.PI * 1e-7;
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });

  // ---------------------------------------------------------------- figures
  // #1: the curved half of a truncated cone, axis along x, radius 2R at x = 0 shrinking to R at x = L, z >= 0
  function coneFig() {
    const g = PF.fig({ scale: 1.15, alt: 'the curved upper half of a truncated cone with its axis along x: a half-circle of radius 2R in the yz-plane at x = 0, a half-circle of radius R at x = L, joined by the cone surface; its open bottom edges lie in the xy-plane', proj: { ox: 170, oy: 150, s: 1, kx: 0.5, ang: 215 } });
    const Rr = 34, L = 190, T = Math.PI;
    const P3 = (x, t, r) => g.p3(x, r * Math.cos(t), r * Math.sin(t));
    const c1 = g.p3(0, 0, 0), c2 = g.p3(L, 0, 0);
    // silhouette generator: the external tangent of the two projected half-circles touches both at the same angle t*
    const dx = c2[0] - c1[0], dy = c2[1] - c1[1];
    let ts = Math.PI / 2;
    for (let i = 0, lo = Math.PI / 2, hi = Math.PI; i < 60; i++) { ts = (lo + hi) / 2; const v = dx * Math.cos(ts) - dy * Math.sin(ts) - Rr; if (v > 0) hi = ts; else lo = ts; }
    const arc = (x, r, a0, a1, cls) => { const pts = []; for (let k = 0; k <= 40; k++) pts.push(P3(x, a0 + (a1 - a0) * k / 40, r)); g.pl(pts, { cls }); };
    // hidden edges first
    arc(0, 2 * Rr, ts, T, 'dash dim');
    g.line(...P3(0, T, 2 * Rr), ...P3(L, T, Rr), { cls: 'dash dim' });
    g.l3([0, 0, 0], [L, 0, 0], { cls: 'dash dim thin' });
    g.l3([0, 0, 0], [0, 2 * Rr, 0], { cls: 'dash dim thin' });
    g.l3([0, 0, 0], [0, 0, 2 * Rr], { cls: 'dash dim thin' });
    g.line(...g.p3(0, 0, 0), ...P3(0, 2 * T / 3, 2 * Rr), { cls: 'dash dim thin' });
    // visible edges
    arc(0, 2 * Rr, 0, ts, '');
    arc(L, Rr, 0, T, '');
    g.line(...P3(0, ts, 2 * Rr), ...P3(L, ts, Rr));
    g.line(...P3(0, 0, 2 * Rr), ...P3(L, 0, Rr));
    g.line(...g.p3(L, 0, 0), ...P3(L, 2 * T / 3, Rr), { cls: 'thin' });
    // axes beyond the solid
    g.arrow(...g.p3(L, 0, 0), ...g.p3(L + 60, 0, 0), { cls: 'dim', hs: 6 });
    g.arrow(...g.p3(0, 2 * Rr, 0), ...g.p3(0, 2 * Rr + 50, 0), { cls: 'dim', hs: 6 });
    g.arrow(...g.p3(0, 0, 2 * Rr), ...g.p3(0, 0, 2 * Rr + 40), { cls: 'dim', hs: 6 });
    g.label(...g.p3(L + 66, 0, 0), 'x', 'tr', 'small accent');
    g.label(...g.p3(0, 2 * Rr + 54, 0), 'y', 'l', 'small accent');
    g.label(...g.p3(0, 0, 2 * Rr + 44), 'z', 'bl', 'small accent');
    const m1 = P3(0, 2 * T / 3, Rr), m2 = P3(L, 2 * T / 3, Rr / 2);
    g.label(m1[0] + 4, m1[1], '2R', 'l', 'small');
    g.label(m2[0] + 4, m2[1], 'R', 'l', 'small');
    const pL = g.p3(L, 0, 0);
    g.label(pL[0] + 6, pL[1] + 4, 'L', 'tl', 'small');
    return g.svg();
  }

  // #2: one panel: two sheets on x = -d and x = +d, current along y (arrows) or z (dots / crosses)
  function sheetsPanel(J1, J2) {
    const g = PF.fig({ scale: 1.1, alt: `two current sheets edge-on at x = -d and x = +d; sheet 1 carries ${J1}, sheet 2 carries ${J2}; the origin O is midway` });
    const ox = 90, oy = 80;
    g.axes(ox, oy, { x: [-80, 80], y: [-62, 62], xl: 'x', yl: 'y' });
    g.label(ox + 4, oy + 4, 'O', 'tl', 'small');
    const draw = (x, J) => {
      g.sheet(x, oy - 64, oy + 64);
      const s = J.startsWith('-') ? -1 : 1;
      if (/z/.test(J)) for (const y of [oy - 44, oy - 16, oy + 16, oy + 44]) (s > 0 ? g.odot(x, y, 5) : g.otimes(x, y, 5));
      else for (const y of [oy - 30, oy + 30]) g.arrow(x, y + s * 14, x, y - s * 14, { cls: 'thick', hs: 8 });
      g.label(x, oy + 70, J.replace(/([yz])/, '\\hat $1') + '\\ \\text{A/m}', 't', 'small');
    };
    draw(ox - 48, J1); draw(ox + 48, J2);
    g.label(ox - 48, oy - 70, '\\text{Sheet 1}', 'b', 'small');
    g.label(ox + 48, oy - 70, '\\text{Sheet 2}', 'b', 'small');
    return g.svg();
  }

  // #3: the slab -3 < z < 1 edge-on, J = 2y into the page (x right, z up)
  function slabFig() {
    const g = PF.fig({ scale: 1.1, alt: 'the slab between z = -3 and z = 1 seen edge-on, with x to the right and z up; the current 2 y-hat flows into the page; the center plane z = -1 is dashed; above the slab B points along +x, below along -x' });
    const Z = (z) => 100 - 22 * z, x0 = 40, x1 = 240;
    g.rect(x0, Z(1), x1 - x0, Z(-3) - Z(1), { cls: 'shade' });
    g.line(x0, Z(1), x1, Z(1), { cls: 'thick' }); g.line(x0, Z(-3), x1, Z(-3), { cls: 'thick' });
    g.line(x0, Z(-1), x1, Z(-1), { cls: 'dim dash' });
    for (const x of [80, 140, 200]) for (const z of [0, -2]) g.otimes(x, Z(z), 5);
    g.arrow(30, Z(-4.6), 30, Z(2.6), { cls: 'dim', hs: 6 });
    g.label(34, Z(2.6), 'z', 'bl', 'small accent');
    for (const z of [1, -1, -3]) g.label(24, Z(z), String(z), 'r', 'small');
    g.arrow(110, Z(2), 170, Z(2), { hs: 8 }); g.label(176, Z(2), '\\mathbf B', 'l', 'small');
    g.arrow(170, Z(-4), 110, Z(-4), { hs: 8 }); g.label(104, Z(-4), '\\mathbf B', 'r', 'small');
    g.label(x1 + 6, Z(-1), '\\text{center plane}', 'l', 'small');
    return g.svg();
  }
  function slabPlot() {
    const B = (z) => 2 * MU0 * 1e6 * Math.max(-2, Math.min(2, z + 1));
    return PF.plot({ w: 330, h: 200, x: [-5.2, 3.2], y: [-6.2, 6.2], zero: true, xl: 'z\\ (\\text{m})', yl: 'B_x\\ (\\mu\\text{T})',
      xt: [[-5, '-5'], [-3, '-3'], [-1, '-1'], [1, '1'], [3, '3']], yt: [[5.03, '5.03'], [-5.03, '-5.03']],
      curves: [{ f: B, from: -5, to: 3 }], pts: [{ x: -1, y: 0 }] });
  }

  // #4: Figure A (uniform cylinder) and Figure B (with an off-axis hole)
  function cylFig(hole) {
    const g = PF.fig({ scale: 1.05, alt: hole ? 'a circular cross-section of radius a with a smaller circular hole of radius b whose center is a distance d along x from the axis' : 'a circular cross-section of radius a centered on the z-axis' });
    const cx = 90, cy = 90, a = 66;
    g.circle(cx, cy, a, { cls: 'shade' }); g.circle(cx, cy, a, {});
    g.axes(cx, cy, { x: [0, 84], y: [0, 84], xl: 'x', yl: 'y' });
    g.arrow(cx, cy, cx + a * Math.cos(1.05), cy - a * Math.sin(1.05), { hs: 6 });
    g.label(cx + 0.5 * a * Math.cos(1.05) - 4, cy - 0.5 * a * Math.sin(1.05), 'a', 'r', 'small');
    if (hole) {
      const hx = cx + 34, b = 18;
      g.circle(hx, cy, b, { cls: 'bgfill' }); g.circle(hx, cy, b, {});
      g.arrow(hx, cy, hx + b * Math.cos(0.8), cy - b * Math.sin(0.8), { hs: 5 });
      g.label(hx + b * Math.cos(0.8) + 2, cy - b * Math.sin(0.8) - 2, 'b', 'bl', 'small');
      g.dim(cx, cy + 32, hx, cy + 32, 'd', { at: 'b' });
    }
    return g.svg();
  }

  // ---------------------------------------------------------------- the homework
  EM.lesson('e2-hw', {
    id: 'hw5', kind: 'hw', title: 'HW 5 · flux, current sheets, slabs, Ampère with holes',
    steps: [
      R(md`**Homework 5** · due Thursday, October 1, 2026. Reading: Kudeki, Lectures 12–14. Four problems: flux through an open surface by closing it ($\oint\mathbf B\cdot d\mathbf S = 0$), pairs of current sheets, a slab of current, and a cylinder of current with an off-axis hole.

Work every part on paper first, with units, the way you would hand it in. Then enter your answers and open the solution. No official solutions were posted; these were derived and checked numerically. Background: [Sheets, slabs, superposition](#/l/t6-sheets), [Ampère's law](#/l/t5-ampere), [Magnetic flux](#/l/t7-flux).`),

      // ---------------------------------------------------------------- #1
      P({
        src: 'HW 5 #1', title: 'Flux through a partial cone',
        q: md`Gauss's law for $\mathbf B$ states that $\oint_S\mathbf B\cdot d\mathbf S = 0$ over any closed surface $S$ enclosing a volume $V$. Given the uniform field $\mathbf B = B_0\left(-3\hat x + 2\hat y - \dfrac{\pi R}{L}\hat z\right)$ Wb/m², determine the magnetic flux through the partial cone surface shown: the curved upper half ($z \ge 0$) of a truncated cone whose axis is the $x$-axis, with radius $2R$ at $x = 0$ shrinking linearly to $R$ at $x = L$.

[[fig:cone]]

Take $d\mathbf S$ on the cone pointing **outward**, away from the $x$-axis. Give the fluxes as multiples of $B_0R^2$.`,
        figs: { cone: { svg: coneFig(), cap: 'The surface: the curved half-cone only. Its rim is the two half-circles (at x = 0 and x = L) and two straight edges in the xy-plane.' } },
        parts: [
          N('\\Psi_1/B_0R^2\\ \\ (\\text{out of the half-disk at } x = 0)', 6 * Math.PI, ''),
          N('\\Psi_2/B_0R^2\\ \\ (\\text{out of the half-disk at } x = L)', -1.5 * Math.PI, ''),
          N('\\Psi_3/B_0R^2\\ \\ (\\text{out of the base in } z = 0)', 3 * Math.PI, ''),
          N('\\Psi_{\\text{cone}}/B_0R^2\\ \\ (\\text{outward})', -7.5 * Math.PI, ''),
        ],
        hints: ['Close the surface with three flat faces: the half-disk of radius $2R$ at $x = 0$, the half-disk of radius $R$ at $x = L$, and the trapezoid in the plane $z = 0$ between them. Then $\\Psi_{\\text{cone}} = -(\\Psi_1 + \\Psi_2 + \\Psi_3)$, all with outward normals.', 'With $\\mathbf B$ uniform, each flat face gives $(\\mathbf B\\cdot\\hat n)A$. The base is a trapezoid of width $2(2R - Rx/L)$: area $3RL$. No flat face has a $\\hat y$ normal.'],
        sol: md`**1. Close the surface.** Add three flat faces, each with its normal pointing **out** of the enclosed half-frustum:
- $S_1$: the half-disk at $x = 0$, radius $2R$: $\hat n = -\hat x$, $A_1 = \tfrac12\pi(2R)^2 = 2\pi R^2$.
- $S_2$: the half-disk at $x = L$, radius $R$: $\hat n = +\hat x$, $A_2 = \tfrac12\pi R^2$.
- $S_3$: the base in $z = 0$, between $y = \pm(2R - Rx/L)$: $\hat n = -\hat z$, $A_3 = \displaystyle\int_0^L 2\left(2R - \frac{Rx}{L}\right)dx = 4RL - RL = 3RL$.

Gauss's law for $\mathbf B$: $\Psi_{\text{cone}} + \Psi_1 + \Psi_2 + \Psi_3 = 0$.

**2. The flat faces** ($\mathbf B$ uniform, so $\Psi = (\mathbf B\cdot\hat n)A$):
$$\Psi_1 = (-3B_0)(-1)(2\pi R^2) = 6\pi B_0R^2 \qquad \Psi_2 = (-3B_0)(+1)\left(\tfrac12\pi R^2\right) = -\tfrac32\pi B_0R^2$$
$$\Psi_3 = \left(-\frac{\pi R}{L}B_0\right)(-1)(3RL) = 3\pi B_0R^2$$
$B_y = 2B_0$ crosses none of them (no $\hat y$ normal). On the cone its flux in through the $y < 0$ side equals its flux out through the $y > 0$ side.

**3. The cone.**
$$\Psi_{\text{cone}} = -\left(6\pi - \tfrac32\pi + 3\pi\right)B_0R^2 = -\frac{15\pi}{2}B_0R^2 \approx -23.6\,B_0R^2\ \text{Wb}$$
Negative: with $d\mathbf S$ outward, a net $\frac{15\pi}{2}B_0R^2$ enters through the curved surface.

**Check.** The vector areas of a closed surface add to zero, so the cone's outward vector area is $-(-2\pi R^2\hat x + \tfrac12\pi R^2\hat x - 3RL\hat z) = \tfrac32\pi R^2\hat x + 3RL\hat z$ (it faces partly $+\hat x$, since it narrows toward $+x$, and up). Then $\mathbf B\cdot\mathbf S = B_0\left(-3\cdot\tfrac32\pi R^2 - \frac{\pi R}{L}\cdot3RL\right) = -\tfrac{15}{2}\pi B_0R^2$. ✓ A direct numerical integral of $\mathbf B\cdot d\mathbf S$ over the curved surface gives the same. $L$ drops out, which is why $B_z$ was given as $\propto 1/L$.`,
      }),

      // ---------------------------------------------------------------- #2
      P({
        src: 'HW 5 #2', title: 'Pairs of current sheets',
        q: md`An infinite current sheet with a uniform surface current density $\mathbf J = J_s\hat y$ A/m produces magnetostatic fields $\mathbf B$ of magnitude $\mu_0J_s/2$ on both sides of the sheet, in opposite directions on the two sides, consistent with the right-hand rule and the Biot–Savart law. Determine the magnetic field intensity $\mathbf H = \mathbf B/\mu_0$ at the origin O in each diagram, due to the pair of current sheets with the $\mathbf J$ vectors shown. Sheet 1 is the plane $x = -d$ and sheet 2 the plane $x = +d$ (the value of $d$ is not needed).

[[fig:pairs]]`,
        figs: { pairs: PF.row([{ svg: sheetsPanel('2z', '2z'), cap: '(a) both 2ẑ A/m (out of the page)' }, { svg: sheetsPanel('2y', '-2y'), cap: '(b) 2ŷ and −2ŷ A/m' }, { svg: sheetsPanel('-2z', '2y'), cap: '(c) −2ẑ (into the page) and 2ŷ A/m' }]) },
        parts: [
          MC('(a) $\\mathbf H(O) = $', ['$0$', '$2\\hat y$ A/m', '$-2\\hat y$ A/m', '$\\hat y$ A/m'], 0,
            [null, 'That adds the two sheets\' fields; between same-direction sheets they cancel.', 'That adds the two sheets\' fields; between same-direction sheets they cancel.', 'That is one sheet alone.']),
          N('(b)\\ H_z(O)', -2, 'A/m'),
          N('(c)\\ H_y(O)', -1, 'A/m'),
          N('(c)\\ H_z(O)', 1, 'A/m'),
        ],
        hints: ['Each sheet gives $\\mathbf H = \\tfrac12\\mathbf J_s\\times\\hat n$, with $\\hat n$ from the sheet toward O: $+\\hat x$ for sheet 1, $-\\hat x$ for sheet 2.', 'Cross products: $\\hat z\\times\\hat x = \\hat y$, $\\hat y\\times\\hat x = -\\hat z$. Add the two sheets as vectors.'],
        sol: md`Each sheet: $\mathbf H = \tfrac12\mathbf J_s\times\hat n$, $\hat n$ from the sheet toward O. Sheet 1 (left): $\hat n = +\hat x$. Sheet 2 (right): $\hat n = -\hat x$.

**(a)** $\tfrac12(2\hat z)\times\hat x + \tfrac12(2\hat z)\times(-\hat x) = \hat y - \hat y$:
$$\mathbf H(O) = 0$$
Equal currents in the same direction cancel between the sheets.

**(b)** $\tfrac12(2\hat y)\times\hat x + \tfrac12(-2\hat y)\times(-\hat x) = -\hat z - \hat z$:
$$\mathbf H(O) = -2\hat z\ \text{A/m}$$
Opposite currents add between the sheets (like a parallel-plate line). RHR check: sheet 1's current runs up the page; to its right its field points into the page, $-\hat z$. ✓

**(c)** $\tfrac12(-2\hat z)\times\hat x + \tfrac12(2\hat y)\times(-\hat x) = -\hat y + \hat z$:
$$\mathbf H(O) = -\hat y + \hat z\ \text{A/m}, \qquad |\mathbf H| = \sqrt2\ \text{A/m}$$
The two currents are perpendicular, so their fields are too; they do not cancel.

In every case the answer holds for any point between the sheets: a sheet's field does not depend on distance.`,
      }),

      // ---------------------------------------------------------------- #3
      P({
        src: 'HW 5 #3', title: 'A slab of current',
        q: md`An infinite slab (extending in the $x$ and $y$ directions) of width $W = 4$ m occupies $-3 < z < 1$. It is electrically neutral but carries a uniform current density $\mathbf J = 2\hat y$ A/m² (equal densities of positive and negative carriers moving in opposite directions along $\hat y$). Outside the slab ($z > 1$ and $z < -3$) the charge and current densities are zero.

[[fig:slab]]

(a) Using the right-hand rule and the Biot–Savart law, explain why the slab must make equal and opposite fields along $\pm\hat x$ in front of and behind its plane of symmetry.

(b) Based on (a), what is $\mathbf B$ on the plane $z = -1$ m? Explain briefly.

(c) Use the integral form of Ampère's law and parts (a) and (b) to find $B_x(z)$ outside the slab. (Hint: shift the origin to the center of the slab.)

(d) Use Ampère's law to find $B_x(z)$ inside the slab.

(e) Plot $B_x$ as a function of $z$ over $-5 < z < 3$, labeling all relevant values of $B_x$ and $z$.`,
        figs: { slab: { svg: slabFig(), cap: 'x to the right, z up, so ŷ points into the page: J = 2ŷ is drawn as crosses.' }, plot: { svg: slabPlot(), cap: 'B_x(z): −4μ₀ below the slab, 2μ₀(z + 1) inside, +4μ₀ above (in µT: ∓5.03).' } },
        parts: [
          MC('(b) $\\mathbf B$ on the plane $z = -1$ m is', ['$0$', '$4\\mu_0\\,\\hat x$ T', '$-4\\mu_0\\,\\hat x$ T', '$2\\mu_0\\,\\hat x$ T'], 0,
            [null, 'That is the field above the slab. At the center plane the two halves cancel.', 'That is the field below the slab.', 'That is $B_x$ at $z = 0$, not at the center plane.']),
          N('(c)\\ B_x\\ \\text{for}\\ z > 1', 4 * MU0 * 1e6, 'µT'),
          N('(c)\\ B_x\\ \\text{for}\\ z < -3', -4 * MU0 * 1e6, 'µT'),
          N('(d)\\ B_x(z = 0)', 2 * MU0 * 1e6, 'µT'),
          N('(d)\\ B_x(z = -2.5)', -3 * MU0 * 1e6, 'µT'),
        ],
        hints: ['Every thin layer of the slab is a current sheet $2\\hat y\\,dz$: its field is $+\\hat x$ above it and $-\\hat x$ below it ($\\hat y\\times\\hat z = \\hat x$). The slab is symmetric about $z = -1$.', 'Use a rectangle in the $xz$-plane, symmetric about $z = -1$, sides of length $\\ell$ along $x$ at $z = -1\\pm u$. The enclosed current is $J\\cdot(2u)\\ell$ inside, $JW\\ell$ once $u > 2$.'],
        sol: md`**(a) Symmetry.** Slice the slab into thin sheets $\mathbf J\,dz' = 2\hat y\,dz'$. By the RHR (Biot–Savart for each line current in the layer, or $\tfrac12\mathbf J_s\times\hat n$), each layer makes a field along $+\hat x$ above itself and $-\hat x$ below itself, the same size on both sides: $\hat y\times(+\hat z) = +\hat x$, $\hat y\times(-\hat z) = -\hat x$. Reflect the slab through its center plane $z = -1$: it maps onto itself, but every layer's "above" and "below" swap. So $B_x(-1 + u) = -B_x(-1 - u)$: equal and opposite fields in front of and behind the plane of symmetry.

**(b)** On the plane itself, $u = 0$: $B_x(-1) = -B_x(-1)$, so $\mathbf B = 0$. Physically, the 2 m of slab above the plane and the 2 m below it make equal and opposite fields there.

**(c) Outside.** Shift the origin: $z' = z + 1$, so the slab is $-2 < z' < 2$. Take a rectangle in the $xz$-plane with sides of length $\ell$ along $x$ at $z' = \pm u$ ($u > 2$), traversed $+\hat x$ along the top and $-\hat x$ along the bottom; by the RHR its $d\mathbf S$ points along $+\hat y$, with the current. The vertical sides are perpendicular to $\mathbf B$. With (a), $B_x(-u) = -B_x(u)$:
$$\oint\mathbf B\cdot d\mathbf l = B_x(u)\ell - B_x(-u)\ell = 2B_x(u)\ell = \mu_0JW\ell$$
$$B_x = \frac{\mu_0JW}{2} = \frac{\mu_0(2\ \text{A/m}^2)(4\ \text{m})}{2} = 4\mu_0 = 5.03\ \mu\text{T}\quad (z > 1), \qquad B_x = -4\mu_0 = -5.03\ \mu\text{T}\quad (z < -3)$$
The same as a single sheet with $J_s = JW = 8$ A/m, and independent of distance.

**(d) Inside.** The same rectangle with $u < 2$ encloses $J(2u)\ell$:
$$2B_x(u)\ell = \mu_0J(2u)\ell \quad\Rightarrow\quad B_x = \mu_0Jz' = 2\mu_0(z + 1)\ \text{T}, \quad -3 < z < 1$$
At $z = 0$: $2\mu_0 = 2.51$ µT. At $z = -2.5$: $-3\mu_0 = -3.77$ µT. At the faces it meets $\pm4\mu_0$: continuous. ✓

**(e) Plot.** Flat at $-4\mu_0$ ($-5.03$ µT) for $z < -3$; a straight line through zero at $z = -1$ with slope $2\mu_0$ per meter; flat at $+4\mu_0$ ($+5.03$ µT) for $z > 1$.

[[fig:plot]]

**Check.** $\nabla\times\mathbf H = \mathbf J$: $\partial H_x/\partial z = 2$ A/m² inside, which is $J_y$. ✓ The same shape as the formula sheet's slab, centered on $z = -1$ instead of $0$, with the direction from $\hat y\times\hat z = \hat x$.`,
      }),

      // ---------------------------------------------------------------- #4
      P({
        src: 'HW 5 #4', title: 'A cylinder of current, with and without a hole',
        q: md`An infinitely long cylindrical region of current is centered on the $z$-axis, with radius $a$, carrying a current $I$ uniformly along $+\hat z$ (Figure A).

[[fig:cyl]]

(a) What is the current density $\mathbf J$ within the cylinder? (Hint: $|\mathbf J| = I/A_a$, with $A_a$ the cross-sectional area.)

(b) Using the integral form of Ampère's law, find $\mathbf B$ everywhere inside the cylinder.

(c) Now the same current $I$ flows through the cylinder of radius $a$ with a hole of radius $b$ whose axis is parallel to the $z$-axis but offset by a distance $d$ along $x$ (Figure B). The hole carries no current. Find the current density $\mathbf J_c$ in the conductor. Is it larger or smaller than $\mathbf J$? Does that make sense physically?

(d) Using the integral form of Ampère's law, find $\mathbf B$ on the axis of the hole ($x = d$). (Hint: superposition. Write $\mathbf J_c = \mathbf J_a + \mathbf J_b$, where $\mathbf J_a$ has magnitude $|\mathbf J_c|$ over the full cylinder of radius $a$ and $\mathbf J_b$ has magnitude $|\mathbf J_c|$, opposite to $\mathbf J_a$, in the hole. Find $\mathbf B_a$ and $\mathbf B_b$ at $x = d$ and add them.)`,
        figs: { cyl: PF.row([{ svg: cylFig(false), cap: 'Figure A: radius a, current I along +ẑ (out of the page).' }, { svg: cylFig(true), cap: 'Figure B: an empty hole of radius b, its center a distance d along x.' }]) },
        parts: [
          MC('(a) $\\mathbf J = $', ['$\\dfrac{I}{\\pi a^2}\\,\\hat z$', '$\\dfrac{I}{2\\pi a}\\,\\hat z$', '$\\dfrac{I}{\\pi a^2}\\,\\hat\\phi$', '$I\\pi a^2\\,\\hat z$'], 0,
            [null, 'That divides by the circumference: a surface current (A/m), not a volume density.', 'The current flows along the cylinder, $\\hat z$.', 'Divide by the area, do not multiply.']),
          MC('(b) $\\mathbf B$ for $r < a$ is', ['$\\dfrac{\\mu_0Ir}{2\\pi a^2}\\,\\hat\\phi$', '$\\dfrac{\\mu_0I}{2\\pi r}\\,\\hat\\phi$', '$\\dfrac{\\mu_0Ir^2}{2\\pi a^3}\\,\\hat\\phi$', '$\\dfrac{\\mu_0Ir}{2\\pi a^2}\\,\\hat z$'], 0,
            [null, 'That is the outside field: inside, a circle encloses only $Ir^2/a^2$.', 'The enclosed current goes as $r^2$, the path as $r$: one net power of $r$.', '$\\mathbf B$ circles the current; it has no $\\hat z$ part.']),
          MC('(c) $\\mathbf J_c$ is', ['$\\dfrac{I}{\\pi(a^2 - b^2)}\\,\\hat z$, larger than $\\mathbf J$', '$\\dfrac{I}{\\pi(a^2 - b^2)}\\,\\hat z$, smaller than $\\mathbf J$', '$\\dfrac{I}{\\pi a^2}\\,\\hat z$, the same as $\\mathbf J$', '$\\dfrac{I}{\\pi(a - b)^2}\\,\\hat z$, larger than $\\mathbf J$'], 0,
            [null, '$a^2 - b^2 < a^2$, so dividing by it gives a larger density.', 'The hole removes conducting area; the same $I$ must crowd into less of it.', 'The area of the conductor is the annulus-like region $\\pi a^2 - \\pi b^2$, not $\\pi(a - b)^2$.']),
          MC('(d) $\\mathbf B$ at $x = d$ is', ['$\\dfrac{\\mu_0Id}{2\\pi(a^2 - b^2)}\\,\\hat y$', '$\\dfrac{\\mu_0Id}{2\\pi a^2}\\,\\hat y$', '$\\dfrac{\\mu_0Id}{2\\pi(a^2 - b^2)}\\,\\hat x$', '$0$, since the hole carries no current'], 0,
            [null, 'That uses the old $J$; the conductor carries $J_c = I/\\pi(a^2 - b^2)$.', 'At $(d, 0)$, $\\hat\\phi = \\hat y$: $\\mathbf B_a$ is along $\\hat y$.', 'The hole is empty, but the current around it still makes a field inside it.']),
        ],
        hints: ['(b) A circle of radius $r < a$ encloses $J\\pi r^2$. (c) The conducting area is $\\pi a^2 - \\pi b^2$.', '(d) $\\mathbf B_a$ at $x = d$ is the inside field of a full cylinder carrying $J_c$, at $r = d$. $\\mathbf B_b$ is the field of the hole-sized cylinder carrying $-J_c$, at its own axis.'],
        sol: md`**(a)** Uniform over the area $A_a = \pi a^2$:
$$\mathbf J = \frac{I}{\pi a^2}\,\hat z\ \ \text{A/m}^2$$

**(b)** By symmetry $\mathbf B = B_\phi(r)\hat\phi$. Ampère on a circle of radius $r < a$, counterclockwise seen from $+z$ ($d\mathbf S = +\hat z$):
$$\oint\mathbf B\cdot d\mathbf l = B_\phi\,2\pi r = \mu_0J\pi r^2 = \mu_0I\frac{r^2}{a^2} \quad\Rightarrow\quad \mathbf B = \frac{\mu_0Ir}{2\pi a^2}\,\hat\phi = \frac{\mu_0J}{2}\,r\,\hat\phi\quad(r < a)$$
Zero on the axis, largest ($\mu_0I/2\pi a$) at the surface. As a vector, $\mathbf B = \tfrac12\mu_0\mathbf J\times\mathbf r_\perp$, with $\mathbf r_\perp$ from the axis to the point.

**(c)** The same $I$ now crosses the conducting area $\pi a^2 - \pi b^2$:
$$\mathbf J_c = \frac{I}{\pi(a^2 - b^2)}\,\hat z$$
**Larger** than $\mathbf J$. It makes sense: removing conductor leaves less area for the same current, so it crowds.

**(d) Superposition.** $\mathbf J_c$ in the conductor and zero in the hole is the same as $\mathbf J_a = J_c\hat z$ over the full cylinder of radius $a$ plus $\mathbf J_b = -J_c\hat z$ over the hole. At the hole's axis, $(d, 0)$:
- $\mathbf B_a$: inside the full cylinder at $r = d$, where $\hat\phi = \hat y$: $\mathbf B_a = \dfrac{\mu_0J_cd}{2}\,\hat y$.
- $\mathbf B_b$: the hole cylinder's field on its own axis, $r = 0$: $\mathbf B_b = 0$.
$$\mathbf B(x = d) = \frac{\mu_0J_cd}{2}\,\hat y = \frac{\mu_0Id}{2\pi(a^2 - b^2)}\,\hat y$$

**More:** at any point $\mathbf r_\perp$ in the hole, $\mathbf B = \tfrac12\mu_0J_c\hat z\times\mathbf r_\perp - \tfrac12\mu_0J_c\hat z\times(\mathbf r_\perp - d\hat x) = \tfrac12\mu_0J_cd\,\hat y$: the field is **uniform** in the whole hole, not just on its axis.

**Check.** $b\to0$: $\mu_0Id/2\pi a^2$, the solid cylinder's field at $r = d$ from (b). ✓ $d\to0$ (a centered hole, a tube): zero field inside, as Ampère gives for a circle that encloses no current. ✓ A filament-by-filament numerical sum over the holed cross-section gives the same uniform field.`,
      }),
    ],
  });
})();

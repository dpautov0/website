/* Topic 7 — Magnetic flux, Gauss's law for B, and the vector potential (Lectures 12 and 15a).
   Flux through open surfaces (uniform, and strip by strip), ∮B·dS = 0 and ∇·B = 0, the rim and the closing trick for
   awkward surfaces, B = ∇×A, E = −∇Φ − ∂A/∂t, Ψ = ∮A·dl, and recovering J from A (Summer 2019 #2(b)).
   Faraday's law itself is Topic 8; inductance is Topic 11; B and H at material interfaces are Topic 13. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;

  // ---------------------------------------------------------------- helpers
  const AX = ['x', 'y', 'z'];
  // the m-th component of a curl, written out
  const CURL = [md`\partial_yA_z - \partial_zA_y`, md`\partial_zA_x - \partial_xA_z`, md`\partial_xA_y - \partial_yA_x`];
  // sign of the permutation (a, b, third index) of (x, y, z): (∇×A)_m = eps(m, j) ∂_j A_i when only A_i(x_j) is nonzero
  const eps = (a, b) => ((b - a + 3) % 3 === 1 ? 1 : -1);
  const cf = (c) => (c === 1 ? '' : c === -1 ? '-' : String(c));             // a coefficient in front of a symbol
  const par = (x) => (x < 0 ? `(${x})` : `${x}`);
  // [[coef, 'tex'], ...] -> '2x\,\hat x - y\,\hat y', zero terms dropped
  const lin = (cs) => {
    let s = '';
    for (const [c, t] of cs) {
      if (!c) continue;
      const m = Math.abs(c) === 1 ? '' : String(Math.abs(c));
      s += s ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '');
      s += m + t;
    }
    return s || '0';
  };
  const UV = ['$+\\hat x$', '$-\\hat x$', '$+\\hat y$', '$-\\hat y$', '$+\\hat z$', '$-\\hat z$'];
  const uvIx = (ax, s) => 2 * ax + (s > 0 ? 0 : 1);

  // ---------------------------------------------------------------- figures
  // one turn of a toroid, cross-section: a < r < b, 0 < z < h, B into the page, a strip of width dr
  function torFig() {
    const g = PF.fig({ alt: 'the rectangular cross-section of one toroid turn from r = a to r = b and z = 0 to h, with B into the page and a thin strip of width dr shaded' });
    const x0 = 90, x1 = 250, y0 = 40, y1 = 150;
    g.line(30, 24, 30, 166, { cls: 'dim dash' });
    g.label(30, 172, '\\text{axis}', 't', 'small');
    g.rect(163, y0, 14, y1 - y0, { cls: 'shade' });
    g.rect(x0, y0, x1 - x0, y1 - y0, { cls: 'thick' });
    g.marks('x', 105, 60, 235, 130, 5, 3, { r: 3.5 });
    g.label(170, y0 - 6, 'dr', 'b', 'small');
    g.label(x0, y1 + 6, 'r = a', 't', 'small');
    g.label(x1, y1 + 6, 'r = b', 't', 'small');
    g.dim(x1 + 18, y1, x1 + 18, y0, 'h');
    g.label(x0 - 8, 95, '\\mathbf B', 'r');
    return g.svg();
  }

  // two surfaces with one rim: a flat disk S1 and a dome S2, both with dS up (C counterclockwise from above)
  function rimFig() {
    const g = PF.fig({ alt: 'a flat disk S1 and a dome S2 share one rim C, traversed counterclockwise seen from above; both have dS pointing up' });
    const cx = 150, cy = 140, rx = 100, ry = 26;
    g.ellipse(cx, cy, rx, ry, { cls: 'shade' });
    g.ellipse(cx, cy, rx, 92, { half: 'back' });
    g.ellipse(cx, cy, rx, ry, { half: 'back', cls: 'thick dash' });
    g.ellipse(cx, cy, rx, ry, { half: 'front', cls: 'thick' });
    g.head(cx + 4, cy + ry, 1, 0, { hs: 9 });
    g.label(cx + rx * 0.72, cy + ry + 4, 'C', 'tl');
    g.arrow(cx, cy, cx, cy - 36, { hs: 7 });
    g.label(cx + 6, cy - 30, 'd\\mathbf S_1', 'l', 'small');
    g.arrow(cx, cy - 92, cx, cy - 128, { hs: 7 });
    g.label(cx + 6, cy - 122, 'd\\mathbf S_2', 'l', 'small');
    g.label(cx - rx - 8, cy, 'S_1', 'r');
    g.label(cx - 78, cy - 70, 'S_2', 'br');
    return g.svg();
  }

  // a half-cylinder roof along x on the z = 0 plane, closed by its floor and two half-disk ends
  function tunnelFig() {
    const g = PF.fig({ alt: 'a half-cylinder roof of radius R and length l with its axis along x, standing on the z = 0 plane; the dashed floor and the shaded half-disk end close it' });
    g.setProj(150, 150, 1, 0.5, 215);
    const Rr = 55, Lx = 130, D = Math.PI / 180, TS = 125;          // TS: the roof's silhouette angle in this view
    const arc = (x, a0, a1) => { const pts = []; for (let i = 0; i <= 36; i++) { const t = (a0 + (a1 - a0) * i / 36) * D; pts.push(g.p3(x, Rr * Math.cos(t), Rr * Math.sin(t))); } return pts; };
    const gen = (t) => [[0, Rr * Math.cos(t * D), Rr * Math.sin(t * D)], [Lx, Rr * Math.cos(t * D), Rr * Math.sin(t * D)]];
    // hidden: the floor's back edge, its left edge, and the back end's arc behind the roof
    g.l3([0, -Rr, 0], [0, Rr, 0], { cls: 'dash dim' });
    g.l3(...gen(180), { cls: 'dash dim' });
    g.pl(arc(0, TS, 180), { cls: 'dash dim' });
    // visible: the back arc, the right floor edge, the silhouette, and the shaded front end
    g.pl(arc(0, 0, TS));
    g.l3(...gen(0), { cls: 'thick' });
    g.l3(...gen(TS));
    g.poly(arc(Lx, 0, 180), { cls: 'shade' });
    g.pl(arc(Lx, 0, 180), { cls: 'thick' });
    g.l3([Lx, -Rr, 0], [Lx, Rr, 0], { cls: 'thick' });
    const C0 = g.p3(Lx, 0, 0), Rp = g.p3(Lx, Rr * Math.cos(60 * D), Rr * Math.sin(60 * D));
    g.line(C0[0], C0[1], Rp[0], Rp[1], { cls: 'dim' });
    g.label((C0[0] + Rp[0]) / 2 + 6, (C0[1] + Rp[1]) / 2 + 4, 'R', 'tl', 'small');
    const Fl = g.p3(Lx / 2, -Rr, 0);
    g.label(Fl[0] - 8, Fl[1] + 2, '\\text{floor}', 'r', 'small');
    const c60 = Math.cos(50 * D), s60 = Math.sin(50 * D);
    const Tp = g.p3(Lx * 0.4, Rr * c60, Rr * s60), Tq = g.p3(Lx * 0.4, (Rr + 32) * c60, (Rr + 32) * s60);
    g.arrow(Tp[0], Tp[1], Tq[0], Tq[1], { hs: 7 });
    g.label(Tq[0] + 6, Tq[1], '\\hat n', 'l', 'small');
    const Lb = g.p3(Lx * 0.55, Rr, 0);
    g.label(Lb[0] + 10, Lb[1] + 6, '\\ell', 'l', 'small');
    g.setProj(300, 170, 1, 0.5, 215);
    g.axes3(30);
    return g.svg();
  }

  // A = x̂|z|: B = +ŷ (into the page) above z = 0, −ŷ (out of the page) below; the sheet current runs along −x̂
  function sheetFig() {
    const g = PF.fig({ alt: 'side view with x to the right and z up: B points into the page above the plane z = 0 and out of the page below it; the current sheet on z = 0 carries current toward minus x' });
    g.marks('x', 80, 40, 250, 76, 6, 2, { r: 4 });
    g.marks('dot', 80, 144, 250, 180, 6, 2, { r: 2.4 });
    g.line(60, 110, 270, 110, { cls: 'thick dash' });
    g.head(150, 110, -1, 0, { hs: 10 });
    g.label(278, 110, '\\mathbf J_s = -\\tfrac{2}{\\mu_0}\\hat x', 'l', 'small');
    g.label(262, 58, '\\mathbf B = +\\hat y', 'l', 'small');
    g.label(262, 162, '\\mathbf B = -\\hat y', 'l', 'small');
    g.axes(22, 190, { x: [0, 30], y: [0, 30], xl: 'x', yl: 'z' });
    g.otimes(22, 190, 5, { lab: 'y', at: 'bl' });
    return g.svg();
  }

  // B_y(z) for the worked example: a slab of current
  function byPlot() {
    return PF.plot({
      w: 300, h: 190, x: [-0.2, 0.2], y: [-0.03, 0.03], zero: true,
      xt: [[-0.1, '-0.1'], [0.1, '0.1']], yt: [[0.02, '0.02'], [-0.02, '-0.02']],
      vlines: [[-0.1, ''], [0.1, '']],
      curves: [{ f: (z) => (Math.abs(z) <= 0.1 ? 0.2 * z : 0.02 * Math.sign(z)) }],
      xl: 'z\\ (\\text{m})', yl: 'B_y\\ (\\text{T})',
    });
  }

  // ---------------------------------------------------------------- the lesson
  EM.lesson('u2', {
    id: 't7-flux', topic: 7, ref: 'Lectures 12, 15', title: 'Magnetic flux and ∇·B = 0',
    steps: [
      R(md`
        !!key Why you care
          Flux feeds every Faraday problem, and this topic has exam points of its own: flux through one turn of a toroid (Spring 2018 #2(a), 10 points), flux of a nonuniform field (Summer 2020 #3(b)), testing whether a field can be a $\mathbf B$. HW 5 #1, the flux through a partial cone, takes two lines once you close the surface. **The vector potential is not on the Fall 2026 Exam 2** (instructor answer on Piazza); it now sits in [Extra](#/l/x-vecpot).

        ### Notation

        - $\mathbf B$: magnetic flux density, T = Wb/m².
        - $S$: a surface. An **open** surface has an edge, its **rim** $C$. A **closed** surface (a balloon) has no rim; $\oint_S$ covers all of it, with $d\mathbf S$ pointing **outward**.
        - $d\mathbf S = \hat n\,dS$: a small patch as a vector (size = area, direction = normal). On an open surface the right-hand rule (RHR) from $C$ fixes $\hat n$.
        - $\Psi = \int_S\mathbf B\cdot d\mathbf S$: magnetic flux, Wb = T·m² = V·s.
        - $\nabla\cdot\mathbf B = \partial_xB_x + \partial_yB_y + \partial_zB_z$: divergence, the net outflow per volume. $\nabla\times\mathbf H$: curl, the circulation per area. ($\partial_x$ is short for $\partial/\partial x$; see [curl and divergence](#/l/u0-curl-div).)
        - $\mathbf H = \mathbf B/\mu_0$ in free space (A/m); volume current $\mathbf J$ (A/m²), surface current $\mathbf J_s$ (A/m).
        - $\operatorname{sgn}(z) = \pm1$ for $z \gtrless 0$; $\delta(z)$: a spike at $z = 0$ with unit area, 1/m ([deltas](#/l/u0-deltas)). $\frac{d}{dz}|z| = \operatorname{sgn}(z)$ and $\frac{d}{dz}\operatorname{sgn}(z) = 2\delta(z)$.

        ### The idea

        Magnetic field lines never begin or end: there is no magnetic charge. So whatever flux enters a closed surface also leaves it:
        $$\oint_S\mathbf B\cdot d\mathbf S = 0 \qquad\Longleftrightarrow\qquad \nabla\cdot\mathbf B = 0$$
        Two tools follow. The flux through an open surface depends only on its rim, so an awkward surface can be swapped for flat ones. And $\nabla\cdot\mathbf B = 0$ is a test: a proposed field that fails it cannot be a magnetic field.
      `),
      RF(md`
        ### Step 1: flux through an open surface

        Flux counts the field lines that cross $S$, with a sign: $+$ along $d\mathbf S$, $-$ against it. Uniform $\mathbf B$ through a flat surface: $\Psi = (\mathbf B\cdot\hat n)A$. Nonuniform $\mathbf B$: cut $S$ into strips on which $\mathbf B$ is constant, and add them up.

        [[fig:tor]]

        One turn of a toroid with a rectangular cross-section (Spring 2018 #2(a)): $\mathbf B = \hat\phi\,\mu_0NI/2\pi r$ crosses the turn's rectangle ($a < r < b$, $0 < z < h$) head-on. A strip at radius $r$ has area $h\,dr$:
        $$\Psi = \int_a^b\frac{\mu_0NI}{2\pi r}\,h\,dr = \frac{\mu_0NIh}{2\pi}\ln\frac ba$$
      `, { tor: { svg: torFig(), cap: 'One turn of the toroid, in cross-section. B points into the page and falls as 1/r; on a strip of width dr it is constant.' } }),
      Q(md`**Predict.** $\mathbf B = B_0(1 + x/L)\,\hat z$ is not uniform. A square loop of side $a$ lies in the $xy$-plane, centered on the origin, with $d\mathbf S = +\hat z$. $\Psi = $`,
        ['$B_0a^2$', '$B_0a^2(1 + a/2L)$', '$B_0a$', '$0$'], 0,
        [null, 'That is $B$ at the right edge, $x = a/2$, times the area. The loop is centered, so $x/L$ is as negative on its left half as it is positive on its right half.', 'That multiplies $B_0$ by one side. Flux needs the area, $a^2$.', 'Only the varying part integrates to zero; the uniform part $B_0$ still crosses the loop.'],
        md`$$\Psi = \int_{-a/2}^{a/2}\!\int_{-a/2}^{a/2}B_0\left(1 + \frac xL\right)dx\,dy = B_0a^2 + \frac{B_0a}{L}\int_{-a/2}^{a/2}x\,dx = B_0a^2$$
        The odd part averages to zero over a centered loop. (Summer 2020 #3(b): a 1 m square in $25\times10^{-6}(1 + x/L)\,\hat z$ T links $25\ \mu$Wb.)`),
      R(md`
        ### Step 2: no magnetic charge, ∮B·dS = 0

        Electric field lines start on $+$ charge and end on $-$ charge, so $\oint\mathbf D\cdot d\mathbf S = Q_{\text{enc}}$. Magnetic field lines close on themselves: every line that leaves a closed surface comes back in somewhere else. Cut a bar magnet in half and you get two magnets, each with both poles.
        $$\oint_S\mathbf B\cdot d\mathbf S = 0, \qquad \nabla\cdot\mathbf B = \frac{\partial B_x}{\partial x} + \frac{\partial B_y}{\partial y} + \frac{\partial B_z}{\partial z} = 0$$
        The local form follows from the integral one by the divergence theorem, applied to a tiny box. It is a **test**: a proposed field with $\nabla\cdot\mathbf B \ne 0$ anywhere cannot be a magnetic field. Its curl is no test: a nonzero curl only says currents flow there.
      `),
      Q(md`**Predict.** Which of these could be a magnetic flux density? ($B_0$ and $\ell$ are constants.)`,
        ['$B_0(x\\hat x - 2y\\hat y + z\\hat z)/\\ell$', '$B_0(x\\hat x + y\\hat y + z\\hat z)/\\ell$', '$B_0x^2\\hat x/\\ell^2$', '$B_0\\ell^2\\hat R/R^2$ ($R$: distance from the origin)'], 0,
        [null, '$\\nabla\\cdot\\mathbf B = 3B_0/\\ell$: lines spray out of every point, as if from magnetic charge.', '$\\nabla\\cdot\\mathbf B = 2B_0x/\\ell^2 \\ne 0$: $B_x$ grows along $x$ and nothing compensates.', 'That is the field of a point "monopole": its flux out of any sphere around the origin is $4\\pi B_0\\ell^2$, not zero.'],
        md`$\nabla\cdot\mathbf B = (B_0/\ell)(1 - 2 + 1) = 0$. What $B_x$ gains along $x$ and $B_z$ along $z$, $B_y$ loses along $y$.`),
      RF(md`
        ### Step 3: the flux depends only on the rim

        [[fig:rim]]

        Take two surfaces $S_1$ and $S_2$ with the same rim $C$, both oriented by the RHR from $C$. Together they enclose a volume. Flip $S_1$'s normal so that both point outward: $\Psi_2 - \Psi_1 = \oint\mathbf B\cdot d\mathbf S = 0$. So **every surface with rim $C$ carries the same flux**. That is why Faraday's law may use any surface bounded by $C$.

        The trick for awkward surfaces: **close it with flat pieces.** The outward fluxes of all the pieces add to zero, and the flat pieces are easy.

        [[fig:tunnel]]

        A half-cylinder roof (radius $R$, length $\ell$, axis along $x$, standing on $z = 0$) sits in a uniform $\mathbf B = B_x\hat x + B_y\hat y + B_z\hat z$. The flux out through the curved roof: close it with the floor (area $2R\ell$, outward $-\hat z$) and the two half-disk ends (area $\pi R^2/2$ each, outward $\mp\hat x$):
        $$\Psi_{\text{roof}} + \underbrace{(-B_z)\,2R\ell}_{\text{floor}} + \underbrace{(-B_x + B_x)\tfrac12\pi R^2}_{\text{ends}} = 0 \quad\Rightarrow\quad \Psi_{\text{roof}} = 2R\ell\,B_z$$
        Only $B_z$ survives: $B_x$ enters one end and leaves the other, and $B_y$ enters one side of the roof and leaves the other side.
      `, {
        rim: { svg: rimFig(), cap: 'One rim C, two surfaces, both oriented by the RHR from C: the same flux crosses both.' },
        tunnel: { svg: tunnelFig(), cap: 'Close the curved roof with the floor (dashed) and the two half-disk ends (front one shaded); their outward fluxes are one line each.' },
      }),
      Q(md`**Predict.** A hemispherical dome of radius $R$ ($z \ge 0$, no floor) stands on the $xy$-plane in a uniform $\mathbf B = B_0(2\hat x - 3\hat z)$. The flux **out** through the dome is…`,
        ['$-3\\pi R^2B_0$', '$+3\\pi R^2B_0$', '$-6\\pi R^2B_0$', '$0$'], 0,
        [null, 'That is the outward flux through the floor disk. Dome and floor must add to zero.', 'That uses the dome\'s curved area, $2\\pi R^2$. Only the projected area $\\pi R^2$ counts.', 'Zero is the total for dome plus floor. The dome alone carries the floor\'s flux, reversed.'],
        md`Close it with the disk at $z = 0$, outward normal $-\hat z$: $\Psi_{\text{floor}} = (-B_z)\pi R^2 = +3\pi R^2B_0$. So $\Psi_{\text{dome}} = -3\pi R^2B_0$: the field points mostly down, into the dome. The $B_x$ lines enter its back and leave its front: no net.`),
      RF(md`
        ### The method

        !!method Flux and Gauss's law for B
          1. **Flux:** fix $d\mathbf S$ (RHR from $C$). Uniform $\mathbf B$: $\Psi = (\mathbf B\cdot\hat n)A$. Otherwise cut $S$ into strips where $\mathbf B$ is constant and integrate.
          2. **Awkward surface:** close it with flat pieces, all normals outward; $\Psi_{\text{awkward}} = -\sum\Psi_{\text{flat}}$. Switch to the $d\mathbf S$ the problem asks for at the end.
          3. **Is it a B field?** Compute $\nabla\cdot\mathbf B$. Zero everywhere: yes. Anything else: no.
          4. **Check:** units (Wb = T·m²), the sign (+ along $d\mathbf S$), and that all the closed surface's outward fluxes add to zero.

        ### Worked example

        !!graded Problem
          A half-cylinder of radius $R$ and length $\ell$ has its axis along $y$ ($0 \le y \le \ell$) and stands on the plane $z = 0$ (the part with $z \ge 0$). (a) Show that $\mathbf B = B_0(2\hat x + \hat y - 4\hat z)$ is a possible magnetic field and find its outward flux through the curved surface. (b) Repeat for the nonuniform $\mathbf B = B_0\left(\dfrac{x}{\ell}\hat x + \hat y - \dfrac{z}{\ell}\hat z\right)$.

        **1. Divergence.** (a) Uniform: $\nabla\cdot\mathbf B = 0$. (b) $\nabla\cdot\mathbf B = B_0\left(\tfrac1\ell + 0 - \tfrac1\ell\right) = 0$. Both are possible $\mathbf B$ fields, so the closing trick applies to both.

        **2. Close the surface.** Add the floor ($z = 0$, area $2R\ell$, outward $-\hat z$) and the two half-disk ends ($y = 0$ and $y = \ell$, area $\tfrac12\pi R^2$ each, outward $-\hat y$ and $+\hat y$). Then $\Psi_{\text{curved}} = -(\Psi_{\text{floor}} + \Psi_{\text{ends}})$.

        **3. (a) Uniform field.**
        $$\Psi_{\text{floor}} = (-4B_0)(-1)(2R\ell) = 8B_0R\ell, \qquad \Psi_{\text{ends}} = (-B_0 + B_0)\tfrac12\pi R^2 = 0$$
        $$\Psi_{\text{curved}} = -8B_0R\ell\ \ \text{Wb}$$
        Negative: the field points mostly down, so it enters the curved roof. $B_x$ enters one side of the roof and leaves the other: no net.

        **4. (b) Nonuniform field.** On the floor $B_z = -B_0z/\ell = 0$, so $\Psi_{\text{floor}} = 0$; on the ends $B_y = B_0$ is uniform and cancels. So $\Psi_{\text{curved}} = 0$.

        **Check by direct integration.** On the roof $\hat n = (x\hat x + z\hat z)/R$ with $x = R\cos\theta$, $z = R\sin\theta$, $dS = R\,d\theta\,dy$:
        $$\Psi_{\text{curved}} = \int_0^\ell\!\!\int_0^\pi\frac{B_0R^2}{\ell R}(\cos^2\theta - \sin^2\theta)\,R\,d\theta\,dy = B_0R^2\int_0^\pi\cos2\theta\,d\theta = 0\ ✓$$
        The same check for (a) gives $B_0R\ell\left[2\sin\theta + 4\cos\theta\right]_0^\pi = -8B_0R\ell$ ✓.

        !!mistake Common mistakes
          - Using the curved area for a uniform field. A dome of radius $R$ has area $2\pi R^2$, but its flux is $B_z\pi R^2$: only the projection counts.
          - Mixing normals when closing a surface. Use outward normals for $\oint = 0$, then convert to the $d\mathbf S$ the problem asks for.
          - Forgetting a flat piece. Count every face, including ends whose fluxes cancel.
          - A nonuniform field on a flat piece: integrate it over that piece; don't use its value at one point.
          - Testing a B field with its curl. $\nabla\times\mathbf B \ne 0$ only means current is present; the test is $\nabla\cdot\mathbf B = 0$.

        ### Check questions
      `, {}),
      Q(md`For which $k$ is $\mathbf B = B_0(kx\,\hat x + 3y\,\hat y - 2z\,\hat z)/\ell$ a possible magnetic field?`,
        ['$k = -1$', '$k = 1$', '$k = 5$', '$k = -5$'], 0,
        [null, 'Then $\\nabla\\cdot\\mathbf B = (1 + 3 - 2)B_0/\\ell = 2B_0/\\ell$.', 'Then $\\nabla\\cdot\\mathbf B = 6B_0/\\ell$: that is $k = 3 + 2$, the sizes added with both signs dropped.', 'Then $\\nabla\\cdot\\mathbf B = -4B_0/\\ell$: that solves $k + 3 + 2 = 0$, reading $-2z$ as $+2z$.'],
        md`$\nabla\cdot\mathbf B = (k + 3 - 2)B_0/\ell = 0$ gives $k = -1$.`),
      Q(md`A closed tin can sits in a static, nonuniform $\mathbf B$. The outward flux is $3$ mWb through its side and $2$ mWb through its top. Through its bottom (outward) it is…`,
        ['$-5$ mWb', '$+5$ mWb', '$-1$ mWb', '$0$'], 0,
        [null, 'Then the total would be 10 mWb, not zero.', 'That treats the top\'s 2 mWb as entering. All three are outward: $3 + 2 + \\Psi = 0$.', 'Only the total is zero; flux has to come in somewhere.'],
        md`$\oint\mathbf B\cdot d\mathbf S = 3 + 2 + \Psi_{\text{bottom}} = 0$, so 5 mWb enters through the bottom.`),
      Q(md`A closed surface surrounds only the north end of a long bar magnet; the magnet pierces the surface. The net outward flux of $\mathbf B$ is…`,
        ['zero', 'positive: field lines leave a north pole', 'negative', 'proportional to the magnet\'s strength'], 0,
        [null, 'Outside the magnet the lines leave; inside the magnet the same lines come back in, where the magnet crosses the surface.', 'Lines leave the north end on the outside; the net is still zero.', 'There is no magnetic charge to enclose, however strong the magnet is.'],
        md`$\oint\mathbf B\cdot d\mathbf S = 0$ for every closed surface. Inside a bar magnet $\mathbf B$ runs from S to N, closing the loops that leave N on the outside.`),
      Q(md`A flat disk and a deep bowl share the same circular rim $C$; both are oriented by the RHR from $C$. In a static, nonuniform $\mathbf B$, their fluxes are…`,
        ['equal', 'different: the bowl has more area', 'equal and opposite', 'equal only if $\\mathbf B$ is uniform'], 0,
        [null, 'Extra area lets more lines in and out; the net through it is fixed by the rim.', 'They are opposite only if one is oriented outward from the volume between them. With the RHR from the same $C$ they are equal.', '$\\oint\\mathbf B\\cdot d\\mathbf S = 0$ holds for any $\\mathbf B$.'],
        md`Disk and bowl (one flipped) form a closed surface with zero net outward flux, so the fluxes along the RHR normals are equal.`),
      R(md`
        ### Rapid fire: is it a magnetic field?

        **The trick:** add $\partial_xB_x + \partial_yB_y + \partial_zB_z$. A component that does not depend on its own coordinate contributes nothing. Zero everywhere: a possible $\mathbf B$.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t7_div', { need: 8 }), { id: 't7-flux.r0' }),
      R(md`
        ### Rapid fire: close the surface

        **The trick:** for a uniform field only the component normal to the rim's flat disk (or floor) matters; the awkward surface carries the flat piece's outward flux with the sign reversed.
      `),
      Object.assign(G('rf_t7_close', { need: 8 }), { id: 't7-flux.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t7_toroid', { need: 2 }),
      G('t7_close', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- the vector potential: Extra (not on the Fall 2026 Exam 2)
  EM.lesson('x-extra', {
    id: 'x-vecpot', topic: 'A', ref: 'Lecture 15a', title: 'The vector potential A (not on Exam 2)',
    steps: [
      R(md`
        !!key Not on the Fall 2026 Exam 2
          The instructors answered on Piazza that the vector potential will **not** be tested on Exam 2 (Section C did not cover it). Older exams used it (Spring 2018 1(v), Summer 2019 #2(b) and its conflict exam), so it is kept here for those papers and for later courses. Skip it before the exam.

        ### Notation

        - $\mathbf A$: the magnetic **vector potential**, Wb/m = T·m = V·s/m. $\Phi$: the scalar (electric) potential, V; in statics it is the familiar $V$.
        - Everything else as in [Topic 7](#/l/t7-flux): $\mathbf B$ (T), $\mathbf H = \mathbf B/\mu_0$ (A/m), $\mathbf J$ (A/m²), $\mathbf J_s$ (A/m), $\operatorname{sgn}(z)$, $\delta(z)$.
      `),
      R(md`
        ### Step 4: the vector potential, B = ∇×A

        The divergence of a curl is always zero: $\nabla\cdot(\nabla\times\mathbf A) = 0$ for any $\mathbf A$. The converse holds too: a divergence-free field is the curl of something. So Gauss's law for $\mathbf B$ lets us write
        $$\mathbf B = \nabla\times\mathbf A = \hat x\left(\frac{\partial A_z}{\partial y} - \frac{\partial A_y}{\partial z}\right) + \hat y\left(\frac{\partial A_x}{\partial z} - \frac{\partial A_z}{\partial x}\right) + \hat z\left(\frac{\partial A_y}{\partial x} - \frac{\partial A_x}{\partial y}\right)$$
        Each component uses the other two, in the cyclic order $x \to y \to z \to x$.

        **Flux from A.** Stokes' theorem turns the surface integral into a rim integral:
        $$\Psi = \int_S(\nabla\times\mathbf A)\cdot d\mathbf S = \oint_C\mathbf A\cdot d\mathbf l$$
        A second proof that the flux depends only on the rim.

        **Not unique.** The curl of a gradient is zero, so $\mathbf A$ and $\mathbf A + \nabla\lambda$ give the same $\mathbf B$ for any function $\lambda$. The divergence of $\mathbf A$ is yours to choose (Lecture 15's challenge question); problems often pick $\nabla\cdot\mathbf A = 0$.
      `),
      Q(md`**Predict.** $\mathbf A = B_0x\,\hat y$. Then $\mathbf B = \nabla\times\mathbf A = $`,
        ['$B_0\\hat z$', '$-B_0\\hat z$', '$B_0\\hat x$', '$0$'], 0,
        [null, 'Sign: $(\\nabla\\times\\mathbf A)_z = \\partial_xA_y - \\partial_yA_x$, and the first term is $+B_0$.', 'The curl of a field along $\\hat y$ that varies along $x$ points along the third axis, $\\hat z$.', '$A_y$ changes across its own direction, so it has a curl.'],
        md`$B_z = \partial_xA_y = B_0$: a uniform field. So do $-B_0y\,\hat x$ and $\tfrac12B_0(x\hat y - y\hat x)$; they differ from $B_0x\,\hat y$ by $\nabla(B_0xy)$ and $\nabla(\tfrac12B_0xy)$.`),
      R(md`
        ### Step 5: E from the potentials

        Put $\mathbf B = \nabla\times\mathbf A$ into Faraday's law:
        $$\nabla\times\mathbf E = -\frac{\partial}{\partial t}\nabla\times\mathbf A \quad\Rightarrow\quad \nabla\times\left(\mathbf E + \frac{\partial\mathbf A}{\partial t}\right) = 0 \quad\Rightarrow\quad \mathbf E = -\nabla\Phi - \frac{\partial\mathbf A}{\partial t}$$
        A curl-free field is a gradient (the converse of $\nabla\times\nabla\Phi = 0$), and the minus sign matches electrostatics. With fields that do not change, $\mathbf E = -\nabla\Phi$: the $-\nabla V$ you know. A changing $\mathbf A$ adds the induced, circulating part.

        Four unknowns ($\Phi$, $A_x$, $A_y$, $A_z$) replace six ($\mathbf E$ and $\mathbf B$), and Faraday's law and Gauss's law for $\mathbf B$ hold automatically.
      `),
      Q(md`**Predict.** $\Phi = 0$ and $\mathbf A = A_0t\,\hat z$ everywhere ($A_0$ constant, uniform in space). Then…`,
        ['$\\mathbf E = -A_0\\hat z$ and $\\mathbf B = 0$', '$\\mathbf E = 0$ and $\\mathbf B = 0$', '$\\mathbf E = -A_0\\hat z$ and $\\mathbf B = A_0\\hat z$', '$\\mathbf E = +A_0\\hat z$ and $\\mathbf B = 0$'], 0,
        [null, 'A changing $\\mathbf A$ drives $\\mathbf E$ even with $\\Phi = 0$: $-\\partial\\mathbf A/\\partial t = -A_0\\hat z$.', '$\\mathbf A$ is the same at every point, so its curl is zero.', 'Sign: $\\mathbf E = -\\partial\\mathbf A/\\partial t$.'],
        md`$\mathbf E = -\partial\mathbf A/\partial t = -A_0\hat z$, uniform and steady; $\nabla\times\mathbf A = 0$ since $\mathbf A$ does not vary in space. Consistent with Faraday: $\nabla\times\mathbf E = 0 = -\partial\mathbf B/\partial t$.`),
      RF(md`
        ### Step 6: from A to B to J

        Summer 2019 #2(b): $\mathbf A = \hat x\,|z|$ Wb/m.

        1. $\nabla\cdot\mathbf A = \partial_x|z| = 0$.
        2. Only $\partial_zA_x$ survives in the curl: $\mathbf B = \hat y\,\partial_zA_x = \hat y\operatorname{sgn}(z)$ T. That is $+\hat y$ above $z = 0$ and $-\hat y$ below.
        3. $\mathbf H = \mathbf B/\mu_0$ jumps by $2/\mu_0$ at $z = 0$. Ampère's law, $\mathbf J = \nabla\times\mathbf H$, turns the jump into a delta: $\mathbf J = -\hat x\,\partial_zH_y = -\hat x\frac{2}{\mu_0}\delta(z)$ A/m², a **current sheet** $\mathbf J_s = -\frac{2}{\mu_0}\hat x = -1.59\times10^6\,\hat x$ A/m on $z = 0$.

        [[fig:sheet]]

        Check with the sheet formula: $\mathbf J_s = -J_s\hat x$ gives $H_y = \pm J_s/2$ for $z \gtrless 0$, here $\pm1/\mu_0$ ✓. Or with the boundary condition $\mathbf J_s = \hat n\times(\mathbf H^+ - \mathbf H^-) = \hat z\times\frac{2}{\mu_0}\hat y = -\frac{2}{\mu_0}\hat x$ ✓. RHR: thumb along $-\hat x$, the fingers point into the page ($+\hat y$) above the sheet ✓.
      `, { sheet: { svg: sheetFig(), cap: 'A = x̂|z|: B = +ŷ (into the page) above z = 0 and −ŷ (out of the page) below. The jump is a current sheet flowing along −x̂.' } }),
      Q(md`**Predict.** The conflict exam's version: $\mathbf A = -\hat y\,|z|$ Wb/m. For $z > 0$, $\mathbf B = $`,
        ['$+\\hat x$ T', '$-\\hat x$ T', '$-\\hat y$ T', '$+\\hat z$ T'], 0,
        [null, 'Sign: $(\\nabla\\times\\mathbf A)_x = \\partial_yA_z - \\partial_zA_y$, and $-\\partial_z(-|z|) = +1$ for $z > 0$.', '$\\mathbf B$ is perpendicular to this $\\mathbf A$, not along it.', '$A_y$ depends on $z$ alone, so $B_z = \\partial_xA_y - \\partial_yA_x = 0$.'],
        md`$B_x = -\partial_zA_y = \partial_z|z| = \operatorname{sgn}(z)$: $+\hat x$ above, $-\hat x$ below. The jump $2/\mu_0$ in $H_x$ is a sheet $\mathbf J_s = \hat z\times\frac{2}{\mu_0}\hat x = +\frac{2}{\mu_0}\hat y$ A/m.`),
      RF(md`
        ### The method

        !!method Flux, Gauss's law for B, and A
          1. **Flux:** fix $d\mathbf S$ (RHR from $C$). Uniform $\mathbf B$: $\Psi = (\mathbf B\cdot\hat n)A$. Otherwise cut $S$ into strips where $\mathbf B$ is constant and integrate.
          2. **Awkward surface:** close it with flat pieces, all normals outward; $\Psi_{\text{awkward}} = -\sum\Psi_{\text{flat}}$. Switch to the $d\mathbf S$ the problem asks for at the end.
          3. **Is it a B field?** Compute $\nabla\cdot\mathbf B$. Zero everywhere: yes. Anything else: no.
          4. **From A:** $\mathbf B = \nabla\times\mathbf A$, all three components. Then $\mathbf H = \mathbf B/\mu_0$ and $\mathbf J = \nabla\times\mathbf H$; a jump in tangential $\mathbf H$ is a sheet, $\mathbf J_s = \hat n\times(\mathbf H^+ - \mathbf H^-)$.
          5. **Potentials to E:** $\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t$. **Flux from A:** $\Psi = \oint_C\mathbf A\cdot d\mathbf l$.
          6. **Check:** units ($\mathbf A$ in Wb/m), $\nabla\cdot\mathbf B = 0$ for the $\mathbf B$ you found, and directions by the RHR.

        ### Worked example

        !!graded Problem
          The vector potential in free space is $\mathbf A = A_x(z)\,\hat x$, with $A_x = 0.1z^2$ Wb/m for $|z| \le 0.1$ m and $A_x = 0.02|z| - 0.001$ Wb/m for $|z| \ge 0.1$ m ($z$ in m). (a) Show that $\nabla\cdot\mathbf A = 0$. (b) Find $\mathbf B$ everywhere. (c) Find the current density $\mathbf J$ that produces it. (d) Find the flux through the rectangle $0 \le x \le 1$ m, $0 \le z \le 0.1$ m in the plane $y = 0$, with $d\mathbf S = +\hat y$, both as $\int\mathbf B\cdot d\mathbf S$ and as $\oint\mathbf A\cdot d\mathbf l$.

        **1. Divergence.** $\nabla\cdot\mathbf A = \partial_xA_x = 0$: $A_x$ depends on $z$ only.

        **2. B.** In the curl only $\partial_zA_x$ survives, so $\mathbf B = \hat y\,dA_x/dz$:
        $$\mathbf B = 0.2z\,\hat y\ \text{T}\ \ (|z| \le 0.1\ \text{m}), \qquad \mathbf B = \pm0.02\,\hat y\ \text{T}\ \ (z \gtrless \pm0.1\ \text{m})$$
        It is continuous at $z = \pm0.1$ m ($0.2\times0.1 = 0.02$), so there is no sheet there.

        [[fig:by]]

        **3. J.** $\mathbf H = \mathbf B/\mu_0$, and $\mathbf J = \nabla\times\mathbf H = -\hat x\,\frac{1}{\mu_0}\frac{dB_y}{dz}$:
        $$\mathbf J = -\frac{0.2\ \text{T/m}}{4\pi\times10^{-7}\ \text{H/m}}\,\hat x = -1.59\times10^5\,\hat x\ \text{A/m}^2\ \ (|z| < 0.1\ \text{m}), \qquad \mathbf J = 0\ \ (|z| > 0.1\ \text{m})$$
        A slab of uniform current. Units: (T/m)/(H/m) = T/H = (Wb/m²)/(Wb/A) = A/m² ✓.

        **4. Flux from B.**
        $$\Psi = \int_0^{1}\!\!\int_0^{0.1}0.2z\,dz\,dx = (1\ \text{m})(0.2\ \text{T/m})\frac{(0.1\ \text{m})^2}{2} = 1.0\times10^{-3}\ \text{Wb}$$

        **5. Flux from A.** With $d\mathbf S = +\hat y$, the RHR runs $C$ along $+\hat x$ on the top edge ($z = 0.1$ m) and along $-\hat x$ on the bottom edge ($z = 0$); on the two vertical edges $d\mathbf l \perp \mathbf A$:
        $$\oint_C\mathbf A\cdot d\mathbf l = A_x(0.1)(1\ \text{m}) - A_x(0)(1\ \text{m}) = (0.001\ \text{Wb/m})(1\ \text{m}) - 0 = 1.0\times10^{-3}\ \text{Wb}\ ✓$$

        **Check.** The formula sheet's slab: $\mathbf J = J\hat x$ gives $\mathbf B = -\hat y\mu_0Jz$ inside; with $J = -0.2/\mu_0$ that is $+0.2z\,\hat y$ ✓. RHR: the current runs along $-\hat x$, so above it $\mathbf B$ points along $+\hat y$ ✓. And $\nabla\cdot\mathbf B = \partial_yB_y = 0$ ✓.

        !!mistake Common mistakes
          - Using the curved area for a uniform field. A dome of radius $R$ has area $2\pi R^2$, but its flux is $B_z\pi R^2$: only the projection counts.
          - Mixing normals when closing a surface. Use outward normals for $\oint = 0$, then convert to the $d\mathbf S$ the problem asks for.
          - Testing a B field with its curl. $\nabla\times\mathbf B \ne 0$ only means current is present; the test is $\nabla\cdot\mathbf B = 0$.
          - Curl sign slips: $(\nabla\times\mathbf A)_y = \partial_zA_x - \partial_xA_z$ (cyclic order $x \to y \to z$). Write all three components.
          - Differentiating $|z|$ as if it were $z$. $d|z|/dz = \operatorname{sgn}(z)$, and the derivative of $\operatorname{sgn}(z)$ is $2\delta(z)$: a current sheet.
          - Taking $\mathbf E = -\nabla\Phi$ when $\mathbf A$ depends on time. The $-\partial\mathbf A/\partial t$ term can cancel it (Spring 2018 1(v)).
          - Giving $\mathbf A$ in tesla. It is Wb/m (V·s/m): the curl adds a 1/m.

        ### Check questions
      `, { by: { svg: byPlot(), cap: 'B_y(z): linear inside the slab |z| < 0.1 m, constant outside. No jump, so no sheet current.' } }),
      Q(md`The scalar and vector potentials are $\Phi = 3x^2$ V and $\mathbf A = -6xt\,\hat x + 3y\,\hat y$ V·s/m. Then the electric field and the magnetic flux density…`,
        ['are both zero everywhere, for all time', '$\\mathbf E$ is constant in time but varies with position; $\\mathbf B$ is constant in position but varies with time', '$\\mathbf E$ and $\\mathbf B$ are both constant in time but vary with position', '$\\mathbf E$ and $\\mathbf B$ are both uniform but vary with time'], 0,
        [null, 'That takes $-\\nabla\\Phi = -6x\\,\\hat x$ as all of $\\mathbf E$. The term $-\\partial\\mathbf A/\\partial t = +6x\\,\\hat x$ cancels it; and the $t$ in $A_x$ never reaches $\\mathbf B$.', 'Every derivative in the curl ($\\partial_yA_x$, $\\partial_zA_x$, $\\partial_xA_y$, $\\partial_zA_y$) is zero, and $\\mathbf E$ cancels to zero.', '$-\\partial\\mathbf A/\\partial t = 6x\\,\\hat x$ has no time left in it, and it cancels $-\\nabla\\Phi$.'],
        md`$\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t = -6x\,\hat x - (-6x\,\hat x) = 0$. $A_x = -6xt$ varies only along $x$ and $A_y = 3y$ only along $y$, so $\nabla\times\mathbf A = 0$: choice (a) on the exam. These potentials are pure gauge: $\mathbf A = \nabla\lambda$, $\Phi = -\partial\lambda/\partial t$ with $\lambda = -3x^2t + \tfrac32y^2$.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`$\mathbf A = -\hat y\,|z|$ Wb/m in free space. The current density that produces its $\mathbf B$ is…`,
        ['$\\mathbf J = +\\hat y\\,\\dfrac{2}{\\mu_0}\\delta(z)$ A/m²: a sheet on $z = 0$', '$\\mathbf J = -\\hat y\\,\\dfrac{2}{\\mu_0}\\delta(z)$ A/m²', '$\\mathbf J = +\\hat y\\,\\dfrac{1}{\\mu_0}\\delta(z)$ A/m²', '$\\mathbf J = 0$ everywhere: $\\mathbf B$ is constant on each side'], 0,
        [null, 'Sign: $\\mathbf B = \\hat x\\operatorname{sgn}(z)$, and $(\\nabla\\times\\mathbf H)_y = \\partial_zH_x = +2\\delta(z)/\\mu_0$.', '$H_x$ jumps from $-1/\\mu_0$ to $+1/\\mu_0$: by $2/\\mu_0$, not $1/\\mu_0$.', 'Constant on each side, but it jumps at $z = 0$. A jump in tangential $\\mathbf H$ is a surface current.'],
        md`$\mathbf B = \nabla\times\mathbf A = \hat x\operatorname{sgn}(z)$ T. $\mathbf J = \nabla\times(\mathbf B/\mu_0) = \hat y\,\partial_z(\operatorname{sgn}z)/\mu_0 = \hat y\frac{2}{\mu_0}\delta(z)$, i.e. $\mathbf J_s = \frac{2}{\mu_0}\hat y$ A/m on $z = 0$. Same from $\hat n\times(\mathbf H^+ - \mathbf H^-) = \hat z\times\frac{2}{\mu_0}\hat x$.`, { src: 'Summer 2019 Exam 2 (conflict)' }),
      Q(md`The SI unit of the vector potential $\mathbf A$ is…`,
        ['Wb/m', 'T', 'Wb', 'A/m'], 0,
        [null, '$\\mathbf B = \\nabla\\times\\mathbf A$ has one more 1/m than $\\mathbf A$, so $\\mathbf A$ is T·m = Wb/m.', 'That is the flux $\\oint\\mathbf A\\cdot d\\mathbf l$: $\\mathbf A$ times a length.', 'That is $\\mathbf H$ (and $\\mathbf J_s$).'],
        md`$\Psi = \oint\mathbf A\cdot d\mathbf l$ is in Wb, so $\mathbf A$ is Wb/m = V·s/m. Check against $\mathbf E = -\partial\mathbf A/\partial t$: (V·s/m)/s = V/m ✓.`),
      Q(md`Outside a long solenoid $\mathbf B = 0$, yet $\mathbf A = A_\phi(r)\hat\phi \ne 0$ there. If the solenoid carries flux $\Psi_0$, then at a radius $r$ outside it $A_\phi = $`,
        ['$\\Psi_0/2\\pi r$', '$0$, since $\\mathbf B = 0$ there', '$\\Psi_0$', '$\\Psi_0/\\pi r^2$'], 0,
        [null, '$\\mathbf B = 0$ outside does not make $\\mathbf A$ zero: its circulation around any loop that encloses the solenoid is $\\Psi_0$.', 'That is the loop integral $\\oint\\mathbf A\\cdot d\\mathbf l$; divide by the circumference $2\\pi r$.', 'That is an average flux density, a $B$, not an $A$.'],
        md`$\oint\mathbf A\cdot d\mathbf l = A_\phi\,2\pi r = \Psi_0$. Its curl, $\frac1r\partial_r(rA_\phi)$, is zero outside, as it must be.`),
      Q(md`For the same uniform $\mathbf B$, one student finds $\mathbf A_1 = -B_0y\,\hat x$ and another $\mathbf A_2 = B_0x\,\hat y$. Which is right?`,
        ['both: each gives $\\mathbf B = B_0\\hat z$', 'only $\\mathbf A_1$', 'only $\\mathbf A_2$', 'neither: $\\mathbf A$ must be unique'], 0,
        [null, '$(\\nabla\\times\\mathbf A_2)_z = \\partial_xA_y = B_0$ as well.', '$(\\nabla\\times\\mathbf A_1)_z = -\\partial_yA_x = B_0$ as well.', '$\\mathbf A$ is fixed only up to a gradient: $\\mathbf A_2 - \\mathbf A_1 = \\nabla(B_0xy)$.'],
        md`Both curls are $B_0\hat z$. Potentials that differ by a gradient describe the same field.`),
      R(md`
        ### Rapid fire: curls and potentials

        **The trick:** for $\mathbf A = A_i(x_j)\,\hat x_i$ the curl points along the third axis, sign by the cyclic order; $\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t$; $\Psi = \oint\mathbf A\cdot d\mathbf l$.
      `),
      Object.assign(G('rf_t7_curl', { need: 8 }), { id: 't7-flux.r2' }),
      R(md`
        ### Problems with new numbers every time
      `),
      G('t7_sheetA', { need: 2 }),
      G('t7_potentials', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const NZ = [-3, -2, -1, 1, 2, 3];
  GENS.rf_t7_div = () => one([
    // B0(ax x̂ + by ŷ + cz ẑ)/ℓ: divergence a + b + c
    () => {
      const a = pick(NZ), b = pick(NZ), zero = pick([true, false]);
      const c = zero ? -(a + b) : pick(NZ.filter((v) => v !== -(a + b)));
      const d = a + b + c, sizes = Math.abs(a) + Math.abs(b) + Math.abs(c);
      const sum = `${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)} ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
      const Bt = lin([[a, md`x\,\hat x`], [b, md`y\,\hat y`], [c, md`z\,\hat z`]]);
      const no = (k) => md`No: $\nabla\cdot\mathbf B = ${cf(k)}B_0/\ell$`;
      const yes = md`Yes: $\nabla\cdot\mathbf B = 0$`;
      const wr = d === 0
        ? [[no(sizes), 'That adds the sizes of the coefficients. With their signs they sum to zero.'], ['No: its curl is not zero', 'Its curl is zero anyway, and a nonzero curl would only mean currents. The test is the divergence.'], [md`Only at the origin`, md`$\nabla\cdot\mathbf B = (${sum})B_0/\ell$ is the same at every point: zero.`]]
        : [[yes, md`$\partial_xB_x + \partial_yB_y + \partial_zB_z = (${sum})B_0/\ell \ne 0$.`], ['Yes: its curl is zero', 'Zero curl is the test for an electrostatic field. A B field needs zero divergence.'], [no(-d), 'Sign slip: add the three coefficients as they stand.'], [no(sizes), 'That adds the sizes; keep the signs.']];
      return MC('Divergence test', md`Can $\mathbf B = \dfrac{B_0}{\ell}\left(${Bt}\right)$ be a magnetic flux density?`, d === 0 ? yes : no(d), wr,
        md`$\nabla\cdot\mathbf B = (${sum})B_0/\ell = ${d === 0 ? '0' : `${cf(d)}B_0/\\ell`}$.${d === 0 ? ' Every line that enters a small box leaves it: a possible B.' : ' Lines would start or end at every point: that needs magnetic charge.'}`);
    },
    // fields with cross-dependence
    () => {
      const [B, div, ok] = pick([
        [md`B_0(y\,\hat x + z\,\hat y + x\,\hat z)/\ell`, md`0 + 0 + 0 = 0`, true],
        [md`B_0(yz\,\hat x + xz\,\hat y + xy\,\hat z)/\ell^2`, md`0 + 0 + 0 = 0`, true],
        [md`B_0(y^2\,\hat x - x^2\,\hat y)/\ell^2`, md`0 + 0 = 0`, true],
        [md`B_0(xy\,\hat x - \tfrac12y^2\,\hat y)/\ell^2`, md`(y - y)B_0/\ell^2 = 0`, true],
        [md`B_0\sin(kx)\,\hat y`, md`\partial_y[B_0\sin(kx)] = 0`, true],
        [md`B_0e^{-z/\ell}\,\hat x`, md`\partial_x[B_0e^{-z/\ell}] = 0`, true],
        [md`B_0(z\,\hat x + x\,\hat z)/\ell`, md`0 + 0 = 0`, true],
        [md`B_0(x^2\,\hat x + y^2\,\hat y)/\ell^2`, md`2B_0(x + y)/\ell^2`, false],
        [md`B_0xy(\hat x + \hat y)/\ell^2`, md`B_0(y + x)/\ell^2`, false],
        [md`B_0\sin(ky)\,\hat y`, md`kB_0\cos(ky)`, false],
        [md`B_0e^{-z/\ell}\,\hat z`, md`-B_0e^{-z/\ell}/\ell`, false],
        [md`B_0(y\,\hat x + y\,\hat y)/\ell`, md`B_0/\ell`, false],
      ]);
      const wr = ok
        ? [['No', md`$\nabla\cdot\mathbf B = ${div}$ everywhere.`], ['Only where no current flows', 'Gauss\'s law for B holds everywhere, with or without currents, and this field passes it.'], ['Only if its curl is zero as well', 'A nonzero curl only says currents flow there ($\\nabla\\times\\mathbf H = \\mathbf J$). The B test is the divergence.']]
        : [['Yes', md`$\nabla\cdot\mathbf B = ${div} \ne 0$.`], ['Yes, where currents flow', 'Currents set the curl of $\\mathbf H$, not the divergence of $\\mathbf B$; $\\nabla\\cdot\\mathbf B = 0$ everywhere.'], ['Only if its curl is zero as well', 'Nothing rescues a nonzero divergence.']];
      return MC('Divergence test', md`Can $\mathbf B = ${B}$ be a magnetic flux density? ($B_0$, $k$, $\ell$ constants.)`, ok ? 'Yes' : 'No', wr,
        md`$\nabla\cdot\mathbf B = ${div}$. ${ok ? 'Each component is free of its own coordinate (or the changes cancel): a possible B.' : 'Some component grows along its own direction with nothing to compensate.'}`);
    },
    // find k
    () => {
      let a = pick([-4, -3, -2, -1, 1, 2, 3, 4]), b = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      if (a + b === 0) b = b > 0 ? b + 1 : b - 1;
      const k = -(a + b), sz = Math.abs(a) + Math.abs(b);
      const Bt = lin([[a, md`y\,\hat y`], [b, md`z\,\hat z`]]);
      return MC('Find k', md`For which $k$ is $\mathbf B = \dfrac{B_0}{\ell}\left(kx\,\hat x ${Bt.startsWith('-') ? '' : '+ '}${Bt}\right)$ a possible magnetic field?`, md`$k = ${k}$`,
        [[md`$k = ${-k}$`, md`Sign: $k + ${par(a)} + ${par(b)} = 0$.`], [md`$k = ${-sz}$`, 'That adds the sizes of the other coefficients, ignoring a sign.'], [md`$k = ${sz}$`, 'That adds the sizes, and flips the sign.'], ['$k = 0$', md`Then $\nabla\cdot\mathbf B = ${cf(a + b)}B_0/\ell \ne 0$.`], ['any $k$', '$\\partial_x(kx) = k$ enters the divergence.']],
        md`$\nabla\cdot\mathbf B = (k + ${par(a)} + ${par(b)})B_0/\ell = 0$, so $k = ${k}$.`);
    },
    // closed surfaces: always zero
    () => {
      const sit = pick([
        'a sphere around the north end of a bar magnet',
        'a cube around one end of a long current-carrying solenoid',
        'a closed box in a field that grows at 5 T/s',
        'a sphere pierced by a long straight wire carrying 10 A',
        'a closed surface around a piece of iron in a strong magnet',
        'a closed cylinder around a toroid',
      ]);
      return MC('Closed surface', md`The net **outward** flux of $\mathbf B$ through ${sit} is…`, 'zero',
        [['positive', 'There is no magnetic charge inside to send out net flux; every line that leaves comes back in.'], ['negative', 'There is no magnetic charge inside to swallow net flux.'], ['it depends on how strong the field is', '$\\oint\\mathbf B\\cdot d\\mathbf S = 0$ for every field, strong or weak, static or changing.'], ['the emf around the surface', 'A closed surface has no rim, so there is no path for an emf.']],
        md`$\oint_S\mathbf B\cdot d\mathbf S = 0$ for every closed surface, always: field lines have no ends.`);
    },
  ]);

  GENS.rf_t7_close = () => one([
    // dome, cone, bowl, open can in a uniform field
    () => {
      const bx = pick(NZ), by = pick([0, -2, 1, 2]), bz = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      const [what, sg] = pick([
        ['a hemispherical dome of radius $R$ standing on the $xy$-plane ($z \\ge 0$, no floor)', 1],
        ['a cone (no base) whose circular rim of radius $R$ lies on the $xy$-plane, apex on the $+z$-axis', 1],
        ['a hemispherical bowl of radius $R$ hanging below the $xy$-plane ($z \\le 0$)', -1],
        ['an open-top can: the side and bottom of a cylinder of radius $R$ standing on the $xy$-plane', -1],
      ]);
      const k = sg * bz;          // flux out through the curved part, in units of πR²B0
      const o = (c) => (c === 0 ? '$0$' : md`$${cf(c)}\pi R^2B_0$`);
      const Bt = lin([[bx, md`\hat x`], [by, md`\hat y`], [bz, md`\hat z`]]);
      return MC('Close it', md`In a uniform $\mathbf B = B_0(${Bt})$, the flux **out** through ${what} is…`, o(k),
        [[o(-k), 'That is the outward flux of the flat disk that closes it. The two must add to zero.'], [o(2 * k), 'That doubles the area, as a hemisphere\'s curved area $2\\pi R^2$ would. For a uniform field only the projected area $\\pi R^2$ counts.'], [o(0), 'Zero is the total for the closed surface. The open part carries the disk\'s flux, reversed.'], [o(sg * bx), '$B_x$ enters one side and leaves the other. Only the component normal to the rim\'s disk survives.']],
        md`Close it with the flat disk at the rim (outward normal ${sg > 0 ? '$-\\hat z$' : '$+\\hat z$'}): $\Psi_{\text{disk}} = ${cf(-k)}\pi R^2B_0$, so the curved part carries $${cf(k)}\pi R^2B_0$ out.`);
    },
    // half-cylinder roof
    () => {
      const ax = pick([0, 1]), bAx = pick(NZ), bT = pick([0, 1, -2]), bz = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      const v = ax === 0 ? [bAx, bT, bz] : [bT, bAx, bz];
      const o = (c) => (c === 0 ? '$0$' : md`$${cf(c)}R\ell B_0$`);
      const oP = (c) => md`$${cf(c)}\pi R\ell B_0$`;
      const Bt = lin([[v[0], md`\hat x`], [v[1], md`\hat y`], [v[2], md`\hat z`]]);
      return MC('Half-cylinder roof', md`A half-cylinder roof (radius $R$, length $\ell$, axis along $${AX[ax]}$, no floor or ends) stands on the $xy$-plane in a uniform $\mathbf B = B_0(${Bt})$. The flux out through the curved roof is…`, o(2 * bz),
        [[o(-2 * bz), 'That is the floor\'s outward flux. Roof, floor and ends add to zero.'], [oP(bz), 'That uses the curved area $\\pi R\\ell$; only the floor\'s area $2R\\ell$ counts.'], [o(2 * bAx), md`$B_${AX[ax]}$ runs along the axis: it enters one end and leaves the other.`], [o(0), 'Only the axial and sideways parts cancel; $B_z$ crosses the roof.']],
        md`Floor: $(-B_z)(2R\ell) = ${cf(-2 * bz)}R\ell B_0$; the two ends cancel. So the roof carries $${cf(2 * bz)}R\ell B_0$ out.`);
    },
    // closed-surface bookkeeping
    () => {
      const [shape, n, word] = pick([['closed cube', 6, 'faces'], ['tetrahedron', 4, 'faces'], ['closed can', 3, 'pieces (top, bottom, side)']]);
      const vals = Array.from({ length: n - 1 }, () => pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]));
      const s = vals.reduce((a, b) => a + b, 0), sa = vals.reduce((a, b) => a + Math.abs(b), 0);
      const o = (x) => md`$${x}$ mWb`;
      return MC('Bookkeeping', md`A ${shape} sits in a static, nonuniform $\mathbf B$. The outward fluxes through ${n - 1} of its ${word} are ${vals.map((v) => `$${v}$`).join(', ')} mWb. The outward flux through the last one is…`, o(-s),
        [[o(s), 'Sign: the outward fluxes of all the pieces add to zero.'], [o(0), s === 0 ? 'The others add to zero, so this one is zero too.' : 'Only the total is zero, not each piece.'], [o(-sa), 'That adds sizes; keep each flux\'s sign.'], [o(sa), 'That adds sizes; keep each flux\'s sign.']],
        md`$${vals.join(' + ').replace(/\+ -/g, '- ')} + \Psi = 0$, so $\Psi = ${-s}$ mWb.`);
    },
    // same rim
    () => {
      const sh = pick(['a hemispherical bowl', 'a tall cone', 'a crumpled, balloon-like surface', 'a deep cylindrical cup']);
      const v = pick([-8, -5, -3, 2, 4, 7, 12]);
      return MC('Same rim', md`A flat disk $S_1$ and ${sh} $S_2$ share the same rim $C$; both are oriented by the RHR from $C$. In a static, nonuniform $\mathbf B$, $\Psi_1 = ${v}$ mWb. $\Psi_2 = $`, md`$${v}$ mWb`,
        [[md`$${-v}$ mWb`, 'The sign flips only if $S_2$ is oriented outward from the volume between them. Here both follow the RHR from the same $C$.'], [md`$${2 * v}$ mWb`, 'More area lets more lines in and out; the net through it is set by the rim.'], ['$0$', 'Zero is the net out of the closed surface the two form (with one flipped).']],
        md`$\Psi_2 - \Psi_1 = \oint\mathbf B\cdot d\mathbf S = 0$ over the closed surface they make with $S_1$ flipped: same rim, same flux.`);
    },
  ]);

  GENS.rf_t7_curl = () => one([
    // A = k x_j x̂_i: B along the third axis, or zero if j = i
    () => {
      const i = ri(0, 2), own = pick([false, false, false, true]);
      const j = own ? i : pick([0, 1, 2].filter((v) => v !== i)), k = pick([-4, -3, -2, 2, 3, 5]);
      const At = md`\mathbf A = ${k}${AX[j]}\,\hat ${AX[i]}`;
      if (own) {
        const o1 = (i + 1) % 3, o2 = (i + 2) % 3;
        return MC('Curl', md`$${At}$ Wb/m ($${AX[j]}$ in m). $\mathbf B = $`, '$0$',
          [[md`$${k}\,\hat ${AX[i]}$ T`, md`$A_${AX[i]}$ varies only along its own direction; every derivative in the curl is zero.`], [md`$${k}\,\hat ${AX[o1]}$ T`, md`The curl needs $A_${AX[i]}$ to vary across $\hat ${AX[i]}$, along $${AX[o1]}$ or $${AX[o2]}$. It does not.`], [md`$${-k}\,\hat ${AX[o2]}$ T`, md`The curl needs $A_${AX[i]}$ to vary across $\hat ${AX[i]}$. It does not.`]],
          md`This $\mathbf A$ is a gradient, $\nabla(${k}${AX[i]}^2/2)$, and the curl of a gradient is zero.`);
      }
      const m = 3 - i - j, Bm = eps(m, j) * k;
      return MC('Curl', md`$${At}$ Wb/m ($${AX[j]}$ in m). $\mathbf B = $`, md`$${Bm}\,\hat ${AX[m]}$ T`,
        [[md`$${-Bm}\,\hat ${AX[m]}$ T`, md`Sign: $(\nabla\times\mathbf A)_${AX[m]} = ${CURL[m]}$.`], [md`$${k}\,\hat ${AX[i]}$ T`, 'This curl is perpendicular to $\\mathbf A$, not along it.'], [md`$${k}\,\hat ${AX[j]}$ T`, md`$\mathbf A$ varies along $${AX[j]}$, but the curl points along the third axis, $${AX[m]}$.`], ['$0$', md`$A_${AX[i]}$ varies across its own direction, so it has a curl.`]],
        md`$(\nabla\times\mathbf A)_${AX[m]} = ${CURL[m]}$; only $\partial_${AX[j]}A_${AX[i]} = ${k}$ is nonzero, so $B_${AX[m]} = ${Bm}$ T.`);
    },
    // A = s|x_j| x̂_i: B on one side
    () => {
      const i = ri(0, 2), j = pick([0, 1, 2].filter((v) => v !== i)), m = 3 - i - j, s = pick([1, -1]), side = pick([1, -1]);
      const Bm = eps(m, j) * s * side;
      const o = (sg, a) => md`$${sg > 0 ? '+' : '-'}\hat ${AX[a]}$ T`;
      return MC('Curl with a kink', md`$\mathbf A = ${s > 0 ? '' : '-'}\hat ${AX[i]}\,|${AX[j]}|$ Wb/m. For $${AX[j]} ${side > 0 ? '>' : '<'} 0$, $\mathbf B = $`, o(Bm, m),
        [[o(-Bm, m), md`Sign: $(\nabla\times\mathbf A)_${AX[m]} = ${CURL[m]}$, and $\partial_${AX[j]}|${AX[j]}| = ${side > 0 ? '+1' : '-1'}$ here.`], [o(s, i), 'This curl is perpendicular to $\\mathbf A$.'], [o(side, j), md`The derivative is along $${AX[j]}$, but the curl points along $${AX[m]}$.`], ['$0$', 'Each side has a constant slope, so a constant, nonzero curl.']],
        md`Here $\partial_${AX[j]}A_${AX[i]} = ${s * side > 0 ? '+1' : '-1'}$ T and $B_${AX[m]} = ${eps(m, j) > 0 ? '+' : '-'}\partial_${AX[j]}A_${AX[i]}$, so $\mathbf B = ${Bm > 0 ? '+' : '-'}\hat ${AX[m]}$ T. It flips across $${AX[j]} = 0$: a current sheet there.`);
    },
    // E from Φ and A
    () => {
      const a = ri(0, 2), pp = pick([-4, -3, -2, 2, 3, 5]), q = pick([-3, -2, -1, 1, 2, 4]);
      const E = -(pp + q);
      const o = (x) => (x === 0 ? '$\\mathbf E = 0$' : md`$${x}\,\hat ${AX[a]}$ V/m`);
      return MC('E from potentials', md`$\Phi = ${pp}${AX[a]}$ V and $\mathbf A = ${cf(q)}t\,\hat ${AX[a]}$ V·s/m ($${AX[a]}$ in m, $t$ in s). $\mathbf E = $`, o(E),
        [[o(-pp + q), 'Sign: $\\mathbf E = -\\nabla\\Phi - \\partial\\mathbf A/\\partial t$; both terms carry a minus.'], [o(-pp), 'That drops $-\\partial\\mathbf A/\\partial t$; $\\mathbf A$ changes in time.'], [o(pp + q), 'Both signs flipped: $\\mathbf E$ points down the potential.'], [o(-q), 'That drops $-\\nabla\\Phi$.']],
        md`$-\nabla\Phi = ${-pp}\,\hat ${AX[a]}$ and $-\partial\mathbf A/\partial t = ${-q}\,\hat ${AX[a]}$ V/m; together $${E === 0 ? '\\mathbf E = 0' : `${E}\\,\\hat ${AX[a]}`}$${E === 0 ? ': the two cancel, like Spring 2018 1(v).' : ' V/m.'} $\mathbf A$ is uniform in space, so $\mathbf B = 0$.`);
    },
    // flux from A around a circle
    () => {
      const r = pick([0.1, 0.2, 0.5, 1]), Ap = pick([1, 2, 4, 5, 10]);
      const v = 2 * Math.PI * r * Ap;
      const o = (x) => md`$${EM.p(+x.toPrecision(3))}$ mWb`;
      return MC('Flux from A', md`On a circle of radius $${r}$ m centered on the axis of a long solenoid, $\mathbf A = ${Ap}\,\hat\phi$ mWb/m. The flux through the circle is…`, o(v),
        [[o(Math.PI * r * r * Ap), 'That multiplies by the area. $\\mathbf A$ is integrated along the loop: times $2\\pi r$.'], [o(Ap / (2 * Math.PI * r)), 'Multiply by the circumference, do not divide.'], [o(r * Ap), 'The circumference is $2\\pi r$, not $r$.'], [o(Math.PI * r * Ap), 'The circumference is $2\\pi r$, not $\\pi r$.']],
        md`$\Psi = \oint\mathbf A\cdot d\mathbf l = A_\phi\,2\pi r = (${Ap})(2\pi)(${r}) = ${EM.p(+v.toPrecision(3))}$ mWb.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // Spring 2018 #2: flux through one turn of a toroid of rectangular cross-section
  GENS.t7_toroid = () => {
    const Nt = pick([100, 200, 250, 500, 1000]), I = pick([0.5, 1, 2, 4, 5]), a = pick([2, 3, 4, 5]), w = pick([1, 2, 3, 5]), h = pick([1, 1.5, 2, 3]), rate = pick([10, 50, 100, 500, 1000]);
    const b = a + w, lnr = Math.log(b / a);
    const psi1 = EM.mu0 * Nt * I * (h / 100) * lnr / (2 * Math.PI);
    const link = Nt * psi1;
    const emf = Nt * (EM.mu0 * Nt * (h / 100) * lnr / (2 * Math.PI)) * rate;
    return {
      title: 'Flux through one turn of a toroid',
      q: md`A toroid of rectangular cross-section has $N = ${Nt}$ turns, inner radius $a = ${a}$ cm, outer radius $b = ${b}$ cm and height $h = ${h}$ cm. Its current $I = ${I}$ A makes $\mathbf B = \hat\phi\,\mu_0NI/2\pi r$ inside the core. Find the flux through one turn, the flux linkage $N\Psi_1$, and the size of the coil's emf while $I$ grows at $${rate}$ A/s.

        [[fig:tor]]`,
      figs: { tor: { svg: torFig(), cap: 'One turn in cross-section: B into the page, falling as 1/r.' } },
      parts: [N('\\Psi_1', psi1, 'Wb'), N('N\\Psi_1', link, 'Wb'), N('|\\mathcal E|', emf, 'V')],
      hints: ['$\\mathbf B$ crosses the turn\'s rectangle head-on but depends on $r$: use strips of area $h\\,dr$.', '$\\Psi_1 = \\dfrac{\\mu_0NIh}{2\\pi}\\ln\\dfrac ba$; every turn links the same flux, and $|\\emf| = N\\,d\\Psi_1/dt$.'],
      sol: sol({
        eq: md`$\Psi_1 = \int_S\mathbf B\cdot d\mathbf S$ over one turn, $\;|\emf| = N\,d\Psi_1/dt$.`,
        sym: md`$$\Psi_1 = \int_a^b\frac{\mu_0NI}{2\pi r}\,h\,dr = \frac{\mu_0NIh}{2\pi}\ln\frac ba, \qquad |\emf| = \frac{\mu_0N^2h}{2\pi}\ln\frac ba\,\frac{dI}{dt}$$`,
        sub: md`$$\Psi_1 = \frac{(4\pi\times10^{-7})(${Nt})(${I})(${h / 100}\ \text{m})}{2\pi}\ln\frac{${b}}{${a}} = ${f(psi1)}\ \text{Wb}, \qquad N\Psi_1 = ${f(link)}\ \text{Wb}$$
        $$|\emf| = N\frac{\Psi_1}{I}\frac{dI}{dt} = (${Nt})\frac{${f(psi1)}\ \text{Wb}}{${I}\ \text{A}}(${rate}\ \text{A/s}) = ${f(emf)}\ \text{V}$$`,
        ans: md`$\Psi_1 = ${f(psi1)}$ Wb, $N\Psi_1 = ${f(link)}$ Wb, $|\emf| = ${f(emf)}$ V.`,
        check: md`Only the ratio $b/a$ enters: scaling both radii together changes nothing. $N\Psi_1/I = ${f(link / I)}$ H is the toroid's inductance (Topic 11).`,
      }),
    };
  };

  // the closing trick: an awkward surface in a uniform field
  GENS.t7_close = () => {
    const bx = pick(NZ), by = pick([-2, -1, 0, 1, 2]), bz = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    const Rcm = pick([5, 10, 20]), Lcm = pick([20, 50, 100]);
    const Rm = Rcm / 100, Lm = Lcm / 100, Bz = bz * 1e-3;
    const shp = pick(['dome', 'cone', 'bowl', 'can', 'tunx', 'tuny']);
    const disk = { area: Math.PI * Rm * Rm, aTex: md`\pi R^2`, aNum: md`\pi(${Rm}\ \text{m})^2` };
    const roof = { area: 2 * Rm * Lm, aTex: md`2R\ell`, aNum: md`2(${Rm}\ \text{m})(${Lm}\ \text{m})` };
    const S = {
      dome: Object.assign({ what: md`a hemispherical dome of radius $R = ${Rcm}$ cm standing on the $xy$-plane ($z \ge 0$), without its floor`, flat: md`the floor disk on $z = 0$ (outward normal $-\hat z$)`, sg: -1 }, disk),
      cone: Object.assign({ what: md`a cone surface (no base) whose circular rim of radius $R = ${Rcm}$ cm lies on the $xy$-plane and whose apex is on the $+z$-axis`, flat: md`the base disk on $z = 0$ (outward normal $-\hat z$)`, sg: -1 }, disk),
      bowl: Object.assign({ what: md`a hemispherical bowl of radius $R = ${Rcm}$ cm hanging below the $xy$-plane ($z \le 0$)`, flat: md`the lid disk on $z = 0$ (outward normal $+\hat z$)`, sg: 1 }, disk),
      can: Object.assign({ what: md`an open-top can, the side and bottom of a cylinder of radius $R = ${Rcm}$ cm and height $${Lcm}$ cm standing on the $xy$-plane`, flat: md`the lid disk at the top (outward normal $+\hat z$)`, sg: 1 }, disk),
      tunx: Object.assign({ what: md`the curved roof of a half-cylinder of radius $R = ${Rcm}$ cm and length $\ell = ${Lcm}$ cm, axis along $x$, standing on the $xy$-plane`, flat: md`the floor on $z = 0$ (area $2R\ell$, outward normal $-\hat z$) and the two half-disk ends`, sg: -1, ends: 'x' }, roof),
      tuny: Object.assign({ what: md`the curved roof of a half-cylinder of radius $R = ${Rcm}$ cm and length $\ell = ${Lcm}$ cm, axis along $y$, standing on the $xy$-plane`, flat: md`the floor on $z = 0$ (area $2R\ell$, outward normal $-\hat z$) and the two half-disk ends`, sg: -1, ends: 'y' }, roof),
    }[shp];
    const psiFlat = S.sg * Bz * S.area, psiSurf = -psiFlat;
    const Bt = lin([[bx, md`\hat x`], [by, md`\hat y`], [bz, md`\hat z`]]);
    return {
      title: 'Flux through an awkward surface',
      q: md`A uniform field $\mathbf B = (${Bt})$ mT fills space. The surface is ${S.what}. Close it with ${S.flat}. Find the outward flux through the flat closing piece${S.ends ? 's, taken together' : ''}, then the flux out through the curved surface (normal pointing away from the enclosed volume).`,
      parts: [N('\\Psi_{\\text{flat}}\\ \\text{(outward)}', psiFlat, 'Wb'), N('\\Psi_{\\text{curved}}\\ \\text{(outward)}', psiSurf, 'Wb')],
      hints: ['The flat pieces and the curved surface together are closed: their outward fluxes add to zero.', `For a uniform field each flat piece carries $(\\mathbf B\\cdot\\hat n)A$.${S.ends ? ` The two ends have opposite normals $\\pm\\hat ${S.ends}$ and equal areas.` : ''}`],
      sol: sol({
        eq: md`$\oint_S\mathbf B\cdot d\mathbf S = 0$ over the closed surface: $\Psi_{\text{curved}} + \Psi_{\text{flat}} = 0$, all normals outward.`,
        sym: md`$\Psi_{\text{flat}} = ${S.sg > 0 ? '' : '-'}B_z\,${S.aTex}$${S.ends ? md` (the ends give $\mp B_${S.ends}\cdot\tfrac12\pi R^2$, which cancel)` : ''}, so $\Psi_{\text{curved}} = ${S.sg > 0 ? '-' : ''}B_z\,${S.aTex}$.`,
        sub: md`$$\Psi_{\text{flat}} = (${S.sg})(${bz}\times10^{-3}\ \text{T})\,${S.aNum} = ${f(psiFlat)}\ \text{Wb}, \qquad \Psi_{\text{curved}} = ${f(psiSurf)}\ \text{Wb}$$`,
        ans: md`$\Psi_{\text{flat}} = ${f(psiFlat)}$ Wb, $\Psi_{\text{curved}} = ${f(psiSurf)}$ Wb (outward).`,
        check: md`$B_x$ and $B_y$ drop out: their lines enter the closed surface and leave it again. Integrating over the curved surface directly gives the same number, with much more work.`,
      }),
    };
  };

  // Summer 2019 #2(b) and its conflict exam: A = s k|x_j| x̂_i → B, J_s, and the flux as ∮A·dl
  GENS.t7_sheetA = () => {
    const i = ri(0, 2), j = pick([0, 1, 2].filter((v) => v !== i)), m = 3 - i - j;
    const s = pick([1, -1]), km = pick([1, 2, 4, 5, 10]), k = km * 1e-3;
    const e = eps(m, j), Bm = s * e;                       // B_m = s e k sgn(x_j)
    const Js = 2 * k / EM.mu0;
    const w = pick([0.5, 1, 2]), d = pick([0.1, 0.2, 0.5]), z1 = pick([0.1, 0.5, 1]);
    const psi = k * w * d;
    const xi = AX[i], xj = AX[j], xm = AX[m];
    const whyB = UV.map((o, n) => {
      const ax = Math.floor(n / 2);
      if (n === uvIx(m, Bm)) return null;
      if (ax === m) return md`Sign: $(\nabla\times\mathbf A)_${xm} = ${CURL[m]}$, and for $${xj} > 0$, $\partial_${xj}A_${xi} = ${s > 0 ? '+' : '-'}k$.`;
      if (ax === i) return 'That is along $\\mathbf A$; this curl is perpendicular to $\\mathbf A$.';
      return md`$\mathbf A$ varies along $${xj}$, but its curl points along the third axis, $${xm}$.`;
    });
    const jOpts = [md`$+\hat ${xi}$`, md`$-\hat ${xi}$`, md`$+\hat ${xm}$`, md`$-\hat ${xm}$`];
    const jA = s > 0 ? 1 : 0;
    const jWhy = jOpts.map((o, n) => (n === jA ? null : n < 2 ? md`Sign: $\hat n\times(\mathbf H^+ - \mathbf H^-)$ with $\hat n = +\hat ${xj}$ gives $${s > 0 ? '-' : '+'}\hat ${xi}$.` : 'That is along $\\mathbf B$. A sheet current is perpendicular to the field it makes beside it.'));
    return {
      title: 'From A to B to J',
      q: md`In free space, $\mathbf A = ${s > 0 ? '' : '-'}${km}\,|${xj}|\,\hat ${xi}$ mWb/m ($${xj}$ in m). (a) Show that $\nabla\cdot\mathbf A = 0$. (b) Find $\mathbf B$ for $${xj} > 0$. (c) Find the current that produces this field. (d) Find $|\Psi|$ through the ${w} m × ${d} m rectangle in the plane $${xm} = 0$ with sides along $${xi}$ (length ${w} m) and along $${xj}$ (from $${xj} = ${z1}$ m to $${xj} = ${EM.p(z1 + d)}$ m).`,
      parts: [
        { lbl: md`(b) For $${xj} > 0$, $\mathbf B$ points along`, mc: UV, a: uvIx(m, Bm), fixed: true, why: whyB },
        N('(b)\\ |\\mathbf B|', k, 'T'),
        N(`(c)\\ |\\mathbf J_s|\\ \\text{on}\\ ${xj} = 0`, Js, 'A/m'),
        { lbl: md`(c) $\mathbf J_s$ points along`, mc: jOpts, a: jA, fixed: true, why: jWhy },
        N('(d)\\ |\\Psi|', psi, 'Wb'),
      ],
      hints: [md`$A_${xi}$ depends on $${xj}$ only, so the curl has one term: $(\nabla\times\mathbf A)_${xm} = ${CURL[m]}$.`, md`$\mathbf B$ flips sign across $${xj} = 0$: $\mathbf J_s = \hat n\times(\mathbf H^+ - \mathbf H^-)$ with $\hat n = +\hat ${xj}$. For (d), only the two edges along $${xi}$ contribute to $\oint\mathbf A\cdot d\mathbf l$.`],
      sol: sol({
        eq: md`$\mathbf B = \nabla\times\mathbf A$, $\;\mathbf H = \mathbf B/\mu_0$, $\;\mathbf J_s = \hat n\times(\mathbf H^+ - \mathbf H^-)$ on $${xj} = 0$ with $\hat n = +\hat ${xj}$, $\;\Psi = \oint_C\mathbf A\cdot d\mathbf l$.`,
        sym: md`(a) $\nabla\cdot\mathbf A = \partial_${xi}A_${xi} = 0$: $A_${xi}$ depends on $${xj}$ only. (b) $(\nabla\times\mathbf A)_${xm} = ${CURL[m]}$ is the only nonzero component: $\mathbf B = ${Bm > 0 ? '' : '-'}k\operatorname{sgn}(${xj})\,\hat ${xm}$ with $k = ${km}$ mT. (c) $\mathbf H$ jumps by $2k/\mu_0$ across $${xj} = 0$, so $\mathbf J_s = ${s > 0 ? '-' : '+'}\dfrac{2k}{\mu_0}\hat ${xi}$ (and $\mathbf J = 0$ elsewhere). (d) The edges along $${xi}$ sit where $|A_${xi}| = k\,${xj}$ is $k(${z1})$ and $k(${EM.p(z1 + d)})$; the other two edges are perpendicular to $\mathbf A$. So $|\Psi| = kw\,d$.`,
        sub: md`$$|\mathbf B| = ${km}\times10^{-3}\ \text{T}, \qquad |\mathbf J_s| = \frac{2(${km}\times10^{-3}\ \text{T})}{4\pi\times10^{-7}\ \text{H/m}} = ${f(Js)}\ \text{A/m}, \qquad |\Psi| = (${km}\times10^{-3}\ \text{Wb/m}^2)(${w}\ \text{m})(${d}\ \text{m}) = ${f(psi)}\ \text{Wb}$$`,
        ans: md`$\mathbf B = ${f(k)}\,(${Bm > 0 ? '+' : '-'}\hat ${xm})$ T for $${xj} > 0$ (reversed below); $\mathbf J_s = ${f(Js)}\,(${s > 0 ? '-' : '+'}\hat ${xi})$ A/m on $${xj} = 0$; $|\Psi| = ${f(psi)}$ Wb.`,
        check: md`Sheet formula: $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ with $\hat n = +\hat ${xj}$ gives $\mathbf B = ${Bm > 0 ? '+' : '-'}k\,\hat ${xm}$ above the sheet ✓. And $|\Psi| = |\mathbf B|wd$ directly ✓.`,
      }),
    };
  };

  // Spring 2018 1(v), with fields that are not zero: E and B from Φ and A, checked against Faraday
  GENS.t7_potentials = () => {
    const a = pick([1, 2, 3, 5]);
    const b = pick([-6, -4, -2, 2, 4, 6].filter((v) => v !== -2 * a));
    const c = pick([-3, -2, -1, 1, 2, 3]), x0 = pick([0.5, 1, 2, 3]), t0 = pick([1, 2, 5]);
    const Ex = -(2 * a + b) * x0, Ey = -c * x0, Bz = c * t0;
    return {
      title: 'Fields from the potentials',
      q: md`In a region of free space the potentials are $\Phi = ${a}x^2$ V and $\mathbf A = ${cf(b)}xt\,\hat x ${c < 0 ? '-' : '+'} ${cf(Math.abs(c))}xt\,\hat y$ V·s/m ($x$ in m, $t$ in s). Find $E_x$ and $E_y$ at $x = ${x0}$ m, and $B_z$ at $t = ${t0}$ s.`,
      parts: [N('E_x', Ex, 'V/m'), N('E_y', Ey, 'V/m'), N('B_z', Bz, 'T')],
      hints: ['$\\mathbf E = -\\nabla\\Phi - \\partial\\mathbf A/\\partial t$: two terms, both with a minus sign.', '$B_z = \\partial_xA_y - \\partial_yA_x$.'],
      sol: sol({
        eq: md`$\mathbf E = -\nabla\Phi - \dfrac{\partial\mathbf A}{\partial t}$, $\;\mathbf B = \nabla\times\mathbf A$.`,
        sym: md`$-\nabla\Phi = -${2 * a}x\,\hat x$ and $-\partial\mathbf A/\partial t = ${cf(-b)}x\,\hat x ${-c < 0 ? '-' : '+'} ${cf(Math.abs(c))}x\,\hat y$, so $E_x = ${cf(-(2 * a + b))}x$, $E_y = ${cf(-c)}x$ (V/m). In the curl only $\partial_xA_y = ${cf(c)}t$ survives: $B_z = ${cf(c)}t$ T.`,
        sub: md`$$E_x = -(${2 * a} ${b < 0 ? '-' : '+'} ${Math.abs(b)})(${x0}) = ${f(Ex)}\ \text{V/m}, \qquad E_y = -(${c})(${x0}) = ${f(Ey)}\ \text{V/m}, \qquad B_z = (${c})(${t0}) = ${f(Bz)}\ \text{T}$$`,
        ans: md`$E_x = ${f(Ex)}$ V/m, $E_y = ${f(Ey)}$ V/m, $B_z = ${f(Bz)}$ T.`,
        check: md`Faraday: $(\nabla\times\mathbf E)_z = \partial_xE_y - \partial_yE_x = ${-c}$ and $-\partial B_z/\partial t = ${-c}$ (T/s) ✓. $\mathbf E$ does not change in time while $\mathbf B$ ramps steadily: a constant curl of $\mathbf E$ makes a steady ramp of $\mathbf B$.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t7-flux'] = [
    Q(md`Cutting a bar magnet in half gives…`,
      ['two magnets, each with a north and a south pole', 'an isolated north pole and an isolated south pole', 'two unmagnetized pieces', 'one magnet and one unmagnetized piece'], 0,
      [null, 'There is no magnetic charge to sit at the cut; field lines still close through each half.', 'The aligned moments inside each half stay aligned.', 'Both halves contain aligned moments, so each is a magnet.'],
      md`$\oint\mathbf B\cdot d\mathbf S = 0$: poles always come in pairs, because field lines close on themselves.`),
    Q(md`$\mathbf B(t)$ is changing in time. Over any closed surface, $\oint\mathbf B\cdot d\mathbf S$…`,
      ['is still zero at every instant', 'equals $-d\\Psi/dt$', 'is zero only for static fields', 'equals the emf around the surface'], 0,
      [null, 'That is Faraday\'s law, for an open surface and its rim. A closed surface has no rim.', '$\\nabla\\cdot\\mathbf B = 0$ is one of Maxwell\'s equations: it holds at all times.', 'A closed surface has no rim, so no path to measure an emf around.'],
      md`Gauss's law for $\mathbf B$ is not a statics result. Taking $\nabla\cdot$ of Faraday's law gives $\partial(\nabla\cdot\mathbf B)/\partial t = 0$: once zero, always zero.`),
    Q(md`The local law $\nabla\cdot\mathbf B = 0$ follows from $\oint_S\mathbf B\cdot d\mathbf S = 0$ by…`,
      ['the divergence theorem', 'Stokes\' theorem', 'the Biot–Savart law', 'the right-hand rule'], 0,
      [null, 'Stokes\' theorem links a curl to a loop integral (as in $\\Psi = \\oint\\mathbf A\\cdot d\\mathbf l$).', 'Biot–Savart computes $\\mathbf B$ from currents; it does not turn an integral law into a local one.', 'The RHR fixes orientations only.'],
      md`$\oint_S\mathbf B\cdot d\mathbf S = \int_V\nabla\cdot\mathbf B\,dV = 0$ for every volume, so the integrand is zero everywhere.`),
    Q(md`For a **uniform** $\mathbf B$, the flux through any open surface with rim $C$ equals…`,
      ['the flux through the flat surface spanning $C$', '$|\\mathbf B|$ times the surface\'s actual area', 'zero, if the surface is curved', '$|\\mathbf B|$ times the flat area, whatever the tilt'], 0,
      [null, 'Curved area overcounts: lines that go in and out again add area but no net flux.', 'Curved surfaces carry flux too; only closed ones carry none.', 'Only the component of $\\mathbf B$ along the flat surface\'s normal counts.'],
      md`Same rim, same flux, and for the flat surface $\Psi = (\mathbf B\cdot\hat n)A$: only the projected area matters.`),
    Q(md`A long straight wire carrying $I$ lies in the plane of a rectangular loop, parallel to the loop's side of length $h$; the loop spans distances $d$ to $d + w$ from the wire, so $\Psi = \frac{\mu_0Ih}{2\pi}\ln\frac{d + w}{d}$. If $d$ and $w$ both double, $\Psi$…`,
      ['stays the same', 'doubles', 'halves', 'grows by $\\ln 2$'], 0,
      [null, 'Doubling $d$ and $w$ keeps their ratio, and the log, unchanged.', 'The loop is twice as wide but sits where $B$ is half as strong.', 'The log depends only on the ratio $(d + w)/d$.'],
      md`$\ln\frac{2d + 2w}{2d} = \ln\frac{d + w}{d}$. A $1/r$ field gives equal flux to strips with equal ratios of outer to inner distance.`),
    Q(md`One turn of a toroid links $\Psi_1 = \frac{\mu_0NIh}{2\pi}\ln\frac ba$. Doubling the height $h$ and both radii $a$ and $b$ makes $\Psi_1$…`,
      ['twice as large', 'four times as large', 'unchanged', 'half as large'], 0,
      [null, 'Scaling $a$ and $b$ together leaves $\\ln(b/a)$ unchanged; only $h$ doubles.', 'The doubled height doubles every strip\'s area.', 'The larger radii weaken $B$, but the strips widen by the same factor; the height still doubles.'],
      md`$\ln(2b/2a) = \ln(b/a)$, and $\Psi_1 \propto h$.`),
    Q(md`In free space, $\mathbf B = B_0\hat y$ for $z > 0$ and $\mathbf B = 0$ for $z < 0$. On $z = 0$ there must be a surface current…`,
      ['$\\mathbf J_s = -(B_0/\\mu_0)\\,\\hat x$', '$\\mathbf J_s = +(B_0/\\mu_0)\\,\\hat x$', '$\\mathbf J_s = -(2B_0/\\mu_0)\\,\\hat x$', '$\\mathbf J_s = (B_0/\\mu_0)\\,\\hat y$'], 0,
      [null, 'Sign: $\\hat z\\times\\hat y = -\\hat x$.', 'The jump in $H_y$ is $B_0/\\mu_0$, not $2B_0/\\mu_0$.', 'A sheet current is perpendicular to the jump in $\\mathbf H$, not along it.'],
      md`$\mathbf J_s = \hat n\times(\mathbf H^+ - \mathbf H^-) = \hat z\times\frac{B_0}{\mu_0}\hat y = -\frac{B_0}{\mu_0}\hat x$.`),
    Q(md`$\mathbf B = B_0(y/\ell)\,\hat x$ in a region of free space. The current density there is…`,
      ['$-\\dfrac{B_0}{\\mu_0\\ell}\\hat z$', '$+\\dfrac{B_0}{\\mu_0\\ell}\\hat z$', '$0$, since $\\nabla\\cdot\\mathbf B = 0$', '$\\dfrac{B_0}{\\mu_0\\ell}\\hat x$'], 0,
      [null, 'Sign: $(\\nabla\\times\\mathbf H)_z = \\partial_xH_y - \\partial_yH_x$.', 'Zero divergence makes it a valid $\\mathbf B$; its curl still needs a current.', 'The current is along the curl, perpendicular to $\\mathbf B$ here.'],
      md`$\mathbf J = \nabla\times\mathbf H = \hat z(\partial_xH_y - \partial_yH_x) = -\frac{B_0}{\mu_0\ell}\hat z$.`),
    Q(md`Gauss's law for $\mathbf B$ applied to a thin pillbox straddling an interface says…`,
      ['the normal component of $\\mathbf B$ is continuous', 'the tangential component of $\\mathbf B$ is continuous', 'the normal component of $\\mathbf H$ is continuous', 'the normal component of $\\mathbf B$ jumps by $\\mu_0J_s$'], 0,
      [null, 'The pillbox\'s thin side carries no flux; it says nothing about tangential parts.', 'Across a change in $\\mu$, $H_n = B_n/\\mu$ jumps.', 'No source of $\\mathbf B$ flux exists; surface currents affect the tangential $\\mathbf H$.'],
      md`What enters the bottom face leaves through the top: $B_n^+ = B_n^-$. (Topic 13 uses this at material interfaces.)`),
    Q(md`To find the flux of a uniform $\mathbf B$ through a curved open surface (a partial cone, say), the quickest route is to…`,
      ['close it with flat pieces and use $\\oint\\mathbf B\\cdot d\\mathbf S = 0$', 'parametrize the curved surface and integrate', 'multiply $|\\mathbf B|$ by the curved area', 'find $\\mathbf A$ and integrate it over the surface'], 0,
      [null, 'That works, with far more algebra and more chances to slip.', 'That ignores direction: lines enter and leave a curved surface.', '$\\mathbf A$ is integrated around the rim, not over the surface.'],
      md`The flat pieces carry $(\mathbf B\cdot\hat n)A$ each; the curved part carries minus their sum.`),
    Q(md`$\mathbf B = B_0(y/\ell)\,\hat z$. The flux through a square of side $a$ in the $xy$-plane centered on the origin is…`,
      ['zero', '$B_0a^2$', '$\\tfrac12B_0a^2$', 'no answer: this is not a valid B'], 0,
      [null, 'The field is $B_0$ only at $y = \\ell$; over a centered square its average is zero.', '$B_z$ is odd in $y$: the flux up through one half cancels the flux down through the other.', '$\\nabla\\cdot\\mathbf B = \\partial_zB_z = 0$: valid.'],
      md`$B_z$ is odd in $y$ and the square is symmetric: as much flux goes up through one half as down through the other.`),
  ];

  EM.BANK['x-vecpot'] = [
    Q(md`Which identity guarantees that any $\mathbf B = \nabla\times\mathbf A$ obeys Gauss's law for $\mathbf B$?`,
      ['$\\nabla\\cdot(\\nabla\\times\\mathbf A) = 0$', '$\\nabla\\times(\\nabla f) = 0$', '$\\nabla\\cdot(\\nabla f) = \\nabla^2f$', '$\\nabla\\times(\\nabla\\times\\mathbf A) = \\nabla(\\nabla\\cdot\\mathbf A) - \\nabla^2\\mathbf A$'], 0,
      [null, 'That one gives $\\mathbf E = -\\nabla\\Phi - \\partial\\mathbf A/\\partial t$ from Faraday\'s law.', 'That defines the Laplacian (Poisson\'s equation).', 'That one is used in Ampère\'s law for the potentials.'],
      md`div curl = 0 for every vector field, so $\nabla\cdot\mathbf B = \nabla\cdot(\nabla\times\mathbf A) = 0$ automatically.`),
    Q(md`Which fact turns $\nabla\times(\mathbf E + \partial\mathbf A/\partial t) = 0$ into $\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t$?`,
      ['a curl-free field is a gradient ($\\nabla\\times\\nabla\\Phi = 0$)', '$\\nabla\\cdot(\\nabla\\times\\mathbf A) = 0$', 'Gauss\'s law for $\\mathbf D$', 'charge conservation'], 0,
      [null, 'That identity gives $\\mathbf B = \\nabla\\times\\mathbf A$, not the scalar potential.', 'Gauss\'s law then gives an equation for $\\Phi$; it does not create $\\Phi$.', 'Continuity relates $\\rho$ and $\\mathbf J$.'],
      md`Any field with zero curl can be written as $-\nabla$ of a scalar; here that field is $\mathbf E + \partial\mathbf A/\partial t$.`),
    Q(md`$\mathbf A$ is replaced by $\mathbf A + \nabla\lambda$, where $\lambda(x, y, z, t)$ depends on time. To keep $\mathbf E$ the same, $\Phi$ must become…`,
      ['$\\Phi - \\partial\\lambda/\\partial t$', '$\\Phi + \\partial\\lambda/\\partial t$', '$\\Phi$, unchanged', '$\\Phi - \\lambda$'], 0,
      [null, 'Then $\\mathbf E$ changes by $-2\\nabla\\partial_t\\lambda$.', 'The new $\\mathbf A$ adds $-\\nabla\\partial_t\\lambda$ to $\\mathbf E$, which $\\Phi$ must cancel.', 'Units: $\\lambda$ is in Wb (V·s); $\\Phi$ needs volts, so a time derivative.'],
      md`$-\nabla\Phi' - \partial_t(\mathbf A + \nabla\lambda) = -\nabla(\Phi' + \partial_t\lambda) - \partial_t\mathbf A$, so $\Phi' = \Phi - \partial_t\lambda$ (the lecture's gauge transformation). $\mathbf B$ is unchanged either way.`),
    Q(md`Describing fields by $\Phi$ and $\mathbf A$ instead of $\mathbf E$ and $\mathbf B$ replaces six unknown components by…`,
      ['four, with Faraday\'s law and Gauss\'s law for $\\mathbf B$ built in', 'three', 'six', 'two'], 0,
      [null, '$\\mathbf A$ has three components and $\\Phi$ one.', 'Four: $\\Phi$, $A_x$, $A_y$, $A_z$.', 'Four: $\\Phi$, $A_x$, $A_y$, $A_z$.'],
      md`The two source-free Maxwell equations hold automatically; the other two become equations for $\Phi$ and $\mathbf A$.`),
    Q(md`For fields that do not change in time, the potentials reduce to…`,
      ['$\\mathbf E = -\\nabla\\Phi$, $\\mathbf B = \\nabla\\times\\mathbf A$, with $\\nabla^2\\Phi = -\\rho/\\epsilon$', '$\\mathbf E = -\\partial\\mathbf A/\\partial t$', '$\\mathbf E = 0$ and $\\mathbf B = \\nabla\\times\\mathbf A$', '$\\mathbf B = -\\nabla\\Phi$'], 0,
      [null, 'With nothing changing, $\\partial\\mathbf A/\\partial t = 0$; the $-\\nabla\\Phi$ part remains.', 'Static charges still make $\\mathbf E = -\\nabla\\Phi$.', '$\\mathbf B$ is a curl, never a gradient of $\\Phi$.'],
      md`$\partial_t\mathbf A = 0$ leaves $\mathbf E = -\nabla\Phi$, and Gauss's law gives Poisson's equation, as in Exam 1.`),
    Q(md`Inside a long solenoid, $\mathbf B = B_0\hat z$ and $\mathbf A = \tfrac12B_0r\,\hat\phi$. Around a circle of radius $r$ (counterclockwise seen from $+z$), $\oint\mathbf A\cdot d\mathbf l = $`,
      ['$\\pi r^2B_0$', '$\\tfrac12B_0r$', '$\\pi rB_0$', '$2\\pi r^2B_0$'], 0,
      [null, 'That is $A_\\phi$ itself; integrate it around $2\\pi r$.', '$(\\tfrac12B_0r)(2\\pi r) = \\pi r^2B_0$: a factor of $r$ is missing.', 'Off by two: $(\\tfrac12B_0r)(2\\pi r) = \\pi r^2B_0$.'],
      md`$A_\phi\cdot2\pi r = \pi r^2B_0$: exactly the flux through the circle, as Stokes' theorem requires.`),
    Q(md`A long straight wire carries $I$ along $+\hat z$. Its vector potential points along…`,
      ['$\\pm\\hat z$, parallel to the current', '$\\hat\\phi$', '$\\hat r$', 'nowhere: $\\mathbf A = 0$ for a straight wire'], 0,
      [null, 'That is $\\mathbf B$. $\\mathbf A$ is the field whose curl gives it.', 'A radial $A_r(r)$ has zero curl; it would give no $\\mathbf B$.', '$\\mathbf B \\ne 0$, so $\\mathbf A \\ne 0$.'],
      md`$A_z = -\frac{\mu_0I}{2\pi}\ln r + \text{const}$, and $(\nabla\times A_z\hat z)_\phi = -\partial_rA_z = \frac{\mu_0I}{2\pi r}$ ✓. $\mathbf A$ follows the current that makes it.`),
    Q(md`$\mathbf B = B_0\hat z$ is uniform. Which is **not** a vector potential for it?`,
      ['$B_0y\\,\\hat x$', '$-B_0y\\,\\hat x$', '$B_0x\\,\\hat y$', '$\\tfrac12B_0(x\\hat y - y\\hat x)$'], 0,
      [null, '$(\\nabla\\times\\mathbf A)_z = -\\partial_yA_x = B_0$: valid.', '$(\\nabla\\times\\mathbf A)_z = \\partial_xA_y = B_0$: valid.', 'Each term gives $\\tfrac12B_0$: valid.'],
      md`$\nabla\times(B_0y\,\hat x) = -\hat z\,\partial_y(B_0y) = -B_0\hat z$: the wrong sign.`),
  ];
})();

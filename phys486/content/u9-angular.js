/* Midterm 2 · Unit 3 — three dimensions and angular momentum (Lecture 12 onward, HW 7, Discussion 7). Topics 17–19:
   the Schrödinger equation in 3D and separation of variables; the algebra of L (commutators, the ladder, the vector
   model); spherical harmonics, measuring L, the rigid rotor. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  // ------------------------------------------------------------------ figures
  // 3D Gaussian (oscillator ground state): density vs radial probability, r in units of b
  const shell = PF.plot({
    w: 380, h: 210, x: [0, 3], y: [0, 1.15], xl: 'r/b',
    xt: [[1, '1'], [2, '2']],
    curves: [
      { f: (x) => Math.exp(-x * x), cls: 'dim', lab: '|\\psi|^2', labAt: 0.35, dy: -12 },
      { f: (x) => Math.E * x * x * Math.exp(-x * x), lab: '4\\pi r^2|\\psi|^2', labAt: 1.55, dy: -10 },
    ],
    vlines: [[1, 'r = b']],
  });

  // columns of short level lines. cols: header TeX per column; lv: [{ c, y, t }]; yr: [ymin, ymax] in data units
  function ladder(cols, lv, yr, o = {}) {
    const f = PF.fig({});
    const W = o.W || 92, top = 16, H = o.h || 190, x0 = 46;
    const Y = (y) => top + (yr[1] - y) / (yr[1] - yr[0]) * H;
    f.line(x0 - 16, top + H + 4, x0 - 16, top - 10, { cls: 'dim', arrow: 'end', hs: 5 });
    f.label(x0 - 22, top - 8, o.yl || 'E', 'r', 'small');
    (o.ticks || []).forEach(([v, t]) => f.label(x0 - 22, Y(v), t, 'r', 'small accent'));
    cols.forEach((c, i) => f.label(x0 + i * W + 22, top + H + 14, c, 't', 'small'));
    lv.forEach((l) => { const x = x0 + l.c * W, y = Y(l.y); f.line(x, y, x + 44, y, { cls: 'thick' }); if (l.t) f.label(x + 49, y, l.t, 'l', 'small'); });
    return f.svg();
  }

  // 3D isotropic oscillator: level N contains l = N, N-2, ...; label = 2l + 1 states
  const osc3d = ladder(['\\ell=0', '\\ell=1', '\\ell=2', '\\ell=3'],
    [0, 1, 2, 3].flatMap((N) => [...Array(N + 1).keys()].filter((l) => (N - l) % 2 === 0).map((l) => ({ c: l, y: N + 1.5, t: `${2 * l + 1}` }))),
    [1, 5], { yl: 'E/\\hbar\\omega', ticks: [[1.5, '\\tfrac32'], [2.5, '\\tfrac52'], [3.5, '\\tfrac72'], [4.5, '\\tfrac92']] });

  // the vector model for l = 2: |L| = sqrt(6) hbar, Lz = m hbar
  function cone() {
    const f = PF.fig({});
    const cx = 70, cy = 150, s = 38, Rr = Math.sqrt(6) * s;
    f.line(cx, cy + Rr + 12, cx, cy - Rr - 18, { cls: 'dim', arrow: 'end', hs: 5 });
    f.label(cx + 6, cy - Rr - 20, 'L_z', 'l', 'small');
    f.arc(cx, cy, Rr, -90, 90, { cls: 'dash dim' });
    for (let m = -2; m <= 2; m++) {
      const y = cy - m * s, x = cx + Math.sqrt(6 - m * m) * s;
      f.line(cx - 8, y, cx + 2, y, { cls: 'dim' });
      f.label(cx - 12, y, `${m}\\hbar`, 'r', 'small');
      f.arrow(cx, cy, x, y, { hs: 6 });
    }
    f.ellipse(cx, cy - 2 * s, Math.sqrt(2) * s, 0.3 * Math.sqrt(2) * s, { cls: 'dash' });
    f.label(cx + Rr * 0.72 + 10, cy - Rr * 0.72 - 4, '|\\vec L| = \\sqrt6\\,\\hbar', 'bl', 'small');
    return f.svg();
  }

  // |Y|^2 in the xz-plane: distance from the origin = |Y|^2 at polar angle theta (from +z)
  function polar(fn, cap) {
    const f = PF.fig({});
    const cx = 72, cy = 72, Rr = 58;
    f.line(cx - Rr - 6, cy, cx + Rr + 8, cy, { cls: 'dim', arrow: 'end', hs: 4 });
    f.label(cx + Rr + 11, cy, 'x', 'l', 'small');
    f.line(cx, cy + Rr + 6, cx, cy - Rr - 8, { cls: 'dim', arrow: 'end', hs: 4 });
    f.label(cx, cy - Rr - 11, 'z', 'b', 'small');
    let mx = 0;
    for (let i = 0; i <= 720; i++) mx = Math.max(mx, fn(i * Math.PI / 360));
    const pts = [];
    for (let i = 0; i <= 720; i++) { const t = i * Math.PI / 360, r = Rr * fn(t) / mx; pts.push([cx + r * Math.sin(t), cy - r * Math.cos(t)]); }
    f.pl(pts, { cls: 'curve' });
    return { svg: f.svg(), cap };
  }
  const shapes = PF.row([
    polar(() => 1, '$|Y_0^0|^2$'),
    polar((t) => Math.cos(t) ** 2, '$|Y_1^0|^2$'),
    polar((t) => Math.sin(t) ** 2, '$|Y_1^{\\pm1}|^2$'),
    polar((t) => (3 * Math.cos(t) ** 2 - 1) ** 2, '$|Y_2^0|^2$'),
  ]);
  const tilted = PF.row([
    polar((t) => Math.cos(t) ** 2, '$\\beta = 0$: along $z$'),
    polar((t) => Math.cos(t - Math.PI / 4) ** 2, '$\\beta = 45°$'),
    polar((t) => Math.sin(t) ** 2, '$\\beta = 90°$: along $x$'),
  ]);

  const paper = (title, head, items, figs) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>${title}</span><span>20 pts · 5 per part</span></div>`,
    head, figs, items,
  });

  C.unit({
    id: 'u9', exam: 'm2', num: 'Unit 3', title: 'Three dimensions and angular momentum',
    blurb: 'The Schrödinger equation in 3D, separation of variables, the algebra of angular momentum, spherical harmonics and measuring L (Lecture 12 on, HW 7, Discussion 7).',
    lessons: [
      // ================================================================== Topic 17
      {
        id: 't17-3d', topic: 17, title: 'Quantum mechanics in three dimensions', ref: 'Griffiths 4.1 · Lecture 12',
        steps: [
          RF(md`
            ### The picture

            Nothing about the postulates changes in three dimensions. The state is a function $\psi(\vb r) = \psi(x, y, z)$, $|\psi|^2d^3r$ is the probability of finding the particle in the small volume $d^3r$, momentum is $\hat{\vb p} = -i\hbar\nabla$, and
            $$-\frac{\hbar^2}{2m}\nabla^2\psi + V(\vb r)\psi = E\psi,\qquad \int|\psi|^2\,d^3r = 1$$

            Two things are new, and both are about geometry.

            - **More quantum numbers.** A 1D bound state is labeled by one number (how many nodes it has). In 3D there are three independent directions to put nodes in, so three numbers.
            - **Degeneracy.** Different states with the same energy. In 1D bound states this never happens; in 3D it is the rule. It is the fingerprint of a symmetry: if rotating (or reflecting) the system leaves $\hat H$ unchanged, then rotating a stationary state gives another stationary state with the *same* energy.

            The whole game is to split the 3D equation into 1D equations you already know. Which split works depends on the symmetry of $V$.

            ### Split 1: Cartesian coordinates (box, oscillator)

            If $V = V_1(x) + V_2(y) + V_3(z)$, try $\psi = X(x)Y(y)Z(z)$. Divide the equation by $\psi$: you get a function of $x$ alone plus a function of $y$ alone plus a function of $z$ alone, adding up to the constant $E$. Each must be a constant by itself, so you get three 1D problems and
            $$\psi = X(x)Y(y)Z(z),\qquad E = E_x + E_y + E_z$$
            **Wavefunctions multiply, energies add.**

            **Cubic box** of side $L$: $E = \dfrac{\pi^2\hbar^2}{2mL^2}(n_x^2 + n_y^2 + n_z^2)$, each $n_i \ge 1$.

            | $n_x^2 + n_y^2 + n_z^2$ | 3 | 6 | 9 | 11 | 12 | 14 | … | 27 |
            |---|---|---|---|---|---|---|---|---|
            | states | (111) | (211)×3 | (221)×3 | (311)×3 | (222) | (123)×6 | | (333), (511)×3 |
            | degeneracy | 1 | 3 | 3 | 3 | 1 | 6 | | 4 |

            The 3-fold and 6-fold degeneracies are the cube's symmetry: $(2,1,1)$, $(1,2,1)$, $(1,1,2)$ are the same standing wave turned by 90°. Level 27 is different: no rotation of a cube turns $(3,3,3)$ into $(5,1,1)$. That coincidence is **accidental** (it comes from $27 = 9 + 9 + 9 = 25 + 1 + 1$), not from symmetry.

            **3D isotropic oscillator**, $V = \tfrac12m\omega^2(x^2 + y^2 + z^2) = \tfrac12m\omega^2r^2$: three 1D oscillators,
            $$E = \hbar\omega\left(n_x + n_y + n_z + \tfrac32\right) = \hbar\omega\left(N + \tfrac32\right),\qquad g_N = \frac{(N+1)(N+2)}{2} = 1, 3, 6, 10, \ldots$$
            ($g_N$ counts the ways to write $N$ as a sum of three non-negative integers.) Zero-point energy $\tfrac32\hbar\omega$: $\tfrac12\hbar\omega$ per direction.

            ### Split 2: spherical coordinates (any central potential)

            If $V$ depends only on $r = |\vb r|$, it does not split into $x$, $y$, $z$ pieces (the oscillator is the lucky exception). Use $r, \theta, \phi$, where
            $$\nabla^2 = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right) + \frac{1}{r^2}\left[\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right) + \frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right]$$
            Try $\psi = R(r)\,Y(\theta, \phi)$. Multiply the Schrödinger equation by $-2mr^2/(\hbar^2RY)$ and sort:
            $$\underbrace{\frac1R\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) - \frac{2mr^2}{\hbar^2}\big[V(r) - E\big]}_{\text{only } r} + \underbrace{\frac1Y\left[\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial Y}{\partial\theta}\right) + \frac{1}{\sin^2\theta}\frac{\partial^2Y}{\partial\phi^2}\right]}_{\text{only } \theta,\,\phi} = 0$$
            Each bracket is a constant; call the first one $\ell(\ell+1)$ (Lecture 12's name, which will turn out to be $L^2/\hbar^2$). The **angular equation has no $V$ in it**. So the angular functions, the spherical harmonics $Y_\ell^m$, are the same for hydrogen, the 3D oscillator, a nucleus, a spinning molecule: every central potential. The particular potential only enters the radial equation. That is the economy of this unit: Topics 18–19 do the angles once; Topics 20–21 do the radial part for each potential.

            **Normalization.** $d^3r = r^2\sin\theta\,dr\,d\theta\,d\phi = r^2dr\,d\Omega$. A product $RY$ is normalized when each piece is: $\int_0^\infty|R|^2r^2dr = 1$ and $\int|Y|^2d\Omega = 1$.

            !!intuition Density is not "where the particle is"
              For a spherically symmetric state, the probability of being between $r$ and $r + dr$ is the density times the volume of that thin shell: $P(r)\,dr = 4\pi r^2|\psi(r)|^2dr$. The shell volume grows like $r^2$, so even when the density is largest at the origin, the most probable *distance* from the origin is not zero. For the oscillator ground state, a Gaussian of width $b = \sqrt{\hbar/m\omega}$:

            [[fig:shell]]

            ### The classical picture, and what survives

            Classically a central force exerts no torque, so $\vb L$ is conserved, and that does two things. Its **direction** is fixed, so the orbit lies in a plane (3D → 2D). Its **magnitude** is fixed, so the radial motion is a 1D problem in the effective potential $V + L^2/2mr^2$ (2D → 1D). In quantum mechanics only the second step survives. $\hat L^2$ commutes with $\hat H$, so it can be sharp, and $\hbar^2\ell(\ell+1)$ plays the role of $L^2$ in the radial equation (Topic 20). The fixed plane does not survive: the components of $\hat{\vb L}$ do not commute, so at most one of them can be sharp (Topic 18). The quantum "orbit" is smeared over directions.
          `, { shell: { svg: shell, cap: 'Gaussian ground state: the density (gray) peaks at the origin; the probability per unit $r$ (shell volume included) peaks at $r = b$.' } }),
          R(md`
            ### Worked example

            !!graded Problem
              Write the ground state of the 3D isotropic oscillator and its energy. Find the most probable distance from the origin and $\langle r^2\rangle$.

            **Ground state.** Each direction is in its own 1D ground state:
            $$\psi_{000} = \left(\frac{m\omega}{\pi\hbar}\right)^{3/4}e^{-m\omega(x^2+y^2+z^2)/2\hbar} = \frac{1}{\pi^{3/4}b^{3/2}}e^{-r^2/2b^2},\qquad b = \sqrt{\frac{\hbar}{m\omega}},\qquad E = \tfrac32\hbar\omega$$
            It depends on $r$ only: spherically symmetric, $\ell = 0$.

            **Most probable $r$.** $P(r) = 4\pi r^2|\psi|^2 = \dfrac{4}{\sqrt\pi\,b^3}r^2e^{-r^2/b^2}$. Setting $\tfrac{d}{dr}\left(r^2e^{-r^2/b^2}\right) = \left(2r - \tfrac{2r^3}{b^2}\right)e^{-r^2/b^2} = 0$ gives $r = b$.

            **$\langle r^2\rangle$, no integral.** $r^2 = x^2 + y^2 + z^2$, and each 1D ground state has $\langle x^2\rangle = \tfrac{\hbar}{2m\omega} = \tfrac{b^2}{2}$. So $\langle r^2\rangle = \tfrac32b^2$.

            **Check.** $\langle V\rangle = \tfrac12m\omega^2\cdot\tfrac32b^2 = \tfrac34\hbar\omega$, half of $E$: the oscillator's virial theorem ($\langle T\rangle = \langle V\rangle$) in 3D.

            !!mistake Common mistakes
              - Forgetting the $r^2$ of the shell volume: the probability between $r$ and $r + dr$ is $|R|^2r^2dr$ (times $\int|Y|^2d\Omega = 1$), not $|R|^2dr$.
              - Writing $d^3r = dr\,d\theta\,d\phi$. It is $r^2\sin\theta\,dr\,d\theta\,d\phi$.
              - Adding wavefunctions and multiplying energies. Separation gives products of wavefunctions and sums of energies.
              - Thinking degenerate states are "the same state". They are different, orthogonal states; a measurement of something other than $H$ (like $L_z$) tells them apart.
              - Calling every degeneracy a symmetry. Rotational symmetry guarantees $2\ell + 1$; anything beyond that (box level 27, the oscillator, hydrogen) is accidental.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`In three dimensions, $|\psi(\vb r)|^2\,d^3r$ is…`,
            ['the probability of finding the particle in the small volume d³r around r', 'the probability of finding the particle at a distance between r and r + dr from the origin', 'the probability per unit length along r', 'the energy in d³r'], 0,
            [null, md`That needs the whole shell: $\int|\psi|^2r^2dr\,d\Omega$. A single $d^3r$ is one small box.`, md`$|\psi|^2$ is per unit **volume** (units m$^{-3}$).`, 'It is a probability, not an energy.'],
            md`$|\psi|^2$ has units 1/volume; multiply by a volume element to get a probability.`),
          Q(md`For $V = V_1(x) + V_2(y) + V_3(z)$ the stationary states are…`,
            [md`$\psi = X(x)Y(y)Z(z)$ with $E = E_x + E_y + E_z$`, md`$\psi = X + Y + Z$ with $E = E_xE_yE_z$`, md`$\psi = X(x)Y(y)Z(z)$ with $E = E_xE_yE_z$`, 'not separable: you need spherical coordinates'], 0,
            [null, 'A sum of 1D functions does not turn the Laplacian into three separate equations.', md`Dividing by $XYZ$ gives three terms that **add** to $E$.`, md`Spherical coordinates are for $V(r)$; a sum of 1D potentials separates in Cartesian coordinates.`],
            md`$-\tfrac{\hbar^2}{2m}\left(\tfrac{X''}{X} + \tfrac{Y''}{Y} + \tfrac{Z''}{Z}\right) + V_1 + V_2 + V_3 = E$: each group is its own constant.`),
          L(2, 'set up'),
          P({
            title: 'Cubic box: first excited level',
            q: md`A particle is in a cubic box of side $L$. In units of $\dfrac{\pi^2\hbar^2}{2mL^2}$, what is the energy of the first excited level, and how many states share it?`,
            parts: [{ lbl: 'E', ans: 6 }, { lbl: '\\text{degeneracy}', ans: 3 }],
            hints: [md`$E \propto n_x^2 + n_y^2 + n_z^2$ with every $n_i \ge 1$. The ground state is $(1,1,1)$.`],
            sol: md`Raise one quantum number to 2: $(2,1,1)$, $(1,2,1)$, $(1,1,2)$, all with $4 + 1 + 1 = 6$. Three states: the same standing wave pointed along $x$, $y$ or $z$.`,
          }),
          Q(md`A central-potential state is $\psi = R(r)Y(\theta, \phi)$ with $\int|Y|^2d\Omega = 1$. The radial normalization is…`,
            [md`$\int_0^\infty|R|^2r^2\,dr = 1$`, md`$\int_0^\infty|R|^2\,dr = 1$`, md`$\int_0^\infty|R|^2\,4\pi r^2\,dr = 1$`, md`$\int_{-\infty}^\infty|R|^2\,dr = 1$`], 0,
            [null, md`The volume element is $r^2dr\,d\Omega$: the $r^2$ is not optional.`, md`The $4\pi$ is already inside $\int|Y|^2d\Omega = 1$. Counting it again would double-count the angles.`, md`$r \ge 0$; there is no negative $r$.`],
            md`$\int|\psi|^2d^3r = \int|R|^2r^2dr\int|Y|^2d\Omega$.`),
          L(3, 'standard'),
          P({
            title: '3D oscillator: N = 3',
            q: md`For the 3D isotropic oscillator, find the energy (in units of $\hbar\omega$) and the degeneracy of the level $N = n_x + n_y + n_z = 3$.`,
            parts: [{ lbl: 'E/\\hbar\\omega', ans: 4.5 }, { lbl: 'g_3', ans: 10 }],
            hints: [md`Count: $(3,0,0)$-type, $(2,1,0)$-type, $(1,1,1)$.`],
            sol: md`$E = \hbar\omega(3 + \tfrac32)$. Count: $(3,0,0)$ ×3, $(2,1,0)$ ×6, $(1,1,1)$ ×1: 10 $= \tfrac{4\cdot5}{2}$ ✓.`,
          }),
          P({
            title: 'The Gaussian in 3D',
            q: md`$\psi \propto e^{-r^2/2b^2}$. Find the most probable distance from the origin and $\langle r^2\rangle$, in units of $b$ and $b^2$.`,
            parts: [{ lbl: 'r_{\\text{mp}}/b', ans: 1 }, { lbl: '\\langle r^2\\rangle/b^2', ans: 1.5 }],
            hints: [md`$P(r) \propto r^2e^{-r^2/b^2}$.`, md`$\langle x^2\rangle = b^2/2$ for $e^{-x^2/2b^2}$ squared.`],
            sol: md`Maximize $r^2e^{-r^2/b^2}$: $r = b$. $\langle r^2\rangle = 3\langle x^2\rangle = \tfrac32b^2$.`,
          }),
          Q(md`Compare the angular functions $Y(\theta, \phi)$ of the hydrogen atom with those of the 3D isotropic oscillator.`,
            ['They are the same spherical harmonics', 'Different, because the potentials are different', 'Hydrogen has no angular dependence', md`The same only for $\ell = 0$`], 0,
            [null, 'The angular equation contains no V at all.', md`Only its $\ell = 0$ states are angle-independent; $p$, $d$, … states are not.`, 'They agree for every ℓ.'],
            md`Separation puts $V(r)$ entirely in the radial equation. Every central potential has the same $Y_\ell^m$; only $R(r)$ and the energies differ.`),
          L(4, 'one twist'),
          P({
            title: 'A long box',
            q: md`A box has sides $a$, $a$ and $2a$. In units of $\dfrac{\pi^2\hbar^2}{2ma^2}$: the ground-state energy, the first excited energy, and the energy of the **lowest degenerate** level.`,
            parts: [{ lbl: 'E_1', ans: 2.25 }, { lbl: 'E_2', ans: 3 }, { lbl: 'E_{\\text{deg}}', ans: 5.25 }],
            hints: [md`$E \propto n_x^2 + n_y^2 + n_z^2/4$.`, md`Only $x \leftrightarrow y$ is a symmetry now.`],
            sol: md`$(1,1,1)$: $2.25$. Next, put the cheap quantum into the long direction: $(1,1,2)$: $3$; then $(1,1,3)$: $4.25$. The first level that uses $n_x$ or $n_y$ is $(2,1,1)$ and $(1,2,1)$: $5.25$, twofold. Stretching the box broke the cube's symmetry down to the $x \leftrightarrow y$ swap, and the degeneracy dropped from 3 to 2.`,
          }),
          Q(md`For the 3D oscillator, is $\psi = (x + iy)e^{-r^2/2b^2}$ a stationary state?`,
            [md`Yes: it is a combination of degenerate $N = 1$ states, so $E = \tfrac52\hbar\omega$`, 'No: it is a superposition of two different states', 'No: it is complex', md`Yes, with $E = \tfrac32\hbar\omega$`], 0,
            [null, 'A superposition of states with the same energy is still an energy eigenstate.', 'Stationary states can be complex (e^{ikx} is).', md`$\tfrac32\hbar\omega$ is $N = 0$; $x$ and $y$ times the Gaussian are $N = 1$.`],
            md`$xe^{-r^2/2b^2}$ and $ye^{-r^2/2b^2}$ are both $N = 1$ ($E = \tfrac52\hbar\omega$). Any combination is too. This particular one has $L_z = +\hbar$ (Topic 19): $x + iy = r\sin\theta\,e^{i\phi}$.`),
          L(5, 'exam level'),
          P({
            title: 'Symmetric and accidental',
            q: md`Cubic box: the degeneracy of the level $n_x^2 + n_y^2 + n_z^2 = 14$, and of the level $27$.`,
            parts: [{ lbl: 'g_{14}', ans: 6 }, { lbl: 'g_{27}', ans: 4 }],
            hints: [md`$14 = 1 + 4 + 9$. $27 = 9 + 9 + 9 = 25 + 1 + 1$.`],
            sol: md`$(1,2,3)$ in all $3! = 6$ orders. $27$: $(3,3,3)$ once plus $(5,1,1)$ three ways: 4. The 6 is symmetry (permuting axes); the extra coincidence at 27 is accidental.`,
          }),
          P({
            title: 'Squashed oscillator',
            q: md`$V = \tfrac12m\omega^2(x^2 + y^2) + \tfrac12m(2\omega)^2z^2$. In units of $\hbar\omega$: the ground energy, and the degeneracy of the level at $4\hbar\omega$.`,
            parts: [{ lbl: 'E_0/\\hbar\\omega', ans: 2 }, { lbl: 'g(4\\hbar\\omega)', ans: 4 }],
            hints: [md`$E = \hbar\omega(n_x + n_y + 1) + 2\hbar\omega(n_z + \tfrac12)$.`],
            sol: md`Ground: $\hbar\omega + \hbar\omega = 2\hbar\omega$. $E = 4\hbar\omega$ needs $n_x + n_y + 2n_z = 2$: $(2,0,0)$, $(1,1,0)$, $(0,2,0)$ and $(0,0,1)$: 4 states. Only rotations about $z$ survive the squashing; the level mixes $n_z = 0$ and $n_z = 1$ by the accident $2\omega = 2\times\omega$.`,
          }),
          Q(md`Which degeneracy is **not** explained by a symmetry of the potential?`,
            [md`Cubic box, $n_x^2 + n_y^2 + n_z^2 = 27$: $(3,3,3)$ together with $(5,1,1)$`, md`Cubic box, $(2,1,1)$, $(1,2,1)$, $(1,1,2)$`, md`3D oscillator $N = 1$: $x$, $y$, $z$ times the Gaussian`, md`Any central potential: the $2\ell + 1$ values of $m$`], 0,
            [null, 'Those are rotations of one another by 90°.', 'Rotations of one another: a single ℓ = 1 multiplet.', 'Rotational symmetry is exactly what produces 2ℓ + 1.'],
            md`No rotation or reflection of the cube maps $(3,3,3)$ to $(5,1,1)$; the energies coincide by arithmetic.`),
          L(6, 'harder than the exam'),
          P({
            title: 'The average distance',
            q: md`For $P(r) = \dfrac{4}{\sqrt\pi\,b^3}r^2e^{-r^2/b^2}$ (the 3D oscillator ground state), find $\langle r\rangle/b$ and the probability that $r > b$.`,
            parts: [{ lbl: '\\langle r\\rangle/b', ans: 2 / Math.sqrt(Math.PI) }, { lbl: 'P(r > b)', ans: 0.5724 }],
            hints: [md`$\int_0^\infty r^3e^{-r^2/b^2}dr = b^4/2$.`, md`$\int_0^1u^2e^{-u^2}du = \tfrac{\sqrt\pi}{4}\text{erf}(1) - \tfrac{1}{2e}$, $\text{erf}(1) = 0.8427$.`],
            sol: md`$\langle r\rangle = \tfrac{4}{\sqrt\pi b^3}\cdot\tfrac{b^4}{2} = \tfrac{2b}{\sqrt\pi} = 1.128b$: a bit beyond the peak, pulled out by the tail. $P(r < b) = \text{erf}(1) - \tfrac{2}{\sqrt\pi e} = 0.8427 - 0.4151 = 0.4276$, so $P(r > b) = 0.572$.`,
          }),
          Q(md`For the 3D oscillator, $\psi = xyz\,e^{-r^2/2b^2}$. Its energy and angular momentum are…`,
            [md`$\tfrac92\hbar\omega$, pure $\ell = 3$`, md`$\tfrac92\hbar\omega$, a mixture of $\ell = 1$ and $\ell = 3$`, md`$\tfrac52\hbar\omega$, $\ell = 1$`, md`$\tfrac32\hbar\omega$, $\ell = 0$`], 0,
            [null, md`That is what happens for $x^3$ or $xr^2$-type pieces. $xyz$ has $\nabla^2(xyz) = 0$: no hidden $r^2$ factor, so no lower $\ell$.`, md`$n_x = n_y = n_z = 1$: $N = 3$.`, 'That is the ground state.'],
            md`$x$, $y$, $z$ times the Gaussian each carry one quantum: $N = 3$, $E = \tfrac92\hbar\omega$. A homogeneous polynomial of degree 3 with zero Laplacian is $r^3$ times pure $\ell = 3$ angular functions. (The $N = 3$ level holds $\ell = 3$ and $\ell = 1$: $7 + 3 = 10$ states.)`),
          Q(md`Which step of the classical reduction of a central-force problem survives in quantum mechanics?`,
            [md`Fixing $|\vb L|$: $\hat L^2$ is sharp and gives the centrifugal term $\hbar^2\ell(\ell+1)/2mr^2$`, md`Fixing the orbital plane: all three $L_i$ are sharp`, 'Both steps', 'Neither: the quantum problem stays three-dimensional'], 0,
            [null, md`That needs $L_x$, $L_y$, $L_z$ sharp together, and they do not commute.`, md`The plane needs the direction of $\vb L$; only one component can be sharp.`, md`$\hat L^2$ commutes with $\hat H$ for $V(r)$, so the radial reduction works.`],
            md`$[\hat H, \hat L^2] = 0$ keeps the 2D → 1D step. $[\hat L_x, \hat L_y] = i\hbar\hat L_z \ne 0$ kills the 3D → 2D step: one sharp component and a probability distribution over directions, $|Y_\ell^m|^2$.`),
          RF(md`
            ### The level diagram behind the last questions

            The 3D oscillator sorted by $\ell$ (numbers are $2\ell + 1$, the states in each multiplet). Rotational symmetry explains each short line; it does not explain why lines in different columns sit at the same height.

            [[fig:osc]]
          `, { osc: { svg: osc3d, cap: '3D oscillator: level $N$ holds $\\ell = N, N-2, \\ldots$ Each line is one $\\ell$ multiplet of $2\\ell + 1$ states; $g_N = 1, 3, 6, 10$.' } }),
          R(md`
            ### Exam-style problem

            Midterm 1 format: one setup, four parts, 5 points each, graded with a rubric. Write the reasoning, not just the result.
          `),
          paper('Exam-style problem · Topic 17', md`
            **The isotropic oscillator in three dimensions** [20 points, 5 per part]

            A particle of mass $m$ moves in $V(\vb r) = \tfrac12m\omega^2r^2 = \tfrac12m\omega^2(x^2 + y^2 + z^2)$. The 1D oscillator has $E_n = \hbar\omega(n + \tfrac12)$, $\psi_0(x) \propto e^{-x^2/2b^2}$, $\psi_1(x) \propto xe^{-x^2/2b^2}$, with $b = \sqrt{\hbar/m\omega}$. You may use $\hat L_z = -i\hbar\,\partial/\partial\phi$.
          `, [
            {
              q: md`**(a)** Explain why the stationary states are products $\psi_{n_x}(x)\psi_{n_y}(y)\psi_{n_z}(z)$ and why their energies add. Give the energies and degeneracies of the three lowest levels.`,
              ans: md`$E = \hbar\omega(N + \tfrac32)$, $N = n_x + n_y + n_z$; levels $\tfrac32\hbar\omega$ (1), $\tfrac52\hbar\omega$ (3), $\tfrac72\hbar\omega$ (6).`,
              sol: md`
                **How to see it.** The potential is a sum of three 1D oscillators that do not talk to each other, so each direction does its own thing.

                $\hat H = \hat H_x + \hat H_y + \hat H_z$ with $\hat H_x = \tfrac{\hat p_x^2}{2m} + \tfrac12m\omega^2x^2$, etc. Substituting $\psi = X(x)Y(y)Z(z)$ and dividing by $\psi$ gives $\tfrac{\hat H_xX}{X} + \tfrac{\hat H_yY}{Y} + \tfrac{\hat H_zZ}{Z} = E$; each term depends on one variable, so each is a constant: $X = \psi_{n_x}$ etc. and $E = E_{n_x} + E_{n_y} + E_{n_z} = \hbar\omega(N + \tfrac32)$. Degeneracy: number of $(n_x, n_y, n_z)$ with sum $N$: $N = 0$: 1; $N = 1$: 3; $N = 2$: 6 ($(2,0,0)$ ×3, $(1,1,0)$ ×3).

                **Rubric**
                - 5: separation argued (sum of commuting 1D Hamiltonians or the divide-by-$\psi$ argument), energies and all three degeneracies.
                - 4: one degeneracy wrong (usually 5 instead of 6 for $N = 2$), or the "why" only asserted.
                - 3: energies right, degeneracies missing or wrong, no argument.
                - 2: energies multiplied, or a 1D spectrum used.
                - 1: little beyond the potential.
              `,
            },
            {
              q: md`**(b)** The ground state is $\psi \propto e^{-r^2/2b^2}$. Where is the probability **density** largest? What is the most probable **distance** from the origin? Explain why the two answers differ, and sketch both as functions of $r$.`,
              ans: md`Density: largest at $r = 0$. Most probable distance: $r = b$. The shell volume $4\pi r^2dr$ vanishes at the origin.`,
              sol: md`
                **How to see it.** "Most probable distance" asks about a whole shell of radius $r$, whose volume grows like $r^2$.

                $|\psi|^2 \propto e^{-r^2/b^2}$ is maximal at $r = 0$. The probability of being between $r$ and $r + dr$ is $4\pi r^2|\psi|^2dr \propto r^2e^{-r^2/b^2}dr$, zero at $r = 0$ (no volume there) and maximal where $2r - 2r^3/b^2 = 0$: $r = b$. Sketch: a Gaussian starting at its maximum at $r = 0$; a hump starting at zero like $r^2$, peaking at $b$, and decaying (the figure at the top of this lesson).

                **Rubric**
                - 5: both answers, the shell-volume explanation, both sketches with the right features (max at 0; zero at 0, peak at $b$).
                - 4: one sketch wrong or the explanation only "because of $r^2$" without saying what $r^2$ is.
                - 3: both numbers, no explanation or no sketch.
                - 2: claims the most probable distance is 0.
                - 1: density only.
              `,
            },
            {
              q: md`**(c)** The $N = 1$ states are $x$, $y$ and $z$ times $e^{-r^2/2b^2}$. Find the combination with definite $L_z = +\hbar$. Without computing any derivative of $\theta$, explain why all three $N = 1$ states have $\ell = 1$.`,
              ans: md`$(x + iy)e^{-r^2/2b^2} = r\sin\theta\,e^{i\phi}e^{-r^2/2b^2}$. The three states are rotations of one another: one multiplet of $3 = 2\ell + 1$ states, so $\ell = 1$.`,
              sol: md`
                **How to see it.** $L_z$ only sees the $\phi$ dependence; $e^{im\phi}$ has $L_z = m\hbar$.

                $x + iy = r\sin\theta(\cos\phi + i\sin\phi) = r\sin\theta\,e^{i\phi}$, and $-i\hbar\partial_\phi e^{i\phi} = \hbar e^{i\phi}$: $L_z = +\hbar$. (Likewise $x - iy$ has $-\hbar$ and $z = r\cos\theta$ has 0.) For $\ell$: the angular parts $x/r$, $y/r$, $z/r$ are turned into one another by rotations, and rotations do not change $\ell$, so the three states form one multiplet; a multiplet has $2\ell + 1$ members, so $\ell = 1$. (Equivalently: $z/r \propto Y_1^0$ and $(x \pm iy)/r \propto Y_1^{\pm1}$, Topic 19.)

                **Rubric**
                - 5: $x + iy$ with the $e^{i\phi}$ argument, and a correct reason for $\ell = 1$ (multiplet/rotation or identification with $Y_1^m$).
                - 4: combination right, reason for $\ell = 1$ vague ("it's a p state").
                - 3: combination right, no argument for $\ell$; or $\ell$ argued but $x - iy$ given.
                - 2: picks $x$ (real functions have $\langle L_z\rangle = 0$).
                - 1: little progress.
              `,
            },
            {
              q: md`**(d)** True or false? Justify briefly. "Because $V$ depends only on $r$, all states of one energy level have the same $\ell$, so every level of this potential is $(2\ell + 1)$-fold degenerate."`,
              ans: md`False. $N = 2$ has 6 states: $\ell = 0$ (1 state) and $\ell = 2$ (5 states) at the same energy.`,
              sol: md`
                **How to see it.** Rotational symmetry guarantees that each $\ell$ comes as a complete $(2\ell + 1)$-multiplet. It says nothing about whether two different multiplets land at the same energy.

                Counterexample: $N = 2$ has 6 states, and 6 is not of the form $2\ell + 1$. The combination $(x^2 + y^2 + z^2)$-type (times the Gaussian, made orthogonal to the ground state: $(2r^2/b^2 - 3)e^{-r^2/2b^2}$) depends on $r$ only, so it has $\ell = 0$; the other five ($xy$, $yz$, $zx$, $x^2 - y^2$, $2z^2 - x^2 - y^2$) form $\ell = 2$. Two multiplets at one energy: an accidental degeneracy (the oscillator has a hidden symmetry beyond rotations). Hydrogen does the same (Topic 21).

                **Rubric**
                - 5: False, with a concrete counterexample ($N = 2$: 6 = 1 + 5) or the "symmetry gives at least, not exactly" argument.
                - 4: False with a sound but vague argument.
                - 3: False, reason only "the oscillator is special".
                - 2: reasoning attempt pointing the wrong way.
                - 1: correct verdict, no justification.
              `,
            },
          ]),
          R(md`
            ### Endless practice

            Fresh numbers every time. Three correct answers complete each card.
          `),
          G('m2_osc3d'),
          G('m2_box3d'),
          R(md`**Where this shows up:** [Discussion 8](#/l/disc8) (3D oscillator, spherical box), [Homework 7](#/l/hw7). Next: the angular part, once and for all.`),
        ],
        bank: [
          Q(md`The volume element in spherical coordinates is…`, [md`$r^2\sin\theta\,dr\,d\theta\,d\phi$`, md`$dr\,d\theta\,d\phi$`, md`$r\,dr\,d\theta\,d\phi$`, md`$r^2\,dr\,d\theta\,d\phi$`], 0,
            [null, 'Missing the Jacobian.', 'That is 2D polar (times dz).', md`Missing $\sin\theta$: the shells near the poles are smaller.`], md`$d^3r = r^2dr\,d\Omega$, $d\Omega = \sin\theta\,d\theta\,d\phi$, $\int d\Omega = 4\pi$.`),
          Q(md`The degeneracy of the 3D oscillator level $N = 2$ is…`, ['6', '5', '3', '9'], 0,
            [null, 'That would be a single ℓ = 2 multiplet; there is also an ℓ = 0 state.', 'That is N = 1.', md`That is hydrogen's $n = 3$.`], md`$(2,0,0)$ ×3 and $(1,1,0)$ ×3.`),
          Q(md`The ground state of a cubic box is…`, ['non-degenerate', 'threefold degenerate', 'sixfold degenerate', 'infinitely degenerate'], 0,
            [null, md`$(1,1,1)$ is the only way to get 3.`, 'No.', 'No.'], md`Only $(1,1,1)$ has $n_x^2 + n_y^2 + n_z^2 = 3$.`),
          Q(md`The zero-point energy of the 3D isotropic oscillator is…`, [md`$\tfrac32\hbar\omega$`, md`$\tfrac12\hbar\omega$`, '0', md`$3\hbar\omega$`], 0,
            [null, 'That is one direction.', 'Each direction has ħω/2 of zero-point energy.', 'Too much.'], md`$\tfrac12\hbar\omega$ per direction.`),
          Q(md`Why are spherical coordinates used for $V(r)$?`, ['Because the angular equation then contains no V, so the angles are solved once for every central potential', 'Because Cartesian coordinates give wrong energies', 'Because r is always an integer', 'Because the wavefunction must vanish at the poles'], 0,
            [null, 'Any correct method gives the same energies; spherical coordinates make the problem separable.', 'No.', 'No such requirement.'], md`$V(r)$ only enters the radial equation.`),
          Q(md`For a spherically symmetric state with $|\psi|^2$ decreasing monotonically in $r$, the most probable distance from the origin is…`, ['greater than zero', 'zero', 'infinite', 'undefined'], 0,
            [null, md`The shell factor $r^2$ vanishes at $r = 0$.`, 'Only if the decay were infinitely fast.', 'It is the maximum of r²|ψ|².'], md`$P(r) = 4\pi r^2|\psi|^2$ starts at 0 and must rise before it falls.`),
          Q(md`Two different states have the same energy. A measurement of $\hat H$…`, ['cannot tell them apart', 'always tells them apart', 'collapses them into one state', 'gives a different energy for each'], 0,
            [null, 'Both give the same E.', 'A measurement of H projects onto the whole degenerate subspace.', 'They are degenerate.'], md`To distinguish them, measure an observable that commutes with $\hat H$ and separates them ($L^2$, $L_z$).`),
        ],
      },

      // ================================================================== Topic 18
      {
        id: 't18-Lalgebra', topic: 18, title: 'Angular momentum: commutators, the ladder, the vector model', ref: 'Griffiths 4.3.1 · Lecture 12, HW 7',
        steps: [
          RF(md`
            ### The picture

            Classically $\vb L = \vb r\times\vb p$ is an arrow: three definite numbers. In quantum mechanics its components are operators, and they do not commute:
            $$[\hat L_x, \hat L_y] = i\hbar\hat L_z,\qquad [\hat L_y, \hat L_z] = i\hbar\hat L_x,\qquad [\hat L_z, \hat L_x] = i\hbar\hat L_y,\qquad [\hat L^2, \hat L_i] = 0$$
            Everything in this lesson follows from these four lines.

            1. $\hat L^2$ commutes with every component, so $L^2$ and **one** component (call it $z$) can be sharp together. The states are labeled $\ket{\ell, m}$.
            2. No two components can be sharp at once, except in the trivial $\ell = 0$ state where every component is 0.
            3. The values are quantized: $L^2 = \hbar^2\ell(\ell+1)$ and $L_z = m\hbar$ with $m = -\ell, \ldots, \ell$ ($2\ell + 1$ values).

            **The vector model.** Picture an arrow of length $\hbar\sqrt{\ell(\ell+1)}$ whose $z$-component is exactly $m\hbar$ and whose $x$ and $y$ components are completely uncertain: the arrow is smeared around a cone. Since $|m| \le \ell < \sqrt{\ell(\ell+1)}$, it never points exactly along $z$: even at the top of the ladder, $\langle L_x^2 + L_y^2\rangle = \hbar^2[\ell(\ell+1) - \ell^2] = \hbar^2\ell > 0$.

            [[fig:cone]]

            !!intuition Why the components can't commute
              $\hat L_z = -i\hbar\,\partial_\phi$ generates rotations about $z$ the way $\hat p$ generates translations. Rotations about different axes do not commute: turn a book 90° about $x$ then $y$, and compare with $y$ then $x$. Translations do commute, which is why $[\hat p_x, \hat p_y] = 0$. The commutator $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ is the quantum shadow of that fact.

            ### The commutators, from $[\hat r_i, \hat p_j] = i\hbar\delta_{ij}$

            $\hat L_x = y\hat p_z - z\hat p_y$, $\hat L_y = z\hat p_x - x\hat p_z$, $\hat L_z = x\hat p_y - y\hat p_x$. Then (Lecture 12)
            $$[\hat L_x, \hat L_y] = [y\hat p_z - z\hat p_y,\ z\hat p_x - x\hat p_z] = y[\hat p_z, z]\hat p_x + x\hat p_y[z, \hat p_z] = -i\hbar y\hat p_x + i\hbar x\hat p_y = i\hbar\hat L_z$$
            (the other two cross terms commute: they share no coordinate–momentum pair). With $[AB, C] = A[B, C] + [A, C]B$:
            $$[\hat L^2, \hat L_x] = \hat L_y[\hat L_y, \hat L_x] + [\hat L_y, \hat L_x]\hat L_y + \hat L_z[\hat L_z, \hat L_x] + [\hat L_z, \hat L_x]\hat L_z = -i\hbar(\hat L_y\hat L_z + \hat L_z\hat L_y) + i\hbar(\hat L_z\hat L_y + \hat L_y\hat L_z) = 0$$
            With coordinates (HW 7, Problem 2):
            $$[\hat L_z, x] = i\hbar y,\quad [\hat L_z, y] = -i\hbar x,\quad [\hat L_z, z] = 0,\quad\text{same pattern for } \hat p_x, \hat p_y, \hat p_z$$
            So $[\hat L_z, x^2 + y^2] = x(i\hbar y) + (i\hbar y)x + y(-i\hbar x) + (-i\hbar x)y = 0$, and the same for $\hat p^2$: $\hat L_z$ (and by symmetry every $\hat L_i$) commutes with $r^2$, $\hat p^2$, and any $V(r)$.

            !!key For any central potential
              $\{\hat H, \hat L^2, \hat L_z\}$ all commute: stationary states can be labeled $\ket{n\,\ell\,m}$, and $\langle\vb L\rangle$ is conserved. In Ehrenfest form (HW 7, Problem 3): $\tfrac{d}{dt}\langle\vb L\rangle = \langle\vb r\times(-\nabla V)\rangle$, the torque, which vanishes when $-\nabla V$ points along $\hat{\vb r}$.

            !!intuition A rule of thumb for $\hat L_z$
              $\hat L_z$ commutes with anything unchanged by rotations about $z$ ($z$, $r^2$, $p^2$, $p_z$, $x^2 + y^2$, $V(r)$), and it "rotates" the $xy$ plane: $[\hat L_z, x \pm iy] = \pm\hbar(x \pm iy)$. Multiplying a state by $x + iy$ raises $m$ by one.
          `, { cone: { svg: cone(), cap: 'Vector model for $\\ell = 2$: length $\\sqrt6\\,\\hbar$, $L_z = m\\hbar$ sharp, $L_x$ and $L_y$ smeared around the cone (dashed circle for $m = 2$).' } }),
          R(md`
            ### The ladder (the oscillator trick again)

            Define $\hat L_\pm = \hat L_x \pm i\hat L_y$. They are not Hermitian: $(\hat L_+)^\dagger = \hat L_-$ (HW 7, Problem 1). From the commutators,
            $$[\hat L_z, \hat L_\pm] = \pm\hbar\hat L_\pm,\qquad [\hat L^2, \hat L_\pm] = 0$$
            So if $\hat L_zf = m\hbar f$, then $\hat L_z(\hat L_\pm f) = \hat L_\pm\hat L_zf \pm \hbar\hat L_\pm f = (m \pm 1)\hbar(\hat L_\pm f)$, with the same $L^2$. The ladder operators climb the $m$ rungs at fixed $\ell$.

            **The ladder has to stop.** $L^2 - L_z^2 = L_x^2 + L_y^2 \ge 0$, so $m$ is bounded. At the top rung $\hat L_+f_{\text{top}} = 0$. Use
            $$\hat L_\mp\hat L_\pm = \hat L^2 - \hat L_z^2 \mp \hbar\hat L_z$$
            on the top state: $0 = \hat L_-\hat L_+f_{\text{top}} = \hbar^2\left[\lambda - m_{\text{top}}^2 - m_{\text{top}}\right]f_{\text{top}}$, so the $L^2$ eigenvalue is $\hbar^2\ell(\ell+1)$ with $\ell \equiv m_{\text{top}}$. The same at the bottom gives $m_{\text{bot}} = -\ell$. Going from $-\ell$ to $\ell$ in whole steps needs $2\ell$ to be an integer. For orbital angular momentum $\ell$ is a whole number (the wavefunction must be single-valued in $\phi$: Topic 19).

            **Normalizing the rungs** (HW 7, Problem 1): $\|\hat L_+f_\ell^m\|^2 = \bra{f}\hat L_-\hat L_+\ket f = \hbar^2[\ell(\ell+1) - m(m+1)]$, so
            $$\hat L_\pm f_\ell^m = \hbar\sqrt{\ell(\ell+1) - m(m\pm1)}\;f_\ell^{m\pm1}$$
            At the top ($m = \ell$) the $\hat L_+$ coefficient is $\sqrt{\ell(\ell+1) - \ell(\ell+1)} = 0$ automatically. Compare $\hat a_+\ket n = \sqrt{n+1}\ket{n+1}$: same idea, different square roots.

            ### $\ell = 1$ as $3\times3$ matrices

            Basis $\ket{1,1}, \ket{1,0}, \ket{1,-1}$. The only nonzero raising elements are $\hat L_+\ket{1,0} = \sqrt2\hbar\ket{1,1}$ and $\hat L_+\ket{1,-1} = \sqrt2\hbar\ket{1,0}$:
            $$L_z = \hbar\begin{pmatrix}1&0&0\\0&0&0\\0&0&-1\end{pmatrix},\quad L_x = \frac{L_+ + L_-}{2} = \frac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix},\quad L_y = \frac{L_+ - L_-}{2i} = \frac{\hbar}{\sqrt2}\begin{pmatrix}0&-i&0\\i&0&-i\\0&i&0\end{pmatrix}$$
            $L_x$ has eigenvalues $\hbar, 0, -\hbar$, exactly like $L_z$: nothing is special about $z$; we just chose it.

            **Expectation values in $\ket{\ell, m}$.** $\langle L_x\rangle = \langle L_y\rangle = 0$, because $\hat L_\pm$ shift $m$ and the shifted state is orthogonal to the original. By symmetry about $z$, $\langle L_x^2\rangle = \langle L_y^2\rangle = \tfrac12\langle L^2 - L_z^2\rangle$:
            $$\langle L_x^2\rangle = \langle L_y^2\rangle = \frac{\hbar^2}{2}\left[\ell(\ell+1) - m^2\right]$$

            ### Worked example

            !!graded Problem
              A particle with $\ell = 1$ is in $\ket\psi = \tfrac{1}{\sqrt2}\left(\ket{1,1} + \ket{1,0}\right)$. Find $\langle L_z\rangle$, $\langle L_x\rangle$, $\langle L_y\rangle$ and compare $|\langle\vb L\rangle|$ with $|\vb L| = \sqrt2\,\hbar$.

            **$L_z$:** $\tfrac12(\hbar) + \tfrac12(0) = \tfrac\hbar2$.

            **$L_x$:** $\hat L_x\ket{1,1} = \tfrac{\hbar}{\sqrt2}\ket{1,0}$ and $\hat L_x\ket{1,0} = \tfrac{\hbar}{\sqrt2}\left(\ket{1,1} + \ket{1,-1}\right)$. So $\hat L_x\ket\psi = \tfrac{\hbar}{2}\left(\ket{1,0} + \ket{1,1} + \ket{1,-1}\right)$, and $\langle L_x\rangle = \tfrac{1}{\sqrt2}\cdot\tfrac\hbar2(1 + 1) = \tfrac{\hbar}{\sqrt2}$.

            **$L_y$:** $\hat L_y\ket{1,1} = \tfrac{i\hbar}{\sqrt2}\ket{1,0}$ and $\hat L_y\ket{1,0} = -\tfrac{i\hbar}{\sqrt2}\left(\ket{1,1} - \ket{1,-1}\right)$, so $\langle L_y\rangle = \tfrac12\left(\tfrac{i\hbar}{\sqrt2} - \tfrac{i\hbar}{\sqrt2}\right) = 0$.

            **Picture.** $\langle\vb L\rangle = \hbar\left(\tfrac{1}{\sqrt2}, 0, \tfrac12\right)$, length $0.87\hbar$, well short of $\sqrt2\hbar = 1.41\hbar$. The average vector is shorter than the arrow because the components fluctuate and partly average out. (The real relative phase between the two terms tilted it toward $x$; a relative phase $i$ would tilt it toward $y$.)

            !!mistake Common mistakes
              - $L^2 = \hbar^2\ell^2$. It is $\hbar^2\ell(\ell+1)$: $2\hbar^2$ for $\ell = 1$, $6\hbar^2$ for $\ell = 2$.
              - "At $m = \ell$ the angular momentum points along $z$." Then all three components would be sharp. It sits on the narrowest cone, angle $\cos^{-1}\tfrac{\ell}{\sqrt{\ell(\ell+1)}}$.
              - Reading $[\hat L_x, \hat L_y] \ne 0$ as "$\sigma_{L_x}\sigma_{L_y} > 0$ always". The bound is $\tfrac\hbar2|\langle L_z\rangle|$, state-dependent; for $\ell = 0$ it is 0 and both spreads are 0.
              - Treating $\hat L_\pm$ as observables. They are not Hermitian; $L_x = \tfrac12(L_+ + L_-)$ is.
              - Letting $\hat L_\pm$ change $\ell$. They commute with $\hat L^2$.
              - Sign slip in $\hat L_-$: the coefficient is $\sqrt{\ell(\ell+1) - m(m-1)}$.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`A particle has $\ell = 2$. The possible results of measuring $L_z$ are…`,
            [md`$-2\hbar, -\hbar, 0, \hbar, 2\hbar$`, md`$0, \hbar, 2\hbar$`, md`$\pm\sqrt6\,\hbar$`, md`any value between $-\sqrt6\,\hbar$ and $\sqrt6\,\hbar$`], 0,
            [null, 'Negative m are just as allowed.', md`$\sqrt6\,\hbar$ is the length $|\vb L|$, not a component.`, 'Lz is quantized.'],
            md`$m = -\ell, \ldots, \ell$: five values.`),
          Q(md`Which pair can be sharp at the same time (for $\ell \ge 1$)?`,
            [md`$L^2$ and $L_z$`, md`$L_x$ and $L_y$`, md`$L_z$ and $x$`, md`$L_x$ and $L_z$`], 0,
            [null, md`$[\hat L_x, \hat L_y] = i\hbar\hat L_z$.`, md`$[\hat L_z, x] = i\hbar y$.`, md`$[\hat L_z, \hat L_x] = i\hbar\hat L_y$.`],
            md`$[\hat L^2, \hat L_z] = 0$: a common eigenbasis $\ket{\ell, m}$.`),
          L(2, 'set up'),
          P({
            title: 'From L² to the ladder',
            q: md`A measurement of $L^2$ gives $12\hbar^2$. What is $\ell$, and how many different results can a following measurement of $L_z$ give?`,
            parts: [{ lbl: '\\ell', ans: 3 }, { lbl: '\\#\\,L_z\\text{ values}', ans: 7 }],
            hints: [md`$\ell(\ell+1) = 12$.`],
            sol: md`$\ell = 3$; $m = -3, \ldots, 3$: 7 values.`,
          }),
          P({
            title: 'One rung up',
            q: md`$\hat L_+\ket{2, 0} = c\,\ket{2, 1}$. Find $c$ in units of $\hbar$.`,
            parts: [{ lbl: 'c/\\hbar', ans: Math.sqrt(6) }],
            hints: [md`$\sqrt{\ell(\ell+1) - m(m+1)}$.`],
            sol: md`$\sqrt{6 - 0} = \sqrt6 = 2.45$.`,
          }),
          Q(md`$(\hat L_+)^\dagger = $`, [md`$\hat L_-$`, md`$\hat L_+$`, md`$-\hat L_+$`, md`$\hat L_x$`], 0,
            [null, md`$\hat L_+$ is not Hermitian: it raises $m$, its adjoint lowers it.`, 'No.', 'No.'],
            md`$(\hat L_x + i\hat L_y)^\dagger = \hat L_x - i\hat L_y$ since $\hat L_x$, $\hat L_y$ are Hermitian and $i^* = -i$.`),
          L(3, 'standard'),
          P({
            title: 'The narrowest cone',
            q: md`For $\ell = 3$: the length $|\vb L|$ in units of $\hbar$, and the smallest angle (degrees) that $\vb L$ can make with the $z$ axis in the vector model.`,
            parts: [{ lbl: '|\\vec L|/\\hbar', ans: Math.sqrt(12) }, { lbl: '\\theta_{\\min}', ans: 30, unit: '°' }],
            hints: [md`$\cos\theta = m/\sqrt{\ell(\ell+1)}$ with $m = \ell$.`],
            sol: md`$\sqrt{12} = 3.46$; $\cos\theta = 3/\sqrt{12} = 0.866$, $\theta = 30°$. The cone narrows as $\ell$ grows (classical limit) but never closes.`,
          }),
          P({
            title: 'Spread of Lx',
            q: md`In the state $\ket{\ell = 2, m = 1}$, find $\langle L_x^2\rangle$ in units of $\hbar^2$, and $\langle L_x\rangle$.`,
            parts: [{ lbl: '\\langle L_x^2\\rangle/\\hbar^2', ans: 2.5 }, { lbl: '\\langle L_x\\rangle', ans: 0 }],
            hints: [md`$\langle L_x^2\rangle = \tfrac{\hbar^2}{2}[\ell(\ell+1) - m^2]$.`],
            sol: md`$\tfrac12(6 - 1) = 2.5$. $\langle L_x\rangle = 0$: $\hat L_\pm$ move $\ket{2,1}$ to $\ket{2,2}$ or $\ket{2,0}$, orthogonal to $\ket{2,1}$.`,
          }),
          Q(md`$[\hat L_z, x + iy] = \hbar(x + iy)$ means…`,
            [md`multiplying an $L_z$ eigenstate by $x + iy$ raises $m$ by one`, md`$x + iy$ is an eigenfunction of $\hat L^2$ with eigenvalue $\hbar$`, md`$x$ and $y$ commute with $\hat L_z$`, md`$L_z$ and $x$ can be sharp together`], 0,
            [null, 'It says how Lz acts on a product, not that x + iy is an eigenfunction of L².', md`$[\hat L_z, x] = i\hbar y \ne 0$.`, 'They do not commute.'],
            md`$\hat L_z(x + iy)f = (x + iy)\hat L_zf + \hbar(x + iy)f = (m + 1)\hbar(x + iy)f$. Same algebra as $[\hat L_z, \hat L_+] = \hbar\hat L_+$.`),
          L(4, 'one twist'),
          Q(md`Can any state have $\sigma_{L_x} = \sigma_{L_y} = \sigma_{L_z} = 0$?`,
            [md`Yes, only $\ell = 0$, where every component is exactly 0`, 'No: the commutators forbid it', md`Yes: any $\ket{\ell, \ell}$`, md`Yes: any state with $\langle L_z\rangle = 0$`], 0,
            [null, md`The bound is $\tfrac\hbar2|\langle L_z\rangle|$, which is 0 when $\ell = 0$.`, md`$\langle L_x^2\rangle = \hbar^2\ell/2 > 0$ there.`, md`E.g. $\ket{1,0}$ has $\sigma_{L_x} = \hbar$.`],
            md`If $\psi$ is an eigenstate of two components, the commutators force all eigenvalues to 0 and $L^2\psi = 0$: $\ell = 0$ (Discussion 7, 1(a)).`),
          P({
            title: 'A p orbital along y',
            q: md`$\ket\psi = \tfrac{1}{\sqrt2}\left(\ket{1,1} + \ket{1,-1}\right)$. Find $\langle L_z^2\rangle$, $\langle L_x^2\rangle$ and $\langle L_y^2\rangle$ in units of $\hbar^2$.`,
            parts: [{ lbl: '\\langle L_z^2\\rangle', ans: 1 }, { lbl: '\\langle L_x^2\\rangle', ans: 1 }, { lbl: '\\langle L_y^2\\rangle', ans: 0 }],
            hints: [md`$\hat L_x\ket\psi = \hbar\ket{1,0}$.`, md`The three must add to $\ell(\ell+1) = 2$.`],
            sol: md`$L_z = \pm\hbar$ only: $\langle L_z^2\rangle = \hbar^2$. $\hat L_x\ket{1,\pm1} = \tfrac{\hbar}{\sqrt2}\ket{1,0}$, so $\hat L_x\ket\psi = \hbar\ket{1,0}$ and $\langle L_x^2\rangle = \|\hat L_x\psi\|^2 = \hbar^2$. Then $\langle L_y^2\rangle = 2 - 1 - 1 = 0$. This state is $\propto y/r$ (a $p_y$ orbital): it has $L_y = 0$ exactly, the way $Y_1^0 \propto z/r$ has $L_z = 0$.`,
          }),
          L(5, 'exam level'),
          P({
            title: 'Saturating the bound',
            q: md`In $\ket{\ell, m}$, $\sigma_{L_x}\sigma_{L_y} = \tfrac{\hbar^2}{2}[\ell(\ell+1) - m^2]$. Evaluate it for $\ket{3, 1}$ (units $\hbar^2$), and the ratio of $\sigma_{L_x}\sigma_{L_y}$ to the bound $\tfrac\hbar2|\langle L_z\rangle|$ in $\ket{3, 3}$.`,
            parts: [{ lbl: '\\sigma_{L_x}\\sigma_{L_y}/\\hbar^2', ans: 5.5 }, { lbl: '\\text{ratio in }|3,3\\rangle', ans: 1 }],
            hints: [md`In $\ket{\ell, m}$, $\sigma_{L_x} = \sigma_{L_y}$ and the means are 0.`],
            sol: md`$\tfrac12(12 - 1) = 5.5$. In $\ket{3,3}$: $\tfrac12(12 - 9)\hbar^2 = \tfrac32\hbar^2$ and the bound is $\tfrac\hbar2\cdot3\hbar = \tfrac32\hbar^2$: ratio 1. The top of the ladder is the minimum-uncertainty state for $L_x$, $L_y$, the closest quantum analog of "pointing along $z$".`,
          }),
          Q(md`$\hat H = \tfrac{\hat p^2}{2m} + V(r) + \beta z$ (a central potential plus a uniform force along $-z$). Which components of $\langle\vb L\rangle$ are conserved?`,
            [md`only $\langle L_z\rangle$`, 'all three', 'none', md`$\langle L_x\rangle$ and $\langle L_y\rangle$`], 0,
            [null, md`$[\hat L_x, z] = -i\hbar y \ne 0$: the force along $z$ exerts torque about $x$ and $y$.`, md`$[\hat L_z, z] = 0$ and $[\hat L_z, V(r)] = 0$: $L_z$ survives.`, 'Backwards.'],
            md`Torque $\vb r\times(-\beta\hat z)$ has no $z$-component. Symmetry about the $z$ axis survives, so $L_z$ is conserved.`),
          Q(md`For $V(r)$, $\tfrac{d}{dt}\langle\vb L\rangle = 0$ because…`,
            [md`the torque $\vb r\times(-\nabla V)$ vanishes: $\nabla V$ points along $\hat{\vb r}$`, md`$\langle\vb L\rangle = 0$ in every state`, md`$\hat{\vb L}$ commutes with $\hat{\vb r}$`, md`$\hat{\vb L}$ commutes with $\hat{\vb p}$`], 0,
            [null, md`$\ket{1,1}$ has $\langle L_z\rangle = \hbar$.`, md`$[\hat L_z, x] = i\hbar y$.`, md`$[\hat L_z, \hat p_x] = i\hbar\hat p_y$.`],
            md`$\tfrac{d}{dt}\langle\vb L\rangle = \tfrac{i}{\hbar}\langle[\hat H, \hat{\vb L}]\rangle = \langle\vb r\times(-\nabla V)\rangle$ (HW 7, Problem 3), zero for a central force.`),
          L(6, 'harder than the exam'),
          P({
            title: 'Angular momentum along a tilted axis',
            q: md`For $\ell = 1$, find the largest eigenvalue of $\hat L_x + \hat L_z$ in units of $\hbar$.`,
            parts: [{ lbl: '\\lambda_{\\max}/\\hbar', ans: Math.SQRT2 }],
            hints: [md`$\hat L_x + \hat L_z = \sqrt2\,\hat{\vb n}\cdot\hat{\vb L}$ with $\hat{\vb n} = (1, 0, 1)/\sqrt2$.`],
            sol: md`$\hat{\vb n}\cdot\hat{\vb L}$ is the angular momentum along $\hat{\vb n}$: eigenvalues $\hbar, 0, -\hbar$ like any component. So $\hat L_x + \hat L_z$ has $\sqrt2\hbar, 0, -\sqrt2\hbar$. (Check with the matrix: trace 0, and $\det = 0$ by direct expansion.)`,
          }),
          Q(md`The ladder argument allows $\ell = \tfrac12, \tfrac32, \ldots$ Why are they excluded for **orbital** angular momentum?`,
            [md`$\hat L_z = -i\hbar\partial_\phi$ needs $e^{im\phi}$ single-valued, so $m$ (and $\ell$) are integers`, 'Half-integers violate the uncertainty principle', 'They give negative L²', md`$\hat L_+$ is undefined for half-integer $m$`], 0,
            [null, 'No.', md`$\hbar^2\tfrac12\cdot\tfrac32 > 0$.`, 'The algebra works fine; that is how spin ½ arises.'],
            md`$e^{im(\phi + 2\pi)} = e^{im\phi}$ forces $m \in \mathbb Z$, exactly like Midterm 1's ring problem. Half-integers come back as spin, which is not built from $\vb r\times\vb p$.`),
          Q(md`In $\ket{\ell, m}$, what is $\langle L_xL_y + L_yL_x\rangle$?`,
            ['0', md`$i\hbar\langle L_z\rangle$`, md`$\hbar^2\ell(\ell+1)$`, md`$m\hbar^2$`], 0,
            [null, md`That is $\langle[L_x, L_y]\rangle$, the difference, not the sum.`, 'No.', 'No.'],
            md`$L_xL_y + L_yL_x = \tfrac{1}{2i}(L_+^2 - L_-^2)$, which changes $m$ by $\pm2$: zero expectation value in an $L_z$ eigenstate.`),
          R(md`
            ### Exam-style problem
          `),
          paper('Exam-style problem · Topic 18', md`
            **Angular momentum without coordinates** [20 points, 5 per part]

            Use only $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ and its cyclic permutations, $[\hat L^2, \hat L_i] = 0$, $\hat L_\pm = \hat L_x \pm i\hat L_y$, and the states $\ket{\ell, m}$ with $\hat L^2\ket{\ell,m} = \hbar^2\ell(\ell+1)\ket{\ell,m}$, $\hat L_z\ket{\ell,m} = m\hbar\ket{\ell,m}$.
          `, [
            {
              q: md`**(a)** Show that $[\hat L_z, \hat L_\pm] = \pm\hbar\hat L_\pm$. Explain in words why $\hat L_+\ket{\ell, m}$ is either zero or an eigenstate of $\hat L_z$ with eigenvalue $(m+1)\hbar$ and the **same** $\ell$.`,
              ans: md`$[\hat L_z, \hat L_x \pm i\hat L_y] = i\hbar\hat L_y \pm\hbar\hat L_x = \pm\hbar\hat L_\pm$. Then $\hat L_z\hat L_+\ket{\ell,m} = (m+1)\hbar\hat L_+\ket{\ell,m}$; $[\hat L^2, \hat L_+] = 0$ keeps $\ell$.`,
              sol: md`
                **How to see it.** A commutator of the form $[\hat L_z, \hat A] = c\hat A$ means $\hat A$ shifts $L_z$ by $c$: the oscillator's $[\hat H, \hat a_\pm] = \pm\hbar\omega\hat a_\pm$ in new clothes.

                $[\hat L_z, \hat L_x] = i\hbar\hat L_y$ and $[\hat L_z, \hat L_y] = -i\hbar\hat L_x$, so $[\hat L_z, \hat L_x \pm i\hat L_y] = i\hbar\hat L_y \pm i(-i\hbar\hat L_x) = \pm\hbar(\hat L_x \pm i\hat L_y)$. Acting on $\ket{\ell,m}$: $\hat L_z\hat L_+\ket{\ell,m} = (\hat L_+\hat L_z + \hbar\hat L_+)\ket{\ell,m} = (m+1)\hbar\,\hat L_+\ket{\ell,m}$. Either $\hat L_+\ket{\ell,m} = 0$ (top of the ladder) or it is an eigenvector with $(m+1)\hbar$. Since $\hat L^2$ commutes with $\hat L_\pm$, $\hat L^2(\hat L_+\ket{\ell,m}) = \hbar^2\ell(\ell+1)\hat L_+\ket{\ell,m}$: same $\ell$.

                **Rubric**
                - 5: commutator derived, the eigenvalue shift shown, same-$\ell$ argued from $[\hat L^2, \hat L_+] = 0$, the zero case mentioned.
                - 4: one of: same-$\ell$ unjustified; zero case missing.
                - 3: commutator right, no explanation of what it implies.
                - 2: sign or factor errors that change the conclusion.
                - 1: definitions only.
              `,
            },
            {
              q: md`**(b)** In $\ket{\ell, m}$, find $\langle L_x\rangle$ and $\langle L_x^2\rangle$. Check the uncertainty relation $\sigma_{L_x}\sigma_{L_y} \ge \tfrac\hbar2|\langle L_z\rangle|$ and say for which $m$ it is an equality.`,
              ans: md`$\langle L_x\rangle = 0$; $\langle L_x^2\rangle = \tfrac{\hbar^2}{2}[\ell(\ell+1) - m^2]$. $\sigma_{L_x}\sigma_{L_y} = \tfrac{\hbar^2}{2}[\ell(\ell+1) - m^2] \ge \tfrac{\hbar^2}{2}|m|$; equality for $|m| = \ell$.`,
              sol: md`
                **How to see it.** $L_x$ is a mixture of a raising and a lowering operator; in a state of definite $m$ its average must vanish. The squares split $L^2 - L_z^2$ evenly between $x$ and $y$.

                $\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$ maps $\ket{\ell,m}$ to a combination of $\ket{\ell,m\pm1}$, orthogonal to $\ket{\ell,m}$: $\langle L_x\rangle = 0$ (same for $L_y$). $\langle L_x^2 + L_y^2\rangle = \langle L^2 - L_z^2\rangle = \hbar^2[\ell(\ell+1) - m^2]$; the state is symmetric under rotations about $z$, so the two are equal: $\langle L_x^2\rangle = \tfrac{\hbar^2}{2}[\ell(\ell+1) - m^2]$. Then $\sigma_{L_x}\sigma_{L_y} = \langle L_x^2\rangle$ and the bound is $\tfrac{\hbar^2}{2}|m|$. Since $|m| \le \ell$: $\ell(\ell+1) - m^2 - |m| = (\ell - |m|)(\ell + |m| + 1) \ge 0$, equal to 0 exactly at $|m| = \ell$.

                **Rubric**
                - 5: both expectation values with reasons, the inequality verified, equality at $|m| = \ell$.
                - 4: equality case missing or the symmetry step asserted.
                - 3: $\langle L_x\rangle = 0$ right, $\langle L_x^2\rangle$ wrong by a factor (e.g. forgets the ½).
                - 2: uses $L^2 = \hbar^2\ell^2$ or treats $L_x$ as having a definite value.
                - 1: little progress.
              `,
            },
            {
              q: md`**(c)** Sketch the vector model for $\ell = 2$ (all five $m$), and give the angle between $\vb L$ and the $z$ axis for $m = 2$. Explain why $\vb L$ can never point exactly along $z$, even though $L_z = 2\hbar$ is the largest value allowed.`,
              ans: md`Arrow of length $\sqrt6\hbar$, cones at heights $m\hbar$; $\cos\theta = 2/\sqrt6$, $\theta = 35.3°$. Pointing along $z$ would need $L_x = L_y = 0$ sharp together with $L_z$: forbidden, since $\langle L_x^2 + L_y^2\rangle = 2\hbar^2 > 0$.`,
              sol: md`
                **How to see it.** The length is $\sqrt{\ell(\ell+1)}\hbar$, longer than the largest projection $\ell\hbar$; the difference is the irreducible spread of $L_x$ and $L_y$.

                Sketch (as in the figure at the top of this lesson): a semicircle of radius $\sqrt6\hbar \approx 2.45\hbar$, horizontal lines at $L_z = 2, 1, 0, -1, -2$ (in $\hbar$), an arrow from the origin to each intersection, and each arrow swept around the $z$ axis into a cone. Angles: $\cos\theta = m/\sqrt6$: $35.3°$, $65.9°$, $90°$, $114.1°$, $144.7°$. For $\vb L \parallel \hat z$ we'd need $L_x = L_y = 0$ sharp, i.e. a common eigenstate of all three components, which only exists for $\ell = 0$; numerically, $\langle L_x^2 + L_y^2\rangle = \hbar^2(6 - 4) = 2\hbar^2$.

                **Rubric**
                - 5: correct sketch (length $\sqrt6$, five heights, cones), angle, and an explanation via non-commuting components or $\langle L_x^2 + L_y^2\rangle > 0$.
                - 4: angle uses length $2\hbar$ (gives 0°), but explanation right; or sketch missing the cones.
                - 3: sketch fine, explanation only "quantum uncertainty".
                - 2: draws $\vb L$ along $z$ for $m = 2$.
                - 1: little progress.
              `,
            },
            {
              q: md`**(d)** True or false? Justify briefly. "Because $[\hat L_x, \hat L_y] \ne 0$, no state can have $\sigma_{L_x} = 0$ and $\sigma_{L_y} = 0$ at the same time."`,
              ans: md`False. The bound is $\tfrac\hbar2|\langle L_z\rangle|$, which vanishes for $\ell = 0$: there all components are exactly 0.`,
              sol: md`
                **How to see it.** The uncertainty relation bounds the product by the **average** commutator in that state, not by the operator itself.

                $\sigma_{L_x}\sigma_{L_y} \ge \tfrac\hbar2|\langle L_z\rangle|$. In the $\ell = 0$ state, $\hat L^2\psi = 0$, so $\langle L_x^2\rangle + \langle L_y^2\rangle + \langle L_z^2\rangle = 0$ and every component is sharp at 0, with no contradiction (the bound is 0). For $\ell \ge 1$ the statement is true (Discussion 7, 1(a)): the only common eigenstate of two components has $\ell = 0$.

                **Rubric**
                - 5: False, with the $\ell = 0$ counterexample and the "average commutator" reason.
                - 4: False with the counterexample but no link to the bound.
                - 3: False, vague reason.
                - 2: True with a reasonable-sounding argument.
                - 1: correct verdict, no justification.
              `,
            },
          ]),
          R(md`
            ### Endless practice
          `),
          G('m2_L_spectrum'),
          G('m2_Lpm'),
          R(md`**Where this shows up:** [Homework 7](#/l/hw7) (all four problems), [Discussion 7](#/l/disc7) Problem 1. Compare the oscillator ladder in [Topic 13](#/l/t13-ladder) and the qubit's Pauli algebra in [Topic 10](#/l/t10-qubit).`),
        ],
        bank: [
          Q(md`$L^2$ for $\ell = 1$ is…`, [md`$2\hbar^2$`, md`$\hbar^2$`, md`$\sqrt2\,\hbar$`, md`$3\hbar^2$`], 0,
            [null, md`That is $\ell^2\hbar^2$.`, 'That is |L|, not L².', md`That is $2\ell + 1$, the number of states.`], md`$\hbar^2\ell(\ell+1) = 2\hbar^2$.`),
          Q(md`$\hat L_+\ket{\ell, \ell} = $`, ['0', md`$\hbar\ket{\ell, \ell+1}$`, md`$\hbar\ket{\ell+1, \ell+1}$`, md`$\ell\hbar\ket{\ell,\ell}$`], 0,
            [null, md`There is no $m = \ell + 1$ rung.`, md`$\hat L_+$ never changes $\ell$.`, 'That is Lz.'], md`Top of the ladder: $\sqrt{\ell(\ell+1) - \ell(\ell+1)} = 0$.`),
          Q(md`$[\hat L_z, z] = $`, ['0', md`$i\hbar z$`, md`$i\hbar y$`, md`$-i\hbar x$`], 0,
            [null, 'No.', md`That is $[\hat L_z, x]$.`, md`That is $[\hat L_z, y]$.`], md`$\hat L_z = x\hat p_y - y\hat p_x$ contains no $\hat p_z$.`),
          Q(md`How many states does an $\ell = 4$ multiplet contain?`, ['9', '4', '8', '20'], 0,
            [null, 'Count negative m too, and m = 0.', 'Forgot m = 0.', md`$\ell(\ell+1)$ is the $L^2$ eigenvalue, not a count.`], md`$2\ell + 1 = 9$.`),
          Q(md`$\hat L_-\hat L_+ = $`, [md`$\hat L^2 - \hat L_z^2 - \hbar\hat L_z$`, md`$\hat L^2 - \hat L_z^2 + \hbar\hat L_z$`, md`$\hat L^2 + \hat L_z^2$`, md`$\hat L_x^2 - \hat L_y^2$`], 0,
            [null, md`That is $\hat L_+\hat L_-$.`, 'No.', 'No.'], md`$(L_x - iL_y)(L_x + iL_y) = L_x^2 + L_y^2 + i[L_x, L_y] = L^2 - L_z^2 - \hbar L_z$.`),
          Q(md`In $\ket{1, 0}$, a measurement of $L_x$ gives…`, [md`$\pm\hbar$ with probability ½ each`, '0 with certainty', md`$\hbar$ with certainty`, md`$0, \pm\hbar$ with ⅓ each`], 0,
            [null, md`$\ket{1,0}$ is the $L_z = 0$ state, not the $L_x = 0$ state.`, 'No.', 'Not equal weights.'], md`The $L_x$ eigenvectors are $(\tfrac12, \pm\tfrac{1}{\sqrt2}, \tfrac12)$ and $(\tfrac{1}{\sqrt2}, 0, -\tfrac{1}{\sqrt2})$: overlaps with $(0,1,0)$ give $\tfrac12, \tfrac12, 0$.`),
          Q(md`The commutator $[\hat L_y, \hat L_z]$ equals…`, [md`$i\hbar\hat L_x$`, md`$-i\hbar\hat L_x$`, md`$i\hbar\hat L_y$`, '0'], 0,
            [null, 'Cyclic order x → y → z → x gives +.', 'Wrong component.', 'Components do not commute.'], md`Cyclic: $[L_x, L_y] = i\hbar L_z$, $[L_y, L_z] = i\hbar L_x$, $[L_z, L_x] = i\hbar L_y$.`),
        ],
      },

      // ================================================================== Topic 19
      {
        id: 't19-Ylm', topic: 19, title: 'Spherical harmonics, measuring L, and the rigid rotor', ref: 'Griffiths 4.1.2, 4.3.2 · HW 7, Discussion 7',
        steps: [
          RF(md`
            ### The picture

            The eigenfunctions of $\hat L^2$ and $\hat L_z$ are functions of direction, $Y_\ell^m(\theta, \phi) = \Theta_\ell^m(\theta)\,e^{im\phi}$.

            **The $\phi$ part is a ring problem.** In spherical coordinates $\hat L_z = -i\hbar\,\partial/\partial\phi$ (rotation about $z$). Its eigenfunctions are $e^{im\phi}$ with eigenvalue $m\hbar$: a plane wave running around the $z$ axis. Going once around must bring you back, $e^{im(\phi + 2\pi)} = e^{im\phi}$, so $m$ is an integer. This is Midterm 1's particle on a ring, word for word.

            **States of definite $L_z$ are donuts.** $|e^{im\phi}|^2 = 1$, so $|Y_\ell^m|^2$ does not depend on $\phi$: a state with sharp $L_z$ is smeared evenly around the $z$ axis, like a classical orbit whose orientation about $z$ is unknown. Real combinations like $p_x \propto Y_1^{-1} - Y_1^1$ are standing waves in $\phi$ (equal amounts of $\pm m$), so they have lobes and $\langle L_z\rangle = 0$.

            **The $\theta$ part counts tilt.** Large $|m|$ (close to $\ell$) concentrates the probability near the equator, $|Y_\ell^\ell|^2 \propto \sin^{2\ell}\theta$: the angular momentum is mostly along $z$, so the particle mostly moves in the $xy$ plane. $m = 0$ pushes it toward the poles.

            [[fig:shapes]]

            $\ell$ also counts angular nodes (nodal cones and planes), and parity is $Y_\ell^m(-\hat{\vb r}) = (-1)^\ell Y_\ell^m(\hat{\vb r})$: even $\ell$ even, odd $\ell$ odd.

            ### The table, in angles and in Cartesian form

            | | angles | $\times r^\ell$: polynomial |
            |---|---|---|
            | $Y_0^0$ | $\dfrac{1}{\sqrt{4\pi}}$ | $1$ |
            | $Y_1^0$ | $\sqrt{\dfrac{3}{4\pi}}\cos\theta$ | $z$ |
            | $Y_1^{\pm1}$ | $\mp\sqrt{\dfrac{3}{8\pi}}\sin\theta\,e^{\pm i\phi}$ | $\mp(x \pm iy)$ |
            | $Y_2^0$ | $\sqrt{\dfrac{5}{16\pi}}(3\cos^2\theta - 1)$ | $2z^2 - x^2 - y^2$ |
            | $Y_2^{\pm1}$ | $\mp\sqrt{\dfrac{15}{8\pi}}\sin\theta\cos\theta\,e^{\pm i\phi}$ | $\mp z(x \pm iy)$ |
            | $Y_2^{\pm2}$ | $\sqrt{\dfrac{15}{32\pi}}\sin^2\theta\,e^{\pm2i\phi}$ | $(x \pm iy)^2$ |

            (The polynomial column is up to the normalization constant.) $r^\ell Y_\ell^m$ is a polynomial of degree $\ell$ in $x, y, z$ with zero Laplacian. Each factor $x + iy$ carries $m = +1$, each $x - iy$ carries $m = -1$, each $z$ carries $m = 0$.

            !!method Reading $L^2$ and $L_z$ off a function
                1. Rewrite the angular function with $x/r$, $y/r$, $z/r$ (use $x = r\sin\theta\cos\phi$, $y = r\sin\theta\sin\phi$, $z = r\cos\theta$).
                2. Write $x = \tfrac12[(x + iy) + (x - iy)]$, $y = \tfrac{1}{2i}[(x + iy) - (x - iy)]$: the powers of $x \pm iy$ give $m$.
                3. Watch for hidden $r^2 = x^2 + y^2 + z^2$: it is $\ell = 0$ in disguise. $z^2 = \tfrac13r^2 + \tfrac13(3z^2 - r^2)$ is part $\ell = 0$, part $\ell = 2$.
                4. Normalize, then $P = |\text{coefficient of } Y_\ell^m|^2$.

            ### Building the top of the ladder (HW 7, Problem 4)

            In angles, $\hat L_\pm = \pm\hbar e^{\pm i\phi}\left(\partial_\theta \pm i\cot\theta\,\partial_\phi\right)$. The top state obeys $\hat L_+Y_\ell^\ell = 0$ and $\hat L_zY_\ell^\ell = \ell\hbar Y_\ell^\ell$. The second gives $Y = f(\theta)e^{i\ell\phi}$; then the first gives $f' + i\cot\theta\,(i\ell)f = f' - \ell\cot\theta\,f = 0$, so $f \propto \sin^\ell\theta$:
            $$Y_\ell^\ell \propto \sin^\ell\theta\,e^{i\ell\phi}$$
            Every other $Y_\ell^m$ follows by applying $\hat L_-$. One first-order equation instead of the full second-order angular equation: the ladder pays off again.
          `, { shapes: { svg: shapes.svg, cap: 'Cuts through the xz-plane: distance from the center is $|Y|^2$ in that direction. Rotate each about the $z$ axis for the 3D shape. $|Y_1^{\\pm1}|^2 \\propto \\sin^2\\theta$ is a donut around $z$.' } }),
          RF(md`
            ### Measuring $L$: the tilted $p$ orbital

            Take a $p$ orbital pointing along a unit vector $\hat{\vb n} = (\sin\beta, 0, \cos\beta)$ in the $xz$ plane: $Y_{\hat n} = \sqrt{\tfrac{3}{4\pi}}\,\hat{\vb n}\cdot\hat{\vb r} = \sqrt{\tfrac{3}{4\pi}}\left(\sin\beta\,\tfrac xr + \cos\beta\,\tfrac zr\right)$. With $\tfrac xr = \sqrt{\tfrac{2\pi}{3}}\left(Y_1^{-1} - Y_1^1\right)$ and $\tfrac zr = \sqrt{\tfrac{4\pi}{3}}Y_1^0$:
            $$Y_{\hat n} = \cos\beta\,Y_1^0 + \frac{\sin\beta}{\sqrt2}\left(Y_1^{-1} - Y_1^1\right)$$
            $$P(L_z = 0) = \cos^2\beta,\qquad P(L_z = \pm\hbar) = \tfrac12\sin^2\beta,\qquad L^2 = 2\hbar^2\text{ with certainty}$$
            A dumbbell along $z$ ($\beta = 0$) has $L_z = 0$ for sure; turn it into the $xy$ plane ($\beta = 90°$) and you get $\pm\hbar$, 50/50. The real function has $\langle L_z\rangle = 0$ for every $\beta$.

            [[fig:tilt]]

            ### Measuring $L_x$ when the state has sharp $L_z$ ($\ell = 1$)

            Diagonalize $L_x = \tfrac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}$ in the basis $(\ket{1,1}, \ket{1,0}, \ket{1,-1})$:
            $$L_x = +\hbar:\ \left(\tfrac12, \tfrac{1}{\sqrt2}, \tfrac12\right),\qquad L_x = 0:\ \left(\tfrac{1}{\sqrt2}, 0, -\tfrac{1}{\sqrt2}\right),\qquad L_x = -\hbar:\ \left(\tfrac12, -\tfrac{1}{\sqrt2}, \tfrac12\right)$$
            In Cartesian form these are $\propto (y + iz)$, $x$, $(y - iz)$: the $L_z$ table with the axes relabeled $z \to x$, $x \to y$, $y \to z$. Starting in $\ket{1,1}$ (first component of each vector): $P(L_x = +\hbar) = \tfrac14$, $P(0) = \tfrac12$, $P(-\hbar) = \tfrac14$.

            **Successive measurements.** After $L_x = 0$, the state is $\propto x/r = \sqrt{\tfrac{2\pi}{3}}(Y_1^{-1} - Y_1^1)$: measuring $L_z$ again gives $\pm\hbar$ with ½ each. The $L_x$ measurement erased the earlier $L_z$ value, because $\hat L_x$ and $\hat L_z$ don't commute. $L^2 = 2\hbar^2$ survives every step, because $\hat L^2$ commutes with both.

            ### The rigid rotor

            A molecule rotating freely: $\hat H = \hat L^2/2I$. Eigenstates $Y_\ell^m$, energies
            $$E_\ell = \frac{\hbar^2\ell(\ell+1)}{2I},\quad g_\ell = 2\ell + 1,\qquad \Delta E_{\ell\to\ell+1} = \frac{\hbar^2(\ell+1)}{I}$$
            so absorption lines from neighboring levels are **evenly spaced** (by $\hbar^2/I$): the signature of a rotational spectrum. For HCl, $\hbar^2/2I \approx 1.3$ meV (far infrared). The $2\ell + 1$ degeneracy is rotational symmetry. A symmetric top with $I_z \ne I_x = I_y$ has $\hat H = \tfrac{\hat L^2}{2I} + \left(\tfrac{1}{2I_z} - \tfrac{1}{2I}\right)\hat L_z^2$: still diagonal in $Y_\ell^m$, energies now depend on $m^2$, so only $\pm m$ stay paired (Discussion 7). A term linear in $\hat L_z$ (a magnetic field, $-\gamma B\hat L_z$) splits $+m$ from $-m$.

            **Precession.** Under $\hat H = \omega\hat L_z$, each $Y_\ell^m$ picks up $e^{-im\omega t}$, and $e^{im\phi}e^{-im\omega t} = e^{im(\phi - \omega t)}$: the whole angular pattern rotates rigidly about $z$ at angular velocity $\omega$. In Ehrenfest form, $\tfrac{d}{dt}\langle L_x\rangle = -\omega\langle L_y\rangle$, $\tfrac{d}{dt}\langle L_y\rangle = \omega\langle L_x\rangle$: $\langle\vb L\rangle$ precesses like the Bloch vector of Topic 10.
          `, { tilt: { svg: tilted.svg, cap: 'A $p$ orbital along $\\hat n$ at angle $\\beta$ from $z$ ($|Y|^2$ in the xz-plane). The more it tilts toward the equator, the more weight on $L_z = \\pm\\hbar$.' } }),
          R(md`
            ### Worked example

            !!graded Problem
              A rigid rotor starts in $Y(\theta, \phi, 0) = N\cos^2\theta$. (a) Possible results of measuring $L^2$, $L_z$ and $E$, with probabilities. (b) $\langle H\rangle$. (c) Does the angular probability distribution change in time? With what period?

            **(a) Hidden $\ell = 0$.** $\cos^2\theta = z^2/r^2$ is not harmonic: $z^2 = \tfrac13r^2 + \tfrac13(3z^2 - r^2)$. So
            $$\cos^2\theta = \tfrac13 + \tfrac13(3\cos^2\theta - 1) = \frac{\sqrt{4\pi}}{3}Y_0^0 + \frac{2}{3}\sqrt{\frac{4\pi}{5}}\,Y_2^0$$
            Weights $\propto \tfrac{4\pi}{9}$ and $\tfrac{4}{9}\cdot\tfrac{4\pi}{5}$, i.e. $5 : 4$. So $P(\ell = 0) = \tfrac59$, $P(\ell = 2) = \tfrac49$: $L^2 = 0$ or $6\hbar^2$; $L_z = 0$ with certainty (no $\phi$ dependence); $E = 0$ or $3\hbar^2/I$.

            **(b)** $\langle H\rangle = \tfrac49\cdot\tfrac{6\hbar^2}{2I} = \tfrac{4\hbar^2}{3I}$.

            **(c)** $Y(t) = c_0Y_0^0 + c_2Y_2^0e^{-iE_2t/\hbar}$. The cross term in $|Y|^2$ oscillates at $\omega = E_2/\hbar = 3\hbar/I$, period $\tau = 2\pi I/3\hbar$. The distribution alternates between pole-heavy ($\cos^2\theta$ at $t = 0$) and equator-heavy at $\tau/2$ (when the cross term flips sign: $\tfrac13 - \tfrac13(3\cos^2\theta - 1) = \tfrac23 - \cos^2\theta$... shifted toward $\sin^2\theta$). Same mechanism as the sloshing in Midterm 1 Problem 1: two energies, one beat.

            !!mistake Common mistakes
              - Missing the hidden $\ell = 0$ part of $z^2$, $x^2$, $\cos^2\theta$, etc. Only harmonic polynomials are pure $\ell$.
              - Thinking $|Y_1^1|^2$ depends on $\phi$. It is $\propto\sin^2\theta$: a donut.
              - Calling $p_x$ an "$m = 1$" state. It is half $m = +1$, half $m = -1$.
              - Squaring coefficients before normalizing. Normalize first (or take ratios).
              - Thinking a later $L_z$ measurement must repeat the earlier result after an $L_x$ measurement in between.
              - Writing the rotor energies as $\hbar^2\ell^2/2I$ and getting unequal line spacings wrong.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`$Y \propto \sin^2\theta\,e^{-2i\phi}$. A measurement of $L_z$ gives…`,
            [md`$-2\hbar$ with certainty`, md`$+2\hbar$ with certainty`, md`$\pm2\hbar$, ½ each`, md`0, since the function is real in $\theta$`], 0,
            [null, md`$-i\hbar\partial_\phi e^{-2i\phi} = -2\hbar e^{-2i\phi}$.`, 'One exponential, not a cosine.', md`Only the $\phi$ dependence matters.`],
            md`It is $Y_2^{-2}$: $\ell = 2$, $m = -2$.`),
          Q(md`$|Y_1^1(\theta, \phi)|^2$ depends on…`, [md`$\theta$ only`, md`$\phi$ only`, md`both $\theta$ and $\phi$`, 'neither'], 0,
            [null, md`$|e^{i\phi}|^2 = 1$.`, md`$|e^{i\phi}|^2 = 1$ removes $\phi$.`, md`$\sin^2\theta$ varies with $\theta$.`],
            md`$\propto\sin^2\theta$: a donut around $z$. Every state with definite $L_z$ is symmetric about $z$.`),
          L(2, 'set up'),
          Q(md`The angular function $z/r$ has…`, [md`$\ell = 1$, $m = 0$`, md`$\ell = 0$, $m = 0$`, md`$\ell = 1$, $m = 1$`, md`$\ell = 2$, $m = 0$`], 0,
            [null, md`It depends on $\theta$.`, md`No $\phi$ dependence: $m = 0$.`, md`Degree 1.`], md`$z/r = \cos\theta \propto Y_1^0$.`),
          P({
            title: 'The p_x orbital',
            q: md`$Y \propto \sin\theta\cos\phi$ ($= x/r$). Find $P(L_z = +\hbar)$ and $\langle L_z\rangle$.`,
            parts: [{ lbl: 'P(+\\hbar)', ans: 0.5 }, { lbl: '\\langle L_z\\rangle', ans: 0 }],
            hints: [md`$\cos\phi = \tfrac12(e^{i\phi} + e^{-i\phi})$.`],
            sol: md`Equal weights for $e^{\pm i\phi}$: $\tfrac12$ each, average 0. (Up to signs, $x/r \propto Y_1^{-1} - Y_1^1$.)`,
          }),
          Q(md`Why must $m$ be an integer?`,
            [md`$e^{im\phi}$ must return to itself after $\phi \to \phi + 2\pi$`, md`$L_z$ must be positive`, md`$\hat L_z$ must be Hermitian, which fails for other $m$`, 'Because ℓ is an integer'], 0,
            [null, 'm can be negative.', md`Hermiticity holds on periodic functions; it is periodicity that quantizes $m$ (Midterm 1, 2(a)–(b)).`, 'Backwards: integer m is what forces integer ℓ.'],
            md`Single-valuedness: $e^{2\pi im} = 1$.`),
          L(3, 'standard'),
          P({
            title: 'A cos²θ state',
            q: md`$Y = N\cos^2\theta$. Find $P(L^2 = 0)$ and $\langle L^2\rangle$ in units of $\hbar^2$.`,
            parts: [{ lbl: 'P(L^2 = 0)', ans: 5 / 9 }, { lbl: '\\langle L^2\\rangle/\\hbar^2', ans: 8 / 3 }],
            hints: [md`$\cos^2\theta = \tfrac13 + \tfrac13(3\cos^2\theta - 1)$.`, md`$Y_0^0 = \tfrac{1}{\sqrt{4\pi}}$, $Y_2^0 = \sqrt{\tfrac{5}{16\pi}}(3\cos^2\theta - 1)$.`],
            sol: md`Coefficients $\tfrac{\sqrt{4\pi}}{3}$ and $\tfrac23\sqrt{\tfrac{4\pi}{5}}$, squares in ratio $1 : \tfrac45 = 5 : 4$. $P(0) = \tfrac59$, $P(6\hbar^2) = \tfrac49$, $\langle L^2\rangle = \tfrac{24}{9}\hbar^2 = \tfrac83\hbar^2$.`,
          }),
          P({
            title: 'Rotational lines',
            q: md`A molecule has $\hbar^2/2I = 1.31$ meV. Find the photon energy (meV) absorbed in $\ell = 0 \to 1$ and in $\ell = 3 \to 4$.`,
            parts: [{ lbl: '\\Delta E_{0\\to1}', ans: 2.62, unit: 'meV' }, { lbl: '\\Delta E_{3\\to4}', ans: 10.48, unit: 'meV' }],
            hints: [md`$E_\ell = B\ell(\ell+1)$ with $B = \hbar^2/2I$.`],
            sol: md`$2B = 2.62$ meV; $B(20 - 12) = 8B = 10.48$ meV. Lines at $2B, 4B, 6B, 8B, \ldots$: evenly spaced by $2B = \hbar^2/I$.`,
          }),
          Q(md`How many states share the rotor level $\ell = 3$?`, ['7', '3', '12', '6'], 0,
            [null, md`That is $\ell$.`, md`$\ell(\ell+1) = 12$ is the $L^2$ eigenvalue in $\hbar^2$.`, 'Forgot m = 0.'], md`$2\ell + 1 = 7$.`),
          L(4, 'one twist'),
          P({
            title: 'Tilted p orbital',
            q: md`A $p$ orbital points along $\hat{\vb n}$ at $\beta = 60°$ from $z$. Find $P(L_z = 0)$ and $P(L_z = +\hbar)$.`,
            parts: [{ lbl: 'P(0)', ans: 0.25 }, { lbl: 'P(+\\hbar)', ans: 0.375 }],
            hints: [md`$P(0) = \cos^2\beta$, $P(\pm\hbar) = \tfrac12\sin^2\beta$.`],
            sol: md`$\cos^260° = \tfrac14$; $\tfrac12\cdot\tfrac34 = \tfrac38$ each for $\pm\hbar$. Sum $\tfrac14 + \tfrac38 + \tfrac38 = 1$ ✓.`,
          }),
          P({
            title: 'Lx after Lz',
            q: md`A particle is in $\ket{1, 1}$. Find $P(L_x = +\hbar)$ and $P(L_x = 0)$.`,
            parts: [{ lbl: 'P(L_x = +\\hbar)', ans: 0.25 }, { lbl: 'P(L_x = 0)', ans: 0.5 }],
            hints: [md`Take the first component of each $L_x$ eigenvector.`],
            sol: md`$|\tfrac12|^2 = \tfrac14$, $|\tfrac{1}{\sqrt2}|^2 = \tfrac12$, and $\tfrac14$ for $-\hbar$.`,
          }),
          Q(md`A particle in $\ket{1,1}$ has $L_x$ measured, giving 0. Then $L_z$ is measured. Result?`,
            [md`$\pm\hbar$, ½ each`, md`$+\hbar$ with certainty`, md`0 with certainty`, md`$+\hbar$, $0$, $-\hbar$ with ⅓ each`], 0,
            [null, 'The Lx measurement replaced the state; the old Lz value is gone.', md`The $L_x = 0$ state is $\propto x/r$, which has no $L_z = 0$ part.`, 'Not equal thirds.'],
            md`After $L_x = 0$: $\tfrac{1}{\sqrt2}(\ket{1,1} - \ket{1,-1})$. $L_z = \pm\hbar$ with ½ each.`),
          L(5, 'exam level'),
          P({
            title: 'Reading a d function',
            q: md`$Y \propto \sin\theta\cos\theta\cos\phi$ ($= xz/r^2$). Enter $\ell$ and $P(L_z = +\hbar)$.`,
            parts: [{ lbl: '\\ell', ans: 2 }, { lbl: 'P(L_z = +\\hbar)', ans: 0.5 }],
            hints: [md`$xz = \tfrac12z[(x + iy) + (x - iy)]$. Is $xz$ harmonic?`],
            sol: md`$\nabla^2(xz) = 0$ and degree 2: pure $\ell = 2$. $z(x \pm iy) \propto Y_2^{\pm1}$ with equal weights: $L_z = \pm\hbar$, ½ each.`,
          }),
          P({
            title: 'Along the body diagonal',
            q: md`$Y \propto (x + y + z)/r$, a $p$ orbital along $(1,1,1)$. Find $P(L_z = 0)$.`,
            parts: [{ lbl: 'P(L_z = 0)', ans: 1 / 3 }],
            hints: [md`Use $P(0) = \cos^2\beta$ with $\cos\beta = \hat{\vb n}\cdot\hat z$.`],
            sol: md`$\cos\beta = 1/\sqrt3$: $P(0) = \tfrac13$, and $P(\pm\hbar) = \tfrac12\cdot\tfrac23 = \tfrac13$ each. (Check by expanding: the coefficients of $Y_1^1$, $Y_1^0$, $Y_1^{-1}$ have equal magnitudes.)`,
          }),
          Q(md`A symmetric top has $I_z = (1 + \epsilon)I$ with $\epsilon > 0$, $I_x = I_y = I$. Within $\ell = 2$, which states lie lowest?`,
            [md`$m = \pm2$`, md`$m = 0$`, md`$m = \pm1$`, 'all five are degenerate'], 0,
            [null, md`$m = 0$ has all its angular momentum perpendicular to $z$: the expensive axis.`, 'In between.', 'The energy depends on m² now.'],
            md`$E = \tfrac{\hbar^2}{2I}\left[\ell(\ell+1) - \tfrac{\epsilon}{1+\epsilon}m^2\right]$: largest $|m|$ lowest. Classically, rotating about the axis with the larger moment of inertia costs less energy at fixed $|L|$ (Discussion 7).`),
          L(6, 'harder than the exam'),
          P({
            title: 'Top of the ladder, normalized',
            q: md`$Y_2^2 = N\sin^2\theta\,e^{2i\phi}$. Find $N$ from $\int|Y|^2d\Omega = 1$.`,
            parts: [{ lbl: 'N', ans: Math.sqrt(15 / (32 * Math.PI)) }],
            hints: [md`$\int_0^\pi\sin^5\theta\,d\theta = \tfrac{16}{15}$.`],
            sol: md`$N^2\cdot2\pi\cdot\tfrac{16}{15} = 1 \Rightarrow N = \sqrt{\tfrac{15}{32\pi}} = 0.386$, matching the table.`,
          }),
          P({
            title: 'Symmetric top splitting',
            q: md`Symmetric top with $\epsilon = 0.25$. Find $E_{2,\pm2} - E_{2,0}$ in units of $\hbar^2/2I$.`,
            parts: [{ lbl: '\\Delta E', ans: -0.8 }],
            hints: [md`$-\tfrac{\epsilon}{1+\epsilon}m^2$.`],
            sol: md`$-\tfrac{0.25}{1.25}\cdot4 = -0.8$.`,
          }),
          Q(md`$\hat H = \omega\hat L_z$. At $t = 0$ the state is the $L_x = +\hbar$ eigenstate ($\ell = 1$). Which is right?`,
            [md`$\langle L_x\rangle = \hbar\cos\omega t$, $\langle L_y\rangle = \hbar\sin\omega t$, $\langle L_z\rangle = 0$`, md`$\langle L_x\rangle = \hbar$ forever`, md`$\langle L_z\rangle$ grows linearly`, md`$\langle L_x\rangle = \hbar\cos2\omega t$`], 0,
            [null, md`$[\hat L_z, \hat L_x] \ne 0$: $L_x$ is not conserved.`, md`$L_z$ commutes with $H$: conserved.`, md`Adjacent $m$ differ by one: frequency $\omega$.`],
            md`$e^{im\phi}e^{-im\omega t} = e^{im(\phi - \omega t)}$: the pattern rotates about $z$ at $\omega$, carrying $\langle\vb L\rangle$ around: Larmor precession.`),
          R(md`
            ### Exam-style problem
          `),
          paper('Exam-style problem · Topic 19', md`
            **A tilted $p$ orbital** [20 points, 5 per part]

            A particle's angular wavefunction is $Y(\theta, \phi) = \sqrt{\tfrac{3}{4\pi}}\left(\sin\beta\sin\theta\cos\phi + \cos\beta\cos\theta\right)$ for a fixed angle $0 \le \beta \le \pi/2$. You may use $\hat L_z = -i\hbar\partial_\phi$, $Y_1^0 = \sqrt{\tfrac{3}{4\pi}}\cos\theta$, $Y_1^{\pm1} = \mp\sqrt{\tfrac{3}{8\pi}}\sin\theta\,e^{\pm i\phi}$.
          `, [
            {
              q: md`**(a)** Without computing any derivatives, explain why $Y$ is an eigenfunction of $\hat L^2$ and give the eigenvalue. What direction does this orbital point in?`,
              ans: md`$Y = \sqrt{\tfrac{3}{4\pi}}\,\hat{\vb n}\cdot\hat{\vb r}$ with $\hat{\vb n} = (\sin\beta, 0, \cos\beta)$: a combination of $\ell = 1$ functions only, so $L^2 = 2\hbar^2$. It points along $\hat{\vb n}$.`,
              sol: md`
                **How to see it.** $\sin\theta\cos\phi = x/r$ and $\cos\theta = z/r$: degree-1 functions of direction, all $\ell = 1$.

                $Y = \sqrt{\tfrac{3}{4\pi}}(\sin\beta\,x + \cos\beta\,z)/r = \sqrt{\tfrac{3}{4\pi}}\,\hat{\vb n}\cdot\hat{\vb r}$. Both $x/r$ and $z/r$ are combinations of $Y_1^m$, and any combination of eigenfunctions with the same eigenvalue is an eigenfunction: $\hat L^2Y = 2\hbar^2Y$. It is a $p$ orbital (dumbbell) along $\hat{\vb n}$, tilted by $\beta$ from $z$ toward $x$.

                **Rubric**
                - 5: identification with $x/r$, $z/r$ (or $Y_1^m$), the "same eigenvalue" argument, $2\hbar^2$, direction $\hat{\vb n}$.
                - 4: $2\hbar^2$ with the right reason but the direction missing.
                - 3: asserts $\ell = 1$ without a reason.
                - 2: gives $\hbar^2$ ($\ell^2$) or claims it is not an eigenfunction because it has two terms.
                - 1: little progress.
              `,
            },
            {
              q: md`**(b)** Expand $Y$ in $Y_1^m$ and find the possible outcomes of an $L_z$ measurement with their probabilities, and $\langle L_z\rangle$. Check $\beta = 0$ and $\beta = \pi/2$.`,
              ans: md`$Y = \cos\beta\,Y_1^0 + \tfrac{\sin\beta}{\sqrt2}(Y_1^{-1} - Y_1^1)$. $P(0) = \cos^2\beta$, $P(\pm\hbar) = \tfrac12\sin^2\beta$, $\langle L_z\rangle = 0$. $\beta = 0$: $L_z = 0$ certain; $\beta = \pi/2$: $\pm\hbar$, ½ each.`,
              sol: md`
                **How to see it.** $\cos\phi = \tfrac12(e^{i\phi} + e^{-i\phi})$: the $x$ part splits equally into $m = \pm1$.

                $Y_1^{-1} - Y_1^1 = \sqrt{\tfrac{3}{8\pi}}\sin\theta(e^{-i\phi} + e^{i\phi}) = 2\sqrt{\tfrac{3}{8\pi}}\sin\theta\cos\phi$, so $\sqrt{\tfrac{3}{4\pi}}\sin\theta\cos\phi = \tfrac{1}{\sqrt2}(Y_1^{-1} - Y_1^1)$. With $\sqrt{\tfrac{3}{4\pi}}\cos\theta = Y_1^0$, the expansion follows. Probabilities: $\cos^2\beta + 2\cdot\tfrac12\sin^2\beta = 1$ ✓. $\langle L_z\rangle = \hbar\cdot\tfrac12\sin^2\beta - \hbar\cdot\tfrac12\sin^2\beta = 0$. Limits: along $z$ it is $Y_1^0$; along $x$ it is the $p_x$ standing wave.

                **Rubric**
                - 5: correct expansion, three probabilities summing to 1, $\langle L_z\rangle = 0$, both limits.
                - 4: probabilities right, a coefficient's sign or $\sqrt2$ wrong in the expansion, or limits missing.
                - 3: outcomes right, probabilities unnormalized (e.g. $\sin^2\beta$ for each).
                - 2: outcomes not tied to $m$ (e.g. includes $\pm2\hbar$).
                - 1: little progress.
              `,
            },
            {
              q: md`**(c)** Explain why $\langle L_z\rangle = 0$ for **any** real angular wavefunction. Sketch $|Y|^2$ in the $xz$-plane for $\beta = 0$ and $\beta = \pi/2$.`,
              ans: md`A real function has equal-magnitude $e^{\pm im\phi}$ parts (standing waves in $\phi$), so $\pm m$ are equally likely. Sketches: a dumbbell along $z$; a dumbbell along $x$.`,
              sol: md`
                **How to see it.** $L_z$ is the momentum around the $z$ axis. A real wavefunction is a standing wave around the axis: it runs both ways equally, like $\cos kx$ has $\langle p\rangle = 0$.

                Formally: $\langle L_z\rangle = \int Y(-i\hbar\partial_\phi Y)\,d\Omega$ is $-i\hbar$ times a real number, but it must be real (Hermitian operator), so it is 0. (Or: $\int Y\partial_\phi Y\,d\phi = \tfrac12[Y^2]_0^{2\pi} = 0$ by periodicity.) Sketches: two lobes $\propto\cos^2\theta$ along $\pm z$; two lobes $\propto\sin^2\theta\cos^2\phi$ along $\pm x$, which in the $xz$-plane is $\sin^2\theta$ (see the figure in the lesson).

                **Rubric**
                - 5: a correct general argument (standing wave / real-number argument / periodicity) and both sketches.
                - 4: argument only for this $Y$, not for any real $Y$; or one sketch wrong.
                - 3: sketches right, argument just "it's real".
                - 2: sketches $\beta = \pi/2$ as a donut (that is $|Y_1^{\pm1}|^2$, not $p_x$).
                - 1: little progress.
              `,
            },
            {
              q: md`**(d)** $L_z$ is measured and gives $+\hbar$. True or false? Justify briefly. "Immediately afterwards the orbital still points along $\hat{\vb n}$; it simply has a definite $L_z$ now."`,
              ans: md`False. The state collapses to $Y_1^1 \propto \sin\theta\,e^{i\phi}$, whose $|Y|^2 \propto\sin^2\theta$ is a donut around $z$. The information about $\hat{\vb n}$ is gone.`,
              sol: md`
                **How to see it.** A measurement replaces the state by the eigenstate of the measured result. Any state with definite $L_z$ is symmetric about the $z$ axis, so it cannot point along a tilted $\hat{\vb n}$.

                After the result $+\hbar$ the angular state is $Y_1^1$ (radial part unchanged), $|Y_1^1|^2 = \tfrac{3}{8\pi}\sin^2\theta$, independent of $\phi$: no preferred direction in the $xy$ plane, no tilt. Measuring $L^2$ would still give $2\hbar^2$ (it commutes with $L_z$); measuring along $\hat{\vb n}$ again would no longer give 0 with certainty.

                **Rubric**
                - 5: False, collapse to $Y_1^1$, the donut/axial-symmetry argument.
                - 4: False with collapse stated but no reason why the direction is lost.
                - 3: False, vague ("measurement disturbs").
                - 2: True.
                - 1: correct verdict, no justification.
              `,
            },
          ]),
          R(md`
            ### Endless practice
          `),
          G('m2_L_measure'),
          G('m2_rotor'),
          R(md`**Where this shows up:** [Homework 7](#/l/hw7) Problem 4 (the top of the ladder), [Discussion 7](#/l/disc7) Problems 2–3 (successive measurements, the rotor). The ring of Midterm 1 Problem 2 is the $\phi$ part of every $Y_\ell^m$.`),
        ],
        bank: [
          Q(md`$\hat L_z$ in spherical coordinates is…`, [md`$-i\hbar\,\partial_\phi$`, md`$-i\hbar\,\partial_\theta$`, md`$-i\hbar\,\partial_r$`, md`$-\hbar^2\partial_\phi^2$`], 0,
            [null, md`$\theta$ is the tilt from $z$; rotating about $z$ changes $\phi$.`, 'That is not an angular momentum.', md`That is $\hat L_z^2$.`], md`Rotation about $z$ changes $\phi$ only.`),
          Q(md`The parity of $Y_\ell^m$ is…`, [md`$(-1)^\ell$`, md`$(-1)^m$`, md`$(-1)^{\ell+m}$`, 'always even'], 0,
            [null, md`$Y_1^0 \propto z$ is odd with $m = 0$.`, 'No.', md`$z/r$ is odd.`], md`$r^\ell Y_\ell^m$ is a polynomial of degree $\ell$: $\vb r \to -\vb r$ gives $(-1)^\ell$.`),
          Q(md`Which function is a pure $\ell = 2$ state?`, [md`$(x + iy)^2/r^2$`, md`$x^2/r^2$`, md`$(x^2 + y^2 + z^2)/r^2$`, md`$z/r$`], 0,
            [null, md`$x^2$ hides an $r^2/3$ piece ($\ell = 0$).`, md`That is 1: $\ell = 0$.`, md`$\ell = 1$.`], md`$(x + iy)^2 \propto r^2Y_2^2$; harmonic and degree 2.`),
          Q(md`For the rigid rotor, the absorption lines $\ell \to \ell + 1$ are…`, ['evenly spaced in energy', 'spaced like 1/n²', 'all at the same energy', 'spaced like ℓ²'], 0,
            [null, 'That is hydrogen.', 'Different ℓ give different ΔE.', md`$\Delta E = \hbar^2(\ell+1)/I$ is linear in $\ell$.`], md`$E_{\ell+1} - E_\ell = \tfrac{\hbar^2}{2I}[(\ell+1)(\ell+2) - \ell(\ell+1)] = \tfrac{\hbar^2(\ell+1)}{I}$.`),
          Q(md`$Y_\ell^\ell \propto$`, [md`$\sin^\ell\theta\,e^{i\ell\phi}$`, md`$\cos^\ell\theta\,e^{i\ell\phi}$`, md`$\sin^\ell\theta$`, md`$e^{i\ell\theta}$`], 0,
            [null, md`That concentrates at the poles; the top state lives near the equator.`, md`Missing $e^{i\ell\phi}$: $L_z = \ell\hbar$ needs it.`, 'No.'], md`From $\hat L_+Y_\ell^\ell = 0$: $f' = \ell\cot\theta f$.`),
          Q(md`A particle has $L_z = 0$ measured, then $L^2$ measured. Possible results?`, [md`$0, 2\hbar^2, 6\hbar^2, \ldots$ (any $\ell \ge 0$)`, 'only 0', md`only $2\hbar^2$`, md`$0$ or $2\hbar^2$ only`], 0,
            [null, md`$m = 0$ exists for every $\ell$.`, md`$m = 0$ only bounds $\ell \ge 0$.`, 'Nothing fixes ℓ to 1.'], md`$m$ puts only a lower bound on $\ell$ (Discussion 7, 1(b)).`),
          Q(md`After an $L_x$ measurement on an $\ell = 1$ particle, an $L^2$ measurement gives…`, [md`$2\hbar^2$ with certainty`, md`$0$, $2\hbar^2$ or $6\hbar^2$`, 'anything', md`$\hbar^2$`], 0,
            [null, md`$\hat L^2$ commutes with $\hat L_x$: the $L_x$ measurement cannot change $\ell$.`, 'No.', md`$\ell(\ell+1) = 2$.`], md`Compatible observables: $L^2$ is untouched.`),
        ],
      },
    ],
  });
})();

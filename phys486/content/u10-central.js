/* Midterm 2 · Unit 4 — central potentials and hydrogen (Discussion 8 and the lectures after HW 7). Topics 20–21:
   the radial equation, u = rR, the effective potential and boundary conditions, the spherical box; the hydrogen
   spectrum, its wavefunctions, its spectral lines and its accidental degeneracy. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  // ------------------------------------------------------------------ figures
  // Coulomb effective potential in units of k/a, r in units of a: -1/x + l(l+1)/(2x^2)
  const veff = PF.plot({
    w: 400, h: 250, x: [0, 16], y: [-0.6, 0.3], zero: true, xl: 'r/a', yl: 'V_{\\text{eff}}\\ (k/a)',
    xt: [[2, '2'], [6, '6'], [12, '12']],
    hlines: [[-0.5, 'E_1'], [-0.125, 'E_2']],
    curves: [
      { f: (x) => -1 / x, from: 1.7, lab: '\\ell = 0', labAt: 3.2, dy: 10 },
      { f: (x) => -1 / x + 1 / (x * x), from: 0.8, lab: '\\ell = 1', labAt: 1.05, dx: 6, dy: -4 },
      { f: (x) => -1 / x + 3 / (x * x), from: 1.8, lab: '\\ell = 2', labAt: 2.6, dx: 6, dy: -6 },
    ],
    pts: [{ x: 2, y: -0.25 }, { x: 6, y: -1 / 12 }],
  });

  // u(r) drawn at its energy on top of V_eff, with the classical turning points (hydrogen n = 2)
  function uSketch(l) {
    const V = (x) => -1 / x + l * (l + 1) / (2 * x * x);
    const u = l === 0 ? (x) => x * (1 - x / 2) * Math.exp(-x / 2) : (x) => x * x * Math.exp(-x / 2);
    let mx = 0;
    for (let i = 1; i <= 400; i++) mx = Math.max(mx, Math.abs(u(i * 0.05)));
    const E = -0.125, tp = l === 0 ? [[8, 'r_2']] : [[4 - 2 * Math.SQRT2, 'r_1'], [4 + 2 * Math.SQRT2, 'r_2']];
    return PF.plot({
      w: 300, h: 210, x: [0, 18], y: [-0.4, 0.05], zero: true, xl: 'r/a',
      hlines: [[E, 'E_2']], vlines: tp,
      curves: [
        { f: V, from: l === 0 ? 2.5 : 1.0, cls: 'dim' },
        { f: (x) => E + 0.11 * u(x) / mx, from: 0 },
      ],
    });
  }
  const uFig = PF.row([
    { svg: uSketch(0), cap: '$2s$ ($\\ell = 0$): one node, decays beyond $r_2$' },
    { svg: uSketch(1), cap: '$2p$ ($\\ell = 1$): starts like $r^2$, no node' },
  ]);

  // spherical box: u(r) = r j_l(beta r/b), drawn at E in units of hbar^2/2mb^2
  const jl = (l, z) => {
    if (z < 1e-6) return l === 0 ? 1 : 0;
    const s = Math.sin(z), c = Math.cos(z);
    if (l === 0) return s / z;
    if (l === 1) return s / (z * z) - c / z;
    return (3 / (z * z * z) - 1 / z) * s - 3 * c / (z * z);
  };
  const BOX = [{ l: 0, b: Math.PI, t: '1s' }, { l: 1, b: 4.4934, t: '1p' }, { l: 2, b: 5.7635, t: '1d' }, { l: 0, b: 2 * Math.PI, t: '2s' }];
  const boxFig = PF.plot({
    w: 360, h: 260, x: [0, 1.2], y: [0, 46], xl: 'r/b', yl: 'E',
    xt: [[1, 'b']], yt: [[9.87, '9.87'], [20.19, '20.2'], [33.22, '33.2'], [39.48, '39.5']],
    curves: BOX.map((s) => {
      let mx = 0;
      for (let i = 1; i <= 200; i++) mx = Math.max(mx, Math.abs((i / 200) * jl(s.l, s.b * i / 200)));
      return { f: (x) => s.b * s.b + 3.2 * x * jl(s.l, s.b * x) / mx, from: 0, to: 1, lab: s.t, labAt: 1, dx: 8, dy: 0 };
    }).concat([{ pts: [[1, 0], [1, 46]], cls: 'dim' }]),
  });

  // columns of short level lines (as in Unit 3)
  function ladder(cols, lv, yr, o = {}) {
    const f = PF.fig({});
    const W = o.W || 80, top = 16, H = o.h || 200, x0 = 46;
    const Y = (y) => top + (yr[1] - y) / (yr[1] - yr[0]) * H;
    f.line(x0 - 16, top + H + 4, x0 - 16, top - 10, { cls: 'dim', arrow: 'end', hs: 5 });
    f.label(x0 - 22, top - 8, o.yl || 'E', 'r', 'small');
    (o.ticks || []).forEach(([v, t]) => f.label(x0 - 22, Y(v), t, 'r', 'small accent'));
    cols.forEach((c, i) => f.label(x0 + i * W + 20, top + H + 14, c, 't', 'small'));
    lv.forEach((l) => { const x = x0 + l.c * W, y = Y(l.y); f.line(x, y, x + 40, y, { cls: 'thick' }); if (l.t) f.label(x + 44, y, l.t, 'l', 'small'); });
    return f.svg();
  }
  const boxLadder = ladder(['s', 'p', 'd', 'f'], [
    { c: 0, y: 9.87, t: '1s' }, { c: 0, y: 39.48, t: '2s' }, { c: 1, y: 20.19, t: '1p' }, { c: 1, y: 59.68, t: '2p' },
    { c: 2, y: 33.22, t: '1d' }, { c: 3, y: 48.83, t: '1f' },
  ], [5, 64], { yl: 'E' });
  const hLadder = ladder(['s', 'p', 'd', 'f'], [
    { c: 0, y: -1, t: '1s' }, { c: 0, y: -0.25, t: '2s' }, { c: 1, y: -0.25, t: '2p' },
    { c: 0, y: -1 / 9, t: '3s' }, { c: 1, y: -1 / 9, t: '3p' }, { c: 2, y: -1 / 9, t: '3d' },
    { c: 0, y: -1 / 16 }, { c: 1, y: -1 / 16 }, { c: 2, y: -1 / 16 }, { c: 3, y: -1 / 16, t: 'n=4' },
  ], [-1.06, 0.02], { yl: 'E', ticks: [[-1, '-13.6'], [-0.25, '-3.4'], [0, '0']] });
  const ladders = PF.row([
    { svg: boxLadder, cap: 'Spherical box: every $\\ell$ at its own energy' },
    { svg: hLadder, cap: 'Hydrogen (eV): all $\\ell < n$ share $E_n$' },
  ]);

  // hydrogen radial probability densities P(r) = r^2 |R|^2, r in units of a
  const hydroP = PF.plot({
    w: 400, h: 230, x: [0, 16], y: [0, 0.6], xl: 'r/a', yl: 'a\\,P(r)',
    xt: [[1, '1'], [2, '2'], [4, '4'], [8, '8']],
    curves: [
      { f: (x) => 4 * x * x * Math.exp(-2 * x), lab: '1s', labAt: 1.25, dy: -10 },
      { f: (x) => x * x * (1 - x / 2) ** 2 * Math.exp(-x) / 2, cls: 'dim', lab: '2s', labAt: 7, dy: -10 },
      { f: (x) => x ** 4 * Math.exp(-x) / 24, cls: 'dash', lab: '2p', labAt: 3.2, dx: -16, dy: -16 },
    ],
  });

  const paper = (title, head, items, figs) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>${title}</span><span>20 pts · 5 per part</span></div>`,
    head, figs, items,
  });

  C.unit({
    id: 'u10', exam: 'm2', num: 'Unit 4', title: 'Central potentials and hydrogen',
    blurb: 'The radial equation, the effective potential and boundary conditions, the spherical box, and the hydrogen atom: spectrum, wavefunctions, spectral lines, accidental degeneracy (Discussion 8).',
    lessons: [
      // ================================================================== Topic 20
      {
        id: 't20-radial', topic: 20, title: 'The radial equation, the effective potential, the spherical box', ref: 'Griffiths 4.1.3 · Discussion 8',
        steps: [
          RF(md`
            ### The picture

            For any $V(r)$ the stationary states are $\psi = R(r)\,Y_\ell^m(\theta, \phi)$; the angles are done (Topics 18–19). Put $u(r) \equiv rR(r)$ and the radial equation becomes
            $$-\frac{\hbar^2}{2m}\frac{d^2u}{dr^2} + \underbrace{\left[V(r) + \frac{\hbar^2\ell(\ell+1)}{2mr^2}\right]}_{V_{\text{eff}}(r)}u = Eu,\qquad 0 < r < \infty$$
            **This is the 1D Schrödinger equation on a half-line.** Everything you learned for Midterm 1 applies to $u$: it oscillates where $E > V_{\text{eff}}$ (curving toward the axis, with shorter wavelength where $E - V_{\text{eff}}$ is larger), decays exponentially where $E < V_{\text{eff}}$, the $N$th bound state has $N - 1$ nodes, bound states are discrete, $E > 0$ (for $V \to 0$ at infinity) is a continuum.

            **Why $u$ and not $R$.** Two reasons. The radial derivative collapses: $R = u/r$ gives $r^2R' = ru' - u$ and $(r^2R')' = ru''$, so $\tfrac{1}{r^2}(r^2R')' = u''/r$; multiply the whole equation by $r$ and you have the line above. And the probability of being between $r$ and $r + dr$ is $|R|^2r^2dr = |u|^2dr$: **$|u|^2$ is the radial probability density directly**, normalized by $\int_0^\infty|u|^2dr = 1$.

            !!intuition What the centrifugal term is
              $\hbar^2\ell(\ell+1)/2mr^2$ is not a force from anything. It is the kinetic energy of the angular motion, $L^2/2mr^2$ with $L^2 = \hbar^2\ell(\ell+1)$, written as if it were potential energy so that the radial motion looks 1D. At fixed angular momentum, getting close to the center means spinning fast, which costs energy like $1/r^2$: angular momentum keeps the particle away from the origin. A planet with angular momentum cannot fall into the sun for the same reason.

            ### Boundary conditions

            **$u(0) = 0$, always.** Near the origin (for $\ell \ge 1$) the centrifugal term dominates: $u'' \approx \ell(\ell+1)u/r^2$. Try $u = r^s$: $s(s-1) = \ell(\ell+1)$, so $s = \ell + 1$ or $s = -\ell$. The second gives $\int|u|^2dr \sim \int_0r^{-2\ell}dr = \infty$: not normalizable. For $\ell = 0$ the two behaviors are $u \to$ const and $u \propto r$. A constant $u(0) \ne 0$ means $\psi \approx u(0)/(\sqrt{4\pi}\,r)$ near the origin, which **is** normalizable, but it is not a solution: $\nabla^2(1/r) = -4\pi\delta^3(\vb r)$, so the kinetic term produces a delta function that nothing in $V\psi$ or $E\psi$ can cancel (Discussion 8, 1(a)). So in every case
            $$u \propto r^{\ell+1},\qquad R = u/r \propto r^\ell\quad\text{near } r = 0$$
            Only $\ell = 0$ states have $R(0) \ne 0$: **only $s$ states reach the nucleus.** (That is why the contact hyperfine interaction and electron capture involve $s$ electrons.)

            **At large $r$:** bound states must decay ($\int|u|^2dr < \infty$); scattering states only need to stay bounded (oscillate). $u$ and $u'$ are continuous wherever $V$ is finite.

            !!key The half-line trick
              $u(0) = 0$ is exactly the condition an infinite wall would impose at $r = 0$. So the $\ell = 0$ radial problem for $V(r)$ is the set of **odd** states of the 1D problem with potential $V(|x|)$ on the whole line. Three payoffs: the $\ell = 0$ spherical box is the odd states of a box of width $2b$; the $\ell = 0$ states of the 3D oscillator are the odd 1D oscillator states, $E = \hbar\omega(2k + \tfrac32)$ (the half-oscillator of Discussion 5); and a spherical well needs a **minimum depth** to bind anything, because the 1D finite well's first odd state needs $z_0 > \pi/2$.

            ### Reading the effective potential

            For the Coulomb potential $V = -k/r$ (with $a = \hbar^2/mk$, the Bohr radius):

            [[fig:veff]]

            - $\ell = 0$: $-k/r$ all the way down; the particle can reach the origin.
            - $\ell \ge 1$: $+\infty$ at the origin (the $1/r^2$ wins), a single minimum at $r = \ell(\ell+1)a$ of depth $E_1/\ell(\ell+1)$ (with $E_1 = -k/2a$), then $0^-$ from below. Higher $\ell$: the well moves out and gets shallower.
            - $E < 0$: allowed region between turning points, bound, discrete. $E > 0$: allowed out to infinity, scattering, continuous. For two like charges, $V = +k/r$: $V_{\text{eff}} > 0$ everywhere, no well, **no bound states**.

            [[fig:u]]
          `, {
            veff: { svg: veff, cap: 'Coulomb $V_{\\text{eff}}$ for $\\ell = 0, 1, 2$. Dots: the minima at $r = 2a$ and $6a$. Dashed: $E_1$ and $E_2$.' },
            u: { svg: uFig.svg, cap: 'Hydrogen $n = 2$: $u(r)$ drawn at its energy on $V_{\\text{eff}}$. Oscillating between the turning points, decaying outside them.' },
          }),
          RF(md`
            ### The spherical box

            $V = 0$ for $r < b$, infinite outside. Inside, $u'' = \left[\tfrac{\ell(\ell+1)}{r^2} - k^2\right]u$ with $k = \sqrt{2mE}/\hbar$.

            **$\ell = 0$:** $u = A\sin kr$ ($\cos kr$ is excluded by $u(0) = 0$), and $u(b) = 0$ gives $kb = N\pi$:
            $$E_{N0} = \frac{N^2\pi^2\hbar^2}{2mb^2},\qquad R = A\frac{\sin(N\pi r/b)}{r}\quad(\text{finite at } r = 0: \sin kr/r \to k)$$
            **Any $\ell$:** $R = j_\ell(kr)$, the spherical Bessel function (the solution that behaves like $r^\ell$ at the origin), and $E_{N\ell} = \hbar^2\beta_{N\ell}^2/2mb^2$ with $\beta_{N\ell}$ the $N$th zero of $j_\ell$:

            | | $N = 1$ | $N = 2$ | $N = 3$ |
            |---|---|---|---|
            | $\ell = 0$ ($s$) | 3.14 | 6.28 | 9.42 |
            | $\ell = 1$ ($p$) | 4.49 | 7.73 | 10.90 |
            | $\ell = 2$ ($d$) | 5.76 | 9.10 | |
            | $\ell = 3$ ($f$) | 6.99 | | |
            | $\ell = 4$ ($g$) | 8.18 | | |

            Sorted by energy: $1s$ (9.87), $1p$ (20.2), $1d$ (33.2), $2s$ (39.5), $1f$ (48.8), $2p$ (59.7), $1g$ (67.0) in units of $\hbar^2/2mb^2$. Here the number in front is $N$, the radial count (not hydrogen's $n$). At fixed $N$ the energy rises with $\ell$, and the ground state is $1s$.

            [[fig:box]]

            !!intuition Why the ground state always has $\ell = 0$
              The centrifugal term is a positive addition to the potential. Take the lowest $\ell \ge 1$ state $u$ (same boundary conditions as $\ell = 0$): its energy is $\bra u\hat H_0\ket u$ plus $\tfrac{\hbar^2\ell(\ell+1)}{2m}\int\tfrac{|u|^2}{r^2}dr > 0$, and $\bra u\hat H_0\ket u \ge E_{10}$ because no state has energy below the ground state (Discussion 8, 2(a)). Physically: spinning costs energy and buys nothing.

            **Degeneracy.** Each level is one $\ell$ multiplet: exactly $2\ell + 1$, nothing more. The zeros of different $j_\ell$ never coincide. That is the generic central potential; hydrogen (Topic 21) is the exception.

            **Magic numbers.** In the simplest nuclear shell model each nucleon moves in a spherical box made by the others, two per orbital state (spin). Filling $1s, 1p, 1d, 2s, 1f, 2p$: $2, 8, 18, 20, 34, 40$. Nuclei with 2, 8 and 20 protons or neutrons are unusually stable; beyond 20 the real magic numbers (28, 50, 82) need the spin–orbit interaction.

            [[fig:ladders]]
          `, {
            box: { svg: boxFig, cap: 'Spherical box: $u = r\\,j_\\ell(kr)$ drawn at its energy (units $\\hbar^2/2mb^2$). $u(0) = 0$ acts like a wall at the center; $\\ell \\ge 1$ states start flatter.' },
            ladders: { svg: ladders.svg, cap: 'The box has one $\\ell$ per level. Hydrogen stacks different $\\ell$ at the same energy: an accidental degeneracy.' },
          }),
          R(md`
            ### Worked example

            !!graded Problem
              An electron is confined in a spherical box of radius $b = 0.1$ nm ($\hbar^2/2m_e = 0.0381$ eV·nm²). (a) Energies of the $1s$ and $1p$ levels, and the wavelength of the photon emitted in $1p \to 1s$. (b) For $1s$, where is $|\psi|^2$ largest, and what is the most probable distance from the center?

            **(a)** $\hbar^2/2mb^2 = 0.0381/0.01 = 3.81$ eV. $E_{1s} = \pi^2(3.81) = 37.6$ eV; $E_{1p} = 4.493^2(3.81) = 76.9$ eV. $\Delta E = 39.3$ eV, $\lambda = 1240/39.3 = 31.5$ nm (extreme UV).

            **(b)** $\psi_{1s} \propto \sin(\pi r/b)/r$, so $|\psi|^2 \propto \sin^2(\pi r/b)/r^2$, largest at $r \to 0$ (it tends to $\pi^2/b^2$). The radial probability is $|u|^2 \propto \sin^2(\pi r/b)$, peaked at $r = b/2$, and symmetric about it, so $\langle r\rangle = b/2$ too. Density largest at the center, most probable distance halfway out: the shell volume again.

            !!mistake Common mistakes
              - Using $|R|^2dr$ as the radial probability. It is $|R|^2r^2dr = |u|^2dr$.
              - "For $\ell = 0$, $u(0) = 0$, so $\psi(0) = 0$." No: $R = u/r \to u'(0) \ne 0$. $s$ states are nonzero at the origin.
              - Dropping $u(0) = 0$ and allowing $\cos kr$ in the box: that is the delta-function non-solution.
              - Treating the centrifugal term as a real repulsive force from the potential. It is rotational kinetic energy.
              - Calling the box levels $1s, 2p, 3d$ like hydrogen. The box label is the radial count $N$: $1s, 1p, 1d, 2s, \ldots$
              - Expecting every attractive 3D well to bind. In 3D the well must be strong enough ($z_0 > \pi/2$ for a square well).

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`The term $\dfrac{\hbar^2\ell(\ell+1)}{2mr^2}$ in $V_{\text{eff}}$ is…`,
            ['the kinetic energy of the angular motion at fixed L²', 'the potential energy of an external centrifugal force field', 'the spin–orbit interaction', 'a correction that only matters for hydrogen'], 0,
            [null, 'There is no such field; it comes from the angular part of p²/2m.', 'Spin is not in this course yet, and this term exists for spinless particles.', 'It is the same for every central potential.'],
            md`$\hat p^2/2m$ splits into a radial part and $\hat L^2/2mr^2$; with $L^2 = \hbar^2\ell(\ell+1)$ the angular part looks like a $1/r^2$ potential.`),
          Q(md`$|u(r)|^2dr$ is…`,
            ['the probability of being between r and r + dr, any direction', 'the probability density at a point at distance r', md`the probability per unit volume divided by $r$`, 'not a probability; only |R|² is'], 0,
            [null, md`That is $|\psi|^2 = |R|^2|Y|^2$.`, 'No.', md`$|R|^2r^2dr = |u|^2dr$: $u$ is designed for exactly this.`],
            md`$\int|\psi|^2d^3r = \int|R|^2r^2dr\int|Y|^2d\Omega = \int|u|^2dr$.`),
          L(2, 'set up'),
          Q(md`Why is $u(0) \ne 0$ ruled out for $\ell = 0$?`,
            [md`Then $\psi \propto 1/r$ near the origin, and $\nabla^2(1/r) = -4\pi\delta^3(\vb r)$ leaves an uncancelled delta function: not a solution`, md`Then $\psi \propto 1/r$ is not normalizable`, md`Then $R$ would vanish at the origin`, md`Because $V$ is infinite at the origin`], 0,
            [null, md`$\int(1/r)^2r^2dr$ is finite near 0. The problem is the equation, not normalization.`, 'Backwards.', md`Not true in general (the box has $V = 0$ there).`],
            md`Discussion 8, 1(a): the common "not normalizable" answer is wrong for $\ell = 0$.`),
          P({
            title: 'Behavior at the origin',
            q: md`Near $r = 0$, $u \propto r^s$. For $\ell = 2$, what is the allowed $s$, and what power of $r$ does $R$ start with?`,
            parts: [{ lbl: 's', ans: 3 }, { lbl: 'R \\propto r^p:\\ p', ans: 2 }],
            hints: [md`$s(s-1) = \ell(\ell+1) = 6$.`],
            sol: md`$s = 3$ or $s = -2$; only $s = \ell + 1 = 3$ is normalizable. $R = u/r \propto r^2$: a $d$ electron is very rarely near the center.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Spherical-box ratios',
            q: md`For a particle in a spherical box, find $E_{2s}/E_{1s}$ and $E_{1p}/E_{1s}$.`,
            parts: [{ lbl: 'E_{2s}/E_{1s}', ans: 4 }, { lbl: 'E_{1p}/E_{1s}', ans: 2.046 }],
            hints: [md`$E \propto\beta^2$: $\beta_{1s} = \pi$, $\beta_{2s} = 2\pi$, $\beta_{1p} = 4.493$.`],
            sol: md`$(2\pi/\pi)^2 = 4$; $(4.493/\pi)^2 = 2.046$.`,
          }),
          P({
            title: 'An electron in a sphere',
            q: md`An electron is confined to a sphere of radius $0.2$ nm. Find its ground-state energy ($\hbar^2/2m_e = 0.0381$ eV·nm²).`,
            parts: [{ lbl: 'E_{1s}', ans: 9.401, unit: 'eV' }],
            hints: [md`$E = \pi^2\hbar^2/2mb^2$.`],
            sol: md`$\pi^2\cdot0.0381/0.04 = 9.40$ eV.`,
          }),
          Q(md`List the spherical-box levels in order of energy. The fourth level is…`,
            [md`$2s$`, md`$1f$`, md`$2p$`, md`$1d$`], 0,
            [null, md`$1f$ (48.8) is fifth.`, md`$2p$ (59.7) is sixth.`, md`$1d$ (33.2) is third.`],
            md`$1s$ 9.87, $1p$ 20.2, $1d$ 33.2, $2s$ 39.5, $1f$ 48.8, $2p$ 59.7 (units $\hbar^2/2mb^2$).`),
          L(4, 'one twist'),
          P({
            title: 'The ℓ = 2 Coulomb well',
            q: md`For hydrogen, where is the minimum of $V_{\text{eff}}$ for $\ell = 2$ (in units of $a$), and how deep is it (eV, with $E_1 = -13.6$ eV)?`,
            parts: [{ lbl: 'r_{\\min}/a', ans: 6 }, { lbl: 'V_{\\text{eff}}(r_{\\min})', ans: -13.6 / 6, unit: 'eV' }],
            hints: [md`$r_{\min} = \ell(\ell+1)a$, depth $E_1/\ell(\ell+1)$.`],
            sol: md`$dV_{\text{eff}}/dr = k/r^2 - \hbar^2\ell(\ell+1)/mr^3 = 0$ gives $r = \ell(\ell+1)a = 6a$; $V = -\tfrac{k}{6a} + \tfrac{k}{12a} = -\tfrac{k}{12a} = E_1/6 = -2.27$ eV. The lowest $d$ level is $E_3 = -1.51$ eV, above the bottom ✓.`,
          }),
          Q(md`Why are there no bound states for $V = +k/r$ (two like charges)?`,
            [md`$V_{\text{eff}} > 0$ everywhere and falls to 0 at large $r$: there is no well, so any allowed region extends to infinity`, 'The Coulomb force is too weak', md`$u(0) = 0$ cannot be satisfied`, md`The spectrum is discrete but all levels are above 0`], 0,
            [null, md`Strength doesn't matter; the sign does.`, md`It can; the trouble is at large $r$.`, 'A discrete level above the asymptotic value would not be normalizable.'],
            md`Bound states need $E < V(\infty) = 0$ somewhere allowed; with $V_{\text{eff}} > 0$ there is nowhere.`),
          P({
            title: 'Most probable radius in the box',
            q: md`For the $1s$ state of a spherical box of radius $b$, find the most probable $r$ and $\langle r\rangle$, in units of $b$.`,
            parts: [{ lbl: 'r_{\\text{mp}}/b', ans: 0.5 }, { lbl: '\\langle r\\rangle/b', ans: 0.5 }],
            hints: [md`$|u|^2 \propto\sin^2(\pi r/b)$.`],
            sol: md`$\sin^2(\pi r/b)$ peaks at $b/2$ and is symmetric about $b/2$ on $[0, b]$, so the mean is $b/2$ as well.`,
          }),
          L(5, 'exam level'),
          P({
            title: 'The deuteron needs a deep well',
            q: md`Model the neutron–proton force as a spherical well of radius $b = 2.0$ fm, with reduced mass $mc^2 = 469$ MeV. Find the minimum depth $V_0$ (MeV) for a bound state, using $\hbar c = 197.3$ MeV·fm.`,
            parts: [{ lbl: 'V_{0,\\min}', ans: 25.6, unit: 'MeV' }],
            hints: [md`$\ell = 0$ = odd states of the 1D well: need $z_0 = \tfrac{b}{\hbar}\sqrt{2mV_0} > \tfrac\pi2$.`],
            sol: md`$V_0 > \dfrac{\pi^2\hbar^2}{8mb^2} = \dfrac{\pi^2(197.3)^2}{8(469)(4.0)} = 25.6$ MeV. The real deuteron is bound by only 2.2 MeV: it barely makes it.`,
          }),
          Q(md`In 1D any attractive well, however shallow, has a bound state. In 3D a shallow spherical well has none. Why?`,
            [md`The $\ell = 0$ radial problem is the odd states of the 1D well (because $u(0) = 0$), and the first odd state needs $z_0 > \pi/2$`, 'In 3D the kinetic energy is three times larger', 'The centrifugal barrier blocks binding for ℓ = 0', 'Wavefunctions in 3D cannot be normalized'], 0,
            [null, 'Not the reason; the zero-point argument is about the node at the origin.', md`$\ell = 0$ has no centrifugal term.`, 'They can.'],
            md`The 1D ground state is even, with no node; the half-line forces a node at $r = 0$, which costs kinetic energy that a shallow well can't pay.`),
          P({
            title: 'ℓ = 0 states of the 3D oscillator',
            q: md`Using the half-line trick, find the energy (units $\hbar\omega$) of the **second** $\ell = 0$ level of the 3D oscillator.`,
            parts: [{ lbl: 'E/\\hbar\\omega', ans: 3.5 }],
            hints: [md`$\ell = 0$ states are the odd 1D states: $n = 1, 3, 5, \ldots$`],
            sol: md`Odd 1D states: $\hbar\omega(1 + \tfrac12)$, $\hbar\omega(3 + \tfrac12)$, … The second is $3.5\hbar\omega$, i.e. $N = 2$, which indeed contains an $\ell = 0$ state (Topic 17).`,
          }),
          Q(md`Which states have a nonzero probability density at the origin?`,
            [md`only $\ell = 0$ states`, md`only $\ell \ge 1$ states`, 'all states', 'none: u(0) = 0 for all'], 0,
            [null, md`$R \propto r^\ell$ vanishes at the origin for $\ell \ge 1$.`, md`$R \propto r^\ell$: zero at the origin unless $\ell = 0$.`, md`$u(0) = 0$ but $R = u/r$ need not vanish.`],
            md`$R(0) = u'(0) \ne 0$ only for $\ell = 0$.`),
          L(6, 'harder than the exam'),
          P({
            title: 'Shell closures',
            q: md`In the spherical-box shell model (2 nucleons per orbital state), how many protons fill every level up to and including $1f$? And up to $2p$?`,
            parts: [{ lbl: 'N_{\\le1f}', ans: 34 }, { lbl: 'N_{\\le2p}', ans: 40 }],
            hints: [md`Order $1s, 1p, 1d, 2s, 1f, 2p$; each holds $2(2\ell + 1)$.`],
            sol: md`$2 + 6 + 10 + 2 + 14 = 34$; $+6 = 40$. (Real magic numbers beyond 20 are 28, 50, 82: spin–orbit reshuffles the levels.)`,
          }),
          P({
            title: 'Counting s states in a spherical well',
            q: md`A spherical well has $z_0 = \tfrac b\hbar\sqrt{2mV_0} = 5$. How many $\ell = 0$ bound states does it have?`,
            parts: [{ lbl: 'N_{s}', ans: 2 }],
            hints: [md`Odd 1D states appear at $z_0 = \pi/2, 3\pi/2, 5\pi/2, \ldots$`],
            sol: md`$\pi/2 = 1.57$ and $3\pi/2 = 4.71$ are below 5; $5\pi/2 = 7.85$ is not. Two $s$ states.`,
          }),
          P({
            title: 'Turning points for a 2p electron',
            q: md`Hydrogen, $\ell = 1$, $E = E_2 = E_1/4$. Find the classical turning points in units of $a$.`,
            parts: [{ lbl: 'r_1/a', ans: 4 - 2 * Math.SQRT2 }, { lbl: 'r_2/a', ans: 4 + 2 * Math.SQRT2 }],
            hints: [md`In units of $k/a$: $-\tfrac1x + \tfrac{1}{x^2} = -\tfrac18$.`],
            sol: md`$x^2 - 8x + 8 = 0$: $x = 4 \mp 2\sqrt2 = 1.17$ and $6.83$. The $2p$ radial probability peaks at $4a$, right between them (see the figure).`,
          }),
          Q(md`For $\ell \ge 1$, the inner turning point exists because…`,
            ['the centrifugal term makes V_eff → +∞ at the origin', 'the Coulomb attraction is repulsive at short distance', 'u(0) = 0', 'E is negative'], 0,
            [null, 'Coulomb attraction only gets stronger.', md`$u(0) = 0$ holds for $\ell = 0$ too, which has no inner turning point.`, md`$E > 0$ states with $\ell \ge 1$ have it too.`],
            md`$\hbar^2\ell(\ell+1)/2mr^2$ beats $-k/r$ as $r \to 0$.`),
          R(md`
            ### Exam-style problem
          `),
          paper('Exam-style problem · Topic 20', md`
            **A shallow spherical well** [20 points, 5 per part]

            A particle of mass $m$ moves in $V(r) = -V_0$ for $r < b$ and $V = 0$ for $r > b$ ($V_0 > 0$). Write $\psi = R(r)Y_\ell^m(\theta,\phi)$, $u = rR$, and
            $$-\frac{\hbar^2}{2m}u'' + \left[V(r) + \frac{\hbar^2\ell(\ell+1)}{2mr^2}\right]u = Eu.$$
            For the 1D finite well of half-width $b$, odd bound states exist only when $z_0 = \tfrac b\hbar\sqrt{2mV_0}$ exceeds $\pi/2, 3\pi/2, \ldots$
          `, [
            {
              q: md`**(a)** State the boundary condition on $u$ at $r = 0$ and explain where it comes from for $\ell = 0$. Then explain why the $\ell = 0$ bound states are exactly the **odd** bound states of the 1D finite well $V(|x|)$ of half-width $b$.`,
              ans: md`$u(0) = 0$. For $\ell = 0$, $u(0) \ne 0$ gives $\psi \propto 1/r$, and $\nabla^2(1/r) = -4\pi\delta^3$ is not cancelled. With $\ell = 0$ the radial equation is the 1D equation with $V(|x|)$ on $x > 0$, and $u(0) = 0$ selects the odd solutions.`,
              sol: md`
                **How to see it.** For $\ell = 0$ the radial equation **is** the 1D Schrödinger equation; the only memory of 3D is the condition at the origin, which acts like a wall.

                $u(0) = 0$: near the origin $u \to$ const would make $\psi \approx u(0)/(\sqrt{4\pi}r)$; then $-\tfrac{\hbar^2}{2m}\nabla^2\psi$ contains $\tfrac{\hbar^2}{2m}\tfrac{u(0)}{\sqrt{4\pi}}4\pi\delta^3(\vb r)$, and nothing else in the equation has a delta function. Odd states: an odd solution of the 1D problem on the whole line vanishes at $x = 0$ and solves the same equation for $x > 0$; conversely any $u$ with $u(0) = 0$ extends to an odd function. Same equation, same conditions, same energies.

                **Rubric**
                - 5: $u(0) = 0$ with the delta-function reason (or a correct normalizability argument for $\ell \ge 1$ plus the $\ell = 0$ reason), and the odd-extension argument.
                - 4: $u(0) = 0$ only justified by "not normalizable" for $\ell = 0$, otherwise right.
                - 3: correct condition, odd-state connection asserted.
                - 2: claims $R(0) = 0$ or $u'(0) = 0$.
                - 1: little progress.
              `,
            },
            {
              q: md`**(b)** Using (a), find the minimum value of $V_0b^2$ for which the well has any bound state. Contrast with the 1D finite well, and explain physically why 3D is harder to bind.`,
              ans: md`$V_0b^2 > \dfrac{\pi^2\hbar^2}{8m}$ (from $z_0 > \pi/2$). In 1D any depth binds (the even ground state has no node); in 3D the forced node at $r = 0$ costs kinetic energy.`,
              sol: md`
                **How to see it.** The 1D ground state is even and nodeless and survives any shallow well; it is exactly the state 3D forbids.

                The lowest $\ell = 0$ state is the first odd 1D state, which exists only for $z_0 > \pi/2$: $\tfrac{b^2}{\hbar^2}2mV_0 > \tfrac{\pi^2}{4}$, so $V_0b^2 > \tfrac{\pi^2\hbar^2}{8m}$. Physically, $u$ must start at zero and turn over inside the well before it can decay outside; that curvature costs kinetic energy $\sim\hbar^2/mb^2$, which a shallow well cannot pay. (Deuteron: $b = 2$ fm gives $V_0 > 26$ MeV.)

                **Rubric**
                - 5: correct threshold, the 1D contrast, and a physical reason (node/curvature/kinetic cost).
                - 4: threshold right, explanation thin.
                - 3: uses $z_0 > \pi$ or forgets the factor in $z_0$, but the logic is right.
                - 2: says every attractive well binds in 3D.
                - 1: little progress.
              `,
            },
            {
              q: md`**(c)** Sketch $V_{\text{eff}}$ for $\ell = 0$ and $\ell = 1$ on the same axes. Without solving anything, argue that if the well has exactly one bound state, it has $\ell = 0$.`,
              ans: md`$\ell = 0$: the square well. $\ell = 1$: the same plus $\hbar^2/mr^2$, $+\infty$ at the origin, a shallower and narrower dip. The centrifugal term only raises energies, so the lowest $\ell \ge 1$ level lies above the lowest $\ell = 0$ level; the first state to appear is $\ell = 0$.`,
              sol: md`
                **How to see it.** Adding a positive potential can only push levels up.

                Sketch: $\ell = 0$: flat at $-V_0$ out to $b$, then 0. $\ell = 1$: $-V_0 + \hbar^2/mr^2$ inside (diving from $+\infty$), a jump at $b$, then $+\hbar^2/mr^2$ outside decaying to 0: a barrier on the outside. Argument: for any trial $u$, $\bra u\hat H_\ell\ket u = \bra u\hat H_0\ket u + \tfrac{\hbar^2\ell(\ell+1)}{2m}\int\tfrac{|u|^2}{r^2}dr > \bra u\hat H_0\ket u \ge E_{\min}^{(\ell = 0)}$. So the lowest $\ell = 1$ energy is above the lowest $\ell = 0$ energy. As the well deepens, the $s$ state appears first; a single bound state is an $s$ state.

                **Rubric**
                - 5: both sketches (barrier/divergence for $\ell = 1$), the positive-term argument with the variational step.
                - 4: argument right, sketch missing the $\ell = 1$ divergence at the origin.
                - 3: "centrifugal barrier raises energy" asserted, no comparison argument.
                - 2: sketches swapped or claims higher $\ell$ binds more easily.
                - 1: little progress.
              `,
            },
            {
              q: md`**(d)** True or false? Justify briefly. "For the $\ell = 0$ ground state, $u(0) = 0$, so the particle is never found at the center of the well: $|\psi(0)|^2 = 0$."`,
              ans: md`False. $\psi \propto R = u/r$, and $u \approx u'(0)r$ near 0, so $R(0) = u'(0) \ne 0$. $s$ states have nonzero density at the center (finding it exactly at a point still has probability 0, for any state).`,
              sol: md`
                **How to see it.** $u$ carries an extra factor of $r$ compared with $R$; $u(0) = 0$ is just the shell volume vanishing at the origin.

                Near the origin $u \propto r^{\ell+1} = r$, so $R = u/r \to$ const $\ne 0$ and $|\psi(0)|^2 = |R(0)|^2/4\pi > 0$. (Inside this well, $u = A\sin(\kappa r)$ with $\kappa = \sqrt{2m(E + V_0)}/\hbar$, so $R \to A\kappa$.) Only $\ell \ge 1$ states vanish at the origin, like $r^\ell$. The radial probability $|u|^2dr$ does vanish at $r = 0$, because the shell there has no volume.

                **Rubric**
                - 5: False, $R = u/r$ finite at 0, density vs radial probability distinguished.
                - 4: False with $R = u/r$ but no explanation of why $u(0) = 0$ anyway.
                - 3: False, vague reason.
                - 2: True.
                - 1: correct verdict, no justification.
              `,
            },
          ]),
          R(md`
            ### Endless practice
          `),
          G('m2_veff'),
          G('m2_box3d'),
          R(md`**Where this shows up:** [Discussion 8](#/l/disc8) Problems 1–2 (boundary conditions, $V_{\text{eff}}$, the spherical box, magic numbers), [Discussion 5](#/l/disc5) (the half-oscillator is the half-line trick in 1D).`),
        ],
        bank: [
          Q(md`The radial equation in $u = rR$ looks like…`, ['the 1D Schrödinger equation on 0 < r < ∞ with V_eff', 'the 3D equation with no angular part', 'the free-particle equation', 'a first-order equation'], 0,
            [null, 'The angular part became the centrifugal term.', 'V is still there.', 'Second order.'], md`$-\tfrac{\hbar^2}{2m}u'' + V_{\text{eff}}u = Eu$.`),
          Q(md`$\ell = 0$ states of the spherical box have $R \propto$`, [md`$\sin(kr)/r$`, md`$\sin(kr)$`, md`$\cos(kr)/r$`, md`$e^{-kr}/r$`], 0,
            [null, md`That is $u$.`, md`$u = \cos kr$ violates $u(0) = 0$.`, 'Inside V = 0 with E > 0: oscillating.'], md`$u = \sin kr$, $R = u/r$.`),
          Q(md`In the spherical box, which is lower: $1d$ or $2s$?`, [md`$1d$`, md`$2s$`, 'they are degenerate', 'depends on the box radius'], 0,
            [null, md`$2s$: $\beta = 2\pi = 6.28 > 5.76$.`, 'Different zeros: no accidental degeneracy here.', 'Both scale as 1/b².'], md`$5.76^2 < 6.28^2$.`),
          Q(md`The degeneracy of a spherical-box level with angular momentum $\ell$ is…`, [md`$2\ell + 1$`, md`$n^2$`, md`$\ell + 1$`, '1'], 0,
            [null, 'That is hydrogen, thanks to an accident.', 'No.', md`Every $m$ has the same energy.`], md`One multiplet per level: exactly $2\ell + 1$.`),
          Q(md`For hydrogen, the $V_{\text{eff}}$ minimum for $\ell = 1$ is at…`, [md`$2a$`, md`$a$`, md`$4a$`, '0'], 0,
            [null, md`That is where the $1s$ radial probability peaks.`, md`That is where the $2p$ probability peaks.`, md`For $\ell \ge 1$, $V_{\text{eff}} \to +\infty$ at 0.`], md`$r = \ell(\ell+1)a = 2a$.`),
          Q(md`A bound-state $u(r)$ in a region where $E > V_{\text{eff}}$…`, ['curves toward the axis and oscillates', 'curves away from the axis and grows or decays', 'must be zero', 'is a straight line'], 0,
            [null, 'That is the forbidden region.', 'No.', md`Only where $E = V_{\text{eff}}$ (an inflection point).`], md`$u'' = \tfrac{2m}{\hbar^2}(V_{\text{eff}} - E)u$: opposite sign to $u$ when $E > V_{\text{eff}}$.`),
          Q(md`Why does the energy rise with $\ell$ at fixed $N$ in the spherical box?`, ['The centrifugal term is a positive addition to the potential', 'Higher ℓ means more radial nodes', 'Higher ℓ states are larger', 'The box radius shrinks for higher ℓ'], 0,
            [null, md`Fixed $N$ means the same number of radial nodes.`, 'They are pushed outward but that is a consequence, not the reason.', 'No.'], md`Rotational kinetic energy on top of the radial motion.`),
        ],
      },

      // ================================================================== Topic 21
      {
        id: 't21-hydrogen', topic: 21, title: 'The hydrogen atom', ref: 'Griffiths 4.2 · Discussion 8',
        steps: [
          RF(md`
            ### The picture

            The electron sits in $V = -k/r$, $k = e^2/4\pi\varepsilon_0 = 1.44$ eV·nm. Two numbers set everything, and the uncertainty principle already knows them (Topic 9, "Why atoms are stable"): confining the electron to size $r$ costs kinetic energy $\sim\hbar^2/2mr^2$ and gains $-k/r$. Minimizing,
            $$a = \frac{\hbar^2}{mk} = 0.0529\ \text{nm},\qquad E_1 = -\frac{k}{2a} = -\frac{mk^2}{2\hbar^2} = -13.6\ \text{eV}$$
            (The estimate happens to be exact.)

            **The spectrum.** Solving the radial equation (Lecture; Griffiths 4.2) gives
            $$E_n = \frac{E_1}{n^2} = -\frac{13.6\ \text{eV}}{n^2},\qquad n = N + \ell,\quad \ell = 0, 1, \ldots, n - 1,\quad m = -\ell, \ldots, \ell$$
            where $N - 1 = n - \ell - 1$ is the number of radial nodes. Count: $\sum_{\ell=0}^{n-1}(2\ell + 1) = n^2$ states per level (ignoring spin).

            - **Levels crowd toward 0.** Infinitely many bound states, because $-k/r$ has a long tail: a weakly bound electron can sit very far out ($\langle r\rangle \sim n^2a$). A square well, with no tail, has only finitely many.
            - **$E > 0$:** ionized, a continuum. Ionization energy from level $n$: $13.6/n^2$ eV.
            - **Accidental degeneracy.** $E$ depends on $n$ only: $2s$ and $2p$ have the same energy, though their radial equations differ. Rotational symmetry explains only the $2\ell + 1$ within each $\ell$. The rest is a hidden symmetry of the pure $1/r$ potential (the conserved Runge–Lenz vector, which classically keeps Kepler ellipses from precessing). Any change to $1/r$, like the screened core of a sodium atom, splits $s$ from $p$ from $d$, and $s$ lies lowest because it penetrates the core (Discussion 8, 3(c)).

            [[fig:ladders]]

            ### The ground state

            $$\psi_{100} = \frac{1}{\sqrt{\pi a^3}}e^{-r/a},\qquad P(r) = 4\pi r^2|\psi|^2 = \frac{4r^2}{a^3}e^{-2r/a}$$
            - The density is largest **at the nucleus**; the radial probability peaks at $r = a$: the Bohr radius is the most probable distance, not an orbit.
            - $\langle r\rangle = \tfrac32a$ (the tail pulls the mean out), $\langle 1/r\rangle = 1/a$.
            - **Virial theorem** for $1/r$: $\langle V\rangle = -k\langle 1/r\rangle = -k/a = 2E_1 = -27.2$ eV, $\langle T\rangle = E_1 - \langle V\rangle = +13.6$ eV $= -E_1$.
            - **Beyond the turning point.** Classically $E_1 = -k/r$ at $r = 2a$. Quantum mechanically, $P(r > 2a) = 13e^{-4} = 0.24$: a quarter of the time the electron is where a classical electron with that energy could never be.

            One integral does everything: $\int_0^\infty r^ne^{-\beta r}dr = n!/\beta^{n+1}$. For instance $P(r < b) = 1 - e^{-2b/a}\left(1 + \tfrac{2b}{a} + \tfrac{2b^2}{a^2}\right)$.

            ### $n = 2$, and the pattern

            $$R_{20} = \frac{1}{\sqrt2\,a^{3/2}}\left(1 - \frac{r}{2a}\right)e^{-r/2a},\qquad R_{21} = \frac{1}{\sqrt{24}\,a^{3/2}}\frac ra\,e^{-r/2a}$$
            $2s$ has one radial node (at $r = 2a$) and is nonzero at the nucleus; $2p$ has none, starts like $r$, and its radial probability $\propto r^4e^{-r/a}$ peaks at $4a$. In general $\langle r\rangle = \tfrac a2\left[3n^2 - \ell(\ell+1)\right]$ ($2s$: $6a$, $2p$: $5a$), and the "circular" states $\ell = n - 1$ (no radial node) peak at $r = n^2a$: Bohr's orbits are the nodeless states.

            [[fig:hp]]

            ### Light from hydrogen

            A transition $n_i \to n_f$ emits $h\nu = 13.6\ \text{eV}\left(\tfrac{1}{n_f^2} - \tfrac{1}{n_i^2}\right)$, $\lambda = \tfrac{1240\ \text{eV·nm}}{h\nu}$.

            | series | lands on | lines |
            |---|---|---|
            | Lyman | $n_f = 1$ (UV) | Ly$\alpha$ 121.6 nm, Ly$\beta$ 102.6 nm |
            | Balmer | $n_f = 2$ (visible) | H$\alpha$ 656 nm (red), H$\beta$ 486 nm, H$\gamma$ 434 nm, H$\delta$ 410 nm, limit 365 nm |

            **Other one-electron systems.** Nuclear charge $Ze$: $k \to Zk$, so $a \to a/Z$ and $E_n \to Z^2E_1/n^2$ (He$^+$: $-54.4$ eV). A light nucleus: replace $m$ by the reduced mass (positronium, $\mu = m_e/2$: $E_1 = -6.8$ eV).
          `, {
            ladders: { svg: ladders.svg, cap: 'Left: a generic central potential (the spherical box) has one $\\ell$ per level. Right: hydrogen puts every $\\ell < n$ at $E_n$.' },
            hp: { svg: hydroP, cap: 'Radial probabilities $P(r) = r^2|R_{n\\ell}|^2$ for $1s$, $2s$ (gray, node at $2a$) and $2p$ (dashed, peak at $4a$).' },
          }),
          R(md`
            ### Worked example

            !!graded Problem
              For the hydrogen ground state find (a) the most probable $r$ and $\langle r\rangle$; (b) the probability that $r < a$; (c) $\langle T\rangle$ and $\langle V\rangle$.

            **(a)** $P(r) \propto r^2e^{-2r/a}$: $\tfrac{d}{dr} = \left(2r - \tfrac{2r^2}{a}\right)e^{-2r/a} = 0 \Rightarrow r = a$. $\langle r\rangle = \tfrac{4}{a^3}\int_0^\infty r^3e^{-2r/a}dr = \tfrac{4}{a^3}\cdot\tfrac{3!}{(2/a)^4} = \tfrac{4}{a^3}\cdot\tfrac{6a^4}{16} = \tfrac32a$.

            **(b)** With $x = 2r/a$: $P(r < a) = \tfrac12\int_0^2x^2e^{-x}dx = \tfrac12\left[2 - e^{-2}(4 + 4 + 2)\right] = 1 - 5e^{-2} = 0.323$. Only a third of the time inside the Bohr radius.

            **(c)** $\langle 1/r\rangle = \tfrac{4}{a^3}\int_0^\infty re^{-2r/a}dr = \tfrac{4}{a^3}\cdot\tfrac{a^2}{4} = \tfrac1a$, so $\langle V\rangle = -k/a = 2E_1 = -27.2$ eV and $\langle T\rangle = E_1 - \langle V\rangle = 13.6$ eV.

            !!mistake Common mistakes
              - $E_n \propto n^2$ (that's the box). Hydrogen: $E_n \propto -1/n^2$, levels crowding up to 0.
              - Allowing $\ell = n$. The rule is $\ell \le n - 1$: $n = 1$ has only $1s$.
              - Counting $2\ell + 1$ or $2n + 1$ states per level. It is $n^2$ (without spin).
              - Saying the electron "orbits at $r = a$". $a$ is the peak of a broad distribution; $\langle r\rangle = 1.5a$ and 24% of the time $r > 2a$.
              - Mixing up density and radial probability: $|\psi_{100}|^2$ is largest at $r = 0$.
              - Using $hc = 1240$ eV·nm with a photon energy in J (or with $E_n$ instead of $\Delta E$).

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`How many states (ignoring spin) have $n = 3$?`, ['9', '3', '7', '5'], 0,
            [null, md`That counts only the values of $\ell$.`, md`That is one $\ell = 3$ multiplet, which $n = 3$ doesn't have.`, md`That is the $\ell = 2$ multiplet alone.`],
            md`$\ell = 0, 1, 2$: $1 + 3 + 5 = 9 = n^2$.`),
          Q(md`For $n = 3$, the allowed $\ell$ are…`, [md`$0, 1, 2$`, md`$1, 2, 3$`, md`$0, 1, 2, 3$`, md`only $2$`], 0,
            [null, md`$\ell = 0$ is allowed; $\ell = 3$ is not.`, md`$\ell \le n - 1$.`, 'All ℓ < n.'],
            md`$n = N + \ell$ with $N \ge 1$.`),
          L(2, 'set up'),
          P({
            title: 'Energies',
            q: md`Find $E_3$ (eV) and the energy needed to ionize hydrogen from $n = 2$.`,
            parts: [{ lbl: 'E_3', ans: -13.6 / 9, unit: 'eV' }, { lbl: 'E_{\\text{ion}}(n=2)', ans: 3.4, unit: 'eV' }],
            hints: [md`$E_n = -13.6/n^2$ eV.`],
            sol: md`$-1.51$ eV; $13.6/4 = 3.40$ eV.`,
          }),
          P({
            title: 'The red Balmer line',
            q: md`Find the wavelength of the $3 \to 2$ transition (nm).`,
            parts: [{ lbl: '\\lambda', ans: 656.5, unit: 'nm' }],
            hints: [md`$\Delta E = 13.6\left(\tfrac14 - \tfrac19\right)$ eV.`],
            sol: md`$\Delta E = 1.889$ eV, $\lambda = 1240/1.889 = 656$ nm: H$\alpha$, the red line of hydrogen.`,
          }),
          Q(md`Which state has a nonzero probability density at the nucleus?`, [md`$2s$`, md`$2p$`, md`$3d$`, 'none of them'], 0,
            [null, md`$R_{21} \propto r$.`, md`$R_{32} \propto r^2$.`, md`$s$ states do.`],
            md`$R \propto r^\ell$ near 0.`),
          L(3, 'standard'),
          P({
            title: 'Inside the Bohr radius',
            q: md`Ground state: find $P(r < a)$.`,
            parts: [{ lbl: 'P(r < a)', ans: 1 - 5 * Math.exp(-2) }],
            hints: [md`$P(r < b) = 1 - e^{-2b/a}(1 + 2b/a + 2b^2/a^2)$.`],
            sol: md`$1 - 5e^{-2} = 0.323$.`,
          }),
          P({
            title: 'Virial check',
            q: md`Ground state: $\langle T\rangle$ and $\langle V\rangle$ in eV.`,
            parts: [{ lbl: '\\langle T\\rangle', ans: 13.6, unit: 'eV' }, { lbl: '\\langle V\\rangle', ans: -27.2, unit: 'eV' }],
            hints: [md`$\langle 1/r\rangle = 1/a$ and $k/a = 2|E_1|$.`],
            sol: md`$\langle V\rangle = -k/a = -27.2$ eV, $\langle T\rangle = -13.6 + 27.2 = 13.6$ eV. For $V \propto r^{-1}$: $2\langle T\rangle = -\langle V\rangle$.`,
          }),
          Q(md`For $\psi_{100}$, why is $\langle r\rangle = 1.5a$ larger than the most probable $r = a$?`,
            ['P(r) has a long tail to large r that pulls the mean out', 'Because of the uncertainty principle', 'The most probable r is computed from |ψ|², the mean from P(r)', 'They should be equal; 1.5a is a misprint'], 0,
            [null, 'Too vague to be the reason.', 'Both come from P(r).', md`Skewed distributions have mean ≠ mode.`],
            md`$r^2e^{-2r/a}$ rises like $r^2$ and decays slowly: skewed right.`),
          L(4, 'one twist'),
          P({
            title: 'Helium ion',
            q: md`He$^+$ ($Z = 2$, one electron): ground-state energy (eV) and Bohr radius (nm).`,
            parts: [{ lbl: 'E_1', ans: -54.4, unit: 'eV' }, { lbl: 'a_{\\text{He}^+}', ans: 0.02646, unit: 'nm' }],
            hints: [md`$k \to Zk$.`],
            sol: md`$Z^2(-13.6) = -54.4$ eV; $a/Z = 0.0265$ nm. Twice the charge pulls the electron in twice as close and binds it four times as hard.`,
          }),
          P({
            title: 'The 2p electron',
            q: md`For $2p$: the most probable $r$ and $\langle r\rangle$, in units of $a$.`,
            parts: [{ lbl: 'r_{\\text{mp}}/a', ans: 4 }, { lbl: '\\langle r\\rangle/a', ans: 5 }],
            hints: [md`$P \propto r^4e^{-r/a}$; $\langle r\rangle = \tfrac a2[3n^2 - \ell(\ell+1)]$.`],
            sol: md`$\tfrac{d}{dr}(r^4e^{-r/a}) = 0 \Rightarrow r = 4a = n^2a$. $\langle r\rangle = \tfrac{1}{24a^5}\int r^5e^{-r/a}dr = \tfrac{120a^6}{24a^5} = 5a$.`,
          }),
          Q(md`Where is the radial node of the $2s$ wavefunction?`, [md`$r = 2a$`, md`$r = a$`, md`$r = 4a$`, 'at the nucleus'], 0,
            [null, md`$1 - r/2a = 0$ at $2a$.`, md`That is where $2p$ peaks.`, md`$R_{20}(0) \ne 0$.`],
            md`$R_{20} \propto (1 - r/2a)$.`),
          L(5, 'exam level'),
          P({
            title: 'The classically forbidden quarter',
            q: md`Ground state: the classical turning point is $r = 2a$. Find $P(r > 2a)$.`,
            parts: [{ lbl: 'P(r > 2a)', ans: 13 * Math.exp(-4) }],
            hints: [md`$e^{-4}(1 + 4 + 8)$.`],
            sol: md`$e^{-4}(1 + 4 + 2\cdot4) = 13e^{-4} = 0.238$.`,
          }),
          P({
            title: 'Counting lines',
            q: md`A gas of hydrogen atoms is excited to $n = 4$. Ignoring selection rules, how many different photon energies can appear as they cascade to the ground state? What is the shortest wavelength (nm)?`,
            parts: [{ lbl: '\\#\\text{ lines}', ans: 6 }, { lbl: '\\lambda_{\\min}', ans: 97.25, unit: 'nm' }],
            hints: [md`Pairs of levels among $n = 1, 2, 3, 4$. Shortest = biggest jump.`],
            sol: md`$\binom42 = 6$ pairs, all with different energies. $4 \to 1$: $13.6\cdot\tfrac{15}{16} = 12.75$ eV, $\lambda = 1240/12.75 = 97.3$ nm.`,
          }),
          Q(md`In sodium, the valence $3s$ level lies well below $3p$, although in hydrogen they are degenerate. Why?`,
            [md`The $s$ electron penetrates the inner electron cloud and feels more of the nuclear charge; the $1/r$ form (and its hidden symmetry) is broken`, md`Sodium is not spherically symmetric`, md`The $3s$ state has more angular momentum`, 'Spin–orbit coupling'], 0,
            [null, 'The potential is still central: the m-degeneracy survives.', md`$\ell = 0$ has none.`, 'Much too small an effect for the s–p splitting.'],
            md`$R \propto r^\ell$: $s$ states reach the core; the centrifugal barrier keeps $p$, $d$ out (Discussion 8, 3(c)).`),
          L(6, 'harder than the exam'),
          P({
            title: 'Positronium',
            q: md`Positronium (an electron bound to a positron, reduced mass $m_e/2$): ground-state energy (eV) and the Lyman-$\alpha$ wavelength (nm).`,
            parts: [{ lbl: 'E_1', ans: -6.8, unit: 'eV' }, { lbl: '\\lambda_{2\\to1}', ans: 243.1, unit: 'nm' }],
            hints: [md`$E_1 \propto\mu$.`],
            sol: md`$E_1 = -13.6/2 = -6.8$ eV. $\Delta E = 6.8\cdot\tfrac34 = 5.1$ eV, $\lambda = 1240/5.1 = 243$ nm: exactly twice hydrogen's 121.6 nm.`,
          }),
          P({
            title: 'Doubly ionized lithium',
            q: md`Li$^{2+}$ ($Z = 3$): energy of the $n = 2$ level (eV).`,
            parts: [{ lbl: 'E_2', ans: -30.6, unit: 'eV' }],
            hints: [md`$Z^2E_1/n^2$.`],
            sol: md`$9\cdot(-13.6)/4 = -30.6$ eV.`,
          }),
          Q(md`Why does hydrogen have infinitely many bound states, while a spherical square well has only finitely many?`,
            [md`$-k/r$ has a long tail: arbitrarily weakly bound states can sit arbitrarily far out, where the potential is still attractive`, 'Hydrogen is deeper', md`$u(0) = 0$ fails for the square well`, 'The square well has a hidden symmetry that removes states'], 0,
            [null, md`The square well can be made as deep as you like and still has finitely many.`, 'It holds for both.', 'No.'],
            md`A short-range well ends; beyond it there is nothing to bind with. The Coulomb attraction never ends, so the levels $-13.6/n^2$ accumulate at 0.`),
          Q(md`Does the hydrogen energy depend on $m$?`, ['No: the potential is central, so all 2ℓ + 1 values of m are degenerate', md`Yes, through the $m^2$ term`, 'Only for ℓ ≥ 2', md`Yes: $E \propto m$`], 0,
            [null, md`That needs a preferred axis (a symmetric top).`, 'No.', md`That needs a field along $z$ (Zeeman).`],
            md`The radial equation contains $\ell$ but not $m$.`),
          R(md`
            ### Exam-style problem
          `),
          paper('Exam-style problem · Topic 21', md`
            **The hydrogen atom** [20 points, 5 per part]

            The hydrogen ground state is $\psi_{100}(r) = \dfrac{1}{\sqrt{\pi a^3}}e^{-r/a}$ with energy $E_1 = -\dfrac{k}{2a} = -13.6$ eV, where $V = -k/r$. The energies are $E_n = E_1/n^2$. You may use $\int_0^\infty r^ne^{-\beta r}dr = n!/\beta^{n+1}$.
          `, [
            {
              q: md`**(a)** Find the most probable distance of the electron from the proton, and $\langle r\rangle$. Explain why they differ, and sketch the radial probability density $P(r)$, marking both.`,
              ans: md`$r_{\text{mp}} = a$, $\langle r\rangle = \tfrac32a$. $P(r) = \tfrac{4}{a^3}r^2e^{-2r/a}$ rises like $r^2$, peaks at $a$, and has a long tail that pulls the mean to $1.5a$.`,
              sol: md`
                **How to see it.** The radial probability is density × shell area. The distribution is skewed: no probability below $r = 0$, a long exponential tail above.

                $P(r) = 4\pi r^2|\psi|^2 = \tfrac{4}{a^3}r^2e^{-2r/a}$; $P' = 0$ at $r = a$. $\langle r\rangle = \tfrac{4}{a^3}\cdot\tfrac{3!}{(2/a)^4} = \tfrac32a$. Sketch: starts at 0 with zero slope (like $r^2$), maximum $4e^{-2}/a \approx 0.54/a$ at $r = a$, slow decay; mark $a$ at the peak and $1.5a$ to its right.

                **Rubric**
                - 5: both values, the skew/tail explanation, sketch with the correct shape and both marks.
                - 4: one of the three slightly off (e.g. sketch missing the $r^2$ start).
                - 3: values right, no explanation or no sketch.
                - 2: uses $|\psi|^2$ for the most probable distance (gets 0).
                - 1: little progress.
              `,
            },
            {
              q: md`**(b)** What is the classical turning point for an electron with energy $E_1$? Find the probability of finding the electron beyond it, and explain in words what this means.`,
              ans: md`$r_c = 2a$ (where $-k/r = E_1$). $P(r > 2a) = 13e^{-4} = 0.24$: about a quarter of the time the electron is in a region where its kinetic energy would classically be negative.`,
              sol: md`
                **How to see it.** Turning point: where all the energy is potential, $E = V$. Beyond it, a classical particle can't go.

                $-k/r_c = -k/2a \Rightarrow r_c = 2a$. $P(r > 2a) = \tfrac{4}{a^3}\int_{2a}^\infty r^2e^{-2r/a}dr = \tfrac12\int_4^\infty x^2e^{-x}dx = \tfrac12e^{-4}(16 + 8 + 2) = 13e^{-4} = 0.238$. Meaning: the wavefunction leaks into the classically forbidden region with an exponential tail, exactly like the finite well of Midterm 1. A position measurement finds $r > 2a$ about 24% of the time; this is not a violation of energy conservation, because a sharp position measurement leaves the electron in a state that is no longer an energy eigenstate.

                **Rubric**
                - 5: $2a$ with the $E = V$ reason, $0.24$, and a correct interpretation (forbidden region, tunneling-like tail).
                - 4: number right, interpretation thin.
                - 3: right setup, integral error.
                - 2: turning point at $a$ (confuses with the most probable $r$).
                - 1: little progress.
              `,
            },
            {
              q: md`**(c)** List all $n = 2$ states by $(\ell, m)$. Which part of the degeneracy is explained by rotational symmetry and which is not? Name a change to the potential that would lift the part that is not.`,
              ans: md`$(0, 0)$, $(1, -1)$, $(1, 0)$, $(1, 1)$: 4 states. Rotational symmetry explains the three $\ell = 1$ states; the $2s$–$2p$ coincidence is accidental (special to $1/r$). Any non-$1/r$ central term (e.g. a screened core, $-\hbar^2\alpha^2/2mr^2$) splits $2s$ from $2p$.`,
              sol: md`
                **How to see it.** Rotations turn $m$ into other $m$ at the same $\ell$; they never change $\ell$. Different $\ell$ have different radial equations, so they agree only by accident.

                $n = 2$: $\ell = 0$ (1 state) and $\ell = 1$ (3 states), $n^2 = 4$. $[\hat H, \hat L_\pm] = 0$ guarantees the $2\ell + 1$ within each $\ell$. The $2s = 2p$ equality comes from the Coulomb potential's hidden symmetry (Runge–Lenz). Lifting it: any deviation from $1/r$ that keeps the potential central, such as screening by inner electrons (sodium's $3s$/$3p$ split) or the $-\hbar^2\alpha^2/2mr^2$ model of Discussion 8; $s$ moves down most. (A magnetic field along $z$ would split $m$ instead.)

                **Rubric**
                - 5: four states, both parts of the degeneracy correctly attributed, a valid ℓ-splitting perturbation.
                - 4: perturbation that splits $m$ (field) instead of $\ell$, rest right.
                - 3: states right, attribution vague.
                - 2: wrong state count (e.g. includes $\ell = 2$).
                - 1: little progress.
              `,
            },
            {
              q: md`**(d)** True or false? Justify briefly. "An electron in a $2p$ state is never found at the nucleus, but a $2s$ electron can be."`,
              ans: md`True: $R_{n\ell} \propto r^\ell$ near the origin, so $|\psi_{2p}(0)|^2 = 0$ while $|\psi_{2s}(0)|^2 = |R_{20}(0)|^2/4\pi \ne 0$ (in the sense of probability density at the origin).`,
              sol: md`
                **How to see it.** The centrifugal barrier keeps any electron with angular momentum away from the center; $s$ electrons have none.

                $u \propto r^{\ell+1}$, $R \propto r^\ell$: $R_{21} \propto r\to0$, $R_{20}(0) = \tfrac{1}{\sqrt2a^{3/2}} \ne 0$. (Strictly, the probability of being exactly at one point is zero for any state; the statement is about the density. The finite $s$ density at the nucleus is what drives the hyperfine contact interaction and electron capture.)

                **Rubric**
                - 5: True, with $R \propto r^\ell$ (or the centrifugal-barrier argument made precise), density vs point probability noted.
                - 4: True with a correct but informal reason.
                - 3: True, "because $p$ orbitals have a node" without saying where/why.
                - 2: False.
                - 1: correct verdict, no justification.
              `,
            },
          ]),
          R(md`
            ### Endless practice
          `),
          G('m2_hydrogen'),
          G('m2_hydrogen_r'),
          R(md`**Where this shows up:** [Discussion 8](#/l/disc8) Problem 3 (accidental degeneracy, the alkali model), the uncertainty estimate in [Topic 9](#/l/t9-uncertainty).`),
        ],
        bank: [
          Q(md`The Bohr radius is…`, [md`$a = \hbar^2/mk = 0.0529$ nm`, md`$a = \hbar/mc$`, md`$a = k/2E_1$, about 1 nm`, '0.529 nm'], 0,
            [null, 'That is the Compton wavelength (over 2π).', 'Wrong size.', 'Off by 10.'], md`Confinement energy $\hbar^2/ma^2$ balances $k/a$.`),
          Q(md`$E_2/E_1$ for hydrogen is…`, [md`$\tfrac14$`, '4', md`$\tfrac12$`, '2'], 0,
            [null, 'That is the box.', 'No.', 'No.'], md`$1/n^2$.`),
          Q(md`How many radial nodes does the $3s$ state have?`, ['2', '3', '1', '0'], 0,
            [null, 'n − ℓ − 1 = 2.', 'That is 2s.', 'Only for ℓ = n − 1.'], md`$N - 1 = n - \ell - 1 = 2$.`),
          Q(md`The ionization energy of hydrogen from its ground state is…`, ['13.6 eV', '27.2 eV', '3.4 eV', '6.8 eV'], 0,
            [null, md`That is $|\langle V\rangle|$.`, 'That is from n = 2.', 'That is positronium.'], md`$0 - E_1$.`),
          Q(md`The Balmer series consists of transitions that end on…`, [md`$n = 2$`, md`$n = 1$`, md`$n = 3$`, 'the continuum'], 0,
            [null, 'That is Lyman (UV).', 'That is Paschen (IR).', 'That would be absorption to ionization.'], md`Visible lines: H$\alpha$ 656 nm etc.`),
          Q(md`In the hydrogen ground state, the probability density $|\psi|^2$ is largest…`, ['at the nucleus', 'at r = a', 'at r = 1.5a', 'at r = 2a'], 0,
            [null, 'That is the peak of P(r) = 4πr²|ψ|².', md`That is $\langle r\rangle$.`, 'That is the turning point.'], md`$e^{-2r/a}$ is largest at $r = 0$.`),
          Q(md`A hydrogen atom in $n = 3$ has $L^2$ measured. Possible results?`, [md`$0, 2\hbar^2, 6\hbar^2$`, md`$0, \hbar^2, 4\hbar^2$`, md`$6\hbar^2$ only`, md`$12\hbar^2$`], 0,
            [null, md`$\hbar^2\ell(\ell+1)$, not $\hbar^2\ell^2$.`, md`$\ell$ can be 0, 1 or 2.`, md`$\ell = 3$ is not allowed for $n = 3$.`], md`$\ell = 0, 1, 2$.`),
        ],
      },
    ],
  });
})();

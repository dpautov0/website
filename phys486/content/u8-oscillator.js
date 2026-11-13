/* Unit 2 (Midterm 2) — the harmonic oscillator (Lectures 9–11, HW 5.3, HW 6, Discussions 5–6).
   Topic 13: ladder operators, spectrum, matrix elements. Topic 14: wavefunctions, nodes, parity, the classical limit.
   Topic 15: motion of superpositions and phase space. Topic 16: coherent states. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  // normalized oscillator eigenfunctions in ξ = x/√(ħ/mω), by the stable recurrence
  function hf(n, x) {
    let p0 = Math.pow(Math.PI, -0.25) * Math.exp(-x * x / 2);
    if (n === 0) return p0;
    let p1 = Math.SQRT2 * x * p0;
    for (let k = 1; k < n; k++) { const p2 = Math.sqrt(2 / (k + 1)) * x * p1 - Math.sqrt(k / (k + 1)) * p0; p0 = p1; p1 = p2; }
    return p1;
  }
  const circle = (cx, cy, r, n = 120) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);

  // ψ0…ψ3 drawn at their energies inside the parabola, with the classical turning points
  const ladderFig = PF.plot({
    w: 380, h: 260, x: [-3.6, 3.6], y: [0, 4.6], xl: '\\xi', yl: 'E/\\hbar\\omega',
    yt: [[0.5, '\\tfrac12'], [1.5, '\\tfrac32'], [2.5, '\\tfrac52'], [3.5, '\\tfrac72']],
    curves: [{ f: (x) => x * x / 2, cls: 'dim' }]
      .concat([0, 1, 2, 3].map((n) => ({ pts: [[-Math.sqrt(2 * n + 1), n + 0.5], [Math.sqrt(2 * n + 1), n + 0.5]], cls: 'dim dash' })))
      .concat([0, 1, 2, 3].map((n) => ({ f: (x) => n + 0.5 + 0.55 * hf(n, x), lab: `\\psi_${n}`, labAt: 3.3 }))),
  });

  // |ψ10|² against the classical density for the same energy
  const x10 = Math.sqrt(21);
  const classicalFig = PF.plot({
    w: 380, h: 220, x: [-6, 6], y: [0, 0.36], xl: '\\xi', yl: '\\text{prob. density}',
    vlines: [[-x10, '-\\xi_{10}'], [x10, '\\xi_{10}']],
    curves: [
      { f: (x) => hf(10, x) ** 2, n: 900, cls: 'thin' },
      { f: (x) => (Math.abs(x) < x10 ? 1 / (Math.PI * Math.sqrt(x10 * x10 - x * x)) : NaN), from: -x10 + 0.004, to: x10 - 0.004, n: 600, cls: 'dim dash' },
    ],
  });

  // (ψ0 + ψ1)/√2 sloshing: |Ψ|² at ωt = 0, π/2, π
  const sl = (wt) => (x) => 0.5 * (hf(0, x) ** 2 + hf(1, x) ** 2 + 2 * hf(0, x) * hf(1, x) * Math.cos(wt));
  const sloshFig = PF.plot({
    w: 380, h: 210, x: [-3.5, 3.5], y: [0, 0.85], xl: '\\xi', yl: '|\\Psi|^2',
    curves: [
      { f: sl(0), lab: '\\omega t = 0', labAt: 1.6, dy: -14 },
      { f: sl(Math.PI / 2), cls: 'dim dash', lab: '\\tfrac\\pi2', labAt: 0.2, dy: -10 },
      { f: sl(Math.PI), cls: 'dim', lab: '\\pi', labAt: -2.2 },
    ],
  });

  // (ψ0 + ψ2)/√2 breathing: wide at ωt = 0, narrow at ωt = π/2
  const br = (wt) => (x) => 0.5 * (hf(0, x) ** 2 + hf(2, x) ** 2 + 2 * hf(0, x) * hf(2, x) * Math.cos(2 * wt));
  const breatheFig = PF.plot({
    w: 380, h: 210, x: [-3.5, 3.5], y: [0, 0.9], xl: '\\xi', yl: '|\\Psi|^2',
    curves: [
      { f: br(0), lab: '\\omega t = 0', labAt: 2.0, dy: -8 },
      { f: br(Math.PI / 2), cls: 'dim', lab: '\\omega t = \\tfrac\\pi2', labAt: 0.55, dy: -6 },
    ],
  });

  // phase space for (|0> + |1>)/√2: unit orbit, and the ground-state fuzz (radius 1 in these units) at t = 0
  const phaseFig = PF.plot({
    w: 300, h: 290, x: [-2.4, 2.4], y: [-2.4, 2.4], zero: true, xl: '\\tilde x', yl: '\\tilde p',
    curves: [
      { pts: circle(0, 0, 1) },
      { pts: circle(1, 0, 1), cls: 'dim dash' },
    ],
    pts: [{ x: 1, y: 0, lab: 't = 0' }, { x: 0, y: -1, lab: '\\tfrac T4', anchor: 'tl' }, { x: -1, y: 0, lab: '\\tfrac T2', anchor: 'br' }],
  });

  // coherent state α = 2 (real): orbit of radius 4, fuzz of radius 1 at four times
  const cohPhase = PF.plot({
    w: 320, h: 310, x: [-5.6, 5.6], y: [-5.6, 5.6], zero: true, xl: '\\tilde x', yl: '\\tilde p',
    curves: [{ pts: circle(0, 0, 4), cls: 'dim' }]
      .concat([[4, 0], [0, -4], [-4, 0], [0, 4]].map(([a, b]) => ({ pts: circle(a, b, 1) }))),
    pts: [{ x: 4, y: 0, lab: 't = 0', anchor: 'bl' }, { x: 0, y: -4, lab: '\\tfrac T4', anchor: 'tl' }],
  });

  // coherent state |ψ|² swinging in the well (α = 2: center at 2√2 cos ωt)
  const g = (c) => (x) => Math.exp(-((x - c) ** 2)) / Math.sqrt(Math.PI);
  const cohMove = PF.plot({
    w: 380, h: 210, x: [-4.8, 4.8], y: [0, 0.75], xl: '\\xi', yl: '|\\psi|^2',
    curves: [
      { f: (x) => x * x / 22, cls: 'dim dash' },
      { f: g(2 * Math.SQRT2), lab: '\\omega t = 0', labAt: 3.3, dy: -16 },
      { f: g(2), cls: 'dim', lab: '\\tfrac\\pi4', labAt: 2.2, dy: -26 },
      { f: g(0), cls: 'dim', lab: '\\tfrac\\pi2', labAt: 0.3, dy: -26 },
    ],
  });

  // Poisson P(n) for |α|² = 4
  const poi = (n) => Math.exp(-4) * Math.pow(4, n) / [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800][n];
  const poissonFig = PF.plot({
    w: 360, h: 200, x: [-0.6, 10.6], y: [0, 0.23], xl: 'n', yl: 'P(n)',
    xt: [[0, '0'], [2, '2'], [4, '4'], [6, '6'], [8, '8'], [10, '10']], yt: [[0.1, '0.1'], [0.2, '0.2']],
    curves: Array.from({ length: 11 }, (_, n) => ({ pts: [[n, 0], [n, poi(n)]] })),
  });

  // half oscillator: wall at 0, odd states survive
  const halfFig = PF.plot({
    w: 360, h: 240, x: [-0.6, 3.6], y: [0, 4.4], xl: '\\xi', yl: 'E/\\hbar\\omega',
    yt: [[1.5, '\\tfrac32'], [3.5, '\\tfrac72']],
    curves: [
      { f: (x) => x * x / 2, from: 0, cls: 'dim' }, { pts: [[0, 0], [0, 4.4]], cls: 'dim' },
      { f: (x) => 1.5 + 0.55 * Math.SQRT2 * hf(1, x), from: 0, lab: '\\psi^{\\text{half}}_0', labAt: 3.2 },
      { f: (x) => 3.5 + 0.55 * Math.SQRT2 * hf(3, x), from: 0, lab: '\\psi^{\\text{half}}_1', labAt: 3.2 },
    ],
  });

  C.unit({
    id: 'u8', exam: 'm2', num: 'Unit 2', title: 'The harmonic oscillator',
    blurb: 'Ladder operators and the spectrum, the wavefunctions, motion of superpositions in phase space, coherent states (Lectures 9–11, HW 5.3, HW 6, Discussions 5–6).',
    lessons: [
      // ------------------------------------------------------------------ Topic 13
      {
        id: 't13-ladder', topic: 13, title: 'Ladder operators and the spectrum', ref: 'Lectures 9–10, HW 6.2',
        steps: [
          RF(md`
            ### The picture

            **Why this system.** Expand any potential about a minimum: $V(x) \approx V(x_0) + \tfrac12V''(x_0)(x - x_0)^2$. Every small vibration is an oscillator with $\omega = \sqrt{V''(x_0)/m}$: molecules, atoms in a crystal (phonons), a trapped ion, a mode of the electromagnetic field (photons).

            **What comes out.** The energies are an evenly spaced ladder, $E_n = (n + \tfrac12)\hbar\omega$. Compare: the infinite well spreads out as $n^2$, hydrogen crowds together as $-1/n^2$. Even spacing means you can think of the $n$th state as "$n$ quanta of $\hbar\omega$" added to a ground state that still has $\tfrac12\hbar\omega$ (zero-point energy: a state with $E = 0$ would need $x = 0$ and $p = 0$ at once).

            [[fig:lad]]

            **How we get it (Lecture 9: "better: algebraic!").** You could solve the differential equation (Griffiths §2.3.2). The lecture instead factors $\hat H$. For numbers, $u^2 + v^2 = (-iu + v)(iu + v)$. For operators that do not commute the factoring leaves a remainder, and the remainder is the whole story.

            ### The algebra, every step

            Define
            $$\hat a_\pm = \frac{1}{\sqrt{2\hbar m\omega}}\left(\mp i\hat p + m\omega\hat x\right)$$
            Multiply out, keeping the order:
            $$\hat a_-\hat a_+ = \frac{1}{2\hbar m\omega}\left[\hat p^2 + m^2\omega^2\hat x^2 - im\omega(\hat x\hat p - \hat p\hat x)\right] = \frac{1}{\hbar\omega}\left(\frac{\hat p^2}{2m} + \frac12m\omega^2\hat x^2\right) + \frac12 = \frac{\hat H}{\hbar\omega} + \frac12$$
            using $-im\omega[\hat x, \hat p] = -im\omega(i\hbar) = \hbar m\omega$. The same steps give $\hat a_+\hat a_- = \hat H/\hbar\omega - \tfrac12$. Subtracting:
            $$[\hat a_-, \hat a_+] = 1,\qquad \hat H = \hbar\omega\left(\hat a_+\hat a_- + \tfrac12\right)$$

            **Ladder property.** If $\hat H\psi = E\psi$, then
            $$\hat H(\hat a_+\psi) = \hbar\omega\left(\hat a_+\hat a_-\hat a_+ + \tfrac12\hat a_+\right)\psi = \hat a_+\hbar\omega\left(\hat a_-\hat a_+ + \tfrac12\right)\psi = \hat a_+\left(\hat H + \hbar\omega\right)\psi = (E + \hbar\omega)(\hat a_+\psi)$$
            ($\hat a_-\hat a_+ = \hat a_+\hat a_- + 1$ in the middle step). Likewise $\hat a_-$ lowers $E$ by $\hbar\omega$.

            **The bottom rung.** Lowering cannot go on forever: $\bra\psi\hat a_+\hat a_-\ket\psi = \|\hat a_-\psi\|^2 \ge 0$, so $E \ge \tfrac12\hbar\omega$. The only way the ladder stops is a state that $\hat a_-$ kills: $\hat a_-\psi_0 = 0$. Then $\hat H\psi_0 = \hbar\omega(0 + \tfrac12)\psi_0$, so $E_0 = \tfrac12\hbar\omega$ and
            $$E_n = \left(n + \tfrac12\right)\hbar\omega,\qquad \hat N \equiv \hat a_+\hat a_-,\quad \hat N\ket n = n\ket n$$

            **Normalization (Lecture 10 board).** $\hat a_+\ket n = c\ket{n+1}$. Square it: $|c|^2 = \bra n\hat a_-\hat a_+\ket n = \bra n\hat N + 1\ket n = n + 1$. Similarly $\|\hat a_-\ket n\|^2 = n$. Note $(\hat a_+)^\dagger = \hat a_-$ ($\hat x$, $\hat p$ Hermitian, and the $\mp i$ flips): the ladder operators are **not** observables.
            $$\hat a_+\ket n = \sqrt{n+1}\,\ket{n+1},\qquad \hat a_-\ket n = \sqrt n\,\ket{n-1},\qquad \ket n = \frac{(\hat a_+)^n}{\sqrt{n!}}\ket0$$
          `, { lad: { svg: ladderFig, cap: md`The ladder: $\psi_0$ to $\psi_3$ drawn at their energies, dashed between the classical turning points $\xi = \pm\sqrt{2n+1}$.` } }),
          R(md`
            ### Position and momentum as ladders

            Invert the definitions: $\hat a_+ + \hat a_- = \tfrac{2m\omega}{\sqrt{2\hbar m\omega}}\hat x$ and $\hat a_+ - \hat a_- = \tfrac{-2i}{\sqrt{2\hbar m\omega}}\hat p$, so
            $$\hat x = \sqrt{\frac{\hbar}{2m\omega}}\left(\hat a_+ + \hat a_-\right),\qquad \hat p = i\sqrt{\frac{\hbar m\omega}{2}}\left(\hat a_+ - \hat a_-\right)$$
            Now every expectation value is **counting**, no Hermite polynomials:

            - $\hat x$ moves one rung up or down, so $\bra{n'}\hat x\ket n = \sqrt{\tfrac{\hbar}{2m\omega}}\left(\sqrt{n+1}\,\delta_{n',n+1} + \sqrt n\,\delta_{n',n-1}\right)$. Diagonal elements vanish: $\langle x\rangle = \langle p\rangle = 0$ in every $\ket n$. (Selection rule: a dipole only couples neighbors, $\Delta n = \pm1$.)
            - $\hat x^2 = \tfrac{\hbar}{2m\omega}\left(\hat a_+^2 + \hat a_-^2 + \hat a_+\hat a_- + \hat a_-\hat a_+\right)$. In $\ket n$ only the last two survive: $n + (n+1)$. So $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}(2n+1)$, and likewise $\langle p^2\rangle = \tfrac{\hbar m\omega}{2}(2n+1)$.
            - Hence $\sigma_x\sigma_p = (n + \tfrac12)\hbar$ (only $n = 0$ is minimal) and $\langle V\rangle = \langle T\rangle = \tfrac12E_n$ (the virial theorem, Topic 11).

            !!method Ladder diagrams for powers
              $\bra m(\hat a_+ + \hat a_-)^k\ket n$ is a sum over **staircase paths** of $k$ steps from rung $n$ to rung $m$ (read right to left, never below 0). A step up from $j$ to $j+1$ weighs $\sqrt{j+1}$, a step down from $j$ weighs $\sqrt j$. Example $\bra0(\hat a_+ + \hat a_-)^4\ket0$: up-up-down-down weighs $1\cdot\sqrt2\cdot\sqrt2\cdot1 = 2$, up-down-up-down weighs $1$; total $3$. So $\langle x^4\rangle_0 = 3\left(\tfrac{\hbar}{2m\omega}\right)^2$.

            ### Worked example

            !!graded Problem
              (a) Find $\bra n\hat x^2\ket{n+2}$. (b) Find $\langle x^4\rangle$ in $\ket1$. (c) A diatomic molecule has spring constant $k = 480$ N/m and reduced mass $\mu = 1.63\times10^{-27}$ kg. Find $\hbar\omega$ in eV and the zero-point energy.

            **(a)** Only $\hat a_-^2$ takes $\ket{n+2}$ down to $\ket n$: $\hat a_-^2\ket{n+2} = \sqrt{n+2}\sqrt{n+1}\ket n$. So $\bra n\hat x^2\ket{n+2} = \tfrac{\hbar}{2m\omega}\sqrt{(n+1)(n+2)}$.

            **(b)** Paths from 1 back to 1 in four steps (weights multiply along the path): UUDD $= \sqrt2\sqrt3\sqrt3\sqrt2 = 6$; UDUD $= \sqrt2\sqrt2\sqrt2\sqrt2 = 4$; UDDU $= \sqrt2\sqrt2\cdot1\cdot1 = 2$; DUUD $= 1\cdot1\cdot\sqrt2\sqrt2 = 2$; DUDU $= 1$. Total 15, so $\langle x^4\rangle_1 = 15\left(\tfrac{\hbar}{2m\omega}\right)^2$. (General: $6n^2 + 6n + 3$.)

            **(c)** $\omega = \sqrt{k/\mu} = 5.43\times10^{14}$ s⁻¹, $\hbar\omega = 5.72\times10^{-20}$ J $= 0.357$ eV (an infrared photon, 3.5 μm). Zero-point energy $0.18$ eV: molecules vibrate even at absolute zero.

            !!mistake Common mistakes
              - $\hat a_-\ket0 = 0$ is the zero **vector**, not the state $\ket0$.
              - Swapping the normalizations: up from $n$ gives $\sqrt{n+1}$, down from $n$ gives $\sqrt n$.
              - Forgetting the order in $\hat a_\pm$ products: $\hat a_-\hat a_+ = \hat a_+\hat a_- + 1$.
              - Treating $\hat a_\pm$ as observables. They are not Hermitian; their "expectation values" are complex.
              - Saying "$\langle x\rangle = 0$, so the particle sits at the bottom". $\sigma_x$ grows with $n$.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`The oscillator levels are spaced…`, [md`evenly, by $\hbar\omega$`, md`as $n^2$, like the infinite well`, md`as $1/n^2$, like hydrogen`, md`by $\tfrac12\hbar\omega$`], 0,
            [null, 'That is the infinite well.', 'That is hydrogen.', md`$\tfrac12\hbar\omega$ is the zero-point energy, not the spacing.`],
            md`$E_n = (n + \tfrac12)\hbar\omega$: each $\hat a_+$ adds one quantum $\hbar\omega$.`),
          Q(md`Is $\hat a_+$ Hermitian?`, [md`No: $(\hat a_+)^\dagger = \hat a_-$, so it is not an observable`, 'Yes, it is built from x and p', 'Only acting on the ground state', 'It is anti-Hermitian'], 0,
            [null, md`The $\mp i$ in front of $\hat p$ flips under the dagger.`, 'Hermiticity is a property of the operator, not of a state.', md`$-\hat a_+ \ne \hat a_-$.`],
            md`$\hat a_+^\dagger = \tfrac{1}{\sqrt{2\hbar m\omega}}(+i\hat p + m\omega\hat x) = \hat a_-$.`),
          L(2, 'set up'),
          P({
            title: 'Ladder coefficients',
            q: md`Find $\bra3\hat a_+\ket2$ and $\bra1\hat a_-\ket2$.`,
            parts: [{ lbl: '\\langle3|\\hat a_+|2\\rangle', ans: Math.sqrt(3) }, { lbl: '\\langle1|\\hat a_-|2\\rangle', ans: Math.SQRT2 }],
            hints: [md`$\hat a_+\ket n = \sqrt{n+1}\ket{n+1}$, $\hat a_-\ket n = \sqrt n\ket{n-1}$.`],
            sol: md`$\sqrt3$ and $\sqrt2$. Both connect the same pair of rungs (2 and 3, 1 and 2) with the larger index under the root.`,
          }),
          Q(md`$\hat a_-\ket0 = $?`, [md`$0$ (the zero vector)`, md`$\ket0$`, md`$\ket{-1}$`, md`$\tfrac12\hbar\omega\ket0$`], 0,
            [null, 'That would make |0> an eigenstate of â− with eigenvalue 1.', 'There is no rung below 0.', 'That is Ĥ|0>.'],
            md`$\|\hat a_-\ket0\|^2 = \bra0\hat N\ket0 = 0$. The bottom of the ladder is defined by this.`),
          P({
            title: 'Counting quanta',
            q: md`For $\ket5$: enter the eigenvalue of $\hat N = \hat a_+\hat a_-$ and $E_5/\hbar\omega$.`,
            parts: [{ lbl: 'n', ans: 5 }, { lbl: 'E_5/\\hbar\\omega', ans: 5.5 }],
            sol: md`$\hat N\ket5 = 5\ket5$, $E_5 = 5.5\hbar\omega$.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Widths in a stationary state',
            q: md`Find $\langle x^2\rangle$ in $\ket3$ in units of $\hbar/m\omega$, and $\sigma_x\sigma_p$ in $\ket2$ in units of $\hbar$.`,
            parts: [{ lbl: '\\langle x^2\\rangle_3', ans: 3.5 }, { lbl: '\\sigma_x\\sigma_p\\ (n=2)', ans: 2.5 }],
            hints: [md`$\langle x^2\rangle = \tfrac{\hbar}{2m\omega}(2n+1)$.`],
            sol: md`$\tfrac{7}{2}\tfrac{\hbar}{m\omega}$; $(2 + \tfrac12)\hbar$. The product grows with $n$: higher states are wider in both $x$ and $p$.`,
          }),
          P({
            title: 'Matrix elements of x and p',
            q: md`Find $\bra4\hat x\ket3$ in units of $\sqrt{\hbar/2m\omega}$ and $|\bra2\hat p\ket3|$ in units of $\sqrt{\hbar m\omega/2}$.`,
            parts: [{ lbl: '\\langle4|\\hat x|3\\rangle', ans: 2 }, { lbl: '|\\langle2|\\hat p|3\\rangle|', ans: Math.sqrt(3) }],
            hints: [md`Only one of $\hat a_\pm$ connects each pair.`],
            sol: md`$\bra4\hat a_+\ket3 = \sqrt4 = 2$. $\bra2\hat p\ket3 = i\sqrt{\hbar m\omega/2}(0 - \sqrt3) = -i\sqrt3\sqrt{\hbar m\omega/2}$; modulus $\sqrt3$.`,
          }),
          Q(md`Why is $\bra n\hat x\ket n = 0$ for every stationary state?`, [md`$\hat x \propto \hat a_+ + \hat a_-$ changes $n$ by $\pm1$, and $\braket{n|n\pm1} = 0$`, 'Because the potential is at its minimum at x = 0', 'Because ψn is real', md`Because $\hat x$ is Hermitian`], 0,
            [null, 'True, but the statement needs a reason that works for every n.', md`Real $\psi_n$ makes $\langle p\rangle = 0$, not $\langle x\rangle$.`, 'Hermitian operators can have nonzero diagonal elements.'],
            md`Orthogonality kills both terms. (Parity says the same: $|\psi_n|^2$ is even.)`),
          L(4, 'one twist'),
          P({
            title: 'Ground-state x⁴ by counting paths',
            q: md`Find $\langle x^4\rangle$ in $\ket0$ in units of $(\hbar/2m\omega)^2$.`,
            parts: [{ lbl: '\\langle x^4\\rangle_0', ans: 3 }],
            hints: [md`Count staircase paths 0 → 0 in 4 steps that never go below 0.`],
            sol: md`UUDD: $1\cdot\sqrt2\cdot\sqrt2\cdot1 = 2$; UDUD: 1. Total 3. (Check: a Gaussian has $\langle x^4\rangle = 3\sigma^4$ with $\sigma^2 = \hbar/2m\omega$.)`,
          }),
          P({
            title: 'Momentum squared',
            q: md`Find $\langle p^2\rangle$ in $\ket1$ in units of $\hbar m\omega$, and $\langle T\rangle$ in units of $\hbar\omega$.`,
            parts: [{ lbl: '\\langle p^2\\rangle_1', ans: 1.5 }, { lbl: '\\langle T\\rangle_1', ans: 0.75 }],
            sol: md`$\tfrac{\hbar m\omega}{2}\cdot3$; $\langle T\rangle = \langle p^2\rangle/2m = \tfrac34\hbar\omega = E_1/2$.`,
          }),
          Q(md`$[\hat a_-, \hat a_+^2] = $?`, [md`$2\hat a_+$`, md`$\hat a_+$`, '1', md`$2\hat a_-$`], 0,
            [null, 'Two factors of â+, each contributing one.', 'That is [â−, â+] times â+ only once.', 'Wrong operator.'],
            md`$[\hat a_-, \hat a_+\hat a_+] = \hat a_+[\hat a_-, \hat a_+] + [\hat a_-, \hat a_+]\hat a_+ = 2\hat a_+$.`),
          Q(md`A particle sits near the minimum of $V(x) = V_0\left(\tfrac{x}{b} - 1\right)^2\left(\tfrac{x}{b} + 1\right)^2$ at $x = b$. Its small-oscillation $\omega$ is…`, [md`$\sqrt{8V_0/mb^2}$`, md`$\sqrt{2V_0/mb^2}$`, md`$\sqrt{V_0/mb^2}$`, md`$\sqrt{4V_0/mb^2}$`], 0,
            [null, 'Check V″(b).', 'Check V″(b).', 'Check V″(b).'],
            md`Near $x = b$: $V \approx V_0\left(\tfrac{x - b}{b}\right)^2\cdot4$, so $V'' = 8V_0/b^2$ and $\omega = \sqrt{V''/m}$.`),
          L(5, 'exam level'),
          P({
            title: 'Two rungs apart',
            q: md`Find $\bra1\hat x^2\ket3$ in units of $\hbar/2m\omega$.`,
            parts: [{ lbl: '\\langle1|\\hat x^2|3\\rangle', ans: Math.sqrt(6) }],
            hints: [md`Only $\hat a_-^2$ connects $\ket3$ to $\ket1$.`],
            sol: md`$\hat a_-^2\ket3 = \sqrt3\sqrt2\ket1$: $\sqrt6 = 2.449$.`,
          }),
          P({
            title: 'A vibrating molecule',
            q: md`Spring constant $k = 480$ N/m, reduced mass $\mu = 1.63\times10^{-27}$ kg. Find $\hbar\omega$ in eV.`,
            parts: [{ lbl: '\\hbar\\omega', ans: 0.3572, unit: 'eV' }],
            hints: [md`$\omega = \sqrt{k/\mu}$; $\hbar = 1.055\times10^{-34}$ J·s; 1 eV $= 1.602\times10^{-19}$ J.`],
            sol: md`$\omega = 5.43\times10^{14}$ s⁻¹, $\hbar\omega = 5.72\times10^{-20}$ J $= 0.357$ eV. At room temperature $k_BT = 0.025$ eV, so the molecule is almost always in $\ket0$.`,
          }),
          Q(md`Why can the oscillator not have $E = 0$?`, [md`It would need $\langle x^2\rangle = \langle p^2\rangle = 0$, violating $\sigma_x\sigma_p \ge \hbar/2$`, 'Because n starts at 1', 'Because V has no zero', md`Because $\hat a_+$ is not Hermitian`], 0,
            [null, md`$n$ starts at 0; $E_0 = \tfrac12\hbar\omega$ anyway.`, md`$V(0) = 0$.`, 'Irrelevant.'],
            md`$E = \langle p^2\rangle/2m + \tfrac12m\omega^2\langle x^2\rangle \ge \tfrac{\hbar^2}{8m\sigma_x^2} + \tfrac12m\omega^2\sigma_x^2 \ge \tfrac12\hbar\omega$.`),
          L(6, 'harder than the exam'),
          P({
            title: 'Paths in the first excited state',
            q: md`Find $\langle x^4\rangle$ in $\ket1$ in units of $(\hbar/2m\omega)^2$, and $\langle x^6\rangle$ in $\ket0$ in units of $(\hbar/2m\omega)^3$.`,
            parts: [{ lbl: '\\langle x^4\\rangle_1', ans: 15 }, { lbl: '\\langle x^6\\rangle_0', ans: 15 }],
            hints: [md`Five paths for the first (see the worked example).`, md`For a Gaussian, $\langle x^6\rangle = 15\sigma^6$.`],
            sol: md`$6 + 4 + 2 + 2 + 1 = 15$. And $\langle x^6\rangle_0 = 5!! = 15$ (Gaussian moments $1, 3, 15, 105$).`,
          }),
          Q(md`You truncate $X$ and $P$ to $4\times4$ matrices in the $\ket0\dots\ket3$ basis and compute $XP - PX$. You get $i\hbar\,\text{diag}(1, 1, 1, -3)$. Why can no finite matrices give $i\hbar$ times the identity?`,
            ['The trace of a commutator is zero, but the trace of iħ·1 is iħN', 'Because P is complex', 'Because X has zero diagonal', 'They can, with a better choice of basis'], 0,
            [null, 'Complex Hermitian matrices are fine.', 'Not the reason.', 'No basis helps: the trace argument is basis independent.'],
            md`$\text{tr}(XP) = \text{tr}(PX)$. Canonical commutation needs infinitely many states: the oscillator Hilbert space is infinite-dimensional.`),
          Q(md`In $\ket n$, what fraction of $E_n$ is kinetic?`, ['One half, for every n', 'All of it at large n', 'n/(n+1)', 'It depends on ω'], 0,
            [null, 'Virial: ⟨T⟩ = ⟨V⟩ for every stationary state.', 'No n-dependence.', 'No ω-dependence.'],
            md`$\langle p^2\rangle/2m = \tfrac{\hbar\omega}{4}(2n+1) = \tfrac12E_n$.`),
          R(md`
            ### Exam-style problem
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 486 · Exam-style problem · Topic 13</span><span>20 pts</span></div>',
            head: md`**Matrix mechanics of the oscillator** [20 points, 5 per part]

            The oscillator has stationary states $\ket n$, $E_n = (n + \tfrac12)\hbar\omega$, and
            $$\hat x = \sqrt{\tfrac{\hbar}{2m\omega}}(\hat a_+ + \hat a_-),\quad \hat p = i\sqrt{\tfrac{\hbar m\omega}{2}}(\hat a_+ - \hat a_-),\quad \hat a_+\ket n = \sqrt{n+1}\ket{n+1},\quad \hat a_-\ket n = \sqrt n\ket{n-1}.$$
            Keep only the four states $\ket0, \dots, \ket3$, and call the resulting $4\times4$ matrices $X$ and $P$. Use units with $\hbar = m = \omega = 1$ if you like.`,
            items: [
              {
                q: md`**(a)** Write $X$ and $P$. Explain why every diagonal element vanishes, and what that means physically.`,
                ans: md`$X = \tfrac{1}{\sqrt2}\begin{pmatrix}0&1&0&0\\1&0&\sqrt2&0\\0&\sqrt2&0&\sqrt3\\0&0&\sqrt3&0\end{pmatrix}$, $P = \tfrac{i}{\sqrt2}\begin{pmatrix}0&-1&0&0\\1&0&-\sqrt2&0\\0&\sqrt2&0&-\sqrt3\\0&0&\sqrt3&0\end{pmatrix}$; diagonals vanish because $\hat x, \hat p$ change $n$ by $\pm1$.`,
                sol: md`
                  **How to see it.** $\hat x$ and $\hat p$ are each one step up plus one step down the ladder, so they live on the first off-diagonals.

                  $X_{n+1,n} = \sqrt{\tfrac{n+1}{2}}$, $X_{n-1,n} = \sqrt{\tfrac n2}$; $P_{n+1,n} = i\sqrt{\tfrac{n+1}{2}}$, $P_{n-1,n} = -i\sqrt{\tfrac n2}$. Both Hermitian ($P$ is $i$ times a real antisymmetric matrix). Zero diagonal: $\langle x\rangle = \langle p\rangle = 0$ in every stationary state; $\hat x$ only couples neighbors (dipole selection rule $\Delta n = \pm1$).

                  **Rubric** 5: both matrices right (including $i$ and signs), zero diagonal explained by the ladder and given meaning. · 4: one sign or factor wrong, explanation good. · 3: matrices right, no explanation. · 2: structure wrong (e.g. entries on the diagonal). · 1: little progress.
                `,
              },
              {
                q: md`**(b)** Compute $H = \tfrac12P^2 + \tfrac12X^2$ from your truncated matrices. Which entries agree with $E_n$? Explain the one that does not.`,
                ans: md`$H = \text{diag}(\tfrac12, \tfrac32, \tfrac52, \tfrac32)\hbar\omega$; the last entry should be $\tfrac72$.`,
                sol: md`
                  **How to see it.** $(X^2)_{nn}$ is the sum over paths $n \to n\pm1 \to n$; the truncation deletes the path through $\ket4$.

                  Off-diagonal parts of $P^2$ and $X^2$ cancel ($\hat a_\pm^2$ terms come with opposite signs), leaving $\tfrac12(2n + 1)$ for $n = 0, 1, 2$. For $n = 3$ the path $3 \to 4 \to 3$ (weight $4$) is missing, so $(X^2)_{33} = (P^2)_{33} = \tfrac32$ instead of $\tfrac72$, and $H_{33} = \tfrac32$. In the full infinite matrices, $H = \text{diag}(n + \tfrac12)$ exactly (HW 6.2).

                  **Rubric** 5: correct $H$, the three good entries, the last one traced to the missing $\ket4$. · 4: $H$ right, explanation vague. · 3: claims all four entries are right. · 2: errors in $X^2$ or $P^2$. · 1: little progress.
                `,
              },
              {
                q: md`**(c)** Compute $XP - PX$. Show that **no** pair of finite matrices can satisfy $XP - PX = i\hbar\mathbb 1$.`,
                ans: md`$XP - PX = i\hbar\,\text{diag}(1, 1, 1, -3)$; $\text{tr}(XP - PX) = 0 \ne i\hbar N$.`,
                sol: md`
                  Direct multiplication gives $i\,\text{diag}(1, 1, 1, -3)$ (the $-3$ again comes from the missing $\ket4$). In general $\text{tr}(AB) = \text{tr}(BA)$ for finite matrices, so any commutator is traceless, while $\text{tr}(i\hbar\mathbb 1_N) = i\hbar N$. The canonical commutation relation forces an infinite-dimensional space: position is a continuous variable and the ladder never ends.

                  **Rubric** 5: correct commutator and the trace argument. · 4: trace argument right, commutator slip. · 3: commutator right, no general argument. · 2: claims truncation is exact. · 1: little progress.
                `,
              },
              {
                q: md`**(d)** True or false? Justify. "In every stationary state $\langle x\rangle = 0$, so the particle is most likely to be found near the bottom of the well, $x = 0$."`,
                ans: md`False.`,
                sol: md`
                  **False.** $\langle x\rangle = 0$ is a statement about symmetry ($|\psi_n|^2$ is even), not about where the density peaks. $\psi_1$ has a node at $x = 0$; for large $n$ the density piles up near the turning points $\pm\sqrt{(2n+1)\hbar/m\omega}$, where a classical particle moves slowest (Topic 14). Only $\ket0$ peaks at the center.

                  **Rubric** 5: False with a counterexample ($\psi_1$ node, or the large-$n$ turning-point peaks). · 4: good reasoning, imprecise. · 3: fair attempt. · 2: some relevant thought. · 1: correct verdict only.
                `,
              },
            ],
          },
          R(md`
            ### Endless practice

            Fresh matrix elements and widths every time.

            Where this shows up: [Homework 6](#/l/hw6) Problem 2, [Homework 5](#/l/hw5) Problem 3, [Discussion 5](#/l/disc5).
          `),
          G('m2_ladder', { need: 3 }),
          G('m2_sho_sigma', { need: 2 }),
        ],
        bank: [
          Q(md`$[\hat N, \hat a_+] = $?`, [md`$\hat a_+$`, md`$-\hat a_+$`, '1', '0'], 0,
            [null, 'That is [N, â−].', 'Wrong.', 'N and â+ do not commute.'], md`$[\hat a_+\hat a_-, \hat a_+] = \hat a_+[\hat a_-, \hat a_+] = \hat a_+$: raising adds one to $n$.`),
          Q(md`$\hat a_-\hat a_+ - \hat a_+\hat a_- = $?`, ['1', '0', md`$\hat H/\hbar\omega$`, '−1'], 0,
            [null, 'They do not commute.', md`Their **sum** is $2\hat H/\hbar\omega$.`, 'Sign.'], md`$[\hat a_-, \hat a_+] = 1$.`),
          Q(md`$E_3/E_1$ for the oscillator is…`, [md`$\tfrac{7}{3}$`, '9', '3', md`$\tfrac{7}{2}$`], 0,
            [null, 'That is the infinite well.', 'Forgets the ½.', md`That is $E_3/\hbar\omega$.`], md`$\tfrac{3.5}{1.5}$.`),
          Q(md`$\bra n\hat a_+\hat a_-\ket n = $?`, ['n', 'n + 1', '0', '1'], 0,
            [null, md`That is $\hat a_-\hat a_+$.`, md`$\hat N$ counts quanta.`, 'Only for n = 1.'], md`$\hat N\ket n = n\ket n$.`),
          Q(md`Which matrix element is nonzero?`, [md`$\bra2\hat x^2\ket0$`, md`$\bra1\hat x^2\ket0$`, md`$\bra3\hat x\ket0$`, md`$\bra0\hat p\ket0$`], 0,
            [null, md`$\hat x^2$ changes $n$ by 0 or ±2.`, md`$\hat x$ changes $n$ by ±1 only.`, md`Diagonal elements of $\hat p$ vanish.`], md`$\hat a_+^2\ket0 = \sqrt2\ket2$.`),
          Q(md`A photon mode of the field is an oscillator. "Three photons" in the mode means…`, [md`the state $\ket3$, energy $\tfrac72\hbar\omega$`, md`$\ket3$, energy $3\hbar\omega$ exactly`, 'three separate oscillators', md`$\langle x\rangle = 3$`], 0,
            [null, 'The zero-point energy is still there.', 'One mode, three quanta.', 'Unrelated.'], md`Quanta are rungs: $n = 3$.`),
          Q(md`Is $\sigma_x\sigma_p = \hbar/2$ in $\ket1$?`, [md`No, it is $\tfrac32\hbar$`, 'Yes, all stationary states are minimal', 'Only at t = 0', md`It is $\hbar$`], 0,
            [null, md`Only $\ket0$ is.`, 'Stationary: time does not matter.', 'Factor.'], md`$(n + \tfrac12)\hbar$.`),
        ],
      },

      // ------------------------------------------------------------------ Topic 14
      {
        id: 't14-showave', topic: 14, title: 'Wavefunctions: Gaussians, Hermite polynomials and the classical limit', ref: 'Lectures 10–11, HW 5.3',
        steps: [
          R(md`
            ### The picture

            Look at the ladder figure in Topic 13 again. Three things to read off every oscillator wavefunction without calculating:

            1. **Nodes and parity.** $\psi_n$ has $n$ nodes and parity $(-1)^n$. Even states touch the center with a bump or a dip, odd states cross zero there.
            2. **Wiggles.** Inside the classically allowed region ($V < E$) it oscillates; the local wavelength is shorter where the kinetic energy $E - V$ is larger (near the center) and the amplitude is larger where the particle is slow (near the turning points).
            3. **Tails.** Beyond the turning points ($V > E$) it decays like a Gaussian. The particle is found there with small but nonzero probability: 16% for $\ket0$.

            The natural length is the ground-state width $w_x = \sqrt{\hbar/m\omega}$ (Discussion 6). Use $\xi = x/w_x$ and every state looks the same for every oscillator.

            ### Ground state from one first-order equation (Lecture 10)

            $\hat a_-\psi_0 = 0$ with $\hat p = -i\hbar\tfrac{d}{dx}$:
            $$\frac{1}{\sqrt{2\hbar m\omega}}\left(\hbar\frac{d}{dx} + m\omega x\right)\psi_0 = 0 \;\Rightarrow\; \frac{d\psi_0}{dx} = -\frac{m\omega}{\hbar}x\psi_0 \;\Rightarrow\; \psi_0 = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}e^{-m\omega x^2/2\hbar} = \frac{1}{\pi^{1/4}\sqrt{w_x}}e^{-\xi^2/2}$$
            A first-order ODE, so the bottom of the ladder is unique. It is a Gaussian: the minimum-uncertainty state (Topic 12), $\sigma_x = w_x/\sqrt2$.

            ### Climbing (HW 5.3)

            In $\xi$, $\hat a_+ = \tfrac{1}{\sqrt2}\left(\xi - \tfrac{d}{d\xi}\right)$. Apply it to $e^{-\xi^2/2}$:
            $$\psi_1 = \hat a_+\psi_0 \propto \tfrac{1}{\sqrt2}\left(\xi + \xi\right)e^{-\xi^2/2} = \sqrt2\,\xi e^{-\xi^2/2},\qquad \psi_2 = \tfrac{1}{\sqrt2}\hat a_+\psi_1 \propto \tfrac{1}{\sqrt2}(2\xi^2 - 1)e^{-\xi^2/2}$$
            In general $\psi_n = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}\frac{1}{\sqrt{2^nn!}}H_n(\xi)e^{-\xi^2/2}$ with $H_0 = 1$, $H_1 = 2\xi$, $H_2 = 4\xi^2 - 2$, $H_3 = 8\xi^3 - 12\xi$. Check: $\tfrac{H_2}{\sqrt8} = \tfrac{4\xi^2 - 2}{2\sqrt2} = \tfrac{2\xi^2 - 1}{\sqrt2}$ ✓. Nodes of $\psi_2$: $\xi = \pm\tfrac{1}{\sqrt2}$.

            **Parity for free.** $\xi$ and $\tfrac{d}{d\xi}$ are both odd, so $\hat a_+$ flips parity at each step: $\psi_n(-x) = (-1)^n\psi_n(x)$. Use it to kill integrals: $\bra0\hat x\ket2 = 0$ (odd integrand) without computing anything.
          `),
          RF(md`
            ### Quantum versus classical

            A classical oscillator with amplitude $x_0$ spends time $dt$ in $dx$, and $dx = |v|dt$ with $v = -x_0\omega\sin\omega t = -\omega\sqrt{x_0^2 - x^2}$. The fraction of a period spent in $dx$ is (Lecture 11)
            $$P_{\text{class}}(x)\,dx = \frac{2\,dt}{T} = \frac{dx}{\pi\sqrt{x_0^2 - x^2}}$$
            It is smallest at the center (fast) and blows up at the turning points (slow). For the same energy $E_n$, $x_0 = \sqrt{2n+1}\,w_x$.

            [[fig:cl]]

            For large $n$ the quantum density wiggles around the classical curve: **locally averaged**, they agree (correspondence principle). For small $n$ they look nothing alike: $|\psi_0|^2$ peaks where the classical particle is least likely to be.

            ### Two potentials you can solve by recognizing the oscillator

            **Half oscillator** (Discussion 5): a wall at $x = 0$, $V = \tfrac12m\omega^2x^2$ for $x > 0$. Same equation for $x > 0$, new condition $\psi(0) = 0$: keep the **odd** $\psi_n$, multiply by $\sqrt2$ (half the probability was thrown away). $E = (2k + \tfrac32)\hbar\omega$: ground state $\tfrac32\hbar\omega$, spacing $2\hbar\omega$. Squeezing the particle into half the space raised the ground energy.

            [[fig:half]]

            **Shifted oscillator** (charged particle in a field $\mathcal E$, force $F = q\mathcal E$): complete the square,
            $$\tfrac12m\omega^2x^2 - Fx = \tfrac12m\omega^2(x - d)^2 - \frac{F^2}{2m\omega^2},\qquad d = \frac{F}{m\omega^2}$$
            Same states centered at $d$, all energies lowered by $F^2/2m\omega^2$, same spacing.

            **Momentum space.** $\hat H$ is symmetric between $\hat x$ and $\hat p$ (both appear squared), so $\phi_n(p)$ has the same Hermite–Gaussian shape with width $\sqrt{\hbar m\omega}$ (up to a phase $(-i)^n$).
          `, { cl: { svg: classicalFig, cap: md`$|\psi_{10}|^2$ (solid) and the classical density for $E_{10}$ (dashed), turning points $\xi = \pm\sqrt{21}$.` }, half: { svg: halfFig, cap: md`Half oscillator: only the odd states survive, renormalized by $\sqrt2$.` } }),
          R(md`
            ### Worked example

            !!graded Problem
              A particle of charge $q$ sits in the ground state of an oscillator. At $t = 0$ a uniform field is switched on suddenly, so the potential becomes $\tfrac12m\omega^2x^2 - Fx$. (a) Find the new stationary states and energies. (b) Find the probability that the particle is found in the **new** ground state. Evaluate it for $d = w_x$.

            **(a)** Completing the square: $\psi_n^{\text{new}}(x) = \psi_n(x - d)$ with $d = F/m\omega^2$, and $E_n^{\text{new}} = (n + \tfrac12)\hbar\omega - \tfrac{F^2}{2m\omega^2}$.

            **(b)** "Sudden" means the wavefunction has no time to change: just after the switch it is still $\psi_0(x)$. Expand in the new states; $P = |\braket{\psi_0^{\text{new}}|\psi_0}|^2$. Two Gaussians of the same width $e^{-x^2/2w_x^2}$ offset by $d$:
            $$\int\frac{e^{-(x-d)^2/2w_x^2}e^{-x^2/2w_x^2}}{\sqrt\pi w_x}dx = e^{-d^2/4w_x^2}\quad\Rightarrow\quad P = e^{-d^2/2w_x^2}$$
            (Complete the square in the exponent: $(x - d)^2 + x^2 = 2(x - d/2)^2 + d^2/2$.) For $d = w_x$: $P = e^{-1/2} = 0.61$. The rest of the probability is spread over $n \ge 1$: the particle now swings about $x = d$. That swinging state is a **coherent state** (Topic 16).

            !!mistake Common mistakes
              - Counting nodes wrong: $\psi_n$ has $n$ nodes ($n$ starts at 0), unlike the box where $\psi_n$ has $n - 1$.
              - Keeping the even states in the half oscillator: they do not vanish at the wall.
              - Forgetting to renormalize ($\sqrt2$) after cutting the space in half.
              - Thinking probability outside the turning points violates energy conservation. A position measurement leaves the particle in a position eigenstate, which is not an energy eigenstate.
              - Comparing $|\psi_n|^2$ and $P_{\text{class}}$ point by point. Only the average over the wiggles agrees.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`How many nodes does $\psi_5$ of the oscillator have?`, ['5', '4', '6', '0'], 0,
            [null, md`That is the box counting ($n - 1$); here $n$ starts at 0.`, 'One too many.', 'Only ψ0 is nodeless.'], md`$\psi_n$ has $n$ nodes.`),
          Q(md`$\psi_3(-x) = $?`, [md`$-\psi_3(x)$`, md`$\psi_3(x)$`, md`$\psi_3(x)e^{i\pi/3}$`, 'not related'], 0,
            [null, 'Odd n gives odd functions.', 'No such phase.', 'The potential is even, so the states have definite parity.'], md`$(-1)^3 = -1$.`),
          L(2, 'set up'),
          P({
            title: 'Ground-state width and a turning point',
            q: md`Find $\langle x^2\rangle$ in $\ket0$ in units of $\hbar/m\omega$, and the classical turning point $\xi_4$ for $E_4$.`,
            parts: [{ lbl: '\\langle x^2\\rangle_0', ans: 0.5 }, { lbl: '\\xi_4', ans: 3 }],
            hints: [md`$\tfrac12m\omega^2x_n^2 = (n + \tfrac12)\hbar\omega$.`],
            sol: md`$\langle x^2\rangle_0 = \tfrac{\hbar}{2m\omega}$; $\xi_4 = \sqrt{2\cdot4 + 1} = 3$.`,
          }),
          Q(md`Acting with $\hat a_+ = \tfrac{1}{\sqrt2}(\xi - \tfrac{d}{d\xi})$ on $e^{-\xi^2/2}$ gives…`, [md`$\sqrt2\,\xi e^{-\xi^2/2}$`, '0', md`$\tfrac{1}{\sqrt2}(\xi - 1)e^{-\xi^2/2}$`, md`$e^{-\xi^2/2}$`], 0,
            [null, md`That is $\hat a_-$ acting on it.`, md`$\tfrac{d}{d\xi}e^{-\xi^2/2} = -\xi e^{-\xi^2/2}$.`, 'It must change the state.'],
            md`$\xi e^{-\xi^2/2} + \xi e^{-\xi^2/2} = 2\xi e^{-\xi^2/2}$, times $\tfrac{1}{\sqrt2}$.`),
          L(3, 'standard'),
          P({
            title: 'Outside the classical region',
            q: md`For $\ket0$ the turning points are $\xi = \pm1$. Using $\int_1^\infty e^{-u^2}du = 0.1394$, find the probability of finding the particle beyond them.`,
            parts: [{ lbl: 'P', ans: 0.1573 }],
            hints: [md`$|\psi_0|^2 = \tfrac{1}{\sqrt\pi}e^{-\xi^2}$ in $\xi$.`],
            sol: md`$P = 2\cdot\tfrac{1}{\sqrt\pi}\cdot0.1394 = 0.157$. About one measurement in six finds the particle where a classical one could never be.`,
          }),
          P({
            title: 'Nodes of the second excited state',
            q: md`Enter the positive node of $\psi_2$ in units of $w_x = \sqrt{\hbar/m\omega}$.`,
            parts: [{ lbl: '\\xi_{\\text{node}}', ans: Math.SQRT1_2 }],
            sol: md`$2\xi^2 - 1 = 0$: $\xi = 1/\sqrt2 = 0.707$.`,
          }),
          Q(md`Where is a classical oscillator most likely to be found?`, ['Near the turning points, where it moves slowest', 'At the center, where V is smallest', 'Uniformly everywhere between the turning points', 'Outside the turning points'], 0,
            [null, 'It passes the center fastest.', md`$P_{\text{class}} \propto 1/|v|$ is not flat.`, 'Classically forbidden.'],
            md`$P_{\text{class}} = 1/\pi\sqrt{x_0^2 - x^2}$.`),
          P({
            title: 'Half oscillator',
            q: md`For the half oscillator (wall at $x = 0$), enter the ground-state energy and the level spacing in units of $\hbar\omega$.`,
            parts: [{ lbl: 'E_0^{\\text{half}}', ans: 1.5 }, { lbl: '\\Delta E', ans: 2 }],
            hints: [md`Only odd $\psi_n$ vanish at the wall.`],
            sol: md`Surviving $n = 1, 3, 5, \dots$: $\tfrac32, \tfrac72, \dots$ Spacing $2\hbar\omega$.`,
          }),
          L(4, 'one twist'),
          Q(md`An oscillator wavefunction is odd, has 3 nodes and decays as $e^{-\xi^2/2}$. Its energy is…`, [md`$\tfrac72\hbar\omega$`, md`$\tfrac52\hbar\omega$`, md`$3\hbar\omega$`, md`$\tfrac92\hbar\omega$`], 0,
            [null, md`$n = 2$ has 2 nodes and is even.`, 'Forgot the ½.', md`That is $n = 4$.`], md`3 nodes → $n = 3$.`),
          P({
            title: 'Shifted oscillator',
            q: md`A force $F$ adds $-Fx$ to $\tfrac12m\omega^2x^2$. Enter the new ground-state energy.`,
            parts: [{ lbl: 'E_0', expr: 'hbar*omega/2 - F^2/(2*m*omega^2)', vars: { hbar: [0.5, 2], omega: [0.5, 2], F: [0.5, 2], m: [0.5, 2] } }],
            hints: [md`Complete the square.`],
            sol: md`$\tfrac12\hbar\omega - \tfrac{F^2}{2m\omega^2}$; the states are shifted by $d = F/m\omega^2$, the spacing is unchanged.`,
          }),
          Q(md`Why does $\phi_n(p)$ have the same shape as $\psi_n(x)$?`, [md`$\hat H$ treats $\hat x$ and $\hat p$ symmetrically (both squared), up to scaling`, 'Because ψn is real', 'Fourier transforms preserve every shape', 'It does not'], 0,
            [null, 'Real functions have very different transforms in general.', 'Only Hermite–Gaussians are their own transforms.', 'It does, up to a phase (−i)^n.'],
            md`Swap $x \leftrightarrow p/m\omega$ and $\hat H$ is unchanged. Hermite functions are eigenfunctions of the Fourier transform.`),
          L(5, 'exam level'),
          P({
            title: 'An electron in a 1 eV oscillator',
            q: md`An electron is bound in an oscillator with $\hbar\omega = 1$ eV. Find the ground-state length $w_x = \sqrt{\hbar/m\omega}$ in nm.`,
            parts: [{ lbl: 'w_x', ans: 0.2760, unit: 'nm' }],
            hints: [md`$w_x = \hbar c/\sqrt{(mc^2)(\hbar\omega)}$; $\hbar c = 197.3$ eV·nm, $m_ec^2 = 0.511$ MeV.`],
            sol: md`$197.3/\sqrt{0.511\times10^6} = 197.3/714.8 = 0.276$ nm: atomic size, as it should be for eV energies.`,
          }),
          P({
            title: 'Sudden shift',
            q: md`An oscillator is in its ground state when the trap center suddenly jumps by $d = w_x$. Find the probability to be found in the new ground state.`,
            parts: [{ lbl: 'P_0', ans: Math.exp(-0.5) }],
            hints: [md`$P = e^{-d^2/2w_x^2}$ (worked example).`],
            sol: md`$e^{-1/2} = 0.607$.`,
          }),
          Q(md`Compared with the center, near the turning points $\psi_n$ (large $n$) has…`, ['larger amplitude and longer local wavelength', 'smaller amplitude and shorter wavelength', 'the same amplitude', 'no oscillation at all'], 0,
            [null, 'Backwards: the particle is slow there.', 'WKB: amplitude ∝ 1/√p.', 'It oscillates up to the turning point.'],
            md`Local wavelength $h/p(x)$ grows as $E - V$ shrinks; amplitude $\propto 1/\sqrt{p}$ (more time spent there).`),
          L(6, 'harder than the exam'),
          P({
            title: 'Where is the half-oscillator particle?',
            q: md`Find $\langle x\rangle$ in the ground state of the half oscillator, in units of $w_x$. ($\int_0^\infty\xi^3e^{-\xi^2}d\xi = \tfrac12$.)`,
            parts: [{ lbl: '\\langle\\xi\\rangle', ans: 2 / Math.sqrt(Math.PI) }],
            hints: [md`$\psi = \sqrt2\psi_1$ for $x > 0$, $|\psi_1|^2 = \tfrac{2}{\sqrt\pi}\xi^2e^{-\xi^2}$.`],
            sol: md`$\langle\xi\rangle = 2\cdot\tfrac{2}{\sqrt\pi}\int_0^\infty\xi^3e^{-\xi^2}d\xi = \tfrac{2}{\sqrt\pi} = 1.128$.`,
          }),
          Q(md`The probability of being found beyond the classical turning points in $\ket0$, $\ket1$, $\ket2$ is 0.157, 0.112, 0.095. The trend means…`,
            ['tunneling into the forbidden region becomes relatively less important at high n (classical limit)', 'high states are more quantum', 'the tails get longer', 'it must reach zero at n = 3'], 0,
            [null, 'The opposite.', 'The tails are a smaller fraction of a wider state.', 'It decreases slowly, never exactly to zero.'],
            'Correspondence: as n grows, the quantum density approaches the classical one, which is zero outside.'),
          Q(md`A wavefunction $\psi(x) = Ae^{-\xi^2/2}(\xi^2 + c)$ is a stationary state of the oscillator for exactly one $c$. Which, and which state?`,
            [md`$c = -\tfrac12$, $\psi_2$`, md`$c = 0$, $\psi_2$`, md`$c = -1$, $\psi_2$`, md`$c = \tfrac12$, $\psi_0 + \psi_2$`], 0,
            [null, md`$\xi^2e^{-\xi^2/2}$ contains $\psi_0$ too.`, md`$2\xi^2 - 2$ is not $H_2$.`, md`$\xi^2 + \tfrac12$ is a superposition of $\psi_0$ and $\psi_2$: not stationary.`],
            md`$H_2 \propto 4\xi^2 - 2 \propto \xi^2 - \tfrac12$.`),
          R(md`
            ### Exam-style problem
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 486 · Exam-style problem · Topic 14</span><span>20 pts</span></div>',
            head: md`**Reading oscillator wavefunctions** [20 points, 5 per part]

            The oscillator stationary states are $\psi_n(x) = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}\frac{1}{\sqrt{2^nn!}}H_n(\xi)e^{-\xi^2/2}$, $\xi = \sqrt{m\omega/\hbar}\,x$, with $H_0 = 1$, $H_1 = 2\xi$, $H_2 = 4\xi^2 - 2$, $H_3 = 8\xi^3 - 12\xi$, and $E_n = (n + \tfrac12)\hbar\omega$.`,
            items: [
              {
                q: md`**(a)** Sketch $\psi_0$, $\psi_1$, $\psi_2$ together with $V(x)$, each drawn at the height of its energy. Mark the classical turning points. Comment on nodes and parity.`,
                ans: md`Gaussian (no node, even); one node at 0 (odd); two nodes at $\xi = \pm1/\sqrt2$ (even); turning points $\xi = \pm1, \pm\sqrt3, \pm\sqrt5$.`,
                figs: { a: { svg: ladderFig, cap: 'The expected sketch (ψ3 included).' } },
                sol: md`
                  **How to see it.** $n$ nodes, parity $(-1)^n$, oscillating inside the turning points, Gaussian decay outside, slightly wider for each step up.

                  [[fig:a]]

                  **Rubric** 5: correct shapes, nodes, parity, drawn at their energies, tails extending past the turning points. · 4: one flaw (tails stop at turning points, or wrong node position). · 3: shapes right but not at their energies or no turning points. · 2: wrong number of nodes. · 1: little beyond $\psi_0$.
                `,
              },
              {
                q: md`**(b)** Without evaluating any integrals, decide which of $\bra0\hat x\ket1$, $\bra0\hat x\ket2$, $\bra1\hat x^2\ket3$, $\bra0\hat x^2\ket2$ vanish. Justify, then give the nonzero ones in units of $\hbar/2m\omega$ (or its square root).`,
                ans: md`$\bra0\hat x\ket2 = 0$; $\bra0\hat x\ket1 = 1$, $\bra1\hat x^2\ket3 = \sqrt6$, $\bra0\hat x^2\ket2 = \sqrt2$.`,
                sol: md`
                  **How to see it.** Parity: the integrand $\psi_m x^k\psi_n$ has parity $(-1)^{m+k+n}$; odd means zero. The ladder then gives the numbers.

                  $\bra0\hat x\ket2$: $0 + 1 + 2$ odd, vanishes. The others have even total parity; the ladder gives $\bra0\hat a_-\ket1 = 1$, $\bra1\hat a_-^2\ket3 = \sqrt3\sqrt2$, $\bra0\hat a_-^2\ket2 = \sqrt2$. (Parity alone cannot show that $\bra1\hat x^2\ket3 \ne 0$; the ladder can.)

                  **Rubric** 5: correct zero by parity, three values by the ladder. · 4: one value wrong. · 3: only parity reasoning, no values. · 2: claims parity forces a nonzero result. · 1: guesses.
                `,
              },
              {
                q: md`**(c)** In $\ket0$ the probability of finding the particle beyond the classical turning points is about 0.16. Explain why this is possible, and why it does **not** violate energy conservation.`,
                ans: md`The Gaussian tail is nonzero where $V > E$; a position measurement does not leave the particle with energy $E_0$, so no energy bookkeeping is violated.`,
                sol: md`
                  **How to see it.** "Classically forbidden" is a statement about a particle that has definite $x$ and definite $E$ at once. A quantum state with definite $E$ does not have definite $x$.

                  The Schrödinger equation only requires $\psi'' \propto (V - E)\psi$: where $V > E$, $\psi$ curves away from the axis and decays, but it is not zero. A position measurement that finds the particle at $|x| > x_0$ collapses it into a narrow packet, which is a superposition of many energies; its average energy is larger than $E_0$ (the energy comes from the measurement interaction). Before the measurement, $\langle T\rangle = \tfrac14\hbar\omega > 0$ in the state as a whole.

                  **Rubric** 5: tail explained and the measurement/collapse argument made. · 4: one of the two explained well, the other vague. · 3: "tunneling" asserted, no conservation argument. · 2: claims $T < 0$ out there is fine without comment, or claims the probability is zero. · 1: little.
                `,
              },
              {
                q: md`**(d)** True or false? Justify. "For large $n$, $|\psi_n(x)|^2$ approaches the classical density $P_{\text{class}}(x) = 1/\pi\sqrt{x_n^2 - x^2}$ at every point $x$."`,
                ans: md`False.`,
                figs: { d: { svg: classicalFig, cap: md`$n = 10$: the quantum density oscillates about the classical curve.` } },
                sol: md`
                  **False.** $|\psi_n|^2$ has $n$ zeros between the turning points, so it keeps oscillating between 0 and about twice the classical value however large $n$ is. Only its average over a few wiggles approaches $P_{\text{class}}$. It also leaks past the turning points, where $P_{\text{class}} = 0$.

                  [[fig:d]]

                  **Rubric** 5: False; nodes/oscillation and local average; mention of the tails is a bonus. · 4: good reasoning, imprecise. · 3: fair attempt. · 2: some relevant thought. · 1: correct verdict only.
                `,
              },
            ],
          },
          R(md`
            ### Endless practice

            Physical numbers for real oscillators: widths, energies, turning points.

            Where this shows up: [Homework 5](#/l/hw5) Problem 3, [Discussion 5](#/l/disc5) (half oscillator), [Discussion 6](#/l/disc6) (turning points, classical limit).
          `),
          G('m2_sho_numbers', { need: 3 }),
        ],
        bank: [
          Q(md`Which oscillator state has nonzero density at $x = 0$?`, [md`$\psi_2$`, md`$\psi_1$`, md`$\psi_3$`, md`$\psi_5$`], 0,
            [null, 'Odd: zero at the origin.', 'Odd.', 'Odd.'], 'Even states only.'),
          Q(md`$\psi_0(x)$ is a Gaussian because…`, [md`$\hat a_-\psi_0 = 0$ is the first-order ODE $\psi' = -\tfrac{m\omega}{\hbar}x\psi$`, 'all ground states are Gaussian', 'V is even', 'it is normalizable'], 0,
            [null, 'The box ground state is a sine.', 'Many even potentials have non-Gaussian ground states.', 'Necessary, not the reason.'], 'One-line derivation.'),
          Q(md`In the half oscillator, why multiply $\psi_1$ by $\sqrt2$?`, ['Half the probability (x < 0) was discarded', 'The energy doubled', 'ψ1 was not normalized', 'Convention'], 0,
            [null, 'The energy is unchanged for the survivors.', 'It was, on the whole line.', 'Needed for normalization.'], md`$\int_0^\infty|\psi_1|^2 = \tfrac12$.`),
          Q(md`The ground-state probability density of the oscillator is largest…`, ['at the center', 'at the turning points', 'outside the turning points', 'uniform'], 0,
            [null, 'That is the classical (and large-n) picture.', 'Smallest there.', 'Gaussian.'], md`$|\psi_0|^2 \propto e^{-\xi^2}$: opposite of classical.`),
          Q(md`In a uniform field the oscillator's level spacing…`, ['is unchanged', 'increases', 'decreases', 'becomes uneven'], 0,
            [null, 'Completing the square only shifts.', 'Same ω.', 'Still a parabola.'], 'Shift in x and a constant shift in E.'),
          Q(md`$\psi_n$ and $\psi_{n+1}$ always have…`, ['opposite parity', 'the same parity', 'the same number of nodes', 'the same width'], 0,
            [null, 'â+ flips parity.', 'n + 1 nodes vs n.', 'Higher states are wider.'], md`$(-1)^n$ vs $(-1)^{n+1}$.`),
        ],
      },

      // ------------------------------------------------------------------ Topic 15
      {
        id: 't15-shomotion', topic: 15, title: 'Motion: superpositions, phase space and the classical limit', ref: 'Lecture 11, HW 6.1, Discussions 5–6',
        steps: [
          RF(md`
            ### The picture

            Stationary states do not move. Motion is **interference between neighbors on the ladder**. Two rules decide everything:

            - **Which pairs:** $\hat x$ and $\hat p$ connect $n$ to $n \pm 1$. So $\langle x\rangle$ and $\langle p\rangle$ only see pairs of **adjacent** levels. A state built from $\ket0$ and $\ket2$ alone has $\langle x\rangle = 0$ forever, but its width $\langle x^2\rangle$ (which connects $n$ to $n \pm 2$) **breathes**.
            - **How fast:** a pair $(n, n')$ beats at $(E_{n'} - E_n)/\hbar = (n' - n)\omega$. Adjacent pairs give $\omega$, the classical frequency, for every $n$. That is special to the even ladder.

            [[fig:sl]]

            $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$ sloshes from right to left and back with period $2\pi/\omega$, exactly like Midterm 1's infinite-well $\psi_1 + \psi_2$.

            [[fig:br]]

            $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$ stays centered but alternately widens and narrows at $2\omega$.

            ### The master formula

            Every expectation value of $\hat x$, $\hat p$ is set by one complex number, $\langle\hat a_-\rangle$. From Ehrenfest, $\tfrac{d\langle\hat a_-\rangle}{dt} = \tfrac{i}{\hbar}\langle[\hat H, \hat a_-]\rangle = \tfrac{i}{\hbar}(-\hbar\omega)\langle\hat a_-\rangle$, so
            $$\langle\hat a_-\rangle(t) = \langle\hat a_-\rangle_0\,e^{-i\omega t},\qquad \langle\hat a_-\rangle_0 = \sum_nc_n^*c_{n+1}\sqrt{n+1}$$
            $$\langle x\rangle = \sqrt{\frac{2\hbar}{m\omega}}\,\text{Re}\langle\hat a_-\rangle,\qquad \langle p\rangle = \sqrt{2\hbar m\omega}\,\text{Im}\langle\hat a_-\rangle$$
            In the scaled plane $\left(\tilde x, \tilde p\right) = \left(\langle x\rangle/\sqrt{\hbar/2m\omega},\ \langle p\rangle/\sqrt{\hbar m\omega/2}\right)$, the point $2\langle\hat a_-\rangle$ goes around a circle, **clockwise**, period $2\pi/\omega$, for **any** state. Stationary states sit at the origin.
          `, { sl: { svg: sloshFig, cap: md`$\tfrac{1}{\sqrt2}(\psi_0 + \psi_1)$: right at $\omega t = 0$, centered at $\pi/2$, left at $\pi$.` }, br: { svg: breatheFig, cap: md`$\tfrac{1}{\sqrt2}(\psi_0 + \psi_2)$: wide at $\omega t = 0$, narrow at $\pi/2$. $\langle x\rangle = 0$ throughout.` } }),
          RF(md`
            ### Phase space and the classical limit (Discussion 6)

            [[fig:ph]]

            For $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$: $\langle\hat a_-\rangle = \tfrac12e^{-i\omega t}$, so $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t$ and $\langle p\rangle = -\sqrt{\tfrac{\hbar m\omega}{2}}\sin\omega t$. The orbit radius is $\sqrt{\hbar/2m\omega} = w_x/\sqrt2$, the same as the ground-state spread $\sigma_x$. The dashed circle is that spread: **the orbit is no bigger than the fuzz**. The averages move classically, but the system is not classical.

            **When is it classical?** The oscillator supplies one energy, $\hbar\omega$, and one length, $w_x$. Classical needs $E \gg \hbar\omega$, i.e. $n \gg 1$, and amplitude $x_0 \gg w_x$. They are the same condition: $x_0/w_x = \sqrt{2n + 1}$. A big orbit needs many levels with **well-defined relative phases** (Topic 16).

            ### Reading phases from measurements (Discussion 5)

            In $c_0\ket0 + c_1\ket1$: $\langle H\rangle$ fixes $|c_0|^2$, $|c_1|^2$ but not the phase (it is diagonal: no interference). $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\,2|c_0c_1|\cos\theta$ fixes $\cos\theta$ ($\theta$ = relative phase), and the sign of $\langle p\rangle \propto \sin\theta$ fixes its sign. Three measurements, one state (up to global phase).
          `, { ph: { svg: phaseFig, cap: md`$\tfrac{1}{\sqrt2}(\ket0 + \ket1)$ in scaled phase space: clockwise unit circle; the dashed circle is the ground-state spread at $t = 0$.` } }),
          R(md`
            ### Worked example

            !!graded Problem
              $\Psi(x, 0) = \tfrac{1}{\sqrt2}(\psi_1 + i\psi_2)$. (a) $\Psi(x, t)$ and the period of $|\Psi|^2$. (b) $\langle x\rangle(t)$ and $\langle p\rangle(t)$; check Ehrenfest. (c) $\langle H\rangle$ and $\sigma_H$. (d) Where does the orbit start in phase space, and which way does it go?

            **(a)** $\Psi = \tfrac{1}{\sqrt2}\left(\psi_1e^{-3i\omega t/2} + i\psi_2e^{-5i\omega t/2}\right)$. One beat frequency, $\omega$: period $2\pi/\omega$.

            **(b)** $\langle\hat a_-\rangle_0 = c_1^*c_2\sqrt2 = \tfrac12\cdot i\cdot\sqrt2 = \tfrac{i}{\sqrt2}$. Then $\langle\hat a_-\rangle = \tfrac{i}{\sqrt2}e^{-i\omega t} = \tfrac{1}{\sqrt2}(\sin\omega t + i\cos\omega t)$:
            $$\langle x\rangle = \sqrt{\frac{\hbar}{m\omega}}\sin\omega t,\qquad \langle p\rangle = \sqrt{\hbar m\omega}\cos\omega t$$
            Ehrenfest: $m\tfrac{d\langle x\rangle}{dt} = \sqrt{\hbar m\omega}\cos\omega t = \langle p\rangle$ ✓, and $\tfrac{d\langle p\rangle}{dt} = -m\omega^2\langle x\rangle$ ✓.

            **(c)** $\langle H\rangle = \tfrac12(\tfrac32 + \tfrac52)\hbar\omega = 2\hbar\omega$; $\sigma_H = \tfrac{\hbar\omega}{2}$ (two levels one quantum apart, equal weights).

            **(d)** At $t = 0$: $\langle x\rangle = 0$, $\langle p\rangle > 0$, the top of the circle, moving to $+x$: clockwise, as always. The $i$ (relative phase $\pi/2$) starts the particle at the center moving right, instead of at a turning point.

            !!mistake Common mistakes
              - One common phase $e^{-iEt/\hbar}$ for the whole superposition: then nothing moves.
              - Expecting $\langle x\rangle \ne 0$ from $\ket n$ and $\ket{n+2}$: $\hat x$ needs adjacent levels.
              - Getting the direction wrong: phase-space orbits of an oscillator are clockwise ($x$ up when $p > 0$).
              - Calling the motion classical because $\langle x\rangle$ oscillates. Compare the amplitude with $w_x$.
              - Forgetting $\sqrt{n+1}$ in $c_n^*c_{n+1}\sqrt{n+1}$: higher pairs slosh with larger amplitude.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`In phase space, a stationary state $\ket n$ is…`, ['a point at the origin, for all t', 'a circle of radius √(2n+1)', 'a point moving clockwise', 'undefined'], 0,
            [null, md`That is the size of its fuzz, not an orbit: $\langle x\rangle = \langle p\rangle = 0$.`, 'Nothing moves in a stationary state.', md`$(\langle x\rangle, \langle p\rangle)$ is well defined.`],
            md`$\langle\hat a_-\rangle = 0$ in $\ket n$.`),
          Q(md`A state is a superposition of $\ket1$ and $\ket3$ only. Then…`, [md`$\langle x\rangle = 0$ always, but $|\Psi|^2$ changes at $2\omega$`, md`$\langle x\rangle$ oscillates at $2\omega$`, 'nothing changes', md`$\langle x\rangle$ oscillates at $\omega$`], 0,
            [null, md`$\hat x$ connects only adjacent levels.`, md`The 1–3 interference term in $|\Psi|^2$ beats at $(E_3 - E_1)/\hbar = 2\omega$.`, 'No adjacent pair.'],
            'Breathing: symmetric changes of width, no sloshing.'),
          L(2, 'set up'),
          P({
            title: 'Unequal mixture',
            q: md`$\ket\Psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac12\ket1$. Find the amplitude of $\langle x\rangle(t)$ in units of $\sqrt{\hbar/2m\omega}$ and $\langle H\rangle/\hbar\omega$.`,
            parts: [{ lbl: '\\text{amplitude}', ans: Math.sqrt(3) / 2 }, { lbl: '\\langle H\\rangle/\\hbar\\omega', ans: 0.75 }],
            hints: [md`Amplitude $= 2|c_0c_1|\sqrt1$.`],
            sol: md`$2\cdot\tfrac{\sqrt3}{2}\cdot\tfrac12 = 0.866$; $\tfrac34\cdot\tfrac12 + \tfrac14\cdot\tfrac32 = 0.75$.`,
          }),
          P({
            title: 'Breathing period',
            q: md`$\tfrac{1}{\sqrt2}(\ket1 + \ket3)$: enter the period of $|\Psi(x, t)|^2$ in units of $1/\omega$.`,
            parts: [{ lbl: 'T\\omega', ans: Math.PI }],
            sol: md`Beat frequency $2\omega$: $T = 2\pi/2\omega = \pi/\omega$.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Complex coefficients',
            q: md`$\ket\Psi = \tfrac15(3\ket1 + 4i\ket2)$. Find the amplitude of $\langle x\rangle(t)$ in units of $\sqrt{\hbar/2m\omega}$, and $\langle p\rangle(0)$ in units of $\sqrt{\hbar m\omega/2}$.`,
            parts: [{ lbl: '\\text{amplitude}', ans: 24 * Math.SQRT2 / 25 }, { lbl: '\\langle p\\rangle(0)', ans: 24 * Math.SQRT2 / 25 }],
            hints: [md`$\langle\hat a_-\rangle_0 = c_1^*c_2\sqrt2 = \tfrac{12i\sqrt2}{25}$.`, md`$\tilde x = 2\,\text{Re}$, $\tilde p = 2\,\text{Im}$.`],
            sol: md`$2|\langle\hat a_-\rangle| = \tfrac{24\sqrt2}{25} = 1.358$. At $t = 0$, $\langle\hat a_-\rangle$ is purely imaginary and positive, so $\langle x\rangle = 0$ and $\langle p\rangle$ is at its maximum, $+1.358$.`,
          }),
          Q(md`Which way do oscillator states go around in the $(\langle x\rangle, \langle p\rangle)$ plane?`, ['Clockwise', 'Counterclockwise', 'Depends on the state', 'They do not move'], 0,
            [null, 'When p > 0, x increases: that is clockwise with x right and p up.', md`$\langle\hat a_-\rangle \propto e^{-i\omega t}$ for every state.`, 'Only stationary states sit still.'],
            md`Classically $\dot x = p/m$: in the upper half ($p > 0$), $x$ grows.`),
          Q(md`Discussion 5: in $c_0\ket0 + c_1\ket1$ someone measures $\langle H\rangle = \hbar\omega$. What do you learn?`, [md`$|c_0|^2 = |c_1|^2 = \tfrac12$, nothing about the relative phase`, 'The full state', 'Only that the state is normalized', md`$c_0 = c_1$`], 0,
            [null, md`$\hat H$ is diagonal: no interference, no phase information.`, 'Normalization was assumed.', 'Phases are not fixed.'],
            md`$\tfrac12|c_0|^2 + \tfrac32|c_1|^2 = 1$ with $|c_0|^2 + |c_1|^2 = 1$.`),
          L(4, 'one twist'),
          P({
            title: 'Reconstructing the phase',
            q: md`$\ket\Psi = \tfrac{1}{\sqrt2}(\ket0 + e^{i\theta}\ket1)$ has $\langle x\rangle(0) = \tfrac{\sqrt3}{2}\sqrt{\hbar/2m\omega}$ and $\langle p\rangle(0) < 0$. Find $\theta$ in $(-\pi, \pi]$.`,
            parts: [{ lbl: '\\theta', ans: -Math.PI / 6 }],
            hints: [md`$\langle x\rangle = \sqrt{\hbar/2m\omega}\cos\theta$, $\langle p\rangle = \sqrt{\hbar m\omega/2}\sin\theta$.`],
            sol: md`$\cos\theta = \tfrac{\sqrt3}{2}$ gives $\pm\pi/6$; $\sin\theta < 0$ picks $\theta = -\pi/6 = -0.524$.`,
          }),
          P({
            title: 'Breathing widths',
            q: md`For $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$, $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}(3 + \sqrt2\cos2\omega t)$. Find the largest and smallest $\langle x^2\rangle$ in units of $\hbar/m\omega$.`,
            parts: [{ lbl: '\\langle x^2\\rangle_{\\max}', ans: (3 + Math.SQRT2) / 2 }, { lbl: '\\langle x^2\\rangle_{\\min}', ans: (3 - Math.SQRT2) / 2 }],
            hints: [md`$\langle\hat a_-^2\rangle = c_0^*c_2\sqrt2e^{-2i\omega t}$; $\langle\hat N\rangle = 1$.`],
            sol: md`$\tfrac{3 \pm \sqrt2}{2}$: 2.207 and 0.793. Even at its narrowest it is wider than the ground state (0.5). At that instant $\langle p^2\rangle = \tfrac{\hbar m\omega}{2}(3 + \sqrt2)$ is at its largest: $x$ and $p$ widths trade off at $2\omega$, and the product never drops below $\hbar/2$.`,
          }),
          Q(md`For $\tfrac{1}{\sqrt2}(\ket n + \ket{n+1})$, how does the amplitude of $\langle x\rangle$ depend on $n$?`, [md`$\propto\sqrt{n+1}$`, 'independent of n', md`$\propto n$`, md`$\propto 1/\sqrt n$`], 0,
            [null, md`$\bra n\hat a_-\ket{n+1} = \sqrt{n+1}$.`, 'Larger.', 'Square root.'], md`Amplitude $\sqrt{\hbar/2m\omega}\sqrt{n+1}$, still at frequency $\omega$.`),
          L(5, 'exam level'),
          P({
            title: 'How classical is n = 100?',
            q: md`For $n = 100$, find the classical amplitude in units of $w_x$.`,
            parts: [{ lbl: 'x_0/w_x', ans: Math.sqrt(201) }],
            hints: [md`$\tfrac12m\omega^2x_0^2 = (n + \tfrac12)\hbar\omega$.`],
            sol: md`$\sqrt{2n+1} = \sqrt{201} = 14.2$: the orbit is 14 ground-state widths wide. Getting classical.`,
          }),
          P({
            title: 'A pendulum',
            q: md`A 1 kg mass on a spring with $\omega = 1$ rad/s oscillates with amplitude 1 cm. Find $\log_{10}n$ for the equivalent quantum number.`,
            parts: [{ lbl: '\\log_{10}n', ans: 29.676 }],
            hints: [md`$E = \tfrac12m\omega^2x_0^2$, $n \approx E/\hbar\omega$.`],
            sol: md`$E = 5\times10^{-5}$ J, $\hbar\omega = 1.055\times10^{-34}$ J, $n = 4.7\times10^{29}$. Nobody will notice the steps.`,
          }),
          Q(md`Is the orbit of $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$ "classical"?`, ['No: its radius √(ħ/2mω) equals the ground-state spread, so the orbit is inside the fuzz', 'Yes: ⟨x⟩ obeys Newton', 'Yes: it has period 2π/ω', 'No: it moves counterclockwise'], 0,
            [null, 'Every state does (Topic 11).', 'Every state does.', 'Clockwise, like every state.'],
            md`Discussion 6: "the expectation values behave classically" and "the system is classical" are different claims.`),
          L(6, 'harder than the exam'),
          P({
            title: 'Three levels',
            q: md`$\ket\Psi = \tfrac{1}{\sqrt3}(\ket0 + \ket1 + \ket2)$. Find the amplitude of $\langle x\rangle(t)$ in units of $\sqrt{\hbar/2m\omega}$.`,
            parts: [{ lbl: '\\text{amplitude}', ans: 2 * (1 + Math.SQRT2) / 3 }],
            hints: [md`$\langle\hat a_-\rangle_0 = \tfrac13(1\cdot\sqrt1 + 1\cdot\sqrt2)$.`],
            sol: md`$2\cdot\tfrac{1 + \sqrt2}{3} = 1.61$. Both adjacent pairs beat at $\omega$ and add in phase.`,
          }),
          Q(md`Does $|\Psi(x, t)|^2$ of **every** oscillator state repeat after $T = 2\pi/\omega$?`, [md`Yes: all $E_n - E_m$ are multiples of $\hbar\omega$, so $\Psi(t + T) = -\Psi(t)$, a global phase`, 'Only coherent states', 'Only two-level superpositions', 'No: the ½ spoils it'], 0,
            [null, 'Every state.', 'Every state.', md`The $\tfrac12$ gives the global factor $e^{-i\pi} = -1$, which is unobservable.`],
            md`$e^{-i(n+1/2)\omega T} = e^{-i\pi}$ for every $n$. (The infinite well only revives at a much longer time, because its levels go as $n^2$.)`),
          Q(md`For **any** oscillator state, $\langle\hat a_-\rangle(t) = \langle\hat a_-\rangle_0e^{-i\omega t}$. What follows?`,
            [md`$(\langle x\rangle, \langle p\rangle)$ always traces a (scaled) circle at $\omega$, possibly of radius 0`, 'Every state is coherent', 'σx is constant for every state', 'Energy is not conserved'], 0,
            [null, md`Coherent means $\hat a_-\ket\alpha = \alpha\ket\alpha$, much stronger.`, 'Breathing states have oscillating σx.', 'Unrelated.'],
            md`Only the first moments are this simple. Widths can still breathe at $2\omega$ (through $\langle\hat a_-^2\rangle \propto e^{-2i\omega t}$).`),
          R(md`
            ### Exam-style problem

            This one is Midterm 1 Problem 1 transplanted to the oscillator. Do it timed (15 minutes).
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 486 · Exam-style problem · Topic 15</span><span>20 pts</span></div>',
            head: md`**The oscillator as a two-level system** [20 points, 5 per part]

            A particle in $V = \tfrac12m\omega^2x^2$ has stationary states $\psi_n$, $E_n = (n + \tfrac12)\hbar\omega$, with $\psi_0 = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}e^{-\xi^2/2}$, $\psi_1 = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}\sqrt2\,\xi e^{-\xi^2/2}$, $\xi = \sqrt{m\omega/\hbar}\,x$, and $\hat x = \sqrt{\tfrac{\hbar}{2m\omega}}(\hat a_+ + \hat a_-)$, $\hat p = i\sqrt{\tfrac{\hbar m\omega}{2}}(\hat a_+ - \hat a_-)$. At $t = 0$ the particle is in $\ket{\Psi(0)} = \tfrac{1}{\sqrt2}(\ket0 + \ket1)$.`,
            items: [
              {
                q: md`**(a)** Show that the probability to find the particle at $x > 0$ is $P_R(t) = \tfrac12 + J\cos\omega t$ with $J = \int_0^\infty\psi_0\psi_1\,dx$. Explain where the $\tfrac12$ comes from, and decide the sign of $J$ without integrating.`,
                ans: md`$P_R = \tfrac12 + J\cos\omega t$; each $\psi_n^2$ is even, so contributes $\tfrac12$ on each side; $J > 0$ (both positive for $x > 0$). ($J = 1/\sqrt{2\pi} \approx 0.40$.)`,
                sol: md`
                  **How to see it.** Same structure as Midterm 1 Problem 1: two real states, one beat.

                  $|\Psi|^2 = \tfrac12\left(\psi_0^2 + \psi_1^2 + 2\psi_0\psi_1\cos\omega t\right)$ (relative phase $e^{-i\omega t}$, real $\psi$'s). Integrating over $x > 0$: $\psi_n^2$ is even, so $\int_0^\infty\psi_n^2 = \tfrac12$, giving $\tfrac12(\tfrac12 + \tfrac12) = \tfrac12$, plus $J\cos\omega t$. For $x > 0$, $\psi_0 > 0$ and $\psi_1 > 0$, so $J > 0$: the particle starts weighted to the right. (Explicitly $J = \tfrac{\sqrt2}{\sqrt\pi}\int_0^\infty\xi e^{-\xi^2}d\xi = \tfrac{1}{\sqrt{2\pi}}$.)

                  **Rubric** 5: expansion with the time factor, $\tfrac12$ explained by parity, sign of $J$ justified. · 4: sign only asserted or $\tfrac12$ unexplained. · 3: no sound explanations. · 2: cross term missing or no time dependence. · 1: normalization only.
                `,
              },
              {
                q: md`**(b)** Find $\langle x\rangle(t)$ and $\langle p\rangle(t)$. Sketch the point $(\langle x\rangle, \langle p\rangle)$ over one period: shape, direction, period. Compare its size with the ground-state width. Would you call this motion classical?`,
                ans: md`$\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t$, $\langle p\rangle = -\sqrt{\tfrac{\hbar m\omega}{2}}\sin\omega t$; ellipse (circle in scaled units), clockwise, period $2\pi/\omega$; radius $= \sigma_x$ of $\ket0$: not classical.`,
                figs: { b: { svg: phaseFig, cap: md`Scaled phase space: the orbit (solid) and the ground-state spread at $t = 0$ (dashed).` } },
                sol: md`
                  **How to see it.** $\langle\hat a_-\rangle = \tfrac12e^{-i\omega t}$; real part gives $x$, imaginary part gives $p$.

                  $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cdot2\,\text{Re}\left(\tfrac12e^{-i\omega t}\right)$, $\langle p\rangle = \sqrt{\tfrac{\hbar m\omega}{2}}\cdot2\,\text{Im}\left(\tfrac12e^{-i\omega t}\right)$. Starts at the right turning point, moves to negative $p$: clockwise. Radius $\sqrt{\hbar/2m\omega} = w_x/\sqrt2$, equal to the ground-state $\sigma_x$; in this state $\sigma_x \ge \sqrt{\hbar/2m\omega}$ at all times ($\langle x^2\rangle = \hbar/m\omega$). Not classical: the orbit lies inside the uncertainty blob.

                  [[fig:b]]

                  **Rubric** 5: both expectation values, correct clockwise orbit, size compared with the width, verdict. · 4: one of direction/size comparison missing. · 3: $\langle x\rangle$ right, $\langle p\rangle$ wrong sign or missing. · 2: no time dependence. · 1: little progress.
                `,
              },
              {
                q: md`**(c)** Treat $\ket0, \ket1$ as a qubit and let $\hat\sigma_x = \ket0\bra1 + \ket1\bra0$. Show that $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\langle\hat\sigma_x\rangle$ for any state in this two-level space. Find the eigenvectors $\ket\pm$ of $\hat\sigma_x$, sketch $\braket{x|\pm}$, and interpret $\hat\sigma_x$ physically.`,
                ans: md`$\bra0\hat x\ket1 = \sqrt{\hbar/2m\omega}$ and $\bra0\hat x\ket0 = \bra1\hat x\ket1 = 0$; $\ket\pm = \tfrac{1}{\sqrt2}(\ket0 \pm \ket1)$; $\ket+$ is weighted right, $\ket-$ its mirror image: $\hat\sigma_x$ asks "right or left?".`,
                sol: md`
                  **How to see it.** Inside span$\{\ket0, \ket1\}$, $\hat x$ only has the off-diagonal element $\sqrt{\hbar/2m\omega}$: that is $\sqrt{\hbar/2m\omega}\,\hat\sigma_x$. (It is not the full $\hat x$: $\hat x$ also takes $\ket1$ to $\ket2$, but that does not affect averages in this subspace.)

                  $\ket+ = \tfrac{1}{\sqrt2}(\ket0 + \ket1)$: $\psi_0 + \psi_1$ adds on the right, cancels partly on the left. $\ket-$: the mirror image. So $\langle\hat\sigma_x\rangle = +1$ means "on the right", $-1$ "on the left". With $\hat H = \hbar\omega(\mathbb 1 - \tfrac12\hat\sigma_z)$ in this space, the Bloch vector precesses about $z$ at $\omega$, so $\langle\hat\sigma_x\rangle = \cos\omega t$: the particle sloshes right–left, matching (a) and (b). Similarly $\hat p \to \sqrt{\hbar m\omega/2}\,\hat\sigma_y$.

                  **Rubric** 5: correct matrix argument, eigenvectors, mirror-image sketches, right/left interpretation with the oscillation. · 4: calculation right, sketches or interpretation weak. · 3: eigenvectors right, no link to $\hat x$. · 2: no handling of $\hat\sigma_x$. · 1: little progress.
                `,
              },
              {
                q: md`**(d)** True or false? Justify. "If the energy is measured at $t = \pi/\omega$ and gives $\tfrac12\hbar\omega$, then afterwards $\langle x\rangle$ continues to oscillate, now starting from the left."`,
                ans: md`False.`,
                sol: md`
                  **False.** The measurement collapses the state to $\ket0$, a stationary state: $\langle x\rangle = 0$ for all later times and $|\Psi|^2$ never changes again. Motion needs a superposition of adjacent levels; the energy measurement destroyed it.

                  **Rubric** 5: False with collapse to $\ket0$ and "stationary". · 4: good reasoning, imprecise. · 3: fair attempt. · 2: some relevant thought. · 1: correct verdict only.
                `,
              },
            ],
          },
          R(md`
            ### Endless practice

            Fresh superpositions every time: probabilities, average energies, frequencies, amplitudes.

            Where this shows up: [Homework 6](#/l/hw6) Problem 1, [Discussion 5](#/l/disc5) Problem 1, [Discussion 6](#/l/disc6).
          `),
          G('m2_sho_super', { need: 3 }),
        ],
        bank: [
          Q(md`$\tfrac{1}{\sqrt2}(\ket2 + \ket3)$: $|\Psi|^2$ oscillates at…`, [md`$\omega$`, md`$2\omega$`, md`$3\omega$`, md`$5\omega/2$`], 0,
            [null, 'Adjacent levels.', 'Not a frequency difference here.', 'That is an energy over ħ, not a difference.'], md`$(E_3 - E_2)/\hbar$.`),
          Q(md`Which of these states has $\langle x\rangle(t) = 0$ for all $t$?`, [md`$\tfrac{1}{\sqrt2}(\ket0 + \ket2)$`, md`$\tfrac{1}{\sqrt2}(\ket0 + \ket1)$`, md`$\tfrac{1}{\sqrt2}(\ket1 + i\ket2)$`, md`$\tfrac{1}{\sqrt3}(\ket0 + \ket1 + \ket2)$`], 0,
            [null, 'Adjacent pair.', 'Adjacent pair.', 'Contains adjacent pairs.'], 'No adjacent pair.'),
          Q(md`$\langle\hat a_-\rangle$ in $\ket n$ is…`, ['0', md`$\sqrt n$`, md`$n$`, '1'], 0,
            [null, md`$\hat a_-\ket n \propto \ket{n-1}$, orthogonal to $\ket n$.`, 'Orthogonal.', 'Orthogonal.'], 'Stationary: origin of phase space.'),
          Q(md`The relative phase between $\ket0$ and $\ket1$ in $\tfrac{1}{\sqrt2}(\ket0 + e^{i\theta}\ket1)$ evolves as…`, [md`$\theta - \omega t$`, md`$\theta + \omega t$`, md`$\theta$ (constant)`, md`$\theta - \omega t/2$`], 0,
            [null, 'Sign: the higher level rotates faster clockwise.', 'Relative phases do change.', md`The difference of $\tfrac32\omega$ and $\tfrac12\omega$ is $\omega$.`],
            md`Discussion 5: only the relative phase is physical, and it winds at $\omega$.`),
          Q(md`A state with $\langle x\rangle = 3w_x$ and $\langle p\rangle = 0$ at $t = 0$. At $t = \pi/\omega$:`, [md`$\langle x\rangle = -3w_x$, $\langle p\rangle = 0$`, md`$\langle x\rangle = 0$`, md`$\langle x\rangle = 3w_x$`, 'depends on the state'], 0,
            [null, 'That is a quarter period.', 'That is a full period.', 'Ehrenfest fixes the first moments for every state.'], 'Half a period: the opposite turning point.'),
          Q(md`Classical behavior of the oscillator needs…`, [md`many levels with well-defined relative phases, $n \gg 1$`, md`only $n \gg 1$, any phases`, 'a single large-n stationary state', 'a small ω'], 0,
            [null, 'Random phases give ⟨x⟩ ≈ 0.', 'Stationary: nothing moves.', 'ω alone does not decide it.'],
            md`Large amplitude needs $\langle\hat a_-\rangle$ large: many coherent neighbors.`),
        ],
      },

      // ------------------------------------------------------------------ Topic 16
      {
        id: 't16-coherent', topic: 16, title: 'Coherent states: the most classical quantum states', ref: 'Lecture 11, HW 6.3',
        steps: [
          RF(md`
            ### The picture

            Take the ground-state Gaussian, slide it to $x_0$, and let go. It swings back and forth like a classical ball, **without spreading**, forever. That state is a coherent state.

            [[fig:mv]]

            Lecture 11 found it by asking what a "classical" state should be. Not a stationary state ($\langle x\rangle = 0$, nothing moves). Not an eigenstate of $\hat x$ or $\hat p$ (not normalizable, not physical). The answer: an eigenstate of the **lowering** operator,
            $$\hat a_-\ket\alpha = \alpha\ket\alpha,\qquad \alpha \in \mathbb C$$
            Why this works: $\langle\hat a_-\rangle$ is the complex number whose real and imaginary parts are $\langle x\rangle$ and $\langle p\rangle$ (Topic 15). An eigenstate of $\hat a_-$ has that number **sharp**: the averages are exactly $\text{Re}\,\alpha$ and $\text{Im}\,\alpha$ (scaled), with the smallest spread allowed.

            ### Averages and widths (HW 6.3a,b)

            Use $\hat a_-\ket\alpha = \alpha\ket\alpha$ and its adjoint $\bra\alpha\hat a_+ = \alpha^*\bra\alpha$:
            $$\langle x\rangle = \sqrt{\frac{\hbar}{2m\omega}}(\alpha + \alpha^*) = \sqrt{\frac{2\hbar}{m\omega}}\,\text{Re}\,\alpha,\qquad \langle p\rangle = i\sqrt{\frac{\hbar m\omega}{2}}(\alpha^* - \alpha) = \sqrt{2\hbar m\omega}\,\text{Im}\,\alpha$$
            For $\langle x^2\rangle$, order matters: $\langle\hat a_-\hat a_+\rangle = \langle\hat a_+\hat a_-\rangle + 1 = |\alpha|^2 + 1$. So
            $$\langle x^2\rangle = \frac{\hbar}{2m\omega}\left(\alpha^{*2} + \alpha^2 + 2|\alpha|^2 + 1\right) = \langle x\rangle^2 + \frac{\hbar}{2m\omega}\;\Rightarrow\;\sigma_x = \sqrt{\frac{\hbar}{2m\omega}},\quad \sigma_p = \sqrt{\frac{\hbar m\omega}{2}},\quad \sigma_x\sigma_p = \frac\hbar2$$
            The same widths as the ground state, whatever $\alpha$ is: **a displaced ground state**.

            ### In the energy basis (HW 6.3c,d, Lecture 11)

            $\bra n\hat a_-\ket\alpha = \alpha c_n$, and also $\bra n\hat a_- = \sqrt{n+1}\bra{n+1}$, so $\sqrt{n+1}\,c_{n+1} = \alpha c_n$:
            $$c_n = \frac{\alpha^n}{\sqrt{n!}}c_0,\qquad c_0 = e^{-|\alpha|^2/2},\qquad P(n) = e^{-|\alpha|^2}\frac{|\alpha|^{2n}}{n!}$$
            ($\sum|\alpha|^{2n}/n! = e^{|\alpha|^2}$.) A **Poisson** distribution with mean $\langle n\rangle = |\alpha|^2$ and spread $\sigma_n = |\alpha|$. So $\langle H\rangle = \hbar\omega(|\alpha|^2 + \tfrac12)$ and $\sigma_H = \hbar\omega|\alpha|$; the relative spread $\sigma_H/\langle H\rangle \approx 1/|\alpha|$ shrinks for big orbits.
          `, { mv: { svg: cohMove, cap: md`A coherent state ($\alpha = 2$) at $\omega t = 0, \pi/4, \pi/2$: same shape, center $2\sqrt2\,w_x\cos\omega t$. Dashed: the potential.` } }),
          RF(md`
            ### Time evolution (HW 6.3e,f)

            Each $\ket n$ picks up $e^{-i(n + 1/2)\omega t}$. Absorb $e^{-in\omega t}$ into $\alpha^n$:
            $$\ket{\alpha(t)} = e^{-i\omega t/2}\,e^{-|\alpha|^2/2}\sum_n\frac{(\alpha e^{-i\omega t})^n}{\sqrt{n!}}\ket n = e^{-i\omega t/2}\ket{\alpha e^{-i\omega t}}$$
            **A coherent state stays coherent**, with $\alpha(t) = \alpha e^{-i\omega t}$. Write $\alpha = C\sqrt{\tfrac{m\omega}{2\hbar}}e^{i\phi}$: then $\langle x\rangle = C\cos(\omega t - \phi)$, the classical motion with amplitude $C$, and $\sigma_x$ never changes.

            [[fig:ps]]

            In scaled phase space ($\tilde x = 2\,\text{Re}\,\alpha$, $\tilde p = 2\,\text{Im}\,\alpha$) the center runs clockwise around a circle of radius $2|\alpha|$ carrying a fuzz disk of radius 1. Large $|\alpha|$: the disk is tiny compared with the orbit. That is the classical limit.

            ### Coherent versus stationary (HW 6.3g)

            | | coherent $\ket\alpha$, $|\alpha|^2 = N$ | stationary $\ket N$ |
            |---|---|---|
            | $\langle H\rangle$ | $\hbar\omega(N + \tfrac12)$ | $\hbar\omega(N + \tfrac12)$ |
            | energy outcomes | Poisson over all $n$, $\sigma_H = \hbar\omega\sqrt N$ | only $E_N$, $\sigma_H = 0$ |
            | $\langle x\rangle(t)$ | $\sqrt{2\hbar/m\omega}\,\sqrt N\cos(\omega t - \phi)$ | $0$ |
            | $\sigma_x$ | $\sqrt{\hbar/2m\omega}$, constant | $\sqrt{(N + \tfrac12)\hbar/m\omega}$, constant |
            | classical picture | a ball swinging with amplitude $\sqrt{2N+1}\,w_x$ | the whole orbit smeared out, all phases at once |

            The price of motion is energy spread: to move, a state needs many neighboring $n$ with locked phases (Topic 15), and then its energy is uncertain. $\ket N$ has sharp energy and pays with no motion at all (energy–time relation, Topic 12).

            **The ground state is coherent** with $\alpha = 0$: $\hat a_-\ket0 = 0\cdot\ket0$.
          `, { ps: { svg: cohPhase, cap: md`Coherent state $\alpha = 2$: the center circles clockwise (radius 4 in scaled units) with a fuzz of radius 1 that never changes.` } }),
          RF(md`
            ### Worked example

            !!graded Problem
              An oscillator is in the coherent state with $\alpha = 2$ (real) at $t = 0$. (a) Find $\langle x\rangle(0)$ and $\sigma_x$ in units of $w_x = \sqrt{\hbar/m\omega}$. (b) An energy measurement is made. Probability of $\tfrac92\hbar\omega$? Find $\langle H\rangle$ and $\sigma_H$. (c) Find $\langle x\rangle(t)$ and $\langle p\rangle(t)$.

            **(a)** $\langle x\rangle = \sqrt{2}\,w_x\cdot2 = 2\sqrt2\,w_x = 2.83\,w_x$; $\sigma_x = w_x/\sqrt2 = 0.71\,w_x$. Amplitude-to-width ratio $2|\alpha| = 4$.

            **(b)** $\tfrac92\hbar\omega$ is $n = 4$: $P(4) = e^{-4}\tfrac{4^4}{4!} = 0.195$. $\langle H\rangle = (4 + \tfrac12)\hbar\omega$, $\sigma_H = 2\hbar\omega$.

            [[fig:po]]

            **(c)** $\alpha(t) = 2e^{-i\omega t}$: $\langle x\rangle = 2\sqrt2\,w_x\cos\omega t$, $\langle p\rangle = \sqrt{2\hbar m\omega}\cdot(-2\sin\omega t) = -2\sqrt2\,\tfrac{\hbar}{w_x}\sin\omega t$. Released from rest at the right turning point.

            !!mistake Common mistakes
              - Assuming $\alpha$ is real. $\text{Im}\,\alpha$ is the momentum.
              - $\langle\hat a_-\hat a_+\rangle = |\alpha|^2$: wrong order; it is $|\alpha|^2 + 1$. Only normal order ($\hat a_+$ left of $\hat a_-$) gives $|\alpha|^2$.
              - Calling a coherent state stationary because its shape does not change. Its position does, and it has a spread of energies.
              - Thinking $\ket\alpha$ is an eigenstate of $\hat x$. It has $\sigma_x = \sqrt{\hbar/2m\omega} \ne 0$.
              - $\alpha(t) = \alpha e^{+i\omega t}$: sign. Each $\ket n$ goes as $e^{-iE_nt/\hbar}$.

            ### Questions
          `, { po: { svg: poissonFig, cap: md`$P(n)$ for $|\alpha|^2 = 4$: Poisson, mean 4, spread 2.` } }),
          L(1, 'recognize'),
          Q(md`A coherent state is defined by…`, [md`$\hat a_-\ket\alpha = \alpha\ket\alpha$`, md`$\hat a_+\ket\alpha = \alpha\ket\alpha$`, md`$\hat x\ket\alpha = \alpha\ket\alpha$`, md`$\hat N\ket\alpha = \alpha\ket\alpha$`], 0,
            [null, md`$\hat a_+$ has no normalizable eigenstates.`, 'Position eigenstates are not normalizable.', 'Those are the stationary states.'],
            'Eigenstate of the lowering operator, any complex α.'),
          Q(md`Which statement about a coherent state is **false**?`, ['It is a stationary state', 'Its shape does not change in time', 'It minimizes σxσp', 'Its energy is uncertain'], 0,
            [null, 'True: a rigidly moving Gaussian.', 'True at all times.', md`True: $\sigma_H = \hbar\omega|\alpha|$.`],
            md`It is a superposition of all $\ket n$: it moves.`),
          L(2, 'set up'),
          P({
            title: 'Mean number and vacuum probability',
            q: md`Find $\langle n\rangle$ for $\alpha = 3$, and $P(n = 0)$ for $\alpha = 1$.`,
            parts: [{ lbl: '\\langle n\\rangle', ans: 9 }, { lbl: 'P(0)', ans: Math.exp(-1) }],
            sol: md`$|\alpha|^2 = 9$; $e^{-|\alpha|^2} = e^{-1} = 0.368$.`,
          }),
          Q(md`Under time evolution, $\alpha(t) = $?`, [md`$\alpha e^{-i\omega t}$`, md`$\alpha e^{+i\omega t}$`, md`$\alpha e^{-i\omega t/2}$`, md`$\alpha$`], 0,
            [null, 'Sign.', md`The $\tfrac12$ is the global phase, not in $\alpha$.`, 'It rotates.'],
            md`$\alpha^ne^{-in\omega t} = (\alpha e^{-i\omega t})^n$.`),
          L(3, 'standard'),
          P({
            title: 'Width of a coherent state',
            q: md`Enter $\sigma_x$ in units of $\sqrt{\hbar/m\omega}$ for $\alpha = 5 + 2i$.`,
            parts: [{ lbl: '\\sigma_x', ans: Math.SQRT1_2 }],
            sol: md`$\sqrt{\hbar/2m\omega}$ for every $\alpha$: $0.707$.`,
          }),
          P({
            title: 'Energy and its spread',
            q: md`$|\alpha|^2 = 2.25$. Find $\langle H\rangle$ and $\sigma_H$ in units of $\hbar\omega$.`,
            parts: [{ lbl: '\\langle H\\rangle', ans: 2.75 }, { lbl: '\\sigma_H', ans: 1.5 }],
            sol: md`$2.25 + 0.5$; $|\alpha| = 1.5$.`,
          }),
          Q(md`Is the ground state $\ket0$ a coherent state?`, [md`Yes, with $\alpha = 0$`, 'No: it is stationary', md`Yes, with $\alpha = 1$`, 'Only at t = 0'], 0,
            [null, md`Both: a stationary coherent state with $\alpha(t) = 0$.`, md`$\hat a_-\ket0 = 0 \ne \ket0$.`, 'Always.'],
            md`$\hat a_-\ket0 = 0 = 0\cdot\ket0$.`),
          L(4, 'one twist'),
          P({
            title: 'Complex α',
            q: md`$\alpha = 1 + i$. Find $\langle x\rangle$ in units of $\sqrt{\hbar/2m\omega}$ and $\langle p\rangle$ in units of $\sqrt{\hbar m\omega/2}$ at $t = 0$.`,
            parts: [{ lbl: '\\langle x\\rangle', ans: 2 }, { lbl: '\\langle p\\rangle', ans: 2 }],
            hints: [md`$\langle x\rangle \propto \alpha + \alpha^*$, $\langle p\rangle \propto i(\alpha^* - \alpha)$.`],
            sol: md`$\alpha + \alpha^* = 2$; $i(\alpha^* - \alpha) = i(-2i) = 2$.`,
          }),
          P({
            title: 'First maximum',
            q: md`$\alpha = i$ at $t = 0$. At what $\omega t$ does $\langle x\rangle$ first reach its maximum?`,
            parts: [{ lbl: '\\omega t', ans: Math.PI / 2 }],
            hints: [md`$\text{Re}(ie^{-i\omega t}) = \sin\omega t$.`],
            sol: md`$\langle x\rangle \propto \sin\omega t$: maximum at $\omega t = \pi/2$. It starts at the center moving right ($\langle p\rangle > 0$).`,
          }),
          Q(md`Why are eigenstates of $\hat x$ not good "classical" states?`, ['They are not normalizable and have infinite momentum spread', 'They are stationary', 'They do not exist mathematically', 'They are coherent states'], 0,
            [null, 'They are not stationary either.', 'They exist as distributions (delta functions).', 'No.'],
            md`$\sigma_x = 0$ forces $\sigma_p = \infty$; the next instant the particle is everywhere.`),
          L(5, 'exam level'),
          P({
            title: 'Poisson numbers',
            q: md`$\alpha = 2$. Find $P(n = 4)$ and $P(n = 1)$.`,
            parts: [{ lbl: 'P(4)', ans: 0.19537 }, { lbl: 'P(1)', ans: 0.07326 }],
            sol: md`$e^{-4}\tfrac{256}{24} = 0.195$; $e^{-4}\cdot4 = 0.073$.`,
          }),
          P({
            title: 'Relative energy spread',
            q: md`Find $\sigma_H/\langle H\rangle$ for $\alpha = 10$.`,
            parts: [{ lbl: '\\sigma_H/\\langle H\\rangle', ans: 10 / 100.5 }],
            sol: md`$\tfrac{10}{100.5} = 0.0995$: about 10%, and $\to 1/|\alpha|$ for large $|\alpha|$.`,
          }),
          Q(md`A coherent state with $|\alpha|^2 = N$ and the stationary state $\ket N$: which is true?`, [md`Same $\langle H\rangle$; the coherent state has $\sigma_H = \hbar\omega\sqrt N$ and moves, $\ket N$ has $\sigma_H = 0$ and does not`, 'Identical energy distributions', md`Same $\sigma_x$`, md`$\ket N$ moves with amplitude $\sqrt N$`], 0,
            [null, 'Poisson vs a single value.', md`$\sigma_x$ of $\ket N$ grows with $N$.`, 'Stationary.'],
            'HW 6.3g: motion costs energy spread.'),
          P({
            title: 'A sudden displacement',
            q: md`An oscillator in $\ket0$ has its trap center suddenly moved by $d = 2w_x$. In the new trap the state is coherent with $|\alpha|^2 = d^2/2w_x^2$. Find $P(\text{new ground state})$ and $\langle H\rangle$ in units of $\hbar\omega$ (new trap).`,
            parts: [{ lbl: 'P_0', ans: Math.exp(-2) }, { lbl: '\\langle H\\rangle', ans: 2.5 }],
            hints: [md`$|\alpha|^2 = 2$.`],
            sol: md`$e^{-2} = 0.135$; $\langle H\rangle = (2 + \tfrac12)\hbar\omega$. Check classically: the extra potential energy is $\tfrac12m\omega^2d^2 = 2\hbar\omega$ ✓.`,
          }),
          L(6, 'harder than the exam'),
          P({
            title: 'Overlap of two coherent states',
            q: md`$|\braket{\alpha|\beta}|^2 = e^{-|\alpha - \beta|^2}$. Find it for $\alpha = 1$, $\beta = -1$ (a cat-state pair).`,
            parts: [{ lbl: '|\\langle\\alpha|\\beta\\rangle|^2', ans: Math.exp(-4) }],
            sol: md`$e^{-4} = 0.018$. Coherent states are never exactly orthogonal (they are overcomplete), but far-apart ones nearly are.`,
          }),
          Q(md`Why does $\hat a_+$ have no normalizable eigenstates?`, ['It raises the lowest component of any state, which cannot then match λ times itself unless λ = 0, and â+ψ = 0 is impossible', 'Because â+ is not Hermitian', 'Because its eigenvalues would be real', 'It does: they are the coherent states'], 0,
            [null, md`$\hat a_-$ is not Hermitian either, yet has eigenstates.`, 'Irrelevant.', md`Those belong to $\hat a_-$.`],
            md`If $c_k$ is the lowest nonzero coefficient, the $\ket k$ component of $\hat a_+\ket\psi$ is 0, so $\lambda c_k = 0$. And $\|\hat a_+\psi\|^2 = \langle N\rangle + 1 \ge 1$.`),
          Q(md`Is $\{\ket\alpha\}$ for all complex $\alpha$ an orthonormal basis?`, ['No: overcomplete and non-orthogonal', 'Yes', 'Only for real α', 'Only for |α| integer'], 0,
            [null, md`$\braket{\alpha|\beta} \ne 0$ for $\alpha \ne \beta$.`, 'Still overlapping.', 'Nonsense.'],
            md`$|\braket{\alpha|\beta}|^2 = e^{-|\alpha - \beta|^2}$.`),
          R(md`
            ### Exam-style problem
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 486 · Exam-style problem · Topic 16</span><span>20 pts</span></div>',
            head: md`**A quasi-classical oscillator** [20 points, 5 per part]

            The oscillator has $\hat x = \sqrt{\tfrac{\hbar}{2m\omega}}(\hat a_+ + \hat a_-)$, $\hat p = i\sqrt{\tfrac{\hbar m\omega}{2}}(\hat a_+ - \hat a_-)$, $[\hat a_-, \hat a_+] = 1$, $\hat a_+\ket n = \sqrt{n+1}\ket{n+1}$, $\hat a_-\ket n = \sqrt n\ket{n-1}$. A coherent state satisfies $\hat a_-\ket\alpha = \alpha\ket\alpha$, $\alpha \in \mathbb C$.`,
            items: [
              {
                q: md`**(a)** Show that $\langle x\rangle = \sqrt{2\hbar/m\omega}\,\text{Re}\,\alpha$ and $\sigma_x = \sqrt{\hbar/2m\omega}$. Explain why $\sigma_x$ does not depend on $\alpha$.`,
                ans: md`$\langle x\rangle$ from $\alpha + \alpha^*$; $\langle x^2\rangle = \langle x\rangle^2 + \tfrac{\hbar}{2m\omega}$; $\ket\alpha$ is the ground state displaced in phase space.`,
                sol: md`
                  **How to see it.** $\hat a_-$ is sharp in $\ket\alpha$; the only spread comes from the commutator $[\hat a_-, \hat a_+] = 1$, which is the same for every $\alpha$.

                  $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}(\alpha^* + \alpha)$ using $\bra\alpha\hat a_+ = \alpha^*\bra\alpha$. $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}\langle\hat a_+^2 + \hat a_-^2 + \hat a_+\hat a_- + \hat a_-\hat a_+\rangle = \tfrac{\hbar}{2m\omega}(\alpha^{*2} + \alpha^2 + 2|\alpha|^2 + 1) = \tfrac{\hbar}{2m\omega}\left[(\alpha + \alpha^*)^2 + 1\right]$. Subtract $\langle x\rangle^2$. Interpretation: $\ket\alpha$ is $\ket0$ displaced to $(\langle x\rangle, \langle p\rangle)$; displacing does not change the shape.

                  **Rubric** 5: both results with the ordering of $\hat a_-\hat a_+$ handled, plus the displacement interpretation. · 4: results right, interpretation missing. · 3: $\langle x\rangle$ right, $\langle x^2\rangle$ missing the $+1$. · 2: treats $\alpha$ as real without justification and errs. · 1: definitions only.
                `,
              },
              {
                q: md`**(b)** Show $c_n = \braket{n|\alpha} = \tfrac{\alpha^n}{\sqrt{n!}}c_0$ and find $c_0$. For $\alpha = 2$, what is the probability that an energy measurement gives $\tfrac92\hbar\omega$? What are $\langle H\rangle$ and $\sigma_H$?`,
                ans: md`$c_0 = e^{-|\alpha|^2/2}$; $P(4) = e^{-4}\tfrac{4^4}{4!} = 0.195$; $\langle H\rangle = 4.5\hbar\omega$, $\sigma_H = 2\hbar\omega$.`,
                sol: md`
                  $\bra n\hat a_-\ket\alpha = \alpha c_n$ and $\bra n\hat a_- = \sqrt{n+1}\bra{n+1}$, so $c_{n+1} = \tfrac{\alpha}{\sqrt{n+1}}c_n$, iterate. Normalize: $|c_0|^2\sum\tfrac{|\alpha|^{2n}}{n!} = |c_0|^2e^{|\alpha|^2} = 1$. Poisson with mean $|\alpha|^2 = 4$, variance 4.

                  **Rubric** 5: recursion, $c_0$, correct $n = 4$ identification and number, $\langle H\rangle$, $\sigma_H$. · 4: one of the four wrong. · 3: recursion right, $n$ misidentified (e.g. $n = 9/2$ or 5). · 2: wrong recursion. · 1: little progress.
                `,
              },
              {
                q: md`**(c)** Show that under time evolution $\ket\alpha$ stays coherent with $\alpha(t) = \alpha e^{-i\omega t}$. Sketch the motion in phase space for $\alpha = 2$: the orbit of $(\langle x\rangle, \langle p\rangle)$ and the uncertainty region at a few times. Why is this called quasi-classical?`,
                ans: md`$\ket{\alpha(t)} = e^{-i\omega t/2}\ket{\alpha e^{-i\omega t}}$; clockwise circle (scaled) with a fixed fuzz disk; amplitude/width $= 2|\alpha|$ grows with $|\alpha|$.`,
                figs: { c: { svg: cohPhase, cap: 'The expected sketch (scaled units: orbit radius 2|α| = 4, fuzz radius 1).' } },
                sol: md`
                  $c_n(t) = c_ne^{-i(n + 1/2)\omega t} = e^{-i\omega t/2}e^{-|\alpha|^2/2}\tfrac{(\alpha e^{-i\omega t})^n}{\sqrt{n!}}$: the coherent state with $\alpha e^{-i\omega t}$, times a global phase.

                  [[fig:c]]

                  Quasi-classical: the center follows the classical orbit exactly, the uncertainty region never grows, and for $|\alpha| \gg 1$ it is a small dot compared with the orbit.

                  **Rubric** 5: derivation, clockwise orbit with constant-size uncertainty disks, the size argument. · 4: sketch missing the uncertainty regions or direction. · 3: $\alpha(t)$ asserted, sketch right. · 2: wrong sign of the phase or a growing blob. · 1: little progress.
                `,
              },
              {
                q: md`**(d)** True or false? Justify. "A coherent state with $|\alpha|^2 = N$ and the stationary state $\ket N$ give the same results for every energy measurement, because they have the same $\langle H\rangle$."`,
                ans: md`False.`,
                sol: md`
                  **False.** Same mean, different distributions: $\ket N$ gives $E_N$ with certainty ($\sigma_H = 0$), the coherent state gives a Poisson spread of outcomes with $\sigma_H = \hbar\omega\sqrt N$. That spread is exactly what lets the coherent state move; $\ket N$ never moves.

                  **Rubric** 5: False; Poisson vs sharp; link to motion is a bonus. · 4: good reasoning, imprecise. · 3: fair attempt. · 2: some relevant thought. · 1: correct verdict only.
                `,
              },
            ],
          },
          R(md`
            ### Endless practice

            Fresh $\alpha$ every time: Poisson probabilities, means, spreads, amplitudes.

            Where this shows up: [Homework 6](#/l/hw6) Problem 3 (all parts), the HW 6 notebook's coherent-state exercise, and Topic 12 (minimum uncertainty).
          `),
          G('m2_coherent', { need: 3 }),
        ],
        bank: [
          Q(md`For a coherent state, $\langle\hat a_+\hat a_-\rangle = $?`, [md`$|\alpha|^2$`, md`$|\alpha|^2 + 1$`, md`$\alpha^2$`, '0'], 0,
            [null, 'That is the other order.', 'Needs the modulus.', 'Only for α = 0.'], md`$\bra\alpha\hat a_+\hat a_-\ket\alpha = \alpha^*\alpha$.`),
          Q(md`The photon-number distribution of laser light (a coherent state) is…`, ['Poisson', 'a single value', 'uniform', 'Gaussian with zero width'], 0,
            [null, 'That would be a number state.', 'No.', 'No.'], md`$P(n) = e^{-|\alpha|^2}|\alpha|^{2n}/n!$.`),
          Q(md`What does $\text{Im}\,\alpha$ represent physically?`, ['The average momentum (scaled)', 'The energy', 'The width', 'Nothing'], 0,
            [null, md`Energy is $|\alpha|^2$.`, 'Width is fixed.', md`$\langle p\rangle = \sqrt{2\hbar m\omega}\,\text{Im}\,\alpha$.`], 'Re α ↔ x, Im α ↔ p.'),
          Q(md`A coherent state's $\sigma_x$ over time…`, ['stays constant', 'grows linearly', 'oscillates at 2ω', 'oscillates at ω'], 0,
            [null, 'That is a free packet.', 'That is a squeezed or breathing state.', 'No.'], 'Displaced ground state at every instant.'),
          Q(md`Doubling $|\alpha|$ multiplies the oscillation amplitude by…`, ['2', '4', '√2', '1'], 0,
            [null, 'Energy goes as |α|², amplitude as |α|.', 'Amplitude ∝ |α|.', 'No.'], md`$\langle x\rangle_{\max} = \sqrt{2\hbar/m\omega}\,|\alpha|$.`),
          Q(md`In a coherent state, $c_{n+1}/c_n = $?`, [md`$\alpha/\sqrt{n+1}$`, md`$\alpha$`, md`$\sqrt{n+1}/\alpha$`, md`$\alpha^*/\sqrt n$`], 0,
            [null, 'Missing the root.', 'Inverted.', 'Wrong.'], md`From $\sqrt{n+1}c_{n+1} = \alpha c_n$.`),
        ],
      },
    ],
  });
})();

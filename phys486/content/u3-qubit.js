/* Unit 3b — the two-level system (Lectures 8–9, HW 4 #5, Discussion 4). Topic 10. Appends to Unit 3. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);
  const u3 = COURSE.units.find((u) => u.id === 'u3');

  // Bloch sphere cross-section (x–z plane): state at polar angle theta, measurement axis m
  function bloch() {
    const f = PF.fig({ alt: 'Bloch sphere cross-section' });
    const cx = 150, cy = 120, r = 90, th = 1.0;
    f.circle(cx, cy, r, { cls: 'dim' });
    f.line(cx, cy + r + 14, cx, cy - r - 14, { cls: 'dim', arrow: 'end', hs: 5 }); f.label(cx + 6, cy - r - 16, 'z', 'l', 'small');
    f.line(cx - r - 14, cy, cx + r + 14, cy, { cls: 'dim', arrow: 'end', hs: 5 }); f.label(cx + r + 18, cy, 'x', 'l', 'small');
    f.dot(cx, cy - r, 3); f.label(cx - 6, cy - r - 8, '\\lvert 0\\rangle', 'r', 'small');
    f.dot(cx, cy + r, 3); f.label(cx - 6, cy + r + 10, '\\lvert 1\\rangle', 'r', 'small');
    f.dot(cx + r, cy, 3); f.label(cx + r + 4, cy + 12, '\\lvert +\\rangle', 'l', 'small');
    const px = cx + r * Math.sin(th), py = cy - r * Math.cos(th);
    f.line(cx, cy, px, py, { arrow: 'end', hs: 6 }); f.label(px + 6, py - 4, '\\hat n', 'l', 'small');
    f.label(cx + 14, cy - 34, '\\theta', 'l', 'small');
    return f.svg();
  }

  u3.lessons.push({
    id: 't10-qubit', topic: 10, title: 'The two-level system (qubit)',
    steps: [
      R(md`
        ### The idea

        The simplest quantum system has a two-dimensional Hilbert space: basis $\ket0, \ket1$ (spin up/down, horizontal/vertical polarization, ground/excited atom, two charge states of a superconducting circuit). It has no classical analog, and every idea of the course fits in it with $2\times2$ matrices: superposition, measurement, incompatible observables, unitary evolution.

        ### Every state is a point on a sphere

        Normalization uses up one real number and the global phase another, leaving two angles:
        $$\ket\psi = \cos\tfrac\theta2\ket0 + e^{i\varphi}\sin\tfrac\theta2\ket1 \quad\longleftrightarrow\quad \hat n = (\sin\theta\cos\varphi,\ \sin\theta\sin\varphi,\ \cos\theta)$$
        The **Bloch sphere**: $\ket0$ at the north pole, $\ket1$ at the south, equal superpositions on the equator, with the relative phase $\varphi$ as longitude. Note the half-angles: **orthogonal states are antipodal**, not at 90°.
      `),
      RF(md`
        ### The Pauli matrices

        $$\sigma_x = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}, \quad \sigma_y = \begin{pmatrix}0 & -i\\ i & 0\end{pmatrix}, \quad \sigma_z = \begin{pmatrix}1 & 0\\ 0 & -1\end{pmatrix}$$

        [[fig:bloch]]

        - Hermitian **and** unitary, traceless, eigenvalues $\pm1$, $\sigma_j^2 = \hat 1$.
        - $[\sigma_j, \sigma_k] = 2i\epsilon_{jkl}\sigma_l$ (so $[\sigma_x, \sigma_y] = 2i\sigma_z$, cyclic); different ones anticommute.
        - Any Hermitian $2\times2$ matrix is $a_0\hat 1 + \vec a\cdot\vec\sigma$ with real $a_0, \vec a$; eigenvalues $a_0 \pm |\vec a|$.
        - $\hat n\cdot\vec\sigma$ (spin along $\hat n$) has eigenvalues $\pm1$, and its $+1$ eigenstate is the Bloch point $\hat n$.
        - The Bloch vector is the vector of averages: $\langle\vec\sigma\rangle = \hat n$.
        - $e^{i\alpha\,\hat n\cdot\vec\sigma} = \cos\alpha\,\hat 1 + i\sin\alpha\,\hat n\cdot\vec\sigma$ (HW 4), because $(\hat n\cdot\vec\sigma)^2 = \hat 1$.

        ### Measurement is geometry

        Measuring spin along $\hat m$ on the state $\hat n$: outcome $+1$ with
        $$P(+) = \tfrac12(1 + \hat n\cdot\hat m) = \cos^2\tfrac\gamma2$$
        where $\gamma$ is the angle between them. Same axis: certain. Opposite: impossible. Perpendicular: 50/50. Then the state jumps to $\pm\hat m$.

        ### Time evolution is rotation

        With $\hat H = \tfrac{\hbar\omega}{2}\sigma_z$, $\ket\psi(t) \propto \cos\tfrac\theta2\ket0 + e^{i(\varphi + \omega t)}\sin\tfrac\theta2\ket1$: the Bloch vector **precesses about $z$** at angular frequency $\omega$ (Larmor precession). In general $\hat H = \tfrac{\hbar}{2}\vec\Omega\cdot\vec\sigma$ rotates the Bloch vector about $\vec\Omega$ at rate $|\vec\Omega|$. Start at $\ket0$ with $\hat H = \tfrac{\hbar\Omega}{2}\sigma_x$ and it rotates through the south pole: $P_1(t) = \sin^2(\Omega t/2)$ (Rabi oscillation).
      `, { bloch: { svg: bloch(), cap: 'Bloch sphere, x–z cut. The state ↔ the unit vector n̂; its polar angle θ is twice the angle in the amplitudes.' } }),
      R(md`
        ### Worked example

        !!graded Problem
          A qubit starts in $\ket{+} = \tfrac{1}{\sqrt2}(\ket0 + \ket1)$ with $\hat H = \tfrac{\hbar\omega}{2}\sigma_z$. Find $\ket\psi(t)$, $\langle\sigma_x\rangle(t)$, $\langle\sigma_z\rangle(t)$, and the probability that a $\sigma_x$ measurement at time $t$ gives $+1$.

        **Evolve.** $\ket0$ and $\ket1$ are the energy eigenstates, $E = \pm\hbar\omega/2$:
        $$\ket\psi(t) = \tfrac{1}{\sqrt2}\left(e^{-i\omega t/2}\ket0 + e^{i\omega t/2}\ket1\right) \simeq \tfrac{1}{\sqrt2}\left(\ket0 + e^{i\omega t}\ket1\right)$$
        (dropping a global phase). So $\theta = \pi/2$, $\varphi = \omega t$: the Bloch vector goes around the equator.

        **Read off.** $\langle\vec\sigma\rangle = (\cos\omega t, \sin\omega t, 0)$, so $\langle\sigma_x\rangle = \cos\omega t$, $\langle\sigma_z\rangle = 0$ always (energy is conserved, and $\sigma_z \propto \hat H$).

        **Measure.** $P(+x) = \tfrac12(1 + \cos\omega t) = \cos^2(\omega t/2)$. After half a period ($t = \pi/\omega$) the state is $\ket-$ and $P = 0$.

        !!mistake Common mistakes
          - Putting orthogonal states at 90° on the sphere. $\ket0$ and $\ket1$ are poles apart.
          - Using $\cos^2\gamma$ instead of $\cos^2(\gamma/2)$ for the probability.
          - Forgetting the global phase is free: $e^{-i\omega t/2}$ on both terms means nothing.
          - Multiplying Pauli matrices as numbers: $\sigma_x\sigma_y = i\sigma_z = -\sigma_y\sigma_x$.

        ### Questions
      `),
      L(1, 'recognize'),
      Q(md`The eigenvalues of $\sigma_y$ are…`, ['±1', '±i', '0 and 1', '±ħ'], 0,
        [null, 'Hermitian: real eigenvalues.', 'That is a projector.', 'Spin operators S = ħσ/2 have ±ħ/2; σ itself ±1.'],
        md`tr 0, det $-1$.`),
      Q(md`Where on the Bloch sphere is $\ket1$?`, ['south pole', 'north pole', 'on the equator at x', 'at the center'], 0,
        [null, md`That is $\ket0$.`, md`That is $\ket+$.`, 'Pure states are on the surface.'],
        md`$\theta = \pi$: $\cos\tfrac\pi2\ket0 + \sin\tfrac\pi2\ket1 = \ket1$.`),
      L(2, 'set up'),
      Q(md`$\tfrac1{\sqrt2}(\ket0 + i\ket1)$ is the $+1$ eigenstate of…`, [md`$\sigma_y$`, md`$\sigma_x$`, md`$\sigma_z$`, md`$-\sigma_y$`], 0,
        [null, md`That needs $\varphi = 0$.`, 'It is an equal superposition, not a pole.', 'Sign: φ = +π/2 is +y.'],
        md`$\theta = \pi/2$, $\varphi = \pi/2$: the $+y$ point. Check: $\sigma_y(1, i) = (-i\cdot i, i) = (1, i)$ ✓.`),
      P({
        title: 'Tilted state',
        q: md`A qubit is in $\cos\tfrac\theta2\ket0 + \sin\tfrac\theta2\ket1$ with $\theta = 60°$. What is $P(\sigma_z = +1)$ and $\langle\sigma_z\rangle$?`,
        parts: [{ lbl: 'P(+1)', ans: 0.75 }, { lbl: '\\langle\\sigma_z\\rangle', ans: 0.5 }],
        hints: [md`$\cos^2 30°$.`],
        sol: md`$P = \cos^2 30° = \tfrac34$; $\langle\sigma_z\rangle = \tfrac34 - \tfrac14 = \tfrac12 = \cos 60°$, the $z$-component of $\hat n$.`,
      }),
      L(3, 'standard'),
      P({
        title: 'Energies of a 2×2 Hamiltonian',
        q: md`$\hat H = a\,\sigma_x + b\,\sigma_z$ with real $a, b$. Find the larger eigenvalue.`,
        parts: [{ lbl: 'E_+', expr: 'sqrt(a^2 + b^2)', vars: { a: [0.5, 2], b: [0.5, 2] } }],
        hints: [md`$\hat H = |\vec a|\,\hat n\cdot\vec\sigma$ with $\vec a = (a, 0, b)$.`],
        sol: md`Eigenvalues $\pm\sqrt{a^2 + b^2}$. Directly: tr 0, $\det = -b^2 - a^2$.`,
      }),
      Q(md`You measure $\sigma_x$ on $\ket0$, get $+1$, then measure $\sigma_z$. $P(\sigma_z = +1) = $?`, ['1/2', '1', '0', '1/4'], 0,
        [null, md`The $\sigma_x$ measurement moved the state to $\ket+$.`, md`$\ket+$ has equal weight on $\ket0$, $\ket1$.`, 'Not a product of two halves: the first result is given.'],
        'After the first measurement the state is |+⟩, on the equator: 50/50 for z.'),
      Q(md`$\sigma_x\sigma_y = $?`, [md`$i\sigma_z$`, md`$\sigma_z$`, md`$-i\sigma_z$`, md`$\hat 1$`], 0,
        [null, 'Missing i: multiply the matrices.', md`That is $\sigma_y\sigma_x$.`, 'Different Paulis do not square to 1.'],
        md`$\begin{pmatrix}0&1\\1&0\end{pmatrix}\begin{pmatrix}0&-i\\i&0\end{pmatrix} = \begin{pmatrix}i&0\\0&-i\end{pmatrix} = i\sigma_z$.`),
      L(4, 'one twist'),
      P({
        title: 'Measurement at an angle',
        q: md`A qubit points along $\hat n$. You measure spin along $\hat m$, at 120° from $\hat n$. $P(+1) = $?`,
        parts: [{ lbl: 'P(+1)', ans: 0.25 }],
        hints: [md`$P = \tfrac12(1 + \cos\gamma)$.`],
        sol: md`$\tfrac12(1 - \tfrac12) = \tfrac14 = \cos^2 60°$.`,
      }),
      P({
        title: 'Rabi flip',
        q: md`Start in $\ket0$ with $\hat H = \tfrac{\hbar\Omega}{2}\sigma_x$. When is the qubit first certainly in $\ket1$?`,
        parts: [{ lbl: 't', expr: 'pi/Omega', vars: { Omega: [0.5, 3] } }],
        hints: [md`The Bloch vector rotates about $x$ at rate $\Omega$; it needs to turn by $\pi$.`],
        sol: md`$e^{-i\Omega t\sigma_x/2}\ket0 = \cos\tfrac{\Omega t}{2}\ket0 - i\sin\tfrac{\Omega t}{2}\ket1$, so $P_1 = \sin^2\tfrac{\Omega t}{2} = 1$ at $t = \pi/\Omega$ (a "π pulse").`,
      }),
      L(5, 'exam level'),
      P({
        title: 'Precession',
        q: md`Start in $\ket+$ with $\hat H = \tfrac{\hbar\omega}{2}\sigma_z$. Find $\langle\sigma_x\rangle(t)$ and $\langle\sigma_y\rangle(t)$.`,
        parts: [{ lbl: '\\langle\\sigma_x\\rangle', expr: 'cos(omega*t)', vars: { omega: [0.5, 2], t: [0, 3] } }, { lbl: '\\langle\\sigma_y\\rangle', expr: 'sin(omega*t)', vars: { omega: [0.5, 2], t: [0.1, 3] } }],
        hints: [md`$\ket\psi(t) \simeq \tfrac1{\sqrt2}(\ket0 + e^{i\omega t}\ket1)$: $\varphi = \omega t$.`],
        sol: md`$\langle\vec\sigma\rangle = (\cos\varphi, \sin\varphi, 0)$ with $\varphi = \omega t$: counterclockwise around $z$.`,
      }),
      Q(md`$e^{i\pi\sigma_z/2}$ equals…`, [md`$i\sigma_z$`, md`$-\hat 1$`, md`$\hat 1$`, md`$\sigma_z$`], 0,
        [null, md`That is $e^{i\pi\sigma_z}$.`, 'No.', 'Missing the i.'],
        md`$\cos\tfrac\pi2\,\hat 1 + i\sin\tfrac\pi2\,\sigma_z = i\sigma_z$.`),
      Q(md`In the state $\ket0$, $\Delta\sigma_x\,\Delta\sigma_y$ vs. its bound $|\langle\sigma_z\rangle|$ (from $[\sigma_x, \sigma_y] = 2i\sigma_z$):`,
        ['1 ≥ 1: the bound is saturated', '0 ≥ 1: violated', '1 ≥ 0', '½ ≥ ½'], 0,
        [null, md`$\Delta\sigma_x = \sqrt{\langle\sigma_x^2\rangle - \langle\sigma_x\rangle^2} = \sqrt{1 - 0} = 1$.`, md`$\langle\sigma_z\rangle = 1$ in $\ket0$.`, 'Paulis have eigenvalues ±1, not ±½.'],
        md`$\sigma^2 = \hat 1$ means $\Delta\sigma_j = \sqrt{1 - \langle\sigma_j\rangle^2}$: here $1\cdot1 \ge 1$.`),
      L(6, 'harder than the exam'),
      Q(md`The $+1$ eigenvector of $\cos\theta\,\sigma_z + \sin\theta\,\sigma_x$ is…`,
        [md`$\cos\tfrac\theta2\ket0 + \sin\tfrac\theta2\ket1$`, md`$\cos\theta\ket0 + \sin\theta\ket1$`, md`$\tfrac1{\sqrt2}(\ket0 + e^{i\theta}\ket1)$`, md`$\sin\tfrac\theta2\ket0 - \cos\tfrac\theta2\ket1$`], 0,
        [null, 'Half-angles: θ on the sphere is θ/2 in the amplitudes.', 'That is on the equator.', 'That is the −1 eigenvector.'],
        md`It is $\hat n\cdot\vec\sigma$ with $\hat n$ at polar angle $\theta$ in the $x$–$z$ plane: the Bloch state $\theta$, $\varphi = 0$.`),
      Q(md`$(\vec a\cdot\vec\sigma)(\vec b\cdot\vec\sigma) = $?`, [md`$(\vec a\cdot\vec b)\hat 1 + i(\vec a\times\vec b)\cdot\vec\sigma$`, md`$(\vec a\cdot\vec b)\hat 1$`, md`$(\vec a\times\vec b)\cdot\vec\sigma$`, md`$\vec a\cdot\vec b + \vec a\times\vec b$`], 0,
        [null, 'Only if a ∥ b.', 'Missing the scalar part and the i.', 'Mixing a number and a vector.'],
        md`$\sigma_j\sigma_k = \delta_{jk}\hat 1 + i\epsilon_{jkl}\sigma_l$. With $\vec a = \vec b = \hat n$ it gives $(\hat n\cdot\vec\sigma)^2 = \hat 1$.`),
      Q(md`A spin is rotated by $2\pi$ about any axis: $e^{-i\pi\,\hat n\cdot\vec\sigma}$. The state…`, ['picks up a factor −1: physically the same state', 'is unchanged, factor +1', 'is flipped to the antipode', 'is destroyed'], 0,
        [null, md`$\cos\pi = -1$.`, 'A full turn on the sphere returns the point.', 'Unitary evolution preserves the norm.'],
        md`$\cos\pi\,\hat 1 - i\sin\pi\,\hat n\cdot\vec\sigma = -\hat 1$: a global phase, invisible alone, but measurable by interfering with an unrotated copy (neutron interferometry).`),
    ],
    bank: [
      Q(md`Orthogonal qubit states sit on the Bloch sphere…`, ['at antipodal points', 'at 90°', 'at the same point', 'anywhere on a great circle'], 0,
        [null, 'Half-angle: 180° on the sphere.', 'Same point means the same state.', 'No.'], md`$P = \cos^2(\gamma/2) = 0$ needs $\gamma = \pi$.`),
      Q(md`Pauli matrices are…`, ['Hermitian and unitary', 'Hermitian only', 'unitary only', 'neither'], 0,
        [null, md`$\sigma^2 = \hat 1$ makes them unitary too.`, 'They are Hermitian too.', 'They are both.'], md`$\sigma^\dagger = \sigma$ and $\sigma^\dagger\sigma = \sigma^2 = \hat 1$.`),
      Q(md`How many real parameters specify a qubit's pure state physically?`, ['2', '4', '3', '1'], 0,
        [null, 'Two complex numbers minus normalization and global phase.', 'That is before removing the global phase.', 'Need both θ and φ.'], 'θ and φ.'),
      Q(md`$[\sigma_y, \sigma_z] = $?`, [md`$2i\sigma_x$`, md`$-2i\sigma_x$`, md`$2\sigma_x$`, '0'], 0,
        [null, 'yzx is cyclic: +.', 'Missing i.', 'They do not commute.'], md`$[\sigma_j, \sigma_k] = 2i\epsilon_{jkl}\sigma_l$.`),
      Q(md`The Hamiltonian $\tfrac{\hbar\omega}{2}\sigma_z$ makes the Bloch vector…`, ['precess about z at ω', 'precess about z at ω/2', 'move toward the north pole', 'flip between the poles'], 0,
        [null, 'Half-angles again: the amplitudes rotate at ω/2, the vector at ω.', 'Unitary evolution does not relax.', 'That needs a σx or σy term.'], md`Relative phase $e^{i\omega t}$.`),
    ],
  });
})();

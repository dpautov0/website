/* Unit 1 (Midterm 2) — how expectation values move (second half of Lecture 9, HW 5 Problems 1–2, Lecture 12's
   "conserved if it commutes with H"). Topic 11: the generalized Ehrenfest theorem, commutator algebra, conservation laws
   and the virial theorem. Topic 12: the energy–time relation and minimum-uncertainty states. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  // <Q>(t) = cos ωt with the band <Q> ± σ_Q (σ_Q = |sin ωt|): Δt is the time to move one band-width
  const band = PF.plot({
    w: 380, h: 220, x: [0, 2 * Math.PI], y: [-1.6, 1.6], zero: true, xl: '\\omega t', yl: '\\langle Q\\rangle',
    xt: [[Math.PI / 2, '\\tfrac\\pi2'], [Math.PI, '\\pi'], [3 * Math.PI / 2, '\\tfrac{3\\pi}2']], yt: [[1, '1'], [-1, '-1']],
    curves: [
      { f: (t) => Math.cos(t) + Math.abs(Math.sin(t)), cls: 'dim dash' },
      { f: (t) => Math.cos(t) - Math.abs(Math.sin(t)), cls: 'dim dash' },
      { f: (t) => Math.cos(t), lab: '\\langle Q\\rangle', labAt: 5.2 },
    ],
  });

  // the free Gaussian: as it spreads, fast parts run ahead (x and p become correlated)
  const spread = PF.plot({
    w: 380, h: 200, x: [-4, 9], y: [0, 1.1], xl: 'x', yl: '|\\Psi|^2',
    curves: [
      { f: (x) => Math.exp(-x * x / 0.5), lab: 't = 0', labAt: 0.6 },
      { f: (x) => 0.45 * Math.exp(-((x - 4) * (x - 4)) / 2.4), cls: 'dim', lab: 't > 0', labAt: 6.3 },
    ],
  });

  C.unit({
    id: 'u7', exam: 'm2', num: 'Unit 1', title: 'Time evolution of expectation values',
    blurb: 'The generalized Ehrenfest theorem, commutator algebra, conservation laws, the virial theorem, the energy–time relation and minimum-uncertainty states (Lecture 9 second half, HW 5 Problems 1–2).',
    lessons: [
      // ------------------------------------------------------------------ Topic 11
      {
        id: 't11-ehrenfest', topic: 11, title: 'The generalized Ehrenfest theorem and conservation laws', ref: 'Lecture 9, HW 5.1',
        steps: [
          R(md`
            ### The picture

            A state evolves, so expectation values move. Which way they move is fixed by **one** object: the commutator of the observable with the Hamiltonian.
            $$\frac{d\langle Q\rangle}{dt} = \frac{i}{\hbar}\left\langle[\hat H, \hat Q]\right\rangle + \left\langle\frac{\partial\hat Q}{\partial t}\right\rangle$$
            Read it as a rule of thumb you can say out loud: **"$Q$ changes only as much as it fails to commute with $H$."** If $[\hat H, \hat Q] = 0$ (and $\hat Q$ has no explicit $t$), $\langle Q\rangle$ is frozen in every state: $Q$ is **conserved**. That is how the course will find every conservation law: energy, momentum of a free particle, parity in a symmetric well, angular momentum in a central potential (Unit 3).

            !!intuition Classical cousin
              In classical mechanics $\dot Q = \{Q, H\}$ (the Poisson bracket). Quantum mechanics replaces $\{Q, H\}$ by $\tfrac{i}{\hbar}[\hat H, \hat Q]$. Same structure, so averages often obey the classical equations, but **only on average**, and only exactly when the force is linear in $x$.

            ### Where it comes from (Lecture 9 board)

            Differentiate $\langle Q\rangle = \bra\Psi\hat Q\ket\Psi$ with the product rule and use $i\hbar\,\partial_t\ket\Psi = \hat H\ket\Psi$, i.e. $\partial_t\ket\Psi = \tfrac{1}{i\hbar}\hat H\ket\Psi$:
            $$\frac{d\langle Q\rangle}{dt} = \Big\langle\tfrac{1}{i\hbar}\hat H\Psi\Big|\hat Q\Psi\Big\rangle + \Big\langle\Psi\Big|\tfrac{\partial\hat Q}{\partial t}\Psi\Big\rangle + \Big\langle\Psi\Big|\hat Q\tfrac{1}{i\hbar}\hat H\Psi\Big\rangle$$
            The constant comes out of the bra **conjugated**: $\left(\tfrac{1}{i\hbar}\right)^* = -\tfrac{1}{i\hbar} = \tfrac{i}{\hbar}$. Then $\hat H$ is Hermitian, so $\braket{\hat H\Psi|\hat Q\Psi} = \bra\Psi\hat H\hat Q\ket\Psi$. The last term is $-\tfrac{i}{\hbar}\bra\Psi\hat Q\hat H\ket\Psi$. Together: $\tfrac{i}{\hbar}\langle\hat H\hat Q - \hat Q\hat H\rangle$. Only $\hat H$ needs to be Hermitian; $\hat Q$ can be anything (even $\hat x\hat p$, which is not Hermitian).

            ### The commutator toolkit (HW 5.1)

            $$[\hat A + \hat B, \hat C] = [\hat A, \hat C] + [\hat B, \hat C],\qquad [\hat A\hat B, \hat C] = \hat A[\hat B, \hat C] + [\hat A, \hat C]\hat B$$
            The second one is the product rule: "pull out the left factor on the left, the right factor on the right". Proof: write both sides out; the $\hat A\hat C\hat B$ terms cancel.

            $$[f(\hat x), \hat p] = i\hbar f'(\hat x)$$
            Proof with a test function $g$: $[f, \hat p]g = f(-i\hbar g') - (-i\hbar)(fg)' = -i\hbar fg' + i\hbar f'g + i\hbar fg' = i\hbar f'g$. Special cases: $[\hat x, \hat p] = i\hbar$, $[\hat x^n, \hat p] = i\hbar n\hat x^{n-1}$, $[V(\hat x), \hat p] = i\hbar V'(\hat x)$. By the same argument $[\hat x, g(\hat p)] = i\hbar g'(\hat p)$, so $[\hat x, \hat p^2] = 2i\hbar\hat p$.

            ### The four classics (HW 5.1c)

            With $\hat H = \hat p^2/2m + V(\hat x)$:

            | $\hat Q$ | $[\hat H, \hat Q]$ | Result | Physical statement |
            |---|---|---|---|
            | $1$ | $0$ | $\tfrac{d}{dt}\braket{\Psi|\Psi} = 0$ | probability is conserved |
            | $\hat H$ | $0$ | $\tfrac{d\langle H\rangle}{dt} = 0$ | energy is conserved |
            | $\hat x$ | $\tfrac{1}{2m}[\hat p^2, \hat x] = -\tfrac{i\hbar}{m}\hat p$ | $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$ | velocity is momentum over mass |
            | $\hat p$ | $[V, \hat p] = i\hbar V'$ | $\tfrac{d\langle p\rangle}{dt} = -\langle V'(x)\rangle$ | Newton's second law, on average |

            !!key The catch in Newton's law
              The force is $-\langle V'(x)\rangle$, not $-V'(\langle x\rangle)$. They are equal only when $V'$ is linear in $x$: $V$ constant, linear (uniform field) or **quadratic (the oscillator)**. For the oscillator $\tfrac{d\langle p\rangle}{dt} = -m\omega^2\langle x\rangle$ exactly, so $\langle x\rangle(t) = \langle x\rangle_0\cos\omega t + \tfrac{\langle p\rangle_0}{m\omega}\sin\omega t$ in **every** state. For any other potential the center of a wave packet does not follow a classical trajectory, because the packet samples the force over its width.

            ### Conservation, exactly

            If $[\hat H, \hat Q] = 0$ then also $[\hat H, f(\hat Q)] = 0$, so not just $\langle Q\rangle$ but the whole probability distribution of $Q$ outcomes is constant. Conserved does **not** mean sharp: a conserved $Q$ can have a big spread; the spread just never changes.

            - Free particle: $[\hat p^2/2m, \hat p] = 0$, momentum conserved. Add any $V(x)$ that is not constant and it is not.
            - Symmetric potential $V(-x) = V(x)$: the parity operator $\hat\Pi\psi(x) = \psi(-x)$ commutes with $\hat H$. A state that starts even stays even, so $\langle x\rangle = 0$ forever.
            - Lecture 12's qubit: $\hat H = -\hbar\omega(\ket0\bra0 - \ket1\bra1) = -\hbar\omega\sigma_z$. $[\hat H, \sigma_z] = 0$, so $\langle\sigma_z\rangle$ is conserved; $\sigma_x$ and $\sigma_y$ are not, and the Bloch vector precesses about $z$ at angular frequency $2\omega$ (the gap is $2\hbar\omega$).

            ### The virial theorem: one more choice of $\hat Q$

            Take $\hat Q = \hat x\hat p$. Using the product rule and the toolkit,
            $$[\hat H, \hat x\hat p] = [\hat H, \hat x]\hat p + \hat x[\hat H, \hat p] = -\frac{i\hbar}{m}\hat p^2 + i\hbar\,\hat x V'(\hat x)$$
            $$\frac{d\langle xp\rangle}{dt} = \frac{i}{\hbar}\langle[\hat H, \hat x\hat p]\rangle = \frac{\langle p^2\rangle}{m} - \langle xV'\rangle = 2\langle T\rangle - \langle xV'\rangle$$
            In a **stationary state** every expectation value is constant, so the left side is 0:
            $$2\langle T\rangle = \langle xV'(x)\rangle\qquad\text{(stationary states)}$$
            For a power law $V \propto |x|^n$, $xV' = nV$, so $2\langle T\rangle = n\langle V\rangle$ and $\langle T\rangle = \tfrac{n}{n+2}E$. Oscillator ($n = 2$): $\langle T\rangle = \langle V\rangle = E/2$. Coulomb (in 3D the same argument gives $2\langle T\rangle = \langle\vec r\cdot\nabla V\rangle$, $n = -1$): $\langle T\rangle = -E$, $\langle V\rangle = 2E$.
          `),
          R(md`
            ### Worked example

            !!graded Problem
              A particle moves in $V = \tfrac12m\omega^2x^2$, in an arbitrary state (not necessarily stationary). (a) Find $\tfrac{d\langle x\rangle}{dt}$ and $\tfrac{d\langle p\rangle}{dt}$ and solve for $\langle x\rangle(t)$. (b) Find $\tfrac{d\langle x^2\rangle}{dt}$. (c) Is $\langle x^2\rangle$ conserved in a stationary state? What does that tell you about $\langle xp + px\rangle$ there?

            **(a)** From the table: $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$ and $\tfrac{d\langle p\rangle}{dt} = -\langle m\omega^2x\rangle = -m\omega^2\langle x\rangle$. These two equations are **closed** (no $\langle x^2\rangle$ sneaks in) because the force is linear. Differentiating the first: $\tfrac{d^2\langle x\rangle}{dt^2} = -\omega^2\langle x\rangle$, so
            $$\langle x\rangle(t) = \langle x\rangle_0\cos\omega t + \frac{\langle p\rangle_0}{m\omega}\sin\omega t$$
            for every state. A stationary state just has $\langle x\rangle_0 = \langle p\rangle_0 = 0$.

            **(b)** $[\hat H, \hat x^2] = \tfrac{1}{2m}[\hat p^2, \hat x^2]$. With the product rule, $[\hat p^2, \hat x^2] = \hat p[\hat p, \hat x^2] + [\hat p, \hat x^2]\hat p = -2i\hbar(\hat p\hat x + \hat x\hat p)$. Times $\tfrac{i}{\hbar}\cdot\tfrac{1}{2m}$:
            $$\frac{d\langle x^2\rangle}{dt} = \frac{\langle xp + px\rangle}{m}$$
            Sanity check: classically $\tfrac{d}{dt}x^2 = 2x\dot x = 2xp/m$, and $\tfrac12(xp + px)$ is the symmetrized (Hermitian) version of $xp$.

            **(c)** In a stationary state nothing changes, so $\tfrac{d\langle x^2\rangle}{dt} = 0$ and therefore $\langle xp + px\rangle = 0$. The position–momentum correlation vanishes. (A "breathing" superposition like $\ket0 + \ket2$, Topic 15, has $\langle xp + px\rangle \ne 0$, and that is exactly what makes its width oscillate.)

            !!mistake Common mistakes
              - Forgetting to conjugate the constant when it comes out of the bra: you get the wrong sign of the whole theorem.
              - Writing $\tfrac{d\langle p\rangle}{dt} = -V'(\langle x\rangle)$. It is $-\langle V'\rangle$; equal only for at most quadratic $V$.
              - Thinking "conserved" means "sharp". A conserved quantity keeps its distribution; it can still be uncertain.
              - $[\hat x\hat p, \hat p] = \hat x[\hat p, \hat p] + [\hat x, \hat p]\hat p = i\hbar\hat p$: keep operator order in the product rule.
              - Using the virial theorem in a non-stationary state. It needs $\tfrac{d\langle xp\rangle}{dt} = 0$.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`$\langle Q\rangle$ is constant in time **for every state** when…`, [md`$[\hat H, \hat Q] = 0$ and $\hat Q$ has no explicit time dependence`, md`$\hat Q$ is Hermitian`, 'the state is normalized', md`$[\hat Q, \hat x] = 0$`], 0,
            [null, md`Hermitian only makes the outcomes real; $\hat x$ is Hermitian and $\langle x\rangle$ moves.`, 'Normalization is conserved, but that is about Q = 1.', md`Commuting with $\hat x$ is irrelevant; the Hamiltonian drives the motion.`],
            md`The generalized Ehrenfest theorem: $\tfrac{d\langle Q\rangle}{dt} = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle + \langle\partial_t\hat Q\rangle$. Both terms vanish.`),
          Q(md`Applied to $\hat Q = \hat H$ (time-independent $\hat H$), the theorem says…`, [md`$\langle H\rangle$ is constant: energy is conserved`, md`$\langle H\rangle$ oscillates at $\omega = E/\hbar$`, md`$\langle H\rangle = 0$`, 'nothing: it depends on the state'], 0,
            [null, md`Phases $e^{-iE_nt/\hbar}$ never change $|c_n|^2$, so $\langle H\rangle = \sum|c_n|^2E_n$ is frozen.`, md`It is $\tfrac{d\langle H\rangle}{dt}$ that is zero, not $\langle H\rangle$.`, md`$[\hat H, \hat H] = 0$ for every state.`],
            md`$[\hat H, \hat H] = 0$. In fact every $P(E_n)$ is constant.`),
          L(2, 'set up'),
          P({
            title: 'Commutator with an exponential',
            q: md`Using $[f(\hat x), \hat p] = i\hbar f'(\hat x)$, write $[e^{k\hat x}, \hat p] = i\hbar\,g(\hat x)$. Enter $g(x)$.`,
            parts: [{ lbl: 'g(x)', expr: 'k*exp(k*x)', vars: { k: [0.3, 2], x: [-1, 1] } }],
            hints: [md`Just differentiate $f$.`],
            sol: md`$f' = ke^{kx}$, so $[e^{k\hat x}, \hat p] = i\hbar ke^{k\hat x}$.`,
          }),
          Q(md`$[\hat x\hat p, \hat p] = $?`, [md`$i\hbar\hat p$`, md`$-i\hbar\hat p$`, '0', md`$i\hbar\hat x$`], 0,
            [null, md`Sign: $[\hat x, \hat p] = +i\hbar$.`, md`$\hat x$ does not commute with $\hat p$.`, md`The surviving factor is the one that was outside the commutator: $\hat p$.`],
            md`Product rule: $\hat x[\hat p, \hat p] + [\hat x, \hat p]\hat p = 0 + i\hbar\hat p$.`),
          P({
            title: 'Force from a quartic potential',
            q: md`For $V = \lambda x^4$, Ehrenfest gives $\tfrac{d\langle p\rangle}{dt} = -c\,\lambda\langle x^3\rangle$. Enter $c$.`,
            parts: [{ lbl: 'c', ans: 4 }],
            hints: [md`$\tfrac{d\langle p\rangle}{dt} = -\langle V'\rangle$.`],
            sol: md`$V' = 4\lambda x^3$. Note $\langle x^3\rangle \ne \langle x\rangle^3$: the center of the packet does not follow the classical force.`,
          }),
          L(3, 'standard'),
          Q(md`For $V = \tfrac12m\omega^2x^2$, which is true?`, [md`$\langle x\rangle(t)$ obeys $\ddot{\langle x\rangle} = -\omega^2\langle x\rangle$ exactly, in every state`, 'Only coherent states have ⟨x⟩ oscillating at ω', 'Only for large quantum numbers does ⟨x⟩ follow the classical motion', md`$\langle x\rangle$ is always zero`], 0,
            [null, md`Any state works; coherent states are special because their **shape** does not change (Topic 16).`, 'The linear force makes the average equations exact at every n.', md`Zero only if $\langle x\rangle_0 = \langle p\rangle_0 = 0$ (e.g. stationary states).`],
            md`The force $-m\omega^2x$ is linear, so $\langle V'\rangle = V'(\langle x\rangle)$ and the Ehrenfest equations close.`),
          P({
            title: 'Qubit precession',
            q: md`Lecture 12: $\hat H = -\hbar\omega\sigma_z$, and the qubit starts in $\ket{+x} = \tfrac{1}{\sqrt2}(\ket0 + \ket1)$. Ehrenfest gives $\tfrac{d\langle\sigma_x\rangle}{dt} = 2\omega\langle\sigma_y\rangle$ and $\tfrac{d\langle\sigma_y\rangle}{dt} = -2\omega\langle\sigma_x\rangle$. Find $\langle\sigma_x\rangle$, $\langle\sigma_y\rangle$ and $\langle\sigma_z\rangle$ at $t = \pi/(6\omega)$.`,
            parts: [{ lbl: '\\langle\\sigma_x\\rangle', ans: 0.5 }, { lbl: '\\langle\\sigma_y\\rangle', ans: -Math.sqrt(3) / 2 }, { lbl: '\\langle\\sigma_z\\rangle', ans: 0, tol: { abs: 0.01 } }],
            hints: [md`Solution with $\langle\sigma_x\rangle_0 = 1$, $\langle\sigma_y\rangle_0 = 0$: $\cos2\omega t$ and $-\sin2\omega t$.`, md`$[\hat H, \sigma_z] = 0$.`],
            sol: md`$\langle\sigma_x\rangle = \cos(\pi/3) = \tfrac12$, $\langle\sigma_y\rangle = -\sin(\pi/3) = -0.866$, $\langle\sigma_z\rangle = 0$ (conserved, and it starts at 0). Check with the state: $\ket{\Psi(t)} = \tfrac{1}{\sqrt2}(e^{i\omega t}\ket0 + e^{-i\omega t}\ket1)$, relative phase $e^{-2i\omega t}$: the Bloch vector turns about $z$ at $2\omega$, i.e. the gap $2\hbar\omega$ over $\hbar$.`,
          }),
          Q(md`A particle is free ($V = 0$). Which quantity is **not** conserved?`, [md`$\langle x\rangle$`, md`$\langle p\rangle$`, md`$\langle p^2\rangle$`, md`$\langle H\rangle$`], 0,
            [null, md`$[\hat p^2, \hat p] = 0$.`, md`A function of $\hat p$ commutes with $\hat p^2$.`, md`$[\hat H, \hat H] = 0$.`],
            md`$\tfrac{d\langle x\rangle}{dt} = \langle p\rangle/m$: the packet drifts. Every function of $\hat p$ is conserved.`),
          L(4, 'one twist'),
          P({
            title: 'Virial theorem for power laws',
            q: md`In a stationary state of $V = \lambda x^4$, find $\langle T\rangle/E$. Then do the same for $V = F|x|$.`,
            parts: [{ lbl: '\\langle T\\rangle/E\\ (x^4)', ans: 2 / 3 }, { lbl: '\\langle T\\rangle/E\\ (|x|)', ans: 1 / 3 }],
            hints: [md`$2\langle T\rangle = \langle xV'\rangle = n\langle V\rangle$ for $V \propto |x|^n$, and $E = \langle T\rangle + \langle V\rangle$.`],
            sol: md`$\langle V\rangle = \tfrac2n\langle T\rangle$, so $E = \langle T\rangle\left(1 + \tfrac2n\right)$ and $\langle T\rangle = \tfrac{n}{n+2}E$: $\tfrac46 = \tfrac23$ for $n = 4$, $\tfrac13$ for $n = 1$. Steeper walls put more of the energy into motion.`,
          }),
          Q(md`For a free particle, $\langle x^2\rangle(t)$ is…`, ['a quadratic polynomial in t', 'linear in t', 'constant', 'oscillating'], 0,
            [null, md`Its second derivative is a nonzero constant.`, md`$\tfrac{d\langle x^2\rangle}{dt} = \langle xp + px\rangle/m$ itself grows.`, 'Free packets spread.'],
            md`$\tfrac{d\langle x^2\rangle}{dt} = \tfrac{\langle xp + px\rangle}{m}$ and $\tfrac{d}{dt}\langle xp + px\rangle = \tfrac{2\langle p^2\rangle}{m}$, a constant. So $\langle x^2\rangle = a + bt + \tfrac{\langle p^2\rangle}{m^2}t^2$: the width of a free Gaussian grows linearly at late times.`),
          Q(md`When is $\langle V'(x)\rangle = V'(\langle x\rangle)$ guaranteed?`, ['When V is at most quadratic in x', 'Always', 'Never', 'Only in stationary states'], 0,
            [null, md`Try $V = x^4$: $\langle x^3\rangle \ne \langle x\rangle^3$ in general.`, 'Linear V′ makes them equal.', md`In a stationary state of $x^4$ both sides are 0 for symmetric states, but that is luck, not a rule.`],
            md`$V'$ linear in $x$ commutes with averaging. That is why the oscillator is the "most classical" system.`),
          L(5, 'exam level'),
          P({
            title: 'Any state of the oscillator',
            q: md`An oscillator state has $\langle x\rangle_0 = x_0$ and $\langle p\rangle_0 = 0$ at $t = 0$. Find $\langle x\rangle$ in units of $x_0$ and $\langle p\rangle$ in units of $m\omega x_0$ at $t = \pi/(3\omega)$.`,
            parts: [{ lbl: '\\langle x\\rangle/x_0', ans: 0.5 }, { lbl: '\\langle p\\rangle/(m\\omega x_0)', ans: -Math.sqrt(3) / 2 }],
            hints: [md`$\langle x\rangle = x_0\cos\omega t$, $\langle p\rangle = m\tfrac{d\langle x\rangle}{dt}$.`],
            sol: md`$\cos60° = 0.5$; $\langle p\rangle = -m\omega x_0\sin60° = -0.866\,m\omega x_0$. True for every state with those initial averages, whatever its shape.`,
          }),
          Q(md`$V(x)$ is even. At $t = 0$, $\Psi$ is an odd function of $x$. Which statement holds for all later times?`,
            [md`$\Psi$ stays odd, so $\langle x\rangle = 0$ forever`, 'Ψ becomes even after half a period', md`$|\Psi|^2$ is time-independent`, 'Nothing is conserved because parity is not a position or momentum'], 0,
            [null, md`Parity commutes with $\hat H$; an eigenstate of $\hat\Pi$ stays one.`, md`Only if it is stationary. A superposition of two odd states with different energies changes shape.`, md`$\hat\Pi$ is a perfectly good Hermitian operator with eigenvalues $\pm1$.`],
            md`$[\hat H, \hat\Pi] = 0$ for even $V$: $\hat\Pi\Psi(t) = -\Psi(t)$ for all $t$. Then $|\Psi|^2$ is even and $\langle x\rangle = 0$.`),
          P({
            title: 'Virial theorem for hydrogen',
            q: md`The hydrogen ground state has $E = -13.6$ eV. With $V \propto 1/r$, find $\langle T\rangle$ and $\langle V\rangle$.`,
            parts: [{ lbl: '\\langle T\\rangle', ans: 13.6, unit: 'eV' }, { lbl: '\\langle V\\rangle', ans: -27.2, unit: 'eV' }],
            hints: [md`$n = -1$: $2\langle T\rangle = -\langle V\rangle$.`],
            sol: md`$\langle T\rangle = \tfrac{n}{n+2}E = -E = 13.6$ eV, $\langle V\rangle = 2E = -27.2$ eV. Kinetic energy is positive, as it must be.`,
          }),
          L(6, 'harder than the exam'),
          P({
            title: 'Rate of the x–p correlation',
            q: md`For the oscillator, $\tfrac{d}{dt}\langle xp + px\rangle = \tfrac{2\langle p^2\rangle}{m} - 2m\omega^2\langle x^2\rangle = 4(\langle T\rangle - \langle V\rangle)$. At some instant a state has $\langle T\rangle = \tfrac34\hbar\omega$ and $\langle V\rangle = \tfrac14\hbar\omega$. Enter $\tfrac{d}{dt}\langle xp + px\rangle$ in units of $\hbar\omega$. Is the state stationary?`,
            parts: [{ lbl: '\\tfrac{d}{dt}\\langle xp+px\\rangle/\\hbar\\omega', ans: 2 }, { lbl: '', mc: ['No: in a stationary state ⟨T⟩ = ⟨V⟩', 'Yes: ⟨H⟩ = ħω is a constant', 'Cannot tell'], a: 0, why: [null, 'Constant ⟨H⟩ holds for every state.', 'The virial theorem decides it.'] }],
            hints: [md`$[\hat H, \hat x\hat p + \hat p\hat x]$ uses $[\hat p^2, \hat x] = -2i\hbar\hat p$ and $[\hat x^2, \hat p] = 2i\hbar\hat x$.`],
            sol: md`$4\left(\tfrac34 - \tfrac14\right) = 2$. Stationary states need $\langle T\rangle = \langle V\rangle$, so this one is not stationary (it is "breathing": a squeezed or $\ket0 + \ket2$ type state).`,
          }),
          Q(md`$\hat H(t)$ depends explicitly on time (a driven system). Then $\tfrac{d\langle H\rangle}{dt}$ equals…`,
            [md`$\left\langle\tfrac{\partial\hat H}{\partial t}\right\rangle$`, '0', md`$\tfrac{i}{\hbar}\langle[\hat H, \hat H]\rangle$, which is nonzero`, 'undefined'], 0,
            [null, 'Energy is conserved only if H has no explicit t.', md`$[\hat H, \hat H] = 0$ always.`, 'Perfectly well defined.'],
            md`The commutator term vanishes; the explicit-time term is the work done by the drive.`),
          Q(md`In **any** stationary state $\ket n$ and for **any** time-independent operator $\hat Q$, what follows?`,
            [md`$\bra n[\hat H, \hat Q]\ket n = 0$ (e.g. $\hat Q = \hat x\hat p$ gives the virial theorem)`, md`$[\hat H, \hat Q] = 0$ as an operator`, md`$\hat Q$ is conserved in every state`, 'Nothing'], 0,
            [null, md`Only its diagonal element in $\ket n$ vanishes.`, 'That would need the commutator to vanish as an operator.', md`$\bra n\hat H\hat Q - \hat Q\hat H\ket n = (E_n - E_n)\bra n\hat Q\ket n = 0$.`],
            md`$\bra n\hat H\hat Q\ket n = E_n\bra n\hat Q\ket n = \bra n\hat Q\hat H\ket n$. Choosing $\hat Q$ cleverly gives exact results for free: $\hat x\hat p$ gives the virial theorem, $\hat x$ gives $\langle p\rangle = 0$, $\hat p$ gives $\langle V'\rangle = 0$.`),
          R(md`
            ### Exam-style problem

            Midterm 1 format: four parts, 5 points each, graded with a rubric. Write the reasoning; it is most of the points.
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 486 · Exam-style problem · Topic 11</span><span>20 pts</span></div>',
            head: md`**Conserved or not?** [20 points, 5 per part]

            A particle of mass $m$ moves in one dimension with $\hat H = \hat p^2/2m + V(\hat x)$. You may use
            $$\frac{d\langle\hat Q\rangle}{dt} = \frac{i}{\hbar}\left\langle[\hat H, \hat Q]\right\rangle + \left\langle\frac{\partial\hat Q}{\partial t}\right\rangle.$$`,
            items: [
              {
                q: md`**(a)** Show that $[V(\hat x), \hat p] = i\hbar V'(\hat x)$ by letting the commutator act on a test function, and use it to find $\tfrac{d\langle p\rangle}{dt}$. Explain why the center of a wave packet does **not** in general follow Newton's law with the force $-V'(\langle x\rangle)$.`,
                ans: md`$\tfrac{d\langle p\rangle}{dt} = -\langle V'(x)\rangle$, which differs from $-V'(\langle x\rangle)$ unless $V'$ is linear.`,
                sol: md`
                  **How to see it.** The packet feels the force at every point it occupies, weighted by $|\Psi|^2$. Averaging the force is not the same as evaluating it at the average position.

                  $[V, \hat p]g = V(-i\hbar g') + i\hbar(Vg)' = i\hbar V'g$. Then $[\hat H, \hat p] = [V, \hat p] = i\hbar V'$ (the kinetic term commutes with $\hat p$), and $\tfrac{d\langle p\rangle}{dt} = \tfrac{i}{\hbar}\cdot i\hbar\langle V'\rangle = -\langle V'\rangle$. Expanding $V'(x)$ about $\langle x\rangle$: $\langle V'\rangle = V'(\langle x\rangle) + \tfrac12V'''(\langle x\rangle)\sigma_x^2 + \dots$, so the two agree only if $V''' = 0$ (at most quadratic $V$) or the packet is narrow compared with the scale on which the force changes.

                  **Rubric** 5: test-function proof, correct $-\langle V'\rangle$, clear reason (averaging a nonlinear function). · 4: result right, explanation vague. · 3: commutator right, explanation missing or wrong. · 2: sign error in the commutator or result. · 1: theorem quoted only.
                `,
              },
              {
                q: md`**(b)** Choose $\hat Q = \hat x\hat p$ to show that in any stationary state $2\langle T\rangle = \langle xV'\rangle$. Without solving the Schrödinger equation, find $\langle T\rangle$ and $\langle V\rangle$ in the $n$th stationary state of $V = \tfrac12m\omega^2x^2$, given $E_n = (n + \tfrac12)\hbar\omega$.`,
                ans: md`$\langle T\rangle = \langle V\rangle = \tfrac12E_n = \tfrac12(n + \tfrac12)\hbar\omega$.`,
                sol: md`
                  **How to see it.** In a stationary state nothing moves, so the rate of change of $\langle xp\rangle$ must vanish; that rate is "kinetic minus virial".

                  $[\hat H, \hat x\hat p] = -\tfrac{i\hbar}{m}\hat p^2 + i\hbar\hat xV'$, so $\tfrac{d\langle xp\rangle}{dt} = 2\langle T\rangle - \langle xV'\rangle$, zero in a stationary state. For the oscillator $xV' = m\omega^2x^2 = 2V$, so $\langle T\rangle = \langle V\rangle$, each $E_n/2$.

                  **Rubric** 5: commutator, stationary argument stated, both answers. · 4: answers right, stationary argument missing. · 3: virial theorem quoted without derivation, applied correctly. · 2: derivation attempted, wrong commutator. · 1: answers guessed.
                `,
              },
              {
                q: md`**(c)** True or false? To receive credit, give a brief justification. "If $[\hat H, \hat Q] = 0$, then every measurement of $Q$ on identically prepared copies of the system gives the same result."`,
                ans: md`False.`,
                sol: md`
                  **False.** Commuting with $\hat H$ makes the **probability distribution** of $Q$ outcomes time-independent (since $[\hat H, f(\hat Q)] = 0$ too). It does not make the distribution sharp. Example: a free particle in $\tfrac{1}{\sqrt2}(e^{ikx} + e^{-ikx})$; momentum is conserved, yet measurements give $\pm\hbar k$ half the time each, forever.

                  **Rubric** 5: False, with "conserved distribution ≠ sharp value" and an example or the eigenstate condition. · 4: good reasoning, slightly imprecise. · 3: fair attempt. · 2: some relevant thought. · 1: correct verdict, no justification.
                `,
              },
              {
                q: md`**(d)** True or false? Justify. "For the harmonic oscillator, $\langle x\rangle(t)$ obeys exactly the classical equation $\tfrac{d^2\langle x\rangle}{dt^2} = -\omega^2\langle x\rangle$, even for a state that is very far from classical, such as $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$."`,
                ans: md`True.`,
                sol: md`
                  **True.** $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$ and $\tfrac{d\langle p\rangle}{dt} = -\langle V'\rangle = -m\omega^2\langle x\rangle$, because $V'$ is linear. These close on themselves for every state. What is not classical about $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$ is that its orbit (amplitude $\sqrt{\hbar/2m\omega}$) is smaller than its own width, not the equation the average obeys.

                  **Rubric** 5: True, linear force closes the equations, comment on what is still quantum. · 4: True with the Ehrenfest equations but no comment on linearity. · 3: True with a vague "Ehrenfest". · 2: False with a sensible attempt. · 1: True, no justification.
                `,
              },
            ],
          },
          R(md`
            ### Endless practice

            Fresh commutator and Ehrenfest questions every time.

            Where this shows up: [Homework 5](#/l/hw5) Problem 1, [Discussion 6](#/l/disc6) (d⟨x⟩/dt and d⟨p⟩/dt for the oscillator), [Homework 7](#/l/hw7) Problem 3 (the torque version for angular momentum).
          `),
          G('m2_ehrenfest', { need: 3 }),
        ],
        bank: [
          Q(md`$[\hat x^2, \hat p] = $?`, [md`$2i\hbar\hat x$`, md`$-2i\hbar\hat x$`, md`$i\hbar$`, md`$2i\hbar\hat p$`], 0,
            [null, 'Sign: [x, p] = +iħ.', 'That is [x, p].', 'Wrong operator left over.'], md`$[f(\hat x), \hat p] = i\hbar f'$ with $f = x^2$.`),
          Q(md`$[\hat x, \hat p^2] = $?`, [md`$2i\hbar\hat p$`, md`$-2i\hbar\hat p$`, '0', md`$2i\hbar\hat x$`], 0,
            [null, 'Sign.', 'x and p² do not commute.', 'Wrong operator.'], md`$\hat p[\hat x, \hat p] + [\hat x, \hat p]\hat p = 2i\hbar\hat p$.`),
          Q(md`The generalized Ehrenfest theorem needs which operator to be Hermitian?`, [md`$\hat H$`, md`$\hat Q$`, 'both', 'neither'], 0,
            [null, md`$\hat Q$ can be anything, e.g. $\hat x\hat p$.`, md`Only $\hat H$ is moved across the inner product.`, md`Moving $\hat H$ from the bra to the ket uses $\hat H^\dagger = \hat H$.`],
            md`The step $\braket{\hat H\Psi|\hat Q\Psi} = \bra\Psi\hat H\hat Q\ket\Psi$ uses $\hat H^\dagger = \hat H$.`),
          Q(md`In a stationary state of $V = \tfrac12m\omega^2x^2 + \lambda x^4$ (with $\lambda > 0$), compared with $\langle V\rangle$, $\langle T\rangle$ is…`, ['larger', 'equal', 'smaller', 'zero'], 0,
            [null, md`Equal only for a pure quadratic.`, md`$2\langle T\rangle = \langle xV'\rangle = 2\langle V_2\rangle + 4\langle V_4\rangle > 2\langle V\rangle$.`, 'T > 0 for any normalizable state.'],
            md`$xV' = 2V_2 + 4V_4$, so $\langle T\rangle = \langle V_2\rangle + 2\langle V_4\rangle > \langle V_2\rangle + \langle V_4\rangle$.`),
          Q(md`For $\hat H = -\hbar\omega\sigma_z$, which expectation value is constant in every state?`, [md`$\langle\sigma_z\rangle$`, md`$\langle\sigma_x\rangle$`, md`$\langle\sigma_y\rangle$`, md`$\langle\sigma_x\rangle^2$`], 0,
            [null, 'Rotates about z.', 'Rotates about z.', md`Only $\langle\sigma_x\rangle^2 + \langle\sigma_y\rangle^2$ is constant.`],
            md`Only $\sigma_z$ commutes with $\hat H$.`),
          Q(md`For a particle in a uniform field, $V = -Fx$, the packet center…`, ['follows the classical trajectory exactly', 'stays at rest', 'follows it only for Gaussians', 'oscillates'], 0,
            [null, md`$\tfrac{d\langle p\rangle}{dt} = F$.`, 'A linear V′ is the easy case, any shape works.', 'No restoring force.'],
            md`$\langle V'\rangle = -F$ exactly: $\langle x\rangle = x_0 + \tfrac{p_0}{m}t + \tfrac{F}{2m}t^2$.`),
          Q(md`$\hat Q = \hat x$ in a stationary state of any $V$ gives…`, [md`$\langle p\rangle = 0$`, md`$\langle x\rangle = 0$`, md`$\langle V'\rangle = 0$`, md`$\langle T\rangle = \langle V\rangle$`], 0,
            [null, md`$\langle x\rangle$ need not vanish (asymmetric well).`, md`That comes from $\hat Q = \hat p$.`, 'That is the oscillator virial result.'],
            md`$0 = \tfrac{d\langle x\rangle}{dt} = \langle p\rangle/m$.`),
        ],
      },

      // ------------------------------------------------------------------ Topic 12
      {
        id: 't12-energytime', topic: 12, title: 'The energy–time relation and minimum-uncertainty states', ref: 'Lecture 9, HW 5.1d, 5.2',
        steps: [
          RF(md`
            ### The picture

            Time is not an observable. There is no operator $\hat t$ and no $[\hat t, \hat H]$. So "$\Delta E\,\Delta t \ge \hbar/2$" cannot be the same kind of statement as $\sigma_x\sigma_p \ge \hbar/2$. It means:

            **A state can only change as fast as its energy spread allows.** If a state is a superposition of energies spread by $\sigma_H$, its observables can change appreciably in a time of order $\hbar/\sigma_H$, and no faster. A stationary state ($\sigma_H = 0$) never changes at all.

            You already know the cleanest example. In $\tfrac{1}{\sqrt2}(\ket{\psi_1} + \ket{\psi_2})$ the density sloshes at $\omega = (E_2 - E_1)/\hbar$ (Midterm 1, Problem 1). The energy spread is $\sigma_H = (E_2 - E_1)/2$, and the sloshing time is $\sim1/\omega = \hbar/(E_2 - E_1)$. Product: $\hbar/2$. On the Bloch sphere (Lecture 9) this is the state vector rotating about $z$ at $\omega$.

            ### Where it comes from

            Take the generalized uncertainty relation with $\hat A = \hat H$, $\hat B = \hat Q$ (no explicit $t$), and replace the commutator by the rate of change using Ehrenfest, $\langle[\hat H, \hat Q]\rangle = -i\hbar\tfrac{d\langle Q\rangle}{dt}$:
            $$\sigma_H^2\sigma_Q^2 \ge \left(\frac{1}{2i}\langle[\hat H, \hat Q]\rangle\right)^2 = \left(\frac{\hbar}{2}\frac{d\langle Q\rangle}{dt}\right)^2 \quad\Longrightarrow\quad \sigma_H\,\sigma_Q \ge \frac\hbar2\left|\frac{d\langle Q\rangle}{dt}\right|$$
            Define $\Delta E \equiv \sigma_H$ and $\Delta t \equiv \dfrac{\sigma_Q}{|d\langle Q\rangle/dt|}$, **the time it takes $\langle Q\rangle$ to move by one standard deviation**. Then
            $$\Delta E\,\Delta t \ge \frac\hbar2$$
            $\Delta t$ depends on which $Q$ you watch; the inequality holds for every choice, so the fastest-changing observable sets the tightest statement.

            [[fig:band]]

            !!intuition Reading the figure
              Two-level state, equal weights, $Q = \ket1\bra2 + \ket2\bra1$. The solid line is $\langle Q\rangle = \cos\omega t$; the dashed lines are $\langle Q\rangle \pm \sigma_Q$ with $\sigma_Q = |\sin\omega t|$. $\Delta t$ is how long the solid line takes to cross the band: $\Delta t = |\sin\omega t|/(\omega|\sin\omega t|) = 1/\omega$ at every instant. With $\sigma_H = \hbar\omega/2$ the product is exactly $\hbar/2$: this state saturates the bound all the time.

            ### Position as the clock (HW 5.1d)

            With $\hat Q = \hat x$: $[\hat x, \hat H] = \tfrac{i\hbar}{m}\hat p$, so
            $$\sigma_x\sigma_H \ge \frac{\hbar}{2m}|\langle p\rangle|$$
            and since $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$ this is literally $\sigma_H\cdot\tfrac{\sigma_x}{|d\langle x\rangle/dt|} \ge \tfrac\hbar2$. In a stationary state $\langle p\rangle = 0$ and $\sigma_H = 0$: the inequality reads $0 \ge 0$ and says nothing, as it should, because nothing moves.

            ### What it is good for

            - **Lifetimes and linewidths.** An excited state that decays in $\tau$ cannot have a sharp energy: $\Delta E \gtrsim \hbar/2\tau$. Short-lived states give broad spectral lines.
            - **Pulses and packets.** A packet that passes a detector in $\Delta t$ contains energies spread by at least $\hbar/2\Delta t$.
            - **What it does not say.** Energy conservation is never "borrowed". $\langle H\rangle$ and every $P(E_n)$ are exactly constant (Topic 11).
          `, { band: { svg: band, cap: md`$\langle Q\rangle$ (solid) and $\langle Q\rangle \pm \sigma_Q$ (dashed) for an equal two-level superposition. The time to cross the band is $\Delta t = 1/\omega$.` } }),
          RF(md`
            ### Minimum-uncertainty states (HW 5.2)

            The proof of $\sigma_A\sigma_B \ge \tfrac12|\langle[\hat A, \hat B]\rangle|$ used two inequalities, with $\ket f = (\hat A - \langle A\rangle)\ket\Psi$, $\ket g = (\hat B - \langle B\rangle)\ket\Psi$, $z = \braket{f|g}$:
            $$\sigma_A^2\sigma_B^2 = \braket{f|f}\braket{g|g} \overset{(1)}{\ge} |z|^2 \overset{(2)}{\ge} (\text{Im}\,z)^2$$
            (1) is Cauchy–Schwarz: equality iff $\ket g = c\ket f$ (parallel vectors). (2) drops $(\text{Re}\,z)^2$: equality iff $z$ is purely imaginary. With $\ket g = c\ket f$, $z = c\braket{f|f}$, so $c$ must be imaginary: **$\ket g = i\lambda\ket f$ with $\lambda$ real.**

            For $\hat A = \hat x$, $\hat B = \hat p$ this is a first-order ODE:
            $$-i\hbar\Psi' - \langle p\rangle\Psi = i\lambda(x - \langle x\rangle)\Psi \;\Rightarrow\; \Psi = A\exp\left[-\frac{\lambda(x - \langle x\rangle)^2}{2\hbar}\right]e^{i\langle p\rangle x/\hbar}$$
            Normalizable iff $\lambda > 0$. $\langle x\rangle$ sets the center, $\langle p\rangle$ the carrier wave, and $\lambda$ the width: $|\Psi|^2 \propto e^{-\lambda(x - \langle x\rangle)^2/\hbar}$, so $\sigma_x^2 = \hbar/2\lambda$. **Every minimum-uncertainty state is a Gaussian.**

            !!key Three consequences
              - The oscillator ground state: $\hat a_-\psi_0 = 0$ reads $\hat p\psi_0 = im\omega\hat x\psi_0$, the condition with $\lambda = m\omega$. So $\sigma_x = \sqrt{\hbar/2m\omega}$, $\sigma_p = \sqrt{\hbar m\omega/2}$, no integrals (HW 5.3d).
              - No state of the infinite square well reaches $\hbar/2$: a Gaussian is nonzero everywhere and cannot vanish at the walls.
              - A free Gaussian leaves the bound as it spreads. It stays Gaussian, so (1) remains an equality; what fails is (2). The dropped term is the **covariance** $\text{Re}\,z = \tfrac12\langle xp + px\rangle - \langle x\rangle\langle p\rangle$.

            [[fig:spread]]

            !!intuition Why the covariance grows
              A spreading packet has its fast components out in front and its slow ones behind: position and momentum become **correlated** ($\text{Re}\,z > 0$ for $t > 0$). Run the movie backwards ($t < 0$): the packet is converging, slow parts in front, fast ones catching up, so $\text{Re}\,z < 0$. Keeping $(\text{Re}\,z)^2$ gives the Schrödinger–Robertson relation, which the free Gaussian saturates at all times.
          `, { spread: { svg: spread, cap: md`A free Gaussian at $t = 0$ (narrow, uncorrelated) and later (wide, fast parts ahead): $x$ and $p$ become correlated.` } }),
          R(md`
            ### Worked example

            !!graded Problem
              A two-level system has energies $E_1 < E_2$ and starts in $\tfrac{1}{\sqrt2}(\ket1 + \ket2)$. Let $\hat Q = \ket1\bra2 + \ket2\bra1$. (a) Find $\sigma_H$. (b) Find $\langle Q\rangle(t)$ and $\sigma_Q(t)$. (c) Find $\Delta t$ and check $\sigma_H\Delta t \ge \hbar/2$.

            **(a)** $\langle H\rangle = \tfrac{E_1 + E_2}{2}$, $\langle H^2\rangle = \tfrac{E_1^2 + E_2^2}{2}$, so $\sigma_H^2 = \tfrac{(E_2 - E_1)^2}{4}$ and $\sigma_H = \tfrac{E_2 - E_1}{2} = \tfrac{\hbar\omega}{2}$ with $\omega = (E_2 - E_1)/\hbar$. Constant in time (probabilities are).

            **(b)** $\ket{\Psi(t)} = \tfrac{1}{\sqrt2}(e^{-iE_1t/\hbar}\ket1 + e^{-iE_2t/\hbar}\ket2)$. $\langle Q\rangle = c_1^*c_2 + c_2^*c_1 = 2\,\text{Re}\left(\tfrac12e^{-i\omega t}\right) = \cos\omega t$. $\hat Q^2 = \ket1\bra1 + \ket2\bra2$ is the identity on this space, so $\langle Q^2\rangle = 1$ and $\sigma_Q = \sqrt{1 - \cos^2\omega t} = |\sin\omega t|$.

            **(c)** $\Delta t = \tfrac{|\sin\omega t|}{\omega|\sin\omega t|} = \tfrac1\omega$, so $\sigma_H\Delta t = \tfrac{\hbar\omega}{2}\cdot\tfrac1\omega = \tfrac\hbar2$. Equality at every instant.

            !!mistake Common mistakes
              - Calling $\Delta t$ "the uncertainty in time". There is no time operator; $\Delta t$ is a characteristic time of the state's evolution.
              - Reading $\Delta E\Delta t \ge \hbar/2$ as "energy conservation can be violated for a short time". $\langle H\rangle$ and $P(E_n)$ are exactly constant.
              - Forgetting that $\Delta t$ depends on the observable. A state can change fast in one observable and slowly in another.
              - Getting the minimum-uncertainty condition backwards: $\ket g = i\lambda\ket f$ with real $\lambda > 0$; a real factor would make $z$ real and the commutator term vanish.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`Why is there no commutator $[\hat t, \hat H]$ in quantum mechanics?`,
            ['Time is a parameter, not an observable represented by a Hermitian operator', 't commutes with H', 'It always equals iħ', 'Because t is imaginary'], 0,
            [null, md`There is nothing to commute: $t$ is not an operator.`, 'There is no such operator to take a commutator of.', 'Nonsense.'],
            'The energy–time relation is derived from the generalized uncertainty relation with Q and the Ehrenfest theorem instead.'),
          Q(md`A stationary state has $\sigma_H = 0$. The energy–time relation then says…`,
            [md`$\Delta t = \infty$: no observable changes, consistent`, md`$\Delta t = 0$: it changes instantly`, 'it is violated', 'the state decays'], 0,
            [null, 'Δt ≥ ħ/(2σH) → ∞.', 'Backwards.', md`$0 \cdot \infty$: $d\langle Q\rangle/dt = 0$ for every $Q$, the bound reads $0 \ge 0$.`],
            'Stationary means nothing moves; the relation agrees.'),
          L(2, 'set up'),
          P({
            title: 'Spread of an unequal superposition',
            q: md`A state has $P(E_1) = \tfrac14$, $P(E_2) = \tfrac34$. Find $\sigma_H$ in units of $E_2 - E_1$.`,
            parts: [{ lbl: '\\sigma_H/(E_2-E_1)', ans: Math.sqrt(3 / 16) }],
            hints: [md`For two levels, $\sigma_H = \sqrt{p_1p_2}\,|E_2 - E_1|$.`],
            sol: md`$\sigma_H^2 = p_1E_1^2 + p_2E_2^2 - (p_1E_1 + p_2E_2)^2 = p_1p_2(E_2 - E_1)^2$, so $\sigma_H = \sqrt{3/16} = 0.433$ in those units.`,
          }),
          Q(md`Why does $\sigma_x\sigma_H \ge \tfrac{\hbar}{2m}|\langle p\rangle|$ tell you nothing in a stationary state?`,
            [md`$\langle p\rangle = 0$ there, so it reads $0 \ge 0$, consistent with $\sigma_H = 0$`, md`$\sigma_x = 0$ there`, md`$\hat H$ commutes with $\hat x$`, 'It is violated there'], 0,
            [null, md`$\sigma_x > 0$ for every normalizable state.`, md`$[\hat x, \hat H] = i\hbar\hat p/m \ne 0$.`, 'Never violated.'],
            md`In a stationary state $\tfrac{d\langle x\rangle}{dt} = \langle p\rangle/m = 0$.`),
          L(3, 'standard'),
          P({
            title: 'Natural linewidth',
            q: md`An excited state of an atom decays with lifetime $\tau = 16$ ns. Estimate the minimum energy spread $\hbar/2\tau$ in eV.`,
            parts: [{ lbl: '\\Delta E', ans: 2.057e-8, unit: 'eV' }],
            hints: [md`$\hbar = 6.582\times10^{-16}$ eV·s.`],
            sol: md`$\tfrac{6.582\times10^{-16}}{3.2\times10^{-8}} = 2.06\times10^{-8}$ eV. Tiny compared with the 2 eV transition energy: atomic lines are sharp because atoms live long.`,
          }),
          P({
            title: 'A short packet',
            q: md`An electron packet passes a detector in $\Delta t = 1$ fs. What is the minimum energy spread $\hbar/2\Delta t$ in eV?`,
            parts: [{ lbl: '\\Delta E', ans: 0.3291, unit: 'eV' }],
            sol: md`$6.582\times10^{-16}/(2\times10^{-15}) = 0.33$ eV. Ultrafast pulses are necessarily broadband.`,
          }),
          Q(md`$\Delta t$ in $\Delta E\Delta t \ge \hbar/2$ is…`,
            [md`the time for $\langle Q\rangle$ to change by one standard deviation $\sigma_Q$, for whichever $Q$ you choose`, 'the uncertainty in a measurement of time', 'the time between two measurements', 'the lifetime of every state'], 0,
            [null, 'There is no time observable to be uncertain about.', 'Unrelated.', 'Only for decaying states is it a lifetime.'],
            md`$\Delta t = \sigma_Q/|d\langle Q\rangle/dt|$.`),
          L(4, 'one twist'),
          P({
            title: 'Reading a minimum-uncertainty state',
            q: md`$\Psi(x) = A\exp\left[-\tfrac{(x - 2b)^2}{4b^2}\right]e^{3ix/b}$. Find $\sigma_x$ in units of $b$, and $\langle p\rangle$ and $\sigma_p$ in units of $\hbar/b$.`,
            parts: [{ lbl: '\\sigma_x/b', ans: 1 }, { lbl: '\\langle p\\rangle b/\\hbar', ans: 3 }, { lbl: '\\sigma_p b/\\hbar', ans: 0.5 }],
            hints: [md`$|\Psi|^2 \propto e^{-(x - 2b)^2/2b^2}$: compare with $e^{-(x - x_0)^2/2\sigma^2}$.`, md`It is a Gaussian, so it saturates $\sigma_x\sigma_p = \hbar/2$.`],
            sol: md`$\sigma_x = b$; the carrier $e^{3ix/b}$ gives $\langle p\rangle = 3\hbar/b$; minimum uncertainty gives $\sigma_p = \hbar/2b$. (Here $\lambda/\hbar = 1/2b^2$.)`,
          }),
          Q(md`In the minimum-uncertainty condition $\ket g = i\lambda\ket f$ for $x$ and $p$, what happens if $\lambda < 0$?`,
            [md`$\Psi \propto e^{+|\lambda|(x - \langle x\rangle)^2/2\hbar}$ blows up: not normalizable`, 'You get a narrower Gaussian', 'Nothing changes', 'You get a plane wave'], 0,
            [null, 'The sign of the exponent flips.', 'The solution is not normalizable.', md`$\lambda = 0$ would give the plane wave.`],
            md`Normalizability forces $\lambda > 0$, and $\lambda$ sets $\sigma_x^2 = \hbar/2\lambda$.`),
          L(5, 'exam level'),
          P({
            title: 'Ground-state widths without integrals',
            q: md`$\hat a_-\psi_0 = 0$ is the minimum-uncertainty condition with $\lambda = m\omega$. Find $\sigma_x$ in units of $\sqrt{\hbar/m\omega}$ and $\sigma_p$ in units of $\sqrt{\hbar m\omega}$.`,
            parts: [{ lbl: '\\sigma_x', ans: Math.SQRT1_2 }, { lbl: '\\sigma_p', ans: Math.SQRT1_2 }],
            hints: [md`$\sigma_x^2 = \hbar/2\lambda$ and $\sigma_x\sigma_p = \hbar/2$.`],
            sol: md`$\sigma_x = \sqrt{\hbar/2m\omega}$, $\sigma_p = \tfrac{\hbar}{2\sigma_x} = \sqrt{\hbar m\omega/2}$: both $1/\sqrt2$ in natural units.`,
          }),
          Q(md`A free Gaussian has $\sigma_x\sigma_p = \hbar/2$ at $t = 0$ only. Which step of the proof stops being an equality?`,
            [md`(2): the dropped $(\text{Re}\,z)^2$, the $x$–$p$ correlation, becomes nonzero`, md`(1): Cauchy–Schwarz, because the packet stops being Gaussian`, 'Both', 'Neither: the product stays ħ/2'], 0,
            [null, md`It stays Gaussian, and for a Gaussian $\ket g \propto \ket f$ still holds; the factor just stops being purely imaginary.`, 'Only (2) fails.', 'The width grows while σp is constant.'],
            md`$\ket g = c\ket f$ with complex $c$: (1) is still an equality, but $z = c\braket{f|f}$ acquires a real part.`),
          Q(md`Why can no state of the infinite square well have $\sigma_x\sigma_p = \hbar/2$?`,
            ['Minimum-uncertainty states are Gaussians, which cannot vanish outside the well', 'The well has no momentum eigenstates', 'Because the energies are quantized', md`Because $\langle p\rangle = 0$ in the well`], 0,
            [null, 'True but irrelevant.', 'Quantization is not the reason.', md`$\langle p\rangle$ can be nonzero in a superposition; the bound does not care.`],
            'Equality requires the Gaussian solution of the ODE; it is nonzero everywhere.'),
          L(6, 'harder than the exam'),
          P({
            title: 'Quantum speed limit',
            q: md`$\tfrac{1}{\sqrt2}(\ket1 + \ket2)$ evolves until it is orthogonal to its initial state. Find that time in units of $\hbar/\sigma_H$.`,
            parts: [{ lbl: 't_\\perp\\,\\sigma_H/\\hbar', ans: Math.PI / 2 }],
            hints: [md`$\braket{\Psi(0)|\Psi(t)} = \tfrac12(e^{-iE_1t/\hbar} + e^{-iE_2t/\hbar})$.`, md`$\sigma_H = (E_2 - E_1)/2$.`],
            sol: md`The overlap vanishes when $(E_2 - E_1)t/\hbar = \pi$, i.e. $t_\perp = \tfrac{\pi\hbar}{E_2 - E_1} = \tfrac{\pi\hbar}{2\sigma_H}$. The Mandelstam–Tamm bound says no state can become orthogonal faster than $\pi\hbar/2\sigma_H$: this one saturates it.`,
          }),
          Q(md`A free Gaussian packet at $t < 0$ is converging toward its narrowest width at $t = 0$. The covariance $\tfrac12\langle xp + px\rangle - \langle x\rangle\langle p\rangle$ is…`,
            ['negative: slow parts in front, fast parts behind', 'positive', 'zero', 'undefined'], 0,
            [null, 'Positive is the spreading case, t > 0.', 'Zero only at the waist.', 'Well defined.'],
            md`It is linear in $t$ for a free particle ($\tfrac{d}{dt}$ of it is $\langle p^2\rangle/m - \langle p\rangle^2/m = \sigma_p^2/m$), zero at the waist, negative before.`),
          Q(md`For the two-level state $a\ket1 + b\ket2$ ($a \ne b$ real) and $\hat Q = \ket1\bra2 + \ket2\bra1$, $\sigma_H\Delta t = \tfrac\hbar2\sqrt{1 - 4a^2b^2\cos^2\omega t}\,/|\sin\omega t|$. When is it equal to $\hbar/2$?`,
            [md`At the instants $\cos\omega t = 0$ (when $\langle Q\rangle$ crosses zero)`, 'Never', 'At all times', md`At $t = 0$`], 0,
            [null, md`At $\cos\omega t = 0$ the ratio is $1/1$.`, md`Only if $a = b$.`, md`At $t = 0$ it diverges ($\langle Q\rangle$ is at a turning point).`],
            md`Since $4a^2b^2 \le 1$, the square root is $\ge|\sin\omega t|$, with equality when $\cos\omega t = 0$ or when $a = b$.`),
          R(md`
            ### Exam-style problem
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 486 · Exam-style problem · Topic 12</span><span>20 pts</span></div>',
            head: md`**How fast can a two-level system change?** [20 points, 5 per part]

            A system has two stationary states $\ket1$, $\ket2$ with energies $E_1 < E_2$; write $\omega = (E_2 - E_1)/\hbar$. At $t = 0$ it is in $\ket{\Psi(0)} = a\ket1 + b\ket2$ with $a, b$ real, positive, $a^2 + b^2 = 1$. Consider the observable $\hat Q = \ket1\bra2 + \ket2\bra1$. You may use $\sigma_A\sigma_B \ge \left|\tfrac{1}{2i}\langle[\hat A, \hat B]\rangle\right|$ and the generalized Ehrenfest theorem.`,
            items: [
              {
                q: md`**(a)** Find $\sigma_H$. Explain in one sentence why it does not depend on time.`,
                ans: md`$\sigma_H = ab(E_2 - E_1) = ab\,\hbar\omega$.`,
                sol: md`
                  **How to see it.** Time evolution only multiplies each $c_n$ by a phase, so $|c_n|^2$, and with them every moment of $H$, are frozen.

                  $\langle H\rangle = a^2E_1 + b^2E_2$, $\langle H^2\rangle = a^2E_1^2 + b^2E_2^2$; using $a^2 + b^2 = 1$, $\sigma_H^2 = a^2b^2(E_2 - E_1)^2$.

                  **Rubric** 5: correct $\sigma_H$ and the phase argument. · 4: $\sigma_H$ right, reason missing. · 3: method right, algebra slip. · 2: $\sigma_H$ confused with $\langle H\rangle$ or $E_2 - E_1$. · 1: little progress.
                `,
              },
              {
                q: md`**(b)** Find $\langle Q\rangle(t)$ and $\sigma_Q(t)$. Sketch $\langle Q\rangle$ and the band $\langle Q\rangle \pm \sigma_Q$ over one period for $a = b$.`,
                ans: md`$\langle Q\rangle = 2ab\cos\omega t$; $\sigma_Q = \sqrt{1 - 4a^2b^2\cos^2\omega t}$. For $a = b$: $\cos\omega t$ with band half-width $|\sin\omega t|$.`,
                figs: { b: { svg: band, cap: md`$a = b$: $\langle Q\rangle = \cos\omega t$ (solid), $\langle Q\rangle \pm|\sin\omega t|$ (dashed).` } },
                sol: md`
                  **How to see it.** $\hat Q$ only connects $\ket1$ and $\ket2$, so $\langle Q\rangle$ is pure interference: it oscillates at the beat frequency $\omega$.

                  $c_1 = ae^{-iE_1t/\hbar}$, $c_2 = be^{-iE_2t/\hbar}$; $\langle Q\rangle = c_1^*c_2 + c_2^*c_1 = 2ab\cos\omega t$. $\hat Q^2 = \hat 1$ on this space, so $\langle Q^2\rangle = 1$.

                  [[fig:b]]

                  **Rubric** 5: both formulas, sketch with the band pinching to zero width at $\langle Q\rangle = \pm1$. · 4: formulas right, sketch sloppy. · 3: $\langle Q\rangle$ right, $\sigma_Q$ wrong (e.g. $\langle Q^2\rangle$ not recognized as 1). · 2: one common phase for both terms, so no time dependence. · 1: little progress.
                `,
              },
              {
                q: md`**(c)** Compute $\Delta t = \sigma_Q/|d\langle Q\rangle/dt|$ and verify $\sigma_H\Delta t \ge \hbar/2$. When is it an equality?`,
                ans: md`$\sigma_H\Delta t = \tfrac\hbar2\dfrac{\sqrt{1 - 4a^2b^2\cos^2\omega t}}{|\sin\omega t|} \ge \tfrac\hbar2$; equality for all $t$ if $a = b$, otherwise only when $\cos\omega t = 0$.`,
                sol: md`
                  $|d\langle Q\rangle/dt| = 2ab\omega|\sin\omega t|$, so $\sigma_H\Delta t = ab\hbar\omega\cdot\dfrac{\sqrt{1 - 4a^2b^2\cos^2\omega t}}{2ab\omega|\sin\omega t|}$. Because $4a^2b^2 \le 1$ (AM–GM: $2ab \le a^2 + b^2 = 1$), $1 - 4a^2b^2\cos^2 \ge 1 - \cos^2 = \sin^2$. Equality iff $4a^2b^2 = 1$ ($a = b$) or $\cos\omega t = 0$.

                  **Rubric** 5: correct $\Delta t$, inequality shown with $2ab \le 1$, both equality cases. · 4: inequality shown, equality cases incomplete. · 3: only checked for $a = b$. · 2: wrong derivative or $\Delta t$ definition. · 1: little progress.
                `,
              },
              {
                q: md`**(d)** True or false? Justify. "The energy–time relation means energy conservation can be violated by an amount $\Delta E$ for a time $\hbar/\Delta E$."`,
                ans: md`False.`,
                sol: md`
                  **False.** $[\hat H, \hat H] = 0$, so $\langle H\rangle$ and every $P(E_n)$ are exactly constant at all times (here $a^2$, $b^2$). $\Delta E = \sigma_H$ is the energy **spread** already present in the state, and $\Delta t$ is how fast its observables (like $\langle Q\rangle$) change. Nothing is borrowed.

                  **Rubric** 5: False; $\langle H\rangle$ and $P(E_n)$ conserved; correct meaning of $\Delta E$ and $\Delta t$. · 4: good reasoning, meaning of $\Delta t$ vague. · 3: fair attempt. · 2: some relevant thought. · 1: correct verdict, no justification.
                `,
              },
            ],
          },
          R(md`Where this shows up: [Homework 5](#/l/hw5) Problems 1(d) and 2, [Homework 6](#/l/hw6) Problem 3 (coherent states saturate the bound), and Topic 16.`),
        ],
        bank: [
          Q(md`Which state saturates $\sigma_x\sigma_p = \hbar/2$?`, [md`$e^{-(x-1)^2}e^{2ix}$`, md`$\sin(\pi x/a)$ in a box`, md`$e^{-|x|}$`, md`$xe^{-x^2}$`], 0,
            [null, 'Product > ħ/2 (the box ground state gives 0.57ħ).', 'Kink: larger σp.', 'First excited oscillator state: 3ħ/2.'], 'Any Gaussian times a plane wave.'),
          Q(md`An excited nucleus lives $10^{-21}$ s. Its gamma line is…`, ['broad (∼0.3 MeV)', 'perfectly sharp', 'narrower than an atomic line', 'shifted, not broadened'], 0,
            [null, 'Short lifetime → large ΔE.', 'Opposite.', 'Lifetime gives width, not shift.'], md`$\hbar/2\tau \approx 6.6\times10^{-16}/(2\times10^{-21})\ \text{eV} \approx 0.33$ MeV.`),
          Q(md`A state is an eigenstate of $\hat H$. Which is true?`, ['Every expectation value is constant', 'Only ⟨H⟩ is constant', '⟨x⟩ oscillates at E/ħ', 'σx is zero'], 0,
            [null, 'All of them are.', 'The overall phase cancels in every bra-ket.', 'σx > 0 always.'], md`$\bra\Psi\hat Q\ket\Psi$ has $e^{+iEt/\hbar}e^{-iEt/\hbar} = 1$.`),
          Q(md`For $\hat A = \hat x$, $\hat B = \hat H$, the generalized bound is $\tfrac{\hbar}{2m}|\langle p\rangle|$ because…`, [md`$[\hat x, \hat H] = \tfrac{i\hbar}{m}\hat p$`, md`$[\hat x, \hat H] = i\hbar$`, md`$[\hat x, \hat H] = 0$`, md`$[\hat x, \hat H] = -i\hbar V'$`], 0,
            [null, 'That is [x, p].', 'x does not commute with p²/2m.', md`That is $[\hat p, \hat H]$ up to sign.`], md`Only the kinetic term fails to commute with $\hat x$.`),
          Q(md`Minimum-uncertainty states of $\hat x$ and $\hat p$ have $\braket{f|g}$…`, ['purely imaginary', 'purely real', 'zero', 'of modulus 1'], 0,
            [null, md`Real $z$ would make $(\text{Im}\,z)^2 = 0$ and the bound trivial.`, md`Then $\sigma_x\sigma_p = 0$, impossible.`, 'No such condition.'], md`$z = i\lambda\braket{f|f}$.`),
          Q(md`A wave packet takes $10^{-12}$ s to cross a region. The energy spread must be at least about…`, [md`$3\times10^{-4}$ eV`, md`$3\times10^{-1}$ eV`, md`$3\times10^{-8}$ eV`, '0'], 0,
            [null, 'That would be for 1 fs.', 'Too small.', 'A moving packet is not stationary.'], md`$\hbar/2\Delta t = 6.6\times10^{-16}/(2\times10^{-12}) = 3.3\times10^{-4}$ eV.`),
        ],
      },
    ],
  });
})();

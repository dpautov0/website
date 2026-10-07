/* Unit 2a — Solving the Schrödinger equation (Lectures 4–5): stationary states and the infinite square well. Topics 4–5. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  // finite well |x| < 1, z0 = 4: lowest even and odd bound states, drawn at their energies (for the curvature rules)
  function fsw() {
    const z0 = 4, solve = (f, lo, hi) => { for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; };
    const ze = solve((z) => z * Math.tan(z) - Math.sqrt(z0 * z0 - z * z), 0.01, Math.PI / 2 - 1e-6);
    const zo = solve((z) => -z / Math.tan(z) - Math.sqrt(z0 * z0 - z * z), Math.PI / 2 + 1e-6, Math.PI - 1e-6);
    const st = (z, odd) => { const k = Math.sqrt(z0 * z0 - z * z), inside = (x) => (odd ? Math.sin(z * x) : Math.cos(z * x)), edge = inside(1); return (x) => (Math.abs(x) <= 1 ? inside(x) : edge * Math.sign(odd ? x : 1) * Math.exp(-k * (Math.abs(x) - 1))); };
    const E = (z) => -1 + (z / z0) ** 2, s = 0.22;
    const e1 = st(ze, false), e2 = st(zo, true);
    return PF.plot({
      w: 360, h: 220, x: [-2.6, 2.6], y: [-1.1, 0.15], xl: 'x', yl: 'E',
      yt: [[0, '0'], [-1, '-V_0']], hlines: [[E(ze), 'E_1'], [E(zo), 'E_2']],
      curves: [
        { pts: [[-2.6, 0], [-1, 0], [-1, -1], [1, -1], [1, 0], [2.6, 0]], cls: 'dim' },
        { f: (x) => E(ze) + s * e1(x) }, { f: (x) => E(zo) + s * e2(x) },
      ],
    });
  }

  // infinite well: psi_1..psi_3 drawn at their energies
  const isw = PF.plot({
    w: 340, h: 230, x: [-0.15, 1.15], y: [0, 11], xl: 'x', yl: 'E',
    xt: [[0, '0'], [1, 'a']], yt: [[1, 'E_1'], [4, '4E_1'], [9, '9E_1']],
    curves: [1, 2, 3].map((n) => ({ f: (x) => n * n + 0.9 * Math.sin(n * Math.PI * x), from: 0, to: 1 }))
      .concat([{ pts: [[0, 0], [0, 11]] }, { pts: [[1, 0], [1, 11]] }]),
  });

  C.unit({
    id: 'u2', exam: 'm1', num: 'Unit 2', title: 'Wave mechanics in one dimension',
    lessons: [
      // ------------------------------------------------------------------ Topic 4
      {
        id: 't4-stationary', topic: 4, title: 'Stationary states and the 3-step recipe',
        steps: [
          R(md`
            ### The idea

            The Schrödinger equation
            $$i\hbar\frac{\partial\Psi}{\partial t} = \hat H\Psi = -\frac{\hbar^2}{2m}\frac{\partial^2\Psi}{\partial x^2} + V(x)\Psi$$
            is hard because $x$ and $t$ are tangled. Untangle them with a special family of solutions, the **stationary states**: $\Psi_n(x,t) = \psi_n(x)e^{-iE_nt/\hbar}$. Plugging in gives the **time-independent** equation, an eigenvalue problem for the energy:
            $$\hat H\psi_n = E_n\psi_n$$
            A stationary state is "stationary" because its time dependence is a pure phase. $|\Psi_n|^2$ never changes, no expectation value moves, and an energy measurement gives $E_n$ every time ($\sigma_H = 0$).

            ### The 3-step recipe (every problem in Unit 2)

            Because the equation is linear and the $\psi_n$ form a complete orthonormal set, *any* initial state can be built from them, and each piece just spins its own phase:

            1. **Solve** $\hat H\psi_n = E_n\psi_n$ for the stationary states and energies.
            2. **Decompose** the initial state: $\Psi(x,0) = \sum_n c_n\psi_n(x)$, with $c_n = \braket{\psi_n}{\Psi(0)} = \int\psi_n^*(x)\Psi(x,0)\,dx$.
            3. **Evolve**: $\Psi(x,t) = \sum_n c_n\psi_n(x)e^{-iE_nt/\hbar}$.

            Read off from step 2: $P(E_n) = |c_n|^2$, $\langle H\rangle = \sum|c_n|^2E_n$. Both are **constant in time**: the phases do not touch $|c_n|$.

            ### What does move

            Mix two energies and the density beats: $|\Psi|^2$ contains $\cos\left[(E_2 - E_1)t/\hbar\right]$. Only **energy differences** appear in anything observable, which is why adding a constant $V_0$ to the potential (it multiplies $\Psi$ by the global phase $e^{-iV_0t/\hbar}$) changes no prediction.
          `),
          RF(md`
            ### Reading a wavefunction from the potential

            Rewrite the time-independent equation as a statement about curvature:
            $$\psi'' = \frac{2m}{\hbar^2}\left[V(x) - E\right]\psi$$

            [[fig:fsw]]

            - **Allowed region** ($E > V$): $\psi''$ has the opposite sign to $\psi$, so $\psi$ curves back toward the axis and oscillates. Larger $E - V$ (more kinetic energy) means faster wiggles, shorter wavelength.
            - **Forbidden region** ($E < V$): $\psi$ curves away from the axis, so it grows or decays exponentially. Normalizable solutions pick the decaying one.
            - **Amplitude** is larger where the kinetic energy is smaller: the classical particle moves slowly there and spends more time.
            - **Nodes**: the $n$th bound state has $n - 1$ nodes. More nodes, more curvature, more energy. The ground state has none.
            - **Symmetry**: if $V(x)$ is even, each bound state is even or odd. The ground state is even.

            ### Rules the solutions obey

            - $\psi$ is continuous everywhere. $\psi'$ is continuous wherever $V$ is finite; it may jump at an infinite wall (or a delta function).
            - $E$ must exceed the minimum of $V$ for a normalizable solution (otherwise $\psi$ curves away from the axis everywhere and blows up).
            - Bound-state $\psi_n$ can always be chosen **real**.
          `, { fsw: { svg: fsw(), cap: 'Two bound states of a finite well, each drawn at its energy. Inside: oscillating. Outside: decaying. The excited state has one node.' } }),
          R(md`
            ### Worked example

            !!graded Problem
              A particle's state at $t = 0$ is $\Psi(x,0) = \tfrac{1}{\sqrt5}\left[\psi_1(x) + 2\psi_2(x)\right]$, where $\psi_{1,2}$ are stationary states with energies $E_1 < E_2$. Find $\Psi(x,t)$, $P(E_2)$, $\langle H\rangle$, and the period of $|\Psi(x,t)|^2$.

            **1–2. Solve and decompose.** Already done: $c_1 = 1/\sqrt5$, $c_2 = 2/\sqrt5$. Check: $\tfrac15 + \tfrac45 = 1$.

            **3. Evolve.** Each term spins at its own frequency:
            $$\Psi(x,t) = \frac{1}{\sqrt5}\left[\psi_1e^{-iE_1t/\hbar} + 2\psi_2e^{-iE_2t/\hbar}\right]$$

            **Read off.** $P(E_2) = |c_2|^2 = 4/5$ and $\langle H\rangle = \tfrac15E_1 + \tfrac45E_2$, both time-independent.

            **Density.** With real $\psi$'s,
            $$|\Psi|^2 = \tfrac15\left[\psi_1^2 + 4\psi_2^2 + 4\psi_1\psi_2\cos\left(\tfrac{(E_2 - E_1)t}{\hbar}\right)\right]$$
            The cross term oscillates with period $T = 2\pi\hbar/(E_2 - E_1)$.

            !!mistake Common mistakes
              - Giving every term the same phase $e^{-iEt/\hbar}$. Each $E_n$ gets its own.
              - Calling a superposition of different energies "stationary". Its density moves.
              - Thinking $P(E_n)$ changes in time. Only the phases of the $c_n$ change.
              - Forgetting to normalize the initial state before reading probabilities.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`Which state is **stationary**?`,
            [md`$\psi_3(x)e^{-iE_3t/\hbar}$`, md`$\tfrac1{\sqrt2}\left[\psi_1e^{-iE_1t/\hbar} + \psi_2e^{-iE_2t/\hbar}\right]$`, md`$\tfrac1{\sqrt2}\left[\psi_1 + \psi_2\right]e^{-i(E_1 + E_2)t/2\hbar}$`, 'all of them'], 0,
            [null, 'Two different energies: the density beats.', 'This does not even solve the Schrödinger equation: each piece must carry its own phase.', 'Only a single energy eigenstate is stationary.'],
            md`One energy, one overall phase.`),
          Q(md`A potential has minimum value $V_{\min}$. A solution of the time-independent equation with $E < V_{\min}$…`,
            ['cannot be normalized', 'is the ground state', 'has zero kinetic energy', 'exists only for even potentials'], 0,
            [null, 'The ground state still has $E > V_{\\min}$.', 'It would need negative kinetic energy everywhere.', 'Symmetry is irrelevant.'],
            md`$\psi''/\psi > 0$ everywhere: $\psi$ curves away from the axis on both sides and diverges.`),
          L(2, 'set up'),
          P({
            title: 'Average energy',
            q: md`$\Psi(x,0) = \tfrac{1}{\sqrt5}\left[\psi_1 + 2\psi_2\right]$. Find $\langle H\rangle$ at time $t$.`,
            parts: [{ lbl: '\\langle H\\rangle', expr: '(E1 + 4*E2)/5', vars: { E1: [0.5, 2], E2: [2.5, 6], t: [0, 5] } }],
            hints: [md`$\langle H\rangle = \sum|c_n|^2E_n$, and the phases don't matter.`],
            sol: md`$\langle H\rangle = \tfrac15E_1 + \tfrac45E_2$, independent of $t$.`,
          }),
          Q(md`You add a constant $V_0$ to the potential everywhere. A stationary state $\psi_n(x)e^{-iE_nt/\hbar}$ becomes…`,
            [md`$\psi_n(x)e^{-i(E_n + V_0)t/\hbar}$: same shape, extra global phase`, md`a different $\psi_n(x)$ with the same energy`, md`$\psi_n(x)e^{-iE_nt/\hbar}$ unchanged`, md`$\psi_n(x - V_0)$`], 0,
            [null, md`$\psi_n$ solves the same equation with $E$ shifted.`, 'The energy shifts by V₀.', 'A shift in energy is not a shift in space.'],
            md`$(\hat H + V_0)\psi_n = (E_n + V_0)\psi_n$. A global phase factor: no observable changes. Only energy differences are physical.`),
          L(3, 'standard'),
          P({
            title: 'Beat period in the infinite well',
            q: md`In the infinite square well of width $a$, $E_n = n^2\pi^2\hbar^2/2ma^2$. A state is an equal mix of $\psi_1$ and $\psi_2$. What is the period of $|\Psi(x,t)|^2$?`,
            parts: [{ lbl: 'T', expr: '4*m*a^2/(3*pi*hbar)', vars: { m: [0.5, 2], a: [0.5, 2], hbar: [0.5, 2] } }],
            hints: [md`$T = 2\pi\hbar/(E_2 - E_1)$ and $E_2 - E_1 = 3E_1$.`],
            sol: md`$E_2 - E_1 = \tfrac{3\pi^2\hbar^2}{2ma^2}$, so $T = \tfrac{2\pi\hbar\cdot2ma^2}{3\pi^2\hbar^2} = \tfrac{4ma^2}{3\pi\hbar}$.`,
          }),
          Q(md`In a region where $E > V$ but $E - V$ is small, compared with a region where $E - V$ is large, a bound-state $\psi$ has…`,
            ['longer wavelength and larger amplitude', 'shorter wavelength and larger amplitude', 'longer wavelength and smaller amplitude', 'the same wavelength; only the amplitude changes'], 0,
            [null, md`Small kinetic energy means small $k = \sqrt{2m(E-V)}/\hbar$: long wavelength.`, 'Slow classical motion means more time there: larger amplitude.', md`The local wavelength is $2\pi\hbar/\sqrt{2m(E - V)}$.`],
            md`Low kinetic energy: slow wiggles, and the particle lingers there, so $|\psi|^2$ is larger.`),
          L(4, 'one twist'),
          Q(md`How many nodes (zeros, not counting the ends at infinite walls or infinity) does the **third excited** state of a 1-D bound potential have?`,
            ['3', '2', '4', 'depends on the potential'], 0,
            [null, 'That is the second excited state (n = 3).', 'The third excited state is n = 4, with n − 1 = 3 nodes.', 'The node theorem holds for every 1-D bound potential.'],
            md`Ground state $n = 1$: 0 nodes. Third excited: $n = 4$: 3 nodes.`),
          Q(md`At which kind of point may $\psi'(x)$ be discontinuous?`,
            ['Where V jumps to infinity (or has a delta function)', 'Wherever V has a finite jump', 'At every node of ψ', 'Nowhere'], 0,
            [null, md`A finite jump in $V$ makes $\psi''$ jump, but $\psi'$ stays continuous.`, 'Nodes are smooth zeros.', 'It does at infinite walls: ψ is forced to 0 with nonzero slope.'],
            md`Integrate $\psi'' = \tfrac{2m}{\hbar^2}(V - E)\psi$ across the point: the jump in $\psi'$ is finite only if $\int V\psi$ over a vanishing interval is nonzero, which needs an infinite $V$.`),
          L(5, 'exam level'),
          P({
            title: 'Discovering the potential',
            q: md`You measure that a stationary state is $\psi(x) = Ae^{-\alpha x^2}$. Rearranging the time-independent equation gives $V(x) = E + \dfrac{\hbar^2}{2m}\dfrac{\psi''}{\psi}$. Choose the zero of energy so that $V(0) = 0$. Find $E$.`,
            parts: [{ lbl: 'E', expr: 'hbar^2*alpha/m', vars: { hbar: [0.5, 2], alpha: [0.5, 2], m: [0.5, 2] } }],
            hints: [md`$\psi''/\psi = 4\alpha^2x^2 - 2\alpha$.`],
            sol: md`$V(x) = E + \tfrac{\hbar^2}{2m}(4\alpha^2x^2 - 2\alpha) = E - \tfrac{\hbar^2\alpha}{m} + \tfrac{2\hbar^2\alpha^2}{m}x^2$. $V(0) = 0 \Rightarrow E = \hbar^2\alpha/m$, and $V = \tfrac{2\hbar^2\alpha^2}{m}x^2$: a harmonic oscillator, $\tfrac12m\omega^2x^2$ with $\omega = 2\hbar\alpha/m$, so $E = \tfrac12\hbar\omega$. A node-free Gaussian is its ground state.`,
          }),
          Q(md`A state is a superposition of $\psi_1$, $\psi_2$, $\psi_3$. Which quantity can depend on time?`,
            [md`$\langle x\rangle$`, md`$P(E_2)$`, md`$\langle H\rangle$`, md`$\langle H^2\rangle$`], 0,
            [null, md`$|c_2e^{-iE_2t/\hbar}|^2 = |c_2|^2$.`, md`$\sum|c_n|^2E_n$: constant.`, md`$\sum|c_n|^2E_n^2$: constant.`],
            md`$\langle x\rangle$ has cross terms $\propto\cos[(E_m - E_n)t/\hbar]$. Anything built from $\hat H$ alone is conserved.`),
          L(6, 'harder than the exam'),
          Q(md`Can a normalizable stationary state of a 1-D potential have $\langle p\rangle \ne 0$?`,
            [md`No: $\langle p\rangle = m\,d\langle x\rangle/dt = 0$ because nothing in a stationary state moves`, md`Yes, if the potential is not symmetric`, md`Yes, for excited states`, md`Only if $E > V$ everywhere`], 0,
            [null, 'Asymmetry does not help; Ehrenfest still forces it to 0.', 'Excited stationary states are stationary too.', 'Then the state is not normalizable.'],
            md`$\langle x\rangle$ is constant in a stationary state, so $\langle p\rangle = m\,d\langle x\rangle/dt = 0$. (Equivalently: bound $\psi$ can be chosen real.) Plane waves have $\langle p\rangle \ne 0$ but are not normalizable.`),
          Q(md`Two **different** bound states of the same 1-D potential had the same energy. Using the Wronskian $W = \psi_1\psi_2' - \psi_2\psi_1'$ (constant when both solve the equation at the same $E$, and zero at $\pm\infty$), what follows?`,
            [md`$\psi_2 \propto \psi_1$: they are the same state, so 1-D bound states are never degenerate`, 'Nothing: degeneracy is common in 1-D', 'They must be orthogonal', 'One of them must have a node at infinity'], 0,
            [null, 'In 1-D bound spectra it cannot happen.', 'They turn out to be the same state.', 'All bound states vanish at infinity.'],
            md`$W = 0$ everywhere means $\psi_2'/\psi_2 = \psi_1'/\psi_1$, so $\psi_2 = c\,\psi_1$. Bound states in 1-D are non-degenerate.`),
        ],
        bank: [
          Q(md`$c_n$ in the recipe is found from…`, [md`$\int\psi_n^*(x)\Psi(x,0)\,dx$`, md`$\int\psi_n(x)\Psi^*(x,0)\,dx$`, md`$\Psi(x_n,0)$`, md`$\int|\psi_n|^2dx$`], 0,
            [null, 'That is $c_n^*$.', 'Not a projection.', 'That is 1.'], md`Project onto $\psi_n$: $c_n = \braket{\psi_n}{\Psi(0)}$.`),
          Q(md`$\sum_n|c_n|^2$ equals…`, ['1', md`$\langle H\rangle$`, '0', 'the number of states'], 0,
            [null, 'That weights by $E_n$.', 'Probabilities sum to 1.', 'No.'], 'Total probability.'),
          Q(md`The time-independent Schrödinger equation is…`, ['an eigenvalue equation for the energy', 'an equation for the probability current', 'Newton\'s law for the average position', 'only valid in an infinite well'], 0,
            [null, 'Different object.', 'That is Ehrenfest.', 'Applies to any V(x).'], md`$\hat H\psi = E\psi$.`),
          Q(md`If $V(x)$ is even, the ground state is…`, ['even, with no nodes', 'odd, with one node', 'neither even nor odd', 'even, with one node'], 0,
            [null, 'That is the first excited state.', 'Even V gives definite parity.', 'Ground states have no nodes.'], 'No nodes, so it cannot be odd (odd functions vanish at 0).'),
        ],
      },

      // ------------------------------------------------------------------ Topic 5
      {
        id: 't5-isw', topic: 5, title: 'The infinite square well',
        steps: [
          RF(md`
            ### The idea

            $V = 0$ for $0 < x < a$, $V = \infty$ outside. The particle is free inside, and the walls force $\psi(0) = \psi(a) = 0$. Inside, $\psi'' = -k^2\psi$ with $k = \sqrt{2mE}/\hbar$, so $\psi = A\sin kx + B\cos kx$. The wall at 0 kills the cosine; the wall at $a$ demands $\sin ka = 0$, so $ka = n\pi$.

            $$\psi_n(x) = \sqrt{\frac2a}\sin\frac{n\pi x}{a}, \qquad E_n = \frac{n^2\pi^2\hbar^2}{2ma^2} = n^2E_1, \qquad n = 1, 2, 3, \ldots$$

            [[fig:isw]]

            Read the picture: $n - 1$ nodes; energies grow as $n^2$, so the gaps widen ($E_{n+1} - E_n = (2n+1)E_1$); about the center $x = a/2$, odd $n$ are **even** (symmetric) and even $n$ are **odd** (antisymmetric). $E_1 > 0$: confining the particle costs energy (zero-point energy). $n = 0$ is not allowed (gives $\psi = 0$), and negative $n$ repeats the same states.

            ### Orthonormal and complete

            $$\int_0^a\psi_m\psi_n\,dx = \delta_{mn} \qquad\Longrightarrow\qquad c_n = \sqrt{\frac2a}\int_0^a\sin\frac{n\pi x}{a}\,\Psi(x,0)\,dx$$
            This is Fourier's trick: multiply by $\psi_m$ and integrate, and every term but one dies. Any $\Psi(x,0)$ that vanishes at the walls can be expanded this way.

            ### Shortcuts worth knowing

            - **Symmetry:** if $\Psi(x,0)$ is symmetric about $a/2$, every $c_n$ with even $n$ is zero (those $\psi_n$ are antisymmetric). Antisymmetric initial state: only even $n$.
            - In $\psi_n$: $\langle x\rangle = \tfrac a2$, $\langle x^2\rangle = a^2\left(\tfrac13 - \tfrac{1}{2n^2\pi^2}\right)$, $\langle p\rangle = 0$, $\langle p^2\rangle = \left(\tfrac{n\pi\hbar}{a}\right)^2 = 2mE_n$.
            - **Two ways to get $\langle H\rangle$:** $\sum|c_n|^2E_n$, or directly $\tfrac{\hbar^2}{2m}\int|\Psi'|^2dx$ (inside the well $H = p^2/2m$). The second avoids an infinite sum.
            - Centered well ($-a/2 < x < a/2$): same energies; $\psi_n = \sqrt{2/a}\cos(n\pi x/a)$ for odd $n$, $\sqrt{2/a}\sin(n\pi x/a)$ for even $n$.
          `, { isw: { svg: isw, cap: 'The first three states drawn at their energies, 1 : 4 : 9.' } }),
          R(md`
            ### Worked example (HW 2 style)

            !!graded Problem
              At $t = 0$ a particle in the well is in $\Psi(x,0) = Ax(a - x)$. Find $A$, the coefficients $c_n$, $\Psi(x,t)$, $P(E_1)$ and $\langle H\rangle$. Does $P(E_1)$ change in time?

            **Normalize.** $A = \sqrt{30/a^5}$ (Topic 3).

            **Decompose.** The state is symmetric about $a/2$, so even $n$ vanish. With $\int_0^ax(a - x)\sin\tfrac{n\pi x}{a}dx = \tfrac{2a^3}{(n\pi)^3}\left[1 - (-1)^n\right]$:
            $$c_n = \sqrt{\frac2a}\sqrt{\frac{30}{a^5}}\cdot\frac{4a^3}{(n\pi)^3} = \frac{8\sqrt{15}}{(n\pi)^3}\ (n\text{ odd}), \qquad 0\ (n\text{ even})$$

            **Evolve.** $\Psi(x,t) = \sum_{n\,\text{odd}}\dfrac{8\sqrt{15}}{(n\pi)^3}\sqrt{\dfrac2a}\sin\dfrac{n\pi x}{a}\,e^{-in^2\pi^2\hbar t/2ma^2}$.

            **Read off.** $P(E_1) = |c_1|^2 = 960/\pi^6 = 0.9986$: the parabola is almost exactly the ground state. It is constant in time. For $\langle H\rangle$, skip the sum:
            $$\langle H\rangle = \frac{\hbar^2}{2m}\int_0^a|\Psi'|^2dx = \frac{\hbar^2}{2m}\cdot\frac{10}{a^2} = \frac{5\hbar^2}{ma^2}$$
            Sanity check: $E_1 = \pi^2\hbar^2/2ma^2 = 4.93\,\hbar^2/ma^2$, just below. Of course: $\langle H\rangle \ge E_1$ always.

            !!mistake Common mistakes
              - Dropping the $\sqrt{2/a}$ from $\psi_n$ inside the $c_n$ integral.
              - Using $\cos$ states for a well from 0 to $a$, or $\sin$ only for a centered well.
              - Writing $\psi_n$ outside the well as anything but 0.
              - Claiming $\langle H\rangle$ can be below $E_1$. It is an average of numbers $\ge E_1$.
          `),
          L(1, 'recognize'),
          Q(md`$E_3/E_1$ in the infinite square well is…`, ['9', '3', '4', '6'], 0,
            [null, md`$E_n \propto n^2$, not $n$.`, md`That is $E_2/E_1$.`, 'Not a rule here.'],
            md`$E_n = n^2E_1$.`),
          Q(md`You make the well **twice as wide**. The ground-state energy…`, ['drops to ¼', 'halves', 'doubles', 'is unchanged'], 0,
            [null, md`$E_1 \propto 1/a^2$.`, 'More room means less energy.', 'It depends on a.'],
            md`$E_1 = \pi^2\hbar^2/2ma^2$.`),
          L(2, 'set up'),
          P({
            title: 'Two-level mixture',
            q: md`$\Psi(x,0) = \sqrt{\tfrac13}\,\psi_1 + \sqrt{\tfrac23}\,\psi_3$ in a well of width $a$. Find $\langle H\rangle$.`,
            parts: [{ lbl: '\\langle H\\rangle', expr: '19*pi^2*hbar^2/(6*m*a^2)', vars: { hbar: [0.5, 2], m: [0.5, 2], a: [0.5, 2] } }],
            hints: [md`$\langle H\rangle = \tfrac13E_1 + \tfrac23(9E_1)$.`],
            sol: md`$\langle H\rangle = \left(\tfrac13 + 6\right)E_1 = \tfrac{19}{3}E_1 = \tfrac{19\pi^2\hbar^2}{6ma^2}$.`,
          }),
          P({
            title: 'Electron in a 0.5 nm well',
            q: md`An electron is in an infinite well of width $0.5$ nm. Find $E_1$ in eV. ($\hbar = 1.055\times10^{-34}$ J·s, $m_e = 9.109\times10^{-31}$ kg.)`,
            parts: [{ lbl: 'E_1', ans: 1.504, unit: 'eV' }],
            hints: [md`For 1 nm, $E_1 = 0.376$ eV. How does it scale with $a$?`],
            sol: md`$E_1 = \tfrac{\pi^2(1.055\times10^{-34})^2}{2(9.109\times10^{-31})(0.5\times10^{-9})^2} = 2.41\times10^{-19}\,\text{J} = 1.50$ eV. Or $0.376\times4$.`,
          }),
          L(3, 'standard'),
          P({
            title: 'Particle in the left half',
            q: md`At $t = 0$ the particle is spread evenly over the left half: $\Psi = \sqrt{2/a}$ for $0 < x < a/2$, zero elsewhere. Find $P(E_1)$ and $P(E_2)$.`,
            parts: [{ lbl: 'P(E_1)', ans: 4 / Math.PI ** 2 }, { lbl: 'P(E_2)', ans: 4 / Math.PI ** 2 }],
            hints: [md`$c_n = \tfrac2a\int_0^{a/2}\sin\tfrac{n\pi x}{a}dx = \tfrac{2}{n\pi}\left[1 - \cos\tfrac{n\pi}{2}\right]$.`],
            sol: md`$c_1 = \tfrac2\pi$, $c_2 = \tfrac{2}{2\pi}\cdot2 = \tfrac2\pi$, so both probabilities are $4/\pi^2 = 0.405$. ($c_3 = \tfrac{2}{3\pi}$, $P = 0.045$.) Even states appear here because the initial state is lopsided, not symmetric about $a/2$.`,
          }),
          Q(md`$\Psi(x,0)$ is symmetric about the center of the well. Which energies can a measurement return?`,
            [md`Only odd $n$: $E_1, E_3, E_5, \ldots$`, md`Only even $n$`, 'Any $E_n$', md`Only $E_1$`], 0,
            [null, 'Even-n states are antisymmetric about a/2; their overlap with a symmetric state is 0.', 'Symmetry rules out half of them.', 'Only if Ψ is exactly ψ₁.'],
            md`Odd-$n$ sines are symmetric about $a/2$, even-$n$ are antisymmetric: $c_{\text{even}} = 0$.`),
          L(4, 'one twist'),
          P({
            title: 'Sloshing',
            q: md`$\Psi(x,0) = \tfrac1{\sqrt2}(\psi_1 + \psi_2)$. Then $\langle x\rangle(t) = \tfrac a2 - A\cos\omega t$. Find the amplitude $A$. Use $\int_0^ax\,\psi_1\psi_2\,dx = -\tfrac{16a}{9\pi^2}$.`,
            parts: [{ lbl: 'A', expr: '16*a/(9*pi^2)', vars: { a: [0.5, 3] } }],
            hints: [md`$\langle x\rangle = \tfrac12\langle x\rangle_1 + \tfrac12\langle x\rangle_2 + \cos\omega t\int x\psi_1\psi_2\,dx$.`],
            sol: md`$\langle x\rangle = \tfrac a2 + \cos(\omega t)\left(-\tfrac{16a}{9\pi^2}\right)$, so $A = \tfrac{16a}{9\pi^2} \approx 0.18a$, with $\omega = (E_2 - E_1)/\hbar = 3\pi^2\hbar/2ma^2$. The particle sloshes side to side: the first moving thing we have seen.`,
          }),
          Q(md`For a well from $-a/2$ to $a/2$, the ground state is…`,
            [md`$\sqrt{2/a}\cos(\pi x/a)$`, md`$\sqrt{2/a}\sin(\pi x/a)$`, md`$\sqrt{2/a}\cos(2\pi x/a)$`, md`$\sqrt{1/a}\cos(\pi x/a)$`], 0,
            [null, md`At $x = \pm a/2$ it equals $\pm\sqrt{2/a}$, not 0: it breaks the boundary condition.`, md`At $x = \pm a/2$ it equals $-\sqrt{2/a}$: wrong boundary values, and it has nodes.`, 'Normalization is still √(2/a).'],
            md`Node-free, zero at $\pm a/2$: $\cos(\pi x/a)$. Moving the origin does not change energies, only the formula.`),
          L(5, 'exam level'),
          P({
            title: 'Parabola: energy',
            q: md`For $\Psi(x,0) = \sqrt{30/a^5}\,x(a - x)$ in the well, find $P(E_1)$ and $\langle H\rangle$.`,
            parts: [{ lbl: 'P(E_1)', ans: 960 / Math.PI ** 6, tol: { rel: 0.0005 } }, { lbl: '\\langle H\\rangle', expr: '5*hbar^2/(m*a^2)', vars: { hbar: [0.5, 2], m: [0.5, 2], a: [0.5, 2] } }],
            hints: [md`$c_1 = 8\sqrt{15}/\pi^3$.`, md`$\langle H\rangle = \tfrac{\hbar^2}{2m}\int|\Psi'|^2dx$ and $\int|\Psi'|^2 = 10/a^2$.`],
            sol: md`$P(E_1) = 960/\pi^6 = 0.9986$. $\langle H\rangle = \tfrac{\hbar^2}{2m}\cdot\tfrac{10}{a^2} = \tfrac{5\hbar^2}{ma^2}$ (equivalently $\sum_{n\,\text{odd}}\tfrac{960}{(n\pi)^6}n^2E_1$, which sums to the same thing).`,
          }),
          P({
            title: 'Uncertainty in the nth state',
            q: md`In $\psi_n$, $\sigma_x\sigma_p = \tfrac\hbar2\sqrt{\tfrac{n^2\pi^2}{3} - 2}$. Find $\sigma_x\sigma_p/\hbar$ for $n = 2$.`,
            parts: [{ lbl: '\\sigma_x\\sigma_p/\\hbar', ans: 1.6703 }],
            hints: [md`Plug $n = 2$.`],
            sol: md`$\tfrac12\sqrt{4\pi^2/3 - 2} = \tfrac12\sqrt{11.16} = 1.670$. Minimum at $n = 1$: $0.568$, just above $\tfrac12$.`,
          }),
          L(6, 'harder than the exam'),
          P({
            title: 'The wall moves',
            q: md`A particle is in the ground state of a well of width $a$. Suddenly the right wall moves to $2a$, leaving the wavefunction momentarily unchanged. What is the probability of finding it in the **new** ground state?`,
            parts: [{ lbl: 'P', ans: 32 / (9 * Math.PI ** 2) }],
            hints: [md`$c_1 = \int_0^a\sqrt{\tfrac2a}\sin\tfrac{\pi x}{a}\sqrt{\tfrac1a}\sin\tfrac{\pi x}{2a}\,dx$.`, md`$\sin A\sin B = \tfrac12[\cos(A - B) - \cos(A + B)]$; the integral is $\tfrac{4a}{3\pi}$.`],
            sol: md`$c_1 = \tfrac{\sqrt2}{a}\cdot\tfrac{4a}{3\pi} = \tfrac{4\sqrt2}{3\pi}$, so $P = \tfrac{32}{9\pi^2} = 0.360$. (The new $\psi_2$ matches the old ground state exactly on $[0, a]$ up to a factor, so $P(E_2') = \tfrac12$.)`,
          }),
          Q(md`Right after the sudden expansion above, $\langle H\rangle$ in units of the **new** ground energy $E_1' = \pi^2\hbar^2/8ma^2$ is…`,
            ['4', '1', '¼', '2'], 0,
            [null, 'The state is not the new ground state.', 'Energy cannot drop below the new ground state.', 'No.'],
            md`$\Psi$ is unchanged, so $\langle H\rangle = \tfrac{\hbar^2}{2m}\int|\Psi'|^2$ is still the old $E_1 = \pi^2\hbar^2/2ma^2 = 4E_1'$. Sudden changes conserve $\Psi$, not the energy level.`),
          P({
            title: 'Quantum revival',
            q: md`Any state in the infinite well returns exactly to itself after a time $T_{\text{rev}}$. Find the smallest $T_{\text{rev}}$.`,
            parts: [{ lbl: 'T_{\\text{rev}}', expr: '4*m*a^2/(pi*hbar)', vars: { m: [0.5, 2], a: [0.5, 2], hbar: [0.5, 2] } }],
            hints: [md`All phases $e^{-in^2E_1t/\hbar}$ equal 1 when $E_1t/\hbar = 2\pi$.`],
            sol: md`$n^2$ is an integer, so $T = 2\pi\hbar/E_1 = \tfrac{2\pi\hbar\cdot2ma^2}{\pi^2\hbar^2} = \tfrac{4ma^2}{\pi\hbar}$. Integer energy ratios make the motion exactly periodic.`,
          }),
        ],
        bank: [
          Q(md`Why is $n = 0$ not a state of the infinite well?`, [md`$\psi_0 = \sin 0 = 0$ everywhere: not normalizable`, 'It has infinite energy', 'It violates the uncertainty principle only', 'It is allowed; it is the ground state'], 0,
            [null, 'It has zero energy and zero wavefunction.', 'The direct reason is that ψ vanishes.', 'The ground state is n = 1.'], 'No particle at all.'),
          Q(md`$\psi_2$ of a well from 0 to $a$ is, about the center…`, ['antisymmetric', 'symmetric', 'neither', 'zero'], 0,
            [null, md`$\sin(2\pi x/a)$ flips sign across $a/2$.`, 'Definite parity, since the well is symmetric.', 'It has a node there, not everywhere.'], 'One node, at the center.'),
          Q(md`$E_{n+1} - E_n$ grows like…`, [md`$(2n + 1)E_1$`, md`$E_1$`, md`$n^2E_1$`, md`$E_1/n$`], 0,
            [null, 'Spacing is not uniform (that is the oscillator).', md`That is $E_n$ itself.`, 'Grows, not shrinks.'], md`$(n+1)^2 - n^2 = 2n + 1$.`),
          Q(md`⟨p⟩ in any stationary state of the infinite well is…`, ['0', md`$n\pi\hbar/a$`, md`$\sqrt{2mE_n}$`, md`$\hbar/a$`], 0,
            [null, 'That is the magnitude of each traveling component; they cancel.', 'Same magnitude, but the average is zero.', 'No.'], md`$\sin = (e^{ikx} - e^{-ikx})/2i$: equal left and right.`),
          Q(md`Moving the well from $[0, a]$ to $[-a/2, a/2]$ changes…`, ['the formulas for ψₙ but not the energies', 'the energies', 'both', 'nothing'], 0,
            [null, 'Energies depend only on m, a, ħ.', 'Energies are unchanged.', 'The formulas change (sin ↔ cos).'], 'Physics cannot depend on where you put the origin.'),
        ],
      },
    ],
  });
})();

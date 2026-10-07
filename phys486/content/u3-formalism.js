/* Unit 3a — the formalism (Lectures 7–9): Dirac notation and linear algebra, the uncertainty relation. Topics 8–9. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);

  C.unit({
    id: 'u3', exam: 'm1', num: 'Unit 3', title: 'The formalism',
    lessons: [
      // ------------------------------------------------------------------ Topic 8
      {
        id: 't8-dirac', topic: 8, title: 'Dirac notation, operators and bases',
        steps: [
          R(md`
            ### The idea

            Everything so far (wavefunctions, $c_n$'s, operators acting on functions) is linear algebra in disguise. Dirac notation strips the disguise so the same few rules cover every system.

            | Object | Meaning | As a column/row (in a basis) |
            |---|---|---|
            | $\ket\psi$ | the state (ket) | column of components $c_n = \braket{e_n\vert \psi}$ |
            | $\bra\psi$ | its dual (bra) | the **conjugate transpose**: row of $c_n^*$ |
            | $\braket{\phi\vert \psi}$ | inner product, a complex number | $\sum_n\phi_n^*\psi_n$ |
            | $\hat A$ | operator | matrix $A_{mn} = \bra{e_m}\hat A\ket{e_n}$ |
            | $\ket\phi\bra\psi$ | outer product, an operator | column × row |

            Rules: $\braket{\phi|\psi} = \braket{\psi|\phi}^*$; $\braket{\psi|\psi} \ge 0$, zero only for the zero vector; bras are antilinear: $c\ket\psi \to c^*\bra\psi$.

            ### The identity in disguise

            For an orthonormal basis, **completeness** is
            $$\sum_n\ket{e_n}\bra{e_n} = \hat 1$$
            Insert it anywhere. $\ket\psi = \sum_n\ket{e_n}\braket{e_n|\psi}$ is the expansion; $\braket{\phi|\psi} = \sum_n\braket{\phi|e_n}\braket{e_n|\psi}$ is the dot product in components; $\bra\phi\hat A\ket\psi = \sum_{mn}\phi_m^*A_{mn}\psi_n$ is matrix multiplication. Each $\ket{e_n}\bra{e_n}$ is a **projector**: it keeps the component along $\ket{e_n}$ and drops the rest ($\hat P^2 = \hat P$, eigenvalues 0 and 1).
          `),
          R(md`
            ### Hermitian and unitary

            The adjoint $\hat A^\dagger$ is defined by $\bra\phi\hat A^\dagger\ket\psi = \bra\psi\hat A\ket\phi^*$: as a matrix, the conjugate transpose. $(\hat A\hat B)^\dagger = \hat B^\dagger\hat A^\dagger$ (reverse order).

            - **Hermitian** $\hat A^\dagger = \hat A$: real eigenvalues, orthogonal eigenvectors, a complete eigenbasis, real expectation values. Observables. In that eigenbasis, $\hat A = \sum_n a_n\ket{a_n}\bra{a_n}$ (spectral decomposition), and any function is $f(\hat A) = \sum_n f(a_n)\ket{a_n}\bra{a_n}$.
            - **Unitary** $\hat U^\dagger\hat U = \hat 1$: preserves every inner product, so lengths and probabilities. Eigenvalues have $|\lambda| = 1$. Changes of basis and time evolution, $\hat U(t) = e^{-i\hat Ht/\hbar}$, are unitary.

            Useful facts (HW 4): products of unitaries are unitary; sums need not be. Sums of Hermitians are Hermitian; a product $\hat A\hat B$ is Hermitian only if $[\hat A, \hat B] = 0$, since $(\hat A\hat B)^\dagger = \hat B\hat A$. The trace is the sum of eigenvalues, the determinant their product.

            ### Commutators

            $[\hat A, \hat B] = \hat A\hat B - \hat B\hat A$. Order matters for operators. The fundamental one, from $\hat p = -i\hbar\partial_x$ acting on a test function: $[\hat x, \hat p] = i\hbar$. Then use $[\hat A, \hat B\hat C] = [\hat A, \hat B]\hat C + \hat B[\hat A, \hat C]$: $[\hat x, \hat p^2] = 2i\hbar\hat p$, $[\hat x^2, \hat p] = 2i\hbar\hat x$, $[\hat H, \hat x] = -i\hbar\hat p/m$.

            ### Continuous bases: $\ket x$ and $\ket p$

            Same rules with integrals and deltas: $\braket{x|x'} = \delta(x - x')$, $\int\ket x\bra x\,dx = \hat 1$. The wavefunction is just the component: $\Psi(x) = \braket{x|\Psi}$. The momentum eigenstates in position space are the plane waves
            $$\braket{x|p} = \frac{e^{ipx/\hbar}}{\sqrt{2\pi\hbar}}, \qquad \Phi(p) = \braket{p|\Psi} = \frac{1}{\sqrt{2\pi\hbar}}\int e^{-ipx/\hbar}\Psi(x)\,dx$$
            $\Phi(p)$ is the momentum-space wavefunction: $|\Phi(p)|^2dp$ is the probability of momentum in $[p, p + dp]$. Switching between $\Psi(x)$ and $\Phi(p)$ is a change of basis, which is all the Fourier transform ever was. In position space $\hat p \to -i\hbar\partial_x$; in momentum space $\hat x \to i\hbar\partial_p$.
          `),
          R(md`
            ### Worked example

            !!graded Problem
              $\hat A = \begin{pmatrix}2 & 1 - i\\ 1 + i & 3\end{pmatrix}$ in the orthonormal basis $\{\ket1, \ket2\}$. Is it Hermitian? Find its eigenvalues and normalized eigenvectors. The system is in $\ket1$; what are the probabilities of each outcome, and $\langle A\rangle$?

            **Hermitian?** Transpose and conjugate: the off-diagonals $1 - i$ and $1 + i$ swap into each other's conjugates, and the diagonal is real. Yes.

            **Eigenvalues.** $\text{tr} = 5$, $\det = 6 - |1 - i|^2 = 4$, so $\lambda^2 - 5\lambda + 4 = 0$: $\lambda = 4, 1$. Real, as promised.

            **Eigenvectors.** For $\lambda = 4$: $-2x + (1 - i)y = 0 \Rightarrow y = (1 + i)x$, so $\ket{a_4} = \tfrac{1}{\sqrt3}\begin{pmatrix}1\\1 + i\end{pmatrix}$. For $\lambda = 1$: $x + (1 - i)y = 0$, so $\ket{a_1} = \tfrac{1}{\sqrt3}\begin{pmatrix}1 - i\\-1\end{pmatrix}$. Check orthogonality: $\tfrac13\left[1\cdot(1 - i) + (1 - i)(-1)\right] = 0$ ✓.

            **Born.** $P(4) = |\braket{a_4|1}|^2 = \tfrac13$, $P(1) = \tfrac23$. $\langle A\rangle = \tfrac43 + \tfrac23 = 2 = A_{11}$ ✓ (the diagonal element is the expectation value in a basis state).

            !!mistake Common mistakes
              - Forgetting to conjugate when turning a ket into a bra: $\braket{a_4|1}$ uses the *conjugated* components of $\ket{a_4}$.
              - Calling a matrix Hermitian because it is symmetric. $\begin{pmatrix}0 & i\\ i & 0\end{pmatrix}$ is symmetric but not Hermitian.
              - Reversing order wrong: $(\hat A\hat B)^\dagger = \hat B^\dagger\hat A^\dagger$, and $(\ket\alpha\bra\beta)^\dagger = \ket\beta\bra\alpha$.
              - Treating $\braket{x|p}$ as normalizable; like $\braket{x|x'}$, it is delta-normalized.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`$\braket{\phi|\psi} = 2 + 3i$. Then $\braket{\psi|\phi} = $?`, [md`$2 - 3i$`, md`$2 + 3i$`, md`$-2 - 3i$`, md`$3 + 2i$`], 0,
            [null, 'Swapping bra and ket conjugates.', 'No sign flip on the real part.', 'No.'], md`$\braket{\psi|\phi} = \braket{\phi|\psi}^*$.`),
          Q(md`$(\hat A\hat B)^\dagger$ equals…`, [md`$\hat B^\dagger\hat A^\dagger$`, md`$\hat A^\dagger\hat B^\dagger$`, md`$\hat A\hat B$`, md`$\hat B\hat A$`], 0,
            [null, 'Order reverses.', 'Only if AB is Hermitian.', 'Only if both are Hermitian.'], 'Like the transpose of a product.'),
          L(2, 'set up'),
          P({
            title: 'Inner products',
            q: md`$\ket\alpha = \begin{pmatrix}1\\ i\end{pmatrix}$, $\ket\beta = \begin{pmatrix}i\\ 2\end{pmatrix}$. Find $|\braket{\alpha|\beta}|^2$ and check it against $\braket{\alpha|\alpha}\braket{\beta|\beta}$ (Cauchy–Schwarz).`,
            parts: [{ lbl: '|\\langle\\alpha|\\beta\\rangle|^2', ans: 1 }, { lbl: '\\langle\\alpha|\\alpha\\rangle\\langle\\beta|\\beta\\rangle', ans: 10 }],
            hints: [md`$\bra\alpha = (1,\ -i)$.`],
            sol: md`$\braket{\alpha|\beta} = 1\cdot i + (-i)\cdot2 = -i$, so $|\cdot|^2 = 1$. $\braket{\alpha|\alpha} = 2$, $\braket{\beta|\beta} = 5$: $1 \le 10$ ✓.`,
          }),
          Q(md`Which matrix is Hermitian?`,
            [md`$\begin{pmatrix}1 & -2i\\ 2i & 0\end{pmatrix}$`, md`$\begin{pmatrix}1 & 2i\\ 2i & 0\end{pmatrix}$`, md`$\begin{pmatrix}i & 0\\ 0 & 1\end{pmatrix}$`, md`$\begin{pmatrix}0 & 1\\ -1 & 0\end{pmatrix}$`], 0,
            [null, 'Symmetric, not Hermitian: the conjugate of 2i is −2i.', 'Diagonal entries of a Hermitian matrix are real.', 'Antisymmetric real: anti-Hermitian.'],
            md`$A_{21} = A_{12}^*$: $(−2i)^* = 2i$ ✓, diagonal real ✓.`),
          L(3, 'standard'),
          P({
            title: 'Eigenvalues by trace and determinant',
            q: md`Find the eigenvalues of $\begin{pmatrix}1 & 1\\ 1 & 1\end{pmatrix}$ and of $\begin{pmatrix}0 & -i\\ i & 0\end{pmatrix}$. Enter the larger eigenvalue of each.`,
            parts: [{ lbl: '\\lambda_{\\max}\\ (\\text{first})', ans: 2 }, { lbl: '\\lambda_{\\max}\\ (\\text{second})', ans: 1 }],
            hints: [md`$\lambda_1 + \lambda_2 = \text{tr}$, $\lambda_1\lambda_2 = \det$.`],
            sol: md`First: tr 2, det 0 → $0, 2$. Second ($\sigma_y$): tr 0, det $-1$ → $\pm1$.`,
          }),
          Q(md`$[\hat x, \hat p^2] = $?`, [md`$2i\hbar\hat p$`, md`$i\hbar$`, md`$-2i\hbar\hat p$`, md`$2i\hbar\hat x$`], 0,
            [null, 'That is [x, p].', 'Sign: [x,p]p + p[x,p] = 2iħp.', md`That is $[\hat x^2, \hat p]$.`],
            md`$[\hat x, \hat p\hat p] = [\hat x, \hat p]\hat p + \hat p[\hat x, \hat p] = 2i\hbar\hat p$.`),
          Q(md`Gram–Schmidt on $\ket{e_1} = (1, 1)$, $\ket{e_2} = (1, 0)$ gives second vector…`,
            [md`$\tfrac1{\sqrt2}(1, -1)$`, md`$(1, 0)$`, md`$\tfrac1{\sqrt2}(1, 1)$`, md`$(0, 1)$`], 0,
            [null, 'Not orthogonal to (1,1).', 'That is the first vector.', 'Orthogonal to (1,0), not to (1,1).'],
            md`$\ket{e_1'} = \tfrac1{\sqrt2}(1,1)$; $\ket{e_2} - \braket{e_1'|e_2}\ket{e_1'} = (1,0) - \tfrac12(1,1) = \tfrac12(1, -1)$; normalize.`),
          L(4, 'one twist'),
          Q(md`$\hat P = \ket e\bra e$ with $\braket{e|e} = 1$. Its eigenvalues are…`, ['0 and 1', '1 only', '±1', 'any real number'], 0,
            [null, md`Vectors orthogonal to $\ket e$ give 0.`, 'That is a reflection.', md`$\hat P^2 = \hat P$ forces $\lambda^2 = \lambda$.`],
            md`$\hat P\ket e = \ket e$; $\hat P\ket{e_\perp} = 0$.`),
          Q(md`$\hat A$ and $\hat B$ are Hermitian. $\hat A\hat B$ is Hermitian…`, ['if and only if they commute', 'always', 'never', 'if both are also unitary'], 0,
            [null, md`$(\hat A\hat B)^\dagger = \hat B\hat A$, which differs from $\hat A\hat B$ unless they commute.`, 'It is when they commute.', 'Unitarity is irrelevant.'],
            md`$(\hat A\hat B)^\dagger = \hat B\hat A = \hat A\hat B$ exactly when $[\hat A, \hat B] = 0$.`),
          Q(md`Using spectral decomposition, $e^{i\theta\hat X}$ for $\hat X = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$ is…`,
            [md`$\cos\theta\,\hat 1 + i\sin\theta\,\hat X$`, md`$\begin{pmatrix}e^{i\theta} & 0\\ 0 & e^{i\theta}\end{pmatrix}$`, md`$\begin{pmatrix}1 & e^{i\theta}\\ e^{i\theta} & 1\end{pmatrix}$`, md`$\hat 1 + i\theta\hat X$`], 0,
            [null, md`Eigenvalues are $\pm1$, so phases $e^{\pm i\theta}$, not both $e^{i\theta}$.`, 'You cannot exponentiate matrix entries.', 'That is only the first-order term.'],
            md`$\hat X = \ket+\bra+ - \ket-\bra-$, so $e^{i\theta\hat X} = e^{i\theta}\ket+\bra+ + e^{-i\theta}\ket-\bra- = \cos\theta(\ket+\bra+ + \ket-\bra-) + i\sin\theta\,\hat X$. Or: $\hat X^2 = \hat 1$ in the power series.`),
          L(5, 'exam level'),
          P({
            title: 'Born rule with a matrix',
            q: md`For $\hat A = \begin{pmatrix}2 & 1 - i\\ 1 + i & 3\end{pmatrix}$, the system is in $\ket\psi = \tfrac{1}{\sqrt2}(\ket1 + \ket2)$. Find $P(4)$ and $\langle A\rangle$.`,
            parts: [{ lbl: 'P(4)', ans: 5 / 6 }, { lbl: '\\langle A\\rangle', ans: 3.5 }],
            hints: [md`$\ket{a_4} = \tfrac1{\sqrt3}(1, 1 + i)$. $\braket{a_4|\psi} = \tfrac{1}{\sqrt6}\left[1 + (1 - i)\right]$.`, md`$\langle A\rangle = \bra\psi\hat A\ket\psi = \tfrac12(A_{11} + A_{12} + A_{21} + A_{22})$.`],
            sol: md`$\braket{a_4|\psi} = \tfrac{2 - i}{\sqrt6}$, so $P(4) = \tfrac56$, $P(1) = \tfrac16$. $\langle A\rangle = \tfrac56\cdot4 + \tfrac16\cdot1 = \tfrac{21}{6} = 3.5$. Directly: $\tfrac12(2 + (1 - i) + (1 + i) + 3) = 3.5$ ✓.`,
          }),
          Q(md`A particle is in the infinite-well ground state $\psi_1(x) = \sqrt{2/a}\sin(\pi x/a)$. Its momentum-space wavefunction $|\Phi_1(p)|^2$ is…`,
            [md`a broad distribution peaked near $p = \pm\pi\hbar/a$ (merged into one bump for $n = 1$), with width $\sim\hbar/a$`, md`two delta functions at $p = \pm\pi\hbar/a$`, md`a delta function at $p = 0$`, 'zero, because ⟨p⟩ = 0'], 0,
            [null, 'That would need an infinitely long sine; the walls cut it off, broadening the peaks.', md`$\psi_1$ is not a plane wave.`, md`$\langle p\rangle = 0$ is an average; $p^2$ is not zero.`],
            md`$\sin(\pi x/a) \propto e^{i\pi x/a} - e^{-i\pi x/a}$, but only on $[0, a]$: each peak gets width $\sim 2\pi\hbar/a$, enough to blur the two into one for small $n$. Higher $n$: two clear peaks at $\pm n\pi\hbar/a$.`),
          L(6, 'harder than the exam'),
          Q(md`In momentum space, which operator represents $\hat x$?`, [md`$i\hbar\,\partial_p$`, md`$-i\hbar\,\partial_p$`, md`$p$`, md`$\hbar\,\partial_p$`], 0,
            [null, md`Sign: check $[\hat x, \hat p] = i\hbar$ with $\hat p = p$.`, 'That is p.', 'Not Hermitian.'],
            md`With $\hat p \to p$: $[i\hbar\partial_p, p]f = i\hbar f$ ✓. (Or: $\braket{p|x} = e^{-ipx/\hbar}/\sqrt{2\pi\hbar}$ and $i\hbar\partial_p$ pulls down $x$.)`),
          Q(md`A unitary $\hat U$ has an eigenvector $\ket v$ with eigenvalue $\lambda$. Then…`, [md`$|\lambda| = 1$`, md`$\lambda$ is real`, md`$\lambda = \pm1$`, md`$\lambda = 0$ or 1`], 0,
            [null, md`Real is for Hermitian; $e^{i\theta}$ is allowed.`, 'Only if also Hermitian.', 'That is a projector.'],
            md`$\braket{v|v} = \bra v\hat U^\dagger\hat U\ket v = |\lambda|^2\braket{v|v}$.`),
          Q(md`Is the sum of two unitary operators unitary?`, ['not in general', 'always', 'only if they commute', 'only in 2-D'], 0,
            [null, md`$\hat 1 + \hat 1 = 2\hat 1$ is not unitary.`, md`Commuting does not help: $2\hat 1$.`, 'Dimension is irrelevant.'],
            md`Counterexample $\hat 1 + \hat 1$. Products are unitary; sums are not.`),
        ],
        bank: [
          Q(md`The matrix element $A_{mn}$ in basis $\{\ket{e_n}\}$ is…`, [md`$\bra{e_m}\hat A\ket{e_n}$`, md`$\bra{e_n}\hat A\ket{e_m}$`, md`$\braket{e_m|e_n}$`, md`$\bra{e_m}\hat A^\dagger\ket{e_n}$`], 0,
            [null, md`That is $A_{nm}$.`, md`That is $\delta_{mn}$.`, md`That is $A_{nm}^*$.`], 'Row m, column n.'),
          Q(md`$(\ket\alpha\bra\beta)^\dagger = $?`, [md`$\ket\beta\bra\alpha$`, md`$\ket\alpha\bra\beta$`, md`$\braket{\beta|\alpha}$`, md`$\bra\alpha\ket\beta$`], 0,
            [null, 'Swap and conjugate.', 'That is a number.', 'Not an operator.'], 'Reverse order, daggers on each.'),
          Q(md`$\braket{x|x'}$ equals…`, [md`$\delta(x - x')$`, '1', md`$e^{ixx'}$`, '0'], 0,
            [null, 'Only discrete bases have Kronecker 1.', 'That is ⟨x|p⟩-like.', 'Not for x = x′.'], 'Delta-normalized.'),
          Q(md`Expectation values of a Hermitian operator are…`, ['real', 'imaginary', 'positive', 'eigenvalues'], 0,
            [null, 'No.', 'Can be negative.', 'Averages, not single values.'], md`$\langle A\rangle^* = \langle A^\dagger\rangle = \langle A\rangle$.`),
          Q(md`The trace of a Hermitian matrix equals…`, ['the sum of its eigenvalues', 'the product of its eigenvalues', 'its largest eigenvalue', 'zero'], 0,
            [null, 'That is the determinant.', 'No.', 'Only for traceless ones like Pauli matrices.'], 'Basis-independent.'),
        ],
      },

      // ------------------------------------------------------------------ Topic 9
      {
        id: 't9-uncertainty', topic: 9, title: 'The uncertainty relation',
        steps: [
          R(md`
            ### The idea

            If two observables share a complete set of eigenstates, a state can be an eigenstate of both, and both are sharp. If they don't, sharpening one blurs the other. The commutator measures how badly they clash:
            $$\sigma_A^2\sigma_B^2 \ge \left(\frac{1}{2i}\left\langle[\hat A, \hat B]\right\rangle\right)^2$$
            The right side is real and $\ge 0$ ($[\hat A, \hat B]$ is anti-Hermitian, so its average is imaginary). For $\hat x$ and $\hat p$, $[\hat x, \hat p] = i\hbar$ is a number, so the bound is the same in every state:
            $$\sigma_x\sigma_p \ge \frac\hbar2$$

            **What it means.** $\sigma_x$ and $\sigma_p$ are spreads over an ensemble of identical preparations: measure $x$ on half of them, $p$ on the other half. No state makes both spreads small. It is a property of the state (a wave cannot be both localized and of one wavelength), not a statement about clumsy apparatus.

            **Compatible observables** ($[\hat A, \hat B] = 0$) have a common eigenbasis: the bound is 0 and both can be sharp at once (e.g. $\hat p$ and $\hat H$ for a free particle).
          `),
          R(md`
            ### Where it comes from (two lines)

            Let $\ket f = (\hat A - \langle A\rangle)\ket\psi$ and $\ket g = (\hat B - \langle B\rangle)\ket\psi$, so $\sigma_A^2 = \braket{f|f}$, $\sigma_B^2 = \braket{g|g}$. Schwarz: $\braket{f|f}\braket{g|g} \ge |\braket{f|g}|^2 \ge (\text{Im}\braket{f|g})^2$, and $\text{Im}\braket{f|g} = \tfrac{1}{2i}(\braket{f|g} - \braket{g|f}) = \tfrac{1}{2i}\langle[\hat A, \hat B]\rangle$.

            Equality needs $\ket g \propto i\ket f$ with a real factor; for $x$ and $p$ that ODE gives a **Gaussian**. So Gaussians are the minimum-uncertainty states, and only at the moment they are narrowest (a free Gaussian spreads and leaves the limit).

            ### Energy and time

            Time is a parameter, not an operator, so there is no $[\hat t, \hat H]$. The energy–time relation is instead about how fast things change. For any observable $Q$,
            $$\frac{d\langle Q\rangle}{dt} = \frac{i}{\hbar}\left\langle[\hat H, \hat Q]\right\rangle + \left\langle\frac{\partial\hat Q}{\partial t}\right\rangle \quad\Longrightarrow\quad \sigma_H\,\Delta t \ge \frac\hbar2, \qquad \Delta t \equiv \frac{\sigma_Q}{|d\langle Q\rangle/dt|}$$
            $\Delta t$ is the time for $\langle Q\rangle$ to move by one standard deviation. A stationary state ($\sigma_H = 0$) never changes; a state that changes fast must have a big energy spread. The first formula also says: if $\hat Q$ commutes with $\hat H$ (and has no explicit $t$), $\langle Q\rangle$ is conserved.

            ### Using it to estimate

            Replace $p$ by $\sigma_p \sim \hbar/2\sigma_x$ in the energy and minimize over $\sigma_x$. Confinement to size $L$ costs kinetic energy $\sim\hbar^2/(8mL^2)$; this is why atoms don't collapse and why ground states have zero-point energy.
          `),
          R(md`
            ### Worked example

            !!graded Problem
              Estimate the ground-state energy of the harmonic oscillator $V = \tfrac12m\omega^2x^2$ from the uncertainty relation.

            Take $\langle x\rangle = \langle p\rangle = 0$ (anything else only adds energy), so $\langle x^2\rangle = \sigma_x^2$ and $\langle p^2\rangle = \sigma_p^2 \ge \hbar^2/4\sigma_x^2$:
            $$\langle H\rangle = \frac{\sigma_p^2}{2m} + \frac12m\omega^2\sigma_x^2 \ge \frac{\hbar^2}{8m\sigma_x^2} + \frac12m\omega^2\sigma_x^2$$
            Minimize over $s = \sigma_x^2$: $-\tfrac{\hbar^2}{8ms^2} + \tfrac12m\omega^2 = 0 \Rightarrow s = \tfrac{\hbar}{2m\omega}$. Then
            $$\langle H\rangle \ge \frac{\hbar\omega}{4} + \frac{\hbar\omega}{4} = \frac12\hbar\omega$$
            That is the exact ground energy, because the true ground state is a Gaussian, which saturates the bound. The squeezing (kinetic) and the spring (potential) energies split it equally.

            !!mistake Common mistakes
              - Reading $\sigma_x\sigma_p \ge \hbar/2$ as "measuring $x$ disturbs $p$". It bounds the spreads of a state.
              - Writing the bound as $\tfrac12|\langle[\hat A, \hat B]\rangle|$ but forgetting it is state-dependent unless the commutator is a number.
              - Treating $t$ as an operator. $\Delta t$ is a characteristic time of the state.
              - Thinking any nonzero commutator forbids $\sigma_A = 0$. The bound uses the *average* commutator, which can vanish.

            ### Questions
          `),
          L(1, 'recognize'),
          Q(md`$[\hat A, \hat B] = 0$. Then…`, ['there is a basis of states with both A and B sharp', 'σ_Aσ_B = 0 in every state', 'A and B are the same observable', 'measuring A changes B'], 0,
            [null, 'The bound is 0; a generic state still has spread in both.', 'Different observables can commute (p and H, free).', 'Commuting means compatible.'],
            'Compatible observables share eigenstates.'),
          Q(md`$\sigma_x\sigma_p \ge \hbar/2$ means…`,
            ['no state has both a narrow position distribution and a narrow momentum distribution', 'measuring x always disturbs p by ħ/2', 'x and p can never be measured', 'the particle has a definite x and p that we cannot know'], 0,
            [null, 'It is about the spreads in a state, not measurement kicks.', 'Each can be measured; just not both sharp in one state.', 'There are no hidden definite values (that is what the qubit and Bell tests show).'],
            'A property of the wave itself.'),
          L(2, 'set up'),
          P({
            title: 'Confinement energy',
            q: md`An electron is localized to $\sigma_x = 0.1$ nm. Using $\langle p^2\rangle \ge \sigma_p^2 \ge (\hbar/2\sigma_x)^2$, find the minimum average kinetic energy in eV.`,
            parts: [{ lbl: '\\langle K\\rangle_{\\min}', ans: 0.9525, unit: 'eV' }],
            hints: [md`$\langle K\rangle \ge \hbar^2/(8m\sigma_x^2)$.`],
            sol: md`$\tfrac{(1.055\times10^{-34})^2}{8(9.109\times10^{-31})(10^{-10})^2} = 1.53\times10^{-19}$ J $= 0.95$ eV. Atomic energies are eV-sized for this reason.`,
          }),
          Q(md`The bound on $\sigma_x\sigma_p$ is…`, [md`$\hbar/2$ in every state`, md`$\hbar/2$ only in stationary states`, md`$\tfrac12|\langle\hat x\hat p\rangle|$`, 'zero for real wavefunctions'], 0,
            [null, md`$[\hat x, \hat p] = i\hbar$ is a constant, so the bound never changes.`, 'Not a general simplification.', 'Real ψ still has σx σp ≥ ħ/2.'],
            md`$\left(\tfrac{1}{2i}i\hbar\right)^2 = \hbar^2/4$.`),
          L(3, 'standard'),
          P({
            title: 'Natural linewidth',
            q: md`An excited atomic state lives $\tau = 10$ ns. Estimate the minimum energy spread $\hbar/2\tau$ in eV.`,
            parts: [{ lbl: '\\Delta E', ans: 3.291e-8, unit: 'eV' }],
            hints: [md`$\hbar = 6.582\times10^{-16}$ eV·s.`],
            sol: md`$\Delta E = \tfrac{6.582\times10^{-16}}{2\times10^{-8}} = 3.3\times10^{-8}$ eV. Short-lived states have broad lines.`,
          }),
          Q(md`From $\tfrac{d\langle Q\rangle}{dt} = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle$ with $\hat Q = \hat x$ and $\hat H = \hat p^2/2m + V$, you get…`,
            [md`$d\langle x\rangle/dt = \langle p\rangle/m$`, md`$d\langle x\rangle/dt = 0$`, md`$d\langle x\rangle/dt = -\langle V'\rangle$`, md`$d\langle x\rangle/dt = \langle p^2\rangle/2m$`], 0,
            [null, 'x does not commute with p².', 'That is d⟨p⟩/dt.', 'Units: that is an energy.'],
            md`$[\hat H, \hat x] = \tfrac{1}{2m}[\hat p^2, \hat x] = -\tfrac{i\hbar}{m}\hat p$, times $i/\hbar$: $\langle p\rangle/m$. Ehrenfest falls out of the general formula.`),
          L(4, 'one twist'),
          P({
            title: 'Energy spread of a superposition',
            q: md`$\Psi = \tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$ with energies $E_1, E_2$. Find $\sigma_H$.`,
            parts: [{ lbl: '\\sigma_H', expr: '(E2 - E1)/2', vars: { E1: [0.5, 2], E2: [2.5, 6] } }],
            hints: [md`$\langle H\rangle = \tfrac{E_1 + E_2}2$, $\langle H^2\rangle = \tfrac{E_1^2 + E_2^2}{2}$.`],
            sol: md`$\sigma_H^2 = \tfrac{E_1^2 + E_2^2}{2} - \tfrac{(E_1 + E_2)^2}{4} = \tfrac{(E_2 - E_1)^2}{4}$, so $\sigma_H = \tfrac{E_2 - E_1}{2}$. Then $\Delta t \ge \hbar/(E_2 - E_1)$: about the period of the sloshing over $2\pi$. Consistent.`,
          }),
          Q(md`In the qubit state $\ket0$ (eigenstate of $\sigma_z$), the bound for $\sigma_x$ and $\sigma_z$ uses $[\sigma_z, \sigma_x] = 2i\sigma_y$. Which is right?`,
            [md`The bound is $|\langle\sigma_y\rangle| = 0$, and indeed $\Delta\sigma_z = 0$`, md`The bound is 1, so $\Delta\sigma_z\,\Delta\sigma_x \ge 1$`, 'The commutator is nonzero, so neither spread can vanish', md`The bound is $\langle\sigma_z\rangle = 1$`], 0,
            [null, md`$\langle0|\sigma_y|0\rangle = 0$.`, 'The bound uses the average commutator, which vanishes here.', 'Wrong commutator.'],
            md`$\Delta\sigma_z\Delta\sigma_x \ge |\langle\sigma_y\rangle| = 0$: no contradiction with $\Delta\sigma_z = 0$, $\Delta\sigma_x = 1$.`),
          L(5, 'exam level'),
          P({
            title: 'Oscillator from uncertainty',
            q: md`Using $\langle H\rangle \ge \tfrac{\hbar^2}{8m\sigma^2} + \tfrac12m\omega^2\sigma^2$, find the minimum over $\sigma$.`,
            parts: [{ lbl: 'E_{\\min}', expr: 'hbar*omega/2', vars: { hbar: [0.5, 2], omega: [0.5, 2], m: [0.5, 2] } }],
            hints: [md`Minimize over $s = \sigma^2$.`],
            sol: md`$s = \hbar/2m\omega$ gives $\tfrac{\hbar\omega}{4} + \tfrac{\hbar\omega}{4} = \tfrac12\hbar\omega$. Exact, because the ground state is Gaussian.`,
          }),
          Q(md`For $\hat A = \hat x$, $\hat B = \hat H = \tfrac{\hat p^2}{2m} + V(\hat x)$, the generalized bound gives…`,
            [md`$\sigma_x\sigma_H \ge \tfrac{\hbar}{2m}|\langle p\rangle|$`, md`$\sigma_x\sigma_H \ge \hbar/2$`, md`$\sigma_x\sigma_H \ge \tfrac\hbar2|\langle V'\rangle|$`, md`$\sigma_x\sigma_H \ge 0$ only`], 0,
            [null, md`$[\hat x, \hat H]$ is not a constant.`, 'V(x) commutes with x.', 'True but weaker: the bound has content when ⟨p⟩ ≠ 0.'],
            md`$[\hat x, \hat H] = \tfrac{i\hbar}{m}\hat p$, so $\left(\tfrac{1}{2i}\cdot\tfrac{i\hbar}{m}\langle p\rangle\right)^2$. In a stationary state $\langle p\rangle = 0$ and $\sigma_H = 0$: consistent.`),
          L(6, 'harder than the exam'),
          P({
            title: 'Why atoms are stable',
            q: md`Model the hydrogen energy as $E(r) = \dfrac{\hbar^2}{2mr^2} - \dfrac{kq^2}{r}$ (kinetic cost of confinement to size $r$, plus Coulomb). Minimize. Enter $r_{\min}$ and $E_{\min}$.`,
            parts: [
              { lbl: 'r_{\\min}', expr: 'hbar^2/(m*k*q^2)', vars: { hbar: [0.5, 2], m: [0.5, 2], k: [0.5, 2], q: [0.5, 2] } },
              { lbl: 'E_{\\min}', expr: '-m*k^2*q^4/(2*hbar^2)', vars: { hbar: [0.5, 2], m: [0.5, 2], k: [0.5, 2], q: [0.5, 2] } },
            ],
            hints: [md`$dE/dr = -\hbar^2/mr^3 + kq^2/r^2 = 0$.`],
            sol: md`$r = \tfrac{\hbar^2}{mkq^2}$ (the Bohr radius, 0.053 nm), $E = \tfrac{mk^2q^4}{2\hbar^2} - \tfrac{mk^2q^4}{\hbar^2} = -\tfrac{mk^2q^4}{2\hbar^2} = -13.6$ eV. Classically $E \to -\infty$ as $r \to 0$; the $1/r^2$ confinement cost beats the $1/r$ Coulomb gain at small $r$.`,
          }),
          Q(md`Can a normalizable state have $\sigma_x = 0$?`,
            ['No: it would be a delta function, not normalizable, with σ_p = ∞', 'Yes, any position eigenstate', 'Yes, in the infinite well ground state', 'Only if ⟨p⟩ = 0'], 0,
            [null, md`$\ket x$ has $\braket{x|x} = \delta(0)$: not a normalizable state.`, 'σx = a/√… > 0 there.', 'Irrelevant.'],
            md`$\sigma_x\sigma_p \ge \hbar/2$ with $\sigma_x \to 0$ forces $\sigma_p \to \infty$; the delta is a limit, not a state.`),
          Q(md`A free Gaussian packet saturates $\sigma_x\sigma_p = \hbar/2$ at $t = 0$. What would a measurement of $\langle xp + px\rangle$ (the position-momentum correlation) show as it spreads?`,
            ['It grows from 0: fast components run ahead, correlating x with p', 'It stays 0 forever', 'It oscillates', 'It is undefined for Gaussians'], 0,
            [null, 'Spreading builds correlation.', 'Free motion is not periodic.', 'Well defined.'],
            md`$\tfrac{d}{dt}\langle xp + px\rangle = \tfrac{2\langle p^2\rangle}{m}$ for a free particle (via $\tfrac i\hbar[\hat H, \cdot]$). The correlation term is what pushes $\sigma_x\sigma_p$ above the minimum: the Schrödinger–Robertson bound includes it.`),
        ],
        bank: [
          Q(md`Which pair is compatible for a free particle?`, [md`$\hat p$ and $\hat H$`, md`$\hat x$ and $\hat p$`, md`$\hat x$ and $\hat H$`, md`$\hat x^2$ and $\hat p$`], 0,
            [null, 'iħ.', 'Does not commute.', '2iħx.'], md`$\hat H = \hat p^2/2m$ commutes with $\hat p$.`),
          Q(md`Minimum-uncertainty (σₓσₚ = ħ/2) states are…`, ['Gaussians', 'sine waves', 'plane waves', 'delta functions'], 0,
            [null, 'Product > ħ/2.', 'Not normalizable.', 'Not normalizable.'], 'Equality condition gives a Gaussian.'),
          Q(md`A stationary state has $\sigma_H = $?`, ['0', 'ħ/2', '∞', '⟨H⟩'], 0,
            [null, 'That is for x and p.', 'No.', 'Spread, not mean.'], 'Definite energy.'),
          Q(md`If $[\hat H, \hat Q] = 0$ and $\hat Q$ has no explicit time dependence, then…`, [md`$\langle Q\rangle$ is constant in every state`, md`$\langle Q\rangle = 0$`, md`$\sigma_Q = 0$`, md`$Q$ is the energy`], 0,
            [null, 'Constant, not zero.', 'Spread can be anything, but constant.', 'Many operators commute with H.'], 'Conserved quantity.'),
        ],
      },
    ],
  });
})();

/* The real Fall 2022 Midterm 1 (problems restated), fully worked, plus two variants with the same structure and new
   numbers, and drill questions modeled on its short-answer parts. Put at the front of Unit 6. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const u6 = COURSE.units.find((u) => u.id === 'u6');

  const past = {
    id: 'past2022', title: 'Past midterm: October 2022', kind: 'exam',
    steps: [
      R(md`
        **The real thing.** PHYS 486 Midterm 1 from October 4, 2022: three problems (30 + 35 + 35 points), with the infinite-well formulas and $O_{ij} = \bra i\hat O\ket j$ given on the exam. Do it first, timed (about 50–60 minutes), before anything else in this unit: it tells you the level.

        **What it shows about the exam.** It is shorter and more direct than Practice midterms 4–10. Every part is one of: normalize and read probabilities; write a matrix from bra-kets and diagonalize it; change basis; time-evolve with phases; insert completeness; explain a concept in one or two sentences. If Practice midterms 1–3 feel comfortable, you are above this level.
      `),
      {
        t: 'paper',
        html: '<div class="pp-title"><span>PHYS 486 · Midterm 1 · Oct 4, 2022</span><span>100 pts</span></div>',
        items: [
          {
            q: md`**Problem 1 (30 pts).** A particle in the infinite well is in $\ket\psi = A\left(\ket{\psi_1} + i\ket{\psi_2}\right)$ (ground and first excited states, each normalized). (1) Find $A$. (2) Find $\braket{\psi_2|\psi}$. (3) Energy measurement: outcomes and probabilities. (4) The wavefunction $\psi(x) = \braket{x|\psi}$. (5) $\Psi(x, t)$ if this is the state at $t = 0$. (6) The probability of finding the particle at $x$ at time $t$.`,
            ans: md`(1) $A = \tfrac{1}{\sqrt2}$. (2) $\tfrac{i}{\sqrt2}$. (3) $E_1$ or $E_2$, probability $\tfrac12$ each. (4) $\psi = \tfrac{1}{\sqrt a}\left[\sin\tfrac{\pi x}{a} + i\sin\tfrac{2\pi x}{a}\right]$. (5) $\Psi = \tfrac{1}{\sqrt a}\left[\sin\tfrac{\pi x}{a}e^{-iE_1t/\hbar} + i\sin\tfrac{2\pi x}{a}e^{-iE_2t/\hbar}\right]$. (6) $|\Psi|^2dx$ with $|\Psi|^2 = \tfrac1a\left[\sin^2\tfrac{\pi x}{a} + \sin^2\tfrac{2\pi x}{a} + 2\sin\tfrac{\pi x}{a}\sin\tfrac{2\pi x}{a}\sin\omega t\right]$, $\omega = \tfrac{E_2 - E_1}{\hbar} = \tfrac{3\pi^2\hbar}{2ma^2}$.`,
            sol: md`
              **How to see it.** Orthonormal basis states: everything is reading coefficients. The only places to slip are the conjugate in a bra and giving each energy its own phase.

              **(1)** $\braket{\psi|\psi} = |A|^2(1 + |i|^2) = 2|A|^2 = 1$.

              **(2)** $\braket{\psi_2|\psi} = A\left(\braket{\psi_2|\psi_1} + i\braket{\psi_2|\psi_2}\right) = iA = \tfrac{i}{\sqrt2}$. (Orthonormality kills the first term.)

              **(3)** $P(E_n) = |\braket{\psi_n|\psi}|^2$: $|A|^2 = \tfrac12$ and $|iA|^2 = \tfrac12$. The $i$ does not change probabilities.

              **(4)** Insert $\braket{x|\psi_n} = \psi_n(x) = \sqrt{2/a}\sin(n\pi x/a)$; $\tfrac{1}{\sqrt2}\sqrt{\tfrac2a} = \tfrac{1}{\sqrt a}$.

              **(5)** Each stationary state carries its own $e^{-iE_nt/\hbar}$, with $E_n = \tfrac{n^2\pi^2\hbar^2}{2ma^2}$.

              **(6)** "Probability at position $x$" means the density: $|\Psi(x,t)|^2dx$ in $[x, x + dx]$. Expand: the cross term is $2\psi_1\psi_2\,\text{Re}\left(ie^{-i\omega t}\right) = 2\psi_1\psi_2\sin\omega t$. The density sloshes at $\omega$; the $i$ makes it start at the center, moving (compare Practice midterm 1, #2).
            `,
          },
          {
            q: md`**Problem 2 (35 pts).** $\hat O = i\left(\ket1\bra2 - \ket2\bra1\right)$. (1) Matrix in the basis $\ket1, \ket2$. (2) Show $\hat O$ is Hermitian. (3) Eigenvalues and normalized eigenvectors. (4) Call them $\ket\alpha$, $\ket\beta$; write $\ket\psi = \tfrac{1}{\sqrt2}(\ket1 + \ket2)$ as $c_1\ket\alpha + c_2\ket\beta$. (5) Measuring $\hat O$ in $\ket\psi$: outcomes and probabilities. (6) $\bra\psi\hat O\ket\psi$.`,
            ans: md`(1) $\begin{pmatrix}0 & i\\ -i & 0\end{pmatrix}$ ($= -\sigma_y$). (2) $O^\dagger = O$. (3) $+1$: $\ket\alpha = \tfrac{1}{\sqrt2}(1, -i)$; $-1$: $\ket\beta = \tfrac{1}{\sqrt2}(1, i)$. (4) $c_1 = \tfrac{1 + i}{2}$, $c_2 = \tfrac{1 - i}{2}$. (5) $\pm1$, $\tfrac12$ each. (6) 0.`,
            sol: md`
              **How to see it.** Bra-ket form → matrix by $O_{ij} = \bra i\hat O\ket j$; then it is a $2\times2$ problem. Recognizing $-\sigma_y$ gives every answer at once.

              **(1)** $O_{12} = \bra1\hat O\ket2 = i\braket{1|1}\braket{2|2} = i$; $O_{21} = -i$; diagonals 0.

              **(2)** Conjugate transpose: swap $O_{12} \leftrightarrow O_{21}$ and conjugate: $(-i)^* = i$ lands at position 12 ✓. Or with bra-kets: $\hat O^\dagger = -i\left(\ket2\bra1 - \ket1\bra2\right) = \hat O$ (the dagger conjugates $i$ and reverses each outer product).

              **(3)** tr 0, det $= 0 - (i)(-i) = -1$: $\lambda = \pm1$. For $+1$: $-x + iy = 0$, $x = iy$, i.e. $(i, 1) \propto (1, -i)$. Check $O(1, -i)^T = (i\cdot(-i), -i) = (1, -i)$ ✓. For $-1$: $(1, i)$. Normalize by $\tfrac{1}{\sqrt2}$. (Any overall phase is equally correct.)

              **(4)** $c_1 = \braket{\alpha|\psi} = \tfrac12\left[1\cdot1 + (-i)^*\cdot1\right] = \tfrac{1 + i}{2}$ (conjugate $\ket\alpha$'s components!); $c_2 = \tfrac{1 - i}{2}$. Check $|c_1|^2 + |c_2|^2 = \tfrac12 + \tfrac12$ ✓.

              **(5)** $+1$ with $|c_1|^2 = \tfrac12$, $-1$ with $\tfrac12$.

              **(6)** $\tfrac12(+1) + \tfrac12(-1) = 0$. Directly: $\tfrac12(1, 1)\begin{pmatrix}i\\ -i\end{pmatrix} = 0$. Bloch picture: $\ket\psi = \ket{+x}$ and $\hat O = -\sigma_y$; $x \perp y$ gives 50/50.
            `,
          },
          {
            q: md`**Problem 3 (35 pts), short answers.** (1) With $\braket{x|\psi} = \psi(x)$, $\braket{p|\psi} = \psi(p)$ and $\braket{x|p} = e^{ipx/\hbar}/\sqrt{2\pi\hbar}$, show $\psi(p) = \tfrac{1}{\sqrt{2\pi\hbar}}\int e^{-ipx/\hbar}\psi(x)dx$. (2) Finite well $V = -V_0$ for $|x| \le a$: true or false, "a particle in the ground state ($E < 0$) will eventually escape the well, i.e. there is a finite probability of finding it at $|x| \gg a$"? (3) Free particle: (a) $\hat H$ in the position basis. (b) Is $\psi = A\sin(\pi x/a)$ an eigenstate? (c) Energy measurement: outcomes, probabilities. (d) Momentum measurement: outcomes, probabilities.`,
            ans: md`(1) Insert $\int\ket x\bra x\,dx = \hat 1$. (2) False. (3a) $-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2}$. (3b) Yes, $E = \tfrac{\pi^2\hbar^2}{2ma^2}$. (3c) That $E$, probability 1. (3d) $\pm\tfrac{\pi\hbar}{a}$, $\tfrac12$ each.`,
            sol: md`
              **(1)** $\psi(p) = \braket{p|\psi} = \int\braket{p|x}\braket{x|\psi}dx$ (completeness), and $\braket{p|x} = \braket{x|p}^* = e^{-ipx/\hbar}/\sqrt{2\pi\hbar}$. Done: the Fourier transform *is* a change of basis.

              **(2) False.** The ground state is a **stationary** state: $|\Psi(x, t)|^2 = |\psi(x)|^2$ never changes, so nothing "eventually" happens. Outside, $\psi \propto e^{-\kappa|x|}$: the probability of being at $|x| \gg a$ is nonzero but exponentially small and constant in time. The particle is bound; it does not leak away (no probability current: $\psi$ is real).

              **(3a)** $\hat H = \hat p^2/2m$, $V = 0$.

              **(3b)** $\tfrac{d^2}{dx^2}\sin\tfrac{\pi x}{a} = -\tfrac{\pi^2}{a^2}\sin\tfrac{\pi x}{a}$, so $\hat H\psi = \tfrac{\pi^2\hbar^2}{2ma^2}\psi$: yes. (No walls here: this is a free standing wave, not the box state. Strictly it is not normalizable on the whole line; the exam says to assume it is.)

              **(3c)** An energy eigenstate: $E = \tfrac{\pi^2\hbar^2}{2ma^2}$ with certainty.

              **(3d)** Not a momentum eigenstate: $\sin\tfrac{\pi x}{a} = \tfrac{1}{2i}\left(e^{i\pi x/a} - e^{-i\pi x/a}\right)$, equal-magnitude amplitudes for $p = \pm\pi\hbar/a$: probability $\tfrac12$ each, $\langle p\rangle = 0$. **The point:** the free-particle energy is degenerate ($\pm p$ share $E$), so an energy eigenstate need not be a momentum eigenstate.
            `,
          },
        ],
      },
      R(md`
        ### Check yourself

        Same skills, quick checks.
      `),
      P({
        title: 'Problem 1 numbers',
        q: md`For $\ket\psi = A(\ket{\psi_1} + i\ket{\psi_2})$ in a well of width $a$: enter $A$, $P(E_2)$ and the sloshing angular frequency $\omega$.`,
        parts: [{ lbl: 'A', ans: Math.SQRT1_2 }, { lbl: 'P(E_2)', ans: 0.5 }, { lbl: '\\omega', expr: '3*pi^2*hbar/(2*m*a^2)', vars: { hbar: [0.5, 2], m: [0.5, 2], a: [0.5, 2] } }],
        hints: [md`$\omega = (E_2 - E_1)/\hbar = 3E_1/\hbar$.`],
        sol: md`$\tfrac{1}{\sqrt2}$, $\tfrac12$, $\tfrac{3\pi^2\hbar}{2ma^2}$.`,
      }),
      Q(md`$\ket\psi = \tfrac{1}{\sqrt2}(\ket{\psi_1} + i\ket{\psi_2})$. Then $\braket{\psi_2|\psi} = $?`, [md`$\tfrac{i}{\sqrt2}$`, md`$-\tfrac{i}{\sqrt2}$`, md`$\tfrac{1}{\sqrt2}$`, md`$\tfrac12$`], 0,
        [null, 'The conjugate acts on the bra, ⟨ψ₂|, whose components are real; the i in the ket stays.', 'Forgot the i.', 'That is a probability, |·|².'],
        md`Orthonormality picks out the coefficient of $\ket{\psi_2}$: $\tfrac{i}{\sqrt2}$.`),
      Q(md`Which operator is **not** Hermitian?`, [md`$\ket1\bra2 - \ket2\bra1$`, md`$i\left(\ket1\bra2 - \ket2\bra1\right)$`, md`$\ket1\bra2 + \ket2\bra1$`, md`$\ket1\bra1 - \ket2\bra2$`], 0,
        [null, md`That is $-\sigma_y$: Hermitian.`, md`That is $\sigma_x$.`, md`That is $\sigma_z$.`],
        md`$(\ket1\bra2 - \ket2\bra1)^\dagger = \ket2\bra1 - \ket1\bra2$: minus itself, anti-Hermitian. Multiplying by $i$ fixes it.`),
      Q(md`True or false: "A particle bound in the ground state of a finite well slowly leaks out through the walls."`, ['False: a stationary state has a time-independent density, and real ψ carries no current', 'True: tunneling makes it escape over time', 'True, but only if E > 0', 'False, because ψ = 0 outside the well'], 0,
        [null, 'Tunneling escape needs a state that is not stationary or a barrier with free states beyond it; a bound eigenstate never changes.', 'Bound states have E < 0 by definition.', md`ψ is nonzero outside ($\propto e^{-\kappa|x|}$): that part is the tail, not escape.`],
        md`$|\psi|^2$ constant in time and $J = 0$. The tail outside is permanent and exponentially small.`),
      Q(md`A free particle is in $A\cos(3x/b)$. A momentum measurement gives…`, [md`$\pm3\hbar/b$, probability $\tfrac12$ each`, md`$3\hbar/b$ with certainty`, '0 with certainty', md`$\tfrac{9\hbar^2}{2mb^2}$`], 0,
        [null, 'cos is a sum of two plane waves.', md`$\langle p\rangle = 0$, but no single result is 0.`, 'That is an energy.'],
        md`$\cos u = \tfrac12(e^{iu} + e^{-iu})$: equal amplitudes for $\pm\hbar k$. Energy is certain ($\tfrac{9\hbar^2}{2mb^2}$); momentum is not.`),
      P({
        title: 'Problem 2, rotated',
        q: md`For $\hat O = i(\ket1\bra2 - \ket2\bra1)$, find $P(O = +1)$ in the state $\ket1$, and $\langle O\rangle$ in $\ket\phi = \tfrac{1}{\sqrt2}(\ket1 - i\ket2)$.`,
        parts: [{ lbl: 'P(+1)\\ \\text{in}\\ |1\\rangle', ans: 0.5 }, { lbl: '\\langle O\\rangle_\\phi', ans: 1 }],
        hints: [md`$\ket\phi$ is $\ket\alpha$, the $+1$ eigenvector.`],
        sol: md`$|\braket{\alpha|1}|^2 = \tfrac12$. $\ket\phi = \ket\alpha$, so $\langle O\rangle = +1$.`,
      }),
    ],
  };

  const variants = {
    id: 'past2022-v', title: 'Past-exam variants A and B', sub: 'same structure, new numbers',
    steps: [
      R(md`Two exams built exactly like October 2022, with new states and operators. Do one timed right after the real one, the other a few days later.`),
      {
        t: 'paper',
        html: '<div class="pp-title"><span>Variant A</span><span>100 pts</span></div>',
        items: [
          {
            q: md`**A1 (30).** Infinite well, $\ket\psi = A\left(2\ket{\psi_1} - i\ket{\psi_3}\right)$. (1) $A$. (2) $\braket{\psi_3|\psi}$. (3) Energy outcomes, probabilities, $\langle H\rangle$. (4) $\psi(x)$. (5) $\Psi(x, t)$. (6) $|\Psi(x, t)|^2$. Does $\langle x\rangle$ move?`,
            ans: md`$A = \tfrac{1}{\sqrt5}$; $-\tfrac{i}{\sqrt5}$; $E_1$ ($\tfrac45$), $E_3$ ($\tfrac15$), $\langle H\rangle = \tfrac{13}{5}E_1$; $|\Psi|^2 = \tfrac2a\left[\tfrac45\sin^2\tfrac{\pi x}{a} + \tfrac15\sin^2\tfrac{3\pi x}{a} - \tfrac45\sin\tfrac{\pi x}{a}\sin\tfrac{3\pi x}{a}\sin\omega t\right]$, $\omega = \tfrac{8E_1}{\hbar}$; $\langle x\rangle = a/2$ always.`,
            sol: md`$|A|^2(4 + 1) = 1$. $\braket{\psi_3|\psi} = -iA$. $\langle H\rangle = \tfrac45E_1 + \tfrac15\cdot9E_1$. Cross term: $2\cdot\tfrac{2}{\sqrt5}\cdot\tfrac{1}{\sqrt5}\psi_1\psi_3\text{Re}\left(-ie^{-i\omega t}\right) = -\tfrac45\psi_1\psi_3\sin\omega t$ with $\psi_1\psi_3 = \tfrac2a\sin\sin$. $\psi_1$ and $\psi_3$ are both symmetric about $a/2$, so the density breathes symmetrically and $\langle x\rangle$ stays at $a/2$.`,
          },
          {
            q: md`**A2 (35).** $\hat O = \ket1\bra1 - \ket2\bra2 + \ket1\bra2 + \ket2\bra1$. (1) Matrix. (2) Hermitian? (3) Eigenvalues, eigenvectors. (4) In $\ket1$: outcome probabilities. (5) $\langle O\rangle$ in $\ket1$.`,
            ans: md`$\begin{pmatrix}1 & 1\\ 1 & -1\end{pmatrix} = \sigma_z + \sigma_x$; yes; $\pm\sqrt2$ with $(\cos\tfrac\pi8, \sin\tfrac\pi8)$ and $(-\sin\tfrac\pi8, \cos\tfrac\pi8)$; $P(+\sqrt2) = \cos^2\tfrac\pi8 = 0.854$, $P(-\sqrt2) = 0.146$; $\langle O\rangle = 1$.`,
            sol: md`tr 0, det $-2$ → $\pm\sqrt2$. Geometry: $\sigma_z + \sigma_x = \sqrt2\,\hat n\cdot\vec\sigma$ with $\hat n$ at $45°$ between $z$ and $x$, so the $+$ eigenvector is the Bloch state $\theta = \pi/4$: $(\cos\tfrac\pi8, \sin\tfrac\pi8)$. $\ket1$ is the north pole: $P(+) = \cos^2\tfrac{45°}{2} = \tfrac{2 + \sqrt2}{4}$. $\langle O\rangle = \langle\sigma_z\rangle + \langle\sigma_x\rangle = 1 + 0$; check $\sqrt2(0.854 - 0.146) = 1$ ✓.`,
          },
          {
            q: md`**A3 (35).** (1) Show $\psi(x) = \tfrac{1}{\sqrt{2\pi\hbar}}\int e^{ipx/\hbar}\psi(p)dp$. (2) True or false: "in a stationary state of the finite well, $\langle x\rangle$ oscillates because the particle bounces between the walls". (3) Free particle in $A\cos(2\pi x/a)$: eigenstate of $\hat H$? Energy outcomes? Momentum outcomes?`,
            ans: md`(1) Insert $\int\ket p\bra p\,dp$. (2) False. (3) Yes, $E = \tfrac{2\pi^2\hbar^2}{ma^2}$ certain; $p = \pm\tfrac{2\pi\hbar}{a}$, $\tfrac12$ each.`,
            sol: md`(1) $\braket{x|\psi} = \int\braket{x|p}\braket{p|\psi}dp$. (2) Stationary: every expectation value is constant; the classical "bouncing" picture lives in superpositions of different energies. (3) $\tfrac{\hbar^2}{2m}\left(\tfrac{2\pi}{a}\right)^2$; cos = two plane waves of equal weight.`,
          },
        ],
      },
      {
        t: 'paper',
        html: '<div class="pp-title"><span>Variant B</span><span>100 pts</span></div>',
        items: [
          {
            q: md`**B1 (30).** Infinite well, $\ket\psi = A\left(\ket{\psi_1} + e^{i\pi/4}\ket{\psi_2} + \ket{\psi_3}\right)$. (1) $A$. (2) $\braket{\psi_2|\psi}$. (3) Energy outcomes, probabilities, $\langle H\rangle$. (4) Which of these change in time: $P(E_2)$, $\langle H\rangle$, $|\Psi(x, t)|^2$, $\langle x\rangle$?`,
            ans: md`$A = \tfrac{1}{\sqrt3}$; $\tfrac{e^{i\pi/4}}{\sqrt3}$; $E_1, E_2, E_3$ each $\tfrac13$, $\langle H\rangle = \tfrac{14}{3}E_1$; only $|\Psi|^2$ and $\langle x\rangle$.`,
            sol: md`$3|A|^2 = 1$. Probabilities ignore the phase. $\tfrac{1 + 4 + 9}{3}E_1$. Probabilities and $\langle H\rangle$ are frozen for any state; the density and $\langle x\rangle$ move through the cross terms. ($\langle x\rangle$ gets contributions from the 1–2 and 2–3 pairs; the 1–3 pair is symmetric about $a/2$ and does not shift it.)`,
          },
          {
            q: md`**B2 (35).** $\hat O = (1 - i)\ket1\bra2 + (1 + i)\ket2\bra1$. (1) Matrix; Hermitian? (2) Eigenvalues and eigenvectors. (3) In $\ket1$: probabilities. (4) In $\ket\phi = \tfrac{1}{\sqrt2}(\ket1 + i\ket2)$: $P(+\sqrt2)$ and $\langle O\rangle$.`,
            ans: md`$\begin{pmatrix}0 & 1 - i\\ 1 + i & 0\end{pmatrix}$, Hermitian; $\pm\sqrt2$ with $\tfrac{1}{\sqrt2}\left(1, \pm\tfrac{1 + i}{\sqrt2}\right)$; $\tfrac12$ each; $P(+\sqrt2) = \tfrac{2 + \sqrt2}{4} = 0.854$, $\langle O\rangle = 1$.`,
            sol: md`det $= -|1 - i|^2 = -2$. Eigenvector for $+\sqrt2$: $y = \tfrac{1 + i}{\sqrt2}x$. In $\ket\phi$: $\braket{v_+|\phi} = \tfrac12\left[1 + \tfrac{1 - i}{\sqrt2}i\right] = \tfrac12\left[1 + \tfrac{1 + i}{\sqrt2}\right]$, modulus squared $\tfrac{2 + \sqrt2}{4}$. Directly: $\bra\phi\hat O\ket\phi = \tfrac12\left[(1 - i)i + (-i)(1 + i)\right] = \tfrac12(i + 1 - i + 1) = 1$ ✓. Geometry: $\hat O = \sigma_x + \sigma_y$, axis at $45°$ in the equator; $\ket\phi = \ket{+y}$ is $45°$ from it.`,
          },
          {
            q: md`**B3 (35).** (1) Use completeness to show $\braket{\psi|\psi} = \int|\psi(p)|^2dp$. (2) True or false: "a bound particle in the finite well is never found where $V > E$". (3) Free particle in $\tfrac{1}{\sqrt3}e^{ikx} + \sqrt{\tfrac23}e^{-ikx}$ (assume normalized): energy outcomes; momentum outcomes and probabilities; $\langle p\rangle$.`,
            ans: md`(1) Insert $\int\ket p\bra p\,dp$. (2) False. (3) $E = \tfrac{\hbar^2k^2}{2m}$, certain; $+\hbar k$ ($\tfrac13$), $-\hbar k$ ($\tfrac23$); $\langle p\rangle = -\tfrac{\hbar k}{3}$.`,
            sol: md`(1) $\braket{\psi|\psi} = \int\braket{\psi|p}\braket{p|\psi}dp = \int|\psi(p)|^2dp$. (2) The tail $e^{-\kappa|x|}$ outside the well, where $V = 0 > E$, has nonzero probability (about 10% for $z_0 = 2$): finding the particle there is allowed quantum mechanically. (3) Both waves have the same $|k|$: one energy. Probabilities are $|\text{coefficient}|^2$.`,
          },
        ],
      },
      R(md`### Check your variant numbers`),
      P({
        title: 'Variants: key numbers',
        q: md`Enter: A1 $\langle H\rangle/E_1$; A2 $P(+\sqrt2)$ in $\ket1$; B1 $\langle H\rangle/E_1$; B3 $\langle p\rangle$ in units of $\hbar k$.`,
        parts: [{ lbl: '\\langle H\\rangle/E_1\\ (A1)', ans: 2.6 }, { lbl: 'P(+\\sqrt2)', ans: (2 + Math.SQRT2) / 4 }, { lbl: '\\langle H\\rangle/E_1\\ (B1)', ans: 14 / 3 }, { lbl: '\\langle p\\rangle/\\hbar k', ans: -1 / 3 }],
        sol: md`$2.6$, $0.854$, $4.67$, $-0.333$.`,
      }),
    ],
  };

  u6.lessons.unshift(past, variants);
  u6.blurb = 'The real October 2022 midterm, two variants of it, then ten timed practice exams that get harder.';
})();

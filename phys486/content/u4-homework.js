/* Unit 4 — Homework 1–4, worked. Each page restates the problems, shows how to see the approach, gives a full solution
   behind a reveal button, then drills the same skills with new numbers. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const T = (n, title) => `[Topic ${n}](#/l/${title})`;
  const paper = (title, due, items) => ({ t: 'paper', html: `<div class="pp-title"><span>${title}</span><span>${due}</span></div>`, items });
  const drill = R(md`
    ### Practice: same skills, new numbers

    Try each problem above on paper before opening its solution. Then these check that the method transfers.
  `);

  C.unit({
    id: 'u4', exam: 'm1', num: 'Unit 4', title: 'Homework, worked',
    blurb: 'Every homework problem with the approach, a full solution and new-number practice.',
    lessons: [
      // ------------------------------------------------------------------ HW 1
      {
        id: 'hw1', title: 'Homework 1: wavefunctions, Ehrenfest, operators',
        steps: [
          R(md`
            **Trains:** normalizing and computing $\langle x\rangle$, $\langle x^2\rangle$, $\sigma$ (${T(3, 't3-wavefunction')}); deriving with the Schrödinger equation (Topic 3); why only energy differences matter (${T(4, 't4-stationary')}); spectral decomposition (${T(8, 't8-dirac')}).

            **The routine for any "properties of a wavefunction" problem:**
            1. $|\Psi|^2$ first. Time phases like $e^{-i\omega t}$ drop out.
            2. Look for symmetry before integrating: an even $|\Psi|^2$ gives $\langle x\rangle = 0$ for free.
            3. Substitute to make the integral dimensionless ($u = \lambda x$). The constants then come out by dimensional analysis: $|A|^2$ must have units of $1/\text{length}$.
            4. $\sigma^2 = \langle x^2\rangle - \langle x\rangle^2$.
          `),
          paper('PHYS 486 · Homework 1', 'Due 9/9', [
            {
              q: md`**1. Properties of wavefunctions.** $\Psi(x,t) = \dfrac{A}{(\lambda x)^2 + 1}e^{-i\omega t}$ with $A, \lambda, \omega > 0$. (a) Normalize; find $\langle x\rangle$ and $\langle x^2\rangle$. (b) Find $\sigma$; sketch $|\Psi|^2$ and mark $\langle x\rangle \pm \sigma$. (c) Probability of finding the particle outside $[\langle x\rangle - \sigma, \langle x\rangle + \sigma]$?`,
              ans: md`(a) $A = \sqrt{2\lambda/\pi}$, $\langle x\rangle = 0$, $\langle x^2\rangle = 1/\lambda^2$. (b) $\sigma = 1/\lambda$. (c) $\tfrac12 - \tfrac1\pi = 0.182$.`,
              sol: md`
                **How to see it.** $|\Psi|^2 = \dfrac{A^2}{(1 + \lambda^2x^2)^2}$ is even, peaked at 0, with width $\sim 1/\lambda$ (the only length in the problem). So expect $\langle x\rangle = 0$, $\sigma \propto 1/\lambda$, $A^2 \propto \lambda$.

                **(a)** With $u = \lambda x$ and the standard integrals $\int_{-\infty}^\infty\dfrac{du}{(1 + u^2)^2} = \dfrac\pi2$ and $\int_{-\infty}^\infty\dfrac{u^2\,du}{(1 + u^2)^2} = \dfrac\pi2$ (substitute $u = \tan\theta$):
                $$1 = \frac{A^2}{\lambda}\cdot\frac\pi2 \Rightarrow A = \sqrt{\frac{2\lambda}{\pi}}, \qquad \langle x^2\rangle = \frac{A^2}{\lambda^3}\cdot\frac\pi2 = \frac{1}{\lambda^2}$$
                $\langle x\rangle = 0$ by symmetry.

                **(b)** $\sigma = \sqrt{1/\lambda^2 - 0} = 1/\lambda$: the points $x = \pm1/\lambda$, where $|\Psi|^2$ has dropped to $\tfrac14$ of its peak.

                **(c)** Use $\int\dfrac{du}{(1 + u^2)^2} = \dfrac12\left[\dfrac{u}{1 + u^2} + \arctan u\right]$:
                $$P_{\text{in}} = \frac{2}{\pi}\cdot\frac12\left[\frac{u}{1 + u^2} + \arctan u\right]_{-1}^{1} = \frac1\pi\left(1 + \frac\pi2\right) = \frac12 + \frac1\pi$$
                so $P_{\text{out}} = \tfrac12 - \tfrac1\pi = 0.182$. (Compare a Gaussian: 0.317. Different shapes put different weight in their tails.)
              `,
            },
            {
              q: md`**2. Ehrenfest's theorem.** Use the Schrödinger equation to show $\dfrac{d\langle p\rangle}{dt} = -\left\langle\dfrac{\partial V}{\partial x}\right\rangle$ for a normalizable wavefunction.`,
              ans: md`Differentiate $\langle p\rangle = -i\hbar\int\Psi^*\partial_x\Psi\,dx$ under the integral, replace $\partial_t\Psi$ and $\partial_t\Psi^*$ using the Schrödinger equation; the kinetic terms cancel after integrating by parts, the potential terms leave $-\int|\Psi|^2\partial_xV\,dx$.`,
              sol: md`
                **How to see it.** "Time derivative of an expectation value" always goes: differentiate inside the integral, swap every $\partial_t$ for $\hat H$ using the Schrödinger equation, integrate by parts until things cancel. Boundary terms vanish because a normalizable $\Psi$ dies at $\pm\infty$.

                The equation and its conjugate: $\partial_t\Psi = \tfrac{i\hbar}{2m}\Psi'' - \tfrac i\hbar V\Psi$, $\partial_t\Psi^* = -\tfrac{i\hbar}{2m}\Psi^{*\prime\prime} + \tfrac i\hbar V\Psi^*$.
                $$\frac{d\langle p\rangle}{dt} = -i\hbar\int\left(\partial_t\Psi^*\,\Psi' + \Psi^*\,\partial_x\partial_t\Psi\right)dx$$
                **Kinetic pieces:** $-i\hbar\cdot\tfrac{i\hbar}{2m}\int\left(-\Psi^{*\prime\prime}\Psi' + \Psi^*\Psi'''\right)dx$. Integrate the second term by parts twice: $\int\Psi^*\Psi''' = \int\Psi^{*\prime\prime}\Psi'$. They cancel.

                **Potential pieces:** $-i\hbar\cdot\tfrac{i}{\hbar}\int\left(V\Psi^*\Psi' - \Psi^*(V\Psi)'\right)dx = \int\left(V\Psi^*\Psi' - \Psi^*V'\Psi - \Psi^*V\Psi'\right)dx = -\int V'|\Psi|^2dx$.

                So $\tfrac{d\langle p\rangle}{dt} = -\langle V'\rangle$: Newton's second law for averages, with the **average force**.

                **Shortcut (Topic 9):** $\tfrac{d\langle p\rangle}{dt} = \tfrac i\hbar\langle[\hat H, \hat p]\rangle$ and $[V(x), \hat p] = i\hbar V'$, giving the same thing in one line.
              `,
            },
            {
              q: md`**3. Only energy differences are physical.** How does the wavefunction change if $V(x) \to V(x) + V_0$? Does any measurable quantity change?`,
              ans: md`$\Psi \to \Psi e^{-iV_0t/\hbar}$, a global phase. No probability or expectation value changes (energies all shift by $V_0$, but only differences are measured).`,
              sol: md`
                **How to see it.** Guess $\Psi' = \Psi e^{-iV_0t/\hbar}$ and check: $i\hbar\partial_t\Psi' = (i\hbar\partial_t\Psi + V_0\Psi)e^{-iV_0t/\hbar} = (\hat H + V_0)\Psi'$ ✓. Same initial condition, same equation: unique solution.

                **Measurable?** The factor has modulus 1 and multiplies everything, so $|\Psi'|^2 = |\Psi|^2$ and every $\bra{\Psi'}\hat Q\ket{\Psi'} = \bra\Psi\hat Q\ket\Psi$ for operators not involving $V$. Each stationary energy becomes $E_n + V_0$, but every observable effect (beat frequencies, photon energies) involves $E_m - E_n$. Exactly as in classical mechanics, where $F = -\nabla V$ ignores a constant.
              `,
            },
            {
              q: md`**4. Properties of wavefunctions, II.** $\Psi = Ae^{-\lambda|x|}e^{-i\omega t}$. (a) Normalize. (b) $\langle x\rangle$, $\langle x^2\rangle$. (c) $\sigma$; sketch; probability outside $\langle x\rangle \pm \sigma$.`,
              ans: md`$A = \sqrt\lambda$; $\langle x\rangle = 0$, $\langle x^2\rangle = \tfrac{1}{2\lambda^2}$; $\sigma = \tfrac{1}{\sqrt2\lambda}$; $P_{\text{out}} = e^{-\sqrt2} = 0.243$.`,
              sol: md`Worked in full in ${T(3, 't3-wavefunction')} (the worked example). The key moves: double the half-line integral because $|\Psi|^2$ is even, and $\int_0^\infty x^ne^{-\alpha x}dx = n!/\alpha^{n+1}$.`,
            },
            {
              q: md`**5. Spectral decomposition.** $\hat Q\ket{e_n} = q_n\ket{e_n}$ with a complete orthonormal set. (a) Show $\hat Q = \sum_nq_n\ket{e_n}\bra{e_n}$. (b) Show that defining $f(\hat Q) = \sum f(q_n)\ket{e_n}\bra{e_n}$ agrees with the power series for $e^{\hat Q}$.`,
              ans: md`(a) Insert $\hat 1 = \sum\ket{e_n}\bra{e_n}$ before $\ket\psi$ and act with $\hat Q$. (b) $\hat Q^k = \sum q_n^k\ket{e_n}\bra{e_n}$, so $\sum_k\hat Q^k/k! = \sum_ne^{q_n}\ket{e_n}\bra{e_n}$.`,
              sol: md`
                **How to see it.** Two operators are equal if they do the same thing to every vector. And completeness, $\sum\ket{e_n}\bra{e_n} = \hat 1$, can be inserted anywhere.

                **(a)** For any $\ket\psi$: $\hat Q\ket\psi = \hat Q\sum_n\ket{e_n}\braket{e_n|\psi} = \sum_nq_n\ket{e_n}\braket{e_n|\psi} = \left(\sum_nq_n\ket{e_n}\bra{e_n}\right)\ket\psi$.

                **(b)** Square it: $\hat Q^2 = \sum_{m,n}q_mq_n\ket{e_m}\braket{e_m|e_n}\bra{e_n} = \sum_nq_n^2\ket{e_n}\bra{e_n}$, since $\braket{e_m|e_n} = \delta_{mn}$ kills the cross terms. By induction $\hat Q^k = \sum_nq_n^k\ket{e_n}\bra{e_n}$ (also true for $k = 0$, by completeness). Then
                $$e^{\hat Q} = \sum_k\frac{\hat Q^k}{k!} = \sum_n\left(\sum_k\frac{q_n^k}{k!}\right)\ket{e_n}\bra{e_n} = \sum_ne^{q_n}\ket{e_n}\bra{e_n}$$
                **Intuition:** in its own eigenbasis an operator is a diagonal matrix, and a function of a diagonal matrix just acts on each diagonal entry.
              `,
            },
          ]),
          drill,
          P({
            title: 'Lorentzian, new width',
            q: md`$\psi(x) = \dfrac{A}{1 + x^2/b^2}$. Find $A$ and $\sigma_x$.`,
            parts: [{ lbl: 'A', expr: 'sqrt(2/(pi*b))', vars: { b: [0.5, 3] } }, { lbl: '\\sigma_x', expr: 'b', vars: { b: [0.5, 3] } }],
            hints: [md`This is HW 1 #1 with $\lambda = 1/b$.`],
            sol: md`$A = \sqrt{2\lambda/\pi} = \sqrt{2/\pi b}$, $\sigma = 1/\lambda = b$.`,
          }),
          P({
            title: 'Probability inside ±σ',
            q: md`For the Lorentzian of HW 1 #1, what is the probability of finding the particle **inside** $\pm\sigma$?`,
            parts: [{ lbl: 'P_{\\text{in}}', ans: 0.5 + 1 / Math.PI }],
            hints: [md`One minus the HW answer.`],
            sol: md`$\tfrac12 + \tfrac1\pi = 0.818$.`,
          }),
          Q(md`For $V = mgx$ (uniform gravity), Ehrenfest gives…`, [md`$\tfrac{d\langle p\rangle}{dt} = -mg$ exactly, for any state`, md`$\tfrac{d\langle p\rangle}{dt} = -mg$ only for stationary states`, md`$\tfrac{d\langle p\rangle}{dt} = -mg\langle x\rangle$`, md`$\tfrac{d\langle p\rangle}{dt} = 0$`], 0,
            [null, 'The theorem holds for any normalizable state.', md`$V' = mg$, a constant; no $x$ survives.`, 'There is a force.'],
            md`$V' = mg$ is constant, so $\langle V'\rangle = mg$: averages fall exactly classically.`),
          P({
            title: 'Function of an operator',
            q: md`$\hat Q$ has eigenvalues 0 and 2 with orthonormal eigenvectors $\ket{e_0}$, $\ket{e_2}$. For $\ket\psi = \tfrac1{\sqrt2}(\ket{e_0} + \ket{e_2})$, find $\bra\psi e^{\hat Q}\ket\psi$.`,
            parts: [{ lbl: '\\langle e^{Q}\\rangle', ans: (1 + Math.exp(2)) / 2 }],
            hints: [md`$e^{\hat Q} = e^0\ket{e_0}\bra{e_0} + e^2\ket{e_2}\bra{e_2}$.`],
            sol: md`$\tfrac12(1 + e^2) = 4.19$.`,
          }),
          Q(md`You add $V_0 = 5$ eV to a potential. A two-state superposition's density oscillated at $\omega$ before. Now it oscillates at…`, [md`$\omega$`, md`$\omega + 5\,\text{eV}/\hbar$`, md`$\omega + 10\,\text{eV}/\hbar$`, 'it stops oscillating'], 0,
            [null, 'Both energies shift by the same amount.', 'Both shift the same way; the difference is unchanged.', 'The relative phase still turns.'],
            md`$(E_2 + V_0) - (E_1 + V_0) = E_2 - E_1$.`),
        ],
      },

      // ------------------------------------------------------------------ HW 2
      {
        id: 'hw2', title: 'Homework 2: the infinite well, uncertainty, the Gaussian packet',
        steps: [
          R(md`
            **Trains:** the 3-step recipe (${T(4, 't4-stationary')}, ${T(5, 't5-isw')}), uncertainty in the infinite well (${T(9, 't9-uncertainty')}), traveling vs standing waves and the free Gaussian (${T(6, 't6-free')}).

            **The "strategy" parts.** This homework asks you to *describe your strategy* before calculating. On the exam that is worth points by itself. The answer is almost always the 3-step recipe: solve $\hat H\psi_n = E_n\psi_n$; decompose $c_n = \int\psi_n^*\Psi(x,0)dx$; evolve with $e^{-iE_nt/\hbar}$; then probabilities are $|c_n|^2$ and $\langle H\rangle = \sum|c_n|^2E_n$.
          `),
          paper('PHYS 486 · Homework 2', 'Due 9/16', [
            {
              q: md`**1. Time evolution in the infinite well.** $\Psi(x,0) = A\left[(a/2)^4 - (x - a/2)^4\right]$ on $0 < x < a$. (a) Sketch; find $A$; why normalize? (b) Strategy for $\Psi(x,t)$, then compute it. (c) Strategy for $P(E_n)$; compute. (d) Strategy for $\langle E\rangle$; compute. Do $P(E_1)$ and $\langle E\rangle$ depend on time?`,
              ans: md`(a) $A = \sqrt{360/a^9}$. (b) $c_n = \sqrt{720}\left[\dfrac{6}{(n\pi)^3} - \dfrac{48}{(n\pi)^5}\right]$ for odd $n$, 0 for even. (c) $P(E_1) = 0.9675$, $P(E_3) = 0.0306$, $P(E_5) = 0.0016$. (d) $\langle E\rangle = \dfrac{45\hbar^2}{7ma^2} = 1.30E_1$; neither depends on $t$.`,
              sol: md`
                **How to see it.** Shift to the center, $u = x - a/2$, $b = a/2$: $\Psi = A(b^4 - u^4)$, a flat-topped bump, symmetric about the center and zero at the walls. Symmetric → only odd $n$ (which are the cosines about the center). Flat top, almost like $\psi_1$ → expect $P(E_1)$ close to 1.

                **(a)** $\int_{-b}^b(b^4 - u^4)^2du = 2b^9\left(1 - \tfrac25 + \tfrac19\right) = \tfrac{64}{45}b^9$. With $b = a/2$: $A^2 = \tfrac{45}{64}\cdot\tfrac{512}{a^9} = \tfrac{360}{a^9}$. Normalizing makes $|\Psi|^2$ a probability density, so $|c_n|^2$ are probabilities summing to 1.

                **(b)** For odd $n$, $\psi_n = \sqrt{2/a}\,\sin(n\pi x/a) = \pm\sqrt{2/a}\cos(ku)$ with $k = n\pi/a$, $kb = n\pi/2$. Integrate by parts twice (the boundary terms vanish because $b^4 - u^4 = 0$ and $\cos kb = 0$ at the walls):
                $$\int_{-b}^b(b^4 - u^4)\cos ku\,du = \frac{8}{k}\int_0^bu^3\sin ku\,du = 8\left(\frac{3b^2}{k^3} - \frac{6}{k^5}\right)\sin\tfrac{n\pi}{2}$$
                Putting the pieces together, the signs cancel and
                $$c_n = \sqrt{720}\left[\frac{6}{(n\pi)^3} - \frac{48}{(n\pi)^5}\right]\ (n\text{ odd}), \qquad \Psi(x,t) = \sum_{n\,\text{odd}}c_n\sqrt{\tfrac2a}\sin\tfrac{n\pi x}{a}\,e^{-in^2\pi^2\hbar t/2ma^2}$$

                **(c)** $P(E_n) = |c_n|^2$: $0.9675$, $0.0306$, $0.0016$, … for $n = 1, 3, 5$; zero for even $n$. Constant in time: $|c_ne^{-iE_nt/\hbar}|^2 = |c_n|^2$.

                **(d)** Skip the infinite sum: inside the well $\hat H = \hat p^2/2m$, so
                $$\langle E\rangle = \frac{\hbar^2}{2m}\int|\Psi'|^2dx = \frac{\hbar^2}{2m}A^2\int_{-b}^b16u^6du = \frac{\hbar^2}{2m}\cdot\frac{360}{a^9}\cdot\frac{32b^7}{7} = \frac{45\hbar^2}{7ma^2}$$
                That is $1.30E_1$: mostly ground state, with a little $E_3$ (worth $9E_1$ each) pulling the average up. Time-independent, since every $|c_n|^2$ is.
              `,
            },
            {
              q: md`**2. Uncertainty in the infinite well.** Compute $\langle x\rangle$, $\langle x^2\rangle$, $\langle p\rangle$, $\langle p^2\rangle$ in $\psi_n$. Check $\sigma_x\sigma_p \ge \hbar/2$. Which $n$ minimizes the product?`,
              ans: md`$\tfrac a2$; $a^2\left(\tfrac13 - \tfrac{1}{2n^2\pi^2}\right)$; 0; $\left(\tfrac{n\pi\hbar}{a}\right)^2$. $\sigma_x\sigma_p = \tfrac\hbar2\sqrt{\tfrac{n^2\pi^2}{3} - 2}$, smallest at $n = 1$: $0.568\hbar$.`,
              sol: md`
                **How to see it.** $|\psi_n|^2$ is symmetric about $a/2$ → $\langle x\rangle = a/2$. $\psi_n$ is real → $\langle p\rangle = 0$. Inside, $\hat p^2/2m = \hat H$ → $\langle p^2\rangle = 2mE_n$. Only $\langle x^2\rangle$ needs a real integral.

                $\langle x^2\rangle = \tfrac2a\int_0^ax^2\sin^2\tfrac{n\pi x}{a}dx$: write $\sin^2 = \tfrac12(1 - \cos)$; the $\tfrac12$ part gives $a^2/3$, the cosine part (two integrations by parts) gives $-\tfrac{a^2}{2n^2\pi^2}$.

                $\sigma_x^2 = a^2\left(\tfrac{1}{12} - \tfrac{1}{2n^2\pi^2}\right)$, $\sigma_p = \tfrac{n\pi\hbar}{a}$, so $\sigma_x\sigma_p = \tfrac\hbar2\sqrt{\tfrac{n^2\pi^2}{3} - 2}$: $0.568\hbar$ at $n = 1$, growing with $n$. Higher states: $\sigma_x \to a/\sqrt{12}$ (uniform), $\sigma_p$ grows linearly.
              `,
            },
            {
              q: md`**3. Traveling and standing waves.** Show $Ae^{ikx} + Be^{-ikx}$ and $C\cos kx + D\sin kx$ are equivalent; find $C, D$ from $A, B$ and back.`,
              ans: md`$C = A + B$, $D = i(A - B)$; $A = \tfrac12(C - iD)$, $B = \tfrac12(C + iD)$.`,
              sol: md`Expand with Euler: $A(\cos + i\sin) + B(\cos - i\sin) = (A + B)\cos kx + i(A - B)\sin kx$. Invert: $C - iD = (A + B) + (A - B) = 2A$, $C + iD = 2B$. Two complex constants either way: same 2-dimensional space of solutions to $\psi'' = -k^2\psi$, two different bases (traveling vs standing).`,
            },
            {
              q: md`**4. Gaussian packet.** $\Psi(x,0) = Ae^{-ax^2}$. (a) Normalize. (b) Find $\Psi(x,t)$. (c) $|\Psi(x,t)|^2$ in terms of $w = \sqrt{a/\left[1 + (2\hbar at/m)^2\right]}$; sketch at $t = 0$ and large $t$. (d) $\langle x\rangle$, $\langle p\rangle$, $\langle x^2\rangle$, $\langle p^2\rangle$, $\sigma_x$, $\sigma_p$. (e) Check uncertainty; when is it closest to the limit?`,
              ans: md`(a) $A = (2a/\pi)^{1/4}$. (b) $\Psi = \left(\tfrac{2a}{\pi}\right)^{1/4}\dfrac{e^{-ax^2/(1 + 2i\hbar at/m)}}{\sqrt{1 + 2i\hbar at/m}}$. (c) $\sqrt{2/\pi}\,w\,e^{-2w^2x^2}$: lower and wider with time. (d) 0, 0, $\tfrac{1}{4w^2}$, $a\hbar^2$; $\sigma_x = \tfrac{1}{2w}$, $\sigma_p = \hbar\sqrt a$. (e) $\sigma_x\sigma_p = \tfrac\hbar2\sqrt{1 + (2\hbar at/m)^2}$, closest (equal) at $t = 0$.`,
              sol: md`
                **How to see it.** Free particle → recipe with an integral: $\phi(k)$ from the Fourier transform, attach $e^{-i\hbar k^2t/2m}$, transform back. Every integral is a Gaussian: complete the square.

                **(b)** $\phi(k) = (2\pi a)^{-1/4}e^{-k^2/4a}$ (Topic 6). Then
                $$\Psi(x,t) = \frac{1}{\sqrt{2\pi}}\int\phi(k)e^{ikx - i\hbar k^2t/2m}dk$$
                is Gaussian in $k$ with coefficient $\tfrac{1}{4a} + \tfrac{i\hbar t}{2m} = \tfrac{1 + 2i\hbar at/m}{4a}$; completing the square gives the result. Check: at $t = 0$ it is the initial state.

                **(c)** The modulus squared of $e^{-ax^2/(1 + i\theta)}$, $\theta = 2\hbar at/m$, is $e^{-2ax^2/(1 + \theta^2)} = e^{-2w^2x^2}$, and $|1 + i\theta|^{-1} = w/\sqrt a$. Area stays 1 while the width grows: it flattens and spreads.

                **(d)** Even density → $\langle x\rangle = 0$; real symmetric $\phi(k)$ → $\langle p\rangle = 0$. $\langle x^2\rangle = 1/4w^2$ (Gaussian with exponent $2w^2$). $\langle p^2\rangle = \hbar^2\langle k^2\rangle = a\hbar^2$, fixed for all time because $|\phi(k)|^2$ never changes for a free particle.

                **(e)** $\sigma_x\sigma_p = \tfrac{1}{2w}\hbar\sqrt a = \tfrac\hbar2\sqrt{1 + \theta^2} \ge \tfrac\hbar2$, equality only at $t = 0$.
              `,
            },
          ]),
          drill,
          P({
            title: 'Quartic: excited content',
            q: md`For HW 2 #1, what is $P(E_3)$?`,
            parts: [{ lbl: 'P(E_3)', ans: 0.030622 }],
            hints: [md`$c_3 = \sqrt{720}\left[6/(3\pi)^3 - 48/(3\pi)^5\right]$.`],
            sol: md`$c_3 = 0.175$, $P = 0.0306$.`,
          }),
          P({
            title: 'Quartic: average energy',
            q: md`For HW 2 #1, give $\langle E\rangle/E_1$.`,
            parts: [{ lbl: '\\langle E\\rangle/E_1', ans: (45 / 7) / (Math.PI ** 2 / 2) }],
            hints: [md`$E_1 = \pi^2\hbar^2/2ma^2 = 4.93\,\hbar^2/ma^2$.`],
            sol: md`$\tfrac{45/7}{\pi^2/2} = 1.303$.`,
          }),
          Q(md`An even-symmetric (about $a/2$) initial state in the infinite well. Which energies can be measured?`, ['only odd n', 'only even n', 'all n', 'only n = 1'], 0,
            [null, 'Even-n states are antisymmetric about the center.', 'Symmetry kills half of them.', 'Unless Ψ is exactly ψ₁.'],
            md`$c_n$ integrates (symmetric)(antisymmetric) = 0 for even $n$.`),
          P({
            title: 'Gaussian width at a given time',
            q: md`For HW 2 #4, find $\sigma_x$ at $t = m/2\hbar a$.`,
            parts: [{ lbl: '\\sigma_x', expr: 'sqrt(2)/(2*sqrt(a))', vars: { a: [0.5, 3] } }],
            hints: [md`$\theta = 2\hbar at/m = 1$.`],
            sol: md`$\sigma_x = \tfrac{1}{2\sqrt a}\sqrt{1 + 1} = \tfrac{1}{\sqrt{2a}}$.`,
          }),
          Q(md`$Ae^{ikx} + Be^{-ikx}$ with $A = B$ is…`, [md`$2A\cos kx$, a standing wave`, md`$2A\sin kx$`, md`$2iA\sin kx$`, 'a wave moving right'], 0,
            [null, md`$D = i(A - B) = 0$.`, md`That needs $B = -A$.`, 'Equal left and right movers.'],
            md`$C = 2A$, $D = 0$.`),
        ],
      },

      // ------------------------------------------------------------------ HW 3
      {
        id: 'hw3', title: 'Homework 3: odd states of the finite well, and the numerical wells',
        steps: [
          R(md`
            **Trains:** matching conditions and graphical solutions (${T(7, 't7-fsw')}), and what a computer actually does when it "solves the Schrödinger equation".
          `),
          paper('PHYS 486 · Homework 3', 'Due 9/23', [
            {
              q: md`**1. Odd bound states of the finite square well.** Derive the transcendental equation for the odd energies, solve it graphically, examine the limits. Is there always an odd bound state?`,
              ans: md`$-\cot z = \sqrt{(z_0/z)^2 - 1}$ with $z = \ell a$, $z_0 = \tfrac a\hbar\sqrt{2mV_0}$. Odd states exist only if $z_0 > \pi/2$ ($V_0 > \pi^2\hbar^2/8ma^2$): not always.`,
              sol: md`Worked in full in ${T(7, 't7-fsw')} (worked example). The steps to reproduce: $\psi = D\sin\ell x$ inside, $Fe^{-\kappa x}$ for $x > a$; match $\psi$ and $\psi'$ at $a$; divide to get $\kappa = -\ell\cot\ell a$; use $\kappa^2 + \ell^2 = 2mV_0/\hbar^2$ to write everything in $z$. Graph: $-\cot z$ is negative until $\pi/2$, so the first crossing needs $z_0 > \pi/2$. Wide/deep limit: $z \to \pi, 2\pi, \ldots$, the even-$n$ levels of an infinite well of width $2a$.`,
            },
          ]),
          R(md`
            ### The numerical investigation (notebook)

            **How a computer solves the Schrödinger equation.** Put $x$ on a grid $x_j = j\,\Delta x$ and replace the second derivative by a difference:
            $$\psi''(x_j) \approx \frac{\psi_{j+1} - 2\psi_j + \psi_{j-1}}{\Delta x^2}$$
            Then $\hat H\psi = E\psi$ becomes a **matrix** eigenvalue problem $Hv = Ev$, with $H$ tridiagonal: $\tfrac{\hbar^2}{m\Delta x^2} + V_j$ on the diagonal and $-\tfrac{\hbar^2}{2m\Delta x^2}$ next to it. Everything from Topic 8 applies literally: $H$ is real symmetric (Hermitian), so its eigenvalues are real and its eigenvectors orthonormal. That is the "overlap matrix" the notebook prints: $\braket{v_i|v_j} = \delta_{ij}$, the identity, meaning the states are **orthonormal** (not "independent measurements").

            **Two normalizations.** The solver returns $v_j$ with $\sum_j|v_j|^2 = 1$: $|v_j|^2$ is the probability of landing on grid point $j$. The wavefunction you plot is $\phi_j = v_j/\sqrt{\Delta x}$, so that $\sum_j|\phi_j|^2\Delta x = 1$ approximates $\int|\psi|^2dx = 1$: a density.

            **Accuracy.** The difference formula is good only if $\psi$ barely changes over one grid step, i.e. $\Delta x \ll$ the wavelength $2a/n$. High states wiggle faster, so their energies are worse. For the box the grid answer is exact: $E_n^{\text{grid}} = \tfrac{2\hbar^2}{m\Delta x^2}\sin^2\tfrac{n\pi\Delta x}{2a}$, always **below** the true value (since $\sin u < u$) and badly so once $n\Delta x$ approaches $a$. A tiny residual $\lVert Hv - Ev\rVert$ only says you solved the *matrix* problem well, not that the matrix represents the continuum well.

            **What the notebook's questions are after:**
            - *Q1, Q2:* $E_1 > 0$ because a standing wave must fit (longest wavelength $2L$); halving $L$ quadruples $E_1$. The $n$th state has $n - 1$ nodes; more nodes, more curvature, more kinetic energy.
            - *Q3:* errors grow with $n$; pick $\Delta x$ small compared with the wavelength of the state you care about.
            - *Q4, Q5:* simulated position measurements scatter randomly but cluster where $|\psi|^2$ is large; rerunning changes the dots, not the curve. The sample mean and spread approach $\langle x\rangle$ and $\sigma_x$ as more samples are taken, with statistical error $\sim\sigma_x/\sqrt N$, but $\sigma_x$ itself does not shrink: it is a property of the state, not of your sample size.
            - *Q6:* $\langle H\rangle = \sum|c_n|^2E_n$ need not be an allowed energy; a single measurement always returns one bar of the chart. Changing a coefficient's **phase** leaves $\langle H\rangle$ and the bars unchanged; changing its **magnitude** does not.
            - *Q7:* at a turning point of $\langle x\rangle(t)$, $\langle p\rangle = m\,d\langle x\rangle/dt = 0$ (Ehrenfest). The density sloshes while $\langle H\rangle$ is constant: only relative phases evolve, the $|c_n|^2$ do not.
            - *Q8:* a single stationary state: $|\Psi|^2$ frozen, though $\Psi$ itself spins as $e^{-iEt/\hbar}$ (a global phase).
            - *Q9, Q10:* finite-well levels lie below the infinite-well ones (leakage gives more room). Bound-state tails decay as $e^{-\kappa|x|}$ with $\kappa = \sqrt{2m(V_0 - E)}/\hbar$ (in the notebook's convention $V = 0$ inside and $V_0$ outside, so this is the energy below the rim). States above the rim oscillate outside: unbound. A nonzero probability outside the well means a position measurement can find the particle in the forbidden region; the state is still stationary and bound (no probability flows away).
            - *Q11:* same coefficients in two different wells give different time dependence because the energies, and so the beat frequencies $(E_m - E_n)/\hbar$, differ.
            - *Q12, Q13:* an attractive well reflects some of a packet even though a classical particle would always pass; faster packets ($k_0 = 1.4$ vs $0.6$) reflect less. Early "left-hand probability" is the incoming packet, not reflection; probability inside the well at intermediate times is temporary, it leaks out (scattering states are not trapped).
          `),
          drill,
          P({
            title: 'Grid error in the box',
            q: md`A box is discretized with $\Delta x = a/10$. Using $E_n^{\text{grid}} = \tfrac{2\hbar^2}{m\Delta x^2}\sin^2\tfrac{n\pi\Delta x}{2a}$, find $E_1^{\text{grid}}/E_1$.`,
            parts: [{ lbl: 'E_1^{\\text{grid}}/E_1', ans: (Math.sin(Math.PI / 20) / (Math.PI / 20)) ** 2 }],
            hints: [md`Ratio $= \left[\sin u/u\right]^2$ with $u = n\pi\Delta x/2a = \pi/20$.`],
            sol: md`$(\sin(\pi/20)/(\pi/20))^2 = 0.9918$: 0.8% low. For $n = 5$, $u = \pi/4$: 0.81, 19% low.`,
          }),
          P({
            title: 'Counting states',
            q: md`A finite well has $z_0 = 5$. How many bound states in total, and how many odd?`,
            parts: [{ lbl: 'N', ans: 4 }, { lbl: 'N_{\\text{odd}}', ans: 2 }],
            hints: [md`Branches start at $0, \tfrac\pi2, \pi, \tfrac{3\pi}2, 2\pi$; count those below 5.`],
            sol: md`$0, 1.57, 3.14, 4.71 < 5 < 6.28$: four states, alternating even/odd: two odd.`,
          }),
          Q(md`The notebook prints the matrix $\braket{v_i|v_j}$ for three computed states and gets the identity. This shows the states are…`, ['orthonormal, as eigenvectors of a Hermitian matrix must be', 'statistically independent measurements', 'degenerate', 'not normalized'], 0,
            [null, 'It is a statement about vectors, not about measurement statistics.', 'Different energies; and 1-D bound states are never degenerate.', 'Diagonal entries 1 mean normalized.'],
            'Real symmetric H → orthonormal eigenvectors.'),
          Q(md`Why are the computed energies of high states less accurate on a fixed grid?`, ['Their wavelength 2a/n approaches the grid spacing, so the difference formula for ψ″ fails', 'The solver runs out of iterations', 'High states are not normalizable', 'They have more nodes, which the solver skips'], 0,
            [null, 'Eigen-solvers are exact up to round-off for these sizes.', 'They are normalizable.', 'Nodes are fine; fast wiggles are the problem.'],
            md`Accuracy needs $\Delta x \ll \lambda_n = 2a/n$.`),
          Q(md`More simulated position measurements make the sample standard deviation…`, [md`converge to $\sigma_x$ (not shrink to 0)`, 'shrink toward 0', 'grow', 'equal the grid spacing'], 0,
            [null, md`$\sigma_x$ belongs to the state. What shrinks is the error in your estimate of $\langle x\rangle$, like $\sigma_x/\sqrt N$.`, 'No.', 'Unrelated.'],
            'Better statistics pin down the distribution; they do not narrow it.'),
        ],
      },

      // ------------------------------------------------------------------ HW 4
      {
        id: 'hw4', title: 'Homework 4: Gram–Schmidt, matrices, Cauchy–Schwarz, Pauli',
        steps: [
          R(md`
            **Trains:** the linear algebra of ${T(8, 't8-dirac')} and the Pauli algebra of ${T(10, 't10-qubit')}. Every exam question on the formalism is one of these moves.

            **Habits that prevent most errors:** conjugate when you form a bra ($\braket{u|v} = \sum u_i^*v_i$); reverse order under $\dagger$, transpose and inverse; check results (orthogonality, $BB^{-1} = I$) before moving on.
          `),
          paper('PHYS 486 · Homework 4', 'Due 9/30', [
            {
              q: md`**1. Gram–Schmidt.** Orthonormalize $\ket{e_1} = (1 + i,\ 1,\ i)$, $\ket{e_2} = (i,\ 3,\ 1)$, $\ket{e_3} = (0,\ 28,\ 0)$.`,
              ans: md`$\ket{e_1'} = \tfrac12(1 + i,\ 1,\ i)$, $\ket{e_2'} = \tfrac{1}{\sqrt7}(-1,\ 2,\ 1 - i)$, $\ket{e_3'} = \tfrac{1}{\sqrt{140}}(1 - 7i,\ 5,\ -8 + i)$.`,
              sol: md`
                **How to see it.** Normalize the first; from each next vector subtract its components along the ones already built ($\braket{e_k'|e_j}\ket{e_k'}$, the conjugate on the *bra*), then normalize.

                **1.** $\braket{e_1|e_1} = 2 + 1 + 1 = 4$, so $\ket{e_1'} = \tfrac12(1 + i, 1, i)$.

                **2.** $\braket{e_1'|e_2} = \tfrac12\left[(1 - i)i + 3 + (-i)(1)\right] = \tfrac12(i + 1 + 3 - i) = 2$. Subtract: $(i, 3, 1) - (1 + i, 1, i) = (-1, 2, 1 - i)$, norm$^2$ $= 1 + 4 + 2 = 7$.

                **3.** $\braket{e_1'|e_3} = 14$, $\braket{e_2'|e_3} = 56/\sqrt7$. Subtract $14\ket{e_1'} = (7 + 7i, 7, 7i)$ and $\tfrac{56}{\sqrt7}\ket{e_2'} = (-8, 16, 8 - 8i)$ from $(0, 28, 0)$: $(1 - 7i,\ 5,\ -8 + i)$, norm$^2$ $= 50 + 25 + 65 = 140$.

                **Check:** $\braket{e_1'|e_3'} \propto (1 - i)(1 - 7i) + 5 + (-i)(-8 + i) = (-6 - 8i) + 5 + (1 + 8i) = 0$ ✓.
              `,
            },
            {
              q: md`**2. Matrix arithmetic.** $A = \begin{pmatrix}-1 & 1 & i\\ 2 & 0 & 3\\ 2i & -2i & 2\end{pmatrix}$, $B = \begin{pmatrix}2 & 0 & -i\\ 0 & 1 & 0\\ i & 3 & 2\end{pmatrix}$. Find $A + B$, $AB$, $[A, B]$, $\tilde A$, $A^*$, $A^\dagger$, $\det B$, $B^{-1}$. Check $BB^{-1} = I$. Does $A$ have an inverse?`,
              ans: md`
                $A + B = \begin{pmatrix}1 & 1 & 0\\ 2 & 1 & 3\\ 3i & 3 - 2i & 4\end{pmatrix}$, $AB = \begin{pmatrix}-3 & 1 + 3i & 3i\\ 4 + 3i & 9 & 6 - 2i\\ 6i & 6 - 2i & 6\end{pmatrix}$, $[A, B] = \begin{pmatrix}-3 & 1 + 3i & 3i\\ 2 + 3i & 9 & 3 - 2i\\ -6 + 3i & 6 + i & -6\end{pmatrix}$

                $\tilde A = \begin{pmatrix}-1 & 2 & 2i\\ 1 & 0 & -2i\\ i & 3 & 2\end{pmatrix}$, $A^* = \begin{pmatrix}-1 & 1 & -i\\ 2 & 0 & 3\\ -2i & 2i & 2\end{pmatrix}$, $A^\dagger = \begin{pmatrix}-1 & 2 & -2i\\ 1 & 0 & 2i\\ -i & 3 & 2\end{pmatrix}$

                $\det B = 3$, $B^{-1} = \tfrac13\begin{pmatrix}2 & -3i & i\\ 0 & 3 & 0\\ -i & -6 & 2\end{pmatrix}$. $\det A = 0$: no inverse.
              `,
              sol: md`
                **How to see it.** Mechanical, but organize: $[A, B] = AB - BA$ needs $BA$ too: $BA = \begin{pmatrix}0 & 0 & 0\\ 2 & 0 & 3\\ 6 + 3i & -3i & 12\end{pmatrix}$. $\tilde A$ swaps rows and columns; $A^*$ conjugates entries; $A^\dagger$ does both.

                $\det B$: expand along the middle row (it is mostly zeros): $1\cdot\det\begin{pmatrix}2 & -i\\ i & 2\end{pmatrix} = 4 - (-i)(i) = 4 - 1 = 3$.

                $B^{-1} = \tfrac{1}{\det B}\,(\text{cofactor matrix})^T$. Check one row: row 1 of $B$ times column 1 of $B^{-1}$: $\tfrac13\left[2\cdot2 + 0 + (-i)(-i)\right] = \tfrac13(4 - 1) = 1$ ✓.

                $\det A$: look before expanding. Row 3 is $(2i, -2i, 2) = -2i\times(-1, 1, i) = -2i\times$ row 1. Dependent rows mean $\det A = 0$, so $A$ has no inverse (it squashes some direction to zero).
              `,
            },
            {
              q: md`**3. Products.** Prove $\widetilde{ST} = \tilde T\tilde S$, $(ST)^\dagger = T^\dagger S^\dagger$, $(ST)^{-1} = T^{-1}S^{-1}$. Is a product of unitaries unitary? When is a product of Hermitians Hermitian? Is a sum of unitaries unitary? A sum of Hermitians Hermitian?`,
              ans: md`Index proofs below. Product of unitaries: yes. Product of Hermitians: Hermitian iff they commute. Sum of unitaries: not in general. Sum of Hermitians: always.`,
              sol: md`
                **Transpose:** $(\widetilde{ST})_{ij} = (ST)_{ji} = \sum_kS_{jk}T_{ki} = \sum_k\tilde T_{ik}\tilde S_{kj} = (\tilde T\tilde S)_{ij}$. **Dagger:** conjugate both sides of that. **Inverse:** $(T^{-1}S^{-1})(ST) = T^{-1}(S^{-1}S)T = I$.

                **Unitary product:** $(UV)^\dagger(UV) = V^\dagger U^\dagger UV = V^\dagger V = I$ ✓. **Hermitian product:** $(HK)^\dagger = KH$, equal to $HK$ only if $[H, K] = 0$. **Sum of unitaries:** $I + I = 2I$ is not unitary. **Sum of Hermitians:** $(H + K)^\dagger = H + K$ ✓.

                **Intuition:** unitaries are rotations; rotations compose into rotations, but adding two rotations is not a rotation.
              `,
            },
            {
              q: md`**4. Cauchy–Schwarz.** Prove $|\braket{v|w}|^2 \le \braket{v|v}\braket{w|w}$. (Hint: build an orthonormal basis whose first member is $\ket w/\sqrt{\braket{w|w}}$.)`,
              ans: md`In that basis $\braket{w|v} = \sqrt{\braket{w|w}}\,v_1$, so $|\braket{w|v}|^2 = \braket{w|w}|v_1|^2 \le \braket{w|w}\sum_i|v_i|^2 = \braket{w|w}\braket{v|v}$.`,
              sol: md`
                **How to see it.** Choose coordinates where $\ket w$ points along the first axis. Then $\braket{w|v}$ only sees $v$'s first component, and one component can never exceed the whole length.

                Gram–Schmidt from $\ket{1} = \ket w/\sqrt{\braket{w|w}}$ gives an orthonormal basis $\{\ket i\}$. Expand $\ket v = \sum v_i\ket i$, $v_i = \braket{i|v}$. Then $\braket{w|v} = \sqrt{\braket{w|w}}\braket{1|v} = \sqrt{\braket{w|w}}\,v_1$, and
                $$|\braket{w|v}|^2 = \braket{w|w}\,|v_1|^2 \le \braket{w|w}\sum_i|v_i|^2 = \braket{w|w}\braket{v|v}$$
                Equality iff all $v_{i>1} = 0$: $\ket v \parallel \ket w$. (This inequality is what powers the uncertainty principle, Topic 9.)
              `,
            },
            {
              q: md`**5. Pauli matrices.** (a) Show they are Hermitian and unitary. (b) For a unit vector $\hat v$, show $e^{i\theta\hat v\cdot\vec\sigma} = \cos\theta\,I + i\sin\theta\,\hat v\cdot\vec\sigma$. (c) Show $[\sigma_j, \sigma_k] = 2i\sum_l\epsilon_{jkl}\sigma_l$.`,
              ans: md`(a) $\sigma^\dagger = \sigma$ by inspection and $\sigma^2 = I$. (b) $(\hat v\cdot\vec\sigma)^2 = I$, eigenvalues $\pm1$; apply $f$ to each. (c) Multiply: $\sigma_x\sigma_y = i\sigma_z$, $\sigma_y\sigma_x = -i\sigma_z$, and cyclically.`,
              sol: md`
                **(a)** Each equals its conjugate transpose ($\sigma_y$: the $-i$ and $i$ swap and conjugate into each other). Each squares to $I$: so $\sigma^\dagger\sigma = \sigma^2 = I$, unitary.

                **(b)** $(\hat v\cdot\vec\sigma)^2 = \sum_{jk}v_jv_k\sigma_j\sigma_k = \sum_jv_j^2I + \sum_{j<k}v_jv_k\{\sigma_j, \sigma_k\} = |\hat v|^2I = I$, because different Paulis anticommute. So $\hat v\cdot\vec\sigma$ is Hermitian with eigenvalues $\pm1$; with projectors $P_\pm = \tfrac12(I \pm \hat v\cdot\vec\sigma)$ the spectral definition gives
                $$e^{i\theta\hat v\cdot\vec\sigma} = e^{i\theta}P_+ + e^{-i\theta}P_- = \cos\theta(P_+ + P_-) + i\sin\theta(P_+ - P_-) = \cos\theta\,I + i\sin\theta\,\hat v\cdot\vec\sigma$$
                (Or by power series: since $(\hat v\cdot\vec\sigma)^2 = I$, the even powers give the cosine series and the odd powers the sine series, exactly as $e^{i\theta} = \cos\theta + i\sin\theta$.)

                **(c)** $\sigma_x\sigma_y = \begin{pmatrix}i & 0\\ 0 & -i\end{pmatrix} = i\sigma_z$ and $\sigma_y\sigma_x = -i\sigma_z$, so $[\sigma_x, \sigma_y] = 2i\sigma_z$; the other pairs follow cyclically, and swapping the order flips the sign, which is exactly what $\epsilon_{jkl}$ encodes. Equal indices commute: $\epsilon_{jjl} = 0$.
              `,
            },
          ]),
          drill,
          P({
            title: 'Gram–Schmidt, smaller',
            q: md`Orthonormalize $\ket{e_1} = (1, 1, 0)$, $\ket{e_2} = (1, 0, 1)$. Enter the third component of $\ket{e_2'}$ (take it positive).`,
            parts: [{ lbl: "(e_2')_3", ans: 2 / Math.sqrt(6) }],
            hints: [md`$\ket{e_2} - \tfrac12(1, 1, 0) = (\tfrac12, -\tfrac12, 1)$.`],
            sol: md`$\ket{e_2'} = \tfrac{1}{\sqrt6}(1, -1, 2)$: third component $0.816$.`,
          }),
          P({
            title: 'Determinant',
            q: md`Find $\det\begin{pmatrix}1 & i\\ -i & 2\end{pmatrix}$.`,
            parts: [{ lbl: '\\det', ans: 1 }],
            hints: [md`$ad - bc$ with $bc = i\cdot(-i)$.`],
            sol: md`$2 - (i)(-i) = 2 - 1 = 1$.`,
          }),
          Q(md`$A$, $B$ Hermitian. Which is **always** Hermitian?`, [md`$i[A, B]$`, md`$AB$`, md`$[A, B]$`, md`$iAB$`], 0,
            [null, 'Only if they commute.', md`$[A, B]^\dagger = -[A, B]$: anti-Hermitian.`, 'No.'],
            md`$(i[A, B])^\dagger = -i[A, B]^\dagger = -i(-[A, B]) = i[A, B]$.`),
          P({
            title: 'Pauli exponential',
            q: md`Find $|\bra0e^{i\theta\sigma_x}\ket0|$ at $\theta = \pi/3$.`,
            parts: [{ lbl: '|\\ldots|', ans: 0.5 }],
            hints: [md`$e^{i\theta\sigma_x} = \cos\theta\,I + i\sin\theta\,\sigma_x$, and $\bra0\sigma_x\ket0 = 0$.`],
            sol: md`$\cos(\pi/3) = 0.5$.`,
          }),
          Q(md`$(ST)^{-1} = $?`, [md`$T^{-1}S^{-1}$`, md`$S^{-1}T^{-1}$`, md`$(TS)^{-1}$`, md`$S^\dagger T^\dagger$`], 0,
            [null, 'Order reverses.', md`$(TS)^{-1} = S^{-1}T^{-1}$, different.`, 'Only for unitaries, and then still in reverse order.'],
            'Undo the last thing done first.'),
        ],
      },
    ],
  });
})();

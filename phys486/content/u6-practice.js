/* Unit 6 — ten practice midterms built on the homework problem types. 1–3 exam level, 4–7 harder, 8–10 harder than
   the exam. Each: four problems on paper with full solutions behind reveal buttons, then a box to check final numbers. */
(function () {
  'use strict';
  const { R, P } = C;
  const LEVEL = ['', 'exam level', 'exam level', 'exam level', 'harder', 'harder', 'harder', 'harder', 'harder than the exam', 'harder than the exam', 'hardest'];
  const pm = (n, items, check) => ({
    id: `pm${n}`, title: `Practice midterm ${n}`, sub: LEVEL[n],
    steps: [
      R(md`**${LEVEL[n][0].toUpperCase() + LEVEL[n].slice(1)}.** Four problems, 25 points each. Give yourself 75 minutes, the formula sheet and nothing else. Write the strategy before calculating (it earns points). Then reveal each solution and grade yourself honestly; redo anything below 20/25 a day later.`),
      { t: 'paper', html: `<div class="pp-title"><span>PHYS 486 · Practice Midterm ${n}</span><span>100 pts · 75 min</span></div>`, items },
      R(md`### Check your final numbers`),
      P(Object.assign({ title: `Practice midterm ${n}: key results` }, check)),
    ],
  });

  C.unit({
    id: 'u6', exam: 'm1', num: 'Unit 6', title: 'Practice midterms',
    blurb: 'Ten timed practice exams on the homework problem types, getting harder.',
    lessons: [
      pm(1, [
        {
          q: md`**1. A one-sided wavefunction.** $\Psi(x, 0) = Axe^{-bx}$ for $x > 0$, $0$ for $x < 0$ ($b > 0$). (a) Find $A$. (b) Most probable position, $\langle x\rangle$, $\sigma_x$. (c) $\langle p\rangle$, $\langle p^2\rangle$; check the uncertainty principle. (d) Probability that $x > 1/b$.`,
          ans: md`$A = 2b^{3/2}$; $x_{\text{mp}} = 1/b$, $\langle x\rangle = \tfrac{3}{2b}$, $\sigma_x = \tfrac{\sqrt3}{2b}$; $\langle p\rangle = 0$, $\langle p^2\rangle = \hbar^2b^2$, $\sigma_x\sigma_p = \tfrac{\sqrt3}{2}\hbar$; $P = 5e^{-2} = 0.677$.`,
          sol: md`
            Use $\int_0^\infty x^ne^{-2bx}dx = n!/(2b)^{n+1}$ throughout.

            **(a)** $A^2\cdot\tfrac{2}{8b^3} = 1 \Rightarrow A = 2b^{3/2}$.

            **(b)** Maximize $x^2e^{-2bx}$: $2x - 2bx^2 = 0 \Rightarrow x = 1/b$. $\langle x\rangle = 4b^3\cdot\tfrac{6}{16b^4} = \tfrac{3}{2b}$ (mean right of the peak: long tail). $\langle x^2\rangle = 4b^3\cdot\tfrac{24}{32b^5} = \tfrac{3}{b^2}$, so $\sigma^2 = \tfrac{3}{b^2} - \tfrac{9}{4b^2} = \tfrac{3}{4b^2}$.

            **(c)** Real → $\langle p\rangle = 0$. $\Psi' = A(1 - bx)e^{-bx}$; $\int_0^\infty(1 - bx)^2e^{-2bx}dx = \tfrac{1}{2b} - \tfrac{1}{2b} + \tfrac{1}{4b} = \tfrac{1}{4b}$, so $\langle p^2\rangle = \hbar^2\cdot4b^3\cdot\tfrac{1}{4b} = \hbar^2b^2$. $\sigma_x\sigma_p = \tfrac{\sqrt3}{2b}\cdot\hbar b = 0.87\hbar \ge 0.5\hbar$ ✓.

            **(d)** $u = 2bx$: $\tfrac12\int_2^\infty u^2e^{-u}du = \tfrac12e^{-2}(4 + 4 + 2) = 5e^{-2} = 0.677$.
          `,
        },
        {
          q: md`**2. A complex superposition.** In the infinite well, $\Psi(x, 0) = \tfrac{1}{\sqrt2}(\psi_1 + i\psi_2)$. (a) $\Psi(x, t)$. (b) $|\Psi|^2$ and its period. (c) $\langle x\rangle(t)$ (use $\int_0^ax\psi_1\psi_2dx = -\tfrac{16a}{9\pi^2}$). (d) $\langle H\rangle$, $P(E_2)$; time-dependent? (e) $\langle p\rangle(t)$. Compare with $\tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$.`,
          ans: md`$\langle x\rangle = \tfrac a2 - \tfrac{16a}{9\pi^2}\sin\omega t$, $\omega = \tfrac{3\pi^2\hbar}{2ma^2}$; $\langle H\rangle = \tfrac{5\pi^2\hbar^2}{4ma^2}$, $P(E_2) = \tfrac12$ (constant); $\langle p\rangle = -\tfrac{8\hbar}{3a}\cos\omega t$.`,
          sol: md`
            **(a)** $\Psi = \tfrac{1}{\sqrt2}\left(\psi_1e^{-iE_1t/\hbar} + i\psi_2e^{-iE_2t/\hbar}\right)$.

            **(b)** $|\Psi|^2 = \tfrac12\left[\psi_1^2 + \psi_2^2 + 2\psi_1\psi_2\,\text{Re}\left(ie^{-i\omega t}\right)\right] = \tfrac12\left[\psi_1^2 + \psi_2^2 + 2\psi_1\psi_2\sin\omega t\right]$, period $2\pi/\omega = \tfrac{4ma^2}{3\pi\hbar}$.

            **(c)** $\langle x\rangle = \tfrac a2 + \sin\omega t\int x\psi_1\psi_2 = \tfrac a2 - \tfrac{16a}{9\pi^2}\sin\omega t$.

            **(d)** $\tfrac12(E_1 + E_2) = \tfrac52E_1$; $P(E_2) = \tfrac12$. Both constant.

            **(e)** Ehrenfest: $\langle p\rangle = m\tfrac{d\langle x\rangle}{dt} = -m\tfrac{16a}{9\pi^2}\omega\cos\omega t = -\tfrac{8\hbar}{3a}\cos\omega t$.

            **Comparison.** With a real superposition, $\langle x\rangle \propto \cos\omega t$: it starts at a turning point, at rest. The $i$ (relative phase $\pi/2$) starts it at the center, moving at full speed. Same energies, same probabilities, different motion: relative phases are physical.
          `,
        },
        {
          q: md`**3. Steps and barriers.** (a) A particle with $E = \tfrac43V_0$ meets a step up of height $V_0$. Find $R$ and $T$. (b) An electron with $E = 3$ eV meets a barrier of height 4 eV, width 0.3 nm. Find $\kappa$, $\kappa L$ and estimate $T$. Is the thick-barrier formula reliable here? (c) Same numbers for a proton: roughly what is $T$?`,
          ans: md`(a) $R = \tfrac19$, $T = \tfrac89$. (b) $\kappa = 5.12\ \text{nm}^{-1}$, $\kappa L = 1.54$, $T \approx 0.14$ (exact 0.13): borderline, since it needs $\kappa L \gg 1$. (c) $T \sim 10^{-57}$.`,
          sol: md`
            **(a)** $k'/k = \sqrt{(E - V_0)/E} = \tfrac12$, so $R = \left(\tfrac{1 - 1/2}{1 + 1/2}\right)^2 = \tfrac19$, $T = \tfrac89$.

            **(b)** $\kappa = \sqrt{2m(1\text{ eV})}/\hbar = 5.12\times10^9\ \text{m}^{-1}$, $\kappa L = 1.54$. $T \approx \tfrac{16\cdot3\cdot1}{16}e^{-3.07} = 3e^{-3.07} = 0.14$. The exact formula $T^{-1} = 1 + \tfrac{V_0^2\sinh^2\kappa L}{4E(V_0 - E)}$ gives 0.132: the estimate is 5% high because $\kappa L$ is not large.

            **(c)** $\kappa \propto \sqrt m$: $\times\sqrt{1836} = 42.8$, so $2\kappa L \approx 132$ and $T \sim 3e^{-132} \sim 10^{-57}$. Tunneling is an electron phenomenon at these scales.
          `,
        },
        {
          q: md`**4. A 2×2 observable.** $\hat B = \begin{pmatrix}1 & 2\\ 2 & 1\end{pmatrix}$. (a) Hermitian? Eigenvalues, eigenvectors. (b) In $\ket0 = (1, 0)$: outcome probabilities, $\langle B\rangle$, $\sigma_B$. (c) Write $\hat B$ with Paulis; find $[\hat B, \sigma_z]$; check the uncertainty relation for $\hat B$ and $\sigma_z$ in $\ket{+y} = \tfrac{1}{\sqrt2}(1, i)$.`,
          ans: md`(a) Yes; $3$: $\tfrac{1}{\sqrt2}(1, 1)$, $-1$: $\tfrac{1}{\sqrt2}(1, -1)$. (b) $\tfrac12$ each; $\langle B\rangle = 1$, $\sigma_B = 2$. (c) $\hat B = I + 2\sigma_x$; $[\hat B, \sigma_z] = -4i\sigma_y$; bound $2|\langle\sigma_y\rangle| = 2$, actual $\sigma_B\sigma_{\sigma_z} = 2\cdot1 = 2$: saturated.`,
          sol: md`
            **(a)** Real symmetric. tr 2, det $-3$ → $\lambda = 3, -1$.

            **(b)** $|\braket{\pm|0}|^2 = \tfrac12$. $\langle B\rangle = \tfrac32 - \tfrac12 = 1$; $\langle B^2\rangle = \tfrac92 + \tfrac12 = 5$; $\sigma_B = 2$.

            **(c)** $[I + 2\sigma_x, \sigma_z] = 2[\sigma_x, \sigma_z] = 2(-2i\sigma_y)$. Bound: $\left|\tfrac{1}{2i}\langle-4i\sigma_y\rangle\right| = 2|\langle\sigma_y\rangle|$. In $\ket{+y}$: $\langle\sigma_y\rangle = 1$, $\langle\sigma_x\rangle = 0$ so $\sigma_B = 2\sigma_{\sigma_x} = 2$, and $\sigma_{\sigma_z} = 1$: $2 \ge 2$, equality.
          `,
        },
      ], {
        q: md`Enter: P1(d) $P(x > 1/b)$; P1(c) $\sigma_x\sigma_p/\hbar$; P3(a) $R$; P4(b) $\sigma_B$.`,
        parts: [{ lbl: 'P(x > 1/b)', ans: 5 * Math.exp(-2) }, { lbl: '\\sigma_x\\sigma_p/\\hbar', ans: Math.sqrt(3) / 2 }, { lbl: 'R', ans: 1 / 9 }, { lbl: '\\sigma_B', ans: 2 }],
        sol: md`$0.677$, $0.866$, $0.111$, $2$.`,
      }),

      pm(2, [
        {
          q: md`**1. A moving Gaussian.** A free particle starts in $\Psi(x, 0) = (2a/\pi)^{1/4}e^{-ax^2}e^{ik_0x}$. (a) $\langle x\rangle$, $\sigma_x$. (b) Describe $\phi(k)$; find $\langle p\rangle$, $\langle p^2\rangle$, $\langle H\rangle$. (c) Where is the center at time $t$? Does $\sigma_p$ change? (d) Phase and group velocity.`,
          ans: md`(a) 0, $\tfrac{1}{2\sqrt a}$. (b) Gaussian centered at $k_0$, width $\sigma_k = \sqrt a$; $\hbar k_0$, $\hbar^2(k_0^2 + a)$, $\tfrac{\hbar^2(k_0^2 + a)}{2m}$. (c) $\hbar k_0t/m$; no. (d) $v_{\text{ph}} = \tfrac{\hbar k_0}{2m}$, $v_g = \tfrac{\hbar k_0}{m}$.`,
          sol: md`$e^{ik_0x}$ has modulus 1, so $|\Psi|^2$ is the plain Gaussian: centered at 0, $\sigma_x = 1/2\sqrt a$. Multiplying by $e^{ik_0x}$ shifts $\phi(k)$ to center $k_0$ (shift theorem). $\langle k^2\rangle = k_0^2 + \sigma_k^2$. The free $\hat H$ commutes with $\hat p$: $|\phi(k)|^2$, hence $\sigma_p$, never changes; Ehrenfest moves the center at $\langle p\rangle/m$. The crests move at half that.`,
        },
        {
          q: md`**2. A box in the middle.** Infinite well $[0, a]$: $\Psi(x, 0) = \sqrt{2/a}$ for $a/4 < x < 3a/4$, zero elsewhere. (a) Which $c_n$ vanish, without integrating? (b) Find $c_n$, $P(E_1)$, $P(E_3)$. (c) Show $P(E_n) = \tfrac{8}{n^2\pi^2}$ for odd $n$ and check they sum to 1 ($\sum_{\text{odd}}1/n^2 = \pi^2/8$). (d) $\langle H\rangle$?`,
          ans: md`(a) Even $n$. (b) $c_n = \tfrac{2}{n\pi}\left[\cos\tfrac{n\pi}{4} - \cos\tfrac{3n\pi}{4}\right]$; $P(E_1) = \tfrac{8}{\pi^2} = 0.811$, $P(E_3) = \tfrac{8}{9\pi^2} = 0.090$. (c) ✓. (d) Infinite.`,
          sol: md`
            **(a)** $\Psi$ is symmetric about $a/2$; even-$n$ states are antisymmetric there.

            **(b)** $c_n = \tfrac2a\int_{a/4}^{3a/4}\sin\tfrac{n\pi x}{a}dx = \tfrac{2}{n\pi}\left[\cos\tfrac{n\pi}{4} - \cos\tfrac{3n\pi}{4}\right]$. For every odd $n$ the bracket is $\pm\sqrt2$: $|c_n|^2 = \tfrac{8}{n^2\pi^2}$.

            **(c)** $\tfrac{8}{\pi^2}\cdot\tfrac{\pi^2}{8} = 1$ ✓.

            **(d)** $\sum P_nE_n = \sum_{\text{odd}}\tfrac{8}{n^2\pi^2}n^2E_1$: every term is $\tfrac{8}{\pi^2}E_1$, so the sum diverges. The jumps in $\Psi$ need arbitrarily short wavelengths: infinite kinetic energy. (Directly: $\int|\Psi'|^2$ has delta functions squared.)
          `,
        },
        {
          q: md`**3. A finite well.** An electron in a well of half-width $a = 0.5$ nm has $z_0 = 3$. (a) Find $V_0$ in eV. (b) Number and parity of bound states; sketch them. (c) The well is made 4 times deeper. How many bound states now?`,
          ans: md`(a) 1.37 eV. (b) 2: even (no node), odd (one node). (c) $z_0 = 6$: 4.`,
          sol: md`$V_0 = \tfrac{z_0^2\hbar^2}{2ma^2} = 9\times0.152\ \text{eV} = 1.37$ eV ($\hbar^2/2ma^2 = 0.152$ eV for $a = 0.5$ nm). $\pi/2 < 3 < \pi$: branches starting at 0 and $\pi/2$ cross. Depth ×4 → $z_0 \propto\sqrt{V_0}$ doubles to 6: branches at $0, \pi/2, \pi, 3\pi/2$ ($4.71 < 6 < 6.28$): four states.`,
        },
        {
          q: md`**4. Qubit.** $\ket\psi = \tfrac{1}{\sqrt2}(\ket0 + e^{i\pi/4}\ket1)$. (a) Bloch vector. (b) $P(\sigma_x = +1)$, $P(\sigma_y = +1)$, $P(\sigma_z = +1)$. (c) With $\hat H = \tfrac{\hbar\omega}{2}\sigma_z$, the first time the state is $\ket{+x}$. (d) $\langle\sigma_y\rangle(t)$.`,
          ans: md`(a) $(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}, 0)$. (b) $0.854$, $0.854$, $0.5$. (c) $t = \tfrac{7\pi}{4\omega}$. (d) $\sin(\tfrac\pi4 + \omega t)$.`,
          sol: md`$\theta = \pi/2$, $\varphi = \pi/4$: on the equator halfway between $x$ and $y$. $P(+\hat m) = \tfrac12(1 + \hat n\cdot\hat m)$: $\tfrac12(1 + 0.707)$ for $x$ and $y$, $\tfrac12$ for $z$. The field precesses $\varphi \to \varphi + \omega t$; $\ket{+x}$ is $\varphi = 2\pi$: $\omega t = 7\pi/4$. $\langle\sigma_y\rangle = \sin\varphi(t)$.`,
        },
      ], {
        q: md`Enter: P2 $P(E_1)$; P3(a) $V_0$ in eV; P4(b) $P(\sigma_x = +1)$.`,
        parts: [{ lbl: 'P(E_1)', ans: 8 / Math.PI ** 2 }, { lbl: 'V_0', ans: 1.3716, unit: 'eV' }, { lbl: 'P(+x)', ans: (1 + Math.SQRT1_2) / 2 }],
        sol: md`$0.811$, $1.37$ eV, $0.854$.`,
      }),

      pm(3, [
        {
          q: md`**1. A moving cusp.** $\Psi(x, 0) = \tfrac{1}{\sqrt b}e^{-|x|/b}e^{ik_0x}$, free particle. (a) Normalized? (b) $\langle p\rangle$, $\langle p^2\rangle$, $\langle H\rangle$ (careful at the cusp). (c) The probability current $J(x)$; interpret. (d) Is $J$ continuous at $x = 0$?`,
          ans: md`(a) Yes. (b) $\hbar k_0$; $\hbar^2(k_0^2 + 1/b^2)$; $\tfrac{\hbar^2}{2m}(k_0^2 + 1/b^2)$. (c) $J = \tfrac{\hbar k_0}{mb}e^{-2|x|/b}$: the density times $\hbar k_0/m$. (d) Yes.`,
          sol: md`$\int\tfrac1be^{-2|x|/b} = 1$ ✓. $\Psi' = (ik_0 \mp 1/b)\Psi$, so $|\Psi'|^2 = (k_0^2 + 1/b^2)|\Psi|^2$ and $\langle p^2\rangle = \hbar^2(k_0^2 + 1/b^2)$ (no delta-function trouble with $\int|\Psi'|^2$). $\langle p\rangle = \hbar k_0$ by the phase-factor rule. $J = \tfrac{\hbar}{m}\text{Im}(\Psi^*\Psi') = \tfrac{\hbar k_0}{m}|\Psi|^2$: the whole cusp flows right at speed $\hbar k_0/m$. $\Psi'$ jumps at 0, but the jump is a real multiple of $\Psi$, which drops out of $\text{Im}(\Psi^*\Psi')$.`,
        },
        {
          q: md`**2. Measure, then move the wall.** A particle is in $\psi_2$ of the well $[0, a]$. (a) Probability it is found in $0 < x < a/4$. (b) Instead, energy is measured: result? (c) Then the wall at $a$ suddenly moves to $2a$. Which new level equals $E_2$, and with what probability is it found? (d) $\langle H\rangle$ just after the move?`,
          ans: md`(a) $\tfrac14$. (b) $E_2$, certain. (c) $E_4' = E_2$; $P = \tfrac12$. (d) $E_2$.`,
          sol: md`
            **(a)** $\tfrac2a\int_0^{a/4}\sin^2\tfrac{2\pi x}{a}dx$ covers a quarter period of $\sin^2$ from 0 to its peak, average $\tfrac12$: $\tfrac2a\cdot\tfrac a4\cdot\tfrac12 = \tfrac14$.

            **(c)** $E_n' = \tfrac{n^2\pi^2\hbar^2}{2m(2a)^2} = E_2$ for $n = 4$. $\psi_4' = \tfrac{1}{\sqrt a}\sin\tfrac{2\pi x}{a}$, the old shape on $[0, a]$ continued: $c_4' = \tfrac{\sqrt2}{a}\int_0^a\sin^2\tfrac{2\pi x}{a}dx = \tfrac{1}{\sqrt2}$, $P = \tfrac12$.

            **(d)** The wavefunction did not change, and inside the old region $\hat H = \hat p^2/2m$: $\langle H\rangle = E_2$. The other half of the probability is spread over levels above and below $E_2$.
          `,
        },
        {
          q: md`**3. How fast packets spread.** A Gaussian of initial width $\sigma_0$ has $\sigma(t) = \sigma_0\sqrt{1 + (\hbar t/2m\sigma_0^2)^2}$. Find the doubling time for (a) an electron with $\sigma_0 = 0.1$ nm, (b) a proton with the same $\sigma_0$, (c) a 1 μg dust grain with $\sigma_0 = 1$ μm. (d) Explain physically.`,
          ans: md`$t_2 = \tfrac{2\sqrt3\,m\sigma_0^2}{\hbar}$: (a) $3.0\times10^{-16}$ s; (b) $5.5\times10^{-13}$ s; (c) $3.3\times10^{13}$ s ≈ 1 million years.`,
          sol: md`$\hbar t/2m\sigma_0^2 = \sqrt3$. Physically: the momentum spread $\hbar/2\sigma_0$ means a velocity spread $\hbar/2m\sigma_0$; the packet doubles once that spread has carried the parts about $\sqrt3\,\sigma_0$ apart. Light and tightly localized means fast; heavy and broad means effectively never.`,
        },
        {
          q: md`**4. Commutators drive spreading.** Free particle. (a) Show $[\hat x, \hat p^2] = 2i\hbar\hat p$ and $[\hat x^2, \hat p^2] = 2i\hbar(\hat x\hat p + \hat p\hat x)$. (b) Show $\tfrac{d}{dt}\langle x^2\rangle = \tfrac1m\langle xp + px\rangle$ and $\tfrac{d}{dt}\langle xp + px\rangle = \tfrac2m\langle p^2\rangle$. (c) Hence find $\langle x^2\rangle(t)$ for a state with $\langle x\rangle = \langle p\rangle = \langle xp + px\rangle = 0$ at $t = 0$, and compare with Problem 3.`,
          ans: md`(c) $\sigma_x^2(t) = \sigma_x^2(0) + \tfrac{\sigma_p^2}{m^2}t^2$: matches the Gaussian with $\sigma_p = \hbar/2\sigma_0$.`,
          sol: md`
            **(a)** $[\hat x, \hat p^2] = [\hat x, \hat p]\hat p + \hat p[\hat x, \hat p] = 2i\hbar\hat p$. $[\hat x^2, \hat p^2] = \hat x[\hat x, \hat p^2] + [\hat x, \hat p^2]\hat x = 2i\hbar(\hat x\hat p + \hat p\hat x)$.

            **(b)** $\tfrac{d}{dt}\langle Q\rangle = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle$ with $\hat H = \hat p^2/2m$: $\tfrac{i}{2m\hbar}\langle[\hat p^2, \hat x^2]\rangle = \tfrac{i}{2m\hbar}(-2i\hbar)\langle xp + px\rangle$ ✓. Similarly $[\hat p^2, \hat x\hat p + \hat p\hat x] = -4i\hbar\hat p^2$ ✓.

            **(c)** $\langle p^2\rangle$ is constant, so $\langle x^2\rangle$ is exactly quadratic in $t$: $\sigma_0^2 + \tfrac{\sigma_p^2}{m^2}t^2$. With $\sigma_p = \hbar/2\sigma_0$ this is Problem 3's formula: the Gaussian result holds for **any** initial shape with no initial correlation.
          `,
        },
      ], {
        q: md`Enter: P2(a); P3(a) doubling time of the electron.`,
        parts: [{ lbl: 'P', ans: 0.25 }, { lbl: 't_2', ans: 2.992e-16, unit: 's' }],
        sol: md`$0.25$, $3.0\times10^{-16}$ s.`,
      }),

      pm(4, [
        {
          q: md`**1. A trig identity in the well.** $\Psi(x, 0) = A\sin^3(\pi x/a)$ on $[0, a]$. Using $\sin^3u = \tfrac34\sin u - \tfrac14\sin3u$: (a) $A$, $c_n$. (b) $P(E_n)$, $\langle H\rangle$. (c) $\langle x\rangle(t)$. (d) Period of $|\Psi(x, t)|^2$.`,
          ans: md`(a) $A = \tfrac{4}{\sqrt{5a}}$; $c_1 = \tfrac{3}{\sqrt{10}}$, $c_3 = -\tfrac{1}{\sqrt{10}}$, others 0. (b) $\tfrac{9}{10}$, $\tfrac1{10}$; $\langle H\rangle = \tfrac95E_1 = \tfrac{9\pi^2\hbar^2}{10ma^2}$. (c) $a/2$, constant. (d) $\tfrac{ma^2}{2\pi\hbar}$.`,
          sol: md`
            **No integrals.** $\Psi = A\sqrt{\tfrac a2}\left(\tfrac34\psi_1 - \tfrac14\psi_3\right)$: the expansion is the identity. Normalize: $A^2\tfrac a2\cdot\tfrac{10}{16} = 1$.

            **(b)** $\langle H\rangle = \tfrac{9}{10}E_1 + \tfrac{1}{10}9E_1 = 1.8E_1$.

            **(c)** Both states are symmetric about $a/2$, and so is every cross term: $\langle x\rangle = a/2$ always, even though $|\Psi|^2$ changes shape (it "breathes").

            **(d)** $\omega = (E_3 - E_1)/\hbar = 8E_1/\hbar = \tfrac{4\pi^2\hbar}{ma^2}$; $T = 2\pi/\omega$.
          `,
        },
        {
          q: md`**2. Momentum space.** $\psi(x) = \sqrt\kappa\,e^{-\kappa|x|}$. (a) Find $\Phi(p)$ and check normalization. (b) Most likely momentum. (c) $P(|p| < \hbar\kappa)$. (d) $\langle p^2\rangle$ both ways.`,
          ans: md`(a) $\Phi = \sqrt{\tfrac2\pi}\dfrac{(\hbar\kappa)^{3/2}}{p^2 + (\hbar\kappa)^2}$. (b) 0. (c) $\tfrac12 + \tfrac1\pi = 0.818$. (d) $\hbar^2\kappa^2$.`,
          sol: md`
            **(a)** $\Phi = \tfrac{1}{\sqrt{2\pi\hbar}}\int\sqrt\kappa e^{-\kappa|x|}e^{-ipx/\hbar}dx = \sqrt{\tfrac{\kappa}{2\pi\hbar}}\cdot\tfrac{2\kappa}{\kappa^2 + p^2/\hbar^2}$. With $\beta = \hbar\kappa$ and $\int\tfrac{dp}{(p^2 + \beta^2)^2} = \tfrac{\pi}{2\beta^3}$: $\int|\Phi|^2 = 1$ ✓.

            **(c)** $u = p/\beta$: $\tfrac2\pi\int_{-1}^1\tfrac{du}{(1 + u^2)^2} = \tfrac2\pi\left(\tfrac12 + \tfrac\pi4\right)$. (The same integral as HW 1 #1: a Lorentzian squared.)

            **(d)** $\hbar^2\int|\psi'|^2 = \hbar^2\kappa^2$; $\int p^2|\Phi|^2 = \tfrac{2\beta^3}{\pi}\cdot\tfrac{\pi}{2\beta} = \beta^2$ ✓.
          `,
        },
        {
          q: md`**3. Degenerate measurement.** $\hat A = \begin{pmatrix}1 & 0 & 0\\ 0 & 0 & 1\\ 0 & 1 & 0\end{pmatrix}$, $\ket\psi = \tfrac{1}{\sqrt3}(1, 1, i)$. (a) Eigenvalues, eigenvectors. (b) $P(\pm1)$, $\langle A\rangle$. (c) The result is $+1$: the state right after? Then $P(\text{found in }\ket1)$? (d) With $\hat H = \text{diag}(0, 0, \hbar\omega)$, find $\langle A\rangle(t)$.`,
          ans: md`(a) $+1$: $(1, 0, 0)$ and $\tfrac{1}{\sqrt2}(0, 1, 1)$; $-1$: $\tfrac{1}{\sqrt2}(0, 1, -1)$. (b) $\tfrac23$, $\tfrac13$; $\tfrac13$. (c) $\tfrac{1}{\sqrt2}\left(1, \tfrac{1 + i}{2}, \tfrac{1 + i}{2}\right)$; $\tfrac12$. (d) $\tfrac13(1 + 2\sin\omega t)$.`,
          sol: md`
            **(b)** $P(-1) = \left|\tfrac{1}{\sqrt6}(1 - i)\right|^2 = \tfrac13$. Directly: $\bra\psi\hat A\ket\psi = |\psi_1|^2 + 2\text{Re}(\psi_2^*\psi_3) = \tfrac13 + \tfrac23\text{Re}(i) = \tfrac13$, and $\langle A\rangle = \tfrac23 - \tfrac13$ ✓.

            **(c)** Degenerate eigenvalue: project onto the whole $+1$ eigenspace (keep the components along both eigenvectors) and renormalize. Component along $\tfrac{1}{\sqrt2}(0, 1, 1)$: $\tfrac{1 + i}{\sqrt6}$, giving $\tfrac{1 + i}{2\sqrt3}(0, 1, 1)$; plus $\tfrac{1}{\sqrt3}(1, 0, 0)$. Norm$^2$ $= \tfrac23$. Then $|\psi_1'|^2 = \tfrac{1/3}{2/3} = \tfrac12$.

            **(d)** $\psi_3 \to \tfrac{i}{\sqrt3}e^{-i\omega t}$; $\langle A\rangle = |\psi_1|^2 + 2\text{Re}(\psi_2^*\psi_3) = \tfrac13 + \tfrac23\sin\omega t$. It moves because $[\hat A, \hat H] \ne 0$.
          `,
        },
        {
          q: md`**4. Saturating the uncertainty bound.** $\ket\psi = \cos\tfrac\theta2\ket0 + \sin\tfrac\theta2\ket1$. (a) $\langle\sigma_x\rangle$, $\langle\sigma_y\rangle$, $\langle\sigma_z\rangle$. (b) Compute $\Delta\sigma_x\Delta\sigma_y$ and its bound; when is it saturated? (c) Under $\hat H = \tfrac{\hbar\omega}{2}\sigma_z$, is the bound still saturated at $\omega t = \pi/4$?`,
          ans: md`(a) $\sin\theta$, 0, $\cos\theta$. (b) $|\cos\theta| \ge |\cos\theta|$: saturated for every $\theta$. (c) No (unless $\sin\theta = 0$).`,
          sol: md`
            **(b)** $\sigma_j^2 = I$ so $\Delta\sigma_j = \sqrt{1 - \langle\sigma_j\rangle^2}$: $\Delta\sigma_x = |\cos\theta|$, $\Delta\sigma_y = 1$. Bound from $[\sigma_x, \sigma_y] = 2i\sigma_z$: $|\langle\sigma_z\rangle| = |\cos\theta|$. Equal.

            **(c)** Now $\langle\vec\sigma\rangle = (s\cos\omega t, s\sin\omega t, c)$ with $s = \sin\theta$. At $\omega t = \pi/4$: $(\Delta\sigma_x\Delta\sigma_y)^2 = (1 - s^2/2)^2 = 1 - s^2 + s^4/4 > 1 - s^2 = c^2$. Saturation needs the Bloch vector in the $x$–$z$ plane here; precession takes it out.
          `,
        },
      ], {
        q: md`Enter: P1 $\langle H\rangle/E_1$; P2(c); P3(b) $\langle A\rangle$; P3(d) $\langle A\rangle$ at $\omega t = \pi/2$.`,
        parts: [{ lbl: '\\langle H\\rangle/E_1', ans: 1.8 }, { lbl: 'P(|p| < \\hbar\\kappa)', ans: 0.5 + 1 / Math.PI }, { lbl: '\\langle A\\rangle(0)', ans: 1 / 3 }, { lbl: '\\langle A\\rangle(\\pi/2\\omega)', ans: 1 }],
        sol: md`$1.8$, $0.818$, $0.333$, $1$.`,
      }),

      pm(5, [
        {
          q: md`**1. The well doubles symmetrically.** A particle is in the ground state of $[0, a]$. Both walls move out suddenly to $[-a/2, 3a/2]$. (a) Which new levels can be found? (b) $P(E_1')$. (c) $\langle H\rangle$ in units of $E_1'$. (d) Compare with moving only one wall ($P = 32/9\pi^2$).`,
          ans: md`(a) Odd $n'$ only. (b) $\tfrac{64}{9\pi^2} = 0.721$. (c) 4. (d) Twice as likely: no probability is wasted on even states.`,
          sol: md`
            **(a)** The old state is symmetric about $a/2$, the center of the new well; new even-$n'$ states are antisymmetric there.

            **(b)** $\psi_1' = \tfrac{1}{\sqrt a}\sin\tfrac{\pi(x + a/2)}{2a}$. With $u = \pi x/a$: $c_1' = \tfrac{\sqrt2}{\pi}\int_0^\pi\sin u\,\sin\left(\tfrac u2 + \tfrac\pi4\right)du = \tfrac{\sqrt2}{\pi}\cdot\tfrac{4\sqrt2}{3} = \tfrac{8}{3\pi}$ (product-to-sum).

            **(c)** $\Psi$ unchanged → $\langle H\rangle = E_1 = 4E_1'$.

            **(d)** One-wall expansion: the state is lopsided in the new well and overlaps even states too; here symmetry funnels the probability into odd states.
          `,
        },
        {
          q: md`**2. Designing a well.** (a) For which depths does a finite well of half-width $a$ have exactly 3 bound states? (b) For $z_0 = 2$, the ground state has $z = 1.030$. Find the probability of finding the particle outside the well.`,
          ans: md`(a) $\tfrac{\pi^2\hbar^2}{2ma^2} < V_0 \le \tfrac{9\pi^2\hbar^2}{8ma^2}$. (b) 0.098.`,
          sol: md`
            **(a)** Three states needs $\pi < z_0 \le 3\pi/2$ (the third branch starts at $\pi$, the fourth at $3\pi/2$). $V_0 = z_0^2\hbar^2/2ma^2$.

            **(b)** Inside, $\cos(\ell x)$: $\int_{-a}^a\cos^2 = a\left(1 + \tfrac{\sin2z}{2z}\right)$. Outside, $\cos^2z\,e^{-2\kappa(|x| - a)}$ on both sides: $\tfrac{\cos^2z}{\kappa}$. With $\kappa a = \sqrt{4 - z^2} = 1.715$: $P_{\text{out}} = \dfrac{\cos^2z/\kappa a}{1 + \tfrac{\sin2z}{2z} + \cos^2z/\kappa a} = \dfrac{0.155}{1.430 + 0.155} = 0.098$. About 10% of the time the particle is where classically it cannot be.
          `,
        },
        {
          q: md`**3. Constant force, exactly.** $\hat H = \tfrac{\hat p^2}{2m} - F\hat x$. (a) $\tfrac{d}{dt}\langle x\rangle$, $\tfrac{d}{dt}\langle p\rangle$. (b) $\langle x\rangle(t)$ given $\langle x\rangle_0$, $\langle p\rangle_0$. (c) Show $\sigma_p$ is constant.`,
          ans: md`(a) $\langle p\rangle/m$, $F$. (b) $\langle x\rangle_0 + \tfrac{\langle p\rangle_0}{m}t + \tfrac{F}{2m}t^2$. (c) $\tfrac{d}{dt}\langle p^2\rangle = 2F\langle p\rangle = \tfrac{d}{dt}\langle p\rangle^2$.`,
          sol: md`$[\hat H, \hat x] = -\tfrac{i\hbar}{m}\hat p$; $[\hat H, \hat p] = -F[\hat x, \hat p] = -i\hbar F$. So the averages obey Newton exactly (the force is uniform, so the average force is the force). $[\hat H, \hat p^2] = -F[\hat x, \hat p^2] = -2i\hbar F\hat p$, giving $\tfrac{d}{dt}\langle p^2\rangle = 2F\langle p\rangle$; and $\tfrac{d}{dt}\langle p\rangle^2 = 2\langle p\rangle F$. Their difference, $\sigma_p^2$, is constant: a uniform force accelerates the whole momentum distribution without reshaping it.`,
        },
        {
          q: md`**4. Ramsey interferometry.** Start in $\ket0$. Apply $\hat H = \tfrac{\hbar\Omega}{2}\sigma_x$ for $t = \pi/2\Omega$, then $\hat H = \tfrac{\hbar\omega}{2}\sigma_z$ for time $T$, then the first pulse again. Find $P(\ket1)$ at the end. Why is this a precise clock?`,
          ans: md`$P_1 = \cos^2(\omega T/2)$.`,
          sol: md`Follow the Bloch vector. A $\pi/2$ rotation about $x$ takes $\hat z \to -\hat y$. Precession about $z$ by $\varphi = \omega T$: $(\sin\varphi, -\cos\varphi, 0)$. The second $\pi/2$ about $x$ maps $(x, y, 0) \to (x, 0, y)$: $(\sin\varphi, 0, -\cos\varphi)$. $P_1 = \tfrac12(1 - n_z) = \tfrac12(1 + \cos\varphi) = \cos^2\tfrac{\omega T}{2}$. The final probability oscillates with $T$ at exactly the qubit frequency $\omega$: count fringes to measure $\omega$ (atomic clocks).`,
        },
      ], {
        q: md`Enter: P1(b); P2(b); P4 $P_1$ for $\omega T = \pi/2$.`,
        parts: [{ lbl: "P(E_1')", ans: 64 / (9 * Math.PI ** 2) }, { lbl: 'P_{\\text{out}}', ans: 0.09768 }, { lbl: 'P_1', ans: 0.5 }],
        sol: md`$0.721$, $0.098$, $0.5$.`,
      }),

      pm(6, [
        {
          q: md`**1. Find the potential.** A measured stationary state is $\psi = Axe^{-x^2/2\ell^2}$. (a) Find $V(x)$ and $E$, choosing $V(0) = 0$. (b) What potential is it, and which state? (c) Guess the ground state and its energy, and check.`,
          ans: md`(a) $V = \tfrac{\hbar^2x^2}{2m\ell^4}$, $E = \tfrac{3\hbar^2}{2m\ell^2}$. (b) Oscillator with $\omega = \tfrac{\hbar}{m\ell^2}$; first excited state ($E = \tfrac32\hbar\omega$, one node). (c) $e^{-x^2/2\ell^2}$, $E_0 = \tfrac12\hbar\omega$.`,
          sol: md`$\psi''/\psi = \tfrac{x^2}{\ell^4} - \tfrac{3}{\ell^2}$ (differentiate $xe^{-x^2/2\ell^2}$ twice). $V = E + \tfrac{\hbar^2}{2m}\left(\tfrac{x^2}{\ell^4} - \tfrac{3}{\ell^2}\right)$; $V(0) = 0$ fixes $E$. Note the formula is $0/0$ at the node $x = 0$; take the limit (or use the smooth result). Matching $\tfrac12m\omega^2x^2$ gives $\omega$. The node-free Gaussian: $\psi''/\psi = \tfrac{x^2}{\ell^4} - \tfrac{1}{\ell^2}$, so $E_0 = \tfrac{\hbar^2}{2m\ell^2} = \tfrac12\hbar\omega$. Spacing $\hbar\omega$.`,
        },
        {
          q: md`**2. Falling off a cliff.** A particle with $E = V_0/3$ moves from $V = 0$ onto a **drop** to $V = -V_0$. (a) $R$ and $T$. (b) Classically? (c) Why does a drop reflect at all?`,
          ans: md`(a) $R = \tfrac19$, $T = \tfrac89$. (b) $R = 0$. (c) Any abrupt change of wavelength reflects part of a wave.`,
          sol: md`$k'/k = \sqrt{(E + V_0)/E} = 2$. Matching $\psi$, $\psi'$: $r = \tfrac{k - k'}{k + k'} = -\tfrac13$, $t = \tfrac{2k}{k + k'} = \tfrac23$. $R = \tfrac19$, $T = \tfrac{k'}{k}|t|^2 = \tfrac89$ (flux: faster on the far side). $R + T = 1$ ✓. Optics analogy: light entering glass reflects though nothing "blocks" it.`,
        },
        {
          q: md`**3. Degeneracy and a commuting observable.** $\hat A = \begin{pmatrix}2 & 1 & 0\\ 1 & 2 & 0\\ 0 & 0 & 3\end{pmatrix}$, $\hat B = \text{diag}(0, 0, 1)$. (a) Eigenvalues of $\hat A$. (b) In $\ket1 = (1, 0, 0)$, $P(A = 3)$ and the state after. (c) Show $[\hat A, \hat B] = 0$ and find a common eigenbasis. (d) After getting $A = 3$, what does $\hat B$ give?`,
          ans: md`(a) 1, 3, 3. (b) $\tfrac12$; $\tfrac{1}{\sqrt2}(1, 1, 0)$. (c) $\tfrac{1}{\sqrt2}(1, -1, 0)$ $(1, 0)$; $\tfrac{1}{\sqrt2}(1, 1, 0)$ $(3, 0)$; $(0, 0, 1)$ $(3, 1)$. (d) 0, certainly.`,
          sol: md`The upper block $\begin{pmatrix}2 & 1\\ 1 & 2\end{pmatrix}$ has eigenvalues 1, 3; plus the 3 on its own. $A = 3$ eigenspace: $\tfrac{1}{\sqrt2}(1, 1, 0)$ and $(0, 0, 1)$. Project $\ket1$: only the first contributes, $\tfrac12(1, 1, 0)$, norm$^2$ $\tfrac12$. $\hat B$ is constant (0) on the upper block, so it commutes; the pair $(A, B)$ labels each common eigenvector uniquely, which is what "complete set of commuting observables" means. The post-measurement state has $B = 0$.`,
        },
        {
          q: md`**4. Energy–time in the well.** $\Psi = \tfrac{1}{\sqrt2}(\psi_1 + \psi_2)$. (a) $\sigma_H$. (b) The sloshing frequency $\omega$. (c) Show $\sigma_H\cdot\tfrac1\omega = \tfrac\hbar2$ and interpret.`,
          ans: md`(a) $\tfrac{E_2 - E_1}{2} = \tfrac32E_1$. (b) $\tfrac{E_2 - E_1}{\hbar}$. (c) $\tfrac{E_2 - E_1}{2}\cdot\tfrac{\hbar}{E_2 - E_1} = \tfrac\hbar2$.`,
          sol: md`$\sigma_H^2 = \tfrac{E_1^2 + E_2^2}{2} - \tfrac{(E_1 + E_2)^2}{4}$. The time for $\langle x\rangle$ to change appreciably is $\sim 1/\omega$ (a radian of the oscillation), and it is set by the energy spread exactly as $\sigma_H\Delta t \ge \hbar/2$ demands: things change only as fast as the energy spread allows.`,
        },
      ], {
        q: md`Enter: P1(a) $E$ in units of $\hbar^2/m\ell^2$; P2 $R$; P3(b) $P(A = 3)$.`,
        parts: [{ lbl: 'E', ans: 1.5 }, { lbl: 'R', ans: 1 / 9 }, { lbl: 'P(A = 3)', ans: 0.5 }],
        sol: md`$1.5$, $0.111$, $0.5$.`,
      }),

      pm(7, [
        {
          q: md`**1. A Lorentzian wavefunction.** $\psi = \dfrac{A}{x^2 + b^2}$. (a) $A$ ($\int\tfrac{dx}{(x^2 + b^2)^2} = \tfrac{\pi}{2b^3}$). (b) $\sigma_x$. (c) $\langle p^2\rangle$ (use $\int\tfrac{x^2dx}{(x^2 + b^2)^4} = \tfrac{\pi}{16b^5}$); $\sigma_x\sigma_p$. (d) $\Phi(p)$ is $\sqrt{b/\hbar}\,e^{-b|p|/\hbar}$; check $\langle p^2\rangle$ from it. What earlier result does this mirror?`,
          ans: md`(a) $\sqrt{2b^3/\pi}$. (b) $b$. (c) $\tfrac{\hbar^2}{2b^2}$; $\tfrac{\hbar}{\sqrt2}$. (d) ✓; HW 1 #4 with $x \leftrightarrow p$.`,
          sol: md`$\langle x^2\rangle = A^2\cdot\tfrac{\pi}{2b} = b^2$ (using $\int\tfrac{x^2}{(x^2 + b^2)^2} = \tfrac{\pi}{2b}$). $\psi' = -\tfrac{2Ax}{(x^2 + b^2)^2}$, so $\langle p^2\rangle = \hbar^2A^2\cdot\tfrac{4\pi}{16b^5} = \tfrac{\hbar^2}{2b^2}$. From $\Phi$: $\tfrac{2b}{\hbar}\int_0^\infty p^2e^{-2bp/\hbar}dp = \tfrac{\hbar^2}{2b^2}$ ✓. The cusp $e^{-\kappa|x|}$ has a Lorentzian momentum distribution; the Lorentzian has a cusped one. Same product, $\hbar/\sqrt2$.`,
        },
        {
          q: md`**2. Another identity.** $\Psi(x, 0) = A\sin\tfrac{\pi x}{a}\cos^2\tfrac{\pi x}{a}$ in the well. (a) Expand in $\psi_n$ (no integrals). (b) $P(E_n)$, $\langle H\rangle$. (c) Does $\langle x\rangle$ move? Period of $|\Psi|^2$?`,
          ans: md`(a) $\Psi \propto \psi_1 + \psi_3$: $c_1 = c_3 = \tfrac{1}{\sqrt2}$. (b) $\tfrac12$ each; $5E_1$. (c) No; $\tfrac{ma^2}{2\pi\hbar}$.`,
          sol: md`$\sin u\cos^2u = \sin u\cdot\tfrac{1 + \cos2u}{2} = \tfrac12\sin u + \tfrac14(\sin3u - \sin u) = \tfrac14(\sin u + \sin3u)$. Equal weights. $\langle H\rangle = \tfrac12(1 + 9)E_1$. Both symmetric about $a/2$: $\langle x\rangle$ fixed; the density breathes at $(E_3 - E_1)/\hbar = 8E_1/\hbar$.`,
        },
        {
          q: md`**3. Transparent barriers.** A particle with $E > V_0$ crosses a barrier of height $V_0$, width $L$. (a) For which energies is $T = 1$? (b) Lowest such energy for an electron with $V_0 = 1$ eV, $L = 1$ nm. (c) Why does it work?`,
          ans: md`(a) $E_n = V_0 + \tfrac{n^2\pi^2\hbar^2}{2mL^2}$. (b) 1.376 eV. (c) Reflections from the two edges cancel when $k'L = n\pi$.`,
          sol: md`Inside, $k' = \sqrt{2m(E - V_0)}/\hbar$; $T^{-1} = 1 + \tfrac{V_0^2\sin^2(k'L)}{4E(E - V_0)}$, which is 1 when $k'L = n\pi$: the barrier holds a whole number of half-wavelengths, and the waves reflected at the two edges arrive exactly out of phase. $\pi^2\hbar^2/2mL^2 = 0.376$ eV for $L = 1$ nm.`,
        },
        {
          q: md`**4. Exponentiating a matrix.** $\hat A = \begin{pmatrix}1 & 1\\ 1 & 1\end{pmatrix}$. (a) Spectral decomposition. (b) $e^{i\theta\hat A}$. (c) Evaluate at $\theta = \pi/2$. (d) Is $e^{i\theta\hat A}$ unitary?`,
          ans: md`(a) $\hat A = 2\hat P$, $\hat P = \ket+\bra+$. (b) $\hat 1 + (e^{2i\theta} - 1)\hat P$. (c) $-\sigma_x$. (d) Yes.`,
          sol: md`Eigenvalues 2 ($\ket+$) and 0 ($\ket-$). $e^{i\theta\hat A} = e^{2i\theta}\ket+\bra+ + \ket-\bra- = \hat 1 + (e^{2i\theta} - 1)\hat P$. At $\pi/2$: $\hat 1 - 2\hat P = \begin{pmatrix}0 & -1\\ -1 & 0\end{pmatrix}$. Hermitian $\hat A$ → $e^{i\theta\hat A}$ unitary (eigenvalues are pure phases).`,
        },
      ], {
        q: md`Enter: P1(c) $\sigma_x\sigma_p/\hbar$; P3(b) $E_1$ in eV.`,
        parts: [{ lbl: '\\sigma_x\\sigma_p/\\hbar', ans: Math.SQRT1_2 }, { lbl: 'E_1', ans: 1.376, unit: 'eV' }],
        sol: md`$0.707$, $1.376$ eV.`,
      }),

      pm(8, [
        {
          q: md`**1. Reading a phase from data.** $\Psi = \tfrac{1}{\sqrt2}(\psi_1 + e^{i\varphi}\psi_2)$ in the well. At $t = 0$ you measure $\langle x\rangle = \tfrac a2 - \tfrac{8a}{9\pi^2}$ and $\langle p\rangle > 0$. Find $\varphi$.`,
          ans: md`$\varphi = -\pi/3$.`,
          sol: md`$\langle x\rangle(t) = \tfrac a2 - \tfrac{16a}{9\pi^2}\cos(\varphi - \omega t)$. At $t = 0$: $\cos\varphi = \tfrac12$, so $\varphi = \pm\pi/3$: $\langle x\rangle$ alone cannot tell (it cannot distinguish $\Psi$ from $\Psi^*$, Discussion 2). $\langle p\rangle = m\tfrac{d\langle x\rangle}{dt} = -\tfrac{16ma\omega}{9\pi^2}\sin\varphi$ at $t = 0$; positive needs $\sin\varphi < 0$: $\varphi = -\pi/3$.`,
        },
        {
          q: md`**2. Bound states and transparency.** A finite well has $z_0 = 5\pi/4$. (a) How many bound states? (b) The lowest energy $E > 0$ at which it is perfectly transparent, in units of $V_0$. (c) Comment on the link.`,
          ans: md`(a) 3. (b) $E_3 = 0.44V_0$. (c) Transparency indices start right after the bound-state count.`,
          sol: md`$N = \lceil 2z_0/\pi\rceil = \lceil 2.5\rceil = 3$. Transparency: $2a\ell = n\pi$ with $(\ell a)^2 = z_0^2(1 + E/V_0)$, so $E_n/V_0 = \tfrac{(n\pi/2)^2}{z_0^2} - 1$; positive first for $n = 3$: $1.44 - 1 = 0.44$. It is the same counting: $\ell a$ passing multiples of $\pi/2$. The branches starting at $\ell a = 0, \pi/2, \pi$ (all below $z_0$) became the three bound states; the next one, $n = 3$ at $3\pi/2$, is the first transparency.`,
        },
        {
          q: md`**3. Superposition vs mixture.** $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac12\ket1$, versus a mixture with 75% $\ket0$, 25% $\ket1$. (a) $P(\sigma_z = +1)$ for each. (b) $P(\sigma_x = +1)$ for each. (c) $\langle\sigma_x\rangle$ for each. (d) Which measurement distinguishes them, and why?`,
          ans: md`(a) 0.75, 0.75. (b) $\tfrac{(\sqrt3 + 1)^2}{8} = 0.933$ vs 0.5. (c) $\tfrac{\sqrt3}{2}$ vs 0. (d) $\sigma_x$: its eigenstates mix $\ket0$, $\ket1$, so it sees the interference term.`,
          sol: md`Superposition: amplitude $\braket{+x|\psi} = \tfrac{1}{\sqrt2}\left(\tfrac{\sqrt3}{2} + \tfrac12\right)$, then square. Mixture: $0.75\cdot\tfrac12 + 0.25\cdot\tfrac12$. The difference is $2\text{Re}(\alpha_0\alpha_1^*)\cdot\tfrac12 = \tfrac{\sqrt3}{4}$ = the cross term. On the Bloch sphere the superposition is a point on the surface ($\theta = 60°$); the mixture sits inside, on the $z$-axis.`,
        },
        {
          q: md`**4. Energy spread of a moving packet.** A free Gaussian $\propto e^{-ax^2}e^{ik_0x}$ has $p$ normally distributed with mean $\hbar k_0$ and variance $s^2 = \hbar^2a$. (a) Find $\sigma_H$ (for a normal variable, $\text{Var}(p^2) = 4\mu^2s^2 + 2s^4$). (b) Check $\sigma_x\sigma_H \ge \tfrac{\hbar}{2m}|\langle p\rangle|$. When is it nearly saturated?`,
          ans: md`(a) $\sigma_H = \tfrac{\hbar^2}{2m}\sqrt{4k_0^2a + 2a^2}$. (b) $\sigma_x\sigma_H = \tfrac{\hbar^2}{4m}\sqrt{4k_0^2 + 2a} \ge \tfrac{\hbar^2k_0}{2m}$ ✓; nearly equal when $k_0^2 \gg a$ (fast, broad packet).`,
          sol: md`$\hat H = \hat p^2/2m$, so $\sigma_H = \sqrt{\text{Var}(p^2)}/2m$ with $\mu = \hbar k_0$. $\sigma_x = \tfrac{1}{2\sqrt a}$. The bound from $[\hat x, \hat H] = \tfrac{i\hbar}{m}\hat p$ is $\tfrac{\hbar}{2m}\hbar k_0$. Equality would need $2a \ll 4k_0^2$: a packet many wavelengths long, where energy and momentum spreads are locked together ($\delta E = v\,\delta p$).`,
        },
      ], {
        q: md`Enter: P2(b) $E/V_0$; P3(b) superposition $P(\sigma_x = +1)$.`,
        parts: [{ lbl: 'E/V_0', ans: 0.44 }, { lbl: 'P(+x)', ans: (Math.sqrt(3) + 1) ** 2 / 8 }],
        sol: md`$0.44$, $0.933$.`,
      }),

      pm(9, [
        {
          q: md`**1. Finite energy, infinite spread.** A free particle starts in $\sqrt\kappa\,e^{-\kappa|x|}$. (a) $\langle H\rangle$. (b) Using $\Phi(p) \propto (p^2 + \hbar^2\kappa^2)^{-1}$, is $\sigma_H$ finite? (c) Physical reason.`,
          ans: md`(a) $\tfrac{\hbar^2\kappa^2}{2m}$. (b) No: $\langle p^4\rangle$ diverges. (c) The cusp.`,
          sol: md`$\langle H\rangle = \langle p^2\rangle/2m$ with $\langle p^2\rangle = \hbar^2\kappa^2$. But $|\Phi|^2 \sim p^{-4}$ at large $p$, so $\int p^4|\Phi|^2dp$ diverges linearly: $\langle H^2\rangle = \infty$. A kink needs arbitrarily high momenta; their weight falls fast enough for $\langle p^2\rangle$ but not $\langle p^4\rangle$. Energy measurements would occasionally give enormous values.`,
        },
        {
          q: md`**2. One wall moves, then wait.** Ground state of $[0, a]$; the right wall jumps to $2a$. (a) $P(E_1')$, $P(E_2')$. (b) $\langle H\rangle/E_1'$. (c) After how long does the wavefunction first return exactly to its post-move form?`,
          ans: md`(a) $\tfrac{32}{9\pi^2} = 0.360$, $\tfrac12$. (b) 4. (c) $\tfrac{16ma^2}{\pi\hbar}$.`,
          sol: md`$\psi_2' = \tfrac{1}{\sqrt a}\sin\tfrac{\pi x}{a}$ on $[0, 2a]$ is the old ground state's shape: overlap $\tfrac{\sqrt2}{a}\cdot\tfrac a2 = \tfrac{1}{\sqrt2}$. $c_1' = \tfrac{4\sqrt2}{3\pi}$ (Topic 5). $\langle H\rangle$ unchanged $= E_1 = 4E_1'$. Revival of the new well: $2\pi\hbar/E_1' = \tfrac{4m(2a)^2}{\pi\hbar}$.`,
        },
        {
          q: md`**3. Rotating an observable.** $\hat U = e^{-i\theta\sigma_y}$. (a) Write $\hat U$ as a matrix. (b) Compute $\hat U^\dagger\sigma_z\hat U$. (c) Find $\hat U\ket0$ and $P(\sigma_z = +1)$ in it; check against (b).`,
          ans: md`(a) $\begin{pmatrix}\cos\theta & -\sin\theta\\ \sin\theta & \cos\theta\end{pmatrix}$. (b) $\cos2\theta\,\sigma_z - \sin2\theta\,\sigma_x$. (c) $(\cos\theta, \sin\theta)$; $\cos^2\theta$, and $\langle\sigma_z\rangle = \cos2\theta$ ✓.`,
          sol: md`$e^{-i\theta\sigma_y} = \cos\theta - i\sin\theta\,\sigma_y$, and $-i\sigma_y = \begin{pmatrix}0 & -1\\ 1 & 0\end{pmatrix}$: a real rotation matrix. Multiply out (b): $\hat U^\dagger\sigma_z\hat U = \begin{pmatrix}\cos2\theta & -\sin2\theta\\ -\sin2\theta & -\cos2\theta\end{pmatrix}$. Measuring $\sigma_z$ on the rotated state is the same as measuring the rotated observable on the original: $\bra0\hat U^\dagger\sigma_z\hat U\ket0 = \cos2\theta = 2\cos^2\theta - 1$ ✓. On the Bloch sphere, $\hat U$ turns vectors by $2\theta$ about $y$.`,
        },
        {
          q: md`**4. Degenerate energies keep their phases.** $\hat H = \hbar\omega\,\text{diag}(1, 1, 2)$, $\ket\psi(0) = \tfrac{1}{\sqrt3}(1, 1, 1)$. $\hat A = \begin{pmatrix}0 & 1 & 0\\ 1 & 0 & 0\\ 0 & 0 & 0\end{pmatrix}$, $\hat A' = \begin{pmatrix}0 & 0 & 1\\ 0 & 0 & 0\\ 1 & 0 & 0\end{pmatrix}$. Find $\langle A\rangle(t)$, $\langle A'\rangle(t)$ and explain the difference.`,
          ans: md`$\langle A\rangle = \tfrac23$ (constant); $\langle A'\rangle = \tfrac23\cos\omega t$.`,
          sol: md`$\ket\psi(t) = \tfrac{1}{\sqrt3}(e^{-i\omega t}, e^{-i\omega t}, e^{-2i\omega t})$. $\langle A\rangle = 2\text{Re}(\psi_1^*\psi_2) = \tfrac23$: components 1 and 2 have the same energy, so their relative phase never moves. $\langle A'\rangle = 2\text{Re}(\psi_1^*\psi_3) = \tfrac23\cos\omega t$. Equivalently $[\hat A, \hat H] = 0$ but $[\hat A', \hat H] \ne 0$.`,
        },
      ], {
        q: md`Enter: P2(a) $P(E_1')$; P2(c) revival time in units of $ma^2/\hbar$; P4 $\langle A\rangle$.`,
        parts: [{ lbl: "P(E_1')", ans: 32 / (9 * Math.PI ** 2) }, { lbl: 'T_{\\text{rev}}', ans: 16 / Math.PI }, { lbl: '\\langle A\\rangle', ans: 2 / 3 }],
        sol: md`$0.360$, $5.09$, $0.667$.`,
      }),

      pm(10, [
        {
          q: md`**1. Reverse-engineer a well.** The ground state of an unknown potential is $\psi_0 = A\,\text{sech}^2(\alpha x)$, and $\psi_1 = \sinh(\alpha x)\psi_0$ is the first excited state. (a) Find $V(x)$ with $V(\pm\infty) = 0$, and $E_0$. (b) $E_1$ (Discussion 3: $\lambda = \tfrac12 + \tfrac{m(E_1 - E_0)}{\hbar^2\alpha^2}$). (c) Is $\psi_1$ normalizable? Bound?`,
          ans: md`(a) $V = -\tfrac{3\hbar^2\alpha^2}{m}\text{sech}^2(\alpha x)$, $E_0 = -\tfrac{2\hbar^2\alpha^2}{m}$. (b) $E_1 = -\tfrac{\hbar^2\alpha^2}{2m}$. (c) Yes ($\lambda = 2 > 1$); bound ($E_1 < 0$).`,
          sol: md`$\tfrac{\psi_0''}{\psi_0} = \alpha^2(4 - 6\,\text{sech}^2\alpha x)$. $V = E_0 + \tfrac{\hbar^2\alpha^2}{2m}(4 - 6\,\text{sech}^2)$; $V(\infty) = 0$ fixes $E_0 = -\tfrac{2\hbar^2\alpha^2}{m}$. $\lambda = 2$ gives $E_1 - E_0 = \tfrac{3\hbar^2\alpha^2}{2m}$. $\psi_1 \sim e^{\alpha|x|}e^{-2\alpha|x|}$ decays ✓ and has one node ✓. (This well has exactly these two bound states, at $-\tfrac{\hbar^2\alpha^2}{2m}(\lambda - n)^2$.)`,
        },
        {
          q: md`**2. A V-shaped potential by uncertainty.** $V = \alpha|x|$. Model $\langle H\rangle \approx \tfrac{\hbar^2}{8m\sigma^2} + \alpha\sigma$. (a) Minimize. (b) How does $E_0$ scale with $\alpha$, $m$, $\hbar$? Check by dimensional analysis alone.`,
          ans: md`(a) $\sigma^3 = \tfrac{\hbar^2}{4m\alpha}$, $E_0 \approx \tfrac32\left(\tfrac{\hbar^2\alpha^2}{4m}\right)^{1/3}$. (b) $(\hbar^2\alpha^2/m)^{1/3}$.`,
          sol: md`$-\tfrac{\hbar^2}{4m\sigma^3} + \alpha = 0$; at the optimum the kinetic term is half the potential term, so $E = \tfrac32\alpha\sigma$. Dimensions: $[\alpha] = $ energy/length; the only energy from $\hbar$, $m$, $\alpha$ is $(\hbar^2\alpha^2/m)^{1/3}$. (The exact coefficient is 0.81 vs our 0.94: the estimate gets the physics and scaling, not the last digit.)`,
        },
        {
          q: md`**3. A spin-1 measurement chain.** $\hat A = \text{diag}(1, 0, -1)$, $\hat B = \tfrac{1}{\sqrt2}\begin{pmatrix}0 & 1 & 0\\ 1 & 0 & 1\\ 0 & 1 & 0\end{pmatrix}$. (a) Eigenvalues and eigenvectors of $\hat B$. (b) Start in $A = 1$. Probabilities for $\hat B$. (c) $B$ gives 0; then $A$ is measured. Probabilities? (d) Probability of the chain $A = 1 \to B = 0 \to A = 1$.`,
          ans: md`(a) $+1$: $\tfrac12(1, \sqrt2, 1)$; $0$: $\tfrac{1}{\sqrt2}(1, 0, -1)$; $-1$: $\tfrac12(1, -\sqrt2, 1)$. (b) $\tfrac14, \tfrac12, \tfrac14$. (c) $A = \pm1$ with $\tfrac12$ each, $A = 0$ never. (d) $\tfrac14$.`,
          sol: md`$\hat B$ is the spin-1 $S_x/\hbar$; $\hat A$ is $S_z/\hbar$. Characteristic equation $-\lambda^3 + \lambda = 0$. (b) Square the first components: $\tfrac14$, $\tfrac12$, $\tfrac14$. (c) The $B = 0$ state has no middle component. (d) $\tfrac12\cdot\tfrac12$. Incompatible measurements: the second $A$ result is not the first one.`,
        },
        {
          q: md`**4. Packets filter through barriers.** A packet with a spread of energies around 1 eV hits a barrier of height 5 eV and width 0.5 nm. (a) Ratio $T(2\text{ eV})/T(1\text{ eV})$. (b) Is the transmitted packet's average energy higher, lower or equal to the incident one? (c) Does the transmitted packet have a definite energy?`,
          ans: md`(a) ≈ 5.9. (b) Higher. (c) No.`,
          sol: md`$T$ grows steeply with $E$ (through $\kappa$): $T(1) = 9.1\times10^{-5}$, $T(2) = 5.4\times10^{-4}$. Each energy component crosses independently with probability $T(E)$, so higher components are over-represented in what gets through: the barrier acts as a high-pass filter. Each component keeps its energy (stationary scattering), so the transmitted packet still has a spread (Discussion 3: only a single-$k$ wave is stationary).`,
        },
      ], {
        q: md`Enter: P1(a) $E_0$ in units of $\hbar^2\alpha^2/m$; P3(b) $P(B = 0)$; P4(a) ratio.`,
        parts: [{ lbl: 'E_0', ans: -2 }, { lbl: 'P(B = 0)', ans: 0.5 }, { lbl: 'T(2)/T(1)', ans: 5.918, tol: { rel: 0.03 } }],
        sol: md`$-2$, $0.5$, $5.9$.`,
      }),
    ],
  });
})();

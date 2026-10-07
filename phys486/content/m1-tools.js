/* Midterm 1: formula sheet (#/sheet), mixed practice (#/quiz) and a mock exam (#/mock). */
(function () {
  'use strict';
  const { R, G } = C;

  C.unit({
    id: 'm1-x', exam: 'm1', tools: true, num: 'Midterm 1', title: 'Practice',
    lessons: [
      {
        id: 'm1-sheet', title: 'Formula sheet', kind: 'read',
        steps: [
          R(md`
            Everything below is used on the homework. Know the **ideas** behind each line; the exam tests whether you can pick the right one.

            ### Postulates

            $$\ket\psi = \sum_nc_n\ket{a_n},\quad c_n = \braket{a_n}\psi,\quad P(a_n) = |c_n|^2,\quad \langle A\rangle = \bra\psi\hat A\ket\psi = \sum a_n|c_n|^2,\quad \sigma_A^2 = \langle A^2\rangle - \langle A\rangle^2$$
            Outcomes are eigenvalues of Hermitian $\hat A$; after the measurement the state is $\ket{a_n}$. Global phases are unphysical, relative phases are not. $i\hbar\tfrac{d}{dt}\ket\psi = \hat H\ket\psi$.

            ### Wavefunctions

            $$\int|\Psi|^2dx = 1,\quad \langle f(x)\rangle = \int f|\Psi|^2dx,\quad \hat p = -i\hbar\partial_x,\quad \langle p^2\rangle = \hbar^2\int|\Psi'|^2dx,\quad \lambda = \frac hp,\ p = \hbar k$$
            $$J = \frac{\hbar}{2mi}\left(\Psi^*\Psi' - \Psi\Psi^{*\prime}\right),\qquad \frac{d\langle x\rangle}{dt} = \frac{\langle p\rangle}{m},\qquad \frac{d\langle p\rangle}{dt} = -\langle V'\rangle$$
            Gaussian integrals: $\int e^{-\alpha x^2}dx = \sqrt{\pi/\alpha}$, $\int x^2e^{-\alpha x^2}dx = \tfrac{1}{2\alpha}\sqrt{\pi/\alpha}$; $\int_0^\infty x^ne^{-\alpha x}dx = n!/\alpha^{n+1}$.

            ### The recipe

            $$\hat H\psi_n = E_n\psi_n,\quad c_n = \int\psi_n^*\Psi(x,0)dx,\quad \Psi(x,t) = \sum c_n\psi_ne^{-iE_nt/\hbar},\quad \langle H\rangle = \sum|c_n|^2E_n$$
            $\psi$ continuous; $\psi'$ continuous unless $V = \infty$; $E > V_{\min}$; $n$th state has $n - 1$ nodes; $|\Psi|^2$ beats at $(E_m - E_n)/\hbar$.

            ### Infinite square well $(0, a)$

            $$\psi_n = \sqrt{\tfrac2a}\sin\tfrac{n\pi x}{a},\quad E_n = \frac{n^2\pi^2\hbar^2}{2ma^2},\quad \langle x^2\rangle = a^2\left(\tfrac13 - \tfrac{1}{2n^2\pi^2}\right),\quad \langle p^2\rangle = \left(\tfrac{n\pi\hbar}{a}\right)^2,\quad \sigma_x\sigma_p = \tfrac\hbar2\sqrt{\tfrac{n^2\pi^2}{3} - 2}$$

            ### Free particle

            $$\Psi(x,t) = \frac{1}{\sqrt{2\pi}}\int\phi(k)e^{i(kx - \hbar k^2t/2m)}dk,\quad \phi(k) = \frac{1}{\sqrt{2\pi}}\int\Psi(x,0)e^{-ikx}dx,\quad v_g = \frac{\hbar k}{m} = 2v_{\text{ph}}$$
            Gaussian $e^{-ax^2}$: $\sigma_x = \tfrac{1}{2\sqrt a}$, $\sigma_p = \hbar\sqrt a$; spreads with $w = \sqrt a/\sqrt{1 + (2\hbar at/m)^2}$. $Ae^{ikx} + Be^{-ikx} = (A + B)\cos kx + i(A - B)\sin kx$.

            ### Finite well ($-V_0$ for $|x| < a$) and barriers

            $$z_0 = \frac a\hbar\sqrt{2mV_0},\quad \tan z = \sqrt{(z_0/z)^2 - 1}\ \text{(even)},\quad -\cot z = \sqrt{(z_0/z)^2 - 1}\ \text{(odd)},\quad E = -V_0 + \frac{\hbar^2z^2}{2ma^2}$$
            $$\kappa = \frac{\sqrt{-2mE}}\hbar,\quad N = \lceil 2z_0/\pi\rceil,\quad T^{-1} = 1 + \frac{V_0^2\sin^2(2a\ell)}{4E(E + V_0)},\quad T_{\text{barrier}} \approx \frac{16E(V_0 - E)}{V_0^2}e^{-2\kappa L},\quad R_{\text{step}} = \left(\frac{k - k'}{k + k'}\right)^2$$

            ### Linear algebra

            $\braket\phi\psi = \braket\psi\phi^*$, $\sum\ket{e_n}\bra{e_n} = \hat 1$, $A_{mn} = \bra{e_m}\hat A\ket{e_n}$, $(\hat A\hat B)^\dagger = \hat B^\dagger\hat A^\dagger$, $f(\hat A) = \sum f(a_n)\ket{a_n}\bra{a_n}$, $|\braket vw|^2 \le \braket vv\braket ww$.
            $$\braket{x}{x'} = \delta(x - x'),\quad \braket xp = \frac{e^{ipx/\hbar}}{\sqrt{2\pi\hbar}},\quad \Phi(p) = \frac{1}{\sqrt{2\pi\hbar}}\int e^{-ipx/\hbar}\Psi(x)dx,\quad [\hat x, \hat p] = i\hbar$$

            ### Uncertainty

            $$\sigma_A^2\sigma_B^2 \ge \left(\frac{1}{2i}\langle[\hat A, \hat B]\rangle\right)^2,\quad \sigma_x\sigma_p \ge \frac\hbar2,\quad \frac{d\langle Q\rangle}{dt} = \frac i\hbar\langle[\hat H, \hat Q]\rangle + \left\langle\frac{\partial\hat Q}{\partial t}\right\rangle,\quad \sigma_H\frac{\sigma_Q}{|d\langle Q\rangle/dt|} \ge \frac\hbar2$$

            ### Qubit

            $$\sigma_x = \begin{pmatrix}0&1\\1&0\end{pmatrix},\ \sigma_y = \begin{pmatrix}0&-i\\i&0\end{pmatrix},\ \sigma_z = \begin{pmatrix}1&0\\0&-1\end{pmatrix},\quad [\sigma_j, \sigma_k] = 2i\epsilon_{jkl}\sigma_l,\quad \sigma_j\sigma_k = \delta_{jk} + i\epsilon_{jkl}\sigma_l$$
            $$\ket\psi = \cos\tfrac\theta2\ket0 + e^{i\varphi}\sin\tfrac\theta2\ket1,\quad \langle\vec\sigma\rangle = \hat n,\quad P(+\hat m) = \tfrac12(1 + \hat n\cdot\hat m),\quad e^{i\alpha\hat n\cdot\vec\sigma} = \cos\alpha + i\sin\alpha\,\hat n\cdot\vec\sigma$$
            $\hat H = \tfrac\hbar2\vec\Omega\cdot\vec\sigma$ rotates the Bloch vector about $\vec\Omega$ at rate $|\vec\Omega|$.

            ### Constants

            $\hbar = 1.055\times10^{-34}$ J·s $= 6.582\times10^{-16}$ eV·s, $hc = 1240$ eV·nm, $m_e = 9.109\times10^{-31}$ kg $= 0.511$ MeV$/c^2$, $1$ eV $= 1.602\times10^{-19}$ J, $\hbar^2/2m_e = 0.0381$ eV·nm².
          `),
        ],
      },
      {
        id: 'm1-mix', title: 'Mixed practice', kind: 'review',
        steps: [
          R(md`
            Conceptual questions from all ten topics in random order, with nothing telling you which topic they belong to. That is how the exam asks them. Every card links back to its lesson; reread the section behind any miss.
          `),
          G('concept', { need: 25, units: ['u1', 'u2', 'u3'] }),
        ],
      },
      {
        id: 'm1-mock', title: 'Mock exam', kind: 'review',
        steps: [
          R(md`
            Four problems in the style of the homework. Work them on paper, timed (about 75 minutes), with only the formula sheet. Then open each answer.
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 486 · Mock Midterm 1</span><span>100 pts</span></div>',
            items: [
              {
                q: md`
                  **Problem 1 (30 pts).** A particle in the infinite square well $0 < x < a$ starts in the triangle
                  $$\Psi(x,0) = \begin{cases}Ax & 0 < x < a/2\\ A(a - x) & a/2 < x < a\end{cases}$$
                  (a) Sketch it and find $A$. (b) Without integrating, which $c_n$ vanish? Why? (c) Find $c_n$ and $P(E_1)$. (d) Find $\langle H\rangle$ without summing a series. (e) Does $P(E_1)$ change in time? Does $\langle x\rangle$?
                `,
                ans: md`(a) $A = \sqrt{12/a^3}$. (b) even $n$. (c) $c_n = \dfrac{4\sqrt6}{(n\pi)^2}\sin\dfrac{n\pi}{2}$, $P(E_1) = 96/\pi^4 = 0.986$. (d) $\langle H\rangle = 6\hbar^2/ma^2$. (e) No; no.`,
                sol: md`
                  **(a)** $1 = 2A^2\int_0^{a/2}x^2dx = A^2a^3/12$.

                  **(b)** $\Psi$ is symmetric about $a/2$; $\psi_n$ with even $n$ are antisymmetric about $a/2$, so their overlap vanishes.

                  **(c)** For odd $n$ the two halves contribute equally: $c_n = 2\sqrt{\tfrac2a}A\int_0^{a/2}x\sin\tfrac{n\pi x}{a}dx = 2\sqrt{\tfrac2a}\sqrt{\tfrac{12}{a^3}}\cdot\tfrac{a^2}{(n\pi)^2}\sin\tfrac{n\pi}{2}$ (the $\cos(n\pi/2)$ term is zero for odd $n$). $|c_1|^2 = 96/\pi^4 = 0.986$.

                  **(d)** Inside the well $\hat H = \hat p^2/2m$: $\langle H\rangle = \tfrac{\hbar^2}{2m}\int|\Psi'|^2 = \tfrac{\hbar^2}{2m}A^2a = \tfrac{6\hbar^2}{ma^2}$ ($= 1.22E_1$; the kink costs energy). Using $|\Psi'|^2$ avoids the delta function in $\Psi''$ at the peak.

                  **(e)** $|c_n|^2$ never change. $\langle x\rangle$: only odd $n$ are present, all symmetric about $a/2$, and so is every cross term $\psi_m\psi_n$; so $\langle x\rangle = a/2$ for all time, even though $|\Psi|^2$ itself changes shape.
                `,
              },
              {
                q: md`
                  **Problem 2 (20 pts).** A finite well has depth $V_0$ and half-width $a$, with $z_0 = 2$.
                  (a) How many bound states, of which parity? Sketch them. (b) Write the ground state outside the well and the equation that fixes its energy. (c) An electron with energy 2 eV hits a barrier of height 3 eV and width 1 nm. Estimate $T$, and say what happens to $T$ if the width is halved.
                `,
                ans: md`(a) 2: one even (no nodes), one odd (one node). (b) $Fe^{-\kappa|x|}$, $\tan z = \sqrt{4/z^2 - 1}$. (c) $\kappa = 5.12\ \text{nm}^{-1}$, $T \approx 1.3\times10^{-4}$; halving the width gives $T \approx 0.021$, about 170 times larger.`,
                sol: md`
                  **(a)** $z_0 = 2$ lies between $\pi/2$ and $\pi$: the first even branch and the first odd branch cross. $N = \lceil 4/\pi\rceil = 2$.

                  **(b)** $\psi = Fe^{-\kappa|x|}$ for $|x| > a$, $\kappa = \sqrt{-2mE}/\hbar$; matching $\cos\ell x$ at $a$: $\kappa = \ell\tan\ell a$, i.e. $\tan z = \sqrt{(z_0/z)^2 - 1}$.

                  **(c)** $\kappa = \sqrt{2m(1\ \text{eV})}/\hbar = 5.12\times10^9\ \text{m}^{-1}$, $2\kappa L = 10.25$. $T \approx \tfrac{16(2)(1)}{9}e^{-10.25} = 3.56\times3.55\times10^{-5} = 1.3\times10^{-4}$. Halved: $2\kappa L = 5.12$, $T \approx 3.56\,e^{-5.12} = 0.021$ (the exact $T^{-1} = 1 + \tfrac{V_0^2\sinh^2\kappa L}{4E(V_0 - E)}$ agrees to 1%). Halving the width multiplies $T$ by $e^{\kappa L} \approx 170$: exponential in $L$.
                `,
              },
              {
                q: md`
                  **Problem 3 (30 pts).** In a two-dimensional space, $\hat A = \begin{pmatrix}1 & i\\ -i & 1\end{pmatrix}$.
                  (a) Is $\hat A$ Hermitian? Write it as $a_0\hat 1 + \vec a\cdot\vec\sigma$. (b) Find its eigenvalues and normalized eigenvectors. (c) The state is $\ket+ = \tfrac1{\sqrt2}(1, 1)$. Find the probabilities of each outcome, $\langle A\rangle$ and $\sigma_A$. (d) Compute $[\hat A, \sigma_z]$ and check the uncertainty relation for $\hat A$ and $\sigma_z$ in $\ket+$.
                `,
                ans: md`(a) Yes; $\hat A = \hat 1 - \sigma_y$. (b) $2$: $\tfrac{1}{\sqrt2}(1, -i)$; $0$: $\tfrac1{\sqrt2}(1, i)$. (c) $\tfrac12$ each; $\langle A\rangle = 1$, $\sigma_A = 1$. (d) $-2i\sigma_x$; $1\cdot1 \ge |\langle\sigma_x\rangle| = 1$: saturated.`,
                sol: md`
                  **(a)** $A_{21} = -i = (i)^*$ ✓, diagonal real. $-\sigma_y = \begin{pmatrix}0 & i\\ -i & 0\end{pmatrix}$, so $\hat A = \hat 1 - \sigma_y$.

                  **(b)** Eigenvalues $1 \pm 1$: the $-\sigma_y$ eigenvalue $+1$ belongs to the $-y$ state $\tfrac{1}{\sqrt2}(1, -i)$, giving 2; the $+y$ state $\tfrac1{\sqrt2}(1, i)$ gives 0. Check: $\hat A(1, -i) = (1 + 1, -i - i) = 2(1, -i)$ ✓.

                  **(c)** $\ket+$ is on the equator at $x$, perpendicular to $\pm y$: 50/50. $\langle A\rangle = 1 - \langle\sigma_y\rangle = 1$; $\langle A^2\rangle = \tfrac12\cdot4 = 2$, $\sigma_A = 1$.

                  **(d)** $[\hat A, \sigma_z] = -[\sigma_y, \sigma_z] = -2i\sigma_x$. Bound: $\left|\tfrac{1}{2i}\langle-2i\sigma_x\rangle\right| = |\langle\sigma_x\rangle| = 1$. $\sigma_{\sigma_z} = 1$ in $\ket+$, so $\sigma_A\sigma_{\sigma_z} = 1 \ge 1$: equality.
                `,
              },
              {
                q: md`
                  **Problem 4 (20 pts).** A qubit starts in $\ket0$ with $\hat H = \tfrac{\hbar\Omega}{2}\sigma_x$.
                  (a) Find $\hat U(t) = e^{-i\hat Ht/\hbar}$ as a $2\times2$ matrix. (b) Find $\ket\psi(t)$ and $P_1(t)$. (c) Find $\langle\sigma_z\rangle(t)$ and $\langle\sigma_y\rangle(t)$, and describe the motion on the Bloch sphere. (d) Is $\langle\sigma_x\rangle$ conserved? Use the commutator.
                `,
                ans: md`(a) $\cos\tfrac{\Omega t}{2}\hat 1 - i\sin\tfrac{\Omega t}{2}\sigma_x$. (b) $\cos\tfrac{\Omega t}2\ket0 - i\sin\tfrac{\Omega t}2\ket1$; $P_1 = \sin^2\tfrac{\Omega t}{2}$. (c) $\cos\Omega t$, $-\sin\Omega t$: rotation about $x$ through the $-y$ point. (d) Yes, $[\hat H, \sigma_x] = 0$; it stays 0.`,
                sol: md`
                  **(a)** $e^{-i(\Omega t/2)\sigma_x} = \cos\tfrac{\Omega t}{2}\hat 1 - i\sin\tfrac{\Omega t}{2}\sigma_x = \begin{pmatrix}\cos & -i\sin\\ -i\sin & \cos\end{pmatrix}$ (half-angle arguments).

                  **(b)** First column of $\hat U$. $P_1 = \sin^2(\Omega t/2)$: Rabi oscillation, full flip at $t = \pi/\Omega$.

                  **(c)** $\langle\sigma_z\rangle = \cos^2 - \sin^2 = \cos\Omega t$. $\langle\sigma_y\rangle = 2\,\text{Im}(c_0^*c_1)$ with $c_1 = -i\sin$: $-\sin\Omega t$. The Bloch vector turns in the $y$–$z$ plane about $+x$ at rate $\Omega$.

                  **(d)** $\tfrac{d}{dt}\langle\sigma_x\rangle = \tfrac i\hbar\langle[\hat H, \sigma_x]\rangle = 0$; it starts at 0 and stays 0: the rotation axis component never changes.
                `,
              },
            ],
          },
        ],
      },
    ],
  });
})();

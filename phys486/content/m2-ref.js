/* Midterm 2 reference: the formula sheet (#/sheet) and the notation glossary for the new symbols (#/notation).
   Unit 'm2-ref' (tools). The printable one-page version is cheatsheet-m2.html. */
(function () {
  'use strict';
  const { R } = C;

  C.unit({
    id: 'm2-ref', exam: 'm2', tools: true, num: 'Midterm 2', title: 'Reference',
    lessons: [
      {
        id: 'm2-sheet', title: 'Formula sheet (Midterm 2)', kind: 'read', sub: 'every formula, with what it means',
        steps: [
          R(md`
            **Printable one-page version:** [cheat sheet](cheatsheet-m2.html) ([PDF](cheatsheet-m2.pdf)). Midterm 1 printed the formulas each problem needed in the problem itself; expect the same, but know what each line *means*, because the exam asks you to explain and interpret. The Midterm 1 sheet is still under the Midterm 1 review.

            ### Dynamics of expectation values

            $$\frac{d\langle Q\rangle}{dt} = \frac i\hbar\left\langle[\hat H, \hat Q]\right\rangle + \left\langle\frac{\partial\hat Q}{\partial t}\right\rangle\qquad\text{(generalized Ehrenfest)}$$
            $[\hat A\hat B, \hat C] = \hat A[\hat B, \hat C] + [\hat A, \hat C]\hat B$, $[f(\hat x), \hat p] = i\hbar f'(\hat x)$, $[\hat x, \hat p^2] = 2i\hbar\hat p$, $[\hat H, \hat x] = -\tfrac{i\hbar}{m}\hat p$, $[\hat H, \hat p] = i\hbar V'(\hat x)$.
            $$\frac{d\langle x\rangle}{dt} = \frac{\langle p\rangle}{m},\qquad \frac{d\langle p\rangle}{dt} = -\langle V'(x)\rangle,\qquad \frac{d\langle xp\rangle}{dt} = 2\langle T\rangle - \langle xV'\rangle\ \ (=0\text{ in a stationary state: virial})$$
            **Conserved** if $[\hat H, \hat Q] = 0$ and no explicit $t$. Virial: $V \propto x^2 \Rightarrow \langle T\rangle = \langle V\rangle$; $V \propto -1/r \Rightarrow \langle T\rangle = -\tfrac12\langle V\rangle = -E$.

            ### Uncertainty, energy and time

            $$\sigma_A\sigma_B \ge \left|\frac{1}{2i}\left\langle[\hat A, \hat B]\right\rangle\right|,\qquad \sigma_H\sigma_Q \ge \frac\hbar2\left|\frac{d\langle Q\rangle}{dt}\right|,\qquad \Delta E\,\Delta t \ge \frac\hbar2,\ \ \Delta t \equiv \frac{\sigma_Q}{|d\langle Q\rangle/dt|}$$
            $\sigma_x\sigma_H \ge \tfrac{\hbar}{2m}|\langle p\rangle|$. Equality iff $(\hat B - \langle B\rangle)\ket\psi = i\lambda(\hat A - \langle A\rangle)\ket\psi$ with $\lambda$ real; for $x, p$ that is a Gaussian $e^{-(x - \langle x\rangle)^2/4\sigma_x^2 + i\langle p\rangle x/\hbar}$. Stronger (Schrödinger–Robertson): add $\left(\tfrac12\langle\hat A\hat B + \hat B\hat A\rangle - \langle A\rangle\langle B\rangle\right)^2$ on the right of $\sigma_A^2\sigma_B^2$.

            ### Harmonic oscillator: algebra

            $$\hat H = \frac{\hat p^2}{2m} + \frac12m\omega^2\hat x^2,\qquad \hat a_\pm = \frac{1}{\sqrt{2\hbar m\omega}}\left(\mp i\hat p + m\omega\hat x\right),\qquad [\hat a_-, \hat a_+] = 1,\qquad \hat H = \hbar\omega\left(\hat a_+\hat a_- + \tfrac12\right)$$
            $$E_n = \hbar\omega\left(n + \tfrac12\right),\quad \hat a_+\ket n = \sqrt{n+1}\,\ket{n+1},\quad \hat a_-\ket n = \sqrt n\,\ket{n-1},\quad \ket n = \frac{(\hat a_+)^n}{\sqrt{n!}}\ket0$$
            $$\hat x = \sqrt{\frac{\hbar}{2m\omega}}\left(\hat a_+ + \hat a_-\right),\qquad \hat p = i\sqrt{\frac{\hbar m\omega}{2}}\left(\hat a_+ - \hat a_-\right),\qquad (\hat a_\pm)^\dagger = \hat a_\mp$$
            In $\ket n$: $\langle x\rangle = \langle p\rangle = 0$, $\langle x^2\rangle = \left(n + \tfrac12\right)\tfrac{\hbar}{m\omega}$, $\langle p^2\rangle = \left(n + \tfrac12\right)\hbar m\omega$, $\sigma_x\sigma_p = \left(n + \tfrac12\right)\hbar$, $\langle T\rangle = \langle V\rangle = \tfrac12E_n$. $\bra{n'}\hat x\ket n = \sqrt{\tfrac{\hbar}{2m\omega}}\left(\sqrt n\,\delta_{n', n-1} + \sqrt{n+1}\,\delta_{n', n+1}\right)$.

            ### Harmonic oscillator: wavefunctions and motion

            $$\psi_0 = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}e^{-m\omega x^2/2\hbar},\qquad \psi_n = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}\frac{1}{\sqrt{2^nn!}}H_n(\xi)e^{-\xi^2/2},\qquad \xi = \sqrt{\frac{m\omega}{\hbar}}\,x$$
            $H_0 = 1$, $H_1 = 2\xi$, $H_2 = 4\xi^2 - 2$, $H_3 = 8\xi^3 - 12\xi$. $\psi_n$ has $n$ nodes and parity $(-1)^n$. Ground width $w_x = \sqrt{\hbar/m\omega}$; classical turning point of $E_n$: $x_n = \sqrt{2n+1}\,w_x$; classical density $P_{\text{cl}}(x) = \dfrac{1}{\pi\sqrt{x_0^2 - x^2}}$.

            Superposition $\sum c_n\ket n$: each term gets $e^{-i(n + 1/2)\omega t}$. $\langle x\rangle$ needs neighbors ($n$, $n+1$) and oscillates at $\omega$; $n$ and $n + 2$ make the width breathe at $2\omega$. $(\langle x\rangle, \langle p\rangle/m\omega)$ goes clockwise around a circle, period $2\pi/\omega$.

            ### Coherent states

            $$\hat a_-\ket\alpha = \alpha\ket\alpha,\qquad \ket\alpha = e^{-|\alpha|^2/2}\sum_n\frac{\alpha^n}{\sqrt{n!}}\ket n,\qquad P(n) = e^{-|\alpha|^2}\frac{|\alpha|^{2n}}{n!},\qquad \alpha(t) = \alpha e^{-i\omega t}$$
            $\langle n\rangle = |\alpha|^2$, $\sigma_n = |\alpha|$, $\langle H\rangle = \hbar\omega(|\alpha|^2 + \tfrac12)$, $\sigma_H = \hbar\omega|\alpha|$. $\langle x\rangle = \sqrt{\tfrac{2\hbar}{m\omega}}\,\text{Re}\,\alpha(t)$, $\langle p\rangle = \sqrt{2\hbar m\omega}\,\text{Im}\,\alpha(t)$, $\sigma_x = \sqrt{\tfrac{\hbar}{2m\omega}}$, $\sigma_p = \sqrt{\tfrac{\hbar m\omega}{2}}$ for all $t$: the ground-state Gaussian, displaced, swinging like a classical mass.

            ### Three dimensions

            $$i\hbar\frac{\partial\Psi}{\partial t} = -\frac{\hbar^2}{2m}\nabla^2\Psi + V\Psi,\quad \hat{\vec p} = -i\hbar\nabla,\quad \int|\Psi|^2d^3r = 1,\quad d^3r = r^2\sin\theta\,dr\,d\theta\,d\phi$$
            $$\nabla^2 = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right) - \frac{\hat L^2}{\hbar^2r^2},\qquad \psi = R(r)Y_\ell^m(\theta, \phi),\qquad \int_0^\infty|R|^2r^2dr = 1 = \int|Y|^2d\Omega$$
            Cubic box: $E = \tfrac{\pi^2\hbar^2}{2mL^2}(n_x^2 + n_y^2 + n_z^2)$. Isotropic oscillator: $E = \hbar\omega\left(N + \tfrac32\right)$, $N = n_x + n_y + n_z$, degeneracy $\tfrac{(N+1)(N+2)}{2}$, $\ell = N, N-2, \dots, 1\text{ or }0$.

            ### Angular momentum

            $$\hat{\vec L} = \hat{\vec r}\times\hat{\vec p},\quad \hat L_z = \hat x\hat p_y - \hat y\hat p_x,\quad [\hat L_x, \hat L_y] = i\hbar\hat L_z\ \text{(cyclic)},\quad [\hat L^2, \hat L_i] = 0,\quad [\hat L_z, \hat x] = i\hbar\hat y,\ [\hat L_z, \hat y] = -i\hbar\hat x$$
            $$\hat L_\pm = \hat L_x \pm i\hat L_y,\quad [\hat L_z, \hat L_\pm] = \pm\hbar\hat L_\pm,\quad \hat L_\mp\hat L_\pm = \hat L^2 - \hat L_z^2 \mp \hbar\hat L_z,\quad \hat L_\pm Y_\ell^m = \hbar\sqrt{\ell(\ell+1) - m(m\pm1)}\,Y_\ell^{m\pm1}$$
            $$\hat L^2Y_\ell^m = \hbar^2\ell(\ell+1)Y_\ell^m,\quad \hat L_zY_\ell^m = \hbar mY_\ell^m,\quad \ell = 0, 1, 2, \dots,\quad m = -\ell, \dots, \ell$$
            $$\hat L_z = -i\hbar\frac{\partial}{\partial\phi},\quad \hat L_\pm = \pm\hbar e^{\pm i\phi}\left(\frac{\partial}{\partial\theta} \pm i\cot\theta\frac{\partial}{\partial\phi}\right),\quad \hat L^2 = -\hbar^2\left[\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right) + \frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right]$$
            For a central $V(r)$: $[\hat H, \hat L_i] = [\hat H, \hat L^2] = 0$, so $\{\hat H, \hat L^2, \hat L_z\}$ share eigenstates and $\tfrac{d}{dt}\langle\vec L\rangle = \langle\vec r\times(-\nabla V)\rangle = 0$.

            | $Y_\ell^m$ | | Cartesian shape |
            |---|---|---|
            | $Y_0^0$ | $\dfrac{1}{\sqrt{4\pi}}$ | $1$ |
            | $Y_1^0$ | $\sqrt{\dfrac{3}{4\pi}}\cos\theta$ | $z/r$ |
            | $Y_1^{\pm1}$ | $\mp\sqrt{\dfrac{3}{8\pi}}\sin\theta\,e^{\pm i\phi}$ | $\mp(x \pm iy)/\sqrt2r$ |
            | $Y_2^0$ | $\sqrt{\dfrac{5}{16\pi}}(3\cos^2\theta - 1)$ | $(3z^2 - r^2)/r^2$ |
            | $Y_2^{\pm1}$ | $\mp\sqrt{\dfrac{15}{8\pi}}\sin\theta\cos\theta\,e^{\pm i\phi}$ | $(x \pm iy)z/r^2$ |
            | $Y_2^{\pm2}$ | $\sqrt{\dfrac{15}{32\pi}}\sin^2\theta\,e^{\pm2i\phi}$ | $(x \pm iy)^2/r^2$ |

            Parity $(-1)^\ell$; $Y_\ell^\ell \propto \sin^\ell\theta\,e^{i\ell\phi}$. In the $\ell = 1$ basis $(m = 1, 0, -1)$:
            $$L_z = \hbar\begin{pmatrix}1&0&0\\0&0&0\\0&0&-1\end{pmatrix},\quad L_x = \frac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix},\quad L_y = \frac{\hbar}{\sqrt2}\begin{pmatrix}0&-i&0\\i&0&-i\\0&i&0\end{pmatrix}$$
            $L_x$ eigenvectors: $+\hbar$: $\tfrac12(1, \sqrt2, 1)$; $0$: $\tfrac{1}{\sqrt2}(1, 0, -1)$; $-\hbar$: $\tfrac12(1, -\sqrt2, 1)$. Rigid rotor $\hat H = \hat L^2/2I$: $E_\ell = \tfrac{\hbar^2\ell(\ell+1)}{2I}$, degeneracy $2\ell + 1$.

            ### Central potentials

            $$u = rR,\qquad -\frac{\hbar^2}{2m}\frac{d^2u}{dr^2} + \left[V(r) + \frac{\hbar^2\ell(\ell+1)}{2mr^2}\right]u = Eu,\qquad u(0) = 0,\qquad \int_0^\infty|u|^2dr = 1$$
            Near the origin $u \propto r^{\ell+1}$ ($R \propto r^\ell$: only $\ell = 0$ reaches $r = 0$). Bound: $u \to 0$ at $\infty$, discrete $E$; scattering ($E > V(\infty)$): $u$ oscillates, continuous $E$.

            **Spherical box** ($V = 0$ for $r < b$, $\infty$ outside): $E_{N\ell} = \dfrac{\hbar^2\beta_{N\ell}^2}{2mb^2}$, $\beta$ = $N$th zero of $j_\ell$ ($j_0 = \tfrac{\sin x}{x}$, $j_1 = \tfrac{\sin x}{x^2} - \tfrac{\cos x}{x}$):

            | | $N = 1$ | $N = 2$ | $N = 3$ |
            |---|---|---|---|
            | $\ell = 0$ | 3.142 | 6.283 | 9.425 |
            | $\ell = 1$ | 4.493 | 7.725 | 10.904 |
            | $\ell = 2$ | 5.763 | 9.095 | |
            | $\ell = 3$ | 6.988 | 10.417 | |
            | $\ell = 4$ | 8.183 | | |

            ### Hydrogen

            $$V = -\frac{k}{r},\ k = \frac{e^2}{4\pi\varepsilon_0},\quad a = \frac{\hbar^2}{mk} = 0.0529\text{ nm},\quad E_n = -\frac{k}{2an^2} = -\frac{13.6\text{ eV}}{n^2},\quad n = N + \ell,\ \ \ell = 0, \dots, n-1$$
            Degeneracy $n^2$ (no spin): $2\ell + 1$ from rotations, the rest "accidental" (hidden symmetry of $1/r$). $\psi_{100} = \dfrac{e^{-r/a}}{\sqrt{\pi a^3}}$, $R_{10} = \dfrac{2}{a^{3/2}}e^{-r/a}$, $R_{20} = \dfrac{1}{\sqrt2a^{3/2}}\left(1 - \dfrac{r}{2a}\right)e^{-r/2a}$, $R_{21} = \dfrac{1}{\sqrt{24}a^{3/2}}\dfrac ra e^{-r/2a}$.
            Ground state: $P(r)dr = \tfrac{4r^2}{a^3}e^{-2r/a}dr$, most probable $r = a$, $\langle r\rangle = \tfrac32a$, $\langle 1/r\rangle = 1/a$, $P(r < b) = 1 - e^{-2b/a}\left(1 + \tfrac{2b}{a} + \tfrac{2b^2}{a^2}\right)$. In general $\langle r\rangle = \tfrac a2[3n^2 - \ell(\ell+1)]$, $\langle 1/r\rangle = \tfrac{1}{n^2a}$, $\langle T\rangle = -E_n$, $\langle V\rangle = 2E_n$.
            Coulomb $V_{\text{eff}}$ minimum: $r = \ell(\ell+1)a$, depth $\dfrac{E_1}{\ell(\ell+1)}$. Photons: $E_\gamma = E_i - E_f$, $\lambda = \dfrac{hc}{E_\gamma}$, $hc = 1240$ eV·nm (Lyman to $n = 1$: 122 nm …; Balmer to $n = 2$: 656, 486, 434 nm).

            ### Constants

            $\hbar = 1.055\times10^{-34}$ J·s $= 6.582\times10^{-16}$ eV·s · $\hbar c = 197.3$ eV·nm · $hc = 1240$ eV·nm · $m_ec^2 = 0.511$ MeV · $\hbar^2/2m_e = 0.0381$ eV·nm² · $a = 0.0529$ nm · $1$ eV $= 1.602\times10^{-19}$ J · $\int e^{-\alpha x^2}dx = \sqrt{\pi/\alpha}$, $\int x^2e^{-\alpha x^2}dx = \tfrac{1}{2\alpha}\sqrt{\pi/\alpha}$, $\int_0^\infty x^ne^{-\beta x}dx = \tfrac{n!}{\beta^{n+1}}$.
          `),
        ],
      },
      {
        id: 'm2-notation', title: 'Notation glossary (Midterm 2 symbols)', kind: 'read',
        steps: [
          R(md`
            New symbols since Midterm 1, what they mean, and the slip each one invites. The [Midterm 1 glossary](#/l/m1-notation) covers everything before.

            | Symbol | Read as | Meaning | Watch out |
            |---|---|---|---|
            | $[\hat A, \hat B]$ | commutator | $\hat A\hat B - \hat B\hat A$; zero means compatible (shared eigenbasis) | $\langle[\hat A, \hat B]\rangle$ can vanish in a state even if the commutator doesn't |
            | $\Delta t$ | "the time for $\langle Q\rangle$ to change" | $\sigma_Q/|d\langle Q\rangle/dt|$ | time is a parameter, not an operator |
            | $\hat a_+$, $\hat a_-$ | raising, lowering | step $\ket n$ up or down one rung ($\hbar\omega$) | not Hermitian; $\hat a_-\ket0 = 0$ (not $\ket{-1}$) |
            | $\hat N = \hat a_+\hat a_-$ | number operator | counts quanta: $\hat N\ket n = n\ket n$ | $\hat a_-\hat a_+ = \hat N + 1$ |
            | $\ket n$, $\psi_n(x)$ | $n$th oscillator state | energy $\hbar\omega(n + \tfrac12)$, $n$ nodes | $n$ starts at 0 here (at 1 in the square well) |
            | $\xi$ | dimensionless position | $\sqrt{m\omega/\hbar}\,x$ | $H_n(\xi)$, not $H_n(x)$ |
            | $w_x$ | ground-state width | $\sqrt{\hbar/m\omega}$ (Discussion 6) | $\sigma_x$ in $\ket0$ is $w_x/\sqrt2$ |
            | $\ket\alpha$ | coherent state | eigenstate of $\hat a_-$ with complex eigenvalue $\alpha$ | $\ket{\alpha = 1} \ne \ket{n = 1}$ |
            | $\hat{\vec L}$, $\hat L_i$ | orbital angular momentum | $\hat{\vec r}\times\hat{\vec p}$ | only one component sharp at a time |
            | $\hat L^2$ | total angular momentum squared | $\hat L_x^2 + \hat L_y^2 + \hat L_z^2$, eigenvalue $\hbar^2\ell(\ell+1)$ | $|\vec L| = \hbar\sqrt{\ell(\ell+1)}$, bigger than $\hbar\ell$ |
            | $\hat L_\pm$ | angular ladder | $\hat L_x \pm i\hat L_y$, change $m$ by $\pm1$ | coefficient $\hbar\sqrt{\ell(\ell+1) - m(m\pm1)}$ |
            | $\ell$, $m$ | quantum numbers | $L^2 = \hbar^2\ell(\ell+1)$, $L_z = \hbar m$, $|m| \le \ell$ | $m$ is also the mass: context |
            | $Y_\ell^m(\theta, \phi)$ | spherical harmonic | joint eigenfunction of $\hat L^2$, $\hat L_z$; $\propto e^{im\phi}$ | normalized over the sphere: $\int|Y|^2\sin\theta\,d\theta\,d\phi = 1$ |
            | $d\Omega$ | solid angle | $\sin\theta\,d\theta\,d\phi$ | forget the $\sin\theta$ and every normalization is wrong |
            | $R(r)$, $u(r)$ | radial function, $u = rR$ | $|u|^2dr$ = probability between $r$ and $r + dr$ | $|R|^2$ is not the radial probability; $r^2|R|^2$ is |
            | $V_{\text{eff}}$ | effective potential | $V + \hbar^2\ell(\ell+1)/2mr^2$ | the centrifugal term is kinetic energy of the angular motion |
            | $j_\ell$, $\beta_{N\ell}$ | spherical Bessel function, its $N$th zero | spherical box: $E = \hbar^2\beta^2/2mb^2$ | $N$ counts radial solutions (from 1); $N - 1$ nodes |
            | $n$ (hydrogen) | principal quantum number | $n = N + \ell$, $E_n = -13.6\text{ eV}/n^2$ | $\ell \le n - 1$ |
            | $a$ | Bohr radius | $\hbar^2/mk = 0.0529$ nm | Discussion 8 uses $b$ for the box radius to keep $a$ free |
            | $s, p, d, f$ | $\ell = 0, 1, 2, 3$ | "2p" means $n = 2$, $\ell = 1$ | in the box, "1d" means $N = 1$, $\ell = 2$ |
          `),
        ],
      },
    ],
  });
})();

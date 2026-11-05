/* Midterm 2, Unit 5 — Homework 5–7, worked. Each page restates the problems, shows how to see the approach, gives a
   full solution behind a reveal button, says where the skill shows up on the exam, then drills it with new numbers. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const T = (n, id) => `[Topic ${n}](#/l/${id})`;
  const paper = (title, due, items) => ({ t: 'paper', html: `<div class="pp-title"><span>${title}</span><span>${due}</span></div>`, items });
  const drill = R(md`
    ### Practice: same skills, new numbers

    Try each problem above on paper before opening its solution. These cards check that the method transfers to a state or an operator you have not seen.
  `);

  // ---------------------------------------------------------------- figures
  const SQ = Math.SQRT2, N0 = Math.pow(Math.PI, -0.25);
  const psi = [
    (x) => N0 * Math.exp(-x * x / 2),
    (x) => N0 * SQ * x * Math.exp(-x * x / 2),
    (x) => N0 * (2 * x * x - 1) / SQ * Math.exp(-x * x / 2),
    (x) => N0 * x * (2 * x * x - 3) / Math.sqrt(3) * Math.exp(-x * x / 2),
  ];
  // psi_0..psi_2 drawn at their energies inside V = xi^2/2 (energies in units of hbar*omega)
  const shoFig = PF.plot({
    w: 380, h: 260, x: [-3.8, 3.8], y: [0, 3.4], xl: '\\xi', yl: 'E/\\hbar\\omega',
    yt: [[0.5, '\\tfrac12'], [1.5, '\\tfrac32'], [2.5, '\\tfrac52']],
    hlines: [[0.5, ''], [1.5, ''], [2.5, '']],
    curves: [
      { f: (x) => x * x / 2, cls: 'dim' },
      { f: (x) => 0.5 + 0.55 * psi[0](x), lab: '\\psi_0', labAt: 2.6 },
      { f: (x) => 1.5 + 0.55 * psi[1](x), lab: '\\psi_1', labAt: 2.9 },
      { f: (x) => 2.5 + 0.55 * psi[2](x), lab: '\\psi_2', labAt: 3.2 },
    ],
  });
  const circle = (cx, cy, r, n = 120) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);
  // HW6 P1: orbit of (<x>, <p>) in units sqrt(hbar/2m omega), sqrt(hbar m omega/2): circle of radius 24/25, ground blob of radius 1
  const orbitFig = PF.plot({
    w: 300, h: 300, x: [-2.2, 2.2], y: [-2.2, 2.2], zero: true, xl: '\\langle x\\rangle', yl: '\\langle p\\rangle',
    curves: [
      { pts: circle(0, 0, 0.96) },
      { pts: circle(0.96, 0, 1), cls: 'dash dim' },
    ],
    pts: [{ x: 0.96, y: 0, lab: 't=0' }, { x: 0, y: -0.96, lab: 't=T/4', anchor: 'tl' }],
  });
  // HW6 P3(g): coherent state |alpha>, |alpha|^2 = 4, versus |N = 4>, same units (ground blob radius 1)
  const cohFig = PF.plot({
    w: 280, h: 280, x: [-6, 6], y: [-6, 6], zero: true, xl: 'x', yl: 'p',
    curves: [{ pts: circle(0, 0, 4), cls: 'dash dim' }].concat([0, 1, 2, 3].map((k) => ({ pts: circle(4 * Math.cos(k * Math.PI / 2), -4 * Math.sin(k * Math.PI / 2), 1) }))),
    pts: [{ x: 4, y: 0, lab: 't=0' }, { x: 0, y: -4, lab: 'T/4', anchor: 'tl' }],
  });
  const numFig = PF.plot({
    w: 280, h: 280, x: [-6, 6], y: [-6, 6], zero: true, xl: 'x', yl: 'p',
    curves: [{ pts: circle(0, 0, Math.sqrt(18) - 1, 160), cls: 'dash' }, { pts: circle(0, 0, Math.sqrt(18) + 1, 160), cls: 'dash' }, { pts: circle(0, 0, Math.sqrt(18), 160), cls: 'dim' }],
  });
  const compareFig = PF.row([{ svg: cohFig, cap: 'coherent $\\ket\\alpha$: a blob riding the orbit' }, { svg: numFig, cap: '$\\ket N$: a ring, no phase, nothing moves' }]);

  C.unit({
    id: 'u11', exam: 'm2', num: 'Unit 5', title: 'Homework 5–7, worked',
    blurb: 'Every Homework 5–7 problem: how to see it, the full solution, where it shows up on the exam, and new-number practice.',
    lessons: [
      // ------------------------------------------------------------------ HW 5
      {
        id: 'hw5', title: 'Homework 5: Ehrenfest, minimum uncertainty, oscillator wavefunctions',
        steps: [
          R(md`
            **Trains:** the generalized Ehrenfest theorem and commutator algebra (${T(11, 't11-ehrenfest')}), the energy–time relation and minimum-uncertainty states (${T(12, 't12-energytime')}), oscillator wavefunctions from the ladder operators (${T(14, 't14-showave')}).

            **Three moves solve the whole set:**
            1. **How does an average move?** One commutator: $\dfrac{d\langle Q\rangle}{dt} = \dfrac i\hbar\langle[\hat H, \hat Q]\rangle + \left\langle\dfrac{\partial\hat Q}{\partial t}\right\rangle$. Never differentiate wavefunctions when a commutator will do.
            2. **A commutator of operators that act on functions:** let it act on a test function $g(x)$, then read off what multiplies $g$.
            3. **Anything about the oscillator ground state:** start from $\hat a_-\psi_0 = 0$. To climb, apply $\hat a_+$.
          `),
          paper('PHYS 486 · Homework 5', 'Due 10/14', [
            {
              q: md`**1 (a), (b). Commutator identities.** (a) Prove $[\hat A + \hat B, \hat C] = [\hat A, \hat C] + [\hat B, \hat C]$ and $[\hat A\hat B, \hat C] = \hat A[\hat B, \hat C] + [\hat A, \hat C]\hat B$. (b) Show $[f(\hat x), \hat p] = i\hbar f'(\hat x)$ for any differentiable $f$ (let it act on a test function $g(x)$).`,
              ans: md`(a) Expand, and add and subtract $\hat A\hat C\hat B$. (b) $[f, \hat p]g = -i\hbar fg' + i\hbar(fg)' = i\hbar f'g$.`,
              sol: md`
                **How to see it.** The first identity is just linearity. The second is a product rule: "$\hat A$ comes out on the left, $\hat B$ on the right", obtained by adding zero.

                **(a)** $[\hat A + \hat B, \hat C] = (\hat A + \hat B)\hat C - \hat C(\hat A + \hat B) = (\hat A\hat C - \hat C\hat A) + (\hat B\hat C - \hat C\hat B)$.
                $$[\hat A\hat B, \hat C] = \hat A\hat B\hat C - \hat C\hat A\hat B = \hat A\hat B\hat C - \hat A\hat C\hat B + \hat A\hat C\hat B - \hat C\hat A\hat B = \hat A[\hat B, \hat C] + [\hat A, \hat C]\hat B$$
                Keep the order: $\hat A$ and $[\hat B, \hat C]$ need not commute.

                **(b)** For any $g$:
                $$[f(\hat x), \hat p]g = f\cdot(-i\hbar g') - (-i\hbar)(fg)' = -i\hbar fg' + i\hbar f'g + i\hbar fg' = i\hbar f'g$$
                $g$ was arbitrary, so $[f(\hat x), \hat p] = i\hbar f'(\hat x)$. Special cases you will use constantly: $[\hat x, \hat p] = i\hbar$, $[\hat x^2, \hat p] = 2i\hbar\hat x$, $[V(\hat x), \hat p] = i\hbar V'(\hat x)$.

                **Intuition.** $\hat p$ generates translations. Commuting it past $f(x)$ asks "how much does $f$ change when you shift $x$?", which is $f'$.
              `,
            },
            {
              q: md`**1 (c). Four special cases.** Apply $\dfrac{d\langle Q\rangle}{dt} = \dfrac i\hbar\langle[\hat H, \hat Q]\rangle + \langle\partial_t\hat Q\rangle$ with $\hat H = \hat p^2/2m + V(\hat x)$ to $\hat Q = 1$, $\hat H$, $\hat x$, $\hat p$. For each, state in one sentence what physical statement you recovered.`,
              ans: md`$\hat Q = 1$: $\tfrac{d}{dt}\braket{\Psi|\Psi} = 0$ (probability conserved). $\hat H$: $\tfrac{d\langle H\rangle}{dt} = 0$ (energy conserved). $\hat x$: $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$. $\hat p$: $\tfrac{d\langle p\rangle}{dt} = -\langle V'\rangle$ (Newton for averages).`,
              sol: md`
                **How to see it.** Everything commutes with 1 and with itself, so the first two are free. For $\hat x$ only the kinetic term fails to commute; for $\hat p$ only the potential.

                - $\hat Q = 1$: $[\hat H, 1] = 0$, so $\tfrac{d}{dt}\braket{\Psi|\Psi} = 0$. **Normalization is conserved**: probability does not leak out of the universe.
                - $\hat Q = \hat H$: $[\hat H, \hat H] = 0$ and $\partial_t\hat H = 0$, so $\langle H\rangle$ is constant: **energy conservation** for a time-independent Hamiltonian.
                - $\hat Q = \hat x$: $[\hat H, \hat x] = \tfrac{1}{2m}[\hat p^2, \hat x] = \tfrac{1}{2m}\left(\hat p[\hat p, \hat x] + [\hat p, \hat x]\hat p\right) = -\tfrac{i\hbar}{m}\hat p$. Times $\tfrac i\hbar$: $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$. **Velocity is momentum over mass**, for averages.
                - $\hat Q = \hat p$: $[\hat H, \hat p] = [V, \hat p] = i\hbar V'$ by (b). Times $\tfrac i\hbar$: $\tfrac{d\langle p\rangle}{dt} = -\langle V'(x)\rangle$. **Newton's second law for averages** (Ehrenfest).

                !!key The fine print
                  It is $\langle V'(x)\rangle$, the average force, not $V'(\langle x\rangle)$, the force at the average position. They agree only when $V'$ is linear in $x$: a constant force or the **harmonic oscillator**. That is why oscillator averages move exactly like a classical oscillator, for any state.
              `,
            },
            {
              q: md`**1 (d). Position and energy.** Prove $\sigma_x\sigma_H \ge \dfrac{\hbar}{2m}|\langle\hat p\rangle|$. Why does it say nothing for stationary states? Using (c), show it is exactly $\Delta E\,\Delta t \ge \hbar/2$ with $\hat x$ as the clock.`,
              ans: md`Generalized uncertainty with $[\hat x, \hat H] = \tfrac{i\hbar}{m}\hat p$. Stationary: $\sigma_H = 0$ and $\langle p\rangle = 0$, so $0 \ge 0$. With $\langle p\rangle = m\,d\langle x\rangle/dt$: $\sigma_H\cdot\dfrac{\sigma_x}{|d\langle x\rangle/dt|} \ge \dfrac\hbar2$.`,
              sol: md`
                **How to see it.** Plug the commutator from (c) into the generalized uncertainty relation, then recognize $\langle p\rangle/m$ as the speed of $\langle x\rangle$.

                $[\hat x, \hat H] = -[\hat H, \hat x] = \tfrac{i\hbar}{m}\hat p$, so
                $$\sigma_x^2\sigma_H^2 \ge \left(\frac{1}{2i}\cdot\frac{i\hbar}{m}\langle p\rangle\right)^2 = \left(\frac{\hbar}{2m}\langle p\rangle\right)^2$$
                **Stationary states.** $\sigma_H = 0$, and nothing moves: $\langle p\rangle = m\,\tfrac{d\langle x\rangle}{dt} = 0$. The relation reads $0 \ge 0$: true, empty.

                **The clock.** Replace $\langle p\rangle/m = d\langle x\rangle/dt$:
                $$\sigma_H\,\frac{\sigma_x}{|d\langle x\rangle/dt|} \ge \frac\hbar2 \qquad\Longleftrightarrow\qquad \Delta E\,\Delta t \ge \frac\hbar2,\quad \Delta E \equiv \sigma_H,\ \Delta t \equiv \frac{\sigma_x}{|d\langle x\rangle/dt|}$$
                $\Delta t$ is the time it takes $\langle x\rangle$ to move by one standard deviation: how long you wait before the position distribution has visibly changed. **A state that changes fast must have a large spread in energy.** Time is not an operator here; it enters only through the rate of change of something that is.
              `,
            },
            {
              q: md`**2 (a). When is the bound reached?** With $\ket f = (\hat A - \langle A\rangle)\ket\Psi$, $\ket g = (\hat B - \langle B\rangle)\ket\Psi$, $z = \braket{f|g}$: $\sigma_A^2\sigma_B^2 = \braket{f|f}\braket{g|g} \overset{(1)}{\ge} |z|^2 \overset{(2)}{\ge} \left[\tfrac{1}{2i}(z - z^*)\right]^2$. Using the Cauchy–Schwarz proof from HW 4 (expand in a basis whose first vector is $\ket f/\|f\|$), show (1) is an equality iff $\ket g = c\ket f$; then show both are equalities iff $\ket g = i\lambda\ket f$, $\lambda$ real ($\sigma_A \ne 0$).`,
              ans: md`$\braket{f|f}\braket{g|g} - |z|^2 = \|f\|^2\sum_{n\ge2}|g_n|^2$: zero iff $\ket g \propto \ket f$. Then $z = c\,\sigma_A^2$, and (2) drops $(\text{Re}\,z)^2$, so it is an equality iff $c$ is purely imaginary.`,
              sol: md`
                **How to see it.** Inequality (1) throws away every component of $\ket g$ perpendicular to $\ket f$. Inequality (2) throws away the real part of $z$. Equality means there was nothing to throw away.

                **(1).** Let $\ket{e_1} = \ket f/\|f\|$ and complete it to an orthonormal basis. Write $\ket g = \sum_ng_n\ket{e_n}$. Then
                $$\braket{f|f}\braket{g|g} = \|f\|^2\sum_n|g_n|^2,\qquad |z|^2 = |\braket{f|g}|^2 = \|f\|^2|g_1|^2$$
                The difference is $\|f\|^2\sum_{n\ge2}|g_n|^2 \ge 0$, zero iff $g_n = 0$ for all $n \ge 2$, i.e. $\ket g = g_1\ket{e_1} = c\ket f$.

                **(2).** $\tfrac{1}{2i}(z - z^*) = \text{Im}\,z$, and $|z|^2 = (\text{Re}\,z)^2 + (\text{Im}\,z)^2 \ge (\text{Im}\,z)^2$, equality iff $\text{Re}\,z = 0$. With $\ket g = c\ket f$: $z = c\braket{f|f} = c\,\sigma_A^2$, and $\sigma_A^2 > 0$, so $\text{Re}\,z = 0 \iff \text{Re}\,c = 0 \iff c = i\lambda$ with $\lambda$ real. Conversely, $\ket g = i\lambda\ket f$ makes both steps equalities.
              `,
            },
            {
              q: md`**2 (b). The minimum-uncertainty wavefunction.** For $\hat A = \hat x$, $\hat B = \hat p$, write $\ket g = i\lambda\ket f$ as a differential equation for $\Psi(x)$ and solve it. Which $\lambda$ give a normalizable solution? How do $\langle x\rangle$ and $\langle p\rangle$ enter, and what sets $\sigma_x$?`,
              ans: md`$\Psi = A\exp\left[-\dfrac{\lambda}{2\hbar}(x - \langle x\rangle)^2\right]e^{i\langle p\rangle x/\hbar}$; normalizable iff $\lambda > 0$; $\langle x\rangle$ is the center, $\langle p\rangle$ the phase gradient; $\sigma_x = \sqrt{\hbar/2\lambda}$ (and $\sigma_p = \sqrt{\hbar\lambda/2}$).`,
              sol: md`
                **How to see it.** A first-order linear ODE whose right side is linear in $x$: the solution is the exponential of a quadratic, a Gaussian times a plane wave.

                $$(\hat p - \langle p\rangle)\Psi = i\lambda(x - \langle x\rangle)\Psi\ \Longrightarrow\ -i\hbar\Psi' = \left[\langle p\rangle + i\lambda(x - \langle x\rangle)\right]\Psi\ \Longrightarrow\ \frac{\Psi'}{\Psi} = \frac{i\langle p\rangle}{\hbar} - \frac{\lambda}{\hbar}(x - \langle x\rangle)$$
                $$\Psi(x) = A\,e^{-\lambda(x - \langle x\rangle)^2/2\hbar}\,e^{i\langle p\rangle x/\hbar}$$
                - **Normalizable iff $\lambda > 0$.** $\lambda < 0$ blows up; $\lambda = 0$ is a plane wave.
                - $\langle x\rangle$ is the **center** of the Gaussian; $\langle p\rangle$ is the **phase gradient**, a plane-wave factor with wavenumber $\langle p\rangle/\hbar$. Both come out consistent: the state really has the $\langle x\rangle$ and $\langle p\rangle$ you put in.
                - **Width.** $|\Psi|^2 \propto e^{-\lambda(x - \langle x\rangle)^2/\hbar}$; matching $e^{-(x - \langle x\rangle)^2/2\sigma_x^2}$ gives $\sigma_x^2 = \hbar/2\lambda$. Then $\sigma_p = \hbar/2\sigma_x = \sqrt{\hbar\lambda/2}$. $\lambda$ is the one shape knob: it trades position width for momentum width.

                **The picture.** Every minimum-uncertainty state is a Gaussian, placed anywhere, moving with any average momentum, squeezed by any amount. Nothing else qualifies.
              `,
            },
            {
              q: md`**2 (c). The spreading Gaussian.** The free packet $\Psi(x,t) = \left(\tfrac{2a}{\pi}\right)^{1/4}\dfrac{e^{-ax^2/(1 + 2i\hbar at/m)}}{\sqrt{1 + 2i\hbar at/m}}$ has $\sigma_x\sigma_p = \hbar/2$ only at $t = 0$. Show (1) stays an equality for all $t$, so (2) fails. Show the discarded term is $\text{Re}\,z = \tfrac12\langle\hat x\hat p + \hat p\hat x\rangle - \langle x\rangle\langle p\rangle$; explain physically why it becomes nonzero as the packet spreads. Its sign for $t < 0$?`,
              ans: md`$\hat p\Psi = c\,x\Psi$ with $c = \dfrac{2i\hbar a}{1 + i\theta}$, $\theta = \dfrac{2\hbar at}{m}$: (1) holds for all $t$, but $\text{Re}\,c \ne 0$ for $t \ne 0$. $\text{Re}\,z = \hbar^2at/m$: positive for $t > 0$ (fast parts run ahead), negative for $t < 0$ (the packet is still focusing).`,
              sol: md`
                **How to see it.** A Gaussian's derivative is $x$ times itself, so $\ket g \propto \ket f$ always: (1) is safe. But once the exponent has a complex coefficient, the proportionality constant gets a real part, and that is exactly what (2) throws away.

                **(1) for all t.** Here $\langle x\rangle = \langle p\rangle = 0$ (even $|\Psi|^2$; $\Psi(-x) = \Psi(x)$). With $\theta = 2\hbar at/m$:
                $$\hat p\Psi = -i\hbar\Psi' = -i\hbar\cdot\frac{-2ax}{1 + i\theta}\Psi = \underbrace{\frac{2i\hbar a}{1 + i\theta}}_{c}\,x\Psi$$
                $c$ does not depend on $x$, so $\ket g = c\ket f$ at every time. But $c = \dfrac{2\hbar a(\theta + i)}{1 + \theta^2}$ has $\text{Re}\,c \ne 0$ for $t \ne 0$: (2) fails.

                **The discarded term.** $z = \braket{f|g} = \bra\Psi(\hat x - \langle x\rangle)(\hat p - \langle p\rangle)\ket\Psi = \langle\hat x\hat p\rangle - \langle x\rangle\langle p\rangle$ (moving the Hermitian $\hat x$ onto the ket), and $z^* = \langle\hat p\hat x\rangle - \langle x\rangle\langle p\rangle$. So
                $$\text{Re}\,z = \tfrac12(z + z^*) = \tfrac12\langle\hat x\hat p + \hat p\hat x\rangle - \langle x\rangle\langle p\rangle$$
                the **position–momentum correlation**. Explicitly, $\text{Re}\,z = \text{Re}(c)\,\sigma_x^2$ with $\sigma_x^2 = \tfrac{1 + \theta^2}{4a}$: $\text{Re}\,z = \tfrac{\hbar\theta}{2} = \tfrac{\hbar^2at}{m}$, while $\text{Im}\,z = \tfrac\hbar2$ always. Then $\sigma_x^2\sigma_p^2 = |z|^2$ gives $\sigma_x\sigma_p = \tfrac\hbar2\sqrt{1 + \theta^2}$, the HW 2 result.

                **Physically.** The packet contains a spread of momenta. As it spreads, the fast components run ahead to large $|x|$ and the slow ones lag: where you find the particle tells you something about how fast it moves. That correlation is $\text{Re}\,z > 0$. (Check: for a free particle $\tfrac{d\langle x^2\rangle}{dt} = \tfrac1m\langle\hat x\hat p + \hat p\hat x\rangle$, so $\text{Re}\,z = \tfrac m2\tfrac{d\sigma_x^2}{dt}$: positive exactly when the packet is growing.)

                **For $t < 0$** the packet is converging toward its narrowest moment at $t = 0$: the fast components are behind, catching up. Anti-correlated: $\text{Re}\,z < 0$.

                Keeping $(\text{Re}\,z)^2$ gives the Schrödinger–Robertson relation $\sigma_x^2\sigma_p^2 \ge (\text{Re}\,z)^2 + \hbar^2/4$, which this packet saturates at all times because (1) is always an equality.
              `,
            },
            {
              q: md`**2 (d). The infinite well can't do it.** HW 2 found $\sigma_x\sigma_p > \hbar/2$ for every stationary state of the infinite well. Use (b) to argue that **no** state of the infinite well, stationary or not, reaches $\sigma_x\sigma_p = \hbar/2$.`,
              ans: md`Equality forces a Gaussian, which is nonzero for every $x$; every state of the infinite well vanishes outside $0 < x < a$.`,
              sol: md`
                **How to see it.** (b) found *every* state with $\sigma_x\sigma_p = \hbar/2$: Gaussians with $\lambda > 0$. Check whether any of them is allowed.

                A Gaussian is nonzero everywhere. Every state of the infinite well must vanish for $x \le 0$ and $x \ge a$ (it is built from the $\sin(n\pi x/a)$, or simply: $V = \infty$ there). Contradiction, so the bound is strict: $\sigma_x\sigma_p > \hbar/2$ for every state, not just the stationary ones. Same argument for any state confined to a finite region: compact support and minimum uncertainty are incompatible.
              `,
            },
            {
              q: md`**3 (a), (b). Building $\psi_2$.** With $\hat a_\pm = \dfrac{1}{\sqrt{2\hbar m\omega}}(\mp i\hat p + m\omega\hat x)$ and $\psi_1 = \hat a_+\psi_0$: (a) construct $\psi_2(x)$ by applying $\hat a_+$ to $\psi_1$; write it in terms of $\xi = \sqrt{m\omega/\hbar}\,x$ and check it against the Hermite-polynomial formula. (b) Sketch $\psi_0, \psi_1, \psi_2$ with the potential, each drawn at the height of its energy; comment on nodes and parity.`,
              ans: md`$\psi_2 = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}\tfrac{1}{\sqrt2}(2\xi^2 - 1)e^{-\xi^2/2}$, which is $\tfrac{1}{\sqrt{2^2\,2!}}H_2(\xi)$ with $H_2 = 4\xi^2 - 2$. $\psi_n$ has $n$ nodes and parity $(-1)^n$.`,
              sol: md`
                **How to see it.** In the dimensionless variable the raising operator is $\hat a_+ = \tfrac{1}{\sqrt2}\left(\xi - \tfrac{d}{d\xi}\right)$: "multiply by $\xi$, subtract the slope". Each application adds one power of $\xi$ to the polynomial and one node.

                **The operator in $\xi$.** $x = \sqrt{\hbar/m\omega}\,\xi$, $\tfrac{d}{dx} = \sqrt{m\omega/\hbar}\,\tfrac{d}{d\xi}$, so $-i\hat p = -\hbar\tfrac{d}{dx} = -\sqrt{\hbar m\omega}\tfrac{d}{d\xi}$ and $m\omega x = \sqrt{\hbar m\omega}\,\xi$. Dividing by $\sqrt{2\hbar m\omega}$: $\hat a_+ = \tfrac{1}{\sqrt2}(\xi - \partial_\xi)$.

                **Climb.** With $N = (m\omega/\pi\hbar)^{1/4}$: $\psi_0 = Ne^{-\xi^2/2}$, and $(\xi - \partial_\xi)e^{-\xi^2/2} = 2\xi e^{-\xi^2/2}$, so $\psi_1 = N\sqrt2\,\xi e^{-\xi^2/2}$. Then, using $\hat a_+\ket1 = \sqrt2\ket2$:
                $$\psi_2 = \frac{1}{\sqrt2}\hat a_+\psi_1 = \frac{N}{2}(\xi - \partial_\xi)\left(\sqrt2\,\xi e^{-\xi^2/2}\right) = \frac{N}{\sqrt2}\left[\xi^2 - (1 - \xi^2)\right]e^{-\xi^2/2} = \frac{N}{\sqrt2}(2\xi^2 - 1)e^{-\xi^2/2}$$
                **Check.** $\psi_n = \tfrac{N}{\sqrt{2^nn!}}H_n(\xi)e^{-\xi^2/2}$ with $H_2 = 4\xi^2 - 2$: $\tfrac{N}{\sqrt8}(4\xi^2 - 2) = \tfrac{N}{\sqrt2}(2\xi^2 - 1)$ ✓.

                **(b)** [[fig:sho]]
                - **Nodes:** $\psi_0$ none, $\psi_1$ one (at 0), $\psi_2$ two (at $\xi = \pm1/\sqrt2$). The $n$th state has $n$ nodes: more wiggles, more curvature, more kinetic energy.
                - **Parity:** even, odd, even: $\psi_n(-x) = (-1)^n\psi_n(x)$, because $V$ is even and $\hat a_+$ flips parity ($\xi$ and $\partial_\xi$ are both odd).
                - **Spacing:** equal steps $\hbar\omega$. Each state pokes past its classical turning points $\xi = \pm\sqrt{2n + 1}$ and decays there.
              `,
              figs: { sho: { svg: shoFig, cap: 'The first three stationary states of the oscillator, each drawn at its energy $\\hbar\\omega(n+\\tfrac12)$ inside $V = \\tfrac12m\\omega^2x^2$.' } },
            },
            {
              q: md`**3 (c), (d). Overlaps, and the ground state as a minimum-uncertainty state.** (c) Which of $\braket{\psi_0|\psi_1}$, $\braket{\psi_1|\psi_2}$, $\braket{\psi_0|\psi_2}$ vanish by parity alone? Compute the remaining one by integration; then get it in one line from $\hat a_-\psi_0 = 0$ and $\hat a_+ = (\hat a_-)^\dagger$. (d) Show $\hat a_-\psi_0 = 0$ is precisely the condition of 2(a) for $\hat x$ and $\hat p$. Identify $\lambda$ and find $\sigma_x$, $\sigma_p$ without integrals.`,
              ans: md`(c) The first two (even × odd). $\braket{\psi_0|\psi_2} = \tfrac{1}{\sqrt{2\pi}}\int(2\xi^2 - 1)e^{-\xi^2}d\xi = 0$; one line: $\braket{\psi_0|\hat a_+\psi_1} = \braket{\hat a_-\psi_0|\psi_1} = 0$. (d) $\hat p\psi_0 = im\omega\hat x\psi_0$: $\lambda = m\omega$, $\sigma_x = \sqrt{\hbar/2m\omega}$, $\sigma_p = \sqrt{\hbar m\omega/2}$.`,
              sol: md`
                **(c) How to see it.** Even times odd integrates to zero over a symmetric range. $\psi_0$ and $\psi_2$ are both even, so parity is silent; but $\psi_2$ is "$\hat a_+$ of something", and moving $\hat a_+$ onto the bra turns it into $\hat a_-$, which kills $\psi_0$.

                **By integration.** $dx = \sqrt{\hbar/m\omega}\,d\xi$ and $N^2\sqrt{\hbar/m\omega} = 1/\sqrt\pi$:
                $$\braket{\psi_0|\psi_2} = \frac{1}{\sqrt\pi}\cdot\frac{1}{\sqrt2}\int_{-\infty}^\infty(2\xi^2 - 1)e^{-\xi^2}d\xi = \frac{1}{\sqrt{2\pi}}\left(2\cdot\frac{\sqrt\pi}{2} - \sqrt\pi\right) = 0$$
                **In one line.** $\braket{\psi_0|\psi_2} = \tfrac{1}{\sqrt2}\braket{\psi_0|\hat a_+\psi_1} = \tfrac{1}{\sqrt2}\braket{\hat a_-\psi_0|\psi_1} = 0$.

                **(d)** $\hat a_-\psi_0 = 0 \iff (i\hat p + m\omega\hat x)\psi_0 = 0 \iff \hat p\psi_0 = i\,m\omega\,\hat x\psi_0$. Compare $(\hat p - \langle p\rangle)\Psi = i\lambda(\hat x - \langle x\rangle)\Psi$, i.e. $\hat p\Psi = i\lambda\hat x\Psi + (\langle p\rangle - i\lambda\langle x\rangle)\Psi$. The ground-state equation has no constant term, so $\langle p\rangle = i\lambda\langle x\rangle$; both are real, so both vanish, and **$\lambda = m\omega$**. (Consistent: $\psi_0$ is real, so $\langle p\rangle = 0$; even, so $\langle x\rangle = 0$.) Then 2(b) gives, with no integral:
                $$\sigma_x = \sqrt{\frac{\hbar}{2m\omega}},\qquad \sigma_p = \sqrt{\frac{\hbar m\omega}{2}},\qquad \sigma_x\sigma_p = \frac\hbar2$$
                **The point.** The oscillator ground state is the minimum-uncertainty Gaussian whose squeeze parameter is set by the spring: $\lambda = m\omega$. A Gaussian of any other width is still minimum-uncertainty, but not stationary in this oscillator (it breathes).
              `,
            },
          ]),
          R(md`
            **Where this shows up on the exam.** Midterm 1 asked "show $\hat Q$ is Hermitian, and say where you need the boundary condition": expect the Midterm 2 analog to be "find $d\langle Q\rangle/dt$ from a commutator, and say what is conserved". The sketch in 3(b) (nodes, parity, decay past the turning points, drawn at the right energy) is exactly the kind of sketch the rubric grades. And "which states minimize $\sigma_x\sigma_p$, and why can't this one?" is a natural short-answer part.
          `),
          drill,
          Q(md`$[\hat x^3, \hat p] = $?`, [md`$3i\hbar\hat x^2$`, md`$i\hbar$`, md`$3\hat x^2$`, md`$-3i\hbar\hat x^2$`], 0,
            [null, md`That is $[\hat x, \hat p]$.`, md`Missing the $i\hbar$.`, md`Sign: $[f(\hat x), \hat p] = +i\hbar f'$.`],
            md`$[f(\hat x), \hat p] = i\hbar f'(\hat x)$ with $f = x^3$.`),
          Q(md`For $V = \alpha x^4$, Ehrenfest gives $d\langle p\rangle/dt = $?`, [md`$-4\alpha\langle x^3\rangle$`, md`$-4\alpha\langle x\rangle^3$`, md`$-\alpha\langle x^4\rangle$`, md`$0$ in every state`], 0,
            [null, md`That is the force at the average position. Equal only if $V'$ is linear.`, md`That is $\langle V\rangle$, not $\langle V'\rangle$.`, md`Only in stationary states (or states symmetric enough).`],
            md`$\tfrac{d\langle p\rangle}{dt} = -\langle V'\rangle = -4\alpha\langle x^3\rangle$. For an anharmonic potential the average does **not** follow the classical trajectory of $\langle x\rangle$.`),
          P({
            title: 'Energy spread needed to move',
            q: md`A packet has $\langle p\rangle = p_0$ and position spread $\sigma_x = s$. Using $\sigma_x\sigma_H \ge \tfrac{\hbar}{2m}|\langle p\rangle|$, what is the smallest possible $\sigma_H$?`,
            parts: [{ lbl: '\\sigma_{H,\\min}', expr: 'hbar*p0/(2*m*s)', vars: { hbar: [0.5, 2], p0: [0.5, 2], m: [0.5, 2], s: [0.5, 2] } }],
            hints: [md`Divide the bound by $\sigma_x$.`],
            sol: md`$\sigma_H \ge \dfrac{\hbar p_0}{2ms}$. A narrow, fast packet needs a wide energy distribution: it changes quickly.`,
          }),
          P({
            title: 'Squeezed Gaussian',
            q: md`A minimum-uncertainty state has $(\hat p - \langle p\rangle)\Psi = i\lambda(\hat x - \langle x\rangle)\Psi$ with $\lambda = 3m\omega$. Find $\sigma_x$ and $\sigma_p$.`,
            parts: [
              { lbl: '\\sigma_x', expr: 'sqrt(hbar/(6*m*omega))', vars: { hbar: [0.5, 2], m: [0.5, 2], omega: [0.5, 2] } },
              { lbl: '\\sigma_p', expr: 'sqrt(3*hbar*m*omega/2)', vars: { hbar: [0.5, 2], m: [0.5, 2], omega: [0.5, 2] } },
            ],
            hints: [md`$\sigma_x = \sqrt{\hbar/2\lambda}$, $\sigma_p = \sqrt{\hbar\lambda/2}$.`],
            sol: md`$\sigma_x = \sqrt{\hbar/6m\omega}$ (narrower than the ground state by $\sqrt3$), $\sigma_p = \sqrt{3\hbar m\omega/2}$ (wider by $\sqrt3$). Product $\hbar/2$. In the oscillator this state is not stationary: its width oscillates at $2\omega$.`,
          }),
          P({
            title: 'Nodes of ψ₃',
            q: md`$\psi_3 = \hat a_+\psi_2/\sqrt3 \propto (2\xi^3 - 3\xi)e^{-\xi^2/2}$. Find its positive node $\xi_{\text{node}}$ and its classical turning point $\xi_t = \sqrt{2n + 1}$.`,
            parts: [{ lbl: '\\xi_{\\text{node}}', ans: Math.sqrt(1.5) }, { lbl: '\\xi_t', ans: Math.sqrt(7) }],
            hints: [md`$2\xi^2 - 3 = 0$. $E_3 = \tfrac72\hbar\omega = \tfrac12m\omega^2x_t^2$.`],
            sol: md`Nodes at $0, \pm\sqrt{3/2} = \pm1.22$; turning points at $\pm\sqrt7 = \pm2.65$. All three nodes lie inside the classically allowed region, as they must: outside it $\psi$ curves away from the axis and cannot turn around.`,
          }),
          Q(md`Which overlap vanishes by the ladder trick but **not** by parity?`, [md`$\braket{\psi_1|\psi_3}$`, md`$\braket{\psi_0|\psi_1}$`, md`$\braket{\psi_2|\psi_3}$`, md`$\braket{\psi_1|\hat x|\psi_2}$`], 0,
            [null, 'Even × odd: parity already kills it.', 'Even × odd: parity kills it.', md`That is not zero: $\hat x$ connects $n$ to $n \pm 1$; it equals $\sqrt{\hbar/m\omega}$.`],
            md`$\psi_1$ and $\psi_3$ are both odd. $\braket{\psi_1|\psi_3} \propto \braket{\psi_1|\hat a_+\psi_2} = \braket{\hat a_-\psi_1|\psi_2} = \braket{\psi_0|\psi_2} = 0$.`),
          Q(md`A free Gaussian packet is narrowest at $t = 0$. At $t = -1$ s, the correlation $\tfrac12\langle\hat x\hat p + \hat p\hat x\rangle$ (with $\langle x\rangle = \langle p\rangle = 0$) is…`, ['negative: the packet is converging', 'positive: it is always spreading', 'zero: the packet is a minimum-uncertainty state', 'imaginary'], 0,
            [null, 'Before t = 0 the free packet shrinks.', 'Only at t = 0.', md`$\tfrac12\langle\hat x\hat p + \hat p\hat x\rangle$ is the expectation value of a Hermitian operator: real.`],
            md`$\text{Re}\,z = \tfrac m2\tfrac{d\sigma_x^2}{dt} < 0$ while the packet focuses. It equals $\hbar^2at/m$.`),
          P({
            title: 'Free packet away from the minimum',
            q: md`For the free Gaussian of HW 5 #2(c), find $\sigma_x\sigma_p/\hbar$ at the time when $2\hbar at/m = 1$.`,
            parts: [{ lbl: '\\sigma_x\\sigma_p/\\hbar', ans: Math.SQRT2 / 2 }],
            hints: [md`$\sigma_x\sigma_p = \tfrac\hbar2\sqrt{1 + \theta^2}$.`],
            sol: md`$\tfrac12\sqrt2 = 0.707$. Of the $|z|^2 = \tfrac{\hbar^2}{4}(1 + \theta^2)$, the $\tfrac{\hbar^2}{4}\theta^2$ is the correlation $(\text{Re}\,z)^2$.`,
          }),
        ],
      },
      // ------------------------------------------------------------------ HW 6
      {
        id: 'hw6', title: 'Homework 6: oscillator motion, matrix elements, coherent states',
        steps: [
          R(md`
            **Trains:** oscillator dynamics with ladder operators (${T(15, 't15-shomotion')}), matrix elements and the algebra of $\hat a_\pm$ (${T(13, 't13-ladder')}), coherent states (${T(16, 't16-coherent')}).

            **The routine for every oscillator expectation value (no Hermite polynomials, no integrals):**
            1. Expand the state in $\ket n$; give each coefficient its phase $e^{-i(n + \frac12)\omega t}$.
            2. Write the operator in ladder operators: $\hat x = \sqrt{\tfrac{\hbar}{2m\omega}}(\hat a_+ + \hat a_-)$, $\hat p = i\sqrt{\tfrac{\hbar m\omega}{2}}(\hat a_+ - \hat a_-)$.
            3. **Selection rule:** $\hat x$, $\hat p$ connect $n$ only to $n \pm 1$; $\hat x^2$, $\hat p^2$ connect $n$ to $n$ and $n \pm 2$. Only those pairs of coefficients survive, so $\langle x\rangle(t)$ oscillates at exactly $\omega$ and $\langle x^2\rangle(t)$ at $0$ and $2\omega$.
          `),
          paper('PHYS 486 · Homework 6', 'Due 10/21', [
            {
              q: md`**1 (a), (b). Motion.** A particle in the oscillator starts in $\Psi(x, 0) = A\left[3\psi_0(x) + 4\psi_1(x)\right]$. (a) Find $A$. (b) Construct $\Psi(x, t)$ and $|\Psi(x, t)|^2$. What would the oscillation frequency have been with $\psi_2$ instead of $\psi_1$?`,
              ans: md`$A = \tfrac15$. $\Psi = \tfrac15\left[3\psi_0e^{-i\omega t/2} + 4\psi_1e^{-3i\omega t/2}\right]$, $|\Psi|^2 = \tfrac{1}{25}\left[9\psi_0^2 + 16\psi_1^2 + 24\psi_0\psi_1\cos\omega t\right]$: frequency $\omega$. With $\psi_2$: $2\omega$.`,
              sol: md`
                **How to see it.** Orthonormal states: normalization is a sum of squares. The density oscillates at the energy difference over $\hbar$, and adjacent oscillator levels differ by exactly $\hbar\omega$.

                **(a)** $|A|^2(9 + 16) = 1$, $A = \tfrac15$ (a 3-4-5 triangle).

                **(b)** Each stationary state carries its own phase, $E_0 = \tfrac12\hbar\omega$, $E_1 = \tfrac32\hbar\omega$:
                $$\Psi(x, t) = \frac15\left[3\psi_0e^{-i\omega t/2} + 4\psi_1e^{-3i\omega t/2}\right] = \frac{e^{-i\omega t/2}}{5}\left[3\psi_0 + 4\psi_1e^{-i\omega t}\right]$$
                The $\psi_n$ are real, so the cross term is $2\cdot\tfrac{12}{25}\psi_0\psi_1\cos\omega t$:
                $$|\Psi|^2 = \frac{1}{25}\left[9\psi_0^2 + 16\psi_1^2 + 24\psi_0\psi_1\cos\omega t\right]$$
                $\psi_0\psi_1$ is **odd**: the density sloshes from one side to the other at $\omega$, the classical frequency. With $\psi_2$ the cross term $\psi_0\psi_2\cos2\omega t$ is **even**: the density would breathe (get narrower and wider) at $2\omega$, with $\langle x\rangle = 0$ throughout.
              `,
            },
            {
              q: md`**1 (c).** Find $\langle x\rangle$ and $\langle p\rangle$. Check that Ehrenfest's theorem holds.`,
              ans: md`$\langle x\rangle = \tfrac{24}{25}\sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t$, $\langle p\rangle = -\tfrac{24}{25}\sqrt{\tfrac{\hbar m\omega}{2}}\sin\omega t$. $m\,\tfrac{d\langle x\rangle}{dt} = \langle p\rangle$ ✓, $\tfrac{d\langle p\rangle}{dt} = -m\omega^2\langle x\rangle$ ✓.`,
              sol: md`
                **How to see it.** $\langle\hat a_-\rangle = \sum_n c_n^*c_{n+1}\sqrt{n+1}$: only the $(0, 1)$ pair contributes, $\langle\hat a_+\rangle$ is its conjugate.

                With $c_0 = \tfrac35e^{-i\omega t/2}$, $c_1 = \tfrac45e^{-3i\omega t/2}$: $\langle\hat a_-\rangle = c_0^*c_1 = \tfrac{12}{25}e^{-i\omega t}$, $\langle\hat a_+\rangle = \tfrac{12}{25}e^{i\omega t}$.
                $$\langle x\rangle = \sqrt{\frac{\hbar}{2m\omega}}\left(\langle\hat a_+\rangle + \langle\hat a_-\rangle\right) = \frac{24}{25}\sqrt{\frac{\hbar}{2m\omega}}\cos\omega t$$
                $$\langle p\rangle = i\sqrt{\frac{\hbar m\omega}{2}}\left(\langle\hat a_+\rangle - \langle\hat a_-\rangle\right) = i\sqrt{\frac{\hbar m\omega}{2}}\cdot\frac{12}{25}\cdot2i\sin\omega t = -\frac{24}{25}\sqrt{\frac{\hbar m\omega}{2}}\sin\omega t$$
                **Ehrenfest.** $m\tfrac{d\langle x\rangle}{dt} = -\tfrac{24}{25}m\omega\sqrt{\tfrac{\hbar}{2m\omega}}\sin\omega t = -\tfrac{24}{25}\sqrt{\tfrac{\hbar m\omega}{2}}\sin\omega t = \langle p\rangle$ ✓. $\tfrac{d\langle p\rangle}{dt} = -\tfrac{24}{25}\omega\sqrt{\tfrac{\hbar m\omega}{2}}\cos\omega t$ and $-\langle V'\rangle = -m\omega^2\langle x\rangle = -\tfrac{24}{25}m\omega^2\sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t$: equal ✓. (For the oscillator $\langle V'\rangle = m\omega^2\langle x\rangle$ exactly, so this had to work.)
              `,
            },
            {
              q: md`**1 (d).** Sketch $(\langle x\rangle, \langle p\rangle)$ in phase space over one period. What shape, which direction, what period? Compare the size of the orbit with the width $\sigma_x$ of the ground state. Would you call this motion "classical"?`,
              ans: md`An ellipse (a circle in units $\sqrt{\hbar/2m\omega}$, $\sqrt{\hbar m\omega/2}$) of radius $\tfrac{24}{25}$, clockwise, period $2\pi/\omega$. The ground-state width is 1 in the same units: the orbit is smaller than one width. Not classical.`,
              sol: md`
                **How to see it.** $\langle x\rangle \propto \cos\omega t$ and $\langle p\rangle \propto -\sin\omega t$: the classical oscillator's ellipse, traversed the classical way. The question is only whether the blob of uncertainty is small compared with the orbit.

                [[fig:orbit]]

                - **Shape:** $\left(\tfrac{\langle x\rangle}{X}\right)^2 + \left(\tfrac{\langle p\rangle}{P}\right)^2 = 1$ with $X = \tfrac{24}{25}\sqrt{\tfrac{\hbar}{2m\omega}}$, $P = m\omega X$: an ellipse.
                - **Direction:** start at $(X, 0)$; then $\langle p\rangle < 0$, so it moves down: **clockwise** (with $p$ up). Every oscillator orbit runs clockwise: positive momentum means moving right.
                - **Period:** $2\pi/\omega$, the classical period, for any amplitude.
                - **Size:** $X = 0.96\sqrt{\hbar/2m\omega}$, while the ground-state width is $\sigma_x = \sqrt{\hbar/2m\omega}$ (dashed circle). In this state itself, $\sigma_x^2 = \tfrac{\hbar}{2m\omega}\left(\tfrac{57}{25} - 0.92\cos^2\omega t\right)$, between $1.17$ and $1.51$ in those units: **the spread is bigger than the orbit.**

                **Classical?** No. The **averages** move exactly classically (Ehrenfest, with linear force), but a single position measurement is scattered over a region wider than the motion itself. "The expectation values behave classically" and "the system is classical" are different claims (Discussion 6). A classical-looking state needs an orbit much larger than the width: many levels with locked phases, a coherent state (Problem 3).
              `,
              figs: { orbit: { svg: orbitFig, cap: 'Solid: the orbit of $(\\langle x\\rangle, \\langle p\\rangle)$, radius $\\tfrac{24}{25}$ in units $\\sqrt{\\hbar/2m\\omega}$ and $\\sqrt{\\hbar m\\omega/2}$, clockwise. Dashed: a ground-state width (radius 1) centered on the starting point.' } },
            },
            {
              q: md`**1 (e).** If you measured the energy of this particle, what values might you get, with what probabilities?`,
              ans: md`$\tfrac12\hbar\omega$ with $\tfrac{9}{25}$, $\tfrac32\hbar\omega$ with $\tfrac{16}{25}$; $\langle H\rangle = \tfrac{57}{50}\hbar\omega = 1.14\hbar\omega$, the same at every time.`,
              sol: md`$P(E_n) = |c_n|^2$; the phases do not touch them, so the answer is the same at every $t$. $\langle H\rangle = \tfrac{9}{25}\cdot\tfrac12 + \tfrac{16}{25}\cdot\tfrac32 = \tfrac{57}{50}$ in units of $\hbar\omega$. No measurement ever gives $1.14\hbar\omega$.`,
            },
            {
              q: md`**2. Matrix elements.** Find $\bra n\hat x\ket{n'}$ and $\bra n\hat p\ket{n'}$ in the oscillator basis. Construct the (infinite) matrices $X$ and $P$. Show $\tfrac{1}{2m}P^2 + \tfrac{m\omega^2}{2}X^2 = H$ is diagonal. Are the diagonal elements what you expect?`,
              ans: md`$\bra n\hat x\ket{n'} = \sqrt{\tfrac{\hbar}{2m\omega}}\left(\sqrt{n'}\,\delta_{n,n'-1} + \sqrt{n'+1}\,\delta_{n,n'+1}\right)$, $\bra n\hat p\ket{n'} = i\sqrt{\tfrac{\hbar m\omega}{2}}\left(\sqrt{n'+1}\,\delta_{n,n'+1} - \sqrt{n'}\,\delta_{n,n'-1}\right)$. $H_{nn} = \hbar\omega(n + \tfrac12)$, all off-diagonal entries cancel.`,
              sol: md`
                **How to see it.** $\hat a_+\ket{n'}$ lands on $\ket{n'+1}$ (just below the diagonal), $\hat a_-\ket{n'}$ on $\ket{n'-1}$ (just above). So $X$ and $P$ are tridiagonal with zero diagonal.

                $\hat x\ket{n'} = \sqrt{\tfrac{\hbar}{2m\omega}}\left(\sqrt{n'+1}\ket{n'+1} + \sqrt{n'}\ket{n'-1}\right)$; take $\bra n$. Rows $n = 0, 1, 2, \ldots$, columns $n'$:
                $$X = \sqrt{\frac{\hbar}{2m\omega}}\begin{pmatrix}0 & 1 & 0 & 0 & \cdots\\ 1 & 0 & \sqrt2 & 0 & \cdots\\ 0 & \sqrt2 & 0 & \sqrt3 & \cdots\\ 0 & 0 & \sqrt3 & 0 & \cdots\\ \vdots & & & & \ddots\end{pmatrix},\qquad P = i\sqrt{\frac{\hbar m\omega}{2}}\begin{pmatrix}0 & -1 & 0 & 0 & \cdots\\ 1 & 0 & -\sqrt2 & 0 & \cdots\\ 0 & \sqrt2 & 0 & -\sqrt3 & \cdots\\ 0 & 0 & \sqrt3 & 0 & \cdots\\ \vdots & & & & \ddots\end{pmatrix}$$
                $X$ is real symmetric, $P$ is imaginary antisymmetric: both Hermitian.

                **The squares**, via operators: $\hat x^2 = \tfrac{\hbar}{2m\omega}\left(\hat a_+^2 + \hat a_-^2 + \hat a_+\hat a_- + \hat a_-\hat a_+\right)$ and $\hat p^2 = -\tfrac{\hbar m\omega}{2}\left(\hat a_+^2 + \hat a_-^2 - \hat a_+\hat a_- - \hat a_-\hat a_+\right)$. Then
                $$\frac{\hat p^2}{2m} + \frac{m\omega^2}{2}\hat x^2 = \frac{\hbar\omega}{4}\left[-\left(\hat a_+^2 + \hat a_-^2\right) + \left(\hat a_+^2 + \hat a_-^2\right) + 2\left(\hat a_+\hat a_- + \hat a_-\hat a_+\right)\right] = \frac{\hbar\omega}{2}(2\hat n + 1)$$
                The $n \to n \pm 2$ entries of $P^2$ and $X^2$ are equal and opposite and cancel; the diagonal is $(P^2)_{nn} = \tfrac{\hbar m\omega}{2}(2n + 1)$ and $(X^2)_{nn} = \tfrac{\hbar}{2m\omega}(2n + 1)$, giving $H_{nn} = \hbar\omega(n + \tfrac12)$. **Yes, expected:** in its own eigenbasis $\hat H$ is diagonal with the energies on the diagonal. Kinetic and potential each supply half: $\langle T\rangle = \langle V\rangle$ in every $\ket n$.

                !!mistake Truncating
                  If you cut $X$ and $P$ off at $N\times N$ and square the truncated matrices, the **last** diagonal entry comes out wrong (the missing $\sqrt N$ link). The identity holds for the infinite matrices. The notebook's version of this: a finite matrix can never satisfy $[X, P] = i\hbar$, because the trace of a commutator is 0 and the trace of $i\hbar\,\mathbb 1$ is not.
              `,
            },
            {
              q: md`**3 (a), (b). Coherent states.** $\hat a_-\ket\alpha = \alpha\ket\alpha$, $\alpha \in \mathbb C$. (a) Find $\langle x\rangle$, $\langle x^2\rangle$, $\langle p\rangle$, $\langle p^2\rangle$ in $\ket\alpha$ (don't assume $\alpha$ real). (b) Find $\sigma_x$, $\sigma_p$ and show $\sigma_x\sigma_p = \hbar/2$.`,
              ans: md`$\langle x\rangle = \sqrt{\tfrac{2\hbar}{m\omega}}\,\text{Re}\,\alpha$, $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}\left[(\alpha + \alpha^*)^2 + 1\right]$, $\langle p\rangle = \sqrt{2\hbar m\omega}\,\text{Im}\,\alpha$, $\langle p^2\rangle = \tfrac{\hbar m\omega}{2}\left[1 - (\alpha - \alpha^*)^2\right]$. $\sigma_x = \sqrt{\tfrac{\hbar}{2m\omega}}$, $\sigma_p = \sqrt{\tfrac{\hbar m\omega}{2}}$.`,
              sol: md`
                **How to see it.** $\hat a_-$ acts on the ket to the right and gives $\alpha$; $\hat a_+ = \hat a_-^\dagger$ acts on the bra to the left and gives $\alpha^*$. Put every product in **normal order** ($\hat a_+$'s left of $\hat a_-$'s) using $\hat a_-\hat a_+ = \hat a_+\hat a_- + 1$, then replace.

                $\bra\alpha\hat a_-\ket\alpha = \alpha$, $\bra\alpha\hat a_+\ket\alpha = \alpha^*$, $\bra\alpha\hat a_+\hat a_-\ket\alpha = |\alpha|^2$, $\bra\alpha\hat a_-\hat a_+\ket\alpha = |\alpha|^2 + 1$, $\bra\alpha\hat a_\pm^2\ket\alpha = \alpha^{*2}$, $\alpha^2$.

                **(a)**
                $$\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}(\alpha + \alpha^*) = \sqrt{\tfrac{2\hbar}{m\omega}}\,\text{Re}\,\alpha,\qquad \langle x^2\rangle = \tfrac{\hbar}{2m\omega}\left(\alpha^{*2} + \alpha^2 + 2|\alpha|^2 + 1\right) = \tfrac{\hbar}{2m\omega}\left[(\alpha + \alpha^*)^2 + 1\right]$$
                $$\langle p\rangle = i\sqrt{\tfrac{\hbar m\omega}{2}}(\alpha^* - \alpha) = \sqrt{2\hbar m\omega}\,\text{Im}\,\alpha,\qquad \langle p^2\rangle = -\tfrac{\hbar m\omega}{2}\left(\alpha^{*2} + \alpha^2 - 2|\alpha|^2 - 1\right) = \tfrac{\hbar m\omega}{2}\left[1 - (\alpha - \alpha^*)^2\right]$$
                **(b)** $\sigma_x^2 = \langle x^2\rangle - \langle x\rangle^2 = \tfrac{\hbar}{2m\omega}$; $(\alpha - \alpha^*)^2 = -4(\text{Im}\,\alpha)^2$, so $\sigma_p^2 = \tfrac{\hbar m\omega}{2}$. Product $\hbar/2$. **Exactly the ground-state widths, whatever $\alpha$ is:** a coherent state is the ground-state Gaussian, displaced in phase space to $(\langle x\rangle, \langle p\rangle)$.
              `,
            },
            {
              q: md`**3 (c), (d).** (c) Show the expansion coefficients in $\ket\alpha = \sum c_n\ket n$ are $c_n = \dfrac{\alpha^n}{\sqrt{n!}}c_0$. (d) Find $c_0$ by normalizing.`,
              ans: md`(c) $c_{n+1}\sqrt{n+1} = \alpha c_n$. (d) $c_0 = e^{-|\alpha|^2/2}$ (up to a phase).`,
              sol: md`
                **How to see it.** Apply $\hat a_-$ to the sum and match coefficients of each $\ket n$: a one-step recursion.

                **(c)** $\hat a_-\sum_nc_n\ket n = \sum_nc_n\sqrt n\ket{n-1} = \sum_nc_{n+1}\sqrt{n+1}\ket n$. Setting this equal to $\alpha\sum c_n\ket n$: $c_{n+1} = \tfrac{\alpha}{\sqrt{n+1}}c_n$, so $c_n = \tfrac{\alpha^n}{\sqrt{n!}}c_0$. (Or: $c_n = \braket{n|\alpha} = \tfrac{1}{\sqrt{n!}}\bra0\hat a_-^n\ket\alpha = \tfrac{\alpha^n}{\sqrt{n!}}\braket{0|\alpha}$, as in Lecture 11.)

                **(d)** $1 = \sum|c_n|^2 = |c_0|^2\sum_n\tfrac{|\alpha|^{2n}}{n!} = |c_0|^2e^{|\alpha|^2}$, so $c_0 = e^{-|\alpha|^2/2}$:
                $$\ket\alpha = e^{-|\alpha|^2/2}\sum_{n=0}^\infty\frac{\alpha^n}{\sqrt{n!}}\ket n,\qquad P(n) = e^{-|\alpha|^2}\frac{|\alpha|^{2n}}{n!}$$
                a **Poisson distribution** with mean $|\alpha|^2$.
              `,
            },
            {
              q: md`**3 (e), (f).** (e) Put in $\ket n \to e^{-iE_nt/\hbar}\ket n$ and show $\ket{\alpha(t)}$ is still an eigenstate of $\hat a_-$, with $\alpha(t) = e^{-i\omega t}\alpha$. (f) With $\alpha = C\sqrt{\tfrac{m\omega}{2\hbar}}e^{i\phi}$ ($C$, $\phi$ real), find $\langle x\rangle(t)$ and $\sigma_x(t)$. Sketch the orbit of $(\langle x\rangle, \langle p\rangle)$ with the uncertainty ellipse at a few times.`,
              ans: md`(e) $\ket{\alpha(t)} = e^{-i\omega t/2}\ket{\alpha e^{-i\omega t}}$. (f) $\langle x\rangle = C\cos(\omega t - \phi)$, $\langle p\rangle = -m\omega C\sin(\omega t - \phi)$, $\sigma_x = \sqrt{\hbar/2m\omega}$ constant: a fixed-size ellipse riding clockwise around the classical orbit.`,
              sol: md`
                **How to see it.** $e^{-i(n + \frac12)\omega t} = e^{-i\omega t/2}\left(e^{-i\omega t}\right)^n$: the $n$-dependent phase can be absorbed into $\alpha^n$. Rotating $\alpha$ in the complex plane **is** the motion.

                **(e)**
                $$\ket{\alpha(t)} = e^{-|\alpha|^2/2}\sum_n\frac{\alpha^n}{\sqrt{n!}}e^{-i(n + \frac12)\omega t}\ket n = e^{-i\omega t/2}\,e^{-|\alpha|^2/2}\sum_n\frac{(\alpha e^{-i\omega t})^n}{\sqrt{n!}}\ket n = e^{-i\omega t/2}\ket{\alpha e^{-i\omega t}}$$
                ($|\alpha e^{-i\omega t}| = |\alpha|$, so the prefactor is right.) The global phase is invisible, so $\hat a_-\ket{\alpha(t)} = \alpha e^{-i\omega t}\ket{\alpha(t)}$: **a coherent state stays coherent** and keeps minimizing $\sigma_x\sigma_p$.

                **(f)** $\text{Re}\left[\alpha e^{-i\omega t}\right] = C\sqrt{\tfrac{m\omega}{2\hbar}}\cos(\omega t - \phi)$, so
                $$\langle x\rangle(t) = \sqrt{\tfrac{2\hbar}{m\omega}}\,C\sqrt{\tfrac{m\omega}{2\hbar}}\cos(\omega t - \phi) = C\cos(\omega t - \phi),\qquad \langle p\rangle = -m\omega C\sin(\omega t - \phi)$$
                and $\sigma_x = \sqrt{\hbar/2m\omega}$, $\sigma_p = \sqrt{\hbar m\omega/2}$ at all times (part (b) holds for any $\alpha$). $C$ is the classical amplitude and $\phi$ the classical phase.

                **The sketch:** the classical ellipse $(\langle x\rangle/C)^2 + (\langle p\rangle/m\omega C)^2 = 1$, run clockwise with period $2\pi/\omega$; at each time a small uncertainty ellipse with semi-axes $\sigma_x$, $\sigma_p$, **the same size and orientation** at every time, centered on the orbit (the left panel in 3(g)). It neither spreads nor rotates.
              `,
            },
            {
              q: md`**3 (g). Coherent vs stationary.** Compare $\ket\alpha$ with $|\alpha|^2 = N$ to $\ket N$. Show both have $\langle H\rangle = \hbar\omega(N + \tfrac12)$. Energy outcomes and probabilities; $\sigma_H$ and $\sigma_H/\langle H\rangle$ for large $N$. $\langle x\rangle(t)$ and $\sigma_x$ for $\ket N$, compared with (f). Sketch $\ket N$ in phase space next to the coherent state; what classical picture is it? Why does $\ket\alpha$ move while $\ket N$ doesn't, and what is the price in $\sigma_H$?`,
              ans: md`Both $\langle H\rangle = \hbar\omega(N + \tfrac12)$. $\ket\alpha$: outcomes $\hbar\omega(n + \tfrac12)$ with Poisson $P(n)$, $\sigma_H = \hbar\omega\sqrt N$, $\sigma_H/\langle H\rangle \approx 1/\sqrt N$. $\ket N$: $E_N$ certain, $\sigma_H = 0$, $\langle x\rangle = 0$, $\sigma_x = \sqrt{(N + \frac12)\hbar/m\omega}$ = the rms of a classical oscillator of energy $E_N$: an ensemble of classical oscillators with random phase.`,
              sol: md`
                **How to see it.** Motion of $\langle x\rangle$ is interference between neighboring levels. $\ket N$ has one level, so nothing to interfere; $\ket\alpha$ has many levels with locked phases. Locking the phase costs a spread in energy.

                **Energies.** $\bra\alpha\hat H\ket\alpha = \hbar\omega\left(\bra\alpha\hat a_+\hat a_-\ket\alpha + \tfrac12\right) = \hbar\omega(|\alpha|^2 + \tfrac12) = \hbar\omega(N + \tfrac12)$; $\ket N$ trivially.

                **Outcomes.** $\ket\alpha$: $E_n = \hbar\omega(n + \tfrac12)$ with $P(n) = e^{-N}N^n/n!$. $\langle\hat n^2\rangle = \bra\alpha\hat a_+(\hat a_+\hat a_- + 1)\hat a_-\ket\alpha = |\alpha|^4 + |\alpha|^2$, so $\sigma_n^2 = N$ and $\sigma_H = \hbar\omega\sqrt N$, $\dfrac{\sigma_H}{\langle H\rangle} \approx \dfrac{1}{\sqrt N} \to 0$: large in absolute terms, small in relative terms, like a classical energy. $\ket N$: $E_N$ with certainty, $\sigma_H = 0$.

                **Position.** For $\ket N$: $\langle x\rangle = 0$ at all times ($\hat x$ connects $N$ only to $N \pm 1$, which are absent). $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}(2N + 1)$, so $\sigma_x = \sqrt{(N + \tfrac12)\hbar/m\omega}$. A classical oscillator with energy $E_N$ has amplitude $x_N = \sqrt{(2N + 1)\hbar/m\omega}$ and time-averaged $\langle x^2\rangle_{\text{cl}} = x_N^2/2$: **identical.** Compare the coherent state: $\langle x\rangle$ swings with amplitude $C = \sqrt{2N\hbar/m\omega} \approx x_N$ while $\sigma_x = \sqrt{\hbar/2m\omega}$ stays tiny ($\sigma_x/C = 1/2\sqrt N$).

                [[fig:compare]]

                **Classical picture of $\ket N$:** a ring of radius $\approx x_N$ around the origin in phase space, uniform in angle: a classical oscillator whose energy you know exactly but whose **phase you know nothing about** (an ensemble of oscillators started at random times). Nothing moves because every phase is equally present.

                **Why.** $\langle x\rangle(t)$ is built from $c_n^*c_{n+1}e^{-i\omega t}$: it needs **adjacent levels populated with definite relative phases** (compare Problem 1). The price: a state with many levels has an energy spread, $\sigma_H = \hbar\omega\sqrt N$. Energy and phase trade off, the oscillator's version of $\Delta E\,\Delta t \gtrsim \hbar$.
              `,
              figs: { compare: compareFig },
            },
            {
              q: md`**3 (h).** Is the ground state $\ket0$ itself a coherent state? If so, with what eigenvalue?`,
              ans: md`Yes: $\hat a_-\ket0 = 0 = 0\cdot\ket0$, so $\alpha = 0$.`,
              sol: md`$\hat a_-\ket0 = 0$ is an eigenvalue equation with eigenvalue $0$. Check against (c): $c_n = 0^n/\sqrt{n!} = \delta_{n0}$. A coherent state is the ground state displaced to $(\langle x\rangle, \langle p\rangle)$; $\alpha = 0$ is no displacement. It sits at the origin of phase space and $\alpha(t) = 0$ forever.`,
            },
          ]),
          R(md`
            ### The computational part: what the notebook shows

            The Harmonic Oscillator notebook (units $\hbar = m = \omega = 1$) puts numbers on every claim above. What to take from it:

            - **Uncertainty.** The same state in position and momentum representation is one state, not two. Shapes like $e^{-\beta(x-4)^6}$ never reach $\Delta x\Delta p = \tfrac12$ however $\beta$ is tuned; Gaussians always do, and a numerical search for the minimum drifts toward a Gaussian. **Every** Gaussian $e^{-ax^2}$ saturates the bound ($\Delta x = 1/2\sqrt a$, $\Delta p = \sqrt a$), but only $a = \tfrac12$ has the oscillator's widths, and it has the lowest $\langle H\rangle = \tfrac{1}{8a} + \tfrac a2$, minimized at $a = \tfrac12$. So "minimum uncertainty" alone does not identify a coherent state.
            - **The spectrum.** The grid Hamiltonian gives $E_n = n + \tfrac12$, equally spaced (the square well's gaps grew like $2n + 1$). The grid's end points are not walls; they only matter once a state reaches them, near $n_{\text{edge}} \approx (h^2 - 1)/2$ for half-width $h$ (about 50 for $h = 10$).
            - **Motion.** Same $|c_n|^2$, different relative phase, different motion: $(\ket0 + \ket1)/\sqrt2$ sloshes at $\omega$, $(\ket0 + \ket2)/\sqrt2$ breathes at $2\omega$ with $\langle x\rangle = 0$. A global sign changes nothing. The means obey Ehrenfest exactly, but the distribution does not move rigidly unless the state is coherent; a squeezed Gaussian ($a \ne \tfrac12$) has $\langle x\rangle$ following the classical path while its width oscillates at $2\omega$.
            - **Ladder operators as matrices.** $\hat a_+\ket3 = 2\ket4$, $\hat a_-\ket5 = \sqrt5\ket4$, $\hat a_-\ket0 = 0$ (not a state), $\langle\hat a_+\hat a_-\rangle = n$; $X$ in the energy basis has entries only next to the diagonal, which is why $\langle x\rangle$ can oscillate only through adjacent levels. Raising a superposition changes the relative weights (factors $\sqrt{n+1}$ differ).
          `),
          Q(md`A finite $N\times N$ matrix version of $\hat x$ and $\hat p$ can never satisfy $[X, P] = i\hbar\,\mathbb 1$ exactly because…`, ['the trace of any commutator of finite matrices is 0, but the trace of iħ𝟙 is iħN', 'finite matrices cannot be Hermitian', 'the grid spacing is too large', 'P must be imaginary'], 0,
            [null, 'Finite Hermitian matrices are fine; X is real diagonal on a grid.', 'A finer grid does not help: the trace argument holds for every N.', 'Irrelevant to the trace.'],
            md`$\text{Tr}(XP) = \text{Tr}(PX)$. The canonical commutator needs infinite dimensions.`),
          Q(md`In the notebook, a Gaussian narrower than the ground state ($a = 1$) is released at $x_0 = 2$ in the oscillator. Which is right?`, [md`$\langle x\rangle$ follows the classical path, while $\Delta x$ oscillates at $2\omega$`, md`It stays the same shape, like a coherent state`, md`$\langle x\rangle$ oscillates at $2\omega$`, md`It spreads forever like a free packet`], 0,
            [null, md`Only $a = \tfrac12$ keeps its shape.`, md`Ehrenfest: $\langle x\rangle$ obeys the classical equation at frequency $\omega$ for **any** state.`, 'The oscillator refocuses it every half period.'],
            md`Means: Ehrenfest, exactly classical. Width: a squeezed state breathes, narrow in $x$ when wide in $p$ and vice versa, twice per period.`),
          R(md`
            **Where this shows up on the exam.** Problem 1 is Midterm 1's Problem 1 moved into the oscillator: normalize, $\Psi(x,t)$, the period, which way the density sloshes, energy outcomes, "is this classical?". Expect exactly that, plus "sketch the orbit in phase space and say which way it goes". Problem 2's selection rule ($\hat x$ connects $n \to n\pm1$) is the fastest way to answer "does $\langle x\rangle$ move?". Problem 3(g) is a ready-made explain-in-words part: why one state moves and the other doesn't, and what it costs.
          `),
          drill,
          P({
            title: 'A different superposition',
            q: md`$\Psi(x, 0) = A\left[\psi_1 + 2\psi_2\right]$ in the oscillator. Find $A$, $\langle H\rangle/\hbar\omega$, and the amplitude of $\langle x\rangle(t)$ in units of $\sqrt{\hbar/2m\omega}$.`,
            parts: [{ lbl: 'A', ans: 1 / Math.sqrt(5) }, { lbl: '\\langle H\\rangle/\\hbar\\omega', ans: 2.3 }, { lbl: '\\text{amplitude}', ans: 4 * Math.SQRT2 / 5 }],
            hints: [md`$\langle\hat a_-\rangle = c_1^*c_2\sqrt2$.`],
            sol: md`$A = 1/\sqrt5$. $\langle H\rangle = \tfrac15\cdot\tfrac32 + \tfrac45\cdot\tfrac52 = 2.3$. $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cdot2\cdot\tfrac{2}{5}\sqrt2\cos\omega t$: amplitude $\tfrac{4\sqrt2}{5} = 1.13$. Note the $\sqrt2$ from $\hat a_-\ket2 = \sqrt2\ket1$: higher pairs slosh harder for the same weights.`,
          }),
          P({
            title: 'Breathing',
            q: md`$\Psi = \tfrac{1}{\sqrt2}(\psi_0 + \psi_2)$ at $t = 0$. $\langle x\rangle = 0$ always. Find the maximum of $\langle x^2\rangle$ in units of $\hbar/2m\omega$, and the angular frequency of the breathing in units of $\omega$.`,
            parts: [{ lbl: '\\langle x^2\\rangle_{\\max}', ans: 3 + Math.SQRT2 }, { lbl: '\\Omega/\\omega', ans: 2 }],
            hints: [md`$\langle x^2\rangle = \tfrac{\hbar}{2m\omega}\left[\langle2\hat n + 1\rangle + \langle\hat a_+^2 + \hat a_-^2\rangle\right]$ and $\langle\hat a_-^2\rangle = c_0^*c_2\sqrt2\,e^{-2i\omega t}$.`],
            sol: md`$\langle2\hat n + 1\rangle = \tfrac12(1) + \tfrac12(5) = 3$; $\langle\hat a_+^2 + \hat a_-^2\rangle = \sqrt2\cos2\omega t$. So $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}(3 + \sqrt2\cos2\omega t)$: max $4.41$, breathing at $2\omega$.`,
          }),
          P({
            title: 'Two matrix elements',
            q: md`Find $\bra3\hat x^2\ket1$ in units of $\hbar/2m\omega$ and $\bra2\hat p^2\ket2$ in units of $\hbar m\omega/2$.`,
            parts: [{ lbl: '\\langle3|x^2|1\\rangle', ans: Math.sqrt(6) }, { lbl: '\\langle2|p^2|2\\rangle', ans: 5 }],
            hints: [md`Only $\hat a_+^2$ takes $\ket1$ to $\ket3$. For the diagonal, $\langle\hat a_+\hat a_- + \hat a_-\hat a_+\rangle = 2n + 1$.`],
            sol: md`$\hat a_+^2\ket1 = \sqrt2\sqrt3\ket3$: $\sqrt6 = 2.45$. $\bra2\hat p^2\ket2 = \tfrac{\hbar m\omega}{2}(2\cdot2 + 1) = 5$ units.`,
          }),
          P({
            title: 'Poisson numbers',
            q: md`A coherent state has $\alpha = 2$. Find $\langle n\rangle$, $P(n = 4)$, and $\sigma_H/\hbar\omega$.`,
            parts: [{ lbl: '\\langle n\\rangle', ans: 4 }, { lbl: 'P(4)', ans: Math.exp(-4) * 256 / 24 }, { lbl: '\\sigma_H/\\hbar\\omega', ans: 2 }],
            hints: [md`$P(n) = e^{-|\alpha|^2}|\alpha|^{2n}/n!$.`],
            sol: md`$\langle n\rangle = |\alpha|^2 = 4$; $P(4) = e^{-4}4^4/4! = 0.195$ (the most likely value, tied with $n = 3$); $\sigma_H = \hbar\omega|\alpha| = 2\hbar\omega$.`,
          }),
          P({
            title: 'Where is it a quarter period later?',
            q: md`A coherent state has $\alpha = C\sqrt{\tfrac{m\omega}{2\hbar}}e^{i\phi}$. Find $\langle x\rangle$ at $t = \tfrac{\pi}{2\omega}$, and $\langle p\rangle$ at $t = 0$.`,
            parts: [
              { lbl: '\\langle x\\rangle(\\tfrac{\\pi}{2\\omega})', expr: 'C*sin(phi)', vars: { C: [0.5, 2], phi: [0.2, 1.3] } },
              { lbl: '\\langle p\\rangle(0)', expr: 'm*omega*C*sin(phi)', vars: { C: [0.5, 2], phi: [0.2, 1.3], m: [0.5, 2], omega: [0.5, 2] } },
            ],
            hints: [md`$\langle x\rangle = C\cos(\omega t - \phi)$, $\langle p\rangle = -m\omega C\sin(\omega t - \phi)$.`],
            sol: md`$C\cos(\tfrac\pi2 - \phi) = C\sin\phi$. $\langle p\rangle(0) = -m\omega C\sin(-\phi) = m\omega C\sin\phi$: a positive $\text{Im}\,\alpha$ means moving right.`,
          }),
          Q(md`$\ket{N = 25}$ and a coherent state with $|\alpha|^2 = 25$. Which statement is right?`, [md`Both have $\langle H\rangle = 25.5\hbar\omega$; only the coherent state has $\langle x\rangle$ moving, and it has $\sigma_H = 5\hbar\omega$`, md`Both have $\sigma_H = 0$`, md`The coherent state has the larger $\sigma_x$`, md`$\ket{25}$ has $\langle x\rangle$ oscillating with amplitude $x_{25}$`], 0,
            [null, md`The coherent state has a Poisson spread of $n$: $\sigma_H = \hbar\omega\sqrt{25}$.`, md`$\ket N$ has $\sigma_x = \sqrt{25.5\,\hbar/m\omega}$, the coherent state only $\sqrt{\hbar/2m\omega}$.`, md`$\langle x\rangle = 0$ in any stationary state.`],
            md`Same mean energy. Moving costs an energy spread; standing still (no phase) gives a ring-shaped, spread-out distribution.`),
        ],
      },
      // ------------------------------------------------------------------ HW 7
      {
        id: 'hw7', title: 'Homework 7: angular momentum ladders, commutators, torque, the top of the ladder',
        steps: [
          R(md`
            **Trains:** the algebra of $\hat{\mathbf L}$ (${T(18, 't18-Lalgebra')}), spherical harmonics from the ladder (${T(19, 't19-Ylm')}), the rotational Ehrenfest theorem (${T(11, 't11-ehrenfest')}), why central potentials conserve $\hat{\mathbf L}$ (${T(17, 't17-3d')}).

            **The toolkit:**
            1. $[\hat r_i, \hat p_j] = i\hbar\delta_{ij}$, everything else commutes; expand products with $[\hat A\hat B, \hat C] = \hat A[\hat B, \hat C] + [\hat A, \hat C]\hat B$.
            2. $\hat L_\pm = \hat L_x \pm i\hat L_y$ are each other's adjoints, and $\hat L_\mp\hat L_\pm = \hat L^2 - \hat L_z^2 \mp \hbar\hat L_z$ turns any norm into a number.
            3. In angles: $\hat L_z = -i\hbar\partial_\phi$ (eigenfunctions $e^{im\phi}$), and the ladder stops where its coefficient vanishes.
          `),
          paper('PHYS 486 · Homework 7', 'Due 10/28', [
            {
              q: md`**1 (a), (b). Normalizing the ladder.** $\hat L_+f_\ell^m = A_\ell^mf_\ell^{m+1}$, $\hat L_-f_\ell^m = B_\ell^mf_\ell^{m-1}$. (a) Show $\hat L_\mp$ is the Hermitian conjugate of $\hat L_\pm$ (you may assume $\hat L_x$, $\hat L_y$ Hermitian). (b) Show $\hat L_\mp\hat L_\pm = \hat L^2 - \hat L_z^2 \mp \hbar\hat L_z$.`,
              ans: md`(a) $(\hat L_x \pm i\hat L_y)^\dagger = \hat L_x \mp i\hat L_y$. (b) $(\hat L_x \mp i\hat L_y)(\hat L_x \pm i\hat L_y) = \hat L_x^2 + \hat L_y^2 \pm i[\hat L_x, \hat L_y] = \hat L^2 - \hat L_z^2 \mp \hbar\hat L_z$.`,
              sol: md`
                **How to see it.** The dagger conjugates numbers and leaves Hermitian operators alone, exactly like $(a + ib)^* = a - ib$. The product is "$|z|^2 = a^2 + b^2$" plus a correction because $\hat L_x$, $\hat L_y$ don't commute.

                **(a)** $\hat L_\pm^\dagger = \hat L_x^\dagger + (\pm i)^*\hat L_y^\dagger = \hat L_x \mp i\hat L_y = \hat L_\mp$. So $\hat L_\pm$ are **not** Hermitian (not observables), just as $\hat a_\pm$ aren't.

                **(b)**
                $$\hat L_\mp\hat L_\pm = \hat L_x^2 + \hat L_y^2 \pm i\left(\hat L_x\hat L_y - \hat L_y\hat L_x\right) = \hat L_x^2 + \hat L_y^2 \pm i(i\hbar\hat L_z) = \hat L^2 - \hat L_z^2 \mp \hbar\hat L_z$$
                (The cross terms: $(\mp i\hat L_y)\hat L_x + \hat L_x(\pm i\hat L_y) = \pm i[\hat L_x, \hat L_y]$, and $(\mp i)(\pm i) = 1$ gives $+\hat L_y^2$.)
              `,
            },
            {
              q: md`**1 (c), (d).** (c) Find $A_\ell^m$ and $B_\ell^m$ for normalized eigenfunctions. Hint: compute $\braket{\hat L_\pm f_\ell^m|\hat L_\pm f_\ell^m}$ two ways. (d) What happens at the top and bottom of the ladder ($\hat L_+f_\ell^\ell$, $\hat L_-f_\ell^{-\ell}$)?`,
              ans: md`$A_\ell^m = \hbar\sqrt{\ell(\ell+1) - m(m+1)}$, $B_\ell^m = \hbar\sqrt{\ell(\ell+1) - m(m-1)}$ (phase chosen real positive). Both give 0 at the ends: $\hat L_+f_\ell^\ell = 0$, $\hat L_-f_\ell^{-\ell} = 0$.`,
              sol: md`
                **How to see it.** The squared length of $\hat L_+f$ is a number you can get from the eigenvalues alone, by moving one $\hat L_+$ across as $\hat L_-$ and using (b). Same move as $\|\hat a_+\ket n\|^2 = n + 1$.

                **(c)** First way: $\braket{\hat L_+f_\ell^m|\hat L_+f_\ell^m} = |A_\ell^m|^2\braket{f_\ell^{m+1}|f_\ell^{m+1}} = |A_\ell^m|^2$. Second way, with (a) and (b):
                $$\braket{\hat L_+f|\hat L_+f} = \braket{f|\hat L_-\hat L_+f} = \braket{f|(\hat L^2 - \hat L_z^2 - \hbar\hat L_z)f} = \hbar^2\left[\ell(\ell+1) - m^2 - m\right]$$
                So $A_\ell^m = \hbar\sqrt{\ell(\ell+1) - m(m+1)} = \hbar\sqrt{(\ell - m)(\ell + m + 1)}$. Likewise $\braket{\hat L_-f|\hat L_-f} = \braket{f|\hat L_+\hat L_-f} = \hbar^2[\ell(\ell+1) - m^2 + m]$, so $B_\ell^m = \hbar\sqrt{\ell(\ell+1) - m(m-1)} = \hbar\sqrt{(\ell + m)(\ell - m + 1)}$. (Only $|A|$ is fixed; the real positive choice is the usual convention.)

                **(d)** $A_\ell^\ell = \hbar\sqrt{\ell(\ell+1) - \ell(\ell+1)} = 0$ and $B_\ell^{-\ell} = \hbar\sqrt{\ell(\ell+1) - \ell(\ell+1)} = 0$: the ladder **stops**. It has to: a norm squared $\hbar^2[\ell(\ell+1) - m(m+1)]$ would turn negative if you could step past $m = \ell$. This is why $m$ runs from $-\ell$ to $\ell$ in integer steps, $2\ell + 1$ values.
              `,
            },
            {
              q: md`**2 (a). Commutators with $\hat L_z$.** From $[\hat r_i, \hat p_j] = i\hbar\delta_{ij}$, show $[\hat L_z, \hat x] = i\hbar\hat y$, $[\hat L_z, \hat y] = -i\hbar\hat x$, $[\hat L_z, \hat z] = 0$, $[\hat L_z, \hat p_x] = i\hbar\hat p_y$, $[\hat L_z, \hat p_y] = -i\hbar\hat p_x$, $[\hat L_z, \hat p_z] = 0$.`,
              ans: md`Write $\hat L_z = \hat x\hat p_y - \hat y\hat p_x$; in each commutator only one factor fails to commute.`,
              sol: md`
                **How to see it.** $\hat L_z$ generates rotations about $z$. Rotating rotates the $x$–$y$ components into each other and leaves $z$ alone, for positions and momenta alike: $[\hat L_z, \vec V] = i\hbar\,\hat z\times\vec V$ for any vector.

                - $[\hat L_z, \hat x] = [\hat x\hat p_y - \hat y\hat p_x, \hat x] = -\hat y[\hat p_x, \hat x] = -\hat y(-i\hbar) = i\hbar\hat y$.
                - $[\hat L_z, \hat y] = [\hat x\hat p_y, \hat y] = \hat x[\hat p_y, \hat y] = -i\hbar\hat x$.
                - $[\hat L_z, \hat z] = 0$: no $\hat p_z$ in $\hat L_z$.
                - $[\hat L_z, \hat p_x] = [\hat x\hat p_y, \hat p_x] = [\hat x, \hat p_x]\hat p_y = i\hbar\hat p_y$.
                - $[\hat L_z, \hat p_y] = -[\hat y\hat p_x, \hat p_y] = -[\hat y, \hat p_y]\hat p_x = -i\hbar\hat p_x$.
                - $[\hat L_z, \hat p_z] = 0$: no $\hat z$ in $\hat L_z$.
              `,
            },
            {
              q: md`**2 (b), (c).** (b) Use (a) to obtain $[\hat L_z, \hat L_x] = i\hbar\hat L_y$. (c) Find $[\hat L_z, \hat r^2]$ and $[\hat L_z, \hat p^2]$.`,
              ans: md`(b) $[\hat L_z, \hat y\hat p_z - \hat z\hat p_y] = -i\hbar\hat x\hat p_z + i\hbar\hat z\hat p_x = i\hbar\hat L_y$. (c) Both 0.`,
              sol: md`
                **How to see it.** (b) is (a) applied twice with the product rule. (c) is the statement "lengths don't change under rotation", for both $\vec r$ and $\vec p$.

                **(b)** $\hat L_x = \hat y\hat p_z - \hat z\hat p_y$:
                $$[\hat L_z, \hat L_x] = [\hat L_z, \hat y]\hat p_z + \hat y[\hat L_z, \hat p_z] - [\hat L_z, \hat z]\hat p_y - \hat z[\hat L_z, \hat p_y] = -i\hbar\hat x\hat p_z + 0 - 0 + i\hbar\hat z\hat p_x = i\hbar(\hat z\hat p_x - \hat x\hat p_z) = i\hbar\hat L_y$$
                **(c)** $[\hat L_z, \hat x^2] = \hat x[\hat L_z, \hat x] + [\hat L_z, \hat x]\hat x = i\hbar(\hat x\hat y + \hat y\hat x)$ and $[\hat L_z, \hat y^2] = -i\hbar(\hat y\hat x + \hat x\hat y)$; $[\hat L_z, \hat z^2] = 0$. Sum: $[\hat L_z, \hat r^2] = 0$. Identically, $[\hat L_z, \hat p_x^2] = i\hbar(\hat p_x\hat p_y + \hat p_y\hat p_x)$ cancels $[\hat L_z, \hat p_y^2]$: $[\hat L_z, \hat p^2] = 0$.
              `,
            },
            {
              q: md`**2 (d).** Show $\hat H = \hat p^2/2m + V$ commutes with all three components of $\hat{\mathbf L}$ if $V$ depends only on $r$. (So $\hat H$, $\hat L^2$, $\hat L_z$ are mutually compatible.)`,
              ans: md`$[\hat L_z, \hat p^2] = 0$ by (c); $[\hat L_z, V(r)] = 0$ because $\hat L_z$ commutes with $\hat r^2$, hence with any function of it (or: $\hat L_z = -i\hbar\partial_\phi$ and $V(r)$ has no $\phi$). Cyclic relabeling gives $\hat L_x$, $\hat L_y$.`,
              sol: md`
                **How to see it.** A central potential looks the same after any rotation, and $\hat{\mathbf L}$ generates rotations. Symmetry ⇒ commuting ⇒ conservation.

                Kinetic: $[\hat L_z, \hat p^2] = 0$ from (c). Potential: $\hat L_z$ commutes with $\hat r^2$, so with every power of $\hat r^2$ and therefore with any function $V(\sqrt{\hat r^2})$ (on a simultaneous eigenbasis, $V$ is just a function of the eigenvalue). Quicker in spherical coordinates: $\hat L_z = -i\hbar\,\partial/\partial\phi$ and $V(r)$ has no $\phi$-dependence, so $\hat L_z(Vg) = V\hat L_zg$. Nothing in the argument singles out $z$: relabel $x \to y \to z \to x$ for $\hat L_x$, $\hat L_y$. Then $[\hat H, \hat L^2] = \sum_i\left(\hat L_i[\hat H, \hat L_i] + [\hat H, \hat L_i]\hat L_i\right) = 0$ too.

                **Consequence.** $\hat H$, $\hat L^2$, $\hat L_z$ share eigenstates: $\psi_{n\ell m} = R(r)Y_\ell^m(\theta, \phi)$. ($\hat L_x$ also commutes with $\hat H$, but not with $\hat L_z$, so you pick one component.)
              `,
            },
            {
              q: md`**3. Torque and conservation of angular momentum.** (a) Prove $\dfrac{d\langle\hat{\mathbf L}\rangle}{dt} = \langle\hat{\mathbf N}\rangle$ with $\hat{\mathbf N} = \hat{\mathbf r}\times(-\nabla V)$ for $\hat H = \hat p^2/2m + V(\hat{\mathbf r})$. (Use $[V(\hat{\mathbf r}), \hat p_j] = i\hbar\,\partial V/\partial r_j$.) (b) Show $d\langle\hat{\mathbf L}\rangle/dt = 0$ for any spherically symmetric potential.`,
              ans: md`(a) $[\hat H, \hat L_z] = [V, \hat x\hat p_y - \hat y\hat p_x] = i\hbar(\hat x\partial_yV - \hat y\partial_xV)$, so $\tfrac{d\langle L_z\rangle}{dt} = \langle\hat x(-\partial_yV) - \hat y(-\partial_xV)\rangle = \langle N_z\rangle$. (b) $\nabla V = V'(r)\hat{\mathbf r}$, so $\mathbf r\times\nabla V = 0$.`,
              sol: md`
                **How to see it.** Same recipe as $d\langle p\rangle/dt = -\langle V'\rangle$: the kinetic energy commutes with $\hat{\mathbf L}$ (2c), so only the potential can change it, and the commutator of $V$ with momenta produces the force.

                **(a)** Do the $z$ component; $x$ and $y$ follow by cyclic relabeling. $[\hat p^2, \hat L_z] = 0$ by 2(c), and $V$ commutes with $\hat x$, $\hat y$:
                $$[\hat H, \hat L_z] = [V, \hat x\hat p_y - \hat y\hat p_x] = \hat x[V, \hat p_y] - \hat y[V, \hat p_x] = i\hbar\left(\hat x\,\partial_yV - \hat y\,\partial_xV\right)$$
                $$\frac{d\langle L_z\rangle}{dt} = \frac i\hbar\langle[\hat H, \hat L_z]\rangle = -\langle\hat x\,\partial_yV - \hat y\,\partial_xV\rangle = \left\langle\left(\hat{\mathbf r}\times(-\nabla V)\right)_z\right\rangle = \langle N_z\rangle$$
                The rotational Ehrenfest theorem: average torque changes average angular momentum.

                **(b)** For $V(r)$, $\nabla V = V'(r)\,\hat{\mathbf r}$ points along $\mathbf r$, and $\mathbf r\times\hat{\mathbf r} = 0$. So $\hat{\mathbf N} = 0$ and all three components of $\langle\hat{\mathbf L}\rangle$ are constant: **conservation of angular momentum**, from rotational symmetry. (Note: this is about the averages; each component is conserved, but since they don't commute they can't all be sharp at once.)
              `,
            },
            {
              q: md`**4. The top of the ladder.** In spherical coordinates $\hat L_z = -i\hbar\partial_\phi$, $\hat L_\pm = \pm\hbar e^{\pm i\phi}\left(\partial_\theta \pm i\cot\theta\,\partial_\phi\right)$. (a) What is $\hat L_+Y_\ell^\ell$? (No calculation allowed.) (b) Use (a) and $\hat L_zY_\ell^\ell = \hbar\ell Y_\ell^\ell$ to find $Y_\ell^\ell(\theta, \phi)$ up to normalization. (c) Normalize by direct integration; check $\ell = 1$ against $Y_1^1 = -\sqrt{3/8\pi}\sin\theta e^{i\phi}$.`,
              ans: md`(a) 0. (b) $Y_\ell^\ell = A\sin^\ell\theta\,e^{i\ell\phi}$. (c) $|A| = \dfrac{1}{2^\ell\ell!}\sqrt{\dfrac{(2\ell+1)!}{4\pi}}$; $\ell = 1$: $\tfrac12\sqrt{\tfrac{6}{4\pi}} = \sqrt{\tfrac{3}{8\pi}}$ ✓ (the $-$ sign is the Condon–Shortley phase convention).`,
              sol: md`
                **How to see it.** Two first-order equations pin down the top state: $\hat L_z$ fixes the $\phi$ dependence, $\hat L_+Y = 0$ is a first-order ODE in $\theta$. This is Midterm 1's ring problem ($i\,d/d\phi$) promoted to the sphere.

                **(a)** $\hat L_+Y_\ell^\ell = 0$: there is no $m = \ell + 1$ (1(d)).

                **(b)** $-i\hbar\partial_\phi Y = \hbar\ell Y$ gives $Y = e^{i\ell\phi}f(\theta)$. Then $\partial_\phi \to i\ell$ and
                $$\hat L_+Y = \hbar e^{i\phi}e^{i\ell\phi}\left(f' + i\cot\theta\cdot i\ell f\right) = \hbar e^{i(\ell+1)\phi}\left(f' - \ell\cot\theta\,f\right) = 0$$
                $\tfrac{f'}{f} = \ell\tfrac{\cos\theta}{\sin\theta}$, so $\ln f = \ell\ln\sin\theta + \text{const}$:
                $$Y_\ell^\ell = A\sin^\ell\theta\,e^{i\ell\phi}$$
                **Picture:** $|Y_\ell^\ell|^2 \propto \sin^{2\ell}\theta$, a donut squeezed ever more tightly onto the equator as $\ell$ grows: maximal $L_z$ means the orbit lies nearly in the $xy$ plane.

                **(c)** $1 = |A|^2\int_0^{2\pi}d\phi\int_0^\pi\sin^{2\ell}\theta\sin\theta\,d\theta = 2\pi|A|^2I_\ell$. With $u = \cos\theta$, $I_\ell = \int_{-1}^1(1 - u^2)^\ell du = \tfrac{2^{2\ell+1}(\ell!)^2}{(2\ell+1)!}$ (integrate by parts: $I_\ell = \tfrac{2\ell}{2\ell+1}I_{\ell-1}$, $I_0 = 2$). So
                $$|A|^2 = \frac{(2\ell+1)!}{4\pi\,4^\ell(\ell!)^2},\qquad |A| = \frac{1}{2^\ell\ell!}\sqrt{\frac{(2\ell+1)!}{4\pi}}$$
                **Check** $\ell = 1$: $I_1 = \tfrac43$, $|A| = \tfrac12\sqrt{\tfrac{6}{4\pi}} = \sqrt{\tfrac{3}{8\pi}}$ ✓. The overall sign ($-$ in Griffiths) is a phase convention; a normalization only fixes $|A|$.
              `,
            },
          ]),
          R(md`
            **Where this shows up on the exam.** Midterm 1's Problem 2 was a new operator on a periodic domain: Hermitian? eigenfunctions? why discrete? measure it on a given function. Problem 4 is that problem on the sphere. Expect "show $\hat L_+^\dagger = \hat L_-$", a commutator to evaluate, "is $\langle L_z\rangle$ conserved in this potential? why?", and the top-of-the-ladder derivation. The norm trick in 1(c) is the same move as $\|\hat a_+\ket n\| = \sqrt{n+1}$: know it for both.
          `),
          drill,
          P({
            title: 'Ladder coefficients',
            q: md`In units of $\hbar$: find the coefficient in $\hat L_+Y_2^0$ and in $\hat L_-Y_3^1$.`,
            parts: [{ lbl: 'A_2^0/\\hbar', ans: Math.sqrt(6) }, { lbl: 'B_3^1/\\hbar', ans: Math.sqrt(12) }],
            hints: [md`$A = \sqrt{\ell(\ell+1) - m(m+1)}$, $B = \sqrt{\ell(\ell+1) - m(m-1)}$.`],
            sol: md`$\sqrt{6 - 0} = 2.45$; $\sqrt{12 - 0} = 3.46$. The coefficients are largest in the middle of the ladder and vanish at the ends.`,
          }),
          P({
            title: 'The perpendicular part',
            q: md`In the state $Y_2^1$, find $\langle L_x^2 + L_y^2\rangle$ in units of $\hbar^2$, and $\langle L_x\rangle$.`,
            parts: [{ lbl: '\\langle L_x^2 + L_y^2\\rangle/\\hbar^2', ans: 5 }, { lbl: '\\langle L_x\\rangle', ans: 0 }],
            hints: [md`$\hat L_x^2 + \hat L_y^2 = \hat L^2 - \hat L_z^2$. $\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$ changes $m$.`],
            sol: md`$\hbar^2(6 - 1) = 5\hbar^2$. $\langle L_x\rangle = \tfrac12\bra{2,1}(\hat L_+ + \hat L_-)\ket{2,1} = 0$: the results are orthogonal to $\ket{2,1}$. The perpendicular part has a definite size but no definite direction: the vector model's cone.`,
          }),
          Q(md`$[\hat L_z, \hat x\hat y] = $?`, [md`$i\hbar(\hat y^2 - \hat x^2)$`, md`$0$`, md`$i\hbar(\hat x^2 + \hat y^2)$`, md`$2i\hbar\hat x\hat y$`], 0,
            [null, md`$xy$ is not symmetric about $z$: rotating it changes it.`, 'Sign: one term is iħy·y, the other x·(−iħx).', 'Not the product rule result.'],
            md`$[\hat L_z, \hat x]\hat y + \hat x[\hat L_z, \hat y] = i\hbar\hat y^2 - i\hbar\hat x^2$. Rotating $xy$ by $45°$ turns it into $\tfrac12(x^2 - y^2)$.`),
          Q(md`A particle moves in $V = V_0(r) - qEz$ (a central potential plus a uniform field along $z$). Which components of $\langle\hat{\mathbf L}\rangle$ are conserved?`, [md`Only $\langle L_z\rangle$`, 'All three', 'None', md`$\langle L_x\rangle$ and $\langle L_y\rangle$`], 0,
            [null, md`The field breaks full rotational symmetry.`, md`Rotations about $z$ still leave $V$ unchanged.`, md`The torque is perpendicular to $z$, so these are the ones that change.`],
            md`$-\nabla V = -V_0'\hat{\mathbf r} + qE\hat{\mathbf z}$, torque $\mathbf r\times qE\hat{\mathbf z} = qE(y\hat{\mathbf x} - x\hat{\mathbf y})$: no $z$ component. Symmetry about $z$ ⇒ $L_z$ conserved.`),
          P({
            title: 'Normalize Y₂²',
            q: md`$Y_2^2 = A\sin^2\theta\,e^{2i\phi}$. Find $|A|$.`,
            parts: [{ lbl: '|A|', ans: Math.sqrt(15 / (32 * Math.PI)) }],
            hints: [md`$I_2 = \int_{-1}^1(1 - u^2)^2du = \tfrac{16}{15}$.`],
            sol: md`$|A|^2 = \tfrac{1}{2\pi\cdot16/15} = \tfrac{15}{32\pi}$, $|A| = 0.386$. Matches the table's $\sqrt{15/32\pi}$.`,
          }),
          Q(md`Why does $\hat L_+$ acting on $Y_\ell^\ell$ have to give zero, rather than some function with $m = \ell + 1$?`, [md`Its norm would be $\hbar^2[\ell(\ell+1) - \ell(\ell+1)] = 0$; stepping further would need a negative norm`, md`Because $\hat L_+$ is not Hermitian`, md`Because $m$ must be an integer`, md`Because $Y_\ell^\ell$ is real`], 0,
            [null, md`$\hat a_+$ isn't Hermitian either, and its ladder never stops.`, md`$\ell + 1$ is an integer too.`, md`$Y_\ell^\ell \propto e^{i\ell\phi}$ is complex.`],
            md`$\|\hat L_+Y_\ell^m\|^2 = \hbar^2[\ell(\ell+1) - m(m+1)]$: zero at $m = \ell$, negative beyond. A vector of zero length is the zero vector.`),
          P({
            title: 'Never straight up',
            q: md`In $Y_2^2$ the angular momentum has the largest possible $z$ component. Find the angle between $\mathbf L$ and the $z$ axis in the vector model, $\cos\theta = m/\sqrt{\ell(\ell+1)}$, in degrees.`,
            parts: [{ lbl: '\\theta', ans: Math.acos(2 / Math.sqrt(6)) * 180 / Math.PI, unit: '°' }],
            hints: [md`$|\mathbf L| = \hbar\sqrt6$, $L_z = 2\hbar$.`],
            sol: md`$\cos\theta = 2/\sqrt6$, $\theta = 35.3°$. If $\mathbf L$ pointed exactly along $z$, $L_x$ and $L_y$ would both be sharp (zero), which the commutators forbid unless $\ell = 0$.`,
          }),
        ],
      },
    ],
  });
})();

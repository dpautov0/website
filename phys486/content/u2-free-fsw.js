/* Unit 2b — free particle and wave packets, finite square well and tunneling (Lectures 5–6). Topics 6–7.
   Appends to the Unit 2 registered in u2-wells.js. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const L = (n, t) => R(md`#### Level ${n} · ${t}`);
  const u2 = COURSE.units.find((u) => u.id === 'u2');

  const packet = PF.plot({
    w: 360, h: 200, x: [-3, 3], y: [-1.15, 1.15], xl: 'x', zero: true,
    curves: [{ f: (x) => Math.exp(-x * x) * Math.cos(7 * x), n: 400 }, { f: (x) => Math.exp(-x * x), cls: 'dash dim' }, { f: (x) => -Math.exp(-x * x), cls: 'dash dim' }],
  });

  // graphical solution for z0 = 4: tan z and -cot z against sqrt(z0^2/z^2 - 1)
  const z0 = 4, rhs = (z) => Math.sqrt(Math.max(z0 * z0 / (z * z) - 1, 0));
  const graph = PF.plot({
    w: 380, h: 240, x: [0, 4.4], y: [0, 6], xl: 'z', yl: '',
    xt: [[Math.PI / 2, '\\tfrac\\pi2'], [Math.PI, '\\pi'], [3 * Math.PI / 2, '\\tfrac{3\\pi}2'], [4, 'z_0']],
    curves: [
      { f: Math.tan, from: 0, to: Math.PI / 2 - 0.01, lab: '\\tan z', labAt: 1.25, anchor: 'r', dx: -4 },
      { f: Math.tan, from: Math.PI, to: 3 * Math.PI / 2 - 0.01 },
      { f: (z) => -1 / Math.tan(z), from: Math.PI / 2 + 0.01, to: Math.PI - 0.01, cls: 'dash', lab: '-\\cot z', labAt: 2.95 },
      { f: (z) => -1 / Math.tan(z), from: 3 * Math.PI / 2 + 0.01, to: 4.4, cls: 'dash' },
      { f: rhs, from: 0.6, to: 4, cls: 'accent', lab: '\\sqrt{z_0^2/z^2 - 1}', labAt: 0.75 },
    ],
  });

  u2.lessons.push(
    // ------------------------------------------------------------------ Topic 6
    {
      id: 't6-free', topic: 6, title: 'The free particle and wave packets',
      steps: [
        R(md`
          ### The idea

          With $V = 0$ the stationary states are plane waves,
          $$\psi_k(x) = e^{ikx}, \qquad E = \frac{\hbar^2k^2}{2m}, \qquad k \in (-\infty, \infty)$$
          $k > 0$ moves right, $k < 0$ left, and the energy is continuous. But $|e^{ikx}|^2 = 1$ everywhere: a plane wave **cannot be normalized**, so it is not a physical state. It is a perfect momentum eigenstate ($p = \hbar k$, $\sigma_p = 0$) with a completely unknown position ($\sigma_x = \infty$).

          A real particle is a **wave packet**: a superposition of plane waves, which is the 3-step recipe with an integral instead of a sum.
          $$\Psi(x,t) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}\phi(k)\,e^{i\left(kx - \frac{\hbar k^2}{2m}t\right)}dk, \qquad \phi(k) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}\Psi(x,0)\,e^{-ikx}dx$$
          $\phi(k)$ is the Fourier transform of the initial state: the amplitude for each momentum. $|\phi(k)|^2dk$ is the probability of measuring momentum in $\hbar[k, k + dk]$, and if $\Psi$ is normalized so is $\phi$.
        `),
        RF(md`
          ### Two velocities

          [[fig:packet]]

          Each plane wave's crests move at the **phase velocity** $\omega/k = \hbar k/2m$. The packet's envelope (where the particle is) moves at the **group velocity**
          $$v_g = \frac{d\omega}{dk}\bigg|_{k_0} = \frac{\hbar k_0}{m} = \frac{p}{m} = v_{\text{classical}}, \qquad v_{\text{phase}} = \frac{v_g}{2}$$
          The ripples slide backward through the envelope as it moves. Only the envelope carries the particle.

          ### Width trade-off and spreading

          Fourier transforms trade widths: a packet of width $\Delta x$ needs a spread $\Delta k \gtrsim 1/\Delta x$. Narrow in $x$ means broad in $k$, and vice versa. (Gaussians are the best case: $\sigma_x\sigma_k = \tfrac12$.)

          Because $v = \hbar k/m$ depends on $k$, the different components travel at different speeds and the packet **spreads**. The spread in velocities is $\sigma_p/m$, so a packet that starts narrow (big $\sigma_p$) spreads fast. For a Gaussian of initial width $\sigma_0$:
          $$\sigma_x(t) = \sigma_0\sqrt{1 + \left(\frac{\hbar t}{2m\sigma_0^2}\right)^2} \;\xrightarrow{t\to\infty}\; \frac{\sigma_p}{m}\,t$$
          $\sigma_p$ itself never changes: the free Hamiltonian commutes with $\hat p$.

          ### Traveling vs standing waves

          $Ae^{ikx} + Be^{-ikx} = C\cos kx + D\sin kx$ with $C = A + B$, $D = i(A - B)$. Exponentials suit free particles (definite direction); sines and cosines suit wells (standing waves, real).
        `, { packet: { svg: packet, cap: 'Re Ψ of a packet: fast ripples (carrier e^{ik₀x}) inside a slowly varying envelope.' } }),
        R(md`
          ### Worked example (HW 2)

          !!graded Problem
            A free particle starts as $\Psi(x,0) = Ae^{-ax^2}$. Normalize, find $\phi(k)$, $\sigma_x\sigma_p$ at $t = 0$, and describe what happens later.

          **Normalize.** $\int e^{-2ax^2}dx = \sqrt{\pi/2a}$, so $A = (2a/\pi)^{1/4}$.

          **Transform.** Complete the square in $-ax^2 - ikx$:
          $$\phi(k) = \frac{A}{\sqrt{2\pi}}\int e^{-ax^2 - ikx}dx = \frac{A}{\sqrt{2\pi}}\sqrt{\frac\pi a}\,e^{-k^2/4a} = \left(\frac{1}{2\pi a}\right)^{1/4}e^{-k^2/4a}$$
          A Gaussian in $x$ is a Gaussian in $k$: width $\sigma_x = 1/(2\sqrt a)$ in position, $\sigma_k = \sqrt a$ in wavenumber.

          **Uncertainty.** $\sigma_p = \hbar\sqrt a$, so $\sigma_x\sigma_p = \hbar/2$ exactly: the minimum.

          **Later.** Each $k$ picks up $e^{-i\hbar k^2t/2m}$, and the result is still Gaussian with $|\Psi|^2 = \sqrt{2/\pi}\,w\,e^{-2w^2x^2}$, $w = \sqrt{a}\big/\sqrt{1 + (2\hbar at/m)^2}$. It stays centered ($\langle p\rangle = 0$) and spreads, so $\sigma_x\sigma_p = \tfrac\hbar2\sqrt{1 + (2\hbar at/m)^2}$, at the limit only at $t = 0$.

          !!mistake Common mistakes
            - Treating $e^{ikx}$ as a normalizable state with a position probability.
            - Saying the particle moves at the phase velocity. It moves with the envelope, at $\hbar k_0/m$.
            - Expecting $\sigma_p$ to grow as the packet spreads. Momenta of a free particle never change.
            - Losing the $1/\sqrt{2\pi}$ factors: with them on both transforms, $\int|\phi|^2dk = \int|\Psi|^2dx$.
        `),
        L(1, 'recognize'),
        Q(md`Why isn't $e^{ikx}$ a physically realizable state?`,
          ['Its integral of |ψ|² diverges, so it cannot be normalized', 'Its energy is negative', 'It is not an eigenstate of momentum', 'It violates the Schrödinger equation'], 0,
          [null, md`$E = \hbar^2k^2/2m \ge 0$.`, md`It is exactly a momentum eigenstate.`, 'It solves the free equation.'],
          md`$|e^{ikx}|^2 = 1$ for all $x$: infinite total probability.`),
        Q(md`Which speed is the speed of the particle?`, ['group velocity', 'phase velocity', 'the average of the two', 'neither: a quantum particle has no speed'], 0,
          [null, 'Phase velocity is half the classical speed.', 'No.', md`$d\langle x\rangle/dt = \langle p\rangle/m = v_g$.`],
          md`The envelope (where $|\Psi|^2$ is large) moves at $v_g = \hbar k_0/m$.`),
        L(2, 'set up'),
        P({
          title: 'Packet speed from wavelength',
          q: md`An electron packet has central de Broglie wavelength 0.5 nm. How fast does the packet move?`,
          parts: [{ lbl: 'v_g', ans: 1.455e6, unit: 'm/s' }],
          hints: [md`$v_g = p/m = h/m\lambda$.`],
          sol: md`$v_g = \tfrac{6.626\times10^{-34}}{(9.109\times10^{-31})(5\times10^{-10})} = 1.45\times10^6$ m/s. The crests move at half that.`,
        }),
        Q(md`$|\phi(k)|^2$ is sharply peaked at $k_0 = 5\times10^{9}\ \text{m}^{-1}$. A momentum measurement most likely gives…`,
          [md`$\hbar k_0$`, md`$k_0$`, md`$\hbar k_0^2/2m$`, '0'], 0,
          [null, 'Units: momentum is ħk.', md`That is $\omega$, not a momentum.`, 'Only if φ were peaked at 0.'],
          md`$p = \hbar k$.`),
        L(3, 'standard'),
        P({
          title: 'Lorentzian momentum distribution',
          q: md`$\Psi(x,0) = \sqrt\lambda\,e^{-\lambda|x|}$ has $\phi(k) = \sqrt{\dfrac{\lambda}{2\pi}}\dfrac{2\lambda}{\lambda^2 + k^2}$. What is $|\phi(\lambda)|^2/|\phi(0)|^2$?`,
          parts: [{ lbl: 'ratio', ans: 0.25 }],
          hints: [md`Only the $1/(\lambda^2 + k^2)$ factor changes.`],
          sol: md`$\left(\tfrac{\lambda^2}{2\lambda^2}\right)^2 = \tfrac14$. Width in $k$ is $\sim\lambda$, inverse to the width $1/\lambda$ in $x$.`,
        }),
        P({
          title: 'Square pulse',
          q: md`$\Psi(x,0) = 1/\sqrt{2L}$ for $|x| < L$, zero elsewhere. Then $\phi(k) \propto \sin(kL)/k$. At what positive $k$ does $\phi$ first vanish?`,
          parts: [{ lbl: 'k_1', expr: 'pi/L', vars: { L: [0.5, 3] } }],
          hints: [md`$\sin(kL) = 0$, but $k = 0$ is the peak, not a zero.`],
          sol: md`$k_1 = \pi/L$. The central lobe has width $\sim 2\pi/L$: twice as wide a pulse, half as wide a spread in momentum.`,
        }),
        P({
          title: 'Energy of the Gaussian',
          q: md`For the free Gaussian $\Psi(x,0) = (2a/\pi)^{1/4}e^{-ax^2}$, find $\langle H\rangle$.`,
          parts: [{ lbl: '\\langle H\\rangle', expr: 'a*hbar^2/(2*m)', vars: { a: [0.5, 2], hbar: [0.5, 2], m: [0.5, 2] } }],
          hints: [md`$\langle H\rangle = \langle p^2\rangle/2m$ and $\sigma_k^2 = a$.`],
          sol: md`$\langle p^2\rangle = \hbar^2\sigma_k^2 = a\hbar^2$, so $\langle H\rangle = a\hbar^2/2m$. Narrower packet (bigger $a$), more kinetic energy. Constant in time.`,
        }),
        L(4, 'one twist'),
        P({
          title: 'Moving Gaussian',
          q: md`Now $\Psi(x,0) = (2a/\pi)^{1/4}e^{-ax^2}e^{ik_0x}$. Find $\langle H\rangle$.`,
          parts: [{ lbl: '\\langle H\\rangle', expr: 'hbar^2*(k0^2 + a)/(2*m)', vars: { a: [0.5, 2], hbar: [0.5, 2], m: [0.5, 2], k0: [0.5, 3] } }],
          hints: [md`$\phi(k)$ is the old one shifted to center $k_0$. $\langle k^2\rangle = k_0^2 + \sigma_k^2$.`],
          sol: md`$\langle p^2\rangle = \hbar^2(k_0^2 + a)$, so $\langle H\rangle = \tfrac{\hbar^2(k_0^2 + a)}{2m}$: the kinetic energy of the motion plus the "confinement" energy of the width.`,
        }),
        P({
          title: 'Doubling time',
          q: md`When has the width $\sigma_x$ of the free Gaussian $e^{-ax^2}$ doubled?`,
          parts: [{ lbl: 't_2', expr: 'sqrt(3)*m/(2*hbar*a)', vars: { a: [0.5, 2], hbar: [0.5, 2], m: [0.5, 2] } }],
          hints: [md`$\sigma_x \propto 1/w \propto \sqrt{1 + (2\hbar at/m)^2}$.`],
          sol: md`$1 + (2\hbar at/m)^2 = 4 \Rightarrow t = \tfrac{\sqrt3\,m}{2\hbar a}$. Heavier, or initially wider (small $a$), packets spread more slowly.`,
        }),
        Q(md`$Ae^{ikx} + Be^{-ikx} = C\cos kx + D\sin kx$. Then…`,
          [md`$C = A + B$, $D = i(A - B)$`, md`$C = A - B$, $D = A + B$`, md`$C = A + B$, $D = A - B$`, md`$C = (A + B)/2$, $D = (A - B)/2i$`], 0,
          [null, md`Check $x = 0$: the left side is $A + B$.`, md`$e^{ikx} - e^{-ikx} = 2i\sin kx$, so a factor $i$ appears.`, 'Those are the inverse relations, rearranged wrong.'],
          md`$e^{\pm ikx} = \cos kx \pm i\sin kx$: collect $\cos$: $A + B$; $\sin$: $i(A - B)$.`),
        L(5, 'exam level'),
        Q(md`Packet 1 starts with width $\sigma_0$; packet 2 (same mass) with width $\sigma_0/10$. At late times…`,
          ['packet 2 is about 10 times wider than packet 1', 'packet 2 is still 10 times narrower', 'they have the same width', 'packet 2 is about 100 times wider'], 0,
          [null, 'Narrow packets have big momentum spread and outrun the wide ones.', 'Late-time width is σₚt/m, set by the momentum spread.', md`$\sigma_p \propto 1/\sigma_0$, a factor 10, not 100.`],
          md`Late-time width $\approx\sigma_pt/m = \hbar t/2m\sigma_0$: inversely proportional to the initial width. Squeeze now, spread faster later.`),
        Q(md`As a free packet spreads, $\sigma_x\sigma_p$…`,
          ['grows, because σₓ grows and σₚ stays fixed', 'stays ħ/2', 'shrinks, because σₚ shrinks', 'oscillates'], 0,
          [null, 'Only a Gaussian at the instant of minimum width is at the limit.', md`$[\hat H, \hat p] = 0$ for a free particle: $\sigma_p$ is conserved.`, 'Nothing periodic in free motion.'],
          'Momentum distribution is frozen; position distribution widens.'),
        L(6, 'harder than the exam'),
        Q(md`A free packet starts as $e^{-ax^2}e^{-ibx^2}$ with $b > 0$ (a "chirp"). Initially its width…`,
          ['shrinks: the local wavenumber −2bx points every part toward the center', 'grows faster than the unchirped packet', 'stays the same forever', 'is unchanged at first and then grows like the unchirped one'], 0,
          [null, md`That is $e^{+ibx^2}$: local $k = +2bx$ points outward.`, 'It focuses and then spreads.', md`The chirp changes $d\sigma_x/dt$ at $t = 0$.`],
          md`Local wavenumber $k(x) = \partial_x(\text{phase}) = -2bx$: the right side moves left and the left side moves right. The packet focuses to a minimum width, then spreads. (Run time backward on a spreading packet and you get exactly this.)`),
      ],
      bank: [
        Q(md`Phase velocity of a free matter wave equals…`, ['half the classical velocity', 'the classical velocity', 'twice the classical velocity', 'c'], 0,
          [null, 'That is the group velocity.', 'Inverted.', 'Non-relativistic: no.'], md`$\omega/k = \hbar k/2m$.`),
        Q(md`A free particle's energy spectrum is…`, ['continuous, E ≥ 0', 'discrete, n² spacing', 'discrete, equal spacing', 'continuous, all real E'], 0,
          [null, 'No walls, no quantization.', 'That is the oscillator.', 'Negative E would need V < 0.'], md`$E = \hbar^2k^2/2m$ for any real $k$.`),
        Q(md`The Fourier transform of a Gaussian is…`, ['a Gaussian', 'a Lorentzian', 'a sinc', 'a plane wave'], 0,
          [null, 'That comes from e^{−λ|x|}.', 'That comes from a square pulse.', 'That comes from a delta.'], 'Width a in x becomes width 1/a-ish in k.'),
        Q(md`Which quantity of a free packet changes with time?`, [md`$\sigma_x$`, md`$\sigma_p$`, md`$\langle p\rangle$`, md`$\langle H\rangle$`], 0,
          [null, 'Conserved.', 'Conserved (no force).', 'Conserved.'], 'Only the position distribution evolves.'),
      ],
    },

    // ------------------------------------------------------------------ Topic 7
    {
      id: 't7-fsw', topic: 7, title: 'The finite square well, scattering and tunneling',
      steps: [
        R(md`
          ### The idea

          $V = -V_0$ for $|x| < a$, $V = 0$ outside. Two kinds of solutions, split by the sign of $E$:

          - **Bound states**, $-V_0 < E < 0$: oscillate inside, decay outside. Discrete energies, normalizable.
          - **Scattering states**, $E > 0$: oscillate everywhere. Any energy, not normalizable, described by transmission and reflection.

          ### Bound states: match, divide, graph

          $$\ell = \frac{\sqrt{2m(E + V_0)}}{\hbar}\ \text{(inside)}, \qquad \kappa = \frac{\sqrt{-2mE}}{\hbar}\ \text{(outside, decay rate)}$$
          The potential is even, so look for even ($\cos\ell x$ inside) and odd ($\sin\ell x$) states with $e^{-\kappa|x|}$ outside. Matching $\psi$ and $\psi'$ at $x = a$ and dividing (the logarithmic derivative $\psi'/\psi$ must agree, and it kills the unknown amplitudes):
          $$\text{even: } \kappa = \ell\tan\ell a \qquad\qquad \text{odd: } \kappa = -\ell\cot\ell a$$
          Make it dimensionless with $z = \ell a$ and $z_0 = \tfrac{a}{\hbar}\sqrt{2mV_0}$, using $\kappa^2 + \ell^2 = 2mV_0/\hbar^2$:
          $$\tan z = \sqrt{(z_0/z)^2 - 1}\ \text{(even)}, \qquad -\cot z = \sqrt{(z_0/z)^2 - 1}\ \text{(odd)}, \qquad E = -V_0 + \frac{\hbar^2z^2}{2ma^2}$$
          $z_0$ is the single number that measures how strong the well is (deep and wide = big $z_0$).
        `),
        RF(md`
          ### Reading the graph

          [[fig:graph]]

          The accent curve falls from $\infty$ to 0 at $z = z_0$. Each branch of $\tan z$ (from $0$, $\pi$, …) and of $-\cot z$ (from $\pi/2$, $3\pi/2$, …) crosses it once if it starts before $z_0$. So:

          - **There is always at least one (even) bound state**, however weak the well: $\tan z$ starts at 0 and always meets the falling curve. True for any attractive 1-D well.
          - An odd state needs $z_0 > \pi/2$. In general the number of bound states is the number of multiples of $\pi/2$ below $z_0$, plus one: $N = \lceil 2z_0/\pi\rceil$.
          - **Deep, wide well** ($z_0 \gg 1$): crossings near $z = n\pi/2$, so $E_n + V_0 \approx \dfrac{n^2\pi^2\hbar^2}{2m(2a)^2}$, the infinite well of width $2a$, slightly *lower* because the wave leaks out and effectively sees a wider box.
          - **Shallow, narrow well** ($z_0 < \pi/2$): exactly one bound state, barely bound, spread far outside ($\kappa$ small).

          The leak is real: the particle has nonzero probability in the classically forbidden region, falling off over a **penetration depth** $1/\kappa = \hbar/\sqrt{2m|E|}$.
        `, { graph: { svg: graph, cap: 'z₀ = 4: three crossings, so three bound states (even, odd, even).' } }),
        R(md`
          ### Scattering and tunneling

          Send a wave in from the left: $e^{ikx} + re^{-ikx}$ on the left, $te^{ikx}$ on the right. $R = |r|^2$ and $T = |t|^2$ (same $k$ on both sides) with $R + T = 1$. For the well,
          $$T^{-1} = 1 + \frac{V_0^2}{4E(E + V_0)}\sin^2\left(\frac{2a}{\hbar}\sqrt{2m(E + V_0)}\right)$$
          $T = 1$ (**perfect transmission**) when the well holds a whole number of half-wavelengths: $2a\ell = n\pi$. The two reflections cancel, like an anti-reflection coating.

          **Step up** to height $V_0$: for $E > V_0$, $k' = \sqrt{2m(E - V_0)}/\hbar$ and $R = \left(\tfrac{k - k'}{k + k'}\right)^2$: a particle with enough energy to pass still sometimes bounces. (If $k' \ne k$, $T = \tfrac{k'}{k}|t|^2$, since flux is density times speed.) For $E < V_0$, $R = 1$ but $\psi$ still penetrates a depth $1/\kappa$.

          **Barrier** of height $V_0$, width $L$, with $E < V_0$: inside, $\psi$ decays as $e^{-\kappa x}$, $\kappa = \sqrt{2m(V_0 - E)}/\hbar$. Whatever survives to the far side leaks out:
          $$T \approx \frac{16E(V_0 - E)}{V_0^2}e^{-2\kappa L}\qquad(\kappa L \gg 1)$$
          The exponential dominates. Compare $L$ with $1/\kappa$: barriers a few $1/\kappa$ thick are nearly opaque, thinner ones leak. (For $E > V_0$ the relevant scale is the wavelength instead.)
        `),
        R(md`
          ### Worked example (HW 3)

          !!graded Problem
            Find the condition for the odd bound states of the finite well, solve it graphically, and examine the limits. Is there always an odd bound state?

          **Set up.** Inside $\psi = D\sin\ell x$; for $x > a$, $\psi = Fe^{-\kappa x}$ (and minus that for $x < -a$, by oddness).

          **Match at $x = a$.** $D\sin\ell a = Fe^{-\kappa a}$ and $D\ell\cos\ell a = -\kappa Fe^{-\kappa a}$. Divide: $\kappa = -\ell\cot\ell a$, i.e. $-\cot z = \sqrt{(z_0/z)^2 - 1}$.

          **Graph.** $-\cot z$ is negative on $(0, \pi/2)$, crosses 0 at $\pi/2$, and rises to $+\infty$ at $\pi$. The right side is positive for $z < z_0$. They meet only if the first odd branch starts before $z_0$: **odd states exist only if $z_0 > \pi/2$**, i.e. $V_0 > \pi^2\hbar^2/8ma^2$. So no, there is not always an odd state.

          **Limits.** $z_0 \to \infty$: crossings at $z \to \pi, 2\pi, \ldots$, giving $E + V_0 = \tfrac{n^2\pi^2\hbar^2}{2m(2a)^2}$ with $n$ even: the even-$n$ states of an infinite well of width $2a$. $z_0$ just above $\pi/2$: one odd state, barely bound.

          !!mistake Common mistakes
            - Using $e^{+\kappa|x|}$ outside, or keeping both exponentials. Normalizability picks the decaying one.
            - Matching $\psi$ but forgetting $\psi'$; with a finite step both are continuous.
            - Claiming a shallow well may have no bound state. In 1-D there is always one.
            - Using $T = |t|^2$ when the speeds on the two sides differ.

          ### Questions
        `),
        L(1, 'recognize'),
        Q(md`Bound states of the finite well $V = -V_0$ ($|x| < a$) have energies…`,
          [md`$-V_0 < E < 0$`, md`$E > 0$`, md`$E < -V_0$`, md`$0 < E < V_0$`], 0,
          [null, 'Those are scattering states.', 'Below the bottom: no solution.', 'Sign confusion: the well is at −V₀.'],
          'Trapped: above the floor, below the rim.'),
        Q(md`How many bound states does a very shallow, narrow finite well have?`,
          ['exactly one', 'none', 'two', 'infinitely many'], 0,
          [null, md`$\tan z$ always meets the falling curve: at least one.`, md`A second needs $z_0 > \pi/2$.`, 'Only the infinite well has infinitely many.'],
          'In 1-D any attractive well binds at least one state.'),
        L(2, 'set up'),
        P({
          title: 'Strength of a well',
          q: md`An electron is in a finite well of depth $V_0 = 1$ eV and total width $2a = 1$ nm. Find $z_0$ and the number of bound states.`,
          parts: [{ lbl: 'z_0', ans: 2.5616 }, { lbl: 'N', ans: 2 }],
          hints: [md`$z_0 = \tfrac a\hbar\sqrt{2mV_0}$ with $a = 0.5$ nm.`, md`$N = \lceil 2z_0/\pi\rceil$.`],
          sol: md`$\sqrt{2mV_0} = \sqrt{2(9.109\times10^{-31})(1.602\times10^{-19})} = 5.40\times10^{-25}$; $z_0 = \tfrac{(0.5\times10^{-9})(5.40\times10^{-25})}{1.055\times10^{-34}} = 2.56$. Between $\pi/2$ and $\pi$: one even and one odd state, $N = 2$.`,
        }),
        Q(md`Outside the well, a bound state with energy $E$ ($<0$) decays as $e^{-\kappa|x|}$ with…`,
          [md`$\kappa = \sqrt{-2mE}/\hbar$`, md`$\kappa = \sqrt{2m(E + V_0)}/\hbar$`, md`$\kappa = \sqrt{2mV_0}/\hbar$`, md`$\kappa = -2mE/\hbar^2$`], 0,
          [null, 'That is the inside wavenumber ℓ.', 'That ignores the energy; it is √(κ² + ℓ²).', 'That is κ², not κ.'],
          md`Outside $V = 0$, so $\psi'' = \tfrac{2m}{\hbar^2}(-E)\psi = \kappa^2\psi$.`),
        L(3, 'standard'),
        P({
          title: 'Penetration depth',
          q: md`An electron is bound with $E = -0.5$ eV. Over what distance $1/\kappa$ does its wavefunction decay outside the well?`,
          parts: [{ lbl: '1/\\kappa', ans: 0.276, unit: 'nm' }],
          hints: [md`$1/\kappa = \hbar/\sqrt{2m|E|}$.`],
          sol: md`$\sqrt{2(9.109\times10^{-31})(0.801\times10^{-19})} = 3.82\times10^{-25}$; $1/\kappa = 1.055\times10^{-34}/3.82\times10^{-25} = 2.76\times10^{-10}$ m $= 0.276$ nm. Comparable to the well itself: the leak is not small.`,
        }),
        Q(md`$z_0 = 4$. How many bound states, and of which parity?`,
          ['3: even, odd, even', '2: even, odd', '4: even, odd, even, odd', '3: odd, even, odd'], 0,
          [null, md`$z_0 = 4 > \pi$, so the second even branch (starting at $\pi$) also crosses.`, md`The second odd branch starts at $3\pi/2 \approx 4.71 > 4$.`, 'The ground state is always even.'],
          md`Branches start at $0, \tfrac\pi2, \pi, \tfrac{3\pi}2, \ldots$; those below $z_0 = 4$: $0, \pi/2, \pi$ → three states.`),
        L(4, 'one twist'),
        P({
          title: 'Threshold for an odd state',
          q: md`What minimum depth $V_0$ does a finite well of half-width $a$ need to hold an odd bound state?`,
          parts: [{ lbl: 'V_{0,\\min}', expr: 'pi^2*hbar^2/(8*m*a^2)', vars: { hbar: [0.5, 2], m: [0.5, 2], a: [0.5, 2] } }],
          hints: [md`Set $z_0 = \pi/2$.`],
          sol: md`$\tfrac a\hbar\sqrt{2mV_0} = \tfrac\pi2 \Rightarrow V_0 = \tfrac{\pi^2\hbar^2}{8ma^2}$. Note this is the ground energy of an infinite well of width $2a$.`,
        }),
        Q(md`Compared with an infinite well of the same width $2a$, the finite well's ground state measured from the bottom, $E_1 + V_0$, is…`,
          ['lower: the wave leaks out, so it effectively has more room', 'higher: the walls are weaker so it is less bound', 'the same', 'zero'], 0,
          [null, 'Weaker walls let ψ spread; spreading lowers kinetic energy.', 'Leakage changes it.', 'Zero-point energy is never zero.'],
          md`Less curvature is needed when $\psi$ does not have to reach zero at $\pm a$: lower $z$, lower energy.`),
        L(5, 'exam level'),
        P({
          title: 'Tunneling through a barrier',
          q: md`An electron with $E = 1$ eV meets a rectangular barrier of height 5 eV and width 0.5 nm. Estimate $T$.`,
          parts: [{ lbl: 'T', ans: 9.08e-5, tol: { rel: 0.03 } }],
          hints: [md`$\kappa = \sqrt{2m(V_0 - E)}/\hbar$ with $V_0 - E = 4$ eV.`, md`$T \approx \tfrac{16E(V_0 - E)}{V_0^2}e^{-2\kappa L}$.`],
          sol: md`$\kappa = \tfrac{\sqrt{2(9.109\times10^{-31})(6.41\times10^{-19})}}{1.055\times10^{-34}} = 1.025\times10^{10}\ \text{m}^{-1}$, $2\kappa L = 10.25$. Prefactor $16(0.2)(0.8) = 2.56$. $T \approx 2.56\,e^{-10.25} = 9.1\times10^{-5}$.`,
        }),
        Q(md`For that barrier, you double the width to 1 nm. $T$ becomes roughly…`,
          [md`$3\times10^{-9}$`, md`$4.5\times10^{-5}$`, md`$2.3\times10^{-5}$`, md`$8\times10^{-9}$ times larger`], 0,
          [null, 'T is exponential in L, not inversely proportional.', 'Not a factor 4 either.', 'It gets smaller.'],
          md`One more factor of $e^{-2\kappa L} = e^{-10.25} = 3.5\times10^{-5}$: $T \approx 9\times10^{-5}\times3.5\times10^{-5} \approx 3\times10^{-9}$.`),
        P({
          title: 'Step up with energy to spare',
          q: md`A particle with $E = 2V_0$ hits a step up of height $V_0$. Find the reflection probability $R$.`,
          parts: [{ lbl: 'R', ans: 17 - 12 * Math.SQRT2 }],
          hints: [md`$k'/k = \sqrt{(E - V_0)/E} = 1/\sqrt2$.`],
          sol: md`$R = \left(\tfrac{1 - 1/\sqrt2}{1 + 1/\sqrt2}\right)^2 = \left(\tfrac{\sqrt2 - 1}{\sqrt2 + 1}\right)^2 = 17 - 12\sqrt2 = 0.0294$. About 3% bounces back though classically none would.`,
        }),
        P({
          title: 'Perfect transmission',
          q: md`At which energies $E > 0$ is a finite well (depth $V_0$, width $2a$) perfectly transparent? Give $E_n$ for integer $n$.`,
          parts: [{ lbl: 'E_n', expr: 'n^2*pi^2*hbar^2/(8*m*a^2) - V0', vars: { n: [3, 6], hbar: [0.5, 2], m: [0.5, 2], a: [0.5, 2], V0: [0.1, 1] } }],
          hints: [md`$\sin^2(2a\ell) = 0 \Rightarrow 2a\ell = n\pi$, $\ell = \sqrt{2m(E + V_0)}/\hbar$.`],
          sol: md`$\tfrac{2a}{\hbar}\sqrt{2m(E + V_0)} = n\pi \Rightarrow E_n = \tfrac{n^2\pi^2\hbar^2}{8ma^2} - V_0$ (only $n$ large enough to make it positive). These are the infinite-well levels of width $2a$, measured from the well bottom.`,
        }),
        L(6, 'harder than the exam'),
        Q(md`A particle with $E < V_0$ hits a step. $R = 1$, yet $\psi \ne 0$ inside the step. Which is right?`,
          ['The evanescent wave is real but carries no current: probability goes in and comes back out', 'Some probability is lost inside the step, so R + T < 1', 'R = 1 is wrong; R < 1 because of the penetration', 'ψ inside the step is an artifact of the math and has no meaning'], 0,
          [null, 'Probability is conserved; nothing accumulates in a stationary state.', md`A real decaying exponential has $J = 0$: no transmitted flux.`, 'A thin-enough barrier of finite width would let it through, but an infinitely long step does not.'],
          md`$\psi = Ce^{-\kappa x}$ is real (up to a constant phase), so $J = 0$. Cut the step off after a width $L$ and that tail becomes tunneling.`),
        Q(md`You make a finite well deeper without changing its width. Its bound-state count…`,
          [md`grows by one each time $z_0$ passes a multiple of $\pi/2$`, 'stays the same; depth only shifts energies', 'doubles when the depth doubles', 'decreases, because the levels move down'], 0,
          [null, md`$z_0 \propto\sqrt{V_0}$ grows, adding branches.`, md`$z_0 \propto \sqrt{V_0}$, so doubling depth multiplies $z_0$ by $\sqrt2$, not the count by 2.`, 'Deeper wells hold more states.'],
          md`$N = \lceil 2z_0/\pi\rceil$ with $z_0 = \tfrac a\hbar\sqrt{2mV_0}$.`),
      ],
      bank: [
        Q(md`At a finite potential step, which must be continuous?`, [md`both $\psi$ and $\psi'$`, md`only $\psi$`, md`only $\psi'$`, 'neither'], 0,
          [null, 'ψ′ also, for finite V.', 'ψ always.', 'Both.'], md`$\psi''$ jumps, so $\psi'$ is continuous.`),
        Q(md`Tunneling probability through a thick barrier depends on width $L$ roughly as…`, [md`$e^{-2\kappa L}$`, md`$1/L$`, md`$1/L^2$`, md`$e^{-\kappa L}$`], 0,
          [null, 'Much faster.', 'Much faster.', md`$\psi$ decays as $e^{-\kappa L}$; probability is its square.`], 'Amplitude decays as e^{−κL}.'),
        Q(md`In the deep-well limit the finite-well energies approach those of…`, [md`an infinite well of width $2a$`, md`an infinite well of width $a$`, 'a free particle', 'a harmonic oscillator'], 0,
          [null, 'The well spans −a to a.', 'Deep wells confine.', 'Square bottom, not parabolic.'], md`Crossings at $z \approx n\pi/2$.`),
        Q(md`Scattering states of the finite well have…`, ['any E > 0, and are not normalizable', 'discrete E > 0', 'E < 0', 'E > V₀ only'], 0,
          [null, 'Continuous.', 'Those are bound.', 'No step up here; any positive E.'], 'Continuum above the rim.'),
        Q(md`Increasing $E$ (still below $V_0$) for a fixed barrier makes tunneling…`, ['more likely', 'less likely', 'unchanged', 'impossible'], 0,
          [null, md`$\kappa$ shrinks as $E \to V_0$.`, 'κ depends on E.', 'Always possible for finite barriers.'], md`$\kappa = \sqrt{2m(V_0 - E)}/\hbar$ decreases.`),
      ],
    },
  );
})();

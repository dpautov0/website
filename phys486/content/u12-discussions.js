/* Midterm 2, Unit 6 — Discussions 5–8, worked. Discussion problems are conceptual: each page explains the idea behind
   every part (optional parts included), gives the solution behind a reveal button, then drills the same ideas. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const T = (n, id) => `[Topic ${n}](#/l/${id})`;
  const paper = (title, date, items) => ({ t: 'paper', html: `<div class="pp-title"><span>${title}</span><span>${date}</span></div>`, items });
  const drill = R(md`
    ### Practice: same ideas, new setups

    Answer each part above out loud or on paper before revealing it. Discussion problems test whether you can explain, and so does the exam: Midterm 1's lowest-scoring parts were the explanations.
  `);

  // ---------------------------------------------------------------- figures
  const N0 = Math.pow(Math.PI, -0.25);
  // normalized oscillator eigenfunctions in xi by the recurrence psi_{n+1} = sqrt(2/(n+1)) xi psi_n - sqrt(n/(n+1)) psi_{n-1}
  const psiN = (n, x) => {
    let a = N0 * Math.exp(-x * x / 2), b = N0 * Math.SQRT2 * x * Math.exp(-x * x / 2);
    if (n === 0) return a;
    for (let k = 1; k < n; k++) { const c = Math.sqrt(2 / (k + 1)) * x * b - Math.sqrt(k / (k + 1)) * a; a = b; b = c; }
    return b;
  };
  // Discussion 5: the half oscillator, surviving states sqrt2*psi_1, sqrt2*psi_3, sqrt2*psi_5 at 3/2, 7/2, 11/2
  const halfFig = PF.plot({
    w: 340, h: 260, x: [-0.8, 4.4], y: [0, 6.6], xl: '\\xi', yl: 'E/\\hbar\\omega',
    yt: [[1.5, '\\tfrac32'], [3.5, '\\tfrac72'], [5.5, '\\tfrac{11}2']],
    hlines: [[1.5, ''], [3.5, ''], [5.5, '']],
    curves: [
      { pts: [[0, 0], [0, 6.6]] },
      { f: (x) => x * x / 2, from: 0, cls: 'dim' },
      { f: (x) => 1.5 + 0.6 * Math.SQRT2 * psiN(1, x), from: 0 },
      { f: (x) => 3.5 + 0.6 * Math.SQRT2 * psiN(3, x), from: 0 },
      { f: (x) => 5.5 + 0.6 * Math.SQRT2 * psiN(5, x), from: 0 },
    ],
  });
  // Discussion 6: |psi_10|^2 against the classical probability density (turning points at sqrt 21)
  const xt = Math.sqrt(21);
  const corrFig = PF.plot({
    w: 380, h: 220, x: [-6.2, 6.2], y: [0, 0.32], xl: '\\xi', yl: '\\text{density}',
    vlines: [[-xt, '-\\xi_t'], [xt, '\\xi_t']],
    curves: [
      { f: (x) => psiN(10, x) ** 2, n: 600 },
      { f: (x) => 1 / (Math.PI * Math.sqrt(21 - x * x)), from: -xt + 0.02, to: xt - 0.02, cls: 'dash dim', n: 400 },
    ],
  });
  const circle = (cx, cy, r, n = 120) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);
  // Discussion 6: orbit of (<x>, <p>) for (|0> + e^{i(pi/4 - wt)}|1>)/sqrt2 in units sqrt(hbar/2m w), sqrt(hbar m w/2)
  const orbit6 = PF.plot({
    w: 280, h: 280, x: [-1.7, 1.7], y: [-1.7, 1.7], zero: true, xl: '\\langle x\\rangle', yl: '\\langle p\\rangle',
    curves: [{ pts: circle(0, 0, 1) }],
    pts: [{ x: Math.SQRT1_2, y: Math.SQRT1_2, lab: 't=0' }, { x: 1, y: 0, lab: '\\omega t=\\pi/4' }],
  });
  // Discussion 7: symmetric-top levels E/(hbar^2/2I) = l(l+1) - eps m^2/(1+eps)
  const rotorFig = PF.plot({
    w: 360, h: 270, x: [-0.3, 0.3], y: [-0.4, 8], xl: '\\epsilon', yl: 'E/(\\hbar^2/2I)',
    xt: [[-0.2, '-0.2'], [0, '0'], [0.2, '0.2']], yt: [[0, '0'], [2, '2'], [6, '6']],
    curves: [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2]].map(([l, m]) => ({
      f: (e) => l * (l + 1) - e * m * m / (1 + e), cls: m ? '' : 'dim', lab: `\\ell=${l},\\,|m|=${m}`, labAt: 0.3,
    })),
  });
  // Discussion 8: hydrogen effective potentials in units |E_1|, r in units of a
  const veffFig = PF.plot({
    w: 380, h: 260, x: [0, 16], y: [-1.3, 0.7], zero: true, xl: 'r/a', yl: 'V_{\\text{eff}}/|E_1|',
    xt: [[2, '2'], [6, '6'], [12, '12']], hlines: [[-0.25, 'E_2']],
    curves: [0, 1, 2].map((l) => ({ f: (r) => -2 / r + l * (l + 1) / (r * r), from: 0.05, lab: `\\ell=${l}`, labAt: l === 0 ? 1.8 : l === 1 ? 1.2 : 3.4, dy: l === 0 ? 10 : -8 })),
  });
  // Discussion 8: hydrogen radial functions scaled to their largest value; only s states are nonzero at r = 0
  const Rnl = [
    { lab: '1s', f: (r) => Math.exp(-r) },
    { lab: '2s', f: (r) => (1 - r / 2) * Math.exp(-r / 2) },
    { lab: '2p', f: (r) => r * Math.exp(-r / 2) / (2 / Math.E) },
    { lab: '3d', f: (r) => r * r * Math.exp(-r / 3) / (36 * Math.exp(-2)) },
  ];
  const radFig = PF.plot({
    w: 380, h: 240, x: [0, 16], y: [-0.25, 1.1], zero: true, xl: 'r/a', yl: 'R_{n\\ell}/\\max',
    curves: Rnl.map((c, i) => ({ f: c.f, cls: i % 2 ? 'dim' : '', lab: c.lab, labAt: [1.5, 7, 3.5, 10][i], dy: [-10, 10, -10, -12][i] })),
  });

  C.unit({
    id: 'u12', exam: 'm2', num: 'Unit 6', title: 'Discussions 5–8, worked',
    blurb: 'Every Discussion 5–8 part, optional ones included: the idea behind it, the solution, and practice.',
    lessons: [
      // ------------------------------------------------------------------ D5
      {
        id: 'disc5', title: 'Discussion 5: reading a state from measurements; the half oscillator',
        steps: [
          R(md`
            **Trains:** oscillator expectation values with ladder operators (${T(13, 't13-ladder')}, ${T(15, 't15-shomotion')}), what different measurements can and cannot reveal about a state, and reusing solved potentials (${T(14, 't14-showave')}).

            **The two ideas:**
            1. **Diagonal vs off-diagonal.** $\hat H$ connects $\ket n$ only to itself, so $\langle H\rangle$ sees only $|c_n|^2$. $\hat x$ and $\hat p$ connect $\ket n$ to $\ket{n\pm1}$, so $\langle x\rangle$, $\langle p\rangle$ are **interference** terms $c_n^*c_{n+1}$: they are where the relative phases show up.
            2. **Same equation, new boundary condition.** A new potential that agrees with a solved one in some region inherits its solutions there; the boundary conditions decide which survive.
          `),
          paper('PHYS 486 · Discussion 5', '10/1', [
            {
              q: md`**1 (a). Warmup (Merzbacher).** At $t = 0$ the oscillator is in $\ket{\psi(0)} = c_0\ket0 + c_1\ket1$. Someone hands you a measurement of $\langle\hat H\rangle = \hbar\omega$. What can you learn about the state?`,
              ans: md`$|c_0|^2 = |c_1|^2 = \tfrac12$, so $\ket{\psi(0)} = \tfrac{1}{\sqrt2}\left(e^{i\theta_0}\ket0 + e^{i\theta_1}\ket1\right)$: the probabilities, nothing about the phases.`,
              sol: md`
                **How to see it.** $\langle H\rangle$ is a weighted average of $\tfrac12\hbar\omega$ and $\tfrac32\hbar\omega$; $\hbar\omega$ sits exactly halfway, so equal weights. Two equations (average, normalization) for two unknowns $|c_0|^2$, $|c_1|^2$.

                $\hat H\ket\psi = c_0E_0\ket0 + c_1E_1\ket1$, so $\bra\psi\hat H\ket\psi = \tfrac{\hbar\omega}{2}|c_0|^2 + \tfrac{3\hbar\omega}{2}|c_1|^2 = \hbar\omega$, i.e. $|c_0|^2 + 3|c_1|^2 = 2$. With $|c_0|^2 + |c_1|^2 = 1$: $|c_0|^2 = |c_1|^2 = \tfrac12$.
                $$\ket{\psi(0)} = \frac{1}{\sqrt2}e^{i\theta_0}\ket0 + \frac{1}{\sqrt2}e^{i\theta_1}\ket1$$
                The energy measurement says **nothing about the phases** $\theta_0$, $\theta_1$: $\hat H$ is diagonal, so no cross terms appear in $\langle H\rangle$.
              `,
            },
            {
              q: md`**1 (b).** Choose the global phase so $c_0$ is real and positive; $c_1 = |c_1|e^{i\theta_1}$. At $t = 0$ the average position is measured to be $\tfrac12\sqrt{\hbar/m\omega}$. Find $\theta_1$. What does $\langle\hat p\rangle$ add?`,
              ans: md`$\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cos\theta_1$, so $\cos\theta_1 = \tfrac{1}{\sqrt2}$, $\theta_1 = \pm\tfrac\pi4$. $\langle p\rangle = \sqrt{\tfrac{\hbar m\omega}{2}}\sin\theta_1 = \pm\tfrac12\sqrt{\hbar m\omega}$: its sign (the direction of motion) picks the sign of $\theta_1$.`,
              sol: md`
                **How to see it.** $\hat x$ takes $\ket0 \leftrightarrow \ket1$, so $\langle x\rangle \propto \text{Re}(c_0^*c_1) \propto \cos\theta_1$: the relative phase is visible now, but $\cos$ can't tell $\theta$ from $-\theta$. $\langle p\rangle \propto \sin\theta_1$ can.

                $$\hat x\ket\psi = \frac{1}{\sqrt2}\sqrt{\frac{\hbar}{2m\omega}}\left(e^{i\theta_1}\ket0 + \ket1 + e^{i\theta_1}\sqrt2\ket2\right)$$
                using $\hat a_-\ket0 = 0$, $\hat a_+\ket0 = \ket1$, $\hat a_-\ket1 = \ket0$, $\hat a_+\ket1 = \sqrt2\ket2$. Multiply by $\bra\psi = \tfrac{1}{\sqrt2}(\bra0 + e^{-i\theta_1}\bra1)$:
                $$\langle x\rangle = \frac12\sqrt{\frac{\hbar}{2m\omega}}\left(e^{i\theta_1} + e^{-i\theta_1}\right) = \sqrt{\frac{\hbar}{2m\omega}}\cos\theta_1$$
                Set equal to $\tfrac12\sqrt{\hbar/m\omega} = \sqrt{\hbar/4m\omega}$: $\cos\theta_1 = 1/\sqrt2$, $\theta_1 = \pm\pi/4$ $(+2\pi n)$. Two interference patterns fit the data.

                **Why $\theta_1$ appears in $\langle x\rangle$ but not $\langle H\rangle$:** $\langle x\rangle$ is built entirely from the interference between $\ket0$ and $\ket1$; $\hat H$ connects each state only to itself.

                **Momentum** in the same way: $\langle p\rangle = \sqrt{\tfrac{\hbar m\omega}{2}}\sin\theta_1 = \pm\tfrac12\sqrt{\hbar m\omega}$. The sign of $\theta_1$ is the **direction of motion**. $\langle H\rangle$, $\langle x\rangle$ and the sign of $\langle p\rangle$ together reconstruct the state completely.
              `,
            },
            {
              q: md`**1 (c).** Find $\ket{\psi(t)}$ (with $\theta_1 = \pi/4$). Does the global phase change with time? The relative phase?`,
              ans: md`$\ket{\psi(t)} = \dfrac{e^{-i\omega t/2}}{\sqrt2}\left(\ket0 + e^{i(\pi/4 - \omega t)}\ket1\right)$. The global phase $e^{-i\omega t/2}$ changes but is unobservable; the relative phase $\theta_1(t) = \tfrac\pi4 - \omega t$ is what moves.`,
              sol: md`
                **How to see it.** Each level spins at its own rate $E_n/\hbar$. Factor out the slowest one; what's left is the relative phase, spinning at the **difference** $\omega$.

                $$\ket{\psi(t)} = \frac{1}{\sqrt2}\left(e^{-i\omega t/2}\ket0 + e^{i\pi/4}e^{-3i\omega t/2}\ket1\right) = \frac{e^{-i\omega t/2}}{\sqrt2}\left(\ket0 + e^{i(\pi/4 - \omega t)}\ket1\right)$$
                The global phase "changes", but no measurement can see it. The physical change is $\theta_1(t) = \theta_1 - \omega t$, which drives $\langle x\rangle(t) = \sqrt{\tfrac{\hbar}{2m\omega}}\cos(\tfrac\pi4 - \omega t)$: the state oscillates at the classical frequency.
              `,
            },
            {
              q: md`**2 (d). Half-harmonic potential (Shankar).** $V = \tfrac12m\omega^2x^2$ for $x > 0$, $V = \infty$ for $x \le 0$. What boundary conditions must $\psi$ satisfy?`,
              ans: md`$\psi = 0$ for $x \le 0$, so $\psi(0) = 0$ by continuity; $\psi'$ may jump at the wall (as in the infinite well); $\psi \to 0$ fast enough at $+\infty$ to be normalizable.`,
              sol: md`
                **How to see it.** An infinite wall is the infinite square well's edge: $\psi$ must vanish there, and the usual $\psi'$ condition is dropped because $V$ jumps by infinity (integrating the Schrödinger equation across the wall, $\int V\psi$ need not vanish).

                The particle cannot be where $V = \infty$: $\psi = 0$ for $x \le 0$. Continuity of $\psi$ gives $\psi(0) = 0$. For $x > 0$ we also need $\psi \to 0$ at large $x$ so that $\psi$ is normalizable.
              `,
            },
            {
              q: md`**2 (e).** Find the stationary states and energies using the ordinary oscillator's $\psi_n$. Which full-line eigenstates survive? What normalization do they need? New ground-state energy and level spacing; is there still a state at $\hbar\omega/2$? How do the allowed momentum values change, compared with $x$?`,
              ans: md`Only the odd $\psi_{2k+1}$ survive, as $\sqrt2\,\psi_{2k+1}$ on $x > 0$. $E_k = \hbar\omega\left(2k + \tfrac32\right)$: ground state $\tfrac32\hbar\omega$, spacing $2\hbar\omega$, no state at $\tfrac12\hbar\omega$. Squeezing the particle into half the space raises $\sigma_p$, hence the energy.`,
              sol: md`
                **How to see it.** For $x > 0$ the equation is the full oscillator's, so solutions there are the $\psi_n$. The full oscillator is symmetric, so its $\psi_n$ are even or odd; the odd ones already vanish at 0. The new wall is "free" for them.

                [[fig:half]]

                - **Survivors.** $\psi(0) = 0$ requires odd $n$: $\psi_1, \psi_3, \ldots$ (every even $\psi_n$ has $\psi_n(0) \ne 0$). For $x > 0$, $\psi_k^{\text{half}} = A\psi_{2k+1}(x)$, $k = 0, 1, 2, \ldots$
                - **Normalization.** Half of the probability was in $x < 0$ and is discarded: $A = \sqrt2$.
                - **Energies.** The survivors keep their energies, since they solve the same equation for $x > 0$: $E_k = \hbar\omega(2k + 1 + \tfrac12) = \hbar\omega(2k + \tfrac32)$. Ground state $\tfrac32\hbar\omega$, spacing $2\hbar\omega$ (every other level is gone). **No state at $\tfrac12\hbar\omega$**: the old ground state was even.
                - **Momentum.** The wall confines the particle to half the space: $\sigma_x$ drops, so $\sigma_p$ rises, and the kinetic (zero-point) energy goes up. That is why the ground energy tripled.
              `,
              figs: { half: { svg: halfFig, cap: 'The half oscillator: only the odd states of the full oscillator fit, renormalized by $\\sqrt2$. Levels at $\\tfrac32$, $\\tfrac72$, $\\tfrac{11}2\\,\\hbar\\omega$, spacing $2\\hbar\\omega$.' } },
            },
          ]),
          R(md`
            **Where this shows up on the exam.** "Someone measures $\langle H\rangle$ and $\langle x\rangle$; what do you know about the state?" is a natural Midterm 2 part: it tests exactly the diagonal/off-diagonal idea and rewards a one-sentence explanation. The half oscillator is the model "new potential from an old one" problem: name the survivors, renormalize, read off energies, explain physically.
          `),
          drill,
          P({
            title: 'Weights from the average energy',
            q: md`A state $c_0\ket0 + c_1\ket1$ has $\langle H\rangle = 1.2\hbar\omega$. Find $|c_1|^2$ and $|c_0|^2$.`,
            parts: [{ lbl: '|c_1|^2', ans: 0.7 }, { lbl: '|c_0|^2', ans: 0.3 }],
            hints: [md`$\langle H\rangle = \tfrac12\hbar\omega + |c_1|^2\hbar\omega$.`],
            sol: md`$\tfrac12 + |c_1|^2 = 1.2$, so $|c_1|^2 = 0.7$, $|c_0|^2 = 0.3$.`,
          }),
          P({
            title: 'Phase from the average position',
            q: md`For $\tfrac{1}{\sqrt2}(\ket0 + e^{i\theta}\ket1)$, $\langle x\rangle$ is measured as $0.3\sqrt{\hbar/m\omega}$. Find $\cos\theta$.`,
            parts: [{ lbl: '\\cos\\theta', ans: 0.3 * Math.SQRT2 }],
            hints: [md`$\langle x\rangle = \sqrt{\hbar/2m\omega}\cos\theta$.`],
            sol: md`$\cos\theta = 0.3\sqrt2 = 0.424$. Still two solutions $\pm\theta$; the sign of $\langle p\rangle$ decides.`,
          }),
          P({
            title: 'Half oscillator: levels and position',
            q: md`For the half oscillator, find the energy of the second excited state in units of $\hbar\omega$, and $\langle x\rangle$ in the ground state in units of $\sqrt{\hbar/m\omega}$.`,
            parts: [{ lbl: 'E_2/\\hbar\\omega', ans: 5.5 }, { lbl: '\\langle x\\rangle', ans: 2 / Math.sqrt(Math.PI) }],
            hints: [md`$E_k = \hbar\omega(2k + \tfrac32)$. Ground state $\sqrt2\,\psi_1$ on $x > 0$ with $\psi_1^2 = \tfrac{2}{\sqrt\pi}\xi^2e^{-\xi^2}$ (in $\xi$ units); $\int_0^\infty\xi^3e^{-\xi^2}d\xi = \tfrac12$.`],
            sol: md`$E_2 = \tfrac{11}{2}\hbar\omega$. $\langle x\rangle = 2\int_0^\infty\xi\cdot\tfrac{2}{\sqrt\pi}\xi^2e^{-\xi^2}d\xi = \tfrac{4}{\sqrt\pi}\cdot\tfrac12 = \tfrac{2}{\sqrt\pi} = 1.13$ units. (And $\langle x^2\rangle = \tfrac32\tfrac{\hbar}{m\omega}$, the same as $\psi_1$ on the full line, since $x^2\psi_1^2$ is even.)`,
          }),
          Q(md`Which single extra measurement settles the sign ambiguity $\theta_1 = \pm\pi/4$ in 1(b)?`, [md`The sign of $\langle p\rangle$`, md`$\langle H^2\rangle$`, md`$\langle x^2\rangle$`, md`$\langle x\rangle$ again, one full period $2\pi/\omega$ later`], 0,
            [null, md`$\hat H^2$ is diagonal too: only $|c_n|^2$.`, md`$\hat x^2$ connects $n \to n, n\pm2$: no $(0, 1)$ cross term.`, md`After a full period the state is back where it started (up to a global phase): the same $\cos\theta_1$, no new information.`],
            md`$\langle p\rangle \propto \sin\theta_1$. (Watching whether $\langle x\rangle$ grows or shrinks right after $t = 0$ is the same information: $m\,d\langle x\rangle/dt = \langle p\rangle$.)`),
          Q(md`The global phase of $\ket{\psi(t)}$ turns as $e^{-i\omega t/2}$. Could any measurement detect it?`, ['No: every probability and expectation value involves |ψ⟩ and ⟨ψ| together, so it cancels', 'Yes, as the zero-point energy', 'Yes, by interference with itself', 'Only in an energy measurement'], 0,
            [null, md`The zero-point energy shifts all levels equally; only differences are observable.`, 'A state interferes between its components; a common factor multiplies all of them.', md`Energy probabilities are $|c_n|^2$: phase-blind.`],
            'Global phases cancel in |ψ|² and in every ⟨Q⟩.'),
          Q(md`A wall is placed at $x = 0$ in an oscillator, but on the **left** the potential stays $\tfrac12m\omega^2x^2$ while on the right it is $\infty$. The ground-state energy is…`, [md`$\tfrac32\hbar\omega$, same as with the wall on the other side`, md`$\tfrac12\hbar\omega$`, md`$\tfrac34\hbar\omega$`, md`$3\hbar\omega$`], 0,
            [null, md`The even states don't vanish at the wall.`, 'Energies of the full oscillator, not halves.', md`The problem is the mirror image: same spectrum.`],
            'By symmetry it is the same problem reflected: odd states only.'),
        ],
      },

      // ------------------------------------------------------------------ D6
      {
        id: 'disc6', title: 'Discussion 6: when is the oscillator classical? Turning points and phase space',
        steps: [
          R(md`
            **Trains:** the classical limit of the oscillator and phase-space pictures (${T(15, 't15-shomotion')}, ${T(16, 't16-coherent')}), oscillator wavefunctions beyond the turning point (${T(14, 't14-showave')}).

            **The two scales the oscillator supplies:** an energy, $\hbar\omega$ (the level spacing), and a length, $w_x = \sqrt{\hbar/m\omega}$ (the ground-state width). Classical means large compared with both. The trap this discussion is about: **expectation values that move classically do not make a system classical.**
          `),
          paper('PHYS 486 · Discussion 6', '10/15', [
            {
              q: md`**1 (a). Classical or quantum?** (i) An oscillator has energy $E$: $E$ must be much greater than what for a classical description? (ii) Its amplitude $x_0$ must be much greater than what length? (iii) With $E = \tfrac12m\omega^2x_0^2 = \hbar\omega(n + \tfrac12)$, show $x_0/w_x = \sqrt{2n + 1}$. (iv) Is $\ket{\psi(t)} = \tfrac{e^{-i\omega t/2}}{\sqrt2}\left(\ket0 + e^{i\theta_1(t)}\ket1\right)$, $\theta_1 = \tfrac\pi4 - \omega t$, classical or quantum?`,
              ans: md`(i) $E \gg \hbar\omega$, i.e. $n \gg 1$. (ii) $x_0 \gg w_x = \sqrt{\hbar/m\omega}$. (iii) $x_0^2 = \tfrac{2E}{m\omega^2} = (2n + 1)\tfrac{\hbar}{m\omega}$. (iv) Quantum: $\langle H\rangle = \hbar\omega$, $n \sim 1$.`,
              sol: md`
                **How to see it.** Discreteness is invisible when the steps are tiny compared with what you have; fuzziness is invisible when the blur is tiny compared with the motion. The oscillator provides one step size and one blur size.

                **(i)** The only energy the oscillator supplies is the spacing $\hbar\omega$. If $E \gg \hbar\omega$, the levels are too finely spaced to resolve: the spectrum looks continuous. Since $E_n \approx n\hbar\omega$, this is $n \gg 1$.

                **(ii)** The only length is $w_x = \sqrt{\hbar/m\omega}$, the spread of the ground state. If $x_0 \gg w_x$, the quantum blur is negligible compared with the swing.

                **(iii)** $\tfrac12m\omega^2x_0^2 = \hbar\omega(n + \tfrac12) \Rightarrow x_0^2 = (2n + 1)\tfrac{\hbar}{m\omega} = (2n + 1)w_x^2$. So $x_0 \gg w_x \iff n \gg 1$: the two criteria are the same.

                **(iv)** $\langle H\rangle = \hbar\omega$ ($n$ is 0 or 1), and the swing of $\langle x\rangle$ is $\sqrt{\hbar/2m\omega} = w_x/\sqrt2$: **quantum** by either criterion.
              `,
            },
            {
              q: md`**1 (b). Turning points.** (i) Find the classical turning point $x_n$ for energy $E_n$, in units of $w_x$. (ii) What happens to the kinetic energy beyond $x_n$?`,
              ans: md`(i) $x_n = \sqrt{2n + 1}\,w_x$. (ii) It would be negative: classically forbidden. Quantum mechanically $\psi_n$ leaks past $x_n$ and decays exponentially.`,
              sol: md`
                **How to see it.** At the turning point all the energy is potential: $\tfrac12m\omega^2x_n^2 = E_n$.

                **(i)** $x_n = \sqrt{2E_n/m\omega^2} = \sqrt{2n + 1}\,w_x$ (same as (iii)).

                **(ii)** $K = E - V < 0$ for $|x| > x_n$: impossible classically; energy would have to be supplied from outside. Quantum mechanically the wavefunction does extend there, curving away from the axis and decaying like $e^{-\xi^2/2}$: there is a small but nonzero probability of finding the particle beyond the turning point (about 16% for $n = 0$).

                **Correspondence.** For large $n$, $|\psi_n|^2$ wiggles around the classical density $P_{\text{cl}}(x) = \dfrac{1}{\pi\sqrt{x_n^2 - x^2}}$: the particle spends the most time near the turning points, where it moves slowest. Averaged over the wiggles they agree; for $n = 0$ they look nothing alike (the quantum ground state peaks in the middle).

                [[fig:corr]]
              `,
              figs: { corr: { svg: corrFig, cap: '$|\\psi_{10}|^2$ (solid) against the classical density for the same energy (dashed), $\\xi_t = \\sqrt{21}$. The quantum density oscillates about the classical one and leaks past the turning points.' } },
            },
            {
              q: md`**1 (c), part 1.** For the state in (a)(iv): find $\langle\hat p\rangle$. Plot $(\langle x\rangle, \langle p\rangle)$ as a function of $t$: shape, direction, period? Find $\tfrac{d\langle x\rangle}{dt}$ and $\tfrac{d\langle p\rangle}{dt}$ in terms of each other: what classical equations are these?`,
              ans: md`$\langle p\rangle = \sqrt{\tfrac{\hbar m\omega}{2}}\sin\theta_1(t)$. An ellipse $\left(\tfrac{\langle x\rangle}{A}\right)^2 + \left(\tfrac{\langle p\rangle}{m\omega A}\right)^2 = 1$, $A = \sqrt{\tfrac{\hbar}{2m\omega}}$, clockwise, period $2\pi/\omega$. $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$, $\tfrac{d\langle p\rangle}{dt} = -m\omega^2\langle x\rangle$: Hooke's law (Ehrenfest).`,
              sol: md`
                **How to see it.** $\langle x\rangle \propto \cos\theta_1$ and $\langle p\rangle \propto \sin\theta_1$ with $\theta_1$ decreasing at rate $\omega$: a point going around an ellipse, the wrong way for a math angle (clockwise).

                $$\hat p\ket{\psi(t)} = i\sqrt{\frac{\hbar m\omega}{2}}\frac{e^{-i\omega t/2}}{\sqrt2}\left(\ket1 + e^{i\theta_1}\sqrt2\ket2 - e^{i\theta_1}\ket0\right)\ \Rightarrow\ \langle p\rangle = i\sqrt{\frac{\hbar m\omega}{2}}\cdot\frac12\left(e^{-i\theta_1} - e^{i\theta_1}\right) = \sqrt{\frac{\hbar m\omega}{2}}\sin\theta_1(t)$$
                [[fig:orbit]]
                - **Shape:** with $\langle x\rangle = A\cos\theta_1$, $\langle p\rangle = m\omega A\sin\theta_1$: an ellipse.
                - **Start:** $\theta_1 = \pi/4$: upper right, $(1/\sqrt2, m\omega/\sqrt2)A$.
                - **Direction:** $\tfrac{d\langle x\rangle}{dt} = A\omega\sin\theta_1 > 0$ at $t = 0$: moving toward $+x$ while in the upper half, so **clockwise**.
                - **Period** $2\pi/\omega$, the classical period.

                **Equations of motion:** $\tfrac{d\langle x\rangle}{dt} = -A\sin\theta_1\cdot\dot\theta_1 = A\omega\sin\theta_1 = \tfrac{\langle p\rangle}{m}$ and $\tfrac{d\langle p\rangle}{dt} = -m\omega^2A\cos\theta_1 = -m\omega^2\langle x\rangle$. A classical spring, $\dot x = p/m$, $\dot p = -kx$, as Ehrenfest guarantees.
              `,
              figs: { orbit: { svg: orbit6, cap: 'The orbit in units $\\sqrt{\\hbar/2m\\omega}$ and $\\sqrt{\\hbar m\\omega/2}$: a unit circle, entered at the upper right and run clockwise.' } },
            },
            {
              q: md`**1 (c), part 2.** What are $\langle x\rangle$ and $\langle p\rangle$ for a single $\ket n$? What does that say about stationary states vs superpositions? Write the orbital radius in terms of $w_x$: classical or quantum regime? How would you change the state to make the orbit larger?`,
              ans: md`$\langle x\rangle = \langle p\rangle = 0$ for every $\ket n$: the orbit is a point at the origin. Here the radius is $A = w_x/\sqrt2$: quantum regime, though the curve looks classical. A larger orbit needs many levels with well-defined relative phases (a coherent state).`,
              sol: md`
                **How to see it.** Motion = interference between neighbors. One level, no neighbors, no motion.

                - $\hat x$ and $\hat p$ connect $\ket n$ only to $\ket{n\pm1}$, so $\bra n\hat x\ket n = \bra n\hat p\ket n = 0$. A stationary state's "orbit" is a point at the origin for all $t$, however high $n$ is.
                - $A = \sqrt{\hbar/2m\omega} = w_x/\sqrt2$: the orbit is smaller than the ground-state width. By (a) that is the **quantum** regime, even though $(\langle x\rangle, \langle p\rangle)$ traces the classical curve. "The expectation values behave classically" and "the system is classical" are different claims.
                - **Bigger orbit:** populate many levels $\ket n$ with locked relative phases, so the $c_n^*c_{n+1}$ terms add up. The best such state is the coherent state, whose orbit radius is $\sqrt{2}|\alpha|$ times the ground width while its blur stays at the ground width.
              `,
            },
          ]),
          R(md`
            **Where this shows up on the exam.** Any oscillator problem can end with "sketch the orbit in phase space", "which direction", "is this motion classical? justify". The justification the rubric wants is a comparison of two numbers: the orbit size vs $w_x$ (or $n$ vs 1).
          `),
          drill,
          P({
            title: 'Amplitude in ground widths',
            q: md`A classical oscillator has the energy of level $n = 12$. Find $x_0/w_x$.`,
            parts: [{ lbl: 'x_0/w_x', ans: 5 }],
            hints: [md`$x_0/w_x = \sqrt{2n + 1}$.`],
            sol: md`$\sqrt{25} = 5$.`,
          }),
          P({
            title: 'How excited is a pendulum?',
            q: md`A 0.1 kg mass on a spring with $\omega = 10$ rad/s swings with amplitude 1 cm. Estimate $n$ and the ground-state width $w_x$ in meters.`,
            parts: [{ lbl: 'n', ans: 5e-4 / (1.0546e-34 * 10) }, { lbl: 'w_x', ans: Math.sqrt(1.0546e-34 / 1), unit: 'm' }],
            hints: [md`$E = \tfrac12m\omega^2x_0^2$, $n \approx E/\hbar\omega$.`],
            sol: md`$E = \tfrac12(0.1)(100)(10^{-4}) = 5\times10^{-4}$ J, $n \approx \tfrac{5\times10^{-4}}{1.055\times10^{-33}} = 4.7\times10^{29}$. $w_x = \sqrt{\hbar/m\omega} = \sqrt{1.055\times10^{-34}} = 1.0\times10^{-17}$ m: fifteen orders of magnitude below the amplitude. Utterly classical.`,
          }),
          P({
            title: 'Classical time in the middle',
            q: md`A classical oscillator with amplitude $x_0$: what fraction of the time does it spend with $|x| < x_0/2$?`,
            parts: [{ lbl: '\\text{fraction}', ans: 1 / 3 }],
            hints: [md`$\int_{-x_0/2}^{x_0/2}\dfrac{dx}{\pi\sqrt{x_0^2 - x^2}} = \tfrac2\pi\arcsin\tfrac12$.`],
            sol: md`$\tfrac2\pi\cdot\tfrac\pi6 = \tfrac13$. Half the range, a third of the time: it lingers near the turning points. The ground state does the opposite (peaked in the middle).`,
          }),
          Q(md`For $\tfrac{1}{\sqrt2}(\ket0 + e^{-i\pi/4}\ket1)$, the phase-space orbit of $(\langle x\rangle, \langle p\rangle)$ starts at the lower right and runs…`, ['clockwise', 'counterclockwise', 'back and forth on a line', 'it does not move'], 0,
            [null, md`Every oscillator orbit runs clockwise (with $p$ up): $p > 0$ means moving right.`, md`$\langle p\rangle$ and $\langle x\rangle$ are both nonzero and out of phase: an ellipse.`, 'Two adjacent levels: it moves.'],
            md`The starting phase only picks the starting point. $\dot{\langle x\rangle} = \langle p\rangle/m$ fixes the direction for every state.`),
          P({
            title: 'Fastest average momentum',
            q: md`For $\tfrac{1}{\sqrt2}(\ket0 + e^{i\theta}\ket1)$, find the largest $|\langle p\rangle|$ over time, in units of $\sqrt{\hbar m\omega}$.`,
            parts: [{ lbl: '|\\langle p\\rangle|_{\\max}', ans: Math.SQRT1_2 }],
            hints: [md`$\langle p\rangle = \sqrt{\hbar m\omega/2}\sin\theta(t)$.`],
            sol: md`$\sqrt{1/2} = 0.707$. Compare the ground-state momentum spread $\sigma_p = \sqrt{\hbar m\omega/2}$: the same size. The average swings by about one width.`,
          }),
          Q(md`"In this state $\langle x\rangle(t)$ and $\langle p\rangle(t)$ obey Hooke's law exactly, so the particle behaves classically." Evaluate.`, ['False: Ehrenfest holds in every state; classical needs the spread to be small compared with the orbit', 'True: that is the correspondence principle', 'True, but only for large n', 'False: Ehrenfest fails for superpositions'], 0,
            [null, 'The correspondence principle needs large quantum numbers, not just Ehrenfest.', md`Ehrenfest is exact for every $n$; "large $n$" is about the spread, which the statement ignores.`, 'Ehrenfest holds for any state.'],
            md`For the oscillator Ehrenfest is exact for **any** state (even $\ket n$, trivially). A single measurement in this state scatters over a region bigger than the orbit.`),
        ],
      },
      // ------------------------------------------------------------------ D7
      {
        id: 'disc7', title: 'Discussion 7: one sharp component, successive measurements, the rotor',
        steps: [
          R(md`
            **Trains:** commutators of $\hat{\mathbf L}$ and compatibility (${T(18, 't18-Lalgebra')}), spherical harmonics and measuring $L_z$, $L_x$ (${T(19, 't19-Ylm')}), symmetry and degeneracy.

            **Useful facts.** $\hat L^2Y_\ell^m = \hbar^2\ell(\ell+1)Y_\ell^m$, $\hat L_zY_\ell^m = \hbar mY_\ell^m$; $Y_0^0 = \tfrac{1}{\sqrt{4\pi}}$, $Y_1^0 = \sqrt{\tfrac{3}{4\pi}}\cos\theta$, $Y_1^{\pm1} = \mp\sqrt{\tfrac{3}{8\pi}}\sin\theta\,e^{\pm i\phi}$. In Cartesian form, $\ell = 1$ is just $z/r$, $(x \pm iy)/r$.

            **The three ideas:**
            1. Non-commuting components can't be sharp together (except in the trivial $\ell = 0$ state).
            2. A measurement leaves the state in an eigenstate of **what was measured**, and erases sharp values of anything that doesn't commute with it.
            3. Degeneracy is symmetry: every symmetry of $\hat H$ you remove splits levels, and the degeneracy that survives tells you which symmetry is left.
          `),
          paper('PHYS 486 · Discussion 7', '10/22', [
            {
              q: md`**1 (a). How many components can be sharp?** Suppose $\psi$ is an eigenfunction of both $\hat L_z$ and $\hat L_x$ (eigenvalues $\lambda_z$, $\lambda_x$). Apply $[\hat L_z, \hat L_x]$ to show $\hat L_y\psi = 0$; then show $\lambda_x = 0$ and $\lambda_z = 0$. Which $\ell$ must $\psi$ have? Conclude how many components can be sharp at once, and why $\hat L^2$ always can be in addition.`,
              ans: md`$i\hbar\hat L_y\psi = [\hat L_z, \hat L_x]\psi = 0$; then $i\hbar\hat L_x\psi = [\hat L_y, \hat L_z]\psi = 0$ and likewise $\hat L_z\psi = 0$, so $\hat L^2\psi = 0$: $\ell = 0$. For $\ell \ge 1$ at most one component is sharp. $\hat L^2$ commutes with every component, so it shares an eigenbasis with whichever one you choose.`,
              sol: md`
                **How to see it.** Two sharp components force the commutator, the third component, to annihilate $\psi$; then the other commutators force everything to zero. The only state with two sharp components has no angular momentum at all.

                - $i\hbar\hat L_y\psi = (\hat L_z\hat L_x - \hat L_x\hat L_z)\psi = (\lambda_z\lambda_x - \lambda_x\lambda_z)\psi = 0$, so $\hat L_y\psi = 0$.
                - $i\hbar\hat L_x\psi = (\hat L_y\hat L_z - \hat L_z\hat L_y)\psi = \lambda_z\hat L_y\psi - \hat L_z(0) = 0$, so $\lambda_x = 0$. Likewise $i\hbar\hat L_z\psi = [\hat L_x, \hat L_y]\psi = \hat L_x(0) - \lambda_x\hat L_y\psi = 0$, so $\lambda_z = 0$.
                - $\hat L^2\psi = (\hat L_x^2 + \hat L_y^2 + \hat L_z^2)\psi = 0$: $\ell = 0$.

                **Conclusion.** Apart from the $\ell = 0$ state, where every component is 0, **at most one component** of $\hat{\mathbf L}$ can be sharp. $[\hat L^2, \hat L_i] = 0$ for each $i$, so $\hat L^2$ is compatible with whichever component you pick: that is why states are labeled by $(\ell, m)$.
              `,
            },
            {
              q: md`**1 (b).** Classically, knowing $L^2$ you could also measure all three components, and identical copies agree. Now $\hat L^2$ is measured and gives $6\hbar^2$. (i) Possible outcomes of a following $\hat L_y$ measurement? (ii) What do you need to know to get their probabilities? (iii) Turn it around: $\hat L_z$ is measured first and gives $\hbar$; possible outcomes of a following $\hat L^2$ measurement? Why is this range different?`,
              ans: md`(i) $\ell = 2$: $L_y \in \{-2, -1, 0, 1, 2\}\hbar$. (ii) The state's components along the five $\hat L_y$ eigenstates in the $\ell = 2$ subspace; $L^2$ alone doesn't fix them. (iii) Any $\ell \ge 1$: $L^2 \in \{2, 6, 12, \ldots\}\hbar^2$. $\ell$ bounds $m$, but $m$ only bounds $\ell$ from below.`,
              sol: md`
                **How to see it.** Nothing singles out $z$: every component has the same spectrum $m\hbar$, $|m| \le \ell$. The probabilities live in the state, not in the eigenvalue.

                **(i)** $\hbar^2\ell(\ell+1) = 6\hbar^2 \Rightarrow \ell = 2$. Outcomes $m_y\hbar$ with $m_y \in \{-2, \ldots, 2\}$.

                **(ii)** After the $L^2$ measurement the state can be any vector in the 5-dimensional $\ell = 2$ subspace. The probabilities are the squared magnitudes of its components along the five $\hat L_y$ eigenstates. **Classically**, a single value of $L_y$ would come out on every copy; here identical preparation with sharp $L^2$ still gives a spread.

                **(iii)** $L_z = \hbar$ means $m = 1$, and any $\ell \ge |m| = 1$ is allowed: $L^2 \in \{2\hbar^2, 6\hbar^2, 12\hbar^2, \ldots\}$, an infinite list. $-\ell \le m \le \ell$ caps $m$ given $\ell$, but a given $m$ only puts a floor under $\ell$.
              `,
            },
            {
              q: md`**2 (a). Successive measurements.** A beam is prepared in $\psi = R(r)Y(\theta, \phi)$. Simultaneous measurement of $(\hat L^2, \hat L_z)$ gives $(0, 0)$ with probability $\tfrac34$ and $(2\hbar^2, -\hbar)$ with $\tfrac14$. Write the most general $Y$. What can these data not tell you?`,
              ans: md`$Y = \tfrac{\sqrt3}{2}Y_0^0 + \tfrac12e^{i\alpha}Y_1^{-1}$ (up to a global phase). The relative phase $\alpha$ and $R(r)$ are undetermined.`,
              sol: md`
                **How to see it.** Each outcome pair labels one $Y_\ell^m$; probabilities give the magnitudes of their coefficients. Phases need an observable that connects the two terms.

                Only $Y_0^0$ and $Y_1^{-1}$ appear, with $|c_{00}|^2 = \tfrac34$, $|c_{1,-1}|^2 = \tfrac14$:
                $$Y = \frac{\sqrt3}{2}Y_0^0 + \frac12e^{i\alpha}Y_1^{-1}$$
                The relative phase $\alpha$ is invisible to $\hat L^2$ and $\hat L_z$ (both diagonal in this basis); it would take an observable with matrix elements between the two terms. And nothing here says anything about $R(r)$.
              `,
            },
            {
              q: md`**2 (b).** The particles with $L_z = -\hbar$ are separated out, and $\hat L_x$ is measured on them. Possible outcomes and probabilities?`,
              ans: md`$L_x = +\hbar, 0, -\hbar$ with probabilities $\tfrac14, \tfrac12, \tfrac14$.`,
              sol: md`
                **How to see it.** In $\ell = 1$, the $\hat L_z$ eigenfunctions are $z$ and $x \pm iy$ (over $r$). By relabeling axes, the $\hat L_x$ eigenfunctions are $x$ (for $L_x = 0$) and $y \pm iz$ (for $L_x = \pm\hbar$). Rewrite the state in those.

                After the selection, $Y = Y_1^{-1} = \sqrt{\tfrac{3}{8\pi}}\tfrac{x - iy}{r}$. Normalized $\hat L_x$ eigenfunctions: $u_0 = \sqrt{\tfrac{3}{4\pi}}\tfrac xr$, $u_\pm = \sqrt{\tfrac{3}{8\pi}}\tfrac{y \pm iz}{r}$. With $\tfrac xr = \sqrt{\tfrac{4\pi}{3}}u_0$ and $y = \tfrac12\left[(y + iz) + (y - iz)\right]$:
                $$Y_1^{-1} = \frac{1}{\sqrt2}u_0 - \frac i2u_+ - \frac i2u_-$$
                (Check: $\tfrac{1}{\sqrt2}\sqrt{\tfrac{3}{4\pi}} = \sqrt{\tfrac{3}{8\pi}}$ ✓, and $-\tfrac i2\sqrt{\tfrac{3}{8\pi}}\cdot2y = -i\sqrt{\tfrac{3}{8\pi}}\,y$ ✓.) So $L_x = +\hbar, 0, -\hbar$ with $\tfrac14, \tfrac12, \tfrac14$; they sum to 1.

                **Alternative:** $\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$ as a $3\times3$ matrix in the $\ket{1, m}$ basis, $\tfrac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}$; diagonalize (eigenvalues $\hbar, 0, -\hbar$) and project.
              `,
            },
            {
              q: md`**2 (c).** What is the angular wavefunction right after each outcome of the $\hat L_x$ measurement? If $\hat L_z$ is now measured again, is $-\hbar$ certain? Why not?`,
              ans: md`$u_+$, $u_0$ or $u_-$ ($R$ unchanged). $u_0 = \tfrac{1}{\sqrt2}(-Y_1^1 + Y_1^{-1})$, $u_\pm = \tfrac i2(Y_1^1 + Y_1^{-1}) \pm \tfrac{i}{\sqrt2}Y_1^0$: $P(L_z = -\hbar) = \tfrac12$ after $u_0$, $\tfrac14$ after $u_\pm$. Never certain: $\hat L_x$ and $\hat L_z$ don't commute. $L^2 = 2\hbar^2$ is still certain.`,
              sol: md`
                **How to see it.** The $\hat L_x$ measurement collapses onto an $\hat L_x$ eigenstate, which is a superposition of $\hat L_z$ eigenstates. The earlier $L_z$ value is erased.

                Expanding back with $x/r$, $y/r$, $z/r$ written in the $Y_1^m$:
                $$u_0 = \frac{1}{\sqrt2}\left(-Y_1^1 + Y_1^{-1}\right),\qquad u_\pm = \frac i2\left(Y_1^1 + Y_1^{-1}\right) \pm \frac{i}{\sqrt2}Y_1^0$$
                A second $\hat L_z$ measurement gives $-\hbar$ with probability $\tfrac12$ (after $u_0$) or $\tfrac14$ (after $u_\pm$), **never with certainty**. Measuring $\hat L_x$ destroyed the $L_z$ information because $[\hat L_x, \hat L_z] \ne 0$. But $L^2 = 2\hbar^2$ is still certain: $\hat L^2$ commutes with both, and every state involved lives in $\ell = 1$.
              `,
            },
            {
              q: md`**3 (a). Symmetry and degeneracy of a rotor.** Classically $K_{\text{rot}} = \tfrac{L_x^2}{2I_x} + \tfrac{L_y^2}{2I_y} + \tfrac{L_z^2}{2I_z}$; quantize by $L_i \to \hat L_i$ (wavefunctions of $\theta, \phi$ only). First $I_x = I_y = I_z = I$: write $\hat H$ with $\hat L^2$; eigenfunctions, eigenvalues, degeneracy; which symmetry is behind it?`,
              ans: md`$\hat H = \hat L^2/2I$; eigenfunctions $Y_\ell^m$, $E_\ell = \tfrac{\hbar^2\ell(\ell+1)}{2I}$, degeneracy $2\ell + 1$. Full rotational symmetry.`,
              sol: md`
                **How to see it.** A sphere looks the same however you turn it, so its energy can't care which way the angular momentum points, only how big it is.

                $\hat H = (\hat L_x^2 + \hat L_y^2 + \hat L_z^2)/2I = \hat L^2/2I$. Eigenfunctions $Y_\ell^m$, $E_\ell = \tfrac{\hbar^2\ell(\ell+1)}{2I}$, $\ell = 0, 1, 2, \ldots$, each $(2\ell + 1)$-fold degenerate ($m = -\ell, \ldots, \ell$). **Cause:** $\hat H$ commutes with every $\hat L_i$, so rotations (generated by $\hat L_i$, which mix the $m$'s within an $\ell$) don't change the energy.
              `,
            },
            {
              q: md`**3 (b), (c).** Now $I_x = I_y = I$, $I_z = (1 + \epsilon)I$, $\epsilon > -1$. (b) Write $\hat H$ with $\hat L^2$ and $\hat L_z$; are the $Y_\ell^m$ still eigenfunctions? Energies $E_{\ell m}$? (c) Sketch $E_{\ell m}$ for $\ell = 0, 1, 2$ vs small $\epsilon$. For $\epsilon > 0$ which $|m|$ is lowest within each $\ell$? Classical reason?`,
              ans: md`$\hat H = \tfrac{\hat L^2}{2I} - \tfrac{\epsilon}{1+\epsilon}\tfrac{\hat L_z^2}{2I}$; still exact eigenfunctions; $E_{\ell m} = \tfrac{\hbar^2}{2I}\left[\ell(\ell+1) - \tfrac{\epsilon}{1+\epsilon}m^2\right]$. Lines of slope $-m^2$; for $\epsilon > 0$ the largest $|m| = \ell$ is lowest: rotating about the axis with the larger moment of inertia is cheaper at fixed $|L|$.`,
              sol: md`
                **How to see it.** $\hat L_x^2 + \hat L_y^2 = \hat L^2 - \hat L_z^2$: the Hamiltonian is built only from operators the $Y_\ell^m$ already diagonalize. No perturbation theory needed.

                **(b)**
                $$\hat H = \frac{\hat L^2 - \hat L_z^2}{2I} + \frac{\hat L_z^2}{2(1+\epsilon)I} = \frac{\hat L^2}{2I} - \frac{\epsilon}{1+\epsilon}\frac{\hat L_z^2}{2I},\qquad E_{\ell m} = \frac{\hbar^2}{2I}\left[\ell(\ell+1) - \frac{\epsilon}{1+\epsilon}m^2\right]$$
                exact, for any $\epsilon$.

                **(c)** For small $|\epsilon|$, $E_{\ell m} \approx \tfrac{\hbar^2}{2I}[\ell(\ell+1) - \epsilon m^2]$: straight lines with slope $-m^2$. $\ell = 0$: flat at 0. $\ell = 1$: $m = 0$ flat at 2, $m = \pm1$ slope $-1$. $\ell = 2$: flat at 6, slopes $-1$ and $-4$. All lines of a multiplet meet at $\epsilon = 0$.

                [[fig:rotor]]

                For $\epsilon > 0$ the states with $|m| = \ell$ lie lowest (for $\epsilon < 0$, highest). **Classically** $E = \tfrac{L_\perp^2}{2I} + \tfrac{L_z^2}{2I_z}$ at fixed $|L|$: if $I_z > I$, it costs less to put the angular momentum along $z$, i.e. to spin about the axis with the larger moment of inertia.
              `,
              figs: { rotor: { svg: rotorFig, cap: 'Symmetric-top levels $E_{\\ell m}$ in units $\\hbar^2/2I$ against $\\epsilon$ (exact formula). Gray: $m = 0$, flat. Each $|m| \\ne 0$ line is still doubly degenerate ($\\pm m$).' } },
            },
            {
              q: md`**3 (d).** Which degeneracy is left for $\epsilon \ne 0$? Which symmetry protects it? Suggest a change that removes it.`,
              ans: md`$\pm m$ stay degenerate ($E$ depends on $m^2$): twofold for $m \ne 0$. Protected by operations that flip $L_z$ but leave the rotor unchanged (reflection through a plane containing $z$, or a $\pi$ rotation about a perpendicular axis). Remove it with a term linear in $\hat L_z$, e.g. $-\gamma B\hat L_z$ (a magnetic field along $z$): shifts $E$ by $-\gamma B\hbar m$.`,
              sol: md`
                **How to see it.** What's left of the symmetry is "spinning one way about $z$ looks like spinning the other way after a flip". Anything that tells clockwise from counterclockwise breaks it.

                $E_{\ell m}$ depends on $m^2$: $m$ and $-m$ stay degenerate (twofold for each $m \ne 0$; $m = 0$ alone). The rotor is still symmetric under rotations about $z$ (which conserve $L_z$, so $m$ stays a good label), and the $\pm m$ pairing is protected by operations that **reverse** $L_z$ but leave the rotor unchanged: reflection through a plane containing the $z$ axis, or a rotation by $\pi$ about an axis perpendicular to $z$. Classically, spinning either way about the symmetry axis costs the same.

                **To lift it:** a term linear in $\hat L_z$, which distinguishes the sense of rotation. A magnetic field along $z$ acting on a magnetic moment $\propto\hat{\mathbf L}$: $\hat H' = -\gamma B\hat L_z$ shifts $E_{\ell m}$ by $-\gamma B\hbar m$. Now all $2\ell + 1$ levels of a multiplet are distinct.
              `,
            },
          ]),
          R(md`
            **Where this shows up on the exam.** Successive measurements of non-commuting observables are Midterm 1's $\sigma_z$-then-$\sigma_x$ structure in a three-level system: outcomes, probabilities, the state after, "would the next measurement be certain? justify". The rotor is the template for "write $\hat H$ in terms of $\hat L^2$ and $\hat L_z$, read off the spectrum, explain the degeneracy by symmetry".
          `),
          drill,
          P({
            title: 'Spectrum from L²',
            q: md`$\hat L^2$ gives $12\hbar^2$. Find $\ell$ and the number of possible outcomes of a following $\hat L_y$ measurement.`,
            parts: [{ lbl: '\\ell', ans: 3 }, { lbl: '\\#\\text{ outcomes}', ans: 7 }],
            hints: [md`$\ell(\ell+1) = 12$.`],
            sol: md`$\ell = 3$; $L_y \in \{-3, \ldots, 3\}\hbar$: 7 values.`,
          }),
          P({
            title: 'Two multiplets',
            q: md`$Y = \tfrac{1}{\sqrt3}Y_1^1 + \sqrt{\tfrac23}Y_2^0$. Find $P(L^2 = 6\hbar^2)$, $\langle L_z\rangle/\hbar$ and $\langle L^2\rangle/\hbar^2$.`,
            parts: [{ lbl: 'P(6\\hbar^2)', ans: 2 / 3 }, { lbl: '\\langle L_z\\rangle/\\hbar', ans: 1 / 3 }, { lbl: '\\langle L^2\\rangle/\\hbar^2', ans: 2 / 3 + 4 }],
            hints: [md`Each term is a simultaneous eigenfunction of $\hat L^2$ and $\hat L_z$.`],
            sol: md`$P(6\hbar^2) = \tfrac23$. $\langle L_z\rangle = \tfrac13(1) + \tfrac23(0) = \tfrac13\hbar$. $\langle L^2\rangle = \tfrac13(2) + \tfrac23(6) = \tfrac{14}{3}\hbar^2$.`,
          }),
          P({
            title: 'Measuring Lₓ on Y₁⁰',
            q: md`A particle is in $Y_1^0 \propto z/r$. $\hat L_x$ is measured. Find $P(L_x = +\hbar)$ and $P(L_x = 0)$.`,
            parts: [{ lbl: 'P(+\\hbar)', ans: 0.5 }, { lbl: 'P(0)', ans: 0 }],
            hints: [md`$z = \tfrac{1}{2i}\left[(y + iz) - (y - iz)\right]$, and the $L_x = 0$ eigenfunction is $x/r$.`],
            sol: md`$z/r$ has no $x$ in it: $P(0) = 0$. It is an equal-magnitude combination of $u_+$ and $u_-$: $\tfrac12$ each. (The vector model: $L_z = 0$ means $\mathbf L$ lies in the $xy$ plane, so its $x$ component is never "zero for sure".)`,
          }),
          P({
            title: 'Symmetric top numbers',
            q: md`For $\epsilon = 0.1$, find $E_{2,\pm2}$ and $E_{2,\pm1}$ in units of $\hbar^2/2I$.`,
            parts: [{ lbl: 'E_{2,\\pm2}', ans: 6 - 0.4 / 1.1 }, { lbl: 'E_{2,\\pm1}', ans: 6 - 0.1 / 1.1 }],
            hints: [md`$E = \ell(\ell+1) - \tfrac{\epsilon}{1+\epsilon}m^2$.`],
            sol: md`$6 - \tfrac{0.4}{1.1} = 5.64$; $6 - \tfrac{0.1}{1.1} = 5.91$. ($m = 0$ stays at 6.)`,
          }),
          Q(md`For the symmetric top ($\epsilon \ne 0$, no field), how many **distinct** energies does the $\ell = 2$ multiplet split into?`, ['3', '5', '2', '1'], 0,
            [null, md`$\pm m$ stay together.`, md`$m = 0$, $|m| = 1$, $|m| = 2$ all differ.`, md`$\epsilon \ne 0$ splits it.`],
            md`$E$ depends on $m^2$: $|m| = 0, 1, 2$. Adding $-\gamma B\hat L_z$ would make it 5.`),
          Q(md`A state has $L_z = 2\hbar$ (just measured). What is the smallest value a following $\hat L^2$ measurement can give?`, [md`$6\hbar^2$`, md`$4\hbar^2$`, md`$2\hbar^2$`, md`$0$`], 0,
            [null, md`$L^2$ is never $m^2\hbar^2$: it is $\ell(\ell+1)\hbar^2 > m^2\hbar^2$.`, md`$\ell = 1$ allows only $|m| \le 1$.`, md`$\ell = 0$ has only $m = 0$.`],
            md`$\ell \ge |m| = 2$, so $L^2 \ge 2\cdot3\hbar^2$. Always $L^2 > L_z^2$ for $\ell \ge 1$: the vector can't point straight along $z$.`),
          Q(md`Why can't $\hat L_z$ and $\hat L_x$ both be sharp in a state with $\ell = 1$?`, ['Two sharp components force the third to annihilate ψ, and then all three vanish, which needs ℓ = 0', 'Because their eigenvalues are different', 'Because L² would not be sharp', 'They can, if m = 0'], 0,
            [null, 'They have the same spectrum.', 'L² commutes with both; that is not the obstruction.', md`$Y_1^0$ has $L_z = 0$ sharp but $L_x = \pm\hbar$ with probability $\tfrac12$ each (previous card).`],
            md`The commutator argument of 1(a): only $\ell = 0$ escapes.`),
        ],
      },

      // ------------------------------------------------------------------ D8
      {
        id: 'disc8', title: 'Discussion 8: the effective potential, the spherical box, accidental degeneracy',
        steps: [
          R(md`
            **Trains:** the radial equation and its boundary conditions (${T(20, 't20-radial')}), the spherical box and hydrogen's spectrum (${T(21, 't21-hydrogen')}), degeneracy and symmetry (${T(19, 't19-Ylm')}).

            **Recall.** For a central $V(r)$, $\psi = R(r)Y_\ell^m(\theta, \phi)$ and $u \equiv rR$ obeys a 1D equation on $0 < r < \infty$:
            $$-\frac{\hbar^2}{2m}\frac{d^2u}{dr^2} + V_{\text{eff}}(r)u = Eu,\qquad V_{\text{eff}} = V(r) + \frac{\hbar^2\ell(\ell+1)}{2mr^2}$$
            with $\int_0^\infty|u|^2dr = 1$; $|u|^2dr$ is the probability of finding the particle between $r$ and $r + dr$. Everything you know about 1D problems (allowed/forbidden regions, curvature, nodes) applies to $u$, with one extra wall at $r = 0$.
          `),
          paper('PHYS 486 · Discussion 8', '10/29', [
            {
              q: md`**1 (a). Boundary conditions.** Why must $u(0) = 0$? (For $\ell = 0$, $u(0) \ne 0$ gives $\psi \propto 1/r$ near 0: normalizable? a solution? Use $\nabla^2(1/r) = -4\pi\delta^3(\mathbf r)$.) Which conditions at large $r$ for (i) bound states, (ii) scattering states?`,
              ans: md`$\ell \ge 1$: $u(0) \ne 0$ needs the $r^{-\ell}$ branch, not normalizable. $\ell = 0$: $1/r$ **is** normalizable, but $\nabla^2(1/r)$ produces a $\delta^3(\mathbf r)$ nothing can cancel, so it is not a solution. So $u(0) = 0$ always. Large $r$: bound, $u \to 0$ fast enough to normalize; scattering, $u$ bounded (oscillating). $u$, $u'$ continuous where $V$ is finite.`,
              sol: md`
                **How to see it.** For $\ell \ge 1$ the centrifugal wall makes the bad solution blow up too fast to normalize. For $\ell = 0$ the bad solution is harmless to normalize but secretly solves the equation with a point source at the origin, which the potential doesn't have.

                **$\ell \ge 1$.** Near the origin the solutions go as $r^{\ell+1}$ or $r^{-\ell}$ (part (d)). $u(0) \ne 0$ requires the $r^{-\ell}$ branch, and $\int_0|u|^2dr \sim \int_0r^{-2\ell}dr$ diverges for $\ell \ge 1$.

                **$\ell = 0$.** The popular answer "$1/r$ is not normalizable" is **wrong**: $\int|\psi|^2d^3r \propto \int_0r^{-2}r^2dr$ is finite. The real problem: $\psi = \tfrac{u(0)}{\sqrt{4\pi}\,r}$ is not a solution at $r = 0$. The kinetic term gives
                $$-\frac{\hbar^2}{2m}\nabla^2\psi \ni -\frac{\hbar^2}{2m}\frac{u(0)}{\sqrt{4\pi}}(-4\pi)\delta^3(\mathbf r)$$
                and nothing in $V\psi$ or $E\psi$ (no delta function in $V$) can cancel it. So $u(0) = 0$ in all cases.

                **Large $r$.** (i) Bound: normalizable, $\int_0^\infty|u|^2dr < \infty$, so $u \to 0$ (exponentially, in the forbidden region). (ii) Scattering: $u$ only needs to stay bounded (oscillating), like a 1D free particle: delta-normalizable, not normalizable. And $u$, $u'$ are continuous wherever $V$ is finite, as in 1D.
              `,
            },
            {
              q: md`**1 (b). The effective potential for Coulomb.** $V = -k/r$ ($k = e^2/4\pi\epsilon_0$), $a = \hbar^2/mk$. Sketch $V_{\text{eff}}$ for $\ell = 0, 1, 2$. For $\ell \ge 1$, find the position and depth of the minimum. How do they change with $\ell$?`,
              ans: md`$r_{\min} = \ell(\ell+1)a$, $V_{\text{eff}}(r_{\min}) = -\dfrac{k}{2\ell(\ell+1)a} = \dfrac{E_1}{\ell(\ell+1)}$ with $E_1 = -k/2a = -13.6$ eV. The well moves out ($\propto\ell^2$) and gets shallower ($\propto1/\ell^2$).`,
              sol: md`
                **How to see it.** Two competing terms: $-1/r$ wins far away, $+1/r^2$ wins close in. For $\ell \ge 1$ that makes a single well, pushed outward and made shallower as the centrifugal term grows.

                [[fig:veff]]

                $\ell = 0$: $V_{\text{eff}} = -k/r$, rising monotonically from $-\infty$ to $0^-$. $\ell \ge 1$: $+\infty$ at the origin, one minimum, then up to $0^-$ from below.
                $$\frac{dV_{\text{eff}}}{dr} = \frac{k}{r^2} - \frac{\hbar^2\ell(\ell+1)}{mr^3} = 0\ \Rightarrow\ r_{\min} = \frac{\hbar^2\ell(\ell+1)}{mk} = \ell(\ell+1)\,a$$
                $$V_{\text{eff}}(r_{\min}) = -\frac{k}{\ell(\ell+1)a} + \frac{k}{2\ell(\ell+1)a} = -\frac{k}{2\ell(\ell+1)a} = \frac{E_1}{\ell(\ell+1)}$$
                using $\hbar^2/m = ka$. As $\ell$ grows the well moves out like $\ell^2$ and gets shallower like $1/\ell^2$; the barrier dominates more and more of the region. (Sanity check: the lowest $\ell = 1$ level, $E_1/4 = -3.4$ eV, lies above the bottom of the $\ell = 1$ well, $E_1/2 = -6.8$ eV, as it must.)
              `,
              figs: { veff: { svg: veffFig, cap: '$V_{\\text{eff}}$ for hydrogen in units of $|E_1| = 13.6$ eV, $r$ in Bohr radii. $\\ell = 1$: minimum $-\\tfrac12$ at $r = 2a$; $\\ell = 2$: $-\\tfrac16$ at $6a$. Dashed: $E_2 = -\\tfrac14$.' } },
            },
            {
              q: md`**1 (c).** Pick an $E < 0$ and an $E > 0$ on your sketch. Mark allowed and forbidden regions for $\ell = 0$ and $\ell \ge 1$. Which give bound states, which scattering states; why is one spectrum discrete and the other continuous? If $V = +k/r$, why no bound states?`,
              ans: md`$E < 0$: $\ell = 0$ allowed for $r < r_2$; $\ell \ge 1$ allowed between $r_1$ and $r_2$ (none if $E$ is below the well's bottom). $E > 0$: $\ell = 0$ allowed everywhere, $\ell \ge 1$ forbidden only for $r < r_1$. Bound needs two conditions ($u(0) = 0$ and decay) on a second-order equation: only special $E$. Scattering needs only $u(0) = 0$: any $E$. Repulsive: $V_{\text{eff}} > 0$ everywhere, no well.`,
              sol: md`
                **How to see it.** Read it like any 1D potential. A trapped region with forbidden walls on both sides gives quantized energies; an open side gives a continuum.

                **$E < 0$.** $\ell = 0$: allowed for $0 < r < r_2$ ($-k/r_2 = E$), forbidden beyond. $\ell \ge 1$ (with $E$ above the bottom of that $\ell$'s well): allowed between turning points $r_1 < r < r_2$, forbidden for $r < r_1$ (the centrifugal barrier) and $r > r_2$. If $E$ is below the bottom of the $\ell$ well: no allowed region, no state with that $\ell$.

                **$E > 0$.** $\ell = 0$: allowed everywhere. $\ell \ge 1$: forbidden only for $r < r_1$, allowed out to infinity.

                **Bound vs scattering.** $E < 0$ gives bound states, $E > 0$ scattering states. As in 1D: a bound $u$ must satisfy **two** conditions, $u(0) = 0$ and decay at large $r$. For a second-order equation that only works for special $E$: a **discrete** spectrum. For $E > 0$ only $u(0) = 0$ constrains $u$, and any $E$ gives a bounded oscillating solution at large $r$: a **continuous** spectrum.

                **Repulsive $V = +k/r$:** $V_{\text{eff}} > 0$ for every $\ell$, decreasing to 0 at large $r$. There is no well: $E$ must be positive to have any allowed region, and then the particle is free to escape. All states are scattering states.
              `,
            },
            {
              q: md`**1 (d). The shape of $u$, and the origin.** Sketch a plausible bound $u(r)$ with one node, for $\ell = 0$ and $\ell = 1$: where does $u$ oscillate, where does it decay? Near $r = 0$ (centrifugal term dominant for $\ell \ge 1$) try $u \propto r^s$: which $s$ solve the equation, which is allowed? What does that imply for $R = u/r$ at the origin; why do only $\ell = 0$ states have nonzero density at the origin?`,
              ans: md`$u$ oscillates (curving toward the axis) in the allowed region, decays in the forbidden ones; $\ell = 1$ starts flat ($\propto r^2$). $s(s-1) = \ell(\ell+1)$: $s = \ell + 1$ (allowed) or $-\ell$. So $R \propto r^\ell$: $R(0) \ne 0$ only for $\ell = 0$; the centrifugal barrier keeps particles with angular momentum away from the origin.`,
              sol: md`
                **How to see it.** Near the origin the centrifugal term $\ell(\ell+1)/r^2$ is the biggest thing in the equation; balancing it against $u''$ gives a power law. The larger $\ell$, the higher the power, the flatter $u$ starts.

                **Shapes.** In the allowed region $u$ oscillates, curving toward the axis, with shorter local wavelength where $E - V_{\text{eff}}$ is large; in forbidden regions it curves away and decays exponentially. $\ell = 0$: starts linearly from $u(0) = 0$, one node, then decays beyond $r_2$. $\ell = 1$: starts very flat ($\propto r^2$) inside the barrier, oscillates once between $r_1$ and $r_2$, then decays.

                **Near the origin.** $-u'' + \tfrac{\ell(\ell+1)}{r^2}u \approx 0$ with $u = r^s$: $s(s-1) = \ell(\ell+1)$, so $s = \ell + 1$ or $s = -\ell$. By (a) only $s = \ell + 1$ is allowed. (For $\ell = 0$ the Coulomb term $\propto u/r$ isn't dominated by anything, but it only corrects $u \approx r$ at order $r^2$; $u \propto r$ still holds.)

                **So** $R = u/r \propto r^\ell$: $R(0) \ne 0$ only for $\ell = 0$; for $\ell \ge 1$, $R$ vanishes as $r^\ell$, more steeply for larger $\ell$.

                [[fig:rad]]

                **Physically:** the centrifugal barrier keeps a particle with angular momentum away from the origin. $|\psi(0)|^2 = |R(0)|^2/4\pi$ is nonzero only for s states. (The probability of being exactly at a point is still zero.) This matters later: the hyperfine contact interaction and electron capture by nuclei involve only s electrons.
              `,
              figs: { rad: { svg: radFig, cap: 'Hydrogen radial functions, each scaled to its largest value. 1s and 2s start at their maximum; 2p starts like $r$, 3d like $r^2$.' } },
            },
            {
              q: md`**1 (e) [optional]. Back to classical mechanics.** Classically, conservation of $\mathbf L$ reduces central-force motion to 1D in two steps: fixed **direction** of $\mathbf L$ (3D → 2D, a plane), fixed **magnitude** (2D → 1D in $r$). Which step survives in quantum mechanics, and what plays the role of $L^2$ in the radial equation? Which step doesn't, and which commutator is to blame?`,
              ans: md`2D → 1D survives: $\hat L^2$ commutes with $\hat H$, and $\hbar^2\ell(\ell+1)$ replaces $L^2$ in $L^2/2mr^2$. 3D → 2D fails: a fixed plane needs all three components sharp, forbidden by $[\hat L_x, \hat L_y] = i\hbar\hat L_z$. What remains is one sharp component and a distribution over directions, $|Y_\ell^m|^2$.`,
              sol: md`
                **How to see it.** A fixed magnitude is one number: fine. A fixed direction is three numbers at once: forbidden.

                **Survives:** step 2. $[\hat H, \hat L^2] = 0$ for a central potential, so $L^2$ can be sharp and conserved; in the radial equation $\hbar^2\ell(\ell+1)$ plays the role of $L^2$ in the classical centrifugal term $L^2/2mr^2$.

                **Doesn't:** step 1. A fixed orbital plane needs the direction of $\mathbf L$, all three components, to be sharp, and $[\hat L_x, \hat L_y] = i\hbar\hat L_z \ne 0$ forbids it (Discussion 7, 1(a)). What remains is one sharp component, $L_z = m\hbar$, and a probability distribution over directions, $|Y_\ell^m|^2$. For $m = \ell$ and large $\ell$, $|Y_\ell^\ell|^2 \propto \sin^{2\ell}\theta$ concentrates near the $xy$ plane: the classical orbital plane re-emerges.
              `,
            },
            {
              q: md`**2 (a). A particle in a spherical box** ($V = 0$ for $r < b$, $\infty$ beyond). With $u(0) = u(b) = 0$, $E_{N\ell} = \tfrac{\hbar^2\beta_{N\ell}^2}{2mb^2}$, $\beta_{N\ell}$ = $N$th zero of $j_\ell$: $\ell = 0$: 3.14, 6.28, 9.42; $\ell = 1$: 4.49, 7.73; $\ell = 2$: 5.76, 9.10; $\ell = 3$: 6.99; $\ell = 4$: 8.18. Explain without the table why the ground state has $\ell = 0$. (Compare $\langle H\rangle$ with and without the centrifugal term for the same $u$; use that $\langle H\rangle \ge$ the lowest eigenvalue.)`,
              ans: md`For the lowest $\ell$ state $u$: $E_{1\ell} = \langle u|\hat H_\ell|u\rangle = \langle u|\hat H_0|u\rangle + \tfrac{\hbar^2\ell(\ell+1)}{2m}\int\tfrac{|u|^2}{r^2}dr > \langle u|\hat H_0|u\rangle \ge E_{10}$.`,
              sol: md`
                **How to see it.** The centrifugal term is a positive potential added on top of the same radial problem. Adding a positive potential can only raise energies.

                Inside the box, $\hat H_\ell = -\tfrac{\hbar^2}{2m}\tfrac{d^2}{dr^2} + \tfrac{\hbar^2\ell(\ell+1)}{2mr^2}$, with the same boundary conditions $u(0) = u(b) = 0$ for every $\ell$. Let $u$ be the lowest eigenfunction for some $\ell \ge 1$, energy $E_{1\ell}$:
                $$E_{1\ell} = \langle u|\hat H_\ell|u\rangle = \langle u|\hat H_0|u\rangle + \frac{\hbar^2\ell(\ell+1)}{2m}\int_0^b\frac{|u|^2}{r^2}dr > \langle u|\hat H_0|u\rangle \ge E_{10}$$
                The last step: $u$ is an allowed $\ell = 0$ wavefunction; expanding it in the $\ell = 0$ eigenstates gives $\langle\hat H_0\rangle = \sum_N|c_N|^2E_{N0} \ge E_{10}$. The same argument with $\hat H_{\ell'}$ in place of $\hat H_0$ shows the lowest level for $\ell$ lies above the lowest for any $\ell' < \ell$. **Physically:** at fixed $|L|$ the particle has rotational kinetic energy on top of its radial motion.
              `,
            },
            {
              q: md`**2 (b), (c).** (b) $\hat L^2$ and $\hat L_z$ are measured on a particle in the ground state: outcomes? In the first excited level: outcomes, and what decides the probabilities? (c) List the lowest five levels with $(N, \ell)$ and degeneracy. Does rotational symmetry account for all of the degeneracy? Do levels with different $\ell$ ever coincide?`,
              ans: md`(b) Ground $(1, 0)$: $L^2 = 0$, $L_z = 0$, certain. First excited $(1, 1)$: $L^2 = 2\hbar^2$ certain, $L_z \in \{-\hbar, 0, \hbar\}$ with probabilities set by the superposition $\sum c_mj_1Y_1^m$, which the energy doesn't fix. (c) $(1,0)$ 3.14 ×1; $(1,1)$ 4.49 ×3; $(1,2)$ 5.76 ×5; $(2,0)$ 6.28 ×1; $(1,3)$ 6.99 ×7. Exactly $2\ell + 1$ each; different $\ell$ never coincide.`,
              sol: md`
                **How to see it.** A level is a $(N, \ell)$ multiplet: $\ell$ is sharp; $m$ is free unless the state says otherwise.

                **(b)** Ground state $(N, \ell) = (1, 0)$ is a single state, $\psi \propto j_0(\beta_{10}r/b)Y_0^0$: $L^2 = 0$ and $L_z = 0$ with certainty. First excited level $(1, 1)$: $L^2 = 2\hbar^2$ with certainty, $L_z \in \{-\hbar, 0, \hbar\}$. The level is threefold degenerate, so a particle with that energy can be in any $\sum_mc_mj_1(\beta_{11}r/b)Y_1^m$; the probabilities $|c_m|^2$ are not fixed by the energy.

                **(c)** In order of $\beta$: $(1,0)$ 3.14, 1 state; $(1,1)$ 4.49, 3; $(1,2)$ 5.76, 5; $(2,0)$ 6.28, 1; $(1,3)$ 6.99, 7. Each level has exactly the $(2\ell + 1)$-fold degeneracy rotational symmetry requires, and no more: zeros of different $j_\ell$ never coincide. That is the **generic** central potential. Hydrogen is the exception (Section 3).
              `,
            },
            {
              q: md`**2 (d) [optional]. Magic numbers.** In the simplest nuclear shell model each proton (or neutron) moves in a spherical box made by the others, two per orbital state (spin up and down). How many fill the lowest one, two, three, four levels completely?`,
              ans: md`2, 8, 18, 20. (2, 8, 20 are magic; 18 isn't; 28, 50, … need spin–orbit coupling.)`,
              sol: md`Cumulative, two per orbital state: 1s: 2; +1p (3 states): 8; +1d (5): 18; +2s (1): 20. So the box model produces the magic numbers 2, 8 and 20. 18 is not magic, and the next magic numbers (28, 50, …) need the spin–orbit interaction, which reorders the levels.`,
            },
            {
              q: md`**3 (a). Accidental degeneracy.** For any central potential, why can $E$ not depend on $m$? Which symmetry? What would you add to $\hat H$ to make $E$ depend on $m$?`,
              ans: md`The radial equation contains $\ell$ but not $m$. Rotational symmetry: $[\hat H, \hat L_i] = 0$, so $\hat L_\pm$ commute with $\hat H$ and move between $m$'s at fixed $E$. A preferred direction breaks it, e.g. $-\gamma B\hat L_z$ (Zeeman), shifting $E$ by $-\gamma B\hbar m$.`,
              sol: md`
                **How to see it.** $m$ is "which way the angular momentum leans". A rotationally symmetric potential can't care which way it leans.

                The radial equation, and hence $E$, contains $\ell$ but not $m$: the same for all $2\ell + 1$ values. Symmetry: $[\hat H, \hat L_i] = 0$ for all $i$, so $\hat L_\pm$ commute with $\hat H$ and take a state of energy $E$ to one with $m \pm 1$ and the same $E$. Rotations never change $\ell$, so this explains degeneracy **in $m$ only**. To make $E$ depend on $m$, pick out a direction: a magnetic field along $z$ acting on the orbital moment, $\hat H' = -\gamma B\hat L_z$, shifts $E$ by $-\gamma B\hbar m$ (the Zeeman effect; compare Discussion 7, 3(d)).
              `,
            },
            {
              q: md`**3 (b).** Hydrogen: $E = \tfrac{E_1}{(N + \ell)^2} \equiv \tfrac{E_1}{n^2}$, $N = 1, 2, \ldots$ ($u$ has $N - 1$ nodes), so $\ell = 0, \ldots, n-1$. How many states have energy $E_n$? Which part of this degeneracy does rotational symmetry explain, and which not? Compare the box.`,
              ans: md`$\sum_{\ell=0}^{n-1}(2\ell+1) = n^2$ (no spin). Rotations explain the $2\ell + 1$ within each $\ell$, not why different $\ell$ coincide (e.g. 2s and 2p): "accidental". In the box every level is a single $\ell$ multiplet.`,
              sol: md`
                **How to see it.** Count: each allowed $\ell$ brings $2\ell + 1$ states. Then ask which of those coincidences a rotation can produce: only those within one $\ell$.

                $\sum_{\ell=0}^{n-1}(2\ell + 1) = n^2$ states (ignoring spin). Rotational symmetry explains the $(2\ell + 1)$-fold degeneracy within each $\ell$. It does **not** explain why the $\ell = 0, \ldots, n - 1$ multiplets share an energy: rotations never change $\ell$, and the radial equation is different for each $\ell$. E.g. $n = 2$: 2s (1 state) and 2p (3 states) coincide "by accident". Contrast the box (2(c)), where each level is a single $\ell$ multiplet, as for a generic central potential.

                (Not really an accident: the Coulomb potential has a hidden symmetry beyond rotations, whose conserved quantity is the Runge–Lenz vector, the one that keeps a classical Kepler ellipse from precessing. Any change to the $1/r$ form breaks it.)
              `,
            },
            {
              q: md`**3 (c). Lifting the $\ell$-degeneracy.** In an alkali atom the outer electron sees a screened nucleus, and feels extra attraction when it dips inside the core. Model: $V = -\tfrac kr - \tfrac{\hbar^2\alpha^2}{2mr^2}$, $0 < \alpha^2 < \tfrac14$. Show this is the hydrogen equation with $\ell \to \lambda_\ell$; what fixes $\lambda_\ell$? Find $E_{N\ell}$: do same-$n$, different-$\ell$ states still coincide? Is the $m$ degeneracy affected? For small $\alpha$ show $\lambda_\ell \approx \ell - \tfrac{\alpha^2}{2\ell+1}$; for $n = 3$ which is lowest, 3s, 3p or 3d, and why physically? (Hydrogen's solution never uses that $\ell$ is an integer: with $\lambda(\lambda+1)$ in the centrifugal term, $E = E_1/(N + \lambda)^2$.)`,
              ans: md`$\lambda_\ell(\lambda_\ell + 1) = \ell(\ell+1) - \alpha^2$, $\lambda_\ell = -\tfrac12 + \sqrt{(\ell + \tfrac12)^2 - \alpha^2}$. $E_{N\ell} = \tfrac{E_1}{(n - \delta_\ell)^2}$, $\delta_\ell = \ell - \lambda_\ell \approx \tfrac{\alpha^2}{2\ell+1}$: $\ell$-degeneracy lifted, $m$-degeneracy kept. $3s < 3p < 3d$: s electrons penetrate the core.`,
              sol: md`
                **How to see it.** An extra $-1/r^2$ term has exactly the form of the centrifugal term, so it just shifts the effective $\ell(\ell+1)$. Since the shift depends on $\ell$, different $\ell$ get different energies.

                $$V_{\text{eff}} = -\frac kr + \frac{\hbar^2}{2mr^2}\left[\ell(\ell+1) - \alpha^2\right]$$
                which is hydrogen's $V_{\text{eff}}$ with $\ell(\ell+1) \to \lambda_\ell(\lambda_\ell + 1)$:
                $$\lambda_\ell(\lambda_\ell + 1) = \ell(\ell+1) - \alpha^2\ \Rightarrow\ \lambda_\ell = -\frac12 + \sqrt{\left(\ell + \tfrac12\right)^2 - \alpha^2}$$
                (the root with $\lambda_\ell > -\tfrac12$; real for all $\ell$ because $\alpha^2 < \tfrac14$). Then
                $$E_{N\ell} = \frac{E_1}{(N + \lambda_\ell)^2} = \frac{E_1}{(n - \delta_\ell)^2},\qquad \delta_\ell \equiv \ell - \lambda_\ell > 0$$
                $\delta_\ell$ depends on $\ell$: same $n$, different $\ell$ now differ. **The $\ell$-degeneracy is lifted.** The potential is still central, so each level keeps its $(2\ell + 1)$-fold $m$-degeneracy.

                **Small $\alpha$:** $\sqrt{(\ell + \frac12)^2 - \alpha^2} \approx \ell + \tfrac12 - \tfrac{\alpha^2}{2\ell + 1}$, so $\delta_\ell \approx \tfrac{\alpha^2}{2\ell+1}$, largest for $\ell = 0$. $E_1 < 0$ and $n - \delta_\ell < n$, so every level is pushed **down**, s the most: $3s < 3p < 3d$.

                **Physically:** the centrifugal barrier keeps high-$\ell$ electrons outside the core; s electrons ($R(0) \ne 0$, part 1(d)) penetrate it and feel the less-screened nucleus. That is why sodium's 3s and 3p differ by about 2.1 eV (the yellow D line, 589 nm). Real quantum defects are large (Na: $\delta_s \approx 1.35$, $\delta_p \approx 0.86$), so the small-$\alpha$ model is qualitative only.
              `,
            },
            {
              q: md`**3 (d) [optional]. Another accident: the 3D oscillator.** $V = \tfrac12m\omega^2r^2$ separates in Cartesian coordinates: $E = \hbar\omega(N + \tfrac32)$, $N = n_x + n_y + n_z$. How many states have $N = 1$? $N = 2$? The $N = 2$ wavefunctions are $e^{-r^2/2x_0^2}$ times one of $2x^2/x_0^2 - 1$, $2y^2/x_0^2 - 1$, $2z^2/x_0^2 - 1$, $xy$, $yz$, $zx$ ($x_0 = \sqrt{\hbar/m\omega}$). Find the combination with $\ell = 0$; which $\ell$ do the other five have? Is the $N = 2$ degeneracy explained by rotational symmetry?`,
              ans: md`$N = 1$: 3 states, one $\ell = 1$ multiplet. $N = 2$: 6 states: the sum $2r^2/x_0^2 - 3$ has $\ell = 0$, the other five form $\ell = 2$. $\ell = 0$ and $\ell = 2$ at the same energy: not explained by rotations (hidden SU(3) symmetry). In general $E = \hbar\omega(2N_r + \ell + \tfrac32)$.`,
              sol: md`
                **How to see it.** Count the ways to split $N$ quanta among three directions. Then sort the polynomials by how they rotate: anything depending only on $r$ is $\ell = 0$; $x, y, z$ are $\ell = 1$; traceless quadratics are $\ell = 2$.

                The number of ways to write $N = n_x + n_y + n_z$ is $\tfrac{(N+1)(N+2)}{2}$: 3 for $N = 1$, 6 for $N = 2$.

                $N = 1$: $x, y, z$ times the Gaussian, i.e. $rY_1^m$: a single $\ell = 1$ multiplet, as rotational symmetry predicts.

                $N = 2$: the sum of the first three, $2r^2/x_0^2 - 3$, depends only on $r$: **$\ell = 0$**. The remaining five ($x^2 - y^2$, $2z^2 - x^2 - y^2$, $xy$, $yz$, $zx$, times the Gaussian) form an **$\ell = 2$** multiplet; one can check $\hat L^2(xy) = 6\hbar^2xy$. So $N = 2$ holds $\ell = 0$ and $\ell = 2$ at the same energy, which rotational symmetry does not explain: another accidental degeneracy (the oscillator's hidden symmetry is SU(3)). In general $E = \hbar\omega(2N_r + \ell + \tfrac32)$, so $\ell = N, N-2, \ldots$ all coincide.
              `,
            },
          ]),
          R(md`
            **Where this shows up on the exam.** This discussion is a bank of explain-in-words parts: "why must $u(0) = 0$?", "sketch $V_{\text{eff}}$ and mark the allowed region", "why is the ground state an s state?", "which degeneracy does symmetry explain?". Each has a two-sentence answer that earns full rubric credit only if it names the reason (normalizability or the delta function; the positive centrifugal term; rotations don't change $\ell$).
          `),
          drill,
          P({
            title: 'Where the ℓ = 3 well sits',
            q: md`For hydrogen, find the position of the $V_{\text{eff}}$ minimum for $\ell = 3$ (in units of $a$) and its depth in eV.`,
            parts: [{ lbl: 'r_{\\min}/a', ans: 12 }, { lbl: 'V_{\\text{eff}}(r_{\\min})', ans: -13.6 / 12, unit: 'eV' }],
            hints: [md`$r_{\min} = \ell(\ell+1)a$, depth $E_1/\ell(\ell+1)$.`],
            sol: md`$12a$; $-13.6/12 = -1.13$ eV. The lowest $\ell = 3$ level is $E_4 = -0.85$ eV, above the bottom ✓.`,
          }),
          P({
            title: 'Spherical box ratio',
            q: md`In a spherical box, find $E_{11}/E_{10}$ (lowest p level over the ground state) and $E_{20}/E_{10}$.`,
            parts: [{ lbl: 'E_{11}/E_{10}', ans: Math.pow(4.4934 / Math.PI, 2) }, { lbl: 'E_{20}/E_{10}', ans: 4 }],
            hints: [md`$E \propto \beta^2$; $\beta_{10} = \pi$, $\beta_{11} = 4.49$, $\beta_{20} = 2\pi$.`],
            sol: md`$(4.49/3.14)^2 = 2.05$; $(2\pi/\pi)^2 = 4$. The 1p level lies well below 2s: the extra radial node costs more than one unit of angular momentum.`,
          }),
          P({
            title: 'Filling more shells',
            q: md`In the box shell model (two per orbital state), how many nucleons fill the lowest **five** levels (1s, 1p, 1d, 2s, 1f)?`,
            parts: [{ lbl: '\\text{nucleons}', ans: 34 }],
            hints: [md`1f has $\ell = 3$: 7 orbital states.`],
            sol: md`$2 + 6 + 10 + 2 + 14 = 34$. Not a magic number (the real one is 28): spin–orbit coupling splits 1f and pulls part of it down.`,
          }),
          P({
            title: 'Hydrogen counting',
            q: md`For hydrogen $n = 4$ (no spin): how many states, and how many distinct values of $\ell$?`,
            parts: [{ lbl: '\\text{states}', ans: 16 }, { lbl: '\\#\\,\\ell', ans: 4 }],
            hints: [md`$\ell = 0, \ldots, n - 1$.`],
            sol: md`$1 + 3 + 5 + 7 = 16 = n^2$; $\ell = 0, 1, 2, 3$.`,
          }),
          P({
            title: 'Sodium with quantum defects',
            q: md`With $\delta_s = 1.35$ and $\delta_p = 0.86$, estimate the energies of sodium's 3s and 3p levels, $E = -13.6\,\text{eV}/(n - \delta_\ell)^2$, and the wavelength of the 3p → 3s line.`,
            parts: [{ lbl: 'E_{3s}', ans: -13.6 / Math.pow(1.65, 2), unit: 'eV' }, { lbl: 'E_{3p}', ans: -13.6 / Math.pow(2.14, 2), unit: 'eV' }, { lbl: '\\lambda', ans: 1240 / (13.6 / Math.pow(1.65, 2) - 13.6 / Math.pow(2.14, 2)), unit: 'nm' }],
            hints: [md`$\lambda = hc/\Delta E$ with $hc = 1240$ eV·nm.`],
            sol: md`$E_{3s} = -13.6/1.65^2 = -5.00$ eV (measured ionization energy 5.14 eV); $E_{3p} = -13.6/2.14^2 = -2.97$ eV; $\Delta E = 2.03$ eV, $\lambda = 612$ nm (the real D line: 589 nm). Hydrogen's $n = 3$ is at $-1.51$ eV: penetration makes a huge difference.`,
          }),
          P({
            title: '3D oscillator, N = 3',
            q: md`For the 3D isotropic oscillator, how many states have $N = 3$, and what is the largest $\ell$ among them?`,
            parts: [{ lbl: '\\text{states}', ans: 10 }, { lbl: '\\ell_{\\max}', ans: 3 }],
            hints: [md`$\tfrac{(N+1)(N+2)}{2}$; $\ell = N, N - 2, \ldots$`],
            sol: md`$10$ states $= 7$ ($\ell = 3$) $+ 3$ ($\ell = 1$). $\ell_{\max} = 3$.`,
          }),
          Q(md`A student says "$u(0) = 0$ for $\ell = 0$ because $\psi \propto 1/r$ is not normalizable." What is wrong?`, [md`$1/r$ is normalizable in 3D; the real reason is that $\nabla^2(1/r) = -4\pi\delta^3$ makes it fail the equation at the origin`, 'Nothing: that is the reason', md`$u(0) \ne 0$ is allowed for $\ell = 0$`, md`The reason is that $V$ is infinite at $r = 0$`], 0,
            [null, md`$\int r^{-2}\,r^2dr$ converges.`, md`It is not allowed, just for a different reason.`, md`The argument doesn't need $V$ to be singular; it applies to the box ($V = 0$ inside) too.`],
            md`The $1/r$ solution secretly solves the equation with a point source $\delta^3(\mathbf r)$ that the potential doesn't contain.`),
          Q(md`Which hydrogen states have a nonzero probability **density** at the nucleus?`, ['Only s states (ℓ = 0)', 'Only the ground state', 'All states with n ≤ 2', 'None: the centrifugal barrier always keeps the electron out'], 0,
            [null, md`2s, 3s, … also have $R(0) \ne 0$.`, md`2p has $R \propto r$ near 0.`, md`For $\ell = 0$ there is no centrifugal term.`],
            md`$R \propto r^\ell$ near the origin, so $|\psi(0)|^2 = |R(0)|^2/4\pi \ne 0$ only for $\ell = 0$.`),
        ],
      },
    ],
  });
})();

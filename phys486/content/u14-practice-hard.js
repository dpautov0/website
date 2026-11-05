/* Unit 8 — harder practice midterms (6–10) in the exact Midterm 1 format (three problems, four 5-point parts, a
   5/4/3/2/1 rubric for every part), a 60-statement true-or-false-with-justification drill, and an explain-in-words
   drill. Every number was checked numerically. */
(function () {
  'use strict';
  const { R, P, Q } = C;

  // ------------------------------------------------------------------ shared pieces
  const LINKS = md`[Ehrenfest](#/l/t11-ehrenfest), [energy–time](#/l/t12-energytime), [oscillator algebra](#/l/t13-ladder), [oscillator wavefunctions](#/l/t14-showave), [oscillator motion](#/l/t15-shomotion), [coherent states](#/l/t16-coherent), [3D](#/l/t17-3d), [angular momentum](#/l/t18-Lalgebra), [spherical harmonics](#/l/t19-Ylm), [radial equation](#/l/t20-radial), [hydrogen](#/l/t21-hydrogen)`;
  const intro = (level, what) => R(md`
    **${level}.** Three problems, 20 points each (four parts × 5 points), graded the way Midterm 1 was: a 5/4/3/2/1 rubric on every part. Give yourself 75 minutes, closed book. The exam prints the formulas a problem needs in its statement, so these setups do too; nothing else is allowed.

    ${what}

    **How to work it.** Write the reason next to every answer: "explain", "justify", "sketch" and "true or false" are worth full points only with the reasoning, and on Midterm 1 these were the parts with the lowest medians (30–50%). Then open each part, grade yourself with its rubric (be strict: an asserted reason is a 4, a missing one a 3), and redo anything below 4/5 a day later without looking.
  `);
  const score = () => R(md`
    ### Score yourself

    Add the rubric points (60 in total). Midterm 1's median was about 62%, roughly 37/60. Above 48 means the material is solid. For every part below 4/5, reread the topic behind it (${LINKS}) and redo the part on paper a day later.
  `);
  const prob = (n, k, head, items) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>PHYS 486 · Practice Midterm 2 · #${n}</span><span>Problem ${k} · 20 pts</span></div>`,
    head, items,
  });
  const mock = (n, sub, intr, probs, check) => ({
    id: `m2-pm${n}`, title: `Practice midterm ${n}`, sub, kind: 'mock',
    steps: [intr, ...probs, R(md`### Check your numbers`), P(Object.assign({ title: `Practice midterm ${n}: key numbers` }, check)), score()],
  });

  // oscillator stationary states in units of sqrt(hbar/m omega)
  const HERM = [(u) => 1, (u) => 2 * u, (u) => 4 * u * u - 2, (u) => 8 * u * u * u - 12 * u];
  const FACT = [1, 1, 2, 6];
  const sho = (n) => (u) => Math.pow(Math.PI, -0.25) / Math.sqrt(Math.pow(2, n) * FACT[n]) * HERM[n](u) * Math.exp(-u * u / 2);
  const s0 = sho(0), s1 = sho(1), s2 = sho(2);
  const gauss = (sig) => (x) => Math.exp(-x * x / (2 * sig * sig)) / (Math.sqrt(2 * Math.PI) * sig);
  const PI = Math.PI;
  const piT = [[PI / 2, '\\tfrac\\pi2'], [PI, '\\pi'], [3 * PI / 2, '\\tfrac{3\\pi}2'], [2 * PI, '2\\pi']];

  // ---- figures
  const figBreathe = PF.plot({
    w: 380, h: 200, x: [0, PI], y: [0, 1.15], xl: '\\omega t', yl: '\\sigma_x/\\sigma_0',
    xt: [[PI / 4, '\\tfrac\\pi4'], [PI / 2, '\\tfrac\\pi2'], [3 * PI / 4, '\\tfrac{3\\pi}4'], [PI, '\\pi']], yt: [[0.5, '\\tfrac12'], [1, '1']],
    curves: [{ f: (t) => Math.sqrt(Math.cos(2 * t) ** 2 + 0.25 * Math.sin(2 * t) ** 2) }],
  });
  const figBreatheDens = PF.plot({
    w: 380, h: 210, x: [-3.2, 3.2], y: [0, 0.9], xl: 'x/\\sigma_0', yl: '|\\Psi|^2',
    xt: [[-2, '-2'], [-1, '-1'], [1, '1'], [2, '2']],
    curves: [{ f: gauss(1), lab: 't = 0', labAt: 1.6, dy: -14 }, { f: gauss(0.5), cls: 'acc', lab: 't = \\tfrac{\\pi}{4\\omega}', labAt: 0.55, dx: 6, dy: -4 }],
  });
  const figNa = PF.plot({
    w: 360, h: 240, x: [0, 4.2], y: [-5.6, 0], xl: '', yl: 'E\\ (\\text{eV})', zero: true,
    yt: [[-5, '-5'], [-4, '-4'], [-3, '-3'], [-2, '-2'], [-1, '-1']],
    curves: [
      { pts: [[0.2, -3.4], [1.0, -3.4]], labAt: 1.0, lab: '\\text{H } n=2', dy: 0 },
      { pts: [[0.2, -1.511], [1.0, -1.511]], labAt: 1.0, lab: '\\text{H } n=3', dy: 4 },
      { pts: [[2.0, -5.12], [2.8, -5.12]], cls: 'acc', labAt: 2.8, lab: '\\text{Na } 3s', dy: 0 },
      { pts: [[2.0, -3.03], [2.8, -3.03]], cls: 'acc', labAt: 2.8, lab: '\\text{Na } 3p', dy: 0 },
      { pts: [[2.0, -1.52], [2.8, -1.52]], cls: 'acc', labAt: 2.8, lab: '\\text{Na } 3d', dy: -6 },
    ],
  });
  const figShift = PF.plot({
    w: 400, h: 210, x: [0, 4 * PI], y: [-0.6, 2.6], xl: '\\omega t', yl: 'x/x_0',
    xt: [[PI, '\\pi'], [2 * PI, '2\\pi'], [3 * PI, '3\\pi'], [4 * PI, '4\\pi']], yt: [[1, '1'], [2, '2']], zero: true,
    hlines: [[1, '\\text{new center}']],
    curves: [
      { f: (t) => 1 - Math.cos(t), lab: '\\langle x\\rangle', labAt: 3.6, dy: -10 },
      { f: (t) => 1 - Math.cos(t) + 0.354, cls: 'dim' }, { f: (t) => 1 - Math.cos(t) - 0.354, cls: 'dim' },
    ],
  });
  const circ = (rad, n = 120) => Array.from({ length: n + 1 }, (_, i) => [rad * Math.cos(2 * PI * i / n), rad * Math.sin(2 * PI * i / n)]);
  const figPrecess = PF.plot({
    w: 280, h: 280, ml: 34, mr: 34, mt: 34, mb: 34, x: [-1.1, 1.1], y: [-1.1, 1.1], xl: '\\langle L_x\\rangle/\\hbar', yl: '\\langle L_y\\rangle/\\hbar', zero: true,
    vlines: [[0, '']],
    curves: [{ pts: circ(Math.SQRT1_2) }],
    pts: [{ x: Math.SQRT1_2, y: 0, lab: 't=0', anchor: 'bl' }, { x: 0, y: Math.SQRT1_2, lab: 't=\\tfrac{\\pi}{2\\omega_0}', anchor: 'bl' }, { x: -Math.SQRT1_2, y: 0, lab: 't=\\tfrac{\\pi}{\\omega_0}', anchor: 'br' }],
  });

  // ================================================================== Practice midterm 6
  const pm6 = mock(6, 'harder', intro('Harder than Midterm 1', md`Problems: a spring that suddenly stiffens; an $\ell = 1$ state written in Cartesian form; why sodium is yellow.`), [
    prob(6, 1, md`
      **1 · The spring suddenly stiffens** [20 points, 5 per part]

      A particle of mass $m$ is in the ground state of the oscillator $V = \tfrac12m\omega^2x^2$,
      $$\psi_0(x) = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}e^{-m\omega x^2/2\hbar},\qquad \sigma_0 \equiv \sigma_x = \sqrt{\frac{\hbar}{2m\omega}}.$$
      At $t = 0$ the spring constant is suddenly quadrupled, so the frequency becomes $\omega' = 2\omega$. The new stationary states $\psi_n'$ have energies $E_n' = \hbar\omega'(n + \tfrac12)$; $\psi_0'$ is $\psi_0$ with $\omega \to \omega'$. You may use $\int_{-\infty}^\infty e^{-\beta x^2}dx = \sqrt{\pi/\beta}$.
    `, [
      {
        q: md`**(a)** Explain why the wavefunction immediately after the change is still $\psi_0$. Find the probability that an energy measurement made right after the change gives $E_0' = \hbar\omega$.`,
        ans: md`$\Psi$ cannot jump (first order in time, finite $\hat H$). $P(E_0') = |\braket{\psi_0'|\psi_0}|^2 = \tfrac{2\sqrt2}{3} \approx 0.943$.`,
        sol: md`
          **How to see it.** "Sudden" means the state has no time to respond: the same function is now expanded in a new set of stationary states. It is step 2 of the three-step recipe with a new $\hat H$.

          **Why $\Psi$ is unchanged.** $i\hbar\,\partial_t\Psi = \hat H\Psi$ is first order in time. Integrating over a switching time $\delta t$ with a finite $\hat H$ changes $\Psi$ by $O(\delta t)$, which vanishes as $\delta t \to 0$.

          **Overlap.** Both are real Gaussians. The exponents add: $-\tfrac{m\omega}{2\hbar}(1 + 2)x^2 = -\tfrac{3m\omega}{2\hbar}x^2$. The prefactors multiply to $\left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}\left(\tfrac{2m\omega}{\pi\hbar}\right)^{1/4} = 2^{1/4}\left(\tfrac{m\omega}{\pi\hbar}\right)^{1/2}$, and the integral is $\sqrt{\tfrac{2\pi\hbar}{3m\omega}}$. So
          $$c_0 = 2^{1/4}\sqrt{\tfrac23} = \frac{2^{3/4}}{\sqrt3},\qquad P(E_0') = c_0^2 = \frac{2\sqrt2}{3} \approx 0.943.$$
          Sanity check: close to 1 because the two Gaussians differ in width only by $\sqrt2$. (In general $c_0^2 = 2\sqrt{\omega_1\omega_2}/(\omega_1 + \omega_2)$.)

          **Rubric**
          - **5** Continuity of $\Psi$ in time justified; overlap set up and evaluated; $P = |c_0|^2 = 2\sqrt2/3$.
          - **4** Correct $P$, but "$\Psi$ is unchanged" only asserted; or $c_0$ given as the probability.
          - **3** Correct overlap integral set up, algebra error in the Gaussian integral.
          - **2** Claims the particle stays in "the" ground state with certainty, or uses energies instead of an overlap.
          - **1** Little beyond restating the problem.
        `,
      },
      {
        q: md`**(b)** Without evaluating any integral, decide which outcomes $E_n'$ have zero probability. Then find $\langle H'\rangle$ just after the change, using only what you know about $\psi_0$ in the *old* oscillator. Was energy conserved by the change?`,
        ans: md`All odd $n$ (parity). $\langle H'\rangle = \tfrac54\hbar\omega = \tfrac58\hbar\omega'$. No: the change does work $\tfrac34\hbar\omega$.`,
        sol: md`
          **How to see it.** Symmetry decides which overlaps vanish; the virial split $\langle T\rangle = \langle V\rangle$ in the old ground state gives the energy with no integral.

          **Parity.** $\psi_0$ is even. The new potential is still even, so each $\psi_n'$ has parity $(-1)^n$. An even function times an odd one integrates to zero: $P(E_n') = 0$ for odd $n$.

          **Energy.** In $\psi_0$ of the old oscillator, $\langle T\rangle = \langle V\rangle = \tfrac14\hbar\omega$. The new potential is $4V$, so
          $$\langle H'\rangle = \langle T\rangle + 4\langle V\rangle = \tfrac14\hbar\omega + \hbar\omega = \tfrac54\hbar\omega.$$
          Check: it lies above $E_0' = \hbar\omega$, as any average must. The excess $\tfrac14\hbar\omega$ is mostly the $n = 2$ admixture ($P_2 = \sqrt2/27 \approx 0.052$, each costing $2\hbar\omega' = 4\hbar\omega$).

          **Not conserved.** Before the change the energy was $\tfrac12\hbar\omega$. Stiffening the spring in place raises the potential energy by $3\langle V\rangle = \tfrac34\hbar\omega$: the agent did work. After the change $\hat H'$ is time-independent and $\langle H'\rangle$ stays $\tfrac54\hbar\omega$.

          **Rubric**
          - **5** Odd $n$ excluded with the parity argument (even state, even $\hat H'$); $\langle H'\rangle = \tfrac54\hbar\omega$ via $\langle T\rangle = \langle V\rangle$; energy not conserved, with the reason.
          - **4** One slip: parity verdict without reason, or factor error in $4\langle V\rangle$.
          - **3** Parity right but $\langle H'\rangle = \tfrac12\hbar\omega$ ("energy is conserved").
          - **2** Tries to sum a series of probabilities with no structure.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** After the change, does $\langle x\rangle$ move? Does $|\Psi(x, t)|^2$ change in time? If so, at what angular frequency, and why that one?`,
        ans: md`$\langle x\rangle = 0$ forever. $|\Psi|^2$ changes: it breathes at $2\omega' = 4\omega$ (period $\pi/2\omega$).`,
        sol: md`
          **How to see it.** Frequencies in $|\Psi|^2$ are energy differences over $\hbar$ of the levels that are present. Only even $n'$ are present.

          - The state has more than one energy ($P_0 < 1$), so it is not stationary: something must move.
          - Present energies: $E_0', E_2', E_4', \dots$, spaced by $2\hbar\omega'$. Every cross term in $|\Psi|^2$ oscillates at a multiple of $2\omega' = 4\omega$, so $|\Psi|^2$ is periodic with period $\tfrac{2\pi}{4\omega} = \tfrac{\pi}{2\omega}$.
          - $\langle x\rangle$: $\hat x$ connects $n$ only to $n \pm 1$, and no odd levels are present, so $\langle x\rangle = 0$ always. Equivalently, an even state stays even (parity commutes with $\hat H'$), and an even density has $\langle x\rangle = 0$.
          - So the motion is a **breathing**: the width oscillates, the center stays put.

          **Rubric**
          - **5** $\langle x\rangle = 0$ with a reason; $|\Psi|^2$ changes; frequency $2\omega' = 4\omega$ from the spacing of the even levels.
          - **4** Frequency given as $\omega'$ (or $\omega$), rest right.
          - **3** "Nothing moves, it is an eigenstate" corrected only partly; or right answers without reasons.
          - **2** Claims $\langle x\rangle$ oscillates.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** For this state, $\langle x^2\rangle(t) = \langle x^2\rangle_0\cos^2\omega't + \dfrac{\langle p^2\rangle_0}{m^2\omega'^2}\sin^2\omega't$. Find the largest and smallest $\sigma_x$ in units of $\sigma_0$, sketch $\sigma_x(t)$ and the density at those two moments, and explain the motion with a classical picture.`,
        ans: md`$\sigma_x$ oscillates between $\sigma_0$ (at $t = 0, \tfrac{\pi}{2\omega}, \dots$) and $\tfrac12\sigma_0$ (at $t = \tfrac{\pi}{4\omega}, \dots$); the density stays Gaussian and breathes.`,
        figs: { br: { svg: figBreathe, cap: 'σ_x(t)/σ₀: two breathing periods in ωt ∈ [0, π].' }, bd: { svg: figBreatheDens, cap: 'The density at its widest (t = 0) and narrowest (t = π/4ω) moments.' } },
        sol: md`
          **Numbers.** $\langle x^2\rangle_0 = \sigma_0^2$ and $\langle p^2\rangle_0 = \tfrac12m\hbar\omega$, so $\tfrac{\langle p^2\rangle_0}{m^2\omega'^2} = \tfrac{m\hbar\omega/2}{4m^2\omega^2} = \tfrac{\hbar}{8m\omega} = \tfrac14\sigma_0^2$. Hence
          $$\sigma_x^2(t) = \sigma_0^2\left(\cos^2\omega't + \tfrac14\sin^2\omega't\right):\qquad \sigma_{\max} = \sigma_0,\ \ \sigma_{\min} = \tfrac12\sigma_0.$$
          ($\langle x\rangle = 0$, so $\sigma_x^2 = \langle x^2\rangle$.)

          [[fig:br]]

          [[fig:bd]]

          **Classical picture.** Think of the state as a cloud of particles spread over $\sigma_0$, released in a spring that is now too stiff for that width. Each particle swings toward the center; they all arrive a quarter period ($\pi/2\omega'$) later. If they started at rest the cloud would collapse to a point. It only shrinks to $\tfrac12\sigma_0$ because the particles also have the momentum spread $\sigma_{p,0}$: the minimum width is $\sigma_{p,0}/m\omega'$. Then the cloud re-expands, twice per oscillation period.

          **Rubric**
          - **5** Both extremes right, a sketch with the period $\pi/2\omega$, and a correct physical explanation of the breathing (including why the minimum is not zero).
          - **4** Numbers and sketch right, explanation missing or vague.
          - **3** Period wrong (e.g. $2\pi/\omega'$) or minimum wrong, with a sensible sketch.
          - **2** Treats the width as constant or as oscillating in $\langle x\rangle$.
          - **1** Little progress.
        `,
      },
    ]),
    prob(6, 2, md`
      **2 · An $\ell = 1$ state in Cartesian form** [20 points, 5 per part]

      A particle moves in a central potential $V(r)$. At $t = 0$ its wavefunction is
      $$\psi(\vec r) = A\,(x + iy + 2z)\,f(r),$$
      with $f$ some real radial function. Useful: $rY_1^{\pm1} = \mp\sqrt{\tfrac{3}{8\pi}}\,(x \pm iy)$, $rY_1^0 = \sqrt{\tfrac{3}{4\pi}}\,z$, $\hat L_z = -i\hbar\,\partial_\varphi$, $\hat L_x = -i\hbar\left(y\,\partial_z - z\,\partial_y\right)$, $\hat L_\pm Y_\ell^m = \hbar\sqrt{\ell(\ell + 1) - m(m \pm 1)}\,Y_\ell^{m\pm1}$, $\hat L_\pm = \hat L_x \pm i\hat L_y$.
    `, [
      {
        q: md`**(a)** Show that $\psi$ is an eigenfunction of $\hat L^2$ and give the eigenvalue. Does your answer depend on $f(r)$? Why or why not?`,
        ans: md`Yes: $L^2 = 2\hbar^2$ ($\ell = 1$). Independent of $f$: $\hat L$ acts only on the angles.`,
        sol: md`
          **How to see it.** $x$, $y$ and $z$ are each $r$ times a combination of $Y_1^m$. So the angular part of $\psi$ lives entirely in the $\ell = 1$ subspace.

          $x + iy = -\sqrt{\tfrac{8\pi}{3}}\,rY_1^1$ and $z = \sqrt{\tfrac{4\pi}{3}}\,rY_1^0$, so
          $$\psi = A\sqrt{\tfrac{4\pi}{3}}\,r f(r)\left[-\sqrt2\,Y_1^1 + 2Y_1^0\right].$$
          Every term has $\ell = 1$, so $\hat L^2\psi = 1\cdot2\,\hbar^2\psi$. $\hat L = \hat{\vec r}\times\hat{\vec p}$ contains only angular derivatives in spherical coordinates, so $r f(r)$ is a constant as far as $\hat L$ is concerned: any $f$ gives the same result.

          **Rubric**
          - **5** Rewrites in $Y_1^m$ (or acts with $\hat L^2$), $2\hbar^2$, and explains why $f$ is irrelevant.
          - **4** Eigenvalue right, $f$-independence asserted without reason.
          - **3** States $\ell = 1$ "because it is linear in $x, y, z$" with no further support.
          - **2** Treats $f$ as affecting $L^2$, or gives $\ell(\ell + 1)$ without $\hbar^2$ and with wrong $\ell$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** $L_z$ is measured. Find the outcomes, their probabilities, and $\langle L_z\rangle$.`,
        ans: md`$+\hbar$ with $\tfrac13$, $0$ with $\tfrac23$, $-\hbar$ never. $\langle L_z\rangle = \tfrac13\hbar$.`,
        sol: md`
          **How to see it.** Read amplitudes off the $Y_1^m$ expansion, not off the Cartesian coefficients: $x + iy$ and $z$ do not have the same norm.

          From (a) the amplitudes are $-\sqrt2$ and $2$ for $m = 1, 0$, so the probabilities are in the ratio $2 : 4$: $P(+\hbar) = \tfrac13$, $P(0) = \tfrac23$. There is no $x - iy$ piece, so $P(-\hbar) = 0$. $\langle L_z\rangle = \tfrac13\hbar$.

          Quick check without $Y$'s: averaged over directions, $|x + iy|^2 = x^2 + y^2 \to \tfrac23r^2$ and $|2z|^2 \to \tfrac43r^2$: ratio $1 : 2$ ✓.

          **Rubric**
          - **5** Correct outcomes, $\tfrac13$, $\tfrac23$, $0$, and $\langle L_z\rangle$.
          - **4** Uses the raw coefficients ($\tfrac15$, $\tfrac45$): basis normalization ignored.
          - **3** Outcomes right, probabilities missing or unnormalized.
          - **2** Outcomes not tied to eigenvalues of $\hat L_z$ (e.g. "$1, i, 2$").
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** The measurement gives $L_z = 0$. What is the wavefunction right after? Is $L^2$ still certain? Then $L_x$ is measured: find the outcomes and their probabilities.`,
        ans: md`$\psi \propto z\,f(r)$ (i.e. $f(r)\,rY_1^0$); $L^2 = 2\hbar^2$ still certain. $L_x = \pm\hbar$ with $\tfrac12$ each; $L_x = 0$ never.`,
        sol: md`
          **How to see it.** Collapse keeps the part of $\psi$ with $m = 0$, radial factor untouched. Then find the $\hat L_x$ eigenfunctions in Cartesian form: they are the $\hat L_z$ ones with the axes relabelled.

          - After: $\psi \propto z\,f(r)$, renormalized. $\hat L^2$ commutes with $\hat L_z$ and this is still pure $\ell = 1$: $2\hbar^2$ with certainty.
          - $\hat L_x(y + iz) = -i\hbar(y\cdot i - z) = \hbar(y + iz)$; similarly $\hat L_x(y - iz) = -\hbar(y - iz)$ and $\hat L_xx = 0$. (Same as $x \pm iy$ for $\hat L_z$, with $x \to y \to z$.)
          - $z = \tfrac{1}{2i}\left[(y + iz) - (y - iz)\right]$: equal weights, no $x$ part. So $L_x = +\hbar$ or $-\hbar$ with $\tfrac12$ each, and $L_x = 0$ is impossible.

          The surprise is the point: a state with $L_z = 0$ sharp is *certain not* to give $L_x = 0$.

          **Rubric**
          - **5** Correct post-measurement state with $f$ kept, $L^2$ still certain (with reason), $\pm\hbar$ at $\tfrac12$, $0$ excluded.
          - **4** Lx probabilities right, but the state after or the $L^2$ statement unjustified.
          - **3** Uses $\tfrac13, \tfrac13, \tfrac13$ "by symmetry" or forgets the collapse.
          - **2** Claims $L_x$ is also $0$ because $L_z$ was.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** Go back to the original state. Find $\langle L_x\rangle$ at $t = 0$. The particle now evolves under $\hat H = \hat p^2/2m + V(r)$ (and $f$ need not be an energy eigenfunction). Do $\langle L_x\rangle$ and the probabilities of (b) change in time? Justify.`,
        ans: md`$\langle L_x\rangle = -\tfrac23\hbar$ (and $\langle L_y\rangle = 0$). Neither changes: $\hat H$ commutes with every $\hat L_i$.`,
        sol: md`
          **Value.** With normalized amplitudes $c_1 = -\sqrt2/\sqrt6$, $c_0 = 2/\sqrt6$: $\hat L_+Y_1^0 = \sqrt2\hbar Y_1^1$, so $\langle L_+\rangle = c_1^*c_0\sqrt2\hbar = -\tfrac23\hbar$. Since $\langle L_+\rangle = \langle L_x\rangle + i\langle L_y\rangle$ and this is real, $\langle L_x\rangle = -\tfrac23\hbar$, $\langle L_y\rangle = 0$. (Cartesian check: $\hat L_x(x + iy + 2z) = -\hbar(2iy + z)$; averaging over directions gives $-\tfrac43\hbar r^2$ against a norm of $2r^2$.)

          **Time.** For a central potential $[\hat H, \hat L_i] = 0$ for all $i$, so by the generalized Ehrenfest theorem $\tfrac{d}{dt}\langle L_i\rangle = \tfrac i\hbar\langle[\hat H, \hat L_i]\rangle = 0$. More strongly, the probability of each eigenvalue of a conserved observable is constant: $\hat H$ and $\hat L_z$ share eigenstates, and time evolution only multiplies them by phases. If $f$ is not an energy eigenfunction, the different radial pieces pick up different phases, but every piece carries the same angular factor, so the angular statistics never change.

          **Rubric**
          - **5** $\langle L_x\rangle = -\tfrac23\hbar$; no change, justified by $[\hat H, \hat L_i] = 0$ (Ehrenfest and/or common eigenstates), including the case of non-stationary $f$.
          - **4** Conservation argument right, $\langle L_x\rangle$ slip (sign or factor).
          - **3** "No change because it is stationary" (it need not be).
          - **2** Claims the probabilities change because the state is not an energy eigenstate.
          - **1** Little progress.
        `,
      },
    ]),
    prob(6, 3, md`
      **3 · Why sodium is yellow** [20 points, 5 per part]

      The outer electron of sodium (11 protons, 10 inner electrons in closed shells) moves in a central potential $V(r)$ that equals $-k/r$ far from the atom ($k = e^2/4\pi\epsilon_0$) but is more attractive inside the inner shells. Its levels are well described by
      $$E_{n\ell} = -\frac{13.6\ \text{eV}}{(n - \delta_\ell)^2},\qquad \delta_s = 1.37,\ \ \delta_p = 0.88,\ \ \delta_d = 0.01,$$
      with $n \ge 3$ for the outer electron. Hydrogen: $E_n = -13.6\ \text{eV}/n^2$. $hc = 1240$ eV·nm. Near the origin a radial function behaves as $R \propto r^\ell$.
    `, [
      {
        q: md`**(a)** Explain why $V(r) \to -k/r$ at large $r$, and why $\delta_s > \delta_p > \delta_d$.`,
        ans: md`Far away the electron sees $+11e - 10e = +e$. Low-$\ell$ states penetrate the core (no centrifugal barrier, $R \propto r^\ell$), where the potential is far more attractive; $s$ penetrates most.`,
        sol: md`
          **How to see it.** The energy is an average of the potential over where the electron is. The quantum defect measures how much extra attraction the electron picks up inside the core.

          - Outside the closed shells, Gauss's law: enclosed charge $11e - 10e = e$, so $V = -k/r$, exactly hydrogen's.
          - Inside, the nuclear charge is less screened: up to $-11k/r$ near the nucleus.
          - The centrifugal term $\hbar^2\ell(\ell + 1)/2mr^2$ pushes high-$\ell$ states out; near the origin $R \propto r^\ell$. An $s$ electron has $R(0) \ne 0$ and spends real time in the core, a $p$ electron less, a $d$ electron almost none ($\delta_d \approx 0$: hydrogen-like). More penetration, more binding, bigger $\delta$.

          **Rubric**
          - **5** Screening argument for $-k/r$ and penetration ordering tied to the centrifugal barrier / $r^\ell$.
          - **4** Both parts, one stated without reason.
          - **3** Only one of the two explained.
          - **2** Attributes the ordering to the $m$ values or to "bigger orbits for bigger $\ell$" only.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Find the 3s and 3p energies and the wavelength of the 3p → 3s photon. Sketch a level diagram comparing hydrogen's $n = 2, 3$ levels with sodium's 3s, 3p, 3d.`,
        ans: md`$E_{3s} = -5.12$ eV, $E_{3p} = -3.03$ eV, $\Delta E = 2.09$ eV, $\lambda \approx 592$ nm (the yellow D line, measured 589 nm). 3d $\approx -1.52$ eV $\approx$ hydrogen $n = 3$.`,
        figs: { na: { svg: figNa, cap: 'Left: hydrogen. Right: sodium. The s level drops furthest; 3d sits on top of hydrogen n = 3.' } },
        sol: md`
          $E_{3s} = -\tfrac{13.6}{1.63^2} = -5.12$ eV, $E_{3p} = -\tfrac{13.6}{2.12^2} = -3.03$ eV, $\Delta E = 2.09$ eV, $\lambda = \tfrac{1240}{2.09} = 592$ nm. Hydrogen $n = 3$: $-1.51$ eV; sodium 3d: $-13.6/2.99^2 = -1.52$ eV.

          [[fig:na]]

          **Rubric**
          - **5** Both energies, the wavelength, and a diagram showing 3s below 3p below 3d ≈ H($n = 3$).
          - **4** Numbers right, diagram missing or wrongly ordered.
          - **3** One arithmetic slip carried through.
          - **2** Uses $n$ instead of $n - \delta$ (hydrogen numbers).
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** True or false? To receive credit, give a brief justification. "Because the 3s electron spends most of its time outside the inner shells, its energy is close to the hydrogen $n = 3$ energy."`,
        ans: md`**False.**`,
        sol: md`
          $E_{3s} = -5.12$ eV versus $-1.51$ eV: more than three times deeper. The small fraction of time spent inside the core is where the potential is many times stronger than $-k/r$ (up to $11\times$), and the energy is an average of the potential weighted by where the electron is, so that fraction dominates. The trap is confusing "most of the time" with "most of the energy".

          **Rubric:** 5 false with the weighting argument (or the number); 4 good reasoning, slightly incomplete; 3 fair; 2 some applicable thoughts; 1 verdict only.
        `,
      },
      {
        q: md`**(d)** True or false? To receive credit, give a brief justification. "Since the inner shells change the potential, the three 3p states with $m = -1, 0, +1$ now have different energies."`,
        ans: md`**False.**`,
        sol: md`
          The core is spherically symmetric, so $V$ is still central and $[\hat H, \hat L_i] = 0$. $\hat L_\pm$ commute with $\hat H$ and carry a state of energy $E$ to one with $m \pm 1$ and the *same* $E$: the $(2\ell + 1)$-fold $m$ degeneracy is exact. What the core lifts is hydrogen's *accidental* $\ell$ degeneracy (3s, 3p, 3d split). Splitting the $m$ levels needs a preferred direction, e.g. a magnetic field (Zeeman).

          **Rubric:** 5 false, central potential ⇒ rotational symmetry ⇒ $m$ degeneracy, and the distinction from the $\ell$ degeneracy; 4 good, missing the distinction; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
    ]),
  ], {
    q: md`Enter: P1 $P(E_0')$; P1 $\langle H'\rangle/\hbar\omega$; P2 $P(L_z = +\hbar)$; P2 $\langle L_x\rangle/\hbar$; P3 the 3p → 3s wavelength in nm.`,
    parts: [
      { lbl: "P(E_0')", ans: 2 * Math.SQRT2 / 3 },
      { lbl: "\\langle H'\\rangle/\\hbar\\omega", ans: 1.25 },
      { lbl: 'P(L_z = +\\hbar)', ans: 1 / 3 },
      { lbl: '\\langle L_x\\rangle/\\hbar', ans: -2 / 3 },
      { lbl: '\\lambda', ans: 592.5, unit: 'nm' },
    ],
    sol: md`$0.943$, $1.25$, $0.333$, $-0.667$, $592$ nm.`,
  });

  // ================================================================== Practice midterm 7
  const pm7 = mock(7, 'harder', intro('Harder than Midterm 1', md`Problems: an oscillator kicked by switching on a field (it becomes a coherent state); a rotor precessing in a field; energy bookkeeping in hydrogen.`), [
    prob(7, 1, md`
      **1 · Switching on a field** [20 points, 5 per part]

      A particle of mass $m$ and charge $q$ is in the ground state $\ket0$ of $\hat H = \dfrac{\hat p^2}{2m} + \dfrac12m\omega^2\hat x^2$. At $t = 0$ a uniform electric field $\mathcal E$ along $x$ is switched on suddenly, so for $t > 0$
      $$\hat H' = \frac{\hat p^2}{2m} + \frac12m\omega^2\hat x^2 - q\mathcal E\hat x.$$
      Ladder operators $\hat a_\pm = \dfrac{1}{\sqrt{2\hbar m\omega}}(\mp i\hat p + m\omega\hat x)$. A coherent state of an oscillator centered at $X = 0$ obeys $\hat a_-\ket\alpha = \alpha\ket\alpha$, $\ket\alpha = e^{-|\alpha|^2/2}\sum_n\frac{\alpha^n}{\sqrt{n!}}\ket n$, $\alpha(t) = \alpha e^{-i\omega t}$, $\langle X\rangle = \sqrt{2\hbar/m\omega}\,\text{Re}\,\alpha$, $\sigma_X = \sqrt{\hbar/2m\omega}$.
    `, [
      {
        q: md`**(a)** Find the stationary states and energies of $\hat H'$ without solving a differential equation. Interpret the result physically.`,
        ans: md`$\hat H' = \tfrac{\hat p^2}{2m} + \tfrac12m\omega^2(\hat x - x_0)^2 - \tfrac12m\omega^2x_0^2$ with $x_0 = \tfrac{q\mathcal E}{m\omega^2}$: $\psi_n'(x) = \psi_n(x - x_0)$, $E_n' = \hbar\omega(n + \tfrac12) - \tfrac{q^2\mathcal E^2}{2m\omega^2}$.`,
        sol: md`
          **How to see it.** A constant force on a spring just moves the equilibrium. Nothing about the spring's stiffness changes, so the ladder of levels is the same, shifted in position and in energy.

          Complete the square: $\tfrac12m\omega^2x^2 - q\mathcal Ex = \tfrac12m\omega^2(x - x_0)^2 - \tfrac12m\omega^2x_0^2$ with $x_0 = q\mathcal E/m\omega^2$ (the classical new equilibrium, where $m\omega^2x_0 = q\mathcal E$). In the variable $X = x - x_0$ (with $\hat P = \hat p$), $\hat H'$ is the old oscillator plus a constant. So $\psi_n'(x) = \psi_n(x - x_0)$, same spacing $\hbar\omega$, all levels lowered by $\tfrac12m\omega^2x_0^2 = \tfrac{q^2\mathcal E^2}{2m\omega^2}$.

          **Rubric**
          - **5** Square completed, $x_0$, shifted states and energies, physical interpretation (moved equilibrium, same spacing).
          - **4** Correct math, no interpretation, or the constant shift missing.
          - **3** States right, energies unshifted.
          - **2** Treats the field term as changing $\omega$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Show that the initial state $\ket0$ is a coherent state of $\hat H'$ and find its $\alpha$ (measure from the new center). Without further calculation, give $P(E_n')$.`,
        ans: md`New lowering operator $\hat a_-' = \hat a_- - x_0\sqrt{\tfrac{m\omega}{2\hbar}}$, so $\hat a_-'\ket0 = -x_0\sqrt{\tfrac{m\omega}{2\hbar}}\ket0$: $\alpha = -x_0\sqrt{m\omega/2\hbar}$. $P(E_n') = e^{-|\alpha|^2}\dfrac{|\alpha|^{2n}}{n!}$, Poisson with mean $|\alpha|^2 = \tfrac{m\omega x_0^2}{2\hbar}$.`,
        sol: md`
          **How to see it.** A coherent state is the ground-state Gaussian, displaced. The old ground state *is* a ground-state Gaussian of the same width (same $\omega$), sitting $x_0$ to the left of the new center.

          One line: $\hat a_-' = \tfrac{1}{\sqrt{2\hbar m\omega}}(i\hat p + m\omega(\hat x - x_0)) = \hat a_- - x_0\sqrt{\tfrac{m\omega}{2\hbar}}$. Since $\hat a_-\ket0 = 0$, $\hat a_-'\ket0 = -x_0\sqrt{\tfrac{m\omega}{2\hbar}}\ket0$: an eigenstate of the new lowering operator, i.e. a coherent state with $\alpha = -x_0\sqrt{m\omega/2\hbar}$. Check: $\langle X\rangle = \sqrt{2\hbar/m\omega}\,\alpha = -x_0$ ✓.

          The expansion $\ket\alpha = e^{-|\alpha|^2/2}\sum\tfrac{\alpha^n}{\sqrt{n!}}\ket n'$ gives the Poisson distribution directly.

          **Rubric**
          - **5** Eigenvalue equation for the new $\hat a_-'$ shown (or displaced-Gaussian argument made precise), $\alpha$ with sign, Poisson $P(n)$.
          - **4** Right $\alpha$ magnitude, sign or reference point wrong; or $P(n)$ missing.
          - **3** "It is a displaced Gaussian so coherent" asserted, no $\alpha$.
          - **2** Claims $\ket0$ is the new ground state.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** Find $\langle x\rangle(t)$ and $\sigma_x(t)$ and sketch them. Explain the motion with a classical picture.`,
        ans: md`$\langle x\rangle = x_0(1 - \cos\omega t)$, $\sigma_x = \sqrt{\hbar/2m\omega}$ for all $t$.`,
        figs: { sh: { svg: figShift, cap: '⟨x⟩(t) for x₀ = 2√(ħ/mω), with ⟨x⟩ ± σ_x: the packet swings between 0 and 2x₀ without spreading.' } },
        sol: md`
          $\alpha(t) = \alpha e^{-i\omega t}$, so $\langle X\rangle = -x_0\cos\omega t$ and $\langle x\rangle = x_0 + \langle X\rangle = x_0(1 - \cos\omega t)$. A coherent state keeps the ground-state width: $\sigma_x = \sqrt{\hbar/2m\omega}$ constant.

          [[fig:sh]]

          **Classical picture.** A mass at rest at $x = 0$ suddenly finds its equilibrium at $x_0$: it oscillates between $0$ and $2x_0$. Ehrenfest agrees exactly (the force is linear in $x$): $m\tfrac{d^2\langle x\rangle}{dt^2} = -m\omega^2(\langle x\rangle - x_0)$ with $\langle x\rangle(0) = 0$, $\langle p\rangle(0) = 0$.

          **Rubric**
          - **5** Both functions, a sketch showing oscillation between $0$ and $2x_0$ with constant width, classical/Ehrenfest explanation.
          - **4** Formulas right, sketch or explanation weak.
          - **3** Oscillation about $0$ instead of $x_0$, or spreading width.
          - **2** No motion ("energy eigenstate").
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** Take $x_0 = 2\sqrt{\hbar/m\omega}$. Find the probability that an energy measurement gives the new ground energy, the most likely outcome(s), and $\langle H'\rangle - E_0'$. Then compute $\langle H'\rangle$ directly in $\ket0$ and explain why the two agree.`,
        ans: md`$|\alpha|^2 = 2$: $P_0 = e^{-2} = 0.135$; most likely $n = 1$ and $n = 2$ (tied, $0.271$ each); $\langle H'\rangle - E_0' = 2\hbar\omega$. Directly $\langle 0|\hat H'|0\rangle = \tfrac12\hbar\omega$; and $E_0' + 2\hbar\omega = \tfrac12\hbar\omega - 2\hbar\omega + 2\hbar\omega$ ✓.`,
        sol: md`
          $|\alpha|^2 = \tfrac{m\omega}{2\hbar}\cdot\tfrac{4\hbar}{m\omega} = 2$. Poisson: $P_n = e^{-2}2^n/n!$: $0.135, 0.271, 0.271, 0.180, \dots$ For a coherent state $\langle H'\rangle - E_0' = \hbar\omega\langle n\rangle = 2\hbar\omega$.

          Directly: $\langle 0|\hat H'|0\rangle = \langle 0|\hat H|0\rangle - q\mathcal E\langle 0|\hat x|0\rangle = \tfrac12\hbar\omega - 0$. And $E_0' = \tfrac12\hbar\omega - \tfrac12m\omega^2x_0^2 = \tfrac12\hbar\omega - 2\hbar\omega$, so $E_0' + 2\hbar\omega = \tfrac12\hbar\omega$ ✓. Of course they agree: it is one number, $\bra0\hat H'\ket0$, computed in two bases. The sudden switch costs no energy here because the added potential $-q\mathcal Ex$ averages to zero in the initial state.

          **Rubric**
          - **5** $|\alpha|^2 = 2$, $P_0$, the tie at $n = 1, 2$, $2\hbar\omega$, the direct computation and the "same expectation value, two bases" reason.
          - **4** Numbers right, explanation missing.
          - **3** One wrong number (e.g. $|\alpha|^2 = 4$) carried consistently.
          - **2** Uses $P_n$ uniform or claims $P_0 = 1$.
          - **1** Little progress.
        `,
      },
    ]),
    prob(7, 2, md`
      **2 · A rotor in a field** [20 points, 5 per part]

      A rigid rotor (a particle on a sphere) with moment of inertia $I$ carries a magnetic moment, so in a field along $z$
      $$\hat H = \frac{\hat L^2}{2I} + \omega_0\hat L_z.$$
      Use $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ and cyclic permutations, $[\hat L^2, \hat L_i] = 0$, $\dfrac{d\langle Q\rangle}{dt} = \dfrac i\hbar\left\langle[\hat H, \hat Q]\right\rangle$, $\hat L_\pm = \hat L_x \pm i\hat L_y$, $\hat L_\pm Y_\ell^m = \hbar\sqrt{\ell(\ell + 1) - m(m \pm 1)}\,Y_\ell^{m\pm1}$.
    `, [
      {
        q: md`**(a)** Find the energies. Which degeneracy of the free rotor survives and which is removed? Explain in terms of symmetry.`,
        ans: md`$E_{\ell m} = \dfrac{\hbar^2\ell(\ell + 1)}{2I} + \hbar\omega_0m$ with eigenstates $Y_\ell^m$. The $(2\ell + 1)$-fold $m$ degeneracy is removed (levels split evenly by $\hbar\omega_0$); the field picks out $z$, leaving only rotations about $z$ as a symmetry.`,
        sol: md`
          $\hat H$ is built from $\hat L^2$ and $\hat L_z$, which commute and share the eigenfunctions $Y_\ell^m$: no approximation needed. The free rotor has full rotational symmetry, so all $2\ell + 1$ values of $m$ share an energy. The field breaks it down to rotations about $z$: $\hat L_z$ is still conserved, $\hat L_x$, $\hat L_y$ are not, and nothing relates $m$ to $-m$ any more, so each $m$ gets its own energy. (Levels of different $\ell$ can cross accidentally for special $\omega_0$; that is not a symmetry.)

          **Rubric**
          - **5** Energies, eigenstates, which degeneracy is lifted, symmetry explanation.
          - **4** Energies right, symmetry argument vague.
          - **3** Energies right, degeneracy discussion wrong (e.g. "$\pm m$ still degenerate").
          - **2** Tries to diagonalize without noticing $Y_\ell^m$ are eigenstates.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Use the generalized Ehrenfest theorem to find $\tfrac{d}{dt}$ of $\langle L_x\rangle$, $\langle L_y\rangle$, $\langle L_z\rangle$ and $\langle L^2\rangle$. Solve for $\langle L_x\rangle(t)$, $\langle L_y\rangle(t)$ in general.`,
        ans: md`$\dot{\langle L_x\rangle} = -\omega_0\langle L_y\rangle$, $\dot{\langle L_y\rangle} = \omega_0\langle L_x\rangle$, $\dot{\langle L_z\rangle} = \dot{\langle L^2\rangle} = 0$: $(\langle L_x\rangle, \langle L_y\rangle)$ rotates counterclockwise about $z$ at $\omega_0$.`,
        sol: md`
          Only the $\omega_0\hat L_z$ term fails to commute.
          $$[\hat H, \hat L_x] = \omega_0[\hat L_z, \hat L_x] = i\hbar\omega_0\hat L_y \Rightarrow \frac{d\langle L_x\rangle}{dt} = \frac i\hbar(i\hbar\omega_0)\langle L_y\rangle = -\omega_0\langle L_y\rangle,$$
          $$[\hat H, \hat L_y] = \omega_0[\hat L_z, \hat L_y] = -i\hbar\omega_0\hat L_x \Rightarrow \frac{d\langle L_y\rangle}{dt} = \omega_0\langle L_x\rangle.$$
          $\hat L_z$ and $\hat L^2$ commute with $\hat H$: constant. Solution: $\langle L_x\rangle + i\langle L_y\rangle = (\langle L_x\rangle_0 + i\langle L_y\rangle_0)e^{i\omega_0t}$, a counterclockwise rotation (seen from $+z$) at angular frequency $\omega_0$, independent of $I$ and $\ell$: **Larmor precession**.

          **Rubric**
          - **5** All four derivatives with commutators shown, solved, direction and frequency stated.
          - **4** One sign error (clockwise) or $\langle L^2\rangle$ omitted.
          - **3** Correct commutators, equations not solved.
          - **2** Uses $[\hat L^2, \hat L_x] \ne 0$ or forgets the $i/\hbar$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** At $t = 0$, $\psi = \tfrac{1}{\sqrt2}\left(Y_1^1 + Y_1^0\right)$. Find $\langle L_x\rangle$, $\langle L_y\rangle$, $\langle L_z\rangle$ as functions of time and sketch $\langle\vec L\rangle(t)$.`,
        ans: md`$\langle L_x\rangle = \tfrac{\hbar}{\sqrt2}\cos\omega_0t$, $\langle L_y\rangle = \tfrac{\hbar}{\sqrt2}\sin\omega_0t$, $\langle L_z\rangle = \tfrac12\hbar$: a cone about $z$.`,
        figs: { pr: { svg: figPrecess, cap: 'The tip of ⟨L⟩ seen from +z: a circle of radius ħ/√2, counterclockwise, at height ⟨L_z⟩ = ħ/2.' } },
        sol: md`
          At $t = 0$: $\langle L_+\rangle = c_1^*c_0\,\sqrt2\hbar = \tfrac12\sqrt2\hbar = \tfrac{\hbar}{\sqrt2}$, real, so $\langle L_x\rangle_0 = \tfrac{\hbar}{\sqrt2}$, $\langle L_y\rangle_0 = 0$. $\langle L_z\rangle = \tfrac12(\hbar) + \tfrac12(0) = \tfrac12\hbar$. Then (b) rotates the transverse part. (Directly: the $m = 1$ term picks up an extra $e^{-i\omega_0t}$ relative to $m = 0$, so $\langle L_+\rangle \propto e^{+i\omega_0t}$ ✓.)

          [[fig:pr]]

          **Rubric**
          - **5** All three, correct amplitude $\hbar/\sqrt2$, a sketch of the cone/circle with direction.
          - **4** Amplitude or direction slip.
          - **3** $\langle L_z\rangle$ right, transverse parts wrong but oscillating.
          - **2** All components constant.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** In (c), $|\langle\vec L\rangle| = \tfrac{\sqrt3}{2}\hbar$, yet $L^2 = 2\hbar^2$ with certainty. Explain the difference. Which of your results in (c) would change if the rotor were instead in a superposition of $Y_5^5$ and $Y_5^4$ in the same field?`,
        ans: md`$\langle\vec L\rangle$ is an average vector; the components fluctuate (at most one can be sharp), so the average is shorter than the rms length. With $\ell = 5$ the lengths change but the precession frequency $\omega_0$ and direction do not.`,
        sol: md`
          $\langle L^2\rangle = \langle L_x^2\rangle + \langle L_y^2\rangle + \langle L_z^2\rangle$, while $|\langle\vec L\rangle|^2 = \langle L_x\rangle^2 + \langle L_y\rangle^2 + \langle L_z\rangle^2$. The difference is $\sigma_{L_x}^2 + \sigma_{L_y}^2 + \sigma_{L_z}^2 > 0$: components that do not commute cannot all be sharp, so the vector "jitters" and its average is shorter. Even $Y_1^1$ has $|\langle\vec L\rangle| = \hbar < \sqrt2\hbar$ (the vector-model cone).

          For $\ell = 5$: $\tfrac{d}{dt}\langle L_x\rangle = -\omega_0\langle L_y\rangle$ holds in *any* state, so the precession is still counterclockwise at $\omega_0$ (adjacent $m$ always differ in energy by $\hbar\omega_0$). The values of $\langle L_z\rangle = 4.5\hbar$ and the circle's radius change.

          **Rubric**
          - **5** Fluctuations/non-commuting components as the reason, the uncertainty sum, and the $\ell$-independent frequency.
          - **4** Explanation right, $\ell = 5$ part incomplete.
          - **3** "Quantum vectors are shorter" with no mechanism.
          - **2** Claims the frequency depends on $\ell$ or $I$.
          - **1** Little progress.
        `,
      },
    ]),
    prob(7, 3, md`
      **3 · Energy bookkeeping in hydrogen** [20 points, 5 per part]

      Hydrogen: $V(r) = -k/r$, ground state $\psi_{100} = \dfrac{1}{\sqrt{\pi a^3}}e^{-r/a}$ with $a = \hbar^2/mk = 0.0529$ nm, $E_n = -\dfrac{k}{2an^2} = -\dfrac{13.6\ \text{eV}}{n^2}$. Useful: $\int_0^\infty r^ne^{-\beta r}dr = n!/\beta^{n+1}$, $[\hat p_x^2, \hat x] = -2i\hbar\hat p_x$, $[V(\vec r), \hat p_x] = i\hbar\,\partial V/\partial x$, $\dfrac{d\langle Q\rangle}{dt} = \dfrac i\hbar\left\langle[\hat H, \hat Q]\right\rangle$.
    `, [
      {
        q: md`**(a)** Apply the generalized Ehrenfest theorem to $\hat Q = \hat{\vec r}\cdot\hat{\vec p}$ and show that in any stationary state $2\langle T\rangle = \langle\vec r\cdot\nabla V\rangle$. What does this give for the Coulomb potential? For the oscillator?`,
        ans: md`$\tfrac{d}{dt}\langle\vec r\cdot\vec p\rangle = 2\langle T\rangle - \langle\vec r\cdot\nabla V\rangle = 0$. Coulomb: $\vec r\cdot\nabla V = -V$, so $\langle T\rangle = -\tfrac12\langle V\rangle = -E$, $\langle V\rangle = 2E$. Oscillator: $\langle T\rangle = \langle V\rangle$.`,
        sol: md`
          Per component: $[\hat p_x^2/2m, \hat x\hat p_x] = [\hat p_x^2, \hat x]\hat p_x/2m = -\tfrac{i\hbar}{m}\hat p_x^2$ and $[V, \hat x\hat p_x] = \hat x[V, \hat p_x] = i\hbar\,x\,\partial_xV$. Summing over $x, y, z$:
          $$[\hat H, \hat{\vec r}\cdot\hat{\vec p}] = -2i\hbar\hat T + i\hbar\,\vec r\cdot\nabla V \ \Rightarrow\ \frac{d}{dt}\langle\vec r\cdot\vec p\rangle = 2\langle T\rangle - \langle\vec r\cdot\nabla V\rangle.$$
          In a stationary state every expectation value is constant, so the left side is $0$. Coulomb: $\vec r\cdot\nabla(-k/r) = k/r = -V$, so $2\langle T\rangle = -\langle V\rangle$; with $E = \langle T\rangle + \langle V\rangle$: $\langle T\rangle = -E$, $\langle V\rangle = 2E$. Oscillator: $\vec r\cdot\nabla V = 2V$, so $\langle T\rangle = \langle V\rangle$. (Power law $V \propto r^s$: $2\langle T\rangle = s\langle V\rangle$.)

          **Rubric**
          - **5** Both commutators, the stationary-state argument, both special cases.
          - **4** Derivation right, one special case wrong or missing.
          - **3** Quotes the virial theorem without deriving it.
          - **2** Sets $d\langle Q\rangle/dt = 0$ without saying why.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Compute $\langle 1/r\rangle$ in the ground state and use it to check (a). Give $\langle T\rangle$ and $\langle V\rangle$ in eV.`,
        ans: md`$\langle 1/r\rangle = 1/a$; $\langle V\rangle = -k/a = 2E_1 = -27.2$ eV; $\langle T\rangle = 13.6$ eV.`,
        sol: md`
          $\langle 1/r\rangle = \dfrac{4\pi}{\pi a^3}\displaystyle\int_0^\infty r\,e^{-2r/a}dr = \frac{4}{a^3}\cdot\frac{a^2}{4} = \frac1a.$ So $\langle V\rangle = -k/a = 2\left(-\tfrac{k}{2a}\right) = 2E_1 = -27.2$ eV ✓, and $\langle T\rangle = E_1 - \langle V\rangle = +13.6$ eV $= -E_1$ ✓.

          **Rubric**
          - **5** Integral with the $4\pi r^2$ measure, $1/a$, both energies, the check stated.
          - **4** Measure right, arithmetic slip.
          - **3** Forgets $r^2$ in $d^3r$ (gets a divergent or wrong integral) but checks sensibly.
          - **2** Uses the most probable radius as $\langle r\rangle$ and inverts it without justification.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** True or false? To receive credit, give a brief justification. "In the ground state the electron's average kinetic energy is negative, because its total energy is negative."`,
        ans: md`**False.**`,
        sol: md`
          $\langle T\rangle = \tfrac{\langle p^2\rangle}{2m} \ge 0$ for any state ($\hat p^2$ has non-negative eigenvalues), and here $\langle T\rangle = +13.6$ eV. The total is negative because $\langle V\rangle = -27.2$ eV outweighs it. "Bound" means $E < V(\infty) = 0$, not $T < 0$.

          **Rubric:** 5 false with $\langle p^2\rangle \ge 0$ (or the value) and the role of $\langle V\rangle$; 4 good reasoning slightly incomplete; 3 fair; 2 some applicable thoughts; 1 verdict only.
        `,
      },
      {
        q: md`**(d)** True or false? To receive credit, give a brief justification. "For the state $\tfrac{1}{\sqrt2}(\psi_{100} + \psi_{200})$, the relation $2\langle T\rangle = -\langle V\rangle$ holds at every instant."`,
        ans: md`**False.**`,
        sol: md`
          The derivation in (a) used $\tfrac{d}{dt}\langle\vec r\cdot\vec p\rangle = 0$, which is guaranteed only in a stationary state. In this superposition the cross terms make $\langle\vec r\cdot\vec p\rangle$ oscillate at $(E_2 - E_1)/\hbar$, so $2\langle T\rangle + \langle V\rangle = \tfrac{d}{dt}\langle\vec r\cdot\vec p\rangle \ne 0$ at most instants. (Indeed $\langle 100|\hat T|200\rangle = -\langle 100|V|200\rangle \ne 0$.) The relation still holds on the **time average**, since the average of a derivative of a bounded quantity vanishes.

          **Rubric:** 5 false, stationary-state assumption identified, cross terms, time-average remark; 4 good reasoning without the time average; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
    ]),
  ], {
    q: md`Enter: P1 $P(E_0')$ for $x_0 = 2\sqrt{\hbar/m\omega}$; P1 $(\langle H'\rangle - E_0')/\hbar\omega$; P2 $|\langle\vec L\rangle|/\hbar$ in (c); P3 $\langle T\rangle$ in eV.`,
    parts: [
      { lbl: "P(E_0')", ans: Math.exp(-2) },
      { lbl: "(\\langle H'\\rangle - E_0')/\\hbar\\omega", ans: 2 },
      { lbl: '|\\langle\\vec L\\rangle|/\\hbar', ans: Math.sqrt(3) / 2 },
      { lbl: '\\langle T\\rangle', ans: 13.6, unit: 'eV' },
    ],
    sol: md`$0.135$, $2$, $0.866$, $13.6$ eV.`,
  });

  // ================================================================== Practice midterm 8
  const figSxSp = PF.plot({
    w: 380, h: 210, x: [0, PI], y: [0.3, 0.85], xl: '\\omega t', yl: '\\sigma_x\\sigma_p/\\hbar',
    xt: [[PI / 4, '\\tfrac\\pi4'], [PI / 2, '\\tfrac\\pi2'], [3 * PI / 4, '\\tfrac{3\\pi}4'], [PI, '\\pi']], yt: [[0.5, '\\tfrac12'], [0.75, '\\tfrac34']],
    hlines: [[0.5, '\\text{bound } \\hbar/2'], [Math.SQRT1_2, '1/\\sqrt2']],
    curves: [{ f: (t) => 0.5 * Math.sqrt(2 + 0.25 * Math.sin(2 * t) ** 2) }],
  });
  const R10 = (r) => 2 * Math.exp(-r), R20 = (r) => Math.SQRT1_2 * (1 - r / 2) * Math.exp(-r / 2), R21 = (r) => r * Math.exp(-r / 2) / Math.sqrt(24);
  const figRnl = PF.plot({
    w: 380, h: 230, x: [0, 8], y: [-0.15, 2.1], xl: 'r/a', yl: 'R\\,a^{3/2}', zero: true,
    xt: [[2, '2'], [4, '4'], [6, '6']], yt: [[0.5, '0.5'], [1, '1'], [2, '2']],
    curves: [{ f: R10, lab: '1s', labAt: 0.9, dy: -6 }, { f: R20, cls: 'acc', lab: '2s', labAt: 0.25, dx: 8, dy: -2 }, { f: R21, cls: 'dim', lab: '2p', labAt: 4.5, dy: -10 }],
  });

  const pm8 = mock(8, 'harder', intro('Harder than Midterm 1', md`Problems: how uncertain a moving oscillator is; $\hat L_z$ on the sphere, compared with Midterm 1's ring; which electrons visit the nucleus.`), [
    prob(8, 1, md`
      **1 · How uncertain is a moving oscillator?** [20 points, 5 per part]

      Harmonic oscillator of mass $m$ and frequency $\omega$, stationary states $\ket n$ with $E_n = \hbar\omega(n + \tfrac12)$, and
      $$\hat x = \sqrt{\frac{\hbar}{2m\omega}}\,(\hat a_+ + \hat a_-),\quad \hat p = i\sqrt{\frac{\hbar m\omega}{2}}\,(\hat a_+ - \hat a_-),\quad \hat a_+\ket n = \sqrt{n + 1}\ket{n + 1},\quad \hat a_-\ket n = \sqrt n\ket{n - 1}.$$
    `, [
      {
        q: md`**(a)** Find $\sigma_x\sigma_p$ in $\ket n$. Explain physically why it grows with $n$ and why it does not depend on time.`,
        ans: md`$\sigma_x\sigma_p = \left(n + \tfrac12\right)\hbar$. Higher states spread over a wider region *and* oscillate faster (more nodes): both spreads grow. Stationary, so constant.`,
        sol: md`
          $\langle x\rangle = \langle p\rangle = 0$ ($\hat x, \hat p$ change $n$ by one). $\hat x^2 = \tfrac{\hbar}{2m\omega}(\hat a_+^2 + \hat a_+\hat a_- + \hat a_-\hat a_+ + \hat a_-^2)$; only the middle terms survive: $\langle n|\hat a_+\hat a_- + \hat a_-\hat a_+|n\rangle = n + (n + 1)$. So $\sigma_x^2 = \tfrac{\hbar}{m\omega}(n + \tfrac12)$, and likewise $\sigma_p^2 = \hbar m\omega(n + \tfrac12)$. Product $(n + \tfrac12)\hbar$.

          Physically: $\psi_n$ reaches out to the classical turning point $\sqrt{(2n + 1)\hbar/m\omega}$ (bigger $\sigma_x$) and has $n$ nodes (shorter wavelengths, bigger $\sigma_p$). In a stationary state $|\Psi|^2$ and every expectation value are frozen.

          **Rubric**
          - **5** Ladder calculation of both spreads, product, both explanations.
          - **4** Product right, explanation thin.
          - **3** Quotes $(n + \tfrac12)\hbar$ without derivation but explains.
          - **2** Claims $\hbar/2$ for all $n$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Now $\ket{\Psi(0)} = \tfrac{1}{\sqrt2}\left(\ket n + \ket{n + 1}\right)$. Find $\langle x\rangle$, $\langle p\rangle$, $\langle x^2\rangle$, $\langle p^2\rangle$ at $t = 0$, and $\sigma_x\sigma_p$. Without calculating, which of these four change in time?`,
        ans: md`$\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\sqrt{n + 1}$, $\langle p\rangle = 0$, $\langle x^2\rangle = \tfrac{\hbar}{m\omega}(n + 1)$, $\langle p^2\rangle = \hbar m\omega(n + 1)$; $\sigma_x\sigma_p = \tfrac{(n + 1)\hbar}{\sqrt2}$. $\langle x\rangle$, $\langle p\rangle$ oscillate; $\langle x^2\rangle$, $\langle p^2\rangle$ are constant.`,
        sol: md`
          **How to see it.** $\hat x$ and $\hat p$ connect neighbors ($\Delta n = \pm1$): they see the interference between $\ket n$ and $\ket{n + 1}$. $\hat x^2$ and $\hat p^2$ connect $\Delta n = 0, \pm2$: with only neighbors present they see no interference at all, so they are time-independent.

          - $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cdot2\cdot\tfrac12\sqrt{n + 1}$; $\langle p\rangle = i\sqrt{\tfrac{\hbar m\omega}{2}}\left(\tfrac12\sqrt{n + 1} - \tfrac12\sqrt{n + 1}\right) = 0$.
          - $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}\cdot\tfrac12\left[(2n + 1) + (2n + 3)\right] = \tfrac{\hbar}{m\omega}(n + 1)$, same pattern for $\langle p^2\rangle$.
          - $\sigma_x^2 = \tfrac{\hbar}{2m\omega}(n + 1)$, $\sigma_p^2 = \hbar m\omega(n + 1)$, product $\tfrac{(n + 1)\hbar}{\sqrt2}$.

          **Rubric**
          - **5** All four values, the product, and the selection-rule reason for which ones move.
          - **4** Values right, the time question answered without reason.
          - **3** One value wrong (often a missed cross term in $\langle x\rangle$).
          - **2** Treats the state as stationary, or includes cross terms in $\langle x^2\rangle$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** Find $\sigma_x\sigma_p$ as a function of time and sketch it for $n = 0$ together with the bound $\hbar/2$.`,
        ans: md`$\sigma_x\sigma_p = \tfrac{\hbar}{2}(n + 1)\sqrt{2 + \tfrac14\sin^22\omega t}$: between $\tfrac{(n + 1)\hbar}{\sqrt2}$ and $\tfrac34(n + 1)\hbar$, period $\tfrac{\pi}{2\omega}$.`,
        figs: { sp: { svg: figSxSp, cap: 'σ_xσ_p for (|0⟩ + |1⟩)/√2: it never reaches the bound ħ/2.' } },
        sol: md`
          The relative phase is $e^{-i\omega t}$, so $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\sqrt{n + 1}\cos\omega t$ and $\langle p\rangle = -\sqrt{\tfrac{\hbar m\omega}{2}}\sqrt{n + 1}\sin\omega t$, while $\langle x^2\rangle$, $\langle p^2\rangle$ stay put. Then
          $$\sigma_x^2 = \tfrac{\hbar}{2m\omega}(n + 1)\left(2 - \cos^2\omega t\right),\qquad \sigma_p^2 = \tfrac{\hbar m\omega}{2}(n + 1)\left(2 - \sin^2\omega t\right),$$
          and $(2 - \cos^2)(2 - \sin^2) = (1 + \sin^2)(1 + \cos^2) = 2 + \sin^2\cos^2 = 2 + \tfrac14\sin^22\omega t$.

          [[fig:sp]]

          **Rubric**
          - **5** Time-dependent spreads, the product formula, a sketch with the right extremes and period.
          - **4** Formula right, sketch period wrong (e.g. $2\pi/\omega$).
          - **3** Spreads right, product not simplified, no sketch.
          - **2** Product constant.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** Explain why the period in (c) is $\pi/2\omega$, and why $\sigma_x\sigma_p$ depends on the phase of the motion although $\langle H\rangle$, $\langle x^2\rangle$ and $\langle p^2\rangle$ do not. Can a superposition of just two neighboring levels ever reach $\hbar/2$?`,
        ans: md`$\sigma_x$ is smallest when $\langle x\rangle$ is largest (turning point) and $\sigma_p$ when $\langle p\rangle$ is largest; the product is symmetric under that swap, so it repeats every quarter period. No: the minimum is $(n + 1)\hbar/\sqrt2 \ge \hbar/\sqrt2$.`,
        sol: md`
          $\sigma_x^2 = \langle x^2\rangle - \langle x\rangle^2$: a constant minus $\cos^2\omega t$. The spread in $x$ is smallest at the turning points, where $\langle x\rangle$ is largest; the spread in $p$ is smallest at the center, where $|\langle p\rangle|$ is largest. $\cos^2$ and $\sin^2$ each have period $\pi/\omega$, and the product is unchanged under $\cos \leftrightarrow \sin$ (a shift by a quarter period), so it repeats every $\pi/2\omega$. The two-level superposition can never reach $\hbar/2$: its best is $\hbar/\sqrt2 \approx 0.71\hbar$ at $n = 0$. Staying at $\hbar/2$ while moving needs a coherent state, which uses all levels with Poisson weights.

          **Rubric**
          - **5** Both mechanisms (turning point vs center), the symmetry giving $\pi/2\omega$, and the "never $\hbar/2$" verdict with the number.
          - **4** Mechanism right, period argument missing.
          - **3** Verdict right, no mechanism.
          - **2** Says "it oscillates because energy oscillates".
          - **1** Little progress.
        `,
      },
    ]),
    prob(8, 2, md`
      **2 · $\hat L_z$ on the sphere** [20 points, 5 per part]

      On the unit sphere, wavefunctions are $f(\theta, \varphi)$ with $f(\theta, \varphi + 2\pi) = f(\theta, \varphi)$ and inner product $\braket{f|g} = \int_0^\pi\!\int_0^{2\pi}f^*g\,\sin\theta\,d\varphi\,d\theta$. Consider $\hat Q = -i\hbar\,\partial/\partial\varphi$ (this is $\hat L_z$). On Midterm 1 you studied $i\,d/d\varphi$ on a ring. Useful: $Y_0^0 = \tfrac{1}{\sqrt{4\pi}}$, $Y_2^0 = \sqrt{\tfrac{5}{16\pi}}(3\cos^2\theta - 1)$, $Y_2^{\pm2} = \sqrt{\tfrac{15}{32\pi}}\sin^2\theta\,e^{\pm2i\varphi}$.
    `, [
      {
        q: md`**(a)** Show that $\hat Q$ is Hermitian. Where do you need periodicity, and why does the $\sin\theta$ in the measure cause no trouble?`,
        ans: md`Integrate by parts in $\varphi$; the boundary term $[f^*g]_0^{2\pi}$ vanishes by periodicity. $\sin\theta$ does not depend on $\varphi$, so it rides along.`,
        sol: md`
          $$\braket{f|\hat Qg} = \int_0^\pi\sin\theta\,d\theta\int_0^{2\pi}f^*(-i\hbar\,\partial_\varphi g)\,d\varphi = \int_0^\pi\sin\theta\,d\theta\left\{-i\hbar\left[f^*g\right]_0^{2\pi} + \int_0^{2\pi}(-i\hbar\,\partial_\varphi f)^*g\,d\varphi\right\}.$$
          The bracket vanishes because $f$ and $g$ take the same values at $\varphi = 0$ and $2\pi$: that is where periodicity is used. The rest is $\braket{\hat Qf|g}$ (note $(-i)^* = +i$ moved the sign correctly). The measure factor $\sin\theta$ is independent of $\varphi$, so the $\varphi$-integration by parts never touches it.

          **Rubric**
          - **5** Integration by parts, conjugation of $-i$, boundary term killed by periodicity (stated), measure remark.
          - **4** Boundary term dropped without the periodicity argument, or a conjugation slip.
          - **3** Correct definition and start, argument incomplete.
          - **2** Wrong criterion (e.g. "eigenvalues look real").
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Find the eigenvalues and eigenfunctions of $\hat Q$. Explain why the eigenvalues are integer multiples of $\hbar$, and why fixing the eigenvalue does not fix the eigenfunction.`,
        ans: md`$g(\theta)e^{im\varphi}$ with eigenvalue $m\hbar$, $m \in \mathbb Z$ (periodicity). Any $g(\theta)$ works: each eigenvalue is infinitely degenerate; $\hat L^2$ is needed to fix the $\theta$ dependence.`,
        sol: md`
          $-i\hbar\,\partial_\varphi f = q f$ gives $f = g(\theta)e^{iq\varphi/\hbar}$. Periodicity: $e^{2\pi iq/\hbar} = 1$, so $q = m\hbar$ with $m \in \mathbb Z$: discrete. Unlike the ring, the sphere has a second coordinate, and $\hat L_z$ says nothing about $\theta$: every $g(\theta)$ gives the same eigenvalue. To label states uniquely you add a compatible observable, $\hat L^2$ (which commutes with $\hat L_z$): then $g(\theta) \propto P_\ell^m(\cos\theta)$ and the label is $(\ell, m)$.

          **Rubric**
          - **5** Eigenfunctions with arbitrary $g(\theta)$, $m \in \mathbb Z$ from periodicity, the degeneracy and the role of $\hat L^2$.
          - **4** Eigenvalues right, degeneracy not noticed.
          - **3** $m$ left continuous.
          - **2** Wrong functional form.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** The commutation relations $[\hat L_i, \hat L_j] = i\hbar\epsilon_{ijk}\hat L_k$ alone also allow $L_z = \pm\tfrac12\hbar$. What rules this out for a particle's orbital motion? What exactly goes wrong with $e^{i\varphi/2}$?`,
        ans: md`Single-valuedness: $(\theta, \varphi + 2\pi)$ is the same point, so $\psi$ must repeat. $e^{i\varphi/2}$ changes sign after one turn; with it in the space, $\hat L_z$ would not even be Hermitian (boundary term $\ne 0$).`,
        sol: md`
          The algebra only knows the commutators; the extra input is that $\psi$ is a function of position, and $\varphi$ and $\varphi + 2\pi$ label the same point. $e^{i\varphi/2} \to e^{i\varphi/2}e^{i\pi} = -e^{i\varphi/2}$: not a function on the sphere. Concretely, with $f = e^{i\varphi/2}$ and $g = 1$ the boundary term is $[f^*g]_0^{2\pi} = e^{-i\pi} - 1 = -2 \ne 0$, so the Hermiticity proof of (a) fails. Half-integer values do exist in nature, but for spin, which is not a function of $\theta, \varphi$.

          **Rubric**
          - **5** Single-valuedness stated and applied to $e^{i\varphi/2}$, plus the Hermiticity failure (or an equivalent concrete consequence).
          - **4** Single-valuedness only.
          - **3** "Because $m$ must be an integer" (circular).
          - **2** Claims the commutators forbid it.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** A particle on the sphere is in $f = A\sin^2\theta\cos^2\varphi$. Find the outcomes and probabilities of $L_z$ (you do not need $A$), then of $L^2$. Compare with Midterm 1 Problem 2(d).`,
        ans: md`$L_z$: $0$ with $\tfrac23$, $\pm2\hbar$ with $\tfrac16$ each, exactly as on Midterm 1. $L^2$: $0$ with $\tfrac59$, $6\hbar^2$ with $\tfrac49$.`,
        sol: md`
          **$L_z$.** $f$ factorizes, $g(\theta)h(\varphi)$, so the $L_z$ probabilities depend only on $h = \cos^2\varphi = \tfrac12 + \tfrac14e^{2i\varphi} + \tfrac14e^{-2i\varphi}$: amplitudes $2 : 1 : 1$, probabilities $\tfrac23, \tfrac16, \tfrac16$. Same as Midterm 1's $\cos^2\varphi$ on the ring: $\hat L_z$ never sees $\theta$.

          **$L^2$.** Write $f/A = \tfrac12\sin^2\theta + \tfrac12\sin^2\theta\cos2\varphi$. The second piece is pure $Y_2^{\pm2}$. The first is $\tfrac12(1 - \cos^2\theta) = \tfrac13 - \tfrac16(3\cos^2\theta - 1)$: an $\ell = 0$ and an $\ell = 2,\ m = 0$ piece. Norms over the sphere:
          $$\left(\tfrac13\right)^2 4\pi = \tfrac{4\pi}{9},\qquad \left(\tfrac16\right)^2\tfrac{16\pi}{5} = \tfrac{4\pi}{45},\qquad 2\left(\tfrac14\right)^2\tfrac{32\pi}{15} = \tfrac{4\pi}{15},$$
          total $\tfrac{4\pi}{5}$. So $P(L^2 = 0) = \tfrac59$, $P(L^2 = 6\hbar^2) = \tfrac{1}{9} + \tfrac13 = \tfrac49$. Consistency: $P(L_z = 0) = \tfrac59 + \tfrac19 = \tfrac23$ ✓.

          **Rubric**
          - **5** $L_z$ from the $\varphi$ dependence alone, the Midterm 1 comparison, the $\ell = 0 / \ell = 2$ split of $\sin^2\theta$ and correct $\tfrac59$, $\tfrac49$.
          - **4** $L_z$ right, $L^2$ split right with an arithmetic slip.
          - **3** $L_z$ right, assumes $\ell = 2$ only ("$\sin^2\theta$ is a $Y_2$").
          - **2** Expansion in $e^{\pm i\varphi}$ ($m = \pm1$).
          - **1** Little progress.
        `,
      },
    ]),
    prob(8, 3, md`
      **3 · Who visits the nucleus?** [20 points, 5 per part]

      For a central potential, $\psi = R(r)Y_\ell^m(\theta, \varphi)$ and $u = rR$ obeys
      $$-\frac{\hbar^2}{2m}u'' + \left[V(r) + \frac{\hbar^2\ell(\ell + 1)}{2mr^2}\right]u = Eu.$$
      Assume $V$ is less singular than $1/r^2$ at the origin. Hydrogen: $R_{10} = 2a^{-3/2}e^{-r/a}$, $R_{20} = \tfrac{1}{\sqrt2}a^{-3/2}\left(1 - \tfrac{r}{2a}\right)e^{-r/2a}$, $R_{21} = \tfrac{1}{\sqrt{24}}a^{-3/2}\tfrac ra\,e^{-r/2a}$, $Y_0^0 = 1/\sqrt{4\pi}$. Infinite spherical well of radius $b$: $E = \hbar^2\beta^2/2mb^2$ with $\beta = 3.14$ (1s), $4.49$ (1p), $5.76$ (1d), $6.28$ (2s).
    `, [
      {
        q: md`**(a)** Find how $u$ behaves as $r \to 0$ for each $\ell$, say which solution is allowed and why, and conclude for which $\ell$ the density $|\psi(0)|^2$ is nonzero.`,
        ans: md`$u \propto r^{\ell + 1}$ or $r^{-\ell}$; only $r^{\ell + 1}$ is allowed. $R \propto r^\ell$: $|\psi(0)|^2 \ne 0$ only for $\ell = 0$.`,
        sol: md`
          Near $0$ the centrifugal term dominates: $u'' \approx \tfrac{\ell(\ell + 1)}{r^2}u$. Try $u = r^s$: $s(s - 1) = \ell(\ell + 1)$, so $s = \ell + 1$ or $s = -\ell$. For $\ell \ge 1$, $r^{-\ell}$ makes $\int|u|^2dr$ diverge at $0$. For $\ell = 0$, $s = 0$ gives $u(0) \ne 0$, $\psi \propto 1/r$: normalizable, but not a solution, since $\nabla^2(1/r) = -4\pi\delta^3(\vec r)$ leaves a delta function nothing can cancel. So $u \propto r^{\ell + 1}$ and $R \propto r^\ell$: only $s$ states reach the origin. Physically, the centrifugal barrier keeps a particle with angular momentum away from the center.

          **Rubric**
          - **5** Both powers, both rejection arguments (including the correct $\ell = 0$ reason), the conclusion.
          - **4** Rejects $r^{-\ell}$ by "not normalizable" for all $\ell$ (wrong for $\ell = 0$), rest right.
          - **3** Quotes $u \propto r^{\ell + 1}$ without derivation, conclusion right.
          - **2** Conclusion wrong ("all states vanish at the origin").
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Compute $|\psi(0)|^2$ for 1s and 2s, and their ratio. Without calculating anything else, rank 1s, 2s and 2p, and explain why contact effects such as electron capture by a nucleus involve essentially only $s$ electrons.`,
        ans: md`$|\psi_{100}(0)|^2 = \tfrac{1}{\pi a^3}$, $|\psi_{200}(0)|^2 = \tfrac{1}{8\pi a^3}$, ratio $8$; ranking 1s > 2s > 2p $= 0$.`,
        figs: { rn: { svg: figRnl, cap: 'R(r) near the origin: 1s and 2s start at finite values, 2p starts at zero (∝ r).' } },
        sol: md`
          $|\psi(0)|^2 = R(0)^2|Y_0^0|^2 = R(0)^2/4\pi$: $\tfrac{4}{4\pi a^3} = \tfrac{1}{\pi a^3}$ for 1s and $\tfrac{1/2}{4\pi a^3} = \tfrac{1}{8\pi a^3}$ for 2s. Ratio $8 = 2^3$ (in general $1/n^3$ for $s$ states: bigger orbit, more dilute). 2p: $R_{21}(0) = 0$.

          [[fig:rn]]

          A contact process happens only if the electron is *at* the nucleus, so its rate is proportional to $|\psi(0)|^2$, nonzero only for $\ell = 0$.

          **Rubric**
          - **5** Both densities including the $1/4\pi$, ratio, ranking, contact explanation.
          - **4** Forgets $|Y_0^0|^2$ (ratio still right).
          - **3** Ranking right, numbers wrong.
          - **2** Puts 2p above 2s.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** True or false? To receive credit, give a brief justification. "An electron in a 2p state has zero probability of being found inside a small sphere of radius $\epsilon \ll a$ around the proton."`,
        ans: md`**False.**`,
        sol: md`
          The *density* at the single point $r = 0$ vanishes, but the probability inside the sphere is $\int_0^\epsilon r^2R_{21}^2dr \approx \tfrac{1}{24a^5}\int_0^\epsilon r^4dr = \tfrac{\epsilon^5}{120a^5} > 0$. It is just much smaller than for 1s ($\approx\tfrac43(\epsilon/a)^3$). The trap: "zero density at a point" is not "zero probability in a region" (and the probability of being *exactly* at any point is zero for every state).

          **Rubric:** 5 false with the $\epsilon^5$ (or $\propto\epsilon^{2\ell + 3}$) scaling or an equivalent argument; 4 good reasoning slightly incomplete; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
      {
        q: md`**(d)** True or false? To receive credit, give a brief justification. "In the infinite spherical well, just as in hydrogen, the first excited level contains one $\ell = 0$ state and three $\ell = 1$ states with the same energy."`,
        ans: md`**False.**`,
        sol: md`
          In the box the first excited level is 1p ($\beta = 4.49$), three states only; 2s is much higher ($\beta = 6.28$, above 1d). Box levels of different $\ell$ never coincide: each level is a single $(2\ell + 1)$ multiplet, which is what rotational symmetry alone requires. Hydrogen's $n = 2$ (2s + 2p, four states) is an *accidental* degeneracy special to the $1/r$ potential.

          **Rubric:** 5 false with the box ordering and the accidental-vs-rotational distinction; 4 ordering right, distinction missing; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
    ]),
  ], {
    q: md`Enter: P1 $\sigma_x\sigma_p/\hbar$ at its maximum for $n = 0$; P1 $\sigma_x\sigma_p/\hbar$ at $t = 0$ for $n = 1$; P2 $P(L^2 = 0)$; P3 $|\psi_{100}(0)|^2/|\psi_{200}(0)|^2$.`,
    parts: [
      { lbl: '\\max\\,\\sigma_x\\sigma_p/\\hbar\\ (n=0)', ans: 0.75 },
      { lbl: '\\sigma_x\\sigma_p/\\hbar\\ (n=1,\\,t=0)', ans: Math.SQRT2 },
      { lbl: 'P(L^2 = 0)', ans: 5 / 9 },
      { lbl: '\\text{ratio}', ans: 8 },
    ],
    sol: md`$0.75$, $1.414$, $0.556$, $8$.`,
  });

  // ================================================================== Practice midterm 9
  const figLprob = PF.plot({
    w: 400, h: 210, x: [0, 2 * PI], y: [0, 1.1], xl: '\\omega t', yl: 'P',
    xt: piT, yt: [[0.5, '\\tfrac12'], [1, '1']],
    curves: [
      { f: (t) => Math.cos(t / 2) ** 4, lab: 'L_z=+\\hbar', labAt: 0.55, dy: -10 },
      { f: (t) => 0.5 * Math.sin(t) ** 2, cls: 'acc', lab: 'L_z=0', labAt: 4.71, dy: -10 },
      { f: (t) => Math.sin(t / 2) ** 4, cls: 'dim', lab: 'L_z=-\\hbar', labAt: 2.75, dy: -12 },
    ],
  });
  const fig2s2p = PF.plot({
    w: 400, h: 220, x: [0, 16], y: [0, 0.22], xl: 'r/a', yl: 'r^2|R|^2\\,a',
    xt: [[2, '2'], [4, '4'], [6, '6'], [10, '10']], yt: [[0.1, '0.1'], [0.2, '0.2']],
    curves: [
      { f: (r) => r * r * R20(r) ** 2, cls: 'acc', lab: '2s', labAt: 7.5, dy: -8 },
      { f: (r) => r * r * R21(r) ** 2, lab: '2p', labAt: 3.2, dy: -10 },
    ],
  });

  const pm9 = mock(9, 'harder than the exam', intro('Harder than the exam', md`Problems: the oscillator in a plane and its angular momentum; turning an $\ell = 1$ state with $\hat H = \omega\hat L_x$; 2s versus 2p in hydrogen.`), [
    prob(9, 1, md`
      **1 · The oscillator in a plane** [20 points, 5 per part]

      A particle moves in the $xy$ plane with $V = \tfrac12m\omega^2(x^2 + y^2)$. Each Cartesian direction is an independent oscillator with its own ladder operators (operators for different directions commute), so the stationary states are $\psi_{n_x}(x)\psi_{n_y}(y)$ with $E = \hbar\omega(n_x + n_y + 1)$. In polar coordinates $(r, \varphi)$, $\hat L_z = \hat x\hat p_y - \hat y\hat p_x = -i\hbar\,\partial_\varphi$. One-dimensional states: $\psi_0 \propto e^{-m\omega x^2/2\hbar}$, $\psi_1 \propto x\,e^{-m\omega x^2/2\hbar}$, $\psi_2 \propto \left(\tfrac{2m\omega}{\hbar}x^2 - 1\right)e^{-m\omega x^2/2\hbar}$.
    `, [
      {
        q: md`**(a)** Find the degeneracy of the level $E = \hbar\omega(N + 1)$. Does $\hat L_z$ commute with $\hat H$? Argue without computing a commutator.`,
        ans: md`$N + 1$ states ($n_x = 0, \dots, N$). Yes: $V$ depends only on $r$, so rotations about $z$ are a symmetry, and $\hat L_z$ generates them.`,
        sol: md`
          $N = n_x + n_y$ with $n_x = 0, 1, \dots, N$: $N + 1$ ways. Both $\hat p^2 = \hat p_x^2 + \hat p_y^2$ and $r^2$ are unchanged by rotating the plane, so $\hat H$ is invariant under rotations about $z$; $\hat L_z = -i\hbar\,\partial_\varphi$ is the generator of those rotations, so $[\hat H, \hat L_z] = 0$ (in polar form, $V(r)$ has no $\varphi$ and the Laplacian's $\varphi$ part is $\partial_\varphi^2/r^2$). We can therefore choose stationary states that are also $\hat L_z$ eigenstates.

          **Rubric**
          - **5** Degeneracy with the counting, symmetry argument for $[\hat H, \hat L_z] = 0$.
          - **4** Degeneracy right, commutation asserted.
          - **3** Degeneracy wrong by one ($N$) but symmetry argument right.
          - **2** Claims $\hat L_z$ does not commute because the Cartesian states are not $\hat L_z$ eigenstates.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Write the $N = 1$ states as $\hat L_z$ eigenstates and give their eigenvalues. Sketch $|\psi|^2$ in the plane for one of them and for $\psi_1(x)\psi_0(y)$.`,
        ans: md`$(x \pm iy)\,e^{-m\omega r^2/2\hbar} = re^{\pm i\varphi}e^{-m\omega r^2/2\hbar}$: $L_z = \pm\hbar$. Their density is a ring (no $\varphi$ dependence); $\psi_1(x)\psi_0(y)$ is two lobes on the $x$ axis.`,
        sol: md`
          $\psi_1(x)\psi_0(y) \pm i\psi_0(x)\psi_1(y) \propto (x \pm iy)e^{-m\omega r^2/2\hbar} = re^{\pm i\varphi}e^{-m\omega r^2/2\hbar}$, and $-i\hbar\,\partial_\varphi e^{\pm i\varphi} = \pm\hbar\,e^{\pm i\varphi}$. Densities: $r^2e^{-m\omega r^2/\hbar}$, a ring of radius $\sqrt{\hbar/m\omega}$ with a hole at the center; $x^2e^{-m\omega r^2/\hbar}$, two lobes along $x$ with a nodal line along $y$. The ring circulates (definite $L_z$); the lobes are a standing wave, an equal mix of $\pm\hbar$.

          **Rubric**
          - **5** Both combinations with eigenvalues, both sketches with the ring/lobes distinction.
          - **4** Eigenstates right, sketches confused.
          - **3** Only one eigenstate, or eigenvalue sign error.
          - **2** Claims $\psi_1(x)\psi_0(y)$ is an $\hat L_z$ eigenstate.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** Find the three $\hat L_z$ eigenstates in the $N = 2$ level and their eigenvalues.`,
        ans: md`$(x + iy)^2G$ with $2\hbar$, $(x - iy)^2G$ with $-2\hbar$, and $\left(\tfrac{m\omega}{\hbar}r^2 - 1\right)G$ with $0$, where $G = e^{-m\omega r^2/2\hbar}$.`,
        sol: md`
          The $N = 2$ space is spanned by $\psi_2\psi_0$, $\psi_1\psi_1$, $\psi_0\psi_2$, i.e. by $G$ times $\left(\tfrac{2m\omega}{\hbar}x^2 - 1\right)$, $xy$, $\left(\tfrac{2m\omega}{\hbar}y^2 - 1\right)$.
          - $(x \pm iy)^2 = x^2 - y^2 \pm 2ixy$: $x^2 - y^2 \propto$ the difference of the first and third polynomials, $xy$ is the middle one. So $(x \pm iy)^2G = r^2e^{\pm2i\varphi}G$ lies in the level, with $L_z = \pm2\hbar$.
          - The sum of the first and third is $\tfrac{2m\omega}{\hbar}r^2 - 2$: depends on $r$ only, so $L_z = 0$.

          **Rubric**
          - **5** All three, shown to lie in the $N = 2$ level, eigenvalues.
          - **4** The $\pm2\hbar$ states right, the $m = 0$ state guessed as $r^2G$ (not in the level).
          - **3** Two of three.
          - **2** Assigns $m = \pm1$ in $N = 2$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** Which $L_z$ values occur in level $N$? Explain why they go in steps of 2. Does rotational symmetry in the plane explain the full degeneracy $N + 1$?`,
        ans: md`$m = N, N - 2, \dots, -N$, one state each ($N + 1$ values). Steps of 2 from the rotation by $\pi$ (parity $(-1)^N$). No: rotations about $z$ only require $m$ and $-m$ to be degenerate; the degeneracy of different $|m|$ is accidental.`,
        sol: md`
          Each level-$N$ state is $G$ times a polynomial of degree $N$ in $x, y$ with only degrees $N, N - 2, \dots$ present (each 1D state has parity $(-1)^n$). In $z = x + iy$, $\bar z = x - iy$, the top-degree monomials $z^k\bar z^{N - k}$ have $L_z = (2k - N)\hbar$: $N + 1$ values from $-N$ to $N$ in steps of 2. Steps of 2: rotating by $\pi$ maps $(x, y) \to (-x, -y)$, which multiplies every level-$N$ state by $(-1)^N$ and $e^{im\varphi}$ by $(-1)^m$, so $m \equiv N \pmod 2$.

          Symmetry: rotations about $z$ (plus reflections) only force $m \leftrightarrow -m$ degeneracy. That $m = 0$ and $m = \pm2$ share the $N = 2$ energy is not required by rotations: it is an accidental degeneracy (a hidden symmetry of the oscillator), just like hydrogen's $\ell$ degeneracy.

          **Rubric**
          - **5** The $m$ list, the parity reason for steps of 2, and "accidental beyond $\pm m$".
          - **4** List right, one of the two explanations missing.
          - **3** List right, no explanations.
          - **2** Claims all $|m| \le N$ occur.
          - **1** Little progress.
        `,
      },
    ]),
    prob(9, 2, md`
      **2 · Turning an $\ell = 1$ state** [20 points, 5 per part]

      Work in the $\ell = 1$ subspace with ordered basis $(Y_1^1, Y_1^0, Y_1^{-1})$. Use $\hat L_\pm Y_\ell^m = \hbar\sqrt{\ell(\ell + 1) - m(m \pm 1)}\,Y_\ell^{m\pm1}$, $\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$, $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ (cyclic), $\tfrac{d\langle Q\rangle}{dt} = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle$. A field along $x$ makes the Hamiltonian, apart from a constant, $\hat H = \omega\hat L_x$.
    `, [
      {
        q: md`**(a)** Construct the matrix of $\hat L_x$ and find its eigenvalues and normalized eigenvectors.`,
        ans: md`$\hat L_x = \tfrac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}$; $+\hbar$: $\tfrac12(1, \sqrt2, 1)$; $0$: $\tfrac{1}{\sqrt2}(1, 0, -1)$; $-\hbar$: $\tfrac12(1, -\sqrt2, 1)$.`,
        sol: md`
          $\hat L_+Y_1^0 = \sqrt2\hbar Y_1^1$, $\hat L_+Y_1^{-1} = \sqrt2\hbar Y_1^0$, and $\hat L_-$ the reverse, so $\hat L_x$ has $\tfrac{\sqrt2\hbar}{2} = \tfrac{\hbar}{\sqrt2}$ just off the diagonal. Eigenvalues must be $\hbar, 0, -\hbar$ (nothing special about $x$); check $\tfrac{\hbar}{\sqrt2}(\sqrt2, 2, \sqrt2)/2 = \hbar\cdot\tfrac12(1, \sqrt2, 1)$ ✓.

          **Rubric**
          - **5** Matrix from the ladder coefficients, all three eigenpairs normalized.
          - **4** Matrix right, one eigenvector unnormalized or slightly wrong.
          - **3** Matrix with wrong coefficient (e.g. $\hbar$ instead of $\hbar/\sqrt2$), consistent eigen-analysis.
          - **2** Uses $\hat L_x = \hat L_+ + \hat L_-$ or a diagonal matrix.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** At $t = 0$ the state is $Y_1^1$. If $L_x$ were measured, what are the outcomes and probabilities? Do these probabilities change with time? Justify without computing $\psi(t)$.`,
        ans: md`$+\hbar$: $\tfrac14$, $0$: $\tfrac12$, $-\hbar$: $\tfrac14$. Constant in time: $[\hat H, \hat L_x] = 0$.`,
        sol: md`
          Probabilities are the squared first components of the eigenvectors: $\tfrac14, \tfrac12, \tfrac14$. Since $\hat H = \omega\hat L_x$ commutes with $\hat L_x$, its eigenstates are stationary and only acquire phases, so the $L_x$ distribution is frozen (and $\langle L_x\rangle = 0$ forever).

          **Rubric**
          - **5** Correct probabilities and the commutation argument.
          - **4** Probabilities right, time-independence asserted.
          - **3** Uses $\tfrac13$ each, but the time argument is right.
          - **2** Claims the probabilities oscillate.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** Find the probabilities of $L_z = +\hbar, 0, -\hbar$ at time $t$, and sketch them over one period. When is the particle certainly in $Y_1^{-1}$?`,
        ans: md`$\cos^4\tfrac{\omega t}{2}$, $\tfrac12\sin^2\omega t$, $\sin^4\tfrac{\omega t}{2}$. Certainly $Y_1^{-1}$ at $t = \pi/\omega$ (and odd multiples).`,
        figs: { lp: { svg: figLprob, cap: 'L_z probabilities while H = ωL_x turns the state about the x axis.' } },
        sol: md`
          Expand: $Y_1^1 = \tfrac12\ket{+} + \tfrac{1}{\sqrt2}\ket{0} + \tfrac12\ket{-}$ (in $L_x$ eigenvectors). Evolve: $\ket{\pm}$ get $e^{\mp i\omega t}$. Project back onto $Y_1^1$: $\tfrac14e^{-i\omega t} + \tfrac12 + \tfrac14e^{i\omega t} = \cos^2\tfrac{\omega t}{2}$. Onto $Y_1^0$: $\tfrac{\sqrt2}{4}(e^{-i\omega t} - e^{i\omega t}) = -\tfrac{i}{\sqrt2}\sin\omega t$. Onto $Y_1^{-1}$: $\tfrac12\cos\omega t - \tfrac12 = -\sin^2\tfrac{\omega t}{2}$. Square them. Sum: $\cos^4 + \sin^4 + 2\sin^2\cos^2 = 1$ ✓.

          [[fig:lp]]

          **Rubric**
          - **5** Expansion, phases, all three probabilities, sketch, $t = \pi/\omega$.
          - **4** One probability slightly off, structure right.
          - **3** Correct method, phases on the wrong basis (e.g. $e^{-im\omega t}$ on $Y_1^m$).
          - **2** Claims $L_z$ stays $\hbar$ because $Y_1^1$ is an eigenstate.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** Use the generalized Ehrenfest theorem to find $\langle L_x\rangle$, $\langle L_y\rangle$, $\langle L_z\rangle$ at time $t$, describe the motion of $\langle\vec L\rangle$, and check against (c).`,
        ans: md`$\langle L_x\rangle = 0$, $\langle L_y\rangle = -\hbar\sin\omega t$, $\langle L_z\rangle = \hbar\cos\omega t$: $\langle\vec L\rangle$ rotates about $+x$ (right-handed) at $\omega$, from $+z$ toward $-y$. Check: $\hbar(\cos^4 - \sin^4) = \hbar\cos\omega t$ ✓.`,
        sol: md`
          $[\hat H, \hat L_z] = \omega[\hat L_x, \hat L_z] = -i\hbar\omega\hat L_y$ gives $\tfrac{d}{dt}\langle L_z\rangle = \omega\langle L_y\rangle$; $[\hat H, \hat L_y] = i\hbar\omega\hat L_z$ gives $\tfrac{d}{dt}\langle L_y\rangle = -\omega\langle L_z\rangle$; $\langle L_x\rangle$ is constant ($0$ from (b)). With $\langle L_z\rangle_0 = \hbar$, $\langle L_y\rangle_0 = 0$: $\langle L_z\rangle = \hbar\cos\omega t$, $\langle L_y\rangle = -\hbar\sin\omega t$. The vector turns in the $yz$ plane about $x$, the same precession as a classical magnetic moment, with period $2\pi/\omega$. From (c): $\langle L_z\rangle = \hbar\left(\cos^4\tfrac{\omega t}{2} - \sin^4\tfrac{\omega t}{2}\right) = \hbar\cos\omega t$ ✓.

          **Rubric**
          - **5** Commutators, solved equations with signs, description of the rotation, the check.
          - **4** Sign error in $\langle L_y\rangle$, rest right.
          - **3** Equations right, not solved or not checked.
          - **2** All components constant.
          - **1** Little progress.
        `,
      },
    ]),
    prob(9, 3, md`
      **3 · 2s versus 2p** [20 points, 5 per part]

      Hydrogen: $E_n = -13.6\ \text{eV}/n^2$, $a = 0.0529$ nm, $R_{20} = \tfrac{1}{\sqrt2}a^{-3/2}\left(1 - \tfrac{r}{2a}\right)e^{-r/2a}$, $R_{21} = \tfrac{1}{\sqrt{24}}a^{-3/2}\tfrac ra\,e^{-r/2a}$, $\int_0^\infty r^ne^{-\beta r}dr = n!/\beta^{n+1}$.
    `, [
      {
        q: md`**(a)** How many states have energy $E_2$ (ignore spin)? Which part of this degeneracy does rotational symmetry explain, and which part does it not? Name a change to the potential that would remove the unexplained part.`,
        ans: md`4 (2s + three 2p). Rotations explain the threefold $m$ degeneracy of 2p; the 2s–2p coincidence is accidental (special to $1/r$). Any non-$1/r$ change: screening by inner electrons, a finite-size nucleus, an added $1/r^2$ term.`,
        sol: md`
          Rotational symmetry means $[\hat H, \hat L_\pm] = 0$, which moves between $m$ values at fixed $\ell$ and fixed $E$: it explains $2\ell + 1$ states per multiplet. It never changes $\ell$, and the radial equation is different for $\ell = 0$ and $\ell = 1$, so nothing in rotations makes 2s and 2p equal. That is the accidental degeneracy of the Coulomb potential (its hidden symmetry is the conserved Runge–Lenz vector). Any deviation from exact $1/r$ breaks it, as in alkali atoms.

          **Rubric**
          - **5** Count, the split into rotational ($m$) and accidental ($\ell$), and a valid perturbation that lifts it.
          - **4** Count and split right, but the example is missing or is a field along $z$ (that lifts $m$, not the accidental part).
          - **3** Count right, attributes all of it to rotations.
          - **2** Count wrong (e.g. 8 with spin assumed silently, or 3).
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Sketch the radial probability densities $r^2|R|^2$ for 2s and 2p on the same axes. Find the most probable $r$ and $\langle r\rangle$ for 2p. Without calculating, which state is more likely to be found at $r < a$?`,
        ans: md`2p: one hump, most probable $r = 4a$, $\langle r\rangle = 5a$. 2s: node at $2a$, small inner hump ($\approx0.76a$), main hump at $\approx5.2a$, $\langle r\rangle = 6a$. 2s is more likely at $r < a$ ($3.4\%$ vs $0.4\%$).`,
        figs: { sp: { svg: fig2s2p, cap: 'Radial probability densities: 2s has an inner hump inside the node at r = 2a; 2p has a single hump at 4a.' } },
        sol: md`
          2p: $r^2R_{21}^2 = \tfrac{r^4}{24a^5}e^{-r/a}$; maximize $r^4e^{-r/a}$: $4/r = 1/a$, $r = 4a$. $\langle r\rangle = \tfrac{1}{24a^5}\int_0^\infty r^5e^{-r/a}dr = \tfrac{120a^6}{24a^5} = 5a$.

          [[fig:sp]]

          The 2s inner hump lies inside $r = 2a$ (where $u$ is near the origin with no centrifugal barrier): near $0$, $r^2R^2 \propto r^2$ for 2s but $\propto r^4$ for 2p. So 2s wins at small $r$ even though its mean radius is larger.

          **Rubric**
          - **5** Sketch with node and humps, $4a$ and $5a$ computed, small-$r$ verdict with the $r^\ell$ reason.
          - **4** Numbers right, sketch missing the inner hump.
          - **3** One of the two numbers wrong.
          - **2** Sketches $|R|^2$ without the $r^2$, or claims 2p is inside 2s everywhere.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** True or false? To receive credit, give a brief justification. "Because the 2s electron penetrates closer to the proton, the 2s level of hydrogen lies below the 2p level."`,
        ans: md`**False.**`,
        sol: md`
          For a pure Coulomb potential $E$ depends only on $n = N + \ell$: 2s and 2p are exactly degenerate (ignoring spin and relativistic effects, which are not in this model). Penetration lowers the s level only when the potential is *more* attractive than $-k/r$ at small $r$, as in alkali atoms. The trap is importing the lithium/sodium picture into hydrogen.

          **Rubric:** 5 false with the $E(n)$ / accidental-degeneracy argument and why penetration doesn't matter here; 4 good but no contrast with alkalis; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
      {
        q: md`**(d)** True or false? To receive credit, give a brief justification. "If the proton's charge were spread over a small sphere of radius $R_p \ll a$ instead of a point, the 2s level would rise slightly while the 2p level would barely move."`,
        ans: md`**True.**`,
        sol: md`
          Inside $R_p$ the potential is less negative than $-k/r$ (only part of the charge is enclosed), so the change $\delta V > 0$ lives entirely within $R_p$. The energy shift is about the average of $\delta V$ over where the electron is: for 2s the probability inside $R_p$ scales like $R_p^3|\psi(0)|^2$; for 2p like $R_p^5$, negligible. So 2s moves up slightly, 2p essentially not: the finite size lifts the accidental degeneracy.

          **Rubric:** 5 true with the sign of $\delta V$ and the $s$-vs-$p$ weight near the origin; 4 right idea, sign of the shift unclear; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
    ]),
  ], {
    q: md`Enter: P1 the number of $L_z$ values in level $N = 4$; P2 $P(L_z = 0)$ at $\omega t = \pi/2$; P3 most probable $r/a$ for 2p; P3 $\langle r\rangle/a$ for 2p.`,
    parts: [
      { lbl: '\\#\\,m\\ (N=4)', ans: 5 },
      { lbl: 'P(L_z = 0)', ans: 0.5 },
      { lbl: 'r_{\\text{mp}}/a', ans: 4 },
      { lbl: '\\langle r\\rangle/a', ans: 5 },
    ],
    sol: md`$5$ ($m = 4, 2, 0, -2, -4$), $0.5$, $4$, $5$.`,
  });

  // ================================================================== Practice midterm 10 (dress rehearsal)
  const figParA = PF.plot({
    w: 400, h: 220, x: [-3.5, 3.5], y: [0, 0.75], xl: '\\xi', yl: '|\\Psi|^2',
    xt: [[-2, '-2'], [-1, '-1'], [1, '1'], [2, '2']],
    curves: [
      { f: (u) => (s0(u) + s1(u) + s2(u)) ** 2 / 3, lab: '\\text{before}', labAt: 1.6, dy: -12 },
      { f: (u) => (s0(u) + s2(u)) ** 2 / 2, cls: 'acc', lab: '\\text{after } +1', labAt: -2.6, dx: -4, dy: -16, anchor: 'r' },
    ],
  });
  const figParB = PF.plot({
    w: 400, h: 220, x: [-3.5, 3.5], y: [0, 0.75], xl: '\\xi', yl: '|\\Psi|^2',
    xt: [[-2, '-2'], [-1, '-1'], [1, '1'], [2, '2']],
    curves: [
      { f: (u) => (s0(u) + s2(u)) ** 2 / 2, cls: 'acc', lab: 't = 0', labAt: 1.9, dy: -10 },
      { f: (u) => (s0(u) - s2(u)) ** 2 / 2, lab: 't = \\tfrac{\\pi}{2\\omega}', labAt: 0.45, dx: 8, dy: -6 },
    ],
  });
  const polar = (fr, n = 240) => Array.from({ length: n + 1 }, (_, i) => { const p = 2 * PI * i / n, rr = fr(p); return [rr * Math.cos(p), rr * Math.sin(p)]; });
  const figOrb = PF.plot({
    w: 280, h: 280, ml: 34, mr: 34, mt: 34, mb: 34, x: [-1.15, 1.15], y: [-1.15, 1.15], xl: 'x', yl: 'y', zero: true, vlines: [[0, '']],
    curves: [
      { pts: polar((p) => Math.cos(p) ** 2), lab: '|p_x|^2', labAt: 0.9, dy: -16 },
      { pts: polar(() => 0.5), cls: 'acc' },
    ],
    pts: [{ x: -0.354, y: 0.354, lab: '|Y_1^1|^2', anchor: 'br' }],
  });

  const pm10 = mock(10, 'dress rehearsal', intro('Dress rehearsal', md`Pitched exactly at real-exam level, with no warm-up hints. Do it last, in one sitting, as if it were the real thing. Problems: parity in the oscillator; the p orbitals as a three-level system; a hydrogen atom that sloshes.`), [
    prob(10, 1, md`
      **1 · Parity in the oscillator** [20 points, 5 per part]

      Harmonic oscillator: $E_n = \hbar\omega(n + \tfrac12)$, $\hat x = \sqrt{\tfrac{\hbar}{2m\omega}}(\hat a_+ + \hat a_-)$, $\hat a_\pm = \tfrac{1}{\sqrt{2\hbar m\omega}}(\mp i\hat p + m\omega\hat x)$, $\hat a_+\ket n = \sqrt{n + 1}\ket{n + 1}$, $\hat a_-\ket n = \sqrt n\ket{n - 1}$, $\psi_0 \propto e^{-m\omega x^2/2\hbar}$. The parity operator is $\hat\Pi\psi(x) = \psi(-x)$. At $t = 0$,
      $$\ket{\Psi(0)} = \frac{1}{\sqrt3}\left(\ket0 + \ket1 + \ket2\right).$$
    `, [
      {
        q: md`**(a)** Show that $\hat\Pi$ commutes with $\hat H$, that its eigenvalues are $\pm1$, and that $\hat\Pi\psi_n = (-1)^n\psi_n$. What does $[\hat\Pi, \hat H] = 0$ imply for parity measurements at different times?`,
        ans: md`$V$ and $d^2/dx^2$ are even. $\hat\Pi^2 = 1$ ⇒ eigenvalues $\pm1$. $\psi_0$ even and $\hat\Pi\hat a_+\hat\Pi = -\hat a_+$ ⇒ $(-1)^n$. Parity probabilities are the same at all times.`,
        sol: md`
          $\hat\Pi\hat H\psi(x) = \left[-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2} + V(x)\right]\psi(-x)$ because both $\tfrac{d^2}{dx^2}$ and $V(x) = \tfrac12m\omega^2x^2$ are unchanged by $x \to -x$: $\hat\Pi\hat H = \hat H\hat\Pi$. $\hat\Pi^2 = 1$, so $\lambda^2 = 1$. $\psi_0$ is an even Gaussian. $\hat a_+$ is a combination of $\hat x$ and $d/dx$, both odd under $\hat\Pi$, so each application flips parity: $\psi_n \propto \hat a_+^n\psi_0$ has parity $(-1)^n$. A conserved observable (commuting with $\hat H$, no explicit $t$) has time-independent outcome probabilities.

          **Rubric**
          - **5** All three facts with reasons, and the conservation consequence.
          - **4** One of the three asserted.
          - **3** $(-1)^n$ by "look at the sketches" only, rest right.
          - **2** Commutation not shown, or eigenvalues guessed.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Find $\langle x\rangle(t)$.`,
        ans: md`$\langle x\rangle = \tfrac23\left(1 + \sqrt2\right)\sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t \approx 1.61\sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t$.`,
        sol: md`
          $\hat x$ connects only neighbors: $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cdot2\,\text{Re}\left[c_0^*c_1\sqrt1 + c_1^*c_2\sqrt2\right]$. With $c_n = \tfrac{1}{\sqrt3}e^{-iE_nt/\hbar}$, each product is $\tfrac13e^{-i\omega t}$, so $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cdot\tfrac23(1 + \sqrt2)\cos\omega t$. Oscillates at $\omega$, like a classical oscillator (Ehrenfest is exact here).

          **Rubric**
          - **5** Both neighbor pairs with the $\sqrt1$, $\sqrt2$ factors, phases, final result.
          - **4** Missing the $\sqrt2$, or factor 2 slip.
          - **3** Only one pair included.
          - **2** Includes a $0$–$2$ term in $\langle x\rangle$, or no time dependence.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** Parity is measured at $t = 0$. Give the outcomes, their probabilities and the state right after each. Sketch $|\Psi(x)|^2$ just before and just after the outcome $+1$.`,
        ans: md`$+1$ with $\tfrac23$ → $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$; $-1$ with $\tfrac13$ → $\ket1$. Before: lopsided to $+x$; after $+1$: symmetric.`,
        figs: { pa: { svg: figParA, cap: 'Before (lopsided: the odd ψ₁ adds on the right, subtracts on the left) and after the outcome +1 (even). ξ = x√(mω/ħ).' } },
        sol: md`
          The $+1$ eigenspace is spanned by even $n$: projection keeps $\tfrac{1}{\sqrt3}(\ket0 + \ket2)$, probability $\tfrac23$, renormalized to $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$. The $-1$ outcome keeps $\ket1$, probability $\tfrac13$. A degenerate eigenvalue keeps the *whole* projection, not a single eigenvector.

          [[fig:pa]]

          **Rubric**
          - **5** Both outcomes and probabilities, the projected states (degenerate case handled), both sketches with the asymmetry before.
          - **4** Probabilities and states right, sketches poor.
          - **3** Collapses $+1$ to $\ket0$ or $\ket2$ alone.
          - **2** Outcomes not $\pm1$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** After the outcome $+1$, does $\langle x\rangle$ move? Does $|\Psi|^2$ change? Explain, give the period, and sketch $|\Psi|^2$ half a period later.`,
        ans: md`$\langle x\rangle = 0$ forever (even state stays even). $|\Psi|^2$ breathes at $2\omega$ (period $\pi/\omega$): at $t = \pi/2\omega$ it is $\tfrac12(\psi_0 - \psi_2)^2$, a narrow central peak.`,
        figs: { pb: { svg: figParB, cap: 'After the outcome +1: wide (two shoulders) at t = 0, narrow half a period later.' } },
        sol: md`
          Parity is conserved, so the state stays even and $\langle x\rangle = 0$. But it contains two energies, $E_0$ and $E_2$, so $|\Psi|^2$ has a cross term oscillating at $(E_2 - E_0)/\hbar = 2\omega$: period $\pi/\omega$. At $t = \pi/2\omega$ the relative phase is $e^{-i\pi} = -1$. Width: $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}\left(3 + \sqrt2\cos2\omega t\right)$, from $4.41$ down to $1.59$ in these units.

          [[fig:pb]]

          **Rubric**
          - **5** $\langle x\rangle = 0$ with the parity reason, breathing at $2\omega$, period, correct sketch (narrower at $\pi/2\omega$).
          - **4** Period given as $2\pi/\omega$, rest right.
          - **3** "Nothing changes, it is a parity eigenstate" (confuses parity with energy eigenstates), partly corrected.
          - **2** Claims $\langle x\rangle$ oscillates.
          - **1** Little progress.
        `,
      },
    ]),
    prob(10, 2, md`
      **2 · The p orbitals as a three-level system** [20 points, 5 per part]

      Chemists use the real $\ell = 1$ functions
      $$p_x = \sqrt{\tfrac{3}{4\pi}}\sin\theta\cos\varphi,\qquad p_y = \sqrt{\tfrac{3}{4\pi}}\sin\theta\sin\varphi,\qquad p_z = \sqrt{\tfrac{3}{4\pi}}\cos\theta,$$
      an orthonormal basis of the $\ell = 1$ subspace. $\hat L_z = -i\hbar\,\partial_\varphi$, $Y_1^{\pm1} = \mp\sqrt{\tfrac{3}{8\pi}}\sin\theta\,e^{\pm i\varphi}$, $Y_1^0 = p_z$. A particle on a sphere (rotor, moment of inertia $I$) has $\hat H_0 = \hat L^2/2I$.
    `, [
      {
        q: md`**(a)** Find the $3\times3$ matrix of $\hat L_z$ in the basis $(p_x, p_y, p_z)$ and show it is Hermitian. Which qubit matrix does its upper-left $2\times2$ block resemble?`,
        ans: md`$\hat L_z = \hbar\begin{pmatrix}0&-i&0\\i&0&0\\0&0&0\end{pmatrix}$, equal to its conjugate transpose; the block is $\hbar\sigma_y$.`,
        sol: md`
          $\hat L_zp_x = -i\hbar\,\partial_\varphi(\cos\varphi)\cdots = i\hbar\,p_y$, $\hat L_zp_y = -i\hbar\,p_x$, $\hat L_zp_z = 0$. Matrix elements $\bra{p_i}\hat L_z\ket{p_j}$: $(L_z)_{yx} = i\hbar$, $(L_z)_{xy} = -i\hbar$, all else $0$. Transposing and conjugating swaps $i\hbar \leftrightarrow -i\hbar$ into each other's places: Hermitian. The block is $\hbar\sigma_y$: in the $(p_x, p_y)$ plane, $\hat L_z$ acts like a Pauli matrix.

          **Rubric**
          - **5** Correct action on each $p$, matrix with correct placement of $\pm i$, Hermiticity shown, $\sigma_y$.
          - **4** Transposed matrix ($i$ and $-i$ swapped) but consistent.
          - **3** Correct actions, matrix not assembled.
          - **2** Treats $p_x$ as an $\hat L_z$ eigenstate.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** Find the eigenvalues and normalized eigenvectors, and identify them with the $Y_1^m$.`,
        ans: md`$+\hbar$: $\tfrac{1}{\sqrt2}(p_x + ip_y) = -Y_1^1$; $0$: $p_z = Y_1^0$; $-\hbar$: $\tfrac{1}{\sqrt2}(p_x - ip_y) = Y_1^{-1}$.`,
        sol: md`
          Eigenvalues of $\hbar\sigma_y$: $\pm\hbar$ with $\tfrac{1}{\sqrt2}(1, \pm i)$; the third is $0$ with $p_z$. $\tfrac{1}{\sqrt2}(p_x + ip_y) = \tfrac{1}{\sqrt2}\sqrt{\tfrac{3}{4\pi}}\sin\theta\,e^{i\varphi} = \sqrt{\tfrac{3}{8\pi}}\sin\theta\,e^{i\varphi} = -Y_1^1$ (an overall sign is just a phase). Similarly $\tfrac{1}{\sqrt2}(p_x - ip_y) = Y_1^{-1}$.

          **Rubric**
          - **5** All three, normalized, identified (phases noted).
          - **4** Identification missing or off by a phase without comment.
          - **3** Eigenvalues right, eigenvectors wrong.
          - **2** Eigenvalues not $\hbar, 0, -\hbar$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(c)** The particle is in $p_x$. Give the outcomes and probabilities of $L_z$, $\langle L_z\rangle$, and the energy. Sketch $|p_x|^2$ and $|Y_1^1|^2$ in the $xy$ plane, and explain why the real orbital has $\langle L_z\rangle = 0$.`,
        ans: md`$\pm\hbar$ with $\tfrac12$ each; $\langle L_z\rangle = 0$; $E = \hbar^2/I$ with certainty. $|p_x|^2 \propto \cos^2\varphi$ (two lobes), $|Y_1^1|^2$ independent of $\varphi$ (ring). $p_x$ is a standing wave in $\varphi$: equal parts of both senses of rotation.`,
        figs: { or: { svg: figOrb, cap: 'In the xy plane (θ = π/2): |p_x|² ∝ cos²φ has two lobes; |Y₁¹|² is the same in every direction.' } },
        sol: md`
          $p_x = \tfrac{1}{\sqrt2}\left[(-Y_1^1) + Y_1^{-1}\right]$: amplitudes of magnitude $\tfrac{1}{\sqrt2}$ for $m = \pm1$. $E = \tfrac{\hbar^2\cdot2}{2I} = \tfrac{\hbar^2}{I}$, certain (pure $\ell = 1$).

          [[fig:or]]

          $\cos\varphi = \tfrac12(e^{i\varphi} + e^{-i\varphi})$, exactly like $\cos kx$ being two plane waves with $\pm\hbar k$ (Midterm 1's free particle): no net circulation, so $\langle L_z\rangle = 0$, and the density has nodes. A state with definite $L_z = \hbar$ circulates one way and its density is uniform in $\varphi$.

          **Rubric**
          - **5** Probabilities, $\langle L_z\rangle$, energy, both sketches, standing-wave explanation.
          - **4** Calculation right, explanation or sketch missing.
          - **3** Probabilities right, energy uncertain or wrong.
          - **2** Claims $p_x$ has definite $L_z$.
          - **1** Little progress.
        `,
      },
      {
        q: md`**(d)** A field adds $\omega_0\hat L_z$ to $\hat H_0$. Starting in $p_x$, find the probability of finding the particle in $p_y$ at time $t$, and describe what $|\psi(\theta, \varphi, t)|^2$ does.`,
        ans: md`$P(p_y) = \sin^2\omega_0t$. $\psi(t) \propto \cos\omega_0t\,p_x + \sin\omega_0t\,p_y$: the two-lobed orbital rotates rigidly about $z$, counterclockwise, at $\omega_0$.`,
        sol: md`
          $\hat H_0$ is the same constant on the whole $\ell = 1$ space, so only $\omega_0\hat L_z = \hbar\omega_0\sigma_y$ (in the $p_x, p_y$ block) matters: $e^{-i\omega_0t\sigma_y} = \cos\omega_0t - i\sin\omega_0t\,\sigma_y$. Acting on $(1, 0)$: $\sigma_y(1, 0) = (0, i)$, so $\psi(t) = (\cos\omega_0t, \sin\omega_0t)$, up to a global phase. $P(p_y) = \sin^2\omega_0t$. That is $p$ along the direction at angle $\omega_0t$: the dumbbell turns counterclockwise about $z$, reaching $p_y$ at $t = \pi/2\omega_0$. Same as (and consistent with) Larmor precession of $\langle\vec L\rangle$.

          **Rubric**
          - **5** Correct evolution (any method: $Y_1^{\pm1}$ phases or the $\sigma_y$ exponential), $\sin^2\omega_0t$, rotation of the density described.
          - **4** Probability right, picture missing.
          - **3** Uses $\omega_0/2$ (qubit spin-½ habit) or a wrong sign that flips the sense.
          - **2** Claims nothing happens because $p_x$ is an eigenstate of $\hat L^2$.
          - **1** Little progress.
        `,
      },
    ]),
    prob(10, 3, md`
      **3 · A hydrogen atom that sloshes** [20 points, 5 per part]

      A hydrogen atom is prepared at $t = 0$ in
      $$\Psi(\vec r, 0) = \frac{1}{\sqrt2}\left(\psi_{100} + \psi_{210}\right),$$
      with $E_n = -13.6\ \text{eV}/n^2$, $\psi_{100} = R_{10}Y_0^0$, $\psi_{210} = R_{21}Y_1^0$, $Y_1^0 = \sqrt{\tfrac{3}{4\pi}}\cos\theta$, $\hbar = 6.58\times10^{-16}$ eV·s.
    `, [
      {
        q: md`**(a)** Describe in words the steps you would take to find $\langle z\rangle(t)$: for each step say what you would calculate and why, and which integrals vanish by symmetry. At what angular frequency does $\langle z\rangle$ oscillate? (You may quote $\bra{100}z\ket{210} = 0.745\,a$.)`,
        ans: md`Evolve each term with its own phase; $\langle z\rangle$ = diagonal terms (zero by parity) + cross term. $\langle z\rangle = 0.745\,a\cos\omega t$ with $\omega = (E_2 - E_1)/\hbar = 10.2\ \text{eV}/\hbar = 1.55\times10^{16}\ \text{s}^{-1}$.`,
        sol: md`
          1. **Time evolution.** Each stationary state gets its own phase: $\Psi(t) = \tfrac{1}{\sqrt2}\left(\psi_{100}e^{-iE_1t/\hbar} + \psi_{210}e^{-iE_2t/\hbar}\right)$. Needed because only the relative phase can make anything move.
          2. **Expand $\langle z\rangle = \int\Psi^*z\Psi\,d^3r$** into two diagonal and two cross terms.
          3. **Diagonal terms vanish by parity:** $|\psi_{100}|^2$ and $|\psi_{210}|^2$ are even under $\vec r \to -\vec r$, $z$ is odd.
          4. **Cross term:** $2\cdot\tfrac12\,\text{Re}\left[\bra{100}z\ket{210}e^{-i(E_2 - E_1)t/\hbar}\right]$; the matrix element is a radial integral times $\int Y_0^0\cos\theta\,Y_1^0\,d\Omega \ne 0$ (that is why $\ell$ must change by one). It is real here.
          5. **Result:** $\langle z\rangle = 0.745\,a\cos\omega t$, $\omega = \tfrac{10.2\ \text{eV}}{6.58\times10^{-16}\ \text{eV·s}} = 1.55\times10^{16}$ rad/s.

          **Rubric**
          - **5** All steps with reasons, parity for the diagonal terms, the angular selection, the frequency number.
          - **4** Steps right, frequency missing or the symmetry argument missing.
          - **3** Right idea, misses that each energy carries its own phase.
          - **2** Generic statements ("use the Schrödinger equation").
          - **1** Little progress.
        `,
      },
      {
        q: md`**(b)** True or false? To receive credit, give a brief justification. "Since $\langle z\rangle$ oscillates, $\langle H\rangle$ oscillates too."`,
        ans: md`**False.**`,
        sol: md`
          $\hat H$ is time-independent, so $\langle H\rangle = \sum|c_n|^2E_n = \tfrac12(E_1 + E_2) = -8.5$ eV at all times (Ehrenfest with $\hat Q = \hat H$: $[\hat H, \hat H] = 0$). Only quantities that connect the two states (like $z$) oscillate; $\hat H$ is diagonal in this basis. (A real atom would eventually radiate, but that needs coupling to the electromagnetic field, which is not in this $\hat H$.)

          **Rubric:** 5 false, $\langle H\rangle = \sum|c_n|^2E_n$ constant (or Ehrenfest), why $z$ is different; 4 good, no contrast; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
      {
        q: md`**(c)** True or false? To receive credit, give a brief justification. "A measurement of $L^2$ gives $2\hbar^2$ with probability $\tfrac12$, no matter when it is made."`,
        ans: md`**True.**`,
        sol: md`
          The state has an $\ell = 0$ part and an $\ell = 1$ part with weight $\tfrac12$ each, so $L^2 = 0$ or $2\hbar^2$ with $\tfrac12$ each. For a central potential $[\hat H, \hat L^2] = 0$: $L^2$ is conserved and its outcome probabilities never change, even though the state itself is not stationary.

          **Rubric:** 5 true with the weights and the commutator; 4 good, no commutator; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
      {
        q: md`**(d)** True or false? To receive credit, give a brief justification. "If an energy measurement gives $E_2$, the atom could afterwards be found in the 2s state $\psi_{200}$."`,
        ans: md`**False.**`,
        sol: md`
          The $E_2$ level is degenerate (2s and the three 2p), so the measurement projects onto that whole subspace: what remains is the part of $\Psi$ already in it, $\psi_{210}$ alone. The 2s amplitude was zero before and stays zero; time evolution under a central $\hat H$ cannot create it either ($L^2$ is conserved and 2s has $\ell = 0$). A degenerate measurement does not "choose" among the level's states at random.

          **Rubric:** 5 false with the projection onto the degenerate subspace (2s amplitude zero); 4 right verdict and idea, projection not stated; 3 fair; 2 some thoughts; 1 verdict only.
        `,
      },
    ]),
  ], {
    q: md`Enter: P1 the amplitude of $\langle x\rangle$ in units of $\sqrt{\hbar/2m\omega}$; P1 $P(\text{parity} = +1)$; P2 $P(p_y)$ at $\omega_0t = \pi/3$; P3 $\omega$ in units of $10^{16}$ s⁻¹.`,
    parts: [
      { lbl: '\\text{amplitude}', ans: 2 / 3 * (1 + Math.SQRT2) },
      { lbl: 'P(+1)', ans: 2 / 3 },
      { lbl: 'P(p_y)', ans: 0.75 },
      { lbl: '\\omega/10^{16}\\,\\text{s}^{-1}', ans: 1.55 },
    ],
    sol: md`$1.61$, $0.667$, $0.75$, $1.55$.`,
  });

  // ================================================================== True or false? Justify.
  let tfN = 0;
  const tf = (s, v, why, trap) => {
    tfN++;
    return { q: `**${tfN}.** ${s}`, ans: v ? '**True.**' : '**False.**', sol: why + (trap ? `\n\n*The trap:* ${trap}` : '') };
  };
  const tfBlock = (title, items) => ({ t: 'paper', html: `<div class="pp-title"><span>${title}</span><span>${items.length} statements</span></div>`, items });

  const tfGroups = [
    tfBlock('1 · Ehrenfest, conservation, energy–time', [
      tf(md`If $\hat Q$ has no explicit time dependence and $[\hat H, \hat Q] = 0$, then $\langle Q\rangle$ is constant in every state.`, true,
        md`Generalized Ehrenfest: $\tfrac{d\langle Q\rangle}{dt} = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle = 0$ for any state, not only eigenstates. In fact the whole probability distribution of $Q$ is constant: $\hat H$ and $\hat Q$ share eigenstates, and time evolution only gives them phases.`,
        md`thinking conservation only applies to eigenstates of $\hat Q$.`),
      tf(md`If $\langle Q\rangle$ is constant in time for some state, then $\hat Q$ commutes with $\hat H$.`, false,
        md`In any stationary state *every* expectation value is constant. Example: $\langle x\rangle = 0$ forever in $\ket n$ of the oscillator, yet $[\hat H, \hat x] = -\tfrac{i\hbar}{m}\hat p \ne 0$.`,
        md`running the true statement above backwards.`),
      tf(md`Ehrenfest's theorem says $m\,\dfrac{d^2\langle x\rangle}{dt^2} = -V'(\langle x\rangle)$.`, false,
        md`It says $m\tfrac{d^2\langle x\rangle}{dt^2} = -\langle V'(x)\rangle$: the average force, not the force at the average position. They agree only when $V'$ is linear in $x$ (free particle, uniform field, oscillator).`,
        md`misquoting the theorem as "the center moves classically" for every potential.`),
      tf(md`For the harmonic oscillator, $\langle x\rangle(t)$ follows a classical trajectory exactly, whatever the state.`, true,
        md`$V' = m\omega^2x$ is linear, so $\langle V'\rangle = m\omega^2\langle x\rangle$ and $\tfrac{d^2\langle x\rangle}{dt^2} = -\omega^2\langle x\rangle$ exactly. For $\ket n$ the "trajectory" is just $\langle x\rangle = 0$ at rest. What is not classical is the spread around it.`,
        md`thinking only coherent states have classical $\langle x\rangle(t)$.`),
      tf(md`In a stationary state $\sigma_H = 0$, so the energy–time relation $\sigma_H\,\Delta t \ge \hbar/2$ is violated.`, false,
        md`$\Delta t = \sigma_Q/|d\langle Q\rangle/dt|$ is the time for $\langle Q\rangle$ to change by one standard deviation. In a stationary state nothing changes, so $\Delta t = \infty$ for every $Q$: the relation says nothing, and nothing is violated.`,
        md`treating $\Delta t$ as a fixed measurement time instead of a property of the state.`),
      tf(md`If $\langle x\rangle$ moves by about one $\sigma_x$ in a time $\tau$, the state's energy spread is at least about $\hbar/2\tau$.`, true,
        md`That is the energy–time relation with $\hat Q = \hat x$: $\Delta t \approx \tau$ gives $\sigma_H \ge \hbar/2\tau$. Fast motion needs a superposition of energies far apart.`),
      tf(md`There is a time operator $\hat t$ with $[\hat H, \hat t] = i\hbar$, and $\Delta E\,\Delta t \ge \hbar/2$ follows from it exactly as $\sigma_x\sigma_p \ge \hbar/2$ follows from $[\hat x, \hat p] = i\hbar$.`, false,
        md`Time is a parameter in quantum mechanics, not an observable. The relation comes from the generalized uncertainty principle for $\hat H$ and some observable $\hat Q$, combined with Ehrenfest's $\tfrac{d\langle Q\rangle}{dt} = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle$.`),
      tf(md`In a symmetric potential $V(-x) = V(x)$, a state that starts out even stays even forever.`, true,
        md`Parity commutes with $\hat H$ (both terms of $\hat H$ are even), so $\hat H$ maps even functions to even functions and the Schrödinger equation never generates an odd part. Equivalently, an even state contains only even stationary states, and their phases don't change parity.`),
    ]),
    tfBlock('2 · Ladder operators and the oscillator spectrum', [
      tf(md`$\hat a_+$ is Hermitian, so it represents an observable.`, false,
        md`$\hat a_+^\dagger = \hat a_- \ne \hat a_+$. Hermitian combinations are $\hat a_+ + \hat a_- \propto \hat x$, $i(\hat a_+ - \hat a_-) \propto \hat p$, and the number operator $\hat a_+\hat a_-$.`),
      tf(md`$\hat a_-\ket0 = \ket{-1}$, a state with energy $-\tfrac12\hbar\omega$.`, false,
        md`$\hat a_-\ket0 = 0$, the zero vector, which is not a state. The ladder must stop: $\|\hat a_-\psi\|^2 = \bra\psi\hat a_+\hat a_-\ket\psi \ge 0$, and $\langle H\rangle = \tfrac{\langle p^2\rangle}{2m} + \tfrac12m\omega^2\langle x^2\rangle > 0$, so there are no negative energies.`,
        md`treating "zero" (the zero vector) as a state.`),
      tf(md`The oscillator levels are evenly spaced because $[\hat H, \hat a_\pm] = \pm\hbar\omega\,\hat a_\pm$.`, true,
        md`Then $\hat H(\hat a_\pm\psi) = \hat a_\pm\hat H\psi \pm \hbar\omega\hat a_\pm\psi = (E \pm \hbar\omega)(\hat a_\pm\psi)$: each rung is exactly $\hbar\omega$ above the last.`),
      tf(md`The ground-state energy is $\tfrac12\hbar\omega$ rather than $0$ because zero energy would need $\sigma_x = \sigma_p = 0$.`, true,
        md`$E = 0$ would require $\langle p^2\rangle = \langle x^2\rangle = 0$, impossible since $\sigma_x\sigma_p \ge \hbar/2$. Minimizing $\tfrac{\sigma_p^2}{2m} + \tfrac12m\omega^2\sigma_x^2$ under that constraint gives exactly $\tfrac12\hbar\omega$, half kinetic, half potential.`),
      tf(md`$\hat a_+\ket n = \ket{n + 1}$.`, false,
        md`$\hat a_+\ket n = \sqrt{n + 1}\ket{n + 1}$, since $\|\hat a_+\ket n\|^2 = \bra n\hat a_-\hat a_+\ket n = n + 1$.`,
        md`dropping the normalization spoils every matrix element and every $\langle x\rangle$.`),
      tf(md`In every stationary state of the oscillator, $\langle T\rangle = \langle V\rangle = \tfrac12E_n$.`, true,
        md`Ladder operators give $\langle x^2\rangle = \tfrac{\hbar}{m\omega}(n + \tfrac12)$ and $\langle p^2\rangle = \hbar m\omega(n + \tfrac12)$, so both energies are $\tfrac12\hbar\omega(n + \tfrac12)$. (Virial theorem for $V \propto x^2$.)`),
      tf(md`$\sigma_x\sigma_p = \hbar/2$ in every oscillator stationary state, since each $\psi_n$ is a Gaussian times a polynomial.`, false,
        md`$\sigma_x\sigma_p = (n + \tfrac12)\hbar$. Only $\psi_0$, a pure Gaussian, reaches the bound; the polynomial adds nodes, which raise both spreads.`),
      tf(md`$\bra n\hat x\ket n = 0$ for every $n$.`, true,
        md`$\hat x \propto \hat a_+ + \hat a_-$ changes $n$ by $\pm1$, and $\braket{n|n \pm 1} = 0$. (Also: $|\psi_n|^2$ is even.)`),
    ]),
    tfBlock('3 · Oscillator wavefunctions and motion', [
      tf(md`$\psi_3(x)$ has three nodes and is odd.`, true,
        md`$\psi_n$ has $n$ nodes and parity $(-1)^n$ ($H_3 = 8\xi^3 - 12\xi$).`),
      tf(md`A particle in the oscillator ground state is never found beyond the classical turning points.`, false,
        md`The Gaussian has tails: the probability beyond $|x| = \sqrt{\hbar/m\omega}$ (the turning points for $E = \tfrac12\hbar\omega$) is $\text{erfc}(1) \approx 16\%$. Quantum particles penetrate classically forbidden regions.`),
      tf(md`For large $n$, $|\psi_n|^2$ averaged over its wiggles approaches the classical density, which is largest near the turning points.`, true,
        md`$P_{\text{class}}(x) = \dfrac{1}{\pi\sqrt{x_0^2 - x^2}}$ peaks at $\pm x_0$, where the classical particle moves slowest. The correspondence principle: the quantum envelope matches it for $n \gg 1$, while $\psi_0$ peaks in the middle instead.`),
      tf(md`$|\Psi(x, t)|^2$ for $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$ repeats with period $2\pi/\omega$, and for $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$ with period $\pi/\omega$.`, true,
        md`The cross term oscillates at $(E_m - E_n)/\hbar$: $\omega$ and $2\omega$.`),
      tf(md`For $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$, $\langle x\rangle$ oscillates at $2\omega$.`, false,
        md`$\langle x\rangle = 0$ always: $\hat x$ only connects $n$ to $n \pm 1$, and the state is even. What oscillates at $2\omega$ is the width ($\langle x^2\rangle$): the packet breathes.`),
      tf(md`With an infinite wall at $x = 0$ added to the oscillator (the half-oscillator), the ground-state energy is still $\tfrac12\hbar\omega$.`, false,
        md`The wall forces $\psi(0) = 0$, so only the odd oscillator states survive: $E = \tfrac32\hbar\omega, \tfrac72\hbar\omega, \dots$, spacing $2\hbar\omega$. Squeezing the particle into half the space raises the energy.`),
      tf(md`If $\langle x\rangle$ oscillates, an energy measurement must have at least two possible outcomes.`, true,
        md`A single energy means a stationary state with constant $\langle x\rangle$. Motion needs at least two energies, and for $\langle x\rangle$ in the oscillator, two adjacent ones.`),
      tf(md`If $(\langle x\rangle, \langle p\rangle)$ traces the same ellipse as a classical oscillator, the state behaves classically.`, false,
        md`Every oscillator state does this (Ehrenfest is exact). $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$ traces an ellipse of size $\sim w_x/\sqrt2$, no bigger than its own quantum spread. "Classical" needs the orbit to be much larger than the spread, i.e. $n \gg 1$ (Discussion 6).`),
    ]),
    tfBlock('4 · Coherent states', [
      tf(md`A coherent state $\ket\alpha$ with $\alpha \ne 0$ is an eigenstate of $\hat H$.`, false,
        md`It contains every $\ket n$ with Poisson weights $e^{-|\alpha|^2}|\alpha|^{2n}/n!$, so it has many energies, and $\langle x\rangle$ oscillates. It is an eigenstate of $\hat a_-$, not of $\hat H$.`),
      tf(md`A coherent state keeps $\sigma_x = \sqrt{\hbar/2m\omega}$ at all times.`, true,
        md`It stays a coherent state ($\alpha(t) = \alpha e^{-i\omega t}$), and every coherent state has the ground-state widths: $\sigma_x\sigma_p = \hbar/2$ at all times. It does not spread.`),
      tf(md`The ground state $\ket0$ is a coherent state.`, true,
        md`$\hat a_-\ket0 = 0 = 0\cdot\ket0$: a coherent state with $\alpha = 0$, sitting still at the origin.`),
      tf(md`Coherent states are eigenstates of $\hat a_+$ with eigenvalue $\alpha^*$.`, false,
        md`$\hat a_+$ has no normalizable eigenstates (it raises the lowest component of any state, which nothing can match). The correct statement is for the bra: $\bra\alpha\hat a_+ = \alpha^*\bra\alpha$.`),
      tf(md`For a coherent state with $|\alpha|^2 = 100$, an energy measurement gives $100.5\,\hbar\omega$ almost certainly.`, false,
        md`$n$ is Poisson with mean $100$ and $\sigma_n = |\alpha| = 10$: $P(n = 100) \approx 0.04$. The *relative* spread is small (10%), not the absolute one.`),
      tf(md`As $|\alpha|$ grows, $\sigma_H/\langle H\rangle$ for a coherent state goes to zero.`, true,
        md`$\sigma_H = \hbar\omega|\alpha|$ and $\langle H\rangle = \hbar\omega(|\alpha|^2 + \tfrac12)$, so the ratio $\approx 1/|\alpha| \to 0$: the energy looks sharp, as for a classical oscillator.`),
    ]),
    tfBlock('5 · Three dimensions and angular momentum', [
      tf(md`Because $[\hat L_x, \hat L_y] = i\hbar\hat L_z$, no state can have both $L_x$ and $L_y$ sharp.`, false,
        md`The $\ell = 0$ state has $L_x = L_y = L_z = 0$, all sharp: the commutator's average vanishes there. For $\ell \ge 1$ at most one component can be sharp (Discussion 7).`,
        md`forgetting the one exception.`),
      tf(md`$L^2$ and $L_z$ can both be sharp in the same state.`, true,
        md`$[\hat L^2, \hat L_z] = 0$, so they have common eigenstates $Y_\ell^m$.`),
      tf(md`If a measurement gives $L^2 = 6\hbar^2$, a following measurement of $L_z$ can give $3\hbar$.`, false,
        md`$6\hbar^2 = \hbar^2\ell(\ell + 1)$ gives $\ell = 2$, so $L_z \in \{-2, \dots, 2\}\hbar$.`),
      tf(md`If a measurement gives $L_z = \hbar$, a following measurement of $L^2$ must give $2\hbar^2$.`, false,
        md`$m = 1$ only requires $\ell \ge 1$: $L^2 = 2\hbar^2, 6\hbar^2, 12\hbar^2, \dots$ are all possible. $\ell$ bounds $m$, but $m$ only bounds $\ell$ from below.`),
      tf(md`In the state $Y_\ell^\ell$, $\vec L$ points exactly along $z$, with length $\hbar\ell$.`, false,
        md`$|\vec L| = \hbar\sqrt{\ell(\ell + 1)} > \hbar\ell$, and $\langle L_x^2 + L_y^2\rangle = \hbar^2\ell \ne 0$: the vector lies on a cone around $z$, with undetermined transverse direction.`),
      tf(md`For a central potential, $\hat H$, $\hat L^2$ and $\hat L_z$ all commute with each other, so stationary states can be labelled by $(n, \ell, m)$.`, true,
        md`$V(r)$ is rotation-invariant, so $[\hat H, \hat L_i] = 0$, hence also $[\hat H, \hat L^2] = 0$; and $[\hat L^2, \hat L_z] = 0$. Three compatible observables, one common eigenbasis.`),
      tf(md`The Schrödinger equation separates into a radial and an angular equation for any potential $V(r, \theta, \varphi)$.`, false,
        md`Separation into $R(r)Y(\theta, \varphi)$ with the constant $\ell(\ell + 1)$ needs $V$ to depend on $r$ only (central). Otherwise the angular equation would contain $r$.`),
      tf(md`In the 3D isotropic oscillator, the level $N = 2$ contains only $\ell = 2$ states.`, false,
        md`It has 6 states: an $\ell = 2$ multiplet (5) and an $\ell = 0$ state ($\propto (2r^2/x_0^2 - 3)e^{-r^2/2x_0^2}$). Two values of $\ell$ at one energy: an accidental degeneracy.`),
      tf(md`$\hat L_+Y_\ell^\ell$ is (a multiple of) $Y_\ell^{\ell + 1}$.`, false,
        md`It is zero: the coefficient $\hbar\sqrt{\ell(\ell + 1) - \ell(\ell + 1)}$ vanishes. The ladder must stop at $m = \ell$, otherwise $\langle L_x^2 + L_y^2\rangle = \hbar^2[\ell(\ell + 1) - m^2]$ would turn negative.`),
    ]),
    tfBlock('6 · Spherical harmonics and measuring L', [
      tf(md`$e^{i\varphi/2}$ is an acceptable eigenfunction of $\hat L_z$ with eigenvalue $\hbar/2$.`, false,
        md`It changes sign when $\varphi \to \varphi + 2\pi$, the same point: not single-valued. Orbital $m$ must be an integer (same argument as Midterm 1's ring).`),
      tf(md`$|Y_\ell^m(\theta, \varphi)|^2$ never depends on $\varphi$.`, true,
        md`$Y_\ell^m \propto P_\ell^m(\cos\theta)e^{im\varphi}$ and $|e^{im\varphi}| = 1$. States of definite $L_z$ are symmetric about the $z$ axis; lobes in $\varphi$ need a mix of $\pm m$.`),
      tf(md`In the state $Y_1^0$, a measurement of $L_x$ gives $0$ with certainty.`, false,
        md`$Y_1^0 \propto z = \tfrac{1}{2i}[(y + iz) - (y - iz)]$, and $y \pm iz$ are the $L_x = \pm\hbar$ eigenfunctions: $\pm\hbar$ with $\tfrac12$ each, and $L_x = 0$ (eigenfunction $x$) has probability $0$.`,
        md`"$L_z = 0$ means no angular momentum at all".`),
      tf(md`After $L_x$ is measured on a state of definite $L_z$, a new measurement of $L_z$ may give a different value.`, true,
        md`$[\hat L_x, \hat L_z] \ne 0$: the $L_x$ eigenstate the measurement leaves behind is a superposition of several $m$. The second $L_z$ result is no longer certain.`),
      tf(md`The rigid rotor $\hat H = \hat L^2/2I$ has equally spaced levels, like the oscillator.`, false,
        md`$E_\ell = \tfrac{\hbar^2\ell(\ell + 1)}{2I}$, so $E_{\ell + 1} - E_\ell = \tfrac{\hbar^2(\ell + 1)}{I}$ grows with $\ell$: rotational lines are evenly spaced in frequency, the levels are not.`),
      tf(md`Adding $-\gamma B\hat L_z$ to the rotor Hamiltonian gives the $2\ell + 1$ states of each $\ell$ different energies.`, true,
        md`$Y_\ell^m$ remain eigenstates and $E$ shifts by $-\gamma B\hbar m$, different for every $m$. The field picks a direction and breaks the rotational symmetry that caused the degeneracy.`),
      tf(md`Spherical harmonics with odd $\ell$ are odd under parity $\vec r \to -\vec r$.`, true,
        md`$Y_\ell^m(\pi - \theta, \varphi + \pi) = (-1)^\ell Y_\ell^m(\theta, \varphi)$. E.g. $Y_1^0 \propto z/r$ is odd, $Y_2^0 \propto (3z^2 - r^2)/r^2$ is even.`),
      tf(md`$\sin^2\theta$ is an eigenfunction of $\hat L^2$.`, false,
        md`$\sin^2\theta = 1 - \cos^2\theta = \tfrac23 - \tfrac13(3\cos^2\theta - 1)$: a mix of $\ell = 0$ and $\ell = 2$ (both $m = 0$). Compare $\sin^2\theta\,e^{2i\varphi} \propto Y_2^2$, which is one.`),
    ]),
    tfBlock('7 · The radial equation and central potentials', [
      tf(md`$u = rR$ must vanish at $r = 0$ because otherwise $\psi \propto 1/r$ near the origin would not be normalizable.`, false,
        md`$\int|1/r|^2r^2dr$ is finite near $0$, so normalizability is not the problem for $\ell = 0$. The problem is that $1/r$ is not a solution: $\nabla^2(1/r) = -4\pi\delta^3(\vec r)$, a delta function nothing in $V\psi$ or $E\psi$ can cancel. (For $\ell \ge 1$ the $r^{-\ell}$ branch *is* non-normalizable.)`,
        md`the most common "reason" given, and wrong for $\ell = 0$ (Discussion 8).`),
      tf(md`For a fixed number of radial nodes, the energy rises with $\ell$.`, true,
        md`The centrifugal term $\tfrac{\hbar^2\ell(\ell + 1)}{2mr^2}$ is positive and grows with $\ell$, adding rotational kinetic energy to the same radial motion. Box: 1s < 1p < 1d < 1f. Hydrogen: $E$ depends on $N + \ell$.`),
      tf(md`A repulsive potential $V = +k/r$ has bound states with large $\ell$, trapped behind the centrifugal barrier.`, false,
        md`$V_{\text{eff}} = k/r + \tfrac{\hbar^2\ell(\ell + 1)}{2mr^2} > 0$ decreases monotonically to $0$: there is no well. Every allowed energy is positive and the particle escapes.`),
      tf(md`$|u(r)|^2dr$ is the probability of finding the particle between $r$ and $r + dr$.`, true,
        md`$|\psi|^2d^3r = |R|^2|Y|^2r^2dr\,d\Omega$; integrating over angles with normalized $Y$ leaves $r^2|R|^2dr = |u|^2dr$.`),
      tf(md`Only $s$ states have a nonzero probability density at the origin.`, true,
        md`Near $0$, $u \propto r^{\ell + 1}$ so $R \propto r^\ell$: $R(0) \ne 0$ only for $\ell = 0$. The centrifugal barrier keeps particles with angular momentum away from the center.`),
      tf(md`In the infinite spherical well, levels with different $\ell$ never have the same energy.`, true,
        md`The energies are set by zeros of different spherical Bessel functions, which never coincide. Each level is one $(2\ell + 1)$ multiplet: the generic case for a central potential. Hydrogen and the 3D oscillator are the exceptions.`),
    ]),
    tfBlock('8 · Hydrogen', [
      tf(md`The hydrogen level $n = 3$ contains 9 states (ignoring spin).`, true,
        md`$\ell = 0, 1, 2$ with $1 + 3 + 5 = 9 = n^2$ states.`),
      tf(md`The 2s and 2p levels of hydrogen are degenerate because of rotational symmetry.`, false,
        md`Rotations explain only the $m$ degeneracy within one $\ell$; they never change $\ell$. The 2s–2p coincidence is accidental, special to $1/r$ (its hidden symmetry is the Runge–Lenz vector).`),
      tf(md`The most probable electron–proton distance in the 1s state is $a$, but the mean distance is larger.`, true,
        md`$P(r) \propto r^2e^{-2r/a}$ peaks at $a$; $\langle r\rangle = \tfrac32a$ because of the long tail.`),
      tf(md`The shortest-wavelength line of the Balmer series (transitions down to $n = 2$) is at $656$ nm.`, false,
        md`656 nm (3 → 2) is the *longest*. The shortest is the series limit $\infty \to 2$: $\lambda = 1240\ \text{eV·nm}/3.4\ \text{eV} = 365$ nm.`),
      tf(md`In the hydrogen ground state, $\langle V\rangle = -13.6$ eV.`, false,
        md`Virial theorem for $1/r$: $\langle V\rangle = 2E_1 = -27.2$ eV and $\langle T\rangle = -E_1 = +13.6$ eV.`),
      tf(md`In hydrogen the energy depends on $\ell$ through the centrifugal term, so 3s, 3p and 3d have different energies.`, false,
        md`$E_n = -13.6\ \text{eV}/n^2$ with $n = N + \ell$: raising $\ell$ by one removes one radial node, and for $1/r$ the two effects cancel exactly. 3s, 3p, 3d are degenerate (unlike in sodium).`),
      tf(md`A hydrogen state with $\ell = n - 1$ has a radial function with no nodes.`, true,
        md`The number of radial nodes is $N - 1 = n - \ell - 1 = 0$. These are the "circular" states, e.g. 1s, 2p, 3d.`),
    ]),
  ];

  const tfQ = [
    Q(md`"If $\langle Q\rangle$ is constant in some state, then $[\hat H, \hat Q] = 0$." Verdict and reason?`,
      ['False: in a stationary state every expectation value is constant', 'True: that is the generalized Ehrenfest theorem', 'True, provided Q has no explicit time dependence', 'False: ⟨Q⟩ is only constant when Q = H'], 0,
      [null, 'Ehrenfest gives the other direction: commuting ⇒ constant.', 'Still the wrong direction; ⟨x⟩ = 0 in |n⟩ and x has no explicit t.', md`Any conserved $\hat Q$ (like $\hat L_z$ in a central potential) has constant $\langle Q\rangle$.`],
      md`Counterexample: $\ket n$ of the oscillator, $\langle x\rangle = 0$ forever, $[\hat H, \hat x] \ne 0$.`),
    Q(md`"$\hat a_-\ket0$ is a state with energy $-\tfrac12\hbar\omega$." Verdict and reason?`,
      ['False: it is the zero vector, so the ladder ends at n = 0', 'True: the ladder lowers the energy by ħω', 'False: it is |0⟩ again', 'True, but the state is not normalizable'], 0,
      [null, 'Lowering below the bottom would give negative ⟨H⟩, impossible for p²/2m + ½mω²x².', md`$\hat a_-\ket0 = 0$, not $\ket0$.`, 'The zero vector is not a state at all.'],
      md`$\|\hat a_-\ket0\|^2 = \bra0\hat a_+\hat a_-\ket0 = 0$.`),
    Q(md`"For $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$, $\langle x\rangle$ oscillates at $2\omega$." Verdict and reason?`,
      ['False: x only connects neighbors, so ⟨x⟩ = 0; the width breathes at 2ω', 'True: the energies differ by 2ħω', 'False: nothing changes in time', 'True, with amplitude √2·√(ħ/2mω)'], 0,
      [null, 'The frequency is right for |Ψ|², but ⟨x⟩ needs adjacent levels.', md`$\langle x^2\rangle$ and $|\Psi|^2$ do change.`, md`$\bra0\hat x\ket2 = 0$.`],
      'An even state stays even: ⟨x⟩ = 0, but ⟨x²⟩ oscillates at 2ω.'),
    Q(md`"A coherent state with $|\alpha|^2 = 100$ has energy $100.5\,\hbar\omega$ with near certainty." Verdict and reason?`,
      ['False: n is Poisson with σ_n = 10, so P(n = 100) ≈ 0.04', 'True: coherent states are classical, so the energy is sharp', 'True: ⟨H⟩ = ħω(|α|² + ½)', 'False: coherent states have no definite ⟨H⟩'], 0,
      [null, 'Only the relative spread (10%) is small.', 'That is the average, not a certain outcome.', md`$\langle H\rangle = \hbar\omega(|\alpha|^2 + \tfrac12)$ is perfectly definite.`],
      md`$\sigma_n = |\alpha|$.`),
    Q(md`"No state can have both $L_x$ and $L_y$ sharp, because $[\hat L_x, \hat L_y] \ne 0$." Verdict and reason?`,
      ['False: the ℓ = 0 state has all components sharp (zero)', 'True: non-commuting observables are never both sharp', 'True for every state with ℓ ≥ 0', 'False: they can be sharp whenever L_z = 0'], 0,
      [null, 'The bound involves ⟨L_z⟩, which can vanish.', 'ℓ = 0 is the exception.', md`$Y_1^0$ has $L_z = 0$ but $L_x$ is not sharp ($\pm\hbar$).`],
      'Discussion 7: two sharp components force ℓ = 0.'),
    Q(md`"In $Y_1^0$, measuring $L_x$ gives $0$ for certain." Verdict and reason?`,
      ['False: z = [(y+iz) − (y−iz)]/2i gives ±ħ with ½ each, and 0 never', 'True: L_z = 0 means no angular momentum', 'False: 0, ±ħ with ⅓ each', 'True: Y₁⁰ is symmetric about every axis'], 0,
      [null, 'L² = 2ħ² is certain; the angular momentum is just not along z.', 'Not uniform: the expansion has no x component.', md`$|Y_1^0|^2 \propto \cos^2\theta$ singles out $z$.`],
      md`The $L_x = 0$ eigenfunction is $x$, orthogonal to $z$.`),
    Q(md`"If $L_z = \hbar$ is measured, then $L^2 = 2\hbar^2$ for certain." Verdict and reason?`,
      ['False: m = 1 only requires ℓ ≥ 1', 'True: ℓ = m', 'True: ℓ = |m| for the lowest energy', 'False: L² must then be ħ²'], 0,
      [null, 'ℓ ≥ |m|, not ℓ = |m|.', 'Energy was not mentioned; any ℓ ≥ 1 is allowed.', 'L² is always ħ²ℓ(ℓ+1).'],
      md`$L^2 \in \{2, 6, 12, \dots\}\hbar^2$.`),
    Q(md`"$u(0) = 0$ because $\psi \propto 1/r$ is not normalizable." Verdict and reason?`,
      ['False: 1/r is normalizable in 3D; it fails because ∇²(1/r) = −4πδ³', 'True: ∫|1/r|² d³r diverges', 'True for all ℓ', 'False: u(0) need not vanish for ℓ = 0'], 0,
      [null, md`$\int r^{-2}r^2dr$ converges at $0$.`, 'For ℓ ≥ 1 the r^{−ℓ} branch fails by normalizability; ℓ = 0 is different.', 'It must vanish; the reason is the delta function.'],
      'Discussion 8, part 1(a).'),
    Q(md`"$V = +k/r$ has bound states for large enough $\ell$." Verdict and reason?`,
      ['False: V_eff > 0 everywhere and falls to 0, so there is no well', 'True: the centrifugal barrier traps the particle', 'True for ℓ = 0 only', 'False: only because spin is ignored'], 0,
      [null, 'A barrier with nothing lower inside does not trap.', 'For ℓ = 0 V_eff = k/r > 0, no well.', 'Spin is irrelevant here.'],
      'Bound states need E < V(∞) = 0, but V_eff > 0.'),
    Q(md`"Hydrogen's 2s and 2p are degenerate because of rotational symmetry." Verdict and reason?`,
      ['False: rotations explain only the m degeneracy; 2s–2p is accidental', 'True: H commutes with every L_i', 'True: the energy never depends on ℓ in a central potential', 'False: they are not degenerate'], 0,
      [null, 'That gives degeneracy in m at fixed ℓ only.', 'The spherical box is a counterexample.', 'In pure Coulomb they are exactly degenerate.'],
      'Only 1/r has the extra (Runge–Lenz) symmetry.'),
    Q(md`"In the hydrogen ground state $\langle T\rangle$ is negative because $E < 0$." Verdict and reason?`,
      ['False: ⟨T⟩ = ⟨p²⟩/2m ≥ 0; here ⟨T⟩ = +13.6 eV and ⟨V⟩ = −27.2 eV', 'True: bound states have negative kinetic energy', 'True: ⟨T⟩ = E for Coulomb', 'False: ⟨T⟩ = 0 in the ground state'], 0,
      [null, 'Bound means E below V(∞), not T < 0.', 'Virial: ⟨T⟩ = −E.', 'Confinement costs kinetic energy.'],
      md`Virial theorem for $1/r$: $2\langle T\rangle = -\langle V\rangle$.`),
    Q(md`"For any oscillator state, $\langle x\rangle(t)$ obeys the classical equation of motion exactly." Verdict and reason?`,
      ['True: V′ is linear, so ⟨V′(x)⟩ = V′(⟨x⟩)', 'False: only coherent states move classically', 'False: Ehrenfest only holds for the average force', 'True, but only for real initial states'], 0,
      [null, 'Coherent states additionally keep a minimal spread; ⟨x⟩ is classical for all states.', 'For a linear force the average force equals the force at the average.', 'No restriction to real states.'],
      md`$\tfrac{d^2\langle x\rangle}{dt^2} = -\omega^2\langle x\rangle$.`),
    Q(md`"The rigid rotor's levels are equally spaced." Verdict and reason?`,
      ['False: E ∝ ℓ(ℓ+1), spacing ħ²(ℓ+1)/I grows', 'True: like the oscillator, the ladder steps by ħ', 'True: E ∝ ℓ', 'False: they get closer together'], 0,
      [null, 'L± change m, not ℓ, and do not change the energy.', 'E ∝ ℓ(ℓ+1), not ℓ.', 'They spread apart.'],
      md`$E_{\ell+1} - E_\ell = \hbar^2(\ell + 1)/I$.`),
    Q(md`"After an energy measurement gives $E_2$ on $\tfrac{1}{\sqrt2}(\psi_{100} + \psi_{210})$, the atom may be in 2s." Verdict and reason?`,
      ['False: the measurement projects onto the E₂ subspace, keeping only ψ₂₁₀', 'True: E₂ is degenerate, so any n = 2 state can result', 'True, with probability ¼', 'False: E₂ cannot be measured on this state'], 0,
      [null, 'Collapse keeps the component already in that subspace; the 2s amplitude is 0.', 'No 2s component, no 2s outcome.', 'E₂ comes up with probability ½.'],
      'Degenerate collapse = projection, not a random pick.'),
  ];

  const tfLesson = {
    id: 'm2-tf', title: 'True or false? Justify (60 statements)', sub: 'the Midterm 1 3(b)–(d) skill', kind: 'review',
    steps: [
      R(md`
        **The format.** Midterm 1 Problem 3(b)–(d) were statements to judge, each worth 5 points: "True or false? To receive credit, you must give a brief justification." The verdict alone earned **1 point**. The other 4 were for the reason. The class medians on those parts were 30–40%: mostly right verdicts with no physics behind them.

        **How to use this page.** Cover the answer, write *True* or *False* and one or two sentences of justification for each statement, then open it. Grade yourself like the exam: 5 for the verdict plus the reason a grader wants, 3 for a vague reason, 1 for the verdict alone. Each answer also names the trap the statement is built on.

        **What a 5/5 justification looks like.** One sentence naming the principle (a commutator, a selection rule, a boundary condition, a formula) and one applying it to the case: *"False. $\hat H$ is time-independent, so each energy component keeps its energy; only where the particle is changes, not its energy."* Counterexamples are the fastest proof that a statement is false.

        Sixty statements in eight groups, about half true. The quick multiple-choice versions at the bottom feed the concept quiz.
      `),
      ...tfGroups,
      R(md`### Quick checks (verdict + reason in one click)`),
      ...tfQ,
    ],
  };

  /*@@MORE@@*/

  C.unit({
    id: 'u14', exam: 'm2', num: 'Unit 8', title: 'Harder practice midterms and short-answer drills',
    blurb: 'Five harder timed exams in the Midterm 1 format (number 10 is the dress rehearsal), 60 true-or-false statements to justify, and the explain-in-words parts the class lost most points on.',
    lessons: [pm6, pm7, pm8, pm9, pm10, tfLesson, words],
  });
})();

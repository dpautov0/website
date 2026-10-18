/* Topic 16 — Sinusoidal plane waves (Lecture 19). E = E0 cos(ωt − βz + φ) x̂: reading ω, f, T, β, λ, v_p and the direction
   of travel off an expression; the phase and how it moves with t and z; what a medium changes (v_p, η, λ) and what it
   does not (f); the sinusoidal current sheet of the formula sheet; H from E and back (HW 7 #4); which expressions are
   waves (HW 7 #5). Arbitrary waveforms and the wave equation are Topic 14; power is Topic 17. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;
  const ETA0 = EM.eta0, CC = EM.c;

  // ---------------------------------------------------------------- helpers
  const AX = ['x', 'y', 'z'];
  const uv = (i, s = 1) => { const v = [0, 0, 0]; v[i] = s; return v; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const neg = (v) => v.map((c) => -c);
  const vt = (v) => { const i = v.findIndex((c) => c !== 0); return `${v[i] > 0 ? '+' : '-'}\\hat ${AX[i]}`; };
  const opt = (v) => `$${vt(v)}$`;
  // x as a multiple of π in TeX: 2e8π -> "2\times10^{8}\pi", π -> "\pi"
  const tpi = (x) => { const k = +(x / Math.PI).toPrecision(4); return k === 1 ? '\\pi ' : `${p(k)}\\pi `; };
  // a random free-space-or-dielectric sinusoid with nice numbers: β/π = 2f√εr/c is a short decimal
  const FQ = [7.5e7, 1.5e8, 3e8, 6e8], ERS = [1, 2.25, 4, 9];
  const mkWave = () => {
    const fr = pick(FQ), er = pick(ERS), u = ri(0, 2), pol = pick([0, 1, 2].filter((i) => i !== u)), s = pick([1, -1]);
    const w = 2 * Math.PI * fr, v = CC / Math.sqrt(er), b = w / v;
    return { fr, er, u, pol, s, w, v, b, lam: v / fr, eta: ETA0 / Math.sqrt(er), arg: `${tpi(w)}t ${s > 0 ? '-' : '+'} ${tpi(b)}${AX[u]}` };
  };
  const fmtF = (x) => (x >= 1e9 ? `$${p(x / 1e9)}$ GHz` : x >= 1e6 ? `$${p(x / 1e6)}$ MHz` : `$${p(x / 1e3)}$ kHz`);

  // ---------------------------------------------------------------- figures
  // a snapshot at t = 0 and at t = T/8: every crest has moved λ/8 toward +z
  const moveFig = () => PF.plot({
    w: 320, h: 160, x: [0, 2], y: [-1.3, 1.5], zero: true, xl: 'z/\\lambda', yl: 'E_x/E_0',
    xt: [[0.5, '\\tfrac12'], [1, '1'], [1.5, '\\tfrac32'], [2, '2']], yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: (z) => Math.cos(2 * Math.PI * z), lab: 't = 0', labAt: 1.02, dx: -18, dy: -12 }, { f: (z) => Math.cos(2 * Math.PI * (z - 0.125)), cls: 'dash', lab: 't = T/8', labAt: 1.16, dx: 4, dy: -6 }],
  });
  // a sinusoidal sheet at t = 0 (φ = 0): E_x even, ηH_y odd
  // labels sit above crests: E_x's at z = λ, ηH_y's at z = −λ/2 (where the two curves are opposite)
  const sheetSnap = () => PF.plot({
    w: 340, h: 170, x: [-1.5, 1.5], y: [-1.3, 1.5], zero: true, xl: 'z/\\lambda', yl: '',
    xt: [[-1, '-1'], [-0.5, '-\\tfrac12'], [0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
    curves: [
      { f: (z) => Math.cos(2 * Math.PI * Math.abs(z)), lab: 'E_x/E_0', labAt: 1, dx: 6, dy: -10 },
      { f: (z) => -Math.cos(2 * Math.PI * z), from: -1.5, to: 0, cls: 'dash', lab: '\\eta H_y/E_0', labAt: -0.5, dx: 6, dy: -10 },
      { f: (z) => Math.cos(2 * Math.PI * z), from: 0, to: 1.5, cls: 'dash' },
    ],
  });

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u5', {
    id: 't16-sinusoids', topic: 16, ref: 'Lecture 19', title: 'Sinusoidal plane waves',
    steps: [
      R(md`
        !!key Why you care
          Spring 2018 1(vii) asks for a wavelength from a phase change. Lecture 18's challenge reads speeds and directions off three expressions. HW 7 #4 builds $\mathbf H$ from $\mathbf E$ (and $\mathbf E$ from $\mathbf H$ in a dielectric), and HW 7 #5 asks which expressions are waves. Lecture 20's power problem starts by reading $\omega$ and $\beta$ off $\mathbf H$. And the formula sheet's sheet source is a sinusoid. Every one of these is a reading exercise: get each coefficient's meaning right and the rest is arithmetic.

        ### Notation

        - $E_0$ (V/m), $H_0$ (A/m): amplitudes, the peak values.
        - $\omega$: angular frequency, rad/s. $f = \omega/2\pi$: frequency, Hz. $T = 1/f$: period, s.
        - $\beta$: phase constant (wavenumber), rad/m. $\lambda = 2\pi/\beta$: wavelength, m.
        - $\phi$: a constant phase offset, rad. $\Phi = \omega t - \beta z + \phi$: the whole argument, the **phase** (Lecture 19 calls the whole argument $\phi$).
        - $v_p = \omega/\beta$: phase velocity, m/s; $c = 3\times10^8$ m/s.
        - $\mu_r$, $\epsilon_r$: relative permeability and permittivity, $\mu = \mu_r\mu_0$, $\epsilon = \epsilon_r\epsilon_0$.
        - $\eta = \sqrt{\mu/\epsilon}$: intrinsic impedance, Ω; $\eta_0 = 120\pi\ \Omega$.
        - $\hat k$: unit vector along the direction of travel.

        ### The idea

        $\mathbf E = E_0\cos(\omega t - \beta z + \phi)\,\hat x$ is a cosine in two ways at once. At a fixed place it oscillates in time with period $T$. At a fixed time it is a cosine in space with period $\lambda$. Each crest is a point of constant phase; keeping $\Phi$ fixed while $t$ grows moves the crest at
        $$v_p = \frac{dz}{dt}\Big|_{\Phi} = \frac{\omega}{\beta} = \lambda f$$
        A crest advances one wavelength per period.
      `),
      RF(md`
        ### Step 1: reading the expression

        Every parameter is a coefficient:

        - $\omega$ multiplies $t$; $\beta$ multiplies the position coordinate.
        - **Direction:** opposite signs ($\omega t - \beta z$) travel toward $+z$; equal signs ($\omega t + \beta z$) toward $-z$. Hold $\Phi$ fixed: $z = (\omega t + \phi - \Phi)/\beta$ grows with $t$ only for the minus sign.
        - The unit vector in front ($\hat x$) is the **field direction** (polarization), not the direction of travel.

        [[fig:move]]

        Lecture 20's wave, $\mathbf H = H_0\cos(6\pi\times10^7t - 0.2\pi z)\,\hat y$: $\omega = 6\pi\times10^7$ rad/s, so $f = 30$ MHz and $T = 33.3$ ns; $\beta = 0.2\pi$ rad/m, so $\lambda = 10$ m; $v_p = \omega/\beta = 3\times10^8$ m/s (free space); toward $+z$.
      `, { move: { svg: moveFig(), cap: 'cos(ωt − βz) at t = 0 (solid) and t = T/8 (dashed): every crest has moved λ/8 toward +z.' } }),
      Q(md`**Predict.** $\mathbf E = 5\cos(2\pi\times10^9t + 20\pi x)\,\hat z$ V/m. The wave travels…`,
        ['toward $-x$, with $\\lambda = 0.1$ m', 'toward $+x$, with $\\lambda = 0.1$ m', 'toward $-x$, with $\\lambda = 20\\pi$ m', 'toward $+z$, with $\\lambda = 0.3$ m'], 0,
        [null, 'Equal signs on $t$ and $x$ mean travel toward $-x$: $x = (\\Phi - \\omega t)/20\\pi$ shrinks as $t$ grows.', '$\\beta$ is not the wavelength: $\\lambda = 2\\pi/\\beta$.', '$\\hat z$ is the field direction; the travel direction is read from the argument, here $x$. And $c/f$ assumes free space, but $v_p = \\omega/\\beta = 10^8$ m/s here.'],
        md`$\beta = 20\pi$ rad/m: $\lambda = 2\pi/20\pi = 0.1$ m. Signs equal: toward $-x$. Also $v_p = 2\pi\times10^9/20\pi = 10^8$ m/s $= c/3$: a medium with $\mu_r\epsilon_r = 9$.`),
      R(md`
        ### Step 2: the phase

        $\Phi(z, t) = \omega t - \beta z + \phi$.

        - **At a fixed point** the phase advances $\omega$ radians per second: $\Delta\Phi = \omega\,\Delta t$.
        - **At a fixed time** the phase drops by $\beta$ radians per meter along the direction of travel: $\Delta\Phi = -\beta\,\Delta z$. Points farther along **lag**: they show what the source did earlier.
        - A phase change of $2\pi$ is one period in time, or one wavelength in space. Half a wavelength apart, two points are in antiphase (opposite signs at every instant).

        Spring 2018 1(vii) is exactly this: a phase change measured at one place over a time interval gives $\omega$, then $f$, then $\lambda = c/f$.
      `),
      Q(md`**Predict.** At a fixed point the phase of a free-space wave advances by $\pi/2$ in 2 ns. The wavelength is…`,
        ['2.4 m', '0.6 m', '0.38 m', '1.2 m'], 0,
        [null, 'That is $c\\,\\Delta t$: the distance light goes in 2 ns. But 2 ns is only a quarter period.', 'That is $c/\\omega$, using $\\omega$ in place of $f$.', 'That takes $\\pi/2$ for half a cycle ($T = 4$ ns). Half a cycle is $\\pi$; $\\pi/2$ is a quarter, so $T = 8$ ns.'],
        md`$\omega = (\pi/2)/(2\times10^{-9}\ \text{s}) = 7.85\times10^8$ rad/s, $f = \omega/2\pi = 125$ MHz, $\lambda = c/f = 2.4$ m. Quicker: a quarter cycle in 2 ns means $T = 8$ ns and $\lambda = cT = 2.4$ m.`),
      R(md`
        ### Step 3: in a medium

        $$v_p = \frac{1}{\sqrt{\mu\epsilon}} = \frac{c}{\sqrt{\mu_r\epsilon_r}} \qquad \eta = \sqrt{\frac\mu\epsilon} = \eta_0\sqrt{\frac{\mu_r}{\epsilon_r}}$$
        The source sets $f$: every point oscillates at the frequency it is driven at. So in a slower medium the wavelength shrinks, $\lambda = v_p/f = \lambda_0/\sqrt{\mu_r\epsilon_r}$, and $\beta = \omega/v_p$ grows.

        HW 7 #4(b) gives $v_p = \tfrac23c$ with $\mu_r = 1$: then $\epsilon_r = (c/v_p)^2 = 2.25$ and $\eta = 120\pi/1.5 = 80\pi \approx 251\ \Omega$.
      `),
      Q(md`**Predict.** A 100 MHz wave travels in a lossless dielectric with $\epsilon_r = 4$, $\mu_r = 1$. Its wavelength is…`,
        ['1.5 m', '3 m', '0.75 m', '6 m'], 0,
        [null, 'That is the free-space wavelength, $c/f$.', 'That divides by $\\epsilon_r$; the speed goes as $1/\\sqrt{\\epsilon_r}$.', 'A denser medium slows the wave, so the wavelength gets shorter, not longer.'],
        md`$v_p = c/\sqrt4 = 1.5\times10^8$ m/s, $\lambda = v_p/f = 1.5$ m. The frequency is still 100 MHz.`),
      RF(md`
        ### Step 4: the sinusoidal sheet

        Feed Topic 15's sheet a sinusoid, $\mathbf J_s = -J_0\cos(\omega t + \phi)\,\hat x$ on $z = 0$. The retarded time $t - |z|/v_p$ turns $\omega t$ into $\omega t - \beta|z|$:
        $$E_x = \frac{\eta J_0}{2}\cos(\omega t \mp \beta z + \phi) \qquad H_y = \pm\frac{J_0}{2}\cos(\omega t \mp \beta z + \phi) \qquad (z \gtrless 0)$$

        - $E$ and $H$ are **in phase**: the same argument, peaking together. $|E| = \eta|H|$.
        - At the sheet the phase is the source's; every meter away it lags by $\beta$.
        - $E_x$ is even in $z$, $H_y$ is odd, as for any sheet waveform.

        [[fig:snap]]
      `, { snap: { svg: sheetSnap(), cap: 'A sinusoidal sheet at t = 0 (φ = 0): $E_x$ (solid) is even, η$H_y$ (dashed) is odd and jumps by ηJ₀ across the sheet.' } }),
      Q(md`**Predict.** $\mathbf J_s = -2\cos(\omega t)\,\hat x$ A/m on $z = 0$ in free space. The amplitude of $E_x$ at $z = -5$ m is…`,
        ['377 V/m', '754 V/m', '75 V/m', '1 V/m'], 0,
        [null, 'That is $\\eta_0J_0$. The jump in $H$ is shared by two waves: $E_0 = \\eta_0J_0/2$.', 'A sheet\'s plane wave does not weaken with distance.', 'That is $H_0 = J_0/2$ in A/m. Multiply by $\\eta_0$.'],
        md`$E_0 = \tfrac{\eta_0}{2}J_0 = (60\pi)(2) = 377$ V/m, the same at every $z$. Only the phase changes with distance: $-\beta|z|$.`),
      R(md`
        ### Step 5: H from E, and back

        Two ways, both used in HW 7 #4.

        **The curl equations.** For $\mathbf E = \cos(\omega t - \beta x)\,\hat y$ in free space:$\nabla\times\mathbf E = \hat z\,\partial E_y/\partial x = \beta\sin(\omega t - \beta x)\,\hat z$. Faraday, $\nabla\times\mathbf E = -\mu_0\,\partial\mathbf H/\partial t$, then needs $\mathbf H = \dfrac{\beta}{\omega\mu_0}\cos(\omega t - \beta x)\,\hat z$, and $\beta/(\omega\mu_0) = 1/(\mu_0c) = 1/\eta_0$.

        **The shortcut.** In a plane wave traveling along $\hat k$:
        $$\mathbf H = \frac1\eta\,\hat k\times\mathbf E \qquad \mathbf E = \eta\,\mathbf H\times\hat k$$
        Same example: $\hat k = \hat x$, $\hat x\times\hat y = \hat z$, so $\mathbf H = \tfrac{1}{\eta_0}\cos(\omega t - \beta x)\,\hat z$ A/m. Always finish with the check $\mathbf E\times\mathbf H \parallel \hat k$.
      `),
      Q(md`**Predict.** In free space $\mathbf E = 10\cos(\omega t + \beta y)\,\hat z$ V/m. Then $\mathbf H$ is…`,
        ['$-26.5\\cos(\\omega t + \\beta y)\\,\\hat x$ mA/m', '$+26.5\\cos(\\omega t + \\beta y)\\,\\hat x$ mA/m', '$-26.5\\cos(\\omega t + \\beta y)\\,\\hat y$ mA/m', '$-3770\\cos(\\omega t + \\beta y)\\,\\hat x$ A/m'], 0,
        [null, 'That uses $\\hat k = +\\hat y$. Equal signs mean travel toward $-y$.', '$\\mathbf H$ is perpendicular to the travel direction $\\hat y$.', 'Divide by $\\eta_0$; do not multiply.'],
        md`$\hat k = -\hat y$: $\mathbf H = \tfrac{1}{\eta_0}(-\hat y)\times\hat z\,(10\cos\ldots) = -\tfrac{10}{377}\cos(\omega t + \beta y)\,\hat x = -26.5\cos(\ldots)\,\hat x$ mA/m. Check: $\hat z\times(-\hat x) = -\hat y$ ✓.`),
      R(md`
        ### Step 6: which expressions are waves (HW 7 #5)

        - **Any shape** $f(\omega t - \beta x)$ solves the wave equation $\partial^2E/\partial x^2 = \mu\epsilon\,\partial^2E/\partial t^2$, provided $\beta^2 = \omega^2\mu\epsilon$ (both sides give $f''$ times a constant). So $\cos^2(\omega t - \beta x) = \tfrac12 + \tfrac12\cos(2\omega t - 2\beta x)$ is a valid wave: a traveling cosine at $2\omega$ plus a constant.
        - **Standing wave:** $\cos(\omega t)\cos(\beta z) = \tfrac12\cos(\omega t - \beta z) + \tfrac12\cos(\omega t + \beta z)$, two equal waves going opposite ways. Its zeros (nodes) stay put; it does not travel. Valid if $\beta^2 = \omega^2\mu\epsilon$.
        - **Oblique wave:** $\cos(\omega t - \beta_xx - \beta_yy)\,\hat z$ travels along $(\beta_x, \beta_y, 0)$, in the $xy$-plane. The two second derivatives add: valid if $\beta_x^2 + \beta_y^2 = \omega^2\mu\epsilon$. ($\hat z$ is perpendicular to the travel, so $\nabla\cdot\mathbf E = 0$ too.)
      `),
      Q(md`**Predict.** Is $\mathbf E = \cos(\omega t)\cos(\beta z)\,\hat x$, with $\beta = \omega\sqrt{\mu\epsilon}$, a solution of the wave equation?`,
        ['Yes: it is two equal waves traveling in opposite directions (a standing wave)', 'No: it is not of the form $f(t - z/v_p)$', 'No: a solution must travel', 'Only at the nodes, where it is zero'], 0,
        [null, 'The wave equation is linear: a sum $f(t - z/v_p) + g(t + z/v_p)$ is also a solution.', 'The wave equation does not demand travel; any sum of a forward and a backward wave solves it.', 'Plug it in: both sides equal $-\\omega^2\\mu\\epsilon\\,E$ at every point.'],
        md`$\partial^2_zE = -\beta^2E$ and $\mu\epsilon\,\partial^2_tE = -\mu\epsilon\omega^2E$: equal when $\beta^2 = \omega^2\mu\epsilon$. Physically, $\tfrac12\cos(\omega t - \beta z) + \tfrac12\cos(\omega t + \beta z)$.`),
      R(md`
        ### The method

        !!method Reading a sinusoidal plane wave
          1. **Argument.** Write it as $\omega t \mp \beta u + \phi$, with $u$ the position coordinate. Read $\omega$, $\beta$, $\phi$.
          2. **Direction:** opposite signs on $t$ and $u$ mean travel toward $+\hat u$; equal signs, toward $-\hat u$.
          3. **Numbers:** $f = \omega/2\pi$, $T = 1/f$, $\lambda = 2\pi/\beta$, $v_p = \omega/\beta = \lambda f$. Compare with $v_p = c/\sqrt{\mu_r\epsilon_r}$ to identify the medium.
          4. **Impedance:** $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$, and the other amplitude: $H_0 = E_0/\eta$.
          5. **The other field's direction:** $\mathbf H = \tfrac1\eta\hat k\times\mathbf E$ or $\mathbf E = \eta\mathbf H\times\hat k$; check $\mathbf E\times\mathbf H\parallel\hat k$.
          6. **Phase questions:** $\Delta\Phi = \omega\Delta t$ at a fixed place, $\beta\Delta z$ at a fixed time.

        ### Worked example

        !!graded Problem
          A current sheet on $z = 0$, embedded in a lossless dielectric with $\epsilon_r = 2.25$, $\mu_r = 1$, carries $\mathbf J_s = -0.2\cos(2\pi\times10^8t + \pi/3)\,\hat x$ A/m. Find (a) $f$, $v_p$, $\lambda$, $\beta$ and $\eta$; (b) $\mathbf E$ and $\mathbf H$ on both sides; (c) $E_x$ and $H_y$ at $z = -1.5$ m, $t = 0$; (d) the shortest distance between two points on the same side whose $E_x$ are always opposite.

        **1. Read the source.** $\omega = 2\pi\times10^8$ rad/s, so $f = 100$ MHz. $J_0 = 0.2$ A/m, $\phi = \pi/3$.

        **2. Medium.** $v_p = c/\sqrt{2.25} = 2\times10^8$ m/s; $\lambda = v_p/f = 2$ m; $\beta = 2\pi/\lambda = \pi$ rad/m; $\eta = 120\pi/1.5 = 80\pi = 251\ \Omega$.

        **3. Fields.** $E_0 = \tfrac\eta2J_0 = (40\pi\ \Omega)(0.2\ \text{A/m}) = 8\pi = 25.1$ V/m; $H_0 = J_0/2 = 0.1$ A/m:
        $$E_x = 25.1\cos(2\pi\times10^8t \mp \pi z + \pi/3)\ \text{V/m} \qquad H_y = \pm0.1\cos(2\pi\times10^8t \mp \pi z + \pi/3)\ \text{A/m} \qquad (z \gtrless 0)$$

        **4. The point.** On $z < 0$ the phase is $\omega t + \beta z + \phi = 0 - 1.5\pi + \pi/3 = -7\pi/6$, and $\cos(-7\pi/6) = -0.866$:
        $$E_x = (25.1)(-0.866) = -21.8\ \text{V/m} \qquad H_y = -(0.1)(-0.866) = +0.0866\ \text{A/m}$$

        **5. Antiphase.** A phase difference of $\pi$ is half a wavelength: $\lambda/2 = 1$ m.

        **Check.** $v_p = \lambda f = (2\ \text{m})(10^8\ \text{s}^{-1}) = 2\times10^8$ m/s ✓. $E_0/H_0 = 251\ \Omega = \eta$ ✓. At the point, $\mathbf E\times\mathbf H = (-21.8\hat x)\times(0.0866\hat y)$ points along $-\hat z$, away from the sheet ✓.

        !!mistake Common mistakes
          - Reading the direction backward: $\omega t - \beta z$ travels toward $+z$.
          - $\lambda = 2\pi/\beta$, not $1/\beta$ or $\beta$; $f = \omega/2\pi$, not $\omega$.
          - Changing $f$ in a medium. The frequency is fixed by the source; $\lambda$ and $\beta$ change.
          - $\eta = \eta_0/\sqrt{\epsilon_r}$ (for $\mu_r = 1$), not $\eta_0/\epsilon_r$.
          - Taking the field's unit vector for the direction of travel.
          - Dropping the ½ for a sheet: $E_0 = \eta J_0/2$.
          - Mixing degrees and radians in a phase.

        ### Check questions
      `),
      Q(md`A wave propagates in free space. An instrument observes the phase of the wave change by $3\pi$ radians in a 10 µs interval. The wavelength is approximately…`,
        ['2000 m', '0.1 m', '0.5 m', '2 m', '5 m', 'none of these'], 0,
        [null, 'That needs $f = 3$ GHz: the phase would change by $6\\times10^4\\pi$ rad in 10 µs.', 'That needs $f = 600$ MHz: $1.2\\times10^4\\pi$ rad in 10 µs.', 'That is what 10 ns (not 10 µs) would give.', 'That needs $f = 60$ MHz: $1200\\pi$ rad in 10 µs.', 'That is what dropping the $\\pi$ gives: 3 rad in 10 µs means $\\lambda = 2\\pi c\\,\\Delta t/3 = 6283$ m, which is not listed. With $3\\pi$ rad the answer is exactly 2000 m.'],
        md`$\omega = 3\pi/(10^{-5}\ \text{s}) = 3\pi\times10^5$ rad/s, $f = \omega/2\pi = 1.5\times10^5$ Hz, $\lambda = c/f = (3\times10^8)/(1.5\times10^5) = 2000$ m: (e). Check: 1.5 cycles in 10 µs.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`The velocities of $f = (0.05y - t)^2$, $g = u(t + 0.02x)$ and $h = \cos(2\pi\times10^8t - 2\pi z)$ are…`,
        ['$20\\hat y$, $-50\\hat x$, $10^8\\hat z$ m/s', '$0.05\\hat y$, $-0.02\\hat x$, $10^8\\hat z$ m/s', '$20\\hat y$, $50\\hat x$, $10^8\\hat z$ m/s', '$20\\hat y$, $-50\\hat x$, $-10^8\\hat z$ m/s'], 0,
        [null, 'The coefficient of position is $1/v_p$, not $v_p$: $(0.05y - t)^2 = (t - y/20)^2$.', '$t + 0.02x = t + x/50$: equal signs, so toward $-x$.', '$\\omega t - \\beta z$ travels toward $+z$.'],
        md`Rewrite each as a function of $t \mp u/v$: $(t - y/20)^2$ goes $+\hat y$ at 20 m/s; $u(t + x/50)$ goes $-\hat x$ at 50 m/s; $\cos(2\pi\times10^8(t - z/10^8))$ goes $+\hat z$ at $10^8$ m/s. (Lecture 18's challenge, answer c.)`),
      Q(md`HW 7 #4(b): $\mathbf H = \cos(\omega t + \beta y)\,\hat x$ A/m in a lossless dielectric with $\epsilon = 2.25\epsilon_0$ and $\omega/\beta = \tfrac23c$. Then $\mathbf E$ is…`,
        ['$-80\\pi\\cos(\\omega t + \\beta y)\\,\\hat z$ V/m', '$+80\\pi\\cos(\\omega t + \\beta y)\\,\\hat z$ V/m', '$-120\\pi\\cos(\\omega t + \\beta y)\\,\\hat z$ V/m', '$-80\\pi\\cos(\\omega t + \\beta y)\\,\\hat y$ V/m'], 0,
        [null, 'That travels toward $+y$; equal signs mean $-y$. $\\mathbf E = \\eta\\mathbf H\\times\\hat k = \\eta\\,\\hat x\\times(-\\hat y)$.', 'That is $\\eta_0$; here $\\eta = \\eta_0/\\sqrt{2.25}$.', '$\\mathbf E$ is perpendicular to the travel direction $\\hat y$.'],
        md`$\eta = 120\pi/1.5 = 80\pi\ \Omega$; $\hat k = -\hat y$; $\mathbf E = \eta\,\mathbf H\times\hat k = 80\pi\cos(\ldots)\,\hat x\times(-\hat y) = -80\pi\cos(\omega t + \beta y)\,\hat z$ V/m. Ampère gives the same: $\nabla\times\mathbf H = \beta\sin(\omega t + \beta y)\,\hat z = \epsilon\,\partial\mathbf E/\partial t$.`),
      Q(md`In a single traveling uniform plane wave, $\mathbf E$ and $\mathbf H$ at a given point…`,
        ['peak at the same instant (in phase)', 'are 90° out of phase', 'are 180° out of phase', 'have a phase difference that depends on the medium'], 0,
        [null, 'That happens in a standing wave, not a single traveling wave.', 'They are related by $\\mathbf H = \\tfrac1\\eta\\hat k\\times\\mathbf E$ at every instant: a fixed direction, no time shift.', 'In a lossless medium $\\eta$ is real: no phase shift. (Lossy media come later.)'],
        md`$\mathbf H = \tfrac1\eta\hat k\times\mathbf E$ instant by instant: the same argument $\omega t - \beta z + \phi$.`),
      Q(md`A wave passes from air into glass. Which quantity stays the same?`,
        ['the frequency', 'the wavelength', 'the phase velocity', 'the intrinsic impedance'], 0,
        [null, '$\\lambda = v_p/f$ shrinks because $v_p$ drops.', '$v_p = c/\\sqrt{\\mu_r\\epsilon_r}$ drops.', '$\\eta = \\eta_0\\sqrt{\\mu_r/\\epsilon_r}$ drops.'],
        md`The field at the boundary oscillates at the source frequency, and so does everything it drives.`),
      Q(md`Two points lie a quarter wavelength apart along the direction of travel. At any instant, the field at the farther point…`,
        ['lags the nearer one by 90°', 'leads the nearer one by 90°', 'is in antiphase with it', 'has the same phase'], 0,
        [null, 'The farther point shows what passed the nearer point a quarter period ago: it lags.', 'Antiphase is half a wavelength.', 'Same phase needs a whole wavelength.'],
        md`$\Delta\Phi = -\beta\,\Delta z = -\tfrac{2\pi}{\lambda}\cdot\tfrac\lambda4 = -\tfrac\pi2$.`),
      Q(md`A Wi-Fi signal at 2.4 GHz travels in free space. Its wavelength is…`,
        ['12.5 cm', '1.25 m', '8 m', '2 cm'], 0,
        [null, 'Off by ten: $3\\times10^8/2.4\\times10^9 = 0.125$ m.', 'That is $f/c = 8\\ \\text{m}^{-1}$, upside down.', 'That is $c/(2\\pi f)$; there is no $2\\pi$ in $\\lambda = c/f$.'],
        md`$\lambda = c/f = (3\times10^8)/(2.4\times10^9) = 0.125$ m.`),
      Q(md`HW 7 #5(b): is $\mathbf E = \cos^2(\omega t - \beta x)\,\hat y$ a solution of the wave equation?`,
        ['Yes, if $\\beta = \\omega\\sqrt{\\mu\\epsilon}$: any shape of $(\\omega t - \\beta x)$ travels', 'No: only sines and cosines solve it', 'No: $\\cos^2$ is never negative, so it cannot be a wave', 'Yes, for any $\\omega$ and $\\beta$'], 0,
        [null, 'The wave equation accepts any twice-differentiable $f(\\omega t - \\beta x)$.', 'A wave need not change sign; $\\cos^2 = \\tfrac12 + \\tfrac12\\cos(2\\omega t - 2\\beta x)$ is a constant plus a cosine.', 'Plugging in gives $\\beta^2f\'\' = \\mu\\epsilon\\omega^2f\'\'$, so $\\omega/\\beta$ must equal $1/\\sqrt{\\mu\\epsilon}$.'],
        md`$\partial^2_xE = \beta^2f''$, $\partial^2_tE = \omega^2f''$ with $f = \cos^2$: the equation holds when $\beta^2 = \mu\epsilon\omega^2$. It travels toward $+x$ at $\omega/\beta$ without changing shape.`),
      R(md`
        ### Rapid fire: reading a wave

        **The trick:** $\omega$ with $t$, $\beta$ with position; opposite signs travel toward $+$; $\lambda = 2\pi/\beta$, $f = \omega/2\pi$, $v_p = \omega/\beta$.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t16_read', { need: 8 }), { id: 't16-sinusoids.r0' }),
      R(md`
        ### Rapid fire: media and phase

        **The trick:** $f$ fixed; $v_p$ and $\lambda$ divide by $\sqrt{\mu_r\epsilon_r}$; $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$; $\Delta\Phi = \omega\Delta t$ or $\beta\Delta z$.
      `),
      Object.assign(G('rf_t16_medium', { need: 8 }), { id: 't16-sinusoids.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t16_sheet', { need: 2 }),
      G('t16_read', { need: 2 }),
      G('t16_phase', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  GENS.rf_t16_read = () => one([
    // direction of travel
    () => {
      const W = mkWave(), k = uv(W.u, W.s), pol = uv(W.pol);
      return MC('Which way?', md`$\mathbf E = E_0\cos(${W.arg})\,\hat ${AX[W.pol]}$. The wave travels toward…`, opt(k),
        [[opt(neg(k)), W.s > 0 ? 'Opposite signs on $t$ and the position mean travel toward $+$.' : 'Equal signs on $t$ and the position mean travel toward $-$.'], [opt(pol), 'That is the field direction, not the travel direction.'], [opt(neg(pol)), 'The unit vector in front is the field direction; travel is read from the argument.']],
        md`Hold the phase fixed: ${W.s > 0 ? `$${AX[W.u]}$ must grow as $t$ grows` : `$${AX[W.u]}$ must shrink as $t$ grows`}, so the wave moves toward $${vt(k)}$.`);
    },
    // wavelength from β
    () => {
      const W = mkWave(), o = (x) => `$${p(+x.toPrecision(3))}$ m`;
      return MC('Wavelength', md`$\mathbf E = E_0\cos(${W.arg})\,\hat ${AX[W.pol]}$ V/m. $\lambda = $`, o(W.lam),
        [[o(1 / W.b), 'That is $1/\\beta$; $\\lambda = 2\\pi/\\beta$.'], [o(W.b), '$\\beta$ is in rad/m; invert it and multiply by $2\\pi$.'], [o(W.lam / 2), 'One full cycle is $2\\pi$ rad: $\\lambda = 2\\pi/\\beta$.'], [o(CC / W.fr), W.er === 1 ? 'Recheck: $2\\pi/\\beta$.' : 'That is $c/f$, the free-space wavelength; this wave is slower.']],
        md`$\lambda = 2\pi/\beta = 2\pi/(${tpi(W.b)}) = ${p(+W.lam.toPrecision(3))}$ m.`);
    },
    // frequency from ω
    () => {
      const W = mkWave(), o = (x) => fmtF(x);
      return MC('Frequency', md`$\mathbf H = H_0\cos(${W.arg})\,\hat ${AX[W.pol]}$ A/m. $f = $`, o(W.fr),
        [[o(W.w), 'That is $\\omega$ in rad/s; divide by $2\\pi$.'], [o(2 * W.fr), 'That is $\\omega/\\pi$.'], [o(W.fr / Math.PI), 'Divide $\\omega$ by $2\\pi$, not by $2\\pi^2$.']],
        md`$f = \omega/2\pi = (${tpi(W.w)})/2\pi$ = ${fmtF(W.fr)}.`);
    },
    // phase velocity and the medium
    () => {
      const W = mkWave(), o = (x) => `$${p(+x.toPrecision(3))}$`;
      return MC('Medium', md`$\mathbf E = E_0\cos(${W.arg})\,\hat ${AX[W.pol]}$ V/m in a nonmagnetic medium ($\mu_r = 1$). $\epsilon_r = $`, o(W.er),
        [[o(Math.sqrt(W.er) === 1 ? 2 : Math.sqrt(W.er)), Math.sqrt(W.er) === 1 ? '$v_p = \\omega/\\beta = c$ here.' : 'That is $c/v_p$; $\\epsilon_r = (c/v_p)^2$.'], [o(W.er === 1 ? 4 : 1), W.er === 1 ? '$v_p = \\omega/\\beta = c$ here: free space.' : '$v_p = \\omega/\\beta$ is less than $c$, so this is not free space.'], [o(1 / W.er === 1 ? 0.5 : 1 / W.er), '$\\epsilon_r \\ge 1$: a medium slows the wave.'], [o(W.er * W.er), 'One square too many: $\\epsilon_r = (c/v_p)^2$.']],
        md`$v_p = \omega/\beta = ${tpi(W.w)}/${tpi(W.b)} = ${p(+W.v.toPrecision(3))}$ m/s, so $\epsilon_r = (c/v_p)^2 = ${p(W.er)}$.`);
    },
    // period
    () => {
      const W = mkWave(), o = (x) => `$${p(+(x * 1e9).toPrecision(3))}$ ns`;
      return MC('Period', md`$\mathbf E = E_0\cos(${W.arg})\,\hat ${AX[W.pol]}$. The period $T$ is…`, o(1 / W.fr),
        [[o(1 / W.w), 'That is $1/\\omega$; $T = 2\\pi/\\omega$.'], [o(2 / W.fr), 'One cycle is $2\\pi$ of phase, not $4\\pi$.'], [o(0.5 / W.fr), 'One cycle is $2\\pi$ of phase, not $\\pi$.']],
        md`$T = 2\pi/\omega = 1/f$ with $f$ = ${fmtF(W.fr)}.`);
    },
  ]);

  GENS.rf_t16_medium = () => one([
    // wavelength in a medium
    () => {
      const fr = pick([1e8, 3e8, 1.5e8, 6e8]), er = pick([4, 9, 2.25, 16]), lam0 = CC / fr, lam = lam0 / Math.sqrt(er);
      const o = (x) => `$${p(+x.toPrecision(3))}$ m`;
      return MC('Wavelength in a medium', md`A ${fmtF(fr)} wave travels in a lossless dielectric with $\epsilon_r = ${er}$, $\mu_r = 1$. $\lambda = $`, o(lam),
        [[o(lam0), 'That is the free-space wavelength.'], [o(lam0 / er), '$v_p = c/\\sqrt{\\epsilon_r}$: a square root.'], [o(lam0 * Math.sqrt(er)), 'A slower wave has a shorter wavelength.']],
        md`$\lambda = \dfrac{c}{f\sqrt{\epsilon_r}} = \dfrac{${p(+lam0.toPrecision(3))}\ \text{m}}{${p(Math.sqrt(er))}} = ${p(+lam.toPrecision(3))}$ m.`);
    },
    // impedance
    () => {
      const mr = pick([1, 1, 1, 4]), er = pick(mr === 1 ? [4, 9, 2.25, 16] : [9, 2.25, 16]), eta = ETA0 * Math.sqrt(mr / er);
      const o = (x) => `$${p(+x.toPrecision(3))}$ Ω`;
      return MC('Impedance', md`A lossless medium has $\epsilon_r = ${er}$, $\mu_r = ${mr}$. $\eta = $`, o(eta),
        [[o(ETA0 * mr / er), 'That drops the square root: $\\eta = \\eta_0\\sqrt{\\mu_r/\\epsilon_r}$.'], [o(ETA0 * Math.sqrt(er / mr)), 'Upside down: more permittivity means lower impedance.'], [o(ETA0), 'The medium changes $\\eta$.']],
        md`$\eta = \eta_0\sqrt{\mu_r/\epsilon_r} = 377\sqrt{${mr}/${er}} = ${p(+eta.toPrecision(3))}\ \Omega$.`);
    },
    // what stays fixed
    () => MC('What changes', 'A sinusoidal wave enters a lossless dielectric from air. Which stays the same?', 'its frequency',
      [['its wavelength', '$\\lambda = v_p/f$ shrinks.'], ['its speed', '$v_p = c/\\sqrt{\\mu_r\\epsilon_r}$ drops.'], ['its phase constant $\\beta$', '$\\beta = \\omega/v_p$ grows.'], ['its impedance', '$\\eta = \\eta_0\\sqrt{\\mu_r/\\epsilon_r}$ changes.']],
      'Every point oscillates at the driving frequency; only the spatial pattern changes.'),
    // H amplitude from E amplitude
    () => {
      const er = pick([1, 4, 9]), E0 = pick([1, 10, 30, 377, 120]), eta = ETA0 / Math.sqrt(er), H0 = E0 / eta;
      const o = (x) => `$${p(+(x * 1e3).toPrecision(3))}$ mA/m`;
      return MC('H amplitude', md`A plane wave in ${er === 1 ? 'free space' : `a dielectric with $\\epsilon_r = ${er}$, $\\mu_r = 1$`} has $E_0 = ${E0}$ V/m. $H_0 = $`, o(H0),
        [[o(E0 / ETA0 * (er === 1 ? 2 : 1)), er === 1 ? 'One factor of 2 too many.' : 'That uses $\\eta_0$; in the medium $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$.'], [o(E0 * eta / 1e6), 'Divide by $\\eta$; do not multiply.'], [o(H0 / 2), 'No ½ here: that belongs to a sheet\'s $E_0 = \\eta J_0/2$.']],
        md`$H_0 = E_0/\eta$ with $\eta = ${er === 1 ? '377' : `377/${p(Math.sqrt(er))}`}\ \Omega$: $${p(+(H0 * 1e3).toPrecision(3))}$ mA/m.`);
    },
    // phase change in time at a point
    () => {
      const k = pick([1, 2, 3, 4]), dt = pick([1, 2, 5, 10]), unit = pick(['ns', 'µs']), sc = unit === 'ns' ? 1e-9 : 1e-6;
      const fr = k / 2 / (dt * sc), lam = CC / fr;
      const o = (x) => `$${p(+x.toPrecision(3))}$ m`;
      return MC('Phase in time', md`At a fixed point, a free-space wave's phase advances by $${k === 1 ? '' : k}\pi$ in $${dt}$ ${unit}. $\lambda = $`, o(lam),
        [[o(lam / 2), `$${k === 1 ? '' : k}\\pi$ is $${p(k / 2)}$ cycle${k === 2 ? '' : 's'}, not $${k}$.`], [o(CC * dt * sc), 'That is $c\\,\\Delta t$; it equals $\\lambda$ only for a phase change of $2\\pi$.'], [o(lam * 1000), 'Recheck the time unit.'], [o(CC / (k * Math.PI / (dt * sc))), 'That is $c/\\omega$: divide $\\omega$ by $2\\pi$ first.']],
        md`$f = \Delta\Phi/(2\pi\Delta t) = ${p(k / 2)}/(${dt}\ ${unit === 'ns' ? '\\text{ns}' : '\\mu\\text{s}'})$, $\lambda = c/f = ${p(+lam.toPrecision(3))}$ m.`);
    },
    // phase difference in space
    () => {
      const [q, qT] = pick([[0.25, '\\tfrac\\pi2'], [0.5, '\\pi'], [0.125, '\\tfrac\\pi4'], [0.375, '\\tfrac{3\\pi}{4}'], [1 / 3, '\\tfrac{2\\pi}{3}']]);
      const lam = pick([0.5, 2, 4, 6]), dz = q * lam, deg = (x) => `${+x.toPrecision(3)}°`;
      return MC('Phase in space', md`At one instant, two points $${p(+dz.toPrecision(3))}$ m apart along the direction of travel of a wave with $\lambda = ${lam}$ m differ in phase by…`, deg(360 * q),
        [[deg(180 * q), 'One wavelength is 360°, not 180°.'], [deg(360 * dz), 'Divide the distance by $\\lambda$ before multiplying by 360°.'], [deg(90 * q), 'One wavelength is 360°, not 90°.'], [deg(360 * q / lam), 'That divides by $\\lambda$ twice.']],
        md`$\Delta\Phi = \beta\Delta z = 2\pi\,\Delta z/\lambda = ${qT}$ rad $= ${deg(360 * q).replace('°', '^\\circ')}$; the farther point lags.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  const PHI = [[0, '0'], [Math.PI / 6, '\\pi/6'], [Math.PI / 4, '\\pi/4'], [Math.PI / 3, '\\pi/3'], [Math.PI / 2, '\\pi/2'], [-Math.PI / 3, '-\\pi/3']];
  GENS.t16_sheet = () => {
    const fr = pick([1e8, 1.5e8, 3e8]), er = pick([1, 2.25, 4, 9]), J0 = pick([0.1, 0.2, 0.4, 1, 2]), [ph, phT] = pick(PHI);
    const v = CC / Math.sqrt(er), lam = v / fr, b = 2 * Math.PI / lam, eta = ETA0 / Math.sqrt(er), T = 1 / fr, w = 2 * Math.PI * fr;
    let z, t, arg;
    do {
      z = pick([1, -1]) * pick([1, 3, 5, 6, 7]) * lam / 8;
      t = pick([0, 1, 2, 3]) * T / 8;
      arg = w * t - b * Math.abs(z) + ph;
    } while (Math.abs(Math.cos(arg)) < 0.3);
    const E0 = eta * J0 / 2, Ex = E0 * Math.cos(arg), Hy = Math.sign(z) * J0 / 2 * Math.cos(arg);
    const zs = p(+z.toPrecision(4)), ts = p(+(t * 1e9).toPrecision(4));
    return {
      title: 'A sinusoidal current sheet',
      q: md`A sheet on $z = 0$ in ${er === 1 ? 'free space' : `a lossless dielectric with $\\epsilon_r = ${er}$, $\\mu_r = 1$`} carries $\mathbf J_s = -${J0 === 1 ? '' : J0}\cos(${tpi(w)}t${ph === 0 ? '' : ph > 0 ? ` + ${phT}` : ` - ${phT.slice(1)}`})\,\hat x$ A/m. Find $\lambda$, $\eta$, the amplitude of $E_x$, and $E_x$ and $H_y$ at $z = ${zs}$ m, $t = ${ts}$ ns.`,
      parts: [N('\\lambda', lam, 'm'), N('\\eta', eta, 'Ω'), N('E_0', E0, 'V/m'), N(`E_x(${zs}\\ \\text{m}, ${ts}\\ \\text{ns})`, Ex, 'V/m'), N(`H_y(${zs}\\ \\text{m}, ${ts}\\ \\text{ns})`, Hy, 'A/m')],
      hints: [`$f$ = ${fmtF(fr)}, $v_p = c/\\sqrt{\\epsilon_r}$, $\\lambda = v_p/f$, $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$.`, '$E_x = \\tfrac{\\eta J_0}{2}\\cos(\\omega t - \\beta|z| + \\phi)$ on both sides; $H_y = \\pm\\tfrac{J_0}{2}\\cos(\\ldots)$ for $z \\gtrless 0$.'],
      sol: sol({
        eq: md`$E_x = \tfrac{\eta J_0}{2}\cos(\omega t \mp \beta z + \phi)$, $H_y = \pm\tfrac{J_0}{2}\cos(\omega t \mp \beta z + \phi)$ for $z \gtrless 0$; $v_p = c/\sqrt{\epsilon_r}$, $\eta = \eta_0/\sqrt{\epsilon_r}$.`,
        sym: md`$\lambda = v_p/f$, $\beta = 2\pi/\lambda$, $E_0 = \eta J_0/2$; at the point the phase is $\Phi = \omega t - \beta|z| + \phi$.`,
        sub: md`$v_p = ${p(+v.toPrecision(4))}$ m/s, $\lambda = ${f(lam)}$ m, $\beta = ${f(b)}$ rad/m, $\eta = ${f(eta)}\ \Omega$, $E_0 = (${f(eta)})(${J0})/2 = ${f(E0)}$ V/m. $\Phi = (${f(w)})(${p(t)}) - (${f(b)})(${p(+Math.abs(z).toPrecision(4))}) + ${phT} = ${f(arg)}$ rad, $\cos\Phi = ${f(Math.cos(arg))}$:
$$E_x = ${f(Ex)}\ \text{V/m} \qquad H_y = ${z > 0 ? '+' : '-'}\tfrac{${J0}}{2}(${f(Math.cos(arg))}) = ${f(Hy)}\ \text{A/m}$$`,
        ans: md`$\lambda = ${f(lam)}$ m, $\eta = ${f(eta)}\ \Omega$, $E_0 = ${f(E0)}$ V/m, $E_x = ${f(Ex)}$ V/m, $H_y = ${f(Hy)}$ A/m.`,
        check: md`$|E_x/H_y| = ${f(Math.abs(Ex / Hy))}\ \Omega = \eta$ ✓; on $z ${z > 0 ? '>' : '<'} 0$, $\mathbf E\times\mathbf H$ has the sign of $E_xH_y$ along $\hat z$: ${z > 0 ? '$+\\hat z$' : '$-\\hat z$'}, away from the sheet ✓.`,
      }),
    };
  };

  GENS.t16_read = () => {
    const W = mkWave(), H0 = pick([0.1, 0.5, 1, 2]);
    const k = uv(W.u, W.s), Hd = uv(W.pol), Ed = cross(Hd, k), E0 = W.eta * H0;
    const other = [0, 1, 2].find((i) => i !== W.u && i !== W.pol);
    const mcE = [`$+\\hat ${AX[other]}$`, `$-\\hat ${AX[other]}$`, `$+\\hat ${AX[W.pol]}$`, `$+\\hat ${AX[W.u]}$`];
    const aE = Ed[other] > 0 ? 0 : 1;
    return {
      title: 'Read the wave, find E',
      q: md`In a lossless nonmagnetic medium ($\mu_r = 1$), $\mathbf H = ${H0 === 1 ? '' : H0}\cos(${W.arg})\,\hat ${AX[W.pol]}$ A/m. Find $f$, $\lambda$, $v_p$, $\epsilon_r$, the amplitude of $\mathbf E$, and its direction at an instant when the cosine is positive.`,
      parts: [
        N('f', W.fr / 1e6, 'MHz'), N('\\lambda', W.lam, 'm'), N('v_p', W.v, 'm/s'), N('\\epsilon_r', W.er, ''), N('E_0', E0, 'V/m'),
        { lbl: '$\\mathbf E$ then points along', mc: mcE, a: aE, fixed: true, why: [aE === 0 ? null : 'Reversed: $\\mathbf E = \\eta\\,\\mathbf H\\times\\hat k$.', aE === 1 ? null : 'Reversed: $\\mathbf E = \\eta\\,\\mathbf H\\times\\hat k$.', '$\\mathbf E$ is perpendicular to $\\mathbf H$.', '$\\mathbf E$ is perpendicular to the direction of travel.'] },
      ],
      hints: ['$f = \\omega/2\\pi$, $\\lambda = 2\\pi/\\beta$, $v_p = \\omega/\\beta$, $\\epsilon_r = (c/v_p)^2$.', `The wave travels toward $${vt(k)}$; $\\mathbf E = \\eta\\,\\mathbf H\\times\\hat k$ with $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$.`],
      sol: sol({
        eq: md`$f = \omega/2\pi$, $\lambda = 2\pi/\beta$, $v_p = \omega/\beta = c/\sqrt{\epsilon_r}$, $\eta = \eta_0/\sqrt{\epsilon_r}$, $\mathbf E = \eta\,\mathbf H\times\hat k$.`,
        sym: md`$\omega = ${tpi(W.w)}$ rad/s, $\beta = ${tpi(W.b)}$ rad/m, ${W.s > 0 ? 'opposite' : 'equal'} signs: $\hat k = ${vt(k)}$.`,
        sub: md`$f = ${p(W.fr / 1e6)}$ MHz, $\lambda = 2\pi/(${tpi(W.b)}) = ${f(W.lam)}$ m, $v_p = ${p(+W.v.toPrecision(4))}$ m/s, $\epsilon_r = (3\times10^8/${p(+W.v.toPrecision(4))})^2 = ${p(W.er)}$, $\eta = ${f(W.eta)}\ \Omega$, $E_0 = \eta H_0 = ${f(E0)}$ V/m. Direction: $(${vt(Hd)})\times(${vt(k)}) = ${vt(Ed)}$.`,
        ans: md`$f = ${p(W.fr / 1e6)}$ MHz, $\lambda = ${f(W.lam)}$ m, $v_p = ${p(+W.v.toPrecision(4))}$ m/s, $\epsilon_r = ${p(W.er)}$, $\mathbf E = ${f(E0)}\cos(${W.arg})\,(${vt(Ed)})$ V/m.`,
        check: md`$\mathbf E\times\mathbf H \propto (${vt(Ed)})\times(${vt(Hd)}) = ${vt(cross(Ed, Hd))} = \hat k$ ✓; $v_p = \lambda f$ ✓.`,
      }),
    };
  };

  GENS.t16_phase = () => {
    const k = pick([0.5, 1, 1.5, 2, 3]), dt = pick([1, 2, 4, 5, 10]), unit = pick(['ns', 'µs']), sc = unit === 'ns' ? 1e-9 : 1e-6, er = pick([1, 4, 9]);
    const fr = k / 2 / (dt * sc), v = CC / Math.sqrt(er), lam = v / fr, q = pick([0.125, 0.25, 0.375, 0.75]), dz = +(q * lam).toPrecision(3);
    const dphi = 2 * Math.PI * dz / lam;
    const kT = k === 1 ? '\\pi' : k === 0.5 ? '\\pi/2' : `${k}\\pi`;
    const fu = unit === 'ns' ? 1e6 : 1e3, fuT = unit === 'ns' ? 'MHz' : 'kHz';
    return {
      title: 'Phase in time and in space',
      q: md`A sinusoidal plane wave travels in ${er === 1 ? 'free space' : `a lossless dielectric with $\\epsilon_r = ${er}$, $\\mu_r = 1$`}. At a fixed point its phase advances by $${kT}$ rad in $${dt}$ ${unit}. Find $f$, $\lambda$, and the phase difference between two points $${p(dz)}$ m apart along the direction of travel at the same instant.`,
      parts: [N('f', fr / fu, fuT), N('\\lambda', lam, 'm'), N('|\\Delta\\Phi|', dphi, 'rad'),
        { lbl: 'At that instant the point farther along the direction of travel', mc: ['lags', 'leads'], a: 0, fixed: true, why: [null, 'It shows what passed the nearer point earlier: it lags.'] }],
      hints: ['$\\omega = \\Delta\\Phi/\\Delta t$ at a fixed point, then $f = \\omega/2\\pi$.', `$v_p = c/\\sqrt{\\epsilon_r}$, $\\lambda = v_p/f$, and $\\Delta\\Phi = 2\\pi\\,\\Delta z/\\lambda$.`],
      sol: sol({
        eq: md`$\omega = \Delta\Phi/\Delta t$, $f = \omega/2\pi$, $\lambda = v_p/f$ with $v_p = c/\sqrt{\epsilon_r}$, $|\Delta\Phi| = \beta\,\Delta z = 2\pi\Delta z/\lambda$.`,
        sym: md`$f = \dfrac{\Delta\Phi}{2\pi\,\Delta t}$, $\lambda = \dfrac{2\pi c\,\Delta t}{\Delta\Phi\sqrt{\epsilon_r}}$.`,
        sub: md`$f = \dfrac{${kT}}{2\pi(${dt}\times10^{${unit === 'ns' ? -9 : -6}}\ \text{s})} = ${f(fr)}$ Hz; $v_p = ${p(+v.toPrecision(4))}$ m/s; $\lambda = ${f(lam)}$ m; $|\Delta\Phi| = 2\pi(${p(dz)})/${f(lam)} = ${f(dphi)}$ rad.`,
        ans: md`$f = ${f(fr / fu)}$ ${fuT}, $\lambda = ${f(lam)}$ m, $|\Delta\Phi| = ${f(dphi)}$ rad; the farther point lags.`,
        check: md`$\Delta z/\lambda = ${f(dz / lam)}$ of a wavelength, so $${f(dz / lam)}\times2\pi$ rad ✓.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t16-sinusoids'] = [
    Q(md`$\mathbf E = 3\cos(10^6t - 0.01z)\,\hat y$ V/m. Its phase velocity is…`,
      ['$10^8$ m/s', '$10^4$ m/s', '$3\\times10^8$ m/s', '$1.6\\times10^7$ m/s'], 0,
      [null, 'That is $\\omega\\beta$; $v_p = \\omega/\\beta$.', 'Do not assume free space: compute $\\omega/\\beta$.', 'That divides by $2\\pi$; $v_p = \\omega/\\beta$ uses $\\omega$ itself.'],
      md`$v_p = \omega/\beta = 10^6/0.01 = 10^8$ m/s $= c/3$.`),
    Q(md`For $\cos(\omega t - \beta z)$, a crest at $z = 0$ at $t = 0$ is at $z = \lambda$ when…`,
      ['$t = T$', '$t = T/2$', '$t = 2\\pi T$', '$t = \\lambda/c$ regardless of medium'], 0,
      [null, 'Half a period moves the crest half a wavelength.', 'One period moves it one wavelength.', 'It moves at $v_p$, which is $c$ only in free space.'],
      md`$v_p = \lambda/T$: one wavelength per period.`),
    Q(md`$\beta$ has units of…`,
      ['rad/m', 'rad/s', 'm', 'm/s'], 0,
      [null, 'That is $\\omega$.', 'That is $\\lambda$.', 'That is $v_p$.'],
      md`$\beta z$ must be an angle, so $\beta$ is radians per meter.`),
    Q(md`Which expression travels toward $-y$?`,
      ['$\\cos(\\omega t + \\beta y)$', '$\\cos(\\omega t - \\beta y)$', '$\\cos(\\beta y - \\omega t)$', '$\\sin(\\omega t - \\beta y)\\,(-\\hat y)$'], 0,
      [null, 'Opposite signs: toward $+y$.', '$\\cos$ is even: $\\cos(\\beta y - \\omega t) = \\cos(\\omega t - \\beta y)$, toward $+y$.', 'The $-\\hat y$ in front would be a field direction, and a plane wave\'s field cannot point along its travel anyway; the argument travels toward $+y$.'],
      md`Equal signs on $t$ and $y$: holding the phase fixed, $y$ decreases as $t$ grows.`),
    Q(md`Doubling the frequency of a wave in the same medium…`,
      ['halves $\\lambda$ and doubles $\\beta$', 'doubles $\\lambda$', 'doubles $v_p$', 'halves $\\eta$'], 0,
      [null, '$\\lambda = v_p/f$ shrinks as $f$ grows.', 'In a lossless medium $v_p = 1/\\sqrt{\\mu\\epsilon}$ does not depend on frequency.', '$\\eta = \\sqrt{\\mu/\\epsilon}$ does not depend on frequency.'],
      md`$v_p$ is fixed by the medium; $\lambda = v_p/f$ and $\beta = 2\pi f/v_p$.`),
    Q(md`A medium with $\mu_r = \epsilon_r = 4$ has…`,
      ['$v_p = c/4$ and $\\eta = \\eta_0$', '$v_p = c/2$ and $\\eta = \\eta_0$', '$v_p = c/4$ and $\\eta = \\eta_0/4$', '$v_p = c$ and $\\eta = \\eta_0$'], 0,
      [null, '$v_p = c/\\sqrt{\\mu_r\\epsilon_r} = c/\\sqrt{16}$.', '$\\eta = \\eta_0\\sqrt{\\mu_r/\\epsilon_r} = \\eta_0$ when they are equal.', 'The product $\\mu_r\\epsilon_r$ sets the speed, the ratio sets the impedance.'],
      md`$\sqrt{\mu_r\epsilon_r} = 4$, $\sqrt{\mu_r/\epsilon_r} = 1$.`),
    Q(md`$\mathbf E = E_0\cos(\omega t - \beta z + \pi/2)\,\hat x$ at $z = 0$, $t = 0$ is…`,
      ['$0$, and about to go negative', '$E_0$', '$0$, and about to go positive', '$-E_0$'], 0,
      [null, '$\\cos(\\pi/2) = 0$.', 'Its time derivative is $-\\omega E_0\\sin(\\pi/2) < 0$.', '$\\cos(\\pi/2) = 0$.'],
      md`$\cos(\omega t + \pi/2) = -\sin(\omega t)$: zero at $t = 0$, then negative.`),
    Q(md`The sheet $\mathbf J_s = -J_0\cos(\omega t)\hat x$ sits on $z = 0$. Compared with the sheet current's phase, $E_x$ at $z = +\lambda/2$…`,
      ['is in antiphase: $E_x$ there is negative when the sheet field is positive', 'is in phase: the sheet field is the same everywhere', 'leads by 90°', 'is zero at all times: $\\lambda/2$ is a node'], 0,
      [null, 'The amplitude is the same everywhere, but the phase lags by $\\beta|z|$.', 'It lags: the field there was emitted half a period ago.', 'A single traveling wave has no nodes; only standing waves do.'],
      md`$E_x = \tfrac{\eta J_0}{2}\cos(\omega t - \pi) = -\tfrac{\eta J_0}{2}\cos\omega t$.`),
    Q(md`For the same sheet, $E_x$ at $z = +d$ and at $z = -d$ are…`,
      ['always equal', 'always opposite', 'equal in amplitude but 90° apart', 'equal only at $t = 0$'], 0,
      [null, '$H_y$ is the odd one; $E_x$ is even.', 'Both points are the same distance from the source: same delay, same phase.', 'Both are $\\tfrac{\\eta J_0}{2}\\cos(\\omega t - \\beta d)$ at all times.'],
      md`$E_x = \tfrac{\eta J_0}{2}\cos(\omega t - \beta|z|)$: even in $z$.`),
    Q(md`$\mathbf E = 6\cos(\omega t - \beta x)\,\hat z$ V/m in free space. $\mathbf H$ is…`,
      ['$-15.9\\cos(\\omega t - \\beta x)\\,\\hat y$ mA/m', '$+15.9\\cos(\\omega t - \\beta x)\\,\\hat y$ mA/m', '$-15.9\\cos(\\omega t - \\beta x)\\,\\hat x$ mA/m', '$-2262\\cos(\\omega t - \\beta x)\\,\\hat y$ A/m'], 0,
      [null, '$\\hat x\\times\\hat z = -\\hat y$.', '$\\mathbf H$ is perpendicular to the travel direction $\\hat x$.', 'Divide by $\\eta_0$.'],
      md`$\mathbf H = \tfrac1{\eta_0}\hat x\times\mathbf E = \tfrac{6}{377}\cos(\ldots)(\hat x\times\hat z) = -15.9\cos(\ldots)\,\hat y$ mA/m. Check: $\hat z\times(-\hat y) = \hat x$ ✓.`),
    Q(md`$\cos(\omega t - 3x - 4y)\,\hat z$ is a valid wave in a medium with $\omega\sqrt{\mu\epsilon} = $…`,
      ['5 rad/m', '7 rad/m', '1 rad/m', '25 rad/m'], 0,
      [null, 'The components add in quadrature, not linearly.', 'That is $4 - 3$.', 'That is $\\beta^2$; $\\beta = 5$ rad/m.'],
      md`$\beta^2 = \beta_x^2 + \beta_y^2 = 9 + 16 = 25$, so $\beta = 5$ rad/m $= \omega\sqrt{\mu\epsilon}$. It travels along $(3, 4, 0)/5$.`),
    Q(md`A standing wave $\cos(\omega t)\cos(\beta z)$ has nodes (always zero) at…`,
      ['$z = \\lambda/4, 3\\lambda/4, \\ldots$: every half wavelength', 'every quarter wavelength', 'every wavelength', 'nowhere: a wave has no fixed zeros'], 0,
      [null, '$\\cos(\\beta z) = 0$ at $\\beta z = \\pi/2 + n\\pi$: spacing $\\lambda/2$.', 'Spacing $\\lambda/2$, not $\\lambda$.', 'A traveling wave has none; a standing wave does.'],
      md`$\cos(\beta z) = 0$ at $\beta z = \pi/2 + n\pi$, i.e. $z = \lambda/4 + n\lambda/2$.`),
    Q(md`$\cos^2(\omega t - \beta x)$ contains which frequencies?`,
      ['0 (a constant) and $2\\omega$', 'only $\\omega$', 'only $2\\omega$', '$\\omega$ and $2\\omega$'], 0,
      [null, '$\\cos^2 u = \\tfrac12 + \\tfrac12\\cos 2u$.', 'It also has a constant part, $\\tfrac12$.', 'No $\\omega$ term survives.'],
      md`$\cos^2u = \tfrac12 + \tfrac12\cos2u$: a constant plus a wave at $2\omega$, $2\beta$, same speed.`),
    Q(md`Lecture 20's $\mathbf H = H_0\cos(6\pi\times10^7t - 0.2\pi z)\hat y$ A/m. Its $\mathbf E$ is…`,
      ['$120\\pi H_0\\cos(6\\pi\\times10^7t - 0.2\\pi z)\\,\\hat x$', '$-120\\pi H_0\\cos(\\ldots)\\,\\hat x$', '$120\\pi H_0\\cos(\\ldots)\\,\\hat z$', '$H_0\\cos(\\ldots)/120\\pi\\,\\hat x$'], 0,
      [null, '$\\mathbf E = \\eta\\mathbf H\\times\\hat k = \\eta\\,\\hat y\\times\\hat z = +\\eta\\,\\hat x$.', 'The field is perpendicular to the travel direction $\\hat z$.', 'Multiply by $\\eta_0$.'],
      md`$v_p = 6\pi\times10^7/0.2\pi = 3\times10^8$: free space, $\eta_0 = 120\pi$; $\hat y\times\hat z = \hat x$.`),
    Q(md`A wave's phase at a fixed point changes by $\pi$ every 5 ns. Its period is…`,
      ['10 ns', '5 ns', '2.5 ns', '31.4 ns'], 0,
      [null, '$\\pi$ is half a cycle, so a full cycle takes twice as long.', 'That is a quarter period: a full cycle is $2\\pi$, twice the $\\pi$ that takes 5 ns.', 'No factor of $2\\pi$ in seconds: $T$ is the time for $2\\pi$ of phase.'],
      md`$2\pi$ of phase takes twice as long as $\pi$: $T = 10$ ns.`),
    Q(md`In free space, $\beta$ for a 1 GHz wave is about…`,
      ['21 rad/m', '3.3 rad/m', '0.3 rad/m', '$6.3\\times10^9$ rad/m'], 0,
      [null, 'That is $f/c$; $\\beta = 2\\pi f/c$ includes the $2\\pi$.', 'That is $\\lambda$ in meters.', 'That is $\\omega$ in rad/s.'],
      md`$\beta = \omega/c = 2\pi\times10^9/3\times10^8 = 20.9$ rad/m ($\lambda = 0.3$ m).`),
  ];
})();

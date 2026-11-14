/* Speed tricks for Exam 3 (unit e3-gymu, reached from #/speed). Three lessons:
     e3-speed      waves and media: reading a wave, phasors and power, lossy media, polarization, reflection
     e3-speed-tl   transmission lines: L C Z0 v, launching, bounces, steady state, stubs and lambda/4, Gamma(d) and VSWR
     e3-speed-num  no-calculator arithmetic: roots, exponentials, dB, constants, complex angles, Gamma fractions, series
   Each trick: a name, the rule in one line, why it is true (a short derivation from first principles), a 10-second
   example and the trap it avoids. Each group ends with its own rapid-fire generator (prefix rf_sp_). EM.BANK holds 20+
   extra questions per lesson; e3-tools.js only builds mini quizzes for the study units, so this file serves its own:
   each lesson gets lesson.bank (tagged with its id) and a 'concept' card limited to unit e3-gymu and that tag. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { p, MC, one } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- helpers
  const AX = ['x', 'y', 'z'];
  const TRI = [['x', 'y', 'z'], ['y', 'z', 'x'], ['z', 'x', 'y']];     // (u, v, w) with u x v = w
  const third = (a, b) => AX.find((c) => c !== a && c !== b);
  const cyc = (a, b) => (AX.indexOf(b) - AX.indexOf(a) + 3) % 3 === 1;
  const crs = (u, v) => [third(u[0], v[0]), u[1] * v[1] * (cyc(u[0], v[0]) ? 1 : -1)];   // signed unit vectors [axis, +-1]
  const hv = (u) => `${u[1] < 0 ? '-' : ''}\\hat ${u[0]}`;
  const neg = (u) => [u[0], -u[1]];
  const sgn = (s) => (s > 0 ? '-' : '+');                            // the sign in the argument of a wave going toward s
  const Fr = (x) => TL.frac(x, 200);
  const r3 = (x) => p(+x.toPrecision(3));
  const inl = (s) => s.replace(/\$/g, '').replace(/ (µs|ns|cm|m|MHz|rad\/m|rad\/s)$/, (m0, u) => (u === 'µs' ? '\\ \\mu\\text{s}' : `\\ \\text{${u}}`));   // an option string ("$2$ µs") as bare TeX
  const overPi = (c) => {                                             // TeX for c/pi
    const t = TL.frac(c, 500);
    const m = /^(-?)\\tfrac\{(\d+)\}\{(\d+)\}$/.exec(t);
    if (m) return `${m[1]}\\tfrac{${m[2]}}{${m[3]}\\pi}`;
    if (/^-?\d+$/.test(t)) return `\\tfrac{${t}}{\\pi}`;
    return `${t}/\\pi`;
  };
  // the mini quiz at the end of a lesson, drawn from that lesson's EM.BANK (see the header)
  const miniQuiz = (id) => [
    R(md`
      ### Mini quiz

      Five questions on this page that you have not seen above, drawn at random. No hints. Five right completes it; a wrong pick explains itself, and the next card is a new question.
    `),
    Object.assign(G('concept', { units: ['e3-gymu'], tags: [id], need: 5 }), { id: `${id}.quiz` }),
  ];
  const attachBank = (lesson) => {
    const qs = EM.BANK[lesson.id];
    qs.forEach((q) => { q.tags = [lesson.id]; });
    lesson.bank = qs;
  };

  // ================================================================ LESSON 1: waves and media
  const L1 = EM.lesson('e3-gymu', {
    id: 'e3-speed', order: 1, kind: 'lesson', title: 'Speed tricks: waves and media',
    sub: '27 tricks: direction, H, phasors, power, lossy media, polarization, reflection, standing waves',
    steps: [
      R(md`
        !!key How to use this page
          Each trick is one move you will make many times on Exam 3. For each one you get **the rule** in one line, **why** it is true (a short derivation from first principles, so you can rebuild it if you forget it), a **10-second example**, and the **trap** it keeps you out of. After each group comes a rapid-fire drill: eight right completes it. Aim for about 10 seconds a card. If a trick feels new, follow the link to the lesson that derives it slowly.

        The constants, as on the exam: $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \frac{10^{-9}}{36\pi}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$. A phasor $\tilde E$ means $E(t) = \Re\{\tilde E\,e^{j\omega t}\}$.

        ### A. Reading a wave in one look

        Derived slowly in [Topic 1](#/l/w1-phasor) and [Topic 5](#/l/w2-gamma).

        !!method
          **1. Which way it travels**

          **Rule.** Same sign on $\omega t$ and $\beta z$: the wave goes toward $-z$. Opposite signs: toward $+z$. A phasor $e^{-j\beta z}$ goes toward $+z$.

          **Why.** A crest is a place where the argument of the cosine stays fixed. Set the argument equal to a constant $C$ and solve for $z$:
          $$\omega t - \beta z = C \;\Rightarrow\; z = \frac{\omega t - C}{\beta}$$
          As $t$ grows, this $z$ grows: the crest moves toward $+z$. With $\omega t + \beta z = C$ you get $z = (C - \omega t)/\beta$, which shrinks. A phasor is multiplied by $e^{j\omega t}$, so $e^{-j\beta z}$ becomes $\omega t - \beta z$.

          **10-second example.** $E_x = 5\cos(6\times10^8t + 2y)$ V/m: same signs, so it travels toward $-\hat y$.

          **Trap.** Reading the sign of the $\beta$ term alone. $\cos(2y - 6\times10^8t)$ equals $\cos(6\times10^8t - 2y)$: opposite signs, so it goes toward $+\hat y$ although its $y$ term is positive.

        !!method
          **2. Speed, wavelength and frequency from the argument**

          **Rule.** $v = \omega/\beta$, $\lambda = 2\pi/\beta$, $f = \omega/2\pi$: two numbers in the argument give all three.

          **Why.** From trick 1 a crest sits at $z = (\omega t - C)/\beta$, so it moves at $dz/dt = \omega/\beta$. The pattern repeats when $\beta z$ grows by $2\pi$, which takes a distance $2\pi/\beta$.

          **10-second example.** $\cos(6\pi\times10^8t - 4\pi z)$: $v = 6\pi\times10^8/4\pi = 1.5\times10^8$ m/s $= c/2$, $\lambda = 2\pi/4\pi = 0.5$ m, $f = 3\times10^8$ Hz. Check: $\lambda f = 1.5\times10^8$ m/s ✓.

          **Trap.** Taking $\omega$ for $f$. $6\pi\times10^8$ rad/s is 300 MHz.

        !!method
          **3. η and v of a dielectric: divide by √εr**

          **Rule.** In a nonmagnetic dielectric, $\eta = 120\pi/\sqrt{\epsilon_r}$ and $v = c/\sqrt{\epsilon_r}$.

          **Why.** Put $\epsilon = \epsilon_r\epsilon_0$ into the definition of $\eta$:
          $$\eta = \sqrt{\frac{\mu_0}{\epsilon_r\epsilon_0}} = \frac{\eta_0}{\sqrt{\epsilon_r}}$$
          and into the definition of $v$:
          $$v = \frac{1}{\sqrt{\mu_0\epsilon_r\epsilon_0}} = \frac{c}{\sqrt{\epsilon_r}}$$

          | $\epsilon_r$ | $\sqrt{\epsilon_r}$ | $\eta$ | $v$ (m/s) |
          |---|---|---|---|
          | 2.25 | 1.5 | $80\pi \approx 251\ \Omega$ | $2\times10^8$ |
          | 4 | 2 | $60\pi \approx 188\ \Omega$ | $1.5\times10^8$ |
          | 9 | 3 | $40\pi \approx 126\ \Omega$ | $10^8$ |
          | 16 | 4 | $30\pi \approx 94\ \Omega$ | $0.75\times10^8$ |

          **10-second example.** $\epsilon_r = 9$ at 100 MHz: $v = 10^8$ m/s, so $\lambda = v/f = 1$ m (3 m in air).

          **Trap.** Dividing by $\epsilon_r$ itself. $120\pi/9$ is not the impedance of $\epsilon_r = 9$.

        !!method
          **4. Which way H points**

          **Rule.** $\hat h = \hat k\times\hat e$: the travel direction crossed into the direction of $\mathbf E$.

          **Why.** The formula sheet says $\hat e\times\hat h = \hat k$. So $(\hat e, \hat h, \hat k)$ is a right-handed set, in the same order as $(\hat x, \hat y, \hat z)$. In such a set each vector is the cross product of the next two in cyclic order, the way $\hat y = \hat z\times\hat x$. So $\hat h = \hat k\times\hat e$.

          **10-second example.** $\mathbf E$ along $\hat z$, travel toward $-\hat y$: $\hat h = (-\hat y)\times\hat z = -\hat x$. Check: $\hat z\times(-\hat x) = -\hat y$ ✓.

          **Trap.** $\hat e\times\hat k$ gives $-\hat h$. The order of a cross product matters.

        !!method
          **5. H from E, forward and backward**

          **Rule.** $\tilde{\mathbf H} = \frac{1}{\eta}\,\hat k\times\tilde{\mathbf E}$. For $\mathbf E$ along $\hat x$: going toward $+z$, $H_y = +E_x/\eta$; going toward $-z$, $H_y = -E_x/\eta$.

          **Why.** Faraday's law in phasors, for $\tilde E_x(z)$ and $\tilde H_y(z)$:
          $$\frac{d\tilde E_x}{dz} = -j\omega\mu\tilde H_y$$
          For $\tilde E_x = E_0e^{-j\beta z}$ the derivative is $-j\beta\tilde E_x$, so $\tilde H_y = (\beta/\omega\mu)\tilde E_x = \tilde E_x/\eta$, because $\beta/\omega\mu = \sqrt{\epsilon/\mu}$. For $e^{+j\beta z}$ the derivative is $+j\beta\tilde E_x$, and the sign flips.

          **10-second example.** In air, $\mathbf E = 120\pi\cos(\omega t + \beta z)\,\hat x$ V/m goes toward $-z$, so $\mathbf H = -\cos(\omega t + \beta z)\,\hat y$ A/m.

          **Trap.** Writing $+E_x/\eta$ for the backward wave. Then $\mathbf E\times\mathbf H$ would point against the travel.
      `),
      Q(md`**Predict.** A wave has the phasor $\tilde{\mathbf E} = 3e^{+j2x}\,\hat z$ V/m in a medium with $\eta = 40\pi\ \Omega$. Then $\tilde{\mathbf H}$ is…`,
        [md`$\frac{3}{40\pi}e^{+j2x}\,\hat y$ A/m`, md`$-\frac{3}{40\pi}e^{+j2x}\,\hat y$ A/m`, md`$\frac{3}{40\pi}e^{+j2x}\,\hat x$ A/m`, md`$120\pi e^{+j2x}\,\hat y$ A/m`], 0,
        [null, md`That is $\hat e\times\hat k$, or the forward-wave habit. This wave goes toward $-\hat x$, and $\hat h = (-\hat x)\times\hat z = +\hat y$.`, md`$\hat x$ is the travel axis. A TEM wave has no field along its travel.`, md`That multiplies by $\eta$. $\mathbf H$ is $\mathbf E$ divided by $\eta$.`],
        md`$e^{+j2x}$ goes toward $-\hat x$ (trick 1). $\hat h = \hat k\times\hat e = (-\hat x)\times\hat z = \hat y$, since $\hat x\times\hat z = -\hat y$. The size is $3/40\pi$ A/m. Check: $\hat z\times\hat y = -\hat x$, the travel ✓.`),
      R(md`**Drill A: read the wave.** Direction, $\hat h$, $\mathbf H$ from $\mathbf E$, $\eta$ and $v$ of a dielectric, $\lambda$. Eight right completes it.`),
      Object.assign(G('rf_sp_wave', { need: 8 }), { id: 'e3-speed.r1' }),
      R(md`
        ### B. Phasors and power

        Derived slowly in [Topic 1](#/l/w1-phasor), [Topic 3](#/l/w1-poynting) and [Topic 4](#/l/w1-avg).

        !!method
          **6. A sine becomes −j**

          **Rule.** The phasor of $A\sin(\omega t - \beta z)$ is $-jAe^{-j\beta z}$. A minus sign in front ($-A\sin$) gives $+jA$.

          **Why.** A sine is a cosine a quarter period late: $\sin x = \cos(x - 90°)$. The phasor of $A\cos(\omega t - \beta z + \phi)$ is $Ae^{j\phi}e^{-j\beta z}$, and $e^{-j90°} = -j$.

          **10-second example.** $\mathbf E = 4\sin(\omega t - 3z)\,\hat y$ V/m gives $\tilde{\mathbf E} = -j4e^{-j3z}\,\hat y$.

          **Trap.** Writing $+j$. Check it backward at $z = 0$: $\Re\{-je^{j\omega t}\} = \sin\omega t$ ✓.

        !!method
          **7. Back to time: j is 90° ahead**

          **Rule.** Multiply by $e^{j\omega t}$ and take the real part. A factor $j$ adds $90°$, and $\cos(\theta + 90°) = -\sin\theta$. A factor $-j$ gives $+\sin\theta$.

          **Why.** $j = e^{j90°}$, so
          $$\Re\{jAe^{j\theta}\} = A\cos(\theta + 90°) = -A\sin\theta$$
          The cosine moved a quarter period earlier is an upside-down sine: at $\theta = 0$ it is zero and falling.

          **10-second example.** $\tilde{\mathbf E} = -j2e^{+j\beta z}\,\hat x$ gives $2\cos(\omega t + \beta z - 90°)\,\hat x = 2\sin(\omega t + \beta z)\,\hat x$.

          **Trap.** Losing the minus sign in $\cos(\theta + 90°) = -\sin\theta$.

        !!method
          **8. Average power of one wave: E₀²/2η**

          **Rule.** One wave in a lossless medium carries $\langle S\rangle = E_0^2/2\eta = \eta H_0^2/2$, along its travel.

          **Why.** $S = E_xH_y = (E_0^2/\eta)\cos^2(\omega t - \beta z)$. Write $\cos^2 = \frac12 + \frac12\cos 2(\cdot)$. The second part averages to zero over a period, so $\cos^2$ averages to $\frac12$.

          **10-second example.** $E_0 = 60\pi$ V/m in $\epsilon_r = 4$, where $\eta = 60\pi\ \Omega$: $\langle S\rangle = (60\pi)^2/(120\pi) = 30\pi \approx 94$ W/m². The peak of $S(t)$ is twice that.

          **Trap.** Dropping the $\frac12$. That gives the peak, not the average.

        !!method
          **9. Lossy power: cos τ and e^(−2αz)**

          **Rule.** In a lossy medium, $\langle S\rangle = \dfrac{E_0^2}{2|\eta|}\cos\tau\;e^{-2\alpha z}$.

          **Why.** $\langle S\rangle = \frac12\Re\{\tilde E\tilde H^*\}$, and $\tilde H = \tilde E/\eta$, so
          $$\langle S\rangle = \tfrac12|\tilde E|^2\,\Re\{1/\eta^*\}$$
          With $\eta = |\eta|e^{j\tau}$, $1/\eta^* = e^{j\tau}/|\eta|$, whose real part is $\cos\tau/|\eta|$. And $|\tilde E| = E_0e^{-\alpha z}$, whose square is $E_0^2e^{-2\alpha z}$.

          **10-second example.** A good conductor has $\tau = 45°$: at its surface $\langle S\rangle = E_0^2/(2\sqrt2|\eta|)$. One skin depth in, multiply by $e^{-2} \approx 0.135$.

          **Trap.** Using $e^{-\alpha z}$ for the power. That is the field.

        !!method
          **10. A forward and a backward wave: powers subtract**

          **Rule.** In a lossless medium, $\langle S\rangle = (|E^+|^2 - |E^-|^2)/2\eta$, with no cross terms. A full standing wave carries nothing.

          **Why.** $\tilde E = E^+e^{-j\beta z} + E^-e^{j\beta z}$ and $\eta\tilde H = E^+e^{-j\beta z} - E^-e^{j\beta z}$. Multiply $\tilde E$ by $\eta\tilde H^*$. The two cross terms come out as $w^* - w$ for one complex number $w$, which is purely imaginary, so the real part keeps only $|E^+|^2 - |E^-|^2$.

          **10-second example.** Total reflection, $|E^-| = |E^+|$: $\langle S\rangle = 0$ everywhere in front of the mirror.

          **Trap.** Using $|\tilde E_\text{total}|^2/2\eta$. That changes with $z$, but the power cannot, since nothing in front of the boundary absorbs it.
      `),
      Q(md`**Predict.** In free space, $\mathbf E = 6\pi\sin(\omega t + \beta z)\,\hat y$ V/m. Its $\langle\mathbf S\rangle$ is…`,
        [md`$0.15\pi$ W/m² toward $-\hat z$`, md`$0.3\pi$ W/m² toward $-\hat z$`, md`$0.15\pi$ W/m² toward $+\hat z$`, md`zero, because a sine averages to zero`], 0,
        [null, md`That drops the $\frac12$: it is the peak of $S(t)$.`, md`$\omega t + \beta z$ has the same signs, so the wave goes toward $-\hat z$.`, md`$\sin$ averages to zero, but $\sin^2$ averages to $\frac12$.`],
        md`$\langle S\rangle = E_0^2/2\eta_0 = (6\pi)^2/(240\pi) = 36\pi/240 = 0.15\pi \approx 0.47$ W/m². Same signs in $\omega t + \beta z$: toward $-\hat z$. The sine only shifts the time; it does not change the average.`),
      R(md`**Drill B: phasors and power.** Sine to phasor, phasor to time, $E_0^2/2\eta$, the lossy factors, peak against average.`),
      Object.assign(G('rf_sp_power', { need: 8 }), { id: 'e3-speed.r2' }),
      R(md`
        ### C. Lossy media and good conductors

        Derived slowly in [Topic 5](#/l/w2-gamma), [Topic 7](#/l/w2-limits) and [Topic 8](#/l/w2-loss).

        !!method
          **11. The regime, and ωε₀ in one line**

          **Rule.** $\omega\epsilon_0 = f/(18\times10^9)$ S/m. Then $\sigma/\omega\epsilon \gg 1$ means a good conductor, $\ll 1$ means low loss, and near 1 means use the exact formulas.

          **Why.** $\omega\epsilon_0 = 2\pi f\cdot\frac{10^{-9}}{36\pi}$. The $\pi$ cancels, and $2/36 = 1/18$:
          $$\omega\epsilon_0 = \frac{f}{18}\times10^{-9}\ \text{S/m}$$

          **10-second example.** Seawater, $\sigma = 4$ S/m and $\epsilon_r = 81$, at 1 MHz: $\omega\epsilon = 81\times10^6/(18\times10^9) = 4.5\times10^{-3}$ S/m, so $\sigma/\omega\epsilon \approx 890$: a good conductor. At 1 GHz the ratio is 0.89: neither limit.

          **Trap.** Using $f$ where $\omega$ belongs (off by $2\pi$), or $\epsilon_0$ where $\epsilon_r\epsilon_0$ belongs.

        !!method
          **12. Good conductor: γ = (1 + j)/δ**

          **Rule.** $\alpha = \beta = 1/\delta$, so $\gamma = (1 + j)/\delta$, with $\delta = 1/\sqrt{\pi f\mu\sigma}$.

          **Why.** When $\sigma \gg \omega\epsilon$, drop the $j\omega\epsilon$:
          $$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon) \approx j\omega\mu\sigma$$
          $\sqrt j = e^{j45°} = (1 + j)/\sqrt2$, so $\gamma = (1 + j)\sqrt{\omega\mu\sigma/2}$. The length $\sqrt{2/\omega\mu\sigma} = 1/\sqrt{\pi f\mu\sigma}$ is the skin depth $\delta$.

          **10-second example.** $\delta = 1$ mm (Prof. Chen, Spring 2024, Problem 2a): $\gamma = 1000(1 + j)\ \text{m}^{-1}$. The wavelength inside is $2\pi\delta \approx 6.3$ mm.

          **Trap.** $\beta = 2\pi/\delta$. No: $\beta = 1/\delta$, and it is $\lambda$ that equals $2\pi\delta$.

        !!method
          **13. Good-conductor η and surface resistance**

          **Rule.** $\eta = (1 + j)/(\sigma\delta)$: $\tau = 45°$ and $|\eta| = \sqrt2/(\sigma\delta)$. The surface resistance is its real part, $R_s = 1/(\sigma\delta)$.

          **Why.** The sheet gives $\gamma/\eta = \sigma + j\omega\epsilon \approx \sigma$, so $\eta = \gamma/\sigma$. Put in trick 12. Lecture 26 defines $R_s = \alpha/\sigma$, the same number since $\alpha = 1/\delta$. It is the resistance of a square of the metal one skin depth thick.

          **10-second example.** $\sigma = 10^6$ S/m and $\delta = 0.1$ mm: $\sigma\delta = 100$ S, so $\eta = 0.01(1 + j)\ \Omega$ and $R_s = 0.01\ \Omega$.

          **Trap.** A real $\eta$. In a good conductor $H$ lags $E$ by $45°$.

        !!method
          **14. Each skin depth: field × 0.37, power × 0.135**

          **Rule.** After $k$ skin depths the field is $e^{-k}$ of its surface value and the power is $e^{-2k}$.

          **Why.** $|\tilde E| = E_0e^{-\alpha z}$ with $\alpha = 1/\delta$, so at $z = k\delta$ the factor is $e^{-k}$. Power goes as the field squared.

          **10-second example.** $\delta = 1$ mm, $E_0 = 10$ V/m at the surface: at 2 mm the amplitude is $10e^{-2} \approx 1.35$ V/m, and the power density is $e^{-4} \approx 1.8\%$ of its surface value.

          **Trap.** Writing $e^{-k}$ for the power fraction.

        !!method
          **15. Low loss: α ≈ ση/2**

          **Rule.** When $\sigma/\omega\epsilon \ll 1$: $\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon}$, while $\beta$ and $\eta$ keep their lossless values.

          **Why.** Write $\gamma = j\omega\sqrt{\mu\epsilon}\,\sqrt{1 - jx}$ with $x = \sigma/\omega\epsilon$. For small $x$, $\sqrt{1 - jx} \approx 1 - jx/2$. Multiply out: the real part is
          $$\alpha \approx \omega\sqrt{\mu\epsilon}\,\frac{\sigma}{2\omega\epsilon} = \frac{\sigma}{2}\sqrt{\frac{\mu}{\epsilon}}$$

          **10-second example.** $\sigma = 10^{-3}$ S/m in $\epsilon_r = 4$: $\alpha \approx (0.5\times10^{-3})(60\pi) = 0.03\pi \approx 0.094$ Np/m.

          **Trap.** Using $\eta_0$ instead of the medium's own $\sqrt{\mu/\epsilon}$.
      `),
      Q(md`**Predict.** In a good conductor with $\delta = 2$ mm, by what factor has the field amplitude fallen after the wave travels one wavelength into it?`,
        [md`$e^{-2\pi} \approx 0.002$`, md`$e^{-1} \approx 0.37$`, md`$e^{-2} \approx 0.14$`, md`$1/2\pi \approx 0.16$`], 0,
        [null, md`That is one skin depth. A wavelength is $2\pi\delta$, which is $2\pi$ skin depths.`, md`That is the power after one skin depth.`, md`The decay is exponential, not one over the distance.`],
        md`$\beta = 1/\delta$, so $\lambda = 2\pi/\beta = 2\pi\delta$. Over that distance the field falls by $e^{-\alpha\lambda} = e^{-2\pi} \approx 0.0019$. A wave in a good conductor is gone before it completes one cycle in space. (The value of $\delta$ did not matter.)`),
      R(md`**Drill C: lossy media.** Loss tangent, $\gamma$ and $\eta$ of a good conductor, skin-depth factors, low-loss $\alpha$, $R_s$.`),
      Object.assign(G('rf_sp_lossy', { need: 8 }), { id: 'e3-speed.r3' }),
      R(md`
        ### D. Polarization and handedness

        Derived slowly in [Topic 9](#/l/w3-pol) and [Topic 10](#/l/w3-antenna).

        !!method
          **16. Linear, circular or elliptical**

          **Rule.** Write $\tilde{\mathbf E} = A\,\hat u + Be^{j\phi}\,\hat v$. $\phi = 0°$ or $180°$: linear. $\phi = \pm90°$ and $A = B$: circular. Anything else: elliptical.

          **Why.** In time, $E_u = A\cos\omega t$ and $E_v = B\cos(\omega t + \phi)$. With $\phi = 0$ or $180°$ the ratio $E_v/E_u = \pm B/A$ never changes, so the tip stays on one line. With $\phi = \pm90°$, $E_v = \mp B\sin\omega t$, and if $A = B$:
          $$E_u^2 + E_v^2 = A^2(\cos^2 + \sin^2) = A^2$$
          a circle.

          **10-second example.** $2\hat x - 2\hat y$: linear. $3\hat x + j3\hat y$: circular. $3\hat x + j4\hat y$: elliptical. $\hat x + e^{j45°}\hat y$: elliptical.

          **Trap.** Calling equal sizes circular. The gap must also be exactly $90°$.

        !!method
          **17. Ahead × behind = travel: right-handed**

          **Rule.** Find the component that is $90°$ ahead ($+j$ is ahead of $1$, and $1$ is ahead of $-j$). If ahead $\times$ behind points along the travel, the wave is right-handed. If it points against it, left-handed.

          **Why.** At $\omega t = 0$ the ahead component is at its peak, so $\mathbf E$ points along it. A quarter period later the behind component peaks. So the tip turns from the ahead direction toward the behind direction. Curl the fingers of your right hand that way and your thumb points along ahead $\times$ behind. Right-handed means that thumb points along the travel.

          **10-second example.** $(\hat x - j\hat y)e^{-j\beta z}$: $\hat x$ is ahead of $\hat y$, and $\hat x\times\hat y = \hat z$, the travel: RHCP.

          **The review-session example.** $3\cos(\omega t + \beta x)\,\hat z - 3\cos(\omega t + \beta x - 90°)\,\hat y$. Put the minus sign into the direction: the second term is $3\cos(\theta - 90°)$ along $-\hat y$, so $\hat z$ is ahead of $-\hat y$. Then $\hat z\times(-\hat y) = +\hat x$, but the wave goes toward $-\hat x$: LHCP.

          **Trap.** Using a minus sign twice. Put it into the direction ($-\hat y$) or into the phase ($+180°$), never both. And always compare with the travel.

        !!method
          **18. What flips the hand, and what does not**

          **Rule.** Each of these flips the hand: reversing the travel, negating one component, changing $j$ to $-j$. Multiplying the whole phasor by any number ($-1$, $j$, $e^{j\phi}$) does not.

          **Why.** In trick 17, reversing the travel reverses what you compare with. Negating one component reverses ahead $\times$ behind. Changing $j$ to $-j$ swaps which component is ahead. A common factor shifts both phases by the same amount, so the order stays.

          **10-second example.** $(\hat x - j\hat y)e^{-j\beta z}$ is RH. $(\hat x + j\hat y)e^{+j\beta z}$ has two flips, so it is RH too. $j(\hat x - j\hat y) = j\hat x + \hat y$ is RH.

          **Trap.** Thinking that $\times(-1)$ reverses the rotation. It turns both components by $180°$ together.

        !!method
          **19. A reflection flips the hand**

          **Rule.** The reflected wave of a circular wave has the opposite hand. The transmitted wave keeps the hand.

          **Why.** $\Gamma$ multiplies both components by the same number, a common factor, so the tip turns the same way in the plane. But the reflected wave travels the other way, and reversing the travel flips the hand (trick 18). $\tau$ is also a common factor, and the transmitted wave keeps the travel direction.

          **10-second example.** RHCP onto a perfect conductor ($\Gamma = -1$): the reflection is LHCP. RHCP into glass: reflected LHCP (smaller), transmitted RHCP.

          **Trap.** "$\Gamma = -1$ reverses the rotation, so the hand stays." $\Gamma = -1$ is a common factor; it reverses nothing.

        !!method
          **20. A current sheet radiates opposite hands on its two sides**

          **Rule.** A sheet sends the same pattern of components both ways, so the two sides have opposite hands.

          **Why.** A sheet $\tilde{\mathbf J}_s$ at $z = 0$ radiates $\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z|}$ (the sheet solution on the formula sheet, as phasors). The factor $-\eta/2$ is common to both components. The pattern is the same on both sides, and the travel directions are opposite.

          **10-second example.** $\tilde{\mathbf J}_s = J_0(\hat x - j\hat y)$: $\hat x$ is ahead and $\hat x\times\hat y = \hat z$. In $z > 0$ the wave goes toward $+z$: RHCP. In $z < 0$: LHCP.

          **Trap.** Expecting one hand everywhere. For RHCP going toward $-z$ you need $\hat x + j\hat y$.

        !!method
          **21. Power adds component by component**

          **Rule.** $\langle S\rangle = (|\tilde E_u|^2 + |\tilde E_v|^2)/2\eta$, whatever the phases.

          **Why.** $\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta$. The BAC−CAB rule gives $\tilde{\mathbf E}\times(\hat k\times\tilde{\mathbf E}^*) = \hat k\,(\tilde{\mathbf E}\cdot\tilde{\mathbf E}^*)$, because $\tilde{\mathbf E}\perp\hat k$. And $\tilde{\mathbf E}\cdot\tilde{\mathbf E}^* = |\tilde E_u|^2 + |\tilde E_v|^2$: no cross terms.

          **10-second example.** $(3\hat x - j4\hat y)e^{-j\beta z}$ V/m in air: $\langle S\rangle = 25/(240\pi) = 5/(48\pi) \approx 0.033$ W/m².

          **Trap.** Adding the amplitudes first: $(3 + 4)^2 = 49$, not 25.
      `),
      Q(md`**Predict.** From the 2025 review session: $\mathbf E = 3\cos(\omega t + \beta x)\,\hat z - 3\cos(\omega t + \beta x + 90°)\,\hat y$. This wave is…`,
        ['right-handed circular', 'left-handed circular', 'linear', 'elliptical'], 0,
        [null, md`That uses the minus sign twice, or forgets the travel. $-\hat y$ is $90°$ ahead of $\hat z$, $(-\hat y)\times\hat z = -\hat x$, and $\omega t + \beta x$ goes toward $-\hat x$: they agree, so right-handed.`, md`The components are $90°$ apart, not $0°$ or $180°$.`, md`The sizes are equal (3 and 3) and the gap is exactly $90°$: a circle.`],
        md`Put the minus sign into the direction: the second term is $3\cos(\theta + 90°)$ along $-\hat y$. It is $90°$ ahead of the $\hat z$ term. Ahead $\times$ behind $= (-\hat y)\times\hat z = -\hat x$, and $\omega t + \beta x$ goes toward $-\hat x$. They agree: RHCP.`),
      R(md`**Drill D: polarization.** Type and hand from a phasor or a cosine, the flip rules, reflections, sheets, power.`),
      Object.assign(G('rf_sp_pol', { need: 8 }), { id: 'e3-speed.r4' }),
      R(md`
        ### E. Reflection and standing waves

        Derived slowly in [Topic 11](#/l/w4-gamma) and [Topic 12](#/l/w4-standing).

        !!method
          **22. Γ from the refractive indices**

          **Rule.** $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$. For nonmagnetic dielectrics, with $n = \sqrt{\epsilon_r}$: $\Gamma = (n_1 - n_2)/(n_1 + n_2)$.

          **Why.** $\eta = \eta_0/n$. Put that in, then multiply top and bottom by $n_1n_2/\eta_0$:
          $$\Gamma = \frac{1/n_2 - 1/n_1}{1/n_2 + 1/n_1} = \frac{n_1 - n_2}{n_1 + n_2}$$

          **10-second example.** Air into $\epsilon_r = 4$: $(1 - 2)/(1 + 2) = -1/3$. Air into $\epsilon_r = 9$: $-1/2$. From $\epsilon_r = 4$ into air: $+1/3$.

          **Trap.** Using $\epsilon_r$ where $n$ belongs: $(1 - 4)/(1 + 4) = -3/5$ is wrong.

        !!method
          **23. τ = 1 + Γ, and it may exceed 1**

          **Rule.** $\tau = 1 + \Gamma$ for $E$. The ratio for $H$ is $1 - \Gamma$.

          **Why.** Tangential $\mathbf E$ is continuous at the boundary: $E_i + E_r = E_t$ there. Divide by $E_i$: $1 + \Gamma = \tau$. Tangential $\mathbf H$ is continuous too, and the reflected wave has $H_r = -E_r/\eta_1$, so the same step gives $1 - \Gamma$ for $H$.

          **10-second example.** From $\epsilon_r = 4$ into air: $\Gamma = 1/3$, $\tau = 4/3$. A perfect conductor: $\Gamma = -1$, $\tau = 0$.

          **Trap.** Thinking $\tau > 1$ breaks energy conservation. Power also has $1/\eta$ in it (trick 24).

        !!method
          **24. |Γ|² of the power reflects**

          **Rule.** Between lossless media, the fraction $|\Gamma|^2$ of the power reflects and $1 - |\Gamma|^2$ goes through.

          **Why.** $\langle S\rangle = |E|^2/2\eta$. Reflected over incident: $|\Gamma|^2$, since both are in medium 1. Transmitted over incident: $\tau^2\eta_1/\eta_2$. Put in $\tau = 2\eta_2/(\eta_1 + \eta_2)$:
          $$\tau^2\frac{\eta_1}{\eta_2} = \frac{4\eta_1\eta_2}{(\eta_1 + \eta_2)^2} = 1 - \Gamma^2$$

          **10-second example.** $\Gamma = -1/3$: $1/9$ reflects and $8/9$ goes through. $\Gamma = -1/2$: $1/4$ and $3/4$.

          **Trap.** $\tau^2 = 4/9$ is not the transmitted fraction. It misses the factor $\eta_1/\eta_2$.

        !!method
          **25. In front of a perfect conductor**

          **Rule.** $E$ is zero at the wall and every $\lambda/2$ from it; $H$ is largest there. In time, $E = 2E_0\sin\beta z\,\sin\omega t$ and $H = \frac{2E_0}{\eta}\cos\beta z\,\cos\omega t$.

          **Why.** Put the wall at $z = 0$, the incident wave $E_0e^{-j\beta z}\,\hat x$ in $z < 0$, and $\Gamma = -1$:
          $$\tilde E_x = E_0(e^{-j\beta z} - e^{j\beta z}) = -2jE_0\sin\beta z$$
          It is zero where $\beta z = -n\pi$, which is every $\lambda/2$. The reflected $H$ carries two minus signs ($\Gamma$ and the backward travel), so it adds: $\tilde H_y = (2E_0/\eta)\cos\beta z$. Times $e^{j\omega t}$, the real part of $-2j$ gives $2\sin\omega t$, and of $2$ gives $2\cos\omega t$. $E$ and $H$ are $90°$ apart in time, so no average power flows.

          **10-second example.** 300 MHz in air, $\lambda = 1$ m: $E$ is zero at 0, 50 and 100 cm from the wall; the nearest $|E|$ maximum is at 25 cm, where $H$ is zero. An open circuit on a line swaps the roles: $\tilde V \propto 2\cos\beta d$ is largest at the open (formula sheet).

          **Trap.** Spacing the nulls by $\lambda$. $|\sin\beta z|$ repeats every half wavelength.

        !!method
          **26. The envelope: (1 ± |Γ|)E₀, a quarter wave apart**

          **Rule.** $|E_1|_{\max} = (1 + |\Gamma|)E_0$ and $|E_1|_{\min} = (1 - |\Gamma|)E_0$, a quarter wavelength apart. At the boundary you sit on a minimum if $\Gamma < 0$, on a maximum if $\Gamma > 0$.

          **Why.** $|\tilde E_1| = E_0|1 + \Gamma e^{j2\beta z}|$. The second term turns as $z$ changes. Lined up with the 1 it gives $1 + |\Gamma|$; opposed, $1 - |\Gamma|$. Going from one to the other turns $2\beta z$ by $\pi$, a distance of $\lambda_1/4$. At $z = 0$ the value is $1 + \Gamma$.

          **10-second example.** Air into $\epsilon_r = 9$: $\Gamma = -1/2$. At the boundary $0.5E_0$ (a minimum); $1.5E_0$ a quarter wavelength in front of it. Their ratio is 3.

          **Trap.** Using $\lambda_2$. The pattern lives in medium 1, so the spacing is $\lambda_1/4$.

        !!method
          **27. Radiation pressure**

          **Rule.** On a perfect mirror the average pressure is $2\langle S_i\rangle/c$, which equals $\epsilon_0E_0^2$. On a perfect absorber it is $\langle S_i\rangle/c$.

          **Why.** A wave carries momentum at the rate $\langle S\rangle/c$ per unit area (Lecture 26). An absorber stops that momentum; a mirror reverses it, which takes twice the push. With $\langle S_i\rangle = E_0^2/2\eta_0$ and $\eta_0c = 1/\epsilon_0$:
          $$\frac{2\langle S_i\rangle}{c} = \frac{E_0^2}{\eta_0c} = \epsilon_0E_0^2$$

          **10-second example.** $\langle S_i\rangle = 1.5$ kW/m² on a mirror: $2(1500)/(3\times10^8) = 10^{-5}$ Pa.

          **Trap.** Multiplying by $c$. Pressure is a power per area divided by a speed.
      `),
      Q(md`**Predict.** A wave in air hits glass with $\epsilon_r = 2.25$ at normal incidence. What fraction of its power goes into the glass?`,
        ['96%', '80%', '64%', '4%'], 0,
        [null, md`That is $1 - |\Gamma|$. Power goes as the field squared: $1 - |\Gamma|^2$.`, md`That is $\tau^2 = (4/5)^2$, which misses the factor $\eta_1/\eta_2 = 1.5$.`, md`That is $|\Gamma|^2$, the reflected part.`],
        md`$n_2 = 1.5$, so $\Gamma = (1 - 1.5)/(1 + 1.5) = -1/5$. Reflected: $1/25 = 4\%$. Transmitted: $24/25 = 96\%$. Check with $\tau = 4/5$: $\tau^2\eta_1/\eta_2 = (16/25)(1.5) = 0.96$ ✓.`),
      R(md`**Drill E: reflection and standing waves.** $\Gamma$ and $\tau$ from $\epsilon_r$, power fractions, nulls in front of a wall, the envelope, pressure, the standing-wave form.`),
      Object.assign(G('rf_sp_refl', { need: 8 }), { id: 'e3-speed.r5' }),
      R(md`
        ### The whole page on one card

        | Trick | Rule |
        |---|---|
        | direction | same signs on $\omega t$, $\beta z$: toward $-z$ |
        | $v$, $\lambda$ | $\omega/\beta$ and $2\pi/\beta$ |
        | dielectric | $\eta = 120\pi/\sqrt{\epsilon_r}$, $v = c/\sqrt{\epsilon_r}$ |
        | $\hat h$ | $\hat k\times\hat e$ |
        | $\mathbf H$ | $\frac1\eta\hat k\times\mathbf E$: backward gets a minus |
        | phasor of sine | $-j$ |
        | power | $E_0^2/2\eta$; lossy: $\times\cos\tau\,e^{-2\alpha z}$ |
        | two waves | $(|E^+|^2 - |E^-|^2)/2\eta$ |
        | $\omega\epsilon_0$ | $f/(18\times10^9)$ S/m |
        | good conductor | $\gamma = (1 + j)/\delta$, $\eta = (1 + j)/\sigma\delta$ |
        | per skin depth | field $\times e^{-1}$, power $\times e^{-2}$ |
        | low loss | $\alpha \approx \sigma\eta/2$ |
        | type | $0°/180°$ linear; $90°$ and equal: circular |
        | hand | ahead $\times$ behind = travel: right |
        | flips | travel, one sign, $j \leftrightarrow -j$ (not a common factor) |
        | reflection | flips the hand |
        | $\Gamma$ | $(n_1 - n_2)/(n_1 + n_2)$, $\tau = 1 + \Gamma$ |
        | power split | $|\Gamma|^2$ and $1 - |\Gamma|^2$ |
        | at a PEC | $E$ nulls every $\lambda/2$ from the wall |
        | envelope | $(1 \pm |\Gamma|)E_0$, $\lambda_1/4$ apart |
        | pressure | mirror $2\langle S\rangle/c$, absorber $\langle S\rangle/c$ |
      `),
      ...miniQuiz('e3-speed'),
    ],
  });

  // ---------------------------------------------------------------- drill A: reading a wave
  GENS.rf_sp_wave = () => one([
    // direction of travel from the argument or the phasor
    () => {
      const k = pick(AX), e = pick(AX.filter((a) => a !== k)), s = pick([1, -1]), n = pick([1, 2, 3]), b = pick([1, 2, 3, 4, 6]), A = pick([2, 5, 10]);
      const w = p(3 * b / n);
      const form = pick(['t', 't', 'p', s > 0 ? 'r' : 'p']);
      const field = form === 'p' ? md`A wave has the phasor $\tilde E_${e} = ${A}e^{${s > 0 ? '-' : '+'}j${b}${k}}$ V/m.`
        : form === 'r' ? md`$E_${e} = ${A}\cos(${b}${k} - ${w}\times10^8t)$ V/m.`
          : md`$E_${e} = ${A}\cos(${w}\times10^8t ${sgn(s)} ${b}${k})$ V/m.`;
      const same = s < 0 ? 'same' : 'opposite';
      const back = form === 'p' ? md`The phasor times $e^{j\omega t}$ has the argument $\omega t ${sgn(s)} ${b}${k}$: ${same} signs, so it goes toward $${hv([k, s])}$.`
        : form === 'r' ? md`$\cos(${b}${k} - \omega t) = \cos(\omega t - ${b}${k})$: the signs are opposite, so it goes toward $+\hat ${k}$. What counts is the sign of the $${k}$ term compared with that of $\omega t$.`
          : md`That reads the sign of the $${k}$ term alone. Compare it with the sign of $\omega t$: ${same} signs, so it goes toward $${hv([k, s])}$.`;
      return MC('Which way it travels', md`${field} The wave travels toward…`, md`$${hv([k, s])}$`,
        [[md`$${hv([k, -s])}$`, back],
          [md`$${hv([e, 1])}$`, md`That is the direction $\mathbf E$ points. A plane wave travels perpendicular to its field.`],
          [md`$${hv([e, -1])}$`, md`That is the axis of $\mathbf E$ itself. A plane wave travels perpendicular to its field.`],
          [md`$${hv([third(k, e), 1])}$`, md`The argument contains only $${k}$, so the wave travels along $\pm\hat ${k}$.`],
          ['It does not travel: it is a standing wave', md`One cosine of $\omega t \pm \beta ${k}$ travels. A standing wave is a product, like $\sin\beta ${k}\,\sin\omega t$.`]],
        form === 'p' ? md`$e^{${s > 0 ? '-' : '+'}j${b}${k}}$ with $e^{j\omega t}$ gives $\omega t ${sgn(s)} ${b}${k}$: ${same} signs, so toward $${hv([k, s])}$.`
          : md`The argument is $\omega t ${sgn(s)} ${b}${k}$: ${same} signs, so toward $${hv([k, s])}$, at $v = \omega/\beta = ${p(3 / n)}\times10^8$ m/s.`);
    },
    // H direction from e and k
    () => {
      const k = [pick(AX), pick([1, -1])], e = [pick(AX.filter((a) => a !== k[0])), pick([1, -1])], h = crs(k, e);
      return MC('Which way H points', md`A plane wave has $\mathbf E$ along $${hv(e)}$ and travels toward $${hv(k)}$. $\mathbf H$ points along…`, md`$${hv(h)}$`,
        [[md`$${hv(neg(h))}$`, md`That is $\hat e\times\hat k$, the cross product in the wrong order. Use $\hat h = \hat k\times\hat e$, so that $\hat e\times\hat h = \hat k$.`],
          [md`$${hv(e)}$`, md`$\mathbf H$ is perpendicular to $\mathbf E$ in a plane wave.`],
          [md`$${hv(neg(e))}$`, md`That is still the axis of $\mathbf E$. $\mathbf H$ is perpendicular to it.`],
          [md`$${hv(k)}$`, md`A TEM wave has no field along its direction of travel.`],
          [md`$${hv(neg(k))}$`, md`That is the travel axis. A TEM wave has no field along it.`]],
        md`$\hat h = \hat k\times\hat e = (${hv(k)})\times(${hv(e)}) = ${hv(h)}$. Check: $(${hv(e)})\times(${hv(h)}) = ${hv(crs(e, h))}$ ✓.`);
    },
    // H from E, forward or backward, in a dielectric
    () => {
      const [n, H0] = pick([[2, 0.5], [2, 1], [2, 2], [3, 1], [3, 3], [4, 1], [4, 2]]);
      const c = 120 * H0 / n, s = pick([1, -1]), ea = pick(['x', 'y']);
      const kk = ['z', s], h = crs(kk, [ea, 1]);
      const arg = md`\omega t ${sgn(s)} \beta z`;
      const Hs = (amp, u) => md`$${u[1] < 0 ? '-' : ''}${p(amp)}\cos(${arg})\,\hat ${u[0]}$ A/m`;
      return MC('H from E', md`A nonmagnetic medium has $\epsilon_r = ${n * n}$. In it, $\mathbf E = ${p(c)}\pi\cos(${arg})\,\hat ${ea}$ V/m. Then $\mathbf H$ is…`, Hs(H0, h),
        [[Hs(H0, neg(h)), md`That is the $\mathbf H$ of the wave going the other way. This one goes toward $${hv(kk)}$, so $\hat h = (${hv(kk)})\times\hat ${ea} = ${hv(h)}$.`],
          [Hs(H0 / n, h), md`That divides by $\eta_0 = 120\pi$. In this medium $\eta = 120\pi/\sqrt{\epsilon_r} = ${p(120 / n)}\pi\ \Omega$.`],
          [Hs(H0 * n, h), md`That divides by $120\pi/\epsilon_r$. The impedance has $\sqrt{\epsilon_r}$, not $\epsilon_r$.`],
          [Hs(H0, [ea, h[1]]), md`$\mathbf H$ is perpendicular to $\mathbf E$; it cannot point along $\hat ${ea}$.`]],
        md`$\eta = 120\pi/${n} = ${p(120 / n)}\pi\ \Omega$, so $H_0 = ${p(c)}\pi/${p(120 / n)}\pi = ${p(H0)}$ A/m. Toward $${hv(kk)}$: $\hat h = (${hv(kk)})\times\hat ${ea} = ${hv(h)}$.`);
    },
    // eta and v from eps_r
    () => {
      const n = pick([1.5, 2, 3, 4]), er = n * n;
      const o = (eta, v) => md`$\eta = ${p(eta)}\pi\ \Omega$, $v = ${p(v)}\times10^8$ m/s`;
      return MC('η and v of a dielectric', md`A nonmagnetic dielectric has $\epsilon_r = ${p(er)}$. Its intrinsic impedance and wave speed are…`, o(120 / n, 3 / n),
        [[o(120 / er, 3 / er), md`That divides by $\epsilon_r$. Both carry $\sqrt{\epsilon_r} = ${p(n)}$.`],
          [o(120 * n, 3 / n), md`A larger $\epsilon$ lowers the impedance: divide by $\sqrt{\epsilon_r}$, do not multiply.`],
          [o(120 / n, 3 * n), md`A wave is slower in a dielectric: $v = c/\sqrt{\epsilon_r}$.`],
          [o(120, 3), md`That is free space. This medium has $\epsilon_r = ${p(er)}$.`]],
        md`$\sqrt{\epsilon_r} = ${p(n)}$: $\eta = 120\pi/${p(n)} = ${p(120 / n)}\pi\ \Omega$ and $v = c/${p(n)} = ${p(3 / n)}\times10^8$ m/s.`);
    },
    // wavelength from the argument
    () => {
      const m = pick([0.5, 1, 3, 4]), n = pick([1, 2, 3]);
      const w = 3 * m / n, lam = 2 / m, lam0 = 2 * n / m;
      return MC('Wavelength from the argument', md`$E_y = 4\cos(${p(w)}\pi\times10^8t - ${m === 1 ? '' : p(m)}\pi z)$ V/m, with $z$ in meters. The wavelength is…`, md`$${Fr(lam)}$ m`,
        [[md`$${r3(1 / (m * Math.PI))}$ m`, md`That forgot the $2\pi$: $\lambda = 2\pi/\beta$.`],
          [md`$${r3(2 * m * Math.PI * Math.PI)}$ m`, md`That is $2\pi\beta$. $\lambda = 2\pi/\beta$: a larger $\beta$ means a shorter wave.`],
          [md`$${Fr(lam0)}$ m`, md`That is the free-space wavelength $2\pi c/\omega$. This wave moves at $\omega/\beta = ${p(3 / n)}\times10^8$ m/s, not at $c$.`],
          [md`$${Fr(m / 2)}$ m`, md`That is $\beta/2\pi$, which is $1/\lambda$.`]],
        md`$\lambda = 2\pi/\beta = 2\pi/(${m === 1 ? '' : p(m)}\pi) = ${Fr(lam)}$ m.`);
    },
  ]);

  // ---------------------------------------------------------------- drill B: phasors and power
  GENS.rf_sp_power = () => one([
    // sine to phasor
    () => {
      const A = pick([2, 3, 4, 5, 10]), b = pick([2, 3, 4, 5]), k = pick(AX), ax = pick(AX.filter((a) => a !== k)), s = pick([1, -1]), ng = pick([false, true]);
      const ex = (t) => md`e^{${t > 0 ? '-' : '+'}j${b}${k}}`;
      const ph = (c, t) => md`$\tilde{\mathbf E} = ${c}${A}\,${ex(t)}\,\hat ${ax}$`;
      return MC('A sine as a phasor', md`$\mathbf E = ${ng ? '-' : ''}${A}\sin(\omega t ${sgn(s)} ${b}${k})\,\hat ${ax}$ V/m. Its phasor is…`, ph(ng ? 'j' : '-j', s),
        [[ph(ng ? '-j' : 'j', s), ng ? md`$-\sin x = \cos(x + 90°)$, and $e^{+j90°} = +j$.` : md`$\sin x = \cos(x - 90°)$, and $e^{-j90°} = -j$, not $+j$.`],
          [ph(ng ? '-' : '', s), md`That is the phasor of a ${ng ? 'negative ' : ''}cosine. A sine is a cosine shifted by $90°$, which brings a factor of $\pm j$.`],
          [ph(ng ? '' : '-', s), md`A minus sign is a $180°$ shift. A sine is only $90°$ away from a cosine.`],
          [ph(ng ? 'j' : '-j', -s), md`The exponent must keep the travel: $\omega t ${sgn(s)} ${b}${k}$ goes with $${ex(s)}$.`]],
        ng ? md`$-\sin x = \cos(x + 90°)$ and $e^{j90°} = j$: $\tilde{\mathbf E} = j${A}${ex(s)}\,\hat ${ax}$.` : md`$\sin x = \cos(x - 90°)$ and $e^{-j90°} = -j$: $\tilde{\mathbf E} = -j${A}${ex(s)}\,\hat ${ax}$.`);
    },
    // phasor back to time
    () => {
      const A = pick([2, 3, 4, 5, 10]), b = pick([2, 3, 4]), s = pick([1, -1]), cj = pick([1, -1]), ax = pick(['x', 'y']);
      const th = md`\omega t ${sgn(s)} ${b}z`, thb = md`\omega t ${sgn(-s)} ${b}z`;
      const T = (c, fn, t) => md`$${c}${A}${fn}(${t})\,\hat ${ax}$ V/m`;
      const SIN = '\\sin', COS = '\\cos';
      return MC('Phasor back to time', md`$\tilde{\mathbf E} = ${cj > 0 ? '' : '-'}j${A}\,e^{${s > 0 ? '-' : '+'}j${b}z}\,\hat ${ax}$ V/m. In the time domain, $\mathbf E$ is…`, T(cj > 0 ? '-' : '', SIN, th),
        [[T(cj > 0 ? '' : '-', SIN, th), cj > 0 ? md`$j$ moves the cosine $90°$ ahead, and $\cos(\theta + 90°) = -\sin\theta$: the minus sign stays.` : md`$-j$ moves the cosine $90°$ back, and $\cos(\theta - 90°) = +\sin\theta$.`],
          [T('', COS, th), md`That drops the ${cj > 0 ? '$j$' : '$-j$'}, which is a $90°$ shift.`],
          [T('-', COS, th), md`A minus sign is $180°$. The factor ${cj > 0 ? '$j$' : '$-j$'} is only $90°$.`],
          [T(cj > 0 ? '-' : '', SIN, thb), md`$e^{${s > 0 ? '-' : '+'}j${b}z}$ gives $${th}$ in the argument; the sign of the $z$ term carries over.`]],
        md`$${cj > 0 ? 'j = e^{j90°}' : '-j = e^{-j90°}'}$, so $\mathbf E = ${A}\cos(${th} ${cj > 0 ? '+' : '-'} 90°)\,\hat ${ax} = ${cj > 0 ? '-' : ''}${A}\sin(${th})\,\hat ${ax}$ V/m.`);
    },
    // <S> of one wave in a dielectric
    () => {
      const [n, H0] = pick([[1, 1], [1, 2], [3, 1.5], [3, 3], [4, 1], [4, 2]]);
      const c = 120 * H0 / n, S = 60 * H0 * H0 / n;
      const o = (x) => md`$${p(x)}\pi$ W/m²`;
      const etaT = n === 1 ? md`\eta = 120\pi\ \Omega` : md`\eta = 120\pi/${n} = ${p(120 / n)}\pi\ \Omega`;
      return MC('Average power of one wave', md`A wave in a nonmagnetic medium with $\epsilon_r = ${n * n}$ has $E_0 = ${p(c)}\pi$ V/m. Its time-average power density is…`, o(S),
        [[o(2 * S), md`That drops the $\frac12$: it is the peak of $S(t)$, not its average.`],
          [o(S / n), md`That uses $\eta_0 = 120\pi$. In this medium $\eta = 120\pi/\sqrt{\epsilon_r}$.`],
          [o(S * n), md`That divides by $120\pi/\epsilon_r$. The impedance has $\sqrt{\epsilon_r}$.`],
          [o(S / 2), md`That halves twice. The $\frac12$ is already the average of $\cos^2$.`],
          [md`$${p(H0 / 2)}$ W/m²`, md`That forgot to square: $\langle S\rangle = E_0^2/2\eta$, which is $E_0H_0/2$.`]],
        md`$${etaT}$, so $\langle S\rangle = E_0^2/2\eta = (${p(c)}\pi)^2/(${p(240 / n)}\pi) = ${p(S)}\pi$ W/m².`);
    },
    // lossy decay of power
    () => {
      const a = pick([0.5, 1, 2, 5, 10, 100]), x = pick([0.5, 1, 1.5, 2]), d = x / a, tau = pick([10, 20, 30, 45]);
      const E = (k) => md`$e^{-${p(k)}} \approx ${r3(Math.exp(-k))}$`;
      return MC('Power down a lossy medium', md`A wave in a lossy medium has $\alpha = ${p(a)}$ Np/m and $\tau = ${tau}°$. What is $\langle S\rangle$ at $z = ${p(d)}$ m divided by $\langle S\rangle$ at $z = 0$?`, E(2 * x),
        [[E(x), md`That is the field ratio $e^{-\alpha z}$. Power goes as the field squared: $e^{-2\alpha z}$.`],
          [E(4 * x), md`That squares twice. $e^{-2\alpha z}$ already is the square of the field factor.`],
          [md`$\cos${tau}°\,e^{-${p(2 * x)}} \approx ${r3(Math.cos(tau * Math.PI / 180) * Math.exp(-2 * x))}$`, md`$\cos\tau$ is the same at both points, so it cancels in the ratio.`],
          [E(x / 2), md`That is the square root of the field factor. Power is the field squared.`]],
        md`$\langle S\rangle \propto e^{-2\alpha z}$: $e^{-2(${p(a)})(${p(d)})} = e^{-${p(2 * x)}} \approx ${r3(Math.exp(-2 * x))}$.`);
    },
    // the cos(tau) factor
    () => {
      const [E0, eta] = pick([[2, 1], [10, 50], [6, 9], [4, 2], [3, 1], [8, 4]]), tau = pick([45, 30]);
      const base = E0 * E0 / (2 * eta), cs = Math.cos(tau * Math.PI / 180);
      const o = (x) => md`$${r3(x)}$ W/m²`;
      return MC('The cos τ in lossy power', md`A wave in a lossy medium has $E_0 = ${E0}$ V/m at $z = 0$ and $\eta = ${eta}\,e^{j${tau}°}\ \Omega$. Its $\langle S\rangle$ at $z = 0$ is about…`, o(base * cs),
        [[o(base), md`That drops $\cos\tau$. $H$ lags $E$ by $\tau$, and only the in-phase part of $\tilde E\tilde H^*$ carries power.`],
          [o(base * cs * cs), md`That uses $\cos^2\tau$. $\Re\{1/\eta^*\} = \cos\tau/|\eta|$ has one factor of $\cos\tau$.`],
          [o(2 * base * cs), md`That drops the $\frac12$ of the time average.`],
          [o(base * Math.sin(tau * Math.PI / 180)), md`That uses $\sin\tau$. The real part of $e^{j\tau}$ is $\cos\tau$.`],
          [o(base / cs), md`That divides by $\cos\tau$. $1/\eta^* = e^{j\tau}/|\eta|$, whose real part is $\cos\tau/|\eta|$.`]],
        md`$\langle S\rangle = \frac{E_0^2}{2|\eta|}\cos\tau = ${p(base)}\cos${tau}° \approx ${r3(base * cs)}$ W/m².`);
    },
    // peak versus average
    () => {
      const S = pick([2, 5, 10, 30, 60]);
      const o = (x) => md`$${r3(x)}$ W/m²`;
      return MC('Peak against average', md`A single plane wave in a lossless medium has $\langle S\rangle = ${S}$ W/m². At a fixed point, the largest value of $S(t)$ is…`, o(2 * S),
        [[o(S), md`That is the average. $S(t) = (E_0^2/\eta)\cos^2(\cdot)$, and the average of $\cos^2$ is half its peak.`],
          [o(S / 2), md`That halves the average. The peak is larger than the average, not smaller.`],
          [o(Math.SQRT2 * S), md`$\sqrt2$ links the peak and rms values of a field, not the peak and average of a power.`],
          [o(4 * S), md`The peak of $\cos^2$ is 1, so the peak of $S$ is $E_0^2/\eta = 2\langle S\rangle$, not four times.`]],
        md`$S(t) = (E_0^2/\eta)\cos^2(\omega t - \beta z)$ peaks at $E_0^2/\eta = 2\langle S\rangle = ${2 * S}$ W/m².`);
    },
  ]);

  // ---------------------------------------------------------------- drill C: lossy media
  const DEL = [[1e-3, md`1\ \text{mm}`], [2e-3, md`2\ \text{mm}`], [0.5e-3, md`0.5\ \text{mm}`], [1e-4, md`0.1\ \text{mm}`], [1e-5, md`10\ \mu\text{m}`]];
  GENS.rf_sp_lossy = () => one([
    // loss tangent with omega eps0 = f/18e9
    () => {
      const Rt = pick([0.01, 0.1, 1, 10, 100, 1000]), er = pick([4, 9, 81]);
      const [fv, ft] = pick([[18e6, '18 MHz'], [180e6, '180 MHz'], [1.8e9, '1.8 GHz']]);
      const sig = Rt * fv * er / 18e9;
      const reg = Rt >= 100 ? 'a good conductor' : Rt <= 0.01 ? 'low loss' : Rt === 0.1 ? 'nearly low loss' : 'neither limit: use the exact formulas';
      return MC('Loss tangent in one line', md`A material has $\sigma = ${p(sig)}$ S/m and $\epsilon_r = ${er}$, at $f = ${ft}$. Its loss tangent $\sigma/\omega\epsilon$ is…`, md`$${p(Rt)}$`,
        [[md`$${r3(2 * Math.PI * Rt)}$`, md`That used $f$ where $\omega = 2\pi f$ belongs.`],
          [md`$${p(Rt * er)}$`, md`That used $\epsilon_0$ in place of $\epsilon = \epsilon_r\epsilon_0$.`],
          [md`$${p(1 / Rt)}$`, md`That is upside down: $\omega\epsilon/\sigma$.`],
          [md`$${r3(Rt / (36 * Math.PI))}$`, md`That took $\epsilon_0 = 10^{-9}$ and dropped the $\frac{1}{36\pi}$.`]],
        md`$\omega\epsilon = \epsilon_r f/(18\times10^9) = ${p(er * fv / 18e9)}$ S/m, so $\sigma/\omega\epsilon = ${p(Rt)}$: ${reg}.`);
    },
    // gamma of a good conductor from delta
    () => {
      const [d, dt] = pick(DEL), inv = 1 / d;
      return MC('γ of a good conductor', md`A wave enters a good conductor whose skin depth is $\delta = ${dt}$. Its propagation constant is…`, md`$\gamma = ${p(inv)}(1 + j)\ \text{m}^{-1}$`,
        [[md`$\gamma = ${p(inv)}\ \text{m}^{-1}$`, md`$\gamma$ of a good conductor has $\alpha = \beta$: its angle is $45°$.`],
          [md`$\gamma = j${p(inv)}\ \text{m}^{-1}$`, md`That is lossless: no decay at all. A good conductor has $\alpha = \beta$.`],
          [md`$\gamma = ${p(inv)}(1 + j2\pi)\ \text{m}^{-1}$`, md`$\beta = 1/\delta$. It is $\lambda$ that equals $2\pi\delta$.`],
          [md`$\gamma = ${r3(inv / Math.SQRT2)}(1 + j)\ \text{m}^{-1}$`, md`$\delta$ already contains the $\sqrt2$: $\delta = \sqrt{2/\omega\mu\sigma}$, so $\alpha = 1/\delta$ exactly.`],
          [md`$\gamma = ${p(d)}(1 + j)\ \text{m}^{-1}$`, md`That is upside down: $\alpha = 1/\delta$, not $\delta$.`]],
        md`$\alpha = \beta = 1/\delta = ${p(inv)}$ m⁻¹, so $\gamma = ${p(inv)}(1 + j)$ m⁻¹.`);
    },
    // eta of a good conductor
    () => {
      const sig = pick([1e6, 2e6, 5e6, 1e7]), [d, dt] = pick(DEL.slice(2)), X = 1 / (sig * d);
      return MC('η of a good conductor', md`A good conductor has $\sigma = ${p(sig)}$ S/m and skin depth $\delta = ${dt}$. Its intrinsic impedance is…`, md`$\eta = ${p(X)}(1 + j)\ \Omega$`,
        [[md`$\eta = ${p(X)}\ \Omega$`, md`$\tau = 45°$ in a good conductor: $\eta$ has equal real and imaginary parts.`],
          [md`$\eta = ${p(X)}(1 - j)\ \Omega$`, md`$H$ lags $E$, so $\eta = |\eta|e^{+j45°}$: the imaginary part is positive.`],
          [md`$\eta = j${p(X)}\ \Omega$`, md`$\tau$ is $45°$, never $90°$.`],
          [md`$\eta = ${p(sig * d)}(1 + j)\ \Omega$`, md`That is upside down: $\eta = \gamma/\sigma = (1 + j)/(\sigma\delta)$.`],
          [md`$\eta = ${r3(Math.SQRT2 * X)}\ \Omega$`, md`That is $|\eta|$ alone. $\eta$ is complex, with angle $45°$.`]],
        md`$\eta = \gamma/\sigma = (1 + j)/(\sigma\delta)$, and $\sigma\delta = ${p(sig * d)}$ S: $\eta = ${p(X)}(1 + j)\ \Omega$, $\tau = 45°$.`);
    },
    // field and power after k skin depths
    () => {
      const k = pick([1, 2, 3]), pw = pick([false, true]);
      const E = (x) => md`$e^{-${p(x)}} \approx ${r3(Math.exp(-x))}$`;
      const right = pw ? E(2 * k) : E(k);
      const wr = pw
        ? [[E(k), md`That is the field factor. Power goes as the field squared: $e^{-2k}$.`],
          [E(4 * k), md`That squares the power factor again.`],
          [md`$\tfrac{1}{${k * k}}$`, md`The decay is exponential, not an inverse square.`],
          [md`$e^{-${4 * k}\pi} \approx ${r3(Math.exp(-4 * k * Math.PI))}$`, md`That treats $\delta$ as a wavelength. $\delta$ is the $1/e$ depth of the field.`]]
        : [[E(2 * k), md`That is the power factor. The field falls as $e^{-z/\delta}$.`],
          [E(k / 2), md`That is the square root of the field factor.`],
          [md`$\tfrac{1}{${k}}$`, md`The decay is exponential, not one over the depth.`],
          [md`$e^{-${2 * k}\pi} \approx ${r3(Math.exp(-2 * k * Math.PI))}$`, md`That treats $\delta$ as a wavelength. $\delta$ is the $1/e$ depth of the field.`]];
      const kt = k === 1 ? 'one skin depth' : `${k} skin depths`;
      return MC('Skin depths', md`In a good conductor, ${kt} below the surface, the ${pw ? 'time-average power density' : 'field amplitude'} is what fraction of its value at the surface?`, right, wr,
        md`The field goes as $e^{-z/\delta}$ and the power as $e^{-2z/\delta}$. At $z = ${k}\delta$: ${pw ? md`$e^{-${2 * k}}$` : md`$e^{-${k}}$`}.`);
    },
    // low-loss alpha
    () => {
      const sig = pick([1e-4, 1e-3, 2e-3, 5e-3]), n = pick([1, 2, 3, 4]), eta = 120 * Math.PI / n, a = sig * eta / 2;
      const o = (x) => md`$${r3(x)}$ Np/m`;
      return MC('Low-loss α', md`A nonmagnetic material with $\epsilon_r = ${n * n}$ has $\sigma = ${p(sig)}$ S/m, and at the frequency of interest $\sigma/\omega\epsilon \ll 1$. Its $\alpha$ is about…`, o(a),
        [[o(2 * a), md`That drops the $\frac12$: $\alpha \approx \sigma\eta/2$.`],
          [o(sig * 60 * Math.PI), md`That uses $\eta_0$. The medium's $\eta$ is $120\pi/\sqrt{\epsilon_r}$.`],
          [o(sig / (2 * eta)), md`$\alpha \approx \sigma\eta/2$, not $\sigma/2\eta$. Check the units: $\sigma\eta$ is 1/m.`],
          [o(8.686 * a), md`That is the value in dB/m. The question asks for Np/m.`]],
        md`Low loss: $\alpha \approx \frac{\sigma}{2}\eta$ with $\eta = ${p(120 / n)}\pi\ \Omega$: $\alpha \approx (${p(sig / 2)})(${p(120 / n)}\pi) = ${r3(a)}$ Np/m.`);
    },
    // surface resistance
    () => {
      const sig = pick([1e6, 2e6, 5e6, 1e7]), [d, dt] = pick(DEL.slice(2)), X = 1 / (sig * d);
      return MC('Surface resistance', md`A good conductor has $\sigma = ${p(sig)}$ S/m and $\delta = ${dt}$. Its surface resistance $R_s$ is…`, md`$${p(X)}\ \Omega$`,
        [[md`$${r3(Math.SQRT2 * X)}\ \Omega$`, md`That is $|\eta| = \sqrt2/\sigma\delta$. $R_s$ is the real part of $\eta$.`],
          [md`$${p(sig * d)}\ \Omega$`, md`That is upside down: $R_s = 1/(\sigma\delta)$.`],
          [md`$${p(X / 2)}\ \Omega$`, md`The $\frac12$ belongs to the loss $\frac12R_s|\tilde J_s|^2$, not to $R_s$.`],
          [md`$${p(X)}(1 + j)\ \Omega$`, md`That is $\eta$ itself. A resistance is real: $R_s = \Re\{\eta\}$.`]],
        md`$R_s = \alpha/\sigma = 1/(\sigma\delta) = 1/${p(sig * d)} = ${p(X)}\ \Omega$.`);
    },
  ]);

  // ---------------------------------------------------------------- drill D: polarization
  const LAB = { R: 'right-handed circular', L: 'left-handed circular', lin: 'linear', eR: 'right-handed elliptical', eL: 'left-handed elliptical' };
  // a phasor a u + b e^{j phi} v traveling toward t*w, with u x v = w
  function polInfo(a, b, phi, u, v, w, t) {
    const sn = Math.round(Math.sin(phi * Math.PI / 180) * 1e9) / 1e9;
    if (sn === 0) return { kind: 'lin' };
    const ahead = sn < 0 ? [u, 1] : [v, 1], behind = sn < 0 ? [v, 1] : [u, 1];
    const rot = crs(ahead, behind), trav = [w, t];
    const hand = rot[1] === t ? 'R' : 'L';
    const circ = a === b && Math.abs(sn) === 1;
    return { kind: circ ? hand : 'e' + hand, hand, circ, ahead, behind, rot, trav };
  }
  const gapOf = (phi) => Math.abs(((phi + 540) % 360) - 180);
  function polCard(title, q, a, b, phi, u, v, w, t, solLead) {
    const I = polInfo(a, b, phi, u, v, w, t);
    const right = LAB[I.kind];
    const handLine = I.kind === 'lin' ? '' : md`$${hv(I.ahead)}$ is ahead, and $${hv(I.ahead)}\times${hv(I.behind)} = ${hv(I.rot)}$; the wave travels toward $${hv(I.trav)}$: ${I.hand === 'R' ? 'the same, so right-handed' : 'opposite, so left-handed'}.`;
    const wr = Object.keys(LAB).filter((kk) => kk !== I.kind).map((kk) => {
      let why;
      if (I.kind === 'lin') why = md`The components are ${gapOf(phi) === 0 ? 'in phase' : '$180°$ apart'}, so the tip moves back and forth on a line. A line has no hand.`;
      else if (kk === 'lin') why = md`Linear needs the components in phase or $180°$ apart. Here they are $${gapOf(phi)}°$ apart.`;
      else if ((kk === 'R' || kk === 'L') && !I.circ) why = a !== b ? md`Circular needs equal sizes; these are ${a} and ${b}.` : md`Circular needs exactly $90°$ between equal components; here the gap is $${gapOf(phi)}°$.`;
      else if ((kk === 'eR' || kk === 'eL') && I.circ) why = md`Equal sizes (${a} and ${b}) exactly $90°$ apart trace a circle.`;
      else why = (t < 0 ? md`That treats the wave as going toward $+\hat ${w}$. ` : '') + handLine;
      return [LAB[kk], why];
    });
    const typeLine = I.kind === 'lin' ? md`The components are ${gapOf(phi) === 0 ? 'in phase' : '$180°$ apart'}: linear.` : I.circ ? md`Equal sizes, $90°$ apart: circular.` : md`${a !== b ? 'Unequal sizes' : `A gap of $${gapOf(phi)}°$`}: elliptical.`;
    return MC(title, q, right, wr, `${solLead ? solLead + ' ' : ''}${typeLine} ${handLine}`);
  }
  const coefTx = (b, phi) => {
    const B = b === 1 ? '' : `${b}`;
    if (phi === 0) return `+ ${B}`;
    if (phi === 180) return `- ${B}`;
    if (phi === 90) return `+ j${B}`;
    if (phi === -90) return `- j${B}`;
    return `+ ${B}e^{${phi < 0 ? '-' : ''}j${Math.abs(phi)}°}`;
  };
  const HAND = { R: 'right-handed circular', L: 'left-handed circular' };

  GENS.rf_sp_pol = () => one([
    // type and hand from a phasor
    () => {
      const [u, v, w] = pick(TRI), t = pick([1, -1]);
      const [a, b, phi] = pick([[1, 1, 90], [1, 1, -90], [2, 2, 90], [3, 3, -90], [2, 2, 0], [1, 1, 180], [3, 4, 90], [1, 2, -90], [1, 1, 45], [2, 2, -60], [3, 3, 135]]);
      const q = md`$\tilde{\mathbf E} = (${a === 1 ? '' : a}\hat ${u} ${coefTx(b, phi)}\hat ${v})\,e^{${t > 0 ? '-' : '+'}j\beta ${w}}$. This wave is…`;
      return polCard('Type and hand from a phasor', q, a, b, phi, u, v, w, t, md`Travel: $e^{${t > 0 ? '-' : '+'}j\beta ${w}}$ goes toward $${hv([w, t])}$.`);
    },
    // type and hand from cosines and sines
    () => {
      const [u, v, w] = pick(TRI), t = pick([1, -1]);
      const A = pick([2, 3, 5]), B = pick([A, A, A + 1]);
      const th = md`\omega t ${sgn(t)} \beta ${w}`;
      const [vt, phi] = pick([[md`+ ${B}\sin(${th})`, -90], [md`- ${B}\sin(${th})`, 90], [md`+ ${B}\cos(${th} - 90°)`, -90], [md`+ ${B}\cos(${th} + 90°)`, 90],
        [md`- ${B}\cos(${th} - 90°)`, 90], [md`+ ${B}\cos(${th})`, 0], [md`- ${B}\cos(${th})`, 180]]);
      const q = md`$\mathbf E = ${A}\cos(${th})\,\hat ${u} ${vt}\,\hat ${v}$ V/m. This wave is…`;
      return polCard('Type and hand from the time domain', q, A, B, phi, u, v, w, t, md`Travel: toward $${hv([w, t])}$. Relative to the $\hat ${u}$ term, the $\hat ${v}$ term has phase $${phi}°$.`);
    },
    // flip rules
    () => {
      const base = pick([-1, 1]);                                  // x + base*j y, traveling +z: base -1 is RH
      const h0 = base < 0 ? 'R' : 'L', h1 = base < 0 ? 'L' : 'R';
      const jb = base < 0 ? '- j' : '+ j', jc = base < 0 ? '+ j' : '- j';
      const ch = pick([
        { tx: md`(\hat x ${jb}\hat y)\,e^{+j\beta z}`, d: 'the same pattern now travels toward $-z$', flip: true, r: 'Reversing the travel with the same pattern flips the hand.' },
        { tx: md`(-\hat x ${jb}\hat y)\,e^{-j\beta z}`, d: 'the $\\hat x$ component is negated', flip: true, r: 'Negating one component reverses ahead × behind.' },
        { tx: md`(-\hat x ${jc}\hat y)\,e^{-j\beta z}`, d: 'the whole phasor is multiplied by $-1$', flip: false, r: 'A common factor shifts both components by the same phase, so the order (and the hand) stays.' },
        { tx: md`(j\hat x ${base < 0 ? '+' : '-'} \hat y)\,e^{-j\beta z}`, d: 'the whole phasor is multiplied by $j$', flip: false, r: 'A common factor shifts both components by the same phase, so the order (and the hand) stays.' },
        { tx: md`(\hat x ${jc}\hat y)\,e^{-j\beta z}`, d: 'the $j$ is replaced by $-j$', flip: true, r: 'Changing the sign of $j$ swaps which component is ahead.' },
        { tx: md`(\hat x ${jc}\hat y)\,e^{+j\beta z}`, d: 'the $j$ changes sign and the travel reverses', flip: false, r: 'Two flips cancel: the swap of ahead and behind and the reversed travel.' },
      ]);
      const out = ch.flip ? h1 : h0;
      return MC('What flips the hand', md`$\tilde{\mathbf E} = (\hat x ${jb}\hat y)\,e^{-j\beta z}$ is ${HAND[h0]}. Now ${ch.d}: $\tilde{\mathbf E}' = ${ch.tx}$. The new wave is…`, HAND[out],
        [[HAND[out === 'R' ? 'L' : 'R'], ch.r],
          ['linear', md`The sizes stay equal and the gap stays $90°$: it is still circular.`],
          ['elliptical', md`Neither size changed and the gap is still $90°$: still circular.`],
          ['It depends on the frequency', md`The hand depends only on which component is ahead and on the travel direction.`]],
        md`${ch.r} So it is ${HAND[out]}.`);
    },
    // reflected and transmitted hands
    () => {
      const inc = pick(['R', 'L']), pec = pick([true, false]), ask = pec ? 'r' : pick(['r', 't']);
      const out = ask === 'r' ? (inc === 'R' ? 'L' : 'R') : inc;
      const med = pec ? 'a perfect conductor' : pick([md`glass with $\epsilon_r = 4$`, md`a dielectric with $\epsilon_r = 9$`]);
      const co = ask === 'r' ? md`$\Gamma$` : md`$\tau$`;
      return MC('Hands after a boundary', md`A ${HAND[inc]}ly polarized wave in air hits ${med} at normal incidence. The ${ask === 'r' ? 'reflected' : 'transmitted'} wave is…`, HAND[out],
        [[HAND[out === 'R' ? 'L' : 'R'], ask === 'r' ? md`$\Gamma$ multiplies both components by the same number, so the tip turns the same way in the plane. But the reflected wave travels the other way, which flips the hand.` : md`$\tau$ multiplies both components by the same number and the travel direction does not change, so the hand stays.`],
          ['linear', md`Both components are multiplied by the same ${co}, so they stay equal and $90°$ apart.`],
          ['elliptical', md`Both components get the same ${co}: equal sizes and a $90°$ gap survive.`],
          [`There is no ${ask === 'r' ? 'reflected' : 'transmitted'} wave`, pec ? md`A perfect conductor reflects everything: $|\Gamma| = 1$.` : md`$\eta$ changes at the boundary, so $\Gamma \neq 0$ and $\tau \neq 0$: both waves exist.`]],
        ask === 'r' ? md`A common factor $\Gamma$ keeps the rotation in the plane; the reversed travel flips the hand: ${HAND[out]}.` : md`A common factor $\tau$ and the same travel: the hand stays, ${HAND[out]}.`);
    },
    // current sheet antenna
    () => {
      const [u, v, w] = pick(TRI), c = pick([1, -1]), side = pick([1, -1]);
      const ahead = c < 0 ? [u, 1] : [v, 1], behind = c < 0 ? [v, 1] : [u, 1], rot = crs(ahead, behind);
      const hand = rot[1] === side ? 'R' : 'L';
      return MC('A current-sheet antenna', md`A current sheet in the plane $${w} = 0$ carries $\tilde{\mathbf J}_s = J_0(\hat ${u} ${c < 0 ? '-' : '+'} j\hat ${v})$ A/m. In the region $${w} ${side > 0 ? '>' : '<'} 0$ the radiated wave is…`, HAND[hand],
        [[HAND[hand === 'R' ? 'L' : 'R'], md`$\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s e^{-j\beta|${w}|}$ has the same pattern on both sides. $${hv(ahead)}\times${hv(behind)} = ${hv(rot)}$, and this side's wave travels toward $${hv([w, side])}$.`],
          ['linear', md`$\tilde{\mathbf E}$ copies the pattern of $\tilde{\mathbf J}_s$: equal components $90°$ apart, so circular.`],
          ['elliptical', md`The radiated components are equal and $90°$ apart, like the current's: circular.`],
          ['There is no wave on that side', md`A sheet radiates to both sides, half its power each way.`]],
        md`$\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s e^{-j\beta|${w}|}$. $${hv(ahead)}$ is ahead, $${hv(ahead)}\times${hv(behind)} = ${hv(rot)}$, and here the wave travels toward $${hv([w, side])}$: ${HAND[hand]}.`);
    },
    // power of a polarized wave
    () => {
      const [a, b] = pick([[3, 4], [1, 2], [6, 8], [5, 12], [2, 1], [4, 3]]), n = pick([1, 2]), jj = pick(['', 'j', '-j']);
      const B = b === 1 ? '' : b;
      const bt = jj === '' ? `+ ${B}` : jj === 'j' ? `+ j${B}` : `- j${B}`;
      const o = (c) => md`$${overPi(c)} \approx ${r3(c / Math.PI)}$ W/m²`;
      const k = n / 240;
      return MC('Power of any polarization', md`In a nonmagnetic medium with $\epsilon_r = ${n * n}$, $\tilde{\mathbf E} = (${a === 1 ? '' : a}\hat x ${bt}\hat y)\,e^{-j\beta z}$ V/m. Its $\langle S\rangle$ is…`, o((a * a + b * b) * k),
        [[o((a + b) * (a + b) * k), md`That adds the amplitudes first. The powers of the two components add: $(${a}^2 + ${b}^2)/2\eta$.`],
          [o(a * a * k), md`That keeps only the $\hat x$ component. Both carry power.`],
          [o((a * a + b * b) * 2 * k), md`That drops the $\frac12$ of the time average.`],
          [md`$0$`, md`A traveling wave of any polarization carries power. Only a standing wave carries none.`]],
        md`$\eta = ${n === 1 ? '120\\pi' : '60\\pi'}\ \Omega$: $\langle S\rangle = (${a}^2 + ${b}^2)/2\eta = ${a * a + b * b}/${n === 1 ? '240' : '120'}\pi = ${overPi((a * a + b * b) * k)}$ W/m².`);
    },
  ]);

  // ---------------------------------------------------------------- drill E: reflection and standing waves
  const ERS = [1, 2.25, 4, 9, 16];
  const medTx = (er) => (er === 1 ? 'air' : md`a dielectric with $\epsilon_r = ${p(er)}$`);
  const pair = () => { const e1 = pick(ERS); const e2 = pick(ERS.filter((e) => e !== e1)); return [e1, e2, Math.sqrt(e1), Math.sqrt(e2)]; };
  GENS.rf_sp_refl = () => one([
    // Gamma from eps_r
    () => {
      const [e1, e2, n1, n2] = pair(), Gm = (n1 - n2) / (n1 + n2);
      return MC('Γ from εr', md`A wave goes from ${medTx(e1)} into ${medTx(e2)} at normal incidence ($\mu = \mu_0$ in both). $\Gamma$ is…`, md`$${Fr(Gm)}$`,
        [[md`$${Fr(-Gm)}$`, md`That is $(n_2 - n_1)/(n_1 + n_2)$. Since $\eta \propto 1/n$, $\Gamma = (n_1 - n_2)/(n_1 + n_2)$.`],
          [md`$${Fr((e1 - e2) / (e1 + e2))}$`, md`That uses $\epsilon_r$ where $n = \sqrt{\epsilon_r}$ belongs.`],
          [md`$${Fr(1 + Gm)}$`, md`That is $\tau = 1 + \Gamma$.`],
          [md`$${Fr(Gm * Gm)}$`, md`That is $|\Gamma|^2$, the reflected power fraction.`]],
        md`$\Gamma = \frac{n_1 - n_2}{n_1 + n_2} = \frac{${p(n1)} - ${p(n2)}}{${p(n1)} + ${p(n2)}} = ${Fr(Gm)}$.`);
    },
    // tau
    () => {
      const [e1, e2, n1, n2] = pair(), Gm = (n1 - n2) / (n1 + n2);
      return MC('τ = 1 + Γ', md`A wave goes from ${medTx(e1)} into ${medTx(e2)} at normal incidence ($\mu = \mu_0$). The transmission coefficient $\tau = E_t/E_i$ is…`, md`$${Fr(1 + Gm)}$`,
        [[md`$${Fr(1 - Gm)}$`, md`That is $1 - \Gamma$, the ratio for $H$.`],
          [md`$${Fr(Gm)}$`, md`That is $\Gamma$, the reflected ratio.`],
          [md`$${Fr(1 - Gm * Gm)}$`, md`That is $1 - |\Gamma|^2$, the transmitted power fraction.`],
          [md`$1$`, md`$\tau = 1$ only when the two media match.`]],
        md`$\Gamma = ${Fr(Gm)}$, so $\tau = 1 + \Gamma = ${Fr(1 + Gm)}$.${1 + Gm > 1 ? ' More than 1 is fine: the power still splits as $|\\Gamma|^2$ and $1 - |\\Gamma|^2$.' : ''}`);
    },
    // power fractions
    () => {
      const [e1, e2, n1, n2] = pair(), Gm = (n1 - n2) / (n1 + n2), ask = pick(['r', 't']);
      const right = ask === 'r' ? Gm * Gm : 1 - Gm * Gm;
      const wr = ask === 'r'
        ? [[md`$${Fr(Math.abs(Gm))}$`, md`That is $|\Gamma|$, a field ratio. Power goes as the field squared.`],
          [md`$${Fr(1 - Gm * Gm)}$`, md`That is the transmitted fraction.`],
          [md`$${Fr((1 + Gm) * (1 + Gm))}$`, md`That is $\tau^2$, the square of the transmitted field ratio.`],
          [md`$${Fr(Gm)}$`, md`A power fraction cannot be negative. Square $\Gamma$.`]]
        : [[md`$${Fr((1 + Gm) * (1 + Gm))}$`, md`That is $\tau^2$. It misses the factor $\eta_1/\eta_2$.`],
          [md`$${Fr(1 - Math.abs(Gm))}$`, md`That is $1 - |\Gamma|$. Power goes as the field squared: $1 - |\Gamma|^2$.`],
          [md`$${Fr(Gm * Gm)}$`, md`That is the reflected fraction.`],
          [md`$${Fr(1 + Gm)}$`, md`That is $\tau$, a field ratio.`]];
      return MC('Power fractions', md`A wave goes from ${medTx(e1)} into ${medTx(e2)} at normal incidence. What fraction of the incident power is ${ask === 'r' ? 'reflected' : 'transmitted'}?`, md`$${Fr(right)}$`, wr,
        md`$\Gamma = ${Fr(Gm)}$, so $|\Gamma|^2 = ${Fr(Gm * Gm)}$ reflects and $1 - |\Gamma|^2 = ${Fr(1 - Gm * Gm)}$ goes through.`);
    },
    // nulls in front of a perfect conductor
    () => {
      const [fv, ft] = pick([[150e6, '150 MHz'], [300e6, '300 MHz'], [600e6, '600 MHz'], [1.5e9, '1.5 GHz'], [3e9, '3 GHz']]);
      const n = pick([1.5, 2, 3]), lam = 3e10 / (fv * n), lam0 = 3e10 / fv;
      const [ask, fr] = pick([[md`the spacing between neighboring nulls of $E$`, 0.5], [md`the distance from the wall to the nearest maximum of $|E|$`, 0.25],
        [md`the distance from the wall to the nearest null of $H$`, 0.25], [md`the spacing between neighboring maxima of $|H|$`, 0.5]]);
      const o = (x) => md`$${r3(x)}$ cm`;
      const wr = fr === 0.5
        ? [[o(lam), md`That is a full wavelength. $|\sin\beta z|$ and $|\cos\beta z|$ repeat every half wavelength.`],
          [o(lam / 4), md`That is the distance from a null to the nearest maximum. Neighbors of the same kind are $\lambda/2$ apart.`],
          [o(lam0 / 2), md`That uses the free-space wavelength. In the dielectric $\lambda = \lambda_0/\sqrt{\epsilon_r}$.`],
          [o(lam0), md`That is the free-space wavelength, and a full one. Use $\lambda/2$ with $\lambda = \lambda_0/\sqrt{\epsilon_r}$.`]]
        : [[o(lam / 2), md`That is the spacing of neighboring nulls. A maximum of one field sits halfway between two of its nulls.`],
          [o(lam), md`That is a full wavelength. The wall is a null of $E$ and a maximum of $H$; the next extreme is a quarter wave away.`],
          [o(lam0 / 4), md`That uses the free-space wavelength. In the dielectric $\lambda = \lambda_0/\sqrt{\epsilon_r}$.`],
          [o(lam / 8), md`That is half of a quarter wave. From a null, $\sin\beta z$ needs $\beta z = \pi/2$, a quarter wavelength, to reach its peak.`]];
      return MC('Nulls in front of a wall', md`A ${ft} plane wave in a nonmagnetic medium with $\epsilon_r = ${p(n * n)}$ hits a perfect conductor at normal incidence. In front of the wall, ${ask} is…`, o(lam * fr), wr,
        md`$\lambda = c/(f\sqrt{\epsilon_r}) = ${r3(lam)}$ cm. $E \propto \sin\beta z$ is zero at the wall and every $\lambda/2$; $H \propto \cos\beta z$ is largest there. Answer: $${fr === 0.5 ? '\\lambda/2' : '\\lambda/4'} = ${r3(lam * fr)}$ cm.`);
    },
    // envelope max, min and value at the boundary
    () => {
      const [e1, e2, n1, n2] = pair(), Gm = (n1 - n2) / (n1 + n2), aG = Math.abs(Gm);
      let q = 1; while (Math.abs(aG * q - Math.round(aG * q)) > 1e-9) q++;
      const E0 = q * pick([1, 2, 3]), mx = (1 + aG) * E0, mn = (1 - aG) * E0, wl = (1 + Gm) * E0;
      const ask = pick(['max', 'min', 'wall']);
      const val = { max: mx, min: mn, wall: wl }[ask];
      const o = (x) => md`$${p(+x.toPrecision(6))}$ V/m`;
      const askT = { max: md`The largest $|E|$ in the first medium`, min: md`The smallest $|E|$ in the first medium`, wall: md`The size of $E$ right at the boundary` }[ask];
      const all = [[o(mx), md`That is the largest value, $(1 + |\Gamma|)E_0$.`], [o(mn), md`That is the smallest value, $(1 - |\Gamma|)E_0$.`], [o(wl), md`That is the value at the boundary, $(1 + \Gamma)E_0$.`],
        [o(2 * E0), md`Only total reflection doubles the field. Here $|\Gamma| = ${Fr(aG)}$.`], [o(E0), md`That ignores the reflected wave.`]];
      return MC('The standing-wave envelope', md`A wave with $E_0 = ${E0}$ V/m in ${medTx(e1)} hits ${medTx(e2)} at normal incidence. ${askT} is…`, o(val),
        all.filter((x) => x[0] !== o(val)),
        md`$\Gamma = ${Fr(Gm)}$. $|E_1|$ swings between $(1 + |\Gamma|)E_0 = ${p(mx)}$ and $(1 - |\Gamma|)E_0 = ${p(mn)}$ V/m; at the boundary it is $(1 + \Gamma)E_0 = ${p(wl)}$ V/m, a ${Gm < 0 ? 'minimum' : 'maximum'}.`);
    },
    // radiation pressure
    () => {
      const S = pick([150, 300, 600, 1500, 3000]), mir = pick([true, false]), Pr = (mir ? 2 : 1) * S / 3e8;
      const o = (x) => md`$${p(+x.toPrecision(3))}$ Pa`;
      const wr = mir
        ? [[o(S / 3e8), md`That is an absorber. A mirror reverses the momentum, which doubles the push.`],
          [o(4 * S / 3e8), md`Reversing the momentum doubles the push once, not twice.`],
          [o(S / (2 * 3e8)), md`The factor 2 goes on top: the reversal doubles the push.`],
          [o(S / 9e16), md`That is the momentum density $\langle S\rangle/c^2$. It moves at $c$, so the momentum flux is $\langle S\rangle/c$.`]]
        : [[o(2 * S / 3e8), md`That is a mirror. An absorber only stops the momentum.`],
          [o(S / (2 * 3e8)), md`No $\frac12$ here: $\langle S\rangle$ is already the time average.`],
          [o(S * 3e8), md`Pressure is a power per area divided by a speed, not multiplied.`],
          [o(S / 9e16), md`That is the momentum density $\langle S\rangle/c^2$. It moves at $c$, so the momentum flux is $\langle S\rangle/c$.`]];
      return MC('Radiation pressure', md`A plane wave with $\langle S_i\rangle = ${S}$ W/m² falls normally on a perfect ${mir ? 'mirror' : 'absorber'}. The average pressure on it is…`, o(Pr), wr,
        md`${mir ? md`Mirror: $2\langle S_i\rangle/c = 2(${S})/(3\times10^8)$` : md`Absorber: $\langle S_i\rangle/c = ${S}/(3\times10^8)$`} $= ${p(+Pr.toPrecision(3))}$ Pa.`);
    },
    // the standing-wave form at a perfect conductor
    () => {
      const E0 = pick([2, 3, 5, 10]), m = pick([1, 2, 4]), askE = pick([true, false]);
      const bz = md`${m === 1 ? '' : m}\pi z`, Hc = overPi(2 * E0 / 120);
      const q = md`In air, $\mathbf E_i = ${E0}\cos(\omega t - ${bz})\,\hat x$ V/m travels toward a perfect conductor at $z = 0$ (the wave is in $z < 0$). The total ${askE ? '$\\mathbf E$' : '$\\mathbf H$'} in $z < 0$ is…`;
      if (askE) {
        return MC('Standing wave at a wall', q, md`$${2 * E0}\sin(${bz})\sin(\omega t)\,\hat x$ V/m`,
          [[md`$${2 * E0}\cos(${bz})\cos(\omega t)\,\hat x$ V/m`, md`That is the shape of $\eta\mathbf H$: largest at the wall. $E$ must be zero at a perfect conductor.`],
            [md`$${2 * E0}\sin(${bz})\cos(\omega t)\,\hat x$ V/m`, md`The phasor is $-2jE_0\sin\beta z$, and the $-j$ turns $\cos\omega t$ into $\sin\omega t$.`],
            [md`$-${2 * E0}\sin(${bz})\sin(\omega t)\,\hat x$ V/m`, md`Check the sign: $\Re\{-je^{j\omega t}\} = +\sin\omega t$.`],
            [md`$${2 * E0}\cos(\omega t - ${bz})\,\hat x$ V/m`, md`Doubling the incident wave leaves $E \neq 0$ at the wall. The reflection is $\Gamma = -1$.`]],
          md`$\tilde E_x = ${E0}(e^{-j${bz}} - e^{j${bz}}) = -j${2 * E0}\sin(${bz})$; times $e^{j\omega t}$, real part: $${2 * E0}\sin(${bz})\sin\omega t$.`);
      }
      return MC('Standing wave at a wall', q, md`$${Hc}\cos(${bz})\cos(\omega t)\,\hat y$ A/m`,
        [[md`$${Hc}\sin(${bz})\sin(\omega t)\,\hat y$ A/m`, md`That is the shape of $E$, zero at the wall. $H$ is largest at a perfect conductor.`],
          [md`$0$`, md`$H$ doubles at the wall; it is $E$ that vanishes.`],
          [md`$${overPi(E0 / 120)}\cos(\omega t - ${bz})\,\hat y$ A/m`, md`That is the incident $\mathbf H$ alone. The reflected $\mathbf H$ adds to it.`],
          [md`$-${Hc}\cos(${bz})\cos(\omega t)\,\hat y$ A/m`, md`Sign: the reflected $H$ carries two minus signs ($\Gamma = -1$ and the backward travel), so at the wall it adds to the incident $+\hat y$ field.`]],
        md`$\tilde H_y = \frac{${E0}}{120\pi}(e^{-j${bz}} + e^{j${bz}}) = ${Hc}\cos(${bz})$; times $e^{j\omega t}$, real part: $${Hc}\cos(${bz})\cos\omega t$.`);
    },
  ]);

  // ---------------------------------------------------------------- question bank, lesson 1
  EM.BANK['e3-speed'] = [
    Q(md`$\mathbf E = 2\cos(\omega t - \beta x)\,\hat y$ V/m in air. Which way does $\langle\mathbf S\rangle$ point?`,
      [md`$+\hat x$`, md`$+\hat y$`, md`$+\hat z$`, md`$-\hat x$`], 0,
      [null, md`That is the direction of $\mathbf E$. Power flows along the travel.`, md`That is the direction of $\mathbf H$: $\hat x\times\hat y = \hat z$.`, md`$\omega t - \beta x$ has opposite signs: the wave goes toward $+\hat x$.`],
      md`Opposite signs: travel toward $+\hat x$, and $\langle\mathbf S\rangle$ points along the travel.`),
    Q(md`The phasor $\tilde E_z = 5e^{+j3y}$ V/m in the time domain is…`,
      [md`$5\cos(\omega t + 3y)$ V/m`, md`$5\cos(\omega t - 3y)$ V/m`, md`$5\cos(3y)$ V/m`, md`$5\sin(\omega t + 3y)$ V/m`], 0,
      [null, md`The sign of the exponent carries over: $e^{+j3y}e^{j\omega t}$ has phase $\omega t + 3y$.`, md`That forgot $e^{j\omega t}$. A phasor alone has no time in it.`, md`No $j$ in front, so no shift to a sine.`],
      md`$\Re\{5e^{j3y}e^{j\omega t}\} = 5\cos(\omega t + 3y)$: a wave going toward $-\hat y$.`),
    Q(md`A nonmagnetic medium has $\beta = 3\beta_0$, where $\beta_0$ is the free-space value at the same frequency. Its $\epsilon_r$ is…`,
      ['9', '3', '1/9', '1/3'], 0,
      [null, md`That is $n = \sqrt{\epsilon_r} = \beta/\beta_0$. Square it.`, md`A larger $\beta$ means a slower wave and a larger $\epsilon_r$.`, md`That is upside down and unsquared.`],
      md`$\beta = \omega\sqrt{\mu_0\epsilon_r\epsilon_0} = \beta_0\sqrt{\epsilon_r}$, so $\sqrt{\epsilon_r} = 3$ and $\epsilon_r = 9$.`),
    Q(md`Which pair is right for a nonmagnetic medium with $\epsilon_r = 16$?`,
      [md`$\eta = 30\pi\ \Omega$, $v = 0.75\times10^8$ m/s`, md`$\eta = 7.5\pi\ \Omega$, $v = c/16$`, md`$\eta = 480\pi\ \Omega$, $v = c/4$`, md`$\eta = 30\pi\ \Omega$, $v = 4c$`], 0,
      [null, md`That divides by $\epsilon_r$. Both use $\sqrt{\epsilon_r} = 4$.`, md`A denser medium lowers $\eta$: divide by 4.`, md`Nothing in a dielectric outruns light: $v = c/4$.`],
      md`$\sqrt{16} = 4$: $\eta = 120\pi/4 = 30\pi\ \Omega$, $v = 3\times10^8/4 = 0.75\times10^8$ m/s.`),
    Q(md`$\tilde{\mathbf E} = (\hat x - j\hat y)\,e^{+j\beta z}$ is…`,
      ['left-handed circular', 'right-handed circular', 'linear', 'elliptical'], 0,
      [null, md`$\hat x\times\hat y = \hat z$, but $e^{+j\beta z}$ travels toward $-z$: the opposite, so left-handed.`, md`The components are $90°$ apart, not $0°$ or $180°$.`, md`Equal sizes, exactly $90°$ apart: circular.`],
      md`$\hat x$ (phase 0) is ahead of $\hat y$ (phase $-90°$). $\hat x\times\hat y = \hat z$, while the wave goes toward $-\hat z$: LHCP.`),
    Q(md`Which phasor is linearly polarized?`,
      [md`$(2\hat x - 3\hat y)\,e^{-j\beta z}$`, md`$(\hat x + j\hat y)\,e^{-j\beta z}$`, md`$(2\hat x + j3\hat y)\,e^{-j\beta z}$`, md`$(\hat x + e^{j45°}\hat y)\,e^{-j\beta z}$`], 0,
      [null, md`Equal sizes $90°$ apart: circular.`, md`$90°$ apart with unequal sizes: elliptical.`, md`A $45°$ gap: elliptical.`],
      md`$2\hat x - 3\hat y$: the components are $180°$ apart (a minus sign), so the tip stays on one line.`),
    Q(md`At every point of a wave, $H_y$ lags $E_x$ by $45°$. The medium is…`,
      ['a good conductor', 'a perfect dielectric', 'a low-loss dielectric', md`a medium with $\sigma/\omega\epsilon = 1$`], 0,
      [null, md`Then $E$ and $H$ would be in phase: $\tau = 0$.`, md`Low loss gives $\tau \approx \sigma/2\omega\epsilon$, a small angle.`, md`That gives $\tau = \frac12\tan^{-1}1 = 22.5°$.`],
      md`The lag is $\tau = \frac12\tan^{-1}(\sigma/\omega\epsilon)$, which reaches $45°$ only when $\sigma/\omega\epsilon \gg 1$.`),
    Q(md`A good conductor has $\delta = 0.5$ mm. Its $\alpha$ and $\beta$ are…`,
      [md`2000 Np/m and 2000 rad/m`, md`2000 Np/m and $4000\pi$ rad/m`, md`0.5 Np/m and 0.5 rad/m`, md`2000 Np/m and 0`], 0,
      [null, md`$\beta = 1/\delta$, the same as $\alpha$. It is $\lambda$ that equals $2\pi\delta$.`, md`That is $\delta$ in mm. Invert it, in meters.`, md`The wave still turns in phase: $\beta = \alpha$.`],
      md`$\alpha = \beta = 1/\delta = 1/(0.5\times10^{-3}) = 2000$ per meter.`),
    Q(md`A good conductor has $|\eta| = 0.02\sqrt2\ \Omega$. Then $\eta$ is…`,
      [md`$0.02(1 + j)\ \Omega$`, md`$0.02\sqrt2\ \Omega$`, md`$0.02(1 - j)\ \Omega$`, md`$j0.02\sqrt2\ \Omega$`], 0,
      [null, md`A good conductor has $\tau = 45°$, so $\eta$ is not real.`, md`The angle is $+45°$: $H$ lags $E$.`, md`$\tau$ is $45°$, not $90°$.`],
      md`$\eta = |\eta|e^{j45°} = 0.02\sqrt2\,(1 + j)/\sqrt2 = 0.02(1 + j)\ \Omega$.`),
    Q(md`The power density at the surface of a good conductor is 1 W/m². Three skin depths in, it is about…`,
      [md`0.0025 W/m²`, md`0.05 W/m²`, md`0.11 W/m²`, md`0.22 W/m²`], 0,
      [null, md`That is $e^{-3}$, the field factor. Power is $e^{-6}$.`, md`That is $1/9$: the decay is exponential, not an inverse square.`, md`That is $e^{-1.5}$: half the right exponent.`],
      md`$e^{-2\cdot3} = e^{-6} \approx 0.0025$.`),
    Q(md`A material has $\sigma = 0.01$ S/m and $\epsilon_r = 1$ at 18 MHz. Its loss tangent is…`,
      ['10', '62.8', '0.1', '0.088'], 0,
      [null, md`That uses $f$ for $\omega$.`, md`That is upside down: $\omega\epsilon/\sigma$.`, md`That drops the $\frac{1}{36\pi}$ in $\epsilon_0$.`],
      md`$\omega\epsilon_0 = f/(18\times10^9) = 10^{-3}$ S/m, so $\sigma/\omega\epsilon = 0.01/10^{-3} = 10$.`),
    Q(md`In a low-loss dielectric, which change doubles $\alpha$?`,
      ['doubling $\\sigma$', 'doubling the frequency', 'doubling $\\epsilon_r$', 'halving $\\sigma$'], 0,
      [null, md`$\alpha \approx \sigma\eta/2$ has no frequency in it.`, md`That lowers $\eta$ by $\sqrt2$, so $\alpha$ falls.`, md`That halves $\alpha$.`],
      md`$\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon}$: proportional to $\sigma$.`),
    Q(md`The same $\tilde{\mathbf E} = 3\hat x\,e^{-j\beta z}$ V/m in $\epsilon_r = 9$ and in air. The power density in the dielectric is…`,
      ['3 times larger', 'the same', '9 times larger', '3 times smaller'], 0,
      [null, md`$\langle S\rangle = E_0^2/2\eta$, and $\eta$ changes.`, md`$\eta \propto 1/\sqrt{\epsilon_r}$, not $1/\epsilon_r$.`, md`A smaller $\eta$ means more power for the same $E$.`],
      md`$\eta$ drops from $120\pi$ to $40\pi$, three times smaller, so $E_0^2/2\eta$ is three times larger.`),
    Q(md`A wave with $E_0 = 10$ V/m goes from air into $\epsilon_r = 4$. The transmitted amplitude is…`,
      [md`6.67 V/m`, md`3.33 V/m`, md`13.3 V/m`, md`10 V/m`], 0,
      [null, md`That is $|\Gamma|E_0$, the reflected amplitude.`, md`That uses $1 - \Gamma$. For $E$ it is $1 + \Gamma$.`, md`The boundary changes the field: $\tau = 2/3$.`],
      md`$\Gamma = (1 - 2)/(1 + 2) = -1/3$, $\tau = 2/3$, so $E_t = 6.67$ V/m.`),
    Q(md`A wave with $E_0 = 10$ V/m goes from $\epsilon_r = 4$ into air. The transmitted amplitude is…`,
      [md`13.3 V/m`, md`6.67 V/m`, md`10 V/m`, md`3.33 V/m`], 0,
      [null, md`That is the other direction. Here $\Gamma = +1/3$.`, md`$\tau$ can exceed 1: here it is $4/3$.`, md`That is $|\Gamma|E_0$.`],
      md`$\Gamma = (2 - 1)/(2 + 1) = 1/3$, $\tau = 4/3$, so $E_t = 13.3$ V/m. The power still splits $1/9$ and $8/9$.`),
    Q(md`What does $\tau > 1$ mean?`,
      ['The transmitted field is larger, but its medium has a larger $\\eta$, so it carries less power than the incident wave', 'It breaks energy conservation, so it never happens', 'It happens only at a perfect conductor', 'It happens only in lossy media'], 0,
      [null, md`Energy is power, and power has $1/\eta$ in it: $\tau^2\eta_1/\eta_2 = 1 - \Gamma^2 \le 1$.`, md`A perfect conductor has $\tau = 0$.`, md`It happens between lossless dielectrics, whenever $\eta_2 > \eta_1$.`],
      md`$\tau = 1 + \Gamma > 1$ whenever $\Gamma > 0$, that is $\eta_2 > \eta_1$.`),
    Q(md`A 300 MHz wave in air hits a perfect conductor. How far from the wall is the nearest maximum of $|E|$?`,
      ['25 cm', '0', '50 cm', '1 m'], 0,
      [null, md`At the wall $E = 0$; it is $H$ that peaks there.`, md`50 cm is the next null of $E$.`, md`1 m is a null too (every 50 cm).`],
      md`$\lambda = 1$ m. $|\sin\beta z|$ peaks a quarter wavelength from the wall: 25 cm.`),
    Q(md`$\mathbf E_i = E_0\cos(\omega t - \beta z)\,\hat x$ hits a perfect conductor at $z = 0$. At $t = 0$, in front of it…`,
      ['E is zero everywhere and H is at its peak everywhere', 'E is at its peak everywhere and H is zero', 'both are zero everywhere', 'both are at their peaks'], 0,
      [null, md`$E \propto \sin\omega t$, which is zero at $t = 0$.`, md`$H \propto \cos\omega t$, which is 1 at $t = 0$.`, md`They are $90°$ apart in time, so they never peak together.`],
      md`$E = 2E_0\sin\beta z\sin\omega t$ and $H = (2E_0/\eta)\cos\beta z\cos\omega t$. At $t = 0$ all the energy is magnetic.`),
    Q(md`Air into $\epsilon_r = 9$: the ratio $|E|_{\max}/|E|_{\min}$ in the air is…`,
      ['3', '2', '9', '1/3'], 0,
      [null, md`That is for $|\Gamma| = 1/3$.`, md`That is $\epsilon_r$. Use $|\Gamma| = 1/2$.`, md`Max over min is at least 1.`],
      md`$|\Gamma| = 1/2$: $(1 + 1/2)/(1 - 1/2) = 3$.`),
    Q(md`A wave with $E_0 = 3\times10^3$ V/m in air reflects from a perfect mirror. The average pressure is about…`,
      [md`$8\times10^{-5}$ Pa`, md`$4\times10^{-5}$ Pa`, md`$2.7\times10^{-8}$ Pa`, md`$1.6\times10^{-4}$ Pa`], 0,
      [null, md`That is $\epsilon_0E_0^2/2 = \langle S\rangle/c$, an absorber.`, md`That is $\epsilon_0E_0$: it forgot to square.`, md`That doubles twice.`],
      md`$2\langle S\rangle/c = \epsilon_0E_0^2 = \frac{10^{-9}}{36\pi}(9\times10^6) \approx 8\times10^{-5}$ Pa.`),
    Q(md`$\tilde{\mathbf E}_i = (\hat x + j\hat y)\,e^{-j\beta z}$ reflects from a perfect conductor at $z = 0$. The reflected wave is…`,
      [md`$-(\hat x + j\hat y)\,e^{+j\beta z}$, right-handed`, md`$-(\hat x + j\hat y)\,e^{+j\beta z}$, left-handed`, md`$(\hat x - j\hat y)\,e^{+j\beta z}$, left-handed`, md`$-(\hat x + j\hat y)\,e^{-j\beta z}$, left-handed`], 0,
      [null, md`The incident wave is left-handed; reversing the travel flips it to right-handed.`, md`$\Gamma = -1$ multiplies both components; it does not conjugate the $j$.`, md`The reflected wave travels toward $-z$: $e^{+j\beta z}$.`],
      md`$\hat y$ is ahead, $\hat y\times\hat x = -\hat z$: the incident wave (toward $+z$) is LHCP. The reflection is $\Gamma = -1$ times the same pattern going toward $-z$, where $-\hat z$ matches: RHCP.`),
    Q(md`$E_0(\hat x - j\hat y)e^{-j2\pi z}$ carries how much power compared with $E_0\hat x\,e^{-j2\pi z}$?`,
      ['twice as much', 'the same', md`$\sqrt2$ times as much`, 'four times as much'], 0,
      [null, md`The $\hat y$ part carries its own power.`, md`Powers add, and each is $E_0^2/2\eta$.`, md`That adds the fields in phase. They are $90°$ apart: add the powers.`],
      md`$\langle S\rangle = (|E_x|^2 + |E_y|^2)/2\eta = 2E_0^2/2\eta$.`),
    Q(md`A sheet at $x = 0$ carries $\tilde{\mathbf J}_s = J_0(\hat y + j\hat z)$. The wave in $x < 0$ is…`,
      ['right-handed circular', 'left-handed circular', 'linear', 'elliptical'], 0,
      [null, md`That is the $x > 0$ side. $\hat z\times\hat y = -\hat x$ matches the travel on the $x < 0$ side.`, md`Equal components $90°$ apart radiate a circle.`, md`The sizes are equal and the gap is $90°$.`],
      md`$\hat z$ (phase $+90°$) is ahead of $\hat y$. $\hat z\times\hat y = -\hat x$. In $x < 0$ the wave goes toward $-\hat x$: RHCP.`),
    Q(md`For a forward plus a backward wave in a lossless medium, the cross terms in $\tilde E\tilde H^*$…`,
      ['are purely imaginary, so they carry no average power', 'double the average power', 'are real and change with position', 'vanish only at the nulls'], 0,
      [null, md`Only $|E^+|^2 - |E^-|^2$ survives the real part.`, md`If they were real, the power would change with position with nothing absorbing it.`, md`They are imaginary at every point, not only at the nulls.`],
      md`The cross terms are $w^* - w = -2j\,\Im\{w\}$: imaginary, so $\langle S\rangle = (|E^+|^2 - |E^-|^2)/2\eta$.`),
  ];
  attachBank(L1);

  // ================================================================ LESSON 2: transmission lines
  // the bounce diagram for tricks 10 and 11: one line, l = 300 m, v = c/2 = 150 m/us, Vg = 90 V, Rg = 25, Z0 = 50, RL = 100
  const bounceFig = () => {
    const s = TL.solve({ Vg: 90, Rg: 25, RL: 100, sections: [{ Z0: 50, len: 300, v: 150 }], tMax: 7 });
    return TL.diagram(s, { tMax: 7, probe: 100, w: 380, h: 330, alt: 'Bounce diagram of a 300 m line: z across, t down. The waves are 60, 20, minus 20/3 and minus 20/9 volts. A dashed probe line at z = 100 m is crossed at 2/3, 10/3 and 14/3 microseconds.' });
  };

  const L2 = EM.lesson('e3-gymu', {
    id: 'e3-speed-tl', order: 2, kind: 'lesson', title: 'Speed tricks: transmission lines',
    sub: '27 tricks: L C Z₀ v, τg and Γ, bounces, steady state, scope traces, stubs, λ/4 and λ/2, Γ(d), VSWR',
    steps: [
      R(md`
        !!key How to use this page
          Same format as [the waves page](#/l/e3-speed): a rule, why it is true, a 10-second example, the trap. A drill closes each group. Two conventions, as on the formula sheet: in the time domain $z$ runs from the generator ($z = 0$) to the load ($z = l$); in phasors $d$ is the distance back from the load ($d = 0$ at the load).

        Three different taus appear in this course. Here only one does: $\tau_g = Z_0/(R_g + Z_0)$, the **injection coefficient**, the fraction of $V_g$ that the first wave carries. At a junction, $\tau = 1 + \Gamma$ is a **transmission coefficient**, like the one for waves at a boundary.

        ### A. Line constants: L, C, Z₀ and v

        Derived slowly in [Topic 13](#/l/w5-telegraph).

        !!method
          **1. LC = με: one of them gives the other**

          **Rule.** For any lossless TEM line, $LC = \mu\epsilon$ of the filling. Know $C$, and $L = \mu\epsilon/C$.

          **Why.** The telegrapher's equations give waves at $1/\sqrt{LC}$. The fields between the conductors are a TEM wave in the filling, which travels at $1/\sqrt{\mu\epsilon}$. They are the same wave, so $LC = \mu\epsilon$. In shape terms: $C = \epsilon\,\text{GF}$ and $L = \mu/\text{GF}$, where GF is the geometrical factor.

          **10-second example.** Prof. Chen's Spring 2024 Problem 3 gives the coax $C = 2\pi\epsilon/\ln(b/a)$. Then $L = \mu\epsilon/C = \frac{\mu}{2\pi}\ln\frac ba$.

          **Trap.** Copying the shape of $C$ into $L$. The geometry factor sits on top in $C$ and underneath in $L$.

        !!method
          **2. Z₀ = η/GF: the filling's impedance times a shape factor**

          **Rule.** $Z_0 = \eta/\text{GF}$. Parallel plates (width $w$, gap $d$): $Z_0 = \eta\,d/w$. Coax: $Z_0 = \frac{\eta}{2\pi}\ln\frac ba$.

          **Why.**
          $$Z_0 = \sqrt{\frac LC} = \sqrt{\frac{\mu/\text{GF}}{\epsilon\,\text{GF}}} = \frac{\eta}{\text{GF}}$$
          For plates $\text{GF} = w/d$; for a coax $\text{GF} = 2\pi/\ln(b/a)$.

          **10-second example.** An air coax with $\ln(b/a) = 1$: $Z_0 = 120\pi/2\pi = 60\ \Omega$. Fill it with $\epsilon_r = 4$: $\eta$ halves, so $30\ \Omega$.

          **Trap.** Multiplying by GF instead of dividing. A wider strip (larger $w/d$) means more capacitance and a lower $Z_0$.

        !!method
          **3. Z₀ and v from L and C**

          **Rule.** $Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$.

          **Why.** These are the two combinations of $L$ and $C$ that the telegrapher's equations produce: the ratio $V^+/I^+$ and the wave speed.

          **10-second example.** $L = 250$ nH/m, $C = 100$ pF/m: $L/C = 2500\ \Omega^2$, so $Z_0 = 50\ \Omega$. $LC = 2.5\times10^{-17}$ s²/m², whose root is $5\times10^{-9}$, so $v = 2\times10^8$ m/s.

          **Trap.** Prefixes: n is $10^{-9}$ and p is $10^{-12}$. Dropping them makes $\sqrt{L/C}$ off by $\sqrt{1000}$.

        !!method
          **4. Backward: L = Z₀/v and C = 1/(Z₀v)**

          **Rule.** Given $Z_0$ and $v$: $L = Z_0/v$ and $C = 1/(Z_0v)$.

          **Why.** Divide and multiply the two formulas of trick 3:
          $$\frac{Z_0}{v} = \sqrt{\frac LC}\sqrt{LC} = L$$
          $$Z_0v = \sqrt{\frac LC}\frac{1}{\sqrt{LC}} = \frac1C$$

          **10-second example.** $50\ \Omega$ and $2\times10^8$ m/s: $L = 50/(2\times10^8) = 250$ nH/m and $C = 1/(10^{10}) = 100$ pF/m.

          **Trap.** $L = Z_0v$. Check the units: an inductance per meter is ohm-seconds per meter, so divide by a speed.
      `),
      Q(md`**Predict.** A coax with $\ln(b/a) = 1.5$ is filled with a nonmagnetic dielectric of $\epsilon_r = 4$. Its $Z_0$ is…`,
        [md`$45\ \Omega$`, md`$90\ \Omega$`, md`$283\ \Omega$`, md`$20\ \Omega$`], 0,
        [null, md`That uses $\eta_0$: it would be the air-filled value. The filling halves $\eta$.`, md`That is $\eta\ln(b/a)$: it forgot the $2\pi$.`, md`That divides by $\ln(b/a)$. The log goes on top in $Z_0$ (and in $L$); it is $C$ that has it below.`],
        md`$\eta = 120\pi/2 = 60\pi\ \Omega$, so $Z_0 = \frac{60\pi}{2\pi}(1.5) = 30(1.5) = 45\ \Omega$.`),
      R(md`**Drill A: line constants.**`),
      Object.assign(G('rf_sp_lc', { need: 8 }), { id: 'e3-speed-tl.r1' }),
      R(md`
        ### B. Launching and reflecting

        Derived slowly in [Topic 14](#/l/w5-launch) and [Topic 16](#/l/w5-multi).

        !!method
          **5. τg = Z₀/(Rg + Z₀): a voltage divider, not 1 + Γg**

          **Rule.** The first wave is $V^+ = \tau_gV_g$ with $\tau_g = Z_0/(R_g + Z_0)$.

          **Why.** When the step starts, the wave has not reached the load yet, so the source cannot know $R_L$. On a single wave $V^+ = Z_0I^+$: the line looks like a resistor $Z_0$. A resistor $Z_0$ in series with $R_g$ takes the share $Z_0/(R_g + Z_0)$ of $V_g$.

          **10-second example.** Spring 2024 Problem 4: $R_g = 50\ \Omega$ and $Z_{01} = 150\ \Omega$, so $\tau_g = 150/200 = 3/4$, and 80 V launches 60 V.

          **Trap.** $1 + \Gamma_g = 2R_g/(R_g + Z_0)$ is a different number (here $1/2$). The 2025 review session wrote it in red: $\tau_g \neq 1 + \Gamma_g$.

        !!method
          **6. Γ = (r − 1)/(r + 1), with r = R/Z₀**

          **Rule.** Divide the resistance by $Z_0$ first. Then $\Gamma = (r - 1)/(r + 1)$.

          | $r = R/Z_0$ | 2 | 3 | 9 | 1/2 | 1/3 | 0 | ∞ |
          |---|---|---|---|---|---|---|---|
          | $\Gamma$ | 1/3 | 1/2 | 4/5 | −1/3 | −1/2 | −1 | +1 |

          **Why.** Divide the top and bottom of $(R - Z_0)/(R + Z_0)$ by $Z_0$. Replacing $r$ by $1/r$ flips the sign of $\Gamma$. The same rule gives $\Gamma_g$ with $r = R_g/Z_0$.

          **10-second example.** 150 Ω on a 50 Ω line: $r = 3$, $\Gamma = 1/2$. 25 Ω on 75 Ω: $r = 1/3$, $\Gamma = -1/2$.

          **Trap.** $(Z_0 - R)/(Z_0 + R)$: the right size, the wrong sign.

        !!method
          **7. Current reflects with −Γ**

          **Rule.** If the voltage reflection coefficient is $\Gamma$, the current wave reflects with $-\Gamma$.

          **Why.** A backward wave has $I^- = -V^-/Z_0$: its current flows the other way for the same voltage sign. So $I^-/I^+ = -V^-/V^+ = -\Gamma$.

          **10-second example.** An open end, $\Gamma = +1$: the current reflects with $-1$, so the total current there is $I^+ - I^+ = 0$, as an open end requires.

          **Trap.** Drawing the current bounce diagram with $+\Gamma$.

        !!method
          **8. At a junction: Γ = (Z₀₂ − Z₀₁)/(Z₀₂ + Z₀₁) and τ = 1 + Γ**

          **Rule.** An arriving wave sees the next line as a resistor of its $Z_0$. Lines or loads in parallel combine first. The transmitted voltage is $(1 + \Gamma)$ times the arriving wave.

          **Why.** Until reflections come back from beyond the junction, line 2 carries a single forward wave, with $V = Z_{02}I$. So the junction is a load of $Z_{02}$. The voltage is continuous across it: arriving + reflected = transmitted, so $\tau = 1 + \Gamma$.

          **10-second example.** Spring 2024: a 60 V wave on the 150 Ω line meets the 50 Ω line. $\Gamma = (50 - 150)/200 = -1/2$, so $-30$ V reflects and $30$ V goes on. Two 100 Ω lines in parallel at the end of a 50 Ω line look like 50 Ω: nothing reflects.

          **Trap.** Using $1 - \Gamma$ (that is the ratio for current), or forgetting to combine parallel branches.

        !!method
          **9. The first voltage at the load: τgVg(1 + ΓL)**

          **Rule.** When the first wave reaches the load, the load voltage jumps to $\tau_gV_g(1 + \Gamma_L)$.

          **Why.** At the load the arriving wave and its reflection exist at the same instant, so the voltage there is their sum, $V^+ + \Gamma_LV^+$.

          **10-second example.** $\tau_gV_g = 60$ V and $\Gamma_L = 1/3$: the load jumps to 80 V.

          **Trap.** Plotting 60 V at the load. Only points before the load see the incident wave alone.
      `),
      Q(md`**Predict.** A 60 V step wave on a 150 Ω line reaches a junction with a 50 Ω line (Spring 2024, Problem 4). The wave launched onto the 50 Ω line is…`,
        [md`$30$ V`, md`$90$ V`, md`$-30$ V`, md`$20$ V`], 0,
        [null, md`That uses $1 - \Gamma = 3/2$, the ratio for current.`, md`That is the reflected wave, $\Gamma\times60$.`, md`That uses $Z_{02}/Z_{01} = 1/3$. The impedance ratio is not the transmission coefficient.`],
        md`$\Gamma = (50 - 150)/(50 + 150) = -1/2$, so $\tau = 1 + \Gamma = 1/2$ and $30$ V goes on. Check: $60 + (-30) = 30$ V on both sides of the junction ✓.`),
      R(md`**Drill B: launching and reflecting.**`),
      Object.assign(G('rf_sp_launch', { need: 8 }), { id: 'e3-speed-tl.r2' }),
      RF(md`
        ### C. Bounce diagrams, fast

        Derived slowly in [Topic 15](#/l/w5-bounce) and [Topic 16](#/l/w5-multi).

        !!method
          **10. When the k-th front passes a point**

          **Rule.** With $T = l/v$: forward fronts pass $z$ at $z/v + 2nT$; backward fronts at $(2l - z)/v + 2nT$, for $n = 0, 1, 2, \ldots$

          **Why.** A forward front has made $n$ full round trips ($2l$ each) and then traveled $z$. A backward front went all the way to the load ($l$) and came back $l - z$, plus round trips.

          **10-second example.** In the figure, $l = 300$ m and $v = c/2 = 150$ m/µs, so $T = 2$ µs. At $z = 100$ m the fronts pass at $2/3$, $10/3$ and $14/3$ µs (the dots on the dashed line).

          **Trap.** Forgetting the $(2l - z)$ path: the second front at $z$ does not come at $2T + z/v$.

        [[fig:bounce]]

        !!method
          **11. Each new wave is the last one times the next Γ**

          **Rule.** The waves are $\tau_gV_g$, then $\times\Gamma_L$, then $\times\Gamma_g$, then $\times\Gamma_L$, and so on. For a step input, the voltage at a point is the sum of every wave that has passed it.

          **Why.** Each reflection multiplies the wave that arrives by that end's $\Gamma$. A step never switches off, so each wave adds a permanent step on top of what is there.

          **10-second example.** The figure: $\tau_gV_g = 60$ V, $\Gamma_L = 1/3$, $\Gamma_g = -1/3$. The waves are $60$, $20$, $-20/3$, $-20/9$ V. At $z = 100$ m the voltage is 60, then 80, then $73.3$ V; it heads for the DC value, 72 V.

          **Trap.** Writing only the newest wave as the voltage. That is the delta-input answer (trick 12).

        !!method
          **12. A step adds up; a delta does not**

          **Rule.** For $V_gu(t)$ the voltage at a point is a staircase of running sums. For $V_g\delta(t)$ each passing wave is a separate spike whose area is that wave's amplitude. A pulse of width $w$ is a step minus the same step delayed by $w$.

          **Why.** The line is linear and time-invariant, and $\delta(t)$ is the derivative of $u(t)$. Differentiating a staircase leaves a spike at each riser, with the height of that riser.

          **10-second example.** The review-session line: $Z_0 = 100\ \Omega$, $R_g = 50\ \Omega$, $R_L = 25\ \Omega$, so $\tau_g = 2/3$, $\Gamma_g = -1/3$, $\Gamma_L = -3/5$. With $50\delta(t)$, the middle of the line sees spikes of area $33.3$, $-20$, $+6.67$ (in V·s). With $50u(t)$ it steps to $33.3$, $13.3$, $20$ V, on its way to $50/3 = 16.7$ V.

          **Trap.** Adding up the spikes of a delta input.

        !!method
          **13. A matched end stops the bouncing**

          **Rule.** $R_L = Z_0$: nothing reflects, and the line is final at $T$. $R_g = Z_0$: the first reflection is absorbed when it returns, and the line is final at $2T$.

          **Why.** A matched end has $\Gamma = 0$, so the wave that reaches it creates no new wave.

          **10-second example.** $R_g = Z_0 = 50\ \Omega$, $R_L = 150\ \Omega$: $V$ is $V_g/2$, and after the load's reflection ($\Gamma_L = 1/2$) it is $\frac{V_g}{2}\cdot\frac32 = \frac34V_g$, which equals the DC value $V_g\cdot150/200$ ✓.

          **Trap.** Drawing more bounces after a matched end.

        !!method
          **14. Reading a scope trace backward**

          **Rule.** At the input: the first step $V_1 = \tau_gV_g$ gives $Z_0 = R_gV_1/(V_g - V_1)$. The time of the next step, $2T$, gives $l = vT$. Its size, $\Gamma_LV_1(1 + \Gamma_g)$, gives $\Gamma_L$.

          **Why.** Solve $V_1 = V_gZ_0/(R_g + Z_0)$ for $Z_0$. The returning wave $\Gamma_LV_1$ reaches the input together with its own re-reflection $\Gamma_g\Gamma_LV_1$, so the input changes by their sum.

          **10-second example.** $V_g = 10$ V, $R_g = 50\ \Omega$. The input jumps to 6 V, then at 2 µs by another 1.2 V. So $Z_0 = 50(6)/4 = 75\ \Omega$ and $\Gamma_g = -1/5$. Then $1.2 = \Gamma_L(6)(4/5)$ gives $\Gamma_L = 1/4$ and $R_L = 75\cdot\frac{5/4}{3/4} = 125\ \Omega$. With $v = 2\times10^8$ m/s, $T = 1$ µs and $l = 200$ m.

          **Trap.** Forgetting the factor $(1 + \Gamma_g)$, which would give $\Gamma_L = 1/5$.
      `, { bounce: { svg: bounceFig(), cap: 'One line: $V_g = 90$ V step, $R_g = 25\\ \\Omega$, $Z_0 = 50\\ \\Omega$, $R_L = 100\\ \\Omega$, $l = 300$ m, $v = c/2$. Time runs down; the dashed line is $z = 100$ m.' } }),
      Q(md`**Predict.** In the line of the figure, what is $V$ at $z = 100$ m at $t = 4$ µs?`,
        [md`$80$ V`, md`$60$ V`, md`$73.3$ V`, md`$20$ V`], 0,
        [null, md`That misses the reflected wave, which passed $z = 100$ m at $10/3$ µs.`, md`That includes the wave that passes at $14/3$ µs, after $t = 4$ µs.`, md`That is the newest wave alone. For a step, the waves add.`],
        md`By $t = 4$ µs two fronts have passed $z = 100$ m: $60$ V at $2/3$ µs and $+20$ V at $10/3$ µs. The third arrives at $14/3$ µs. So $V = 80$ V.`),
      R(md`**Drill C: bounces.** Arrival times, running sums, deltas, matched ends, the load at $3T$.`),
      Object.assign(G('rf_sp_bounce', { need: 8 }), { id: 'e3-speed-tl.r3' }),
      R(md`
        ### D. Steady state and the scope trace

        Derived slowly in [Topic 14](#/l/w5-launch).

        !!method
          **15. Steady state from the DC circuit: the line is a wire**

          **Rule.** After the bouncing dies out, a lossless line is just two wires: $V_\infty = V_gR_L/(R_g + R_L)$ and $I_\infty = V_g/(R_g + R_L)$, everywhere on the line.

          **Why.** Add every wave that reaches the load. Each round trip multiplies by $\Gamma_g\Gamma_L$, and $\sum x^n = 1/(1 - x)$:
          $$V_\infty = \frac{\tau_gV_g(1 + \Gamma_L)}{1 - \Gamma_g\Gamma_L}$$
          Put in the three coefficients. Over the common denominator $(R_g + Z_0)(R_L + Z_0)$:
          $$1 - \Gamma_g\Gamma_L = \frac{2Z_0(R_g + R_L)}{(R_g + Z_0)(R_L + Z_0)}$$
          and $\tau_g(1 + \Gamma_L) = 2Z_0R_L/[(R_g + Z_0)(R_L + Z_0)]$. Divide: the $Z_0$'s cancel and $V_\infty = V_gR_L/(R_g + R_L)$.

          **10-second example.** Spring 2024 Problem 4c: $V_g = 80$ V, $R_g = 50\ \Omega$, $R_L = 50\ \Omega$, two lines in between: $I_\infty = 80/100 = 0.8$ A everywhere, including $z = l/2$.

          **Trap.** Putting $Z_0$ into the DC circuit. $Z_0$ is not a resistance; at DC the line adds nothing.

        !!method
          **16. Open and shorted loads at DC**

          **Rule.** Open load: $V_\infty = V_g$ and $I_\infty = 0$. Shorted load: $V_\infty = 0$ and $I_\infty = V_g/R_g$.

          **Why.** Trick 15 with $R_L \to \infty$ or $R_L = 0$.

          **10-second example.** $V_g = 12$ V, $R_g = 60\ \Omega$, shorted end: $0.2$ A. The first current wave was only $12/(60 + 50) = 0.109$ A on a 50 Ω line; the bounces build it up.

          **Trap.** Giving the first wave, $V_g/(R_g + Z_0)$, as the final current.
      `),
      Q(md`**Predict.** Spring 2024 Problem 4 again: $V_g = 80u(t)$ V, $R_g = 50\ \Omega$, a 150 Ω line then a 50 Ω line, $R_L = 50\ \Omega$. The DC steady-state current at $z = l/2$ is…`,
        [md`$0.8$ A`, md`$0.4$ A`, md`$1.6$ A`, md`$0.53$ A`], 0,
        [null, md`That is the first current wave on the 150 Ω line, $80/(50 + 150)$.`, md`That is $V_g/R_g$, as if the load were a short.`, md`That is $80/150$: it treats $Z_{01}$ as a resistance.`],
        md`At DC the two lines are wires: $I = 80/(50 + 50) = 0.8$ A, the same at every $z$. (The posted key gets 0.8 A too.)`),
      R(md`**Drill D: steady state and scope traces.**`),
      Object.assign(G('rf_sp_ss', { need: 8 }), { id: 'e3-speed-tl.r4' }),
      R(md`
        ### E. Stubs and quarter- and half-wave lines

        Derived slowly in [Topic 18](#/l/w6-stubs) and [Topic 19](#/l/w6-qw).

        !!method
          **17. A half-wave line repeats its load: Z(λ/2) = Z_L**

          **Rule.** Any lossless line $\lambda/2$ long (or a multiple) shows its load unchanged, whatever its $Z_0$.

          **Why.** $Z(d)$ depends only on $\Gamma(d) = \Gamma_Le^{-j2\beta d}$, and at $d = \lambda/2$, $2\beta d = 2\pi$: $\Gamma(d) = \Gamma_L$.

          **10-second example.** A 100 Ω load behind $\lambda/2$ of 75 Ω line: the input is 100 Ω.

          **Trap.** Inverting it. Inversion is the quarter wave.

        !!method
          **18. A quarter-wave line inverts: Z(λ/4) = Z₀²/Z_L**

          **Rule.** $Z_\text{in} = Z_0^2/Z_L$. To make $R_L$ look like $R_\text{in}$, use $Z_0 = \sqrt{R_\text{in}R_L}$.

          **Why.** At $d = \lambda/4$, $2\beta d = \pi$, so $\Gamma(d) = -\Gamma_L$. The normalized impedance $z = (1 + \Gamma)/(1 - \Gamma)$ becomes $(1 - \Gamma_L)/(1 + \Gamma_L) = 1/z_L$. So $Z_\text{in} = Z_0\cdot Z_0/Z_L$.

          **10-second example.** $Z_0 = 50\ \Omega$, $Z_L = 100\ \Omega$: $25\ \Omega$. To match 200 Ω to 50 Ω: $Z_0 = \sqrt{50\cdot200} = 100\ \Omega$.

          **Trap.** The average, $(50 + 200)/2 = 125\ \Omega$. The match needs the geometric mean.

        !!method
          **19. Stubs at λ/8: a short gives +jZ₀, an open gives −jZ₀**

          **Rule.** Shorted stub: $Z = jZ_0\tan\beta d$. Open stub: $Z = -jZ_0\cot\beta d$. At $d = \lambda/8$, $\beta d = 45°$, so they are $+jZ_0$ and $-jZ_0$.

          **Why.** The formula sheet gives $Z(d) = jZ_0\tan\beta d$ for a short and $Y(d) = jY_0\tan\beta d$ for an open. Invert the second: $Z = 1/(jY_0\tan\beta d) = -jZ_0\cot\beta d$.

          **10-second example.** A 50 Ω shorted stub $\lambda/8$ long is $j50\ \Omega$, an inductor; the open one is $-j50\ \Omega$, a capacitor.

          **Trap.** Swapping them. Think of the limits: a very short shorted stub is a tiny loop of wire (inductive); a very short open stub is two nearby plates (capacitive).

        !!method
          **20. Every λ/4 swaps short and open, and inductor and capacitor**

          **Rule.** A shorted stub is inductive below $\lambda/4$, open at $\lambda/4$, capacitive from $\lambda/4$ to $\lambda/2$, and shorted again at $\lambda/2$. An open stub does the same, a quarter wave out of step.

          **Why.** $\tan\beta d$ is positive for $0 < \beta d < 90°$, infinite at $90°$, negative from $90°$ to $180°$, and zero at $180°$. A quarter wave inverts (trick 18): a short becomes an open.

          **10-second example.** A shorted stub $0.3\lambda$ long: $\beta d = 108°$, $\tan < 0$: a capacitor.

          **Trap.** "Shorted means inductive." Only below a quarter wave.

        !!method
          **21. Stub resonances: f = v/4l and v/2l**

          **Rule.** A shorted stub of length $l$ looks open at $f = v/4l$ (and $3v/4l$, $5v/4l$, …) and looks shorted again at $f = v/2l$ (and its multiples). An open stub is the reverse.

          **Why.** It looks open when $l = \lambda/4, 3\lambda/4, \ldots$, that is when $f = (2n + 1)v/4l$; shorted when $l$ is a multiple of $\lambda/2$.

          **10-second example.** A shorted stub, $l = 0.5$ m, $v = 2\times10^8$ m/s: open at 100, 300, 500 MHz; shorted at 200, 400 MHz. Placed across a line, it is invisible at 100 MHz and shorts out 200 MHz: a filter.

          **Trap.** Using $c$ when the line has its own $v$.

        !!method
          **22. The input circuit: a divider with Z(l)**

          **Rule.** In steady state the source sees the line's input impedance: $\tilde V(l) = \tilde F\,\dfrac{Z(l)}{Z_g + Z(l)}$, as on the formula sheet.

          **Why.** At the input terminals, the whole line and its load behave like one impedance $Z(l)$. The source and $Z_g$ do not care what is behind it.

          **10-second example.** A 50 Ω source drives a quarter wave of 100 Ω line ending in 400 Ω. $Z(l) = 100^2/400 = 25\ \Omega$, so $\tilde V(l) = \tilde F\cdot25/75 = \tilde F/3$.

          **Trap.** Putting $Z_L$ into the divider.
      `),
      Q(md`**Predict.** A shorted 50 Ω stub is $\lambda/8$ long at 1 GHz, so it looks like $j50\ \Omega$. At 2 GHz it looks like…`,
        ['an open circuit', md`$j50\ \Omega$`, 'a short circuit', md`$-j50\ \Omega$`], 0,
        [null, md`The length in wavelengths doubled: it is now $\lambda/4$.`, md`A short repeats at $\lambda/2$; this stub is now $\lambda/4$.`, md`That is a $3\lambda/8$ shorted stub (or a $\lambda/8$ open one).`],
        md`Doubling $f$ halves $\lambda$, so the same stub is now $\lambda/4$ long: $\beta d = 90°$ and $\tan\beta d \to \infty$. A shorted quarter wave is an open circuit.`),
      R(md`**Drill E: stubs and transformers.**`),
      Object.assign(G('rf_sp_stub', { need: 8 }), { id: 'e3-speed-tl.r5' }),
      R(md`
        ### F. Γ(d), VSWR and power

        Derived slowly in [Topic 17](#/l/w6-vd).

        !!method
          **23. Γ(d) turns by 2βd: a full turn every λ/2**

          **Rule.** $\Gamma(d) = \Gamma_Le^{-j2\beta d}$. Its size never changes on a lossless line; its angle falls by $2\beta d = 720°\times d/\lambda$.

          **Why.** $\Gamma(d)$ is the backward wave over the forward wave at $d$: $\tilde V^-e^{-j\beta d}/(\tilde V^+e^{j\beta d})$. Moving back from the load delays one and advances the other, so the ratio turns by twice $\beta d$.

          **10-second example.** $\Gamma_L = 1/2$ at $d = \lambda/8$: $2\beta d = 90°$, so $\Gamma(d) = \frac12e^{-j90°} = -j/2$.

          **Trap.** Turning by $\beta d$ only.

        !!method
          **24. VSWR and |Γ|: (1 + |Γ|)/(1 − |Γ|) and back**

          **Rule.** $\text{VSWR} = (1 + |\Gamma|)/(1 - |\Gamma|)$ and $|\Gamma| = (\text{VSWR} - 1)/(\text{VSWR} + 1)$. Pairs to know: $1/3 \leftrightarrow 2$, $1/2 \leftrightarrow 3$, $3/5 \leftrightarrow 4$, $4/5 \leftrightarrow 9$.

          **Why.** $|\tilde V(d)| = |\tilde V^+|\,|1 + \Gamma(d)|$ swings between $|\tilde V^+|(1 + |\Gamma|)$ and $|\tilde V^+|(1 - |\Gamma|)$ as $\Gamma(d)$ turns. Their ratio is the VSWR. Solve it for $|\Gamma|$ to go back.

          **10-second example.** VSWR 3: $|\Gamma| = 2/4 = 1/2$.

          **Trap.** Using $\Gamma$ with its sign, which can give a "VSWR" below 1.

        !!method
          **25. Resistive load: VSWR = R_L/Z₀ (or Z₀/R_L), and where the maximum sits**

          **Rule.** For a resistive load the VSWR is $R_L/Z_0$ or $Z_0/R_L$, whichever is at least 1. If $R_L > Z_0$ the voltage is largest at the load; if $R_L < Z_0$ it is smallest there. The next extreme is $\lambda/4$ away. At a maximum $Z = \text{VSWR}\cdot Z_0$; at a minimum $Z = Z_0/\text{VSWR}$.

          **Why.** With $r = R_L/Z_0$, $\Gamma = (r - 1)/(r + 1)$ and $(1 + \Gamma)/(1 - \Gamma) = r$. At the load $|\tilde V| = |\tilde V^+|(1 + \Gamma)$: a maximum when $\Gamma > 0$.

          **10-second example.** 150 Ω on a 50 Ω line: VSWR 3, $V_\text{max}$ at the load, $V_\text{min}$ at $\lambda/4$ where $Z = 50/3 = 16.7\ \Omega$.

          **Trap.** Writing a VSWR of $1/3$. It is never below 1.

        !!method
          **26. Power delivered: |V⁺|²(1 − |Γ|²)/2Z₀**

          **Rule.** The load gets $\frac{|\tilde V^+|^2}{2Z_0}(1 - |\Gamma_L|^2)$.

          **Why.** The formula sheet: $P = |\tilde V^+|^2/2Z_0 - |\tilde V^-|^2/2Z_0$, with $|\tilde V^-| = |\Gamma_L||\tilde V^+|$. On a lossless line this is the same at every $d$.

          **10-second example.** $|\tilde V^+| = 10$ V on 50 Ω with $\Gamma_L = 1/3$: $\frac{100}{100}\cdot\frac89 = 0.889$ W.

          **Trap.** Using $1 - |\Gamma|$. Power goes as the voltage squared.
      `),
      Q(md`**Predict.** A 50 Ω line has VSWR 3 and a voltage minimum right at its resistive load. The load is…`,
        [md`$16.7\ \Omega$`, md`$150\ \Omega$`, md`$25\ \Omega$`, md`$100\ \Omega$`], 0,
        [null, md`That load would put a voltage maximum at the load ($R_L > Z_0$).`, md`$25\ \Omega$ gives $\Gamma = -1/3$ and VSWR 2.`, md`$100\ \Omega$ gives VSWR 2, with a maximum at the load.`],
        md`A minimum at the load means $R_L < Z_0$. Then $\text{VSWR} = Z_0/R_L = 3$, so $R_L = 50/3 = 16.7\ \Omega$.`),
      R(md`**Drill F: Γ(d), VSWR and power.**`),
      Object.assign(G('rf_sp_vswr', { need: 8 }), { id: 'e3-speed-tl.r6' }),
      R(md`
        ### The whole page on one card

        | Trick | Rule |
        |---|---|
        | $LC$ | $= \mu\epsilon$ |
        | $Z_0$ | $\eta/\text{GF}$: coax $\frac{\eta}{2\pi}\ln\frac ba$, plates $\eta\frac dw$ |
        | from $L$, $C$ | $Z_0 = \sqrt{L/C}$, $v = 1/\sqrt{LC}$ |
        | back | $L = Z_0/v$, $C = 1/Z_0v$ |
        | $\tau_g$ | $Z_0/(R_g + Z_0)$, not $1 + \Gamma_g$ |
        | $\Gamma$ | $(r - 1)/(r + 1)$, $r = R/Z_0$ |
        | current | reflects with $-\Gamma$ |
        | junction | $\Gamma = \frac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}}$, $\tau = 1 + \Gamma$ |
        | first at load | $\tau_gV_g(1 + \Gamma_L)$ |
        | arrivals at $z$ | $z/v + 2nT$, $(2l - z)/v + 2nT$ |
        | step | add every wave; delta: one spike each |
        | matched end | final at $T$ (load) or $2T$ (source) |
        | scope | $Z_0 = R_gV_1/(V_g - V_1)$ |
        | DC | $V_gR_L/(R_g + R_L)$ |
        | $\lambda/2$ | repeats $Z_L$ |
        | $\lambda/4$ | $Z_0^2/Z_L$; match with $\sqrt{R_\text{in}R_L}$ |
        | $\lambda/8$ | short $+jZ_0$, open $-jZ_0$ |
        | resonance | short opens at $v/4l$ |
        | $\Gamma(d)$ | turns by $2\beta d$ |
        | VSWR | $(1 + |\Gamma|)/(1 - |\Gamma|)$ |
        | power | $\frac{|V^+|^2}{2Z_0}(1 - |\Gamma|^2)$ |
      `),
      ...miniQuiz('e3-speed-tl'),
    ],
  });

  // ---------------------------------------------------------------- drill A: line constants
  const ZV = [[50, 2], [100, 2], [50, 1], [100, 1], [25, 2], [200, 1]];
  GENS.rf_sp_lc = () => one([
    // L and C to Z0 and v
    () => {
      const [Z0, v8] = pick(ZV), v = v8 * 1e8, L = Z0 / v, Cc = 1 / (Z0 * v);
      const LT = L >= 1e-6 ? md`${p(L * 1e6)}\ \mu\text{H/m}` : md`${p(L * 1e9)}\ \text{nH/m}`;
      const o = (z, vv) => md`$Z_0 = ${z}\ \Omega$, $v = ${vv}$ m/s`;
      const vR = md`${p(v8)}\times10^8`;
      return MC('Z₀ and v from L and C', md`A lossless line has $L = ${LT}$ and $C = ${p(Cc * 1e12)}\ \text{pF/m}$. Its $Z_0$ and $v$ are…`, o(p(Z0), vR),
        [[o(p(Z0 * Z0), vR), md`That is $L/C$. $Z_0 = \sqrt{L/C}$.`],
          [o(p(Z0), p(1 / v)), md`That is $\sqrt{LC} = 1/v$. The speed is $1/\sqrt{LC}$.`],
          [o(p(1 / Z0), vR), md`That is $\sqrt{C/L}$, upside down.`],
          [o(p(Z0), p(v * v)), md`That is $1/LC = v^2$. Take the square root.`]],
        md`$L/C = ${p(Z0 * Z0)}\ \Omega^2$, so $Z_0 = ${Z0}\ \Omega$. $LC = ${p(1 / (v * v))}$ s²/m², so $v = 1/\sqrt{LC} = ${vR}$ m/s.`);
    },
    // Z0 and v to L or C
    () => {
      const [Z0, v8] = pick(ZV), v = v8 * 1e8, askL = pick([true, false]), L = Z0 / v, Cc = 1 / (Z0 * v);
      const o = (x, u) => md`$${p(+x.toPrecision(3))}$ ${u}`;
      const q = md`A lossless line has $Z_0 = ${Z0}\ \Omega$ and $v = ${p(v8)}\times10^8$ m/s. Its ${askL ? 'inductance' : 'capacitance'} per meter is…`;
      if (askL) {
        return MC('L from Z₀ and v', q, o(L, 'H/m'),
          [[o(Cc, 'H/m'), md`That is $1/(Z_0v)$, which is $C$.`],
            [o(Z0 * v, 'H/m'), md`$Z_0v = \sqrt{L/C}/\sqrt{LC} = 1/C$. For $L$ divide: $L = Z_0/v$.`],
            [o(v / Z0, 'H/m'), md`That is upside down: $L = Z_0/v$.`],
            [o(Z0 / 3e8, 'H/m'), md`That uses $c$. This line's waves travel at $${p(v8)}\times10^8$ m/s.`]],
          md`$L = Z_0/v = ${Z0}/(${p(v8)}\times10^8) = ${p(+L.toPrecision(3))}$ H/m.`);
      }
      return MC('C from Z₀ and v', q, o(Cc, 'F/m'),
        [[o(L, 'F/m'), md`That is $Z_0/v$, which is $L$.`],
          [o(1 / (Z0 * 3e8), 'F/m'), md`That uses $c$. This line's waves travel at $${p(v8)}\times10^8$ m/s.`],
          [o(Z0 * v, 'F/m'), md`That is $1/C$. Invert it.`],
          [o(v / Z0, 'F/m'), md`$C = 1/(Z_0v)$: both go underneath.`]],
        md`$C = 1/(Z_0v) = 1/(${Z0}\times${p(v8)}\times10^8) = ${p(+Cc.toPrecision(3))}$ F/m.`);
    },
    // coax Z0
    () => {
      const n = pick([1, 1.5, 2, 3]), ln = pick([0.5, 1.5, 2, 3]), Z = 60 / n * ln;
      const o = (x) => md`$${r3(x)}\ \Omega$`;
      const etaT = n === 1 ? md`\eta = 120\pi\ \Omega` : md`\eta = 120\pi/${p(n)} = ${p(120 / n)}\pi\ \Omega`;
      return MC('Coax Z₀', md`A coaxial line has $\ln(b/a) = ${ln}$ and a nonmagnetic filling with $\epsilon_r = ${p(n * n)}$. Its $Z_0$ is…`, o(Z),
        [[o(60 * ln), md`That uses $\eta_0 = 120\pi$. The filling has $\eta = 120\pi/\sqrt{\epsilon_r}$.`],
          [o(120 * Math.PI / n * ln), md`That forgot the $2\pi$: $Z_0 = \frac{\eta}{2\pi}\ln\frac ba$.`],
          [o(60 / n * Math.exp(ln)), md`That uses $b/a$ where $\ln(b/a)$ belongs.`],
          [o(60 / n / ln), md`The log goes on top in $Z_0$ (and in $L$); it is $C$ that has it underneath.`],
          [o(60 * n * ln), md`That multiplies by $\sqrt{\epsilon_r}$. A denser filling lowers $Z_0$.`]],
        md`$${etaT}$, so $Z_0 = \frac{\eta}{2\pi}\ln\frac ba = ${p(60 / n)}\times${ln} = ${r3(Z)}\ \Omega$.`);
    },
    // L, Z0 or v from C, symbolic
    () => {
      const coax = pick([true, false]), ask = pick(['L', 'Z', 'v']);
      const askT = { L: md`inductance per meter $L$`, Z: md`characteristic impedance $Z_0$`, v: md`wave speed $v$` }[ask];
      const q = coax
        ? md`A coax (inner radius $a$, outer radius $b$, filled with $\epsilon$ and $\mu$) has $C = \frac{2\pi\epsilon}{\ln(b/a)}$ per meter. Its ${askT} is…`
        : md`A parallel-plate line (strip width $w$, gap $d$, filled with $\epsilon$ and $\mu$, fringing ignored) has $C = \epsilon w/d$ per meter. Its ${askT} is…`;
      const g = coax ? md`\frac{\ln(b/a)}{2\pi}` : md`\frac dw`, gi = coax ? md`\frac{2\pi}{\ln(b/a)}` : md`\frac wd`;
      const S = { L: md`$\mu${g}$`, Z: md`$\sqrt{\mu/\epsilon}\,${g}$`, v: md`$1/\sqrt{\mu\epsilon}$` };
      const wr = {
        L: [[md`$\mu${gi}$`, md`That copies the shape of $C$. $L$ and $C$ have reciprocal geometry factors, so that $LC = \mu\epsilon$.`],
          [md`$\epsilon${g}$`, md`An inductance carries $\mu$, not $\epsilon$.`],
          [S.Z, md`That is $Z_0 = \sqrt{L/C}$.`],
          [md`$\mu\epsilon${gi}$`, md`That is $\mu\epsilon$ times the shape of $C$, not divided by $C$. $L = \mu\epsilon/C$.`]],
        Z: [[md`$\sqrt{\mu/\epsilon}\,${gi}$`, md`That is $\eta\cdot\text{GF}$. $Z_0 = \eta/\text{GF}$.`],
          [S.L, md`That is $L$. $Z_0 = \sqrt{L/C}$.`],
          [md`$\sqrt{\epsilon/\mu}\,${g}$`, md`The root is upside down: $\eta = \sqrt{\mu/\epsilon}$.`],
          [md`$\mu\epsilon${g}$`, md`$Z_0 = \sqrt{L/C}$, and $L/C = (\mu/\epsilon)(${g})^2$: the root gives $\sqrt{\mu/\epsilon}$, not $\mu\epsilon$.`]],
        v: [[md`$\sqrt{\mu\epsilon}$`, md`That is $1/v$.`],
          [md`$${g}\big/\sqrt{\mu\epsilon}$`, md`The speed does not depend on the shape: $LC = \mu\epsilon$ for every TEM line.`],
          [md`$1/(\mu\epsilon)$`, md`That is $v^2$. Take the root.`],
          [md`$c$`, md`Only for a vacuum filling. This line is filled with $\epsilon$ and $\mu$.`]],
      };
      return MC('From C to L, Z₀ and v', q, S[ask], wr[ask],
        md`$LC = \mu\epsilon$ gives $L = \mu\epsilon/C = \mu${g}$. Then $Z_0 = \sqrt{L/C} = \sqrt{\mu/\epsilon}\,${g}$ and $v = 1/\sqrt{LC} = 1/\sqrt{\mu\epsilon}$.`);
    },
    // parallel-plate Z0, numbers
    () => {
      const n = pick([2, 3]), [d, w] = pick([[1, 10], [1, 4], [2, 4], [1, 5], [3, 12]]), dw = d / w, Z = 120 / n * dw;
      const o = (x) => md`$${p(+x.toPrecision(4))}\pi \approx ${r3(x * Math.PI)}\ \Omega$`;
      return MC('Parallel-plate Z₀', md`A parallel-plate line has gap $d = ${d}$ mm, strip width $w = ${w}$ mm (fringing ignored), and a nonmagnetic filling with $\epsilon_r = ${n * n}$. Its $Z_0$ is…`, o(Z),
        [[o(120 / n / dw), md`That is $\eta\,w/d$, upside down. A wider strip lowers $Z_0$.`],
          [o(120 * dw), md`That uses $\eta_0$. The filling has $\eta = 120\pi/\sqrt{\epsilon_r}$.`],
          [o(Z / (2 * Math.PI)), md`The $2\pi$ belongs to the coax. For plates $Z_0 = \eta\,d/w$.`],
          [o(120 / (n * n) * dw), md`That divides by $\epsilon_r$. $\eta$ has $\sqrt{\epsilon_r}$.`]],
        md`$\eta = 120\pi/${n} = ${p(120 / n)}\pi\ \Omega$, and $Z_0 = \eta\,d/w = ${p(120 / n)}\pi\times${Fr(dw)} = ${p(+Z.toPrecision(4))}\pi \approx ${r3(Z * Math.PI)}\ \Omega$.`);
    },
  ]);

  // ---------------------------------------------------------------- drill B: launching and reflecting
  const tgOf = (Rg, Z0) => Z0 / (Rg + Z0);
  const GOf = (R, Z0) => (R === Infinity ? 1 : (R - Z0) / (R + Z0));
  const V = (x) => md`$${p(+x.toPrecision(4))}$ V`;
  GENS.rf_sp_launch = () => one([
    // tau_g
    () => {
      const [Rg, Z0] = pick([[50, 150], [25, 75], [100, 50], [50, 100], [150, 50], [75, 25], [30, 90], [60, 30]]);
      const tg = tgOf(Rg, Z0), Gg = GOf(Rg, Z0);
      return MC('Injection coefficient', md`A source with $R_g = ${Rg}\ \Omega$ drives a line with $Z_0 = ${Z0}\ \Omega$. The injection coefficient $\tau_g$ is…`, md`$${Fr(tg)}$`,
        [[md`$${Fr(Rg / (Rg + Z0))}$`, md`That is the share across $R_g$. The line gets $Z_0/(R_g + Z_0)$.`],
          [md`$${Fr(1 + Gg)}$`, md`That is $1 + \Gamma_g = 2R_g/(R_g + Z_0)$. The review session's warning: $\tau_g \neq 1 + \Gamma_g$.`],
          [md`$${Fr(Gg)}$`, md`That is $\Gamma_g$, the generator's reflection coefficient.`],
          [md`$${Fr(Z0 / Rg)}$`, md`That is $Z_0/R_g$. The divider has $R_g + Z_0$ underneath.`],
          [md`$1$`, md`Only when $R_g = 0$.`]],
        md`$\tau_g = Z_0/(R_g + Z_0) = ${Z0}/${Rg + Z0} = ${Fr(tg)}$.`);
    },
    // the first wave
    () => {
      const [Vg, Rg, Z0, RL] = pick([[80, 50, 150, 50], [90, 25, 50, 100], [12, 100, 50, 25], [60, 50, 100, 300], [30, 50, 100, 25], [100, 75, 25, 50]]);
      const tg = tgOf(Rg, Z0);
      return MC('The first wave', md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${RL}\ \Omega$. The first voltage wave launched onto the line is…`, V(tg * Vg),
        [[V(Vg), md`Only when $R_g = 0$.`],
          [V(Vg / 2), md`Only when $R_g = Z_0$.`],
          [V(Vg * RL / (Rg + RL)), md`That is the final DC value. The first wave has not reached the load yet, so $R_L$ does not matter.`],
          [V(Vg * Rg / (Rg + Z0)), md`That is the drop across $R_g$.`]],
        md`$\tau_g = ${Z0}/${Rg + Z0} = ${Fr(tg)}$, so $V^+ = ${Fr(tg)}\times${Vg} = ${p(+(tg * Vg).toPrecision(4))}$ V.`);
    },
    // Gamma from R / Z0
    () => {
      const [R, Z0] = pick([[100, 50], [150, 50], [25, 50], [25, 75], [450, 50], [200, 50], [50, 200], [10, 90], [300, 100], [100, 300]]);
      const Gm = GOf(R, Z0);
      return MC('Γ from the ratio', md`A line with $Z_0 = ${Z0}\ \Omega$ ends in $R_L = ${R}\ \Omega$. $\Gamma_L$ is…`, md`$${Fr(Gm)}$`,
        [[md`$${Fr(-Gm)}$`, md`That is $(Z_0 - R_L)/(Z_0 + R_L)$: the right size, the wrong sign.`],
          [md`$${Fr(1 + Gm)}$`, md`That is $1 + \Gamma$, the transmission coefficient.`],
          [md`$${Fr(Gm * Gm)}$`, md`That is $|\Gamma|^2$, the reflected power fraction.`],
          [md`$${Fr(R / Z0)}$`, md`That is $r = R_L/Z_0$ itself. $\Gamma = (r - 1)/(r + 1)$.`]],
        md`$r = R_L/Z_0 = ${Fr(R / Z0)}$, so $\Gamma_L = (r - 1)/(r + 1) = ${Fr(Gm)}$.`);
    },
    // current reflects with -Gamma
    () => {
      const Gm = pick([1 / 3, -1 / 3, 1 / 2, -1 / 2, 1, -1]), X = pick([0.3, 0.6, 0.9, 1.2]);
      const A = (x) => md`$${p(+x.toPrecision(4))}$ A`;
      const nm = Gm === 1 ? ' (an open end)' : Gm === -1 ? ' (a short)' : '';
      return MC('Current reflects with −Γ', md`A current wave $I^+ = ${X}$ A reaches a load with voltage reflection coefficient $\Gamma_L = ${Fr(Gm)}$${nm}. The reflected current wave is…`, A(-Gm * X),
        [[A(Gm * X), md`Current reflects with $-\Gamma$, because a backward wave has $I^- = -V^-/Z_0$.`],
          [A((1 + Gm) * X), md`That multiplies by $1 + \Gamma$, the rule for the total voltage.`],
          [A((1 - Gm) * X), md`That is the total current at the load, $I^+ + I^-$, not the reflected wave.`],
          [md`$0$ A`, md`A reflected wave exists whenever $\Gamma \neq 0$. At an open end it is the total current that is zero.`]],
        md`$I^- = -\Gamma_LI^+ = -(${Fr(Gm)})(${X}) = ${p(+(-Gm * X).toPrecision(4))}$ A.`);
    },
    // junctions
    () => {
      const par = pick([false, true]), Vin = pick([60, 30, 90, 12, 24]);
      const [Z1, Z2] = par ? pick([[100, 100], [50, 50], [150, 150], [75, 75]]) : pick([[150, 50], [50, 150], [75, 25], [25, 75], [100, 300]]);
      const Zs = par ? Z2 / 2 : Z2, Gm = (Zs - Z1) / (Zs + Z1), tau = 1 + Gm;
      const q = par
        ? md`A ${Vin} V wave on a ${Z1} Ω line reaches a junction where two ${Z2} Ω lines branch off in parallel. The voltage wave launched onto each branch is…`
        : md`A ${Vin} V wave on a ${Z1} Ω line reaches a junction with a ${Z2} Ω line. The voltage wave launched onto the ${Z2} Ω line is…`;
      const wr = [[V((1 - Gm) * Vin), md`$1 - \Gamma$ is the ratio for current. For voltage, $\tau = 1 + \Gamma$.`],
        [V(Gm * Vin), md`That is the reflected wave, $\Gamma V$.`],
        [V(Vin), md`The full wave goes on only when the impedances match.`]];
      if (par) {
        const G1 = (Z2 - Z1) / (Z2 + Z1);
        wr.push([V((1 + G1) * Vin), md`That ignores the second branch. The wave sees both branches in parallel: $${Z2}/2 = ${p(Zs)}\ \Omega$.`],
          [V(tau * Vin / 2), md`Each branch gets the full junction voltage; the voltage does not split, the current does.`]);
      } else wr.push([V(Z2 / Z1 * Vin), md`The impedance ratio $Z_{02}/Z_{01}$ is not the transmission coefficient.`]);
      return MC('Through a junction', q, V(tau * Vin), wr,
        md`The wave sees ${par ? md`$${Z2}\parallel${Z2} = ${p(Zs)}\ \Omega$` : md`$${Z2}\ \Omega$`}: $\Gamma = (${p(Zs)} - ${Z1})/(${p(Zs)} + ${Z1}) = ${Fr(Gm)}$, $\tau = 1 + \Gamma = ${Fr(tau)}$, so $${p(+(tau * Vin).toPrecision(4))}$ V goes on.`);
    },
    // the first voltage at the load
    () => {
      const [Vg, Rg, Z0, RL] = pick([[90, 25, 50, 100], [80, 50, 150, 50], [60, 100, 50, 150], [12, 25, 75, 25], [100, 50, 100, 25]]);
      const tg = tgOf(Rg, Z0), GL = GOf(RL, Z0), w1 = tg * Vg;
      return MC('First voltage at the load', md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${RL}\ \Omega$. The load voltage just after the first wave arrives is…`, V(w1 * (1 + GL)),
        [[V(w1), md`That misses the reflected wave, which starts at the load at the same instant.`],
          [V(w1 * GL), md`That is the reflected wave alone.`],
          [V(Vg * RL / (Rg + RL)), md`That is the final DC value, reached only after many bounces.`],
          [V(w1 * (1 - GL)), md`$1 - \Gamma$ is the factor for current.`]],
        md`$\tau_gV_g = ${Fr(tg)}\times${Vg} = ${p(+w1.toPrecision(4))}$ V and $\Gamma_L = ${Fr(GL)}$: $V_L = ${p(+w1.toPrecision(4))}(1 + ${Fr(GL)}) = ${p(+(w1 * (1 + GL)).toPrecision(4))}$ V.`);
    },
  ]);

  // ---------------------------------------------------------------- drill C: bounces
  const BC = [[90, 25, 50, 100], [80, 50, 150, 50], [50, 50, 100, 25], [60, 100, 50, 150], [12, 25, 75, 25], [100, 50, 100, 25]];
  const waves = (Vg, Rg, Z0, RL, k) => {
    const tg = tgOf(Rg, Z0), Gg = GOf(Rg, Z0), GL = GOf(RL, Z0), out = [tg * Vg];
    for (let i = 1; i < k; i++) out.push(out[i - 1] * (i % 2 ? GL : Gg));
    return { w: out, tg, Gg, GL, dc: Vg * RL / (Rg + RL) };
  };
  const sum = (a, k) => a.slice(0, k).reduce((s, x) => s + x, 0);
  const ORD = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth' };
  const LV = [[300, 1.5e8, md`c/2`], [150, 1e8, md`c/3`], [600, 2e8, md`2\times10^8\ \text{m/s}`], [30, 3e8, md`c`], [60, 1.5e8, md`c/2`]];
  const tStr = (t, T) => (T >= 1e-6 ? md`$${p(+(t * 1e6).toPrecision(4))}$ µs` : md`$${p(+(t * 1e9).toPrecision(4))}$ ns`);
  GENS.rf_sp_bounce = () => one([
    // arrival times
    () => {
      const [l, v, vT] = pick(LV), fz = pick([1 / 3, 1 / 4, 1 / 2, 2 / 3, 3 / 4]), z = l * fz, T = l / v, k = pick([2, 3, 4]);
      const ts = [];
      for (let n = 0; n < 4; n++) ts.push(z / v + 2 * n * T, (2 * l - z) / v + 2 * n * T);
      ts.sort((a, b) => a - b);
      const o = (t) => tStr(t, T);
      return MC('When the k-th front passes', md`A line of length $l = ${l}$ m carries waves at $v = ${vT}$. A step starts at the generator ($z = 0$) at $t = 0$. When does the ${ORD[k]} wave front pass $z = ${p(z)}$ m?`, o(ts[k - 1]),
        [[o(ts[k - 2]), md`That is the front before it.`],
          [o(ts[k]), md`That is the front after it.`],
          [o(k * z / v), md`After the first, a front does not just travel $z$: it has gone to the load and back.`],
          [o((k - 1) * 2 * T), md`That forgot the travel to $z$ (or from the load back to $z$).`],
          [o(k * T), md`That counts one-way trips only. Fronts pass $z$ at $z/v + 2nT$ and $(2l - z)/v + 2nT$.`]],
        md`$T = l/v = ${inl(tStr(T, T))}$. Forward fronts pass at $z/v + 2nT$, backward ones at $(2l - z)/v + 2nT$. In order: ${ts.slice(0, k + 1).map((t) => o(t)).join(', ')}. The ${ORD[k]} is ${o(ts[k - 1])}.`);
    },
    // step: running sums
    () => {
      const [Vg, Rg, Z0, RL] = pick(BC), k = pick([2, 3, 4]), W = waves(Vg, Rg, Z0, RL, 5);
      return MC('A step adds up', md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${RL}\ \Omega$. What is $V$ at the middle of the line just after the ${ORD[k]} wave front passes it?`, V(sum(W.w, k)),
        [[V(W.w[k - 1]), md`For a step each wave adds to what is already there. That is the newest wave alone.`],
          [V(sum(W.w, k - 1)), md`That stops one wave early.`],
          [V(sum(W.w, k + 1)), md`That includes the next wave too.`],
          [V(W.dc), md`That is the final DC value, reached only after many bounces.`]],
        md`$\tau_g = ${Fr(W.tg)}$, $\Gamma_L = ${Fr(W.GL)}$, $\Gamma_g = ${Fr(W.Gg)}$. Waves: ${W.w.slice(0, k).map((x) => `$${p(+x.toPrecision(4))}$`).join(', ')} V. Their sum: ${V(sum(W.w, k))}.`);
    },
    // delta: separate spikes
    () => {
      const [Vg, Rg, Z0, RL] = pick(BC), k = pick([2, 3, 4]), W = waves(Vg, Rg, Z0, RL, 5);
      const A = (x) => md`$${p(+x.toPrecision(4))}$ V·s`;
      return MC('A delta does not add up', md`$v_g(t) = ${Vg}\,\delta(t)$ (in V·s), $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${RL}\ \Omega$. At the middle of the line, the ${ORD[k]} spike has area…`, A(W.w[k - 1]),
        [[A(sum(W.w, k)), md`A delta does not accumulate: each spike is one wave passing.`],
          [A(W.w[k - 1] / W.tg), md`That leaves out $\tau_g$ on the first wave.`],
          [A(-W.w[k - 1]), md`Check the sign: each reflection multiplies by its own $\Gamma$, signs included.`],
          [A(W.w[k - 2]), md`That is the spike before it.`]],
        md`The ${ORD[k]} wave is $\tau_gV_g$ times ${k === 2 ? '$\\Gamma_L$' : k === 3 ? '$\\Gamma_L\\Gamma_g$' : '$\\Gamma_L\\Gamma_g\\Gamma_L$'}: ${A(W.w[k - 1])}.`);
    },
    // a matched end ends the bouncing
    () => {
      const [l, v, vT] = pick(LV.slice(0, 3)), T = l / v, gen = pick([true, false]);
      const Z0 = pick([50, 75]), other = pick([3, 1 / 3]) * Z0;
      const Rg = gen ? Z0 : other, RL = gen ? other : Z0;
      const o = (t) => tStr(t, T);
      const right = gen ? 2 * T : T;
      const wr = [[o(gen ? T : 2 * T), gen ? md`The load's reflection still has to travel back. The source absorbs it at $2T$.` : md`$\Gamma_L = 0$: nothing comes back, so there is nothing to wait for.`],
        [o(3 * T), md`A matched end sends nothing back, so there is no wave left to make another trip.`],
        [o(4 * T), md`That waits for a second round trip. A matched end absorbs the wave that would start it.`],
        ['Never exactly: it only approaches it', md`With one end matched, the bounces stop as soon as a wave reaches that end.`]];
      return MC('A matched end stops the bounces', md`A line of length ${l} m with $Z_0 = ${Z0}\ \Omega$ and $v = ${vT}$ has $R_g = ${p(Rg)}\ \Omega$ and $R_L = ${p(RL)}\ \Omega$. A step starts at $t = 0$. When is $V$ at its final value along the whole line?`, o(right), wr,
        gen ? md`$\Gamma_g = 0$: the load's reflection is absorbed when it returns at $2T = ${inl(o(2 * T))}$.` : md`$\Gamma_L = 0$: no reflection, so the line is final once the first wave arrives, at $T = ${inl(o(T))}$.`);
    },
    // the load at 3T
    () => {
      const [Vg, Rg, Z0, RL] = pick(BC), W = waves(Vg, Rg, Z0, RL, 3);
      const v1 = W.w[0] * (1 + W.GL), jump = W.w[2] * (1 + W.GL);
      return MC('The load at 3T', md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${RL}\ \Omega$, and $T$ is the one-way delay. The load voltage just after $t = 3T$ is…`, V(v1 + jump),
        [[V(v1), md`That is the value after the first arrival, at $T$. At $3T$ the next wave arrives.`],
          [V(v1 + W.w[2]), md`The load sees each arriving wave together with its reflection: multiply the new wave by $1 + \Gamma_L$.`],
          [V(W.dc), md`That is the final DC value; more bounces are still to come.`],
          [V(jump), md`That is only the jump at $3T$, not the voltage.`]],
        md`At $T$: $V_L = ${p(+W.w[0].toPrecision(4))}(1 + ${Fr(W.GL)}) = ${p(+v1.toPrecision(4))}$ V. At $3T$ the wave $\Gamma_g\Gamma_L\tau_gV_g = ${p(+W.w[2].toPrecision(4))}$ V arrives and adds $(1 + \Gamma_L)$ times itself: ${V(v1 + jump)}.`);
    },
  ]);

  // ---------------------------------------------------------------- drill D: steady state and scope traces
  GENS.rf_sp_ss = () => one([
    // DC from the circuit
    () => {
      const [Vg, Rg, Z0, RL] = pick(BC), askV = pick([true, false]), tg = tgOf(Rg, Z0), GL = GOf(RL, Z0);
      const A = (x) => md`$${p(+x.toPrecision(3))}$ A`;
      const q = md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, $R_L = ${RL}\ \Omega$. Long after the step, the ${askV ? 'load voltage' : 'current in the line'} is…`;
      if (askV) {
        return MC('Steady state', q, V(Vg * RL / (Rg + RL)),
          [[V(tg * Vg), md`That is the first wave only.`],
            [V(Vg), md`That would need an open load or $R_g = 0$.`],
            [V(Vg * RL / (Z0 + RL)), md`$Z_0$ is not a DC resistance. At DC the line is a pair of wires.`],
            [V(tg * Vg * (1 + GL)), md`That is the first arrival at the load. The bounces continue.`]],
          md`At DC the line is two wires: $V_L = V_gR_L/(R_g + R_L) = ${Vg}(${RL})/${Rg + RL} = ${p(+(Vg * RL / (Rg + RL)).toPrecision(4))}$ V.`);
      }
      return MC('Steady state', q, A(Vg / (Rg + RL)),
        [[A(Vg / (Rg + Z0)), md`That is the first current wave, $\tau_gV_g/Z_0$.`],
          [A(Vg / RL), md`That ignores $R_g$.`],
          [A(Vg / (Rg + RL + Z0)), md`The line adds no resistance at DC.`],
          [A(Vg / Z0), md`$Z_0$ is not a DC resistance.`]],
        md`At DC: $I = V_g/(R_g + R_L) = ${Vg}/${Rg + RL} = ${p(+(Vg / (Rg + RL)).toPrecision(3))}$ A, the same at every $z$.`);
    },
    // open and shorted ends
    () => {
      const [Vg, Rg, Z0] = pick([[12, 60, 50], [90, 25, 50], [80, 50, 150], [20, 150, 50]]), open = pick([true, false]), tg = tgOf(Rg, Z0);
      const A = (x) => md`$${p(+x.toPrecision(3))}$ A`;
      if (open) {
        return MC('Open end at DC', md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, and the far end is open. Long after the step, the voltage at the open end is…`, V(Vg),
          [[V(tg * Vg), md`That is the first wave only.`],
            [V(2 * tg * Vg), md`That is the first arrival at the open end. The bounces continue until the line settles.`],
            [V(0), md`That is a short. With no current, $R_g$ drops nothing, so the whole $V_g$ appears.`],
            [V(Vg / 2), md`Only the first wave of a matched source is $V_g/2$.`]],
          md`At DC no current flows into an open end, so $R_g$ drops nothing: $V = V_g = ${Vg}$ V.`);
      }
      return MC('Shorted end at DC', md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$, and the far end is shorted. Long after the step, the current is…`, A(Vg / Rg),
        [[A(Vg / (Rg + Z0)), md`That is the first current wave only.`],
          [A(2 * Vg / (Rg + Z0)), md`That is the first arrival at the short, where the current doubles. The bounces continue.`],
          [A(Vg / Z0), md`$Z_0$ is not a DC resistance.`],
          [md`$0$ A`, md`That is an open end.`]],
        md`At DC the shorted line is a wire loop: $I = V_g/R_g = ${Vg}/${Rg} = ${p(+(Vg / Rg).toPrecision(3))}$ A.`);
    },
    // Z0 from the first step
    () => {
      const sc = pick([1, 2]), Vg = 10 * sc, Rg = 50, V1 = pick([6, 7.5, 8, 2, 4]) * sc, Z0 = Rg * V1 / (Vg - V1);
      const o = (x) => md`$${r3(x)}\ \Omega$`;
      return MC('Z₀ from a scope trace', md`A source $V_g = ${Vg}u(t)$ V with $R_g = ${Rg}\ \Omega$ drives a line. A scope at the input shows a first step to $${p(V1)}$ V. $Z_0$ is…`, o(Z0),
        [[o(Rg * (Vg - V1) / V1), md`That is upside down. Solve $V_1 = V_gZ_0/(R_g + Z_0)$ for $Z_0$.`],
          [o(Rg * V1 / Vg), md`$\tau_g = Z_0/(R_g + Z_0)$, not $Z_0/R_g$.`],
          [o(Rg), md`A matched source would give $V_1 = V_g/2$.`],
          [o(Rg * Vg / V1), md`That is $R_g + Z_0$, the whole divider.`]],
        md`$V_1(R_g + Z_0) = V_gZ_0$, so $Z_0 = R_gV_1/(V_g - V_1) = ${Rg}(${p(V1)})/${p(Vg - V1)} = ${r3(Z0)}\ \Omega$.`);
    },
    // length from the second step
    () => {
      const [v, vT] = pick([[1e8, md`10^8`], [2e8, md`2\times10^8`], [1.5e8, md`1.5\times10^8`]]), t2 = pick([0.5, 1, 2, 4]) * 1e-6, l = v * t2 / 2;
      const o = (x) => md`$${p(+x.toPrecision(3))}$ m`;
      return MC('Length from a scope trace', md`On a line with $v = ${vT}$ m/s, the second step at the input comes $${p(t2 * 1e6)}$ µs after the first. The line is…`, o(l),
        [[o(v * t2), md`The second step is the round trip, $2T$. That is $2l$.`],
          [o(v * t2 / 4), md`That halves twice. $2T = ${p(t2 * 1e6)}$ µs, so $T$ is half of it.`],
          [o(3e8 * t2 / 2), md`That uses $c$. This line's waves travel at $v$.`],
          [o(2 * v * t2), md`That multiplies by 2 instead of dividing.`]],
        md`The step returns after a round trip: $2l/v = ${p(t2 * 1e6)}$ µs, so $l = v t/2 = ${p(+l.toPrecision(3))}$ m.`);
    },
    // Gamma_L or R_L from the jump
    () => {
      if (pick([true, false])) {
        const [Vg, Rg, Z0] = pick([[10, 50, 75], [12, 25, 75]]), GL = pick([1 / 4, 1 / 2, -1 / 2, 1 / 3, -1 / 3]);
        const V1 = Vg * Z0 / (Rg + Z0), Gg = GOf(Rg, Z0), dV = GL * V1 * (1 + Gg);
        return MC('Γ_L from a scope trace', md`$V_g = ${Vg}u(t)$ V, $R_g = ${Rg}\ \Omega$, $Z_0 = ${Z0}\ \Omega$. The input jumps to $${p(V1)}$ V at $t = 0$, then by $${p(+dV.toPrecision(4))}$ V at $t = 2T$. $\Gamma_L$ is…`, md`$${Fr(GL)}$`,
          [[md`$${Fr(dV / V1)}$`, md`That forgot $(1 + \Gamma_g)$: the returning wave and its re-reflection at the source add at the input.`],
            [md`$${Fr(dV / Vg)}$`, md`Compare the jump with the first wave $V_1$, not with $V_g$.`],
            [md`$${Fr(-GL)}$`, md`Check the sign of the jump.`],
            [md`$${Fr(dV / (V1 * (1 - Gg)))}$`, md`The factor is $1 + \Gamma_g$ (voltage), not $1 - \Gamma_g$.`]],
          md`$\Gamma_g = ${Fr(Gg)}$. The jump is $\Gamma_LV_1(1 + \Gamma_g) = \Gamma_L(${p(V1)})(${Fr(1 + Gg)})$, so $\Gamma_L = ${Fr(GL)}$.`);
      }
      const GL = pick([1 / 3, 1 / 2, -1 / 3, 3 / 5, -3 / 5]), dV = 5 * GL, RL = 50 * (1 + GL) / (1 - GL), G2 = GL / 2;
      const o = (x) => md`$${r3(x)}\ \Omega$`;
      return MC('R_L from a scope trace', md`A matched source ($V_g = 10u(t)$ V, $R_g = Z_0 = 50\ \Omega$) drives a line. The input sits at 5 V, then at $t = 2T$ changes by $${p(dV)}$ V and stays. $R_L$ is…`, o(RL),
        [[o(50 * (1 - GL) / (1 + GL)), md`That is upside down: $R_L = Z_0(1 + \Gamma_L)/(1 - \Gamma_L)$.`],
          [o(50 * (1 + GL)), md`That is $Z_0(1 + \Gamma_L)$; divide by $1 - \Gamma_L$ too.`],
          [o(50), md`A change at $2T$ means a reflection, so $R_L \neq Z_0$.`],
          [o(50 * (1 + G2) / (1 - G2)), md`That compares the change with $V_g$. Compare it with the first wave, 5 V.`]],
        md`$\Gamma_g = 0$, so the change is $\Gamma_L(5)$: $\Gamma_L = ${Fr(GL)}$ and $R_L = 50\frac{1 + \Gamma_L}{1 - \Gamma_L} = ${r3(RL)}\ \Omega$.`);
    },
  ]);

  // ---------------------------------------------------------------- drill E: stubs and transformers
  const DL = [[1 / 8, md`\lambda/8`, 45], [3 / 8, md`3\lambda/8`, 135], [1 / 6, md`\lambda/6`, 60], [1 / 12, md`\lambda/12`, 30], [1 / 3, md`\lambda/3`, 120]];
  GENS.rf_sp_stub = () => one([
    // quarter wave
    () => {
      const [Z0, ZL] = pick([[50, 100], [50, 25], [100, 50], [75, 150], [100, 400], [60, 36], [50, 200]]);
      const o = (x) => md`$${r3(x)}\ \Omega$`;
      return MC('Quarter-wave input', md`A $\lambda/4$ section of ${Z0} Ω line ends in ${ZL} Ω. Its input impedance is…`, o(Z0 * Z0 / ZL),
        [[o(ZL), md`That is the half-wave rule. A quarter wave inverts.`],
          [o(Z0), md`Only when $Z_L = Z_0$.`],
          [o(ZL * ZL / Z0), md`That is upside down: $Z_0^2/Z_L$.`],
          [o(Math.sqrt(Z0 * ZL)), md`That is the $Z_0$ you would choose to match ${Z0} Ω to ${ZL} Ω.`]],
        md`$Z_\text{in} = Z_0^2/Z_L = ${Z0 * Z0}/${ZL} = ${r3(Z0 * Z0 / ZL)}\ \Omega$.`);
    },
    // quarter-wave match
    () => {
      const [Rin, RL] = pick([[50, 200], [50, 72], [25, 100], [36, 100], [50, 450], [75, 300], [20, 80]]);
      const o = (x) => md`$${r3(x)}\ \Omega$`;
      return MC('Quarter-wave match', md`A quarter-wave section must make a ${RL} Ω load look like ${Rin} Ω. Its $Z_0$ is…`, o(Math.sqrt(Rin * RL)),
        [[o((Rin + RL) / 2), md`That is the average. $Z_\text{in} = Z_0^2/R_L$ needs the geometric mean.`],
          [o(Rin * RL / (Rin + RL)), md`That is the parallel combination.`],
          [o(RL * RL / Rin), md`Set $Z_0^2/R_L = R_\text{in}$: $Z_0^2 = R_\text{in}R_L$.`],
          [o(Rin * RL), md`That forgot the square root: $Z_0^2 = R_\text{in}R_L$.`]],
        md`$Z_0^2/R_L = R_\text{in}$, so $Z_0 = \sqrt{${Rin}\times${RL}} = ${r3(Math.sqrt(Rin * RL))}\ \Omega$.`);
    },
    // stub impedance
    () => {
      const Z0 = pick([50, 75, 100]), sh = pick([true, false]), [, dT, deg] = pick(DL), t = Math.tan(deg * Math.PI / 180);
      const X = sh ? Z0 * t : -Z0 / t, Xo = sh ? -Z0 / t : Z0 * t;
      const o = (x) => md`$${x < 0 ? '-' : ''}j${r3(Math.abs(x))}\ \Omega$`;
      return MC('Stub impedance', md`${sh ? 'A shorted' : 'An open'} stub of ${Z0} Ω line is $${dT}$ long. Its input impedance is…`, o(X),
        [[o(-X), md`Check the sign: a shorted stub gives $+jZ_0\tan\beta d$, an open one $-jZ_0\cot\beta d$.`],
          [o(Xo), md`That is the ${sh ? 'open' : 'shorted'} stub of the same length.`],
          [md`$${r3(Math.abs(X))}\ \Omega$`, md`A lossless stub is purely reactive: its impedance is imaginary.`],
          [md`$0$`, md`That is a short: a shorted stub of length 0 or $\lambda/2$.`],
          ['an open circuit', md`That needs $\beta d = 90°$ for a short (or $0°$, $180°$ for an open). Here $\beta d = ${deg}°$.`]],
        md`$\beta d = ${deg}°$. ${sh ? md`Short: $Z = jZ_0\tan\beta d = j${Z0}\tan${deg}°$` : md`Open: $Z = -jZ_0\cot\beta d = -j${Z0}\cot${deg}°$`} $= ${inl(o(X))}$.`);
    },
    // quarter and half waves
    () => {
      const sh = pick([true, false]), [n, lT] = pick([[1, md`\lambda/4`], [2, md`\lambda/2`], [3, md`3\lambda/4`]]);
      const isOpen = (n % 2 === 1) === sh;   // shorted: odd quarters open; open: even quarters open
      const OP = 'an open circuit', SH = 'a short circuit';
      const right = isOpen ? OP : SH;
      return MC('Quarter and half waves', md`${sh ? 'A shorted' : 'An open'} stub is exactly $${lT}$ long. Its input looks like…`, right,
        [[isOpen ? SH : OP, n % 2 ? md`A quarter wave inverts: $Z_0^2/Z_L$ turns ${sh ? 'a short into an open' : 'an open into a short'}.` : md`A half wave repeats the load; it is a quarter wave that inverts.`],
          [md`$+jZ_0$ (an inductor)`, md`That is a shorted stub $\lambda/8$ long ($\tan45° = 1$).`],
          [md`$-jZ_0$ (a capacitor)`, md`That is an open stub $\lambda/8$ long.`],
          [md`$Z_0$ (a resistor)`, md`A lossless stub is purely reactive; it never looks like a resistor.`]],
        md`${n % 2 ? md`An odd number of quarter waves inverts the ${sh ? 'short' : 'open'}` : md`A half wave repeats the ${sh ? 'short' : 'open'}`}: ${right}.`);
    },
    // resonance frequencies
    () => {
      const sh = pick([true, false]), askOpen = pick([true, false]), l = pick([0.25, 0.5, 0.75, 1, 1.5]);
      const [v, vT] = pick([[1e8, md`10^8`], [2e8, md`2\times10^8`], [3e8, md`3\times10^8`]]);
      const quarter = sh === askOpen;             // shorted looks open at a quarter wave; open looks short at a quarter wave
      const f = quarter ? v / (4 * l) : v / (2 * l), fo = quarter ? v / (2 * l) : v / (4 * l);
      const o = (x) => md`$${p(+(x / 1e6).toPrecision(3))}$ MHz`;
      const wr = [[o(fo), md`That is where it looks like ${askOpen ? 'a short' : 'an open'}.`],
        [o(v / l), md`That makes the stub a full wavelength.`],
        [o(3 * f), md`That is the next resonance, not the lowest.`]];
      if (v !== 3e8) wr.push([o(quarter ? 3e8 / (4 * l) : 3e8 / (2 * l)), md`That uses $c$. Waves on this line travel at $v$.`]);
      else wr.push([o(f / 2), md`That halves it once too often.`]);
      return MC('Stub resonance', md`${sh ? 'A shorted' : 'An open'} stub is ${l} m long, and waves on it travel at $${vT}$ m/s. The lowest frequency above zero at which it looks like ${askOpen ? 'an open circuit' : 'a short circuit'} is…`, o(f), wr,
        md`It looks like ${askOpen ? 'an open' : 'a short'} when $l = ${quarter ? '\\lambda/4' : '\\lambda/2'}$, so $f = v/${quarter ? '4' : '2'}l = ${inl(o(f))}$.`);
    },
    // inductor or capacitor
    () => {
      const sh = pick([true, false]), fr = pick([0.1, 0.15, 0.2, 0.3, 0.35, 0.4, 0.6, 0.7]);
      const deg = 360 * fr, t = Math.tan(deg * Math.PI / 180);
      const X = sh ? t : -1 / t;           // in units of Z0
      const right = X > 0 ? 'an inductor' : 'a capacitor';
      return MC('Inductor or capacitor', md`${sh ? 'A shorted' : 'An open'} stub is $${p(fr)}\lambda$ long. It looks like…`, right,
        [[X > 0 ? 'a capacitor' : 'an inductor', md`$\beta d = ${p(deg)}°$. ${sh ? md`$jZ_0\tan${p(deg)}°$` : md`$-jZ_0\cot${p(deg)}°$`} has ${X > 0 ? 'a positive' : 'a negative'} imaginary part, which is ${X > 0 ? 'inductive' : 'capacitive'}. Each quarter wave swaps the two.`],
          ['an open circuit', md`Only exact odd multiples of $\lambda/4$ (shorted) or of $\lambda/2$ (open) give an open circuit.`],
          ['a short circuit', md`Only exact multiples of $\lambda/2$ (shorted) or odd multiples of $\lambda/4$ (open) give a short.`],
          ['a resistor', md`A lossless stub is purely reactive.`]],
        md`$\beta d = 360°\times${p(fr)} = ${p(deg)}°$. ${sh ? md`$Z = jZ_0\tan${p(deg)}°$` : md`$Z = -jZ_0\cot${p(deg)}°$`} $= j(${r3(X)})Z_0$: ${right}.`);
    },
  ]);

  // ---------------------------------------------------------------- drill F: Gamma(d), VSWR, power
  const gtex = (mag, ang) => {
    let a = ((ang % 360) + 540) % 360 - 180;
    if (Math.abs(a + 180) < 1e-9) a = 180;
    const m = Fr(mag);
    if (Math.abs(a) < 1e-9) return m;
    if (Math.abs(a - 180) < 1e-9) return `-${m}`;
    if (Math.abs(a - 90) < 1e-9) return `j${m}`;
    if (Math.abs(a + 90) < 1e-9) return `-j${m}`;
    return `${m}e^{${a < 0 ? '-' : ''}j${p(Math.abs(a))}°}`;
  };
  GENS.rf_sp_vswr = () => one([
    // VSWR from Gamma
    () => {
      const Gm = pick([1 / 3, -1 / 3, 1 / 2, -1 / 2, 3 / 5, -4 / 5, 1 / 5]), a = Math.abs(Gm), S = (1 + a) / (1 - a);
      return MC('VSWR from Γ', md`A load has $\Gamma_L = ${Fr(Gm)}$. The VSWR on the line is…`, md`$${Fr(S)}$`,
        [[md`$${Fr((1 - a) / (1 + a))}$`, md`That is upside down (or uses $\Gamma$ with its sign). A VSWR is never below 1.`],
          [md`$${Fr(1 + a)}$`, md`That is $|V|_\text{max}/|V^+|$. The VSWR is $|V|_\text{max}/|V|_\text{min}$.`],
          [md`$${Fr(1 / a)}$`, md`That is $1/|\Gamma|$. The VSWR is $(1 + |\Gamma|)/(1 - |\Gamma|)$.`],
          [md`$${Fr(1 / (1 - a))}$`, md`That is $1/(1 - |\Gamma|)$: the top needs $1 + |\Gamma|$.`]],
        md`$|\Gamma| = ${Fr(a)}$: $(1 + ${Fr(a)})/(1 - ${Fr(a)}) = ${Fr(S)}$.`);
    },
    // |Gamma| from VSWR
    () => {
      const S = pick([2, 3, 4, 9, 1.5, 5]), a = (S - 1) / (S + 1);
      return MC('|Γ| from the VSWR', md`A line has VSWR $= ${p(S)}$. Then $|\Gamma_L|$ is…`, md`$${Fr(a)}$`,
        [[md`$${Fr((S + 1) / (S - 1))}$`, md`That is upside down. $|\Gamma|$ is at most 1.`],
          [md`$${Fr(1 / S)}$`, md`That is $1/\text{VSWR}$. Solve $(1 + |\Gamma|)/(1 - |\Gamma|) = \text{VSWR}$.`],
          [md`$${Fr((S - 1) / S)}$`, md`The bottom is $\text{VSWR} + 1$.`],
          [md`$${Fr(S - 1)}$`, md`That forgot to divide by $\text{VSWR} + 1$.`]],
        md`$|\Gamma| = (\text{VSWR} - 1)/(\text{VSWR} + 1) = ${p(S - 1)}/${p(S + 1)} = ${Fr(a)}$.`);
    },
    // resistive load VSWR
    () => {
      const [RL, Z0] = pick([[150, 50], [25, 75], [100, 50], [50, 200], [450, 50], [10, 50], [300, 75]]), r = RL / Z0, S = Math.max(r, 1 / r), a = Math.abs((r - 1) / (r + 1));
      return MC('VSWR of a resistor', md`A ${Z0} Ω line ends in ${RL} Ω. The VSWR is…`, md`$${Fr(S)}$`,
        [[md`$${Fr(1 / S)}$`, md`A VSWR is never below 1. Take the ratio the other way up.`],
          [md`$${Fr(a)}$`, md`That is $|\Gamma|$.`],
          [md`$${Fr(1 + a)}$`, md`That is $1 + |\Gamma|$ only; divide by $1 - |\Gamma|$.`],
          [md`$${Fr(S * S)}$`, md`That squares it. For a resistor the VSWR equals $R_L/Z_0$ or $Z_0/R_L$.`]],
        md`For a resistive load the VSWR is the larger of $R_L/Z_0$ and $Z_0/R_L$: $${Fr(S)}$.`);
    },
    // where the maximum is
    () => {
      const [RL, Z0] = pick([[150, 50], [25, 75], [100, 50], [50, 200], [450, 50], [10, 50]]), askMax = pick([true, false]);
      const atLoad = (RL > Z0) === askMax;
      const AT = 'at the load', QW = md`$\lambda/4$ from the load`;
      return MC('Where the maximum sits', md`A ${Z0} Ω line ends in ${RL} Ω. The voltage ${askMax ? 'maximum' : 'minimum'} nearest the load is…`, atLoad ? AT : QW,
        [[atLoad ? QW : AT, md`$\Gamma_L$ is ${RL > Z0 ? 'positive' : 'negative'}, so $|\tilde V(0)| = |\tilde V^+|(1 + \Gamma_L)$ is a ${RL > Z0 ? 'maximum' : 'minimum'}.`],
          [md`$\lambda/8$ from the load`, md`Maxima and minima are $\lambda/4$ apart, not $\lambda/8$.`],
          [md`$\lambda/2$ from the load`, md`$\lambda/2$ from one maximum is the next maximum.`],
          ['nowhere: $|V|$ is the same all along', md`That is a matched load only.`]],
        md`$R_L ${RL > Z0 ? '>' : '<'} Z_0$ gives $\Gamma_L ${RL > Z0 ? '>' : '<'} 0$: a ${RL > Z0 ? 'maximum' : 'minimum'} at the load, and the other kind $\lambda/4$ away.`);
    },
    // Gamma(d) turns by 2 beta d
    () => {
      const [m, a0] = pick([[1 / 2, 0], [1 / 3, 180], [1 / 2, 90], [1 / 3, 0], [1 / 2, 180]]), [fd, dT] = pick([[1 / 8, md`\lambda/8`], [1 / 4, md`\lambda/4`], [3 / 8, md`3\lambda/8`], [1 / 12, md`\lambda/12`], [1 / 6, md`\lambda/6`]]);
      const o = (ang) => md`$${gtex(m, ang)}$`;
      return MC('Γ(d) turns', md`A line has $\Gamma_L = ${gtex(m, a0)}$. At $d = ${dT}$ from the load, $\Gamma(d)$ is…`, o(a0 - 720 * fd),
        [[o(a0 - 360 * fd), md`That turns by $\beta d$. $\Gamma(d) = \Gamma_Le^{-j2\beta d}$ turns by twice that.`],
          [o(a0 + 720 * fd), md`That turns the wrong way: moving toward the source, the angle falls.`],
          [o(a0), md`$\Gamma(d)$ keeps its size but not its angle.`],
          [o(a0 + 360 * fd), md`That turns by $\beta d$, and the wrong way.`]],
        md`$2\beta d = 720°\times d/\lambda = ${p(720 * fd)}°$, so $\Gamma(d) = \Gamma_Le^{-j${p(720 * fd)}°} = ${gtex(m, a0 - 720 * fd)}$.`);
    },
    // impedance at a maximum or minimum
    () => {
      const S = pick([2, 3, 4]), Z0 = pick([50, 75, 100]), askMax = pick([true, false]);
      const o = (x) => md`$${r3(x)}\ \Omega$`;
      return MC('Z at a voltage maximum or minimum', md`A ${Z0} Ω line has VSWR $= ${S}$. At a voltage ${askMax ? 'maximum' : 'minimum'}, the line impedance $Z(d)$ is…`, o(askMax ? S * Z0 : Z0 / S),
        [[o(askMax ? Z0 / S : S * Z0), md`That is the value at a voltage ${askMax ? 'minimum' : 'maximum'}. Large voltage goes with small current: large $Z$.`],
          [o(Z0), md`Only on a matched line.`],
          [o(askMax ? S * S * Z0 : Z0 / (S * S)), md`That squares the VSWR.`],
          [o(Z0 * (askMax ? 1 + (S - 1) / (S + 1) : 1 - (S - 1) / (S + 1))), md`That multiplies by $1 \pm |\Gamma|$. The current changes too: $Z = Z_0(1 \pm |\Gamma|)/(1 \mp |\Gamma|)$.`]],
        md`At a maximum $\Gamma(d) = +|\Gamma|$, so $Z = Z_0\frac{1 + |\Gamma|}{1 - |\Gamma|} = \text{VSWR}\cdot Z_0$; at a minimum $Z = Z_0/\text{VSWR}$. Here: ${o(askMax ? S * Z0 : Z0 / S)}.`);
    },
    // power delivered
    () => {
      const Vp = pick([10, 20]), Gm = pick([1 / 3, 1 / 2, 1 / 5, 3 / 5, -1 / 3, -1 / 2]), P0 = Vp * Vp / 100, P = P0 * (1 - Gm * Gm);
      const o = (x) => md`$${Fr(x)}$ W`;
      return MC('Power delivered', md`On a 50 Ω line, $|\tilde V^+| = ${Vp}$ V and $\Gamma_L = ${Fr(Gm)}$. The time-average power delivered to the load is…`, o(P),
        [[o(P0), md`That ignores the reflected power.`],
          [o(P0 * (1 - Math.abs(Gm))), md`Power goes as the voltage squared: $1 - |\Gamma|^2$.`],
          [o(P0 * Gm * Gm), md`That is the reflected power.`],
          [o(2 * P * 1), md`That drops the $\frac12$ in $|\tilde V^+|^2/2Z_0$.`]],
        md`$|\tilde V^+|^2/2Z_0 = ${Vp * Vp}/100 = ${p(P0)}$ W, times $1 - |\Gamma|^2 = ${Fr(1 - Gm * Gm)}$: ${o(P)}.`);
    },
  ]);

  // ---------------------------------------------------------------- question bank, lesson 2
  EM.BANK['e3-speed-tl'] = [
    Q(md`A coax has $C = \frac{2\pi\epsilon}{\ln(b/a)}$ per meter. Its inductance per meter is…`,
      [md`$\frac{\mu}{2\pi}\ln\frac ba$`, md`$\frac{2\pi\mu}{\ln(b/a)}$`, md`$\frac{\epsilon}{2\pi}\ln\frac ba$`, md`$\mu\ln\frac ba$`], 0,
      [null, md`That copies the shape of $C$. With $LC = \mu\epsilon$ the shape factor flips.`, md`An inductance carries $\mu$.`, md`That lost the $2\pi$.`],
      md`$L = \mu\epsilon/C = \mu\epsilon\ln(b/a)/(2\pi\epsilon) = \frac{\mu}{2\pi}\ln\frac ba$.`),
    Q(md`For every lossless TEM line, $LC$ equals…`,
      [md`$\mu\epsilon$ of the filling`, md`$\mu/\epsilon$`, md`$\sqrt{\mu\epsilon}$`, md`$1/(\mu\epsilon)$`], 0,
      [null, md`That is $\eta^2$, which is $(L/C)\,\text{GF}^2$.`, md`That is $1/v$.`, md`That is $v^2$.`],
      md`The line's waves travel at $1/\sqrt{LC}$, and they are TEM waves in the filling, which travel at $1/\sqrt{\mu\epsilon}$.`),
    Q(md`An air-filled line has $L = 0.5\ \mu\text{H/m}$. Its $Z_0$ is…`,
      [md`$150\ \Omega$`, md`$377\ \Omega$`, md`$1.67\times10^{-15}\ \Omega$`, md`$7.1\times10^{-4}\ \Omega$`], 0,
      [null, md`That is $\eta_0$. $Z_0$ also depends on the shape.`, md`That is $L/v$. $Z_0 = Lv$.`, md`That is $\sqrt L$.`],
      md`$L = Z_0/v$, so $Z_0 = Lv = (0.5\times10^{-6})(3\times10^8) = 150\ \Omega$.`),
    Q(md`$R_g = 0$. The injection coefficient $\tau_g$ is…`,
      ['1', '0', '1/2', '−1'], 0,
      [null, md`Zero would mean no wave at all.`, md`That is for $R_g = Z_0$.`, md`That is $\Gamma_g$ for $R_g = 0$.`],
      md`$\tau_g = Z_0/(0 + Z_0) = 1$: the whole $V_g$ goes onto the line.`),
    Q(md`$R_g = 50\ \Omega$ and $Z_0 = 150\ \Omega$. Then…`,
      [md`$\tau_g = 3/4$ and $1 + \Gamma_g = 1/2$`, md`$\tau_g = 1 + \Gamma_g = 3/4$`, md`$\tau_g = 1 + \Gamma_g = 1/2$`, md`$\tau_g = 1/4$ and $1 + \Gamma_g = 1/2$`], 0,
      [null, md`$\tau_g \neq 1 + \Gamma_g$: $1 + \Gamma_g = 2R_g/(R_g + Z_0)$.`, md`$\tau_g = Z_0/(R_g + Z_0) = 3/4$.`, md`$\tau_g$ has $Z_0$ on top.`],
      md`$\tau_g = 150/200 = 3/4$; $\Gamma_g = -100/200 = -1/2$, so $1 + \Gamma_g = 1/2$.`),
    Q(md`A 30 V wave on a 50 Ω line hits an open end. The reflected current wave is…`,
      [md`$-0.6$ A`, md`$+0.6$ A`, md`$0$`, md`$1.2$ A`], 0,
      [null, md`Current reflects with $-\Gamma = -1$.`, md`The total current at the open end is zero; the reflected wave is not.`, md`That is twice the incident current.`],
      md`$I^+ = 30/50 = 0.6$ A, and $I^- = -\Gamma I^+ = -0.6$ A. Total at the end: $0$ ✓.`),
    Q(md`On a current bounce diagram, a wave arriving at the load is multiplied by…`,
      [md`$-\Gamma_L$`, md`$\Gamma_L$`, md`$1 + \Gamma_L$`, md`$1/\Gamma_L$`], 0,
      [null, md`That is the voltage rule.`, md`That is the total voltage at the load, over the incident.`, md`Nothing physical is $1/\Gamma$.`],
      md`$I^- = -V^-/Z_0$, so $I^-/I^+ = -\Gamma_L$.`),
    Q(md`Two 100 Ω lines branch in parallel from the end of a 50 Ω line. The reflection coefficient at the junction is…`,
      ['0', '1/3', '−1/3', '1/2'], 0,
      [null, md`That uses one 100 Ω branch. The wave sees both.`, md`$100\parallel100 = 50\ \Omega$ matches exactly.`, md`That is for a 150 Ω load.`],
      md`$100\parallel100 = 50\ \Omega = Z_{01}$: matched, nothing reflects.`),
    Q(md`A 50 Ω line ends in 50 Ω and is driven through $R_g = 100\ \Omega$ by a step. The line is at its final value everywhere after…`,
      [md`$T$, one trip`, md`$2T$`, md`$3T$`, 'never exactly'], 0,
      [null, md`The load is matched: nothing comes back.`, md`No reflection exists to make a third trip.`, md`A matched end stops the bouncing.`],
      md`$\Gamma_L = 0$, so the first wave is the only wave. Once it reaches the load, at $T$, the line is final.`),
    Q(md`Spring 2024 Problem 4: $V_g = 80u(t)$ V, $R_g = 50\ \Omega$, 150 m of 150 Ω line then 150 m of 50 Ω line, $R_L = 50\ \Omega$, $v = c/2$. $V(100\ \text{m}, t)$ at $t = 3$ µs is…`,
      [md`$45$ V`, md`$30$ V`, md`$37.5$ V`, md`$60$ V`], 0,
      [null, md`That is the value from $4/3$ to $8/3$ µs. At $8/3$ µs the re-reflected $+15$ V passes.`, md`That comes after $10/3$ µs, when $-7.5$ V passes.`, md`That is the first value only, before $4/3$ µs.`],
      md`Each section takes 1 µs. Waves passing $z = 100$ m: $+60$ at $2/3$ µs, $-30$ (from the junction) at $4/3$ µs, $+15$ (re-reflected at the source, $\Gamma_g = -1/2$) at $8/3$ µs, $-7.5$ at $10/3$ µs. At 3 µs: $60 - 30 + 15 = 45$ V. It settles at 40 V.`),
    Q(md`The review-session line ($\tau_g = 2/3$, $\Gamma_L = -3/5$, $\Gamma_g = -1/3$) is driven by $50\delta(t)$. At the middle of the line, the second spike has area…`,
      [md`$-20$ V·s`, md`$13.3$ V·s`, md`$-30$ V·s`, md`$+20$ V·s`], 0,
      [null, md`That adds the first two spikes. A delta does not accumulate.`, md`That leaves out $\tau_g$.`, md`$\Gamma_L$ is negative.`],
      md`First spike $\tau_gV_g = 33.3$, second $\Gamma_L\times33.3 = -20$ (V·s).`),
    Q(md`$V_g = 12u(t)$ V, $R_g = 60\ \Omega$, $Z_0 = 50\ \Omega$, open far end. The final voltage at the open end is…`,
      [md`$12$ V`, md`$5.45$ V`, md`$10.9$ V`, md`$0$`], 0,
      [null, md`That is the first wave only.`, md`That is the first arrival at the open end; the bounces go on.`, md`That is a short.`],
      md`At DC no current flows, so $R_g$ drops nothing: $V = V_g = 12$ V.`),
    Q(md`$V_g = 12u(t)$ V, $R_g = 60\ \Omega$, $Z_0 = 50\ \Omega$, shorted far end. The final current is…`,
      [md`$0.2$ A`, md`$0.109$ A`, md`$0.24$ A`, md`$0$`], 0,
      [null, md`That is the first current wave, $V_g/(R_g + Z_0)$.`, md`That is $V_g/Z_0$. $Z_0$ is not a DC resistance.`, md`That is an open end.`],
      md`At DC the shorted line is a wire: $I = 12/60 = 0.2$ A.`),
    Q(md`A source $10u(t)$ V with $R_g = 50\ \Omega$ drives a line; the input first steps to 7.5 V. $Z_0$ is…`,
      [md`$150\ \Omega$`, md`$16.7\ \Omega$`, md`$37.5\ \Omega$`, md`$50\ \Omega$`], 0,
      [null, md`That is $R_g(V_g - V_1)/V_1$, upside down.`, md`That is $R_gV_1/V_g$: $\tau_g$ is not $Z_0/R_g$.`, md`A matched source would give 5 V.`],
      md`$Z_0 = R_gV_1/(V_g - V_1) = 50(7.5)/2.5 = 150\ \Omega$.`),
    Q(md`The second step at a line's input comes 4 µs after the first, and $v = 2\times10^8$ m/s. The line is…`,
      [md`$400$ m long`, md`$800$ m long`, md`$200$ m long`, md`$600$ m long`], 0,
      [null, md`4 µs is the round trip, $2l/v$.`, md`That halves twice.`, md`That uses $c$.`],
      md`$2l/v = 4$ µs, so $l = (2\times10^8)(2\times10^{-6}) = 400$ m.`),
    Q(md`A $\lambda/4$ section of 50 Ω line ends in 100 Ω. The input impedance is…`,
      [md`$25\ \Omega$`, md`$100\ \Omega$`, md`$200\ \Omega$`, md`$70.7\ \Omega$`], 0,
      [null, md`That is the half-wave rule.`, md`That is $Z_L^2/Z_0$, upside down.`, md`That is the $Z_0$ that would match 50 to 100.`],
      md`$Z_0^2/Z_L = 2500/100 = 25\ \Omega$.`),
    Q(md`To match a 200 Ω load to 50 Ω with a quarter-wave section, its $Z_0$ must be…`,
      [md`$100\ \Omega$`, md`$125\ \Omega$`, md`$40\ \Omega$`, md`$800\ \Omega$`], 0,
      [null, md`That is the average. Inversion needs the geometric mean.`, md`That is the parallel combination.`, md`That is $R_L^2/R_\text{in}$.`],
      md`$Z_0 = \sqrt{50\times200} = 100\ \Omega$. Check: $100^2/200 = 50$ ✓.`),
    Q(md`An open stub of 75 Ω line, $\lambda/8$ long, has input impedance…`,
      [md`$-j75\ \Omega$`, md`$+j75\ \Omega$`, 'an open circuit', 'a short circuit'], 0,
      [null, md`That is the shorted stub.`, md`That is an open of length 0 or $\lambda/2$.`, md`That is an open stub $\lambda/4$ long.`],
      md`$-jZ_0\cot45° = -j75\ \Omega$: a capacitor.`),
    Q(md`A shorted stub $0.3\lambda$ long looks like…`,
      ['a capacitor', 'an inductor', 'an open circuit', 'a short circuit'], 0,
      [null, md`Only below $\lambda/4$. Here $\beta d = 108°$ and $\tan108° < 0$.`, md`Only at exactly $\lambda/4$ (or $3\lambda/4$, ...).`, md`Only at multiples of $\lambda/2$.`],
      md`$jZ_0\tan108°$ has a negative imaginary part: capacitive.`),
    Q(md`A shorted stub is 0.5 m long and $v = 2\times10^8$ m/s. The lowest frequency at which it looks like an open circuit is…`,
      [md`100 MHz`, md`200 MHz`, md`150 MHz`, md`400 MHz`], 0,
      [null, md`At 200 MHz the stub is $\lambda/2$: a short again.`, md`That uses $c$.`, md`That is a full wavelength.`],
      md`Open when $l = \lambda/4$: $f = v/4l = 2\times10^8/2 = 100$ MHz.`),
    Q(md`A shorted stub that is $\lambda/4$ long at $f_0$ is connected across a line. At $2f_0$ it…`,
      ['shorts the line', 'is invisible', 'adds an inductor', 'adds a capacitor'], 0,
      [null, md`That is at $f_0$, where it is an open circuit in parallel.`, md`At $2f_0$ it is exactly $\lambda/2$: a short.`, md`At exactly $\lambda/2$ the reactance is zero, not capacitive.`],
      md`At $2f_0$ the stub is $\lambda/2$ long, so it repeats its short across the line: $2f_0$ is blocked.`),
    Q(md`$|\Gamma_L| = 1/2$. The VSWR is…`,
      ['3', '2', '1/3', '1.5'], 0,
      [null, md`That is for $|\Gamma| = 1/3$.`, md`Upside down: a VSWR is at least 1.`, md`That is $1 + |\Gamma|$.`],
      md`$(1 + 1/2)/(1 - 1/2) = 3$.`),
    Q(md`A VSWR of 9 means $|\Gamma_L|$ is…`,
      ['4/5', '1/9', '8/9', '5/4'], 0,
      [null, md`That is $1/\text{VSWR}$.`, md`The bottom is $\text{VSWR} + 1 = 10$.`, md`Upside down: $|\Gamma| \le 1$.`],
      md`$(9 - 1)/(9 + 1) = 8/10 = 4/5$.`),
    Q(md`$\Gamma_L = 1/2$. At $d = \lambda/4$, $\Gamma(d)$ is…`,
      [md`$-1/2$`, md`$-j/2$`, md`$1/2$`, md`$j/2$`], 0,
      [null, md`That turns by $\beta d = 90°$. The turn is $2\beta d = 180°$.`, md`That is $d = \lambda/2$.`, md`That turns the wrong way, and by $\beta d$.`],
      md`$2\beta d = 180°$: $\Gamma(d) = \frac12e^{-j180°} = -\frac12$. This is why a quarter wave inverts.`),
    Q(md`On a 50 Ω line $|\tilde V^+| = 10$ V and $|\Gamma_L| = 1/2$. The power delivered is…`,
      [md`$0.75$ W`, md`$1$ W`, md`$0.5$ W`, md`$0.25$ W`], 0,
      [null, md`That ignores the reflection.`, md`That uses $1 - |\Gamma|$. Power goes as voltage squared.`, md`That is the reflected power.`],
      md`$\frac{100}{100}(1 - \frac14) = 0.75$ W.`),
    Q(md`A 50 Ω line has VSWR 2. At a voltage maximum, $Z(d)$ is…`,
      [md`$100\ \Omega$`, md`$25\ \Omega$`, md`$50\ \Omega$`, md`$j100\ \Omega$`], 0,
      [null, md`That is at a voltage minimum.`, md`Only on a matched line.`, md`At a maximum $\Gamma(d)$ is real and positive, so $Z$ is real.`],
      md`$Z = Z_0(1 + |\Gamma|)/(1 - |\Gamma|) = \text{VSWR}\cdot Z_0 = 100\ \Omega$.`),
  ];
  attachBank(L2);

  // ================================================================ LESSON 3: no-calculator arithmetic
  const L3 = EM.lesson('e3-gymu', {
    id: 'e3-speed-num', order: 3, kind: 'lesson', title: 'No-calculator arithmetic',
    sub: '24 tricks: roots, e^(−x), ln 2, dB, 120π, ε₀, speeds, complex angles, Γ fractions, series, trig',
    steps: [
      R(md`
        !!key Why this page exists
          Exam 3 allows no calculator, so Prof. Chen picks numbers that come out clean: $c/2$ speeds, 50 and 150 Ω, $\delta = 1$ mm, 300 MHz. The arithmetic is never hard, but it is easy to get slow or sloppy. Each trick below is a number or a move worth knowing cold. Same format: rule, why, example, trap, then a drill.

        ### A. Roots, exponentials, logs and decibels

        !!method
          **1. Four square roots, and pulling out squares**

          **Rule.** $\sqrt2 \approx 1.414$, $\sqrt3 \approx 1.732$, $\sqrt5 \approx 2.236$, $\sqrt{10} \approx 3.162$. Also $1/\sqrt2 \approx 0.707$ and $1/\sqrt3 \approx 0.577$. For any other root, pull out a perfect square: $\sqrt{k^2m} = k\sqrt m$.

          **Why.** Check by squaring: $1.414^2 = 1.999$, $1.732^2 = 3.000$, $2.236^2 = 5.000$. And $\sqrt{ab} = \sqrt a\sqrt b$, so a square factor comes out as its root.

          **10-second example.** $\sqrt{50} = \sqrt{25\cdot2} = 5\sqrt2 \approx 7.07$. $|1 + j2| = \sqrt5 \approx 2.24$. $\sqrt{1000} = 10\sqrt{10} \approx 31.6$.

          **Trap.** $\sqrt{a + b} \neq \sqrt a + \sqrt b$: $|3 + j4| = 5$, not 7.

        !!method
          **2. e⁻¹, e⁻², e⁻³ and e^(−1/2)**

          **Rule.** $e^{-1} \approx 0.368$, $e^{-2} \approx 0.135$, $e^{-3} \approx 0.050$, $e^{-1/2} \approx 0.607$.

          **Why.** $e \approx 2.718$, so $1/e \approx 0.368$. Square it: $e^{-2} \approx 0.135$. Take its root: $e^{-1/2} = \sqrt{0.368} \approx 0.607$. And $e^{-3} = 0.368\times0.135 \approx 0.050$.

          **10-second example.** Two skin depths in, the field is $e^{-2} \approx 13.5\%$ of its surface value.

          **Trap.** Using 2 for $e$: $2^{-2} = 0.25$ is not $e^{-2}$.

        !!method
          **3. ln 2: the halving distances**

          **Rule.** $\ln2 \approx 0.693$. The field halves after $z = 0.693/\alpha$; the power halves after $0.347/\alpha$.

          **Why.** $e^{-\alpha z} = \frac12$ means $\alpha z = \ln2$. The power goes as $e^{-2\alpha z}$, so it halves when $2\alpha z = \ln2$.

          **10-second example.** $\alpha = 0.1$ Np/m: the field halves in 6.9 m and the power in 3.5 m.

          **Trap.** Using the $1/e$ distance, $1/\alpha$, for "half".

        !!method
          **4. Decibels: 10 log for power, 20 log for field**

          **Rule.** Power ratio in dB $= 10\log_{10}$; field (or voltage) ratio in dB $= 20\log_{10}$. Power $\times2$ is 3 dB, $\times10$ is 10 dB, $\times100$ is 20 dB; field $\times2$ is 6 dB, $\times10$ is 20 dB.

          **Why.** Power goes as the field squared, and $10\log_{10}(E^2) = 20\log_{10}E$. Also $\log_{10}2 \approx 0.301$.

          **10-second example.** A field that falls by 10 has lost 20 dB; its power has fallen by 100, which is also 20 dB. The two agree.

          **Trap.** $20\log$ on a power ratio, which doubles the answer.

        !!method
          **5. Nepers to decibels: 8.69**

          **Rule.** A wave that has traveled $z$ with attenuation $\alpha$ has lost $8.69\,\alpha z$ dB.

          **Why.** Its power fell by $e^{-2\alpha z}$, and
          $$10\log_{10}e^{2\alpha z} = 20\alpha z\log_{10}e$$
          With $\log_{10}e \approx 0.434$, that is $8.69\,\alpha z$.

          **10-second example.** $\alpha = 2$ Np/m over 0.5 m: $\alpha z = 1$ Np, which is 8.69 dB.

          **Trap.** $4.34\,\alpha z$, from forgetting that power is the field squared.
      `),
      Q(md`**Predict.** A wave with $\alpha = 0.5$ Np/m travels 2 m. Its power has fallen to about…`,
        [md`$13.5\%$`, md`$36.8\%$`, md`$25\%$`, md`$60.7\%$`], 0,
        [null, md`That is $e^{-1}$, the field factor. Power is $e^{-2\alpha z}$.`, md`That uses 2 for $e$.`, md`That is $e^{-1/2}$.`],
        md`$\alpha z = 1$, so the power is $e^{-2} \approx 0.135$ of where it started (8.69 dB down).`),
      R(md`**Drill A: roots, exponentials, logs, decibels.**`),
      Object.assign(G('rf_sp_roots', { need: 8 }), { id: 'e3-speed-num.r1' }),
      R(md`
        ### B. Constants that cancel, speeds and wavelengths

        !!method
          **6. Keep π until the end: 120π, 60π, 40π, 30π**

          **Rule.** $\eta_0 = 120\pi \approx 377\ \Omega$; $60\pi \approx 188\ \Omega$; $40\pi \approx 126\ \Omega$; $30\pi \approx 94\ \Omega$; $80\pi \approx 251\ \Omega$. Leave $\pi$ symbolic: it often cancels.

          **Why.** $\eta = 120\pi/\sqrt{\epsilon_r}$ for $\epsilon_r = 1, 4, 9, 16, 2.25$. And $\pi \approx 3.1416$, so $120\pi = 376.99$.

          **10-second example.** $E_0 = 60\pi$ V/m in $\epsilon_r = 4$: $H_0 = 60\pi/60\pi = 1$ A/m, with no arithmetic at all.

          **Trap.** Writing 377 too early, and then dividing 188.5 by 377 by hand.

        !!method
          **7. ε₀ = 10⁻⁹/36π: the π cancels against ω = 2πf**

          **Rule.** $\epsilon_0 = \frac{10^{-9}}{36\pi} \approx 8.84\times10^{-12}$ F/m, $\omega\epsilon_0 = \frac{f}{18}\times10^{-9}$ S/m, and $\mu_0\epsilon_0 = \frac{1}{9\times10^{16}} = 1/c^2$.

          **Why.** $2\pi f/36\pi = f/18$. And $(4\pi\times10^{-7})\cdot\frac{10^{-9}}{36\pi} = \frac{4\times10^{-16}}{36} = \frac{10^{-16}}{9}$.

          **10-second example.** At 1.8 GHz in $\epsilon_r = 4$: $\omega\epsilon = 4\times0.1 = 0.4$ S/m.

          **Trap.** Using $\epsilon_0 = 10^{-9}$ and losing the $36\pi$.

        !!method
          **8. Speeds: c/2, c/3, and 30 cm per nanosecond**

          **Rule.** $\epsilon_r = 2.25, 4, 9$ give $v = 2\times10^8$, $1.5\times10^8$, $10^8$ m/s. In air a wave goes 30 cm per ns, or 300 m per µs.

          **Why.** $v = c/\sqrt{\epsilon_r}$ with $\sqrt{\epsilon_r} = 1.5, 2, 3$. And $c = 3\times10^8$ m/s $= 0.3$ m/ns.

          **10-second example.** Spring 2024: 300 m at $c/2 = 150$ m/µs takes 2 µs.

          **Trap.** Using $c$ on a line that says $v = c/2$.

        !!method
          **9. Wavelengths: λ (in m) = 300/f (in MHz)**

          **Rule.** In air $\lambda = 300/f_\text{MHz}$ meters: 300 MHz is 1 m, 1 GHz is 30 cm, 3 GHz is 10 cm. In a dielectric divide by $\sqrt{\epsilon_r}$. And $\beta = 2\pi/\lambda$: at 300 MHz in air, $\beta = 2\pi$ rad/m.

          **Why.** $\lambda = c/f = 3\times10^8/(f_\text{MHz}\times10^6)$.

          **10-second example.** 150 MHz in $\epsilon_r = 4$: $\lambda = 2/2 = 1$ m, so $\beta = 2\pi$ rad/m.

          **Trap.** $\lambda = 2\pi c/f$. The $2\pi$ goes with $\omega$: $\lambda = 2\pi c/\omega = c/f$.
      `),
      Q(md`**Predict.** A wave at 600 MHz travels in a nonmagnetic dielectric with $\epsilon_r = 9$. Its $\beta$ is…`,
        [md`$12\pi$ rad/m`, md`$4\pi$ rad/m`, md`$36\pi$ rad/m`, md`$6$ rad/m`], 0,
        [null, md`That is the free-space value.`, md`That multiplies by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.`, md`That drops the $2\pi$: $\beta = 2\pi/\lambda$.`],
        md`In air, $\lambda_0 = 300/600 = 0.5$ m. In the dielectric $\lambda = 0.5/3 = 1/6$ m, so $\beta = 2\pi/(1/6) = 12\pi$ rad/m.`),
      R(md`**Drill B: constants, speeds, wavelengths.**`),
      Object.assign(G('rf_sp_const', { need: 8 }), { id: 'e3-speed-num.r2' }),
      R(md`
        ### C. Complex numbers by sight

        Built slowly in [Start: complex numbers](#/l/e3-complex).

        !!method
          **10. Six angles to know**

          **Rule.** $1 \pm j = \sqrt2\,e^{\pm j45°}$; $1 \pm j\sqrt3 = 2e^{\pm j60°}$; $\sqrt3 \pm j = 2e^{\pm j30°}$; $3 + j4 = 5e^{j53.1°}$; $4 + j3 = 5e^{j36.9°}$.

          **Why.** Size by Pythagoras: $\sqrt{1 + 1} = \sqrt2$, $\sqrt{1 + 3} = 2$, $\sqrt{9 + 16} = 5$. Angle from the triangle: legs 1 and 1 give $45°$; a long leg $\sqrt3$ times the short one gives $60°$ at the vertex next to the short leg.

          **10-second example.** The loss-tangent triangle $1 - j\sqrt3 = 2e^{-j60°}$, so $\tau = 30°$ there.

          **Trap.** Quadrants. $-1 + j$ is at $135°$, not $-45°$: $\tan^{-1}$ alone cannot tell them apart; look at the signs.

        !!method
          **11. Four identities: 1/j, 1/(1 + j), (1 + j)², (1 + j)(1 − j)**

          **Rule.** $1/j = -j$; $1/(1 + j) = (1 - j)/2$; $(1 + j)^2 = 2j$; $(1 + j)(1 - j) = 2$.

          **Why.** $j\cdot(-j) = 1$. Multiply top and bottom by the conjugate: $(1 + j)(1 - j) = 1 - j^2 = 2$. And $(1 + j)^2 = 1 + 2j + j^2 = 2j$.

          **10-second example.** $\gamma = (1 + j)/\delta$ squared: $\gamma^2 = 2j/\delta^2$, which is $j\omega\mu\sigma$ with $\delta^2 = 2/\omega\mu\sigma$ ✓.

          **Trap.** $1/(1 + j) = 1 - j$: you must also divide by $|1 + j|^2 = 2$.

        !!method
          **12. Multiply and divide in polar form**

          **Rule.** Sizes multiply (or divide), angles add (or subtract). Add and subtract in rectangular form.

          **Why.** $r_1e^{j\theta_1}\cdot r_2e^{j\theta_2} = r_1r_2e^{j(\theta_1 + \theta_2)}$, because exponents add.

          **10-second example.** $(1 + j)/(1 - j) = e^{j45°}/e^{-j45°} = e^{j90°} = j$ (the sizes cancel). $(1 + j\sqrt3)/(1 - j\sqrt3) = e^{j120°}$.

          **Trap.** Subtracting a negative angle wrongly: $45° - (-45°) = 90°$.

        !!method
          **13. Euler: e^(jπ) = −1, and sums give cos and sin**

          **Rule.** $e^{j\pi} = -1$, $e^{\pm j\pi/2} = \pm j$, $e^{j\theta} + e^{-j\theta} = 2\cos\theta$, $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$.

          **Why.** $e^{j\theta} = \cos\theta + j\sin\theta$. Adding the conjugate cancels the sines; subtracting cancels the cosines.

          **10-second example.** Prof. Chen's two-sheet problem: $e^{-j\beta z} - e^{j\beta z} = -2j\sin\beta z$ and $e^{-j\beta z} + e^{j\beta z} = 2\cos\beta z$.

          **Trap.** Dropping the $j$ in $2j\sin\theta$. It is what turns $\cos\omega t$ into $\sin\omega t$ in a standing wave.

        !!method
          **14. Square roots: root the size, halve the angle**

          **Rule.** $\sqrt{re^{j\theta}} = \sqrt r\,e^{j\theta/2}$. So $\sqrt j = e^{j45°} = (1 + j)/\sqrt2$ and $\sqrt{2j} = 1 + j$.

          **Why.** $(\sqrt re^{j\theta/2})^2 = re^{j\theta}$. Choose the root with the angle between $-90°$ and $90°$.

          **10-second example.** Good conductor: $\gamma = \sqrt{j\omega\mu\sigma} = \sqrt{\omega\mu\sigma}\,e^{j45°}$.

          **Trap.** Halving the size instead of rooting it, or rooting without halving the angle.
      `),
      Q(md`**Predict.** $\dfrac{j200}{1 + j}$ is…`,
        [md`$100 + j100$`, md`$100 - j100$`, md`$200 + j200$`, md`$j100$`], 0,
        [null, md`$j/(1 + j)$ has angle $90° - 45° = +45°$: both parts positive.`, md`That forgot to divide by $|1 + j|^2 = 2$.`, md`That divides by 2 but keeps the angle at $90°$; dividing by $1 + j$ also subtracts $45°$.`],
        md`Polar: $200e^{j90°}/(\sqrt2e^{j45°}) = 100\sqrt2\,e^{j45°} = 100 + j100$. Or multiply by $(1 - j)/2$: $j200(1 - j)/2 = 100 + j100$.`),
      R(md`**Drill C: complex numbers.**`),
      Object.assign(G('rf_sp_cx', { need: 8 }), { id: 'e3-speed-num.r3' }),
      R(md`
        ### D. Γ fractions and the geometric series

        !!method
          **15. The Γ table**

          **Rule.** With $r = R/Z_0$, $\Gamma = (r - 1)/(r + 1)$: $R = 2Z_0 \to 1/3$, $3Z_0 \to 1/2$, $4Z_0 \to 3/5$, $9Z_0 \to 4/5$, $Z_0/2 \to -1/3$, $Z_0/3 \to -1/2$. Back: $r = (1 + \Gamma)/(1 - \Gamma)$.

          **Why.** Divide top and bottom of $(R - Z_0)/(R + Z_0)$ by $Z_0$. Solve $\Gamma(r + 1) = r - 1$ for $r$ to go back.

          **10-second example.** $\Gamma = 3/5$: $r = (8/5)/(2/5) = 4$, so $R = 4Z_0$.

          **Trap.** Flipping $r$ flips the sign of $\Gamma$, not its size: $Z_0/2$ gives $-1/3$, not $-1/2$.

        !!method
          **16. τg as a fraction**

          **Rule.** With $s = R_g/Z_0$, $\tau_g = 1/(1 + s)$: $s = 1/3 \to 3/4$, $1/2 \to 2/3$, $1 \to 1/2$, $2 \to 1/3$, $3 \to 1/4$.

          **Why.** $Z_0/(R_g + Z_0)$; divide top and bottom by $Z_0$.

          **10-second example.** $R_g = 50$, $Z_0 = 150$: $s = 1/3$, $\tau_g = 3/4$.

          **Trap.** $s/(1 + s)$, the share across $R_g$.

        !!method
          **17. The geometric series: 1/(1 − x)**

          **Rule.** $1 + x + x^2 + \cdots = 1/(1 - x)$ when $|x| < 1$. With a negative $x$ the terms alternate, and the sum is less than 1.

          **Why.** Call the sum $S$. Then $xS = x + x^2 + \cdots = S - 1$, so $S(1 - x) = 1$.

          **10-second example.** $x = \Gamma_g\Gamma_L = (-1/3)(1/2) = -1/6$: the sum is $1/(7/6) = 6/7$.

          **Trap.** $1/(1 + x)$ for a negative $x$. Put the sign of $x$ in: $1 - (-1/6) = 7/6$.

        !!method
          **18. Steady state from the series**

          **Rule.** $V_\infty = \tau_gV_g(1 + \Gamma_L)/(1 - \Gamma_g\Gamma_L)$, and it must equal the DC divider $V_gR_L/(R_g + R_L)$: two ways to the same number, so one checks the other.

          **Why.** Every wave that reaches the load adds $(1 + \Gamma_L)$ times itself, and each round trip multiplies by $\Gamma_g\Gamma_L$: a geometric series.

          **10-second example.** $\tau_gV_g = 60$ V, $\Gamma_L = 1/3$, $\Gamma_g = -1/3$: $60(4/3)/(10/9) = 80\cdot0.9 = 72$ V. The divider: $90(100)/125 = 72$ V ✓.

          **Trap.** Leaving out the $(1 + \Gamma_L)$, which gives the forward waves only.

        !!method
          **19. After n round trips: (ΓgΓL)ⁿ**

          **Rule.** The forward wave after $n$ round trips is $\tau_gV_g(\Gamma_g\Gamma_L)^n$. Its sign alternates if $\Gamma_g\Gamma_L < 0$.

          **Why.** Each round trip hits each end once, so it multiplies by $\Gamma_L$ and by $\Gamma_g$.

          **10-second example.** $\tau_gV_g = 81$ V and $\Gamma_g = \Gamma_L = 1/3$: $81$, then $9$, then $1$ V.

          **Trap.** $n\Gamma_g\Gamma_L$: a round trip multiplies; it does not add.
      `),
      Q(md`**Predict.** $1 - \tfrac13 + \tfrac19 - \tfrac1{27} + \cdots$ equals…`,
        [md`$3/4$`, md`$3/2$`, md`$2/3$`, md`$4/3$`], 0,
        [null, md`That is $1/(1 - 1/3)$: it dropped the minus sign of $x$.`, md`That stops after two terms.`, md`That is $1 - x$ with $x = -1/3$, the denominator itself.`],
        md`$x = -1/3$, so the sum is $1/(1 - (-1/3)) = 1/(4/3) = 3/4$.`),
      R(md`**Drill D: Γ fractions and series.**`),
      Object.assign(G('rf_sp_frac', { need: 8 }), { id: 'e3-speed-num.r4' }),
      R(md`
        ### E. Trig values and electrical length

        !!method
          **20. The 30-45-60 values**

          **Rule.** $\cos30° = \sin60° = \frac{\sqrt3}{2} \approx 0.866$; $\cos45° = \sin45° \approx 0.707$; $\cos60° = \sin30° = \frac12$; $\tan30° \approx 0.577$; $\tan60° \approx 1.732$.

          **Why.** Half an equilateral triangle has sides $1$, $\sqrt3$, $2$; half a square has $1$, $1$, $\sqrt2$.

          **10-second example.** $10e^{j30°} = 8.66 + j5$.

          **Trap.** Swapping sine and cosine. At small angles the cosine is the big one.

        !!method
          **21. Electrical length in degrees: 360° per wavelength**

          **Rule.** $\beta d = 360°\times d/\lambda$ and $2\beta d = 720°\times d/\lambda$: $\lambda/12 \to 30°$, $\lambda/8 \to 45°$, $\lambda/6 \to 60°$, $\lambda/4 \to 90°$.

          **Why.** $\beta = 2\pi/\lambda$ radians per meter, and $2\pi$ radians is $360°$.

          **10-second example.** $d = 3\lambda/8$: $\beta d = 135°$ and $2\beta d = 270°$.

          **Trap.** Mixing $\beta d$ (for $\tan\beta d$ of a stub) with $2\beta d$ (for $\Gamma(d)$).

        !!method
          **22. tan βd at the stub lengths**

          **Rule.** $\lambda/12 \to 1/\sqrt3$, $\lambda/8 \to 1$, $\lambda/6 \to \sqrt3$, $\lambda/4 \to \infty$, $\lambda/3 \to -\sqrt3$, $3\lambda/8 \to -1$.

          **Why.** Trick 21 gives the angle; between $90°$ and $180°$ the tangent is negative.

          **10-second example.** A shorted 50 Ω stub $\lambda/6$ long: $j50\sqrt3 \approx j86.6\ \Omega$.

          **Trap.** A positive tangent past $\lambda/4$.

        !!method
          **23. ω and f: the 2π**

          **Rule.** $f = \omega/2\pi$. $\omega = 6\pi\times10^8$ rad/s is 300 MHz; $\omega = 2\pi\times10^9$ is 1 GHz. A problem that gives a plain $\omega = 3\times10^8$ rad/s (47.7 MHz) wants you to keep $\omega$.

          **Why.** One cycle is $2\pi$ radians.

          **10-second example.** $\beta = \omega/c$ with $\omega = 3\times10^8$: $\beta = 1$ rad/m, no $f$ needed.

          **Trap.** Treating $\omega$ as $f$, a factor of $6.28$.

        !!method
          **24. Units that check themselves**

          **Rule.** Before you finish, check one unit: $\alpha$ and $\beta$ in 1/m, $\eta$ in Ω, $\sigma/\omega\epsilon$ pure, $\langle S\rangle$ in W/m², $L$ in H/m, a time from length over speed.

          **Why.** Every slip with $f$ against $\omega$, $\epsilon_r$ against $\sqrt{\epsilon_r}$, or $\delta$ against $1/\delta$ changes either a unit or a power of ten.

          **10-second example.** $\eta = \sigma\delta$? Units S/m × m = S, not Ω: so it must be $1/\sigma\delta$.

          **Trap.** Skipping the check under time pressure. It takes five seconds.
      `),
      Q(md`**Predict.** A shorted 100 Ω stub is $\lambda/12$ long. Its impedance is about…`,
        [md`$j57.7\ \Omega$`, md`$j173\ \Omega$`, md`$-j173\ \Omega$`, md`$j100\ \Omega$`], 0,
        [null, md`That is $\tan60°$: it used $2\beta d$ instead of $\beta d$.`, md`That is an open stub of this length.`, md`That is $\lambda/8$.`],
        md`$\beta d = 360°/12 = 30°$ and $\tan30° = 1/\sqrt3 \approx 0.577$: $Z = j100(0.577) = j57.7\ \Omega$.`),
      R(md`**Drill E: trig and electrical length.**`),
      Object.assign(G('rf_sp_trig', { need: 8 }), { id: 'e3-speed-num.r5' }),
      R(md`
        ### The whole page on one card

        | Number | Value |
        |---|---|
        | $\sqrt2$, $\sqrt3$, $\sqrt5$, $\sqrt{10}$ | 1.414, 1.732, 2.236, 3.162 |
        | $e^{-1}$, $e^{-2}$, $e^{-1/2}$ | 0.368, 0.135, 0.607 |
        | $\ln2$, $\log_{10}2$ | 0.693, 0.301 |
        | 1 Np | 8.69 dB |
        | $120\pi$, $60\pi$, $40\pi$ | 377, 188, 126 Ω |
        | $\omega\epsilon_0$ | $f/(18\times10^9)$ S/m |
        | $\lambda$ in air | $300/f_\text{MHz}$ m |
        | $1 \pm j$, $1 \pm j\sqrt3$, $\sqrt3 \pm j$ | $\pm45°$, $\pm60°$, $\pm30°$ |
        | $1/j$, $(1 + j)^2$ | $-j$, $2j$ |
        | $\Gamma$ for $2Z_0$, $3Z_0$, $9Z_0$ | 1/3, 1/2, 4/5 |
        | $\Gamma$ for $Z_0/2$, $Z_0/3$ | −1/3, −1/2 |
        | $1 + x + x^2 + \cdots$ | $1/(1 - x)$ |
        | $\tan$ at $\lambda/12$, $\lambda/8$, $\lambda/6$ | 0.577, 1, 1.732 |
      `),
      ...miniQuiz('e3-speed-num'),
    ],
  });

  // ---------------------------------------------------------------- drill A: roots, exponentials, logs, dB
  const sq = (m) => (m === 10 ? '\\sqrt{10}' : `\\sqrt${m}`);
  GENS.rf_sp_roots = () => one([
    () => {
      const [N, k, m] = pick([[8, 2, 2], [12, 2, 3], [18, 3, 2], [20, 2, 5], [27, 3, 3], [32, 4, 2], [45, 3, 5], [50, 5, 2], [75, 5, 3], [200, 10, 2], [300, 10, 3], [1000, 10, 10], [40, 2, 10]]);
      return MC('A square root', md`Without a calculator, $\sqrt{${N}}$ is…`, md`$${k}${sq(m)} \approx ${r3(Math.sqrt(N))}$`,
        [[md`$${k * m}$`, md`That leaves $${m}$ outside without its root.`],
          [md`$${k * k}${sq(m)} \approx ${r3(k * k * Math.sqrt(m))}$`, md`That takes $${k * k}$ out of the root without rooting it.`],
          [md`$${N / 2}$`, md`That halves instead of taking a square root.`],
          [md`$${k} + ${sq(m)} \approx ${r3(k + Math.sqrt(m))}$`, md`$\sqrt{k^2m} = k\sqrt m$: multiply, do not add.`]],
        md`$${N} = ${k * k}\times${m}$, so $\sqrt{${N}} = ${k}${sq(m)} \approx ${r3(Math.sqrt(N))}$.`);
    },
    () => {
      const x = pick([0.5, 1, 1.5, 2, 3, 4]);
      const o = (v) => md`$${r3(v)}$`;
      return MC('e to a power', md`Without a calculator, $e^{-${p(x)}}$ is about…`, o(Math.exp(-x)),
        [[o(Math.exp(-2 * x)), md`That is $e^{-${p(2 * x)}}$: it squared.`],
          [o(Math.exp(-x / 2)), md`That is $e^{-${p(x / 2)}}$, the square root.`],
          [o(Math.pow(2, -x)), md`That uses 2 for $e$. $e \approx 2.718$.`],
          [o(Math.pow(10, -x)), md`That uses base 10.`]],
        md`$e^{-1} \approx 0.368$; ${x === 1 ? 'that is it' : x === 0.5 ? 'its root is 0.607' : `raise it to the ${p(x)}: $e^{-${p(x)}} \\approx ${r3(Math.exp(-x))}$`}.`);
    },
    () => {
      const a = pick([0.1, 0.5, 1, 2, 10, 100]), pw = pick([false, true]);
      const o = (v) => md`$${r3(v)}$ m`;
      const right = pw ? Math.LN2 / (2 * a) : Math.LN2 / a;
      return MC('Halving distance', md`A wave has $\alpha = ${p(a)}$ Np/m. Its ${pw ? 'power density' : 'field amplitude'} halves after a distance of…`, o(right),
        [[o(pw ? Math.LN2 / a : Math.LN2 / (2 * a)), pw ? md`That halves the field. Power goes as $e^{-2\alpha z}$.` : md`That halves the power. The field goes as $e^{-\alpha z}$.`],
          [o(1 / a), md`That is the $1/e$ distance of the field, not the half distance.`],
          [o(pw ? 1 / (2 * a) : 0.5 / a * 2.5), pw ? md`That is the $1/e$ distance of the power. Half needs $\ln2 = 0.693$.` : md`That is not $\ln 2/\alpha$: $\ln2 \approx 0.693$.`],
          [o(Math.LN10 / (pw ? 2 * a : a)), md`$\ln10$ is for a factor of 10. A half needs $\ln2$.`]],
        md`${pw ? md`$e^{-2\alpha z} = \frac12$ gives $z = \ln2/2\alpha$` : md`$e^{-\alpha z} = \frac12$ gives $z = \ln2/\alpha$`} $= ${r3(right)}$ m.`);
    },
    () => {
      const pw = pick([true, false]), rt = pick([2, 4, 10, 100, 1000, 0.5, 0.1]), k = pw ? 10 : 20, dB = k * Math.log10(rt);
      const o = (v) => md`$${r3(v)}$ dB`;
      return MC('Decibels', md`A ${pw ? 'power' : 'field amplitude'} ratio of ${p(rt)} is…`, o(dB),
        [[o((30 - k) * Math.log10(rt)), pw ? md`That is $20\log_{10}$, for field ratios. Power uses $10\log_{10}$.` : md`That is $10\log_{10}$, for power ratios. A field ratio uses $20\log_{10}$.`],
          [o(-dB), md`Sign: a ratio ${rt > 1 ? 'above' : 'below'} 1 is ${rt > 1 ? 'positive' : 'negative'} in dB.`],
          [o(k * Math.log(rt)), md`That uses $\ln$. Decibels use $\log_{10}$.`],
          [o(10 * rt), md`That multiplies the ratio by 10 instead of taking its log.`]],
        md`$${k}\log_{10}(${p(rt)}) = ${r3(dB)}$ dB.`);
    },
    () => {
      const a = pick([0.5, 1, 2, 5]), az = pick([0.5, 1, 2, 5]), z = az / a;
      const o = (v) => md`$${r3(v)}$ dB`;
      return MC('Nepers to decibels', md`A wave with $\alpha = ${p(a)}$ Np/m travels ${p(z)} m. It has lost…`, o(8.686 * az),
        [[o(4.343 * az), md`That is $10\log_{10}$ of the field factor. Power is the field squared: $8.69\,\alpha z$.`],
          [o(az), md`That is the loss in nepers, not decibels.`],
          [o(2 * az), md`That is the power exponent $2\alpha z$, still in nepers.`],
          [o(20 * az), md`The factor is $20\log_{10}e \approx 8.69$, not 20.`]],
        md`$\alpha z = ${p(az)}$ Np, and $8.69\times${p(az)} = ${r3(8.686 * az)}$ dB.`);
    },
  ]);

  // ---------------------------------------------------------------- drill B: constants, speeds, wavelengths
  const FQ = [[100e6, '100 MHz'], [150e6, '150 MHz'], [300e6, '300 MHz'], [600e6, '600 MHz'], [1e9, '1 GHz'], [1.5e9, '1.5 GHz'], [3e9, '3 GHz']];
  GENS.rf_sp_const = () => one([
    () => {
      const er = pick([2.25, 4, 9, 16, 25]), n = Math.sqrt(er);
      const o = (v) => md`$${r3(v)}\ \Omega$`;
      return MC('η of a dielectric, in ohms', md`A nonmagnetic dielectric has $\epsilon_r = ${p(er)}$. Its $\eta$ is about…`, o(120 * Math.PI / n),
        [[o(120 * Math.PI / er), md`That divides by $\epsilon_r$. Divide by $\sqrt{\epsilon_r} = ${p(n)}$.`],
          [o(120 * Math.PI * n), md`A larger $\epsilon$ lowers $\eta$.`],
          [o(377), md`That is free space.`],
          [o(120 / n), md`That dropped the $\pi$.`]],
        md`$120\pi/${p(n)} = ${p(120 / n)}\pi \approx ${r3(120 * Math.PI / n)}\ \Omega$.`);
    },
    () => {
      const [f, ft] = pick([[18e6, '18 MHz'], [180e6, '180 MHz'], [1.8e9, '1.8 GHz'], [9e9, '9 GHz']]), er = pick([2, 4, 9, 81]);
      const we = er * f / 18e9, o = (v) => md`$${r3(v)}$ S/m`;
      return MC('ωε in one line', md`At $f = ${ft}$, a material with $\epsilon_r = ${er}$ has $\omega\epsilon$ equal to…`, o(we),
        [[o(we / (2 * Math.PI)), md`That uses $f$ for $\omega$.`],
          [o(2 * Math.PI * f * er * 1e-9), md`That takes $\epsilon_0 = 10^{-9}$ and drops the $\frac{1}{36\pi}$.`],
          [o(we / er), md`That is $\omega\epsilon_0$. Multiply by $\epsilon_r$.`],
          [o(we * er), md`That multiplies by $\epsilon_r$ twice.`]],
        md`$\omega\epsilon_0 = f/(18\times10^9) = ${r3(f / 18e9)}$ S/m; times $${er}$: $${r3(we)}$ S/m.`);
    },
    () => {
      const l = pick([3, 30, 300, 600, 1.5]), [n, nt] = pick([[1.5, md`2.25`], [2, md`4`], [3, md`9`]]), T = l * n / 3e8;
      const o = (t) => (t < 1e-6 ? md`$${p(+(t * 1e9).toPrecision(3))}$ ns` : md`$${p(+(t * 1e6).toPrecision(3))}$ µs`);
      return MC('A delay', md`How long does a wave take to cross ${p(l)} m of line filled with a nonmagnetic dielectric of $\epsilon_r = ${nt}$?`, o(T),
        [[o(l / 3e8), md`That uses $c$. Here $v = c/${p(n)}$.`],
          [o(2 * T), md`That is the round trip.`],
          [o(l / (n * 3e8)), md`That multiplies the speed by $\sqrt{\epsilon_r}$. A dielectric slows the wave.`],
          [o(l * n * n / 3e8), md`That uses $\epsilon_r$ where $\sqrt{\epsilon_r}$ belongs.`]],
        md`$v = c/${p(n)} = ${p(3 / n)}\times10^8$ m/s, so $T = ${p(l)}/v = ${inl(o(T))}$.`);
    },
    () => {
      const [f, ft] = pick(FQ), er = pick([4, 9, 2.25]), n = Math.sqrt(er), lam = 3e8 / (f * n);
      const o = (v) => (v < 1 ? md`$${p(+(v * 100).toPrecision(3))}$ cm` : md`$${p(+v.toPrecision(3))}$ m`);
      return MC('A wavelength', md`What is the wavelength at ${ft} in a nonmagnetic medium with $\epsilon_r = ${er}$?`, o(lam),
        [[o(3e8 / f), md`That is the free-space wavelength.`],
          [o(3e8 / (f * er)), md`That divides by $\epsilon_r$, not $\sqrt{\epsilon_r}$.`],
          [o(2 * Math.PI * lam), md`$\lambda = v/f$. The $2\pi$ goes with $\omega$.`],
          [o(3e8 * n / f), md`That multiplies by $\sqrt{\epsilon_r}$. A slower wave is shorter.`],
          [o(lam / (2 * Math.PI)), md`That is $1/\beta$, not $\lambda$.`]],
        md`$\lambda = 300/f_\text{MHz}/\sqrt{\epsilon_r} = ${inl(o(lam))}$.`);
    },
    () => {
      const [f, ft] = pick(FQ), er = pick([4, 9, 2.25]), n = Math.sqrt(er), c2 = 2 * f * n / 3e8;   // beta = c2 * pi
      const o = (v) => md`$${p(+v.toPrecision(3))}\pi$ rad/m`;
      return MC('β from f', md`What is $\beta$ at ${ft} in a nonmagnetic medium with $\epsilon_r = ${er}$?`, o(c2),
        [[md`$${r3(f * n / 3e8)}$ rad/m`, md`That drops the $2\pi$: $\beta = 2\pi f/v$.`],
          [o(c2 / n), md`That is the free-space value.`],
          [o(c2 * n), md`That multiplies by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.`],
          [o(1 / c2), md`That is upside down: $\beta = 2\pi/\lambda$.`]],
        md`$\beta = 2\pi f\sqrt{\epsilon_r}/c = ${inl(o(c2))}$.`);
    },
  ]);

  // ---------------------------------------------------------------- drill C: complex numbers
  const CN = [['1 + j', '\\sqrt2', 45, '2', '2'], ['1 - j', '\\sqrt2', -45, '2', '2'], ['-1 + j', '\\sqrt2', 135, '2', '2'], ['-1 - j', '\\sqrt2', -135, '2', '2'],
    ['1 + j\\sqrt3', '2', 60, '1 + \\sqrt3', '4'], ['1 - j\\sqrt3', '2', -60, '1 + \\sqrt3', '4'], ['\\sqrt3 + j', '2', 30, '1 + \\sqrt3', '4'], ['\\sqrt3 - j', '2', -30, '1 + \\sqrt3', '4'],
    ['-\\sqrt3 + j', '2', 150, '1 + \\sqrt3', '4'], ['3 + j4', '5', 53.1, '7', '25'], ['4 - j3', '5', -36.9, '7', '25']];
  const pol = (m, a) => `$${m}\\,e^{${a < 0 ? '-' : ''}j${p(Math.abs(a))}°}$`;
  const ang = (a) => { let x = ((a % 360) + 540) % 360 - 180; if (Math.abs(x + 180) < 1e-9) x = 180; return +x.toFixed(1); };
  const ID = [
    [md`$1/j$`, md`$-j$`, [[md`$j$`, md`$j\cdot j = -1$, so $1/j$ cannot be $j$.`], [md`$1$`, md`$j\cdot1 = j \neq 1$.`], [md`$-1$`, md`That is $j^2$.`], [md`$0$`, md`$1/j$ is a perfectly good number: $j(-j) = 1$.`]], md`$j(-j) = -j^2 = 1$, so $1/j = -j$.`],
    [md`$\frac{1}{1 + j}$`, md`$\frac{1 - j}{2}$`, [[md`$\frac{1 + j}{2}$`, md`Multiplying by the conjugate flips the sign of $j$.`], [md`$1 - j$`, md`You must also divide by $|1 + j|^2 = 2$.`], [md`$\frac{1 - j}{\sqrt2}$`, md`Divide by $|1 + j|^2 = 2$, not by $|1 + j|$.`], [md`$\frac12$`, md`That drops the imaginary part.`]], md`$\frac{1}{1 + j}\cdot\frac{1 - j}{1 - j} = \frac{1 - j}{2}$.`],
    [md`$(1 + j)^2$`, md`$2j$`, [[md`$2$`, md`$1 + j^2 = 0$, and the cross term $2j$ is what is left.`], [md`$0$`, md`That forgot the cross term $2j$.`], [md`$2 + 2j$`, md`$j^2 = -1$, not $+1$.`], [md`$-2j$`, md`The cross term is $+2j$.`]], md`$1 + 2j + j^2 = 2j$.`],
    [md`$(1 + j)(1 - j)$`, md`$2$`, [[md`$0$`, md`$j\cdot(-j) = +1$, so the product is $1 + 1$.`], [md`$2j$`, md`The cross terms $-j + j$ cancel.`], [md`$1$`, md`$-j^2 = +1$ adds to the 1.`], [md`$-2$`, md`$-j^2 = +1$, not $-1$.`]], md`$1 - j^2 = 2$: a number times its conjugate is its size squared.`],
    [md`$\frac{1 + j}{1 - j}$`, md`$j$`, [[md`$-j$`, md`The angles subtract: $45° - (-45°) = +90°$.`], [md`$1$`, md`The sizes cancel, but the angles do not.`], [md`$2j$`, md`That forgot to divide by $|1 - j|^2 = 2$.`], [md`$0$`, md`Nothing cancels to zero here.`]], md`$e^{j45°}/e^{-j45°} = e^{j90°} = j$.`],
    [md`$\frac{1 + j\sqrt3}{1 - j\sqrt3}$`, md`$e^{j120°}$`, [[md`$e^{j60°}$`, md`The angles subtract: $60° - (-60°) = 120°$.`], [md`$e^{-j120°}$`, md`That subtracts the wrong way.`], [md`$2e^{j120°}$`, md`The sizes $2$ and $2$ divide to 1.`], [md`$-1$`, md`That would need an angle of $180°$.`]], md`$2e^{j60°}/2e^{-j60°} = e^{j120°}$.`],
    [md`$\frac{j}{1 + j}$`, md`$\frac{1 + j}{2}$`, [[md`$\frac{1 - j}{2}$`, md`$j(1 - j)/2 = (j + 1)/2$: check the sign of $j\cdot(-j) = +1$.`], [md`$\frac j2$`, md`That divided by 2 but dropped the $(1 - j)$.`], [md`$1 + j$`, md`Divide by $|1 + j|^2 = 2$.`], [md`$\frac{-1 + j}{2}$`, md`$j\cdot(-j) = +1$, so the real part is $+\frac12$.`]], md`$\frac{j(1 - j)}{2} = \frac{j + 1}{2}$.`],
  ];
  const EU = [
    [md`$e^{j\pi}$`, md`$-1$`, [[md`$1$`, md`That is $e^{j2\pi}$.`], [md`$j$`, md`That is $e^{j\pi/2}$.`], [md`$-j$`, md`That is $e^{-j\pi/2}$.`], [md`$0$`, md`$|e^{j\theta}| = 1$ always.`]], md`$\cos\pi + j\sin\pi = -1$.`],
    [md`$e^{-j\pi/2}$`, md`$-j$`, [[md`$j$`, md`That is $e^{+j\pi/2}$.`], [md`$-1$`, md`That is $e^{j\pi}$.`], [md`$1$`, md`That is $e^{0}$.`], [md`$0$`, md`$|e^{j\theta}| = 1$ always.`]], md`$\cos(-90°) + j\sin(-90°) = -j$.`],
    [md`$e^{j3\pi/2}$`, md`$-j$`, [[md`$j$`, md`$270°$ points down, not up.`], [md`$-1$`, md`That is $180°$.`], [md`$1$`, md`That is $360°$.`], [md`$\frac{3\pi}{2}j$`, md`The exponent is an angle, not a value.`]], md`$270° = -90°$: $-j$.`],
    [md`$e^{j\pi/4}$`, md`$\frac{1 + j}{\sqrt2}$`, [[md`$\frac{1 + j}{2}$`, md`The size must be 1: divide by $\sqrt2$, not 2.`], [md`$1 + j$`, md`That has size $\sqrt2$, not 1.`], [md`$\frac{j}{\sqrt2}$`, md`$\cos45° \neq 0$.`], [md`$\frac{1 - j}{\sqrt2}$`, md`That is $e^{-j\pi/4}$.`]], md`$\cos45° + j\sin45° = (1 + j)/\sqrt2$.`],
    [md`$\frac{e^{j\theta} + e^{-j\theta}}{2}$`, md`$\cos\theta$`, [[md`$\sin\theta$`, md`Adding the conjugates cancels the sines.`], [md`$j\sin\theta$`, md`That is half the difference.`], [md`$2\cos\theta$`, md`That forgot the $\frac12$.`], [md`$0$`, md`The cosines add; only the sines cancel.`]], md`$(\cos\theta + j\sin\theta) + (\cos\theta - j\sin\theta) = 2\cos\theta$.`],
    [md`$e^{j\theta} - e^{-j\theta}$`, md`$2j\sin\theta$`, [[md`$2\sin\theta$`, md`The $j$ stays: $j\sin\theta - (-j\sin\theta) = 2j\sin\theta$.`], [md`$2\cos\theta$`, md`The cosines cancel in a difference.`], [md`$j\sin\theta$`, md`Both terms contribute: $2j\sin\theta$.`], [md`$0$`, md`Only the cosines cancel.`]], md`$(\cos\theta + j\sin\theta) - (\cos\theta - j\sin\theta) = 2j\sin\theta$.`],
  ];
  const RT = [
    [md`$\sqrt j$`, md`$\frac{1 + j}{\sqrt2}$`, [[md`$\frac{1 + j}{2}$`, md`The size must be $\sqrt1 = 1$.`], [md`$j$`, md`That did not halve the angle.`], [md`$\frac{1 - j}{\sqrt2}$`, md`Half of $+90°$ is $+45°$.`], [md`$\frac{j}{\sqrt2}$`, md`That halved the size instead of halving the angle.`]], md`$j = e^{j90°}$; root: $e^{j45°} = (1 + j)/\sqrt2$.`],
    [md`$\sqrt{-j}$`, md`$\frac{1 - j}{\sqrt2}$`, [[md`$\frac{1 + j}{\sqrt2}$`, md`Half of $-90°$ is $-45°$.`], [md`$-j$`, md`That did not halve the angle.`], [md`$\frac{-1 + j}{\sqrt2}$`, md`That is at $135°$; the principal root is at $-45°$.`], [md`$j$`, md`$j^2 = -1$, not $-j$.`]], md`$-j = e^{-j90°}$; root: $e^{-j45°} = (1 - j)/\sqrt2$.`],
    [md`$\sqrt{2j}$`, md`$1 + j$`, [[md`$\sqrt2\,j$`, md`That did not halve the angle.`], [md`$\frac{1 + j}{\sqrt2}$`, md`The size is $\sqrt2$: $|1 + j| = \sqrt2$ ✓.`], [md`$2(1 + j)$`, md`Root the size: $\sqrt2$, not 2.`], [md`$1 - j$`, md`$(1 - j)^2 = -2j$.`]], md`$2j = 2e^{j90°}$; root: $\sqrt2e^{j45°} = 1 + j$. Check: $(1 + j)^2 = 2j$ ✓.`],
    [md`$\sqrt{1 - j\sqrt3}$`, md`$\sqrt2\,e^{-j30°}$`, [[md`$2e^{-j30°}$`, md`Root the size: $\sqrt2$.`], [md`$\sqrt2\,e^{-j60°}$`, md`Halve the angle.`], [md`$\sqrt2\,e^{j30°}$`, md`The angle is negative: $-60°$ halves to $-30°$.`], [md`$1 - j\sqrt[4]{3}$`, md`A root does not act on the parts separately.`]], md`$1 - j\sqrt3 = 2e^{-j60°}$; root: $\sqrt2e^{-j30°}$.`],
    [md`$\sqrt{4e^{j60°}}$`, md`$2e^{j30°}$`, [[md`$4e^{j30°}$`, md`Root the size too.`], [md`$2e^{j60°}$`, md`Halve the angle too.`], [md`$2e^{j120°}$`, md`That doubled the angle.`], [md`$16e^{j120°}$`, md`That squared instead of rooting.`]], md`$\sqrt4 = 2$ and $60°/2 = 30°$.`],
  ];
  const rect = (m, a) => {
    const re = m * Math.cos(a * Math.PI / 180), im = m * Math.sin(a * Math.PI / 180);
    const R3 = (x) => p(+x.toPrecision(3));
    if (Math.abs(re) < 1e-9) return `$${im < 0 ? '-' : ''}j${R3(Math.abs(im))}$`;
    return `$${R3(re)} ${im < 0 ? '-' : '+'} j${R3(Math.abs(im))}$`;
  };
  GENS.rf_sp_cx = () => one([
    () => {
      const [z, mT, a, legsT, sqT] = pick(CN);
      const wr = [[pol(mT, ang(90 - a)), md`That is the other acute angle: $\tan^{-1}$ of the ratio upside down.`],
        [pol(legsT.includes('+') ? `(${legsT})` : legsT, a), md`That adds the legs. The size needs Pythagoras.`],
        [pol(mT, -a), md`Check the sign of the imaginary part: it sets the sign of the angle.`],
        [pol(sqT, a), md`That is the size squared. Take the root.`], [pol(mT, ang(2 * a)), md`That doubles the angle.`]];
      if (Math.abs(a) > 90) wr.push([pol(mT, ang(a - 180)), md`$\tan^{-1}$ alone gives this angle, but the real part is negative: the point is in the ${a > 0 ? 'second' : 'third'} quadrant.`]);
      return MC('Polar form by sight', md`$${z}$ in polar form is…`, pol(mT, a), wr, md`Size $${mT}$ by Pythagoras; angle $${p(a)}°$ from the triangle and the signs: $${z} = ${pol(mT, a).replace(/\$/g, '')}$.`);
    },
    () => { const [q, r, w, s] = pick(ID); return MC('An identity', md`${q} equals…`, r, w, s); },
    () => { const [q, r, w, s] = pick(EU); return MC('Euler', md`${q} equals…`, r, w, s); },
    () => {
      const [m, a] = pick([[10, 30], [2, -60], [4, 135], [6, 90], [2, 150], [10, -45], [4, -120]]);
      const cs = Math.cos(a * Math.PI / 180), sn = Math.sin(a * Math.PI / 180);
      const R3 = (x) => p(+x.toPrecision(3));
      const mk = (re, im) => (Math.abs(re) < 1e-9 ? `$${im < 0 ? '-' : ''}j${R3(Math.abs(im))}$` : `$${R3(re)} ${im < 0 ? '-' : '+'} j${R3(Math.abs(im))}$`);
      return MC('Polar to rectangular', md`$${m}e^{${a < 0 ? '-' : ''}j${Math.abs(a)}°}$ in rectangular form is…`, rect(m, a),
        [[mk(m * sn, m * cs), md`That swaps cosine and sine: the real part is $r\cos\theta$.`],
          [mk(m * cs, -m * sn), md`That flips the sign of the imaginary part.`],
          [mk(-m * cs, m * sn), md`That flips the sign of the real part.`],
          [mk(m * Math.sign(cs || 1), m * Math.sign(sn || 1)), md`The parts are $r\cos\theta$ and $r\sin\theta$, not $r$ each.`]],
        md`$${m}\cos${a}° + j${m}\sin${a}° = ${rect(m, a).replace(/\$/g, '')}$.`);
    },
    () => { const [q, r, w, s] = pick(RT); return MC('A complex square root', md`${q} (the root with angle between $-90°$ and $90°$) is…`, r, w, s); },
  ]);

  // ---------------------------------------------------------------- drill D: Gamma fractions and series
  GENS.rf_sp_frac = () => one([
    () => {
      const r = pick([2, 3, 9, 4, 1 / 2, 1 / 3, 1 / 9, 1 / 4, 3 / 2, 2 / 3]), Gm = (r - 1) / (r + 1);
      if (pick([true, false])) {
        return MC('Γ from r', md`A load is $R = ${Fr(r)}Z_0$. Its $\Gamma$ is…`, md`$${Fr(Gm)}$`,
          [[md`$${Fr(-Gm)}$`, md`That is $(1 - r)/(1 + r)$: the sign is flipped.`],
            [md`$${Fr(1 / Gm)}$`, md`That is upside down; $|\Gamma| \le 1$.`],
            [md`$${Fr(1 / r)}$`, md`That is $Z_0/R$.`],
            [md`$${Fr((r - 1) / r)}$`, md`The bottom is $r + 1$.`]],
          md`$\Gamma = (r - 1)/(r + 1) = (${Fr(r)} - 1)/(${Fr(r)} + 1) = ${Fr(Gm)}$.`);
      }
      return MC('r from Γ', md`A resistive load has $\Gamma = ${Fr(Gm)}$. Then $R/Z_0$ is…`, md`$${Fr(r)}$`,
        [[md`$${Fr(1 / r)}$`, md`That is $(1 - \Gamma)/(1 + \Gamma)$, upside down.`],
          [md`$${Fr(1 + Gm)}$`, md`That is $1 + \Gamma$; divide by $1 - \Gamma$ too.`],
          [md`$${Fr(1 / (1 - Gm))}$`, md`The top is $1 + \Gamma$.`],
          [md`$${Fr((1 + Math.abs(Gm)) / (1 - Math.abs(Gm)))}$`, md`That is the VSWR. With $\Gamma < 0$, $R < Z_0$.`]],
        md`$r = (1 + \Gamma)/(1 - \Gamma) = ${Fr(1 + Gm)}/${Fr(1 - Gm)} = ${Fr(r)}$.`);
    },
    () => {
      const s = pick([1 / 2, 2, 1 / 3, 3, 1 / 4]);
      return MC('τg as a fraction', md`$R_g = ${Fr(s)}Z_0$. Then $\tau_g$ is…`, md`$${Fr(1 / (1 + s))}$`,
        [[md`$${Fr(s / (1 + s))}$`, md`That is the share across $R_g$.`],
          [md`$${Fr(2 * s / (1 + s))}$`, md`That is $1 + \Gamma_g$, which is not $\tau_g$.`],
          [md`$${Fr(1 / s)}$`, md`That is $Z_0/R_g$.`],
          [md`$${Fr((s - 1) / (s + 1))}$`, md`That is $\Gamma_g$.`]],
        md`$\tau_g = Z_0/(R_g + Z_0) = 1/(1 + ${Fr(s)}) = ${Fr(1 / (1 + s))}$.`);
    },
    () => {
      const x = pick([1 / 2, 1 / 3, -1 / 3, -1 / 2, 1 / 4, -1 / 6, 1 / 6, -1 / 9]);
      return MC('A geometric series', md`$1 + x + x^2 + x^3 + \cdots$ with $x = ${Fr(x)}$ equals…`, md`$${Fr(1 / (1 - x))}$`,
        [[md`$${Fr(1 / (1 + x))}$`, md`Sign: the sum is $1/(1 - x)$, with $x = ${Fr(x)}$ put in as it is.`],
          [md`$${Fr(1 + x)}$`, md`That stops after two terms.`],
          [md`$${Fr(1 - x)}$`, md`That is the denominator, not the sum.`],
          ['It diverges', md`$|x| < 1$, so the terms shrink and the sum converges.`]],
        md`$S = 1/(1 - x) = 1/(1 - (${Fr(x)})) = ${Fr(1 / (1 - x))}$.`);
    },
    () => {
      const [Vg, Rg, Z0, RL] = pick(BC), tg = tgOf(Rg, Z0), Gg = GOf(Rg, Z0), GL = GOf(RL, Z0), V1 = tg * Vg;
      const Vinf = V1 * (1 + GL) / (1 - Gg * GL);
      return MC('Steady state by the series', md`$\tau_gV_g = ${p(+V1.toPrecision(4))}$ V, $\Gamma_L = ${Fr(GL)}$, $\Gamma_g = ${Fr(Gg)}$. Summing every wave at the load gives…`, V(Vinf),
        [[V(V1 * (1 + GL)), md`That is the first arrival only.`],
          [V(V1 * (1 + GL) / (1 + Gg * GL)), md`Sign: $1/(1 - x)$ with $x = \Gamma_g\Gamma_L = ${Fr(Gg * GL)}$.`],
          [V(V1 / (1 - Gg * GL)), md`That leaves out $(1 + \Gamma_L)$: each arrival brings its reflection along.`],
          [V(V1 * (1 + GL) * (1 - Gg * GL)), md`Divide by $1 - \Gamma_g\Gamma_L$, do not multiply.`]],
        md`$\frac{${p(+V1.toPrecision(4))}(1 + ${Fr(GL)})}{1 - (${Fr(Gg * GL)})} = ${p(+Vinf.toPrecision(4))}$ V, the DC divider value $V_gR_L/(R_g + R_L)$ ✓.`);
    },
    () => {
      const [V1, Gg, GL] = pick([[60, -1 / 3, 1 / 3], [60, -1 / 2, -1 / 2], [81, 1 / 3, 1 / 3], [64, 1 / 2, -1 / 2], [90, -1 / 3, 1 / 2]]), n = pick([2, 3]), x = Gg * GL;
      return MC('After n round trips', md`$\tau_gV_g = ${V1}$ V, $\Gamma_g = ${Fr(Gg)}$, $\Gamma_L = ${Fr(GL)}$. The forward wave after ${n} round trips is…`, V(V1 * Math.pow(x, n)),
        [[V(V1 * n * x), md`A round trip multiplies; it does not add. That is $n\Gamma_g\Gamma_L$.`],
          [V(V1 * Math.pow(x, n - 1)), md`That is one round trip short.`],
          [V(V1 * Math.pow(Gg + GL, n)), md`Each trip multiplies by $\Gamma_g\Gamma_L$, not $\Gamma_g + \Gamma_L$.`],
          [V(V1 * Math.pow(GL, n)), md`That leaves out $\Gamma_g$: each round trip hits both ends.`]],
        md`$${V1}(\Gamma_g\Gamma_L)^${n} = ${V1}(${Fr(x)})^${n} = ${p(+(V1 * Math.pow(x, n)).toPrecision(4))}$ V.`);
    },
  ]);

  // ---------------------------------------------------------------- drill E: trig and electrical length
  const TX = (v) => {
    const s = v < 0 ? '-' : '', a = Math.abs(v), e = (x) => Math.abs(a - x) < 1e-9;
    if (e(0.5)) return `${s}\\tfrac12`;
    if (e(Math.sqrt(3) / 2)) return `${s}\\tfrac{\\sqrt3}{2}`;
    if (e(Math.SQRT1_2)) return `${s}\\tfrac{\\sqrt2}{2}`;
    if (e(1)) return `${s}1`;
    if (e(Math.sqrt(3))) return `${s}\\sqrt3`;
    if (e(1 / Math.sqrt(3))) return `${s}\\tfrac{1}{\\sqrt3}`;
    if (e(Math.SQRT2)) return `${s}\\sqrt2`;
    if (e(2)) return `${s}2`;
    if (e(2 / Math.sqrt(3))) return `${s}\\tfrac{2}{\\sqrt3}`;
    return `${s}${r3(a)}`;
  };
  const tv = (v) => (TX(v) === `${r3(v)}` || TX(v) === `${v < 0 ? '-' : ''}${r3(Math.abs(v))}` ? md`$${TX(v)}$` : md`$${TX(v)} \approx ${r3(v)}$`);
  GENS.rf_sp_trig = () => one([
    () => {
      const fn = pick(['cos', 'sin', 'tan']), a = pick(fn === 'tan' ? [30, 60, 120, 150, -30, -60] : [30, 45, 60, 120, 135, 150, -30, -60]), R = a * Math.PI / 180;
      const F = { cos: Math.cos, sin: Math.sin, tan: Math.tan }, v = F[fn](R), FNT = `\\${fn} `;
      const other = fn === 'cos' ? Math.sin(R) : fn === 'sin' ? Math.cos(R) : 1 / Math.tan(R);
      return MC('A trig value', md`$${FNT}(${a}°)$ is…`, tv(v),
        [[tv(other), fn === 'tan' ? md`That is the cotangent, $1/\tan$.` : md`That is the ${fn === 'cos' ? 'sine' : 'cosine'}.`],
          [tv(-v), md`Check the sign: ${a}° is in the ${a > 90 ? 'second' : a < 0 ? 'fourth' : 'first'} quadrant.`],
          [tv(1 / v), md`That is the reciprocal.`],
          [tv(v * v * Math.sign(v)), md`That squared it.`], ...(fn === 'tan' ? [[tv(Math.sin(R)), md`That is the sine, not the tangent.`], [tv(Math.cos(R)), md`That is the cosine, not the tangent.`]] : [])],
        md`$${FNT}(${a}°) = ${TX(v)} \approx ${r3(v)}$.`);
    },
    () => {
      const [f, dT] = pick([[1 / 8, md`\lambda/8`], [1 / 6, md`\lambda/6`], [1 / 12, md`\lambda/12`], [1 / 4, md`\lambda/4`], [3 / 8, md`3\lambda/8`], [1 / 3, md`\lambda/3`]]), two = pick([false, true]);
      const k = two ? 720 : 360, o = (v) => md`$${p(+v.toPrecision(4))}°$`;
      return MC('Electrical length', md`For $d = ${dT}$, ${two ? md`$2\beta d$` : md`$\beta d$`} in degrees is…`, o(k * f),
        [[o((two ? 360 : 720) * f), two ? md`That is $\beta d$. $\Gamma(d)$ needs twice that.` : md`That is $2\beta d$.`],
          [o(k / 2 * f), md`A full wavelength is $360°$ of $\beta d$, not $180°$.`],
          [o((two ? 4 : 2) * Math.PI * f), md`That is the value in radians, not degrees.`],
          [o(2 * k * f), md`That doubles once too often.`]],
        md`$\beta d = 360°\times d/\lambda = ${p(360 * f)}°$${two ? md`, so $2\beta d = ${p(720 * f)}°$` : ''}.`);
    },
    () => {
      const [, dT, deg] = pick(DL), R = deg * Math.PI / 180, t = Math.tan(R), t2 = Math.tan(2 * R);
      return MC('tan βd of a stub', md`For $d = ${dT}$, $\tan\beta d$ is…`, tv(t),
        [[tv(1 / t), md`That is $\cot\beta d$.`],
          [tv(-t), md`Check the sign: $\beta d = ${deg}°$ is ${deg > 90 ? 'past' : 'below'} $90°$.`],
          [Math.abs(t2) > 1e6 ? md`$\infty$` : tv(t2), md`That uses $2\beta d$. A stub's impedance has $\tan\beta d$.`],
          [tv(Math.sin(R)), md`That is $\sin\beta d$.`]],
        md`$\beta d = ${deg}°$, and $\tan${deg}° = ${TX(t)}$.`);
    },
    () => {
      if (pick([true, false])) {
        const m = pick([1, 2, 4, 6, 12]), f = m / 2 * 1e8;
        const o = (x) => md`$${p(+(x / 1e6).toPrecision(3))}$ MHz`;
        return MC('f from ω', md`$\omega = ${m === 1 ? '' : m}\pi\times10^8$ rad/s. The frequency is…`, o(f),
          [[o(m * 1e8), md`That divides by $\pi$ only. $f = \omega/2\pi$.`],
            [o(m * Math.PI * 1e8), md`That is $\omega$ itself, read as hertz.`],
            [o(m * Math.PI / 2 * 1e8), md`That divides by 2 only.`],
            [o(2 * Math.PI * m * Math.PI * 1e8), md`That multiplies by $2\pi$ instead of dividing.`]],
          md`$f = \omega/2\pi = ${m === 1 ? '' : m}\pi\times10^8/2\pi = ${inl(o(f))}$.`);
      }
      const [f, ft] = pick(FQ), w = 2 * f;    // omega = w * pi
      const o = (x) => md`$${p(+(x / 1e8).toPrecision(3))}\pi\times10^8$ rad/s`;
      return MC('ω from f', md`At ${ft}, $\omega$ is…`, o(w),
        [[o(f), md`That multiplies by $\pi$ only: $\omega = 2\pi f$.`],
          [md`$${p(+(f / 1e8).toPrecision(3))}\times10^8$ rad/s`, md`That is $f$ itself. $\omega = 2\pi f$.`],
          [o(4 * f), md`That multiplies by $4\pi$.`],
          [md`$${p(+(f / (2 * Math.PI) / 1e8).toPrecision(3))}\times10^8$ rad/s`, md`That divides by $2\pi$ instead of multiplying.`]],
        md`$\omega = 2\pi f = ${inl(o(w))}$.`);
    },
  ]);

  // ---------------------------------------------------------------- question bank, lesson 3
  EM.BANK['e3-speed-num'] = [
    Q(md`$\sqrt{12}$ is closest to…`, ['3.46', '3.00', '6.00', '4.24'], 0,
      [null, md`$3^2 = 9$, too small.`, md`That halved 12.`, md`That is $\sqrt{18} = 3\sqrt2$.`], md`$\sqrt{12} = 2\sqrt3 \approx 3.46$.`),
    Q(md`$|2 + j|$ is…`, [md`$\sqrt5 \approx 2.24$`, '3', md`$\sqrt3 \approx 1.73$`, '5'], 0,
      [null, md`That adds the parts.`, md`That is $\sqrt{4 - 1}$: the imaginary part is squared and added.`, md`That is the size squared.`], md`$\sqrt{4 + 1} = \sqrt5$.`),
    Q(md`$e^{-3}$ is about…`, ['0.050', '0.135', '0.125', '0.001'], 0,
      [null, md`That is $e^{-2}$.`, md`That is $2^{-3}$.`, md`That is $10^{-3}$.`], md`$e^{-3} = e^{-1}e^{-2} \approx 0.368\times0.135 \approx 0.050$.`),
    Q(md`$e^{-1/2}$ is about…`, ['0.607', '0.5', '0.368', '0.184'], 0,
      [null, md`That is $e^{-0.693}$.`, md`That is $e^{-1}$.`, md`That halves $e^{-1}$ instead of rooting it.`], md`$\sqrt{0.368} \approx 0.607$.`),
    Q(md`A field ratio of 100 is…`, ['40 dB', '20 dB', '100 dB', '4.6 dB'], 0,
      [null, md`That is $10\log_{10}$, for a power ratio.`, md`That multiplies by 1.`, md`That is $\ln100$.`], md`$20\log_{10}100 = 40$ dB (the power ratio is $10^4$).`),
    Q(md`A power that has fallen to half has dropped by…`, ['3 dB', '6 dB', '0.5 dB', '0.69 dB'], 0,
      [null, md`That is for a field ratio of 2.`, md`dB uses a log.`, md`That is $\ln2$, in nepers.`], md`$10\log_{10}2 \approx 3.01$ dB.`),
    Q(md`$\alpha = 0.2$ Np/m over 5 m is a loss of…`, ['8.69 dB', '4.34 dB', '1 dB', '20 dB'], 0,
      [null, md`That forgot that power is the field squared.`, md`1 Np, not 1 dB.`, md`The factor is 8.69, not 20.`], md`$\alpha z = 1$ Np $= 8.69$ dB.`),
    Q(md`$60\pi\ \Omega$ is about…`, ['188 Ω', '180 Ω', '377 Ω', '126 Ω'], 0,
      [null, md`That uses $\pi = 3$.`, md`That is $120\pi$.`, md`That is $40\pi$.`], md`$60\times3.1416 = 188.5\ \Omega$.`),
    Q(md`$\mu_0\epsilon_0$ is…`, [md`$\frac{1}{9}\times10^{-16}$ s²/m²`, md`$\frac{1}{3}\times10^{-8}$ s/m`, md`$9\times10^{16}$ m²/s²`, md`$\frac{4}{36}\times10^{-16}\pi$`], 0,
      [null, md`That is $1/c$.`, md`That is $c^2$.`, md`The $\pi$'s cancel: $4\pi/36\pi = 1/9$.`], md`$1/c^2 = 1/(9\times10^{16})$.`),
    Q(md`$\omega\epsilon_0$ at 1.8 GHz is…`, ['0.1 S/m', '0.016 S/m', '11.3 S/m', '1.8 S/m'], 0,
      [null, md`That uses $f$ for $\omega$.`, md`That drops the $\frac{1}{36\pi}$.`, md`That is $f\times10^{-9}$.`], md`$f/(18\times10^9) = 1.8\times10^9/(18\times10^9) = 0.1$ S/m.`),
    Q(md`A wave crosses 150 m of line at $c/3$ in…`, ['1.5 µs', '0.5 µs', '3 µs', '4.5 µs'], 0,
      [null, md`That uses $c$.`, md`That is the round trip.`, md`That multiplies by 9.`], md`$c/3 = 10^8$ m/s $= 100$ m/µs, so 1.5 µs.`),
    Q(md`The wavelength at 1 GHz in $\epsilon_r = 4$ is…`, ['15 cm', '30 cm', '7.5 cm', '94 cm'], 0,
      [null, md`That is free space.`, md`That divides by $\epsilon_r$.`, md`That has an extra $\pi$.`], md`$30/2 = 15$ cm.`),
    Q(md`$1 - j$ in polar form is…`, [md`$\sqrt2\,e^{-j45°}$`, md`$\sqrt2\,e^{j45°}$`, md`$2e^{-j45°}$`, md`$\sqrt2\,e^{-j135°}$`], 0,
      [null, md`The imaginary part is negative.`, md`That is the size squared.`, md`That is $-1 - j$.`], md`Size $\sqrt2$, angle $-45°$.`),
    Q(md`$-\sqrt3 + j$ has angle…`, ['150°', '−30°', '30°', '120°'], 0,
      [null, md`$\tan^{-1}$ alone gives $-30°$, but the real part is negative: second quadrant.`, md`That ignores the negative real part.`, md`That is $-1 + j\sqrt3$.`], md`$180° - 30° = 150°$.`),
    Q(md`$(1 - j)^2$ is…`, [md`$-2j$`, md`$2j$`, md`$0$`, md`$2$`], 0,
      [null, md`The cross term is $-2j$.`, md`$1 + j^2 = 0$, plus the cross term.`, md`$1 + j^2 = 0$, not 2.`], md`$1 - 2j + j^2 = -2j$.`),
    Q(md`$e^{j\theta} + e^{-j\theta}$ equals…`, [md`$2\cos\theta$`, md`$2j\sin\theta$`, md`$\cos\theta$`, md`$2\sin\theta$`], 0,
      [null, md`That is the difference.`, md`Two cosines add: $2\cos\theta$.`, md`The sines cancel.`], md`The sines cancel and the cosines add.`),
    Q(md`$\gamma^2 = j8\times10^6\ \text{m}^{-2}$. Then $\gamma$ is…`, [md`$2000(1 + j)$ 1/m`, md`$2828(1 + j)$ 1/m`, md`$2828\,e^{j90°}$ 1/m`, md`$2000\sqrt2\,j$ 1/m`], 0,
      [null, md`$\sqrt{8\times10^6} = 2828$ is the size; split it at $45°$: $2828/\sqrt2 = 2000$ each.`, md`Halve the angle.`, md`Halve the angle: $45°$.`], md`$\sqrt{j8\times10^6} = 2828e^{j45°} = 2000 + j2000$, so $\delta = 0.5$ mm.`),
    Q(md`$R = 9Z_0$ gives $\Gamma = $`, ['4/5', '8/9', '9/10', '5/4'], 0,
      [null, md`The bottom is $r + 1 = 10$.`, md`The top is $r - 1 = 8$.`, md`Upside down.`], md`$(9 - 1)/(9 + 1) = 4/5$.`),
    Q(md`$\Gamma = -1/2$ means $R = $`, [md`$Z_0/3$`, md`$Z_0/2$`, md`$3Z_0$`, md`$2Z_0$`], 0,
      [null, md`$Z_0/2$ gives $-1/3$.`, md`That is $+1/2$.`, md`That is $+1/3$.`], md`$r = (1 - 1/2)/(1 + 1/2) = 1/3$.`),
    Q(md`$R_g = 2Z_0$. Then $\tau_g$ is…`, ['1/3', '2/3', '1/2', '4/3'], 0,
      [null, md`That is the share across $R_g$.`, md`That is for $R_g = Z_0$.`, md`That is $1 + \Gamma_g$.`], md`$1/(1 + 2) = 1/3$.`),
    Q(md`$1 + \tfrac12 + \tfrac14 + \tfrac18 + \cdots$ is…`, ['2', '3/2', '∞', '2/3'], 0,
      [null, md`That stops after two terms.`, md`The terms shrink geometrically: it converges.`, md`That uses $1/(1 + x)$.`], md`$1/(1 - 1/2) = 2$.`),
    Q(md`$\tau_gV_g = 60$ V, $\Gamma_L = -1/2$, $\Gamma_g = -1/2$. The sum of every wave at the load is…`, ['40 V', '30 V', '24 V', '80 V'], 0,
      [null, md`That is the first arrival.`, md`That uses $1 + \Gamma_g\Gamma_L$ in the denominator.`, md`That leaves out $(1 + \Gamma_L)$.`], md`$60(1/2)/(1 - 1/4) = 30/(3/4) = 40$ V (Spring 2024's single-line version: $80\times50/100 = 40$ ✓).`),
    Q(md`$\tan(3\lambda/8 \text{ stub})$, that is $\tan135°$, is…`, ['−1', '1', '0', '∞'], 0,
      [null, md`Past $90°$ the tangent is negative.`, md`That is at $180°$.`, md`That is at $90°$.`], md`$\tan135° = -1$.`),
    Q(md`$d = \lambda/6$. $2\beta d$ is…`, ['120°', '60°', '30°', '240°'], 0,
      [null, md`That is $\beta d$.`, md`That is $\lambda/12$.`, md`That doubles twice.`], md`$720°/6 = 120°$.`),
    Q(md`$\omega = 2\pi\times10^9$ rad/s is…`, ['1 GHz', '6.28 GHz', '2 GHz', '159 MHz'], 0,
      [null, md`That is $\omega$ read as hertz.`, md`That divides by $\pi$ only.`, md`That divides by $2\pi$ twice.`], md`$f = \omega/2\pi = 10^9$ Hz.`),
  ];
  attachBank(L3);
})();

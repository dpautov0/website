/* Topics 6 and 7 (Lectures 22-24, formula sheet pages 2-3).
   w2-read:   reading a lossy wave (alpha, beta, omega, lambda, v_p, delta, direction), gamma as an arrow and tan(tau) = alpha/beta,
              eta from an E and H pair, H from E in any orientation, mu, sigma, eps back from eta*gamma and gamma/eta.
   w2-limits: the loss tangent decides; the binomial expansion gives the imperfect dielectric; the large-x limit gives the good
              conductor; skin depth and how it scales; copper; seawater and the submarine; the PEC limit; signal transmission.
   Builds on w2-gamma.js (Topic 5) and links to it instead of repeating its derivations. Generator prefix: w2r. */
(function () {
  'use strict';
  const { R, RF, Q, G, P } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- shared helpers
  const AX = ['x', 'y', 'z'];
  const DEG = 180 / Math.PI;
  const uv = (i, s = 1) => `${s < 0 ? '-' : ''}\\hat ${AX[i]}`;
  const uvp = (i, s = 1) => (s < 0 ? `(-\\hat ${AX[i]})` : `\\hat ${AX[i]}`);
  // unit-vector cross product: (i, si) x (j, sj) = (k, s)
  const crossU = (i, si, j, sj) => [3 - i - j, ((j - i + 3) % 3 === 1 ? 1 : -1) * si * sj];
  const r2 = (x) => Math.round(x * 100) / 100;
  const phT = (x) => { const r = r2(x); return r === 0 ? '' : r > 0 ? ` + ${r}°` : ` - ${-r}°`; };
  const wrap = (d) => { let x = (((d + 180) % 360) + 360) % 360 - 180; if (x <= -180) x += 360; return r2(x); };
  const coefT = (x) => (Math.abs(x - 1) < 1e-12 ? '' : p(+x.toPrecision(6)));
  // amp e^{-/+ a u} fn(w t -/+ b u + ph): dir = +1 travels toward +u
  const waveTex = (o) => {
    const ex = `\\,e^{${o.dir > 0 ? '-' : ''}${o.aT}${o.u}}`;
    return `${o.amp}${ex}\\${o.fn}(${o.wT}t ${o.dir > 0 ? '-' : '+'} ${o.bT}${o.u}${phT(o.ph)})`;
  };
  // gamma triangles: alpha : beta, |gamma|, tau = atan(alpha/beta) in degrees
  const TRI = [
    { a: 1, b: Math.sqrt(3), g: 2, s3: true },
    { a: 3, b: 4, g: 5 },
    { a: 5, b: 12, g: 13 },
    { a: 7, b: 24, g: 25 },
  ].map((t) => Object.assign(t, { tau: Math.atan(t.a / t.b) * DEG }));
  const pair = (t, k) => {
    const a = k * t.a, b = k * t.b;
    const bT = t.s3 ? `${coefT(k)}\\sqrt3\\,` : coefT(b);
    const bN = t.s3 ? (k === 1 ? '\\sqrt3' : `${p(k)}\\sqrt3`) : p(b);
    return { a, b, gm: k * t.g, aT: coefT(a), bT, bN, gT: `${p(a)} + j${bN}`, tau: t.tau };
  };
  const WS = [
    { v: 1e7, T: '10^7' }, { v: 2e7, T: '2\\times10^7' }, { v: 5e7, T: '5\\times10^7' }, { v: 1e8, T: '10^8' },
    { v: 2e8, T: '2\\times10^8' }, { v: 8 * Math.PI * 1e6, T: '8\\pi\\times10^6' }, { v: 4 * Math.PI * 1e7, T: '4\\pi\\times10^7' },
  ];
  const o3 = (x, unit = '') => `$${f(x)}$${unit ? ' ' + unit : ''}`;
  const dg = (x) => `$${r2(x)}°$`;

  // ---------------------------------------------------------------- figures, Topic 6
  function gammaFig() {
    const g = PF.fig({ alt: 'gamma drawn as an arrow in the complex plane: alpha along the real axis, beta up the imaginary axis. The arrow makes the angle 90 degrees minus tau with the real axis and the angle tau with the imaginary axis.' });
    const ox = 40, oy = 180, a = 84, b = 146;
    g.arrow(ox - 14, oy, ox + 170, oy, { cls: 'dim', hs: 7 });
    g.arrow(ox, oy + 14, ox, oy - 176, { cls: 'dim', hs: 7 });
    g.label(ox + 174, oy, '\\text{Re}', 'l', 'small');
    g.label(ox + 8, oy - 176, '\\text{Im}', 'l', 'small');
    g.line(ox + a, oy, ox + a, oy - b, { cls: 'dash' });
    g.line(ox, oy - b, ox + a, oy - b, { cls: 'dash' });
    g.arrow(ox, oy, ox + a, oy - b, { cls: 'thick', hs: 9 });
    g.label(ox + a / 2, oy + 8, '\\alpha', 't');
    g.label(ox - 8, oy - b, 'j\\beta', 'r');
    g.label(ox + a + 8, oy - b + 2, '\\gamma = \\alpha + j\\beta', 'l');
    g.angle(ox, oy, 38, 0, 60, '90° - \\tau');
    g.angle(ox, oy, 92, 60, 90, '\\tau');
    return g.svg();
  }
  function lagFig() {
    const g = PF.fig({ alt: 'E and H at one fixed point plotted against time. H is smaller and peaks a little later than E; the delay between the two peaks is tau over omega.' });
    const x0 = 30, cy = 92, A = 58, T = 170, tau = 40 / DEG, hA = 0.62 * A;
    const e = [], h = [];
    for (let i = 0; i <= 330; i++) {
      e.push([x0 + i, cy - A * Math.cos(2 * Math.PI * i / T)]);
      h.push([x0 + i, cy - hA * Math.cos(2 * Math.PI * i / T - tau)]);
    }
    g.arrow(x0, cy, x0 + 352, cy, { cls: 'dim', hs: 6 });
    g.line(x0, cy - A - 22, x0, cy + A + 8, { cls: 'dim' });
    g.label(x0 + 356, cy, 't', 'l', 'small');
    g.pl(e, { cls: 'thick' });
    g.pl(h, { cls: 'dash' });
    const pe = x0 + T, ph = x0 + T + T * tau / (2 * Math.PI);
    g.line(pe, cy - A, pe, cy + 6, { cls: 'dim thin' });
    g.line(ph, cy - hA, ph, cy + 6, { cls: 'dim thin' });
    g.dim(pe, cy - A - 12, ph, cy - A - 12, '\\tau/\\omega', { off: 0 });
    g.label(x0 + 78, cy + A + 6, 'E', 't', 'small');
    g.label(x0 + 104, cy + hA - 18, 'H', 'l', 'small');
    return g.svg();
  }
  function triadPanel(back) {
    const g = PF.fig({ alt: back ? 'Backward wave: E along plus x, H along minus y, travel into the page along minus z.' : 'Forward wave: E along plus x, H along plus y, travel out of the page along plus z.' });
    const ox = 50, oy = 80, L = 58;
    g.arrow(ox + 9, oy, ox + L, oy, { cls: 'thick', hs: 8 });
    g.label(ox + L + 6, oy, '\\mathbf E', 'l');
    if (back) { g.arrow(ox, oy + 9, ox, oy + L, { cls: 'thick', hs: 8 }); g.label(ox, oy + L + 6, '\\mathbf H\\ (-\\hat y)', 't'); g.otimes(ox, oy, 7); }
    else { g.arrow(ox, oy - 9, ox, oy - L, { cls: 'thick', hs: 8 }); g.label(ox, oy - L - 6, '\\mathbf H\\ (+\\hat y)', 'b'); g.odot(ox, oy, 7); }
    g.label(ox - 12, back ? oy - 16 : oy + 16, back ? '\\hat k = -\\hat z' : '\\hat k = +\\hat z', 'r', 'small');
    return g.svg();
  }

  // ---------------------------------------------------------------- Topic 6: the lesson
  EM.lesson('w2', {
    id: 'w2-read', topic: 6, ref: 'Lectures 22-23', title: 'Reading a lossy wave, and getting the material back',
    steps: [
      R(md`
        !!key Why you care
          Exams like to hand you one line, a field written out in full, and ask for everything hidden in it. Spring 2017 #3 gave $\mathbf E = 3e^{-3x}\cos(8\pi\times10^6t - 4x + 60°)\,\hat z$ V/m and asked for $\alpha$, $\beta$, $\gamma$, $\lambda$, $f$, $v_p$, $\eta$ and $\mathbf H$. HW 9 and Summer 2018 hand you $\mathbf H$ instead, and ask for $\epsilon$ and $\sigma$ as well. Spring 2024 #2 asks which statements about such a wave are true. In [Topic 5](#/l/w2-gamma) you went from the material to the wave. This lesson runs the other way, from the wave back to the material. Most of it is careful reading, plus two lines of the formula sheet.

        ### Notation

        - $u$: the coordinate the wave travels along ($x$, $y$ or $z$). $\hat k$: the unit vector of the direction of travel, for example $+\hat z$ or $-\hat x$.
        - $\hat e$, $\hat h$: unit vectors along $\mathbf E$ and along $\mathbf H$.
        - $E_0$, $H_0$: the amplitudes at $u = 0$, positive numbers. $\phi$: the phase inside the cosine of $E$.
        - $\alpha$ (Np/m), $\beta$ (rad/m), $\gamma = \alpha + j\beta$ (1/m), all from [Topic 5](#/l/w2-gamma).
        - $\delta = 1/\alpha$: the **penetration depth**, the distance over which the amplitude falls to $1/e \approx 37\%$.
        - $\eta = |\eta|e^{j\tau}$: the intrinsic impedance. $\tau$ is its angle, which is also how far $H$ lags $E$. It is not a transmission coefficient.
        - $\sigma$, $\epsilon = \epsilon_r\epsilon_0$, $\mu = \mu_r\mu_0$: the material constants you want back.

        ### 1. The template, and what each slot holds

        From [Topic 5](#/l/w2-gamma), one wave traveling toward $+z$ in any material is
        $$E_x = E_0\,e^{-\alpha z}\cos(\omega t - \beta z + \phi)$$
        Each number sits in its own slot, and each slot has one job.

        - The number multiplying $t$ is $\omega$. Then $f = \omega/2\pi$.
        - The number multiplying the position inside the cosine is $\beta$. Then $\lambda = 2\pi/\beta$ and $v_p = \omega/\beta$.
        - The number multiplying the position in the exponent is $\alpha$. Then $\delta = 1/\alpha$.
        - The constant inside the cosine is $\phi$.

        **Which way does it go?** Follow one crest. A crest is a place where the cosine's argument has one fixed value. Call that value $C$:
        $$\omega t - \beta z + \phi = C$$
        Solve for the position of that crest:
        $$z = \frac{\omega t + \phi - C}{\beta}$$
        As $t$ grows, $z$ grows. The crest moves toward $+z$, and its speed is the coefficient of $t$:
        $$\frac{dz}{dt} = \frac{\omega}{\beta} = v_p$$
        Now flip one sign. With $\omega t + \beta z + \phi = C$, the same steps give $z = (C - \phi - \omega t)/\beta$, which shrinks as $t$ grows. That wave goes toward $-z$.

        | Inside the cosine | Signs | Travels toward |
        |---|---|---|
        | $\omega t - \beta u$ | opposite | $+u$ |
        | $\omega t + \beta u$ | the same | $-u$ |

        **The exponent must agree.** A wave shrinks in the direction it travels ([Topic 5](#/l/w2-gamma), Section 5). So travel toward $+u$ comes with $e^{-\alpha u}$, and travel toward $-u$ comes with $e^{+\alpha u}$. If the exponent and the cosine of a given field disagree, read it again.

        !!intuition Does this make sense?
          Units: $\omega t$ is in radians, so $\omega$ is in rad/s. $\beta u$ is in radians, so $\beta$ is in rad/m. $\alpha u$ must have no units, so $\alpha$ is in 1/m, called Np/m. And loss only ever adds phase per meter: the exact formula of Topic 5 gives $\beta \ge \omega\sqrt{\mu\epsilon}$, so $v_p \le 1/\sqrt{\mu\epsilon}$. In a material with $\epsilon_r \ge 1$ and $\mu_r = 1$, you can never get $v_p > c$. If you do, you read a slot wrong.
      `),
      Q(md`**Predict.** $\mathbf E = 4e^{2y}\cos(10^8t + 5y)\,\hat x$ V/m, with $y$ in meters. Which description is right?`,
        [md`Toward $-y$, $\lambda = 1.26$ m, $v_p = 2\times10^7$ m/s`, md`Toward $+y$, $\lambda = 1.26$ m, $v_p = 2\times10^7$ m/s`, md`Toward $-y$, $\lambda = 3.14$ m, $v_p = 5\times10^7$ m/s`, md`Toward $-x$, $\lambda = 1.26$ m, $v_p = 2\times10^7$ m/s`], 0,
        [null, md`$\omega t$ and $5y$ have the same sign, which means travel toward $-y$. The exponent agrees: $e^{+2y}$ shrinks as $y$ decreases.`, md`That uses $\alpha = 2$ in place of $\beta$: $2\pi/2$ and $10^8/2$. The wavelength and the speed come from the number inside the cosine, $\beta = 5$.`, md`$\hat x$ is the direction of $\mathbf E$. A TEM wave travels perpendicular to its field, along the coordinate in the exponent and the cosine.`],
        md`Same signs on $\omega t$ and $\beta y$: travel toward $-y$. $\beta = 5$ rad/m, so $\lambda = 2\pi/5 = 1.26$ m and $v_p = 10^8/5 = 2\times10^7$ m/s. The factor $e^{+2y}$ gets smaller as the wave moves toward $-y$, as it must.`),
      R(md`
        ### 2. The phasor of a lossy wave, and what to do with a sine

        Exam fields often come as sines. Convert first, with
        $$\sin x = \cos(x - 90°)$$
        For example $5e^{-z}\sin(\omega t - 2z)$ becomes $5e^{-z}\cos(\omega t - 2z - 90°)$, so $\phi = -90°$.

        Now find the phasor. Write the cosine as the real part of an exponential. The factor $E_0e^{-\alpha z}$ is a real number, so it can sit inside the real part:
        $$E_x = \Re\{E_0e^{-\alpha z}e^{j(\omega t - \beta z + \phi)}\}$$
        Split the exponential into its three factors:
        $$E_x = \Re\{E_0e^{j\phi}\,e^{-\alpha z}e^{-j\beta z}\,e^{j\omega t}\}$$
        The phasor is everything that multiplies $e^{j\omega t}$:
        $$\tilde E_x = E_0e^{j\phi}\,e^{-\alpha z}e^{-j\beta z}$$
        The two $z$ factors join, because exponents add: $e^{-\alpha z}e^{-j\beta z} = e^{-(\alpha + j\beta)z} = e^{-\gamma z}$. So
        $$\boxed{\tilde E_x = E_0e^{j\phi}\,e^{-\gamma z}}$$
        That is the line on the formula sheet. The complex constant $E_0e^{j\phi}$ holds the size and the starting phase. The exponential holds every bit of the $z$ dependence. A wave toward $-z$ has $e^{+\gamma z}$ instead.

        !!intuition Does this make sense?
          At $z = 0$ the phasor is $E_0e^{j\phi}$, and $\Re\{E_0e^{j\phi}e^{j\omega t}\} = E_0\cos(\omega t + \phi)$: exactly the given field at $z = 0$. ✓ A phase of $-90°$ is the factor $e^{-j90°} = -j$, so "$\sin$" in the time domain is "$-j$" in the phasor.
      `),
      Q(md`**Predict.** What is the phasor of $H_y = 25e^{-z}\sin(\omega t - 2z)$ A/m?`,
        [md`$-j25\,e^{-(1 + j2)z}$`, md`$25\,e^{-(1 + j2)z}$`, md`$j25\,e^{-(1 + j2)z}$`, md`$-j25\,e^{-(2 + j)z}$`], 0,
        [null, md`That treats the sine as a cosine. $\sin x = \cos(x - 90°)$ puts a factor $e^{-j90°} = -j$ in front.`, md`That shifts the phase the wrong way. $\sin x = \cos(x - 90°)$, so the factor is $e^{-j90°} = -j$, not $+j$.`, md`That swaps $\alpha$ and $\beta$. The exponent's coefficient is $\alpha = 1$; the cosine's is $\beta = 2$. So $\gamma = 1 + j2$.`],
        md`$25e^{-z}\sin(\omega t - 2z) = 25e^{-z}\cos(\omega t - 2z - 90°)$. So $E_0e^{j\phi} = 25e^{-j90°} = -j25$, and $\gamma = 1 + j2$. The phasor is $-j25\,e^{-(1 + j2)z}$ A/m.`),
      RF(md`
        ### 3. γ as an arrow: its size, its angle, and τ for free

        Spring 2017 asked for "the amplitude and phase of $\gamma$". Draw $\gamma = \alpha + j\beta$ in the complex plane: $\alpha$ along the real axis, $\beta$ up the imaginary axis.

        [[fig:garrow]]

        Pythagoras gives the size, and the triangle gives the angle from the real axis:
        $$|\gamma| = \sqrt{\alpha^2 + \beta^2}$$
        $$\angle\gamma = \tan^{-1}\frac{\beta}{\alpha}$$
        Now bring in a line of the formula sheet:
        $$\eta\gamma = j\omega\mu$$
        The right side is $j$ times a positive real number, so it points straight up: its angle is $90°$. When you multiply complex numbers, their angles add. So
        $$\angle\eta + \angle\gamma = 90°$$
        The angle of $\eta$ is $\tau$. Therefore
        $$\angle\gamma = 90° - \tau$$
        In the picture, $\tau$ is the angle between $\gamma$ and the **imaginary** axis. Read the triangle from that axis: the side opposite $\tau$ is $\alpha$, and the side next to it is $\beta$. So
        $$\boxed{\tan\tau = \frac{\alpha}{\beta}}$$
        This is the fastest way to $\tau$ there is. Read $\alpha$ and $\beta$ off the wave, and divide. No $\sigma$, no $\epsilon$, no complex division.

        !!intuition Does this make sense?
          No loss: $\alpha = 0$ gives $\tau = 0$. ✓ A good conductor ([Topic 7](#/l/w2-limits)) has $\alpha \approx \beta$, which gives $\tau \approx 45°$. ✓ And since $\tau < 45°$ in every material ([Topic 5](#/l/w2-gamma), Section 7), $\alpha < \beta$ always. A field written with $\alpha > \beta$ cannot be a wave in a material with real $\epsilon$ and $\mu$.
      `, { garrow: { svg: gammaFig(), cap: 'γ = α + jβ as an arrow. ηγ = jωμ points straight up, so the angle of γ and the angle τ of η add to 90°: τ is the angle between γ and the imaginary axis.' } }),
      Q(md`**Predict.** A wave has $\gamma = 1 + j\sqrt3$ 1/m. Then $\tau$, the angle of $\eta$, is…`,
        ['$30°$', '$60°$', '$15°$', '$45°$'], 0,
        [null, md`That is the angle of $\gamma$ itself, $\tan^{-1}(\beta/\alpha)$. $\tau$ is what is left of $90°$.`, md`That halves the answer. The half belongs to $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$. Here $\alpha/\beta$ is already $\tan\tau$, with nothing to halve.`, md`$45°$ needs $\alpha = \beta$, the good-conductor limit. Here $\beta$ is $\sqrt3$ times $\alpha$.`],
        md`$\tan\tau = \alpha/\beta = 1/\sqrt3$, so $\tau = 30°$. Check: $\angle\gamma = \tan^{-1}\sqrt3 = 60°$, and $60° + 30° = 90°$ ✓.`),
      RF(md`
        ### 4. η from an E and H pair

        When a problem gives both $\mathbf E$ and $\mathbf H$ of one wave, $\eta$ is a division. Write both phasors for a wave toward $+z$:
        $$\tilde E_x = E_0e^{j\phi_E}e^{-\gamma z}$$
        $$\tilde H_y = H_0e^{j\phi_H}e^{-\gamma z}$$
        Their ratio is $\eta$ ([Topic 5](#/l/w2-gamma), Section 6). The exponentials are the same, so they cancel:
        $$\eta = \frac{\tilde E_x}{\tilde H_y} = \frac{E_0}{H_0}\,e^{j(\phi_E - \phi_H)}$$
        Compare with $\eta = |\eta|e^{j\tau}$. The sizes match and the angles match:
        $$\boxed{|\eta| = \frac{E_0}{H_0}, \qquad \tau = \phi_E - \phi_H}$$
        The size of $\eta$ is the ratio of the amplitudes. Its angle is how many degrees the phase of $H$ falls behind the phase of $E$.

        [[fig:lag]]

        At a fixed point, $E$ peaks when $\omega t + \phi_E = 0$, and $H$ peaks when $\omega t + \phi_H = 0$. The difference in time is
        $$t_H - t_E = \frac{\phi_E - \phi_H}{\omega} = \frac{\tau}{\omega}$$
        So $H$ peaks $\tau/\omega$ seconds after $E$, at every point along the wave.

        !!intuition Does this make sense?
          In a passive material $0 \le \tau < 45°$, so $H$ always lags, by less than an eighth of a period. If your two phases say $H$ leads, check the direction first: a field written with a minus sign in front, or along $-\hat y$, carries an extra $180°$. Section 5 sorts the directions out before you compare phases.
      `, { lag: { svg: lagFig(), cap: 'At one fixed point: E (solid) and H (dashed). H is smaller, by the factor 1/|η|, and it peaks τ/ω later. Here τ = 40°.' } }),
      Q(md`**Predict.** One wave has $E_x = 30e^{-z}\cos(\omega t - \sqrt3\,z + 50°)$ V/m and $H_y = 0.5e^{-z}\cos(\omega t - \sqrt3\,z + 20°)$ A/m. Then $\eta$ is…`,
        [md`$60\,e^{j30°}\ \Omega$`, md`$60\,e^{-j30°}\ \Omega$`, md`$60\,e^{j70°}\ \Omega$`, md`$\tfrac{1}{60}\,e^{j30°}\ \Omega$`], 0,
        [null, md`That is $\phi_H - \phi_E$. $H$ lags, so the angle of $\eta = \tilde E/\tilde H$ is $\phi_E - \phi_H = +30°$.`, md`That adds the two phases. Dividing the phasors subtracts them.`, md`That is $H_0/E_0$. $\eta$ is $E$ over $H$, and an impedance of a sixtieth of an ohm would be absurd here.`],
        md`$|\eta| = 30/0.5 = 60\ \Omega$ and $\tau = 50° - 20° = 30°$. Check with Section 3: $\tan\tau = \alpha/\beta = 1/\sqrt3$ gives $30°$ ✓. The two readings agree, as they must for one real wave.`),
      RF(md`
        ### 5. H from E, for a wave going in any direction

        [Topic 5](#/l/w2-gamma) did $\mathbf E$ along $\hat x$ and $\mathbf H$ along $\hat y$. Exams use every orientation. One rule covers all of them.

        Look at the two cases you have. Forward: $\tilde H_y = +\tilde E_x/\eta$, so $\hat e = \hat x$, $\hat h = +\hat y$, $\hat k = +\hat z$. Backward: $\tilde H_y = -\tilde E_x/\eta$, so $\hat h = -\hat y$ and $\hat k = -\hat z$.

        [[fig:triad]]

        In both cases $\hat e\times\hat h = \hat k$: forward, $\hat x\times\hat y = \hat z$; backward, $\hat x\times(-\hat y) = -\hat z$. Both are one vector rule:
        $$\boxed{\tilde{\mathbf H} = \frac{1}{\eta}\,\hat k\times\tilde{\mathbf E}}$$
        Check it on both cases. Forward: $\hat z\times\hat x = \hat y$, so $\tilde{\mathbf H} = \hat y\,\tilde E_x/\eta$ ✓. Backward: $(-\hat z)\times\hat x = -\hat y$ ✓. Nothing in Topic 5's derivation cared which axis we called $z$, so the rule holds for every orientation.

        To use it you need the cross products of unit vectors. Go around the cycle $x \to y \to z \to x$:
        $$\hat x\times\hat y = \hat z, \quad \hat y\times\hat z = \hat x, \quad \hat z\times\hat x = \hat y$$
        Reverse the order and the sign flips: $\hat y\times\hat x = -\hat z$.

        Going from $\mathbf H$ back to $\mathbf E$ uses the same triangle read the other way:
        $$\boxed{\tilde{\mathbf E} = \eta\,\tilde{\mathbf H}\times\hat k}$$
        Check: forward, $\tilde{\mathbf H} = \hat y\,\tilde E_x/\eta$, and $\hat y\times\hat z = \hat x$, so $\eta\tilde{\mathbf H}\times\hat k = \hat x\,\tilde E_x$ ✓.

        **The recipe for $\mathbf H$ from $\mathbf E$, in five moves.**
        1. $\hat k$ from the signs in the cosine.
        2. $\hat h = \hat k\times\hat e$.
        3. Amplitude $E_0/|\eta|$.
        4. Phase $\phi - \tau$: $H$ lags.
        5. The same exponential and the same cosine argument as $E$.

        For Spring 2017 #3: $\hat e = \hat z$ and $\hat k = +\hat x$, so $\hat h = \hat x\times\hat z = -\hat y$. That minus sign is the most common loss of points on this problem.

        !!intuition Does this make sense?
          $\hat e$, $\hat h$, $\hat k$ always form a right-handed set, like $\hat x$, $\hat y$, $\hat z$. Turning the travel around with the same $\mathbf E$ must turn $\mathbf H$ around, because the power flow $\mathbf E\times\mathbf H$ has to follow the wave.
      `, { triad: { svg: PF.row([{ svg: triadPanel(false), cap: 'Forward: E × H points out of the page, along +z.' }, { svg: triadPanel(true), cap: 'Backward: same E, H reversed, E × H into the page.' }]).svg, cap: 'Same E, opposite travel: H flips so that E × H follows the wave.' } }),
      Q(md`**Predict.** $\tilde{\mathbf E} = \hat y\,E_0\,e^{+\gamma x}$. Along which unit vector does $\tilde{\mathbf H}$ point (with $\tilde{\mathbf H} = \hat h\,(E_0/\eta)\,e^{+\gamma x}$)?`,
        [md`$-\hat z$`, md`$+\hat z$`, md`$-\hat x$`, md`$+\hat x$`], 0,
        [null, md`That is the forward wave's $\hat h$, $\hat x\times\hat y$. Here $e^{+\gamma x}$ means travel toward $-x$, so $\hat h = (-\hat x)\times\hat y$.`, md`$-\hat x$ is the direction of travel. $\mathbf H$ is perpendicular to it.`, md`$\mathbf H$ is perpendicular to the travel direction, which is along $x$.`],
        md`$e^{+\gamma x}$: travel toward $-x$. $\hat h = \hat k\times\hat e = (-\hat x)\times\hat y = -\hat z$. Check: $\hat y\times(-\hat z) = -\hat x$, the direction of travel ✓.`),
      R(md`
        ### 6. Getting μ back: ηγ = jωμ

        Divide the formula sheet's line by $j\omega$:
        $$\mu = \frac{\eta\gamma}{j\omega}$$
        $\mu$ is a real, positive number. So $\eta\gamma$ must point straight up, at $90°$, and its size must be $\omega\mu$. Write both in polar form and multiply, sizes times sizes:
        $$|\eta|\,|\gamma| = \omega\mu$$
        So
        $$\boxed{\mu = \frac{|\eta|\,|\gamma|}{\omega}}$$
        and the angles give you a free check: $\tau + \angle\gamma = 90°$.

        You need this when a problem gives both $\mathbf E$ and $\mathbf H$ and does not say the material is non-magnetic. When it does say $\mu = \mu_0$, this line runs the other way and gives $|\eta| = \omega\mu_0/|\gamma|$ from $\mathbf E$ alone.

        !!intuition Does this make sense?
          Units: $\Omega\cdot(1/\text{m})/(\text{rad/s}) = \Omega\,\text{s/m} = $ H/m ✓, since an ohm-second is a henry. Free space: $|\eta| = 120\pi$ and $|\gamma| = \omega/c$ give $\mu = 120\pi/c = 4\pi\times10^{-7}$ H/m ✓.
      `),
      Q(md`**Predict.** A wave at $\omega = 10^8$ rad/s has $|\gamma| = 5$ 1/m and $|\eta| = 40\pi\ \Omega$. Then $\mu$ is…`,
        [md`$5\mu_0$`, md`$0.2\mu_0$`, md`$7\mu_0$`, md`$\mu_0$`], 0,
        [null, md`That divides $|\eta|$ by $|\gamma|$. The sheet multiplies them: $\eta\gamma = j\omega\mu$.`, md`That uses $\alpha + \beta = 7$ for $|\gamma|$. The size of $\gamma$ needs Pythagoras: here it is given as 5.`, md`Only if $|\eta||\gamma|$ came out as $\omega\mu_0 = 40\pi$. It is five times that.`],
        md`$\mu = |\eta||\gamma|/\omega = (40\pi)(5)/10^8 = 2\pi\times10^{-6}$ H/m. Divide by $\mu_0 = 4\pi\times10^{-7}$: $\mu_r = 5$.`),
      R(md`
        ### 7. Getting σ and ε back: γ/η = σ + jωε

        The other line of the sheet:
        $$\frac{\gamma}{\eta} = \sigma + j\omega\epsilon$$
        $\sigma$, $\omega$ and $\epsilon$ are all real. So the real part of $\gamma/\eta$ is $\sigma$, and the imaginary part is $\omega\epsilon$:
        $$\sigma = \Re\{\gamma/\eta\}, \qquad \epsilon = \frac{1}{\omega}\Im\{\gamma/\eta\}$$
        Those are the sheet's lines. In polar form, $\gamma/\eta = (|\gamma|/|\eta|)\,e^{j(\angle\gamma - \tau)}$, then take the cosine and sine parts.

        **A shortcut with no complex division.** From $\eta\gamma = j\omega\mu$, $\eta = j\omega\mu/\gamma$. Put that into $\gamma/\eta$:
        $$\frac{\gamma}{\eta} = \frac{\gamma^2}{j\omega\mu}$$
        Square $\gamma$, using $j^2 = -1$:
        $$\gamma^2 = \alpha^2 - \beta^2 + j2\alpha\beta$$
        Dividing by $j$ is the same as multiplying by $-j$:
        $$-j\gamma^2 = 2\alpha\beta + j(\beta^2 - \alpha^2)$$
        So
        $$\sigma + j\omega\epsilon = \frac{2\alpha\beta + j(\beta^2 - \alpha^2)}{\omega\mu}$$
        Match the real parts, then the imaginary parts:
        $$\boxed{\sigma = \frac{2\alpha\beta}{\omega\mu}}$$
        $$\boxed{\epsilon = \frac{\beta^2 - \alpha^2}{\omega^2\mu}}$$
        These are the two relations of [Topic 5](#/l/w2-gamma), Section 8 ($2\alpha\beta = \omega\mu\sigma$ and $\beta^2 - \alpha^2 = \omega^2\mu\epsilon$), read backwards. Divide one by the other and you get the loss tangent straight from the wave:
        $$\frac{\sigma}{\omega\epsilon} = \frac{2\alpha\beta}{\beta^2 - \alpha^2}$$

        !!intuition Does this make sense?
          $\alpha = 0$ gives $\sigma = 0$ and $\epsilon = \beta^2/\omega^2\mu$, which is $\beta = \omega\sqrt{\mu\epsilon}$ ✓. Units: $\alpha\beta/\omega\mu$ is $(1/\text{m}^2)/(\Omega/\text{m}) = $ S/m ✓. And a warning. In a good conductor $\alpha \approx \beta$, so $\beta^2 - \alpha^2$ is a small difference of two nearly equal numbers, and a tiny error in reading either one wrecks $\epsilon$. A good conductor's wave tells you $\sigma$ well and $\epsilon$ badly, because there the displacement current hardly matters.
      `),
      Q(md`**Predict.** A wave has $\alpha = 1$ Np/m and $\beta = 2$ rad/m, and $\omega\mu = 20\ \Omega$/m. What is $\sigma$?`,
        ['$0.2$ S/m', '$0.15$ S/m', '$0.1$ S/m', '$80$ S/m'], 0,
        [null, md`That is $(\beta^2 - \alpha^2)/\omega\mu = 3/20$: the imaginary part, $\omega\epsilon$.`, md`That drops the 2 in $2\alpha\beta$. It comes from squaring $\alpha + j\beta$: the cross term appears twice.`, md`That multiplies by $\omega\mu$. $\sigma = 2\alpha\beta/\omega\mu$; check the units, S/m.`],
        md`$\sigma = 2\alpha\beta/\omega\mu = (2)(1)(2)/20 = 0.2$ S/m. And $\omega\epsilon = (4 - 1)/20 = 0.15$ S/m, so the loss tangent is $0.2/0.15 = 4/3$.`),
      R(md`
        ### 8. What changes when the frequency changes

        Spring 2024 #2(e) asked: if the frequency of a wave in a good conductor goes up, which quantities stay the same? Here is how to decide any such statement, from first principles. In this course $\sigma$, $\epsilon$ and $\mu$ are material constants: they do not change with frequency. Everything else is computed from them **and from $\omega$**:
        $$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon), \qquad \eta^2 = \frac{j\omega\mu}{\sigma + j\omega\epsilon}$$
        Both have $\omega$ in them. So $\alpha$, $\beta$, $\delta$, $\lambda$, $v_p$, $|\eta|$ and $\tau$ all change. So does the loss tangent, which has $\omega$ right in it.

        | Quantity | Changes with $f$? | Why |
        |---|---|---|
        | $\sigma$, $\epsilon$, $\mu$ | no | material constants |
        | $\alpha$, $\beta$, $\delta$, $\lambda$, $v_p$ | yes | $\gamma^2$ has $\omega$ in it |
        | $\eta$, $\tau$, $\sigma/\omega\epsilon$ | yes | $\eta^2$ and the ratio have $\omega$ |
        | directions of $\mathbf E$, $\mathbf H$, $\hat k$ | no | set by the source, not by $\omega$ |
        | $H$ at a current sheet | no | the jump condition gives $\pm J_s/2$ |
        | $E$ at a current sheet | yes | $E = \eta H$, and $\eta$ changes |

        The last two rows come from the boundary condition at a current sheet ([Topic 10](#/l/w3-antenna)): $\mathbf H$ jumps by $J_s$ across the sheet, and by symmetry each side gets half, whatever the material. Then $E = \eta H$ inherits all of $\eta$'s frequency dependence.

        !!intuition Does this make sense?
          In free space nothing but $\beta$, $\lambda$ and the period would change with frequency: $v_p = c$ and $\eta = 120\pi$ for every $f$. Loss is what makes the speed and the impedance depend on frequency. That is called **dispersion**, and it is why a lossy material smears a signal ([Topic 7](#/l/w2-limits), Section 8).
      `),
      Q(md`**Predict.** A wave travels through a lossy material ($\sigma$, $\epsilon$, $\mu$ fixed). Its frequency is doubled. Which one does **not** change?`,
        [md`The direction of $\mathbf H$ relative to $\mathbf E$`, md`The angle $\tau$ of $\eta$`, md`The phase speed $v_p$`, md`The penetration depth $\delta$`], 0,
        [null, md`$\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$, and the loss tangent halves when $\omega$ doubles.`, md`$v_p = \omega/\beta$, and in a lossy material $\beta$ is not proportional to $\omega$. Only a lossless medium has one speed for every frequency.`, md`$\delta = 1/\alpha$, and $\alpha$ comes from $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$, which has $\omega$ in it. ([Topic 7](#/l/w2-limits) shows it is nearly constant only in an imperfect dielectric.)`],
        md`$\hat h = \hat k\times\hat e$ has no $\omega$ in it: the geometry of the wave stays the same. Every number that comes from $\gamma$ or $\eta$ changes.`),
      R(md`
        ### The method

        !!method Reading a wave, in order
          1. **Sines to cosines.** $\sin x = \cos(x - 90°)$.
          2. **Slots.** $\omega$ multiplies $t$; $\beta$ is in the cosine; $\alpha$ is in the exponent; $\phi$ is the constant. Then $f = \omega/2\pi$, $\lambda = 2\pi/\beta$, $v_p = \omega/\beta$, $\delta = 1/\alpha$.
          3. **Direction.** Opposite signs on $\omega t$ and $\beta u$: toward $+u$. The same sign: toward $-u$. The exponent must agree.
          4. **γ.** $\gamma = \alpha + j\beta$, $|\gamma| = \sqrt{\alpha^2 + \beta^2}$, $\angle\gamma = \tan^{-1}(\beta/\alpha)$, and $\tau = 90° - \angle\gamma$.
          5. **η.** Both fields given: $|\eta| = E_0/H_0$ and $\tau = \phi_E - \phi_H$. Only one given, with $\mu$ known: $|\eta| = \omega\mu/|\gamma|$.
          6. **The material.** $\mu = |\eta||\gamma|/\omega$. Then $\sigma = 2\alpha\beta/\omega\mu$ and $\epsilon = (\beta^2 - \alpha^2)/\omega^2\mu$, or the sheet's $\Re$ and $\Im$ of $\gamma/\eta$.
          7. **The other field.** $\hat h = \hat k\times\hat e$, amplitude $E_0/|\eta|$, phase $\phi - \tau$, same exponential. Or $\tilde{\mathbf E} = \eta\tilde{\mathbf H}\times\hat k$.

        ### Worked example 1: Spring 2017 #3, then one step further

        !!graded Problem
          In a non-magnetic material, $\mathbf E = 3e^{-3x}\cos(8\pi\times10^6t - 4x + 60°)\,\hat z$ V/m. Use $\tan^{-1}(4/3) = 53°$. Find $\alpha$, $\beta$, $\gamma$ (size and angle), $\lambda$, $f$, $v_p$, $\eta$ (size and angle) and $\mathbf H$. Then go further than the exam did: find $\sigma$ and $\epsilon$.

        **Step 1: the slots.** The exponent gives $\alpha = 3$ Np/m. The cosine gives $\beta = 4$ rad/m. The coefficient of $t$ gives $\omega = 8\pi\times10^6$ rad/s. Opposite signs on $\omega t$ and $4x$: the wave goes toward $+x$, and $e^{-3x}$ agrees.

        **Step 2: γ.** $\gamma = 3 + j4$ 1/m. Its size is a 3-4-5 triangle:
        $$|\gamma| = \sqrt{9 + 16} = 5\ \text{1/m}$$
        Its angle:
        $$\angle\gamma = \tan^{-1}\tfrac43 = 53°$$
        **Step 3: λ, f, v_p.**
        $$\lambda = \frac{2\pi}{4} = \frac{\pi}{2} \approx 1.57\ \text{m}$$
        $$f = \frac{8\pi\times10^6}{2\pi} = 4\ \text{MHz}$$
        $$v_p = \frac{\omega}{\beta} = \frac{8\pi\times10^6}{4} = 2\pi\times10^6\ \text{m/s}$$
        That is $6.28\times10^6$ m/s, about 2% of $c$. A slow wave, as a very lossy material makes it.

        **Step 4: η.** The material is non-magnetic, so $|\eta| = \omega\mu_0/|\gamma|$. First the product:
        $$\omega\mu_0 = (8\pi\times10^6)(4\pi\times10^{-7}) = 3.2\pi^2$$
        in $\Omega$/m. Then
        $$|\eta| = \frac{3.2\pi^2}{5} = 0.64\pi^2 \approx 6.32\ \Omega$$
        The angle is what is left of $90°$:
        $$\tau = 90° - 53° = 37°$$
        **Step 5: the direction of H.** $\hat k = +\hat x$ and $\hat e = \hat z$, so
        $$\hat h = \hat x\times\hat z = -\hat y$$
        **Step 6: H.** Amplitude $3/6.32 = 0.475$ A/m. Phase $60° - 37° = 23°$. Same exponential, same cosine argument:
        $$\mathbf H = -\hat y\,0.475\,e^{-3x}\cos(\omega t - 4x + 23°)$$
        in A/m, with $\omega = 8\pi\times10^6$ rad/s. Check: $\hat z\times(-\hat y) = +\hat x$, the direction of travel ✓.

        **Step 7: σ, the step further.** Use the shortcut, with $\omega\mu_0 = 3.2\pi^2$:
        $$\sigma = \frac{2\alpha\beta}{\omega\mu_0} = \frac{24}{3.2\pi^2} = \frac{7.5}{\pi^2}$$
        That is $0.760$ S/m.

        **Step 8: ε.**
        $$\omega\epsilon = \frac{\beta^2 - \alpha^2}{\omega\mu_0} = \frac{7}{3.2\pi^2} = 0.222\ \text{S/m}$$
        Divide by $\omega$:
        $$\epsilon = \frac{0.222}{8\pi\times10^6} = 8.82\times10^{-9}\ \text{F/m}$$
        That is $\epsilon_r \approx 997$: a strange material, but the numbers are consistent. **Check:** the loss tangent is $0.760/0.222 = 24/7 = 3.43$, and $\tan(2\tau) = \tan 74° = 3.4$ ✓.

        **Speed path.** Slots in 15 seconds. $\tau = 90° - 53°$ with no division. $|\eta| = \omega\mu_0/|\gamma|$ with $\omega\mu_0 = 3.2\pi^2$. For $\mathbf H$, do the cross product $\hat x\times\hat z$ before anything else.

        **Where points go.** Writing $+\hat y$ for $\mathbf H$. Adding $\tau$ to the phase. Using $\eta_0 = 120\pi$ for $|\eta|$. Giving $f = 8\pi\times10^6$ Hz.

        ### Worked example 2: both fields given, nothing said about μ

        !!graded Problem
          One wave in an unknown material has
          $\mathbf E = 20\pi\,e^{-y}\cos(5\times10^7t - \sqrt3\,y)\,\hat z$ V/m and $\mathbf H = 2\,e^{-y}\cos(5\times10^7t - \sqrt3\,y - 30°)\,\hat x$ A/m. Find $\gamma$, $\eta$, $\mu$, $\sigma$ and $\epsilon_r$.

        **Step 1: direction and consistency.** Opposite signs: toward $+y$. Check the fields: $\hat e\times\hat h = \hat z\times\hat x = \hat y$ ✓.

        **Step 2: γ.** $\alpha = 1$ Np/m and $\beta = \sqrt3$ rad/m:
        $$\gamma = 1 + j\sqrt3 = 2\,e^{j60°}\ \text{1/m}$$
        **Step 3: η from the pair.**
        $$|\eta| = \frac{20\pi}{2} = 10\pi\ \Omega$$
        $$\tau = 0° - (-30°) = 30°$$
        The angles add to $60° + 30° = 90°$, as they must ✓.

        **Step 4: μ.**
        $$\mu = \frac{|\eta||\gamma|}{\omega} = \frac{(10\pi)(2)}{5\times10^7} = 4\pi\times10^{-7}\ \text{H/m}$$
        So $\mu = \mu_0$: the material turns out non-magnetic, and $\omega\mu = 20\pi\ \Omega$/m.

        **Step 5: σ.**
        $$\sigma = \frac{2\alpha\beta}{\omega\mu} = \frac{2\sqrt3}{20\pi} = \frac{\sqrt3}{10\pi} \approx 0.0551\ \text{S/m}$$
        **Step 6: ε.**
        $$\omega\epsilon = \frac{\beta^2 - \alpha^2}{\omega\mu} = \frac{3 - 1}{20\pi} = \frac{1}{10\pi}\ \text{S/m}$$
        Divide by $\omega = 5\times10^7$:
        $$\epsilon = \frac{1}{5\pi\times10^8}\ \text{F/m}$$
        Divide by $\epsilon_0 = 10^{-9}/36\pi$:
        $$\epsilon_r = \frac{36\pi\times10^9}{5\pi\times10^8} = 72$$
        **Check with the sheet's form.** $\gamma/\eta = 2e^{j60°}/(10\pi e^{j30°}) = (1/5\pi)\,e^{j30°}$. Real part $(1/5\pi)(\sqrt3/2) = \sqrt3/10\pi$ ✓. Imaginary part $(1/5\pi)(1/2) = 1/10\pi = \omega\epsilon$ ✓. Loss tangent $\sqrt3$, so $2\tau = 60°$ ✓.

        **Speed path.** $|\eta|$ and $\tau$ by eye, $\mu$ by one multiplication, then the two shortcut lines. No complex division at all.

        ### Worked example 3: a sine, a backward wave, and H from E

        !!graded Problem
          In a non-magnetic material, $\mathbf E = 8\pi\,e^{0.6y}\sin(10^7t + 0.8y)\,\hat z$ V/m. Find $\eta$ and $\mathbf H$, and the value of $H_x$ at the origin at $t = 0$.

        **Step 1: convert the sine.** $\sin(\cdot) = \cos(\cdot - 90°)$, so $\phi = -90°$.

        **Step 2: direction.** The same sign on $\omega t$ and $0.8y$: toward $-y$. And $e^{+0.6y}$ shrinks as $y$ decreases ✓.

        **Step 3: γ and τ.** $\gamma = 0.6 + j0.8$: a 3-4-5 triangle scaled by 0.2, so $|\gamma| = 1$ 1/m. Then
        $$\tan\tau = \frac{0.6}{0.8} = \frac34, \quad \tau = 36.9°$$
        **Step 4: |η|.**
        $$|\eta| = \frac{\omega\mu_0}{|\gamma|} = \frac{(10^7)(4\pi\times10^{-7})}{1} = 4\pi\ \Omega$$
        **Step 5: the direction of H.** $\hat k = -\hat y$ and $\hat e = \hat z$:
        $$\hat h = (-\hat y)\times\hat z = -\hat x$$
        **Step 6: H.** Amplitude $8\pi/4\pi = 2$ A/m. Phase $-90° - 36.9° = -126.9°$:
        $$\mathbf H = -\hat x\,2\,e^{0.6y}\cos(10^7t + 0.8y - 126.9°)$$
        in A/m. **Check:** $\hat z\times(-\hat x) = -\hat y$, the travel direction ✓.

        **Step 7: the value at the origin.** At $y = 0$, $t = 0$:
        $$H_x = -2\cos(-126.9°) = -2(-0.6) = 1.2\ \text{A/m}$$
        A negative unit vector and a negative cosine made a positive number. This is why exams ask for a value: it checks the sign and the phase together.

        **Where points go.** Forgetting the $-90°$. Writing $+\hat x$ (the forward wave's answer). Adding $\tau$.

        ### Common mistakes

        !!mistake Common mistakes
          - **Reading $\beta$ from the exponent.** The exponent holds $\alpha$; the cosine holds $\beta$.
          - **Giving $\omega$ as $f$.** $f = \omega/2\pi$.
          - **Forgetting the $-90°$** when the field is a sine.
          - **$\hat h = \hat e\times\hat k$**, the cross product in the wrong order. It is $\hat k\times\hat e$.
          - **Adding $\tau$.** $H$ lags: its phase is $\phi - \tau$.
          - **Taking $\angle\gamma$ for $\tau$.** They add to $90°$; $\tau = \tan^{-1}(\alpha/\beta)$, the small one.
          - **Halving $\tan^{-1}(\alpha/\beta)$.** The half belongs to $\tfrac12\tan^{-1}(\sigma/\omega\epsilon)$, a different formula.
          - **Using $\eta_0 = 120\pi$** in a lossy material.
          - **$\epsilon = \Im\{\gamma/\eta\}$** without dividing by $\omega$.
          - **Dropping the 2 in $\sigma = 2\alpha\beta/\omega\mu$.**

        !!key Speed tricks
          - $\tau = \tan^{-1}(\alpha/\beta)$, straight from the wave. $\angle\gamma = 90° - \tau$.
          - $|\eta| = \omega\mu/|\gamma|$. For $\mu_0$: $\omega\mu_0 = 4\pi\times10^{-7}\,\omega$; with $\omega = 8\pi\times10^6$ that is $3.2\pi^2$.
          - $\sigma = 2\alpha\beta/\omega\mu$ and $\epsilon = (\beta^2 - \alpha^2)/\omega^2\mu$: no complex division.
          - Loss tangent from the wave: $2\alpha\beta/(\beta^2 - \alpha^2)$, which is $\tan 2\tau$.
          - Triangles to spot: $1, \sqrt3, 2$ ($\tau = 30°$); $3, 4, 5$ ($\tau = 36.9°$); $5, 12, 13$ ($\tau = 22.6°$).
          - $\hat h = \hat k\times\hat e$. Do the cross product first; it decides the sign.
          - Exams that ask "the value at the origin at $t = 0$" check sign and phase in one number.

        ### Statements to judge
      `),
      P({ src: 'In the style of Spring 2024 #2', title: 'True or false, one wave',
        q: md`A wave in a material is $\mathbf E = 10e^{-2x}\cos(10^8t - 2\sqrt3\,x)\,\hat z$ V/m. Judge each statement.`,
        parts: [
          { lbl: md`(i) The wave travels toward $+x$.`, mc: ['True', 'False'], a: 0, fixed: true, why: [null, md`The signs on $10^8t$ and $2\sqrt3\,x$ are opposite, which means $+x$. The decay $e^{-2x}$ agrees.`] },
          { lbl: md`(ii) $\mathbf H$ points along $+\hat y$ whenever $\mathbf E$ points along $+\hat z$ (ignoring the lag $\tau$).`, mc: ['True', 'False'], a: 1, fixed: true, why: [md`$\hat h = \hat k\times\hat e = \hat x\times\hat z = -\hat y$. With $+\hat y$, $\mathbf E\times\mathbf H$ would point along $-\hat x$, against the travel.`, null] },
          { lbl: md`(iii) At any fixed point, $H$ peaks $30°$ of phase after $E$.`, mc: ['True', 'False'], a: 0, fixed: true, why: [null, md`$\tan\tau = \alpha/\beta = 2/(2\sqrt3) = 1/\sqrt3$, so $\tau = 30°$, and $H$ lags by $\tau$.`] },
          { lbl: md`(iv) The amplitude falls to $1/e$ of its value after one wavelength.`, mc: ['True', 'False'], a: 1, fixed: true, why: [md`The $1/e$ distance is $\delta = 1/\alpha = 0.5$ m. The wavelength is $2\pi/(2\sqrt3) = 1.81$ m, so the amplitude after one wavelength is $e^{-3.63} \approx 0.03$ of the start.`, null] },
          { lbl: md`(v) The loss tangent $\sigma/\omega\epsilon$ is $\sqrt3$, whatever $\mu$ is.`, mc: ['True', 'False'], a: 0, fixed: true, why: [null, md`$\sigma/\omega\epsilon = 2\alpha\beta/(\beta^2 - \alpha^2) = 8\sqrt3/8 = \sqrt3$. $\mu$ cancels in the ratio.`] },
          { lbl: md`(vi) If the frequency were doubled, $\beta$ would double too.`, mc: ['True', 'False'], a: 1, fixed: true, why: [md`Only in a lossless medium is $\beta = \omega\sqrt{\mu\epsilon}$ proportional to $\omega$. Here $\beta$ comes from the exact formula, which has the loss tangent in it, and the loss tangent changes with $\omega$.`, null] },
        ],
        sol: md`
          (i) **True.** Opposite signs in the cosine.

          (ii) **False.** $\hat h = \hat x\times\hat z = -\hat y$.

          (iii) **True.** $\tau = \tan^{-1}(\alpha/\beta) = \tan^{-1}(1/\sqrt3) = 30°$.

          (iv) **False.** $\delta = 0.5$ m, $\lambda = 1.81$ m.

          (v) **True.** $\tan(2\tau) = \tan 60° = \sqrt3$, and the shortcut $2\alpha\beta/(\beta^2 - \alpha^2)$ has no $\mu$ in it.

          (vi) **False.** In a lossy material $\beta$ is not proportional to $\omega$.
        ` }),
      R(md`
        ### Check questions
      `),
      Q(md`$\mathbf E = 6e^{-0.5z}\cos(2\pi\times10^9t - 40z)\,\hat x$ V/m. What is the frequency?`,
        ['1 GHz', '$2\\pi$ GHz', '40 Hz', '0.5 GHz'], 0,
        [null, md`$2\pi\times10^9$ is $\omega$, in rad/s. Divide by $2\pi$ for hertz.`, md`40 is $\beta$, in rad/m: it multiplies $z$, not $t$.`, md`That divides by $4\pi$. $f = \omega/2\pi$.`],
        md`$f = \omega/2\pi = 2\pi\times10^9/2\pi = 10^9$ Hz.`),
      Q(md`In a material, $\eta = 50e^{j20°}\ \Omega$ and $\mathbf E = 100e^{-\alpha x}\cos(\omega t - \beta x + 10°)\,\hat y$ V/m. Which is $\mathbf H$?`,
        [md`$2e^{-\alpha x}\cos(\omega t - \beta x - 10°)\,\hat z$ A/m`, md`$2e^{-\alpha x}\cos(\omega t - \beta x + 30°)\,\hat z$ A/m`, md`$-2e^{-\alpha x}\cos(\omega t - \beta x - 10°)\,\hat z$ A/m`, md`$2e^{-\alpha x}\cos(\omega t - \beta x - 10°)\,\hat x$ A/m`], 0,
        [null, md`That adds $\tau$. $H$ lags $E$, so its phase is $10° - 20°$.`, md`$\hat h = \hat k\times\hat e = \hat x\times\hat y = +\hat z$. The minus sign would make $\mathbf E\times\mathbf H$ point along $-\hat x$.`, md`$\hat x$ is the direction of travel. $\mathbf H$ must be perpendicular to it.`],
        md`Travel $+\hat x$, $\hat h = \hat x\times\hat y = \hat z$, amplitude $100/50 = 2$ A/m, phase $10° - 20° = -10°$.`),
      Q(md`A wave has $\gamma = 5 + j12$ 1/m. Without any material constants, what is $\tau$?`,
        ['$22.6°$', '$67.4°$', '$11.3°$', 'It cannot be found without $\\sigma$ and $\\epsilon$'], 0,
        [null, md`That is $\tan^{-1}(12/5)$, the angle of $\gamma$. $\tau$ is its complement.`, md`That halves $\tan^{-1}(5/12)$. No halving: $\alpha/\beta$ is already $\tan\tau$.`, md`$\eta\gamma = j\omega\mu$ forces the two angles to add to $90°$, so $\gamma$ alone fixes $\tau$.`],
        md`$\tan\tau = \alpha/\beta = 5/12$, so $\tau = 22.6°$, and $\angle\gamma = 67.4°$.`),
      Q(md`You are given $\gamma$ and $\eta$ at one frequency. Which formula gives $\epsilon$?`,
        [md`$\epsilon = \frac{1}{\omega}\Im\{\gamma/\eta\}$`, md`$\epsilon = \Im\{\gamma/\eta\}$`, md`$\epsilon = \frac{1}{\omega}\Im\{\gamma\eta\}$`, md`$\epsilon = \frac{1}{\omega}\Re\{\gamma/\eta\}$`], 0,
        [null, md`The imaginary part is $\omega\epsilon$, in S/m. Divide by $\omega$ to get F/m.`, md`$\gamma\eta = j\omega\mu$ holds $\mu$, not $\epsilon$.`, md`The real part of $\gamma/\eta$ is $\sigma$.`],
        md`$\gamma/\eta = \sigma + j\omega\epsilon$: real part $\sigma$, imaginary part $\omega\epsilon$.`),
      Q(md`Someone writes a wave in a material as $\mathbf E = 2e^{-5z}\cos(\omega t - 3z)\,\hat x$. What should you say?`,
        ['It cannot be right: it needs $\\alpha < \\beta$', 'It is fine: a very lossy material', 'It travels toward $-z$', 'It is a good conductor, since $\\alpha \\approx \\beta$'], 0,
        [null, md`$\tan\tau = \alpha/\beta = 5/3$ would put $\tau$ at $59°$. But $\tau < 45°$ in every material, which means $\alpha < \beta$ always.`, md`Opposite signs on $\omega t$ and $3z$: $+z$.`, md`$5$ and $3$ are not close, and $\alpha > \beta$ cannot happen even in a good conductor.`],
        md`$\beta^2 - \alpha^2 = \omega^2\mu\epsilon > 0$, so $\beta > \alpha$ for every wave in a material with positive $\epsilon$. Here $\beta^2 - \alpha^2 = 9 - 25 < 0$.`),
      Q(md`$\mathbf H = 3e^{-x}\cos(\omega t - 2x)\,\hat z$ A/m in a material with $\eta = |\eta|e^{j\tau}$. Write $\mathbf E = \hat e\,3|\eta|\,e^{-x}\cos(\omega t - 2x + \tau)$. Which unit vector is $\hat e$?`,
        [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat x$`, md`$-\hat z$`], 0,
        [null, md`That is $\hat k\times\hat h = \hat x\times\hat z$, the product in the wrong order. $\tilde{\mathbf E} = \eta\tilde{\mathbf H}\times\hat k$ needs $\hat z\times\hat x = +\hat y$.`, md`$\hat x$ is the direction of travel. $\mathbf E$ is perpendicular to it.`, md`$\mathbf E$ is perpendicular to $\mathbf H$, which is along $\hat z$.`],
        md`Travel is $+\hat x$. $\hat e = \hat h\times\hat k = \hat z\times\hat x = +\hat y$. Check: $\hat e\times\hat h = \hat y\times\hat z = \hat x$ ✓. (E leads H, so its phase is $+\tau$.)`),
      Q(md`A wave has $\alpha = 2$ Np/m and $\beta = 4$ rad/m in a non-magnetic material. What is its loss tangent $\sigma/\omega\epsilon$?`,
        ['$4/3$', '$1/2$', '$1$', '$2$'], 0,
        [null, md`That is $\alpha/\beta = \tan\tau$. The loss tangent is $\tan(2\tau)$.`, md`That is $2\alpha/\beta$, the small-loss approximation of $\tan 2\tau$. It is not close when $\alpha/\beta$ is as large as $1/2$.`, md`That is $\beta/\alpha$, which has no meaning here.`],
        md`$\sigma/\omega\epsilon = 2\alpha\beta/(\beta^2 - \alpha^2) = 16/12 = 4/3$.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** find the slot first, then do one operation. Each card asks for one move; aim for 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_w2r_read', { need: 8 }), { id: 'w2-read.r0' }),
      R(md`
        ### Practice, level 1: η and τ

        **The trick:** $|\eta| = E_0/H_0$ or $\omega\mu/|\gamma|$; $\tau = \phi_E - \phi_H$ or $\tan^{-1}(\alpha/\beta)$; the angles of $\gamma$ and $\eta$ add to $90°$.
      `),
      Object.assign(G('rf_w2r_eta', { need: 8 }), { id: 'w2-read.r1' }),
      R(md`
        ### Practice, level 1: which way does H point?

        **The trick:** $\hat k$ from the signs, then $\hat h = \hat k\times\hat e$ and $\hat e = \hat h\times\hat k$. Cycle $x \to y \to z \to x$ is $+$.
      `),
      Object.assign(G('rf_w2r_hdir', { need: 8 }), { id: 'w2-read.r2' }),
      R(md`
        ### Practice, level 1: the material back

        **The trick:** $\mu = |\eta||\gamma|/\omega$, $\sigma = 2\alpha\beta/\omega\mu$, $\omega\epsilon = (\beta^2 - \alpha^2)/\omega\mu$.
      `),
      Object.assign(G('rf_w2r_mat', { need: 8 }), { id: 'w2-read.r3' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct without opening the solution complete each one.
      `),
      G('w2r_fromEH', { need: 2 }),
      G('w2r_HfromE', { need: 2 }),
      G('w2r_material', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        The skill HW 9 #3 and Summer 2018 #1(b) ask for: $\mathbf H$ given, everything else found, with the sign and phase of $\mathbf E$ checked by its value at the origin.
      `),
      G('w2r_hw9', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- Topic 6 generators
  const EPS0 = 1e-9 / (36 * Math.PI), MU0 = 4 * Math.PI * 1e-7, C0 = 3e8;
  // a wave in a material with mu_r = mur and eps_r in [lo, hi]
  const pickPhys = (mur = 1, lo = 1.5, hi = 300, ks = [0.5, 1, 2, 5, 10]) => {
    for (let i = 0; i < 500; i++) {
      const t = pick(TRI), k = pick(ks), W = pick(WS), P = pair(t, k);
      const er = (P.b * P.b - P.a * P.a) * C0 * C0 / (W.v * W.v * mur);
      if (er >= lo && er <= hi) return { t, k, W, P, er };
    }
    const t = TRI[0], W = WS[2], P = pair(t, 1);
    return { t, k: 1, W, P, er: (P.b * P.b - P.a * P.a) * C0 * C0 / (W.v * W.v * mur) };
  };
  // orientation: travel axis u, direction dir, E axis ei with sign es, and h = k x e
  const orient = () => {
    const u = pick([0, 1, 2]), dir = pick([1, -1]);
    const ei = pick([0, 1, 2].filter((i) => i !== u)), es = pick([1, 1, -1]);
    const [hi, hs] = crossU(u, dir, ei, es);
    return { u, dir, ei, es, hi, hs };
  };
  const randWave = () => Object.assign(pickPhys(1, 1.5, 3000, [0.5, 1, 2, 10]), orient());
  const kT = (o) => `${o.dir > 0 ? '+' : '-'}\\hat ${AX[o.u]}`;

  GENS.rf_w2r_read = () => {
    const w = randWave(), { P, W, u, dir } = w;
    const fn = pick(['cos', 'sin']), ph = pick([0, 30, -45, 60]), amp = pick([2, 5, 12, 40]);
    const lead = (fn2 = fn, ph2 = ph) => md`$\mathbf E = ${waveTex({ amp, aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: fn2, ph: ph2 })}\,${uvp(w.ei, w.es)}$ V/m, positions in meters.`;
    return one([
      () => {
        const ks = dir > 0 ? '+' : '-', ko = dir > 0 ? '-' : '+', oth = 3 - u - w.ei;
        return MC('Which way?', md`${lead()} The wave travels toward…`, `$${ks}\\hat ${AX[u]}$`,
          [[`$${ko}\\hat ${AX[u]}$`, md`That reads the signs backwards. Opposite signs on $\omega t$ and $\beta ${AX[u]}$ mean $+${AX[u]}$; the same sign means $-${AX[u]}$.`],
            [`$${w.es > 0 ? '+' : '-'}\\hat ${AX[w.ei]}$`, md`That is the direction of $\mathbf E$. A TEM wave travels perpendicular to its field.`],
            [`$+\\hat ${AX[oth]}$`, md`$${AX[oth]}$ appears nowhere in the field. The wave changes along $${AX[u]}$, so it travels along $${AX[u]}$.`],
            [`$${w.es > 0 ? '-' : '+'}\\hat ${AX[w.ei]}$`, md`That is along the field's own axis. The travel axis is the coordinate in the exponent and the cosine.`]],
          md`${dir > 0 ? 'Opposite' : 'The same'} signs on $\omega t$ and $\beta ${AX[u]}$: travel toward $${ks}${AX[u]}$. The factor $e^{${dir > 0 ? '-' : '+'}${P.aT}${AX[u]}}$ agrees: it shrinks in that direction.`);
      },
      () => {
        const fr = W.v / (2 * Math.PI);
        return MC('Frequency', md`${lead()} The frequency $f$ is…`, o3(fr, 'Hz'),
          [[o3(W.v, 'Hz'), md`That is $\omega$, in rad/s. Divide by $2\pi$ to get hertz.`], [o3(W.v * 2 * Math.PI, 'Hz'), md`Divide by $2\pi$; do not multiply.`],
            [o3(W.v / Math.PI, 'Hz'), md`$f = \omega/2\pi$: a factor of 2 went missing.`], [o3(W.v / P.b, 'Hz'), md`That is $\omega/\beta$, the phase speed, in m/s.`]],
          md`$f = \omega/2\pi = (${W.T})/2\pi = ${f(fr)}$ Hz.`);
      },
      () => MC('Wavelength', md`${lead()} The wavelength is…`, o3(2 * Math.PI / P.b, 'm'),
        [[o3(2 * Math.PI / P.a, 'm'), md`That uses $\alpha$, the number in the exponent. The wavelength comes from $\beta$, the number in the cosine.`], [o3(1 / P.b, 'm'), md`That left out the $2\pi$: $\lambda = 2\pi/\beta$.`],
          [o3(2 * Math.PI / P.gm, 'm'), md`That uses $|\gamma|$. Only $\beta$ turns the phase.`], [o3(P.b / (2 * Math.PI), 'm'), md`That is upside down: $\lambda = 2\pi/\beta$.`]],
        md`$\beta = ${f(P.b)}$ rad/m, so $\lambda = 2\pi/\beta = ${f(2 * Math.PI / P.b)}$ m.`),
      () => MC('Phase speed', md`${lead()} The phase speed $v_p$ is…`, o3(W.v / P.b, 'm/s'),
        [[o3(W.v / P.a, 'm/s'), md`That uses $\alpha$. Crests move at $\omega/\beta$.`], [o3(W.v / P.gm, 'm/s'), md`That uses $|\gamma|$. Crests move at $\omega/\beta$.`],
          ['$3\\times10^{8}$ m/s', md`That is $c$. In a material the crests move at $\omega/\beta$, slower than $c$.`], [o3(W.v * P.b, 'm/s'), md`Divide, do not multiply: $v_p = \omega/\beta$.`]],
        md`$v_p = \omega/\beta = (${W.T})/${f(P.b)} = ${f(W.v / P.b)}$ m/s.`),
      () => MC('Penetration depth', md`${lead()} The penetration depth $\delta$ is…`, o3(1 / P.a, 'm'),
        [[o3(1 / P.b, 'm'), md`That uses $\beta$. Decay is $\alpha$, the number in the exponent.`], [o3(P.a, 'm'), md`$\alpha$ itself is in Np/m. The distance is $1/\alpha$.`],
          [o3(2 * Math.PI / P.a, 'm'), md`No $2\pi$ here: the amplitude is $e^{-1}$ of its start at $u = 1/\alpha$.`], [o3(1 / P.gm, 'm'), md`That uses $|\gamma|$. Only $\alpha$ makes the wave decay.`]],
        md`$\delta = 1/\alpha = 1/${f(P.a)} = ${f(1 / P.a)}$ m.`),
      () => MC('γ', md`${lead()} The propagation constant $\gamma$ is…`, `$${P.gT}$ 1/m`,
        [[`$${P.bN} + j${p(P.a)}$ 1/m`, md`That swaps the parts. The real part is $\alpha$, from the exponent; the imaginary part is $\beta$, from the cosine.`],
          [`$${p(P.a)} - j${P.bN}$ 1/m`, md`Both parts of $\gamma$ are positive for every wave. Direction lives in the sign of the exponent, $e^{\mp\gamma u}$.`],
          [`$-${p(P.a)} - j${P.bN}$ 1/m`, md`$\gamma$ is the same for both directions; the backward wave uses $e^{+\gamma u}$ instead of a negative $\gamma$.`],
          [`$${f(P.gm)}$ 1/m`, md`That is $|\gamma|$, its size. $\gamma$ itself is complex.`]],
        md`$\alpha = ${f(P.a)}$ from the exponent and $\beta = ${f(P.b)}$ from the cosine: $\gamma = \alpha + j\beta = ${P.gT}$ 1/m.`),
      () => {
        const p2 = pick([0, 30, 60, -30]), right = wrap(p2 - 90);
        return MC('Phase in cosine form', md`${lead('sin', p2)} Written as a cosine, the phase $\phi$ of $\mathbf E$ is…`, `$${right}°$`,
          [[`$${p2}°$`, md`That treats the sine as a cosine. $\sin x = \cos(x - 90°)$.`], [`$${wrap(p2 + 90)}°$`, md`The shift goes the other way: $\sin x = \cos(x - 90°)$.`],
            [`$${wrap(p2 + 180)}°$`, md`A $180°$ shift is a minus sign. A sine is a quarter turn, $90°$.`], [`$${wrap(-p2 - 90)}°$`, md`That flips the sign of the given phase. Keep it, then subtract $90°$.`]],
          md`$\sin(\theta) = \cos(\theta - 90°)$, so $\phi = ${p2}° - 90° = ${right}°$.`);
      },
    ]);
  };

  GENS.rf_w2r_eta = () => one([
    () => {
      const w = randWave(), { P, W, u, dir } = w;
      const H0 = pick([0.1, 0.2, 0.5, 2, 4]), eta = pick([20, 50, 80, 150, 200, 300]), E0 = eta * H0, phE = pick([0, 20, 45, 60]);
      const E = waveTex({ amp: p(E0), aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: 'cos', ph: phE });
      const H = waveTex({ amp: p(H0), aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: 'cos', ph: r2(phE - P.tau) });
      return MC('|η| from the pair', md`One wave: $\mathbf E = ${E}\,${uvp(w.ei, w.es)}$ V/m and $\mathbf H = ${H}\,${uvp(w.hi, w.hs)}$ A/m. Then $|\eta|$ is…`, `$${p(eta)}\\ \\Omega$`,
        [[`$${p(+(H0 / E0).toPrecision(3))}\\ \\Omega$`, md`That is $H_0/E_0$. $\eta$ is $E$ over $H$.`], [`$${p(+(E0 * H0).toPrecision(3))}\\ \\Omega$`, md`That multiplies the amplitudes. $|\eta| = E_0/H_0$.`],
          ['$120\\pi\\ \\Omega$', md`That is free space. In the material, $|\eta| = E_0/H_0$.`], [`$${p(+(eta * Math.cos(P.tau / DEG)).toPrecision(3))}\\ \\Omega$`, md`That is $|\eta|\cos\tau$, the real part of $\eta$. The size is the full ratio $E_0/H_0$.`]],
        md`$|\eta| = E_0/H_0 = ${p(E0)}/${p(H0)} = ${p(eta)}\ \Omega$.`);
    },
    () => {
      const w = randWave(), { P, W, u, dir } = w;
      const tau = r2(P.tau), phE = pick([20, 40, 50, 75]), phH = r2(phE - tau);
      const E = waveTex({ amp: 'E_0', aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: 'cos', ph: phE });
      const H = waveTex({ amp: 'H_0', aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: 'cos', ph: phH });
      return MC('τ from the phases', md`One wave: $\mathbf E = ${E}\,${uvp(w.ei, w.es)}$ and $\mathbf H = ${H}\,${uvp(w.hi, w.hs)}$. Then $\tau$ is…`, `$${tau}°$`,
        [[`$${-tau}°$`, md`That is $\phi_H - \phi_E$. $H$ lags, so $\tau = \phi_E - \phi_H$ is positive.`], [`$${r2(phE + phH)}°$`, md`That adds the phases. Dividing the phasors subtracts them.`],
          [`$${r2(90 - tau)}°$`, md`That is the angle of $\gamma$. $\tau$ is the lag of $H$ behind $E$.`], [`$${r2(2 * tau)}°$`, md`That doubles the lag. $\tau$ is the whole difference $\phi_E - \phi_H$.`]],
        md`$\tau = \phi_E - \phi_H = ${phE}° - (${phH}°) = ${tau}°$. Check: $\tan^{-1}(\alpha/\beta) = \tan^{-1}(${f(P.a)}/${f(P.b)}) = ${tau}°$ ✓.`);
    },
    () => {
      const w = randWave(), { P, W, u, dir } = w;
      const E = waveTex({ amp: 'E_0', aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: 'cos', ph: 0 });
      const tau = r2(P.tau);
      return MC('τ from α and β', md`A wave in a material is $\mathbf E = ${E}\,${uvp(w.ei, w.es)}$. The angle $\tau$ of $\eta$ is…`, `$${tau}°$`,
        [[`$${r2(90 - tau)}°$`, md`That is $\tan^{-1}(\beta/\alpha)$, the angle of $\gamma$. $\tau$ is its complement.`], [`$${r2(tau / 2)}°$`, md`No halving: $\alpha/\beta$ is already $\tan\tau$. The half belongs to $\tfrac12\tan^{-1}(\sigma/\omega\epsilon)$.`],
          [`$${r2(2 * tau)}°$`, md`That is $2\tau$, the angle whose tangent is the loss tangent.`], ['$45°$', md`$45°$ needs $\alpha = \beta$, the good-conductor limit.`]],
        md`$\tan\tau = \alpha/\beta = ${f(P.a)}/${f(P.b)}$, so $\tau = ${tau}°$.`);
    },
    () => {
      const t = pick(TRI), k = pick([1, 2, 10]), P = pair(t, k), wm = pick([100, 200, 400, 1000]);
      return MC('|η| from ωμ', md`A wave has $\gamma = ${P.gT}$ 1/m and, at its frequency, $\omega\mu = ${wm}\ \Omega$/m. Then $|\eta|$ is…`, `$${f(wm / P.gm)}\\ \\Omega$`,
        [[`$${f(wm / (P.a + P.b))}\\ \\Omega$`, md`That divides by $\alpha + \beta$. The size of $\gamma$ needs Pythagoras: $${f(P.gm)}$.`], [`$${f(wm * P.gm)}\\ \\Omega$`, md`$\eta\gamma = j\omega\mu$, so divide by $|\gamma|$; do not multiply.`],
          [`$${f(wm / (P.gm * P.gm))}\\ \\Omega$`, md`That divides by $|\gamma|^2$. One factor of $|\gamma|$ only.`], [`$${f(wm / P.b)}\\ \\Omega$`, md`That uses $\beta$ alone. Divide by the whole size $|\gamma|$.`]],
        md`$|\eta| = \omega\mu/|\gamma| = ${wm}/${f(P.gm)} = ${f(wm / P.gm)}\ \Omega$.`);
    },
    () => {
      const tau = pick([10, 15, 20, 25, 30, 35, 40]), m = pick([20, 50, 80, 150]);
      return MC('Angle of γ', md`At some frequency a material has $\eta = ${m}\,e^{j${tau}°}\ \Omega$. The angle of $\gamma$ is…`, `$${90 - tau}°$`,
        [[`$${tau}°$`, md`That is the angle of $\eta$. The two angles add to $90°$.`], [`$${90 + tau}°$`, md`$\eta\gamma = j\omega\mu$: the angles add to $90°$, so subtract $\tau$.`],
          [`$${2 * tau}°$`, md`That is $2\tau = \tan^{-1}(\sigma/\omega\epsilon)$, the angle of $\eta^2$.`], ['$45°$', md`$\gamma$ reaches $45°$ only for $\tau = 45°$, the good-conductor limit.`]],
        md`$\angle\gamma = 90° - \tau = ${90 - tau}°$, from $\eta\gamma = j\omega\mu$.`);
    },
  ]);

  GENS.rf_w2r_hdir = () => {
    const o = orient(), { u, dir, ei, es, hi, hs } = o;
    const kS = kT(o), eS = uv(ei, es), hS = uv(hi, hs);
    const allU = (i, s) => `$${s > 0 ? '+' : ''}${uv(i, s)}$`;
    const sgnE = dir > 0 ? '-' : '+';
    return one([
      () => MC('H from E', md`$\tilde{\mathbf E} = ${uvp(ei, es)}\,E_0\,e^{${sgnE}\gamma ${AX[u]}}$. Writing $\tilde{\mathbf H} = \hat h\,(E_0/\eta)\,e^{${sgnE}\gamma ${AX[u]}}$, the unit vector $\hat h$ is…`, allU(hi, hs),
        [[allU(hi, -hs), md`That is $\hat e\times\hat k$, the product in the wrong order, or the answer for the opposite direction of travel. Use $\hat h = \hat k\times\hat e$ with $\hat k = ${kS}$.`],
          [allU(u, dir), md`That is the direction of travel. $\mathbf H$ is perpendicular to it.`], [allU(ei, es), md`That is the direction of $\mathbf E$. $\mathbf H$ is perpendicular to $\mathbf E$.`], [allU(u, -dir), md`$\mathbf H$ is perpendicular to the travel axis $${AX[u]}$.`]],
        md`$e^{${sgnE}\gamma ${AX[u]}}$ means travel toward $${kS}$. $\hat h = \hat k\times\hat e = (${kS})\times(${eS}) = ${hS}$. Check: $\hat e\times\hat h = ${kS}$ ✓.`),
      () => MC('E from H', md`$\tilde{\mathbf H} = ${uvp(hi, hs)}\,H_0\,e^{${sgnE}\gamma ${AX[u]}}$. Writing $\tilde{\mathbf E} = \hat e\,\eta H_0\,e^{${sgnE}\gamma ${AX[u]}}$, the unit vector $\hat e$ is…`, allU(ei, es),
        [[allU(ei, -es), md`That is $\hat k\times\hat h$, the wrong order. $\tilde{\mathbf E} = \eta\tilde{\mathbf H}\times\hat k$, so $\hat e = \hat h\times\hat k$.`],
          [allU(u, dir), md`That is the direction of travel. $\mathbf E$ is perpendicular to it.`], [allU(hi, hs), md`That is the direction of $\mathbf H$. $\mathbf E$ is perpendicular to $\mathbf H$.`], [allU(u, -dir), md`$\mathbf E$ is perpendicular to the travel axis $${AX[u]}$.`]],
        md`Travel toward $${kS}$. $\hat e = \hat h\times\hat k = (${hS})\times(${kS}) = ${eS}$. Check: $\hat e\times\hat h = ${kS}$ ✓.`),
      () => MC('Travel from E and H', md`At one instant, at one point of a single traveling wave, $\mathbf E$ points along $${eS}$ and $\mathbf H$ along $${hS}$ (take $\tau = 0$). The wave travels toward…`, allU(u, dir),
        [[allU(u, -dir), md`That is $\hat h\times\hat e$, the wrong order. The travel direction is $\mathbf E\times\mathbf H$.`], [allU(ei, es), md`That is the direction of $\mathbf E$.`], [allU(hi, hs), md`That is the direction of $\mathbf H$.`], [allU(hi, -hs), md`A TEM wave travels perpendicular to both fields: along $\mathbf E\times\mathbf H$.`]],
        md`$\hat k = \hat e\times\hat h = (${eS})\times(${hS}) = ${kS}$.`),
      () => {
        const w = pickPhys(1, 1.5, 3000, [1, 2]), P = w.P, tau = r2(P.tau), E0 = pick([10, 20, 60]), em = pick([20, 40, 60]);
        const phE = pick([0, 30, 60]);
        const wt = (amp, ph, vec) => `${waveTex({ amp, aT: P.aT, bT: P.bT, u: AX[u], dir, wT: '\\omega ', fn: 'cos', ph })}\\,${vec}`;
        const H0 = p(+(E0 / em).toPrecision(3));
        const noDecay = `${H0}\\cos(\\omega t ${dir > 0 ? '-' : '+'} ${P.bT}${AX[u]}${phT(phE - tau)})\\,${uvp(hi, hs)}`;
        return MC('Write H', md`$\mathbf E = ${wt(E0, phE, uvp(ei, es))}$ V/m, and $\eta = ${em}\,e^{j${tau}°}\ \Omega$. Then $\mathbf H$, in A/m, is…`, `$${wt(H0, phE - tau, uvp(hi, hs))}$`,
          [[`$${wt(H0, phE + tau, uvp(hi, hs))}$`, md`That adds $\tau$. $H$ lags: its phase is $\phi - \tau$.`], [`$${wt(H0, phE - tau, uvp(hi, -hs))}$`, md`Wrong direction. $\hat h = \hat k\times\hat e$ with $\hat k = ${kS}$.`],
            [`$${wt(p(E0 * em), phE - tau, uvp(hi, hs))}$`, md`That multiplies by $|\eta|$. $H$ is $E$ divided by $\eta$.`], [`$${noDecay}$`, md`$H$ decays exactly as $E$ does; the exponential stays.`]],
          md`Travel $${kS}$, $\hat h = \hat k\times\hat e = ${hS}$. Amplitude $${E0}/${em} = ${H0}$ A/m. Phase $${phE}° - ${tau}° = ${r2(phE - tau)}°$. Same exponential and same cosine argument.`);
      },
    ]);
  };

  GENS.rf_w2r_mat = () => one([
    () => {
      const t = pick(TRI), k = pick([1, 2, 5]), P = pair(t, k), W = pick(WS), mur = pick([1, 2, 4, 5]);
      const em = W.v * mur * MU0 / P.gm;
      return MC('μ from η and γ', md`At $\omega = ${W.T}$ rad/s a wave has $\gamma = ${P.gT}$ 1/m and $|\eta| = ${f(em)}\ \Omega$. Then $\mu$ is…`, `$${mur === 1 ? '' : mur}\\mu_0$`,
        [[`$${p(+(mur / (P.gm * P.gm)).toPrecision(3))}\\mu_0$`, md`That divides $|\eta|$ by $|\gamma|$. The sheet multiplies them: $\mu = |\eta||\gamma|/\omega$.`], [`$${p(+(mur * (P.a + P.b) / P.gm).toPrecision(3))}\\mu_0$`, md`That uses $\alpha + \beta$ for $|\gamma|$. The size needs Pythagoras.`],
          [`$${p(+(mur * 2 * Math.PI).toPrecision(3))}\\mu_0$`, md`That divides by $f$ instead of $\omega$: an extra $2\pi$.`], [`$${p(+(mur * P.b / P.gm).toPrecision(3))}\\mu_0$`, md`That uses $\beta$ alone for $|\gamma|$.`]],
        md`$\mu = |\eta||\gamma|/\omega = (${f(em)})(${f(P.gm)})/(${W.T}) = ${f(mur * MU0)}$ H/m $= ${mur === 1 ? '' : mur}\mu_0$.`);
    },
    () => {
      const t = pick(TRI), k = pick([0.5, 1, 2]), P = pair(t, k), wm = pick([10, 20, 50, 100]);
      const s = 2 * P.a * P.b / wm;
      return MC('σ from α and β', md`A wave has $\alpha = ${f(P.a)}$ Np/m and $\beta = ${f(P.b)}$ rad/m, and $\omega\mu = ${wm}\ \Omega$/m. Then $\sigma$ is…`, o3(s, 'S/m'),
        [[o3((P.b * P.b - P.a * P.a) / wm, 'S/m'), md`That is $(\beta^2 - \alpha^2)/\omega\mu = \omega\epsilon$, the imaginary part.`], [o3(P.a * P.b / wm, 'S/m'), md`That drops the 2. Squaring $\alpha + j\beta$ gives the cross term twice.`],
          [o3((P.a * P.a + P.b * P.b) / wm, 'S/m'), md`That is $|\gamma|^2/\omega\mu$, the size of $\gamma/\eta$, not its real part.`], [o3(2 * P.a * P.b * wm, 'S/m'), md`Divide by $\omega\mu$; do not multiply. Check the units: S/m.`]],
        md`$\sigma = 2\alpha\beta/\omega\mu = 2(${f(P.a)})(${f(P.b)})/${wm} = ${f(s)}$ S/m.`);
    },
    () => {
      const t = pick(TRI), k = pick([0.5, 1, 2]), P = pair(t, k), wm = pick([10, 20, 50, 100]);
      const we = (P.b * P.b - P.a * P.a) / wm;
      return MC('ωε from α and β', md`A wave has $\alpha = ${f(P.a)}$ Np/m and $\beta = ${f(P.b)}$ rad/m, and $\omega\mu = ${wm}\ \Omega$/m. Then $\omega\epsilon$ is…`, o3(we, 'S/m'),
        [[o3(2 * P.a * P.b / wm, 'S/m'), md`That is $2\alpha\beta/\omega\mu = \sigma$, the real part.`], [o3((P.a * P.a + P.b * P.b) / wm, 'S/m'), md`That adds the squares. $\gamma^2$ has $\alpha^2 - \beta^2$ in its real part.`],
          [o3((P.b - P.a) * (P.b - P.a) / wm, 'S/m'), md`That squares the difference. It is the difference of the squares: $\beta^2 - \alpha^2$.`], [o3(P.b * P.b / wm, 'S/m'), md`That drops $\alpha^2$. It is only negligible when the loss is small.`]],
        md`$\omega\epsilon = (\beta^2 - \alpha^2)/\omega\mu = (${f(P.b * P.b)} - ${f(P.a * P.a)})/${wm} = ${f(we)}$ S/m.`);
    },
    () => {
      const t = pick(TRI), k = pick([0.5, 1, 2, 10]), P = pair(t, k);
      const lt = 2 * P.a * P.b / (P.b * P.b - P.a * P.a);
      return MC('Loss tangent from the wave', md`A wave has $\gamma = ${P.gT}$ 1/m. Its loss tangent $\sigma/\omega\epsilon$ is…`, o3(lt),
        [[o3(P.a / P.b), md`That is $\alpha/\beta = \tan\tau$. The loss tangent is $\tan 2\tau$.`], [o3(P.b / P.a), md`That is $\beta/\alpha$. The loss tangent is $2\alpha\beta/(\beta^2 - \alpha^2)$.`],
          [o3(2 * P.a * P.b / (P.a * P.a + P.b * P.b)), md`That has $\alpha^2 + \beta^2$ below. The real part of $-j\gamma^2$ over its imaginary part needs $\beta^2 - \alpha^2$.`], [o3((P.a * P.a) / (P.b * P.b)), md`That is $(\alpha/\beta)^2$. The loss tangent is $\tan 2\tau$, not $\tan^2\tau$.`]],
        md`$\sigma/\omega\epsilon = 2\alpha\beta/(\beta^2 - \alpha^2) = ${f(2 * P.a * P.b)}/${f(P.b * P.b - P.a * P.a)} = ${f(lt)}$.`);
    },
    () => {
      const a = pick([0.02, 0.05, 0.1, 0.4]), b = pick([0.01, 0.03, 0.06, 0.2]), W = pick(WS);
      return MC('ε from γ/η', md`At $\omega = ${W.T}$ rad/s, a wave has $\gamma/\eta = ${a} + j${b}$ S/m. Then $\epsilon$ is…`, o3(b / W.v, 'F/m'),
        [[o3(b, 'F/m'), md`$${b}$ is $\omega\epsilon$, in S/m. Divide by $\omega$.`], [o3(a / W.v, 'F/m'), md`That uses the real part, which is $\sigma$.`], [o3(b * W.v, 'F/m'), md`Divide by $\omega$; do not multiply.`], [o3(a, 'F/m'), md`That is $\sigma$, in S/m.`]],
        md`$\gamma/\eta = \sigma + j\omega\epsilon$, so $\epsilon = ${b}/\omega = ${f(b / W.v)}$ F/m, and $\sigma = ${a}$ S/m.`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 6, level 2 and 3
  const pSol = (w) => md`$\omega\mu = (${w.W.T})(${w.mur === 1 ? '' : w.mur}\mu_0) = ${f(w.wm)}\ \Omega$/m`;
  GENS.w2r_fromEH = () => {
    const mur = pick([1, 1, 2, 4]), w = Object.assign(pickPhys(mur, 1.5, 150), orient(), { mur }), { P, W, u, dir } = w;
    w.wm = W.v * mur * MU0;
    const em = w.wm / P.gm, H0 = pick([0.1, 0.5, 1, 2]), E0 = em * H0, phE = pick([0, 20, 45, 60]), tau = P.tau;
    const s = 2 * P.a * P.b / w.wm, er = w.er;
    const E = waveTex({ amp: p(+E0.toPrecision(4)), aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: 'cos', ph: phE });
    const H = waveTex({ amp: p(H0), aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: 'cos', ph: r2(phE - tau) });
    return {
      title: 'Both fields given: η, μ, σ, ε',
      q: md`One wave in an unknown material has $\mathbf E = ${E}\,${uvp(w.ei, w.es)}$ V/m and $\mathbf H = ${H}\,${uvp(w.hi, w.hs)}$ A/m. Find $|\eta|$, $\tau$, $\mu_r$, $\sigma$ and $\epsilon_r$. Use $\epsilon_0 = 10^{-9}/36\pi$ F/m.`,
      parts: [
        Object.assign(N('|\\eta|', em, 'Ω'), { traps: [{ v: H0 / E0, msg: 'That is H0/E0. η is E over H.' }] }),
        Object.assign(N('\\tau', tau, '°'), { traps: [{ v: 90 - tau, msg: 'That is the angle of γ. τ is the lag of H behind E.' }] }),
        Object.assign(N('\\mu_r', mur, ''), { traps: [{ v: mur * 2 * Math.PI, msg: 'That divides by f instead of ω.' }] }),
        Object.assign(N('\\sigma', s, 'S/m'), { traps: [{ v: s / 2, msg: 'The 2 in σ = 2αβ/ωμ went missing.' }, { v: (P.b * P.b - P.a * P.a) / w.wm, msg: 'That is ωε, the imaginary part of γ/η.' }] }),
        Object.assign(N('\\epsilon_r', er, ''), { traps: [{ v: er * W.v, msg: 'Divide ωε by ω once more: ε = (β² − α²)/(ω²μ).' }] }),
      ],
      hints: [md`$|\eta| = E_0/H_0$ and $\tau = \phi_E - \phi_H$.`, md`$\mu = |\eta||\gamma|/\omega$. Then $\sigma = 2\alpha\beta/\omega\mu$ and $\epsilon = (\beta^2 - \alpha^2)/\omega^2\mu$.`],
      sol: md`
        **Step 1: read the slots.** $\alpha = ${f(P.a)}$ Np/m, $\beta = ${f(P.b)}$ rad/m, $\omega = ${W.T}$ rad/s. Travel toward $${kT(w)}$; check $\hat e\times\hat h = (${uv(w.ei, w.es)})\times(${uv(w.hi, w.hs)}) = ${kT(w)}$ ✓.

        **Step 2: η from the pair.** $|\eta| = E_0/H_0 = ${f(E0)}/${p(H0)} = ${f(em)}\ \Omega$, and $\tau = ${phE}° - (${r2(phE - tau)}°) = ${f(tau)}°$. Check: $\tan^{-1}(\alpha/\beta) = ${f(tau)}°$ ✓.

        **Step 3: μ.** $|\gamma| = \sqrt{\alpha^2 + \beta^2} = ${f(P.gm)}$ 1/m, so
        $$\mu = \frac{|\eta||\gamma|}{\omega} = ${f(mur * MU0)}\ \text{H/m}$$
        That is $\mu_r = ${mur}$, and ${pSol(w)}.

        **Step 4: σ.**
        $$\sigma = \frac{2\alpha\beta}{\omega\mu} = ${f(s)}\ \text{S/m}$$
        **Step 5: ε.** First $\omega\epsilon = (\beta^2 - \alpha^2)/\omega\mu = ${f((P.b * P.b - P.a * P.a) / w.wm)}$ S/m. Divide by $\omega$: $\epsilon = ${f(er * EPS0)}$ F/m, so $\epsilon_r = ${f(er)}$.

        **Check.** Loss tangent $\sigma/\omega\epsilon = ${f(s / (er * EPS0 * W.v))}$, and $\tan 2\tau = ${f(Math.tan(2 * tau / DEG))}$ ✓.
      `,
    };
  };

  GENS.w2r_HfromE = () => {
    let w, phi, cs;
    for (let i = 0; i < 200; i++) {
      w = Object.assign(pickPhys(1, 1.5, 300, [0.5, 1, 2, 5]), orient());
      w.fn = pick(['cos', 'sin']); w.ph = pick([0, 30, 45, 60, -30]);
      phi = w.ph - (w.fn === 'sin' ? 90 : 0);
      cs = Math.cos((phi - w.P.tau) / DEG);
      if (Math.abs(cs) > 0.2) break;
    }
    const { P, W, u, dir } = w, em = W.v * MU0 / P.gm, E0 = pick([5, 10, 20, 50, 100]), H0 = E0 / em;
    const val = w.hs * H0 * cs, valWrong = w.hs * H0 * Math.cos((phi + P.tau) / DEG);
    const E = waveTex({ amp: E0, aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: w.fn, ph: w.ph });
    return {
      title: 'H from E, any orientation',
      q: md`A non-magnetic material carries $\mathbf E = ${E}\,${uvp(w.ei, w.es)}$ V/m. $\mathbf H$ lies along the $${AX[w.hi]}$ axis. Find $|\eta|$, $\tau$, the amplitude $H_0$ of $\mathbf H$, and the value of $H_${AX[w.hi]}$ at the origin at $t = 0$, with its sign.`,
      parts: [
        Object.assign(N('|\\eta|', em, 'Ω'), { traps: [{ v: 120 * Math.PI, msg: 'That is free space. Use |η| = ωμ0/|γ|.' }, { v: W.v * MU0 / P.b, msg: 'Divide by |γ|, not by β alone.' }] }),
        Object.assign(N('\\tau', P.tau, '°'), { traps: [{ v: 90 - P.tau, msg: 'That is the angle of γ.' }] }),
        N('H_0', H0, 'A/m'),
        Object.assign(N(`H_${AX[w.hi]}(0, 0)`, val, 'A/m'), { traps: [{ v: -val, msg: 'Sign: check ĥ = k̂ × ê, and the sine conversion.' }, { v: valWrong, msg: 'H lags: subtract τ from the phase, do not add it.' }] }),
      ],
      hints: [md`$|\eta| = \omega\mu_0/|\gamma|$ and $\tan\tau = \alpha/\beta$.`, md`$\hat h = \hat k\times\hat e$, amplitude $E_0/|\eta|$, phase $\phi - \tau$ with $\phi$ the phase of $E$ written as a cosine.`],
      sol: md`
        **Step 1: slots and direction.** $\alpha = ${f(P.a)}$, $\beta = ${f(P.b)}$, $\omega = ${W.T}$. ${dir > 0 ? 'Opposite' : 'The same'} signs: travel toward $${kT(w)}$.${w.fn === 'sin' ? md` The field is a sine: $\phi = ${w.ph}° - 90° = ${r2(phi)}°$.` : md` The phase is $\phi = ${w.ph}°$.`}

        **Step 2: η.** $|\gamma| = ${f(P.gm)}$ 1/m and $\omega\mu_0 = ${f(W.v * MU0)}\ \Omega$/m, so $|\eta| = ${f(em)}\ \Omega$. And $\tau = \tan^{-1}(${f(P.a)}/${f(P.b)}) = ${f(P.tau)}°$.

        **Step 3: direction of H.** $\hat h = \hat k\times\hat e = (${kT(w)})\times(${uv(w.ei, w.es)}) = ${uv(w.hi, w.hs)}$.

        **Step 4: H.** Amplitude $H_0 = ${E0}/${f(em)} = ${f(H0)}$ A/m, phase $${r2(phi)}° - ${f(P.tau)}° = ${r2(phi - P.tau)}°$:
        $$\mathbf H = ${uvp(w.hi, w.hs)}\,${f(H0)}\,e^{${dir > 0 ? '-' : ''}${P.aT}${AX[u]}}\cos(\cdots${phT(phi - P.tau)})$$
        where the dots are the same $\omega t ${dir > 0 ? '-' : '+'} \beta ${AX[u]}$ as in $\mathbf E$.

        **Step 5: the value at the origin.**
        $$H_${AX[w.hi]} = ${w.hs > 0 ? '' : '-'}${f(H0)}\cos(${r2(phi - P.tau)}°) = ${f(val)}\ \text{A/m}$$
        **Check.** $\hat e\times\hat h = (${uv(w.ei, w.es)})\times(${uv(w.hi, w.hs)}) = ${kT(w)}$ ✓.
      `,
    };
  };

  GENS.w2r_material = () => {
    const w = pickPhys(1, 1.5, 300, [0.5, 1, 2, 5, 10]), { P, W } = w;
    const wm = W.v * MU0, s = 2 * P.a * P.b / wm, we = (P.b * P.b - P.a * P.a) / wm;
    return {
      title: 'The material from α and β',
      q: md`In a non-magnetic material, a wave at $\omega = ${W.T}$ rad/s has $\alpha = ${f(P.a)}$ Np/m and $\beta = ${f(P.b)}$ rad/m. Find $\sigma$, $\epsilon_r$, the loss tangent, and $\tau$. Use $\epsilon_0 = 10^{-9}/36\pi$ F/m.`,
      parts: [
        Object.assign(N('\\sigma', s, 'S/m'), { traps: [{ v: s / 2, msg: 'σ = 2αβ/ωμ: the 2 went missing.' }, { v: we, msg: 'That is ωε.' }] }),
        Object.assign(N('\\epsilon_r', w.er, ''), { traps: [{ v: we / EPS0, msg: 'That is ωε/ε0. Divide by ω as well.' }] }),
        Object.assign(N('\\sigma/\\omega\\epsilon', s / we, ''), { traps: [{ v: P.a / P.b, msg: 'That is α/β = tan τ. The loss tangent is tan 2τ.' }] }),
        Object.assign(N('\\tau', P.tau, '°'), { traps: [{ v: P.tau / 2, msg: 'No halving: tan τ = α/β.' }] }),
      ],
      hints: [md`$\omega\mu_0 = 4\pi\times10^{-7}\,\omega$.`, md`$\sigma = 2\alpha\beta/\omega\mu$, $\omega\epsilon = (\beta^2 - \alpha^2)/\omega\mu$, $\tan\tau = \alpha/\beta$.`],
      sol: md`
        **Step 1: ωμ.** $\omega\mu_0 = (${W.T})(4\pi\times10^{-7}) = ${f(wm)}\ \Omega$/m.

        **Step 2: σ.**
        $$\sigma = \frac{2\alpha\beta}{\omega\mu_0} = \frac{${f(2 * P.a * P.b)}}{${f(wm)}} = ${f(s)}\ \text{S/m}$$
        **Step 3: ε.**
        $$\omega\epsilon = \frac{\beta^2 - \alpha^2}{\omega\mu_0} = ${f(we)}\ \text{S/m}$$
        Divide by $\omega$: $\epsilon = ${f(we / W.v)}$ F/m, and divide by $\epsilon_0$: $\epsilon_r = ${f(w.er)}$.

        **Step 4: loss tangent.** $\sigma/\omega\epsilon = 2\alpha\beta/(\beta^2 - \alpha^2) = ${f(s / we)}$.

        **Step 5: τ.** $\tan\tau = \alpha/\beta$, so $\tau = ${f(P.tau)}°$. **Check:** $\tan 2\tau = ${f(Math.tan(2 * P.tau / DEG))}$, the loss tangent ✓.
      `,
    };
  };

  GENS.w2r_hw9 = () => {
    let w, phH, cs;
    const OMS = [{ v: 2 * Math.PI * 1e6, T: '2\\pi\\times10^6' }, { v: 4 * Math.PI * 1e6, T: '4\\pi\\times10^6' }, { v: 8 * Math.PI * 1e6, T: '8\\pi\\times10^6' }, { v: 2 * Math.PI * 1e7, T: '2\\pi\\times10^7' }, { v: 1e7, T: '10^7' }];
    for (let i = 0; i < 500; i++) {
      const t = pick(TRI), k = pick([0.5, 1, 2, 5]), W = pick(OMS), P = pair(t, k);
      const er = (P.b * P.b - P.a * P.a) * C0 * C0 / (W.v * W.v);
      w = Object.assign({ t, k, W, P, er }, orient());
      w.fn = pick(['cos', 'sin']); w.ph = pick([0, 30, -60, 45]);
      phH = w.ph - (w.fn === 'sin' ? 90 : 0);
      cs = Math.cos((phH + P.tau) / DEG);
      if (er >= 1.5 && er <= 1000 && Math.abs(cs) > 0.2) break;
    }
    const { P, W, u, dir } = w, wm = W.v * MU0, em = wm / P.gm, H0 = pick([0.5, 1, 2, 4, 10]), E0 = em * H0;
    const s = 2 * P.a * P.b / wm, we = (P.b * P.b - P.a * P.a) / wm;
    const [ei, es] = crossU(w.hi, w.hs, u, dir);           // e = h x k
    const val = es * E0 * cs;
    const H = waveTex({ amp: H0, aT: P.aT, bT: P.bT, u: AX[u], dir, wT: W.T, fn: w.fn, ph: w.ph });
    return {
      title: 'H given: everything else (the HW 9 #3 skill)',
      q: md`A plane wave travels in a non-magnetic material with $\mathbf H = ${H}\,${uvp(w.hi, w.hs)}$ A/m. Its $\mathbf E$ lies along the $${AX[ei]}$ axis. Find $f$, $|\gamma|$, $|\eta|$, $\tau$, $\sigma$, $\epsilon_r$, the amplitude $E_0$, and $E_${AX[ei]}$ at the origin at $t = 0$, with its sign. Use $\epsilon_0 = 10^{-9}/36\pi$ F/m.`,
      parts: [
        Object.assign(N('f', W.v / (2 * Math.PI), 'Hz'), { traps: [{ v: W.v, msg: 'That is ω. f = ω/2π.' }] }),
        Object.assign(N('|\\gamma|', P.gm, '1/m'), { traps: [{ v: P.a + P.b, msg: '|γ| needs Pythagoras, not α + β.' }] }),
        Object.assign(N('|\\eta|', em, 'Ω'), { traps: [{ v: 120 * Math.PI, msg: 'That is free space. |η| = ωμ0/|γ|.' }] }),
        Object.assign(N('\\tau', P.tau, '°'), { traps: [{ v: 90 - P.tau, msg: 'That is the angle of γ.' }] }),
        Object.assign(N('\\sigma', s, 'S/m'), { traps: [{ v: s / 2, msg: 'σ = 2αβ/ωμ: the 2 went missing.' }] }),
        Object.assign(N('\\epsilon_r', w.er, ''), { traps: [{ v: we / EPS0, msg: 'That is ωε/ε0. Divide by ω too.' }] }),
        N('E_0', E0, 'V/m'),
        Object.assign(N(`E_${AX[ei]}(0, 0)`, val, 'V/m'), { traps: [{ v: -val, msg: 'Sign: Ẽ = ηH̃ × k̂, so ê = ĥ × k̂.' }, { v: es * E0 * Math.cos((phH - P.tau) / DEG), msg: 'E leads H by τ: add τ to the phase of H.' }] }),
      ],
      hints: [md`Slots first; then $|\eta| = \omega\mu_0/|\gamma|$ and $\tan\tau = \alpha/\beta$.`, md`$\sigma = 2\alpha\beta/\omega\mu_0$, $\epsilon = (\beta^2 - \alpha^2)/\omega^2\mu_0$. For $\mathbf E$: $\tilde{\mathbf E} = \eta\tilde{\mathbf H}\times\hat k$, so the phase of $E$ is the phase of $H$ plus $\tau$.`],
      sol: md`
        **Step 1: the slots.** $\omega = ${W.T}$ rad/s, so $f = \omega/2\pi = ${f(W.v / (2 * Math.PI))}$ Hz. $\alpha = ${f(P.a)}$ Np/m, $\beta = ${f(P.b)}$ rad/m. ${dir > 0 ? 'Opposite' : 'The same'} signs: travel toward $${kT(w)}$.${w.fn === 'sin' ? md` A sine: the phase of $H$ as a cosine is $${w.ph}° - 90° = ${r2(phH)}°$.` : md` The phase of $H$ is $${w.ph}°$.`}

        **Step 2: γ.** $\gamma = ${P.gT}$ 1/m, $|\gamma| = ${f(P.gm)}$ 1/m, $\angle\gamma = ${f(90 - P.tau)}°$.

        **Step 3: η.** $\omega\mu_0 = ${f(wm)}\ \Omega$/m, so
        $$|\eta| = \frac{\omega\mu_0}{|\gamma|} = ${f(em)}\ \Omega$$
        and $\tau = 90° - \angle\gamma = ${f(P.tau)}°$.

        **Step 4: σ and ε.**
        $$\sigma = \frac{2\alpha\beta}{\omega\mu_0} = ${f(s)}\ \text{S/m}$$
        $\omega\epsilon = (\beta^2 - \alpha^2)/\omega\mu_0 = ${f(we)}$ S/m, so $\epsilon = ${f(we / W.v)}$ F/m and $\epsilon_r = ${f(w.er)}$.

        **Step 5: the direction of E.** $\hat e = \hat h\times\hat k = (${uv(w.hi, w.hs)})\times(${kT(w)}) = ${uv(ei, es)}$.

        **Step 6: E.** Amplitude $E_0 = |\eta|H_0 = ${f(E0)}$ V/m. $E$ leads $H$ by $\tau$, so its phase is $${r2(phH)}° + ${f(P.tau)}° = ${r2(phH + P.tau)}°$.

        **Step 7: the value at the origin.**
        $$E_${AX[ei]} = ${es > 0 ? '' : '-'}${f(E0)}\cos(${r2(phH + P.tau)}°) = ${f(val)}$$
        in V/m. **Check:** $\hat e\times\hat h = (${uv(ei, es)})\times(${uv(w.hi, w.hs)}) = ${kT(w)}$ ✓, and the loss tangent $\sigma/\omega\epsilon = ${f(s / we)} = \tan(2\tau)$ ✓.

        **Speed path.** Slots, $\tau$ from $\alpha/\beta$, $|\eta|$ from $\omega\mu_0/|\gamma|$, then the two shortcut lines. Do $\hat e = \hat h\times\hat k$ before any number.

        **Where points go.** $\epsilon$ without dividing by $\omega$; $\hat e$ from the wrong cross-product order; subtracting $\tau$ when going from $H$ to $E$ (it is added).
      `,
    };
  };

  // ---------------------------------------------------------------- Topic 6 question bank
  EM.BANK['w2-read'] = [
    Q(md`In $E = E_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)$, which number sets the wavelength?`,
      ['$\\beta$, the coefficient of $z$ inside the cosine', '$\\alpha$, the coefficient of $z$ in the exponent', '$\\omega$, the coefficient of $t$', '$\\phi$, the constant phase'], 0,
      [null, md`$\alpha$ sets how fast the amplitude shrinks: $\delta = 1/\alpha$.`, md`$\omega$ sets the period in time, $T = 2\pi/\omega$. The wavelength is the period in space.`, md`$\phi$ only shifts the wave; it does not change its spacing.`],
      md`One wavelength turns the phase by $2\pi$: $\beta\lambda = 2\pi$.`),
    Q(md`$\mathbf E = 3e^{+4z}\cos(\omega t + 9z)\,\hat y$ V/m. Which statement is right?`,
      ['It travels toward $-z$ and shrinks as it travels', 'It travels toward $+z$ and grows as it travels', 'It travels toward $-z$ and grows as it travels', 'It travels toward $+y$'], 0,
      [null, md`The same signs on $\omega t$ and $9z$ mean $-z$.`, md`As it moves toward $-z$, $z$ decreases, so $e^{+4z}$ decreases.`, md`$\hat y$ is the direction of $\mathbf E$; the wave travels perpendicular to it.`],
      md`Same signs: toward $-z$. Moving toward $-z$ makes $e^{4z}$ smaller: the wave shrinks as it travels, as every wave in a passive material must.`),
    Q(md`$\mathbf E = 5e^{-2z}\cos(\omega t + 3z)\,\hat x$ in a passive material. What is wrong with it?`,
      ['It travels toward $-z$ but grows as it goes', 'Nothing: it is a normal backward wave', 'It travels toward $+z$ with the wrong $\\beta$', '$\\alpha$ is larger than it may be'], 0,
      [null, md`A backward wave has $e^{+\alpha z}$, which shrinks as $z$ decreases. This one has $e^{-2z}$, which grows as $z$ decreases.`, md`The same signs on $\omega t$ and $3z$ mean travel toward $-z$.`, md`$\alpha = 2 < \beta = 3$, which is allowed.`],
      md`Direction from the cosine: $-z$. The exponent should then be $e^{+\alpha z}$. With $e^{-2z}$ the wave would gain energy as it travels.`),
    Q(md`$\cos(\omega t - \beta z - 90°)$ is the same as…`,
      ['$\\sin(\\omega t - \\beta z)$', '$-\\sin(\\omega t - \\beta z)$', '$\\cos(\\omega t - \\beta z)$', '$-\\cos(\\omega t - \\beta z)$'], 0,
      [null, md`$-\sin x = \cos(x + 90°)$.`, md`A $90°$ shift changes a cosine into a sine.`, md`$-\cos x$ needs a $180°$ shift.`],
      md`$\cos(x - 90°) = \cos x\cos 90° + \sin x\sin 90° = \sin x$.`),
    Q(md`What is the phasor of $\mathbf E = 6e^{-2y}\cos(\omega t - 3y + 45°)\,\hat z$ V/m?`,
      [md`$\hat z\,6e^{j45°}e^{-(2 + j3)y}$`, md`$\hat z\,6e^{j45°}e^{-(3 + j2)y}$`, md`$\hat z\,6e^{-j45°}e^{-(2 + j3)y}$`, md`$\hat z\,6e^{j45°}e^{-(2 - j3)y}$`], 0,
      [null, md`That swaps $\alpha$ and $\beta$. $\alpha = 2$ is in the exponent.`, md`A $+45°$ phase in the cosine gives $e^{+j45°}$.`, md`$e^{-(2 - j3)y} = e^{-2y}e^{+j3y}$, which turns the phase the wrong way: that would travel toward $-y$.`],
      md`$\tilde E = E_0e^{j\phi}e^{-\gamma y}$ with $\gamma = 2 + j3$.`),
    Q(md`A wave has $\gamma = 6 + j8$ 1/m. Its size and angle are…`,
      ['$10$ 1/m at $53.1°$', '$14$ 1/m at $53.1°$', '$10$ 1/m at $36.9°$', '$100$ 1/m at $53.1°$'], 0,
      [null, md`That adds the parts. The size needs Pythagoras: $\sqrt{36 + 64}$.`, md`$36.9°$ is $\tan^{-1}(6/8)$, which is $\tau$. The angle of $\gamma$ is $\tan^{-1}(8/6)$.`, md`That is $|\gamma|^2$.`],
      md`$|\gamma| = \sqrt{36 + 64} = 10$, $\angle\gamma = \tan^{-1}(8/6) = 53.1°$, so $\tau = 36.9°$.`),
    Q(md`Which value can $\tau$, the angle of $\eta$, **not** take in any material?`,
      ['$50°$', '$0°$', '$22.5°$', '$44°$'], 0,
      [null, md`$\tau = 0$ is any lossless dielectric.`, md`$\tau = 22.5°$ is a loss tangent of exactly 1.`, md`$44°$ is a very good conductor, close to the limit.`],
      md`$\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$, and $\tan^{-1}$ stays below $90°$. So $\tau < 45°$, which also means $\alpha < \beta$.`),
    Q(md`A wave has $\alpha$ only slightly smaller than $\beta$. What is $\tau$ close to?`,
      ['$45°$, a good conductor', '$0°$, a near-perfect dielectric', '$90°$', '$22.5°$'], 0,
      [null, md`$\tau = \tan^{-1}(\alpha/\beta)$ is near $0$ only when $\alpha \ll \beta$.`, md`$\tau$ never reaches $90°$; it stays below $45°$.`, md`$22.5°$ needs $\alpha/\beta = \tan 22.5° \approx 0.41$.`],
      md`$\tan\tau = \alpha/\beta \approx 1$, so $\tau \approx 45°$: the good-conductor limit of [Topic 7](#/l/w2-limits).`),
    Q(md`$E_x = 120\cos(\omega t - \beta z)$ V/m and $H_y = 3\cos(\omega t - \beta z - 25°)$ A/m in a lossless-looking wave with no decay shown. Then $\eta$ is…`,
      [md`$40e^{j25°}\ \Omega$`, md`$40e^{-j25°}\ \Omega$`, md`$360e^{j25°}\ \Omega$`, md`$40\ \Omega$, real`], 0,
      [null, md`$H$ lags by $25°$, so $\eta = \tilde E/\tilde H$ has angle $+25°$.`, md`That multiplies the amplitudes.`, md`The phases differ by $25°$, so $\eta$ cannot be real. (A real problem would also show the decay; the phase lag says the material is lossy.)`],
      md`$|\eta| = 120/3 = 40\ \Omega$, $\tau = 0° - (-25°) = 25°$.`),
    Q(md`At one point, $E$ peaks at $t = 0$ in a material with $\tau = 36°$, at $f = 1$ MHz. When does $H$ peak next?`,
      ['$t = 0.1\\ \\mu$s', '$t = 36\\ \\mu$s', '$t = -0.1\\ \\mu$s', '$t = 0.25\\ \\mu$s'], 0,
      [null, md`That reads $36°$ as microseconds. Convert: $36°$ is a tenth of a period.`, md`$H$ lags, so it peaks after $E$, not before.`, md`A quarter period would be a $90°$ lag. $\tau$ is $36°$.`],
      md`The delay is $\tau/\omega$, which is the fraction $36/360 = 0.1$ of a period. The period is $1\ \mu$s, so $0.1\ \mu$s.`),
    Q(md`A wave travels toward $+\hat y$ with $\mathbf E$ along $-\hat x$. Along which unit vector does $\mathbf H$ point, with a positive amplitude and the same phase convention as $E$ minus $\tau$?`,
      [md`$+\hat z$`, md`$-\hat z$`, md`$+\hat x$`, md`$-\hat y$`], 0,
      [null, md`$\hat k\times\hat e = \hat y\times(-\hat x) = -(\hat y\times\hat x) = +\hat z$. The minus signs cancel.`, md`$\mathbf H$ is perpendicular to $\mathbf E$, which is along $x$.`, md`$\mathbf H$ is perpendicular to the travel direction.`],
      md`$\hat h = \hat k\times\hat e = \hat y\times(-\hat x) = +\hat z$. Check: $(-\hat x)\times\hat z = \hat y$ ✓.`),
    Q(md`$\tilde{\mathbf H} = \hat y\,H_0e^{+\gamma z}$. Along which unit vector is $\tilde{\mathbf E}$ (written as $\hat e\,\eta H_0e^{+\gamma z}$)?`,
      [md`$-\hat x$`, md`$+\hat x$`, md`$-\hat z$`, md`$+\hat y$`], 0,
      [null, md`That is the forward wave's answer. Here $e^{+\gamma z}$ means $\hat k = -\hat z$, and $\hat e = \hat h\times\hat k = \hat y\times(-\hat z) = -\hat x$.`, md`$-\hat z$ is the direction of travel.`, md`$\mathbf E$ is perpendicular to $\mathbf H$.`],
      md`$\tilde{\mathbf E} = \eta\tilde{\mathbf H}\times\hat k = \eta H_0\,\hat y\times(-\hat z)\,e^{\gamma z} = -\hat x\,\eta H_0e^{\gamma z}$.`),
    Q(md`$|\eta| = 10\ \Omega$, $\tau = 20°$ and $\gamma = 3e^{j70°}$ 1/m at $\omega = 10^7$ rad/s. Then $\mu$ is…`,
      [md`$3\times10^{-6}$ H/m`, md`$3.3\times10^{-7}$ H/m`, md`$4\pi\times10^{-7}$ H/m, always`, md`$3\times10^{8}$ H/m`], 0,
      [null, md`That divides $|\eta|$ by $|\gamma|$. Multiply them.`, md`Only a non-magnetic material has $\mu_0$; nothing here says so.`, md`Divide by $\omega$; do not multiply.`],
      md`$\mu = |\eta||\gamma|/\omega = 30/10^7 = 3\times10^{-6}$ H/m, about $2.4\mu_0$. The angles $20° + 70° = 90°$ confirm the data are consistent.`),
    Q(md`In $\sigma = 2\alpha\beta/\omega\mu$, where does the 2 come from?`,
      ['From squaring $\\alpha + j\\beta$: the cross term $j\\alpha\\beta$ appears twice', 'From the factor 2 in the time average', 'From the forward and backward waves', 'From $\\tau$ being half an angle'], 0,
      [null, md`No time averages are involved; this is just $\gamma^2$.`, md`Only one wave is in this calculation.`, md`The half in $\tau$ is a separate fact about the square root in $\eta$.`],
      md`$(\alpha + j\beta)^2 = \alpha^2 + 2j\alpha\beta - \beta^2$. The imaginary part $2\alpha\beta$ becomes $\omega\mu\sigma$.`),
    Q(md`You read $\alpha = 499$ Np/m and $\beta = 501$ rad/m off a good conductor's wave, each to about $\pm1$. What can you trust?`,
      ['$\\sigma$, but not $\\epsilon$', '$\\epsilon$, but not $\\sigma$', 'Both, to three figures', 'Neither'], 0,
      [null, md`$\epsilon$ needs $\beta^2 - \alpha^2$, a small difference of two large, nearly equal numbers.`, md`$\sigma = 2\alpha\beta/\omega\mu$ uses a product, which is robust.`, md`$\sigma$ is fine to a fraction of a percent.`],
      md`$\beta^2 - \alpha^2 = (\beta - \alpha)(\beta + \alpha) = 2\times1000$, and an error of 1 in either reading changes $\beta - \alpha$ by 50%. In a good conductor the displacement current is negligible, so its wave hardly depends on $\epsilon$ at all.`),
    Q(md`A wave in a material is given only as $\mathbf E(z, t)$, with no statement about $\mu$. Which of these can you **not** find?`,
      ['$|\\eta|$', '$\\tau$', '$v_p$', '$\\delta$'], 0,
      [null, md`$\tan\tau = \alpha/\beta$ needs only the wave.`, md`$v_p = \omega/\beta$ is read straight off.`, md`$\delta = 1/\alpha$ is read straight off.`],
      md`$|\eta| = \omega\mu/|\gamma|$ needs $\mu$. With $\mathbf H$ given too, $|\eta| = E_0/H_0$ and then $\mu$ follows.`),
    Q(md`$\mathbf E = 2e^{-0.5x}\cos(10^9t - 20x)\,\hat z$ V/m. Its phase speed is…`,
      [md`$5\times10^7$ m/s`, md`$2\times10^9$ m/s`, md`$2\times10^{10}$ m/s`, md`$3\times10^8$ m/s`], 0,
      [null, md`That uses $\alpha = 0.5$: $10^9/0.5$. Use $\beta = 20$.`, md`That multiplies by $\beta$.`, md`That is $c$. In a material $v_p = \omega/\beta$.`],
      md`$v_p = \omega/\beta = 10^9/20 = 5\times10^7$ m/s.`),
    Q(md`At one point, $E$ has phase $70°$ and $H$ has phase $40°$ in one traveling wave. What is $\alpha/\beta$?`,
      ['$\\tan30° \\approx 0.577$', '$\\tan60° \\approx 1.73$', '$\\tan15° \\approx 0.27$', 'It cannot be found from phases'], 0,
      [null, md`$\tan60°$ is $\beta/\alpha$, or the loss tangent's angle. $\tau = 30°$.`, md`No halving: $\tau$ is the whole lag, and $\tan\tau = \alpha/\beta$.`, md`The lag is $\tau$, and $\tan\tau = \alpha/\beta$.`],
      md`$\tau = 70° - 40° = 30°$, and $\alpha/\beta = \tan\tau = 0.577$.`),
    Q(md`$\mathbf H = -\hat y\,2\cos(\omega t - 120°)$ A/m at the origin. What is $H_y$ there at $t = 0$?`,
      ['$+1$ A/m', '$-1$ A/m', '$-2$ A/m', '$+2$ A/m'], 0,
      [null, md`$\cos(-120°) = -0.5$, and the unit vector $-\hat y$ supplies another minus sign.`, md`That ignores the cosine: at $t = 0$ it is $\cos(-120°)$, not 1.`, md`$2\cos(-120°) = -1$, and then the $-\hat y$ makes it $+1$.`],
      md`$H_y = -2\cos(-120°) = -2(-0.5) = +1$ A/m.`),
    Q(md`A wave's frequency is raised in a lossy material with fixed $\sigma$, $\epsilon$, $\mu$. What happens to its loss tangent?`,
      ['It falls, as $1/\\omega$', 'It rises, as $\\omega$', 'It stays the same', 'It falls, as $1/\\sqrt\\omega$'], 0,
      [null, md`$\omega$ is in the denominator of $\sigma/\omega\epsilon$.`, md`It has $\omega$ in it, so it changes.`, md`It is exactly $1/\omega$; there is no square root.`],
      md`$\sigma/\omega\epsilon$: the displacement current grows with $\omega$, the conduction current does not.`),
    Q(md`A current sheet in a lossy material radiates waves on both sides. If the frequency doubles with the same sheet current amplitude, what stays the same at the sheet?`,
      ['The amplitude of $\\mathbf H$', 'The amplitude of $\\mathbf E$', 'The angle between the phases of $E$ and $H$', 'The penetration depth'], 0,
      [null, md`$E = \eta H$ at the sheet, and $\eta$ depends on $\omega$.`, md`That is $\tau$, which depends on the loss tangent.`, md`$\delta = 1/\alpha$ depends on $\omega$.`],
      md`The jump condition gives $H = J_s/2$ on each side of the sheet, with no material constant and no $\omega$ in it. (This is Spring 2024 #2(e)(i).)`),
    Q(md`Which line of the formula sheet tells you $\mu$ from a wave?`,
      [md`$\mu = \gamma\eta/j\omega$`, md`$\mu = \Re\{\gamma/\eta\}$`, md`$\mu = \tfrac1\omega\Im\{\gamma/\eta\}$`, md`$\mu = \gamma/(j\omega\eta)$`], 0,
      [null, md`That is $\sigma$.`, md`That is $\epsilon$.`, md`That has $\eta$ in the denominator. It is the product $\gamma\eta$ that equals $j\omega\mu$.`],
      md`$\eta\gamma = j\omega\mu$, so $\mu = \gamma\eta/j\omega$, and its size is $|\gamma||\eta|/\omega$.`),
    Q(md`A non-magnetic material has a wave with $\gamma = 0.6 + j0.8$ 1/m at $\omega = 10^7$ rad/s. Then $|\eta|$ is…`,
      [md`$4\pi\ \Omega$`, md`$4\pi/1.4\ \Omega$`, md`$120\pi\ \Omega$`, md`$4\pi/0.8\ \Omega$`], 0,
      [null, md`That uses $\alpha + \beta = 1.4$. $|\gamma| = \sqrt{0.36 + 0.64} = 1$.`, md`That is free space.`, md`That uses $\beta$ alone. Use the size of $\gamma$.`],
      md`$|\eta| = \omega\mu_0/|\gamma| = (10^7)(4\pi\times10^{-7})/1 = 4\pi\ \Omega$.`),
  ];

  // ================================================================ Topic 7: imperfect dielectrics, good conductors, skin depth
  // ---------------------------------------------------------------- figures, Topic 7
  // the loss tangent on a log axis, the three regimes, and seawater at three frequencies
  function regimeFig() {
    const g = PF.fig({ alt: 'The loss tangent on a logarithmic number line from 10 to the minus 2 up to 10 to the 6. Below 0.1 the material is an imperfect dielectric; from 0.1 to 10 it is in between (shaded); above 10 it is a good conductor. Seawater is marked at 18 gigahertz (about 0.05), at 100 megahertz (about 9) and at 1 kilohertz (about 900,000).' });
    const x0 = 20, x1 = 420, y = 76, lo = -2, hi = 6;
    const X = (e) => x0 + (x1 - x0) * (e - lo) / (hi - lo);
    g.rect(X(-1), y - 46, X(1) - X(-1), 58, { cls: 'shade' });
    g.arrow(x0 - 8, y, x1 + 18, y, { cls: 'dim', hs: 7 });
    for (let e = lo; e <= hi; e++) {
      g.line(X(e), y - 4, X(e), y + 4, { cls: 'dim' });
      g.label(X(e), y + 8, e === 0 ? '1' : e === 1 ? '10' : `10^{${e}}`, 't', 'small');
    }
    g.label(x1 + 22, y, '\\sigma/\\omega\\epsilon', 'l', 'small');
    g.text((x0 + X(-1)) / 2 - 4, y - 32, 'imperfect', 'c');
    g.text((x0 + X(-1)) / 2 - 4, y - 16, 'dielectric', 'c');
    g.text(X(0), y - 32, 'in', 'c');
    g.text(X(0), y - 16, 'between', 'c');
    g.text((X(1) + x1) / 2, y - 24, 'good conductor', 'c');
    for (const [v, lab] of [[0.0494, '18\\ \\text{GHz}'], [8.89, '100\\ \\text{MHz}'], [8.89e5, '1\\ \\text{kHz}']]) {
      const xx = X(Math.log10(v));
      g.dot(xx, y, 4.2);
      g.label(xx, y + 34, lab, 't', 'small');
    }
    g.text((x0 + x1) / 2, y + 62, 'dots: seawater (σ = 4 S/m, εr = 81) at three frequencies', 'c');
    return g.svg();
  }
  // one instant of E inside a good conductor: e^{-z/delta} cos(z/delta)
  const insideFig = () => PF.plot({
    w: 400, h: 190, x: [0, 7], y: [-0.45, 1.25], zero: true, xl: 'z', yl: 'E',
    xt: [[1, '\\delta'], [Math.PI, '\\pi\\delta'], [2 * Math.PI, '2\\pi\\delta']], yt: [[1, 'E_0']],
    curves: [
      { f: (z) => Math.exp(-z) * Math.cos(z), n: 400 },
      { f: (z) => Math.exp(-z), cls: 'dash', lab: 'E_0e^{-z/\\delta}', labAt: 1.25, dx: 8, dy: -10 },
      { f: (z) => -Math.exp(-z), cls: 'dash' },
    ],
  });
  // skin depth against frequency, log-log, for copper and seawater
  const skinFig = () => PF.plot({
    w: 410, h: 240, ml: 58, x: [0, 9.4], y: [-6.4, 3], xl: 'f', yl: '\\delta',
    xt: [[0, '1\\ \\text{Hz}'], [3, '1\\ \\text{kHz}'], [6, '1\\ \\text{MHz}'], [9, '1\\ \\text{GHz}']],
    yt: [[-6, '1\\ \\mu\\text{m}'], [-3, '1\\ \\text{mm}'], [0, '1\\ \\text{m}'], [3, '1\\ \\text{km}']],
    curves: [
      { f: (x) => Math.log10(7.958) - 0.5 * (x - 3), to: 8, lab: '\\text{seawater}', labAt: 5.2, dx: 6, dy: -12 },
      { f: (x) => Math.log10(0.0661) - 0.5 * x, cls: 'dash', lab: '\\text{copper}', labAt: 3.6, dx: -8, dy: 16, anchor: 'r' },
    ],
  });
  // the amplitude and the power left at depth z, with the three depths worth knowing
  const depthFig = () => PF.plot({
    w: 400, h: 200, x: [0, 5.4], y: [0, 1.12], xl: 'z', yl: '\\text{fraction left}',
    xt: [[1, '\\delta'], [2.303, '2.3\\delta'], [4.605, '4.6\\delta']], yt: [[1, '1'], [0.368, '0.37'], [0.1, '0.1']],
    curves: [
      { f: (z) => Math.exp(-z), lab: '\\text{amplitude}', labAt: 1.55, dx: 8, dy: -8 },
      { f: (z) => Math.exp(-2 * z), cls: 'dash', lab: '\\text{power}', labAt: 0.62, dx: 6, dy: 16 },
    ],
  });

  // ---------------------------------------------------------------- Topic 7: the lesson
  EM.lesson('w2', {
    id: 'w2-limits', topic: 7, ref: 'Lecture 23', title: 'Imperfect dielectrics, good conductors, skin depth',
    steps: [
      RF(md`
        !!key Why you care
          Spring 2024 #2 was worth 30 points: a wave in a good conductor with $\delta = 1$ mm. Summer 2018 and 2019 sent a wave into seawater at 1 kHz. Summer 2020 asked about dry earth at 100 Hz. HW 9 #4 sends a signal down to a submarine. Without a calculator, the exact formulas of [Topic 5](#/l/w2-gamma) are slow for all of these. Each one becomes a single square root once you know which **limit** the material is in. Page 3 of your formula sheet has the limits in three lines. This lesson derives every line from Topic 5, shows when you may use it, and drills the numbers that come out clean.

        ### Notation

        - $\sigma/\omega\epsilon$: the **loss tangent**, the conduction current divided by the displacement current ([Topic 5](#/l/w2-gamma), Section 2). It has no units.
        - $k = \omega\sqrt{\mu\epsilon}$ and $\eta_i = \sqrt{\mu/\epsilon}$: the wavenumber and the impedance the same material would have with $\sigma = 0$. The $i$ stands for "ideal".
        - $\delta = 1/\alpha$: the **skin depth**, also called the penetration depth. The amplitude falls to $1/e \approx 37\%$ every $\delta$ meters.
        - $\ll$ and $\gg$: "much smaller than" and "much larger than". In this lesson that means a factor of 10 or more.
        - **PEC**: a perfect electric conductor, $\sigma = \infty$.
        - $v_p = \omega/\beta$: the phase velocity. $v_g$: the group velocity, the speed of a signal's envelope (Section 9).

        ### 1. One number decides: the loss tangent

        Start from the line on your formula sheet that Topic 5 derived:
        $$\gamma = j\omega\sqrt{\mu\left(\epsilon - j\frac{\sigma}{\omega}\right)}$$
        Pull $\epsilon$ out of the bracket. Inside, $\sigma/\omega$ becomes $\sigma/\omega\epsilon$:
        $$\gamma = j\omega\sqrt{\mu\epsilon}\,\sqrt{1 - j\frac{\sigma}{\omega\epsilon}}$$
        The first part is the lossless wavenumber $k$:
        $$\gamma = jk\sqrt{1 - j\frac{\sigma}{\omega\epsilon}} \qquad\text{(1)}$$
        Do the same to $\eta = \sqrt{\mu/(\epsilon - j\sigma/\omega)}$:
        $$\eta = \frac{\eta_i}{\sqrt{1 - j\sigma/\omega\epsilon}} \qquad\text{(2)}$$
        All of the loss sits in one complex number, $1 - j\sigma/\omega\epsilon$. If the loss tangent is tiny, that number is almost exactly 1. If it is huge, the 1 hardly matters and the number is almost $-j\sigma/\omega\epsilon$. Those are the two limits, and the rest of this lesson works them out.

        **Computing the loss tangent fast.** Put in $\omega = 2\pi f$ and $\epsilon = \epsilon_r\epsilon_0$ with $\epsilon_0 = 10^{-9}/36\pi$:
        $$\omega\epsilon = 2\pi f\,\epsilon_r\,\frac{10^{-9}}{36\pi}$$
        The $\pi$'s cancel, and $2/36 = 1/18$:
        $$\omega\epsilon = \frac{\epsilon_r f}{18\times10^9}$$
        Divide $\sigma$ by it:
        $$\boxed{\frac{\sigma}{\omega\epsilon} = \frac{18\times10^9\,\sigma}{\epsilon_r f}}$$
        with $f$ in hertz. Seawater has $\sigma = 4$ S/m and $\epsilon_r = 81$. At 1 kHz:
        $$\frac{\sigma}{\omega\epsilon} = \frac{(18\times10^9)(4)}{(81)(10^3)} \approx 8.9\times10^5$$

        **The rule.** Below about 0.1, the material is an **imperfect dielectric** (also called low-loss). Above about 10, it is a **good conductor**. In between, neither approximation is good, and you use the polar method of Topic 5. Section 5 shows where these cut-offs come from.

        [[fig:regime]]

        !!intuition Does this make sense?
          The same seawater is a good conductor at 1 kHz and an imperfect dielectric at 18 GHz. Nothing about the water changed. The displacement current $\omega\epsilon E$ grows with frequency while the conduction current $\sigma E$ does not, so at a high enough frequency the displacement current wins. **Never decide the regime from $\sigma$ alone.**
      `, { regime: { svg: regimeFig(), cap: 'The loss tangent decides. It falls as 1/f, so one material moves from right to left as the frequency rises.' } }),
      Q(md`**Predict.** Seawater ($\sigma = 4$ S/m, $\epsilon_r = 81$) carries a wave at 18 GHz. Which formulas should you use?`,
        [md`Imperfect dielectric: $\sigma/\omega\epsilon \approx 0.05$`, md`Good conductor: $\sigma = 4$ S/m is a large conductivity`, md`In between: $\sigma/\omega\epsilon = 4$`, md`In between: $\sigma/\omega\epsilon \approx 0.31$`], 0,
        [null, md`That judges by $\sigma$ alone. What matters is $\sigma$ compared with $\omega\epsilon$, and at 18 GHz $\omega\epsilon$ is large.`, md`That left out $\epsilon_r = 81$: it used $\epsilon_0$ for the water's $\epsilon$.`, md`That used $f$ where $\omega = 2\pi f$ belongs, which makes the ratio $2\pi$ times too big.`],
        md`$\sigma/\omega\epsilon = (18\times10^9)(4)/(81\times18\times10^9) = 4/81 \approx 0.049$. That is below 0.1: an imperfect dielectric.`),
      R(md`
        ### 2. The imperfect dielectric: the binomial approximation

        Suppose $\sigma/\omega\epsilon \ll 1$. Equation (1) needs the square root of $1 - j\sigma/\omega\epsilon$, a number very close to 1. Here is the tool for that.

        **The binomial approximation.** Let $u$ be any small number, real or complex. Guess that $1 + u/2$ is the square root of $1 + u$, and square the guess:
        $$\left(1 + \frac u2\right)^2 = 1 + u + \frac{u^2}{4}$$
        When $u$ is small, $u^2/4$ is far smaller still. For $u = 0.1$ it is $0.0025$. Drop it:
        $$\left(1 + \frac u2\right)^2 \approx 1 + u$$
        So the guess works:
        $$\sqrt{1 + u} \approx 1 + \frac u2$$
        For the inverse root, notice that $(1 - u/2)(1 + u/2) = 1 - u^2/4 \approx 1$. So $1 - u/2$ is the reciprocal of $1 + u/2$:
        $$\frac{1}{\sqrt{1 + u}} \approx 1 - \frac u2$$

        **γ.** Put $u = -j\sigma/\omega\epsilon$ into (1):
        $$\gamma \approx jk\left(1 - j\frac{\sigma}{2\omega\epsilon}\right)$$
        Multiply out. The second term has $j\cdot(-j) = -j^2 = +1$:
        $$\gamma \approx \frac{k\sigma}{2\omega\epsilon} + jk$$
        The real part is $\alpha$ and the imaginary part is $\beta$. First $\beta$:
        $$\beta \approx k = \omega\sqrt{\mu\epsilon}$$
        Then $\alpha$, writing $k$ out:
        $$\alpha \approx \frac{\sigma}{2}\cdot\frac{\omega\sqrt{\mu\epsilon}}{\omega\epsilon}$$
        The $\omega$ cancels, and $\sqrt{\mu\epsilon}/\epsilon = \sqrt{\mu/\epsilon}$:
        $$\boxed{\alpha \approx \frac{\sigma}{2}\sqrt{\frac{\mu}{\epsilon}} = \frac{\sigma\eta_i}{2}}$$
        That is the line on your sheet.

        **η.** Put the same $u$ into (2), using the inverse-root result:
        $$\eta \approx \eta_i\left(1 + j\frac{\sigma}{2\omega\epsilon}\right)$$
        That is on your sheet too. Its size is $\eta_i$, up to a correction of order $u^2$. Its angle is the angle of a number with real part 1 and a small imaginary part:
        $$\tau \approx \tan^{-1}\frac{\sigma}{2\omega\epsilon} \approx \frac{\sigma}{2\omega\epsilon}$$
        **in radians**, because $\tan\theta \approx \theta$ for a small angle. Compare the exact $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$ of Topic 5: with $\tan^{-1}x \approx x$ it gives the same thing ✓.

        !!intuition Does this make sense?
          - **β did not change.** To first order the wave travels as if there were no loss; only a slow decay is added on top.
          - **α has no ω in it.** In a low-loss material every frequency fades at the same rate per meter.
          - **Units:** S/m times $\Omega$ is 1/m ✓.
          - **How many wavelengths fit in one δ?** $\delta/\lambda = \beta/2\pi\alpha = \omega\epsilon/\pi\sigma$, which is large when the loss tangent is small. The wave runs many wavelengths before it fades.
      `),
      Q(md`**Predict.** A material has $\mu = \mu_0$, $\epsilon_r = 9$ and $\sigma = 5\times10^{-4}$ S/m. At 1 GHz its loss tangent is $10^{-3}$. What is $\alpha$?`,
        [md`$0.01\pi \approx 0.0314$ Np/m`, md`$0.02\pi \approx 0.0628$ Np/m`, md`$0.03\pi \approx 0.0942$ Np/m`, md`$20\pi \approx 62.8$ Np/m`], 0,
        [null, md`That is $\sigma\eta_i$, with the factor $\tfrac12$ dropped. It comes from $\sqrt{1 + u} \approx 1 + u/2$.`, md`That used $\eta_0 = 120\pi$. The material's impedance is $\eta_i = 120\pi/\sqrt{9} = 40\pi$.`, md`That is $k = \omega\sqrt{\mu\epsilon} = \beta$, the phase constant. $\alpha$ is the small real part.`],
        md`$\eta_i = 120\pi/3 = 40\pi\ \Omega$, so $\alpha = \sigma\eta_i/2 = (5\times10^{-4})(40\pi)/2 = 0.01\pi \approx 0.0314$ Np/m. The frequency does not enter: it was only needed to confirm the regime.`),
      RF(md`
        ### 3. The good conductor: γ at 45°

        Now suppose $\sigma/\omega\epsilon \gg 1$. Go back to $\gamma^2$ from Topic 5:
        $$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$$
        Inside the bracket, $\sigma$ is more than ten times $\omega\epsilon$. Drop the smaller term:
        $$\gamma^2 \approx j\omega\mu\sigma$$
        Take the square root. $\omega\mu\sigma$ is a positive real number, so its root is ordinary:
        $$\gamma \approx \sqrt{\omega\mu\sigma}\,\sqrt j$$
        **The square root of j.** Try $1 + j$ and square it:
        $$(1 + j)^2 = 1 + 2j + j^2 = 2j$$
        So $1 + j$ is the square root of $2j$. Divide by $\sqrt2$:
        $$\sqrt j = \frac{1 + j}{\sqrt2}$$
        In polar form this is $e^{j45°}$: half of the $90°$ angle of $j$. (The other root, $-(1 + j)/\sqrt2$, would give $\alpha < 0$, a wave that grows as it travels, so it is rejected.) Put it in:
        $$\gamma \approx (1 + j)\sqrt{\frac{\omega\mu\sigma}{2}}$$
        The real and imaginary parts are equal. With $\omega = 2\pi f$, the 2's cancel inside the root:
        $$\boxed{\alpha = \beta \approx \sqrt{\pi f\mu\sigma}}$$
        The skin depth is the inverse of $\alpha$:
        $$\boxed{\delta = \frac{1}{\sqrt{\pi f\mu\sigma}}}$$
        Since $\alpha = \beta = 1/\delta$, the whole propagation constant is
        $$\boxed{\gamma \approx \frac{1 + j}{\delta}}$$
        Give an exam $\delta$ and you have $\gamma$ in one line. That was all of Spring 2024 #2(a).

        **Wavelength and speed.** With $\beta = 1/\delta$:
        $$\lambda = \frac{2\pi}{\beta} = 2\pi\delta$$
        $$v_p = \frac{\omega}{\beta} = \omega\delta$$

        [[fig:inside]]

        !!intuition Does this make sense?
          One wavelength is $2\pi\delta$, and over one wavelength the amplitude falls by $e^{-2\pi} \approx 0.002$. **A wave in a good conductor dies within a single wavelength.** It hardly behaves like a wave at all; it is a field soaking into the surface. Compare an imperfect dielectric, where it runs dozens of wavelengths. And $\alpha = \beta$ puts the arrow of $\gamma$ at $45°$, so by [Topic 6](#/l/w2-read), Section 3, $\tau = 90° - 45° = 45°$. Section 4 confirms it directly.
      `, { inside: { svg: insideFig(), cap: 'One instant of E inside a good conductor, against depth. The dashed envelope is down to 37% at δ. At πδ the field has turned around with 4% left; at one wavelength, 2πδ, only 0.2% is left.' } }),
      Q(md`**Predict.** A wave travels in a good conductor with skin depth $\delta = 2$ mm. What is $\gamma$?`,
        [md`$500(1 + j)$ 1/m`, md`$500$ 1/m`, md`$2\times10^{-3}(1 + j)$ 1/m`, md`$500(1 - j)$ 1/m`], 0,
        [null, md`That keeps only $\alpha$. In a good conductor $\beta = \alpha$, so $\gamma$ has an equal imaginary part.`, md`That uses $\delta$ itself. $\alpha = 1/\delta$, so the parts are $1/(2\times10^{-3}) = 500$.`, md`$\beta$ is positive for every wave. The direction of travel lives in the sign of the exponent, $e^{\mp\gamma x}$, not in $\gamma$.`],
        md`$\alpha = \beta = 1/\delta = 1/(2\times10^{-3}\ \text{m}) = 500$, so $\gamma = 500(1 + j)$ 1/m.`),
      R(md`
        ### 4. η in a good conductor, and τ = 45°

        Use the sheet's $\eta = j\omega\mu/\gamma$ with $\gamma = (1 + j)/\delta$:
        $$\eta \approx \frac{j\omega\mu\delta}{1 + j}$$
        Simplify $j/(1 + j)$. Multiply the top and the bottom by $1 - j$; the bottom becomes $1 + 1 = 2$, and on top $j\cdot(-j) = 1$:
        $$\frac{j}{1 + j} = \frac{j(1 - j)}{2} = \frac{1 + j}{2}$$
        So
        $$\eta \approx \frac{1 + j}{2}\,\omega\mu\delta$$
        Now remove $\omega\mu$. The skin depth says $\delta^2 = 2/\omega\mu\sigma$, so $\omega\mu = 2/\sigma\delta^2$:
        $$\eta \approx \frac{1 + j}{2}\cdot\frac{2}{\sigma\delta^2}\cdot\delta$$
        The 2's cancel and one $\delta$ cancels:
        $$\boxed{\eta \approx \frac{1 + j}{\sigma\delta}}$$
        The real and imaginary parts are equal, so its angle is
        $$\tau \approx 45°$$
        and its size is $\sqrt2/\sigma\delta$. To see the sheet's form, put $1/\delta = \sqrt{\omega\mu\sigma/2}$ back in:
        $$|\eta| = \frac{\sqrt2}{\sigma}\sqrt{\frac{\omega\mu\sigma}{2}}$$
        The $\sqrt2$'s cancel and one $\sigma$ comes out of the root:
        $$|\eta| = \sqrt{\frac{\omega\mu}{\sigma}}$$
        ✓ That is the line on your sheet.

        **The real part has a name.** $\Re\{\eta\} = 1/\sigma\delta$ is the **surface resistance** $R_s$. It is the resistance of one square of the conductor's surface layer, one $\delta$ thick. [Topic 8](#/l/w2-loss) uses it to find the power a conductor absorbs.

        !!intuition Does this make sense?
          $|\eta|$ is tiny. Copper ($\sigma = 5.8\times10^7$ S/m) at 1 MHz has $\delta \approx 66\ \mu$m, so $\sigma\delta \approx 3800$ S and $|\eta| \approx \sqrt2/3800 \approx 3.7\times10^{-4}\ \Omega$, about a millionth of $\eta_0$. A tiny $E/H$ ratio means a large $H$ (a large current) with almost no $E$: a good conductor nearly shorts out the electric field. And $H$ lags $E$ by the largest angle any material allows, $45°$.
      `),
      Q(md`**Predict.** A good conductor has $\sigma = 10^4$ S/m, and at the working frequency $\delta = 1$ mm. What is $\eta$?`,
        [md`$0.1 + j0.1\ \Omega$`, md`$0.1\ \Omega$`, md`$0.141 + j0.141\ \Omega$`, md`$10 + j10\ \Omega$`], 0,
        [null, md`That forgets the angle. $\eta = (1 + j)/\sigma\delta$ has equal real and imaginary parts: $\tau = 45°$.`, md`That puts the size $\sqrt2/\sigma\delta$ into each part. Each part is $1/\sigma\delta$; together they make the size $0.141$.`, md`That is $\sigma\delta$ itself, upside down. $\eta = (1 + j)/\sigma\delta$.`],
        md`$\sigma\delta = (10^4)(10^{-3}) = 10$ S, so $\eta = (1 + j)/10 = 0.1 + j0.1\ \Omega$. Its size is $0.141\ \Omega$ at $45°$.`),
      R(md`
        ### 5. How good are the approximations? The regime test

        Each approximation threw something away. To see what that costs, compare with the exact formulas of [Topic 5](#/l/w2-gamma), Section 8. Measure $\alpha$ in units of $k$; then only the loss tangent matters:

        | $\sigma/\omega\epsilon$ | exact $\alpha/k$ | dielectric line | conductor line |
        |---|---|---|---|
        | 0.1 | 0.0499 | 0.050, good | 0.224, far off |
        | 1 | 0.455 | 0.500, 10% off | 0.707, 55% off |
        | 10 | 2.13 | 5.00, far off | 2.24, 5% off |
        | 100 | 7.04 | 50.0, far off | 7.07, good |

        Here the dielectric line is $\alpha/k = \tfrac12\sigma/\omega\epsilon$, and the conductor line is $\alpha/k = \sqrt{\sigma/2\omega\epsilon}$ (that is $\sqrt{\omega\mu\sigma/2}$ divided by $k$). So:

        - At $\sigma/\omega\epsilon \le 0.1$ the dielectric line is good to 0.1%.
        - At $\sigma/\omega\epsilon \ge 10$ the conductor line is good to 5%, and it gets better fast.
        - Near 1, **both are off by 10% or more.** That is why the exam problems that land there use the exact formulas with a clean triangle, like Topic 5's 3-4-5.

        **The crossover frequency.** The loss tangent equals 1 when $\omega\epsilon = \sigma$:
        $$f_c = \frac{\sigma}{2\pi\epsilon} = \frac{18\times10^9\,\sigma}{\epsilon_r}$$
        A material is a good conductor below about $f_c/10$, and an imperfect dielectric above about $10f_c$. For seawater $f_c = (18\times10^9)(4)/81 \approx 0.89$ GHz. For copper, with $\epsilon_r \approx 1$, $f_c \approx 10^{18}$ Hz, so at every radio and microwave frequency copper is a very good conductor.

        Slide the loss tangent below, and watch the wave pass from one limit to the other. The readout names the regime with the same cut-offs, 0.1 and 10.
      `),
      W3.damped(),
      Q(md`**Predict.** A material has $\sigma = 0.01$ S/m and $\epsilon_r = 9$. Up to roughly what frequency may you use the good-conductor formulas?`,
        ['2 MHz', '20 MHz', '200 MHz', '3.2 MHz'], 0,
        [null, md`20 MHz is $f_c$ itself, where $\sigma/\omega\epsilon = 1$. There the conductor line is 55% off. You need the ratio to be 10 or more.`, md`At 200 MHz the ratio is 0.1: that is where the **dielectric** line starts to work.`, md`That is $f_c/2\pi$: it set $\sigma/\epsilon$ equal to $f$ instead of $\omega$, and also kept the ratio at 1.`],
        md`$f_c = (18\times10^9)(0.01)/9 = 20$ MHz. The ratio goes as $1/f$, so it is 10 at $f_c/10 = 2$ MHz. Below about 2 MHz the material is a good conductor.`),
      RF(md`
        ### 6. The skin depth: how it scales, and copper

        Look at the formula again:
        $$\delta = \frac{1}{\sqrt{\pi f\mu\sigma}}$$
        $f$ and $\sigma$ are under a square root, in the denominator. So
        $$\delta \propto \frac{1}{\sqrt f}, \qquad \delta \propto \frac{1}{\sqrt\sigma}$$
        Raise the frequency 4 times and $\delta$ halves. Raise it 100 times and $\delta$ falls 10 times.

        **A form you can do in your head ($\mu = \mu_0$).** Put in $\mu_0 = 4\pi\times10^{-7}$:
        $$\pi f\mu_0\sigma = 4\pi^2\times10^{-7}\,f\sigma$$
        The root of $4\pi^2$ is $2\pi$, so
        $$\boxed{\delta = \frac{1}{2\pi\sqrt{10^{-7}f\sigma}}}$$
        Exams choose $f$ and $\sigma$ so that $10^{-7}f\sigma$ is a perfect square. Seawater at 1 kHz: $10^{-7}\times10^3\times4 = 4\times10^{-4}$, whose root is $0.02$. Then
        $$\delta = \frac{1}{2\pi(0.02)} = \frac{25}{\pi} \approx 7.96\ \text{m}$$

        **Copper**, $\sigma = 5.8\times10^7$ S/m. Here $10^{-7}f\sigma = 5.8f$:
        $$\delta_{\text{Cu}} = \frac{1}{2\pi\sqrt{5.8f}} \approx \frac{0.066}{\sqrt f}\ \text{m}$$

        | Frequency | Skin depth in copper |
        |---|---|
        | 60 Hz | 8.5 mm |
        | 1 kHz | 2.1 mm |
        | 1 MHz | 66 µm |
        | 1 GHz | 2.1 µm |

        [[fig:skin]]

        !!intuition Does this make sense?
          At 60 Hz the skin depth is 8.5 mm, so current uses the whole of a household wire. At 1 GHz it is 2 µm, thinner than a thirtieth of a hair: the current crowds into a thin skin on the surface. That is the **skin effect**. It is why high-frequency resistance is higher than DC resistance, and why microwave parts are often plated with a thin layer of silver.
      `, { skin: { svg: skinFig(), cap: 'Skin depth against frequency on log scales. Both lines fall with slope −1/2: δ ∝ 1/√f. Seawater stops at 100 MHz, where it stops being a good conductor.' } }),
      Q(md`**Predict.** A metal has $\delta = 50\ \mu$m at 1 MHz. What is $\delta$ at 100 MHz?`,
        [md`$5\ \mu$m`, md`$0.5\ \mu$m`, md`$500\ \mu$m`, md`$50\ \mu$m`], 0,
        [null, md`That divides by 100, as if $\delta \propto 1/f$. The frequency is under a square root.`, md`That moves the wrong way. A higher frequency squeezes the field into a thinner skin.`, md`$\delta$ has $f$ in it, so it must change.`],
        md`$\delta \propto 1/\sqrt f$. The frequency went up 100 times, so $\delta$ falls $\sqrt{100} = 10$ times: $5\ \mu$m.`),
      RF(md`
        ### 7. Seawater and the submarine

        Seawater has $\sigma = 4$ S/m and $\epsilon_r = 81$, so $f_c \approx 0.89$ GHz (Section 5). Below about 90 MHz it is a good conductor. Its skin depth, from the head-math form, is
        $$\delta = \frac{1}{2\pi\sqrt{4\times10^{-7}f}}$$
        which is $25/\pi \approx 8$ m at 1 kHz and scales as $1/\sqrt f$.

        **How deep does a signal reach?** At depth $z$ the amplitude is the fraction $e^{-z/\delta}$ of its value at the surface. Find the depth where that fraction equals some $p$:
        $$e^{-z/\delta} = p$$
        Take the natural log of both sides. $\ln e^{-z/\delta} = -z/\delta$, and $-\ln p = \ln(1/p)$:
        $$\frac{z}{\delta} = \ln\frac1p$$
        $$\boxed{z = \delta\ln\frac1p}$$
        Logs worth knowing without a calculator: $\ln 10 \approx 2.3$, $\ln 100 \approx 4.6$, $\ln 2 \approx 0.69$.

        | Amplitude left | Depth |
        |---|---|
        | 37% ($1/e$) | $\delta$ |
        | 10% | $2.3\delta$ |
        | 1% | $4.6\delta$ |
        | 0.1% | $6.9\delta$ |

        [[fig:depth]]

        **Power is different.** Power goes as the amplitude squared, $e^{-2z/\delta}$, so it falls twice as fast. 1% of the **power** is left at $z = \tfrac12\delta\ln100 = 2.3\delta$, which is where 10% of the amplitude is left. Read carefully which one a problem asks for.

        **Why submarines use very low frequencies.** $\delta \propto 1/\sqrt f$. At 1 kHz, 1% of the amplitude survives to $4.6\times8 \approx 37$ m. To reach ten times deeper you need a frequency a hundred times lower. The price is bandwidth: a carrier of a few hundred hertz can only carry a very slow message (Lecture 24).

        !!intuition Does this make sense?
          At 1 kHz the wavelength in seawater is $\lambda = 2\pi\delta = 50$ m. In air it would be $c/f = 300$ km. The water squeezes the wave 6000 times, and its crests crawl at $v_p = \omega\delta = 5\times10^4$ m/s. A good conductor gives the wave a lot of phase per meter and the same amount of decay.
      `, { depth: { svg: depthFig(), cap: 'The fraction left at depth z. Amplitude (solid): 37% at δ, 10% at 2.3δ, 1% at 4.6δ. Power (dashed) falls twice as fast.' } }),
      Q(md`**Predict.** At 100 kHz the skin depth of seawater is $2.5/\pi \approx 0.80$ m. How deep can a submarine be and still receive 1% of the surface **amplitude**?`,
        ['About 3.7 m', 'About 1.8 m', 'About 80 m', 'About 0.80 m'], 0,
        [null, md`$1.8$ m is $2.3\delta$, where 1% of the **power** is left (10% of the amplitude). The question asks about amplitude.`, md`That is $100\delta$, as if the amplitude fell in a straight line. It falls exponentially: $e^{-z/\delta} = 0.01$.`, md`At one $\delta$ the amplitude is still 37%, far more than 1%.`],
        md`$e^{-z/\delta} = 0.01$ gives $z = \delta\ln100 = 4.6\times0.80 \approx 3.7$ m.`),
      R(md`
        ### 8. The perfect conductor: the limit σ → ∞

        Let $\sigma$ grow without bound at a fixed frequency. Every good-conductor result has $\sigma$ in the denominator:
        $$\delta = \frac{1}{\sqrt{\pi f\mu\sigma}} \to 0$$
        $$|\eta| = \sqrt{\frac{\omega\mu}{\sigma}} \to 0$$
        And $\alpha = \beta = 1/\delta \to \infty$, so $\lambda = 2\pi\delta \to 0$. That is the **perfect electric conductor**, the PEC.

        What it means physically:

        - **No field gets in.** The skin depth is zero, so $\mathbf E$ and $\mathbf H$ vanish inside a PEC.
        - **E along the surface is zero.** $\eta = E/H \to 0$ at the surface. A wave arriving at a PEC therefore cannot have any tangential $\mathbf E$ there; it is reflected completely, with $\Gamma = -1$ ([Topic 11](#/l/w4-gamma)).
        - **The current becomes a surface current.** A real metal carries its current in a layer about $\delta$ thick. As $\delta \to 0$ that layer becomes a sheet: a surface current $\mathbf J_s$ on the PEC's face.
        - **τ has no meaning**: there is no wave inside to have an angle.

        !!intuition Does this make sense?
          Copper at 1 GHz has $|\eta| = \sqrt{\omega\mu_0/\sigma} \approx 0.012\ \Omega$, about 30,000 times smaller than $\eta_0$. To a wave arriving from air, copper looks like a PEC to better than 0.01%. That is why exams treat metal walls and plates as PECs.
      `),
      Q(md`**Predict.** At a fixed frequency, $\sigma$ grows without bound. Which of these does **not** go to zero?`,
        [md`$\alpha$`, md`$\delta$`, md`$|\eta|$`, md`$\lambda$`], 0,
        [null, md`$\delta = 1/\sqrt{\pi f\mu\sigma}$ has $\sigma$ in the denominator: it goes to zero.`, md`$|\eta| = \sqrt{\omega\mu/\sigma}$ goes to zero: a PEC has no tangential $E$.`, md`$\lambda = 2\pi\delta$ goes to zero with $\delta$.`],
        md`$\alpha = \sqrt{\pi f\mu\sigma}$ grows without bound: the field dies instantly at the surface. Everything that is a length or an impedance goes to zero.`),
      R(md`
        ### 9. Signals: dispersion and group velocity

        So far every wave had one frequency. A real signal, a message $m(t)$ riding on a carrier $\cos\omega t$, contains a band of frequencies near $\omega$ (Lecture 24).

        In a perfect dielectric, $v_p = 1/\sqrt{\mu\epsilon}$ is the same for every frequency. Every part of the signal travels at the same speed, and the shape arrives intact: $E = m(t - z/v)\cos(\omega t - \beta z)$. A medium where $v_p$ depends on $\omega$ is called **dispersive**. A good conductor is one:
        $$v_p = \omega\delta = \sqrt{\frac{2\omega}{\mu\sigma}}$$
        which grows as $\sqrt\omega$. Higher frequencies outrun lower ones, and a signal spreads out as it goes.

        **Group velocity, briefly.** In a dispersive medium the envelope $m$ travels at the **group velocity**
        $$v_g = \frac{d\omega}{d\beta}$$
        (Lecture 24 mentions it in a footnote; ECE 450 develops it.) For a good conductor, solve $\beta = \sqrt{\omega\mu\sigma/2}$ for $\omega$:
        $$\omega = \frac{2\beta^2}{\mu\sigma}$$
        Differentiate with respect to $\beta$:
        $$v_g = \frac{d\omega}{d\beta} = \frac{4\beta}{\mu\sigma}$$
        The phase velocity from the same line is $v_p = \omega/\beta = 2\beta/\mu\sigma$. Compare:
        $$\boxed{v_g = 2v_p}$$
        in a good conductor. In an imperfect dielectric, $\beta \approx \omega\sqrt{\mu\epsilon}$ is proportional to $\omega$, so $v_g \approx v_p$.

        !!intuition Does this make sense?
          Draw $\omega$ against $\beta$. $v_p = \omega/\beta$ is the slope of the line from the origin to a point on the curve; $v_g$ is the slope of the curve itself. For a straight line through the origin (no dispersion) they are equal. For $\omega \propto \beta^2$, the curve is twice as steep as the line from the origin: $v_g = 2v_p$.
      `),
      Q(md`**Predict.** In seawater at 4 kHz, $\delta = 12.5/\pi \approx 4$ m. What are $v_p$ and $v_g$?`,
        [md`$v_p = 10^5$ m/s and $v_g = 2\times10^5$ m/s`, md`$v_p = v_g = 10^5$ m/s`, md`$v_p = 10^5$ m/s and $v_g = 5\times10^4$ m/s`, md`$v_p = 1.6\times10^4$ m/s and $v_g = 3.2\times10^4$ m/s`], 0,
        [null, md`Equal speeds mean no dispersion, which is true only when $\beta \propto \omega$. In a good conductor $\beta \propto \sqrt\omega$.`, md`That halves instead of doubling. The curve $\omega = 2\beta^2/\mu\sigma$ is steeper than the line to the origin.`, md`That used $f\delta$ for $v_p$. $v_p = \omega\delta = 2\pi f\delta$.`],
        md`$v_p = \omega\delta = (2\pi)(4000)(12.5/\pi) = 10^5$ m/s, and $v_g = 2v_p = 2\times10^5$ m/s.`),
      R(md`
        ### The method

        !!method Which limit, then which line of the sheet
          1. **The loss tangent.** $\sigma/\omega\epsilon = 18\times10^9\sigma/(\epsilon_r f)$. Use $\omega$ (or this form) and the material's own $\epsilon$.
          2. **Below 0.1: imperfect dielectric.** $\beta = \omega\sqrt{\mu\epsilon}$, $\alpha = \sigma\eta_i/2$, $\eta \approx \eta_i(1 + j\sigma/2\omega\epsilon)$, $\tau \approx \sigma/2\omega\epsilon$ in radians.
          3. **Above 10: good conductor.** $\delta = 1/\sqrt{\pi f\mu\sigma}$, which is $1/(2\pi\sqrt{10^{-7}f\sigma})$ for $\mu_0$. Then $\gamma = (1 + j)/\delta$, $\eta = (1 + j)/\sigma\delta$, $\tau = 45°$, $\lambda = 2\pi\delta$, $v_p = \omega\delta$.
          4. **In between:** the polar method of [Topic 5](#/l/w2-gamma).
          5. **Fields.** Amplitude $E_0e^{-\alpha z}$; $\hat h = \hat k\times\hat e$; $H$ has amplitude $E_0/|\eta|$ and lags by $\tau$ ([Topic 6](#/l/w2-read)).
          6. **Depths.** A fraction $p$ of the amplitude is left at $z = \delta\ln(1/p)$. For power, half of that.

        ### Worked example 1: Spring 2024 #2, then one step further

        !!graded Problem
          A TEM wave polarized along $\hat z$ is launched by a current sheet at $x = 0$ and travels toward $+\hat x$ through a good conductor. Its penetration depth is $\delta = 1$ mm, and $\mathbf E(0, 0) = 10\hat z$ V/m. (a) Find $\gamma$. (b) Find the amplitude of $\mathbf E$ at $x = 2$ mm. Then go further than the exam did: if $\sigma = 2\times10^4$ S/m and $\mu = \mu_0$, find $\eta$, $\mathbf H(x, t)$ and the frequency.

        **Step 1: γ.** In a good conductor $\alpha = \beta = 1/\delta = 1/(10^{-3}\ \text{m})$:
        $$\gamma = 1000(1 + j)\ \text{1/m}$$
        **Step 2: the amplitude at 2 mm.** $x = 2$ mm is $2\delta$, so $\alpha x = 2$:
        $$E_0e^{-\alpha x} = 10e^{-2} \approx 1.35\ \text{V/m}$$
        The exam asked only for the expression $10e^{-2}$ V/m.

        **Step 3: η.** First $\sigma\delta = (2\times10^4)(10^{-3}) = 20$ S. Then
        $$\eta = \frac{1 + j}{20} = 0.05 + j0.05\ \Omega$$
        so $|\eta| = 0.05\sqrt2 \approx 0.0707\ \Omega$ and $\tau = 45°$.

        **Step 4: the direction of H.** $\hat k = \hat x$ and $\hat e = \hat z$:
        $$\hat h = \hat x\times\hat z = -\hat y$$
        **Step 5: H.** The amplitude is $10/0.0707 \approx 141$ A/m, and the phase is $0° - 45°$. Write $\theta = \omega t - 1000x$ for the phase of $\mathbf E$. Then
        $$\mathbf H = -\hat y\,141\,e^{-1000x}\cos(\theta - 45°)$$
        in A/m. Check: $\hat z\times(-\hat y) = +\hat x$, the direction of travel ✓.

        **Step 6: the frequency.** Solve $\delta = 1/\sqrt{\pi f\mu\sigma}$ for $f$:
        $$f = \frac{1}{\pi\mu_0\sigma\delta^2}$$
        The bottom is $\pi(4\pi\times10^{-7})(2\times10^4)(10^{-6}) = 8\pi^2\times10^{-9}$, so
        $$f = \frac{10^9}{8\pi^2} \approx 12.7\ \text{MHz}$$
        using $\pi^2 \approx 9.87$. **Check the regime:** $\sigma/\omega\epsilon_0 = (18\times10^9)(2\times10^4)/(1.27\times10^7) \approx 2.8\times10^7 \gg 10$ ✓.

        **Speed path.** $\gamma = (1 + j)/\delta$ and $\eta = (1 + j)/\sigma\delta$, each in one line. Do $\hat h = \hat k\times\hat e$ before any number.

        **Where points go.** Writing $\gamma = 1000$ with no imaginary part. Using $e^{-2\alpha x}$ (that is power) for the amplitude. Dividing by $\eta_0$ for $H$. Writing $+\hat y$.

        ### Worked example 2: an imperfect dielectric, start to finish

        !!graded Problem
          A material has $\mu = \mu_0$, $\epsilon_r = 4$ and $\sigma = 2\times10^{-3}$ S/m. A 1.5 GHz wave travels toward $+z$ with $E_x(0, t) = 10\cos\omega t$ V/m. Decide the regime, then find $\alpha$, $\delta$, $\beta$, $\eta$ and $H_y$. How much of the amplitude is left after 10 m?

        **Step 1: the regime.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{(18\times10^9)(2\times10^{-3})}{(4)(1.5\times10^9)} = 0.006$$
        Far below 0.1: an imperfect dielectric.

        **Step 2: the lossless numbers.** $v = c/\sqrt{\epsilon_r} = 1.5\times10^8$ m/s, so
        $$k = \frac{\omega}{v} = \frac{2\pi(1.5\times10^9)}{1.5\times10^8} = 20\pi\ \text{rad/m}$$
        and $\eta_i = 120\pi/2 = 60\pi\ \Omega$.

        **Step 3: α and δ.**
        $$\alpha = \frac{\sigma\eta_i}{2} = \frac{(2\times10^{-3})(60\pi)}{2} = 0.06\pi$$
        That is $0.188$ Np/m, so $\delta = 1/0.188 \approx 5.3$ m.

        **Step 4: β.** $\beta \approx k = 20\pi \approx 62.8$ rad/m, so $\lambda = 2\pi/20\pi = 0.1$ m. One skin depth holds $5.3/0.1 = 53$ wavelengths.

        **Step 5: η.** The loss tangent over 2 is $0.003$:
        $$\eta \approx 60\pi(1 + j0.003)\ \Omega$$
        So $|\eta| \approx 60\pi \approx 188\ \Omega$ and $\tau \approx 0.003$ rad, which is $0.003\times57.3° \approx 0.17°$.

        **Step 6: the fields.** $E_x = 10e^{-0.188z}\cos(\omega t - 20\pi z)$ V/m. For $H$: $\hat h = \hat z\times\hat x = +\hat y$, amplitude $10/60\pi = 1/6\pi \approx 0.0531$ A/m, and a lag of $0.17°$:
        $$H_y = 0.0531\,e^{-0.188z}\cos(\theta - 0.17°)$$
        in A/m, with $\theta = \omega t - 20\pi z$.

        **Step 7: after 10 m.** $\alpha z = 0.6\pi \approx 1.88$, and $e^{-1.88} \approx 0.15$: 15% of the amplitude is left.

        **Check against the exact formulas.** Topic 5's exact $\alpha$ for this material is $0.18849$ Np/m; the approximation gives $0.18850$. They agree to five figures.

        **Speed path.** $\alpha = \sigma\eta_i/2$ is one multiplication. $\beta$ and $|\eta|$ are the lossless values.

        **Where points go.** Using $\eta_0$ in place of $\eta_i$. Writing $\tau = 0.003°$ (it is radians). Computing the regime with $f$ in place of $\omega$.

        ### Worked example 3: the submarine (the skill HW 9 #4 asks for)

        !!graded Problem
          Seawater has $\sigma = 4$ S/m, $\epsilon_r = 81$, $\mu = \mu_0$. A ship transmits at 25 kHz. (a) Check the regime. (b) Find $\delta$, $\gamma$ and $\eta$. (c) How deep can a submarine be and still receive 1% of the surface amplitude? (d) Find $\lambda$ and $v_p$. (e) Repeat (b) and (c) at 250 Hz.

        **(a) The regime.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{(18\times10^9)(4)}{(81)(2.5\times10^4)} \approx 3.6\times10^4$$
        A good conductor, by a wide margin.

        **(b) δ, γ, η.** $10^{-7}f\sigma = 10^{-7}(2.5\times10^4)(4) = 0.01$, whose root is $0.1$:
        $$\delta = \frac{1}{2\pi(0.1)} = \frac{5}{\pi} \approx 1.59\ \text{m}$$
        Then $\gamma = (1 + j)/\delta = (\pi/5)(1 + j) \approx 0.628(1 + j)$ 1/m. And $\sigma\delta = 20/\pi$ S, so
        $$\eta = \frac{(1 + j)\pi}{20} \approx 0.157(1 + j)\ \Omega$$
        **(c) The depth.** 1% of the amplitude is left at
        $$z = \delta\ln100 = 4.6\times\frac{5}{\pi} \approx 7.3\ \text{m}$$
        **(d) λ and v_p.**
        $$\lambda = 2\pi\delta = 10\ \text{m}$$
        $$v_p = \omega\delta = 2\pi(2.5\times10^4)\frac{5}{\pi} = 2.5\times10^5\ \text{m/s}$$
        In air, the same wave would have $\lambda = c/f = 12$ km.

        **(e) At 250 Hz.** The frequency is 100 times lower, so $\delta$ is $\sqrt{100} = 10$ times larger: $\delta = 50/\pi \approx 15.9$ m. Then $\gamma = (\pi/50)(1 + j)$ 1/m, $\eta = (1 + j)\pi/200 \approx 0.0157(1 + j)\ \Omega$ (it scales as $\sqrt f$), and the 1% depth is $4.6\times15.9 \approx 73$ m. The loss tangent, $3.6\times10^6$, is larger still.

        **Speed path.** Make $10^{-7}f\sigma$ a perfect square and take its root. Every other answer follows from $\delta$. A factor of 100 in frequency is a factor of 10 in depth.

        **Where points go.** Using the power fraction for a question about amplitude. Taking $\ln 100 = 2$ (that is $\log_{10}$). Using $f$ for $\omega$ in $v_p = \omega\delta$.

        ### The whole topic on one table

        | Quantity | Imperfect dielectric | Good conductor |
        |---|---|---|
        | Test | $\sigma/\omega\epsilon < 0.1$ | $\sigma/\omega\epsilon > 10$ |
        | $\alpha$ | $\sigma\eta_i/2$ | $\sqrt{\pi f\mu\sigma} = 1/\delta$ |
        | $\beta$ | $\omega\sqrt{\mu\epsilon}$ | $1/\delta$, equal to $\alpha$ |
        | $\eta$ | $\eta_i(1 + j\sigma/2\omega\epsilon)$ | $(1 + j)/\sigma\delta$ |
        | $\tau$ | $\sigma/2\omega\epsilon$, in radians | $45°$ |
        | $\lambda$ | $2\pi/\omega\sqrt{\mu\epsilon}$ | $2\pi\delta$ |
        | $v_p$ | $1/\sqrt{\mu\epsilon}$ | $\omega\delta$ |
        | How $\alpha$ depends on $f$ | not at all | as $\sqrt f$ |

        In the PEC limit, $\delta = 0$ and $\eta = 0$.

        !!mistake Common mistakes
          - **Using $f$ where $\omega$ belongs** in $\sigma/\omega\epsilon$ (a factor of $2\pi$). And the reverse: $\sqrt{\pi f\mu\sigma}$ already has the $2\pi$ folded in, so it takes $f$, not $\omega$.
          - **Using $\epsilon_0$** for the material's $\epsilon$ in the loss tangent.
          - **Deciding the regime from $\sigma$ alone.** Seawater is a dielectric at 18 GHz.
          - **Using $\eta_0$** in $\alpha = \sigma\eta_i/2$.
          - **$\gamma = 1/\delta$**, real, or $\gamma = \delta(1 + j)$. It is $(1 + j)/\delta$.
          - **$\eta = 1/\sigma\delta$**, real. It has a $45°$ angle.
          - **Using the good-conductor lines at $\sigma/\omega\epsilon \approx 1$.** They are 55% off there.
          - **Mixing amplitude and power.** Power falls as $e^{-2z/\delta}$, twice as fast.
          - **$\delta \propto 1/f$.** It is $1/\sqrt f$.
          - **Reading $\tau \approx \sigma/2\omega\epsilon$ in degrees.** It is in radians.

        !!key Speed tricks
          - $\sigma/\omega\epsilon = 18\times10^9\sigma/(\epsilon_r f)$, and the crossover is $f_c = 18\times10^9\sigma/\epsilon_r$. Seawater: 0.89 GHz.
          - With $\mu_0$: $\delta = 1/(2\pi\sqrt{10^{-7}f\sigma})$. Look for the perfect square.
          - Copper: $\delta \approx 66\ \mu$m at 1 MHz. Seawater: $\delta \approx 8$ m at 1 kHz. Both go as $1/\sqrt f$.
          - Good conductor, from $\delta$ alone: $\gamma = (1 + j)/\delta$, $\lambda = 2\pi\delta$, $v_p = \omega\delta$, $v_g = 2\omega\delta$. Add $\sigma$: $\eta = (1 + j)/\sigma\delta$.
          - Imperfect dielectric: $\alpha = \sigma\eta_i/2$, the same at every frequency; $\beta$ and $|\eta|$ as if lossless.
          - Depth for a fraction $p$ of the amplitude: $\delta\ln(1/p)$. $\ln10 = 2.3$, $\ln100 = 4.6$. And $e^{-2\pi} \approx 0.002$.

        ### Statements to judge
      `),
      P({ src: 'In the style of Spring 2024 #2(e)', title: 'True or false: raise the frequency',
        q: md`A current sheet with a fixed current amplitude launches a wave into a good conductor. The frequency is multiplied by 4, and the material is still a good conductor at the new frequency. Judge each statement.`,
        parts: [
          { lbl: md`(i) The penetration depth halves.`, mc: ['True', 'False'], a: 0, fixed: true, why: [null, md`$\delta = 1/\sqrt{\pi f\mu\sigma}$, and $\sqrt4 = 2$: it does halve.`] },
          { lbl: md`(ii) The amplitude of $\mathbf H$ at the sheet stays the same.`, mc: ['True', 'False'], a: 0, fixed: true, why: [null, md`The jump condition at the sheet gives $H = J_s/2$ on each side, with no material constant and no frequency in it.`] },
          { lbl: md`(iii) The amplitude of $\mathbf E$ at the sheet stays the same.`, mc: ['True', 'False'], a: 1, fixed: true, why: [md`$E = |\eta|H$ at the sheet, and $|\eta| = \sqrt{\omega\mu/\sigma}$ doubles when $f$ is multiplied by 4.`, null] },
          { lbl: md`(iv) The wavelength inside the conductor stays the same.`, mc: ['True', 'False'], a: 1, fixed: true, why: [md`$\lambda = 2\pi\delta$, and $\delta$ halves, so $\lambda$ halves.`, null] },
          { lbl: md`(v) The phase velocity doubles.`, mc: ['True', 'False'], a: 0, fixed: true, why: [null, md`$v_p = \omega\delta$: $\omega$ goes up 4 times and $\delta$ halves, so $v_p$ doubles.`] },
          { lbl: md`(vi) The angle $\tau$ between $E$ and $H$ is exactly $45°$ at both frequencies.`, mc: ['True', 'False'], a: 1, fixed: true, why: [md`$45°$ is the good-conductor approximation. Exactly, $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$ is a little below $45°$, and it moves a little further below when $\omega$ rises.`, null] },
          { lbl: md`(vii) The loss tangent falls by a factor of 4.`, mc: ['True', 'False'], a: 0, fixed: true, why: [null, md`$\sigma/\omega\epsilon$ has $\omega$ in the denominator, to the first power.`] },
        ],
        sol: md`
          (i) **True.** $\delta \propto 1/\sqrt f$.

          (ii) **True.** $H = J_s/2$ at the sheet, whatever the material and the frequency.

          (iii) **False.** $|\eta| \propto \sqrt f$ doubles, and $E = |\eta|H$.

          (iv) **False.** $\lambda = 2\pi\delta$ halves.

          (v) **True.** $v_p = \omega\delta \propto \sqrt f$.

          (vi) **False.** $\tau$ is exactly $45°$ only in the limit $\sigma/\omega\epsilon \to \infty$. The Spring 2024 key also counts "the phase shift between $\mathbf E$ and $\mathbf H$" as changing with frequency, for this reason. In the approximation it stays near $45°$.

          (vii) **True.** $\sigma/\omega\epsilon \propto 1/f$.
        ` }),
      R(md`
        ### Check questions
      `),
      Q(md`Wet soil has $\sigma = 10^{-2}$ S/m and $\epsilon_r = 10$. At 10 MHz, which formulas apply?`,
        [md`Neither limit: use the exact formulas ($\sigma/\omega\epsilon = 1.8$)`, md`Good conductor: $\sigma/\omega\epsilon = 18$`, md`Imperfect dielectric: $\sigma = 0.01$ S/m is small`, md`Good conductor: $\sigma/\omega\epsilon \approx 11$`], 0,
        [null, md`That left out $\epsilon_r = 10$: it used $\epsilon_0$ for the soil.`, md`That judges by $\sigma$ alone. What counts is $\sigma$ against $\omega\epsilon$.`, md`That used $f$ for $\omega$, which makes the ratio $2\pi$ times too big.`],
        md`$\sigma/\omega\epsilon = (18\times10^9)(10^{-2})/(10\times10^7) = 1.8$. Between 0.1 and 10: neither approximation is reliable.`),
      Q(md`In a good conductor, the ratio $\lambda/\delta$ is…`,
        [md`$2\pi$`, md`$1$`, md`$\pi$`, md`$1/2\pi$`], 0,
        [null, md`That would need $\beta = 2\pi\alpha$. In a good conductor $\beta = \alpha$.`, md`$\pi\delta$ is half a wavelength, where the field has turned around.`, md`That is $\delta/\lambda$, upside down.`],
        md`$\lambda = 2\pi/\beta$ and $\beta = \alpha = 1/\delta$, so $\lambda = 2\pi\delta$.`),
      Q(md`In an imperfect dielectric, the frequency is doubled. What happens to $\alpha$?`,
        ['It stays about the same', 'It doubles', 'It grows by $\\sqrt2$', 'It halves'], 0,
        [null, md`That is what $\beta$ does. $\alpha = \sigma\eta_i/2$ has no $\omega$ in it.`, md`That is how $\alpha$ scales in a good conductor, $\sqrt{\pi f\mu\sigma}$.`, md`Nothing in $\sigma\eta_i/2$ falls with frequency.`],
        md`$\alpha \approx \sigma\eta_i/2$, which depends only on the material. The loss tangent halves, but the material stays low-loss, and $\alpha$ stays put.`),
      Q(md`In a good conductor at a fixed frequency, $\sigma$ is doubled. What happens to $|\eta|$?`,
        [md`It is divided by $\sqrt2$`, md`It halves`, md`It grows by $\sqrt2$`, md`It stays the same`], 0,
        [null, md`$|\eta| = \sqrt{\omega\mu/\sigma}$: $\sigma$ is under a square root.`, md`More conductivity means a smaller $E/H$ ratio, not a larger one.`, md`$\sigma$ is in the formula, so $|\eta|$ must change.`],
        md`$|\eta| = \sqrt{\omega\mu/\sigma} \propto 1/\sqrt\sigma$. Doubling $\sigma$ divides it by $\sqrt2$.`),
      Q(md`A good conductor has $\eta = 0.02 + j0.02\ \Omega$ and $\delta = 0.5$ mm. What is $\sigma$?`,
        [md`$10^5$ S/m`, md`$7.07\times10^4$ S/m`, md`$5\times10^4$ S/m`, md`$10^{-5}$ S/m`], 0,
        [null, md`That divides by $|\eta|\delta = 0.0283\times0.0005$. The real part of $\eta$ alone is $1/\sigma\delta$.`, md`That adds the two parts. The real part alone is $1/\sigma\delta$.`, md`That is $\Re\{\eta\}\cdot\delta$, upside down. A good conductor has a huge $\sigma$.`],
        md`$\Re\{\eta\} = 1/\sigma\delta$, so $\sigma = 1/(0.02\times5\times10^{-4}) = 10^5$ S/m.`),
      Q(md`In a good conductor, at what depth is the field exactly out of phase ($180°$) with the field at the surface, and how much amplitude is left there?`,
        [md`$\pi\delta$, with about 4% left`, md`$2\pi\delta$, with about 0.2% left`, md`$\delta$, with about 37% left`, md`$\pi\delta$, with about 37% left`], 0,
        [null, md`$2\pi\delta$ is a whole wavelength: back in phase, not opposite.`, md`At $\delta$ the phase has turned by $\beta\delta = 1$ rad, about $57°$.`, md`The phase is right, but at $\pi\delta$ the amplitude is $e^{-\pi}$, not $e^{-1}$.`],
        md`The phase turns by $\beta z = z/\delta$. It reaches $\pi$ at $z = \pi\delta$, where the amplitude is $e^{-\pi} \approx 0.043$.`),
      Q(md`Which statement about a perfect electric conductor is right?`,
        [md`The fields inside are zero, and $\mathbf E$ along its surface is zero`, md`$|\eta|$ is infinite, so $\mathbf H$ at its surface is zero`, md`Its skin depth is infinite`, md`A wave enters it and travels at $c$`], 0,
        [null, md`Upside down: $|\eta| = \sqrt{\omega\mu/\sigma} \to 0$. A PEC carries a surface current and a large tangential $\mathbf H$.`, md`$\delta = 1/\sqrt{\pi f\mu\sigma} \to 0$.`, md`No wave enters: $\delta = 0$.`],
        md`$\delta \to 0$ and $\eta \to 0$: nothing gets in, and the tangential $\mathbf E$ at the surface vanishes.`),
      Q(md`An imperfect dielectric has $\sigma/\omega\epsilon = 0.02$. What is $\tau$?`,
        [md`$0.01$ rad, about $0.57°$`, md`$0.01°$`, md`$0.02$ rad, about $1.15°$`, md`$45°$`], 0,
        [null, md`$\tau \approx \sigma/2\omega\epsilon$ comes out in radians. $0.01$ rad is $0.57°$.`, md`That forgot the $\tfrac12$ from $\eta \approx \eta_i(1 + j\sigma/2\omega\epsilon)$.`, md`$45°$ is the good-conductor angle.`],
        md`$\tau \approx \sigma/2\omega\epsilon = 0.01$ rad $= 0.01\times57.3° \approx 0.57°$.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** $\sigma/\omega\epsilon = 18\times10^9\sigma/(\epsilon_r f)$, then pick the regime. Aim for 10 seconds a card. Eight right completes a card.
      `),
      Object.assign(G('rf_w2r_regime', { need: 8 }), { id: 'w2-limits.r0' }),
      R(md`
        ### Practice, level 1: skin depth

        **The trick:** $\delta = 1/(2\pi\sqrt{10^{-7}f\sigma})$ for $\mu_0$; $\delta \propto 1/\sqrt f$ and $1/\sqrt\sigma$; amplitude $e^{-z/\delta}$.
      `),
      Object.assign(G('rf_w2r_skin', { need: 8 }), { id: 'w2-limits.r1' }),
      R(md`
        ### Practice, level 1: the good conductor's η and H

        **The trick:** $\eta = (1 + j)/\sigma\delta$, $|\eta| = \sqrt{\omega\mu/\sigma}$, $H$ lags by $45°$, $v_g = 2v_p$.
      `),
      Object.assign(G('rf_w2r_gc', { need: 8 }), { id: 'w2-limits.r2' }),
      R(md`
        ### Practice, level 1: the imperfect dielectric

        **The trick:** $\alpha = \sigma\eta_i/2$, with no $f$ in it; $\beta$ and $|\eta|$ as if lossless; $\tau \approx \sigma/2\omega\epsilon$ in radians.
      `),
      Object.assign(G('rf_w2r_id', { need: 8 }), { id: 'w2-limits.r3' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct without opening the solution complete each one.
      `),
      G('w2r_gcond', { need: 2 }),
      G('w2r_idiel', { need: 2 }),
      G('w2r_depth', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A good conductor fed by a current sheet, in the style of Spring 2024 #2, and one material checked at three frequencies.
      `),
      G('w2r_sheet', { need: 2 }),
      G('w2r_three', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- Topic 7 helpers
  const LN100 = Math.log(100);
  // a length in TeX with a sensible unit
  const lenX = (x) => {
    const a = Math.abs(x);
    if (a >= 0.1 || a < 1e-7) return `${f(x)}\\ \\text{m}`;
    if (a >= 1e-4) return `${f(x * 1e3)}\\ \\text{mm}`;
    return `${f(x * 1e6)}\\ \\mu\\text{m}`;
  };
  const lenO = (x) => `$${lenX(x)}$`;
  // a numeric part for a length, asked in the unit that suits it
  const lenN = (lbl, x, traps = []) => {
    const [sc, un] = x >= 0.1 ? [1, 'm'] : x >= 1e-4 ? [1e3, 'mm'] : [1e6, 'µm'];
    const t = traps.filter((q) => Math.abs(q.v / x - 1) > 0.03).map((q) => ({ v: q.v * sc, msg: q.msg }));
    const part = N(`${lbl}\\ (\\text{in ${un === 'µm' ? '}\\mu\\text{m' : un}})`, x * sc, un);
    return t.length ? Object.assign(part, { traps: t }) : part;
  };
  // a frequency in TeX: 2.5e4 -> 25 kHz
  const frX = (v) => {
    const [s, u] = [[1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz'], [1, 'Hz']].find(([q]) => v >= q * 0.9999) || [1, 'Hz'];
    return `${p(+(v / s).toPrecision(4))}\\ \\text{${u}}`;
  };
  const ltOf = (sig, er, fr) => 18e9 * sig / (er * fr);
  const REG = { id: 'Imperfect dielectric', gc: 'Good conductor', mid: 'In between: use the exact formulas' };
  const regOf = (x) => (x <= 0.1 ? 'id' : x >= 10 ? 'gc' : 'mid');
  // clean skin depths with mu0: root r = sqrt(1e-7 f sigma), so delta = 1/(2 pi r) and f = r^2 10^7 / sigma (all good conductors)
  const SK = [
    { nm: 'Seawater', sig: 4, er: 81, rs: [0.01, 0.02, 0.04, 0.1, 0.2] },
    { nm: 'Wet soil', sig: 1e-2, er: 10, rs: [0.001, 0.002, 0.004, 0.01] },
    { nm: 'A conductor', sig: 1e4, er: 1, rs: [1, 2, 10, 20, 100] },
    { nm: 'A metal alloy', sig: 1e6, er: 1, rs: [1, 10, 20, 100, 1000] },
    { nm: 'A metal', sig: 4e7, er: 1, rs: [20, 200, 2000, 20000] },
  ];
  const skCase = (list = SK) => {
    const m = pick(list), r = pick(m.rs), fr = r * r * 1e7 / m.sig;
    return Object.assign({}, m, { r, fr, d: 1 / (2 * Math.PI * r), lt: ltOf(m.sig, m.er, fr) });
  };
  const pc = (x) => `$${p(+(100 * x).toPrecision(3))}\\%$`;
  const mult = (x) => `$${p(+x.toPrecision(3))}\\delta$`;

  // ---------------------------------------------------------------- level 1, the regime
  const SIGS = [1e-4, 1e-3, 1e-2, 0.1, 1, 4, 10], ERS = [1, 2, 4, 9, 36, 81], FRS = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10];
  const randMat = (ok) => {
    for (let i = 0; i < 500; i++) {
      const sig = pick(SIGS), er = pick(ERS), fr = pick(FRS), lt = ltOf(sig, er, fr);
      if (ok(lt)) return { sig, er, fr, lt };
    }
    return { sig: 4, er: 81, fr: 1e3, lt: ltOf(4, 81, 1e3) };
  };
  const matT = (m) => md`$\sigma = ${p(m.sig)}$ S/m, $\epsilon_r = ${m.er}$, $\mu = \mu_0$, at $f = ${frX(m.fr)}$`;
  GENS.rf_w2r_regime = () => one([
    () => {
      const m = randMat((x) => x >= 1e-4 && x <= 1e7 && (x < 0.5 || x > 2));
      return MC('The loss tangent', md`A material: ${matT(m)}. Its loss tangent $\sigma/\omega\epsilon$ is…`, o3(m.lt),
        [[o3(m.lt * 2 * Math.PI), md`That used $f$ where $\omega = 2\pi f$ belongs.`], [o3(m.lt * m.er), md`That used $\epsilon_0$ for the material's $\epsilon = ${m.er}\epsilon_0$.`],
          [o3(1 / m.lt), md`That is upside down: $\omega\epsilon/\sigma$.`], [o3(m.lt / (2 * Math.PI)), md`That divided by $2\pi$ instead of multiplying $f$ by it.`]],
        md`$\sigma/\omega\epsilon = 18\times10^9\sigma/(\epsilon_r f) = (18\times10^9)(${p(m.sig)})/((${m.er})(${p(m.fr)})) = ${f(m.lt)}$.`);
    },
    () => {
      const m = randMat((x) => x <= 0.03 || x >= 30 || (x >= 0.3 && x <= 3)), rg = regOf(m.lt), L = f(m.lt);
      const why = {
        id: rg === 'gc' ? md`$\sigma/\omega\epsilon = ${L}$, far above 1: the conduction current wins.` : md`$\sigma/\omega\epsilon = ${L}$ is too close to 1: the dielectric line would be off by 10% or more.`,
        gc: rg === 'id' ? md`$\sigma/\omega\epsilon = ${L}$, far below 1: the displacement current wins, whatever $\sigma$ looks like.` : md`$\sigma/\omega\epsilon = ${L}$ is too close to 1: the conductor line would be off by 50% or more.`,
        mid: md`"In between" means a loss tangent between 0.1 and 10. Here it is ${L}.`,
      };
      const wr = Object.keys(REG).filter((k) => k !== rg).map((k) => [REG[k], why[k]]);
      wr.push(['Perfect conductor: the fields cannot enter', md`A PEC needs $\sigma = \infty$. This $\sigma$ is finite, and so is the skin depth.`]);
      wr.push(['Perfect dielectric: ignore σ', md`That needs $\sigma = 0$ exactly. Here the loss tangent is ${L}.`]);
      return MC('Which regime?', md`A material: ${matT(m)}. Which formulas apply?`, REG[rg], wr,
        md`$\sigma/\omega\epsilon = (18\times10^9)(${p(m.sig)})/((${m.er})(${p(m.fr)})) = ${L}$. ${rg === 'id' ? 'Below 0.1: an imperfect dielectric.' : rg === 'gc' ? 'Above 10: a good conductor.' : 'Between 0.1 and 10: use the exact polar method of Topic 5.'}`);
    },
    () => {
      const sig = pick([1e-3, 1e-2, 0.1, 1, 4]), er = pick([1, 2, 4, 9, 10, 36, 81]), fc = 18e9 * sig / er;
      return MC('Crossover frequency', md`A material has $\sigma = ${p(sig)}$ S/m and $\epsilon_r = ${er}$. At what frequency is $\sigma/\omega\epsilon = 1$?`, `$${frX(fc)}$`,
        [[`$${frX(fc * 2 * Math.PI)}$`, md`That is $\omega_c = \sigma/\epsilon$, in rad/s. Divide by $2\pi$ for hertz.`], [`$${frX(fc * er)}$`, md`That used $\epsilon_0$ for the material's $\epsilon$.`],
          [`$${frX(fc / (2 * Math.PI))}$`, md`That divided by $2\pi$ twice.`], [`$${frX(fc / 10)}$`, md`At $f_c/10$ the ratio is 10, the edge of the good-conductor range. The crossover is where it equals 1.`]],
        md`$f_c = \sigma/(2\pi\epsilon) = 18\times10^9\sigma/\epsilon_r = (18\times10^9)(${p(sig)})/${er} = ${frX(fc)}$.`);
    },
    () => {
      if (pick([true, false])) {
        const r0 = pick([100, 1000, 1e4]), f0 = pick([1e3, 1e4, 1e6]), ans = f0 * r0 / 10;
        return MC('Edge of the good-conductor range', md`At $${frX(f0)}$ a material has $\sigma/\omega\epsilon = ${p(r0)}$. Up to what frequency may you still use the good-conductor lines ($\sigma/\omega\epsilon \ge 10$)?`, `$${frX(ans)}$`,
          [[`$${frX(f0 * r0)}$`, md`There the ratio is 1, where the conductor line is 55% off.`], [`$${frX(f0 * r0 / 100)}$`, md`That stops at a ratio of 100. The rule allows down to 10.`],
            [`$${frX(f0 * Math.sqrt(r0 / 10))}$`, md`The ratio goes as $1/f$, not $1/\sqrt f$.`], [`$${frX(f0 * 10 / r0)}$`, md`That moves the wrong way. Raising $f$ lowers the ratio.`]],
          md`$\sigma/\omega\epsilon \propto 1/f$. It falls from ${p(r0)} to 10 when $f$ rises by a factor of ${p(r0 / 10)}: up to $${frX(ans)}$.`);
      }
      const r0 = pick([1e-3, 1e-2]), f0 = pick([1e8, 1e9, 1e10]), ans = f0 * r0 / 0.1;
      return MC('Edge of the low-loss range', md`At $${frX(f0)}$ a material has $\sigma/\omega\epsilon = ${p(r0)}$. Down to what frequency is it still an imperfect dielectric ($\sigma/\omega\epsilon \le 0.1$)?`, `$${frX(ans)}$`,
        [[`$${frX(f0 * r0)}$`, md`There the ratio is 1: no longer low-loss.`], [`$${frX(f0 * r0 / 0.01)}$`, md`That stops at a ratio of 0.01. The rule allows up to 0.1.`],
          [`$${frX(f0 * Math.sqrt(r0 / 0.1))}$`, md`The ratio goes as $1/f$, not $1/\sqrt f$.`], [`$${frX(f0 * 0.1 / r0)}$`, md`That moves the wrong way. Lowering $f$ raises the ratio.`]],
        md`$\sigma/\omega\epsilon \propto 1/f$. It rises from $${p(r0)}$ to 0.1 when $f$ falls by a factor of ${p(0.1 / r0)}: down to $${frX(ans)}$.`);
    },
    () => {
      const [q, r, w, s] = pick([
        [md`In a **good conductor**, $\alpha$ is approximately…`, md`$\sqrt{\omega\mu\sigma/2}$`, [[md`$\frac{\sigma}{2}\sqrt{\mu/\epsilon}$`, md`That is the imperfect-dielectric line.`], [md`$\omega\sqrt{\mu\epsilon}$`, md`That is $\beta$ with no loss at all.`], [md`$\sqrt{\omega\mu/\sigma}$`, md`That is $|\eta|$. Check the units: it is in $\Omega$, not 1/m.`], [md`$1/\sqrt{\pi f\mu\sigma}$`, md`That is $\delta = 1/\alpha$, a length.`]], md`$\gamma^2 \approx j\omega\mu\sigma$, so $\gamma = (1 + j)\sqrt{\omega\mu\sigma/2}$.`],
        [md`In an **imperfect dielectric**, $\alpha$ is approximately…`, md`$\frac{\sigma}{2}\sqrt{\mu/\epsilon}$`, [[md`$\sqrt{\omega\mu\sigma/2}$`, md`That is the good-conductor line.`], [md`$\omega\sqrt{\mu\epsilon}$`, md`That is $\beta$.`], [md`$\sigma\sqrt{\mu/\epsilon}$`, md`The binomial step brings a factor $\tfrac12$.`], [md`$\sigma/2\omega\epsilon$`, md`That is $\tau$, in radians.`]], md`$\sqrt{1 - j\sigma/\omega\epsilon} \approx 1 - j\sigma/2\omega\epsilon$, so $\alpha = k\sigma/2\omega\epsilon = \tfrac{\sigma}{2}\sqrt{\mu/\epsilon}$.`],
        [md`In a **good conductor**, $|\eta|$ is approximately…`, md`$\sqrt{\omega\mu/\sigma}$`, [[md`$\sqrt{\mu/\epsilon}$`, md`That is the lossless value. A good conductor's $|\eta|$ is far smaller.`], [md`$\sqrt{\omega\mu\sigma/2}$`, md`That is $\alpha$, in 1/m.`], [md`$\sqrt{\sigma/\omega\mu}$`, md`Upside down: its units are siemens.`], [md`$120\pi\ \Omega$`, md`That is free space.`]], md`$\eta = (1 + j)/\sigma\delta$, whose size is $\sqrt2/\sigma\delta = \sqrt{\omega\mu/\sigma}$.`],
        [md`In an **imperfect dielectric**, $\beta$ is approximately…`, md`$\omega\sqrt{\mu\epsilon}$`, [[md`$\sqrt{\omega\mu\sigma/2}$`, md`That is the good-conductor line.`], [md`$\frac{\sigma}{2}\sqrt{\mu/\epsilon}$`, md`That is $\alpha$.`], [md`$\omega/c$`, md`That is free space. The material's $\epsilon$ slows the wave.`], [md`$\omega\sqrt{\mu\epsilon}\,\sigma/2\omega\epsilon$`, md`That is $\alpha$ written with $k$.`]], md`The binomial step gives $\gamma \approx k\sigma/2\omega\epsilon + jk$: the imaginary part is the lossless $k$.`],
        [md`In a **good conductor**, $\tau$ is approximately…`, md`$45°$`, [[md`$0°$`, md`That is a lossless medium.`], [md`$\sigma/2\omega\epsilon$ radians`, md`That is the imperfect-dielectric line.`], [md`$90°$`, md`$\tau$ never exceeds $45°$.`], [md`$22.5°$`, md`That is a loss tangent of exactly 1.`]], md`$\eta = (1 + j)/\sigma\delta$ has equal real and imaginary parts.`],
        [md`In an **imperfect dielectric**, $\tau$ is approximately…`, md`$\sigma/2\omega\epsilon$ radians`, [[md`$45°$`, md`That is the good-conductor angle.`], [md`$\sigma/2\omega\epsilon$ degrees`, md`The small-angle step $\tan\theta \approx \theta$ works in radians.`], [md`$\sigma/\omega\epsilon$ radians`, md`That forgot the $\tfrac12$.`], [md`exactly $0$`, md`It is small, but not zero: any $\sigma$ makes $H$ lag a little.`]], md`$\eta \approx \eta_i(1 + j\sigma/2\omega\epsilon)$, whose angle is about $\sigma/2\omega\epsilon$ rad.`],
      ]);
      return MC('Which line of the sheet?', q, r, w, s);
    },
  ]);

  // ---------------------------------------------------------------- level 1, skin depth
  const UNITS = [['\\text{m}', [2, 5, 8, 16]], ['\\text{mm}', [1, 2, 6, 8.5, 12]], ['\\mu\\text{m}', [5, 10, 50, 66, 200]]];
  const KS = [4, 9, 16, 25, 100, 1 / 4, 1 / 9, 1 / 100];
  const byK = (k) => (k > 1 ? `multiplied by ${k}` : `divided by ${Math.round(1 / k)}`);
  GENS.rf_w2r_skin = () => one([
    () => {
      const c = skCase();
      return MC('Skin depth', md`${c.nm} ($\sigma = ${p(c.sig)}$ S/m, $\mu = \mu_0$) is a good conductor at $f = ${frX(c.fr)}$. Its skin depth is…`, lenO(c.d),
        [[lenO(c.d / Math.sqrt(2 * Math.PI)), md`That put $\omega$ where $f$ belongs in $\sqrt{\pi f\mu\sigma}$. The $2\pi$ is already inside it.`],
          [lenO(1 / (4 * Math.PI * Math.PI * c.r * c.r)), md`That forgot the square root in $1/\sqrt{\pi f\mu\sigma}$.`],
          [lenO(2 * Math.PI * c.r), md`That is $\alpha = \sqrt{\pi f\mu\sigma}$, in 1/m. $\delta$ is its inverse.`],
          [lenO(c.d * Math.sqrt(Math.PI)), md`That dropped the $\pi$ inside the root.`], [lenO(c.d / Math.SQRT2), md`That used $\sqrt{\omega\mu\sigma}$ without the $/2$.`]],
        md`$10^{-7}f\sigma = ${p(c.r * c.r)}$, whose root is $${p(c.r)}$. So $\delta = 1/(2\pi\cdot${p(c.r)}) = ${lenX(c.d)}$.`);
    },
    () => {
      const [U, vs] = pick(UNITS), v0 = pick(vs), k = pick(KS), ans = v0 / Math.sqrt(k), o = (x) => `$${p(+x.toPrecision(3))}\\ ${U}$`;
      return MC('δ and frequency', md`A good conductor has $\delta = ${v0}\ ${U}$ at some frequency. The frequency is ${byK(k)}, and it is still a good conductor. Now $\delta$ is…`, o(ans),
        [[o(v0 / k), md`That treats $\delta$ as $1/f$. It is $1/\sqrt f$.`], [o(v0 * Math.sqrt(k)), md`That moves the wrong way. A higher frequency gives a thinner skin.`], [o(v0), md`$\delta = 1/\sqrt{\pi f\mu\sigma}$ has $f$ in it.`], [o(v0 * k), md`That is the wrong way and without the square root.`]],
        md`$\delta \propto 1/\sqrt f$. The frequency was ${byK(k)}, so $\delta$ is ${k > 1 ? `divided by $\\sqrt{${k}} = ${p(Math.sqrt(k))}$` : `multiplied by $\\sqrt{${Math.round(1 / k)}} = ${p(1 / Math.sqrt(k))}$`}: $${p(+ans.toPrecision(3))}\ ${U}$.`);
    },
    () => {
      const [U, vs] = pick(UNITS), v0 = pick(vs), k = pick([4, 9, 16, 25, 100]), ans = v0 / Math.sqrt(k), o = (x) => `$${p(+x.toPrecision(3))}\\ ${U}$`;
      return MC('δ and conductivity', md`Two good conductors at the same frequency. The first has $\delta = ${v0}\ ${U}$. The second has ${k} times the conductivity. Its $\delta$ is…`, o(ans),
        [[o(v0 / k), md`That treats $\delta$ as $1/\sigma$. It is $1/\sqrt\sigma$.`], [o(v0 * Math.sqrt(k)), md`A better conductor keeps the field out more: a thinner skin, not a thicker one.`], [o(v0), md`$\sigma$ is under the root in $\delta = 1/\sqrt{\pi f\mu\sigma}$.`], [o(v0 * k), md`That is the wrong way and without the square root.`]],
        md`$\delta \propto 1/\sqrt\sigma$: divide by $\sqrt{${k}} = ${p(Math.sqrt(k))}$ to get $${p(+ans.toPrecision(3))}\ ${U}$.`);
    },
    () => {
      const [dv, dT] = pick([[5e-4, '0.5\\ \\text{mm}'], [1e-3, '1\\ \\text{mm}'], [2e-3, '2\\ \\text{mm}'], [5e-3, '5\\ \\text{mm}'], [1e-5, '10\\ \\mu\\text{m}'], [2e-6, '2\\ \\mu\\text{m}'], [2, '2\\ \\text{m}'], [0.1, '10\\ \\text{cm}']]);
      const a = 1 / dv, g = (x, s = '+') => `$${p(+x.toPrecision(4))}(1 ${s} j)$ 1/m`;
      return MC('γ from δ', md`A good conductor has $\delta = ${dT}$. Its $\gamma$ is…`, g(a),
        [[`$${p(a)}$ 1/m`, md`That keeps only $\alpha$. In a good conductor $\beta = \alpha$.`], [g(dv), md`That uses $\delta$ where $1/\delta$ belongs.`], [g(a, '-'), md`$\beta$ is positive for every wave; the direction lives in the exponent.`],
          [g(a * Math.SQRT2), md`That puts $|\gamma| = \sqrt2/\delta$ into each part. Each part is $1/\delta$.`], [g(a / 2), md`$\alpha = 1/\delta$ exactly: that is how $\delta$ is defined.`]],
        md`$\alpha = \beta = 1/\delta = ${p(a)}$ 1/m, so $\gamma = ${p(a)}(1 + j)$ 1/m.`);
    },
    () => {
      const c = skCase(), w = 2 * Math.PI * c.fr;
      if (pick([true, false])) {
        return MC('Wavelength inside', md`${c.nm} at $f = ${frX(c.fr)}$ is a good conductor with $\delta = ${lenX(c.d)}$. The wavelength inside it is…`, lenO(2 * Math.PI * c.d),
          [[lenO(c.d), md`That is $\delta$. With $\beta = 1/\delta$, $\lambda = 2\pi/\beta = 2\pi\delta$.`], [lenO(Math.PI * c.d), md`That is half a wavelength, where the field has turned around.`],
            [lenO(c.d / (2 * Math.PI)), md`That divides by $2\pi$. $\lambda = 2\pi\delta$.`], [lenO(3e8 / c.fr), md`That is $c/f$, the wavelength in free space.`]],
          md`$\beta = 1/\delta$, so $\lambda = 2\pi\delta = ${lenX(2 * Math.PI * c.d)}$.`);
      }
      return MC('Phase speed inside', md`${c.nm} at $f = ${frX(c.fr)}$ is a good conductor with $\delta = ${lenX(c.d)}$. The phase speed inside it is…`, o3(w * c.d, 'm/s'),
        [[o3(c.fr * c.d, 'm/s'), md`That used $f$ for $\omega$: $v_p = \omega\delta = 2\pi f\delta$.`], [o3(2 * w * c.d, 'm/s'), md`That is the group velocity, $2\omega\delta$.`],
          ['$3\\times10^{8}$ m/s', md`That is $c$. A good conductor slows the wave enormously.`], [o3(w / c.d, 'm/s'), md`That divides by $\delta$. $v_p = \omega/\beta = \omega\delta$.`]],
        md`$v_p = \omega/\beta = \omega\delta = (2\pi)(${p(c.fr)})(${lenX(c.d)}) = ${f(w * c.d)}$ m/s.`);
    },
    () => {
      const mode = pick(['amp', 'depA', 'depP']);
      if (mode === 'amp') {
        const n = pick([1, 2, 3]);
        return MC('Amplitude at depth', md`A wave enters a good conductor. What fraction of the surface amplitude is left at depth $${n === 1 ? '' : n}\delta$?`, pc(Math.exp(-n)),
          [[pc(Math.exp(-2 * n)), md`That is the power fraction, $e^{-2z/\delta}$.`], [pc(Math.exp(-n / 2)), md`That halves the exponent. The amplitude is $e^{-z/\delta}$.`],
            [pc(Math.pow(10, -n)), md`That used base 10. The decay is $e^{-z/\delta}$.`], [pc(Math.exp(-2 * Math.PI * n)), md`That uses $e^{-2\pi z/\delta}$, the fall over ${n === 1 ? 'a wavelength' : `${n} wavelengths`}.`]],
          md`$e^{-z/\delta} = e^{-${n}} \approx ${p(+Math.exp(-n).toPrecision(3))}$.`);
      }
      const P = pick([0.1, 0.01, 0.001]), amp = mode === 'depA', L = Math.log(1 / P), ans = amp ? L : L / 2;
      if (!amp && P === 0.001) return GENS.rf_w2r_skin();
      return MC(amp ? 'Depth for an amplitude' : 'Depth for a power', md`At what depth is ${pc(P)} of the surface **${amp ? 'amplitude' : 'power'}** left in a good conductor?`, mult(ans),
        [[mult(amp ? L / 2 : L), amp ? md`That is where ${pc(P)} of the **power** is left. The amplitude falls half as fast.` : md`That is where ${pc(P)} of the **amplitude** is left. Power falls as $e^{-2z/\delta}$, twice as fast.`],
          [mult(amp ? Math.log10(1 / P) : Math.log10(1 / P) / 2), md`That used $\log_{10}$. The decay is $e^{-z/\delta}$, so the natural log.`], [mult(1 / P), md`That treats the fall as a straight line. It is exponential.`],
          [mult(amp ? 2 * L : L * 2), md`That doubles the depth; the factor 2 goes the other way for power.`]],
        md`${amp ? md`$e^{-z/\delta} = ${p(P)}$ gives $z = \delta\ln(1/${p(P)}) = ${p(+L.toPrecision(3))}\delta$.` : md`$e^{-2z/\delta} = ${p(P)}$ gives $z = \tfrac12\delta\ln(1/${p(P)}) = ${p(+ans.toPrecision(3))}\delta$.`}`);
    },
  ]);

  // ---------------------------------------------------------------- level 1, the good conductor's eta and H
  const SDS = [[1e-3, '1\\ \\text{mm}'], [2e-3, '2\\ \\text{mm}'], [5e-4, '0.5\\ \\text{mm}'], [1e-4, '0.1\\ \\text{mm}'], [1e-5, '10\\ \\mu\\text{m}']];
  const pickSD = () => {
    for (let i = 0; i < 200; i++) {
      const sig = pick([1e4, 2e4, 5e4, 1e5, 1e6]), [dv, dT] = pick(SDS);
      if (sig * dv >= 0.1 && sig * dv <= 1e3) return { sig, dv, dT, sd: sig * dv };
    }
    return { sig: 1e4, dv: 1e-3, dT: '1\\ \\text{mm}', sd: 10 };
  };
  GENS.rf_w2r_gc = () => one([
    () => {
      const s = pickSD(), v = 1 / s.sd, e = (x, sg = '+') => `$${f(x)}(1 ${sg} j)\\ \\Omega$`;
      return MC('η of a good conductor', md`A good conductor has $\sigma = ${p(s.sig)}$ S/m, and at the working frequency $\delta = ${s.dT}$. Its $\eta$ is…`, e(v),
        [[`$${f(v)}\\ \\Omega$`, md`That is only the real part. $\eta = (1 + j)/\sigma\delta$ has a $45°$ angle.`], [e(v * Math.SQRT2), md`That puts the size $\sqrt2/\sigma\delta$ into each part.`],
          [e(s.sd), md`That is $\sigma\delta$, upside down.`], [e(v, '-'), md`$H$ lags $E$, so $\eta = \tilde E/\tilde H$ has angle $+45°$.`]],
        md`$\sigma\delta = ${p(s.sd)}$ S, so $\eta = (1 + j)/\sigma\delta = ${f(v)}(1 + j)\ \Omega$.`);
    },
    () => {
      const [sig, q] = pick([[4, 0.01], [4, 0.02], [4, 0.05], [4, 0.1], [1e6, 1e-5], [1e6, 1e-4], [1e6, 1e-3], [4e7, 1e-4], [4e7, 1e-3], [4e7, 1e-2]]);
      const fr = 5e6 * q * q * sig, ans = 2 * Math.PI * q;
      return MC('|η| from the sheet', md`A good conductor has $\sigma = ${p(sig)}$ S/m and $\mu = \mu_0$. At $f = ${frX(fr)}$, $|\eta| = \sqrt{\omega\mu/\sigma}$ is…`, o3(ans, 'Ω'),
        [[o3(Math.sqrt(2 * Math.PI) * q, 'Ω'), md`That used $f$ for $\omega$ inside the root.`], [o3(ans * ans, 'Ω'), md`That forgot the square root.`],
          [o3(ans * sig, 'Ω'), md`That is $\sqrt{\omega\mu\sigma}$, which is in 1/m: $\sigma$ belongs in the denominator.`], ['$120\\pi$ Ω', md`That is free space. A good conductor's $|\eta|$ is tiny.`]],
        md`$\omega\mu_0/\sigma = (2\pi f)(4\pi\times10^{-7})/\sigma = 4\pi^2(2\times10^{-7}f/\sigma) = 4\pi^2(${p(q * q)})$. The root is $2\pi(${p(q)}) = ${f(ans)}\ \Omega$.`);
    },
    () => {
      const phE = pick([0, 30, 60, 90, -30, 45, -60]);
      return MC('Phase of H', md`A wave travels toward $+\hat x$ in a good conductor. At $x = 0$, $\mathbf E = \hat z\,E_0\cos(\omega t${phT(phE)})$. Then $\mathbf H = -\hat y\,H_0\cos(\omega t + \psi)$ with $H_0 > 0$. What is $\psi$?`, dg(phE - 45),
        [[dg(phE + 45), md`That adds $\tau$. $\tilde H = \tilde E/\eta$, and dividing subtracts the $45°$: $H$ lags.`], [dg(phE), md`That forgets the lag. In a good conductor $\tau = 45°$.`],
          [dg(phE - 90), md`$\tau$ is $45°$, not $90°$; it never exceeds $45°$.`], [dg(phE - 22.5), md`That halves $45°$. The angle of $(1 + j)$ is already $45°$.`]],
        md`$\tau = 45°$ and $H$ lags: $\psi = ${phE}° - 45° = ${phE - 45}°$. The $-\hat y$ comes from $\hat k\times\hat e = \hat x\times\hat z$.`);
    },
    () => {
      const s = pickSD(), E0 = pick([1, 2, 5, 10]), H0 = E0 * s.sd / Math.SQRT2;
      return MC('Amplitude of H', md`A good conductor has $\sigma = ${p(s.sig)}$ S/m and $\delta = ${s.dT}$. At its surface, $|\mathbf E| = ${E0}$ V/m. The amplitude of $\mathbf H$ there is…`, o3(H0, 'A/m'),
        [[o3(E0 * s.sd, 'A/m'), md`That divides by $\Re\{\eta\} = 1/\sigma\delta$ only. The size of $\eta$ is $\sqrt2/\sigma\delta$.`], [o3(E0 / s.sd, 'A/m'), md`That multiplies by $\eta$. $H = E/|\eta|$.`],
          [o3(E0 / (120 * Math.PI), 'A/m'), md`That uses free space's $\eta_0$.`], [o3(E0 * s.sd / 2, 'A/m'), md`That divides by 2 where $\sqrt2$ belongs.`]],
        md`$|\eta| = \sqrt2/\sigma\delta = \sqrt2/${p(s.sd)}\ \Omega$, so $H_0 = E_0/|\eta| = E_0\sigma\delta/\sqrt2 = ${f(H0)}$ A/m.`);
    },
    () => {
      const c = skCase(), vp = 2 * Math.PI * c.fr * c.d;
      return MC('Group velocity', md`${c.nm} at $f = ${frX(c.fr)}$ is a good conductor with $\delta = ${lenX(c.d)}$. The group velocity of a narrowband signal in it is…`, o3(2 * vp, 'm/s'),
        [[o3(vp, 'm/s'), md`That is $v_p = \omega\delta$. In a good conductor $\omega \propto \beta^2$, so $v_g = 2v_p$.`], [o3(vp / 2, 'm/s'), md`That halves $v_p$. The curve $\omega(\beta)$ is steeper than the line to the origin, so $v_g$ is larger.`],
          [o3(2 * c.fr * c.d, 'm/s'), md`That used $f$ for $\omega$.`], ['$3\\times10^{8}$ m/s', md`That is $c$. Nothing in a good conductor goes that fast.`]],
        md`$v_p = \omega\delta = ${f(vp)}$ m/s, and $v_g = d\omega/d\beta = 2v_p = ${f(2 * vp)}$ m/s.`);
    },
    () => {
      const a = pick([0.01, 0.02, 0.05, 0.1]), [dv, dT] = pick([[1e-4, '0.1\\ \\text{mm}'], [5e-4, '0.5\\ \\text{mm}'], [1e-3, '1\\ \\text{mm}'], [2e-3, '2\\ \\text{mm}']]);
      const sig = 1 / (a * dv);
      return MC('σ from η', md`A good conductor has $\eta = ${p(a)}(1 + j)\ \Omega$ and $\delta = ${dT}$. Its conductivity is…`, o3(sig, 'S/m'),
        [[o3(sig / Math.SQRT2, 'S/m'), md`That divides by $|\eta|\delta$. The real part alone is $1/\sigma\delta$.`], [o3(sig / 2, 'S/m'), md`That adds the two parts. The real part alone is $1/\sigma\delta$.`],
          [o3(a / dv, 'S/m'), md`That is $\Re\{\eta\}/\delta$. Invert: $\sigma = 1/(\Re\{\eta\}\,\delta)$.`], [o3(a * dv, 'S/m'), md`That is upside down. A good conductor has a large $\sigma$.`]],
        md`$\Re\{\eta\} = 1/\sigma\delta$, so $\sigma = 1/(${p(a)}\times${lenX(dv)}) = ${f(sig)}$ S/m.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1, the imperfect dielectric
  GENS.rf_w2r_id = () => one([
    () => {
      const er = pick([1, 2.25, 4, 9, 16]), n = Math.sqrt(er), sig = pick([1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3]);
      const ei = 120 * Math.PI / n, a = sig * ei / 2;
      return MC('α in a low-loss material', md`A low-loss material ($\sigma/\omega\epsilon \ll 1$) has $\mu = \mu_0$, $\epsilon_r = ${er}$ and $\sigma = ${p(sig)}$ S/m. Its $\alpha$ is…`, o3(a, 'Np/m'),
        [[o3(2 * a, 'Np/m'), md`That dropped the $\tfrac12$ from the binomial step.`], [o3(sig * 60 * Math.PI, 'Np/m'), md`That used $\eta_0 = 120\pi$. Use $\eta_i = 120\pi/\sqrt{\epsilon_r}$.`],
          [o3(a / 2, 'Np/m'), md`That halves twice. $\alpha = \sigma\eta_i/2$.`], [o3(sig / (2 * ei), 'Np/m'), md`That divides by $\eta_i$. Check the units: S/m times $\Omega$ is 1/m.`]],
        md`$\eta_i = 120\pi/${p(n)} = ${f(ei)}\ \Omega$, so $\alpha = \sigma\eta_i/2 = ${f(a)}$ Np/m.`);
    },
    () => {
      const L = pick([0.002, 0.004, 0.01, 0.02, 0.04, 0.06]);
      return MC('τ in a low-loss material', md`A material has $\sigma/\omega\epsilon = ${p(L)}$. The angle $\tau$ of $\eta$, in degrees, is about…`, `$${f(L / 2 * DEG)}°$`,
        [[`$${p(L / 2)}°$`, md`$\sigma/2\omega\epsilon$ is in radians. Multiply by $57.3$ for degrees.`], [`$${f(L * DEG)}°$`, md`That forgot the $\tfrac12$.`],
          [`$${f(L / 4 * DEG)}°$`, md`That halved twice. $\tau \approx \sigma/2\omega\epsilon$.`], ['$45°$', md`That is the good-conductor angle.`]],
        md`$\tau \approx \sigma/2\omega\epsilon = ${p(L / 2)}$ rad $= ${p(L / 2)}\times57.3° = ${f(L / 2 * DEG)}°$.`);
    },
    () => {
      const er = pick([1, 4, 9, 16]), n = Math.sqrt(er), sig = pick([1e-4, 2e-4, 5e-4, 1e-3, 2e-3]);
      const ei = 120 * Math.PI / n, d = 2 / (sig * ei);
      return MC('δ in a low-loss material', md`A low-loss material has $\mu = \mu_0$, $\epsilon_r = ${er}$ and $\sigma = ${p(sig)}$ S/m. Its skin depth is…`, lenO(d),
        [[lenO(d / 2), md`That is $1/\sigma\eta_i$. The $\tfrac12$ in $\alpha$ makes $\delta = 2/\sigma\eta_i$.`], [lenO(2 / (sig * 120 * Math.PI)), md`That used $\eta_0$ for $\eta_i$.`],
          [lenO(1 / (2 * Math.PI * Math.sqrt(1e-7 * sig * 1e9))), md`That is a good-conductor formula, at an invented frequency. In a low-loss material $\delta = 2/\sigma\eta_i$.`], [lenO(2 * d), md`That doubled $\delta$. $\delta = 1/\alpha = 2/\sigma\eta_i$.`]],
        md`$\alpha = \sigma\eta_i/2$ with $\eta_i = ${f(ei)}\ \Omega$, so $\delta = 2/\sigma\eta_i = ${lenX(d)}$.`);
    },
    () => {
      const k = pick([2, 3, 10]), A = pick([0.02, 0.05, 0.1, 0.3]), B = pick([10, 20, 50]);
      if (pick([true, false])) {
        return MC('α when f changes', md`A low-loss material has $\alpha = ${A}$ Np/m and $\beta = ${B}$ rad/m at some frequency. The frequency is multiplied by ${k}, and it stays low-loss. Now $\alpha$ is…`, o3(A, 'Np/m'),
          [[o3(k * A, 'Np/m'), md`That is how $\beta$ scales. $\alpha = \sigma\eta_i/2$ has no $\omega$ in it.`], [o3(Math.sqrt(k) * A, 'Np/m'), md`That is the good-conductor scaling, $\sqrt{\pi f\mu\sigma}$.`], [o3(A / k, 'Np/m'), md`Nothing in $\sigma\eta_i/2$ falls with frequency.`]],
          md`$\alpha \approx \sigma\eta_i/2$, independent of frequency: still $${A}$ Np/m.`);
      }
      return MC('β when f changes', md`A low-loss material has $\alpha = ${A}$ Np/m and $\beta = ${B}$ rad/m at some frequency. The frequency is multiplied by ${k}, and it stays low-loss. Now $\beta$ is…`, o3(k * B, 'rad/m'),
        [[o3(B, 'rad/m'), md`That is how $\alpha$ behaves. $\beta \approx \omega\sqrt{\mu\epsilon}$ grows with $\omega$.`], [o3(Math.sqrt(k) * B, 'rad/m'), md`That is the good-conductor scaling.`], [o3(k * k * B, 'rad/m'), md`$\beta$ is proportional to $\omega$, not to $\omega^2$.`]],
        md`$\beta \approx \omega\sqrt{\mu\epsilon}$, proportional to $\omega$: $${k}\times${B} = ${k * B}$ rad/m.`);
    },
    () => {
      const er = pick([1, 4, 9, 16]), n = Math.sqrt(er), L = pick([0.002, 0.01, 0.02, 0.04]);
      const E = (c, im, sg = '+') => `$${p(c)}\\pi(1 ${sg} ${im})\\ \\Omega$`;
      return MC('η in a low-loss material', md`A low-loss material has $\mu = \mu_0$, $\epsilon_r = ${er}$, and at this frequency $\sigma/\omega\epsilon = ${p(L)}$. Its $\eta$ is approximately…`, E(120 / n, `j${p(L / 2)}`),
        [[E(120 / n, `j${p(L / 2)}`, '-'), md`$H$ lags $E$, so $\eta$ has a positive angle: $1 + j\sigma/2\omega\epsilon$.`], [E(120 / n, `j${p(L)}`), md`That forgot the $\tfrac12$ from the binomial step.`],
          [E(120 / n, p(L / 2)), md`That lost the $j$. The loss tangent sits on the imaginary axis in $1 - j\sigma/\omega\epsilon$.`], [E(120 * n, `j${p(L / 2)}`), md`That multiplied by $\sqrt{\epsilon_r}$. $\eta_i = 120\pi/\sqrt{\epsilon_r}$.`]],
        md`$\eta \approx \eta_i(1 + j\sigma/2\omega\epsilon)$ with $\eta_i = 120\pi/${p(n)} = ${p(120 / n)}\pi\ \Omega$ and $\sigma/2\omega\epsilon = ${p(L / 2)}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2
  GENS.w2r_gcond = () => {
    const c = skCase(), w = 2 * Math.PI * c.fr, d = c.d, em = Math.SQRT2 / (c.sig * d);
    const ltTraps = [{ v: c.lt * 2 * Math.PI, msg: 'That used f where ω = 2πf belongs.' }];
    if (c.er > 1) ltTraps.push({ v: c.lt * c.er, msg: 'That used ε0 in place of the material ε = εr ε0.' });
    return {
      title: 'A good conductor from σ and f',
      q: md`${c.nm} has $\sigma = ${p(c.sig)}$ S/m, $\epsilon_r = ${c.er}$ and $\mu = \mu_0$. A wave at $f = ${frX(c.fr)}$ travels in it. Find the loss tangent, then $\delta$, $\alpha$, $|\eta|$, $\lambda$ and $v_p$.`,
      parts: [
        Object.assign(N('\\sigma/\\omega\\epsilon', c.lt, ''), { traps: ltTraps }),
        lenN('\\delta', d, [{ v: d / Math.sqrt(2 * Math.PI), msg: 'That put ω where f belongs in √(πfμσ).' }, { v: d / Math.SQRT2, msg: 'That used √(ωμσ) without the /2.' }]),
        Object.assign(N('\\alpha', 1 / d, 'Np/m'), { traps: [{ v: d, msg: 'That is δ. α = 1/δ.' }] }),
        Object.assign(N('|\\eta|', em, 'Ω'), { traps: [{ v: 1 / (c.sig * d), msg: 'That is only the real part, 1/σδ. The size is √2/σδ.' }] }),
        lenN('\\lambda', 2 * Math.PI * d, [{ v: d, msg: 'That is δ. λ = 2πδ.' }, { v: 3e8 / c.fr, msg: 'That is the free-space wavelength c/f.' }]),
        Object.assign(N('v_p', w * d, 'm/s'), { traps: [{ v: c.fr * d, msg: 'v_p = ωδ = 2πfδ: the 2π went missing.' }] }),
      ],
      hints: [md`$\sigma/\omega\epsilon = 18\times10^9\sigma/(\epsilon_r f)$. Then $\delta = 1/(2\pi\sqrt{10^{-7}f\sigma})$.`, md`$\alpha = \beta = 1/\delta$, $|\eta| = \sqrt2/\sigma\delta$, $\lambda = 2\pi\delta$, $v_p = \omega\delta$.`],
      sol: md`
        **Step 1: the regime.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{(18\times10^9)(${p(c.sig)})}{(${c.er})(${p(c.fr)})} = ${f(c.lt)}$$
        Far above 10: a good conductor.

        **Step 2: δ.** $10^{-7}f\sigma = (10^{-7})(${p(c.fr)})(${p(c.sig)}) = ${p(c.r * c.r)}$, whose root is $${p(c.r)}$:
        $$\delta = \frac{1}{2\pi(${p(c.r)})} = ${lenX(d)}$$
        **Step 3: α.** $\alpha = \beta = 1/\delta = ${f(1 / d)}$ Np/m.

        **Step 4: η.** $\sigma\delta = ${f(c.sig * d)}$ S, so $\eta = (1 + j)/\sigma\delta = ${f(1 / (c.sig * d))}(1 + j)\ \Omega$, and
        $$|\eta| = \frac{\sqrt2}{\sigma\delta} = ${f(em)}\ \Omega$$
        Check with the sheet's form: $\sqrt{\omega\mu_0/\sigma} = ${f(Math.sqrt(w * MU0 / c.sig))}\ \Omega$ ✓.

        **Step 5: λ and v_p.**
        $$\lambda = 2\pi\delta = ${lenX(2 * Math.PI * d)}$$
        $$v_p = \omega\delta = ${f(w * d)}\ \text{m/s}$$
        Compare $c/f = ${lenX(3e8 / c.fr)}$ in free space: the conductor shrinks the wave by a factor of ${f(3e8 / (c.fr * 2 * Math.PI * d))}.
      `,
    };
  };

  GENS.w2r_idiel = () => {
    let er = 4, sig = 1e-3, fr = 1e9, lt = ltOf(sig, er, fr);
    for (let i = 0; i < 400; i++) {
      er = pick([2.25, 4, 9, 16]); sig = pick([1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3]); fr = pick([1e8, 3e8, 6e8, 1e9, 1.5e9, 3e9, 1e10]);
      lt = ltOf(sig, er, fr);
      if (lt <= 0.03 && lt >= 2e-4) break;
    }
    const n = Math.sqrt(er), ei = 120 * Math.PI / n, a = sig * ei / 2, k = 2 * Math.PI * fr * n / 3e8, tauD = lt / 2 * DEG;
    const exA = k * Math.sqrt(0.5 * (Math.sqrt(1 + lt * lt) - 1));
    const dist = [0.5, 1, 2, 5, 10, 20, 50, 100, 200].reduce((b, x) => (Math.abs(Math.log(a * x)) < Math.abs(Math.log(a * b)) ? x : b), 1);
    const frac = Math.exp(-a * dist);
    const aTraps = [{ v: 2 * a, msg: 'The binomial step brings a factor ½: α = σηi/2.' }];
    if (er > 1) aTraps.push({ v: sig * 60 * Math.PI, msg: 'That used η0 = 120π. Use ηi = 120π/√εr.' });
    return {
      title: 'An imperfect dielectric',
      q: md`A material has $\mu = \mu_0$, $\epsilon_r = ${er}$ and $\sigma = ${p(sig)}$ S/m. A wave at $f = ${frX(fr)}$ travels in it. Find the loss tangent, $\alpha$, $\delta$, $\beta$, $\tau$ (in degrees), and the fraction of the amplitude left after ${dist} m.`,
      parts: [
        Object.assign(N('\\sigma/\\omega\\epsilon', lt, ''), { traps: [{ v: lt * 2 * Math.PI, msg: 'That used f where ω = 2πf belongs.' }] }),
        Object.assign(N('\\alpha', a, 'Np/m'), { traps: aTraps }),
        lenN('\\delta', 1 / a),
        Object.assign(N('\\beta', k, 'rad/m'), { traps: er > 1 ? [{ v: 2 * Math.PI * fr / 3e8, msg: 'That is ω/c, free space. In the material β = ω√εr/c.' }] : [] }),
        Object.assign(N('\\tau\\ (\\text{degrees})', tauD, '°'), { traps: [{ v: lt / 2, msg: 'That is τ in radians. Multiply by 57.3.' }, { v: lt * DEG, msg: 'That forgot the ½: τ ≈ σ/2ωε.' }] }),
        Object.assign(N(`\\text{fraction left after ${dist} m}`, frac, ''), { traps: [{ v: Math.exp(-2 * a * dist), msg: 'That is the power fraction, e^(−2αz).' }] }),
      ],
      hints: [md`$\sigma/\omega\epsilon = 18\times10^9\sigma/(\epsilon_r f)$. If it is small, $\alpha = \sigma\eta_i/2$ with $\eta_i = 120\pi/\sqrt{\epsilon_r}$.`, md`$\beta = \omega\sqrt{\epsilon_r}/c$, $\tau \approx \sigma/2\omega\epsilon$ in radians, and the amplitude falls as $e^{-\alpha z}$.`],
      sol: md`
        **Step 1: the regime.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{(18\times10^9)(${p(sig)})}{(${er})(${p(fr)})} = ${f(lt)}$$
        Far below 0.1: an imperfect dielectric.

        **Step 2: α and δ.** $\eta_i = 120\pi/${p(n)} = ${f(ei)}\ \Omega$, so
        $$\alpha = \frac{\sigma\eta_i}{2} = ${f(a)}\ \text{Np/m}$$
        and $\delta = 1/\alpha = ${lenX(1 / a)}$.

        **Step 3: β.** As if lossless:
        $$\beta = \frac{\omega\sqrt{\epsilon_r}}{c} = ${f(k)}\ \text{rad/m}$$
        so $\lambda = ${lenX(2 * Math.PI / k)}$, and one skin depth holds ${f(k / (2 * Math.PI * a))} wavelengths.

        **Step 4: τ.** $\tau \approx \sigma/2\omega\epsilon = ${f(lt / 2)}$ rad $= ${f(tauD)}°$.

        **Step 5: after ${dist} m.** $\alpha z = ${f(a * dist)}$, and $e^{-${f(a * dist)}} = ${f(frac)}$ of the amplitude is left.

        **Check with Topic 5's exact formula.** $\alpha = k\sqrt{\tfrac12(\sqrt{1 + (\sigma/\omega\epsilon)^2} - 1)} = ${f(exA, 5)}$ Np/m, against $${f(a, 5)}$ from the approximation ✓.
      `,
    };
  };

  const WATERS = [
    { nm: 'Seawater', sig: 4, er: 81, rs: [0.01, 0.02, 0.04, 0.1, 0.2] },
    { nm: 'Lake water', sig: 0.01, er: 81, rs: [0.001, 0.002, 0.004] },
  ];
  GENS.w2r_depth = () => {
    const c = skCase(WATERS), k = pick([4, 16, 25, 100]), P = pick([0.1, 0.01]), amp = pick([true, false]);
    const f2 = c.fr / k, d2 = c.d * Math.sqrt(k), L = Math.log(1 / P), m = amp ? L : L / 2;
    const z1 = m * c.d, z2 = m * d2, what = amp ? 'amplitude' : 'power';
    const zTr = (z) => [{ v: amp ? z / 2 : 2 * z, msg: amp ? 'That is where the power, not the amplitude, falls to that fraction.' : 'That is where the amplitude, not the power, falls to that fraction. Power falls twice as fast.' },
      { v: z * Math.log10(1 / P) / L, msg: 'That used log10. The decay is e^(−z/δ): use the natural log.' }];
    return {
      title: 'How deep does the signal reach?',
      q: md`${c.nm} has $\sigma = ${p(c.sig)}$ S/m, $\epsilon_r = ${c.er}$ and $\mu = \mu_0$. A transmitter at the surface works at $f_1 = ${frX(c.fr)}$. Find the loss tangent, the skin depth $\delta_1$, and the depth $z_1$ at which ${pc(P)} of the surface **${what}** is left. Then the frequency is lowered to $f_2 = ${frX(f2)}$: find $\delta_2$ and $z_2$. Finally, find the wavelength in the water at $f_1$.`,
      parts: [
        Object.assign(N('\\sigma/\\omega\\epsilon\\text{ at }f_1', c.lt, ''), { traps: [{ v: c.lt * c.er, msg: 'That used ε0 for the water.' }] }),
        Object.assign(N('\\delta_1', c.d, 'm'), { traps: [{ v: c.d / Math.sqrt(2 * Math.PI), msg: 'That put ω where f belongs in √(πfμσ).' }] }),
        Object.assign(N('z_1', z1, 'm'), { traps: zTr(z1) }),
        Object.assign(N('\\delta_2', d2, 'm'), { traps: [{ v: c.d * k, msg: 'δ grows as 1/√f, not 1/f.' }] }),
        Object.assign(N('z_2', z2, 'm'), { traps: zTr(z2) }),
        Object.assign(N('\\lambda\\text{ at }f_1', 2 * Math.PI * c.d, 'm'), { traps: [{ v: 3e8 / c.fr, msg: 'That is c/f, the free-space wavelength.' }] }),
      ],
      hints: [md`$\delta = 1/(2\pi\sqrt{10^{-7}f\sigma})$. ${amp ? md`The amplitude is $e^{-z/\delta}$.` : md`The power is $e^{-2z/\delta}$.`}`, md`$\delta \propto 1/\sqrt f$, and $\ln 10 \approx 2.3$, $\ln 100 \approx 4.6$.`],
      sol: md`
        **Step 1: the regime.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{(18\times10^9)(${p(c.sig)})}{(${c.er})(${p(c.fr)})} = ${f(c.lt)}$$
        A good conductor. (Lowering $f$ only raises the ratio.)

        **Step 2: δ₁.** $10^{-7}f\sigma = ${p(c.r * c.r)}$, root $${p(c.r)}$:
        $$\delta_1 = \frac{1}{2\pi(${p(c.r)})} = ${f(c.d)}\ \text{m}$$
        **Step 3: z₁.** ${amp ? md`The amplitude is $e^{-z/\delta}$. Set it to $${p(P)}$:` : md`The power goes as the amplitude squared, $e^{-2z/\delta}$. Set it to $${p(P)}$:`}
        $$z_1 = ${amp ? '' : '\\tfrac12'}\delta_1\ln\frac{1}{${p(P)}} = ${p(+m.toPrecision(3))}\delta_1 = ${f(z1)}\ \text{m}$$
        **Step 4: δ₂ and z₂.** The frequency fell by ${k}, so $\delta$ grows by $\sqrt{${k}} = ${p(Math.sqrt(k))}$:
        $$\delta_2 = ${f(d2)}\ \text{m}, \qquad z_2 = ${f(z2)}\ \text{m}$$
        **Step 5: λ at f₁.** $\lambda = 2\pi\delta_1 = ${f(2 * Math.PI * c.d)}$ m. In air it would be $c/f_1 = ${lenX(3e8 / c.fr)}$.

        **Speed path.** Make $10^{-7}f\sigma$ a perfect square. Depth $= ${p(+m.toPrecision(3))}\delta$ for ${pc(P)} of the ${what}. A factor of ${k} in $f$ is a factor of ${p(Math.sqrt(k))} in depth.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3
  GENS.w2r_sheet = () => {
    const o = orient(), { u, dir, ei, es, hi, hs } = o;
    const [dv, dmm] = pick([[5e-4, 0.5], [1e-3, 1], [2e-3, 2], [4e-3, 4]]);
    const sig = pick([1e4, 2e4, 5e4, 1e5, 2e5]), E0 = pick([5, 10, 20, 40]), phE = pick([0, 30, 60, -30, 90]), n = pick([2, 3]);
    const sd = sig * dv, em = Math.SQRT2 / sd, H0 = E0 / em, fr = 1 / (Math.PI * MU0 * sig * dv * dv), lt = 18e9 * sig / fr;
    const val = hs * H0 * Math.cos((phE - 45) / DEG);
    const valTr = [{ v: -val, msg: 'Sign: ĥ = k̂ × ê, and the cosine at t = 0.' }, { v: hs * H0 * Math.cos((phE + 45) / DEG), msg: 'H lags E: subtract 45°, do not add it.' }, { v: hs * H0 * Math.cos(phE / DEG), msg: 'That forgot the 45° lag of H.' }]
      .filter((t) => Math.abs(t.v - val) > 0.03 * Math.abs(val));
    const allU = (i, s) => `$${s > 0 ? '+' : ''}${uv(i, s)}$`;
    const kS = kT(o), at = `${dir > 0 ? '' : '-'}${p(n * dmm)}`;
    return {
      title: 'A good conductor fed by a current sheet',
      q: md`A current sheet on the plane $${AX[u]} = 0$ launches a TEM wave that travels toward $${kS}$ through a good conductor with $\sigma = ${p(sig)}$ S/m and $\mu = \mu_0$. The penetration depth is $\delta = ${dmm}$ mm, and at the sheet $\mathbf E = ${uvp(ei, es)}\,${E0}\cos(\omega t${phT(phE)})$ V/m. Find $\alpha$, the amplitude of $\mathbf E$ at $${AX[u]} = ${at}$ mm, $|\eta|$, the amplitude $H_0$, the direction of $\mathbf H$, the value of $H_${AX[hi]}$ at the sheet at $t = 0$, the frequency, and the wavelength in the conductor.`,
      parts: [
        Object.assign(N('\\alpha', 1 / dv, 'Np/m'), { traps: [{ v: dv, msg: 'That is δ. α = 1/δ.' }] }),
        Object.assign(N(`|\\mathbf E|\\text{ at }${AX[u]} = ${at}\\text{ mm}`, E0 * Math.exp(-n), 'V/m'), { traps: [{ v: E0 * Math.exp(-2 * n), msg: 'That is e^(−2αz), the power factor. The amplitude falls as e^(−αz).' }] }),
        Object.assign(N('|\\eta|', em, 'Ω'), { traps: [{ v: 1 / sd, msg: 'That is the real part 1/σδ only. The size is √2/σδ.' }] }),
        Object.assign(N('H_0', H0, 'A/m'), { traps: [{ v: E0 / (120 * Math.PI), msg: 'That used η0. Use the conductor’s |η|.' }, { v: E0 * sd, msg: 'That divided by the real part of η only.' }] }),
        { lbl: md`The direction of $\mathbf H$ (when its cosine is positive)`, mc: [allU(hi, hs), allU(hi, -hs), allU(u, dir), allU(ei, es)], a: 0,
          why: [null, md`That is $\hat e\times\hat k$, the wrong order. $\hat h = \hat k\times\hat e$.`, md`That is the direction of travel. $\mathbf H$ is perpendicular to it.`, md`That is the direction of $\mathbf E$.`] },
        valTr.length ? Object.assign(N(`H_${AX[hi]}\\text{ at the sheet, }t = 0`, val, 'A/m'), { traps: valTr }) : N(`H_${AX[hi]}\\text{ at the sheet, }t = 0`, val, 'A/m'),
        Object.assign(N('f', fr, 'Hz'), { traps: [{ v: 2 * Math.PI * fr, msg: 'That is ω in rad/s. f = ω/2π.' }] }),
        Object.assign(N('\\lambda\\ (\\text{in mm})', 2 * Math.PI * dmm, 'mm'), { traps: [{ v: dmm, msg: 'That is δ. λ = 2πδ.' }] }),
      ],
      hints: [md`Good conductor: $\gamma = (1 + j)/\delta$ and $\eta = (1 + j)/\sigma\delta$.`, md`$\hat h = \hat k\times\hat e$; $H$ lags $E$ by $45°$; $f = 1/(\pi\mu_0\sigma\delta^2)$.`],
      sol: md`
        **Step 1: γ.** $\alpha = \beta = 1/\delta = ${p(1 / dv)}$ 1/m, so $\gamma = ${p(1 / dv)}(1 + j)$ 1/m.

        **Step 2: the amplitude at ${n} skin depths.** $${AX[u]} = ${at}$ mm is ${n} skin depths from the sheet along the direction of travel:
        $$${E0}e^{-${n}} = ${f(E0 * Math.exp(-n))}\ \text{V/m}$$
        **Step 3: η.** $\sigma\delta = (${p(sig)})(${p(dv)}) = ${p(sd)}$ S, so
        $$\eta = \frac{1 + j}{${p(sd)}} = ${f(1 / sd)}(1 + j)\ \Omega$$
        and $|\eta| = \sqrt2/\sigma\delta = ${f(em)}\ \Omega$, $\tau = 45°$.

        **Step 4: H₀.** $H_0 = E_0/|\eta| = ${E0}/${f(em)} = ${f(H0)}$ A/m.

        **Step 5: the direction of H.**
        $$\hat h = \hat k\times\hat e = (${kS})\times(${uv(ei, es)}) = ${uv(hi, hs)}$$
        Check: $\hat e\times\hat h = ${kS}$, the direction of travel ✓.

        **Step 6: the value at the sheet.** $H$ lags by $45°$, so its phase is $${phE}° - 45° = ${phE - 45}°$:
        $$H_${AX[hi]} = ${hs > 0 ? '' : '-'}${f(H0)}\cos(${phE - 45}°) = ${f(val)}\ \text{A/m}$$
        **Step 7: the frequency.** Solve $\delta = 1/\sqrt{\pi f\mu_0\sigma}$ for $f$:
        $$f = \frac{1}{\pi\mu_0\sigma\delta^2} = ${f(fr)}\ \text{Hz}$$
        Check the regime: $\sigma/\omega\epsilon_0 = ${f(lt)} \gg 10$ ✓.

        **Step 8: λ.** $\lambda = 2\pi\delta = ${f(2 * Math.PI * dmm)}$ mm.

        **Speed path.** Everything except $f$ comes from $\delta$ and $\sigma\delta$. Do the cross product first; it decides the sign of the value at the sheet.

        **Where points go.** $e^{-2n}$ for the amplitude; $\eta_0$ for $|\eta|$; $+45°$ instead of $-45°$; $\hat h = \hat e\times\hat k$.
      `,
    };
  };

  // one material, three frequencies: good conductor, in between (a clean triangle), imperfect dielectric
  const TRIS3 = [{ L: 4 / 3, LT: '\\tfrac43', h: 5 / 3, hT: '\\tfrac53' }, { L: 3 / 4, LT: '\\tfrac34', h: 5 / 4, hT: '\\tfrac54' }, { L: 12 / 5, LT: '\\tfrac{12}{5}', h: 13 / 5, hT: '\\tfrac{13}{5}' }];
  GENS.w2r_three = () => {
    const [sig, er] = pick([[0.01, 4], [0.1, 9], [1, 36], [4, 81], [0.02, 9], [0.05, 4]]), n = Math.sqrt(er);
    const fc = 18e9 * sig / er, p1 = pick([100, 1000, 1e4]), p3 = pick([100, 1000]), t = pick(TRIS3);
    const f1 = fc / p1, f2 = fc / t.L, f3 = fc * p3;
    const d1 = 1 / Math.sqrt(Math.PI * f1 * MU0 * sig);
    const k2 = 2 * Math.PI * f2 * n / 3e8, a2 = k2 * Math.sqrt(0.5 * (t.h - 1)), gc2 = Math.sqrt(Math.PI * f2 * MU0 * sig);
    const ei = 120 * Math.PI / n, a3 = sig * ei / 2, k3 = 2 * Math.PI * f3 * n / 3e8;
    return {
      title: 'One material, three frequencies',
      q: md`A material has $\sigma = ${p(sig)}$ S/m, $\epsilon_r = ${er}$ and $\mu = \mu_0$. Consider three frequencies: $f_1 = ${frX(f1)}$, $f_2 = ${frX(f2)}$ and $f_3 = ${frX(f3)}$. Find the crossover frequency $f_c$, the skin depth at $f_1$, $\alpha$ at $f_2$, and $\alpha$ and $\beta$ at $f_3$. For each, first decide which formulas apply.`,
      parts: [
        Object.assign(N('f_c', fc, 'Hz'), { traps: [{ v: fc * 2 * Math.PI, msg: 'That is ω_c = σ/ε in rad/s.' }, { v: fc * er, msg: 'That used ε0 for the material.' }] }),
        lenN('\\delta\\text{ at }f_1', d1, [{ v: d1 / Math.sqrt(2 * Math.PI), msg: 'That put ω where f belongs in √(πfμσ).' }]),
        Object.assign(N('\\alpha\\text{ at }f_2', a2, 'Np/m'), { traps: [{ v: gc2, msg: 'That is the good-conductor line, which is far off at a loss tangent this close to 1. Use the exact formula.' }, { v: a3, msg: 'That is the imperfect-dielectric line, which is far off here. Use the exact formula.' }] }),
        Object.assign(N('\\alpha\\text{ at }f_3', a3, 'Np/m'), { traps: [{ v: Math.sqrt(Math.PI * f3 * MU0 * sig), msg: 'That is the good-conductor line. At f3 the material is low-loss.' }, { v: 2 * a3, msg: 'α = σηi/2: the ½ went missing.' }] }),
        Object.assign(N('\\beta\\text{ at }f_3', k3, 'rad/m'), { traps: [{ v: 2 * Math.PI * f3 / 3e8, msg: 'That is ω/c, free space.' }] }),
      ],
      hints: [md`$f_c = 18\times10^9\sigma/\epsilon_r$, and $\sigma/\omega\epsilon = f_c/f$.`, md`At $f_2$, $\sigma/\omega\epsilon = ${t.LT}$: use $\alpha = k\sqrt{\tfrac12(\sqrt{1 + (\sigma/\omega\epsilon)^2} - 1)}$ with $k = \omega\sqrt{\epsilon_r}/c$.`],
      sol: md`
        **Step 1: the crossover.** $f_c = 18\times10^9\sigma/\epsilon_r = ${frX(fc)}$. Since $\sigma/\omega\epsilon$ goes as $1/f$, the loss tangent at any $f$ is $f_c/f$:
        $$\frac{f_c}{f_1} = ${p(p1)}, \quad \frac{f_c}{f_2} = ${t.LT}, \quad \frac{f_c}{f_3} = ${p(1 / p3)}$$
        So $f_1$ is a good conductor, $f_2$ is in between, and $f_3$ is an imperfect dielectric.

        **Step 2: δ at f₁ (good conductor).**
        $$\delta = \frac{1}{\sqrt{\pi f_1\mu_0\sigma}} = ${lenX(d1)}$$
        **Step 3: α at f₂ (exact).** $k = \omega\sqrt{\epsilon_r}/c = ${f(k2)}$ rad/m, and the triangle gives $\sqrt{1 + (${t.LT})^2} = ${t.hT}$:
        $$\alpha = k\sqrt{\tfrac12\left(${t.hT} - 1\right)} = ${f(a2)}\ \text{Np/m}$$
        The good-conductor line would give $${f(gc2)}$ and the dielectric line $${f(k2 * t.L / 2)}$: both are off.

        **Step 4: f₃ (imperfect dielectric).** $\eta_i = 120\pi/${p(n)} = ${f(ei)}\ \Omega$:
        $$\alpha = \frac{\sigma\eta_i}{2} = ${f(a3)}\ \text{Np/m}$$
        $$\beta = \frac{\omega\sqrt{\epsilon_r}}{c} = ${f(k3)}\ \text{rad/m}$$
        **What the three tell you.** $\alpha$ grows with frequency (as $\sqrt f$ in the conductor range) and levels off at $\sigma\eta_i/2 = ${f(a3)}$ Np/m in the low-loss range. It can never exceed that ceiling.

        **Where points go.** Using one set of formulas for all three frequencies. The regime belongs to the frequency, not to the material.
      `,
    };
  };

  // ---------------------------------------------------------------- Topic 7 question bank
  EM.BANK['w2-limits'] = [
    Q(md`Using the binomial approximation, $\sqrt{1.02}$ is about…`, ['1.01', '1.02', '1.04', '1.001'], 0,
      [null, md`That forgot the square root: $\sqrt{1 + u} \approx 1 + u/2$.`, md`That squared instead of taking the root.`, md`That divided $u$ by 20, not by 2.`],
      md`$\sqrt{1 + u} \approx 1 + u/2 = 1 + 0.01$.`),
    Q(md`$1/\sqrt{1 - j0.04}$ is about…`, [md`$1 + j0.02$`, md`$1 - j0.02$`, md`$1 + j0.04$`, md`$1 - j0.04$`], 0,
      [null, md`That is $\sqrt{1 - j0.04}$. The inverse root flips the sign: $1 - u/2$ with $u = -j0.04$.`, md`That forgot the $\tfrac12$.`, md`That is the number itself, with no root and no inverse.`],
      md`$1/\sqrt{1 + u} \approx 1 - u/2$, and $u = -j0.04$ gives $1 + j0.02$. This is why $\eta \approx \eta_i(1 + j\sigma/2\omega\epsilon)$.`),
    Q(md`$\sqrt j$ (the root with a positive real part) is…`, [md`$(1 + j)/\sqrt2$`, md`$(1 + j)/2$`, md`$1 + j$`, md`$j/\sqrt2$`], 0,
      [null, md`Its square is $2j/4 = j/2$.`, md`Its square is $2j$.`, md`Its square is $-1/2$.`],
      md`$(1 + j)^2 = 2j$, so $\sqrt j = (1 + j)/\sqrt2 = e^{j45°}$.`),
    Q(md`In a good conductor, the angle of $\gamma$ is about…`, ['$45°$', '$90°$', '$0°$', '$22.5°$'], 0,
      [null, md`$90°$ is a lossless wave, $\gamma = j\beta$.`, md`$0°$ would mean no propagation at all, only decay.`, md`$22.5°$ is half of what $\sqrt j$ gives.`],
      md`$\gamma \approx \sqrt{j\omega\mu\sigma}$, and $\sqrt j$ has angle $45°$: $\alpha = \beta$.`),
    Q(md`In an imperfect dielectric, which of these differs most from its lossless value?`, ['$\\alpha$', '$\\beta$', '$|\\eta|$', '$v_p$'], 0,
      [null, md`$\beta \approx \omega\sqrt{\mu\epsilon}$, unchanged to first order.`, md`$|\eta| \approx \eta_i$, unchanged to first order.`, md`$v_p = \omega/\beta$ is unchanged because $\beta$ is.`],
      md`$\alpha$ goes from exactly 0 to $\sigma\eta_i/2$. Everything else changes only at second order.`),
    Q(md`Copper's skin depth is about 66 µm at 1 MHz. At 4 MHz it is about…`, ['33 µm', '16.5 µm', '132 µm', '66 µm'], 0,
      [null, md`That divides by 4, as if $\delta \propto 1/f$.`, md`A higher frequency makes the skin thinner, not thicker.`, md`$\delta$ depends on $f$.`],
      md`$\delta \propto 1/\sqrt f$: divide by $\sqrt4 = 2$.`),
    Q(md`Two good conductors at one frequency: $\sigma_2 = 4\sigma_1$. Then $\delta_2/\delta_1$ is…`, ['$1/2$', '$1/4$', '$2$', '$1$'], 0,
      [null, md`$\sigma$ is under a square root.`, md`A better conductor has a thinner skin.`, md`$\delta$ depends on $\sigma$.`],
      md`$\delta \propto 1/\sqrt\sigma$, and $\sqrt4 = 2$.`),
    Q(md`In a good conductor at fixed $\sigma$, the frequency is multiplied by 4. Then $|\eta|$…`, ['doubles', 'quadruples', 'halves', 'stays the same'], 0,
      [null, md`$|\eta| = \sqrt{\omega\mu/\sigma}$: $\omega$ is under a root.`, md`$\omega$ is in the numerator.`, md`$|\eta|$ has $\omega$ in it.`],
      md`$|\eta| \propto \sqrt\omega$, and $\sqrt4 = 2$.`),
    Q(md`A good conductor has $\gamma = 200(1 + j)$ 1/m. Its skin depth is…`, ['5 mm', '200 m', '2.5 mm', '7.1 mm'], 0,
      [null, md`That is $\alpha$ read as a length. $\delta = 1/\alpha$.`, md`That divides by $|\gamma|$ twice over. $\delta = 1/\alpha = 1/200$ m.`, md`That uses $|\gamma| = 200\sqrt2$ the wrong way. $\delta$ comes from $\alpha$ alone.`],
      md`$\alpha = 200$ Np/m, so $\delta = 1/200$ m $= 5$ mm.`),
    Q(md`A good conductor has $\gamma = 200(1 + j)$ 1/m at $\omega = 10^6$ rad/s. Its phase speed is…`, ['$5000$ m/s', '$2\\times10^8$ m/s', '$10^4$ m/s', '$3\\times10^8$ m/s'], 0,
      [null, md`That multiplies $\omega$ by $\beta$.`, md`That is the group velocity, $2v_p$.`, md`That is $c$.`],
      md`$v_p = \omega/\beta = 10^6/200 = 5000$ m/s.`),
    Q(md`At a depth of $3\delta$ in a good conductor, the fraction of the surface amplitude left is about…`, ['5%', '0.25%', '33%', '0.1%'], 0,
      [null, md`That is the power fraction, $e^{-6}$.`, md`The fall is exponential, not $1/3$.`, md`That used $10^{-3}$: base 10 in place of $e$.`],
      md`$e^{-3} \approx 0.05$.`),
    Q(md`At a depth of one $\delta$, the fraction of the surface **power** left is about…`, ['13.5%', '37%', '50%', '0%'], 0,
      [null, md`37% is the amplitude. Power is the amplitude squared.`, md`Half the power is lost at $0.35\delta$, not at $\delta$.`, md`The decay is exponential; it never reaches zero.`],
      md`$e^{-2} \approx 0.135$.`),
    Q(md`Which of these is a good conductor at 1 MHz?`, [md`Seawater: $\sigma = 4$ S/m, $\epsilon_r = 81$`, md`Distilled water: $\sigma = 10^{-4}$ S/m, $\epsilon_r = 81$`, md`Dry soil: $\sigma = 10^{-3}$ S/m, $\epsilon_r = 4$`, md`Glass: $\sigma = 10^{-12}$ S/m, $\epsilon_r = 5$`], 0,
      [null, md`$\sigma/\omega\epsilon = 2.2\times10^{-5}$: a low-loss dielectric.`, md`$\sigma/\omega\epsilon = 4.5$: in between.`, md`Its loss tangent is about $4\times10^{-9}$.`],
      md`Seawater: $(18\times10^9)(4)/(81\times10^6) \approx 890 \gg 10$.`),
    Q(md`An imperfect dielectric has $\eta_i = 100\ \Omega$ and $\alpha = 0.05$ Np/m. Its $\sigma$ is…`, ['$10^{-3}$ S/m', '$5\\times10^{-4}$ S/m', '$2.5$ S/m', '$5$ S/m'], 0,
      [null, md`That forgot the 2: $\sigma = 2\alpha/\eta_i$.`, md`That multiplied by $\eta_i$ and divided by 2.`, md`That multiplied by $\eta_i$.`],
      md`$\alpha = \sigma\eta_i/2$, so $\sigma = 2(0.05)/100 = 10^{-3}$ S/m.`),
    Q(md`Why may you not use the good-conductor lines at $\sigma/\omega\epsilon = 1$?`, ['They drop $\\omega\\epsilon$, which there is as large as $\\sigma$', 'They need $\\mu = \\mu_0$', 'They hold only below 1 kHz', 'They give $\\tau = 0$'], 0,
      [null, md`$\mu$ can be anything; the approximation is about $\sigma$ versus $\omega\epsilon$.`, md`The test is the loss tangent, not the frequency alone.`, md`They give $\tau = 45°$.`],
      md`$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$; dropping $j\omega\epsilon$ is only fair when it is much smaller than $\sigma$. At a ratio of 1 the conductor line is 55% off in $\alpha$.`),
    Q(md`Copper at 1 MHz has $\sigma\delta \approx 3800$ S. Its surface resistance $R_s = \Re\{\eta\}$ is about…`, ['$2.6\\times10^{-4}\\ \\Omega$', '$3.7\\times10^{-4}\\ \\Omega$', '$3800\\ \\Omega$', '$377\\ \\Omega$'], 0,
      [null, md`That is $|\eta| = \sqrt2/\sigma\delta$. The real part is $1/\sigma\delta$.`, md`That is $\sigma\delta$, upside down.`, md`That is $\eta_0$.`],
      md`$R_s = 1/\sigma\delta = 1/3800 \approx 2.6\times10^{-4}\ \Omega$.`),
    Q(md`Seawater's crossover is $f_c \approx 0.89$ GHz. At 89 MHz its loss tangent is about…`, ['10', '0.1', '1', '100'], 0,
      [null, md`The ratio goes as $1/f$; a lower frequency gives a larger ratio.`, md`That is the value at $f_c$ itself.`, md`That would be at 8.9 MHz.`],
      md`$\sigma/\omega\epsilon = f_c/f = 0.89\ \text{GHz}/89\ \text{MHz} = 10$: the edge of the good-conductor range.`),
    Q(md`In a good conductor, $H$ lags $E$ by…`, ['an eighth of a period', 'a quarter of a period', 'half a period', 'nothing'], 0,
      [null, md`A quarter period is $90°$. $\tau = 45°$.`, md`Half a period would reverse the power flow.`, md`That is a lossless medium.`],
      md`$\tau = 45° = 360°/8$.`),
    Q(md`In an imperfect dielectric, the group velocity is…`, ['about equal to $v_p$', 'twice $v_p$', 'half of $v_p$', 'zero'], 0,
      [null, md`$v_g = 2v_p$ is the good-conductor result, where $\beta \propto \sqrt\omega$.`, md`Nothing gives half here.`, md`Signals do travel.`],
      md`$\beta \approx \omega\sqrt{\mu\epsilon}$ is proportional to $\omega$, so $d\omega/d\beta = \omega/\beta$.`),
    Q(md`To double the depth a signal reaches in seawater, the frequency must be…`, ['divided by 4', 'divided by 2', 'multiplied by 2', 'divided by $\\sqrt2$'], 0,
      [null, md`$\delta \propto 1/\sqrt f$: halving $f$ only gains $\sqrt2$.`, md`A higher frequency reaches less deep.`, md`That gains only $2^{1/4}$.`],
      md`Depth $\propto\delta\propto1/\sqrt f$; doubling it needs $f/4$.`),
    Q(md`The intrinsic impedance of a perfect electric conductor is…`, ['$0$', '$\\infty$', '$\\eta_0$', '$(1 + j)\\ \\Omega$'], 0,
      [null, md`Upside down: $|\eta| = \sqrt{\omega\mu/\sigma} \to 0$.`, md`That is free space.`, md`That still has a finite $\sigma\delta = 1$ S.`],
      md`$|\eta| = \sqrt{\omega\mu/\sigma} \to 0$ as $\sigma \to \infty$: no tangential $E$ at a PEC.`),
    Q(md`After one wavelength inside a good conductor, the amplitude is about…`, ['0.2% of its start', '37% of its start', '4% of its start', 'unchanged'], 0,
      [null, md`37% is after one $\delta$; a wavelength is $2\pi\delta$.`, md`4% is after half a wavelength, $\pi\delta$.`, md`It decays by $e^{-\alpha\lambda}$.`],
      md`$\lambda = 2\pi\delta$, so $e^{-2\pi} \approx 0.0019$.`),
    Q(md`A material has $\alpha = 0.4$ Np/m at a frequency where it is low-loss. At a much lower frequency, where it is a good conductor, $\alpha$ is…`, ['smaller than 0.4 Np/m', 'larger than 0.4 Np/m', 'still 0.4 Np/m', 'zero'], 0,
      [null, md`$\alpha$ grows with $f$ and levels off at $\sigma\eta_i/2$; going down in frequency lowers it.`, md`The flat value holds only in the low-loss range.`, md`Any $\sigma$ gives some decay.`],
      md`In the conductor range $\alpha = \sqrt{\pi f\mu\sigma}$ grows as $\sqrt f$, up to the ceiling $\sigma\eta_i/2$ reached in the low-loss range.`),
  ];
})();

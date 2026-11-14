/* Endless exam problems (unit e3-prac, lesson e3-endless). Every Exam 3 problem type as a generator: one full exam-size
   problem per card, new clean no-calculator numbers on every press, a slow worked solution with every step, a Speed path
   and a Where-points-go line. Generator prefix ex_ (full problems only).
     ex_goodcond   a good conductor from its skin depth or from sigma and f: gamma, sigma or delta, depth, eta, <S>, a statement
     ex_lossyread  read a lossy wave E(z,t) or H(z,t): alpha, beta, |eta|, tau, sigma, eps_r, lambda and the other field
     ex_regime     loss tangent from sigma, eps_r and f; which regime; alpha, skin depth, lambda, |eta|; a frequency change
     ex_pol        polarization and hand of a given E or H (time or phasor form, any axis, either direction)
     ex_twosheets  two current sheets with a spacing and a phase: each region's field, polarization or cancellation, power
     ex_interface  normal incidence on a dielectric: Gamma, tau, fields, power fractions, standing-wave ratio
     ex_pec        a perfect conductor: total fields, nulls, surface current, radiation pressure, statements
     ex_coax       coax and parallel-plate lines: L, C, Z0, v, GF, from the geometry or backwards from Z0 and v
     ex_bounce     one line, a step or a short pulse: tau_g, Gamma_g, Gamma_L, V and I at a point, steady state
     ex_twoline    two lines in series (the Spring 2024 #4 type): junction coefficients, V at a point, steady state
     ex_scope      a scope trace read backwards: eps_r, Gamma_L, R_L, R_g, the pulse height, the next pulse
     ex_stub       shorted and open stubs: the resonances, Z_in at a frequency, L or C, where no current flows
     ex_qw         quarter- and half-wave sections with a source: Z_in, V_in, power to the load, |V_L|
     ex_vd         V(d) on a line: Gamma_L, VSWR, Z(d) at multiples of lambda/8, |V|max, where the maxima sit, power
   Every line value comes from TL.solve and TL.valueAt; every Gamma is a clean fraction (R = Z0 x {0, 1/3, 1/2, 2, 3, inf}).
   Samples were recomputed independently in Python (work-gen2/check_*.py on dump.js output). */
(function () {
  'use strict';
  const { R, G } = C;
  const { f, p, N } = EM;
  const { pick, shuffle } = U;
  const PI = Math.PI;
  // a short decimal for whole numbers and quarters (37.5, 0.25), else a small fraction (\tfrac{50}{3}), else 3 s.f.
  const fr = (x) => (isFinite(x) && Math.abs(x * 4 - Math.round(x * 4)) < 1e-9 * Math.max(1, Math.abs(x)) ? p(Math.round(x * 4) / 4) : TL.frac(x));

  // ---------------------------------------------------------------- helpers
  const near = (a, b) => Math.abs(a - b) <= 0.03 * Math.max(Math.abs(a), Math.abs(b)) + 1e-12;
  // a numeric part with known slips; a trap within 3% of the answer (or of another trap) is dropped
  const NT = (lbl, ans, unit, traps = []) => {
    const part = N(lbl, ans, unit);
    const seen = [];
    const keep = traps.filter(([v]) => isFinite(v) && Math.abs(v) > 1e-15 && !near(v, ans) && !seen.some((s) => near(s, v)) && seen.push(v));
    if (keep.length) part.traps = keep.map(([v, msg]) => ({ v, msg }));
    return part;
  };
  // a multiple-choice part: right option first (the site shuffles), then up to n distinct wrong options
  const MCP = (lbl, right, wrongs, n = 3) => {
    const seen = new Set([right]), keep = [];
    for (const [o, w] of wrongs) if (o && !seen.has(o)) { seen.add(o); keep.push([o, w]); }
    const all = [[right, null], ...shuffle(keep).slice(0, n)];
    return { lbl, mc: all.map((x) => x[0]), a: 0, why: all.map((x) => x[1]) };
  };
  const AX = ['x', 'y', 'z'];
  // signed axes [index, sign]; cross product of two of them
  const cross = ([i, si], [j, sj]) => [3 - i - j, si * sj * ((j - i + 3) % 3 === 1 ? 1 : -1)];
  const hv = ([i, s]) => `${s < 0 ? '-' : '+'}\\hat ${AX[i]}`;          // "+\hat x"
  const hvs = ([i, s]) => `${s < 0 ? '-' : ''}\\hat ${AX[i]}`;          // "\hat x" or "-\hat x"
  const norm180 = (d) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return x; };
  const dg = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? `${Math.round(x)}°` : `${f(x)}°`);
  const phT = (x) => (Math.abs(x) < 1e-9 ? '' : x > 0 ? ` + ${dg(x)}` : ` - ${dg(-x)}`);   // " + 30°"
  const sgnT = (x) => (x < 0 ? '-' : '+');
  const piT = (k) => (k === 1 ? '\\pi ' : `${p(k)}\\pi `);              // 2 -> "2\pi " (the space keeps "\pi y" apart)
  const deg = PI / 180;
  const EPS0 = 1e-9 / (36 * PI);                                         // the course's epsilon_0

  // ======================================================================================== the lesson
  const sec = (n, title, body, gen) => [R(md`
    ### ${n}. ${title}

    ${body}
  `), Object.assign(G(gen, { need: 2 }), { id: `e3-endless.${gen}` })];

  const SECTIONS = [
    ['A good conductor', md`**On the exam:** "a wave travels in a good conductor with penetration depth $\delta = 1$ mm" (Spring 2024 #2). You give $\gamma$, an amplitude at a depth, $\eta$, the power, and judge statements about $\mathbf S$. Review: [Topic 7](#/l/w2-limits), [Topic 8](#/l/w2-loss).`, 'ex_goodcond'],
    ['Reading a lossy wave', md`**On the exam:** "$\mathbf E = 3e^{-3x}\cos(\omega t - 4x + 60°)\,\hat z$; find $\gamma$, $\eta$, $\sigma$, $\epsilon$ and $\mathbf H$" (Spring 2017 #3, Spring 2019 #1). Review: [Topic 5](#/l/w2-gamma), [Topic 6](#/l/w2-read).`, 'ex_lossyread'],
    ['Which regime?', md`**On the exam:** a material and a frequency; first decide whether it is a good conductor, a low-loss dielectric or neither, then use the right line of the sheet. Review: [Topic 7](#/l/w2-limits).`, 'ex_regime'],
    ['Polarization and hand', md`**On the exam:** "identify the polarization of $\mathbf H = \hat x A\cos(\omega t - kz) + \hat y B\cos(\omega t - kz + \phi)$" (Fall 2023 #2, Spring 2018 (iii)–(iv)). Review: [Topic 9](#/l/w3-pol).`, 'ex_pol'],
    ['Two current sheets', md`**On the exam:** "two sheets at $z = 0$ and $z = 0.5$ m carry $\mathbf J_s = -2\hat x$; write $\tilde{\mathbf E}$ and $\tilde{\mathbf H}$ in every region" (Spring 2024 #1), or crossed sheets designed for a circular wave. Review: [Topic 10](#/l/w3-antenna).`, 'ex_twosheets'],
    ['A wave hits a dielectric', md`**On the exam:** "the transmitted field is $10e^{-j12y}\hat z$; find $\Gamma$, $\tau$ and the incident and reflected fields" (Spring 2018 #2). Review: [Topic 11](#/l/w4-gamma), [Topic 12](#/l/w4-standing).`, 'ex_interface'],
    ['A perfect conductor', md`**On the exam:** a wave hits a perfect conductor: the total field, where it vanishes, the surface current, the pressure, and statements about standing waves (Fall 2023 #1(c)–(d), Spring 2019 #3). Review: [Topic 11](#/l/w4-gamma), [Topic 12](#/l/w4-standing).`, 'ex_pec'],
    ['Coax and parallel plates', md`**On the exam:** "given $\mathcal C = 2\pi\epsilon/\ln(b/a)$, find $\mathcal L$, $Z_0$ and $v_p$" (Spring 2024 #3), or a parallel-plate line from its fields. Review: [Topic 13](#/l/w5-telegraph).`, 'ex_coax'],
    ['One line: the bounce diagram', md`**On the exam:** "$R_g$, $Z_0$, $R_L$, length and speed given; compute $\tau_g$, $\Gamma_g$, $\Gamma_L$, draw the bounce diagram, plot $V$ at one end" (Spring 2018 #3, Spring 2017 #5, Fall 2023 #5). Review: [Topic 14](#/l/w5-launch), [Topic 15](#/l/w5-bounce).`, 'ex_bounce'],
    ['Two lines in series', md`**On the exam:** Prof. Chen's 34-point problem: "two lines of length $l/2$, $Z_{01} = 150\ \Omega$ and $Z_{02} = 50\ \Omega$; complete the bounce diagram, find $V$ at $z = 100$ m, and the DC current" (Spring 2024 #4). Review: [Topic 16](#/l/w5-multi).`, 'ex_twoline'],
    ['A scope trace, backwards', md`**On the exam:** "a delta pulse with unknown $R_g$ and $R_L$; pulses of heights $A$ and $A/2$ at 1 µs and 3 µs; find $R_g$, $R_L$, $A$ and $\epsilon_r$" (Fall 2023 #4, Spring 2017 (v)–(vi)). Review: [Topic 16](#/l/w5-multi).`, 'ex_scope'],
    ['Stubs and resonance', md`**On the exam:** "a shorted line's lowest series resonance is $\omega_0$; at $2\omega_0$ and $\omega_0/2$ is $Z_{in}$ zero, infinite, inductive or capacitive?" (Spring 2018 (ix)–(x), Fall 2023 #7, Spring 2017 #6). Review: [Topic 18](#/l/w6-stubs).`, 'ex_stub'],
    ['Quarter- and half-wave sections', md`**On the exam:** "$Z_L = 100\ \Omega$ on a $\lambda/4$ line of $50\ \Omega$ behind a $50\ \Omega$ source: find $Z_{in}$ and $\tilde V_{in}$" (Spring 2018 #4b). Review: [Topic 19](#/l/w6-qw).`, 'ex_qw'],
    ['Γ(d), VSWR and Z(d)', md`**On the exam:** older papers ask for $\Gamma(d)$, the VSWR, $Z$ at a distance and where the voltage peaks (Spring 2018 (vi)); the formula sheet has all of it. Review: [Topic 17](#/l/w6-vd).`, 'ex_vd'],
  ];

  EM.lesson('e3-prac', {
    id: 'e3-endless', order: 20, title: 'Endless exam problems', kind: 'review',
    sub: 'Every exam problem type, new numbers every time',
    steps: [
      R(md`
        !!key How to use this page
          Each card below is **one full exam problem**, the size of a problem on Prof. Chen's paper, with **fresh numbers every time** you press **New problem**. The numbers are chosen to work without a calculator, as they will on Monday.

        1. **Work it on paper first.** No calculator, no notes except what will be on your 4×6 card. Write every step you would write on the exam.
        2. **Then type your answers.** You can type arithmetic: <code>120*pi/3</code>, <code>10*exp(-2)</code>, <code>2/3</code>. Answers within about 2% count.
        3. **Then read the solution**, even when you were right. It goes slowly, one step at a time, and ends with a **Speed path** (how to get there in 30 seconds) and **Where points go** (the slips that cost points).

        Two correct cards in a section, without opening the solution, complete it. A missed card is the best kind: press **New problem** and do the same type again the next day.

        Each section opens with how the problem is worded on real exams and which lesson to review if it goes badly.
      `),
      ...SECTIONS.flatMap(([title, body, gen], k) => sec(k + 1, title, body, gen)),
    ],
  });

  // ======================================================================================== 1. good conductor
  const STATEMENTS = (K) => ({
    right: [
      [md`$\langle S\rangle$ decreases as the wave travels along $+\hat ${K}$`, md`The amplitude goes as $e^{-\alpha ${K}}$, so $\langle S\rangle$ goes as $e^{-2\alpha ${K}}$: it falls as the wave goes.`],
      [md`$H$ lags $E$ by $45°$ in time at every point`, md`In a good conductor $\tau \approx 45°$, and $\tilde H = \tilde E/\eta$ subtracts that angle from the phase of $E$.`],
      [md`$-\nabla\cdot\langle\mathbf S\rangle$ equals the time-averaged power per unit volume turned into heat`, md`Poynting's theorem averaged over a period: the stored energy does not grow on average, so the power that flows out of a small volume is negative exactly by the heat made in it, $\langle\mathbf J\cdot\mathbf E\rangle$.`],
      [md`The wavelength in the conductor is $2\pi\delta$`, md`$\beta = \alpha = 1/\delta$, so $\lambda = 2\pi/\beta = 2\pi\delta$.`],
    ],
    wrong: [
      [md`$|\langle\mathbf S\rangle| = E_0^2/(2\eta_0)$ at the surface`, md`$\eta_0$ belongs to free space. Inside the conductor $\langle S\rangle = E_0^2\cos\tau/(2|\eta|)$, with a tiny $|\eta|$ and $\cos 45°$.`],
      [md`$\nabla\cdot\langle\mathbf S\rangle$ equals the time-averaged power per unit volume turned into heat`, md`The sign is wrong. $\langle\mathbf S\rangle$ shrinks along the travel, so $\nabla\cdot\langle\mathbf S\rangle < 0$; the heat is $-\nabla\cdot\langle\mathbf S\rangle$.`],
      [md`$-\nabla\cdot\mathbf S$ equals the rate of increase of the stored energy density`, md`Poynting's theorem has a third term: $-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$. In a conductor $\mathbf J\cdot\mathbf E$ (the heat) is the big one.`],
      [md`$\langle S\rangle$ would increase if the wave traveled along $-\hat ${K}$ instead`, md`Every wave in a lossy material shrinks in the direction it travels. Reversing the travel reverses the decay.`],
      [md`$E$ and $H$ are in phase`, md`That is a lossless medium. Here $\eta$ has angle $\tau = 45°$, so $H$ lags $E$ by $45°$.`],
      [md`The amplitude falls to $1/e$ over one wavelength`, md`It falls to $1/e$ over one skin depth, $\delta = \lambda/2\pi$. Over a whole wavelength it falls by $e^{-2\pi} \approx 1/535$.`],
      [md`The phase velocity is $c$`, md`$v_p = \omega/\beta = \omega\delta$, far below $c$ in a good conductor.`],
    ],
  });
  // sigma, f, eps_r with f*sigma = 1e7 n^2, so alpha = 2 pi n exactly
  const METALS = [
    { sig: 4, fq: 2.5e6, er: 81, what: 'Seawater' }, { sig: 4, fq: 2.5e4, er: 81, what: 'Seawater' },
    { sig: 1e5, fq: 1e6, er: 1, what: 'A graphite block' }, { sig: 1e7, fq: 1e6, er: 1, what: 'A metal' },
    { sig: 4e7, fq: 2.5e5, er: 1, what: 'A metal' }, { sig: 0.01, fq: 1e3, er: 10, what: 'Wet soil' },
    { sig: 1e6, fq: 1e7, er: 1, what: 'A metal alloy' },
  ];
  const fTex = (x) => (x >= 1e9 ? `${p(x / 1e9)}\\ \\text{GHz}` : x >= 1e6 ? `${p(x / 1e6)}\\ \\text{MHz}` : x >= 1e3 ? `${p(x / 1e3)}\\ \\text{kHz}` : `${p(x)}\\ \\text{Hz}`);

  GENS.ex_goodcond = () => {
    const k = pick([0, 1, 2]), e = (k + pick([1, 2])) % 3, h = cross([k, 1], [e, 1]);
    const K = AX[k], Ee = AX[e];
    const E0 = pick([5, 10, 20]);
    const giveD = Math.random() < 0.55;
    let d, fq, sig, setup, mat;
    if (giveD) {
      d = pick([0.5, 1, 2]) * 1e-3; fq = pick([1e5, 1e6, 1e7]);
      sig = 2 / (2 * PI * fq * EM.mu0 * d * d);
      setup = md`with penetration (skin) depth $\delta = ${p(d * 1e3)}$ mm at $f = ${fTex(fq)}$`;
    } else {
      mat = pick(METALS); fq = mat.fq; sig = mat.sig;
      d = 1 / Math.sqrt(PI * fq * EM.mu0 * sig);
      setup = md`in a material with $\sigma = ${p(sig)}$ S/m, $\epsilon_r = ${mat.er}$ and $\mu = \mu_0$, at $f = ${fTex(fq)}$`;
    }
    const a = 1 / d, wm = 2 * PI * fq * EM.mu0, eta = wm * d / Math.SQRT2;
    const m = pick([2, 3]), x1 = m * d, amp = E0 * Math.exp(-m);
    const S0 = E0 * E0 / (2 * wm * d), ratio = Math.exp(-2 * m);
    const n = giveD ? 0 : Math.sqrt(fq * sig * 1e-7);         // alpha = 2 pi n
    const st = STATEMENTS(K);
    const [rt, rWhy] = pick(st.right);
    const stPart = MCP('Which statement about this wave is true?', rt, st.wrong.map(([o, w]) => [o, w]));
    const xTex = giveD ? `${p(x1 * 1e3)}\\ \\text{mm}` : `${m}\\delta`;
    const lt = giveD ? 0 : 18e9 * sig / (fq * mat.er);
    const parts = [
      NT('\\alpha', a, 'Np/m', giveD ? [[d, 'That is δ itself, in meters. α = 1/δ.'], [1 / (d * 1e3), 'That used δ in millimeters. Convert to meters first: α = 1/δ in 1/m.'], [2 * a, 'No factor of 2: α = 1/δ.']] : [[PI * fq * EM.mu0 * sig, 'That is πfμσ. α is its square root.'], [Math.sqrt(fq * EM.mu0 * sig), 'That dropped the π: α = √(πfμσ).'], [Math.sqrt(2 * PI * fq * EM.mu0 * sig), 'That is √(ωμσ), missing the 1/2 under the root: α = √(ωμσ/2).']]),
      giveD
        ? NT('\\sigma', sig, 'S/m', [[1 / (wm * d * d), 'Missing the factor 2: α² = ωμσ/2 gives σ = 2/(ωμδ²).'], [2 / (fq * EM.mu0 * d * d), 'That used f where ω = 2πf belongs.'], [4 / (wm * d * d), 'That doubled once too often: σ = 2α²/(ωμ).']])
        : NT('\\delta', d, 'm', [[a, 'That is α. The skin depth is 1/α.'], [2 * PI * d, 'That is the wavelength 2πδ, not δ.']]),
      NT(`|\\mathbf E|\\ \\text{at}\\ ${K} = ${xTex}`, amp, 'V/m', [[E0 * Math.exp(-2 * m), 'That is the power factor e^{-2αx}. The field amplitude goes as e^{-αx}.'], [E0, 'The amplitude decays: multiply by e^{-αx}.'], [E0 * Math.exp(-m / 2), 'αx = ' + m + ', not ' + m / 2 + '.']]),
      NT('|\\eta|', eta, 'Ω', [[wm * d, 'That is ωμδ. Divide by √2: |η| = √(ωμ/σ) = ωμδ/√2.'], [120 * PI, 'That is η₀ of free space. A good conductor has a tiny |η|.'], [wm * d / 2, 'That is the real part of η = (1 + j)ωμδ/2. The size has √2 in it.']]),
      NT(`\\langle S\\rangle(${K} = ${xTex})\\,/\\,\\langle S\\rangle(0)`, ratio, '', [[Math.exp(-m), 'That is the field ratio. Power goes as the field squared: e^{-2αx}.']]),
      NT('\\langle S\\rangle\\ \\text{at}\\ ' + K + ' = 0', S0, 'W/m^2', [[E0 * E0 / (2 * eta), 'That dropped cos τ = cos 45°. ⟨S⟩ = E₀² cos τ/(2|η|).'], [E0 * E0 / (2 * 120 * PI), 'That used η₀. Inside the conductor use |η|.'], [E0 * E0 / eta, 'That dropped both the 1/2 and cos 45°.']]),
      stPart,
    ];
    const etaT = f(eta);
    const s1 = giveD ? md`
        **Step 1: what "good conductor" buys you.** In a good conductor the conduction current dwarfs the displacement current, $\sigma/\omega\epsilon \gg 1$. The last line of the sheet then gives
        $$\alpha \approx \beta \approx \sqrt{\omega\mu\sigma/2}$$
        The penetration depth $\delta$ is the distance over which the amplitude falls by $1/e$. Since the amplitude goes as $e^{-\alpha ${K}}$, that distance is
        $$\delta = \frac{1}{\alpha}$$

        **Step 2: $\gamma$.** Turn it around. Convert $\delta$ to meters first:
        $$\alpha = \frac{1}{\delta} = \frac{1}{${p(d)}\ \text{m}}$$
        $$\boxed{\alpha = ${p(a)}\ \text{Np/m}}$$
        In a good conductor $\beta = \alpha$, so
        $$\gamma = \alpha + j\beta = ${p(a)}(1 + j)\ \text{m}^{-1}$$

        **Step 3: $\sigma$.** Square $\alpha = \sqrt{\omega\mu\sigma/2}$:
        $$\alpha^2 = \frac{\omega\mu\sigma}{2}$$
        Solve for $\sigma$:
        $$\sigma = \frac{2\alpha^2}{\omega\mu}$$
        You need $\omega\mu$. With $\omega = 2\pi f$ and $\mu_0 = 4\pi\times10^{-7}$:
        $$\omega\mu = (2\pi)(${p(fq)})(4\pi\times10^{-7})$$
        $$\omega\mu = ${f(wm)}\ \Omega/\text{m}$$
        Now substitute:
        $$\sigma = \frac{2(${p(a)})^2}{${f(wm)}}$$
        $$\boxed{\sigma = ${f(sig)}\ \text{S/m}}$$
      ` : md`
        **Step 1: check the regime.** Compare the two currents with the loss tangent. With $\omega\epsilon = 2\pi f\epsilon_r\epsilon_0 = 2\pi f\epsilon_r/(36\pi\times10^9) = f\epsilon_r/(18\times10^9)$:
        $$\frac{\sigma}{\omega\epsilon} = \frac{18\times10^9\,\sigma}{f\,\epsilon_r} = ${f(lt)}$$
        That is $\gg 1$: a good conductor. The last line of the sheet applies:
        $$\alpha \approx \beta \approx \sqrt{\omega\mu\sigma/2} = \sqrt{\pi f\mu\sigma}$$
        (the second form because $\omega/2 = \pi f$).

        **Step 2: $\alpha$.** Put in the numbers. $\mu_0 = 4\pi\times10^{-7}$, so $\pi f\mu_0\sigma = 4\pi^2 f\sigma\times10^{-7}$:
        $$\pi f\mu\sigma = 4\pi^2(${p(fq)})(${p(sig)})(10^{-7})$$
        $$\pi f\mu\sigma = 4\pi^2\,(${p(n * n)})$$
        The square root is easy:
        $$\boxed{\alpha = \beta = 2\pi(${p(n)}) = ${f(a)}\ \text{Np/m}}$$

        **Step 3: $\delta$.** The penetration depth is the distance over which the amplitude falls by $1/e$. The amplitude goes as $e^{-\alpha ${K}}$, so
        $$\delta = \frac{1}{\alpha} = \frac{1}{2\pi(${p(n)})}$$
        $$\boxed{\delta = ${f(d)}\ \text{m}}$$
      `;
    return {
      title: 'A good conductor',
      q: md`A plane wave linearly polarized along $\hat ${Ee}$ travels toward $+\hat ${K}$ ${setup}. It is launched by a current sheet at $${K} = 0$, and at $t = 0$ the field at $${K} = 0$ is $\mathbf E = ${E0}\,\hat ${Ee}$ V/m. Treat the material as a good conductor. Find $\alpha$, ${giveD ? md`the conductivity $\sigma$` : md`the penetration depth $\delta$`}, the field amplitude at $${K} = ${xTex}$, $|\eta|$, how much of the power density survives to that depth, the time-averaged power density at $${K} = 0$, and judge the statements.`,
      parts,
      hints: [md`Good conductor: $\alpha = \beta = 1/\delta = \sqrt{\pi f\mu\sigma}$, $\tau = 45°$, $|\eta| = \sqrt{\omega\mu/\sigma}$.`, md`$\langle S\rangle = \dfrac{E_0^2}{2|\eta|}\cos\tau\;e^{-2\alpha ${K}}$.`],
      sol: md`${s1}

        **Step 4: the amplitude at depth.** The amplitude is $E_0e^{-\alpha ${K}}$. At $${K} = ${xTex}$ the exponent is $\alpha ${K} = ${m}$:
        $$|\mathbf E| = ${E0}\,e^{-${m}}$$
        $$\boxed{|\mathbf E| \approx ${f(amp)}\ \text{V/m}}$$

        **Step 5: $\eta$.** In a good conductor the sheet gives $\tau = 45°$ and $|\eta| = \sqrt{\omega\mu/\sigma}$. Use $\sigma = 2\alpha^2/(\omega\mu)$ to write it with $\delta$:
        $$\frac{\omega\mu}{\sigma} = \frac{(\omega\mu)^2}{2\alpha^2} = \frac{(\omega\mu\delta)^2}{2}$$
        Take the square root:
        $$|\eta| = \frac{\omega\mu\delta}{\sqrt2}$$
        Substitute $\omega\mu = ${f(wm)}\ \Omega$/m and $\delta = ${f(d)}$ m:
        $$\boxed{|\eta| = ${etaT}\ \Omega,\quad \tau = 45°}$$
        **Check.** $\eta\gamma = j\omega\mu$: the sizes give $(\omega\mu\delta/\sqrt2)(\sqrt2/\delta) = \omega\mu$ ✓, and the angles $45° + 45° = 90°$ ✓.

        **Step 6: power.** For one traveling wave, $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$ with $\tilde H = \tilde E/\eta$. The two decays multiply, and the angle of $\eta$ leaves a $\cos\tau$:
        $$\langle S\rangle = \frac{E_0^2}{2|\eta|}\cos\tau\;e^{-2\alpha ${K}}$$
        At $${K} = 0$:
        $$\langle S\rangle = \frac{${E0}^2}{2(${etaT})}\cdot\frac{1}{\sqrt2}$$
        $$\boxed{\langle S\rangle(0) \approx ${f(S0)}\ \text{W/m}^2}$$
        It points along $+\hat ${K}$. The fraction left at $${K} = ${xTex}$:
        $$\frac{\langle S\rangle(${xTex})}{\langle S\rangle(0)} = e^{-2(${m})}$$
        $$\boxed{e^{-${2 * m}} \approx ${f(ratio)}}$$
        The field kept $e^{-${m}} \approx ${f(Math.exp(-m))}$ of itself; the power, its square.

        **Step 7: the statement.** True: ${rt}. ${rWhy}

        **The fields, for the record.** With $E(0,0) = ${E0}$ V/m the phase is $0$:
        $$E_${Ee} = ${E0}\,e^{-${K}/\delta}\cos(\omega t - ${K}/\delta)$$
        and $\mathbf H$ points along $\hat ${K}\times\hat ${Ee} = ${hvs(h)}$, lagging by $45°$:
        $$H = \frac{${E0}}{|\eta|}e^{-${K}/\delta}\cos(\omega t - \tfrac{${K}}{\delta} - 45°)$$

        **Speed path.** Write the good-conductor line once: $\alpha = \beta = 1/\delta = \sqrt{\pi f\mu\sigma}$, $\tau = 45°$, $|\eta| = \omega\mu\delta/\sqrt2$. Depth $m\delta$: field $\times e^{-m}$, power $\times e^{-2m}$. Power at the surface: $E_0^2/(2\omega\mu\delta)$, because $\cos45°/(2|\eta|) = 1/(2\omega\mu\delta)$.

        **Where points go.** $\delta$ left in millimeters. $f$ used where $\omega = 2\pi f$ belongs. $e^{-\alpha x}$ for the power instead of $e^{-2\alpha x}$. Forgetting $\cos\tau$, or using $\eta_0$, in $\langle S\rangle$. The sign in $-\nabla\cdot\langle\mathbf S\rangle$.
      `,
    };
  };

  // ======================================================================================== 2. read a lossy wave
  // [alpha, beta, k0 = omega/c]: eps_r = (beta^2 - alpha^2)/k0^2 is a whole number
  const LOSSY = [[1, 2, 1], [1, 3, 1], [2, 3, 1], [3, 4, 1], [3, 5, 2], [1, 3, 2], [6, 8, 2], [1, 5, 2], [4, 6, 2], [3, 6, 3]];
  GENS.ex_lossyread = () => {
    const [a, b, k0] = pick(LOSSY);
    const kk = pick([0, 1, 2]), s = pick([1, -1]), e = (kk + pick([1, 2])) % 3;
    const K = AX[kk], kh = [kk, s];
    const giveE = Math.random() < 0.6;
    const w = k0 * 3e8, wm = k0 * 120 * PI;
    const g = Math.hypot(a, b), ga = Math.atan2(b, a) / deg, tau = Math.atan2(a, b) / deg;
    const eta = wm / g, sig = 2 * a * b / wm, er = (b * b - a * a) / (k0 * k0), lam = 2 * PI / b;
    const ph = pick([0, 30, 45, 60, -30]);
    // the given field: E along +e (giveE) or H along +e; the other one follows from k x E = |eta| H
    let E0, H0, eh, hh, given, other, oph, oAmp, oDir;
    if (giveE) {
      const mm = pick([1, 2, 5]); E0 = 12 * PI * mm; H0 = E0 / eta;
      eh = [e, 1]; hh = cross(kh, eh);
      given = md`\mathbf E = ${p(12 * mm)}\pi\,e^{${s > 0 ? '-' : ''}${a}${K}}\cos(${p(k0 * 3)}\times10^8t ${sgnT(-s)} ${b}${K}${phT(ph)})\,\hat ${AX[e]}`;
      other = 'H'; oph = ph - tau; oAmp = H0; oDir = hh;
    } else {
      H0 = pick([0.5, 1, 2]); E0 = H0 * eta;
      hh = [e, 1]; eh = cross(hh, kh);
      given = md`\mathbf H = ${H0 === 1 ? '' : md`${p(H0)}\,`}e^{${s > 0 ? '-' : ''}${a}${K}}\cos(${p(k0 * 3)}\times10^8t ${sgnT(-s)} ${b}${K}${phT(ph)})\,\hat ${AX[e]}`;
      other = 'E'; oph = ph + tau; oAmp = E0; oDir = eh;
    }
    const dirOpts = [[1, 1], [1, -1], [2, 1], [2, -1], [0, 1], [0, -1]].map(([d, sg]) => [(kk + d) % 3, sg]);
    const dirWrong = dirOpts.filter((x) => !(x[0] === oDir[0] && x[1] === oDir[1])).map((x) => {
      const opt = `$${hvs(x)}$`;
      if (x[0] === oDir[0]) return [opt, md`That is the reverse. ${other === 'H' ? md`$\mathbf H$ must make $\mathbf E\times\mathbf H$ point along the travel, $${hv(kh)}$.` : md`$\mathbf E\times\mathbf H$ must point along the travel, $${hv(kh)}$; check it.`}`];
      if (x[0] === kk) return [opt, md`That is along the travel. A plane wave's fields are transverse: no component along $${hv(kh)}$.`];
      return [opt, md`That is parallel to the given field. $\mathbf E$ and $\mathbf H$ are perpendicular.`];
    });
    const tauTex = `\\tan^{-1}(${a}/${b}) \\approx ${dg(tau)}`;
    const arg = `\\omega t ${sgnT(-s)} ${b}${K}`;
    const parts = [
      NT('\\alpha', a, 'Np/m', [[b, 'That is β. α multiplies the position in the exponential decay.']]),
      NT('\\beta', b, 'rad/m', [[a, 'That is α. β multiplies the position inside the cosine.']]),
      NT('\\lambda', lam, 'm', [[2 * PI / a, 'That used α. The wavelength comes from β.'], [1 / b, 'Missing 2π: λ = 2π/β.']]),
      NT('|\\eta|', eta, 'Ω', [[120 * PI / Math.sqrt(er), 'That is the lossless η₀/√ε_r. With loss, |η| = ωμ/|γ|.'], [wm / b, 'That used β where |γ| = √(α² + β²) belongs.'], [wm * g, 'That multiplied: |η| = ωμ/|γ|.']]),
      NT('\\tau', tau, '°', [[ga, 'That is the angle of γ. The angle of η is 90° minus it.'], [2 * tau, 'That is tan⁻¹(σ/ωε), the angle of η². τ is half of it.']]),
      NT('\\sigma', sig, 'S/m', [[(b * b - a * a) / wm, 'That is ωε, the imaginary part of γ/η. σ is the real part.'], [a * b / wm, 'Missing the 2: the imaginary part of γ² is 2αβ.']]),
      NT('\\epsilon_r', er, '', [[(b * b) / (k0 * k0), 'That is β²/k₀², the lossless formula. With loss, ε comes from β² − α².'], [(b * b + a * a) / (k0 * k0), 'The real part of γ² is α² − β²; ε_r uses β² − α².']]),
      NT(`\\text{amplitude of}\\ ${other}\\ \\text{at the origin}`, oAmp, other === 'H' ? 'A/m' : 'V/m', [[other === 'H' ? E0 / (120 * PI) : H0 * 120 * PI, 'That used η₀. Use this medium\'s |η|.'], [other === 'H' ? E0 * eta : H0 / eta, other === 'H' ? 'H = E/|η|, not E·|η|.' : 'E = |η|H, not H/|η|.']]),
      NT(`\\text{phase of}\\ ${other}\\ \\text{(cosine reference)}`, oph, '°', [[other === 'H' ? ph + tau : ph - tau, other === 'H' ? 'H lags E: subtract τ.' : 'E leads H: add τ.'], [ph, 'The phases differ by τ, since η is complex.']]),
      MCP(md`Which way does $\mathbf ${other}$ point (when its cosine is positive)?`, `$${hvs(oDir)}$`, dirWrong),
    ];
    const sgnE = s > 0 ? '-' : '+';
    return {
      title: 'Reading a lossy wave',
      q: md`A uniform plane wave in a non-magnetic ($\mu = \mu_0$) conducting material has
        $$${given}$$
        in ${giveE ? 'V/m' : 'A/m'}, with $${K}$ in meters and $t$ in seconds. Use $${tauTex}$. Find $\alpha$, $\beta$, $\lambda$, $|\eta|$, $\tau$, $\sigma$, $\epsilon_r$, and the amplitude, phase and direction of $\mathbf ${other}$.`,
      parts,
      hints: [md`Match to $E_0e^{\mp\alpha ${K}}\cos(\omega t \mp \beta ${K} + \phi)$. Then $\eta = j\omega\mu/\gamma$.`, md`$\gamma/\eta = \gamma^2/(j\omega\mu) = \sigma + j\omega\epsilon$. Expand $\gamma^2 = \alpha^2 - \beta^2 + j2\alpha\beta$.`],
      sol: md`
        **Step 1: read off the numbers.** Compare with the sheet's form $E_0e^{\mp\alpha ${K}}\cos(\omega t \mp \beta ${K} + \phi)$:
        $$\alpha = ${a}\ \text{Np/m},\qquad \beta = ${b}\ \text{rad/m}$$
        $$\omega = ${p(k0 * 3)}\times10^8\ \text{rad/s},\qquad \phi = ${dg(ph)}$$
        The decay and the phase term carry the same sign, $${sgnE}$, so the wave travels toward $${hv(kh)}$${s > 0 ? '' : md` (and it shrinks as it travels: $e^{+${a}${K}}$ gets smaller as $${K}$ decreases)`}.

        **Step 2: the wavelength.**
        $$\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{${b}}$$
        $$\boxed{\lambda = ${f(lam)}\ \text{m}}$$

        **Step 3: $\gamma$ in polar form.** $\gamma = \alpha + j\beta = ${a} + j${b}$. Its size and angle:
        $$|\gamma| = \sqrt{${a}^2 + ${b}^2} = ${Number.isInteger(g) ? g : md`\sqrt{${a * a + b * b}}`}${Number.isInteger(g) ? '' : md` \approx ${f(g)}`}\ \text{m}^{-1}$$
        $$\angle\gamma = \tan^{-1}(${b}/${a}) = 90° - ${dg(tau)} = ${dg(ga)}$$

        **Step 4: $\eta$.** The sheet's $\eta\gamma = j\omega\mu$ gives $\eta = j\omega\mu/\gamma$. First $\omega\mu$:
        $$\omega\mu_0 = (${p(k0 * 3)}\times10^8)(4\pi\times10^{-7}) = ${piT(k0 * 120)}\ \Omega/\text{m}$$
        Dividing complex numbers divides the sizes and subtracts the angles. $j$ has angle $90°$:
        $$|\eta| = \frac{\omega\mu}{|\gamma|} = \frac{${piT(k0 * 120)}}{${f(g)}}$$
        $$\boxed{|\eta| \approx ${f(eta)}\ \Omega}$$
        $$\tau = 90° - ${dg(ga)}$$
        $$\boxed{\tau = ${dg(tau)}}$$

        **Step 5: $\sigma$ and $\epsilon$.** The sheet's other line is $\gamma/\eta = \sigma + j\omega\epsilon$. Replace $\eta$ by $j\omega\mu/\gamma$:
        $$\frac{\gamma}{\eta} = \frac{\gamma^2}{j\omega\mu}$$
        Square $\gamma$:
        $$\gamma^2 = ${a * a} - ${b * b} + j2(${a})(${b}) = ${a * a - b * b} + j${2 * a * b}$$
        Dividing by $j$ is multiplying by $-j$, which swaps the parts and moves a sign:
        $$\frac{${a * a - b * b} + j${2 * a * b}}{j\omega\mu} = \frac{${2 * a * b} + j${b * b - a * a}}{\omega\mu}$$
        The real part is $\sigma$:
        $$\sigma = \frac{${2 * a * b}}{${piT(k0 * 120)}}$$
        $$\boxed{\sigma \approx ${f(sig)}\ \text{S/m}}$$
        The imaginary part is $\omega\epsilon$, so $\epsilon = ${b * b - a * a}/(\omega^2\mu)$. Divide by $\epsilon_0$ and use $\mu_0\epsilon_0 = 1/c^2$:
        $$\epsilon_r = \frac{(\beta^2 - \alpha^2)c^2}{\omega^2} = \frac{${b * b - a * a}}{(\omega/c)^2} = \frac{${b * b - a * a}}{${k0 * k0}}$$
        $$\boxed{\epsilon_r = ${p(er)}}$$

        **Step 6: $\mathbf ${other}$.** ${giveE ? md`$\tilde H = \tilde E/\eta$: divide the amplitude by $|\eta|$ and subtract $\tau$ from the phase` : md`$\tilde E = \eta\tilde H$: multiply the amplitude by $|\eta|$ and add $\tau$ to the phase`}.
        $$${other}_0 = ${giveE ? md`\frac{${p(E0 / PI)}\pi}{${f(eta)}}` : md`(${f(eta)})(${p(H0)})`}$$
        $$\boxed{${other}_0 \approx ${f(oAmp)}\ \text{${other === 'H' ? 'A/m' : 'V/m'}}}$$
        $$\boxed{\text{phase} = ${dg(ph)} ${giveE ? '-' : '+'} ${dg(tau)} = ${dg(oph)}}$$
        The direction: $\mathbf E\times\mathbf H$ must point along the travel, $${hv(kh)}$. ${giveE ? md`With $\mathbf E$ along $\hat ${AX[e]}$: $(${hv(kh)})\times\hat ${AX[e]} = ${hv(oDir)}$.` : md`With $\mathbf H$ along $\hat ${AX[e]}$: $\mathbf E$ points along $\hat ${AX[e]}\times(${hv(kh)}) = ${hv(oDir)}$.`} So
        $$\mathbf ${other} = ${f(oAmp)}\,e^{${s > 0 ? '-' : ''}${a}${K}}\cos(${arg}${phT(oph)})\,(${hvs(oDir)})$$

        **Check.** The loss tangent from the answers: $\sigma/\omega\epsilon = ${2 * a * b}/${b * b - a * a} = ${f(2 * a * b / (b * b - a * a))}$. And $\tan(2\tau) = \tan(${dg(2 * tau)}) = ${f(Math.tan(2 * tau * deg))}$ ✓. Also $\angle\gamma + \tau = 90°$ ✓.

        **Speed path.** Read $\alpha$, $\beta$, $\omega$. Then three one-liners: $|\eta| = \omega\mu/\sqrt{\alpha^2 + \beta^2}$, $\tau = \tan^{-1}(\alpha/\beta)$, and from $\gamma^2/(j\omega\mu)$: $\sigma = 2\alpha\beta/\omega\mu$, $\epsilon_r = (\beta^2 - \alpha^2)/(\omega/c)^2$. Note $\omega\mu_0 = (\omega/c)\eta_0$.

        **Where points go.** Swapping $\alpha$ and $\beta$. Using $\beta$ instead of $|\gamma|$ in $|\eta|$. Giving the angle of $\gamma$ as $\tau$. Adding $\tau$ to $H$'s phase (H lags). The direction of $\mathbf ${other}$, especially for a wave toward $-\hat ${K}$.
      `,
    };
  };

  // ======================================================================================== 3. which regime
  // R = sigma/(omega eps) = 18e9 sigma/(f eps_r)
  const REG = {
    low: [{ sig: 0.005, er: 9, fq: 1e9 }, { sig: 0.002, er: 4, fq: 9e8 }, { sig: 1e-4, er: 4, fq: 4.5e7 }, { sig: 0.009, er: 81, fq: 2e8 }, { sig: 0.02, er: 16, fq: 2.25e9 }, { sig: 0.001, er: 9, fq: 2e9 }, { sig: 0.004, er: 4, fq: 1.8e9 }],
    good: METALS.map((m) => ({ sig: m.sig, er: m.er, fq: m.fq })),
    mid: [{ sig: 0.04, er: 9, fq: 6e7 }, { sig: 0.03, er: 4, fq: 1.8e8 }, { sig: 0.0225, er: 9, fq: 6e7 }, { sig: 0.015, er: 1, fq: 3.6e8 }],
  };
  const REGNAME = {
    good: 'Good conductor: $\\sigma/\\omega\\epsilon \\gg 1$',
    low: 'Low-loss (imperfect) dielectric: $\\sigma/\\omega\\epsilon \\ll 1$',
    mid: 'Neither: use the exact formulas',
    perfect: 'Perfect dielectric: $\\alpha = 0$',
  };
  GENS.ex_regime = () => {
    const kind = pick(['low', 'good', 'mid', 'low', 'good']);
    const c = pick(REG[kind]);
    const { sig, er, fq } = c;
    const n = Math.sqrt(er), Rt = 18e9 * sig / (fq * er), w = 2 * PI * fq;
    const etai = 120 * PI / n, k = w * n / 3e8;
    let a, b, eta, solMid;
    if (kind === 'low') {
      a = sig / 2 * etai; b = k; eta = etai;
    } else if (kind === 'good') {
      a = Math.sqrt(PI * fq * EM.mu0 * sig); b = a; eta = Math.sqrt(w * EM.mu0 / sig);
    } else {
      const rho = Math.hypot(1, Rt);
      a = k * Math.sqrt((rho - 1) / 2); b = k * Math.sqrt((rho + 1) / 2); eta = etai / Math.sqrt(rho);
    }
    const dlt = 1 / a, lam = 2 * PI / b;
    const up = kind === 'good' ? true : kind === 'low' ? false : pick([true, false]);
    const R2 = up ? Rt / 100 : Rt * 100;
    const rhoT = kind === 'mid' ? (Math.abs(Rt - 0.75) < 1e-9 ? '\\tfrac54' : '\\tfrac53') : '';
    const RtT = kind === 'mid' ? (Math.abs(Rt - 0.75) < 1e-9 ? '\\tfrac34' : '\\tfrac43') : f(Rt);
    const regWrong = {
      good: md`That needs $\sigma/\omega\epsilon \gg 1$ (100 or more). Here it is $${RtT}$.`,
      low: md`That needs $\sigma/\omega\epsilon \ll 1$ (0.01 or less). Here it is $${RtT}$.`,
      mid: md`"Neither" is for a loss tangent near 1. Here it is $${RtT}$, so one of the approximations is excellent.`,
      perfect: md`$\sigma = ${p(sig)}$ S/m is not zero, so there is some loss: $\alpha > 0$.`,
    };
    const regPart = MCP('Which regime is this?', REGNAME[kind], ['good', 'low', 'mid', 'perfect'].filter((x) => x !== kind).map((x) => [REGNAME[x], regWrong[x]]));
    const parts = [
      NT('\\sigma/\\omega\\epsilon', Rt, '', [[Rt * 2 * PI, 'That used f where ω = 2πf belongs.'], [Rt * er, 'That used ε₀ instead of ε = ε_r ε₀.'], [1 / Rt, 'Upside down: conduction over displacement is σ/ωε.']]),
      regPart,
      NT('\\alpha', a, 'Np/m', kind === 'low'
        ? [[sig / 2 * 120 * PI, 'That used η₀. The low-loss formula has √(μ/ε) = η₀/√ε_r.'], [sig * etai, 'Missing the 1/2: α ≈ (σ/2)√(μ/ε).']]
        : kind === 'good' ? [[Math.sqrt(2 * PI * fq * EM.mu0 * sig), 'That is √(ωμσ). The formula is √(ωμσ/2) = √(πfμσ).'], [PI * fq * EM.mu0 * sig, 'That forgot the square root.']]
          : [[k, 'That is the lossless β, ω√(με).'], [Rt / 2 * k, 'The low-loss formula is not valid at a loss tangent near 1.']]),
      NT('\\delta = 1/\\alpha', dlt, 'm', [[a, 'That is α, not 1/α.'], [lam, 'That is the wavelength.']]),
      NT('\\lambda', lam, 'm', kind === 'good' ? [[3e8 / (fq * n), 'That is the lossless wavelength. In a good conductor β = α, so λ = 2πδ.'], [dlt, 'That is δ. λ = 2π/β = 2πδ.']] : [[3e8 / fq, 'That is the free-space wavelength. Divide by √ε_r.'], [2 * PI / a, 'That used α.']]),
      NT('|\\eta|', eta, 'Ω', kind === 'good' ? [[120 * PI, 'That is free space.'], [Math.sqrt(fq * EM.mu0 / sig), 'That used f for ω.']] : [[120 * PI, 'That is free space. Divide by √ε_r.'], [120 * PI / er, 'That divided by ε_r. The formula has √ε_r.']]),
      NT(`\\sigma/\\omega\\epsilon\\ \\text{at}\\ ${up ? '100f' : 'f/100'}`, R2, '', [[up ? Rt * 100 : Rt / 100, 'Backwards: ω is in the denominator. Raising f lowers the ratio.'], [up ? Rt / 1e4 : Rt * 1e4, 'The ratio goes as 1/f, not 1/f².']]),
    ];
    const step3 = kind === 'low' ? md`
        **Step 3: $\alpha$ (low-loss line of the sheet).** For $\sigma/\omega\epsilon \ll 1$:
        $$\alpha \approx \frac{\sigma}{2}\sqrt{\frac{\mu}{\epsilon}} = \frac{\sigma}{2}\cdot\frac{120\pi}{\sqrt{\epsilon_r}}$$
        $$\alpha \approx \frac{${p(sig)}}{2}\cdot\frac{120\pi}{${p(n)}}$$
        $$\boxed{\alpha \approx ${f(a)}\ \text{Np/m}}$$
        **Step 4: skin depth.**
        $$\boxed{\delta = \frac{1}{\alpha} \approx ${f(dlt)}\ \text{m}}$$
        Many wavelengths fit in one $\delta$: the wave travels far.

        **Step 5: $\lambda$.** In a low-loss dielectric $\beta \approx \omega\sqrt{\mu\epsilon}$, so the wavelength is the lossless one:
        $$\lambda = \frac{c}{f\sqrt{\epsilon_r}} = \frac{3\times10^8}{(${p(fq)})(${p(n)})}$$
        $$\boxed{\lambda \approx ${f(lam)}\ \text{m}}$$
        **Step 6: $|\eta|$.** To first order $\eta \approx \sqrt{\mu/\epsilon}$:
        $$\boxed{|\eta| \approx \frac{120\pi}{${p(n)}} \approx ${f(eta)}\ \Omega}$$
        with a tiny angle $\tau \approx \tfrac12(\sigma/\omega\epsilon)$ rad.` : kind === 'good' ? md`
        **Step 3: $\alpha$ (good-conductor line).** For $\sigma/\omega\epsilon \gg 1$, $\alpha \approx \beta \approx \sqrt{\omega\mu\sigma/2} = \sqrt{\pi f\mu\sigma}$:
        $$\pi f\mu_0\sigma = 4\pi^2(${p(fq)})(${p(sig)})(10^{-7})$$
        $$\pi f\mu_0\sigma = 4\pi^2(${p(fq * sig * 1e-7)})$$
        Take the root:
        $$\boxed{\alpha = \beta \approx 2\pi(${p(Math.sqrt(fq * sig * 1e-7))}) \approx ${f(a)}\ \text{Np/m}}$$
        **Step 4: skin depth.**
        $$\boxed{\delta = \frac{1}{\alpha} \approx ${f(dlt)}\ \text{m}}$$
        **Step 5: $\lambda$.** Here $\beta = \alpha$, so
        $$\lambda = \frac{2\pi}{\beta} = 2\pi\delta$$
        $$\boxed{\lambda \approx ${f(lam)}\ \text{m}}$$
        The wave dies within one wavelength: over $\lambda$ its amplitude falls by $e^{-2\pi} \approx 1/535$.

        **Step 6: $|\eta|$.** $|\eta| = \sqrt{\omega\mu/\sigma}$ with $\tau = 45°$:
        $$|\eta| = \sqrt{\frac{2\pi(${p(fq)})(4\pi\times10^{-7})}{${p(sig)}}}$$
        $$\boxed{|\eta| \approx ${f(eta)}\ \Omega}$$` : md`
        **Step 3: no approximation applies.** The loss tangent $${RtT}$ is close to 1, so use the exact formulas. The lossless number first:
        $$k = \frac{\omega\sqrt{\epsilon_r}}{c} = \frac{2\pi(${p(fq)})(${p(n)})}{3\times10^8} = ${f(k)}\ \text{rad/m}$$
        The root that appears everywhere is exact here (a 3-4-5 triangle):
        $$\sqrt{1 + (${RtT})^2} = ${rhoT}$$
        Then
        $$\alpha = k\sqrt{\tfrac12\left(${rhoT} - 1\right)}$$
        $$\boxed{\alpha \approx ${f(a)}\ \text{Np/m}}$$
        **Step 4: skin depth.**
        $$\boxed{\delta = \frac{1}{\alpha} \approx ${f(dlt)}\ \text{m}}$$
        **Step 5: $\lambda$.** The $\beta$ formula has $+1$:
        $$\beta = k\sqrt{\tfrac12\left(${rhoT} + 1\right)} \approx ${f(b)}\ \text{rad/m}$$
        $$\boxed{\lambda = \frac{2\pi}{\beta} \approx ${f(lam)}\ \text{m}}$$
        **Step 6: $|\eta|$.** Divide the lossless impedance by $\sqrt{${rhoT}}$:
        $$|\eta| = \frac{120\pi/${p(n)}}{\sqrt{${rhoT}}}$$
        $$\boxed{|\eta| \approx ${f(eta)}\ \Omega}$$`;
    return {
      title: 'Which regime?',
      q: md`A non-magnetic material has $\sigma = ${p(sig)}$ S/m and $\epsilon_r = ${er}$. A plane wave at $f = ${fTex(fq)}$ travels through it. Find the loss tangent and decide which regime applies. Then use the matching formulas for $\alpha$, the skin depth $\delta$, the wavelength $\lambda$ and $|\eta|$. Finally: what would the loss tangent be at ${up ? md`100 times this frequency` : md`one hundredth of this frequency`}?`,
      parts,
      hints: [md`$\omega\epsilon_0 = 2\pi f\cdot\frac{10^{-9}}{36\pi} = \frac{f}{18\times10^9}$, so $\sigma/\omega\epsilon = 18\times10^9\,\sigma/(f\epsilon_r)$.`, md`$\ll 1$: $\alpha \approx \tfrac{\sigma}{2}\sqrt{\mu/\epsilon}$. $\gg 1$: $\alpha = \beta = \sqrt{\pi f\mu\sigma}$. Near 1: the exact formulas.`],
      sol: md`
        **Step 1: the loss tangent.** It compares the conduction current $\sigma E$ with the displacement current $\omega\epsilon E$. First the displacement part, with $\epsilon_0 = \frac{10^{-9}}{36\pi}$:
        $$\omega\epsilon = 2\pi f\epsilon_r\cdot\frac{10^{-9}}{36\pi} = \frac{f\epsilon_r}{18\times10^9}$$
        So
        $$\frac{\sigma}{\omega\epsilon} = \frac{18\times10^9(${p(sig)})}{(${p(fq)})(${er})}$$
        $$\boxed{\frac{\sigma}{\omega\epsilon} = ${RtT}${kind === 'mid' ? '' : ''}}$$

        **Step 2: the regime.** ${kind === 'good' ? md`The conduction current is $${f(Rt)}$ times the displacement current: a **good conductor**.` : kind === 'low' ? md`The displacement current is $${f(1 / Rt)}$ times the conduction current: a **low-loss dielectric**.` : md`The two currents are comparable: **neither** approximation is safe.`}
        ${step3}

        **Step 7: change the frequency.** $\sigma/\omega\epsilon$ has $\omega$ in the denominator, so it scales as $1/f$. ${up ? 'Raising f by 100 divides it by 100' : 'Lowering f by 100 multiplies it by 100'}:
        $$\boxed{\frac{\sigma}{\omega\epsilon} = ${f(R2)}}$$
        ${R2 > 0.05 && R2 < 20 ? 'Now neither approximation holds: the same material changes regime with frequency.' : R2 >= 20 ? 'It is even more of a conductor there.' : 'It is even closer to a perfect dielectric there.'}

        **Speed path.** Memorize $\omega\epsilon_0 = f/(18\times10^9)$ S/m. One line gives the regime. Then: low loss, $\alpha = 60\pi\sigma/\sqrt{\epsilon_r}$ and $\lambda$ is lossless; good conductor, $\alpha = \beta = \sqrt{\pi f\mu\sigma}$, $\lambda = 2\pi\delta$, $\tau = 45°$.

        **Where points go.** $f$ for $\omega$ (a factor of $2\pi$). $\epsilon_0$ for $\epsilon$. The good-conductor formula used for a dielectric, or the reverse. Giving $\alpha$ when $\delta = 1/\alpha$ was asked.
      `,
    };
  };

  // ======================================================================================== 4. polarization
  const POLN = { lin: 'linear', rc: 'right-hand circular', lc: 'left-hand circular', re: 'right-hand elliptical', le: 'left-hand elliptical' };
  // a complex coefficient A e^{j th} (th a multiple of 45 degrees) in TeX
  const coefT = (A, th) => {
    const t = norm180(th);
    if (t === 0) return `${A}`;
    if (t === 180) return `-${A}`;
    if (t === 90) return `j${A}`;
    if (t === -90) return `-j${A}`;
    const q = Math.round(t / 45);
    return `${A}e^{${q < 0 ? '-' : ''}j${Math.abs(q) === 1 ? '' : '3'}\\pi/4}`;
  };
  GENS.ex_pol = () => {
    const kk = pick([0, 1, 2]), s = pick([1, -1]), K = AX[kk];
    const a1 = (kk + 1) % 3, a2 = (kk + 2) % 3;            // a1 x a2 = +K
    const psi = pick([90, -90, 90, -90, 0, 180, 45, -45, 135, -135]);
    const circ = Math.abs(psi) === 90 && Math.random() < 0.7;
    let A = pick([2, 3, 4, 5]), B = circ ? A : pick([2, 3, 4, 5].filter((x) => Math.abs(psi) === 90 ? x !== A : true));
    if (Math.abs(psi) !== 90) B = pick([2, 3, 4, 5]);
    const th1 = pick([0, 0, 90, 180]), th2 = th1 + psi;
    const isE = Math.random() < 0.7, phasor = Math.random() < 0.45;
    const er = pick([1, 4, 9]), n = Math.sqrt(er), eta = 120 * PI / n;
    const f300 = pick([true, false]), k0 = f300 ? 2 : 1;         // beta in units of pi
    const bb = k0 * n, bT = piT(bb);
    const wT = f300 ? '6\\pi\\times10^8' : '3\\pi\\times10^8';
    const lin = psi === 0 || Math.abs(psi) === 180;
    const rotPlus = Math.sin(psi * deg) < 0;                    // turns a1 -> a2, i.e. about +K
    const right = !lin && rotPlus === (s > 0);
    const isCirc = !lin && A === B && Math.abs(psi) === 90;
    const key = lin ? 'lin' : isCirc ? (right ? 'rc' : 'lc') : (right ? 're' : 'le');
    const F = isE ? 'E' : 'H', unit = isE ? 'V/m' : 'A/m';
    const swap = Math.random() < 0.4;                           // which component is written first
    // time-domain terms: amplitude, function, phase
    const term = (amp, th, ax) => {
      const form = pick(['cos', 'cos', 'sin', 'neg']);
      let fn = 'cos', ph = norm180(th), sg = '';
      if (form === 'sin') { fn = 'sin'; ph = norm180(th + 90); }
      if (form === 'neg') { sg = '-'; ph = norm180(th + 180); }
      return { sg, txt: `${amp}\\${fn}(\\omega t ${sgnT(-s)} ${bT}${K}${phT(ph)})\\,\\hat ${AX[ax]}` };
    };
    const t1 = term(A, th1, a1), t2 = term(B, th2, a2);
    const [u, v] = swap ? [t2, t1] : [t1, t2];
    const timeT = md`\begin{aligned}\mathbf ${F} = {}&${u.sg}${u.txt}\\ &${v.sg === '-' ? '-' : '+'} ${v.txt}\end{aligned}`;
    const c1 = coefT(A, th1), c2 = coefT(B, th2);
    const pair = swap ? [[c2, a2], [c1, a1]] : [[c1, a1], [c2, a2]];
    const sum = pair.map(([c, ax], i) => (i === 0 ? `${c}\\,\\hat ${AX[ax]}` : `${c.startsWith('-') ? `- ${c.slice(1)}` : `+ ${c}`}\\,\\hat ${AX[ax]}`)).join(' ');
    const phasT = md`\tilde{\mathbf ${F}} = (${sum})\,e^{${s > 0 ? '-' : ''}j${bT}${K}}`;
    const S = isE ? (A * A + B * B) / (2 * eta) : eta * (A * A + B * B) / 2;
    // the snapshots at the origin
    const e0 = [A * Math.cos(th1 * deg), B * Math.cos(th2 * deg)], e1 = [-A * Math.sin(th1 * deg), -B * Math.sin(th2 * deg)];
    const vecT = ([x, y]) => {
      const out = [];
      if (Math.abs(x) > 1e-9) out.push(`${x < 0 ? '-' : ''}${f(Math.abs(x)).replace(/\.00$/, '')}\\,\\hat ${AX[a1]}`);
      if (Math.abs(y) > 1e-9) out.push(`${y < 0 ? '-' : (out.length ? '+' : '')}${f(Math.abs(y)).replace(/\.00$/, '')}\\,\\hat ${AX[a2]}`);
      return out.join(' ').replace(/\+(?=\d)/, '+ ').replace(/(\S)-(?=\d)/, '$1 - ') || '0';
    };
    const travel = [kk, s];
    const dirWrong = [[kk, -s], [a1, 1], [a2, -1]].map((x) => [`$${hv(x)}$`, x[0] === kk ? md`That is backwards. In $\omega t ${sgnT(-s)} \beta ${K}$, a crest (fixed phase) moves so that $${K}$ ${s > 0 ? 'grows' : 'shrinks'} as $t$ grows.` : md`The field components lie along $\hat ${AX[a1]}$ and $\hat ${AX[a2]}$. A plane wave travels perpendicular to its field.`]);
    const handWhy = md`The rotation is ${rotPlus ? md`from $\hat ${AX[a1]}$ toward $\hat ${AX[a2]}$, which is counterclockwise about $+\hat ${K}$` : md`from $\hat ${AX[a2]}$ toward $\hat ${AX[a1]}$, which is counterclockwise about $-\hat ${K}$`}; the wave travels toward $${hv(travel)}$, so the hand is ${right ? 'right' : 'left'}. Compare the rotation with the travel direction, not with $+\hat ${K}$.`;
    const polWhy = (x) => {
      if (lin) return md`The two components are ${psi === 0 ? 'in phase' : '$180°$ apart'}: they rise and fall together, so the tip of $\mathbf ${F}$ moves back and forth on a line. Nothing turns.`;
      if (x === 'lin') return md`Linear needs a phase difference of $0°$ or $180°$. Here it is $${dg(Math.abs(psi))}$, so the tip turns.`;
      const xRight = x === 'rc' || x === 're', xCirc = x === 'rc' || x === 'lc';
      if (xRight !== right) return handWhy;
      if (xCirc && !isCirc) return A !== B ? md`Circular needs equal amplitudes. Here they are ${A} and ${B}.` : md`Circular needs a $90°$ phase difference. Here it is $${dg(Math.abs(psi))}$.`;
      return md`Equal amplitudes ($${A}$ and $${B}$) and exactly $90°$ apart make a circle, not a general ellipse.`;
    };
    const polPart = MCP(md`The polarization of this wave is…`, POLN[key], Object.keys(POLN).filter((x) => x !== key).map((x) => [POLN[x], polWhy(x)]));
    const revKey = lin ? 'lin' : isCirc ? (right ? 'lc' : 'rc') : (right ? 'le' : 're');
    const revPart = MCP(md`Keep both components exactly as they are, but reverse the travel (flip the sign of the $\beta ${K}$ term). The polarization becomes…`, POLN[revKey],
      Object.keys(POLN).filter((x) => x !== revKey).map((x) => [POLN[x], x === key && !lin ? md`At a fixed point the tip turns the same way as before, but the hand is judged against the travel direction, which flipped. So the hand flips.` : x === 'lin' ? md`The phase difference between the components did not change, so the shape (circle, ellipse) did not either.` : lin ? md`Still in phase or $180°$ apart: still a line.` : md`The shape is unchanged; only the hand flips.`]));
    const parts = [
      MCP('The wave travels toward…', `$${hv(travel)}$`, dirWrong),
      NT('\\epsilon_r', er, '', [[n, 'That is √ε_r. Square it: β = (ω/c)√ε_r.'], [1, 'β is not ω/c here, so the medium is not free space.']].filter(([v]) => v !== er)),
      polPart,
      NT('|\\langle\\mathbf S\\rangle|', S, 'W/m^2', isE ? [[(A * A + B * B) / (2 * 120 * PI), 'That used η₀. This medium has η = η₀/√ε_r.'], [(A + B) ** 2 / (2 * eta), 'Add the squares of the components, not the components: |E|² = A² + B².'], [(A * A + B * B) / eta, 'Missing the 1/2 of the time average.']]
        : [[120 * PI * (A * A + B * B) / 2, 'That used η₀. This medium has η = η₀/√ε_r.'], [(A * A + B * B) / (2 * eta), 'For H the power is η|H|²/2, not |H|²/(2η).'], [eta * (A + B) ** 2 / 2, 'Add the squares of the components.']]),
    ];
    if (Math.abs(psi) === 90 && (th1 % 180 === 0)) {
      const opt = (x, y) => `$${vecT(x)}$, then $${vecT(y)}$`;
      parts.push(MCP(md`At the origin, $\mathbf ${F}$ at $t = 0$ and a quarter period later ($\omega t = 90°$) is…`, opt(e0, e1),
        [[opt(e0, [-e1[0], -e1[1]]), md`A quarter period later the cosine with phase $${dg(th2)}$ is $\cos(${dg(norm180(90 + th2))})$. Evaluate it, sign and all.`],
          [opt([-e0[0], -e0[1]], e1), md`At $t = 0$ evaluate each component at its phase: $${A}\cos(${dg(th1)})$ and $${B}\cos(${dg(th2)})$.`],
          [opt(e1, e0), md`That is the order reversed: it would turn the other way.`]]));
    }
    parts.push(revPart);
    const tCos = `${A}\\cos(\\omega t ${sgnT(-s)} ${bT}${K}${phT(norm180(th1))})`;
    const tCos2 = `${B}\\cos(\\omega t ${sgnT(-s)} ${bT}${K}${phT(norm180(th2))})`;
    return {
      title: 'Polarization and hand',
      q: md`A uniform plane wave in a lossless non-magnetic medium has ${phasor ? md`the ${isE ? 'electric' : 'magnetic'} field phasor` : md`the ${isE ? 'electric' : 'magnetic'} field`}
        $$${phasor ? phasT : timeT}$$
        in ${unit}, with $\omega = ${wT}$ rad/s${phasor ? md` (cosine reference: $\mathbf ${F}(t) = \Re\{\tilde{\mathbf ${F}}e^{j\omega t}\}$)` : ''}. Find the direction of travel, the medium's $\epsilon_r$, the polarization (type and hand), and the time-averaged power density.`,
      parts,
      hints: [md`Write both components as cosines of the same $\omega t ${sgnT(-s)} \beta ${K}$ (use $\sin x = \cos(x - 90°)$ and $-\cos x = \cos(x + 180°)$). The phase difference sets the shape.`, md`Find $\mathbf ${F}$ at the origin at $\omega t = 0$ and $90°$. Curl your right fingers from the first to the second: if the thumb points along the travel, it is right-handed.`],
      sol: md`
        **Step 1: the travel direction.** ${phasor ? md`The common factor is $e^{${s > 0 ? '-' : ''}j${bT}${K}}$. Multiplying by $e^{j\omega t}$ gives the phase $\omega t ${sgnT(-s)} ${bT}${K}$.` : md`Both terms have the phase $\omega t ${sgnT(-s)} ${bT}${K}$.`} Hold the phase fixed: as $t$ grows, $${K}$ must ${s > 0 ? 'grow' : 'shrink'}. So the wave travels toward
        $$\boxed{${hv(travel)}}$$

        **Step 2: the medium.** $\beta = \omega\sqrt{\epsilon_r}/c$. Here $\omega/c = ${piT(k0)}$ rad/m and $\beta = ${bT}$ rad/m, so $\sqrt{\epsilon_r} = ${p(n)}$:
        $$\boxed{\epsilon_r = ${er}},\qquad \eta = \frac{120\pi}{${p(n)}} = ${piT(120 / n)}\ \Omega$$

        **Step 3: both components as cosines.** ${phasor ? md`$\Re\{Ae^{j\theta}e^{j(\omega t ${sgnT(-s)} \beta ${K})}\} = A\cos(\omega t ${sgnT(-s)} \beta ${K} + \theta)$, so each coefficient's angle becomes a phase.` : md`Use $\sin x = \cos(x - 90°)$ and $-\cos x = \cos(x + 180°)$.`} In time:
        $$${F}_${AX[a1]} = ${tCos}$$
        $$${F}_${AX[a2]} = ${tCos2}$$
        The $\hat ${AX[a2]}$ component's phase minus the $\hat ${AX[a1]}$ component's phase:
        $$\Delta = ${dg(norm180(th2))} - (${dg(norm180(th1))})${Math.abs(norm180(th2) - norm180(th1) - psi) > 1e-9 ? md` = ${dg(norm180(th2) - norm180(th1))} \equiv ${dg(psi)}` : md` = ${dg(psi)}`}$$
        (Adding or subtracting $360°$ changes nothing, so $\Delta$ is taken between $-180°$ and $180°$.)
        ${lin ? md`$\Delta = ${dg(psi)}$: the components peak together (or exactly opposite). The tip of $\mathbf ${F}$ moves back and forth on a straight line: **linear**.` : md`$\Delta$ is not $0°$ or $180°$, so the tip turns. ${isCirc ? md`The amplitudes are equal (${A} and ${B}) and $|\Delta| = 90°$: a **circle**.` : md`${A !== B ? md`The amplitudes differ (${A} and ${B})` : md`$|\Delta| = ${dg(Math.abs(psi))}$, not $90°$`}: an **ellipse**.`}`}

        **Step 4: ${lin ? 'confirm with snapshots' : 'which way it turns'}.** At the origin, put $\omega t = 0$ and then $\omega t = 90°$ (a quarter period later):
        $$\mathbf ${F}(t = 0) = ${vecT(e0)}$$
        $$\mathbf ${F}(t = T/4) = ${vecT(e1)}$$
        ${lin ? md`Both lie on the same line through the origin: no rotation.` : md`The tip turns ${rotPlus ? md`from $\hat ${AX[a1]}$ toward $\hat ${AX[a2]}$` : md`from $\hat ${AX[a2]}$ toward $\hat ${AX[a1]}$`}. Curl the fingers of your right hand that way: your thumb points along $${rotPlus ? '+' : '-'}\hat ${K}$ (because $\hat ${AX[a1]}\times\hat ${AX[a2]} = +\hat ${K}$). The wave travels toward $${hv(travel)}$, ${right ? 'the same way' : 'the opposite way'}, so it is **${right ? 'right' : 'left'}-handed**.`}
        $$\boxed{\text{${POLN[key]}}}$$
        ${lin ? '' : md`Seen with the wave coming toward you, the tip turns ${right ? 'counterclockwise' : 'clockwise'}.`}

        **Step 5: power.** The two components are perpendicular, so their powers add. Each one carries ${isE ? md`$A^2/(2\eta)$` : md`$\eta A^2/2$`}:
        $$|\langle\mathbf S\rangle| = ${isE ? md`\frac{${A}^2 + ${B}^2}{2(${piT(120 / n)})}` : md`\frac{(${piT(120 / n)})(${A}^2 + ${B}^2)}{2}`}$$
        $$\boxed{|\langle\mathbf S\rangle| \approx ${f(S)}\ \text{W/m}^2}$$
        along $${hv(travel)}$. The phase difference does not matter for the power.

        **Step 6: reverse the travel.** The time behavior at a fixed point is unchanged, so the tip turns the same way and traces the same shape. But the hand is measured against the travel direction, which flipped. ${lin ? md`A line stays a line: **linear**.` : md`So the hand flips: **${POLN[revKey]}**.`}

        **Speed path.** (1) Travel from the sign of $\beta ${K}$. (2) Make both terms cosines; $\Delta = \phi_2 - \phi_1$ with the pair ordered so that $\hat a_1\times\hat a_2$ is $+\hat ${K}$ (here $\hat ${AX[a1]}$, $\hat ${AX[a2]}$). (3) $\Delta$ in $(-180°, 0°)$: turns about $+\hat ${K}$; in $(0°, 180°)$: about $-\hat ${K}$. (4) Same as the travel: right; opposite: left.

        **Where points go.** Not converting $\sin$ to $\cos$ before comparing phases. Ordering the components so that $\hat a_1\times\hat a_2$ points against $+\hat ${K}$ (it flips the hand). Judging the hand against $+\hat ${K}$ instead of the travel. Calling unequal amplitudes "circular".
      `,
    };
  };

  // ======================================================================================== 5. two current sheets
  // 1 + e^{j psi} for psi a multiple of 90 degrees, times a real k, in TeX
  const onePlus = (k, psi) => {
    const q = ((Math.round(norm180(psi) / 90) % 4) + 4) % 4;          // 0, 90, 180, 270
    if (q === 2) return '0';
    if (q === 0) return p(2 * k);
    return `${p(k)}(1 ${q === 1 ? '+' : '-'} j)`;
  };
  const polOf = (psi, A, B, travelSign) => {                          // components along a1, a2 with a1 x a2 = +axis
    const lin = Math.abs(Math.sin(psi * deg)) < 1e-9;
    if (lin) return 'lin';
    const right = (Math.sin(psi * deg) < 0) === (travelSign > 0);
    const circ = A === B && Math.abs(Math.abs(norm180(psi)) - 90) < 1e-9;
    return circ ? (right ? 'rc' : 'lc') : (right ? 're' : 'le');
  };
  GENS.ex_twosheets = () => {
    const ortho = Math.random() < 0.5;
    const fq = pick([75e6, 150e6, 300e6]), lam = 3e8 / fq, beta = 2 * PI / lam;
    const dq = ortho ? pick([1 / 4, 1 / 8, 1 / 2]) : pick([1 / 4, 1 / 2]);
    const d = dq * lam, bd = 360 * dq;
    const J0 = pick([1, 2, -2, 4, -1]);
    const phi = pick([0, 90, -90, 180]);
    const psP = norm180(phi + bd), psM = norm180(phi - bd);
    const phiT = phi === 0 ? '' : phi === 180 ? 'e^{j\\pi}' : `e^{${phi < 0 ? '-' : ''}j\\pi/2}`;
    const Jt = (v) => (v === 1 ? '' : v === -1 ? '-' : p(v));
    const bT = piT(beta / PI);
    const sheetT = md`$$\mathbf J_{s1} = ${Jt(J0)}\,\hat x\ \text{A/m}\quad (z = 0)$$
        $$\mathbf J_{s2} = ${Jt(J0)}${phiT}\,\hat ${ortho ? 'y' : 'x'}\ \text{A/m}\quad (z = ${p(d)}\ \text{m})$$`;
    const e = 60 * Math.abs(J0);                                       // eta0 |J0| / 2, in units of pi
    const intro = md`Two infinite current sheets in free space carry the surface-current phasors
        ${sheetT}
        at $f = ${fTex(fq)}$ (phasors with a cosine reference; $e^{j\pi} = -1$, $e^{\pm j\pi/2} = \pm j$).`;
    const single = md`
        **Step 1: one sheet alone.** A sheet $\mathbf J_s$ at $z = z_0$ radiates a wave each way. From the sheet's formula ($\mathbf E = -\tfrac{\eta}{2}\mathbf J_s$ at the sheet), in phasors:
        $$\tilde{\mathbf E} = -\frac{\eta_0}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z - z_0|}$$
        The $-j\beta|z - z_0|$ is the phase the wave picks up traveling from the sheet to $z$. Here
        $$\beta = \frac{2\pi f}{c} = \frac{2\pi(${p(fq)})}{3\times10^8} = ${bT}\ \text{rad/m}$$
        so $\lambda = ${p(lam)}$ m and the spacing is $\beta d = ${dg(bd)}$ ($d = \lambda/${p(1 / dq)}$). Each sheet alone gives $|\tilde E| = \tfrac{\eta_0}{2}|J_0| = ${piT(e)}$ V/m.

        **Step 2: in each region, add the two waves.** For $z > d$ both waves travel toward $+z$. Sheet 2 is $d$ closer, so its wave arrives with an extra $+\beta d$ on top of its own phase:
        $$\psi_+ = \phi + \beta d = ${dg(phi)} + ${dg(bd)} = ${dg(psP)}$$
        For $z < 0$ both travel toward $-z$, and sheet 2's wave has traveled $d$ farther:
        $$\psi_- = \phi - \beta d = ${dg(phi)} - ${dg(bd)} = ${dg(psM)}$$`;
    if (!ortho) {
      const cP = Math.abs(Math.cos(psP * deg / 2)), cM = Math.abs(Math.cos(psM * deg / 2));
      const ampT = (c) => (c < 1e-9 ? '$0$' : Math.abs(c - 1) < 1e-9 ? `$${piT(2 * e)}$ V/m` : `$${p(e)}\\sqrt2\\,\\pi$ V/m`);
      const all = { zero: '$0$', half: `$${piT(e)}$ V/m`, rt: `$${p(e)}\\sqrt2\\,\\pi$ V/m`, one: `$${piT(2 * e)}$ V/m`, two: `$${piT(4 * e)}$ V/m` };
      const ampPart = (c, ps, where) => {
        const r = ampT(c);
        const why = {
          [all.zero]: md`Cancellation needs the two waves $180°$ apart. In ${where} they are $${dg(Math.abs(ps))}$ apart.`,
          [all.half]: md`That is one sheet alone. Both sheets radiate into ${where}; add the two waves with their phases.`,
          [all.rt]: md`That is the sum of two waves $90°$ apart. In ${where} they are $${dg(Math.abs(ps))}$ apart.`,
          [all.one]: md`That adds the two waves as if in phase. In ${where} sheet 2's wave arrives $${dg(Math.abs(ps))}$ away from sheet 1's.`,
          [all.two]: md`Each sheet alone gives $\tfrac{\eta_0}{2}|J_0| = ${piT(e)}$ V/m, not $\eta_0|J_0|$: the sheet's field has a factor $\tfrac12$.`,
        };
        return MCP(md`The amplitude of $\tilde{\mathbf E}$ in ${where} is…`, r, Object.values(all).filter((x) => x !== r).map((x) => [x, why[x]]));
      };
      const Pp = (2 * e * PI * cP) ** 2 / (240 * PI), Pm = (2 * e * PI * cM) ** 2 / (240 * PI);
      const reg = cP > 1e-9 && cM > 1e-9 ? 'both' : cP > 1e-9 ? 'plus' : cM > 1e-9 ? 'minus' : 'none';
      const RG = { both: 'Both sides: $z > d$ and $z < 0$', plus: 'Only $z > d$', minus: 'Only $z < 0$', none: 'Neither: no power leaves' };
      const regWhy = (x) => (x === 'none' ? md`Power leaves wherever the field outside is not zero. ${reg === 'both' ? 'Both outside fields are nonzero.' : 'One outside field is nonzero.'}` : md`Look at the two outside amplitudes: $z > d$ has ${ampT(cP)}, $z < 0$ has ${ampT(cM)}.`);
      const parts = [
        NT('\\beta', beta, 'rad/m', [[2 * PI * fq, 'That is ω. β = ω/c.'], [fq / 3e8, 'Missing 2π: β = 2πf/c.']]),
        ampPart(cP, psP, '$z > d$'),
        ampPart(cM, psM, '$z < 0$'),
        MCP('Which regions receive time-averaged power?', RG[reg], Object.keys(RG).filter((x) => x !== reg).map((x) => [RG[x], regWhy(x)])),
      ];
      const Ptot = Pp + Pm;
      if (Ptot > 1e-9) parts.push(NT('\\text{total }\\langle S\\rangle\\ \\text{leaving (both sides)}', Ptot, 'W/m^2', [[Ptot / 2, 'Add both outside regions (if both carry power).'], [(e * PI) ** 2 / (240 * PI) * 2, 'That is two independent sheets, ignoring the interference.']]));
      const cMid = Math.abs(Math.cos(phi * deg / 2));
      if (cMid > 1e-9) parts.push(NT('|\\tilde E|\\ \\text{at the midpoint}\\ z = d/2', 2 * e * PI * cMid, 'V/m', [[e * PI, 'That is one sheet alone. At the midpoint both waves have traveled d/2, so only φ separates them.']]));
      const fieldP = onePlus(-30 * J0, psP), fieldM = onePlus(-30 * J0, psM);
      return {
        title: 'Two current sheets: parallel currents',
        q: md`${intro} Find the field in each region, which regions receive power, and how much.`,
        parts,
        hints: [md`Each sheet alone: $\tilde{\mathbf E} = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_s e^{-j\beta|z - z_0|}$.`, md`Outside, both waves travel the same way; the phase between them is $\phi + \beta d$ on the far side of sheet 2 and $\phi - \beta d$ on the far side of sheet 1. $|1 + e^{j\psi}| = 2|\cos(\psi/2)|$.`],
        sol: md`${single}

        **Step 3: the outside fields.** Factor out sheet 1's wave. With $\eta_0/2 = 60\pi$:
        $$\tilde{\mathbf E}_{z>d} = -60\pi(${p(J0)})(1 + e^{j${dg(psP)}})e^{-j${bT}z}\,\hat x$$
        $$\tilde{\mathbf E}_{z>d} = ${fieldP === '0' ? '0' : md`${fieldP}\pi\,e^{-j${bT}z}\,\hat x`}$$
        $$\tilde{\mathbf E}_{z<0} = -60\pi(${p(J0)})(1 + e^{j${dg(psM)}})e^{+j${bT}z}\,\hat x$$
        $$\tilde{\mathbf E}_{z<0} = ${fieldM === '0' ? '0' : md`${fieldM}\pi\,e^{+j${bT}z}\,\hat x`}$$
        The sizes follow from $|1 + e^{j\psi}| = 2|\cos(\psi/2)|$:
        $$|\tilde E_{z>d}| = ${piT(2 * e)}|\cos(${dg(psP / 2)})| = ${ampT(cP).replace(/\$/g, '').replace(' V/m', '')}\ \text{V/m}$$
        $$|\tilde E_{z<0}| = ${piT(2 * e)}|\cos(${dg(psM / 2)})| = ${ampT(cM).replace(/\$/g, '').replace(' V/m', '')}\ \text{V/m}$$
        $\tilde{\mathbf H}$ follows from $\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta_0$ with $\hat k = +\hat z$ for $z > d$ (so $\hat z\times\hat x = \hat y$) and $\hat k = -\hat z$ for $z < 0$ (so $-\hat y$).

        **Step 4: power.** Each outside region carries $|\tilde E|^2/(2\eta_0)$ away:
        $$\langle S\rangle_{z>d} = ${f(Pp) === '0' ? '0' : f(Pp)}\ \text{W/m}^2,\quad \langle S\rangle_{z<0} = ${f(Pm) === '0' ? '0' : f(Pm)}\ \text{W/m}^2$$
        ${Ptot > 1e-9 ? md`$$\boxed{\text{total} \approx ${f(Ptot)}\ \text{W/m}^2}$$` : md`Nothing leaves: all of the field is trapped between the sheets (this is the Spring 2024 #1 situation).`}

        **Step 5: between the sheets.** Here sheet 1's wave goes toward $+z$ and sheet 2's toward $-z$, with equal amplitudes: a **standing wave**:
        $$\tilde E_x = -60\pi(${p(J0)})\left[e^{-j\beta z} + e^{j${dg(phi)}}e^{j\beta(z - d)}\right]$$
        At the midpoint both have traveled $d/2$, so only $\phi$ separates them: $|\tilde E(d/2)| = ${piT(2 * e)}|\cos(${dg(phi / 2)})| = ${cMid > 1e-9 ? f(2 * e * PI * cMid) : '0'}$ V/m.

        **Speed path.** Each sheet gives $\tfrac{\eta_0}{2}|J|$. Outside: phase gap $\phi \pm \beta d$ ($+$ beyond sheet 2, $-$ beyond sheet 1). Gap $0°$: double; $90°$: $\times\sqrt2$; $180°$: zero.

        **Where points go.** The sign of $\beta d$ on each side. Forgetting the $\tfrac12$ in $\tfrac{\eta_0}{2}J$. Adding amplitudes without their phases. Dropping the minus sign of $-\tfrac{\eta_0}{2}\mathbf J_s$ in the written fields.
      `,
      };
    }
    // orthogonal sheets: the polarization on each side, and a design question
    const kP = polOf(psP, 1, 1, 1), kM = polOf(psM, 1, 1, -1);
    const polW = (truth, ps, travel) => (x) => {
      if (truth === 'lin') return md`The two components are $${dg(Math.abs(ps))}$ apart, so they rise and fall together: a line.`;
      if (x === 'lin') return md`Linear needs the components $0°$ or $180°$ apart. Here they are $${dg(Math.abs(ps))}$ apart.`;
      const xr = x === 'rc' || x === 're', tr = truth === 'rc' || truth === 're';
      if (xr !== tr) return md`Check the hand: the $\hat y$ part lags the $\hat x$ part by $${dg(-ps)}$, so the tip turns ${Math.sin(ps * deg) < 0 ? md`from $\hat x$ to $\hat y$ (about $+\hat z$)` : md`from $\hat y$ to $\hat x$ (about $-\hat z$)`}, and this wave travels toward $${travel}$.`;
      return (x === 'rc' || x === 'lc') ? md`Equal amplitudes, but $${dg(Math.abs(ps))}$ apart, not $90°$: an ellipse.` : md`Equal amplitudes exactly $90°$ apart trace a circle.`;
    };
    const polP = MCP(md`The polarization for $z > d$ is…`, POLN[kP], Object.keys(POLN).filter((x) => x !== kP).map((x) => [POLN[x], polW(kP, psP, '+\\hat z')(x)]));
    const polM = MCP(md`The polarization for $z < 0$ is…`, POLN[kM], Object.keys(POLN).filter((x) => x !== kM).map((x) => [POLN[x], polW(kM, psM, '-\\hat z')(x)]));
    const S = 30 * PI * J0 * J0;
    const want = pick(['rc', 'lc']), target = want === 'rc' ? -90 : 90;   // z > d travels +z: right needs psi = -90
    const phiR = norm180(target - bd);
    const phOpt = (x) => `$\\phi = ${dg(norm180(x))}$`;
    const phWhy = (x) => {
      const ps = norm180(x + bd), k = polOf(ps, 1, 1, 1);
      return md`With that $\phi$, beyond sheet 2 the $\hat y$ wave sits at $\phi + \beta d = ${dg(ps)}$ from the $\hat x$ wave: ${POLN[k]}.`;
    };
    const cands = [target + bd, -target - bd, target, -target, phiR + 180, phiR + 90, phiR - 90].map(norm180).filter((x) => Math.abs(x - phiR) > 1e-9);
    const design = MCP(md`Design: what phase $\phi$ of sheet 2 (same size, same spacing) would make the wave for $z > d$ **${POLN[want]}**?`, phOpt(phiR), cands.map((x) => [phOpt(x), phWhy(x)]));
    return {
      title: 'Two current sheets: crossed currents',
      q: md`${intro} Find the polarization on each side, the power density radiated to $z > d$, and design a phase.`,
      parts: [
        NT('\\beta', beta, 'rad/m', [[2 * PI * fq, 'That is ω. β = ω/c.'], [fq / 3e8, 'Missing 2π: β = 2πf/c.']]),
        polP, polM,
        NT('\\langle S\\rangle\\ \\text{for}\\ z > d', S, 'W/m^2', [[S / 2, 'Both components carry power: add (η₀|J₀|/2)² twice.'], [S * 4, 'Each sheet gives (η₀/2)|J₀|, not η₀|J₀|.']]),
        design,
      ],
      hints: [md`Each sheet alone: $\tilde{\mathbf E} = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_s e^{-j\beta|z - z_0|}$. The $\hat x$ wave comes from sheet 1, the $\hat y$ wave from sheet 2.`, md`Travel $+z$ with $\tilde{\mathbf E}\propto\hat x + e^{j\psi}\hat y$: $\psi = -90°$ is right-circular, $+90°$ left. For travel $-z$ it is the reverse.`],
      sol: md`${single}

        **Step 3: the fields.** Sheet 1 makes the $\hat x$ part, sheet 2 the $\hat y$ part, with equal sizes $60\pi|J_0|$. With $-60\pi(${p(J0)})$ factored out:
        $$\tilde{\mathbf E}_{z>d} \propto (\hat x + e^{j${dg(psP)}}\hat y)\,e^{-j${bT}z}$$
        $$\tilde{\mathbf E}_{z<0} \propto (\hat x + e^{j${dg(psM)}}\hat y)\,e^{+j${bT}z}$$

        **Step 4: $z > d$ (travels toward $+z$).** Equal amplitudes; the $\hat y$ part is $${dg(psP)}$ from the $\hat x$ part. ${kP === 'lin' ? md`That is $0°$ or $180°$: **linear**.` : md`In time, $\hat y$ ${Math.sin(psP * deg) < 0 ? 'lags' : 'leads'} $\hat x$, so the tip turns ${Math.sin(psP * deg) < 0 ? md`$\hat x\to\hat y$, about $+\hat z$` : md`$\hat y\to\hat x$, about $-\hat z$`}. The travel is $+\hat z$, so: **${POLN[kP]}**.`}

        **Step 5: $z < 0$ (travels toward $-z$).** The gap is $${dg(psM)}$. ${kM === 'lin' ? md`That is $0°$ or $180°$: **linear**.` : md`The tip turns ${Math.sin(psM * deg) < 0 ? md`about $+\hat z$` : md`about $-\hat z$`}, and this wave travels toward $-\hat z$: **${POLN[kM]}**.`}

        **Step 6: power for $z > d$.** Two perpendicular components, each of size $60\pi|J_0| = ${piT(e)}$ V/m:
        $$\langle S\rangle = \frac{2(${piT(e)})^2}{2(120\pi)} = 30\pi J_0^2$$
        $$\boxed{\langle S\rangle \approx ${f(S)}\ \text{W/m}^2}$$
        The same flows to $z < 0$. The phases change the polarization, never the power, because the two components are perpendicular.

        **Step 7: design.** For $z > d$ (travel $+z$), ${POLN[want]} needs the $\hat y$ part at $${dg(target)}$ from the $\hat x$ part. That gap is $\phi + \beta d$:
        $$\phi + ${dg(bd)} = ${dg(target)}$$
        $$\boxed{\phi = ${dg(phiR)}}$$

        **Speed path.** Beyond sheet 2 the gap is $\phi + \beta d$; beyond sheet 1, $\phi - \beta d$. For travel $+z$: $-90°$ right, $+90°$ left. For travel $-z$: flip.

        **Where points go.** Using $\phi - \beta d$ on the $z > d$ side. Judging the hand of the $z < 0$ wave as if it traveled toward $+z$. Unequal amplitudes from forgetting that both sheets have the same $|J_0|$.
      `,
    };
  };

  // ======================================================================================== 6. a dielectric interface
  GENS.ex_interface = () => {
    let n1, n2;
    do { n1 = pick([1, 2, 3]); n2 = pick([1, 2, 3, 4]); } while (n1 === n2);
    const er1 = n1 * n1, er2 = n2 * n2;
    const Gm = (n1 - n2) / (n1 + n2), T = 1 + Gm;
    const E0 = (n1 + n2) * pick([2, 3, 6]);
    const fq = pick([100e6, 150e6, 300e6]), lam1 = 3e8 / (fq * n1);
    const eta1 = 120 * PI / n1, eta2 = 120 * PI / n2;
    const Rf = Gm * Gm, Tf = 1 - Rf, vswr = Math.max(n1, n2) / Math.min(n1, n2);
    const Emax = (1 + Math.abs(Gm)) * E0, Ht = T * E0 / eta2;
    const maxAt = Gm > 0 ? 'at the interface' : '$\\lambda_1/4$ from the interface';
    const LOC = ['at the interface', '$\\lambda_1/4$ from the interface', '$\\lambda_1/8$ from the interface', '$\\lambda_1/2$ from the interface'];
    const ph = pick([0, 0, 30, -45]);
    const parts = [
      NT('\\Gamma', Gm, '', [[-Gm, 'Upside down: Γ = (η₂ − η₁)/(η₂ + η₁). The η values go as 1/√ε_r.'], [(er1 - er2) / (er1 + er2), 'That used ε_r. η goes as 1/√ε_r, so use √ε_r.']]),
      NT('\\tau', T, '', [[1 - Gm, 'τ = 1 + Γ, with Γ\'s sign.'], [2 * n2 / (n1 + n2), 'That has n₁ and n₂ swapped: τ = 2η₂/(η₁ + η₂) = 2n₁/(n₁ + n₂).']]),
      NT('\\text{transmitted amplitude}\\ |E_t|', T * E0, 'V/m', [[E0, 'Some of the field reflects: multiply by τ.'], [(1 - Gm) * E0, 'τ = 1 + Γ.']]),
      NT('\\text{reflected power fraction}', Rf, '', [[Math.abs(Gm), 'Power goes as the field squared: |Γ|².']]),
      NT('\\text{transmitted power fraction}', Tf, '', [[T * T, 'τ² alone forgets the change of impedance: the fraction is τ²η₁/η₂.'], [T, 'Power goes as the field squared, divided by η.']]),
      NT('\\text{VSWR in medium 1}', vswr, '', [[(1 + Gm) / (1 - Gm), 'Use |Γ|: VSWR = (1 + |Γ|)/(1 − |Γ|).']].filter(([v]) => v > 0)),
      NT('|\\tilde E|_{\\max}\\ \\text{in medium 1}', Emax, 'V/m', [[2 * E0, 'That is a perfect reflector, |Γ| = 1.'], [E0, 'Incident and reflected waves interfere: the peak is (1 + |Γ|)E₀.']]),
      MCP(md`Where is the maximum of $|\tilde E|$ in medium 1 closest to the interface?`, maxAt, LOC.filter((x) => x !== maxAt).map((x) => [x, x === LOC[2] ? md`Maxima and minima are $\lambda_1/4$ apart, and one of them sits at the interface.` : x === LOC[3] ? md`At $\lambda_1/2$ the pattern repeats, but there is a closer one.` : Gm > 0 ? md`$\Gamma > 0$: the reflected wave is in phase with the incident one at $z = 0$, so the maximum sits at the interface.` : md`$\Gamma < 0$: the two waves are out of phase at $z = 0$, so the interface is a minimum; the maximum is a quarter wavelength back.`])),
      NT('|H_t|', Ht, 'A/m', [[T * E0 / eta1, 'That used η₁. The transmitted wave lives in medium 2.'], [E0 / eta2, 'Multiply by τ first.']]),
    ];
    return {
      title: 'A wave hits a dielectric',
      q: md`The region $z < 0$ is a perfect dielectric with $\epsilon_r = ${er1}$, and $z > 0$ one with $\epsilon_r = ${er2}$; both have $\mu = \mu_0$. A wave at $f = ${fTex(fq)}$ is incident from $z < 0$:
        $$\mathbf E_i = ${E0}\cos(\omega t - \beta_1 z${phT(ph)})\,\hat x\ \text{V/m}$$
        Find $\Gamma$, $\tau$, the transmitted amplitude, the power fractions, the VSWR and peak field in medium 1, where that peak sits, and the transmitted $|H|$.`,
      parts,
      hints: [md`$\eta = 120\pi/\sqrt{\epsilon_r}$, so $\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1} = \dfrac{\sqrt{\epsilon_{r1}} - \sqrt{\epsilon_{r2}}}{\sqrt{\epsilon_{r1}} + \sqrt{\epsilon_{r2}}}$.`, md`Transmitted power fraction $= |\tau|^2\eta_1/\eta_2 = 1 - |\Gamma|^2$.`],
      sol: md`
        **Step 1: the impedances.** $\eta = \sqrt{\mu/\epsilon} = 120\pi/\sqrt{\epsilon_r}$:
        $$\eta_1 = \frac{120\pi}{${n1}} = ${piT(120 / n1)}\ \Omega,\qquad \eta_2 = \frac{120\pi}{${n2}} = ${piT(120 / n2)}\ \Omega$$

        **Step 2: where Γ and τ come from.** At $z = 0$ the tangential $\mathbf E$ and $\mathbf H$ are continuous. With $E_r = \Gamma E_0$, $E_t = \tau E_0$, and $H = \pm E/\eta$ (minus for the reflected wave, which travels toward $-z$):
        $$1 + \Gamma = \tau$$
        $$\frac{1 - \Gamma}{\eta_1} = \frac{\tau}{\eta_2}$$
        Put the first into the second and solve:
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$$
        With $\eta \propto 1/\sqrt{\epsilon_r}$, multiply top and bottom by $\sqrt{\epsilon_{r1}\epsilon_{r2}}/120\pi$:
        $$\Gamma = \frac{${n1} - ${n2}}{${n1} + ${n2}}$$
        $$\boxed{\Gamma = ${fr(Gm)}},\qquad \boxed{\tau = 1 + \Gamma = ${fr(T)}}$$
        ${Gm < 0 ? md`$\Gamma < 0$: going into the denser medium (smaller $\eta$) flips the reflected $\mathbf E$.` : md`$\Gamma > 0$: going into the less dense medium (larger $\eta$) the reflected $\mathbf E$ keeps its sign.`}

        **Step 3: the fields.** At $z = 0$ the reflected wave has amplitude $\Gamma E_0$ and the transmitted wave $\tau E_0$:
        $$E_r = (${fr(Gm)})(${E0}) = ${fr(Gm * E0)}\ \text{V/m}$$
        $$\boxed{|E_t| = (${fr(T)})(${E0}) = ${fr(T * E0)}\ \text{V/m}}$$
        $$\mathbf E_t = ${fr(T * E0)}\cos(\omega t - \beta_2 z${phT(ph)})\,\hat x$$
        with $\beta_2 = ${n2}\omega/c$. Its $\mathbf H$ is along $+\hat y$ with
        $$|H_t| = \frac{${fr(T * E0)}}{${piT(120 / n2)}}$$
        $$\boxed{|H_t| \approx ${f(Ht)}\ \text{A/m}}$$

        **Step 4: power.** Each wave carries $E^2/(2\eta)$ in its own medium. Divide by the incident $E_0^2/(2\eta_1)$:
        $$\frac{P_r}{P_i} = \Gamma^2 = ${fr(Rf)}$$
        $$\frac{P_t}{P_i} = \tau^2\frac{\eta_1}{\eta_2} = (${fr(T)})^2\cdot\frac{${n2}}{${n1}} = ${fr(Tf)}$$
        **Check.** $${fr(Rf)} + ${fr(Tf)} = 1$ ✓: the energy is conserved.

        **Step 5: the standing wave in medium 1.** Incident plus reflected:
        $$\tilde E_x = E_0\left(e^{-j\beta_1 z} + \Gamma e^{j\beta_1 z}\right)$$
        Its size swings between $(1 + |\Gamma|)E_0$, where the two waves are in phase, and $(1 - |\Gamma|)E_0$:
        $$\boxed{|\tilde E|_{\max} = ${fr(Emax)}\ \text{V/m}},\qquad |\tilde E|_{\min} = ${fr((1 - Math.abs(Gm)) * E0)}\ \text{V/m}$$
        $$\boxed{\text{VSWR} = \frac{1 + |\Gamma|}{1 - |\Gamma|} = ${fr(vswr)}}$$
        At $z = 0$ the two waves differ by the sign of $\Gamma$. ${Gm > 0 ? md`$\Gamma > 0$: in phase, so a **maximum at the interface**.` : md`$\Gamma < 0$: out of phase, so a minimum at the interface and the **maximum $\lambda_1/4$ back**, where the round trip adds $180°$.`} Here $\lambda_1 = c/(f\sqrt{\epsilon_{r1}}) = ${f(lam1)}$ m.

        **Speed path.** $\Gamma = (n_1 - n_2)/(n_1 + n_2)$ with $n = \sqrt{\epsilon_r}$. $\tau = 1 + \Gamma$. Fractions $\Gamma^2$ and $1 - \Gamma^2$. VSWR $= n_{\max}/n_{\min}$. Max at the interface if $\Gamma > 0$, else $\lambda_1/4$ back.

        **Where points go.** $\epsilon_r$ used instead of $\sqrt{\epsilon_r}$. $\Gamma$ upside down (its sign decides where the peak sits). Transmitted power as $\tau^2$ without $\eta_1/\eta_2$. $|H_t|$ with $\eta_1$.
      `,
    };
  };

  // ======================================================================================== 7. a perfect conductor
  GENS.ex_pec = () => {
    const kk = pick([0, 1, 2]), side = pick([-1, 1]), dI = -side;      // the field region is on 'side'; the incident wave travels dI
    const K = AX[kk], e = (kk + pick([1, 2])) % 3, Ee = AX[e];
    const hh = cross([kk, dI], [e, 1]);
    const m = pick([1, 2, 5, 10]), E0 = 6 * PI * m;
    const fq = pick([100e6, 150e6, 300e6, 600e6]), lam = 3e8 / fq, beta = 2 * PI / lam;
    const Js = 2 * E0 / (120 * PI), Pr = E0 * E0 / (36 * PI * 1e9);
    const reg = side < 0 ? `${K} < 0` : `${K} > 0`;
    const TRUE = [
      md`The time-averaged Poynting vector is zero everywhere in front of the conductor`,
      md`At every point, $\mathbf E$ and $\mathbf H$ are $90°$ out of phase in time`,
      md`The nulls of $\mathbf E$ and the nulls of $\mathbf H$ are a quarter wavelength apart`,
      md`If the incident wave were right-hand circular, the reflected wave would be left-hand circular`,
    ];
    const FALSE = [
      [md`The time-averaged Poynting vector is $E_0^2/(2\eta_0)$ toward the conductor`, md`Incident and reflected waves carry equal power in opposite directions: the average is zero. Energy only sloshes back and forth.`],
      [md`$\mathbf E$ and $\mathbf H$ are in phase in time at every point`, md`$\tilde E \propto j\sin\beta ${K}$ and $\tilde H \propto \cos\beta ${K}$: the factor $j$ puts them $90°$ apart in time.`],
      [md`$|\mathbf E|$ is largest right at the conductor's surface`, md`Tangential $\mathbf E$ must vanish on a perfect conductor. $|\mathbf E|$ is zero there and largest a quarter wavelength away.`],
      [md`If the incident wave were right-hand circular, the reflected wave would also be right-hand circular`, md`$\Gamma = -1$ flips both components alike, so the tip keeps turning the same way, but the travel reversed: the hand flips.`],
      [md`$\mathbf H$ is zero at the conductor's surface`, md`$\mathbf H$ doubles at the surface: the incident and reflected $\mathbf H$ add there. That surface $\mathbf H$ is what the surface current supports.`],
    ];
    const tIx = Math.floor(Math.random() * TRUE.length);
    const falseUse = FALSE.filter((x, i) => !(tIx === 3 && i === 3));
    const stPart = MCP('Which statement is true?', TRUE[tIx], falseUse);
    const tExp = [md`Each half carries $E_0^2/(2\eta_0)$, in opposite directions.`, md`$\tilde E\propto j\sin$, $\tilde H\propto\cos$: the $j$ is a quarter period.`, md`$\sin\beta ${K}$ and $\cos\beta ${K}$ have zeros $\lambda/4$ apart.`, md`$\Gamma = -1$ keeps the rotation in time, but the travel reverses.`][tIx];
    const dirW = [[[e, -1], md`Sign: $\mathbf J_s = \hat n\times\mathbf H$ with $\hat n$ pointing out of the conductor, into the region $${reg}$. It comes out parallel to the incident $\mathbf E$ at the surface.`], [[3 - kk - e, 1], md`$\mathbf J_s$ is not along $\mathbf H$: it is $\hat n\times\mathbf H$, perpendicular to $\mathbf H$.`], [[3 - kk - e, -1], md`$\hat n\times\mathbf H$ is perpendicular to $\mathbf H$; this is along $\mathbf H$'s line.`], [[kk, side], md`A surface current flows in the surface, never along the normal.`]];
    const parts = [
      NT('\\text{distance from the conductor to the nearest null of}\\ |\\mathbf E|\\ \\text{(not at the surface)}', lam / 2, 'm', [[lam / 4, 'That is where |E| is largest (and |H| is zero). E nulls are λ/2 apart, starting at the surface.'], [lam, 'Nulls of sin βz repeat every λ/2, not every λ.']]),
      NT('\\text{distance to the nearest maximum of}\\ |\\mathbf E|', lam / 4, 'm', [[lam / 2, 'That is the next E null. The maximum is halfway between nulls.'], [lam / 8, 'sin β' + K + ' peaks at β' + K + ' = π/2, i.e. λ/4.']]),
      NT('|\\mathbf E|_{\\max}', 2 * E0, 'V/m', [[E0, 'Incident and reflected waves add: the peak of 2E₀ sin β' + K + ' is 2E₀.'], [4 * E0, 'Each wave has amplitude E₀; the peak of their sum is 2E₀.']]),
      NT('|\\mathbf J_s|', Js, 'A/m', [[E0 / (120 * PI), 'That is the incident H alone. At the surface the reflected H adds an equal amount.'], [2 * E0, 'J_s equals the surface H in A/m: divide by η₀.']]),
      MCP(md`The surface current $\mathbf J_s$ (when $\cos\omega t > 0$) points along…`, `$${hvs([e, 1])}$`, dirW.map(([x, w]) => [`$${hvs(x)}$`, w])),
      NT('\\text{time-averaged pressure on the conductor}', Pr, 'N/m^2', [[Pr / 2, 'That is ⟨S⟩/c, the pressure on an absorber. A reflector gets twice that.'], [2 * Pr, 'That doubled twice. The pressure is 2⟨S_i⟩/c = ε₀E₀².']]),
      stPart,
    ];
    return {
      title: 'Reflection from a perfect conductor',
      q: md`A perfect conductor fills the region on the other side of the plane $${K} = 0$; the region $${reg}$ is free space. A uniform plane wave in free space travels toward the conductor:
        $$\mathbf E_i = ${p(6 * m)}\pi\cos(\omega t ${dI > 0 ? '-' : '+'} \beta ${K})\,\hat ${Ee}\ \text{V/m}$$
        at $f = ${fTex(fq)}$. Find where the total $|\mathbf E|$ has its nulls and peaks, the peak value, the surface current, the radiation pressure, and judge the statements.`,
      parts,
      hints: [md`On a perfect conductor tangential $\mathbf E = 0$, so $\Gamma = -1$. $\mathbf J_s = \hat n\times\mathbf H$ with $\hat n$ out of the conductor.`, md`Pressure on a perfect reflector: $2\langle S_i\rangle/c = \epsilon_0E_0^2$.`],
      sol: md`
        **Step 1: the reflected wave.** Inside a perfect conductor there is no field, and the tangential $\mathbf E$ is continuous, so the total tangential $\mathbf E$ is zero at $${K} = 0$. The reflected wave must cancel the incident one there: $\Gamma = -1$. In phasors, with $E_0 = ${p(6 * m)}\pi$ V/m and $\beta = 2\pi f/c = ${piT(beta / PI)}$ rad/m:
        $$\tilde{\mathbf E}_i = E_0e^{${dI > 0 ? '-' : '+'}j\beta ${K}}\,\hat ${Ee}$$
        $$\tilde{\mathbf E}_r = -E_0e^{${dI > 0 ? '+' : '-'}j\beta ${K}}\,\hat ${Ee}$$

        **Step 2: the total E.** Add them and use $e^{jx} - e^{-jx} = 2j\sin x$:
        $$\tilde{\mathbf E} = ${dI > 0 ? '-' : ''}2jE_0\sin(\beta ${K})\,\hat ${Ee}$$
        Back to time (the $j$ becomes a quarter period):
        $$\mathbf E = ${dI > 0 ? '' : '-'}2E_0\sin(\beta ${K})\sin(\omega t)\,\hat ${Ee}$$
        It does not travel: every point just oscillates in place, with amplitude $2E_0|\sin\beta ${K}|$.

        **Step 3: nulls and peaks.** $\sin(\beta ${K}) = 0$ when $\beta|${K}| = 0, \pi, 2\pi, \ldots$, i.e. every half wavelength. Here $\lambda = c/f = ${p(lam)}$ m:
        $$\boxed{\text{nearest null: } \tfrac{\lambda}{2} = ${p(lam / 2)}\ \text{m}}$$
        The peaks sit halfway between, at $\beta|${K}| = \pi/2$:
        $$\boxed{\text{nearest peak: } \tfrac{\lambda}{4} = ${p(lam / 4)}\ \text{m}}$$
        $$\boxed{|\mathbf E|_{\max} = 2E_0 = ${p(12 * m)}\pi \approx ${f(2 * E0)}\ \text{V/m}}$$

        **Step 4: the total H.** For each wave $\mathbf H = \hat k\times\mathbf E/\eta_0$. The reflected wave flips both $\hat k$ and $\mathbf E$, so its $\mathbf H$ keeps the incident direction, $${hvs(hh)}$:
        $$\tilde{\mathbf H} = \frac{2E_0}{\eta_0}\cos(\beta ${K})\,(${hvs(hh)})$$
        $\mathbf H$ is largest at the surface, where $\mathbf E$ is zero: the two patterns are shifted by $\lambda/4$.

        **Step 5: the surface current.** The jump condition $\hat n\times(\mathbf H_1 - \mathbf H_2) = \mathbf J_s$, with no field inside, gives $\mathbf J_s = \hat n\times\mathbf H$ at the surface. $\hat n$ points out of the conductor into the field: $\hat n = ${hvs([kk, side])}$.
        $$\mathbf J_s = (${hvs([kk, side])})\times(${hvs(hh)})\,\frac{2E_0}{\eta_0}$$
        $$\boxed{\mathbf J_s = ${f(Js)}\,\hat ${Ee}\ \text{A/m}}$$
        times $\cos\omega t$ in time ($2E_0/\eta_0 = ${p(12 * m)}\pi/120\pi = ${p(m / 10)}$). It flows along the incident $\mathbf E$: a sheet with $\mathbf J_s\parallel\hat ${Ee}$ radiates $-\tfrac{\eta_0}{2}\mathbf J_s = -E_0\hat ${Ee}$, exactly the field that cancels the incident wave inside the conductor ✓.

        **Step 6: radiation pressure.** The incident wave brings momentum $\langle S_i\rangle/c$ per unit area per second, and the reflected wave carries the same amount away in the opposite direction, so the conductor receives twice that:
        $$p = \frac{2\langle S_i\rangle}{c} = \frac{2}{c}\cdot\frac{E_0^2}{2\eta_0} = \epsilon_0E_0^2$$
        $$p = \frac{(${p(6 * m)}\pi)^2}{36\pi\times10^9}$$
        $$\boxed{p = ${p(m * m)}\pi\times10^{-9} \approx ${f(Pr)}\ \text{N/m}^2}$$

        **Step 7: the statement.** True: ${TRUE[tIx]}. ${tExp}

        **Speed path.** $\Gamma = -1$. $|E| = 2E_0|\sin\beta d|$ (nulls every $\lambda/2$ from the wall), $|H| = (2E_0/\eta_0)|\cos\beta d|$. $|\mathbf J_s| = 2E_0/\eta_0$ along the incident $\mathbf E$. Pressure $\epsilon_0E_0^2$. $\langle\mathbf S\rangle = 0$.

        **Where points go.** $E_0/\eta_0$ instead of $2E_0/\eta_0$ for $\mathbf J_s$. The wrong $\hat n$ (it points out of the conductor). Pressure $\langle S\rangle/c$ (that is an absorber). Calling the first $\mathbf E$ maximum $\lambda/2$ away.
      `,
    };
  };

  // ======================================================================================== 8. coax and parallel plates
  const LNS = [[2, 0.693], [3, 1.099], [4, 1.386], [5, 1.609], [10, 2.303]];
  GENS.ex_coax = () => {
    const kind = pick(['coax', 'coax', 'inverse', 'plate']);
    const er = pick([1, 2.25, 4, 9]), n = Math.sqrt(er), v = 3e8 / n;
    const vT = n === 1 ? 'c' : n === 2 ? 'c/2' : n === 3 ? 'c/3' : '2c/3';
    if (kind === 'coax') {
      const [ba, ln] = pick(LNS), a = pick([0.5, 1, 2]), b = a * ba, len = pick([20, 40, 100, 200]), V0 = pick([10, 30, 60]);
      const C0 = 2 * PI * EPS0 * er / ln;
      const L0 = 2e-7 * ln, Z0 = 60 * ln / n, GF = 2 * PI / ln, T = len / v, I0 = V0 / Z0;
      return {
        title: 'A coaxial line from its geometry',
        q: md`A coaxial cable has inner radius $a = ${p(a)}$ mm and outer radius $b = ${p(b)}$ mm, filled with a lossless dielectric of $\epsilon_r = ${er}$ and $\mu = \mu_0$. Its capacitance per length is $\mathcal C = 2\pi\epsilon/\ln(b/a)$. Use $\ln ${ba} \approx ${ln}$. Find $\mathcal L$, $\mathcal C$, the geometric factor, $Z_0$, the wave speed, the delay of a ${len} m length, and the current that goes with a ${V0} V wave.`,
        parts: [
          NT('\\mathcal C', C0 * 1e12, 'pF/m', [[2 * PI * EPS0 / ln * 1e12, 'That used ε₀. The dielectric has ε = ε_r ε₀.'], [2 * PI * EPS0 * er * ln * 1e12, 'ln(b/a) goes in the denominator.']]),
          NT('\\mathcal L', L0 * 1e9, 'nH/m', [[L0 * 1e9 * er, 'μ = μ₀: the dielectric changes C, not L.'], [L0 * 1e9 / ln / ln, 'ln(b/a) multiplies: L = (μ/2π) ln(b/a).']]),
          NT('GF = \\mathcal C/\\epsilon', GF, '', [[ln / (2 * PI), 'Upside down: GF = 2π/ln(b/a).']]),
          NT('Z_0', Z0, 'Ω', [[60 * ln, 'That is the air-filled value. Divide by √ε_r.'], [60 * ln / er, 'Divide by √ε_r, not ε_r.'], [120 * PI / GF / er, 'Z₀ = η/GF with η = η₀/√ε_r.']]),
          NT('v', v, 'm/s', [[3e8, 'That is c. The dielectric slows the wave by √ε_r.'], [3e8 / er, 'Divide by √ε_r, not ε_r.']]),
          NT(`\\text{delay of}\\ ${len}\\ \\text{m}`, T * 1e9, 'ns', [[len / 3e8 * 1e9, 'That used c.']]),
          NT(`I^+\\ \\text{for}\\ V^+ = ${V0}\\ \\text{V}`, I0, 'A', [[V0 * Z0, 'I = V/Z₀.']]),
        ],
        hints: [md`$\mathcal L\mathcal C = \mu\epsilon$ for any TEM line, so $\mathcal L = \mu\epsilon/\mathcal C$.`, md`$Z_0 = \sqrt{\mathcal L/\mathcal C}$, $v = 1/\sqrt{\mathcal L\mathcal C}$.`],
        sol: md`
        **Step 1: $\mathcal C$, from Gauss's law.** A charge $\rho_l$ per length on the inner conductor makes $E = \rho_l/(2\pi\epsilon r)$ between the conductors. Integrate from $a$ to $b$ for the voltage:
        $$V = \frac{\rho_l}{2\pi\epsilon}\ln\frac{b}{a}$$
        Charge per length over voltage:
        $$\mathcal C = \frac{\rho_l}{V} = \frac{2\pi\epsilon}{\ln(b/a)}$$
        With $\epsilon = ${er}\epsilon_0$ and $2\pi\epsilon_0 = \frac{10^{-9}}{18}$ F/m:
        $$\mathcal C = \frac{${er}\times10^{-9}}{18(${ln})}$$
        $$\boxed{\mathcal C \approx ${f(C0 * 1e12)}\ \text{pF/m}}$$

        **Step 2: $\mathcal L$, from $\mathcal L\mathcal C = \mu\epsilon$.** Every TEM line has $v = 1/\sqrt{\mathcal L\mathcal C} = 1/\sqrt{\mu\epsilon}$. So
        $$\mathcal L = \frac{\mu\epsilon}{\mathcal C} = \frac{\mu}{2\pi}\ln\frac{b}{a}$$
        The $\epsilon$ cancels: the dielectric does not change $\mathcal L$. With $\mu_0/2\pi = 2\times10^{-7}$:
        $$\mathcal L = (2\times10^{-7})(${ln})$$
        $$\boxed{\mathcal L \approx ${f(L0 * 1e9)}\ \text{nH/m}}$$

        **Step 3: the geometric factor.** The sheet writes $\mathcal C = \epsilon\,GF$ and $\mathcal L = \mu/GF$:
        $$\boxed{GF = \frac{2\pi}{\ln(b/a)} = \frac{2\pi}{${ln}} \approx ${f(GF)}}$$

        **Step 4: $Z_0$.**
        $$Z_0 = \sqrt{\frac{\mathcal L}{\mathcal C}} = \frac{\eta}{GF} = \frac{\eta}{2\pi}\ln\frac{b}{a}$$
        With $\eta = 120\pi/${p(n)}$, $\eta/2\pi = 60/${p(n)}$ $\Omega$:
        $$Z_0 = \frac{60}{${p(n)}}(${ln})$$
        $$\boxed{Z_0 \approx ${f(Z0)}\ \Omega}$$

        **Step 5: speed and delay.**
        $$\boxed{v = \frac{c}{\sqrt{\epsilon_r}} = ${vT} = ${p(v)}\ \text{m/s}}$$
        $$\boxed{T = \frac{${len}}{${p(v)}} \approx ${f(T * 1e9)}\ \text{ns}}$$

        **Step 6: current.** A single traveling wave has $V^+/I^+ = Z_0$:
        $$\boxed{I^+ = \frac{${V0}}{${f(Z0)}} \approx ${f(I0)}\ \text{A}}$$

        **Check.** $\sqrt{\mathcal L/\mathcal C} = \sqrt{${f(L0 * 1e9)}\times10^{-9}/${f(C0 * 1e12)}\times10^{-12}} \approx ${f(Math.sqrt(L0 / C0))}\ \Omega$ ✓, and $1/\sqrt{\mathcal L\mathcal C} \approx ${f(1 / Math.sqrt(L0 * C0))}$ m/s ✓.

        **Speed path.** Coax: $Z_0 = (60/\sqrt{\epsilon_r})\ln(b/a)$, $\mathcal L = 0.2\ln(b/a)$ µH/m, $\mathcal C = \epsilon_r/(18\ln(b/a))$ nF/m, $v = c/\sqrt{\epsilon_r}$. Any two give the rest through $Z_0 = \sqrt{\mathcal L/\mathcal C}$ and $v = 1/\sqrt{\mathcal L\mathcal C}$.

        **Where points go.** Putting $\epsilon_r$ into $\mathcal L$. Dividing by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$ in $Z_0$ and $v$. Unit prefixes (pF, nH).
      `,
      };
    }
    if (kind === 'inverse') {
      const Z0 = pick([50, 60, 75, 100]), L0 = Z0 / v, C0 = 1 / (Z0 * v), ln = Z0 * n / 60, GF = 2 * PI / ln;
      return {
        title: 'A coax, backwards from Z0 and v',
        q: md`A lossless coaxial cable ($\mu = \mu_0$) has $Z_0 = ${Z0}\ \Omega$ and carries waves at $v = ${p(v)}$ m/s. Find $\mathcal L$, $\mathcal C$, the dielectric's $\epsilon_r$, the ratio $\ln(b/a)$ and the geometric factor.`,
        parts: [
          NT('\\mathcal L', L0 * 1e9, 'nH/m', [[Z0 * v * 1e9, 'Divide: Z₀/v = √(L/C)·√(LC) = L.'], [1 / (Z0 * v) * 1e9, 'That is C. L = Z₀/v.']]),
          NT('\\mathcal C', C0 * 1e12, 'pF/m', [[Z0 / v * 1e12, 'That is L. C = 1/(Z₀v).'], [v / Z0 * 1e12, 'C = 1/(Z₀v): both are in the denominator.']]),
          NT('\\epsilon_r', er, '', [[n, 'That is √ε_r. v = c/√ε_r, so ε_r = (c/v)².']].filter(([x]) => x !== er)),
          NT('\\ln(b/a)', ln, '', [[Z0 / 60, 'That is the air-filled formula. Z₀ = (60/√ε_r) ln(b/a).'], [Z0 * er / 60, 'Multiply by √ε_r, not ε_r.']].filter(([x]) => Math.abs(x - ln) > 1e-9)),
          NT('GF', GF, '', [[ln / (2 * PI), 'GF = 2π/ln(b/a).']]),
        ],
        hints: [md`$Z_0 = \sqrt{\mathcal L/\mathcal C}$ and $v = 1/\sqrt{\mathcal L\mathcal C}$. Multiply and divide them.`, md`$v = c/\sqrt{\epsilon_r}$; coax: $Z_0 = (\eta/2\pi)\ln(b/a)$.`],
        sol: md`
        **Step 1: two equations, two unknowns.** On any lossless line
        $$Z_0 = \sqrt{\frac{\mathcal L}{\mathcal C}},\qquad v = \frac{1}{\sqrt{\mathcal L\mathcal C}}$$
        Divide the first by the second: the $\mathcal C$'s cancel.
        $$\frac{Z_0}{v} = \sqrt{\frac{\mathcal L}{\mathcal C}}\sqrt{\mathcal L\mathcal C} = \mathcal L$$
        $$\mathcal L = \frac{${Z0}}{${p(v)}}$$
        $$\boxed{\mathcal L = ${f(L0 * 1e9)}\ \text{nH/m}}$$
        Multiply them instead: the $\mathcal L$'s cancel.
        $$Z_0v = \frac{1}{\mathcal C}$$
        $$\boxed{\mathcal C = \frac{1}{(${Z0})(${p(v)})} \approx ${f(C0 * 1e12)}\ \text{pF/m}}$$

        **Step 2: $\epsilon_r$.** $v = c/\sqrt{\epsilon_r}$, so
        $$\sqrt{\epsilon_r} = \frac{c}{v} = \frac{3\times10^8}{${p(v)}} = ${p(n)}$$
        $$\boxed{\epsilon_r = ${er}}$$

        **Step 3: the geometry.** For coax $Z_0 = \frac{\eta}{2\pi}\ln(b/a)$ with $\eta = 120\pi/\sqrt{\epsilon_r}$:
        $$\ln\frac{b}{a} = \frac{2\pi Z_0}{\eta} = \frac{Z_0\sqrt{\epsilon_r}}{60}$$
        $$\boxed{\ln\frac{b}{a} = \frac{(${Z0})(${p(n)})}{60} = ${f(ln)}}$$
        $$\boxed{GF = \frac{2\pi}{\ln(b/a)} \approx ${f(GF)}}$$

        **Check.** $\mathcal C = \epsilon\,GF = ${er}\cdot\frac{10^{-9}}{36\pi}\cdot${f(GF)} \approx ${f(er * EPS0 * GF * 1e12)}$ pF/m ✓.

        **Speed path.** $\mathcal L = Z_0/v$, $\mathcal C = 1/(Z_0v)$, $\epsilon_r = (c/v)^2$. Ten seconds.

        **Where points go.** Swapping $\mathcal L$ and $\mathcal C$. $\epsilon_r = c/v$ without the square.
      `,
      };
    }
    // parallel plate
    const Wcm = pick([1, 2, 5]), dmm = pick([1, 2, 5].filter((x) => x * 1 <= Wcm * 10 / 2)), W = Wcm * 1e-2, d = dmm * 1e-3;
    const GF = W / d, C0 = EPS0 * er * GF, L0 = EM.mu0 / GF, Z0 = 120 * PI / n / GF, V0 = pick([10, 20, 50]), I0 = V0 / Z0;
    const Ef = V0 / d, Hf = I0 / W;
    return {
      title: 'A parallel-plate line',
      q: md`Two parallel conducting strips of width $W = ${Wcm}$ cm are separated by $d = ${dmm}$ mm of a dielectric with $\epsilon_r = ${er}$, $\mu = \mu_0$ (ignore fringing: $W \gg d$). Find the geometric factor, $\mathcal C$, $\mathcal L$, $Z_0$ and $v$. A wave with $V^+ = ${V0}$ V travels on it: find the field $E$ between the plates and the field $H$.`,
      parts: [
        NT('GF = W/d', GF, '', [[d / W, 'Upside down: C = εW/d, so GF = W/d.']]),
        NT('\\mathcal C', C0 * 1e12, 'pF/m', [[EPS0 * GF * 1e12, 'That used ε₀.']]),
        NT('\\mathcal L', L0 * 1e9, 'nH/m', [[EM.mu0 * GF * 1e9, 'L = μd/W: GF goes in the denominator.']]),
        NT('Z_0', Z0, 'Ω', [[120 * PI / GF, 'That is air-filled. Divide by √ε_r.'], [120 * PI * GF / n, 'Z₀ = η/GF = η d/W.']]),
        NT('v', v, 'm/s', [[3e8, 'That is c.']].filter(([x]) => x !== v)),
        NT('E\\ \\text{between the plates}', Ef, 'V/m', [[V0 * d, 'E = V/d, not V·d.'], [V0 / W, 'The field spans the gap d, not the width W.']]),
        NT('H\\ \\text{between the plates}', Hf, 'A/m', [[I0, 'That is the current I; H is the current per width, I/W.'], [Ef / 120 / PI, 'That used η₀; this medium has η = η₀/√ε_r.']].filter(([x]) => !near(x, Hf))),
      ],
      hints: [md`$\mathcal C = \epsilon W/d$ and $\mathcal L = \mu d/W$, so $GF = W/d$, $Z_0 = \eta\,d/W$.`, md`The voltage is $E$ times the gap; the current per width is the surface current, which equals $H$.`],
      sol: md`
        **Step 1: the geometric factor.** A parallel-plate capacitor of width $W$ and gap $d$ has $\mathcal C = \epsilon W/d$ per length. The sheet writes $\mathcal C = \epsilon\,GF$:
        $$\boxed{GF = \frac{W}{d} = \frac{${p(W)}}{${p(d)}} = ${p(GF)}}$$

        **Step 2: $\mathcal C$ and $\mathcal L$.**
        $$\mathcal C = ${er}\cdot\frac{10^{-9}}{36\pi}\cdot${p(GF)}$$
        $$\boxed{\mathcal C \approx ${f(C0 * 1e12)}\ \text{pF/m}}$$
        $\mathcal L = \mu/GF$ (or $\mu\epsilon/\mathcal C$):
        $$\mathcal L = \frac{4\pi\times10^{-7}}{${p(GF)}}$$
        $$\boxed{\mathcal L \approx ${f(L0 * 1e9)}\ \text{nH/m}}$$

        **Step 3: $Z_0$ and $v$.**
        $$Z_0 = \frac{\eta}{GF} = \frac{120\pi/${p(n)}}{${p(GF)}}$$
        $$\boxed{Z_0 \approx ${f(Z0)}\ \Omega}$$
        $$\boxed{v = \frac{c}{\sqrt{\epsilon_r}} = ${p(v)}\ \text{m/s}}$$

        **Step 4: the fields of the wave.** The voltage is the field times the gap, so
        $$E = \frac{V^+}{d} = \frac{${V0}}{${p(d)}}$$
        $$\boxed{E = ${f(Ef)}\ \text{V/m}}$$
        The current is $I^+ = V^+/Z_0 = ${f(I0)}$ A, spread over the width $W$ as a surface current; across a current sheet $H$ jumps by $J_s$, and outside the plates $H \approx 0$, so
        $$H = \frac{I^+}{W} = \frac{${f(I0)}}{${p(W)}}$$
        $$\boxed{H \approx ${f(Hf)}\ \text{A/m}}$$
        **Check.** $E/H = ${f(Ef / Hf)}\ \Omega$, and $\eta = 120\pi/${p(n)} \approx ${f(120 * PI / n)}\ \Omega$ ✓: inside the line it is just a plane wave.

        **Speed path.** $GF = W/d$, $Z_0 = \eta d/W$, $E = V/d$, $H = I/W$, $E/H = \eta$.

        **Where points go.** $W/d$ upside down. Using $\eta_0$ in a filled line. $H = I$ instead of $I/W$.
      `,
    };
  };

  // ======================================================================================== lines in time: shared pieces
  const VT = { 300: 'c', 150: 'c/2', 200: '2c/3', 100: 'c/3' };       // speeds in m/µs
  const rT = (R) => (R === Infinity ? '\\infty' : fr(R));
  const tT = (t) => `${fr(t)}\\ \\mu\\text{s}`;
  const vT = (x) => `${fr(x)}\\ \\text{V}`;
  // resistances as fractions of Z0: [num, den]; [1, 0] is an open circuit
  const RAT = (Z0, [n, d]) => (d === 0 ? Infinity : Z0 * n / d);
  const ratEq = (a, b) => a[0] * b[1] === a[1] * b[0];
  function zig(g, x1, y1, x2, y2, body = 26) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // generator (+ series R), line sections, load; a z axis with ticks and an optional probe mark
  // o: { alt, src, rg, secs: [{ w, top, bot }], load: { kind: 'R'|'open'|'short', lab }, zt: [...], probe: { x (0..1 of the line), lab } }
  function lineFig(o) {
    const g = PF.fig({ alt: o.alt });
    const yT = 46, yB = 120, cy = 83, xs = 34, x0 = 140;
    g.circle(xs, cy, 12, { cls: 'bgfill' });
    g.add(`<path class="glyph" d="M${xs - 3.5},${cy - 5}H${xs + 3.5}M${xs},${cy - 8.5}V${cy - 1.5}M${xs - 3.5},${cy + 5}H${xs + 3.5}"/>`);
    g.label(xs - 18, cy, o.src, 'r', 'small');
    g.pl([[xs, cy - 12], [xs, yT], [56, yT]]);
    if (o.rg) { zig(g, 56, yT, 116, yT); g.label(86, yT - 10, o.rg, 'b', 'small'); } else g.line(56, yT, 116, yT);
    g.line(116, yT, x0, yT);
    g.pl([[xs, cy + 12], [xs, yB], [x0, yB]]);
    let x = x0;
    const ends = [x0];
    o.secs.forEach((s) => {
      for (const y of [yT, yB]) { g.rect(x, y - 4, s.w, 8, { cls: 'shade' }); g.rect(x, y - 4, s.w, 8); }
      g.label(x + s.w / 2, cy - 11, s.top, 'c', 'small');
      if (s.bot) g.label(x + s.w / 2, cy + 13, s.bot, 'c', 'small');
      x += s.w; ends.push(x);
    });
    const xl = x + 40;
    if (o.load.kind === 'R') {
      g.pl([[x, yT], [xl, yT], [xl, cy - 20]]); zig(g, xl, cy - 20, xl, cy + 20); g.pl([[xl, cy + 20], [xl, yB], [x, yB]]);
      g.label(xl + 12, cy, o.load.lab, 'l', 'small');
    } else if (o.load.kind === 'short') {
      g.pl([[x, yT], [xl, yT], [xl, yB], [x, yB]], { cls: 'thick' });
      g.label(xl + 10, cy, o.load.lab, 'l', 'small');
    } else {
      g.line(x, yT, x + 18, yT); g.line(x, yB, x + 18, yB); g.dot(x + 18, yT, 2.6); g.dot(x + 18, yB, 2.6);
      g.label(x + 26, cy, o.load.lab, 'l', 'small');
    }
    ends.slice(1, -1).forEach((xx) => g.line(xx, yT + 6, xx, yB + 30, { cls: 'dim dash' }));
    const ya = yB + 30;
    g.arrow(x0 - 16, ya, xl + 14, ya, { cls: 'dim', hs: 6 }); g.label(xl + 18, ya, 'z', 'l', 'small');
    ends.forEach((xx, k) => { g.line(xx, ya - 3, xx, ya + 3, { cls: 'dim' }); g.label(xx, ya + 6, o.zt[k], 't', 'small'); });
    if (o.probe) {
      const xp = x0 + o.probe.x * (x - x0);
      g.line(xp, yB + 8, xp, ya - 4, { cls: 'dim dash' }); g.dot(xp, ya, 3.2);
      g.label(xp + 5, yB + 16, o.probe.lab, 'l', 'small');
    }
    return g.svg();
  }
  // a time strictly inside (a, b), as round as possible
  const niceT = (a, b) => {
    for (const st of [1, 0.5, 0.25, 1 / 3, 1 / 6, 1 / 12]) {
      const t = (Math.floor(a / st + 1e-9) + 1) * st;
      if (t > a + 1e-9 && t < b - 1e-9) return +t.toFixed(10);
    }
    return (a + b) / 2;
  };
  // probe times (one per gap between arrivals at z) where the quantity is not zero
  const gapTimes = (s, z, tEnd, qty = 'V') => {
    const L = TL.levels(s, z, tEnd, qty), out = [];
    for (let i = 0; i < L.length; i++) {
      const a = L[i][0], b = i + 1 < L.length ? L[i + 1][0] : tEnd;
      if (b - a < 1e-9) continue;
      const t = niceT(a, b);
      if (Math.abs(TL.valueAt(s, z, t, qty)) > 1e-9) out.push(t);
    }
    return out;
  };
  // the waves passing z, with a running sum, as a table (up to and including the first one after tLast)
  // (both return markdown lines indented by 8 spaces, the indentation of the md`` solutions they are pasted into)
  const NL = String.fromCharCode(10), IND = '        ';
  const block = (lines) => lines.map((l) => IND + l).join(NL);
  const probeTable = (s, z, tLast, qty = 'V') => {
    const arr = TL.arrivals(s, z);
    const rows = [`| Wave passes at | It adds (${qty === 'I' ? 'A' : 'V'}) | Total after it |`, '|---|---|---|'];
    let run = 0;
    for (const a of arr) {
      const val = qty === 'I' ? a.i : a.v;
      const when = `$${tT(a.t)}$ (${a.dir > 0 ? 'right-going' : 'left-going'})`;
      if (a.t > tLast + 1e-9) { rows.push(`| ${when} | $${fr(val)}$ | too late |`); break; }
      run += val;
      rows.push(`| ${when} | $${fr(val)}$ | $${fr(run)}$ |`);
    }
    return block(rows);
  };
  // the first few waves, in time order, as a list
  const waveList = (s, nMax, names) => block(s.segs.slice().sort((x, y) => x.tA - y.tA || x.k - y.k).slice(0, nMax).map((w) => `- $${tT(w.tA)}$ to $${tT(w.tB)}$: $${vT(w.v)}$ ${w.dir > 0 ? 'going right' : 'going left'}${names ? ` on line ${w.k + 1}` : ''}.`));
  const loadOf = (RL, Z0) => (RL === Infinity ? { kind: 'open', lab: '\\text{open}' } : RL === 0 ? { kind: 'short', lab: '\\text{short}' } : { kind: 'R', lab: `R_L = ${fr(RL)}\\ \\Omega` });
  const GLT = (R, Z0, sub) => (R === Infinity ? md`\Gamma_${sub} = 1\ \text{(open: the current must vanish, so the wave returns unchanged)}` : R === 0 ? md`\Gamma_${sub} = -1\ \text{(short: the voltage must vanish)}` : md`\Gamma_${sub} = \frac{${fr(R)} - ${Z0}}{${fr(R)} + ${Z0}} = ${fr((R - Z0) / (R + Z0))}`);
  const LINES = [[300, 300], [600, 300], [150, 150], [300, 150], [200, 200], [400, 200], [100, 100], [200, 100]];
  const Z0S = [60, 90, 150, 300];
  const COEF = md`
        **The three coefficients (three different jobs).** $\tau_g$ is the **injection coefficient**: the fraction of $V_g$ launched at $t = 0$. $\Gamma_g$ and $\Gamma_L$ are **reflection coefficients**: what a wave arriving at that end sends back, as a fraction of itself. (Do not mix $\tau_g$ up with the transmission coefficient $\tau = 1 + \Gamma$ of a junction.)`;

  // ======================================================================================== 9. one line, a bounce diagram
  GENS.ex_bounce = () => {
    let rg, rl;
    do { rg = pick([[0, 1], [1, 3], [1, 2], [2, 1], [3, 1]]); rl = pick([[0, 1], [1, 3], [1, 2], [2, 1], [3, 1], [1, 0]]); } while (rg[0] === 0 && (rl[0] === 0 || rl[1] === 0));
    const Z0 = pick(Z0S), Rg = RAT(Z0, rg), RL = RAT(Z0, rl);
    const [len, v] = pick(LINES), T = len / v;
    const Vg = pick([36, 48, 72, 96, 144]);
    const pulse = Math.random() < 0.3;
    const zOpts = pulse ? [1 / 4, 1 / 2, 3 / 4] : [1 / 4, 1 / 2, 3 / 4, 1, 0].filter((x) => !(x === 1 && RL === 0) && !(x === 0 && Rg === 0));
    const zq = pick(zOpts), zp = zq * len, tEnd = 5 * T;
    const s = TL.solve({ Vg, Rg, RL, sections: [{ Z0, len, v }], tMax: tEnd });
    const tg = s.tauG, Gg = s.GammaG, GL = s.GammaL;
    const zpT = `${fr(zp)}\\ \\text{m}`;
    const fig = lineFig({
      alt: `circuit: a source with series resistance R_g drives a line of impedance Z_0 = ${Z0} ohm and length ${len} m, speed ${VT[v]}, ending in ${RL === Infinity ? 'an open circuit' : RL === 0 ? 'a short circuit' : `R_L = ${p(RL)} ohm`}; the probe point z = ${p(zp)} m is marked`,
      src: pulse ? '\\text{pulse}' : `${Vg}u(t)`, rg: Rg === 0 ? null : `R_g = ${fr(Rg)}\\ \\Omega`,
      secs: [{ w: 170, top: `Z_0 = ${Z0}\\ \\Omega`, bot: `v = ${VT[v]}` }], load: loadOf(RL, Z0), zt: ['0', `${len}\\ \\text{m}`],
      probe: zq > 0 && zq < 1 ? { x: zq, lab: `z = ${fr(zp)}` } : null,
    });
    const bd = TL.diagram(s, { tMax: tEnd, probe: zp, w: 380, h: 380 });
    const coefParts = [
      NT('\\tau_g', tg, '', [[Rg / (Rg + Z0), 'That is R_g/(R_g + Z₀). The line takes the share Z₀/(R_g + Z₀).'], [1 + Gg, 'That is 1 + Γ_g, a transmission coefficient. The injection coefficient is Z₀/(R_g + Z₀).']]),
      NT('\\Gamma_g', Gg, '', [[-Gg, 'Sign: Γ_g = (R_g − Z₀)/(R_g + Z₀).']]),
      NT('\\Gamma_L', GL, '', [[-GL, 'Sign: Γ_L = (R_L − Z₀)/(R_L + Z₀).']]),
    ];
    const rgLine = Rg === 0 ? md`$$\tau_g = \frac{Z_0}{0 + Z_0} = 1$$` : md`$$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac{${Z0}}{${fr(Rg)} + ${Z0}} = ${fr(tg)}$$`;
    const head = md`
        ${COEF}

        **Step 1: $\tau_g$.** At $t = 0^+$ the wave has not reached the far end, so the source sees the line as a plain resistor $Z_0$ (one traveling wave has $V^+/I^+ = Z_0$). $R_g$ and $Z_0$ form a voltage divider:
        ${rgLine}
        $$V_1^+ = \tau_g\cdot${Vg} = ${vT(tg * Vg)}$$

        **Step 2: $\Gamma_L$ and $\Gamma_g$.** At an end with resistance $R$, KVL and Ohm's law ($V^+ + V^- = R(V^+ - V^-)/Z_0$) give $\Gamma = (R - Z_0)/(R + Z_0)$. The source voltage was already used to launch $V_1^+$, so a returning wave sees only $R_g$:
        $$${GLT(RL, Z0, 'L')}$$
        $$${GLT(Rg, Z0, 'g')}$$

        **Step 3: timing.** One trip takes
        $$T = \frac{l}{v} = \frac{${len}\ \text{m}}{${v}\ \text{m}/\mu\text{s}} = ${tT(T)}$$
        A point at $z$ is reached $z/v$ after a wave leaves the generator, and $(l - z)/v$ after one leaves the load.`;
    if (pulse) {
      const V0 = Vg, arr = TL.arrivals(TL.solve({ Vg: V0, Rg, RL, sections: [{ Z0, len, v }], tMax: tEnd }), zp).slice(0, 4);
      const parts = [...coefParts,
        NT('\\text{height of the 1st pulse at the probe}', arr[0].v, 'V', [[V0, 'The line takes only the share τ_g of the source pulse.']]),
        NT('\\text{height of the 2nd pulse}', arr[1].v, 'V', [[-arr[1].v, 'Sign: multiply by Γ_L with its sign.'], [arr[0].v, 'Every reflection multiplies by a Γ.']]),
        NT('\\text{arrival time of the 2nd pulse}', arr[1].t, 'µs', [[arr[0].t + T, 'The pulse must go to the load and back: from z to l and back to z is 2(l − z)/v.'], [2 * T, 'That is the round trip of the whole line.']]),
        NT('\\text{height of the 3rd pulse}', arr[2].v, 'V', [[arr[1].v * GL, 'The 3rd pulse has reflected at the generator: multiply by Γ_g, not Γ_L again.'], [-arr[2].v, 'Sign: Γ_g × Γ_L × τ_g V₀, each with its sign.']]),
        NT('\\text{arrival time of the 3rd pulse}', arr[2].t, 'µs', [[arr[1].t + T, 'From the probe back to the generator and out again is 2z/v.']]),
      ];
      const pt = TL.plotT(TL.solve({ Vg: V0, Rg, RL, sections: [{ Z0, len, v }], tMax: tEnd }), zp, { input: 'delta', tMax: tEnd, w: 400 });
      return {
        title: 'One line, a short pulse',
        q: md`A generator with internal resistance $R_g = ${rT(Rg)}\ \Omega$ sends a very short pulse of height $V_0 = ${V0}$ V (much shorter than the line's delay) into a lossless line with $Z_0 = ${Z0}\ \Omega$, length $l = ${len}$ m and $v = ${VT[v]}$, terminated in ${RL === Infinity ? 'an open circuit' : RL === 0 ? 'a short circuit' : md`$R_L = ${fr(RL)}\ \Omega$`}. A scope watches $z = ${zpT}$.
          [[fig:ckt]]
          Find $\tau_g$, $\Gamma_g$, $\Gamma_L$, and the heights and arrival times of the first pulses at the probe.`,
        figs: { ckt: { svg: fig, cap: 'The circuit. The dot on the z axis is the probe.' }, bd: { svg: bd, cap: 'Bounce diagram: each slanted line is one pulse, labeled with its height. The dashed vertical line is the probe; each dot is a pulse passing it.' }, pt: { svg: pt, cap: 'What the scope shows at the probe.' } },
        parts,
        hints: [md`$\tau_g = Z_0/(R_g + Z_0)$, $\Gamma = (R - Z_0)/(R + Z_0)$.`, md`Pulses pass the probe at $z/v$ (first), $(2l - z)/v$ (back from the load), $(2l + z)/v$ (after the generator), and so on.`],
        sol: md`${head}

        **Step 4: follow the pulse.** The bounce diagram below has one line per pulse. Each reflection multiplies the height by that end's $\Gamma$.

        [[fig:bd]]

        **Step 5: read the probe.** The probe at $z = ${zpT}$ sees:
        | Pulse | Arrives at | Height |
        |---|---|---|
        | 1st (from the generator) | $${tT(arr[0].t)}$ | $\tau_gV_0 = ${vT(arr[0].v)}$ |
        | 2nd (back from the load) | $${tT(arr[1].t)}$ | $\Gamma_L\tau_gV_0 = ${vT(arr[1].v)}$ |
        | 3rd (after the generator) | $${tT(arr[2].t)}$ | $\Gamma_g\Gamma_L\tau_gV_0 = ${vT(arr[2].v)}$ |
        | 4th | $${tT(arr[3].t)}$ | $${vT(arr[3].v)}$ |
        The times: $${fr(zp)}/${v} = ${tT(arr[0].t)}$; then $(2l - z)/v$; then $(2l + z)/v$; each later pair is one round trip $2T = ${tT(2 * T)}$ later.

        [[fig:pt]]

        **Speed path.** Heights: $\tau_gV_0$, then multiply alternately by $\Gamma_L$ and $\Gamma_g$. Times at $z$: $z/v + 2nT$ (right-going) and $(2l - z)/v + 2nT$ (left-going).

        **Where points go.** Launching all of $V_0$ (forgetting $\tau_g$). Signs of the $\Gamma$'s. Timing the reflected pulse as $T + z/v$ instead of $(2l - z)/v$.
      `,
      };
    }
    // step input
    const cand = gapTimes(s, zp, tEnd, 'V');
    const i1 = Math.floor(Math.random() * Math.min(2, cand.length));
    const rest = cand.slice(i1 + 1);
    const t1 = cand[i1], t2 = rest.length ? rest[Math.floor(rest.length / 2 + Math.random() * (rest.length / 2))] : cand[cand.length - 1];
    const V1 = TL.valueAt(s, zp, t1), V2 = TL.valueAt(s, zp, t2);
    const L = TL.levels(s, zp, tEnd, 'V');
    const before = (t) => { const k = L.findIndex((x) => x[0] > t); const ix = (k < 0 ? L.length : k) - 2; return ix >= 0 ? L[ix][1] : NaN; };
    const after = (t) => { const k = L.findIndex((x) => x[0] > t); return k >= 0 ? L[k][1] : NaN; };
    const ic = gapTimes(s, zp, tEnd, 'I');
    const tI = ic.includes(t2) ? t2 : ic.length ? ic[ic.length - 1] : null;
    const Iv = tI === null ? 0 : TL.valueAt(s, zp, tI, 'I');
    const ssI = RL === 0, Vss = s.dc.V, Iss = s.dc.I;
    const parts = [...coefParts,
      NT(`V(${fr(zp)}\\ \\text{m},\\ ${fr(t1)}\\ \\mu\\text{s})`, V1, 'V', [[before(t1), 'That stops one wave too early.'], [after(t1), 'That includes a wave that has not reached the probe yet.'], [Vg, 'That is the source voltage: R_g takes a share.']]),
      NT(`V(${fr(zp)}\\ \\text{m},\\ ${fr(t2)}\\ \\mu\\text{s})`, V2, 'V', [[before(t2), 'That stops one wave too early.'], [after(t2), 'That includes a wave that has not reached the probe yet.']]),
    ];
    if (tI !== null) parts.push(NT(`I(${fr(zp)}\\ \\text{m},\\ ${fr(tI)}\\ \\mu\\text{s})`, Iv, 'A', [[TL.valueAt(s, zp, tI, 'V') / Z0, 'That is V/Z₀ of the total. Left-going waves carry current −V⁻/Z₀: subtract them.']]));
    parts.push(ssI ? NT('I\\ \\text{in steady state}', Iss, 'A', [[Vg / Z0, 'In DC the line is a wire: Z₀ plays no part. The current is V_g/(R_g + R_L).'], [tg * Vg / Z0, 'That is the first wave\'s current.']])
      : NT('V\\ \\text{in steady state}', Vss, 'V', [[tg * Vg, 'That is the first wave only. In DC the line is a pair of wires: V = V_g R_L/(R_g + R_L).'], [Vg, 'R_g still drops some voltage in DC.']].filter(([x]) => !(RL === Infinity && x === Vg))));
    const pt = TL.plotT(s, zp, { tMax: tEnd, w: 400 });
    return {
      title: 'One line, a step: the bounce diagram',
      q: md`A step $v_g(t) = ${Vg}u(t)$ V with internal resistance $R_g = ${rT(Rg)}\ \Omega$ drives a lossless line with $Z_0 = ${Z0}\ \Omega$, length $l = ${len}$ m and $v = ${VT[v]}$ ($c = 300$ m/µs), terminated in ${RL === Infinity ? 'an open circuit' : RL === 0 ? 'a short circuit' : md`$R_L = ${fr(RL)}\ \Omega$`}.
        [[fig:ckt]]
        Find $\tau_g$, $\Gamma_g$, $\Gamma_L$; draw the voltage bounce diagram for $0 \le t \le ${fr(tEnd)}$ µs; find $V$ at $z = ${zpT}$ at $t = ${fr(t1)}$ µs and $t = ${fr(t2)}$ µs${tI !== null ? md`, the current there at $t = ${fr(tI)}$ µs` : ''}, and the steady-state ${ssI ? 'current' : 'voltage'}.`,
      figs: { ckt: { svg: fig, cap: 'The circuit. The dot on the z axis is the probe point.' }, bd: { svg: bd, cap: `Voltage bounce diagram: position across, time downward. Each slanted line is one wave with its voltage. The dashed line is the probe at z = ${p(zp)} m; each dot is a wave passing it.` }, pt: { svg: pt, cap: `V(z = ${p(zp)} m, t). The dashed line is the steady state.` } },
      parts,
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$; $\Gamma = (R - Z_0)/(R + Z_0)$ at each end. One trip takes $T = l/v$.`, md`The voltage at a point is the sum of every wave that has already passed it. Steady state: the line is just two wires.`],
      sol: md`${head}

        **Step 4: the waves, one by one.** Each wave crosses the line in $T$; at each end it spawns the next one, multiplied by that end's $\Gamma$:
${waveList(s, 5)}

        [[fig:bd]]

        **Step 5: read the probe.** Draw a vertical line at $z = ${zpT}$. The voltage there is the sum of every wave that has crossed it:

${probeTable(s, zp, t2)}
        At $t = ${fr(t1)}$ µs, add the waves that passed before then:
        $$\boxed{V(${fr(zp)}\ \text{m}, ${fr(t1)}\ \mu\text{s}) = ${vT(V1)}}$$
        At $t = ${fr(t2)}$ µs:
        $$\boxed{V(${fr(zp)}\ \text{m}, ${fr(t2)}\ \mu\text{s}) = ${vT(V2)}}$$
        ${tI !== null ? md`
        **Step 6: the current.** A right-going wave carries $I = V/Z_0$; a left-going one carries $I = -V/Z_0$. At $t = ${fr(tI)}$ µs:
${probeTable(s, zp, tI, 'I')}
        $$\boxed{I(${fr(zp)}\ \text{m}, ${fr(tI)}\ \mu\text{s}) = ${fr(Iv)}\ \text{A}}$$` : ''}

        **Step 7: steady state.** When nothing changes in time, $L\,\partial I/\partial t = 0$ and $C\,\partial V/\partial t = 0$: the line is just two wires. The circuit is $V_g$, $R_g$ and $R_L$ in series:
        ${RL === Infinity ? md`$$I_{ss} = 0,\qquad \boxed{V_{ss} = V_g = ${Vg}\ \text{V}}$$` : RL === 0 ? md`$$V_{ss} = 0,\qquad \boxed{I_{ss} = \frac{V_g}{R_g} = \frac{${Vg}}{${fr(Rg)}} = ${fr(Iss)}\ \text{A}}$$` : md`$$\boxed{V_{ss} = V_g\frac{R_L}{R_g + R_L} = ${vT(Vss)}}$$`}

        [[fig:pt]]

        **Speed path.** Write $T$, $\tau_g$, $\Gamma_g$, $\Gamma_L$ across the top of the diagram first. Each new label is the previous one times the $\Gamma$ of the end it just hit. At a point: right-going waves pass at $z/v + 2nT$, left-going at $(2l - z)/v + 2nT$; add the labels of those that have passed.

        **Where points go.** $\tau_g$ written as $R_g/(R_g + Z_0)$. A sign of a $\Gamma$. Counting a wave that has not reached the point yet. Current: forgetting the minus sign of left-going waves. Steady state with $Z_0$ in it.
      `,
    };
  };

  // ======================================================================================== 10. two lines in series
  GENS.ex_twoline = () => {
    let Z1, Z2, Rg, RL, rl, guard = 0;
    do {
      Z1 = pick([60, 90, 150, 300]); Z2 = Z1 * pick([1 / 3, 1 / 2, 2, 3]);
      Rg = Z1 * pick([1 / 3, 1 / 2, 1, 2, 3]);
      rl = pick([[1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [1, 0], [0, 1]]); RL = RAT(Z2, rl);
      Z2 = Math.round(Z2 * 1e6) / 1e6; Rg = Math.round(Rg * 1e6) / 1e6; if (isFinite(RL)) RL = Math.round(RL * 1e6) / 1e6;
    } while (guard++ < 200 && (!Number.isInteger(Z2) || !Number.isInteger(Rg) || (isFinite(RL) && !Number.isInteger(RL)) || Z2 > 600 || (RL === 0 && false)));
    const [half, v] = pick([[150, 150], [300, 300], [100, 100], [200, 200], [150, 300]]), T = half / v, len = 2 * half;
    const Vg = pick([36, 72, 80, 144, 120]);
    const tEnd = 4 * T;
    const s = TL.solve({ Vg, Rg, RL, sections: [{ Z0: Z1, len: half, v }, { Z0: Z2, len: half, v }], tMax: tEnd });
    const j = s.junctions[0], G12 = j.fwd, t12 = j.tauF, G21 = j.back, tg = s.tauG, Gg = s.GammaG, GL = s.GammaL;
    const zp = pick([half / 3, 2 * half / 3, half + half / 2]);
    const cand = gapTimes(s, zp, tEnd, 'V');
    const i1 = Math.floor(Math.random() * Math.min(2, cand.length)), rest = cand.slice(i1 + 1);
    const t1 = cand[i1], t2 = rest.length ? rest[rest.length - 1 - Math.floor(Math.random() * Math.min(2, rest.length))] : cand[cand.length - 1];
    const V1 = TL.valueAt(s, zp, t1), V2 = TL.valueAt(s, zp, t2);
    const L = TL.levels(s, zp, tEnd, 'V');
    const before = (t) => { const k = L.findIndex((x) => x[0] > t); const ix = (k < 0 ? L.length : k) - 2; return ix >= 0 ? L[ix][1] : NaN; };
    const after = (t) => { const k = L.findIndex((x) => x[0] > t); return k >= 0 ? L[k][1] : NaN; };
    const zpT = `${fr(zp)}\\ \\text{m}`;
    const fig = lineFig({
      alt: `circuit: source ${Vg}u(t) with R_g = ${Rg} ohm drives line 1 (Z = ${Z1} ohm) from z = 0 to ${half} m, joined to line 2 (Z = ${Z2} ohm) from ${half} m to ${len} m, ending in ${RL === Infinity ? 'an open circuit' : RL === 0 ? 'a short' : `R_L = ${RL} ohm`}; both lines have speed ${VT[v]}; the probe point z = ${p(zp)} m is marked`,
      src: `${Vg}u(t)`, rg: `R_g = ${Rg}\\ \\Omega`,
      secs: [{ w: 105, top: `Z_{01} = ${Z1}\\ \\Omega`, bot: `v = ${VT[v]}` }, { w: 105, top: `Z_{02} = ${Z2}\\ \\Omega`, bot: `v = ${VT[v]}` }],
      load: loadOf(RL, Z2), zt: ['0', `${half}`, `${len}\\ \\text{m}`], probe: { x: zp / len, lab: `z = ${fr(zp)}` },
    });
    const bd = TL.diagram(s, { tMax: tEnd, probe: zp, w: 380, h: 400 });
    const pt = TL.plotT(s, zp, { tMax: tEnd, w: 400 });
    const ssV = RL === Infinity;
    const parts = [
      NT('\\tau_g', tg, '', [[Rg / (Rg + Z1), 'That is R_g/(R_g + Z₀₁). The line takes Z₀₁/(R_g + Z₀₁).'], [Z2 / (Rg + Z2), 'At t = 0⁺ the source sees line 1 only: use Z₀₁.']]),
      NT('\\Gamma_{12}\\ \\text{(from line 1 into line 2)}', G12, '', [[G21, 'That is for a wave coming from line 2. From line 1: (Z₀₂ − Z₀₁)/(Z₀₂ + Z₀₁).']]),
      NT('\\tau_{12} = 1 + \\Gamma_{12}', t12, '', [[1 - G12, 'τ = 1 + Γ, with Γ\'s sign.'], [1 + G21, 'That is τ₂₁, for waves going from line 2 into line 1.']]),
    ];
    if (Math.abs(GL) > 1e-12) parts.push(NT('\\Gamma_L', GL, '', [[-GL, 'Sign: (R_L − Z₀₂)/(R_L + Z₀₂).'], [RL === Infinity || RL === 0 ? NaN : (RL - Z1) / (RL + Z1), 'The load terminates line 2: compare R_L with Z₀₂.']]));
    if (Math.abs(Gg) > 1e-12) parts.push(NT('\\Gamma_g', Gg, '', [[-Gg, 'Sign: (R_g − Z₀₁)/(R_g + Z₀₁).']]));
    parts.push(
      NT(`V(${fr(zp)}\\ \\text{m},\\ ${fr(t1)}\\ \\mu\\text{s})`, V1, 'V', [[before(t1), 'That stops one wave too early.'], [after(t1), 'That counts a wave that has not reached the probe yet.']]),
      NT(`V(${fr(zp)}\\ \\text{m},\\ ${fr(t2)}\\ \\mu\\text{s})`, V2, 'V', [[before(t2), 'That stops one wave too early.'], [after(t2), 'That counts a wave that has not reached the probe yet.']]),
      ssV ? NT('V\\ \\text{in steady state}', Vg, 'V', [[tg * Vg, 'That is the first wave only.']])
        : NT(`I\\ \\text{in steady state at}\\ z = ${half}\\ \\text{m}`, s.dc.I, 'A', [[Vg / (Rg + Z1 + Z2), 'The impedances Z₀ play no part in DC: the lines are wires.'], [Vg / (Z2 + (RL || 0)), 'R_g is still in the circuit.']]),
    );
    const jT = md`$$\Gamma_{12} = \frac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}} = \frac{${Z2} - ${Z1}}{${Z2} + ${Z1}} = ${fr(G12)}$$
        $$\tau_{12} = 1 + \Gamma_{12} = ${fr(t12)}$$
        A wave coming back from line 2 sees line 1 as the resistor $Z_{01}$, so its coefficients have the roles swapped:
        $$\Gamma_{21} = ${fr(G21)},\qquad \tau_{21} = 1 + \Gamma_{21} = ${fr(1 + G21)}$$`;
    return {
      title: 'Two lines in series',
      q: md`A step $v_g(t) = ${Vg}u(t)$ V with $R_g = ${Rg}\ \Omega$ drives two lossless lines in series, each $${half}$ m long: line 1 ($Z_{01} = ${Z1}\ \Omega$) from $z = 0$ to $${half}$ m, then line 2 ($Z_{02} = ${Z2}\ \Omega$) to $z = ${len}$ m, terminated in ${RL === Infinity ? 'an open circuit' : RL === 0 ? 'a short circuit' : md`$R_L = ${RL}\ \Omega$`}. On both lines $v = ${VT[v]}$ ($c = 300$ m/µs).
        [[fig:ckt]]
        Find $\tau_g$ and the junction coefficients; draw the voltage bounce diagram for $0 \le t \le ${fr(tEnd)}$ µs; find $V$ at $z = ${zpT}$ at $t = ${fr(t1)}$ and $${fr(t2)}$ µs, and the steady state.`,
      figs: { ckt: { svg: fig, cap: 'The circuit. The dashed line marks the junction; the dot is the probe.' }, bd: { svg: bd, cap: `Voltage bounce diagram (time downward). The dashed vertical lines are the junction and the probe at z = ${p(zp)} m.` }, pt: { svg: pt, cap: `V at z = ${p(zp)} m against time. The dashed line is the steady state.` } },
      parts,
      hints: [md`At $t = 0^+$ the source sees only line 1: $\tau_g = Z_{01}/(R_g + Z_{01})$. At the junction a wave from line 1 sees line 2 as a resistor $Z_{02}$.`, md`Voltage is continuous at the junction: transmitted $= (1 + \Gamma_{12})\times$incident. In DC the lines are wires: $I = V_g/(R_g + R_L)$.`],
      sol: md`
        ${COEF}

        **Step 1: $\tau_g$.** At $t = 0^+$ nothing has come back from the junction, so the source sees line 1 as a resistor $Z_{01}$:
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{${Z1}}{${Rg} + ${Z1}} = ${fr(tg)}$$
        $$V_1^+ = \tau_g V_g = ${vT(tg * Vg)}$$

        **Step 2: the junction.** A wave from line 1 sees line 2 as a resistor $Z_{02}$ (it has not come back yet). The voltage is continuous across the junction, so the transmitted wave equals incident plus reflected: $\tau = 1 + \Gamma$.
        ${jT}

        **Step 3: the ends.**
        $$${GLT(RL, Z2, 'L')}$$
        $$${GLT(Rg, Z1, 'g')}$$
        (the load is compared with $Z_{02}$, the generator with $Z_{01}$).

        **Step 4: timing.** Each line takes $T = ${half}/${v} = ${tT(T)}$ to cross.

        **Step 5: the bounce diagram.** The first waves, in time order:
${waveList(s, 6, true)}

        [[fig:bd]]

        **Step 6: read the probe at $z = ${zpT}$** (on line ${zp < half ? 1 : 2}). Add every wave that has passed:

${probeTable(s, zp, t2)}
        $$\boxed{V(${fr(zp)}\ \text{m}, ${fr(t1)}\ \mu\text{s}) = ${vT(V1)}}$$
        $$\boxed{V(${fr(zp)}\ \text{m}, ${fr(t2)}\ \mu\text{s}) = ${vT(V2)}}$$

        [[fig:pt]]

        **Step 7: steady state.** In DC both lines are just wires. ${ssV ? md`With an open load no current flows, so there is no drop across $R_g$: $\boxed{V_{ss} = ${Vg}\ \text{V}}$.` : md`One loop: $V_g$, $R_g$, $R_L$:
        $$I_{ss} = \frac{V_g}{R_g + R_L} = \frac{${Vg}}{${Rg} + ${RL}}$$
        $$\boxed{I_{ss} = ${fr(s.dc.I)}\ \text{A}}$$
        the same everywhere along both lines.`}

        **Speed path.** Write the five numbers first: $\tau_g$, $\Gamma_g$, $\Gamma_{12}$ (and $\tau_{12}$), $\Gamma_{21}$ (and $\tau_{21}$), $\Gamma_L$. Every label in the diagram is a parent label times one of them. At the probe, list the crossing times, add the labels before your $t$.

        **Where points go.** $\tau_g$ with $Z_{02}$ or with $R_g$ on top. Using $\Gamma_{12}$ for a wave coming back from line 2. Current coefficient used for voltage ($1 - \Gamma$ instead of $1 + \Gamma$). Including $Z_0$'s in the DC answer.
      `,
    };
  };

  // ======================================================================================== 11. a scope trace, read backwards
  GENS.ex_scope = () => {
    const Z0 = pick([50, 60, 75, 100]);
    const RSET = [[0, 1], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [1, 0]];
    const rl = pick(RSET.filter((x) => !ratEq(x, [1, 1]))), rg = pick(RSET.filter((x) => x[1] !== 0));
    const RL = RAT(Z0, rl), Rg = RAT(Z0, rg);
    const v = pick([300, 150, 200, 100]), er = (300 / v) ** 2;
    const mid = Math.random() < 0.7, t1 = pick([0.5, 1]);
    const len = mid ? 2 * v * t1 : 4 * v * t1, zp = mid ? len / 2 : len / 4;
    const V0 = pick([12, 24, 36, 48, 60]);
    const s = TL.solve({ Vg: V0, Rg, RL, sections: [{ Z0, len, v }], tMax: 12 * len / v });
    const arr = TL.arrivals(s, zp);
    const A = arr[0].v, GL = s.GammaL, Gg = s.GammaG;
    const shown = Math.abs(Gg) < 1e-12 ? 2 : 3;
    const tl = arr.slice(0, shown);
    const aT = (r) => (Math.abs(r - 1) < 1e-9 ? 'A' : Math.abs(r + 1) < 1e-9 ? '-A' : `${fr(r)}A`);
    const tMaxP = tl[shown - 1].t * 1.25;
    const ys = tl.map((x) => x.v / A), ymax = Math.max(1, ...ys.map(Math.abs));
    const trace = PF.plot({
      w: 380, h: 210, x: [0, tMaxP], y: [-1.3 * ymax, 1.3 * ymax], zero: true, xl: 't\\,(\\mu\\text{s})', yl: 'V(z_p, t)',
      xt: tl.map((x) => [x.t, fr(x.t)]),
      curves: tl.map((x) => ({ pts: [[x.t, 0], [x.t, x.v / A]], cls: 'thick' })),
      pts: tl.map((x) => ({ x: x.t, y: x.v / A, lab: aT(x.v / A) })),
    });
    const RLopt = (R) => `$${rT(R)}\\ \\Omega$`;
    const allR = RSET.map((x) => RAT(Z0, x));
    const rlWhy = (R) => (R === Infinity ? md`That would give $\Gamma_L = +1$: the second pulse would equal the first.` : R === Z0 ? md`A matched load reflects nothing: there would be no second pulse at all.` : R === 0 ? md`That would give $\Gamma_L = -1$: the second pulse would be $-A$.` : md`That gives $\Gamma_L = ${fr((R - Z0) / (R + Z0))}$, so the second pulse would be $${aT((R - Z0) / (R + Z0))}$.`);
    const rgWhy = (R) => (R === Infinity ? md`An open generator would launch nothing at all ($\tau_g = 0$).` : md`That gives $\Gamma_g = ${fr((R - Z0) / (R + Z0))}$, so the third pulse would be $\Gamma_g\Gamma_L A = ${aT((R - Z0) / (R + Z0) * GL)}$${Math.abs(R - Z0) < 1e-9 ? ' (none at all)' : ''}.`);
    const parts = [
      NT('\\epsilon_r', er, '', [[300 / v, 'That is √ε_r = c/v. Square it.'], [(300 * t1 / len) ** 2, 'The first pulse has traveled to the probe, z_p, not the whole line.']].filter(([x]) => !near(x, er))),
      NT('\\Gamma_L', GL, '', [[-GL, 'The second pulse is Γ_L times the first, sign included.'], [1 / GL, 'Upside down: Γ_L = (2nd height)/(1st height).']]),
      MCP('The load resistance $R_L$ is…', RLopt(RL), allR.filter((R) => R !== RL).map((R) => [RLopt(R), rlWhy(R)])),
      MCP('The generator resistance $R_g$ is…', RLopt(Rg), allR.filter((R) => R !== Rg).map((R) => [RLopt(R), rgWhy(R)])),
      NT('A', A, 'V', [[V0, 'The line takes only τ_g of the source pulse.'], [V0 * (1 - s.tauG), 'That is R_g/(R_g + Z₀). The line\'s share is Z₀/(R_g + Z₀).']]),
    ];
    if (shown === 3) {
      parts.push(NT('\\text{height of the next pulse}', arr[3].v, 'V', [[-arr[3].v, 'Sign: the 4th pulse is Γ_L times the 3rd.'], [arr[2].v * Gg, 'The 4th pulse comes back from the load: multiply the 3rd by Γ_L.']]));
      parts.push(NT('\\text{its arrival time}', arr[3].t, 'µs', [[arr[2].t + (arr[1].t - arr[0].t) / 2, 'The 4th pulse goes from the probe to the load and back: 2(l − z_p)/v after the 3rd.'], [arr[2].t + 2 * len / v, 'That is a full round trip; it only needs probe → load → probe.']]));
    } else {
      parts.push(NT('\\text{when the first pulse reaches the load}', len / v, 'µs', [[t1, 'That is when it reaches the probe.'], [2 * len / v, 'That is the round trip.']]));
    }
    return {
      title: 'A scope trace, read backwards',
      q: md`A pulse generator with unknown internal resistance $R_g$ sends a very short pulse of height $V_0 = ${V0}$ V at $t = 0$ into a lossless, non-magnetic line with $Z_0 = ${Z0}\ \Omega$ and length $l = ${len}$ m, terminated in an unknown resistor $R_L$. A scope at $z_p = ${zp}$ m (${mid ? 'the midpoint' : 'a quarter of the way along'}) records the trace below: ${shown === 3 ? 'three pulses' : 'two pulses'} of heights ${tl.map((x) => `$${aT(x.v / A)}$`).join(', ')} at ${tl.map((x) => `$${tT(x.t)}$`).join(', ')}${shown === 2 ? '. No other pulses are ever observed' : ''}.
        [[fig:tr]]
        Find $\epsilon_r$, $\Gamma_L$, $R_L$, $R_g$, the height $A$${shown === 3 ? ', and the height and time of the next pulse' : ', and when the first pulse reaches the load'}.`,
      figs: { tr: { svg: trace, cap: `The scope trace at z = ${zp} m, heights in units of A.` } },
      parts,
      hints: [md`The first pulse traveled $z_p$ in $${tT(tl[0].t)}$. The second came back from the load: its height is $\Gamma_L$ times the first.`, md`${shown === 3 ? md`The third has reflected at the generator: it is $\Gamma_g$ times the second.` : md`No third pulse means nothing reflects at the generator: $\Gamma_g = 0$.`} Then $R = Z_0(1 + \Gamma)/(1 - \Gamma)$.`],
      sol: md`
        **Step 1: which pulse is which.** The first pulse comes straight from the generator. The second has gone on to the load and back to the probe. ${shown === 3 ? 'The third has gone back to the generator, reflected, and come out again.' : 'A third would need a reflection at the generator.'}

        **Step 2: the speed, then $\epsilon_r$.** The first pulse covered $z_p = ${zp}$ m in $${tT(tl[0].t)}$:
        $$v = \frac{${zp}\ \text{m}}{${fr(tl[0].t)}\ \mu\text{s}} = ${v}\ \text{m}/\mu\text{s}$$
        $v = c/\sqrt{\epsilon_r}$ with $c = 300$ m/µs:
        $$\sqrt{\epsilon_r} = \frac{300}{${v}} = ${fr(300 / v)}$$
        $$\boxed{\epsilon_r = ${fr(er)}}$$
        **Check with the second pulse:** it traveled $2(l - z_p) = ${2 * (len - zp)}$ m more, which takes $${tT(2 * (len - zp) / v)}$; it arrives at $${tT(tl[1].t)}$ ✓.

        **Step 3: the load.** The load multiplies the pulse by $\Gamma_L$:
        $$\Gamma_L = \frac{\text{2nd}}{\text{1st}} = \frac{${aT(tl[1].v / A)}}{A}$$
        $$\boxed{\Gamma_L = ${fr(GL)}}$$
        Turn $\Gamma = (R - Z_0)/(R + Z_0)$ around: $R = Z_0(1 + \Gamma)/(1 - \Gamma)$.
        ${RL === Infinity ? md`$$\Gamma_L = 1:\quad \boxed{R_L = \infty\ \text{(open)}}$$` : RL === 0 ? md`$$\Gamma_L = -1:\quad \boxed{R_L = 0\ \text{(short)}}$$` : md`$$R_L = ${Z0}\cdot\frac{1 + (${fr(GL)})}{1 - (${fr(GL)})}$$
        $$\boxed{R_L = ${fr(RL)}\ \Omega}$$`}

        **Step 4: the generator.** ${shown === 3 ? md`The third pulse is the second one reflected at the generator:
        $$\Gamma_g = \frac{\text{3rd}}{\text{2nd}} = \frac{${aT(tl[2].v / A)}}{${aT(tl[1].v / A)}} = ${fr(Gg)}$$
        ${Rg === 0 ? md`$$\Gamma_g = -1:\quad \boxed{R_g = 0}$$` : md`$$R_g = ${Z0}\cdot\frac{1 + (${fr(Gg)})}{1 - (${fr(Gg)})}$$
        $$\boxed{R_g = ${fr(Rg)}\ \Omega}$$`}` : md`No third pulse ever arrives, so the generator absorbs the returning pulse completely: $\Gamma_g = 0$,
        $$\boxed{R_g = Z_0 = ${Z0}\ \Omega}$$`}

        **Step 5: the height $A$.** The generator launches the share $\tau_g = Z_0/(R_g + Z_0)$ of its pulse:
        $$\tau_g = \frac{${Z0}}{${fr(Rg)} + ${Z0}} = ${fr(s.tauG)}$$
        $$\boxed{A = \tau_gV_0 = ${vT(A)}}$$
        ${shown === 3 ? md`
        **Step 6: the next pulse.** After the third (right-going) pulse passes the probe it reaches the load and comes back multiplied by $\Gamma_L$, a time $2(l - z_p)/v$ later:
        $$\Gamma_L\cdot${vT(tl[2].v)} = ${vT(arr[3].v)}$$
        $$\boxed{${vT(arr[3].v)}\ \text{at}\ ${tT(arr[3].t)}}$$` : md`
        **Step 6: the load.** The first pulse reaches $z = l$ at
        $$\boxed{t = \frac{l}{v} = \frac{${len}}{${v}} = ${tT(len / v)}}$$`}

        **Speed path.** Speed from the first pulse; $\Gamma_L$ = 2nd/1st; $\Gamma_g$ = 3rd/2nd (no 3rd: $R_g = Z_0$). Resistances from $\Gamma = \pm\tfrac13 \to 2Z_0, Z_0/2$; $\pm\tfrac12 \to 3Z_0, Z_0/3$; $\pm1 \to \infty, 0$.

        **Where points go.** Using the whole line length for the first pulse's trip. Dropping the sign of a pulse (it decides $R > Z_0$ or $R < Z_0$). $\Gamma_g$ as 3rd/1st (that is $\Gamma_g\Gamma_L$). Forgetting $\tau_g$ in $A$.
      `,
    };
  };

  // ======================================================================================== 12. stubs and resonance
  const TANS = { '1/6': ['\\tfrac{1}{\\sqrt3}', 1 / Math.sqrt(3)], '1/4': ['1', 1], '1/3': ['\\sqrt3', Math.sqrt(3)], '2/3': ['-\\sqrt3', -Math.sqrt(3)], '3/4': ['-1', -1], '5/6': ['-\\tfrac{1}{\\sqrt3}', -1 / Math.sqrt(3)] };
  const MHz = (x) => `${fr(x / 1e6)}\\ \\text{MHz}`;
  GENS.ex_stub = () => {
    const short = Math.random() < 0.6;
    const Z0 = pick([50, 75, 100]);
    const [len, v] = pick([[1, 3e8], [0.5, 3e8], [1.5, 3e8], [1, 2e8], [2, 2e8], [0.5, 2e8], [1, 1.5e8], [3, 1.5e8]]);
    const fA = v / (4 * len);                         // beta l = pi/2
    const f0 = short ? 2 * fA : fA, fInf = short ? fA : 2 * fA, f2nd = short ? 3 * fA : 4 * fA;
    const thK = pick(Object.keys(TANS)), [tanT, tanV] = TANS[thK];
    const [nn, dd] = thK.split('/').map(Number), th = nn / dd;
    const f1 = th * v / (2 * len), w1 = 2 * PI * f1;
    const X = short ? Z0 * tanV : -Z0 / tanV;
    const ind = X > 0;
    const Leq = X / w1, Ceq = -1 / (w1 * X);
    const vT2 = v === 3e8 ? 'c' : v === 2e8 ? '2c/3' : 'c/2';
    const thT = `\\tfrac{${nn === 1 ? '' : nn}\\pi}{${dd}}`;
    const kind = ind ? 'inductive' : 'capacitive';
    const KO = ['inductive (like an inductor)', 'capacitive (like a capacitor)', 'a short circuit ($Z = 0$)', 'an open circuit ($Z = \\infty$)'];
    const rightK = ind ? KO[0] : KO[1];
    const parts = [
      NT('\\text{lowest}\\ f > 0\\ \\text{with}\\ Z_{in} = 0', f0 / 1e6, 'MHz', [[fInf / 1e6, `That makes Z_in infinite: for ${short ? 'a short' : 'an open'} end, βl = π/2 gives ${short ? 'tan → ∞' : 'cot = 0'}.`], [f0 * 2 * PI / 1e6, 'That is ω in Mrad/s. The question asks for f.']]),
      NT('\\text{lowest}\\ f\\ \\text{with}\\ Z_{in} = \\infty', fInf / 1e6, 'MHz', [[f0 / 1e6, 'That makes Z_in zero.'], [fInf * 2 * PI / 1e6, 'That is ω, not f.']]),
      NT(`X_{in}\\ \\text{at}\\ ${fr(f1 / 1e6)}\\ \\text{MHz}\\ (Z_{in} = jX_{in})`, X, 'Ω', [[-X, 'Sign: ' + (short ? 'a short gives Z = jZ₀ tan βl.' : 'an open gives Z = −jZ₀ cot βl.')], [short ? -Z0 / tanV : Z0 * tanV, short ? 'That is the open-circuit formula. A shorted line has Z = jZ₀ tan βl.' : 'That is the short-circuit formula. An open line has Z = −jZ₀ cot βl.']]),
      MCP(md`At $f = ${MHz(f1)}$ the input looks…`, rightK, KO.filter((x) => x !== rightK).map((x) => [x, x === KO[2] || x === KO[3] ? md`$\beta l = ${thT}$ is not a multiple of $\pi/2$, so the input is neither a short nor an open.` : md`The sign of $X_{in}$ decides: positive is inductive ($j\omega L$), negative is capacitive ($1/j\omega C = -j/\omega C$). Here $X_{in} = ${f(X)}\ \Omega$.`])),
      ind ? NT(`L_{eq}\\ \\text{at}\\ ${fr(f1 / 1e6)}\\ \\text{MHz}`, Leq * 1e9, 'nH', [[X / f1 * 1e9, 'That divided by f. X = ωL with ω = 2πf.']])
        : NT(`C_{eq}\\ \\text{at}\\ ${fr(f1 / 1e6)}\\ \\text{MHz}`, Ceq * 1e12, 'pF', [[-1 / (f1 * X) * 1e12, 'That used f. X = −1/(ωC) with ω = 2πf.']]),
      NT('\\text{2nd-lowest}\\ f\\ \\text{with no current through}\\ R', f2nd / 1e6, 'MHz', [[2 * fInf / 1e6, short ? 'For a shorted stub the opens come at βl = π/2, 3π/2, …: odd multiples of the first.' : 'That is a short (series resonance): maximum current, not zero.'], [f0 / 1e6, 'That frequency makes Z_in = 0: the most current, not none.']].filter(([x]) => !near(x, f2nd / 1e6))),
    ];
    const fig = lineFig({ alt: `circuit: a sinusoidal source with series resistor R feeds a line of impedance Z_0 = ${Z0} ohm and length ${len} m, ${short ? 'shorted' : 'open'} at the far end`, src: '\\tilde F', rg: 'R', secs: [{ w: 170, top: `Z_0 = ${Z0}\\ \\Omega`, bot: `v = ${vT2}` }], load: short ? { kind: 'short', lab: '\\text{short}' } : { kind: 'open', lab: '\\text{open}' }, zt: ['d = l', 'd = 0'] });
    return {
      title: `A${short ? ' shorted' : 'n open'} stub`,
      q: md`A lossless line with $Z_0 = ${Z0}\ \Omega$, length $l = ${p(len)}$ m and $v = ${vT2}$ is ${short ? 'short-circuited' : 'left open'} at the far end. Its input is in series with a sinusoidal source and a resistor $R$.
        [[fig:ckt]]
        Find the lowest frequency ($f > 0$) at which $Z_{in} = 0$, the lowest at which $Z_{in} = \infty$, $Z_{in}$ at $f = ${MHz(f1)}$ and what element it acts like there, and the second-lowest frequency at which no current flows through $R$.`,
      figs: { ckt: { svg: fig, cap: 'The source, the resistor and the stub. d is measured back from the far end.' } },
      parts,
      hints: [md`Short: $Z(d) = jZ_0\tan\beta d$. Open: $Z(d) = -jZ_0\cot\beta d$. With $\beta l = 2\pi f l/v$.`, md`No current through $R$ means the stub's input is an open circuit: $Z_{in} = \infty$.`],
      sol: md`
        **Step 1: the stub's impedance, from $V(d)$ and $I(d)$.** On the line, $\tilde V(d) = V^+(e^{j\beta d} + \Gamma_Le^{-j\beta d})$ and $\tilde I(d) = \tfrac{V^+}{Z_0}(e^{j\beta d} - \Gamma_Le^{-j\beta d})$. ${short ? md`A short has $\Gamma_L = -1$:
        $$\tilde V = 2jV^+\sin\beta d,\qquad \tilde I = \frac{2V^+}{Z_0}\cos\beta d$$
        Divide:
        $$Z(d) = jZ_0\tan\beta d$$` : md`An open has $\Gamma_L = +1$:
        $$\tilde V = 2V^+\cos\beta d,\qquad \tilde I = \frac{2jV^+}{Z_0}\sin\beta d$$
        Divide (and $1/j = -j$):
        $$Z(d) = -jZ_0\cot\beta d$$`}
        At the input $d = l$, and $\beta l = \omega l/v = 2\pi fl/v$. With $l/v = ${p(len)}/${p(v)}$ s, $\beta l = \pi/2$ happens at
        $$f_A = \frac{v}{4l} = \frac{${p(v)}}{4(${p(len)})} = ${MHz(fA)}$$

        **Step 2: $Z_{in} = 0$ (series resonance).** ${short ? md`$\tan\beta l = 0$ at $\beta l = \pi, 2\pi, \ldots$ The lowest nonzero is $\beta l = \pi$: the line is half a wavelength.` : md`$\cot\beta l = 0$ at $\beta l = \pi/2, 3\pi/2, \ldots$ The lowest is $\beta l = \pi/2$: a quarter wavelength turns the open into a short.`}
        $$\boxed{f = ${short ? '2f_A' : 'f_A'} = ${MHz(f0)}}$$

        **Step 3: $Z_{in} = \infty$ (parallel resonance).** ${short ? md`$\tan\beta l\to\infty$ at $\beta l = \pi/2, 3\pi/2, \ldots$: a quarter wavelength turns the short into an open.` : md`$\cot\beta l\to\infty$ at $\beta l = \pi, 2\pi, \ldots$: half a wavelength repeats the open.`}
        $$\boxed{f = ${short ? 'f_A' : '2f_A'} = ${MHz(fInf)}}$$

        **Step 4: at $f = ${MHz(f1)}$.** The electrical length is
        $$\beta l = \frac{2\pi(${fr(f1 / 1e6)}\times10^6)(${p(len)})}{${p(v)}} = ${thT}$$
        ${short ? md`$$Z_{in} = j${Z0}\tan(${thT}) = j${Z0}\cdot(${tanT})$$` : md`$$Z_{in} = -j${Z0}\cot(${thT}) = \frac{-j${Z0}}{${tanT}}$$`}
        $$\boxed{Z_{in} = j(${f(X)})\ \Omega}$$
        ${ind ? md`Positive reactance, like $j\omega L$: **inductive**. The equivalent inductance:
        $$L = \frac{X}{\omega} = \frac{${f(X)}}{2\pi(${fr(f1 / 1e6)}\times10^6)}$$
        $$\boxed{L \approx ${f(Leq * 1e9)}\ \text{nH}}$$` : md`Negative reactance, like $1/j\omega C = -j/\omega C$: **capacitive**. The equivalent capacitance:
        $$C = \frac{-1}{\omega X} = \frac{1}{2\pi(${fr(f1 / 1e6)}\times10^6)(${f(-X)})}$$
        $$\boxed{C \approx ${f(Ceq * 1e12)}\ \text{pF}}$$`}

        **Step 5: no current through $R$.** The resistor carries the stub's input current. It is zero when the stub is an open circuit, $Z_{in} = \infty$: the frequencies of Step 3, ${short ? md`odd multiples of $f_A$ ($\beta l = \pi/2, 3\pi/2, \ldots$)` : md`multiples of $2f_A$ ($\beta l = \pi, 2\pi, \ldots$)`}. The second-lowest:
        $$\boxed{f = ${short ? '3f_A' : '4f_A'} = ${MHz(f2nd)}}$$

        **Check, by picture.** ${short ? md`Below $f_A$ ($\beta l < \pi/2$) a short line is a short loop of wire: inductive. Between $f_A$ and $2f_A$ it is capacitive.` : md`Below $f_A$ an open line is two plates: capacitive. Between $f_A$ and $2f_A$ it is inductive.`} At $\beta l = ${thT}$ that gives ${kind} ✓.

        **Speed path.** Find $f_A = v/4l$ (quarter wave). ${short ? 'Short' : 'Open'}: ${short ? md`$Z = 0$ at $2f_A, 4f_A, \ldots$; $Z = \infty$ at $f_A, 3f_A, \ldots$` : md`$Z = 0$ at $f_A, 3f_A, \ldots$; $Z = \infty$ at $2f_A, 4f_A, \ldots$`}. In between, read the sign of ${short ? '$\\tan$' : '$-\\cot$'}.

        **Where points go.** Swapping the short and open formulas. Giving $\omega$ when $f$ is asked. "No current" read as $Z_{in} = 0$ (that is the most current). The sign of the reactance.
      `,
    };
  };

  // ======================================================================================== 13. quarter- and half-wave sections
  const QWM = [[50, 200, 100], [25, 100, 50], [50, 72, 60], [36, 100, 60], [100, 25, 50], [50, 18, 30], [75, 300, 150], [200, 50, 100], [50, 450, 150], [100, 400, 200]];
  GENS.ex_qw = () => {
    const kind = pick(['match', 'match', 'given', 'half']);
    const fq = pick([100e6, 150e6, 300e6, 1e9]), v = pick([3e8, 2e8]), vT2 = v === 3e8 ? 'c' : '2c/3';
    const lam = v / fq;
    let Rg, RL, Z0, F, Zin;
    if (kind === 'match') { [Rg, RL, Z0] = pick(QWM); F = pick([2, 4, 10, 20]); Zin = Rg; }
    else {
      Rg = pick([25, 50, 100]); Z0 = pick([50, 100]); RL = pick([25, 50, 100, 200].filter((x) => x !== Z0)); F = pick([3, 6, 12]);
      Zin = kind === 'half' ? RL : Z0 * Z0 / RL;
    }
    const quarter = kind !== 'half';
    const Vin = F * Zin / (Rg + Zin), P = Vin * Vin / (2 * Zin);
    const VL = quarter ? Vin * RL / Z0 : Vin, vswr = Math.max(RL, Z0) / Math.min(RL, Z0);
    const secLen = quarter ? lam / 4 : lam / 2;
    const PH = ['$-90°$', '$+90°$', '$0°$', '$180°$'], phR = quarter ? PH[0] : PH[3];
    const parts = [];
    if (kind === 'match') parts.push(NT('Z_T\\ \\text{for a match}', Z0, 'Ω', [[(Rg + RL) / 2, 'That is the average. A quarter-wave section needs the geometric mean √(R_g R_L).'], [Math.sqrt(RL * 50), 'Match to the source resistance R_g.']].filter(([x]) => !near(x, Z0))));
    else parts.push(NT('Z_{in}', Zin, 'Ω', quarter ? [[RL, 'That is a half-wave line. A quarter wave inverts: Z₀²/R_L.'], [RL * RL / Z0, 'Upside down: Z_in = Z₀²/R_L.']] : [[Z0 * Z0 / RL, 'That is a quarter-wave line. A half wave repeats the load.']]));
    parts.push(
      NT('\\text{section length}', secLen * 100, 'cm', [[(quarter ? lam / 2 : lam / 4) * 100, quarter ? 'That is λ/2.' : 'That is λ/4.'], [(quarter ? 3e8 / fq / 4 : 3e8 / fq / 2) * 100, 'That used c. On this line λ = v/f.']].filter(([x]) => !near(x, secLen * 100))),
      NT('|\\tilde V_{in}|', Vin, 'V', [[F, 'R_g takes a share: V_in = F Z_in/(R_g + Z_in).'], [F * Rg / (Rg + Zin), 'That is the voltage across R_g.']].filter(([x]) => !near(x, Vin))),
      NT('\\text{power to the load}', P, 'W', [[F * F / (2 * Rg), 'That is all of F across R_g. Use |V_in|²/(2Z_in).'], [Vin * Vin / Zin, 'Missing the 1/2 of a time average.'], [Vin * Vin / (2 * RL), 'At the input the voltage is V_in and the resistance Z_in, not R_L.']].filter(([x]) => !near(x, P))),
      NT('|\\tilde V_L|', VL, 'V', quarter ? [[Vin, 'A quarter-wave line changes the size of V: |V_L| = |V_in| R_L/Z₀.'], [Vin * Z0 / RL, 'Upside down: |V_L| = |V_in| R_L/Z₀.']] : [[Vin * RL / Z0, 'A half-wave line keeps |V|.']]),
      NT('\\text{VSWR on the section}', vswr, '', [[1, 'The section is not matched to R_L: only the input is matched.']]),
      MCP(md`The phase of $\tilde V_L$ relative to $\tilde V_{in}$ is…`, phR, PH.filter((x) => x !== phR).map((x) => [x, quarter ? md`Over a quarter wave the forward wave lags $90°$, and $\tilde V_L/\tilde V_{in} = -jR_L/Z_0$: a pure $-j$.` : md`Over a half wave $e^{j\beta l} = -1$: $\tilde V_{in} = -\tilde V_L$.`])),
    );
    const fig = lineFig({ alt: `circuit: a sinusoidal source of amplitude ${F} V with R_g = ${Rg} ohm feeds a ${quarter ? 'quarter' : 'half'}-wave line ${kind === 'match' ? 'of unknown impedance Z_T' : `of impedance ${Z0} ohm`} ending in R_L = ${RL} ohm`, src: `${F}\\angle0°`, rg: `R_g = ${Rg}\\ \\Omega`, secs: [{ w: 170, top: kind === 'match' ? 'Z_T = ?' : `Z_0 = ${Z0}\\ \\Omega`, bot: `l = \\lambda/${quarter ? 4 : 2}` }], load: { kind: 'R', lab: `R_L = ${RL}\\ \\Omega` }, zt: ['d = l', 'd = 0'] });
    return {
      title: kind === 'match' ? 'A quarter-wave match' : quarter ? 'A quarter-wave section' : 'A half-wave section',
      q: md`A source $\tilde F = ${F}\angle0°$ V with $R_g = ${Rg}\ \Omega$ drives a load $R_L = ${RL}\ \Omega$ through a lossless ${quarter ? 'quarter' : 'half'}-wave section ${kind === 'match' ? md`whose impedance $Z_T$ you choose so that the source sees a match` : md`with $Z_0 = ${Z0}\ \Omega$`}. The frequency is $f = ${fTex(fq)}$ and $v = ${vT2}$ on the section.
        [[fig:ckt]]
        Find ${kind === 'match' ? '$Z_T$' : '$Z_{in}$'}, the section's length, $|\tilde V_{in}|$, the time-averaged power to the load, $|\tilde V_L|$, the VSWR on the section, and the phase of $\tilde V_L$ relative to $\tilde V_{in}$.`,
      figs: { ckt: { svg: fig, cap: 'The source, the section and the load. d is measured back from the load.' } },
      parts,
      hints: [md`$\lambda/4$: $Z_{in} = Z_0^2/R_L$. $\lambda/2$: $Z_{in} = R_L$. Then the input circuit is a voltage divider: $\tilde V_{in} = \tilde F Z_{in}/(R_g + Z_{in})$.`, md`The line is lossless, so the power into the input is the power to the load: $|\tilde V_{in}|^2/(2Z_{in})$.`],
      sol: md`
        **Step 1: what a ${quarter ? 'quarter' : 'half'} wave does.** On the formula sheet, $Z(d) = Z_0\frac{1 + \Gamma(d)}{1 - \Gamma(d)}$ with $\Gamma(d) = \Gamma_Le^{-j2\beta d}$. At $d = \lambda/${quarter ? 4 : 2}$, $2\beta d = ${quarter ? '\\pi' : '2\\pi'}$, so $\Gamma(d) = ${quarter ? '-' : ''}\Gamma_L$. ${quarter ? md`Flipping the sign of $\Gamma$ turns $Z_0\frac{1 + \Gamma_L}{1 - \Gamma_L} = R_L$ into $Z_0\frac{1 - \Gamma_L}{1 + \Gamma_L} = Z_0^2/R_L$:
        $$Z_{in} = \frac{Z_0^2}{R_L}$$` : md`Nothing changes:
        $$Z_{in} = R_L$$`}
        ${kind === 'match' ? md`
        **Step 2: choose $Z_T$.** The source delivers the most power when it sees $Z_{in} = R_g$. Set $Z_T^2/R_L = R_g$:
        $$Z_T = \sqrt{R_gR_L} = \sqrt{(${Rg})(${RL})}$$
        $$\boxed{Z_T = ${Z0}\ \Omega}$$` : md`
        **Step 2: $Z_{in}$.**
        $$\boxed{Z_{in} = ${quarter ? md`\frac{${Z0}^2}{${RL}} = ${fr(Zin)}` : fr(Zin)}\ \Omega}$$`}

        **Step 3: the length.** On the section $\lambda = v/f = ${p(v)}/${p(fq)} = ${f(lam)}$ m, so
        $$\boxed{\tfrac{\lambda}{${quarter ? 4 : 2}} = ${f(secLen * 100)}\ \text{cm}}$$

        **Step 4: the input circuit.** The source sees $R_g$ in series with $Z_{in}$, a voltage divider:
        $$\tilde V_{in} = \tilde F\frac{Z_{in}}{R_g + Z_{in}} = ${F}\cdot\frac{${fr(Zin)}}{${Rg} + ${fr(Zin)}}$$
        $$\boxed{|\tilde V_{in}| = ${vT(Vin)}}$$

        **Step 5: power.** The line is lossless, so all the power entering it reaches the load. At the input:
        $$P = \frac{|\tilde V_{in}|^2}{2Z_{in}} = \frac{(${fr(Vin)})^2}{2(${fr(Zin)})}$$
        $$\boxed{P = ${fr(P)}\ \text{W}}$$
        ${kind === 'match' ? md`That is the most this source can give: $|\tilde F|^2/(8R_g) = ${fr(F * F / (8 * Rg))}$ W ✓.` : ''}

        **Step 6: the load voltage.** From $\tilde V(d) = V^+e^{j\beta d}(1 + \Gamma(d))$: $\tilde V_L = V^+(1 + \Gamma_L)$ and ${quarter ? md`$\tilde V_{in} = jV^+(1 - \Gamma_L)$ (since $e^{j\pi/2} = j$). Divide:
        $$\frac{\tilde V_L}{\tilde V_{in}} = \frac{1 + \Gamma_L}{j(1 - \Gamma_L)} = -j\frac{R_L}{Z_0}$$
        $$\boxed{|\tilde V_L| = ${fr(Vin)}\cdot\frac{${RL}}{${Z0}} = ${vT(VL)}}$$
        and $\tilde V_L$ lags $\tilde V_{in}$ by $90°$.` : md`$\tilde V_{in} = -V^+(1 + \Gamma_L)$ (since $e^{j\pi} = -1$). So
        $$\tilde V_L = -\tilde V_{in},\qquad \boxed{|\tilde V_L| = ${vT(VL)}}$$
        with a $180°$ phase difference.`}
        **Check.** $|\tilde V_L|^2/(2R_L) = (${fr(VL)})^2/${2 * RL} = ${fr(VL * VL / (2 * RL))}$ W, the same as Step 5 ✓.

        **Step 7: VSWR on the section.** $\Gamma_L = (R_L - Z_0)/(R_L + Z_0) = ${fr((RL - Z0) / (RL + Z0))}$ on the section, so
        $$\boxed{\text{VSWR} = \frac{1 + |\Gamma_L|}{1 - |\Gamma_L|} = ${fr(vswr)}}$$
        (for a real load, $\max(R_L, Z_0)/\min(R_L, Z_0)$). ${kind === 'match' ? 'The section itself has a standing wave; only the line before it (here the source) sees a match.' : ''}

        **Speed path.** $\lambda/4$: $Z_{in} = Z_0^2/R_L$, $|V_L| = |V_{in}|R_L/Z_0$, phase $-90°$. $\lambda/2$: $Z_{in} = R_L$, $V_L = -V_{in}$. Then a divider and $P = |V_{in}|^2/2Z_{in}$.

        **Where points go.** $\lambda$ with $c$ instead of $v$. $P$ without the $\tfrac12$. $|V_L| = |V_{in}|$ on a quarter-wave line. Matching with the average $(R_g + R_L)/2$.
      `,
    };
  };

  // ======================================================================================== 14. V(d), Gamma(d), Z(d), VSWR
  const LOADS = [[1 / 3, 0], [1 / 2, 0], [2, 0], [3, 0], [0.8, 0.6], [0.8, -0.6], [0.6, 0.8], [0.6, -0.8]];
  GENS.ex_vd = () => {
    const Z0 = pick([50, 100]), [a, b] = pick(LOADS), ZL = Cx.of(Z0 * a, Z0 * b);
    const GL = TL.gamma(ZL, Z0), gm = GL.abs(), th = GL.arg() / deg;
    const vswr = (1 + gm) / (1 - gm);
    const m = pick([1, 2, 3]), bd = m * PI / 4;
    const Gd = TL.gammaAt(GL, bd), Zd = TL.zAt(ZL, Z0, bd);
    const V0 = pick([2, 6, 10, 12]);
    const Vmax = (1 + gm) * V0, Vmin = (1 - gm) * V0, P = V0 * V0 * (1 - gm * gm) / (2 * Z0);
    const thN = ((Math.round(th) % 360) + 360) % 360;                      // 0, 90, 180, 270
    const dmax = thN / 720;                                                // in wavelengths: 2 beta d = theta
    const LOC = { 0: 'at the load', 0.125: '$\\lambda/8$ from the load', 0.25: '$\\lambda/4$ from the load', 0.375: '$3\\lambda/8$ from the load' };
    const ANG = ['$0°$', '$180°$', '$90°$', '$-90°$'], angR = `$${thN === 270 ? -90 : thN}°$`;
    const real = b === 0, ZLT = real ? `${fr(Z0 * a)}` : `${p(Z0 * a)} ${b > 0 ? '+' : '-'} j${p(Math.abs(Z0 * b))}`;
    const zImag = Math.abs(Zd.im) > 1e-9 * Zd.abs();
    const num = ZL.sub(Z0), den = ZL.add(Z0);
    const cT = (z) => z.tex(fr);
    const parts = [
      NT('|\\Gamma_L|', gm, '', [[gm * gm, 'That is |Γ_L|², the reflected power fraction.'], [ZL.abs() / Z0, 'That is |Z_L|/Z₀. Γ_L = (Z_L − Z₀)/(Z_L + Z₀).']]),
      MCP(md`The angle of $\Gamma_L$ is…`, angR, ANG.filter((x) => x !== angR).map((x) => [x, real ? md`For a real load $\Gamma_L$ is real: $${a > 1 ? 'positive, since $R_L > Z_0$' : 'negative, since $R_L < Z_0$'}$.` : md`Here $\Gamma_L = ${cT(GL)}$, which points along ${b > 0 ? '$+j$' : '$-j$'}.`])),
      NT('\\text{VSWR}', vswr, '', [[gm, 'That is |Γ_L|. VSWR = (1 + |Γ|)/(1 − |Γ|).'], [(1 - gm) / (1 + gm), 'Upside down: the VSWR is at least 1.']]),
    ];
    if (zImag) parts.push(NT(`\\Re\\,Z(d = ${m === 2 ? '\\lambda/4' : `${m === 1 ? '' : m}\\lambda/8`})`, Zd.re, 'Ω', [[ZL.re, 'That is the load itself. Moving along the line rotates Γ.']]), NT(`\\Im\\,Z(d = ${m === 2 ? '\\lambda/4' : `${m === 1 ? '' : m}\\lambda/8`})`, Zd.im, 'Ω', [[-Zd.im, 'Sign: Γ(d) = Γ_L e^{−j2βd} rotates clockwise as d grows.']]));
    else parts.push(NT(`Z(d = ${m === 2 ? '\\lambda/4' : `${m === 1 ? '' : m}\\lambda/8`})\\ \\text{(it is real)}`, Zd.re, 'Ω', [[ZL.abs(), 'That is |Z_L|.'], [Z0 * Z0 / Zd.re, 'Upside down: check which of (1 + Γ)/(1 − Γ) is on top.']]));
    parts.push(
      NT('|\\tilde V|_{\\max}', Vmax, 'V', [[2 * V0, 'That is |Γ| = 1. The peak is (1 + |Γ|)|V⁺|.'], [V0, 'Incident and reflected waves add at the peak.']]),
      MCP(md`The voltage maximum closest to the load is…`, LOC[dmax], Object.values(LOC).filter((x) => x !== LOC[dmax]).map((x) => [x, md`The maxima are where $\Gamma(d)$ is real and positive: $2\beta d = \angle\Gamma_L = ${dg(thN)}$ (plus multiples of $360°$), i.e. $d = ${fr(dmax)}\lambda$.`])),
      NT('\\text{power to the load}', P, 'W', [[V0 * V0 / (2 * Z0), 'That is the incident power only. Subtract the reflected part: × (1 − |Γ|²).'], [V0 * V0 * (1 - gm) / (2 * Z0), 'Power reflects as |Γ|², not |Γ|.']]),
    );
    const dT = m === 2 ? '\\lambda/4' : `${m === 1 ? '' : m}\\lambda/8`;
    return {
      title: 'Γ(d), VSWR and Z(d)',
      q: md`A lossless line with $Z_0 = ${Z0}\ \Omega$ is terminated in $Z_L = ${ZLT}\ \Omega$. The incident wave has $|V^+| = ${V0}$ V. Find $\Gamma_L$ (size and angle), the VSWR, $Z(d)$ at $d = ${dT}$ from the load, the largest $|\tilde V|$ on the line, where the voltage maximum nearest the load sits, and the time-averaged power delivered to the load.`,
      parts,
      hints: [md`$\Gamma_L = (Z_L - Z_0)/(Z_L + Z_0)$; multiply by the conjugate of the bottom if $Z_L$ is complex.`, md`$\Gamma(d) = \Gamma_Le^{-j2\beta d}$: each $\lambda/8$ turns it by $-90°$. $Z(d) = Z_0\dfrac{1 + \Gamma(d)}{1 - \Gamma(d)}$.`],
      sol: md`
        **Step 1: $\Gamma_L$.** The reflection coefficient compares the load with the line:
        $$\Gamma_L = \frac{Z_L - Z_0}{Z_L + Z_0} = \frac{${cT(num)}}{${cT(den)}}$$
        ${real ? md`$$\boxed{\Gamma_L = ${fr(GL.re)}}$$` : md`Multiply top and bottom by the conjugate of the bottom, $${cT(den.conj())}$:
        $$\Gamma_L = \frac{${cT(num.mul(den.conj()))}}{${fr(den.abs() ** 2)}}$$
        $$\boxed{\Gamma_L = ${cT(GL)}}$$`}
        So $|\Gamma_L| = ${fr(gm)}$ and $\angle\Gamma_L = ${dg(thN === 270 ? -90 : thN)}$.

        **Step 2: VSWR.** The voltage swings between $|V^+|(1 + |\Gamma|)$ and $|V^+|(1 - |\Gamma|)$:
        $$\boxed{\text{VSWR} = \frac{1 + ${fr(gm)}}{1 - ${fr(gm)}} = ${fr(vswr)}}$$

        **Step 3: $\Gamma$ at $d = ${dT}$.** $\beta d = ${m === 1 ? '\\pi/4' : m === 2 ? '\\pi/2' : '3\\pi/4'}$, so $2\beta d = ${m === 1 ? '\\pi/2' : m === 2 ? '\\pi' : '3\\pi/2'}$ and $e^{-j2\beta d} = ${m === 1 ? '-j' : m === 2 ? '-1' : 'j'}$:
        $$\Gamma(d) = (${cT(GL)})(${m === 1 ? '-j' : m === 2 ? '-1' : 'j'}) = ${cT(Gd)}$$

        **Step 4: $Z(d)$.** Use $Z(d) = Z_0\frac{1 + \Gamma(d)}{1 - \Gamma(d)}$:
        $$Z = ${Z0}\cdot\frac{${cT(Cx.of(1).add(Gd))}}{${cT(Cx.of(1).sub(Gd))}}$$
        ${zImag ? md`Multiply top and bottom by $${cT(Cx.of(1).sub(Gd).conj())}$; the bottom becomes $${fr(Cx.of(1).sub(Gd).abs() ** 2)}$:
        $$Z = ${Z0}\cdot\frac{${cT(Cx.of(1).add(Gd).mul(Cx.of(1).sub(Gd).conj()))}}{${fr(Cx.of(1).sub(Gd).abs() ** 2)}}$$
        $$\boxed{Z(${dT}) = ${cT(Zd)}\ \Omega}$$` : md`$$\boxed{Z(${dT}) = ${fr(Zd.re)}\ \Omega}$$
        It is real: $\Gamma(d)$ is real here, so the voltage is at a maximum or a minimum, where the line looks resistive.`}

        **Step 5: the largest voltage.**
        $$|\tilde V(d)| = |V^+|\,|1 + \Gamma(d)|$$
        It is largest where $\Gamma(d)$ points along $+1$:
        $$\boxed{|\tilde V|_{\max} = ${V0}(1 + ${fr(gm)}) = ${vT(Vmax)}}$$
        (and $|\tilde V|_{\min} = ${vT(Vmin)}$; the ratio is the VSWR ✓).

        **Step 6: where.** $\Gamma(d)$ has angle $\angle\Gamma_L - 2\beta d$. It first points along $+1$ when $2\beta d = ${dg(thN)}$:
        $$\boxed{d_{\max} = ${dmax === 0 ? '0\\ \\text{(at the load)}' : `${fr(dmax)}\\lambda`}}$$

        **Step 7: power.** $P = \frac{|V^+|^2}{2Z_0} - \frac{|V^-|^2}{2Z_0}$ with $|V^-| = |\Gamma_L||V^+|$:
        $$P = \frac{${V0}^2}{2(${Z0})}\left(1 - ${fr(gm * gm)}\right)$$
        $$\boxed{P = ${fr(P)}\ \text{W}}$$

        **Speed path.** Each $\lambda/8$ turns $\Gamma$ by $-90°$; at $\lambda/4$, $Z = Z_0^2/Z_L$. VSWR from $|\Gamma|$. Max where $\angle\Gamma(d) = 0$: $d = (\angle\Gamma_L/720°)\lambda$. Power: $\frac{|V^+|^2}{2Z_0}(1 - |\Gamma|^2)$.

        **Where points go.** The sign of the rotation ($e^{-j2\beta d}$, not $e^{+j2\beta d}$). Complex division without the conjugate. Power without the $(1 - |\Gamma|^2)$.
      `,
    };
  };
})();

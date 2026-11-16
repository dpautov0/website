/* Homework 8-11 (Fall 2026), the Exam 3 homework sets, each as one lesson in unit 'e3-hw':
     e3-hw8   Lectures 20-22: reading a TEM wave, a ramp-pulse current sheet, power through a cube, five free-space waves
     e3-hw9   Lectures 21-24: three waves from their specs, a sine current sheet, a lossy wave read backwards, the
              submarine, a sheet in a dielectric and Poynting's theorem
     e3-hw10  Lectures 24-27: a low-loss wave, sea water at three frequencies, five polarizations, two sheets lambda/4 apart
     e3-hw11  Lectures 27-30: reflection of a circular wave, a dielectric boundary, a PEC, coax and twin lead, the
              telegrapher's equations, a bounce diagram with an impulse and a step
   Every problem, part and given number is kept as assigned; the statements are restated in our own words (the sheets
   may not be redistributed) and the generative-AI activities are omitted. There is no official key: every answer was
   derived here and recomputed in Python (work-hw/hw8.py .. hw11.py). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI, ETA0 = 120 * PI, C0 = 3e8;
  const mc = (lbl, opts, a, why) => ({ lbl, mc: opts, a, why });
  const NT = (lbl, ans, unit, traps, rel) => Object.assign(N(lbl, ans, unit, rel), traps ? { traps } : {});
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });

  // ---------------------------------------------------------------- shared drawing helpers
  // a small right-handed axis triad: a points right, b up, and the third axis (a x b) out of the page, or into it when
  // o.into (then the third label is the negative of a x b, which the caller must have checked)
  function triad(g, ox, oy, aLab, bLab, nLab, o = {}) {
    const L = o.L || 34;
    g.arrow(ox, oy, ox + L, oy, { cls: 'dim', hs: 6 }); g.label(ox + L + 4, oy, aLab, 'l', 'small');
    g.arrow(ox, oy, ox, oy - L, { cls: 'dim', hs: 6 }); g.label(ox, oy - L - 4, bLab, 'b', 'small');
    if (o.into) g.otimes(ox, oy, 5); else g.odot(ox, oy, 5);
    g.label(ox - 8, oy + 8, nLab, 'tr', 'small');
  }
  // a current sheet seen edge-on (vertical dashed line) with its two waves.
  // o: { alt, at: 'z = 0', jlab, jdir: 'up' | 'out', tri: [a, b, n, into], medium: 'free space', left, right }
  function sheetFig(o) {
    const g = PF.fig({ alt: o.alt });
    const xs = 220, yT = 26, yB = 176;
    g.sheet(xs, yT, yB);
    if (o.jdir === 'out') { g.odot(xs + 16, 96, 7); g.label(xs + 28, 96, o.jlab, 'l', 'small'); }
    else { g.arrow(xs + 12, 128, xs + 12, 70, { cls: 'thick', hs: 8 }); g.label(xs + 18, 74, o.jlab, 'l', 'small'); }
    g.arrow(xs + 30, 156, xs + 130, 156, { hs: 7 }); g.label(xs + 80, 162, o.right, 't', 'small');
    g.arrow(xs - 30, 156, xs - 130, 156, { hs: 7 }); g.label(xs - 80, 162, o.left, 't', 'small');
    g.label(xs, yB + 18, o.at, 't', 'small');
    triad(g, 40, 70, o.tri[0], o.tri[1], o.tri[2], { into: o.tri[3] });
    g.text(xs - 90, 120, o.medium || 'free space', 'c', 'small'); g.text(xs + 100, 120, o.medium || 'free space', 'c', 'small');
    return g.svg();
  }

  // ================================================================ HOMEWORK 8
  // Problem 2: the sheet and its two waves
  const sheet8Fig = () => sheetFig({ alt: 'A current sheet in the plane z = 0, seen edge-on as a vertical dashed line. Its current J_s(t) points along +y (up). One wave leaves toward +z (right), one toward -z (left). Axes: z to the right, y up, x into the page.',
    at: 'z = 0', jlab: '\\mathbf J_s(t)', jdir: 'up', tri: ['z', 'y', 'x', true], left: '\\text{toward } {-z}', right: '\\text{toward } {+z}' });
  // J_s(t) in microamps per meter, t in microseconds
  const js8 = (t) => (Math.abs(t) < 1 ? 2 * t : 0);
  const js8Fig = () => PF.plot({ w: 320, h: 170, x: [-2, 2], y: [-2.6, 2.6], zero: true, xl: 't\\,(\\mu\\text{s})', yl: 'J_{sy}\\,(\\mu\\text{A/m})',
    xt: [[-1, '-1'], [1, '1']], yt: [[2, '2'], [-2, '-2']], curves: [{ f: js8, n: 800 }] });
  // E_y and H_x at z = +-1500 m (microvolts and microamps per meter)
  const EMU = 120 * PI;                                   // 120 pi uV/m per us of (t - |z|/c)
  const ey8 = (t, d) => (Math.abs(t - d) < 1 ? -EMU * (t - d) : 0);
  const plotT8 = (f, yl, ymax, yt, cap) => ({ svg: PF.plot({ w: 300, h: 170, x: [3, 7], y: [-ymax, ymax], zero: true, xl: 't\\,(\\mu\\text{s})', yl,
    xt: [[4, '4'], [5, '5'], [6, '6']], yt, curves: [{ f, n: 800 }] }), cap });
  const fig8b = PF.row([
    plotT8((t) => ey8(t, 5), 'E_y\\,(\\mu\\text{V/m})', 480, [[377, '377'], [-377, '-377']], '$E_y$ at $z = 1500$ m and at $z = -1500$ m (the same).'),
    plotT8((t) => (Math.abs(t - 5) < 1 ? t - 5 : 0), 'H_x\\,(\\mu\\text{A/m})', 1.3, [[1, '1'], [-1, '-1']], '$H_x$ at $z = +1500$ m.'),
  ]);
  const fig8c = { svg: plotT8((t) => (Math.abs(t - 5) < 1 ? -(t - 5) : 0), 'H_x\\,(\\mu\\text{A/m})', 1.3, [[1, '1'], [-1, '-1']], '').svg, cap: '$H_x$ at $z = -1500$ m: the mirror image of $H_x$ at $+1500$ m. $E_y$ is the same as at $+1500$ m.' };
  // snapshot at t = 6 us: s = 6 - |z|/c (us)
  const s6 = (z) => 6 - Math.abs(z) / 300;
  const fig8d = PF.row([
    { svg: PF.plot({ w: 340, h: 170, x: [-2600, 2600], y: [-480, 480], zero: true, xl: 'z\\,(\\text{m})', yl: 'E_y\\,(\\mu\\text{V/m})',
      xt: [[-2100, '-2100'], [-1500, '-1500'], [1500, '1500'], [2100, '2100']], yt: [[377, '377'], [-377, '-377']],
      curves: [{ f: (z) => (Math.abs(s6(z)) < 1 ? -EMU * s6(z) : 0), n: 1200 }] }), cap: '$E_y(z)$ at $t = 6\\ \\mu$s: even in $z$.' },
    { svg: PF.plot({ w: 340, h: 170, x: [-2600, 2600], y: [-1.3, 1.3], zero: true, xl: 'z\\,(\\text{m})', yl: 'H_x\\,(\\mu\\text{A/m})',
      xt: [[-2100, '-2100'], [-1500, '-1500'], [1500, '1500'], [2100, '2100']], yt: [[1, '1'], [-1, '-1']],
      curves: [{ f: (z) => (Math.abs(s6(z)) < 1 ? Math.sign(z) * s6(z) : 0), n: 1200 }] }), cap: '$H_x(z)$ at $t = 6\\ \\mu$s: odd in $z$.' },
  ]);

  // Problem 3: S_z(z) at t = 10 ns, and the cube between z = 1/2 and z = 1
  const fig8s = { svg: PF.plot({ w: 360, h: 190, x: [0, 1.25], y: [-6.2, 1.2], zero: true, xl: 'z\\,(\\text{m})', yl: 'S_z\\,(\\text{mW/m}^2)',
    xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[-5.305, '-5.31']], vlines: [[0.5, ''], [1, '']],
    curves: [{ f: (z) => -1000 * Math.cos(6 * PI + 3 * PI * z) ** 2 / (60 * PI), n: 600 }] }),
    cap: '$S_z$ at $t = 10$ ns. The dashed lines are the two faces of the cube. Power flows toward $-z$: in through the face at $z = 1$, and nothing leaves through the face at $z = \\tfrac12$.' };

  // Problem 4(e): the tip of E in a fixed plane traces a tilted ellipse
  const fig8e = { svg: PF.plot({ w: 260, h: 250, ml: 40, mr: 30, x: [-1.4, 1.4], y: [-1.4, 1.4], zero: true, xl: 'E_x', yl: 'E_z',
    xt: [[-1, '-1'], [1, '1']], yt: [[-1, '-1'], [1, '1']],
    curves: [{ pts: Array.from({ length: 241 }, (_, k) => { const th = 2 * PI * k / 240; return [Math.cos(th + PI / 4), Math.cos(th)]; }) }] }),
    cap: 'The tip of $\\mathbf E_5$ (in units of $120\\pi$ V/m) at a fixed $y$: equal amplitudes, $45°$ apart (the minus sign in $E_x = -\\eta_0H_z$ turns the $135°$ of $\\mathbf H$ into $45°$), so a tilted ellipse.' };

  const hw8 = [
    R(md`
      **Homework 8** · due Thursday, October 22, 2026 · reading: Kudeki, Lectures 20–22 (Poynting's theorem, phasors, Maxwell's equations in phasor form).

      **What it drills.** Four physics problems. Problem 1 reads a whole wave (its $\eta$, $v$, $\epsilon_r$, $\mu_r$) off a pair of formulas for $\mathbf E$ and $\mathbf H$. Problem 2 is a current sheet driven by a ramp pulse: the waves it launches, their plots in time and space, and the energy it radiates. Problem 3 is one sinusoidal wave: its parameters, its $\mathbf H$, and the instantaneous Poynting vector, used to decide whether a box is gaining energy. Problem 4 takes five free-space waves and asks for the partner field, the phasors, the instantaneous power and the average power of each.

      **Read these first.** [Topic 1: phasors](#/l/w1-phasor), [Topic 2: phasor Maxwell](#/l/w1-maxwell), [Topic 3: Poynting's theorem](#/l/w1-poynting) and [Topic 4: time-averaged power](#/l/w1-avg). Problem 2 leans on the sheet waves of Exam 2: [current sheets and the waves they launch](#/l/t15-sheet-waves) and [what you need from Exam 2](#/l/e3-refresh).

      **How to use it.** The problems are restated in our own words with every number exactly as assigned. Work each one on paper first, with units, as you would hand it in. Then enter your answers, use a hint only when stuck, and read the full solution even when you were right: each ends with a **speed path** (the 30-second version) and a link to the lesson that teaches it. There is no official key; every answer here was derived from first principles and checked in Python. Problem 5 (an infographic made with generative AI, and a critique of it) is not physics and is omitted.

      !!key Three facts this whole set uses
        - A plane wave traveling along $\hat k$ has $\mathbf H = \dfrac{1}{\eta}\hat k\times\mathbf E$, and so $\mathbf E = \eta\,\mathbf H\times\hat k$. Its $\mathbf E\times\mathbf H$ points along $\hat k$.
        - A function of $t - z/v$ moves toward $+z$ at speed $v$; a function of $t + z/v$ moves toward $-z$.
        - Phasors use the cosine as reference: $\cos(\omega t + \phi) \to e^{j\phi}$ and $\sin(\omega t + \phi) = \cos(\omega t + \phi - 90°) \to -je^{j\phi}$.
    `),

    // ================================================================ HW 8 Problem 1
    R(md`
      ### Problem 1 · Read a wave from its fields

      A plane TEM wave travels through a homogeneous, lossless dielectric with $\epsilon = \epsilon_r\epsilon_0$ and $\mu = \mu_r\mu_0$. Its two fields are found to be
      $$\mathbf E = \hat x\,u\!\left(t - \frac{z}{c/2}\right) + \hat y\,g\!\left(t - \frac{z}{c/2}\right)\ \frac{\text{V}}{\text{m}}$$
      $$\mathbf H = \hat x\left(\frac{40z}{c} - 20t\right) + \hat y\,\frac{1}{60\pi}\,u\!\left(t - \frac{2z}{c}\right)\ \frac{\text{A}}{\text{m}}$$
      Here $u(t)$ is the unit step and $c$ is the speed of light in vacuum.
    `),
    P({ src: 'HW 8 #1(a)–(c)', title: 'η, v, εr and μr',
      q: md`From these fields, find (a) the medium's intrinsic impedance $\eta$, (b) the speed $v$ at which the wave travels, and (c) $\epsilon_r$ and $\mu_r$.`,
      parts: [
        NT(md`(a) $\eta$`, 60 * PI, 'Ω', [{ v: ETA0, msg: 'That is η₀, the vacuum value. Read η from the fields: E_x = u(·) is paired with H_y = u(·)/(60π).' }, { v: 1 / (60 * PI), msg: 'That is H/E. η is E over H.' }]),
        NT(md`(b) $v$`, 1.5e8, 'm/s', [{ v: 6e8, msg: 'z/(c/2) = 2z/c: the delay per meter is 2/c, so v = c/2, not 2c.' }, { v: 3e8, msg: 'That is c. The argument t − z/(c/2) says the wave moves at c/2.' }]),
        NT(md`(c) $\epsilon_r$`, 4, '', [{ v: 2, msg: 'That is √εr. Square it.' }]),
        NT(md`(c) $\mu_r$`, 1, '', [{ v: 4, msg: 'That is εr. μr εr = 4 and μr/εr = ¼ give μr = 1.' }, { v: 0.25, msg: 'That is μr/εr. Multiply it by μr εr = 4 to get μr² = 1.' }]),
      ],
      hints: [md`Every argument is $t - 2z/c$, so the wave moves toward $+z$ at $c/2$.`, md`For a $+z$ wave, $\mathbf H = \frac1\eta\hat z\times\mathbf E$: $H_y = E_x/\eta$ and $H_x = -E_y/\eta$. The $\hat x$ part of $\mathbf E$ and the $\hat y$ part of $\mathbf H$ are both steps.`, md`$v = c/\sqrt{\mu_r\epsilon_r}$ and $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$. Two equations, two unknowns.`],
      sol: md`
        **Step 1: which way, and how fast.** Look at the step in $E_x$. Its argument is $t - z/(c/2)$. Rewrite the fraction:
        $$\frac{z}{c/2} = \frac{2z}{c}$$
        So every piece of the wave depends on $t - 2z/c$. A shape that depends on $t - z/v$ keeps its value wherever $t - z/v$ is constant, that is, where $z = vt + \text{const}$. That point moves toward $+z$ at speed $v$. Here $1/v = 2/c$, so
        $$\boxed{v = \frac c2 = 1.5\times10^8\ \text{m/s}}$$
        That answers (b).

        **Step 2: the rule that ties E to H.** For a plane wave moving along $\hat k$,
        $$\mathbf H = \frac1\eta\,\hat k\times\mathbf E$$
        Here $\hat k = \hat z$. Cross $\hat z$ with each part of $\mathbf E$:
        $$\hat z\times\hat x = \hat y, \qquad \hat z\times\hat y = -\hat x$$
        So the $\hat x$ part of $\mathbf E$ makes a $\hat y$ part of $\mathbf H$, and the $\hat y$ part of $\mathbf E$ makes a $-\hat x$ part of $\mathbf H$:
        $$H_y = \frac{E_x}{\eta}, \qquad H_x = -\frac{E_y}{\eta}$$
        **Step 3: η from the step functions.** $E_x = u(t - 2z/c)$ V/m and $H_y = \frac{1}{60\pi}u(t - 2z/c)$ A/m. Put them in $H_y = E_x/\eta$:
        $$\frac{1}{60\pi}u(\cdot) = \frac{u(\cdot)}{\eta}$$
        The step functions cancel:
        $$\boxed{\eta = 60\pi\ \Omega \approx 188.5\ \Omega}$$
        **Step 4: two equations for εr and μr.** In a lossless medium the speed and the impedance are
        $$v = \frac{c}{\sqrt{\mu_r\epsilon_r}}, \qquad \eta = \eta_0\sqrt{\frac{\mu_r}{\epsilon_r}}$$
        From $v = c/2$:
        $$\sqrt{\mu_r\epsilon_r} = 2$$
        From $\eta = 60\pi = 120\pi/2$:
        $$\sqrt{\frac{\mu_r}{\epsilon_r}} = \frac12$$
        **Step 5: solve.** Multiply the two equations. The $\epsilon_r$ cancels:
        $$\sqrt{\mu_r\epsilon_r}\cdot\sqrt{\frac{\mu_r}{\epsilon_r}} = \mu_r = 2\cdot\frac12 = 1$$
        Divide them instead. Now $\mu_r$ cancels:
        $$\frac{\sqrt{\mu_r\epsilon_r}}{\sqrt{\mu_r/\epsilon_r}} = \epsilon_r = \frac{2}{1/2} = 4$$
        $$\boxed{\epsilon_r = 4, \qquad \mu_r = 1}$$
        !!intuition Does this make sense?
          A nonmagnetic material with $\epsilon_r = 4$ slows light by $\sqrt4 = 2$ and lowers $\eta$ by the same factor 2. Both match what the fields say. Whenever $v$ and $\eta$ drop by the **same** factor, the material is nonmagnetic.

        **Speed path.** $t - z/(c/2)$ means $v = c/2$. Pair $E_x$ with $H_y$: $\eta = 60\pi = \eta_0/2$. Same factor 2 in $v$ and $\eta$, so $\mu_r = 1$ and $\epsilon_r = 4$. Ten seconds. Taught in [Topic 2](#/l/w1-maxwell) and [what you need from Exam 2](#/l/e3-refresh).
      ` }),
    P({ src: 'HW 8 #1(d)', title: 'The function g(t)',
      q: md`(d) Find the function $g(t)$.`,
      parts: [X(md`$g(t)$ in V/m ($t$ in s)`, '1200*pi*t', { t: [-2, 2] })],
      hints: [md`$g$ is the $\hat y$ part of $\mathbf E$. For this $+z$ wave it pairs with $H_x = -E_y/\eta$.`, md`Write $H_x = \frac{40z}{c} - 20t$ as $-20\left(t - \frac{2z}{c}\right)$.`],
      sol: md`
        **Step 1: put H_x in wave form.** The $\hat x$ part of $\mathbf H$ is $\frac{40z}{c} - 20t$. Factor out $-20$:
        $$H_x = -20\left(t - \frac{2z}{c}\right)$$
        Good: it is a function of $t - 2z/c$, like everything else in this wave.

        **Step 2: use the pairing from Step 2 of (a).** For a $+z$ wave, $H_x = -E_y/\eta$, so $E_y = -\eta H_x$:
        $$E_y = -(60\pi)\cdot\left[-20\left(t - \frac{2z}{c}\right)\right]$$
        The two minus signs cancel:
        $$E_y = 1200\pi\left(t - \frac{2z}{c}\right)$$
        **Step 3: read off g.** $E_y = g(t - 2z/c)$, so $g$ is the rule "multiply the argument by $1200\pi$":
        $$\boxed{g(t) = 1200\pi\,t\ \text{V/m} \approx 3770\,t\ \text{V/m}}$$
        with $t$ in seconds.

        !!intuition Does this make sense?
          Check it with Faraday's law, which does not care about the shortcut. The $x$-component of $\nabla\times\mathbf E$ is $-\partial E_y/\partial z$. With $E_y = 1200\pi(t - 2z/c)$ that is $+2400\pi/c$. The right side is $-\mu_0\,\partial H_x/\partial t = -\mu_0(-20) = 20\mu_0$. And $2400\pi/c = 2400\pi/(3\times10^8) = 8\pi\times10^{-6}$, while $20\mu_0 = 20(4\pi\times10^{-7}) = 8\pi\times10^{-6}$. ✓ (A ramp that grows forever is not physical; it is just a clean exercise in the pairing.)

        **Speed path.** $\hat z\times\hat y = -\hat x$, so $E_y = -\eta H_x$. Factor $H_x = -20(t - 2z/c)$, multiply by $-60\pi$: $g(t) = 1200\pi t$. Taught in [what you need from Exam 2](#/l/e3-refresh).
      ` }),

    // ================================================================ HW 8 Problem 2
    RF(md`
      ### Problem 2 · A sheet driven by a ramp pulse

      A sheet of surface current fills the plane $z = 0$ in free space. Its current density is
      $$\mathbf J_s(t) = \hat y\,2t\,\text{rect}\!\left(\frac t\tau\right)\ \text{A/m}, \qquad \tau = 2\ \mu\text{s}$$
      where $\text{rect}(t/\tau)$ is the unit rectangle of width $\tau$: it equals 1 for $|t| < \tau/2$ and 0 for $|t| > \tau/2$. So the current is a ramp that runs from $-2\ \mu\text{A/m}$ at $t = -1\ \mu\text{s}$ to $+2\ \mu\text{A/m}$ at $t = +1\ \mu\text{s}$, and is zero at all other times ($t$ is in seconds in $2t$). The sheet launches TEM waves that travel away from it on both sides, toward $\pm z$, as drawn below.

      [[fig:sh]]

      [[fig:js]]
    `, { sh: { svg: sheet8Fig(), cap: 'The sheet seen edge-on. Its current is along $\\hat y$; the waves leave along $\\pm\\hat z$.' }, js: { svg: js8Fig(), cap: 'The current density: a ramp switched on for $|t| < 1\\ \\mu$s.' } }),
    P({ src: 'HW 8 #2(a)', title: 'E(z, t) and H(z, t)',
      q: md`(a) Write $\mathbf E(z, t)$ and $\mathbf H(z, t)$ everywhere.`,
      parts: [
        mc(md`$\mathbf E(z, t)$ for all $z$, with $s = t - |z|/c$`, [
          md`$-\hat y\,120\pi\,s\,\text{rect}(s/\tau)$ V/m`,
          md`$+\hat y\,120\pi\,s\,\text{rect}(s/\tau)$ V/m`,
          md`$-\hat y\,60\pi\,s\,\text{rect}(s/\tau)$ V/m`,
          md`$-\hat y\,240\pi\,s\,\text{rect}(s/\tau)$ V/m`,
          md`$-\hat x\,120\pi\,s\,\text{rect}(s/\tau)$ V/m`], 0,
          [null, md`Sign. The sheet does work on the field, so $-\mathbf J_s\cdot\mathbf E > 0$: $\mathbf E$ at the sheet points **against** the current.`, md`That uses $\eta_0/2$ times $t$ and drops the 2 in $2t$: $\frac{\eta_0}{2}\cdot 2 = \eta_0 = 120\pi$.`, md`That is $\eta_0|\mathbf J_s|$. The current's jump in $\mathbf H$ is shared by two waves, so each gets half: $\frac{\eta_0}{2}|\mathbf J_s|$.`, md`Tangential $\mathbf E$ at the sheet is parallel to $\mathbf J_s$ (here $\hat y$), not perpendicular to it.`]),
        mc(md`$\mathbf H(z, t)$ for $z > 0$`, [
          md`$+\hat x\,(t - z/c)\,\text{rect}\big((t - z/c)/\tau\big)$ A/m`,
          md`$-\hat x\,(t - z/c)\,\text{rect}\big((t - z/c)/\tau\big)$ A/m`,
          md`$+\hat x\,\dfrac{t - z/c}{120\pi}\,\text{rect}\big((t - z/c)/\tau\big)$ A/m`,
          md`$+\hat y\,(t - z/c)\,\text{rect}\big((t - z/c)/\tau\big)$ A/m`], 0,
          [null, md`That is the $z < 0$ partner. For $z > 0$, $\mathbf H = \frac1{\eta_0}\hat z\times\mathbf E$ and $\hat z\times(-\hat y) = +\hat x$.`, md`That divides by $\eta_0$ twice. $|\mathbf H| = |\mathbf E|/\eta_0 = 120\pi s/120\pi = s$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ (along $\hat y$) and to the travel direction.`]),
        mc(md`$\mathbf H(z, t)$ for $z < 0$`, [
          md`$-\hat x\,(t + z/c)\,\text{rect}\big((t + z/c)/\tau\big)$ A/m`,
          md`$+\hat x\,(t + z/c)\,\text{rect}\big((t + z/c)/\tau\big)$ A/m`,
          md`$-\hat x\,(t - z/c)\,\text{rect}\big((t - z/c)/\tau\big)$ A/m`,
          md`$+\hat y\,(t + z/c)\,\text{rect}\big((t + z/c)/\tau\big)$ A/m`], 0,
          [null, md`That copies the $z > 0$ field. The downward wave has $\hat k = -\hat z$, which flips the sign of $\mathbf H$ for the same $\mathbf E$.`, md`For $z < 0$, $|z| = -z$, so the delay is $t - |z|/c = t + z/c$. With $t - z/c$ the wave would be advanced, not delayed.`, md`$\mathbf H$ is perpendicular to $\mathbf E$.`]),
        NT(md`Peak $|\mathbf E|$`, 120 * PI * 1e-6, 'V/m', [{ v: 120 * PI, msg: 'The peak of s is 1 µs = 10⁻⁶ s, not 1 s.' }, { v: 240 * PI * 1e-6, msg: 'That uses η₀|J_s| with no ½.' }]),
      ],
      hints: [md`Tangential $\mathbf E$ is continuous through the sheet, so both waves start with the same $\mathbf E$. Tangential $\mathbf H$ jumps by the current: $\hat z\times(\mathbf H_{0^+} - \mathbf H_{0^-}) = \mathbf J_s$.`, md`Those two facts give $\mathbf E(0, t) = -\frac{\eta_0}{2}\mathbf J_s(t)$. Each wave then carries this shape away with the delay $|z|/c$.`],
      sol: md`
        **Step 1: what the sheet does at z = 0.** Call the field right at the sheet $\mathbf E_s(t)$. Tangential $\mathbf E$ is continuous across a sheet of current, so the wave going up and the wave going down both start with this same $\mathbf E_s$. Their magnetic fields follow from $\mathbf H = \frac{1}{\eta_0}\hat k\times\mathbf E$:
        $$\mathbf H_{0^+} = \frac{1}{\eta_0}\hat z\times\mathbf E_s, \qquad \mathbf H_{0^-} = -\frac{1}{\eta_0}\hat z\times\mathbf E_s$$
        Subtract. The difference is twice one of them:
        $$\mathbf H_{0^+} - \mathbf H_{0^-} = \frac{2}{\eta_0}\hat z\times\mathbf E_s$$
        **Step 2: the jump condition.** The current is the jump in tangential $\mathbf H$:
        $$\hat z\times(\mathbf H_{0^+} - \mathbf H_{0^-}) = \mathbf J_s$$
        Put in Step 1:
        $$\frac{2}{\eta_0}\,\hat z\times(\hat z\times\mathbf E_s) = \mathbf J_s$$
        Two quarter turns about $\hat z$ reverse any vector lying in the sheet: $\hat z\times(\hat z\times\hat y) = \hat z\times(-\hat x) = -\hat y$. So $\hat z\times(\hat z\times\mathbf E_s) = -\mathbf E_s$, and
        $$\boxed{\mathbf E_s(t) = -\frac{\eta_0}{2}\mathbf J_s(t)}$$
        **Step 3: carry it away.** A point at distance $|z|$ from the sheet sees what the sheet did a time $|z|/c$ earlier. Write $s = t - |z|/c$ for that retarded time. Then
        $$\mathbf E(z, t) = -\frac{\eta_0}{2}\mathbf J_s(s)$$
        **Step 4: put in the current.** $\frac{\eta_0}{2}\cdot 2s = \eta_0 s = 120\pi s$:
        $$\boxed{\mathbf E = -\hat y\,120\pi\,s\,\text{rect}(s/\tau)\ \text{V/m}}$$
        with $s = t - |z|/c$ in seconds. The largest value of $|s|$ inside the rectangle is $\tau/2 = 10^{-6}$ s, so the peak field is $120\pi\times10^{-6} = 3.77\times10^{-4}$ V/m $= 377\ \mu$V/m.

        **Step 5: H on each side.** Above ($z > 0$) the wave moves along $+\hat z$, and $\hat z\times(-\hat y) = +\hat x$:
        $$\mathbf H = \frac{120\pi s}{120\pi}\,\text{rect}(s/\tau)\,\hat x$$
        $$\boxed{\mathbf H = +\hat x\,s\,\text{rect}(s/\tau)\ \text{A/m}, \ z > 0}$$
        Below ($z < 0$) the wave moves along $-\hat z$, which flips the sign:
        $$\boxed{\mathbf H = -\hat x\,s\,\text{rect}(s/\tau)\ \text{A/m}, \ z < 0}$$
        For $z > 0$, $s = t - z/c$; for $z < 0$, $|z| = -z$ and $s = t + z/c$.

        !!intuition Does this make sense?
          Check the jump at $z = 0$: $\mathbf H_{0^+} - \mathbf H_{0^-} = 2t\,\text{rect}(t/\tau)\,\hat x$, and $\hat z\times\hat x = \hat y$, so the jump is $2t\,\text{rect}(t/\tau)\,\hat y = \mathbf J_s$ ✓. Check the energy: $-\mathbf J_s\cdot\mathbf E_s = \frac{\eta_0}{2}|\mathbf J_s|^2 \ge 0$, so the sheet always feeds the field ✓. And check the direction: $\mathbf E\times\mathbf H \propto (-\hat y)\times(+\hat x) = +\hat z$ above the sheet ✓.

        **Speed path.** $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(t - |z|/c)$ everywhere, and $\mathbf H = \pm\frac{1}{\eta_0}\hat z\times\mathbf E$ on the two sides. Here $\frac{\eta_0}{2}\cdot 2 = 120\pi$, so $|\mathbf H|$ is just $s$. Taught in [current sheets and their waves](#/l/t15-sheet-waves) and [Topic 10](#/l/w3-antenna).
      ` }),
    P({ src: 'HW 8 #2(b)–(c)', title: 'The fields versus t at z = ±1500 m',
      q: md`(b) Plot the components of $\mathbf E(z, t)$ and $\mathbf H(z, t)$ versus $t$ at $z = 1500$ m. (c) Do the same at $z = -1500$ m.`,
      parts: [
        NT(md`The pulse reaches $z = 1500$ m at $t =$`, 4, 'μs', [{ v: 5, msg: 'That is the delay 1500/c = 5 µs. The pulse began 1 µs before t = 0, so its front arrives at 4 µs.' }]),
        NT(md`$E_y$ at $z = 1500$ m, $t = 4.5\ \mu$s`, 120 * PI * 0.5e-6, 'V/m', [{ v: -120 * PI * 0.5e-6, msg: 'Sign: s = 4.5 − 5 = −0.5 µs, and E_y = −120π s is then positive.' }]),
        NT(md`$H_x$ at $z = 1500$ m, $t = 4.5\ \mu$s`, -0.5e-6, 'A/m', [{ v: 0.5e-6, msg: 'Above the sheet H_x = +s, and s = −0.5 µs here.' }]),
        mc(md`At $z = -1500$ m, compared with $z = +1500$ m`, [
          md`$E_y$ is the same and $H_x$ is reversed`,
          md`both are the same`,
          md`$E_y$ is reversed and $H_x$ is the same`,
          md`both arrive 10 µs later`], 0,
          [null, md`$\mathbf E$ is even in $z$ but $\mathbf H$ is odd: the downward wave needs $\mathbf E\times\mathbf H$ along $-\hat z$.`, md`Then $\mathbf E\times\mathbf H$ would point the same way on both sides, but the two waves travel in opposite directions.`, md`Both points are 1500 m from the sheet, so both see the pulse at the same times.`]),
      ],
      hints: [md`At $z = \pm1500$ m the delay is $1500/c = 5\ \mu$s, so $s = t - 5\ \mu$s. The rectangle is on for $|s| < 1\ \mu$s.`],
      sol: md`
        **Step 1: the delay.** Both points are 1500 m from the sheet:
        $$\frac{|z|}{c} = \frac{1500}{3\times10^8} = 5\times10^{-6}\ \text{s} = 5\ \mu\text{s}$$
        So $s = t - 5\ \mu$s. The pulse is on while $|s| < 1\ \mu$s, that is, for $4 < t < 6\ \mu$s.

        **Step 2: E at z = 1500 m.** From (a), $E_y = -120\pi s$. In convenient units ($s$ in µs, field in µV/m) that is $E_y = -377\,(t - 5)$ µV/m:
        - at $t = 4\ \mu$s, $s = -1\ \mu$s, so $E_y = +377\ \mu$V/m;
        - at $t = 5\ \mu$s, $E_y = 0$;
        - at $t = 6\ \mu$s, $E_y = -377\ \mu$V/m.

        A straight line falling from $+377$ to $-377$ µV/m, and zero outside $4 < t < 6$ µs. At $t = 4.5\ \mu$s, $E_y = -377(-0.5) = +188.5\ \mu$V/m $= 1.88\times10^{-4}$ V/m.

        **Step 3: H at z = 1500 m.** Above the sheet $H_x = +s$ (A/m, $s$ in seconds), so $H_x$ rises from $-1\ \mu$A/m at $t = 4\ \mu$s to $+1\ \mu$A/m at $t = 6\ \mu$s. At $t = 4.5\ \mu$s it is $-0.5\ \mu$A/m.

        [[fig:b]]

        **Step 4: z = −1500 m.** The delay is the same 5 µs. $\mathbf E$ depends on $|z|$ only, so $E_y(-1500, t) = E_y(1500, t)$. $\mathbf H$ has the opposite sign below the sheet, so $H_x(-1500, t) = -H_x(1500, t)$: it falls from $+1$ to $-1\ \mu$A/m.

        [[fig:c]]

        !!intuition Does this make sense?
          Below the sheet the wave travels toward $-z$, so $\mathbf E\times\mathbf H$ must point along $-\hat z$. With the same $\mathbf E$, only a reversed $\mathbf H$ can do that. And both traces are copies of the source ramp, delayed and scaled: a plane wave in vacuum does not change shape.

        **Speed path.** Delay $= 1500/c = 5\ \mu$s; the pulse occupies $4$–$6\ \mu$s. $E_y$ is the ramp $-120\pi s$ (a falling line, $\pm377\ \mu$V/m at the ends), the same on both sides. $H_x = \pm s$ ($\mp1$ to $\pm1\ \mu$A/m), opposite on the two sides. Taught in [current sheets and their waves](#/l/t15-sheet-waves).
      `,
      figs: { b: { svg: fig8b.svg }, c: fig8c } }),
    P({ src: 'HW 8 #2(d)', title: 'The fields versus z at t = 6 µs',
      q: md`(d) Plot the components of $\mathbf E(z, t)$ and $\mathbf H(z, t)$ versus $z$ at $t = 6\ \mu$s.`,
      parts: [
        NT(md`The pulse's outer edge (farthest from the sheet) is at $|z| =$`, 2100, 'm', [{ v: 1800, msg: 'That is where E_y crosses zero (the pulse center). The leading edge left the sheet at t = −1 µs, 7 µs earlier.' }, { v: 1500, msg: 'That is the inner edge: the trailing end left the sheet at t = +1 µs, 5 µs earlier.' }]),
        NT(md`$E_y$ at $z = 1600$ m`, -120 * PI * (6 - 1600 / 300) * 1e-6, 'V/m', [{ v: 120 * PI * (6 - 1600 / 300) * 1e-6, msg: 'Sign: s = 6 − 5.33 = +0.67 µs, and E_y = −120π s is negative.' }]),
        NT(md`$H_x$ at $z = -1600$ m`, -(6 - 1600 / 300) * 1e-6, 'A/m', [{ v: (6 - 1600 / 300) * 1e-6, msg: 'Below the sheet H_x = −s. That value is the one at z = +1600 m.' }]),
      ],
      hints: [md`At $t = 6\ \mu$s, $s = 6\ \mu\text{s} - |z|/c$. The pulse is where $|s| < 1\ \mu$s.`],
      sol: md`
        **Step 1: where is the pulse?** At $t = 6\ \mu$s the retarded time is $s = 6\ \mu\text{s} - |z|/c$. The pulse is on where $-1 < s < 1$ µs. Solve each end for $|z|$:
        $$s = +1\ \mu\text{s}: \quad |z| = c(5\ \mu\text{s}) = 1500\ \text{m}$$
        $$s = -1\ \mu\text{s}: \quad |z| = c(7\ \mu\text{s}) = 2100\ \text{m}$$
        So the pulse fills $1500 < |z| < 2100$ m on each side: 600 m long, which is $c\tau$.

        **Step 2: E.** $E_y = -120\pi s$. At $|z| = 1500$ m ($s = +1\ \mu$s) it is $-377\ \mu$V/m; at $|z| = 2100$ m ($s = -1\ \mu$s) it is $+377\ \mu$V/m; it crosses zero at $|z| = 1800$ m. The plot is the same on both sides of the sheet (even in $z$). At $z = 1600$ m:
        $$s = 6 - \frac{1600}{300} = 0.667\ \mu\text{s}$$
        $$E_y = -120\pi(0.667\times10^{-6}) = -2.51\times10^{-4}\ \text{V/m}$$
        **Step 3: H.** $H_x = +s$ above and $-s$ below (odd in $z$). Above: $+1\ \mu$A/m at 1500 m down to $-1\ \mu$A/m at 2100 m. Below: the negative of that. At $z = -1600$ m, $H_x = -0.667\ \mu$A/m.

        [[fig:d]]

        !!intuition Does this make sense?
          A snapshot shows the time waveform **reversed** in space: the part of the ramp that left the sheet first (the $-2\ \mu$A/m end, at $t = -1\ \mu$s) has gone farthest. That is why $E_y$ is $+377\ \mu$V/m at the outer edge, where the oldest part of the pulse is.

        **Speed path.** The pulse occupies $|z| = c(t \mp \tau/2) = 1500$ to $2100$ m. The oldest part of the source is farthest out. $E_y$ even, $H_x$ odd. Taught in [current sheets and their waves](#/l/t15-sheet-waves).
      `,
      figs: { d: { svg: fig8d.svg } } }),
    P({ src: 'HW 8 #2(e)', title: 'Energy radiated per unit area',
      q: md`(e) Find the TEM wave energy radiated per unit area, in J/m², by this current pulse. (Integrate the power injected per unit area, $-\mathbf J_s\cdot\mathbf E$, over the duration of the pulse.)`,
      parts: [NT(md`$W$`, 160 * PI * 1e-18, 'J/m^2', [{ v: 80 * PI * 1e-18, msg: 'That is the energy of one of the two waves. The sheet powers both.' }, { v: 320 * PI * 1e-18, msg: 'That uses η₀|J_s|² instead of (η₀/2)|J_s|².' }, { v: 160 * PI, msg: 'Time is in seconds: the pulse runs from −10⁻⁶ to 10⁻⁶ s, so t³ brings 10⁻¹⁸.' }])],
      hints: [md`At the sheet, $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$, so $-\mathbf J_s\cdot\mathbf E = \frac{\eta_0}{2}|\mathbf J_s|^2$.`, md`$\int_{-a}^{a}t^2\,dt = \frac{2a^3}{3}$ with $a = 10^{-6}$ s.`],
      sol: md`
        **Step 1: the power the sheet delivers.** $-\mathbf J_s\cdot\mathbf E$ is the power per unit area the current gives to the field (the work done by the field on the current is $\mathbf J_s\cdot\mathbf E$, so its negative is what the field receives). At the sheet $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$:
        $$-\mathbf J_s\cdot\mathbf E = \frac{\eta_0}{2}\,\mathbf J_s\cdot\mathbf J_s = \frac{\eta_0}{2}|\mathbf J_s|^2$$
        **Step 2: put in the current.** Inside the pulse $|\mathbf J_s| = 2t$:
        $$\frac{\eta_0}{2}(2t)^2 = 60\pi\cdot4t^2 = 240\pi\,t^2\ \text{W/m}^2$$
        **Step 3: integrate over the pulse.** The pulse runs from $-\tau/2 = -10^{-6}$ s to $+10^{-6}$ s:
        $$W = \int_{-10^{-6}}^{10^{-6}}240\pi\,t^2\,dt = 240\pi\left[\frac{t^3}{3}\right]_{-10^{-6}}^{10^{-6}}$$
        The bracket is $\frac{10^{-18}}{3} - \frac{-10^{-18}}{3} = \frac{2}{3}\times10^{-18}$:
        $$W = 240\pi\cdot\frac23\times10^{-18} = 160\pi\times10^{-18}$$
        $$\boxed{W = 5.03\times10^{-16}\ \text{J/m}^2}$$
        !!intuition Does this make sense?
          Count it a second way, from the waves. Each wave carries $|\mathbf S| = E^2/\eta_0 = (120\pi s)^2/(120\pi) = 120\pi s^2$ W/m². Over the pulse that is $120\pi\cdot\frac23\times10^{-18} = 80\pi\times10^{-18}$ J/m² per wave. Two waves: $160\pi\times10^{-18}$ ✓. The number is tiny because the current never exceeds 2 µA/m.

        **Speed path.** $W = \frac{\eta_0}{2}\int|\mathbf J_s|^2dt = 60\pi\cdot4\cdot\frac{2(10^{-6})^3}{3} = 160\pi\times10^{-18}$ J/m². Taught in [Topic 3](#/l/w1-poynting) and [Topic 10](#/l/w3-antenna).
      ` }),

    // ================================================================ HW 8 Problem 3
    R(md`
      ### Problem 3 · One wave, and the energy in a box

      A uniform plane TEM wave $\mathbf E(z, t) = \cos(\omega t + \beta z)\,\hat y$ V/m travels through a homogeneous perfect dielectric with $\epsilon = 3\epsilon_0$. Its phase speed is $v_p = \frac23c$ and its frequency is $f = 300$ MHz. Give every answer with units.
    `),
    P({ src: 'HW 8 #3(a)–(c)', title: 'μr, η, λ and β',
      q: md`Find (a) the relative permeability $\mu_r$ and the intrinsic impedance $\eta$ of the medium, (b) the wavelength $\lambda$, and (c) the phase constant $\beta$.`,
      parts: [
        NT(md`(a) $\mu_r$`, 0.75, '', [{ v: 1.5, msg: 'That is c/v_p. It equals √(μr εr), so square it first: μr εr = 9/4.' }, { v: 4 / 3, msg: 'Upside down: μr = (9/4)/εr = (9/4)/3 = 3/4.' }]),
        NT(md`(a) $\eta$`, 60 * PI, 'Ω', [{ v: ETA0 / Math.sqrt(3), msg: 'That ignores μr. η = η₀√(μr/εr) = η₀√(1/4).' }, { v: ETA0, msg: 'That is the vacuum value.' }]),
        NT(md`(b) $\lambda$`, 2 / 3, 'm', [{ v: 1, msg: 'That is the free-space wavelength c/f. In the medium use v_p/f.' }]),
        NT(md`(c) $\beta$`, 3 * PI, 'rad/m', [{ v: 2 * PI, msg: 'That is the free-space value ω/c. In the medium β = ω/v_p.' }]),
      ],
      hints: [md`$v_p = c/\sqrt{\mu_r\epsilon_r}$, so $\mu_r\epsilon_r = (c/v_p)^2$.`, md`$\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$, $\lambda = v_p/f$, $\beta = 2\pi/\lambda$.`],
      sol: md`
        **Step 1: μr from the speed.** In a lossless medium $v_p = 1/\sqrt{\mu\epsilon} = c/\sqrt{\mu_r\epsilon_r}$. Turn it around:
        $$\mu_r\epsilon_r = \left(\frac{c}{v_p}\right)^2 = \left(\frac{3}{2}\right)^2 = \frac94$$
        With $\epsilon_r = 3$:
        $$\boxed{\mu_r = \frac{9/4}{3} = \frac34}$$
        **Step 2: η.** $\eta = \sqrt{\mu/\epsilon} = \eta_0\sqrt{\mu_r/\epsilon_r}$:
        $$\eta = 120\pi\sqrt{\frac{3/4}{3}} = 120\pi\sqrt{\frac14}$$
        $$\boxed{\eta = 60\pi\ \Omega \approx 188.5\ \Omega}$$
        **Step 3: λ.** One period $1/f$ moves the pattern one wavelength:
        $$\lambda = \frac{v_p}{f} = \frac{2\times10^8}{3\times10^8} = \boxed{\tfrac23\ \text{m} \approx 0.667\ \text{m}}$$
        **Step 4: β.** The phase turns $2\pi$ per wavelength:
        $$\beta = \frac{2\pi}{\lambda} = \frac{2\pi}{2/3} = \boxed{3\pi\ \text{rad/m} \approx 9.42\ \text{rad/m}}$$
        Check with $\beta = \omega/v_p = (6\pi\times10^8)/(2\times10^8) = 3\pi$ ✓.

        !!intuition Does this make sense?
          $\mu_r < 1$ is unusual (a strongly diamagnetic medium), but nothing forbids it in an exercise. Its effect: the wave is faster than in a nonmagnetic $\epsilon_r = 3$ medium ($c/\sqrt{9/4} = \frac23c$ instead of $c/\sqrt3 = 0.577c$), and $\eta$ is lower.

        **Speed path.** $(c/v_p)^2 = 9/4 = \mu_r\epsilon_r$, so $\mu_r = 3/4$; $\mu_r/\epsilon_r = 1/4$, so $\eta = \eta_0/2 = 60\pi$; $\lambda = v_p/f = 2/3$ m; $\beta = 3\pi$. Taught in [what you need from Exam 2](#/l/e3-refresh).
      ` }),
    P({ src: 'HW 8 #3(d)', title: 'The H field',
      q: md`(d) Find the $\mathbf H$ wavefield that goes with this $\mathbf E$.`,
      parts: [
        NT(md`Amplitude of $\mathbf H$`, 1 / (60 * PI), 'A/m', [{ v: 1 / ETA0, msg: 'That divides by η₀. In this medium η = 60π Ω.' }]),
        mc(md`$\mathbf H(z, t) = \dfrac{1}{60\pi}\cos(\omega t + \beta z)\times$`, [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat z$`, md`$+\hat y$`], 0,
          [null, md`That is the partner of a wave moving toward $+z$. This one moves toward $-z$: $(-\hat z)\times\hat y = +\hat x$.`, md`A TEM wave has no field along its direction of travel.`, md`$\mathbf H$ is perpendicular to $\mathbf E$.`]),
      ],
      hints: [md`$\cos(\omega t + \beta z)$ travels toward $-z$, so $\hat k = -\hat z$. Then $\mathbf H = \frac1\eta\hat k\times\mathbf E$.`],
      sol: md`
        **Step 1: direction of travel.** The phase $\omega t + \beta z$ stays constant where $z = -(\omega/\beta)t + \text{const}$: a point moving toward $-z$. So $\hat k = -\hat z$.

        **Step 2: the cross product.** $\mathbf H = \frac1\eta\hat k\times\mathbf E$, and
        $$(-\hat z)\times\hat y = -(\hat z\times\hat y) = -(-\hat x) = +\hat x$$
        **Step 3: assemble.** The amplitude is $1/\eta = 1/(60\pi)$:
        $$\boxed{\mathbf H = \frac{1}{60\pi}\cos(\omega t + \beta z)\,\hat x\ \text{A/m}}$$
        That is $5.31\cos(\omega t + \beta z)\,\hat x$ mA/m, with $\omega = 6\pi\times10^8$ rad/s and $\beta = 3\pi$ rad/m.

        !!intuition Does this make sense?
          $\mathbf E\times\mathbf H \propto \hat y\times\hat x = -\hat z$: along the travel direction ✓.

        **Speed path.** $+\beta z$ means $-\hat z$; $(-\hat z)\times\hat y = \hat x$; divide by $\eta = 60\pi$. Taught in [what you need from Exam 2](#/l/e3-refresh).
      ` }),
    P({ src: 'HW 8 #3(e)–(g)', title: 'The Poynting vector on two planes, and the box between them',
      q: md`Find the instantaneous Poynting vector at $t = 10$ ns (e) on the plane $z = \tfrac12$ m and (f) on the plane $z = 1$ m. (g) A cube of side $\tfrac12$ m sits between the planes $z = \tfrac12$ m and $z = 1$ m. Using energy conservation and (e)–(f), decide whether the electromagnetic field inside the cube is storing energy or releasing it at $t = 10$ ns.`,
      parts: [
        mc(md`(e) $\mathbf S$ at $t = 10$ ns, $z = \tfrac12$ m`, [md`$0$`, md`$-5.31\,\hat z$ mW/m²`, md`$+5.31\,\hat z$ mW/m²`, md`$-2.65\,\hat z$ mW/m²`], 0,
          [null, md`That is the value at $z = 1$ m. At $z = \tfrac12$ m the phase is $6\pi + \tfrac32\pi$, where the cosine is zero.`, md`$\mathbf S = \mathbf E\times\mathbf H$ always points along $-\hat z$ for this wave (it is $\cos^2$ times a fixed vector), and here it is zero anyway.`, md`That is the time average $\frac{1}{2}\cdot\frac{1}{60\pi}$. The question asks for the instantaneous value.`]),
        NT(md`(f) $|\mathbf S|$ at $t = 10$ ns, $z = 1$ m`, 1 / (60 * PI), 'W/m^2', [{ v: 1 / (120 * PI), msg: 'That is the time average. At this instant cos²(9π) = 1.' }]),
        mc(md`(f) its direction`, [md`$-\hat z$`, md`$+\hat z$`, md`$+\hat x$`, md`$-\hat y$`], 0,
          [null, md`$\hat y\times\hat x = -\hat z$: the wave travels toward $-z$, and so does its power.`, md`$\mathbf S$ is perpendicular to both $\mathbf E$ ($\hat y$) and $\mathbf H$ ($\hat x$).`, md`$\mathbf S$ is perpendicular to $\mathbf E$.`]),
        mc(md`(g) At $t = 10$ ns the field in the cube is`, [md`storing energy`, md`releasing energy`, md`neither: the energy inside is constant`], 0,
          [null, md`Power enters through the face at $z = 1$ m and none leaves through the face at $z = \tfrac12$ m. With no losses inside, the stored energy must be rising.`, md`The net flow is inward, not zero: $\tfrac14\cdot5.31$ mW in, nothing out.`]),
        NT(md`(g) Rate of change of the stored energy`, 1 / (240 * PI), 'W', [{ v: 1 / (60 * PI), msg: 'That is the power density. Multiply by the face area, (½ m)² = ¼ m².' }, { v: -1 / (240 * PI), msg: 'The sign: power flows in, so the stored energy grows.' }]),
      ],
      hints: [md`$\mathbf S = \mathbf E\times\mathbf H = -\hat z\,\dfrac{\cos^2(\omega t + \beta z)}{60\pi}$. At $t = 10$ ns, $\omega t = 6\pi$.`, md`Poynting's theorem for the cube: $\dfrac{dW}{dt} = -\oint\mathbf S\cdot d\mathbf A$ (no $\mathbf J$ in a perfect dielectric).`],
      sol: md`
        **Step 1: S for all z and t.** Multiply the fields of (d):
        $$\mathbf S = \mathbf E\times\mathbf H = \frac{\cos^2(\omega t + \beta z)}{60\pi}\,(\hat y\times\hat x)$$
        $\hat y\times\hat x = -\hat z$:
        $$\mathbf S = -\hat z\,\frac{\cos^2(\omega t + \beta z)}{60\pi}\ \text{W/m}^2$$
        It always points toward $-z$, the way the wave goes. Only its size changes.

        **Step 2: the phase at t = 10 ns.** $\omega = 2\pi f = 6\pi\times10^8$ rad/s, so
        $$\omega t = (6\pi\times10^8)(10^{-8}) = 6\pi$$
        **Step 3: (e) at z = ½ m.** $\beta z = 3\pi\cdot\tfrac12 = \tfrac32\pi$. The phase is $6\pi + \tfrac32\pi$. Drop the whole turns ($6\pi$):
        $$\cos\left(\tfrac32\pi\right) = 0 \quad\Rightarrow\quad \boxed{\mathbf S = 0}$$
        **Step 4: (f) at z = 1 m.** $\beta z = 3\pi$. The phase is $9\pi$, and $\cos 9\pi = \cos\pi = -1$, so $\cos^2 = 1$:
        $$\boxed{\mathbf S = -\frac{1}{60\pi}\hat z = -5.31\times10^{-3}\,\hat z\ \text{W/m}^2}$$
        **Step 5: (g) the cube.** Poynting's theorem for a volume with no current inside says
        $$\frac{dW}{dt} = -\oint\mathbf S\cdot d\mathbf A$$
        where $d\mathbf A$ points **out** of the volume. Look at each face:
        - The four side faces are parallel to $\hat z$, and $\mathbf S$ is along $\hat z$: no flux.
        - The face at $z = \tfrac12$ m: $\mathbf S = 0$. Nothing leaves.
        - The face at $z = 1$ m has outward normal $+\hat z$ and area $(\tfrac12)^2 = \tfrac14$ m². There $\mathbf S\cdot\hat z = -\frac{1}{60\pi}$: the flow is inward.

        So
        $$\frac{dW}{dt} = -\left(-\frac{1}{60\pi}\right)\cdot\frac14 = \frac{1}{240\pi}$$
        $$\boxed{\frac{dW}{dt} = +1.33\times10^{-3}\ \text{W}: \text{the field is storing energy}}$$
        [[fig:s]]

        !!intuition Does this make sense?
          At this instant the field at $z = 1$ m is at a crest and the field at $z = \tfrac12$ m is at a zero. A crest of energy is flowing in from the top while nothing drains out of the bottom, so energy piles up. A quarter period later the roles swap and the cube gives the energy back. On average, what flows in flows out.

        **Speed path.** $\mathbf S = -\hat z\cos^2(\cdot)/(60\pi)$. Phases: $6\pi + 1.5\pi$ (cos = 0) and $6\pi + 3\pi$ (cos² = 1). In at the top, nothing out at the bottom: storing, at $\frac{1}{60\pi}\cdot\frac14 = 1.33$ mW. Taught in [Topic 3](#/l/w1-poynting).
      `,
      figs: { s: fig8s } }),

    // ================================================================ HW 8 Problem 4
    R(md`
      ### Problem 4 · Five waves in free space

      Each of the five fields below is one plane TEM wave in free space ($\eta_0 = 120\pi\ \Omega$). For each one: (i) find the field that accompanies it ($\mathbf H$ if $\mathbf E$ is given, $\mathbf E$ if $\mathbf H$ is given); (ii) write the phasors $\Et$ and $\Ht$; (iii) find the instantaneous power crossing a 1 m² area in the direction the wave travels; (iv) find the time-averaged power crossing that area.

      - (a) $\mathbf E_1 = 10\cos(\omega t - \beta x)\,\hat y$ V/m
      - (b) $\mathbf H_2 = 5\cos\left(\omega t + \beta z + \frac\pi3\right)\hat x + 5\sin\left(\omega t + \beta z - \frac\pi6\right)\hat y$ A/m
      - (c) $\mathbf H_3 = \sin\left(\omega t - \beta z + \frac\pi4\right)\hat x - 2\sin\left(\omega t - \beta z - \frac{3\pi}{4}\right)\hat y$ A/m
      - (d) $\mathbf E_4 = 2\cos\left(\omega t + \beta y - \frac\pi2\right)\hat x - 2\sin(\omega t + \beta y)\,\hat z$ V/m
      - (e) $\mathbf H_5 = \cos(\omega t - \beta y)\,\hat x + \sin\left(\omega t - \beta y - \frac\pi4\right)\hat z$ (no unit printed; it is an $\mathbf H$ field, so A/m)

      ### The method, once, from first principles

      **Direction.** Find the coordinate in the phase. $\omega t - \beta x$ moves toward $+x$; $\omega t + \beta y$ toward $-y$. Call the travel direction $\hat k$.

      **The partner field.** For a plane wave, $\mathbf H = \frac1{\eta_0}\hat k\times\mathbf E$. To go the other way, cross both sides with $\hat k$ on the right. For any $\mathbf E$ perpendicular to $\hat k$, $(\hat k\times\mathbf E)\times\hat k = \mathbf E$, so
      $$\mathbf E = \eta_0\,\mathbf H\times\hat k$$
      **Phasors.** Write each component as a cosine. $\cos(\theta + \phi) \to e^{j\phi}$, and $\sin(\theta + \phi) = \cos(\theta + \phi - \frac\pi2) \to e^{j(\phi - \pi/2)} = -je^{j\phi}$. The travel term $\mp\beta x$ in $\theta$ becomes $e^{\mp j\beta x}$.

      **Power.** The instantaneous power through 1 m² facing $\hat k$ is $P(t) = (\mathbf E\times\mathbf H)\cdot\hat k$ times 1 m². Its average is
      $$\langle P\rangle = \tfrac12\Re\{\Et\times\Ht^*\}\cdot\hat k = \frac{|\Et|^2}{2\eta_0} = \frac{\eta_0|\Ht|^2}{2}$$
      where $|\Et|^2$ is the sum of the squared sizes of the components. (The last two forms hold because $\Ht = \frac{1}{\eta_0}\hat k\times\Et$ has the same shape as $\Et$, turned $90°$.)

      Taught in [Topic 1](#/l/w1-phasor), [Topic 4](#/l/w1-avg) and [Topic 9](#/l/w3-pol).
    `),
    P({ src: 'HW 8 #4(a)', title: 'E₁ = 10 cos(ωt − βx) ŷ',
      q: md`(a) $\mathbf E_1 = 10\cos(\omega t - \beta x)\,\hat y$ V/m. Find (i) $\mathbf H_1$, (ii) the phasors, (iii) the instantaneous power through 1 m², (iv) the average power through 1 m².`,
      parts: [
        mc(md`(i) $\mathbf H_1 =$`, [md`$\dfrac{1}{12\pi}\cos(\omega t - \beta x)\,\hat z$ A/m`, md`$-\dfrac{1}{12\pi}\cos(\omega t - \beta x)\,\hat z$ A/m`, md`$1200\pi\cos(\omega t - \beta x)\,\hat z$ A/m`, md`$\dfrac{1}{12\pi}\cos(\omega t - \beta x)\,\hat x$ A/m`], 0,
          [null, md`$\hat x\times\hat y = +\hat z$. With $-\hat z$, $\mathbf E\times\mathbf H$ would point along $-\hat x$.`, md`That multiplies by $\eta_0$. $H = E/\eta_0 = 10/(120\pi)$.`, md`$\hat x$ is the travel direction; a TEM wave has no field along it.`]),
        mc(md`(ii) the phasors`, [md`$\Et = 10e^{-j\beta x}\hat y$, $\Ht = \dfrac{1}{12\pi}e^{-j\beta x}\hat z$`, md`$\Et = 10e^{+j\beta x}\hat y$, $\Ht = \dfrac{1}{12\pi}e^{+j\beta x}\hat z$`, md`$\Et = 10e^{-j\beta x}\hat y$, $\Ht = \dfrac{j}{12\pi}e^{-j\beta x}\hat z$`, md`$\Et = -j10e^{-j\beta x}\hat y$, $\Ht = \dfrac{-j}{12\pi}e^{-j\beta x}\hat z$`], 0,
          [null, md`$\cos(\omega t - \beta x)$ has phase $-\beta x$, which is $e^{-j\beta x}$. $e^{+j\beta x}$ travels the other way.`, md`$\mathbf H$ is in phase with $\mathbf E$ in free space ($\eta_0$ is real): no $j$.`, md`$-j$ is the phasor of a sine. This is a cosine.`]),
        NT(md`(iii) peak of $P(t)$`, 100 / ETA0, 'W', [{ v: 50 / ETA0, msg: 'That is the average. The instantaneous power peaks at E²/η₀ = 100/(120π).' }]),
        NT(md`(iv) $\langle P\rangle$`, 50 / ETA0, 'W', [{ v: 100 / ETA0, msg: 'That is the peak. cos² averages to ½.' }]),
      ],
      hints: [md`$\omega t - \beta x$: toward $+\hat x$. $\mathbf H = \frac{1}{\eta_0}\hat x\times\mathbf E$.`],
      sol: md`
        **(i) The partner.** The phase $\omega t - \beta x$ moves toward $+x$, so $\hat k = \hat x$. Then
        $$\mathbf H_1 = \frac{1}{\eta_0}\hat x\times\big(10\cos(\omega t - \beta x)\,\hat y\big)$$
        $\hat x\times\hat y = \hat z$ and $10/(120\pi) = 1/(12\pi)$:
        $$\boxed{\mathbf H_1 = \frac{1}{12\pi}\cos(\omega t - \beta x)\,\hat z\ \text{A/m}}$$
        That is $26.5$ mA/m in amplitude.

        **(ii) Phasors.** A cosine with phase $-\beta x$ has phasor $e^{-j\beta x}$:
        $$\boxed{\Et_1 = 10e^{-j\beta x}\hat y\ \text{V/m}, \quad \Ht_1 = \frac{e^{-j\beta x}}{12\pi}\hat z\ \text{A/m}}$$
        **(iii) Instantaneous power.** $\mathbf E\times\mathbf H = 10\cdot\frac{1}{12\pi}\cos^2(\omega t - \beta x)\,(\hat y\times\hat z)$, and $\hat y\times\hat z = \hat x$. Through 1 m² facing $\hat x$:
        $$P(t) = \frac{10}{12\pi}\cos^2(\omega t - \beta x)$$
        $$\boxed{P(t) = 0.265\cos^2(\omega t - \beta x)\ \text{W}}$$
        **(iv) Average.** $\cos^2$ averages to $\tfrac12$:
        $$\boxed{\langle P\rangle = \frac{5}{12\pi} = 0.133\ \text{W}}$$
        Check with the formula: $|\Et|^2/(2\eta_0) = 100/(240\pi) = 5/(12\pi)$ ✓.

        **Speed path.** $\hat k = \hat x$, $\hat x\times\hat y = \hat z$, $H = 10/120\pi$. $\langle P\rangle = E^2/(2\eta_0) = 100/(240\pi)$.
      ` }),
    P({ src: 'HW 8 #4(b)', title: 'H₂: two components that turn out to be in step',
      q: md`(b) $\mathbf H_2 = 5\cos\left(\omega t + \beta z + \frac\pi3\right)\hat x + 5\sin\left(\omega t + \beta z - \frac\pi6\right)\hat y$ A/m. Find (i) $\mathbf E_2$, (ii) the phasors, (iii) the instantaneous power through 1 m², (iv) the average power through 1 m².`,
      parts: [
        mc(md`(i) $\mathbf E_2 =$`, [md`$600\pi\cos\left(\omega t + \beta z + \frac\pi3\right)(\hat x + \hat y)$ V/m`, md`$600\pi\cos\left(\omega t + \beta z + \frac\pi3\right)(\hat x - \hat y)$ V/m`, md`$-600\pi\cos\left(\omega t + \beta z + \frac\pi3\right)(\hat x + \hat y)$ V/m`, md`$\dfrac{5}{120\pi}\cos\left(\omega t + \beta z + \frac\pi3\right)(\hat x + \hat y)$ V/m`], 0,
          [null, md`That is parallel to $\mathbf H$ itself ($\hat x - \hat y$). $\mathbf E$ must be perpendicular to $\mathbf H$.`, md`That is the partner of a wave going toward $+z$. This one goes toward $-z$, and $\mathbf E = \eta_0\mathbf H\times(-\hat z)$.`, md`That divides by $\eta_0$. $E = \eta_0H$.`]),
        mc(md`(ii) $\Ht_2 =$`, [md`$5e^{j\pi/3}(\hat x - \hat y)\,e^{j\beta z}$ A/m`, md`$5e^{j\pi/3}(\hat x + \hat y)\,e^{j\beta z}$ A/m`, md`$5\left(e^{j\pi/3}\hat x + e^{-j\pi/6}\hat y\right)e^{j\beta z}$ A/m`, md`$5e^{j\pi/3}(\hat x - \hat y)\,e^{-j\beta z}$ A/m`], 0,
          [null, md`$5\sin(\theta - \frac\pi6) = 5\cos(\theta - \frac{2\pi}{3})$, and $e^{-j2\pi/3} = -e^{j\pi/3}$: the $\hat y$ part has a minus sign.`, md`That keeps the sine's phase $-\frac\pi6$ as if it were a cosine. A sine is a cosine delayed by $\frac\pi2$: $-\frac\pi6 - \frac\pi2 = -\frac{2\pi}{3}$.`, md`$+\beta z$ in the phase becomes $e^{+j\beta z}$.`]),
        NT(md`(iii) peak of $P(t)$`, 6000 * PI, 'W', [{ v: 3000 * PI, msg: 'That is the average.' }, { v: 3000 * PI * 2 * 2, msg: 'Check |H|²: the two components are in step, so |H|² = 25 + 25 = 50 at the peak, and P = η₀|H|² = 6000π.' }]),
        NT(md`(iv) $\langle P\rangle$`, 3000 * PI, 'W', [{ v: 1500 * PI, msg: 'That uses only one component. Both carry power: η₀(25 + 25)/2.' }]),
      ],
      hints: [md`Turn the sine into a cosine: $\sin\left(\theta - \frac\pi6\right) = \cos\left(\theta - \frac{2\pi}{3}\right) = -\cos\left(\theta + \frac\pi3\right)$.`, md`$+\beta z$: toward $-\hat z$. $\mathbf E = \eta_0\mathbf H\times(-\hat z)$.`],
      sol: md`
        **Step 1: make both components cosines.** Let $\theta = \omega t + \beta z$. A sine is a cosine $\frac\pi2$ later:
        $$\sin\left(\theta - \tfrac\pi6\right) = \cos\left(\theta - \tfrac\pi6 - \tfrac\pi2\right)$$
        The two shifts add to $-\frac{2\pi}{3}$:
        $$\sin\left(\theta - \tfrac\pi6\right) = \cos\left(\theta - \tfrac{2\pi}{3}\right)$$
        And $\theta - \frac{2\pi}3 = \left(\theta + \frac\pi3\right) - \pi$. Shifting by $\pi$ flips the sign:
        $$\sin\left(\theta - \tfrac\pi6\right) = -\cos\left(\theta + \tfrac\pi3\right)$$
        So both components share one cosine:
        $$\mathbf H_2 = 5\cos\left(\theta + \tfrac\pi3\right)(\hat x - \hat y)$$
        This is a **linearly** polarized wave, with $\mathbf H$ along $\hat x - \hat y$.

        **(i) E.** $+\beta z$ means travel toward $-z$, so $\hat k = -\hat z$ and $\mathbf E = \eta_0\mathbf H\times(-\hat z)$. Cross each unit vector:
        $$\hat x\times(-\hat z) = \hat y, \qquad \hat y\times(-\hat z) = -\hat x$$
        So $(\hat x - \hat y)\times(-\hat z) = \hat y + \hat x$, and $\eta_0\cdot5 = 600\pi$:
        $$\boxed{\mathbf E_2 = 600\pi\cos\left(\omega t + \beta z + \tfrac\pi3\right)(\hat x + \hat y)\ \text{V/m}}$$
        Check: $(\hat x + \hat y)\times(\hat x - \hat y) = -\hat z - \hat z = -2\hat z$, along the travel direction ✓.

        **(ii) Phasors.** $\cos(\theta + \frac\pi3)$ becomes $e^{j\pi/3}e^{j\beta z}$:
        $$\boxed{\Ht_2 = 5e^{j\pi/3}(\hat x - \hat y)\,e^{j\beta z}\ \text{A/m}}$$
        $$\boxed{\Et_2 = 600\pi e^{j\pi/3}(\hat x + \hat y)\,e^{j\beta z}\ \text{V/m}}$$
        **(iii) Instantaneous power.** With $C = \cos(\theta + \frac\pi3)$:
        $$\mathbf E\times\mathbf H = (600\pi)(5)C^2\,(\hat x + \hat y)\times(\hat x - \hat y) = -6000\pi C^2\,\hat z$$
        It points along $-\hat z$, the travel direction. Through 1 m²:
        $$\boxed{P(t) = 6000\pi\cos^2\left(\omega t + \beta z + \tfrac\pi3\right)\ \text{W}}$$
        which peaks at $6000\pi \approx 1.88\times10^4$ W.

        **(iv) Average.**
        $$\boxed{\langle P\rangle = 3000\pi \approx 9.42\times10^3\ \text{W}}$$
        Check: $\eta_0|\Ht|^2/2 = 120\pi(25 + 25)/2 = 3000\pi$ ✓.

        **Speed path.** $\sin(\theta - 30°) = -\cos(\theta + 60°)$: the components are in step, so it is linear along $\hat x - \hat y$. $\mathbf E = \eta_0\mathbf H\times(-\hat z)$ turns $\hat x - \hat y$ into $\hat x + \hat y$. $\langle P\rangle = \eta_0(5^2 + 5^2)/2$.
      ` }),
    P({ src: 'HW 8 #4(c)', title: 'H₃: two sines that are one cosine',
      q: md`(c) $\mathbf H_3 = \sin\left(\omega t - \beta z + \frac\pi4\right)\hat x - 2\sin\left(\omega t - \beta z - \frac{3\pi}{4}\right)\hat y$ A/m. Find (i) $\mathbf E_3$, (ii) the phasors, (iii) the instantaneous power through 1 m², (iv) the average power through 1 m².`,
      parts: [
        mc(md`(i) $\mathbf E_3 =$`, [md`$120\pi\cos\left(\omega t - \beta z - \frac\pi4\right)(2\hat x - \hat y)$ V/m`, md`$120\pi\cos\left(\omega t - \beta z - \frac\pi4\right)(\hat x + 2\hat y)$ V/m`, md`$120\pi\cos\left(\omega t - \beta z - \frac\pi4\right)(-2\hat x + \hat y)$ V/m`, md`$120\pi\cos\left(\omega t - \beta z + \frac\pi4\right)(2\hat x - \hat y)$ V/m`], 0,
          [null, md`That is parallel to $\mathbf H$. $\mathbf E$ is $\mathbf H$ turned $90°$ about $\hat z$.`, md`That is the partner of a $-z$ wave. For $+\hat z$, $\mathbf E = \eta_0\mathbf H\times\hat z$, and $\hat y\times\hat z = +\hat x$.`, md`$\sin(\theta + \frac\pi4) = \cos(\theta - \frac\pi4)$: the sine-to-cosine step subtracts $\frac\pi2$.`]),
        mc(md`(ii) $\Ht_3 =$`, [md`$e^{-j\pi/4}(\hat x + 2\hat y)\,e^{-j\beta z}$ A/m`, md`$e^{-j\pi/4}(\hat x - 2\hat y)\,e^{-j\beta z}$ A/m`, md`$e^{j\pi/4}(\hat x + 2\hat y)\,e^{-j\beta z}$ A/m`, md`$e^{-j\pi/4}(\hat x + 2\hat y)\,e^{+j\beta z}$ A/m`], 0,
          [null, md`$-2\sin(\theta - \frac{3\pi}4) = +2\sin(\theta + \frac\pi4)$: shifting by $\pi$ flips the sign, so the $\hat y$ part is $+2$.`, md`That treats the sines as cosines. $\sin(\theta + \frac\pi4) \to -je^{j\pi/4} = e^{-j\pi/4}$.`, md`$-\beta z$ in the phase becomes $e^{-j\beta z}$.`]),
        NT(md`(iii) peak of $P(t)$`, 600 * PI, 'W', [{ v: 300 * PI, msg: 'That is the average.' }]),
        NT(md`(iv) $\langle P\rangle$`, 300 * PI, 'W', [{ v: 60 * PI, msg: 'That counts only the x component (1²). |H|² = 1 + 4 = 5.' }]),
      ],
      hints: [md`$-2\sin\left(\theta - \frac{3\pi}4\right) = 2\sin\left(\theta - \frac{3\pi}{4} + \pi\right) = 2\sin\left(\theta + \frac\pi4\right)$.`, md`$\sin\left(\theta + \frac\pi4\right) = \cos\left(\theta - \frac\pi4\right)$. Then $\mathbf E = \eta_0\mathbf H\times\hat z$.`],
      sol: md`
        **Step 1: simplify.** Let $\theta = \omega t - \beta z$. Adding $\pi$ inside a sine flips its sign, so
        $$-2\sin\left(\theta - \tfrac{3\pi}4\right) = 2\sin\left(\theta - \tfrac{3\pi}{4} + \pi\right) = 2\sin\left(\theta + \tfrac\pi4\right)$$
        Both components now have the same sine:
        $$\mathbf H_3 = \sin\left(\theta + \tfrac\pi4\right)(\hat x + 2\hat y)$$
        As a cosine, $\sin(\theta + \frac\pi4) = \cos(\theta + \frac\pi4 - \frac\pi2) = \cos(\theta - \frac\pi4)$:
        $$\mathbf H_3 = \cos\left(\theta - \tfrac\pi4\right)(\hat x + 2\hat y)\ \text{A/m}$$
        Linear, along $\hat x + 2\hat y$.

        **(i) E.** $-\beta z$ means travel toward $+z$. $\mathbf E = \eta_0\mathbf H\times\hat z$ with
        $$\hat x\times\hat z = -\hat y, \qquad \hat y\times\hat z = \hat x$$
        So $(\hat x + 2\hat y)\times\hat z = -\hat y + 2\hat x$:
        $$\boxed{\mathbf E_3 = 120\pi\cos\left(\omega t - \beta z - \tfrac\pi4\right)(2\hat x - \hat y)\ \text{V/m}}$$
        Check: $(2\hat x - \hat y)\times(\hat x + 2\hat y) = 4\hat z + \hat z = 5\hat z$, along $+\hat z$ ✓.

        **(ii) Phasors.**
        $$\boxed{\Ht_3 = e^{-j\pi/4}(\hat x + 2\hat y)\,e^{-j\beta z}\ \text{A/m}}$$
        $$\boxed{\Et_3 = 120\pi e^{-j\pi/4}(2\hat x - \hat y)\,e^{-j\beta z}\ \text{V/m}}$$
        **(iii) Instantaneous power.** With $C = \cos(\theta - \frac\pi4)$, $\mathbf E\times\mathbf H = 120\pi C^2\cdot5\hat z$:
        $$\boxed{P(t) = 600\pi\cos^2\left(\omega t - \beta z - \tfrac\pi4\right)\ \text{W}}$$
        **(iv) Average.**
        $$\boxed{\langle P\rangle = 300\pi \approx 942\ \text{W}}$$
        Check: $\eta_0|\Ht|^2/2 = 120\pi(1 + 4)/2 = 300\pi$ ✓.

        **Speed path.** $-2\sin(\theta - 135°) = 2\sin(\theta + 45°)$: one shape, linear along $\hat x + 2\hat y$. Rotate by $\times\hat z$ to get $2\hat x - \hat y$. $\langle P\rangle = \eta_0(1 + 4)/2 = 300\pi$.
      ` }),
    P({ src: 'HW 8 #4(d)', title: 'E₄ traveling toward −y',
      q: md`(d) $\mathbf E_4 = 2\cos\left(\omega t + \beta y - \frac\pi2\right)\hat x - 2\sin(\omega t + \beta y)\,\hat z$ V/m. Find (i) $\mathbf H_4$, (ii) the phasors, (iii) the instantaneous power through 1 m², (iv) the average power through 1 m².`,
      parts: [
        mc(md`(i) $\mathbf H_4 =$`, [md`$\dfrac{1}{60\pi}\sin(\omega t + \beta y)(\hat x + \hat z)$ A/m`, md`$-\dfrac{1}{60\pi}\sin(\omega t + \beta y)(\hat x + \hat z)$ A/m`, md`$\dfrac{1}{60\pi}\sin(\omega t + \beta y)(\hat x - \hat z)$ A/m`, md`$\dfrac{1}{120\pi}\sin(\omega t + \beta y)(\hat x + \hat z)$ A/m`], 0,
          [null, md`That is the partner of a $+y$ wave. Here $\hat k = -\hat y$, and $(-\hat y)\times\hat x = +\hat z$.`, md`That is parallel to $\mathbf E$.`, md`Each component is $2/\eta_0 = 1/(60\pi)$, not $1/\eta_0$.`]),
        mc(md`(ii) $\Et_4 =$`, [md`$-2j(\hat x - \hat z)\,e^{j\beta y}$ V/m`, md`$2(\hat x - \hat z)\,e^{j\beta y}$ V/m`, md`$2j(\hat x - \hat z)\,e^{j\beta y}$ V/m`, md`$-2j(\hat x - \hat z)\,e^{-j\beta y}$ V/m`], 0,
          [null, md`Both components are sines ($\cos(\theta - \frac\pi2) = \sin\theta$), and a sine's phasor is $-j$.`, md`$+j$ is the phasor of $-\sin$. Here the $\hat x$ part is $+2\sin\theta$.`, md`$+\beta y$ in the phase is $e^{+j\beta y}$.`]),
        NT(md`(iii) peak of $P(t)$`, 1 / (15 * PI), 'W', [{ v: 1 / (30 * PI), msg: 'That is the average.' }]),
        NT(md`(iv) $\langle P\rangle$`, 1 / (30 * PI), 'W', [{ v: 1 / (60 * PI), msg: 'That keeps only one component. |E|² = 4 + 4 = 8.' }]),
      ],
      hints: [md`$\cos(\theta - \frac\pi2) = \sin\theta$. Both components are $\pm2\sin(\omega t + \beta y)$.`, md`$+\beta y$: toward $-\hat y$. $\mathbf H = \frac{1}{\eta_0}(-\hat y)\times\mathbf E$.`],
      sol: md`
        **Step 1: simplify.** Let $\theta = \omega t + \beta y$. $\cos(\theta - \frac\pi2) = \sin\theta$, so
        $$\mathbf E_4 = 2\sin\theta\,\hat x - 2\sin\theta\,\hat z = 2\sin\theta\,(\hat x - \hat z)$$
        Linear, along $\hat x - \hat z$.

        **(i) H.** $+\beta y$ means travel toward $-y$: $\hat k = -\hat y$. Cross:
        $$(-\hat y)\times\hat x = \hat z, \qquad (-\hat y)\times(-\hat z) = \hat y\times\hat z = \hat x$$
        So $(-\hat y)\times(\hat x - \hat z) = \hat z + \hat x$, and $2/\eta_0 = 1/(60\pi)$:
        $$\boxed{\mathbf H_4 = \frac{1}{60\pi}\sin(\omega t + \beta y)(\hat x + \hat z)\ \text{A/m}}$$
        Check: $(\hat x - \hat z)\times(\hat x + \hat z) = -\hat y - \hat y = -2\hat y$ ✓.

        **(ii) Phasors.** $\sin\theta \to -j$, and the travel term gives $e^{j\beta y}$:
        $$\boxed{\Et_4 = -2j(\hat x - \hat z)\,e^{j\beta y}\ \text{V/m}}$$
        $$\boxed{\Ht_4 = \frac{-j}{60\pi}(\hat x + \hat z)\,e^{j\beta y}\ \text{A/m}}$$
        **(iii) Instantaneous power.** $\mathbf E\times\mathbf H = 2\cdot\frac{1}{60\pi}\sin^2\theta\,(-2\hat y) = -\frac{1}{15\pi}\sin^2\theta\,\hat y$. Through 1 m² facing $-\hat y$:
        $$\boxed{P(t) = \frac{1}{15\pi}\sin^2(\omega t + \beta y) = 21.2\sin^2(\omega t + \beta y)\ \text{mW}}$$
        **(iv) Average.**
        $$\boxed{\langle P\rangle = \frac{1}{30\pi} = 10.6\ \text{mW}}$$
        Check: $|\Et|^2/(2\eta_0) = (4 + 4)/(240\pi) = 1/(30\pi)$ ✓.

        **Speed path.** $\cos(\theta - 90°) = \sin\theta$: linear along $\hat x - \hat z$ with size $2\sqrt2$. $\langle P\rangle = 8/(2\eta_0)$.
      ` }),
    P({ src: 'HW 8 #4(e)', title: 'H₅: equal sizes, 135° apart',
      q: md`(e) $\mathbf H_5 = \cos(\omega t - \beta y)\,\hat x + \sin\left(\omega t - \beta y - \frac\pi4\right)\hat z$ (A/m). Find (i) $\mathbf E_5$, (ii) the phasors, (iii) the instantaneous power through 1 m², (iv) the average power through 1 m².`,
      parts: [
        mc(md`(i) $\mathbf E_5 =$`, [md`$120\pi\left[-\sin\left(\omega t - \beta y - \frac\pi4\right)\hat x + \cos(\omega t - \beta y)\,\hat z\right]$ V/m`, md`$120\pi\left[\sin\left(\omega t - \beta y - \frac\pi4\right)\hat x - \cos(\omega t - \beta y)\,\hat z\right]$ V/m`, md`$120\pi\left[\cos(\omega t - \beta y)\,\hat x + \sin\left(\omega t - \beta y - \frac\pi4\right)\hat z\right]$ V/m`, md`$120\pi\left[\sin\left(\omega t - \beta y - \frac\pi4\right)\hat x + \cos(\omega t - \beta y)\,\hat z\right]$ V/m`], 0,
          [null, md`That is the partner of a $-y$ wave: every sign is flipped.`, md`That is $\eta_0\mathbf H$, parallel to $\mathbf H$. $\mathbf E$ must be perpendicular to it.`, md`One sign is off: $\hat z\times\hat y = -\hat x$, so $H_z$ becomes $-\eta_0H_z$ along $\hat x$.`]),
        mc(md`(ii) $\Ht_5 =$`, [md`$\left(\hat x + e^{-j3\pi/4}\hat z\right)e^{-j\beta y}$ A/m`, md`$\left(\hat x + e^{-j\pi/4}\hat z\right)e^{-j\beta y}$ A/m`, md`$\left(\hat x - j\hat z\right)e^{-j\beta y}$ A/m`, md`$\left(\hat x + e^{j\pi/4}\hat z\right)e^{-j\beta y}$ A/m`], 0,
          [null, md`That treats the sine as a cosine. $\sin(\theta - \frac\pi4) = \cos(\theta - \frac{3\pi}4)$.`, md`$-j$ alone is the phasor of $\sin\theta$. Here the sine also has the shift $-\frac\pi4$.`, md`Sign of the shift: $\sin(\theta - \frac\pi4) = \cos(\theta - \frac\pi4 - \frac\pi2)$.`]),
        NT(md`(iii) peak of $P(t)$`, ETA0 * (1 + 1 / Math.SQRT2), 'W', [{ v: 2 * ETA0, msg: 'The two components never peak together (they are 135° apart), so |H|² never reaches 2.' }, { v: ETA0, msg: 'That is the average.' }]),
        NT(md`(iv) $\langle P\rangle$`, ETA0, 'W', [{ v: ETA0 / 2, msg: 'That counts one component. Each contributes η₀(1)²/2.' }]),
      ],
      hints: [md`$-\beta y$: toward $+\hat y$. $\mathbf E = \eta_0\mathbf H\times\hat y$ with $\hat x\times\hat y = \hat z$ and $\hat z\times\hat y = -\hat x$.`, md`$\sin\left(\theta - \frac\pi4\right) = \cos\left(\theta - \frac{3\pi}{4}\right)$.`],
      sol: md`
        **Step 1: what kind of wave.** Let $\theta = \omega t - \beta y$. The $\hat z$ part as a cosine is $\sin(\theta - \frac\pi4) = \cos(\theta - \frac{3\pi}{4})$. So the two components have equal size 1 and are $\frac{3\pi}{4} = 135°$ apart in time. Neither $0°$/$180°$ (linear) nor $\pm90°$ (circular): this wave is **elliptically** polarized.

        **(i) E.** $-\beta y$ means $\hat k = +\hat y$, and $\mathbf E = \eta_0\mathbf H\times\hat y$:
        $$\hat x\times\hat y = \hat z, \qquad \hat z\times\hat y = -\hat x$$
        So $H_x$ becomes an $\hat z$ component and $H_z$ becomes a $-\hat x$ component:
        $$\boxed{\mathbf E_5 = 120\pi\left[-\sin\left(\theta - \tfrac\pi4\right)\hat x + \cos\theta\,\hat z\right]\ \text{V/m}}$$
        **(ii) Phasors.** $\cos\theta \to 1$; $\sin(\theta - \frac\pi4) \to e^{-j3\pi/4}$:
        $$\boxed{\Ht_5 = \left(\hat x + e^{-j3\pi/4}\hat z\right)e^{-j\beta y}\ \text{A/m}}$$
        For $\Et$, $-e^{-j3\pi/4} = e^{-j3\pi/4}e^{j\pi} = e^{j\pi/4}$:
        $$\boxed{\Et_5 = 120\pi\left(e^{j\pi/4}\hat x + \hat z\right)e^{-j\beta y}\ \text{V/m}}$$
        **(iii) Instantaneous power.** Write $\mathbf H = H_x\hat x + H_z\hat z$, so $\mathbf E = \eta_0(-H_z\hat x + H_x\hat z)$. Cross them, using $\hat x\times\hat z = -\hat y$ and $\hat z\times\hat x = \hat y$:
        $$\mathbf E\times\mathbf H = \eta_0\left(-H_z^2\,\hat x\times\hat z + H_x^2\,\hat z\times\hat x\right) = \eta_0\left(H_x^2 + H_z^2\right)\hat y$$
        So through 1 m² facing $+\hat y$:
        $$\boxed{P(t) = 120\pi\left[\cos^2\theta + \sin^2\left(\theta - \tfrac\pi4\right)\right]\ \text{W}}$$
        It is not constant: with $\cos^2a = \frac{1 + \cos2a}{2}$ it is $120\pi\left[1 + \frac{1}{\sqrt2}\cos\left(2\theta + \frac\pi4\right)\right]$, swinging between $110$ W and $644$ W.

        **(iv) Average.** Each squared cosine averages to $\tfrac12$:
        $$\boxed{\langle P\rangle = 120\pi\left(\tfrac12 + \tfrac12\right) = 120\pi \approx 377\ \text{W}}$$
        [[fig:e]]

        !!intuition Does this make sense?
          For circular polarization ($90°$ apart) $|\mathbf H|^2$ would be constant and $P(t)$ would not ripple at all. For linear (in step) it would drop to zero twice per period. At $135°$ it does something in between. The average does not care about the phase: it is always $\eta_0(|H_x|^2 + |H_z|^2)/2$.

        **Speed path.** Equal sizes, $135°$ apart: elliptical. $\mathbf E = \eta_0\mathbf H\times\hat y$ (sends $\hat x\to\hat z$, $\hat z\to-\hat x$). $\langle P\rangle = \eta_0(1 + 1)/2 = 120\pi$.
      `,
      figs: { e: fig8e } }),
  ];
  EM.lesson('e3-hw', { id: 'e3-hw8', order: 8, kind: 'hw', title: 'Homework 8', sub: 'Reading a wave, a ramp-pulse sheet, power into a box, five free-space waves', steps: hw8 });

  // ================================================================ HOMEWORK 9
  // Problem 1: directions of E, H and travel for (a) and (b); the rotation for (c)
  function dirFig(alt, eDir, hOut, kDir, eLab, kLab) {
    const g = PF.fig({ alt });
    const ox = 120, oy = 100, L = 62;
    const d = { r: [1, 0], l: [-1, 0], u: [0, -1], dn: [0, 1] };
    triad(g, 24, 190, 'x', 'y', 'z');
    g.arrow(ox, oy, ox + d[eDir][0] * L, oy + d[eDir][1] * L, { cls: 'thick', hs: 8 });
    g.label(ox + d[eDir][0] * (L + 8), oy + d[eDir][1] * (L + 8) - (d[eDir][1] ? 0 : 8), eLab, d[eDir][1] ? (d[eDir][1] < 0 ? 'b' : 't') : 'b', 'small');
    g.odot(ox, oy, 7); g.label(ox - 12, oy + 12, '\\mathbf H', 'tr', 'small');
    g.arrow(ox + 90, oy + 30, ox + 90 + d[kDir][0] * 50, oy + 30 + d[kDir][1] * 50, { hs: 7 });
    g.label(ox + 96 + d[kDir][0] * 25, oy + 30 + d[kDir][1] * 25, kLab, 'l', 'small');
    return g.svg();
  }
  const fig9a = PF.row([
    { svg: dirFig('Case (a): E along +x (right), H along +z (out of the page), travel along -y (down).', 'r', true, 'dn', '\\mathbf E', '\\text{travel } {-\\hat y}'), cap: '(a) $\\mathbf E\\times\\mathbf H$: $\\hat x\\times\\hat z = -\\hat y$.' },
    { svg: dirFig('Case (b): E along +y (up), H along +z (out of the page), travel along +x (right).', 'u', true, 'r', '\\mathbf E', '\\text{travel } {+\\hat x}'), cap: '(b) $\\hat y\\times\\hat z = +\\hat x$.' },
  ]);
  function circFig() {
    const g = PF.fig({ alt: 'The tip of E at z = 0 seen with the wave coming toward you (z out of the page): a circle of radius E_o traced counterclockwise, from +x at t = 0 to +y at t = T/4.' });
    const cx = 130, cy = 110, r = 64;
    g.arrow(cx - 92, cy, cx + 96, cy, { cls: 'dim', hs: 6 }); g.label(cx + 100, cy, 'x', 'l', 'small');
    g.arrow(cx, cy + 90, cx, cy - 94, { cls: 'dim', hs: 6 }); g.label(cx, cy - 98, 'y', 'b', 'small');
    g.circle(cx, cy, r, { cls: 'dash' });
    g.arc(cx, cy, r + 10, 12, 78, { cls: 'thick', arrow: 'end', hs: 8 });
    g.arrow(cx, cy, cx + r * 0.71, cy - r * 0.71, { cls: 'thick', hs: 8 }); g.label(cx + r * 0.71 + 6, cy - r * 0.71 + 14, '\\mathbf E(t)', 'l', 'small');
    g.label(cx + r + 4, cy + 6, 't = 0', 'tl', 'small'); g.label(cx - 6, cy - r - 4, 't = T/4', 'br', 'small');
    g.odot(cx - 70, cy + 64, 5); g.label(cx - 62, cy + 64, 'z\\ \\text{(toward you)}', 'l', 'small');
    return g.svg();
  }
  const fig9c = { svg: circFig(), cap: 'Right-hand circular toward $+z$: thumb along $+\\hat z$ (out of the page), fingers curl from $\\hat x$ to $\\hat y$.' };
  const sheet9Fig = () => sheetFig({ alt: 'A current sheet in the plane z = 0, seen edge-on. Its current points along +x (drawn up). Waves leave toward +z (right) and -z (left). Axes: z right, x up, y out of the page.',
    at: 'z = 0', jlab: '\\mathbf J_s = \\hat xJ_{so}\\sin\\omega t', jdir: 'up', tri: ['z', 'x', 'y', false], left: '\\text{toward } {-z}', right: '\\text{toward } {+z}' });
  const fig9s = { svg: PF.plot({ w: 360, h: 190, x: [0, 1.6], y: [0, 4900], xl: 'z\\,(\\text{m})', yl: '\\langle S_z\\rangle\\,(\\text{W/m}^2)',
    xt: [[1, '1']], yt: [[4274, '4274'], [578, '578']], vlines: [[1, '']], curves: [{ f: (z) => 4273.66 * Math.exp(-2 * z) }] }),
    cap: '$\\langle S_z\\rangle = 4274\\,e^{-2z}$ W/m². In through $z = 0$, out through $z = 1$ m: the difference stays in the cube as heat.' };
  const fig9d = { svg: PF.plot({ w: 360, h: 210, x: [0, 45], y: [-48, 4], zero: true, xl: 'd\\,(\\text{m})', yl: '\\text{amplitude (dB)}',
    xt: [[3.86, '3.86'], [38.6, '38.6']], yt: [[-40, '-40']], hlines: [[-40, '1\\%']],
    curves: [{ f: (d) => -8.686 * 1.19215 * d, lab: '90\\ \\text{kHz}', labAt: 4.4, dx: 6, dy: 4 }, { f: (d) => -8.686 * 0.119215 * d, lab: '900\\ \\text{Hz}', labAt: 22, dx: 4, dy: -10 }] }),
    cap: 'Signal amplitude in dB versus depth: $20\\log_{10}e^{-\\alpha d} = -8.69\\,\\alpha d$. One percent is $-40$ dB.' };
  const sheet9bFig = () => sheetFig({ alt: 'A current sheet in the plane x = 2 m inside a dielectric with epsilon = 9/4 epsilon_0. Its current points along +y (up). Waves leave toward +x (right) and -x (left). Axes: x right, y up, z out of the page.',
    at: 'x = 2\\ \\text{m}', jlab: '\\mathbf J_s(t)', jdir: 'up', tri: ['x', 'y', 'z', false], medium: 'ε = 9ε₀/4', left: '\\text{toward } {-x}', right: '\\text{toward } {+x}' });

  const hw9 = [
    R(md`
      **Homework 9** · due Thursday, October 29, 2026 · reading: Kudeki, Lectures 21–24 (phasors, phasor Maxwell, waves in lossy media, good conductors, circular polarization).

      **What it drills.** Problem 1 builds three waves from a list of specifications (medium, polarization, direction, frequency) and asks for everything: $\eta$, $v$, $\lambda$, $\beta$, the fields in time and as phasors, the complex and average Poynting vectors, and where each wave sits in the spectrum. Problem 2 runs a sheet backwards: from the power it radiates to its current. Problem 3 reads a lossy medium ($\gamma$, $\eta$, $\sigma$, $\epsilon$) off one $\mathbf H$ field and counts the heat in a cube. Problem 4 is the classic submarine in sea water. Problem 5 is a sheet in a dielectric, with Poynting's theorem checked in time and on average.

      **Read these first.** [Topic 4: time-averaged power](#/l/w1-avg), [Topic 5: where γ and η come from](#/l/w2-gamma), [Topic 6: reading a lossy wave](#/l/w2-read), [Topic 7: good conductors and skin depth](#/l/w2-limits), [Topic 8: power in lossy media](#/l/w2-loss), [Topic 9: polarization](#/l/w3-pol), [Topic 3: Poynting's theorem](#/l/w1-poynting) and [Topic 10: current sheets](#/l/w3-antenna).

      **Conventions used below.** The course defines the **complex Poynting vector** as $\tilde{\mathbf S} = \Et\times\Ht^*$, so $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf S}\}$. Handedness: point your right thumb along the direction of travel; if your fingers curl the way $\mathbf E$ turns in time at a fixed point, the wave is right-handed. Problems are restated in our own words with every number as assigned; there is no official key, and every answer was checked in Python. Problem 6 (an AI-literacy reflection) is not physics and is omitted.
    `),

    // ================================================================ HW 9 Problem 1
    RF(md`
      ### Problem 1 · Three waves from their specifications

      For each wave, find what is asked: (i) the medium's impedance and one more property, (ii) the wavelength or frequency and whether the eye can see the wave (and if not, which band it is in), (iii) $\mathbf E(\mathbf r, t)$ and $\mathbf H(\mathbf r, t)$ as cosine waves, (iv) the phasors $\Et$ and $\Ht$, (v) the complex Poynting vector $\tilde{\mathbf S}$ and the average $\langle\mathbf S\rangle$. The sketches show the directions found below for (a) and (b).

      [[fig:d]]
    `, { d: { svg: fig9a.svg } }),
    P({ src: 'HW 9 #1(a)', title: 'μ = μ₀, ε = 12ε₀, E along x̂, power toward −ŷ, ω₀ = 12π × 10¹⁴ rad/s',
      q: md`(a) The medium has $\mu = \mu_0$ and $\epsilon = 12\epsilon_0$. The electric field is linearly polarized along $\hat x$ with amplitude $E_o$, the Poynting vector points along $-\hat y$, and the angular frequency is $\omega_o = 12\pi\times10^{14}$ rad/s. Find (i) $\eta$ and the propagation speed; (ii) $\lambda$ and $\beta$, and whether the wave is visible; (iii) $\mathbf E$ and $\mathbf H$; (iv) their phasors; (v) $\tilde{\mathbf S}$ and $\langle\mathbf S\rangle$.`,
      parts: [
        NT(md`(i) $\eta$`, ETA0 / Math.sqrt(12), 'Ω', [{ v: ETA0 / 12, msg: 'That divides by εr. η = η₀/√εr.' }]),
        NT(md`(i) $v$`, C0 / Math.sqrt(12), 'm/s', [{ v: C0 / 12, msg: 'v = c/√εr, not c/εr.' }]),
        NT(md`(ii) $\lambda$ in the medium`, 1.4434e-7, 'm', [{ v: 5e-7, msg: 'That is the free-space wavelength c/f. In the medium λ = v/f.' }]),
        NT(md`(ii) $\beta$`, 4.3531e7, 'rad/m', [{ v: 1.2566e7, msg: 'That is ω/c. In the medium β = ω/v = √12 ω/c.' }]),
        mc(md`(ii) Visible?`, [md`Yes: green (free-space wavelength 500 nm)`, md`No: ultraviolet, since $\lambda = 144$ nm`, md`Yes: red (700 nm)`, md`No: infrared`], 0,
          [null, md`The eye responds to frequency. Once the wave leaves the medium into air its wavelength is $c/f = 500$ nm, not 144 nm.`, md`$f = 6\times10^{14}$ Hz gives $c/f = 500$ nm, not 700 nm.`, md`Infrared is below about $4\times10^{14}$ Hz. This is $6\times10^{14}$ Hz.`]),
        mc(md`(iii) the fields`, [md`$\mathbf E = \hat xE_o\cos(\omega_ot + \beta y)$, $\mathbf H = \hat z\dfrac{E_o}{\eta}\cos(\omega_ot + \beta y)$`, md`$\mathbf E = \hat xE_o\cos(\omega_ot - \beta y)$, $\mathbf H = \hat z\dfrac{E_o}{\eta}\cos(\omega_ot - \beta y)$`, md`$\mathbf E = \hat xE_o\cos(\omega_ot + \beta y)$, $\mathbf H = -\hat z\dfrac{E_o}{\eta}\cos(\omega_ot + \beta y)$`, md`$\mathbf E = \hat xE_o\cos(\omega_ot + \beta y)$, $\mathbf H = \hat y\dfrac{E_o}{\eta}\cos(\omega_ot + \beta y)$`], 0,
          [null, md`$\omega t - \beta y$ travels toward $+y$; the power goes toward $-y$.`, md`Then $\mathbf E\times\mathbf H \propto \hat x\times(-\hat z) = +\hat y$, the wrong way.`, md`$\mathbf H$ cannot lie along the travel direction.`]),
        NT(md`(v) $|\langle\mathbf S\rangle|$ for $E_o = 1$ V/m`, 1 / (2 * ETA0 / Math.sqrt(12)), 'W/m^2', [{ v: Math.sqrt(12) / ETA0, msg: 'That is |S̃| = E_o²/η. The average has a ½.' }]),
      ],
      hints: [md`$\eta = \eta_0/\sqrt{\epsilon_r}$ and $v = c/\sqrt{\epsilon_r}$ with $\sqrt{12} = 2\sqrt3$. $f = \omega/2\pi = 6\times10^{14}$ Hz.`, md`Travel along $-\hat y$ means the phase is $\omega t + \beta y$. Then $\mathbf H = \frac1\eta(-\hat y)\times\mathbf E$.`],
      sol: md`
        **(i) Impedance and speed.** In a lossless nonmagnetic medium
        $$\eta = \sqrt{\frac{\mu_0}{12\epsilon_0}} = \frac{\eta_0}{\sqrt{12}} = \frac{120\pi}{2\sqrt3}$$
        $$\boxed{\eta = 20\sqrt3\,\pi \approx 109\ \Omega}$$
        and
        $$\boxed{v = \frac{c}{\sqrt{12}} = 8.66\times10^7\ \text{m/s}}$$
        **(ii) Frequency, wavelength, phase constant.** First the ordinary frequency:
        $$f = \frac{\omega_o}{2\pi} = 6\times10^{14}\ \text{Hz}$$
        In the medium, one period moves the wave one wavelength:
        $$\lambda = \frac vf = \frac{8.66\times10^7}{6\times10^{14}} = \boxed{1.44\times10^{-7}\ \text{m} = 144\ \text{nm}}$$
        $$\beta = \frac{2\pi}{\lambda} = \frac{\omega_o}{v} = \boxed{4.35\times10^7\ \text{rad/m}}$$
        As a vector, the wavevector is $\boldsymbol\beta = -4.35\times10^7\,\hat y$ rad/m (it points along the travel).

        **Visible?** Color is set by **frequency**, which does not change when light crosses into air; the wavelength does. In air this wave has $\lambda_0 = c/f = 500$ nm: **visible, green** (the blue-green end of green). The 144 nm inside the medium is not what the eye sees; comparing it with the visible band (about 400–700 nm) and answering "ultraviolet" is the trap here.

        **(iii) Fields.** Power flows along $-\hat y$, so the phase is $\omega_ot + \beta y$. $\mathbf E = \hat xE_o\cos(\omega_ot + \beta y)$. Then
        $$\mathbf H = \frac1\eta(-\hat y)\times\mathbf E$$
        and $(-\hat y)\times\hat x = \hat z$:
        $$\boxed{\mathbf H = \hat z\,\frac{E_o}{20\sqrt3\,\pi}\cos(\omega_ot + \beta y)\ \text{A/m}}$$
        Check: $\hat x\times\hat z = -\hat y$ ✓.

        **(iv) Phasors.** $\cos(\omega_ot + \beta y) \to e^{j\beta y}$:
        $$\boxed{\Et = \hat xE_oe^{j\beta y}, \quad \Ht = \hat z\frac{E_o}{\eta}e^{j\beta y}}$$
        **(v) Poynting vectors.** $\Ht^* = \hat z\frac{E_o}{\eta}e^{-j\beta y}$; the exponentials cancel:
        $$\tilde{\mathbf S} = \Et\times\Ht^* = \frac{E_o^2}{\eta}(\hat x\times\hat z) = -\hat y\,\frac{E_o^2}{\eta}$$
        $$\boxed{\langle\mathbf S\rangle = -\hat y\frac{E_o^2}{2\eta} = -4.59\times10^{-3}E_o^2\,\hat y\ \text{W/m}^2}$$
        $\tilde{\mathbf S}$ is real: a single traveling wave in a lossless medium carries no reactive power.

        **Speed path.** $\sqrt{12} = 3.46$: $\eta = 109\ \Omega$, $v = 0.866\times10^8$. $f = 6\times10^{14}$ Hz, $\lambda_0 = 500$ nm: green. $\langle S\rangle = E_o^2/2\eta$ along $-\hat y$. Taught in [Topic 4](#/l/w1-avg).
      ` }),
    P({ src: 'HW 9 #1(b)', title: 'μ = μ₀, v = c/2, H along ẑ, E along ŷ, λ = 1 µm',
      q: md`(b) The medium has $\mu = \mu_0$ and $v = c/2$. The magnetic field is linearly polarized along $\hat z$ with amplitude $H_o$, the electric field is along $\hat y$, and the wavelength in the medium is $\lambda = 1\ \mu$m. Find (i) $\eta$ and $\epsilon$; (ii) $\omega$ and the period $T$, and whether the wave is visible; (iii) $\mathbf E$ and $\mathbf H$; (iv) their phasors; (v) $\tilde{\mathbf S}$ and $\langle\mathbf S\rangle$. (The sheet does not fix the signs; take $\mathbf E$ along $+\hat y$ and $\mathbf H$ along $+\hat z$ at the same instant.)`,
      parts: [
        NT(md`(i) $\eta$`, 60 * PI, 'Ω', [{ v: 30 * PI, msg: 'η = η₀/√εr = η₀/2, not η₀/4.' }]),
        NT(md`(i) $\epsilon$`, 4 * EM.eps0, 'F/m', [{ v: 2 * EM.eps0, msg: 'εr = (c/v)² = 4, not 2.' }]),
        NT(md`(ii) $\omega$`, 3 * PI * 1e14, 'rad/s', [{ v: 1.5e14, msg: 'That is f. ω = 2πf.' }, { v: 6 * PI * 1e14, msg: 'That uses c/λ. In the medium f = v/λ = (c/2)/λ.' }]),
        NT(md`(ii) $T$`, 1 / 1.5e14, 's'),
        mc(md`(ii) Visible?`, [md`No: infrared (free-space wavelength 2 µm)`, md`Yes: red`, md`No: ultraviolet`, md`No: microwave`], 0,
          [null, md`Red ends near 700 nm; this wave has $c/f = 2\ \mu$m.`, md`Ultraviolet has shorter wavelengths than violet (below 400 nm).`, md`Microwaves are millimeters to tens of centimeters.`]),
        mc(md`(iii) the fields`, [md`$\mathbf E = \hat y\,60\pi H_o\cos(\omega t - \beta x)$, $\mathbf H = \hat zH_o\cos(\omega t - \beta x)$`, md`$\mathbf E = \hat y\,60\pi H_o\cos(\omega t + \beta x)$, $\mathbf H = \hat zH_o\cos(\omega t + \beta x)$`, md`$\mathbf E = \hat y\dfrac{H_o}{60\pi}\cos(\omega t - \beta x)$, $\mathbf H = \hat zH_o\cos(\omega t - \beta x)$`, md`$\mathbf E = \hat y\,60\pi H_o\cos(\omega t - \beta z)$, $\mathbf H = \hat zH_o\cos(\omega t - \beta z)$`], 0,
          [null, md`With $\mathbf E$ along $+\hat y$ and $\mathbf H$ along $+\hat z$ together, $\hat y\times\hat z = +\hat x$: the wave goes toward $+x$.`, md`$E = \eta H$, not $H/\eta$.`, md`A wave cannot vary along its own field direction $\hat z$; it travels along $\hat y\times\hat z = \hat x$.`]),
        NT(md`(v) $|\langle\mathbf S\rangle|$ for $H_o = 1$ A/m`, 30 * PI, 'W/m^2', [{ v: 60 * PI, msg: 'That is |S̃|. The average has a ½.' }]),
      ],
      hints: [md`$v = c/2$ with $\mu_r = 1$ means $\epsilon_r = 4$. Then $f = v/\lambda$.`, md`The travel direction is $\hat y\times\hat z = \hat x$.`],
      sol: md`
        **(i)** $v = c/\sqrt{\epsilon_r}$, so $\epsilon_r = (c/v)^2 = 4$:
        $$\boxed{\epsilon = 4\epsilon_0 = 3.54\times10^{-11}\ \text{F/m}}$$
        $$\boxed{\eta = \frac{\eta_0}{2} = 60\pi \approx 188.5\ \Omega}$$
        **(ii)** One period moves the wave one wavelength, so
        $$f = \frac v\lambda = \frac{1.5\times10^8}{10^{-6}} = 1.5\times10^{14}\ \text{Hz}$$
        $$\boxed{\omega = 2\pi f = 3\pi\times10^{14} = 9.42\times10^{14}\ \text{rad/s}}$$
        $$\boxed{T = \frac1f = 6.67\times10^{-15}\ \text{s}}$$
        In air, $\lambda_0 = c/f = 2\ \mu$m: **not visible; infrared** (short-wave IR). Even the 1 µm inside the medium is already past red.

        **(iii)** Travel is along $\hat y\times\hat z = \hat x$, so the phase is $\omega t - \beta x$, with
        $$\beta = \frac{2\pi}{\lambda} = 2\pi\times10^6\ \text{rad/m}$$
        The size of $\mathbf E$ is $\eta H_o = 60\pi H_o$:
        $$\boxed{\mathbf E = \hat y\,60\pi H_o\cos(\omega t - \beta x)\ \text{V/m}}$$
        $$\boxed{\mathbf H = \hat zH_o\cos(\omega t - \beta x)\ \text{A/m}}$$
        **(iv)** $\Et = \hat y\,60\pi H_oe^{-j\beta x}$, $\Ht = \hat zH_oe^{-j\beta x}$.

        **(v)** The exponentials cancel in $\Et\times\Ht^*$, and $\hat y\times\hat z = \hat x$:
        $$\tilde{\mathbf S} = \hat x\,60\pi H_o^2$$
        $$\boxed{\langle\mathbf S\rangle = \hat x\,30\pi H_o^2 \approx 94.2H_o^2\ \text{W/m}^2}$$
        (Had you taken $\mathbf E$ along $-\hat y$, everything would describe the same physics traveling toward $-x$.)

        **Speed path.** $c/2$ means $\epsilon_r = 4$, $\eta = 60\pi$. $f = v/\lambda = 1.5\times10^{14}$; $\lambda_0 = 2\ \mu$m: infrared. $\langle S\rangle = \eta H_o^2/2$ along $\hat y\times\hat z$. Taught in [Topic 4](#/l/w1-avg).
      ` }),
    RF(md`
      [[fig:c]]
    `, { c: fig9c }),
    P({ src: 'HW 9 #1(c)', title: 'Vacuum, right-hand circular toward +z, f = 3 GHz',
      q: md`(c) The medium has $\epsilon = \epsilon_0$ and $v = c$. The wave is right-hand circularly polarized and travels toward $+\hat z$; its electric field amplitude is $E_o$ and $f = 3$ GHz. Find (i) $\eta$ and $\mu$; (ii) $\lambda$ and $\beta$, and whether the wave is visible; (iii) $\mathbf E$ and $\mathbf H$; (iv) their phasors; (v) $\tilde{\mathbf S}$ and $\langle\mathbf S\rangle$.`,
      parts: [
        NT(md`(i) $\mu$`, EM.mu0, 'H/m'),
        NT(md`(ii) $\lambda$`, 0.1, 'm'),
        NT(md`(ii) $\beta$`, 20 * PI, 'rad/m', [{ v: 10, msg: 'That is 1/λ. β = 2π/λ.' }]),
        mc(md`(ii) Visible?`, [md`No: microwave`, md`No: infrared`, md`Yes: red`, md`No: radio below 1 MHz`], 0,
          [null, md`Infrared wavelengths are about 0.7 µm to 1 mm; 10 cm is far longer.`, md`Visible light is about $4$–$7.5\times10^{14}$ Hz, not $3\times10^9$ Hz.`, md`3 GHz is the microwave band (Wi-Fi, ovens).`]),
        mc(md`(iii) $\mathbf E =$`, [md`$E_o\left[\hat x\cos(\omega t - \beta z) + \hat y\sin(\omega t - \beta z)\right]$`, md`$E_o\left[\hat x\cos(\omega t - \beta z) - \hat y\sin(\omega t - \beta z)\right]$`, md`$E_o\left[\hat x\cos(\omega t + \beta z) + \hat y\sin(\omega t + \beta z)\right]$`, md`$\dfrac{E_o}{\sqrt2}\left[\hat x\cos(\omega t - \beta z) + \hat y\cos(\omega t - \beta z)\right]$`], 0,
          [null, md`At $z = 0$ that turns from $\hat x$ to $-\hat y$: clockwise seen from $+z$, which is left-handed for a $+z$ wave.`, md`That travels toward $-z$.`, md`Two components in step make a **linear** wave along $\hat x + \hat y$.`]),
        mc(md`(iv) $\Ht =$`, [md`$\dfrac{E_o}{\eta_0}(j\hat x + \hat y)e^{-j\beta z}$`, md`$\dfrac{E_o}{\eta_0}(\hat x - j\hat y)e^{-j\beta z}$`, md`$\dfrac{E_o}{\eta_0}(-j\hat x + \hat y)e^{-j\beta z}$`, md`$E_o\eta_0(j\hat x + \hat y)e^{-j\beta z}$`], 0,
          [null, md`That is $\Et/\eta_0$, parallel to $\mathbf E$. $\Ht = \frac1{\eta_0}\hat z\times\Et$ turns it by $90°$.`, md`$\hat z\times(-j\hat y) = +j\hat x$.`, md`Divide by $\eta_0$, do not multiply.`]),
        NT(md`(v) $|\langle\mathbf S\rangle|$ for $E_o = 1$ V/m`, 1 / ETA0, 'W/m^2', [{ v: 1 / (2 * ETA0), msg: 'That counts one component. A circular wave has two, each of amplitude E_o.' }, { v: 2 / ETA0, msg: 'That is |S̃|. ⟨S⟩ = ½Re{S̃}.' }]),
      ],
      hints: [md`Right-handed toward $+z$: at $z = 0$, $\mathbf E$ turns from $\hat x$ to $\hat y$. So $E_y$ lags $E_x$ by $90°$: $\hat x\cos + \hat y\sin$.`, md`$\sin \to -j$, so $\Et = E_o(\hat x - j\hat y)e^{-j\beta z}$.`],
      sol: md`
        **(i)** $v = 1/\sqrt{\mu\epsilon_0} = c$ forces $\mu = \mu_0$:
        $$\boxed{\mu = \mu_0 = 4\pi\times10^{-7}\ \text{H/m}, \quad \eta = \eta_0 = 120\pi\ \Omega}$$
        **(ii)**
        $$\lambda = \frac cf = \frac{3\times10^8}{3\times10^9} = \boxed{0.1\ \text{m}}$$
        $$\beta = \frac{2\pi}{\lambda} = \boxed{20\pi \approx 62.8\ \text{rad/m}}$$
        Not visible: a 10 cm wave is a **microwave**.

        **(iii) Building a right-hand circular wave.** Circular means two perpendicular components of equal size, $90°$ apart in time. Which one leads decides the hand. Try
        $$\mathbf E = E_o\left[\hat x\cos(\omega t - \beta z) + \hat y\sin(\omega t - \beta z)\right]$$
        At $z = 0$: at $t = 0$ it is $E_o\hat x$; a quarter period later it is $E_o\hat y$. It turns from $\hat x$ toward $\hat y$. Point your right thumb along $+\hat z$: your fingers curl from $\hat x$ toward $\hat y$. ✓ Right-handed. Its size is $E_o\sqrt{\cos^2 + \sin^2} = E_o$ at every instant.

        Then $\mathbf H = \frac1{\eta_0}\hat z\times\mathbf E$, with $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$:
        $$\boxed{\mathbf H = \frac{E_o}{\eta_0}\left[\hat y\cos(\omega t - \beta z) - \hat x\sin(\omega t - \beta z)\right]}$$
        **(iv) Phasors.** $\sin \to -j$:
        $$\boxed{\Et = E_o(\hat x - j\hat y)e^{-j\beta z}}$$
        $$\boxed{\Ht = \frac{E_o}{\eta_0}(j\hat x + \hat y)e^{-j\beta z}}$$
        **(v)** Conjugate $\Ht$: $\Ht^* = \frac{E_o}{\eta_0}(-j\hat x + \hat y)e^{+j\beta z}$. Multiply out, keeping only the crosses that are not zero:
        $$(\hat x - j\hat y)\times(-j\hat x + \hat y) = \hat x\times\hat y + (-j)(-j)\,\hat y\times\hat x$$
        $(-j)(-j) = -1$ and $\hat y\times\hat x = -\hat z$, so the second term is $+\hat z$:
        $$\tilde{\mathbf S} = \frac{E_o^2}{\eta_0}(\hat z + \hat z) = \hat z\frac{2E_o^2}{\eta_0}$$
        $$\boxed{\langle\mathbf S\rangle = \hat z\frac{E_o^2}{\eta_0} = 2.65\times10^{-3}E_o^2\,\hat z\ \text{W/m}^2}$$
        !!intuition Does this make sense?
          Each component alone would carry $E_o^2/2\eta_0$. A circular wave has two, so it carries twice that. HW 10 #4 comes back to exactly this.

        **Speed path.** RHCP toward $+z$: $\Et = E_o(\hat x - j\hat y)e^{-j\beta z}$. $\Ht = \frac1{\eta_0}\hat z\times\Et$. $\langle S\rangle = |\Et|^2/2\eta_0 = 2E_o^2/2\eta_0$. Taught in [Topic 9](#/l/w3-pol).
      ` }),

    // ================================================================ HW 9 Problem 2
    RF(md`
      ### Problem 2 · From radiated power back to the current

      A sheet current $\mathbf J_s = \hat xJ_{so}\sin(\omega t)$ A/m flows on the plane $z = 0$ in free space ($J_{so} > 0$). It feeds TEM waves on both sides at a total average rate of 4 W/m², so the average Poynting vector has magnitude 2 W/m² above the sheet and 2 W/m² below it. Write the waves as
      $$\mathbf E = -\hat xE_o\sin(\omega t \mp \beta z)\ \text{V/m}$$
      $$\mathbf H = \mp\hat yH_o\sin(\omega t \mp \beta z)\ \text{A/m}$$
      with $\beta = \omega/c$ (upper signs for $z > 0$, lower for $z < 0$).

      [[fig:sh]]
    `, { sh: { svg: sheet9Fig(), cap: 'The sheet edge-on: current along $\\hat x$ (drawn up), waves along $\\pm\\hat z$.' } }),
    P({ src: 'HW 9 #2(a)–(c)', title: 'Eo, Ho, Jso and the phasors',
      q: md`(a) Find $E_o$ (V/m) and $H_o$ (A/m). (b) Find $J_{so}$ (A/m). (c) Write the phasors of $\mathbf E$ and $\mathbf H$ above and below the sheet, with the numbers from (a).`,
      parts: [
        NT(md`(a) $E_o$`, Math.sqrt(480 * PI), 'V/m', [{ v: Math.sqrt(960 * PI), msg: 'That puts 4 W/m² on each side. Each side gets 2 W/m².' }, { v: Math.sqrt(240 * PI), msg: 'That drops the ½: ⟨S⟩ = E_o²/(2η₀), so E_o² = 2η₀(2).' }]),
        NT(md`(a) $H_o$`, Math.sqrt(480 * PI) / ETA0, 'A/m'),
        NT(md`(b) $J_{so}$`, 2 * Math.sqrt(480 * PI) / ETA0, 'A/m', [{ v: Math.sqrt(480 * PI) / ETA0, msg: 'That is H_o. The current is the jump in H: H_o above minus (−H_o) below, so J_so = 2H_o.' }]),
        mc(md`(c) phasors for $z > 0$`, [md`$\Et = j38.8\,\hat xe^{-j\beta z}$ V/m, $\Ht = j0.103\,\hat ye^{-j\beta z}$ A/m`, md`$\Et = -j38.8\,\hat xe^{-j\beta z}$ V/m, $\Ht = -j0.103\,\hat ye^{-j\beta z}$ A/m`, md`$\Et = -38.8\,\hat xe^{-j\beta z}$ V/m, $\Ht = -0.103\,\hat ye^{-j\beta z}$ A/m`, md`$\Et = j38.8\,\hat xe^{+j\beta z}$ V/m, $\Ht = j0.103\,\hat ye^{+j\beta z}$ A/m`], 0,
          [null, md`$\sin \to -j$, and the field is $-\sin$, so the phasor is $-(-j) = +j$.`, md`That treats the sine as a cosine.`, md`$e^{+j\beta z}$ is the wave below the sheet.`]),
      ],
      hints: [md`For a sinusoid of amplitude $E_o$, $\langle S\rangle = E_o^2/(2\eta_0)$. Set it to 2 W/m².`, md`At the sheet, $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$.`],
      sol: md`
        **(a) The amplitudes.** A plane wave of amplitude $E_o$ in free space carries on average
        $$\langle S\rangle = \frac{E_o^2}{2\eta_0}$$
        Each side carries 2 W/m²:
        $$E_o^2 = 2\eta_0(2) = 480\pi$$
        $$\boxed{E_o = \sqrt{480\pi} = 38.8\ \text{V/m}}$$
        $$\boxed{H_o = \frac{E_o}{\eta_0} = 0.103\ \text{A/m}}$$
        **(b) The current.** Section 2 of HW 8 #2 derived $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$ at the sheet. At $z = 0$ the given $\mathbf E$ is $-\hat xE_o\sin\omega t$, and $-\frac{\eta_0}{2}\mathbf J_s = -\hat x\frac{\eta_0}{2}J_{so}\sin\omega t$. Match the amplitudes:
        $$E_o = \frac{\eta_0}{2}J_{so}$$
        $$\boxed{J_{so} = \frac{2E_o}{\eta_0} = 2H_o = 0.206\ \text{A/m}}$$
        Check the power: the sheet delivers $\langle-\mathbf J_s\cdot\mathbf E\rangle = \frac12J_{so}E_o = \frac12(0.206)(38.8) = 4.0$ W/m² ✓.

        **(c) Phasors.** $\sin(\omega t - \beta z) = \cos(\omega t - \beta z - 90°) \to -je^{-j\beta z}$. Above, $\mathbf E = -\hat xE_o\sin(\cdot)$ so $\Et = -(-j)E_o\hat xe^{-j\beta z}$, and $\mathbf H = -\hat yH_o\sin(\cdot)$ similarly:
        $$\boxed{z > 0:\ \Et = j38.8\,\hat xe^{-j\beta z},\ \Ht = j0.103\,\hat ye^{-j\beta z}}$$
        Below, $\mathbf H = +\hat yH_o\sin(\omega t + \beta z)$:
        $$\boxed{z < 0:\ \Et = j38.8\,\hat xe^{j\beta z},\ \Ht = -j0.103\,\hat ye^{j\beta z}}$$
        (V/m and A/m.) Check above: $\frac1{\eta_0}\hat z\times(j38.8\hat x) = j0.103\hat y$ ✓.

        **Speed path.** $E_o = \sqrt{2\eta_0\langle S\rangle}$; $J_{so} = 2E_o/\eta_0$. Phasor of $-\sin$ is $+j$. Taught in [Topic 10](#/l/w3-antenna) and [Topic 4](#/l/w1-avg).
      ` }),

    // ================================================================ HW 9 Problem 3
    R(md`
      ### Problem 3 · Read a lossy medium off one field

      In any conducting medium the plane-wave constants obey
      $$\gamma\eta = j\omega\mu, \qquad \frac\gamma\eta = \sigma + j\omega\epsilon$$
      so that $\mu = \dfrac{\gamma\eta}{j\omega}$, $\sigma = \Re\left\{\dfrac\gamma\eta\right\}$ and $\epsilon = \dfrac1\omega\Im\left\{\dfrac\gamma\eta\right\}$ (derived in [Topic 5](#/l/w2-gamma)). A plane wave in a nonmagnetic medium ($\mu = \mu_0$) has
      $$\mathbf H = \hat x\,25e^{-z}\cos\left(8\pi\cdot10^6t - \sqrt3z - \tfrac\pi3\right)\ \text{A/m}$$
    `),
    P({ src: 'HW 9 #3(a)–(b)', title: 'γ, η, ε and σ',
      q: md`Find (a) the propagation constant $\gamma$ and the intrinsic impedance $\eta$, and (b) the permittivity $\epsilon$ and the conductivity $\sigma$.`,
      parts: [
        NT(md`(a) $\alpha = \Re\gamma$`, 1, 'Np/m'),
        NT(md`(a) $\beta = \Im\gamma$`, Math.sqrt(3), 'rad/m'),
        NT(md`(a) $|\eta|$`, 1.6 * PI * PI, 'Ω', [{ v: 3.2 * PI * PI, msg: 'That is ωμ. Divide by |γ| = 2.' }]),
        NT(md`(a) angle of $\eta$`, 30, '°', [{ v: 60, msg: 'That is the angle of γ. η = jωμ/γ has angle 90° − 60°.' }]),
        NT(md`(b) $\sigma$`, 0.10968, 'S/m', [{ v: 0.06333, msg: 'That is the imaginary part, ωε. σ is the real part of γ/η.' }]),
        NT(md`(b) $\epsilon$`, 2.5197e-9, 'F/m', [{ v: 0.06333, msg: 'That is ωε. Divide by ω = 8π × 10⁶.' }]),
      ],
      hints: [md`Match $\mathbf H$ to $H_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)$: $\alpha = 1$, $\beta = \sqrt3$, $\omega = 8\pi\times10^6$.`, md`$\gamma = 1 + j\sqrt3 = 2e^{j60°}$ and $\omega\mu_0 = 3.2\pi^2$.`],
      sol: md`
        **Step 1: read the wave.** A forward wave in a lossy medium has the form
        $$H_x = H_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)$$
        Matching term by term: $H_0 = 25$ A/m, $\alpha = 1$ Np/m, $\beta = \sqrt3$ rad/m, $\omega = 8\pi\times10^6$ rad/s, $\phi = -\pi/3$.

        **Step 2: γ in polar form.** $\gamma = \alpha + j\beta = 1 + j\sqrt3$. Its size is $\sqrt{1 + 3} = 2$ and its angle is $\tan^{-1}\sqrt3 = 60°$:
        $$\boxed{\gamma = 1 + j\sqrt3 = 2e^{j60°}\ \text{m}^{-1}}$$
        **Step 3: η from γη = jωμ.** First $\omega\mu_0$:
        $$\omega\mu_0 = (8\pi\times10^6)(4\pi\times10^{-7}) = 3.2\pi^2$$
        Then, with $j = e^{j90°}$:
        $$\eta = \frac{j\omega\mu_0}{\gamma} = \frac{3.2\pi^2e^{j90°}}{2e^{j60°}}$$
        Divide the sizes and subtract the angles:
        $$\boxed{\eta = 1.6\pi^2e^{j30°} = 15.8e^{j30°} = 13.7 + j7.90\ \Omega}$$
        The angle $30°$ is below $45°$ ✓, and the angles of $\gamma$ and $\eta$ add to $90°$ ✓.

        **Step 4: γ/η.**
        $$\frac\gamma\eta = \frac{2e^{j60°}}{1.6\pi^2e^{j30°}} = \frac{1.25}{\pi^2}e^{j30°} = 0.1267e^{j30°}$$
        Into rectangular form, with $\cos30° = 0.866$ and $\sin30° = 0.5$:
        $$\frac\gamma\eta = 0.1097 + j0.0633\ \text{S/m}$$
        **Step 5: σ and ε.** The real part is $\sigma$; the imaginary part is $\omega\epsilon$:
        $$\boxed{\sigma = 0.110\ \text{S/m}}$$
        $$\epsilon = \frac{0.0633}{8\pi\times10^6}$$
        $$\boxed{\epsilon = 2.52\times10^{-9}\ \text{F/m} \approx 285\,\epsilon_0}$$
        !!intuition Does this make sense?
          The loss tangent is $\sigma/\omega\epsilon = 0.1097/0.0633 = \sqrt3$, so $\tau = \frac12\tan^{-1}\sqrt3 = 30°$: exactly the angle of $\eta$ we found ✓.

        **Speed path.** $\gamma = 2\angle60°$; $\eta = \omega\mu\angle90°/\gamma = 1.6\pi^2\angle30°$; $\gamma/\eta = (1.25/\pi^2)\angle30°$ splits into $\sigma$ and $\omega\epsilon$. Taught in [Topic 6](#/l/w2-read).
      ` }),
    P({ src: 'HW 9 #3(c)–(d)', title: 'The phasors H̃ and Ẽ',
      q: md`(c) Write the phasor $\Ht$. (d) Find the phasor $\Et$ that goes with it.`,
      parts: [
        mc(md`(c) $\Ht =$`, [md`$\hat x\,25e^{-j\pi/3}e^{-(1 + j\sqrt3)z}$ A/m`, md`$\hat x\,25e^{j\pi/3}e^{-(1 + j\sqrt3)z}$ A/m`, md`$\hat x\,25e^{-j\pi/3}e^{-(1 - j\sqrt3)z}$ A/m`, md`$\hat x\,25e^{-j\pi/3}e^{-j\sqrt3z}$ A/m`], 0,
          [null, md`The phase in the cosine is $-\pi/3$.`, md`$e^{-\gamma z}$ with $\gamma = 1 + j\sqrt3$.`, md`The decay $e^{-z}$ stays in the phasor.`]),
        NT(md`(d) $|\Et|$ at $z = 0$`, 40 * PI * PI, 'V/m', [{ v: 25 / (1.6 * PI * PI), msg: 'That divides by η. E = ηH.' }]),
        mc(md`(d) $\Et =$`, [md`$-\hat y\,40\pi^2e^{-j\pi/6}e^{-\gamma z}$ V/m`, md`$+\hat y\,40\pi^2e^{-j\pi/6}e^{-\gamma z}$ V/m`, md`$-\hat y\,40\pi^2e^{-j\pi/2}e^{-\gamma z}$ V/m`, md`$-\hat z\,40\pi^2e^{-j\pi/6}e^{-\gamma z}$ V/m`], 0,
          [null, md`Then $\mathbf E\times\mathbf H \propto \hat y\times\hat x = -\hat z$, but the wave goes toward $+z$.`, md`Multiplying by $\eta$ **adds** its angle: $-60° + 30° = -30°$.`, md`$\mathbf E$ must be perpendicular to the travel direction $\hat z$.`]),
      ],
      hints: [md`For a $+z$ wave, $\Ht = \frac1\eta\hat z\times\Et$. With $\Ht$ along $\hat x$, $\Et$ is along $-\hat y$: $\tilde E_y = -\eta\tilde H_x$.`],
      sol: md`
        **(c)** Phase $-\pi/3 \to e^{-j\pi/3}$; the $z$ dependence is $e^{-\gamma z}$:
        $$\boxed{\Ht = \hat x\,25e^{-j\pi/3}e^{-(1 + j\sqrt3)z}\ \text{A/m}}$$
        **(d)** For a wave toward $+z$, $\Ht = \frac1\eta\hat z\times\Et$. If $\Et = \tilde E_y\hat y$, then $\hat z\times\hat y = -\hat x$ gives $\tilde H_x = -\tilde E_y/\eta$. So
        $$\tilde E_y = -\eta\tilde H_x = -(1.6\pi^2e^{j30°})(25e^{-j60°})e^{-\gamma z}$$
        Multiply sizes ($1.6\times25 = 40$) and add angles:
        $$\boxed{\Et = -\hat y\,40\pi^2e^{-j\pi/6}e^{-(1 + j\sqrt3)z}\ \text{V/m}}$$
        $40\pi^2 = 395$ V/m. In time: $\mathbf E = -\hat y\,395e^{-z}\cos(8\pi\cdot10^6t - \sqrt3z - 30°)$ V/m: it leads $\mathbf H$ by $30°$ ($\mathbf H$ lags $\mathbf E$ by the angle of $\eta$) ✓.

        **Speed path.** $\tilde E_y = -\eta\tilde H_x$: size $25\times1.6\pi^2$, angle $-60° + 30°$. Taught in [Topic 5](#/l/w2-gamma).
      ` }),
    P({ src: 'HW 9 #3(e)–(f)', title: 'Average power flow and the heat in a cube',
      q: md`(e) Find the time-averaged Poynting vector $\langle\mathbf E\times\mathbf H\rangle$. (f) Find the time-averaged power dissipated inside the cube bounded by $x = 0$, $x = 1$, $y = 0$, $y = 1$, $z = 0$, $z = 1$ (meters).`,
      parts: [
        NT(md`(e) $\langle S_z\rangle$ at $z = 0$`, 250 * Math.sqrt(3) * PI * PI, 'W/m^2', [{ v: 0.5 * 1.6 * PI * PI * 625, msg: 'That uses |η|. Only Re{η} = |η|cos30° carries average power.' }]),
        NT(md`(f) power dissipated`, 250 * Math.sqrt(3) * PI * PI * (1 - Math.exp(-2)), 'W', [{ v: 250 * Math.sqrt(3) * PI * PI * (1 - Math.exp(-1)), msg: 'Power decays as e^{−2αz}, not e^{−αz}: it is a square of the fields.' }]),
      ],
      hints: [md`$\langle\mathbf S\rangle = \frac12\Re\{\eta\}|\tilde H_x|^2\hat z$.`, md`Power in at $z = 0$ minus power out at $z = 1$ (the sides carry none).`],
      sol: md`
        **(e)** $\Et\times\Ht^* = \tilde E_y\tilde H_x^*(\hat y\times\hat x) = -\tilde E_y\tilde H_x^*\hat z$. With $-\tilde E_y = \eta\tilde H_x$:
        $$\Et\times\Ht^* = \eta|\tilde H_x|^2\hat z = \eta\,(625)e^{-2z}\hat z$$
        Half the real part, with $\Re\eta = 1.6\pi^2\cos30° = 13.7\ \Omega$:
        $$\langle\mathbf S\rangle = \tfrac12(13.7)(625)e^{-2z}\hat z$$
        $$\boxed{\langle\mathbf S\rangle = 250\sqrt3\,\pi^2e^{-2z}\hat z = 4.27\times10^3e^{-2z}\hat z\ \text{W/m}^2}$$
        **(f)** Poynting's theorem on average: what flows in and does not flow out is turned into heat. The four side faces are parallel to $\hat z$: no flux. The face at $z = 0$ (area 1 m²) lets in $4274$ W; the face at $z = 1$ m lets out $4274e^{-2} = 578$ W:
        $$P = 4274(1 - e^{-2})$$
        $$\boxed{P = 3.70\times10^3\ \text{W}}$$
        [[fig:s]]

        !!intuition Does this make sense?
          Count it from inside instead: the heating rate is $\frac12\sigma|\Et|^2 = \frac12(0.1097)(395)^2e^{-2z} = 8547e^{-2z}$ W/m³. Over the cube, $8547\cdot\frac{1 - e^{-2}}{2} = 3695$ W ✓.

        **Speed path.** $\langle S\rangle = \frac12|H|^2\Re\eta$; dissipated $= \langle S(0)\rangle(1 - e^{-2\alpha\ell})A$. Taught in [Topic 8](#/l/w2-loss).
      `,
      figs: { s: fig9s } }),

    // ================================================================ HW 9 Problem 4
    R(md`
      ### Problem 4 · The submarine

      A submarine under the ocean ($\sigma = 4$ S/m, $\epsilon_r = 81$, $\mu_r = 1$) needs to receive a signal sent by a ship on the surface at $f = \omega/2\pi = 90$ kHz.
    `),
    P({ src: 'HW 9 #4(a)–(c)', title: 'Sea water at 90 kHz',
      q: md`(a) Compute $\gamma = \alpha + j\beta$ and $\eta$, using the approximation that suits the loss tangent $\sigma/\omega\epsilon$. (b) How deep can the submarine be and still receive at least 1% of the amplitude at the surface? (c) What is the wavelength $\lambda = 2\pi/\beta = v_p/f$?`,
      parts: [
        NT(md`(a) $\sigma/\omega\epsilon$`, 9876.5, ''),
        NT(md`(a) $\alpha = \beta$`, 1.19215, 'm^-1', [{ v: 1.6859, msg: 'That is √(ωμσ). The good-conductor formula is √(ωμσ/2) = √(πfμσ).' }]),
        NT(md`(a) $\Re\eta = \Im\eta$`, 0.29804, 'Ω'),
        NT(md`(b) depth`, Math.log(100) / 1.19215, 'm', [{ v: 1 / 1.19215, msg: 'That is the skin depth (1/e = 37%). For 1% you need ln 100 = 4.6 skin depths.' }]),
        NT(md`(c) $\lambda$`, 2 * PI / 1.19215, 'm', [{ v: 3333.3, msg: 'That is the free-space wavelength c/f. In sea water λ = 2π/β.' }]),
      ],
      hints: [md`$\omega\epsilon = 2\pi(9\times10^4)(81)\frac{10^{-9}}{36\pi} = 4.05\times10^{-4}$ S/m, so the loss tangent is about $10^4$: a good conductor.`, md`Good conductor: $\alpha = \beta = \sqrt{\pi f\mu\sigma}$ and $\eta = (1 + j)\sqrt{\pi f\mu/\sigma} = (1 + j)\alpha/\sigma$.`],
      sol: md`
        **Step 1: which limit.** The displacement term:
        $$\omega\epsilon = 2\pi(9\times10^4)(81)\frac{10^{-9}}{36\pi} = 4.05\times10^{-4}\ \text{S/m}$$
        $$\frac{\sigma}{\omega\epsilon} = \frac{4}{4.05\times10^{-4}} = 9.88\times10^3 \gg 1$$
        Sea water is a **good conductor** here.

        **Step 2: the good-conductor γ.** $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$. Drop the tiny $j\omega\epsilon$:
        $$\gamma^2 \approx j\omega\mu\sigma$$
        $\sqrt j = e^{j45°} = \frac{1 + j}{\sqrt2}$, so
        $$\gamma = (1 + j)\sqrt{\frac{\omega\mu\sigma}{2}} = (1 + j)\sqrt{\pi f\mu\sigma}$$
        Numbers: $\pi f\mu\sigma = \pi(9\times10^4)(4\pi\times10^{-7})(4) = 0.144\pi^2$, whose root is $0.379\pi$:
        $$\boxed{\alpha = \beta = 1.19\ \text{m}^{-1}}$$
        **Step 3: η.** $\eta = j\omega\mu/\gamma \approx \sqrt{j\omega\mu/\sigma} = (1 + j)\sqrt{\pi f\mu/\sigma}$, which is $(1 + j)\alpha/\sigma$:
        $$\boxed{\eta = (1 + j)\,0.298\ \Omega = 0.421e^{j45°}\ \Omega}$$
        **Step 4: (b) depth for 1%.** The amplitude falls as $e^{-\alpha d}$:
        $$e^{-\alpha d} = 0.01 \quad\Rightarrow\quad d = \frac{\ln100}{\alpha} = \frac{4.605}{1.19}$$
        $$\boxed{d = 3.86\ \text{m}}$$
        **Step 5: (c) wavelength.**
        $$\boxed{\lambda = \frac{2\pi}{\beta} = 5.27\ \text{m}}$$
        In air the same signal has $\lambda_0 = c/f = 3.3$ km. The water squeezes it by a factor of 600 and kills it within a couple of wavelengths.

        **Speed path.** Loss tangent $\approx 10^4$: $\alpha = \beta = \sqrt{\pi f\mu\sigma}$; $d = 4.6/\alpha$; $\lambda = 2\pi/\alpha$; $\eta = (1 + j)\alpha/\sigma$. Taught in [Topic 7](#/l/w2-limits).
      ` }),
    P({ src: 'HW 9 #4(d)', title: 'The same at 900 Hz',
      q: md`(d) Repeat (a)–(c) for a transmission at 900 Hz.`,
      parts: [
        NT(md`$\alpha = \beta$`, 0.119215, 'm^-1', [{ v: 0.0119215, msg: 'α goes as √f: 100 times lower f gives 10 times lower α, not 100.' }]),
        NT(md`$\Re\eta$`, 0.029804, 'Ω'),
        NT(md`depth for 1%`, Math.log(100) / 0.119215, 'm'),
        NT(md`$\lambda$`, 2 * PI / 0.119215, 'm'),
      ],
      hints: [md`Every good-conductor quantity here goes as $\sqrt f$. The frequency dropped by 100.`],
      sol: md`
        The loss tangent grows by 100 (to $9.88\times10^5$), so the good-conductor formulas fit even better. $\alpha = \sqrt{\pi f\mu\sigma}$ goes as $\sqrt f$; $f$ fell by 100, so $\alpha$ falls by 10:
        $$\boxed{\alpha = \beta = 0.119\ \text{m}^{-1}}$$
        $$\boxed{\eta = (1 + j)\,0.0298\ \Omega}$$
        $$\boxed{d = \frac{4.605}{0.119} = 38.6\ \text{m}}$$
        $$\boxed{\lambda = 52.7\ \text{m}}$$
        [[fig:d]]

        Ten times deeper reach for a hundred times lower frequency. That is why real submarine links use very low frequencies, and why they carry so little data.

        **Speed path.** Divide $\alpha$, $\beta$, $\eta$ by $\sqrt{100} = 10$; multiply $d$ and $\lambda$ by 10. Taught in [Topic 7](#/l/w2-limits).
      `,
      figs: { d: fig9d } }),

    // ================================================================ HW 9 Problem 5
    RF(md`
      ### Problem 5 · A sheet inside a dielectric

      An infinite current sheet $\mathbf J_s(t) = 2\cos(6\pi\times10^8t)\,\hat y$ A/m lies in the plane $x = 2$ m, inside a perfect dielectric with $\epsilon = \frac94\epsilon_0$ and $\mu = \mu_0$. It launches TEM waves away from itself on both sides.

      [[fig:sh]]
    `, { sh: { svg: sheet9bFig(), cap: 'The sheet at $x = 2$ m, current along $\\hat y$; the whole space is the dielectric.' } }),
    P({ src: 'HW 9 #5(a)–(c)', title: 'v, β, λ and η',
      q: md`(a) Give the size and direction of the propagation velocity $\mathbf v_p$. (b) Find the wavenumber $\beta$ and wavelength $\lambda$. (c) Find the intrinsic impedance $\eta$.`,
      parts: [
        NT(md`(a) $|\mathbf v_p|$`, 2e8, 'm/s', [{ v: C0 / 2.25, msg: 'v = c/√εr = c/1.5, not c/εr.' }]),
        mc(md`(a) direction`, [md`$+\hat x$ for $x > 2$ m and $-\hat x$ for $x < 2$ m`, md`$+\hat x$ everywhere`, md`$\pm\hat y$, along the current`, md`$+\hat z$`], 0,
          [null, md`A sheet radiates away from itself on both sides.`, md`Waves travel perpendicular to the sheet, not along its current.`, md`The sheet is the plane $x = 2$; its normal is $\hat x$.`]),
        NT(md`(b) $\beta$`, 3 * PI, 'rad/m'),
        NT(md`(b) $\lambda$`, 2 / 3, 'm', [{ v: 1, msg: 'That is the free-space wavelength.' }]),
        NT(md`(c) $\eta$`, 80 * PI, 'Ω', [{ v: ETA0 / 2.25, msg: 'η = η₀/√εr = η₀/1.5.' }]),
      ],
      hints: [md`$\sqrt{9/4} = 3/2$. So $v = c/1.5$ and $\eta = \eta_0/1.5$.`],
      sol: md`
        **(a)** $v_p = \frac{1}{\sqrt{\mu_0\cdot\frac94\epsilon_0}} = \frac{c}{3/2}$:
        $$\boxed{v_p = 2\times10^8\ \text{m/s}, \text{ along } +\hat x \text{ for } x > 2, \ -\hat x \text{ for } x < 2}$$
        **(b)** $\omega = 6\pi\times10^8$ rad/s ($f = 300$ MHz):
        $$\beta = \frac{\omega}{v_p} = \frac{6\pi\times10^8}{2\times10^8} = \boxed{3\pi \approx 9.42\ \text{rad/m}}$$
        $$\lambda = \frac{2\pi}{\beta} = \boxed{\tfrac23\ \text{m}}$$
        **(c)**
        $$\eta = \frac{\eta_0}{3/2} = \boxed{80\pi \approx 251\ \Omega}$$
        **Speed path.** Everything scales by $\sqrt{\epsilon_r} = 1.5$. Taught in [what you need from Exam 2](#/l/e3-refresh).
      ` }),
    P({ src: 'HW 9 #5(d)', title: 'The fields on both sides',
      q: md`(d) Write $\mathbf E$, $\Et$, $\mathbf H$ and $\Ht$ in terms of $\omega$, $\beta$ and $\eta$, for $x > 2$ and for $x < 2$.`,
      parts: [
        NT(md`Amplitude of $\mathbf E$`, 80 * PI, 'V/m', [{ v: 40 * PI, msg: 'That is (η/2)(1 A/m). The current amplitude is 2 A/m.' }, { v: 160 * PI, msg: 'That is η|J_s| with no ½: the jump in H is shared by two waves.' }]),
        mc(md`For $x > 2$`, [md`$\mathbf E = -\hat y\,\eta\cos(\omega t - \beta(x - 2))$, $\mathbf H = -\hat z\cos(\omega t - \beta(x - 2))$`, md`$\mathbf E = +\hat y\,\eta\cos(\omega t - \beta(x - 2))$, $\mathbf H = +\hat z\cos(\omega t - \beta(x - 2))$`, md`$\mathbf E = -\hat y\,\eta\cos(\omega t - \beta x)$, $\mathbf H = -\hat z\cos(\omega t - \beta x)$`, md`$\mathbf E = -\hat y\,\eta\cos(\omega t - \beta(x - 2))$, $\mathbf H = +\hat z\cos(\omega t - \beta(x - 2))$`], 0,
          [null, md`$\mathbf E$ at a sheet points against the current: $-\frac\eta2\mathbf J_s$.`, md`The distance is measured from the sheet at $x = 2$. Without the $-2$ the phase at the sheet would be wrong.`, md`Then $\mathbf E\times\mathbf H \propto -\hat y\times\hat z = -\hat x$, toward the sheet.`]),
        mc(md`For $x < 2$, $\mathbf H =$`, [md`$+\hat z\cos(\omega t + \beta(x - 2))$ A/m`, md`$-\hat z\cos(\omega t + \beta(x - 2))$ A/m`, md`$+\hat z\cos(\omega t - \beta(x - 2))$ A/m`, md`$+\hat y\cos(\omega t + \beta(x - 2))$ A/m`], 0,
          [null, md`That copies $x > 2$. The left-going wave needs the opposite $\mathbf H$ for the same $\mathbf E$.`, md`For $x < 2$ the wave goes toward $-x$: $\omega t + \beta(x - 2)$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ ($\hat y$).`]),
      ],
      hints: [md`At the sheet $\mathbf E = -\frac\eta2\mathbf J_s$ (same derivation as HW 8 #2, with the medium's $\eta$).`],
      sol: md`
        **Step 1: the field at the sheet.** The derivation of HW 8 #2 holds in any lossless medium with $\eta_0$ replaced by $\eta$: tangential $\mathbf E$ is continuous and $\hat x\times(\mathbf H_{2^+} - \mathbf H_{2^-}) = \mathbf J_s$ give
        $$\mathbf E(2, t) = -\frac\eta2\mathbf J_s(t) = -\hat y\,\frac\eta2(2)\cos\omega t = -\hat y\,\eta\cos\omega t$$
        (here $\eta$ multiplies 1 A/m, giving $80\pi = 251$ V/m).

        **Step 2: x > 2.** The wave moves toward $+x$ from $x = 2$; the delay is $\beta(x - 2)$:
        $$\boxed{\mathbf E = -\hat y\,\eta\cos(\omega t - \beta(x - 2)),\ \Et = -\hat y\,\eta e^{-j\beta(x - 2)}}$$
        $\mathbf H = \frac1\eta\hat x\times\mathbf E$ with $\hat x\times(-\hat y) = -\hat z$:
        $$\boxed{\mathbf H = -\hat z\cos(\omega t - \beta(x - 2)),\ \Ht = -\hat ze^{-j\beta(x - 2)}}$$
        **Step 3: x < 2.** Toward $-x$, and $(-\hat x)\times(-\hat y) = \hat z$:
        $$\boxed{\mathbf E = -\hat y\,\eta\cos(\omega t + \beta(x - 2)),\ \Et = -\hat y\,\eta e^{j\beta(x - 2)}}$$
        $$\boxed{\mathbf H = +\hat z\cos(\omega t + \beta(x - 2)),\ \Ht = \hat ze^{j\beta(x - 2)}}$$
        (V/m and A/m, with $\omega = 6\pi\times10^8$, $\beta = 3\pi$, $\eta = 80\pi$.)

        !!intuition Does this make sense?
          The jump: $\hat x\times(-\hat z - \hat z)\cos\omega t = \hat x\times(-2\hat z)\cos\omega t = 2\hat y\cos\omega t = \mathbf J_s$ ✓, since $\hat x\times\hat z = -\hat y$.

        **Speed path.** $\mathbf E = -\frac\eta2\mathbf J_s(t - |x - 2|/v)$; $|\mathbf H| = |\mathbf J_s|/2 = 1$ A/m, sign from $\hat k\times\mathbf E$. Taught in [Topic 10](#/l/w3-antenna).
      ` }),
    P({ src: 'HW 9 #5(e)', title: "Poynting's theorem for x > 2",
      q: md`(e) Show that the wave satisfies Poynting's theorem $\nabla\cdot(\mathbf E\times\mathbf H) + \dfrac{\partial}{\partial t}\left(\tfrac12\epsilon\mathbf E\cdot\mathbf E + \tfrac12\mu\mathbf H\cdot\mathbf H\right) + \mathbf J\cdot\mathbf E = 0$ in the region $x > 2$. Do it for any frequency and any perfect dielectric, using $\mu$ and $\epsilon$ instead of the numbers of (a)–(c).`,
      parts: [mc(md`The divergence term and the energy term cancel because`, [md`$\beta/\eta = \omega\epsilon$`, md`$\beta\eta = \omega\epsilon$`, md`$\mathbf J\cdot\mathbf E$ cancels both`, md`$\beta = \omega/\eta$`], 0,
        [null, md`$\beta\eta = \omega\sqrt{\mu\epsilon}\sqrt{\mu/\epsilon} = \omega\mu$, not $\omega\epsilon$.`, md`There is no current in $x > 2$, so $\mathbf J\cdot\mathbf E = 0$.`, md`Units: $\beta$ is 1/m, $\omega/\eta$ is not.`])],
      hints: [md`Write $\mathbf E = -\hat yE_0\cos\psi$ and $\mathbf H = -\hat z\frac{E_0}{\eta}\cos\psi$ with $\psi = \omega t - \beta(x - 2)$.`, md`$\mu/\eta^2 = \epsilon$, so the energy density is $\epsilon E_0^2\cos^2\psi$.`],
      sol: md`
        **Step 1: the fields in general.** Let $\psi = \omega t - \beta(x - 2)$ and $E_0$ the amplitude:
        $$\mathbf E = -\hat yE_0\cos\psi, \qquad \mathbf H = -\hat z\frac{E_0}{\eta}\cos\psi$$
        **Step 2: the flux term.** $(-\hat y)\times(-\hat z) = \hat x$:
        $$\mathbf E\times\mathbf H = \hat x\,\frac{E_0^2}{\eta}\cos^2\psi$$
        Only $x$ varies. The chain rule with $\partial\psi/\partial x = -\beta$:
        $$\nabla\cdot(\mathbf E\times\mathbf H) = \frac{E_0^2}{\eta}\cdot2\cos\psi(-\sin\psi)(-\beta)$$
        $$\nabla\cdot(\mathbf E\times\mathbf H) = \frac{\beta E_0^2}{\eta}\sin2\psi$$
        **Step 3: the energy term.** $\frac12\mu H^2 = \frac12\frac{\mu}{\eta^2}E_0^2\cos^2\psi$, and $\mu/\eta^2 = \mu\cdot\frac\epsilon\mu = \epsilon$. So electric and magnetic energies are equal:
        $$w = \tfrac12\epsilon E_0^2\cos^2\psi + \tfrac12\epsilon E_0^2\cos^2\psi = \epsilon E_0^2\cos^2\psi$$
        With $\partial\psi/\partial t = \omega$:
        $$\frac{\partial w}{\partial t} = -\omega\epsilon E_0^2\sin2\psi$$
        **Step 4: the current term.** For $x > 2$ there is no current and $\sigma = 0$: $\mathbf J\cdot\mathbf E = 0$.

        **Step 5: add.**
        $$\left(\frac\beta\eta - \omega\epsilon\right)E_0^2\sin2\psi$$
        And $\frac\beta\eta = \frac{\omega\sqrt{\mu\epsilon}}{\sqrt{\mu/\epsilon}} = \omega\epsilon$, so the bracket is zero:
        $$\boxed{\nabla\cdot\mathbf S + \frac{\partial w}{\partial t} + \mathbf J\cdot\mathbf E = 0\ \checkmark}$$
        In words: wherever the energy density is falling, exactly that much power is flowing out of the point, and the other way round.

        **Speed path.** $\nabla\cdot\mathbf S = (\beta/\eta)E_0^2\sin2\psi$, $\partial_tw = -\omega\epsilon E_0^2\sin2\psi$, and $\beta/\eta = \omega\epsilon$. Taught in [Topic 3](#/l/w1-poynting).
      ` }),
    P({ src: 'HW 9 #5(f)–(g)', title: 'Power through 2 m², and the balance at the sheet',
      q: md`(f) Find the time-averaged power carried across a 2 m² square on the plane $x = 4$ m. (g) Show that the time-averaged Poynting theorem holds at $x = 2$, the location of the sheet.`,
      parts: [
        NT(md`(f) $\langle P\rangle$`, 80 * PI, 'W', [{ v: 40 * PI, msg: 'That is the power density 40π W/m². Multiply by 2 m².' }, { v: 160 * PI, msg: 'That drops the ½ in E₀²/(2η).' }]),
        NT(md`(g) power per area supplied by the sheet`, 80 * PI, 'W/m^2', [{ v: 40 * PI, msg: 'That is one side. The sheet feeds both waves.' }]),
      ],
      hints: [md`$\langle S\rangle = E_0^2/(2\eta)$ with $E_0 = \eta(1\ \text{A/m})$. A lossless medium: the same at $x = 4$ as anywhere.`, md`At the sheet, $\langle-\mathbf J_s\cdot\mathbf E\rangle = \frac12\Re\{-\tilde{\mathbf J}_s\cdot\Et^*\}$.`],
      sol: md`
        **(f)** With $E_0 = 80\pi$ V/m:
        $$\langle S\rangle = \frac{E_0^2}{2\eta} = \frac{(80\pi)^2}{160\pi} = 40\pi\ \text{W/m}^2$$
        No loss, so it is the same at $x = 4$ m. Over 2 m²:
        $$\boxed{\langle P\rangle = 80\pi \approx 251\ \text{W}}$$
        **(g)** The sheet's phasor is $\tilde{\mathbf J}_s = 2\hat y$ and the field there is $\Et(2) = -80\pi\hat y$. The average power it gives to the field per unit area:
        $$\tfrac12\Re\{-\tilde{\mathbf J}_s\cdot\Et^*\} = \tfrac12(-2)(-80\pi)$$
        $$\boxed{= 80\pi\ \text{W/m}^2}$$
        Around a thin box enclosing the sheet, the average power leaving is $40\pi$ through the right face plus $40\pi$ through the left face $= 80\pi$ W/m². Supplied = carried away ✓: the time-averaged Poynting theorem $\oint\langle\mathbf S\rangle\cdot d\mathbf A = -\int\langle\mathbf J\cdot\mathbf E\rangle dV$ holds (the stored energy averages to a constant).

        **Speed path.** $\langle S\rangle = \eta|J_s|^2/8$ per side $= 40\pi$; the sheet supplies twice that. Taught in [Topic 4](#/l/w1-avg).
      ` }),
  ];
  EM.lesson('e3-hw', { id: 'e3-hw9', order: 9, kind: 'hw', title: 'Homework 9', sub: 'Three waves from specs, a sheet from its power, a lossy wave read backwards, the submarine, Poynting at a sheet', steps: hw9 });

  // ================================================================ HOMEWORK 10
  function twoSheetFig() {
    const g = PF.fig({ alt: 'Two current sheets in free space seen edge-on: one at x = 0 carrying J1 cos(wt - phi) along +z (out of the page), one at x = lambda/4 carrying J2 cos(wt) along +y (up). The region x > lambda/4 is to the right. Axes: x right, y up, z out of the page.' });
    const x1 = 150, x2 = 250, yT = 26, yB = 176;
    g.sheet(x1, yT, yB); g.sheet(x2, yT, yB);
    g.odot(x1 + 14, 80, 7); g.label(x1 + 26, 80, 'J_1\\cos(\\omega t - \\phi)\\,\\hat z', 'l', 'small');
    g.arrow(x2 + 12, 150, x2 + 12, 110, { cls: 'thick', hs: 8 }); g.label(x2 + 18, 124, 'J_2\\cos\\omega t\\,\\hat y', 'l', 'small');
    g.label(x1, yB + 16, 'x = 0', 't', 'small'); g.label(x2, yB + 16, 'x = \\lambda/4', 't', 'small');
    g.arrow(x2 + 40, 196, x2 + 130, 196, { hs: 7 }); g.label(x2 + 85, 202, '\\text{region } x > \\lambda/4', 't', 'small');
    triad(g, 40, 70, 'x', 'y', 'z');
    return g.svg();
  }
  const fig10s = { svg: PF.plot({ w: 360, h: 210, x: [0, 30], y: [-62, 4], zero: true, xl: 'd\\,(\\text{m})', yl: '\\text{amplitude (dB)}',
    xt: [[12.29, '12.3']], yt: [[-60, '-60']], hlines: [[-60, '0.1\\%']], curves: [{ f: (d) => -8.686 * 0.56199 * d }] }),
    cap: 'At 20 kHz the amplitude falls $8.69\\alpha = 4.88$ dB per meter; 0.1% is $-60$ dB, reached at 12.3 m.' };

  const hw10 = [
    R(md`
      **Homework 10** · due Thursday, November 5, 2026 · reading: Kudeki, Lectures 24–27 (good conductors and skin depth, circular and elliptical polarization, current-sheet antennas, the start of reflection).

      **What it drills.** Problem 1 reads a nearly lossless wave and finds its $f$, $\lambda$, $\epsilon_r$, $\sigma$, decay length and $\Ht$. Problem 2 puts sea water at three frequencies, where the right approximation changes. Problem 3 classifies the polarization of five waves. Problem 4 builds circular and linear polarization out of two sheets a quarter wavelength apart, and compares their powers.

      **Read these first.** [Topic 6: reading a lossy wave](#/l/w2-read), [Topic 7: dielectric and conductor limits](#/l/w2-limits), [Topic 9: polarization and handedness](#/l/w3-pol) and [Topic 10: current-sheet antennas](#/l/w3-antenna).

      Problems restated in our own words, numbers as assigned; every answer checked in Python. Problem 5 (an AI-literacy activity built on Problem 4(a)(i)) is not physics and is omitted, but its physics, the conditions for linear, circular, right and left polarization, is exactly what Problem 4 below works through.

      !!key Polarization in three questions
        Write $\Et = \hat aA\,e^{j\phi_a} + \hat bB\,e^{j\phi_b}$ (two perpendicular components).
        - **Linear** if the components are in step or opposite: $\phi_b - \phi_a = 0$ or $180°$ (any sizes).
        - **Circular** if $A = B$ **and** $\phi_b - \phi_a = \pm90°$.
        - Otherwise **elliptical**.
        - **Hand:** see which component peaks first; $\mathbf E$ turns from that one toward the other. Point your right thumb along the travel: if the fingers curl the same way, right-handed.
    `),

    // ---------------------------------------------------------------- Problem 1
    R(md`
      ### Problem 1 · A wave with a little loss

      A plane TEM wave in a material has the phasor $\Et = 4e^{-(0.0001 + j0.2)z}\,\hat x$ V/m. So $\gamma = \alpha + j\beta = 0.0001 + j0.2$ m⁻¹, with $\alpha \ll \beta$. When $\alpha \ll \beta$, $\eta$, $\beta$, $v_p$ and $\lambda$ have their perfect-dielectric forms in terms of $\mu$, $\epsilon$, $\omega$ and $f$; only $\alpha$ is new, and it equals $\frac\sigma2\sqrt{\mu/\epsilon}$. The medium has $\mu = 4\mu_0$ and $v_p = 10^8$ m/s.
    `),
    P({ src: 'HW 10 #1(a)–(c)', title: 'f, λ and εr',
      q: md`Find (a) the frequency $f$ in Hz, (b) the wavelength $\lambda$, (c) the dielectric constant $\epsilon_r = \epsilon/\epsilon_0$.`,
      parts: [
        NT(md`(a) $f$`, 2e7 / (2 * PI), 'Hz', [{ v: 2e7, msg: 'That is ω = βv_p. Divide by 2π.' }]),
        NT(md`(b) $\lambda$`, 10 * PI, 'm', [{ v: 5, msg: 'That is 1/β. λ = 2π/β.' }]),
        NT(md`(c) $\epsilon_r$`, 2.25, '', [{ v: 9, msg: 'That is μr εr. Divide by μr = 4.' }]),
      ],
      hints: [md`$v_p = \omega/\beta$, so $\omega = \beta v_p$.`, md`$v_p = c/\sqrt{\mu_r\epsilon_r}$: $\mu_r\epsilon_r = (c/v_p)^2 = 9$.`],
      sol: md`
        **(a)** $v_p = \omega/\beta$, so
        $$\omega = \beta v_p = (0.2)(10^8) = 2\times10^7\ \text{rad/s}$$
        $$\boxed{f = \frac{\omega}{2\pi} = 3.18\times10^6\ \text{Hz}}$$
        **(b)**
        $$\boxed{\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{0.2} = 10\pi \approx 31.4\ \text{m}}$$
        **(c)** $v_p = c/\sqrt{\mu_r\epsilon_r}$:
        $$\mu_r\epsilon_r = \left(\frac{3\times10^8}{10^8}\right)^2 = 9$$
        $$\boxed{\epsilon_r = \frac94 = 2.25}$$
        **Speed path.** $\omega = \beta v_p$; $(c/v_p)^2/\mu_r$. Taught in [Topic 7](#/l/w2-limits).
      ` }),
    P({ src: 'HW 10 #1(d)–(f)', title: 'σ, the 1/e distance and H̃',
      q: md`Find (d) the conductivity $\sigma$, (e) the distance $z$ at which the peak electric field is $1/e$ of its value at $z = 0$, (f) the phasor $\Ht(z)$.`,
      parts: [
        NT(md`(d) $\sigma$`, 3.9789e-7, 'S/m', [{ v: 1.9894e-7, msg: 'α = (σ/2)η, so σ = 2α/η: the 2 is missing.' }, { v: 2e-4 / ETA0, msg: 'That uses η₀. Here η = η₀√(μr/εr) = 160π Ω.' }]),
        NT(md`(e) $z$`, 1e4, 'm', [{ v: 5e3, msg: 'That is the 1/e distance of the power. The field falls as e^{−αz}: z = 1/α.' }]),
        NT(md`(f) $|\Ht|$ at $z = 0$`, 4 / (160 * PI), 'A/m', [{ v: 4 / ETA0, msg: 'That uses η₀.' }]),
        mc(md`(f) direction of $\Ht$`, [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat z$`, md`$+\hat x$`], 0,
          [null, md`$\hat z\times\hat x = +\hat y$ for a wave toward $+z$.`, md`$\hat z$ is the travel direction.`, md`$\mathbf H$ is perpendicular to $\mathbf E$.`]),
      ],
      hints: [md`$\eta = \eta_0\sqrt{\mu_r/\epsilon_r} = 120\pi\cdot\frac{2}{1.5} = 160\pi\ \Omega$.`],
      sol: md`
        **(d)** In the low-loss limit $\eta$ keeps its lossless value:
        $$\eta = \eta_0\sqrt{\frac{\mu_r}{\epsilon_r}} = 120\pi\sqrt{\frac{4}{9/4}} = 120\pi\cdot\frac43 = 160\pi\ \Omega$$
        Then $\alpha = \frac\sigma2\eta$ gives
        $$\sigma = \frac{2\alpha}{\eta} = \frac{2\times10^{-4}}{160\pi}$$
        $$\boxed{\sigma = 3.98\times10^{-7}\ \text{S/m}}$$
        Check the assumption: $\omega\epsilon = (2\times10^7)(2.25)\frac{10^{-9}}{36\pi} = 3.98\times10^{-4}$, so $\sigma/\omega\epsilon = 10^{-3} \ll 1$ ✓ (and $\alpha/\beta = 5\times10^{-4}$, half of it, as the low-loss formulas say).

        **(e)** The amplitude is $4e^{-\alpha z}$; it is $4/e$ when $\alpha z = 1$:
        $$\boxed{z = \frac1\alpha = 10^4\ \text{m} = 10\ \text{km}}$$
        **(f)** $\Ht = \frac1\eta\hat z\times\Et$ and $\hat z\times\hat x = \hat y$:
        $$\boxed{\Ht = \hat y\frac{4}{160\pi}e^{-(0.0001 + j0.2)z} = 7.96\times10^{-3}\,\hat ye^{-\gamma z}\ \text{A/m}}$$
        (Strictly $\eta$ has a tiny angle $\tau = \frac12\tan^{-1}10^{-3} = 0.03°$; at this accuracy it is real.)

        **Speed path.** $\eta = 160\pi$; $\sigma = 2\alpha/\eta$; $1/\alpha = 10$ km. Taught in [Topic 7](#/l/w2-limits).
      ` }),

    // ---------------------------------------------------------------- Problem 2
    R(md`
      ### Problem 2 · Sea water at three frequencies

      Plane TEM waves in sea water: $\mu = \mu_0$, $\epsilon = 81\epsilon_0$, $\sigma = 4$ S/m. In each case find $\gamma = \alpha + j\beta$, $\lambda = 2\pi/\beta$, the penetration depth $\delta = 1/\alpha$, and $\eta$, using the approximation that suits $\sigma/\omega\epsilon$ (and none when none suits).
    `),
    P({ src: 'HW 10 #2(a)', title: 'f = 1 kHz',
      q: md`(a) $f = \omega/2\pi = 10^3$ Hz.`,
      parts: [
        NT(md`$\alpha = \beta$`, 0.04 * PI, 'm^-1'),
        NT(md`$\lambda$`, 50, 'm'),
        NT(md`$\delta$`, 25 / PI, 'm'),
        NT(md`$|\eta|$`, 0.04443, 'Ω', [{ v: 0.031416, msg: 'That is the real part. |η| = √2 × 0.0314.' }]),
      ],
      hints: [md`$\omega\epsilon = 2\pi(10^3)(81)\frac{10^{-9}}{36\pi} = 4.5\times10^{-6}$, so the loss tangent is $8.9\times10^5$: good conductor.`],
      sol: md`
        **Step 1: the loss tangent.**
        $$\omega\epsilon = 2\pi(10^3)(81)\frac{10^{-9}}{36\pi} = 4.5\times10^{-6}\ \text{S/m}$$
        $$\frac\sigma{\omega\epsilon} = \frac{4}{4.5\times10^{-6}} = 8.9\times10^5 \gg 1$$
        Good conductor (derivation in HW 9 #4 and [Topic 7](#/l/w2-limits)): $\alpha = \beta = \sqrt{\pi f\mu\sigma}$.

        **Step 2: γ.** $\pi f\mu\sigma = \pi(10^3)(4\pi\times10^{-7})(4) = 16\pi^2\times10^{-4}$, whose root is $0.04\pi$:
        $$\boxed{\gamma = 0.04\pi(1 + j) = 0.126(1 + j)\ \text{m}^{-1}}$$
        **Step 3: λ and δ.**
        $$\boxed{\lambda = \frac{2\pi}{0.04\pi} = 50\ \text{m}}$$
        $$\boxed{\delta = \frac{1}{0.04\pi} = 7.96\ \text{m}}$$
        **Step 4: η.** $\eta = (1 + j)\alpha/\sigma$:
        $$\boxed{\eta = (1 + j)\,0.0314 = 0.0444e^{j45°}\ \Omega}$$
        **Speed path.** Loss tangent huge: $\alpha = \beta = \sqrt{\pi f\mu\sigma} = 0.04\pi$, $\lambda = 2\pi\delta$, $\eta = (1 + j)/(\sigma\delta)$.
      ` }),
    P({ src: 'HW 10 #2(b)', title: 'f = 1 GHz: no approximation works',
      q: md`(b) Repeat (a) for $f = 10^9$ Hz.`,
      parts: [
        NT(md`$\sigma/\omega\epsilon$`, 8 / 9, ''),
        NT(md`$\alpha$`, 77.48, 'Np/m', [{ v: 40 * PI, msg: 'That is the good-conductor formula. The loss tangent is 0.89, nowhere near ≫ 1.' }, { v: 83.78, msg: 'That is the low-loss formula (σ/2)√(μ/ε). The loss tangent 0.89 is not ≪ 1.' }]),
        NT(md`$\beta$`, 203.8, 'rad/m', [{ v: 60 * PI, msg: 'That is the lossless ω√(με). Loss raises β by the factor 1.08.' }]),
        NT(md`$|\eta|$`, 36.21, 'Ω', [{ v: 120 * PI / 9, msg: 'That is the lossless η₀/9. Divide by [1 + (σ/ωε)²]^{1/4}.' }]),
        NT(md`angle of $\eta$`, 20.82, '°', [{ v: 41.63, msg: 'That is tan⁻¹(σ/ωε). τ is half of it.' }]),
      ],
      hints: [md`$\omega\epsilon = 2\pi(10^9)(81)\frac{10^{-9}}{36\pi} = 4.5$ S/m, so $\sigma/\omega\epsilon = 0.889$: neither $\ll1$ nor $\gg1$. Use the exact polar method.`, md`$1 - j0.889 = 1.338e^{-j41.6°}$; its root is $1.157e^{-j20.8°}$. The lossless numbers: $\omega\sqrt{\mu\epsilon} = 60\pi$, $\eta_0/9 = 41.9\ \Omega$.`],
      sol: md`
        **Step 1: the loss tangent.**
        $$\omega\epsilon = 2\pi(10^9)(81)\frac{10^{-9}}{36\pi} = 4.5\ \text{S/m}, \qquad \frac\sigma{\omega\epsilon} = 0.889$$
        Close to 1: no approximation applies. Use the exact formulas $\gamma = jk\sqrt{1 - j\sigma/\omega\epsilon}$ and $\eta = \eta_i/\sqrt{1 - j\sigma/\omega\epsilon}$ ([Topic 5](#/l/w2-gamma)).

        **Step 2: lossless numbers.** $\sqrt{\epsilon_r} = 9$:
        $$k = \omega\frac{\sqrt{\epsilon_r}}{c} = \frac{2\pi(10^9)(9)}{3\times10^8} = 60\pi = 188.5\ \text{rad/m}$$
        $$\eta_i = \frac{\eta_0}{9} = 41.9\ \Omega$$
        **Step 3: polar form.** Size $\sqrt{1 + 0.889^2} = 1.338$; angle $\tan^{-1}0.889 = 41.6°$:
        $$1 - j0.889 = 1.338e^{-j41.6°}$$
        Its square root takes the root of the size and half the angle:
        $$\sqrt{1 - j0.889} = 1.157e^{-j20.8°}$$
        **Step 4: γ.** $\gamma = j(188.5)(1.157)e^{-j20.8°} = 218.0e^{j69.2°}$. Split:
        $$\boxed{\alpha = 218\cos69.2° = 77.5\ \text{Np/m}}$$
        $$\boxed{\beta = 218\sin69.2° = 204\ \text{rad/m}}$$
        **Step 5: λ, δ, η.**
        $$\boxed{\lambda = \frac{2\pi}{204} = 3.08\ \text{cm}, \quad \delta = \frac1{77.5} = 1.29\ \text{cm}}$$
        $$\boxed{\eta = \frac{41.9}{1.157}e^{j20.8°} = 36.2e^{j20.8°}\ \Omega}$$
        Check: $|\gamma||\eta| = (218)(36.2) = 7.89\times10^3 = \omega\mu_0$ ✓, angles $69.2° + 20.8° = 90°$ ✓.

        !!trap The trap
          The problem says "use the approximation appropriate for the loss tangent". At 1 GHz the honest answer is that **none** is appropriate. The good-conductor formula would give $\alpha = 126$ Np/m (60% too high); the low-loss formula $\frac\sigma2\eta_i = 83.8$ (8% too high).

        **Speed path.** Loss tangent $\approx 1$: polar method, $k = 60\pi$, $\eta_i = 41.9$, divide/multiply by $1.157e^{\mp j20.8°}$. Taught in [Topic 5](#/l/w2-gamma) and [Topic 7](#/l/w2-limits).
      ` }),
    P({ src: 'HW 10 #2(c)', title: 'The submarine at 20 kHz',
      q: md`(c) A ship on the surface transmits at 20 kHz to a submarine. How close to the surface must the submarine be to receive at least 0.1% of the surface amplitude?`,
      parts: [NT(md`depth`, 12.29, 'm', [{ v: 8.19, msg: 'That is 1%, ln 100. For 0.1% use ln 1000 = 6.91.' }, { v: 1.779, msg: 'That is the skin depth δ = 1/α.' }])],
      hints: [md`Loss tangent at 20 kHz: $4.4\times10^4$, a good conductor. $\alpha = \sqrt{\pi f\mu\sigma}$.`],
      sol: md`
        **Step 1.** The loss tangent scales as $1/f$: at 20 kHz it is $8.9\times10^5/20 = 4.4\times10^4 \gg 1$. Good conductor:
        $$\alpha = \sqrt{\pi(2\times10^4)(4\pi\times10^{-7})(4)} = \pi\sqrt{0.032} = 0.562\ \text{Np/m}$$
        **Step 2.** $e^{-\alpha d} = 10^{-3}$:
        $$d = \frac{\ln1000}{\alpha} = \frac{6.91}{0.562}$$
        $$\boxed{d = 12.3\ \text{m}}$$
        [[fig:s]]

        **Speed path.** $\alpha \propto \sqrt f$: $0.04\pi\sqrt{20} = 0.562$; $d = 6.91/\alpha$. Taught in [Topic 7](#/l/w2-limits).
      `,
      figs: { s: fig10s } }),

    // ---------------------------------------------------------------- Problem 3
    R(md`
      ### Problem 3 · Five polarizations

      For each plane TEM wave in free space, find (i) the phasors $\Et$ and $\Ht$, and (ii) the polarization: linear (give the direction), circular (right or left), or neither (elliptical).

      - (a) $\mathbf E_1 = 4\cos(\omega t - \beta z)\,\hat x$ V/m
      - (b) $\mathbf E_2 = 5\cos(\omega t - \beta y)\,\hat x + 5\sin(\omega t - \beta y)\,\hat z$ V/m
      - (c) $\mathbf H_3 = 2\cos(\omega t + \beta z + \frac\pi3)\,\hat x + 2\sin(\omega t + \beta z - \frac\pi6)\,\hat y$ A/m
      - (d) $\mathbf H_4 = 4\cos(\omega t - \beta x)\,\hat z - 3\sin(\omega t - \beta x)\,\hat y$ A/m
      - (e) $\mathbf H_5 = 2\sin(\omega t + \beta y)\,\hat x - 2\sin(\omega t + \beta y - \frac\pi4)\,\hat z$ A/m

      Same tools as HW 8 #4: $\Ht = \frac{1}{\eta_0}\hat k\times\Et$, $\Et = \eta_0\Ht\times\hat k$, $\sin \to -j$. The polarization of a wave is the polarization of its $\mathbf E$ (its $\mathbf H$ has the same shape, turned $90°$).
    `),
    P({ src: 'HW 10 #3(a)–(b)', title: 'E₁ and E₂',
      q: md`(a) $\mathbf E_1 = 4\cos(\omega t - \beta z)\,\hat x$ V/m. (b) $\mathbf E_2 = 5\cos(\omega t - \beta y)\,\hat x + 5\sin(\omega t - \beta y)\,\hat z$ V/m.`,
      parts: [
        mc(md`(a) $\Ht_1 =$`, [md`$\dfrac{1}{30\pi}e^{-j\beta z}\hat y$ A/m`, md`$-\dfrac{1}{30\pi}e^{-j\beta z}\hat y$ A/m`, md`$480\pi e^{-j\beta z}\hat y$ A/m`, md`$\dfrac{1}{30\pi}e^{+j\beta z}\hat y$ A/m`], 0,
          [null, md`$\hat z\times\hat x = +\hat y$.`, md`Divide by $\eta_0$.`, md`$-\beta z$ gives $e^{-j\beta z}$.`]),
        mc(md`(b) $\Ht_2 =$`, [md`$-\dfrac{1}{24\pi}(j\hat x + \hat z)e^{-j\beta y}$ A/m`, md`$\dfrac{1}{24\pi}(j\hat x + \hat z)e^{-j\beta y}$ A/m`, md`$\dfrac{1}{24\pi}(\hat x - j\hat z)e^{-j\beta y}$ A/m`, md`$-\dfrac{1}{24\pi}(\hat x + j\hat z)e^{-j\beta y}$ A/m`], 0,
          [null, md`Signs: $\hat y\times\hat x = -\hat z$ and $\hat y\times(-j\hat z) = -j\hat x$.`, md`That is $\Et/\eta_0$, parallel to $\mathbf E$.`, md`The $j$ sits on the wrong component: $\hat y\times\hat z = \hat x$ carries the $-j$ of $E_z$.`]),
        mc(md`(b) polarization of wave 2`, [md`left-hand circular`, md`right-hand circular`, md`linear along $\hat x + \hat z$`, md`elliptical`], 0,
          [null, md`$\mathbf E$ turns from $\hat x$ to $\hat z$. Right thumb along $+\hat y$ curls from $\hat z$ to $\hat x$: the opposite way.`, md`The components are $90°$ apart, not in step.`, md`The sizes are equal (5 and 5) and the phases $90°$ apart: circular.`]),
      ],
      sol: md`
        **(a)** $\Et_1 = 4e^{-j\beta z}\hat x$ V/m. Toward $+z$; $\hat z\times\hat x = \hat y$; $4/120\pi = 1/30\pi$:
        $$\boxed{\Ht_1 = \frac{1}{30\pi}e^{-j\beta z}\hat y = 10.6\,e^{-j\beta z}\hat y\ \text{mA/m}}$$
        **Linear, along $\hat x$.**

        **(b) Phasors.** $\cos \to 1$, $\sin \to -j$, travel toward $+y$:
        $$\boxed{\Et_2 = 5(\hat x - j\hat z)e^{-j\beta y}\ \text{V/m}}$$
        $\Ht = \frac{1}{\eta_0}\hat y\times\Et$, with $\hat y\times\hat x = -\hat z$ and $\hat y\times\hat z = \hat x$:
        $$\hat y\times(\hat x - j\hat z) = -\hat z - j\hat x$$
        $$\boxed{\Ht_2 = -\frac{1}{24\pi}(j\hat x + \hat z)e^{-j\beta y}\ \text{A/m}}$$
        **Polarization.** Equal sizes (5, 5), $90°$ apart: circular. At $y = 0$: $t = 0$ gives $5\hat x$; a quarter period later $5\hat z$. $\mathbf E$ turns from $\hat x$ to $\hat z$. Right thumb along $+\hat y$: since $\hat z\times\hat x = \hat y$, the fingers curl from $\hat z$ to $\hat x$, opposite to $\mathbf E$. So it is **left-hand circular**.

        **Speed path.** Equal and $90°$: circular. Which way does $\mathbf E$ turn ($\hat x\to\hat z$), and is that $\hat x\times\hat z = -\hat y$ against the travel? Yes, so left. Taught in [Topic 9](#/l/w3-pol).
      ` }),
    P({ src: 'HW 10 #3(c)', title: 'H₃ toward −z',
      q: md`(c) $\mathbf H_3 = 2\cos(\omega t + \beta z + \frac\pi3)\,\hat x + 2\sin(\omega t + \beta z - \frac\pi6)\,\hat y$ A/m.`,
      parts: [
        mc(md`$\Et_3 =$`, [md`$240\pi e^{j\pi/3}(\hat x + \hat y)e^{j\beta z}$ V/m`, md`$240\pi e^{j\pi/3}(\hat x - \hat y)e^{j\beta z}$ V/m`, md`$-240\pi e^{j\pi/3}(\hat x + \hat y)e^{j\beta z}$ V/m`, md`$240\pi e^{j\pi/3}(\hat x + \hat y)e^{-j\beta z}$ V/m`], 0,
          [null, md`That is parallel to $\mathbf H$.`, md`That is the partner of a $+z$ wave.`, md`$+\beta z \to e^{+j\beta z}$.`]),
        mc(md`polarization`, [md`linear along $\hat x + \hat y$`, md`linear along $\hat x - \hat y$`, md`right-hand circular`, md`elliptical`], 0,
          [null, md`That is the direction of $\mathbf H$. The polarization is named for $\mathbf E$.`, md`$\sin(\theta - 30°) = -\cos(\theta + 60°)$: the components are in step (opposite), not $90°$ apart.`, md`In-step components give a line.`]),
      ],
      sol: md`
        This is HW 8 #4(b) with amplitude 2 instead of 5. $\sin(\theta - \frac\pi6) = \cos(\theta - \frac{2\pi}3) = -\cos(\theta + \frac\pi3)$, so
        $$\boxed{\Ht_3 = 2e^{j\pi/3}(\hat x - \hat y)e^{j\beta z}\ \text{A/m}}$$
        Toward $-z$: $\Et = \eta_0\Ht\times(-\hat z)$, and $(\hat x - \hat y)\times(-\hat z) = \hat y + \hat x$:
        $$\boxed{\Et_3 = 240\pi e^{j\pi/3}(\hat x + \hat y)e^{j\beta z}\ \text{V/m}}$$
        **Linear, along $(\hat x + \hat y)/\sqrt2$.**

        **Speed path.** In step means linear; rotate $\hat x - \hat y$ by $90°$ about the travel axis. Taught in [Topic 9](#/l/w3-pol).
      ` }),
    P({ src: 'HW 10 #3(d)', title: 'H₄ toward +x: unequal sizes',
      q: md`(d) $\mathbf H_4 = 4\cos(\omega t - \beta x)\,\hat z - 3\sin(\omega t - \beta x)\,\hat y$ A/m.`,
      parts: [
        mc(md`$\Et_4 =$`, [md`$120\pi(4\hat y - j3\hat z)e^{-j\beta x}$ V/m`, md`$120\pi(-4\hat y + j3\hat z)e^{-j\beta x}$ V/m`, md`$120\pi(4\hat z + j3\hat y)e^{-j\beta x}$ V/m`, md`$120\pi(4\hat y + j3\hat z)e^{-j\beta x}$ V/m`], 0,
          [null, md`$\hat z\times\hat x = +\hat y$, so $H_z$ becomes $+\eta_0H_z\hat y$.`, md`That is $\eta_0\Ht$, parallel to $\mathbf H$.`, md`$\hat y\times\hat x = -\hat z$ gives a minus sign on the $\hat z$ part.`]),
        mc(md`polarization`, [md`elliptical`, md`right-hand circular`, md`linear along $4\hat y - 3\hat z$`, md`left-hand circular`], 0,
          [null, md`Circular needs equal sizes; here they are 4 and 3.`, md`The components are $90°$ apart, not in step.`, md`Sizes 4 and 3 are unequal.`]),
      ],
      sol: md`
        **Phasor of H.** $\cos \to 1$; $-3\sin \to -3(-j) = 3j$:
        $$\boxed{\Ht_4 = (3j\hat y + 4\hat z)e^{-j\beta x}\ \text{A/m}}$$
        **E.** Toward $+x$: $\Et = \eta_0\Ht\times\hat x$, with $\hat y\times\hat x = -\hat z$ and $\hat z\times\hat x = \hat y$:
        $$\boxed{\Et_4 = 120\pi(4\hat y - j3\hat z)e^{-j\beta x}\ \text{V/m}}$$
        **Polarization.** $90°$ apart but sizes 4 and 3: **elliptical** (neither linear nor circular). It is right-handed: $E_y = 480\pi\cos\theta$ peaks first, then $E_z = 360\pi\sin\theta$, so $\mathbf E$ turns $\hat y\to\hat z$, and $\hat y\times\hat z = +\hat x$ is the travel direction.

        **Speed path.** Unequal sizes, $90°$ apart: an upright ellipse. Taught in [Topic 9](#/l/w3-pol).
      ` }),
    P({ src: 'HW 10 #3(e)', title: 'H₅ toward −y: equal sizes, 135° apart',
      q: md`(e) $\mathbf H_5 = 2\sin(\omega t + \beta y)\,\hat x - 2\sin(\omega t + \beta y - \frac\pi4)\,\hat z$ A/m.`,
      parts: [
        mc(md`$\Ht_5 =$`, [md`$-2j\left(\hat x - e^{-j\pi/4}\hat z\right)e^{j\beta y}$ A/m`, md`$2\left(\hat x - e^{-j\pi/4}\hat z\right)e^{j\beta y}$ A/m`, md`$-2j\left(\hat x + e^{-j\pi/4}\hat z\right)e^{j\beta y}$ A/m`, md`$-2j\left(\hat x - e^{-j\pi/4}\hat z\right)e^{-j\beta y}$ A/m`], 0,
          [null, md`Both components are sines: each phasor carries $-j$.`, md`The $\hat z$ term is $-2\sin(\cdot)$.`, md`$+\beta y \to e^{+j\beta y}$.`]),
        mc(md`polarization`, [md`elliptical`, md`left-hand circular`, md`linear`, md`right-hand circular`], 0,
          [null, md`Equal sizes, but the phase difference is $135°$ (or $45°$ in $\mathbf E$), not $90°$.`, md`The components are not in step.`, md`Not $90°$ apart.`]),
      ],
      sol: md`
        **Phasor of H.** $2\sin\theta \to -2j$; $-2\sin(\theta - \frac\pi4) \to -2(-j)e^{-j\pi/4} = 2je^{-j\pi/4}$:
        $$\boxed{\Ht_5 = -2j\left(\hat x - e^{-j\pi/4}\hat z\right)e^{j\beta y}\ \text{A/m}}$$
        In polar form the two parts are $2e^{-j90°}$ and $2e^{j45°}$: equal sizes, $135°$ apart.

        **E.** Toward $-y$: $\Et = \eta_0\Ht\times(-\hat y)$, with $\hat x\times(-\hat y) = -\hat z$ and $\hat z\times(-\hat y) = \hat x$. So $\tilde E_x = \eta_0\tilde H_z$ and $\tilde E_z = -\eta_0\tilde H_x$:
        $$\boxed{\Et_5 = 240\pi\left(e^{j\pi/4}\hat x + j\hat z\right)e^{j\beta y}\ \text{V/m}}$$
        **Polarization.** Equal sizes, $45°$ apart in $\mathbf E$: **elliptical** (a tilted ellipse, like HW 8 #4(e)). For completeness it is left-handed: $E_z$ leads, so $\mathbf E$ turns $\hat z\to\hat x$, while the right thumb along $-\hat y$ curls $\hat x\to\hat z$.

        **Speed path.** Equal sizes is not enough: the phase difference must be exactly $90°$. Taught in [Topic 9](#/l/w3-pol).
      ` }),

    // ---------------------------------------------------------------- Problem 4
    RF(md`
      ### Problem 4 · Polarization made by two sheets

      Two current sheets sit in free space, in the planes $x = 0$ and $x = \lambda/4$. They carry $\mathbf J_s(t) = J_1\cos(\omega t - \phi)\,\hat z$ and $\mathbf J_s(t) = J_2\cos(\omega t)\,\hat y$, where $J_1$, $J_2$ and $\phi$ are real. Each sheet radiates on both sides, and for $x > \lambda/4$ the two waves add into one whose polarization depends on $\phi$ and on $J_2/J_1$.

      [[fig:t]]
    `, { t: { svg: twoSheetFig(), cap: 'Sheet 1 (current along $\\hat z$, out of the page) at $x = 0$; sheet 2 (current along $\\hat y$) a quarter wavelength further.' } }),
    P({ src: 'HW 10 #4(a)', title: 'Choosing φ for RHCP, LHCP and linear',
      q: md`(a) With $J_2 = J_1$, find the value(s) of $\phi$ that make the total wave in $x > \lambda/4$ (i) right-hand circular, (ii) left-hand circular, (iii) linear. Justify each by writing the electric-field phasor in $x > \lambda/4$.`,
      parts: [
        mc(md`(i) RHCP`, [md`$\phi = 0$`, md`$\phi = \pi$`, md`$\phi = \pi/2$`, md`$\phi = -\pi/2$`], 0,
          [null, md`That gives $(j\hat y - \hat z)$: $E_z$ leads, so $\mathbf E$ turns $\hat z\to\hat y$, left-handed about $+\hat x$.`, md`Then the two components are in step (both $\propto j$): linear.`, md`Then the components are in step: linear along $\hat y + \hat z$.`]),
        mc(md`(ii) LHCP`, [md`$\phi = \pi$`, md`$\phi = 0$`, md`$\phi = \pi/2$`, md`$\phi = \pi/4$`], 0,
          [null, md`$\phi = 0$ is right-handed.`, md`That is linear.`, md`$45°$ apart gives an ellipse.`]),
        mc(md`(iii) linear`, [md`$\phi = \pm\pi/2$`, md`$\phi = 0$ or $\pi$`, md`any $\phi$, since $J_1 = J_2$`, md`no value of $\phi$`], 0,
          [null, md`Those are the circular cases. The quarter-wave spacing already adds $90°$; $\phi$ must cancel it.`, md`Equal currents fix the sizes, not the phase.`, md`$\phi = \pm90°$ undoes the $90°$ from the spacing.`]),
      ],
      hints: [md`One sheet: $\Et = -\frac{\eta_0}{2}\tilde{\mathbf J}_se^{-j\beta|x - x_s|}$. Sheet 2 for $x > \lambda/4$: $e^{-j\beta(x - \lambda/4)} = e^{j\pi/2}e^{-j\beta x} = je^{-j\beta x}$.`, md`Total: $\Et = -\frac{\eta_0J}{2}\left(j\hat y + e^{-j\phi}\hat z\right)e^{-j\beta x}$.`],
      sol: md`
        **Step 1: each sheet's wave in x > λ/4.** A sheet at $x_s$ makes $\Et = -\frac{\eta_0}{2}\tilde{\mathbf J}_se^{-j\beta|x - x_s|}$. Sheet 1 has $\tilde{\mathbf J}_s = J_1e^{-j\phi}\hat z$ and $|x - 0| = x$:
        $$\Et_1 = -\frac{\eta_0}{2}J_1e^{-j\phi}e^{-j\beta x}\,\hat z$$
        Sheet 2 has $\tilde{\mathbf J}_s = J_2\hat y$ and distance $x - \lambda/4$. Since $\beta\lambda/4 = \pi/2$:
        $$e^{-j\beta(x - \lambda/4)} = e^{j\pi/2}e^{-j\beta x} = je^{-j\beta x}$$
        $$\Et_2 = -\frac{\eta_0}{2}J_2\,j\,e^{-j\beta x}\,\hat y$$
        **Step 2: the sum with J₁ = J₂ = J.**
        $$\Et = -\frac{\eta_0J}{2}\left(j\hat y + e^{-j\phi}\hat z\right)e^{-j\beta x}$$
        The overall $-\frac{\eta_0J}{2}$ does not change the shape. Compare the phases: $\hat y$ has $+90°$, $\hat z$ has $-\phi$.

        **(i) φ = 0.** $\Et \propto (j\hat y + \hat z)$: equal sizes, $E_y$ leads $E_z$ by $90°$. $\mathbf E$ turns from $\hat y$ to $\hat z$; $\hat y\times\hat z = +\hat x$ is the travel direction:
        $$\boxed{\phi = 0\ (\text{or } 2n\pi): \ \Et = -60\pi J(j\hat y + \hat z)e^{-j\beta x},\ \text{RHCP}}$$
        **(ii) φ = π.** $e^{-j\pi} = -1$: $\Et \propto (j\hat y - \hat z)$. Now $E_z$ (phase $180°$) leads $E_y$ (phase $90°$) by $90°$; $\mathbf E$ turns $\hat z\to\hat y$, against $\hat x$:
        $$\boxed{\phi = \pi: \ \Et = -60\pi J(j\hat y - \hat z)e^{-j\beta x},\ \text{LHCP}}$$
        **(iii) φ = ±π/2.** $e^{-j\pi/2} = -j$ gives $j(\hat y - \hat z)$; $e^{+j\pi/2} = j$ gives $j(\hat y + \hat z)$. In step: a line.
        $$\boxed{\phi = \tfrac\pi2: \text{linear along } \hat y - \hat z; \quad \phi = -\tfrac\pi2: \text{along } \hat y + \hat z}$$
        !!intuition Does this make sense?
          The quarter-wave head start of sheet 1's wave (it travels $\lambda/4$ further) is a $90°$ delay in space. With $\phi = 0$ that alone makes the two parts $90°$ apart: circular. A $\phi$ of $180°$ flips one part and so the hand; $\pm90°$ cancels or doubles the head start into $0°$ or $180°$: linear.

        **Speed path.** Spacing $\lambda/4$ = $90°$. Write $(j\hat y + e^{-j\phi}\hat z)$ and read off the cases. Taught in [Topic 10](#/l/w3-antenna) and [Topic 9](#/l/w3-pol).
      ` }),
    P({ src: 'HW 10 #4(b)–(d)', title: 'Circular versus linear power',
      q: md`(b) Find $\langle\mathbf S\rangle$ in $x > \lambda/4$ for cases (i) and (ii) with $J_1 = J_2 = 1$ A/m. (c) Find it for (i) and (ii) with $J_1 = 1$ A/m and $J_2 = 0$. (d) What do (b) and (c) say about the average power density of a circular wave compared with a linear wave of the same peak $|\mathbf E|$?`,
      parts: [
        NT(md`(b) $\langle S_x\rangle$`, 30 * PI, 'W/m^2', [{ v: 15 * PI, msg: 'That is one sheet. Both components carry power.' }]),
        NT(md`(c) $\langle S_x\rangle$`, 15 * PI, 'W/m^2', [{ v: 30 * PI, msg: 'With J₂ = 0 only sheet 1 radiates.' }]),
        mc(md`(d)`, [md`At equal peak $|\mathbf E|$, the circular wave carries twice the power`, md`They carry the same power`, md`The linear wave carries twice the power`, md`The circular wave carries $\sqrt2$ times the power`], 0,
          [null, md`Both have peak $|\mathbf E| = 60\pi$ V/m, but the circular one keeps that size all the time.`, md`Backwards: the linear wave is at its peak only for an instant.`, md`Power goes as $|E|^2$, and the ratio of the averages of $|E|^2$ is 2.`]),
      ],
      sol: md`
        **(b)** Each component has size $\frac{\eta_0}{2}(1) = 60\pi$ V/m. With $|\Et|^2 = (60\pi)^2 + (60\pi)^2$:
        $$\langle S_x\rangle = \frac{|\Et|^2}{2\eta_0} = \frac{2(60\pi)^2}{240\pi}$$
        $$\boxed{\langle\mathbf S\rangle = 30\pi\,\hat x = 94.2\,\hat x\ \text{W/m}^2}$$
        the same for RHCP and LHCP (the hand does not change the power).

        **(c)** With $J_2 = 0$ only the $\hat z$ wave remains (linear along $\hat z$, whatever $\phi$ is):
        $$\boxed{\langle\mathbf S\rangle = \frac{(60\pi)^2}{240\pi}\hat x = 15\pi\,\hat x = 47.1\,\hat x\ \text{W/m}^2}$$
        **(d)** The peak $|\mathbf E|$ is $60\pi$ V/m in both cases. The circular field has $|\mathbf E(t)| = 60\pi$ at **every** instant (cosine and sine of the same size); the linear field reaches $60\pi$ only at its crests, and $\cos^2$ averages to $\frac12$. So:
        $$\boxed{\text{equal peak } |\mathbf E|: \ \langle S\rangle_{\text{circular}} = 2\langle S\rangle_{\text{linear}}}$$
        **Speed path.** $\langle S\rangle = \sum|\tilde E_i|^2/2\eta_0$: two equal components, twice the power. Taught in [Topic 4](#/l/w1-avg) and [Topic 9](#/l/w3-pol).
      ` }),
  ];
  EM.lesson('e3-hw', { id: 'e3-hw10', order: 10, kind: 'hw', title: 'Homework 10', sub: 'A low-loss wave, sea water at three frequencies, five polarizations, two sheets λ/4 apart', steps: hw10 });

  // ================================================================ HOMEWORK 11
  function interfaceFig(o) {
    const g = PF.fig({ alt: o.alt });
    const xb = 200, yT = 24, yB = 170;
    g.rect(xb, yT, 150, yB - yT, { cls: o.pec ? 'shade' : 'shade nodecl' });
    g.line(xb, yT, xb, yB, { cls: 'thick' });
    g.label(xb, yB + 16, o.at, 't', 'small');
    g.arrow(xb - 150, 60, xb - 20, 60, { cls: 'thick', hs: 8 }); g.label(xb - 85, 52, o.inc, 'b', 'small');
    g.arrow(xb - 20, 110, xb - 150, 110, { hs: 7 }); g.label(xb - 85, 118, o.ref, 't', 'small');
    if (o.tr) { g.arrow(xb + 20, 85, xb + 130, 85, { hs: 7 }); g.label(xb + 75, 77, o.tr, 'b', 'small'); }
    g.text(xb - 85, 150, o.left, 'c', 'small'); g.text(xb + 75, 150, o.right, 'c', 'small');
    return g.svg();
  }
  function zig(g, x1, y1, x2, y2, body = 28) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  function tlFig() {
    const g = PF.fig({ alt: 'A source f(t) in series with R_g = Z_0 drives a line with Z_0 = 100 ohm, v = c, length l = 600 m, ending in R_L = Z_0/4 = 25 ohm. z = 0 at the source end, z = l at the load.' });
    const y0 = 30, y1 = 92, xa = 130, xb = 330, xs = 38, ym = 61;
    g.circle(xs, ym, 13); g.label(xs, ym - 6, '+', 'c', 'small'); g.label(xs, ym + 7, '-', 'c', 'small');
    g.line(xs, ym - 13, xs, y0); g.line(xs, ym + 13, xs, y1);
    g.line(xs, y0, xs + 22, y0); zig(g, xs + 22, y0, xs + 62, y0); g.line(xs + 62, y0, xa, y0); g.line(xs, y1, xa, y1);
    g.label(xs - 18, ym, 'f(t)', 'r', 'small'); g.label(xs + 42, y0 - 11, 'R_g = Z_0', 'b', 'small');
    g.line(xa, y0, xb, y0, { cls: 'thick' }); g.line(xa, y1, xb, y1, { cls: 'thick' });
    g.label((xa + xb) / 2, ym - 10, 'Z_0 = 100\\,\\Omega', 'c', 'small'); g.label((xa + xb) / 2, ym + 11, 'v = c', 'c', 'small');
    g.line(xb, y0, xb + 24, y0); zig(g, xb + 24, y0, xb + 24, y1); g.line(xb + 24, y1, xb, y1);
    g.label(xb + 34, ym, 'R_L = Z_0/4', 'l', 'small');
    g.arrow(xa, 122, xb + 30, 122, { cls: 'dim', hs: 6 }); g.label(xb + 34, 122, 'z', 'l', 'small');
    g.label(xa, 128, '0', 't', 'small'); g.label(xb, 128, 'l = 600\\ \\text{m}', 't', 'small');
    return g.svg();
  }
  const s11 = TL.solve({ Vg: 1, Rg: 100, RL: 25, sections: [{ Z0: 100, len: 600, v: 300 }], tMax: 6 });
  const s11step = TL.solve({ Vg: 10, Rg: 100, RL: 25, sections: [{ Z0: 100, len: 600, v: 300 }], tMax: 13 });
  const fig11bd = PF.row([
    { svg: TL.diagram(s11, { qty: 'V', unit: '', tMax: 6, probe: 150, w: 330, h: 300 }), cap: 'Voltage: the weight of each impulse (V·s per V·s of input).' },
    { svg: TL.diagram(s11, { qty: 'I', unit: '', tMax: 6, probe: 150, w: 330, h: 300, coeffs: false }), cap: 'Current: weights in A·s (per V·s of input).' },
  ]);
  const fig11dV = { svg: TL.plotT(s11, 150, { input: 'delta', tMax: 6, unit: 'V·s', name: 'V(l/4,t)\\ \\text{weights}' }), cap: '$V(l/4, t)$: an impulse of weight $\\tfrac12$ at 0.5 µs and one of weight $-0.3$ at 3.5 µs.' };
  const fig11step = { svg: TL.plotT(s11step, 150, { tMax: 13, name: 'V(l/4,t)' }), cap: '$V(l/4, t)$ for $f(t) = 10u(t)$ V: 5 V from 0.5 µs, then 2 V from 3.5 µs on (dashed: the DC value).' };

  const hw11 = [
    R(md`
      **Homework 11** · due Thursday, November 12, 2026 (the sheet prints 2020) · reading: Kudeki, Lectures 27–30 (reflection and transmission, standing waves, TEM transmission lines and the telegrapher's equations, bounce diagrams).

      **What it drills.** Problem 1 reflects a circularly polarized wave and reads the material from $\Gamma$. Problem 2 is a full dielectric boundary with powers and reflectance in dB. Problem 3 is a perfect conductor and its surface current. Problems 4 and 5 get $\mathcal L$, $\mathcal C$, $Z_0$, $v$ from the geometric factor for coax and twin lead. Problem 6 runs the telegrapher's equations by hand. Problem 7 is a bounce diagram with an impulse, then a step, then the DC steady state.

      **Read these first.** [Topic 11: reflection and transmission](#/l/w4-gamma), [Topic 12: standing waves](#/l/w4-standing), [Topic 9: polarization](#/l/w3-pol), [Topic 13: fields to telegrapher's equations](#/l/w5-telegraph), [Topic 14: launching and Γ](#/l/w5-launch) and [Topic 15: bounce diagrams](#/l/w5-bounce).

      Three different "taus" appear in this set, so keep them apart: $\tau = 1 + \Gamma$ is the **transmission coefficient** at a boundary (Problems 1–2); $\tau_g = Z_0/(R_g + Z_0)$ is the **injection coefficient** of a line (Problem 7); and the angle of $\eta$ (HW 9–10) does not appear here at all. Problems restated in our own words with the numbers as assigned; all answers checked in Python. Problem 8 (an AI-generated infographic on reflections in transmission lines, and its critique) is not physics and is omitted.
    `),

    // ---------------------------------------------------------------- Problem 1
    RF(md`
      ### Problem 1 · A circular wave meets a dielectric

      In vacuum ($x < 0$) a monochromatic plane wave has the phasor $\Et_i = (j\hat z - \hat y)e^{-j2\pi x}$ V/m. At $x = 0$ it meets a perfect dielectric filling $x > 0$, with $\mu = \mu_0$ and $\epsilon > \epsilon_0$. The reflected wave in $x < 0$ is $\Et_r = -\frac12(j\hat z - \hat y)e^{j2\pi x}$ V/m.

      [[fig:i]]
    `, { i: { svg: interfaceFig({ alt: 'Vacuum on the left (x < 0), a dielectric with mu_0 and epsilon > epsilon_0 on the right. The incident wave goes right, the reflected wave left, the transmitted wave right inside the dielectric.', at: 'x = 0', inc: '\\Et_i', ref: '\\Et_r', tr: '\\Et_t', left: 'vacuum', right: 'dielectric' }), cap: 'Normal incidence on the plane $x = 0$.' } }),
    P({ src: 'HW 11 #1(a)–(b)', title: 'Polarizations and frequency',
      q: md`(a) What are the polarizations of the incident and reflected waves? (b) What is the frequency $f$?`,
      parts: [
        mc(md`(a) incident wave`, [md`right-hand circular`, md`left-hand circular`, md`linear along $\hat z - \hat y$`, md`elliptical`], 0,
          [null, md`$\mathbf E$ turns from $-\hat y$ to $-\hat z$, the same sense as $\hat y\to\hat z$, which is right-handed about $+\hat x$.`, md`$j$ means the two parts are $90°$ apart, not in step.`, md`Sizes are equal (1 and 1).`]),
        mc(md`(a) reflected wave`, [md`left-hand circular`, md`right-hand circular`, md`linear`, md`elliptical`], 0,
          [null, md`The field still turns $\hat y\to\hat z$, but the wave now travels toward $-x$: the hand flips.`, md`$\Et_r$ is a multiple of the same circular vector.`, md`Sizes are equal ($\tfrac12$ and $\tfrac12$).`]),
        NT(md`(b) $f$`, 3e8, 'Hz', [{ v: 1, msg: 'That is 1/λ in 1/m. f = c/λ.' }]),
      ],
      sol: md`
        **(a) Incident.** In time ($\theta = \omega t - 2\pi x$): $E_y = -\cos\theta$, $E_z = \Re\{je^{j\theta}\} = -\sin\theta$. Equal sizes, $90°$ apart: circular. At $x = 0$: $t = 0$ gives $-\hat y$; a quarter period later, $-\hat z$. $\mathbf E$ turns $-\hat y\to-\hat z$, which is the same sense as $\hat y\to\hat z$. The travel is $+\hat x = \hat y\times\hat z$: right thumb along $+\hat x$, fingers curl $\hat y\to\hat z$ ✓.
        $$\boxed{\text{incident: right-hand circular}}$$
        **Reflected.** $\Et_r = \frac12(\hat y - j\hat z)e^{j2\pi x}$: in time $E_y = \frac12\cos\theta'$, $E_z = \frac12\sin\theta'$ ($\theta' = \omega t + 2\pi x$). It turns $\hat y\to\hat z$ too, but it travels toward $-\hat x$, and a right thumb along $-\hat x$ curls $\hat z\to\hat y$.
        $$\boxed{\text{reflected: left-hand circular}}$$
        The sense of rotation in the plane is kept, the direction of travel reverses, so the hand flips. That is why a circular antenna does not hear its own echo from a flat reflector.

        **(b)** $\beta_0 = 2\pi$ rad/m, so $\lambda_0 = 1$ m and
        $$\boxed{f = \frac{c}{\lambda_0} = 3\times10^8\ \text{Hz} = 300\ \text{MHz}}$$
        **Speed path.** Which component leads, which way it travels, flip on reflection. $\beta = 2\pi$: $\lambda = 1$ m, 300 MHz. Taught in [Topic 9](#/l/w3-pol).
      ` }),
    P({ src: 'HW 11 #1(c)–(e)', title: 'ε, the transmitted wave and the power split',
      q: md`(c) What is the permittivity $\epsilon$ of the dielectric? (d) Write the phasor of the transmitted electric field. (e) What percentage of the incident time-averaged power per unit area enters the dielectric?`,
      parts: [
        NT(md`(c) $\epsilon_r$`, 9, '', [{ v: 3, msg: 'That is √εr = η₀/η₂.' }, { v: 1 / 9, msg: 'Upside down: ε > ε₀ makes η₂ smaller and Γ negative.' }]),
        mc(md`(d) $\Et_t =$`, [md`$\tfrac12(j\hat z - \hat y)e^{-j6\pi x}$ V/m`, md`$\tfrac32(j\hat z - \hat y)e^{-j6\pi x}$ V/m`, md`$\tfrac12(j\hat z - \hat y)e^{-j2\pi x}$ V/m`, md`$-\tfrac12(j\hat z - \hat y)e^{-j6\pi x}$ V/m`], 0,
          [null, md`$\tau = 1 + \Gamma = 1 - \tfrac12$, not $1 + \tfrac12$.`, md`In the dielectric $\beta = 3\beta_0 = 6\pi$.`, md`That is $\Gamma$, not $\tau = 1 + \Gamma$.`]),
        NT(md`(e) transmitted`, 75, '%', [{ v: 25, msg: 'That is the reflected part |Γ|².' }, { v: 50, msg: 'That is |τ|... power needs |τ|² η₁/η₂ = 1 − |Γ|².' }]),
      ],
      hints: [md`$\Gamma = -\frac12 = \dfrac{\eta_2 - \eta_0}{\eta_2 + \eta_0}$; solve for $\eta_2$.`],
      sol: md`
        **(c)** Compare $\Et_r$ with $\Et_i$ at $x = 0$: $\Gamma = -\frac12$. From $\Gamma = (\eta_2 - \eta_0)/(\eta_2 + \eta_0)$:
        $$\eta_2 = \eta_0\frac{1 + \Gamma}{1 - \Gamma} = \eta_0\frac{1/2}{3/2} = \frac{\eta_0}{3}$$
        Nonmagnetic, so $\eta_2 = \eta_0/\sqrt{\epsilon_r}$ and $\sqrt{\epsilon_r} = 3$:
        $$\boxed{\epsilon = 9\epsilon_0 = 7.96\times10^{-11}\ \text{F/m}}$$
        **(d)** Tangential $\mathbf E$ is continuous: $\Et_t(0) = \Et_i(0) + \Et_r(0) = (1 + \Gamma)(j\hat z - \hat y)$, so $\tau = 1 + \Gamma = \frac12$. In the dielectric $\beta = 3\cdot2\pi = 6\pi$:
        $$\boxed{\Et_t = \tfrac12(j\hat z - \hat y)e^{-j6\pi x}\ \text{V/m}}$$
        (still right-hand circular: it keeps going toward $+x$).

        **(e)** Reflected fraction $|\Gamma|^2 = \frac14$, so
        $$\boxed{1 - |\Gamma|^2 = 75\%\ \text{enters the dielectric}}$$
        Check directly: $\frac{|\tau|^2/\eta_2}{1/\eta_0} = \frac14\cdot3 = \frac34$ ✓.

        **Speed path.** $\Gamma = -\frac12 \Rightarrow \eta_2 = \eta_0/3 \Rightarrow \epsilon_r = 9$; $\tau = \frac12$, $\beta_2 = 3\beta_0$; transmitted $1 - |\Gamma|^2$. Taught in [Topic 11](#/l/w4-gamma).
      ` }),

    // ---------------------------------------------------------------- Problem 2
    R(md`
      ### Problem 2 · Vacuum to a dielectric of 2.56ε₀

      The plane wave $\mathbf E = 2\sin(\omega t - \beta z)\,\hat x$ V/m travels in vacuum toward $+z$ and hits the plane $z = 0$, the boundary of a perfect dielectric ($\epsilon = 2.56\epsilon_0$, $\mu = \mu_0$) filling $z > 0$.
    `),
    P({ src: 'HW 11 #2(a)–(b)', title: 'Reflected and transmitted E and H',
      q: md`(a) Write the reflected and transmitted electric fields as phasors, using $\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$ and $\tau = 1 + \Gamma$. (b) Write the incident, reflected and transmitted $\mathbf H$ phasors in A/m.`,
      parts: [
        NT(md`$\Gamma$`, -3 / 13, '', [{ v: 3 / 13, msg: 'Sign: η₂ < η₁ makes Γ negative.' }, { v: -0.6 / 2.6, msg: 'Use √2.56 = 1.6, not 2.56: η₂ = η₀/1.6.' }]),
        NT(md`$\tau$`, 10 / 13, ''),
        mc(md`$\Et_r =$`, [md`$j\tfrac{6}{13}\hat xe^{j\beta_1z}$ V/m`, md`$-j\tfrac{6}{13}\hat xe^{j\beta_1z}$ V/m`, md`$j\tfrac{6}{13}\hat xe^{-j\beta_1z}$ V/m`, md`$\tfrac{6}{13}\hat xe^{j\beta_1z}$ V/m`], 0,
          [null, md`$\Et_i = -2j\hat x$ at $z = 0$, and $\Gamma(-2j) = +j\frac6{13}$.`, md`The reflected wave goes toward $-z$: $e^{+j\beta_1z}$.`, md`The incident field is a sine: its phasor carries $-j$.`]),
        NT(md`$|\Ht_t|$`, 2 * (10 / 13) / (75 * PI), 'A/m', [{ v: 2 * (10 / 13) / ETA0, msg: 'Inside the dielectric divide by η₂ = 75π, not η₀.' }]),
      ],
      hints: [md`$\eta_2 = \eta_0/\sqrt{2.56} = \eta_0/1.6 = 75\pi$. $\sin \to -j$: $\Et_i = -2j\hat xe^{-j\beta_1z}$.`],
      sol: md`
        **Step 1: the coefficients.** $\eta_1 = \eta_0 = 120\pi$; $\eta_2 = 120\pi/1.6 = 75\pi$:
        $$\Gamma = \frac{75\pi - 120\pi}{75\pi + 120\pi} = \frac{-45}{195} = \boxed{-\frac{3}{13} = -0.231}$$
        $$\tau = 1 + \Gamma = \boxed{\frac{10}{13} = 0.769}$$
        **Step 2: the incident phasor.** $2\sin(\omega t - \beta_1z) \to -2je^{-j\beta_1z}$, so $\Et_i = -2j\hat xe^{-j\beta_1z}$ ($\beta_1 = \omega/c$).

        **(a)** Reflected (toward $-z$) and transmitted ($\beta_2 = 1.6\beta_1$):
        $$\boxed{\Et_r = \Gamma(-2j)\hat xe^{j\beta_1z} = j\tfrac{6}{13}\hat xe^{j\beta_1z}\ \text{V/m}}$$
        $$\boxed{\Et_t = \tau(-2j)\hat xe^{-j\beta_2z} = -j\tfrac{20}{13}\hat xe^{-j\beta_2z}\ \text{V/m}}$$
        **(b)** $\Ht = \frac1\eta\hat k\times\Et$. Incident: $\hat z\times\hat x = \hat y$:
        $$\boxed{\Ht_i = \frac{-2j}{120\pi}\hat ye^{-j\beta_1z} = -j5.31\times10^{-3}\hat ye^{-j\beta_1z}}$$
        Reflected: $(-\hat z)\times\hat x = -\hat y$:
        $$\boxed{\Ht_r = -\frac{j6/13}{120\pi}\hat ye^{j\beta_1z} = -j1.22\times10^{-3}\hat ye^{j\beta_1z}}$$
        Transmitted:
        $$\boxed{\Ht_t = \frac{-j20/13}{75\pi}\hat ye^{-j\beta_2z} = -j6.53\times10^{-3}\hat ye^{-j\beta_2z}}$$
        (A/m.) Check tangential $\mathbf H$ at $z = 0$: $-j(5.31 + 1.22) = -j6.53$ mA/m ✓.

        **Speed path.** $\Gamma = (1 - 1.6)/(1 + 1.6) = -3/13$; multiply the incident phasor by $\Gamma$ or $\tau$; $\mathbf H$ of the reflected wave picks up an extra minus. Taught in [Topic 11](#/l/w4-gamma).
      ` }),
    P({ src: 'HW 11 #2(c)–(d)', title: 'Powers and reflectance',
      q: md`(c) Find the time-averaged power per unit area carried by the incident, reflected and transmitted waves (W/m²). Do they respect energy conservation? (d) Express the reflectance $|\Gamma|^2$ in dB, and say what it means physically.`,
      parts: [
        NT(md`incident`, 1 / (60 * PI), 'W/m^2', [{ v: 1 / (30 * PI), msg: 'That drops the ½ in |E|²/(2η).' }]),
        NT(md`reflected`, (9 / 169) / (60 * PI), 'W/m^2'),
        NT(md`transmitted`, (160 / 169) / (60 * PI), 'W/m^2', [{ v: (100 / 169) / (60 * PI), msg: 'That divides by η₀. In the dielectric divide |τE|² by η₂ = η₀/1.6.' }]),
        NT(md`reflectance`, 10 * Math.log10(9 / 169), 'dB', [{ v: 20 * Math.log10(9 / 169), msg: '|Γ|² is already a power ratio: use 10 log, not 20 log.' }]),
      ],
      sol: md`
        **(c)** $\langle S\rangle = |E|^2/(2\eta)$ in each region:
        $$\langle S_i\rangle = \frac{4}{240\pi} = \boxed{5.31\times10^{-3}\ \text{W/m}^2}$$
        $$\langle S_r\rangle = |\Gamma|^2\langle S_i\rangle = \tfrac{9}{169}(5.31\times10^{-3}) = \boxed{2.83\times10^{-4}\ \text{W/m}^2}$$
        $$\langle S_t\rangle = \frac{(20/13)^2}{2(75\pi)} = \boxed{5.02\times10^{-3}\ \text{W/m}^2}$$
        Energy: $5.31 - 0.283 = 5.02$ mW/m² ✓. What arrives either bounces back or goes through; a perfect dielectric boundary keeps nothing.

        **(d)**
        $$\boxed{10\log_{10}\tfrac{9}{169} = -12.7\ \text{dB}}$$
        The reflectance is the **fraction of the incident power that is reflected**: 5.3% here.

        **Speed path.** $|\Gamma|^2 = 9/169$, transmitted $1 - 9/169 = 160/169$ of $1/(60\pi)$. Taught in [Topic 11](#/l/w4-gamma) and [Topic 8](#/l/w2-loss) (dB).
      ` }),

    // ---------------------------------------------------------------- Problem 3
    RF(md`
      ### Problem 3 · A wave meets a perfect conductor

      The plane wave $\mathbf H(y, t) = 5\cos(\omega t + \beta y)\,\hat x$ A/m travels in $y > 0$, a nonmagnetic perfect dielectric with $\epsilon = 4\epsilon_0$. It hits the plane $y = 0$, the face of a perfect conductor ($\sigma = \infty$) filling $y < 0$.

      [[fig:p]]
    `, { p: { svg: interfaceFig({ alt: 'A dielectric with epsilon = 4 epsilon_0 above (y > 0, drawn on the left here) and a perfect conductor (y < 0, shaded on the right). The wave arrives at the boundary and reflects; nothing is transmitted.', pec: true, at: 'y = 0', inc: '\\text{incident}', ref: '\\text{reflected}', left: 'ε = 4ε₀ (y > 0)', right: 'PEC (y < 0)' }), cap: 'Drawn sideways: the wave moves toward $-y$ onto the conductor and comes straight back.' } }),
    P({ src: 'HW 11 #3(a)–(c)', title: 'Fields and the surface current',
      q: md`(a) Write the incident, reflected and transmitted electric-field phasors. (b) Write the incident, reflected and transmitted magnetic-field phasors. (c) Find the surface current $\mathbf J_s(t)$ on the conductor at $y = 0$.`,
      parts: [
        NT(md`(a) amplitude of $\Et_i$`, 300 * PI, 'V/m', [{ v: 600 * PI, msg: 'In this medium η = η₀/2 = 60π.' }]),
        mc(md`(a) $\Et_i =$`, [md`$-300\pi\hat ze^{j\beta y}$ V/m`, md`$+300\pi\hat ze^{j\beta y}$ V/m`, md`$-300\pi\hat ze^{-j\beta y}$ V/m`, md`$300\pi\hat ye^{j\beta y}$ V/m`], 0,
          [null, md`Then $\mathbf E\times\mathbf H \propto \hat z\times\hat x = +\hat y$, away from the conductor.`, md`$\omega t + \beta y$ is $e^{+j\beta y}$.`, md`$\hat y$ is the travel axis.`]),
        mc(md`(b) $\Ht_r =$`, [md`$5\hat xe^{-j\beta y}$ A/m`, md`$-5\hat xe^{-j\beta y}$ A/m`, md`$5\hat xe^{j\beta y}$ A/m`, md`$0$`], 0,
          [null, md`At a perfect conductor $\mathbf E$ reverses ($\Gamma = -1$) but $\mathbf H$ does not: tangential $\mathbf H$ doubles.`, md`The reflected wave goes toward $+y$: $e^{-j\beta y}$.`, md`The reflected wave is as strong as the incident one.`]),
        mc(md`(c) $\mathbf J_s(t) =$`, [md`$-10\cos(\omega t)\,\hat z$ A/m`, md`$+10\cos(\omega t)\,\hat z$ A/m`, md`$-5\cos(\omega t)\,\hat z$ A/m`, md`$10\cos(\omega t)\,\hat x$ A/m`], 0,
          [null, md`$\hat n\times\mathbf H$ with $\hat n = +\hat y$ (out of the conductor): $\hat y\times\hat x = -\hat z$.`, md`The total $\mathbf H$ at the wall is $5 + 5 = 10$ A/m.`, md`$\mathbf J_s$ is perpendicular to $\mathbf H$.`]),
      ],
      hints: [md`$\eta = 60\pi$. Toward $-y$: $\Et = \eta\Ht\times(-\hat y)$, and $\hat x\times(-\hat y) = -\hat z$.`, md`$\Gamma = -1$, $\tau = 0$. $\mathbf J_s = \hat n\times\mathbf H_{\text{total}}$ at $y = 0$, $\hat n = \hat y$.`],
      sol: md`
        **Step 1: the medium.** $\eta = \eta_0/\sqrt4 = 60\pi\ \Omega$; $\beta = 2\omega/c$.

        **(a)** $\Ht_i = 5\hat xe^{j\beta y}$ (toward $-y$). $\Et = \eta\Ht\times\hat k$ with $\hat k = -\hat y$, and $\hat x\times(-\hat y) = -\hat z$:
        $$\boxed{\Et_i = -300\pi\hat ze^{j\beta y}\ \text{V/m}}$$
        At a perfect conductor tangential $\mathbf E$ must vanish, so $\Gamma = -1$ and nothing enters:
        $$\boxed{\Et_r = +300\pi\hat ze^{-j\beta y},\ \ \Et_t = 0}$$
        **(b)** $\Ht_r = \frac1\eta\hat y\times\Et_r$ and $\hat y\times\hat z = \hat x$:
        $$\boxed{\Ht_i = 5\hat xe^{j\beta y},\ \Ht_r = 5\hat xe^{-j\beta y},\ \Ht_t = 0}$$
        (A/m.) At $y = 0$ they add: $\Ht = 10\hat x$. $\mathbf E$ cancels at the wall, $\mathbf H$ doubles.

        **(c)** The surface current equals the jump in tangential $\mathbf H$, with $\hat n = +\hat y$ pointing from the conductor into the dielectric (and $\mathbf H = 0$ inside):
        $$\mathbf J_s = \hat y\times10\hat x\cos\omega t$$
        $$\boxed{\mathbf J_s(t) = -10\cos(\omega t)\,\hat z\ \text{A/m}}$$
        **Speed path.** PEC: $\Gamma = -1$, $\mathbf H$ doubles at the wall, $\mathbf J_s = \hat n\times2\mathbf H_i$. Taught in [Topic 11](#/l/w4-gamma).
      ` }),

    // ---------------------------------------------------------------- Problem 4
    R(md`
      ### Problem 4 · RG-59 and RG-58 coax

      RG-58, the cable used most in the labs, has the same dimensions as RG-59, but its filling is $\epsilon = 2.25\epsilon_0$, $\mu = \mu_0$ instead of RG-59's $\epsilon_0$, $\mu_0$. Both have inner diameter $2a = 0.032$ in and outer diameter $2b = 0.112$ in. Use
      $$\mathcal C = \epsilon\,\text{GF}, \quad \mathcal L = \frac{\mu}{\text{GF}}, \quad Z_0 = \sqrt{\frac{\mathcal L}{\mathcal C}}, \quad v = \frac{1}{\sqrt{\mathcal L\mathcal C}}$$
      with the coax geometric factor $\text{GF} = \dfrac{2\pi}{\ln(b/a)}$.
    `),
    P({ src: 'HW 11 #4(a)–(b)', title: 'L, C, Z₀ and v for both cables',
      q: md`(a) Find $\mathcal L$, $\mathcal C$, $Z_0$ and $v$ for RG-59. (b) Repeat for RG-58.`,
      parts: [
        NT(md`GF`, 5.0155, ''),
        NT(md`(a) $\mathcal C$`, 4.44e-11, 'F/m'),
        NT(md`(a) $\mathcal L$`, 2.506e-7, 'H/m'),
        NT(md`(a) $Z_0$`, 75.1, 'Ω'),
        NT(md`(b) $\mathcal C$`, 9.99e-11, 'F/m'),
        NT(md`(b) $Z_0$`, 50.1, 'Ω', [{ v: 75.1 / 2.25, msg: 'Z₀ goes as 1/√εr: divide by 1.5.' }]),
        NT(md`(b) $v$`, 2e8, 'm/s'),
      ],
      sol: md`
        **Step 1: GF.** The diameters' ratio is the radii's ratio: $b/a = 0.112/0.032 = 3.5$, and $\ln3.5 = 1.253$:
        $$\text{GF} = \frac{2\pi}{1.253} = 5.02$$
        **(a) RG-59.**
        $$\mathcal C = \epsilon_0\,\text{GF} = (8.854\times10^{-12})(5.02) = \boxed{44.4\ \text{pF/m}}$$
        $$\mathcal L = \frac{\mu_0}{\text{GF}} = \frac{4\pi\times10^{-7}}{5.02} = \boxed{0.251\ \mu\text{H/m}}$$
        $Z_0 = \sqrt{\mathcal L/\mathcal C}$; the GF appears squared in the ratio, so $Z_0 = \eta_0/\text{GF}$:
        $$Z_0 = \frac{377}{5.02} = \boxed{75.1\ \Omega}$$
        $$v = \frac{1}{\sqrt{\mu_0\epsilon_0}} = \boxed{3\times10^8\ \text{m/s}}$$
        **(b) RG-58.** Only $\epsilon$ changes, by 2.25:
        $$\boxed{\mathcal C = 99.9\ \text{pF/m},\ \ \mathcal L = 0.251\ \mu\text{H/m}}$$
        $$\boxed{Z_0 = \frac{75.1}{1.5} = 50.1\ \Omega,\ \ v = \frac{c}{1.5} = 2\times10^8\ \text{m/s}}$$
        Exactly the "75 Ω" and "50 Ω" printed on these cables.

        **Speed path.** $Z_0 = \eta/\text{GF}$, $v = 1/\sqrt{\mu\epsilon}$; $\mathcal C$ and $\mathcal L$ from GF. A dielectric of $\epsilon_r$ divides $Z_0$ and $v$ by $\sqrt{\epsilon_r}$. Taught in [Topic 13](#/l/w5-telegraph).
      ` }),

    // ---------------------------------------------------------------- Problem 5
    R(md`
      ### Problem 5 · Twin lead

      TV sets and FM radios are often connected to their antennas with 300 Ω twin lead. For twin lead the geometric factor is $\text{GF} = \dfrac{\pi}{\cosh^{-1}\frac{D}{2a}}$, where $2a$ is the diameter of each wire and $D$ the distance between their centers. With $\epsilon = \epsilon_0$, $\mu = \mu_0$ and $2a = 1$ mm, find $D$ for (a) $Z_0 = 150\ \Omega$, (b) $Z_0 = 300\ \Omega$, (c) $Z_0 = 450\ \Omega$.
    `),
    P({ src: 'HW 11 #5(a)–(c)', title: 'Wire spacing for three impedances',
      q: md`Find $D$ for each $Z_0$.`,
      parts: [
        NT(md`(a) $D$`, 1.888, 'mm', [{ v: 0.944, msg: 'D/2a = cosh(1.25) and 2a = 1 mm, so D = 1.89 mm (not D/a).' }]),
        NT(md`(b) $D$`, 6.132, 'mm', [{ v: 3.066, msg: 'You divided by 2: D = (2a)cosh(2.5) with 2a = 1 mm.' }]),
        NT(md`(c) $D$`, 21.27, 'mm'),
      ],
      hints: [md`$Z_0 = \eta_0/\text{GF} = \frac{120\pi}{\pi}\cosh^{-1}\frac{D}{2a} = 120\cosh^{-1}\frac{D}{2a}$.`],
      sol: md`
        **Step 1: Z₀ in terms of D.** As for the coax, $Z_0 = \sqrt{\mathcal L/\mathcal C} = \eta_0/\text{GF}$:
        $$Z_0 = \frac{120\pi}{\pi}\cosh^{-1}\frac{D}{2a} = 120\cosh^{-1}\frac{D}{2a}$$
        **Step 2: invert.**
        $$D = 2a\cosh\frac{Z_0}{120}$$
        **Step 3: the three cases** ($2a = 1$ mm):
        $$\boxed{(a)\ D = \cosh1.25 = 1.89\ \text{mm}}$$
        $$\boxed{(b)\ D = \cosh2.5 = 6.13\ \text{mm}}$$
        $$\boxed{(c)\ D = \cosh3.75 = 21.3\ \text{mm}}$$
        !!intuition Does this make sense?
          Farther apart wires have less capacitance and more inductance per meter, so $Z_0$ grows, but only logarithmically: tripling $Z_0$ from 150 to 450 Ω takes 11 times the spacing.

        **Speed path.** $Z_0 = 120\cosh^{-1}(D/2a)$, so $D = 2a\cosh(Z_0/120)$. Taught in [Topic 13](#/l/w5-telegraph).
      ` }),

    // ---------------------------------------------------------------- Problem 6
    R(md`
      ### Problem 6 · The telegrapher's equations, twice

      The voltage and current waves on a transmission line obey
      $$-\frac{\partial V}{\partial z} = \mathcal L\frac{\partial I}{\partial t}, \qquad -\frac{\partial I}{\partial z} = \mathcal C\frac{\partial V}{\partial t}$$
      On one line $V(z, t) = 4\cos(\omega t + \beta z)$. Find $I(z, t)$ and $\beta$ (a positive number) by using the telegrapher's equations twice: first one equation to get $I$ from $V$, then the other to get $V$ back from that $I$, and require that it match the original $V$.
    `),
    P({ src: 'HW 11 #6', title: 'I(z, t) and β',
      parts: [
        X(md`$\beta$`, 'w*sqrt(L*C)', { w: [1, 5], L: [0.5, 2], C: [0.5, 2] }),
        X(md`$I(z, t)$`, '-4*sqrt(C/L)*cos(w*t+w*sqrt(L*C)*z)', { w: [1, 3], L: [0.5, 2], C: [0.5, 2], t: [0, 2], z: [0, 2] }),
      ],
      q: md`Write $\beta$ and $I(z, t)$ in terms of $\omega$ (<code>w</code>), $\mathcal L$ (<code>L</code>), $\mathcal C$ (<code>C</code>), $t$ and $z$.`,
      hints: [md`$\partial V/\partial z = -4\beta\sin(\omega t + \beta z)$. Integrate $\partial I/\partial t$ in time, dropping any constant.`],
      sol: md`
        **Step 1: I from the first equation.** Differentiate $V$ in $z$:
        $$\frac{\partial V}{\partial z} = -4\beta\sin(\omega t + \beta z)$$
        The first equation says $\mathcal L\,\partial I/\partial t = -\partial V/\partial z$:
        $$\frac{\partial I}{\partial t} = \frac{4\beta}{\mathcal L}\sin(\omega t + \beta z)$$
        Integrate in $t$. The antiderivative of $\sin(\omega t + \ldots)$ is $-\frac1\omega\cos(\omega t + \ldots)$; drop the static constant (it is not part of the wave):
        $$I = -\frac{4\beta}{\omega\mathcal L}\cos(\omega t + \beta z)$$
        **Step 2: V back from the second equation.** Differentiate this $I$ in $z$:
        $$\frac{\partial I}{\partial z} = \frac{4\beta^2}{\omega\mathcal L}\sin(\omega t + \beta z)$$
        The second equation: $\mathcal C\,\partial V/\partial t = -\partial I/\partial z$:
        $$\frac{\partial V}{\partial t} = -\frac{4\beta^2}{\omega\mathcal L\mathcal C}\sin(\omega t + \beta z)$$
        Integrate in $t$:
        $$V = \frac{4\beta^2}{\omega^2\mathcal L\mathcal C}\cos(\omega t + \beta z)$$
        **Step 3: match.** This must be the $V = 4\cos(\omega t + \beta z)$ we started with:
        $$\frac{\beta^2}{\omega^2\mathcal L\mathcal C} = 1$$
        $$\boxed{\beta = \omega\sqrt{\mathcal L\mathcal C}}$$
        **Step 4: I.** Put $\beta$ into Step 1: $\frac{\beta}{\omega\mathcal L} = \frac{\sqrt{\mathcal L\mathcal C}}{\mathcal L} = \sqrt{\frac{\mathcal C}{\mathcal L}} = \frac1{Z_0}$:
        $$\boxed{I(z, t) = -\frac{4}{Z_0}\cos(\omega t + \beta z) = -4\sqrt{\frac{\mathcal C}{\mathcal L}}\cos(\omega t + \beta z)}$$
        !!intuition Does this make sense?
          $\omega t + \beta z$ travels toward $-z$, and a backward wave has $I = -V/Z_0$: the minus sign is the line's version of "$\mathbf H$ flips for a backward wave". The speed $\omega/\beta = 1/\sqrt{\mathcal L\mathcal C}$ is the line's $v$.

        **Speed path.** Backward wave: $\beta = \omega\sqrt{\mathcal L\mathcal C}$, $I = -V/Z_0$. Taught in [Topic 13](#/l/w5-telegraph).
      ` }),

    // ---------------------------------------------------------------- Problem 7
    RF(md`
      ### Problem 7 · An impulse, then a step, on a mismatched line

      A line has $Z_0 = 100\ \Omega$, length $l = 600$ m and speed $v = 1/\sqrt{\mathcal L\mathcal C} = c = 3\times10^8$ m/s. A source $f(t)$ with internal resistance $R_g = Z_0$ drives it at $z = 0$; the far end $z = l$ is terminated by $R_L = Z_0/4$.

      [[fig:c]]
    `, { c: { svg: tlFig(), cap: 'The circuit. One-way travel time $T = l/v = 2\\ \\mu$s.' } }),
    P({ src: 'HW 11 #7(a)–(b)', title: 'Bounce diagrams for an impulse, and V, I at l/4',
      q: md`(a) Draw the voltage and current bounce diagrams for $0 < z < l$, $t > 0$, with $f(t) = \delta(t)$. (b) Write $V(l/4, t)$ and $I(l/4, t)$ as weighted sums of delayed impulses.`,
      parts: [
        NT(md`$\tau_g$`, 0.5, ''),
        NT(md`$\Gamma_L$`, -0.6, '', [{ v: 0.6, msg: 'Γ_L = (R_L − Z₀)/(R_L + Z₀) is negative for R_L < Z₀.' }]),
        NT(md`weight of the second impulse in $V(l/4, t)$`, -0.3, 'V·s', [{ v: -0.6, msg: 'Multiply by τ_g = ½ too: ½ × (−0.6).' }]),
        NT(md`its arrival time at $z = l/4$`, 3.5, 'μs', [{ v: 4, msg: 'That is when it returns to z = 0. At l/4 it arrives 0.5 µs earlier.' }, { v: 2.5, msg: 'It must go to the load (1.5 µs more) and come back 1.5 µs: 0.5 + 1.5 + 1.5.' }]),
        NT(md`weight of the second impulse in $I(l/4, t)$`, 0.003, 'A·s', [{ v: -0.003, msg: 'A backward wave has I = −V/Z₀: −(−0.3)/100 = +0.003.' }]),
      ],
      hints: [md`$\tau_g = Z_0/(R_g + Z_0) = \frac12$; $\Gamma_g = 0$ (matched source); $\Gamma_L = (25 - 100)/(25 + 100) = -0.6$.`, md`$z = l/4 = 150$ m: the incident wave arrives at $150/300 = 0.5\ \mu$s, the reflected one at $(1200 - 150)/300 = 3.5\ \mu$s.`],
      sol: md`
        **Step 1: the coefficients.** The source sees $Z_0$ looking into the line, so it launches the fraction
        $$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac12$$
        of $f(t)$ (the **injection** coefficient, not a transmission coefficient). The ends reflect with
        $$\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0} = \frac{25 - 100}{125} = -0.6, \qquad \Gamma_g = \frac{R_g - Z_0}{R_g + Z_0} = 0$$
        $T = l/v = 600/(3\times10^8) = 2\ \mu$s.

        **Step 2: the waves.** The source launches $\frac12\delta(t - z/v)$. At $t = 2\ \mu$s it hits the load and returns as $-0.3\,\delta$. At $t = 4\ \mu$s it reaches the matched source and is absorbed ($\Gamma_g = 0$). Nothing else ever moves:
        $$V(z, t) = \tfrac12\delta\!\left(t - \tfrac zv\right) - 0.3\,\delta\!\left(t - \tfrac{2l - z}{v}\right)$$
        Currents: forward $I = V^+/Z_0$, backward $I = -V^-/Z_0$:
        $$I(z, t) = 0.005\,\delta\!\left(t - \tfrac zv\right) + 0.003\,\delta\!\left(t - \tfrac{2l - z}{v}\right)$$
        [[fig:bd]]

        **Step 3 (b): at z = l/4 = 150 m.** $z/v = 0.5\ \mu$s and $(2l - z)/v = 1050/300 = 3.5\ \mu$s:
        $$\boxed{V(\tfrac l4, t) = 0.5\,\delta(t - 0.5\,\mu\text{s}) - 0.3\,\delta(t - 3.5\,\mu\text{s})}$$
        $$\boxed{I(\tfrac l4, t) = 0.005\,\delta(t - 0.5\,\mu\text{s}) + 0.003\,\delta(t - 3.5\,\mu\text{s})}$$
        (weights in V·s and A·s for an input $\delta(t)$ of 1 V·s).

        [[fig:v]]

        **Speed path.** $\tau_g = \frac12$, $\Gamma_L = -0.6$, $\Gamma_g = 0$: exactly two waves. Arrival times $z/v$ and $(2l - z)/v$; backward current flips sign. Taught in [Topic 14](#/l/w5-launch) and [Topic 15](#/l/w5-bounce).
      `,
      figs: { bd: { svg: fig11bd.svg }, v: fig11dV } }),
    P({ src: 'HW 11 #7(c)–(d)', title: 'The step response at l/4, and the steady state',
      q: md`(c) Plot $V(l/4, t)$ for $0 < t < 13\ \mu$s with $f(t) = 10u(t)$ V (convolve the result of (b) with $10u(t)$). (d) Find the steady-state voltage and current on the line for this excitation.`,
      parts: [
        NT(md`$V(l/4, t)$ for $0.5 < t < 3.5\ \mu$s`, 5, 'V'),
        NT(md`$V(l/4, t)$ for $t > 3.5\ \mu$s`, 2, 'V', [{ v: -3, msg: 'That is the second step alone. It adds to the 5 V already there.' }]),
        NT(md`(d) steady-state $I$`, 0.08, 'A', [{ v: 0.05, msg: 'That is only the first wave, 5/100. Add the reflected current +0.03.' }]),
      ],
      hints: [md`Convolving $\delta(t - t_0)$ with $10u(t)$ gives $10u(t - t_0)$.`, md`DC: the line is just wire. $V = 10\frac{R_L}{R_g + R_L}$.`],
      sol: md`
        **(c)** Convolution with $10u(t)$ turns each delayed impulse into a delayed step of 10 times its weight:
        $$V(\tfrac l4, t) = 5u(t - 0.5\,\mu\text{s}) - 3u(t - 3.5\,\mu\text{s})\ \text{V}$$
        So $V = 0$ until 0.5 µs, then $5$ V, then from 3.5 µs on $5 - 3 = 2$ V, and it stays there (the source is matched, so no more waves come).

        [[fig:s]]

        **(d)** In the steady state nothing changes in time and the line is just two wires. The source sees $R_g$ in series with $R_L$:
        $$\boxed{I = \frac{10}{100 + 25} = 0.08\ \text{A}}$$
        $$\boxed{V = (0.08)(25) = 2\ \text{V}}$$
        everywhere on the line. Check with the waves: $V = 5 + (-3) = 2$ ✓ and $I = 0.05 + 0.03 = 0.08$ ✓. Here the steady state is reached after a single round trip because $\Gamma_g = 0$.

        **Speed path.** Steps of $10\tau_g = 5$ and $5\Gamma_L = -3$; DC from the resistor divider. Taught in [Topic 15](#/l/w5-bounce) and [Topic 14](#/l/w5-launch).
      `,
      figs: { s: fig11step } }),
  ];
  EM.lesson('e3-hw', { id: 'e3-hw11', order: 11, kind: 'hw', title: 'Homework 11', sub: 'Reflection of a circular wave, a dielectric boundary, a PEC, coax and twin lead, the telegrapher’s equations, a bounce diagram', steps: hw11 });
})();

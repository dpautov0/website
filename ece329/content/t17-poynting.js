/* Topic 17 — Power flow: Poynting vector and energy (Lectures 19–20). S = E × H along the direction of travel; the
   energy densities w_e = w_m of a plane wave and S = v_p w; Poynting's theorem and the meaning of its three terms; the
   power a current sheet delivers, −J_s·E, split equally into its two waves; instantaneous versus time-averaged power
   for sinusoids, ⟨S⟩ = E0²/2η; Lecture 20's power calculations and challenge question; HW 7 #6(c)(d). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;
  const ETA0 = EM.eta0, CC = EM.c, EPS0 = EM.eps0;

  // ---------------------------------------------------------------- helpers
  const AX = ['x', 'y', 'z'];
  const uv = (i, s = 1) => { const v = [0, 0, 0]; v[i] = s; return v; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const neg = (v) => v.map((c) => -c);
  const vt = (v) => { const i = v.findIndex((c) => c !== 0); return `${v[i] > 0 ? '+' : '-'}\\hat ${AX[i]}`; };
  const opt = (v) => `$${vt(v)}$`;
  const med = (er) => (er === 1 ? 'free space' : `a lossless dielectric with $\\epsilon_r = ${er}$, $\\mu_r = 1$`);
  const W = (x, u) => `$${p(+x.toPrecision(3))}$ ${u}`;          // a number with its unit, for options

  // ---------------------------------------------------------------- figures
  // the course's sheet edge-on with the power flow of each wave
  function sheetPowerFig() {
    const g = PF.fig({ alt: 'a current sheet seen edge-on; Poynting vectors point away from it on both sides, each carrying eta J_s squared over 4, while the sheet delivers eta J_s squared over 2' });
    const X = 160;
    g.sheet(X, 24, 176);
    g.head(X, 76, 0, 1, { hs: 9 }); g.head(X, 136, 0, 1, { hs: 9 });
    g.label(X + 7, 26, '\\mathbf J_s', 'tl');
    g.arrow(214, 128, 214, 76, { cls: 'thick', hs: 8 }); g.label(214, 70, '\\mathbf E', 'b');
    g.odot(244, 102, 7, { lab: '\\mathbf H', at: 'b' });
    g.arrow(262, 102, 320, 102, { cls: 'thick', hs: 9 }); g.label(292, 96, '\\mathbf S', 'b');
    g.label(292, 120, '\\tfrac{\\eta}{4}J_s^2', 't', 'small');
    g.arrow(106, 128, 106, 76, { cls: 'thick', hs: 8 }); g.label(106, 70, '\\mathbf E', 'b');
    g.otimes(76, 102, 7, { lab: '\\mathbf H', at: 'b' });
    g.arrow(58, 102, 0, 102, { cls: 'thick', hs: 9 }); g.label(28, 96, '\\mathbf S', 'b');
    g.label(28, 120, '\\tfrac{\\eta}{4}J_s^2', 't', 'small');
    g.label(X, 186, '-\\mathbf J_s\\cdot\\mathbf E = \\tfrac{\\eta}{2}J_s^2', 't', 'small');
    return g.svg();
  }
  // a column of field energy sliding through an area A: in dt, the energy w·A·v_p dt crosses it
  function columnFig() {
    const g = PF.fig({ alt: 'a box of cross-section A and length v_p dt sliding through the area A at speed v_p' });
    g.rect(60, 40, 120, 70, { cls: 'shade' });
    g.rect(60, 40, 120, 70);
    g.line(180, 30, 180, 120, { cls: 'thick' });
    g.label(186, 34, 'A', 'tl');
    g.arrow(110, 75, 158, 75, { hs: 8 }); g.label(112, 70, 'v_p', 'br');
    g.dim(60, 128, 180, 128, 'v_p\\,dt', { at: 'b' });
    g.label(120, 34, 'w = \\epsilon E^2', 'b', 'small');
    return g.svg();
  }
  // instantaneous power of a sinusoidal wave at a fixed point, with its average
  const cos2Fig = () => PF.plot({
    w: 320, h: 150, x: [0, 2], y: [0, 1.25], xl: 't/T', yl: 'S/S_{\\max}',
    xt: [[0.5, '\\tfrac12'], [1, '1'], [1.5, '\\tfrac32'], [2, '2']], yt: [[1, '1'], [0.5, '\\tfrac12']],
    curves: [{ f: (t) => Math.cos(2 * Math.PI * t) ** 2 }], hlines: [[0.5, '\\langle S\\rangle']],
  });

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u5', {
    id: 't17-poynting', topic: 17, ref: 'Lectures 19–20', title: 'Power flow: Poynting vector and energy',
    steps: [
      R(md`
        !!key Why you care
          Lecture 20 works the exam's kind of power question: instantaneous and time-averaged power through 1 m², and a challenge question on the energy in a slab of space. HW 7 #6(c)(d) asks for the maximum of $\mathbf E\times\mathbf H$ and the path of its peak. Any sheet problem can end with "how much power does the sheet deliver?" The usual losses: quoting the peak as the average, forgetting the second wave, and a reversed cross product.

        ### Notation

        - $\mathbf S = \mathbf E\times\mathbf H$: the **Poynting vector**, in W/m² (V/m × A/m). Its direction is the direction energy flows; its size is the power per unit area through a surface facing it.
        - $A$, $d\mathbf A$: a surface and its vector area element. $P = \int_A\mathbf S\cdot d\mathbf A$ is the power through it, in W. For a closed surface with outward $d\mathbf A$, $\oint_A\mathbf S\cdot d\mathbf A$ is the power flowing **out**.
        - $w_e = \tfrac12\epsilon E^2$, $w_m = \tfrac12\mu H^2$: electric and magnetic energy densities, J/m³.
        - $\mathbf J\cdot\mathbf E$: power per unit volume the field gives to the charges, W/m³. In a conductor $\mathbf J = \sigma\mathbf E$ and $\mathbf J\cdot\mathbf E = \sigma E^2 \ge 0$ (heat).
        - $\langle g\rangle = \tfrac1T\int_0^Tg\,dt$: the time average over one period $T$.
        - $\eta$, $v_p$, $E_0$, $H_0$, $\omega$, $\beta$ as in [Topic 16](#/l/t16-sinusoids); $\mathbf J_s$ as in [Topic 15](#/l/t15-sheet-waves).

        ### The idea

        Fields store energy, $w_e + w_m$ per cubic meter, and they move it: the flow per unit area is $\mathbf S = \mathbf E\times\mathbf H$. A uniform plane wave carries its energy along its direction of travel:
        $$|\mathbf S| = |\mathbf E||\mathbf H| = \frac{E^2}{\eta} = \eta H^2$$
        Energy is conserved: what flows into a region either piles up as stored field energy or is handed to charges ($\mathbf J\cdot\mathbf E$). That bookkeeping is Poynting's theorem.
      `),
      R(md`
        ### Step 1: the Poynting vector

        $\mathbf S = \mathbf E\times\mathbf H$ at one point and one instant. In a plane wave $\mathbf E\perp\mathbf H$, so $|\mathbf S| = EH$, and the pairing rule ($\mathbf E\times\mathbf H$ along the travel) makes $\mathbf S$ point along $\hat k$.

        For the course's sheet on $z > 0$: $\mathbf E = \tfrac\eta2J_s\hat x$, $\mathbf H = \tfrac12J_s\hat y$, so
        $$\mathbf S = \frac\eta4J_s^2\,\hat z\ \ \text{W/m}^2$$
        On $z < 0$ the same magnitude points along $-\hat z$: both waves carry energy away from the sheet.
      `),
      Q(md`**Predict.** In free space, $\mathbf E = 754\cos(\omega t + \beta y)\,\hat x$ V/m. The peak of $\mathbf S$ is…`,
        ['1508 W/m² along $-\\hat y$', '1508 W/m² along $+\\hat y$', '754 W/m² along $-\\hat y$', '$2.1\\times10^8$ W/m² along $-\\hat y$'], 0,
        [null, 'Equal signs on $t$ and $y$: the wave, and its energy, travel toward $-y$.', 'That is $E_0^2/2\\eta_0$, the time average, not the peak.', 'That multiplies by $\\eta_0$; $|S| = E^2/\\eta_0$.'],
        md`$H_0 = 754/377 = 2$ A/m, so $S_{\max} = E_0H_0 = E_0^2/\eta_0 = 1508$ W/m², along the travel direction $-\hat y$. Check: $\mathbf H = \tfrac1{\eta_0}(-\hat y)\times\mathbf E \propto -\hat y\times\hat x = +\hat z$, and $\hat x\times\hat z = -\hat y$ ✓.`),
      RF(md`
        ### Step 2: where the energy is

        $w_e = \tfrac12\epsilon E^2$ and $w_m = \tfrac12\mu H^2$. In a plane wave $E = \eta H$, so
        $$w_e = \tfrac12\epsilon\eta^2H^2 = \tfrac12\epsilon\frac{\mu}{\epsilon}H^2 = \tfrac12\mu H^2 = w_m$$
        The energy is split **equally** between $\mathbf E$ and $\mathbf H$, at every point and instant. The total is $w = \epsilon E^2 = \mu H^2$.

        [[fig:col]]

        That energy slides along at $v_p$. In a time $dt$ a column of length $v_p\,dt$ crosses an area $A$, carrying $w\,A\,v_p\,dt$. So the power per unit area is
        $$S = v_p\,w = v_p(w_e + w_m)$$
        Check: $v_p\epsilon E^2 = \dfrac{\epsilon E^2}{\sqrt{\mu\epsilon}} = E^2\sqrt{\epsilon/\mu} = E^2/\eta$ ✓.
      `, { col: { svg: columnFig(), cap: 'In a time $dt$ the energy in a column of length $v_p\\,dt$ crosses the area $A$: $S = wv_p$.' } }),
      Q(md`**Predict.** At some point in a free-space plane wave, $E = 300$ V/m (so $H = 0.8$ A/m). Compare $w_e$ and $w_m$.`,
        ['They are equal', '$w_e \\gg w_m$, because $E \\gg H$', '$w_m \\gg w_e$, because $\\mu_0 \\gg \\epsilon_0$', '$w_m = 0$ in free space'], 0,
        [null, 'The numbers 300 and 0.8 are in different units; $\\epsilon_0$ is small and $\\mu_0$ is (comparatively) large, and they compensate exactly.', '$\\mu_0H^2$ and $\\epsilon_0E^2$ are equal because $E/H = \\sqrt{\\mu_0/\\epsilon_0}$.', 'A magnetic field stores energy anywhere, vacuum included.'],
        md`$w_e = \tfrac12(8.854\times10^{-12})(300)^2 = 3.98\times10^{-7}$ J/m³ and $w_m = \tfrac12(4\pi\times10^{-7})(0.796)^2 = 3.98\times10^{-7}$ J/m³.`),
      R(md`
        ### Step 3: Poynting's theorem

        Start from $\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)$ and put in the two curl equations, $\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$ and $\nabla\times\mathbf H = \mathbf J + \epsilon\,\partial\mathbf E/\partial t$:
        $$\nabla\cdot\mathbf S = -\frac{\partial}{\partial t}\left(\tfrac12\epsilon E^2 + \tfrac12\mu H^2\right) - \mathbf J\cdot\mathbf E$$
        Integrate over a volume $V$ and use the divergence theorem:
        $$\oint_A\mathbf S\cdot d\mathbf A + \frac{d}{dt}\int_V(w_e + w_m)\,dV = -\int_V\mathbf J\cdot\mathbf E\,dV$$

        | Term | Meaning | Sign |
        |---|---|---|
        | $\oint_A\mathbf S\cdot d\mathbf A$ | power flowing **out** through the closed surface | + or − |
        | $\frac{d}{dt}\int_V(w_e + w_m)dV$ | rate the stored field energy grows | + or − |
        | $\int_V\mathbf J\cdot\mathbf E\,dV$ | power the field gives to charges | $> 0$ in a resistor ($\sigma E^2$); $< 0$ in a source; 0 in vacuum or a perfect dielectric |

        Read it as: power out + energy piling up = power supplied by the charges ($-\mathbf J\cdot\mathbf E$). A source pushes its current **against** $\mathbf E$, so $\mathbf J\cdot\mathbf E < 0$ there.
      `),
      Q(md`**Predict.** A closed surface in free space encloses no charges or currents. At some instant the net Poynting flux **out** of it is positive. Then the field energy inside is…`,
        ['decreasing', 'increasing', 'constant', 'zero'], 0,
        [null, 'With $\\mathbf J = 0$ inside, the energy that flows out must come from the stored energy.', 'It would be constant only if the net flux were zero.', 'Energy is flowing out of it, so there was some inside.'],
        md`With $\mathbf J = 0$: $\oint\mathbf S\cdot d\mathbf A = -\tfrac{d}{dt}\int(w_e + w_m)dV$. Positive outflow means the stored energy drops.`),
      RF(md`
        ### Step 4: the power a current sheet delivers

        At the sheet, $-\mathbf J_s\cdot\mathbf E$ is the power per unit area the current hands to the field (a surface version of $-\mathbf J\cdot\mathbf E$). For the course's sheet, $\mathbf J_s = -J_s\hat x$ and $\mathbf E(0) = \tfrac\eta2J_s\hat x$:
        $$-\mathbf J_s\cdot\mathbf E = \frac{\eta}{2}J_s^2\ \ \text{W/m}^2$$
        Each wave carries $|\mathbf S| = \big(\tfrac\eta2J_s\big)\big(\tfrac12J_s\big) = \tfrac\eta4J_s^2$ away from the sheet. Two waves: $2\times\tfrac\eta4J_s^2 = \tfrac\eta2J_s^2$ ✓. That is Poynting's theorem for a thin box around the sheet, which stores no energy: the source term equals the outflow through its two faces.

        [[fig:pow]]
      `, { pow: { svg: sheetPowerFig(), cap: 'The sheet does work $-\\mathbf J_s\\cdot\\mathbf E = \\tfrac\\eta2J_s^2$ per m²; half leaves on each side as $S = \\tfrac\\eta4J_s^2$.' } }),
      Q(md`**Predict.** A sheet in free space carries $|\mathbf J_s| = 2$ A/m during a long, flat pulse. While the pulse lasts, the power per square meter of sheet that it delivers is…`,
        ['754 W/m²', '377 W/m²', '1508 W/m²', '2 W/m²'], 0,
        [null, 'That is one wave. The sheet feeds two.', 'That is $\\eta_0J_s^2$; each wave has $E = \\tfrac{\\eta_0}{2}J_s$ and $H = \\tfrac12J_s$.', 'That is $J_s^2/2$ without the impedance; $\\eta_0$ converts it to watts.'],
        md`$-\mathbf J_s\cdot\mathbf E = \tfrac{\eta_0}{2}J_s^2 = (60\pi)(4) = 754$ W/m²: 377 W/m² into each wave.`),
      RF(md`
        ### Step 5: instantaneous and time-averaged power

        For $\mathbf E = E_0\cos(\omega t - \beta z)\,\hat x$, $\mathbf H = \tfrac{E_0}{\eta}\cos(\omega t - \beta z)\,\hat y$ (in phase):
        $$\mathbf S = \frac{E_0^2}{\eta}\cos^2(\omega t - \beta z)\,\hat z \qquad \langle\mathbf S\rangle = \frac{E_0^2}{2\eta}\,\hat z = \frac{\eta H_0^2}{2}\,\hat z$$
        The instantaneous power swings between 0 and $E_0^2/\eta$ at **twice** the wave's frequency and is never negative: a traveling wave never sends energy backward. Since $\langle\cos^2\rangle = \tfrac12$, the average is half the peak.

        [[fig:cos2]]

        **Lecture 20's numbers.** $\mathbf H = H_0\cos(6\pi\times10^7t - 0.2\pi z)\,\hat y$ A/m travels toward $+z$ in free space ($v_p = \omega/\beta = 3\times10^8$ m/s), so $\mathbf E = \eta_0H_0\cos(\ldots)\,\hat x$ and $\mathbf S = \eta_0H_0^2\cos^2(\ldots)\,\hat z$. Through 1 m² of the plane $z = 0$:
        - at $t = 0$: $P = \eta_0H_0^2 = 120\pi H_0^2$ W;
        - at $t = \tfrac18$ µs: the phase is $6\pi\times10^7\times1.25\times10^{-7} = 7.5\pi$ and $\cos(7.5\pi) = 0$, so $P = 0$;
        - on average: $\langle P\rangle = \tfrac12\eta_0H_0^2 = 60\pi H_0^2$ W.

        A sinusoidal sheet, $\mathbf J_s = -J_0\cos(\omega t)\hat x$: each wave averages $\tfrac{\eta}{2}\big(\tfrac{J_0}{2}\big)^2 = \tfrac{\eta J_0^2}{8}$, and the sheet delivers $\tfrac{\eta J_0^2}{4}$ in all.
      `, { cos2: { svg: cos2Fig(), cap: 'At a fixed point $S$ swings between 0 and $S_{\\max}$ twice per period; its average is $S_{\\max}/2$.' } }),
      Q(md`**Predict.** A sheet $\mathbf J_s = -J_0\cos(\omega t)\,\hat x$ with $J_0 = 2$ A/m sits in free space. The time-averaged power per square meter leaving it (both sides together) is…`,
        ['377 W/m²', '754 W/m²', '188.5 W/m²', '1508 W/m²'], 0,
        [null, 'That is the peak, $\\tfrac{\\eta_0}{2}J_0^2$. Average $\\cos^2$: a factor $\\tfrac12$.', 'That is one side: $\\eta_0J_0^2/8$.', 'That is $\\eta_0J_0^2$: no ½ for the split and no ½ for the average.'],
        md`$\langle-\mathbf J_s\cdot\mathbf E\rangle = \tfrac{\eta_0}{2}J_0^2\langle\cos^2\rangle = \tfrac{\eta_0J_0^2}{4} = \tfrac{377\times4}{4} = 377$ W/m².`),
      R(md`
        ### Step 6: energy in a slab of space (Lecture 20's challenge)

        In the free-space region $x > 0$, $\mathbf H = H_0\cos(ct + x)\,\hat y$ A/m and $\mathbf E = \eta_0H_0\cos(ct + x)\,\hat z$ V/m. Read it: $\omega = c$ (numerically, $3\times10^8$ rad/s), $\beta = 1$ rad/m, $\lambda = 2\pi$ m; $\mathbf S = \eta_0H_0^2\cos^2(ct + x)\,(\hat z\times\hat y) = -\eta_0H_0^2\cos^2(ct + x)\,\hat x$, toward $-x$.

        Take the slab $V$ between the planes $x = 0$ and $x = 1$ m (per square meter of face):
        - **Net outflow:** energy enters at $x = 1$ and leaves at $x = 0$, but the two faces are 1 rad of phase apart, so the instantaneous flows differ: net outflow $\eta_0H_0^2[\cos^2(ct) - \cos^2(ct + 1)]$, not zero.
        - **Work:** free space has $\mathbf J = 0$, so the fields do no work on anything.
        - **Stored energy:** with no work done, the stored energy changes exactly as the net inflow says; it oscillates (the slab is not a whole number of half-wavelengths, the period of $\cos^2$).
        - **Averages:** $\langle w_e\rangle = \tfrac12\epsilon_0\eta_0^2H_0^2\langle\cos^2\rangle = \tfrac14\epsilon_0\eta_0^2H_0^2$ at every $x$.
        - **At a fixed point:** $w_e + w_m = \epsilon_0\eta_0^2H_0^2\cos^2(ct + x)$ swings between 0 and its peak.
      `),
      Q(md`**Predict.** For that wave and the slab $0 < x < 1$ m, which statement is true?`,
        ['The time-averaged electric energy density is the same at every $x$', 'The net outward power flow is zero at all times', 'The fields do work and so lose energy', 'The total electric field energy inside is constant in time', 'The total energy density at a fixed $x$ is constant in time'], 0,
        [null, 'The faces are 1 rad of phase apart, so the flow in at $x = 1$ and the flow out at $x = 0$ differ at most instants.', 'Free space has $\\mathbf J = 0$: no work is done, $\\mathbf J\\cdot\\mathbf E = 0$.', '$\\int_0^1\\cos^2(ct + x)\\,dx$ depends on $t$, because 1 m is not a whole number of half-wavelengths.', '$w = \\epsilon_0\\eta_0^2H_0^2\\cos^2(ct + x)$ oscillates at a fixed point; only its average is constant.'],
        md`$\langle w_e\rangle = \tfrac12\epsilon_0\eta_0^2H_0^2\cdot\tfrac12$, independent of $x$: Lecture 20's answer (d). The instantaneous quantities all oscillate.`),
      R(md`
        ### The method

        !!method Power and energy in five steps
          1. **Fields.** Write $\mathbf E$ and $\mathbf H$ as vectors at the **same** point and instant (for a plane wave, $\mathbf H = \tfrac1\eta\hat k\times\mathbf E$).
          2. **Poynting vector:** $\mathbf S = \mathbf E\times\mathbf H$; check it points along the travel. Plane wave: $|\mathbf S| = E^2/\eta = \eta H^2$.
          3. **Power through an area** $A$ with normal $\hat n$: $P = (\mathbf S\cdot\hat n)A$ for uniform $\mathbf S$. The sign says which way it flows.
          4. **Sinusoids:** average with $\langle\cos^2\rangle = \tfrac12$: $\langle S\rangle = E_0^2/2\eta = \eta H_0^2/2$, half the peak.
          5. **Bookkeeping:** $w = w_e + w_m = \epsilon E^2$ and $S = v_pw$; Poynting's theorem for closed surfaces; a sheet delivers $-\mathbf J_s\cdot\mathbf E = \tfrac\eta2J_s^2$, half to each side.

        ### Worked example

        !!graded Problem
          A sheet on $z = 0$ in a lossless dielectric with $\epsilon_r = 4$, $\mu_r = 1$ carries $\mathbf J_s = -0.5\cos(2\pi\times10^6t)\,\hat x$ A/m. Find (a) $\mathbf E$, $\mathbf H$ and $\mathbf S$ on $z > 0$; (b) the time-averaged power per square meter on each side, and the total delivered by the sheet; (c) the average power through a 2 m × 3 m window parallel to the sheet at $z = -100$ m, and its direction; (d) the average energy density.

        **1. Medium.** $\eta = 120\pi/2 = 60\pi = 188.5\ \Omega$; $v_p = c/2 = 1.5\times10^8$ m/s; $\beta = \omega/v_p = 0.0419$ rad/m.

        **2. Fields** ($z > 0$). $E_0 = \tfrac\eta2J_0 = (94.2\ \Omega)(0.5\ \text{A/m}) = 47.1$ V/m, $H_0 = J_0/2 = 0.25$ A/m:
        $$\mathbf E = 47.1\cos(\omega t - \beta z)\,\hat x\ \text{V/m} \qquad \mathbf H = 0.25\cos(\omega t - \beta z)\,\hat y\ \text{A/m}$$
        $$\mathbf S = \mathbf E\times\mathbf H = 11.8\cos^2(\omega t - \beta z)\,\hat z\ \ \text{W/m}^2$$

        **3. Averages.** Each side: $\langle S\rangle = \tfrac12E_0H_0 = \tfrac12(47.1)(0.25) = 5.89$ W/m². Total: $11.8$ W/m². Check against the source: $\langle-\mathbf J_s\cdot\mathbf E\rangle = \tfrac\eta2J_0^2\cdot\tfrac12 = \tfrac{(188.5)(0.25)}{4} = 11.8$ W/m² ✓.

        **4. Window.** The wave on $z < 0$ has the same $\langle S\rangle$, along $-\hat z$, at every distance: $\langle P\rangle = (5.89\ \text{W/m}^2)(6\ \text{m}^2) = 35.3$ W, toward $-z$ (away from the sheet). The 100 m does not matter.

        **5. Energy density.** $\langle w\rangle = \langle S\rangle/v_p = 5.89/(1.5\times10^8) = 3.93\times10^{-8}$ J/m³. Check: $\langle\epsilon E^2\rangle = \tfrac12(4)(8.854\times10^{-12})(47.1)^2 = 3.93\times10^{-8}$ J/m³ ✓.

        !!mistake Common mistakes
          - Quoting the peak $E_0H_0$ as the average. The average of a sinusoid's power is half the peak.
          - Using $\eta_0$ in a dielectric: $\eta = \eta_0/\sqrt{\epsilon_r}$ (for $\mu_r = 1$).
          - Forgetting the second wave: a sheet delivers twice what one side carries.
          - Writing $\mathbf H\times\mathbf E$: that points against the flow.
          - Combining $\mathbf E$ and $\mathbf H$ from different points or instants.
          - Expecting $w_e > w_m$ because $E$ is numerically large. In a plane wave they are equal.
          - Sign of $\mathbf J\cdot\mathbf E$: positive in a resistor, negative in a source.

        ### Check questions
      `),
      Q(md`HW 7 #6: a $z$-polarized wave in vacuum travels toward $-x$ with $E_z(0, t) = 2\triangle(t/\tau)$ V/m, a triangle of peak 2 V/m. The maximum of $\mathbf E\times\mathbf H$ is…`,
        ['10.6 mW/m² along $-\\hat x$', '10.6 mW/m² along $+\\hat x$', '5.3 mW/m² along $-\\hat x$', '1508 W/m² along $-\\hat x$'], 0,
        [null, 'The wave travels toward $-x$, and so does its energy.', 'That halves it: the half belongs to sinusoid averages. This asks for the peak, $E_{\\max}^2/\\eta_0$.', 'That multiplies by $\\eta_0$: $E^2\\eta_0$ instead of $E^2/\\eta_0$.'],
        md`$H_{\max} = 2/377 = 5.31$ mA/m, $|\mathbf S|_{\max} = (2)(5.31\times10^{-3}) = 4/120\pi = 1/30\pi = 10.6$ mW/m², along $\hat z\times\hat y = -\hat x$.`),
      Q(md`For the same HW 7 #6 wave, the peak of $\mathbf E\times\mathbf H$ is at…`,
        ['$x = -ct$', '$x = +ct$', '$x = -c(t - \\tau)$', '$x = 0$ at all times'], 0,
        [null, 'The wave travels toward $-x$.', 'The peak of $\\triangle(t/\\tau)$ is at $t = 0$, not at $t = \\tau$.', 'The pulse moves; $x = 0$ only sees it pass at $t = 0$.'],
        md`$E_z = 2\triangle\big((t + x/c)/\tau\big)$ peaks where $t + x/c = 0$: $x(t) = -ct$, a point moving toward $-x$ at $c$.`),
      Q(md`A standing wave $E_x = 2E_0\cos(\omega t)\cos(\beta z)$ (two equal waves going opposite ways). Its time-averaged Poynting vector is…`,
        ['zero everywhere', '$E_0^2/2\\eta$ along $+z$', '$E_0^2/\\eta$ along $+z$', '$2E_0^2/\\eta$, alternating direction'], 0,
        [null, 'That is one of the two waves; the other carries the same back.', 'The two waves cancel each other\'s average flow.', 'Instantaneously $\\mathbf S$ sloshes back and forth, but its average is zero.'],
        md`$H_y = (2E_0/\eta)\sin(\omega t)\sin(\beta z)$, so $S_z = (E_0^2/\eta)\sin(2\omega t)\sin(2\beta z)$: zero on average. Energy sloshes but does not travel.`),
      Q(md`Two free-space plane waves have amplitudes $E_0$ and $2E_0$. The second carries…`,
        ['four times the average power', 'twice the average power', 'the same power, since both travel at $c$', 'half the power, since $\\eta$ is fixed'], 0,
        [null, 'Power goes as $E^2$, not $E$.', 'Speed is the same, but the energy density is four times larger.', '$\\langle S\\rangle = E_0^2/2\\eta$ grows with the amplitude.'],
        md`$\langle S\rangle = E_0^2/2\eta_0$: doubling $E_0$ multiplies it by 4.`),
      Q(md`A plane wave travels along $+\hat z$. The power through a flat area whose normal is $\hat x$ is…`,
        ['zero', '$\\langle S\\rangle A$', '$\\langle S\\rangle A/\\sqrt2$', 'negative'], 0,
        [null, '$\\mathbf S\\cdot\\hat x = 0$: the energy flows parallel to the area, not through it.', 'There is no tilt; $\\mathbf S$ lies in the area\'s plane.', '$\\mathbf S\\cdot\\hat n$ is zero, not negative.'],
        md`$P = \int\mathbf S\cdot d\mathbf A = S_xA = 0$.`),
      Q(md`In Poynting's theorem, a region where $\mathbf J\cdot\mathbf E < 0$ is…`,
        ['a source: its charges give energy to the field', 'a resistor heating up', 'a region where the stored energy must be decreasing', 'impossible'], 0,
        [null, 'A resistor has $\\mathbf J = \\sigma\\mathbf E$, so $\\mathbf J\\cdot\\mathbf E = \\sigma E^2 \\ge 0$.', 'The energy it supplies can flow out or be stored; nothing forces the stored energy down.', 'Every battery, generator and current sheet does it.'],
        md`$-\mathbf J\cdot\mathbf E > 0$ is power supplied to the field: current pushed against $\mathbf E$, as in a battery or the current sheet.`),
      Q(md`A plane wave in a dielectric with $\epsilon_r = 4$ ($\mu_r = 1$). Compare its $w_e$ and $w_m$.`,
        ['equal', '$w_e = 4w_m$', '$w_e = 2w_m$', '$w_m = 4w_e$'], 0,
        [null, '$\\epsilon$ is four times larger, but $H = E/\\eta$ is twice as large too, and $\\mu H^2 = \\epsilon E^2$ exactly.', 'In any lossless medium $E = \\eta H$ makes the two equal.', 'In any lossless medium $E = \\eta H$ makes the two equal.'],
        md`$\tfrac12\epsilon E^2 = \tfrac12\epsilon\eta^2H^2 = \tfrac12\mu H^2$ for any $\epsilon$, $\mu$.`),
      Q(md`Lecture 20: for $\mathbf H = H_0\cos(6\pi\times10^7t - 0.2\pi z)\hat y$ A/m, the instantaneous power through 1 m² of the plane $z = 0$ at $t = \tfrac18$ µs is…`,
        ['0 W', '$120\\pi H_0^2$ W', '$60\\pi H_0^2$ W', '$-120\\pi H_0^2$ W'], 0,
        [null, 'That is the value at $t = 0$, where $\\cos^2 = 1$.', 'That is the average.', 'A single traveling wave never flows backward: $\\cos^2 \\ge 0$.'],
        md`Phase $= 6\pi\times10^7\times1.25\times10^{-7} = 7.5\pi$; $\cos(7.5\pi) = 0$, so $P = 120\pi H_0^2\cos^2(7.5\pi) = 0$.`),
      R(md`
        ### Rapid fire: directions and ideas

        **The trick:** $\mathbf S = \mathbf E\times\mathbf H$ points along the travel; $\mathbf H$ follows from $\hat k\times\mathbf E$; power through a surface uses only the normal part of $\mathbf S$.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t17_dir', { need: 8 }), { id: 't17-poynting.r0' }),
      R(md`
        ### Rapid fire: how many watts

        **The trick:** $\langle S\rangle = E_0^2/2\eta = \eta H_0^2/2$; the peak is twice that; $P = SA$; $w = S/v_p$; a sheet gives $\tfrac\eta2J_s^2$, half per side.
      `),
      Object.assign(G('rf_t17_num', { need: 8 }), { id: 't17-poynting.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t17_sheet', { need: 2 }),
      G('t17_window', { need: 2 }),
      G('t17_pulse', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  GENS.rf_t17_dir = () => one([
    // S from E and H
    () => {
      const a = ri(0, 2), b = pick([0, 1, 2].filter((i) => i !== a)), E = uv(a, pick([1, -1])), H = uv(b, pick([1, -1])), S = cross(E, H);
      return MC('Which way does energy flow?', md`At some point, $\mathbf E$ is along $${vt(E)}$ and $\mathbf H$ along $${vt(H)}$. $\mathbf S$ points along…`, opt(S),
        [[opt(neg(S)), 'That is $\\mathbf H\\times\\mathbf E$; the Poynting vector is $\\mathbf E\\times\\mathbf H$.'], [opt(E), '$\\mathbf S$ is perpendicular to $\\mathbf E$.'], [opt(H), '$\\mathbf S$ is perpendicular to $\\mathbf H$.']],
        md`$(${vt(E)})\times(${vt(H)}) = ${vt(S)}$.`);
    },
    // H from E and the travel direction
    () => {
      const ku = ri(0, 2), k = uv(ku, pick([1, -1])), e = pick([0, 1, 2].filter((i) => i !== ku)), E = uv(e, pick([1, -1])), H = cross(k, E);
      return MC('H for a given flow', md`A plane wave carries energy toward $${vt(k)}$. Where $\mathbf E$ points along $${vt(E)}$, $\mathbf H$ points along…`, opt(H),
        [[opt(neg(H)), 'Then $\\mathbf E\\times\\mathbf H$ would point against the flow.'], [opt(k), '$\\mathbf H$ is perpendicular to the travel direction.'], [opt(E), '$\\mathbf H$ is perpendicular to $\\mathbf E$.']],
        md`$\mathbf H \propto \hat k\times\mathbf E = (${vt(k)})\times(${vt(E)}) = ${vt(H)}$. Check: $(${vt(E)})\times(${vt(H)}) = ${vt(cross(E, H))}$ ✓.`);
    },
    // sign of the power through a surface
    () => {
      const ku = ri(0, 2), sk = pick([1, -1]), k = uv(ku, sk), nAx = pick([ku, ku, (ku + 1) % 3]), sn = pick([1, -1]), n = uv(nAx, sn), d = k[0] * n[0] + k[1] * n[1] + k[2] * n[2];
      const ans = d > 0 ? 'positive' : d < 0 ? 'negative' : 'zero';
      return MC('Through a surface', md`A plane wave travels toward $${vt(k)}$. The power through a flat area, counted along its normal $${vt(n)}$, is…`, ans,
        [['positive', 'Only the normal part of $\\mathbf S$ crosses the area: $P = (\\mathbf S\\cdot\\hat n)A$.'], ['negative', 'Only the normal part of $\\mathbf S$ crosses the area: $P = (\\mathbf S\\cdot\\hat n)A$.'], ['zero', 'Only the normal part of $\\mathbf S$ crosses the area: $P = (\\mathbf S\\cdot\\hat n)A$.'], ['it oscillates in sign', 'A single traveling wave has $\\mathbf S$ along $\\hat k$ at every instant: its sign never changes.']].filter((x) => x[0] !== ans),
        md`$P = (\mathbf S\cdot\hat n)A$ with $\mathbf S\parallel${vt(k)}$ and $\hat n = ${vt(n)}$: ${ans}.`);
    },
    // the ideas
    () => one([
      () => MC('Poynting\'s theorem', 'In a resistor carrying current, $\\mathbf J\\cdot\\mathbf E$ is…', 'positive: the field heats the charges',
        [['negative: the resistor supplies power', 'That is a source; a resistor has $\\mathbf J = \\sigma\\mathbf E$.'], ['zero: resistors store no energy', '$\\mathbf J\\cdot\\mathbf E$ is dissipation, not storage.'], ['positive only for AC', '$\\sigma E^2 \\ge 0$ at every instant, for DC too.']],
        '$\\mathbf J = \\sigma\\mathbf E$ gives $\\mathbf J\\cdot\\mathbf E = \\sigma E^2 \\ge 0$: Joule heating.'),
      () => MC('Energy split', 'In a uniform plane wave, the electric energy density compared with the magnetic one is…', 'equal',
        [['larger, because $E$ is numerically larger', '$E$ and $H$ are in different units; $\\epsilon E^2 = \\mu H^2$ exactly.'], ['smaller, because $\\mu_0 > \\epsilon_0$', 'Comparing $\\mu_0$ and $\\epsilon_0$ is meaningless; $E = \\eta H$ makes the densities equal.'], ['zero at the instants when $H$ peaks', '$E$ and $H$ peak together in a traveling wave.']],
        '$\\tfrac12\\epsilon E^2 = \\tfrac12\\epsilon\\eta^2H^2 = \\tfrac12\\mu H^2$.'),
      () => MC('Average of a standing wave', 'Two equal plane waves travel in opposite directions and form a standing wave. The time-averaged power flow is…', 'zero',
        [['twice that of one wave', 'The two flows are opposite and cancel.'], ['equal to that of one wave', 'The second wave carries the same amount back.'], ['zero only at the nodes', 'It is zero on average everywhere.']],
        'Each wave carries $E_0^2/2\\eta$ its own way; the averages cancel.'),
      () => MC('Sign of S', 'At a fixed point in a single traveling sinusoidal wave, the instantaneous $\\mathbf S\\cdot\\hat k$…', 'is never negative',
        [['changes sign twice per period', '$\\mathbf S = (E_0^2/\\eta)\\cos^2(\\ldots)\\hat k$, and $\\cos^2 \\ge 0$.'], ['is constant', 'It oscillates between 0 and $E_0^2/\\eta$.'], ['averages to zero', 'Its average is $E_0^2/2\\eta$; a traveling wave delivers net power.']],
        'E and H flip sign together, so their product along $\\hat k$ never goes negative.'),
      () => MC('Where the sheet\'s power goes', 'A current sheet delivers $-\\mathbf J_s\\cdot\\mathbf E$ per square meter. It goes…', 'half into each of the two waves',
        [['all into the forward wave', 'The sheet is symmetric; both waves carry $\\tfrac\\eta4J_s^2$.'], ['into heating the sheet', 'A perfect sheet has no resistance; the power is radiated.'], ['into energy stored at the sheet', 'A zero-thickness sheet stores nothing; it all flows out.']],
        'Each wave carries $(\\tfrac\\eta2J_s)(\\tfrac12J_s) = \\tfrac\\eta4J_s^2$; two of them make $\\tfrac\\eta2J_s^2$.'),
    ]),
  ]);

  GENS.rf_t17_num = () => one([
    // average power from E0
    () => {
      const er = pick([1, 1, 4, 9]), E0 = pick([1, 10, 20, 100, 377]), eta = ETA0 / Math.sqrt(er), S = E0 * E0 / (2 * eta);
      return MC('Average power', md`A plane wave in ${med(er)} has $E_0 = ${E0}$ V/m. $\langle S\rangle = $`, W(S, 'W/m²'),
        [[W(2 * S, 'W/m²'), 'That is the peak $E_0^2/\\eta$; the average is half.'], [W(er === 1 ? S / 2 : E0 * E0 / (2 * ETA0), 'W/m²'), er === 1 ? 'One factor of ½ too many.' : 'That uses $\\eta_0$; in the medium $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$.'], [W(E0 * E0 * eta / 2, 'W/m²'), 'Divide by $\\eta$, do not multiply.'], [W(E0 / (2 * eta), 'W/m²'), '$E_0$ must be squared.']],
        md`$\langle S\rangle = E_0^2/2\eta = ${E0}^2/(2\times${f(eta)}) = ${f(S)}$ W/m².`);
    },
    // average power from H0
    () => {
      const er = pick([1, 4]), H0 = pick([0.1, 0.5, 1, 2]), eta = ETA0 / Math.sqrt(er), S = eta * H0 * H0 / 2;
      return MC('Average power', md`A plane wave in ${med(er)} has $H_0 = ${H0}$ A/m. $\langle S\rangle = $`, W(S, 'W/m²'),
        [[W(2 * S, 'W/m²'), 'That is the peak $\\eta H_0^2$.'], [W(H0 * H0 / (2 * eta), 'W/m²'), 'With $H$: multiply by $\\eta$, $\\langle S\\rangle = \\eta H_0^2/2$.'], [W(eta * H0 / 2, 'W/m²'), '$H_0$ must be squared.'], [W(er === 1 ? H0 * H0 / 2 : ETA0 * H0 * H0 / 2, 'W/m²'), er === 1 ? 'The impedance is missing: $\\langle S\\rangle = \\eta H_0^2/2$.' : 'That uses $\\eta_0$; in the medium $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$.']],
        md`$\langle S\rangle = \eta H_0^2/2 = (${f(eta)})(${H0})^2/2 = ${f(S)}$ W/m².`);
    },
    // power through an area
    () => {
      const S = pick([2, 5, 10, 50]), A = pick([0.5, 2, 4, 10]), th = pick([0, 0, 60]);
      const P = S * A * Math.cos(th * Math.PI / 180);
      return MC('Through a window', md`A plane wave has $\langle S\rangle = ${S}$ W/m². A ${A} m² window's normal makes $${th}°$ with the direction of travel. The average power through it is…`, W(P, 'W'),
        [[W(S * A * (th ? 1 : 0.5), 'W'), th ? 'Only the normal part of $\\mathbf S$ crosses: multiply by $\\cos\\theta$.' : '$\\langle S\\rangle$ is already the average; do not halve it again.'], [W(S / A, 'W'), 'Multiply by the area.'], [W(S * A * 2, 'W'), 'That doubles it; the average is already given.']],
        md`$P = \langle S\rangle A\cos\theta = (${S})(${A})(${th ? '\\tfrac12' : '1'}) = ${p(P)}$ W.`);
    },
    // energy density from S
    () => {
      const er = pick([1, 4]), S = pick([3, 30, 300]), v = CC / Math.sqrt(er), w = S / v;
      return MC('Energy density', md`A plane wave in ${med(er)} carries $\langle S\rangle = ${S}$ W/m². Its average energy density is…`, W(w, 'J/m³'),
        [[W(er === 1 ? w * 1000 : S / CC, 'J/m³'), er === 1 ? 'Recheck the powers of ten: $c = 3\\times10^8$ m/s.' : 'That uses $c$; here $v_p = c/2$.'], [W(S * v, 'J/m³'), 'Divide by $v_p$: $w = S/v_p$.'], [W(w / 2, 'J/m³'), 'All the energy moves at $v_p$: $w = S/v_p$, with no extra ½.'], [W(2 * w, 'J/m³'), '$S = v_pw$ already counts both the electric and the magnetic half; do not double.']],
        md`$\langle w\rangle = \langle S\rangle/v_p = ${S}/${p(v)} = ${f(w)}$ J/m³.`);
    },
    // sheet power
    () => {
      const J = pick([1, 2, 4, 5]), side = pick([true, false]), Pt = ETA0 / 2 * J * J;
      const ans = side ? Pt / 2 : Pt;
      return MC('Sheet power', md`A sheet in free space carries a steady $|\mathbf J_s| = ${J}$ A/m during a long pulse. ${side ? 'The power per m² carried by the wave on one side' : 'The power per m² the sheet delivers'} is…`, W(ans, 'W/m²'),
        [[W(side ? Pt : Pt / 2, 'W/m²'), side ? 'That is both waves together; one side carries half.' : 'That is one side; the sheet feeds two waves.'], [W(ETA0 * J * J, 'W/m²'), 'That is $\\eta_0J_s^2$: each wave has $E = \\tfrac{\\eta_0}{2}J_s$ and $H = \\tfrac12J_s$.'], [W(ans / 2, 'W/m²'), 'A steady current gives a steady $S$: no time average to take.']],
        md`Each wave: $(\tfrac{\eta_0}{2}J_s)(\tfrac12J_s) = \tfrac{\eta_0}{4}J_s^2 = ${f(Pt / 2)}$ W/m²; the sheet delivers twice that, $${f(Pt)}$ W/m².`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  GENS.t17_sheet = () => {
    const er = pick([1, 2.25, 4, 9]), J0 = pick([0.1, 0.2, 0.5, 1, 2]), fM = pick([1, 10, 100]), a = pick([1, 2, 3]), b = pick([2, 4, 5]), zw = pick([-200, -50, 30, 500]);
    const eta = ETA0 / Math.sqrt(er), v = CC / Math.sqrt(er), E0 = eta * J0 / 2, H0 = J0 / 2;
    const Sav = E0 * H0 / 2, Pw = Sav * a * b, wav = Sav / v;
    return {
      title: 'Power from a sinusoidal sheet',
      q: md`A sheet on $z = 0$ in ${med(er)} carries $\mathbf J_s = -${J0 === 1 ? '' : J0}\cos(2\pi\times${p(fM * 1e6)}\,t)\,\hat x$ A/m. Find the time-averaged power per m² on one side, the total per m² delivered by the sheet, the average power through a $${a}\ \text{m}\times${b}\ \text{m}$ window parallel to the sheet at $z = ${zw}$ m, and the average energy density of the wave.`,
      parts: [N('\\langle S\\rangle\\ \\text{one side}', Sav, 'W/m²'), N('\\text{total from the sheet}', 2 * Sav, 'W/m²'), N('\\langle P\\rangle\\ \\text{window}', Pw, 'W'), N('\\langle w\\rangle', wav, 'J/m³'),
        { lbl: 'The power through the window flows toward', mc: ['$+z$', '$-z$'], a: zw > 0 ? 0 : 1, fixed: true, why: zw > 0 ? [null, 'Each wave carries energy away from the sheet.'] : ['Each wave carries energy away from the sheet.', null] }],
      hints: ['$E_0 = \\tfrac\\eta2J_0$ and $H_0 = \\tfrac12J_0$ with $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$; $\\langle S\\rangle = \\tfrac12E_0H_0$.', 'The window\'s distance does not matter: a plane wave keeps its amplitude. $\\langle w\\rangle = \\langle S\\rangle/v_p$.'],
      sol: sol({
        eq: md`$\langle S\rangle = \tfrac12E_0H_0 = \tfrac{\eta J_0^2}{8}$ per side; the sheet delivers $\langle-\mathbf J_s\cdot\mathbf E\rangle = \tfrac{\eta J_0^2}{4}$; $\langle P\rangle = \langle S\rangle A$; $\langle w\rangle = \langle S\rangle/v_p$.`,
        sym: md`$\eta = \eta_0/\sqrt{\epsilon_r}$, $v_p = c/\sqrt{\epsilon_r}$, $E_0 = \eta J_0/2$, $H_0 = J_0/2$. The frequency does not enter.`,
        sub: md`$\eta = ${f(eta)}\ \Omega$, $E_0 = ${f(E0)}$ V/m, $H_0 = ${f(H0)}$ A/m: $\langle S\rangle = \tfrac12(${f(E0)})(${f(H0)}) = ${f(Sav)}$ W/m²; total $${f(2 * Sav)}$ W/m²; window $${f(Sav)}\times${a * b} = ${f(Pw)}$ W; $\langle w\rangle = ${f(Sav)}/${p(v)} = ${f(wav)}$ J/m³.`,
        ans: md`$\langle S\rangle = ${f(Sav)}$ W/m² per side, $${f(2 * Sav)}$ W/m² in all, $\langle P\rangle = ${f(Pw)}$ W toward $${zw > 0 ? '+' : '-'}z$, $\langle w\rangle = ${f(wav)}$ J/m³.`,
        check: md`$\langle w\rangle = \tfrac12\epsilon E_0^2 = \tfrac12(${er})(8.854\times10^{-12})(${f(E0)})^2 = ${f(er * EPS0 * E0 * E0 / 2)}$ J/m³ ✓.`,
      }),
    };
  };

  GENS.t17_window = () => {
    const er = pick([1, 4]), E0 = pick([10, 20, 50, 100]), fM = pick([10, 50, 100]), u = ri(0, 2), pol = pick([0, 1, 2].filter((i) => i !== u)), s = pick([1, -1]);
    const eta = ETA0 / Math.sqrt(er), w = 2 * Math.PI * fM * 1e6, v = CC / Math.sqrt(er), b = w / v, lam = v / (fM * 1e6), T = 1 / (fM * 1e6);
    const A = pick([0.5, 1, 2, 5]), sn = pick([1, -1]);
    let u0, t0, arg;
    do {
      u0 = pick([0, 1, 3, 5, 7]) * lam / 8;
      t0 = pick([0, 1, 2, 3, 5]) * T / 8;
      arg = w * t0 - s * b * u0;
    } while (Math.cos(arg) ** 2 < 0.2);
    const Pinst = sn * (E0 * E0 / eta) * Math.cos(arg) ** 2 * A, Pav = sn * E0 * E0 / (2 * eta) * A;     // sn = k̂·n̂
    const us = p(+u0.toPrecision(4)), ts = p(+(t0 * 1e9).toPrecision(4));
    return {
      title: 'Power through a window, now and on average',
      q: md`In ${med(er)}, $\mathbf E = ${E0}\cos(2\pi\times${p(fM * 1e6)}\,t ${s > 0 ? '-' : '+'} \beta ${AX[u]})\,\hat ${AX[pol]}$ V/m with $\beta = \omega\sqrt{\mu\epsilon}$. A flat ${A} m² area lies in a plane $${AX[u]} = ${us}$ m, with normal $${vt(uv(u, s * sn))}$. Find the power through it, counted along that normal, at $t = ${ts}$ ns, and its time average.`,
      parts: [N(`P\\ \\text{at}\\ t = ${ts}\\ \\text{ns}`, Pinst, 'W'), N('\\langle P\\rangle', Pav, 'W')],
      hints: [`$\\mathbf S = \\tfrac{E_0^2}{\\eta}\\cos^2(\\omega t ${s > 0 ? '-' : '+'} \\beta ${AX[u]})\\,(${vt(uv(u, s))})$, with $\\eta = ${er === 1 ? '\\eta_0' : '\\eta_0/2'}$.`, `$\\beta = 2\\pi/\\lambda$ with $\\lambda = ${p(+lam.toPrecision(4))}$ m; $P = (\\mathbf S\\cdot\\hat n)A$.`],
      sol: sol({
        eq: md`$\mathbf S = \mathbf E\times\mathbf H = \tfrac{E_0^2}{\eta}\cos^2(\omega t ${s > 0 ? '-' : '+'} \beta ${AX[u]})\,\hat k$ with $\hat k = ${vt(uv(u, s))}$; $P = (\mathbf S\cdot\hat n)A$; $\langle\cos^2\rangle = \tfrac12$.`,
        sym: md`$P(t) = (\hat k\cdot\hat n)\tfrac{E_0^2}{\eta}A\cos^2(\omega t ${s > 0 ? '-' : '+'} \beta ${AX[u]}_0)$, $\langle P\rangle = (\hat k\cdot\hat n)\tfrac{E_0^2}{2\eta}A$, with $\hat k\cdot\hat n = ${sn > 0 ? '+1' : '-1'}$.`,
        sub: md`$\eta = ${f(eta)}\ \Omega$, $\lambda = ${f(lam)}$ m, $\beta = ${f(b)}$ rad/m. Phase $= (${f(w)})(${p(t0)}) ${s > 0 ? '-' : '+'} (${f(b)})(${us}) = ${f(arg)}$ rad, $\cos^2 = ${f(Math.cos(arg) ** 2)}$:
$$P = ${sn > 0 ? '' : '-'}\frac{${E0}^2}{${f(eta)}}(${A})(${f(Math.cos(arg) ** 2)}) = ${f(Pinst)}\ \text{W} \qquad \langle P\rangle = ${sn > 0 ? '' : '-'}\frac{${E0}^2}{2(${f(eta)})}(${A}) = ${f(Pav)}\ \text{W}$$`,
        ans: md`$P = ${f(Pinst)}$ W at that instant; $\langle P\rangle = ${f(Pav)}$ W.`,
        check: md`${sn > 0 ? 'The normal points along the travel, so both are positive' : 'The normal points against the travel, so both come out negative: the energy crosses the other way'}; $|P| \le 2|\langle P\rangle|$ ✓.`,
      }),
    };
  };

  GENS.t17_pulse = () => {
    const tri = pick([true, false]), J0 = pick([1, 2, 4, 5]), D = pick([1, 2, 5, 10]), er = pick([1, 4]);
    const eta = ETA0 / Math.sqrt(er), Speak = eta * J0 * J0 / 4, I = tri ? J0 * J0 * D / 3 : J0 * J0 * D;    // ∫J_s² dt in A²s/m² (D in µs, scaled below)
    const Eside = eta / 4 * I * 1e-6, Etot = 2 * Eside;
    const shape = tri ? `a triangle: rising linearly from 0 to $${J0}$ A/m over the first $${D / 2}$ µs and back to 0 over the next $${D / 2}$ µs` : `a rectangle: $${J0}$ A/m for $${D}$ µs`;
    return {
      title: 'Energy carried by a pulse',
      q: md`A sheet in ${med(er)} carries one current pulse, ${shape}. Find the peak Poynting magnitude on one side, the energy per m² carried by one of the two waves, and the total energy per m² of sheet the source delivered.`,
      parts: [N('|\\mathbf S|_{\\max}', Speak, 'W/m²'), N('\\text{energy per m}^2,\\ \\text{one wave}', Eside, 'J/m²'), N('\\text{energy per m}^2,\\ \\text{total}', Etot, 'J/m²')],
      hints: ['On each side $|\\mathbf S| = (\\tfrac\\eta2J_s)(\\tfrac12J_s) = \\tfrac\\eta4J_s^2$, at the retarded time.', tri ? 'Energy per m² $= \\int|\\mathbf S|\\,dt$. For a triangle of peak $J_0$ and duration $D$, $\\int J_s^2\\,dt = J_0^2D/3$.' : 'Energy per m² $= \\int|\\mathbf S|\\,dt = \\tfrac\\eta4J_0^2D$.'],
      sol: sol({
        eq: md`$|\mathbf S| = \tfrac\eta4J_s^2$ per side; energy per m² $= \int|\mathbf S|\,dt$; the sheet delivers $\int(-\mathbf J_s\cdot\mathbf E)\,dt = \tfrac\eta2\int J_s^2\,dt$.`,
        sym: md`$|\mathbf S|_{\max} = \tfrac\eta4J_0^2$; one wave: $\tfrac\eta4\int J_s^2\,dt$ with $\int J_s^2\,dt = ${tri ? 'J_0^2D/3' : 'J_0^2D'}$; total twice that.`,
        sub: md`$\eta = ${f(eta)}\ \Omega$. $|\mathbf S|_{\max} = \tfrac{${f(eta)}}{4}(${J0})^2 = ${f(Speak)}$ W/m². $\int J_s^2\,dt = ${tri ? `(${J0})^2(${D}\\times10^{-6})/3` : `(${J0})^2(${D}\\times10^{-6})`} = ${f(I * 1e-6)}$ A²s/m², so one wave carries $\tfrac{${f(eta)}}{4}(${f(I * 1e-6)}) = ${f(Eside)}$ J/m².`,
        ans: md`$|\mathbf S|_{\max} = ${f(Speak)}$ W/m²; one wave $${f(Eside)}$ J/m²; total $${f(Etot)}$ J/m².`,
        check: md`Units: $\Omega\cdot\text{A}^2\text{s/m}^2 = \text{W·s/m}^2 = \text{J/m}^2$ ✓. ${tri ? 'A triangle carries a third of the energy of a rectangle with the same peak and duration.' : 'Energy = power × duration, as it should be for a constant current.'}`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t17-poynting'] = [
    Q(md`The Poynting vector has units of…`,
      ['W/m²', 'W', 'J/m³', 'V·A'], 0,
      [null, 'That is power through a whole surface, $\\int\\mathbf S\\cdot d\\mathbf A$.', 'That is energy density.', 'That is watts, a total power, not per area.'],
      md`(V/m)(A/m) = W/m².`),
    Q(md`A plane wave's average energy density is $w$ and its speed $v_p$. Its average intensity $\langle S\rangle$ is…`,
      ['$v_p\\,w$', '$w/v_p$', '$\\tfrac12v_pw$', '$v_p^2w$'], 0,
      [null, 'Upside down: energy per volume times speed is power per area.', 'All of the energy moves at $v_p$; no ½.', 'Units: (m/s)²(J/m³) is not W/m².'],
      md`In $dt$ a column of length $v_pdt$ crosses each m²: $S = wv_p$.`),
    Q(md`Doubling $\epsilon_r$ of a nonmagnetic medium at fixed $E_0$ changes $\langle S\rangle$ by a factor of…`,
      ['$\\sqrt2$', '2', '$1/\\sqrt2$', '1'], 0,
      [null, '$\\eta \\propto 1/\\sqrt{\\epsilon_r}$, so $E_0^2/2\\eta \\propto \\sqrt{\\epsilon_r}$.', 'That would be $\\eta$ getting larger; it gets smaller.', '$\\eta$ changes, so the power changes.'],
      md`$\langle S\rangle = E_0^2/2\eta$ and $\eta = \eta_0/\sqrt{\epsilon_r}$: $\langle S\rangle\propto\sqrt{\epsilon_r}$.`),
    Q(md`In Poynting's theorem, $\oint_A\mathbf S\cdot d\mathbf A$ (outward $d\mathbf A$) is…`,
      ['the power flowing out of the volume', 'the power flowing in', 'the energy stored inside', 'the Joule heating inside'], 0,
      [null, 'Outward $d\\mathbf A$ counts outflow as positive.', 'That is a volume integral of $w_e + w_m$, not a surface integral.', 'That is $\\int\\mathbf J\\cdot\\mathbf E\\,dV$.'],
      md`$\mathbf S\cdot d\mathbf A > 0$ where energy leaves through the surface.`),
    Q(md`Where does $\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)$ come from?`,
      ['A vector identity, true for any two fields', 'Faraday\'s law', 'Ampère\'s law', 'The divergence theorem'], 0,
      [null, 'Faraday enters only when you replace $\\nabla\\times\\mathbf E$.', 'Ampère enters only when you replace $\\nabla\\times\\mathbf H$.', 'The divergence theorem turns the volume integral into a surface one later.'],
      md`It is the product rule for a divergence of a cross product; Maxwell's equations come in next.`),
    Q(md`A 1 m long resistor carries DC current $I$ with voltage $V$ across it. The Poynting vector at its surface points…`,
      ['into the resistor, delivering $VI$ in total', 'out of the resistor, carrying away $VI$', 'along the current', 'nowhere: DC fields carry no power'], 0,
      [null, 'The resistor absorbs energy ($\\mathbf J\\cdot\\mathbf E > 0$), so energy flows in.', '$\\mathbf E$ is along the wire and $\\mathbf H$ circles it; $\\mathbf E\\times\\mathbf H$ points radially.', 'Static fields carry power whenever $\\mathbf E\\times\\mathbf H \\ne 0$: here they feed the heat.'],
      md`$\mathbf E$ along the axis, $\mathbf H$ circling: $\mathbf E\times\mathbf H$ points radially inward. $\oint\mathbf S\cdot d\mathbf A = -(V/\ell)(I/2\pi a)(2\pi a\ell) = -VI$: $VI$ flows in and becomes heat.`),
    Q(md`A wave's $|\mathbf E|$ at a point is 100 V/m in free space. The instantaneous $|\mathbf S|$ there is…`,
      ['26.5 W/m²', '13.3 W/m²', '$3.77\\times10^4$ W/m²', '0.265 W/m²'], 0,
      [null, 'That is half: averages of sinusoids carry the ½, an instantaneous value does not.', 'That multiplies by $\\eta_0$.', 'Off by 100: $E^2 = 10^4$.'],
      md`$|S| = E^2/\eta_0 = 10^4/377 = 26.5$ W/m².`),
    Q(md`At a fixed point, the instantaneous power of a sinusoidal plane wave oscillates at…`,
      ['twice the wave frequency', 'the wave frequency', 'half the wave frequency', 'zero frequency: it is constant'], 0,
      [null, '$\\cos^2(\\omega t) = \\tfrac12 + \\tfrac12\\cos(2\\omega t)$.', '$\\cos^2$ repeats every half period.', 'Only its average is constant.'],
      md`$\cos^2(\omega t) = \tfrac12 + \tfrac12\cos2\omega t$.`),
    Q(md`A 1 kW/m² beam (sunlight, roughly) in free space has $E_0$ of about…`,
      ['870 V/m', '615 V/m', '$3.8\\times10^5$ V/m', '27 V/m'], 0,
      [null, 'That uses $S = E_0^2/\\eta_0$; 1 kW/m² is an average, $E_0^2/2\\eta_0$.', 'That is $\\eta_0\\times1000$.', 'That drops the 1000: $\\sqrt{2(377)(1)} = 27$. Use $\\langle S\\rangle = 1000$ W/m².'],
      md`$E_0 = \sqrt{2\eta_0\langle S\rangle} = \sqrt{2(377)(1000)} = 868$ V/m.`),
    Q(md`A sheet delivers $\tfrac\eta2J_s^2$ W/m² while a steady current flows. Where does that energy go?`,
      ['Into the growing region of space filled by the two waves', 'Into heat in the sheet', 'Back into the sheet after the current stops', 'Nowhere: a steady current delivers no power'], 0,
      [null, 'An ideal sheet has no resistance.', 'The waves keep traveling away; nothing returns.', 'A steady current with a steady $E$ against it delivers steady power: the field-filled region keeps growing.'],
      md`Behind each front the fields hold energy density $\epsilon E^2$, and the filled region grows at $v_p$ on both sides: $2\cdot v_p\cdot\epsilon(\tfrac\eta2J_s)^2 = \tfrac\eta2J_s^2$ ✓.`),
    Q(md`In free space, $\mathbf E = 10\cos(\omega t - \beta z)\hat x$ V/m. How much energy crosses 1 m² of the plane $z = 0$ in one period $T = 1$ µs?`,
      ['0.133 µJ', '0.265 µJ', '0.0663 µJ', '50 µJ'], 0,
      [null, 'That uses the peak instead of the average.', 'One factor of ½ too many.', 'That is $E_0^2/2\\times T$ without $\\eta_0$.'],
      md`$\langle S\rangle T = \tfrac{100}{2(377)}(10^{-6}) = 1.33\times10^{-7}$ J.`),
    Q(md`$\langle\mathbf S\rangle$ for a wave with $E_0 = 1$ V/m in free space is about…`,
      ['1.33 mW/m²', '2.65 mW/m²', '188 W/m²', '0.5 W/m²'], 0,
      [null, 'That is the peak, $E_0^2/\\eta_0$.', 'That multiplies by $\\eta_0$ instead of dividing.', 'That forgets $\\eta_0$.'],
      md`$1/(2\times377) = 1.33\times10^{-3}$ W/m². Worth remembering: 1 V/m ↔ 1.33 mW/m².`),
    Q(md`Which quantity is the same at every point of a single traveling sinusoidal plane wave in a lossless medium?`,
      ['the time-averaged Poynting vector', 'the instantaneous energy density', 'the instantaneous $\\mathbf E$', 'the phase'], 0,
      [null, 'It oscillates as $\\cos^2(\\omega t - \\beta z)$.', 'It is a traveling cosine.', 'The phase is $\\omega t - \\beta z + \\phi$, different at each $z$.'],
      md`$\langle S\rangle = E_0^2/2\eta$ depends on neither $z$ nor $t$.`),
    Q(md`A uniform plane wave in a perfect dielectric enters a slab region of the same material. In the slab, $\int\mathbf J\cdot\mathbf E\,dV$ is…`,
      ['zero', 'positive', 'negative', 'equal to the incoming power'], 0,
      [null, 'A perfect dielectric has $\\sigma = 0$: no conduction current.', 'There is no source inside.', 'With no losses all the power passes through or is stored.'],
      md`$\sigma = 0$ means $\mathbf J = 0$; polarization effects are already in $\epsilon$.`),
    Q(md`Two sheets on $z = 0$ and $z = d$ radiate. To find the net power through a plane at $z = 2d$, you…`,
      ['add the fields first, then compute $\\mathbf E\\times\\mathbf H$', 'add the two Poynting vectors', 'take the larger of the two', 'compute each sheet\'s power and subtract'], 0,
      [null, '$\\mathbf S$ is quadratic in the fields: cross terms appear, so Poynting vectors do not simply add.', 'Both waves are present; superpose the fields.', 'Superposition applies to fields, not powers.'],
      md`$(\mathbf E_1 + \mathbf E_2)\times(\mathbf H_1 + \mathbf H_2)$ includes $\mathbf E_1\times\mathbf H_2 + \mathbf E_2\times\mathbf H_1$. (For waves of different frequencies those average to zero.)`),
    Q(md`In HW 7 #6, the Poynting vector $\mathbf E\times\mathbf H$ of the triangular pulse points…`,
      ['along $-\\hat x$ at all times and places where it is nonzero', 'along $+\\hat x$', 'alternately $\\pm\\hat x$', 'along $\\hat z$'], 0,
      [null, 'The wave travels toward $-x$.', 'The pulse is never negative, and even if it were, $E$ and $H$ flip together.', '$\\mathbf S$ is perpendicular to $\\mathbf E$ (along $\\hat z$).'],
      md`$\mathbf E = E_z\hat z$, $\mathbf H = (E_z/\eta_0)\hat y$: $\mathbf S = (E_z^2/\eta_0)(\hat z\times\hat y) = -(E_z^2/\eta_0)\hat x$.`),
  ];
})();

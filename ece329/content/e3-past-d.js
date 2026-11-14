/* Past Exam 3s, part D: the three summer papers by Prof. Kudeki (handwritten keys), typed clean and solved slowly.
   e3-past-su19   Summer 2019 Exam 3 (main paper)       e3-past-su19b  Summer 2019 Exam 3 (the conflict paper)
   e3-past-su18   Summer 2018 Exam 3                     e3-past-su17   Summer 2017 Exam 3
   Every problem is retyped (no handwriting, no names), every sketch question becomes a choice between candidate plots
   plus values read off the sketch, and every answer was re-derived and checked numerically (work-pastD/verify.py).
   Where the posted key slips, the solution says so. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;
  const E60 = 60 * PI;                                           // eta0/2 times 1 A/m, in V/m
  const mc = (lbl, opts, a, why, fixed) => Object.assign({ lbl, mc: opts, a, why }, fixed ? { fixed: true } : {});
  const NT = (lbl, ans, unit, traps, rel) => Object.assign(N(lbl, ans, unit, rel), traps ? { traps } : {});
  const PLOTS = ['Plot A', 'Plot B', 'Plot C', 'Plot D'];

  // ---------------------------------------------------------------- figures
  // a current sheet seen edge-on: the normal axis runs left to right, the current runs up along the sheet
  function sheetFig(o) {
    const g = PF.fig({ alt: o.alt });
    const x0 = 170, ya = 34, yb = 150, ax = 128;
    g.arrow(20, ax, 330, ax, { cls: 'dim', hs: 7 }); g.label(334, ax, o.n, 'l', 'small accent');
    g.label(x0 + 6, ax + 6, '0', 'tl', 'small accent');
    g.line(x0, ya, x0, yb, { cls: 'thick dash' });
    g.arrow(x0 + 14, 100, x0 + 14, 56, { cls: 'thick', hs: 8 }); g.label(x0 + 22, 64, o.jl, 'l', 'small');
    g.arrow(x0 + 70, 40, x0 + 140, 40, { hs: 8 }); g.label(x0 + 105, 34, o.right, 'b', 'small');
    g.arrow(x0 - 30, 40, x0 - 100, 40, { hs: 8 }); g.label(x0 - 65, 34, o.left, 'b', 'small');
    g.label(x0 - 90, ax + 12, `${o.n} < 0`, 't', 'small'); g.label(x0 + 100, ax + 12, `${o.n} > 0`, 't', 'small');
    return g.svg();
  }

  // the tip of E in the plane across the travel: h to the right, v up, the third axis out of the page.
  // e0, e1: screen angles (degrees, counterclockwise from h) of E(0) and E(T/4); travel +1 = out of the page.
  function polFig(o) {
    const g = PF.fig({ alt: o.alt });
    const cx = 130, cy = 120, Rr = 62, D = PI / 180;
    const at = (a, r) => [cx + r * Math.cos(a * D), cy - r * Math.sin(a * D)];
    g.arrow(cx - 92, cy, cx + 100, cy, { cls: 'dim', hs: 7 }); g.label(cx + 104, cy, o.h, 'l', 'small accent');
    g.arrow(cx, cy + 92, cx, cy - 100, { cls: 'dim', hs: 7 }); g.label(cx + 6, cy - 102, o.v, 'bl', 'small accent');
    g.circle(cx, cy, Rr, { cls: 'dash dim' });
    if (o.travel > 0) g.odot(cx, cy, 7); else g.otimes(cx, cy, 7);
    const tip = (a, lab, dash) => {
      const s = at(a, 11), t = at(a, Rr);
      g.arrow(s[0], s[1], t[0], t[1], { cls: dash ? 'thick dash' : 'thick', hs: 9 });
      const k = ((a % 360) + 360) % 360;
      const pos = { 0: [t[0] + 8, t[1] - 10, 'bl'], 90: [t[0] + 10, t[1] - 4, 'bl'], 180: [t[0] - 8, t[1] - 10, 'br'], 270: [t[0] + 10, t[1] + 6, 'tl'] }[k];
      g.label(pos[0], pos[1], lab, pos[2], 'small');
    };
    tip(o.e0, '\\mathbf E(0)', false);
    tip(o.e1, '\\mathbf E(T/4)', true);
    const ccw = ((o.e1 - o.e0 + 360) % 360) === 90;
    const a0 = (ccw ? o.e0 : o.e1) + 14;
    g.arc(cx, cy, 36, a0, a0 + 62, { cls: 'thick', arrow: ccw ? 'end' : 'start', hs: 7 });
    return g.svg();
  }

  // the interface of Summer 2017 Problem 3
  function ifaceFig() {
    const g = PF.fig({ alt: 'side view: region z < 0, shaded, is a perfect dielectric with epsilon = 9/4 epsilon0; region z > 0 is vacuum; the incident wave travels toward +z, the reflected wave toward -z, and the transmitted wave toward +z in the vacuum' });
    g.rect(20, 30, 160, 110, { cls: 'shade' });
    g.line(180, 22, 180, 148, { cls: 'thick' });
    g.arrow(10, 160, 350, 160, { cls: 'dim', hs: 7 }); g.label(354, 160, 'z', 'l', 'small accent'); g.label(180, 166, '0', 't', 'small accent');
    g.arrow(40, 56, 160, 56, { cls: 'thick', hs: 8 }); g.label(100, 50, '\\text{incident}', 'b', 'small');
    g.arrow(160, 100, 40, 100, { cls: 'thick', hs: 8 }); g.label(100, 94, '\\text{reflected}', 'b', 'small');
    g.arrow(200, 70, 320, 70, { cls: 'thick', hs: 8 }); g.label(260, 64, '\\text{transmitted}', 'b', 'small');
    g.label(100, 126, '\\epsilon = \\tfrac94\\epsilon_0', 'c', 'small');
    g.label(262, 116, '\\text{vacuum}', 'c', 'small');
    return g.svg();
  }

  // one waveform on [x0, x1] (time in µs or position in m)
  const TT = (n) => Array.from({ length: n }, (_, i) => [i + 1, String(i + 1)]);
  const ZT = (n) => Array.from({ length: n }, (_, i) => [300 * (i + 1), String(300 * (i + 1))]);
  const EY = { y: [-1.3 * E60, 1.3 * E60], yt: [[E60, '60\\pi'], [-E60, '-60\\pi']] };
  const HY = { y: [-0.66, 0.66], yt: [[0.5, '0.5'], [-0.5, '-0.5']] };
  function wplot(f, o) {
    return PF.plot(Object.assign({ w: o.w || 250, h: o.h || 140, zero: true, ml: 48, mb: 30 }, o, { curves: [{ f, n: 900 }] }));
  }
  const row4 = (svgs) => PF.row(svgs.map((svg, i) => ({ svg, cap: PLOTS[i] }))).svg;
  const step = (x) => (x > 0 ? 1 : 0);
  // the power of the wave in the good conductor (Summer 2018 and 2019, Problem 3b): it travels toward -z
  const decayPlot = () => PF.plot({
    w: 340, h: 180, x: [-21, 2], y: [0, 1.18], ml: 48, xl: 'z\\,(\\text{m})', yl: '\\langle S\\rangle\\ (\\text{W/m}^2)',
    xt: [[-20, '-20'], [-10, '-10'], [0, '0']], yt: [[1, '1']],
    curves: [{ f: (z) => (z <= 0 ? Math.exp(2 * z * PI / 25) : NaN), n: 300 }],
    pts: [{ x: -10, y: Math.exp(-4 * PI / 5), lab: '0.081', anchor: 'bl' }],
  });

  // ---------------------------------------------------------------- solution text shared by several papers
  // the field of a current sheet from the boundary conditions; n = the normal axis letter
  const sheetFirst = (n) => md`
        **Where the sheet's field comes from.** The sheet sends one plane wave toward $+${n}$ and one toward $-${n}$. Two facts fix both.

        1. Tangential $\mathbf E$ is continuous through the sheet, so both waves start with the same field $\mathbf E_s(t)$ at $${n} = 0$.
        2. In a plane wave $\mathbf H = \frac{1}{\eta_0}\hat v\times\mathbf E$, where $\hat v$ is the direction of travel.

        So just to the right of the sheet ($\hat v = +\hat ${n}$) and just to the left ($\hat v = -\hat ${n}$):
        $$\mathbf H_\pm = \pm\frac{1}{\eta_0}\,\hat ${n}\times\mathbf E_s$$
        The current in the sheet is the jump in tangential $\mathbf H$ (the boundary condition on your formula sheet):
        $$\hat ${n}\times(\mathbf H_+ - \mathbf H_-) = \mathbf J_s$$
        Put the two fields in. The difference is $\frac{2}{\eta_0}\hat ${n}\times\mathbf E_s$:
        $$\frac{2}{\eta_0}\,\hat ${n}\times(\hat ${n}\times\mathbf E_s) = \mathbf J_s$$
        For a vector lying in the sheet, two quarter turns about $\hat ${n}$ reverse it: $\hat ${n}\times(\hat ${n}\times\mathbf E_s) = -\mathbf E_s$. So
        $$\boxed{\mathbf E_s(t) = -\frac{\eta_0}{2}\,\mathbf J_s(t)}$$
        The field at the sheet points **against** the current, with size $\eta_0/2 = 60\pi \approx 188$ V/m for every A/m of current.

        **Then the waves carry it away.** A point at distance $|${n}|$ sees what the sheet made $|${n}|/c$ earlier:
        $$\mathbf E(${n}, t) = -\frac{\eta_0}{2}\,\mathbf J_s\!\left(t - \frac{|${n}|}{c}\right)$$
        on both sides. Here $c = 3\times10^8$ m/s $= 300$ m/µs, so with $t$ in µs and $${n}$ in m the delay is $|${n}|/300$ µs.
        `;

  // Problem 3b of Summer 2018 and Summer 2019: seawater-like medium at 1 kHz
  const gcSol = md`
    **Step 1: the loss tangent.** It compares the conduction current $\sigma E$ with the displacement current $\omega\epsilon E$. First the displacement part, with $\epsilon = 81\epsilon_0 = 81\times\frac{10^{-9}}{36\pi}$:
    $$\omega\epsilon = (2\pi\times10^3)(81)\frac{10^{-9}}{36\pi}$$
    The $\pi$'s cancel and $2\times81/36 = 4.5$:
    $$\omega\epsilon = 4.5\times10^{-6}\ \text{S/m}$$
    Now the ratio:
    $$\frac{\sigma}{\omega\epsilon} = \frac{4}{4.5\times10^{-6}} \approx 8.9\times10^5$$
    The conduction current wins by almost a million to one.

    **Step 2: what that does to γ.** Start from the sheet's formula:
    $$\gamma = j\omega\sqrt{\mu\left(\epsilon - j\frac{\sigma}{\omega}\right)}$$
    Next to $\sigma/\omega$, the $\epsilon$ is a millionth of the size. Drop it:
    $$\gamma \approx j\omega\sqrt{-j\frac{\mu\sigma}{\omega}}$$
    Move $j\omega$ inside the root as $(j\omega)^2 = -\omega^2$:
    $$\gamma \approx \sqrt{-\omega^2\cdot(-j)\frac{\mu\sigma}{\omega}} = \sqrt{j\,\omega\mu\sigma}$$
    And $\sqrt j = e^{j45°} = \frac{1 + j}{\sqrt2}$:
    $$\gamma \approx \sqrt{\frac{\omega\mu\sigma}{2}}\,(1 + j)$$
    So $\alpha = \beta$. With $\omega = 2\pi f$, both equal $\sqrt{\pi f\mu\sigma}$. The **skin depth** (penetration depth) is the distance over which the field falls by $1/e$:
    $$\boxed{\delta = \frac{1}{\alpha} = \frac{1}{\sqrt{\pi f\mu\sigma}}}$$

    **(i) Which kind of medium?** In an imperfect dielectric, $\alpha \ll \beta$: the wave runs many wavelengths before it fades, so $\delta \gg \lambda$. In a good conductor, $\alpha = \beta$, so
    $$\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{\alpha} = 2\pi\delta$$
    The wavelength is about 6 skin depths: **longer** than the penetration depth. That is what the paper says is observed, so the medium is a **good conductor**. Step 1 confirms it.

    **(ii) δ, by hand.** Put in $f = 10^3$, $\mu_0 = 4\pi\times10^{-7}$, $\sigma = 4$:
    $$\pi f\mu\sigma = \pi(10^3)(4\pi\times10^{-7})(4)$$
    Collect the pieces: $4\times4 = 16$, $\pi\cdot\pi = \pi^2$, $10^3\times10^{-7} = 10^{-4}$:
    $$\pi f\mu\sigma = 16\pi^2\times10^{-4}$$
    The square root of each piece is easy:
    $$\sqrt{\pi f\mu\sigma} = 4\pi\times10^{-2}\ \text{1/m}$$
    So
    $$\delta = \frac{1}{4\pi\times10^{-2}} = \frac{100}{4\pi} = \boxed{\frac{25}{\pi}\ \text{m} \approx 7.96\ \text{m}}$$

    **(iii) λ.** $\beta = \alpha$, so
    $$\lambda = 2\pi\delta = 2\pi\cdot\frac{25}{\pi} = \boxed{50\ \text{m}}$$

    **(iv) v_p.** The phase speed is $\omega/\beta$, and $\beta = 1/\delta$:
    $$v_p = \omega\delta = (2\pi\times10^3)\frac{25}{\pi} = \boxed{5\times10^4\ \text{m/s}}$$
    Check: $v_p = \lambda f = (50)(10^3) = 5\times10^4$ m/s ✓.

    !!intuition Does this make sense?
      In free space a 1 kHz wave has $\lambda = 300$ km. In this conductor it is 50 m, and it crawls at $5\times10^4$ m/s, 6000 times slower than light. A good conductor squeezes the wave: lots of phase per meter, and the same amount of decay. That is why ships talk to submarines at very low frequencies: $\delta \propto 1/\sqrt f$.
  `;
  const gcSpeed = md`
    **Speed path.** "λ longer than δ" means $\alpha \approx \beta$: good conductor. Then $\delta = 1/\sqrt{\pi f\mu\sigma}$; with these numbers the root is $\sqrt{16\pi^2\times10^{-4}} = 4\pi/100$. Then $\lambda = 2\pi\delta$ and $v_p = \lambda f$. Under a minute.

    **Where points go.** Using $\omega$ in place of $f$ inside $\sqrt{\pi f\mu\sigma}$ (the formula already has the $2\pi$ folded in); answering "imperfect dielectric" because $\lambda > \delta$ sounds like a long wave; $\lambda = \delta$ instead of $2\pi\delta$; leaving $\delta$ as $1/(4\pi\times10^{-2})$ without simplifying, when the paper asks for a number.
  `;
  const powSol = md`
    **Step 1: which way the wave fades.** The wave travels toward $-z$, so its fields go as $e^{+\gamma z}$, with an amplitude $e^{+\alpha z}$. As the wave moves to more negative $z$, $e^{\alpha z}$ shrinks. The wave fades in the direction it travels, as it must.

    **Step 2: power goes as the square of the field.** $\langle S\rangle \propto |E|^2 \propto e^{2\alpha z}$, so between $z = 0$ and $z = -10$ m:
    $$\langle S\rangle(-10) = \langle S\rangle(0)\,e^{2\alpha(-10)} = (1)\,e^{-20\alpha}$$
    **Step 3: the numbers.** $\alpha = 1/\delta = \pi/25$ 1/m:
    $$20\alpha = \frac{20\pi}{25} = \frac{4\pi}{5} \approx 2.51$$
    $$\boxed{\langle S\rangle(-10\ \text{m}) = e^{-4\pi/5} \approx 0.081\ \text{W/m}^2}$$
    By hand: $e^{-2.5} = 1/e^{2.5}$, and $e^{2.5} = e^2\cdot e^{0.5} \approx 7.39\times1.65 \approx 12.2$, so about $0.082$.

    [[fig:dec]]

    !!intuition Does this make sense?
      Ten meters is $10/7.96 = 1.26$ skin depths. The field falls to $e^{-1.26} \approx 0.28$ of its value, and the power to the square of that, $0.28^2 \approx 0.08$. About 92% of the power has turned into heat in 10 m.

    **Speed path.** Power falls as $e^{-2d/\delta}$. Here $2d/\delta = 20\pi/25 \approx 2.5$, and $e^{-2.5} \approx 0.08$.

    **Where points go.** $e^{-\alpha d}$ instead of $e^{-2\alpha d}$ (that is the **field** ratio, 0.28); $e^{+20\alpha}$ (12.3 W/m², a wave that gains power from nowhere); forgetting that the paper says the wave travels toward $-z$, so $z = -10$ m is downstream.
  `;
  const decFig = { dec: { svg: decayPlot(), cap: 'The average power along z. The wave enters at z = 0 and travels to the left, losing 92% of its power in 10 m.' } };

  // ======================================================================================== SUMMER 2019 (main)
  const s19j = (t) => step(t) * Math.cos(PI * t);                         // J_sx(t), t in µs, f = 1/2 MHz
  const s19E = (t) => -E60 * s19j(t - 1);                                 // E_x at y = 300 m
  const s19H = (y) => (y < 900 ? -0.5 * Math.cos(PI * y / 300) : 0);      // H_z(y) at t = 3 µs, y > 0
  const tJ = { x: [-4, 4], y: [-1.35, 1.35], yt: [[1, '1'], [-1, '-1']], xt: [[-4, '-4'], [-2, '-2'], [0, '0'], [2, '2'], [4, '4']], xl: 't\\,(\\mu\\text{s})', yl: 'J_{sx}\\,(\\text{A/m})' };
  const tE19 = Object.assign({ x: [0, 5.4], xt: TT(5), xl: 't\\,(\\mu\\text{s})', yl: 'E_x\\,(\\text{V/m})' }, EY);
  const zH19 = Object.assign({ x: [0, 1280], xt: ZT(4), xl: 'y\\,(\\text{m})', yl: 'H_z\\,(\\text{A/m})' }, HY);

  const su19 = [
    R(md`
      **Summer 2019 · ECE 329 · Exam 3** (Prof. Kudeki). Wednesday, July 24, 2019, 11:00–11:55 AM. Three problems of 25 points each, 75 points in all. The class averaged about 54 out of 75. The paper was open book with calculators; yours is closed book with no calculator, so every number below is done by hand.

      The posted key is handwritten. Every answer here was re-derived and checked, and where the key slips, the solution says so.

      **What it tests.** Phasors of a circular wave and its $\mathbf H$ ([Topic 1](#/l/w1-phasor), [Topic 2](#/l/w1-maxwell)); power of one component and of both ([Topic 4](#/l/w1-avg)); handedness ([Topic 9](#/l/w3-pol)); $\mathbf J\cdot\mathbf E$ ([Topic 3](#/l/w1-poynting)); a switched-on current sheet and its waves, sketched in time and in space ([Exam 2 Topic 15](#/l/t15-sheet-waves), used again in [Topic 10](#/l/w3-antenna)); a circular wave from two snapshots ([Topic 9](#/l/w3-pol)); a good conductor, skin depth and power decay ([Topic 7](#/l/w2-limits), [Topic 8](#/l/w2-loss)).

      **What is different on your exam.** Problem 2 (the sheet launched by $u(t)$) is Exam 2 material in Fall 2026. Keep it: Topic 10 designs sheet antennas with exactly this field, and it is the fastest way to practise the relation between $\mathbf E$, $\mathbf H$ and the direction of travel.

      **How to use it.** Set a 75-minute timer (the summer sitting had 55 minutes, so aim to finish early) and work on paper. Then enter your answers. Each "plot" question becomes a choice between candidate plots plus a few values read off your sketch: draw your own sketch first, then compare.
    `),

    // ---------------------------------------------------------------- Problem 1
    R(md`
      ### Problem 1 (25 points): a circular wave, and J·E

      This problem has two independent parts. Part (a): a plane TEM wave in free space has the electric field
      $$\mathbf E(\mathbf r, t) = \cos(\omega t + \beta x)\,\hat y + \sin(\omega t + \beta x)\,\hat z\ \ \text{V/m}$$
    `),
    P({ src: 'Summer 2019 #1a(i)–(iii) · 9 pts', title: 'The phasors and the direction of travel',
      q: md`(i) (3 pts) Find the phasor $\Et(x)$. Hint: it is a superposition of a $\hat y$- and a $\hat z$-directed phasor.

(ii) (3 pts) Find the magnetic field phasor $\Ht(x)$. Use $\eta_0 = 120\pi\ \Omega$ and the right-hand rule.

(iii) (3 pts) In which direction does the wave travel? Give your reason.`,
      parts: [
        mc(md`(i) $\Et(x)$, in V/m`, [md`$(\hat y - j\hat z)\,e^{j\beta x}$`, md`$(\hat y + j\hat z)\,e^{j\beta x}$`, md`$(\hat y - j\hat z)\,e^{-j\beta x}$`, md`$(\hat y + \hat z)\,e^{j\beta x}$`], 0,
          [null, md`That takes the phasor of a sine as $+j$. A sine is a cosine $90°$ late, $\sin\theta = \cos(\theta - 90°)$, so its phasor carries $e^{-j90°} = -j$.`, md`The exponent copies the sign of $\beta x$ inside the cosine: $\cos(\omega t + \beta x)$ has the phasor $e^{+j\beta x}$. The phasor $e^{-j\beta x}$ belongs to $\cos(\omega t - \beta x)$.`, md`That puts the two components in phase. A sine and a cosine of the same argument are $90°$ apart, and the phasor has to remember it with a $j$.`]),
        mc(md`(ii) $\Ht(x)$, in A/m`, [md`$\tfrac{1}{120\pi}(-\hat z - j\hat y)\,e^{j\beta x}$`, md`$\tfrac{1}{120\pi}(\hat z + j\hat y)\,e^{j\beta x}$`, md`$\tfrac{1}{120\pi}(-\hat z + j\hat y)\,e^{j\beta x}$`, md`$120\pi(-\hat z - j\hat y)\,e^{j\beta x}$`], 0,
          [null, md`That is $\frac{1}{\eta_0}\hat x\times\Et$: a wave toward $+x$. This wave travels toward $-x$, so $\Ht = \frac{1}{\eta_0}(-\hat x)\times\Et$, which flips both signs.`, md`One cross product has the wrong sign: $\hat x\times\hat z = -\hat y$, so $(-\hat x)\times(-j\hat z) = j(\hat x\times\hat z) = -j\hat y$.`, md`$\mathbf H$ is $\mathbf E$ divided by $\eta_0$, not multiplied: $|\mathbf H| = |\mathbf E|/\eta_0$.`]),
        mc(md`(iii) The wave travels toward`, [md`$-\hat x$`, md`$+\hat x$`, md`$+\hat y$`, md`$+\hat z$`], 0,
          [null, md`Follow a crest: $\omega t + \beta x = $ const. As $t$ grows, $x$ must shrink. Toward $+x$ needs opposite signs, $\omega t - \beta x$.`, md`$\hat y$ is a direction of $\mathbf E$. A plane wave has no field along its direction of travel.`, md`$\hat z$ is a direction of $\mathbf E$ too. The travel direction is the one the phase depends on: $x$.`]),
      ],
      hints: [md`$\sin\theta = \cos(\theta - 90°)$, so $\sin(\omega t + \beta x)$ has the phasor $e^{j\beta x}e^{-j90°} = -j\,e^{j\beta x}$.`, md`Find the direction of travel $\hat v$ first, from the signs of $\omega t$ and $\beta x$. Then $\Ht = \frac{1}{\eta_0}\hat v\times\Et$.`],
      sol: md`
        **Step 1: what a phasor is.** At one frequency, a component $A\cos(\omega t + \theta)$ is the real part of $Ae^{j\theta}e^{j\omega t}$. The phasor is the complex number in front of $e^{j\omega t}$:
        $$A\cos(\omega t + \theta)\ \longleftrightarrow\ Ae^{j\theta}$$
        **Step 2: the $\hat y$ part.** Here $A = 1$ and $\theta = \beta x$:
        $$\cos(\omega t + \beta x)\ \longleftrightarrow\ e^{j\beta x}$$
        **Step 3: the $\hat z$ part.** Rewrite the sine as a cosine. A sine reaches its peak a quarter period after a cosine:
        $$\sin(\omega t + \beta x) = \cos(\omega t + \beta x - 90°)$$
        So its phasor has an extra $e^{-j90°}$, which is $-j$:
        $$\sin(\omega t + \beta x)\ \longleftrightarrow\ -j\,e^{j\beta x}$$
        **Step 4: put the vector together.**
        $$\boxed{\Et(x) = (\hat y - j\hat z)\,e^{j\beta x}\ \text{V/m}}$$
        !!intuition Does this make sense?
          At $x = 0$, $t = 0$: $\Re\{\hat y - j\hat z\} = \hat y$, and the field is $\cos0\,\hat y + \sin0\,\hat z = \hat y$ ✓. A quarter period later, multiply by $e^{j90°} = j$: $\Re\{j\hat y + \hat z\} = \hat z$, and the field is $\cos90°\,\hat y + \sin90°\,\hat z = \hat z$ ✓.

        **(iii) Step 5: the direction of travel.** Follow one crest, a point where the phase stays fixed:
        $$\omega t + \beta x = \text{const}$$
        As $t$ grows, $\beta x$ has to shrink to keep the sum fixed. So $x$ decreases: the wave travels toward $\boxed{-\hat x}$. In the phasor, the same fact shows as $e^{+j\beta x}$ (a wave toward $+x$ would have $e^{-j\beta x}$).

        **(ii) Step 6: $\mathbf H$ from $\mathbf E$.** In a plane wave, $\mathbf E$, $\mathbf H$ and the direction of travel $\hat v$ form a right-handed set, and $|\mathbf E| = \eta_0|\mathbf H|$. Both facts are in one line:
        $$\Ht = \frac{1}{\eta_0}\,\hat v\times\Et$$
        Here $\hat v = -\hat x$. Do the two cross products one at a time:
        $$(-\hat x)\times\hat y = -\hat z$$
        $$(-\hat x)\times(-j\hat z) = j\,(\hat x\times\hat z) = -j\hat y$$
        Collect them:
        $$\boxed{\Ht(x) = \frac{1}{120\pi}(-\hat z - j\hat y)\,e^{j\beta x}\ \text{A/m}}$$
        !!intuition Does this make sense?
          Pair each part of $\mathbf E$ with its own $\mathbf H$: $\hat y$ goes with $-\hat z$, and $\hat y\times(-\hat z) = -\hat x$ ✓. $-j\hat z$ goes with $-j\hat y$, and $\hat z\times\hat y = -\hat x$ ✓. Both point along the travel.

        **Speed path.** Cosine $\to 1$, sine $\to -j$, keep $e^{+j\beta x}$. Same signs on $\omega t$ and $\beta x$ means travel toward $-x$. For $\mathbf H$, turn each component with "$-\hat x\,\times$": $\hat y\to-\hat z$, $\hat z\to+\hat y$, then divide by $120\pi$.

        **Where points go.** A sine written as $+j$; the exponent written $e^{-j\beta x}$ out of habit; using $\hat x\times$ instead of $-\hat x\times$ (both signs of $\mathbf H$ flip); multiplying by $\eta_0$.
      ` }),
    P({ src: 'Summer 2019 #1a(iv)–(v) · 8 pts', title: 'The power of one component, and of both',
      q: md`(iv) (3 pts) Let $\mathbf E_1(\mathbf r, t) \equiv \hat y\,(\mathbf E\cdot\hat y)$, the $\hat y$ part of the wave alone. How much average energy does $\mathbf E_1$ carry per unit time per unit area in its direction of travel? (You need $\langle\mathbf E_1\times\mathbf H_1\rangle$.)

(v) (5 pts) What is the time-averaged Poynting vector $\langle\mathbf E\times\mathbf H\rangle$ of the whole wave? (You can use (iv).) Give its size; its direction is the one you found in (iii).`,
      parts: [
        NT(md`(iv) $|\langle\mathbf E_1\times\mathbf H_1\rangle|$`, 1 / (240 * PI), 'W/m^2', [{ v: 1 / (120 * PI), msg: 'That is E₀²/η₀ with no ½. The time average of cos² is ½.' }, { v: 120 * PI / 2, msg: 'That multiplies by η₀. Power per area is E₀²/(2η₀).' }]),
        NT(md`(v) $|\langle\mathbf E\times\mathbf H\rangle|$`, 1 / (120 * PI), 'W/m^2', [{ v: 1 / (240 * PI), msg: 'That is one component only. The ẑ part carries the same power again.' }, { v: Math.SQRT2 / (240 * PI), msg: 'Powers of two perpendicular components add directly; no √2 appears.' }]),
      ],
      hints: [md`For one linearly polarized wave of amplitude $E_0$ in free space, $|\langle\mathbf S\rangle| = \dfrac{E_0^2}{2\eta_0}$.`, md`The $\hat y$ part and the $\hat z$ part are perpendicular, so their cross terms in $\mathbf E\times\mathbf H$ vanish: the two powers simply add.`],
      sol: md`
        **(iv) Step 1: the one-component wave.** $\mathbf E_1 = \hat y\cos(\omega t + \beta x)$: amplitude 1 V/m, traveling toward $-x$. Its $\mathbf H_1$ is $\frac{1}{\eta_0}(-\hat x)\times\mathbf E_1$:
        $$\mathbf H_1 = -\hat z\,\frac{1}{\eta_0}\cos(\omega t + \beta x)$$
        **Step 2: the instantaneous Poynting vector.** $\hat y\times(-\hat z) = -\hat x$:
        $$\mathbf E_1\times\mathbf H_1 = -\hat x\,\frac{1}{\eta_0}\cos^2(\omega t + \beta x)$$
        **Step 3: the time average.** $\cos^2$ swings between 0 and 1 and averages $\tfrac12$:
        $$\langle\mathbf E_1\times\mathbf H_1\rangle = -\hat x\,\frac{1}{2\eta_0} = -\hat x\,\frac{1}{240\pi}\ \text{W/m}^2$$
        So $\mathbf E_1$ carries $\boxed{\dfrac{1}{240\pi} \approx 1.33\times10^{-3}\ \text{W/m}^2}$ toward $-x$.

        The phasor route gives the same: $\langle\mathbf S\rangle = \frac12\Re\{\Et\times\Ht^*\}$, and $\hat ye^{j\beta x}\times(-\hat z)\frac{1}{\eta_0}e^{-j\beta x} = -\hat x/\eta_0$. Half of it is $-\hat x/(240\pi)$ ✓.

        **(v) Step 4: the whole wave.** Write $\mathbf E = \mathbf E_1 + \mathbf E_2$ with $\mathbf E_2 = \hat z\sin(\omega t + \beta x)$. Its field is $\mathbf H_2 = \frac{1}{\eta_0}(-\hat x)\times\mathbf E_2 = +\hat y\,\frac{1}{\eta_0}\sin(\omega t + \beta x)$. Multiply out:
        $$\mathbf E\times\mathbf H = \mathbf E_1\times\mathbf H_1 + \mathbf E_2\times\mathbf H_2 + \mathbf E_1\times\mathbf H_2 + \mathbf E_2\times\mathbf H_1$$
        The cross terms are $\hat y\times\hat y = 0$ and $\hat z\times\hat z = 0$. They vanish. The second term is $\hat z\times\hat y = -\hat x$ times $\sin^2/\eta_0$. So
        $$\mathbf E\times\mathbf H = -\hat x\,\frac{\cos^2 + \sin^2}{\eta_0} = -\hat x\,\frac{1}{\eta_0}$$
        It does not depend on time at all. Its average is itself:
        $$\boxed{\langle\mathbf E\times\mathbf H\rangle = -\hat x\,\frac{1}{120\pi} \approx -\hat x\,2.65\times10^{-3}\ \text{W/m}^2}$$
        twice part (iv).

        !!intuition Does this make sense?
          A circular wave is two linear waves of equal size, a quarter period apart, in perpendicular directions. Perpendicular fields do not interfere, so the powers add: twice one of them. And the total is steady in time: when one component is at zero, the other is at its peak. A linear wave delivers its power in pulses at $2\omega$; a circular one delivers it smoothly.

        **Speed path.** Each component: $E_0^2/(2\eta_0)$. A circular wave has two of them: $E_0^2/\eta_0 = 1/(120\pi)$. Direction: the travel.

        **Where points go.** Forgetting the $\tfrac12$ in (iv); in (v), adding the amplitudes first ($|\mathbf E| = \sqrt2$?) and then doubling, or adding a spurious $\sqrt2$. $|\mathbf E|$ is 1 at every instant, and $|\mathbf E|^2/\eta_0$ with no $\tfrac12$ is the right total, because nothing oscillates.
      ` }),
    P({ src: 'Summer 2019 #1a(vi) · 3 pts', title: 'Which hand?',
      q: md`(vi) (3 pts) How is the wave $\mathbf E(\mathbf r, t)$ polarized: linear, right-circular or left-circular? Show your work.`,
      parts: [mc(md`The polarization is`, [md`left-circular`, md`right-circular`, md`linear`, md`elliptical, not circular`], 0,
        [null, md`The tip turns from $\hat y$ toward $\hat z$, a turn about $\hat y\times\hat z = +\hat x$. The wave travels toward $-x$: the thumb of the right hand would point the wrong way.`, md`Linear needs the two components in phase (or $180°$ apart). Here they are $90°$ apart: $\cos$ and $\sin$.`, md`Elliptical needs unequal sizes or a phase other than $90°$. The sizes are both 1 and the phases are $90°$ apart, and $|\mathbf E| = \sqrt{\cos^2 + \sin^2} = 1$ at every instant: a circle.`])],
      hints: [md`Watch the tip of $\mathbf E$ at $x = 0$: where is it at $t = 0$, and where a quarter period later?`, md`The course (IEEE) rule: point the thumb along the travel. If the fingers of the **right** hand curl the way the tip turns, it is right-circular.`],
      sol: md`
        **Step 1: watch one point.** At $x = 0$ the field is
        $$\mathbf E(0, t) = \hat y\cos\omega t + \hat z\sin\omega t$$
        Its size is $\sqrt{\cos^2\omega t + \sin^2\omega t} = 1$ at every instant. The tip stays on a circle: **circular**.

        **Step 2: which way it turns.** At $t = 0$ the tip is at $\hat y$. At $t = T/4$ ($\omega t = 90°$) it is at $\hat z$. It turns from $\hat y$ toward $\hat z$.

        **Step 3: the axis of the turn.** Curl the fingers of the right hand from $\hat y$ to $\hat z$. The thumb points along
        $$\hat y\times\hat z = +\hat x$$
        **Step 4: compare with the travel.** The wave travels toward $-\hat x$ (part iii). The right thumb points against the travel, so the right hand does not fit; the left hand does. The wave is $\boxed{\text{left-circular (LHC)}}$.

        [[fig:pol]]

        **A picture that does this for you.** Draw the two field axes so that the third axis comes out of the page ($\hat y$ right, $\hat z$ up, $\hat x$ out). A counterclockwise turn on the page is right-handed about the out-of-page axis. Here the tip turns counterclockwise, which is right-handed about $+\hat x$, but the wave goes into the page: left-circular. The key agrees.

        **Speed path.** $\mathbf E(0)\times\mathbf E(T/4)$ gives the rotation axis: $\hat y\times\hat z = +\hat x$. Its dot product with the travel $-\hat x$ is negative: left-handed.

        **Where points go.** Judging the turn while looking at the wrong side of the page (it looks reversed from behind); forgetting that the travel is toward $-x$; calling it linear because each component alone is linear.
      `,
      figs: { pol: { svg: polFig({ h: 'y', v: 'z', e0: 0, e1: 90, travel: -1, alt: 'the y-z plane with x out of the page; the wave travels into the page; E at t = 0 points along +y, at T/4 along +z; the tip turns counterclockwise' }), cap: 'Seen with $\\hat x$ out of the page. The wave travels into the page (⊗). The tip turns counterclockwise, which is right-handed about $+\\hat x$: opposite to the travel, so left-circular.' } } }),
    P({ src: 'Summer 2019 #1b · 5 pts', title: 'J·E in a conductor',
      q: md`Part (b). In a conducting medium, $\mathbf E = 2\hat x\cos(\omega t)$ V/m at $\mathbf r = 0$, and the conductivity is $\sigma = 10^{-3}$ S/m.

(i) (3 pts) What are the maximum and the time-averaged value of $\mathbf J\cdot\mathbf E$ at the same location?

(ii) (2 pts) What is the physical meaning of $\mathbf J\cdot\mathbf E$? Hint: look at its unit.`,
      parts: [
        NT(md`(i) $(\mathbf J\cdot\mathbf E)_{\max}$`, 4e-3, 'W/m^3', [{ v: 2e-3, msg: 'That is σE₀ (the current density), or the average. The maximum is σE₀² = (10⁻³)(2²).' }]),
        NT(md`(i) $\langle\mathbf J\cdot\mathbf E\rangle$`, 2e-3, 'W/m^3', [{ v: 4e-3, msg: 'That is the maximum. The average of cos² is ½.' }, { v: 1e-3, msg: 'That halves twice. σE₀² = 4×10⁻³, and the average is half of that.' }]),
        mc(md`(ii) $\mathbf J\cdot\mathbf E$ is`, [md`the power turned into heat per unit volume, in W/m³`, md`the power flowing through a unit area, in W/m²`, md`the energy stored per unit volume, in J/m³`, md`the force on the charges per unit volume, in N/m³`], 0,
          [null, md`Power through an area is the Poynting vector $\mathbf E\times\mathbf H$. $\mathbf J\cdot\mathbf E$ has (A/m²)(V/m) = W/m³: per volume.`, md`Stored energy density is $\tfrac12\epsilon E^2 + \tfrac12\mu H^2$, in J/m³. $\mathbf J\cdot\mathbf E$ is a rate: watts, not joules.`, md`The force density on the charges is $\rho\mathbf E + \mathbf J\times\mathbf B$. $\mathbf J\cdot\mathbf E$ is the **power** that force delivers.`]),
      ],
      hints: [md`Ohm's law at a point: $\mathbf J = \sigma\mathbf E$. So $\mathbf J\cdot\mathbf E = \sigma|\mathbf E|^2$.`],
      sol: md`
        **Step 1: the current.** Ohm's law at a point says the field drives a current density
        $$\mathbf J = \sigma\mathbf E = (10^{-3})(2\hat x\cos\omega t) = 2\times10^{-3}\,\hat x\cos\omega t\ \ \text{A/m}^2$$
        **Step 2: the product.** $\mathbf J$ and $\mathbf E$ are parallel, so the dot product is the product of the sizes:
        $$\mathbf J\cdot\mathbf E = \sigma|\mathbf E|^2 = (10^{-3})(4\cos^2\omega t)$$
        $$\mathbf J\cdot\mathbf E = 4\times10^{-3}\cos^2\omega t\ \ \text{W/m}^3$$
        **Step 3: maximum and average.** $\cos^2$ peaks at 1 and averages $\tfrac12$:
        $$\boxed{(\mathbf J\cdot\mathbf E)_{\max} = 4\times10^{-3}\ \text{W/m}^3}$$
        $$\boxed{\langle\mathbf J\cdot\mathbf E\rangle = 2\times10^{-3}\ \text{W/m}^3}$$
        **(ii) Step 4: the meaning.** The units are (A/m²)(V/m) = W/m³: a power per unit volume. In Poynting's theorem, $\mathbf J\cdot\mathbf E$ is the rate at which the field does work on moving charges. In a conductor the charges collide with the lattice, so that work becomes **heat**: $\mathbf J\cdot\mathbf E$ is the Joule heating per unit volume.

        !!intuition Does this make sense?
          It is never negative here: $\sigma|\mathbf E|^2 \geq 0$. A resistor only ever absorbs power, whichever way the current flows. And it is the field version of $P = I^2R$: per unit volume, $J^2/\sigma$.

        **Speed path.** $\sigma E_0^2 = 4\times10^{-3}$ is the peak; half of it is the average.

        **Where points go.** Units of W/m² (the Poynting vector's unit, not this one); forgetting to square the 2; giving $\sigma E_0$ (a current density) as the answer.
      ` }),

    // ---------------------------------------------------------------- Problem 2
    RF(md`
      ### Problem 2 (25 points): a current sheet switched on at t = 0

      A time-varying surface current density
      $$\mathbf J_s(t) = u(t)\cos(2\pi ft)\,\hat x\ \ \text{A/m}$$
      with $f = \tfrac12\times10^6$ Hz, lies on the surface $y = 0$ in free space. Here $u(t)$ is the unit step, which switches the cosine on at $t = 0$, and $\omega = 2\pi f = \pi$ rad/µs. Throughout, measure $t$ in µs and distance in m; then $c = 300$ m/µs.

      [[fig:sh]]
    `, { sh: { svg: sheetFig({ n: 'y', jl: 'J_s\\ (\\hat x)', right: '\\text{toward }+y', left: '\\text{toward }-y', alt: 'the sheet y = 0 seen edge-on as a dashed vertical line; the current J_s runs along x, drawn up the sheet; one wave leaves toward +y and one toward -y' }), cap: 'The sheet edge-on. The current runs along $\\hat x$ (drawn up the page); one wave leaves each side.' } }),
    P({ src: 'Summer 2019 #2a · 3 pts', title: 'The current itself',
      q: md`(a) (3 pts) Plot $J_{sx}(t)$ versus $t$ for $-4 < t < 4$ µs. Sketch it on paper, then pick the matching plot and read two values off it.

[[fig:c]]`,
      figs: { c: { svg: row4([wplot((t) => step(t) * Math.sin(PI * t), tJ), wplot((t) => Math.cos(PI * t), tJ), wplot(s19j, tJ), wplot((t) => step(t) * Math.cos(2 * PI * t), tJ)]), cap: 'Four candidates for $J_{sx}(t)$, in A/m.' } },
      parts: [
        mc(md`Which plot is $J_{sx}(t)$?`, PLOTS, 2,
          [md`Plot A starts from zero and rises: that is $u(t)\sin(\pi t)$. A cosine is at its peak, 1, the moment it switches on.`, md`Plot B is nonzero before $t = 0$: it ignores the step $u(t)$, which holds the current at zero until $t = 0$.`, null, md`Plot D repeats every 1 µs: that is $\cos(2\pi t)$, a 1 MHz signal. Here $\omega = \pi$ rad/µs, so the period is $2\pi/\omega = 2$ µs.`], true),
        N(md`$J_{sx}$ at $t = 1$ µs`, -1, 'A/m'),
        NT(md`the period, in µs`, 2, 'μs', [{ v: 1, msg: 'That is the period of a 1 MHz signal. f = ½ MHz gives T = 1/f = 2 µs.' }, { v: 0.5, msg: 'That is f in MHz. The period is 1/f.' }]),
      ],
      hints: [md`$u(t) = 0$ for $t < 0$ and $1$ for $t > 0$. So $J_{sx} = 0$ before $t = 0$ and $\cos(\pi t)$ after.`],
      sol: md`
        **Step 1: before $t = 0$.** The step is zero, so $J_{sx} = 0$.

        **Step 2: after $t = 0$.** The step is 1, so $J_{sx} = \cos(\pi t)$ with $t$ in µs. At $t = 0^+$ that is $\cos 0 = 1$: the current **jumps** from 0 to 1 A/m.

        **Step 3: the period.**
        $$T = \frac{1}{f} = \frac{1}{0.5\times10^6\ \text{Hz}} = 2\ \mu\text{s}$$
        **Step 4: mark the easy points.** $\cos(\pi t)$ is $1$ at $t = 0, 2, 4$; $0$ at $t = 0.5, 1.5, 2.5, 3.5$; $-1$ at $t = 1, 3$. So $\boxed{J_{sx}(1\ \mu\text{s}) = -1\ \text{A/m}}$ and the period is $\boxed{2\ \mu\text{s}}$. The answer is **Plot C**:

        [[fig:a]]

        **Speed path.** Zero, a jump to 1 at $t = 0$, then a cosine with a 2 µs period: two full cycles in the window.

        **Where points go.** Drawing the cosine for $t < 0$; starting from zero like a sine; a 1 µs period from reading $\omega = \pi$ as $2\pi$.
      `,
      figs: { c: { svg: row4([wplot((t) => step(t) * Math.sin(PI * t), tJ), wplot((t) => Math.cos(PI * t), tJ), wplot(s19j, tJ), wplot((t) => step(t) * Math.cos(2 * PI * t), tJ)]), cap: 'Four candidates for $J_{sx}(t)$, in A/m.' },
        a: { svg: wplot(s19j, Object.assign({}, tJ, { w: 380, h: 170 })), cap: '$J_{sx}(t)$: zero, a jump to 1 A/m at t = 0, then cos(πt) with a 2 µs period.' } } }),
    P({ src: 'Summer 2019 #2b–c · 8 pts', title: 'E for y > 0 and H for y < 0',
      q: md`(b) (4 pts) What is the vector wave field $\mathbf E(y, t)$ produced by $\mathbf J_s(t)$ in the region $y > 0$?

(c) (4 pts) What is the vector wave field $\mathbf H(y, t)$ in the region $y < 0$?

In the choices, $t$ is in µs, $y$ in m, and $c = 300$ m/µs.`,
      parts: [
        mc(md`(b) $\mathbf E(y, t)$ for $y > 0$, in V/m`, [md`$-60\pi\,u(t - \tfrac yc)\cos\pi(t - \tfrac yc)\,\hat x$`, md`$+60\pi\,u(t - \tfrac yc)\cos\pi(t - \tfrac yc)\,\hat x$`, md`$-60\pi\,u(t + \tfrac yc)\cos\pi(t + \tfrac yc)\,\hat x$`, md`$-120\pi\,u(t - \tfrac yc)\cos\pi(t - \tfrac yc)\,\hat x$`], 0,
          [null, md`The sign: the field at the sheet points **against** the current, $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$.`, md`$t + y/c$ is a wave moving toward $-y$, coming in toward the sheet. On the $y > 0$ side the wave moves away from the sheet: $t - y/c$.`, md`That is $\eta_0 J_s$. The sheet's current feeds two waves, one each way, so each gets $\eta_0/2$.`]),
        NT(md`(b) $E_x$ at $y = 300$ m, $t = 2$ µs`, E60, 'V/m', [{ v: -E60, msg: 'Right size, wrong sign. The delay is 1 µs, so you need −60π·cos(π·1) = +60π.' }]),
        mc(md`(c) $\mathbf H(y, t)$ for $y < 0$, in A/m`, [md`$-\tfrac12\,u(t + \tfrac yc)\cos\pi(t + \tfrac yc)\,\hat z$`, md`$+\tfrac12\,u(t + \tfrac yc)\cos\pi(t + \tfrac yc)\,\hat z$`, md`$-\tfrac12\,u(t - \tfrac yc)\cos\pi(t - \tfrac yc)\,\hat z$`, md`$-\tfrac12\,u(t + \tfrac yc)\cos\pi(t + \tfrac yc)\,\hat x$`], 0,
          [null, md`That is the $y > 0$ side's sign. $\mathbf H$ flips across the sheet (that jump **is** the current). Check: for $y < 0$, $\mathbf E\times\mathbf H$ must point toward $-\hat y$.`, md`For $y < 0$, $|y| = -y$, so the delay $t - |y|/c$ is $t + y/c$. $t - y/c$ there would be a wave moving toward the sheet.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ (along $\hat x$) and to the travel (along $\hat y$): it is along $\hat z$.`]),
        NT(md`(c) $H_z$ at $y = -300$ m, $t = 2$ µs`, 0.5, 'A/m', [{ v: -0.5, msg: 'Right size, wrong sign. Check the sign of H on the y < 0 side, and that cos(π·1) = −1.' }]),
      ],
      hints: [md`At the sheet, $\mathbf E_s = -\frac{\eta_0}{2}\mathbf J_s$ on both sides. Each side sees it delayed by $|y|/c$.`, md`$\mathbf H = \frac{1}{\eta_0}\hat v\times\mathbf E$ with $\hat v = -\hat y$ on the $y < 0$ side.`],
      sol: md`
        ${sheetFirst('y')}

        **(b) Step 1: $y > 0$.** $|y| = y$ and $\eta_0/2 = 60\pi$:
        $$\boxed{\mathbf E = -\hat x\,60\pi\,u(t')\cos(\pi t')\ \text{V/m}}$$
        with the delayed time $t' = t - y/c$. Written out: $\mathbf E(y, t) = -\hat x\,60\pi\,u(t - \tfrac yc)\cos\pi(t - \tfrac yc)$ V/m. In seconds and meters the cosine is $\cos(\pi\times10^6t - \tfrac{\pi}{300}y)$: the same thing.

        **Step 2: a value.** At $y = 300$ m the delay is 1 µs, so at $t = 2$ µs, $t' = 1$:
        $$E_x = -60\pi\cos(\pi) = +60\pi \approx \boxed{188\ \text{V/m}}$$
        **(c) Step 3: $y < 0$.** Now $|y| = -y$, so $t - |y|/c = t + y/c$:
        $$\mathbf E = -\hat x\,60\pi\,u\!\left(t + \tfrac yc\right)\cos\pi\!\left(t + \tfrac yc\right)$$
        **Step 4: $\mathbf H$ on that side.** The wave travels toward $-\hat y$, so $\mathbf H = \frac{1}{\eta_0}(-\hat y)\times\mathbf E$. The direction part is $(-\hat y)\times(-\hat x) = \hat y\times\hat x = -\hat z$, and $60\pi/120\pi = \tfrac12$:
        $$\boxed{\mathbf H(y, t) = -\hat z\,\tfrac12\,u\!\left(t + \tfrac yc\right)\cos\pi\!\left(t + \tfrac yc\right)\ \text{A/m}}$$
        **Step 5: a value.** At $y = -300$ m and $t = 2$ µs, $t + y/c = 1$:
        $$H_z = -\tfrac12\cos(\pi) = \boxed{+0.5\ \text{A/m}}$$
        !!intuition Does this make sense?
          On the $y > 0$ side, $\mathbf H = \frac{1}{\eta_0}\hat y\times\mathbf E$, which is $+\hat z\,\tfrac12\cos(\cdot)$: the **opposite** sign. Check the jump: $\hat y\times(\mathbf H_+ - \mathbf H_-) = \hat y\times\hat z\,J_{sx} = \hat x\,J_{sx}$ ✓, exactly the current. The sizes check too: $|\mathbf H| = J_s/2$ on each side, half the current per side.

        **Speed path.** Memorize one line: $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(t - |n|/c)$ on both sides. Then get $\mathbf H$ (size $J_s/2$) by making $\mathbf E\times\mathbf H$ point away from the sheet.

        **Where points go.** Dropping the minus sign; writing $t - y/c$ on the $y < 0$ side; giving $\mathbf H$ the same sign on both sides; using $\eta_0$ instead of $\eta_0/2$; forgetting the $u(\cdot)$ that says where the front is.
      ` }),
    P({ src: 'Summer 2019 #2d · 3 pts', title: 'The wavelength',
      q: md`(d) (3 pts) What is the wavelength $\lambda$ of the modulated waveforms $\mathbf E(y, t)$ and $\mathbf H(y, t)$?`,
      parts: [NT(md`$\lambda$`, 600, 'm', [{ v: 300, msg: 'That is c/f for f = 1 MHz. Here f = ½ MHz.' }, { v: 2, msg: 'That is the period in µs, not a length.' }])],
      hints: [md`Inside the step, the waveform is an ordinary cosine wave: $\lambda = c/f$.`],
      sol: md`
        **Step 1.** The step $u(\cdot)$ only marks where the wave has reached; behind the front the field is an ordinary cosine wave of frequency $f$. Its wavelength is
        $$\lambda = \frac{c}{f} = \frac{3\times10^8\ \text{m/s}}{0.5\times10^6\ \text{Hz}} = \boxed{600\ \text{m}}$$
        **Step 2: check with the cosine.** $\cos\pi(t - y/300)$ has $\beta = \pi/300$ rad/m, so $\lambda = 2\pi/\beta = 600$ m ✓.

        **Speed path.** $c = 300$ m/µs and $T = 2$ µs, so $\lambda = cT = 600$ m: one period of travel.

        **Where points go.** Using $\omega$ for $f$ ($c/\omega$ is $\lambda/2\pi$); mixing µs and s.
      ` }),
    P({ src: 'Summer 2019 #2e · 5 pts', title: 'E_x versus t at y = 300 m',
      q: md`(e) (5 pts) Plot $E_x(y, t)$ versus $t$ at $y = 300$ m for $0 < t < 5$ µs. Label both axes. (Hint: $E_x$ is zero until the wavefront arrives at 300 m.) Sketch it, then pick the matching plot and read values off it.

[[fig:c]]`,
      figs: { c: { svg: row4([wplot((t) => E60 * s19j(t - 1), tE19), wplot(s19E, tE19), wplot((t) => -E60 * s19j(t), tE19), wplot((t) => -E60 * step(t - 1) * Math.sin(PI * (t - 1)), tE19)]), cap: 'Four candidates for $E_x(300\\ \\text{m}, t)$, in V/m.' } },
      parts: [
        mc(md`Which plot is $E_x(300\ \text{m}, t)$?`, PLOTS, 1,
          [md`Plot A has the right timing and the wrong sign: it jumps **up**. The field is $-\frac{\eta_0}{2}J_s$, against the current, so it jumps down to $-60\pi$.`, null, md`Plot C starts at $t = 0$: that is the field **at the sheet**. 300 m away it arrives $300/300 = 1$ µs later.`, md`Plot D starts smoothly from zero, like a sine. The current switches on at its peak ($\cos0 = 1$), so the field jumps at the front.`], true),
        N(md`the time the front reaches $y = 300$ m`, 1, 'μs'),
        NT(md`$E_x$ at $t = 1.25$ µs`, -E60 / Math.SQRT2, 'V/m', [{ v: E60 / Math.SQRT2, msg: 'Right size, wrong sign: just after the front the field is −60π, and it is still on its way back up at 1.25 µs.' }, { v: -E60, msg: 'That is the value right at the front. A quarter of a µs later, cos(π/4) = 0.707 of it.' }]),
      ],
      hints: [md`At $y = 300$ m: $E_x = -60\pi\,u(t - 1)\cos\pi(t - 1)$, with $t$ in µs.`],
      sol: md`
        **Step 1: the delay.** The front travels 300 m at 300 m/µs: it arrives at $t = 1$ µs. Put $y = 300$ m in part (b):
        $$E_x(300, t) = -60\pi\,u(t - 1)\cos\pi(t - 1)$$
        **Step 2: before the front.** For $t < 1$ µs, $u = 0$: the field is zero.

        **Step 3: at the front.** At $t = 1^+$, $\cos0 = 1$, so $E_x$ **jumps** from 0 to $-60\pi \approx -188$ V/m. The sheet switched the current on at full strength, and the wave carries that jump out.

        **Step 4: after.** A cosine with a 2 µs period: $E_x = 0$ at $t = 1.5$, $+60\pi$ at $t = 2$, $0$ at $2.5$, $-60\pi$ at $3$, $+60\pi$ at $4$, $-60\pi$ at $5$. It is **Plot B**:

        [[fig:e]]

        **Step 5: the value at 1.25 µs.** $t - 1 = 0.25$, a quarter of the way to the first zero:
        $$E_x = -60\pi\cos\frac{\pi}{4} = -\frac{60\pi}{\sqrt2} = \boxed{-133\ \text{V/m}}$$
        **Speed path.** "Same waveform as the source, delayed by $y/c$, times $-60\pi$." Shift the cosine of part (a) right by 1 µs and flip it.

        **Where points go.** Not labeling the axes (the paper asks); no jump at the front; forgetting the minus sign; drawing the front at 2 µs from $c = 150$ m/µs.
      `,
      figs: { c: { svg: row4([wplot((t) => E60 * s19j(t - 1), tE19), wplot(s19E, tE19), wplot((t) => -E60 * s19j(t), tE19), wplot((t) => -E60 * step(t - 1) * Math.sin(PI * (t - 1)), tE19)]), cap: 'Four candidates for $E_x(300\\ \\text{m}, t)$, in V/m.' },
        e: { svg: wplot(s19E, Object.assign({}, tE19, { w: 360, h: 180 })), cap: '$E_x$ at y = 300 m: zero until the front arrives at 1 µs, a jump to −60π V/m, then −60π cos π(t − 1).' } } }),
    P({ src: 'Summer 2019 #2f · 6 pts', title: 'H_z versus y at t = 3 µs',
      q: md`(f) (6 pts) Plot $H_z(y, t)$ versus $y$ at $t = 3$ µs over $0 < y < 1200$ m. Label both axes. (Hint: $H_z$ is zero where the wavefront has not yet reached.) Sketch it, then pick the matching plot and read values off it.

[[fig:c]]`,
      figs: { c: { svg: row4([wplot((y) => -s19H(y), zH19), wplot((y) => -0.5 * Math.cos(PI * y / 300), zH19), wplot((y) => (y < 900 ? -0.5 * Math.cos(2 * PI * y / 300) : 0), zH19), wplot(s19H, zH19)]), cap: 'Four candidates for $H_z(y, 3\\ \\mu\\text{s})$, in A/m.' } },
      parts: [
        mc(md`Which plot is $H_z(y, 3\ \mu\text{s})$?`, PLOTS, 3,
          [md`Plot A has the sign of the $y < 0$ side, part (c). For $y > 0$, $\mathbf H = \frac{1}{\eta_0}\hat y\times\mathbf E = +\hat z\tfrac12\cos\pi(t - y/c)$: at the front it must be $+\tfrac12$, the current's first value.`, md`Plot B fills the whole range. After 3 µs the front has only reached $(300)(3) = 900$ m; beyond it the field is zero.`, md`Plot C repeats every 300 m. The wavelength is 600 m (part d).`, null], true),
        NT(md`the position of the front, in m`, 900, 'm', [{ v: 1200, msg: 'That is the end of the window. The front is at ct = (300 m/µs)(3 µs).' }]),
        NT(md`$H_z$ at $y = 300$ m`, 0.5, 'A/m', [{ v: -0.5, msg: 'Wrong sign: on the y > 0 side H_z = +½ cos π(t − y/c), and here t − y/c = 2.' }]),
        NT(md`$H_z$ at $y = 100$ m`, -0.25, 'A/m', [{ v: 0.25, msg: 'Wrong sign: at y = 100 m, t − y/c = 8/3 µs and cos(8π/3) = −½.' }]),
      ],
      hints: [md`For $y > 0$: $H_z = +\tfrac12\,u(t - \tfrac yc)\cos\pi(t - \tfrac yc)$. Put $t = 3$.`, md`$\cos(3\pi - \theta) = -\cos\theta$.`],
      sol: md`
        **Step 1: $\mathbf H$ on the $y > 0$ side.** The wave travels toward $+\hat y$, so $\mathbf H = \frac{1}{\eta_0}\hat y\times\mathbf E$, and $\hat y\times(-\hat x) = +\hat z$:
        $$H_z = +\tfrac12\,u\!\left(t - \tfrac{y}{300}\right)\cos\pi\!\left(t - \tfrac{y}{300}\right)$$
        **Step 2: freeze $t = 3$ µs.** The front is where $t - y/300 = 0$: at $y = 900$ m. Beyond it, $H_z = 0$. Behind it:
        $$H_z = \tfrac12\cos\!\left(3\pi - \frac{\pi y}{300}\right)$$
        **Step 3: simplify.** $\cos(3\pi - \theta) = \cos3\pi\cos\theta + \sin3\pi\sin\theta = -\cos\theta$:
        $$H_z(y, 3\ \mu\text{s}) = -\tfrac12\cos\frac{\pi y}{300},\qquad 0 < y < 900\ \text{m}$$
        **Step 4: mark points.** $y = 0$: $-\tfrac12$. $y = 150$: 0. $y = 300$: $+\tfrac12$. $y = 600$: $-\tfrac12$. $y = 900^-$: $+\tfrac12$, then a jump to 0. One and a half wavelengths fit behind the front. It is **Plot D**:

        [[fig:h]]

        **Step 5: the values.** $\boxed{H_z(300) = +0.5\ \text{A/m}}$, and at $y = 100$ m:
        $$H_z = -\tfrac12\cos\frac{\pi}{3} = \boxed{-0.25\ \text{A/m}}$$
        !!intuition Does this make sense?
          A snapshot in space is the source's history **read backward**. The front, farthest out, carries the earliest value: the current switched on at $+1$, so $H_z = +\tfrac12$ right behind the front. Moving back toward the sheet you meet later and later values of the current, ending with the value it has now, at $y = 0$: $\cos(3\pi) = -1$, so $-\tfrac12$.

        **Speed path.** Front at $ct$. Just behind the front: the first value of the source (here $+\tfrac12$, with the sign of $\mathbf H$ on this side). Then draw the source waveform backward toward the sheet with $\lambda = 600$ m.

        **Where points go.** Using the $y < 0$ sign of $\mathbf H$; drawing the shape forward from the sheet (the time plot pasted in as a space plot); no jump at the front; missing axis labels. The key's sketch is right, though it labels the horizontal axis "$z$ (m)"; it is $y$.
      `,
      figs: { c: { svg: row4([wplot((y) => -s19H(y), zH19), wplot((y) => -0.5 * Math.cos(PI * y / 300), zH19), wplot((y) => (y < 900 ? -0.5 * Math.cos(2 * PI * y / 300) : 0), zH19), wplot(s19H, zH19)]), cap: 'Four candidates for $H_z(y, 3\\ \\mu\\text{s})$, in A/m.' },
        h: { svg: wplot(s19H, Object.assign({}, zH19, { w: 360, h: 180 })), cap: '$H_z(y)$ at t = 3 µs: −½ cos(πy/300) behind the front at 900 m, zero beyond it.' } } }),

    // ---------------------------------------------------------------- Problem 3
    R(md`
      ### Problem 3 (25 points): a circular wave from two snapshots, and a good conductor

      Two independent parts. Part (a): a co-sinusoidal plane TEM wave travels in free space in the $+y$ direction at $f = 150$ MHz. At the origin $(x, y, z) = (0, 0, 0)$, its electric field is $2\hat x$ V/m at $t = 0$, and $2\hat z$ V/m at $t = T/4$, where $T$ is the period.
    `),
    P({ src: 'Summer 2019 #3a · 12 pts', title: 'Period, wavelength, hand, phasor',
      q: md`(i) (4 pts) Find the period $T$, the wavelength $\lambda$ and the wavenumber $\beta$.

(ii) (4 pts) Is the wave right- or left-circularly polarized? Explain.

(iii) (4 pts) Write the phasor $\Et$ in terms of $y$, with the numerical value of $\beta$.`,
      parts: [
        NT(md`(i) $T$`, 1e9 / 150e6, 'ns', [{ v: 150 / 1e3, msg: 'Period is 1/f: 1/(150 MHz) = 6.67 ns.' }]),
        N(md`(i) $\lambda$`, 2, 'm'),
        NT(md`(i) $\beta$`, PI, 'rad/m', [{ v: 0.5, msg: 'That is 1/λ. β = 2π/λ.' }]),
        mc(md`(ii) The wave is`, [md`left-circular`, md`right-circular`], 0,
          [null, md`The tip turns from $\hat x$ to $\hat z$, a turn about $\hat x\times\hat z = -\hat y$. The wave travels toward $+\hat y$: the right thumb points against it.`]),
        mc(md`(iii) $\Et$, in V/m`, [md`$2(\hat x - j\hat z)\,e^{-j\pi y}$`, md`$2(\hat x + j\hat z)\,e^{-j\pi y}$`, md`$2(\hat x - j\hat z)\,e^{+j\pi y}$`, md`$2(\hat x - j\hat z)\,e^{-j2\pi y}$`], 0,
          [null, md`$+j$ makes the $\hat z$ part peak a quarter period **before** $t = 0$: at $t = T/4$ it would be $-2\hat z$. Its phasor must be $2e^{-j90°} = -2j$.`, md`$e^{+j\pi y}$ is a wave toward $-y$. Travel toward $+y$ needs $e^{-j\beta y}$.`, md`$\beta = 2\pi/\lambda = 2\pi/2 = \pi$ rad/m, not $2\pi$.`]),
      ],
      hints: [md`$\lambda = c/f$ and $\beta = 2\pi/\lambda$.`, md`For each component, the value at $t = 0$ and at $t = T/4$ fix its amplitude and phase. A component that is 0 at $t = 0$ and 2 at $T/4$ is $2\cos(\omega t - 90°)$.`],
      sol: md`
        **(i) Step 1.** Everything follows from $f$:
        $$T = \frac1f = \frac{1}{150\times10^6} = \frac{1}{150}\ \mu\text{s} \approx \boxed{6.67\ \text{ns}}$$
        $$\lambda = \frac cf = \frac{3\times10^8}{1.5\times10^8} = \boxed{2\ \text{m}}$$
        $$\beta = \frac{2\pi}{\lambda} = \boxed{\pi\ \text{rad/m}}$$
        **(iii) Step 2: each component from two snapshots.** At the origin write the $x$ part as $A\cos(\omega t + a)$. The snapshots say it is 2 at $t = 0$ and 0 at $\omega t = 90°$:
        $$A\cos a = 2,\qquad A\cos(90° + a) = 0$$
        The second gives $a = 0$; the first then gives $A = 2$. So $E_x = 2\cos\omega t$, with phasor $2$.

        Do the same for the $z$ part, $B\cos(\omega t + b)$: 0 at $t = 0$ and 2 at $\omega t = 90°$:
        $$B\cos b = 0,\qquad B\cos(90° + b) = 2$$
        The first gives $b = \pm90°$; the second picks $b = -90°$ with $B = 2$. So $E_z = 2\cos(\omega t - 90°) = 2\sin\omega t$, with phasor $2e^{-j90°} = -2j$.

        **Step 3: add the travel.** Toward $+y$, every component carries $e^{-j\beta y}$:
        $$\boxed{\Et = 2(\hat x - j\hat z)\,e^{-j\pi y}\ \text{V/m}}$$
        **(ii) Step 4: the hand.** Equal amplitudes, $90°$ apart: circular. The tip goes from $\hat x$ (at $t = 0$) to $\hat z$ (at $T/4$). The axis of that turn is
        $$\hat x\times\hat z = -\hat y$$
        The wave travels toward $+\hat y$. The right thumb points against the travel: **left-circular (LCP)**.

        [[fig:pol]]

        **Speed path.** $\mathbf E(0)\times\mathbf E(T/4) \propto \hat x\times\hat z = -\hat y$, against the travel: left. For the phasor: whatever $\mathbf E$ is at $t = 0$ is the real part; whatever it becomes at $T/4$ gets a $-j$.

        **Where points go.** $\beta = 2\pi$ from forgetting $\lambda = 2$ m; the $\hat z$ phasor as $+j$ (that would put $-2\hat z$ at $T/4$); $e^{+j\pi y}$; judging the hand with the thumb along $+z$ or toward the viewer instead of along the travel.
      `,
      figs: { pol: { svg: polFig({ h: 'z', v: 'x', e0: 90, e1: 0, travel: 1, alt: 'the z-x plane with y out of the page; the wave travels out of the page; E at t = 0 points along +x (up), at T/4 along +z (right); the tip turns clockwise' }), cap: 'With $\\hat z$ to the right and $\\hat x$ up, $\\hat y$ comes out of the page, the travel direction (⊙). The tip turns clockwise: right-handed about $-\\hat y$, so left-circular.' } } }),
    R(md`
      Part (b): a TEM wave travels in the $-z$ direction in a homogeneous medium with $\mu = \mu_0$, $\epsilon = 81\epsilon_0$ and $\sigma = 4$ S/m. The frequency is $f = 1$ kHz, and **the wavelength is longer than the penetration depth**.
    `),
    P({ src: 'Summer 2019 #3b(i)–(iv) · 10 pts', title: 'Imperfect dielectric or good conductor?',
      q: md`(i) (4 pts) Does the medium act as an *imperfect dielectric* or as a *good conductor* at this frequency? Explain.

(ii) (2 pts) What is the penetration depth $\delta$? Simplify without a calculator.

(iii) (2 pts) What is the wavelength $\lambda$? Simplify without a calculator.

(iv) (2 pts) What is the propagation (phase) velocity $v_p = \omega/\beta$? Simplify without a calculator.`,
      parts: [
        mc(md`(i) The medium is`, [md`a good conductor`, md`an imperfect dielectric`], 0,
          [null, md`An imperfect dielectric has $\alpha \ll \beta$, so the wave runs many wavelengths before it fades: $\delta \gg \lambda$. Here $\lambda > \delta$. And $\sigma/\omega\epsilon \approx 9\times10^5$.`]),
        NT(md`(ii) $\delta$`, 25 / PI, 'm', [{ v: 25 / PI / Math.sqrt(2 * PI), msg: 'That used ω where the formula has f: δ = 1/√(πfμσ).' }, { v: PI / 25, msg: 'That is α. δ = 1/α.' }]),
        NT(md`(iii) $\lambda$`, 50, 'm', [{ v: 25 / PI, msg: 'That is δ. In a good conductor λ = 2πδ.' }, { v: 3e5, msg: 'That is the free-space wavelength c/f. Inside the conductor the wave is far shorter.' }]),
        NT(md`(iv) $v_p$`, 5e4, 'm/s', [{ v: 3e8, msg: 'That is c. In a good conductor v_p = ωδ, far below c.' }]),
      ],
      hints: [md`Compute $\sigma/\omega\epsilon$. Then in a good conductor $\alpha = \beta = \sqrt{\pi f\mu\sigma}$ and $\delta = 1/\alpha$.`, md`$\pi(10^3)(4\pi\times10^{-7})(4) = 16\pi^2\times10^{-4}$, a perfect square.`],
      sol: md`${gcSol}

${gcSpeed}` }),
    P({ src: 'Summer 2019 #3b(v) · 3 pts', title: 'Power after 10 m',
      q: md`(v) (3 pts) If the wave carries a power density of 1 W/m² at $z = 0$, what power density does it carry at $z = -10$ m? (The original allowed a calculator here; estimate it by hand.)`,
      parts: [NT(md`$\langle S\rangle$ at $z = -10$ m`, Math.exp(-4 * PI / 5), 'W/m^2', [{ v: Math.exp(-2 * PI / 5), msg: 'That is e^{−αd}, the ratio of the fields. Power goes as the field squared: e^{−2αd}.' }, { v: Math.exp(4 * PI / 5), msg: 'That has the wave gaining power. It travels toward −z, so z = −10 m is downstream, where it is weaker.' }], 0.03)],
      hints: [md`Power density goes as $|E|^2$, so it decays as $e^{-2\alpha d}$ over a distance $d$.`, md`$\alpha = 1/\delta = \pi/25$ 1/m.`],
      sol: powSol, figs: decFig }),
  ];
  EM.lesson('e3-past', { id: 'e3-past-su19', order: 7, title: 'Summer 2019 Exam 3', kind: 'exam', sub: 'Kudeki · 3 problems, 75 pts · circular waves, a switched-on sheet, a good conductor', steps: su19 });

  // ======================================================================================== SUMMER 2019 (conflict)
  const bj = (t) => step(t) * Math.cos(2 * PI * t);                       // J_sz(t), f = 1 MHz
  const bE = (t) => -E60 * bj(t - 1);                                     // E_z at x = 300 m
  const bH = (x) => (x < 600 ? 0.5 * Math.cos(2 * PI * x / 300) : 0);     // H_y(x) at t = 2 µs, x > 0
  const tJb = { x: [-3, 3], y: [-1.35, 1.35], yt: [[1, '1'], [-1, '-1']], xt: [[-3, '-3'], [-2, '-2'], [-1, '-1'], [0, '0'], [1, '1'], [2, '2'], [3, '3']], xl: 't\\,(\\mu\\text{s})', yl: 'J_{sz}\\,(\\text{A/m})' };
  const tEb = Object.assign({ x: [0, 5.4], xt: TT(5), xl: 't\\,(\\mu\\text{s})', yl: 'E_z\\,(\\text{V/m})' }, EY);
  const zHb = Object.assign({ x: [0, 1280], xt: ZT(4), xl: 'x\\,(\\text{m})', yl: 'H_y\\,(\\text{A/m})' }, HY);
  const bJc = () => row4([wplot((t) => step(t) * Math.cos(PI * t), tJb), wplot(bj, tJb), wplot((t) => step(t) * Math.sin(2 * PI * t), tJb), wplot((t) => Math.cos(2 * PI * t), tJb)]);
  const bEc = () => row4([wplot((t) => -E60 * step(t - 1) * Math.cos(PI * (t - 1)), tEb), wplot((t) => E60 * bj(t - 1), tEb), wplot(bE, tEb), wplot((t) => -E60 * bj(t - 2), tEb)]);
  const bHc = () => row4([wplot(bH, zHb), wplot((x) => -bH(x), zHb), wplot((x) => (x < 600 ? 0.5 * Math.cos(2 * PI * x / 600) : 0), zHb), wplot((x) => (x < 1200 ? 0.5 * Math.cos(2 * PI * x / 300) : 0), zHb)]);

  const su19b = [
    R(md`
      **Summer 2019 · ECE 329 · Exam 3, conflict paper** (Prof. Kudeki). Wednesday, July 24, 2019, 9:00–9:55 PM: the version for students who could not sit the morning exam. Three problems of 25 points, 75 in all; the class averaged about 58. Open book with calculators then; closed book with no calculator for you, so every number is done by hand.

      It has the same skeleton as [the main paper](#/l/e3-past-su19) with new axes and new numbers, which makes it the best possible second attempt: do the main paper first, then this one a day later. The handwritten key has two slips, flagged in the solutions.

      **What it tests.** The phasor, $\mathbf H$, power and handedness of a circular wave ([Topic 1](#/l/w1-phasor), [Topic 4](#/l/w1-avg), [Topic 9](#/l/w3-pol)); $\mathbf J\cdot\mathbf E$ from a given $\mathbf J$ ([Topic 3](#/l/w1-poynting)); a switched-on current sheet sketched in time and in space ([Exam 2 Topic 15](#/l/t15-sheet-waves), [Topic 10](#/l/w3-antenna)); a circular wave from two snapshots; an **imperfect dielectric** this time, and the frequency it needs ([Topic 7](#/l/w2-limits)).

      **How to use it.** Set a 75-minute timer (the sitting was 55 minutes) and work on paper. Then enter your answers. Plot questions are a choice between candidate plots plus values read off your own sketch.
    `),

    R(md`
      ### Problem 1 (25 points): a circular wave, and J·E

      Part (a): a plane TEM wave in free space has the electric field
      $$\mathbf E(\mathbf r, t) = \cos(\omega t + \beta y)\,\hat x - \sin(\omega t + \beta y)\,\hat z\ \ \text{V/m}$$
    `),
    P({ src: 'Summer 2019 conflict #1a(i)–(iii) · 9 pts', title: 'The phasors and the direction of travel',
      q: md`(i) (3 pts) Find the phasor $\Et(y)$ (a superposition of $\hat x$- and $\hat z$-directed phasors).

(ii) (3 pts) Find the magnetic field phasor $\Ht(y)$, using $\eta_0 = 120\pi\ \Omega$ and the right-hand rule.

(iii) (3 pts) In which direction does the wave travel? Give your reason.`,
      parts: [
        mc(md`(i) $\Et(y)$, in V/m`, [md`$(\hat x + j\hat z)\,e^{j\beta y}$`, md`$(\hat x - j\hat z)\,e^{j\beta y}$`, md`$(\hat x + j\hat z)\,e^{-j\beta y}$`, md`$(\hat x - \hat z)\,e^{j\beta y}$`], 0,
          [null, md`That is the phasor of $+\sin$. Here the sine has a minus sign in front: $-\sin\theta \to -(-j) = +j$.`, md`$\cos(\omega t + \beta y)$ has the phasor $e^{+j\beta y}$. The exponent copies the sign of $\beta y$.`, md`That puts the components in phase. A sine and a cosine of the same argument are $90°$ apart: a $j$ is needed.`]),
        mc(md`(ii) $\Ht(y)$, in A/m`, [md`$\tfrac{1}{120\pi}(\hat z - j\hat x)\,e^{j\beta y}$`, md`$\tfrac{1}{120\pi}(-\hat z + j\hat x)\,e^{j\beta y}$`, md`$\tfrac{1}{120\pi}(\hat z - j\hat x)\,e^{-j\beta y}$`, md`$\tfrac{1}{120\pi}(\hat z + j\hat x)\,e^{j\beta y}$`], 0,
          [null, md`That is $\frac{1}{\eta_0}\hat y\times\Et$, a wave toward $+y$. This one travels toward $-y$: use $-\hat y\times$.`, md`$\Ht$ has the same $y$-dependence as $\Et$: $e^{+j\beta y}$. Changing the exponent would describe a different wave. (The posted key slips into exactly this form.)`, md`One cross product has the wrong sign: $(-\hat y)\times(j\hat z) = -j(\hat y\times\hat z) = -j\hat x$.`]),
        mc(md`(iii) The wave travels toward`, [md`$-\hat y$`, md`$+\hat y$`, md`$+\hat x$`, md`$-\hat z$`], 0,
          [null, md`$\omega t + \beta y = $ const: as $t$ grows, $y$ must shrink.`, md`$\hat x$ is a direction of $\mathbf E$; a plane wave has no field along its travel.`, md`$\hat z$ is a direction of $\mathbf E$. The phase depends on $y$, so the travel is along $\pm\hat y$.`]),
      ],
      hints: [md`$-\sin\theta = -\cos(\theta - 90°)$, whose phasor is $-e^{-j90°} = +j$.`, md`$\Ht = \frac{1}{\eta_0}\hat v\times\Et$ with the travel direction $\hat v$ from the signs of $\omega t$ and $\beta y$.`],
      sol: md`
        **Step 1: the $\hat x$ part.** $\cos(\omega t + \beta y) \longleftrightarrow e^{j\beta y}$.

        **Step 2: the $\hat z$ part.** A sine is a cosine $90°$ late, so $\sin(\omega t + \beta y) \longleftrightarrow -j\,e^{j\beta y}$. This component has a minus sign in front:
        $$-\sin(\omega t + \beta y)\ \longleftrightarrow\ -(-j)\,e^{j\beta y} = +j\,e^{j\beta y}$$
        **Step 3: together.**
        $$\boxed{\Et(y) = (\hat x + j\hat z)\,e^{j\beta y}\ \text{V/m}}$$
        Check at $y = 0$: at $t = 0$, $\Re\{\hat x + j\hat z\} = \hat x$ ✓ (the field is $\hat x$). At $t = T/4$, $\Re\{j(\hat x + j\hat z)\} = \Re\{j\hat x - \hat z\} = -\hat z$, and the field is $\cos90°\,\hat x - \sin90°\,\hat z = -\hat z$ ✓.

        **(iii) Step 4: travel.** On a crest $\omega t + \beta y = $ const, so $y$ decreases as $t$ grows: toward $\boxed{-\hat y}$.

        **(ii) Step 5: $\mathbf H$.** $\Ht = \frac{1}{\eta_0}(-\hat y)\times\Et$. One cross product at a time:
        $$(-\hat y)\times\hat x = \hat x\times\hat y = \hat z$$
        $$(-\hat y)\times(j\hat z) = -j\,(\hat y\times\hat z) = -j\hat x$$
        So
        $$\boxed{\Ht(y) = \frac{1}{120\pi}(\hat z - j\hat x)\,e^{j\beta y}\ \text{A/m}}$$
        **The key.** The posted key reaches $\frac{1}{120\pi}(\hat z - j\hat x)$ correctly, but its last line writes $e^{-j\beta y}$. That is a slip: $\mathbf H$ travels with $\mathbf E$, so it keeps $e^{+j\beta y}$; with $e^{-j\beta y}$ the $\mathbf H$ would belong to a wave going the other way.

        !!intuition Does this make sense?
          Compute $\Et\times\Ht^*$ part by part. The $\hat x$ of $\Et$ with the $\hat z$ of $\Ht^*$: $\hat x\times\hat z = -\hat y$ ✓. The $j\hat z$ of $\Et$ with the $+j\hat x$ of $\Ht^*$ (the conjugate flips $-j$ to $+j$): $(j)(j)\,\hat z\times\hat x = -\hat y$ ✓. Both parts carry power toward $-y$.

        **Speed path.** $\cos\to1$, $-\sin\to+j$, keep $e^{+j\beta y}$; travel $-\hat y$; turn with "$-\hat y\,\times$": $\hat x\to\hat z$, $\hat z\to-\hat x$.

        **Where points go.** Losing the minus sign in front of the sine; changing the exponent between $\Et$ and $\Ht$ (the key's slip); using $+\hat y\times$.
      ` }),
    P({ src: 'Summer 2019 conflict #1a(iv)–(vi) · 11 pts', title: 'Power, then the hand',
      q: md`(iv) (3 pts) Let $\mathbf E_1(\mathbf r, t) \equiv \hat x\,(\mathbf E\cdot\hat x)$. How much average power per unit area does $\mathbf E_1$ carry by itself in its direction of travel? (You need $\langle\mathbf E_1\times\mathbf H_1\rangle$.)

(v) (5 pts) What is $\langle\mathbf E\times\mathbf H\rangle$ for the whole wave? Give its size.

(vi) (3 pts) How is $\mathbf E(\mathbf r, t)$ polarized: linear, right-circular or left-circular? Show your work.`,
      parts: [
        NT(md`(iv) $|\langle\mathbf E_1\times\mathbf H_1\rangle|$`, 1 / (240 * PI), 'W/m^2', [{ v: 1 / (120 * PI), msg: 'That leaves out the ½ of the time average of cos².' }]),
        NT(md`(v) $|\langle\mathbf E\times\mathbf H\rangle|$`, 1 / (120 * PI), 'W/m^2', [{ v: 1 / (240 * PI), msg: 'That is one component. The ẑ part carries as much again.' }]),
        mc(md`(vi) The polarization is`, [md`left-circular`, md`right-circular`, md`linear`], 0,
          [null, md`The tip turns from $\hat x$ (at $t = 0$) to $-\hat z$ (at $T/4$): about $\hat x\times(-\hat z) = +\hat y$. The travel is $-\hat y$, so the right thumb points the wrong way.`, md`The components are $90°$ apart with equal sizes: $|\mathbf E| = 1$ at every instant, a circle.`]),
      ],
      hints: [md`One linear component of amplitude $E_0$: $E_0^2/(2\eta_0)$. Perpendicular components add their powers.`, md`Find $\mathbf E(0)$ and $\mathbf E(T/4)$ at $y = 0$; their cross product is the rotation axis. Compare it with the travel.`],
      sol: md`
        **(iv) Step 1.** $\mathbf E_1 = \hat x\cos(\omega t + \beta y)$, amplitude 1 V/m, toward $-y$. Its $\mathbf H_1 = \frac{1}{\eta_0}(-\hat y)\times\hat x\cos(\cdot) = \hat z\,\frac{1}{\eta_0}\cos(\cdot)$, and
        $$\mathbf E_1\times\mathbf H_1 = \hat x\times\hat z\,\frac{\cos^2(\cdot)}{\eta_0} = -\hat y\,\frac{\cos^2(\cdot)}{\eta_0}$$
        The average of $\cos^2$ is $\tfrac12$:
        $$\boxed{\langle\mathbf E_1\times\mathbf H_1\rangle = -\hat y\,\frac{1}{240\pi} \approx -\hat y\,1.33\times10^{-3}\ \text{W/m}^2}$$
        **(v) Step 2.** The $\hat z$ part is perpendicular to the $\hat x$ part, so the cross terms ($\hat x\times\hat x$ and $\hat z\times\hat z$ directions) vanish and the powers add. The $\hat z$ part has the same amplitude, so it carries the same power:
        $$\boxed{\langle\mathbf E\times\mathbf H\rangle = -\hat y\,\frac{1}{120\pi} \approx -\hat y\,2.65\times10^{-3}\ \text{W/m}^2}$$
        In fact $\mathbf E\times\mathbf H = -\hat y(\cos^2 + \sin^2)/\eta_0 = -\hat y/\eta_0$ at every instant: a circular wave carries steady power.

        **(vi) Step 3: the hand.** At $y = 0$: $\mathbf E(0) = \hat x$, and at $\omega t = 90°$, $\mathbf E(T/4) = -\hat z$. The rotation axis is
        $$\hat x\times(-\hat z) = -(\hat x\times\hat z) = +\hat y$$
        The wave travels toward $-\hat y$. The right thumb would point against the travel: $\boxed{\text{left-circular}}$. The key agrees.

        [[fig:pol]]

        **Speed path.** Each component $E_0^2/(2\eta_0)$; circular is twice that. Hand: $\mathbf E(0)\times\mathbf E(T/4)\cdot\hat v < 0$ means left.

        **Where points go.** Forgetting the minus sign on the sine, which flips $\mathbf E(T/4)$ and with it the hand; forgetting the $\tfrac12$.
      `,
      figs: { pol: { svg: polFig({ h: 'z', v: 'x', e0: 90, e1: 180, travel: -1, alt: 'the z-x plane with y out of the page; the wave travels into the page; E at t = 0 points along +x (up), at T/4 along -z (left); the tip turns counterclockwise' }), cap: 'With $\\hat z$ right and $\\hat x$ up, $\\hat y$ is out of the page. The tip turns counterclockwise (right-handed about $+\\hat y$), but the wave travels into the page (⊗): left-circular.' } } }),
    P({ src: 'Summer 2019 conflict #1b · 5 pts', title: 'J·E from a given J',
      q: md`Part (b). In a conducting medium, $\mathbf J = 10^{-3}\,\hat y\cos(\omega t)$ A/m² at $\mathbf r = 0$, and the conductivity is $\sigma = 10^{-3}$ S/m.

(i) (3 pts) What are the maximum and the time-averaged value of $\mathbf J\cdot\mathbf E$ at the same location?

(ii) (2 pts) What does $\mathbf J\cdot\mathbf E$ measure? Hint: look at its unit.`,
      parts: [
        NT(md`(i) $(\mathbf J\cdot\mathbf E)_{\max}$`, 1e-3, 'W/m^3', [{ v: 1e-9, msg: 'That multiplies J by σ. Here E = J/σ, so J·E = J²/σ.' }, { v: 1e-6, msg: 'That is J² alone. Divide by σ: J·E = J²/σ.' }]),
        NT(md`(i) $\langle\mathbf J\cdot\mathbf E\rangle$`, 5e-4, 'W/m^3', [{ v: 1e-3, msg: 'That is the maximum. Average cos² is ½.' }]),
        mc(md`(ii) The unit of $\mathbf J\cdot\mathbf E$ and its meaning`, [md`W/m³: the power dissipated as heat per unit volume`, md`W/m²: the power crossing a unit area`, md`J/m³: the energy stored per unit volume`, md`A·V/m: the power carried along a wire`], 0,
          [null, md`(A/m²)(V/m) has one more 1/m than W/m². Power per area is the Poynting vector.`, md`$\mathbf J\cdot\mathbf E$ is a rate. Stored energy density is $\tfrac12\epsilon E^2 + \tfrac12\mu H^2$.`, md`(A/m²)(V/m) = W/m³; the meters do not cancel to a wire's watts.`]),
      ],
      hints: [md`Ohm's law at a point, turned around: $\mathbf E = \mathbf J/\sigma$. Then $\mathbf J\cdot\mathbf E = |\mathbf J|^2/\sigma$.`],
      sol: md`
        **Step 1: the field.** Ohm's law at a point, $\mathbf J = \sigma\mathbf E$, solved for $\mathbf E$:
        $$\mathbf E = \frac{\mathbf J}{\sigma} = \frac{10^{-3}}{10^{-3}}\,\hat y\cos\omega t = \hat y\cos\omega t\ \ \text{V/m}$$
        **Step 2: the product.**
        $$\mathbf J\cdot\mathbf E = \frac{|\mathbf J|^2}{\sigma} = \frac{10^{-6}\cos^2\omega t}{10^{-3}} = 10^{-3}\cos^2\omega t\ \ \text{W/m}^3$$
        **Step 3: maximum and average.**
        $$\boxed{(\mathbf J\cdot\mathbf E)_{\max} = 10^{-3}\ \text{W/m}^3,\qquad \langle\mathbf J\cdot\mathbf E\rangle = 5\times10^{-4}\ \text{W/m}^3}$$
        **(ii)** The unit is (A/m²)(V/m) = W/m³: power per unit volume. It is the rate at which the field does work on the moving charges, which in a conductor becomes heat (Joule heating, the field form of $I^2R$).

        **The key.** The posted key gives both values in W/m², then says W/m³ in part (ii). W/m³ is right; W/m² is the Poynting vector's unit.

        **Speed path.** $J_0^2/\sigma = 10^{-6}/10^{-3} = 10^{-3}$ is the peak; half is the average.

        **Where points go.** $\sigma J^2$ instead of $J^2/\sigma$; the wrong unit; forgetting the $\tfrac12$.
      ` }),

    RF(md`
      ### Problem 2 (25 points): a current sheet switched on at t = 0

      A time-varying surface current density
      $$\mathbf J_s(t) = u(t)\cos(2\pi ft)\,\hat z\ \ \text{A/m}$$
      with $f = 10^6$ Hz, lies on the surface $x = 0$ in free space; $u(t)$ is the unit step, and $\omega = 2\pi f = 2\pi$ rad/µs. Measure $t$ in µs and distance in m, so $c = 300$ m/µs.

      [[fig:sh]]
    `, { sh: { svg: sheetFig({ n: 'x', jl: 'J_s\\ (\\hat z)', right: '\\text{toward }+x', left: '\\text{toward }-x', alt: 'the sheet x = 0 seen edge-on as a dashed vertical line; the current J_s runs along z, drawn up the sheet; one wave leaves toward +x and one toward -x' }), cap: 'The sheet edge-on, with the current along $\\hat z$ drawn up the page.' } }),
    P({ src: 'Summer 2019 conflict #2a · 3 pts', title: 'The current itself',
      q: md`(a) (3 pts) Plot $J_{sz}(t)$ versus $t$ for $-3 < t < 3$ µs. Sketch it, then pick the matching plot.

[[fig:c]]`,
      figs: { c: { svg: bJc(), cap: 'Four candidates for $J_{sz}(t)$, in A/m.' } },
      parts: [
        mc(md`Which plot is $J_{sz}(t)$?`, PLOTS, 1,
          [md`Plot A has a 2 µs period: that is a ½ MHz current. Here $f = 1$ MHz, so $T = 1$ µs.`, null, md`Plot C starts at zero like a sine. The cosine switches on at its peak, 1 A/m.`, md`Plot D ignores the step: the current is zero before $t = 0$.`], true),
        N(md`$J_{sz}$ at $t = 2.5$ µs`, -1, 'A/m'),
      ],
      hints: [md`Zero for $t < 0$; $\cos(2\pi t)$ for $t > 0$, with $t$ in µs.`],
      sol: md`
        **Step 1.** For $t < 0$ the step is zero: $J_{sz} = 0$.

        **Step 2.** For $t > 0$, $J_{sz} = \cos(2\pi t)$ with $t$ in µs: a jump to 1 A/m at $t = 0$, then a cosine of period $T = 1/f = 1$ µs: three full cycles in the window.

        **Step 3.** It is 1 at $t = 0, 1, 2, 3$ and $-1$ at $t = 0.5, 1.5, 2.5$, so $\boxed{J_{sz}(2.5\ \mu\text{s}) = -1\ \text{A/m}}$. **Plot B**:

        [[fig:a]]

        **Speed path.** Off, then on at full strength, 1 µs period.

        **Where points go.** A cosine for $t < 0$; a sine start; the period of the main paper's ½ MHz.
      `,
      figs: { c: { svg: bJc(), cap: 'Four candidates for $J_{sz}(t)$, in A/m.' }, a: { svg: wplot(bj, Object.assign({}, tJb, { w: 380, h: 170 })), cap: '$J_{sz}(t)$: zero, then cos(2πt) from t = 0, period 1 µs.' } } }),
    P({ src: 'Summer 2019 conflict #2b–d · 11 pts', title: 'E for x > 0, H for x < 0, and λ',
      q: md`(b) (4 pts) What is the vector wave field $\mathbf E(x, t)$ produced by $\mathbf J_s(t)$ in the region $x > 0$?

(c) (4 pts) What is the vector wave field $\mathbf H(x, t)$ in the region $x < 0$?

(d) (3 pts) What is the wavelength $\lambda$ of the modulated $\mathbf E(x, t)$ and $\mathbf H(x, t)$?

In the choices, $t$ is in µs, $x$ in m and $c = 300$ m/µs.`,
      parts: [
        mc(md`(b) $\mathbf E(x, t)$ for $x > 0$, in V/m`, [md`$-60\pi\,u(t - \tfrac xc)\cos2\pi(t - \tfrac xc)\,\hat z$`, md`$+60\pi\,u(t - \tfrac xc)\cos2\pi(t - \tfrac xc)\,\hat z$`, md`$-60\pi\,u(t + \tfrac xc)\cos2\pi(t + \tfrac xc)\,\hat z$`, md`$-60\pi\,u(t - \tfrac xc)\cos2\pi(t - \tfrac xc)\,\hat y$`], 0,
          [null, md`The field at the sheet is $-\frac{\eta_0}{2}\mathbf J_s$: against the current.`, md`On the $x > 0$ side the wave moves away from the sheet: $t - x/c$.`, md`$\mathbf E$ of a sheet is parallel (well, antiparallel) to the current, $\hat z$. $\hat y$ is the direction of $\mathbf H$.`]),
        NT(md`(b) $E_z$ at $x = 150$ m, $t = 2$ µs`, E60, 'V/m', [{ v: -E60, msg: 'Wrong sign. The delay is 0.5 µs, so cos 2π(1.5) = −1 and E_z = −60π·(−1).' }]),
        mc(md`(c) $\mathbf H(x, t)$ for $x < 0$, in A/m`, [md`$-\tfrac12\,u(t + \tfrac xc)\cos2\pi(t + \tfrac xc)\,\hat y$`, md`$+\tfrac12\,u(t + \tfrac xc)\cos2\pi(t + \tfrac xc)\,\hat y$`, md`$-\tfrac12\,u(t - \tfrac xc)\cos2\pi(t - \tfrac xc)\,\hat y$`, md`$-\tfrac12\,u(t + \tfrac xc)\cos2\pi(t + \tfrac xc)\,\hat z$`], 0,
          [null, md`That is the $x > 0$ side's $\mathbf H$. It flips across the sheet. Check: $(-\hat z)\times(+\hat y) = +\hat x$, but this wave goes toward $-\hat x$.`, md`For $x < 0$, $|x| = -x$, so the delay is $t + x/c$.`, md`$\mathbf H$ must be perpendicular to $\mathbf E$ (along $\hat z$).`]),
        NT(md`(c) $H_y$ at $x = -150$ m, $t = 1$ µs`, 0.5, 'A/m', [{ v: -0.5, msg: 'Wrong sign: t + x/c = 0.5 µs, cos(π) = −1, and H_y = −½·(−1).' }]),
        NT(md`(d) $\lambda$`, 300, 'm', [{ v: 600, msg: 'That is the main paper’s ½ MHz. Here λ = c/f = 300 m.' }]),
      ],
      hints: [md`$\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(t - |x|/c)$ on both sides.`, md`On the $x < 0$ side, $\mathbf H = \frac{1}{\eta_0}(-\hat x)\times\mathbf E$.`],
      sol: md`
        ${sheetFirst('x')}

        **(b) Step 1: $x > 0$.** With $t' = t - x/c$:
        $$\mathbf E = -\hat z\,60\pi\,u(t')\cos(2\pi t')$$
        So $\boxed{\mathbf E(x, t) = -\hat z\,60\pi\,u(t - \tfrac xc)\cos2\pi(t - \tfrac xc)}$ V/m. In seconds, the cosine is $\cos(2\pi\times10^6t - \tfrac{2\pi}{300}x)$.

        **Step 2: a value.** At $x = 150$ m the delay is 0.5 µs, so at $t = 2$ µs, $t' = 1.5$:
        $$E_z = -60\pi\cos(3\pi) = +60\pi \approx \boxed{188\ \text{V/m}}$$
        **(c) Step 3: $x < 0$.** Here $|x| = -x$, so the delay is $t + x/c$. The wave travels toward $-\hat x$:
        $$\mathbf H = \frac{1}{\eta_0}(-\hat x)\times\mathbf E$$
        The directions: $(-\hat x)\times(-\hat z) = \hat x\times\hat z = -\hat y$, and $60\pi/120\pi = \tfrac12$:
        $$\boxed{\mathbf H(x, t) = -\hat y\,\tfrac12\,u(t + \tfrac xc)\cos2\pi(t + \tfrac xc)\ \text{A/m}}$$
        **Step 4: a value.** At $x = -150$ m and $t = 1$ µs, $t + x/c = 0.5$:
        $$H_y = -\tfrac12\cos(\pi) = \boxed{+0.5\ \text{A/m}}$$
        **(d) Step 5.**
        $$\lambda = \frac cf = \frac{3\times10^8}{10^6} = \boxed{300\ \text{m}}$$
        !!intuition Does this make sense?
          On the $x > 0$ side, $\mathbf H = \frac{1}{\eta_0}\hat x\times\mathbf E = +\hat y\,\tfrac12\cos(\cdot)$. The jump: $\hat x\times(\mathbf H_+ - \mathbf H_-) = \hat x\times\hat y\,J_{sz} = \hat z\,J_{sz}$ ✓, the current.

        **Speed path.** $\mathbf E = -60\pi\,\mathbf J_s(\text{delayed})$ on both sides; $|\mathbf H| = J_s/2$, pointing so that $\mathbf E\times\mathbf H$ leaves the sheet; $\lambda = cT = 300$ m.

        **Where points go.** The minus sign; $t - x/c$ on the $x < 0$ side; the same sign of $\mathbf H$ on both sides; $\eta_0$ instead of $\eta_0/2$.
      ` }),
    P({ src: 'Summer 2019 conflict #2e · 5 pts', title: 'E_z versus t at x = 300 m',
      q: md`(e) (5 pts) Plot $E_z(x, t)$ versus $t$ at $x = 300$ m for $0 < t < 5$ µs. Label both axes. (Hint: $E_z$ is zero until the wavefront arrives.) Sketch it, then pick and read.

[[fig:c]]`,
      figs: { c: { svg: bEc(), cap: 'Four candidates for $E_z(300\\ \\text{m}, t)$, in V/m.' } },
      parts: [
        mc(md`Which plot is $E_z(300\ \text{m}, t)$?`, PLOTS, 2,
          [md`Plot A has a 2 µs period. The current repeats every 1 µs, and so does the field.`, md`Plot B jumps **up** at the front. $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$, so it jumps down.`, null, md`Plot D arrives at 2 µs. 300 m at 300 m/µs takes 1 µs.`], true),
        N(md`the time the front arrives`, 1, 'μs'),
        NT(md`$E_z$ at $t = 1.375$ µs`, E60 / Math.SQRT2, 'V/m', [{ v: -E60 / Math.SQRT2, msg: 'Wrong sign: cos(2π·0.375) = cos(135°) = −0.707, and E_z = −60π times that.' }]),
      ],
      hints: [md`$E_z(300, t) = -60\pi\,u(t - 1)\cos2\pi(t - 1)$.`],
      sol: md`
        **Step 1: the delay.** 300 m at 300 m/µs: the front arrives at $t = 1$ µs, and
        $$E_z(300, t) = -60\pi\,u(t - 1)\cos2\pi(t - 1)$$
        **Step 2: shape.** Zero before 1 µs. At $t = 1^+$ a jump to $-60\pi \approx -188$ V/m. Then a cosine of period 1 µs: $+60\pi$ at 1.5, $-60\pi$ at 2, and so on, ending at $-60\pi$ at $t = 5$. **Plot C**:

        [[fig:e]]

        **Step 3: the value.** At $t = 1.375$, $t - 1 = 0.375$, an angle of $2\pi(0.375) = 135°$:
        $$E_z = -60\pi\cos135° = +\frac{60\pi}{\sqrt2} \approx \boxed{+133\ \text{V/m}}$$
        **The key.** Its sketch matches: a drop to $-60\pi$ at 1 µs and four cycles by 5 µs.

        **Speed path.** The source waveform, delayed 1 µs and multiplied by $-60\pi$.

        **Where points go.** The sign; the arrival time; the period (copying 2 µs from the main paper).
      `,
      figs: { c: { svg: bEc(), cap: 'Four candidates for $E_z(300\\ \\text{m}, t)$, in V/m.' }, e: { svg: wplot(bE, Object.assign({}, tEb, { w: 360, h: 180 })), cap: '$E_z$ at x = 300 m: zero until 1 µs, a jump to −60π, then −60π cos 2π(t − 1).' } } }),
    P({ src: 'Summer 2019 conflict #2f · 6 pts', title: 'H_y versus x at t = 2 µs',
      q: md`(f) (6 pts) Plot $H_y(x, t)$ versus $x$ at $t = 2$ µs over $0 < x < 1200$ m. Label both axes. (Hint: $H_y$ is zero where the wavefront has not yet reached.) Sketch it, then pick and read.

[[fig:c]]`,
      figs: { c: { svg: bHc(), cap: 'Four candidates for $H_y(x, 2\\ \\mu\\text{s})$, in A/m.' } },
      parts: [
        mc(md`Which plot is $H_y(x, 2\ \mu\text{s})$?`, PLOTS, 0,
          [null, md`Plot B has the sign of the $x < 0$ side. For $x > 0$, $\mathbf H = +\hat y\,\tfrac12\cos2\pi(t - x/c)$: $+\tfrac12$ right behind the front.`, md`Plot C has a 600 m wavelength. At 1 MHz, $\lambda = 300$ m.`, md`Plot D runs to 1200 m. In 2 µs the front travels only 600 m.`], true),
        N(md`the position of the front`, 600, 'm'),
        NT(md`$H_y$ at $x = 100$ m`, -0.25, 'A/m', [{ v: 0.25, msg: 'Wrong sign: cos(2π·100/300) = cos 120° = −½.' }]),
      ],
      hints: [md`For $x > 0$: $H_y = +\tfrac12\,u(t - \tfrac xc)\cos2\pi(t - \tfrac xc)$. Put $t = 2$ and use $\cos(4\pi - \theta) = \cos\theta$.`],
      sol: md`
        **Step 1: the sign on this side.** For $x > 0$, $\mathbf H = \frac{1}{\eta_0}\hat x\times\mathbf E$, and $\hat x\times(-\hat z) = +\hat y$:
        $$H_y = +\tfrac12\,u(t - \tfrac{x}{300})\cos2\pi(t - \tfrac{x}{300})$$
        **Step 2: freeze $t = 2$ µs.** The front is at $x = (300)(2) = 600$ m. Behind it,
        $$H_y = \tfrac12\cos\!\left(4\pi - \frac{2\pi x}{300}\right) = \tfrac12\cos\frac{2\pi x}{300}$$
        since $\cos(4\pi - \theta) = \cos\theta$.

        **Step 3: points.** $x = 0$: $+\tfrac12$; $x = 150$: $-\tfrac12$; $x = 300$: $+\tfrac12$; $x = 450$: $-\tfrac12$; $x = 600^-$: $+\tfrac12$, then a jump to 0. Two wavelengths behind the front. **Plot A**:

        [[fig:h]]

        **Step 4: the value.** At $x = 100$ m, the angle is $2\pi/3 = 120°$:
        $$H_y = \tfrac12\cos120° = \boxed{-0.25\ \text{A/m}}$$
        Right behind the front, $H_y = +\tfrac12$: the current's first value, $+1$, times $\tfrac12$. The snapshot is the source history read backward from the front.

        **The key.** Its sketch has the right shape and the front at 600 m, though it writes the 300 and 600 labels under the troughs; the peaks are at 0, 300 and 600 m.

        **Speed path.** Front at $ct = 600$ m; first value behind it $+\tfrac12$; two wavelengths of 300 m back to the sheet.

        **Where points go.** The $x < 0$ sign; the front at 1200 m (a doubled $c$); a 600 m wavelength.
      `,
      figs: { c: { svg: bHc(), cap: 'Four candidates for $H_y(x, 2\\ \\mu\\text{s})$, in A/m.' }, h: { svg: wplot(bH, Object.assign({}, zHb, { w: 360, h: 180 })), cap: '$H_y(x)$ at t = 2 µs: ½ cos(2πx/300) behind the front at 600 m, zero beyond.' } } }),

    R(md`
      ### Problem 3 (25 points): a circular wave from two snapshots, and an imperfect dielectric

      Part (a): a co-sinusoidal plane TEM wave travels in free space in the $+x$ direction at $f = 300$ MHz. At the origin its electric field is $2\hat z$ V/m at $t = 0$ and $-2\hat y$ V/m at $t = T/4$, where $T$ is the period.
    `),
    P({ src: 'Summer 2019 conflict #3a · 12 pts', title: 'Period, wavelength, hand, phasor',
      q: md`(i) (4 pts) Find the period $T$, the wavelength $\lambda$ and the wavenumber $\beta$.

(ii) (4 pts) Is the wave right- or left-circularly polarized? Explain.

(iii) (4 pts) Write the phasor $\Et$ in terms of $x$, with the numerical value of $\beta$.`,
      parts: [
        N(md`(i) $T$`, 1e9 / 300e6, 'ns'),
        N(md`(i) $\lambda$`, 1, 'm'),
        NT(md`(i) $\beta$`, 2 * PI, 'rad/m', [{ v: PI, msg: 'β = 2π/λ with λ = 1 m: 2π rad/m.' }]),
        mc(md`(ii) The wave is`, [md`right-circular`, md`left-circular`], 0,
          [null, md`The tip turns from $\hat z$ to $-\hat y$: about $\hat z\times(-\hat y) = +\hat x$, which **is** the travel direction. Right-handed.`]),
        mc(md`(iii) $\Et$, in V/m`, [md`$2(\hat z + j\hat y)\,e^{-j2\pi x}$`, md`$2(\hat z - j\hat y)\,e^{-j2\pi x}$`, md`$2(\hat z + j\hat y)\,e^{+j2\pi x}$`, md`$2(\hat z + j\hat y)\,e^{-j\pi x}$`], 0,
          [null, md`With $-j$, the $\hat y$ part would be $+2\hat y$ at $T/4$. The paper says $-2\hat y$: the phasor is $+2j$.`, md`$e^{+j2\pi x}$ travels toward $-x$.`, md`$\beta = 2\pi/\lambda = 2\pi$ rad/m here, since $\lambda = 1$ m.`]),
      ],
      hints: [md`$\lambda = c/f = 1$ m.`, md`The $\hat y$ part is 0 at $t = 0$ and $-2$ at $T/4$: $-2\sin\omega t = 2\cos(\omega t + 90°)$.`],
      sol: md`
        **(i) Step 1.**
        $$T = \frac1f = \frac{1}{3\times10^8}\ \text{s} \approx \boxed{3.33\ \text{ns}}$$
        $$\lambda = \frac cf = \frac{3\times10^8}{3\times10^8} = \boxed{1\ \text{m}},\qquad \beta = \frac{2\pi}{\lambda} = \boxed{2\pi\ \text{rad/m}}$$
        **(iii) Step 2: each component.** The $\hat z$ part is 2 at $t = 0$ and 0 at $T/4$: $E_z = 2\cos\omega t$, phasor $2$.

        The $\hat y$ part, $B\cos(\omega t + b)$, is 0 at $t = 0$ and $-2$ at $\omega t = 90°$:
        $$B\cos b = 0,\qquad B\cos(90° + b) = -B\sin b = -2$$
        So $b = 90°$ and $B = 2$: $E_y = 2\cos(\omega t + 90°) = -2\sin\omega t$, phasor $2e^{j90°} = 2j$.

        **Step 3: the travel.** Toward $+x$: $e^{-j\beta x} = e^{-j2\pi x}$.
        $$\boxed{\Et = 2(\hat z + j\hat y)\,e^{-j2\pi x}\ \text{V/m}}$$
        **(ii) Step 4: the hand.** Equal amplitudes, $90°$ apart: circular. The axis of the turn from $\mathbf E(0) = 2\hat z$ to $\mathbf E(T/4) = -2\hat y$:
        $$\hat z\times(-\hat y) = -(\hat z\times\hat y) = +\hat x$$
        That is the travel direction: **right-circular (RCP)**. The key agrees.

        [[fig:pol]]

        **Speed path.** $\mathbf E(0)\times\mathbf E(T/4)$ along the travel: right. Phasor: $\mathbf E(0)$ is the real part, $\mathbf E(T/4)$ gets a $-j$: $2\hat z - j(-2\hat y) = 2\hat z + 2j\hat y$.

        **Where points go.** $\beta = \pi$ by copying the main paper; the sign of the $j$; judging the hand against the wrong axis.
      `,
      figs: { pol: { svg: polFig({ h: 'y', v: 'z', e0: 90, e1: 180, travel: 1, alt: 'the y-z plane with x out of the page; the wave travels out of the page; E at t = 0 points along +z (up), at T/4 along -y (left); the tip turns counterclockwise' }), cap: 'With $\\hat y$ right and $\\hat z$ up, $\\hat x$ comes out of the page, the travel direction (⊙). Counterclockwise is right-handed about $+\\hat x$: right-circular.' } } }),
    R(md`
      Part (b): a TEM wave travels in the $-z$ direction in a homogeneous medium with $\mu = \mu_0$, $\epsilon = 81\epsilon_0$ and $\sigma = 4$ S/m. It is observed that **the penetration depth is much longer than the wavelength**.
    `),
    P({ src: 'Summer 2019 conflict #3b · 13 pts', title: 'An imperfect dielectric, and the frequency it needs',
      q: md`(i) (3 pts) Does the medium act as an *imperfect dielectric* or a *good conductor* at the wave frequency? Explain.

(ii) (3 pts) According to (i), what inequality must the frequency $\omega = 2\pi f$ satisfy?

(iii) (2 pts) Show that $f = 10$ GHz satisfies the inequality in (ii).

(iv) (3 pts) What is the wavelength $\lambda$ in the medium if $f = 10$ GHz? Show your work.

(v) (2 pts) What is the propagation velocity $v_p = \omega/\beta$? Simplify without a calculator.`,
      parts: [
        mc(md`(i) The medium is`, [md`an imperfect dielectric`, md`a good conductor`], 0,
          [null, md`A good conductor has $\alpha = \beta$, so $\lambda = 2\pi\delta$, a few skin depths. Here $\delta \gg \lambda$: the wave survives many wavelengths, so $\alpha \ll \beta$.`]),
        mc(md`(ii) The frequency must satisfy`, [md`$\omega\epsilon \gg \sigma$`, md`$\sigma \gg \omega\epsilon$`, md`$\omega \gg \sigma$`, md`$\omega\epsilon = \sigma$`], 0,
          [null, md`That is the good-conductor condition.`, md`$\omega$ (1/s) and $\sigma$ (S/m) have different units; the comparison must be between currents, $\omega\epsilon$ and $\sigma$.`, md`Equal currents is the crossover, neither limit.`]),
        NT(md`(iii) $\omega\epsilon$ at 10 GHz`, 45, 'S/m', [{ v: 45 / (2 * PI), msg: 'That used f where ω belongs: ω = 2π × 10¹⁰ rad/s.' }]),
        NT(md`(iv) $\lambda$ at 10 GHz`, 1 / 300, 'm', [{ v: 0.03, msg: 'That is the free-space wavelength c/f. In the medium the speed is c/9.' }, { v: 3e8 / 81 / 1e10, msg: 'That divides c by ε_r = 81. The speed is c/√ε_r = c/9.' }]),
        NT(md`(v) $v_p$`, 1e8 / 3, 'm/s', [{ v: 3e8 / 81, msg: 'v = c/√ε_r = c/9, not c/81.' }, { v: 3e8, msg: 'That is c in vacuum.' }]),
      ],
      hints: [md`$\delta \gg \lambda$ means $\alpha \ll \beta$: the loss tangent $\sigma/\omega\epsilon$ is small.`, md`With $\epsilon_0 = \frac{10^{-9}}{36\pi}$: $\omega\epsilon = (2\pi\times10^{10})(81)\frac{10^{-9}}{36\pi}$. Then $\beta \approx \omega\sqrt{\mu\epsilon}$, so $v_p \approx c/\sqrt{81}$.`],
      sol: md`
        **(i) Step 1: what "δ ≫ λ" says.** Over one skin depth the field falls by $1/e$. If that takes many wavelengths, the decay per radian of phase is tiny: $\alpha \ll \beta$. That is the low-loss side, $\sigma/\omega\epsilon \ll 1$: an **imperfect dielectric**. (A good conductor has $\alpha = \beta$, and the wave dies within a wavelength: $\lambda = 2\pi\delta$.)

        **(ii) Step 2: the inequality.** Low loss means the displacement current beats the conduction current:
        $$\boxed{\omega\epsilon \gg \sigma}\qquad\text{or}\qquad \omega \gg \frac{\sigma}{\epsilon}$$
        Here $\sigma/\epsilon = 4/(81\epsilon_0) = 4(36\pi\times10^9)/81 \approx 5.6\times10^9$ rad/s, so $f \gg 0.9$ GHz.

        **(iii) Step 3: at 10 GHz.**
        $$\omega\epsilon = (2\pi\times10^{10})(81)\frac{10^{-9}}{36\pi}$$
        The $\pi$'s cancel, $10^{10}\times10^{-9} = 10$, and $2\times81/36 = 4.5$:
        $$\omega\epsilon = 45\ \text{S/m}$$
        That is about 11 times $\sigma = 4$ S/m ($\sigma/\omega\epsilon \approx 0.09$) ✓. The key writes this as $20\cdot81/36 \gg 4$.

        **(iv) Step 4: λ.** With small loss, $\beta \approx \omega\sqrt{\mu\epsilon}$, as if $\sigma$ were zero. The speed is $c/\sqrt{\epsilon_r} = c/9$:
        $$\lambda \approx \frac{c/9}{f} = \frac{(1/3)\times10^8}{10^{10}} = \boxed{\tfrac13\times10^{-2}\ \text{m} = \tfrac13\ \text{cm}}$$
        **(v) Step 5: $v_p$.**
        $$v_p \approx \frac{1}{\sqrt{\mu_0\cdot81\epsilon_0}} = \frac{c}{9} = \boxed{\tfrac13\times10^8\ \text{m/s}}$$
        !!intuition How good is "≈"?
          The exact $\gamma$ at 10 GHz gives $\lambda = 3.330$ mm against $3.333$ mm: 0.1% off. The correction to $\beta$ goes as $\tfrac18(\sigma/\omega\epsilon)^2 = \tfrac18(0.09)^2 \approx 0.001$. A loss tangent of 0.09 barely changes the speed, although it does make the wave decay: $\alpha \approx \frac{\sigma}{2}\eta \approx 2\times40\pi \approx 84$ Np/m, so $\delta \approx 1.2$ cm, about 3.6 wavelengths. "Much longer" is generous here, but it holds.

        **Speed path.** $\delta \gg \lambda$: dielectric, $\omega\epsilon \gg \sigma$. Then everything is the lossless wave in $\epsilon_r = 81$: speed $c/9$, $\lambda = c/(9f)$.

        **Where points go.** Picking "good conductor" because $\sigma = 4$ S/m sounds large (the answer depends on $\omega$); $f$ in place of $\omega$ in $\omega\epsilon$; dividing $c$ by 81 instead of $\sqrt{81}$.
      ` }),
  ];
  EM.lesson('e3-past', { id: 'e3-past-su19b', order: 7.5, title: 'Summer 2019 Exam 3 (second version)', kind: 'exam', sub: 'Kudeki · the conflict paper: same skeleton, new axes and numbers', steps: su19b });

  // ======================================================================================== SUMMER 2018
  const s18j = (t) => step(t) * Math.sin(PI * t);                         // J_sy(t), f = 1/2 MHz
  const s18E = (t) => -E60 * s18j(t - 1);                                 // E_y at x = 300 m
  const s18H = (x) => (x < 1200 ? 0.5 * Math.sin(PI * x / 300) : 0);      // H_z(x) at t = 4 µs, x > 0
  const tE18 = Object.assign({ x: [0, 5.4], xt: TT(5), xl: 't\\,(\\mu\\text{s})', yl: 'E_y\\,(\\text{V/m})' }, EY);
  const zH18 = Object.assign({ x: [0, 1600], xt: ZT(5), xl: 'x\\,(\\text{m})', yl: 'H_z\\,(\\text{A/m})' }, HY);
  const s18Ec = () => row4([wplot((t) => E60 * s18j(t - 1), tE18), wplot((t) => -E60 * step(t - 1) * Math.cos(PI * (t - 1)), tE18), wplot(s18E, tE18), wplot((t) => -E60 * s18j(t), tE18)]);
  const s18Hc = () => row4([wplot((x) => -s18H(x), zH18), wplot(s18H, zH18), wplot((x) => 0.5 * Math.sin(PI * x / 300), zH18), wplot((x) => (x < 1200 ? 0.5 * Math.sin(2 * PI * x / 300) : 0), zH18)]);
  const ETA18 = 8 * PI * PI / 5;                                          // |eta| in ohms

  const su18 = [
    R(md`
      **Summer 2018 · ECE 329 · Exam 3** (Prof. Kudeki). Thursday, July 25, 2018, 11:00–11:50 AM. Three problems of 25 points, 75 in all; the class averaged about 63. Closed book, calculators allowed, three formula sheets. Yours: closed book, no calculator, the official sheet and one 4″×6″ card.

      The handwritten key has two slips, both flagged below: a phase sign in $\Et$ (Problem 1) and the sign of a whole sketch (Problem 2f).

      **What it tests.** Reading $\gamma$, $\eta$ and $\epsilon$ off a given lossy $\mathbf H(z, t)$ ([Topic 5](#/l/w2-gamma), [Topic 6](#/l/w2-read)); phasors of $\mathbf H$ and $\mathbf E$ ([Topic 2](#/l/w1-maxwell)); a current sheet driven by a switched-on **sine** ([Exam 2 Topic 15](#/l/t15-sheet-waves), [Topic 10](#/l/w3-antenna)); the constants of a right-circular phasor and its power ([Topic 9](#/l/w3-pol), [Topic 4](#/l/w1-avg)); a good conductor and power decay ([Topic 7](#/l/w2-limits), [Topic 8](#/l/w2-loss)).

      **Not on the Fall 2026 Exam 3.** Problem 1(a) (a permeability from an inductor's time constant) is Exam 2 material. It is kept, typed and solved, as a 2-minute warm-up.

      **How to use it.** Set a 75-minute timer (the sitting was 50 minutes) and work on paper. Then enter your answers. Plot questions are a choice between candidate plots plus values read off your own sketch.
    `),

    R(md`
      ### Problem 1 (25 points): a magnetic rod, and a lossy wave read from its H
    `),
    P({ src: 'Summer 2018 #1a · 10 pts', title: 'μ from a time constant (Exam 2 material)',
      q: md`**Not on the Fall 2026 Exam 3** (magnetic materials and inductance are Exam 2 topics).

To measure the permeability $\mu$ of a solid rod, you slide it into a long solenoid whose diameter matches the rod's exactly. The time constant of the exponential decay of the current in an $RL$ circuit built with this solenoid increases by **0.05%** when the rod replaces the air core. Find $\mu$ in terms of $\mu_0$. Is the rod diamagnetic or paramagnetic? Explain.`,
      parts: [
        NT(md`$\mu/\mu_0$`, 1.0005, '', [{ v: 1.05, msg: '0.05% is 0.0005, not 0.05.' }, { v: 0.9995, msg: 'The time constant went up, so L and μ went up.' }], 0.00002),
        mc(md`The rod is`, [md`paramagnetic`, md`diamagnetic`, md`ferromagnetic`], 0,
          [null, md`Diamagnetic means $\chi_m < 0$: $\mu < \mu_0$, a **smaller** $L$ and a shorter time constant.`, md`A ferromagnet has $\chi_m$ in the hundreds or thousands; this one is $5\times10^{-4}$.`]),
      ],
      hints: [md`The time constant of an $RL$ circuit is $\tau_{RL} = L/R$; the rod changes $L$ only.`, md`A long solenoid has $L = \mu N^2A/\ell$, so $L \propto \mu$.`],
      sol: md`
        **Step 1: the inductance of a filled solenoid.** Ampère's law around a rectangle half inside gives $H = NI/\ell$ ($N$ turns over a length $\ell$), whatever fills the core. Then $B = \mu H$, the flux through each turn is $BA$, and the flux linkage is $N\cdot BA$:
        $$L = \frac{NBA}{I} = \frac{\mu N^2A}{\ell}$$
        So $L \propto \mu$: everything else is geometry.

        **Step 2: the time constant.** For an $RL$ circuit, $i(t) \propto e^{-t/\tau_{RL}}$ with
        $$\tau_{RL} = \frac{L}{R}$$
        (written $\tau_{RL}$ here, so it is not confused with the angle of $\eta$ below). The rod does not change $R$, so $\tau_{RL} \propto L \propto \mu$.

        **Step 3: the ratio.** A rise of 0.05% means a factor $1 + 0.0005$:
        $$\frac{\mu}{\mu_0} = \frac{\tau_{RL,\text{rod}}}{\tau_{RL,\text{air}}} = 1.0005$$
        $$\boxed{\mu = 1.0005\,\mu_0}$$
        **Step 4: which kind.** $\chi_m = \mu_r - 1 = 5\times10^{-4} > 0$, small: **paramagnetic**. The rod's dipoles line up slightly with $\mathbf H$ and add to $\mathbf B$.

        **Speed path.** $\tau_{RL} = L/R \propto \mu$: the percent change in $\tau_{RL}$ is the percent change in $\mu$.

        **Where points go.** Reading 0.05% as 0.05; calling a positive tiny $\chi_m$ ferromagnetic.
      ` }),
    R(md`
      Part (b). Recall that
      $$\gamma\eta = j\omega\mu\qquad\text{and}\qquad \frac{\gamma}{\eta} = \sigma + j\omega\epsilon$$
      for a wave in a conducting (lossy) medium. A plane TEM wave with the magnetic field
      $$\mathbf H(z, t) = \hat x\,25e^{-z}\cos\!\left(8\pi\cdot10^6t - \sqrt3z - \frac\pi3\right)\ \text{A/m}$$
      is observed. If $\mu = \mu_0$ in the medium, determine the following.
    `),
    P({ src: 'Summer 2018 #1b(i)–(iii) · 12 pts', title: 'ω, α, β, γ, then η and ε',
      q: md`(i) (6 pts) The radian frequency $\omega = 2\pi f$, the attenuation constant $\alpha$, the wavenumber $\beta$ and the propagation constant $\gamma = \alpha + j\beta$.

(ii) (3 pts) The intrinsic impedance $\eta$.

(iii) (3 pts) The permittivity $\epsilon$.`,
      parts: [
        NT(md`(i) $\omega$`, 8 * PI * 1e6, 'rad/s', [{ v: 4e6, msg: 'That is f in Hz. ω = 8π × 10⁶ rad/s.' }]),
        N(md`(i) $\alpha$`, 1, 'Np/m'),
        N(md`(i) $\beta$`, Math.sqrt(3), 'rad/m'),
        mc(md`(i) $\gamma$ in polar form, in 1/m`, [md`$2\,e^{j60°}$`, md`$2\,e^{j30°}$`, md`$4\,e^{j60°}$`, md`$(1 + \sqrt3)\,e^{j60°}$`], 0,
          [null, md`$\tan^{-1}(\sqrt3/1) = 60°$: the imaginary part is the larger one.`, md`$|\gamma|^2 = 1 + 3 = 4$, so $|\gamma| = 2$, not 4.`, md`Sizes add by Pythagoras, not directly.`]),
        NT(md`(ii) $|\eta|$`, ETA18, 'Ω', [{ v: 2 * ETA18, msg: 'That is ωμ₀ alone. Divide by |γ| = 2.' }, { v: 120 * PI, msg: 'That is free space. This medium is lossy with ε ≠ ε₀.' }]),
        NT(md`(ii) the angle of $\eta$, in degrees`, 30, '°', [{ v: 60, msg: 'That is the angle of γ. The angle of η is 90° minus it.' }, { v: -60, msg: 'That forgot the j in jωμ, which adds 90°.' }]),
        NT(md`(iii) $\epsilon$`, 5e-6 / (64 * PI ** 3), 'F/m', [{ v: 5 * Math.sqrt(3) / (8 * PI * PI) / (8 * PI * 1e6), msg: 'That used the real part of γ/η, which is σ. ωε is the imaginary part.' }, { v: 5 / (8 * PI * PI), msg: 'That is ωε, in S/m. Divide by ω.' }]),
      ],
      hints: [md`Match $\cos(\omega t - \beta z + \phi)$ and $e^{-\alpha z}$ term by term.`, md`$\eta = j\omega\mu_0/\gamma$: divide sizes, subtract angles. Then $\gamma/\eta$, and $\epsilon = \Im\{\gamma/\eta\}/\omega$.`],
      sol: md`
        **(i) Step 1: read the wave.** A forward wave in a lossy medium has the form $H_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)$. Match term by term:
        $$\omega = 8\pi\times10^6\ \text{rad/s} \approx 2.51\times10^7\ \text{rad/s}$$
        (so $f = 4$ MHz), and
        $$\alpha = 1\ \text{Np/m},\qquad \beta = \sqrt3\ \text{rad/m}$$
        **Step 2: γ, in polar form.** $\gamma = 1 + j\sqrt3$ has size $\sqrt{1 + 3} = 2$ and angle $\tan^{-1}\sqrt3 = 60°$:
        $$\boxed{\gamma = 1 + j\sqrt3 = 2\,e^{j\pi/3}\ \text{1/m}}$$
        **(ii) Step 3: η.** Put the sheet's first relation to work: $\eta = j\omega\mu/\gamma$. First $\omega\mu_0$:
        $$\omega\mu_0 = (8\pi\times10^6)(4\pi\times10^{-7}) = 3.2\pi^2\ \Omega/\text{m}$$
        The $j$ is $e^{j90°}$. Divide sizes and subtract angles:
        $$\eta = \frac{3.2\pi^2\,e^{j90°}}{2\,e^{j60°}} = 1.6\pi^2\,e^{j30°}$$
        $$\boxed{\eta = \tfrac85\pi^2\,e^{j\pi/6} \approx 15.8\,e^{j30°}\ \Omega}$$
        Its angle is $\tau = 30°$. (This $\tau$ is the **angle of $\eta$**, not a transmission coefficient: $\mathbf H$ lags $\mathbf E$ by it.)

        **(iii) Step 4: γ/η.** Divide again, sizes and angles:
        $$\frac\gamma\eta = \frac{2\,e^{j60°}}{1.6\pi^2\,e^{j30°}} = \frac{5}{4\pi^2}\,e^{j30°}$$
        The sheet's second relation says this equals $\sigma + j\omega\epsilon$. So $\omega\epsilon$ is the imaginary part:
        $$\omega\epsilon = \frac{5}{4\pi^2}\sin30° = \frac{5}{8\pi^2} \approx 0.0633\ \text{S/m}$$
        Divide by $\omega$:
        $$\epsilon = \frac{5}{8\pi^2(8\pi\times10^6)} = \boxed{\frac{5\times10^{-6}}{64\pi^3} \approx 2.52\times10^{-9}\ \text{F/m}}$$
        That is $\epsilon_r \approx 285$. The real part gives the conductivity, $\sigma = \frac{5}{4\pi^2}\cos30° \approx 0.110$ S/m.

        !!intuition Does this make sense?
          Angles: $60° + 30° = 90°$, as $\gamma\eta = j\omega\mu$ demands ✓. Loss tangent: $\sigma/\omega\epsilon = \cos30°/\sin30° = \sqrt3$, and $\tau = \tfrac12\tan^{-1}\sqrt3 = 30°$ ✓, the same angle found another way. And $\mu = \gamma\eta/j\omega$ gives back $\mu_0$ ✓.

        **Speed path.** Read $\alpha$, $\beta$, $\omega$; $\gamma = 2\angle60°$; $\eta = \omega\mu_0/|\gamma|\angle(90° - 60°)$; $\gamma/\eta = (|\gamma|/|\eta|)\angle(60° - 30°)$; the imaginary part over $\omega$.

        **Where points go.** $f$ for $\omega$; forgetting the $j$ (angle $-60°$); taking $\epsilon$ from the real part; leaving $\omega\epsilon$ (S/m) as the answer for $\epsilon$. The key's $\eta$ and $\epsilon$ are right.
      ` }),
    P({ src: 'Summer 2018 #1b(iv)–(v) · 3 pts', title: 'The phasors H̃ and Ẽ',
      q: md`(iv) (1 pt) The phasor $\Ht$.

(v) (2 pts) The corresponding phasor $\Et$.`,
      parts: [
        mc(md`(iv) $\Ht$, in A/m`, [md`$\hat x\,25\,e^{-z}e^{-j\sqrt3z}e^{-j\pi/3}$`, md`$\hat x\,25\,e^{-z}e^{+j\sqrt3z}e^{-j\pi/3}$`, md`$\hat x\,25\,e^{-z}e^{-j\sqrt3z}e^{+j\pi/3}$`, md`$\hat x\,25\,e^{-j\sqrt3z}e^{-j\pi/3}$`], 0,
          [null, md`$\cos(\omega t - \sqrt3z + \ldots)$ has the phasor $e^{-j\sqrt3z}$: the exponent copies the sign in the cosine.`, md`The phase in the cosine is $-\pi/3$, so the phasor carries $e^{-j\pi/3}$.`, md`That lost the decay $e^{-z}$, which is part of the amplitude.`]),
        mc(md`(v) $\Et$, in V/m`, [md`$-\hat y\,40\pi^2e^{-z}e^{-j\sqrt3z}e^{-j\pi/6}$`, md`$+\hat y\,40\pi^2e^{-z}e^{-j\sqrt3z}e^{-j\pi/6}$`, md`$-\hat y\,40\pi^2e^{-z}e^{-j\sqrt3z}e^{-j\pi/2}$`, md`$-\hat y\,40\pi^2e^{-z}e^{-j\sqrt3z}e^{+j\pi/2}$`], 0,
          [null, md`$\hat y\times\hat x = -\hat z$: that $\mathbf E$ would send power toward $-z$, but the wave travels toward $+z$.`, md`That subtracts the angle of $\eta$. $\Et = \eta\times(\ldots)$ **adds** it: $-60° + 30° = -30°$.`, md`That is what the posted key's line gives: it writes $e^{+j\pi/3}$ for the phase of $\Ht$, which then adds to $\eta$'s $30°$ to make $90°$. The phase of $\Ht$ is $-\pi/3$.`]),
      ],
      hints: [md`$\Et$ must make $\Et\times\Ht^*$ point along $+\hat z$, with $|\Et| = |\eta||\Ht|$.`, md`Faraday in phasors for $\Et = \hat y\tilde E_y$, $\Ht = \hat x\tilde H_x$: $-d\tilde E_y/dz = -j\omega\mu\tilde H_x$.`],
      sol: md`
        **(iv) Step 1: the phasor of H.** Drop $e^{j\omega t}$ and keep everything else, the decay included:
        $$\boxed{\Ht = \hat x\,25\,e^{-z}e^{-j\sqrt3z}e^{-j\pi/3}\ \text{A/m}}$$
        **(v) Step 2: the direction of E.** The wave travels toward $+\hat z$ and $\mathbf H$ is along $\hat x$. Which $\mathbf E$ makes $\mathbf E\times\mathbf H$ point along $+\hat z$? $(-\hat y)\times\hat x = \hat x\times\hat y = +\hat z$. So $\mathbf E$ is along $-\hat y$.

        **Step 3: from first principles.** Faraday's law in phasors, $\nabla\times\Et = -j\omega\mu\Ht$. With $\Et = \hat y\tilde E_y(z)$, the $x$-component of the curl is $-d\tilde E_y/dz$:
        $$-\frac{d\tilde E_y}{dz} = -j\omega\mu\tilde H_x$$
        For a forward wave, $\tilde E_y \propto e^{-\gamma z}$, so $d\tilde E_y/dz = -\gamma\tilde E_y$:
        $$\gamma\tilde E_y = -j\omega\mu\tilde H_x\quad\Rightarrow\quad \tilde E_y = -\frac{j\omega\mu}{\gamma}\tilde H_x = -\eta\tilde H_x$$
        **Step 4: multiply.** Sizes multiply, angles add: $25\times\tfrac85\pi^2 = 40\pi^2$, and $-60° + 30° = -30°$:
        $$\boxed{\Et = -\hat y\,40\pi^2\,e^{-z}e^{-j\sqrt3z}e^{-j\pi/6}\ \text{V/m}}$$
        with $40\pi^2 \approx 395$ V/m. In time: $\mathbf E = -\hat y\,395\,e^{-z}\cos(8\pi\cdot10^6t - \sqrt3z - 30°)$ V/m.

        **The key.** It writes $\Et = -\hat y(25)\eta\,e^{-z}e^{+j\pi/3}e^{-j\sqrt3z}$: the sign of the $\pi/3$ flipped between its $\Ht$ (correct, $e^{-j\pi/3}$) and its $\Et$. With $\eta$'s $+30°$ that would put $\mathbf E$ at $+90°$ instead of $-30°$. The phase of $\Ht$ carries over unchanged; only $\eta$'s angle is added.

        !!intuition Does this make sense?
          $\mathbf H$ lags $\mathbf E$ by $\tau = 30°$ in a lossy medium. Here $\mathbf H$ has phase $-60°$ and $\mathbf E$ has $-30°$ (on the $-\hat y$ axis): $\mathbf H$ is $30°$ behind ✓.

        **Speed path.** Direction from $\mathbf E\times\mathbf H \parallel$ travel; size $|\eta||\mathbf H|$; phase of $\mathbf H$ plus $\tau$.

        **Where points go.** $+\hat y$; subtracting $\tau$; dropping $e^{-z}$; changing the $-\pi/3$ (the key's slip).
      ` }),

    RF(md`
      ### Problem 2 (25 points): a current sheet switched on at t = 0, with a sine

      A time-varying surface current density
      $$\mathbf J_s(t) = u(t)\sin(2\pi ft)\,\hat y\ \ \text{A/m}$$
      with $f = \tfrac12\times10^6$ Hz, lies on the surface $x = 0$ in free space; $u(t)$ is the unit step and $\omega = 2\pi f = \pi$ rad/µs. Measure $t$ in µs and distance in m, so $c = 300$ m/µs.

      [[fig:sh]]
    `, { sh: { svg: sheetFig({ n: 'x', jl: 'J_s\\ (\\hat y)', right: '\\text{toward }+x', left: '\\text{toward }-x', alt: 'the sheet x = 0 seen edge-on as a dashed vertical line; the current J_s runs along y, drawn up the sheet; one wave leaves toward +x and one toward -x' }), cap: 'The sheet edge-on, with the current along $\\hat y$ drawn up the page.' } }),
    P({ src: 'Summer 2018 #2a–d · 14 pts', title: 'E for x > 0, H for x < 0, T and λ',
      q: md`(a) (4 pts) What is the vector wave field $\mathbf E(x, t)$ produced by $\mathbf J_s(t)$ in the region $x > 0$?

(b) (4 pts) What is the vector wave field $\mathbf H(x, t)$ in the region $x < 0$?

(c) (3 pts) What is the period $T = 2\pi/\omega$ of the modulated waveforms, in µs?

(d) (3 pts) What is their wavelength $\lambda$?

In the choices, $t$ is in µs, $x$ in m and $c = 300$ m/µs.`,
      parts: [
        mc(md`(a) $\mathbf E(x, t)$ for $x > 0$, in V/m`, [md`$-60\pi\,u(t - \tfrac xc)\sin\pi(t - \tfrac xc)\,\hat y$`, md`$+60\pi\,u(t - \tfrac xc)\sin\pi(t - \tfrac xc)\,\hat y$`, md`$-60\pi\,u(t + \tfrac xc)\sin\pi(t + \tfrac xc)\,\hat y$`, md`$-120\pi\,u(t - \tfrac xc)\sin\pi(t - \tfrac xc)\,\hat y$`], 0,
          [null, md`$\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$ at the sheet: against the current.`, md`On the $x > 0$ side the wave leaves the sheet: $t - x/c$.`, md`Each of the two waves gets half: $\eta_0/2 = 60\pi$.`]),
        NT(md`(a) $E_y$ at $x = 150$ m, $t = 2$ µs`, E60, 'V/m', [{ v: -E60, msg: 'Wrong sign: t − x/c = 1.5 µs and sin(1.5π) = −1, so E_y = −60π·(−1).' }]),
        mc(md`(b) $\mathbf H(x, t)$ for $x < 0$, in A/m`, [md`$+\tfrac12\,u(t + \tfrac xc)\sin\pi(t + \tfrac xc)\,\hat z$`, md`$-\tfrac12\,u(t + \tfrac xc)\sin\pi(t + \tfrac xc)\,\hat z$`, md`$+\tfrac12\,u(t - \tfrac xc)\sin\pi(t - \tfrac xc)\,\hat z$`, md`$+\tfrac12\,u(t + \tfrac xc)\sin\pi(t + \tfrac xc)\,\hat y$`], 0,
          [null, md`That is $\mathbf H$ on the $x > 0$ side. Check here: $(-\hat y)\times(-\hat z) = +\hat x$, but this wave goes toward $-\hat x$.`, md`For $x < 0$ the delay is $t - |x|/c = t + x/c$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ (along $\hat y$) and to the travel ($\hat x$): along $\hat z$.`]),
        NT(md`(b) $H_z$ at $x = -150$ m, $t = 1$ µs`, 0.5, 'A/m', [{ v: -0.5, msg: 'Wrong sign: on the x < 0 side H_z = +½ sin π(t + x/c), and sin(π/2) = 1.' }]),
        NT(md`(c) $T$`, 2, 'μs', [{ v: 1, msg: 'That is a 1 MHz period. f = ½ MHz gives 2 µs.' }]),
        NT(md`(d) $\lambda$`, 600, 'm', [{ v: 300, msg: 'That is c/f at 1 MHz. Here f = ½ MHz.' }]),
      ],
      hints: [md`$\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(t - |x|/c)$ on both sides.`, md`On the $x < 0$ side, $\mathbf H = \frac{1}{\eta_0}(-\hat x)\times\mathbf E$.`],
      sol: md`
        ${sheetFirst('x')}

        **(a) Step 1: $x > 0$.** With $t' = t - x/c$:
        $$\mathbf E = -\hat y\,60\pi\,u(t')\sin(\pi t')$$
        So $\boxed{\mathbf E(x, t) = -\hat y\,60\pi\,u(t - \tfrac xc)\sin\pi(t - \tfrac xc)}$ V/m. The key writes it as $-\hat y\frac{\eta_0}{2}u(t - \tfrac xv)\sin(2\pi f(t - \tfrac xv))$: the same.

        **Step 2: a value.** At $x = 150$ m the delay is 0.5 µs; at $t = 2$ µs, $t' = 1.5$:
        $$E_y = -60\pi\sin(1.5\pi) = +60\pi \approx \boxed{188\ \text{V/m}}$$
        **(b) Step 3: $x < 0$.** The delay is $t + x/c$, and the wave travels toward $-\hat x$, so $\mathbf H = \frac{1}{\eta_0}(-\hat x)\times\mathbf E$. Directions: $(-\hat x)\times(-\hat y) = \hat x\times\hat y = +\hat z$; size $60\pi/120\pi = \tfrac12$:
        $$\boxed{\mathbf H(x, t) = +\hat z\,\tfrac12\,u(t + \tfrac xc)\sin\pi(t + \tfrac xc)\ \text{A/m}}$$
        **Step 4: a value.** At $x = -150$ m, $t = 1$ µs: $t + x/c = 0.5$, $\sin(\pi/2) = 1$:
        $$H_z = \boxed{+0.5\ \text{A/m}}$$
        **(c), (d) Step 5.**
        $$T = \frac1f = \boxed{2\ \mu\text{s}},\qquad \lambda = cT = (300)(2) = \boxed{600\ \text{m}}$$
        !!intuition Does this make sense?
          On the $x > 0$ side, $\mathbf H = \frac{1}{\eta_0}\hat x\times\mathbf E = -\hat z\,\tfrac12\sin(\cdot)$: the opposite sign. The jump: $\hat x\times(\mathbf H_+ - \mathbf H_-) = \hat x\times(-\hat z)J_{sy} = \hat y\,J_{sy}$ ✓, the current. Keep this $-\hat z$ in mind for part (f).

        **Speed path.** $\mathbf E = -60\pi\,\mathbf J_s(\text{delayed})$; $|\mathbf H| = J_s/2$, flipped across the sheet; $T = 1/f$, $\lambda = cT$.

        **Where points go.** The minus sign of $\mathbf E$; the delay sign for $x < 0$; mixing up which side gets $+\hat z$.
      ` }),
    P({ src: 'Summer 2018 #2e · 5 pts', title: 'E_y versus t at x = 300 m',
      q: md`(e) (5 pts) Plot $E_y(x, t)$ versus $t$ at $x = 300$ m for $0 < t < 5$ µs. Label both axes. (Hint: $E_y$ is zero until the wavefront arrives at 300 m.) Sketch it, then pick and read.

[[fig:c]]`,
      figs: { c: { svg: s18Ec(), cap: 'Four candidates for $E_y(300\\ \\text{m}, t)$, in V/m.' } },
      parts: [
        mc(md`Which plot is $E_y(300\ \text{m}, t)$?`, PLOTS, 2,
          [md`Plot A starts upward. $\mathbf E = -60\pi\,\mathbf J_s$, and the current starts upward ($\sin$), so the field starts **downward**.`, md`Plot B jumps at the front, as a cosine would. A sine starts from zero, so the field grows smoothly from the front.`, null, md`Plot D starts at $t = 0$, the field at the sheet. At 300 m it is 1 µs late.`], true),
        N(md`the time the front arrives`, 1, 'μs'),
        NT(md`$E_y$ at $t = 1.25$ µs`, -E60 / Math.SQRT2, 'V/m', [{ v: E60 / Math.SQRT2, msg: 'Wrong sign: the first lobe is negative.' }]),
      ],
      hints: [md`$E_y(300, t) = -60\pi\,u(t - 1)\sin\pi(t - 1)$.`],
      sol: md`
        **Step 1.** The front arrives at $t = 300/300 = 1$ µs:
        $$E_y(300, t) = -60\pi\,u(t - 1)\sin\pi(t - 1)$$
        **Step 2: shape.** Zero until 1 µs. Then it leaves zero **smoothly** (a sine starts at 0) and goes **negative** first: $-60\pi$ at 1.5 µs, 0 at 2, $+60\pi$ at 2.5, 0 at 3, $-60\pi$ at 3.5, 0 at 4, $+60\pi$ at 4.5, 0 at 5. **Plot C**:

        [[fig:e]]

        **Step 3: the value.** At 1.25 µs, $\sin(\pi/4) = 0.707$:
        $$E_y = -\frac{60\pi}{\sqrt2} \approx \boxed{-133\ \text{V/m}}$$
        The key's sketch matches.

        **Speed path.** The source waveform delayed by 1 µs, flipped by the minus sign.

        **Where points go.** A jump at the front (that is the cosine papers); the first lobe positive; a 1 µs period.
      `,
      figs: { c: { svg: s18Ec(), cap: 'Four candidates for $E_y(300\\ \\text{m}, t)$, in V/m.' }, e: { svg: wplot(s18E, Object.assign({}, tE18, { w: 360, h: 180 })), cap: '$E_y$ at x = 300 m: zero until 1 µs, then −60π sin π(t − 1), negative lobe first.' } } }),
    P({ src: 'Summer 2018 #2f · 6 pts', title: 'H_z versus x at t = 4 µs',
      q: md`(f) (6 pts) Plot $H_z(x, t)$ versus $x$ at $t = 4$ µs over $0 < x < 1500$ m. Label both axes. (Hint: $H_z$ is zero where the wavefront has not yet reached.) Sketch it, then pick and read.

[[fig:c]]`,
      figs: { c: { svg: s18Hc(), cap: 'Four candidates for $H_z(x, 4\\ \\mu\\text{s})$, in A/m.' } },
      parts: [
        mc(md`Which plot is $H_z(x, 4\ \mu\text{s})$?`, PLOTS, 1,
          [md`Plot A uses the $\mathbf H$ of the $x < 0$ side, $+\hat z\tfrac12\sin(\cdot)$, from part (b). On the $x > 0$ side $\mathbf H = -\hat z\tfrac12\sin(\cdot)$, which flips every lobe. (The posted key draws Plot A.)`, null, md`Plot C has no front. In 4 µs the wave has reached only 1200 m; beyond, $H_z = 0$.`, md`Plot D has a 300 m wavelength. At ½ MHz, $\lambda = 600$ m.`], true),
        NT(md`the position of the front`, 1200, 'm', [{ v: 1500, msg: 'That is the end of the window. The front is at ct = (300)(4).' }]),
        NT(md`$H_z$ at $x = 150$ m`, 0.5, 'A/m', [{ v: -0.5, msg: 'That is the sign of the x < 0 side. For x > 0, H_z = −½ sin π(t − x/c) = +½ sin(πx/300) at t = 4 µs.' }]),
        NT(md`$H_z$ at $x = 1100$ m`, -Math.sqrt(3) / 4, 'A/m', [{ v: Math.sqrt(3) / 4, msg: 'Wrong sign: the last lobe before the front is negative, the current’s first half cycle times −½.' }]),
      ],
      hints: [md`For $x > 0$: $H_z = -\tfrac12\,u(t - \tfrac xc)\sin\pi(t - \tfrac xc)$. Put $t = 4$.`, md`$\sin(4\pi - \theta) = -\sin\theta$.`],
      sol: md`
        **Step 1: $\mathbf H$ on the $x > 0$ side.** $\mathbf H = \frac{1}{\eta_0}\hat x\times\mathbf E$, and $\hat x\times(-\hat y) = -\hat z$:
        $$H_z = -\tfrac12\,u(t - \tfrac{x}{300})\sin\pi(t - \tfrac{x}{300})$$
        **Step 2: freeze $t = 4$ µs.** The front is at $x = (300)(4) = 1200$ m; beyond it $H_z = 0$. Behind it:
        $$H_z = -\tfrac12\sin\!\left(4\pi - \frac{\pi x}{300}\right)$$
        **Step 3: simplify.** $\sin(4\pi - \theta) = -\sin\theta$, so the two minus signs cancel:
        $$H_z(x, 4\ \mu\text{s}) = +\tfrac12\sin\frac{\pi x}{300},\qquad 0 < x < 1200\ \text{m}$$
        **Step 4: points.** Positive lobe from 0 to 300 m (peak $+\tfrac12$ at 150), negative from 300 to 600, positive 600 to 900, negative 900 to 1200, then zero. Two wavelengths. **Plot B**:

        [[fig:h]]

        **Step 5: the values.** $\boxed{H_z(150) = +0.5\ \text{A/m}}$. At $x = 1100$ m the angle is $11\pi/3$, which is $-\pi/3$ plus two turns:
        $$H_z = \tfrac12\sin\!\left(-\frac\pi3\right) = -\frac{\sqrt3}{4} \approx \boxed{-0.433\ \text{A/m}}$$
        **The key.** Its sketch is Plot A: negative lobe first at the sheet, positive lobe just behind the front. That is the sign of the $x < 0$ side (its own part b, $+\hat z\tfrac12$), carried to $x > 0$ by mistake. Two independent checks show it must be flipped.

        - **The front.** Just behind the front the field is what the sheet made just after $t = 0$: $J_{sy} = \sin(0^+) > 0$, so $E_y = -60\pi J_{sy} < 0$ there. For power to flow toward $+\hat x$, $(-\hat y)\times\mathbf H$ must be along $+\hat x$, so $\mathbf H$ is along $-\hat z$: $H_z < 0$ just behind the front. Plot B has that; Plot A does not.
        - **The jump at the sheet.** $\hat x\times(\mathbf H_+ - \mathbf H_-) = \mathbf J_s$ needs $H_{z+} = -\tfrac12J_{sy}$ when $H_{z-} = +\tfrac12J_{sy}$.

        **Speed path.** Front at $ct$. Right behind the front: the source's first half cycle times the sign of $\mathbf H$ **on this side** ($-\tfrac12$): a negative lobe. Then alternate back to the sheet, 300 m per lobe.

        **Where points go.** Reusing the other side's sign (the key's slip); no front; the wrong wavelength; mislabeling the axis $z$ (the paper's own typo, corrected on the key to $x$).
      `,
      figs: { c: { svg: s18Hc(), cap: 'Four candidates for $H_z(x, 4\\ \\mu\\text{s})$, in A/m.' }, h: { svg: wplot(s18H, Object.assign({}, zH18, { w: 360, h: 180 })), cap: '$H_z(x)$ at t = 4 µs: +½ sin(πx/300) behind the front at 1200 m, zero beyond. The posted key draws it upside down.' } } }),

    R(md`
      ### Problem 3 (25 points): the constants of a right-circular phasor, and a good conductor

      Part (a): a **right**-circularly polarized TEM plane wave travels in free space in the $+y$ direction at $f = 150$ MHz. At the origin $(x, y, z) = (0, 0, 0)$ and $t = 0$, its electric field is $2\hat z$ V/m. Its phasor is written
      $$\Et = (A\hat x + B\hat y + C\hat z)\,e^{j(ax + by + cz)}\ \ \text{V/m}$$
    `),
    P({ src: 'Summer 2018 #3a · 12 pts', title: 'a, b, c and A, B, C',
      q: md`(i) (4 pts) The numerical values of $a$, $b$ and $c$. Hint: what is $\beta$?

(ii) (4 pts) The numerical values of $A$, $B$ and $C$.

(iii) (4 pts) The time-averaged Poynting vector $\langle\mathbf E\times\mathbf H\rangle$; simplify without a calculator. Hint: twice the linearly polarized value.`,
      parts: [
        mc(md`(i) $a$, $b$, $c$ (in rad/m)`, [md`$a = 0,\ b = -\pi,\ c = 0$`, md`$a = 0,\ b = +\pi,\ c = 0$`, md`$a = 0,\ b = -2\pi,\ c = 0$`, md`$a = -\pi,\ b = 0,\ c = 0$`], 0,
          [null, md`$e^{+j\pi y}$ travels toward $-y$. With the phasor written as $e^{j(\ldots)}$, travel toward $+y$ needs $b = -\beta$.`, md`$\lambda = c/f = 2$ m, so $\beta = 2\pi/2 = \pi$.`, md`The phase changes along the travel, $y$; $x$ is a direction of $\mathbf E$.`]),
        mc(md`(ii) $A$, $B$, $C$ (in V/m)`, [md`$A = -j2,\ B = 0,\ C = 2$`, md`$A = +j2,\ B = 0,\ C = 2$`, md`$A = 2,\ B = 0,\ C = -j2$`, md`$A = -j2,\ B = 2,\ C = 2$`], 0,
          [null, md`With $+j2$, $\mathbf E(T/4) = -2\hat x$: the tip turns $\hat z\to-\hat x$, about $\hat z\times(-\hat x) = -\hat y$, against the travel. That is left-circular.`, md`That makes $\mathbf E(0) = 2\hat x$. The paper says $\mathbf E(0) = 2\hat z$: $C$ must be the real one.`, md`A plane wave has no field along its direction of travel: $B = 0$.`]),
        NT(md`(iii) $|\langle\mathbf E\times\mathbf H\rangle|$`, 1 / (30 * PI), 'W/m^2', [{ v: 1 / (60 * PI), msg: 'That is one component, E₀²/(2η₀). Circular is twice that.' }, { v: 1 / (15 * PI), msg: 'That forgot the ½ of the time average.' }]),
      ],
      hints: [md`$\lambda = c/f = 2$ m. Travel toward $+y$ means $e^{-j\beta y}$.`, md`Right-circular, thumb along $+\hat y$: the tip turns from $\hat z$ toward $\hat x$ (since $\hat z\times\hat x = +\hat y$). So $\mathbf E(T/4) = 2\hat x$.`],
      sol: md`
        **(i) Step 1: β.**
        $$\lambda = \frac cf = \frac{3\times10^8}{1.5\times10^8} = 2\ \text{m},\qquad \beta = \frac{2\pi}{\lambda} = \pi\ \text{rad/m}$$
        **Step 2: the exponent.** Travel toward $+y$ means $e^{-j\beta y}$. Matching $e^{j(ax + by + cz)}$:
        $$\boxed{a = 0,\quad b = -\pi\ \text{rad/m},\quad c = 0}$$
        (The sign of $b$ is easy to lose: $b = +\pi$ would be a wave toward $-y$.)

        **(ii) Step 3: B.** A plane wave has no field along its travel: $\boxed{B = 0}$.

        **Step 4: where the tip goes.** Right-circular with the thumb along $+\hat y$: the fingers curl from $\hat z$ to $\hat x$, because $\hat z\times\hat x = +\hat y$. The tip starts at $2\hat z$, so a quarter period later it is at $2\hat x$.

        [[fig:pol]]

        **Step 5: each component from its two snapshots.** $E_z$ is 2 at $t = 0$ and 0 at $T/4$: $2\cos\omega t$, phasor $C = 2$. $E_x$ is 0 at $t = 0$ and 2 at $T/4$: $2\cos(\omega t - 90°)$, phasor $A = 2e^{-j90°} = -j2$:
        $$\boxed{A = -j2\ \text{V/m},\quad B = 0,\quad C = 2\ \text{V/m}}$$
        **(iii) Step 6: power.** Each component is a linear wave of amplitude 2 V/m carrying $E_0^2/(2\eta_0)$; the two are perpendicular, so they add:
        $$\langle\mathbf E\times\mathbf H\rangle = \hat y\,2\cdot\frac{2^2}{2\eta_0} = \hat y\,\frac{4}{120\pi}$$
        $$\boxed{\langle\mathbf E\times\mathbf H\rangle = \hat y\,\frac{1}{30\pi} \approx \hat y\,0.0106\ \text{W/m}^2}$$
        **Speed path.** $\beta = \pi$, $b = -\pi$. Right-hand about the travel tells where $\mathbf E(0)$ goes next; that next axis gets the $-j$. Power: $|A|^2 + |C|^2$ over $2\eta_0$.

        **Where points go.** $b = +\pi$; $A = +j2$ (the left-hand wave); a nonzero $B$; forgetting the factor 2 for circular. The key's answers are right.
      `,
      figs: { pol: { svg: polFig({ h: 'z', v: 'x', e0: 0, e1: 90, travel: 1, alt: 'the z-x plane with y out of the page; the wave travels out of the page; E at t = 0 points along +z (right), at T/4 along +x (up); the tip turns counterclockwise' }), cap: 'With $\\hat z$ right and $\\hat x$ up, $\\hat y$ (the travel, ⊙) comes out of the page. Right-circular means counterclockwise here: from $2\\hat z$ to $2\\hat x$.' } } }),
    R(md`
      Part (b): a TEM wave travels in the $-z$ direction in a homogeneous medium with $\mu = \mu_0$, $\epsilon = 81\epsilon_0$ and $\sigma = 4$ S/m. The frequency is $f = 1$ kHz and **the wavelength is longer than the penetration depth**. (This is word for word the part (b) of the 2019 paper: the course reused it.)
    `),
    P({ src: 'Summer 2018 #3b(i)–(iv) · 10 pts', title: 'Imperfect dielectric or good conductor?',
      q: md`(i) (4 pts) Does the medium act as an *imperfect dielectric* or a *good conductor* at this frequency? Explain.

(ii) (2 pts) What is the penetration depth $\delta$? Simplify without a calculator.

(iii) (2 pts) What is the wavelength $\lambda$? Simplify without a calculator.

(iv) (2 pts) What is the propagation velocity $v_p = \omega/\beta$? Simplify without a calculator.`,
      parts: [
        mc(md`(i) The medium is`, [md`a good conductor`, md`an imperfect dielectric`], 0,
          [null, md`An imperfect dielectric has $\delta \gg \lambda$ (many wavelengths before it fades). Here $\lambda > \delta$, and $\sigma/\omega\epsilon \approx 9\times10^5$.`]),
        NT(md`(ii) $\delta$`, 25 / PI, 'm', [{ v: PI / 25, msg: 'That is α. δ = 1/α.' }]),
        NT(md`(iii) $\lambda$`, 50, 'm', [{ v: 25 / PI, msg: 'That is δ. λ = 2πδ in a good conductor.' }]),
        NT(md`(iv) $v_p$`, 5e4, 'm/s', [{ v: 3e8, msg: 'That is c. Here v_p = ωδ.' }]),
      ],
      hints: [md`Good conductor: $\alpha = \beta = \sqrt{\pi f\mu\sigma}$, $\delta = 1/\alpha$, $\lambda = 2\pi\delta$.`],
      sol: md`${gcSol}

${gcSpeed}` }),
    P({ src: 'Summer 2018 #3b(v) · 3 pts', title: 'Power after 10 m',
      q: md`(v) (3 pts) If the wave carries 1 W/m² at $z = 0$, what power density does it carry at $z = -10$ m? (Estimate by hand.)`,
      parts: [NT(md`$\langle S\rangle$ at $z = -10$ m`, Math.exp(-4 * PI / 5), 'W/m^2', [{ v: Math.exp(-2 * PI / 5), msg: 'That is the field ratio e^{−αd}. Power: e^{−2αd}.' }, { v: Math.exp(4 * PI / 5), msg: 'The wave travels toward −z; at z = −10 m it is weaker, not stronger.' }], 0.03)],
      hints: [md`$\langle S\rangle \propto e^{-2\alpha d}$, with $\alpha = \pi/25$ 1/m.`],
      sol: powSol, figs: decFig }),
  ];
  EM.lesson('e3-past', { id: 'e3-past-su18', order: 8, title: 'Summer 2018 Exam 3', kind: 'exam', sub: 'Kudeki · 3 problems, 75 pts · a lossy H read off, a sine-driven sheet, RCP constants, a good conductor', steps: su18 });

  // ======================================================================================== SUMMER 2017
  const s17E = (t) => -E60 * step(t - 2) * Math.sin(2 * PI * (t - 2));    // E_x at z = 600 m, f = 1 MHz
  const s17H = (z) => (z < 900 ? 0.5 * Math.sin(2 * PI * z / 300) : 0);   // H_y(z) at t = 3 µs, z > 0
  const tE17 = Object.assign({ x: [0, 4.4], xt: TT(4), xl: 't\\,(\\mu\\text{s})', yl: 'E_x\\,(\\text{V/m})' }, EY);
  const zH17 = Object.assign({ x: [0, 1280], xt: ZT(4), xl: 'z\\,(\\text{m})', yl: 'H_y\\,(\\text{A/m})' }, HY);
  const s17Ec = () => row4([wplot((t) => -E60 * step(t - 1) * Math.sin(2 * PI * (t - 1)), tE17), wplot((t) => -s17E(t), tE17), wplot((t) => -E60 * step(t - 2) * Math.sin(PI * (t - 2)), tE17), wplot(s17E, tE17)]);
  const s17Hc = () => row4([wplot(s17H, zH17), wplot((z) => -s17H(z), zH17), wplot((z) => (z < 600 ? 0.5 * Math.sin(2 * PI * z / 300) : 0), zH17), wplot((z) => (z < 900 ? 0.5 * Math.sin(2 * PI * z / 600) : 0), zH17)]);

  const su17 = [
    R(md`
      **Summer 2017 · ECE 329 · Exam 3** (Prof. Kudeki). Friday, July 28, 2017, 11:00–11:50 AM. Three problems of 25 points, 75 in all; the class averaged about 64. Closed book, calculators allowed, three formula sheets. Yours: closed book, no calculator, the official sheet and one 4″×6″ card.

      The handwritten key is right throughout, apart from one mislabeled line, flagged in Problem 3.

      **What it tests.** A current sheet switched on with a sine, sketched in time and in space ([Exam 2 Topic 15](#/l/t15-sheet-waves), [Topic 10](#/l/w3-antenna)); the constants of a left-circular phasor and its power ([Topic 9](#/l/w3-pol), [Topic 4](#/l/w1-avg)); an imperfect dielectric read from $\lambda$ and $\delta$: speed, $\epsilon_r$, $\eta$ and $\sigma$ ([Topic 7](#/l/w2-limits)); reflection and transmission at a dielectric–vacuum boundary, worked **backward** from the transmitted field ([Topic 11](#/l/w4-gamma)).

      **How to use it.** Set a 75-minute timer (the sitting was 50 minutes) and work on paper. Then enter your answers. Plot questions are a choice between candidate plots plus values read off your own sketch.
    `),

    RF(md`
      ### Problem 1 (25 points): a current sheet switched on with a sine

      A time-varying surface current density
      $$\mathbf J_s(t) = u(t)\sin(2\pi ft)\,\hat x\ \ \text{A/m}$$
      with $f = 10^6$ Hz, lies on the surface $z = 0$ in free space; $u(t)$ is the unit step and $\omega = 2\pi f = 2\pi$ rad/µs. Measure $t$ in µs and distance in m, so $c = 300$ m/µs.

      [[fig:sh]]
    `, { sh: { svg: sheetFig({ n: 'z', jl: 'J_s\\ (\\hat x)', right: '\\text{toward }+z', left: '\\text{toward }-z', alt: 'the sheet z = 0 seen edge-on as a dashed vertical line; the current J_s runs along x, drawn up the sheet; one wave leaves toward +z and one toward -z' }), cap: 'The sheet edge-on, with the current along $\\hat x$ drawn up the page.' } }),
    P({ src: 'Summer 2017 #1a–d · 14 pts', title: 'E and H for z > 0, T and λ',
      q: md`(a) (4 pts) What is the vector wave field $\mathbf E(z, t)$ produced by $\mathbf J_s(t)$ in the region $z > 0$?

(b) (4 pts) What is the accompanying $\mathbf H(z, t)$ in the same region?

(c) (3 pts) What is the period $T = 2\pi/\omega$ of the modulated waveforms?

(d) (3 pts) What is their wavelength $\lambda$?

In the choices, $t$ is in µs, $z$ in m and $c = 300$ m/µs.`,
      parts: [
        mc(md`(a) $\mathbf E(z, t)$ for $z > 0$, in V/m`, [md`$-60\pi\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\,\hat x$`, md`$+60\pi\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\,\hat x$`, md`$-60\pi\,u(t + \tfrac zc)\sin2\pi(t + \tfrac zc)\,\hat x$`, md`$-120\pi\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\,\hat x$`], 0,
          [null, md`$\mathbf E = -\frac{\eta_0}{2}\mathbf J_s$: against the current.`, md`On the $z > 0$ side the wave leaves the sheet: $t - z/c$.`, md`Two waves share the current: $\eta_0/2$ each.`]),
        NT(md`(a) $E_x$ at $z = 150$ m, $t = 0.75$ µs`, -E60, 'V/m', [{ v: E60, msg: 'Wrong sign: t − z/c = 0.25 µs, sin(π/2) = 1, and E_x = −60π.' }]),
        mc(md`(b) $\mathbf H(z, t)$ for $z > 0$, in A/m`, [md`$-\tfrac12\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\,\hat y$`, md`$+\tfrac12\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\,\hat y$`, md`$-\tfrac12\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\,\hat x$`, md`$-\tfrac{1}{240\pi}\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\,\hat y$`], 0,
          [null, md`$(-\hat x)\times(+\hat y) = -\hat z$: power toward the sheet. On this side it must flow toward $+\hat z$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ (along $\hat x$).`, md`That divides by $\eta_0$ twice: $|\mathbf H| = |\mathbf E|/\eta_0 = 60\pi/120\pi = \tfrac12$.`]),
        NT(md`(b) $H_y$ at $z = 150$ m, $t = 0.75$ µs`, -0.5, 'A/m', [{ v: 0.5, msg: 'Wrong sign: H_y = −½ sin 2π(t − z/c), and the sine is +1 here.' }]),
        NT(md`(c) $T$`, 1, 'μs', [{ v: 2, msg: 'That is the period at ½ MHz. Here f = 1 MHz.' }]),
        NT(md`(d) $\lambda$`, 300, 'm', [{ v: 600, msg: 'That is λ at ½ MHz.' }]),
      ],
      hints: [md`$\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(t - |z|/c)$ on both sides.`, md`For $z > 0$, $\mathbf H = \frac{1}{\eta_0}\hat z\times\mathbf E$.`],
      sol: md`
        ${sheetFirst('z')}

        **(a) Step 1: $z > 0$.** With $t' = t - z/c$:
        $$\mathbf E = -\hat x\,60\pi\,u(t')\sin(2\pi t')$$
        So $\boxed{\mathbf E(z, t) = -\hat x\,60\pi\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)}$ V/m. This is exactly the formula on your sheet, which is written for this geometry.

        **Step 2: a value.** At $z = 150$ m the delay is 0.5 µs; at $t = 0.75$ µs, $t' = 0.25$ and $\sin(\pi/2) = 1$:
        $$E_x = \boxed{-60\pi \approx -188\ \text{V/m}}$$
        **(b) Step 3: H on the same side.** The travel is $+\hat z$: $\mathbf H = \frac{1}{\eta_0}\hat z\times\mathbf E$. Directions: $\hat z\times(-\hat x) = -\hat y$. Size $\tfrac12$:
        $$\boxed{\mathbf H(z, t) = -\hat y\,\tfrac12\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)\ \text{A/m}}$$
        At the same point, $\boxed{H_y = -0.5\ \text{A/m}}$.

        **(c), (d) Step 4.**
        $$T = \frac1f = \boxed{1\ \mu\text{s}},\qquad \lambda = \frac cf = \frac{3\times10^8}{10^6} = \boxed{300\ \text{m}}$$
        !!intuition Does this make sense?
          $\mathbf E\times\mathbf H = (-\hat x)\times(-\hat y)\cdot(\ldots)^2 = +\hat z(\ldots)^2$: power leaves the sheet ✓. And $|\mathbf E|/|\mathbf H| = 60\pi/\tfrac12 = 120\pi = \eta_0$ ✓.

        **Speed path.** The sheet's own formula: $E_x = \frac{\eta_0}{2}J_s$ for a current $-J_s\hat x$, so $-60\pi$ for $+\hat x$; $H_y = \pm\tfrac12J_s$ with the sign flipped: $-\tfrac12$ for $z > 0$.

        **Where points go.** The two minus signs; $t + z/c$; a period of 2 µs from mixing $f$ and $\omega$.
      ` }),
    P({ src: 'Summer 2017 #1e · 5 pts', title: 'E_x versus t at z = 600 m',
      q: md`(e) (5 pts) Plot $E_x(z, t)$ versus $t$ at $z = 600$ m for $0 < t < 4$ µs. Label both axes. (Hint: $E_x$ is zero until the wavefront arrives at 600 m.) Sketch it, then pick and read.

[[fig:c]]`,
      figs: { c: { svg: s17Ec(), cap: 'Four candidates for $E_x(600\\ \\text{m}, t)$, in V/m.' } },
      parts: [
        mc(md`Which plot is $E_x(600\ \text{m}, t)$?`, PLOTS, 3,
          [md`Plot A arrives at 1 µs. 600 m at 300 m/µs takes 2 µs.`, md`Plot B starts upward. The current starts upward (a sine), and $\mathbf E = -60\pi\,\mathbf J_s$, so the field starts **down**.`, md`Plot C has a 2 µs period. At 1 MHz the period is 1 µs.`, null], true),
        N(md`the time the front arrives`, 2, 'μs'),
        NT(md`$E_x$ at $t = 2.625$ µs`, E60 / Math.SQRT2, 'V/m', [{ v: -E60 / Math.SQRT2, msg: 'Wrong sign: 2π(0.625) = 225°, sin 225° = −0.707, and E_x = −60π times that.' }]),
      ],
      hints: [md`$E_x(600, t) = -60\pi\,u(t - 2)\sin2\pi(t - 2)$.`],
      sol: md`
        **Step 1.** The front needs $600/300 = 2$ µs:
        $$E_x(600, t) = -60\pi\,u(t - 2)\sin2\pi(t - 2)$$
        **Step 2: shape.** Zero until 2 µs. Then a smooth start (a sine), **negative** first: $-60\pi$ at 2.25, 0 at 2.5, $+60\pi$ at 2.75, 0 at 3, and once more by 4 µs. Two full cycles. **Plot D**:

        [[fig:e]]

        **Step 3: the value.** At 2.625 µs the angle is $2\pi(0.625) = 225°$, where $\sin = -0.707$:
        $$E_x = -60\pi(-0.707) \approx \boxed{+133\ \text{V/m}}$$
        The key's sketch and its note ("a delayed minus sine curve with 1 µs period") match.

        **Speed path.** Delay $z/c = 2$ µs; the source's sine, flipped; period 1 µs.

        **Where points go.** Arrival at the wrong time; the first lobe upward; a jump at the front (that would be a cosine source).
      `,
      figs: { c: { svg: s17Ec(), cap: 'Four candidates for $E_x(600\\ \\text{m}, t)$, in V/m.' }, e: { svg: wplot(s17E, Object.assign({}, tE17, { w: 360, h: 180 })), cap: '$E_x$ at z = 600 m: zero until 2 µs, then −60π sin 2π(t − 2).' } } }),
    P({ src: 'Summer 2017 #1f · 6 pts', title: 'H_y versus z at t = 3 µs',
      q: md`(f) (6 pts) Plot $H_y(z, t)$ versus $z$ at $t = 3$ µs over $0 < z < 1200$ m. Label both axes. (Hint: $H_y$ is zero where the wavefront has not yet reached.) Sketch it, then pick and read.

[[fig:c]]`,
      figs: { c: { svg: s17Hc(), cap: 'Four candidates for $H_y(z, 3\\ \\mu\\text{s})$, in A/m.' } },
      parts: [
        mc(md`Which plot is $H_y(z, 3\ \mu\text{s})$?`, PLOTS, 0,
          [null, md`Plot B is flipped. $H_y = -\tfrac12\sin2\pi(t - z/c)$; right behind the front the current's first half cycle is positive, so $H_y$ is **negative** there, at 900 m.`, md`Plot C stops at 600 m. In 3 µs the front travels 900 m.`, md`Plot D has a 600 m wavelength. At 1 MHz, $\lambda = 300$ m.`], true),
        N(md`the position of the front`, 900, 'm'),
        NT(md`$H_y$ at $z = 75$ m`, 0.5, 'A/m', [{ v: -0.5, msg: 'Wrong sign: at t = 3 µs, H_y = −½ sin(6π − 2πz/300) = +½ sin(2πz/300).' }]),
        NT(md`$H_y$ at $z = 850$ m`, -Math.sqrt(3) / 4, 'A/m', [{ v: Math.sqrt(3) / 4, msg: 'Wrong sign: just behind the front, H_y is negative.' }]),
      ],
      hints: [md`$H_y = -\tfrac12\,u(t - \tfrac zc)\sin2\pi(t - \tfrac zc)$ at $t = 3$; use $\sin(6\pi - \theta) = -\sin\theta$.`],
      sol: md`
        **Step 1: freeze $t = 3$ µs.** The front is at $z = (300)(3) = 900$ m. Behind it, from part (b):
        $$H_y = -\tfrac12\sin\!\left(6\pi - \frac{2\pi z}{300}\right)$$
        **Step 2: simplify.** $\sin(6\pi - \theta) = -\sin\theta$:
        $$H_y(z, 3\ \mu\text{s}) = +\tfrac12\sin\frac{2\pi z}{300},\qquad 0 < z < 900\ \text{m}$$
        **Step 3: points.** Peaks $+\tfrac12$ at $z = 75, 375, 675$; troughs $-\tfrac12$ at $225, 525, 825$; zeros every 150 m; zero beyond 900 m. Three wavelengths, the last lobe negative going into the front. **Plot A**:

        [[fig:h]]

        **Step 4: the values.** $\boxed{H_y(75) = +0.5\ \text{A/m}}$. At $z = 850$ m the angle is $2\pi(850)/300 = 17\pi/3$, which is $-\pi/3$ after three turns:
        $$H_y = \tfrac12\sin\!\left(-\frac\pi3\right) = -\frac{\sqrt3}{4} \approx \boxed{-0.433\ \text{A/m}}$$
        !!intuition Does this make sense?
          Right behind the front sits what the sheet made just after $t = 0$: a small positive current, so $H_y = -\tfrac12J_s$ is small and negative. That is the key's remark: "since initial $H_y$ is negative going, the curve goes negative at the wavefront at 900 m." The key's sketch matches.

        **Speed path.** Front at $ct$; just behind it, the first half cycle of the source times $-\tfrac12$; alternate back to the sheet every 150 m.

        **Where points go.** Drawing the time waveform left to right from the sheet (that flips the picture); the front at the wrong place; a 600 m wavelength.
      `,
      figs: { c: { svg: s17Hc(), cap: 'Four candidates for $H_y(z, 3\\ \\mu\\text{s})$, in A/m.' }, h: { svg: wplot(s17H, Object.assign({}, zH17, { w: 360, h: 180 })), cap: '$H_y(z)$ at t = 3 µs: +½ sin(2πz/300) behind the front at 900 m, zero beyond.' } } }),

    R(md`
      ### Problem 2 (25 points): the constants of a left-circular phasor, and an imperfect dielectric

      Part (a): a **left**-circularly polarized TEM plane wave travels in free space in the $-x$ direction at $f = 100$ MHz. At the origin and $t = 0$ its electric field is $20\hat z$ V/m. Its phasor is written
      $$\Et = (A\hat x + B\hat y + C\hat z)\,e^{j(ax + by + cz)}\ \ \text{V/m}$$
    `),
    P({ src: 'Summer 2017 #2a · 12 pts', title: 'a, b, c, A, B, C and the power',
      q: md`(i) (4 pts) The numerical values of $a$, $b$ and $c$. Hint: what is $\beta$?

(ii) (4 pts) The numerical values of $A$, $B$ and $C$.

(iii) (4 pts) The time-averaged Poynting vector $\langle\mathbf E\times\mathbf H\rangle$. Hint: twice the linearly polarized value.`,
      parts: [
        mc(md`(i) $a$, $b$, $c$ (in rad/m)`, [md`$a = \tfrac{2\pi}{3},\ b = 0,\ c = 0$`, md`$a = -\tfrac{2\pi}{3},\ b = 0,\ c = 0$`, md`$a = \tfrac{3}{2\pi},\ b = 0,\ c = 0$`, md`$a = 0,\ b = 0,\ c = \tfrac{2\pi}{3}$`], 0,
          [null, md`$e^{-j\beta x}$ travels toward $+x$. This wave goes toward $-x$: $e^{+j\beta x}$, so $a = +\beta$.`, md`That is $\lambda/2\pi$ upside down. $\beta = 2\pi/\lambda = 2\pi/3$.`, md`The phase changes along the travel, $x$. $\hat z$ is a direction of $\mathbf E$.`]),
        mc(md`(ii) $A$, $B$, $C$ (in V/m)`, [md`$A = 0,\ B = j20,\ C = 20$`, md`$A = 0,\ B = -j20,\ C = 20$`, md`$A = 0,\ B = 20,\ C = j20$`, md`$A = 20,\ B = j20,\ C = 0$`], 0,
          [null, md`With $-j20$, $\mathbf E(T/4) = +20\hat y$: the tip turns $\hat z\to\hat y$, about $\hat z\times\hat y = -\hat x$, which **is** the travel. That is right-circular.`, md`That makes $\mathbf E(0) = 20\hat y$. The paper says $20\hat z$, so $C$ is the real one.`, md`$A$ is the component along the travel, $\hat x$: it must be zero.`]),
        NT(md`(iii) $|\langle\mathbf E\times\mathbf H\rangle|$`, 10 / (3 * PI), 'W/m^2', [{ v: 5 / (3 * PI), msg: 'That is one component. A circular wave has two.' }, { v: 20 / (3 * PI), msg: 'That forgot the ½ of the time average.' }]),
        mc(md`(iii) its direction`, [md`$-\hat x$`, md`$+\hat x$`, md`$+\hat z$`], 0,
          [null, md`Power flows with the wave, toward $-x$.`, md`$\hat z$ is a direction of $\mathbf E$.`]),
      ],
      hints: [md`$\lambda = c/f = 3$ m. Travel toward $-x$ means $e^{+j\beta x}$.`, md`Left-circular, thumb along $-\hat x$: the tip turns from $\hat z$ toward $-\hat y$. So $\mathbf E(T/4) = -20\hat y$.`],
      sol: md`
        **(i) Step 1: β.** The key starts here:
        $$\lambda = \frac cf = \frac{3\times10^8}{10^8} = 3\ \text{m},\qquad \beta = \frac{2\pi}{\lambda} = \frac{2\pi}{3}\ \text{rad/m}$$
        **Step 2: the exponent.** Toward $-x$: $e^{+j\beta x}$. Matching $e^{j(ax + by + cz)}$:
        $$\boxed{a = \tfrac{2\pi}{3}\ \text{rad/m},\quad b = c = 0}$$
        **(ii) Step 3: A.** No field along the travel: $\boxed{A = 0}$.

        **Step 4: where the tip goes.** Left-circular about the travel $-\hat x$ is the same as right-handed about $+\hat x$: the fingers of the right hand around $+\hat x$ curl from $\hat y$ to $\hat z$ (since $\hat y\times\hat z = \hat x$), then on to $-\hat y$. The tip starts at $20\hat z$, so a quarter period later it is at $-20\hat y$.

        [[fig:pol]]

        **Step 5: the phasors.** $E_z$: 20 at $t = 0$, 0 at $T/4$: $20\cos\omega t$, so $C = 20$. $E_y$: 0 at $t = 0$, $-20$ at $T/4$: $B\cos(\omega t + b)$ with $B\cos b = 0$ and $-B\sin b = -20$, so $b = 90°$, $B = 20$: phasor $20e^{j90°} = j20$:
        $$\boxed{A = 0,\quad B = j20\ \text{V/m},\quad C = 20\ \text{V/m}}$$
        The key says it in one line: "$E_y$ leads $E_z$, so the wave is LHP." Indeed $E_y = 20\cos(\omega t + 90°)$ is $90°$ ahead of $E_z$.

        **(iii) Step 6: power.** Two perpendicular components of amplitude 20 V/m:
        $$\langle\mathbf E\times\mathbf H\rangle = -\hat x\,2\cdot\frac{20^2}{2\eta_0} = -\hat x\,\frac{400}{120\pi}$$
        $$\boxed{\langle\mathbf E\times\mathbf H\rangle = -\hat x\,\frac{10}{3\pi} \approx -\hat x\,1.06\ \text{W/m}^2}$$
        **Speed path.** $\lambda = 3$ m, $a = +2\pi/3$ (toward $-x$). Rotation: right-handed about $+\hat x$ is $\hat y\to\hat z\to-\hat y$, so from $\hat z$ the next stop is $-\hat y$: $B = -j(-20) = +j20$. Power: $|E_0|^2/\eta_0 = 400/(120\pi)$.

        **Where points go.** $a = -2\pi/3$; $B = -j20$ (right-circular); forgetting the factor 2, or the $\tfrac12$; the direction.
      `,
      figs: { pol: { svg: polFig({ h: 'y', v: 'z', e0: 90, e1: 180, travel: -1, alt: 'the y-z plane with x out of the page; the wave travels into the page; E at t = 0 points along +z (up), at T/4 along -y (left); the tip turns counterclockwise' }), cap: 'With $\\hat y$ right and $\\hat z$ up, $\\hat x$ is out of the page; the wave travels into the page (⊗). Counterclockwise is right-handed about $+\\hat x$, left-handed about the travel: left-circular.' } } }),
    R(md`
      Part (b): a TEM wave travels in a homogeneous medium at $f = 100$ MHz, with wavelength $\lambda = 2$ m, penetration depth $\delta = 100$ m, and $\mu = \mu_0$.
    `),
    P({ src: 'Summer 2017 #2b · 13 pts', title: 'A medium read from λ and δ',
      q: md`(i) (4 pts) Does the medium act as an *imperfect dielectric* or a *good conductor* at this frequency? Explain.

(ii) (2 pts) What is the propagation velocity $v$?

(iii) (2 pts) What is the relative permittivity $\epsilon_r$?

(iv) (2 pts) What is the magnitude of the intrinsic impedance $\eta$?

(v) (3 pts) What is the conductivity $\sigma$?`,
      parts: [
        mc(md`(i) The medium is`, [md`an imperfect dielectric`, md`a good conductor`], 0,
          [null, md`A good conductor has $\alpha = \beta$, so $\delta = \lambda/2\pi \approx 0.3$ m. Here $\delta = 100$ m is 50 wavelengths: $\alpha \ll \beta$.`]),
        NT(md`(ii) $v$`, 2e8, 'm/s', [{ v: 3e8, msg: 'That is c. In the medium v = λf.' }]),
        NT(md`(iii) $\epsilon_r$`, 2.25, '', [{ v: 1.5, msg: 'That is √ε_r = c/v. Square it.' }]),
        NT(md`(iv) $|\eta|$`, 80 * PI, 'Ω', [{ v: 120 * PI / 2.25, msg: 'That divides η₀ by ε_r. The formula has √ε_r.' }]),
        NT(md`(v) $\sigma$`, 1e-3 / (4 * PI), 'S/m', [{ v: 1e-3 / (8 * PI), msg: 'That is α/|η|: the factor 2 is missing. α ≈ ση/2, so σ = 2α/η.' }, { v: 2 / (100 * 120 * PI), msg: 'That used η₀. Use the medium’s η = 80π Ω.' }]),
      ],
      hints: [md`$v = \lambda f$, $\epsilon_r = (c/v)^2$, $|\eta| \approx \eta_0/\sqrt{\epsilon_r}$.`, md`In an imperfect dielectric, $\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon} = \frac{\sigma\eta}{2}$, and $\alpha = 1/\delta$.`],
      sol: md`
        **(i) Step 1: compare δ with λ.** $\delta = 100$ m is 50 wavelengths: the wave runs a long way before it fades. So $\alpha = 1/\delta = 0.01$ Np/m is tiny next to $\beta = 2\pi/\lambda = \pi$ rad/m. That is the low-loss side: an **imperfect dielectric**. (A good conductor would have $\alpha = \beta$ and $\delta = \lambda/2\pi \approx 0.32$ m.)

        **Step 2: what low loss does to γ.** Write the sheet's $\gamma$ with the loss tangent pulled out:
        $$\gamma = j\omega\sqrt{\mu\epsilon}\,\sqrt{1 - j\frac{\sigma}{\omega\epsilon}}$$
        For a small $x$, $\sqrt{1 - jx} \approx 1 - j\frac x2$ (the first term of the binomial series). Multiply out:
        $$\gamma \approx j\omega\sqrt{\mu\epsilon} + \frac{\sigma}{2}\sqrt{\frac\mu\epsilon}$$
        So, to first order,
        $$\beta \approx \omega\sqrt{\mu\epsilon},\qquad \alpha \approx \frac{\sigma}{2}\sqrt{\frac\mu\epsilon} = \frac{\sigma\eta}{2}$$
        The phase is the lossless one; the loss only adds a small decay.

        **(ii) Step 3: the speed.**
        $$v = \lambda f = (2)(10^8) = \boxed{2\times10^8\ \text{m/s}}$$
        **(iii) Step 4: $\epsilon_r$.** $v = c/\sqrt{\epsilon_r}$ with $\mu = \mu_0$:
        $$\sqrt{\epsilon_r} = \frac cv = \frac32\quad\Rightarrow\quad \boxed{\epsilon_r = \tfrac94 = 2.25}$$
        **(iv) Step 5: η.**
        $$|\eta| \approx \sqrt{\frac{\mu_0}{\epsilon_r\epsilon_0}} = \frac{\eta_0}{3/2} = \frac23(120\pi) = \boxed{80\pi \approx 251\ \Omega}$$
        **(v) Step 6: σ.** From $\alpha = \sigma\eta/2$:
        $$\sigma = \frac{2\alpha}{\eta} = \frac{2(0.01)}{80\pi} = \frac{1}{4000\pi}$$
        $$\boxed{\sigma = \frac{10^{-3}}{4\pi} \approx 7.96\times10^{-5}\ \text{S/m}}$$
        The key gets the same value through $\alpha = \beta\,\sigma/(2\omega\epsilon)$, which is the same relation, since $\beta/\omega\epsilon = \eta$.

        !!intuition Does this make sense?
          Check the assumption: $\sigma/\omega\epsilon = 7.96\times10^{-5}/(2\pi\times10^8\cdot2.25\epsilon_0) \approx 0.0064 \ll 1$ ✓. The exact $\gamma$ with this $\sigma$ gives $\delta = 100.0$ m and $\lambda = 2.000$ m, so nothing was lost by the approximations.

        **Speed path.** $v = \lambda f$; $\epsilon_r = (c/v)^2$; $\eta = 120\pi/\sqrt{\epsilon_r}$; $\sigma = 2/(\delta\eta)$.

        **Where points go.** $\epsilon_r = 1.5$ (forgetting to square); $\sigma = 1/(\delta\eta)$ without the 2; using $\eta_0$ in place of the medium's $\eta$.
      ` }),

    RF(md`
      ### Problem 3 (25 points): working backward from the transmitted wave

      A plane TEM wave travels in the $+z$ direction in a homogeneous perfect dielectric with $\epsilon = \tfrac94\epsilon_0$ and $\mu = \mu_0$, and is incident on the plane $z = 0$, the boundary between the dielectric ($z < 0$) and vacuum ($z > 0$). The transmitted field found in the vacuum is
      $$\mathbf E_t(z, t) = 6\cos(\omega t - \beta z)\,\hat x\ \ \text{V/m},\quad z > 0$$
      with $f = \omega/2\pi = 1$ MHz. Give every answer as a simplified number (keeping factors of $\pi$).

      [[fig:if]]
    `, { if: { svg: ifaceFig(), cap: 'The dielectric fills z < 0; vacuum fills z > 0. Only the transmitted field is given.' } }),
    P({ src: 'Summer 2017 #3a–c · 9 pts', title: 'η, β and Γ on both sides',
      q: md`(a) (3 pts) The intrinsic impedance $\eta$ for both regions $z < 0$ and $z > 0$.

(b) (3 pts) The wavenumber $\beta$ for both regions.

(c) (3 pts) The reflection coefficient $\Gamma$ for the wave traveling in the $+z$ direction.`,
      parts: [
        NT(md`(a) $\eta$ for $z < 0$`, 80 * PI, 'Ω', [{ v: 120 * PI * 4 / 9, msg: 'That divides by ε_r. η goes as 1/√ε_r.' }]),
        N(md`(a) $\eta$ for $z > 0$`, 120 * PI, 'Ω'),
        NT(md`(b) $\beta$ for $z < 0$`, PI / 100, 'rad/m', [{ v: PI / 150, msg: 'That is the vacuum value. The dielectric is slower, so β is larger by √ε_r = 1.5.' }]),
        NT(md`(b) $\beta$ for $z > 0$`, PI / 150, 'rad/m', [{ v: 2 * PI * 1e6, msg: 'That is ω. β = ω/c.' }]),
        NT(md`(c) $\Gamma$`, 0.2, '', [{ v: -0.2, msg: 'That swaps η₁ and η₂. Γ = (η₂ − η₁)/(η₂ + η₁) with η₂ the medium the wave enters.' }, { v: 1.2, msg: 'That is τ = 1 + Γ, the transmission coefficient.' }]),
      ],
      hints: [md`$\eta = \eta_0/\sqrt{\epsilon_r}$ and $\beta = \omega\sqrt{\epsilon_r}/c$.`, md`$\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$, region 1 being where the incident wave comes from.`],
      sol: md`
        **(a) Step 1: η.** With $\mu = \mu_0$, $\eta = \sqrt{\mu_0/\epsilon_r\epsilon_0} = \eta_0/\sqrt{\epsilon_r}$. In the dielectric $\sqrt{9/4} = 3/2$:
        $$\eta_1 = \frac{120\pi}{3/2} = \boxed{80\pi\ \Omega}\ \ (z < 0),\qquad \eta_2 = \boxed{120\pi\ \Omega}\ \ (z > 0)$$
        **(b) Step 2: β.** $\beta = \omega\sqrt{\mu\epsilon} = \sqrt{\epsilon_r}\,\omega/c$, and $\omega/c = 2\pi\times10^6/(3\times10^8) = \pi/150$ rad/m:
        $$\beta_1 = \frac32\cdot\frac{\pi}{150} = \boxed{\frac{\pi}{100}\ \text{rad/m}},\qquad \beta_2 = \boxed{\frac{\pi}{150}\ \text{rad/m}}$$
        The key's second line is labeled "$z < 0$"; it is the vacuum, $z > 0$.

        **(c) Step 3: Γ from the boundary conditions.** Let the incident wave have amplitude $E_i$, the reflected $E_r$, the transmitted $E_t$ (all along $\hat x$ at $z = 0$). Tangential $\mathbf E$ is continuous:
        $$E_i + E_r = E_t \qquad (1)$$
        Tangential $\mathbf H$ is continuous (no surface current). The reflected wave travels backward, so its $H$ has the opposite sign:
        $$\frac{E_i}{\eta_1} - \frac{E_r}{\eta_1} = \frac{E_t}{\eta_2} \qquad (2)$$
        Put (1) into (2) and divide by $E_i$, with $\Gamma = E_r/E_i$:
        $$\eta_2(1 - \Gamma) = \eta_1(1 + \Gamma)$$
        Collect the $\Gamma$ terms:
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$$
        Now the numbers, in units of $\eta_0$ ($\eta_1 = \tfrac23$, $\eta_2 = 1$):
        $$\Gamma = \frac{1 - 2/3}{1 + 2/3} = \frac{1/3}{5/3} = \boxed{\tfrac15 = 0.2}$$
        and the transmission coefficient (this $\tau$ is $E_t/E_i$, not the angle of $\eta$, which is 0 in these lossless media) is $\tau = 1 + \Gamma = 1.2$.

        !!intuition Does this make sense?
          The wave goes from a lower impedance to a higher one, like a line into a bigger load: $\Gamma > 0$, and the transmitted field is **larger** than the incident one ($\tau = 1.2 > 1$). That is allowed: power is what must balance, not field (checked in part g).

        **Speed path.** $\eta_1 = \tfrac23\eta_0$, so $\Gamma = (3 - 2)/(3 + 2)$; $\beta = \sqrt{\epsilon_r}\,\pi/150$.

        **Where points go.** Swapping $\eta_1$ and $\eta_2$ (sign of $\Gamma$); dividing by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$; giving $\tau$ for $\Gamma$.
      ` }),
    P({ src: 'Summer 2017 #3d · 6 pts', title: 'The incident and reflected amplitudes',
      q: md`(d) (6 pts) Find the electric field amplitudes of the incident and the reflected waves in the dielectric.`,
      parts: [
        NT(md`$E_i$`, 5, 'V/m', [{ v: 7.2, msg: 'That multiplies E_t by τ. Here E_t is known: E_i = E_t/τ.' }, { v: 7.5, msg: 'That divides by 1 − Γ. Transmission is E_t = (1 + Γ)E_i.' }]),
        NT(md`$E_r$`, 1, 'V/m', [{ v: 1.2, msg: 'That is ΓE_t. The reflected wave is ΓE_i.' }]),
      ],
      hints: [md`$E_t = \tau E_i = (1 + \Gamma)E_i$, so $E_i = E_t/1.2$.`],
      sol: md`
        **Step 1: work backward.** The transmitted amplitude is known, $E_t = 6$ V/m, and $E_t = \tau E_i$ with $\tau = 1 + \Gamma = 1.2$:
        $$E_i = \frac{E_t}{1.2} = \frac{6}{1.2} = \boxed{5\ \text{V/m}}$$
        **Step 2: the reflection.**
        $$E_r = \Gamma E_i = \frac15(5) = \boxed{1\ \text{V/m}}$$
        **Check** with the boundary condition on tangential $\mathbf E$: $E_i + E_r = 5 + 1 = 6 = E_t$ ✓.

        **Speed path.** $6/1.2 = 5$, then a fifth of it.

        **Where points go.** $E_i = \tau E_t$ (going the wrong way through the boundary); $E_r = \Gamma E_t$.
      ` }),
    P({ src: 'Summer 2017 #3e–g · 10 pts', title: 'The phasors, and the transmitted power',
      q: md`(e) (4 pts) The phasor $\tilde{\mathbf E}_r(z)$ of the reflected wave in $z < 0$.

(f) (3 pts) The phasor $\tilde{\mathbf H}_t(z)$ of the transmitted wave in $z > 0$.

(g) (3 pts) The time-averaged Poynting vector $\langle\mathbf E_t\times\mathbf H_t\rangle$ of the transmitted wave.`,
      parts: [
        mc(md`(e) $\tilde{\mathbf E}_r(z)$, in V/m`, [md`$\hat x\,e^{+j\pi z/100}$`, md`$\hat x\,e^{-j\pi z/100}$`, md`$\hat x\,e^{+j\pi z/150}$`, md`$\hat x\,5\,e^{+j\pi z/100}$`], 0,
          [null, md`$e^{-j\beta z}$ is a wave toward $+z$. The reflected wave goes back toward $-z$: $e^{+j\beta_1z}$.`, md`$\pi/150$ is the vacuum's $\beta$. The reflected wave lives in the dielectric: $\beta_1 = \pi/100$.`, md`5 V/m is the incident amplitude. The reflected one is $\Gamma E_i = 1$ V/m.`]),
        mc(md`(f) $\tilde{\mathbf H}_t(z)$, in A/m`, [md`$\hat y\,\tfrac{1}{20\pi}\,e^{-j\pi z/150}$`, md`$-\hat y\,\tfrac{1}{20\pi}\,e^{-j\pi z/150}$`, md`$\hat y\,\tfrac{3}{40\pi}\,e^{-j\pi z/150}$`, md`$\hat y\,\tfrac{1}{20\pi}\,e^{-j\pi z/100}$`], 0,
          [null, md`$\hat x\times(-\hat y) = -\hat z$: that $\mathbf H$ sends power back toward the boundary.`, md`That divides 6 V/m by the dielectric's $80\pi$. The transmitted wave is in vacuum: $6/120\pi$.`, md`$\pi/100$ is the dielectric's $\beta$; in vacuum it is $\pi/150$.`]),
        NT(md`(g) $|\langle\mathbf E_t\times\mathbf H_t\rangle|$`, 3 / (20 * PI), 'W/m^2', [{ v: 36 / (2 * 80 * PI), msg: 'That used η₁ = 80π. The transmitted wave is in vacuum.' }, { v: 36 / (120 * PI), msg: 'That forgot the ½ of the time average.' }]),
      ],
      hints: [md`The reflected wave travels toward $-z$ in the dielectric: $\hat x E_r e^{+j\beta_1 z}$, with zero phase at $z = 0$ because $\Gamma$ is real and positive.`, md`$\tilde{\mathbf H}_t = \frac{1}{\eta_0}\hat z\times\tilde{\mathbf E}_t$, and $\langle S\rangle = E_t^2/(2\eta_0)$.`],
      sol: md`
        **(e) Step 1: the reflected phasor.** At $z = 0$ the transmitted field $6\cos\omega t$ has phase 0. Since $\Gamma$ and $\tau$ are real and positive, the incident and reflected waves also have phase 0 at $z = 0$. The reflected wave travels toward $-z$ in the dielectric, so it carries $e^{+j\beta_1z}$:
        $$\boxed{\tilde{\mathbf E}_r(z) = \hat x\,e^{+j\pi z/100}\ \text{V/m}}$$
        **(f) Step 2: the transmitted H.** $\tilde{\mathbf E}_t = \hat x\,6e^{-j\pi z/150}$, traveling toward $+\hat z$ in vacuum. $\tilde{\mathbf H}_t = \frac{1}{\eta_0}\hat z\times\tilde{\mathbf E}_t$, and $\hat z\times\hat x = \hat y$:
        $$\tilde{\mathbf H}_t = \hat y\,\frac{6}{120\pi}\,e^{-j\pi z/150}$$
        $$\boxed{\tilde{\mathbf H}_t(z) = \hat y\,\frac{1}{20\pi}\,e^{-j\pi z/150}\ \text{A/m}}$$
        **(g) Step 3: the transmitted power.**
        $$\langle\mathbf E_t\times\mathbf H_t\rangle = \hat z\,\frac{E_t^2}{2\eta_0} = \hat z\,\frac{36}{240\pi}$$
        $$\boxed{\langle\mathbf E_t\times\mathbf H_t\rangle = \hat z\,\frac{3}{20\pi} \approx \hat z\,0.0477\ \text{W/m}^2}$$
        !!intuition Does the power balance?
          Incident: $\dfrac{5^2}{2(80\pi)} = \dfrac{25}{160\pi}$. Reflected: $\dfrac{1^2}{160\pi}$. In minus out: $\dfrac{24}{160\pi} = \dfrac{3}{20\pi}$, exactly the transmitted power ✓. The transmitted **field** is bigger than the incident one (6 against 5), but the vacuum's larger $\eta$ makes it carry less power per V/m.

        **Speed path.** Reflected: amplitude $\Gamma E_i$, $e^{+j\beta_1z}$. Transmitted $H$: $E_t/\eta_0$ along $\hat z\times\hat x = \hat y$. Power: $E_t^2/2\eta_0$.

        **Where points go.** $e^{-j\beta z}$ for the reflected wave; the wrong region's $\beta$ or $\eta$; forgetting the $\tfrac12$. The key's answers are right.
      ` }),
  ];
  EM.lesson('e3-past', { id: 'e3-past-su17', order: 9, title: 'Summer 2017 Exam 3', kind: 'exam', sub: 'Kudeki · 3 problems, 75 pts · a sine-driven sheet, LCP constants, a medium from λ and δ, an interface worked backward', steps: su17 });
})();

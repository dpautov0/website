/* Past Exam 3s, part B: two papers typed clean and solved slowly.
   e3-past-sp19   Spring 2019 Exam 3 (Chen, Goddard, Zhao; official key, re-derived; one slip in the key's working of 1(d))
   e3-past-sp18   Spring 2018 Exam 3 (He, Goddard, Ilie; no key: every answer derived here)
   Every number was recomputed in Python (work-pastB/verify.py) and every bounce value checked against TL.valueAt
   (work-pastB/tlcheck.js). Figures are drawn here; the bounce diagrams and traces come from the site's TL solver. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;
  const CH = (lbl, mc, a, why, fixed) => Object.assign({ lbl, mc, a, why }, fixed ? { fixed: true } : {});
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  // a numeric part with known slips: traps = [[value, message], ...]
  const NT = (lbl, ans, unit, traps) => Object.assign(N(lbl, ans, unit), { traps: traps.map(([v, msg]) => ({ v, msg })) });

  // ---------------------------------------------------------------- figure helpers
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 30) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // a voltage source: a circle with + over -
  function source(g, x, y, r = 12) {
    g.circle(x, y, r, { cls: 'bgfill' });
    g.add(`<path class="glyph" d="M${x - 3.5},${y - 5}H${x + 3.5}M${x},${y - 8.5}V${y - 1.5}M${x - 3.5},${y + 5}H${x + 3.5}"/>`);
  }
  // generator, series resistor, line sections (two bars each), load resistor; a z axis below.
  // o: { alt, src, rg, secs: [{ w, top, bot, fill }], load, loadIn, zt: [labels at 0 and every section end], gam: [labels at the junctions], vin, vl }
  function lineCkt(o) {
    const g = PF.fig({ alt: o.alt });
    const yT = 46, yB = 120, cy = (yT + yB) / 2, xs = 34, x0 = 140;
    source(g, xs, cy);
    g.label(xs - 18, cy, o.src, 'r', 'small');
    g.pl([[xs, cy - 12], [xs, yT], [56, yT]]);
    zig(g, 56, yT, 116, yT);
    g.line(116, yT, x0, yT);
    g.label(86, yT - 10, o.rg, 'b', 'small');
    g.pl([[xs, cy + 12], [xs, yB], [x0, yB]]);
    let x = x0;
    const ends = [x0];
    o.secs.forEach((s) => {
      for (const y of [yT, yB]) { g.rect(x, y - 4, s.w, 8, { cls: s.fill || 'shade' }); g.rect(x, y - 4, s.w, 8); }
      g.label(x + s.w / 2, cy - 11, s.top, 'c', 'small');
      if (s.bot) g.label(x + s.w / 2, cy + 13, s.bot, 'c', 'small');
      x += s.w; ends.push(x);
    });
    const xl = x + 40;
    g.pl([[x, yT], [xl, yT], [xl, cy - 20]]); zig(g, xl, cy - 20, xl, cy + 20); g.pl([[xl, cy + 20], [xl, yB], [x, yB]]);
    if (o.load) g.label(xl + 12, cy, o.load, 'l', 'small');
    if (o.loadIn) g.label(xl - 9, cy, o.loadIn, 'r', 'small');
    if (o.vl) { g.label(xl + 14, yT + 14, '+', 'l', 'small'); g.label(xl + 12, cy, o.vl, 'l', 'small'); g.label(xl + 14, yB - 14, '-', 'l', 'small'); }
    if (o.vin) { g.label(x0 - 10, yT + 14, '+', 'c', 'small'); g.label(x0 - 10, cy, o.vin, 'c', 'small'); g.label(x0 - 10, yB - 14, '-', 'c', 'small'); }
    ends.slice(1, -1).forEach((xx, k) => {
      g.line(xx, yT + 6, xx, yB + 30, { cls: 'dim dash' });
      if (o.gam) g.label(xx, yT - 8, o.gam[k], 'b', 'small');
    });
    const ya = yB + 30;
    g.arrow(x0 - 16, ya, xl + 14, ya, { cls: 'dim', hs: 6 }); g.label(xl + 18, ya, 'z', 'l', 'small');
    ends.forEach((xx, k) => { g.line(xx, ya - 3, xx, ya + 3, { cls: 'dim' }); g.label(xx, ya + 6, o.zt[k], 't', 'small'); });
    return g.svg();
  }
  // the tip of E in the plane across the travel, h to the right and v up. E(0) is along +h, E(T/4) along +v.
  // o.out: true if the travel is out of the page (toward you), false if into it.
  function rotFig(o) {
    const g = PF.fig({ alt: o.alt });
    const cx = 120, cy = 112, r = 56, D = PI / 180;
    g.arrow(cx - r - 26, cy, cx + r + 30, cy, { cls: 'dim', hs: 6 }); g.label(cx + r + 34, cy, o.h, 'l', 'small accent');
    g.arrow(cx, cy + r + 26, cx, cy - r - 30, { cls: 'dim', hs: 6 }); g.label(cx + 5, cy - r - 30, o.v, 'bl', 'small accent');
    g.circle(cx, cy, r, { cls: 'dash dim' });
    g.arrow(cx, cy, cx + r, cy, { cls: 'thick', hs: 9 }); g.label(cx + r + 6, cy + 6, 't = 0', 'tl', 'small');
    g.arrow(cx, cy, cx, cy - r, { cls: 'thick', hs: 9 }); g.label(cx - 8, cy - r - 6, 't = T/4', 'br', 'small');
    const rr = r + 14;
    g.arc(cx, cy, rr, 18, 72, { cls: 'curve' });
    g.head(cx + rr * Math.cos(72 * D), cy - rr * Math.sin(72 * D), -Math.sin(72 * D), -Math.cos(72 * D), { hs: 9 });
    const tx = cx - 70, ty = cy + r + 48;
    if (o.out) g.odot(tx, ty, 7); else g.otimes(tx, ty, 7);
    g.label(tx + 13, ty, o.travel, 'l', 'small');
    return g.svg();
  }
  // standing-wave shape on a line with V = 0 at the input (z = 0) and I = 0 at the load (z = l): mode m has beta*l = (2m - 1)pi/2
  const modeFig = (m) => {
    const bl = (2 * m - 1) * PI / 2, s0 = Math.sin(bl);
    return PF.plot({ w: 250, h: 150, x: [0, 1.12], y: [-1.3, 1.45], zero: true, xl: 'z', xt: [[0, '0'], [1, 'l']],
      curves: [
        { f: (z) => Math.cos(bl * (1 - z)), to: 1, n: 300, lab: '\\tilde V', labAt: 1, dx: 6, dy: -4 },
        { f: (z) => Math.sin(bl * (1 - z)), to: 1, n: 300, cls: 'dash', lab: '\\tilde I', labAt: 0.02, dx: 6, dy: s0 > 0 ? -10 : 14 },
      ] });
  };

  // ======================================================================================== SPRING 2019
  // the two-line bounce of Problem 4: lengths in m, speeds in m/ns, times in ns
  const s19 = TL.solve({ Vg: 150, Rg: 100, RL: 100, sections: [{ Z0: 50, len: 20, v: 0.1 }, { Z0: 100, len: 20, v: 0.2 }], tMax: 1000 });
  const ns = { tUnit: '\\text{ns}' };

  function ppFig() {
    const g = PF.fig({ alt: 'cross-section of the parallel-plate line, not to scale: two horizontal plates of width w = 0.5 m, the bottom one at x = 0 and the top one at x = h = 0.01 m, with a dielectric of relative permittivity 4 between them. x points up, y to the right, z out of the page. E_x points up and H_y points to the right between the plates.' });
    const xL = 150, xR = 390, yT = 50, yB = 124;
    g.rect(xL, yT, xR - xL, yB - yT, { cls: 'plane' });
    g.line(xL, yT, xR, yT, { cls: 'thick' }); g.line(xL, yB, xR, yB, { cls: 'thick' });
    g.arrow(200, yB - 8, 200, yT + 12, { cls: 'thick', hs: 8 }); g.label(194, yT + 20, 'E_x', 'r', 'small');
    g.arrow(212, yB - 14, 264, yB - 14, { cls: 'thick', hs: 8 }); g.label(268, yB - 14, 'H_y', 'l', 'small');
    g.label(335, (yT + yB) / 2 - 6, '\\epsilon_r = 4', 'c', 'small');
    g.label(xL - 8, yT, 'x = h = 0.01\\ \\text{m}', 'r', 'small');
    g.label(xL - 8, yB, 'x = 0', 'r', 'small');
    g.label(xL, yB + 8, 'y = 0', 't', 'small');
    g.label(xR, yB + 8, 'y = w = 0.5\\ \\text{m}', 't', 'small');
    const ox = xR + 70, oy = yB - 30;
    g.arrow(ox, oy, ox, oy - 44, { cls: 'dim', hs: 6 }); g.label(ox + 5, oy - 46, 'x', 'bl', 'small accent');
    g.arrow(ox, oy, ox + 44, oy, { cls: 'dim', hs: 6 }); g.label(ox + 48, oy, 'y', 'l', 'small accent');
    g.odot(ox, oy, 6); g.label(ox - 9, oy + 6, 'z', 'tr', 'small accent');
    return g.svg();
  }
  function pecFig() {
    const g = PF.fig({ alt: 'the plane x = 0 seen edge-on: a perfect electrical conductor, hatched, fills x < 0 on the left; free space fills x > 0 on the right; the incident wave travels toward minus x, into the conductor' });
    const x0 = 130;
    g.wall(x0, 30, 140, { side: 'left', lab: '\\text{PEC}' });
    g.text(250, 36, 'free space', 'c', 'small');
    g.arrow(340, 84, 160, 84, { cls: 'thick', hs: 9 }); g.label(250, 76, '\\mathbf E_i\\ \\text{toward}\\ -\\hat x', 'b', 'small');
    g.arrow(x0 - 30, 164, 370, 164, { cls: 'dim', hs: 6 }); g.label(374, 164, 'x', 'l', 'small accent');
    g.line(x0, 160, x0, 168, { cls: 'dim' }); g.label(x0, 172, '0', 't', 'small accent');
    return g.svg();
  }
  const ckt19 = () => lineCkt({
    alt: 'circuit: a step source f(t) = 150 u(t) V with R_g = 100 ohm in series drives line 1 (Z_1 = 50 ohm, v_1 = c/3) from z = 0 to l/2, joined to line 2 (Z_2 = 100 ohm, v_2 = 2c/3) from l/2 to l, which ends in R_L = 100 ohm',
    src: 'f(t)', rg: 'R_g = 100\\ \\Omega', load: 'R_L = 100\\ \\Omega', zt: ['0', 'l/2', 'l'],
    secs: [{ w: 112, top: 'Z_1 = 50\\ \\Omega', bot: 'v_1 = c/3', fill: 'shade' }, { w: 112, top: 'Z_2 = 100\\ \\Omega', bot: 'v_2 = 2c/3', fill: 'plane' }],
  });
  const bd19 = (probe) => TL.diagram(s19, Object.assign({ w: 370, h: 400 }, ns, probe ? { probe } : {}));

  const sp19 = [
    R(md`
      **Spring 2019 · ECE 329 · Exam 3** (Chen, Goddard, Zhao). Wednesday, April 17, 2019, 8:30–9:45 PM: 75 minutes. Five problems, 100 points (25, 20, 15, 25, 15). Closed book, no calculators. That term allowed three double-sided 3×5 cards; you get one 4″×6″ card and the official formula sheet. The paper asked for answers as fractions, not decimals, and gave $c = 3\times10^8$ m/s, $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$ F/m, $\mu_0 = 4\pi\times10^{-7}$ H/m and $\eta_0 = 120\pi\ \Omega$.

      **Why this paper.** Prof. Chen, who writes your exam, co-wrote it. It is a compact tour of Exam 3: a lossy wave read off its phasor, a parallel-plate line built from its fields, circular polarization hitting a perfect conductor, a two-line bounce diagram, and the resonances of a line.

      **What it tests.** Problem 1: $\gamma$, $\eta$ and the loss tangent from a given phasor ([Topic 5](#/l/w2-gamma), [Topic 6](#/l/w2-read), [Topic 7](#/l/w2-limits)). Problem 2: $Z_0$, the field of a current pulse, and power on a parallel-plate line ([Topic 13](#/l/w5-telegraph), [Topic 4](#/l/w1-avg)). Problem 3: handedness and reflection at a PEC ([Topic 9](#/l/w3-pol), [Topic 11](#/l/w4-gamma), [Topic 12](#/l/w4-standing)). Problem 4: junctions and a bounce diagram ([Topic 14](#/l/w5-launch), [Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi)). Problem 5: the resonances of a line ([Topic 17](#/l/w6-vd), [Topic 18](#/l/w6-stubs)). All of it is in scope for the Fall 2026 Exam 3.

      **The key.** This is the official key, re-derived line by line. Every final answer on it is right. Its working for 1(d) has one slip, pointed out there.

      **Three different τ's appear.** In Problem 1, $\tau$ is the **angle of $\eta$**. In Problem 4, $\tau_g$ is the **injection coefficient** (the share of the source voltage that launches the first wave), and $\tau_{12} = 1 + \Gamma_{12}$ is the **transmission coefficient** at a junction.

      **How to use it.** Set a 75-minute timer and work on paper, with only your card and the formula sheet. Then enter your answers. Number boxes take arithmetic, so type the exact form: <code>8*pi^2</code>, <code>sqrt(3)</code>, <code>650/9</code>. Symbolic boxes list the variables you may use. Open each solution after you check, even when you are right: each ends with a **speed path** (how to do it in under a minute) and **where points go**.
    `),

    // ------------------------------------------------------------ Problem 1
    R(md`
      ### Problem 1 (25 points): reading a lossy wave

      In a general medium, the plane-wave parameters $\gamma$ and $\eta$ satisfy
      $$\gamma = \sqrt{j\omega\mu(\sigma + j\omega\epsilon)}$$
      $$\eta = \sqrt{\frac{j\omega\mu}{\sigma + j\omega\epsilon}}$$
      Thus $\gamma\eta = j\omega\mu$ and $\gamma/\eta = \sigma + j\omega\epsilon$.

      A plane TEM wave with $\omega = 2\pi\times10^7$ rad/s travels in a material with $\mu = 2\mu_0$. Its electric field phasor is
      $$\tilde{\mathbf E} = 20\,e^{-(1 + j\sqrt3)y}\,\hat z\ \ \text{V/m}$$
      Determine the following properties of the wave.
    `),
    P({ src: 'Spring 2019 #1(a) · 2 pts', title: 'The propagation constant',
      q: md`Write the propagation constant $\gamma$ as $\alpha + j\beta$.`,
      parts: [
        NT('\\alpha', 1, 'Np/m', [[Math.sqrt(3), 'That is β. α is the real part of the exponent, the decay.'], [2, 'That is |γ|. α is only the real part.']]),
        NT('\\beta', Math.sqrt(3), 'rad/m', [[1, 'That is α. β is the imaginary part, the phase.'], [2, 'That is |γ|. β is only the imaginary part.']]),
      ],
      hints: [md`A wave traveling toward $+y$ is $E_0e^{-\gamma y}$. Match the exponent.`],
      sol: md`
        **What γ is.** A wave traveling toward $+y$ in any medium has the form $\tilde E = E_0e^{-\gamma y}$, with $\gamma = \alpha + j\beta$ ([Topic 5](#/l/w2-gamma)). Split the exponential into two factors:
        $$e^{-\gamma y} = e^{-\alpha y}\,e^{-j\beta y}$$
        The first factor shrinks the wave as it goes. The second turns its phase.

        **Match the exponents.** The given exponent is $-(1 + j\sqrt3)y$. Set it equal to $-\gamma y$:
        $$\gamma = 1 + j\sqrt3\ \ \text{m}^{-1}$$
        The real part is the decay and the imaginary part is the phase:
        $$\boxed{\alpha = 1\ \text{Np/m}, \quad \beta = \sqrt3\ \text{rad/m}}$$

        !!intuition Does this make sense?
          Both are positive, as they must be for a wave going toward $+y$ in a material that can only absorb energy. And $\beta > \alpha$, which holds in every medium: Topic 5 showed $\beta^2 - \alpha^2 = \omega^2\mu\epsilon > 0$.

        **Speed path.** Read the exponent: the real part is $\alpha$, the imaginary part is $\beta$. Five seconds.

        **Where points go.** Writing $\alpha = 2$ (that is $|\gamma|$), or swapping $\alpha$ and $\beta$. Units: nepers per meter and radians per meter.
      ` }),
    P({ src: 'Spring 2019 #1(b) · 7 pts', title: 'The intrinsic impedance',
      q: md`Write the impedance $\eta$ as $|\eta|e^{j\tau}$. Hint (from the paper): $1 + j\sqrt3 = 2e^{j60°}$.`,
      parts: [
        NT('|\\eta|', 8 * PI * PI, 'Ω', [[4 * PI * PI, 'That uses μ0. The material has μ = 2μ0.'], [16 * PI * PI, 'That is ωμ. Divide by |γ| = 2.'], [32 * PI * PI, 'That multiplies by |γ|. η = jωμ/γ divides.']]),
        NT('\\tau', 30, '°', [[60, 'That is the angle of γ. The angle of η is 90° minus it.'], [150, 'That adds the angles. Dividing by γ subtracts its angle.'], [90, 'That is the angle of jωμ alone. Subtract the 60° of γ.']]),
      ],
      hints: [md`From $\gamma\eta = j\omega\mu$: $\eta = j\omega\mu/\gamma$.`, md`First compute $\omega\mu = (2\pi\times10^7)(8\pi\times10^{-7})$. Then divide the sizes and subtract the angles.`],
      sol: md`
        **The relation to use.** The paper gives $\gamma\eta = j\omega\mu$. Divide both sides by $\gamma$:
        $$\eta = \frac{j\omega\mu}{\gamma}$$
        **Step 1: ωμ.** Here $\mu = 2\mu_0 = 8\pi\times10^{-7}$ H/m. Multiply:
        $$\omega\mu = (2\pi\times10^7)(8\pi\times10^{-7})$$
        The powers of ten cancel ($10^7\cdot10^{-7} = 1$), and $2\pi\cdot8\pi = 16\pi^2$:
        $$\omega\mu = 16\pi^2\ \ \Omega/\text{m}$$
        **Step 2: polar form.** Write $j = e^{j90°}$, and use the hint $\gamma = 2e^{j60°}$:
        $$\eta = \frac{16\pi^2\,e^{j90°}}{2\,e^{j60°}}$$
        **Step 3: divide.** Divide the sizes and subtract the angles:
        $$\eta = 8\pi^2\,e^{j(90° - 60°)} = 8\pi^2\,e^{j30°}\ \Omega$$
        $$\boxed{|\eta| = 8\pi^2 \approx 79\ \Omega, \quad \tau = 30°}$$
        **Check.** The angles of $\gamma$ and $\eta$ must add to $90°$, because their product is $j\omega\mu$: $60° + 30° = 90°$ ✓. And $\tau$ lies between $0°$ and $45°$, as it must for any material with $\sigma > 0$ ✓.

        !!intuition Does this make sense?
          $79\ \Omega$ is far below $\eta_0 = 377\ \Omega$. A large $\epsilon$ (part (d) finds $\epsilon_r \approx 23$) and conduction both lower $|\eta|$: more current flows for the same $\mathbf E$, so there is more $\mathbf H$ per volt per meter.

        **Speed path.** $|\eta| = \omega\mu/|\gamma|$ and $\tau = 90° - \angle\gamma$. With $\omega\mu = 16\pi^2$ and $\gamma = 2e^{j60°}$, that is two lines.

        **Where points go.** Using $\mu_0$ for $\mu$ (gives $4\pi^2$); forgetting to divide by $|\gamma| = 2$; giving $\tau = 60°$, the angle of $\gamma$. Leave $8\pi^2$ as it is: the paper asked for exact forms.
      ` }),
    P({ src: 'Spring 2019 #1(c) · 8 pts', title: 'The magnetic field phasor',
      q: md`Find the magnetic field phasor $\tilde{\mathbf H}(y)$, with its direction and units.`,
      parts: [
        NT('|\\tilde{\\mathbf H}|\\ \\text{at}\\ y = 0', 5 / (2 * PI * PI), 'A/m', [[5 / (PI * PI), 'That divides by 4π², the |η| you get with μ0. Here μ = 2μ0 and |η| = 8π².'], [20 / (120 * PI), 'That divides by η0. Use this material\'s η.']]),
        CH('Direction of $\\tilde{\\mathbf H}$', ['$+\\hat x$', '$-\\hat x$', '$+\\hat z$', '$+\\hat y$'], 0,
          [null, md`Then $\mathbf E\times\mathbf H = \hat z\times(-\hat x) = -\hat y$: a wave traveling toward $-y$. This one travels toward $+y$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$, and $\mathbf E$ is along $\hat z$.`, md`A plane wave has no field along its direction of travel, and this one travels along $y$.`]),
        NT('\\text{phase of}\\ \\tilde H\\ \\text{at}\\ y = 0', -30, '°', [[30, 'That adds τ. Dividing by η = |η|e^{j30°} subtracts 30°: H lags E.'], [-60, 'That subtracts the angle of γ. Divide by η, whose angle is 30°.']]),
      ],
      hints: [md`$\tilde H = \tilde E/\eta$ in size and phase; $\mathbf E\times\mathbf H$ points along the travel.`, md`Which unit vector gives $\hat z\times\hat ? = +\hat y$?`],
      sol: md`
        **Two facts about one traveling wave.** (1) Size and phase: $\tilde H = \tilde E/\eta$; that is the definition of $\eta$. (2) Direction: $\mathbf E\times\mathbf H$ points along the direction of travel.

        **Step 1: the direction.** The wave travels toward $+y$ (its exponent is $-\gamma y$), and $\mathbf E$ is along $\hat z$. Which unit vector makes $\hat z\times\hat{?} = +\hat y$? Run the cycle $\hat x\to\hat y\to\hat z\to\hat x$: it gives $\hat z\times\hat x = \hat y$. So $\tilde{\mathbf H}$ points along $+\hat x$.

        **Step 2: size and phase.** Divide the phasor by $\eta = 8\pi^2e^{j30°}$:
        $$\tilde H_x = \frac{20}{8\pi^2\,e^{j30°}}\,e^{-(1 + j\sqrt3)y}$$
        $20/8 = 5/2$, and dividing by $e^{j30°}$ is multiplying by $e^{-j30°}$:
        $$\boxed{\tilde{\mathbf H} = \frac{5}{2\pi^2}\,e^{-(1 + j\sqrt3)y}\,e^{-j30°}\,\hat x}$$
        in A/m. The size at $y = 0$ is $5/(2\pi^2) \approx 0.253$ A/m.

        **Check in the time domain.** Multiply by $e^{j\omega t}$ and take the real part:
        $$E_z = 20e^{-y}\cos(\omega t - \sqrt3y)$$
        $$H_x = 0.253e^{-y}\cos(\omega t - \sqrt3y - 30°)$$
        Same decay and same $\beta$; $H$ lags $E$ by $\tau = 30°$ ✓. When both are positive, $\hat z\times\hat x = +\hat y$ ✓.

        **Speed path.** $\tilde H = \tilde E/\eta$ in one line: keep the exponent exactly as given, divide 20 by $8\pi^2$, append $e^{-j30°}$. The direction from $\hat z\times\hat x = \hat y$.

        **Where points go.** Dropping the decay $e^{-y}$ from $\mathbf H$; adding the $30°$ instead of subtracting it; dividing by $\eta_0$ instead of the material's $\eta$; leaving out the direction or the units.
      ` }),
    P({ src: 'Spring 2019 #1(d) · 6 pts', title: 'The loss tangent',
      q: md`Find the loss tangent $\sigma/\omega\epsilon$. Hint (from the paper): $\cos30° = \sin60° = \tfrac{\sqrt3}{2}$ and $\cos60° = \sin30° = \tfrac12$.`,
      parts: [NT('\\sigma/\\omega\\epsilon', Math.sqrt(3), '', [[1 / Math.sqrt(3), 'That is the imaginary part over the real part, upside down. σ is the real part of γ/η.']])],
      hints: [md`$\gamma/\eta = \sigma + j\omega\epsilon$: its real part is $\sigma$ and its imaginary part is $\omega\epsilon$.`, md`You only need the angle of $\gamma/\eta$, which is $60° - 30°$.`],
      sol: md`
        **The relation to use.** The paper gives $\gamma/\eta = \sigma + j\omega\epsilon$. Its real part is $\sigma$ (conduction current) and its imaginary part is $\omega\epsilon$ (displacement current). So the loss tangent is the real part over the imaginary part:
        $$\frac{\sigma}{\omega\epsilon} = \frac{\Re\{\gamma/\eta\}}{\Im\{\gamma/\eta\}}$$
        **Step 1: divide in polar form.**
        $$\frac{\gamma}{\eta} = \frac{2e^{j60°}}{8\pi^2e^{j30°}}$$
        Divide the sizes and subtract the angles:
        $$\frac{\gamma}{\eta} = \frac{1}{4\pi^2}\,e^{j30°}$$
        **Step 2: rectangular form.** Use the paper's hint:
        $$\frac{\gamma}{\eta} = \frac{1}{4\pi^2}\left(\frac{\sqrt3}{2} + j\frac12\right)$$
        **Step 3: the ratio.** The factor $1/4\pi^2$ cancels:
        $$\boxed{\frac{\sigma}{\omega\epsilon} = \frac{\sqrt3/2}{1/2} = \sqrt3 \approx 1.73}$$
        **A faster way.** Topic 5 showed $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$, so $\sigma/\omega\epsilon = \tan2\tau$. With $\tau = 30°$: $\tan60° = \sqrt3$. No division needed.

        **What the material is.** The two parts of $\gamma/\eta$ give $\sigma = \sqrt3/(8\pi^2) \approx 0.022$ S/m and $\omega\epsilon = 1/(8\pi^2)$ S/m, so $\epsilon_r = 225/\pi^2 \approx 23$. Check with Topic 5: $\gamma^2 = j\omega\mu\sigma - \omega^2\mu\epsilon = j2\sqrt3 - 2$, and indeed $(1 + j\sqrt3)^2 = 1 - 3 + j2\sqrt3$ ✓.

        **The posted key's slip.** The key writes $\dfrac{\gamma}{\eta} = \dfrac{2e^{j60°}}{4\pi^2e^{j30°}} = \dfrac{1}{2\pi^2}e^{j30°}$. The denominator should be $8\pi^2$, the $|\eta|$ of part (b), so the size is $\tfrac{1}{4\pi^2}$, half of the key's. The slip does not change the answer $\sqrt3$, because the size cancels in the ratio. It would double $\sigma$ and $\epsilon$ if you used it to find them.

        **Speed path.** $\sigma/\omega\epsilon = \tan2\tau = \tan60° = \sqrt3$. Ten seconds once you have $\tau$.

        **Where points go.** Inverting the ratio ($1/\sqrt3$); using $\tan\tau$ instead of $\tan2\tau$; using $|\eta|$ from a wrong part (b), which here cancels anyway.
      ` }),
    P({ src: 'Spring 2019 #1(e) · 2 pts', title: 'What kind of material?',
      q: md`This material would be best classified as which of the following?`,
      parts: [CH('', ['(A) a perfect dielectric', '(B) an imperfect dielectric', '(C) in between an imperfect dielectric and a good conductor', '(D) a good conductor', '(E) a perfect conductor'], 2,
        [md`A perfect dielectric has $\sigma = 0$, so $\alpha = 0$ and $\tau = 0$. This wave decays ($\alpha = 1$ Np/m) and has $\tau = 30°$.`,
          md`That needs $\sigma/\omega\epsilon \ll 1$, with $\alpha \ll \beta$ and $\tau$ near $0°$. Here $\sigma/\omega\epsilon = \sqrt3$.`, null,
          md`That needs $\sigma/\omega\epsilon \gg 1$, with $\alpha \approx \beta$ and $\tau \approx 45°$. Here $\alpha = 1$, $\beta = \sqrt3$ and $\tau = 30°$.`,
          md`$\sigma = \infty$ allows no wave inside at all: $\eta = 0$ and $\alpha = \infty$.`], true)],
      sol: md`
        **The test is the loss tangent** ([Topic 7](#/l/w2-limits)): an imperfect dielectric has $\sigma/\omega\epsilon \ll 1$, a good conductor $\sigma/\omega\epsilon \gg 1$. Here $\sigma/\omega\epsilon = \sqrt3 \approx 1.7$, neither much smaller nor much larger than 1. **(C), in between.** The conduction and displacement currents are about the same size.

        Two more signs agree, and the key lists them:

        | Sign | Imperfect dielectric | Good conductor | This wave |
        |---|---|---|---|
        | $\sigma/\omega\epsilon$ | $\ll 1$ | $\gg 1$ | $\sqrt3$ |
        | $\alpha$ vs $\beta$ | $\alpha \ll \beta$ | $\alpha \approx \beta$ | $1$ vs $\sqrt3$ |
        | $\tau$ | near $0°$ | near $45°$ | $30°$ |

        **Speed path.** Any one row decides it. $\tau = 30°$ is the quickest: well away from both $0°$ and $45°$.

        **Where points go.** Calling it a good conductor because the wave decays fast. Every wave in a lossy medium decays; what classifies the medium is the ratio of the two currents.
      ` }),

    // ------------------------------------------------------------ Problem 2
    RF(md`
      ### Problem 2 (20 points): a parallel-plate line from its fields

      A parallel-plate transmission line has length $l = 15$ m. Its cross-section has width $w = 0.5$ m and height $h = 0.01$ m, and it is filled with a perfect dielectric with $\epsilon_r = 4$ that is non-magnetic ($\mu_r = 1$). So its intrinsic impedance is $\eta = \tfrac12\eta_0 = 60\pi\ \Omega$.

      [[fig:pp]]
    `, { pp: { svg: ppFig(), cap: md`Cross-section, not to scale (the gap is 1/50 of the width). The line runs along $z$, out of the page.` } }),
    P({ src: 'Spring 2019 #2(a) · 5 pts', title: 'Characteristic impedance',
      q: md`Find the characteristic impedance $Z_0$.`,
      parts: [NT('Z_0', 1.2 * PI, 'Ω', [[3000 * PI, 'That is η·w/h, upside down: the gap h goes on top.'], [2.4 * PI, 'That uses η0. The line is filled with ε_r = 4, so η = 60π Ω.'], [60 * PI, 'That is η itself. Z0 depends on the shape of the line too.']])],
      hints: [md`$Z_0 = V/I$ for one traveling wave. Write $V$ and $I$ in terms of the fields.`, md`$V = E_xh$ across the gap, and $I = J_sw = H_yw$ along one plate.`],
      sol: md`
        **What $Z_0$ is.** For one wave traveling along a line, $Z_0$ is the voltage between the conductors divided by the current on one of them: $Z_0 = V/I$ ([Topic 13](#/l/w5-telegraph)).

        **Step 1: voltage from E.** Between the plates the field is uniform and points across the gap. The voltage is the field times the gap:
        $$V = E_xh$$
        **Step 2: current from H.** At a perfect conductor the surface current density equals the tangential $\mathbf H$ just outside it: $J_s = H_y$, in A/m. The plate is $w$ wide, so
        $$I = J_sw = H_yw$$
        **Step 3: divide.**
        $$Z_0 = \frac{V}{I} = \frac{E_xh}{H_yw}$$
        In one traveling wave $E_x/H_y = \eta$:
        $$Z_0 = \eta\,\frac{h}{w}$$
        **Step 4: numbers.**
        $$Z_0 = 60\pi\cdot\frac{0.01}{0.5} = \frac{60\pi}{50}$$
        $$\boxed{Z_0 = 1.2\pi \approx 3.77\ \Omega}$$
        **A second way** (the key shows both). The per-length circuit has $L = \mu h/w$ and $C = \epsilon w/h$. Then
        $$Z_0 = \sqrt{\frac{L}{C}} = \sqrt{\frac{\mu}{\epsilon}}\,\frac{h}{w} = \eta\frac{h}{w}$$
        The same answer.

        !!intuition Does this make sense?
          A very small $Z_0$: the plates are wide (50 cm) and very close (1 cm). Close plates give a large capacitance per meter, and a large $C$ lowers $\sqrt{L/C}$. Units: ohms times a ratio of lengths, ohms ✓.

        **Speed path.** For any parallel-plate line, $Z_0 = \eta\,h/w$ (gap over width). $60\pi/50 = 1.2\pi$.

        **Where points go.** Writing $w/h$ instead of $h/w$; using $\eta_0$ instead of $\eta = \eta_0/\sqrt{\epsilon_r}$.
      ` }),
    P({ src: 'Spring 2019 #2(b) · 8 pts', title: 'The field of a current pulse',
      q: md`A current $I = 2\delta(t - z/v)$ A flows along the bottom plate in the $+z$ direction and returns on the top plate. Find the corresponding electric field $\mathbf E(z, t)$, with its direction. Enter the speed $v$ and the number $K$ in $E_x = K\,\delta(t - z/v)$.`,
      parts: [
        NT('v', 1.5e8, 'm/s', [[3e8, 'That is c. In a dielectric with ε_r = 4 the wave is slower: c/√ε_r.'], [7.5e7, 'That divides c by ε_r. The speed goes as 1/√ε_r.']]),
        NT('K', 240 * PI, 'V/m', [[120 * PI, 'That is half: either one sheet only (J_s/2 between the plates), or I used as if it were J_s, forgetting to divide by w = 0.5 m.'], [480 * PI, 'That uses η0. Between the plates η = 60π Ω.'], [2.4 * PI, 'That is the line voltage V = Z0·I. The field is V divided by the gap h.']]),
        CH('Direction of $\\mathbf E$', ['$+\\hat x$, from the bottom plate to the top plate', '$-\\hat x$, from the top plate to the bottom plate', '$+\\hat y$', '$+\\hat z$, along the current'], 0,
          [null, md`Then $\mathbf E\times\mathbf H = (-\hat x)\times\hat y = -\hat z$: the pulse would travel back toward the source.`, md`$\mathbf E$ runs across the gap, from one plate to the other; $\hat y$ is along the plates, the direction of $\mathbf H$.`, md`A TEM wave has no field along its direction of travel.`]),
      ],
      hints: [md`Each plate is a current sheet. Between the plates their fields add; outside they cancel. So $H = J_s = I/w$ between the plates.`, md`Then $E = \eta H$, with $\mathbf E\times\mathbf H$ along $+\hat z$.`],
      sol: md`
        **Step 1: the speed.** The pulse rides on a TEM wave, so it moves at the speed of light in the dielectric:
        $$v = \frac{c}{\sqrt{\epsilon_r}} = \frac{3\times10^8}{2} = 1.5\times10^8\ \text{m/s}$$
        **Step 2: the surface current.** The current $I$ spreads across the plate's width $w$:
        $$J_s = \frac{I}{w} = \frac{2\delta(t - z/v)}{0.5}$$
        $$J_s = 4\delta(t - z/v)\ \ \text{A/m}$$
        **Step 3: H from the two sheets.** A single current sheet makes $|\mathbf H| = J_s/2$ on each side of it. The bottom sheet carries $+\hat z$ and the top sheet carries the return current, $-\hat z$. Between the plates their fields point the same way and add; outside they cancel:
        $$H_y = 2\cdot\frac{J_s}{2} = J_s$$
        For the direction, use $\mathbf H = \mathbf J_s\times\hat n$, with $\hat n$ the normal pointing from the bottom plate into the gap, $+\hat x$:
        $$\hat z\times\hat x = +\hat y$$
        So between the plates $\mathbf H = 4\delta(t - z/v)\,\hat y$ A/m.

        **Step 4: E from H.** This is one wave traveling toward $+z$, so $|\mathbf E| = \eta|\mathbf H|$, and $\mathbf E\times\mathbf H$ must point along $+\hat z$. Since $\hat x\times\hat y = \hat z$, $\mathbf E$ is along $+\hat x$:
        $$E_x = 60\pi\cdot4\,\delta(t - z/v)$$
        $$\boxed{\mathbf E = 240\pi\,\delta(t - z/v)\,\hat x\ \ \text{V/m}}$$
        with $v = 1.5\times10^8$ m/s.

        **Check with circuits** (the key's second line). The line voltage is $V = Z_0I = 1.2\pi\cdot2\delta = 2.4\pi\,\delta(t - z/v)$ V. The field across the gap is $V/h$:
        $$E_x = \frac{2.4\pi}{0.01}\,\delta = 240\pi\,\delta(t - z/v)\ ✓$$
        Positive $V$ means the bottom plate is at the higher potential, so $\mathbf E$ points from bottom to top: $+\hat x$ ✓.

        A note on units: $\delta(t)$ has units of 1/s, so strictly the "2" is a charge of 2 C and $240\pi$ is in V·s/m. The paper writes A and V/m next to the δ, and so do we.

        **Speed path.** $E = \eta J_s = \eta I/w$, or $E = Z_0I/h$. Both are one line. For a wave moving along $+z$, $\mathbf E$ points from the plate whose current flows along $+z$ toward the return plate.

        **Where points go.** Using $J_s/2$ (one sheet only), or $I$ without dividing by $w$: both give $120\pi$. Using $\eta_0$ ($480\pi$). Giving the voltage instead of the field. Missing the direction.
      ` }),
    P({ src: 'Spring 2019 #2(c) · 7 pts', title: 'Time-averaged power',
      q: md`If instead the electric field phasor at some frequency $\omega_0$ is $\tilde{\mathbf E} = 240\pi\,e^{-j\beta z}\,\hat x$ V/m, what is the time-averaged power crossing this transverse cross-section?`,
      parts: [NT('\\langle P\\rangle', 2.4 * PI, 'W', [[4.8 * PI, 'That is missing the ½ of the time average for peak phasors.'], [480 * PI, 'That is the power density ⟨S⟩ in W/m². Multiply by the area wh.'], [1.2 * PI, 'That uses η0. In the dielectric η = 60π Ω.']])],
      hints: [md`For one wave in a lossless medium, $\langle\mathbf S\rangle = \dfrac{|\tilde E|^2}{2\eta}$ along the travel.`, md`Multiply by the cross-section $wh$. Or use $|\tilde V|^2/2Z_0$ with $\tilde V = \tilde E_xh$.`],
      sol: md`
        **Step 1: the magnetic field.** One wave toward $+z$, so $\tilde H_y = \tilde E_x/\eta$:
        $$\tilde H_y = \frac{240\pi}{60\pi}\,e^{-j\beta z} = 4e^{-j\beta z}\ \ \text{A/m}$$
        **Step 2: the time-averaged Poynting vector** ([Topic 4](#/l/w1-avg)):
        $$\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$$
        $\hat x\times\hat y = \hat z$, and $e^{-j\beta z}$ times its conjugate $e^{+j\beta z}$ is 1:
        $$\langle\mathbf S\rangle = \tfrac12(240\pi)(4)\,\hat z$$
        $$\langle\mathbf S\rangle = 480\pi\ \text{W/m}^2\ \hat z$$
        **Step 3: integrate over the cross-section.** The field is uniform between the plates, so multiply by the area $wh = (0.5)(0.01) = 0.005$ m²:
        $$\langle P\rangle = 480\pi\cdot0.005$$
        $$\boxed{\langle P\rangle = 2.4\pi \approx 7.54\ \text{W}}$$
        **Check with circuits.** $\tilde V = \tilde E_xh = 240\pi\cdot0.01 = 2.4\pi$ V. One wave on a line carries $|\tilde V|^2/2Z_0$:
        $$\langle P\rangle = \frac{(2.4\pi)^2}{2\cdot1.2\pi} = \frac{5.76\pi^2}{2.4\pi}$$
        That is $2.4\pi$ W ✓.

        **Speed path.** $\langle P\rangle = \dfrac{|E|^2}{2\eta}\cdot wh$. Notice $(240\pi)^2/(2\cdot60\pi) = 480\pi$: 240 squared over 120 is 480.

        **Where points go.** Forgetting the ½ (the phasor is a peak value); using $\eta_0$; stopping at W/m² without multiplying by the area.
      ` }),

    // ------------------------------------------------------------ Problem 3
    RF(md`
      ### Problem 3 (15 points): circular polarization meets a perfect conductor

      All parts are independent. An incident TEM wave travels in free space with electric field
      $$\mathbf E_i = \cos(\omega t + \beta x)\,\hat y + \sin(\omega t + \beta x)\,\hat z$$
      in V/m. (The paper writes $\mathbf E_i(z, t)$; the field depends on $x$.)

      [[fig:pec]]
    `, { pec: { svg: pecFig(), cap: md`Sketch added here; the paper has no figure. The wave comes from $x > 0$ and hits the conductor at $x = 0$.` } }),
    P({ src: 'Spring 2019 #3(a) · 4 pts', title: 'Polarization of the incident wave',
      q: md`What is the polarization of the incident wave?`,
      parts: [CH('', ['Linear', 'Left-hand circular (LHCP)', 'Right-hand circular (RHCP)', 'Elliptical', 'None of the above'], 1,
        [md`The two components are $90°$ apart in time, not in phase. The tip of $\mathbf E$ turns instead of swinging along a line.`, null,
          md`The tip turns from $\hat y$ toward $\hat z$, which is right-handed about $+\hat x$. But the wave travels toward $-\hat x$ (the $+\beta x$), so about its travel the turn is left-handed.`,
          md`Equal amplitudes (1 and 1) and exactly $90°$ make the ellipse a circle: the more specific answer is circular.`,
          md`It is one of the listed kinds.`])],
      figs: { rot: { svg: rotFig({ alt: 'the y-z plane seen from +x (x out of the page): E points along +y at t = 0 and along +z a quarter period later, turning counterclockwise; the wave travels toward minus x, into the page', h: '\\hat y', v: '\\hat z', out: false, travel: '\\text{travel } -\\hat x\\text{ (into the page)}' }), cap: md`Seen from $+x$: the tip turns counterclockwise while the wave moves away from you, into the page. About the travel direction that is left-handed.` } },
      sol: md`
        **Step 1: write both components as cosines.** $\sin\theta = \cos(\theta - 90°)$, so
        $$E_z = \cos(\omega t + \beta x - 90°)$$
        $E_y$ and $E_z$ have equal amplitudes (1 V/m), and $E_z$ lags $E_y$ by $90°$. Equal amplitudes with a $90°$ lag: **circular**.

        **Step 2: the direction of travel.** Follow a crest: $\omega t + \beta x = \text{const}$. As $t$ grows, $x$ must shrink. The wave travels toward $-\hat x$.

        **Step 3: which way the tip turns.** Watch the field at $x = 0$:
        $$\mathbf E_i(0, t) = \cos\omega t\,\hat y + \sin\omega t\,\hat z$$
        At $\omega t = 0$ it points along $\hat y$. A quarter period later ($\omega t = 90°$) it points along $\hat z$. It turns from $\hat y$ toward $\hat z$.

        [[fig:rot]]

        **Step 4: the hand.** Curl the fingers of your right hand from $\hat y$ toward $\hat z$: your thumb points along $\hat y\times\hat z = +\hat x$. The wave travels along $-\hat x$, against your thumb. So about its own direction of travel the field turns the left-handed way:
        $$\boxed{\text{left-hand circular (LHCP)}}$$
        **The rule in one line** (the key's): (leading component) × (lagging component) points along the travel for RHCP and against it for LHCP. Here $\hat y$ leads and $\hat z$ lags: $\hat y\times\hat z = +\hat x$, against the travel $-\hat x$. LHCP.

        **Speed path.** Equal amplitudes and a sine with a cosine: circular. Lead × lag $= +\hat x$; the $+\beta x$ says the travel is $-\hat x$. Opposite: left. Ten seconds.

        **Where points go.** Reading the travel as $+\hat x$ (missing the sign of $\beta x$); deciding the hand from the turn alone without comparing it with the travel; calling it elliptical.
      ` }),
    P({ src: 'Spring 2019 #3(b) · 7 pts', title: 'The reflected wave',
      q: md`At $x = 0$ the wave strikes the boundary between free space (which fills $x > 0$, where the wave comes from) and a perfect electrical conductor filling $x < 0$. What is the electric field of the reflected wave? Give both components.`,
      parts: [
        X(md`$E_{r,y}(x, t)$ in V/m (use omega, beta, t, x)`, '-cos(omega*t - beta*x)', { omega: [0.5, 3], beta: [0.5, 3], t: [0, 2], x: [0, 2] }),
        X(md`$E_{r,z}(x, t)$ in V/m (use omega, beta, t, x)`, '-sin(omega*t - beta*x)', { omega: [0.5, 3], beta: [0.5, 3], t: [0, 2], x: [0, 2] }),
      ],
      hints: [md`At a PEC the total tangential $\mathbf E$ is zero, so $\Gamma = -1$.`, md`The reflected wave travels toward $+\hat x$: its phase is $\omega t - \beta x$.`],
      sol: md`
        **Step 1: the reflection coefficient.** A perfect conductor has $\eta_2 = 0$:
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1} = \frac{0 - \eta_0}{0 + \eta_0} = -1$$
        Physically: $\mathbf E$ tangent to a perfect conductor must vanish at its surface, so at $x = 0$ the reflected field must cancel the incident field exactly, at every instant.

        **Step 2: the reflected wave's form.** It travels toward $+\hat x$, so its phase is $\omega t - \beta x$. Each component is $\Gamma = -1$ times the incident component, matched at $x = 0$:
        $$\boxed{E_{r,y} = -\cos(\omega t - \beta x)}$$
        $$\boxed{E_{r,z} = -\sin(\omega t - \beta x)}$$
        both in V/m.

        **Step 3: check the boundary.** At $x = 0$ the $y$-parts give $\cos\omega t - \cos\omega t = 0$, and the $z$-parts give $\sin\omega t - \sin\omega t = 0$ ✓.

        !!intuition Does this make sense?
          At $x = 0$ the reflected field points along $-\hat y$ at $t = 0$ and along $-\hat z$ a quarter period later: it still turns from the $y$ axis toward the $z$ axis, the same sense as before. But it now travels toward $+\hat x$, along the thumb. So the reflected wave is **right-hand** circular. A mirror flips the handedness of circular polarization.

        **Speed path.** PEC: $\Gamma = -1$. Flip the sign of the whole field and the sign of $\beta x$. Done.

        **Where points go.** Keeping $+\beta x$ (a "reflected" wave still heading into the conductor); using $\Gamma = +1$; flipping only one component.
      ` }),
    P({ src: 'Spring 2019 #3(c) · 4 pts', title: 'The total field',
      q: md`What best describes the total wave in the free-space region?`,
      parts: [CH('', ['All traveling wave', 'All standing wave', 'Some traveling wave, some standing wave', 'Some traveling wave, some evanescent wave', 'None of the above'], 1,
        [md`Two equal waves traveling in opposite directions carry no net power: together they stand.`, null,
          md`That is the case $0 < |\Gamma| < 1$. Here $|\Gamma| = 1$: the reflected wave is as strong as the incident one.`,
          md`At normal incidence on a PEC nothing is evanescent in free space, and inside the PEC the field is zero.`,
          md`"All standing wave" is listed.`])],
      sol: md`
        **Step 1: add the y-components.** Use $\cos A - \cos B = -2\sin\tfrac{A + B}{2}\sin\tfrac{A - B}{2}$ with $A = \omega t + \beta x$, $B = \omega t - \beta x$:
        $$E_y = \cos A - \cos B = -2\sin(\omega t)\sin(\beta x)$$
        **Step 2: add the z-components.** Use $\sin A - \sin B = 2\cos\tfrac{A + B}{2}\sin\tfrac{A - B}{2}$:
        $$E_z = \sin A - \sin B = 2\cos(\omega t)\sin(\beta x)$$
        **Step 3: read the form.** Each component is (a function of $x$) times (a function of $t$). Nothing moves: the zeros sit at $\sin\beta x = 0$, that is $x = 0, \lambda/2, \lambda, \ldots$, forever. That is a pure standing wave:
        $$\boxed{\text{all standing wave}}$$
        **Why.** $|\Gamma| = 1$: the reflected wave carries back exactly the power the incident wave brings, so the net power flow is zero everywhere.

        !!intuition Does this make sense?
          At a fixed $x$ the field still turns in a circle, of radius $2|\sin\beta x|$. The pattern stands still, but at each point the field rotates.

        **Speed path.** $|\Gamma| = 1$: all standing. $\Gamma = 0$: all traveling. In between: some of each.

        **Where points go.** Picking "some traveling, some standing" out of habit. That is the answer only when $0 < |\Gamma| < 1$.
      ` }),

    // ------------------------------------------------------------ Problem 4
    RF(md`
      ### Problem 4 (25 points): two lines in series

      Parts (a) to (d) are independent; (e) to (g) use the bounce diagram. Two transmission lines of equal length are joined directly at a distance $l/2$ from the generator. $Z_1 = 50\ \Omega$ and $v_1 = c/3 = 10^8$ m/s; $Z_2 = 100\ \Omega$ and $v_2 = 2c/3$; $l = 40$ m; $R_g = 100\ \Omega$ and $R_L = 100\ \Omega$. The source is $f(t) = 150u(t)$ V.

      [[fig:ckt]]
    `, { ckt: { svg: ckt19(), cap: md`Each line is $l/2 = 20$ m long. Line 2 is twice as fast as line 1.` } }),
    P({ src: 'Spring 2019 #4(a) · 3 pts', title: 'Reflection at the junction',
      q: md`What are the voltage and current **reflection** coefficients $\Gamma_{12,V}$ and $\Gamma_{12,I}$ at the junction $z = l/2$, for the wave moving to the right?`,
      parts: [
        NT('\\Gamma_{12,V}', 1 / 3, '', [[-1 / 3, 'That is (Z1 − Z2)/(Z1 + Z2), upside down. The wave comes from line 1 and sees line 2 as its load: (Z2 − Z1)/(Z2 + Z1).']]),
        NT('\\Gamma_{12,I}', -1 / 3, '', [[1 / 3, 'The current coefficient is the negative of the voltage one: Γ_I = −Γ_V.']]),
      ],
      hints: [md`Until something comes back, line 2 looks to the wave like a resistor $Z_2$.`],
      sol: md`
        **What the wave sees.** A wave coming down line 1 reaches line 2. Until something comes back from farther down, line 2 looks exactly like a resistor $Z_2$ (that is what $Z_0$ means: $V/I$ of a wave going one way). So the junction is a load $Z_2$ on a line $Z_1$:
        $$\Gamma_{12,V} = \frac{Z_2 - Z_1}{Z_2 + Z_1} = \frac{100 - 50}{100 + 50}$$
        $$\boxed{\Gamma_{12,V} = \tfrac13}$$
        **The current.** In each wave $I = \pm V/Z_0$: plus for a wave going right, minus for a wave going left. The reflected wave goes left, so its current carries an extra minus sign:
        $$\boxed{\Gamma_{12,I} = -\Gamma_{12,V} = -\tfrac13}$$

        !!intuition Does this make sense?
          Going into a higher impedance is like meeting a partial open circuit. The voltage bounces back with the same sign (it piles up); the current bounces back with the opposite sign (it is partly blocked).

        **Speed path.** $\Gamma_V = \dfrac{Z_{\text{next}} - Z_{\text{here}}}{Z_{\text{next}} + Z_{\text{here}}}$ and $\Gamma_I = -\Gamma_V$.

        **Where points go.** Swapping $Z_1$ and $Z_2$; writing $\Gamma_I = \Gamma_V$.
      ` }),
    P({ src: 'Spring 2019 #4(b) · 3 pts', title: 'Transmission at the junction',
      q: md`What are the voltage and current **transmission** coefficients $\tau_{12,V}$ and $\tau_{12,I}$ at the junction, for the wave moving to the right?`,
      parts: [
        NT('\\tau_{12,V}', 4 / 3, '', [[2 / 3, 'That is the current coefficient, 1 + Γ_I.'], [1 / 3, 'That is Γ. The transmission coefficient is 1 + Γ.']]),
        NT('\\tau_{12,I}', 2 / 3, '', [[4 / 3, 'That is the voltage coefficient. For the current use 1 + Γ_I = 1 − 1/3.']]),
      ],
      hints: [md`The voltage is continuous at the junction: incident + reflected on the left equals transmitted on the right.`],
      sol: md`
        **Why τ = 1 + Γ.** Just left of the junction the voltage is the incident wave plus the reflected wave. Just right of it there is only the transmitted wave. The junction is one node, so the two voltages are equal:
        $$V_i + \Gamma V_i = \tau V_i$$
        Divide by $V_i$: $\tau = 1 + \Gamma$. KCL at the node gives the same for the currents. So
        $$\boxed{\tau_{12,V} = 1 + \tfrac13 = \tfrac43}$$
        $$\boxed{\tau_{12,I} = 1 - \tfrac13 = \tfrac23}$$

        !!intuition Does this make sense?
          $\tau_V > 1$ is not free energy. A wave carries $V^2/Z_0$. Per volt of incident wave: incident $1/50 = 0.0200$ W, reflected $(1/3)^2/50 = 0.0022$ W, transmitted $(4/3)^2/100 = 0.0178$ W. They balance ✓. The transmitted wave has more voltage but less current: $\tau_V\tau_I = \tfrac89 = 1 - \Gamma^2$.

        **Speed path.** $\tau = 1 + \Gamma$ for each quantity, with its own $\Gamma$.

        **Where points go.** Writing $\tau = 1 - \Gamma$ for the voltage, or giving the same number for voltage and current.
      ` }),
    P({ src: 'Spring 2019 #4(c) · 2 pts', title: 'Reflection at the load',
      q: md`What are the voltage and current reflection coefficients $\Gamma_{L,V}$ and $\Gamma_{L,I}$ at the load, for the wave moving to the right?`,
      parts: [CH('', [md`$\Gamma_{L,V} = 0$ and $\Gamma_{L,I} = 0$`, md`$\Gamma_{L,V} = \tfrac13$ and $\Gamma_{L,I} = -\tfrac13$`, md`$\Gamma_{L,V} = 1$ and $\Gamma_{L,I} = -1$`, md`$\Gamma_{L,V} = -\tfrac13$ and $\Gamma_{L,I} = \tfrac13$`], 0,
        [null, md`That compares $R_L$ with $Z_1$. The wave that reaches the load is on line 2, with $Z_2 = 100\ \Omega$.`, md`That is an open circuit. $R_L = 100\ \Omega$ is a finite resistor.`, md`That compares $Z_1$ with $R_L$, upside down and on the wrong line.`])],
      sol: md`
        The wave arriving at the load travels on line 2, so compare $R_L$ with $Z_2$:
        $$\Gamma_{L,V} = \frac{R_L - Z_2}{R_L + Z_2} = \frac{100 - 100}{200} = 0$$
        and $\Gamma_{L,I} = -\Gamma_{L,V} = 0$. The load is **matched** to line 2: it absorbs every wave that reaches it, and nothing ever comes back from $z = l$.

        **Speed path.** $R_L = Z_2$: matched, both zero.

        **Where points go.** Comparing with the wrong line's $Z_0$.
      ` }),
    P({ src: 'Spring 2019 #4(d) · 2 pts', title: 'Reflection at the generator',
      q: md`What are the voltage and current reflection coefficients $\Gamma_{g,V}$ and $\Gamma_{g,I}$ at the generator, for the wave moving to the left?`,
      parts: [
        NT('\\Gamma_{g,V}', 1 / 3, '', [[0, 'That compares R_g with Z2. The generator sits on line 1, Z1 = 50 Ω.'], [-1 / 3, 'Upside down: the returning wave sees R_g as its load, (R_g − Z1)/(R_g + Z1).']]),
        NT('\\Gamma_{g,I}', -1 / 3, '', [[1 / 3, 'The current coefficient is −Γ_V.']]),
      ],
      hints: [md`A step source is constant after $t = 0$, so it adds nothing to a returning wave: the wave sees only $R_g$.`],
      sol: md`
        **What the returning wave sees.** After $t = 0$ the source holds a constant 150 V. A constant adds nothing new to a wave arriving later, so for reflections the source acts like a short, and the wave sees just $R_g$ at the end of line 1:
        $$\Gamma_{g,V} = \frac{R_g - Z_1}{R_g + Z_1} = \frac{100 - 50}{150}$$
        $$\boxed{\Gamma_{g,V} = \tfrac13, \quad \Gamma_{g,I} = -\tfrac13}$$

        **Speed path.** Treat the generator end as a load $R_g$ on line 1.

        **Where points go.** Using $Z_2$ (gives 0), or including the source voltage in the reflection.
      ` }),
    P({ src: 'Spring 2019 #4(e) · 10 pts', title: 'The voltage bounce diagram',
      q: md`Complete the **voltage** bounce diagram for this system from $t = 0$ to $t = 1\ \mu\text{s}$, labeling all values clearly. Then enter these values from your diagram.`,
      parts: [
        NT('T_1\\ \\text{(one-way time on line 1)}', 200, 'ns', [[100, 'That is T2. Line 1 is the slower one: 20 m at 10⁸ m/s.'], [400, 'That is the full 40 m at v1. Line 1 is only l/2 = 20 m long.']]),
        NT('T_2\\ \\text{(one-way time on line 2)}', 100, 'ns', [[200, 'That is T1. Line 2 is twice as fast.']]),
        NT('V_1^+\\ \\text{(the first wave)}', 50, 'V', [[75, 'That is the DC answer R_L/(R_g + R_L). At t = 0⁺ the source sees only line 1, a resistor Z1.'], [100, 'That is R_g/(R_g + Z1). The line takes the share Z1/(R_g + Z1).'], [150, 'That is the whole source. R_g takes part of it.']]),
        NT('\\text{wave sent into line 2 at}\\ t = 200\\ \\text{ns}', 200 / 3, 'V', [[50 / 3, 'That is the wave reflected back into line 1.'], [100 / 3, 'That uses the current coefficient 2/3. Voltage transmits with 4/3.']]),
        NT('\\text{wave reflected into line 1 at}\\ t = 200\\ \\text{ns}', 50 / 3, 'V', [[-50 / 3, 'Γ12 is +1/3 for voltage: Z2 > Z1.']]),
        NT('\\text{wave leaving the generator at}\\ t = 400\\ \\text{ns}', 50 / 9, 'V', [[-50 / 9, 'Γg is +1/3 for voltage: R_g = 100 Ω > Z1 = 50 Ω.']]),
        NT('\\text{wave sent into line 2 at}\\ t = 600\\ \\text{ns}', 200 / 27, 'V', [[50 / 27, 'That is the part reflected back toward the generator.']]),
      ],
      hints: [md`$\tau_g = Z_1/(R_g + Z_1)$ launches the first wave. Times: $T_1 = 20\ \text{m}/v_1$ and $T_2 = 20\ \text{m}/v_2$.`, md`At the junction a right-going wave splits into $\tfrac13$ back and $\tfrac43$ forward. Nothing returns from the load, since $\Gamma_L = 0$.`],
      figs: { bd: { svg: bd19(), cap: md`Voltage bounce diagram: position across, time downward. Blue lines go right, grey lines go left. Every round trip on line 1 multiplies the wave by $\Gamma_{12}\Gamma_g = \tfrac19$.` } },
      sol: md`
        **Step 1: travel times.** Each line is $l/2 = 20$ m long.
        $$T_1 = \frac{20\ \text{m}}{10^8\ \text{m/s}} = 200\ \text{ns}$$
        $$T_2 = \frac{20\ \text{m}}{2\times10^8\ \text{m/s}} = 100\ \text{ns}$$
        **Step 2: the first wave.** At $t = 0^+$ the generator sees only line 1, which looks like a resistor $Z_1$ (nothing has come back yet). So $R_g$ and $Z_1$ form a voltage divider. The share of $f(t)$ that goes onto the line is the injection coefficient:
        $$\tau_g = \frac{Z_1}{R_g + Z_1} = \frac{50}{150} = \tfrac13$$
        $$V_1^+ = \tau_g\cdot150 = 50\ \text{V}$$
        **Step 3: the junction, t = 200 ns.** The 50 V wave splits:
        $$\text{back: } \Gamma_{12}\cdot50 = \tfrac{50}{3}\ \text{V}$$
        $$\text{forward: } \tau_{12}\cdot50 = \tfrac{200}{3}\ \text{V}$$
        **Step 4: the load, t = 300 ns.** The forward wave reaches $z = l$ after another 100 ns. $\Gamma_L = 0$: it is absorbed. Line 2 never carries a left-going wave.

        **Step 5: the generator, t = 400 ns.** The $\tfrac{50}{3}$ V wave reflects with $\Gamma_g = \tfrac13$:
        $$\tfrac13\cdot\tfrac{50}{3} = \tfrac{50}{9}\ \text{V}$$
        **Step 6: the junction again, t = 600 ns.** The $\tfrac{50}{9}$ V wave splits the same way: $\tfrac13\cdot\tfrac{50}{9} = \tfrac{50}{27}$ V back and $\tfrac43\cdot\tfrac{50}{9} = \tfrac{200}{27}$ V forward (absorbed at the load at 700 ns).

        **Step 7: once more.** The $\tfrac{50}{27}$ V wave reaches the generator at 800 ns and returns as $\tfrac{50}{81}$ V, which reaches the junction at 1000 ns = 1 µs, the end of the diagram.

        [[fig:bd]]

        **The pattern.** Every round trip on line 1 (400 ns) multiplies the line-1 wave by $\Gamma_{12}\Gamma_g = \tfrac19$. The diagram is a geometric series.

        **Check.** The waves into the load add up to $\tfrac{200}{3}\left(1 + \tfrac19 + \tfrac{1}{81} + \cdots\right) = \tfrac{200}{3}\cdot\tfrac98 = 75$ V, the DC answer of part (g) ✓.

        **Speed path.** Before drawing anything, write $T_1$, $T_2$, $\tau_g$ and the three $\Gamma$'s along the top of the diagram. Then each new label is the previous one times a coefficient: $\times\tfrac13$ back and $\times\tfrac43$ forward at the junction, $\times\tfrac13$ at the generator.

        **Where points go.** The time axis: line 2 takes 100 ns, not 200, because it is faster. Drawing a reflection off the matched load. Computing $\Gamma_g$ with $Z_2$. Arithmetic with ninths. Unlabeled lines lose points even when the picture is right.
      ` }),
    P({ src: 'Spring 2019 #4(f) · 2 pts', title: 'Reading the diagram at one point',
      q: md`Use the diagram to find $V(z = 10\ \text{m},\ t = 650\ \text{ns})$.`,
      parts: [NT('V(10\\ \\text{m}, 650\\ \\text{ns})', 650 / 9, 'V', [[2000 / 27, 'That includes the 50/27 V wave, which reaches z = 10 m at 700 ns, after 650 ns.'], [200 / 3, 'That stops too early: the 50/9 V wave passed z = 10 m at 500 ns.'], [50, 'That is only the first wave. Two more have passed z = 10 m by 650 ns.']])],
      hints: [md`Draw a vertical line at $z = 10$ m. A wave on line 1 crosses it halfway through its 200 ns trip.`],
      figs: { bdp: { svg: bd19(10), cap: md`The probe line at $z = 10$ m: each dot is a wave passing. Three have passed by 650 ns.` }, v10: { svg: TL.plotT(s19, 10, Object.assign({ tMax: 1000, w: 400 }, ns)), cap: md`$V(10\ \text{m}, t)$ for the whole first microsecond. The dashed line is the final value, 75 V.` } },
      sol: md`
        **Step 1: the probe line.** Draw a vertical line at $z = 10$ m, halfway along line 1. Every wave on line 1 crosses it 100 ns after leaving either end.

        [[fig:bdp]]

        **Step 2: list the crossings up to 650 ns.**

        | Wave | Crosses $z = 10$ m at | Voltage |
        |---|---|---|
        | first, going right | 100 ns | 50 V |
        | reflected at the junction, going left | 300 ns | $\tfrac{50}{3}$ V |
        | reflected at the generator, going right | 500 ns | $\tfrac{50}{9}$ V |
        | next, going left | 700 ns | too late |

        **Step 3: add.** The voltage at a point is the sum of every wave that has passed it:
        $$V = 50 + \tfrac{50}{3} + \tfrac{50}{9}$$
        Put everything over 9:
        $$V = \frac{450 + 150 + 50}{9}$$
        $$\boxed{V(10\ \text{m}, 650\ \text{ns}) = \tfrac{650}{9} \approx 72.2\ \text{V}}$$

        [[fig:v10]]

        **Speed path.** At a point halfway along line 1, the waves arrive at 100, 300, 500, 700 ns. Count those before 650 ns and add their labels.

        **Where points go.** Including the wave that arrives at 700 ns, or missing the one at 500 ns. Adding a wave's voltage before its line has actually reached the probe.
      ` }),
    P({ src: 'Spring 2019 #4(g) · 3 pts', title: 'Steady state',
      q: md`What is the steady-state voltage across the load?`,
      parts: [NT('V(z = 40\\ \\text{m}, t = \\infty)', 75, 'V', [[150, 'That drops R_g. In steady state the lines become wires, but R_g is still in series.'], [50, 'That is the first wave, not the final value.'], [200 / 3, 'That is only the first wave into line 2. Later bounces keep adding.']])],
      hints: [md`When nothing changes in time, a lossless line is just a pair of wires.`],
      figs: { vl: { svg: TL.plotT(s19, 40, Object.assign({ tMax: 1000, w: 400 }, ns)), cap: md`$V$ at the load: $\tfrac{200}{3}$ V at 300 ns, then $\tfrac{2000}{27}$ V at 700 ns, climbing toward the dashed 75 V.` } },
      sol: md`
        **The idea.** Once the bounces die out, nothing changes in time. A lossless line with no time variation has no voltage drop along it (its series inductance drops $L\,\partial I/\partial t = 0$) and draws no current into its shunt capacitance ($C\,\partial V/\partial t = 0$). So in DC steady state each line is just a pair of wires, whatever its $Z_0$. The circuit is $R_g$ in series with $R_L$:
        $$V_L = 150\cdot\frac{R_L}{R_g + R_L} = 150\cdot\frac{100}{200}$$
        $$\boxed{V_L(\infty) = 75\ \text{V}}$$
        **Check with the diagram.** Line 1 near the generator adds up $50\left(1 + \tfrac13 + \tfrac19 + \cdots\right) = 50\cdot\tfrac32 = 75$ V, and the load adds up $\tfrac{200}{3}\cdot\tfrac98 = 75$ V. Both ends agree ✓.

        [[fig:vl]]

        **Speed path.** $V(\infty) = V_g\,R_L/(R_g + R_L)$. The $Z_0$'s and the junction do not matter.

        **Where points go.** Leaving out $R_g$ (150 V); giving the first transmitted wave ($\tfrac{200}{3}$ V).
      ` }),

    // ------------------------------------------------------------ Problem 5
    R(md`
      ### Problem 5 (15 points): resonances of a line

      A lossless transmission line of length $l = 100$ m and velocity $v = 2\times10^8$ m/s supports resonant oscillations. In cosine steady state, the voltage phasor of these oscillations is measured to be $\tilde V_{in} = 0$ V at the input, and the current phasor at the load is measured to be $\tilde I_L = 0$ A.
    `),
    P({ src: 'Spring 2019 #5(a) · 5 pts', title: 'Input and load impedance',
      q: md`What are the input impedance $Z_{in}$ and the load impedance $Z_L$ for these resonances?`,
      parts: [CH('', [md`$Z_{in} = 0$ and $Z_L = \infty$`, md`$Z_{in} = \infty$ and $Z_L = 0$`, md`$Z_{in} = 0$ and $Z_L = 0$`, md`$Z_{in} = \infty$ and $Z_L = \infty$`], 0,
        [null, md`That swaps them. $Z = \tilde V/\tilde I$: at the input $\tilde V = 0$ gives 0, and at the load $\tilde I = 0$ gives $\infty$.`, md`At the load the current is zero while the voltage is not, so $Z_L = \tilde V_L/0 = \infty$.`, md`At the input the voltage is zero, so $Z_{in} = 0/\tilde I_{in} = 0$.`])],
      sol: md`
        **Definition.** At any point of a line, the impedance looking toward the load is $Z = \tilde V/\tilde I$ there.

        **Why the other phasor is not zero.** If $\tilde V$ and $\tilde I$ were both zero at one point, the telegrapher's equations (first order in position) would force both to be zero everywhere: no oscillation at all. So at the input $\tilde I_{in} \neq 0$, and at the load $\tilde V_L \neq 0$.

        **Input.**
        $$Z_{in} = \frac{\tilde V_{in}}{\tilde I_{in}} = \frac{0}{\tilde I_{in}} = 0\ \Omega$$
        **Load.**
        $$Z_L = \frac{\tilde V_L}{\tilde I_L} = \frac{\tilde V_L}{0} = \infty$$
        $$\boxed{Z_{in} = 0\ \Omega\ \text{(a short)}}$$
        $$\boxed{Z_L = \infty\ \text{(an open)}}$$

        !!intuition Does this make sense?
          A line shorted at one end and open at the other cannot pass energy out of either end. Energy put in sloshes back and forth between the electric and magnetic fields forever: that is a resonance.

        **Speed path.** $V = 0$ means short; $I = 0$ means open.

        **Where points go.** Swapping the two.
      ` }),
    P({ src: 'Spring 2019 #5(b) · 10 pts', title: 'The three lowest resonant frequencies',
      q: md`Determine the three lowest possible frequencies for resonant oscillations.`,
      parts: [
        NT('f_1', 0.5, 'MHz', [[1, 'That is l = λ/2, which needs the same kind of end on both sides. Short-to-open needs l = λ/4.'], [Math.PI, 'That is ω/10⁶, not f. Divide by 2π.']]),
        NT('f_2', 1.5, 'MHz', [[1, 'That is l = λ/2. Short-to-open needs an odd number of quarter waves: l = 3λ/4.'], [2, 'That is l = λ.']]),
        NT('f_3', 2.5, 'MHz', [[1.5, 'That is f2.'], [2, 'That is l = λ, which has the same kind of end on both sides.']]),
      ],
      hints: [md`An open load makes $\tilde V(d) \propto \cos\beta d$, with $d$ measured back from the load.`, md`Set $\cos\beta l = 0$: $\beta l = \pi/2, 3\pi/2, 5\pi/2$.`],
      figs: {
        modes: { svg: PF.row([1, 2, 3].map((m) => ({ svg: modeFig(m), cap: `$\\beta l = ${m === 1 ? '' : 2 * m - 1}\\pi/2$` }))).svg, cap: md`The three lowest modes, input at $z = 0$ and load at $z = l$. Solid: the shape of $\tilde V$, zero at the input. Dashed: the shape of $\tilde I$, zero at the load.` },
      },
      sol: md`
        **Step 1: the standing wave on an open-ended line.** $Z_L = \infty$ gives $\Gamma_L = +1$. The formula sheet ([Topic 17](#/l/w6-vd)) gives the voltage at a distance $d$ back from the load:
        $$\tilde V(d) = V^+\left(e^{j\beta d} + \Gamma_Le^{-j\beta d}\right)$$
        With $\Gamma_L = 1$, Euler's formula ($e^{j\theta} + e^{-j\theta} = 2\cos\theta$) gives
        $$\tilde V(d) = 2V^+\cos(\beta d)$$
        The current has a minus sign in front of $\Gamma_L$:
        $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} - e^{-j\beta d}\right)$$
        and $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$:
        $$\tilde I(d) = \frac{2jV^+}{Z_0}\sin(\beta d)$$
        At the load ($d = 0$): $\cos0 = 1$ and $\sin0 = 0$, full voltage and no current ✓.

        **Step 2: the input condition.** The input is at $d = l$. We need $\tilde V(l) = 0$:
        $$\cos(\beta l) = 0$$
        $$\beta l = \frac{\pi}{2},\ \frac{3\pi}{2},\ \frac{5\pi}{2},\ \ldots$$
        **Step 3: in wavelengths.** $\beta = 2\pi/\lambda$, so $\beta l = \pi/2$ means $l = \lambda/4$. In general
        $$l = \frac{\lambda}{4},\ \frac{3\lambda}{4},\ \frac{5\lambda}{4},\ \ldots$$
        An odd number of quarter waves: one end at a voltage zero, the other at a voltage peak.

        [[fig:modes]]

        **Step 4: frequencies.** $f = v/\lambda$. The lowest has $\lambda = 4l = 400$ m:
        $$f_1 = \frac{v}{4l} = \frac{2\times10^8}{400} = 0.5\ \text{MHz}$$
        The others have $\lambda = 4l/3$ and $4l/5$, so they are 3 and 5 times higher:
        $$\boxed{f_1 = 0.5,\ \ f_2 = 1.5,\ \ f_3 = 2.5\ \text{MHz}}$$

        !!intuition Does this make sense?
          Only odd multiples of the lowest frequency appear. A line with the same kind of end at both ends (short and short, or open and open) needs a whole number of half waves instead, $f_n = n\,v/2l$: here that would be 1, 2, 3 MHz.

        **Speed path.** Short at one end, open at the other: $f_n = (2n - 1)\,v/4l$. Same kind of end at both: $f_n = n\,v/2l$.

        **Where points go.** Using $v/2l$ (1 MHz); giving $\omega$ or $\lambda$ instead of $f$; listing 0.5, 1, 1.5 MHz (all multiples instead of odd ones).
      ` }),
  ];

  EM.lesson('e3-past', { id: 'e3-past-sp19', order: 3, title: 'Spring 2019 Exam 3', kind: 'exam', sub: 'Chen, Goddard, Zhao · 5 problems, 100 pts · keyed · a lossy wave, a parallel-plate line, a PEC, a two-line bounce, resonances', steps: sp19 });

  // ======================================================================================== SPRING 2018
  // the bounce of Problem 3: length in cm, speed in cm/ns (2c/3 = 20 cm/ns), times in ns
  const s18 = TL.solve({ Vg: 10, Rg: 30, RL: 150, sections: [{ Z0: 50, len: 15, v: 20 }], tMax: 3 });
  const nsc = { tUnit: '\\text{ns}', zUnit: 'cm' };

  const ckt3 = () => lineCkt({
    alt: 'three lines in series: a source f(t) with R_g drives Z_01 from z = 0 to l/3, then Z_02 from l/3 to 2l/3, then Z_03 from 2l/3 to l, ending in R_L; the junctions are marked Gamma_12 and Gamma_23',
    src: 'f(t)', rg: 'R_g', load: 'R_L', zt: ['0', 'l/3', '2l/3', 'l'], gam: ['\\Gamma_{12}', '\\Gamma_{23}'],
    secs: [{ w: 90, top: 'Z_{01}', fill: 'shade' }, { w: 90, top: 'Z_{02}', fill: 'plane' }, { w: 90, top: 'Z_{03}', fill: 'shade' }],
  });
  const ckt18 = () => lineCkt({
    alt: 'a step source V_g with R_g = 30 ohm drives a line with Z_0 = 50 ohm from z = 0 to z = l = 15 cm, which ends in R_L = 150 ohm',
    src: 'V_g', rg: 'R_g = 30\\ \\Omega', load: 'R_L = 150\\ \\Omega', zt: ['0', 'l'],
    secs: [{ w: 230, top: 'Z_0 = 50\\ \\Omega', bot: 'v_p = 2c/3,\\ l = 15\\ \\text{cm}', fill: 'plane' }],
  });
  const ckt4 = () => lineCkt({
    alt: 'a sinusoidal source with phasor V = 2 at 0 degrees, in series with R = 50 ohm, drives a line of length l (Z_0 = 50 ohm) ending in a load Z_L; V_in is marked across the line input and V_L across the load',
    src: '\\tilde V', rg: 'R = 50\\ \\Omega', loadIn: 'Z_L', vin: '\\tilde V_{in}', vl: '\\tilde V_L', zt: ['0', 'l'],
    secs: [{ w: 200, top: 'Z_0 = 50\\ \\Omega', bot: 'l = 50\\ \\text{m}', fill: 'plane' }],
  });
  function intfFig() {
    const g = PF.fig({ alt: 'the interface y = 0 seen edge-on: free space on the left (y < 0), a perfect dielectric shaded on the right (y > 0). The incident wave travels right toward the interface, the reflected wave travels left, the transmitted wave travels right in the dielectric. E is along z, drawn up.' });
    const x0 = 210, yt = 26, yb = 176;
    g.rect(x0, yt, 190, yb - yt, { cls: 'plane' });
    g.line(x0, yt, x0, yb, { cls: 'thick' });
    g.text(110, yt + 10, 'free space', 'c', 'small'); g.text(305, yt + 10, 'perfect dielectric', 'c', 'small');
    g.arrow(60, 74, 190, 74, { hs: 8 }); g.text(125, 66, 'incident', 'b', 'small');
    g.arrow(190, 122, 60, 122, { hs: 8, cls: 'dim' }); g.text(125, 130, 'reflected', 't', 'small');
    g.arrow(232, 98, 370, 98, { hs: 8 }); g.text(300, 90, 'transmitted', 'b', 'small');
    g.arrow(30, yb + 18, 420, yb + 18, { cls: 'dim', hs: 6 }); g.label(424, yb + 18, 'y', 'l', 'small accent');
    g.line(x0, yb + 14, x0, yb + 22, { cls: 'dim' }); g.label(x0, yb + 26, '0', 't', 'small accent');
    g.arrow(30, yb + 18, 30, yb - 22, { cls: 'dim', hs: 6 }); g.label(36, yb - 24, 'z', 'bl', 'small accent');
    return g.svg();
  }

  // the ten 3-point questions of Problem 1
  const C3 = (k, title, q, opts, a, why, sol, figs) => P(Object.assign({ src: `Spring 2018 #1(${k}) · 3 pts`, title, q, parts: [CH('', opts, a, why)], sol }, figs ? { figs } : {}));
  const ROMAN = ['I only', 'II only', 'III only', 'I and II only', 'I, II, and III', 'None of the above'];
  const ROMAN13 = ['I only', 'II only', 'III only', 'I and III only', 'I, II, and III', 'None of the above'];

  const sp18 = [
    R(md`
      **Spring 2018 · ECE 329 · Exam 3** (He, Goddard, Ilie). Wednesday, April 18, 2018, 7:15–8:30 PM: 75 minutes. Four problems, 100 points (30, 20, 30, 20). Closed book, no calculators. That term allowed three double-sided 3×5 cards; you get one 4″×6″ card and the official formula sheet. The paper asked for answers as fractions, gave the same constants as every Exam 3 ($c = 3\times10^8$ m/s, $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$ F/m, $\mu_0 = 4\pi\times10^{-7}$ H/m, $\eta_0 = 120\pi\ \Omega$), and printed the imperfect-dielectric / good-conductor table that is now on your formula sheet.

      **What it tests.** Problem 1 is ten quick concept questions: good conductors ([Topic 7](#/l/w2-limits)), the telegrapher's equations ([Topic 13](#/l/w5-telegraph)), polarization and handedness ([Topic 9](#/l/w3-pol)), $Z_0$ and $\Gamma(d)$ ([Topic 17](#/l/w6-vd)), matching through several lines ([Topic 16](#/l/w5-multi)), and the resonances of a shorted line ([Topic 18](#/l/w6-stubs)). Problem 2: a wave entering a dielectric, read backward from the transmitted field ([Topic 11](#/l/w4-gamma), [Topic 5](#/l/w2-gamma)). Problem 3: a single-line bounce diagram for voltage and current, and the traces at both ends ([Topic 14](#/l/w5-launch), [Topic 15](#/l/w5-bounce)). Problem 4: the input circuit of a line, a stub resonance and a quarter-wave section ([Topic 18](#/l/w6-stubs), [Topic 19](#/l/w6-qw)). All of it is in scope for the Fall 2026 Exam 3.

      **No key was posted.** Every answer here was derived from first principles and checked twice: the algebra in Python, and every bounce value against the site's own transmission-line solver.

      **Three different τ's appear.** In 1(i), $\tau$ is the **angle of $\eta$**. In Problem 2, $\tau = 1 + \Gamma$ is the **transmission coefficient** at the interface. In Problem 3, $\tau_g$ is the **injection coefficient**, the share of the source voltage that launches the first wave.

      **How to use it.** Set a 75-minute timer and work on paper. Then enter your answers. Number boxes take arithmetic: <code>100*pi</code>, <code>-1/11</code>, <code>275/32</code>. Problem 1's questions have no partial credit on the paper, so practice deciding each in under a minute; the solutions say how.
    `),

    // ------------------------------------------------------------ Problem 1
    R(md`
      ### Problem 1 (30 points): ten multiple-choice questions, 3 points each

      Pick the **one** correct option. Most need a short calculation, but no work is required, and there is no partial credit.
    `),
    C3('i', 'Waves in a good conductor', md`Which statement applies to a wave propagating inside a good conductor?`,
      ['The attenuation constant is approximately zero', 'The phase constant is a linear function of frequency', 'The wave amplitude decreases by only a small amount as the wave travels one wavelength', 'The electric and magnetic fields are 45 degrees out of phase', 'None of the above'], 3,
      [md`In a good conductor $\alpha \approx \beta = \sqrt{\pi f\mu\sigma}$: the attenuation is as large as the phase constant. $\alpha \approx 0$ describes a perfect dielectric.`,
        md`$\beta = \sqrt{\pi f\mu\sigma}$ grows as $\sqrt f$. A linear $\beta = \omega\sqrt{\mu\epsilon}$ is the lossless dielectric.`,
        md`Over one wavelength $\alpha\lambda = \beta\cdot2\pi/\beta = 2\pi$, so the amplitude falls by $e^{-2\pi} \approx 0.002$: nearly all of it is gone.`, null,
        md`The $45°$ statement is true: $\eta$ of a good conductor has angle $45°$.`],
      md`
        **First principles.** A good conductor has $\sigma/\omega\epsilon \gg 1$, so in $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$ the conduction term wins ([Topic 7](#/l/w2-limits)):
        $$\gamma^2 \approx j\omega\mu\sigma$$
        $\sqrt j = e^{j45°} = (1 + j)/\sqrt2$, so
        $$\gamma \approx (1 + j)\sqrt{\frac{\omega\mu\sigma}{2}} = (1 + j)\sqrt{\pi f\mu\sigma}$$
        So $\alpha = \beta = \sqrt{\pi f\mu\sigma}$. Then $\eta = j\omega\mu/\gamma$ has angle $90° - 45° = 45°$.

        **Each statement.**

        - Attenuation near zero: $\alpha$ equals $\beta$, far from zero. False.
        - $\beta$ linear in frequency: $\beta \propto \sqrt f$. False.
        - A small decrease over one wavelength: the amplitude is multiplied by $e^{-\alpha\lambda} = e^{-2\pi} \approx 0.002$, a huge decrease. False.
        - $\mathbf E$ and $\mathbf H$ $45°$ out of phase: $\tau = 45°$, so $\mathbf H$ lags $\mathbf E$ by $45°$. **True.**

        $$\boxed{\mathbf E\ \text{and}\ \mathbf H\ \text{are}\ 45°\ \text{apart}}$$
        **Speed path.** Good conductor: $\alpha = \beta$, $\tau = 45°$, $\delta = 1/\alpha$. That one line settles every option.

        **Where points go.** Choosing "a small decrease over one wavelength" by thinking "conductor means a little loss". A wave dies within about one skin depth, $\lambda/2\pi$.
      `),
    C3('ii', "The telegrapher's equations", md`The telegrapher's equations for the voltage and current along a transmission line:

I. can be derived directly from Maxwell's equations for the electric and magnetic fields;

II. result in d'Alembert solutions of the wave equation, that is $f(t - z/v)$ and $g(t + z/v)$

III. equivalently describe a distributed circuit of capacitors in series, interwoven with inductors shunting to ground.`,
      ROMAN, 3,
      [md`II is also true: the two equations combine into the wave equation, whose solutions are $f(t - z/v)$ and $g(t + z/v)$.`,
        md`I is also true: the course derives them from Faraday's and Ampère's laws applied to the TEM fields between the conductors.`,
        md`III is the false one: the elements are swapped.`, null,
        md`III swaps the elements. Inductors are in series (they carry the current along the line); capacitors shunt (they hold the charge between the conductors).`,
        md`I and II are both true.`],
      md`
        **I.** Lecture 27 starts from the fields of a parallel-plate line. Faraday's law around a thin loop between the plates gives $\partial V/\partial z = -L\,\partial I/\partial t$, and Ampère's law (with conservation of charge) gives $\partial I/\partial z = -C\,\partial V/\partial t$ ([Topic 13](#/l/w5-telegraph)). **True.**

        **II.** Differentiate the first equation in $z$ and substitute the second:
        $$\frac{\partial^2V}{\partial z^2} = LC\,\frac{\partial^2V}{\partial t^2}$$
        That is the wave equation with $v = 1/\sqrt{LC}$, solved by $f(t - z/v) + g(t + z/v)$. **True.**

        **III.** In each length $dz$ the current flows along the conductors through a **series inductance** $L\,dz$, and charge collects between the conductors on a **shunt capacitance** $C\,dz$. The statement has them swapped. **False.**
        $$\boxed{\text{I and II only}}$$
        **Speed path.** Remember the picture: L along the line, C across it. Then only III needs checking.

        **Where points go.** Reading III quickly and missing the swap.
      `),
    C3('iii', 'When is it linear?', md`A plane wave in free space has
$$\tilde{\mathbf E} = 10e^{-j\beta z}\,\hat x + Be^{j\phi}e^{-j\beta z}\,\hat y\ \ \text{V/m}$$
where $B$ and $\phi$ are real and non-negative: $B \ge 0$ and $0 \le \phi < 2\pi$.

I. The wave is linearly polarized if $\phi = 0$, for any value of $B$.

II. The wave is linearly polarized if $\phi = \pi/2$, for any value of $B$.

III. The wave is linearly polarized if $B = 0$, for any value of $\phi$.`,
      ROMAN13, 3,
      [md`III is also true: with $B = 0$ only the $\hat x$ part is left, and one component is always linear.`,
        md`II is false: with $\phi = \pi/2$ and $B > 0$ the components are $90°$ apart, and the tip traces an ellipse.`,
        md`I is also true: in phase, the two components keep a fixed ratio.`, null,
        md`II fails for every $B > 0$.`,
        md`I and III are true.`],
      md`
        **What linear means.** The tip of $\mathbf E$ moves back and forth along one fixed line. That happens when the two components are in phase ($0°$) or opposite ($180°$), or when one of them is zero ([Topic 9](#/l/w3-pol)). At $z = 0$:
        $$\mathbf E(0, t) = 10\cos\omega t\,\hat x + B\cos(\omega t + \phi)\,\hat y$$
        **I.** $\phi = 0$: $\mathbf E = (10\hat x + B\hat y)\cos\omega t$, a fixed direction times one cosine. Linear for every $B$. **True.**

        **II.** $\phi = \pi/2$: $\mathbf E = 10\cos\omega t\,\hat x - B\sin\omega t\,\hat y$. For any $B > 0$ the tip goes around an ellipse (a circle if $B = 10$). Linear only when $B = 0$, so not "for any $B$". **False.**

        **III.** $B = 0$: only $10\cos\omega t\,\hat x$ is left. Linear whatever $\phi$ is. **True.**
        $$\boxed{\text{I and III only}}$$
        **Speed path.** Linear = same phase, opposite phase, or one component missing. Test each statement against that.

        **Where points go.** Treating "for any value of $B$" loosely in II: one counterexample ($B = 10$) makes it false.
      `),
    C3('iv', 'When is it right-hand circular?', md`The same plane wave as in (iii):

I. The wave is right circularly polarized if $\phi = 0$ and $B = 10$.

II. The wave is right circularly polarized if $\phi = \pi/2$ and $B = 10$.

III. The wave is right circularly polarized if $\phi = 3\pi/2$ and $B = 10$.`,
      ROMAN13, 2,
      [md`$\phi = 0$ puts the components in phase: that is linear, not circular.`,
        md`With $\phi = \pi/2$, $E_y$ **leads** $E_x$; lead × lag $= \hat y\times\hat x = -\hat z$, against the travel: left-hand.`, null,
        md`I is linear, not circular.`, md`I is linear and II is left-handed.`,
        md`III is right-handed.`],
      md`
        **Step 1: equal amplitudes.** $B = 10$ matches the $\hat x$ amplitude, so $\phi = \pm90°$ gives a circle and $\phi = 0$ gives a line. Statement I is out.

        **Step 2: the travel.** $e^{-j\beta z}$: toward $+\hat z$.

        **Step 3: φ = π/2.** $E_y = 10\cos(\omega t + 90°)$ leads $E_x$ by $90°$. Lead × lag:
        $$\hat y\times\hat x = -\hat z$$
        against the travel: **left**-hand. II is false.

        **Step 4: φ = 3π/2.** $\cos(\omega t + 270°) = \cos(\omega t - 90°) = \sin\omega t$, so at $z = 0$
        $$\mathbf E = 10\cos\omega t\,\hat x + 10\sin\omega t\,\hat y$$
        $E_y$ now lags. Lead × lag $= \hat x\times\hat y = +\hat z$, along the travel: **right**-hand. Check by watching it: at $t = 0$ it points along $\hat x$, a quarter period later along $\hat y$. Seen with the wave coming toward you, that is counterclockwise, the right-hand turn.

        [[fig:rot]]
        $$\boxed{\text{III only}}$$
        **Speed path.** $\phi = 3\pi/2$ is the same as $-\pi/2$: $\hat y$ lags. Lead × lag $= \hat x\times\hat y = \hat z$ = travel: right.

        **Where points go.** Reading $\phi = 3\pi/2$ as a lead (it is $270°$ ahead, which is $90°$ behind); forgetting to compare with the travel direction.
      `, { rot: { svg: rotFig({ alt: 'the x-y plane seen from +z (z out of the page): E points along +x at t = 0 and along +y a quarter period later, turning counterclockwise; the wave travels toward plus z, out of the page', h: '\\hat x', v: '\\hat y', out: true, travel: '\\text{travel } +\\hat z\\text{ (toward you)}' }), cap: md`$\phi = 3\pi/2$ seen from $+z$: the tip turns counterclockwise while the wave comes toward you. That is right-handed.` } }),
    C3('v', 'Z₀ is V/I for which wave?', md`Be sure to consider polarity in this question. The characteristic impedance $Z_0$ of a transmission line equals the ratio of the voltage to the current for the:

I. incident wave;

II. reflected wave;

III. sum of the incident and reflected waves.`,
      ROMAN, 0,
      [null, md`For the reflected wave $V^-/I^- = -Z_0$: the minus sign is the polarity the question warns about.`,
        md`The sum gives the line impedance $Z(d)$, which equals $Z_0$ only when there is no reflection.`,
        md`II has the wrong sign: $V^-/I^- = -Z_0$.`, md`Only I holds in general.`, md`I holds by definition.`],
      md`
        **Sign convention.** Current is counted positive toward the load ($+z$) in every wave.

        **I. Incident wave.** It carries power toward the load, so $V^+$ and $I^+$ have the same sign: $V^+/I^+ = Z_0$. This is the definition of $Z_0$. **True.**

        **II. Reflected wave.** It carries power back toward the generator, so $V^-I^- < 0$: its current flows toward $-z$ when its voltage is positive. $V^-/I^- = -Z_0$. **False** (that is the polarity).

        **III. Sum.** The ratio of total voltage to total current is the line impedance ([Topic 17](#/l/w6-vd)):
        $$Z(d) = Z_0\,\frac{1 + \Gamma(d)}{1 - \Gamma(d)}$$
        That equals $Z_0$ only when $\Gamma = 0$. **False** in general.
        $$\boxed{\text{I only}}$$
        **Speed path.** $Z_0$ belongs to one wave going toward the load. Everything else either flips the sign or mixes waves.

        **Where points go.** Choosing "I and II only" by forgetting the reflected wave's minus sign, exactly what the question warned about.
      `),
    C3('vi', 'The generalized reflection coefficient', md`For a single lossless transmission line terminated in an arbitrary load, the generalized reflection coefficient $\Gamma(d)$:

I. equals the ratio of the voltage phasor of the reflected wave to that of the incident wave, at every location along the line;

II. has constant magnitude along the line;

III. has constant phase along the line.`,
      ROMAN, 3,
      [md`II is also true: $|\Gamma(d)| = |\Gamma_L|$ because $|e^{-j2\beta d}| = 1$.`,
        md`I is also true; it is the definition of $\Gamma(d)$.`,
        md`III is false: the phase of $\Gamma(d)$ turns by $-2\beta d$.`, null,
        md`III fails: the phase changes by $-2\beta d$ along the line.`,
        md`I and II are true.`],
      md`
        **Definition** ([Topic 17](#/l/w6-vd)). At a distance $d$ back from the load, the incident wave is $V^+e^{j\beta d}$ and the reflected wave is $V^-e^{-j\beta d}$. Their ratio is
        $$\Gamma(d) = \frac{V^-e^{-j\beta d}}{V^+e^{j\beta d}} = \Gamma_Le^{-j2\beta d}$$
        **I.** That is exactly the definition. **True.**

        **II.** $|e^{-j2\beta d}| = 1$, so $|\Gamma(d)| = |\Gamma_L|$ everywhere. **True.**

        **III.** The phase is $\angle\Gamma_L - 2\beta d$, which changes with $d$: $\Gamma(d)$ goes around a circle as you move along the line. **False.**
        $$\boxed{\text{I and II only}}$$
        **Speed path.** $\Gamma(d) = \Gamma_Le^{-j2\beta d}$: size fixed, angle turning.

        **Where points go.** Choosing "I, II, and III" without checking III. On a lossy line II would fail too, but the course's lines are lossless.
      `),
    C3('vii', 'No reflection back to the source', md`Three lines are joined in series: $Z_{01}$ from $z = 0$ to $l/3$, $Z_{02}$ from $l/3$ to $2l/3$, and $Z_{03}$ from $2l/3$ to $l$, ending in a load $R_L$. What is the minimum necessary condition for no wave to be reflected back to the source?

[[fig:c3]]`,
      [md`$\Gamma_{12} = \dfrac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}} = 0$`, md`$\Gamma_{23} = \dfrac{Z_{03} - Z_{02}}{Z_{03} + Z_{02}} = 0$`, md`$\Gamma_{12} = 0$ and $\Gamma_{23} = 0$`, 'None of the above, because more conditions are needed'], 3,
      [md`Then the first junction passes the wave cleanly, but the second junction and the load can still reflect, and their echoes come straight back through the matched first junction.`,
        md`With $\Gamma_{12} \neq 0$ the very first wave already reflects at $z = l/3$.`,
        md`Both junctions matched still leaves the load: unless $R_L = Z_{03}$, the load reflects, and that wave runs all the way back to the source.`, null],
      md`
        **Follow one wave.** The source launches a wave into line 1.

        1. At $z = l/3$ it meets $Z_{02}$. If $\Gamma_{12} \neq 0$, part of it comes straight back. So we need $\Gamma_{12} = 0$.
        2. At $z = 2l/3$ it meets $Z_{03}$. If $\Gamma_{23} \neq 0$, part comes back, and with $\Gamma_{12} = 0$ it passes the first junction untouched on its way to the source. So we need $\Gamma_{23} = 0$.
        3. At $z = l$ it meets $R_L$. If $\Gamma_L = (R_L - Z_{03})/(R_L + Z_{03}) \neq 0$, part comes back, through both matched junctions, to the source. So we also need $\Gamma_L = 0$.

        All three: $Z_{01} = Z_{02} = Z_{03} = R_L$. The listed conditions all leave out at least the load:
        $$\boxed{\text{more conditions are needed}}$$
        **A note on sinusoids.** At a single frequency, a quarter-wave section can cancel the reflections even with $\Gamma_{12} \neq 0$ ([Topic 19](#/l/w6-qw)). For a general $f(t)$, as drawn, that does not work. Either way, the listed conditions are not enough.

        **Speed path.** "No reflection anywhere" means every boundary the wave meets is matched, and the load is a boundary too.

        **Where points go.** Choosing "$\Gamma_{12} = 0$ and $\Gamma_{23} = 0$" and forgetting the load.
      `, { c3: { svg: ckt3(), cap: md`Three lines of equal length; $\Gamma_{12}$ and $\Gamma_{23}$ are the right-going reflection coefficients at the two junctions.` } }),
    C3('viii', 'Current on a shorted line', md`A transmission line with characteristic impedance $Z_0$ is shorted at the load end. Assume $V^+$ is a nonzero constant. Then the current phasor along the line is:`,
      [md`$\tilde I(d) = \dfrac{V^+}{Z_0}e^{j\beta d}$`, md`$\tilde I(d) = \dfrac{V^+}{Z_0}e^{-j\beta d}$`, md`$\tilde I(d) = \dfrac{V^+}{Z_0}\left(e^{j\beta d} + e^{-j\beta d}\right)$`, md`$\tilde I(d) = \dfrac{V^+}{Z_0}\left(e^{j\beta d} - e^{-j\beta d}\right)$`, 'None of the above'], 2,
      [md`That is the incident wave alone. A short reflects everything ($\Gamma_L = -1$), so a reflected wave is there too.`,
        md`That is the reflected wave's current alone. The incident wave is there too.`, null,
        md`That is the voltage pattern divided by $Z_0$. The current has $-\Gamma_L = +1$ in front of the reflected term.`,
        md`The cosine form, $\tfrac{V^+}{Z_0}(e^{j\beta d} + e^{-j\beta d})$, is listed.`],
      md`
        **The formula sheet** ([Topic 17](#/l/w6-vd)):
        $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} - \Gamma_Le^{-j\beta d}\right)$$
        **A short.** $Z_L = 0$, so
        $$\Gamma_L = \frac{0 - Z_0}{0 + Z_0} = -1$$
        Then $-\Gamma_L = +1$:
        $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} + e^{-j\beta d}\right) = \frac{2V^+}{Z_0}\cos\beta d$$
        $$\boxed{\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} + e^{-j\beta d}\right)}$$
        **Check.** At the short ($d = 0$) the current is largest, $2V^+/Z_0$, and the voltage $V^+(1 + \Gamma_L) = 0$ ✓. A short doubles the current and kills the voltage.

        **Speed path.** Short: current doubles at the load, so the current is a cosine in $d$. Only the sum $e^{j\beta d} + e^{-j\beta d}$ is a cosine.

        **Where points go.** Picking the difference $e^{j\beta d} - e^{-j\beta d}$ by copying the voltage's sign pattern.
      `),
    C3('ix', 'A shorted line at twice its series resonance', md`A line of length $l$ is shorted at the load end. Its lowest series resonance frequency is $\omega_0$. At $\omega = 2\omega_0$, the input impedance $Z_{in} = Z(l)$ is:`,
      [md`$Z_{in} = 0$`, md`$Z_{in} = \infty$`, md`$Z_{in}$ is inductive`, md`$Z_{in}$ is capacitive`, 'None of the above'], 0,
      [null, md`$Z_{in} = \infty$ needs $\beta l = \pi/2, 3\pi/2, \ldots$ (an odd number of quarter waves). At $2\omega_0$, $\beta l = 2\pi$.`,
        md`Inductive needs $\tan\beta l > 0$. At $2\omega_0$, $\tan2\pi = 0$ exactly.`,
        md`Capacitive needs $\tan\beta l < 0$. At $2\omega_0$, $\tan2\pi = 0$ exactly.`, md`$Z_{in} = 0$ is listed, and it is what happens at $\beta l = 2\pi$.`],
      md`
        **The impedance of a shorted line** ([Topic 18](#/l/w6-stubs)). Put $Z_L = 0$ in the line-impedance formula:
        $$Z_{in} = jZ_0\tan\beta l$$
        **Series resonance** means $Z_{in} = 0$, like a series LC at resonance: $\tan\beta l = 0$, so $\beta l = \pi, 2\pi, \ldots$. ($\beta l = 0$ is DC, not a resonance.) The lowest is
        $$\beta l = \pi\quad(l = \lambda/2),\qquad \omega_0 = \frac{\pi v}{l}$$
        **At 2ω₀.** $\beta = \omega/v$ is proportional to $\omega$, so $\beta l$ doubles to $2\pi$, and $\tan2\pi = 0$:
        $$\boxed{Z_{in} = 0}$$
        **Speed path.** Shorted line: $Z_{in} = 0$ at every whole number of half waves. Doubling the frequency doubles the number of half waves: still a whole number.

        **Where points go.** Taking $\omega_0$ to be the quarter-wave frequency. For a shorted line, $l = \lambda/4$ is a **parallel** resonance ($Z_{in} = \infty$).
      `),
    C3('x', 'The same line at half its series resonance', md`The same shorted line of length $l$, with lowest series resonance $\omega_0$. At $\omega = \tfrac12\omega_0$, the input impedance $Z_{in} = Z(l)$ is:`,
      [md`$Z_{in} = 0$`, md`$Z_{in} = \infty$`, md`$Z_{in}$ is inductive`, md`$Z_{in}$ is capacitive`, 'None of the above'], 1,
      [md`$Z_{in} = 0$ happens at $\omega_0$ and $2\omega_0$ ($\beta l = \pi, 2\pi$). At $\omega_0/2$, $\beta l = \pi/2$.`, null,
        md`A shorted line is inductive for $\beta l$ a little below $\pi/2$. At exactly $\pi/2$ the tangent blows up.`,
        md`Capacitive is $\beta l$ between $\pi/2$ and $\pi$.`, md`$Z_{in} = \infty$ is listed, and it is what happens at $\beta l = \pi/2$.`],
      md`
        **From (ix):** $\omega_0$ has $\beta l = \pi$. Halving the frequency halves $\beta l$:
        $$\beta l = \frac{\pi}{2}\qquad(l = \lambda/4)$$
        $\tan(\pi/2)$ is infinite, so $Z_{in} = jZ_0\tan\beta l = \infty$:
        $$\boxed{Z_{in} = \infty}$$
        **The picture.** A quarter-wave line turns its short into an open: a parallel resonance. Below it ($0 < \beta l < \pi/2$) the shorted line is inductive; between $\pi/2$ and $\pi$ it is capacitive; at $\pi$ it is a short again.

        **Speed path.** Shorted line: half waves give 0, odd quarter waves give $\infty$.

        **Where points go.** Choosing "inductive" because a short stub below a quarter wave is inductive; at exactly a quarter wave it is an open.
      `),

    // ------------------------------------------------------------ Problem 2
    RF(md`
      ### Problem 2 (20 points): a wave entering a dielectric

      The region $y < 0$ is free space, and the region $y > 0$ is a perfect dielectric with $\mu = \mu_0$. A wave traveling toward $+y$ in $y < 0$ is incident on the interface. The transmitted electric field phasor is
      $$\tilde{\mathbf E}_t = 10e^{-j12y}\,\hat z\ \ \text{V/m}$$
      at $\omega = 3\times10^9$ rad/s. A useful identity for this problem is $\eta\gamma = j\omega\mu$.

      [[fig:intf]]
    `, { intf: { svg: intfFig(), cap: md`Sketch added here; the paper has no figure. The arrows show the direction of travel; every $\mathbf E$ points along $\hat z$ (up), and $\hat x$ points out of the page.` } }),
    P({ src: 'Spring 2018 #2(a) · 4 pts', title: 'γ in free space',
      q: md`What is the propagation constant $\gamma_{\text{fs}}$ of the waves in the free-space region ($y < 0$)? Free space is lossless, so $\gamma_{\text{fs}} = j\beta_1$: enter $\beta_1$.`,
      parts: [NT('\\beta_1', 10, 'rad/m', [[12, 'That is β in the dielectric, read off the transmitted wave. Free space has β = ω/c.'], [20 * PI, 'ω is already in rad/s: β = ω/c with no 2π.']])],
      hints: [md`In free space $\beta = \omega/c$.`],
      sol: md`
        **Free space is lossless**, so $\alpha = 0$ and $\gamma = j\beta$, with the familiar $\beta = \omega\sqrt{\mu_0\epsilon_0} = \omega/c$:
        $$\beta_1 = \frac{3\times10^9}{3\times10^8} = 10\ \text{rad/m}$$
        $$\boxed{\gamma_{\text{fs}} = j10\ \text{m}^{-1}}$$
        **Check.** $\lambda = 2\pi/10 = 0.628$ m and $f = \omega/2\pi = 477$ MHz; $f\lambda = 3\times10^8$ m/s ✓.

        **Speed path.** $\omega/c$ with clean powers of ten: 10.

        **Where points go.** Writing $\gamma = 10$ (no $j$: a wave that only decays) or using the dielectric's 12.
      ` }),
    P({ src: 'Spring 2018 #2(b) · 2 pts', title: 'γ in the dielectric',
      q: md`What is $\gamma_t$, the propagation constant of the transmitted wave in $y > 0$? Write $\gamma_t = j\beta_2$ and enter $\beta_2$.`,
      parts: [NT('\\beta_2', 12, 'rad/m', [[10, 'That is free space. The transmitted wave is in the dielectric: read its exponent.']])],
      sol: md`
        **Read the exponent.** A wave traveling toward $+y$ is $E_0e^{-\gamma y}$. The transmitted wave has $e^{-j12y}$, so
        $$\boxed{\gamma_t = j12\ \text{m}^{-1}}$$
        No real part: a perfect dielectric does not absorb ✓.

        **What it tells you.** $\beta_2/\beta_1 = 12/10 = 1.2 = \sqrt{\epsilon_r}$, so $\epsilon_r = 1.44$ and the wave is 1.2 times slower inside.

        **Speed path.** Copy the exponent.

        **Where points go.** Dropping the $j$.
      ` }),
    P({ src: 'Spring 2018 #2(c) · 4 pts', title: 'η in the dielectric',
      q: md`What is $\eta_t$, the intrinsic impedance in the transmitted region ($y > 0$)?`,
      parts: [NT('\\eta_t', 100 * PI, 'Ω', [[144 * PI, 'That multiplies η0 by β2/β1. A slower medium has a lower η: divide.'], [120 * PI / 1.44, 'That divides η0 by ε_r. η goes as 1/√ε_r.'], [120 * PI, 'That is free space.']])],
      hints: [md`$\eta = j\omega\mu/\gamma$, from the identity the paper gives.`],
      sol: md`
        **The identity.** $\eta\gamma = j\omega\mu$, so $\eta = j\omega\mu/\gamma$. With $\mu = \mu_0$ and $\gamma_t = j12$:
        $$\eta_t = \frac{j\omega\mu_0}{j12} = \frac{\omega\mu_0}{12}$$
        **Compute ωμ₀.**
        $$\omega\mu_0 = (3\times10^9)(4\pi\times10^{-7}) = 1200\pi$$
        **Divide.**
        $$\boxed{\eta_t = \frac{1200\pi}{12} = 100\pi \approx 314\ \Omega}$$
        **Check.** $\eta_0/\sqrt{\epsilon_r} = 120\pi/1.2 = 100\pi$ ✓. The $j$'s cancel, so $\eta_t$ is real, as it must be in a lossless medium.

        **Speed path.** Same $\mu$ in both regions, so $\eta \propto 1/\beta$: $\eta_t = 120\pi\cdot\tfrac{10}{12} = 100\pi$.

        **Where points go.** Multiplying by $12/10$ instead of dividing.
      ` }),
    P({ src: 'Spring 2018 #2(d) · 4 pts', title: 'Reflection and transmission coefficients',
      q: md`What are the electric field reflection and transmission coefficients $\Gamma$ and $\tau$ for the wave from the region $y < 0$ as it hits the interface at $y = 0$?`,
      parts: [
        NT('\\Gamma', -1 / 11, '', [[1 / 11, 'Upside down: Γ = (η2 − η1)/(η2 + η1), with η2 the medium the wave enters.'], [-1 / 6, 'That divides by 120π. The denominator is the sum of the two impedances, 220π.']]),
        NT('\\tau', 10 / 11, '', [[12 / 11, 'That is 2η1/(η1 + η2), with the impedances swapped. τ = 2η2/(η1 + η2).'], [1 / 11, 'That is |Γ|. τ = 1 + Γ.']]),
      ],
      hints: [md`$\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$ with $\eta_1 = 120\pi$ and $\eta_2 = 100\pi$; then $\tau = 1 + \Gamma$.`],
      sol: md`
        **Reflection.** The wave comes from medium 1 ($\eta_1 = \eta_0 = 120\pi$) and meets medium 2 ($\eta_2 = 100\pi$), which acts as its load ([Topic 11](#/l/w4-gamma)):
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1} = \frac{100\pi - 120\pi}{220\pi}$$
        The $\pi$'s cancel:
        $$\boxed{\Gamma = -\frac{20}{220} = -\frac{1}{11}}$$
        **Transmission.** Here $\tau$ is the transmission coefficient. $\mathbf E$ tangent to the interface is continuous, so incident plus reflected equals transmitted at $y = 0$: $1 + \Gamma = \tau$.
        $$\boxed{\tau = 1 - \frac{1}{11} = \frac{10}{11}}$$
        **Check.** $2\eta_2/(\eta_1 + \eta_2) = 200\pi/220\pi = 10/11$ ✓. $\Gamma < 0$ because the dielectric has the lower impedance, like a line ending in a load smaller than $Z_0$.

        **Speed path.** Divide out the $\pi$'s first: impedances 120 and 100. $\Gamma = -20/220$.

        **Where points go.** Swapping $\eta_1$ and $\eta_2$; writing $\tau = 1 - \Gamma$.
      ` }),
    P({ src: 'Spring 2018 #2(e) · 6 pts', title: 'Incident and reflected fields',
      q: md`Find the incident and reflected electric field phasors in the region $y < 0$, with directions. Enter the amplitudes along $+\hat z$ (with their signs) and choose the reflected wave's spatial factor.`,
      parts: [
        NT('E_{i0}\\ \\text{(incident amplitude)}', 11, 'V/m', [[10, 'That is the transmitted amplitude. E_t = τE_i, so E_i = E_t/τ.'], [100 / 11, 'That multiplies by τ instead of dividing.']]),
        NT('E_{r0}\\ \\text{(reflected amplitude, signed)}', -1, 'V/m', [[-10 / 11, 'That is Γ times E_t. The reflected wave is Γ times the incident wave.'], [1, 'Γ is negative, so the reflected field points along −z where the incident one points along +z.']]),
        CH(md`The reflected wave's dependence on $y$ is`, [md`$e^{+j10y}$`, md`$e^{-j10y}$`, md`$e^{+j12y}$`, md`$e^{-j12y}$`], 0,
          [null, md`That travels toward $+y$, back into the interface. A reflected wave travels toward $-y$.`, md`The reflected wave lives in free space, where $\beta = 10$, not 12.`, md`That is the transmitted wave's factor.`]),
      ],
      hints: [md`At $y = 0$: $E_t = \tau E_i$ and $E_r = \Gamma E_i$.`, md`In free space $\beta = 10$; toward $+y$ is $e^{-j10y}$, toward $-y$ is $e^{+j10y}$.`],
      sol: md`
        **Step 1: the incident amplitude.** At the interface the transmitted field is $\tau$ times the incident field:
        $$E_{i0} = \frac{E_{t0}}{\tau} = \frac{10}{10/11} = 11\ \text{V/m}$$
        **Step 2: the reflected amplitude.**
        $$E_{r0} = \Gamma E_{i0} = -\frac{1}{11}\cdot11 = -1\ \text{V/m}$$
        **Step 3: the phasors.** The incident wave travels toward $+y$ in free space ($e^{-j10y}$); the reflected one toward $-y$ ($e^{+j10y}$). At normal incidence both stay along $\hat z$:
        $$\boxed{\tilde{\mathbf E}_i = 11e^{-j10y}\,\hat z\ \ \text{V/m}}$$
        $$\boxed{\tilde{\mathbf E}_r = -e^{+j10y}\,\hat z\ \ \text{V/m}}$$
        **Check 1: E is continuous** at $y = 0$: $11 + (-1) = 10$ ✓.

        **Check 2: H is continuous.** For $\mathbf E$ along $\hat z$ and travel along $+\hat y$, $\hat z\times\hat x = \hat y$ puts $\mathbf H$ along $+\hat x$ with $H_x = E/\eta$; a wave toward $-y$ has $H_x = -E/\eta$. At $y = 0$:
        $$\frac{11}{120\pi} - \frac{-1}{120\pi} = \frac{12}{120\pi} = \frac{1}{10\pi}$$
        and the transmitted $H_x = 10/(100\pi) = 1/(10\pi)$ ✓.

        **Check 3: power.** In units of $1/(240\pi)$ W/m²: incident $11^2 = 121$, reflected $1$, transmitted $100\cdot\tfrac{120}{100} = 120$. $121 - 1 = 120$ ✓.

        **Speed path.** $E_i = E_t/\tau$, $E_r = \Gamma E_i$, then flip the sign of the exponent for the reflected wave.

        **Where points go.** Using $\beta = 12$ in free space; keeping $e^{-j\beta y}$ for the reflected wave; multiplying by $\tau$ instead of dividing.
      ` }),

    // ------------------------------------------------------------ Problem 3
    RF(md`
      ### Problem 3 (30 points): a bounce diagram on one line

      A transmission line has characteristic impedance $Z_0 = 50\ \Omega$, length $l = 15$ cm and propagation speed $v_p = \tfrac23c$. A voltage source with internal resistance $R_g = 30\ \Omega$ is connected at the $z = 0$ end, and a load resistance $R_L = 150\ \Omega$ terminates the line at $z = l$.

      [[fig:c18]]
    `, { c18: { svg: ckt18(), cap: md`The source is $V_g = 10u(t)$ V from part (b) on.` } }),
    P({ src: 'Spring 2018 #3(a) · 6 pts', title: 'The three coefficients',
      q: md`Calculate the injection coefficient $\tau_g$, the source reflection coefficient $\Gamma_s$ and the load reflection coefficient $\Gamma_L$.`,
      parts: [
        NT('\\tau_g', 5 / 8, '', [[3 / 8, 'That is R_g/(R_g + Z0). The line takes the share Z0/(R_g + Z0).'], [1 / 4, 'That is |Γ_s|. The injection coefficient is a voltage-divider ratio.']]),
        NT('\\Gamma_s', -1 / 4, '', [[1 / 4, 'Upside down: (R_g − Z0)/(R_g + Z0). R_g < Z0 makes it negative.']]),
        NT('\\Gamma_L', 1 / 2, '', [[-1 / 2, 'Upside down: (R_L − Z0)/(R_L + Z0).']]),
      ],
      hints: [md`At $t = 0^+$ the line looks like a resistor $Z_0$ to the source.`, md`A returning wave sees only $R_g$ at the source end.`],
      sol: md`
        **Step 1: the injection coefficient.** At $t = 0^+$ the step has just started and nothing has come back from the load. The line's input looks exactly like a resistor $Z_0$ (that is what $Z_0$ means: $V^+/I^+$). So $R_g$ and $Z_0$ form a voltage divider, and the share of the source voltage launched onto the line is
        $$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac{50}{80}$$
        $$\boxed{\tau_g = \tfrac58}$$
        **Step 2: the source end.** A wave coming back to $z = 0$ meets $R_g$ in series with the source. The source holds a constant voltage after $t = 0$, so it adds nothing to a returning wave: for reflections it acts as a short, and the wave sees only $R_g$:
        $$\Gamma_s = \frac{R_g - Z_0}{R_g + Z_0} = \frac{30 - 50}{80}$$
        $$\boxed{\Gamma_s = -\tfrac14}$$
        **Step 3: the load.**
        $$\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0} = \frac{150 - 50}{200}$$
        $$\boxed{\Gamma_L = \tfrac12}$$

        !!intuition Does this make sense?
          $R_g < Z_0$ is closer to a short, so $\Gamma_s < 0$; $R_L > Z_0$ is closer to an open, so $\Gamma_L > 0$. The paper's $\Gamma_s$ is what the course calls $\Gamma_g$.

        **Speed path.** Three one-line fractions: $50/80$, $-20/80$, $100/200$.

        **Where points go.** $R_g/(R_g + Z_0)$ for $\tau_g$; sign errors from writing $Z_0 - R$ on top.
      ` }),
    P({ src: 'Spring 2018 #3(b) · 12 pts', title: 'Voltage and current bounce diagrams',
      q: md`Construct the bounce diagrams for voltage and for current, given $V_g = 10u(t)$ V, from $t = 0$ to $t = 3$ ns. Label the wave amplitude on each bounce. Then enter these values from your diagrams.`,
      parts: [
        NT('T\\ \\text{(one-way travel time)}', 0.75, 'ns', [[0.5, 'That uses c. The line has v_p = 2c/3 = 20 cm/ns.'], [1.5, 'That is the round trip, 2T.']]),
        NT('V_1^+', 6.25, 'V', [[10, 'That is the whole source. R_g takes part of it: V = τ_g·10.'], [3.75, 'That uses R_g/(R_g + Z0).']]),
        NT('I_1^+', 0.125, 'A', [[1 / 18, 'That is the final DC current. The first wave carries V1+/Z0.']]),
        NT('V_1^-\\ \\text{(reflected at the load)}', 3.125, 'V', [[-3.125, 'Γ_L = +1/2: the voltage reflects with the same sign.']]),
        NT('I_1^-', -0.0625, 'A', [[0.0625, 'A left-going wave has I = −V/Z0: its current reflects with −Γ_L.']]),
        NT('V_2^+\\ \\text{(reflected at the source)}', -25 / 32, 'V', [[25 / 32, 'Γ_s = −1/4: the sign flips at the source.'], [-1.5625, 'That multiplies the original 6.25 V by Γ_s. Reflect the wave that arrives, 3.125 V.']]),
        NT('I_2^+', -1 / 64, 'A', [[1 / 64, 'A right-going wave has I = +V/Z0, and V2+ is negative.']]),
      ],
      hints: [md`$T = l/v_p$ with $v_p = 2\times10^8$ m/s $= 20$ cm/ns.`, md`Each new voltage label is the previous one times $\Gamma_L = \tfrac12$ or $\Gamma_s = -\tfrac14$. Each current label is $\pm V/Z_0$: plus going right, minus going left.`],
      figs: { bd: { svg: PF.row([{ svg: TL.diagram(s18, Object.assign({ w: 360, h: 380 }, nsc)), cap: 'Voltage (V)' }, { svg: TL.diagram(s18, Object.assign({ w: 360, h: 380, qty: 'I' }, nsc)), cap: md`Current (A): $\Gamma$ for current is $-\Gamma$ for voltage` }]).svg, cap: '' } },
      sol: md`
        **Step 0: the travel time.** $v_p = \tfrac23c = 2\times10^8$ m/s $= 20$ cm/ns, so
        $$T = \frac{15\ \text{cm}}{20\ \text{cm/ns}} = 0.75\ \text{ns}$$
        **Step 1: the first wave, t = 0.** Launched with $\tau_g$:
        $$V_1^+ = \tfrac58\cdot10 = 6.25\ \text{V}$$
        Its current is $V/Z_0$ (a right-going wave):
        $$I_1^+ = \frac{6.25}{50} = 0.125\ \text{A}$$
        **Step 2: the load, t = 0.75 ns.** $V_1^- = \Gamma_LV_1^+ = \tfrac12\cdot6.25 = 3.125$ V. A left-going wave has $I = -V/Z_0$:
        $$I_1^- = -\frac{3.125}{50} = -0.0625\ \text{A}$$
        So the current reflects with $-\Gamma_L = -\tfrac12$.

        **Step 3: the source, t = 1.5 ns.** $V_2^+ = \Gamma_sV_1^- = -\tfrac14\cdot3.125$:
        $$V_2^+ = -0.78125\ \text{V} = -\tfrac{25}{32}\ \text{V}$$
        $$I_2^+ = \frac{V_2^+}{Z_0} = -\tfrac{1}{64}\ \text{A} \approx -0.0156\ \text{A}$$
        **Step 4: the load, t = 2.25 ns.** $V_2^- = \tfrac12\cdot\left(-\tfrac{25}{32}\right) = -\tfrac{25}{64}$ V, with $I_2^- = +\tfrac{1}{128}$ A. It reaches the source at 3 ns, the end of the grid.

        [[fig:bd]]

        | t (ns) | Event | Voltage wave | Current wave |
        |---|---|---|---|
        | 0 | launch | $\tfrac{25}{4}$ V | $\tfrac18$ A |
        | 0.75 | load reflects | $\tfrac{25}{8}$ V | $-\tfrac{1}{16}$ A |
        | 1.5 | source reflects | $-\tfrac{25}{32}$ V | $-\tfrac{1}{64}$ A |
        | 2.25 | load reflects | $-\tfrac{25}{64}$ V | $\tfrac{1}{128}$ A |

        **Check: the final values.** DC steady state: $V = 10\cdot\tfrac{150}{180} = \tfrac{25}{3}$ V and $I = \tfrac{10}{180} = \tfrac{1}{18}$ A. At the load the voltage series is $6.25\cdot\tfrac32$ times $1 - \tfrac18 + \tfrac{1}{64} - \cdots$ (ratio $\Gamma_L\Gamma_s = -\tfrac18$ per round trip):
        $$9.375\cdot\frac{1}{1 + 1/8} = 9.375\cdot\frac89 = 8.33\ \text{V}\ ✓$$
        **Speed path.** Write $T$, $\tau_g$, $\Gamma_s$, $\Gamma_L$ on top. Voltage labels: multiply by $\tfrac12$, then $-\tfrac14$, alternately. Current labels: divide each voltage by 50, minus sign for every left-going line.

        **Where points go.** Using $\Gamma_L$ for the current (the current diagram needs $-\Gamma$); the time axis with $c$ instead of $\tfrac23c$; forgetting labels.
      ` }),
    P({ src: 'Spring 2018 #3(c) · 6 pts', title: 'Voltage at the source end',
      q: md`Plot the voltage at the source end ($z = 0$) from $t = 0$ to $t = 2.0$ ns, with numbers on the vertical axis. Then enter values from your plot.`,
      parts: [
        NT('V(0, 1\\ \\text{ns})', 6.25, 'V', [[10, 'That is the source voltage. The line takes only τ_g of it.']]),
        NT('V(0, 1.75\\ \\text{ns})', 275 / 32, 'V', [[9.375, 'That adds only the wave returning from the load. At the source the re-reflected wave (−0.78 V) starts at the same instant: add both.'], [25 / 3, 'That is the final DC value, reached only after many more bounces.']]),
        NT('\\text{time of the jump at}\\ z = 0', 1.5, 'ns', [[0.75, 'That is when the first wave reaches the load. Its echo needs another 0.75 ns to come back.']]),
      ],
      hints: [md`At $z = 0$, add every wave that has started or arrived there. The echo from the load arrives at $2T$.`],
      figs: { v0: { svg: TL.plotT(s18, 0, Object.assign({ tMax: 2, w: 380 }, nsc)), cap: md`$V(0, t)$: $\tfrac{25}{4}$ V until 1.5 ns, then $\tfrac{275}{32} \approx 8.59$ V. The dashed line is the final value, $\tfrac{25}{3}$ V.` } },
      sol: md`
        **Read the diagram at z = 0.** The voltage there is the sum of all waves that have reached $z = 0$ (or left it).

        **For 0 < t < 1.5 ns:** only the launched wave:
        $$V(0, t) = 6.25\ \text{V}$$
        **At t = 1.5 ns** two waves meet the source at once: the returning $3.125$ V wave arrives, and the re-reflected $-0.78125$ V wave leaves. Both count:
        $$V = 6.25 + 3.125 - 0.78125$$
        $$V(0, t) = 8.59375\ \text{V} = \tfrac{275}{32}\ \text{V}$$
        Nothing else reaches $z = 0$ before 3 ns, so this holds to the end of the window.
        $$\boxed{V(0, t) = 6.25\ \text{V},\ \ t < 1.5\ \text{ns}}$$
        $$\boxed{V(0, t) = 8.59\ \text{V},\ \ t > 1.5\ \text{ns}}$$

        [[fig:v0]]

        **Check with the circuit.** For $1.5 < t < 3$ ns the current at the source end is $\tfrac18 - \tfrac{1}{16} - \tfrac{1}{64} = \tfrac{3}{64}$ A. KVL around the source: $10 - 30\cdot\tfrac{3}{64} = 10 - \tfrac{90}{64} = \tfrac{550}{64} = 8.594$ V ✓.

        **Speed path.** At the source end the jump is $(1 + \Gamma_s)$ times the arriving wave: $\tfrac34\cdot3.125 = 2.344$ V, on top of 6.25 V.

        **Where points go.** Adding only the arriving wave (9.375 V); putting the jump at 0.75 ns.
      ` }),
    P({ src: 'Spring 2018 #3(d) · 6 pts', title: 'Voltage at the load end',
      q: md`Plot the voltage at the load end ($z = l$) from $t = 0$ to $t = 2.0$ ns, with numbers on the vertical axis. Then enter values from your plot.`,
      parts: [
        NT('\\text{time the load voltage first changes}', 0.75, 'ns', [[1.5, 'That is the round trip. The front needs only one trip, T, to reach the load.']]),
        NT('V(l, 1.5\\ \\text{ns})', 9.375, 'V', [[6.25, 'That is the incident wave alone. At the load the reflected wave appears at the same instant: (1 + Γ_L)·6.25.'], [25 / 3, 'That is the final DC value, reached only after many bounces.']]),
      ],
      hints: [md`At the load the incident and reflected waves appear together: the jump is $(1 + \Gamma_L)$ times the arriving wave.`],
      figs: { vl: { svg: TL.plotT(s18, 15, Object.assign({ tMax: 2, w: 380 }, nsc)), cap: md`$V(l, t)$: zero until 0.75 ns, then $\tfrac{75}{8} = 9.375$ V. The next change comes at 2.25 ns, after the window.` } },
      sol: md`
        **Before 0.75 ns** the front has not arrived: $V(l, t) = 0$.

        **At 0.75 ns** the incident wave arrives and the reflected wave leaves at the same instant:
        $$V = (1 + \Gamma_L)V_1^+ = \tfrac32\cdot6.25$$
        $$\boxed{V(l, t) = \tfrac{75}{8} = 9.375\ \text{V}}$$
        for $0.75 < t < 2.25$ ns. The next wave reaches the load at 2.25 ns, after the window, so the plot is flat to 2 ns.

        [[fig:vl]]

        **Check with Ohm's law.** The load current is $\tfrac18 - \tfrac{1}{16} = \tfrac{1}{16}$ A, and $R_LI = 150/16 = 9.375$ V ✓.

        !!intuition Does this make sense?
          The load voltage overshoots its final $8.33$ V. $\Gamma_L > 0$ piles voltage up at the nearly-open load; $\Gamma_s < 0$ then sends a negative correction. The load voltage rings around $\tfrac{25}{3}$ V and settles.

        **Speed path.** Load jump $= (1 + \Gamma_L)\times$ arriving wave, at $t = T$.

        **Where points go.** Plotting 6.25 V (incident only) or the DC value at 0.75 ns.
      ` }),

    // ------------------------------------------------------------ Problem 4
    RF(md`
      ### Problem 4 (20 points): the input circuit of a line

      A line segment has propagation velocity $v = 200$ m/µs, characteristic impedance $Z_0 = 50\ \Omega$ and length $l = 50$ m, and is terminated by a load $Z_L$. The segment is connected **in series** with a resistor $R = 50\ \Omega$ and a sinusoidal voltage source with phasor $\tilde V = 2\angle0°$ V.

      [[fig:c4]]
    `, { c4: { svg: ckt4(), cap: md`$\tilde V_{in}$ is across the line input and $\tilde V_L$ across the load.` } }),
    P({ src: 'Spring 2018 #4(a) · 10 pts', title: 'Zero current through R',
      q: md`If $Z_L = 0$ and the current through the resistor $R$ is found to be zero, find all the possible wavelengths $\lambda$ for the system.`,
      parts: [
        NT('\\text{the longest}\\ \\lambda', 200, 'm', [[100, 'That is l = λ/2. A shorted half-wave line has Z_in = 0: the current would be largest, not zero.'], [50, 'That is l = λ: Z_in = 0 there too.']]),
        NT('\\text{the next longest}\\ \\lambda', 200 / 3, 'm', [[100, 'That is l = λ/2, where the shorted line is a short. The next open is l = 3λ/4.'], [40, 'That is the third one, l = 5λ/4.']]),
        X(md`every possible $\lambda_n$ in m, $n = 0, 1, 2, \ldots$ (use n)`, '200/(2*n+1)', { n: [0, 6] }),
      ],
      hints: [md`Zero current through $R$ means zero current into the line: $Z_{in} = \infty$.`, md`A shorted line has $Z_{in} = jZ_0\tan\beta l$. When is it infinite?`],
      sol: md`
        **Step 1: what zero current means.** $R$, the source and the line input are in series, so zero current through $R$ means zero current into the line: $\tilde I_{in} = 0$. The input voltage is then $\tilde V_{in} = \tilde V - R\tilde I_{in} = 2$ V, not zero. So
        $$Z_{in} = \frac{\tilde V_{in}}{\tilde I_{in}} = \infty$$
        **Step 2: the input impedance of a shorted line.** The line-impedance formula ([Topic 17](#/l/w6-vd)) is
        $$Z(d) = Z_0\,\frac{Z_L + jZ_0\tan\beta d}{Z_0 + jZ_L\tan\beta d}$$
        With $Z_L = 0$ the $Z_0$'s cancel:
        $$Z_{in} = jZ_0\tan\beta l$$
        **Step 3: when is it infinite?** $\tan\beta l = \infty$ at
        $$\beta l = \frac{\pi}{2},\ \frac{3\pi}{2},\ \frac{5\pi}{2},\ \ldots$$
        With $\beta = 2\pi/\lambda$, that is $l = \lambda/4, 3\lambda/4, 5\lambda/4, \ldots$:
        $$l = (2n + 1)\frac{\lambda}{4}$$
        **Step 4: solve for λ.**
        $$\lambda = \frac{4l}{2n + 1}$$
        $$\boxed{\lambda_n = \frac{200}{2n + 1}\ \text{m}}$$
        That is $200$ m, $66.7$ m, $40$ m, $28.6$ m, …, at $f = v/\lambda = 1, 3, 5, 7, \ldots$ MHz.

        !!intuition Does this make sense?
          An odd number of quarter waves turns the short at the load into an open at the input: the parallel resonance of the stub ([Topic 18](#/l/w6-stubs)). The source then sees an open circuit, no current flows through $R$, and the full 2 V sits across the line input while the line rings.

        **Speed path.** Zero current means $Z_{in} = \infty$; a shorted line is open at odd quarter waves: $\lambda = 4l/(2n + 1)$.

        **Where points go.** Using half waves ($\lambda = 2l/n$), which give $Z_{in} = 0$, the opposite; giving only the longest $\lambda$ when the paper asks for all.
      ` }),
    P({ src: 'Spring 2018 #4(b) · 10 pts', title: 'A quarter-wave section',
      q: md`If instead $Z_L = 100\ \Omega$, and the source frequency makes $l = \lambda/4$, find the impedance $Z_{in}$ and the voltage phasor $\tilde V_{in}$ at the input of the line. (The current through the resistor is not specified for this part.)`,
      parts: [
        NT('Z_{in}', 25, 'Ω', [[100, 'That is Z_L itself. A quarter-wave line inverts: Z_in = Z0²/Z_L.'], [50, 'That is Z0. Only a matched load gives Z_in = Z0.'], [200, 'That is Z_L²/Z0, upside down. Z_in = Z0²/Z_L.']]),
        NT('\\tilde V_{in}\\ \\text{(its phase is}\\ 0°)', 2 / 3, 'V', [[4 / 3, 'That puts Z_L = 100 Ω in the divider. The source sees Z_in, not Z_L.'], [1, 'That puts Z0 = 50 Ω in the divider. The source sees Z_in = 25 Ω.'], [2, 'That is the source voltage. R takes a share.']]),
      ],
      hints: [md`At $\beta l = \pi/2$ the line-impedance formula gives $Z_{in} = Z_0^2/Z_L$.`, md`Then the input circuit is a divider: $\tilde V$, $R$ and $Z_{in}$ in series.`],
      sol: md`
        **Step 1: the input impedance of a quarter-wave line.** Start from the line-impedance formula and divide top and bottom by $\tan\beta l$:
        $$Z_{in} = Z_0\,\frac{Z_L/\tan\beta l + jZ_0}{Z_0/\tan\beta l + jZ_L}$$
        At $l = \lambda/4$, $\beta l = \pi/2$ and $\tan\beta l \to \infty$, so the terms divided by it vanish:
        $$Z_{in} = Z_0\,\frac{jZ_0}{jZ_L} = \frac{Z_0^2}{Z_L}$$
        **Numbers.**
        $$\boxed{Z_{in} = \frac{50^2}{100} = 25\ \Omega}$$
        **Step 2: the input circuit** ([Topic 19](#/l/w6-qw)). As seen from the source, the whole line and load are just $Z_{in}$. So the circuit is $\tilde V$, $R$ and $Z_{in}$ in series, a voltage divider:
        $$\tilde V_{in} = \tilde V\,\frac{Z_{in}}{R + Z_{in}} = 2\cdot\frac{25}{75}$$
        $$\boxed{\tilde V_{in} = \tfrac23\angle0°\ \text{V}}$$
        **Check: power.** The current into the line is
        $$\tilde I_{in} = \frac{\tilde V}{R + Z_{in}} = \frac{2}{75}\ \text{A}$$
        so the power into the line is
        $$\tfrac12|\tilde I_{in}|^2Z_{in} = \tfrac12\cdot\tfrac{4}{5625}\cdot25 \approx 8.9\ \text{mW}$$
        Now the load. $\Gamma_L = \tfrac{100 - 50}{150} = \tfrac13$. At $d = \lambda/4$, $e^{j\beta d} = j$ and $e^{-j\beta d} = -j$, so the formula sheet's $\tilde V(d)$ gives
        $$\tilde V_{in} = V^+\left(j - \tfrac{j}{3}\right) = \tfrac{2j}{3}V^+$$
        With $\tilde V_{in} = \tfrac23$ V, that makes $V^+ = -j$ V. At the load ($d = 0$):
        $$|\tilde V_L| = |V^+|\left(1 + \tfrac13\right) = \tfrac43\ \text{V}$$
        The load absorbs
        $$\frac{|\tilde V_L|^2}{2Z_L} = \frac{16/9}{200} \approx 8.9\ \text{mW}$$
        The lossless line delivers everything it takes in ✓.

        **Speed path.** Quarter wave: $Z_{in} = Z_0^2/Z_L$. Then a two-resistor divider.

        **Where points go.** Putting $Z_L$ or $Z_0$ into the divider; inverting the quarter-wave formula.
      ` }),
  ];

  EM.lesson('e3-past', { id: 'e3-past-sp18', order: 4, title: 'Spring 2018 Exam 3', kind: 'exam', sub: 'He, Goddard, Ilie · 4 problems, 100 pts · solved here · ten concept questions, an interface, a bounce, a quarter-wave section', steps: sp18 });
})();

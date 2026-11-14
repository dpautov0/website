/* Exam 3 practice exams A, B, C (unit e3-prac), in Prof. Chen's Spring 2024 format: four problems, 100 points, short
   parts of 3-8 points, numbers that work without a calculator, statements to judge, one trap part per paper.
     e3-prac-a: two perpendicular sheets λ/8 apart, the second leading by 45° (circular on one side, linear on the other);
                a good conductor given δ and σ (trap: quadruple f with the same surface E and the power goes DOWN);
                an RG-58-like coax (L, C, Z0, v, power); a two-line step bounce with V(z, t) at a point and steady state.
     e3-prac-b: reading σ, ε and μ off a lossy wave E(x, t) and H(x, t); a dielectric-to-air interface (Γ, τ, power,
                standing wave); a delta pulse on a shorted line (V vs t, V vs z, the short's current);
                shorted and open stubs (trap: which one is the inductor at 150 MHz).
     e3-prac-c: handedness of a sum of circular waves and a linear wave split into RHCP + LHCP; a wave on a perfect
                conductor (fields, nulls, surface current, pressure); a quarter-wave transformer; reading a scope trace
                backwards (trap: Γg is the ratio to the wave that hit the generator, not to the first pulse).
   Every number was recomputed in Python (work-pracA2/verify_*.py) and every bounce value checked against TL.valueAt. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;

  // ---------------------------------------------------------------- helpers
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  // one statement of a "circle all that apply" question
  const tf = (lbl, truth, whyWrong) => ({ lbl, mc: ['True', 'False'], a: truth ? 0 : 1, why: truth ? [null, whyWrong] : [whyWrong, null], fixed: true });
  const trap = (part, list) => Object.assign(part, { traps: list.map(([v, msg]) => ({ v, msg })) });
  const plot = (o) => PF.plot(Object.assign({ w: 360, h: 200 }, o));

  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 30) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // A line circuit on two rails, left to right (the same kit as practice G-I). Items:
  //   { t: 'gen', R, V }  { t: 'line', w, lab, sub }  { t: 'wire', w }  { t: 'R', lab, last }  { t: 'short', lab }
  //   { t: 'open', lab }  { t: 'end', lab }  { t: 'probe', lab }  (a dashed probe mark at the current x)
  // o.ticks = [[item index, 'TeX', frac], ...]: position marks under those items.
  function circuit(items, o = {}) {
    const g = PF.fig({ alt: o.alt });
    const T = 30, B = 112, M = (T + B) / 2;
    const rail = (a, b) => { g.line(a, T, b, T); g.line(a, B, b, B); };
    let x = 70;
    const at = [], wid = [];
    items.forEach((it, k) => {
      at.push(x); wid.push(it.w || 0);
      if (it.t === 'R') at[k] = x + 18;
      if (it.t === 'gen') {
        zig(g, x, T, x, T + 36, 26);
        g.line(x, T + 36, x, M + 4);
        g.circle(x, M + 15, 11);
        g.line(x - 3, M + 10, x + 3, M + 10, { cls: 'thin' }); g.line(x, M + 7, x, M + 13, { cls: 'thin' });
        g.line(x - 3, M + 21, x + 3, M + 21, { cls: 'thin' });
        g.line(x, M + 26, x, B);
        g.label(x - 10, T + 18, it.R, 'r', 'small');
        g.label(x - 17, M + 15, it.V, 'r', 'small');
        rail(x, x + 26); x += 26;
      } else if (it.t === 'line') {
        g.line(x, T, x + it.w, T, { cls: 'thick' }); g.line(x, B, x + it.w, B, { cls: 'thick' });
        if (it.lab) g.label(x + it.w / 2, T + 20, it.lab, 'c', 'small');
        if (it.sub) g.label(x + it.w / 2, B - 20, it.sub, 'c', 'small');
        if (it.probe !== undefined) {
          const px = x + it.w * it.probe;
          g.line(px, T - 14, px, B + 2, { cls: 'dash dim' }); g.dot(px, T, 2.4);
          g.label(px, T - 16, it.plab || '\\text{probe}', 'b', 'small');
        }
        x += it.w;
      } else if (it.t === 'wire') {
        rail(x, x + it.w); x += it.w;
      } else if (it.t === 'R') {
        rail(x, x + 18); x += 18;
        zig(g, x, T, x, B, 32);
        g.dot(x, T, 2.4); g.dot(x, B, 2.4);
        if (it.lab) g.label(x + (it.left ? -10 : 10), M, it.lab, it.left ? 'r' : 'l', 'small');
        if (!it.last) { rail(x, x + 18); x += 18; }
      } else if (it.t === 'short') {
        g.line(x, T, x, B, { cls: 'thick' });
        if (it.lab) g.label(x + 8, M, it.lab, 'l', 'small');
      } else if (it.t === 'open') {
        g.circle(x + 3, T, 3, { cls: 'bgfill' }); g.circle(x + 3, B, 3, { cls: 'bgfill' });
        g.label(x + 10, M, it.lab || '\\text{open}', 'l', 'small');
      } else if (it.t === 'end') {
        g.line(x, T, x, B, { cls: 'dash dim' });
        g.label(x + 8, M, it.lab, 'l', 'small');
      }
    });
    at.push(x);
    if (o.ticks) {
      const y = B + 24, xOf = ([k, , fr]) => at[k] + (fr || 0) * wid[k], xs = o.ticks.map(xOf);
      g.line(Math.min(...xs) - 6, y, Math.max(...xs) + 16, y, { cls: 'dim', arrow: 'end', hs: 6 });
      g.label(Math.max(...xs) + 20, y, 'z', 'l', 'small accent');
      o.ticks.forEach((tk) => { const tx = xOf(tk); g.line(tx, y - 4, tx, y + 4, { cls: 'dim' }); g.label(tx, y + 7, tk[1], 't', 'small'); });
    }
    return g.svg();
  }

  // the header every paper shares
  const RULES = md`**Exam rules: 75 minutes, 100 points.** Closed book and **no calculator**. You may use the official [formula sheet](#/l/e3-sheet) and one 4″×6″ card of your own handwritten notes. Show your reasoning, box each answer, and give its units.`;
  const HOWTO = md`**How to use this paper.** Start a 75-minute timer and do the whole paper on paper first, exactly as you will on Monday. Only then type your answers into the boxes. Open a hint only for a part you could not start at all. Then read every worked solution, also for the parts you got right. Each one goes slowly, one step at a time, and ends with a **Speed path** (the fastest correct route under exam pressure) and **Where points go** (the slips that cost points on that kind of part). Tomorrow, redo every missed part on a blank sheet without looking.`;
  const CONSTS = md`**Constants.** $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$. Numeric answers within about 2% count. You can type <code>pi</code> for $\pi$ and arithmetic such as <code>120*pi</code> or <code>2*exp(-3)</code>.`;

  // ======================================================================================== EXAM A: figures
  // A1: the two sheets, side view (z to the right, x up, y out of the page)
  function figA1() {
    const g = PF.fig({ alt: 'side view: the z axis runs to the right; sheet 1 stands in the plane z = 0 with its current pointing up, along x; sheet 2 stands in the plane z = d = 1/8 m with its current coming out of the page, along y; the regions z < 0, between the sheets, and z > d are marked' });
    const Y0 = 160, X1 = 170, X2 = 250;
    g.arrow(30, Y0, 390, Y0, { cls: 'dim', hs: 6 }); g.label(394, Y0, 'z', 'l', 'small accent');
    g.sheet(X1, 40, Y0 + 10); g.sheet(X2, 40, Y0 + 10);
    g.arrow(X1 - 9, 120, X1 - 9, 70, { hs: 7 }); g.label(X1 - 14, 92, '\\mathbf J_{s1}', 'r', 'small');
    for (const y of [64, 98, 132]) g.odot(X2 + 12, y, 6);
    g.label(X2 + 22, 98, '\\mathbf J_{s2}', 'l', 'small');
    g.label(X1, Y0 + 14, '0', 't', 'small'); g.label(X2, Y0 + 14, 'd', 't', 'small');
    g.label(90, 52, 'z < 0', 'c', 'small'); g.label(330, 52, 'z > d', 'c', 'small');
    // a small triad: x up, z right, y out of the page
    const ox = 50, oy = 120;
    g.arrow(ox, oy, ox, oy - 30, { cls: 'dim', hs: 5 }); g.label(ox + 4, oy - 30, 'x', 'bl', 'small accent');
    g.arrow(ox, oy, ox + 30, oy, { cls: 'dim', hs: 5 }); g.label(ox + 33, oy, 'z', 'l', 'small accent');
    g.odot(ox, oy, 4); g.label(ox - 7, oy + 4, 'y', 'tr', 'small accent');
    return g.svg();
  }
  // A1 solution: what the tip of E does on each side, seen from +z (x right, y up)
  function tipPanel(kind) {
    const circ = kind === 'circ';
    const g = PF.fig({ alt: circ ? 'the xy-plane seen from +z: a circle of radius 120 pi; arrows show the tip of E turning clockwise, from +x toward -y; the wave comes out of the page, toward +z' : 'the xy-plane seen from +z: the tip of E slides back and forth along the diagonal line y = x, between plus and minus 120 pi root 2; the wave goes into the page, toward -z' });
    const cx = 100, cy = 92, r = 62;
    g.arrow(cx - 86, cy, cx + 90, cy, { cls: 'dim', hs: 6 }); g.label(cx + 94, cy, 'x', 'l', 'small accent');
    g.arrow(cx, cy + 80, cx, cy - 82, { cls: 'dim', hs: 6 }); g.label(cx + 4, cy - 82, 'y', 'bl', 'small accent');
    if (circ) {
      g.circle(cx, cy, r, { cls: 'curve' });
      for (const th of [70, 250]) {           // clockwise on the page: the tangent is (sin, cos) in screen coordinates
        const t = th * PI / 180;
        g.head(cx + r * Math.cos(t), cy - r * Math.sin(t), Math.sin(t), Math.cos(t), { hs: 9 });
      }
      g.odot(cx - 58, cy + 64, 7); g.label(cx - 48, cy + 64, '\\text{travel } {+z}', 'l', 'small');
    } else {
      const k = 62;
      g.line(cx - k, cy + k, cx + k, cy - k, { cls: 'curve', arrow: 'both', hs: 9 });
      g.otimes(cx + 34, cy + 64, 7); g.label(cx + 44, cy + 64, '\\text{travel } {-z}', 'l', 'small');
    }
    return g.svg();
  }
  const figA1sol = () => PF.row([
    { svg: tipPanel('lin'), cap: 'z < 0: the two parts arrive in step. Linear, along x = y.' },
    { svg: tipPanel('circ'), cap: 'z > d: the y part leads by 90°. The tip turns x → −y while the wave comes toward you: left-handed.' },
  ]).svg;
  // A2: the metal half-space
  function figA2() {
    const g = PF.fig({ alt: 'side view: free space on the left, the metal filling z > 0 on the right, shaded; inside the metal an arrow along +z marks the direction of travel and a short arrow along +x marks E at the surface, labeled 2 cos(omega t) V/m' });
    g.rect(170, 30, 200, 130, { cls: 'shade' });
    g.line(170, 30, 170, 160, { cls: 'thick' });
    g.arrow(40, 175, 390, 175, { cls: 'dim', hs: 6 }); g.label(394, 175, 'z', 'l', 'small accent');
    g.label(170, 182, '0', 't', 'small');
    g.label(100, 70, '\\text{free space}', 'c', 'small');
    g.label(282, 52, '\\text{metal: }\\sigma = 5\\times10^{7}\\ \\text{S/m}', 'c', 'small');
    g.label(282, 76, '\\delta = 1\\ \\mu\\text{m},\\ \\mu = \\mu_0', 'c', 'small');
    g.arrow(186, 140, 186, 106, { hs: 7 }); g.label(192, 118, '\\mathbf E(0,t)', 'l', 'small');
    g.arrow(250, 140, 330, 140, { hs: 7 }); g.label(290, 132, '\\text{travel}', 'b', 'small');
    return g.svg();
  }
  const figA2sol = () => plot({
    w: 380, h: 210, x: [0, 5.2], y: [-1.4, 2.5], zero: true, xl: 'z\\,(\\mu\\text{m})', yl: 'E_x(z,0)\\ (\\text{V/m})',
    xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[2, '2']],
    curves: [
      { f: (z) => 2 * Math.exp(-z) * Math.cos(z), n: 400 },
      { f: (z) => 2 * Math.exp(-z), cls: 'dash dim', lab: '2e^{-z/\\delta}', labAt: 1.0, dx: 8, dy: -8 },
      { f: (z) => -2 * Math.exp(-z), cls: 'dash dim' },
    ],
    pts: [{ x: 3, y: 2 * Math.exp(-3), lab: '2e^{-3}', anchor: 'bl' }],
  });
  // A3: coax cross-section
  function figA3() {
    const g = PF.fig({ alt: 'cross-section of the coax: an inner conductor of radius a, a shaded dielectric filling with relative permittivity 2.25 out to radius b, and a thin outer conductor at b' });
    const cx = 120, cy = 110, ra = 22, rb = 78;
    g.circle(cx, cy, rb, { cls: 'shade' }); g.circle(cx, cy, rb, { cls: 'thick' });
    g.circle(cx, cy, ra, { cls: 'bgfill' }); g.circle(cx, cy, ra, { cls: 'thick' });
    g.line(cx, cy, cx + ra, cy, { cls: 'dim' }); g.label(cx + ra / 2, cy - 3, 'a', 'b', 'small');
    const s = Math.SQRT1_2;
    g.line(cx, cy, cx - rb * s, cy + rb * s, { cls: 'dim' }); g.label(cx - rb * s / 2 - 4, cy + rb * s / 2 - 4, 'b', 'br', 'small');
    g.label(cx + 6, cy - 50, '\\epsilon_r = 2.25', 'c', 'small');
    g.label(cx + rb + 14, cy - 40, '\\ln(b/a) = 1.25', 'l', 'small');
    g.label(cx + rb + 14, cy - 14, 'a = 0.5\\ \\text{mm}', 'l', 'small');
    g.label(cx + rb + 14, cy + 12, '\\mu = \\mu_0,\\ \\sigma = 0', 'l', 'small');
    return g.svg();
  }
  // A4: two lines in cascade
  const sA4 = TL.solve({ Vg: 90, Rg: 100, RL: 150, sections: [{ Z0: 100, len: 300, v: 300 }, { Z0: 50, len: 100, v: 100 }], tMax: 5 });
  const figA4 = () => circuit([
    { t: 'gen', R: 'R_g = 100\\,\\Omega', V: '90u(t)\\,\\text{V}' }, { t: 'wire', w: 14 },
    { t: 'line', w: 180, lab: 'Z_{01} = 100\\,\\Omega', sub: '\\text{air}' }, { t: 'wire', w: 8 },
    { t: 'line', w: 90, lab: 'Z_{02} = 50\\,\\Omega', sub: '\\epsilon_r = 9' },
    { t: 'R', lab: 'R_L = 150\\,\\Omega', last: true },
  ], { ticks: [[2, '0'], [4, '300\\,\\text{m}'], [5, '400\\,\\text{m}']], alt: 'a step source 90u(t) volts with Rg = 100 ohms drives line 1 (Z01 = 100 ohms, air-filled, from z = 0 to 300 m), then line 2 (Z02 = 50 ohms, filled with relative permittivity 9, from 300 m to 400 m), which ends in RL = 150 ohms' });

  // ======================================================================================== EXAM A
  const examA = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** Prof. Chen's Spring 2024 Exam 3 had four problems (18, 30, 18 and 34 points) cut into short parts, clean numbers, statements to judge, and a two-line bounce diagram worth a third of the paper. This paper has the same shape and the same four families, with new situations. One part is a trap: it tests an idea, not algebra.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Two perpendicular current sheets with a phase difference: fields in all three regions, polarization, $\mathbf H$, power | 20 |
      | 2 | A good conductor given $\delta$ and $\sigma$: $\gamma$, $\eta$, the field at depth, $\mathbf H$, power, a frequency change | 28 |
      | 3 | A coax from $a$, $b$ and its filling: $L$, $C$, $Z_0$, $v$, carried power | 18 |
      | 4 | Two lines in cascade, step input: coefficients, bounce diagram, $V(z,t)$ and $I(z,t)$ at points, steady state | 34 |

      **Draws on:** [current-sheet antennas](#/l/w3-antenna), [polarization](#/l/w3-pol), [good conductors and skin depth](#/l/w2-limits), [power in lossy media](#/l/w2-loss), [fields to telegrapher's equations](#/l/w5-telegraph), [launching waves](#/l/w5-launch), [bounce diagrams](#/l/w5-bounce) and [junctions](#/l/w5-multi).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- A Problem 1
    RF(md`
      ### Problem 1 (20 points): two perpendicular sheets, one leading

      Two infinite current sheets sit in free space.

      - Sheet 1, in the plane $z = 0$, carries $\mathbf J_{s1}(t) = 2\cos(\omega t)\,\hat x$ A/m.
      - Sheet 2, in the plane $z = d = \tfrac18$ m, carries $\mathbf J_{s2}(t) = 2\cos(\omega t + 45°)\,\hat y$ A/m.

      So the currents are perpendicular, equal in size, and sheet 2 **leads** sheet 1 by $45°$. The frequency is $f = 300$ MHz. A sheet at $z = z_0$ radiates, on both sides (formula sheet, written for a vector current and a sheet at $z_0$):
      $$\mathbf E = -\frac{\eta_0}{2}\,\mathbf J_s\!\left(t \mp \frac{z - z_0}{c}\right),\ z \gtrless z_0$$
      In phasor form, with the cosine reference, that is $\tilde{\mathbf E} = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z - z_0|}$.

      [[fig:sheets]]
    `, { sheets: { svg: figA1(), cap: 'Side view: z to the right, x up, so y comes out of the page. Sheet 1 drives x; sheet 2 drives y.' } }),
    P({ src: 'Practice A #1(a) · 3 pts', title: 'β and the gap',
      q: md`**(a) (3 pts)** Find $\beta$, and the phase delay $\beta d$ (in degrees) that a wave picks up when it crosses the gap between the sheets.`,
      parts: [trap(N(md`$\beta$ (rad/m)`, 2 * PI, 'rad/m'), [[2 * PI * 3e8, md`That is $\omega$, not $\beta$. Divide by $c$: $\beta = \omega/c$.`]]),
        trap(N(md`$\beta d$ (degrees)`, 45, '°'), [[PI / 4, md`That is the right angle in radians. The box asks for degrees: $\pi/4$ rad $= 45°$.`], [90, md`That uses $d = \lambda/4$. Here $d = \tfrac18$ m and $\lambda = 1$ m, so $d = \lambda/8$.`]])],
      hints: [md`$\beta = \omega/c = 2\pi f/c$, and $\lambda = 2\pi/\beta$. Compare $d$ with $\lambda$.`],
      sol: md`
        **1. β.** In free space the wave travels at $c$, so
        $$\beta = \frac{\omega}{c} = \frac{2\pi f}{c}$$
        Put in the numbers:
        $$\beta = \frac{2\pi(3\times10^8)}{3\times10^8}$$
        $$\boxed{\beta = 2\pi\ \text{rad/m} \approx 6.28\ \text{rad/m}}$$
        The wavelength is $\lambda = 2\pi/\beta = 1$ m.

        **2. The gap's delay.** A wave that travels a distance $d$ falls behind in phase by $\beta d$:
        $$\beta d = 2\pi\cdot\tfrac18 = \frac{\pi}{4}$$
        $$\boxed{\beta d = 45°}$$

        !!intuition Does this make sense?
          $d = \tfrac18$ m is one eighth of a wavelength, and a whole wavelength is $360°$ of phase. One eighth of $360°$ is $45°$ ✓. So the gap exactly matches sheet 2's lead. That coincidence is the whole problem: on one side the two $45°$ add, on the other they cancel.

        **Speed path.** 300 MHz in free space: $\lambda = 1$ m and $\beta = 2\pi$. Memorize that pair; it appears on every Chen paper. Then $\beta d = 360°\times d/\lambda$.

        **Where points go.** Leaving $\beta d$ in radians when degrees were asked, or the reverse. Writing $\beta = 2\pi f$ (that is $\omega$).
      ` }),
    P({ src: 'Practice A #1(b) · 5 pts', title: 'The field for z > d',
      q: md`**(b) (5 pts)** Find $\tilde{\mathbf E}$ for $z > d$, and name its polarization.`,
      parts: [
        mc(md`$\tilde{\mathbf E}$ for $z > d$ (V/m)`, [md`$-120\pi\,(\hat x + j\hat y)\,e^{-j2\pi z}$`, md`$-120\pi\,(\hat x + \hat y)\,e^{-j2\pi z}$`, md`$-120\pi\,(\hat x - j\hat y)\,e^{-j2\pi z}$`, md`$-240\pi\,(\hat x + j\hat y)\,e^{-j2\pi z}$`, md`$+120\pi\,(\hat x + j\hat y)\,e^{-j2\pi z}$`], 0,
          [null, md`That shifts sheet 2's exponent the wrong way, $e^{-j\beta(z + d)}$. Then the gap's $45°$ cancels the $45°$ lead. That cancellation happens on the **left** side, not here.`, md`A lead of $45°$ is $e^{+j45°}$; the gap adds another $e^{+j45°}$ once you factor out $e^{-j\beta z}$. Together that is $e^{+j90°} = +j$, not $-j$.`, md`Each sheet's field is $\tfrac{\eta_0}{2}J_s = 60\pi\cdot2 = 120\pi$. Using $\eta_0J_s$ forgets that a sheet sends half its field each way.`, md`That drops the minus sign in $\tilde{\mathbf E} = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_s$: at the sheet the field points against the current that drives it.`]),
        mc(md`For $z > d$ the wave is`, ['left-handed circular', 'right-handed circular', 'linear, at 45° to the x axis', 'elliptical, because the two sheets are at different places'], 0,
          [null, md`The tip turns from $\hat x$ toward $-\hat y$. With your right thumb along $+z$ (the travel) your fingers curl from $\hat x$ toward $+\hat y$: the opposite way. So it is the left hand.`, md`Linear needs the two parts in phase. Here $\tilde E_y = j\tilde E_x$: $90°$ apart.`, md`The positions only add phase, and the phase is already in the phasor. Equal sizes and $90°$ apart is circular.`])],
      hints: [md`Write each sheet's wave for $z > d$: sheet 1 gives $-120\pi\,\hat x\,e^{-j\beta z}$; sheet 2 gives $-120\pi\,e^{j45°}\,\hat y\,e^{-j\beta(z - d)}$.`, md`Factor $e^{-j\beta z}$ out of sheet 2's term. What is left multiplying $\hat y$?`],
      sol: md`
        **1. The currents as phasors.** With the cosine reference, a cosine maps to its amplitude and a phase lead maps to $e^{+j\,\text{lead}}$:
        $$\tilde{\mathbf J}_{s1} = 2\,\hat x,\qquad \tilde{\mathbf J}_{s2} = 2e^{j45°}\,\hat y\ \ \text{A/m}$$
        **2. Each sheet's field size.** The sheet law gives a factor $\eta_0/2 = 60\pi\ \Omega$. Times 2 A/m:
        $$\frac{\eta_0}{2}\cdot2 = 120\pi\ \text{V/m}$$
        **3. Sheet 1 for z > d.** Here $z > 0$, so $|z - 0| = z$ and the wave travels toward $+z$:
        $$\tilde{\mathbf E}_1 = -120\pi\,\hat x\,e^{-j\beta z}$$
        **4. Sheet 2 for z > d.** Here $|z - d| = z - d$:
        $$\tilde{\mathbf E}_2 = -120\pi\,e^{j45°}\,\hat y\,e^{-j\beta(z - d)}$$
        Split the exponent. $e^{-j\beta(z - d)} = e^{-j\beta z}\,e^{+j\beta d}$, and $\beta d = 45°$ from (a):
        $$\tilde{\mathbf E}_2 = -120\pi\,e^{j45°}e^{j45°}\,\hat y\,e^{-j\beta z}$$
        The two phases add to $90°$, and $e^{j90°} = j$:
        $$\tilde{\mathbf E}_2 = -120\pi\,j\,\hat y\,e^{-j\beta z}$$
        **5. Add them.** Both share $-120\pi\,e^{-j\beta z}$:
        $$\boxed{\tilde{\mathbf E} = -120\pi\,(\hat x + j\hat y)\,e^{-j2\pi z}\ \text{V/m}}$$
        **6. Polarization.** The two parts have the same size, $120\pi$, and $\tilde E_y = j\tilde E_x$: they are $90°$ apart in time. Equal and $90°$ apart is **circular**.

        **7. Which hand.** The common factor $-120\pi e^{-j\beta z}$ only shifts every component's timing by the same amount, so it cannot change the sense of rotation. Look at $\hat x + j\hat y$ alone:
        $$E_x \propto \cos\omega t,\qquad E_y \propto \Re\{j e^{j\omega t}\} = -\sin\omega t$$
        At $\omega t = 0$ the tip is at $+\hat x$. A quarter period later it is at $-\hat y$. So the tip turns from $\hat x$ toward $-\hat y$. The wave travels toward $+z$. Right thumb along $+z$: the fingers curl from $\hat x$ toward $+\hat y$, the wrong way. So
        $$\boxed{\text{left-handed circular}}$$
        Cross-product form of the same test: $\hat x\times(-\hat y) = -\hat z$, opposite to the travel, so left.

        !!intuition Does this make sense?
          Follow the waves in time. Sheet 1's wave arrives at sheet 2 already $45°$ late, because it had to cross the gap. Sheet 2 is $45°$ early by construction. So at $z = d$ and beyond, the $\hat y$ wave is $90°$ ahead of the $\hat x$ wave: the textbook recipe for circular polarization (perpendicular, equal, a quarter period apart).

        **Speed path.** On the far side of sheet 2, its phase relative to sheet 1 is (its lead) + $\beta d$ $= 45° + 45° = 90°$. So $\tilde E_y = j\tilde E_x$ with equal sizes: circular. Then $\hat x + j\hat y$ toward $+z$ is left-handed (memorize: $\hat x - j\hat y$ toward $+z$ is right-handed).

        **Where points go.** Getting the sign of the gap phase wrong (it ADDS on this side). Using $\eta_0J_s$ instead of $\tfrac{\eta_0}{2}J_s$. Calling the hand from a picture without fixing the viewpoint: use the thumb.
      ` }),
    P({ src: 'Practice A #1(c) · 4 pts', title: 'The field for z < 0',
      q: md`**(c) (4 pts)** Find $\tilde{\mathbf E}$ for $z < 0$, and name its polarization.`,
      parts: [
        mc(md`$\tilde{\mathbf E}$ for $z < 0$ (V/m)`, [md`$-120\pi\,(\hat x + \hat y)\,e^{+j2\pi z}$`, md`$-120\pi\,(\hat x + j\hat y)\,e^{+j2\pi z}$`, md`$-120\pi\,(\hat x + \hat y)\,e^{-j2\pi z}$`, md`$-120\pi\,(\hat x - \hat y)\,e^{+j2\pi z}$`], 0,
          [null, md`That copies the $z > d$ side. On the left it is sheet 2's wave that crosses the gap, toward $-z$, so its $45°$ delay **subtracts** from its $45°$ lead.`, md`$e^{-j2\pi z}$ travels toward $+z$. On the left side both waves move away from the sheets, toward $-z$: $e^{+j\beta z}$.`, md`That flips the sign of one component, as if $\mathbf E$ reversed across a sheet. It is $\mathbf H$ that reverses; $\tilde{\mathbf E} = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_s e^{-j\beta|z - z_0|}$ has the same sign on both sides.`]),
        mc(md`For $z < 0$ the wave is`, [md`linear, along the line $y = x$`, 'left-handed circular, like the other side', 'right-handed circular: the hand flips on the other side', md`linear, along $\hat x$ only`], 0,
          [null, md`On this side the two parts arrive in phase ($\tilde E_y = \tilde E_x$). In-phase parts make a line, not a circle.`, md`That would be true for a single sheet radiating a circular wave. Here the phase between the parts is different on the two sides.`, md`Sheet 2's wave still reaches the left side; its $\hat y$ part has the same size as the $\hat x$ part.`])],
      hints: [md`For $z < 0$, $|z| = -z$ and $|z - d| = d - z$. So sheet 2's wave carries $e^{-j\beta(d - z)} = e^{-j\beta d}e^{+j\beta z}$.`],
      sol: md`
        **1. Sheet 1 for z < 0.** Now $|z - 0| = -z$, so $e^{-j\beta|z|} = e^{+j\beta z}$: a wave toward $-z$.
        $$\tilde{\mathbf E}_1 = -120\pi\,\hat x\,e^{+j\beta z}$$
        **2. Sheet 2 for z < 0.** Here $z < d$, so $|z - d| = d - z$:
        $$\tilde{\mathbf E}_2 = -120\pi\,e^{j45°}\,\hat y\,e^{-j\beta(d - z)}$$
        Split the exponent: $e^{-j\beta(d - z)} = e^{-j\beta d}\,e^{+j\beta z}$, and $e^{-j\beta d} = e^{-j45°}$:
        $$\tilde{\mathbf E}_2 = -120\pi\,e^{j45°}e^{-j45°}\,\hat y\,e^{+j\beta z}$$
        The lead and the delay cancel:
        $$\tilde{\mathbf E}_2 = -120\pi\,\hat y\,e^{+j\beta z}$$
        **3. Add them.**
        $$\boxed{\tilde{\mathbf E} = -120\pi\,(\hat x + \hat y)\,e^{+j2\pi z}\ \text{V/m}}$$
        **4. Polarization.** $\tilde E_y = \tilde E_x$: same size, same phase. At every instant $E_y(t) = E_x(t)$, so the tip moves back and forth along the line $y = x$:
        $$\boxed{\text{linear, along } \hat x + \hat y}$$
        Its amplitude is $\sqrt2\cdot120\pi \approx 533$ V/m.

        [[fig:tips]]

        !!intuition Does this make sense?
          On this side it is sheet 2's wave that has to cross the gap, and crossing costs it exactly the $45°$ it started ahead. So both waves arrive in step, and two perpendicular in-step oscillations make a straight line. The same two sheets give a circle on one side and a line on the other. Nothing is wrong with that: the phase between the parts depends on who had to travel farther.

        **Speed path.** On the near side of sheet 1 (the left), sheet 2's relative phase is (its lead) $-\ \beta d = 45° - 45° = 0$. In phase: linear.

        **Where points go.** Assuming the two sides are mirror images. Flipping the sign of $\mathbf E$ on the left (only $\mathbf H$ flips). Writing $e^{-j\beta z}$ for a wave on the left.
      `,
      figs: { tips: { svg: figA1sol(), cap: 'The tip of E on each side, seen from +z with x to the right and y up.' } } }),
    P({ src: 'Practice A #1(d) · 3 pts', title: 'Between the sheets',
      q: md`**(d) (3 pts)** Find $\tilde{\mathbf E}$ in the gap, $0 < z < d$.`,
      parts: [mc(md`$\tilde{\mathbf E}$ for $0 < z < d$ (V/m)`, [md`$-120\pi\,(\hat x\,e^{-j2\pi z} + \hat y\,e^{+j2\pi z})$`, md`$-120\pi\,(\hat x + j\hat y)\,e^{-j2\pi z}$`, md`$-120\pi\,(\hat x\,e^{-j2\pi z} + j\hat y\,e^{+j2\pi z})$`, md`$-120\pi\,(\hat x\,e^{+j2\pi z} + \hat y\,e^{-j2\pi z})$`], 0,
        [null, md`That is the $z > d$ result. Between the sheets, sheet 2's wave travels toward $-z$, so its part carries $e^{+j\beta z}$.`, md`That adds the gap phase instead of subtracting it. At a point $z$ in the gap, sheet 2's wave has travelled $d - z$ and lags by $\beta(d - z)$.`, md`The directions are swapped. Each wave moves away from its own sheet: sheet 1's toward $+z$, sheet 2's toward $-z$.`])],
      hints: [md`In the gap, $|z - 0| = z$ and $|z - d| = d - z$.`],
      sol: md`
        **1. Sheet 1 in the gap.** $z > 0$, so the wave moves toward $+z$:
        $$\tilde{\mathbf E}_1 = -120\pi\,\hat x\,e^{-j\beta z}$$
        **2. Sheet 2 in the gap.** $z < d$, so it moves toward $-z$, with $|z - d| = d - z$:
        $$\tilde{\mathbf E}_2 = -120\pi\,e^{j45°}\,\hat y\,e^{-j\beta d}\,e^{+j\beta z}$$
        As in (c), $e^{j45°}e^{-j45°} = 1$:
        $$\tilde{\mathbf E}_2 = -120\pi\,\hat y\,e^{+j\beta z}$$
        **3. Add.**
        $$\boxed{\tilde{\mathbf E} = -120\pi\,(\hat x\,e^{-j2\pi z} + \hat y\,e^{+j2\pi z})}$$
        in V/m. The two parts travel in **opposite** directions, so this is not one traveling wave and it has no single hand. The phase of $\tilde E_y$ relative to $\tilde E_x$ is $2\beta z$: $0°$ at $z = 0$ and $90°$ at $z = d$.

        !!intuition Does this make sense?
          Check continuity. Tangential $\mathbf E$ must be continuous across a current sheet. At $z = 0$ the gap formula gives $-120\pi(\hat x + \hat y)$, the same as (c) at $z = 0$ ✓. At $z = d = \tfrac18$: $e^{-j\pi/4}$ and $e^{+j\pi/4}$. Factor out $e^{-j\pi/4}$ to get $-120\pi e^{-j\pi/4}(\hat x + j\hat y)$, the same as (b) at $z = \tfrac18$ ✓.

        **Speed path.** Write each sheet's wave with $|z - z_0|$ and simplify; then check continuity at both sheets. Ten seconds per region once (b) and (c) are done.

        **Where points go.** Forcing a common $e^{-j\beta z}$ in the gap. Skipping the continuity check, which catches every sign error.
      ` }),
    P({ src: 'Practice A #1(e) · 5 pts', title: 'H and the power for z > d',
      q: md`**(e) (5 pts)** Find $\tilde{\mathbf H}$ for $z > d$, and the time-averaged Poynting vector $\langle\mathbf S\rangle$ there.`,
      parts: [
        mc(md`$\tilde{\mathbf H}$ for $z > d$ (A/m)`, [md`$(j\hat x - \hat y)\,e^{-j2\pi z}$`, md`$(\hat y - j\hat x)\,e^{-j2\pi z}$`, md`$-(\hat x + j\hat y)\,e^{-j2\pi z}$`, md`$(j\hat x - \hat y)\,e^{+j2\pi z}$`, md`$120\pi\,(j\hat x - \hat y)\,e^{-j2\pi z}$`], 0,
          [null, md`That is $-\tilde{\mathbf H}$: a sign slip in $\hat z\times\hat y = -\hat x$, or in the $-120\pi$ out front.`, md`That is $\tilde{\mathbf E}/\eta_0$ with the directions unchanged. $\mathbf H$ is perpendicular to $\mathbf E$: rotate with $\hat z\times$.`, md`$e^{+j2\pi z}$ travels toward $-z$. $\mathbf H$ travels with $\mathbf E$.`, md`That multiplies by $\eta_0$ instead of dividing.`]),
        trap(N(md`$\langle S_z\rangle$ for $z > d$ (W/m²)`, 120 * PI, 'W/m²'), [[240 * PI, md`That adds the two amplitudes before squaring, as if $|\tilde{\mathbf E}| = 240\pi$. Perpendicular parts add in **power**: $|\tilde E_x|^2 + |\tilde E_y|^2$.`], [60 * PI, md`That is one sheet's share. Both sheets send a wave into $z > d$.`]])],
      hints: [md`For a wave toward $+z$: $\tilde{\mathbf H} = \dfrac{1}{\eta_0}\,\hat z\times\tilde{\mathbf E}$, with $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$.`, md`$\langle S_z\rangle = \dfrac{|\tilde E_x|^2 + |\tilde E_y|^2}{2\eta_0}$.`],
      sol: md`
        **1. The rule.** In a plane wave, $\mathbf E$, $\mathbf H$ and the travel direction $\hat k$ form a right-handed set, and $|\mathbf E|/|\mathbf H| = \eta_0$. In one line:
        $$\tilde{\mathbf H} = \frac{1}{\eta_0}\,\hat k\times\tilde{\mathbf E}$$
        **2. Apply it,** with $\hat k = \hat z$ and $\tilde{\mathbf E}$ from (b):
        $$\tilde{\mathbf H} = \frac{-120\pi}{120\pi}\,e^{-j\beta z}\,\big(\hat z\times\hat x + j\,\hat z\times\hat y\big)$$
        The cross products are $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$:
        $$\tilde{\mathbf H} = -e^{-j\beta z}\,(\hat y - j\hat x)$$
        Distribute the minus sign:
        $$\boxed{\tilde{\mathbf H} = (j\hat x - \hat y)\,e^{-j2\pi z}\ \text{A/m}}$$
        **3. The power.** $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. For a plane wave in free space this reduces to the sum of the squared sizes over $2\eta_0$:
        $$\langle S_z\rangle = \frac{|\tilde E_x|^2 + |\tilde E_y|^2}{2\eta_0}$$
        Both sizes are $120\pi$:
        $$\langle S_z\rangle = \frac{2(120\pi)^2}{2\cdot120\pi}$$
        Cancel one $120\pi$ and the 2:
        $$\boxed{\langle\mathbf S\rangle = 120\pi\,\hat z \approx 377\,\hat z\ \text{W/m}^2}$$

        !!intuition Does this make sense?
          One sheet of 2 A/m alone sends $(120\pi)^2/(2\cdot120\pi) = 60\pi$ W/m² to each side. Here two sheets each send $60\pi$ into $z > d$, and because their fields are perpendicular they cannot interfere: the powers simply add to $120\pi$ ✓. The left side also gets $|\sqrt2\cdot120\pi|^2/(2\eta_0) = 120\pi$ toward $-z$. Units: (V/m)²/Ω = W/m² ✓.

        **Speed path.** $\tilde{\mathbf H} = \hat z\times\tilde{\mathbf E}/\eta_0$: send $\hat x\to\hat y$ and $\hat y\to-\hat x$. Power: (number of components) $\times\,(120\pi)^2/(240\pi) = 2\times60\pi$.

        **Where points go.** Writing $(E_x + E_y)^2$ instead of $E_x^2 + E_y^2$. Dropping the $\tfrac12$ in the time average. Giving $\langle\mathbf S\rangle$ without its direction.
      ` }),

    // ---------------------------------------------------------------- A Problem 2
    RF(md`
      ### Problem 2 (28 points): a wave in a good conductor

      A uniform plane wave travels toward $+z$ inside a metal that fills $z > 0$. The metal has $\sigma = 5\times10^7$ S/m and $\mu = \mu_0$. At the operating frequency (about 5 GHz) its skin depth is $\delta = 1\ \mu$m, and it is a good conductor ($\sigma \gg \omega\epsilon$). Just inside the surface the field is
      $$\mathbf E(0^+, t) = 2\cos(\omega t)\,\hat x\ \ \text{V/m}$$
      Take every quantity at $z \ge 0^+$, inside the metal.

      [[fig:metal]]
    `, { metal: { svg: figA2(), cap: 'The metal fills z > 0. E is along x at the surface; the wave travels toward +z and decays.' } }),
    P({ src: 'Practice A #2(a) · 4 pts', title: 'γ from δ',
      q: md`**(a) (4 pts)** Find $\alpha$ and $\beta$, so that $\gamma = \alpha + j\beta$.`,
      parts: [trap(N(md`$\alpha$ (Np/m)`, 1e6, 'Np/m'), [[1e-6, md`That is $\delta$ itself. $\alpha$ is its reciprocal: $1/\delta$.`], [5e5, md`That is $1/(2\delta)$, the decay rate of the **power**. The field decays as $e^{-z/\delta}$.`]]),
        trap(N(md`$\beta$ (rad/m)`, 1e6, 'rad/m'), [[2 * PI * 1e6, md`That treats $\delta$ as a wavelength. In a good conductor $\beta = \alpha = 1/\delta$, and $\lambda = 2\pi\delta$.`]])],
      hints: [md`Skin depth is defined as $\delta = 1/\alpha$. In a good conductor $\gamma \approx \sqrt{j\omega\mu\sigma}$, whose angle is $45°$, so $\beta = \alpha$.`],
      sol: md`
        **1. Why α = β in a good conductor.** Start from the sheet: $\gamma = j\omega\sqrt{\mu(\epsilon - j\sigma/\omega)}$. When $\sigma \gg \omega\epsilon$, drop $\epsilon$ next to $-j\sigma/\omega$:
        $$\gamma \approx j\omega\sqrt{-j\mu\sigma/\omega}$$
        Bring $j\omega$ inside the root as $(j\omega)^2 = -\omega^2$:
        $$\gamma \approx \sqrt{(-\omega^2)(-j\mu\sigma/\omega)} = \sqrt{j\omega\mu\sigma}$$
        $\sqrt{j} = e^{j45°} = (1 + j)/\sqrt2$, so the real and imaginary parts are equal:
        $$\gamma \approx \sqrt{\frac{\omega\mu\sigma}{2}}\,(1 + j)$$
        **2. Use δ.** The skin depth is the distance over which the amplitude falls by $1/e$, so $\delta = 1/\alpha$:
        $$\alpha = \beta = \frac1\delta = \frac{1}{10^{-6}\ \text{m}}$$
        $$\boxed{\alpha = 10^6\ \text{Np/m},\quad \beta = 10^6\ \text{rad/m}}$$
        $$\gamma = (1 + j)\times10^6\ \text{m}^{-1}$$

        !!intuition Does this make sense?
          Check $\delta$ from the numbers: $\delta = \sqrt{2/(\omega\mu\sigma)}$. With $f \approx 5$ GHz, $\omega\mu_0\sigma \approx (3.2\times10^{10})(1.26\times10^{-6})(5\times10^7) \approx 2\times10^{12}$, so $\delta \approx 1\ \mu$m ✓. That is copper at microwave frequencies: the current lives in the top micron of the metal.

        **Speed path.** Good conductor: $\gamma = (1 + j)/\delta$. One line.

        **Where points go.** Writing $\alpha = 1/(2\delta)$ (that is the power's rate). Treating $\delta$ as a wavelength.
      ` }),
    P({ src: 'Practice A #2(b) · 5 pts', title: 'η of the metal',
      q: md`**(b) (5 pts)** Find the intrinsic impedance $\eta = |\eta|e^{j\tau}$: its size $|\eta|$ and its angle $\tau$ (here $\tau$ is the angle of $\eta$, not a transmission coefficient).`,
      parts: [trap(N(md`$|\eta|$ ($\Omega$)`, 0.02 * Math.SQRT2, 'Ω'), [[0.02, md`That is the real part, $1/(\sigma\delta)$. The size is $\sqrt2$ times larger: $\eta = (1 + j)/(\sigma\delta)$.`], [120 * PI, md`That is $\eta_0$, the impedance of free space. Inside a metal $\eta$ is tiny.`]]),
        trap(N(md`$\tau$ (degrees)`, 45, '°'), [[PI / 4, md`Right angle, in radians. The box asks for degrees.`]])],
      hints: [md`$\eta\gamma = j\omega\mu$, so $\eta = j\omega\mu/\gamma$. (The good-conductor line of the sheet, $\eta \approx \sqrt{j\omega\mu/\sigma}$, gives the same thing.)`,md`With $\delta = \sqrt{2/(\omega\mu\sigma)}$, $\omega\mu = 2/(\sigma\delta^2)$. Substitute into $\eta = j\omega\mu/\gamma$.`],
      sol: md`
        **1. Start from ηγ = jωμ** (formula sheet). Solve for $\eta$:
        $$\eta = \frac{j\omega\mu}{\gamma}$$
        **2. Write ωμ with δ.** From $\delta^2 = 2/(\omega\mu\sigma)$:
        $$\omega\mu = \frac{2}{\sigma\delta^2}$$
        **3. Substitute** this and $\gamma = (1 + j)/\delta$:
        $$\eta = \frac{2j/(\sigma\delta^2)}{(1 + j)/\delta} = \frac{2j}{\sigma\delta\,(1 + j)}$$
        Simplify $2j/(1 + j)$: multiply top and bottom by $1 - j$. The bottom becomes $(1 + j)(1 - j) = 2$, the top $2j(1 - j) = 2j + 2$:
        $$\frac{2j}{1 + j} = 1 + j$$
        So
        $$\eta = \frac{1 + j}{\sigma\delta}$$
        **4. Numbers.** $\sigma\delta = (5\times10^7)(10^{-6}) = 50$ S:
        $$\eta = \frac{1 + j}{50} = 0.02 + j0.02\ \Omega$$
        Its size and angle:
        $$\boxed{|\eta| = 0.02\sqrt2 \approx 0.0283\ \Omega,\quad \tau = 45°}$$

        !!intuition Does this make sense?
          Compare with $\eta_0 = 377\ \Omega$: the metal's $\eta$ is about 13,000 times smaller. Since $|\mathbf H| = |\mathbf E|/|\eta|$, a metal carries a huge $\mathbf H$ (current) with almost no $\mathbf E$: that is what "conductor" means. The $45°$ is the signature of a good conductor (formula sheet: $\tau \approx \pi/4$). The real part, $1/(\sigma\delta) = 0.02\ \Omega$, is the surface resistance $R_s$.

        **Speed path.** Good conductor: $\eta = (1 + j)/(\sigma\delta)$. With $\sigma\delta = 50$: $0.02(1 + j)$.

        **Where points go.** Reporting $0.02\ \Omega$ as $|\eta|$ (that is the real part). Using $\eta_0$. Mixing $\tau$ (the angle of $\eta$) with the transmission coefficient $\tau = 1 + \Gamma$.
      ` }),
    P({ src: 'Practice A #2(c) · 4 pts', title: 'The field at depth',
      q: md`**(c) (4 pts)** Find the amplitude of $\mathbf E$ at a depth $z = 3\ \mu$m, and the wavelength $\lambda$ inside the metal.`,
      parts: [trap(N(md`$|\mathbf E|$ at $z = 3\ \mu$m (V/m)`, 2 * Math.exp(-3), 'V/m'), [[2 * Math.exp(-6), md`That uses $e^{-2\alpha z}$, the decay of the **power**. The field decays as $e^{-\alpha z}$.`], [2 * Math.exp(-1.5), md`That uses $\alpha = 1/(2\delta)$. The field falls by $1/e$ every $\delta$.`]]),
        trap(N(md`$\lambda$ in the metal ($\mu$m)`, 2 * PI, 'µm'), [[1, md`That is $\delta$. The wavelength is $2\pi/\beta = 2\pi\delta$.`]])],
      hints: [md`$|\mathbf E(z)| = E_0e^{-\alpha z}$ with $\alpha z = z/\delta$. $\lambda = 2\pi/\beta$.`],
      sol: md`
        **1. The amplitude.** A forward wave in a lossy medium is $E_0e^{-\alpha z}\cos(\omega t - \beta z)$. Only the $e^{-\alpha z}$ changes the size:
        $$|\mathbf E(z)| = E_0\,e^{-\alpha z} = 2\,e^{-z/\delta}$$
        At $z = 3\ \mu$m $= 3\delta$:
        $$\boxed{|\mathbf E| = 2e^{-3} \approx 0.0996\ \text{V/m}}$$
        **2. The wavelength.**
        $$\lambda = \frac{2\pi}{\beta} = 2\pi\delta$$
        $$\boxed{\lambda = 2\pi\ \mu\text{m} \approx 6.28\ \mu\text{m}}$$

        [[fig:decay]]

        !!intuition Does this make sense?
          $e^{-3} \approx 0.05$, so 3 skin depths down only 5% of the surface field is left. One full wavelength ($6.3\delta$) down it is $e^{-2\pi} \approx 0.002$: the wave dies before it completes a single cycle in space. That is why the snapshot above barely swings negative once.

        **Speed path.** Depth in units of $\delta$, then $e^{-n}$. Leave $2e^{-3}$ as is if the question says "you need not evaluate it".

        **Where points go.** Using $e^{-2\alpha z}$ (that is $\langle S\rangle$). Giving $\lambda = \delta$.
      `,
      figs: { decay: { svg: figA2sol(), cap: md`A snapshot at $t = 0$: $E_x(z,0) = 2e^{-z/\delta}\cos(z/\delta)$. Dashed: the envelope. The dot is the amplitude at 3 µm.` } } }),
    P({ src: 'Practice A #2(d) · 5 pts', title: 'H at the surface',
      q: md`**(d) (5 pts)** Find the amplitude of $\mathbf H$ at the surface, and the value $H_y(0^+, 0)$ at the instant $t = 0$.`,
      parts: [trap(N(md`amplitude of $H_y$ at $z = 0^+$ (A/m)`, 50 * Math.SQRT2, 'A/m'), [[100, md`That divides by the real part of $\eta$ only. Divide by the size: $2/(0.02\sqrt2) = 50\sqrt2$.`], [2 / (120 * PI), md`That divides by $\eta_0$. Inside the metal use the metal's $\eta$.`]]),
        trap(N(md`$H_y(0^+, 0)$ (A/m)`, 50, 'A/m'), [[50 * Math.SQRT2, md`That is the amplitude. At $t = 0$, $\mathbf H$ is $45°$ behind its peak: $50\sqrt2\cos(-45°) = 50$.`]])],
      hints: [md`$\tilde H_y = \tilde E_x/\eta$ for a wave toward $+z$ with $\mathbf E$ along $\hat x$. Divide $2$ by $0.02(1 + j)$.`, md`Then $H_y(t) = \Re\{\tilde H_ye^{j\omega t}\}$: the phase of $\tilde H_y$ is $-\tau$.`],
      sol: md`
        **1. The direction.** For travel along $+\hat z$ with $\mathbf E$ along $\hat x$, $\hat x\times\hat y = \hat z$, so $\mathbf H$ is along $+\hat y$, and $\tilde H_y = \tilde E_x/\eta$ (formula sheet: $\tilde{\mathbf H} = \hat y\,(E_0/|\eta|)\,e^{-\gamma z}e^{-j\tau}$).

        **2. Divide.** At the surface $\tilde E_x = 2$ V/m:
        $$\tilde H_y = \frac{2}{0.02(1 + j)} = \frac{100}{1 + j}$$
        Multiply top and bottom by $1 - j$; the bottom becomes 2:
        $$\tilde H_y = 50(1 - j)\ \text{A/m}$$
        In polar form, $1 - j = \sqrt2\,e^{-j45°}$:
        $$\tilde H_y = 50\sqrt2\,e^{-j45°}\ \text{A/m}$$
        **3. The amplitude** is the size:
        $$\boxed{|H_y| = 50\sqrt2 \approx 70.7\ \text{A/m}}$$
        **4. Back to time.**
        $$H_y(0^+, t) = 70.7\cos(\omega t - 45°)\ \text{A/m}$$
        At $t = 0$, $\cos(-45°) = 1/\sqrt2$:
        $$\boxed{H_y(0^+, 0) = 50\ \text{A/m}}$$
        It is just the real part of $\tilde H_y$, as it must be.

        !!intuition Does this make sense?
          $\mathbf H$ lags $\mathbf E$ by $\tau = 45°$: in a conductor the field has to push current through resistance, and the magnetic field follows the current, a little late. 2 V/m of $\mathbf E$ goes with 71 A/m of $\mathbf H$: a lot of current for very little field, as (b) predicted.

        **Speed path.** $\tilde H = \tilde E/\eta = 2/(0.02(1 + j)) = 50(1 - j)$. Size $50\sqrt2$; real part 50.

        **Where points go.** Forgetting the $-45°$ (giving 70.7 for $H_y(0,0)$). Dividing by $\eta_0$. Getting the direction of $\mathbf H$ wrong (check $\mathbf E\times\mathbf H$ along the travel).
      ` }),
    P({ src: 'Practice A #2(e) · 5 pts', title: 'Power, and statements about it',
      q: md`**(e) (5 pts)** Find $\langle S_z\rangle$ at $z = 0^+$. Then mark each statement about $\langle\mathbf S\rangle$ in this metal true or false.`,
      parts: [trap(N(md`$\langle S_z\rangle$ at $z = 0^+$ (W/m²)`, 50, 'W/m²'), [[50 * Math.SQRT2, md`That is $|E_0|^2/(2|\eta|)$: it forgets the $\cos\tau$. Only the part of $\mathbf H$ in phase with $\mathbf E$ carries power.`], [100, md`That forgets the $\tfrac12$ of the time average.`]]),
        tf(md`(i) $|\langle\mathbf S\rangle| = |\mathbf E|^2/(2\eta_0)$ at $z = 0^+$.`, false, md`$\eta_0$ is free space. In the metal, use the metal's $\eta$, and keep its angle: $\tfrac12|E_0|^2\Re\{1/\eta^*\}$.`),
        tf(md`(ii) $\langle S_z\rangle$ falls to $1/e$ of its surface value at $z = \delta$.`, false, md`$\langle S\rangle \propto e^{-2\alpha z}$. It falls to $1/e$ at $z = \delta/2$; at $z = \delta$ it is down to $1/e^2$.`),
        tf(md`(iii) $-\nabla\cdot\langle\mathbf S\rangle$ is the time-averaged power per unit volume turned into heat.`, true, md`Time-average the Poynting theorem: the stored energy no longer changes on average, so $\nabla\cdot\langle\mathbf S\rangle + \langle\mathbf J\cdot\mathbf E\rangle = 0$, and $\langle\mathbf J\cdot\mathbf E\rangle$ is the heating.`)],
      hints: [md`$\langle S_z\rangle = \tfrac12\Re\{\tilde E_x\tilde H_y^*\}$, with $\tilde H_y = 50(1 - j)$ from (d).`],
      sol: md`
        **1. Compute.** The time-average Poynting vector (formula sheet):
        $$\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$$
        Here $\hat x\times\hat y = \hat z$, so $\langle S_z\rangle = \tfrac12\Re\{\tilde E_x\tilde H_y^*\}$. The conjugate of $50(1 - j)$ is $50(1 + j)$:
        $$\langle S_z\rangle = \tfrac12\Re\{2\cdot50(1 + j)\}$$
        The real part of $100(1 + j)$ is 100:
        $$\boxed{\langle S_z\rangle = 50\ \text{W/m}^2}$$
        A shortcut you can check it with: $\langle S\rangle = \tfrac12|E_0|^2\sigma\delta/2 = \tfrac14(4)(50) = 50$ ✓ (from $\Re\{1/\eta^*\} = \sigma\delta/2$).

        **2. The statements.**
        - (i) **False.** It uses free space's $\eta_0$. Even with the metal's $|\eta|$ it would be wrong, because it ignores the $\cos\tau$: $|E_0|^2/(2|\eta|) = 70.7$, not 50.
        - (ii) **False.** Power goes as the square of the field: $e^{-2\alpha z} = e^{-2z/\delta}$. So $\langle S\rangle$ is down to $1/e$ at $\delta/2$, and to $1/e^2 \approx 0.14$ at $\delta$.
        - (iii) **True.** This is the time-averaged Poynting theorem. In the full theorem $\nabla\cdot\mathbf S + \partial w/\partial t + \mathbf J\cdot\mathbf E = 0$; over a period the stored energy $w$ returns to its start, so its average rate is zero, leaving $-\nabla\cdot\langle\mathbf S\rangle = \langle\mathbf J\cdot\mathbf E\rangle$, the ohmic heating per volume.

        !!intuition Does this make sense?
          Where do the 50 W/m² go? Into heat. Integrate the heating from $0$ to $\delta$: $50(1 - e^{-2}) \approx 43$ W/m², about 86% within the first micron. A microwave current really does live in the skin.

        **Speed path.** $\langle S\rangle = \tfrac12|E_0|^2\Re\{1/\eta^*\}$; for a good conductor $\Re\{1/\eta^*\} = \sigma\delta/2$. So $\tfrac14|E_0|^2\sigma\delta$. For the statements: power decays at $2\alpha$, and "$\eta_0$ inside a metal" is always false.

        **Where points go.** $|E_0|^2/(2|\eta|)$ without $\cos\tau$. Chen's Spring 2024 paper had the same $\eta_0$ statement (false) and the same Poynting-theorem statement (true).
      ` }),
    P({ src: 'Practice A #2(f) · 5 pts', title: 'Four times the frequency',
      q: md`**(f) (5 pts)** The frequency is raised by a factor of 4; $\sigma$ and $\mu$ do not change, and the source is adjusted so that the surface field is again $2\cos(\omega t)\,\hat x$ V/m. Find the new skin depth and the new $\langle S_z\rangle$ at $z = 0^+$.`,
      parts: [trap(N(md`new $\delta$ ($\mu$m)`, 0.5, 'µm'), [[0.25, md`That divides by 4. $\delta \propto 1/\sqrt f$: four times the frequency halves it.`], [2, md`That multiplies. Higher frequency squeezes the current into a thinner skin.`]]),
        trap(N(md`new $\langle S_z\rangle$ at $z = 0^+$ (W/m²)`, 25, 'W/m²'), [[100, md`That is what happens if $\mathbf H$ at the surface stays fixed. Here $\mathbf E$ stays fixed, and $\langle S\rangle = \tfrac14|E_0|^2\sigma\delta$ shrinks with $\delta$.`], [50, md`$\langle S\rangle$ depends on $\eta$, and $\eta$ depends on frequency.`], [12.5, md`That makes $\langle S\rangle \propto \delta^2$. It is proportional to $\sigma\delta$, to the first power.`]])],
      hints: [md`$\delta = \sqrt{2/(\omega\mu\sigma)} \propto 1/\sqrt\omega$. Then use $\langle S\rangle = \tfrac14|E_0|^2\sigma\delta$ from (e).`],
      sol: md`
        !!trap The trap
          Most people expect more frequency to mean more power. With the surface **E** held fixed, it is the opposite.

        **1. The new skin depth.** $\delta = \sqrt{2/(\omega\mu\sigma)}$, so $\delta \propto 1/\sqrt\omega$. Four times $\omega$ divides $\delta$ by $\sqrt4 = 2$:
        $$\boxed{\delta' = 0.5\ \mu\text{m}}$$
        **2. The new η.** $\eta = (1 + j)/(\sigma\delta)$, and $\sigma\delta$ halved to 25 S:
        $$\eta' = \frac{1 + j}{25} = 0.04(1 + j)\ \Omega$$
        $|\eta|$ doubled.

        **3. The new power.** With the same surface field, $\langle S\rangle = \tfrac12|E_0|^2\Re\{1/\eta^*\} = \tfrac14|E_0|^2\sigma\delta$:
        $$\langle S_z\rangle' = \tfrac14(2^2)(25)$$
        $$\boxed{\langle S_z\rangle' = 25\ \text{W/m}^2}$$
        Half of before.

        !!intuition Does this make sense?
          At the higher frequency the metal's $|\eta|$ is twice as big, so the same 2 V/m drives only half the $\mathbf H$ (35 A/m instead of 71). Power is $\mathbf E$ times the in-phase part of $\mathbf H$, so it halves. If instead $\mathbf H$ were held fixed (which is what happens when a wave from air hits the metal, since the metal reflects almost everything and $\mathbf H$ at the wall is about twice the incident $\mathbf H$), the loss would **double**: $\tfrac12|H_0|^2R_s$ with $R_s = 1/(\sigma\delta)$ doubled. Which quantity is held fixed decides the answer. Chen's 2024 statement list asked exactly this kind of question.

        **Speed path.** $\delta \propto f^{-1/2}$, $|\eta| \propto f^{1/2}$. Fixed $E$: $\langle S\rangle \propto 1/|\eta|$, so $\div2$. Fixed $H$: $\langle S\rangle \propto |\eta|$, so $\times2$.

        **Where points go.** $\delta \propto 1/f$ instead of $1/\sqrt f$. Assuming the power goes up. Not reading which field the problem holds fixed.
      ` }),

    // ---------------------------------------------------------------- A Problem 3
    RF(md`
      ### Problem 3 (18 points): a coax from its dimensions

      A coaxial cable has an inner conductor of radius $a = 0.5$ mm and an outer conductor of radius $b$, with $\ln(b/a) = 1.25$ (so $b = 0.5\,e^{1.25} \approx 1.75$ mm). The space between them is filled with polyethylene: $\epsilon_r = 2.25$, $\mu = \mu_0$, $\sigma = 0$. The conductors are perfect. Use $\ln 2 \approx 0.69$ if you need it.

      [[fig:coax]]
    `, { coax: { svg: figA3(), cap: 'Cross-section. The TEM fields live in the shaded filling, between r = a and r = b.' } }),
    P({ src: 'Practice A #3(a) · 4 pts', title: 'Inductance per length',
      q: md`**(a) (4 pts)** Find the inductance per unit length $L$, starting from the magnetic field between the conductors.`,
      parts: [trap(N(md`$L$ (nH/m)`, 250, 'nH/m'), [[500, md`That uses $\mu_0\ln(b/a)/\pi$. The field of a line current is $I/(2\pi r)$, so $L = \mu\ln(b/a)/(2\pi)$.`], [250 * 2.25, md`$L$ depends on $\mu$ only; the dielectric's $\epsilon_r$ does not enter it.`]])],
      hints: [md`Ampère around a circle of radius $r$ between the conductors: $H_\phi = I/(2\pi r)$. Then the flux per meter of length through a strip from $r = a$ to $r = b$: $\Psi' = \int_a^b\mu H_\phi\,dr$, and $L = \Psi'/I$.`],
      sol: md`
        **1. The field.** Put current $I$ on the inner conductor (and $-I$ on the outer). Ampère's law around a circle of radius $r$, with $a < r < b$, encloses only $I$:
        $$H_\phi\cdot2\pi r = I \quad\Rightarrow\quad H_\phi = \frac{I}{2\pi r}$$
        **2. The flux per meter.** The flux threads a flat strip 1 m long that runs from the inner conductor to the outer one:
        $$\Psi' = \int_a^b \mu_0\frac{I}{2\pi r}\,dr = \frac{\mu_0I}{2\pi}\ln\frac ba$$
        **3. L is flux per current.**
        $$L = \frac{\Psi'}{I} = \frac{\mu_0}{2\pi}\ln\frac ba$$
        **4. Numbers.** $\mu_0/(2\pi) = 2\times10^{-7}$ H/m:
        $$L = (2\times10^{-7})(1.25)$$
        $$\boxed{L = 2.5\times10^{-7}\ \text{H/m} = 250\ \text{nH/m}}$$

        !!intuition Does this make sense?
          A wider gap (bigger $b/a$) means more area for flux, so more $L$ ✓. The filling's $\epsilon_r$ does not appear: inductance is about magnetic flux, and polyethylene is not magnetic. 250 nH/m is the number printed on real RG-58 cable.

        **Speed path.** $L = 2\times10^{-7}\,\mu_r\ln(b/a)$ H/m. One multiplication.

        **Where points go.** $\mu_0\ln(b/a)/\pi$ (a factor of 2). Putting $\epsilon_r$ into $L$. Writing $\ln(a/b)$, which is negative.
      ` }),
    P({ src: 'Practice A #3(b) · 4 pts', title: 'Capacitance per length',
      q: md`**(b) (4 pts)** Find the capacitance per unit length $C$.`,
      parts: [trap(N(md`$C$ (pF/m)`, 100, 'pF/m'), [[100 / 2.25, md`That uses $\epsilon_0$. The filling has $\epsilon = 2.25\epsilon_0$, which raises $C$.`], [50, md`That uses $\pi\epsilon/\ln(b/a)$. Gauss gives $E_r = \rho_l/(2\pi\epsilon r)$, so $C = 2\pi\epsilon/\ln(b/a)$.`]])],
      hints: [md`Gauss on a cylinder of radius $r$: $E_r = \rho_l/(2\pi\epsilon r)$. Integrate from $a$ to $b$ for $V$, then $C = \rho_l/V$.`, md`$2\pi\epsilon_0 = \dfrac{2\pi}{36\pi}\times10^{-9} = \dfrac{1}{18}\times10^{-9}$ F/m.`],
      sol: md`
        **1. The field.** Put charge $\rho_l$ per meter on the inner conductor. Gauss's law on a cylinder of radius $r$ (between the conductors), 1 m long:
        $$\epsilon E_r\cdot2\pi r = \rho_l \quad\Rightarrow\quad E_r = \frac{\rho_l}{2\pi\epsilon r}$$
        **2. The voltage** from the inner conductor to the outer one:
        $$V = \int_a^b\frac{\rho_l}{2\pi\epsilon r}\,dr = \frac{\rho_l}{2\pi\epsilon}\ln\frac ba$$
        **3. C is charge per voltage.**
        $$C = \frac{\rho_l}{V} = \frac{2\pi\epsilon}{\ln(b/a)}$$
        **4. Numbers.** $2\pi\epsilon_0 = \tfrac{1}{18}\times10^{-9}$ F/m, so $2\pi\epsilon = \tfrac{2.25}{18}\times10^{-9} = 0.125\times10^{-9}$ F/m:
        $$C = \frac{0.125\times10^{-9}}{1.25}$$
        $$\boxed{C = 10^{-10}\ \text{F/m} = 100\ \text{pF/m}}$$

        !!intuition Does this make sense?
          Closer conductors (smaller $b/a$) mean more capacitance, so $\ln(b/a)$ belongs in the denominator ✓. The filling raises $C$ by $\epsilon_r$. And $LC = \mu\epsilon$ must hold for any TEM line: $(2.5\times10^{-7})(10^{-10}) = 2.5\times10^{-17}$, while $\mu_0\epsilon = (4\pi\times10^{-7})(2.25)\tfrac{10^{-9}}{36\pi} = 2.5\times10^{-17}$ ✓.

        **Speed path.** Once you have $L$, get $C$ from $LC = \mu\epsilon$: $C = \mu\epsilon/L$. It avoids a second integral.

        **Where points go.** Forgetting $\epsilon_r$. Arithmetic with $\epsilon_0$: use $2\pi\epsilon_0 = \tfrac1{18}$ nF/m.
      ` }),
    P({ src: 'Practice A #3(c) · 4 pts', title: 'Z0 and v',
      q: md`**(c) (4 pts)** Find the characteristic impedance $Z_0$ and the propagation speed $v$.`,
      parts: [trap(N(md`$Z_0$ ($\Omega$)`, 50, 'Ω'), [[75, md`That is the air-filled value, $60\ln(b/a)$. The filling divides it by $\sqrt{\epsilon_r} = 1.5$.`], [2500, md`That is $L/C$. $Z_0$ is its square root.`]]),
        trap(N(md`$v$ (m/s)`, 2e8, 'm/s'), [[3e8, md`That is $c$. The filling slows the wave by $\sqrt{\epsilon_r}$.`], [1.333e8, md`That divides $c$ by $\epsilon_r$. Divide by $\sqrt{\epsilon_r}$.`]])],
      hints: [md`$Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$.`],
      sol: md`
        **1. Z0.**
        $$Z_0 = \sqrt{\frac LC} = \sqrt{\frac{2.5\times10^{-7}}{10^{-10}}} = \sqrt{2500}$$
        $$\boxed{Z_0 = 50\ \Omega}$$
        **2. v.**
        $$v = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{2.5\times10^{-17}}} = \frac{1}{5\times10^{-9}}$$
        $$\boxed{v = 2\times10^8\ \text{m/s}}$$

        !!intuition Does this make sense?
          The general coax result is $Z_0 = \dfrac{\eta}{2\pi}\ln\dfrac ba$, with $\eta = \eta_0/\sqrt{\epsilon_r} = 80\pi\ \Omega$ in polyethylene: $\tfrac{80\pi}{2\pi}(1.25) = 40(1.25) = 50\ \Omega$ ✓. And $v = c/\sqrt{\epsilon_r} = 3\times10^8/1.5$ ✓. The speed belongs to the filling, not to the shape: every TEM line in polyethylene runs at $2\times10^8$ m/s.

        **Speed path.** Coax: $Z_0 = \dfrac{60}{\sqrt{\epsilon_r}}\ln\dfrac ba$ and $v = c/\sqrt{\epsilon_r}$. Write both on your card.

        **Where points go.** Giving $L/C$ without the root. Dividing $c$ by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.
      ` }),
    P({ src: 'Practice A #3(d) · 3 pts', title: 'What the cable carries',
      q: md`**(d) (3 pts)** A forward wave with voltage amplitude $|\tilde V^+| = 10$ V (and no reflection) travels on the cable. Find the time-averaged power it carries, and the peak electric field at the surface of the inner conductor.`,
      parts: [trap(N(md`$\langle P\rangle$ (W)`, 1, 'W'), [[2, md`That forgets the $\tfrac12$: the phasor holds the peak value.`]]),
        trap(N(md`peak $E$ at $r = a$ (kV/m)`, 16, 'kV/m'), [[20, md`That is $V/a$. The coax field is $V/(r\ln(b/a))$: at $r = a$ you must also divide by $\ln(b/a) = 1.25$.`], [8.0, md`That is $V/(b - a)$, the parallel-plate habit. The coax field is not uniform: it is $V/(r\ln(b/a))$, largest at $r = a$.`]])],
      hints: [md`$\langle P\rangle = |\tilde V^+|^2/(2Z_0)$. From (b), $E_r = \rho_l/(2\pi\epsilon r)$ and $V = \tfrac{\rho_l}{2\pi\epsilon}\ln(b/a)$, so $E_r = V/(r\ln(b/a))$.`],
      sol: md`
        **1. Power.** On a matched line the forward wave carries
        $$\langle P\rangle = \frac{|\tilde V^+|^2}{2Z_0} = \frac{100}{2\cdot50}$$
        $$\boxed{\langle P\rangle = 1\ \text{W}}$$
        **2. The field at the inner conductor.** Divide the two results of (b) to eliminate $\rho_l$:
        $$E_r(r) = \frac{V}{r\ln(b/a)}$$
        At $r = a = 5\times10^{-4}$ m with $V = 10$ V:
        $$E_r(a) = \frac{10}{(5\times10^{-4})(1.25)}$$
        $$\boxed{E_r(a) = 1.6\times10^4\ \text{V/m} = 16\ \text{kV/m}}$$

        !!intuition Does this make sense?
          The field is strongest at the thin inner conductor and falls as $1/r$, to $16/e^{1.25} \approx 4.6$ kV/m at the outer one. That is why coax breaks down at the center wire first. The current is $10/50 = 0.2$ A, and $\tfrac12(10)(0.2) = 1$ W ✓.

        **Speed path.** $\langle P\rangle = V^2/(2Z_0)$. Field: $V/(a\ln(b/a))$.

        **Where points go.** Dropping the $\tfrac12$. Using $V/a$ or $V/(b - a)$, the parallel-plate habit.
      ` }),
    P({ src: 'Practice A #3(e) · 3 pts', title: 'Which change keeps 50 Ω?',
      q: md`**(e) (3 pts)** Which one change keeps $Z_0 = 50\ \Omega$?`,
      parts: [mc('', [md`Doubling both $a$ and $b$`, md`Doubling $b$ only`, md`Replacing the polyethylene with air`, md`Using a filling with $\epsilon_r = 9$`, md`Using a filling with $\epsilon_r = 2.25$ and $\mu_r = 2.25$`], 0,
        [null, md`$Z_0$ becomes $40(1.25 + \ln2) \approx 77.7\ \Omega$: $\ln(b/a)$ grows by $\ln 2$.`, md`$Z_0 = 60(1.25) = 75\ \Omega$. Less $\epsilon$ means less $C$, so more $Z_0$.`, md`$Z_0 = \tfrac{60}{3}(1.25) = 25\ \Omega$.`, md`$Z_0 \propto \sqrt{\mu/\epsilon}$: $\sqrt{\mu_r/\epsilon_r} = 1$, so $Z_0 = 60(1.25) = 75\ \Omega$.`])],
      hints: [md`$Z_0 = \dfrac{60}{\sqrt{\epsilon_r}}\sqrt{\mu_r}\,\ln\dfrac ba$. Only the **ratio** $b/a$ enters.`],
      sol: md`
        **1. What Z0 depends on.**
        $$Z_0 = \frac{\eta}{2\pi}\ln\frac ba,\qquad \eta = 120\pi\sqrt{\mu_r/\epsilon_r}$$
        Only two things matter: the ratio $b/a$ and the filling's $\sqrt{\mu_r/\epsilon_r}$.

        **2. Check each change.**
        - Doubling $a$ and $b$: $b/a$ unchanged, filling unchanged. $Z_0 = 50\ \Omega$ ✓.
        - Doubling $b$ only: $\ln(b/a) = 1.25 + 0.69 = 1.94$, $Z_0 = 40(1.94) \approx 77.7\ \Omega$.
        - Air: $Z_0 = 60(1.25) = 75\ \Omega$.
        - $\epsilon_r = 9$: $Z_0 = 20(1.25) = 25\ \Omega$.
        - $\epsilon_r = \mu_r = 2.25$: $\sqrt{\mu_r/\epsilon_r} = 1$, so $Z_0 = 75\ \Omega$ (though the wave is now slower, $c/2.25$).

        $$\boxed{\text{doubling both } a \text{ and } b}$$

        !!intuition Does this make sense?
          Scaling the whole cross-section up is like viewing it through a magnifying glass: every field pattern scales with it, the voltage-to-current ratio does not change. That is why thin and thick 50 Ω cables both exist.

        **Speed path.** "Only $b/a$ and $\sqrt{\mu_r/\epsilon_r}$": scan for the option that changes neither.

        **Where points go.** Thinking a bigger cable has a different $Z_0$. Forgetting that $\mu_r$ raises $Z_0$ while $\epsilon_r$ lowers it.
      ` }),

    // ---------------------------------------------------------------- A Problem 4
    RF(md`
      ### Problem 4 (34 points): two lines in cascade

      At $t = 0$ a source $V_g(t) = 90\,u(t)$ V with $R_g = 100\ \Omega$ is connected to two lossless lines in cascade:

      - Line 1: $Z_{01} = 100\ \Omega$, air-filled, from $z = 0$ to $z = 300$ m.
      - Line 2: $Z_{02} = 50\ \Omega$, filled with a dielectric of $\epsilon_r = 9$ ($\mu = \mu_0$), from $z = 300$ m to $z = 400$ m.

      Line 2 ends in $R_L = 150\ \Omega$. Position $z$ runs from the source to the load. Give times in µs.

      [[fig:ckt]]
    `, { ckt: { svg: figA4(), cap: 'A step source, two lines in cascade, a resistive load. The junction is at z = 300 m.' } }),
    P({ src: 'Practice A #4(a) · 5 pts', title: 'Speeds and end coefficients',
      q: md`**(a) (5 pts)** Find the one-way travel time on each line, the injection coefficient $\tau_g$ and the load reflection coefficient $\Gamma_L$. What is $\Gamma_g$?`,
      parts: [trap(N(md`travel time on line 2 (µs)`, 1, 'µs'), [[1 / 3, md`That uses $v = c$ on line 2. Its filling has $\epsilon_r = 9$, so $v = c/3 = 100$ m/µs.`]]),
        trap(N(md`$\tau_g$`, 0.5, ''), [[1 / 3, md`That divides by $R_g + Z_{01} + Z_{02}$. At $t = 0^+$ the source sees only line 1's $Z_{01}$.`]]),
        trap(N(md`$\Gamma_L$`, 0.5, ''), [[0.2, md`That uses $Z_{01} = 100\ \Omega$. The load terminates line 2: $(150 - 50)/(150 + 50)$.`], [-0.5, md`Sign flipped: $\Gamma_L = (R_L - Z_0)/(R_L + Z_0)$.`]]),
        mc(md`$\Gamma_g$`, ['−1/3', '0', '1/3', '1/2'], 1,
          [md`$R_g$ equals $Z_{01}$ exactly, so nothing is reflected at the source.`, null, md`$R_g = Z_{01}$: the numerator $R_g - Z_{01}$ is zero.`, md`That is $\tau_g$. $\Gamma_g = (R_g - Z_{01})/(R_g + Z_{01})$.`], true)],
      hints: [md`$v = c/\sqrt{\epsilon_r}$ on each line. $\tau_g = Z_{01}/(R_g + Z_{01})$: a wave launched on line 1 sees only line 1. $\Gamma_L$ uses the line that touches the load.`],
      sol: md`
        **1. Travel times.** Line 1 is air: $v_1 = c = 300$ m/µs, so $T_1 = 300/300 = 1$ µs. Line 2 has $\epsilon_r = 9$: $v_2 = c/3 = 100$ m/µs, so
        $$T_2 = \frac{100\ \text{m}}{100\ \text{m}/\mu\text{s}}$$
        $$\boxed{T_2 = 1\ \mu\text{s}}$$
        The lines are different lengths but equally long in time.

        **2. τg, the injection coefficient.** Until a reflection comes back, the source sees line 1 as a resistor $Z_{01}$. A divider:
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{100}{200} = \boxed{\tfrac12}$$
        **3. ΓL** uses line 2, the line that touches the load:
        $$\Gamma_L = \frac{R_L - Z_{02}}{R_L + Z_{02}} = \frac{150 - 50}{200} = \boxed{\tfrac12}$$
        **4. Γg** uses line 1:
        $$\Gamma_g = \frac{R_g - Z_{01}}{R_g + Z_{01}} = \frac{100 - 100}{200} = \boxed{0}$$
        Every wave that comes back to the source is absorbed there: the source end is **matched**.

        !!intuition Does this make sense?
          $\tau_g = \tfrac12$ is a divider between two equal resistors ✓. $\Gamma_L > 0$ because $R_L > Z_{02}$ (an end "harder" than the line reflects with the same sign) ✓.

        **Speed path.** $T = l\sqrt{\epsilon_r}/c$; then the three coefficients from the two resistors next to each end.

        **Where points go.** Using $c$ on a filled line. Using the wrong line's $Z_0$ at an end: $\tau_g$ and $\Gamma_g$ use line 1, $\Gamma_L$ uses line 2.
      ` }),
    P({ src: 'Practice A #4(b) · 5 pts', title: 'The junction',
      q: md`**(b) (5 pts)** Find the reflection and transmission coefficients at the junction, $\Gamma_{12}$ and $\tau_{12}$ for a wave arriving from line 1, and $\tau_{21}$ for a wave arriving from line 2.`,
      parts: [trap(N(md`$\Gamma_{12}$`, -1 / 3, ''), [[1 / 3, md`Sign flipped. From line 1 the junction looks like a resistor $Z_{02} = 50 < 100$: a "softer" end reflects with a minus sign.`]]),
        trap(N(md`$\tau_{12}$`, 2 / 3, ''), [[4 / 3, md`That is $\tau_{21}$, for a wave coming from line 2.`]]),
        trap(N(md`$\tau_{21}$`, 4 / 3, ''), [[2 / 3, md`That is $\tau_{12}$. From line 2 the junction looks like $Z_{01} = 100\ \Omega$: $\Gamma_{21} = +\tfrac13$, $\tau_{21} = 1 + \tfrac13$.`]])],
      hints: [md`A wave on line 1 sees line 2 as a resistor $Z_{02}$: $\Gamma_{12} = (Z_{02} - Z_{01})/(Z_{02} + Z_{01})$ and $\tau_{12} = 1 + \Gamma_{12}$. Swap the roles for $\Gamma_{21}$ and $\tau_{21}$.`],
      sol: md`
        **1. Why τ = 1 + Γ at a junction.** The voltage just left of the junction is incident + reflected; just right of it is the transmitted wave alone. The voltage is continuous across a wire joint, so $V^+ + \Gamma V^+ = \tau V^+$, which gives $\tau = 1 + \Gamma$ (this $\tau$ is the transmission coefficient).

        **2. From line 1.** An arriving wave sees line 2 as a resistor $Z_{02} = 50\ \Omega$:
        $$\Gamma_{12} = \frac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}} = \frac{50 - 100}{150} = \boxed{-\tfrac13}$$
        $$\tau_{12} = 1 + \Gamma_{12} = \boxed{\tfrac23}$$
        **3. From line 2.** Now the wave sees line 1 as $Z_{01} = 100\ \Omega$:
        $$\Gamma_{21} = \frac{Z_{01} - Z_{02}}{Z_{01} + Z_{02}} = \frac{100 - 50}{150} = \tfrac13$$
        $$\tau_{21} = 1 + \Gamma_{21} = \boxed{\tfrac43}$$

        !!intuition Does this make sense?
          $\tau_{21} > 1$: the transmitted voltage is bigger than the incident one. Energy is fine, because line 1's $Z_0$ is twice as big, so the same voltage carries less power. Check the power: from line 2, a 1 V wave carries $1/(2\cdot50)$; the reflected part carries $(1/3)^2/(100)$ and the transmitted part $(4/3)^2/(200)$. Their sum is $\tfrac{1}{900} + \tfrac{16}{1800} = \tfrac{18}{1800} = \tfrac{1}{100}$ ✓.

        **Speed path.** $\Gamma_{12} = -\Gamma_{21}$ always. Write $\Gamma_{12} = -\tfrac13$, $\Gamma_{21} = +\tfrac13$, then add 1 to each.

        **Where points go.** Swapping $\tau_{12}$ and $\tau_{21}$. Spring 2024 graded each of the four junction coefficients separately in its little boxes.
      ` }),
    P({ src: 'Practice A #4(c) · 8 pts', title: 'The bounce diagram',
      q: md`**(c) (8 pts)** Draw the voltage bounce diagram for $0 \le t \le 5$ µs. Give the voltage of: the wave transmitted into line 2 at $t = 1$ µs; its reflection from the load; and the wave transmitted back into line 1 at $t = 3$ µs.`,
      parts: [N(md`wave into line 2 at 1 µs (V)`, 30, 'V'), N(md`its reflection from the load (V)`, 15, 'V'),
        trap(N(md`wave back into line 1 at 3 µs (V)`, 20, 'V'), [[10, md`That uses $\tau_{12} = \tfrac23$. The wave is crossing from line 2 into line 1: use $\tau_{21} = \tfrac43$.`], [5, md`That is the part reflected back into line 2 ($\Gamma_{21} = \tfrac13$), not the part transmitted into line 1.`]])],
      hints: [md`$V_1^+ = \tau_gV_g$. At the junction it splits into $\Gamma_{12}V_1^+$ (back) and $\tau_{12}V_1^+$ (into line 2). Follow each piece; each arrival at an end or the junction multiplies by that place's coefficient.`],
      sol: md`
        **1. Launch.** $V_1^+ = \tau_gV_g = \tfrac12(90) = 45$ V on line 1. It reaches the junction at $t = 1$ µs.

        **2. First split at t = 1 µs.**
        $$\text{back into line 1: } \Gamma_{12}(45) = -15\ \text{V}$$
        $$\text{into line 2: } \tau_{12}(45) = \boxed{30\ \text{V}}$$
        The $-15$ V wave reaches the source at $t = 2$ µs and is absorbed ($\Gamma_g = 0$).

        **3. The load at t = 2 µs.** The 30 V wave reflects:
        $$\Gamma_L(30) = \boxed{15\ \text{V}}$$
        **4. Back at the junction, t = 3 µs.** The 15 V wave arrives from line 2 and splits again:
        $$\text{into line 1: } \tau_{21}(15) = \tfrac43(15) = \boxed{20\ \text{V}}$$
        $$\text{back into line 2: } \Gamma_{21}(15) = 5\ \text{V}$$
        **5. Later.** The 20 V wave is absorbed at the source at $t = 4$ µs. The 5 V wave reflects at the load at $t = 4$ µs: $\Gamma_L(5) = 2.5$ V. That reaches the junction at 5 µs and sends $\tfrac43(2.5) = \tfrac{10}{3}$ V into line 1 and $\tfrac56$ V back into line 2.

        [[fig:vb]]

        !!intuition Does this make sense?
          Check the junction at $t = 1^+$ µs: left side $45 - 15 = 30$ V, right side 30 V. Continuous ✓. At $t = 3^+$: left $45 - 15 + 20 = 50$ V, right $30 + 15 + 5 = 50$ V ✓. Doing this check at every junction event catches almost every slip.

        **Speed path.** Write the chain on the diagram as you go: $45 \to (-15, 30)$, $30 \to 15$, $15 \to (20, 5)$, $5 \to 2.5$. Label $\tau_g$, $\Gamma_g$, $\Gamma_L$ and the four junction numbers on the diagram: they are graded.

        **Where points go.** Using $\tau_{12}$ for a wave going from line 2 to line 1. Forgetting that the junction also reflects (the 5 V wave). Reflecting at the source although $\Gamma_g = 0$.
      `,
      figs: { vb: { svg: TL.diagram(sA4, { tMax: 5, w: 380, h: 330 }), cap: 'Voltage bounce diagram. Solid: waves toward the load; dimmer: waves going back. The junction is the dashed line at 300 m. Times in µs.' } } }),
    P({ src: 'Practice A #4(d) · 8 pts', title: 'V(350 m, t)',
      q: md`**(d) (8 pts)** Sketch $V(350\ \text{m}, t)$ for $0 \le t \le 5$ µs, and give its value at $t = 2$, $3$ and $4$ µs.`,
      parts: [N(md`$V(350\ \text{m}, 2\ \mu\text{s})$ (V)`, 30, 'V'),
        trap(N(md`$V(350\ \text{m}, 3\ \mu\text{s})$ (V)`, 45, 'V'), [[30, md`The load's 15 V reflection passes $z = 350$ m at $t = 2.5$ µs, half a microsecond after it leaves the load.`]]),
        trap(N(md`$V(350\ \text{m}, 4\ \mu\text{s})$ (V)`, 50, 'V'), [[65, md`That adds the 20 V wave too, but it went into **line 1**; it never passes $z = 350$ m. Only the 5 V junction reflection does.`], [45, md`The 5 V wave reflected at the junction at 3 µs passes $z = 350$ m at 3.5 µs.`]])],
      hints: [md`$z = 350$ m is the middle of line 2: 0.5 µs from the junction and 0.5 µs from the load. Forward waves in line 2 leave the junction at 1, 3, 5 µs; backward ones leave the load at 2, 4 µs.`],
      sol: md`
        **1. When waves pass z = 350 m.** On line 2, 50 m takes 0.5 µs. So:
        - forward waves leave the junction at 1 and 3 µs and pass at **1.5** and **3.5** µs;
        - backward waves leave the load at 2 and 4 µs and pass at **2.5** and **4.5** µs.

        **2. Add them in time order.** The voltage at a point is the sum of every wave that has passed it so far:
        - $t < 1.5$: $V = 0$ (nothing has arrived)
        - $1.5 < t < 2.5$: $V = 30$ V
        - $2.5 < t < 3.5$: $V = 30 + 15 = 45$ V
        - $3.5 < t < 4.5$: $V = 45 + 5 = 50$ V
        - $4.5 < t < 5$: $V = 50 + 2.5 = 52.5$ V

        $$\boxed{V(2) = 30\ \text{V},\ \ V(3) = 45\ \text{V},\ \ V(4) = 50\ \text{V}}$$

        [[fig:v350]]

        !!intuition Does this make sense?
          The staircase climbs toward the dashed DC value, 54 V (part f), from below, because every coefficient in line 2's loop ($\Gamma_L = +\tfrac12$, $\Gamma_{21} = +\tfrac13$) is positive. A ringing (overshooting) staircase would need a negative product.

        **Speed path.** Draw a vertical line at 350 m on the bounce diagram and read off where it crosses each slanted line, top to bottom. Add as you go.

        **Where points go.** Counting a wave that went into line 1 (the 20 V) as if it passed through line 2. Getting the half-microsecond offsets from the wrong end.
      `,
      figs: { v350: { svg: TL.plotT(sA4, 350, { tMax: 5 }), cap: 'V(350 m, t) in volts. Dashed: the DC steady state, 54 V.' } } }),
    P({ src: 'Practice A #4(e) · 4 pts', title: 'I(150 m, t)',
      q: md`**(e) (4 pts)** Find the current $I(150\ \text{m}, t)$ at $t = 2$ µs and $t = 4$ µs.`,
      parts: [trap(N(md`$I(150\ \text{m}, 2\ \mu\text{s})$ (A)`, 0.6, 'A'), [[0.3, md`That gives the backward $-15$ V wave a current of $-15/100$. A backward wave carries $I^- = -V^-/Z_0 = +0.15$ A.`]]),
        trap(N(md`$I(150\ \text{m}, 4\ \mu\text{s})$ (A)`, 0.4, 'A'), [[0.8, md`The backward 20 V wave carries $-20/100 = -0.2$ A, not $+0.2$ A.`], [0.6, md`The 20 V wave from the junction passes $z = 150$ m at $t = 3.5$ µs.`]])],
      hints: [md`Forward waves carry $I^+ = V^+/Z_0$; backward waves carry $I^- = -V^-/Z_0$. Line 1 has $Z_{01} = 100\ \Omega$.`, md`$z = 150$ m is 0.5 µs from both ends of line 1. Line 1's waves: $+45$ V forward (passes at 0.5 µs), $-15$ V backward (passes at 1.5 µs), $+20$ V backward (passes at 3.5 µs).`],
      sol: md`
        **1. The current rule.** A forward wave carries power toward the load, so its current along $+z$ is $I^+ = +V^+/Z_0$. A backward wave carries power toward the source: $I^- = -V^-/Z_0$.

        **2. Line 1's waves at z = 150 m** (0.5 µs from each end):
        - $+45$ V forward, passes at 0.5 µs: $I = +45/100 = +0.45$ A
        - $-15$ V backward, passes at 1.5 µs: $I = -(-15)/100 = +0.15$ A
        - $+20$ V backward, passes at 3.5 µs: $I = -(20)/100 = -0.2$ A

        **3. Add.**
        $$I(150, 2) = 0.45 + 0.15 = \boxed{0.6\ \text{A}}$$
        $$I(150, 4) = 0.6 - 0.2 = \boxed{0.4\ \text{A}}$$

        !!intuition Does this make sense?
          Between 1.5 and 3.5 µs, line 1 holds $V = 30$ V and $I = 0.6$ A, and $30/0.6 = 50\ \Omega$: until line 2's own reflections come back, line 1 simply sees line 2 as a $50\ \Omega$ resistor ✓. The steady state is $90/250 = 0.36$ A (part f), and $0.4$ A is on its way there.

        **Speed path.** Current diagram = voltage diagram $\div Z_0$ with the sign of every backward wave flipped. Then add at the point.

        **Where points go.** Keeping the voltage's sign for a backward current. Dividing line 1's waves by $Z_{02}$.
      ` }),
    P({ src: 'Practice A #4(f) · 4 pts', title: 'Steady state',
      q: md`**(f) (4 pts)** As $t\to\infty$, find the load voltage and the current anywhere on the lines.`,
      parts: [trap(N(md`$V_L(t\to\infty)$ (V)`, 54, 'V'), [[45, md`That is the voltage divider with $Z_{01}$ in place of $R_L$. In steady state the lines are just wires; $Z_0$ drops out.`]]),
        trap(N(md`$I(t\to\infty)$ (A)`, 0.36, 'A'), [[0.9, md`That is $V_g/R_g$, a short at the load. The load is 150 Ω.`], [0.6, md`That is the current during $1.5 < t < 3.5$ µs on line 1, not the final value.`]])],
      hints: [md`After the bounces die out, a lossless line has the same $V$ and $I$ along its whole length: it is a pair of wires.`],
      sol: md`
        **1. The DC circuit.** When nothing changes in time, the telegrapher's equations say $\partial V/\partial z = 0$ and $\partial I/\partial z = 0$: each lossless line is a pair of ideal wires. The circuit is $V_g$, $R_g$ and $R_L$ in series:
        $$I = \frac{V_g}{R_g + R_L} = \frac{90}{250}$$
        $$\boxed{I = 0.36\ \text{A}}$$
        $$V_L = IR_L = (0.36)(150) = \boxed{54\ \text{V}}$$

        !!intuition Does this make sense?
          The staircase of (d) was heading here: 30, 45, 50, 52.5, … → 54 V ✓. The two lines' impedances decide how the voltage gets there, not where it ends. Spring 2024 asked the same: the DC current at the middle of the line.

        **Speed path.** Ignore both lines: $V_gR_L/(R_g + R_L)$.

        **Where points go.** Putting a $Z_0$ into the DC divider. Giving the current at a particular moment instead of the limit.
      ` }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-a', order: 1, title: 'Practice exam A', kind: 'mock', sub: '75 min · 100 pts · two perpendicular sheets, a good conductor, a coax, two lines in cascade', steps: examA });

  // ======================================================================================== EXAM B: figures
  // B1: the wave, side view (x to the right, z up, so y points into the page and -y out of it)
  function figB1() {
    const g = PF.fig({ alt: 'side view: x runs to the right, the direction of travel; z is up; y points into the page; a sketch of the field E_z decaying along x; at the right, E points up along +z and H comes out of the page, along -y' });
    const ox = 50, oy = 110;
    g.arrow(ox - 10, oy, 300, oy, { cls: 'dim', hs: 6 }); g.label(304, oy, 'x', 'l', 'small accent');
    g.arrow(ox, oy + 10, ox, 30, { cls: 'dim', hs: 6 }); g.label(ox + 4, 30, 'z', 'bl', 'small accent');
    g.otimes(ox, oy, 5); g.label(ox - 8, oy + 6, 'y', 'tr', 'small accent');
    const pts = [];
    for (let i = 0; i <= 240; i++) { const x = (i / 240) * 1.5; pts.push([ox + 160 * x, oy - 70 * Math.exp(-PI * x) * Math.cos(2 * PI * x)]); }
    g.pl(pts, { cls: 'curve' });
    g.label(ox + 60, 46, 'E_z(x, 0)', 'l', 'small');
    // the field directions at a point
    const px = 350, py = 90;
    g.arrow(px, py, px, py - 44, { hs: 7 }); g.label(px + 6, py - 40, '\\mathbf E\\ (+\\hat z)', 'l', 'small');
    g.odot(px, py + 26, 6); g.label(px + 10, py + 26, '\\mathbf H\\ (-\\hat y)', 'l', 'small');
    g.arrow(px - 10, py + 58, px + 50, py + 58, { hs: 7 }); g.label(px + 54, py + 58, '\\text{travel}', 'l', 'small');
    return g.svg();
  }
  // B1 solution: eta in the complex plane
  function figB1sol() {
    const g = PF.fig({ alt: 'eta drawn in the complex plane: 48 pi along the real axis and 24 pi up the imaginary axis; the arrow makes the angle tau with the real axis, with tan tau = 1/2' });
    const ox = 40, oy = 150, k = 200 / 48;
    g.arrow(ox - 10, oy, ox + 250, oy, { cls: 'dim', hs: 6 }); g.label(ox + 254, oy, '\\text{Re}', 'l', 'small');
    g.arrow(ox, oy + 10, ox, oy - 140, { cls: 'dim', hs: 6 }); g.label(ox + 4, oy - 140, '\\text{Im}', 'bl', 'small');
    g.line(ox + 48 * k, oy, ox + 48 * k, oy - 24 * k, { cls: 'dash' });
    g.arrow(ox, oy, ox + 48 * k, oy - 24 * k, { cls: 'thick', hs: 9 });
    g.label(ox + 24 * k, oy + 6, '48\\pi', 't', 'small');
    g.label(ox + 48 * k + 8, oy - 12 * k, '24\\pi', 'l', 'small');
    g.angle(ox, oy, 56, 0, 26.57, '\\tau');
    g.label(ox + 22 * k, oy - 16 * k, '|\\eta| = 24\\sqrt5\\,\\pi', 'br', 'small');
    return g.svg();
  }
  // B2: the interface
  function figB2() {
    const g = PF.fig({ alt: 'side view: region 1, shaded, fills z < 0 and has relative permittivity 9; region 2 is air for z > 0; an incident arrow goes right toward the interface in region 1, a reflected arrow goes left in region 1, and a transmitted arrow goes right in region 2' });
    g.rect(30, 30, 180, 130, { cls: 'shade' });
    g.line(210, 30, 210, 160, { cls: 'thick' });
    g.label(120, 46, '\\text{region 1: } \\epsilon_r = 9', 'c', 'small');
    g.label(300, 46, '\\text{region 2: air}', 'c', 'small');
    g.arrow(60, 84, 190, 84, { hs: 8 }); g.label(125, 78, '\\mathbf E_i', 'b', 'small');
    g.arrow(190, 122, 60, 122, { hs: 8 }); g.label(125, 128, '\\mathbf E_r', 't', 'small');
    g.arrow(230, 102, 370, 102, { hs: 8 }); g.label(300, 96, '\\mathbf E_t', 'b', 'small');
    g.arrow(30, 178, 390, 178, { cls: 'dim', hs: 6 }); g.label(394, 178, 'z', 'l', 'small accent');
    g.label(210, 184, '0', 't', 'small');
    return g.svg();
  }
  const figB2sol = () => plot({
    w: 380, h: 210, x: [-1.25, 0.55], y: [0, 21.5], xl: 'z\\,(\\text{m})', yl: '|\\tilde E|\\ (\\text{V/m})',
    xt: [[-1, '-1'], [-0.75, '-\\tfrac34'], [-0.5, '-\\tfrac12'], [-0.25, '-\\tfrac14'], [0, '0']], yt: [[6, '6'], [12, '12'], [18, '18']],
    curves: [{ f: (z) => (z <= 0 ? 12 * Math.sqrt(1.25 + Math.cos(4 * PI * z)) : 18), n: 720 }],
  });
  // B3: a delta pulse on a shorted line
  const sB3 = TL.solve({ Vg: 80, Rg: 150, RL: 0, sections: [{ Z0: 50, len: 300, v: 100 }], tMax: 12 });
  const figB3 = () => circuit([
    { t: 'gen', R: 'R_g = 150\\,\\Omega', V: '80\\,\\delta(t)' }, { t: 'wire', w: 14 },
    { t: 'line', w: 240, lab: 'Z_0 = 50\\,\\Omega', sub: '\\epsilon_r = 9', probe: 1 / 3 },
    { t: 'short', lab: 'R_L = 0' },
  ], { ticks: [[2, '0'], [2, '100\\,\\text{m}', 1 / 3], [3, '300\\,\\text{m}']], alt: 'a pulse generator 80 delta(t) with Rg = 150 ohms drives a 50-ohm line filled with relative permittivity 9, from z = 0 to z = 300 m, shorted at the far end; a probe sits at z = 100 m' });
  const figB3z = () => plot({
    w: 380, h: 190, x: [0, 320], y: [-26, 8], zero: true, xl: 'z\\,(\\text{m})', yl: 'V(z,\\,4\\,\\mu\\text{s})\\ (\\text{V})',
    xt: [[100, '100'], [200, '200'], [300, '300']], yt: [[-20, '-20']],
    curves: [{ pts: [[200, 0], [200, -20]] }],
    pts: [{ x: 200, y: -20, lab: '\\leftarrow\\ \\text{moving toward } {-z}', anchor: 'bl' }],
  });
  // B4: the two stubs
  function stubPanel(kind) {
    const g = PF.fig({ alt: `a stub: two thick rails 0.5 m long of 50-ohm line, input terminals at the left, ${kind === 'short' ? 'a short circuit' : 'an open circuit'} at the right` });
    const x0 = 46, x1 = 230, T = 30, B = 100, M = (T + B) / 2;
    g.circle(x0, T, 3, { cls: 'bgfill' }); g.circle(x0, B, 3, { cls: 'bgfill' });
    g.line(x0 + 3, T, x1, T, { cls: 'thick' }); g.line(x0 + 3, B, x1, B, { cls: 'thick' });
    if (kind === 'short') g.line(x1, T, x1, B, { cls: 'thick' });
    else { g.circle(x1 + 3, T, 3, { cls: 'bgfill' }); g.circle(x1 + 3, B, 3, { cls: 'bgfill' }); }
    g.label(x0 - 8, M, 'Z_\\text{in}', 'r', 'small');
    g.label((x0 + x1) / 2, T + 18, 'Z_0 = 50\\,\\Omega', 'c', 'small');
    g.label((x0 + x1) / 2, B - 18, 'l = 0.5\\,\\text{m}', 'c', 'small');
    g.label(x1 + 10, M, kind === 'short' ? '\\text{short}' : '\\text{open}', 'l', 'small');
    return g.svg();
  }
  const figB4 = () => PF.row([
    { svg: stubPanel('short'), cap: 'Stub S: shorted at the far end.' },
    { svg: stubPanel('open'), cap: 'Stub O: open at the far end.' },
  ]).svg;
  const figB4sol = () => plot({
    w: 380, h: 230, x: [0, 260], y: [-160, 160], zero: true, xl: 'f\\,(\\text{MHz})', yl: 'X\\ (\\Omega)',
    xt: [[50, '50'], [100, '100'], [150, '150'], [200, '200']], yt: [[50, '50'], [-50, '-50']],
    curves: [
      { f: (f) => 50 * Math.tan(PI * f / 200), n: 900, lab: 'X_S', labAt: 62, dx: 6, dy: -4 },
      { f: (f) => -50 / Math.tan(PI * f / 200), n: 900, cls: 'dash', lab: 'X_O', labAt: 30, dx: 4, dy: 14 },
    ],
  });

  // ======================================================================================== EXAM B
  const examB = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** Four problems cut into short parts, numbers that work without a calculator, statements to judge, and one trap part, as on Prof. Chen's Spring 2024 Exam 3. This paper leans on reading things off: a wave's formula, a material's response, a pulse's echoes.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Reading a lossy wave $\mathbf E(x,t)$, $\mathbf H(x,t)$: $\alpha$, $\beta$, $f$, $\eta$, then $\mu$, $\sigma$, $\epsilon$, and the power | 26 |
      | 2 | A dielectric-to-air interface: $\Gamma$, $\tau$, the three waves, power fractions, the standing wave in region 1 | 24 |
      | 3 | A delta pulse on a shorted line: bounce diagram, $V$ vs $t$ at a probe, $V$ vs $z$ at an instant, currents | 26 |
      | 4 | Shorted and open stubs: reactance, equivalent $L$ and $C$, resonances, a pair in parallel | 24 |

      **Draws on:** [where γ and η come from](#/l/w2-gamma), [reading a lossy wave](#/l/w2-read), [power in lossy media](#/l/w2-loss), [reflection and transmission](#/l/w4-gamma), [standing waves](#/l/w4-standing), [launching waves](#/l/w5-launch), [bounce diagrams](#/l/w5-bounce) and [stubs and resonance](#/l/w6-stubs).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- B Problem 1
    RF(md`
      ### Problem 1 (26 points): read the material off the wave

      A uniform plane wave travels toward $+x$ through a homogeneous material whose $\sigma$, $\epsilon$ and $\mu$ are all unknown. Its fields are
      $$\mathbf E = 60\pi\,e^{-\pi x}\cos(\omega t - 2\pi x)\,\hat z\ \ \text{V/m}$$
      $$\begin{aligned}\mathbf H = -e^{-\pi x}\big[&\cos(\omega t - 2\pi x)\\ &+ \tfrac12\sin(\omega t - 2\pi x)\big]\,\hat y\ \ \text{A/m}\end{aligned}$$
      with $\omega = 1.5\pi\times10^8$ rad/s and $x$ in meters. Use $\sin\theta = \cos(\theta - 90°)$.

      [[fig:wave]]
    `, { wave: { svg: figB1(), cap: 'The wave travels toward +x. E is along +z; H, at the moment drawn, along −y (out of the page).' } }),
    P({ src: 'Practice B #1(a) · 4 pts', title: 'α and β',
      q: md`**(a) (4 pts)** Read off the attenuation constant $\alpha$ and the phase constant $\beta$.`,
      parts: [trap(N(md`$\alpha$ (Np/m)`, PI, 'Np/m'), [[2 * PI, md`That is $\beta$, the coefficient inside the cosine. $\alpha$ sits in the exponential.`], [60 * PI, md`That is the amplitude at $x = 0$, in V/m.`]]),
        trap(N(md`$\beta$ (rad/m)`, 2 * PI, 'rad/m'), [[PI, md`That is $\alpha$. $\beta$ multiplies $x$ inside the cosine.`]])],
      hints: [md`Match the field to $E_0e^{-\alpha x}\cos(\omega t - \beta x)$, term by term.`],
      sol: md`
        **1. The template.** A forward wave in a lossy medium has the form (formula sheet, with $x$ in place of $z$)
        $$E_0\,e^{-\alpha x}\cos(\omega t - \beta x + \phi)$$
        **2. Match.** The exponential is $e^{-\pi x}$ and the cosine holds $-2\pi x$:
        $$\boxed{\alpha = \pi \approx 3.14\ \text{Np/m},\quad \beta = 2\pi \approx 6.28\ \text{rad/m}}$$
        So $\gamma = \alpha + j\beta = \pi(1 + 2j)\ \text{m}^{-1}$, and the wavelength is $\lambda = 2\pi/\beta = 1$ m.

        !!intuition Does this make sense?
          Both signs say "toward $+x$": the field shrinks as $x$ grows ($e^{-\alpha x}$), and the phase $\omega t - \beta x$ stays constant if $x$ grows with $t$. A wave always decays in the direction it travels. Here it loses a factor $e^{-\pi} \approx 1/23$ per wavelength: a lossy material.

        **Speed path.** Exponent: $\alpha$. Coefficient of $x$ in the cosine: $\beta$. Five seconds.

        **Where points go.** Swapping $\alpha$ and $\beta$. Calling $|\gamma|$ "$\alpha$".
      ` }),
    P({ src: 'Practice B #1(b) · 4 pts', title: 'Frequency and phase speed',
      q: md`**(b) (4 pts)** Find the frequency $f$ and the phase velocity $v_p$.`,
      parts: [trap(N(md`$f$ (Hz)`, 7.5e7, 'Hz'), [[1.5 * PI * 1e8, md`That is $\omega$, in rad/s. Divide by $2\pi$.`], [1.5e8, md`That divides $\omega$ by $\pi$ instead of $2\pi$.`]]),
        trap(N(md`$v_p$ (m/s)`, 7.5e7, 'm/s'), [[3e8, md`That is $c$. In a material the phase moves at $\omega/\beta$.`], [1.5e8, md`That divides $\omega$ by $\pi$, which is $\alpha$. Use $\beta = 2\pi$.`]])],
      hints: [md`$f = \omega/2\pi$ and $v_p = \omega/\beta = \lambda f$.`],
      sol: md`
        **1. f.**
        $$f = \frac{\omega}{2\pi} = \frac{1.5\pi\times10^8}{2\pi}$$
        $$\boxed{f = 7.5\times10^7\ \text{Hz} = 75\ \text{MHz}}$$
        **2. vp.**
        $$v_p = \frac{\omega}{\beta} = \frac{1.5\pi\times10^8}{2\pi}$$
        $$\boxed{v_p = 7.5\times10^7\ \text{m/s} = c/4}$$

        !!intuition Does this make sense?
          Check with $v_p = \lambda f = (1\ \text{m})(75\ \text{MHz})$ ✓. The wave moves at a quarter of $c$. For a lossless material that would mean $\mu_r\epsilon_r = 16$; with loss the link is less direct, and parts (d) and (e) will show what the material really is.

        **Speed path.** $\lambda = 1$ m, so $v_p$ equals $f$ numerically.

        **Where points go.** Giving $\omega$ as $f$. Dividing by $\alpha$ instead of $\beta$.
      ` }),
    P({ src: 'Practice B #1(c) · 5 pts', title: 'η from E and H',
      q: md`**(c) (5 pts)** Write the phasors $\tilde E_z$ and $\tilde H_y$, and find the intrinsic impedance $\eta$.`,
      parts: [trap(N(md`$\Re\{\eta\}$ ($\Omega$)`, 48 * PI, 'Ω'), [[60 * PI, md`That ignores the $\tfrac12\sin$ term of $\mathbf H$: it divides $60\pi$ by 1. The sine part changes both the size and the angle of $\tilde H_y$.`], [-48 * PI, md`That forgets the minus sign of $H_y$. For travel along $+x$ with $\mathbf E$ along $+\hat z$, $\mathbf H$ points along $-\hat y$, so $\eta = \tilde E_z/(-\tilde H_y)$.`]]),
        trap(N(md`$\Im\{\eta\}$ ($\Omega$)`, 24 * PI, 'Ω'), [[-24 * PI, md`That maps the sine to $+j$. $\sin\theta = \cos(\theta - 90°) \leftrightarrow -j$, so $\tilde H_y \propto -(1 - j/2)$ and $\eta$ ends up with $+j$.`]])],
      hints: [md`$\cos(\omega t - 2\pi x) \leftrightarrow e^{-j2\pi x}$ and $\sin(\omega t - 2\pi x) \leftrightarrow -j\,e^{-j2\pi x}$.`, md`For travel along $+\hat x$: $\hat z\times\hat h = \hat x$ needs $\hat h = -\hat y$. So $\eta = \tilde E_z/(-\tilde H_y)$.`],
      sol: md`
        **1. The E phasor.** A cosine maps to its amplitude times the space factor:
        $$\tilde E_z = 60\pi\,e^{-\pi x}e^{-j2\pi x}$$
        **2. The H phasor.** The bracket has a cosine (maps to 1) and half a sine. A sine is a cosine delayed $90°$, which maps to $-j$:
        $$\tfrac12\sin(\omega t - 2\pi x) \leftrightarrow -\tfrac{j}{2}\,e^{-j2\pi x}$$
        With the minus sign in front:
        $$\tilde H_y = -\left(1 - \tfrac j2\right)e^{-\pi x}e^{-j2\pi x}$$
        **3. Which ratio is η.** $\eta$ is $|\mathbf E|/|\mathbf H|$ with the phase of $\mathbf H$ measured behind $\mathbf E$, for $\mathbf E$ and $\mathbf H$ arranged so that $\hat e\times\hat h$ is the direction of travel. With $\hat e = \hat z$ and travel $\hat x$, $\hat h = -\hat y$ (check: $\hat z\times(-\hat y) = \hat x$). So
        $$\eta = \frac{\tilde E_z}{-\tilde H_y} = \frac{60\pi}{1 - j/2}$$
        **4. Divide.** Multiply top and bottom by the conjugate $1 + j/2$; the bottom becomes $1 + \tfrac14 = \tfrac54$:
        $$\eta = \frac{60\pi\,(1 + j/2)}{5/4} = 48\pi\left(1 + \tfrac j2\right)$$
        $$\boxed{\eta = 48\pi + j24\pi \approx 151 + j75.4\ \Omega}$$
        Its size is $24\pi\sqrt{2^2 + 1^2} = 24\sqrt5\,\pi \approx 169\ \Omega$ and its angle is $\tau = \tan^{-1}\tfrac12 \approx 26.6°$.

        [[fig:eta]]

        !!intuition Does this make sense?
          A positive angle means $\mathbf H$ lags $\mathbf E$, as it must in any material with loss ($0 < \tau < 45°$). Look at the time form: $\cos\theta + \tfrac12\sin\theta$ reaches its peak a little after $\cos\theta$ does. That is the lag, read straight off the formula.

        **Speed path.** "cos + ½ sin" is the phasor $1 - j/2$. Then $\eta = 60\pi/(1 - j/2)$, and dividing by $1 - j/2$ is multiplying by $\tfrac45(1 + j/2)$.

        **Where points go.** $+j$ for a sine. Forgetting the minus sign of $\mathbf H$ (gives a negative $\Re\{\eta\}$, which no passive material has). Keeping the $e^{-\pi x}$ in $\eta$: it cancels.
      `,
      figs: { eta: { svg: figB1sol(), cap: 'η in the complex plane: twice as much real part as imaginary part, so tan τ = 1/2.' } } }),
    P({ src: 'Practice B #1(d) · 4 pts', title: 'The permeability',
      q: md`**(d) (4 pts)** Find the relative permeability $\mu_r$ of the material.`,
      parts: [trap(N(md`$\mu_r$`, 2, ''), [[1, md`Nothing in the problem says the material is nonmagnetic. Compute $\mu = \gamma\eta/(j\omega)$ from the two things you measured.`], [0.5, md`That divides by $\gamma\eta$ instead of multiplying, or inverts the ratio at the end.`]])],
      hints: [md`Formula sheet: $\eta\gamma = j\omega\mu$, so $\mu = \gamma\eta/(j\omega)$. Multiply $\pi(1 + 2j)$ by $24\pi(2 + j)$ first.`],
      sol: md`
        **1. The law.** Both $\gamma$ and $\eta$ come from the same two Maxwell equations; their product keeps only Faraday's law:
        $$\eta\gamma = j\omega\mu \quad\Rightarrow\quad \mu = \frac{\gamma\eta}{j\omega}$$
        **2. Multiply γη.** Write $\eta = 48\pi + j24\pi = 24\pi(2 + j)$ and $\gamma = \pi(1 + 2j)$:
        $$\gamma\eta = 24\pi^2\,(1 + 2j)(2 + j)$$
        Expand: $(1 + 2j)(2 + j) = 2 + j + 4j + 2j^2 = 2 + 5j - 2 = 5j$:
        $$\gamma\eta = 120\pi^2\,j$$
        **3. Divide by jω.** The $j$ cancels:
        $$\mu = \frac{120\pi^2}{1.5\pi\times10^8} = 80\pi\times10^{-8}\ \text{H/m}$$
        That is $8\pi\times10^{-7} = 2(4\pi\times10^{-7})$:
        $$\boxed{\mu_r = 2}$$

        !!intuition Does this make sense?
          $\gamma\eta$ came out **purely imaginary**, so $\mu$ is real: a material with no magnetic loss, as the course assumes. If you had gotten a real part, one of $\gamma$ or $\eta$ would be wrong. That makes this a free check on (c).

        **Speed path.** Angles: $\angle\gamma = 90° - \tau$ and $\angle\eta = \tau$ always sum to $90°$. Sizes: $|\gamma||\eta| = \sqrt5\pi\cdot24\sqrt5\pi = 120\pi^2$. Then divide by $\omega$.

        **Where points go.** Assuming $\mu_0$. That single habit wrecks (e) too: with $\mu = \mu_0$ you would get $\sigma = \tfrac1{15}$ S/m and $\epsilon_r = 12$, both wrong.
      ` }),
    P({ src: 'Practice B #1(e) · 5 pts', title: 'Conductivity and permittivity',
      q: md`**(e) (5 pts)** Find $\sigma$ and $\epsilon_r$. Is the material a good conductor, a good dielectric, or neither?`,
      parts: [trap(N(md`$\sigma$ (S/m)`, 1 / 30, 'S/m'), [[1 / 15, md`That is what you get with $\mu = \mu_0$ (an $\eta$ half as large). Use the $\eta$ measured in (c).`], [1 / 40, md`That is $\omega\epsilon$, the imaginary part of $\gamma/\eta$. $\sigma$ is the real part.`]]),
        trap(N(md`$\epsilon_r$`, 6, ''), [[12, md`That comes from assuming $\mu = \mu_0$.`], [8, md`That takes $\epsilon = \sigma/\omega$: the real part instead of the imaginary part of $\gamma/\eta$.`]]),
        mc('The material is', [md`neither: $\sigma/\omega\epsilon = 4/3$`, md`a good conductor: it decays by $e^{-\pi}$ per meter`, md`a good dielectric: $\tau$ is well below $45°$`, md`a good conductor, because $\alpha$ and $\beta$ are close`], 0,
          [null, md`Every lossy wave decays. The classification uses the ratio of the two currents, $\sigma/\omega\epsilon$, which here is close to 1.`, md`A good dielectric needs $\sigma/\omega\epsilon \ll 1$ and $\tau \approx 0$. Here $\tau \approx 27°$, more than halfway to $45°$.`, md`A good conductor has $\alpha = \beta$ exactly. Here $\beta = 2\alpha$.`])],
      hints: [md`Formula sheet: $\gamma/\eta = \sigma + j\omega\epsilon$. Divide $\pi(1 + 2j)$ by $24\pi(2 + j)$: multiply top and bottom by $2 - j$.`],
      sol: md`
        **1. The law.** The ratio keeps only Ampère's law:
        $$\frac{\gamma}{\eta} = \sigma + j\omega\epsilon$$
        Its real part is the conduction term and its imaginary part the displacement term.

        **2. Divide.**
        $$\frac{\gamma}{\eta} = \frac{\pi(1 + 2j)}{24\pi(2 + j)} = \frac{(1 + 2j)(2 - j)}{24\cdot5}$$
        Expand the top: $2 - j + 4j - 2j^2 = 4 + 3j$:
        $$\frac{\gamma}{\eta} = \frac{4 + 3j}{120}$$
        **3. Read the parts.**
        $$\boxed{\sigma = \frac{4}{120} = \frac1{30} \approx 0.0333\ \text{S/m}}$$
        $$\omega\epsilon = \frac{3}{120} = \frac{1}{40}\ \text{S/m}$$
        **4. εr.** $\epsilon = \dfrac{1}{40\omega} = \dfrac{1}{40(1.5\pi\times10^8)} = \dfrac{1}{6\pi\times10^9}$ F/m. Divide by $\epsilon_0 = \dfrac{1}{36\pi\times10^9}$:
        $$\boxed{\epsilon_r = \frac{36\pi}{6\pi} = 6}$$
        **5. Classify.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{1/30}{1/40} = \frac43$$
        The two currents are about equal: **neither** limit applies, which is why the exact $\gamma$ and $\eta$ were needed. Check: $\tau = \tfrac12\tan^{-1}(4/3) = \tfrac12(53.1°) = 26.6°$, matching (c) ✓.

        !!intuition Does this make sense?
          Recompute $\gamma$ from the material: $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$. With $\omega\mu = 1.5\pi\times10^8\cdot8\pi\times10^{-7} = 120\pi^2$ and $\sigma + j\omega\epsilon = (4 + 3j)/120$: $\gamma^2 = j\pi^2(4 + 3j) = \pi^2(-3 + 4j)$, and $(1 + 2j)^2 = -3 + 4j$ ✓. So $\gamma = \pi(1 + 2j)$, the wave we started with.

        **Speed path.** $\gamma/\eta$ in one division; real part $\sigma$, imaginary part $\omega\epsilon$. The 3-4-5 triangle ($4 + 3j$) is a sign the numbers were chosen for you.

        **Where points go.** Taking $\epsilon = \Im\{\gamma/\eta\}$ without dividing by $\omega$. Classifying by "it decays fast".
      ` }),
    P({ src: 'Practice B #1(f) · 4 pts', title: 'The power it carries',
      q: md`**(f) (4 pts)** Find $\langle S_x\rangle$ at $x = 0$, and the distance over which $\langle S_x\rangle$ falls by a factor of $e$.`,
      parts: [trap(N(md`$\langle S_x\rangle$ at $x = 0$ (W/m²)`, 30 * PI, 'W/m²'), [[0.5 * 60 * PI * Math.sqrt(1.25), md`That is $\tfrac12|\tilde E||\tilde H|$: it ignores the angle between them. Only the part of $\mathbf H$ in phase with $\mathbf E$ carries average power.`], [60 * PI, md`That forgets the $\tfrac12$ of the time average.`]]),
        trap(N(md`distance for a factor $e$ in power (m)`, 1 / (2 * PI), 'm'), [[1 / PI, md`That is $1/\alpha$, where the **field** has fallen by $e$. Power goes as the field squared: $e^{-2\alpha x}$.`]])],
      hints: [md`$\langle S_x\rangle = \tfrac12\Re\{\tilde E_z(-\tilde H_y)^*\}$ at $x = 0$. And $\langle S\rangle \propto e^{-2\alpha x}$.`],
      sol: md`
        **1. The formula.** $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. With $\tilde{\mathbf E}$ along $\hat z$ and $\tilde{\mathbf H}$ along $\hat y$, $\hat z\times\hat y = -\hat x$, so
        $$\langle S_x\rangle = \tfrac12\Re\{\tilde E_z\,(-\tilde H_y)^*\}$$
        **2. At x = 0.** $\tilde E_z = 60\pi$ and $-\tilde H_y = 1 - j/2$, whose conjugate is $1 + j/2$:
        $$\langle S_x\rangle = \tfrac12\Re\{60\pi(1 + j/2)\} = \tfrac12(60\pi)$$
        $$\boxed{\langle S_x\rangle = 30\pi \approx 94.2\ \text{W/m}^2}$$
        **3. The decay.** Both fields carry $e^{-\alpha x}$, so the power carries $e^{-2\alpha x}$. It falls by $e$ when $2\alpha x = 1$:
        $$\boxed{x = \frac{1}{2\alpha} = \frac{1}{2\pi} \approx 0.159\ \text{m}}$$

        !!intuition Does this make sense?
          Same answer by the other route: $\langle S\rangle = \dfrac{|E_0|^2}{2|\eta|}\cos\tau = \dfrac{(60\pi)^2}{2(24\sqrt5\pi)}\cdot\dfrac{2}{\sqrt5} = \dfrac{3600\pi}{120} = 30\pi$ ✓ ($\cos\tau = 2/\sqrt5$ from the triangle). And $\langle S\rangle > 0$: the power flows along $+x$ with the wave.

        **Speed path.** $\Re\{(1 - j/2)^*\} = 1$, so $\langle S\rangle = \tfrac12 E_0\cdot1$. The "cos" coefficient of $\mathbf H$ is exactly the in-phase part.

        **Where points go.** Using $|\tilde H|$ (which is $\sqrt5/2$) instead of its in-phase part. Using $1/\alpha$ for the power's $1/e$ distance.
      ` }),

    // ---------------------------------------------------------------- B Problem 2
    RF(md`
      ### Problem 2 (24 points): from glass-like dielectric into air

      Region 1 ($z < 0$) is a lossless dielectric with $\epsilon_r = 9$, $\mu = \mu_0$. Region 2 ($z > 0$) is air. A uniform plane wave in region 1 hits the interface at normal incidence:
      $$\mathbf E_i = 12\cos(2\pi\times10^8\,t - \beta_1z)\,\hat x\ \ \text{V/m}$$
      Here $\Gamma = \tilde E_r(0)/\tilde E_i(0)$ is the reflection coefficient and $\tau = 1 + \Gamma$ the **transmission** coefficient.

      [[fig:iface]]
    `, { iface: { svg: figB2(), cap: 'The wave starts in the denser medium and meets air at z = 0.' } }),
    P({ src: 'Practice B #2(a) · 4 pts', title: 'Wave numbers',
      q: md`**(a) (4 pts)** Find $\beta_1$ in region 1 and the wavelength $\lambda_2$ in region 2.`,
      parts: [trap(N(md`$\beta_1$ (rad/m)`, 2 * PI, 'rad/m'), [[2 * PI / 3, md`That uses $c$. In region 1 the wave is $\sqrt{\epsilon_r} = 3$ times slower, so $\beta_1 = 3\omega/c$.`], [6 * PI, md`That multiplies by $\epsilon_r = 9$. Speed goes as $1/\sqrt{\epsilon_r}$.`]]),
        trap(N(md`$\lambda_2$ (m)`, 3, 'm'), [[1, md`That is $\lambda_1$. Region 2 is air.`]])],
      hints: [md`$f = 100$ MHz. $\beta = \omega\sqrt{\mu\epsilon} = (\omega/c)\sqrt{\epsilon_r}$. Frequency does not change across the interface.`],
      sol: md`
        **1. Frequency.** $\omega = 2\pi\times10^8$, so $f = 100$ MHz. It is the same on both sides: the interface cannot change how fast things oscillate.

        **2. Region 1.**
        $$\beta_1 = \omega\sqrt{\mu_0\epsilon_0\epsilon_r} = \frac{\omega}{c}\sqrt{\epsilon_r}$$
        $$\beta_1 = \frac{2\pi\times10^8}{3\times10^8}\cdot3$$
        $$\boxed{\beta_1 = 2\pi\ \text{rad/m}}$$
        so $\lambda_1 = 1$ m.

        **3. Region 2** is air: $\lambda_2 = c/f$:
        $$\boxed{\lambda_2 = \frac{3\times10^8}{10^8} = 3\ \text{m}}$$

        !!intuition Does this make sense?
          The wave speeds up by 3 as it leaves the dielectric, and with the same $f$, its wavelength stretches by 3 ✓.

        **Speed path.** 100 MHz in air: $\lambda = 3$ m. Divide by $\sqrt{\epsilon_r}$ inside.

        **Where points go.** Using $\epsilon_r$ instead of $\sqrt{\epsilon_r}$. Changing the frequency across the interface.
      ` }),
    P({ src: 'Practice B #2(b) · 4 pts', title: 'Γ and τ',
      q: md`**(b) (4 pts)** Find the reflection coefficient $\Gamma$ and the transmission coefficient $\tau$.`,
      parts: [trap(N(md`$\Gamma$`, 0.5, ''), [[-0.5, md`That is $(\eta_1 - \eta_2)/(\eta_1 + \eta_2)$, the formula upside down in sign. $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$, with region 2 the side the wave is heading into.`]]),
        trap(N(md`$\tau$`, 1.5, ''), [[0.5, md`That is $1 - \Gamma$. Tangential $\mathbf E$ is continuous: $1 + \Gamma = \tau$.`]])],
      hints: [md`$\eta_1 = \eta_0/\sqrt{\epsilon_r} = 40\pi$ and $\eta_2 = \eta_0 = 120\pi$.`],
      sol: md`
        **1. The impedances.**
        $$\eta_1 = \frac{120\pi}{\sqrt9} = 40\pi\ \Omega,\qquad \eta_2 = 120\pi\ \Omega$$
        **2. Γ.** From the boundary conditions (tangential $\mathbf E$ and $\mathbf H$ continuous):
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1} = \frac{120\pi - 40\pi}{160\pi}$$
        $$\boxed{\Gamma = \tfrac12}$$
        **3. τ.** Continuity of tangential $\mathbf E$ at $z = 0$ says incident + reflected = transmitted, so
        $$\boxed{\tau = 1 + \Gamma = \tfrac32}$$

        !!intuition Does this make sense?
          Going from low $\eta$ to high $\eta$ is like a transmission line ending in a bigger resistor: $\Gamma > 0$, the reflected $\mathbf E$ has the same sign as the incident one. Going the other way (air into glass) you would get $\Gamma = -\tfrac12$ and $\tau = \tfrac12$.

        **Speed path.** $\eta \propto 1/\sqrt{\epsilon_r}$: the ratio $\eta_2/\eta_1 = 3$, so $\Gamma = (3 - 1)/(3 + 1)$.

        **Where points go.** The sign of $\Gamma$ (which side is "2"). Writing $\tau = 1 - \Gamma$.
      ` }),
    P({ src: 'Practice B #2(c) · 5 pts', title: 'The three waves',
      q: md`**(c) (5 pts)** Find the amplitudes of the reflected field $E_r$ and the transmitted field $E_t$, and of the transmitted magnetic field $H_t$.`,
      parts: [N(md`$|E_r|$ (V/m)`, 6, 'V/m'),
        trap(N(md`$|E_t|$ (V/m)`, 18, 'V/m'), [[6, md`That uses $1 - \Gamma$. The transmitted field is $\tau E_i$ with $\tau = 1 + \Gamma = \tfrac32$.`], [12, md`Transmission changes the amplitude: $E_t = \tau E_i$.`]]),
        trap(N(md`$|H_t|$ (A/m)`, 3 / (20 * PI), 'A/m'), [[18 / (40 * PI), md`That divides by $\eta_1$. The transmitted wave lives in air: divide by $\eta_0 = 120\pi$.`]])],
      hints: [md`$E_r = \Gamma E_i$, $E_t = \tau E_i$, and in region 2, $H_t = E_t/\eta_2$.`],
      sol: md`
        **1. Reflected.**
        $$|E_r| = \Gamma\,|E_i| = \tfrac12(12) = \boxed{6\ \text{V/m}}$$
        The full reflected field travels toward $-z$: $\mathbf E_r = 6\cos(\omega t + 2\pi z)\,\hat x$ V/m.

        **2. Transmitted.**
        $$|E_t| = \tau\,|E_i| = \tfrac32(12) = \boxed{18\ \text{V/m}}$$
        **3. Transmitted H.** In air, $|H| = |E|/\eta_0$:
        $$|H_t| = \frac{18}{120\pi} = \boxed{\frac{3}{20\pi} \approx 0.0477\ \text{A/m}}$$
        Direction: travel $+\hat z$ and $\mathbf E$ along $\hat x$, so $\mathbf H_t$ is along $+\hat y$.

        !!intuition Does this make sense?
          Check $\mathbf H$ continuity at $z = 0$. Incident $H_i = 12/40\pi = 3/(10\pi)$ along $+\hat y$. The reflected wave goes toward $-z$, so its $\mathbf H$ is $-\Gamma$ times: $-\tfrac12\cdot3/(10\pi)$. Sum: $\tfrac12\cdot\tfrac{3}{10\pi} = \tfrac{3}{20\pi}$, equal to $H_t$ ✓. Both boundary conditions hold.

        **Speed path.** Multiply $E_i$ by $\Gamma$ and $\tau$; divide $E_t$ by the impedance of **its** region.

        **Where points go.** Dividing $E_t$ by $\eta_1$. Writing $E_t = 6$ V/m.
      ` }),
    P({ src: 'Practice B #2(d) · 5 pts', title: 'Where the power goes',
      q: md`**(d) (5 pts)** Find the incident time-averaged power density $\langle S_i\rangle$ and the fraction of it that is transmitted.`,
      parts: [trap(N(md`$\langle S_i\rangle$ (W/m²)`, 1.8 / PI, 'W/m²'), [[0.6 / PI, md`That divides by $2\eta_0$. The incident wave is in region 1: divide by $2\eta_1 = 80\pi$.`], [3.6 / PI, md`That forgets the $\tfrac12$ of the time average.`]]),
        trap(N(md`transmitted fraction $\langle S_t\rangle/\langle S_i\rangle$`, 0.75, ''), [[2.25, md`That is $\tau^2$. Power also depends on the impedance: $\tau^2\eta_1/\eta_2 = \tfrac94\cdot\tfrac13$.`], [0.25, md`That is the **reflected** fraction, $\Gamma^2$.`]])],
      hints: [md`$\langle S\rangle = |E|^2/(2\eta)$ with the $\eta$ of the region the wave is in. Energy: reflected + transmitted = incident.`],
      sol: md`
        **1. Incident.**
        $$\langle S_i\rangle = \frac{|E_i|^2}{2\eta_1} = \frac{144}{80\pi}$$
        $$\boxed{\langle S_i\rangle = \frac{1.8}{\pi} \approx 0.573\ \text{W/m}^2}$$
        **2. Reflected fraction.** Same region, field scaled by $\Gamma$:
        $$\frac{\langle S_r\rangle}{\langle S_i\rangle} = \Gamma^2 = \tfrac14$$
        **3. Transmitted fraction.** Field scaled by $\tau$, impedance changed from $\eta_1$ to $\eta_2$:
        $$\frac{\langle S_t\rangle}{\langle S_i\rangle} = \tau^2\frac{\eta_1}{\eta_2} = \frac94\cdot\frac13$$
        $$\boxed{\frac{\langle S_t\rangle}{\langle S_i\rangle} = \frac34}$$
        **4. Check.** $\tfrac14 + \tfrac34 = 1$ ✓. Energy is conserved.

        !!intuition Does this make sense?
          $E_t = 18$ is larger than $E_i = 12$, and yet only $\tfrac34$ of the power gets through. No contradiction: air's $\eta$ is three times larger, so the same field carries a third of the power. In numbers: $\langle S_t\rangle = 324/(240\pi) = 1.35/\pi$, which is $\tfrac34$ of $1.8/\pi$ ✓.

        **Speed path.** Reflected fraction $\Gamma^2$; transmitted $1 - \Gamma^2$. Skip $\tau^2\eta_1/\eta_2$ unless you want the check.

        **Where points go.** Transmitted fraction $= \tau^2$ (more than 1!). Using one $\eta$ for both regions.
      ` }),
    P({ src: 'Practice B #2(e) · 6 pts', title: 'The standing wave in region 1',
      q: md`**(e) (6 pts)** In region 1 the incident and reflected waves add. Find the largest and smallest values of the amplitude $|\tilde E_1(z)|$, and the distance from the interface to the nearest minimum. Then judge the statement.`,
      parts: [N(md`$|\tilde E_1|_\text{max}$ (V/m)`, 18, 'V/m'), N(md`$|\tilde E_1|_\text{min}$ (V/m)`, 6, 'V/m'),
        trap(N(md`distance from $z = 0$ to the nearest minimum (m)`, 0.25, 'm'), [[0.5, md`That is half a wavelength. Maxima and minima alternate every quarter wavelength, $\lambda_1/4 = 0.25$ m.`], [0.75, md`That is the quarter wave in air ($\lambda_2/4$). The standing wave is in region 1, where $\lambda_1 = 1$ m.`]]),
        tf(md`"$E_t = 18$ V/m is larger than $E_i = 12$ V/m, so energy is not conserved at this interface."`, false, md`Power density is $|E|^2/(2\eta)$, and $\eta_2$ is three times $\eta_1$. The transmitted wave carries $\tfrac34$ of the incident power, and $\tfrac14 + \tfrac34 = 1$.`)],
      hints: [md`$\tilde E_1(z) = E_i\left(e^{-j\beta_1z} + \Gamma e^{+j\beta_1z}\right)$. Factor out $e^{-j\beta_1z}$: $|\tilde E_1| = E_i\,|1 + \Gamma e^{j2\beta_1z}|$.`, md`The maximum is $E_i(1 + |\Gamma|)$ where the two waves are in phase; at $z = 0$ they are in phase because $\Gamma > 0$.`],
      sol: md`
        **1. The total field.** In region 1 (taking the incident phasor as $12e^{-j\beta_1z}$):
        $$\tilde E_1 = 12\left(e^{-j\beta_1z} + \tfrac12e^{+j\beta_1z}\right)$$
        Factor out $e^{-j\beta_1z}$ (its size is 1, so it does not change the amplitude):
        $$|\tilde E_1| = 12\,\left|1 + \tfrac12e^{j2\beta_1z}\right|$$
        **2. Max and min.** The second term is a little arrow of length $\tfrac12$ that turns as $z$ changes. It adds directly when it points along $+1$, and subtracts when it points along $-1$:
        $$|\tilde E_1|_\text{max} = 12\left(1 + \tfrac12\right) = \boxed{18\ \text{V/m}}$$
        $$|\tilde E_1|_\text{min} = 12\left(1 - \tfrac12\right) = \boxed{6\ \text{V/m}}$$
        **3. Where.** At $z = 0$ the arrow points along $+1$: a maximum at the interface. A minimum needs $2\beta_1|z| = \pi$:
        $$|z| = \frac{\pi}{2\beta_1} = \frac{\lambda_1}{4}$$
        $$\boxed{|z| = 0.25\ \text{m}}$$
        **4. The statement** is **false**: see (d). $\tfrac14$ of the power reflects and $\tfrac34$ is transmitted.

        [[fig:sw]]

        !!intuition Does this make sense?
          At $z = 0$ the total field in region 1 is $12 + 6 = 18$ V/m, exactly the transmitted 18 V/m: tangential $\mathbf E$ is continuous ✓. The ratio max/min is $18/6 = 3$, the standing-wave ratio $(1 + |\Gamma|)/(1 - |\Gamma|)$. In region 2 there is only one wave, so its amplitude is a flat 18 V/m.

        **Speed path.** Max $E_i(1 + |\Gamma|)$, min $E_i(1 - |\Gamma|)$. $\Gamma > 0$: max at the interface, min $\lambda_1/4$ away. ($\Gamma < 0$: the reverse.)

        **Where points go.** Using $\lambda_2$ for the spacing. Putting a minimum at the interface (that is the $\Gamma < 0$ case, or a conductor).
      `,
      figs: { sw: { svg: figB2sol(), cap: 'The amplitude |Ẽ| along z. Region 1 (z < 0): a standing wave between 6 and 18 V/m, maxima every half metre. Region 2: a flat 18 V/m.' } } }),

    // ---------------------------------------------------------------- B Problem 3
    RF(md`
      ### Problem 3 (26 points): a pulse on a shorted line

      A pulse generator with internal resistance $R_g = 150\ \Omega$ drives a lossless line with $Z_0 = 50\ \Omega$, length $l = 300$ m, filled with $\epsilon_r = 9$ ($\mu = \mu_0$). The far end is **shorted** ($R_L = 0$). At $t = 0$ the generator emits a very short pulse, $v_g(t) = 80\,\delta(t)$: treat it as a spike and track its strength (in volts, as on the Fall 2023 paper) as it bounces. A probe records $V(100\ \text{m}, t)$.

      [[fig:ckt]]
    `, { ckt: { svg: figB3(), cap: 'The probe is a third of the way down the line. The load end is a short circuit.' } }),
    P({ src: 'Practice B #3(a) · 5 pts', title: 'Speed and coefficients',
      q: md`**(a) (5 pts)** Find the one-way travel time $T$, the injection coefficient $\tau_g$, and the generator's reflection coefficient $\Gamma_g$. ($\Gamma_L$ is $-1$ for the short.)`,
      parts: [trap(N(md`$T$ (µs)`, 3, 'µs'), [[1, md`That uses $v = c$. The filling makes $v = c/\sqrt9 = 10^8$ m/s.`], [9, md`That divides $c$ by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.`]]),
        trap(N(md`$\tau_g$`, 0.25, ''), [[0.75, md`That is $R_g/(R_g + Z_0)$. The line takes the share across $Z_0$.`]]),
        trap(N(md`$\Gamma_g$`, 0.5, ''), [[-0.5, md`Sign flipped: $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$, and $R_g > Z_0$.`]])],
      hints: [md`$v = c/\sqrt{\epsilon_r}$. $\tau_g = Z_0/(R_g + Z_0)$ and $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$.`],
      sol: md`
        **1. Speed and time.**
        $$v = \frac{c}{\sqrt{\epsilon_r}} = \frac{3\times10^8}{3} = 10^8\ \text{m/s} = 100\ \text{m}/\mu\text{s}$$
        $$\boxed{T = \frac{300\ \text{m}}{100\ \text{m}/\mu\text{s}} = 3\ \mu\text{s}}$$
        **2. τg.** At launch the line looks like a resistor $Z_0$, in a divider with $R_g$:
        $$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac{50}{200} = \boxed{\tfrac14}$$
        **3. Γg.**
        $$\Gamma_g = \frac{R_g - Z_0}{R_g + Z_0} = \frac{100}{200} = \boxed{\tfrac12}$$
        And $\Gamma_L = (0 - 50)/(0 + 50) = -1$.

        !!intuition Does this make sense?
          A short forces $V = 0$ at the load at all times, so the reflection must cancel the arrival exactly: $\Gamma_L = -1$ ✓. A source resistance three times $Z_0$ reflects with the same sign, like a "harder" end.

        **Speed path.** The same three numbers as for a step: a delta input changes only what you draw, not the coefficients.

        **Where points go.** Using $c$ on a filled line. $\tau_g$ upside down.
      ` }),
    P({ src: 'Practice B #3(b) · 6 pts', title: 'The bounce diagram',
      q: md`**(b) (6 pts)** Draw the bounce diagram for $0 \le t \le 12$ µs. Give the strength of the pulse launched at $t = 0$, of the pulse that leaves the generator at $t = 6$ µs, and of the pulse that leaves the load at $t = 9$ µs.`,
      parts: [N(md`pulse launched at $t = 0$ (V)`, 20, 'V'),
        trap(N(md`pulse leaving the generator at 6 µs (V)`, -10, 'V'), [[10, md`The pulse arriving at the generator is $-20$ V (the short flipped it); $\Gamma_g = +\tfrac12$ keeps that sign: $-10$ V.`], [-20, md`That is the pulse **arriving** at 6 µs. The one that leaves is $\Gamma_g$ times it.`]]),
        trap(N(md`pulse leaving the load at 9 µs (V)`, 10, 'V'), [[-10, md`That is the pulse arriving at the load at 9 µs. The short multiplies it by $-1$.`]])],
      hints: [md`$V_1^+ = \tau_g(80)$. Each arrival at an end multiplies by that end's $\Gamma$: $\Gamma_L = -1$ at the load, $\Gamma_g = \tfrac12$ at the generator.`],
      sol: md`
        **1. Launch.** $V_1^+ = \tau_g\cdot80 = \boxed{20\ \text{V}}$, leaving $z = 0$ at $t = 0$.

        **2. The chain.** Each one-way trip takes 3 µs, and each end multiplies by its $\Gamma$:
        - $t = 3$ µs, at the load: $(-1)(20) = -20$ V goes back.
        - $t = 6$ µs, at the generator: $(\tfrac12)(-20) = \boxed{-10\ \text{V}}$ goes forward.
        - $t = 9$ µs, at the load: $(-1)(-10) = \boxed{+10\ \text{V}}$ goes back.
        - $t = 12$ µs, at the generator: $(\tfrac12)(10) = 5$ V goes forward.

        Each round trip multiplies by $\Gamma_L\Gamma_g = -\tfrac12$: $20, -10, 5, \dots$ for the forward pulses.

        [[fig:bd]]

        !!intuition Does this make sense?
          This is exactly the formula sheet's sum: forward pulses $\tau_g(\Gamma_L\Gamma_g)^n$ at $t = z/v + 6n$ µs, backward pulses $\tau_g\Gamma_L(\Gamma_L\Gamma_g)^n$ at $t = 6(n + 1) - z/v$ µs. With $\tau_g\cdot80 = 20$ and $\Gamma_L\Gamma_g = -\tfrac12$ you can write any pulse without the diagram.

        **Speed path.** One list: $20 \xrightarrow{\times(-1)} -20 \xrightarrow{\times\frac12} -10 \xrightarrow{\times(-1)} 10 \xrightarrow{\times\frac12} 5$, departing at $0, 3, 6, 9, 12$ µs.

        **Where points go.** Losing the sign at the short. Giving the arriving pulse instead of the departing one.
      `,
      figs: { bd: { svg: TL.diagram(sB3, { tMax: 12, w: 380, h: 340, probe: 100 }), cap: 'Bounce diagram for the pulse (each line is one spike). Dashed vertical: the probe at 100 m; dots mark when pulses pass it. Times in µs.' } } }),
    P({ src: 'Practice B #3(c) · 6 pts', title: 'What the probe records',
      q: md`**(c) (6 pts)** Sketch $V(100\ \text{m}, t)$ for $0 \le t \le 12$ µs. Give the time and the strength of the second pulse the probe records, and the time of the third.`,
      parts: [trap(N(md`time of the 2nd pulse (µs)`, 5, 'µs'), [[3, md`That is when the pulse reaches the **load**. It still has 200 m (2 µs) to come back to the probe.`], [7, md`That is the third pulse: the generator's reflection passing the probe on its way out.`]]),
        trap(N(md`strength of the 2nd pulse (V)`, -20, 'V'), [[20, md`The short reflects with $\Gamma_L = -1$: the pulse coming back is inverted.`]]),
        trap(N(md`time of the 3rd pulse (µs)`, 7, 'µs'), [[6, md`That is when the pulse leaves the generator. It reaches the probe 1 µs later.`], [11, md`That is the fourth pulse.`]])],
      hints: [md`The probe is 1 µs from the generator and 2 µs from the load. Forward pulses leave the generator at 0, 6, 12 µs; backward pulses leave the load at 3, 9 µs.`],
      sol: md`
        **1. Travel times to the probe.** 100 m takes 1 µs; the remaining 200 m to the load takes 2 µs.

        **2. List every pass.**
        - forward $20$ V, leaves $z = 0$ at 0: passes at $\boxed{1\ \mu\text{s}}$
        - backward $-20$ V, leaves the load at 3: passes at $3 + 2 = \boxed{5\ \mu\text{s}}$, strength $\boxed{-20\ \text{V}}$
        - forward $-10$ V, leaves $z = 0$ at 6: passes at $\boxed{7\ \mu\text{s}}$
        - backward $+10$ V, leaves the load at 9: passes at $11$ µs

        [[fig:probe]]

        !!intuition Does this make sense?
          The gaps alternate 4 µs and 2 µs: 1, 5, 7, 11. From the probe, a trip to the load and back is $2 + 2 = 4$ µs, and a trip to the generator and back is $1 + 1 = 2$ µs. That pattern is how you will read a scope trace backwards (Practice C, Problem 4).

        **Speed path.** Forward passes at $1 + 6n$, backward at $5 + 6n$. Strengths from the chain in (b).

        **Where points go.** Adding the times from the wrong end. Drawing the backward pulse upright.
      `,
      figs: { probe: { svg: TL.plotT(sB3, 100, { input: 'delta', tMax: 12 }), cap: 'V(100 m, t): four spikes in 12 µs. Heights are the pulse strengths in volts.' } } }),
    P({ src: 'Practice B #3(d) · 5 pts', title: 'A snapshot, and the short',
      q: md`**(d) (5 pts)** At the instant $t = 4$ µs, where on the line is the pulse, and what is its strength? Separately: what current spike flows through the short at $t = 3$ µs?`,
      parts: [trap(N(md`position at $t = 4$ µs (m)`, 200, 'm'), [[100, md`That measures 100 m from the generator. The pulse left the **load** ($z = 300$ m) at 3 µs and has moved 100 m back toward the generator.`]]),
        trap(N(md`strength at $t = 4$ µs (V)`, -20, 'V'), [[20, md`At 4 µs the pulse has already reflected off the short, which inverted it.`]]),
        trap(N(md`current spike in the short at $t = 3$ µs (A)`, 0.8, 'A'), [[0.4, md`That is the arriving pulse's current alone. The reflected pulse adds another $-V^-/Z_0 = +0.4$ A at the same instant.`], [-0.8, md`The reflected pulse has $V^- = -20$ V, so its current is $-V^-/Z_0 = +0.4$ A: both currents point along $+z$, into the short.`]])],
      hints: [md`At 3 µs the pulse hits the short; for $t > 3$ it travels back toward $-z$ at 100 m/µs.`, md`At the short, the arriving pulse ($+20$ V, current $+20/50$) and its reflection ($-20$ V, current $-(-20)/50$) coincide.`],
      sol: md`
        **1. Where is it at 4 µs?** The first pulse reached the load ($z = 300$ m) at 3 µs and left as $-20$ V toward $-z$. One microsecond later it has moved 100 m:
        $$\boxed{z = 300 - 100 = 200\ \text{m},\quad \text{strength } {-20}\ \text{V}}$$
        Everywhere else on the line $V = 0$ at that instant.

        **2. The short at 3 µs.** Two pulses sit at $z = 300$ m at once: the arriving $+20$ V and the reflected $-20$ V. Their voltages cancel: $V = 0$, as a short demands. Their currents:
        $$I^+ = \frac{20}{50} = 0.4\ \text{A},\qquad I^- = -\frac{-20}{50} = +0.4\ \text{A}$$
        $$\boxed{I_\text{short} = 0.8\ \text{A spike}}$$

        [[fig:snap]]

        !!intuition Does this make sense?
          At a short the voltage cancels and the current doubles; at an open the current cancels and the voltage doubles. Same physics as a wave on a rope tied to a wall (displacement zero, force doubled).

        **Speed path.** Position: $z = l - v(t - T)$ for the first reflected pulse. Short: current $= 2V^+/Z_0$.

        **Where points go.** Measuring the position from the wrong end. Giving the short's current as $0.4$ A, or saying "zero" (that is its voltage).
      `,
      figs: { snap: { svg: figB3z(), cap: 'V(z) at t = 4 µs: one spike of −20 V at z = 200 m, moving toward the generator.' } } }),
    P({ src: 'Practice B #3(e) · 4 pts', title: 'Current at the probe',
      q: md`**(e) (4 pts)** Find the current spikes $I(100\ \text{m}, t)$ recorded at $t = 5$ µs and at $t = 7$ µs.`,
      parts: [trap(N(md`$I$ spike at 5 µs (A)`, 0.4, 'A'), [[-0.4, md`A backward pulse carries $I^- = -V^-/Z_0$. Its voltage is $-20$ V, so its current is $+0.4$ A.`]]),
        trap(N(md`$I$ spike at 7 µs (A)`, -0.2, 'A'), [[0.2, md`That is a forward pulse: $I^+ = +V^+/Z_0 = -10/50$.`]])],
      hints: [md`Forward: $I^+ = V^+/Z_0$. Backward: $I^- = -V^-/Z_0$.`],
      sol: md`
        **1. The sign rule.** A forward pulse carries current along $+z$ in proportion to its voltage: $I^+ = V^+/Z_0$. A backward pulse carries power toward the generator, so $I^- = -V^-/Z_0$.

        **2. At 5 µs** the backward $-20$ V pulse passes:
        $$I = -\frac{-20}{50} = \boxed{+0.4\ \text{A}}$$
        **3. At 7 µs** the forward $-10$ V pulse passes:
        $$I = \frac{-10}{50} = \boxed{-0.2\ \text{A}}$$

        !!intuition Does this make sense?
          The voltage spike at 5 µs is negative but the current spike is positive. On a shorted line that is natural: the short turned the pulse's voltage upside down but sent its current back with the same sign, $+0.4$ A, as the incident one (current reflects with $-\Gamma_L = +1$).

        **Speed path.** Current reflects with $-\Gamma$: at the short, current keeps its sign; at the generator ($\Gamma_g = \tfrac12$) it gets $-\tfrac12$.

        **Where points go.** Giving a backward pulse's current the voltage's sign.
      ` }),

    // ---------------------------------------------------------------- B Problem 4
    RF(md`
      ### Problem 4 (24 points): a shorted stub and an open stub

      Two stubs are cut from the same lossless line: $Z_0 = 50\ \Omega$, $v = 2\times10^8$ m/s, each $l = 0.5$ m long. Stub **S** is shorted at its far end; stub **O** is open. You look into the near end of each. From the formula sheet, a line of length $d$ ending in a short has $Z(d) = jZ_0\tan\beta d$; one ending in an open has $Y(d) = jY_0\tan\beta d$, that is $Z(d) = -jZ_0\cot\beta d$. Write $Z_\text{in} = jX$; $X$ is the **reactance**.

      [[fig:stubs]]
    `, { stubs: { svg: figB4(), cap: 'The two stubs. Same line, same length; only the far end differs.' } }),
    P({ src: 'Practice B #4(a) · 4 pts', title: 'Stub S at 50 MHz',
      q: md`**(a) (4 pts)** At $f = 50$ MHz, find the reactance $X_S$ of the shorted stub, and the inductance that has the same reactance.`,
      parts: [trap(N(md`$X_S$ ($\Omega$)`, 50, 'Ω'), [[-50, md`That is the open stub's reactance. A shorted stub shorter than $\lambda/4$ is $+jZ_0\tan\beta l$, positive.`]]),
        trap(N(md`equivalent $L$ (nH)`, 1000 / (2 * PI), 'nH'), [[1000, md`That is $X/f$. Inductive reactance is $\omega L$: divide by $\omega = 2\pi f$.`]])],
      hints: [md`$\lambda = v/f = 4$ m, so $l = \lambda/8$ and $\beta l = 45°$. An inductor has $Z = j\omega L$.`],
      sol: md`
        **1. Electrical length.** $\lambda = v/f = (2\times10^8)/(5\times10^7) = 4$ m. So $l = 0.5$ m is $\lambda/8$:
        $$\beta l = \frac{2\pi}{\lambda}\,l = \frac{2\pi}{4}(0.5) = \frac\pi4 = 45°$$
        **2. Input impedance.**
        $$Z_\text{in} = j50\tan45° = j50\ \Omega$$
        $$\boxed{X_S = +50\ \Omega}$$
        **3. Equivalent inductance.** An inductor has $Z = j\omega L$. Match $\omega L = 50$:
        $$L = \frac{50}{2\pi(5\times10^7)} = \frac{10^{-6}}{2\pi}\ \text{H}$$
        $$\boxed{L = \frac{1}{2\pi}\ \mu\text{H} \approx 159\ \text{nH}}$$

        !!intuition Does this make sense?
          A short stub is a short loop of wire: current flows down one rail, through the short, and back. A loop stores magnetic energy, so it acts like an inductor while it is shorter than $\lambda/4$ ✓.

        **Speed path.** $l = \lambda/8$ gives $\tan45° = 1$: $Z_\text{in} = \pm jZ_0$. Short: $+$. Open: $-$.

        **Where points go.** Dividing by $f$ instead of $2\pi f$.
      ` }),
    P({ src: 'Practice B #4(b) · 4 pts', title: 'Stub O at 50 MHz',
      q: md`**(b) (4 pts)** At $f = 50$ MHz, find the reactance $X_O$ of the open stub, and the capacitance that has the same reactance.`,
      parts: [trap(N(md`$X_O$ ($\Omega$)`, -50, 'Ω'), [[50, md`That is the shorted stub. An open stub shorter than $\lambda/4$ is $-jZ_0\cot\beta l$: negative, capacitive.`]]),
        trap(N(md`equivalent $C$ (pF)`, 1000 / (5 * PI), 'pF'), [[400, md`That is $1/(fX)$. A capacitor has $|Z| = 1/(\omega C)$ with $\omega = 2\pi f$.`]])],
      hints: [md`$Z = -j50\cot45°$. A capacitor has $Z = 1/(j\omega C) = -j/(\omega C)$.`],
      sol: md`
        **1. Input impedance.** With $\beta l = 45°$ and $\cot45° = 1$:
        $$Z_\text{in} = -j50\cot45° = -j50\ \Omega$$
        $$\boxed{X_O = -50\ \Omega}$$
        **2. Equivalent capacitance.** A capacitor has $Z = -j/(\omega C)$. Match $1/(\omega C) = 50$:
        $$C = \frac{1}{2\pi(5\times10^7)(50)} = \frac{1}{5\pi\times10^9}\ \text{F}$$
        $$\boxed{C = \frac{1}{5\pi}\ \text{nF} \approx 63.7\ \text{pF}}$$

        !!intuition Does this make sense?
          An open stub is two parallel plates with a gap at the end: charge piles up on the rails, storing electric energy. Short open stubs act like capacitors ✓. Check the limit: as $l\to0$, $\cot\beta l\to\infty$, a tiny capacitor, i.e. an open circuit ✓.

        **Speed path.** Same $\tan = 1$, opposite sign. $C = 1/(\omega|X|)$.

        **Where points go.** The sign of $X_O$. $\omega$ vs $f$ again.
      ` }),
    P({ src: 'Practice B #4(c) · 6 pts', title: 'Resonances',
      q: md`**(c) (6 pts)** Raise the frequency from 50 MHz. Find (i) the lowest frequency at which stub S looks like an **open** circuit, (ii) the lowest at which stub O looks like a **short**, and (iii) the lowest nonzero frequency at which stub S looks like a short.`,
      parts: [trap(N(md`(i) S open (MHz)`, 100, 'MHz'), [[200, md`At 200 MHz the stub is $\lambda/2$ long, which repeats its short. An open needs $\lambda/4$.`]]),
        trap(N(md`(ii) O short (MHz)`, 100, 'MHz'), [[200, md`At 200 MHz the open stub is $\lambda/2$: it repeats the open. A short needs $\lambda/4$.`]]),
        trap(N(md`(iii) S short again (MHz)`, 200, 'MHz'), [[100, md`At 100 MHz stub S is an open, not a short. It returns to a short at $\lambda/2$.`]])],
      hints: [md`$\tan\beta l\to\infty$ when $\beta l = 90°$ ($l = \lambda/4$); $\tan\beta l = 0$ when $\beta l = 180°$ ($l = \lambda/2$). $\beta l$ grows in proportion to $f$, and it is $45°$ at 50 MHz.`],
      sol: md`
        **1. βl scales with f.** $\beta l = 2\pi fl/v$, and it is $45°$ at 50 MHz. So $\beta l = 90°$ at 100 MHz and $180°$ at 200 MHz.

        **2. Stub S.** $Z = j50\tan\beta l$ is infinite at $\beta l = 90°$ (an open circuit: a **parallel resonance**) and zero at $\beta l = 180°$:
        $$\boxed{\text{(i) } 100\ \text{MHz}},\qquad \boxed{\text{(iii) } 200\ \text{MHz}}$$
        **3. Stub O.** $Z = -j50\cot\beta l$ is zero at $\beta l = 90°$ (a short: a **series resonance**):
        $$\boxed{\text{(ii) } 100\ \text{MHz}}$$

        [[fig:react]]

        !!intuition Does this make sense?
          A quarter-wave line turns its end into the opposite: a short into an open and an open into a short. A half-wave line copies its end. Those two facts give every stub resonance without trigonometry: S is open at $\lambda/4$, $3\lambda/4$, … and short at $\lambda/2$, $\lambda$, …

        **Speed path.** Find $f_{\lambda/4} = v/(4l) = 100$ MHz. Then everything happens at multiples of it.

        **Where points go.** Mixing up which stub is open at $\lambda/4$. Forgetting that S is a short at $f = 0$ too (the question asked for the lowest **nonzero** one).
      `,
      figs: { react: { svg: figB4sol(), cap: 'Reactance vs frequency. Solid: shorted stub S. Dashed: open stub O. They swap roles every 100 MHz.' } } }),
    P({ src: 'Practice B #4(d) · 5 pts', title: 'Which one is the inductor at 150 MHz?',
      q: md`**(d) (5 pts)** At $f = 150$ MHz, which stub acts like an inductor? Give that stub's reactance.`,
      parts: [mc('At 150 MHz the inductive stub is', ['stub O, the open one', 'stub S, the shorted one', 'both', 'neither: at 150 MHz both are resonant'], 0,
        [null, md`That is the "shorted stubs are inductive" rule, which only holds below $\lambda/4$. At 150 MHz, $\beta l = 135°$ and $\tan135° = -1$: stub S is capacitive.`, md`They always have opposite reactances here: $\tan135° = -1$ and $-\cot135° = +1$.`, md`Resonances are at 100 and 200 MHz. At 150 MHz both reactances are finite and nonzero ($\pm50\ \Omega$).`]),
        trap(N(md`its reactance $X$ ($\Omega$)`, 50, 'Ω'), [[-50, md`That is the capacitive one, stub S.`]])],
      hints: [md`$\beta l$ at 150 MHz is three times its 50 MHz value: $135°$. Evaluate $\tan135°$ and $\cot135°$.`],
      sol: md`
        !!trap The trap
          "Shorted stub = inductor, open stub = capacitor" is only true while the stub is shorter than a quarter wave.

        **1. Electrical length.** $\beta l = 3\times45° = 135°$.

        **2. Evaluate.** $\tan135° = -1$ and $\cot135° = -1$:
        $$Z_S = j50\tan135° = -j50\ \Omega\quad(\text{capacitive})$$
        $$Z_O = -j50\cot135° = +j50\ \Omega\quad(\text{inductive})$$
        $$\boxed{\text{stub O},\quad X_O = +50\ \Omega}$$
        Its equivalent inductance: $L = 50/(2\pi\cdot1.5\times10^8) = \tfrac{1}{6\pi}\ \mu$H $\approx 53$ nH.

        !!intuition Does this make sense?
          Between 100 and 200 MHz, stub S is longer than $\lambda/4$: past its open-circuit resonance, the line behaves like a parallel LC circuit above resonance, which is capacitive. Look at the graph in (c): between 100 and 200 MHz the solid curve is below zero and the dashed one above.

        **Speed path.** Locate $f$ relative to the resonances: in $(0, f_{\lambda/4})$ S is inductive; in $(f_{\lambda/4}, f_{\lambda/2})$ the roles swap.

        **Where points go.** Answering from the rule of thumb. Evaluating $\tan135°$ as $+1$.
      ` }),
    P({ src: 'Practice B #4(e) · 5 pts', title: 'The pair in parallel',
      q: md`**(e) (5 pts)** Stubs S and O are connected in parallel with each other, and the pair is placed across a matched 50 Ω line just in front of a 50 Ω receiver. What does the pair look like at 50 MHz, and at 100 MHz?`,
      parts: [mc('At 50 MHz the pair looks like', ['an open circuit: the receiver gets all the power', 'a short circuit: the receiver gets nothing', md`a $25\ \Omega$ resistor`, 'an inductor'], 0,
        [null, md`The admittances are $1/(j50) = -j0.02$ and $1/(-j50) = +j0.02$ S: they cancel, the total admittance is zero, which is an **open** circuit.`, md`Parallel reactances do not combine like resistors, and lossless stubs absorb no power.`, md`$+j50$ and $-j50$ in parallel cancel in admittance; the result is not inductive.`]),
        mc('At 100 MHz the pair looks like', ['a short circuit: the receiver gets nothing', 'an open circuit: the receiver gets all the power', md`a $50\ \Omega$ resistor`, 'a capacitor'], 0,
          [null, md`At 100 MHz stub O is a short ($\lambda/4$ open end). A short in parallel with anything is a short.`, md`Lossless stubs can never look like a resistor.`, md`Stub O is a short at 100 MHz; that dominates.`])],
      hints: [md`In parallel, admittances add: $Y = 1/Z_S + 1/Z_O$.`],
      sol: md`
        **1. At 50 MHz.** Add admittances:
        $$Y = \frac{1}{j50} + \frac{1}{-j50} = -j0.02 + j0.02 = 0$$
        Zero admittance means infinite impedance:
        $$\boxed{\text{an open circuit at 50 MHz}}$$
        The pair is invisible: the receiver gets the full matched power. This is an LC tank at its resonance: $L = \tfrac{1}{2\pi}\ \mu$H and $C = \tfrac{1}{5\pi}$ nF give $1/(2\pi\sqrt{LC}) = 50$ MHz ✓.

        **2. At 100 MHz.** Stub O is $\lambda/4$ long with an open end, so it looks like a short; stub S looks like an open. A short in parallel with an open is a short:
        $$\boxed{\text{a short circuit at 100 MHz}}$$
        The receiver gets nothing: the pair is a **notch filter** that passes 50 MHz and blocks 100 MHz.

        !!intuition Does this make sense?
          This is how stub filters on Exam 3 work: pick lengths so each stub is a short or an open at the frequencies you care about. A short across the line reflects everything ($\Gamma = -1$) and an open does nothing.

        **Speed path.** Opposite reactances of equal size in parallel: open. Any stub that is a short at that frequency: short.

        **Where points go.** Adding parallel impedances directly ($j50 - j50 = 0$, "a short": the opposite of the truth).
      ` }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-b', order: 2, title: 'Practice exam B', kind: 'mock', sub: '75 min · 100 pts · reading a lossy wave, a dielectric-to-air interface, a delta pulse on a shorted line, shorted and open stubs', steps: examB });

  // ======================================================================================== EXAM C: figures
  // xy-plane seen from +z, with an optional ellipse or circle and its sense of rotation
  function xyPanel(o) {
    const g = PF.fig({ alt: o.alt });
    const cx = 100, cy = 90, sc = o.sc || 15;
    g.arrow(cx - 88, cy, cx + 92, cy, { cls: 'dim', hs: 6 }); g.label(cx + 96, cy, 'x', 'l', 'small accent');
    g.arrow(cx, cy + 78, cx, cy - 80, { cls: 'dim', hs: 6 }); g.label(cx + 4, cy - 80, 'y', 'bl', 'small accent');
    if (o.rx) {
      const rx = o.rx * sc, ry = o.ry * sc;
      g.ellipse(cx, cy, rx, ry, { cls: 'curve' });
      const s = o.ccw ? 1 : -1;
      for (const th of [45, 225]) {
        const t = th * PI / 180;
        g.head(cx + rx * Math.cos(t), cy - ry * Math.sin(t), -s * rx * Math.sin(t), -s * ry * Math.cos(t), { hs: 9 });
      }
      if (o.labs) o.labs.forEach(([x, y, t, a]) => g.label(cx + x, cy + y, t, a, 'small'));
    }
    if (o.out !== undefined) {
      if (o.out) g.odot(cx + 26, cy + 66, 7); else g.otimes(cx + 26, cy + 66, 7);
      g.label(cx + 36, cy + 66, o.out ? '\\text{travel } {+z}' : '\\text{travel } {-z}', 'l', 'small');
    }
    return g.svg();
  }
  const figC1 = () => xyPanel({ rx: 3, ry: 3, ccw: true, out: true, sc: 18, alt: 'the xy-plane seen from +z, x to the right and y up: a circle traced counterclockwise, from +x toward +y, by a wave coming out of the page toward +z; this is the right-handed case' });
  const figC1b = () => xyPanel({ rx: 4, ry: 2, ccw: true, out: true, sc: 18, labs: [[68, 5, '4', 'tr'], [-5, -38, '2', 'br']], alt: 'the xy-plane seen from +z: an ellipse 4 wide along x and 2 tall along y, traced counterclockwise from +x toward +y; the wave travels out of the page, toward +z' });
  // C1(c): two counter-rotating arrows of length 3 add to an arrow on the x axis
  function figC1c() {
    const g = PF.fig({ alt: 'the xy-plane at one instant: an arrow of length 3 at 50 degrees above the x axis (the right-handed part), an arrow of length 3 at 50 degrees below it (the left-handed part), and their sum, an arrow along +x of length 6 cos 50 degrees' });
    const cx = 60, cy = 110, k = 30, th = 50 * PI / 180;
    g.arrow(cx - 20, cy, cx + 230, cy, { cls: 'dim', hs: 6 }); g.label(cx + 234, cy, 'x', 'l', 'small accent');
    g.arrow(cx, cy + 90, cx, cy - 100, { cls: 'dim', hs: 6 }); g.label(cx + 4, cy - 100, 'y', 'bl', 'small accent');
    const ax = cx + 3 * k * Math.cos(th), ay = cy - 3 * k * Math.sin(th), by = cy + 3 * k * Math.sin(th);
    g.arrow(cx, cy, ax, ay, { hs: 8 }); g.label(ax + 6, ay - 4, '\\text{RHCP part}', 'l', 'small');
    g.arrow(cx, cy, ax, by, { hs: 8 }); g.label(ax + 6, by + 4, '\\text{LHCP part}', 'l', 'small');
    g.line(ax, ay, cx + 6 * k * Math.cos(th), cy, { cls: 'dash dim' }); g.line(ax, by, cx + 6 * k * Math.cos(th), cy, { cls: 'dash dim' });
    g.arrow(cx, cy, cx + 6 * k * Math.cos(th), cy, { cls: 'thick', hs: 9 }); g.label(cx + 6 * k * Math.cos(th) + 6, cy + 4, '\\text{sum}', 'tl', 'small');
    g.angle(cx, cy, 34, 0, 50, '\\omega t');
    return g.svg();
  }
  // C2: the wall
  function figC2() {
    const g = PF.fig({ alt: 'side view: free space for z < 0 on the left; a perfect conductor, hatched, fills z > 0; an incident arrow goes right toward the wall and a reflected arrow comes back to the left' });
    g.wall(250, 30, 160, { side: 'right', t: 16 });
    g.label(300, 95, '\\text{PEC}', 'l', 'small');
    g.label(140, 44, '\\text{free space}', 'c', 'small');
    g.arrow(60, 80, 230, 80, { hs: 8 }); g.label(145, 74, '\\mathbf E_i', 'b', 'small');
    g.arrow(230, 122, 60, 122, { hs: 8 }); g.label(145, 128, '\\mathbf E_r\\ ?', 't', 'small');
    g.arrow(30, 178, 330, 178, { cls: 'dim', hs: 6 }); g.label(334, 178, 'z', 'l', 'small accent');
    g.label(250, 184, '0', 't', 'small');
    return g.svg();
  }
  const figC2sol = () => plot({
    w: 380, h: 210, x: [-2.1, 0.15], y: [0, 15], xl: 'z\\,(\\text{m})', yl: '\\text{amplitude (V/m)}',
    xt: [[-2, '-2'], [-1.5, '-\\tfrac32'], [-1, '-1'], [-0.5, '-\\tfrac12'], [0, '0']], yt: [[12, '12']],
    curves: [
      { f: (z) => 12 * Math.abs(Math.sin(PI * z)), n: 500, to: 0, lab: '|\\tilde E_1|', labAt: -0.5, dx: 0, dy: -4, anchor: 'b' },
      { f: (z) => 12 * Math.abs(Math.cos(PI * z)), n: 500, to: 0, cls: 'dash', lab: '\\eta_0|\\tilde H_1|', labAt: -1, dx: 0, dy: -4, anchor: 'b' },
    ],
  });
  // C3: the quarter-wave section
  const figC3 = () => circuit([
    { t: 'gen', R: 'R_g = 50\\,\\Omega', V: '20\\cos\\omega t\\,\\text{V}' }, { t: 'wire', w: 14 },
    { t: 'line', w: 210, lab: 'Z_Q\\ ?', sub: 'l\\ ?,\\ v = 2\\times10^8\\,\\text{m/s}' },
    { t: 'R', lab: 'R_L = 200\\,\\Omega', last: true },
  ], { ticks: [[2, '\\text{input}'], [3, '\\text{load}']], alt: 'a source 20 cos(omega t) volts with Rg = 50 ohms connects to a line section of unknown impedance Z_Q and unknown length l, with v = 2e8 m/s, which ends in a 200-ohm load' });
  const figC3sol = () => plot({
    w: 380, h: 200, x: [0, 0.55], y: [0, 23], xl: 'z\\,(\\text{m})', yl: '|\\tilde V|\\ (\\text{V})',
    xt: [[0.25, '0.25'], [0.5, '0.5']], yt: [[10, '10'], [15, '15'], [20, '20']],
    curves: [{ f: (z) => { const bd = PI * (0.5 - z); return 15 * Math.hypot(1 + Math.cos(2 * bd) / 3, -Math.sin(2 * bd) / 3); }, to: 0.5, n: 300 }],
    pts: [{ x: 0, y: 10, lab: '|\\tilde V_\\text{in}| = 10', anchor: 'bl' }, { x: 0.5, y: 20, lab: '20', anchor: 'br' }],
  });
  // C4: the unknown circuit and the scope trace
  const sC4 = TL.solve({ Vg: 36, Rg: 30, RL: 180, sections: [{ Z0: 60, len: 300, v: 150 }], tMax: 9 });
  const figC4 = () => circuit([
    { t: 'gen', R: 'R_g\\ ?', V: 'V_0\\,\\delta(t)' }, { t: 'wire', w: 14 },
    { t: 'line', w: 240, lab: 'Z_0 = 60\\,\\Omega', sub: '\\epsilon_r\\ ?,\\ l\\ ?', probe: 0.25 },
    { t: 'R', lab: 'R_L\\ ?', last: true },
  ], { ticks: [[2, '0'], [2, '75\\,\\text{m}', 0.25], [3, 'l']], alt: 'a pulse generator V0 delta(t) with unknown Rg drives a 60-ohm line of unknown length l and unknown relative permittivity, ending in an unknown resistor RL; a probe sits at z = 75 m' });
  const TRACE = [[0.5, 24], [3.5, 12], [4.5, -4], [7.5, -2]];
  const figC4trace = () => plot({
    w: 380, h: 220, x: [0, 8.6], y: [-9, 29], zero: true, xl: 't\\,(\\mu\\text{s})', yl: 'V(75\\,\\text{m}, t)\\ (\\text{V})',
    xt: TRACE.map(([t]) => [t, String(t)]), yt: [[24, '24'], [12, '12']],
    curves: TRACE.map(([t, v]) => ({ pts: [[t, 0], [t, v]] })),
    pts: TRACE.map(([t, v]) => ({ x: t, y: v, lab: String(v), anchor: v > 0 ? 'bl' : 'tl' })),
  });

  // ======================================================================================== EXAM C
  const examC = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** Four problems in short parts, clean numbers, statements to judge and one trap part, as on Prof. Chen's Spring 2024 Exam 3. Problem 4 is the Fall 2023 kind of question: you are handed a scope trace and must work out the circuit that made it.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Circular waves: handedness, a sum of two circular waves, a linear wave split into RHCP + LHCP | 22 |
      | 2 | A wave on a perfect conductor: reflected and total fields, nulls, the surface current, radiation pressure | 24 |
      | 3 | A quarter-wave transformer: $Z_Q$ and length, the load's standing wave, $V_\text{in}$, power, a frequency change | 24 |
      | 4 | A scope trace read backwards: $\epsilon_r$, $l$, $R_L$, $R_g$, the source strength, the next pulse | 30 |

      **Draws on:** [polarization](#/l/w3-pol), [reflection and transmission](#/l/w4-gamma), [standing waves](#/l/w4-standing), [V(d), Γ(d) and Z(d)](#/l/w6-vd), [quarter-wave transformers](#/l/w6-qw), [bounce diagrams](#/l/w5-bounce) and [reading a scope trace](#/l/w5-multi).

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- C Problem 1
    RF(md`
      ### Problem 1 (22 points): adding and splitting circular waves

      All fields are in V/m, in free space, with $\beta = \omega/c > 0$. **Handedness:** freeze one plane and watch the tip of $\mathbf E$ turn. Point your thumb along the direction of travel. If the fingers of your **right** hand curl the way the tip turns, the wave is right-handed (RH); if those of your left hand do, it is left-handed (LH). Use $\sin\theta = \cos(\theta - 90°)$.

      [[fig:rule]]
    `, { rule: { svg: figC1(), cap: 'The convention, seen from +z: a tip turning from +x toward +y, on a wave that comes toward you (+z), is right-handed.' } }),
    P({ src: 'Practice C #1(a) · 4 pts', title: 'One wave',
      q: md`**(a) (4 pts)** Classify $\mathbf E_1 = 4\cos(\omega t + \beta z)\,\hat x + 4\sin(\omega t + \beta z)\,\hat y$.`,
      parts: [mc(md`$\mathbf E_1$ is`, [md`left-handed circular, traveling toward $-z$`, md`right-handed circular, traveling toward $-z$`, md`right-handed circular, traveling toward $+z$`, md`left-handed circular, traveling toward $+z$`, md`linear at $45°$, traveling toward $-z$`], 0,
        [null, md`The tip turns from $\hat x$ to $\hat y$, which is the right-handed sense **for travel toward $+z$**. This wave travels toward $-z$, so the same turning is left-handed.`, md`$\omega t + \beta z$ stays constant if $z$ decreases as $t$ grows: the wave travels toward $-z$.`, md`The direction is wrong ($\omega t + \beta z$ means $-z$), and with that wrong direction the hand would be right, not left.`, md`A cosine and a sine of equal size are $90°$ apart, not in phase: circular, not linear.`])],
      hints: [md`Direction: $\omega t + \beta z$ means the pattern moves toward $-z$. Rotation: at $z = 0$, where is the tip at $\omega t = 0$ and at $\omega t = 90°$?`],
      sol: md`
        **1. Direction.** A crest sits where $\omega t + \beta z$ is constant. As $t$ grows, $z$ must shrink: the wave travels toward $-z$.

        **2. Type.** The two components have the same size, 4, and are a cosine and a sine: $90°$ apart. Equal and $90°$ apart is circular. (Check: $E_x^2 + E_y^2 = 16$ at every instant.)

        **3. Rotation.** Freeze $z = 0$. At $\omega t = 0$: $\mathbf E = 4\hat x$. At $\omega t = 90°$: $\mathbf E = 4\hat y$. The tip turns from $\hat x$ toward $\hat y$.

        **4. Hand.** Thumb along the travel, $-z$. Right thumb on $-z$: the fingers curl from $\hat y$ toward $\hat x$, the wrong way. Left thumb on $-z$: they curl from $\hat x$ toward $\hat y$ ✓.
        $$\boxed{\text{left-handed circular, toward } {-z}}$$
        As a phasor: $\tilde{\mathbf E}_1 = 4(\hat x - j\hat y)\,e^{+j\beta z}$.

        !!intuition Does this make sense?
          Cross-product test: the turning sense is $\hat x\times\hat y = +\hat z$; the travel is $-\hat z$. They disagree: left. The same expression with $\omega t - \beta z$ would be right-handed. The hand depends on the turning **and** on the travel.

        **Speed path.** Phasor $\hat a - j\hat b$ means the tip turns $\hat a\to\hat b$. Compare $\hat a\times\hat b$ with the travel: same is RH, opposite is LH.

        **Where points go.** Ignoring the $+\beta z$ (assuming $+z$ travel). Judging the hand from the picture seen from the wrong side.
      ` }),
    P({ src: 'Practice C #1(b) · 7 pts', title: 'Two circular waves added',
      q: md`**(b) (7 pts)** Two waves travel toward $+z$ together:
        $$\mathbf E_a = 3\cos(\omega t - \beta z)\,\hat x + 3\sin(\omega t - \beta z)\,\hat y$$
        $$\mathbf E_b = \cos(\omega t - \beta z)\,\hat x - \sin(\omega t - \beta z)\,\hat y$$
        Give the hand of $\mathbf E_a$ alone, the polarization of the sum $\mathbf E_a + \mathbf E_b$, and the largest and smallest values of $|\mathbf E_a + \mathbf E_b|$ over a period.`,
      parts: [
        mc(md`$\mathbf E_a$ alone is`, ['right-handed circular', 'left-handed circular', 'linear', 'elliptical'], 0,
          [null, md`The tip turns $\hat x\to\hat y$ and the wave travels toward $+z$: $\hat x\times\hat y = +\hat z$ agrees with the travel. Right.`, md`Equal amplitudes $90°$ apart are circular.`, md`The two amplitudes are equal (3 and 3): circular.`]),
        mc(md`$\mathbf E_a + \mathbf E_b$ is`, [md`right-handed elliptical, long axis along $\hat x$`, md`left-handed elliptical, long axis along $\hat x$`, md`right-handed elliptical, long axis along $\hat y$`, md`circular, because both parts are circular`, md`linear, because the two hands cancel`], 0,
          [null, md`The sum keeps the hand of the bigger part. $\mathbf E_a$ (amplitude 3, RH) beats $\mathbf E_b$ (amplitude 1, LH).`, md`The $\hat x$ parts add ($3 + 1 = 4$) and the $\hat y$ parts subtract ($3 - 1 = 2$): the long axis is $\hat x$.`, md`A sum of opposite-handed circular waves is circular only if one of them is zero.`, md`They cancel completely only when the two amplitudes are equal (that gives a line, as in part c).`]),
        N(md`$|\mathbf E|_\text{max}$ (V/m)`, 4, 'V/m'),
        trap(N(md`$|\mathbf E|_\text{min}$ (V/m)`, 2, 'V/m'), [[3, md`That is the larger wave alone. The smaller one subtracts at some instants: $3 - 1$.`]])],
      hints: [md`Write both as phasors: $\sin \to -j$. $\tilde{\mathbf E}_a = 3(\hat x - j\hat y)e^{-j\beta z}$ and $\tilde{\mathbf E}_b = (\hat x + j\hat y)e^{-j\beta z}$. Add.`],
      sol: md`
        **1. Phasors.** The sine terms map to $-j$ times their amplitude:
        $$\tilde{\mathbf E}_a = 3(\hat x - j\hat y)\,e^{-j\beta z}$$
        For $\mathbf E_b$, $-\sin \to +j$:
        $$\tilde{\mathbf E}_b = (\hat x + j\hat y)\,e^{-j\beta z}$$
        **2. Ea alone.** At $z = 0$: $3\cos\omega t\,\hat x + 3\sin\omega t\,\hat y$. The tip turns $\hat x\to\hat y$; travel $+z$; $\hat x\times\hat y = +\hat z$ agrees:
        $$\boxed{\mathbf E_a\text{: right-handed circular}}$$
        ($\mathbf E_b$ turns $\hat x\to-\hat y$: left-handed circular.)

        **3. The sum.** Add the phasors component by component:
        $$\tilde{\mathbf E} = \big[(3 + 1)\,\hat x + (-3j + j)\,\hat y\big]e^{-j\beta z}$$
        $$\tilde{\mathbf E} = (4\,\hat x - 2j\,\hat y)\,e^{-j\beta z}$$
        In time, at $z = 0$: $4\cos\omega t\,\hat x + 2\sin\omega t\,\hat y$. Unequal sizes, $90°$ apart: an ellipse with semi-axes 4 (along $\hat x$) and 2 (along $\hat y$). It still turns $\hat x\to\hat y$:
        $$\boxed{\text{right-handed elliptical, long axis } \hat x}$$
        $$\boxed{|\mathbf E|_\text{max} = 4\ \text{V/m},\quad |\mathbf E|_\text{min} = 2\ \text{V/m}}$$

        [[fig:ell]]

        !!intuition Does this make sense?
          Picture two arrows spinning in opposite directions, lengths 3 and 1. When they line up, the sum is $3 + 1 = 4$; when they point opposite, $3 - 1 = 2$. The sum turns with the bigger arrow, so it keeps the bigger wave's hand. The axial ratio is $(3 + 1)/(3 - 1) = 2$.

        **Speed path.** RH amplitude $R$, LH amplitude $L$: the sum is elliptical with axes $R + L$ and $|R - L|$ and the hand of the larger.

        **Where points go.** Mapping $-\sin$ to $-j$ (it is $+j$). Calling the sum circular.
      `,
      figs: { ell: { svg: figC1b(), cap: 'The sum, seen from +z: the tip traces an ellipse 4 by 2, turning from +x toward +y while the wave comes toward you. Right-handed.' } } }),
    P({ src: 'Practice C #1(c) · 6 pts', title: 'A linear wave split in two',
      q: md`**(c) (6 pts)** Write $\mathbf E_c = 6\cos(\omega t - \beta z)\,\hat x$ as the sum of a right-handed and a left-handed circular wave. Which phasor is the right-handed part? What is each part's amplitude, and what fraction of the power does the right-handed part carry?`,
      parts: [
        mc(md`The right-handed part of $\tilde{\mathbf E}_c$`, [md`$3(\hat x - j\hat y)\,e^{-j\beta z}$`, md`$3(\hat x + j\hat y)\,e^{-j\beta z}$`, md`$6(\hat x - j\hat y)\,e^{-j\beta z}$`, md`$3(\hat x - j\hat y)\,e^{+j\beta z}$`], 0,
          [null, md`$\hat x + j\hat y$ turns $\hat x\to-\hat y$; with travel $+z$ that is left-handed.`, md`Then the two parts would add to $12\hat x$. Each must have half the amplitude.`, md`$e^{+j\beta z}$ travels toward $-z$. Both parts must travel with $\mathbf E_c$, toward $+z$.`]),
        trap(N(md`amplitude of each circular part (V/m)`, 3, 'V/m'), [[6, md`Two parts of amplitude 6 add to 12 along $\hat x$. Each is half: 3.`], [3 * Math.SQRT2, md`That splits the power by $\sqrt2$ in amplitude. The $\hat x$ components must add to 6: $3 + 3$.`]]),
        trap(N(md`fraction of the power in the RH part`, 0.5, ''), [[0.25, md`Each part has half the amplitude but **two** components: $(3^2 + 3^2)/6^2 = \tfrac12$.`]])],
      hints: [md`$\hat x = \tfrac12(\hat x - j\hat y) + \tfrac12(\hat x + j\hat y)$: the $\hat y$ parts cancel.`],
      sol: md`
        **1. The identity.** Add the two circular unit patterns: the $\hat y$ parts cancel and the $\hat x$ parts double:
        $$(\hat x - j\hat y) + (\hat x + j\hat y) = 2\hat x$$
        **2. Scale to 6.** $\tilde{\mathbf E}_c = 6\hat x\,e^{-j\beta z}$, so
        $$\tilde{\mathbf E}_c = 3(\hat x - j\hat y)e^{-j\beta z} + 3(\hat x + j\hat y)e^{-j\beta z}$$
        **3. Which is which.** For travel toward $+z$, $\hat x - j\hat y$ turns $\hat x\to\hat y$: right-handed. $\hat x + j\hat y$ turns $\hat x\to-\hat y$: left-handed.
        $$\boxed{\text{RH part} = 3(\hat x - j\hat y)\,e^{-j\beta z}}$$
        $$\boxed{\text{each amplitude } 3\ \text{V/m}}$$
        **4. Power.** Power density goes as the sum of the squared component amplitudes. The RH part has $3^2 + 3^2 = 18$; the whole wave has $6^2 = 36$:
        $$\boxed{\text{RH fraction} = \tfrac{18}{36} = \tfrac12}$$

        [[fig:split]]

        !!intuition Does this make sense?
          Two arrows of length 3 spinning in opposite directions, starting together on $+\hat x$, stay mirror images across the $x$ axis: their $y$ parts always cancel and their $x$ parts add to $6\cos\omega t$. That is the linear wave. By symmetry each carries half the power. (The halves add because RH and LH waves are orthogonal: their cross terms average to zero.)

        **Speed path.** Linear of amplitude $A$ = RH of $A/2$ + LH of $A/2$, half the power each.

        **Where points go.** Amplitude $A$ (not $A/2$) per part. Power fraction $\tfrac14$ from squaring one component only.
      `,
      figs: { split: { svg: figC1c(), cap: 'One instant: the RH part has turned up by ωt and the LH part down by ωt. Their sum stays on the x axis.' } } }),
    P({ src: 'Practice C #1(d) · 5 pts', title: 'Shift one part',
      q: md`**(d) (5 pts)** The wave of (c) passes through a material that delays its left-handed part by $180°$ relative to its right-handed part (the left-handed phasor is multiplied by $-1$), and changes nothing else. What is the polarization of the wave that comes out, and its amplitude?`,
      parts: [mc('The output wave is', [md`linear, along $\hat y$`, md`linear, along $\hat x$, the same as before`, 'right-handed circular', 'zero: the two parts cancel'], 0,
        [null, md`The $\hat x$ parts now cancel and the $\hat y$ parts add: the line has turned by $90°$.`, md`Only the LH part is inverted, so the RH and LH parts no longer agree along $\hat x$.`, md`Both parts still have amplitude 3; they still sum to a line.`]),
        trap(N(md`amplitude of the output (V/m)`, 6, 'V/m'), [[3, md`That is one part. The two $\hat y$ components add: $-3j - 3j = -6j$.`]])],
      hints: [md`Compute $3(\hat x - j\hat y) - 3(\hat x + j\hat y)$.`],
      sol: md`
        **1. Add with the sign flipped.**
        $$3(\hat x - j\hat y) - 3(\hat x + j\hat y) = -6j\,\hat y$$
        **2. Read it.** Only a $\hat y$ component is left, of size 6. In time, $-6j \to 6\sin\omega t$: it oscillates along a line.
        $$\boxed{\text{linear along } \hat y,\ \text{amplitude } 6\ \text{V/m}}$$

        !!intuition Does this make sense?
          In the picture of (c), the two arrows used to meet on the $x$ axis. Delay one of them by half a turn and they now meet on the $y$ axis: the line has rotated by $90°$, half of the $180°$ delay. In general a delay $\phi$ between the two circular parts rotates a linear wave by $\phi/2$ (try $\phi = 90°$: you get $3(1 - j)(\hat x + \hat y)$, a line at $45°$). This is how a magnetized material rotates polarization (Faraday rotation).

        **Speed path.** Flip the sign of the LH phasor and add; the $\hat x$ parts cancel.

        **Where points go.** Expecting cancellation to zero. Forgetting that power is unchanged: still $36/(2\eta_0)$, just along $\hat y$.
      ` }),

    // ---------------------------------------------------------------- C Problem 2
    RF(md`
      ### Problem 2 (24 points): a wave on a perfect conductor

      A perfect electric conductor (PEC) fills $z > 0$. In the free space $z < 0$, a uniform plane wave arrives at normal incidence:
      $$\mathbf E_i = 6\cos(\omega t - \beta z)\,\hat x\ \ \text{V/m},\qquad f = 150\ \text{MHz}$$

      [[fig:wall]]
    `, { wall: { svg: figC2(), cap: 'Free space on the left, a perfect conductor on the right.' } }),
    P({ src: 'Practice C #2(a) · 4 pts', title: 'The reflected wave',
      q: md`**(a) (4 pts)** Find $\beta$ and the reflected field $\mathbf E_r$.`,
      parts: [N(md`$\beta$ (rad/m)`, PI, 'rad/m'),
        mc(md`$\mathbf E_r$ (V/m)`, [md`$-6\cos(\omega t + \beta z)\,\hat x$`, md`$6\cos(\omega t + \beta z)\,\hat x$`, md`$-6\cos(\omega t - \beta z)\,\hat x$`, md`$-6\cos(\omega t + \beta z)\,\hat y$`], 0,
          [null, md`That is $\Gamma = +1$. A PEC forces the total tangential $\mathbf E$ to zero at $z = 0$, so $\Gamma = -1$.`, md`$\omega t - \beta z$ still travels toward $+z$, into the conductor. A reflected wave goes back toward $-z$.`, md`Reflection at normal incidence does not rotate $\mathbf E$: it stays along $\hat x$.`])],
      hints: [md`$\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$ with $\eta_2 = 0$ for a PEC.`],
      sol: md`
        **1. β.**
        $$\beta = \frac{\omega}{c} = \frac{2\pi(1.5\times10^8)}{3\times10^8} = \boxed{\pi\ \text{rad/m}}$$
        so $\lambda = 2$ m.

        **2. Γ.** Inside a perfect conductor there is no field, which acts like $\eta_2 = 0$:
        $$\Gamma = \frac{0 - \eta_0}{0 + \eta_0} = -1$$
        **3. The reflected wave** has amplitude $\Gamma\cdot6 = -6$ and travels toward $-z$:
        $$\boxed{\mathbf E_r = -6\cos(\omega t + \pi z)\,\hat x\ \text{V/m}}$$

        !!intuition Does this make sense?
          At $z = 0$: $\mathbf E_i + \mathbf E_r = 6\cos\omega t - 6\cos\omega t = 0$ at every instant. That is the boundary condition on a perfect conductor: no tangential $\mathbf E$ ✓. And no transmitted wave ($\tau = 1 + \Gamma = 0$).

        **Speed path.** PEC: flip the sign of the field and the sign of $\beta z$.

        **Where points go.** Keeping $-\beta z$ (a "reflection" that still heads into the metal). $\Gamma = +1$.
      ` }),
    P({ src: 'Practice C #2(b) · 5 pts', title: 'The total electric field',
      q: md`**(b) (5 pts)** Find the total field $\mathbf E_1 = \mathbf E_i + \mathbf E_r$ for $z < 0$, as a phasor and in the time domain, and its largest amplitude.`,
      parts: [mc(md`$\mathbf E_1(z,t)$ (V/m)`, [md`$12\sin(\pi z)\sin(\omega t)\,\hat x$`, md`$12\cos(\pi z)\cos(\omega t)\,\hat x$`, md`$-12\sin(\pi z)\sin(\omega t)\,\hat x$`, md`$12\sin(\pi z)\cos(\omega t)\,\hat x$`], 0,
        [null, md`That is zero nowhere near the wall; at $z = 0$ it is $12\cos\omega t \ne 0$, violating the PEC condition. It is the shape of $\eta_0\mathbf H$, not of $\mathbf E$.`, md`Sign slip: $\Re\{-j12\sin(\pi z)e^{j\omega t}\} = +12\sin(\pi z)\sin\omega t$.`, md`The phasor $-j12\sin(\pi z)$ is $90°$ behind a real one, so the time factor is $\sin\omega t$, not $\cos\omega t$.`]),
        trap(N(md`largest amplitude of $\mathbf E_1$ (V/m)`, 12, 'V/m'), [[6, md`That is the incident wave alone. Where the two waves meet in step they add: $6 + 6$.`]])],
      hints: [md`Phasors: $\tilde E_1 = 6e^{-j\pi z} - 6e^{+j\pi z}$. Use $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$.`],
      sol: md`
        **1. Phasor sum.**
        $$\tilde E_1 = 6e^{-j\pi z} - 6e^{+j\pi z}$$
        Factor out $-6$: the bracket is $e^{j\pi z} - e^{-j\pi z} = 2j\sin(\pi z)$:
        $$\boxed{\tilde{\mathbf E}_1 = -j12\sin(\pi z)\,\hat x}$$
        **2. Time domain.** $-j = e^{-j90°}$, so
        $$\Re\{-j12\sin(\pi z)e^{j\omega t}\} = 12\sin(\pi z)\cos(\omega t - 90°)$$
        and $\cos(\omega t - 90°) = \sin\omega t$:
        $$\boxed{\mathbf E_1 = 12\sin(\pi z)\sin(\omega t)\,\hat x\ \text{V/m}}$$
        **3. Largest amplitude.** $|\sin(\pi z)| = 1$ at $z = -\tfrac12, -\tfrac32, \dots$:
        $$\boxed{|\mathbf E_1|_\text{max} = 12\ \text{V/m}}$$

        !!intuition Does this make sense?
          The space part $\sin(\pi z)$ and the time part $\sin\omega t$ are separate: the pattern does not move. That is a standing wave. It is zero at the wall ($z = 0$) for all time ✓, and the peaks are twice the incident amplitude, where the two waves arrive in step.

        **Speed path.** PEC standing wave: $\tilde E = -2jE_0\sin\beta z$ (the formula sheet's short-circuit line, $\tilde V(d) = j2\tilde V^+\sin\beta d$, is the same thing measured from the wall).

        **Where points go.** The $\sin\omega t$ (a $\cos\omega t$ means you lost the $-j$). The factor 2.
      ` }),
    P({ src: 'Practice C #2(c) · 5 pts', title: 'H, and where the nulls are',
      q: md`**(c) (5 pts)** Find the amplitude of $\mathbf H_1$ at the wall. How far in front of the wall is the nearest null of $\mathbf E_1$ (other than the wall itself), and the nearest null of $\mathbf H_1$?`,
      parts: [trap(N(md`$|\mathbf H_1|$ at $z = 0$ (A/m)`, 1 / (10 * PI), 'A/m'), [[1 / (20 * PI), md`That is the incident $\mathbf H$ alone, $6/\eta_0$. At the wall the reflected $\mathbf H$ adds in step: $12/\eta_0$.`]]),
        trap(N(md`nearest $\mathbf E$ null in front of the wall (m)`, 1, 'm'), [[0.5, md`$\sin(\pi z) = 0$ at $z = 0, -1, -2$ m: every half wavelength, $\lambda/2 = 1$ m. At $-0.5$ m the field is at its **peak**.`]]),
        trap(N(md`nearest $\mathbf H$ null (m)`, 0.5, 'm'), [[1, md`That is an $\mathbf E$ null. $\mathbf H$ goes as $\cos(\pi z)$: zero at $z = -\tfrac12$ m.`]])],
      hints: [md`The reflected $\mathbf H$ has the sign of $-\Gamma = +1$ relative to the incident one: $\tilde H_1 = \tfrac{6}{\eta_0}(e^{-j\pi z} + e^{+j\pi z})\,\hat y$.`],
      sol: md`
        **1. The total H.** For the incident wave (travel $+z$, $\mathbf E$ along $\hat x$), $\tilde{\mathbf H}_i = \tfrac{6}{\eta_0}e^{-j\pi z}\,\hat y$. The reflected wave travels toward $-z$, so $\hat k = -\hat z$ and $\tilde{\mathbf H}_r = \tfrac{1}{\eta_0}(-\hat z)\times\tilde{\mathbf E}_r$. With $\tilde{\mathbf E}_r = -6e^{+j\pi z}\hat x$ and $-\hat z\times\hat x = -\hat y$:
        $$\tilde{\mathbf H}_r = +\frac{6}{\eta_0}e^{+j\pi z}\,\hat y$$
        Add: $e^{-j\pi z} + e^{j\pi z} = 2\cos(\pi z)$:
        $$\tilde{\mathbf H}_1 = \frac{12}{\eta_0}\cos(\pi z)\,\hat y = \frac{\cos(\pi z)}{10\pi}\,\hat y\ \text{A/m}$$
        **2. At the wall,** $\cos 0 = 1$:
        $$\boxed{|\mathbf H_1(0)| = \frac{1}{10\pi} \approx 0.0318\ \text{A/m}}$$
        **3. Nulls.** $\mathbf E_1 \propto \sin(\pi z)$ is zero at $z = 0, -1, -2, \dots$ m; $\mathbf H_1 \propto \cos(\pi z)$ is zero at $z = -\tfrac12, -\tfrac32, \dots$ m:
        $$\boxed{\mathbf E\text{ null: } 1\ \text{m};\quad \mathbf H\text{ null: } 0.5\ \text{m}}$$

        [[fig:nulls]]

        !!intuition Does this make sense?
          $\mathbf E$ and $\mathbf H$ trade places every quarter wavelength: where one has a null the other has a peak. At the wall $\mathbf E$ must vanish, and the current in the wall needs a strong $\mathbf H$ there. The time parts differ too ($\sin\omega t$ vs $\cos\omega t$): energy sloshes between electric and magnetic form, which is why the average power flow is zero (part e).

        **Speed path.** E nulls at the wall and every $\lambda/2$; H nulls halfway between. $|H(0)| = 2E_0/\eta_0$.

        **Where points go.** Placing an $\mathbf E$ null at $\lambda/4$. Forgetting the factor 2 at the wall.
      `,
      figs: { nulls: { svg: figC2sol(), cap: 'Amplitudes in front of the wall: |Ẽ₁| = 12|sin πz| (solid) and η₀|H̃₁| = 12|cos πz| (dashed). Each peaks where the other is zero.' } } }),
    P({ src: 'Practice C #2(d) · 5 pts', title: 'The surface current',
      q: md`**(d) (5 pts)** Find the surface current $\mathbf J_s$ on the conductor: its amplitude and its direction.`,
      parts: [trap(N(md`amplitude of $\mathbf J_s$ (A/m)`, 1 / (10 * PI), 'A/m'), [[1 / (20 * PI), md`That uses the incident $\mathbf H$ only. The boundary condition uses the **total** $\mathbf H$ at the wall, which is twice as big.`]]),
        mc(md`Direction of $\mathbf J_s(t)$ when $\cos\omega t > 0$`, [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat y$`, md`$-\hat z$`], 0,
          [null, md`Sign slip in the cross product. With $\hat n = -\hat z$ pointing out of the conductor: $(-\hat z)\times\hat y = +\hat x$.`, md`$\mathbf J_s$ is perpendicular to $\mathbf H$ (which is along $\hat y$), not parallel.`, md`A surface current flows along the surface, not into it.`])],
      hints: [md`$\mathbf J_s = \hat n\times\mathbf H$, with $\hat n$ the unit normal pointing out of the conductor into the field region: here $\hat n = -\hat z$. Inside the PEC, $\mathbf H = 0$.`],
      sol: md`
        **1. The boundary condition.** Across a surface carrying current, tangential $\mathbf H$ jumps by $\mathbf J_s$. With $\mathbf H = 0$ inside the PEC and $\hat n$ the normal pointing out of it, into region 1:
        $$\mathbf J_s = \hat n\times\mathbf H_1(0)$$
        Here $\hat n = -\hat z$ and $\mathbf H_1(0,t) = \dfrac{1}{10\pi}\cos(\omega t)\,\hat y$.

        **2. The cross product.** $\hat z\times\hat y = -\hat x$, so $(-\hat z)\times\hat y = +\hat x$:
        $$\boxed{\mathbf J_s = \frac{1}{10\pi}\cos(\omega t)\,\hat x\ \text{A/m}}$$
        Amplitude $1/(10\pi) \approx 0.0318$ A/m, along $+\hat x$ when $\cos\omega t > 0$.

        !!intuition Does this make sense?
          This current is the "reflector": a sheet of current that radiates the reflected wave back to the left and cancels the incident wave on the right. A sheet radiates $-\tfrac{\eta_0}{2}\mathbf J_s = -\tfrac{120\pi}{2}\cdot\tfrac{1}{10\pi}\hat x = -6\hat x$ at $z = 0$: exactly $\mathbf E_r(0)$, and on the metal side exactly $-\mathbf E_i$ ✓. The current flows parallel to the incident $\mathbf E$.

        **Speed path.** $|J_s| = |H_1(0)| = 2E_0/\eta_0$, along $\pm\mathbf E_i$. Fix the sign with $\hat n\times\mathbf H$, $\hat n$ out of the metal.

        **Where points go.** Using $\hat n = +\hat z$ (into the metal), which flips the sign. Using the incident $\mathbf H$ only.
      ` }),
    P({ src: 'Practice C #2(e) · 5 pts', title: 'Pressure and power',
      q: md`**(e) (5 pts)** Find the time-averaged radiation pressure on the conductor. Then judge the two statements about the Poynting vector in $z < 0$.`,
      parts: [trap(N(md`pressure (N/m²)`, 1e-9 / PI, 'N/m²'), [[0.5e-9 / PI, md`That is $\langle S_i\rangle/c$, the pressure on a perfect **absorber**. A mirror reverses the momentum, so it feels twice that: $2\langle S_i\rangle/c$.`], [4e-9 / PI, md`That uses the peak total field (12 V/m) in place of the incident one. The pressure is $2\langle S_i\rangle/c$ with $\langle S_i\rangle$ from the 6 V/m incident wave.`]]),
        tf(md`(i) $\langle\mathbf S\rangle = 0$ everywhere in $z < 0$.`, true, md`$\tilde{\mathbf E}_1 \propto -j\sin(\pi z)$ and $\tilde{\mathbf H}_1 \propto \cos(\pi z)$ are $90°$ apart at every $z$, so $\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\} = 0$. Equivalently, the incident and reflected waves carry equal power in opposite directions.`),
        tf(md`(ii) The instantaneous $\mathbf S(z,t)$ is zero everywhere in $z < 0$ at all times.`, false, md`$\mathbf S = \mathbf E\times\mathbf H \propto \sin(\pi z)\cos(\pi z)\sin\omega t\cos\omega t$: nonzero except at the nulls. Energy sloshes back and forth within each quarter wavelength; only its average is zero.`)],
      hints: [md`Radiation pressure on a perfect reflector at normal incidence: $P = 2\langle S_i\rangle/c$, with $\langle S_i\rangle = E_0^2/(2\eta_0)$.`],
      sol: md`
        **1. Incident power density.**
        $$\langle S_i\rangle = \frac{E_0^2}{2\eta_0} = \frac{36}{240\pi} = \frac{0.15}{\pi}\ \text{W/m}^2$$
        **2. Pressure.** A plane wave carries momentum $\langle S\rangle/c$ per second per square meter. A perfect mirror sends it all back reversed, so it takes twice that:
        $$P = \frac{2\langle S_i\rangle}{c} = \frac{0.3/\pi}{3\times10^8}$$
        $$\boxed{P = \frac{10^{-9}}{\pi} \approx 3.18\times10^{-10}\ \text{N/m}^2}$$
        **3. Statements.**
        - (i) **True.** At every $z$, $\tilde E_1$ is imaginary and $\tilde H_1$ is real, so $\tfrac12\Re\{\tilde E_x\tilde H_y^*\} = 0$.
        - (ii) **False.** $\mathbf S(z,t) = E_xH_y\,\hat z = \dfrac{144}{\eta_0}\sin(\pi z)\cos(\pi z)\sin\omega t\cos\omega t\,\hat z$, which is nonzero almost everywhere; it averages to zero over a period.

        !!intuition Does this make sense?
          The same pressure from the force on the surface current: the current $J_s$ sits in the average of the fields on its two sides, $\tfrac12\mu_0H_1(0)$, so $\langle f\rangle = \tfrac12J_s\cdot\tfrac12\mu_0|H_1(0)| = \tfrac14\mu_0|J_s|^2 = \tfrac14(4\pi\times10^{-7})\dfrac{1}{100\pi^2} = \dfrac{10^{-9}}{\pi}$ ✓, pushing into the metal ($\hat x\times\hat y = +\hat z$). Sunlight on a mirror gives a few micro-pascals; this weak 6 V/m wave gives far less.

        **Speed path.** $P = 2\langle S_i\rangle/c = E_0^2/(\eta_0c)$: $36/(120\pi\cdot3\times10^8) = 10^{-9}/\pi$.

        **Where points go.** Missing the 2 (absorber vs reflector). Treating "average zero" as "zero at every instant".
      ` }),

    // ---------------------------------------------------------------- C Problem 3
    RF(md`
      ### Problem 3 (24 points): a quarter-wave transformer

      A source $v_g(t) = 20\cos(\omega t)$ V with $R_g = 50\ \Omega$ must feed a $200\ \Omega$ resistive load at $f = 100$ MHz. You connect them with one section of lossless line of characteristic impedance $Z_Q$ and length $l$, with $v = 2\times10^8$ m/s, chosen so the source sees a matched load. Phasor distance $d$ is measured back from the load ($d = 0$ at the load). Here $\Gamma_L = (R_L - Z_Q)/(R_L + Z_Q)$ is the load reflection coefficient on the section.

      [[fig:qw]]
    `, { qw: { svg: figC3(), cap: md`One line section between the source and the load. Choose $Z_Q$ and $l$.` } }),
    P({ src: 'Practice C #3(a) · 5 pts', title: 'Design it',
      q: md`**(a) (5 pts)** Find the shortest section that works: its $Z_Q$ and its length $l$.`,
      parts: [trap(N(md`$Z_Q$ ($\Omega$)`, 100, 'Ω'), [[125, md`That is the average $(50 + 200)/2$. The transformer needs the **geometric** mean, $\sqrt{50\cdot200}$.`], [40, md`That is $50\cdot200/250$, the parallel combination. Use $\sqrt{R_gR_L}$.`]]),
        trap(N(md`$l$ (m)`, 0.5, 'm'), [[0.75, md`That uses $c$. On this line $v = 2\times10^8$ m/s, so $\lambda = 2$ m.`], [1, md`That is $\lambda/2$, which just copies the load. A transformer needs $\lambda/4$.`]])],
      hints: [md`A quarter-wave section turns $Z_L$ into $Z_Q^2/Z_L$. Set that equal to 50 Ω.`],
      sol: md`
        **1. What a quarter wave does.** On a lossless line, $Z(d)$ at $d = \lambda/4$ is $Z_Q^2/Z_L$ (formula sheet: $z(d \pm \lambda/4) = 1/z(d)$, in units of $Z_Q$). So the source sees
        $$Z_\text{in} = \frac{Z_Q^2}{R_L}$$
        **2. Match it to 50 Ω.**
        $$\frac{Z_Q^2}{200} = 50 \quad\Rightarrow\quad Z_Q^2 = 10^4$$
        $$\boxed{Z_Q = 100\ \Omega}$$
        **3. Length.** $\lambda = v/f = (2\times10^8)/10^8 = 2$ m:
        $$\boxed{l = \frac\lambda4 = 0.5\ \text{m}}$$

        !!intuition Does this make sense?
          In normalized form: $z_L = 200/100 = 2$, and a quarter wave inverts it to $z = \tfrac12$, which is $50\ \Omega$ ✓. The geometric mean sits halfway between 50 and 200 on a log scale: each step is a factor of 2.

        **Speed path.** $Z_Q = \sqrt{Z_\text{source side}\cdot Z_L}$, $l = \lambda/4$ on the section (use its $v$).

        **Where points go.** The arithmetic mean. $\lambda$ from $c$ instead of the line's $v$.
      ` }),
    P({ src: 'Practice C #3(b) · 4 pts', title: 'The section is not matched',
      q: md`**(b) (4 pts)** Find $\Gamma_L$ on the section and the standing-wave ratio (VSWR) on the section.`,
      parts: [trap(N(md`$\Gamma_L$`, 1 / 3, ''), [[0.6, md`That uses 50 Ω, the source side. On the section, the load is compared with the section's own $Z_Q = 100\ \Omega$.`], [0, md`The **source** sees a match, but the load does not: $200 \ne 100$.`]]),
        trap(N(md`VSWR`, 2, ''), [[4, md`That is $R_L/50$. The VSWR on the section is $R_L/Z_Q = 2$.`]])],
      hints: [md`$\Gamma_L = (200 - 100)/(200 + 100)$, VSWR $= (1 + |\Gamma_L|)/(1 - |\Gamma_L|)$.`],
      sol: md`
        **1. ΓL.**
        $$\Gamma_L = \frac{R_L - Z_Q}{R_L + Z_Q} = \frac{100}{300} = \boxed{\tfrac13}$$
        **2. VSWR.**
        $$\text{VSWR} = \frac{1 + \tfrac13}{1 - \tfrac13} = \frac{4/3}{2/3} = \boxed{2}$$

        !!intuition Does this make sense?
          A matched source does not mean a matched line. Inside the transformer there is a standing wave; its reflected wave is exactly what cancels the reflection at the input. For a real load, VSWR $= R_L/Z_Q$ when $R_L > Z_Q$: $200/100 = 2$ ✓.

        **Speed path.** Real load bigger than $Z_Q$: VSWR $= R_L/Z_Q$, $\Gamma_L = (s - 1)/(s + 1)$.

        **Where points go.** Using 50 Ω in $\Gamma_L$. Assuming no standing wave because the input is matched.
      ` }),
    P({ src: 'Practice C #3(c) · 5 pts', title: 'The input',
      q: md`**(c) (5 pts)** Find the amplitude of the voltage $\tilde V_\text{in}$ at the input of the section, and the time-averaged power delivered into the section.`,
      parts: [trap(N(md`$|\tilde V_\text{in}|$ (V)`, 10, 'V'), [[20, md`That is the open-circuit source voltage. With a matched load the source splits it in half across $R_g$ and $Z_\text{in}$.`]]),
        trap(N(md`$\langle P_\text{in}\rangle$ (W)`, 1, 'W'), [[2, md`That forgets the $\tfrac12$ for peak phasors.`], [4, md`That is $V_g^2/(2Z_\text{in})$, using the full 20 V.`]])],
      hints: [md`The source sees $Z_\text{in} = 50\ \Omega$: a divider. Then $\langle P\rangle = |\tilde V_\text{in}|^2/(2Z_\text{in})$.`],
      sol: md`
        **1. The input circuit.** The whole section and load look like $Z_\text{in} = 50\ \Omega$ to the source (formula sheet: $\tilde V(l) = \tilde F\,Z(l)/(Z_g + Z(l))$, here at the section's input):
        $$\tilde V_\text{in} = 20\cdot\frac{50}{50 + 50}$$
        $$\boxed{|\tilde V_\text{in}| = 10\ \text{V}}$$
        **2. Power in.** $\tilde I_\text{in} = 10/50 = 0.2$ A, in phase with $\tilde V_\text{in}$:
        $$\langle P_\text{in}\rangle = \tfrac12\Re\{\tilde V_\text{in}\tilde I_\text{in}^*\} = \tfrac12(10)(0.2)$$
        $$\boxed{\langle P_\text{in}\rangle = 1\ \text{W}}$$

        !!intuition Does this make sense?
          That is the most a 20 V, 50 Ω source can deliver: $V_g^2/(8R_g) = 400/400 = 1$ W. Matching achieves exactly the maximum-power-transfer condition.

        **Speed path.** Matched: $V_\text{in} = V_g/2$ and $P = V_g^2/(8R_g)$.

        **Where points go.** Using 20 V across the input. Missing the $\tfrac12$.
      ` }),
    P({ src: 'Practice C #3(d) · 5 pts', title: 'At the load',
      q: md`**(d) (5 pts)** Find the time-averaged power reaching the load, the amplitude of the load voltage, and the load voltage phasor.`,
      parts: [N(md`$\langle P_L\rangle$ (W)`, 1, 'W'),
        trap(N(md`$|\tilde V_L|$ (V)`, 20, 'V'), [[10, md`The voltage is not the same at both ends of the section. Power is: $1 = |V_L|^2/(2\cdot200)$ gives 20 V.`]]),
        mc(md`$\tilde V_L$ (V), with $\tilde V_\text{in} = 10$ V as the reference`, [md`$-j20$`, md`$+j20$`, md`$20$`, md`$-20$`], 0,
          [null, md`A wave going forward a quarter wave is **delayed** by $90°$; the load voltage lags: $-j$, not $+j$.`, md`That ignores the $90°$ of travel along a $\lambda/4$ section.`, md`$180°$ would be a half-wave section.`])],
      hints: [md`The section is lossless: all of the 1 W reaches the load. Then $|\tilde V_L| = \sqrt{2R_L\langle P_L\rangle}$.`, md`For the phase: $\tilde V(d) = \tilde V^+e^{j\beta d}(1 + \Gamma_Le^{-j2\beta d})$. At $d = \lambda/4$ that is $j\tilde V^+(1 - \Gamma_L)$; set it equal to 10 and solve for $\tilde V^+$.`],
      sol: md`
        **1. Power.** A lossless line stores energy but never dissipates it, so the average power that enters leaves at the other end:
        $$\boxed{\langle P_L\rangle = 1\ \text{W}}$$
        **2. Amplitude.** $\langle P_L\rangle = |\tilde V_L|^2/(2R_L)$:
        $$|\tilde V_L| = \sqrt{2(200)(1)} = \boxed{20\ \text{V}}$$
        **3. Phase.** From the formula sheet with $\beta d = 90°$ at the input ($e^{j90°} = j$, $e^{-j180°} = -1$):
        $$\tilde V_\text{in} = \tilde V^+\,j\,(1 - \Gamma_L) = j\tfrac23\tilde V^+$$
        Set this to 10 V:
        $$\tilde V^+ = \frac{10}{j\,2/3} = -j15\ \text{V}$$
        At the load ($d = 0$):
        $$\tilde V_L = \tilde V^+(1 + \Gamma_L) = -j15\cdot\tfrac43$$
        $$\boxed{\tilde V_L = -j20\ \text{V}}$$
        In time, $v_L(t) = 20\sin\omega t$: the load voltage lags the input by a quarter period.

        [[fig:vd]]

        !!intuition Does this make sense?
          The input sits at a voltage minimum and the load at a maximum, with ratio $20/10 = 2$, the VSWR of (b) ✓. A quarter-wave transformer steps the voltage up by $\sqrt{R_L/R_\text{in}} = 2$, like an ideal 1:2 transformer, plus a $90°$ delay.

        **Speed path.** Lossless: $P_L = P_\text{in}$. $|V_L| = |V_\text{in}|\sqrt{R_L/Z_\text{in}}$. Phase: $-90°$ for a quarter wave.

        **Where points go.** Assuming the voltage is the same at both ends. Getting the sign of the $90°$.
      `,
      figs: { vd: { svg: figC3sol(), cap: 'The voltage amplitude along the section, from the input (z = 0) to the load (z = 0.5 m): a minimum of 10 V at the input, a maximum of 20 V at the load.' } } }),
    P({ src: 'Practice C #3(e) · 5 pts', title: 'At twice the frequency',
      q: md`**(e) (5 pts)** The source frequency is changed to 200 MHz; nothing else changes. Find the power delivered to the load, and judge the statement.`,
      parts: [trap(N(md`$\langle P_L\rangle$ at 200 MHz (W)`, 0.64, 'W'), [[1, md`At 200 MHz the section is $\lambda/2$ long. It no longer transforms; it copies $200\ \Omega$ to the input.`], [0.25, md`That keeps $|\tilde V_L| = 10$ V. At 200 MHz the input sees $200\ \Omega$: $V_\text{in} = 20\cdot200/250 = 16$ V.`]]),
        tf(md`"At 200 MHz the load receives exactly the power it would receive with no section at all (load wired straight to the source)."`, true, md`A half-wave section copies its load impedance to its input, so the source sees $200\ \Omega$ either way: $16^2/400 = 0.64$ W in both cases.`)],
      hints: [md`At 200 MHz, $\lambda = 1$ m and $l = 0.5$ m $= \lambda/2$. A half-wave line repeats its load: $Z_\text{in} = 200\ \Omega$.`],
      sol: md`
        **1. New electrical length.** $\lambda = v/f = 1$ m, so $l = 0.5$ m is $\lambda/2$ and $\beta l = 180°$.

        **2. A half wave copies the load** (formula sheet: $z(d \pm \lambda/2) = z(d)$):
        $$Z_\text{in} = 200\ \Omega$$
        **3. Input voltage and power.**
        $$\tilde V_\text{in} = 20\cdot\frac{200}{50 + 200} = 16\ \text{V}$$
        $$\langle P\rangle = \frac{16^2}{2\cdot200}$$
        $$\boxed{\langle P_L\rangle = 0.64\ \text{W}}$$
        All of it reaches the load (lossless).

        **4. The statement** is **true**: wired directly, the source also sees $200\ \Omega$ and delivers the same 0.64 W.

        !!intuition Does this make sense?
          Mismatch loss: $1 - |\Gamma|^2$ with $\Gamma = (200 - 50)/250 = 0.6$ gives $1 - 0.36 = 0.64$ of the available 1 W ✓. A quarter-wave transformer is narrowband: it matches only near the frequencies where the section is an odd number of quarter waves.

        **Speed path.** $\lambda/2$: invisible. Mismatch: $P = P_\text{avail}(1 - \Gamma^2)$.

        **Where points go.** Assuming the transformer still matches. Forgetting that a half-wave line is transparent.
      ` }),

    // ---------------------------------------------------------------- C Problem 4
    RF(md`
      ### Problem 4 (30 points): read the scope trace backwards

      A pulse generator with an unknown internal resistance $R_g$ emits a spike $V_0\,\delta(t)$ of unknown strength at $t = 0$ into a lossless line with $Z_0 = 60\ \Omega$. The line is nonmagnetic, but its $\epsilon_r$ and its length $l$ are unknown, and it ends in an unknown resistor $R_L$. A probe at $z = 75$ m records the trace below for $0 \le t \le 8$ µs: four spikes, $+24$ V at 0.5 µs, $+12$ V at 3.5 µs, $-4$ V at 4.5 µs and $-2$ V at 7.5 µs, and nothing else.

      [[fig:ckt]]

      [[fig:trace]]
    `, { ckt: { svg: figC4(), cap: 'Everything marked ? is unknown. The probe is 75 m from the generator.' }, trace: { svg: figC4trace(), cap: 'The scope trace at z = 75 m. Spike heights are pulse strengths in volts.' } }),
    P({ src: 'Practice C #4(a) · 5 pts', title: 'The speed',
      q: md`**(a) (5 pts)** Find the wave speed $v$ and the relative permittivity $\epsilon_r$.`,
      parts: [trap(N(md`$v$ (m/µs)`, 150, 'm/µs'), [[75 / 3.5, md`That pairs 75 m with 3.5 µs. The **first** spike is the launched pulse passing the probe for the first time: 75 m in 0.5 µs.`]]),
        trap(N(md`$\epsilon_r$`, 4, ''), [[2, md`That is $c/v$. $v = c/\sqrt{\epsilon_r}$, so $\epsilon_r = (c/v)^2$.`]])],
      hints: [md`The first spike is the launched pulse, which left the generator at $t = 0$ and has traveled 75 m.`],
      sol: md`
        **1. The first spike.** Nothing can reach the probe before the launched pulse does, so the first spike is that pulse, 75 m from the generator, at 0.5 µs:
        $$v = \frac{75\ \text{m}}{0.5\ \mu\text{s}} = \boxed{150\ \text{m}/\mu\text{s}} = 1.5\times10^8\ \text{m/s}$$
        **2. εr.** $v = c/\sqrt{\epsilon_r}$:
        $$\sqrt{\epsilon_r} = \frac{300}{150} = 2$$
        $$\boxed{\epsilon_r = 4}$$

        !!intuition Does this make sense?
          $c/2$ is a common cable speed; $\epsilon_r = 4$ is between polyethylene (2.25) and glass. Every later spike must be consistent with this speed, which (b) checks.

        **Speed path.** First spike: $v = z_\text{probe}/t_1$.

        **Where points go.** $\epsilon_r = c/v$ without squaring.
      ` }),
    P({ src: 'Practice C #4(b) · 5 pts', title: 'The length',
      q: md`**(b) (5 pts)** Find the length $l$ of the line.`,
      parts: [trap(N(md`$l$ (m)`, 300, 'm'), [[262.5, md`That is $v\cdot3.5/2$: it treats 3.5 µs as a round trip from the generator. The probe sits 75 m in, so the pulse travels $2l - 75$ m by 3.5 µs.`], [525, md`That is the total path to the second spike, $2l - 75$. Solve for $l$.`]])],
      hints: [md`The second spike is the load's reflection. By 3.5 µs it has traveled from the generator to the load and back to the probe: $2l - 75$ meters.`],
      sol: md`
        **1. Identify the second spike.** After passing the probe, the pulse goes to the load and comes back. The first thing to return is the load's reflection. Its path from the generator is down the whole line and back up to the probe:
        $$\text{path} = l + (l - 75) = 2l - 75$$
        **2. Use the time.**
        $$2l - 75 = v\cdot3.5 = 150\cdot3.5 = 525\ \text{m}$$
        $$\boxed{l = 300\ \text{m}}$$
        **3. Check with the third spike.** A generator reflection passes the probe one full round trip ($2l/v = 4$ µs) after the first spike: $0.5 + 4 = 4.5$ µs ✓. And the fourth spike, the next load reflection, comes $3.5 + 4 = 7.5$ µs ✓.

        !!intuition Does this make sense?
          From the probe's point of view, the pulse goes to the load and back ($2\cdot225$ m $= 3$ µs) or to the generator and back ($2\cdot75$ m $= 1$ µs). The gaps in the trace, 3, 1, 3 µs, are exactly those trips. That pattern also identifies which end made each spike.

        **Speed path.** Spike gaps: load trip $= 2(l - z_p)/v$, generator trip $= 2z_p/v$. Here 3 µs $\Rightarrow l - 75 = 225$.

        **Where points go.** Treating the probe as if it were at the generator.
      ` }),
    P({ src: 'Practice C #4(c) · 5 pts', title: 'The load',
      q: md`**(c) (5 pts)** Find $\Gamma_L$ and $R_L$.`,
      parts: [trap(N(md`$\Gamma_L$`, 0.5, ''), [[-1 / 6, md`That divides the third spike by the first. $\Gamma_L$ is the second spike (the load reflection) over the first (the pulse that hit the load).`]]),
        trap(N(md`$R_L$ ($\Omega$)`, 180, 'Ω'), [[20, md`That inverts the formula: $R_L = Z_0(1 + \Gamma_L)/(1 - \Gamma_L)$, not $(1 - \Gamma_L)/(1 + \Gamma_L)$.`], [90, md`That is $Z_0(1 + \Gamma_L)$. Divide by $1 - \Gamma_L$ too.`]])],
      hints: [md`The pulse hits the load with strength 24 V and comes back as 12 V. Then invert $\Gamma_L = (R_L - Z_0)/(R_L + Z_0)$.`],
      sol: md`
        **1. ΓL.** The pulse that reaches the load is the same 24 V pulse the probe saw first (a lossless line does not change it). The reflection is the 12 V spike:
        $$\Gamma_L = \frac{12}{24} = \boxed{\tfrac12}$$
        **2. Invert** $\Gamma_L = (R_L - Z_0)/(R_L + Z_0)$:
        $$R_L = Z_0\,\frac{1 + \Gamma_L}{1 - \Gamma_L} = 60\cdot\frac{3/2}{1/2}$$
        $$\boxed{R_L = 180\ \Omega}$$

        !!intuition Does this make sense?
          A positive $\Gamma_L$ needs $R_L > Z_0$ ✓. Check forward: $(180 - 60)/(180 + 60) = 120/240 = \tfrac12$ ✓.

        **Speed path.** $R_L/Z_0 = (1 + \Gamma)/(1 - \Gamma)$: $\Gamma = \tfrac12$ gives 3.

        **Where points go.** Using the wrong pair of spikes. Inverting the fraction.
      ` }),
    P({ src: 'Practice C #4(d) · 6 pts', title: 'The generator',
      q: md`**(d) (6 pts)** Find $\Gamma_g$ and $R_g$.`,
      parts: [trap(N(md`$\Gamma_g$`, -1 / 3, ''), [[-1 / 6, md`That divides the third spike by the **first**. The pulse that hit the generator was the 12 V load reflection, not the 24 V original: $-4/12$.`], [1 / 3, md`Sign: the spike after the generator reflection is negative ($-4$ V) while the pulse that hit the generator was positive (12 V).`]]),
        trap(N(md`$R_g$ ($\Omega$)`, 30, 'Ω'), [[300 / 7, md`That comes from $\Gamma_g = -\tfrac16$ (the ratio to the first spike).`], [120, md`That inverts the formula: $R_g = Z_0(1 + \Gamma_g)/(1 - \Gamma_g)$.`]])],
      hints: [md`Which pulse hit the generator? It is the one coming back from the load, the 12 V spike. The $-4$ V spike is its reflection, on its way out again.`],
      sol: md`
        !!trap The trap
          $\Gamma_g$ is the ratio of the generator's reflection to the pulse that **hit the generator**, which is the 12 V load reflection, not the 24 V original.

        **1. Follow the 12 V pulse.** It passed the probe at 3.5 µs heading toward the generator, reached the generator at 4 µs, reflected, and passed the probe again at 4.5 µs as $-4$ V:
        $$\Gamma_g = \frac{-4}{12} = \boxed{-\tfrac13}$$
        **2. Invert.**
        $$R_g = Z_0\,\frac{1 + \Gamma_g}{1 - \Gamma_g} = 60\cdot\frac{2/3}{4/3}$$
        $$\boxed{R_g = 30\ \Omega}$$
        **3. Check with the fourth spike.** The $-4$ V pulse reaches the load and returns as $\Gamma_L(-4) = -2$ V at $4.5 + 3 = 7.5$ µs ✓. The trace is consistent.

        !!intuition Does this make sense?
          $R_g < Z_0$ gives $\Gamma_g < 0$: the generator end is "softer" than the line, like a short, so it inverts the pulse ✓.

        **Speed path.** Each ratio is (spike after the bounce) / (spike before the bounce) for the **same** traveling pulse. Spike 2/spike 1 = $\Gamma_L$; spike 3/spike 2 = $\Gamma_g$; spike 4/spike 3 = $\Gamma_L$ again (a free check).

        **Where points go.** Dividing by the first spike. Dropping the sign.
      ` }),
    P({ src: 'Practice C #4(e) · 5 pts', title: 'The source strength',
      q: md`**(e) (5 pts)** Find the injection coefficient $\tau_g$ and the source strength $V_0$.`,
      parts: [trap(N(md`$\tau_g$`, 2 / 3, ''), [[1 / 3, md`That is $R_g/(R_g + Z_0)$. The launched share is $Z_0/(R_g + Z_0)$.`]]),
        trap(N(md`$V_0$ (V)`, 36, 'V'), [[24, md`That is the launched pulse, $\tau_gV_0$. The source strength is larger: divide by $\tau_g$.`], [16, md`That multiplies 24 by $\tau_g$ instead of dividing.`]])],
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$, and the first spike is $\tau_gV_0$.`],
      sol: md`
        **1. τg** with the $R_g$ of (d):
        $$\tau_g = \frac{Z_0}{R_g + Z_0} = \frac{60}{90} = \boxed{\tfrac23}$$
        **2. V0.** The first spike is the launched pulse, $\tau_gV_0 = 24$ V:
        $$V_0 = \frac{24}{2/3} = \boxed{36\ \text{V}}$$

        !!intuition Does this make sense?
          A quick cross-check that needs no $R_g$: $1 - \Gamma_g = \dfrac{2Z_0}{R_g + Z_0} = 2\tau_g$, so $\tau_g = \tfrac12(1 - \Gamma_g) = \tfrac12\cdot\tfrac43 = \tfrac23$ ✓. (Careful: the injection coefficient is **not** $1 + \Gamma_g$; that is the transmission coefficient $\tau$ of a junction, a different quantity with a similar name.)

        **Speed path.** $V_0 = (\text{first spike})/\tau_g$.

        **Where points go.** Reporting 24 V as the source strength.
      ` }),
    P({ src: 'Practice C #4(f) · 4 pts', title: 'Predict the next spike',
      q: md`**(f) (4 pts)** When does the probe record its next spike after 7.5 µs, and how strong is it?`,
      parts: [trap(N(md`time (µs)`, 8.5, 'µs'), [[11.5, md`That is a load reflection. After the $-2$ V pulse passes the probe toward the generator, the generator sends it back first: $7.5 + 1$ µs.`]]),
        trap(N(md`strength (V)`, 2 / 3, 'V'), [[-2 / 3, md`$\Gamma_g = -\tfrac13$ times $-2$ V is $+\tfrac23$ V.`], [-1, md`That multiplies by $\Gamma_L$. The $-2$ V pulse is heading to the generator.`]])],
      hints: [md`The $-2$ V spike is a load reflection heading toward the generator. It reflects there (1 µs round trip from the probe).`],
      sol: md`
        **1. Where the −2 V pulse goes.** It is moving toward the generator. It reaches the generator 0.5 µs later and comes back past the probe 0.5 µs after that:
        $$\boxed{t = 8.5\ \mu\text{s}}$$
        **2. Strength.**
        $$\Gamma_g(-2) = -\tfrac13(-2) = \boxed{\tfrac23\ \text{V} \approx 0.667\ \text{V}}$$

        [[fig:bd]]

        !!intuition Does this make sense?
          The spikes alternate trips: generator (1 µs from the probe), load (3 µs), generator, load. Each pair of bounces multiplies by $\Gamma_L\Gamma_g = -\tfrac16$: $24\to-4\to\tfrac23$ for the outgoing pulses ✓. The bounce diagram rebuilt from your answers reproduces the whole trace.

        **Speed path.** Alternate the gaps (1 µs, 3 µs) and the factors ($\Gamma_g$, $\Gamma_L$).

        **Where points go.** Skipping the generator reflection and jumping to the next load reflection.
      `,
      figs: { bd: { svg: TL.diagram(sC4, { tMax: 9, w: 380, h: 330, probe: 75 }), cap: 'The bounce diagram rebuilt from the answers (Rg = 30 Ω, RL = 180 Ω, l = 300 m, v = 150 m/µs, V₀ = 36 V). Dots: the spikes the probe records. Times in µs.' } } }),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-c', order: 3, title: 'Practice exam C', kind: 'mock', sub: '75 min · 100 pts · circular waves added and split, a wave on a perfect conductor, a quarter-wave transformer, a scope trace read backwards', steps: examC });
})();

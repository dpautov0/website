/* Past Exam 3s, part C, typed clean (no handwriting, no footers, no names) and solved slowly:
   e3-past-sp17  Spring 2017 Exam 3 (Waldrop, Lee, Goddard, Ilie). No key was posted: every answer was derived here.
   e3-past-su20  Summer 2020 Hour Exam 3 (Prof. Kudeki). Handwritten key, re-derived line by line (it holds up).
   Every number was recomputed in Python (work-pastC/sp17.py, su20.py). Every bounce figure and pulse comes from TL.solve. */
(function () {
  'use strict';
  const { R, P } = C;
  const { N } = EM;
  const PI = Math.PI;
  const CH = (lbl, mc, a, why, o) => Object.assign({ lbl, mc, a, why }, o || {});
  const X = (lbl, expr, vars) => ({ lbl, expr, vars });
  const NT = (lbl, ans, unit, traps, rel) => Object.assign(N(lbl, ans, unit, rel), { traps: traps.map(([v, msg]) => ({ v, msg })) });

  // ---------------------------------------------------------------- drawing helpers
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
    const a = L / 2 - 14, b = L / 2 + 14, pts = [[x1, y1], [x1 + ux * a, y1 + uy * a]];
    for (let k = 0; k < 6; k++) { const t = a + (b - a) * (k + 0.5) / 6, s = k % 2 ? -5 : 5; pts.push([x1 + ux * t + px * s, y1 + uy * t + py * s]); }
    pts.push([x1 + ux * b, y1 + uy * b], [x2, y2]);
    g.pl(pts);
  }
  // + above and − below inside a source circle, drawn as strokes so nothing nudges them out of the circle
  const signs = (g, x, y) => g.add(`<path class="glyph" d="M${x - 3.5},${y - 5}H${x + 3.5}M${x},${y - 8.5}V${y - 1.5}M${x - 3.5},${y + 5}H${x + 3.5}"/>`);
  // a source with a series resistor driving a line; o.end: 'R' (a load resistor) or 'short'
  function lineCkt(o) {
    const g = PF.fig({ alt: o.alt });
    const yT = 40, yB = 112, ym = (yT + yB) / 2, xs = 34, xr = 116, x0 = 140, x1 = 330, xe = 366;
    g.circle(xs, ym, 13);
    if (o.ac) g.label(xs, ym, '\\sim', 'c');
    else signs(g, xs, ym);
    g.line(xs, yT, xs, ym - 13); g.line(xs, ym + 13, xs, yB);
    g.label(xs - 18, ym, o.src, 'r');
    zig(g, xs, yT, xr, yT); g.label((xs + xr) / 2, yT - 9, o.rg, 'b', 'small');
    g.line(xr, yT, x0, yT); g.line(xs, yB, x0, yB);
    g.rect(x0, yT, x1 - x0, yB - yT, { cls: 'shade nodecl' });
    g.line(x0, yT, x1, yT, { cls: 'thick' }); g.line(x0, yB, x1, yB, { cls: 'thick' });
    g.dot(x0, yT); g.dot(x0, yB);
    g.label((x0 + x1) / 2, ym - 11, o.z0, 'c', 'small');
    if (o.v) g.label((x0 + x1) / 2, ym + 13, o.v, 'c', 'small');
    if (o.end === 'short') g.line(x1, yT, x1, yB, { cls: 'thick' });
    else {
      g.dot(x1, yT); g.dot(x1, yB);
      g.line(x1, yT, xe, yT); g.line(x1, yB, xe, yB); zig(g, xe, yT, xe, yB);
      g.label(xe + 12, ym, o.rl, 'l', 'small');
    }
    (o.marks || []).forEach(([x, t]) => g.label(x === 'L' ? x1 : x0, yB + 8, t, 't', 'small'));
    if (o.dAxis) {
      const yd = yB + 34;
      g.arrow(x1, yd, x0 - 34, yd, { cls: 'dim', hs: 6 }); g.label(x0 - 38, yd, 'd', 'r', 'small');
      [[x0, 'l'], [(x0 + x1) / 2, 'l/2'], [x1, '0']].forEach(([x, t]) => { g.line(x, yd - 4, x, yd + 4, { cls: 'dim' }); g.label(x, yd + 7, t, 't', 'small'); });
    }
    return g.svg();
  }
  // the equivalent circuit of Spring 2017 Problem 6: the line replaced by its input impedance
  function eqCkt() {
    const g = PF.fig({ alt: 'the equivalent circuit: the source F in series with R and a box labeled Z(l), the input impedance of the shorted line' });
    const yT = 40, yB = 112, ym = (yT + yB) / 2, xs = 34, xr = 116, xb = 160;
    g.circle(xs, ym, 13); g.label(xs, ym, '\\sim', 'c');
    g.line(xs, yT, xs, ym - 13); g.line(xs, ym + 13, xs, yB);
    g.label(xs - 18, ym, '\\tilde F', 'r');
    zig(g, xs, yT, xr, yT); g.label((xs + xr) / 2, yT - 9, 'R', 'b', 'small');
    g.line(xr, yT, xb, yT); g.line(xb, yT, xb, ym - 20);
    g.rect(xb - 12, ym - 20, 24, 40);
    g.line(xb, ym + 20, xb, yB); g.line(xs, yB, xb, yB);
    g.label(xb + 18, ym, 'Z(l) = \\dfrac{\\tilde V(l)}{\\tilde I(l)}', 'l', 'small');
    return g.svg();
  }

  // ======================================================================================== SPRING 2017
  // 2(ii): the parallel-plate guide in cross-section, with the charges and currents at a moment when E_x > 0
  function platesFig() {
    const g = PF.fig({ alt: 'cross-section of the parallel-plate guide: plate x = 0 at the bottom, plate x = d at the top, z to the right. E points up between the plates. Positive charge sits on the bottom plate and negative charge on the top plate. H points out of the page. The surface current runs toward +z on the bottom plate and toward -z on the top plate.' });
    const xL = 60, xR = 320, yT = 50, yB = 140;
    g.line(xL, yT, xR, yT, { cls: 'thick' }); g.line(xL, yB, xR, yB, { cls: 'thick' });
    for (const x of [96, 166, 236, 296]) g.arrow(x, yB - 6, x, yT + 8, { cls: 'dim', hs: 6 });
    for (const x of [131, 201, 266]) { g.label(x, yB - 12, '+', 'c', 'small'); g.label(x, yT + 12, '-', 'c', 'small'); }
    g.odot(201, (yT + yB) / 2, 6); g.label(211, (yT + yB) / 2, 'H_y', 'l', 'small');
    g.label(102, (yT + yB) / 2 - 8, 'E_x', 'l', 'small');
    g.arrow(130, yB + 16, 230, yB + 16, { hs: 7 }); g.label(236, yB + 16, '\\mathbf J_s = +\\hat z\\,H_y', 'l', 'small');
    g.arrow(230, yT - 16, 130, yT - 16, { hs: 7 }); g.label(236, yT - 16, '\\mathbf J_s = -\\hat z\\,H_y', 'l', 'small');
    g.label(xL - 6, yB, 'x = 0', 'r', 'small'); g.label(xL - 6, yT, 'x = d', 'r', 'small');
    g.arrow(20, yB + 44, 20, yB + 10, { cls: 'dim', hs: 6 }); g.label(24, yB + 12, 'x', 'l', 'small accent');
    g.arrow(20, yB + 44, 54, yB + 44, { cls: 'dim', hs: 6 }); g.label(58, yB + 44, 'z', 'l', 'small accent');
    return g.svg();
  }
  // 2(v): the line and the trace measured at its midpoint
  const S2 = TL.solve({ Vg: 30, Rg: 10, RL: 50, sections: [{ Z0: 50, len: 100, v: 50 }], tMax: 6 });
  const deltaCkt = () => lineCkt({ alt: 'a generator 30 delta(t) with unknown internal resistance Rg drives a 100 m line of Z0 = 50 ohm ending in an unknown load RL', src: '30\\,\\delta(t)', rg: 'R_g', z0: 'Z_0 = 50\\,\\Omega', rl: 'R_L', marks: [[0, 'z = 0'], ['L', 'z = 100\\ \\text{m}']] });
  const traceFig = () => PF.plot({ w: 330, h: 190, x: [0, 8], y: [0, 32], xl: 't\\,(\\mu\\text{s})', yl: 'V(50\\,\\text{m},t)',
    xt: [1, 2, 3, 4, 5, 6, 7].map((t) => [t, String(t)]), curves: [{ pts: [[1, 0], [1, 25]] }], pts: [{ x: 1, y: 25, lab: '25\\,\\delta(t - 1)' }] });

  // 3: gamma = 3 + j4 in the complex plane
  function gammaFig() {
    const g = PF.fig({ alt: 'gamma = 3 + j4 drawn in the complex plane: 3 along the real axis, 4 up, hypotenuse 5, angle 53 degrees above the real axis' });
    const ox = 40, oy = 160, s = 28;
    g.arrow(ox - 10, oy, ox + 3 * s + 60, oy, { cls: 'dim', hs: 6 }); g.label(ox + 3 * s + 64, oy, '\\text{Re}', 'l', 'small accent');
    g.arrow(ox, oy + 10, ox, oy - 4 * s - 26, { cls: 'dim', hs: 6 }); g.label(ox + 5, oy - 4 * s - 28, '\\text{Im}', 'bl', 'small accent');
    g.line(ox + 3 * s, oy, ox + 3 * s, oy - 4 * s, { cls: 'dash' });
    g.arrow(ox, oy, ox + 3 * s, oy - 4 * s, { cls: 'thick', hs: 9 });
    g.label(ox + 1.5 * s, oy + 6, '\\alpha = 3', 't', 'small');
    g.label(ox + 3 * s + 8, oy - 2 * s, '\\beta = 4', 'l', 'small');
    g.label(ox + 3 * s - 14, oy - 4 * s - 6, '|\\gamma| = 5', 'br', 'small');
    g.angle(ox, oy, 30, 0, 53.13, '');
    g.label(ox + 44, oy - 16, '53°', 'l', 'small');
    return g.svg();
  }
  // 4(c): the rotation of option D, seen from +z
  function polFig() {
    const g = PF.fig({ alt: 'the xy-plane seen from +z, so the wave comes toward you: E points along +x at omega t = 0 and along -y a quarter period later; the tip turns clockwise' });
    const cx = 130, cy = 115, Rr = 64;
    g.arrow(cx - 90, cy, cx + 98, cy, { cls: 'dim', hs: 7 }); g.label(cx + 102, cy, 'x', 'l', 'small accent');
    g.arrow(cx, cy + 92, cx, cy - 96, { cls: 'dim', hs: 7 }); g.label(cx + 6, cy - 98, 'y', 'bl', 'small accent');
    g.circle(cx, cy, Rr, { cls: 'dash dim' });
    g.odot(cx, cy, 7);
    g.arrow(cx + 11, cy, cx + Rr, cy, { cls: 'thick', hs: 9 }); g.label(cx + Rr + 6, cy - 10, '\\omega t = 0', 'bl', 'small');
    g.arrow(cx, cy + 11, cx, cy + Rr, { cls: 'thick dash', hs: 9 }); g.label(cx + 10, cy + Rr + 4, '\\omega t = 90°', 'tl', 'small');
    g.arc(cx, cy, 36, -14, -76, { cls: 'thick', arrow: 'end', hs: 7 });
    g.label(cx - 9, cy - 9, 'z', 'br', 'small accent');
    return g.svg();
  }
  // 5: the circuit, the source pulse, the bounce diagram and the snapshots
  const S5 = TL.solve({ Vg: 1, Rg: 100, RL: 25, sections: [{ Z0: 50, len: 750, v: 250 }], tMax: 12 });
  const ckt5 = () => lineCkt({ alt: 'a source f(t) with internal resistance 100 ohm drives a 750 m line, Z0 = 50 ohm, v = 250 m per microsecond, ending in a 25 ohm load', src: 'f(t)', rg: '100\\,\\Omega', z0: 'Z_0 = 50\\,\\Omega', v: 'v = 250\\ \\text{m}/\\mu\\text{s}', rl: '25\\,\\Omega', marks: [[0, 'z = 0'], ['L', 'z = 750\\ \\text{m}']] });
  const fP = (t) => (t >= 0 && t < 1 ? Math.sin(2 * PI * (7 / 12) * t) : 0);      // the 5(c) source, t in microseconds
  const pulseV = (s, f, z, t) => TL.arrivals(s, z).reduce((x, a) => x + a.v * f(t - a.t), 0);
  // V(z) at time t for a pulse input, from the same solver: each wave front carries a delayed, scaled copy of f
  function pulsePts(s, f, t, n = 750) {
    const out = [];
    let prev = null;
    for (let k = 0; k <= n; k++) {
      const z = Math.min((s.len * k) / n, s.len - 1e-6);
      const v = pulseV(s, f, z, t);
      if (prev && Math.abs(v - prev[1]) > 0.02) {            // a jump: find it and draw it vertical
        let a = prev[0], b = z;
        for (let i = 0; i < 40; i++) { const m = (a + b) / 2, vm = pulseV(s, f, m, t); if (Math.abs(vm - prev[1]) < Math.abs(vm - v)) a = m; else b = m; }
        out.push([a, pulseV(s, f, a, t)], [b, pulseV(s, f, b, t)]);
      }
      out.push([z, v]); prev = [z, v];
    }
    return out;
  }
  const srcFig = () => {
    const pts = [[0, 0]];
    for (let k = 0; k < 200; k++) { const t = k / 200; pts.push([t, fP(t)]); }
    pts.push([1, -0.5], [1, 0], [2.1, 0]);
    return PF.plot({ w: 360, h: 200, x: [0, 2.1], y: [-0.8, 1.25], zero: true, xl: 't\\,(\\mu\\text{s})', yl: 'f(t)\\,(\\text{V})',
      xt: [[0.5, '0.5'], [1, '1'], [1.5, '1.5'], [2, '2']], yt: [[1, '1'], [-0.5, '-0.5']], curves: [{ pts }] });
  };
  const zTicks = [125, 250, 375, 500, 625, 750].map((z) => [z, String(z)]);
  const snap2 = () => PF.plot({ w: 380, h: 210, x: [0, 750], y: [-0.25, 0.42], zero: true, xl: 'z\\,(\\text{m})', yl: 'V(z,\\,2\\,\\mu\\text{s})\\,(\\text{V})',
    xt: zTicks, yt: [[1 / 3, '\\tfrac13'], [-1 / 6, '-\\tfrac16']], curves: [{ pts: pulsePts(S5, fP, 2) }] });
  const snap4 = () => PF.plot({ w: 380, h: 210, x: [0, 750], y: [-0.15, 0.09], zero: true, xl: 'z\\,(\\text{m})', yl: 'V(z,\\,4\\,\\mu\\text{s})\\,(\\text{V})',
    xt: zTicks, yt: [[1 / 18, '\\tfrac1{18}'], [-1 / 9, '-\\tfrac19']], curves: [{ pts: pulsePts(S5, fP, 4) }] });
  // 6: the shorted line, and |V(d)| along it for the two shortest lengths that make the input open
  const ckt6 = () => lineCkt({ alt: 'a source F in series with a resistor R drives a shorted line of length l; d is measured from the short (d = 0) back to the input (d = l), with l/2 marked halfway', src: '\\tilde F', ac: true, rg: 'R', z0: 'Z_0,\\ v', end: 'short', dAxis: true });
  const vdFig = (l) => PF.plot({ w: 300, h: 180, x: [0, l], y: [0, 12.5], xl: 'd\\,(\\text{m})', yl: '|\\tilde V(d)|\\,(\\text{V})',
    xt: (l === 1 ? [0.5, 1] : [0.5, 1, 1.5, 2, 2.5, 3]).map((d) => [d, String(d)]), yt: [[10, '10'], [10 / Math.SQRT2, '7.07']],
    curves: [{ f: (d) => 10 * Math.abs(Math.sin((PI * d) / 2)), n: 300 }], pts: [{ x: l / 2, y: 10 / Math.SQRT2 }] });

  const sp17 = [
    R(md`
      **Spring 2017 · ECE 329 · Exam 3** (Waldrop, Lee, Goddard, Ilie). Thursday, April 20, 2017, 7:00–8:15 PM (75 minutes). Six problems, 100 points: true or false (6), multiple choice (18), reading a lossy wave (27), a general polarization and its power (18), a bounce diagram and a pulse (20), a shorted line (11). Closed book, no calculators.

      The paper gives $c = 3\times10^8$ m/s, $\epsilon_0 = \frac{10^{-9}}{36\pi}$ F/m, $\mu_0 = 4\pi\times10^{-7}$ H/m, $\eta_0 = 120\pi\ \Omega$, and asks for **answers as fractions, not decimals**. It also prints the table of the imperfect-dielectric and good-conductor limits, which is on your formula sheet too.

      **No key was posted for this paper.** Every answer below was derived from first principles here and checked numerically.

      **How to use it.** Set a 75-minute timer and work on paper. Then enter your answers. Numeric boxes take arithmetic, so you can type the fraction: <code>16*pi^2/25</code>, <code>-1/3</code>, <code>2*pi*1e6</code>. Each solution ends with a **Speed path** (how to get the answer in about 30 seconds) and **Where points go** (the slips that cost points). The table at the bottom sends each problem to its lesson.
    `),

    R(md`
      ### Problem 1 (6 points): true or false

      Two points each, no partial credit. Some of them need a short calculation, but you do not have to show it.
    `),
    P({ src: 'Spring 2017 #1(a) · 2 pts', title: 'Copper at every frequency',
      q: md`TRUE or FALSE: Copper behaves like a good conductor at all frequencies.`,
      parts: [CH('', ['FALSE', 'TRUE'], 0, [null, md`The loss tangent $\sigma/\omega\epsilon$ has $\omega$ in the denominator. For copper it falls below 1 near $10^{18}$ Hz, so copper is not a good conductor at every frequency.`])],
      hints: [md`What does "good conductor" mean as a formula? Look for the $\omega$ in it.`],
      sol: md`**What decides it.** A material is a good conductor when its conduction current beats its displacement current by a lot. The ratio of the two is the loss tangent ([Topic 5](#/l/w2-gamma)):
$$\frac{|\text{conduction}|}{|\text{displacement}|} = \frac{\sigma}{\omega\epsilon}$$
"Good conductor" means this ratio is much larger than 1.

**The frequency sits in the denominator.** For fixed $\sigma$ and $\epsilon$ the ratio falls as $1/\omega$. So any material stops being a good conductor once $\omega$ is large enough. The crossover is where the ratio equals 1:
$$\omega_\times = \frac{\sigma}{\epsilon}$$
**Put in copper.** $\sigma \approx 5.8\times10^7$ S/m and $\epsilon \approx \epsilon_0 = \frac{10^{-9}}{36\pi}$ F/m. Dividing by $\epsilon_0$ is multiplying by $36\pi\times10^9$:
$$\omega_\times = (5.8\times10^7)(36\pi\times10^9)$$
That is about $6.6\times10^{18}$ rad/s, so $f_\times = \omega_\times/2\pi \approx 10^{18}$ Hz: X-rays. Above that, displacement current wins.
$$\boxed{\text{FALSE}}$$
!!intuition Does this make sense?
  At every frequency you meet in this course, up to visible light near $5\times10^{14}$ Hz, the ratio is still above 1000, so copper is a superb conductor there. The single word "all" is what makes the statement false.

**Speed path.** "Good conductor" means $\sigma/\omega\epsilon \gg 1$, and $\omega$ is in the denominator. A claim that something is a good conductor "at all frequencies" is false. Five seconds.

**Where points go.** Thinking a huge $\sigma$ settles it by itself. It is the ratio $\sigma/\omega\epsilon$ that decides, and the ratio depends on frequency.` }),
    P({ src: 'Spring 2017 #1(b) · 2 pts', title: 'Do these fields satisfy Maxwell?',
      q: md`TRUE or FALSE: The pair of fields
$$\mathbf E = \eta_0H_0\sin(\beta x)\sin(\omega t)\,\hat y$$
$$\mathbf H = H_0\cos(\beta x)\cos(\omega t)\,\hat z$$
satisfy Maxwell's equations in free space.`,
      parts: [CH('', ['TRUE', 'FALSE'], 0, [null, md`Both curl equations hold when $\beta = \omega\sqrt{\mu_0\epsilon_0} = \omega/c$, and both divergences are zero. A standing wave does not need $\mathbf E$ and $\mathbf H$ in phase; only a single traveling wave does.`])],
      hints: [md`Check Faraday's law: $(\nabla\times\mathbf E)_z = \partial E_y/\partial x$ must equal $-\mu_0\,\partial H_z/\partial t$. What does that require of $\beta$?`, md`Then check Ampère's law with $(\nabla\times\mathbf H)_y = -\partial H_z/\partial x$. Same condition?`],
      sol: md`**Free space** means no charge and no current. So we need four things: $\nabla\cdot\mathbf E = 0$, $\nabla\cdot\mathbf H = 0$, Faraday's law and Ampère's law (with only the displacement current).

**The divergences.** $\mathbf E$ has only a $y$ component, and it does not depend on $y$, so $\nabla\cdot\mathbf E = \partial E_y/\partial y = 0$. In the same way $\nabla\cdot\mathbf H = \partial H_z/\partial z = 0$. ✓

**Faraday's law**, $\nabla\times\mathbf E = -\mu_0\,\partial\mathbf H/\partial t$. For $\mathbf E = E_y(x,t)\hat y$ only the $z$ component of the curl survives:
$$(\nabla\times\mathbf E)_z = \frac{\partial E_y}{\partial x} - \frac{\partial E_x}{\partial y}$$
There is no $E_x$, so the second term is zero. Differentiate $\sin(\beta x)$:
$$(\nabla\times\mathbf E)_z = \eta_0H_0\beta\cos\beta x\,\sin\omega t$$
The right side. The derivative of $\cos\omega t$ is $-\omega\sin\omega t$, and the two minus signs cancel:
$$-\mu_0\frac{\partial H_z}{\partial t} = \mu_0\omega H_0\cos\beta x\,\sin\omega t$$
The two sides match when
$$\eta_0\beta = \mu_0\omega$$
With $\eta_0 = \sqrt{\mu_0/\epsilon_0}$, divide: $\beta = \mu_0\omega/\eta_0 = \omega\sqrt{\mu_0\epsilon_0} = \omega/c$. That is the free-space wavenumber. ✓

**Ampère's law**, $\nabla\times\mathbf H = \epsilon_0\,\partial\mathbf E/\partial t$. For $\mathbf H = H_z(x,t)\hat z$ only the $y$ component survives, with a minus sign:
$$(\nabla\times\mathbf H)_y = -\frac{\partial H_z}{\partial x} = H_0\beta\sin\beta x\,\cos\omega t$$
The right side:
$$\epsilon_0\frac{\partial E_y}{\partial t} = \epsilon_0\eta_0H_0\omega\sin\beta x\,\cos\omega t$$
They match when $\beta = \epsilon_0\eta_0\omega = \omega\sqrt{\mu_0\epsilon_0}$: the same condition. ✓
$$\boxed{\text{TRUE}}\ \ (\text{with }\beta = \omega/c)$$
!!intuition Does this make sense?
  Use $\sin a\sin b = \tfrac12[\cos(a - b) - \cos(a + b)]$: $E_y$ is two equal waves, one going toward $+x$ and one toward $-x$. Each solves Maxwell's equations, so their sum does too. This is the **standing wave** in front of a perfect conductor at $x = 0$, where $E_y = 0$ at all times ([Topic 12](#/l/w4-standing)).

**Speed path.** Recognize $\sin(\beta x)\sin(\omega t)$ and $\cos(\beta x)\cos(\omega t)$ with the ratio $\eta_0$ as a standing wave. Or check one curl equation and read off $\beta = \omega/c$. Fifteen seconds.

**Where points go.** Dropping the minus sign in $(\nabla\times\mathbf H)_y = -\partial H_z/\partial x$; forgetting that $\partial/\partial t$ turns $\cos$ into $-\sin$; answering FALSE because $E$ and $H$ are out of phase, which is required only of a single traveling wave.` }),
    P({ src: 'Spring 2017 #1(c) · 2 pts', title: 'Standing waves and energy',
      q: md`TRUE or FALSE: Standing waves propagate zero net energy.`,
      parts: [CH('', ['TRUE', 'FALSE'], 0, [null, md`In a pure standing wave $\mathbf E$ and $\mathbf H$ are $90°$ apart in time, so $\mathbf E\times\mathbf H$ averages to zero. Energy sloshes back and forth, but none flows on average.`])],
      hints: [md`Take the standing wave of part (b) and compute the time average of $\mathbf S = \mathbf E\times\mathbf H$.`],
      sol: md`**Take the standing wave of part (b)** and compute its Poynting vector. $\hat y\times\hat z = \hat x$, so
$$\mathbf S = \mathbf E\times\mathbf H = E_yH_z\,\hat x$$
Multiply the two fields:
$$E_yH_z = \eta_0H_0^2\sin\beta x\cos\beta x\,\sin\omega t\cos\omega t$$
Use $\sin a\cos a = \tfrac12\sin 2a$ twice:
$$E_yH_z = \frac{\eta_0H_0^2}{4}\sin 2\beta x\,\sin 2\omega t$$
**Average over a period.** $\sin2\omega t$ averages to zero, so
$$\langle\mathbf S\rangle = 0$$
**The phasor way, faster.** $\tilde E_y = -j\eta_0H_0\sin\beta x$ (since $\sin\omega t = \cos(\omega t - 90°)$) and $\tilde H_z = H_0\cos\beta x$. Then $\frac12\tilde E_y\tilde H_z^*$ is purely imaginary, and its real part is zero.
$$\boxed{\text{TRUE}}$$
!!intuition Does this make sense?
  $\mathbf S$ itself is not zero: it oscillates at $2\omega$, pushing energy back and forth between neighboring quarter wavelengths, where it trades between the electric and magnetic fields. It just never moves energy on average. A partial standing wave ($|\Gamma| < 1$) does carry net power; "standing wave" here means the pure one, $|\Gamma| = 1$.

**Speed path.** $E$ and $H$ are $90°$ apart in time, so $\frac12\Re\{\tilde E\tilde H^*\} = 0$.

**Where points go.** Saying FALSE because $\mathbf S \neq 0$ at most instants. The statement is about net (time-averaged) energy.` }),

    R(md`
      ### Problem 2 (18 points): multiple choice

      Three points each. One correct statement per question; no partial credit.
    `),
    P({ src: 'Spring 2017 #2(i) · 3 pts', title: 'TEM waves in a good conductor',
      q: md`Which statement is true about TEM waves propagating in a good conductor?`,
      parts: [CH('', ['None of these.', md`The wave propagates a distance of several wavelengths before the field amplitude decays to its $1/e$ value.`, 'The wave propagation velocity is the same for all frequencies.', md`The $\mathbf E$ and $\mathbf H$ fields are in phase.`, 'The time-averaged power flow is constant along the propagation direction.'], 0,
        [null, md`In a good conductor $\alpha = \beta$, so the $1/e$ distance is $\delta = 1/\alpha = \lambda/2\pi$: a sixth of a wavelength.`, md`$v_p = \omega/\beta = \sqrt{2\omega/\mu\sigma}$ grows with $\omega$: a good conductor is dispersive.`, md`$\eta$ has angle $\tau = 45°$, so $H$ lags $E$ by $45°$.`, md`Power goes as $e^{-2\alpha z}$: it decays.`])],
      hints: [md`In a good conductor $\gamma^2 \approx j\omega\mu\sigma$. What does that make $\alpha$, $\beta$ and the angle of $\eta$?`],
      sol: md`**The good-conductor facts, from scratch.** Start from $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$ ([Topic 5](#/l/w2-gamma)). In a good conductor $\sigma \gg \omega\epsilon$, so drop $j\omega\epsilon$:
$$\gamma^2 \approx j\omega\mu\sigma$$
$j = e^{j90°}$, and a square root halves the angle:
$$\gamma \approx \sqrt{\omega\mu\sigma}\,e^{j45°}$$
A $45°$ angle means equal real and imaginary parts:
$$\alpha = \beta = \sqrt{\frac{\omega\mu\sigma}{2}} = \sqrt{\pi f\mu\sigma}$$
And $\eta = j\omega\mu/\gamma$ has angle $90° - 45° = 45°$:
$$\eta \approx \sqrt{\frac{\omega\mu}{\sigma}}\,e^{j45°}$$
**Now test each statement.**
- **Several wavelengths?** The $1/e$ distance is $\delta = 1/\alpha$, and $\lambda = 2\pi/\beta = 2\pi/\alpha = 2\pi\delta$. So the field reaches $1/e$ after $\delta = \lambda/2\pi \approx 0.16\lambda$. False.
- **Same velocity at all frequencies?** $v_p = \omega/\beta = \sqrt{2\omega/\mu\sigma}$, which grows with $\omega$. False.
- **In phase?** $\tau = 45°$, so $H$ lags $E$ by $45°$. False.
- **Constant power?** Power goes as the field squared: $\langle S\rangle \propto e^{-2\alpha z}$. False.
$$\boxed{\text{None of these}}$$
**Speed path.** Good conductor: $\alpha = \beta$ and $\tau = 45°$. Each of the four statements contradicts one of those two facts (or $\alpha > 0$).

**Where points go.** The constant speed and the in-phase fields are true of the lossless waves of Exam 2, which is why they tempt. The constant power is true only when $\alpha = 0$.` }),
    P({ src: 'Spring 2017 #2(ii) · 3 pts', title: 'A wave between two plates',
      q: md`A co-sinusoidal plane TEM wave propagates as a guided wave between two infinitely long, parallel conducting plates, with $\mathbf E$ polarized along $\hat x$ and $\mathbf H$ along $\hat y$. The plates are at $x = 0$ and $x = d$ and extend a distance $W$ along $y$, with $W \gg d$. Which statement is true?`,
      parts: [CH('', ['None of these.', md`At a given $z$ and a fixed moment in time, the voltage difference between the two plates depends on the path taken between the plates.`, md`At a given $z$ and a time when $E_x > 0$, negative charge is induced on the $x = 0$ plate while positive charge is induced on the $x = d$ plate.`, md`At a given $z$ and a time when $E_x > 0$, positive charge is induced on both the $x = 0$ and the $x = d$ plates.`, md`Current flow will be induced in the plates along the $\pm\hat y$ directions.`], 0,
        [null, md`Faraday's law around any loop in the plane $z = $ const: the flux through it is zero, because $\mathbf B$ is along $\hat y$, in the plane. So the circulation of $\mathbf E$ is zero and $V = E_xd$ on every path.`, md`Reversed. $E_x > 0$ points from the $x = 0$ plate to the $x = d$ plate, and field lines start on positive charge: $\rho_s = +\epsilon E_x$ on $x = 0$.`, md`The plates carry equal and opposite charge: every field line that starts on one plate ends on the other.`, md`The surface current is $\hat n\times\mathbf H$. With $\mathbf H$ along $\hat y$ and $\hat n = \pm\hat x$, it points along $\pm\hat z$, the direction the wave travels.`])],
      hints: [md`Two boundary conditions on a perfect conductor: $\rho_s = \hat n\cdot\mathbf D$ and $\mathbf J_s = \hat n\times\mathbf H$, with $\hat n$ pointing out of the conductor into the field.`],
      sol: md`This is the parallel-plate transmission line of [Topic 13](#/l/w5-telegraph). Test each statement against one law.

**Voltage and path.** Take any closed loop lying in a plane $z = $ const. Faraday's law says its circulation is $-\frac{d}{dt}$ of the flux of $\mathbf B$ through it. That flux uses $d\mathbf S$ along $\hat z$, but $\mathbf B$ is along $\hat y$, so the flux is zero:
$$\oint\mathbf E\cdot d\mathbf l = 0$$
So every path between the plates in that plane gives the same voltage, $V = E_xd$. The first statement is false.

**The charges.** At a conductor surface $\rho_s = \hat n\cdot\mathbf D$, where $\hat n$ points out of the conductor into the field. On the bottom plate $\hat n = +\hat x$; on the top plate $\hat n = -\hat x$:
$$\rho_s(x{=}0) = +\epsilon E_x, \qquad \rho_s(x{=}d) = -\epsilon E_x$$
When $E_x > 0$ the $x = 0$ plate is positive and the $x = d$ plate negative: the reverse of the second statement, and not "both positive" as the third says.

**The currents.** At a conductor surface $\mathbf J_s = \hat n\times\mathbf H$. With $\mathbf H = H_y\hat y$:
$$\mathbf J_s(x{=}0) = \hat x\times\hat y\,H_y = +\hat z\,H_y$$
$$\mathbf J_s(x{=}d) = -\hat x\times\hat y\,H_y = -\hat z\,H_y$$
The currents run along $\pm\hat z$, forward on one plate and back on the other, just like the two wires of a line. Not along $\pm\hat y$.

[[fig:pl]]
$$\boxed{\text{None of these}}$$
**Speed path.** Between plates a TEM wave is a transmission line: one voltage $E_xd$, $+$ charge where $\mathbf E$ starts, currents along the line ($\pm z$). Every statement breaks one of those.

**Where points go.** Getting the sign of $\rho_s$ backwards (use $\hat n$ out of the conductor); putting the current along $\mathbf H$ instead of along $\hat n\times\mathbf H$.`,
      figs: { pl: { svg: platesFig(), cap: md`A moment when $E_x > 0$: $+$ charge on the $x = 0$ plate, $-$ on the $x = d$ plate, $H_y$ out of the page, currents along $\pm\hat z$.` } } }),
    P({ src: 'Spring 2017 #2(iii) · 3 pts', title: 'E from H in a magnetic material',
      q: md`The magnetic field of a linearly polarized wave in a lossless magnetic material, with the permittivity of free space $\epsilon_0$ and intrinsic impedance $\eta = 1500\ \Omega$, is
$$\mathbf H = 5\,\Re\{e^{j(\omega t - \beta y)}\}\,\hat x\ \ \text{A/m}$$
The corresponding electric field in the time domain, in V/m, is:`,
      parts: [CH('', [md`$7500\cos(\omega t - \beta y)\,\hat z$`, md`$-7500\cos(\omega t + \beta y)\,\hat z$`, md`$\tfrac{1}{1500}\cos(\omega t + \beta y)\,\hat z$`, md`$-\tfrac{1}{1500}\cos(\omega t - \beta y)\,\hat z$`, 'None of these.'], 0,
        [null, md`The given $\mathbf H$ has $\omega t - \beta y$: it travels toward $+\hat y$. $\mathbf E$ belongs to the same wave, so it must have $\omega t - \beta y$ too.`, md`That divides by $\eta$: $|\mathbf E| = \eta|\mathbf H|$, so multiply. It also flips the travel direction.`, md`That divides by $\eta$, and the minus sign makes $\mathbf E\times\mathbf H$ point along $-\hat y$, against the travel.`, md`$7500\cos(\omega t - \beta y)\,\hat z$ is on the list.`])],
      hints: [md`$\mathbf E\times\mathbf H$ points along the travel direction, and $|\mathbf E| = \eta|\mathbf H|$.`],
      sol: md`**Read H.** $\Re\{e^{j(\omega t - \beta y)}\} = \cos(\omega t - \beta y)$, so
$$\mathbf H = 5\cos(\omega t - \beta y)\,\hat x\ \text{A/m}$$
The phase $\omega t - \beta y$ stays constant when $y$ grows with $t$: the wave travels toward $+\hat y$.

**Size.** In one traveling wave $|\mathbf E| = \eta|\mathbf H|$:
$$|\mathbf E| = (1500)(5) = 7500\ \text{V/m}$$
**Direction.** $\mathbf E$ is perpendicular to both $\mathbf H$ ($\hat x$) and the travel ($\hat y$), so it is along $\pm\hat z$. The Poynting vector $\mathbf E\times\mathbf H$ must point along $+\hat y$:
$$\hat z\times\hat x = +\hat y\ ✓$$
So $\mathbf E$ is along $+\hat z$ when $\mathbf H$ is along $+\hat x$, with the same phase (a lossless medium has real $\eta$):
$$\boxed{\mathbf E = 7500\cos(\omega t - \beta y)\,\hat z\ \text{V/m}}$$
The value of $\epsilon_0$ is not needed. It would give $\mu = \eta^2\epsilon_0$ and $\beta$, neither of which is asked.

**Speed path.** $|E| = \eta|H| = 7500$; pick the direction so $\mathbf E\times\mathbf H$ is along $+\hat y$. Only one option has both.

**Where points go.** Dividing by $\eta$ instead of multiplying; changing the sign of $\beta y$ (the two fields of one wave travel together).` }),
    P({ src: 'Spring 2017 #2(iv) · 3 pts', title: 'Leaving a conductor into free space',
      q: md`The reflection coefficient $\Gamma$ for the electric field of a TEM wave propagating from a material with $\epsilon = 4\epsilon_0$, $\mu = \mu_0$ and $\sigma = 400\,\omega\epsilon_0$ **into free space** is approximately:`,
      parts: [CH('', ['0', md`$\tfrac13$`, md`$-\tfrac13$`, '1', '−1', md`$\infty$`, 'Cannot be determined.'], 3,
        [md`$\Gamma = 0$ needs $\eta_1 = \eta_0$. The conductor's $|\eta|$ is twenty times smaller.`, md`That ignores $\sigma$: it uses the lossless $\eta_1 = \eta_0/2$. With $\sigma/\omega\epsilon = 100$ the material is a good conductor.`, md`That ignores $\sigma$ and also sends the wave the other way.`, null, md`That is a wave going from free space into the conductor: $(\eta_1 - \eta_0)/(\eta_1 + \eta_0) \approx -1$. Here the wave leaves the conductor.`, md`Between passive media $|\Gamma| \le 1$.`, md`$\omega$ cancels: $\sigma/\omega\epsilon = 100$ at every frequency, so $\Gamma$ is known.`], { fixed: true })],
      hints: [md`Compute the loss tangent first. What kind of material is it?`, md`$\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$, with medium 1 the one the wave comes from.`],
      sol: md`**What material is it?** The loss tangent:
$$\frac{\sigma}{\omega\epsilon} = \frac{400\,\omega\epsilon_0}{\omega\cdot4\epsilon_0} = 100$$
Much larger than 1: a good conductor ([Topic 7](#/l/w2-limits)).

**Its impedance.** In a good conductor $\eta_1 \approx \sqrt{j\omega\mu/\sigma}$. Its size:
$$|\eta_1| = \sqrt{\frac{\omega\mu_0}{400\,\omega\epsilon_0}} = \frac{1}{20}\sqrt{\frac{\mu_0}{\epsilon_0}}$$
So $|\eta_1| = \eta_0/20$, with angle $45°$.

**Reflection.** A wave going from medium 1 into medium 2 reflects with ([Topic 11](#/l/w4-gamma))
$$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$$
Here $\eta_2 = \eta_0$. Divide top and bottom by $\eta_0$ and call $x = \eta_1/\eta_0 = \tfrac{1}{20}e^{j45°}$:
$$\Gamma = \frac{1 - x}{1 + x} \approx 1 - 2x$$
since $|x| = 0.05$ is small. So $\Gamma \approx 1 - 0.1e^{j45°} \approx 0.93 - j0.07$, about $0.93e^{-j4°}$.
$$\boxed{\Gamma \approx 1}$$
!!intuition Does this make sense?
  The wave goes from a very low impedance into a much higher one. That is like a transmission line ending in an open circuit: almost everything reflects, with $\Gamma \to +1$. Going the other way, from air onto a metal, is like a short: $\Gamma \to -1$.

**Speed path.** $\sigma/\omega\epsilon = 100$, so $|\eta_1| \ll \eta_0$. Leaving the low-impedance side, $\Gamma \approx +1$.

**Where points go.** Forgetting $\sigma$ and using $\eta_1 = \eta_0/2$, which gives the tempting $\tfrac13$; mixing up which medium is 1 and which is 2, which gives $-1$.` }),
    P({ src: 'Spring 2017 #2(v) and (vi) · 6 pts', title: 'Reading a scope trace backwards',
      q: md`A pulse generator with unknown internal resistance $R_g$ sends a delta-function pulse $30\,\delta(t)$ at $t = 0$ down a 100 m line with $Z_0 = 50\ \Omega$, terminated by an unknown resistive load $R_L$. The voltage is measured at $z = 50$ m, the midpoint of the line. A single pulse, $25\,\delta(t - 1\ \mu\text{s})$, is observed after 1 µs. **No other pulses are observed.**

[[fig:c]]

[[fig:tr]]

(v) The internal resistance of the generator, in ohms, is… (vi) The load resistance, in ohms, is…`,
      figs: { c: { svg: deltaCkt(), cap: 'The line. The source is a delta function of weight 30 V·µs.' }, tr: { svg: traceFig(), cap: 'The trace at z = 50 m: one pulse at 1 µs, and nothing after it.' },
        bd: { svg: TL.diagram(S2, { tMax: 4, probe: 50, unit: '' }), cap: md`Bounce diagram with $R_g = 10\ \Omega$ and $R_L = 50\ \Omega$ (pulse weights in V·µs). One wave, one dot at the probe, nothing comes back.` } },
      parts: [
        CH('(v) $R_g$ in Ω', ['0', '10', '30', '50', '100', md`$\infty$`, 'None of these.'], 1,
          [md`With $R_g = 0$, $\tau_g = 1$ and the pulse would be $30\,\delta$, not $25\,\delta$.`, null, md`30 is the source's weight, not a resistance. Solve $30\cdot\frac{50}{R_g + 50} = 25$.`, md`A matched generator gives $\tau_g = \tfrac12$: a $15\,\delta$ pulse.`, md`$\tau_g = \tfrac{50}{150} = \tfrac13$ would give a $10\,\delta$ pulse.`, md`An open generator injects nothing.`, md`10 Ω is on the list: $30\cdot\tfrac{50}{60} = 25$.`], { fixed: true }),
        CH('(vi) $R_L$ in Ω', ['0', '10', '30', '50', '100', md`$\infty$`, 'None of these.'], 3,
          [md`A short reflects $-25\,\delta$, which would pass $z = 50$ m at $t = 3$ µs.`, md`$\Gamma_L = -\tfrac23$ would send back a pulse seen at 3 µs.`, md`$\Gamma_L = -\tfrac14$ would send back a pulse seen at 3 µs.`, null, md`$\Gamma_L = +\tfrac13$ would send back a pulse seen at 3 µs.`, md`An open end reflects the whole pulse: $+25\,\delta$ at 3 µs.`, md`50 Ω is on the list: a matched load reflects nothing.`], { fixed: true }),
      ],
      hints: [md`Until a reflection comes back, the generator sees only $Z_0$: the first wave is $\tau_gV_g$ with $\tau_g = Z_0/(R_g + Z_0)$.`, md`If the load reflected anything, the reflection would pass $z = 50$ m at $t = 3$ µs.`],
      sol: md`**The speed.** The pulse covers 50 m in 1 µs, so $v = 50$ m/µs. It reaches the load ($z = 100$ m) at 2 µs.

**(v) The injection coefficient.** When the source fires, no wave has come back yet, so the line looks to the generator like a resistor $Z_0$. The source divides between $R_g$ and $Z_0$ ([Topic 14](#/l/w5-launch)):
$$V^+ = \tau_gV_g, \qquad \tau_g = \frac{Z_0}{R_g + Z_0}$$
This $\tau_g$ is the **injection coefficient** of the generator (not the transmission coefficient $1 + \Gamma$, and not the angle of $\eta$). The pulse at $z = 50$ m is that first wave, so its weight is $30\tau_g$:
$$30\cdot\frac{50}{R_g + 50} = 25$$
Divide by 25 and cross-multiply:
$$1500 = 25R_g + 1250$$
$$\boxed{R_g = 10\ \Omega}$$
**(vi) Nothing came back.** The pulse reaches the load at 2 µs. A reflection $\Gamma_L(25\,\delta)$ would travel back and pass $z = 50$ m at 3 µs. None was seen, so
$$\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0} = 0$$
$$\boxed{R_L = Z_0 = 50\ \Omega}$$
The generator is not matched ($\Gamma_g = \frac{10 - 50}{10 + 50} = -\tfrac23$), but that never shows: $\Gamma_g$ only acts on a wave that comes back, and none does.

[[fig:bd]]

**Speed path.** First pulse $= \tau_g\times$ source, so $\tau_g = \tfrac56$ and $R_g = Z_0/\tau_g - Z_0 = 10\ \Omega$. "No other pulses" means a matched load.

**Where points go.** Using $R_L$ in the divider (the generator sees $Z_0$ until something returns); thinking a single pulse needs $\Gamma_g = 0$ too.` }),

    R(md`
      ### Problem 3 (27 points): reading a lossy wave

      In conducting media, the plane TEM wave parameters $\gamma$ and $\eta$ satisfy
      $$\gamma\eta = j\omega\mu \quad\text{and}\quad \frac{\gamma}{\eta} = \sigma + j\omega\epsilon$$
      The electric field of a plane wave in a non-magnetic material ($\mu = \mu_0$) is
      $$\mathbf E = 3e^{-3x}\cos(8\pi\cdot10^6t - 4x + 60°)\,\hat z\ \ \text{V/m}$$
      Use the constants above and $\tan^{-1}(4/3) = 53°$.
    `),
    P({ src: 'Spring 2017 #3(a), (b) · 7 pts', title: 'α, β, γ, and γ in polar form',
      q: md`(a) Find the attenuation constant $\alpha$, the wave number $\beta$, and the propagation constant $\gamma$. (b) Find the amplitude and phase of $\gamma$.`,
      parts: [
        NT('\\alpha', 3, 'Np/m', [[4, 'That is β. α is the number in the decaying exponential e^{−αx}.']]),
        NT('\\beta', 4, 'rad/m', [[3, 'That is α. β multiplies x inside the cosine.']]),
        NT('|\\gamma|', 5, 'm^{-1}', [[7, 'That adds α and β. The size of 3 + j4 needs Pythagoras.']]),
        NT('\\angle\\gamma', 53.13, '°', [[36.87, 'That is tan⁻¹(3/4). The angle of 3 + j4 is tan⁻¹(β/α) = tan⁻¹(4/3).']]),
      ],
      hints: [md`Match the field term by term with $E_0e^{-\alpha x}\cos(\omega t - \beta x + \phi)$.`, md`$\gamma = \alpha + j\beta$ is a 3-4-5 triangle.`],
      sol: md`**The pattern.** A wave traveling toward $+\hat x$ in a lossy medium has the form ([Topic 5](#/l/w2-gamma), [Topic 6](#/l/w2-read))
$$E_z = E_0\,e^{-\alpha x}\cos(\omega t - \beta x + \phi)$$
Line it up with the given field term by term:
- $E_0 = 3$ V/m and $\phi = 60°$,
- $e^{-3x}$ matches $e^{-\alpha x}$, so $\alpha = 3$ Np/m,
- $-4x$ matches $-\beta x$, so $\beta = 4$ rad/m,
- $\omega = 8\pi\times10^6$ rad/s.

So
$$\boxed{\gamma = \alpha + j\beta = 3 + j4\ \text{m}^{-1}}$$
**Size and angle.** $\gamma$ is a point in the complex plane: 3 to the right, 4 up. That is a 3-4-5 right triangle:
$$|\gamma| = \sqrt{3^2 + 4^2} = \sqrt{25} = 5\ \text{m}^{-1}$$
The angle above the real axis has tangent $4/3$:
$$\angle\gamma = \tan^{-1}\tfrac43 = 53°$$
[[fig:gt]]
!!intuition Does this make sense?
  The angle of $\gamma$ is $90° - \tau$, and $\tau$ lies between $0°$ and $45°$. So $\angle\gamma$ must lie between $45°$ (good conductor) and $90°$ (no loss). $53°$ is in range and close to the good-conductor end: a very lossy material.

**Speed path.** Read $\alpha$ from the exponential and $\beta$ from the cosine; $3 + j4$ is the 3-4-5 triangle the paper hands you with $\tan^{-1}(4/3) = 53°$.

**Where points go.** Swapping $\alpha$ and $\beta$; writing the angle as $\tan^{-1}(3/4) = 37°$ (that is the angle of $\eta$, part d).`,
      figs: { gt: { svg: gammaFig(), cap: md`$\gamma = 3 + j4$: a 3-4-5 triangle with angle $53°$.` } } }),
    P({ src: 'Spring 2017 #3(c) · 6 pts', title: 'Wavelength, frequency, phase velocity',
      q: md`Find the wavelength $\lambda$, the linear frequency $f$, and the phase velocity $v_p$ of the wave.`,
      parts: [
        NT('\\lambda', PI / 2, 'm', [[2 * PI / 3, 'That uses α. The wavelength comes from β: λ = 2π/β.'], [0.25, 'That is 1/β. λ = 2π/β.']]),
        NT('f', 4, 'MHz', [[8 * PI, 'That is ω in units of 10⁶ rad/s. f = ω/2π.'], [8, 'f = ω/2π = 8π×10⁶/2π: the π cancels too.']]),
        NT('v_p', 2 * PI * 1e6, 'm/s', [[32 * PI * 1e6, 'Divide, do not multiply: v_p = ω/β.'], [3e8, 'That is c. In a material v_p = ω/β.']]),
      ],
      hints: [md`$\lambda = 2\pi/\beta$, $f = \omega/2\pi$, $v_p = \omega/\beta$.`],
      sol: md`**Wavelength.** One wavelength is the distance over which the phase $\beta x$ grows by $2\pi$:
$$\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{4} = \frac{\pi}{2}\ \text{m}$$
about 1.57 m.

**Frequency.** $\omega = 2\pi f$, so
$$f = \frac{\omega}{2\pi} = \frac{8\pi\times10^6}{2\pi} = 4\times10^6\ \text{Hz}$$
that is, 4 MHz.

**Phase velocity.** A crest is a point of constant phase $\omega t - \beta x$. Keep it constant: $x$ must grow at the rate
$$v_p = \frac{\omega}{\beta} = \frac{8\pi\times10^6}{4} = 2\pi\times10^6\ \text{m/s}$$
**Check.** $\lambda f = \frac{\pi}{2}(4\times10^6) = 2\pi\times10^6$ m/s $= v_p$ ✓.
!!intuition Does this make sense?
  $v_p \approx 6.3\times10^6$ m/s is about $c/48$. In free space a 4 MHz wave is 75 m long; here it is 1.57 m. A lossy, high-permittivity material shortens a wave enormously.

**Speed path.** Three one-line formulas; leave $\pi$ in the answers, as the paper asks.

**Where points go.** Reporting $\omega$ as the frequency; using $\alpha$ in the wavelength.` }),
    P({ src: 'Spring 2017 #3(d) · 6 pts', title: 'The intrinsic impedance',
      q: md`Find the amplitude and phase of the intrinsic impedance $\eta$ of the medium.`,
      parts: [
        NT('|\\eta|', (16 * PI * PI) / 25, 'Ω', [[(3.2 * PI * PI * 5), 'That multiplies by |γ|. η = jωμ/γ: divide.'], [120 * PI, 'That is η₀, free space. This medium is lossy.']]),
        NT('\\tau', 36.87, '°', [[53.13, 'That is the angle of γ. The angles of γ and η add to 90°.'], [45, 'τ = 45° only in the good-conductor limit. Use the actual γ.']]),
      ],
      hints: [md`$\eta = j\omega\mu/\gamma$: divide the sizes, subtract the angles.`, md`$\omega\mu_0 = (8\pi\times10^6)(4\pi\times10^{-7}) = 3.2\pi^2\ \Omega/\text{m}$.`],
      sol: md`**Governing relation.** The paper gives $\gamma\eta = j\omega\mu$. Divide by $\gamma$:
$$\eta = \frac{j\omega\mu_0}{\gamma}$$
**Size.** Sizes divide, and $|j| = 1$:
$$|\eta| = \frac{\omega\mu_0}{|\gamma|}$$
First $\omega\mu_0$, using $8\times4 = 32$ and $10^6\times10^{-7} = 10^{-1}$:
$$\omega\mu_0 = (8\pi\times10^6)(4\pi\times10^{-7}) = 3.2\pi^2\ \Omega/\text{m}$$
Divide by $|\gamma| = 5$:
$$\boxed{|\eta| = \frac{3.2\pi^2}{5} = \frac{16\pi^2}{25}\ \Omega}$$
about 6.32 Ω.

**Angle.** Angles subtract. $j$ has angle $90°$:
$$\boxed{\tau = 90° - 53° = 37°}$$
**Check in rectangular form.** Multiply top and bottom by $3 - j4$; the bottom becomes $9 + 16 = 25$:
$$\eta = \frac{j\omega\mu_0(3 - j4)}{25} = \frac{\omega\mu_0(4 + j3)}{25}$$
That is a 4-3-5 triangle: angle $\tan^{-1}(3/4) = 37°$ ✓, size $5\omega\mu_0/25 = \omega\mu_0/5$ ✓.
!!intuition Does this make sense?
  $\tau = 37°$ is below the $45°$ ceiling, as it must be. And $|\eta| \approx 6\ \Omega$ is tiny next to $\eta_0 = 377\ \Omega$: lots of conduction current means lots of $H$ for a given $E$.

**Speed path.** $|\eta| = \omega\mu/|\gamma|$ and $\tau = 90° - \angle\gamma$. Two lines.

**Where points go.** Using $f$ for $\omega$ (off by $2\pi$); giving $\tau = 53°$ (the angle of $\gamma$).` }),
    P({ src: 'Spring 2017 #3(e) · 8 pts', title: 'The magnetic field',
      q: md`Find the associated magnetic field $\mathbf H$, with its vector direction and units. Write it as $\mathbf H = H_y\hat y$ with
$$H_y = A\,e^{-3x}\cos(8\pi\cdot10^6t - 4x + \psi)$$
and $\psi$ between $-90°$ and $90°$. Enter $A$ (with its sign) and $\psi$.`,
      parts: [
        NT('A', -75 / (16 * PI * PI), 'A/m', [[75 / (16 * PI * PI), 'Check the direction: x̂ × ẑ = −ŷ, so H is along −ŷ when E is along +ẑ.'], [3 * 16 * PI * PI / 25, 'That multiplies by |η|. H = E/η.']]),
        NT('\\psi', 23.13, '°', [[96.87, 'That adds τ. Dividing by η subtracts its angle: H lags E.'], [60, 'That keeps the phase of E. H lags E by τ = 37°.']]),
      ],
      hints: [md`For a wave traveling along $\hat k$: $\tilde{\mathbf H} = \frac{1}{\eta}\hat k\times\tilde{\mathbf E}$.`, md`$\hat x\times\hat z = -\hat y$. The phase of $H$ is $60° - \tau$.`],
      sol: md`**Phasor of E.** With the cosine reference, the field has phasor
$$\tilde E_z = 3e^{j60°}e^{-\gamma x}$$
**Direction of H.** For a wave traveling along $\hat k = \hat x$, $\tilde{\mathbf H} = \frac1\eta\hat k\times\tilde{\mathbf E}$ ([Topic 5](#/l/w2-gamma)). The unit vectors give
$$\hat x\times\hat z = -\hat y$$
**Divide by η.** Divide the sizes and subtract the angles:
$$\tilde H_y = -\frac{3}{|\eta|}e^{j(60° - 37°)}e^{-\gamma x}$$
The size: $3/|\eta| = 3\cdot\frac{25}{16\pi^2} = \frac{75}{16\pi^2} \approx 0.475$ A/m.

**Back to the time domain.** Multiply by $e^{j\omega t}$ and take the real part. $e^{-\gamma x} = e^{-3x}e^{-j4x}$:
$$\boxed{\begin{aligned}\mathbf H = &-\tfrac{75}{16\pi^2}e^{-3x}\,\hat y\ \text{A/m}\\ &\times\cos(8\pi\cdot10^6t - 4x + 23°)\end{aligned}}$$
**Check the direction.** At an instant when both cosines are positive, $\mathbf E$ is along $+\hat z$ and $\mathbf H$ along $-\hat y$:
$$\hat z\times(-\hat y) = +\hat x\ ✓$$
the travel direction. And $H$ decays exactly as $E$ does ✓.

**Speed path.** Amplitude $3/|\eta|$, phase $60° - \tau$, direction from $\hat k\times\hat E$. Write it down in one line.

**Where points go.** The sign of $\hat y$ (most common); adding $\tau$ instead of subtracting it; dropping $e^{-3x}$ from $\mathbf H$.` }),

    R(md`
      ### Problem 4 (18 points): a general polarization

      A plane wave travels through a lossless medium with intrinsic impedance $\eta$:
      $$\mathbf E = E_x\cos(\omega t - \beta z)\,\hat x + E_y\sin(\omega t - \beta z + \varphi)\,\hat y$$
      ($E_x$ and $E_y$ are real constants, either sign.)
    `),
    P({ src: 'Spring 2017 #4(a) · 8 pts', title: 'The phasors',
      q: md`What are the phasors $\tilde{\mathbf E}$ and $\tilde{\mathbf H}$?`,
      parts: [
        CH(md`$\tilde{\mathbf E}$ (V/m)`, [md`$(E_x\hat x - jE_ye^{j\varphi}\hat y)\,e^{-j\beta z}$`, md`$(E_x\hat x + jE_ye^{j\varphi}\hat y)\,e^{-j\beta z}$`, md`$(E_x\hat x + E_ye^{j\varphi}\hat y)\,e^{-j\beta z}$`, md`$(E_x\hat x - jE_ye^{j\varphi}\hat y)\,e^{+j\beta z}$`], 0,
          [null, md`$\sin\theta = \cos(\theta - 90°)$, and $e^{-j90°} = -j$, not $+j$.`, md`That treats the sine as a cosine. A sine is a cosine delayed by $90°$: a factor $-j$.`, md`The wave travels toward $+z$ ($\omega t - \beta z$), so its phasor has $e^{-j\beta z}$.`]),
        CH(md`$\tilde{\mathbf H}$ (A/m)`, [md`$\tfrac1\eta(jE_ye^{j\varphi}\hat x + E_x\hat y)\,e^{-j\beta z}$`, md`$\tfrac1\eta(-jE_ye^{j\varphi}\hat x + E_x\hat y)\,e^{-j\beta z}$`, md`$\tfrac1\eta(E_x\hat x - jE_ye^{j\varphi}\hat y)\,e^{-j\beta z}$`, md`$\eta(jE_ye^{j\varphi}\hat x + E_x\hat y)\,e^{-j\beta z}$`], 0,
          [null, md`$\hat z\times\hat y = -\hat x$, which flips the sign of the $\hat x$ term.`, md`That divides $\tilde{\mathbf E}$ by $\eta$ without turning it: $\mathbf H$ is perpendicular to $\mathbf E$.`, md`$H$ is $E$ divided by $\eta$, not multiplied.`]),
      ],
      hints: [md`$\sin\theta = \cos(\theta - 90°)$, so a sine brings a factor $e^{-j90°} = -j$.`, md`$\tilde{\mathbf H} = \frac1\eta\hat z\times\tilde{\mathbf E}$, with $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$.`],
      sol: md`**The convention.** $\mathbf E(t) = \Re\{\tilde{\mathbf E}e^{j\omega t}\}$ with a cosine reference ([Topic 1](#/l/w1-phasor)).

**The $x$ part** is already a cosine:
$$E_x\cos(\omega t - \beta z) \;\to\; E_xe^{-j\beta z}$$
**The $y$ part** is a sine. Write it as a cosine first, using $\sin\theta = \cos(\theta - 90°)$:
$$E_y\sin(\omega t - \beta z + \varphi) = E_y\cos(\omega t - \beta z + \varphi - 90°)$$
So its phasor is $E_ye^{j\varphi}e^{-j90°}e^{-j\beta z}$, and $e^{-j90°} = -j$:
$$\boxed{\tilde{\mathbf E} = (E_x\hat x - jE_ye^{j\varphi}\hat y)\,e^{-j\beta z}}$$
in V/m.

**H.** The wave travels toward $+\hat z$, so $\tilde{\mathbf H} = \frac1\eta\hat z\times\tilde{\mathbf E}$. The two cross products:
$$\hat z\times\hat x = \hat y, \qquad \hat z\times\hat y = -\hat x$$
Apply them term by term. The $-j$ times the $-\hat x$ gives $+j\hat x$:
$$\boxed{\tilde{\mathbf H} = \frac1\eta(jE_ye^{j\varphi}\hat x + E_x\hat y)\,e^{-j\beta z}}$$
in A/m.

**Check.** Each linear piece separately: $E$ along $\hat x$ with $H$ along $\hat y$ gives $\hat x\times\hat y = \hat z$ ✓; $E$ along $\hat y$ with $H$ along $-\hat x$ gives $\hat y\times(-\hat x) = \hat z$ ✓.

**Speed path.** Sine means a factor $-j$. Then rotate: $\hat x\to\hat y$, $\hat y\to-\hat x$, and divide by $\eta$.

**Where points go.** $+j$ for the sine; the sign of the $\hat x$ term of $\tilde{\mathbf H}$; leaving $e^{-j\beta z}$ off.` }),
    P({ src: 'Spring 2017 #4(b) · 6 pts', title: 'The time-averaged Poynting vector',
      q: md`What is the time-averaged Poynting vector $\langle\mathbf S\rangle$?`,
      parts: [
        X(md`$\langle S_z\rangle$ in W/m² (use Ex, Ey, eta, phi)`, '(Ex^2+Ey^2)/(2*eta)', { Ex: [-3, 3], Ey: [-3, 3], eta: [50, 400], phi: [0, 3] }),
        CH('Direction', [md`$+\hat z$`, md`$-\hat z$`, md`$\hat x + \hat y$`, md`it depends on $\varphi$`], 0,
          [null, md`The wave travels toward $+z$; power flows with it.`, md`$\langle\mathbf S\rangle$ points along the travel, perpendicular to both fields.`, md`$\varphi$ cancels: the cross terms drop out.`]),
      ],
      hints: [md`$\langle\mathbf S\rangle = \frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. Conjugate every $j$ and every $e^{j\varphi}$ in $\tilde{\mathbf H}$.`],
      sol: md`**Governing formula** ([Topic 4](#/l/w1-avg)):
$$\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$$
**Conjugate H.** $\eta$ is real (lossless). Every $j$ becomes $-j$, $e^{j\varphi}$ becomes $e^{-j\varphi}$, and $e^{-j\beta z}$ becomes $e^{+j\beta z}$:
$$\tilde{\mathbf H}^* = \tfrac1\eta(-jE_ye^{-j\varphi}\hat x + E_x\hat y)\,e^{j\beta z}$$
The $e^{\mp j\beta z}$ cancel in the product. Four cross terms remain:
- $E_x\hat x\times E_x\hat y = E_x^2\,\hat z$,
- $E_x\hat x\times(-jE_ye^{-j\varphi}\hat x) = 0$ (parallel vectors),
- $(-jE_ye^{j\varphi}\hat y)\times(-jE_ye^{-j\varphi}\hat x) = (-j)^2E_y^2(\hat y\times\hat x) = (-1)E_y^2(-\hat z) = E_y^2\,\hat z$,
- $(-jE_ye^{j\varphi}\hat y)\times E_x\hat y = 0$.

So
$$\tilde{\mathbf E}\times\tilde{\mathbf H}^* = \frac{E_x^2 + E_y^2}{\eta}\,\hat z$$
It is already real. Halve it:
$$\boxed{\langle\mathbf S\rangle = \frac{E_x^2 + E_y^2}{2\eta}\,\hat z\ \ \text{W/m}^2}$$
!!intuition Does this make sense?
  The two linear parts are perpendicular, so they carry power independently, and the powers add. The phase $\varphi$ changes the shape of the polarization but never the power.

**Speed path.** Power $= |\tilde E|^2/2\eta$ along the travel, with $|\tilde E|^2 = E_x^2 + E_y^2$.

**Where points go.** Forgetting the conjugate (the $(-j)^2$ then comes out as $-1$ and the $E_y^2$ term cancels the wrong way); forgetting the $\tfrac12$.` }),
    P({ src: 'Spring 2017 #4(c) · 4 pts', title: 'Which one is left-handed?',
      q: md`Under which condition is the wave **left-hand circularly polarized** (LHCP)?`,
      parts: [CH('', [md`$E_x = -E_y$ and $\varphi = 0$`, md`$E_x = E_y$ and $\varphi = 0$`, md`$E_x = E_y$ and $\varphi = \pi/2$`, md`$E_x = -E_y$ and $\varphi = \pi/2$`, 'None of these.'], 0,
        [null, md`That is $\cos\omega t\,\hat x + \sin\omega t\,\hat y$: it turns from $\hat x$ toward $\hat y$, which with travel along $+z$ is right-handed.`, md`$\sin(\omega t + \pi/2) = \cos\omega t$, so both components are $\cos\omega t$: linear at $45°$.`, md`Both components become $\pm\cos\omega t$: linear at $-45°$.`, md`$E_x = -E_y$ with $\varphi = 0$ is left-handed.`])],
      hints: [md`Set $z = 0$ and write each option as $\mathbf E(t)$. Where does the tip point at $\omega t = 0$ and at $\omega t = 90°$?`, md`Course convention (Lecture 24): point your thumb along the travel; the hand whose fingers curl the way $\mathbf E$ turns is the handedness.`],
      sol: md`**The convention** ([Topic 9](#/l/w3-pol)): point a thumb along the direction of travel. If the fingers of the **left** hand curl the way $\mathbf E$ turns, the wave is left-handed. For travel along $+z$, the phasor $\hat x - j\hat y$ is right-handed and $\hat x + j\hat y$ is left-handed.

**Test each option at $z = 0$**, where $\mathbf E = E_x\cos\omega t\,\hat x + E_y\sin(\omega t + \varphi)\,\hat y$.

**$\varphi = \pi/2$.** $\sin(\omega t + \pi/2) = \cos\omega t$, so both components are $\cos\omega t$ times a constant. The tip moves on a line: **linear**, for $E_x = E_y$ and for $E_x = -E_y$ alike.

**$E_x = E_y$, $\varphi = 0$.**
$$\mathbf E = E_x(\cos\omega t\,\hat x + \sin\omega t\,\hat y)$$
At $\omega t = 0$ it points along $\hat x$; a quarter period later along $\hat y$. It turns from $\hat x$ to $\hat y$: right thumb along $+z$, fingers curl $\hat x\to\hat y$. **Right-handed.**

**$E_x = -E_y$, $\varphi = 0$.**
$$\mathbf E = E_x(\cos\omega t\,\hat x - \sin\omega t\,\hat y)$$
At $\omega t = 0$ along $\hat x$; a quarter period later along $-\hat y$. It turns from $\hat x$ to $-\hat y$, clockwise seen from $+z$: the left hand curls that way with its thumb along $+z$. **Left-handed.** If $E_x < 0$ both components flip sign, and the sense of rotation does not change.

[[fig:pol]]
$$\boxed{E_x = -E_y\ \text{and}\ \varphi = 0}$$
**Check with the phasor.** From part (a), with $\varphi = 0$ and $E_y = -E_x$: $\tilde{\mathbf E} = E_x(\hat x + j\hat y)e^{-j\beta z}$, the left-handed phasor ✓.

**Speed path.** Write the phasor of each option ($-jE_ye^{j\varphi}$ on $\hat y$) and compare with $\hat x \pm j\hat y$: $+j$ is left-handed for travel along $+z$.

**Where points go.** Using the opposite (optics) convention; calling $\varphi = \pi/2$ circular, when the sine already supplies the $90°$ and $\varphi = \pi/2$ cancels it.`,
      figs: { pol: { svg: polFig(), cap: md`Option $E_x = -E_y$, $\varphi = 0$, seen from $+z$ with the wave coming toward you: $\mathbf E$ turns from $+\hat x$ to $-\hat y$, clockwise. Left thumb along $+z$: left-handed.` } } }),

    R(md`
      ### Problem 5 (20 points): a bounce diagram and a pulse

      A line with $Z_0 = 50\ \Omega$, length $l = 750$ m and $v = 250$ m/µs is driven at $z = 0$ by a voltage source $f(t)$ with internal resistance $R_g = 100\ \Omega$, and terminated at $z = l$ by $R_L = 25\ \Omega$.
    `),
    P({ src: 'Spring 2017 #5(a) · 6 pts', title: 'τ_g, Γ_g and Γ_L',
      q: md`[[fig:c]]

Compute the line parameters $\tau_g$, $\Gamma_g$ and $\Gamma_L$ for voltage.`,
      figs: { c: { svg: ckt5(), cap: 'The circuit of Problem 5.' } },
      parts: [
        NT('\\tau_g', S5.tauG, '', [[2 / 3, 'That is R_g/(R_g + Z_0). The line takes the share across Z_0: Z_0/(R_g + Z_0).']]),
        NT('\\Gamma_g', S5.GammaG, '', [[-1 / 3, 'Reversed: Γ_g = (R_g − Z_0)/(R_g + Z_0), and R_g > Z_0.']]),
        NT('\\Gamma_L', S5.GammaL, '', [[1 / 3, 'Reversed: Γ_L = (R_L − Z_0)/(R_L + Z_0), and R_L < Z_0.']]),
      ],
      hints: [md`Until a reflection returns, the generator sees $Z_0$: a voltage divider.`, md`$\Gamma = (R - Z_0)/(R + Z_0)$ at either end, with that end's resistance.`],
      sol: md`**Three different taus.** On this site $\tau_g$ is the generator's **injection coefficient** (lines), $\tau = 1 + \Gamma$ is a **transmission coefficient**, and $\tau$ alone in a lossy wave is the **angle of $\eta$**. Here only $\tau_g$ appears.

**Injection coefficient $\tau_g$.** At switch-on no wave has reached the load, so the line looks to the generator like a resistor $Z_0$ ([Topic 14](#/l/w5-launch)). The source divides between $R_g$ and $Z_0$:
$$V^+ = \frac{Z_0}{R_g + Z_0}V_g \equiv \tau_gV_g$$
$$\boxed{\tau_g = \frac{50}{100 + 50} = \frac13}$$
**Load reflection $\Gamma_L$.** At the load the total voltage over the total current must be $R_L$. With $V^-$ the reflected wave and $I = (V^+ - V^-)/Z_0$:
$$\frac{V^+ + V^-}{(V^+ - V^-)/Z_0} = R_L$$
Cross-multiply and collect $V^+$ and $V^-$:
$$V^+(R_L - Z_0) = V^-(R_L + Z_0)$$
So $\Gamma_L = V^-/V^+$ is
$$\boxed{\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0} = \frac{25 - 50}{75} = -\frac13}$$
**Generator reflection $\Gamma_g$.** A wave returning to the generator sees $R_g$ in series with an ideal source, which does nothing to a returning wave (it is a short for it). So the same formula, with $R_g$:
$$\boxed{\Gamma_g = \frac{R_g - Z_0}{R_g + Z_0} = \frac{50}{150} = \frac13}$$
!!intuition Does this make sense?
  $R_L < Z_0$ is closer to a short, so $\Gamma_L < 0$ (the reflection subtracts). $R_g > Z_0$ is closer to an open, so $\Gamma_g > 0$.

**Speed path.** $\tau_g = Z_0/(R_g + Z_0)$; $\Gamma = (R - Z_0)/(R + Z_0)$ at each end. Fifteen seconds.

**Where points go.** Flipping the numerator of $\Gamma$; using $R_L$ in the divider for $\tau_g$.` }),
    P({ src: 'Spring 2017 #5(b) · 4 pts', title: 'The bounce diagram for a step',
      q: md`Construct the voltage bounce diagram for $f(t) = u(t)$ V, from $t = 0$ to about 10 µs. Label the voltage carried by each bounce. Then read these values off your diagram.`,
      parts: [
        NT('wave leaving the generator at 6 µs', S5.tauG * S5.GammaL * S5.GammaG, 'V', [[1 / 27, 'Two reflections: (1/3)(−1/3)(1/3). The sign comes from Γ_L.'], [-1 / 9, 'That is the wave leaving the load at 3 µs. At the generator multiply by Γ_g = 1/3.']]),
        NT('V at the load for 3 < t < 9 µs', TL.valueAt(S5, 750, 5), 'V', [[-1 / 9, 'That is only the reflected wave. The total at the load is incident plus reflected.']]),
        NT('V at the load as t → ∞', S5.dc.V, 'V', [[1 / 3, 'That is the first wave only. At DC the line is just a wire: R_L/(R_g + R_L).']]),
      ],
      hints: [md`One-way time $T = l/v$. Each arrival at an end multiplies the wave by that end's $\Gamma$.`, md`Steady state: at DC the line is a wire, so $V = V_gR_L/(R_g + R_L)$.`],
      sol: md`**One-way time.**
$$T = \frac{l}{v} = \frac{750\ \text{m}}{250\ \text{m}/\mu\text{s}} = 3\ \mu\text{s}$$
**The waves** ([Topic 15](#/l/w5-bounce)). The first wave carries $\tau_gV_g = \tfrac13$ V. Each time a wave reaches an end, multiply by that end's $\Gamma$:
- $0$ to $3$ µs, forward: $\tfrac13$ V,
- $3$ to $6$ µs, backward: $\tfrac13\cdot(-\tfrac13) = -\tfrac19$ V,
- $6$ to $9$ µs, forward: $-\tfrac19\cdot\tfrac13 = -\tfrac1{27}$ V,
- $9$ to $12$ µs, backward: $-\tfrac1{27}\cdot(-\tfrac13) = +\tfrac1{81}$ V.

[[fig:bd]]

**Read the load voltage off the diagram.** At $z = l$ add every wave that has arrived. Before 3 µs nothing has. At 3 µs the incident $\tfrac13$ and the reflected $-\tfrac19$ arrive together:
$$V(l) = \frac13 - \frac19 = \frac29\ \text{V}\quad(3 < t < 9\ \mu\text{s})$$
At 9 µs two more arrive, $-\tfrac1{27} + \tfrac1{81} = -\tfrac2{81}$, so $V(l) = \tfrac{16}{81}$ V.

**Check with steady state.** At DC the line is just a wire, so
$$V(l)\to\frac{R_L}{R_g + R_L} = \frac{25}{125} = \frac15\ \text{V}$$
The staircase $\tfrac29 = 0.222$, $\tfrac{16}{81} = 0.198$, … closes in on $0.2$ ✓.

[[fig:vt]]

**Speed path.** $T = 3$ µs; the amplitudes are $\tfrac13$ times powers of $\pm\tfrac13$, signs alternating in pairs ($+, -, -, +$). Check against $R_L/(R_g + R_L)$.

**Where points go.** Using $\Gamma_L$ at both ends; writing only the new wave instead of the running total when asked for $V$; losing the sign at the second bounce.`,
      figs: { bd: { svg: TL.diagram(S5, { tMax: 12 }), cap: 'Bounce diagram for a 1 V step: z across, t down, each line one wave with its voltage.' },
        vt: { svg: TL.plotT(S5, 750, { tMax: 12 }), cap: 'V at the load for the step, read off the diagram. The dashed line is the steady state, 1/5 V.' } } }),
    P({ src: 'Spring 2017 #5(c) · 10 pts', title: 'A pulse on the line: V vs z at 2 µs',
      q: md`Now the source is
$$f(t) = \sin(\omega t)\,\text{rect}\!\left(\frac{t - 0.5\ \mu\text{s}}{T}\right)$$
with $T = 1$ µs and $\omega/2\pi = \tfrac{7}{12}$ MHz: one stretch of a sine, from $t = 0$ to $t = 1$ µs. Its maximum is $+1$ V and its minimum $-0.5$ V (at the end, where it drops to zero).

[[fig:f]]

Plot the voltage on the line versus position, $V$ vs $z$ for $0 < z < 750$ m, at $t = 2$ µs (and at $t = 4$ µs: the next card). Label the vertical scale. Then read off these values.`,
      figs: { f: { svg: srcFig(), cap: 'The source voltage f(t): a sine from 0 to 1 µs, peak 1 V at 3/7 µs, −0.5 V at 1 µs, then a drop to 0.' },
        s2: { svg: snap2(), cap: 'V(z) at t = 2 µs: the source shape, times 1/3, reversed in z. Front at 500 m, end (with its jump) at 250 m.' } },
      parts: [
        NT('largest V on the line at 2 µs', pulseV(S5, fP, 2750 / 7, 2), 'V', [[1, 'Only τ_g = 1/3 of the source gets onto the line.']]),
        NT('z where it occurs', 2750 / 7, 'm', [[250 * (1 + 3 / 7), 'That places the pulse with its front on the left. The front left first, so it is farthest along: z = v(t − t′).']]),
        NT('V just right of z = 250 m', pulseV(S5, fP, 250.001, 2), 'V', [[-0.5, 'Multiply by τ_g = 1/3.'], [1 / 6, 'The end of the pulse is the negative part of the sine: −1/2 times 1/3.']]),
        CH('Where is the pulse at 2 µs?', ['between 250 m and 500 m, front at 500 m', 'between 0 and 250 m, front at 250 m', 'between 500 m and 750 m, front at 750 m', 'between 250 m and 500 m, front at 250 m'], 0,
          [null, md`That is where it was at $t = 1$ µs.`, md`That is where it is at $t = 3$ µs.`, md`The front left the generator first, so it is the part farthest along the line.`]),
      ],
      hints: [md`A forward wave at $(z, t)$ carries what the source sent at $t' = t - z/v$: $V = \tau_gf(t - z/v)$.`, md`At $t = 2$ µs the front ($t' = 0$) is at $z = vt = 500$ m and the end ($t' = 1$ µs) at $z = v(t - 1\ \mu\text{s}) = 250$ m.`],
      sol: md`**What a pulse does on a line.** Every wave carries a delayed, scaled copy of the source. The forward wave launched by $f$ is
$$V^+(z,t) = \tau_g\,f\!\left(t - \frac zv\right)$$
At point $z$ and time $t$, it carries the part of $f$ that left the generator at $t' = t - z/v$.

**The pulse is 250 m long.** It lasts 1 µs and moves 250 m per µs.

**At $t = 2$ µs.** The front ($t' = 0$) has gone $vt = 500$ m. The end ($t' = 1$ µs) left 1 µs later, so it has gone 250 m. The load is at 750 m, so nothing has reflected yet. On $250 < z < 500$ m:
$$V(z, 2\ \mu\text{s}) = \tfrac13\,f\!\left(2 - \tfrac{z}{250}\right)$$
with $t$ in µs and $z$ in m. Find the key points of $f$ first. $f = \sin(2\pi\cdot\tfrac7{12}t')$, so its argument is $\tfrac{7\pi}{6}t'$:
- **peak** when $\tfrac{7\pi}{6}t' = \tfrac\pi2$, at $t' = \tfrac37$ µs,
- **zero** when $\tfrac{7\pi}{6}t' = \pi$, at $t' = \tfrac67$ µs,
- **end**, $t' = 1$: $\sin\tfrac{7\pi}{6} = -\tfrac12$.

**Map each one to $z = 250(2 - t')$:**
- front $t' = 0$: $z = 500$ m, $V = 0$,
- peak $t' = \tfrac37$: $z = 250\cdot\tfrac{11}{7} = 393$ m, $V = \tfrac13$ V,
- zero $t' = \tfrac67$: $z = 250\cdot\tfrac87 = 286$ m,
- end $t' = 1^-$: $z = 250$ m, $V = -\tfrac16$ V, then a jump to 0.

[[fig:s2]]

The picture is the source plot **flipped left to right**: the front, which left first, is farthest down the line.

**Speed path.** Front at $vt$, end at $v(t - 1\ \mu\text{s})$, heights times $\tau_g$, and mirror the source shape. Mark the peak at $\tfrac37$ of the way back from the front.

**Where points go.** Drawing the pulse the same way round as $f(t)$ (front on the left); forgetting $\tau_g$ (peak 1 V instead of $\tfrac13$); missing the jump at the end.` }),
    P({ src: 'Spring 2017 #5(c), continued', title: 'The pulse after it reflects: V vs z at 4 µs',
      q: md`Same line and same pulse. Plot $V$ vs $z$ at $t = 4$ µs, label the vertical scale, and read off these values.`,
      parts: [
        NT('most negative V at 4 µs', pulseV(S5, fP, 4250 / 7, 4), 'V', [[-1 / 3, 'The pulse has reflected: multiply by Γ_L = −1/3, so the peak becomes −1/9.'], [1 / 9, 'Γ_L is negative: the reflected peak points down.']]),
        NT('z where it occurs', 4250 / 7, 'm', [[750 - (250 * 3) / 7, 'That draws the backward pulse the wrong way round. Its front (which reflected first) is now on its left, at 500 m; the peak is 3/7 µs behind it.']]),
        NT('V just left of z = 750 m', pulseV(S5, fP, 749.999, 4), 'V', [[-1 / 6, 'That is the forward pulse’s end. At 4 µs the end of the pulse has just reflected: multiply by Γ_L.'], [-1 / 18, 'Γ_L = −1/3 flips the sign of the −1/6.']]),
        CH('Compared with $t = 2$ µs, the pulse at $t = 4$ µs is…', ['flipped upside down, a third the height, and reversed in z again', 'the same shape, a third the height', 'flipped upside down, the same height', 'the same as at 2 µs, moved 500 m'], 0,
          [null, md`$\Gamma_L < 0$ flips it, and a backward wave has its front on the left, so it is also mirrored in $z$.`, md`Its height is $\Gamma_L$ times the incident: a third of $\tfrac13$.`, md`It reflected off a $25\ \Omega$ load with $\Gamma_L = -\tfrac13$.`]),
      ],
      hints: [md`At 4 µs the forward pulse would sit at 750 to 1000 m: past the load. It has reflected completely.`, md`The reflected wave is $V^- = \Gamma_L\tau_gf\big(t - \tfrac{2l - z}{v}\big)$: it has traveled $l$ forward and $l - z$ back.`],
      sol: md`**Where is the forward pulse?** At 4 µs its front would be at $vt = 1000$ m and its end at $v(t - 1) = 750$ m: past the load. The whole pulse has reached the load and reflected (the end arrives exactly now).

**The reflected wave.** It has traveled $l$ to the load and $l - z$ back, a delay of $(2l - z)/v$, and picked up $\Gamma_L$:
$$V^-(z,t) = \Gamma_L\tau_g\,f\!\left(t - \frac{2l - z}{v}\right)$$
With $\Gamma_L\tau_g = -\tfrac19$, $2l = 1500$ m, $v = 250$ m/µs and $t = 4$ µs, the argument is
$$t' = 4 - \frac{1500 - z}{250} = \frac{z}{250} - 2$$
So $t'$ runs from 0 to 1 as $z$ runs from 500 m to 750 m. Nothing else is on the line: the reflection does not reach the generator until 6 µs.

**Map the key points**, $z = 250(2 + t')$, $V = -\tfrac19f(t')$:
- front $t' = 0$: $z = 500$ m, $V = 0$,
- peak of $f$, $t' = \tfrac37$: $z = 250\cdot\tfrac{17}{7} = 607$ m, $V = -\tfrac19$ V,
- zero, $t' = \tfrac67$: $z = 250\cdot\tfrac{20}{7} = 714$ m,
- end $t' = 1^-$: $z = 750^-$, $V = -\tfrac19(-\tfrac12) = +\tfrac1{18}$ V.

[[fig:s4]]

**Check one point another way.** The peak reached the load at $3 + \tfrac37$ µs and then traveled back for $\tfrac47$ µs: $250\cdot\tfrac47 = 143$ m, to $z = 750 - 143 = 607$ m ✓.

**Compare with 2 µs.** Upside down ($\Gamma_L < 0$), a third as tall, and mirrored again in $z$: a backward wave's front is on its left.

**Speed path.** Reflected pulse: heights times $\Gamma_L\tau_g = -\tfrac19$; its front has come back $v(t - T)$ from the load; draw the source shape the right way round from that front.

**Where points go.** Leaving a forward pulse on the line at 4 µs; forgetting the sign of $\Gamma_L$; drawing the reflected pulse mirrored the wrong way.`,
      figs: { s4: { svg: snap4(), cap: 'V(z) at t = 4 µs: only the reflected pulse, times −1/9, front at 500 m. At the load the end of the pulse is just leaving.' } } }),

    R(md`
      ### Problem 6 (11 points): a shorted line

      A lossless, short-circuited line of length $l$, characteristic impedance $Z_0$ and speed $v = \tfrac23c = 2\times10^8$ m/s is connected in series with a resistor $R = 50\ \Omega$ and an ideal source $f(t) = \Re\{\tilde Fe^{j\omega t}\}$, with $\tilde F = 10$ V and $\omega = \pi\times10^8$ rad/s. $d$ is the distance back from the short.
    `),
    P({ src: 'Spring 2017 #6(a), (b)(i), (b)(ii) · 6 pts', title: 'When no current flows',
      q: md`[[fig:c]]

[[fig:e]]

(a) What is the signal wavelength $\lambda$ on the line? (b) The current through the resistor, $\tilde I_R$, is found to be zero. (i) What is $Z(l)$? (ii) What is the shortest possible length $l$, in terms of $\lambda$?`,
      figs: { c: { svg: ckt6(), cap: 'The circuit. d runs from the short (d = 0) back to the input (d = l).' }, e: { svg: eqCkt(), cap: 'The same circuit, with the line replaced by its input impedance.' } },
      parts: [
        NT('\\lambda', 4, 'm', [[6, 'That uses c. On this line v = 2×10⁸ m/s.'], [2, 'λ = v/f with f = ω/2π = 50 MHz.']]),
        CH('(b)(i) $Z(l)$', [md`$\infty$ (an open circuit)`, md`$0$ (a short circuit)`, md`$50\ \Omega$`, md`$Z_0$`], 0,
          [null, md`A short at the input would make $\tilde I_R = \tilde F/R = 0.2$ A.`, md`Then $\tilde I_R = 10/100 = 0.1$ A.`, md`Then $\tilde I_R = \tilde F/(R + Z_0) \neq 0$.`]),
        NT('shortest l/λ', 0.25, '', [[0.5, 'A half-wave shorted line looks like a short again, not an open.'], [0.75, 'That also works, but it is not the shortest.']]),
        NT('shortest l', 1, 'm', [[2, 'That is λ/2: a short again.'], [3, 'That is 3λ/4: it works, but it is not the shortest.']]),
      ],
      hints: [md`Series circuit: $\tilde I_R = \tilde F/(R + Z(l))$. When is that zero?`, md`For a shorted line $Z(d) = jZ_0\tan\beta d$.`],
      sol: md`**(a) Wavelength.** $f = \omega/2\pi = 5\times10^7$ Hz, so
$$\lambda = \frac{v}{f} = \frac{2\times10^8}{5\times10^7} = 4\ \text{m}$$
**(b)(i) No current.** Everything is in series, so one current flows through the source, $R$ and the line:
$$\tilde I_R = \frac{\tilde F}{R + Z(l)}$$
With $\tilde F = 10$ V this is zero only if $Z(l)$ is infinite:
$$\boxed{Z(l) = \infty}\quad\text{(an open circuit)}$$
**(b)(ii) When does a shorted line look open?** Derive $Z(d)$ ([Topic 18](#/l/w6-stubs)). On a line, with $d$ measured back from the load,
$$\tilde V(d) = V^+\left(e^{j\beta d} + \Gamma_Le^{-j\beta d}\right)$$
$$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} - \Gamma_Le^{-j\beta d}\right)$$
A short has $\Gamma_L = -1$. Use $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$ and $e^{j\theta} + e^{-j\theta} = 2\cos\theta$:
$$\tilde V(d) = 2jV^+\sin\beta d, \qquad \tilde I(d) = \frac{2V^+}{Z_0}\cos\beta d$$
Divide:
$$Z(d) = jZ_0\tan\beta d$$
It is infinite when $\cos\beta l = 0$, that is $\beta l = \tfrac\pi2, \tfrac{3\pi}2, \ldots$ With $\beta = 2\pi/\lambda$ the shortest is
$$\frac{2\pi}{\lambda}l = \frac\pi2 \quad\Rightarrow\quad \boxed{l = \frac\lambda4 = 1\ \text{m}}$$
!!intuition Does this make sense?
  A quarter-wave line turns its load inside out: a short at one end looks like an open at the other. The current is zero at the input because the input sits at a current null of the standing wave, a quarter wavelength from the short, where the current is largest.

**Speed path.** No current in a series loop means an open; a shorted stub is open at $l = \lambda/4$. $\lambda = v/f = 4$ m.

**Where points go.** Using $c$ for the wavelength (6 m); answering $\lambda/2$, which looks like a short.` }),
    P({ src: 'Spring 2017 #6(b)(iii) · 2 pts', title: 'A voltage zero at the middle?',
      q: md`Still with $\tilde I_R = 0$: is it possible for $\tilde V(l/2) = 0$? If so, what is the shortest possible length of the line, in terms of $\lambda$? Also find $|\tilde V(l/2)|$ for the line of part (b)(ii).`,
      parts: [
        CH('', ['No, it is not possible', md`Yes, shortest $l = \lambda/2$`, md`Yes, shortest $l = \lambda$`, md`Yes, shortest $l = 3\lambda/4$`], 0,
          [null, md`A $\lambda/2$ shorted line looks like a short at its input, so $\tilde I_R = \tilde F/R \neq 0$.`, md`$l = \lambda$ does put a zero at $l/2$, but then the input looks like a short and $\tilde I_R \neq 0$.`, md`At $l = 3\lambda/4$, $l/2 = 3\lambda/8$, where $|\sin\beta d| = 1/\sqrt2$, not 0.`]),
        NT('|\\tilde V(l/2)|\\ \\text{for}\\ l = \\lambda/4', 10 / Math.SQRT2, 'V', [[5, 'That assumes |V| grows linearly with d. It grows as |sin βd|: sin 45° = 1/√2.'], [0, 'There is no zero at l/2.']]),
      ],
      hints: [md`$\tilde V(d) \propto \sin\beta d$: its zeros are at $d = 0, \lambda/2, \lambda, \ldots$`, md`With $\tilde I_R = 0$, $l$ must be an odd number of quarter wavelengths. Can half of it be a multiple of $\lambda/2$?`],
      sol: md`**The voltage pattern.** From part (b)(ii), on a shorted line
$$\tilde V(d) = 2jV^+\sin\beta d$$
Its zeros are where $\sin\beta d = 0$: $d = 0, \tfrac\lambda2, \lambda, \ldots$

**The two conditions.**
- $\tilde I_R = 0$ needs $l = \tfrac\lambda4, \tfrac{3\lambda}4, \tfrac{5\lambda}4, \ldots$: an **odd** number of quarter wavelengths.
- $\tilde V(l/2) = 0$ needs $\tfrac l2 = n\tfrac\lambda2$, so $l = n\lambda$: a **whole** number of wavelengths, which is an **even** number of quarter wavelengths.

No length is both odd and even.
$$\boxed{\text{No, it is not possible}}$$
**How big is $\tilde V(l/2)$?** With $\tilde I_R = 0$ there is no drop across $R$, so the line's input sits at the full source voltage: $\tilde V(l) = 10$ V. Divide the pattern at $l/2$ by the pattern at $l$:
$$\frac{\tilde V(l/2)}{\tilde V(l)} = \frac{\sin(\beta l/2)}{\sin\beta l}$$
For $l = \lambda/4$: $\beta l = 90°$ and $\beta l/2 = 45°$, so
$$|\tilde V(l/2)| = 10\cdot\frac{\sin45°}{\sin90°} = \frac{10}{\sqrt2} = 7.07\ \text{V}$$
The same size comes out for every allowed length: $l/2$ is always an odd number of eighths of a wavelength.

[[fig:vd]]

**Speed path.** Open input means $l$ is an odd number of $\lambda/4$; a zero at $l/2$ means $l$ is a multiple of $\lambda$. Incompatible.

**Where points go.** Answering "yes, $l = \lambda$" and forgetting that the condition $\tilde I_R = 0$ still applies.`,
      figs: { vd: { svg: PF.row([{ svg: vdFig(1), cap: md`$l = \lambda/4 = 1$ m` }, { svg: vdFig(3), cap: md`$l = 3\lambda/4 = 3$ m` }]).svg, cap: md`$|\tilde V(d)|$ on the shorted line with $|\tilde V(l)| = 10$ V. The dot is $d = l/2$: $7.07$ V each time, never zero.` } } }),
    P({ src: 'Spring 2017 #6(b)(iv) · 3 pts', title: 'Series or parallel?',
      q: md`For the same length as in (b)(ii), an inductor $L$ is connected to the input end of the line (at $d = l$). Now the current through the resistor, $\tilde I_R$, is no longer zero. Is the inductor connected in series with the line or in parallel? Explain.`,
      parts: [CH('', ['in parallel with the line', 'in series with the line', md`either way: any inductor changes $\tilde I_R$`, md`neither: an inductor cannot change $\tilde I_R$`], 0,
        [null, md`In series, the total is $j\omega L + \infty = \infty$: still an open, still $\tilde I_R = 0$.`, md`In series it changes nothing: an open plus anything is still open.`, md`In parallel it gives the current a path around the open line.`])],
      hints: [md`At this length the line's input is an open circuit. What is $j\omega L$ in series with an open? In parallel with one?`],
      sol: md`**The line's input is an open circuit**, $Z(l) = \infty$ (part b).

**In series:** the impedances add:
$$Z = j\omega L + \infty = \infty$$
The loop is still open and $\tilde I_R$ stays zero. That contradicts the observation.

**In parallel:** an open in parallel with anything is that thing:
$$Z = j\omega L\,\|\,\infty = j\omega L$$
Then $\tilde I_R = \tilde F/(R + j\omega L) \neq 0$, as observed.
$$\boxed{\text{In parallel}}$$
**Speed path.** Open line: series adds nothing to an open, parallel bypasses it.

**Where points go.** Answering without the reason (the paper asks for a brief explanation): name the open circuit and what each connection does to it.` }),

    R(md`
      ### After you finish: where each problem lives

      | Problem | Points | Skill | Lesson |
      |---|---|---|---|
      | 1(a) | 2 | loss tangent and frequency | [Topic 5](#/l/w2-gamma) |
      | 1(b), (c) | 4 | checking Maxwell; standing-wave power | [Topic 12](#/l/w4-standing) |
      | 2(i), (iv) | 6 | good conductors; $\Gamma$ off a conductor | [Topic 7](#/l/w2-limits), [Topic 11](#/l/w4-gamma) |
      | 2(ii) | 3 | the parallel-plate line | [Topic 13](#/l/w5-telegraph) |
      | 2(iii) | 3 | $\mathbf E$ from $\mathbf H$ in one wave | [Topic 5](#/l/w2-gamma) |
      | 2(v), (vi) | 6 | reading a trace backwards | [Topic 16](#/l/w5-multi) |
      | 3 | 27 | reading $\gamma$, $\eta$, $\mathbf H$ from a lossy wave | [Topic 6](#/l/w2-read) |
      | 4 | 18 | phasors, $\langle\mathbf S\rangle$, handedness | [Topic 4](#/l/w1-avg), [Topic 9](#/l/w3-pol) |
      | 5 | 20 | $\tau_g$, $\Gamma$, bounce diagram, a pulse vs $z$ | [Topic 15](#/l/w5-bounce) |
      | 6 | 11 | shorted stubs, $Z(d)$, $V(d)$ | [Topic 18](#/l/w6-stubs) |
    `),
  ];

  // ======================================================================================== SUMMER 2020
  function su20Sheet() {
    const g = PF.fig({ alt: 'a current sheet seen edge-on at z = 0 carrying J_s along +y; waves leave toward +z and toward -z' });
    const x0 = 170, ya = 34, yb = 150, ax = 128;
    g.arrow(20, ax, 330, ax, { cls: 'dim', hs: 7 }); g.label(334, ax, 'z', 'l', 'small accent');
    g.line(x0, ya, x0, yb, { cls: 'thick dash' });
    g.arrow(x0 + 14, 100, x0 + 14, 56, { cls: 'thick', hs: 8 }); g.label(x0 + 22, 64, '\\mathbf J_s = \\hat y\\,4u(t)\\sin\\omega t', 'l', 'small');
    g.arrow(x0 + 70, 40, x0 + 140, 40, { hs: 8 }); g.label(x0 + 105, 34, '\\text{toward } +z', 'b', 'small');
    g.arrow(x0 - 30, 40, x0 - 100, 40, { hs: 8 }); g.label(x0 - 65, 34, '\\text{toward } {-z}', 'b', 'small');
    g.label(x0 + 6, ax + 6, '0', 'tl', 'small accent');
    return g.svg();
  }
  const E0 = 240 * PI;
  const eyZ = () => PF.plot({ w: 380, h: 210, x: [0, 900], y: [-1000, 1000], zero: true, xl: 'z\\,(\\text{m})', yl: 'E_y(z,\\,2\\,\\mu\\text{s})\\,(\\text{V/m})',
    xt: [150, 300, 450, 600, 750, 900].map((z) => [z, String(z)]), yt: [[E0, '240\\pi'], [-E0, '-240\\pi']],
    curves: [{ f: (z) => (z < 600 ? E0 * Math.sin((2 * PI * z) / 300) : 0), n: 900 }] });
  const eyT = () => PF.plot({ w: 380, h: 210, x: [0, 4], y: [-1000, 1000], zero: true, xl: 't\\,(\\mu\\text{s})', yl: 'E_y(600\\,\\text{m},\\,t)\\,(\\text{V/m})',
    xt: [1, 2, 3, 4].map((t) => [t, String(t)]), yt: [[E0, '240\\pi'], [-E0, '-240\\pi']],
    curves: [{ f: (t) => (t < 2 ? 0 : -E0 * Math.sin(2 * PI * t)), n: 800 }] });

  const su20 = [
    R(md`
      **Summer 2020 · ECE 329 · Hour Exam 3** (Prof. Kudeki). Three problems, 25 points each: 75 points as posted. The date is not on the paper. Free-space constants: $\eta_0 = 120\pi\ \Omega$, $c = 3\times10^8$ m/s, $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \frac{10^{-9}}{36\pi}$ F/m.

      The posted key is handwritten. Every line of it was re-derived here and checked numerically, and it holds up: no errors found. The solutions below do each step slowly and add the checks the key skips.

      **What it tests.** Problem 1 reads plane waves in the time domain (Exam 2 material that Exam 3 builds on, plus a delta-function scaling trick). Problem 2 is a current-sheet antenna with its Poynting power ([Topic 10](#/l/w3-antenna), [Topic 4](#/l/w1-avg)). Problem 3 is lossy media: the loss tangent, good conductors, skin depth ([Topic 7](#/l/w2-limits)).

      **How to use it.** Set a 75-minute timer and work on paper. This paper has 75 points, so aim to finish in about 55 minutes (the Fall 2026 pace of 100 points in 75 minutes) and use the rest to check. Then enter your answers; numeric boxes take arithmetic such as <code>480*pi</code> or <code>2*pi/300</code>.
    `),

    R(md`
      ### Problem 1 (25 points): three independent parts
    `),
    P({ src: 'Summer 2020 #1(a) · 6 pts', title: 'E from H in free space',
      q: md`Given
$$\mathbf H = 4\cos(\omega t - \beta x)\,\hat z + 8\sin(\omega t - \beta x)\,\hat y\ \ \text{A/m}$$
determine the accompanying $\mathbf E$ in free space, where $\eta = \eta_0 = 120\pi\ \Omega$. Write it as $\mathbf E = A\cos(\omega t - \beta x)\,\hat y + B\sin(\omega t - \beta x)\,\hat z$ and enter $A$ and $B$.`,
      parts: [
        NT('A', 480 * PI, 'V/m', [[-480 * PI, 'Check E × H: with H along +ẑ, E must be along +ŷ (ŷ × ẑ = x̂, the travel).'], [4 / (120 * PI), 'That divides by η₀. |E| = η₀|H|.']]),
        NT('B', -960 * PI, 'V/m', [[960 * PI, 'Check E × H: with H along +ŷ, E must be along −ẑ, since (−ẑ) × ŷ = x̂.'], [-8 / (120 * PI), 'That divides by η₀. |E| = η₀|H|.']]),
      ],
      hints: [md`The wave travels toward $+\hat x$. $\mathbf E\times\mathbf H$ must point along $+\hat x$, and $|\mathbf E| = \eta_0|\mathbf H|$ for each part.`, md`From scratch: Ampère's law, $\epsilon_0\,\partial E_y/\partial t = -\partial H_z/\partial x$ and $\epsilon_0\,\partial E_z/\partial t = \partial H_y/\partial x$.`],
      sol: md`**Travel direction.** Both terms depend on $\omega t - \beta x$: the wave travels toward $+\hat x$.

**From first principles: Ampère's law** in free space, $\nabla\times\mathbf H = \epsilon_0\,\partial\mathbf E/\partial t$. The fields depend only on $x$ and $t$, so $\partial/\partial y = \partial/\partial z = 0$. The $y$ component of the curl:
$$(\nabla\times\mathbf H)_y = \frac{\partial H_x}{\partial z} - \frac{\partial H_z}{\partial x} = -\frac{\partial H_z}{\partial x}$$
With $H_z = 4\cos(\omega t - \beta x)$: the derivative of $\cos$ is $-\sin$, and the chain rule brings the inner factor $-\beta$. The two minus signs cancel:
$$\frac{\partial H_z}{\partial x} = 4\beta\sin(\omega t - \beta x)$$
So
$$-\frac{\partial H_z}{\partial x} = -4\beta\sin(\omega t - \beta x)$$
So $\epsilon_0\,\partial E_y/\partial t = -4\beta\sin(\omega t - \beta x)$. Integrate in $t$: $\int\sin(\omega t - \beta x)\,dt = -\cos(\omega t - \beta x)/\omega$:
$$E_y = \frac{4\beta}{\epsilon_0\omega}\cos(\omega t - \beta x)$$
In free space $\beta = \omega\sqrt{\mu_0\epsilon_0}$, so $\frac{\beta}{\epsilon_0\omega} = \sqrt{\mu_0/\epsilon_0} = \eta_0$:
$$E_y = 4\eta_0\cos(\omega t - \beta x) = 480\pi\cos(\omega t - \beta x)$$
**The $z$ component** of the curl, the same way:
$$(\nabla\times\mathbf H)_z = \frac{\partial H_y}{\partial x} = -8\beta\cos(\omega t - \beta x)$$
So $\epsilon_0\,\partial E_z/\partial t = -8\beta\cos(\omega t - \beta x)$. Integrate:
$$E_z = -8\eta_0\sin(\omega t - \beta x) = -960\pi\sin(\omega t - \beta x)$$
$$\boxed{\begin{aligned}\mathbf E = &\ 480\pi\cos(\omega t - \beta x)\,\hat y\\ &- 960\pi\sin(\omega t - \beta x)\,\hat z\ \ \text{V/m}\end{aligned}}$$
**The shortcut, and the check.** For one traveling wave, $\mathbf E = \eta_0\,\mathbf H\times\hat k$. Here $\hat z\times\hat x = \hat y$ and $\hat y\times\hat x = -\hat z$, which reproduces both terms. And $\mathbf E\times\mathbf H$ for the cosine pair is $\hat y\times\hat z = \hat x$ ✓, the travel direction.

**Speed path.** Multiply each part of $\mathbf H$ by $\eta_0$ and rotate it with $\times\hat x$. Ten seconds.

**Where points go.** The sign of the $\hat z$ term: $\hat y\times\hat x = -\hat z$. Leaving $\eta_0$ as a symbol is fine; dividing by it is not.` }),
    P({ src: 'Summer 2020 #1(b) · 6 pts', title: 'B from Faraday’s law',
      q: md`If $\mathbf E = \cos(\omega t - \beta y)\,\hat z$ V/m in free space, so that $\omega/\beta = c$, find the corresponding $\mathbf B$ using Faraday's law $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$. (Or else use $\mathbf B = \mu_0\mathbf H$.)`,
      parts: [
        NT('|\\mathbf B|\\ \\text{amplitude}', 1 / 3e8, 'T', [[1 / (120 * PI), 'That is H = E/η₀, in A/m. B = μ₀H = E/c.'], [3e8, 'B = E/c: divide by c.']]),
        CH('Direction of $\\mathbf B$ when $\\cos(\\omega t - \\beta y) > 0$', [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat y$`, md`$+\hat z$`], 0,
          [null, md`Then $\mathbf E\times\mathbf B$ would point along $-\hat y$, against the travel.`, md`$\hat y$ is the travel direction; a plane wave has no field along it.`, md`$\mathbf B$ is perpendicular to $\mathbf E$.`]),
      ],
      hints: [md`$(\nabla\times\mathbf E)_x = \partial E_z/\partial y - \partial E_y/\partial z$.`],
      sol: md`**The curl.** $\mathbf E = E_z(y,t)\hat z$, so only the $x$ component of the curl survives:
$$(\nabla\times\mathbf E)_x = \frac{\partial E_z}{\partial y} - \frac{\partial E_y}{\partial z} = \frac{\partial E_z}{\partial y}$$
Differentiate $\cos(\omega t - \beta y)$ in $y$: the inner derivative is $-\beta$, and $\cos\to-\sin$:
$$\frac{\partial E_z}{\partial y} = \beta\sin(\omega t - \beta y)$$
**Faraday's law.** $-\partial B_x/\partial t = \beta\sin(\omega t - \beta y)$. Integrate in $t$, using $\int\sin(\omega t - \beta y)\,dt = -\cos(\omega t - \beta y)/\omega$:
$$B_x = \frac{\beta}{\omega}\cos(\omega t - \beta y) = \frac1c\cos(\omega t - \beta y)$$
(The integration constant would be a static field; a wave has none.) The $y$ and $z$ components of the curl are zero, so $B_y = B_z = 0$.
$$\boxed{\mathbf B = \tfrac13\times10^{-8}\cos(\omega t - \beta y)\,\hat x\ \text{T}}$$
(T is Wb/m², the unit the key uses.)

**Check.** $\mathbf E\times\mathbf B$: $\hat z\times\hat x = \hat y$ ✓, the travel. And $|\mathbf E|/|\mathbf B| = c$ ✓. The other route gives the same: $\mathbf H = \frac{1}{\eta_0}\hat y\times\hat z\cos(\ldots) = \frac{1}{\eta_0}\cos(\ldots)\hat x$, and $\mu_0/\eta_0 = \sqrt{\mu_0\epsilon_0} = 1/c$.

**Speed path.** $B = E/c$, direction from $\mathbf E\times\mathbf B\parallel\hat k$.

**Where points go.** Giving $\mathbf H$ (A/m) when $\mathbf B$ (T) is asked; the sign of $\hat x$.` }),
    P({ src: 'Summer 2020 #1(c)(i)–(iii) · 10 pts', title: 'Reading a medium from two waves',
      q: md`In a homogeneous ideal dielectric with $\epsilon = \epsilon_r\epsilon_0$ and $\mu = \mu_r\mu_0$, plane TEM waves with these components are observed:
$$\mathbf E = \hat y\,u\!\left(t + \frac{z}{c/3}\right) + \hat x\,g\!\left(t - \frac{z}{c/3}\right)\ \ \text{V/m}$$
$$\mathbf H = \hat y\,\delta\!\left(\frac{15z}{c} - 5t\right) + \hat x\,\frac{1}{60\pi}u\!\left(t + \frac{3z}{c}\right)\ \ \text{A/m}$$
where $u(t)$ is the unit step and $c$ the speed of light in free space. (i) Determine $\eta$ for the medium. (ii) Determine the propagation velocity $v$. (iii) Determine $\epsilon_r$ and $\mu_r$.`,
      parts: [
        NT('\\eta', 60 * PI, 'Ω', [[1 / (60 * PI), 'That is H/E. η = E/H.'], [120 * PI, 'That is free space. Read the ratio of the u terms.']]),
        NT('v', 1e8, 'm/s', [[3e8, 'That is c. The arguments have z/(c/3).'], [9e8, 'z/(c/3) = 3z/c means v = c/3, not 3c.']]),
        NT('\\epsilon_r', 6, '', [[1.5, 'That is μ_r. ε comes from ε = 1/(ηv).'], [1 / 6, 'Upside down: ε_r = ε/ε₀.']]),
        NT('\\mu_r', 1.5, '', [[6, 'That is ε_r. μ comes from μ = η/v.']]),
      ],
      hints: [md`Pair up the terms of the same wave: the two $u$'s travel toward $-z$; $g$ and the $\delta$ travel toward $+z$.`, md`$\eta v = 1/\epsilon$ and $\eta/v = \mu$.`],
      sol: md`**Sort the terms into waves.** A function of $t - z/v$ travels toward $+z$; a function of $t + z/v$ toward $-z$.
- $E_y = u(t + 3z/c)$ and $H_x = \tfrac{1}{60\pi}u(t + 3z/c)$: one wave, toward $-z$.
- $E_x = g(t - 3z/c)$ and $H_y = \delta(15z/c - 5t)$: the other wave, toward $+z$ (the $\delta$'s argument is $-5(t - 3z/c)$).

**(ii) Speed.** $z/(c/3)$ means
$$\boxed{v = \frac c3 = 10^8\ \text{m/s}}$$
**(i) Impedance, from the first wave.** $E_y = u(\cdot)$ and $H_x = u(\cdot)/(60\pi)$, so the ratio of sizes is
$$\boxed{\eta = 60\pi\ \Omega}$$
Check the sign: for travel toward $-z$, $\mathbf E\times\mathbf H$ must point along $-\hat z$, and $\hat y\times\hat x = -\hat z$ ✓ with both terms positive.

**(iii) The material.** Two facts about a lossless medium: $v = 1/\sqrt{\mu\epsilon}$ and $\eta = \sqrt{\mu/\epsilon}$. Multiply them and divide them:
$$\eta v = \frac1\epsilon, \qquad \frac\eta v = \mu$$
So $\epsilon = 1/(60\pi\times10^8)$. Divide by $\epsilon_0 = \frac{10^{-9}}{36\pi}$, which is multiplying by $36\pi\times10^9$:
$$\epsilon_r = \frac{36\pi\times10^9}{60\pi\times10^8} = \frac{360}{60} = 6$$
And $\mu = 60\pi\times10^{-8}$ H/m. Divide by $\mu_0 = 4\pi\times10^{-7}$:
$$\mu_r = \frac{60\pi\times10^{-8}}{4\pi\times10^{-7}} = \frac{6}{4} = 1.5$$
$$\boxed{\epsilon_r = 6,\quad \mu_r = 1.5}$$
**Check.** $v = c/\sqrt{\mu_r\epsilon_r} = c/\sqrt9 = c/3$ ✓ and $\eta = 120\pi\sqrt{1.5/6} = 120\pi/2 = 60\pi$ ✓.

**Speed path.** $v$ from the argument, $\eta$ from the $u$ pair. Then use ratios to free space: $\sqrt{\mu_r\epsilon_r} = c/v = 3$ and $\sqrt{\mu_r/\epsilon_r} = \eta/\eta_0 = \tfrac12$. Multiply: $\mu_r = 3\cdot\tfrac12 = 1.5$. Divide: $\epsilon_r = 3/\tfrac12 = 6$.

**Where points go.** Pairing an $E$ term with the $H$ term of the other wave; mixing up which of $\eta v$ and $\eta/v$ gives $\epsilon$.` }),
    P({ src: 'Summer 2020 #1(c)(iv) · 3 pts', title: 'The function g(t)',
      q: md`Same fields as the previous card. (iv) Determine the function $g(t)$. Enter the weight $k$ in $g(t) = k\,\delta(t)$, in V·s/m.`,
      parts: [NT('k', 12 * PI, 'V·s/m', [[60 * PI, 'δ(−5s) is not δ(s): scaling the argument of a delta by 5 divides its weight by 5.'], [300 * PI, 'δ(5s) = δ(s)/5: divide by 5, do not multiply.'], [-12 * PI, 'δ is even: δ(−5s) = δ(5s). No minus sign.']])],
      hints: [md`For the $+z$ wave, $H_y = E_x/\eta$, so $g = \eta\times$ (the $H_y$ term).`, md`$\delta(as) = \delta(s)/|a|$. Write $15z/c - 5t = -5(t - 3z/c)$.`],
      sol: md`**Link $g$ to $H_y$.** The second wave travels toward $+z$ with $\mathbf E = E_x\hat x$. For it, $\tilde{\mathbf H} = \frac1\eta\hat z\times\mathbf E$, and $\hat z\times\hat x = \hat y$:
$$H_y = \frac{E_x}{\eta} = \frac{g(t - 3z/c)}{60\pi}$$
**Rewrite the given $H_y$ with the same argument.** Let $s = t - 3z/c$. Then
$$\frac{15z}{c} - 5t = -5\left(t - \frac{3z}{c}\right) = -5s$$
**Scale the delta.** A delta's weight is its area. Substitute $w = as$ in $\int\delta(as)\,ds$: $ds = dw/|a|$, so the area is $1/|a|$:
$$\delta(as) = \frac{\delta(s)}{|a|}$$
With $a = -5$: $\delta(-5s) = \tfrac15\delta(s)$.

**Solve for $g$.**
$$\frac{g(s)}{60\pi} = \frac{\delta(s)}{5}$$
$$\boxed{g(t) = 12\pi\,\delta(t)}$$
**Speed path.** $g = \eta\cdot\delta(-5t) = 60\pi\cdot\tfrac15\delta(t)$.

**Where points go.** Treating $\delta(-5t)$ as $\delta(t)$ (gives $60\pi$); a stray minus sign from the $-5$ (the delta is even).` }),

    R(md`
      ### Problem 2 (25 points): a current sheet switched on at $t = 0$

      On the surface $z = 0$ there is a time-varying uniform surface current density
      $$\mathbf J_s(t) = \hat y\,4u(t)\sin(\omega t)\ \ \text{A/m}$$
      where $u(t)$ is the unit step and $\omega = 2\pi\times10^6$ rad/s. The sheet sits in free space and radiates a truncated (because of $u(t)$) co-sinusoidal plane TEM wave with $\mathbf E = \hat yE_y(z,t)$ and $\mathbf H = \hat xH_x(z,t)$ into both $z > 0$ and $z < 0$.
    `),
    P({ src: 'Summer 2020 #2(a), (b) · 6 pts', title: 'ω, β and the radiated field',
      q: md`[[fig:s]]

(a) What are the numerical values of $\omega$ and $\beta$ of the co-sinusoid in $E_y(z,t)$? (b) What is $E_y(z,t)$ for $z > 0$, in terms of $\omega$, $\beta$, $t$, $z$ and $c$?`,
      figs: { s: { svg: su20Sheet(), cap: 'The sheet seen edge-on. Its current runs along +y; it launches a wave each way.' } },
      parts: [
        NT('\\omega', 2 * PI * 1e6, 'rad/s', [[1e6, 'That is f. ω = 2πf = 2π×10⁶ rad/s.']]),
        NT('\\beta', (2 * PI) / 300, 'rad/m', [[300, 'That is the wavelength in m. β = 2π/λ.'], [1 / 150, 'β = ω/c = 2π×10⁶/(3×10⁸) = 2π/300.']]),
        X(md`$E_y$ for $t > z/c$, in V/m (use omega, beta, t, z)`, '-240*pi*sin(omega*t - beta*z)', { omega: [1, 5], beta: [0.5, 2], t: [0, 2], z: [0, 2] }),
        CH('and for $t < z/c$', ['0: the front has not arrived', md`$-240\pi\sin(\omega t - \beta z)$`, md`$-240\pi$`, md`$+240\pi\sin(\omega t + \beta z)$`], 0,
          [null, md`The source was off before $t = 0$; the factor $u(t - z/c)$ is zero until the front arrives.`, md`A step does not hold a constant value; and nothing has arrived.`, md`That is a wave toward $-z$, and it is still before the front.`]),
      ],
      hints: [md`A sheet launches $\mathbf E = -\frac{\eta_0}{2}\mathbf J_s(t - |z|/c)$ on both sides.`, md`$\eta_0/2 = 60\pi$, so the amplitude is $60\pi\cdot4 = 240\pi$ V/m.`],
      sol: md`**(a)** $\omega = 2\pi\times10^6$ rad/s is given. In free space the phase speed is $c$, so
$$\beta = \frac\omega c = \frac{2\pi\times10^6}{3\times10^8} = \frac{2\pi}{300}\ \text{rad/m}$$
about 0.0209 rad/m.

**(b) The field of a sheet, from the boundary condition** ([Topic 10](#/l/w3-antenna)). By symmetry the sheet makes the same $E_y$ just above and just below it; call it $E_s(t)$. Each side's wave has $\mathbf H = \frac{1}{\eta_0}\hat k\times\mathbf E$:
- $z > 0$, $\hat k = +\hat z$: $\hat z\times\hat y = -\hat x$, so $H_x(0^+) = -E_s/\eta_0$,
- $z < 0$, $\hat k = -\hat z$: $(-\hat z)\times\hat y = +\hat x$, so $H_x(0^-) = +E_s/\eta_0$.

The jump in tangential $\mathbf H$ across a sheet equals its current: $\hat z\times[\mathbf H(0^+) - \mathbf H(0^-)] = \mathbf J_s$. With $\hat z\times\hat x = \hat y$:
$$-\frac{2E_s}{\eta_0} = J_y \quad\Rightarrow\quad E_s = -\frac{\eta_0}{2}J_y$$
**Delay it.** The field at $z > 0$ is what the sheet made a time $z/c$ earlier:
$$E_y(z,t) = -\frac{\eta_0}{2}J_y\!\left(t - \frac zc\right)$$
$\eta_0/2 = 60\pi$, and $60\pi\cdot4 = 240\pi$. Also $\omega(t - z/c) = \omega t - \beta z$:
$$\boxed{E_y = -240\pi\,u\!\left(t - \tfrac zc\right)\sin(\omega t - \beta z)}$$
in V/m. Zero before the front arrives at $t = z/c$.

**Speed path.** $E = -\frac{\eta_0}{2}J_s$, delayed by $|z|/c$: $-60\pi\times4 = -240\pi$.

**Where points go.** Losing the minus sign (the field opposes the current at the sheet); writing $\eta_0$ instead of $\eta_0/2$; dropping the step $u(t - z/c)$.` }),
    P({ src: 'Summer 2020 #2(c), (d) · 6 pts', title: 'Power: the sheet and the wave',
      q: md`(c) What is the average Joule heating rate $\langle\mathbf J_s\cdot\mathbf E\rangle$ of the radiator at the $z = 0$ surface, for $t > 0$? (d) What is the time-averaged power per unit area carried by the radiation into the $z > 0$ region, for $t > 0$? (Hint: it is related to part (c).)`,
      parts: [
        NT('\\langle\\mathbf J_s\\cdot\\mathbf E\\rangle', -480 * PI, 'W/m^2', [[480 * PI, 'Check the sign: E opposes J_s at the sheet, so J_s·E < 0 (the sheet is a source).'], [-960 * PI, 'The average of sin² is 1/2.']]),
        NT('\\langle S_z\\rangle\\ \\text{into}\\ z > 0', 240 * PI, 'W/m^2', [[480 * PI, 'That is the total. The sheet sends half to each side.'], [120 * PI, 'That halves twice. The ½ comes once, from ⟨sin²⟩: (240π)²/2, then divide by η₀ = 120π.']]),
      ],
      hints: [md`At $z = 0$, $E_y = -240\pi\sin\omega t$ and $J_y = 4\sin\omega t$. The average of $\sin^2$ is $\tfrac12$.`, md`$\langle S\rangle = \langle E_y^2\rangle/\eta_0$ for one traveling wave.`],
      sol: md`**(c) The work done on the current.** At $z = 0$, for $t > 0$:
$$\mathbf J_s\cdot\mathbf E = (4\sin\omega t)(-240\pi\sin\omega t)$$
$$\mathbf J_s\cdot\mathbf E = -960\pi\sin^2\omega t$$
$\sin^2$ averages to $\tfrac12$ over a period:
$$\boxed{\langle\mathbf J_s\cdot\mathbf E\rangle = -480\pi\ \text{W/m}^2}$$
about $-1508$ W/m². In Poynting's theorem ([Topic 3](#/l/w1-poynting)) $\mathbf J\cdot\mathbf E$ is the power the field gives to the charges. Negative means the opposite: whatever drives the current pushes it against $\mathbf E$ and hands $480\pi$ W/m² to the field. The sheet is a source.

**(d) The power in one wave.** For $z > 0$, $H_x = -E_y/\eta_0$, so
$$\mathbf S = E_y\hat y\times H_x\hat x = -E_yH_x\,\hat z = \frac{E_y^2}{\eta_0}\hat z$$
Average: $\langle E_y^2\rangle = \tfrac12(240\pi)^2$. Divide by $\eta_0 = 120\pi$:
$$\boxed{\langle S_z\rangle = \frac{(240\pi)^2}{2\cdot120\pi} = 240\pi\ \text{W/m}^2}$$
about 754 W/m².

**Check: energy is conserved.** The same $240\pi$ goes into $z < 0$. Total radiated: $480\pi$ W/m², exactly what the sheet supplies in (c) ✓.

**Speed path.** $\langle S\rangle$ per side $= E_0^2/2\eta_0$; the sheet supplies twice that, with a minus sign in $\mathbf J\cdot\mathbf E$.

**Where points go.** The sign of (c); the $\tfrac12$ from $\langle\sin^2\rangle$; giving the total for both sides in (d).` }),
    P({ src: 'Summer 2020 #2(e), (f) · 4 pts', title: 'Arrival time and wavelength',
      q: md`(e) At what instant does the radiated field first arrive at $z = 600$ m? Answer in µs. (f) What is the wavelength $\lambda$ of the co-sinusoid in $E_y(z,t)$, in m?`,
      parts: [
        NT('t', 2, 'µs', [[0.5, 'Time is distance over speed: 600/300, not 300/600.']]),
        NT('\\lambda', 300, 'm', [[2 * PI / 300, 'That is β. λ = 2π/β.']]),
      ],
      hints: [md`$c = 300$ m/µs.`],
      sol: md`**(e)** The front leaves the sheet at $t = 0$ and moves at $c = 3\times10^8$ m/s $= 300$ m/µs:
$$t = \frac zc = \frac{600\ \text{m}}{300\ \text{m}/\mu\text{s}} = 2\ \mu\text{s}$$
**(f)** From $\beta = 2\pi/\lambda$:
$$\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{2\pi/300} = 300\ \text{m}$$
**Check.** $\lambda = c/f = (3\times10^8)/10^6 = 300$ m ✓. So 600 m is two wavelengths, and the front gets there after two periods (one period is 1 µs).

**Speed path.** $c = 300$ m/µs and $f = 1$ MHz: $\lambda = 300$ m.

**Where points go.** Mixing µs and s in $t = z/c$.` }),
    P({ src: 'Summer 2020 #2(g), (h) · 6 pts', title: 'A snapshot at 2 µs',
      q: md`(g) Write $E_y(z, t = 2\ \mu\text{s})$ for $z > 0$. (h) Plot $E_y(z, 2\ \mu\text{s})$ versus $z$ for $0 < z < 900$ m. Then read off these values.`,
      parts: [
        NT('E_y(75\\ \\text{m},\\ 2\\ \\mu\\text{s})', E0, 'V/m', [[-E0, 'sin(4π − θ) = −sin θ: the minus signs cancel, so the first hump is positive.']]),
        NT('z where the field ends at 2 µs', 600, 'm', [[900, 'In 2 µs the front travels c·t = 600 m.']]),
        CH('At the front, $E_y$…', ['rises from 0 with no jump', md`jumps from 0 to $-240\pi$`, md`jumps from 0 to $+240\pi$`, 'jumps to half its peak'], 0,
          [null, md`The front carries the source at $t = 0$, and $\sin 0 = 0$: no jump.`, md`A jump would need the source to start at a nonzero value.`, md`The front is the moment the source switched on, when $\sin\omega t = 0$.`]),
      ],
      hints: [md`$\omega\cdot2\ \mu\text{s} = 4\pi$, and $u(2\ \mu\text{s} - z/c)$ is 1 for $z < 600$ m.`, md`$\sin(4\pi - \theta) = -\sin\theta$.`],
      sol: md`**(g) Put $t = 2$ µs into part (b).** Two pieces:
$$\omega t = 2\pi\times10^6\cdot2\times10^{-6} = 4\pi$$
and $u(t - z/c) = 1$ for $z < ct = 600$ m, 0 beyond. So
$$E_y = -240\pi\,u\!\left(2 - \tfrac{z}{300}\right)\sin\!\left(4\pi - \tfrac{2\pi z}{300}\right)$$
in V/m, with $z$ in m (this is the key's form). **Simplify:** $\sin(4\pi - \theta) = \sin(-\theta) = -\sin\theta$, and the two minus signs cancel:
$$\boxed{E_y = 240\pi\sin\tfrac{2\pi z}{300},\ \ 0 < z < 600\ \text{m}}$$
and $E_y = 0$ for $z > 600$ m.

**(h) The plot.** Two full wavelengths between 0 and 600 m: positive hump peaking at 75 m, zero at 150 m, negative hump at 225 m, and again from 300 to 600 m. Then nothing: the front is at 600 m.

[[fig:z]]

**Why it rises from zero at the front.** The front carries what the sheet made at $t = 0^+$, and $\sin 0 = 0$. The field near the sheet ($z \to 0$) is what the sheet makes now, at $\omega t = 4\pi$: also zero.

**Speed path.** $\lambda = 300$ m, front at 600 m: draw two cycles of $\pm240\pi$ ending at the front. Get the sign from one point: at $z = 75$ m, $-240\pi\sin(4\pi - \tfrac\pi2) = +240\pi$.

**Where points go.** The overall sign (the first hump is positive); drawing the wave past 600 m; three cycles instead of two.`,
      figs: { z: { svg: eyZ(), cap: 'E_y(z) at t = 2 µs: two wavelengths of 240π sin(2πz/300), then zero beyond the front at 600 m.' } } }),
    P({ src: 'Summer 2020 #2(i) · 3 pts', title: 'The field at 600 m versus time',
      q: md`(i) Plot $E_y(z = 600\ \text{m}, t)$ versus $t$ for $0 < t < 4$ µs. Then read off these values.`,
      parts: [
        NT('E_y(600\\ \\text{m},\\ 2.25\\ \\mu\\text{s})', -E0, 'V/m', [[E0, 'At z = 600 m the sine is sin(ωt − 4π) = sin(ωt); with the −240π in front the first half-cycle is negative.']]),
        CH('For $0 < t < 2$ µs the field at 600 m is…', ['zero: the front arrives at 2 µs', md`$-240\pi\sin(2\pi t)$`, md`$+240\pi$`, 'half its peak value'], 0,
          [null, md`That ignores $u(t - z/c)$: nothing has reached 600 m before 2 µs.`, md`Nothing has arrived yet.`, md`Nothing has arrived yet.`]),
      ],
      hints: [md`Put $z = 600$ m into part (b): $\beta z = 4\pi$ and $z/c = 2$ µs.`],
      sol: md`**Put $z = 600$ m into part (b).** $\beta z = \tfrac{2\pi}{300}\cdot600 = 4\pi$ and $z/c = 2$ µs. With $t$ in µs, $\omega t = 2\pi t$:
$$E_y(600\ \text{m}, t) = -240\pi\,u(t - 2)\sin(2\pi t - 4\pi)$$
$\sin(\theta - 4\pi) = \sin\theta$:
$$\boxed{E_y = -240\pi\,u(t - 2)\sin(2\pi t)}$$
in V/m, $t$ in µs.

**The plot.** Zero until 2 µs. Then two periods (1 µs each) of $-240\pi\sin(2\pi t)$: down to $-240\pi$ at 2.25 µs, back through zero at 2.5 µs, up to $+240\pi$ at 2.75 µs, and so on to 4 µs.

[[fig:t]]

**Check against the source.** At 600 m you see what the sheet did 2 µs earlier: $E_y(600, t) = E_y(0, t - 2)$, and at the sheet $E_y = -240\pi\sin(2\pi t)$ starting at $t = 0$ ✓. Notice that the plot in time starts with a **negative** half-cycle while the snapshot in $z$ (part h) starts with a positive one near the sheet: a snapshot reads the history backwards.

**Speed path.** Delay the source field by 2 µs. One period per µs.

**Where points go.** Starting the wave at $t = 0$; the sign of the first half-cycle.`,
      figs: { t: { svg: eyT(), cap: 'E_y at z = 600 m: zero until the front arrives at 2 µs, then −240π sin(2πt).' } } }),

    R(md`
      ### Problem 3 (25 points): radio waves in dry earth

      Dry earth has $\mu = \mu_0$, $\epsilon = \epsilon_0$ and $\sigma = 10^{-3}$ S/m. Use $\mu_0 = 4\pi\times10^{-7}$ H/m and $\epsilon_0 \approx \frac{10^{-9}}{36\pi}$ F/m where needed.
    `),
    P({ src: 'Summer 2020 #3(a) · 7 pts', title: 'Can β be much smaller than α?',
      q: md`For the TEM wave, the wavenumber $\beta$ is much smaller than the damping constant $\alpha$ when the frequency $f \gg 100$ MHz. POSSIBLE or NOT POSSIBLE? Explain.`,
      parts: [
        CH('', ['NOT POSSIBLE', 'POSSIBLE'], 0, [null, md`At 100 MHz $\sigma/\omega\epsilon = 0.18$, and it only falls as $f$ grows: an imperfect dielectric, where $\beta \gg \alpha$. In fact $\beta > \alpha$ in every material at every frequency.`]),
        NT('\\sigma/\\omega\\epsilon\\ \\text{at}\\ 100\\ \\text{MHz}', 0.18, '', [[1.13, 'That uses f instead of ω: divide by 2π.'], [5.56, 'Upside down: σ/ωε, not ωε/σ.']]),
      ],
      hints: [md`Compute $\sigma/\omega\epsilon$ at 100 MHz. What kind of medium is it above that?`, md`From $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$: $\beta^2 - \alpha^2 = \omega^2\mu\epsilon$.`],
      sol: md`**The loss tangent at 100 MHz.** $\omega\epsilon_0 = 2\pi\times10^8\cdot\frac{10^{-9}}{36\pi} = \frac{2}{360} = \frac{1}{180}$ S/m. So
$$\frac{\sigma}{\omega\epsilon} = \frac{10^{-3}}{1/180} = 0.18$$
Above 100 MHz it is smaller still (it goes as $1/f$): an **imperfect dielectric** ([Topic 7](#/l/w2-limits)). There
$$\alpha \approx \frac\sigma2\sqrt{\frac\mu\epsilon} = \frac{10^{-3}}{2}\cdot120\pi = 0.06\pi \approx 0.19\ \text{Np/m}$$
while $\beta \approx \omega/c$ is already 2.1 rad/m at 100 MHz and grows with $f$. So $\beta \gg \alpha$, the opposite of the claim.
$$\boxed{\text{NOT POSSIBLE}}$$
**A stronger reason** ([Topic 5](#/l/w2-gamma)). Square $\gamma = \alpha + j\beta$ and compare real parts with $\gamma^2 = -\omega^2\mu\epsilon + j\omega\mu\sigma$:
$$\beta^2 - \alpha^2 = \omega^2\mu\epsilon > 0$$
So $\beta > \alpha$ in every material at every frequency. $\beta \ll \alpha$ never happens; the best a material can do is $\beta \approx \alpha$ (a good conductor).

**Speed path.** $\beta^2 - \alpha^2 = \omega^2\mu\epsilon > 0$: never possible. One line.

**Where points go.** Using $f$ for $\omega$ in the loss tangent; saying "possible" because high frequency sounds lossy.` }),
    P({ src: 'Summer 2020 #3(b) · 7 pts', title: 'A good conductor with λ ≈ 2πδ?',
      q: md`The frequency $f$ is such that $\sigma \gg \omega\epsilon$, while $\lambda \approx 2\pi\delta$. POSSIBLE or NOT POSSIBLE? Explain.`,
      parts: [
        CH('', ['POSSIBLE', 'NOT POSSIBLE'], 0, [null, md`$\sigma \gg \omega\epsilon$ is a good conductor, where $\alpha \approx \beta$. Then $\lambda = 2\pi/\beta \approx 2\pi/\alpha = 2\pi\delta$: exactly the claim.`]),
        NT('f\\ \\text{where}\\ \\sigma/\\omega\\epsilon = 1', 18, 'MHz', [[113, 'That forgets the 2π in ω = 2πf.']]),
      ],
      hints: [md`In a good conductor $\alpha \approx \beta$. And $\delta = 1/\alpha$, $\lambda = 2\pi/\beta$.`],
      sol: md`**$\sigma \gg \omega\epsilon$ is a good conductor.** There $\gamma \approx \sqrt{j\omega\mu\sigma}$, at $45°$, so ([Topic 7](#/l/w2-limits))
$$\alpha \approx \beta \approx \sqrt{\pi f\mu\sigma}$$
**The two lengths.** The skin depth is $\delta = 1/\alpha$ and the wavelength is $\lambda = 2\pi/\beta$. With $\beta \approx \alpha$:
$$\lambda = \frac{2\pi}{\beta} \approx \frac{2\pi}{\alpha} = 2\pi\delta$$
$$\boxed{\text{POSSIBLE}}$$
**When, for dry earth?** $\sigma/\omega\epsilon_0 = 1$ at $\omega = \sigma/\epsilon_0 = 10^{-3}\cdot36\pi\times10^9 = 36\pi\times10^6$ rad/s, so $f = \omega/2\pi = 18$ MHz. Well below 18 MHz (say below 1 MHz) dry earth is a good conductor and $\lambda \approx 2\pi\delta$.

**Speed path.** Good conductor: $\alpha = \beta$, so $\lambda = 2\pi/\beta = 2\pi\delta$. Always true there.

**Where points go.** Confusing $\delta = 1/\alpha$ with $\alpha$ itself.` }),
    P({ src: 'Summer 2020 #3(c), (d) · 11 pts', title: 'At 100 Hz: wavelength and skin depth',
      q: md`(c) If $f = 100$ Hz, what is the wavelength $\lambda$? (d) If $f = 100$ Hz, what is the penetration depth $\delta$?`,
      parts: [
        NT('\\sigma/\\omega\\epsilon\\ \\text{at}\\ 100\\ \\text{Hz}', 1.8e5, '', [[1.13e6, 'That uses f instead of ω.']]),
        NT('\\lambda', 1e4, 'm', [[3e6, 'That is c/f, the free-space wavelength. In a good conductor λ = 2π/√(πfμσ).'], [1e4 / (2 * PI), 'That is δ. λ = 2πδ.']]),
        NT('\\delta', 1e4 / (2 * PI), 'm', [[1e4, 'That is λ. δ = λ/2π.'], [2 * PI * 1e-4, 'That is α itself, in Np/m. δ = 1/α.']]),
      ],
      hints: [md`Check the loss tangent first: $\sigma/\omega\epsilon_0$ at 100 Hz.`, md`$\sqrt{\pi f\mu_0\sigma} = \sqrt{\pi\cdot100\cdot4\pi\times10^{-7}\cdot10^{-3}} = \sqrt{4\pi^2\times10^{-8}}$.`],
      sol: md`**Which regime?** At 100 Hz, $\omega\epsilon_0 = 2\pi\times10^2\cdot\frac{10^{-9}}{36\pi} = \frac{10^{-7}}{18}$ S/m, so
$$\frac{\sigma}{\omega\epsilon_0} = 10^{-3}\cdot18\times10^7 = 1.8\times10^5 \gg 1$$
A very good conductor.

**α and β.** In a good conductor $\alpha = \beta = \sqrt{\pi f\mu\sigma}$. Multiply inside the root: $\pi\cdot100\cdot4\pi\times10^{-7}\cdot10^{-3} = 4\pi^2\times10^{-8}$:
$$\alpha = \beta = \sqrt{4\pi^2\times10^{-8}} = 2\pi\times10^{-4}\ \text{m}^{-1}$$
**(c) Wavelength.**
$$\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{2\pi\times10^{-4}} = 10^4\ \text{m}$$
$$\boxed{\lambda = 10\ \text{km}}$$
**(d) Penetration depth.**
$$\boxed{\delta = \frac1\alpha = \frac{10^4}{2\pi}\ \text{m} \approx 1.59\ \text{km}}$$
**Check.** $\lambda = 2\pi\delta$ ✓ (part b). And the free-space wavelength at 100 Hz is $c/f = 3000$ km: inside the ground the wave is 300 times shorter.
!!intuition Does this make sense?
  A field at 100 Hz reaches about a kilometer and a half into dry ground before falling to $1/e$. That is why very low frequencies are used to signal through earth and sea water: at higher $f$, $\delta \propto 1/\sqrt f$ shrinks.

**Speed path.** Good conductor; $\sqrt{\pi f\mu_0\sigma}$ comes out as $2\pi\times10^{-4}$; $\lambda = 2\pi/\beta$, $\delta = 1/\alpha$.

**Where points go.** Using $c/f$ for the wavelength in a conductor; giving $\alpha$ as the depth.` }),

    R(md`
      ### After you finish: where each problem lives

      | Problem | Points | Skill | Lesson |
      |---|---|---|---|
      | 1(a), (b) | 12 | $\mathbf E$ from $\mathbf H$, $\mathbf B$ from Faraday | [Topic 2](#/l/w1-maxwell) |
      | 1(c) | 13 | reading $\eta$, $v$, $\epsilon_r$, $\mu_r$; scaling a delta | [Topic 6](#/l/w2-read) |
      | 2(a), (b), (e)–(i) | 19 | a sheet's field, snapshots, time plots | [Topic 10](#/l/w3-antenna) |
      | 2(c), (d) | 6 | $\mathbf J\cdot\mathbf E$ and Poynting power | [Topic 3](#/l/w1-poynting), [Topic 4](#/l/w1-avg) |
      | 3 | 25 | loss tangent, good conductor, skin depth | [Topic 7](#/l/w2-limits) |
    `),
  ];

  EM.lesson('e3-past', { id: 'e3-past-sp17', order: 5, title: 'Spring 2017 Exam 3', kind: 'exam', sub: '75 min · 100 pts · no key posted: solved here', steps: sp17 });
  EM.lesson('e3-past', { id: 'e3-past-su20', order: 6, title: 'Summer 2020 Exam 3 (Prof. Kudeki)', kind: 'exam', sub: '3 problems · 75 pts · handwritten key, re-derived', steps: su20 });
})();

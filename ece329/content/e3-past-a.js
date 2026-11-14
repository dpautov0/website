/* Past Exam 3s, part A: the two typed papers with keys.
   e3-past-sp24   Spring 2024 Exam 3 (Chen, Shao, Waldrop): the model for this term's exam
   e3-past-fa23   Fall 2023 Exam 3 (Goddard, Ilie, Zhao)
   Every problem is retyped clean (no handwriting, no footers, no student names), every figure is redrawn, every
   "circle all that apply" list becomes one True/False question per statement, and every answer was re-derived and
   checked numerically (work-pastA2/verify.py, and tlcheck.js against TL.valueAt). Where a posted key slips, the
   solution says so. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;
  const mc = (lbl, opts, a, why) => ({ lbl, mc: opts, a, why });
  const NT = (lbl, ans, unit, traps, rel) => Object.assign(N(lbl, ans, unit, rel), traps ? { traps } : {});
  // a "circle all that apply" statement: one True/False part
  // (the explanation is shown when the reader picks the wrong one; pass it in either slot, the other null)
  const TF = (lbl, truth, w1, w2) => ({ lbl, mc: ['True', 'False'], a: truth ? 0 : 1, why: truth ? [null, w1 || w2] : [w1 || w2, null] });
  // "would it stay the same?" for one quantity
  const SAME = (lbl, same, w1, w2) => ({ lbl, mc: ['Stays the same', 'Changes'], a: same ? 0 : 1, why: same ? [null, w1 || w2] : [w1 || w2, null] });

  // ---------------------------------------------------------------- drawing helpers
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 28) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // a generator (source in series with R_g) whose output terminals are at x = xa, wires at y0 (top) and y1 (bottom)
  function generator(g, xa, y0, y1, srcLab, rLab) {
    const xs = xa - 92, ym = (y0 + y1) / 2;
    g.circle(xs, ym, 13);
    g.label(xs, ym - 6, '+', 'c', 'small'); g.label(xs, ym + 7, '-', 'c', 'small');
    g.line(xs, ym - 13, xs, y0); g.line(xs, ym + 13, xs, y1);
    g.line(xs, y0, xs + 22, y0); zig(g, xs + 22, y0, xs + 62, y0); g.line(xs + 62, y0, xa, y0);
    g.line(xs, y1, xa, y1);
    g.label(xs - 18, ym, srcLab, 'r', 'small');
    g.label(xs + 42, y0 - 11, rLab, 'b', 'small');
    g.dot(xa, y0); g.dot(xa, y1);
  }
  // one line section drawn as two thick rails, with up to two labels stacked in the middle
  function rails(g, x0, x1, y0, y1, lab1, lab2) {
    g.line(x0, y0, x1, y0, { cls: 'thick' }); g.line(x0, y1, x1, y1, { cls: 'thick' });
    const ym = (y0 + y1) / 2;
    if (lab1) g.label((x0 + x1) / 2, lab2 ? ym - 10 : ym, lab1, 'c', 'small');
    if (lab2) g.label((x0 + x1) / 2, ym + 11, lab2, 'c', 'small');
    g.dot(x1, y0); g.dot(x1, y1);
  }
  // the load at x = xb: a resistor, or a short when lab is null
  function load(g, xb, y0, y1, lab) {
    if (lab === null) { g.line(xb, y0, xb + 20, y0); g.line(xb + 20, y0, xb + 20, y1, { cls: 'thick' }); g.line(xb + 20, y1, xb, y1); return; }
    g.line(xb, y0, xb + 24, y0); zig(g, xb + 24, y0, xb + 24, y1); g.line(xb + 24, y1, xb, y1);
    g.label(xb + 34, (y0 + y1) / 2, lab, 'l', 'small');
  }
  // a position axis under a drawing: ticks [[x, 'tex'], ...]
  function zAxis(g, x0, x1, y, ticks, lab = 'z\\,(\\text{m})') {
    g.arrow(x0, y, x1, y, { cls: 'dim', hs: 6 });
    g.label(x1 + 4, y, lab, 'l', 'small');
    ticks.forEach(([x, t]) => { g.line(x, y - 4, x, y + 4, { cls: 'dim' }); g.label(x, y + 7, t, 't', 'small'); });
  }

  // ================================================================ SPRING 2024
  function sheetsFig() {
    const g = PF.fig({ alt: 'two horizontal current sheets in free space, at z = 0 and z = 0.5 m; each carries J_s = -2 x-hat, drawn as an arrow pointing left (along -x); z points up, x to the right; the regions z > 0.5 m, 0 < z < 0.5 m and z < 0 are labeled' });
    const xa = 70, x1 = 330, yA = 168, yB = 92;
    g.arrow(xa, 214, xa, 30, { cls: 'dim', hs: 7 }); g.label(xa + 8, 40, 'z\\,(\\text{m})', 'l', 'small');
    g.line(xa, yA, x1, yA, { cls: 'thick' }); g.line(xa, yB, x1, yB, { cls: 'thick' });
    g.label(xa - 7, yA, '0', 'r', 'small'); g.label(xa - 7, yB, '0.5', 'r', 'small');
    for (const y of [yA, yB]) {
      g.arrow(300, y - 11, 236, y - 11, { hs: 8 });
      g.label(230, y - 11, '\\tilde{\\mathbf J}_s = -2\\hat x\\ \\text{A/m}', 'r', 'small');
    }
    g.label(150, 52, 'z > 0.5\\ \\text{m}', 'c', 'small');
    g.label(150, 136, '0 < z < 0.5\\ \\text{m}', 'c', 'small');
    g.label(150, 200, 'z < 0', 'c', 'small');
    g.arrow(262, 206, 314, 206, { cls: 'dim', hs: 6 }); g.label(318, 206, 'x', 'l', 'small');
    g.text(288, 46, 'free space', 'c', 'small');
    return g.svg();
  }
  // the standing wave between the sheets, for the solution: |E| peaks mid-gap, |H| at the sheets
  const cavityFig = () => PF.plot({
    w: 360, h: 210, x: [-0.25, 0.75], y: [-1.3, 1.3], zero: true, xl: 'z\\,(\\text{m})', yl: '\\text{amplitude}',
    xt: [[0, '0'], [0.25, '\\tfrac14'], [0.5, '\\tfrac12']], yt: [[1, '1'], [-1, '-1']],
    vlines: [[0, ''], [0.5, '']],
    curves: [
      { f: (z) => (z >= 0 && z <= 0.5 ? Math.sin(2 * PI * z) : 0), n: 400, lab: 'E_x/(-j240\\pi)', labAt: 0.62, dx: -30, dy: -50 },
      { f: (z) => (z > 0 && z < 0.5 ? Math.cos(2 * PI * z) : NaN), n: 400, cls: 'dash', lab: 'H_y/2', labAt: 0.05, dx: 2, dy: -14 },
    ],
  });

  function conductorFig() {
    const g = PF.fig({ alt: 'a current sheet on the plane x = 0 inside a good conductor; the wave of interest travels toward +x; E at x = 0 points along +z' });
    g.rect(30, 30, 300, 130, { cls: 'shade' });
    g.line(150, 22, 150, 168, { cls: 'thick dash' }); g.label(150, 14, 'x = 0', 'b', 'small');
    g.arrow(176, 62, 296, 62, { cls: 'thick', hs: 8 }); g.label(236, 55, '\\text{wave toward } {+x}', 'b', 'small');
    g.arrow(170, 142, 170, 96, { hs: 7 }); g.label(178, 104, '\\mathbf E(0,0) = 10\\hat z\\ \\text{V/m}', 'l', 'small');
    g.arrow(48, 146, 88, 146, { cls: 'dim', hs: 6 }); g.label(92, 146, 'x', 'l', 'small');
    g.arrow(48, 146, 48, 106, { cls: 'dim', hs: 6 }); g.label(48, 100, 'z', 'b', 'small');
    g.label(180, 176, '\\text{good conductor},\\ \\delta = 1\\ \\text{mm}', 't', 'small');
    return g.svg();
  }

  function coaxFig(sol) {
    const g = PF.fig({ alt: sol ? 'coax cross-section with the inner current I out of the page, a dashed Ampere circle of radius r between the conductors, and H circling the axis' : 'cross-section of a coaxial cable: a solid inner conductor of radius a, an outer conductor of inner radius b, and between them a dielectric with epsilon, mu and sigma = 0' });
    const cx = 110, cy = 104, a = 24, b = 72;
    g.circle(cx, cy, b + 8, { cls: 'shade' }); g.circle(cx, cy, b, { cls: 'bgfill' }); g.circle(cx, cy, a, { cls: 'shade' });
    g.circle(cx, cy, b + 8); g.circle(cx, cy, b); g.circle(cx, cy, a);
    if (!sol) {
      g.arrow(cx, cy, cx - a * 0.72, cy + a * 0.7, { hs: 6 }); g.label(cx - a * 0.72 - 4, cy + a * 0.7 + 2, 'a', 'tr', 'small');
      g.arrow(cx, cy, cx + b * 0.71, cy - b * 0.71, { hs: 7 }); g.label(cx + b * 0.4, cy - b * 0.4 - 4, 'b', 'br', 'small');
      g.label(cx, cy + 46, '\\epsilon,\\ \\mu,\\ \\sigma = 0', 'c', 'small');
    } else {
      g.odot(cx, cy, 8); g.label(cx + 12, cy + 10, 'I', 'tl', 'small');
      g.circle(cx, cy, 48, { cls: 'dash' });
      g.arc(cx, cy, 48, 20, 70, { cls: 'thick', arrow: 'end', hs: 7 }); g.label(cx + 40, cy - 44, 'H_\\phi', 'bl', 'small');
      g.line(cx, cy, cx - 48 * 0.8, cy + 48 * 0.6, { cls: 'dim' }); g.label(cx - 26, cy + 22, 'r', 'tr', 'small');
      g.text(cx, cy + b + 22, 'the outer conductor carries the return current', 'c', 'small');
    }
    return g.svg();
  }

  function twoLineFig() {
    const g = PF.fig({ alt: 'a generator v_g(t) with R_g = 50 ohm drives line 1 (Z01, v = c/2) from z = 0 to 150 m, then line 2 (Z02, v = c/2) from 150 m to 300 m, which ends in R_L = 50 ohm' });
    const y0 = 30, y1 = 92, xa = 120, xj = 216, xb = 312;
    generator(g, xa, y0, y1, 'v_g(t)', 'R_g = 50\\,\\Omega');
    rails(g, xa, xj, y0, y1, 'Z_{01}', 'v = c/2');
    rails(g, xj, xb, y0, y1, 'Z_{02}', 'v = c/2');
    load(g, xb, y0, y1, 'R_L = 50\\,\\Omega');
    zAxis(g, xa, xb + 40, 122, [[xa, '0'], [xj, '150'], [xb, '300']]);
    return g.svg();
  }

  const s4 = TL.solve({ Vg: 80, Rg: 50, RL: 50, sections: [{ Z0: 150, len: 150, v: 150 }, { Z0: 50, len: 150, v: 150 }], tMax: 4 });

  const sp24 = [
    R(md`
      **Spring 2024 · ECE 329 · Exam 3** (Chen, Shao, Waldrop). Monday, April 22, 2024, 7:00–8:15 PM (75 minutes). Four problems, 100 points: 18, 30, 18 and 34. Closed book and closed notes, no calculators, one 4″×6″ index card of handwritten notes. Show all work and reasoning, with units on every answer.

      **Why this paper matters most.** Prof. Chen writes your Exam 3, and this is his. Expect the same shape: four problems cut into short parts; numbers chosen so you never need a calculator ($f = 300$ MHz makes $\lambda = 1$ m in free space; $\delta = 1$ mm; $v = c/2$; 50 and 150 $\Omega$); and "circle **all** correct answers" lists in which every statement has to be judged on its own.

      **What it tests.**
      - Problem 1 (18 pts): two current sheets half a wavelength apart, in phasors ([Topic 10](#/l/w3-antenna), [Topic 1](#/l/w1-phasor)).
      - Problem 2 (30 pts): a wave in a good conductor: $\gamma$ from $\delta$, the decay, Poynting's theorem, circular polarization, and what changes with frequency ([Topic 7](#/l/w2-limits), [Topic 3](#/l/w1-poynting), [Topic 8](#/l/w2-loss), [Topic 9](#/l/w3-pol)).
      - Problem 3 (18 pts): $\mathcal L$, $Z_0$ and $v_p$ of a coax from its $\mathcal C$ ([Topic 13](#/l/w5-telegraph)).
      - Problem 4 (34 pts): a bounce diagram on two lines in series, $V(z, t)$ at one point, the DC steady state ([Topic 14](#/l/w5-launch), [Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi)).

      **About the posted key.** It is handwritten and mostly right, but it has real slips, and each solution below names them: Problem 1 writes $-240j$ where the right coefficient is $-j240\pi$; Problem 2(c) half-circles statement (ii), which has the wrong sign; its comment on (v) forgets a factor $\cos\tau$; the options of 2(d) all drop a phase factor $e^{-j45°}$; and 2(e) marks (vii) as changing. Also, the parts of Problem 4 add to 33 points (12 + 14 + 7), not the 34 in its header.

      **How to use it.** Set a 75-minute timer and work on paper, closed book. Then enter your answers here. Each "circle all correct answers" list appears as one True/False question per statement: on paper you would circle exactly the true ones. Symbolic boxes take expressions such as <code>2*pi*eps/ln(b/a)</code> (the given $\mathcal C$); the variables you may use are listed under each box. Then read every solution, including the ones you got right: each ends with a **speed path** (how to do it in 30 seconds) and **where points go**.
    `),

    // ---------------------------------------------------------------- Problem 1
    R(md`
      ### Problem 1 (18 points): two current sheets

      Two infinite sheets of current lie on $z = 0$ and on $z = 0.5$ m. They carry the same surface current density
      $$\tilde{\mathbf J}_s = -2\hat x\ \ \text{A/m}$$
      All of space is free space ($\epsilon_0$, $\mu_0$, $\eta_0$), and $f = 300$ MHz. Simplify your answers with these identities (2 of the 18 points are for simplifying):
      - $e^{j\pi} = -1$
      - $\tfrac12\left(e^{j\theta} + e^{-j\theta}\right) = \cos\theta$
      - $\tfrac{1}{2j}\left(e^{j\theta} - e^{-j\theta}\right) = \sin\theta$
    `),
    P({ src: 'Spring 2024 #1(a) · 9 pts', title: 'E in the three regions',
      q: md`[[fig:sh]]

Write the electric field phasor $\Et$ everywhere, simplified, with direction and units: (i) for $z < 0$, (ii) for $0 < z < 0.5$ m, (iii) for $z > 0.5$ m. Then give the size of the field in the middle of the gap.`,
      parts: [
        mc(md`(i) $\Et(z < 0)$`, [md`$0$`, md`$120\pi\,e^{j2\pi z}\,\hat x$ V/m`, md`$240\pi\,e^{j2\pi z}\,\hat x$ V/m`, md`$-j240\pi\sin(2\pi z)\,\hat x$ V/m`], 0,
          [null, md`That is the wave of the $z = 0$ sheet alone. The other sheet's wave arrives on top of it, half a wavelength later, which is a factor $e^{-j\pi} = -1$: they cancel.`, md`That adds the two downward waves in phase. The upper sheet's wave travels an extra 0.5 m $= \lambda/2$ to get here, so it carries $e^{-j\pi} = -1$.`, md`That is the standing wave between the sheets. Below both sheets the two waves travel the same way and cancel.`]),
        mc(md`(ii) $\Et(0 < z < 0.5\ \text{m})$`, [md`$-j240\pi\sin(2\pi z)\,\hat x$ V/m`, md`$-j240\sin(2\pi z)\,\hat x$ V/m`, md`$240\pi\cos(2\pi z)\,\hat x$ V/m`, md`$-j120\pi\sin(2\pi z)\,\hat x$ V/m`, md`$+j240\pi\sin(2\pi z)\,\hat x$ V/m`], 0,
          [null, md`That is the posted key's answer, and it drops a $\pi$: each sheet launches $\eta_0|J_s|/2 = 120\pi$ V/m, so the pair gives $2\times120\pi = 240\pi \approx 754$ V/m, not 240.`, md`That adds $e^{-j\beta z}$ and $e^{+j\beta z}$ with the same sign. The upper sheet's wave carries $e^{-j\pi} = -1$, so it is $e^{-j\beta z} - e^{j\beta z} = -2j\sin\beta z$. A cosine would also make $\mathbf E$ nonzero at the sheets, where it must match the zero field outside.`, md`That is one sheet's amplitude, $\eta_0|J_s|/2 = 120\pi$. Between the sheets the two waves add to twice that.`, md`That is the field of sheets carrying $+2\hat x$. A sheet's field points against its current, $\Et = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_s$, so each wave starts as $+120\pi\,\hat x$.`]),
        mc(md`(iii) $\Et(z > 0.5\ \text{m})$`, [md`$0$`, md`$120\pi\,e^{-j2\pi z}\,\hat x$ V/m`, md`$240\pi\,e^{-j2\pi z}\,\hat x$ V/m`, md`$-j240\pi\sin(2\pi z)\,\hat x$ V/m`], 0,
          [null, md`That is the upper sheet's wave alone. The lower sheet's wave reaches here after an extra 0.5 m $= \lambda/2$: a factor $-1$, so they cancel.`, md`That adds the two upward waves in phase, ignoring the half-wavelength head start of one of them.`, md`That is the field between the sheets. Above both, the waves travel together and cancel.`]),
        NT(md`$|\Et|$ at $z = 0.25$ m`, 240 * PI, 'V/m', [{ v: 240, msg: 'That is the posted key\'s value. The amplitude is 2η₀ = 240π ≈ 754 V/m: the key dropped the π of η₀ = 120π.' }, { v: 120 * PI, msg: 'That is one sheet alone. Both waves reach the middle of the gap, and there they add.' }]),
      ],
      hints: [md`$\beta = \omega/c = 2\pi$ rad/m, so $\lambda = 1$ m: the sheets are $\lambda/2$ apart.`, md`One sheet at $z_0$ makes $\Et = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z - z_0|}$ on both sides. Add the two sheets' fields in each region, and watch the absolute value.`],
      sol: md`
        **Step 1: the numbers.** In free space a wave of frequency $f$ has $\beta = \omega/c = 2\pi f/c$:
        $$\beta = \frac{2\pi(3\times10^8)}{3\times10^8} = 2\pi\ \text{rad/m}$$
        So $\lambda = 2\pi/\beta = 1$ m. The sheets are 0.5 m apart: **half a wavelength**. That one fact decides the whole problem. A wave that travels 0.5 m picks up the phase
        $$e^{-j\beta(0.5)} = e^{-j\pi} = -1$$

        **Step 2: the field of one sheet, from the boundary conditions.** A sheet in the plane $z = z_0$ sends one plane wave up ($+\hat z$) and one down ($-\hat z$). Two facts fix them.

        1. Tangential $\mathbf E$ is continuous through the sheet, so both waves leave the sheet with the same phasor $\Et_s$.
        2. In a plane wave, $\Ht = \frac{1}{\eta_0}\hat v\times\Et$, where $\hat v$ is the direction of travel.

        Just above the sheet $\hat v = +\hat z$; just below, $\hat v = -\hat z$. So the two magnetic fields are
        $$\Ht_\pm = \pm\frac{1}{\eta_0}\,\hat z\times\Et_s$$
        The current is the jump in tangential $\Ht$ (the boundary condition on your sheet):
        $$\hat z\times(\Ht_+ - \Ht_-) = \tilde{\mathbf J}_s$$
        The difference of the two fields is $\frac{2}{\eta_0}\hat z\times\Et_s$, so
        $$\frac{2}{\eta_0}\,\hat z\times(\hat z\times\Et_s) = \tilde{\mathbf J}_s$$
        Two quarter turns about $\hat z$ reverse a vector that lies in the sheet: $\hat z\times(\hat z\times\Et_s) = -\Et_s$. Solve:
        $$\boxed{\Et_s = -\frac{\eta_0}{2}\,\tilde{\mathbf J}_s}$$
        Then each wave carries this phasor away, with phase $e^{-j\beta\cdot\text{distance}}$:
        $$\Et = -\frac{\eta_0}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z - z_0|}$$
        **Step 3: put in the current.** With $\tilde{\mathbf J}_s = -2\hat x$:
        $$-\frac{\eta_0}{2}\tilde{\mathbf J}_s = -\frac{120\pi}{2}(-2\hat x) = 120\pi\,\hat x$$
        So each sheet, alone, makes
        $$\Et = 120\pi\,e^{-j2\pi|z - z_0|}\,\hat x\ \text{V/m}$$
        Call the sheet at $z = 0$ "A" and the one at $z = 0.5$ m "B".

        **Step 4: above both sheets ($z > 0.5$ m).** Both waves travel up. The distances are $|z| = z$ and $|z - 0.5| = z - 0.5$:
        $$\tilde E_x = 120\pi\left[e^{-j\beta z} + e^{-j\beta(z - 0.5)}\right]$$
        Split the second exponential. Its extra piece is $e^{+j\beta(0.5)} = e^{j\pi} = -1$:
        $$e^{-j\beta(z - 0.5)} = e^{-j\beta z}\,e^{j\pi} = -e^{-j\beta z}$$
        The two terms cancel:
        $$\boxed{\Et(z > 0.5\ \text{m}) = 0}$$
        **Step 5: below both sheets ($z < 0$).** Both waves travel down. Now $|z| = -z$ and $|z - 0.5| = 0.5 - z$:
        $$\tilde E_x = 120\pi\left[e^{j\beta z} + e^{-j\beta(0.5 - z)}\right]$$
        The second one is $e^{-j\pi}e^{j\beta z} = -e^{j\beta z}$. Again they cancel:
        $$\boxed{\Et(z < 0) = 0}$$
        **Step 6: between the sheets.** A's wave travels up, so its distance is $z$. B's wave travels down, so its distance is $0.5 - z$:
        $$\tilde E_x = 120\pi\left[e^{-j\beta z} + e^{-j\beta(0.5 - z)}\right]$$
        As in Step 5, $e^{-j\beta(0.5 - z)} = -e^{j\beta z}$:
        $$\tilde E_x = 120\pi\left[e^{-j\beta z} - e^{j\beta z}\right]$$
        The given identity says $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$. Our bracket is the negative of that:
        $$e^{-j\beta z} - e^{j\beta z} = -2j\sin(\beta z)$$
        So, with $\beta = 2\pi$:
        $$\boxed{\Et(0 < z < 0.5) = -j240\pi\sin(2\pi z)\,\hat x\ \text{V/m}}$$
        That is about $-j754\sin(2\pi z)$ V/m. In the middle of the gap, $\sin(\pi/2) = 1$, so $|\Et| = 240\pi \approx 754$ V/m.

        !!mistake The posted key
          The key writes $-240j\sin(2\pi z)\,\hat x$ V/m. The right coefficient is $2\eta_0 = 240\pi$: the key lost the $\pi$ of $\eta_0 = 120\pi$ when it multiplied out. Its own working above the answer box has $-2\eta_0j\sin(\beta z)$, which is right.

        !!intuition Does this make sense?
          - **Outside, nothing.** Each sheet's wave meets the other's half a wavelength late, which is a sign flip. Equal size, opposite sign: they cancel. The pair radiates no power at all.
          - **Inside, a standing wave.** Two equal waves going opposite ways always make a standing wave. $\sin(2\pi z)$ is zero at $z = 0$ and at $z = 0.5$: at the sheets, the field inside matches the zero field outside, as continuity of tangential $\mathbf E$ demands. ✓
          - **The time form.** $\Re\{-j\,e^{j\omega t}\} = \sin\omega t$, so $E_x(z, t) = 240\pi\sin(2\pi z)\sin(\omega t)$ V/m: every point oscillates in step, with a fixed envelope. Nothing travels.

        [[fig:cav]]

        **Speed path.** $f = 300$ MHz means $\lambda = 1$ m, so the sheets are $\lambda/2$ apart: outside the waves cancel, inside they make a standing wave. Inside, $\mathbf E$ must vanish at both sheets, so it is $\propto\sin(2\pi z)$; the size is $2\times\frac{\eta_0}{2}|J_s| = 240\pi$; the factor $-j$ comes from $e^{-j\theta} - e^{j\theta} = -2j\sin\theta$. Thirty seconds.

        **Where points go.** Dropping the $\pi$ (the key's own slip); the sign of $-\tfrac{\eta_0}{2}\tilde{\mathbf J}_s$; writing $e^{-j\beta(z - 0.5)}$ for $z < 0.5$, where the distance is $0.5 - z$; leaving the answer as a sum of exponentials (the paper gives 2 points for simplifying); no direction or no unit.
      `,
      figs: { sh: { svg: sheetsFig(), cap: 'Both sheets carry the same current, along −x.' }, cav: { svg: cavityFig(), cap: 'Between the sheets (dashed lines): E is a sine, zero at both sheets; H is a cosine, largest at the sheets. Outside, both are zero.' } } }),
    P({ src: 'Spring 2024 #1(b) · 9 pts', title: 'H in the three regions',
      q: md`Write the magnetic field phasor $\Ht$ everywhere, simplified, with direction and units: (i) for $z < 0$, (ii) for $0 < z < 0.5$ m, (iii) for $z > 0.5$ m. Then read off two values.`,
      parts: [
        mc(md`(i) $\Ht(z < 0)$`, [md`$0$`, md`$-e^{j2\pi z}\,\hat y$ A/m`, md`$-2e^{j2\pi z}\,\hat y$ A/m`, md`$2\cos(2\pi z)\,\hat y$ A/m`], 0,
          [null, md`That is the lower sheet's wave alone. The upper sheet's wave arrives half a wavelength later, with the opposite sign: they cancel, just as $\mathbf E$ does.`, md`That adds the two downward waves in phase. One of them is half a wavelength behind the other.`, md`That is the field between the sheets.`]),
        mc(md`(ii) $\Ht(0 < z < 0.5\ \text{m})$`, [md`$2\cos(2\pi z)\,\hat y$ A/m`, md`$-2j\sin(2\pi z)\,\hat y$ A/m`, md`$-2\cos(2\pi z)\,\hat y$ A/m`, md`$2\cos(2\pi z)\,\hat x$ A/m`, md`$\tfrac{2}{120\pi}\cos(2\pi z)\,\hat y$ A/m`], 0,
          [null, md`That divides $\Et$ by $\eta_0$ and keeps its shape. But the downward wave has $\Ht = -\frac{1}{\eta_0}\hat z\times\Et$: its sign flips, so the difference of exponentials becomes a sum, a cosine.`, md`The sign is wrong. Check the boundary condition at $z = 0$: $\hat z\times(\Ht_+ - 0) = -2\hat x$ needs $\Ht_+ = +2\hat y$.`, md`$\mathbf H$ of a plane wave is perpendicular to both $\mathbf E$ ($\hat x$) and the travel ($\pm\hat z$): it is along $\hat y$.`, md`That divides by $\eta_0$ twice. Each wave has $|\Ht| = 120\pi/\eta_0 = 1$ A/m, and two of them add to 2.`]),
        mc(md`(iii) $\Ht(z > 0.5\ \text{m})$`, [md`$0$`, md`$e^{-j2\pi z}\,\hat y$ A/m`, md`$2e^{-j2\pi z}\,\hat y$ A/m`, md`$2\cos(2\pi z)\,\hat y$ A/m`], 0,
          [null, md`That is one sheet's wave alone; the two upward waves cancel.`, md`That adds the two upward waves in phase, ignoring the half-wavelength between them.`, md`That is the field between the sheets.`]),
        NT(md`$\tilde H_y$ at $z = 1/8$ m`, Math.SQRT2, 'A/m', [{ v: 2, msg: 'That is the peak, at the sheets. At z = 1/8 m the cosine is cos(π/4) = 1/√2.' }, { v: -Math.SQRT2, msg: 'Wrong sign: at z = 0⁺, H_y = +2 A/m, and cos stays positive up to z = 1/4 m.' }, { v: Math.SQRT2 / (120 * PI), msg: 'That divides by η₀ twice. Each wave alone has |H| = 120π/η₀ = 1 A/m.' }]),
        NT(md`$\tilde H_y$ just below the upper sheet ($z \to 0.5^-$)`, -2, 'A/m', [{ v: 2, msg: 'cos(2π × 0.5) = cos π = −1. The field just below the upper sheet points along −ŷ.' }]),
      ],
      hints: [md`For each wave, $\Ht = \frac{1}{\eta_0}\hat v\times\Et$, with $\hat v$ its direction of travel: $\hat z\times\hat x = \hat y$ and $(-\hat z)\times\hat x = -\hat y$.`, md`Check your answer with $\hat z\times(\Ht_+ - \Ht_-) = \tilde{\mathbf J}_s$ at each sheet.`],
      sol: md`
        **Step 1: H of each wave.** Use $\Ht = \frac{1}{\eta_0}\hat v\times\Et$ on each traveling wave separately, with the fields from part (a). The wave from sheet A travels up between the sheets ($\hat v = +\hat z$, and $\hat z\times\hat x = \hat y$):
        $$\Ht_A = \frac{1}{\eta_0}\,120\pi\,e^{-j\beta z}\,\hat y = e^{-j\beta z}\,\hat y$$
        The wave from sheet B travels down ($\hat v = -\hat z$, and $(-\hat z)\times\hat x = -\hat y$). Between the sheets its $\Et$ is $-120\pi\,e^{j\beta z}\hat x$, from part (a):
        $$\Ht_B = -\frac{1}{\eta_0}\left(-120\pi\,e^{j\beta z}\right)\hat y = e^{j\beta z}\,\hat y$$
        Two minus signs: one from the direction of travel, one from the half-wavelength delay.

        **Step 2: add them between the sheets.**
        $$\tilde H_y = e^{-j\beta z} + e^{j\beta z}$$
        The given identity: $e^{j\theta} + e^{-j\theta} = 2\cos\theta$. So
        $$\boxed{\Ht(0 < z < 0.5) = 2\cos(2\pi z)\,\hat y\ \text{A/m}}$$
        **Step 3: outside.** Above both sheets, both waves travel up, so $\Ht = \frac{1}{\eta_0}\hat z\times\Et_{\text{total}}$, and part (a) found $\Et_{\text{total}} = 0$ there. Below, the same with $-\hat z$:
        $$\boxed{\Ht(z < 0) = 0, \qquad \Ht(z > 0.5) = 0}$$
        **Step 4: the values.** At $z = 1/8$ m: $2\cos(\pi/4) = \sqrt2 \approx 1.41$ A/m. Just below the upper sheet: $2\cos\pi = -2$ A/m.

        **Step 5: check both sheets.** The current must equal the jump, $\hat z\times(\Ht_+ - \Ht_-)$, and $\hat z\times\hat y = -\hat x$.
        - At $z = 0$: above, $2\hat y$; below, 0. So $\hat z\times(2\hat y) = -2\hat x = \tilde{\mathbf J}_s$ ✓.
        - At $z = 0.5$: above, 0; below, $-2\hat y$. So $\hat z\times(0 + 2\hat y) = -2\hat x = \tilde{\mathbf J}_s$ ✓.

        !!intuition Does this make sense?
          - $\mathbf H$ is largest at the sheets, where $\mathbf E$ is zero, and zero in the middle, where $\mathbf E$ peaks: a quarter wavelength apart, as in every standing wave.
          - Each sheet has field on one side only, so the whole jump of 2 A/m happens on that side: $|\Ht| = |J_s| = 2$ at the sheets.
          - In time, $H_y = 2\cos(2\pi z)\cos(\omega t)$ and $E_x = 240\pi\sin(2\pi z)\sin(\omega t)$: $90°$ apart. So $\langle\mathbf S\rangle = \frac12\Re\{\Et\times\Ht^*\} = 0$ everywhere. The cavity stores energy and sends none out, which matches the zero field outside.

        **Speed path.** Inside, $\mathbf H$ is the cosine partner of $\mathbf E$'s sine: $2\cos(2\pi z)\,\hat y$, where $2 = |J_s|$ because each sheet has field on one side only. Outside, zero. Confirm the sign with the jump at $z = 0$.

        **Where points go.** Forgetting that the downward wave's $\mathbf H$ flips sign (that gives $-2j\sin$, a copy of $\mathbf E$); $\mathbf H$ along $\hat x$; an extra $1/\eta_0$; forgetting to say that $\mathbf H$ is zero outside too.
      ` }),

    // ---------------------------------------------------------------- Problem 2
    RF(md`
      ### Problem 2 (30 points): a wave in a good conductor

      A cosinusoidal TEM wave, linearly polarized along $\hat z$, is generated by a current sheet on the plane $x = 0$ and travels toward $+\hat x$ through a good conducting material ($\sigma$ large compared with $\omega\epsilon$). Its penetration depth is $\delta = 1$ mm, and the electric field at $t = 0$ and $x = 0$ is $\mathbf E(0, 0) = 10\hat z$ V/m.

      [[fig:gc]]

      Read "cosinusoidal" with $\mathbf E(0, 0) = 10\hat z$ as $\mathbf E(0, t) = 10\cos(\omega t)\,\hat z$ V/m: amplitude 10 V/m, phase zero.
    `, { gc: { svg: conductorFig(), cap: 'Sketch added here; the paper has no figure. The key treats the conductor as filling both sides of the sheet.' } }),
    P({ src: 'Spring 2024 #2(a) · 5 pts', title: 'The propagation constant',
      q: md`What is the propagation constant $\gamma = \alpha + j\beta$ of this wave? Give both parts.`,
      parts: [
        NT('\\alpha', 1000, 'Np/m', [{ v: 1, msg: 'That is 1/δ with δ in millimeters. Convert first: δ = 10⁻³ m, so α = 10³ Np/m.' }, { v: 500, msg: 'α = 1/δ exactly: δ is the 1/e distance of the field amplitude.' }]),
        NT('\\beta', 1000, 'rad/m', [{ v: 2000 * PI, msg: 'That would make the wavelength equal δ. In a good conductor β = α = 1/δ, so λ = 2πδ.' }, { v: 1, msg: 'Convert δ to meters first.' }]),
      ],
      hints: [md`In a good conductor $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon) \approx j\omega\mu\sigma$, and $\sqrt j = \dfrac{1 + j}{\sqrt2}$.`, md`So $\alpha = \beta$, and the penetration depth is $\delta = 1/\alpha$.`],
      sol: md`
        **Step 1: γ from Maxwell.** For any medium, combining Faraday's and Ampère's laws in phasors gives
        $$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$$
        **Step 2: the good-conductor step.** Here $\sigma \gg \omega\epsilon$: the conduction current swamps the displacement current. Drop $j\omega\epsilon$:
        $$\gamma^2 \approx j\,\omega\mu\sigma$$
        **Step 3: the square root.** $j = e^{j90°}$, so $\sqrt j = e^{j45°} = \frac{1 + j}{\sqrt2}$:
        $$\gamma = \sqrt{\frac{\omega\mu\sigma}{2}}\,(1 + j)$$
        The real and imaginary parts are equal:
        $$\alpha = \beta = \sqrt{\frac{\omega\mu\sigma}{2}} = \sqrt{\pi f\mu\sigma}$$
        **Step 4: use δ.** The penetration (skin) depth is the distance over which the amplitude $e^{-\alpha x}$ falls by $1/e$, so $\delta = 1/\alpha$. Then
        $$\gamma = \frac{1 + j}{\delta}$$
        With $\delta = 10^{-3}$ m:
        $$\boxed{\gamma = 10^3(1 + j)\ \text{m}^{-1}}$$
        So $\alpha = 1000$ Np/m and $\beta = 1000$ rad/m.

        !!intuition Does this make sense?
          - $\lambda = 2\pi/\beta = 2\pi$ mm $\approx 6.3$ mm: the wave dies within about one sixth of a wavelength. That is what "good conductor" looks like.
          - The angle of $\gamma$ is $45°$. Since $\eta\gamma = j\omega\mu$ has angle $90°$, the angle of $\eta$ is $\tau = 45°$. You need that in parts (c) and (d).

        **Speed path.** Good conductor: $\gamma = (1 + j)/\delta$. Convert $\delta$ to meters. Done.

        **Where points go.** $\delta$ left in millimeters; $\beta = 2\pi/\delta$ (that would make $\lambda = \delta$, but $\lambda = 2\pi\delta$); writing only $\gamma = 1/\delta$ and forgetting the $j\beta$; no units.
      ` }),
    P({ src: 'Spring 2024 #2(b) · 5 pts', title: 'Amplitude at x = 2 mm',
      q: md`Write an expression for the amplitude of the oscillating electric field at $x = 2$ mm. (You do not need to evaluate it.)`,
      parts: [
        NT(md`amplitude of $E_z$ at $x = 2$ mm`, 10 * Math.exp(-2), 'V/m', [{ v: 10 * Math.exp(-4), msg: 'That is e^{−2αx}, the decay of the power. The field amplitude goes as e^{−αx}.' }, { v: 10 * Math.exp(-1), msg: 'That is one skin depth. 2 mm is two of them: αx = 2.' }, { v: 10 * Math.exp(-2) * Math.cos(2), msg: 'That includes the cosine, which is the oscillation. The amplitude is the envelope 10e^{−αx}.' }]),
      ],
      hints: [md`$E_z(x, t) = 10\,e^{-\alpha x}\cos(\omega t - \beta x)$ V/m. The amplitude is the factor in front of the cosine.`],
      sol: md`
        **Step 1: the field.** A wave traveling toward $+x$ with $\gamma = \alpha + j\beta$ and amplitude 10 V/m at $x = 0$:
        $$E_z(x, t) = 10\,e^{-\alpha x}\cos(\omega t - \beta x)\ \text{V/m}$$
        **Step 2: the amplitude.** It is everything in front of the cosine: $10\,e^{-\alpha x}$.

        **Step 3: put in the numbers.** $\alpha x = (10^3\ \text{m}^{-1})(2\times10^{-3}\ \text{m}) = 2$. So
        $$\boxed{|E_z|_{x = 2\ \text{mm}} = 10\,e^{-2}\ \text{V/m} \approx 1.35\ \text{V/m}}$$
        Without a calculator: $e^2 \approx 7.4$, so $10/7.4 \approx 1.35$.

        !!intuition Does this make sense?
          $x = 2$ mm is two skin depths. Each skin depth multiplies the amplitude by $1/e \approx 0.37$, so two of them leave about $0.37^2 \approx 0.14$ of it. The phase $-\beta x = -2$ rad changes when the field peaks, not how big it gets.

        **Speed path.** $x/\delta = 2$, so $10e^{-2}$.

        **Where points go.** $e^{-4}$ (that is the power, $e^{-2\alpha x}$); $e^{-2000}$ from $x$ in millimeters with $\alpha$ in 1/m; including $\cos(\beta x)$.
      ` }),
    P({ src: 'Spring 2024 #2(c) · 5 pts', title: 'Poynting statements: circle all correct',
      q: md`Which statements about the power density $\mathbf S = \mathbf E\times\mathbf H$ (and its time average $\langle\mathbf S\rangle$) carried by this wave are true? Judge each one.`,
      parts: [
        TF(md`(i) $-\nabla\cdot\mathbf S$ equals the time rate of change of the energy density stored in the wave field.`, false,
          null, md`Poynting's theorem has a second term: $-\nabla\cdot\mathbf S = \frac{\partial w}{\partial t} + \mathbf J\cdot\mathbf E$. In a good conductor $\mathbf J\cdot\mathbf E = \sigma E^2$ is large, so the statement leaves out the heating.`),
        TF(md`(ii) $\nabla\cdot\langle\mathbf S\rangle$ equals the time-averaged rate of energy dissipation in the medium.`, false,
          null, md`The sign is wrong: $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$. Power flows in and is used up, so its divergence is negative while the dissipation is positive. (The posted key half-circles this one, with the note "equal but opposite", which says it is false.)`),
        TF(md`(iii) $\langle\mathbf S\rangle$ decreases as the wave propagates along $+\hat x$.`, true,
          md`$\langle\mathbf S\rangle \propto e^{-2\alpha x}$: it falls as the wave goes. The lost power becomes heat in the conductor.`, null),
        TF(md`(iv) $\langle\mathbf S\rangle$ would increase if the wave propagated along $-\hat x$ instead.`, false,
          null, md`A wave toward $-x$ goes as $e^{+\gamma x}$, so $\langle\mathbf S\rangle \propto e^{+2\alpha x}$: it grows with $x$, but the wave moves toward smaller $x$, so it still shrinks as it travels. A passive medium never adds power.`),
        TF(md`(v) $|\langle\mathbf S\rangle| = \dfrac{|\mathbf E|^2}{2\eta_0}$ W/m² at $x = 0$.`, false,
          null, md`Two things are wrong: the impedance is the conductor's, $|\eta| = \sqrt{\omega\mu/\sigma} \ll \eta_0$, and a complex $\eta$ brings a factor $\cos\tau = 1/\sqrt2$. The right value is $\dfrac{|\mathbf E|^2\cos\tau}{2|\eta|} = \dfrac{|\mathbf E|^2}{2\sqrt2\,|\eta|}$.`),
      ],
      hints: [md`Derive Poynting's theorem: $\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)$, then use Faraday and Ampère.`, md`$\langle\mathbf S\rangle = \frac12\Re\{\Et\times\Ht^*\}$ with $\Ht = \Et/\eta$ and $\eta = |\eta|e^{j45°}$.`],
      sol: md`
        **Step 1: Poynting's theorem from Maxwell.** Start from a vector identity:
        $$\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)$$
        Faraday: $\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$. Ampère: $\nabla\times\mathbf H = \mathbf J + \epsilon\,\partial\mathbf E/\partial t$. Substitute:
        $$\nabla\cdot\mathbf S = -\mu\mathbf H\cdot\frac{\partial\mathbf H}{\partial t} - \epsilon\mathbf E\cdot\frac{\partial\mathbf E}{\partial t} - \mathbf J\cdot\mathbf E$$
        Each of the first two terms is a time derivative of an energy density, since $\mathbf H\cdot\partial\mathbf H/\partial t = \frac12\partial(H^2)/\partial t$:
        $$-\nabla\cdot\mathbf S = \frac{\partial}{\partial t}\left(\tfrac12\epsilon E^2 + \tfrac12\mu H^2\right) + \mathbf J\cdot\mathbf E$$
        In words: power flowing into a point (left side) goes into stored energy plus heat.

        **(i) False.** The statement keeps the stored-energy term and drops $\mathbf J\cdot\mathbf E = \sigma E^2$, which in a good conductor is most of it.

        **Step 2: the time average.** The stored energy oscillates; over one period it comes back to where it started, so its average rate of change is zero:
        $$\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$$
        **(ii) False, by its sign.** The divergence is the **negative** of the dissipation. More power enters a small box than leaves it; the difference is the heat.

        !!mistake The posted key
          The key draws a half circle around (ii) and writes "equal but opposite" next to it. Equal but opposite is exactly why the statement, as written, is false. Judge signs strictly: a statement off by a minus sign is a false statement.

        **Step 3: the average power of this wave.** $\Et = 10\,e^{-\gamma x}\hat z$ and, with $\tau = 45°$ from part (a),
        $$\Ht = \frac{1}{\eta}\hat x\times\Et, \qquad \eta = |\eta|e^{j45°}$$
        Then $\langle\mathbf S\rangle = \frac12\Re\{\Et\times\Ht^*\}$ points along $+\hat x$ with size
        $$\langle S_x\rangle = \frac{|E_0|^2}{2|\eta|}\cos\tau\;e^{-2\alpha x}$$
        where $|E_0| = 10$ V/m. The factor $\cos\tau$ is $\Re\{1/\eta^*\}\cdot|\eta|$: the part of $\mathbf H$ in phase with $\mathbf E$.

        **(iii) True.** $e^{-2\alpha x}$ falls as the wave travels.

        **(iv) False.** A wave toward $-x$ has $\Et \propto e^{+\gamma x}$, so $\langle\mathbf S\rangle \propto -\hat x\,e^{+2\alpha x}$. As it travels, $x$ decreases, and so does $e^{2\alpha x}$. Every wave in a lossy medium loses power in the direction it goes.

        **(v) False.** At $x = 0$ the right value is
        $$|\langle\mathbf S\rangle| = \frac{|\mathbf E|^2}{2|\eta|}\cos45° = \frac{|\mathbf E|^2}{2\sqrt2\,|\eta|}$$
        The statement uses $\eta_0$ (the impedance of free space, not of the conductor) and has no $\cos\tau$.

        !!mistake The posted key
          The key crosses out (v) with "$\eta \ne \eta_0$, otherwise correct", and writes $\langle S\rangle = \frac12|E|^2e^{-2\alpha x}/\eta$. That is not otherwise correct: with a complex $\eta$ the formula is $\frac{|E|^2}{2|\eta|}\cos\tau$, and $\cos45° = 1/\sqrt2$ matters. (The Fall 2023 key, Problem 6, has the $\sqrt2$.)

        So the true set is **(iii) only**.

        **Speed path.** Write $-\nabla\cdot\mathbf S = \partial_t w + \mathbf J\cdot\mathbf E$ and its average $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$ on your card. Then: (i) misses $\mathbf J\cdot\mathbf E$, (ii) has the wrong sign, (iii) yes, (iv) waves always shrink as they travel, (v) wrong $\eta$ and no $\cos\tau$.

        **Where points go.** Circling (ii) because it "looks like" the theorem; circling (iv) after reading $e^{+2\alpha x}$ as growth; accepting (v) because the form $|E|^2/2\eta$ is familiar from free space.
      ` }),
    P({ src: 'Spring 2024 #2(d) · 5 pts', title: 'H of a left-handed circular wave',
      q: md`Suppose the wave above is superposed with a sinusoidal $\hat y$ component so that the total wave is **left-handed circularly polarized**. Which expression is the phasor of its **magnetic** field? Here $H_0 = |\mathbf H(0, 0)|$. Circle one.`,
      parts: [
        mc('', [md`$\Ht = H_0\,e^{-\alpha x}e^{-j\beta x}\,(-\hat y - j\hat z)$ A/m`, md`$\Ht = H_0\,e^{-\alpha x}e^{-j\beta x}\,(\hat z + j\hat y)$ A/m`, md`$\Ht = H_0\,e^{\alpha x}e^{j\beta x}\,(\hat z - j\hat y)$ A/m`, md`$\Ht = H_0\,e^{\alpha x}e^{j\beta x}\,(\hat y + j\hat z)$ A/m`, md`$\Ht = H_0\,e^{-\alpha x}e^{-j\beta x}\,(\hat y - j\hat z)$ A/m`, md`$\Ht = H_0\,e^{\alpha x}e^{-j\beta x}\,(-\hat y - j\hat z)$ A/m`], 0,
          [null, md`This one travels toward $+x$ but turns the wrong way: at $t = 0$ it points along $\hat z$ and a quarter period later along $-\hat y$; $\hat z\times(-\hat y) = +\hat x$, along the travel: right-handed.`, md`$e^{+j\beta x}$ means a wave toward $-x$. This wave travels toward $+x$.`, md`$e^{+j\beta x}$ means a wave toward $-x$. This wave travels toward $+x$.`, md`This one is right-handed ($\hat y$, then $\hat z$ a quarter period later: $\hat y\times\hat z = +\hat x$), and the $\mathbf E$ it implies points along $-\hat z$ at $t = 0$, not $+\hat z$.`, md`$e^{+\alpha x}$ with $e^{-j\beta x}$ is a wave that grows as it travels toward $+x$: impossible in a lossy medium.`]),
      ],
      hints: [md`First build $\Et$: a $\hat z$ part $10\,e^{-\gamma x}$ plus a $\hat y$ part of the same size, $\pm j$ out of phase. Pick the sign that makes it left-handed: $\mathbf E(t = 0)\times\mathbf E(t = T/4)$ must point **against** the travel.`, md`Then $\Ht = \frac1\eta\hat x\times\Et$.`],
      sol: md`
        **Step 1: what "handedness" means.** Watch $\mathbf E$ at one point. It turns from $\mathbf E(0)$ to $\mathbf E(T/4)$ a quarter period later. The rotation axis is $\mathbf E(0)\times\mathbf E(T/4)$. If that axis points along the travel, the wave is right-handed (curl your right fingers with the rotation; the thumb points along the travel). Against the travel: left-handed.

        **Step 2: build E.** The $\hat z$ part is given: $10\,e^{-\gamma x}\hat z$, which is $10\hat z$ at $x = 0$, $t = 0$. Add a $\hat y$ part of the same size and a quarter period out of phase: $\pm j$. Try $-j$:
        $$\Et = 10\,e^{-\gamma x}(\hat z - j\hat y)$$
        At $x = 0$, $t = 0$: $\Re\{\hat z - j\hat y\} = \hat z$. A quarter period later, multiply by $e^{j90°} = j$:
        $$j(\hat z - j\hat y) = j\hat z + \hat y$$
        whose real part is $\hat y$. So $\mathbf E$ turns from $\hat z$ to $\hat y$:
        $$\hat z\times\hat y = -\hat x$$
        Against the travel ($+\hat x$): **left-handed**. ✓ (With $+j$ it would be right-handed.)

        **Step 3: H from E.** For a wave toward $+x$, $\Ht = \frac1\eta\hat x\times\Et$. Turn each unit vector:
        $$\hat x\times\hat z = -\hat y, \qquad \hat x\times(-j\hat y) = -j\hat z$$
        So
        $$\Ht = \frac{10}{\eta}\,e^{-\gamma x}\,(-\hat y - j\hat z)$$
        **Step 4: match an option.** Write $\eta = |\eta|e^{j45°}$ and $H_0 = 10/|\eta|$:
        $$\Ht = H_0\,e^{-j45°}\,e^{-\alpha x}e^{-j\beta x}(-\hat y - j\hat z)\ \text{A/m}$$
        The only option with the right decay, the right direction of travel and the left hand is
        $$\boxed{\Ht = H_0\,e^{-\alpha x}e^{-j\beta x}(-\hat y - j\hat z)\ \text{A/m}}$$
        !!mistake The paper's options
          None of the six options carries the factor $e^{-j45°}$: in a good conductor $\mathbf H$ lags $\mathbf E$ by $\tau = 45°$, and the exact phasor has it. The posted key drops it too. It does not change the shape, the handedness or $|\mathbf H(0, 0)| = 10/|\eta|$, so pick the option above, and if you write your own expression, keep the $e^{-j45°}$.

        !!intuition Does this make sense?
          $\mathbf H$ turns with $\mathbf E$: $-\hat y$ at $t = 0$, then $\hat z$ a quarter period later, and $(-\hat y)\times\hat z = -\hat x$: also left-handed ✓. $\mathbf H$ is always $\mathbf E$ turned by $90°$ about the travel, so a field and its partner always have the same handedness.

        **Speed path.** Eliminate first: options with $e^{+j\beta x}$ travel the wrong way (two gone); $e^{+\alpha x}e^{-j\beta x}$ grows (one gone). Of the three left, $\hat x\times\hat z = -\hat y$ says the $\mathbf H$ partner of $\mathbf E(0) = \hat z$ is $-\hat y$: only one option starts there.

        **Where points go.** Judging the hand with the thumb along $+z$ (the polarization direction) instead of the travel $+x$; taking $\hat x\times\hat z = +\hat y$; choosing a growing or backward wave because its vector part looks right.
      ` }),
    P({ src: 'Spring 2024 #2(e) · 10 pts', title: 'Raise the frequency: what stays the same?',
      q: md`If the frequency of the wave were increased (the same sheet current, the same material, still a good conductor), which quantities would **stay the same**? Judge each one.`,
      parts: [
        SAME(md`(i) the amplitude of $\mathbf H(0, 0)$`, true, md`The sheet's boundary condition fixes it: the jump in $H$ across the sheet is $J_s$, split equally between the two sides, so $|\mathbf H(0)| = J_s/2$ at any frequency.`, null),
        SAME(md`(ii) the amplitude of $\mathbf E(0, 0)$`, false, null, md`$|\mathbf E(0)| = |\eta|\,J_s/2$ and $|\eta| = \sqrt{\omega\mu/\sigma}$ grows as $\sqrt f$.`),
        SAME(md`(iii) the penetration depth`, false, null, md`$\delta = 1/\sqrt{\pi f\mu\sigma}$ shrinks as $1/\sqrt f$: higher frequencies stay closer to the surface.`),
        SAME(md`(iv) the speed of propagation`, false, null, md`$v_p = \omega/\beta = \omega\delta = \sqrt{4\pi f/(\mu\sigma)}$ grows as $\sqrt f$.`),
        SAME(md`(v) the average power crossing the plane $x = \tfrac{1}{10}$ m`, false, null, md`$\langle S\rangle \propto |\eta|\,e^{-2x/\delta}$, and both $|\eta|$ and $\delta$ change. (At 100 skin depths it is about $e^{-200}$, essentially zero either way; but it is a different number.)`),
        SAME(md`(vi) the average power absorbed between $x = \tfrac1{10}$ m and $x = \tfrac15$ m`, false, null, md`It is the difference of two $\langle S\rangle$ values, each of which changes with $\delta$ and $|\eta|$.`),
        SAME(md`(vii) the phase shift between $\mathbf E$ and $\mathbf H$`, true, md`In a good conductor $\tau = 45°$ at every frequency: $\eta = \sqrt{\omega\mu/\sigma}\,e^{j45°}$.`, md`This is what the posted key says: "τ is related to frequency". The exact $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$ does move, but for a good conductor it is $45°$ to many decimal places at any frequency where the material stays a good conductor (for copper here the change is about $10^{-13}$ degrees).`),
        SAME(md`(viii) the polarization of the TEM wave`, true, md`$\mathbf E$ points against the sheet current ($\mathbf E = -\frac\eta2\mathbf J_s$ at the sheet). The current's direction did not change, so the wave is still linear along $\hat z$.`, null),
        SAME(md`(ix) the intrinsic impedance of the material`, false, null, md`$\eta = \sqrt{\omega\mu/\sigma}\,e^{j45°}$: its size grows as $\sqrt f$.`),
        SAME(md`(x) the loss tangent`, false, null, md`$\sigma/\omega\epsilon$ has $\omega$ in the denominator: it falls as $1/f$.`),
      ],
      hints: [md`Write each quantity as a formula in $f$: $\delta = 1/\sqrt{\pi f\mu\sigma}$, $|\eta| = \sqrt{2\pi f\mu/\sigma}$, $\tau = 45°$, $v_p = \omega\delta$, $|\mathbf H(0)| = J_s/2$, $|\mathbf E(0)| = |\eta|J_s/2$.`, md`What does the sheet fix directly? The jump in $\mathbf H$.`],
      sol: md`
        **Step 1: what is held fixed.** The source is the current sheet. Raising $f$ keeps $J_s$ (its amplitude and direction), $\sigma$, $\mu$, $\epsilon$. Everything else must be written as a formula and checked for $f$.

        **Step 2: the field at the sheet.** The boundary condition at the sheet: the jump in tangential $\mathbf H$ equals $J_s$. With the same conductor on both sides, the two waves are mirror images, so each side gets half:
        $$|\mathbf H(0)| = \frac{J_s}{2}$$
        No $f$ in it: **(i) stays the same.** Then $|\mathbf E(0)| = |\eta|\,|\mathbf H(0)|$, and
        $$|\eta| = \sqrt{\frac{\omega\mu}{\sigma}}$$
        grows as $\sqrt f$: **(ii) and (ix) change.**

        **Step 3: depth and speed.**
        $$\delta = \frac{1}{\sqrt{\pi f\mu\sigma}}, \qquad v_p = \frac\omega\beta = \omega\delta$$
        $\delta \propto f^{-1/2}$ and $v_p \propto f\cdot f^{-1/2} = f^{1/2}$: **(iii) and (iv) change.**

        **Step 4: powers.** $\langle S(x)\rangle = \frac12|\mathbf H(0)|^2|\eta|\cos\tau\,e^{-2x/\delta}$ involves $|\eta|$ and $\delta$: **(v) and (vi) change.**

        **Step 5: angles and ratios.** The loss tangent $\sigma/\omega\epsilon \propto 1/f$: **(x) changes.** In the good-conductor limit $\tau = 45°$ for any $f$: **(vii) stays the same.** The polarization is set by the direction of the sheet current: **(viii) stays the same.**

        So the quantities that stay the same are **(i), (vii) and (viii)**.

        !!mistake The posted key on (vii)
          The key circles only (i) and (viii) and says (vii) changes because "$\tau$ is related to frequency". The exact formula $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$ does depend on $\omega$, but the problem says the material is a good conductor, and then $\tau = 45°$ at every frequency: with $\delta = 1$ mm in copper, quadrupling $f$ moves $\tau$ by about $10^{-13}$ degrees. On the exam, if you circle (vii), write the reason next to it ("$\tau = 45°$ for any good conductor"); a correct justification is what earns the points.

        Also note what the key assumes for (i): the conductor fills both sides of the sheet, so $\mathbf H$ splits evenly. If the two sides were different materials, the split would depend on their impedances, and (i) would change too.

        **Speed path.** Good-conductor formulas: $\delta \propto f^{-1/2}$, $|\eta| \propto f^{1/2}$, $v_p \propto f^{1/2}$, loss tangent $\propto f^{-1}$, $\tau = 45°$. The sheet fixes $H(0) = J_s/2$ and the direction of $\mathbf E$. So: (i), (vii), (viii).

        **Where points go.** Keeping $|\mathbf E(0)| = 10$ V/m fixed instead of $J_s$ (then (ii) would be the one that stays, and (i) would change); thinking the speed is $c$ or fixed; forgetting that $v_p$ in a conductor depends on frequency.
      ` }),

    // ---------------------------------------------------------------- Problem 3
    R(md`
      ### Problem 3 (18 points): a coaxial cable
    `),
    P({ src: 'Spring 2024 #3 · 18 pts', title: 'L, Z0 and v of a coax',
      q: md`[[fig:cx]]

A coaxial cable has an inner conductor of radius $a$ and an outer conductor of inner radius $b$, with a lossless filling ($\epsilon$, $\mu$, $\sigma = 0$) between them. Its capacitance per unit length is
$$\mathcal C = \frac{2\pi\epsilon}{\ln(b/a)}\ \ \text{F/m}$$
Find the inductance per unit length $\mathcal L$, the characteristic impedance $Z_0$ and the propagation velocity $v_p$ of voltage and current waves on the line, in terms of $a$, $b$, $\epsilon$, $\mu$.`,
      parts: [
        { lbl: md`$\mathcal L$ in H/m (use mu, eps, a, b)`, expr: 'mu*ln(b/a)/(2*pi)', vars: { mu: [1, 4], eps: [1, 4], a: [0.5, 1.5], b: [2, 6] } },
        { lbl: md`$Z_0$ in $\Omega$ (use mu, eps, a, b)`, expr: 'ln(b/a)/(2*pi)*sqrt(mu/eps)', vars: { mu: [1, 4], eps: [1, 4], a: [0.5, 1.5], b: [2, 6] } },
        { lbl: md`$v_p$ in m/s (use mu, eps, a, b)`, expr: '1/sqrt(mu*eps)', vars: { mu: [1, 4], eps: [1, 4], a: [0.5, 1.5], b: [2, 6] } },
      ],
      hints: [md`Every TEM line with a uniform filling has $\mathcal L\mathcal C = \mu\epsilon$. Or do Ampère: $H_\phi = I/(2\pi r)$ between the conductors, and $\mathcal L$ = flux per meter per ampere.`, md`$Z_0 = \sqrt{\mathcal L/\mathcal C}$ and $v_p = 1/\sqrt{\mathcal L\mathcal C}$.`],
      sol: md`
        **Step 1: the magnetic field.** Let the inner conductor carry $I$ along $+z$ and the outer one carry it back. Take Ampère's law around a circle of radius $r$ between them ($a < r < b$). By symmetry $\mathbf H = H_\phi(r)\hat\phi$, and the circle encloses $I$:
        $$H_\phi\cdot2\pi r = I$$
        $$H_\phi = \frac{I}{2\pi r}$$
        [[fig:amp]]

        **Step 2: the flux per meter.** $\mathbf B = \mu\mathbf H$ circles the axis. Take a flat strip 1 m long in $z$, running from $r = a$ to $r = b$. $\mathbf B$ crosses it at right angles:
        $$\Psi = \int_a^b\frac{\mu I}{2\pi r}\,dr$$
        The integral of $1/r$ is $\ln r$:
        $$\Psi = \frac{\mu I}{2\pi}\ln\frac ba$$
        **Step 3: inductance = flux per ampere.**
        $$\boxed{\mathcal L = \frac{\mu}{2\pi}\ln\frac ba\ \ \text{H/m}}$$
        Check it against $\mathcal C$:
        $$\mathcal L\mathcal C = \frac{\mu\ln(b/a)}{2\pi}\cdot\frac{2\pi\epsilon}{\ln(b/a)} = \mu\epsilon$$
        That is the rule for every TEM line with a uniform filling.

        **Step 4: where $Z_0$ and $v_p$ come from.** The telegrapher's equations of a lossless line are
        $$\frac{\partial V}{\partial z} = -\mathcal L\frac{\partial I}{\partial t}, \qquad \frac{\partial I}{\partial z} = -\mathcal C\frac{\partial V}{\partial t}$$
        Try a wave $V = f(t - z/v)$, $I = g(t - z/v)$. Then $\partial V/\partial z = -f'/v$, and the first equation gives $f'/v = \mathcal L g'$. The second gives $g'/v = \mathcal C f'$. Multiply the two:
        $$\frac{1}{v^2} = \mathcal L\mathcal C$$
        Divide the first by the second: $f/g = \mathcal L v$, which is $\sqrt{\mathcal L/\mathcal C}$. So
        $$v_p = \frac{1}{\sqrt{\mathcal L\mathcal C}}, \qquad Z_0 = \frac VI = \sqrt{\frac{\mathcal L}{\mathcal C}}$$
        **Step 5: the impedance.**
        $$Z_0 = \sqrt{\frac{\mu\ln(b/a)}{2\pi}\cdot\frac{\ln(b/a)}{2\pi\epsilon}}$$
        The $\ln(b/a)/2\pi$ appears twice under the root, so it comes out:
        $$\boxed{Z_0 = \frac{\ln(b/a)}{2\pi}\sqrt{\frac\mu\epsilon}\ \ \Omega}$$
        **Step 6: the speed.** $\mathcal L\mathcal C = \mu\epsilon$:
        $$\boxed{v_p = \frac{1}{\sqrt{\mu\epsilon}}\ \ \text{m/s}}$$
        !!intuition Does this make sense?
          - **Units.** $\mu$ is in H/m and $\ln(b/a)$ has none: $\mathcal L$ in H/m ✓. $\sqrt{\mu/\epsilon}$ is an impedance ($\eta_0 = 377\ \Omega$ in vacuum) ✓.
          - **Geometry.** A wider gap (larger $b/a$) links more flux per ampere and stores less charge per volt: $\mathcal L$ up, $\mathcal C$ down, so $Z_0$ up ✓.
          - **Speed.** $v_p$ is the speed of a plane wave in the filling. It does not depend on the geometry at all: a TEM wave on a line is a plane wave guided by the conductors.
          - **A number to remember.** With $\mu = \mu_0$: $Z_0 = \dfrac{60}{\sqrt{\epsilon_r}}\ln\dfrac ba\ \Omega$, since $\eta_0/2\pi = 60\ \Omega$.

        **Speed path.** $\mathcal L\mathcal C = \mu\epsilon$, so $\mathcal L = \mu\epsilon/\mathcal C = \frac{\mu}{2\pi}\ln\frac ba$. Then $Z_0 = \sqrt{\mathcal L/\mathcal C}$ and $v_p = 1/\sqrt{\mu\epsilon}$. Thirty seconds, no integral.

        **Where points go.** $\ln(b/a)$ in the denominator of $\mathcal L$ (copying the shape of $\mathcal C$); $Z_0 = \sqrt{\mathcal C/\mathcal L}$; losing the $2\pi$; leaving $v_p = 1/\sqrt{\mathcal L\mathcal C}$ unsimplified; no units.
      `,
      figs: { cx: { svg: coaxFig(false), cap: 'Cross-section of the cable (the paper draws it in 3-D).' }, amp: { svg: coaxFig(true), cap: 'Ampère\'s law on the dashed circle of radius r: only the inner current I is enclosed.' } } }),

    // ---------------------------------------------------------------- Problem 4
    RF(md`
      ### Problem 4 (34 points): two lines in series

      Two transmission lines, each of length $l/2 = 150$ m, are connected in series to a Thévenin source at $z = 0$ with $R_g = 50\ \Omega$ and voltage $v_g(t)$. The load $R_L = 50\ \Omega$ sits at $z = l = 300$ m. The lines have characteristic impedances $Z_{01}$ and $Z_{02}$, and on both the wave speed is $v_p = c/2$.

      [[fig:tl]]

      In all parts: $Z_{01} = 150\ \Omega$, $Z_{02} = 50\ \Omega$, and $v_g(t) = 80\,u(t)$ V, where $u(t)$ is the unit step.
    `, { tl: { svg: twoLineFig(), cap: 'z is measured from the source. The junction is at z = 150 m.' } }),
    P({ src: 'Spring 2024 #4(a) · 12 pts', title: 'The voltage bounce diagram',
      q: md`Complete the voltage bounce diagram for $0 \le t \le 4$ µs. Give the injection coefficient $\tau_g$, the generator and load reflection coefficients $\Gamma_g$ and $\Gamma_L$, the junction coefficients ($\Gamma_{12}$, $\tau_{12}$ for a wave arriving from line 1; $\Gamma_{21}$, $\tau_{21}$ for a wave arriving from line 2), and label every wave.`,
      parts: [
        NT(md`one-way travel time of each line`, 1, 'µs', [{ v: 0.5, msg: 'That uses c. The waves travel at c/2 = 150 m/µs.' }, { v: 2, msg: 'That is the time for both lines together.' }]),
        NT('\\tau_g', 0.75, '', [{ v: 0.25, msg: 'That is R_g/(R_g + Z₀₁), the share across R_g. τ_g = Z₀₁/(R_g + Z₀₁).' }, { v: 0.5, msg: 'At t = 0 the source sees line 1 only, Z₀₁ = 150 Ω, not Z₀₂ or R_L.' }]),
        NT(md`first forward wave $V^+$`, 60, 'V', [{ v: 40, msg: 'That is the DC answer 80 × 50/100. At t = 0 the line looks like 150 Ω, not like the load.' }, { v: 80, msg: 'Only part of V_g is launched: τ_g V_g.' }]),
        NT('\\Gamma_g', -0.5, '', [{ v: 0.5, msg: 'Γ_g = (R_g − Z₀₁)/(R_g + Z₀₁) = (50 − 150)/200: negative.' }]),
        NT('\\Gamma_{12}', -0.5, '', [{ v: 0.5, msg: 'From line 1 the wave sees Z₀₂ = 50 Ω: (50 − 150)/(50 + 150) = −1/2.' }]),
        NT('\\tau_{12}', 0.5, '', [{ v: 1.5, msg: 'That is τ₂₁, for a wave coming the other way. τ₁₂ = 1 + Γ₁₂ = 1/2.' }]),
        NT('\\Gamma_{21}', 0.5, '', [{ v: -0.5, msg: 'From line 2 the wave sees Z₀₁ = 150 Ω: (150 − 50)/(150 + 50) = +1/2. It is −Γ₁₂.' }]),
        NT('\\tau_{21}', 1.5, '', [{ v: 0.5, msg: 'That is τ₁₂. A wave from the low-impedance side gains voltage: 1 + Γ₂₁ = 3/2.' }]),
        mc('\\Gamma_L', [md`$0$`, md`$\tfrac12$`, md`$-\tfrac12$`, md`$\tfrac13$`], 0,
          [null, md`That compares $R_L$ with $Z_{01}$. The load terminates line 2: $(50 - 50)/(50 + 50) = 0$.`, md`That compares $R_L$ with $Z_{01}$ the other way round. The load sits on line 2, which it matches.`, md`$\Gamma_L = (R_L - Z_{02})/(R_L + Z_{02})$, with the line the load is attached to.`]),
        NT(md`the wave leaving the generator at $t = 2$ µs`, 15, 'V', [{ v: -15, msg: 'It is Γ_g times the arriving −30 V: (−1/2)(−30) = +15 V.' }, { v: -30, msg: 'That is the wave arriving at the generator. The one that leaves is Γ_g times it.' }]),
        NT(md`the wave entering line 2 at $t = 3$ µs`, 7.5, 'V', [{ v: -7.5, msg: 'That is the reflected part, Γ₁₂ × 15. The transmitted part is τ₁₂ × 15 = +7.5 V.' }, { v: 15, msg: 'Only τ₁₂ = 1/2 of it gets through the junction.' }]),
      ],
      hints: [md`$T = (150\ \text{m})/(150\ \text{m}/\mu\text{s}) = 1\ \mu\text{s}$ per line. At $t = 0$ the source sees only line 1, so $V^+ = \tau_gV_g$ with $\tau_g = Z_{01}/(R_g + Z_{01})$.`, md`At the junction: $\Gamma_{12} = \dfrac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}}$, $\tau_{12} = 1 + \Gamma_{12}$; from the other side the roles swap.`],
      sol: md`
        **Step 1: travel time.** $v = c/2 = 1.5\times10^8$ m/s $= 150$ m/µs. Each line is 150 m:
        $$T = \frac{150\ \text{m}}{150\ \text{m}/\mu\text{s}} = 1\ \mu\text{s}$$
        **Step 2: the first wave.** At $t = 0^+$ no reflection has come back, so the source sees line 1 as a resistor $Z_{01}$. It is a voltage divider:
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{150}{50 + 150} = \frac34$$
        $$V^+ = \tau_gV_g = \tfrac34(80) = 60\ \text{V}$$
        Here $\tau_g$ is the **injection coefficient**: the share of $V_g$ launched onto the line.

        **Step 3: the ends.** A reflection coefficient compares what the wave runs into with the line it is on:
        $$\Gamma_g = \frac{R_g - Z_{01}}{R_g + Z_{01}} = \frac{50 - 150}{200} = -\frac12$$
        $$\Gamma_L = \frac{R_L - Z_{02}}{R_L + Z_{02}} = \frac{50 - 50}{100} = 0$$
        The load matches line 2: anything that reaches it is absorbed.

        **Step 4: the junction.** A wave on line 1 runs into $Z_{02}$:
        $$\Gamma_{12} = \frac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}} = \frac{50 - 150}{200} = -\frac12$$
        Voltage is continuous at the junction, so incident plus reflected equals transmitted: $\tau_{12} = 1 + \Gamma_{12} = \tfrac12$ (this $\tau$ is the **transmission coefficient**). A wave on line 2 runs into $Z_{01}$:
        $$\Gamma_{21} = \frac{150 - 50}{200} = +\frac12, \qquad \tau_{21} = \frac32$$
        **Step 5: follow the waves.**
        - $t = 0$ to 1: $+60$ V travels down line 1.
        - $t = 1$: it hits the junction. Reflected: $(-\tfrac12)(60) = -30$ V, back toward the source. Transmitted: $(\tfrac12)(60) = 30$ V into line 2.
        - $t = 2$: the 30 V wave reaches the matched load and is absorbed. The $-30$ V wave reaches the source: $\Gamma_g(-30) = +15$ V starts back down line 1.
        - $t = 3$: the 15 V wave hits the junction: $-7.5$ V back, $+7.5$ V into line 2.
        - $t = 4$: $-7.5$ V reaches the source and sends $+3.75$ V forward (just past the window).

        Nothing ever comes back from line 2, so $\Gamma_{21}$ and $\tau_{21}$ are never used here. The paper asks for them anyway.

        [[fig:bd]]

        !!intuition Does this make sense?
          At $t = 1^+$, check the junction. Voltage, line 1 side: $60 - 30 = 30$ V; line 2 side: 30 V ✓. Current, line 1 side: $\frac{60}{150} - \frac{-30}{150} = 0.6$ A (a backward wave's current is $-V^-/Z_0$); line 2 side: $\frac{30}{50} = 0.6$ A ✓. Both continuous.

        **Speed path.** $T = 1$ µs. $\tau_g = 3/4$, so 60 V. Every round trip in line 1 multiplies by $\Gamma_{12}\Gamma_g = (-\tfrac12)(-\tfrac12) = \tfrac14$: forward waves 60, 15, 3.75; reflected $-30$, $-7.5$; transmitted 30, 7.5.

        **Where points go.** $\tau_g$ with $Z_{02}$ or $R_L$; $\Gamma_L$ computed against $Z_{01}$; $\tau = 1 - \Gamma$; signs of the reflected waves; not labeling the coefficients the paper asks for; travel time from $c$ instead of $c/2$.
      `,
      figs: { bd: { svg: TL.diagram(s4, { tMax: 4, probe: 100, w: 360, h: 340 }), cap: 'Position across (junction dashed at 150 m), time downward. Dots on the probe line z = 100 m mark the fronts used in part (b).' } } }),
    P({ src: 'Spring 2024 #4(b) · 14 pts', title: 'V(100 m, t) for 0 ≤ t ≤ 4 µs',
      q: md`Use your bounce diagram to find the voltage at $z = 100$ m for $0 \le t \le 4$ µs. Mark all magnitudes and times. Then read these values off your plot.`,
      parts: [
        NT(md`time the first front reaches $z = 100$ m`, 2 / 3, 'µs', [{ v: 1, msg: 'That is when it reaches the junction at 150 m. 100 m at 150 m/µs takes 2/3 µs.' }, { v: 1 / 3, msg: 'That uses c = 300 m/µs. The speed is c/2.' }]),
        NT(md`$V$ for $\tfrac23 < t < \tfrac43$ µs`, 60, 'V', [{ v: 80, msg: 'Only τ_g V_g = 60 V is launched.' }]),
        NT(md`time of the second change`, 4 / 3, 'µs', [{ v: 2, msg: 'That is when the reflection reaches the source. Coming back from 150 m, it passes 100 m after 1/3 µs more: 4/3 µs.' }]),
        NT(md`$V$ for $\tfrac43 < t < \tfrac83$ µs`, 30, 'V', [{ v: -30, msg: 'That is the reflected wave alone. The voltage is the sum of everything that has passed: 60 − 30.' }, { v: 90, msg: 'The reflected wave is −30 V: Γ₁₂ is negative.' }]),
        NT(md`$V$ for $\tfrac83 < t < \tfrac{10}3$ µs`, 45, 'V', [{ v: 15, msg: 'That is the new wave alone; add it to the 30 V already there.' }]),
        NT(md`$V$ for $\tfrac{10}3 < t < 4$ µs`, 37.5, 'V', [{ v: 52.5, msg: 'The wave reflected at the junction at t = 3 µs is −7.5 V, so the level drops.' }]),
      ],
      hints: [md`A wave that starts at $z_A$ at time $t_A$ passes $z = 100$ m at $t_A + |100 - z_A|/150$ (µs, with $z$ in m).`, md`The voltage at a point is the sum of all the waves that have passed it so far.`],
      sol: md`
        **Step 1: when does each wave pass $z = 100$ m?** At 150 m/µs, 100 m takes $\tfrac23$ µs and 50 m takes $\tfrac13$ µs. A forward wave leaving the source at $t_A$ passes at $t_A + \tfrac23$; a backward wave leaving the junction at $t_A$ passes at $t_A + \tfrac13$.

        | Wave | Starts at | Passes 100 m | $V$ after |
        |---|---|---|---|
        | $+60$ V | source, $t = 0$ | $\tfrac23$ µs | 60 V |
        | $-30$ V | junction, $t = 1$ | $\tfrac43$ µs | 30 V |
        | $+15$ V | source, $t = 2$ | $\tfrac83$ µs | 45 V |
        | $-7.5$ V | junction, $t = 3$ | $\tfrac{10}3$ µs | 37.5 V |
        | $+3.75$ V | source, $t = 4$ | $\tfrac{14}3$ µs | too late |

        Each level is the previous one plus the new wave: $60$, then $60 - 30 = 30$, then $30 + 15 = 45$, then $45 - 7.5 = 37.5$ V.

        **Step 2: the staircase.** Before $\tfrac23$ µs nothing has arrived: $V = 0$.
        $$V(100, t) = \begin{cases} 0, & t < \tfrac23 \\ 60\ \text{V}, & \tfrac23 < t < \tfrac43 \\ 30\ \text{V}, & \tfrac43 < t < \tfrac83 \\ 45\ \text{V}, & \tfrac83 < t < \tfrac{10}3 \\ 37.5\ \text{V}, & \tfrac{10}3 < t < 4 \end{cases}$$
        [[fig:vt]]

        !!intuition Does this make sense?
          In DC steady state the line is just wire, so $V = 80\cdot\frac{50}{50 + 50} = 40$ V everywhere (the dashed line). The staircase swings around it: $+20$, $-10$, $+5$, $-2.5$ from 40. Each step halves the error and flips its sign. It is settling, as it must.

        **Speed path.** Draw the probe line at 100 m on the bounce diagram and read off the crossings: forward lines at $t_A + \tfrac23$, backward lines at $t_A + \tfrac13$. Keep a running sum.

        **Where points go.** Plotting each wave's value instead of the running sum; arrival times at 1, 2, 3 (the junction times) instead of $\tfrac23, \tfrac43, \ldots$; missing the $-7.5$ V drop at $\tfrac{10}3$; no labels on the axes or the levels.
      `,
      figs: { vt: { svg: TL.plotT(s4, 100, { tMax: 4 }), cap: 'V(100 m, t). The dashed line is the DC steady state, 40 V.' } } }),
    P({ src: 'Spring 2024 #4(c) · 7 pts', title: 'DC steady-state current at z = l/2',
      q: md`As $t \to \infty$, what is the DC steady-state current at $z = l/2$?`,
      parts: [
        NT(md`$I_{ss}(z = l/2)$`, 0.8, 'A', [{ v: 0.4, msg: 'That treats line 1 as a 150 Ω resistor. In DC the line is just two wires.' }, { v: 1.6, msg: 'That leaves out R_g: the source sees R_g + R_L in series.' }, { v: 0.32, msg: 'That puts the line in series as a third resistor. The line has no DC resistance.' }]),
      ],
      hints: [md`In DC steady state a lossless line is two plain wires: $Z_{01}$ and $Z_{02}$ drop out.`],
      sol: md`
        **Step 1: what a line is in DC.** A lossless line is series inductance and shunt capacitance. After everything has settled, nothing changes in time: inductors are shorts and capacitors are opens. The line becomes two ideal wires, and its $Z_0$ plays no part.

        **Step 2: the circuit.** The source, $R_g$ and $R_L$ in one loop:
        $$I_{ss} = \frac{V_g}{R_g + R_L} = \frac{80}{50 + 50}$$
        $$\boxed{I_{ss} = 0.8\ \text{A}}$$
        the same at every $z$, including $l/2$.

        !!intuition Does this make sense?
          Sum the waves on line 2: $30 + 7.5 + 1.875 + \ldots$, a geometric series with ratio $\tfrac14$. Its sum is $\dfrac{30}{1 - 1/4} = 40$ V, so $I = 40/50 = 0.8$ A ✓. The bounce diagram and the DC circuit agree.

        **Speed path.** DC: the line disappears. $80/(50 + 50) = 0.8$ A.

        **Where points go.** Using $Z_{01}$ or $Z_{02}$ as a resistor; forgetting $R_g$; giving the current only at the load (it is the same everywhere in DC, but say so).
      ` }),
  ];

  EM.lesson('e3-past', { id: 'e3-past-sp24', order: 1, title: 'Spring 2024 Exam 3 (Prof. Chen)', kind: 'exam', sub: 'Chen, Shao, Waldrop · 4 problems, 100 pts · two sheets, a good conductor, a coax, a two-line bounce diagram', steps: sp24 });

  // ================================================================ FALL 2023
  // the standing-wave snapshot of Problem 1(d): line weight = instant
  function standingFig() {
    const g = PF.fig({ alt: 'a standing-wave pattern along z drawn at several instants: sine-shaped loops between fixed nodes, the thickest line at the largest amplitude; the vertical axis sits at the right end, on a node' });
    const x0 = 30, x1 = 390, cy = 104, A = 70, n = 6;
    g.arrow(10, cy, 432, cy, { cls: 'dim', hs: 7 }); g.label(436, cy, 'z', 'l', 'small');
    g.line(x1, cy + A + 12, x1, cy - A - 18, { cls: 'dim', arrow: 'end', hs: 7 });
    for (const [a, cls] of [[1, 'thick'], [0.6, ''], [0.22, 'thin']]) {
      for (const s of [1, -1]) {
        const pts = [];
        for (let i = 0; i <= 360; i++) pts.push([x0 + (x1 - x0) * i / 360, cy - s * a * A * Math.sin(n * PI * i / 360)]);
        g.pl(pts, cls ? { cls } : {});
      }
    }
    return g.svg();
  }
  function threeLineFig() {
    const g = PF.fig({ alt: 'a delta-function source delta(t) with 100 ohm drives three line sections in cascade: Z01 = 100 ohm, Z02 = 50 ohm, Z03 = 150 ohm, each with a one-way delay T = 1 microsecond; the load is 150 ohm' });
    const y0 = 26, y1 = 96, xa = 112, w = 74, ym = (y0 + y1) / 2;
    generator(g, xa, y0, y1, '\\delta(t)', '100\\,\\Omega');
    [['Z_{01}', '100\\,\\Omega'], ['Z_{02}', '50\\,\\Omega'], ['Z_{03}', '150\\,\\Omega']].forEach(([n, z], i) => {
      const x0 = xa + i * w;
      rails(g, x0, x0 + w, y0, y1);
      g.label(x0 + w / 2, ym - 17, n, 'c', 'small'); g.label(x0 + w / 2, ym, z, 'c', 'small'); g.label(x0 + w / 2, ym + 17, 'T = 1\\,\\mu\\text{s}', 'c', 'small');
    });
    load(g, xa + 3 * w, y0, y1, '150\\,\\Omega');
    return g.svg();
  }
  function probeLineFig() {
    const g = PF.fig({ alt: 'a generator 30 delta(t) with unknown R_g drives a 100 m line with Z0 = 50 ohm ending in an unknown load R_L; the voltage is measured at z = 50 m' });
    const y0 = 30, y1 = 92, xa = 120, xb = 300;
    generator(g, xa, y0, y1, '30\\,\\delta(t)', 'R_g');
    rails(g, xa, xb, y0, y1); g.label(xa + 45, (y0 + y1) / 2, 'Z_0 = 50\\,\\Omega', 'c', 'small');
    load(g, xb, y0, y1, 'R_L');
    g.line((xa + xb) / 2, y0 - 12, (xa + xb) / 2, y1 + 12, { cls: 'dim dash' });
    zAxis(g, xa, xb + 40, 122, [[xa, '0'], [(xa + xb) / 2, '50'], [xb, '100']]);
    return g.svg();
  }
  function scopeFig() {
    const g = PF.fig({ alt: 'the voltage measured at z = 50 m: an impulse of weight A at t = 1 microsecond and an impulse of weight A/2 at t = 3 microseconds, nothing else' });
    const ox = 40, oy = 130, sx = 34;
    g.arrow(ox, oy, ox + 9 * sx, oy, { cls: 'dim', hs: 7 }); g.label(ox + 9 * sx + 4, oy, 't\\,(\\mu\\text{s})', 'l', 'small');
    g.arrow(ox, oy, ox, 20, { cls: 'dim', hs: 7 }); g.label(ox + 6, 22, 'V(50\\ \\text{m}, t)\\ (\\text{V})', 'l', 'small');
    for (let k = 1; k <= 8; k++) { g.line(ox + k * sx, oy - 3, ox + k * sx, oy + 3, { cls: 'dim' }); g.label(ox + k * sx, oy + 6, String(k), 't', 'small'); }
    g.arrow(ox + sx, oy, ox + sx, oy - 84, { cls: 'thick', hs: 8 }); g.label(ox + sx + 6, oy - 84, 'A\\,\\delta(t - 1)', 'l', 'small');
    g.arrow(ox + 3 * sx, oy, ox + 3 * sx, oy - 42, { cls: 'thick', hs: 8 }); g.label(ox + 3 * sx + 6, oy - 44, '\\tfrac A2\\,\\delta(t - 3)', 'l', 'small');
    return g.svg();
  }
  function shortedLineFig() {
    const g = PF.fig({ alt: 'a pulse generator f(t) with R_g = 60 ohm drives a 300 m line with Z0 = 60 ohm and speed 300 m per microsecond; the far end is short-circuited, R_L = 0' });
    const y0 = 30, y1 = 92, xa = 120, xb = 290;
    generator(g, xa, y0, y1, 'f(t)', 'R_g = 60\\,\\Omega');
    rails(g, xa, xb, y0, y1, 'Z_0 = 60\\,\\Omega', 'v = 300\\ \\text{m}/\\mu\\text{s}');
    load(g, xb, y0, y1, null);
    g.label(xb + 28, (y0 + y1) / 2, 'R_L = 0', 'l', 'small');
    zAxis(g, xa, xb + 40, 122, [[xa, '0'], [xb, '300']]);
    return g.svg();
  }
  const pulseFig = () => PF.plot({ w: 300, h: 150, x: [-1, 9], y: [0, 300], xl: 't\\,(\\mu\\text{s})', yl: 'f(t)\\ (\\text{V})',
    xt: [[0, '0'], [6, '6']], yt: [[240, '240']], curves: [{ pts: [[-1, 0], [0, 0], [0, 240], [6, 240], [6, 0], [9, 0]] }] });

  // Problem 7: the twelve candidate graphs; u = d/l, drawn with d = l on the left and d = 0 (the load) on the right
  const G7 = {
    A: (u) => Math.sin(PI * u / 2), B: (u) => Math.cos(PI * u / 2), C: (u) => -Math.cos(PI * u), D: (u) => Math.sin(PI * u),
    E: (u) => -Math.sin(3 * PI * u / 2), F: (u) => -Math.cos(3 * PI * u / 2), G: (u) => Math.cos(2 * PI * u), H: (u) => -Math.sin(2 * PI * u),
    I: (u) => Math.sin(5 * PI * u / 2), J: (u) => Math.cos(5 * PI * u / 2), K: (u) => -Math.cos(3 * PI * u), L: (u) => Math.sin(3 * PI * u),
  };
  const LET = Object.keys(G7);
  const D7 = {
    A: 'zero at the load and largest at the input, one quarter wave long', B: 'largest at the load and zero at the input, one quarter wave long',
    C: 'largest at both ends (opposite signs), a half wave long', D: 'zero at both ends, a half wave long',
    E: 'zero at the load and largest at the input, three quarter waves long', F: 'largest at the load and zero at the input, three quarter waves long',
    G: 'largest at both ends, a full wave long', H: 'zero at both ends, a full wave long',
    I: 'zero at the load and largest at the input, five quarter waves long', J: 'largest at the load and zero at the input, five quarter waves long',
    K: 'largest at both ends, one and a half waves long', L: 'zero at both ends, one and a half waves long',
  };
  // all twelve in one drawing, three per row, so the grid scales down as a whole on a phone
  function graphsFig() {
    const g = PF.fig({ alt: 'twelve candidate graphs, A to L, of a phasor versus d; in each, d runs from l (the input) on the left to 0 (the load) on the right' });
    LET.forEach((k, i) => {
      const cx = (i % 3) * 158, cy = Math.floor(i / 3) * 110;
      const x0 = cx + 12, x1 = cx + 140, ym = cy + 46, A = 26;
      for (const u of [0.25, 0.5, 0.75, 1]) g.line(x0 + (x1 - x0) * u, ym - A, x0 + (x1 - x0) * u, ym + A, { cls: 'grid nodecl' });
      g.line(x0, ym, x1 + 8, ym, { cls: 'dim', arrow: 'end', hs: 5 });
      g.line(x0, ym + A + 4, x0, ym - A - 8, { cls: 'dim' });
      [[0, 'l'], [0.25, '\\tfrac{3l}{4}'], [0.5, '\\tfrac l2'], [0.75, '\\tfrac l4'], [1, '0']].forEach(([u, t]) => g.label(x0 + (x1 - x0) * u, ym + A + 7, t, 't', 'small'));
      const pts = [];
      for (let j = 0; j <= 160; j++) { const u = j / 160; pts.push([x0 + (x1 - x0) * u, ym - A * G7[k](1 - u)]); }
      g.pl(pts, { cls: 'curve' });
      g.label(x0 + 6, cy + 6, `\\text{(${k})}`, 'l', 'small');
    });
    return g.svg();
  }
  // a graph-letter question: right letter r; need = what the right graph must look like
  const pick7 = (lbl, r, need) => ({ lbl, mc: LET, a: LET.indexOf(r), why: LET.map((k) => (k === r ? null : `Graph ${k} is ${D7[k]}. ${need}`)) });
  // V and I along the line at one resonance, for the solution (d = l on the left, as in the paper)
  const resPlot = (q) => PF.plot({ w: 330, h: 170, x: [0, 1], y: [-1.35, 1.35], zero: true, xl: '', yl: '',
    xt: [[0, 'd = l'], [0.5, '\\tfrac l2'], [1, '0']],
    curves: [
      { f: (x) => Math.sin(q * PI / 2 * (1 - x)), n: 300, lab: '\\tilde V \\propto \\sin\\beta d', labAt: q === 1 ? 0.05 : 0.33, dx: 2, dy: q === 1 ? 8 : -12 },
      { f: (x) => Math.cos(q * PI / 2 * (1 - x)), n: 300, cls: 'dash', lab: '\\tilde I \\propto \\cos\\beta d', labAt: q === 1 ? 0.62 : 0.86, dx: -10, dy: -16 },
    ] });

  const s3 = TL.solve({ Vg: 1, Rg: 100, RL: 150, sections: [{ Z0: 100, len: 1, v: 1 }, { Z0: 50, len: 1, v: 1 }, { Z0: 150, len: 1, v: 1 }], tMax: 4.5 });
  const s4b = TL.solve({ Vg: 30, Rg: 50, RL: 150, sections: [{ Z0: 50, len: 100, v: 50 }], tMax: 6 });
  const s5 = TL.solve({ Vg: 240, Rg: 60, RL: 0, sections: [{ Z0: 60, len: 300, v: 300 }], tMax: 12 });
  const rect6 = (t) => (t >= 0 && t < 6 ? 1 : 0);
  const ERW = ['$\\epsilon_r = 1$: $v = 300$ m/µs, so 50 m takes 1/6 µs.', '$\\epsilon_r = 1.5$: $v \\approx 245$ m/µs, so 50 m takes about 0.20 µs.', '$\\epsilon_r = 2$: $v \\approx 212$ m/µs, so 50 m takes about 0.24 µs.', '$\\epsilon_r = 3$: $v \\approx 173$ m/µs, so 50 m takes about 0.29 µs.', '$\\epsilon_r = 4.5$: $v \\approx 141$ m/µs, so 50 m takes about 0.35 µs.', '$\\epsilon_r = 9$: $v = 100$ m/µs, so 50 m takes 0.5 µs.'];

  const fa23 = [
    R(md`
      **Fall 2023 · ECE 329 · Exam 3** (Goddard, Ilie, Zhao). Wednesday, November 15, 2023. Seven questions, 100 points. Part I, multiple choice: questions 1–4 (11, 9, 12 and 18 points). Part II, detailed questions: 5–7 (24, 10 and 16 points). Closed book, no calculators or electronic devices. The cover gives no time; plan on 75 minutes, like your exam.

      **What it tests.**
      - Question 1: polarization as a sum of other polarizations, the loss tangent, energy in a standing wave, reading a standing-wave picture ([Topic 9](#/l/w3-pol), [Topic 5](#/l/w2-gamma), [Topic 12](#/l/w4-standing)).
      - Question 2: naming a polarization from two components ([Topic 9](#/l/w3-pol)).
      - Question 3: coefficients at the ends and junctions of three lines in series ([Topic 14](#/l/w5-launch), [Topic 16](#/l/w5-multi)).
      - Question 4: reading a scope trace backward to $R_g$, $R_L$ and $\epsilon_r$ ([Topic 16](#/l/w5-multi)).
      - Question 5: a shorted line driven by a step and by a pulse ([Topic 15](#/l/w5-bounce)).
      - Question 6: power and dB attenuation in water ([Topic 8](#/l/w2-loss)).
      - Question 7: resonances of a shorted line, $\tilde V(d)$ and $\tilde I(d)$ ([Topic 18](#/l/w6-stubs), [Topic 17](#/l/w6-vd)).

      **About the posted key.** It is typed and every final answer in it is right. A few things in it are sloppy, and the solutions point them out: Question 2 gives the amplitudes of a magnetic field in V/m (they are A/m); 1(d) says "circle all that apply" but fills in only the combined option; 6(a) writes $\eta$ in one line where $\eta^*$ belongs (the next line is right).

      **How to use it.** Set a 75-minute timer and work on paper, closed book. Then enter your answers here. The paper's "circle all that apply" questions built from statements appear as one True/False question per statement; the ones with numbered choices stay as choices; the sketches of Question 5 become values read off your sketch. Then read every solution: each ends with a **speed path** and **where points go**.
    `),

    // ---------------------------------------------------------------- Question 1
    R(md`
      ### Part I, Question 1 (11 points): concepts

      Circle all that apply. Some parts need a short calculation; you do not need to show work, but partial credit needs it.
    `),
    P({ src: 'Fall 2023 #1(a) · 3 pts', title: 'Polarization as a sum',
      q: md`Which of these statements are true? (On the paper the choices are the two statements, "All of the above" and "None of the above".)`,
      parts: [
        TF(md`(1) Given the direction of propagation, a field of arbitrary polarization can be written as a linear superposition of orthogonally polarized fields.`, true,
          md`Any field across the direction of travel has two components, for example along $\hat x$ and $\hat y$. Each one alone is a linearly polarized field, and the two are orthogonal. Their phasors can be any two complex numbers, so every polarization is such a sum.`, null),
        TF(md`(2) Given the direction of propagation, a linearly polarized field can be written as a superposition of circularly polarized fields.`, true,
          md`$\hat x = \tfrac12(\hat x - j\hat y) + \tfrac12(\hat x + j\hat y)$: a right-handed and a left-handed circular wave of equal size add to a linear one. Their $\hat y$ parts cancel at every instant.`, null),
      ],
      hints: [md`Try to write $\hat x$ as the sum of $(\hat x - j\hat y)$ and $(\hat x + j\hat y)$, with weights.`],
      sol: md`
        **Statement (1).** Fix the direction of travel, say $\hat z$. The field lies in the $xy$ plane, so its phasor is
        $$\Et = \tilde E_x\,\hat x + \tilde E_y\,\hat y$$
        with any two complex numbers $\tilde E_x$ and $\tilde E_y$. Each term alone is a linearly polarized field (a fixed direction, a size that oscillates), and $\hat x\perp\hat y$. So any polarization (linear, circular, elliptical) is a sum of two orthogonal linear ones. **True.** "Orthogonally polarized" also covers an RHC and an LHC pair, which are orthogonal too; that is statement (2).

        **Statement (2).** Add a right- and a left-handed circular wave of equal size (for travel along $+\hat z$, $\hat x - j\hat y$ is right-handed):
        $$\tfrac12(\hat x - j\hat y) + \tfrac12(\hat x + j\hat y) = \hat x$$
        The $\hat y$ parts cancel and a linear field along $\hat x$ is left. **True.**

        So the paper's answer is **"All of the above"**, as the key has it.

        !!intuition Does this make sense?
          Picture two equal arrows spinning in opposite directions. Whenever one points up, the other points down; whenever they point the same way, it is along $\hat x$. Their sum only ever slides back and forth along $\hat x$: a linear field.

        **Speed path.** Two basis pairs span every polarization: ($\hat x$, $\hat y$) and (RHC, LHC). Both statements are those two facts.

        **Where points go.** Doubting (2) because a circular wave "has constant size": two of them, turning opposite ways, do not.
      ` }),
    P({ src: 'Fall 2023 #1(b) · 3 pts', title: 'What the loss tangent means',
      q: md`The loss tangent $\sigma/\omega\epsilon$ represents… Judge each statement. (On the paper: the two statements, "All of the above", "None of the above".)`,
      parts: [
        TF(md`(1) the tangent of the angle by which the displacement current density leads the total current density`, true,
          md`$\mathbf J_{\text{total}} = (\sigma + j\omega\epsilon)\Et$. The displacement part $j\omega\epsilon\Et$ sits at $90°$; the total sits at $\tan^{-1}(\omega\epsilon/\sigma)$. The lead is $90° - \tan^{-1}(\omega\epsilon/\sigma) = \tan^{-1}(\sigma/\omega\epsilon)$, whose tangent is the loss tangent.`, null),
        TF(md`(2) the ratio between the conduction and the displacement current`, true,
          md`$|\sigma\Et|/|j\omega\epsilon\Et| = \sigma/\omega\epsilon$: the ratio of their sizes.`, null),
      ],
      hints: [md`Draw $\sigma$ (real) and $j\omega\epsilon$ (imaginary) as two arrows, and their sum.`],
      sol: md`
        **Step 1: the two currents.** Ampère's law in phasors has
        $$\nabla\times\Ht = \sigma\Et + j\omega\epsilon\Et$$
        Conduction current $\sigma\Et$ is in phase with $\Et$. Displacement current $j\omega\epsilon\Et$ leads it by $90°$.

        **(2) True.** The ratio of their sizes: $\dfrac{\sigma|\Et|}{\omega\epsilon|\Et|} = \dfrac{\sigma}{\omega\epsilon}$.

        **Step 2: the angle.** Draw the bracket $\sigma + j\omega\epsilon$: a right triangle with $\sigma$ along the real axis and $\omega\epsilon$ up. The total current points along the hypotenuse, at angle $\theta$ above the real axis with $\tan\theta = \omega\epsilon/\sigma$. The displacement current points straight up, at $90°$. So it leads the total by $90° - \theta$, the other acute angle of the same triangle:
        $$\tan(90° - \theta) = \frac{\sigma}{\omega\epsilon}$$
        **(1) True.**

        So the paper's answer is **"All of the above"**, as in the key.

        !!intuition Does this make sense?
          A perfect dielectric ($\sigma = 0$): the total current is all displacement, the lead is $0°$, $\tan 0 = 0$ ✓. A perfect conductor: the total is all conduction, along the real axis, and the displacement current leads it by $90°$, $\tan90° = \infty$ ✓.

        **Speed path.** One triangle with legs $\sigma$ and $\omega\epsilon$. The angle opposite the $\sigma$ leg has tangent $\sigma/\omega\epsilon$, and it is the angle between the vertical leg and the hypotenuse.

        **Where points go.** Picking the angle between the total and the conduction current (its tangent is $\omega\epsilon/\sigma$, upside down).
      ` }),
    P({ src: 'Fall 2023 #1(c) · 2 pts', title: 'Energy in a standing wave',
      q: md`In a region of free space where a standing wave exists, $\tfrac12\epsilon_0\mathbf E\cdot\mathbf E + \tfrac12\mu_0\mathbf H\cdot\mathbf H = 0$. True or false?`,
      parts: [
        TF('', false, null, md`Both terms are squares, never negative, so the sum is zero only where $\mathbf E$ and $\mathbf H$ are both zero at once. In a standing wave that happens only at isolated points and instants. The stored energy is there; it sloshes between $\mathbf E$ and $\mathbf H$.`),
      ],
      sol: md`
        **Step 1: the standing wave.** Take a wave reflected by a perfect conductor at $z = 0$. With $E_0$ the incident amplitude:
        $$E_x = 2E_0\sin(\beta z)\sin(\omega t)$$
        $$H_y = \frac{2E_0}{\eta_0}\cos(\beta z)\cos(\omega t)$$
        **Step 2: the energy density.** $\tfrac12\epsilon_0E^2 + \tfrac12\mu_0H^2$ is a sum of two squares, each $\ge 0$. It is zero only where both fields vanish at the same moment, for example at $\beta z = 0$ (where $E = 0$ always) at the instant $\cos\omega t = 0$. Everywhere else it is positive. Put the fields in, using $\mu_0/\eta_0^2 = \epsilon_0$ for the magnetic term:
        $$w = 2\epsilon_0E_0^2\left[\sin^2\!\beta z\,\sin^2\!\omega t + \cos^2\!\beta z\,\cos^2\!\omega t\right]$$
        Average over time, with $\langle\sin^2\omega t\rangle = \langle\cos^2\omega t\rangle = \tfrac12$:
        $$\langle w\rangle = \epsilon_0E_0^2\left[\sin^2\beta z + \cos^2\beta z\right] = \epsilon_0E_0^2$$
        the same at every $z$, and not zero. (It is twice the $\tfrac12\epsilon_0E_0^2$ of the incident wave alone: two waves, twice the energy.) **False.**

        !!intuition Does this make sense?
          What a standing wave has zero of is **net power flow**: $\langle\mathbf S\rangle = 0$, because $\mathbf E$ and $\mathbf H$ are $90°$ apart in time. Energy is stored, not transported. The statement confuses the two.

        **Speed path.** Squares cannot sum to zero unless both are zero. False.

        **Where points go.** Mixing up "no net power" with "no energy".
      ` }),
    P({ src: 'Fall 2023 #1(d) · 3 pts', title: 'Reading a standing-wave picture',
      q: md`[[fig:st]]

The diagram shows one field along $z$ at several instants (thicker lines are different times). It could represent… (pick the best answer)`,
      figs: { st: { svg: standingFig(), cap: 'Line weight marks the instant. The nodes stay put; only the size of each loop changes.' } },
      parts: [
        mc('', [md`either the electric field of a standing wave or the magnetic field of a standing wave`, md`the electric field of a standing wave`, md`the magnetic field of a standing wave`, md`the electric field of a traveling wave`, md`the magnetic field of a traveling wave`, md`either the electric field of a standing wave or the electric field of a traveling wave`], 0,
          [null, md`It could be, but nothing in the picture says which field it is. The $\mathbf H$ of a standing wave has exactly the same look, shifted by $\lambda/4$. The complete answer names both.`, md`It could be, but the $\mathbf E$ of a standing wave looks exactly the same. Nothing in the picture tells $\mathbf E$ from $\mathbf H$.`, md`A traveling wave keeps its size and slides along $z$: no fixed nodes. These loops stay put and only grow and shrink.`, md`A traveling wave has no fixed nodes; its pattern moves.`, md`The traveling-wave half is impossible: the nodes do not move.`]),
      ],
      sol: md`
        **Step 1: standing or traveling?** In a traveling wave, $\cos(\omega t - \beta z)$, the whole pattern slides along $z$ and every point reaches the same peak. In this picture the zeros (nodes) never move and each loop only changes size: $\sin(\beta z)\sin(\omega t)$. It is a **standing wave**.

        **Step 2: E or H?** In a standing wave both fields have this look: $\mathbf E$ goes as $\sin\beta z$ and $\mathbf H$ as $\cos\beta z$ (or the other way, depending on the reflector), a quarter wavelength apart. A picture with no reference point cannot tell which one it is. So: **either the electric or the magnetic field of a standing wave.**

        !!mistake The posted key
          The question says "circle all that apply", yet the key fills in only the combined option. Read literally, "the electric field of a standing wave" and "the magnetic field of a standing wave" also apply, since the picture **could** be either. The intended answer is the combined option; on the exam, if you circle the single ones too, add a word of reasoning. If the vertical axis marked a perfect conductor, the node there would rule out $\mathbf H$ (it is largest at a conductor), but the paper does not say so.

        **Speed path.** Fixed nodes: standing. No reference: either field.

        **Where points go.** Calling it traveling because it "looks like a sine wave"; picking only $\mathbf E$ by habit.
      ` }),

    // ---------------------------------------------------------------- Question 2
    R(md`
      ### Part I, Question 2 (9 points): name the polarization

      A wave carries the magnetic field
      $$\mathbf H(z, t) = \hat x\,A\cos(\omega t - kz) + \hat y\,B\cos(\omega t - kz + \phi)$$
      Identify its polarization in each case. (The paper gives $A$ and $B$ in V/m; for a magnetic field they are in A/m. It does not change any answer.)
    `),
    P({ src: 'Fall 2023 #2(a)–(c) · 9 pts', title: 'Linear, circular or elliptical',
      q: md`(a) $A = 2$, $B = 4$, $\phi = 0$. (b) $A = 4$, $B = 2$, $\phi = \pi$. (c) $A = 2$, $B = 2$, $\phi = \pi/4$.`,
      parts: [
        mc('(a) A = 2, B = 4, φ = 0', ['linear', 'right circular', 'left circular', 'elliptical'], 0,
          [null, md`Circular needs equal sizes and a $90°$ phase difference. Here the sizes differ and the phases are equal.`, md`Circular needs equal sizes and a $90°$ phase difference. Here the sizes differ and the phases are equal.`, md`With $\phi = 0$ both components rise and fall together, so the tip moves back and forth along one line, of slope $B/A = 2$. An ellipse needs a phase difference other than $0$ or $\pi$.`]),
        mc('(b) A = 4, B = 2, φ = π', ['linear', 'right circular', 'left circular', 'elliptical'], 0,
          [null, md`Circular needs a $90°$ phase difference and equal sizes; here the phase difference is $180°$.`, md`Circular needs a $90°$ phase difference and equal sizes; here the phase difference is $180°$.`, md`$\phi = \pi$ makes the components exactly opposite: when one is at its maximum, the other is at its minimum. The tip still moves on one line, of slope $-B/A = -\tfrac12$.`]),
        mc('(c) A = 2, B = 2, φ = π/4', ['elliptical', 'linear', 'right circular', 'left circular'], 0,
          [null, md`Linear needs $\phi = 0$ or $\pi$. At $45°$ the components are out of step, so the tip traces a loop.`, md`Equal sizes are not enough for a circle: the phase difference must be $\pm90°$. At $45°$ the circle is squashed into a tilted ellipse.`, md`Equal sizes are not enough for a circle: the phase difference must be $\pm90°$. At $45°$ the circle is squashed into a tilted ellipse.`]),
      ],
      hints: [md`Phase difference $0$ or $\pi$: linear. Equal sizes **and** $\pm\pi/2$: circular. Anything else: elliptical.`],
      sol: md`
        **Step 1: the rule.** Watch the tip of $\mathbf H$ at $z = 0$: $H_x = A\cos\omega t$ and $H_y = B\cos(\omega t + \phi)$.
        - $\phi = 0$: $H_y/H_x = B/A$ at every instant. The tip moves on a straight line: **linear**.
        - $\phi = \pi$: $\cos(\omega t + \pi) = -\cos\omega t$, so $H_y/H_x = -B/A$: again a line, **linear**.
        - $A = B$ and $\phi = \pm\pi/2$: $H_y = \mp A\sin\omega t$, so $H_x^2 + H_y^2 = A^2$: a **circle**.
        - Anything else: an **ellipse**.

        **(a)** $\phi = 0$: **linear**, along a line of slope 2 in the $xy$ plane.

        **(b)** $\phi = \pi$: **linear**, slope $-\tfrac12$.

        **(c)** Equal sizes, but $\phi = 45°$: **elliptical**. (Its hand, though not asked: $H_y$ leads, so the tip turns from $\hat y$ toward $\hat x$, and $\hat y\times\hat x = -\hat z$, against the travel $+\hat z$: left-handed. At $\phi = +90°$ it would be left circular.)

        !!intuition Does this make sense?
          The polarization of $\mathbf H$ is the polarization of the wave: $\mathbf E = \eta\,\mathbf H\times\hat z$ turns $\mathbf H$ by $90°$ about the travel, which keeps the shape and the hand.

        **Speed path.** Look only at $\phi$ first: 0 or $\pi$ means linear, whatever the sizes. Then for circular you need both $A = B$ and $\phi = \pm\pi/2$.

        **Where points go.** Calling (c) circular because $A = B$; calling (b) elliptical because $\phi \ne 0$.
      ` }),

    // ---------------------------------------------------------------- Question 3
    RF(md`
      ### Part I, Question 3 (12 points): three lines in series

      A transmission line is made of three sections in cascade. At $t = 0$ the source $\delta(t)$, with internal resistance $100\ \Omega$, is turned on, and a wave starts down the line.

      [[fig:three]]
    `, { three: { svg: threeLineFig(), cap: 'Each section takes T = 1 µs to cross. The load matches section 3.' } }),
    P({ src: 'Fall 2023 #3(i)–(iv) · 12 pts', title: 'Coefficients and a delay',
      q: md`(i) The injection coefficient $\tau_g$. (ii) The voltage reflection coefficient $\Gamma$ between the first and second sections, for a wave going right. (iii) The **current** reflection coefficient $\Gamma_c$ between the second and third sections, for a wave going right. (iv) The minimum time, from $t = 0$, for the wave reflected between the second and third sections to reach the generator.`,
      parts: [
        mc('(i) τ_g', ['$1$', '$\\tfrac12$', '$\\tfrac23$', '$\\tfrac34$'], 1,
          [md`$\tau_g = 1$ needs an ideal source, $R_g = 0$. Here $R_g = 100\ \Omega$ takes half.`, null, md`That is $1 + \Gamma_{12}$, the transmission into section 2. The injection coefficient is the divider $Z_{01}/(R_g + Z_{01})$.`, md`That is $150/200$: it uses the load or $Z_{03}$. At $t = 0$ the source sees only section 1.`]),
        mc('(ii) Γ between sections 1 and 2', ['$\\tfrac13$', '$-\\tfrac13$', '$\\tfrac12$', '$-\\tfrac12$'], 1,
          [md`Wrong sign: the wave runs from $100\ \Omega$ into a lower $50\ \Omega$, so $\Gamma < 0$.`, null, md`That is $(150 - 50)/(150 + 50)$, the junction between sections 2 and 3.`, md`That divides $50 - 100$ by $100$. The denominator is the sum, $50 + 100 = 150$.`]),
        mc('(iii) current Γ_c between sections 2 and 3', ['$\\tfrac13$', '$-\\tfrac13$', '$\\tfrac12$', '$-\\tfrac12$'], 3,
          [md`That is the size of the coefficient at the first junction. This is the second one.`, md`That is the **voltage** coefficient at the first junction.`, md`That is the **voltage** coefficient here. A reflected wave's current is $-V^-/Z_0$, so the current coefficient has the opposite sign.`, null]),
        mc('(iv) minimum time to reach the generator', ['$2$ µs', '$3$ µs', '$4$ µs', '$5$ µs'], 2,
          [md`That is when the first wave **reaches** the second junction. It still has to come back through two sections.`, md`That counts the way back through only one section. It must cross sections 2 and 1.`, null, md`That adds a trip through section 3. The reflection happens at the junction, before section 3.`]),
      ],
      hints: [md`$\tau_g = \dfrac{Z_{01}}{R_g + Z_{01}}$, $\Gamma_{12} = \dfrac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}}$.`, md`For current, $I^- = -V^-/Z_0$: the current coefficient is minus the voltage one.`],
      sol: md`
        **(i) Injection.** At $t = 0$ the source sees section 1 as a resistor $Z_{01} = 100\ \Omega$ in series with its own $100\ \Omega$. A voltage divider:
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{100}{100 + 100} = \frac12$$
        **(ii) First junction.** A wave on section 1 runs into $Z_{02}$:
        $$\Gamma_{12} = \frac{Z_{02} - Z_{01}}{Z_{02} + Z_{01}} = \frac{50 - 100}{50 + 100} = -\frac13$$
        **(iii) Second junction, current.** The voltage coefficient is
        $$\Gamma_{23} = \frac{150 - 50}{150 + 50} = +\frac12$$
        Each wave's current is its voltage over $Z_0$, with a minus sign for a wave going left: $I^+ = V^+/Z_0$ and $I^- = -V^-/Z_0$. So
        $$\Gamma_c = \frac{I^-}{I^+} = -\frac{V^-}{V^+} = -\Gamma_{23} = -\frac12$$
        **(iv) The delay.** The first wave reaches the second junction at $t = 2$ µs (two sections). Its reflection comes back through section 2 (1 µs) and section 1 (1 µs):
        $$t = 2 + 1 + 1 = 4\ \mu\text{s}$$
        On the way it crosses junction 1 with $\tau_{21} = 1 + \Gamma_{21} = 1 + \tfrac13 = \tfrac43$.

        [[fig:bd3]]

        !!intuition Does this make sense?
          Follow the weights: $\tfrac12$ starts out; $\tau_{12} = \tfrac23$ of it, $\tfrac13$, enters section 2; $\Gamma_{23} = \tfrac12$ of that, $\tfrac16$, comes back; $\tau_{21} = \tfrac43$ of that, $\tfrac29$, reaches the generator at 4 µs. The generator is matched ($\Gamma_g = 0$) and so is the load ($\Gamma_L = 0$), so only the junctions send anything back.

        **Speed path.** $\tau_g$: divider. $\Gamma$: (far side − near side)/(sum). Current: flip the sign. Time: count sections out and back.

        **Where points go.** Giving the voltage coefficient when the current one is asked; $\tau_g$ from the wrong impedance; counting the delay from the reflection instead of from $t = 0$.
      `,
      figs: { bd3: { svg: TL.diagram(s3, { tMax: 4.5, unit: '', zUnit: 'sections', w: 330 }), cap: 'Weights of the delta pulses (for a source δ(t)). Position in sections, time in µs. Junctions dashed.' } } }),

    // ---------------------------------------------------------------- Question 4
    RF(md`
      ### Part I, Question 4 (18 points): read the scope trace backward

      A pulse generator with unknown internal resistance sends the delta pulse $30\,\delta(t)$ at $t = 0$ down a lossless line ($Z_0 = 50\ \Omega$, length 100 m) that ends in an unknown resistive load $R_L$. The voltage is measured at $z = 50$ m, the midpoint. Two pulses are seen: one at 1 µs and one at 3 µs, of sizes $A$ and $A/2$ volts. No other pulses are observed.

      [[fig:pl]]

      [[fig:sc]]
    `, { pl: { svg: probeLineFig(), cap: 'The probe sits at the midpoint, z = 50 m (dashed).' }, sc: { svg: scopeFig(), cap: 'What the probe records: A at 1 µs, A/2 at 3 µs, then nothing.' } }),
    P({ src: 'Fall 2023 #4(a)–(d) · 18 pts', title: 'R_g, R_L, A and the dielectric',
      q: md`(a) (5 pts) the internal resistance of the generator; (b) (5 pts) the load resistance; (c) (4 pts) the amplitude $A$; (d) (4 pts) the relative dielectric constant $\epsilon_r$ of the line, which is non-magnetic ($\mu = \mu_0$).`,
      parts: [
        mc('(a) R_g in Ω', ['$0$', '$\\tfrac12$', '$\\tfrac{50}{3}$', '$50$', '$100$', '$150$', '$\\infty$', 'none of these'], 3,
          [md`Then $\Gamma_g = -1$, and the $A/2$ pulse would bounce off the generator and pass the probe again at 5 µs as $-A/2$. None is seen.`, md`$\tfrac12$ is $\Gamma_L$, not a resistance.`, md`That gives $\Gamma_g = -\tfrac12$: a third pulse at 5 µs.`, null, md`That gives $\Gamma_g = +\tfrac13$: a third pulse at 5 µs.`, md`That is the load's value. A 150 Ω generator would reflect half of what comes back: a third pulse at 5 µs.`, md`An open generator would launch nothing at all: $\tau_g = 0$.`, md`50 Ω is on the list.`]),
        mc('(b) R_L in Ω', ['$0$', '$\\tfrac12$', '$\\tfrac{50}{3}$', '$50$', '$100$', '$150$', '$\\infty$', 'none of these'], 5,
          [md`A short gives $\Gamma_L = -1$: the second pulse would be $-A$.`, md`That is $\Gamma_L$ itself. Convert: $R_L = Z_0\dfrac{1 + \Gamma_L}{1 - \Gamma_L}$.`, md`That gives $\Gamma_L = -\tfrac12$: the second pulse would be $-A/2$.`, md`A matched load reflects nothing: there would be no second pulse.`, md`That gives $\Gamma_L = \tfrac13$: the second pulse would be $A/3$.`, null, md`An open gives $\Gamma_L = 1$: the second pulse would be $A$.`, md`150 Ω is on the list.`]),
        mc('(c) A in V', ['$0$', '$10$', '$15$', '$20$', '$22.5$', '$30$', '$60$', 'none of these'], 2,
          [md`Something is seen, so $A \ne 0$.`, md`That is $\tau_g = \tfrac13$, which needs $R_g = 100\ \Omega$; part (a) found 50.`, null, md`That is $\tau_g = \tfrac23$, which needs $R_g = 25\ \Omega$.`, md`That is $\tau_g = \tfrac34$, which needs $R_g = \tfrac{50}{3}\ \Omega$.`, md`That launches all of the source, which needs $R_g = 0$.`, md`The line can never carry more than the source voltage from a single launch.`, md`15 V is on the list.`]),
        mc('(d) ε_r', ['$1$', '$1.5$', '$2$', '$3$', '$4.5$', '$9$', '$36$', 'none of these'], 6,
          [...ERW, null, md`36 is on the list. (If you got 6, you forgot to square $c/v$.)`]),
      ],
      hints: [md`The first pulse needs 1 µs to cover 50 m: that is the speed. The second pulse went to the load and back: that is $\Gamma_L$.`, md`"No other pulses": what does the generator do to the reflected pulse when it arrives at $t = 4$ µs?`],
      sol: md`
        **Step 1: the speed, and (d).** The first pulse leaves $z = 0$ at $t = 0$ and reaches $z = 50$ m at $t = 1$ µs:
        $$v = \frac{50\ \text{m}}{1\ \mu\text{s}} = 5\times10^7\ \text{m/s} = \frac c6$$
        For a non-magnetic line, $v = c/\sqrt{\epsilon_r}$, so
        $$\epsilon_r = \left(\frac cv\right)^2 = 6^2 = 36$$
        **Step 2: the second pulse, and (b).** It arrives at 3 µs. The first pulse reached the load (100 m) at 2 µs, reflected, and came back 50 m to the probe at 3 µs. So the second pulse is the load's reflection, $\Gamma_LA$:
        $$\Gamma_L = \frac{A/2}{A} = \frac12$$
        Invert $\Gamma_L = \frac{R_L - Z_0}{R_L + Z_0}$:
        $$R_L = Z_0\frac{1 + \Gamma_L}{1 - \Gamma_L} = 50\cdot\frac{3/2}{1/2} = 150\ \Omega$$
        **Step 3: no third pulse, and (a).** The reflected pulse reaches the generator at $t = 4$ µs. If $\Gamma_g \ne 0$ it would send a pulse $\Gamma_g\cdot\frac A2$ back, passing the probe at 5 µs. None is seen, so
        $$\Gamma_g = 0 \quad\Rightarrow\quad R_g = Z_0 = 50\ \Omega$$
        **Step 4: the size, and (c).** The launched pulse is $\tau_g$ times the source:
        $$A = \frac{Z_0}{R_g + Z_0}\cdot30 = \frac{50}{100}\cdot30 = 15\ \text{V}$$
        [[fig:bd4]]

        !!intuition Does this make sense?
          Each observation pins one unknown: the arrival time gives the speed, the second pulse's size gives $\Gamma_L$, the silence afterward gives $\Gamma_g$, and the first pulse's size gives $\tau_g$. A matched generator is the only way a line goes quiet after one round trip.

        **Speed path.** $\epsilon_r = (c\,t/z)^2 = (300\cdot1/50)^2 = 36$. $\Gamma_L$ = ratio of the pulses = $\tfrac12$, so $R_L = 3Z_0$. Silence means $R_g = Z_0$, so $A = 30/2$.

        **Where points go.** $\epsilon_r = 6$ (forgot to square); $R_L = 50/3$ from inverting $\Gamma$ upside down; using the full line length (100 m) for the first arrival; $A = 30$ from forgetting the divider.
      `,
      figs: { bd4: { svg: TL.diagram(s4b, { tMax: 6, probe: 50 }), cap: 'Delta-pulse weights. The probe (dashed, z = 50 m) sees 15 V at 1 µs and 7.5 V at 3 µs; Γ_g = 0 ends the story.' } } }),

    // ---------------------------------------------------------------- Question 5
    RF(md`
      ### Part II, Question 5 (24 points): a shorted line

      A pulse generator with internal resistance $60\ \Omega$ outputs a voltage $f(t)$. It drives a lossless line with $Z_0 = 60\ \Omega$ and propagation speed $300$ m/µs, 300 m long. The load is a **short circuit**, $R_L = 0$.

      [[fig:sl]]
    `, { sl: { svg: shortedLineFig(), cap: 'One-way travel time: 300 m / (300 m/µs) = 1 µs.' } }),
    P({ src: 'Fall 2023 #5(a)–(b) · 4 pts', title: 'Steady state for a step',
      q: md`Let $f(t) = 240\,u(t)$. (a) (2 pts) What is the steady-state voltage at $z = 0$, in V? (b) (2 pts) What is the steady-state current at $z = 300$ m, in A?`,
      parts: [
        mc('(a) V at z = 0, in V', ['$-4$', '$0$', '$2$', '$4$', '$60$', '$120$', '$240$', 'none of these'], 1,
          [md`$-4$ is a current, with the wrong sign.`, null, md`2 is the current of the first wave alone, in A.`, md`4 is the steady current, in A, not a voltage.`, md`That is $240/4$: there is no divider that gives it. In DC the line is a wire to the short.`, md`That is the first wave, $\tau_gV_g$. Two microseconds later the short's reflection, $-120$ V, cancels it.`, md`That is the source's open-circuit voltage. The short pulls the line's voltage to zero.`, md`0 V is on the list.`]),
        mc('(b) I at z = 300 m, in A', ['$-4$', '$0$', '$2$', '$4$', '$60$', '$120$', '$240$', 'none of these'], 3,
          [md`Right size, wrong sign: the current flows from the source's + terminal along the top wire toward the load.`, md`A short carries current; it is an open that carries none.`, md`That is the first wave's current, $120/60$. The reflection off the short doubles it.`, null, md`That is a voltage-like number; current is $240/60$ A.`, md`That is a voltage.`, md`That is the source voltage.`, md`4 A is on the list.`]),
      ],
      hints: [md`In DC steady state the lossless line is just two wires. The circuit is the source, $R_g$ and the short.`],
      sol: md`
        **Step 1: what DC does to the line.** After all the bouncing has died out, nothing changes in time, so the line's series inductance is a short and its shunt capacitance an open: the line is two plain wires. The circuit is the source, $R_g = 60\ \Omega$, and a short.

        **(a)** The short is connected straight back to $z = 0$ through ideal wires, so
        $$V_{ss}(0) = 0\ \text{V}$$
        **(b)** The whole source voltage drops across $R_g$:
        $$I_{ss} = \frac{240}{60} = 4\ \text{A}$$
        the same at every $z$, including the short at 300 m.

        !!intuition Does this make sense?
          Check with the waves. $\tau_g = \tfrac12$, so 120 V and 2 A go out. The short reflects $\Gamma_L = -1$: $-120$ V, whose current is $-(-120)/60 = +2$ A. At $z = 0$ after 2 µs: $120 - 120 = 0$ V and $2 + 2 = 4$ A. The generator is matched ($\Gamma_g = 0$), so that is final ✓.

        **Speed path.** DC: line = wires. Short at the end: $V = 0$, $I = V_g/R_g$.

        **Where points go.** Answering 120 V (the first wave, not the final state); 2 A (forgetting that the reflected current adds).
      ` }),
    P({ src: 'Fall 2023 #5(c) · 20 pts', title: 'V and I at z = 0 for a 6 µs pulse',
      q: md`Now $f(t)$ is a 240 V rectangular pulse lasting 6 µs:

[[fig:pu]]

Sketch both the voltage and the current at $z = 0$ versus time, with numbers on both axes. Then read these values off your sketches.`,
      parts: [
        NT(md`$V(0, t)$ at $t = 1$ µs`, 120, 'V', [{ v: 240, msg: 'Only τ_g = 1/2 of the source is launched: the line looks like 60 Ω next to R_g = 60 Ω.' }]),
        mc(md`$V(0, t)$ for $2 < t < 6$ µs`, [md`$0$ V`, md`$120$ V`, md`$-120$ V`, md`$240$ V`], 0,
          [null, md`From $t = 2$ µs the short's reflection, $-120$ V, is back at $z = 0$ and adds to the $+120$ V still being launched.`, md`That is the reflection alone. The source is still launching $+120$ V until $t = 6$ µs.`, md`Never: the most the line holds here is 120 V.`]),
        NT(md`$V(0, t)$ at $t = 7$ µs`, -120, 'V', [{ v: 0, msg: 'The source stopped at 6 µs, but the reflection of the pulse’s last 2 µs is still arriving until 8 µs.' }, { v: 120, msg: 'The reflected wave is −120 V: a short reflects with Γ_L = −1.' }]),
        NT(md`$I(0, t)$ at $t = 1$ µs`, 2, 'A', [{ v: 4, msg: 'The reflection has not come back yet (it needs 2 µs). Only 120/60 = 2 A so far.' }]),
        NT(md`$I(0, t)$ at $t = 4$ µs`, 4, 'A', [{ v: 0, msg: 'The voltages cancel, but the currents add: the reflected wave’s current is −V⁻/Z₀ = +2 A.' }, { v: 2, msg: 'The reflected wave adds its own +2 A from t = 2 µs.' }]),
        NT(md`$I(0, t)$ at $t = 7$ µs`, 2, 'A', [{ v: -2, msg: 'The reflected −120 V wave carries +2 A, not −2 A: I⁻ = −V⁻/Z₀.' }, { v: 4, msg: 'The source stopped at 6 µs; only the reflection remains.' }]),
        NT(md`the time after which $V(0, t)$ and $I(0, t)$ stay zero`, 8, 'µs', [{ v: 6, msg: 'The source stops at 6 µs, but its last part is still on the line and returns until 8 µs.' }, { v: 12, msg: 'Γ_g = 0: nothing re-reflects at the generator. The tail of the reflection is back by 6 + 2 = 8 µs.' }]),
      ],
      hints: [md`$\tau_g = \tfrac12$, $\Gamma_g = 0$ (matched source), $\Gamma_L = -1$ (short). Round trip: 2 µs.`, md`A backward wave's current is $-V^-/Z_0$. Add the forward and backward waves at $z = 0$ separately for $V$ and for $I$.`],
      sol: md`
        **Step 1: the coefficients.**
        $$\tau_g = \frac{60}{60 + 60} = \frac12, \qquad \Gamma_g = \frac{60 - 60}{120} = 0, \qquad \Gamma_L = \frac{0 - 60}{0 + 60} = -1$$
        One way takes 1 µs, so a round trip takes 2 µs.

        **Step 2: the forward wave at $z = 0$.** While the source is on (0 to 6 µs) it launches
        $$V^+ = \tfrac12(240) = 120\ \text{V}, \qquad I^+ = \frac{120}{60} = 2\ \text{A}$$
        **Step 3: the backward wave at $z = 0$.** The short sends back $\Gamma_L V^+ = -120$ V. Its current is
        $$I^- = -\frac{V^-}{Z_0} = -\frac{-120}{60} = +2\ \text{A}$$
        It is the forward pulse, delayed by the round trip: present at $z = 0$ from 2 µs to 8 µs. Since $\Gamma_g = 0$, it is absorbed when it arrives; nothing more follows.

        **Step 4: add them, interval by interval.**

        | $t$ (µs) | forward | backward | $V(0, t)$ | $I(0, t)$ |
        |---|---|---|---|---|
        | 0 to 2 | on | not yet | 120 V | 2 A |
        | 2 to 6 | on | on | 0 V | 4 A |
        | 6 to 8 | off | on | $-120$ V | 2 A |
        | after 8 | off | off | 0 V | 0 A |

        [[fig:v5]]

        [[fig:i5]]

        !!intuition Does this make sense?
          While the source is on and the reflection is back (2 to 6 µs), the input looks like the short itself: 0 V and 4 A, the DC answer of parts (a) and (b). The pulse's last two microseconds are still on the line when the source stops; they come back as the $-120$ V tail.

        **Speed path.** Write the forward pulse (120 V, 2 A, from 0 to 6) and the backward pulse (−120 V, +2 A, from 2 to 8) and add.

        **Where points go.** Giving the reflected current the sign of its voltage (then $I$ would be 0 from 2 to 6 µs); stopping everything at 6 µs; drawing re-reflections from a matched source; not labeling the scale boxes.
      `,
      figs: {
        pu: { svg: pulseFig(), cap: 'f(t): 240 V from t = 0 to t = 6 µs.' },
        v5: { svg: TL.plotT(s5, 0, { tMax: 11, input: rect6, xt: [[2, '2'], [6, '6'], [8, '8']], yt: [[120, '120'], [-120, '-120']] }), cap: 'V(0, t) in volts.' },
        i5: { svg: TL.plotT(s5, 0, { qty: 'I', tMax: 11, input: rect6, xt: [[2, '2'], [6, '6'], [8, '8']], yt: [[2, '2'], [4, '4']] }), cap: 'I(0, t) in amperes.' },
      } }),

    // ---------------------------------------------------------------- Question 6
    R(md`
      ### Part II, Question 6 (10 points): a wave going down into water

      A uniform plane wave travels downward in water with the electric field phasor
      $$\Et = \hat x\,5\,e^{-0.2z}e^{-j0.2z}\ \ \text{V/m}$$
      where $\hat z$ points down and $z = 0$ is the water surface. Use $\eta$ for the water's intrinsic impedance.
    `),
    P({ src: 'Fall 2023 #6(a) · 5 pts', title: 'Time-averaged power versus depth',
      q: md`Find the time-averaged power density $\langle\mathbf S\rangle$ as a function of depth.`,
      parts: [
        { lbl: md`$\langle S_z\rangle$ in W/m² (use eta for $|\eta|$, and z)`, expr: '25*exp(-0.4*z)/(2*sqrt(2)*eta)', vars: { eta: [10, 400], z: [0, 5] } },
        mc('direction of ⟨S⟩', [md`$+\hat z$ (down)`, md`$-\hat z$ (up)`, md`$\hat x$`, md`$\hat y$`], 0,
          [null, md`The phase $e^{-j0.2z}$ means travel toward $+z$, which is down; power flows with the wave.`, md`$\hat x$ is the direction of $\mathbf E$. Power flows along $\mathbf E\times\mathbf H$, the travel.`, md`$\hat y$ is the direction of $\mathbf H$.`]),
      ],
      hints: [md`$\gamma = 0.2 + j0.2$ has angle $45°$, and $\eta\gamma = j\omega\mu$ has angle $90°$, so $\eta = |\eta|e^{j45°}$.`, md`$\langle\mathbf S\rangle = \frac12\Re\{\Et\times\Ht^*\}$ with $\Ht = \frac1\eta\hat z\times\Et$.`],
      sol: md`
        **Step 1: read γ.** $\Et \propto e^{-\gamma z}$ with $\gamma = \alpha + j\beta$, so $\alpha = 0.2$ Np/m and $\beta = 0.2$ rad/m:
        $$\gamma = 0.2 + j0.2 = 0.2\sqrt2\,e^{j45°}$$
        **Step 2: the angle of η.** From $\eta\gamma = j\omega\mu$ (angle $90°$ for a real $\mu$), the two angles add to $90°$:
        $$\tau = 90° - 45° = 45°, \qquad \eta = |\eta|e^{j45°}$$
        **Step 3: H.** The wave travels toward $+\hat z$, and $\hat z\times\hat x = \hat y$:
        $$\Ht = \frac1\eta\hat z\times\Et = \hat y\,\frac{5}{\eta}\,e^{-\gamma z}$$
        **Step 4: the conjugate.** Conjugate everything: $e^{-\gamma z}$ becomes $e^{-0.2z}e^{+j0.2z}$, and $1/\eta$ becomes $1/\eta^* = e^{j45°}/|\eta|$:
        $$\Ht^* = \hat y\,\frac{5}{|\eta|}\,e^{j45°}\,e^{-0.2z}e^{j0.2z}$$
        **Step 5: multiply.** $\hat x\times\hat y = \hat z$, the two $e^{\mp j0.2z}$ cancel, and the two $e^{-0.2z}$ make $e^{-0.4z}$:
        $$\Et\times\Ht^* = \hat z\,\frac{25}{|\eta|}\,e^{j45°}\,e^{-0.4z}$$
        **Step 6: half the real part.** $\Re\{e^{j45°}\} = \cos45° = 1/\sqrt2$:
        $$\boxed{\langle\mathbf S\rangle = \hat z\,\frac{25}{2\sqrt2\,|\eta|}\,e^{-0.4z}\ \ \text{W/m}^2}$$
        !!mistake The posted key
          Its second line writes $\Ht^*$ with $5/\eta$ where $5/\eta^*$ belongs; its third line has the right $e^{+j\tau}/|\eta|$, and the final answer is right. It also justifies $\tau = 45°$ by "good conductors"; you do not need to know what water is: $\alpha = \beta$ already says the angle of $\gamma$ is $45°$, so $\tau = 45°$.

        **Speed path.** $|\langle S\rangle| = \dfrac{|E|^2}{2|\eta|}\cos\tau$ with $|E|^2 = 25e^{-0.4z}$ and $\tau = 90° - \angle\gamma = 45°$.

        **Where points go.** Dropping $\cos\tau$ (no $\sqrt2$); $e^{-0.2z}$ instead of $e^{-0.4z}$ (the power decays twice as fast as the field); direction $-\hat z$ from reading "downward" against the axis.
      ` }),
    P({ src: 'Fall 2023 #6(b) · 5 pts', title: 'Attenuation rate for power',
      q: md`Determine the attenuation rate of the power: per meter (as an exponent) and in dB per meter.`,
      parts: [
        NT(md`power attenuation constant (the $k$ in $e^{-kz}$)`, 0.4, '1/m', [{ v: 0.2, msg: 'That is α, the field’s rate. Power goes as |E|², so its exponent is 2α.' }]),
        NT(md`attenuation rate of power`, 10 * Math.log10(Math.exp(0.4)), 'dB/m', [{ v: 10 * Math.log10(Math.exp(0.2)), msg: 'That uses e^{−0.2z}: the field’s decay inside a 10 log. Power decays as e^{−0.4z}.' }, { v: 20 * Math.log10(Math.exp(0.4)), msg: 'That is 20 log of a power ratio. Power ratios take 10 log (or field ratios 20 log): 20 log₁₀(e^{0.2}) = 1.74.' }]),
      ],
      hints: [md`$\langle S\rangle \propto e^{-0.4z}$. In decibels, the loss over one meter is $10\log_{10}\dfrac{S(z)}{S(z + 1)}$.`, md`$\log_{10}e \approx 0.434$.`],
      sol: md`
        **Step 1: the exponent.** From (a), $\langle S\rangle = S_0e^{-0.4z}$. So the power attenuation constant is $2\alpha = 0.4$ m⁻¹ (0.4 Np/m of power).

        **Step 2: decibels.** The loss in dB over a depth $z$ is
        $$10\log_{10}\frac{S_0}{S_0e^{-0.4z}} = 10\log_{10}e^{0.4z}$$
        A log of a power of $e$ pulls the exponent out:
        $$10\log_{10}e^{0.4z} = 4z\log_{10}e$$
        With $\log_{10}e \approx 0.434$:
        $$\boxed{4(0.434) \approx 1.74\ \text{dB/m}}$$
        !!intuition Does this make sense?
          The handy conversion: 1 Np of **field** is $20\log_{10}e = 8.686$ dB. The field decays at $\alpha = 0.2$ Np/m, so $0.2\times8.686 = 1.74$ dB/m. Field and power give the same dB number, because dB already accounts for the square.

        **Speed path.** $\alpha$ in Np/m times 8.686 is dB/m: $0.2\times8.686 \approx 1.74$.

        **Where points go.** 0.87 dB/m (used $\alpha$ inside a 10 log); 3.47 dB/m (20 log of a power ratio); answering 0.4 alone when the dB rate is asked too.
      ` }),

    // ---------------------------------------------------------------- Question 7
    R(md`
      ### Part II, Question 7 (16 points): resonances of a line

      A lossless transmission line of length $l = 1000$ m has wave speed $v = 1\times10^8$ m/s and supports resonant oscillations. In a cosinusoidal steady state, the current phasor at the input ($d = l$, a distance $l$ from the load) is measured to be $\tilde I_{in} = 0$, and the voltage phasor at the load is $\tilde V_L = 0$.
    `),
    P({ src: 'Fall 2023 #7(a) · 4 pts', title: 'Z_in and Z_L',
      q: md`What are the input impedance $Z_{in}$ at $d = l$ and the load impedance $Z_L$ for these resonances?`,
      parts: [
        mc('Z_in', [md`$\infty$ (an open circuit)`, md`$0$ (a short circuit)`, md`$Z_0$`, md`it cannot be found without $Z_0$`], 0,
          [null, md`That needs $\tilde V_{in} = 0$. Here the current is zero at the input.`, md`That is a matched line, with no standing wave and no resonance.`, md`$Z_{in} = \tilde V_{in}/\tilde I_{in}$ with $\tilde I_{in} = 0$: no $Z_0$ needed.`]),
        mc('Z_L', [md`$0$ (a short circuit)`, md`$\infty$ (an open circuit)`, md`$Z_0$`, md`$jZ_0$`], 0,
          [null, md`An open has zero **current**. Here the load has zero voltage.`, md`A matched load has no reflection, so no standing wave.`, md`A reactance $jZ_0$ would have nonzero voltage across it whenever current flows.`]),
      ],
      sol: md`
        **Step 1: impedance is voltage over current.** At the input, $\tilde I_{in} = 0$ with $\tilde V_{in} \ne 0$ (otherwise nothing oscillates):
        $$Z_{in} = \frac{\tilde V_{in}}{\tilde I_{in}} = \infty$$
        an open circuit. At the load, $\tilde V_L = 0$ with current flowing:
        $$Z_L = \frac{\tilde V_L}{\tilde I_L} = 0$$
        a short.

        **Speed path.** Zero current: open. Zero voltage: short.

        **Where points go.** Swapping the two.
      ` }),
    P({ src: 'Fall 2023 #7(b) · 9 pts', title: 'The two lowest resonances',
      q: md`Find the two lowest resonant frequencies $\omega$ and choose the graph (A to L) of $\tilde V$ and of $\tilde I$ versus $d$ for each.

[[fig:g7]]`,
      parts: [
        NT(md`(i) the lowest resonance $\omega_1$`, 5 * PI * 1e4, 'rad/s', [{ v: 2.5e4, msg: 'That is f₁ in Hz. The question asks for ω = 2πf.' }, { v: PI * 1e5, msg: 'That is a half-wave resonance (λ = 2l). A short at one end and an open at the other make a quarter wave: λ = 4l.' }, { v: 2 * PI * 1e5, msg: 'That makes the line a full wavelength. The lowest resonance is a quarter wave.' }]),
        pick7(md`(i) $\tilde V$ at $\omega_1$`, 'A', 'At ω₁ the line is a quarter wave, and Ṽ must be zero at the load (the short).'),
        pick7(md`(i) $\tilde I$ at $\omega_1$`, 'B', 'At ω₁ the line is a quarter wave, and Ĩ must be zero at the input (the open) and largest at the short.'),
        NT(md`(ii) the second resonance $\omega_2$`, 1.5 * PI * 1e5, 'rad/s', [{ v: 7.5e4, msg: 'That is f₂ in Hz. ω = 2πf.' }, { v: PI * 1e5, msg: 'That is λ = 2l, a half wave. The resonances of a short-to-open line are odd quarter waves: l = λ/4, 3λ/4, …' }, { v: 2 * PI * 1e5, msg: 'That is l = λ. The next resonance after a quarter wave is three quarters: l = 3λ/4.' }]),
        pick7(md`(ii) $\tilde V$ at $\omega_2$`, 'E', 'At ω₂ the line is three quarter waves, and Ṽ must be zero at the load.'),
        pick7(md`(ii) $\tilde I$ at $\omega_2$`, 'F', 'At ω₂ the line is three quarter waves, and Ĩ must be zero at the input and largest at the load.'),
      ],
      hints: [md`With a short load, $\tilde V(d) \propto \sin\beta d$ and $\tilde I(d) \propto \cos\beta d$.`, md`$\tilde I(l) = 0$ means $\cos\beta l = 0$: $\beta l = \pi/2, 3\pi/2, \ldots$, so $l = \lambda/4, 3\lambda/4, \ldots$`],
      sol: md`
        **Step 1: the standing wave on a shorted line.** With $d$ measured back from the load, the phasors are
        $$\tilde V(d) = V^+e^{j\beta d}\left(1 + \Gamma_Le^{-j2\beta d}\right)$$
        $$\tilde I(d) = \frac{V^+}{Z_0}e^{j\beta d}\left(1 - \Gamma_Le^{-j2\beta d}\right)$$
        A short has $\Gamma_L = -1$. Multiply in the $e^{j\beta d}$:
        $$\tilde V(d) = V^+\left(e^{j\beta d} - e^{-j\beta d}\right) = 2jV^+\sin\beta d$$
        $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} + e^{-j\beta d}\right) = \frac{2V^+}{Z_0}\cos\beta d$$
        **Step 2: the resonance condition.** $\tilde I = 0$ at the input $d = l$:
        $$\cos\beta l = 0 \quad\Rightarrow\quad \beta l = \frac\pi2,\ \frac{3\pi}2,\ \ldots$$
        With $\beta = 2\pi/\lambda$: $l = \lambda/4$, $3\lambda/4$, … The line is an odd number of quarter waves.

        **Step 3: (i) the lowest.** $\lambda_1 = 4l = 4000$ m, and $\omega = 2\pi f = 2\pi v/\lambda$:
        $$\omega_1 = \frac{2\pi(10^8)}{4000} = 5\pi\times10^4\ \text{rad/s}$$
        about $1.57\times10^5$ rad/s ($f_1 = 25$ kHz). Along the line, $\sin(\beta d)$ rises from 0 at the load to its peak at the input: **$\tilde V$ is graph A**. $\cos(\beta d)$ falls from its peak at the load to 0 at the input: **$\tilde I$ is graph B**.

        **Step 4: (ii) the second.** $l = 3\lambda_2/4$, so $\lambda_2 = 4l/3 \approx 1333$ m:
        $$\omega_2 = 3\omega_1 = 1.5\pi\times10^5\ \text{rad/s}$$
        about $4.71\times10^5$ rad/s. Now $\beta l = 3\pi/2$: $\tilde V$ is zero at the load, swings through one and a half loops, and is at a peak at the input: **graph E** (it is drawn as $-\sin\beta d$, which is the same standing wave; the overall sign of a phasor is just a phase). $\tilde I$ is at a peak at the load and zero at the input: **graph F** ($-\cos\beta d$).

        [[fig:r1]]

        [[fig:r2]]

        !!intuition Does this make sense?
          A short forces $V = 0$ and allows the most current; an open forces $I = 0$ and allows the most voltage. Between a short and an open the shortest fitting standing wave is a quarter wave; the next one adds half a wave, so the resonances are $\omega_1$, $3\omega_1$, $5\omega_1$, …

        **Speed path.** Short at one end, open at the other: $l = (2n - 1)\lambda/4$, so $\omega_n = (2n - 1)\dfrac{\pi v}{2l} = (2n - 1)\cdot5\pi\times10^4$. Graphs: $V$ starts at 0 on the right (the load), $I$ ends at 0 on the left (the input); count quarter waves.

        **Where points go.** Half-wave resonances ($\pi\times10^5$) from treating both ends alike; giving $f$ for $\omega$; reading the graphs with $d$ increasing to the right (the paper's $d$ increases to the left).
      `,
      figs: { g7: { svg: graphsFig(), cap: 'In every graph d runs from l (the input) on the left to 0 (the load) on the right.' }, r1: { svg: resPlot(1), cap: 'Lowest resonance: a quarter wave. V (solid) is zero at the load; I (dashed) is zero at the input.' }, r2: { svg: resPlot(3), cap: 'Second resonance: three quarter waves.' } } }),
    P({ src: 'Fall 2023 #7(c) · 3 pts', title: 'Where the line looks like a short',
      q: md`At the second resonance, what is the shortest distance from the load (other than the load itself) at which the voltage is zero, so that the line there acts as a short-circuit input? Give $d$ in units of $\lambda$.`,
      parts: [
        NT(md`$d/\lambda$`, 0.5, '', [{ v: 0.25, msg: 'At λ/4 the voltage is at its peak and the current is zero: an open, not a short.' }, { v: 2 / 3, msg: 'That is d in units of l (666.7 m = 2l/3). In units of λ it is λ/2.' }, { v: 0.75, msg: 'That is the input (d = l = 3λ/4), where the current is zero: an open.' }]),
      ],
      hints: [md`$\tilde V(d) \propto \sin\beta d$. Its first zero after $d = 0$ is at $\beta d = \pi$.`],
      sol: md`
        **Step 1.** $\tilde V(d) \propto \sin\beta d$ is zero where $\beta d = 0, \pi, 2\pi, \ldots$ The first one after the load:
        $$\beta d = \pi \quad\Rightarrow\quad d = \frac{\pi}{2\pi/\lambda} = \frac\lambda2$$
        $$\boxed{d = 0.5\,\lambda}$$
        At the second resonance $\lambda = 4000/3$ m, so this is $d \approx 667$ m, inside the 1000 m line ✓. There $Z(d) = 0$: a short circuit, repeated every half wavelength.

        **Speed path.** Impedances repeat every $\lambda/2$: the short at the load reappears at $\lambda/2$.

        **Where points go.** $\lambda/4$ (that is where it looks open); giving $d$ in meters or in units of $l$.
      ` }),
  ];

  EM.lesson('e3-past', { id: 'e3-past-fa23', order: 2, title: 'Fall 2023 Exam 3', kind: 'exam', sub: 'Goddard, Ilie, Zhao · 7 questions, 100 pts · polarization, three-line junctions, a scope trace read backward, a shorted line, power in water, resonances', steps: fa23 });
})();

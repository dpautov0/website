/* Exam 3 practice exams D, E, F (unit e3-prac), in Prof. Chen's Spring 2024 format: four problems cut into short parts,
   clean numbers that work without a calculator, multiple-choice parts that make you judge statements, one trap part.
     e3-prac-d: an imperfect dielectric (alpha, beta, eta, dB); two current sheets designed for RHCP (what goes toward -z);
                V(d), Gamma(d), VSWR and where the maxima sit; a three-section line driven by a step.
                Trap: alpha does not change when the frequency doubles.
     e3-prac-e: a good conductor (skin depth at two frequencies, surface resistance, absorbed power); a standing wave in
                front of a perfect conductor (nodes, energy, <S> = 0, probes, pressure); a parallel-plate line from its
                fields; a pulse on an open line. Trap: four times the frequency doubles the absorbed power.
     e3-prac-f: phasor Maxwell (H from E by Faraday, epsilon from Ampere, <S>, hand); a wave onto a good conductor
                (Gamma = -1 plus a small correction); half- and quarter-wave sections in cascade; Rg = 0 with an open
                end (never settles) and a shorted end (settles). Trap: the open line driven by an ideal source.
   Every number was recomputed in Python (work-pracB/verify.py); every bounce value comes from TL.valueAt and was
   checked against hand values (work-pracB/bounce.js). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;

  // ---------------------------------------------------------------- helpers
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  const trap = (part, list) => Object.assign(part, { traps: list.map(([v, msg]) => ({ v, msg })) });
  const plot = (o) => PF.plot(Object.assign({ w: 360, h: 200 }, o));
  const pulse1 = (t) => (t >= 0 && t < 1 ? 1 : 0);

  // a resistor zigzag along the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 26) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // A line circuit on two rails, left to right.
  //   { t: 'gen', R, V, ac }        source with series resistor R (R: null for an ideal source)
  //   { t: 'line', w, lab, sub }    a line section (thick rails)
  //   { t: 'load', kind: 'R' | 'Z' | 'open' | 'short', lab }
  // o.axis = { dir: 'z' | 'd', ticks: [[boundary index, 'TeX', fraction into the next item]] }
  function lineFig(items, o = {}) {
    const g = PF.fig({ alt: o.alt });
    const T = 30, B = 112, M = (T + B) / 2;
    let x = 60;
    const at = [];
    for (const it of items) {
      at.push(x);
      if (it.t === 'gen') {
        g.line(x, T, x, M - 13); g.circle(x, M, 13); g.line(x, M + 13, x, B);
        if (it.ac) g.label(x, M, '\\sim', 'c', 'small');
        else g.add(`<path class="glyph" d="M${x - 3.5},${M - 6}H${x + 3.5}M${x},${M - 9.5}V${M - 2.5}M${x - 3.5},${M + 6}H${x + 3.5}"/>`);
        g.label(x - 18, M, it.V, 'r', 'small');
        if (it.R) { zig(g, x, T, x + 48, T, 24); g.label(x + 24, T - 9, it.R, 'b', 'small'); } else g.line(x, T, x + 48, T);
        g.line(x, B, x + 48, B);
        x += 48;
      } else if (it.t === 'line') {
        g.line(x + 2, T, x + it.w - 2, T, { cls: 'thick' }); g.line(x + 2, B, x + it.w - 2, B, { cls: 'thick' });
        g.line(x, T, x + it.w, T); g.line(x, B, x + it.w, B);
        if (it.lab) g.label(x + it.w / 2, M - 13, it.lab, 'c', 'small');
        if (it.sub) g.label(x + it.w / 2, M + 13, it.sub, 'c', 'small');
        x += it.w;
      } else if (it.t === 'load') {
        const xl = x + 22;
        if (it.kind === 'open') {
          g.line(x, T, x + 12, T); g.line(x, B, x + 12, B);
          g.circle(x + 15, T, 3, { cls: 'bgfill' }); g.circle(x + 15, B, 3, { cls: 'bgfill' });
          g.label(x + 12, M, it.lab || '\\text{open}', 'l', 'small');
        } else {
          g.line(x, T, xl, T); g.line(x, B, xl, B);
          if (it.kind === 'short') g.line(xl, T, xl, B, { cls: 'thick' });
          else if (it.kind === 'Z') { g.line(xl, T, xl, M - 18); g.rect(xl - 9, M - 18, 18, 36); g.line(xl, M + 18, xl, B); }
          else zig(g, xl, T, xl, B, 34);
          if (it.lab) g.label(xl + 14, M, it.lab, 'l', 'small');
        }
        x = xl;
      }
    }
    at.push(x);
    // dashed marks where two line sections meet
    for (let k = 1; k < items.length; k++) if (items[k].t === 'line' && items[k - 1].t === 'line') g.line(at[k], T - 7, at[k], B + 7, { cls: 'dim dash' });
    if (o.axis) {
      const y = B + 26, pos = ([k, , fr = 0]) => at[k] + fr * ((at[k + 1] ?? at[k]) - at[k]);
      const xs = o.axis.ticks.map(pos);
      const lo = Math.min(...xs), hi = Math.max(...xs);
      if (o.axis.dir === 'd') { g.line(lo - 22, y, hi + 4, y, { cls: 'axisl' }); g.head(lo - 22, y, -1, 0, { hs: 6 }); g.label(lo - 26, y, 'd', 'r', 'small accent'); }
      else { g.line(lo - 4, y, hi + 22, y, { cls: 'axisl', arrow: 'end', hs: 6 }); g.label(hi + 26, y, 'z\\,(\\text{m})', 'l', 'small accent'); }
      o.axis.ticks.forEach((t, i) => { g.line(xs[i], y - 4, xs[i], y + 4, { cls: 'dim' }); g.label(xs[i], y + 7, t[1], 't', 'small'); });
    }
    return g.svg();
  }

  // the header every paper shares
  const RULES = md`**75 minutes, 100 points, four problems.** Closed book, **no calculator**. You may use the official [formula sheet](#/l/e3-sheet) and one 4″×6″ card of your own handwritten notes. Show your reasoning, box each answer, and give its units.`;
  const HOWTO = md`**How to use this paper.** Set a 75-minute timer and work it on paper first, as if it were Monday night. Then type your answers into the boxes; a wrong number that matches a common slip tells you which slip. Open a hint only for a part you could not start. Read every worked solution, including the parts you got right: each one gives the full working step by step, then a **speed path** (the fastest correct route on the exam) and **where points go** (the slips that cost points on this kind of part). The next day, redo every part you missed on a blank sheet.`;
  const CONSTS = md`**Constants.** $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$. Answers within about 2% count. You can type <code>pi</code> for $\pi$ and arithmetic like <code>5/pi</code>.`;

  // ======================================================================================== EXAM D: figures
  function figD1() {
    const g = PF.fig({ alt: 'side view: a source sheet in the plane z = 0, drawn as a dashed vertical line; the material fills the space to its right; a wave travels toward +z with E along x (up); its dashed envelope shrinks with z' });
    const x0 = 60, y0 = 112, sx = 66, A = 58;
    g.arrow(24, y0, 352, y0, { cls: 'dim', hs: 7 }); g.label(356, y0, 'z', 'l', 'small accent');
    g.arrow(x0, y0 + 74, x0, y0 - 86, { cls: 'dim', hs: 7 }); g.label(x0 + 8, y0 - 80, 'x', 'l', 'small accent');
    g.line(x0, y0 - 72, x0, y0 + 66, { cls: 'thick dash' });
    g.label(x0 - 6, y0 + 60, '\\text{source}', 'r', 'small');
    const w = [], up = [], dn = [];
    for (let i = 0; i <= 240; i++) {
      const z = 4.3 * i / 240, e = Math.exp(-0.42 * z);
      w.push([x0 + sx * z, y0 - A * e * Math.cos(2 * PI * z)]); up.push([x0 + sx * z, y0 - A * e]); dn.push([x0 + sx * z, y0 + A * e]);
    }
    g.pl(w, { cls: 'curve' }); g.pl(up, { cls: 'dash dim nodecl' }); g.pl(dn, { cls: 'dash dim nodecl' });
    g.label(250, 36, '\\mu_0,\\ \\epsilon = 9\\epsilon_0,\\ \\sigma = \\tfrac{1}{40\\pi}\\,\\text{S/m}', 'c', 'small');
    g.arrow(250, 160, 320, 160, { hs: 7 }); g.label(246, 160, '\\text{travel}', 'r', 'small');
    return g.svg();
  }
  function sheetsFig(spaced) {
    const g = PF.fig({ alt: spaced
      ? 'design B: sheet 1 in the plane z = 0 carries current along +x (an arrow up); sheet 2 in the plane z = d = 0.125 m carries current along y (out of the page, a dot in a circle)'
      : 'design A: one plane z = 0 carries both currents: sheet 1 along +x (an arrow up) and sheet 2 along y (out of the page, a dot in a circle)' });
    const y0 = 112, xa = 80, xb = spaced ? 170 : 80;
    g.arrow(24, y0, 262, y0, { cls: 'dim', hs: 7 }); g.label(266, y0, 'z', 'l', 'small accent');
    g.line(xa, 34, xa, 182, { cls: 'thick dash' });
    if (spaced) g.line(xb, 34, xb, 182, { cls: 'thick dash' });
    g.arrow(xa - 14, 168, xa - 14, 128, { hs: 7 }); g.label(xa - 20, 150, '\\tilde{\\mathbf J}_{s1}', 'r', 'small');
    g.odot(xb + 16, 64, 6); g.label(xb + 27, 64, '\\tilde{\\mathbf J}_{s2}', 'l', 'small');
    g.label(xa, 188, 'z = 0', 't', 'small');
    if (spaced) g.label(xb, 188, 'z = d', 't', 'small');
    // the axes key: x up, y out of the page
    g.arrow(232, 70, 232, 40, { hs: 6 }); g.label(238, 42, 'x', 'l', 'small accent');
    g.odot(232, 82, 5); g.label(241, 84, 'y', 'l', 'small accent');
    return g.svg();
  }
  const figD3 = () => lineFig([
    { t: 'gen', R: 'Z_g = 50\\,\\Omega', V: '\\tilde F = 20\\,\\text{V}', ac: true },
    { t: 'line', w: 230, lab: 'Z_0 = 50\\,\\Omega', sub: 'l = 3\\,\\text{m}' },
    { t: 'load', kind: 'Z', lab: 'Z_L = 30 + j40\\,\\Omega' },
  ], { alt: 'a generator with open-circuit voltage 20 V and internal impedance 50 ohms drives a 3 m line of 50 ohms that ends in the load 30 + j40 ohms; the distance d is measured back from the load', axis: { dir: 'd', ticks: [[1, 'd = l'], [2, 'd = 0']] } });
  const figD4 = () => lineFig([
    { t: 'gen', R: '50\\,\\Omega', V: '80u(t)' },
    { t: 'line', w: 92, lab: '50\\,\\Omega', sub: '\\text{line 1}' },
    { t: 'line', w: 92, lab: '150\\,\\Omega', sub: '\\text{line 2}' },
    { t: 'line', w: 92, lab: '450\\,\\Omega', sub: '\\text{line 3}' },
    { t: 'load', kind: 'R', lab: '450\\,\\Omega' },
  ], { alt: 'a step source 80 u(t) volts with Rg = 50 ohms drives three lines in cascade, 50, 150 and 450 ohms, each 200 m long, ending in RL = 450 ohms; the z axis marks 0, 200, 400 and 600 m and the probe point at 300 m', axis: { dir: 'z', ticks: [[1, '0'], [2, '200'], [2, '300', 0.5], [3, '400'], [4, '600']] } });
  const sD4 = TL.solve({ Vg: 80, Rg: 50, RL: 450, sections: [{ Z0: 50, len: 200, v: 200 }, { Z0: 150, len: 200, v: 200 }, { Z0: 450, len: 200, v: 200 }], tMax: 12 });
  const figD3V = () => plot({
    w: 380, h: 210, x: [0, 3.15], y: [0, 17.5], xl: 'd\\,(\\text{m})', yl: '|\\tilde V(d)|\\ (\\text{V})',
    xt: [[0.25, '0.25'], [0.75, '0.75'], [1.25, '1.25'], [1.75, '1.75'], [2.25, '2.25'], [2.75, '2.75']], yt: [[5, '5'], [15, '15']],
    curves: [{ f: (d) => 10 * Math.hypot(1 + 0.5 * Math.cos(PI / 2 - 2 * PI * d), 0.5 * Math.sin(PI / 2 - 2 * PI * d)), n: 400 }],
  });

  // ======================================================================================== EXAM D
  const examD = [
    R(md`
      ${RULES}

      ${HOWTO}

      ${CONSTS}

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | A wave in an imperfect dielectric: loss tangent, $\alpha$, $\beta$, $\eta$, power in dB | 22 |
      | 2 | Two current sheets designed for circular polarization, and what goes the other way | 24 |
      | 3 | A phasor line: $\Gamma_L$, VSWR, where the maxima sit, $Z(d)$, power to the load | 24 |
      | 4 | Three lines in cascade driven by a step: bounce diagram, $V(z,t)$, steady state | 30 |

      **Draws on:** [imperfect dielectrics](#/l/w2-limits), [power in lossy media](#/l/w2-loss), [polarization](#/l/w3-pol), [current-sheet antennas](#/l/w3-antenna), [V(d), Γ(d) and VSWR](#/l/w6-vd), [bounce diagrams](#/l/w5-bounce) and [junctions](#/l/w5-multi).
    `),

    // ---------------------------------------------------------------- D Problem 1
    RF(md`
      ### Problem 1 (22 points): a wave in an imperfect dielectric

      A uniform plane wave at $f = 100$ MHz travels toward $+z$ through a material with $\mu = \mu_0$, $\epsilon = 9\epsilon_0$ and $\sigma = \dfrac{1}{40\pi}$ S/m $\approx 7.96$ mS/m. A current sheet at $z = 0$ launches it, and at $z = 0$ its electric field is
      $$\mathbf E(0,t) = 20\cos(\omega t)\,\hat x\ \ \text{V/m}$$
      Use $10\log_{10}e \approx 4.34$ and $\ln 2 \approx 0.693$ where you need them.

      [[fig:d1]]
    `, { d1: { svg: figD1(), cap: 'Not to scale. The material fills all of space; the wave leaves the source sheet toward +z and shrinks as it goes.' } }),
    P({ src: 'Practice D #1(a) · 4 pts', title: 'The loss tangent',
      q: md`**(a) (4 pts)** Find the loss tangent $\sigma/\omega\epsilon$ at this frequency. Which column of the formula sheet does it put you in?`,
      parts: [
        trap(N(md`$\sigma/\omega\epsilon$`, 1 / (2 * PI), ''), [[9 / (2 * PI), md`That uses $\epsilon_0$ in place of $\epsilon = 9\epsilon_0$: the loss tangent uses the material's own permittivity.`], [1, md`That uses $f$ in place of $\omega = 2\pi f$.`]]),
        mc('The material is', [md`an imperfect dielectric: $\sigma/\omega\epsilon \ll 1$`, md`a good conductor: $\sigma/\omega\epsilon \gg 1$`, md`a perfect dielectric: $\sigma = 0$`, md`in between: only the exact formulas work`], 0,
          [null, md`A good conductor needs the conduction current to be much larger than the displacement current. Here it is about one sixth of it.`, md`$\sigma$ is small but not zero, so the wave does decay: that is the whole point of this problem.`, md`A ratio of 0.16 is small enough: the approximations' error goes as the square of the ratio, $(0.16)^2/8 \approx 0.3\%$.`]),
      ],
      hints: [md`$\omega\epsilon_0 = 2\pi f\cdot\dfrac{10^{-9}}{36\pi} = \dfrac{f}{18\times10^9}$ S/m. At 100 MHz that is $\tfrac{1}{180}$ S/m. Multiply by $\epsilon_r$.`],
      sol: md`
        **1. What the ratio means.** $\sigma/\omega\epsilon$ is the size of the conduction current $\sigma E$ divided by the size of the displacement current $\omega\epsilon E$ ([Topic 5](#/l/w2-gamma)). It decides which column of the formula sheet you may use.

        **2. The displacement part.** First $\omega$:
        $$\omega = 2\pi f = 2\pi\times10^8\ \text{rad/s}$$
        Then $\omega\epsilon$, with $\epsilon = 9\epsilon_0$ and $\epsilon_0 = \frac{10^{-9}}{36\pi}$:
        $$\omega\epsilon = (2\pi\times10^8)(9)\frac{10^{-9}}{36\pi}$$
        The $\pi$ cancels, and $2\times9/36 = \tfrac12$:
        $$\omega\epsilon = \tfrac12\times10^{-1} = 0.05\ \text{S/m}$$
        **3. The ratio.** Divide $\sigma$ by it:
        $$\frac{\sigma}{\omega\epsilon} = \frac{1/(40\pi)}{1/20} = \frac{20}{40\pi}$$
        $$\boxed{\frac{\sigma}{\omega\epsilon} = \frac{1}{2\pi} \approx 0.16}$$
        The conduction current is about one sixth of the displacement current. That is small compared with 1, so this is an **imperfect dielectric**, and the "$1 \gg \sigma/\omega\epsilon$" column of the sheet applies.

        !!intuition Does this make sense?
          Units: S/m over S/m, a pure number ✓. The approximate formulas leave out terms of order $(\sigma/\omega\epsilon)^2/8 \approx 0.3\%$, far below the 2% the exam cares about.

        **Speed path.** Carry $\omega\epsilon_0 = \tfrac{1}{180}$ S/m at 100 MHz on your card (it scales with $f$). Times $\epsilon_r = 9$ gives $\tfrac{1}{20}$. Then $\sigma\times20 = \tfrac{1}{2\pi}$.

        **Where points go.** Using $\epsilon_0$ instead of $9\epsilon_0$ (you get $9/2\pi \approx 1.4$ and the wrong column). Using $f$ instead of $\omega$ (you get exactly 1).
      ` }),
    P({ src: 'Practice D #1(b) · 4 pts', title: 'α and β',
      q: md`**(b) (4 pts)** Find the attenuation constant $\alpha$ and the phase constant $\beta$.`,
      parts: [
        trap(N('\\alpha', 0.5, 'Np/m'), [[1, md`That drops the $\tfrac12$: $\alpha \approx \tfrac{\sigma}{2}\sqrt{\mu/\epsilon}$.`], [1.5, md`That uses $\eta_0 = 120\pi$. The material's lossless impedance is $\sqrt{\mu/\epsilon} = 120\pi/3 = 40\pi$.`]]),
        trap(N('\\beta', 2 * PI, 'rad/m'), [[2 * PI / 3, md`That is $\omega/c$, the free-space value. The wave is slower here: $v = c/\sqrt{\epsilon_r} = c/3$.`], [6 * PI, md`That uses $\epsilon_r = 9$ where $\sqrt{\epsilon_r} = 3$ belongs.`]]),
      ],
      hints: [md`Lossless pieces first: $v = c/\sqrt{\epsilon_r}$ and $\sqrt{\mu/\epsilon} = \eta_0/\sqrt{\epsilon_r}$. The sheet's imperfect-dielectric column: $\beta \approx \omega\sqrt{\mu\epsilon}$ and $\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon}$.`],
      sol: md`
        **1. The lossless pieces.** Without loss the speed would be
        $$v = \frac{c}{\sqrt{\epsilon_r}} = \frac{3\times10^8}{3} = 10^8\ \text{m/s}$$
        and the impedance would be
        $$\sqrt{\frac{\mu}{\epsilon}} = \frac{\eta_0}{\sqrt{\epsilon_r}} = \frac{120\pi}{3} = 40\pi\ \Omega$$
        **2. β.** A small loss tangent barely changes the phase constant, so the sheet keeps $\beta \approx \omega\sqrt{\mu\epsilon} = \omega/v$:
        $$\beta \approx \frac{2\pi\times10^8}{10^8}$$
        $$\boxed{\beta \approx 2\pi\ \text{rad/m}}$$
        So $\lambda = 2\pi/\beta \approx 1$ m.

        **3. Where the α line comes from.** The sheet gives $\gamma = j\omega\sqrt{\mu(\epsilon - j\sigma/\omega)}$. Pull $\epsilon$ out of the bracket, and write $x = \sigma/\omega\epsilon$ and $\beta_0 = \omega\sqrt{\mu\epsilon}$:
        $$\gamma = j\beta_0\sqrt{1 - jx}$$
        For a small $x$, $\sqrt{1 - jx} \approx 1 - jx/2$. (Square the right side: $1 - jx - x^2/4$, which is $1 - jx$ up to a tiny $x^2$ term.) Multiply out:
        $$\gamma \approx j\beta_0 + \beta_0\frac{x}{2}$$
        The real part is $\alpha$. Put $x$ back in; $\omega$ cancels:
        $$\alpha \approx \frac{\omega\sqrt{\mu\epsilon}\,\sigma}{2\,\omega\epsilon} = \frac{\sigma}{2}\sqrt{\frac{\mu}{\epsilon}}$$
        **4. Numbers.**
        $$\alpha \approx \frac12\cdot\frac{1}{40\pi}\cdot40\pi$$
        $$\boxed{\alpha \approx 0.5\ \text{Np/m}}$$

        !!intuition Does this make sense?
          $\alpha/\beta = 0.5/6.28 = 0.08$, half the loss tangent, as $\gamma \approx \beta_0(x/2 + j)$ says ✓. The amplitude falls by $1/e$ every $1/\alpha = 2$ m, that is every two wavelengths: a gentle decay, as an imperfect dielectric should give. The exact formulas give $\alpha = 0.498$ Np/m and $\beta = 6.30$ rad/m, within 0.3%.

        **Speed path.** $\beta = \omega/v$. $\alpha = \tfrac{\sigma}{2}\times(\text{lossless }\eta)$: here $\tfrac{1}{80\pi}\times40\pi = \tfrac12$. Ten seconds each.

        **Where points go.** Dropping the $\tfrac12$ ($\alpha = 1$); putting $\eta_0$ in place of $40\pi$ ($\alpha = 1.5$); $\epsilon_r$ in place of $\sqrt{\epsilon_r}$ in $\beta$.
      ` }),
    P({ src: 'Practice D #1(c) · 4 pts', title: 'η and its angle',
      q: md`**(c) (4 pts)** Find the intrinsic impedance $\eta$ in rectangular form, and its angle $\tau$ in degrees.`,
      parts: [
        N(md`$\Re\{\eta\}$`, 40 * PI, 'Ω', 0.03),
        trap(N(md`$\Im\{\eta\}$`, 10, 'Ω', 0.03), [[20, md`That forgets the $\tfrac12$: $\eta \approx \sqrt{\mu/\epsilon}\,(1 + j\sigma/2\omega\epsilon)$.`], [-10, md`Sign: $\eta$ of a lossy medium has a positive angle ($H$ lags $E$), so its imaginary part is positive.`]]),
        trap(N('\\tau', 4.56, '°', 0.03), [[9.12, md`That is $\tan^{-1}(\sigma/\omega\epsilon)$. The square root in $\eta$ halves it.`], [0.0796, md`That is $\tau$ in radians. The box asks for degrees: multiply by $180/\pi \approx 57.3$.`]]),
      ],
      hints: [md`The sheet's line for $1 \gg \sigma/\omega\epsilon$: $\eta \approx \sqrt{\mu/\epsilon}\left(1 + j\dfrac{\sigma}{2\omega\epsilon}\right)$. For a small angle, $\tau \approx \tan\tau$ in radians.`],
      sol: md`
        **1. Where the sheet's line comes from.** $\eta = \sqrt{\mu/(\epsilon - j\sigma/\omega)}$. Pull $\epsilon$ out, with $x = \sigma/\omega\epsilon$:
        $$\eta = \sqrt{\frac{\mu}{\epsilon}}\,\frac{1}{\sqrt{1 - jx}}$$
        From part (b), $\sqrt{1 - jx} \approx 1 - jx/2$. And $1/(1 - u) \approx 1 + u$ for small $u$:
        $$\eta \approx \sqrt{\frac{\mu}{\epsilon}}\left(1 + j\frac{x}{2}\right)$$
        **2. Numbers.** $\sqrt{\mu/\epsilon} = 40\pi$ and $x/2 = \frac{1}{4\pi}$:
        $$\eta \approx 40\pi\left(1 + \frac{j}{4\pi}\right)$$
        $$\boxed{\eta \approx 40\pi + j10\ \Omega \approx 126 + j10\ \Omega}$$
        **3. The angle.** $\tan\tau = 10/(40\pi) = \frac{1}{4\pi} \approx 0.080$. For a small angle, $\tau \approx \tan\tau$ in radians:
        $$\tau \approx 0.080\ \text{rad}\times57.3\,°/\text{rad}$$
        $$\boxed{\tau \approx 4.6°}$$
        It agrees with the sheet's $\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon) \approx \tfrac12\cdot\tfrac{1}{2\pi}$ ✓.

        !!intuition Does this make sense?
          The size of $\eta$ is barely changed from the lossless $40\pi$, and its angle is small and positive: $H$ lags $E$ by about $4.6°$. Loss enters $\eta$ only at first order in the angle. The exact value is $124.5 + j9.8\ \Omega$, within 2%.

        **Speed path.** $\Im\{\eta\} = (\text{lossless }\eta)\times\frac{\sigma}{2\omega\epsilon}$, and $\tau$ in radians is the same small number $\frac{\sigma}{2\omega\epsilon}$.

        **Where points go.** $j20$ (no $\tfrac12$); a negative imaginary part; leaving $\tau$ in radians when degrees were asked.
      ` }),
    P({ src: 'Practice D #1(d) · 5 pts', title: 'Power and decibels',
      q: md`**(d) (5 pts)** Find the time-averaged power density $\langle S_z\rangle$ at $z = 0$. By how many dB has it dropped at $z = 2$ m? Over what distance does it fall to half?`,
      parts: [
        trap(N(md`$\langle S_z\rangle$ at $z = 0$`, 5 / PI, 'W/m^2'), [[10 / PI, md`That forgets the $\tfrac12$ of the time average: $\langle S\rangle = \frac{E_0^2}{2|\eta|}\cos\tau$.`], [400 / (240 * PI), md`That uses $\eta_0$. The wave is in the material, where $|\eta| \approx 40\pi$.`]]),
        trap(N('\\text{drop to } z = 2\\,\\text{m}', 8.69, 'dB'), [[4.34, md`That treats power like amplitude, $e^{-\alpha z}$. Power goes as the square: $e^{-2\alpha z}$.`], [17.4, md`That uses $20\log_{10}$ on a power ratio. Decibels of power are $10\log_{10}$.`]]),
        trap(N('\\text{half-power distance}', 0.693, 'm'), [[1.386, md`That solves $e^{-\alpha z} = \tfrac12$, the amplitude. The power halves when $e^{-2\alpha z} = \tfrac12$.`]]),
      ],
      hints: [md`$\langle S_z\rangle = \dfrac{E_0^2}{2|\eta|}\cos\tau\,e^{-2\alpha z}$. The power ratio over $z$ is $e^{-2\alpha z}$; in dB that is $10\log_{10}e^{2\alpha z} = 2\alpha z\times4.34$.`],
      sol: md`
        **1. The power formula, from the phasors.** The forward wave is $\tilde E_x = E_0e^{-\alpha z}e^{-j\beta z}$ and $\tilde H_y = \tilde E_x/\eta$. The time-averaged Poynting vector is
        $$\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$$
        Here $\hat x\times\hat y = \hat z$, and $\tilde E_x\tilde E_x^* = E_0^2e^{-2\alpha z}$:
        $$\langle S_z\rangle = \frac{E_0^2e^{-2\alpha z}}{2}\,\Re\Bigl\{\frac{1}{\eta^*}\Bigr\}$$
        With $\eta = |\eta|e^{j\tau}$, $\Re\{1/\eta^*\} = \cos\tau/|\eta|$:
        $$\langle S_z\rangle = \frac{E_0^2}{2|\eta|}\cos\tau\;e^{-2\alpha z}$$
        **2. At z = 0.** $\cos4.6° \approx 0.997$; drop it. $|\eta| \approx 40\pi$:
        $$\langle S_z\rangle \approx \frac{400}{80\pi}$$
        $$\boxed{\langle S_z\rangle(0) \approx \frac{5}{\pi} \approx 1.59\ \text{W/m}^2}$$
        **3. Decibels at z = 2 m.** The power ratio is $e^{-2\alpha z}$, and $2\alpha z = 2(0.5)(2) = 2$. In decibels:
        $$10\log_{10}e^{2} = 2\times(10\log_{10}e) = 2\times4.34$$
        $$\boxed{\text{drop} \approx 8.69\ \text{dB}}$$
        **4. Half power.** Set $e^{-2\alpha z} = \tfrac12$ and take logs: $2\alpha z = \ln2$.
        $$z = \frac{\ln2}{2\alpha} = \frac{0.693}{1}$$
        $$\boxed{z_{1/2} \approx 0.693\ \text{m}}$$

        !!intuition Does this make sense?
          Power falls twice as fast as amplitude, which is why every "2" sits next to $\alpha$. Each neper of amplitude decay is $8.69$ dB of power. A 3 dB drop is half power, and $0.693\ \text{m}\times(2\alpha\times4.34) = 3.0$ dB ✓.

        **Speed path.** dB per meter $= 8.69\,\alpha$ (here 4.34 dB/m). Half-power distance $= 0.693/(2\alpha)$.

        **Where points go.** $e^{-\alpha z}$ for power; $20\log$ on a power ratio; dropping the $\tfrac12$ in $\langle S\rangle$; using $\eta_0$ inside the material.
      ` }),
    P({ src: 'Practice D #1(e) · 5 pts', title: 'Double the frequency',
      q: md`**(e) (5 pts)** The frequency is doubled to 200 MHz; $\sigma$ and $\epsilon$ do not change. What happens to $\alpha$? What is the new loss tangent?`,
      parts: [
        mc(md`At 200 MHz, $\alpha$…`, [md`stays about 0.5 Np/m`, md`doubles to about 1 Np/m`, md`halves to about 0.25 Np/m`, md`grows by $\sqrt2$ to about 0.71 Np/m`], 0,
          [null, md`That treats $\alpha$ like $\beta$, which does double. In $\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon}$, $\omega$ has cancelled.`, md`That follows the loss tangent, which halves. But $\alpha = \beta\cdot(\text{loss tangent})/2$, and $\beta$ doubles: the two changes cancel.`, md`$\alpha \propto \sqrt f$ belongs to a good conductor. This material is an imperfect dielectric.`]),
        trap(N(md`new $\sigma/\omega\epsilon$`, 1 / (4 * PI), ''), [[1 / PI, md`The loss tangent goes as $1/\omega$: doubling $f$ halves it.`]]),
      ],
      hints: [md`Look at which formula has $\omega$ in it: $\alpha \approx \frac{\sigma}{2}\sqrt{\mu/\epsilon}$, $\beta \approx \omega\sqrt{\mu\epsilon}$, $\sigma/\omega\epsilon$.`],
      sol: md`
        !!trap The trap
          Most people answer "more frequency, more loss". That is true in a good conductor, where $\alpha = \sqrt{\pi f\mu\sigma}$. In an imperfect dielectric the frequency cancels out of $\alpha$.

        **1. α.** From part (b),
        $$\alpha \approx \frac{\sigma}{2}\sqrt{\frac{\mu}{\epsilon}}$$
        It has no $\omega$ in it. With $\sigma$ and $\epsilon$ fixed:
        $$\boxed{\alpha \approx 0.5\ \text{Np/m, unchanged}}$$
        **2. The loss tangent** has $\omega$ in the denominator, so it halves:
        $$\boxed{\frac{\sigma}{\omega\epsilon} = \frac{1}{4\pi} \approx 0.08}$$
        Still an imperfect dielectric, so the formula of step 1 still applies.

        !!intuition Does this make sense?
          Per wavelength the loss halves: $\lambda$ halves to 0.5 m and $\alpha$ stays. Per meter it does not change. Physically the conduction current $\sigma E$ is the same at any frequency, and so is the heat per meter of travel for a given field. The exact $\alpha$ at 200 MHz is 0.4996 Np/m.

        **Speed path.** Imperfect dielectric: $\alpha$ depends on $\sigma$ and $\eta$ only. Good conductor: $\alpha \propto \sqrt f$. Know which one you are in.

        **Where points go.** Assuming more frequency always means more loss per meter (true for conductors, not here).
      ` }),

    // ---------------------------------------------------------------- D Problem 2
    RF(md`
      ### Problem 2 (24 points): two current sheets for circular polarization

      Free space. Every source oscillates at $f = 300$ MHz, so $\lambda = 1$ m and $\beta = 2\pi$ rad/m. Sheet 1 lies in the plane $z = 0$ and carries the surface-current phasor
      $$\tilde{\mathbf J}_{s1} = 0.1\,\hat x\ \ \text{A/m}$$
      Sheet 2 carries $\tilde{\mathbf J}_{s2} = 0.1\,e^{j\phi}\,\hat y$ A/m. In **design A** it lies in the same plane $z = 0$; in **design B** it lies in the plane $z = d = 0.125$ m.

      The formula sheet gives the field of a sheet: for $\mathbf J_s = -J_s(t)\,\hat x$ at $z = 0$, $E_x(z,t) = \frac{\eta}{2}J_s(t \mp z/v_p)$ for $z \gtrless 0$. Handedness follows the course rule: point your thumb along the direction of travel; the fingers of the matching hand curl the way $\mathbf E$ turns at a fixed point.

      [[fig:sheets]]
    `, { sheets: { svg: PF.row([{ svg: sheetsFig(false), cap: 'Design A: both sheets at z = 0.' }, { svg: sheetsFig(true), cap: 'Design B: sheet 2 at z = d = λ/8.' }]).svg } }),
    P({ src: 'Practice D #2(a) · 5 pts', title: 'One sheet',
      q: md`**(a) (5 pts)** Sheet 1 alone. Find $\tilde E_x$ and $\tilde H_y$ just above it, at $z = 0^+$.`,
      parts: [
        trap(N(md`$\tilde E_x(0^+)$`, -6 * PI, 'V/m'), [[6 * PI, md`Sign: the field right outside a sheet points **against** its current. That is how the sheet pushes power out: $-\mathbf E\cdot\mathbf J_s > 0$.`], [-12 * PI, md`That drops the $\tfrac12$: half of the sheet's field goes each way, $\frac{\eta_0}{2}J_s$.`]]),
        trap(N(md`$\tilde H_y(0^+)$`, -0.05, 'A/m'), [[0.05, md`Sign: for a wave going toward $+z$, $\tilde{\mathbf H} = \frac{1}{\eta_0}\hat z\times\tilde{\mathbf E}$, and $\hat z\times(-\hat x) = -\hat y$.`], [-0.1, md`That drops the $\tfrac12$: $|H| = J_s/2$ on each side.`]]),
      ],
      hints: [md`Match the sheet's form: $\tilde{\mathbf J}_{s1} = 0.1\,\hat x$ means $-J_s = 0.1$, so $J_s = -0.1$. Then $\tilde E_x = \frac{\eta_0}{2}J_s e^{\mp j\beta z}$.`, md`$\mathbf E\times\mathbf H$ must point along the travel, $+\hat z$, above the sheet.`],
      sol: md`
        **1. Read the sheet's formula.** It is written for a current $-J_s\hat x$. Ours is $+0.1\,\hat x$, so $J_s = -0.1$ A/m, and the field above the sheet is
        $$\tilde E_x = \frac{\eta_0}{2}J_s\,e^{-j\beta z} = \frac{120\pi}{2}(-0.1)\,e^{-j2\pi z}$$
        $$\boxed{\tilde E_x(0^+) = -6\pi \approx -18.8\ \text{V/m}}$$
        The same value starts the wave below the sheet, $-6\pi\,e^{+j2\pi z}\,\hat x$ for $z < 0$.

        **2. H from E.** For the wave going toward $+z$, $\tilde{\mathbf H} = \frac{1}{\eta_0}\hat z\times\tilde{\mathbf E}$. With $\hat z\times\hat x = \hat y$:
        $$\tilde H_y = \frac{-6\pi}{120\pi}$$
        $$\boxed{\tilde H_y(0^+) = -0.05\ \text{A/m}}$$
        **3. Check with the boundary condition.** Below the sheet the wave goes toward $-z$, so $\tilde{\mathbf H} = \frac{1}{\eta_0}(-\hat z)\times\tilde{\mathbf E} = +0.05\,\hat y$. The jump across the sheet must be $\hat n\times(\mathbf H_+ - \mathbf H_-) = \mathbf J_s$ with $\hat n = \hat z$:
        $$\hat z\times(-0.1\,\hat y) = 0.1\,\hat x\ \checkmark$$

        !!intuition Does this make sense?
          $\mathbf E$ opposes $\mathbf J_s$ at the sheet, so $\mathbf J_s\cdot\mathbf E < 0$: the source does work on the field, as an antenna must. And $\mathbf E\times\mathbf H = (-\hat x)\times(-\hat y) = +\hat z$ above the sheet: power flows away ✓.

        **Speed path.** $|E| = \frac{\eta_0}{2}|J_s| = 60\pi\times0.1 = 6\pi$, pointing against the current, on both sides. $|H| = J_s/2$, with $\mathbf E\times\mathbf H$ along the travel.

        **Where points go.** The sign (field along the current); the $\tfrac12$; the sign of $H$ on each side.
      ` }),
    P({ src: 'Practice D #2(b) · 5 pts', title: 'Design A: choose the phase',
      q: md`**(b) (5 pts)** Design A. Choose $\phi$ so that the wave traveling toward $+z$ is right-hand circularly polarized (RHCP), and write $\tilde{\mathbf E}$ for $z > 0$.`,
      parts: [
        mc(md`$\phi =$`, [md`$-90°$`, md`$+90°$`, md`$0°$`, md`$180°$`], 0,
          [null, md`That gives $\hat x + j\hat y$ toward $+z$: $\mathbf E$ turns from $+x$ toward $-y$, which is left-handed for travel along $+z$.`, md`In phase: $\mathbf E$ swings back and forth along the line $x = y$. That is linear polarization at $45°$.`, md`Opposite phase: $\mathbf E$ swings along the line $x = -y$. Still linear.`]),
        mc(md`For $z > 0$, $\tilde{\mathbf E} =$`, [md`$-6\pi(\hat x - j\hat y)\,e^{-j2\pi z}$ V/m`, md`$6\pi(\hat x - j\hat y)\,e^{-j2\pi z}$ V/m`, md`$-6\pi(\hat x + j\hat y)\,e^{-j2\pi z}$ V/m`, md`$-6\pi(\hat x - j\hat y)\,e^{+j2\pi z}$ V/m`], 0,
          [null, md`Sign: each sheet's field points against its own current, $-\frac{\eta_0}{2}\tilde{\mathbf J}_s$.`, md`That is the phase $\phi = +90°$: left-handed toward $+z$.`, md`$e^{+j2\pi z}$ travels toward $-z$. Above the sheets the wave goes toward $+z$.`]),
      ],
      hints: [md`Both sheets are at $z = 0$, so above them $\tilde{\mathbf E} = -6\pi(\hat x + e^{j\phi}\hat y)\,e^{-j\beta z}$. The course's RHCP wave toward $+z$ is $(\hat x - j\hat y)e^{-j\beta z}$.`],
      sol: md`
        **1. Superpose.** Each sheet radiates $-\frac{\eta_0}{2}\tilde{\mathbf J}_s\,e^{-j\beta z}$ upward (part a). Both sit at $z = 0$:
        $$\tilde{\mathbf E} = -6\pi\,(\hat x + e^{j\phi}\hat y)\,e^{-j2\pi z}\quad(z > 0)$$
        **2. What RHCP toward +z needs.** Thumb along $+z$, right hand: the fingers curl from $+x$ toward $+y$. So at a fixed point $\mathbf E$ must turn from $x$ toward $y$. Go to the time domain at $z = 0$:
        $$\mathbf E(0,t) = -6\pi\bigl[\cos\omega t\,\hat x + \cos(\omega t + \phi)\,\hat y\bigr]$$
        Try $\phi = -90°$, so $\cos(\omega t - 90°) = \sin\omega t$:
        $$\mathbf E(0,t) = -6\pi\bigl[\cos\omega t\,\hat x + \sin\omega t\,\hat y\bigr]$$
        At $\omega t = 0$ it points along $-\hat x$ (angle $180°$); at $\omega t = 90°$ along $-\hat y$ (angle $270°$). The angle grows: counterclockwise seen from $+z$, the $x\to y$ sense ✓. The overall minus sign turns the picture by $180°$ but does not change the sense of rotation.
        $$\boxed{\phi = -90°,\quad\tilde{\mathbf J}_{s2} = -j0.1\,\hat y\ \text{A/m}}$$
        $$\boxed{\tilde{\mathbf E} = -6\pi(\hat x - j\hat y)\,e^{-j2\pi z}\ \text{V/m}}$$
        In the time domain the total current $0.1(\cos\omega t\,\hat x + \sin\omega t\,\hat y)$ itself turns from $x$ to $y$: a turning current radiates a turning field.

        **Speed path.** The course's table: toward $+z$, $\hat x - j\hat y$ is RHCP ($x$ leads $y$ by $90°$). So $e^{j\phi} = -j$.

        **Where points go.** Picking $+90°$ (the left hand); forgetting that the overall sign does not matter for handedness and "fixing" it.
      ` }),
    P({ src: 'Practice D #2(c) · 4 pts', title: 'Design A: the other side',
      q: md`**(c) (4 pts)** With your design A from (b), what is the polarization of the wave that travels toward $-z$?`,
      parts: [mc('', [md`LHCP`, md`RHCP, the same as toward $+z$`, md`linear along $x = y$`, md`no wave: the sheets radiate only toward $+z$`], 0,
        [null, md`The sheets make $\mathbf E$ turn the same way ($x\to y$) on both sides. But handedness is judged with the thumb along the travel, and below the sheets the travel is $-z$.`, md`$|E_x| = |E_y|$ and they are $90°$ apart on both sides of the sheets: circular, not linear.`, md`A sheet radiates equally both ways. Only a second sheet some distance away can change what one side gets.`])],
      hints: [md`Below the sheets, $\tilde{\mathbf E} = -6\pi(\hat x - j\hat y)\,e^{+j\beta z}$. At a fixed point $\mathbf E$ still turns from $x$ to $y$. Now point your thumb along $-z$.`],
      sol: md`
        **1. The field below the sheets.** The same superposition with $e^{+j\beta z}$:
        $$\tilde{\mathbf E} = -6\pi(\hat x - j\hat y)\,e^{+j2\pi z}\quad(z < 0)$$
        **2. The rotation is the same.** At $z = 0$ the field is the same vector as above, so it turns from $x$ toward $y$.

        **3. The hand is not.** The travel is now $-z$. Right thumb along $-z$: the fingers curl from $x$ toward $-y$. Our field turns the other way, $x\to y$. Left thumb along $-z$: the fingers curl from $x$ toward $y$ ✓.
        $$\boxed{\text{LHCP toward }-z}$$

        !!intuition Does this make sense?
          Look at the sheet from above and from below. From above, the current turns counterclockwise; from below, the same current turns clockwise. Each wave carries the rotation it sees, measured against its own direction of travel. So one sheet always sends opposite hands to its two sides.

        **Speed path.** One plane of current: the two sides always get opposite hands. Toward $-z$, the course's RHCP vector is $\hat x + j\hat y$; we have $\hat x - j\hat y$, so it is LHCP.

        **Where points go.** Copying the answer from the $+z$ side. Judging the hand with the thumb along $+z$ for a wave going toward $-z$.
      ` }),
    P({ src: 'Practice D #2(d) · 5 pts', title: 'Design B: move sheet 2',
      q: md`**(d) (5 pts)** Design B: sheet 2 moves to $z = d = 0.125$ m (an eighth of a wavelength). Choose $\phi$ so that the wave above both sheets ($z > d$) is RHCP. Then what travels toward $-z$?`,
      parts: [
        mc(md`$\phi =$`, [md`$-135°$`, md`$-90°$`, md`$-45°$`, md`$+45°$`], 0,
          [null, md`That is design A's phase. Sheet 2 is now $\lambda/8$ closer to every point above it, so its wave arrives $45°$ earlier; with $-90°$ the $y$ part lags by only $45°$, and the wave is right-hand **elliptical**.`, md`That cancels the $45°$ head start exactly: the two components arrive in phase, and the wave above is linear.`, md`That puts $y$ ahead of $x$ by $90°$: circular, but left-handed toward $+z$.`]),
        mc(md`Toward $-z$ the wave is…`, [md`linear, along $\hat x - \hat y$`, md`LHCP, as in design A`, md`RHCP`, md`zero`], 0,
          [null, md`That was design A. Here sheet 2's wave travels $\lambda/8$ farther to reach $z < 0$, so it arrives $45°$ late: with $\phi = -135°$ the $y$ part ends up $180°$ behind $x$, not $90°$.`, md`RHCP toward $-z$ needs $y$ to lead $x$ by $90°$ ($\hat x + j\hat y$). Below these sheets the difference is $180°$.`, md`Nothing can cancel the $x$ part below: sheet 1 is the only $x$ source, and sheet 2 only adds $y$.`]),
      ],
      hints: [md`Above both sheets, sheet 2's wave is $e^{-j\beta(z - d)} = e^{-j\beta z}e^{+j\beta d}$ with $\beta d = 45°$. Below them it is $e^{+j\beta(z - d)} = e^{+j\beta z}e^{-j\beta d}$.`],
      sol: md`
        **1. Above both sheets** ($z > d$). Sheet 2's wave starts at $z = d$, so its exponent is $e^{-j\beta(z - d)}$:
        $$\tilde{\mathbf E} = -6\pi\bigl[\hat x\,e^{-j\beta z} + e^{j\phi}\hat y\,e^{-j\beta(z - d)}\bigr]$$
        Pull out $e^{-j\beta z}$. What is left on $\hat y$ is $e^{j(\phi + \beta d)}$, with $\beta d = 2\pi(0.125) = \pi/4 = 45°$:
        $$\tilde{\mathbf E} = -6\pi\bigl[\hat x + e^{j(\phi + 45°)}\hat y\bigr]e^{-j\beta z}$$
        RHCP toward $+z$ needs $\hat x - j\hat y$, so $e^{j(\phi + 45°)} = -j = e^{-j90°}$:
        $$\boxed{\phi = -135°}$$
        **2. Below both sheets** ($z < 0$). Now sheet 2's wave travels the extra $d$, so its exponent is $e^{+j\beta(z - d)}$:
        $$\tilde{\mathbf E} = -6\pi\bigl[\hat x + e^{j(\phi - 45°)}\hat y\bigr]e^{+j\beta z}$$
        With $\phi = -135°$ the angle is $-180°$, and $e^{-j180°} = -1$:
        $$\tilde{\mathbf E} = -6\pi(\hat x - \hat y)\,e^{+j2\pi z}$$
        $$\boxed{\text{linear, along }\hat x - \hat y,\ \text{toward }-z}$$

        !!intuition Does this make sense?
          Spacing the sheets adds $+\beta d$ to sheet 2's phase on one side and $-\beta d$ on the other. A spacing of $\lambda/8$ shifts the relative phase by $90°$ between the two sides, which turns "circular" on one side into "linear" on the other. (A spacing of $\lambda/4$ shifts it by $180°$ and gives RHCP on both sides; same plane gives opposite hands.)

        **Speed path.** Relative phase of $y$ over $x$: above, $\phi + \beta d$; below, $\phi - \beta d$. Set the first to $-90°$, read off the second.

        **Where points go.** Using $e^{-j\beta d}$ above (the sign of the head start); forgetting that below the sheets the path difference reverses.
      ` }),
    P({ src: 'Practice D #2(e) · 5 pts', title: 'How much power',
      q: md`**(e) (5 pts)** For design A, find the time-averaged power density carried toward $+z$, and the total power per unit area of sheet the pair radiates.`,
      parts: [
        trap(N(md`$|\langle\mathbf S\rangle|$ toward $+z$`, 0.3 * PI, 'W/m^2'), [[0.15 * PI, md`That keeps only $E_x$. A circular wave has two components of equal size: $|\tilde{\mathbf E}|^2 = |E_x|^2 + |E_y|^2$.`]]),
        trap(N('\\text{total, both sides}', 0.6 * PI, 'W/m^2'), [[0.3 * PI, md`That is one side only. The sheets radiate the same power downward.`]]),
      ],
      hints: [md`For one traveling wave, $|\langle\mathbf S\rangle| = |\tilde{\mathbf E}|^2/(2\eta_0)$, with $|\tilde{\mathbf E}|^2 = \tilde{\mathbf E}\cdot\tilde{\mathbf E}^*$.`],
      sol: md`
        **1. Size of the phasor.** $\tilde{\mathbf E} = -6\pi(\hat x - j\hat y)e^{-j2\pi z}$, so
        $$|\tilde{\mathbf E}|^2 = (6\pi)^2(1 + 1) = 72\pi^2$$
        **2. Power density.** For one traveling wave in free space, $\tilde{\mathbf H} = \hat z\times\tilde{\mathbf E}/\eta_0$ and $\langle\mathbf S\rangle = |\tilde{\mathbf E}|^2/(2\eta_0)$ along the travel:
        $$|\langle\mathbf S\rangle| = \frac{72\pi^2}{240\pi}$$
        $$\boxed{|\langle\mathbf S\rangle| = 0.3\pi \approx 0.942\ \text{W/m}^2\ \text{toward }+z}$$
        **3. Both sides.** The downward wave has the same size:
        $$\boxed{0.6\pi \approx 1.88\ \text{W/m}^2\ \text{in total}}$$

        !!intuition Does this make sense?
          Check it from the source side: the power the currents give the field per unit area is $-\tfrac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}_s^*\}$ at the sheet. With $\tilde{\mathbf E}(0) = -6\pi(\hat x - j\hat y)$ and $\tilde{\mathbf J}_s^* = 0.1(\hat x + j\hat y)$, the dot product is $-0.6\pi(1 + 1) = -1.2\pi$, and $-\tfrac12(-1.2\pi) = 0.6\pi$ W/m² ✓. Energy out equals energy in.

        **Speed path.** Each component carries $(6\pi)^2/240\pi = 0.15\pi$; two components, $0.3\pi$; two sides, $0.6\pi$.

        **Where points go.** Keeping one component; forgetting the second side; using $\eta_0/2$ in place of $\eta_0$.
      ` }),

    // ---------------------------------------------------------------- D Problem 3
    RF(md`
      ### Problem 3 (24 points): standing waves on a phasor line

      A lossless line with $Z_0 = 50\ \Omega$, length $l = 3$ m and wave speed $v = 2\times10^8$ m/s ends in the load $Z_L = 30 + j40\ \Omega$. A generator with open-circuit voltage phasor $\tilde F = 20$ V and internal impedance $Z_g = 50\ \Omega$ drives it at $f = 100$ MHz. As on the formula sheet, $d$ is the distance back from the load, and
      $$\tilde V(d) = \tilde V^+e^{j\beta d}\bigl(1 + \Gamma(d)\bigr),\quad \Gamma(d) = \Gamma_Le^{-j2\beta d}$$

      [[fig:d3]]
    `, { d3: { svg: figD3(), cap: 'The generator is matched to the line ($Z_g = Z_0$). $d$ runs from the load ($d = 0$) back to the generator ($d = l = 3$ m).' } }),
    P({ src: 'Practice D #3(a) · 4 pts', title: 'The load reflection coefficient',
      q: md`**(a) (4 pts)** Find $\Gamma_L$: its size and its angle.`,
      parts: [
        trap(N(md`$|\Gamma_L|$`, 0.5, ''), [[0.25, md`That ignores the reactance: $(30 - 50)/(30 + 50)$. The $j40$ belongs in both the top and the bottom.`]]),
        trap(N(md`$\theta_L$`, 90, '°'), [[-90, md`That is $(Z_0 - Z_L)/(Z_0 + Z_L)$, the sign flipped. $\Gamma_L = (Z_L - Z_0)/(Z_L + Z_0)$.`]]),
      ],
      hints: [md`$\Gamma_L = \dfrac{Z_L - Z_0}{Z_L + Z_0} = \dfrac{-20 + j40}{80 + j40}$. Divide top and bottom by 20, then multiply by the conjugate of the bottom.`],
      sol: md`
        **1. The definition.** $\Gamma_L$ is the reflected voltage over the incident voltage at the load. KVL and KCL at the load give
        $$\Gamma_L = \frac{Z_L - Z_0}{Z_L + Z_0} = \frac{-20 + j40}{80 + j40}$$
        **2. Simplify.** Divide top and bottom by 20:
        $$\Gamma_L = \frac{-1 + j2}{4 + j2}$$
        Multiply top and bottom by the conjugate $4 - j2$. The bottom becomes $16 + 4 = 20$. The top:
        $$(-1 + j2)(4 - j2) = -4 + j2 + j8 - j^24$$
        Since $-j^2\cdot4 = +4$, the real parts cancel and the top is $j10$:
        $$\Gamma_L = \frac{j10}{20}$$
        $$\boxed{\Gamma_L = j0.5 = 0.5\,e^{j90°}}$$

        !!intuition Does this make sense?
          $|Z_L| = \sqrt{30^2 + 40^2} = 50 = Z_0$. Any load with $|Z_L| = Z_0$ is $Z_0e^{j\theta}$, and then $\Gamma_L = (e^{j\theta} - 1)/(e^{j\theta} + 1) = j\tan(\theta/2)$: purely imaginary. Here $\theta = 53.1°$ and $\tan26.6° = 0.5$ ✓. An inductive load (positive reactance) gives a positive angle.

        **Speed path.** Spot $|Z_L| = Z_0$ (a 3-4-5 triangle times 10): $\Gamma_L$ is pure imaginary, and one conjugate multiplication finishes it.

        **Where points go.** The conjugate arithmetic ($-j^2 = +1$); flipping the order of $Z_L - Z_0$.
      ` }),
    P({ src: 'Practice D #3(b) · 4 pts', title: 'VSWR and the incident wave',
      q: md`**(b) (4 pts)** Find the VSWR and the amplitude $|\tilde V^+|$ of the incident wave.`,
      parts: [
        N('\\text{VSWR}', 3, ''),
        trap(N(md`$|\tilde V^+|$`, 10, 'V'), [[20, md`That is $\tilde F$ itself. With $Z_g = Z_0$ the generator and the line form a 50/50 divider for the wave it launches.`], [5 * Math.sqrt(5), md`That is $|\tilde V|$ at the generator end (or at the load), which includes the reflected wave.`]]),
      ],
      hints: [md`VSWR $= \dfrac{1 + |\Gamma_L|}{1 - |\Gamma_L|}$.`, md`At the input, $\tilde V(l) = \tilde F\,\dfrac{Z(l)}{Z_g + Z(l)}$. Write $Z(l) = Z_0\frac{1 + \Gamma(l)}{1 - \Gamma(l)}$ and use $Z_g = Z_0$.`],
      sol: md`
        **1. VSWR.**
        $$\text{VSWR} = \frac{1 + 0.5}{1 - 0.5}$$
        $$\boxed{\text{VSWR} = 3}$$
        **2. The incident wave.** At the input ($d = l$) the generator sees $Z(l)$, and the input voltage is a divider:
        $$\tilde V(l) = \tilde F\,\frac{Z(l)}{Z_g + Z(l)}$$
        Put in $Z(l) = Z_0\frac{1 + \Gamma(l)}{1 - \Gamma(l)}$ and $Z_g = Z_0$. The bottom becomes
        $$Z_0 + Z_0\frac{1 + \Gamma(l)}{1 - \Gamma(l)} = \frac{2Z_0}{1 - \Gamma(l)}$$
        so the divider is
        $$\tilde V(l) = \frac{\tilde F}{2}\bigl(1 + \Gamma(l)\bigr)$$
        Compare with $\tilde V(l) = \tilde V^+e^{j\beta l}(1 + \Gamma(l))$: the brackets match, so $\tilde V^+e^{j\beta l} = \tilde F/2$:
        $$\boxed{|\tilde V^+| = 10\ \text{V}}$$

        !!intuition Does this make sense?
          A matched generator launches $\tilde F/2$ no matter what the line ends in, and every returning wave dies in $Z_g$ without bouncing again. Here $l = 3$ m is 1.5 wavelengths, so $Z(l) = Z_L$ and $|\tilde V(l)| = 20\cdot50/|80 + j40| = 11.2$ V; and $|\tilde V^+||1 + \Gamma(l)| = 10|1 + j0.5| = 11.2$ V ✓.

        **Speed path.** $Z_g = Z_0$: $|\tilde V^+| = |\tilde F|/2$, done.

        **Where points go.** Taking $|\tilde V^+| = |\tilde F|$; confusing $|\tilde V|$ at a point with the incident amplitude.
      ` }),
    P({ src: 'Practice D #3(c) · 4 pts', title: 'Where the maxima sit',
      q: md`**(c) (4 pts)** How far from the load is the voltage maximum nearest the load? And the nearest minimum?`,
      parts: [
        trap(N(md`$d_{\max}$`, 0.25, 'm'), [[0.5, md`That sets $\beta d = 90°$. The phase of $\Gamma(d)$ turns by $2\beta d$, so $2\beta d = 90°$.`], [1, md`That is $\lambda/2$, the spacing between maxima, not the first one.`]]),
        trap(N(md`$d_{\min}$`, 0.75, 'm'), [[0.5, md`The minimum sits $\lambda/4$ beyond the maximum, not $\lambda/4$ from the load.`]]),
      ],
      hints: [md`$|\tilde V(d)| = |\tilde V^+|\,|1 + \Gamma(d)|$ is largest when $\Gamma(d)$ is real and positive, smallest when it is real and negative. $\Gamma(d) = 0.5\,e^{j(90° - 2\beta d)}$.`],
      sol: md`
        **1. The wavelength.**
        $$\lambda = \frac{v}{f} = \frac{2\times10^8}{10^8} = 2\ \text{m}$$
        **2. When |V| is largest.** $|\tilde V(d)| = |\tilde V^+|\,|1 + \Gamma(d)|$, since $|e^{j\beta d}| = 1$. The bracket is largest when $\Gamma(d)$ points along the positive real axis:
        $$\Gamma(d) = 0.5\,e^{j(90° - 2\beta d)}$$
        Its angle is zero when $2\beta d = 90°$, so $\beta d = 45°$, an eighth of a turn:
        $$d_{\max} = \frac{\lambda}{8}$$
        $$\boxed{d_{\max} = 0.25\ \text{m}}$$
        **3. The minimum.** The angle must reach $-180°$: $2\beta d = 270°$, so $\beta d = 135°$:
        $$\boxed{d_{\min} = \frac{3\lambda}{8} = 0.75\ \text{m}}$$
        Maxima repeat every $\lambda/2 = 1$ m, and every minimum is $\lambda/4$ from its neighboring maxima.

        [[fig:v]]

        !!intuition Does this make sense?
          At the load $\Gamma_L$ points straight up ($+90°$). Moving away from the load turns it clockwise at $2\beta$ per meter; after a quarter turn it points along $+1$ (maximum), after three quarters along $-1$ (minimum). A resistive load larger than $Z_0$ would put the maximum right at the load.

        **Speed path.** $d_{\max} = \dfrac{\theta_L}{720°}\lambda$ for $0 \le \theta_L < 360°$: $\frac{90}{720}\times2 = 0.25$ m. Minimum: add $\lambda/4$.

        **Where points go.** $\beta d$ in place of $2\beta d$; turning the wrong way (the angle decreases moving toward the generator).
      `,
      figs: { v: { svg: figD3V(), cap: '|V(d)| along the whole line: 15 V at the maxima, 5 V at the minima, the pattern repeating every λ/2 = 1 m.' } } }),
    P({ src: 'Practice D #3(d) · 4 pts', title: 'The standing-wave pattern',
      q: md`**(d) (4 pts)** Find $|\tilde V|_{\max}$ and $|\tilde V|_{\min}$ on the line, and the line impedance $Z(d_{\max})$ at a voltage maximum.`,
      parts: [
        N(md`$|\tilde V|_{\max}$`, 15, 'V'),
        N(md`$|\tilde V|_{\min}$`, 5, 'V'),
        trap(N(md`$Z(d_{\max})$`, 150, 'Ω'), [[50 / 3, md`That is the impedance at a voltage **minimum**, $Z_0/\text{VSWR}$. At a maximum the voltage is large and the current small: $Z_0\cdot\text{VSWR}$.`]]),
      ],
      hints: [md`At a maximum $\Gamma(d) = +|\Gamma_L|$; at a minimum $\Gamma(d) = -|\Gamma_L|$. Then $Z = Z_0\frac{1 + \Gamma}{1 - \Gamma}$.`],
      sol: md`
        **1. The extremes.** $|1 + \Gamma(d)|$ ranges from $1 - 0.5$ to $1 + 0.5$:
        $$|\tilde V|_{\max} = 10(1.5) = \boxed{15\ \text{V}}\qquad |\tilde V|_{\min} = 10(0.5) = \boxed{5\ \text{V}}$$
        Their ratio is 3, the VSWR ✓.

        **2. The impedance at a maximum.** There $\Gamma(d) = +0.5$, real:
        $$Z(d_{\max}) = 50\cdot\frac{1 + 0.5}{1 - 0.5}$$
        $$\boxed{Z(d_{\max}) = 150\ \Omega,\ \text{real}}$$

        !!intuition Does this make sense?
          At a voltage maximum the current is at its minimum ($\tilde I$ has $1 - \Gamma$), so the ratio is a large, real number: $Z_0\times\text{VSWR}$. At a voltage minimum it is $Z_0/\text{VSWR} = 16.7\ \Omega$. Those are the only two places where $Z(d)$ is real.

        **Speed path.** $|V|_{\max,\min} = |\tilde V^+|(1 \pm |\Gamma|)$. $Z$ at a max $= Z_0\cdot\text{VSWR}$.

        **Where points go.** Swapping the max and min impedances.
      ` }),
    P({ src: 'Practice D #3(e) · 4 pts', title: 'A quarter wave from the load',
      q: md`**(e) (4 pts)** Find the line impedance $Z(d)$ a quarter wavelength from the load, at $d = 0.5$ m.`,
      parts: [
        N(md`$\Re\{Z\}$`, 30, 'Ω'),
        trap(N(md`$\Im\{Z\}$`, -40, 'Ω'), [[40, md`That is $Z_L$ itself: a half wavelength repeats the load. A quarter wavelength inverts it.`]]),
      ],
      hints: [md`$\Gamma(\lambda/4) = \Gamma_Le^{-j\pi} = -\Gamma_L$. Or use $Z(\lambda/4) = Z_0^2/Z_L$.`],
      sol: md`
        **1. Γ a quarter wave back.** $2\beta d = 2\cdot\frac{2\pi}{\lambda}\cdot\frac{\lambda}{4} = \pi$, so
        $$\Gamma(\lambda/4) = j0.5\,e^{-j\pi} = -j0.5$$
        **2. Z from Γ.**
        $$Z = 50\cdot\frac{1 - j0.5}{1 + j0.5} = 50\cdot\frac{2 - j}{2 + j}$$
        Multiply top and bottom by $2 - j$. The bottom is $4 + 1 = 5$; the top is $(2 - j)^2 = 4 - j4 - 1 = 3 - j4$:
        $$Z = \frac{50}{5}(3 - j4)$$
        $$\boxed{Z(\lambda/4) = 30 - j40\ \Omega}$$
        **3. Check with the inverter rule.** Since $\Gamma(\lambda/4) = -\Gamma_L$, $Z(\lambda/4) = Z_0\frac{1 - \Gamma_L}{1 + \Gamma_L} = Z_0^2/Z_L$:
        $$\frac{2500}{30 + j40} = \frac{2500(30 - j40)}{2500} = 30 - j40\ \checkmark$$

        !!intuition Does this make sense?
          A quarter wave turns an inductive load into a capacitive one, and here, since $|Z_L| = Z_0$, into exactly its conjugate. The size stays 50 Ω because $|Z_0^2/Z_L| = 2500/50$.

        **Speed path.** $Z(\lambda/4) = Z_0^2/Z_L$; with $|Z_L| = Z_0$ that is $Z_L^*$.

        **Where points go.** Using the half-wave rule; a sign slip in the conjugate.
      ` }),
    P({ src: 'Practice D #3(f) · 4 pts', title: 'Power to the load',
      q: md`**(f) (4 pts)** How much time-averaged power reaches the load?`,
      parts: [trap(N(md`$P_L$`, 0.75, 'W'), [[1.25, md`That is $|\tilde V_L|^2/(2|Z_L|)$. Only the resistance absorbs power: $P = \tfrac12|\tilde I_L|^2R_L$.`], [125 / 60, md`That is $|\tilde V_L|^2/(2R_L)$, as if all of $\tilde V_L$ were across the 30 Ω part.`], [1, md`That is the incident power. A quarter of it is reflected.`], [0.25, md`That is the reflected power.`]])],
      hints: [md`$P = \dfrac{|\tilde V^+|^2}{2Z_0}\bigl(1 - |\Gamma_L|^2\bigr)$: incident power minus reflected power.`],
      sol: md`
        **1. Incident minus reflected.** On a lossless line the power is the same at every $d$:
        $$P = \frac{|\tilde V^+|^2}{2Z_0} - \frac{|\tilde V^-|^2}{2Z_0} = \frac{|\tilde V^+|^2}{2Z_0}\bigl(1 - |\Gamma_L|^2\bigr)$$
        **2. Numbers.** The incident power is $100/100 = 1$ W, and $1 - 0.25 = 0.75$:
        $$\boxed{P_L = 0.75\ \text{W}}$$
        **3. Check at the load.** $\tilde V_L = \tilde V^+(1 + \Gamma_L)$ has size $10|1 + j0.5| = 5\sqrt5 = 11.2$ V. The current has size $|\tilde V_L|/|Z_L| = 11.2/50 = 0.224$ A. The resistor absorbs
        $$\tfrac12|\tilde I_L|^2R_L = \tfrac12(0.05)(30) = 0.75\ \text{W}\ \checkmark$$

        !!intuition Does this make sense?
          The matched generator could deliver at most $|\tilde F|^2/(8R_g) = 400/400 = 1$ W. The load takes 75% of it; the other 25% reflects and is burned in $Z_g$.

        **Speed path.** $P_L = P_{\text{inc}}(1 - |\Gamma_L|^2) = 1\times\tfrac34$.

        **Where points go.** Dividing $|\tilde V_L|^2$ by $|Z_L|$ or by $R_L$; forgetting the $\tfrac12$ of the time average.
      ` }),

    // ---------------------------------------------------------------- D Problem 4
    RF(md`
      ### Problem 4 (30 points): three lines in cascade

      Three lossless lines are joined end to end. Each is 200 m long, and waves on all three travel at $v = 2\times10^8$ m/s, so each takes $T = 1\ \mu$s. Line 1 ($0 < z < 200$ m) has $Z_{01} = 50\ \Omega$, line 2 ($200 < z < 400$ m) has $Z_{02} = 150\ \Omega$, and line 3 ($400 < z < 600$ m) has $Z_{03} = 450\ \Omega$. A source $V_g(t) = 80\,u(t)$ V with $R_g = 50\ \Omega$ drives $z = 0$, and $R_L = 450\ \Omega$ terminates $z = 600$ m. Everything is uncharged before $t = 0$.

      Notation: $\Gamma_{12}$ is the reflection coefficient for a wave in line 1 arriving at the 1|2 junction, and $\tau_{12} = 1 + \Gamma_{12}$ is the transmission coefficient into line 2. Likewise $\Gamma_{21}$, $\tau_{21}$ for a wave in line 2 arriving at the same junction from the right, and $\Gamma_{23}$, $\tau_{23}$, $\Gamma_{32}$, $\tau_{32}$ at the 2|3 junction.

      [[fig:d4]]
    `, { d4: { svg: figD4(), cap: 'Source $80u(t)$ V with $R_g = 50$ Ω; lines of $Z_0 = 50$, 150 and 450 Ω, each 200 m and 1 µs long; $R_L = 450$ Ω. The probe point $z = 300$ m is the middle of line 2.' } }),
    P({ src: 'Practice D #4(a) · 6 pts', title: 'The coefficients',
      q: md`**(a) (6 pts)** Find $\tau_g$, $\Gamma_{12}$, $\tau_{12}$ and $\Gamma_{21}$. (Also note $\Gamma_g$, $\Gamma_L$ and the coefficients of the 2|3 junction.)`,
      parts: [
        trap(N('\\tau_g', 0.5, ''), [[0.25, md`That puts $R_g$ in the numerator. The line looks like a resistor $Z_{01}$ at first, so $\tau_g = Z_{01}/(R_g + Z_{01})$.`]]),
        trap(N('\\Gamma_{12}', 0.5, ''), [[-0.5, md`That is $(Z_{01} - Z_{02})/(Z_{01} + Z_{02})$. The wave in line 1 sees line 2 as its load: $(Z_{02} - Z_{01})/(Z_{02} + Z_{01})$.`]]),
        trap(N('\\tau_{12}', 1.5, ''), [[0.5, md`That is $1 - \Gamma_{12}$. Voltage is continuous across the junction, so $\tau = 1 + \Gamma$.`]]),
        trap(N('\\Gamma_{21}', -0.5, ''), [[0.5, md`From the right, the wave in line 2 sees line 1 (50 Ω, lower) as its load: the sign flips.`]]),
      ],
      hints: [md`At a junction, $V$ and $I$ are continuous: $V^+ + V^- = V^t$ and $(V^+ - V^-)/Z_a = V^t/Z_b$. Solve for $V^-/V^+$.`, md`Both junctions have an impedance ratio of 3, so their coefficients are the same.`],
      sol: md`
        **1. The source.** Before any reflection returns, the line looks like a resistor $Z_{01}$. The divider gives
        $$\tau_g = \frac{Z_{01}}{R_g + Z_{01}} = \frac{50}{100}$$
        $$\boxed{\tau_g = \tfrac12},\qquad \Gamma_g = \frac{R_g - Z_{01}}{R_g + Z_{01}} = 0$$
        So the launched wave is $\tau_gV_g = 40$ V, and anything that comes back to the source is absorbed. At the far end $R_L = Z_{03}$, so $\Gamma_L = 0$ too.

        **2. A junction, from first principles.** A wave $V^+$ in line $a$ hits line $b$. A reflected wave $V^-$ goes back and a transmitted wave $V^t$ goes on. Voltage is continuous:
        $$V^+ + V^- = V^t$$
        Current is continuous. A backward wave carries current $-V^-/Z_a$:
        $$\frac{V^+ - V^-}{Z_a} = \frac{V^t}{Z_b}$$
        Substitute $V^t$ from the first line, multiply by $Z_aZ_b$, and collect:
        $$V^-(Z_b + Z_a) = V^+(Z_b - Z_a)$$
        $$\Gamma_{ab} = \frac{Z_b - Z_a}{Z_b + Z_a},\qquad \tau_{ab} = 1 + \Gamma_{ab}$$
        **3. The numbers.** Junction 1|2 ($50\to150$):
        $$\boxed{\Gamma_{12} = \tfrac{100}{200} = \tfrac12,\quad \tau_{12} = \tfrac32}$$
        From the right ($150\to50$):
        $$\boxed{\Gamma_{21} = -\tfrac12},\quad \tau_{21} = \tfrac12$$
        Junction 2|3 ($150\to450$) has the same ratio of 3: $\Gamma_{23} = \tfrac12$, $\tau_{23} = \tfrac32$, $\Gamma_{32} = -\tfrac12$, $\tau_{32} = \tfrac12$.

        !!intuition Does this make sense?
          Going to a higher impedance, the voltage overshoots ($\tau > 1$) and the reflection has the same sign. Going to a lower one, both shrink. A $\tau$ above 1 is not free energy: the current transmitted is $\tau V/Z_b$, smaller, and the power $\tau^2V^2/Z_b = \tfrac94\cdot V^2/150 = \tfrac34V^2/50$ is three quarters of the incident ✓ (the other quarter reflects).

        **Speed path.** Ratio 3 gives $\pm\tfrac12$; ratio 2 gives $\pm\tfrac13$. The sign is $+$ going up in impedance.

        **Where points go.** The order in $Z_b - Z_a$; $\tau = 1 - \Gamma$.
      ` }),
    P({ src: 'Practice D #4(b) · 6 pts', title: 'The first waves',
      q: md`**(b) (6 pts)** Draw the voltage bounce diagram for $0 \le t \le 5\ \mu$s. Give the amplitudes of: the wave that enters line 3 at $t = 2\ \mu$s, the wave reflected back into line 2 at the same moment, and the wave that leaks back into line 1 at $t = 3\ \mu$s.`,
      parts: [
        trap(N(md`into line 3 at $2\ \mu$s`, 90, 'V'), [[60, md`That is the wave in line 2. Crossing into line 3 multiplies it by $\tau_{23} = \tfrac32$.`], [45, md`That multiplies by $\tfrac34$ or uses $\tau_{23} = \tfrac12$. Into a higher impedance, $\tau = \tfrac32$.`]]),
        trap(N(md`reflected into line 2 at $2\ \mu$s`, 30, 'V'), [[-30, md`Going toward a higher impedance ($150\to450$), the reflection keeps its sign: $\Gamma_{23} = +\tfrac12$.`]]),
        trap(N(md`into line 1 at $3\ \mu$s`, 15, 'V'), [[45, md`That uses $\tau = \tfrac32$. Going from 150 Ω down to 50 Ω, $\tau_{21} = 1 + \Gamma_{21} = \tfrac12$.`], [-15, md`A transmission coefficient is never negative: $\tau_{21} = \tfrac12$, so the 30 V wave sends $+15$ V into line 1.`]]),
      ],
      hints: [md`Follow the 40 V wave: at $t = 1\ \mu$s it hits junction 1|2 ($\times\tau_{12}$ forward, $\times\Gamma_{12}$ back). At $t = 2$ the forward part hits junction 2|3. At $t = 3$ the reflected part is back at junction 1|2, now arriving from the right.`],
      sol: md`
        **1. t = 0 to 1 µs.** The source launches $\tau_gV_g = 40$ V into line 1.

        **2. t = 1 µs, junction 1|2.** The 40 V wave splits:
        - into line 2: $\tau_{12}(40) = 60$ V;
        - back into line 1: $\Gamma_{12}(40) = 20$ V, which reaches the source at $t = 2$ and is absorbed ($\Gamma_g = 0$).

        **3. t = 2 µs, junction 2|3.** The 60 V wave splits:
        $$\tau_{23}(60) = \boxed{90\ \text{V into line 3}}\qquad \Gamma_{23}(60) = \boxed{30\ \text{V back into line 2}}$$
        The 90 V wave reaches $R_L$ at $t = 3$ and is absorbed ($\Gamma_L = 0$).

        **4. t = 3 µs, junction 1|2 from the right.** The 30 V wave splits again:
        $$\tau_{21}(30) = \boxed{15\ \text{V into line 1}}\qquad \Gamma_{21}(30) = -15\ \text{V back into line 2}$$
        **5. t = 4 µs, junction 2|3.** The $-15$ V wave gives $-22.5$ V into line 3 and $-7.5$ V back. Every round trip inside line 2 multiplies the trapped wave by $\Gamma_{23}\Gamma_{21} = -\tfrac14$.

        [[fig:bd]]

        **Speed path.** Only line 2 traps waves (both ends of the other lines are matched for waves leaving them). So follow one wave bouncing inside line 2, multiplying by $\tfrac12$ and $-\tfrac12$ at its ends, and peel off $\tfrac32$ or $\tfrac12$ of it at each hit.

        **Where points go.** Using $\tau_{21} = \tfrac32$ on the way back; giving the trapped wave the wrong sign at the 2|3 junction.
      `,
      figs: { bd: { svg: TL.diagram(sD4, { tMax: 5, w: 420, h: 340 }), cap: 'Voltage bounce diagram. Dashed verticals are the junctions; colored lines go toward the load, gray lines toward the source.' } } }),
    P({ src: 'Practice D #4(c) · 6 pts', title: 'V at the middle of line 2',
      q: md`**(c) (6 pts)** Sketch $V(300\text{ m}, t)$ for $0 < t < 6\ \mu$s. Give its value at $t = 3$, $4$ and $5\ \mu$s.`,
      parts: [
        trap(N(md`$V$ at $t = 3\ \mu$s`, 90, 'V'), [[60, md`The 30 V reflection from junction 2|3 passed $z = 300$ m at $t = 2.5\ \mu$s. Add it.`]]),
        trap(N(md`$V$ at $t = 4\ \mu$s`, 75, 'V'), [[105, md`The wave that came back from junction 1|2 is $-15$ V ($\Gamma_{21} = -\tfrac12$), not $+15$.`]]),
        N(md`$V$ at $t = 5\ \mu$s`, 67.5, 'V'),
      ],
      hints: [md`$z = 300$ m is $0.5\ \mu$s from each junction. Forward waves in line 2 pass it at $1.5, 3.5, 5.5\ \mu$s; backward waves at $2.5, 4.5\ \mu$s. Add each wave's amplitude when it arrives.`],
      sol: md`
        **1. The rule.** The voltage at a point is the sum of every wave that has passed it so far.

        **2. The arrivals at z = 300 m** (from part b):

        | $t$ (µs) | wave | $V$ after (V) |
        |---|---|---|
        | 1.5 | $+60$ forward | 60 |
        | 2.5 | $+30$ backward | 90 |
        | 3.5 | $-15$ forward | 75 |
        | 4.5 | $-7.5$ backward | 67.5 |
        | 5.5 | $+3.75$ forward | 71.25 |

        $$\boxed{V(300, 3\ \mu\text{s}) = 90\ \text{V},\ \ V(300, 4\ \mu\text{s}) = 75\ \text{V},\ \ V(300, 5\ \mu\text{s}) = 67.5\ \text{V}}$$

        [[fig:vt]]

        !!intuition Does this make sense?
          The staircase overshoots and rings around its final value, because each round trip in line 2 multiplies the correction by $-\tfrac14$: a sign flip and a shrink.

        **Speed path.** Write the list of arrival times first (odd half-microseconds here), then a running sum.

        **Where points go.** Missing the backward waves; adding a wave at the junction time instead of when it reaches the probe.
      `,
      figs: { vt: { svg: TL.plotT(sD4, 300, { tMax: 6, dc: false }), cap: 'V(300 m, t): 60, 90, 75, 67.5, 71.25 V. Each step is half the size of the one before.' } } }),
    P({ src: 'Practice D #4(d) · 6 pts', title: 'At the load',
      q: md`**(d) (6 pts)** Find the load voltage $V(600\text{ m}, t)$: its first nonzero value, when it arrives, and its value at $t = 6\ \mu$s. What current flows in $R_L$ at $t = 4\ \mu$s?`,
      parts: [
        N(md`first value of $V_L$`, 90, 'V'),
        trap(N(md`it arrives at`, 3, 'µs'), [[2, md`At $t = 2\ \mu$s the wave enters line 3; it still has 200 m (1 µs) to go.`]]),
        trap(N(md`$V_L$ at $t = 6\ \mu$s`, 67.5, 'V'), [[90, md`At $t = 5\ \mu$s a second wave, $\tau_{23}(-15) = -22.5$ V, reaches the load.`]]),
        trap(N(md`$I_L$ at $t = 4\ \mu$s`, 0.2, 'A'), [[0.6, md`That divides 90 V by $Z_{02} = 150\ \Omega$. The load current is $V_L/R_L$.`]]),
      ],
      hints: [md`$\Gamma_L = 0$: every wave that enters line 3 is absorbed by $R_L$ the moment it arrives, so $V_L$ is the running sum of the waves that entered line 3, each delayed by $1\ \mu$s.`],
      sol: md`
        **1. What reaches the load.** $\Gamma_L = 0$, so nothing reflects there. $V_L$ is the sum of the waves that crossed into line 3, each arriving 1 µs after it crossed.

        **2. The first one.** $90$ V crossed at $t = 2$:
        $$\boxed{V_L = 90\ \text{V from } t = 3\ \mu\text{s}}$$
        **3. The second one.** $\tau_{23}(-15) = -22.5$ V crossed at $t = 4$, so it arrives at $t = 5$:
        $$\boxed{V_L(6\ \mu\text{s}) = 90 - 22.5 = 67.5\ \text{V}}$$
        Then $+5.625$ V at $t = 7$ (73.1 V), and so on, each correction a quarter of the last with the opposite sign.

        **4. The load current at t = 4 µs.** Ohm's law on the resistor:
        $$I_L = \frac{90}{450}$$
        $$\boxed{I_L = 0.2\ \text{A}}$$

        [[fig:vl]]

        !!intuition Does this make sense?
          The first value, 90 V, is larger than the source's 80 V: the step-up junctions raise the voltage of a traveling wave. The load then rings: down, up, down, by ever smaller steps.

        **Speed path.** With a matched load, $V_L$ is the line-3 waves, shifted by one transit time.

        **Where points go.** Forgetting the transit time of line 3; using the wrong impedance for the current.
      `,
      figs: { vl: { svg: TL.plotT(sD4, 600, { tMax: 10, dc: false }), cap: 'V(600 m, t): 90 V, then 67.5, 73.1, 71.7 V…: it rings with shrinking steps.' } } }),
    P({ src: 'Practice D #4(e) · 6 pts', title: 'Steady state',
      q: md`**(e) (6 pts)** Find the steady-state voltage and current at $z = 300$ m, and judge the statements.`,
      parts: [
        trap(N(md`$V_{ss}$`, 72, 'V'), [[40, md`That is the first wave in line 1. In steady state the lines are plain wires, so $V = V_gR_L/(R_g + R_L)$.`], [90, md`That is the load's first value; it keeps changing.`]]),
        trap(N(md`$I_{ss}$`, 0.16, 'A'), [[0.48, md`That divides 72 V by $Z_{02}$. In steady state no wave travels, and $Z_0$ no longer relates $V$ to $I$.`]]),
        mc('Which statement is true?', [
          md`In steady state every line has the same $V$ and $I$, as if the lines were plain wires.`,
          md`Line 2 settles at a higher voltage than line 1 because $Z_{02} > Z_{01}$.`,
          md`The load voltage never settles, because a wave stays trapped in line 2 forever.`,
          md`The load voltage settles at 90 V, its first value.`], 0,
          [null, md`With nothing traveling, $V$ is continuous across each junction and constant along each line. $Z_0$ shapes only the transient.`, md`The trapped wave shrinks by $\Gamma_{21}\Gamma_{23} = -\tfrac14$ every round trip; the sum converges.`, md`Later arrivals ($-22.5$, $+5.6$, …) keep correcting it until it reaches 72 V.`]),
      ],
      hints: [md`As $t\to\infty$, a lossless line is a pair of wires: replace all three lines with wires and solve the DC circuit.`],
      sol: md`
        **1. The DC circuit.** Long after the step, nothing changes in time, so $\partial V/\partial t = 0$ and the telegrapher's equations make $V$ and $I$ constant along each line. The lines are just wires:
        $$V_{ss} = 80\cdot\frac{450}{50 + 450}$$
        $$\boxed{V_{ss} = 72\ \text{V},\qquad I_{ss} = \frac{80}{500} = 0.16\ \text{A}}$$
        the same everywhere, $z = 300$ m included.

        **2. Check with the waves.** At the load: $90(1 - \tfrac14 + \tfrac1{16} - \cdots) = \dfrac{90}{1 + 1/4} = 72$ V ✓. The geometric series converges because $|\Gamma_{21}\Gamma_{23}| < 1$.

        **3. The statements.** Only the first is true; the others are explained under each option.

        **Speed path.** Steady state never needs the bounce diagram: wires, Ohm's law, ten seconds.

        **Where points go.** Using $Z_0$ to turn $V_{ss}$ into $I_{ss}$; reading the steady state off the first few arrivals.
      ` }),
  ];
  EM.lesson('e3-prac', { id: 'e3-prac-d', order: 4, title: 'Practice exam D', kind: 'mock', sub: '75 min · 100 pts · imperfect dielectric, current sheets for circular polarization, VSWR and V(d), three lines in cascade', steps: examD });

  // ======================================================================================== EXAM E: figures
  function figE1() {
    const g = PF.fig({ alt: 'side view: air on the left, the metal (shaded) on the right of the surface z = 0; a tangential H field along the surface; inside the metal the current density shrinks with depth as a decaying curve; delta marks one skin depth' });
    const xs = 120, top = 30, bot = 190, sx = 46;
    g.rect(xs, top, 230, bot - top, { cls: 'shade nodecl' });
    g.line(xs, top, xs, bot, { cls: 'thick' });
    g.label(70, 46, '\\text{air}', 'c', 'small');
    g.label(300, 46, '\\sigma = 10^7\\,\\text{S/m}', 'c', 'small');
    g.arrow(xs - 16, 160, xs - 16, 110, { hs: 7 }); g.label(xs - 22, 134, '\\tilde{\\mathbf H}_t', 'r', 'small');
    const pts = [];
    for (let i = 0; i <= 120; i++) { const u = 4.6 * i / 120; pts.push([xs + sx * u, 170 - 90 * Math.exp(-u)]); }
    g.pl(pts, { cls: 'curve' });
    g.line(xs, 170, xs + 225, 170, { cls: 'dim thin' });
    g.label(xs + 8, 76, '|\\mathbf J|', 'bl', 'small');
    g.line(xs + sx, 166, xs + sx, 174, { cls: 'dim' }); g.label(xs + sx, 176, '\\delta', 't', 'small');
    g.arrow(xs + 140, 150, xs + 210, 150, { cls: 'dim', hs: 6 }); g.label(xs + 214, 150, 'z', 'l', 'small accent');
    return g.svg();
  }
  function figE2() {
    const g = PF.fig({ alt: 'side view: a dielectric with epsilon = 4 epsilon0 fills z < 0; a perfect conductor (hatched wall) fills z > 0; the incident wave travels toward the wall with E along x' });
    const xw = 300;
    g.wall(xw, 30, 190, { side: 'right', t: 14 });
    g.label(xw + 20, 20, '\\text{PEC}', 'c', 'small');
    g.arrow(20, 150, xw + 40, 150, { cls: 'dim', hs: 7 }); g.label(xw + 44, 150, 'z', 'l', 'small accent');
    g.label(xw - 6, 160, 'z = 0', 'tr', 'small');
    g.label(150, 40, '\\mu_0,\\ \\epsilon = 4\\epsilon_0', 'c', 'small');
    g.arrow(110, 96, 210, 96, { hs: 8 }); g.label(160, 104, '\\tilde{\\mathbf E}_i = 6\\pi e^{-j\\beta z}\\,\\hat x', 't', 'small');
    g.arrow(60, 128, 60, 74, { hs: 7 }); g.label(66, 76, 'x', 'l', 'small accent');
    return g.svg();
  }
  function figE3() {
    const g = PF.fig({ alt: 'cross-section of the parallel-plate line, looking along the direction of travel: two horizontal plates of width W separated by d; E points up between the plates and H points to the right; the wave travels into the page' });
    const x0 = 60, x1 = 300, yT = 60, yB = 124;
    g.line(x0, yT, x1, yT, { cls: 'thick' }); g.line(x0, yB, x1, yB, { cls: 'thick' });
    for (const x of [96, 150, 204, 258]) g.arrow(x, yB - 6, x, yT + 8, { hs: 6 });
    g.label(118, 92, '\\mathbf E', 'c', 'small');
    g.arrow(214, 92, 246, 92, { cls: 'dim', hs: 6 }); g.label(250, 92, '\\mathbf H', 'l', 'small');
    g.dim(x0, yB + 18, x1, yB + 18, 'W', { at: 'b' });
    g.dim(x1 + 18, yT, x1 + 18, yB, 'd', { at: 'r' });
    g.label(x0 - 6, yT, '\\text{plate 2}', 'r', 'small'); g.label(x0 - 6, yB, '\\text{plate 1}', 'r', 'small');
    g.arrow(352, 30, 352, 4, { hs: 6 }); g.label(358, 6, 'x', 'l', 'small accent');
    g.arrow(352, 30, 378, 30, { hs: 6 }); g.label(382, 30, 'y', 'l', 'small accent');
    g.otimes(352, 30, 5); g.label(352, 40, 'z\\ (\\text{in})', 't', 'small accent');
    return g.svg();
  }
  const figE4c = () => lineFig([
    { t: 'gen', R: 'R_g = 25\\,\\Omega', V: 'V_g(t)' },
    { t: 'line', w: 210, lab: 'Z_0 = 50\\,\\Omega', sub: 'v = 1.5\\times10^8\\,\\text{m/s}' },
    { t: 'load', kind: 'open' },
  ], { alt: 'a pulse source with Rg = 25 ohms drives a 300 m line of 50 ohms whose far end is open; the z axis marks 0, 150 and 300 m', axis: { dir: 'z', ticks: [[1, '0'], [1, '150', 0.5], [2, '300']] } });
  const figE4p = () => plot({ w: 220, h: 150, x: [0, 2.2], y: [0, 36], xl: 't\\,(\\mu\\text{s})', yl: 'V_g\\,(\\text{V})', xt: [[1, '1']], yt: [[30, '30']], curves: [{ pts: [[0, 0], [0, 30], [1, 30], [1, 0], [2.1, 0]] }] });
  const sE4 = TL.solve({ Vg: 30, Rg: 25, RL: Infinity, sections: [{ Z0: 50, len: 300, v: 150 }], tMax: 9 });
  const snapE4 = () => {
    // the pulse = step(t) - step(t - 1 us); its only edge at t = 2.5 us is at z = 225 m
    const V = (z) => TL.valueAt(sE4, z, 2.5) - TL.valueAt(sE4, z, 1.5);
    const pts = [[0, V(1)], [225, V(224)], [225, V(226)], [300, V(299)]];
    return plot({ w: 380, h: 200, x: [0, 315], y: [-5, 46], zero: true, xl: 'z\\,(\\text{m})', yl: 'V(z, 2.5\\,\\mu\\text{s})\\ (\\text{V})', xt: [[150, '150'], [225, '225'], [300, '300']], yt: [[20, '20'], [40, '40']], curves: [{ pts }] });
  };
  const figE2env = () => plot({
    w: 380, h: 210, x: [-0.5, 0.02], y: [0, 1.25], xl: 'z\\,(\\text{m})', yl: '\\text{relative size}',
    xt: [[-0.5, '-0.5'], [-0.375, '-0.375'], [-0.25, '-0.25'], [-0.125, '-0.125'], [0, '0']], yt: [[1, '1']],
    curves: [
      { f: (z) => Math.abs(Math.sin(4 * PI * z)), n: 400, lab: '|\\tilde E|/12\\pi', labAt: -0.42, dx: -10, dy: -14 },
      { f: (z) => Math.abs(Math.cos(4 * PI * z)), n: 400, cls: 'dash', lab: '|\\tilde H|/0.2', labAt: -0.25, dx: 6, dy: -12 },
    ],
  });

  // ======================================================================================== EXAM E
  const examE = [
    R(md`
      ${RULES}

      ${HOWTO}

      ${CONSTS}

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | A good conductor: loss tangent, skin depth at three frequencies, surface resistance, absorbed power | 24 |
      | 2 | A standing wave in front of a perfect conductor: fields, nodes, energy, a probe, radiation pressure | 26 |
      | 3 | A parallel-plate line from its fields: $L$, $C$, $G$, $Z_0$, $v$, changing the width | 22 |
      | 4 | A pulse on an open line: bounce diagram, $V(t)$ at the middle, a snapshot, energy | 28 |

      **Draws on:** [good conductors and skin depth](#/l/w2-limits), [power and surface resistance](#/l/w2-loss), [reflection](#/l/w4-gamma), [standing waves](#/l/w4-standing), [fields to telegrapher's equations](#/l/w5-telegraph), [launching and reflecting](#/l/w5-launch) and [bounce diagrams](#/l/w5-bounce).
    `),

    // ---------------------------------------------------------------- E Problem 1
    RF(md`
      ### Problem 1 (24 points): a good conductor

      A plane wave in air strikes a flat metal surface at normal incidence. The metal has $\sigma = 10^7$ S/m, $\mu = \mu_0$ and $\epsilon = \epsilon_0$. At $f = 100$ MHz the tangential magnetic field just at the surface has the phasor amplitude $|\tilde H_t| = 10$ A/m. Leave $\pi$ in your answers where it appears; $\pi^2 \approx 10$ is fine for an estimate.

      [[fig:e1]]
    `, { e1: { svg: figE1(), cap: 'The current flows in a thin layer under the surface; its density falls by 1/e every skin depth δ.' } }),
    P({ src: 'Practice E #1(a) · 4 pts', title: 'Is it a good conductor?',
      q: md`**(a) (4 pts)** Find the loss tangent $\sigma/\omega\epsilon$ of the metal at 100 MHz.`,
      parts: [trap(N(md`$\sigma/\omega\epsilon$`, 1.8e9, ''), [[1.13e10, md`That uses $f$ in place of $\omega = 2\pi f$.`]])],
      hints: [md`$\omega\epsilon_0 = \dfrac{f}{18\times10^9}$ S/m, so $\tfrac{1}{180}$ S/m at 100 MHz.`],
      sol: md`
        **1. The displacement part.**
        $$\omega\epsilon_0 = (2\pi\times10^8)\frac{10^{-9}}{36\pi} = \frac{2\times10^{-1}}{36} = \frac{1}{180}\ \text{S/m}$$
        **2. The ratio.**
        $$\frac{\sigma}{\omega\epsilon_0} = 10^7\times180$$
        $$\boxed{\frac{\sigma}{\omega\epsilon} = 1.8\times10^9 \gg 1}$$
        The conduction current is almost two billion times the displacement current: a **good conductor**, and the "$1 \ll \sigma/\omega\epsilon$" column of the sheet applies.

        **Speed path.** $\omega\epsilon_0 = 1/180$ S/m at 100 MHz; multiply.

        **Where points go.** $f$ for $\omega$ (off by $2\pi$, harmless for the verdict, wrong for the number).
      ` }),
    P({ src: 'Practice E #1(b) · 4 pts', title: 'Skin depth',
      q: md`**(b) (4 pts)** Find the skin depth $\delta$ and the attenuation constant $\alpha$ at 100 MHz.`,
      parts: [
        trap(N('\\delta', 1e6 / (2 * PI * 1e4), 'µm'), [[11.25, md`That uses $\alpha = \sqrt{\omega\mu\sigma}$. The square root of $j$ brings a $\tfrac12$: $\alpha = \sqrt{\omega\mu\sigma/2} = \sqrt{\pi f\mu\sigma}$.`]]),
        N('\\alpha', 2 * PI * 1e4, 'Np/m'),
      ],
      hints: [md`In a good conductor $\gamma^2 \approx j\omega\mu\sigma$, and $\sqrt j = (1 + j)/\sqrt2$. So $\alpha = \beta = \sqrt{\pi f\mu\sigma}$ and $\delta = 1/\alpha$.`],
      sol: md`
        **1. γ in a good conductor.** $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$, and $\sigma \gg \omega\epsilon$ lets you drop $j\omega\epsilon$:
        $$\gamma^2 \approx j\omega\mu\sigma$$
        The square root of $j = e^{j90°}$ is $e^{j45°} = (1 + j)/\sqrt2$:
        $$\gamma \approx (1 + j)\sqrt{\frac{\omega\mu\sigma}{2}}$$
        So $\alpha = \beta = \sqrt{\omega\mu\sigma/2} = \sqrt{\pi f\mu\sigma}$.

        **2. Numbers.** Collect the powers of ten and the $\pi$'s:
        $$\pi f\mu\sigma = \pi(10^8)(4\pi\times10^{-7})(10^7)$$
        The $\pi$'s give $4\pi^2$ and the powers of ten give $10^{8 - 7 + 7} = 10^8$:
        $$\pi f\mu\sigma = 4\pi^2\times10^8$$
        $$\boxed{\alpha = \sqrt{4\pi^2\times10^8} = 2\pi\times10^4\ \text{Np/m}}$$
        **3. Skin depth.** The amplitude falls by $1/e$ in $\delta = 1/\alpha$:
        $$\delta = \frac{1}{2\pi\times10^4}\ \text{m}$$
        $$\boxed{\delta \approx 15.9\ \mu\text{m}}$$

        !!intuition Does this make sense?
          Tens of microns at 100 MHz is typical of metals: a sheet of foil is already many skin depths thick. And $\beta = \alpha$: the wave inside decays by $e^{-2\pi} \approx 0.002$ in one wavelength. It is barely a wave at all.

        **Speed path.** $\delta = 1/\sqrt{\pi f\mu\sigma}$; group $\pi\cdot4\pi = 4\pi^2$ so the root is $2\pi$ times a power of ten.

        **Where points go.** Dropping the $\tfrac12$ ($\sqrt{\omega\mu\sigma}$); losing a power of ten.
      ` }),
    P({ src: 'Practice E #1(c) · 4 pts', title: 'Two more frequencies',
      q: md`**(c) (4 pts)** Find the skin depth at 400 MHz and at 1 MHz.`,
      parts: [
        trap(N('\\delta\\ \\text{at 400 MHz}', 1e6 / (4 * PI * 1e4), 'µm'), [[1e6 / (8 * PI * 1e4), md`That divides by 4. $\delta \propto 1/\sqrt f$: four times the frequency halves it.`]]),
        trap(N('\\delta\\ \\text{at 1 MHz}', 1e7 / (2 * PI * 1e4), 'µm'), [[1e8 / (2 * PI * 1e4), md`That scales with $1/f$. $\delta \propto 1/\sqrt f$: a hundredth of the frequency makes it ten times thicker.`]]),
      ],
      hints: [md`$\delta = 1/\sqrt{\pi f\mu\sigma} \propto 1/\sqrt f$. Scale part (b).`],
      sol: md`
        **1. Scaling.** Only $f$ changes, and $\delta \propto f^{-1/2}$.

        **2. 400 MHz** is 4 times the frequency, so $\delta$ divides by $\sqrt4 = 2$:
        $$\boxed{\delta_{400} = \frac{15.9}{2} \approx 7.96\ \mu\text{m}}$$
        **3. 1 MHz** is $\tfrac{1}{100}$ of the frequency, so $\delta$ multiplies by $\sqrt{100} = 10$:
        $$\boxed{\delta_{1} \approx 159\ \mu\text{m}}$$

        !!intuition Does this make sense?
          Lower frequencies reach deeper. At 60 Hz this metal's skin depth would be about 2 cm, which is why very thick power conductors gain little from the metal at their centers.

        **Speed path.** Ratio of frequencies, square root, done. Never recompute from scratch.

        **Where points go.** Scaling with $1/f$ instead of $1/\sqrt f$.
      ` }),
    P({ src: 'Practice E #1(d) · 4 pts', title: 'Surface resistance',
      q: md`**(d) (4 pts)** At 100 MHz, find the surface resistance $R_s$ and the size of the metal's intrinsic impedance $|\eta_c|$, both in mΩ.`,
      parts: [
        trap(N('R_s', 2 * PI, 'mΩ'), [[2 * Math.SQRT2 * PI, md`That is $|\eta_c|$. $R_s$ is its real part, $|\eta_c|\cos45°$.`]]),
        trap(N('|\\eta_c|', 2 * Math.SQRT2 * PI, 'mΩ'), [[4 * PI, md`That adds the real and imaginary parts. The size of $(1 + j)R_s$ is $\sqrt2\,R_s$.`]]),
      ],
      hints: [md`In a good conductor $\eta_c = \sqrt{j\omega\mu/\sigma} = (1 + j)\sqrt{\omega\mu/2\sigma} = \dfrac{1 + j}{\sigma\delta}$. $R_s = \Re\{\eta_c\} = 1/(\sigma\delta)$.`],
      sol: md`
        **1. η in a good conductor.** $\eta = \sqrt{\mu/(\epsilon - j\sigma/\omega)}$. Drop $\epsilon$ next to $\sigma/\omega$:
        $$\eta_c \approx \sqrt{\frac{j\omega\mu}{\sigma}} = (1 + j)\sqrt{\frac{\omega\mu}{2\sigma}}$$
        Since $\delta = \sqrt{2/\omega\mu\sigma}$, the root equals $1/(\sigma\delta)$:
        $$\eta_c = \frac{1 + j}{\sigma\delta}$$
        **2. Surface resistance.** $R_s$ is the real part:
        $$R_s = \frac{1}{\sigma\delta} = \frac{2\pi\times10^4}{10^7}$$
        $$\boxed{R_s = 2\pi\times10^{-3}\ \Omega \approx 6.28\ \text{m}\Omega}$$
        **3. Size.** $|1 + j| = \sqrt2$:
        $$\boxed{|\eta_c| = 2\sqrt2\,\pi\ \text{m}\Omega \approx 8.89\ \text{m}\Omega}$$
        at an angle of $45°$.

        !!intuition Does this make sense?
          $R_s = 1/(\sigma\delta)$ is the DC resistance of a square of the metal (any size of square) that is one skin depth thick: the current behaves as if it flowed uniformly in that layer. And $|\eta_c|$ is about 40,000 times smaller than $\eta_0$: to a wave in air the metal looks almost like a short circuit.

        **Speed path.** $R_s = \alpha/\sigma$ (the lecture's form): $2\pi\times10^4/10^7$.

        **Where points go.** Calling $|\eta_c|$ the surface resistance; forgetting the factor $\sqrt2$.
      ` }),
    P({ src: 'Practice E #1(e) · 4 pts', title: 'Power absorbed',
      q: md`**(e) (4 pts)** How much time-averaged power per square meter does the metal absorb at 100 MHz, with $|\tilde H_t| = 10$ A/m at its surface?`,
      parts: [trap(N(md`$\langle P\rangle/A$`, 0.1 * PI, 'W/m^2'), [[0.2 * PI, md`That forgets the $\tfrac12$ of the time average.`], [0.5 * 100 * 2 * Math.SQRT2 * PI * 1e-3, md`That uses $|\eta_c|$. Only the real part, $R_s$, absorbs power.`]])],
      hints: [md`The power that enters the metal is $\langle S\rangle$ at its surface, $\tfrac12\Re\{\tilde E_t\tilde H_t^*\}$, with $\tilde E_t = \eta_c\tilde H_t$ inside the metal.`],
      sol: md`
        **1. Poynting at the surface.** Just inside the metal the wave has $\tilde E_t = \eta_c\tilde H_t$. The power per area flowing in is
        $$\langle S\rangle = \tfrac12\Re\{\tilde E_t\tilde H_t^*\} = \tfrac12|\tilde H_t|^2\,\Re\{\eta_c\}$$
        and $\Re\{\eta_c\} = R_s$:
        $$\langle S\rangle = \tfrac12|\tilde H_t|^2R_s$$
        **2. The same thing as a circuit.** The surface current is $|\tilde J_s| = |\tilde H_t|$ (from $\hat n\times\mathbf H$), flowing through a sheet of resistance $R_s$: $\tfrac12|\tilde J_s|^2R_s$, Joule heating. Same formula.

        **3. Numbers.**
        $$\langle P\rangle/A = \tfrac12(10)^2(2\pi\times10^{-3})$$
        $$\boxed{\langle P\rangle/A = 0.1\pi \approx 0.314\ \text{W/m}^2}$$

        **Speed path.** $\tfrac12H^2R_s$: $50\times6.28$ mW.

        **Where points go.** $|\eta_c|$ in place of $R_s$; the missing $\tfrac12$.
      ` }),
    P({ src: 'Practice E #1(f) · 4 pts', title: 'Four times the frequency',
      q: md`**(f) (4 pts)** The frequency is raised to 400 MHz and the surface field is kept at $|\tilde H_t| = 10$ A/m. The current now flows in a layer half as thick. How much power per square meter does the metal absorb?`,
      parts: [trap(N(md`$\langle P\rangle/A$ at 400 MHz`, 0.2 * PI, 'W/m^2'), [[0.05 * PI, md`A thinner layer does not mean less loss. The same current squeezed into half the thickness meets twice the resistance.`], [0.1 * PI, md`$R_s$ depends on frequency: $R_s = 1/(\sigma\delta)$ and $\delta$ halved.`], [0.4 * PI, md`$R_s \propto \sqrt f$, not $f$: four times the frequency doubles it.`]])],
      hints: [md`$R_s = 1/(\sigma\delta)$. What happened to $\delta$?`],
      sol: md`
        !!trap The trap
          "Thinner layer, less metal, less heat" is backwards. The surface current is fixed by $H_t$ (it is $\hat n\times\mathbf H$), so the same current is squeezed into half the thickness, and the resistance it meets doubles.

        **1. The surface resistance at 400 MHz.** $\delta$ halves (part c), so
        $$R_s = \frac{1}{\sigma\delta} = 2\times2\pi\ \text{m}\Omega = 4\pi\ \text{m}\Omega$$
        **2. The power.**
        $$\langle P\rangle/A = \tfrac12(10)^2(4\pi\times10^{-3})$$
        $$\boxed{\langle P\rangle/A = 0.2\pi \approx 0.628\ \text{W/m}^2}$$

        !!intuition Does this make sense?
          $R_s = \sqrt{\pi f\mu/\sigma}$ grows as $\sqrt f$. That is why microwave cavities are silver-plated and why loss in metals rises with frequency.

        **Speed path.** Absorbed power $\propto R_s \propto \sqrt f$: ×4 in frequency is ×2 in power.

        **Where points go.** Halving instead of doubling; scaling with $f$ instead of $\sqrt f$.
      ` }),

    // ---------------------------------------------------------------- E Problem 2
    RF(md`
      ### Problem 2 (26 points): a standing wave in front of a mirror

      The region $z < 0$ is a lossless dielectric with $\mu = \mu_0$ and $\epsilon = 4\epsilon_0$. A perfect conductor fills $z > 0$. A wave at $f = 300$ MHz arrives from the left:
      $$\tilde{\mathbf E}_i = 6\pi\,e^{-j\beta z}\,\hat x\ \ \text{V/m}$$

      [[fig:e2]]
    `, { e2: { svg: figE2(), cap: 'The wave hits the perfect conductor at z = 0 and reflects completely.' } }),
    P({ src: 'Practice E #2(a) · 4 pts', title: 'The total electric field',
      q: md`**(a) (4 pts)** Write the total $\tilde{\mathbf E}$ in $z < 0$, and give the largest $|\tilde{\mathbf E}|$ anywhere.`,
      parts: [
        mc(md`$\tilde{\mathbf E}(z) =$`, [md`$-j12\pi\sin(4\pi z)\,\hat x$ V/m`, md`$12\pi\cos(4\pi z)\,\hat x$ V/m`, md`$j12\pi\sin(4\pi z)\,\hat x$ V/m`, md`$-j12\pi\sin(2\pi z)\,\hat x$ V/m`], 0,
          [null, md`That is not zero at $z = 0$, but tangential $\mathbf E$ must vanish on a perfect conductor. (It is the shape of $H$.)`, md`Sign: $e^{-j\theta} - e^{j\theta} = -2j\sin\theta$.`, md`$\beta = 2\pi$ is the free-space value at 300 MHz. In $\epsilon_r = 4$ the wave is twice as slow: $\beta = 4\pi$.`]),
        trap(N(md`$|\tilde{\mathbf E}|_{\max}$`, 12 * PI, 'V/m'), [[6 * PI, md`That is the incident amplitude. At the maxima the reflected wave adds in phase: twice as much.`]]),
      ],
      hints: [md`$\beta = \omega\sqrt{\mu\epsilon} = 2\omega/c$. The conductor forces $\tilde E_x(0) = 0$, so $\Gamma = -1$: $\tilde{\mathbf E}_r = -6\pi\,e^{+j\beta z}\,\hat x$.`],
      sol: md`
        **1. The medium.** $v = c/\sqrt4 = 1.5\times10^8$ m/s, so
        $$\beta = \frac{\omega}{v} = \frac{2\pi\times3\times10^8}{1.5\times10^8} = 4\pi\ \text{rad/m}$$
        $\lambda = 0.5$ m and $\eta = 120\pi/2 = 60\pi\ \Omega$.

        **2. Γ at the mirror.** Tangential $\mathbf E$ is zero on a perfect conductor, so at $z = 0$ the incident and reflected fields must cancel: $\Gamma = -1$ and
        $$\tilde{\mathbf E}_r = -6\pi\,e^{+j4\pi z}\,\hat x$$
        **3. Add them.**
        $$\tilde E_x = 6\pi\left(e^{-j4\pi z} - e^{+j4\pi z}\right)$$
        Use $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$, so the bracket is $-2j\sin(4\pi z)$:
        $$\boxed{\tilde{\mathbf E} = -j12\pi\sin(4\pi z)\,\hat x\ \text{V/m}}$$
        $$\boxed{|\tilde{\mathbf E}|_{\max} = 12\pi \approx 37.7\ \text{V/m}}$$

        !!intuition Does this make sense?
          Zero at the wall ✓. No $e^{\mp j\beta z}$ left: the pattern does not travel. The peak is twice the incident amplitude, where the two waves arrive in phase.

        **Speed path.** PEC at $z = 0$: $\tilde E = -2jE_0\sin\beta z$, $\tilde H = (2E_0/\eta)\cos\beta z$. Only $\beta$ and $\eta$ need computing.

        **Where points go.** Free-space $\beta$; the sign of $-2j$; a cosine for $E$.
      ` }),
    P({ src: 'Practice E #2(b) · 4 pts', title: 'H and the surface current',
      q: md`**(b) (4 pts)** Find $|\tilde{\mathbf H}|$ at the wall, and the surface current $\tilde{\mathbf J}_s$ on the conductor.`,
      parts: [
        trap(N(md`$|\tilde{\mathbf H}|$ at $z = 0$`, 0.2, 'A/m'), [[0.1, md`That is the incident $H$ alone. At the wall the reflected $H$ adds in phase: it doubles.`], [0.05, md`That uses $\eta_0 = 120\pi$. In this dielectric $\eta = 60\pi$.`]]),
        mc(md`$\tilde{\mathbf J}_s$ points along`, [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat y$`, md`$+\hat z$`], 0,
          [null, md`That uses $\hat n = +\hat z$. The normal in $\hat n\times\mathbf H$ points out of the conductor, into the region where the field is: $-\hat z$.`, md`$\mathbf J_s = \hat n\times\mathbf H$ is perpendicular to $\mathbf H$ (along $\hat y$).`, md`A surface current flows along the surface, never through it.`]),
      ],
      hints: [md`$\tilde{\mathbf H}_i = (6\pi/\eta)\,e^{-j\beta z}\,\hat y$. For the reflected wave going toward $-z$, $\tilde{\mathbf H}_r = \frac1\eta(-\hat z)\times\tilde{\mathbf E}_r$.`, md`$\tilde{\mathbf J}_s = \hat n\times\tilde{\mathbf H}$ with $\hat n$ pointing from the conductor into the dielectric.`],
      sol: md`
        **1. The two H waves.** Incident, toward $+z$: $\tilde{\mathbf H}_i = \frac1\eta\hat z\times\tilde{\mathbf E}_i = \frac{6\pi}{60\pi}e^{-j4\pi z}\,\hat y$. Reflected, toward $-z$:
        $$\tilde{\mathbf H}_r = \frac1\eta(-\hat z)\times(-6\pi e^{j4\pi z}\hat x) = 0.1\,e^{j4\pi z}\,\hat y$$
        **2. Add them.** $e^{-j\theta} + e^{j\theta} = 2\cos\theta$:
        $$\tilde{\mathbf H} = 0.2\cos(4\pi z)\,\hat y\ \text{A/m}$$
        $$\boxed{|\tilde{\mathbf H}(0)| = 0.2\ \text{A/m}}$$
        **3. Surface current.** $\hat n = -\hat z$ (out of the conductor):
        $$\tilde{\mathbf J}_s = (-\hat z)\times0.2\,\hat y = 0.2\,\hat x$$
        $$\boxed{\tilde{\mathbf J}_s = 0.2\,\hat x\ \text{A/m}}$$

        !!intuition Does this make sense?
          The surface current flows along $\mathbf E_i$'s direction, $\hat x$: it is the current the incident field drives in the mirror, and it radiates the reflected wave (a current sheet makes a field opposing its current, which cancels $\mathbf E$ at the wall ✓).

        **Speed path.** $|H|_{\text{wall}} = 2E_0/\eta$, and $|J_s| = |H|_{\text{wall}}$.

        **Where points go.** The direction of $\hat n$; forgetting the doubling.
      ` }),
    P({ src: 'Practice E #2(c) · 5 pts', title: 'Nodes and loops',
      q: md`**(c) (5 pts)** How far from the wall is the nearest maximum of $|\tilde{\mathbf E}|$? How far apart are neighboring nulls of $|\tilde{\mathbf E}|$? Where are the maxima of $|\tilde{\mathbf H}|$?`,
      parts: [
        trap(N(md`wall to nearest $|E|$ maximum`, 0.125, 'm'), [[0.25, md`That is $\lambda/2$, the null-to-null spacing. The first maximum is a quarter wavelength out.`], [0.375, md`That uses the free-space wavelength, 1 m. Here $\lambda = 0.5$ m.`]]),
        trap(N(md`spacing of $|E|$ nulls`, 0.25, 'm'), [[0.5, md`That is a full wavelength. $|\sin\beta z|$ repeats every half wavelength.`]]),
        mc(md`The maxima of $|\tilde{\mathbf H}|$ are`, [md`at the wall and every 0.25 m from it, where $E$ is zero`, md`at the maxima of $|\tilde{\mathbf E}|$`, md`nowhere: $|\tilde{\mathbf H}|$ is the same everywhere`, md`only at the wall`], 0,
          [null, md`$|\tilde H| \propto |\cos\beta z|$ and $|\tilde E| \propto |\sin\beta z|$: their maxima alternate.`, md`That would be a traveling wave. A standing wave has a $\cos$ pattern.`, md`$|\cos\beta z|$ peaks every half wavelength, not only at $z = 0$.`]),
      ],
      hints: [md`$|\tilde E| \propto |\sin4\pi z|$: zero where $4\pi z = -n\pi$, largest where $4\pi z = -\pi/2, -3\pi/2, \ldots$`],
      sol: md`
        **1. E nulls.** $\sin(4\pi z) = 0$ at $4\pi z = 0, -\pi, -2\pi, \ldots$, so at
        $$z = 0,\ -0.25,\ -0.5\ \text{m}, \ldots$$
        $$\boxed{\text{null spacing} = \lambda/2 = 0.25\ \text{m}}$$
        **2. E maxima.** $|\sin(4\pi z)| = 1$ at $4\pi z = -\pi/2$, the first one at
        $$\boxed{z = -\lambda/4 = -0.125\ \text{m}}$$
        **3. H maxima.** $|\cos(4\pi z)| = 1$ where $\sin = 0$: at the wall and every 0.25 m, exactly at the $E$ nulls.

        [[fig:env]]

        !!intuition Does this make sense?
          The wall is an $E$ null (a short circuit for $E$) and an $H$ maximum (the full surface current flows there). A quarter wavelength away the roles swap, just as on a shorted transmission line: $V \propto \sin\beta d$, $I \propto \cos\beta d$.

        **Speed path.** Short at the wall: $E$ nulls at multiples of $\lambda/2$, $E$ maxima at odd multiples of $\lambda/4$. Get $\lambda$ in the medium first.

        **Where points go.** Using the free-space wavelength.
      `,
      figs: { env: { svg: figE2env(), cap: 'The envelopes: |E| (solid) is zero at the wall and every λ/2; |H| (dashed) is largest exactly there.' } } }),
    P({ src: 'Practice E #2(d) · 5 pts', title: 'Energy and power',
      q: md`**(d) (5 pts)** Find the time-averaged total energy density $\langle w_e + w_m\rangle$ at any $z$, and judge the statements.`,
      parts: [
        trap(N(md`$\langle w_e + w_m\rangle$`, 4 * PI, 'nJ/m^3'), [[8 * PI, md`That uses $\tfrac12\epsilon|\tilde E|^2$. For phasor amplitudes the time average is $\tfrac14\epsilon|\tilde E|^2$.`], [PI, md`That uses $\epsilon_0$ in place of $4\epsilon_0$.`]]),
        mc('Which statement is true?', [
          md`$\langle\mathbf S\rangle = 0$ everywhere, but $\mathbf S(z,t)$ is not zero: energy sloshes back and forth between the $E$ maxima and the $H$ maxima.`,
          md`$\mathbf S(z,t) = 0$ at every point and every instant.`,
          md`$\langle\mathbf S\rangle$ points toward the wall: the incident wave keeps delivering power to the conductor.`,
          md`The time-averaged **electric** energy density is the same at every $z$.`], 0,
          [null, md`$E \propto \sin\beta z\sin\omega t$ and $H \propto \cos\beta z\cos\omega t$, so $S \propto \sin2\beta z\sin2\omega t$: zero on average, not at each instant.`, md`A perfect conductor absorbs nothing. The reflected wave carries back exactly what the incident wave brings.`, md`$\langle w_e\rangle \propto \sin^2\beta z$: zero at the wall, largest a quarter wave out. Only the total is uniform.`]),
      ],
      hints: [md`$\langle w_e\rangle = \tfrac14\epsilon|\tilde E|^2$, $\langle w_m\rangle = \tfrac14\mu|\tilde H|^2$, and $\mu/\eta^2 = \epsilon$.`],
      sol: md`
        **1. Time domain.** Multiply each phasor by $e^{j\omega t}$ and take the real part. Since $\Re\{-je^{j\omega t}\} = \sin\omega t$:
        $$\mathbf E = 12\pi\sin(4\pi z)\sin(\omega t)\,\hat x$$
        $$\mathbf H = 0.2\cos(4\pi z)\cos(\omega t)\,\hat y$$
        $E$ and $H$ are $90°$ apart in time and a quarter wavelength apart in space.

        **2. ⟨S⟩.** $\tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$ has the factor $-j12\pi\sin(4\pi z)\cdot0.2\cos(4\pi z)$, which is purely imaginary. So $\langle\mathbf S\rangle = 0$ at every $z$. The instantaneous $\mathbf S = \mathbf E\times\mathbf H \propto \sin(8\pi z)\sin(2\omega t)\,\hat z$ is not zero: energy flows back and forth over each quarter wavelength, twice per period.

        **3. Energy.** Write $E_0 = 6\pi$. Electric and magnetic:
        $$\langle w_e\rangle = \tfrac14\epsilon(2E_0)^2\sin^2\beta z = \epsilon E_0^2\sin^2\beta z$$
        $$\langle w_m\rangle = \tfrac14\mu\frac{(2E_0)^2}{\eta^2}\cos^2\beta z = \epsilon E_0^2\cos^2\beta z$$
        using $\mu/\eta^2 = \epsilon$. Add them; $\sin^2 + \cos^2 = 1$:
        $$\langle w\rangle = \epsilon E_0^2 = 4\epsilon_0(36\pi^2)$$
        With $\epsilon_0 = 10^{-9}/(36\pi)$, the $36\pi$ cancels:
        $$\boxed{\langle w\rangle = 4\pi\times10^{-9}\ \text{J/m}^3 \approx 12.6\ \text{nJ/m}^3}$$

        !!intuition Does this make sense?
          The total is uniform even though each part is not: where $E$ is weak, $H$ is strong. And it is twice the energy density of the incident wave alone ($\tfrac12\epsilon E_0^2$): incident plus reflected, with the cross terms averaging out over space.

        **Speed path.** Standing wave at a mirror: $\langle w\rangle = \epsilon E_0^2$ everywhere, and $\langle\mathbf S\rangle = 0$.

        **Where points go.** $\tfrac12$ for $\tfrac14$; $\epsilon_0$ for $\epsilon$; claiming $\mathbf S(t) = 0$.
      ` }),
    P({ src: 'Practice E #2(e) · 4 pts', title: 'A probe measures the dielectric',
      q: md`**(e) (4 pts)** The dielectric is replaced by an unknown nonmagnetic one, still at 300 MHz. A small electric-field probe slid along $z$ reads zero at points 0.2 m apart. Find $\epsilon_r$.`,
      parts: [trap(N('\\epsilon_r', 6.25, ''), [[25, md`Neighboring nulls are $\lambda/2$ apart, not $\lambda$: $\lambda = 0.4$ m.`], [2.5, md`$v = c/\sqrt{\epsilon_r}$: square the ratio $c/v = 2.5$.`]])],
      hints: [md`Nulls $\lambda/2$ apart give $\lambda$; then $v = \lambda f$ and $\sqrt{\epsilon_r} = c/v$.`],
      sol: md`
        **1. Wavelength.** The probe reads $|\tilde E| \propto |\sin\beta z|$, and its zeros are $\lambda/2$ apart:
        $$\lambda = 2(0.2) = 0.4\ \text{m}$$
        **2. Speed.**
        $$v = \lambda f = 0.4\times3\times10^8 = 1.2\times10^8\ \text{m/s}$$
        **3. Permittivity.** $\sqrt{\epsilon_r} = c/v = 2.5$:
        $$\boxed{\epsilon_r = 6.25}$$

        !!intuition Does this make sense?
          A slower wave, a shorter wavelength, closer nulls, a larger $\epsilon_r$ ✓. This is the slotted-line measurement: it needs only a ruler and a frequency.

        **Speed path.** $\epsilon_r = \left(\dfrac{c}{2f\,\Delta z}\right)^2 = \left(\dfrac{3\times10^8}{1.2\times10^8}\right)^2$.

        **Where points go.** Null spacing $= \lambda$; forgetting to square.
      ` }),
    P({ src: 'Practice E #2(f) · 4 pts', title: 'Radiation pressure',
      q: md`**(f) (4 pts)** Back to $\epsilon = 4\epsilon_0$. Find the time-averaged pressure the wave exerts on the conductor.`,
      parts: [trap(N(md`$\langle p\rangle$`, 4 * PI * 1e-9, 'N/m^2'), [[8 * PI * 1e-9, md`That forgets that $\cos^2\omega t$ averages to $\tfrac12$.`], [2 * PI * 1e-9, md`That counts only the incident momentum, $\langle S_i\rangle/v$. A reflected wave carries the same momentum back: $2\langle S_i\rangle/v$.`]])],
      hints: [md`The force per area on a surface current is $\mathbf J_s\times\mathbf B_{\text{avg}}$, where $\mathbf B_{\text{avg}} = \tfrac12\mu_0\mathbf H$ is the average of the field just outside and the zero field inside.`, md`Or: $\langle p\rangle = 2\langle S_i\rangle/v$ for a perfect mirror.`],
      sol: md`
        **1. Force on the surface current.** The magnetic force per unit area on a current sheet is $\mathbf J_s\times\mathbf B$, with $\mathbf B$ the average of the fields on its two sides: $\mu_0H$ outside and 0 inside. At the wall, in the time domain, $J_s = H = 0.2\cos\omega t$:
        $$p(t) = J_s\cdot\tfrac12\mu_0H = \tfrac12\mu_0(0.2)^2\cos^2\omega t$$
        Direction: $\hat x\times\hat y = +\hat z$, into the conductor: it pushes.

        **2. Time average.** $\langle\cos^2\rangle = \tfrac12$:
        $$\langle p\rangle = \tfrac14\mu_0(0.04) = 0.01\mu_0$$
        $$\boxed{\langle p\rangle = 4\pi\times10^{-9}\ \text{N/m}^2 \approx 12.6\ \text{nN/m}^2}$$
        **3. Check with momentum.** $\langle S_i\rangle = \frac{(6\pi)^2}{2(60\pi)} = 0.3\pi$ W/m². A perfect mirror reverses the momentum, so
        $$\frac{2\langle S_i\rangle}{v} = \frac{0.6\pi}{1.5\times10^8} = 4\pi\times10^{-9}\ \checkmark$$

        !!intuition Does this make sense?
          The pressure equals the energy density from part (d), $\epsilon E_0^2$, in the same units (J/m³ = N/m²). Tiny: sunlight on a mirror pushes with a few micronewtons per square meter.

        **Speed path.** $\langle p\rangle = 2\langle S_i\rangle/v$.

        **Where points go.** Forgetting the reflection doubles the push; $c$ in place of $v$ inside the dielectric.
      ` }),

    // ---------------------------------------------------------------- E Problem 3
    RF(md`
      ### Problem 3 (22 points): a parallel-plate line from its fields

      Two parallel conducting plates of width $W$ are a distance $d$ apart ($W \gg d$; ignore fringing). The gap is filled with a nonmagnetic material of permittivity $\epsilon = \epsilon_r\epsilon_0$ and conductivity $\sigma$. Plate 1 is the plane $x = 0$ and plate 2 the plane $x = d$. A TEM wave travels along $z$ between them with
      $$\mathbf E = E_x(z,t)\,\hat x,\qquad \mathbf H = H_y(z,t)\,\hat y$$
      Define the line voltage $V \equiv E_xd$ and the line current $I \equiv H_yW$ (the current along $+z$ in plate 1). Numbers, where asked: $W = 1$ cm, $d = 1$ mm, $\epsilon_r = 4$, $\sigma = 10^{-4}$ S/m.

      [[fig:e3]]
    `, { e3: { svg: figE3(), cap: 'Cross-section. E runs from plate 1 to plate 2, H runs across the width, and the wave travels into the page (+z).' } }),
    P({ src: 'Practice E #3(a) · 4 pts', title: 'Faraday gives L',
      q: md`**(a) (4 pts)** Start from Faraday's law. Show that $-\partial V/\partial z = L\,\partial I/\partial t$ and find $L$ (per unit length) in terms of $\mu_0$, $d$ and $W$.`,
      parts: [{ lbl: md`$L$ (H/m)`, expr: 'mu0*d/W', vars: { mu0: [0.5, 2], d: [0.1, 1], W: [1, 10] } }],
      hints: [md`$(\nabla\times\mathbf E)_y = \partial E_x/\partial z$, and Faraday says it equals $-\mu_0\,\partial H_y/\partial t$. Multiply by $d$, then write $H_y = I/W$.`],
      sol: md`
        **1. Faraday, one component.** $\nabla\times\mathbf E = -\mu_0\partial\mathbf H/\partial t$. With only $E_x(z,t)$, the $y$ component of the curl is
        $$(\nabla\times\mathbf E)_y = \frac{\partial E_x}{\partial z} - \frac{\partial E_z}{\partial x} = \frac{\partial E_x}{\partial z}$$
        so
        $$\frac{\partial E_x}{\partial z} = -\mu_0\frac{\partial H_y}{\partial t}$$
        **2. Turn fields into V and I.** Multiply both sides by $d$; on the left $E_xd = V$:
        $$\frac{\partial V}{\partial z} = -\mu_0d\,\frac{\partial H_y}{\partial t}$$
        Write $H_y = I/W$ and move the minus sign:
        $$-\frac{\partial V}{\partial z} = \frac{\mu_0d}{W}\frac{\partial I}{\partial t}$$
        **3. Read off L.**
        $$\boxed{L = \frac{\mu_0d}{W}\ \ \text{H/m}}$$

        !!intuition Does this make sense?
          $L$ is flux per current per meter. The flux between the plates per meter is $B\cdot d = \mu_0(I/W)d$; divide by $I$ ✓. A narrower gap holds less flux; wider plates spread the current and weaken $H$.

        **Speed path.** Flux linkage: $L = \mu_0d/W$. For any TEM line, $L = \mu/\text{GF}$ with GF $= W/d$ here.

        **Where points go.** Writing $W/d$ (that is the geometric factor for $C$).
      ` }),
    P({ src: 'Practice E #3(b) · 4 pts', title: 'Ampère gives C and G',
      q: md`**(b) (4 pts)** From Ampère's law, show that $-\partial I/\partial z = GV + C\,\partial V/\partial t$ and find $C$ and $G$ in terms of $\epsilon_r$, $\epsilon_0$, $\sigma$, $d$ and $W$.`,
      parts: [
        { lbl: md`$C$ (F/m)`, expr: 'epsr*eps0*W/d', vars: { epsr: [1, 10], eps0: [0.5, 2], W: [1, 10], d: [0.1, 1] } },
        { lbl: md`$G$ (S/m)`, expr: 'sigma*W/d', vars: { sigma: [0.5, 5], W: [1, 10], d: [0.1, 1] } },
      ],
      hints: [md`$(\nabla\times\mathbf H)_x = -\partial H_y/\partial z = \sigma E_x + \epsilon\,\partial E_x/\partial t$. Multiply by $W$, then write $E_x = V/d$.`],
      sol: md`
        **1. Ampère, one component.** $\nabla\times\mathbf H = \sigma\mathbf E + \epsilon\,\partial\mathbf E/\partial t$. The $x$ component of the curl of $H_y(z,t)\hat y$:
        $$(\nabla\times\mathbf H)_x = \frac{\partial H_z}{\partial y} - \frac{\partial H_y}{\partial z} = -\frac{\partial H_y}{\partial z}$$
        so
        $$-\frac{\partial H_y}{\partial z} = \sigma E_x + \epsilon\frac{\partial E_x}{\partial t}$$
        **2. Turn fields into V and I.** Multiply by $W$; on the left $H_yW = I$. Then write $E_x = V/d$:
        $$-\frac{\partial I}{\partial z} = \frac{\sigma W}{d}V + \frac{\epsilon W}{d}\frac{\partial V}{\partial t}$$
        **3. Read off.**
        $$\boxed{C = \frac{\epsilon_r\epsilon_0W}{d}\ \text{F/m}}\qquad\boxed{G = \frac{\sigma W}{d}\ \text{S/m}}$$

        !!intuition Does this make sense?
          $C$ is the familiar capacitor $\epsilon A/d$ per meter of length. $G$ is the leakage conductance of the same slab, $\sigma A/d$. Same shape, so $G/C = \sigma/\epsilon$ for any line with a uniform filling.

        **Speed path.** $C = \epsilon\cdot\text{GF}$, $G = \sigma\cdot\text{GF}$, GF $= W/d$.

        **Where points go.** Losing the minus sign on $\partial H_y/\partial z$; mixing up which equation gives $L$ and which gives $C$.
      ` }),
    P({ src: 'Practice E #3(c) · 5 pts', title: 'Z₀ and v',
      q: md`**(c) (5 pts)** With $W = 1$ cm, $d = 1$ mm and $\epsilon_r = 4$, find $Z_0$, the wave speed $v$, and $C$ in nF/m.`,
      parts: [
        trap(N('Z_0', 6 * PI, 'Ω'), [[12 * PI, md`That uses $\eta_0$; the filling has $\epsilon_r = 4$, so $\eta = 60\pi$.`], [60 * PI, md`That is $\eta$ itself. $Z_0 = \eta\,d/W$.`], [600 * PI, md`That is $\eta\,W/d$, upside down.`]]),
        trap(N('v', 1.5e8, 'm/s'), [[3e8, md`The filling slows the wave: $v = c/\sqrt{\epsilon_r}$.`]]),
        N('C', 10 / (9 * PI), 'nF/m'),
      ],
      hints: [md`$Z_0 = \sqrt{L/C} = \sqrt{\mu/\epsilon}\;d/W$ and $v = 1/\sqrt{LC} = 1/\sqrt{\mu\epsilon}$.`],
      sol: md`
        **1. Z₀.** Divide $L$ by $C$; the geometry appears squared, and the root takes it out:
        $$Z_0 = \sqrt{\frac{L}{C}} = \sqrt{\frac{\mu_0}{\epsilon}}\,\frac{d}{W} = \frac{120\pi}{2}\cdot\frac{1}{10}$$
        $$\boxed{Z_0 = 6\pi \approx 18.8\ \Omega}$$
        **2. v.** Multiply $L$ by $C$; the geometry cancels:
        $$v = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{\mu_0\epsilon}} = \frac{c}{2}$$
        $$\boxed{v = 1.5\times10^8\ \text{m/s}}$$
        **3. C.** $W/d = 10$:
        $$C = 4\cdot\frac{10^{-9}}{36\pi}\cdot10 = \frac{10}{9\pi}\ \text{nF/m}$$
        $$\boxed{C \approx 0.354\ \text{nF/m}}$$

        !!intuition Does this make sense?
          A wide, thin line has a low impedance: lots of capacitance, little inductance. Check $1/(Z_0v) = 1/(6\pi\cdot1.5\times10^8) = 0.354$ nF/m ✓.

        **Speed path.** $Z_0 = \eta\,d/W$, $v = c/\sqrt{\epsilon_r}$.

        **Where points go.** $\eta_0$ for $\eta$; $W/d$ for $d/W$.
      ` }),
    P({ src: 'Practice E #3(d) · 4 pts', title: 'Leakage',
      q: md`**(d) (4 pts)** With $\sigma = 10^{-4}$ S/m, find $G$ in mS/m. What does $G/C$ equal?`,
      parts: [
        trap(N('G', 1, 'mS/m'), [[0.01, md`That uses $d/W$. Conductance grows with the plate area: $\sigma W/d$.`]]),
        mc(md`$G/C =$`, [md`$\sigma/\epsilon$, for any line with a uniform filling`, md`$\sigma/\epsilon$, but only for parallel plates`, md`$\sigma\epsilon$`, md`$1/(Z_0v)$`], 0,
          [null, md`Any TEM line has $C = \epsilon\cdot\text{GF}$ and $G = \sigma\cdot\text{GF}$ with the same geometric factor, coax and twin-lead included.`, md`Units: $\sigma\epsilon$ is not 1/s. $G/C$ must be a rate.`, md`$1/(Z_0v)$ is $C$ itself.`]),
      ],
      hints: [md`$G = \sigma W/d$. Divide by $C = \epsilon W/d$.`],
      sol: md`
        **1. G.**
        $$G = \frac{\sigma W}{d} = 10^{-4}\times10$$
        $$\boxed{G = 10^{-3}\ \text{S/m} = 1\ \text{mS/m}}$$
        **2. The ratio.** The geometry cancels:
        $$\boxed{\frac GC = \frac{\sigma}{\epsilon}}$$
        for any uniformly filled line, since both share the geometric factor.

        !!intuition Does this make sense?
          $\epsilon/\sigma$ is the filling's relaxation time; $C/G$ is the line's $RC$-like leak time. They must be equal: the same charge leaks through the same material. At 100 MHz, $\omega\epsilon = \tfrac{4}{180}$ S/m, so $\sigma/\omega\epsilon = 4.5\times10^{-3}$: the leakage current is tiny next to the charging current, and dropping $G$ (as the lectures do) is fine.

        **Speed path.** $G = \sigma\cdot\text{GF}$.

        **Where points go.** Upside-down geometry.
      ` }),
    P({ src: 'Practice E #3(e) · 5 pts', title: 'Wider plates',
      q: md`**(e) (5 pts)** The plates are made twice as wide, $W = 2$ cm, with the same gap and filling. Find the new $Z_0$, and say what happens to $v$.`,
      parts: [
        trap(N(md`new $Z_0$`, 3 * PI, 'Ω'), [[12 * PI, md`$Z_0 \propto d/W$: a wider line has a **lower** impedance.`], [6 * PI, md`$Z_0$ depends on the geometry: $Z_0 = \eta\,d/W$.`]]),
        mc(md`$v$…`, [md`does not change: $v = 1/\sqrt{\mu\epsilon}$ depends only on the filling`, md`halves`, md`doubles`, md`drops by $\sqrt2$`], 0,
          [null, md`$L$ halves and $C$ doubles; their product does not change.`, md`$L$ halves and $C$ doubles; their product does not change.`, md`Geometry cancels in $LC$. Only the material sets the speed of a TEM wave.`]),
      ],
      hints: [md`$L \propto d/W$, $C \propto W/d$. Then $Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$.`],
      sol: md`
        **1. L and C.** Doubling $W$ halves $L = \mu_0d/W$ and doubles $C = \epsilon W/d$.

        **2. Z₀.** $L/C$ drops by 4, so $Z_0$ drops by 2:
        $$\boxed{Z_0 = 3\pi \approx 9.4\ \Omega}$$
        **3. v.** $LC$ is unchanged:
        $$\boxed{v = 1.5\times10^8\ \text{m/s, unchanged}}$$

        !!intuition Does this make sense?
          Two identical lines side by side, in parallel: half the impedance, same speed ✓. Doubling the gap instead would double $Z_0$ to $12\pi$.

        **Speed path.** $Z_0 \propto d/W$; $v$ never depends on the cross-section of a uniformly filled TEM line.

        **Where points go.** Moving $Z_0$ the wrong way.
      ` }),

    // ---------------------------------------------------------------- E Problem 4
    RF(md`
      ### Problem 4 (28 points): a pulse on an open line

      A lossless line with $Z_0 = 50\ \Omega$, length $l = 300$ m and $v = 1.5\times10^8$ m/s is **open** at $z = 300$ m. At $z = 0$ a source with $R_g = 25\ \Omega$ produces a single rectangular pulse: $V_g(t) = 30$ V for $0 < t < 1\ \mu$s and zero otherwise. The line is uncharged before $t = 0$. The one-way travel time is $T = l/v = 2\ \mu$s.

      [[fig:e4]]
    `, { e4: { svg: PF.row([{ svg: figE4c(), cap: 'The circuit. The far end is open.' }, { svg: figE4p(), cap: 'The source voltage: one 30 V pulse, 1 µs long.' }]).svg } }),
    P({ src: 'Practice E #4(a) · 4 pts', title: 'The coefficients',
      q: md`**(a) (4 pts)** Find $\tau_g$, $\Gamma_g$ and $\Gamma_L$.`,
      parts: [
        trap(N('\\tau_g', 2 / 3, ''), [[1 / 3, md`That is $R_g/(R_g + Z_0)$. The line takes the share $Z_0/(R_g + Z_0)$.`]]),
        trap(N('\\Gamma_g', -1 / 3, ''), [[1 / 3, md`$\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$: $R_g < Z_0$ makes it negative.`]]),
        trap(N('\\Gamma_L', 1, ''), [[-1, md`That is a short. An open end forces $I = 0$, so the reflected current cancels the incident one and the voltage doubles: $\Gamma_L = +1$.`]]),
      ],
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$; $\Gamma = (R - Z_0)/(R + Z_0)$ with $R\to\infty$ for an open end.`],
      sol: md`
        **1. Launch.** Until a reflection returns, the line looks like a resistor $Z_0$:
        $$\boxed{\tau_g = \frac{50}{25 + 50} = \tfrac23}$$
        **2. The source end.**
        $$\boxed{\Gamma_g = \frac{25 - 50}{75} = -\tfrac13}$$
        **3. The open end.** $\Gamma_L = (R_L - Z_0)/(R_L + Z_0)\to1$ as $R_L\to\infty$:
        $$\boxed{\Gamma_L = 1}$$

        **Speed path.** Open: $+1$. Short: $-1$. Matched: 0.

        **Where points go.** The sign of $\Gamma_g$.
      ` }),
    P({ src: 'Practice E #4(b) · 4 pts', title: 'The launched pulse',
      q: md`**(b) (4 pts)** Find the height of the pulse launched onto the line and its length in space.`,
      parts: [
        trap(N('\\text{height}', 20, 'V'), [[30, md`That is $V_g$. The source divides it with $R_g$: $\tau_gV_g$.`]]),
        trap(N('\\text{length}', 150, 'm'), [[300, md`That uses $c$. On this line $v = 1.5\times10^8$ m/s.`]]),
      ],
      hints: [md`Height $\tau_gV_g$. Length: how far the leading edge travels while the source is on.`],
      sol: md`
        **1. Height.**
        $$\boxed{\tau_gV_g = \tfrac23(30) = 20\ \text{V}}$$
        **2. Length.** The front moves on for the 1 µs the source stays on:
        $$\boxed{v\cdot1\ \mu\text{s} = 150\ \text{m}}$$
        Half the line's length, so the pulse never overlaps its own reflection at the middle of the line.

        **Speed path.** Height $\tau_gV_g$; length $v\times$width.

        **Where points go.** Forgetting the divider.
      ` }),
    P({ src: 'Practice E #4(c) · 6 pts', title: 'V at the middle',
      q: md`**(c) (6 pts)** Sketch $V(150\text{ m}, t)$ for $0 < t < 8\ \mu$s. Give its value at $t = 1.5$, $3.5$ and $5.5\ \mu$s.`,
      parts: [
        N(md`$V$ at $1.5\ \mu$s`, 20, 'V'),
        trap(N(md`$V$ at $3.5\ \mu$s`, 20, 'V'), [[40, md`The incident pulse has passed by then (it occupied 1 to 2 µs). Only the reflected pulse is at the middle.`]]),
        trap(N(md`$V$ at $5.5\ \mu$s`, -20 / 3, 'V'), [[20 / 3, md`$\Gamma_g = -\tfrac13$ flips the pulse's sign at the source.`], [-40 / 3, md`At the middle of the line the pulses pass one at a time; doubling happens only at the open end.`]]),
      ],
      hints: [md`The middle is $1\ \mu$s from each end. Each pass of a pulse there lasts 1 µs. Track: out (×1), back after the open end (×1), out again after the source (×$\Gamma_g$).`],
      sol: md`
        **1. The pulse's trips.** It takes 2 µs to cross the line, so it reaches the middle 1 µs after leaving either end.
        - Out: leaves $z = 0$ at $t = 0$, passes the middle from 1 to 2 µs at $+20$ V.
        - Back: reflects at the open end ($\times1$) at $t = 2$, passes the middle from 3 to 4 µs at $+20$ V.
        - Out again: reflects at the source ($\times-\tfrac13$) at $t = 4$, passes the middle from 5 to 6 µs at $-\tfrac{20}{3}$ V.
        - Back again: from 7 to 8 µs, still $-\tfrac{20}{3}$ V (the open end does not flip it).

        $$\boxed{V(150, 1.5) = 20\ \text{V},\ V(150, 3.5) = 20\ \text{V},\ V(150, 5.5) = -6.67\ \text{V}}$$

        [[fig:bd]]

        [[fig:vt]]

        !!intuition Does this make sense?
          The pulse loses two thirds of its height on every visit to the source and keeps it at the open end, so it rattles back and forth forever but shrinks: $20, 20, -6.7, -6.7, 2.2, \ldots$ V.

        **Speed path.** List the pass windows (1–2, 3–4, 5–6, 7–8 µs) and multiply by $\Gamma_L$ and $\Gamma_g$ alternately.

        **Where points go.** Adding pulses that do not overlap; losing the sign at the source.
      `,
      figs: {
        bd: { svg: TL.diagram(sE4, { tMax: 8, w: 400, h: 330 }), cap: 'Bounce diagram. Each line is the leading edge of the 1 µs pulse, labeled with the pulse height; the trailing edge follows 1 µs later.' },
        vt: { svg: TL.plotT(sE4, 150, { tMax: 8, input: pulse1, yt: [[20, '20'], [-20 / 3, '-\\tfrac{20}{3}']] }), cap: 'V(150 m, t): +20 V, +20 V, then −20/3 V twice.' },
      } }),
    P({ src: 'Practice E #4(d) · 4 pts', title: 'At the open end',
      q: md`**(d) (4 pts)** Find the largest voltage at the open end, and its value at $t = 6.5\ \mu$s.`,
      parts: [
        trap(N(md`$\max V(300, t)$`, 40, 'V'), [[20, md`At an open end the reflected pulse adds to the incident one while they overlap: $(1 + \Gamma_L)\times20$.`]]),
        trap(N(md`$V(300, 6.5\ \mu\text{s})$`, -40 / 3, 'V'), [[-20 / 3, md`At the open end the arriving and reflected pulses add: $2\times(-\tfrac{20}{3})$.`]]),
      ],
      hints: [md`At the open end, while a pulse arrives its reflection leaves at the same time, so the voltage there is $(1 + \Gamma_L) = 2$ times the arriving pulse.`],
      sol: md`
        **1. First visit.** The $+20$ V pulse arrives at $t = 2$ and reflects with $\Gamma_L = 1$; from 2 to 3 µs the voltage there is
        $$\boxed{V(300, t) = 20 + 20 = 40\ \text{V}}$$
        **2. Second visit.** The $-\tfrac{20}{3}$ V pulse arrives at $t = 6$:
        $$\boxed{V(300, 6.5\ \mu\text{s}) = 2\left(-\tfrac{20}{3}\right) = -13.3\ \text{V}}$$

        !!intuition Does this make sense?
          An open end has no current, so the incident and reflected currents cancel, and their voltages add. The voltage there is the transmission coefficient $1 + \Gamma_L = 2$ times the arriving wave.

        **Speed path.** Open end: double whatever arrives.

        **Where points go.** Forgetting the doubling.
      ` }),
    P({ src: 'Practice E #4(e) · 6 pts', title: 'A snapshot',
      q: md`**(e) (6 pts)** Take a snapshot of the line at $t = 2.5\ \mu$s. Find $V(250\text{ m})$, the length of the region where $V \ne 0$, and the current at $z = 250$ m.`,
      parts: [
        trap(N(md`$V(250\text{ m}, 2.5\ \mu\text{s})$`, 40, 'V'), [[20, md`At $t = 2.5\ \mu$s the incident and reflected halves of the pulse overlap near the open end; add them.`]]),
        trap(N('\\text{length where } V \\ne 0', 75, 'm'), [[150, md`That is the pulse's length when it travels alone. Folded at the open end, half of it overlaps the other half.`]]),
        mc(md`$I(250\text{ m}, 2.5\ \mu\text{s}) =$`, [md`0`, md`0.4 A`, md`0.8 A`, md`$-0.4$ A`], 0,
          [null, md`That is the incident pulse's current alone, $20/50$. The reflected pulse carries $-0.4$ A on top of it.`, md`That adds the currents as if both moved forward. The reflected wave moves backward: its current is $-V^-/Z_0$.`, md`That is the reflected pulse's current alone.`]),
      ],
      hints: [md`At $t = 2.5$ the incident pulse would occupy $225 < z < 375$ m; the part beyond 300 m has already folded back to $225 < z < 300$ m.`],
      sol: md`
        **1. Where the incident pulse would be.** Its leading edge left at $t = 0$, its trailing edge at $t = 1\ \mu$s. At $t = 2.5\ \mu$s they would be at
        $$v(2.5) = 375\ \text{m},\qquad v(1.5) = 225\ \text{m}$$
        **2. The fold.** The line ends at 300 m. The 75 m that "passed" the end has reflected and come back 75 m: it occupies $225 < z < 300$ m, exactly where the rest of the incident pulse still is. So the whole pulse sits on $225 < z < 300$ m, twice as high:
        $$\boxed{V(250, 2.5\ \mu\text{s}) = 20 + 20 = 40\ \text{V}}\qquad\boxed{\text{length} = 75\ \text{m}}$$
        **3. The current.** The incident pulse carries $+20/50 = 0.4$ A; the reflected one $-20/50 = -0.4$ A:
        $$\boxed{I(250, 2.5\ \mu\text{s}) = 0}$$

        [[fig:snap]]

        **Speed path.** At an open end a pulse folds into half its length at twice its height, with zero current, for as long as it overlaps itself.

        **Where points go.** Drawing the incident and reflected pulses side by side instead of on top of each other; adding the currents.
      `,
      figs: { snap: { svg: snapE4(), cap: 'V(z) at t = 2.5 µs: the pulse is folded against the open end, 40 V high and 75 m long.' } } }),
    P({ src: 'Practice E #4(f) · 4 pts', title: 'Where the energy is',
      q: md`**(f) (4 pts)** How much energy is stored on the line at $t = 2.5\ \mu$s? How much energy did $R_g$ turn into heat while the pulse was launched ($0 < t < 1\ \mu$s)?`,
      parts: [
        trap(N(md`stored at $2.5\ \mu$s`, 8, 'µJ'), [[16, md`That counts magnetic energy too. With $I = 0$ in the folded pulse, all of it is electric: $\tfrac12CV^2$ per meter over 75 m.`], [4, md`That uses the incident 20 V over 75 m. The folded pulse is 40 V.`]]),
        trap(N(md`heat in $R_g$`, 4, 'µJ'), [[12, md`That is everything the source supplied, $30\ \text{V}\times0.4\ \text{A}\times1\ \mu$s. Two thirds of it went onto the line.`]]),
      ],
      hints: [md`$C = 1/(Z_0v)$ per meter. Energy $= \tfrac12CV^2\times$ length. While launching, the source current is $V^+/Z_0$.`],
      sol: md`
        **1. C per meter.**
        $$C = \frac{1}{Z_0v} = \frac{1}{50\times1.5\times10^8} = \tfrac43\times10^{-10}\ \text{F/m}$$
        **2. Stored energy at 2.5 µs.** All electric ($I = 0$), 40 V over 75 m:
        $$W = \tfrac12\left(\tfrac43\times10^{-10}\right)(40)^2(75)$$
        $$\boxed{W = 8\ \mu\text{J}}$$
        **3. Check with the launched pulse.** A 20 V wave carries power $V^2/Z_0 = 8$ W, for 1 µs: 8 µJ ✓. Energy is conserved while the pulse folds; it just changes form, from half electric and half magnetic to all electric.

        **4. Heat in Rg.** The source current while launching is $20/50 = 0.4$ A:
        $$\boxed{I^2R_g\cdot1\ \mu\text{s} = (0.16)(25)(10^{-6}) = 4\ \mu\text{J}}$$
        The source supplied $30\times0.4\times10^{-6} = 12\ \mu$J: 8 onto the line, 4 into $R_g$ ✓.

        **Speed path.** Launched energy $= (V^+)^2/Z_0\times$ width. It is the same at any time until the pulse next meets the source.

        **Where points go.** Counting magnetic energy that is not there; forgetting the overlap doubles $V$ and halves the length.
      ` }),
  ];
  EM.lesson('e3-prac', { id: 'e3-prac-e', order: 5, title: 'Practice exam E', kind: 'mock', sub: '75 min · 100 pts · good conductor and surface resistance, standing wave at a mirror, parallel-plate line, pulse on an open line', steps: examE });

  // ======================================================================================== EXAM F: figures
  function figF1() {
    const g = PF.fig({ alt: 'the y-z plane seen from +x: y to the right, z up, x out of the page; the wave travels toward -x, into the page, marked by a circle with a cross at the origin' });
    const ox = 150, oy = 110;
    g.arrow(ox - 90, oy, ox + 100, oy, { cls: 'dim', hs: 7 }); g.label(ox + 104, oy, 'y', 'l', 'small accent');
    g.arrow(ox, oy + 80, ox, oy - 86, { cls: 'dim', hs: 7 }); g.label(ox + 6, oy - 88, 'z', 'bl', 'small accent');
    g.otimes(ox, oy, 8);
    g.label(ox - 14, oy + 18, '\\text{travel: }-\\hat x', 'tr', 'small');
    g.label(ox + 18, oy + 34, '\\hat x\\ \\text{out of the page}', 'tl', 'small');
    return g.svg();
  }
  function figF1e() {
    const g = PF.fig({ alt: 'the tip of E at x = 0 traces an ellipse in the y-z plane, 4 V/m along y and 3 V/m along z; it starts on +y at t = 0, reaches +z a quarter period later, turning counterclockwise in this view; the wave travels into the page' });
    const ox = 150, oy = 110, s = 22;
    g.arrow(ox - 120, oy, ox + 125, oy, { cls: 'dim', hs: 7 }); g.label(ox + 129, oy, 'y', 'l', 'small accent');
    g.arrow(ox, oy + 90, ox, oy - 96, { cls: 'dim', hs: 7 }); g.label(ox + 6, oy - 98, 'z', 'bl', 'small accent');
    g.ellipse(ox, oy, 4 * s, 3 * s, { cls: 'curve' });
    g.arrow(ox, oy, ox + 4 * s, oy, { cls: 'thick', hs: 8 }); g.label(ox + 4 * s + 6, oy + 8, 't = 0', 'tl', 'small');
    g.arrow(ox, oy, ox, oy - 3 * s, { cls: 'thick', hs: 8 }); g.label(ox + 6, oy - 3 * s - 6, '\\omega t = 90°', 'bl', 'small');
    const a = 35 * PI / 180, b = 55 * PI / 180;
    g.line(ox + 4 * s * Math.cos(a), oy - 3 * s * Math.sin(a), ox + 4 * s * Math.cos(b), oy - 3 * s * Math.sin(b), { cls: 'thick', arrow: 'end', hs: 9 });
    g.otimes(ox - 70, oy - 60, 7); g.label(ox - 80, oy - 60, '\\text{travel}', 'r', 'small');
    return g.svg();
  }
  function figF2() {
    const g = PF.fig({ alt: 'side view: air fills z < 0; the metal alloy (shaded) fills z > 0; an incident wave travels toward the metal and a reflected wave travels back' });
    const xs = 230;
    g.rect(xs, 24, 130, 160, { cls: 'shade nodecl' }); g.line(xs, 24, xs, 184, { cls: 'thick' });
    g.label(110, 34, '\\text{air } (\\eta_0)', 'c', 'small');
    g.label(296, 34, '\\sigma = 4\\times10^5\\,\\text{S/m}', 'c', 'small');
    g.arrow(70, 84, 200, 84, { hs: 8 }); g.label(135, 76, '\\tilde{\\mathbf E}_i = 12\\pi e^{-j\\beta_0z}\\hat x', 'b', 'small');
    g.arrow(200, 126, 70, 126, { cls: 'dim', hs: 8 }); g.label(135, 134, '\\tilde{\\mathbf E}_r = \\Gamma\\,12\\pi e^{j\\beta_0z}\\hat x', 't', 'small');
    g.arrow(20, 170, 380, 170, { cls: 'dim', hs: 7 }); g.label(384, 170, 'z', 'l', 'small accent');
    g.label(xs - 8, 176, 'z = 0', 'tr', 'small');
    return g.svg();
  }
  const figF3 = () => lineFig([
    { t: 'gen', R: 'R_g = 100\\,\\Omega', V: '\\tilde F = 20\\,\\text{V}', ac: true },
    { t: 'line', w: 110, lab: 'Z_{0A} = 50\\,\\Omega', sub: '0.5\\,\\text{m}' },
    { t: 'line', w: 190, lab: 'Z_{0B} = 75\\,\\Omega', sub: '1\\,\\text{m}' },
    { t: 'load', kind: 'R', lab: 'R_L = 25\\,\\Omega' },
  ], { alt: 'a generator with open-circuit phasor 20 V and Rg = 100 ohms drives line A (50 ohms, 0.5 m), which feeds line B (75 ohms, 1 m), which ends in RL = 25 ohms' });
  const figF4 = (b) => lineFig(b
    ? [{ t: 'gen', R: 'R_g = 25\\,\\Omega', V: '15u(t)' }, { t: 'line', w: 170, lab: 'Z_0 = 50\\,\\Omega', sub: '200\\,\\text{m}' }, { t: 'load', kind: 'short' }]
    : [{ t: 'gen', R: null, V: '10u(t)' }, { t: 'line', w: 170, lab: 'Z_0 = 50\\,\\Omega', sub: '200\\,\\text{m}' }, { t: 'load', kind: 'open' }],
  { alt: b ? 'case B: a 15 V step through Rg = 25 ohms drives a 200 m, 50 ohm line whose far end is shorted' : 'case A: an ideal 10 V step source with no series resistance drives a 200 m, 50 ohm line whose far end is open' });
  const sF4A = TL.solve({ Vg: 10, Rg: 0, RL: Infinity, sections: [{ Z0: 50, len: 200, v: 200 }], tMax: 10 });
  const sF4B = TL.solve({ Vg: 15, Rg: 25, RL: 0, sections: [{ Z0: 50, len: 200, v: 200 }], tMax: 10 });
  const figF3V = () => {
    const at = (x) => {
      const inA = x < 0.5, d = inA ? 0.5 - x : 1.5 - x, Vp = inA ? 7.5 : 10, G = inA ? -1 / 3 : -0.5;
      return Vp * Math.hypot(1 + G * Math.cos(2 * PI * d), G * Math.sin(2 * PI * d));
    };
    return plot({ w: 380, h: 210, x: [0, 1.55], y: [0, 17.5], xl: 'x\\,(\\text{m})', yl: '|\\tilde V|\\ (\\text{V})',
      xt: [[0.5, '0.5'], [1, '1'], [1.5, '1.5']], yt: [[5, '5'], [10, '10'], [15, '15']], vlines: [[0.5, '']], curves: [{ f: at, n: 400 }] });
  };

  // ======================================================================================== EXAM F
  const examF = [
    R(md`
      ${RULES}

      ${HOWTO}

      ${CONSTS}

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Phasor Maxwell: $\tilde{\mathbf H}$ from $\tilde{\mathbf E}$ by Faraday, $\epsilon$ from Ampère, $\langle\mathbf S\rangle$, polarization | 24 |
      | 2 | A wave from air onto a good conductor: $\Gamma \approx -1$ plus a correction, absorbed power | 24 |
      | 3 | Half-wave and quarter-wave sections in cascade: $Z_{\text{in}}$, $\tilde V_{\text{in}}$, power, VSWR, a new frequency | 24 |
      | 4 | An ideal source on an open line, and a resistive source on a shorted line: what settles and what never does | 28 |

      **Draws on:** [phasor Maxwell](#/l/w1-maxwell), [time-averaged power](#/l/w1-avg), [polarization](#/l/w3-pol), [good conductors](#/l/w2-limits), [reflection](#/l/w4-gamma), [power and surface resistance](#/l/w2-loss), [half- and quarter-wave transformers](#/l/w6-qw), [launching and reflecting](#/l/w5-launch) and [bounce diagrams](#/l/w5-bounce).
    `),

    // ---------------------------------------------------------------- F Problem 1
    RF(md`
      ### Problem 1 (24 points): from E to H with Maxwell's equations

      In a source-free, lossless, nonmagnetic ($\mu = \mu_0$) dielectric of unknown permittivity $\epsilon$, a field at $f = 150$ MHz ($\omega = 3\pi\times10^8$ rad/s) has the phasor
      $$\tilde{\mathbf E} = (4\,\hat y - j3\,\hat z)\,e^{j2\pi x}\ \ \text{V/m}$$
      with $x$ in meters.

      [[fig:f1]]
    `, { f1: { svg: figF1(), cap: 'Seen from +x: y to the right, z up, x out of the page. The wave travels away from you, into the page.' } }),
    P({ src: 'Practice F #1(a) · 4 pts', title: 'Direction and wavelength',
      q: md`**(a) (4 pts)** Which way does the wave travel, and what is its wavelength?`,
      parts: [
        mc(md`It travels toward`, [md`$-\hat x$`, md`$+\hat x$`, md`$+\hat y$`, md`$-\hat z$`], 0,
          [null, md`$e^{-j\beta x}$ travels toward $+x$. Here the exponent is $+j2\pi x$: the phase $\omega t + 2\pi x$ stays constant when $x$ decreases as $t$ grows.`, md`The travel direction is the coordinate in the exponent. $\hat y$ is a direction of the field, and a plane wave's field is perpendicular to its travel.`, md`The field has a $z$ part, so the wave cannot travel along $z$.`]),
        trap(N('\\lambda', 1, 'm'), [[2, md`That is the free-space wavelength at 150 MHz. Read $\beta = 2\pi$ rad/m off the exponent: $\lambda = 2\pi/\beta$.`]]),
      ],
      hints: [md`Multiply by $e^{j\omega t}$: the phase is $\omega t + 2\pi x$. Which way must $x$ move to keep it constant?`],
      sol: md`
        **1. Direction.** In the time domain each component has phase $\omega t + 2\pi x$. A crest is a point of constant phase: as $t$ grows, $x$ must shrink. So
        $$\boxed{\text{travel toward }-\hat x}$$
        **2. Wavelength.** The exponent gives $\beta = 2\pi$ rad/m:
        $$\boxed{\lambda = \frac{2\pi}{\beta} = 1\ \text{m}}$$

        **Speed path.** $e^{+j\beta x}$: toward $-x$. $\lambda = 2\pi/\beta$.

        **Where points go.** Reading the sign of the exponent backwards.
      ` }),
    P({ src: 'Practice F #1(b) · 5 pts', title: 'H by Faraday',
      q: md`**(b) (5 pts)** Use Faraday's law to find $\tilde{\mathbf H}$, and give $|\tilde H_z|$.`,
      parts: [
        mc(md`$\tilde{\mathbf H} =$`, [md`$-\dfrac{1}{60\pi}(j3\,\hat y + 4\,\hat z)\,e^{j2\pi x}$ A/m`, md`$+\dfrac{1}{60\pi}(j3\,\hat y + 4\,\hat z)\,e^{j2\pi x}$ A/m`, md`$\dfrac{1}{60\pi}(4\,\hat y - j3\,\hat z)\,e^{j2\pi x}$ A/m`, md`$-\dfrac{1}{120\pi}(j3\,\hat y + 4\,\hat z)\,e^{j2\pi x}$ A/m`], 0,
          [null, md`That is the $\tilde{\mathbf H}$ of a wave going toward $+x$. Check: $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$ must point along $-\hat x$.`, md`That puts $\tilde{\mathbf H}$ parallel to $\tilde{\mathbf E}$. Faraday's curl turns it by $90°$ in space: $\tilde{\mathbf H} \perp \tilde{\mathbf E}$.`, md`That divides by $\eta_0$. Faraday gives $\beta/\omega\mu_0 = 2\pi/(120\pi^2) = 1/(60\pi)$: this medium is denser than free space.`]),
        trap(N(md`$|\tilde H_z|$`, 1 / (15 * PI), 'A/m'), [[1 / (30 * PI), md`That uses $\eta_0 = 120\pi$. Faraday gives $1/(60\pi)$ per V/m here.`], [3 / (60 * PI), md`That is $|\tilde H_y|$. $\tilde H_z$ comes from $\tilde E_y = 4$.`]]),
      ],
      hints: [md`$\nabla\times\tilde{\mathbf E} = -j\omega\mu_0\tilde{\mathbf H}$, so $\tilde{\mathbf H} = \dfrac{j}{\omega\mu_0}\nabla\times\tilde{\mathbf E}$. Only $x$-derivatives survive, and $\partial/\partial x$ of $e^{j2\pi x}$ is $j2\pi$.`, md`$(\nabla\times\tilde{\mathbf E})_y = -\partial\tilde E_z/\partial x$ and $(\nabla\times\tilde{\mathbf E})_z = \partial\tilde E_y/\partial x$.`],
      sol: md`
        **1. Faraday in phasor form.** $\partial/\partial t \to j\omega$:
        $$\nabla\times\tilde{\mathbf E} = -j\omega\mu_0\tilde{\mathbf H}$$
        Divide by $-j\omega\mu_0$; since $1/(-j) = j$,
        $$\tilde{\mathbf H} = \frac{j}{\omega\mu_0}\nabla\times\tilde{\mathbf E}$$
        **2. The curl.** The field depends only on $x$, so only $x$-derivatives appear:
        $$(\nabla\times\tilde{\mathbf E})_y = -\frac{\partial\tilde E_z}{\partial x},\qquad (\nabla\times\tilde{\mathbf E})_z = \frac{\partial\tilde E_y}{\partial x}$$
        and $(\nabla\times\tilde{\mathbf E})_x = 0$. Each $\partial/\partial x$ multiplies by $j2\pi$. With $\tilde E_z = -j3e^{j2\pi x}$:
        $$-\frac{\partial\tilde E_z}{\partial x} = -(j2\pi)(-j3)e^{j2\pi x} = -6\pi\,e^{j2\pi x}$$
        since $(j)(-j) = 1$. With $\tilde E_y = 4e^{j2\pi x}$:
        $$\frac{\partial\tilde E_y}{\partial x} = j8\pi\,e^{j2\pi x}$$
        **3. Multiply by $j/\omega\mu_0$.** $j(-6\pi) = -j6\pi$ and $j(j8\pi) = -8\pi$:
        $$\tilde{\mathbf H} = \frac{-2\pi}{\omega\mu_0}(j3\,\hat y + 4\,\hat z)\,e^{j2\pi x}$$
        and $\omega\mu_0 = (3\pi\times10^8)(4\pi\times10^{-7}) = 120\pi^2$, so $\frac{2\pi}{120\pi^2} = \frac{1}{60\pi}$:
        $$\boxed{\tilde{\mathbf H} = -\frac{1}{60\pi}(j3\,\hat y + 4\,\hat z)\,e^{j2\pi x}\ \text{A/m}}$$
        $$\boxed{|\tilde H_z| = \frac{4}{60\pi} = \frac{1}{15\pi} \approx 0.0212\ \text{A/m}}$$

        !!intuition Does this make sense?
          Faraday needed only $\mu_0$, $\omega$ and $\beta$, not $\epsilon$. Check the direction with $\tilde{\mathbf H} = \frac1\eta\hat k\times\tilde{\mathbf E}$, $\hat k = -\hat x$: $(-\hat x)\times4\hat y = -4\hat z$ and $(-\hat x)\times(-j3\hat z) = -j3\hat y$ ✓. The ratio $|\tilde E|/|\tilde H| = 60\pi$ is $\eta$ of this medium.

        **Speed path.** Find the travel direction, then $\tilde{\mathbf H} = \frac{\beta}{\omega\mu}\hat k\times\tilde{\mathbf E}$, one cross product per component.

        **Where points go.** The sign of $j\cdot(-j)$; using $\eta_0$; forgetting that the minus of Faraday's law and the $-\hat x$ travel both enter.
      ` }),
    P({ src: 'Practice F #1(c) · 4 pts', title: 'ε by Ampère',
      q: md`**(c) (4 pts)** Use Ampère's law to find $\epsilon_r$. Do both components of Ampère's law agree?`,
      parts: [
        trap(N('\\epsilon_r', 4, ''), [[2, md`That is $\sqrt{\epsilon_r} = c/v$. Square it.`]]),
        mc(md`The $y$ and $z$ components of Ampère's law give…`, [md`the same $\epsilon$: the field is a valid wave`, md`different values of $\epsilon$: the field cannot exist`, md`no information: Ampère's law is automatically satisfied`, md`$\epsilon$ from the $y$ part, $\mu$ from the $z$ part`], 0,
          [null, md`Both give $\omega\epsilon = \tfrac{1}{30}$ S/m. If they disagreed the field would not satisfy Maxwell's equations.`, md`Ampère's law is the equation that fixes $\epsilon$; it is not automatic.`, md`$\mu$ is given ($\mu_0$); both components involve $\epsilon$.`]),
      ],
      hints: [md`Source-free and lossless: $\nabla\times\tilde{\mathbf H} = j\omega\epsilon\tilde{\mathbf E}$. Compute the curl of your $\tilde{\mathbf H}$ the same way as in (b).`],
      sol: md`
        **1. Ampère in phasor form,** no conduction current:
        $$\nabla\times\tilde{\mathbf H} = j\omega\epsilon\tilde{\mathbf E}$$
        **2. The curl of H.** Again only $x$-derivatives, each $\times j2\pi$:
        $$(\nabla\times\tilde{\mathbf H})_y = -\frac{\partial\tilde H_z}{\partial x} = -(j2\pi)\left(-\frac{4}{60\pi}\right) = \frac{j2}{15}$$
        $$(\nabla\times\tilde{\mathbf H})_z = \frac{\partial\tilde H_y}{\partial x} = (j2\pi)\left(\frac{-j3}{60\pi}\right) = \frac{1}{10}$$
        (each times $e^{j2\pi x}$).

        **3. Match components.** The right side is $j\omega\epsilon(4\hat y - j3\hat z) = \omega\epsilon(j4\,\hat y + 3\,\hat z)$:
        $$y:\ \ \tfrac{j2}{15} = j4\,\omega\epsilon\ \Rightarrow\ \omega\epsilon = \tfrac{1}{30}$$
        $$z:\ \ \tfrac{1}{10} = 3\,\omega\epsilon\ \Rightarrow\ \omega\epsilon = \tfrac{1}{30}$$
        They agree: the field is a legal wave. With $\omega\epsilon_0 = (3\pi\times10^8)\frac{10^{-9}}{36\pi} = \frac{1}{120}$ S/m:
        $$\boxed{\epsilon_r = \frac{1/30}{1/120} = 4}$$

        !!intuition Does this make sense?
          $\beta = \omega\sqrt{\mu_0\epsilon}$ gives $\sqrt{\epsilon_r} = \beta c/\omega = 2\pi(3\times10^8)/(3\pi\times10^8) = 2$ ✓, and $\eta = 120\pi/2 = 60\pi$, the ratio found in (b) ✓. Also $\nabla\cdot\tilde{\mathbf E} = 0$ (no $x$ part): no charge, as stated.

        **Speed path.** $\epsilon_r = (\beta c/\omega)^2$. Ampère's two components are the check.

        **Where points go.** Stopping at $\sqrt{\epsilon_r}$.
      ` }),
    P({ src: 'Practice F #1(d) · 4 pts', title: 'Power density',
      q: md`**(d) (4 pts)** Find the time-averaged Poynting vector $\langle\mathbf S\rangle$: its size and direction.`,
      parts: [
        trap(N(md`$|\langle\mathbf S\rangle|$`, 5 / (24 * PI), 'W/m^2'), [[16 / (120 * PI), md`That keeps only the $y$ component. $|\tilde{\mathbf E}|^2 = 4^2 + 3^2 = 25$.`], [5 / (12 * PI), md`That forgets the $\tfrac12$ of the time average.`], [25 / (240 * PI), md`That uses $\eta_0$. In this medium $\eta = 60\pi$.`]]),
        mc(md`$\langle\mathbf S\rangle$ points along`, [md`$-\hat x$`, md`$+\hat x$`, md`it has $y$ and $z$ parts too, because the polarization is elliptical`, md`nowhere: an elliptical wave carries no average power`], 0,
          [null, md`Power flows the way the wave travels, toward $-x$.`, md`For one traveling plane wave, $\langle\mathbf S\rangle$ is along the travel whatever the polarization.`, md`Every component carries power; elliptical just means unequal sizes.`]),
      ],
      hints: [md`$\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. Its $x$ component is $\tfrac12\Re\{\tilde E_y\tilde H_z^* - \tilde E_z\tilde H_y^*\}$.`],
      sol: md`
        **1. The x component.** The exponentials cancel against their conjugates. With $\tilde H_y = -\frac{j3}{60\pi}$ and $\tilde H_z = -\frac{4}{60\pi}$:
        $$\tilde E_y\tilde H_z^* = 4\left(-\tfrac{4}{60\pi}\right) = -\tfrac{16}{60\pi}$$
        $$\tilde E_z\tilde H_y^* = (-j3)\left(\tfrac{j3}{60\pi}\right) = \tfrac{9}{60\pi}$$
        Subtract, then halve:
        $$\langle S_x\rangle = \tfrac12\left(-\tfrac{16}{60\pi} - \tfrac{9}{60\pi}\right) = -\frac{25}{120\pi}$$
        The $y$ and $z$ components contain $\tilde E_x$ or $\tilde H_x$, which are zero.
        $$\boxed{\langle\mathbf S\rangle = -\frac{5}{24\pi}\,\hat x \approx -0.0663\,\hat x\ \text{W/m}^2}$$

        !!intuition Does this make sense?
          It is $|\tilde{\mathbf E}|^2/(2\eta) = 25/(120\pi)$, the one-line formula for a single traveling wave in a lossless medium ✓, and it points along the travel ✓.

        **Speed path.** $|\tilde{\mathbf E}|^2/(2\eta)$ along $\hat k$: $(16 + 9)/(120\pi)$.

        **Where points go.** Dropping a component; using $\eta_0$.
      ` }),
    P({ src: 'Practice F #1(e) · 4 pts', title: 'Which hand?',
      q: md`**(e) (4 pts)** Describe the polarization.`,
      parts: [mc('', [md`left-handed elliptical`, md`right-handed elliptical`, md`left-handed circular`, md`linear`], 0,
        [null, md`$\mathbf E$ turns from $+y$ toward $+z$. With your right thumb along the travel ($-x$) your fingers curl from $z$ toward $y$: the wrong way.`, md`The two components have sizes 4 and 3. Circular needs equal sizes.`, md`The components are $90°$ apart in time ($-j$), so the tip moves around a curve, not along a line.`])],
      hints: [md`At $x = 0$: $\mathbf E(t) = \Re\{(4\hat y - j3\hat z)e^{j\omega t}\} = 4\cos\omega t\,\hat y + 3\sin\omega t\,\hat z$. Where does it point at $t = 0$, and a quarter period later?`],
      sol: md`
        **1. The time-domain field at a point.** At $x = 0$, using $\Re\{-je^{j\omega t}\} = \sin\omega t$:
        $$\mathbf E(0,t) = 4\cos\omega t\,\hat y + 3\sin\omega t\,\hat z$$
        **2. Shape.** The tip traces an ellipse with semi-axes 4 (along $y$) and 3 (along $z$): elliptical.

        **3. Rotation.** At $\omega t = 0$: $+4\hat y$. At $\omega t = 90°$: $+3\hat z$. So $\mathbf E$ turns from $y$ toward $z$.

        **4. Hand.** The travel is $-\hat x$. Right thumb along $+\hat x$ curls $y\to z$ (because $\hat y\times\hat z = \hat x$); along $-\hat x$ it curls $z\to y$. Our field turns $y\to z$, so the left hand fits:
        $$\boxed{\text{left-handed elliptical}}$$

        [[fig:ell]]

        **Speed path.** Turn $y\to z$ is "about $+x$". The wave goes $-x$. Opposite: left.

        **Where points go.** Judging with the thumb along $+x$; calling unequal components circular.
      `,
      figs: { ell: { svg: figF1e(), cap: 'Seen from +x (y right, z up): the tip of E turns from +y to +z, counterclockwise here, while the wave travels away from you into the page.' } } }),
    P({ src: 'Practice F #1(f) · 3 pts', title: 'How big does E get?',
      q: md`**(f) (3 pts)** At a fixed point, find the largest and smallest values of $|\mathbf E(t)|$ over a period.`,
      parts: [
        trap(N(md`$\max|\mathbf E|$`, 4, 'V/m'), [[5, md`That is $\sqrt{4^2 + 3^2}$, as if both components peaked at once. They are $90°$ apart: when $E_y = 4$, $E_z = 0$.`], [7, md`That adds the peaks; they never occur together.`]]),
        N(md`$\min|\mathbf E|$`, 3, 'V/m'),
      ],
      hints: [md`$|\mathbf E|^2 = 16\cos^2\omega t + 9\sin^2\omega t = 9 + 7\cos^2\omega t$.`],
      sol: md`
        **1. Size squared.**
        $$|\mathbf E|^2 = 16\cos^2\omega t + 9\sin^2\omega t = 9 + 7\cos^2\omega t$$
        **2. Extremes.** $\cos^2$ runs from 0 to 1:
        $$\boxed{\max|\mathbf E| = 4\ \text{V/m}},\qquad \boxed{\min|\mathbf E| = 3\ \text{V/m}}$$
        The semi-axes of the ellipse.

        **Speed path.** Ellipse with axes along $y$ and $z$: the extremes are the two amplitudes.

        **Where points go.** $\sqrt{4^2 + 3^2} = 5$ is the size of the phasor vector, which no instant reaches.
      ` }),

    // ---------------------------------------------------------------- F Problem 2
    RF(md`
      ### Problem 2 (24 points): a wave onto a good conductor

      Air fills $z < 0$. A metal alloy with $\sigma = 4\times10^5$ S/m, $\mu = \mu_0$ and $\epsilon = \epsilon_0$ fills $z > 0$. A plane wave at $f = 100$ MHz arrives from the air at normal incidence:
      $$\tilde{\mathbf E}_i = 12\pi\,e^{-j\beta_0z}\,\hat x\ \ \text{V/m}$$
      Keep results to first order in the small ratio $|\eta_c|/\eta_0$.

      [[fig:f2]]
    `, { f2: { svg: figF2(), cap: 'Nearly all of the wave reflects; a tiny part enters the metal and is absorbed within a few skin depths.' } }),
    P({ src: 'Practice F #2(a) · 4 pts', title: 'Good conductor and skin depth',
      q: md`**(a) (4 pts)** Find the loss tangent of the alloy at 100 MHz and its skin depth.`,
      parts: [
        trap(N(md`$\sigma/\omega\epsilon$`, 7.2e7, ''), [[4.52e8, md`That uses $f$ in place of $\omega$.`]]),
        trap(N('\\delta', 1e6 / (4000 * PI), 'µm'), [[1e6 / (4000 * PI) / Math.SQRT2, md`That uses $\alpha = \sqrt{\omega\mu\sigma}$; the root of $j$ brings a $\tfrac12$: $\alpha = \sqrt{\pi f\mu\sigma}$.`]]),
      ],
      hints: [md`$\omega\epsilon_0 = \tfrac{1}{180}$ S/m at 100 MHz. $\delta = 1/\sqrt{\pi f\mu\sigma}$.`],
      sol: md`
        **1. Loss tangent.**
        $$\frac{\sigma}{\omega\epsilon_0} = (4\times10^5)(180)$$
        $$\boxed{\frac{\sigma}{\omega\epsilon} = 7.2\times10^7 \gg 1}$$
        a good conductor.

        **2. Skin depth.**
        $$\pi f\mu_0\sigma = \pi(10^8)(4\pi\times10^{-7})(4\times10^5)$$
        The numbers give $4\cdot4 = 16$, the $\pi$'s give $\pi^2$, and the powers of ten give $10^{8 - 7 + 5} = 10^6$:
        $$\pi f\mu_0\sigma = 16\pi^2\times10^6$$
        $$\delta = \frac{1}{4\pi\times10^3}\ \text{m}$$
        $$\boxed{\delta \approx 79.6\ \mu\text{m}}$$

        **Speed path.** Group the $\pi$'s first: $\pi\cdot4\pi = 4\pi^2$, then the root is $2\pi\sqrt{\cdots}$.

        **Where points go.** The missing $\tfrac12$ inside the root; a power of ten.
      ` }),
    P({ src: 'Practice F #2(b) · 4 pts', title: 'The metal\'s impedance',
      q: md`**(b) (4 pts)** Find the surface resistance $R_s$ and the ratio $|\eta_c|/\eta_0$.`,
      parts: [
        trap(N('R_s', 0.01 * PI, 'Ω'), [[0.01 * PI * Math.SQRT2, md`That is $|\eta_c|$. $R_s = \Re\{\eta_c\}$.`]]),
        N(md`$|\eta_c|/\eta_0$`, Math.SQRT2 / 12000, ''),
      ],
      hints: [md`$\eta_c = (1 + j)/(\sigma\delta)$, so $R_s = 1/(\sigma\delta)$ and $|\eta_c| = \sqrt2R_s$.`],
      sol: md`
        **1. Surface resistance.**
        $$R_s = \frac{1}{\sigma\delta} = \frac{4\pi\times10^3}{4\times10^5}$$
        $$\boxed{R_s = \frac{\pi}{100} \approx 0.0314\ \Omega}$$
        **2. The ratio.** $\eta_c = (1 + j)R_s$, so $|\eta_c| = \sqrt2\,\pi/100$:
        $$\frac{|\eta_c|}{\eta_0} = \frac{\sqrt2\,\pi/100}{120\pi}$$
        $$\boxed{\frac{|\eta_c|}{\eta_0} = \frac{\sqrt2}{12000} \approx 1.18\times10^{-4}}$$
        A tiny number: the metal is a near short circuit for the wave.

        **Speed path.** $R_s = \alpha/\sigma = 1/(\sigma\delta)$.

        **Where points go.** Treating $|\eta_c|$ as $R_s$.
      ` }),
    P({ src: 'Practice F #2(c) · 5 pts', title: 'Γ = −1, almost',
      q: md`**(c) (5 pts)** Write $\Gamma = -1 + \Delta$ with $\Delta$ small. Find $\Re\{\Delta\}$, and the fraction $1 - |\Gamma|^2$ of the incident power the metal absorbs.`,
      parts: [
        trap(N(md`$\Re\{\Delta\}$`, 1 / 6000, ''), [[1 / 12000, md`That drops the 2: $\Gamma \approx -1 + 2\eta_c/\eta_0$.`]]),
        trap(N(md`$1 - |\Gamma|^2$`, 1 / 3000, ''), [[1 / 6000, md`That is $\Re\{\Delta\}$. Squaring doubles a small change: $|{-1} + \Delta|^2 \approx 1 - 2\Re\{\Delta\}$.`], [Math.SQRT2 / 12000, md`That is $|\eta_c|/\eta_0$. The absorbed fraction is $4R_s/\eta_0$.`]]),
      ],
      hints: [md`$\Gamma = \dfrac{\eta_c - \eta_0}{\eta_c + \eta_0} = \dfrac{x - 1}{x + 1}$ with $x = \eta_c/\eta_0$ tiny. Use $\dfrac{1}{1 + x} \approx 1 - x$.`],
      sol: md`
        **1. Expand.** Divide top and bottom by $\eta_0$, with $x = \eta_c/\eta_0$:
        $$\Gamma = \frac{x - 1}{x + 1}$$
        For small $x$, $1/(1 + x) \approx 1 - x$:
        $$\Gamma \approx (x - 1)(1 - x) = -1 + 2x - x^2$$
        Drop $x^2$: $\Gamma \approx -1 + 2\eta_c/\eta_0$.

        **2. Numbers.**
        $$\Delta = \frac{2(1 + j)\pi/100}{120\pi} = \frac{1 + j}{6000}$$
        $$\boxed{\Re\{\Delta\} = \frac{1}{6000} \approx 1.67\times10^{-4}}$$
        **3. The absorbed fraction.** With $\Delta = a(1 + j)$, $a = \tfrac{1}{6000}$:
        $$|\Gamma|^2 = (1 - a)^2 + a^2 \approx 1 - 2a$$
        $$\boxed{1 - |\Gamma|^2 \approx \frac{1}{3000} \approx 3.33\times10^{-4}}$$
        In symbols, $1 - |\Gamma|^2 \approx 4R_s/\eta_0$.

        !!intuition Does this make sense?
          A perfect conductor would give $\Gamma = -1$ exactly. A real metal nudges it toward the origin by $\sim\eta_c/\eta_0$, and that nudge is the absorbed power. The exact value is $1 - |\Gamma|^2 = 3.333\times10^{-4}$.

        **Speed path.** Absorbed fraction $= 4R_s/\eta_0 = 4(\pi/100)/(120\pi) = 1/3000$.

        **Where points go.** Dropping the 2 in $2\eta_c/\eta_0$; forgetting that $|\Gamma|^2$ doubles the small change.
      ` }),
    P({ src: 'Practice F #2(d) · 4 pts', title: 'Fields at the surface',
      q: md`**(d) (4 pts)** Find the size of the tangential $\tilde{\mathbf H}$ and of the tangential $\tilde{\mathbf E}$ at the metal's surface.`,
      parts: [
        trap(N(md`$|\tilde H|$ at $z = 0$`, 0.2, 'A/m'), [[0.1, md`That is the incident $H$. With $\Gamma \approx -1$ the reflected $H$ adds: $\tilde H = (E_0/\eta_0)(1 - \Gamma) \approx 2E_0/\eta_0$.`]]),
        trap(N(md`$|\tilde E|$ at $z = 0$`, Math.SQRT2 * PI / 500 * 1e3, 'mV/m'), [[Math.SQRT2 * PI / 500 * 1e3 / 2, md`$\tau = 1 + \Gamma = \Delta$, which includes the factor 2.`]]),
      ],
      hints: [md`$\tilde H(0) = \dfrac{E_0}{\eta_0}(1 - \Gamma)$ and $\tilde E(0) = E_0(1 + \Gamma) = \tau E_0$.`],
      sol: md`
        **1. H at the surface.** The incident $H$ is $E_0/\eta_0 = 12\pi/120\pi = 0.1$ A/m. The reflected wave carries $-\Gamma$ times it:
        $$|\tilde H(0)| = 0.1\,|1 - \Gamma| \approx 0.1(2)$$
        $$\boxed{|\tilde H(0)| \approx 0.2\ \text{A/m}}$$
        **2. E at the surface.** $\tau = 1 + \Gamma = \Delta = (1 + j)/6000$:
        $$|\tilde E(0)| = \frac{\sqrt2}{6000}(12\pi) = \frac{\sqrt2\,\pi}{500}\ \text{V/m}$$
        $$\boxed{|\tilde E(0)| \approx 8.89\ \text{mV/m}}$$
        **Check.** Inside the metal $\tilde E = \eta_c\tilde H$: $\sqrt2(\pi/100)(0.2) = \sqrt2\pi/500$ ✓.

        !!intuition Does this make sense?
          The surface is almost a short circuit: $E$ nearly cancels (it drops from 37.7 V/m to 9 mV/m), while $H$ nearly doubles. The metal is "seen" through $H$.

        **Speed path.** $H_t \approx 2H_i$, $E_t = \eta_cH_t$.

        **Where points go.** Using the incident $H$.
      ` }),
    P({ src: 'Practice F #2(e) · 4 pts', title: 'Power absorbed',
      q: md`**(e) (4 pts)** How much time-averaged power per square meter does the metal absorb?`,
      parts: [trap(N(md`$\langle P\rangle/A$`, 0.2 * PI, 'mW/m^2'), [[0.05 * PI, md`That uses the incident $H$, 0.1 A/m. At the surface it is 0.2 A/m.`], [0.4 * PI, md`That forgets the $\tfrac12$ of the time average.`], [1.05e-4, md`That is $|\tau E_0|^2/(2\eta_0)$, as if the transmitted wave lived in air. It lives in the metal: use $\eta_c$, or $\tfrac12|H|^2R_s$.`]])],
      hints: [md`$\tfrac12|\tilde H_t|^2R_s$. Check: the incident power density times the absorbed fraction from (c).`],
      sol: md`
        **1. From the surface field.**
        $$\langle P\rangle/A = \tfrac12|\tilde H_t|^2R_s = \tfrac12(0.2)^2\frac{\pi}{100}$$
        $$\boxed{\langle P\rangle/A = 2\pi\times10^{-4}\ \text{W/m}^2 \approx 0.628\ \text{mW/m}^2}$$
        **2. Check with the fraction.** The incident power density is
        $$\frac{(12\pi)^2}{2(120\pi)} = 0.6\pi\ \text{W/m}^2$$
        and $0.6\pi\times\frac{1}{3000} = 2\pi\times10^{-4}$ ✓.

        **Speed path.** $\tfrac12(2H_i)^2R_s = 2H_i^2R_s$.

        **Where points go.** Using $\eta_0$ for the transmitted wave (a 6000-fold error); using $H_i$ instead of $2H_i$.
      ` }),
    P({ src: 'Practice F #2(f) · 3 pts', title: 'Judge the statements',
      q: md`**(f) (3 pts)** Which statement is true?`,
      parts: [mc('', [
        md`The metal absorbs $\tfrac{1}{3000}$ of the incident power; the reflected wave carries the rest back.`,
        md`Because $\Gamma \approx -1$, the absorbed power is exactly zero.`,
        md`The absorbed power is $|\tau E_0|^2/(2\eta_0)$.`,
        md`At four times the frequency the absorbed fraction halves, because the skin depth halves.`], 0,
        [null, md`$\Gamma$ is close to $-1$, not equal: $1 - |\Gamma|^2 = 4R_s/\eta_0 \ne 0$.`, md`The transmitted wave is in the metal, so its impedance is $\eta_c$, not $\eta_0$; this formula is 6000 times too small.`, md`$R_s = 1/(\sigma\delta)$ doubles when $\delta$ halves, so $4R_s/\eta_0$ doubles.`])],
      hints: [md`Revisit (c) and (e), and $R_s \propto \sqrt f$.`],
      sol: md`
        **True:** the first statement, from part (c): $1 - |\Gamma|^2 = 4R_s/\eta_0 = \tfrac{1}{3000}$, so 99.97% of the power reflects.

        **The others.** $\Gamma$ is only approximately $-1$. The transmitted wave's power must use the metal's impedance: $\tfrac12|\tilde E_t|^2\Re\{1/\eta_c^*\} = |\tilde E_t|^2/(4R_s)$, which gives the 0.628 mW/m² of part (e). And $R_s \propto \sqrt f$: higher frequency, more absorption.

        **Speed path.** Absorbed fraction $4R_s/\eta_0$ explains all four.

        **Where points go.** Treating "nearly total reflection" as "no absorption".
      ` }),

    // ---------------------------------------------------------------- F Problem 3
    RF(md`
      ### Problem 3 (24 points): half-wave and quarter-wave sections in cascade

      A generator with open-circuit voltage phasor $\tilde F = 20$ V and $R_g = 100\ \Omega$ drives line A ($Z_{0A} = 50\ \Omega$, length 0.5 m). Line A feeds line B ($Z_{0B} = 75\ \Omega$, length 1 m), which ends in $R_L = 25\ \Omega$. Both lines are lossless with $v = 2\times10^8$ m/s, and $f = 100$ MHz. Phasors are amplitudes (peak values).

      [[fig:f3]]
    `, { f3: { svg: figF3(), cap: 'The generator, line A, line B and the load. Lengths in meters; v = 2×10⁸ m/s on both lines.' } }),
    P({ src: 'Practice F #3(a) · 4 pts', title: 'Looking into line B',
      q: md`**(a) (4 pts)** Find the impedance looking into line B at the junction.`,
      parts: [trap(N(md`$Z_{\text{in},B}$`, 25, 'Ω'), [[225, md`That is $Z_{0B}^2/R_L$, the quarter-wave rule. Line B is a half wavelength long: it repeats the load.`], [75, md`The line's $Z_0$ is not what you see unless the line is matched.`]])],
      hints: [md`$\lambda = v/f$. How many wavelengths long is line B? $\Gamma(d) = \Gamma_Le^{-j2\beta d}$.`],
      sol: md`
        **1. Electrical length.** $\lambda = v/f = 2$ m, so line B (1 m) is $\lambda/2$ and line A (0.5 m) is $\lambda/4$.

        **2. A half wave repeats the load.** At $d = \lambda/2$, $2\beta d = 2\pi$:
        $$\Gamma(\lambda/2) = \Gamma_Le^{-j2\pi} = \Gamma_L$$
        The same $\Gamma$ means the same impedance, $Z = Z_{0B}\frac{1 + \Gamma}{1 - \Gamma} = R_L$:
        $$\boxed{Z_{\text{in},B} = 25\ \Omega}$$
        whatever $Z_{0B}$ is.

        !!intuition Does this make sense?
          Line B is not matched ($\Gamma_L = -\tfrac12$, a standing wave on it), but after exactly one half turn of $\Gamma(d)$ the pattern repeats, so the input sees the load again.

        **Speed path.** $\lambda/2$ section: invisible.

        **Where points go.** Applying $Z_0^2/Z_L$ to a half-wave section.
      ` }),
    P({ src: 'Practice F #3(b) · 4 pts', title: 'The input impedance',
      q: md`**(b) (4 pts)** Find the impedance $Z_{\text{in}}$ the generator sees.`,
      parts: [trap(N(md`$Z_{\text{in}}$`, 100, 'Ω'), [[25, md`Line A is a quarter wave: it inverts, $Z_{0A}^2/25$.`], [6.25, md`That uses $Z_L^2/Z_0$. The rule is $Z_0^2/Z_L$.`]])],
      hints: [md`$\Gamma(\lambda/4) = -\Gamma$ at the far end, which gives $Z(\lambda/4) = Z_0^2/Z_{\text{end}}$.`],
      sol: md`
        **1. A quarter wave inverts.** At $d = \lambda/4$, $2\beta d = \pi$, so $\Gamma$ flips sign. With $Z_{\text{end}} = Z_0\frac{1 + \Gamma}{1 - \Gamma}$:
        $$Z(\lambda/4) = Z_0\frac{1 - \Gamma}{1 + \Gamma} = \frac{Z_0^2}{Z_{\text{end}}}$$
        **2. Numbers.** Line A ends in 25 Ω:
        $$Z_{\text{in}} = \frac{50^2}{25}$$
        $$\boxed{Z_{\text{in}} = 100\ \Omega}$$
        It equals $R_g$: line A is a quarter-wave transformer, $Z_{0A} = \sqrt{25\times100}$.

        **Speed path.** $Z_0^2/Z_L$.

        **Where points go.** Inverting the wrong way.
      ` }),
    P({ src: 'Practice F #3(c) · 4 pts', title: 'Input voltage and current',
      q: md`**(c) (4 pts)** Find $|\tilde V_{\text{in}}|$ and $|\tilde I_{\text{in}}|$ at the generator end of line A.`,
      parts: [
        trap(N(md`$|\tilde V_{\text{in}}|$`, 10, 'V'), [[20, md`That is $\tilde F$. The source resistor takes half.`]]),
        N(md`$|\tilde I_{\text{in}}|$`, 0.1, 'A'),
      ],
      hints: [md`The generator sees $R_g$ in series with $Z_{\text{in}}$: a divider.`],
      sol: md`
        **1. The input circuit.** Replace the lines by $Z_{\text{in}} = 100\ \Omega$:
        $$\tilde I_{\text{in}} = \frac{\tilde F}{R_g + Z_{\text{in}}} = \frac{20}{200}$$
        $$\boxed{|\tilde I_{\text{in}}| = 0.1\ \text{A}}$$
        $$\boxed{|\tilde V_{\text{in}}| = 0.1\times100 = 10\ \text{V}}$$

        **Speed path.** Matched: half of $\tilde F$ across the input.

        **Where points go.** Using $\tilde F$ for $\tilde V_{\text{in}}$.
      ` }),
    P({ src: 'Practice F #3(d) · 4 pts', title: 'Power to the load',
      q: md`**(d) (4 pts)** Find the power delivered to $R_L$ and the amplitude $|\tilde V_L|$ across it.`,
      parts: [
        trap(N(md`$P_L$`, 0.5, 'W'), [[1, md`That forgets the $\tfrac12$: $P = \tfrac12\Re\{\tilde V\tilde I^*\}$ for peak phasors.`]]),
        trap(N(md`$|\tilde V_L|$`, 5, 'V'), [[10, md`The voltage changes along the lines; only the power is the same at every point.`]]),
      ],
      hints: [md`Lossless lines pass all the power through. $P_L = \tfrac12|\tilde V_L|^2/R_L$.`],
      sol: md`
        **1. Power in.** $P = \tfrac12\Re\{\tilde V_{\text{in}}\tilde I_{\text{in}}^*\} = \tfrac12(10)(0.1)$:
        $$\boxed{P_L = 0.5\ \text{W}}$$
        since lossless lines deliver everything that enters. It is the most this source can give, $|\tilde F|^2/(8R_g) = 400/800$ ✓.

        **2. Load voltage.** $\tfrac12|\tilde V_L|^2/25 = 0.5$:
        $$\boxed{|\tilde V_L| = 5\ \text{V}}$$

        !!intuition Does this make sense?
          The quarter-wave section steps 10 V at 100 Ω down to 5 V at 25 Ω: the voltage ratio is $\sqrt{100/25} = 2$, as an ideal transformer would do.

        **Speed path.** Power is conserved through lossless sections; get it at the input, use it at the load.

        **Where points go.** Assuming the load voltage equals the input voltage.
      ` }),
    P({ src: 'Practice F #3(e) · 4 pts', title: 'Standing waves on each line',
      q: md`**(e) (4 pts)** Find the VSWR on line B and on line A.`,
      parts: [
        N(md`VSWR on B`, 3, ''),
        trap(N(md`VSWR on A`, 2, ''), [[1, md`The generator sees a match, but line A itself does not: it is terminated by 25 Ω, not 50 Ω.`], [3, md`Line A ends in 25 Ω on a 50 Ω line, $\Gamma = -\tfrac13$, not line B's $-\tfrac12$.`]]),
      ],
      hints: [md`Each line's VSWR comes from the impedance at its own far end, compared with its own $Z_0$.`],
      sol: md`
        **1. Line B.** It ends in 25 Ω:
        $$\Gamma_B = \frac{25 - 75}{25 + 75} = -\tfrac12\quad\Rightarrow\quad\boxed{\text{VSWR}_B = 3}$$
        **2. Line A.** It ends in $Z_{\text{in},B} = 25\ \Omega$:
        $$\Gamma_A = \frac{25 - 50}{25 + 50} = -\tfrac13\quad\Rightarrow\quad\boxed{\text{VSWR}_A = \frac{4/3}{2/3} = 2}$$

        [[fig:v]]

        !!intuition Does this make sense?
          Matched at the input does not mean flat inside. On line A $|V|$ runs from 5 V (at the junction, a minimum since $\Gamma_A < 0$) to 10 V at the input. On line B it swings from 5 V at the load up to 15 V in the middle and back.

        **Speed path.** Each section: its own $\Gamma$ from what terminates it.

        **Where points go.** Calling line A matched because the generator is.
      `,
      figs: { v: { svg: figF3V(), cap: '|V| along the cascade; x is the distance from the generator (x = 0) to the load (x = 1.5 m). The dashed line is the A|B junction.' } } }),
    P({ src: 'Practice F #3(f) · 4 pts', title: 'Twice the frequency',
      q: md`**(f) (4 pts)** The frequency is doubled to 200 MHz. Find the new $Z_{\text{in}}$ and the power to the load.`,
      parts: [
        trap(N(md`$Z_{\text{in}}$ at 200 MHz`, 25, 'Ω'), [[100, md`At 200 MHz line A is $\lambda/2$, not $\lambda/4$: it repeats instead of inverting.`]]),
        trap(N(md`$P_L$ at 200 MHz`, 0.32, 'W'), [[0.5, md`The match is gone: the source sees 25 Ω, not 100 Ω.`], [0.08, md`$P = \tfrac12|\tilde V_{\text{in}}|^2/Z_{\text{in}}$ with $|\tilde V_{\text{in}}| = 4$ V: $16/50$.`]]),
      ],
      hints: [md`$\lambda = 1$ m now. Line B is one full wavelength, line A a half wavelength.`],
      sol: md`
        **1. New lengths.** $\lambda = 2\times10^8/(2\times10^8) = 1$ m. Line B is $\lambda$, line A is $\lambda/2$: both repeat what they see.
        $$\boxed{Z_{\text{in}} = 25\ \Omega}$$
        **2. Input voltage.** Divider:
        $$|\tilde V_{\text{in}}| = 20\cdot\frac{25}{125} = 4\ \text{V}$$
        **3. Power.**
        $$P = \frac{|\tilde V_{\text{in}}|^2}{2Z_{\text{in}}} = \frac{16}{50}$$
        $$\boxed{P_L = 0.32\ \text{W}}$$
        64% of the 0.5 W available.

        !!intuition Does this make sense?
          A quarter-wave transformer only works near its design frequency. At twice the frequency it does nothing at all, and the source sees the bare 25 Ω load: $1 - |\Gamma|^2 = 1 - (75/125)^2 = 0.64$ ✓.

        **Speed path.** Count quarter waves; even counts repeat, odd counts invert.

        **Where points go.** Keeping the 100 Ω from the design frequency.
      ` }),

    // ---------------------------------------------------------------- F Problem 4
    RF(md`
      ### Problem 4 (28 points): an ideal source, an open end and a short

      A lossless line with $Z_0 = 50\ \Omega$, length $l = 200$ m and $v = 2\times10^8$ m/s ($T = l/v = 1\ \mu$s) is uncharged before $t = 0$.

      - **Case A:** an ideal step source $V_g = 10u(t)$ V with **no** series resistance ($R_g = 0$) drives $z = 0$; the far end is **open**.
      - **Case B:** a step source $V_g = 15u(t)$ V with $R_g = 25\ \Omega$ drives $z = 0$; the far end is **shorted**.

      [[fig:f4]]
    `, { f4: { svg: PF.row([{ svg: figF4(false), cap: 'Case A: ideal source, open end.' }, { svg: figF4(true), cap: 'Case B: 25 Ω source, shorted end.' }]).svg } }),
    P({ src: 'Practice F #4(a) · 4 pts', title: 'Case A: the coefficients',
      q: md`**(a) (4 pts)** Case A. Find $\tau_g$, $\Gamma_g$ and $\Gamma_L$.`,
      parts: [
        trap(N('\\tau_g', 1, ''), [[0.5, md`With $R_g = 0$ nothing divides the source: $\tau_g = Z_0/(0 + Z_0) = 1$.`]]),
        trap(N('\\Gamma_g', -1, ''), [[0, md`$\Gamma_g = 0$ needs $R_g = Z_0$. An ideal voltage source holds $V(0)$ fixed, like a short for returning waves.`]]),
        N('\\Gamma_L', 1, ''),
      ],
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$, $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$ with $R_g = 0$.`],
      sol: md`
        **1. Launch.** $\tau_g = 50/(0 + 50)$:
        $$\boxed{\tau_g = 1}$$
        the full 10 V goes onto the line.

        **2. The source end.** $\Gamma_g = (0 - 50)/(0 + 50)$:
        $$\boxed{\Gamma_g = -1}$$
        An ideal voltage source holds $V(0,t) = 10$ V no matter what arrives, so any returning wave must be cancelled by an equal and opposite one: exactly what $\Gamma_g = -1$ does.

        **3. The open end.** $\boxed{\Gamma_L = 1}$.

        **Speed path.** $R_g = 0$: $\tau_g = 1$, $\Gamma_g = -1$.

        **Where points go.** $\Gamma_g = 0$ for "no resistor".
      ` }),
    P({ src: 'Practice F #4(b) · 6 pts', title: 'Case A: the voltage',
      q: md`**(b) (6 pts)** Case A. Find $V(200\text{ m}, 2\ \mu\text{s})$ at the open end, $V(100\text{ m}, 3\ \mu\text{s})$ at the middle, and the period of the pattern.`,
      parts: [
        trap(N(md`$V(200, 2\ \mu\text{s})$`, 20, 'V'), [[10, md`At the open end the arriving 10 V wave and its reflection add: $(1 + \Gamma_L)\times10$.`]]),
        trap(N(md`$V(100, 3\ \mu\text{s})$`, 10, 'V'), [[20, md`At $t = 2.5\ \mu$s the $-10$ V wave from the source passes the middle.`], [30, md`The source's reflection is $-10$ V ($\Gamma_g = -1$), not $+10$.`]]),
        trap(N('\\text{period}', 4, 'µs'), [[2, md`After one round trip ($2T$) the wave on the line is $-10$ V, not $+10$ V. It takes two round trips to come back.`]]),
      ],
      hints: [md`Waves: $+10$ out (0 to 1 µs), $+10$ back (1 to 2), $-10$ out (2 to 3), $-10$ back (3 to 4), then it repeats. The middle sees each one half a microsecond into its trip.`],
      sol: md`
        **1. The waves.** Each trip takes 1 µs; $\Gamma_L = +1$ keeps the sign, $\Gamma_g = -1$ flips it:

        | trip | time (µs) | wave (V) |
        |---|---|---|
        | out | 0 to 1 | $+10$ |
        | back | 1 to 2 | $+10$ |
        | out | 2 to 3 | $-10$ |
        | back | 3 to 4 | $-10$ |
        | out | 4 to 5 | $+10$ (repeats) |

        **2. The open end.** Waves arrive there at $t = 1, 3, 5, \ldots$; each arrival and its reflection both count:
        $$V(200,t) = 20\ \text{V for }1 < t < 3,\quad 0\ \text{for }3 < t < 5$$
        $$\boxed{V(200, 2\ \mu\text{s}) = 20\ \text{V}}$$
        **3. The middle.** Waves pass at 0.5 (+10), 1.5 (+10), 2.5 (−10), 3.5 (−10) µs. Running sum: 10, 20, 10, 0, then 10, 20 again:
        $$\boxed{V(100, 3\ \mu\text{s}) = 10\ \text{V}}$$
        **4. Period.** Two round trips:
        $$\boxed{4T = 4\ \mu\text{s}}$$

        [[fig:bd]]

        [[fig:vt]]

        **Speed path.** $\Gamma_g\Gamma_L = -1$: the sign flips every round trip, so the pattern repeats every $4T$.

        **Where points go.** A period of $2T$; forgetting the open end doubles.
      `,
      figs: {
        bd: { svg: TL.diagram(sF4A, { tMax: 6, w: 380, h: 330 }), cap: 'Case A: the same 10 V wave bounces forever; Γg = −1 flips it at the source, ΓL = +1 keeps it at the open end.' },
        vt: { svg: TL.plotT(sF4A, 200, { tMax: 9, dc: false }), cap: 'V at the open end: a square wave between 0 and 20 V, period 4 µs.' },
      } }),
    P({ src: 'Practice F #4(c) · 5 pts', title: 'Case A: the source current',
      q: md`**(c) (5 pts)** Case A. Find the current out of the source, $I(0,t)$, at $t = 1\ \mu$s and at $t = 3\ \mu$s.`,
      parts: [
        trap(N(md`$I(0, 1\ \mu\text{s})$`, 0.2, 'A'), [[0.4, md`Before $t = 2\ \mu$s only the first wave has passed $z = 0$: $10/50$.`]]),
        trap(N(md`$I(0, 3\ \mu\text{s})$`, -0.2, 'A'), [[0, md`At $t = 2$ two waves start at $z = 0$ together: the returning $+10$ V (current $-0.2$ A) and the new $-10$ V (current $-0.2$ A). Add both to the first $+0.2$ A.`]]),
      ],
      hints: [md`Forward waves carry $I = V/Z_0$; backward waves carry $I = -V/Z_0$.`],
      sol: md`
        **1. Before 2 µs.** Only the first wave: $+10/50$:
        $$\boxed{I(0, 1\ \mu\text{s}) = 0.2\ \text{A}}$$
        **2. At t = 2 µs** the $+10$ V wave returns (backward: $-0.2$ A) and the source sends $-10$ V forward ($-0.2$ A):
        $$I(0) = 0.2 - 0.2 - 0.2$$
        $$\boxed{I(0, 3\ \mu\text{s}) = -0.2\ \text{A}}$$
        At $t = 4$ it swings back to $+0.2$ A: a square wave, period 4 µs.

        [[fig:it]]

        !!intuition Does this make sense?
          The source pours charge into the line for 2 µs, then pulls it back out for 2 µs. The average current is zero, as for a capacitor that keeps charging and discharging without any resistance to damp it.

        **Speed path.** Current at the source: $\pm V_g/Z_0$, switching every round trip.

        **Where points go.** The sign of a backward wave's current.
      `,
      figs: { it: { svg: TL.plotT(sF4A, 0, { qty: 'I', tMax: 9, dc: false }), cap: 'I(0, t): ±0.2 A, switching every 2 µs.' } } }),
    P({ src: 'Practice F #4(d) · 5 pts', title: 'Case A: the steady state',
      q: md`**(d) (5 pts)** Case A. What does the line do as $t\to\infty$?`,
      parts: [mc('', [
        md`It never settles: $V(200,t)$ keeps switching between 0 and 20 V with period 4 µs. Only its average equals the DC answer, 10 V.`,
        md`It settles to 10 V everywhere and zero current after a few round trips.`,
        md`It settles to 20 V at the open end, where every arriving wave is doubled.`,
        md`The current out of the source grows without limit, by 0.4 A every round trip.`], 0,
        [null, md`Settling needs $|\Gamma_g\Gamma_L| < 1$, so that each round trip shrinks the waves. Here $\Gamma_g\Gamma_L = -1$: nothing is ever lost.`, md`20 V is only the value for half of each period; it drops back to 0 at $t = 3, 7, 11, \ldots\ \mu$s.`, md`That happens with $R_g = 0$ and a **short** at the far end ($\Gamma_g\Gamma_L = +1$). With an open end the current alternates.`])],
      hints: [md`Look at $\Gamma_g\Gamma_L$. What does a round trip do to the wave's size?`],
      sol: md`
        !!trap The trap
          The DC circuit (a source across an open) says $V = 10$ V and $I = 0$, and many people write that down. But a steady state is only reached if the bouncing dies out, and here nothing absorbs energy: no $R_g$, no $R_L$, no loss in the line.

        **1. Each round trip.** The wave is multiplied by $\Gamma_g\Gamma_L = (-1)(+1) = -1$: the same size, flipped sign. It never shrinks.

        **2. So.**
        $$\boxed{\text{no steady state: a square wave, period } 4T = 4\ \mu\text{s}}$$
        Its time average is 10 V at the open end and 0 A at the source: the DC answer is what you get by averaging, not by waiting.

        **3. The other ideal case.** With $R_g = 0$ and a short at the end, $\Gamma_g\Gamma_L = +1$: every round trip adds another $2V_g/Z_0 = 0.4$ A at the short, and the current climbs forever (an ideal source shorting itself through a delay).

        **Speed path.** $|\Gamma_g\Gamma_L| = 1$: no steady state. $< 1$: it settles to the DC circuit.

        **Where points go.** Writing the DC answer without checking that the waves decay.
      ` }),
    P({ src: 'Practice F #4(e) · 5 pts', title: 'Case B: the current diagram',
      q: md`**(e) (5 pts)** Case B ($R_g = 25\ \Omega$, $V_g = 15u(t)$ V, shorted end). Draw the current bounce diagram. Find the current of the first wave and the current in the short at $t = 2\ \mu$s and at $t = 4\ \mu$s.`,
      parts: [
        trap(N(md`current of the first wave`, 0.2, 'A'), [[0.6, md`That is $V_g/R_g$, the final current. The first wave sees $R_g + Z_0 = 75\ \Omega$.`]]),
        trap(N(md`$I(200, 2\ \mu\text{s})$`, 0.4, 'A'), [[0, md`A short reflects voltage with $-1$ but current with $+1$: the reflected wave carries $+0.2$ A, so the current in the short doubles.`]]),
        trap(N(md`$I(200, 4\ \mu\text{s})$`, 0.4 + 0.4 / 3, 'A'), [[0.4 - 0.4 / 3, md`That subtracts the second round trip. The source sends back $\Gamma_g(-10) = +\tfrac{10}{3}$ V, whose current is $+\tfrac{1}{15}$ A, and the short doubles it: it **adds** $\tfrac{2}{15}$ A.`]]),
      ],
      hints: [md`$\tau_g = \tfrac23$, $\Gamma_g = -\tfrac13$, $\Gamma_L = -1$. Track voltages first, then convert: forward $I = V/Z_0$, backward $I = -V/Z_0$.`],
      sol: md`
        **1. Coefficients.** $\tau_g = 50/75 = \tfrac23$, $\Gamma_g = (25 - 50)/75 = -\tfrac13$, $\Gamma_L = -1$.

        **2. The waves, voltage and current.**

        | wave | $V$ (V) | $I$ (A) | at the short at |
        |---|---|---|---|
        | 1, forward | $+10$ | $+0.2$ | 1 µs |
        | 2, backward | $-10$ | $+0.2$ | — |
        | 3, forward | $+\tfrac{10}{3}$ | $+\tfrac{1}{15}$ | 3 µs |
        | 4, backward | $-\tfrac{10}{3}$ | $+\tfrac{1}{15}$ | — |

        Wave 2 is $\Gamma_L\times(+10)$; its current is $-V/Z_0 = +0.2$ A. Wave 3 is $\Gamma_g\times(-10) = +\tfrac{10}{3}$ V.

        **3. The current in the short.** Waves 1 and 2 meet there at $t = 1$:
        $$\boxed{I(200, 2\ \mu\text{s}) = 0.2 + 0.2 = 0.4\ \text{A}}$$
        Waves 3 and 4 add $\tfrac{2}{15}$ A at $t = 3$:
        $$\boxed{I(200, 4\ \mu\text{s}) = 0.4 + \tfrac{2}{15} \approx 0.533\ \text{A}}$$
        and the first wave's current is $\boxed{0.2\ \text{A}}$.

        [[fig:bd]]

        [[fig:it]]

        **Speed path.** For current, the reflection coefficients are $-\Gamma$: $+1$ at a short, $+\tfrac13$ at this source. So the current staircase climbs $0.2\to0.4\to0.533\to0.578\ldots$ monotonically.

        **Where points go.** Using $\Gamma_L = -1$ on the current; forgetting that the short sees both waves at once.
      `,
      figs: {
        bd: { svg: TL.diagram(sF4B, { qty: 'I', tMax: 5, w: 380, h: 320 }), cap: 'Case B, current bounce diagram. Every wave adds positive current: for current the short reflects with +1 and the source with +1/3.' },
        it: { svg: TL.plotT(sF4B, 200, { qty: 'I', tMax: 9, dc: false }), cap: 'Current in the short: 0.4, 0.533, 0.578 … A, each step a third of the last.' },
      } }),
    P({ src: 'Practice F #4(f) · 3 pts', title: 'Case B: steady state',
      q: md`**(f) (3 pts)** Case B. Find the steady-state current in the short.`,
      parts: [trap(N(md`$I_{ss}$`, 0.6, 'A'), [[0.2, md`That is the first wave's current. Later waves keep adding.`], [0.3, md`That is $V_g/Z_0$. In steady state no wave travels: the line is a wire, and the source sees only $R_g$.`]])],
      hints: [md`$|\Gamma_g\Gamma_L| = \tfrac13 < 1$: it settles. Replace the line by a wire.`],
      sol: md`
        **1. It settles.** $\Gamma_g\Gamma_L = (-\tfrac13)(-1) = \tfrac13$: each round trip shrinks the new waves by 3.

        **2. DC circuit.** The line is a wire, the short connects it to ground:
        $$\boxed{I_{ss} = \frac{V_g}{R_g} = \frac{15}{25} = 0.6\ \text{A}}$$
        **3. Check with the waves.** $0.4(1 + \tfrac13 + \tfrac19 + \cdots) = 0.4\cdot\tfrac32 = 0.6$ A ✓.

        **Speed path.** $|\Gamma_g\Gamma_L| < 1$: DC circuit, ten seconds.

        **Where points go.** Using $Z_0$ in the DC circuit.
      ` }),
  ];
  EM.lesson('e3-prac', { id: 'e3-prac-f', order: 6, title: 'Practice exam F', kind: 'mock', sub: '75 min · 100 pts · phasor Maxwell, a wave onto a good conductor, half- and quarter-wave sections, ideal and shorted lines', steps: examF });
})();

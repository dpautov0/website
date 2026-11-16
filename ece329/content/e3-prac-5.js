/* Exam 3 practice exams M and N (unit e3-prac), in the exact style of the Fall 2025 Exam 3 (Chen, Mitchell, Shao):
   four problems, 18 / 35 / 29 / 18 points, the same four problem types with new setups.
     e3-prac-m: wet sand (regime at three frequencies, gamma; trap: at 90 MHz neither limit applies);
                air into a 9-eps0 dielectric (Gamma < 0, fields with directions, powers, energy balance);
                a delta source on two lines (50 / 150 ohm, 75 ohm load), V at the middle of line 2, steady state;
                periodic oscillations (7λ/2, 5λ/4, frequency from length, nulls, matched divider).
     e3-prac-n: lake mud (regime, gamma; skin depth vs f); a wave leaving a 4-eps0 dielectric toward -z into air;
                a delta source on two lines with an OPEN load (trap: the spike at the open end is doubled);
                periodic oscillations (9λ/4, 5λ/4, frequency from length, peaks and nulls, matched line).
   Every number recomputed in Python (work-f25/verify.py) and every bounce value checked against TL.arrivals
   (work-f25/tlcheck.js). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  const NT = (lbl, ans, unit, traps, rel) => Object.assign(N(lbl, ans, unit, rel), traps ? { traps: traps.map(([v, msg]) => ({ v, msg })) } : {});
  const TF = (lbl, truth, whyWrong) => ({ lbl, mc: ['True', 'False'], a: truth ? 0 : 1, why: truth ? [null, whyWrong] : [whyWrong, null] });
  const REGIME = ['A. a perfect dielectric', 'B. an imperfect dielectric', 'C. a good conductor', 'D. a perfect conductor'];

  // ---------------------------------------------------------------- drawing helpers
  function zig(g, x1, y1, x2, y2, body = 28) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  function acSource(g, x, y, r = 12) {
    g.circle(x, y, r);
    const pts = [];
    for (let k = 0; k <= 20; k++) pts.push([x - 7 + (14 * k) / 20, y - 4 * Math.sin((2 * PI * k) / 20)]);
    g.pl(pts, { cls: 'thin' });
  }
  function dcSource(g, x, y, r = 12) {
    g.circle(x, y, r);
    g.line(x - 3, y - 5, x + 3, y - 5, { cls: 'thin' }); g.line(x, y - 8, x, y - 2, { cls: 'thin' });
    g.line(x - 3, y + 6, x + 3, y + 6, { cls: 'thin' });
  }
  // an interface at z = 0 drawn horizontally, z up. o: { below, above, belowLab, aboveLab, inc: 'up'|'down', incLab }
  function interfaceFig(o) {
    const g = PF.fig({ alt: o.alt });
    const yS = 118, xL = 40, xR = 330;
    if (o.shadeBelow) g.rect(xL, yS, xR - xL, 84, { cls: 'shade' }); else g.rect(xL, 30, xR - xL, yS - 30, { cls: 'shade' });
    g.line(xL, yS, xR, yS, { cls: 'thick' });
    g.label(xR + 6, yS, 'z = 0', 'l', 'small');
    g.text(70, 50, o.above, 'c', 'small'); g.label(70, 72, o.aboveLab, 'c', 'small');
    g.text(70, 150, o.below, 'c', 'small'); g.label(70, 172, o.belowLab, 'c', 'small');
    if (o.inc === 'up') {
      g.arrow(170, 192, 170, 132, { cls: 'thick', hs: 8 }); g.label(178, 160, o.incLab, 'l', 'small');
      g.arrow(290, 132, 290, 192, { cls: 'thick', hs: 8 }); g.label(282, 182, '\\tilde{\\mathbf E}_r', 'r', 'small');
      g.arrow(170, 104, 170, 40, { cls: 'thick', hs: 8 }); g.label(178, 70, '\\tilde{\\mathbf E}_t', 'l', 'small');
    } else {
      g.arrow(170, 40, 170, 104, { cls: 'thick', hs: 8 }); g.label(178, 66, o.incLab, 'l', 'small');
      g.arrow(290, 104, 290, 40, { cls: 'thick', hs: 8 }); g.label(282, 52, '\\tilde{\\mathbf E}_r', 'r', 'small');
      g.arrow(170, 132, 170, 192, { cls: 'thick', hs: 8 }); g.label(178, 166, '\\tilde{\\mathbf E}_t', 'l', 'small');
    }
    g.arrow(372, 200, 372, 150, { cls: 'dim', hs: 6 }); g.label(372, 144, 'z', 'b', 'small accent');
    return g.svg();
  }
  function twoLineFig(o) {
    const g = PF.fig({ alt: o.alt });
    const T = 34, B = 104, xs = 46, xa = 130, xj = 230, xb = 330;
    dcSource(g, xs, (T + B) / 2);
    g.line(xs, (T + B) / 2 - 12, xs, T); g.line(xs, (T + B) / 2 + 12, xs, B);
    g.line(xs, T, xs + 16, T); zig(g, xs + 16, T, xs + 56, T, 24); g.line(xs + 56, T, xa, T); g.line(xs, B, xa, B);
    g.label(xs + 36, T - 12, o.Rg, 'b', 'small'); g.label(xs - 16, (T + B) / 2, 'f(t)', 'r', 'small');
    g.line(xa, T, xb, T, { cls: 'thick' }); g.line(xa, B, xb, B, { cls: 'thick' });
    g.line(xj, T - 6, xj, B + 6, { cls: 'dash dim' });
    g.label((xa + xj) / 2, T + 18, o.Z1, 'c', 'small'); g.label((xa + xj) / 2, B - 18, 'T_1 = 1\\,\\mu\\text{s}', 'c', 'small');
    g.label((xj + xb) / 2, T + 18, o.Z2, 'c', 'small'); g.label((xj + xb) / 2, B - 18, 'T_2 = 1\\,\\mu\\text{s}', 'c', 'small');
    if (o.RL) { g.line(xb, T, xb + 22, T); zig(g, xb + 22, T, xb + 22, B, 30); g.line(xb + 22, B, xb, B); g.label(xb + 32, (T + B) / 2, o.RL, 'l', 'small'); }
    else { g.circle(xb + 3, T, 3, { cls: 'bgfill' }); g.circle(xb + 3, B, 3, { cls: 'bgfill' }); g.text(xb + 12, (T + B) / 2, 'open', 'l', 'small'); }
    const y = B + 26;
    g.arrow(xa - 4, y, xb + 30, y, { cls: 'dim', hs: 6 }); g.label(xb + 34, y, 'z', 'l', 'small accent');
    [[xa, '0'], [xj, 'l'], [xb, '2l']].forEach(([x, t]) => { g.line(x, y - 4, x, y + 4, { cls: 'dim' }); g.label(x, y + 7, t, 't', 'small'); });
    return g.svg();
  }
  function phasorLine(Z0lab) {
    const g = PF.fig({ alt: `an AC source V_g with R_g drives a lossless line (${Z0lab}) of length l ending in a load Z_L; I(d) flows toward the load on the top wire, V(d) is across the wires; d runs from the load (0) back to the source (l)` });
    const T = 30, B = 110, xs = 40, xa = 120, xb = 300;
    acSource(g, xs, (T + B) / 2);
    g.line(xs, (T + B) / 2 - 12, xs, T); g.line(xs, (T + B) / 2 + 12, xs, B);
    g.line(xs, T, xs + 14, T); zig(g, xs + 14, T, xs + 54, T, 24); g.line(xs + 54, T, xa, T); g.line(xs, B, xa, B);
    g.label(xs + 34, T - 12, 'R_g', 'b', 'small'); g.label(xs - 16, (T + B) / 2, '\\tilde V_g', 'r', 'small');
    g.rect(xa, T, xb - xa, B - T, { cls: 'shade' });
    g.line(xa, T, xb, T, { cls: 'thick' }); g.line(xa, B, xb, B, { cls: 'thick' });
    g.arrow(200, T - 8, 236, T - 8, { hs: 6 }); g.label(218, T - 12, '\\tilde I(d)', 'b', 'small');
    g.label(210, T + 14, '+', 'c', 'small'); g.label(210, (T + B) / 2, '\\tilde V(d)', 'c', 'small'); g.label(210, B - 14, '-', 'c', 'small');
    g.label(150, (T + B) / 2, 'Z_0', 'c', 'small');
    g.line(xb, T, xb + 22, T); zig(g, xb + 22, T, xb + 22, B, 30); g.line(xb + 22, B, xb, B);
    g.label(xb + 32, (T + B) / 2, 'Z_L', 'l', 'small');
    const y = B + 24;
    g.line(xa, y, xb, y, { cls: 'dim' });
    [[xa, 'l'], [210, 'd'], [xb, '0']].forEach(([x, t]) => { g.line(x, y - 4, x, y + 4, { cls: 'dim' }); g.label(x, y + 7, t, 't', 'small'); });
    return g.svg();
  }

  const RULES = md`**Exam rules: 75 minutes, 100 points.** Closed book, closed notes, **no calculator**. You may use the given [loss-limits table](#/l/e3-sheet) and one 4″×6″ card of handwritten notes. Show your reasoning and give units on every answer.`;
  const HOWTO = md`**How to use this paper.** Start a 75-minute timer and do the whole paper on paper first. Then type your answers into the boxes. Sketch questions are asked as the numbers you would write on the sketch. Read every solution, including the parts you got right: each ends with a **Speed path** and **Where points go**. Redo every missed part tomorrow on a blank sheet.`;
  const CONSTS = md`**Constants.** $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \tfrac{10^{-9}}{36\pi}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$. Numeric answers within about 2% count; you may type <code>pi</code>.`;
  const LEARN = (links) => `**Learn it:** ${links}.`;

  // ======================================================================================== EXAM M
  const sM = TL.solve({ Vg: 60, Rg: 50, RL: 75, sections: [{ Z0: 50, len: 1, v: 1 }, { Z0: 150, len: 1, v: 1 }], tMax: 6 });

  const examM = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** This paper copies the shape of the [Fall 2025 Exam 3](#/l/e3-past-fa25), the most recent one: four problems worth 18, 35, 29 and 18 points, with the same four problem types and new numbers. One part is a trap: it tests an idea, not algebra.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Wet sand: which regime at three frequencies, $\gamma$ | 18 |
      | 2 | Air into a dielectric with $\epsilon = 9\epsilon_0$: $\Gamma$, fields with directions, powers | 35 |
      | 3 | Two lines, delta source: bounce diagram, $V$ in the middle of line 2, steady state | 29 |
      | 4 | (not on Exam 3, moved to [Not on Exam 3](#/l/e3-later)) Periodic oscillations on a line: six short parts | 18 |

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- M1
    R(md`
      ### Problem 1 (18 points): a wave in wet sand

      Wet sand has $\mu = \mu_0$, $\epsilon = 4\epsilon_0$ and $\sigma = 10^{-2}$ S/m. Use the given loss-limits table (perfect dielectric, imperfect dielectric, good conductor, perfect conductor).
    `),
    P({ src: 'Practice M #1(a) · 4 pts', title: 'α of an imperfect dielectric',
      q: md`In an imperfect dielectric ($\sigma/\omega\epsilon \ll 1$), the attenuation constant $\alpha$ is nearly independent of frequency. True or false? Explain.`,
      parts: [TF('α is nearly independent of f in an imperfect dielectric', true, md`In an imperfect dielectric $\alpha \approx \tfrac\sigma2\sqrt{\mu/\epsilon}$: no $\omega$ appears. (It is $\beta$ that grows with $f$.)`)],
      hints: [md`Expand $\gamma = j\omega\sqrt{\mu\epsilon}\sqrt{1 - j\sigma/\omega\epsilon}$ for a small ratio.`],
      sol: md`
        **Step 1: γ, exactly.** Phasor Maxwell gives $\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$. Pull out $j\omega\epsilon$:
        $$\gamma = j\omega\sqrt{\mu\epsilon}\,\sqrt{1 - j\frac{\sigma}{\omega\epsilon}}$$
        **Step 2: small loss.** With $\sqrt{1 - x} \approx 1 - x/2$:
        $$\gamma \approx j\omega\sqrt{\mu\epsilon} + \frac{\sigma}{2}\sqrt{\frac\mu\epsilon}$$
        **Step 3: read α.** The real part is
        $$\alpha \approx \frac\sigma2\sqrt{\frac\mu\epsilon}$$
        The $\omega$ cancelled: $\omega\sqrt{\mu\epsilon}\cdot\frac{\sigma}{2\omega\epsilon}$. So
        $$\boxed{\text{True}}$$

        !!intuition Does this make sense?
          Each meter of path costs the same fraction of the field at every (high) frequency, because the loss comes from $\sigma$, which does not care about $f$. In a good conductor it is the opposite: $\alpha = \sqrt{\pi f\mu\sigma}$ grows as $\sqrt f$.

        **Speed path.** Given table: imperfect dielectric $\alpha = \tfrac\sigma2\eta$. No $\omega$. True.

        **Where points go.** Confusing $\alpha$ with the loss tangent $\sigma/\omega\epsilon$ (which does fall with $f$); no reason given.

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),
    P({ src: 'Practice M #1(b) · 4 pts', title: 'Wet sand at 9 GHz',
      q: md`At $f = 9$ GHz, what kind of material is the wet sand? Explain.`,
      parts: [
        NT(md`$\sigma/\omega\epsilon$ at 9 GHz`, 5e-3, '', [[2e-3 * 2.5 * 2 * PI, 'That divides by f instead of ω = 2πf.'], [1.25e-3, 'That forgets ε_r = 4: ωε = 4ωε₀.'], [200, 'That is ωε/σ, upside down.']]),
        mc('The wet sand at 9 GHz is', REGIME, 1,
          [md`$\sigma = 10^{-2}$ S/m is not zero: there is a little loss.`, null, md`That needs $\sigma/\omega\epsilon \gg 1$; here it is $0.005$.`, md`That needs $\sigma = \infty$.`], true),
      ],
      hints: [md`$\omega\epsilon_0 = f/(18\times10^9)$ S/m. Multiply by $\epsilon_r = 4$.`],
      sol: md`
        **Step 1: ωε.** The $\pi$s cancel:
        $$\omega\epsilon = 2\pi(9\times10^9)\cdot\frac{4\times10^{-9}}{36\pi}$$
        $$\omega\epsilon = \frac{72}{36} = 2\ \text{S/m}$$
        **Step 2: the ratio.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{10^{-2}}{2} = 5\times10^{-3} \ll 1$$
        $$\boxed{\text{B. imperfect dielectric}}$$
        **Speed path.** $\omega\epsilon = 4\cdot\tfrac{9}{18} = 2$ S/m; ratio $0.005$.

        **Where points go.** Forgetting $\epsilon_r$; $f$ for $\omega$; no ratio quoted.

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),
    P({ src: 'Practice M #1(c) · 6 pts', title: 'γ at 9 GHz',
      q: md`At $f = 9$ GHz, determine $\gamma = \alpha + j\beta$.`,
      parts: [
        NT('\\alpha', 0.3 * PI, 'Np/m', [[0.6 * PI, 'That drops the 1/2 in α = (σ/2)η.'], [0.6 * PI * 2, 'That uses η₀ = 120π. The sand has η = η₀/√4 = 60π Ω.'], [0.15 * PI, 'That uses η = η₀/4. The impedance scales as 1/√ε_r, not 1/ε_r.']]),
        NT('\\beta', 120 * PI, 'rad/m', [[60 * PI, 'That is ω/c, the free-space value. In the sand β = ω√(μ₀·4ε₀) = 2ω/c.'], [240 * PI, 'That multiplies by ε_r = 4. β scales with √ε_r = 2.']]),
      ],
      hints: [md`$\eta = \eta_0/\sqrt{\epsilon_r} = 60\pi\ \Omega$ and $\beta = \sqrt{\epsilon_r}\,\omega/c$.`],
      sol: md`
        **Step 1: the impedance.** $\eta = \sqrt{\mu_0/4\epsilon_0} = \eta_0/2 = 60\pi\ \Omega$.

        **Step 2: α.** From part (a):
        $$\alpha = \frac{\sigma}{2}\eta = \frac{10^{-2}}{2}(60\pi)$$
        $$\boxed{\alpha = 0.3\pi \approx 0.942\ \text{Np/m}}$$
        **Step 3: β.** $\sqrt{\mu_0\cdot4\epsilon_0} = 2/c$:
        $$\beta = \frac{2\omega}{c} = \frac{2\cdot2\pi(9\times10^9)}{3\times10^8}$$
        $$\boxed{\beta = 120\pi \approx 377\ \text{rad/m}}$$

        !!intuition Does this make sense?
          $\alpha/\beta = 0.3/120 = 0.0025 = \tfrac12\cdot0.005$: half the loss tangent, as it must be in an imperfect dielectric. The full formula gives $0.9425 + j376.99$. ✓

        **Speed path.** $\alpha = \tfrac\sigma2\cdot\tfrac{\eta_0}{2} = 30\pi\sigma$; $\beta = 2\omega/c$.

        **Where points go.** $\eta_0$ instead of $\eta_0/2$; $\beta = \omega/c$ (free space); missing units.

        ${LEARN('[Topic 5](#/l/w2-gamma), [Topic 7](#/l/w2-limits)')}
      ` }),
    P({ src: 'Practice M #1(d) · 4 pts', title: 'Wet sand at 90 MHz',
      q: md`At $f = 90$ MHz, what kind of material is the wet sand? Explain.`,
      parts: [
        NT(md`$\sigma/\omega\epsilon$ at 90 MHz`, 0.5, '', [[2, 'That is ωε/σ, upside down.'], [5e-3, 'That is the 9 GHz value. The ratio grows as 1/f: 100 times lower frequency, 100 times bigger ratio.']]),
        mc('The wet sand at 90 MHz is', [...REGIME, md`E. none of these limits: $\sigma/\omega\epsilon$ is close to 1, so use the full $\gamma = \sqrt{j\omega\mu(\sigma + j\omega\epsilon)}$`], 4,
          [md`$\sigma \ne 0$.`, md`"Imperfect dielectric" needs $\sigma/\omega\epsilon \ll 1$. A ratio of 0.5 is not small: the expansion $\sqrt{1 - x} \approx 1 - x/2$ would be off by several percent and worse for $\beta$.`, md`"Good conductor" needs $\sigma/\omega\epsilon \gg 1$. A ratio of 0.5 is not large.`, md`That needs $\sigma = \infty$.`, null], true),
      ],
      hints: [md`Scale the 9 GHz ratio by $9\times10^9/9\times10^7 = 100$. Is the result much less than 1, much more than 1, or neither?`],
      sol: md`
        **Step 1: scale the ratio.** It goes as $1/f$; the frequency is 100 times lower than in (b):
        $$\frac{\sigma}{\omega\epsilon} = 5\times10^{-3}\times100 = 0.5$$
        **Step 2: read it honestly.** 0.5 is neither $\ll 1$ nor $\gg 1$. Neither approximation of the table holds: the conduction and displacement currents are about the same size. The material is a **general lossy medium**, and $\gamma$ must come from the full formula.
        $$\boxed{\text{E. none of the four limits}}$$
        **Step 3 (for completeness): the full γ.** With $\omega\epsilon = 0.02$ S/m and the ratio 0.5, $\gamma = j\omega\sqrt{\mu\epsilon}\sqrt{1 - j0.5}$. A computer gives $\gamma \approx 0.916 + j3.88$ m$^{-1}$. The imperfect-dielectric formula would give $\alpha = 0.942$ and $\beta = 3.77$: close-ish, but not "approximately equal" by the course's standard.

        !!intuition Does this make sense?
          The table is a list of limits. Between "$\ll 1$" and "$\gg 1$" there is a whole decade or two where no shortcut works. Exam writers like to put one frequency right there.

        **Speed path.** Ratio near 1: say so, and name the full formula. Do not force a row of the table.

        **Where points go.** Choosing "imperfect dielectric" because 0.5 < 1; choosing a regime without quoting the ratio.

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),

    // ---------------------------------------------------------------- M2
    RF(md`
      ### Problem 2 (35 points): from air into a dielectric

      A TEM wave travels in air ($z < 0$) toward a lossless dielectric ($z > 0$, $\mu = \mu_0$, $\epsilon = 9\epsilon_0$). The incident electric field phasor is
      $$\tilde{\mathbf E}_i = \hat x\,60\,e^{-j\beta z}\ \ \text{V/m}$$
      where $\beta$ is the phase constant in air.

      [[fig:if]]
    `, { if: { svg: interfaceFig({ alt: 'the interface z = 0 drawn horizontally; air below (z < 0), the dielectric with epsilon = 9 epsilon_0 above (shaded); the incident wave travels up from the air, the reflected wave goes back down, the transmitted wave goes up into the dielectric', above: 'dielectric', aboveLab: '9\\epsilon_0,\\ \\mu_0', below: 'air', belowLab: '\\epsilon_0,\\ \\mu_0', inc: 'up', incLab: '\\tilde{\\mathbf E}_i = 60\\,e^{-j\\beta z}\\,\\hat x' }), cap: 'The wave starts in air (below) and travels up (+z) into the dielectric.' } }),
    P({ src: 'Practice M #2(a) · 5 pts', title: 'Γ, air to dielectric',
      q: md`Find the reflection coefficient $\Gamma$ of the air to dielectric interface.`,
      parts: [NT('\\Gamma', -0.5, '', [[0.5, 'Sign: the wave goes from high η (air) to low η (η₀/3). Γ = (η₂ − η₁)/(η₂ + η₁) < 0.'], [-0.8, 'That uses ε_r = 9 in place of √ε_r = 3: (1 − 9)/(1 + 9).']])],
      hints: [md`$\eta_2 = \eta_0/\sqrt9 = \eta_0/3$.`],
      sol: md`
        **Step 1: impedances.** $\eta_1 = \eta_0$ (air); $\eta_2 = \eta_0/\sqrt9 = \eta_0/3 = 40\pi\ \Omega$.

        **Step 2: Γ.** From continuity of tangential $\mathbf E$ and $\mathbf H$, $\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$. Multiply top and bottom by $3/\eta_0$:
        $$\Gamma = \frac{1 - 3}{1 + 3}$$
        $$\boxed{\Gamma = -\frac12}$$
        **Does this make sense?** Into a lower impedance, $\Gamma < 0$: like a line ending in a resistor smaller than $Z_0$.

        **Speed path.** $\eta_2/\eta_1 = 1/3$: $\Gamma = (1 - 3)/(1 + 3)$.

        **Where points go.** The sign; $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice M #2(b) · 5 pts', title: 'The transmitted E',
      q: md`Find $\tilde{\mathbf E}_t(z)$ with units and direction.`,
      parts: [
        NT(md`amplitude of $\tilde{\mathbf E}_t$`, 30, 'V/m', [[90, 'That uses τ = 1 − Γ. With Γ = −1/2, τ = 1 + Γ = 1/2.'], [60, 'The field changes across the interface: τ = 1/2.']]),
        mc(md`the phase factor of $\tilde{\mathbf E}_t$`, [md`$e^{-j3\beta z}$`, md`$e^{-j\beta z/3}$`, md`$e^{-j9\beta z}$`, md`$e^{+j3\beta z}$`], 0,
          [null, md`The wave slows down in the dielectric, so its phase constant grows: $\beta_2 = 3\beta$.`, md`$\beta$ scales with $\sqrt{\epsilon_r} = 3$, not with $\epsilon_r$.`, md`The transmitted wave travels toward $+z$: $e^{-j\ldots z}$.`]),
      ],
      hints: [md`$\tau = 1 + \Gamma$; $\beta_2 = \omega\sqrt{\mu_0\cdot9\epsilon_0} = 3\beta$.`],
      sol: md`
        **Step 1: τ.** $\tau = 1 + \Gamma = \tfrac12$, so the amplitude is $\tfrac12\cdot60 = 30$ V/m. $\tau > 0$ keeps the direction $\hat x$.

        **Step 2: phase.** $\beta_2 = \omega\sqrt{9\mu_0\epsilon_0} = 3\omega/c = 3\beta$.
        $$\boxed{\tilde{\mathbf E}_t(z) = \hat x\,30\,e^{-j3\beta z}\ \text{V/m},\quad z > 0}$$
        **Does this make sense?** Here the transmitted field is smaller than the incident one, the opposite of a wave leaving water. Energy check in (e).

        **Speed path.** $\tau = 1/2$, $\beta \to 3\beta$, direction unchanged.

        **Where points go.** $\tau = 1 - \Gamma$; keeping $\beta$; a sign flip of the direction (only $\Gamma$ can flip, $\tau$ cannot be negative here).

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice M #2(c) · 5 pts', title: 'The reflected H',
      q: md`Find $\tilde{\mathbf H}_r(z)$ with units and direction.`,
      parts: [
        NT(md`amplitude of $\tilde{\mathbf H}_r$`, 1 / (4 * PI), 'A/m', [[3 / (4 * PI), 'That divides by η₂ = 40π. The reflected wave is in air: η₀ = 120π.'], [1 / (2 * PI), 'That is the incident H, 60/η₀. The reflected one is |Γ| = 1/2 of it.']]),
        mc(md`the direction of $\tilde{\mathbf H}_r$`, [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat x$`, md`$-\hat z$`], 0,
          [null, md`Two sign flips cancel: $\tilde{\mathbf E}_r = -30\hat x$ (from $\Gamma < 0$) and travel along $-\hat z$. $(-\hat z)\times(-\hat x) = \hat z\times\hat x = +\hat y$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ ($\hat x$).`, md`$-\hat z$ is the direction of travel.`]),
      ],
      hints: [md`$\tilde{\mathbf E}_r = \hat x(-30)e^{+j\beta z}$ and $\tilde{\mathbf H}_r = \frac1{\eta_0}(-\hat z)\times\tilde{\mathbf E}_r$.`],
      sol: md`
        **Step 1: the reflected E.** $\tilde{\mathbf E}_r = \hat x\,\Gamma\,60\,e^{+j\beta z} = -\hat x\,30\,e^{+j\beta z}$ V/m, traveling toward $-z$.

        **Step 2: H.** $\tilde{\mathbf H} = \frac1\eta\hat v\times\tilde{\mathbf E}$ with $\hat v = -\hat z$:
        $$\tilde{\mathbf H}_r = \frac{1}{120\pi}(-\hat z)\times(-30\hat x)\,e^{j\beta z}$$
        $\hat z\times\hat x = \hat y$, and the two minus signs cancel:
        $$\boxed{\tilde{\mathbf H}_r = \hat y\,\frac{1}{4\pi}\,e^{+j\beta z}\ \text{A/m}}$$
        about $0.0796$ A/m.

        **Step 3: boundary check.** $\tilde{\mathbf H}_i = \frac{60}{120\pi}\hat y = \frac1{2\pi}\hat y$ and $\tilde{\mathbf H}_t = \frac{30}{40\pi}\hat y = \frac{3}{4\pi}\hat y$. Then $\frac{2}{4\pi} + \frac{1}{4\pi} = \frac{3}{4\pi}$ ✓.

        !!intuition Does this make sense?
          With $\Gamma < 0$, $\mathbf E$ flips on reflection and $\mathbf H$ does not: the current-wave coefficient is $-\Gamma = +\tfrac12$. The H fields add at the surface (a "current maximum").

        **Speed path.** $|H_r| = |\Gamma|E_0/\eta_0 = 30/120\pi$. $\Gamma < 0$: $\mathbf H_r$ along the incident $\mathbf H$, $+\hat y$.

        **Where points go.** The direction (two signs to track); $\eta_2$ instead of $\eta_0$.

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice M #2(d) · 5 pts', title: 'Incident power',
      q: md`Find $\langle\mathbf S_i\rangle$ with units and direction.`,
      parts: [NT(md`$|\langle\mathbf S_i\rangle|$`, 15 / PI, 'W/m²', [[30 / PI, 'That forgets the 1/2.'], [45 / PI, 'That uses η₂ = 40π. The incident wave is in air.']])],
      hints: [md`$|E_0|^2/2\eta_0$, along $+\hat z$.`],
      sol: md`
        $$|\langle\mathbf S_i\rangle| = \frac{60^2}{2\cdot120\pi} = \frac{3600}{240\pi}$$
        $$\boxed{\langle\mathbf S_i\rangle = \frac{15}{\pi}\,\hat z \approx 4.77\,\hat z\ \text{W/m}^2}$$
        The direction is $\hat x\times\hat y = +\hat z$, the direction of travel.

        **Speed path.** $3600/240\pi = 15/\pi$.

        **Where points go.** No $\tfrac12$; no direction.

        ${LEARN('[Topic 4](#/l/w1-avg)')}
      ` }),
    P({ src: 'Practice M #2(e) · 5 pts', title: 'Transmitted power',
      q: md`Find $\langle\mathbf S_t\rangle$ with units and direction.`,
      parts: [NT(md`$|\langle\mathbf S_t\rangle|$`, 45 / (4 * PI), 'W/m²', [[900 / (240 * PI), 'That divides by η₀. The transmitted wave is in the dielectric: η₂ = 40π.'], [15 / (4 * PI), 'That is τ² S_i. Power also scales with η₁/η₂ = 3.']])],
      hints: [md`$|\tau E_0|^2/2\eta_2$ with $\eta_2 = 40\pi$.`],
      sol: md`
        $$|\langle\mathbf S_t\rangle| = \frac{30^2}{2\cdot40\pi} = \frac{900}{80\pi}$$
        $$\boxed{\langle\mathbf S_t\rangle = \frac{45}{4\pi}\,\hat z \approx 3.58\,\hat z\ \text{W/m}^2}$$
        **Check.** $S_t/S_i = \frac{45/4}{15} = \frac34 = 1 - \Gamma^2$ ✓.

        **Speed path.** $(1 - \Gamma^2)S_i = \tfrac34\cdot\tfrac{15}{\pi}$.

        **Where points go.** Using $\eta_0$ for the transmitted wave; forgetting that power is not $\tau^2 S_i$.

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice M #2(f) · 10 pts', title: 'Energy balance and reflected power',
      q: md`Write conservation of energy at the interface and use it to find $\langle\mathbf S_r\rangle$, with units and direction.`,
      parts: [
        NT(md`$|\langle\mathbf S_r\rangle|$`, 15 / (4 * PI), 'W/m²', [[15 / (2 * PI), 'That is |Γ| S_i. Power goes as Γ² = 1/4.'], [15 / PI + 45 / (4 * PI), 'That adds S_i and S_t.']]),
        mc(md`direction of $\langle\mathbf S_r\rangle$`, [md`$-\hat z$`, md`$+\hat z$`, md`$-\hat x$`, md`$+\hat y$`], 0,
          [null, md`The reflected wave travels back into the air, toward $-z$.`, md`$\mathbf E_r\times\mathbf H_r = (-\hat x)\times\hat y = -\hat z$.`, md`Power flows along the direction of travel.`]),
      ],
      hints: [md`$\langle\mathbf S_i\rangle + \langle\mathbf S_r\rangle = \langle\mathbf S_t\rangle$ as vectors.`],
      sol: md`
        **Step 1: the balance.** A zero-thickness pillbox stores and loses nothing:
        $$\langle\mathbf S_i\rangle + \langle\mathbf S_r\rangle = \langle\mathbf S_t\rangle$$
        **Step 2: solve.**
        $$\langle\mathbf S_r\rangle = \left(\frac{45}{4\pi} - \frac{60}{4\pi}\right)\hat z$$
        $$\boxed{\langle\mathbf S_r\rangle = -\frac{15}{4\pi}\,\hat z \approx -1.19\,\hat z\ \text{W/m}^2}$$
        **Step 3: check.** $\Gamma^2 S_i = \tfrac14\cdot\tfrac{15}{\pi}$ ✓. A quarter of the power reflects.

        **Speed path.** Vector balance, then $S_r = S_t - S_i$ comes out negative: that sign is the direction.

        **Where points go.** $|\Gamma|$ instead of $\Gamma^2$; no direction; writing the balance with all plus signs on magnitudes.

        ${LEARN('[Topic 3](#/l/w1-poynting), [Topic 11](#/l/w4-gamma)')}
      ` }),

    // ---------------------------------------------------------------- M3
    RF(md`
      ### Problem 3 (29 points): two lines and a delta source

      A source $f(t) = 60\,\delta(t)$ V with a $50\ \Omega$ internal resistance (switched on at $t = 0$) drives line 1 ($Z_1 = 50\ \Omega$), which feeds line 2 ($Z_2 = 150\ \Omega$), which ends in $R_L = 75\ \Omega$. A wave takes 1 µs to cross each line.

      [[fig:tl]]

      As on the Fall 2025 paper, each spike's strength (the number in front of its $\delta$) is written in volts and multiplies by $\tau_g$, $\Gamma$ and $\tau$ like a step voltage.
    `, { tl: { svg: twoLineFig({ alt: 'a source f(t) = 60 delta(t) V with R_g = 50 ohm feeds line 1 (Z_1 = 50 ohm, 1 microsecond) then line 2 (Z_2 = 150 ohm, 1 microsecond), ending in R_L = 75 ohm', Rg: 'R_g = 50\\,\\Omega', Z1: 'Z_1 = 50\\,\\Omega', Z2: 'Z_2 = 150\\,\\Omega', RL: 'R_L = 75\\,\\Omega' }), cap: 'Line 1 from 0 to l, line 2 from l to 2l; 1 µs each.' } }),
    P({ src: 'Practice M #3(a) · 14 pts', title: 'The bounce diagram to 6 µs',
      q: md`Draw the voltage bounce diagram to 6 µs. Enter the coefficients and the strengths you would write on the arrows.`,
      parts: [
        NT(md`$\Gamma_{12}$ (from line 1)`, 0.5, '', [[-0.5, 'That is Γ₂₁. From line 1 the wave meets the larger Z₂ = 150 Ω: positive.']]),
        NT(md`$\tau_{21}$ (from line 2 into line 1)`, 0.5, '', [[1.5, 'That is τ₁₂. From line 2, τ₂₁ = 1 + Γ₂₁ = 1 − 1/2.']]),
        NT(md`$\Gamma_L$`, -1 / 3, '', [[0.2, 'That uses Z₁ = 50 Ω. The load ends line 2: (75 − 150)/(75 + 150).']]),
        NT('strength launched at t = 0', 30, 'V', [[60, 'Only τ_g = 50/(50 + 50) = 1/2 is launched.']]),
        NT('strength sent into line 2 at t = 1 µs', 45, 'V', [[15, 'That is the reflected part, Γ₁₂ · 30. Transmitted: τ₁₂ · 30 = 1.5 · 30.']]),
        NT('strength reflected by the load at t = 2 µs', -15, 'V', [[15, 'Γ_L = −1/3 is negative.']]),
        NT('strength sent back into line 1 at t = 3 µs', -7.5, 'V', [[-22.5, 'That uses τ₁₂ = 3/2. From line 2 the transmission is τ₂₁ = 1/2.']]),
        NT('strength re-reflected toward the load at t = 3 µs', 7.5, 'V', [[-7.5, 'Γ₂₁ = −1/2 times −15 V is +7.5 V.']]),
      ],
      hints: [md`$\tau_g = \tfrac12$, $\Gamma_g = 0$, $\Gamma_{12} = \frac{150 - 50}{200}$, $\Gamma_{21} = -\Gamma_{12}$, $\Gamma_L = \frac{75 - 150}{225}$.`],
      sol: md`
        **Step 1: coefficients.**
        $$\tau_g = \frac{50}{100} = \frac12,\qquad \Gamma_g = 0$$
        $$\Gamma_{12} = \frac{150 - 50}{150 + 50} = \frac12,\qquad \tau_{12} = \frac32$$
        $$\Gamma_{21} = -\frac12,\qquad \tau_{21} = \frac12$$
        $$\Gamma_L = \frac{75 - 150}{75 + 150} = -\frac13$$
        **Step 2: walk the times.**
        - $t = 0$: launch $\tfrac12\cdot60 = 30$ V.
        - $t = 1$: at the junction, $15$ V back into line 1 and $45$ V into line 2.
        - $t = 2$: the 15 V is absorbed at the generator. The load reflects $-\tfrac13\cdot45 = -15$ V.
        - $t = 3$: the $-15$ V splits: $\tfrac12(-15) = -7.5$ V into line 1, and $-\tfrac12(-15) = +7.5$ V back to the load.
        - $t = 4$: the $-7.5$ V is absorbed; the load reflects $-\tfrac13(7.5) = -2.5$ V.
        - $t = 5$: $-1.25$ V into line 1, $+1.25$ V back to the load (arrives at 6 µs).

        [[fig:bd]]

        **Speed path.** Box the coefficients, then one multiplication per arrival.

        **Where points go.** One $\tau$ for both directions; a sign on $\Gamma_L$ or $\Gamma_{21}$; drawing a generator reflection when $\Gamma_g = 0$.

        ${LEARN('[Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi)')}
      `,
      figs: { bd: { svg: TL.diagram(sM, { tMax: 6, w: 380, h: 340, probe: 1.5, zUnit: 'l' }), cap: 'Spike strengths in volts; position in units of $l$; times in µs. The dashed probe at $z = 1.5l$ (the middle of line 2) is part (b).' } } }),
    P({ src: 'Practice M #3(b) · 10 pts', title: 'V at the middle of line 2',
      q: md`Sketch the voltage at the midpoint of line 2 ($z = 1.5l$) from 0 to 6 µs. Enter the number of spikes and their strengths.`,
      parts: [
        mc('How many spikes pass the middle of line 2 between 0 and 6 µs?', ['3', '4', '5', '6'], 2,
          [md`Every wave on line 2 passes the middle once, forward and backward: 1.5, 2.5, 3.5, 4.5 and 5.5 µs.`, md`Count the backward waves too: the load reflections pass at 2.5 and 4.5 µs.`, null, md`Nothing passes at 0.5 µs: the first wave is still on line 1.`], true),
        NT('strength at t = 1.5 µs', 45, 'V'),
        NT('strength at t = 2.5 µs', -15, 'V', [[-7.5, 'That is after crossing the junction. At the middle of line 2 the load reflection is still −15 V.']]),
        NT('strength at t = 3.5 µs', 7.5, 'V'),
        NT('strength at t = 4.5 µs', -2.5, 'V'),
      ],
      hints: [md`A forward wave on line 2 passes the middle 0.5 µs after leaving the junction; a backward one, 0.5 µs after leaving the load.`],
      sol: md`
        **Step 1: list the waves on line 2.** Forward: $45$ V (leaves at 1 µs), $7.5$ V (3 µs), $1.25$ V (5 µs). Backward: $-15$ V (leaves the load at 2 µs), $-2.5$ V (4 µs).

        **Step 2: add 0.5 µs to each.**
        $$V(1.5l, t) = 45\,\delta(t - 1.5) - 15\,\delta(t - 2.5)$$
        $$\quad + 7.5\,\delta(t - 3.5) - 2.5\,\delta(t - 4.5) + 1.25\,\delta(t - 5.5)$$
        Five spikes, alternating in sign: the load multiplies each by $-\tfrac13$ and the junction by $-\tfrac12$, so every round trip shrinks a spike by $\tfrac16$ ($45 \to 7.5 \to 1.25$).

        [[fig:vt]]

        **Speed path.** Draw the probe line on the diagram and read the crossings.

        **Where points go.** Missing the backward spikes; using a strength after it crossed into line 1.

        ${LEARN('[Topic 15](#/l/w5-bounce)')}
      `,
      figs: { vt: { svg: TL.plotT(sM, 1.5, { input: 'delta', tMax: 6, name: 'V(1.5l,t)' }), cap: 'Spikes at the middle of line 2; strengths in volts, times in µs.' } } }),
    P({ src: 'Practice M #3(c) · 5 pts', title: 'Steady state: delta and step',
      q: md`(i) What is the steady-state voltage at the middle of line 1 for this source? (ii) If the source were instead a step, $60\,u(t)$ V, what would the steady-state voltage at the middle of line 1 be?`,
      parts: [
        mc('(i) with f(t) = 60δ(t)', ['0 V', '36 V', '30 V', '60 V'], 0,
          [null, md`That is the DC answer for a 60 V step. A spike leaves nothing behind once its echoes die.`, md`30 V is the launched spike, which passes once.`, md`60 is the source strength, not a lasting voltage.`]),
        NT('(ii) with f(t) = 60u(t)', 36, 'V', [[30, 'That uses the launch divider with Z₁. At DC the lines are wires: the divider is R_L/(R_g + R_L).'], [60, 'R_g still drops voltage at DC because current flows through R_L.']]),
      ],
      hints: [md`At DC, a lossless line is just two wires.`],
      sol: md`
        **(i)** The delta source is zero for $t > 0$. Each echo loses energy to $R_L$ and the matched generator, so all voltages decay to zero:
        $$\boxed{V_{ss} = 0\ \text{V}}$$
        **(ii)** For a step, wait long enough and every voltage is constant; a lossless line carrying DC is two wires. The circuit is $60$ V, $R_g = 50\ \Omega$ and $R_L = 75\ \Omega$ in series:
        $$V_{ss} = 60\cdot\frac{75}{50 + 75} = 36\ \text{V}$$
        the same everywhere on both lines.

        **Speed path.** Delta: zero. Step: $V_g R_L/(R_g + R_L)$.

        **Where points go.** Mixing the two; using $Z_1$ or $Z_2$ in the DC divider.

        ${LEARN('[Topic 14](#/l/w5-launch)')}
      ` }),

    // ---------------------------------------------------------------- M4
    Object.assign(RF(md`
      ### Problem 4 (18 points): periodic oscillations

      Six short, **independent** questions. An AC source $\tilde V_g$ with $R_g = 50\ \Omega$ drives a lossless line of length $l$, $Z_0 = 100\ \Omega$ and $v = c$, ending in a load $Z_L$; $Z_{eq}$ is the impedance the source sees. $d$ is measured from the load.

      [[fig:pl]]
    `, { pl: { svg: phasorLine('Z_0 = 100 ohm'), cap: 'The line circuit; $d = 0$ at the load, $d = l$ at the source.' } }), { later: true }),
    P({ later: true, src: 'Practice M #4(a) · 3 pts', title: 'Current through a 7λ/2 line',
      q: md`Let $l = 7\lambda/2$. Express the input current $\tilde I(l)$ in terms of the load current $\tilde I_L$.`,
      parts: [mc(md`$\tilde I(l)$`, [md`$-\tilde I_L$`, md`$\tilde I_L$`, md`$j\tilde I_L$`, md`It depends on $Z_L$`], 0,
        [null, md`$7\lambda/2$ is an odd number of half waves: $e^{\pm j7\pi} = -1$.`, md`$\pm j$ belongs to odd quarter waves.`, md`Both exponentials in $\tilde I(d)$ become $-1$, whatever $\Gamma_L$ is.`])],
      sol: md`
        $\beta l = 7\pi$, so $e^{\pm j7\pi} = -1$:
        $$\tilde I(l) = \frac{V^+}{Z_0}(-1 + \Gamma_L) = -\tilde I_L$$
        $$\boxed{\tilde I(l) = -\tilde I_L}$$
        **Speed path.** 7 half waves, odd: minus sign.

        **Where points go.** Answering $\tilde I_L$ (true for impedance, not for current).

        ${LEARN('[Topic 17](#/l/w6-vd)')}
      ` }),
    P({ later: true, src: 'Practice M #4(b) · 3 pts', title: 'A 5λ/4 line on 400 Ω',
      q: md`Let $l = 5\lambda/4$ and $Z_L = 400\ \Omega$. Find $Z_{eq}$.`,
      parts: [NT('Z_{eq}', 25, 'Ω', [[400, 'That is the half-wave rule. 5λ/4 is an odd number of quarter waves.'], [1600, 'That is Z_L²/Z₀. The inverter gives Z₀²/Z_L.']])],
      sol: md`
        $5\lambda/4 = 2\cdot\tfrac\lambda2 + \tfrac\lambda4$: an odd quarter wave, so the line inverts:
        $$Z_{eq} = \frac{Z_0^2}{Z_L} = \frac{100^2}{400}$$
        $$\boxed{Z_{eq} = 25\ \Omega}$$
        **Speed path.** Odd quarter wave: $Z_0^2/Z_L$.

        **Where points go.** Treating $5\lambda/4$ as a half-wave line.

        ${LEARN('[Topic 19](#/l/w6-qw)')}
      ` }),
    P({ later: true, src: 'Practice M #4(c) · 3 pts', title: 'Frequency from length',
      q: md`The line is $500$ m long, which is an electrical length of $5\lambda/4$. Find $\omega$.`,
      parts: [NT('\\omega', 1.5 * PI * 1e6, 'rad/s', [[7.5e5, 'That is f. ω = 2πf.'], [2 * PI * 3e8 / 625, 'That uses λ = 500 · 5/4. If l = 5λ/4 then λ = 4l/5 = 400 m.']])],
      sol: md`
        $$\lambda = \frac{4l}{5} = 400\ \text{m}$$
        $$f = \frac c\lambda = \frac{3\times10^8}{400} = 7.5\times10^5\ \text{Hz}$$
        $$\boxed{\omega = 2\pi f = 1.5\pi\times10^6 \approx 4.71\times10^6\ \text{rad/s}}$$
        **Speed path.** $\lambda = 400$ m, $f = 750$ kHz, times $2\pi$.

        **Where points go.** $f$ for $\omega$; inverting $5/4$.

        ${LEARN('[Topic 18](#/l/w6-stubs)')}
      ` }),
    P({ later: true, src: 'Practice M #4(d) · 3 pts', title: 'Open line, current null at l/3',
      q: md`The load is removed (open). Besides the open end, a current null is observed at $d = l/3$. Find the shortest possible $l$ and the resulting $Z_{eq}$.`,
      parts: [
        NT(md`shortest $l$, in wavelengths`, 1.5, 'λ', [[0.75, 'That puts the null at λ/4. Current nulls of an open line are at d = 0, λ/2, λ, ...'], [0.5, 'Then l/3 = λ/6, not a null.']]),
        mc(md`$Z_{eq}$`, [md`$\infty$ (an open)`, md`$0$ (a short)`, md`$100\ \Omega$`, md`$-j100\ \Omega$`], 0,
          [null, md`A short appears at odd quarter waves from an open. $l = 3\lambda/2$ is a whole number of half waves.`, md`A lossless open line is purely reactive (or open/short); it cannot look like $Z_0$.`, md`$-jZ_0\cot\beta l = -j100$ needs $\beta l = \pi/4$.`]),
      ],
      sol: md`
        **Step 1.** Open: $\Gamma_L = 1$, $\tilde I(d) = \frac{2jV^+}{Z_0}\sin\beta d$, nulls at $d = n\lambda/2$.

        **Step 2.** $l/3 = \lambda/2$ (the first null after the end):
        $$\boxed{l = \tfrac{3\lambda}{2}}$$
        **Step 3.** An open line has $Z_{eq} = -jZ_0\cot\beta l$, and $\beta l = 3\pi$: $\cot3\pi \to \infty$:
        $$\boxed{Z_{eq} = \infty}$$
        Equivalently: a whole number of half waves repeats the load, an open.

        **Speed path.** Current nulls every $\lambda/2$ from the open end; three of them span $l$; half-wave multiple repeats the open.

        **Where points go.** Using voltage-null spacing (odd $\lambda/4$); answering 0.

        ${LEARN('[Topic 18](#/l/w6-stubs)')}
      ` }),
    P({ later: true, src: 'Practice M #4(e) · 3 pts', title: 'Shorted line, voltage null at l/5',
      q: md`The load is a short. Besides the short itself, a voltage null is observed at $d = l/5$. What is the shortest possible electrical length?`,
      parts: [NT(md`$l$, in wavelengths`, 2.5, 'λ', [[1.25, 'That puts the first voltage null at λ/4. On a shorted line the voltage nulls are at d = 0, λ/2, λ, ...'], [5, 'That uses λ for the first null. The spacing is λ/2.']])],
      sol: md`
        Short: $\tilde V(d) = 2jV^+\sin\beta d$, nulls at $d = n\lambda/2$. The first one after $d = 0$ is $\lambda/2$:
        $$\frac l5 = \frac\lambda2 \quad\Rightarrow\quad \boxed{l = \tfrac{5\lambda}{2}}$$
        **Speed path.** Short: voltage nulls every $\lambda/2$. Five of them in $l$.

        **Where points go.** $\lambda/4$ spacing (that is null to peak).

        ${LEARN('[Topic 18](#/l/w6-stubs)')}
      ` }),
    P({ later: true, src: 'Practice M #4(f) · 3 pts', title: 'Matched load: the input voltage',
      q: md`Let $Z_L = Z_0 = 100\ \Omega$. Find $|\tilde V(l)|/|\tilde V_g|$, the size of the input voltage relative to the source.`,
      parts: [NT(md`$|\tilde V(l)|/|\tilde V_g|$`, 2 / 3, '', [[1 / 3, 'That is R_g/(R_g + Z₀), the drop across R_g.'], [0.5, 'That assumes R_g = Z₀. Here R_g = 50 Ω and Z_eq = 100 Ω.']])],
      sol: md`
        A matched line has $Z(d) = Z_0$ at every $d$ (no reflected wave), so $Z_{eq} = 100\ \Omega$ for **any** length. The source sees a divider:
        $$\frac{|\tilde V(l)|}{|\tilde V_g|} = \frac{Z_{eq}}{R_g + Z_{eq}} = \frac{100}{150}$$
        $$\boxed{\frac23}$$
        And $|\tilde V(d)|$ is the same, $\tfrac23|\tilde V_g|$, all the way to the load; only the phase changes.

        **Speed path.** Matched: $Z_{eq} = Z_0$, then the divider.

        **Where points go.** Using a length-dependent $Z_{eq}$; the divider upside down.

        ${LEARN('[Topic 17](#/l/w6-vd), [Topic 19: the input circuit](#/l/w6-qw)')}
      ` }),
    R(md`**Done.** Score yourself, then compare with the [Fall 2025 paper](#/l/e3-past-fa25) and try [Practice exam N](#/l/e3-prac-n) tomorrow.`),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-m', order: 13, title: 'Practice exam M', kind: 'mock', sub: 'Fall 2025 style · 75 min · 100 pts · wet sand, air into glass, a delta pulse on two lines (the six standing-wave parts are not on Exam 3)', steps: examM });

  // ======================================================================================== EXAM N
  const sN = TL.solve({ Vg: 80, Rg: 75, RL: Infinity, sections: [{ Z0: 75, len: 1, v: 1 }, { Z0: 25, len: 1, v: 1 }], tMax: 6 });

  const examN = [
    R(md`
      ${RULES}

      ${HOWTO}

      **The format.** The shape of the [Fall 2025 Exam 3](#/l/e3-past-fa25): 18, 35, 29 and 18 points, the same four problem types with new setups. One part is a trap.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | Lake mud: regime at two frequencies, $\gamma$, skin depth and frequency | 18 |
      | 2 | A wave leaving a dielectric toward $-z$ into air: $\Gamma$, fields, powers | 35 |
      | 3 | Two lines with an open end, delta source: bounce diagram, $V$ at a point, steady state | 29 |
      | 4 | (not on Exam 3, moved to [Not on Exam 3](#/l/e3-later)) Periodic oscillations on a line: six short parts | 18 |

      ${CONSTS}
    `),

    // ---------------------------------------------------------------- N1
    R(md`
      ### Problem 1 (18 points): a wave in lake mud

      Lake-bottom mud has $\mu = \mu_0$, $\epsilon = 16\epsilon_0$ and $\sigma = 0.04$ S/m.
    `),
    P({ src: 'Practice N #1(a) · 4 pts', title: 'Skin depth and frequency',
      q: md`In a good conductor, the skin depth $\delta$ increases as the frequency increases. True or false? Explain.`,
      parts: [TF('δ increases with f in a good conductor', false, md`In a good conductor $\delta = 1/\sqrt{\pi f\mu\sigma}$: it **decreases** as $1/\sqrt f$. Higher frequencies stay closer to the surface.`)],
      sol: md`
        In a good conductor $\alpha = \sqrt{\pi f\mu\sigma}$, so
        $$\delta = \frac1\alpha = \frac{1}{\sqrt{\pi f\mu\sigma}}$$
        which falls as $1/\sqrt f$:
        $$\boxed{\text{False}}$$

        !!intuition Does this make sense?
          Quadruple the frequency and the skin depth halves. That is why high-frequency currents crowd into a thin layer of a wire, and why AC resistance grows with frequency.

        **Speed path.** $\delta \propto 1/\sqrt f$. False.

        **Where points go.** Answering from the imperfect-dielectric row, where $\delta$ does not depend on $f$.

        ${LEARN('[Topic 7](#/l/w2-limits), [Topic 8](#/l/w2-loss)')}
      ` }),
    P({ src: 'Practice N #1(b) · 4 pts', title: 'Lake mud at 2.25 GHz',
      q: md`At $f = 2.25$ GHz, what kind of material is the mud? Explain.`,
      parts: [
        NT(md`$\sigma/\omega\epsilon$ at 2.25 GHz`, 0.02, '', [[0.32, 'That forgets ε_r = 16.'], [50, 'That is ωε/σ, upside down.']]),
        mc('The mud at 2.25 GHz is', REGIME, 1,
          [md`$\sigma \ne 0$.`, null, md`The ratio is $0.02$, far below 1.`, md`That needs $\sigma = \infty$.`], true),
      ],
      hints: [md`$\omega\epsilon_0 = f/(18\times10^9)$ S/m; multiply by 16.`],
      sol: md`
        $$\omega\epsilon = 16\cdot\frac{2.25\times10^9}{18\times10^9} = 16\cdot0.125 = 2\ \text{S/m}$$
        $$\frac{\sigma}{\omega\epsilon} = \frac{0.04}{2} = 0.02 \ll 1$$
        $$\boxed{\text{B. imperfect dielectric}}$$
        **Speed path.** $\omega\epsilon_0 = f/18$ GHz.

        **Where points go.** Forgetting $\epsilon_r$.

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),
    P({ src: 'Practice N #1(c) · 6 pts', title: 'γ at 2.25 GHz',
      q: md`At $f = 2.25$ GHz, find $\gamma = \alpha + j\beta$.`,
      parts: [
        NT('\\alpha', 0.6 * PI, 'Np/m', [[1.2 * PI, 'That drops the 1/2.'], [2.4 * PI, 'That uses η₀. The mud has η = η₀/4 = 30π Ω.']]),
        NT('\\beta', 60 * PI, 'rad/m', [[15 * PI, 'That is ω/c, the free-space value. Multiply by √ε_r = 4.'], [240 * PI, 'That multiplies by ε_r = 16 instead of √16 = 4.']]),
      ],
      sol: md`
        **Step 1.** $\eta = \eta_0/\sqrt{16} = 30\pi\ \Omega$, so
        $$\alpha = \frac\sigma2\eta = 0.02\cdot30\pi$$
        $$\boxed{\alpha = 0.6\pi \approx 1.88\ \text{Np/m}}$$
        **Step 2.** $\beta = 4\omega/c$:
        $$\beta = \frac{4\cdot2\pi(2.25\times10^9)}{3\times10^8}$$
        $$\boxed{\beta = 60\pi \approx 188\ \text{rad/m}}$$
        **Check.** $\alpha/\beta = 0.01 = \tfrac12(0.02)$ ✓. The full formula gives $1.8849 + j188.50$.

        **Speed path.** $\alpha = \tfrac\sigma2\cdot\tfrac{\eta_0}{4}$, $\beta = 4\omega/c$.

        **Where points go.** $\epsilon_r$ in place of $\sqrt{\epsilon_r}$ in either one.

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),
    P({ src: 'Practice N #1(d) · 4 pts', title: 'Lake mud at 450 kHz',
      q: md`At $f = 450$ kHz, what kind of material is the mud? Explain.`,
      parts: [
        NT(md`$\sigma/\omega\epsilon$ at 450 kHz`, 100, '', [[0.01, 'That is ωε/σ.'], [4e-6, 'That divided the 2.25 GHz ratio by 5000 instead of multiplying.']]),
        mc('The mud at 450 kHz is', REGIME, 2,
          [md`$\sigma \ne 0$.`, md`That was 2.25 GHz. The ratio grows as $1/f$: $\times5000$.`, null, md`$\sigma$ is finite.`], true),
      ],
      sol: md`
        The frequency is $2.25\times10^9/4.5\times10^5 = 5000$ times lower, so
        $$\frac{\sigma}{\omega\epsilon} = 0.02\times5000 = 100 \gg 1$$
        $$\boxed{\text{C. good conductor}}$$
        **Speed path.** Scale by $1/f$.

        **Where points go.** Scaling the wrong way.

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),

    // ---------------------------------------------------------------- N2
    RF(md`
      ### Problem 2 (35 points): leaving a dielectric

      A lossless dielectric ($\mu = \mu_0$, $\epsilon = 4\epsilon_0$) fills $z > 0$; air fills $z < 0$. A wave in the dielectric travels **toward $-z$**:
      $$\tilde{\mathbf E}_i = \hat x\,20\,e^{+j\beta z}\ \ \text{V/m}$$
      where $\beta$ is the dielectric's phase constant.

      [[fig:if]]
    `, { if: { svg: interfaceFig({ alt: 'the interface z = 0 drawn horizontally; the dielectric with epsilon = 4 epsilon_0 above (z > 0, shaded), air below; the incident wave travels down toward the interface, the reflected wave goes back up, the transmitted wave goes down into the air', above: 'dielectric', aboveLab: '4\\epsilon_0,\\ \\mu_0', below: 'air', belowLab: '\\epsilon_0,\\ \\mu_0', inc: 'down', incLab: '\\tilde{\\mathbf E}_i = 20\\,e^{+j\\beta z}\\,\\hat x' }), cap: 'The wave starts in the dielectric (above) and travels down (−z) into the air.' } }),
    P({ src: 'Practice N #2(a) · 5 pts', title: 'Γ, dielectric to air',
      q: md`Find $\Gamma$ at the interface.`,
      parts: [NT('\\Gamma', 1 / 3, '', [[-1 / 3, 'Medium 1 is the one the wave comes from (the dielectric, η₀/2). Air has the larger η: Γ > 0.'], [0.6, 'That uses ε_r = 4 in place of √ε_r = 2.']])],
      sol: md`
        $\eta_1 = \eta_0/2 = 60\pi$ (dielectric, where the wave comes from), $\eta_2 = \eta_0$:
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1} = \frac{2 - 1}{2 + 1}$$
        $$\boxed{\Gamma = \frac13}$$
        The direction of travel does not change the formula: "1" is always the incident side.

        **Speed path.** Ratio 2: $(2 - 1)/(2 + 1)$.

        **Where points go.** Labeling the media by $z$ instead of by the incident side.

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice N #2(b) · 5 pts', title: 'The transmitted E',
      q: md`Find $\tilde{\mathbf E}_t(z)$ for $z < 0$.`,
      parts: [
        NT(md`amplitude of $\tilde{\mathbf E}_t$`, 80 / 3, 'V/m', [[40 / 3, 'That uses τ = 1 − Γ.'], [20 / 3, 'That is the reflected amplitude.']]),
        mc(md`the phase factor of $\tilde{\mathbf E}_t$`, [md`$e^{+j\beta z/2}$`, md`$e^{-j\beta z/2}$`, md`$e^{+j2\beta z}$`, md`$e^{+j\beta z}$`], 0,
          [null, md`The transmitted wave keeps going toward $-z$: $e^{+j\ldots z}$.`, md`Air has the smaller phase constant: $\beta_0 = \beta/2$.`, md`$\beta$ belongs to the dielectric; air's is $\beta/2$.`]),
      ],
      sol: md`
        $\tau = 1 + \tfrac13 = \tfrac43$, amplitude $\tfrac43\cdot20 = \tfrac{80}{3} \approx 26.7$ V/m, direction $+\hat x$. Air's phase constant is $\beta/2$, and the wave travels toward $-z$:
        $$\boxed{\tilde{\mathbf E}_t = \hat x\,\frac{80}{3}\,e^{+j\beta z/2}\ \text{V/m}}$$
        **Speed path.** $\tau = 4/3$; keep the sign of the exponent (same direction of travel); halve $\beta$.

        **Where points go.** Flipping the exponent's sign out of habit (most problems go toward $+z$).

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice N #2(c) · 5 pts', title: 'The reflected H',
      q: md`Find $\tilde{\mathbf H}_r(z)$ with units and direction.`,
      parts: [
        NT(md`amplitude of $\tilde{\mathbf H}_r$`, 1 / (9 * PI), 'A/m', [[1 / (18 * PI), 'That divides by η₀. The reflected wave is in the dielectric: η₁ = 60π.'], [1 / (3 * PI), 'That is the incident H.']]),
        mc(md`the direction of $\tilde{\mathbf H}_r$`, [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat x$`, md`$+\hat z$`], 0,
          [null, md`That is the incident $\mathbf H$'s direction. The reflected wave travels toward $+z$: $\hat z\times\hat x = +\hat y$.`, md`$\mathbf H\perp\mathbf E$.`, md`$+\hat z$ is the direction of travel.`]),
        mc(md`the phase factor of $\tilde{\mathbf H}_r$`, [md`$e^{-j\beta z}$`, md`$e^{+j\beta z}$`, md`$e^{-j\beta z/2}$`, md`$e^{+j\beta z/2}$`], 0,
          [null, md`The reflected wave goes back up, toward $+z$: $e^{-j\beta z}$.`, md`The reflected wave stays in the dielectric: $\beta$, not $\beta/2$.`, md`Wrong medium and wrong direction.`]),
      ],
      sol: md`
        **Step 1.** $\tilde{\mathbf E}_r = \hat x\,\tfrac13(20)\,e^{-j\beta z} = \hat x\,\tfrac{20}{3}e^{-j\beta z}$, traveling toward $+z$.

        **Step 2.** $\tilde{\mathbf H}_r = \frac1{\eta_1}\hat z\times\tilde{\mathbf E}_r$ and $\hat z\times\hat x = \hat y$:
        $$\frac{20/3}{60\pi} = \frac{1}{9\pi}$$
        $$\boxed{\tilde{\mathbf H}_r = \hat y\,\frac{1}{9\pi}\,e^{-j\beta z}\ \text{A/m}}$$
        about $0.0354$ A/m.

        **Step 3: check.** $\tilde{\mathbf H}_i = \frac{1}{60\pi}(-\hat z)\times20\hat x = -\frac{1}{3\pi}\hat y$; $\tilde{\mathbf H}_t = \frac1{120\pi}(-\hat z)\times\tfrac{80}{3}\hat x = -\frac{2}{9\pi}\hat y$. At $z = 0$: $-\tfrac3{9\pi} + \tfrac1{9\pi} = -\tfrac2{9\pi}$ ✓.

        **Speed path.** $\Gamma > 0$: $\mathbf H_r$ is opposite to $\mathbf H_i$ ($-\hat y$), so $+\hat y$; size $\Gamma E_0/\eta_1$.

        **Where points go.** The direction (with the incident wave going $-z$, every sign is the mirror of the usual case).

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice N #2(d) · 5 pts', title: 'Incident power',
      q: md`Find $\langle\mathbf S_i\rangle$ with units and direction.`,
      parts: [
        NT(md`$|\langle\mathbf S_i\rangle|$`, 10 / (3 * PI), 'W/m²', [[5 / (3 * PI), 'That uses η₀. The incident wave is in the dielectric, η₁ = 60π.'], [20 / (3 * PI), 'That forgets the 1/2.']]),
        mc(md`direction of $\langle\mathbf S_i\rangle$`, [md`$-\hat z$`, md`$+\hat z$`, md`$+\hat x$`, md`$-\hat y$`], 0,
          [null, md`The incident wave travels toward $-z$.`, md`$\hat x$ is $\mathbf E$.`, md`$\hat y$ is (minus) $\mathbf H$.`]),
      ],
      sol: md`
        $$|\langle\mathbf S_i\rangle| = \frac{20^2}{2\cdot60\pi} = \frac{400}{120\pi}$$
        $$\boxed{\langle\mathbf S_i\rangle = -\frac{10}{3\pi}\,\hat z \approx -1.06\,\hat z\ \text{W/m}^2}$$
        Check: $\hat x\times(-\hat y) = -\hat z$ ✓.

        **Speed path.** $E^2/2\eta_1$, along the travel.

        **Where points go.** $+\hat z$ by habit.

        ${LEARN('[Topic 4](#/l/w1-avg)')}
      ` }),
    P({ src: 'Practice N #2(e) · 5 pts', title: 'Transmitted power',
      q: md`Find $\langle\mathbf S_t\rangle$ with units and direction.`,
      parts: [NT(md`$|\langle\mathbf S_t\rangle|$`, 80 / (27 * PI), 'W/m²', [[160 / (27 * PI), 'That divides by η₁ = 60π, which gives the same number as τ²S_i. The transmitted wave is in air: η₀ = 120π.'], [160 / (27 * PI) * 2, 'That forgets the 1/2 and uses η₁.']])],
      sol: md`
        $$|\langle\mathbf S_t\rangle| = \frac{(80/3)^2}{2\cdot120\pi} = \frac{6400/9}{240\pi}$$
        $$\boxed{\langle\mathbf S_t\rangle = -\frac{80}{27\pi}\,\hat z \approx -0.943\,\hat z\ \text{W/m}^2}$$
        **Check.** $S_t/S_i = \frac{80/27}{10/3} = \frac{8}{9} = 1 - \Gamma^2$ ✓.

        **Speed path.** $(1 - \tfrac19)\cdot\tfrac{10}{3\pi}$.

        **Where points go.** $\eta_1$ for the air wave; the direction.

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Practice N #2(f) · 10 pts', title: 'Energy balance and reflected power',
      q: md`Write conservation of energy at the interface and find $\langle\mathbf S_r\rangle$ with units and direction.`,
      parts: [
        NT(md`$|\langle\mathbf S_r\rangle|$`, 10 / (27 * PI), 'W/m²', [[10 / (9 * PI), 'That is Γ S_i. Power goes as Γ².'], [170 / (27 * PI), 'That adds S_i and S_t.']]),
        mc(md`direction of $\langle\mathbf S_r\rangle$`, [md`$+\hat z$`, md`$-\hat z$`, md`$+\hat y$`, md`$-\hat x$`], 0,
          [null, md`The reflected wave goes back into the dielectric, toward $+z$.`, md`Power flows along the travel, $\pm\hat z$.`, md`Power flows along the travel.`]),
      ],
      sol: md`
        **Balance.** $\langle\mathbf S_i\rangle + \langle\mathbf S_r\rangle = \langle\mathbf S_t\rangle$, so
        $$\langle\mathbf S_r\rangle = \left(-\frac{80}{27\pi} + \frac{90}{27\pi}\right)\hat z$$
        $$\boxed{\langle\mathbf S_r\rangle = \frac{10}{27\pi}\,\hat z \approx 0.118\,\hat z\ \text{W/m}^2}$$
        **Check.** $\Gamma^2S_i = \tfrac19\cdot\tfrac{10}{3\pi}$ ✓. Only 1/9 of the power reflects.

        **Speed path.** Vector balance; the sign comes out by itself.

        **Where points go.** Signs (every flow here is the mirror of the usual).

        ${LEARN('[Topic 3](#/l/w1-poynting), [Topic 11](#/l/w4-gamma)')}
      ` }),

    // ---------------------------------------------------------------- N3
    RF(md`
      ### Problem 3 (29 points): two lines, an open end, a delta source

      A source $f(t) = 80\,\delta(t)$ V with $R_g = 75\ \Omega$ (switched on at $t = 0$) drives line 1 ($Z_1 = 75\ \Omega$), which feeds line 2 ($Z_2 = 25\ \Omega$), whose far end is **open**. A wave takes 1 µs to cross each line.

      [[fig:tl]]
    `, { tl: { svg: twoLineFig({ alt: 'a source f(t) = 80 delta(t) V with R_g = 75 ohm feeds line 1 (Z_1 = 75 ohm, 1 microsecond) then line 2 (Z_2 = 25 ohm, 1 microsecond), whose far end is open', Rg: 'R_g = 75\\,\\Omega', Z1: 'Z_1 = 75\\,\\Omega', Z2: 'Z_2 = 25\\,\\Omega', RL: null }), cap: 'Line 1 from 0 to l, line 2 from l to 2l, open at 2l.' } }),
    P({ src: 'Practice N #3(a) · 14 pts', title: 'The bounce diagram to 6 µs',
      q: md`Draw the voltage bounce diagram to 6 µs. Enter the coefficients and the strengths, and the size of the spike that appears **across the open end** at $t = 2$ µs.`,
      parts: [
        NT(md`$\Gamma_{12}$`, -0.5, '', [[0.5, 'From line 1 (75 Ω) the wave meets 25 Ω: smaller, so negative.']]),
        NT(md`$\tau_{21}$`, 1.5, '', [[0.5, 'That is τ₁₂. From line 2, τ₂₁ = 1 + Γ₂₁ = 1 + 1/2.']]),
        NT('strength launched at t = 0', 40, 'V'),
        NT('strength sent into line 2 at t = 1 µs', 20, 'V', [[60, 'That uses τ₂₁ = 3/2. From line 1, τ₁₂ = 1/2.']]),
        NT('strength reflected back into line 1 at t = 1 µs', -20, 'V'),
        NT('spike across the open end at t = 2 µs', 40, 'V', [[20, 'That is only the arriving wave. At the open end the arriving and reflected waves are both there at the same instant: 20 + 20 = 40 V.'], [80, 'That doubles the launched 40 V. Only 20 V crossed the junction into line 2; the open end doubles that.']]),
        NT('strength sent back into line 1 at t = 3 µs', 30, 'V', [[10, 'That uses τ₁₂ = 1/2. From line 2, τ₂₁ = 3/2.']]),
        NT('strength re-reflected toward the open end at t = 3 µs', 10, 'V', [[-10, 'Γ₂₁ = +1/2 here: from 25 Ω the wave meets 75 Ω.']]),
      ],
      hints: [md`$\tau_g = \tfrac12$, $\Gamma_g = 0$, $\Gamma_{12} = \frac{25 - 75}{100}$, $\Gamma_{21} = +\tfrac12$, $\Gamma_L = +1$ (open).`, md`The voltage at a point is the sum of every wave there at that instant. At the end of the line, the incident and the reflected waves coincide.`],
      sol: md`
        **Step 1: coefficients.**
        $$\tau_g = \frac{75}{150} = \frac12,\qquad\Gamma_g = 0$$
        $$\Gamma_{12} = \frac{25 - 75}{25 + 75} = -\frac12,\qquad\tau_{12} = \frac12$$
        $$\Gamma_{21} = +\frac12,\qquad\tau_{21} = \frac32,\qquad\Gamma_L = +1$$
        **Step 2: walk the times.**
        - $t = 0$: launch $40$ V.
        - $t = 1$: $-20$ V back into line 1, $20$ V into line 2.
        - $t = 2$: the $-20$ V is absorbed. The 20 V reaches the open end and reflects as $+20$ V.
        - $t = 3$: the 20 V splits: $\tfrac32(20) = 30$ V into line 1, $\tfrac12(20) = 10$ V back to the open end.
        - $t = 4$: 30 V absorbed; 10 V reflects as 10 V.
        - $t = 5$: 15 V into line 1, 5 V back to the open end.

        **Step 3: the voltage across the open end (the trap).** $V$ at a point is the **sum** of all waves there. At $z = 2l$ and $t = 2$ µs, the arriving 20 V spike and its reflection (also 20 V) are both present:
        $$(1 + \Gamma_L)\cdot20 = 2\cdot20 = 40$$
        So $V(2l, t)$ has the spike $40\,\delta(t - 2)$:
        $$\boxed{40\ \text{V}}$$
        [[fig:bd]]

        !!intuition Does this make sense?
          At an open end the current waves cancel ($I = 0$) and the voltage waves add. It is the same factor $1 + \Gamma$ as the transmission coefficient: an open end "transmits" into an infinite resistor, and $\tau = 2$.

        **Speed path.** Box the five coefficients; walk 1, 2, 3...; at any end, the voltage there is $(1 + \Gamma)$ times the arriving wave.

        **Where points go.** Writing 20 V across the open end; $\tau_{12}$ for both directions; the sign of $\Gamma_{12}$.

        ${LEARN('[Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi)')}
      `,
      figs: { bd: { svg: TL.diagram(sN, { tMax: 6, w: 380, h: 340, probe: 0.5, zUnit: 'l' }), cap: 'Spike strengths in volts; position in units of $l$; times in µs. The dashed probe at $z = l/2$ is part (b).' } } }),
    P({ src: 'Practice N #3(b) · 10 pts', title: 'V at the middle of line 1',
      q: md`Sketch the voltage at the midpoint of line 1 from 0 to 6 µs. Enter the strengths.`,
      parts: [
        NT('strength at t = 0.5 µs', 40, 'V', [[80, 'Only τ_g = 1/2 is launched.']]),
        NT('strength at t = 1.5 µs', -20, 'V', [[20, 'That is the wave into line 2. Back on line 1 comes Γ₁₂ · 40 = −20 V.']]),
        NT('strength at t = 3.5 µs', 30, 'V', [[20, 'That forgets τ₂₁ = 3/2 at the junction.']]),
        NT('strength at t = 5.5 µs', 15, 'V'),
      ],
      sol: md`
        Line 1 carries: the launched 40 V (passes at 0.5 µs), the junction reflection $-20$ V (1.5 µs), and the waves coming back out of line 2: 30 V (leaves the junction at 3 µs, passes at 3.5) and 15 V (5.5 µs). $\Gamma_g = 0$, so nothing else.
        $$V(\tfrac l2, t) = 40\,\delta(t - 0.5) - 20\,\delta(t - 1.5)$$
        $$\quad + 30\,\delta(t - 3.5) + 15\,\delta(t - 5.5)$$
        [[fig:vt]]

        **Does this make sense?** The open line 2 keeps ringing (its echo shrinks by only $\Gamma_L\Gamma_{21} = \tfrac12$ per round trip), and every ring leaks $\tau_{21} = 1.5$ times the echo into line 1.

        **Speed path.** Probe line on the diagram; read four crossings.

        **Where points go.** Missing the negative junction reflection; spikes at 2.5 or 4.5 µs that do not exist.

        ${LEARN('[Topic 15](#/l/w5-bounce)')}
      `,
      figs: { vt: { svg: TL.plotT(sN, 0.5, { input: 'delta', tMax: 6, name: 'V(l/2,t)' }), cap: 'Spikes at the middle of line 1; strengths in volts, times in µs.' } } }),
    P({ src: 'Practice N #3(c) · 5 pts', title: 'Steady state',
      q: md`(i) What is the steady-state voltage at the middle of line 2 for this source? (ii) If the source were a step, $80\,u(t)$ V, what would it be?`,
      parts: [
        mc('(i) with f(t) = 80δ(t)', ['0 V', '80 V', '40 V', '20 V'], 0,
          [null, md`That is the step answer. A delta leaves nothing behind.`, md`40 V is the launched spike.`, md`20 V is the first spike on line 2.`]),
        NT('(ii) with f(t) = 80u(t)', 80, 'V', [[40, 'That is the launch, τ_g · 80. At DC an open load draws no current, so R_g drops nothing.'], [60, 'That uses a divider with Z₂ = 25 Ω. At DC the lines are wires and the load is open.']]),
      ],
      sol: md`
        **(i)** The delta source is zero after $t = 0$. The echo in line 2 shrinks by $\tfrac12$ per round trip and leaks out through line 1 into the matched generator. Everything decays:
        $$\boxed{V_{ss} = 0\ \text{V}}$$
        **(ii)** For a step, at DC the lines are wires and the load is open: no current flows, so $R_g$ drops nothing:
        $$\boxed{V_{ss} = 80\ \text{V}}$$
        **Speed path.** Delta: 0. Step into an open: the full source voltage.

        **Where points go.** Answering 40 V (the first launch) for the step.

        ${LEARN('[Topic 14](#/l/w5-launch)')}
      ` }),

    // ---------------------------------------------------------------- N4
    Object.assign(RF(md`
      ### Problem 4 (18 points): periodic oscillations

      Independent questions. An AC source $\tilde V_g$ with $R_g = 75\ \Omega$ drives a lossless line of length $l$, $Z_0 = 50\ \Omega$, $v = c$, ending in $Z_L$. $Z_{eq}$ is the impedance the source sees; $d$ is measured from the load.

      [[fig:pl]]
    `, { pl: { svg: phasorLine('Z_0 = 50 ohm'), cap: 'The line circuit; $d = 0$ at the load, $d = l$ at the source.' } }), { later: true }),
    P({ later: true, src: 'Practice N #4(a) · 3 pts', title: 'Input voltage of a 9λ/4 line',
      q: md`Let $l = 9\lambda/4$. Express $\tilde V(l)$ in terms of the load current $\tilde I_L$.`,
      parts: [mc(md`$\tilde V(l)$`, [md`$j50\,\tilde I_L$`, md`$-j50\,\tilde I_L$`, md`$50\,\tilde I_L$`, md`$-\tilde V_L$`], 0,
        [null, md`Check the sign: $e^{j9\pi/2} = e^{j\pi/2} = +j$.`, md`A real factor would need a whole number of half waves.`, md`$-\tilde V_L$ is for an odd number of half waves; $9\lambda/4$ is an odd number of quarter waves.`])],
      hints: [md`$\beta l = 9\pi/2$, so $e^{j\beta l} = j$ and $e^{-j\beta l} = -j$. Compare with $\tilde I_L = \frac{V^+}{Z_0}(1 - \Gamma_L)$.`],
      sol: md`
        $\beta l = 9\pi/2$: $e^{j9\pi/2} = j$, $e^{-j9\pi/2} = -j$.
        $$\tilde V(l) = V^+(j - j\Gamma_L) = jV^+(1 - \Gamma_L)$$
        And $\tilde I_L = \tilde I(0) = \frac{V^+}{Z_0}(1 - \Gamma_L)$, so
        $$\boxed{\tilde V(l) = jZ_0\tilde I_L = j50\,\tilde I_L}$$

        !!intuition Does this make sense?
          An odd quarter-wave line swaps the roles of voltage and current: the input voltage is set by the load current. That is the impedance inverter, seen in phasors.

        **Speed path.** Odd quarter wave: $V_{in} = \pm jZ_0 I_L$; the sign from $e^{j\beta l}$ ($9\pi/2 \equiv \pi/2$, so $+j$).

        **Where points go.** The sign of $j$.

        ${LEARN('[Topic 17](#/l/w6-vd), [Topic 19](#/l/w6-qw)')}
      ` }),
    P({ later: true, src: 'Practice N #4(b) · 3 pts', title: 'A 5λ/4 line on 25 Ω',
      q: md`Let $l = 5\lambda/4$ and $Z_L = 25\ \Omega$. Find $Z_{eq}$.`,
      parts: [NT('Z_{eq}', 100, 'Ω', [[25, 'That is the half-wave rule.'], [12.5, 'That is Z_L²/Z₀.']])],
      sol: md`
        $$Z_{eq} = \frac{Z_0^2}{Z_L} = \frac{2500}{25}$$
        $$\boxed{Z_{eq} = 100\ \Omega}$$
        **Speed path.** Odd quarter wave: invert.

        **Where points go.** Half-wave thinking.

        ${LEARN('[Topic 19](#/l/w6-qw)')}
      ` }),
    P({ later: true, src: 'Practice N #4(c) · 3 pts', title: 'Frequency from length',
      q: md`The line is 3 km long, an electrical length of $3\lambda/4$. Find $\omega$.`,
      parts: [NT('\\omega', 1.5 * PI * 1e5, 'rad/s', [[7.5e4, 'That is f.'], [2 * PI * 3e8 / 2250, 'That uses λ = 3 · 3/4 km. λ = 4l/3 = 4 km.']])],
      sol: md`
        $$\lambda = \frac{4l}{3} = 4\ \text{km}$$
        $$f = \frac{3\times10^8}{4\times10^3} = 75\ \text{kHz}$$
        $$\boxed{\omega = 1.5\pi\times10^5 \approx 4.71\times10^5\ \text{rad/s}}$$
        **Speed path.** $\lambda$, then $c/\lambda$, then $2\pi$.

        **Where points go.** $f$ for $\omega$.

        ${LEARN('[Topic 18](#/l/w6-stubs)')}
      ` }),
    P({ later: true, src: 'Practice N #4(d) · 3 pts', title: 'Shorted line, current peak at l/3',
      q: md`The load is a short. Besides the short itself, a maximum of the current oscillation is observed at $d = l/3$. What is $Z_{eq}$?`,
      parts: [mc(md`$Z_{eq}$`, [md`$0\ \Omega$`, md`$\infty$`, md`$50\ \Omega$`, md`$j50\ \Omega$`], 0,
        [null, md`An open needs an odd quarter wave of shorted line. Current peaks on a shorted line are $\lambda/2$ apart, so $l = 3\lambda/2$: whole half waves, which repeat the short.`, md`A shorted lossless line is purely reactive.`, md`$j50$ needs $\beta l = \pi/4$.`])],
      sol: md`
        Short: $\tilde I(d) = \frac{2V^+}{Z_0}\cos\beta d$, peaks at $d = 0, \lambda/2, \lambda, \ldots$ So $l/3 = n\lambda/2$, $l = 3n\lambda/2$, and $\beta l = 3n\pi$:
        $$Z_{eq} = jZ_0\tan(3n\pi) = 0$$
        $$\boxed{Z_{eq} = 0\ \Omega}$$
        **Speed path.** Current peaks on a short sit at the short and every $\lambda/2$: $l$ is a half-wave multiple, so the short repeats.

        **Where points go.** Using the voltage-peak spacing (offset by $\lambda/4$).

        ${LEARN('[Topic 18](#/l/w6-stubs)')}
      ` }),
    P({ later: true, src: 'Practice N #4(e) · 3 pts', title: 'Open line, voltage null at l/3',
      q: md`The line is left open. A voltage null is observed at $d = l/3$. What is the shortest possible electrical length?`,
      parts: [NT(md`$l$, in wavelengths`, 0.75, 'λ', [[1.5, 'That uses λ/2 for the first voltage null. On an open line the voltage is largest at the end; its first null is λ/4 away.'], [0.25, 'That is the null position itself, l/3 = λ/4. Solve for l.']])],
      sol: md`
        Open: $\tilde V(d) = 2V^+\cos\beta d$, nulls at $d = \lambda/4 + n\lambda/2$. Shortest: $n = 0$:
        $$\frac l3 = \frac\lambda4 \quad\Rightarrow\quad \boxed{l = \tfrac{3\lambda}{4}}$$
        **Speed path.** Open end = voltage peak; first null $\lambda/4$ away.

        **Where points go.** Using current-null spacing.

        ${LEARN('[Topic 18](#/l/w6-stubs)')}
      ` }),
    P({ later: true, src: 'Practice N #4(f) · 3 pts', title: 'Matched line: |V(d)|',
      q: md`Let $Z_L = Z_0$. Then $|\tilde V(d)|$ is the same at every point of the line. True or false? Explain.`,
      parts: [TF('|V(d)| is constant along a matched line', true, md`With $\Gamma_L = 0$, $\tilde V(d) = V^+e^{j\beta d}$, whose magnitude is $|V^+|$ everywhere. Only the phase changes.`)],
      sol: md`
        $\Gamma_L = 0$ leaves one traveling wave: $\tilde V(d) = V^+e^{j\beta d}$, so $|\tilde V(d)| = |V^+|$:
        $$\boxed{\text{True}}$$
        (The phasor itself changes: $\tilde V(l) = \tilde V(0)e^{j\beta l}$. The [Fall 2025 paper](#/l/e3-past-fa25) asked about that.) No standing wave: VSWR = 1.

        **Speed path.** Matched: flat $|V|$, VSWR 1.

        **Where points go.** Mixing up "same magnitude" and "same phasor".

        ${LEARN('[Topic 17](#/l/w6-vd)')}
      ` }),
    R(md`**Done.** Score yourself, then redo the missed parts tomorrow. Back to the [Fall 2025 paper](#/l/e3-past-fa25) or on to [Practice exam M](#/l/e3-prac-m).`),
  ];

  EM.lesson('e3-prac', { id: 'e3-prac-n', order: 14, title: 'Practice exam N', kind: 'mock', sub: 'Fall 2025 style · 75 min · 100 pts · lake mud, leaving a dielectric, a delta pulse into an open line (the six standing-wave parts are not on Exam 3)', steps: examN });
})();

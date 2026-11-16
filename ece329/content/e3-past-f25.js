/* Past Exam 3: Fall 2025 (Chen, Mitchell, Shao), Monday December 1, 2025. The most recent Exam 3, and Prof. Chen
   writes this term's exam, so it heads the past-exam list (order 0.5).
     e3-past-fa25   1 dry earth: which regime, gamma (18) · 2 sea water to air: Gamma, tau, fields, power (35)
                    3 two lines, a delta source: bounce diagram, V at a point, steady state (29)
                    4 periodic oscillations on a lossless line: half/quarter-wave lengths, stubs, nulls (18)
   Source: a scanned student copy. Retyped clean: no handwriting, no names, no footers; every figure redrawn; every
   answer derived here from first principles (the student's own answers are not used). Numbers checked in
   work-f25/verify.py and against TL.arrivals (work-f25/tlcheck.js). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  const NT = (lbl, ans, unit, traps, rel) => Object.assign(N(lbl, ans, unit, rel), traps ? { traps: traps.map(([v, msg]) => ({ v, msg })) } : {});
  const TF = (lbl, truth, whyWrong) => ({ lbl, mc: ['True', 'False'], a: truth ? 0 : 1, why: truth ? [null, whyWrong] : [whyWrong, null] });

  // ---------------------------------------------------------------- drawing helpers
  function zig(g, x1, y1, x2, y2, body = 28) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // an AC source (circle with a small sine) centered at (x, y)
  function acSource(g, x, y, r = 12) {
    g.circle(x, y, r);
    const pts = [];
    for (let k = 0; k <= 20; k++) pts.push([x - 7 + (14 * k) / 20, y - 4 * Math.sin((2 * PI * k) / 20)]);
    g.pl(pts, { cls: 'thin' });
  }
  // a pulse/step source drawn as a circle with + and -
  function dcSource(g, x, y, r = 12) {
    g.circle(x, y, r);
    g.line(x - 3, y - 5, x + 3, y - 5, { cls: 'thin' }); g.line(x, y - 8, x, y - 2, { cls: 'thin' });
    g.line(x - 3, y + 6, x + 3, y + 6, { cls: 'thin' });
  }

  // Problem 2: sea water below z = 0, air above
  function seaFig() {
    const g = PF.fig({ alt: 'the sea surface z = 0 drawn as a horizontal line; air above (z > 0), sea water below (z < 0) with epsilon = 81 epsilon_0 and mu_0; the incident wave travels up toward the surface, the reflected wave travels down, the transmitted wave travels up into the air; z points up' });
    const yS = 118, xL = 40, xR = 330;
    g.rect(xL, yS, xR - xL, 84, { cls: 'shade' });
    g.line(xL, yS, xR, yS, { cls: 'thick' });
    g.label(xR + 6, yS, 'z = 0', 'l', 'small');
    g.text(70, 40, 'air', 'c', 'small'); g.label(70, 60, '\\epsilon_0,\\ \\mu_0', 'c', 'small');
    g.text(80, 150, 'sea water', 'c', 'small'); g.label(80, 172, '81\\epsilon_0,\\ \\mu_0', 'c', 'small');
    g.arrow(170, 192, 170, 132, { cls: 'thick', hs: 8 }); g.label(178, 160, '\\tilde{\\mathbf E}_i = 50\\,e^{-j\\beta z}\\,\\hat y', 'l', 'small');
    g.arrow(290, 132, 290, 192, { cls: 'thick', hs: 8 }); g.label(282, 182, '\\tilde{\\mathbf E}_r', 'r', 'small');
    g.arrow(170, 104, 170, 40, { cls: 'thick', hs: 8 }); g.label(178, 70, '\\tilde{\\mathbf E}_t', 'l', 'small');
    g.arrow(372, 200, 372, 150, { cls: 'dim', hs: 6 }); g.label(372, 144, 'z', 'b', 'small accent');
    return g.svg();
  }

  // Problem 3: source, Rg, line 1, line 2, RL
  function twoLineFig() {
    const g = PF.fig({ alt: 'a source f(t) = 100 delta(t) V in series with R_g = 25 ohm and a switch closed at t = 0 feeds line 1 (Z_1 = 25 ohm, delay 1 microsecond), then line 2 (Z_2 = 37.5 ohm, delay 1 microsecond), which ends in R_L = 75 ohm' });
    const T = 34, B = 104, xs = 46, xa = 130, xj = 230, xb = 330;
    dcSource(g, xs, (T + B) / 2);
    g.line(xs, (T + B) / 2 - 12, xs, T); g.line(xs, (T + B) / 2 + 12, xs, B);
    g.line(xs, T, xs + 16, T); zig(g, xs + 16, T, xs + 56, T, 24); g.line(xs + 56, T, xa, T); g.line(xs, B, xa, B);
    g.label(xs + 36, T - 12, 'R_g = 25\\,\\Omega', 'b', 'small');
    g.label(xs - 16, (T + B) / 2, 'f(t)', 'r', 'small');
    g.line(xa, T, xb, T, { cls: 'thick' }); g.line(xa, B, xb, B, { cls: 'thick' });
    g.line(xj, T - 6, xj, B + 6, { cls: 'dash dim' });
    g.label((xa + xj) / 2, T + 18, 'Z_1 = 25\\,\\Omega', 'c', 'small'); g.label((xa + xj) / 2, B - 18, 'T_1 = 1\\,\\mu\\text{s}', 'c', 'small');
    g.label((xj + xb) / 2, T + 18, 'Z_2 = 37.5\\,\\Omega', 'c', 'small'); g.label((xj + xb) / 2, B - 18, 'T_2 = 1\\,\\mu\\text{s}', 'c', 'small');
    g.line(xb, T, xb + 22, T); zig(g, xb + 22, T, xb + 22, B, 30); g.line(xb + 22, B, xb, B);
    g.label(xb + 32, (T + B) / 2, 'R_L = 75\\,\\Omega', 'l', 'small');
    const y = B + 26;
    g.arrow(xa - 4, y, xb + 30, y, { cls: 'dim', hs: 6 }); g.label(xb + 34, y, 'z', 'l', 'small accent');
    [[xa, '0'], [xj, 'l'], [xb, '2l']].forEach(([x, t]) => { g.line(x, y - 4, x, y + 4, { cls: 'dim' }); g.label(x, y + 7, t, 't', 'small'); });
    return g.svg();
  }

  // Problem 4: the phasor circuit, and its equivalent
  function p4Line() {
    const g = PF.fig({ alt: 'an AC source V_g with R_g drives a lossless line of characteristic impedance Z_0 = 25 ohm and length l, ending in a load Z_L; along the line the current I(d) flows toward the load on the top wire and V(d) is the voltage across the wires; d is measured from the load (d = 0) back to the source (d = l)' });
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
  function p4Eq() {
    const g = PF.fig({ alt: 'the same source V_g and R_g connected to a single equivalent impedance Z_eq = R_eq + j X_eq that stands for the line and its load' });
    const T = 30, B = 110, xs = 40, xb = 150;
    acSource(g, xs, (T + B) / 2);
    g.line(xs, (T + B) / 2 - 12, xs, T); g.line(xs, (T + B) / 2 + 12, xs, B);
    g.line(xs, T, xs + 14, T); zig(g, xs + 14, T, xs + 54, T, 24); g.line(xs + 54, T, xb, T); g.line(xs, B, xb, B);
    g.label(xs + 34, T - 12, 'R_g', 'b', 'small'); g.label(xs - 16, (T + B) / 2, '\\tilde V_g', 'r', 'small');
    zig(g, xb, T, xb, B, 30); g.label(xb + 10, (T + B) / 2, 'Z_{eq}', 'l', 'small');
    return g.svg();
  }

  // the bounce system of Problem 3 (step solver; for a delta source each front's value is the pulse strength)
  const s3 = TL.solve({ Vg: 100, Rg: 25, RL: 75, sections: [{ Z0: 25, len: 1, v: 1 }, { Z0: 37.5, len: 1, v: 1 }], tMax: 6 });

  // standing-wave pictures for Problem 4 (d) and (e)
  const p4dFig = () => PF.plot({ w: 340, h: 190, x: [0, 0.5], y: [-0.15, 1.25], zero: true, xl: 'd', yl: '|\\tilde V(d)|',
    xt: [[0, '0'], [0.25, '\\tfrac{l}{2}'], [0.5, 'l']], yt: [],
    curves: [{ f: (d) => Math.abs(Math.sin(2 * PI * d)), n: 300 }] });
  const p4eFig = () => PF.plot({ w: 340, h: 190, x: [0, 2], y: [-0.15, 1.25], zero: true, xl: 'd', yl: '|\\tilde I(d)|',
    xt: [[0, '0'], [0.5, '\\tfrac{l}{4}'], [1, '\\tfrac{l}{2}'], [2, 'l']], yt: [],
    curves: [{ f: (d) => Math.abs(Math.sin(2 * PI * d)), n: 600 }] });

  const LEARN = (links) => `**Learn it:** ${links}.`;

  const fa25 = [
    R(md`
      **Fall 2025 · ECE 329 · Exam 3** (Chen, Mitchell, Shao). Monday, December 1, 2025, 7:00–8:15 PM (75 minutes). Four problems, 100 points: 18, 35, 29 and 18. Closed book and closed notes, **no calculators**, one 4″×6″ index card of handwritten notes. Show all work and reasoning; every answer needs its units. Work on scratch pages earns no credit.

      **Why this paper matters most.** It is the most recent Exam 3, and Prof. Chen writes yours. Expect the same feel: one lossy-medium problem decided by the ratio $\sigma/\omega\epsilon$, one reflection problem worth a third of the paper (fields with directions, then power), and one delta-pulse bounce diagram on two lines. (The paper also had six quick standing-wave questions on a phasor line, Problem 4. They use Lectures 31-34, so they are **not on this term's Exam 3**: they are moved to [Not on Exam 3](#/l/e3-later).) The numbers are chosen so that every answer is a fraction or a multiple of $\pi$.

      | Problem | What it tests | Points | Learn it |
      |---|---|---|---|
      | 1 | Dry earth: which regime at 10 GHz and at 100 Hz, $\gamma$, $\lambda$ vs $\delta$ | 18 | [Topic 5](#/l/w2-gamma), [Topic 7](#/l/w2-limits) |
      | 2 | Sea water to air: $\Gamma$, $\tilde{\mathbf E}_t$, $\tilde{\mathbf H}_r$, three powers, energy balance | 35 | [Topic 11](#/l/w4-gamma), [Topic 4](#/l/w1-avg) |
      | 3 | Two lines, delta source: bounce diagram to 6 µs, $V$ at a midpoint, steady state | 29 | [Topic 14](#/l/w5-launch), [Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi) |
      | 4 | (not on Exam 3) Periodic oscillations: $\lambda/2$ and $\lambda/4$ lines, frequency from length, nulls and peaks | 18 | Lectures 31-34 |

      **How to use it.** Start a 75-minute timer and do the whole paper on paper first, closed book, with only the [given table](#/l/e3-sheet) and your card. Then enter your answers in the boxes. Sketch questions (the bounce diagram and the voltage at a point) are asked here as the numbers you would write on the sketch. Then read every solution, also for parts you got right: each ends with a **Speed path** (the fastest correct route) and **Where points go** (the slips that cost points).

      **Constants.** $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = \tfrac{10^{-9}}{36\pi}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$. Numeric answers within about 2% count; you may type <code>pi</code>, as in <code>0.06*pi</code>.

      **No posted key.** This paper was rebuilt from a student copy, without an official key. Every answer below is derived from first principles and checked numerically. One part, 3(c), has an answer that surprises most people; its solution explains why.
    `),

    // ---------------------------------------------------------------- Problem 1
    R(md`
      ### Problem 1 (18 points): a wave in dry earth

      Consider TEM wave propagation in dry earth, which has the parameters $\mu = \mu_0$, $\epsilon = \epsilon_0$ and $\sigma = 10^{-3}$ S/m. Answer the following questions using $\mu_0 = 4\pi\times10^{-7}$ H/m and $\epsilon_0 \approx \tfrac{10^{-9}}{36\pi}$ F/m.

      The paper prints this reference table on its second page:

      | Medium | Condition | $\beta$ | $\alpha$ |
      |---|---|---|---|
      | Perfect dielectric | $\sigma = 0$ | $\omega\sqrt{\mu\epsilon}$ | $0$ |
      | Imperfect dielectric | $\sigma/\omega\epsilon \ll 1$ | $\approx\omega\sqrt{\mu\epsilon}$ | $\tfrac{\sigma}{2}\sqrt{\mu/\epsilon}$ |
      | Good conductor | $\sigma/\omega\epsilon \gg 1$ | $\approx\sqrt{\pi f\mu\sigma}$ | $\approx\sqrt{\pi f\mu\sigma}$ |
      | Perfect conductor | $\sigma = \infty$ | $\infty$ | $\infty$ |

      | Medium | $\lvert\eta\rvert$ | $\tau$ |
      |---|---|---|
      | Perfect dielectric | $\sqrt{\mu/\epsilon}$ | $0$ |
      | Imperfect dielectric | $\approx\sqrt{\mu/\epsilon}$ | $\approx\tfrac{\sigma}{2\omega\epsilon}$ |
      | Good conductor | $\sqrt{\omega\mu/\sigma}$ | $45°$ |
      | Perfect conductor | $0$ | — |

      It also lists $\lambda = 2\pi/\beta$ and $\delta = 1/\alpha$ for each row. Here $\tau$ is the angle of $\eta$, and $\delta$ is the skin depth.
    `),
    P({ src: 'Fall 2025 #1(a) · 4 pts', title: 'λ and δ in a good conductor',
      q: md`When the frequency $f$ satisfies $\sigma \gg \omega\epsilon$, the wavelength is $\lambda \approx 2\pi\delta$, where $\delta$ is the skin depth. True or false? Explain.`,
      parts: [TF('λ ≈ 2πδ when σ ≫ ωε', true, md`In a good conductor $\alpha \approx \beta$. Then $\lambda = 2\pi/\beta = 2\pi/\alpha = 2\pi\delta$: the statement is exactly the good-conductor result.`)],
      hints: [md`Which regime is $\sigma \gg \omega\epsilon$? In that regime, compare $\alpha$ and $\beta$.`],
      sol: md`
        **Step 1: name the regime.** $\sigma \gg \omega\epsilon$ says the conduction current $\sigma\mathbf E$ is much larger than the displacement current $j\omega\epsilon\mathbf E$. That is the definition of a **good conductor**.

        **Step 2: γ in that regime.** In any medium, phasor Maxwell gives
        $$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$$
        Drop the small $j\omega\epsilon$:
        $$\gamma^2 \approx j\omega\mu\sigma$$
        Take the square root, with $\sqrt j = e^{j45°} = \tfrac{1 + j}{\sqrt2}$:
        $$\gamma \approx \sqrt{\frac{\omega\mu\sigma}{2}}\,(1 + j)$$
        So the real and imaginary parts are equal:
        $$\alpha \approx \beta \approx \sqrt{\pi f\mu\sigma}$$
        **Step 3: compare λ and δ.** The wavelength is $\lambda = 2\pi/\beta$, and the skin depth is $\delta = 1/\alpha$. With $\beta = \alpha$:
        $$\lambda = \frac{2\pi}{\beta} = \frac{2\pi}{\alpha} = 2\pi\delta$$
        $$\boxed{\text{True}}$$

        !!intuition Does this make sense?
          In one wavelength the amplitude falls by $e^{-\alpha\lambda} = e^{-2\pi} \approx 0.002$. A good conductor kills a wave within about one wavelength. That is why metals are opaque, and why the wave inside a conductor hardly "looks" like a wave at all.

        **Speed path.** Good conductor means $\alpha = \beta$, so $\lambda = 2\pi/\beta = 2\pi/\alpha = 2\pi\delta$. True. One line of explanation earns the points.

        **Where points go.** Answering without the reason ($\alpha = \beta$); confusing $\delta$ with $\lambda$ (the wave does not die in one $\delta$, it falls to $1/e$).

        ${LEARN('[Topic 7: imperfect dielectric, good conductor, skin depth](#/l/w2-limits)')}
      ` }),
    P({ src: 'Fall 2025 #1(b) · 4 pts', title: 'Dry earth at 10 GHz',
      q: md`If the frequency is $f = 10$ GHz, what kind of material is the dry earth? Explain.`,
      parts: [
        NT(md`$\sigma/\omega\epsilon$ at 10 GHz`, 1.8e-3, '', [[1.8e-3 * 2 * PI, 'That divides by f instead of ω = 2πf.'], [1 / 1.8e-3, 'That is ωε/σ, upside down.']]),
        mc('The dry earth at 10 GHz is', ['A. a perfect dielectric', 'B. an imperfect dielectric', 'C. a good conductor', 'D. a perfect conductor'], 1,
          [md`A perfect dielectric has $\sigma = 0$ exactly. Here $\sigma = 10^{-3}$ S/m is small compared with $\omega\epsilon$, but not zero: the wave still decays slowly.`, null,
            md`That needs $\sigma/\omega\epsilon \gg 1$. Here the ratio is $1.8\times10^{-3}$, far below 1.`, md`A perfect conductor needs $\sigma = \infty$.`], true),
      ],
      hints: [md`Compute $\omega\epsilon$ in S/m and compare it with $\sigma$. The $\pi$ in $\omega = 2\pi f$ cancels the $\pi$ in $\epsilon_0$.`],
      sol: md`
        **Step 1: the test.** Which regime a medium is in depends on one number, the ratio of conduction current to displacement current:
        $$\frac{|\sigma\mathbf E|}{|j\omega\epsilon\mathbf E|} = \frac{\sigma}{\omega\epsilon}$$
        **Step 2: ωε at 10 GHz.** Write it out; the $\pi$ cancels:
        $$\omega\epsilon_0 = 2\pi(10^{10})\cdot\frac{10^{-9}}{36\pi}$$
        $$\omega\epsilon_0 = \frac{2\times10}{36} = \frac59\ \text{S/m}$$
        **Step 3: the ratio.**
        $$\frac{\sigma}{\omega\epsilon} = \frac{10^{-3}}{5/9} = 1.8\times10^{-3}$$
        That is much less than 1, but $\sigma \ne 0$:
        $$\boxed{\text{B. imperfect dielectric}}$$

        !!intuition Does this make sense?
          The displacement current grows with $f$, the conduction current does not. At high frequency even a lossy material behaves like a dielectric with a little loss. Keep this picture for part (d), where the frequency drops by a factor $10^8$.

        **Speed path.** Memorize $\omega\epsilon_0 = f/(18\times10^9)$ S/m: at 10 GHz that is $10/18 = 5/9$. Then $\sigma/\omega\epsilon \approx 2\times10^{-3}$. Imperfect dielectric.

        **Where points go.** Using $f$ for $\omega$; choosing "perfect dielectric" (only for $\sigma = 0$); no explanation (the paper asks for one: quote the ratio).

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),
    P({ src: 'Fall 2025 #1(c) · 6 pts', title: 'γ at 10 GHz',
      q: md`If the frequency is $f = 10$ GHz, determine the propagation constant $\gamma = \alpha + j\beta$.`,
      parts: [
        NT('\\alpha', 0.06 * PI, 'Np/m', [[0.12 * PI, 'That drops the 1/2 in α = (σ/2)√(μ/ε).'], [2 * PI * Math.sqrt(10), 'That is √(πfμσ), the good-conductor formula. Part (b) found an imperfect dielectric.'], [0.5e-3, 'That forgot the factor √(μ/ε) = η₀ = 120π Ω.']]),
        NT('\\beta', 200 * PI / 3, 'rad/m', [[1e10 / 3e8, 'That uses f instead of ω = 2πf.'], [2 * PI * Math.sqrt(10), 'That is the good-conductor β. In an imperfect dielectric β ≈ ω√(με).']]),
      ],
      hints: [md`In an imperfect dielectric, $\beta \approx \omega\sqrt{\mu\epsilon}$ and $\alpha \approx \tfrac{\sigma}{2}\sqrt{\mu/\epsilon} = \tfrac{\sigma}{2}\eta$.`, md`Here $\mu = \mu_0$ and $\epsilon = \epsilon_0$, so $\sqrt{\mu/\epsilon} = \eta_0 = 120\pi\ \Omega$ and $\omega\sqrt{\mu\epsilon} = \omega/c$.`],
      sol: md`
        **Step 1: start from the exact γ.**
        $$\gamma = \sqrt{j\omega\mu(\sigma + j\omega\epsilon)}$$
        Pull $j\omega\epsilon$ out of the bracket:
        $$\gamma = \sqrt{j\omega\mu\cdot j\omega\epsilon\left(1 - j\frac{\sigma}{\omega\epsilon}\right)}$$
        The first factor is $(j\omega\sqrt{\mu\epsilon})^2$:
        $$\gamma = j\omega\sqrt{\mu\epsilon}\,\sqrt{1 - j\frac{\sigma}{\omega\epsilon}}$$
        **Step 2: the small-loss step.** For a small $x$, $\sqrt{1 - x} \approx 1 - \tfrac x2$. Here $x = j\sigma/\omega\epsilon = j\,1.8\times10^{-3}$:
        $$\gamma \approx j\omega\sqrt{\mu\epsilon}\left(1 - j\frac{\sigma}{2\omega\epsilon}\right)$$
        Multiply out; $j\cdot(-j) = 1$:
        $$\gamma \approx \frac{\sigma}{2}\sqrt{\frac{\mu}{\epsilon}} + j\omega\sqrt{\mu\epsilon}$$
        **Step 3: α.** With $\sqrt{\mu_0/\epsilon_0} = \eta_0 = 120\pi$:
        $$\alpha = \frac{10^{-3}}{2}(120\pi) = 0.06\pi$$
        $$\boxed{\alpha \approx 0.06\pi \approx 0.188\ \text{Np/m}}$$
        **Step 4: β.** With $\sqrt{\mu_0\epsilon_0} = 1/c$:
        $$\beta = \frac{\omega}{c} = \frac{2\pi(10^{10})}{3\times10^8}$$
        $$\boxed{\beta \approx \frac{200\pi}{3} \approx 209\ \text{rad/m}}$$
        So $\gamma \approx 0.06\pi + j\tfrac{200\pi}{3}\ \text{m}^{-1}$.

        !!intuition Does this make sense?
          - $\alpha/\beta = 0.06\pi/(66.7\pi) = 9\times10^{-4} = \tfrac12\cdot\tfrac{\sigma}{\omega\epsilon}$. In an imperfect dielectric the loss per radian is half the loss tangent. ✓
          - $\lambda = 2\pi/\beta = 3$ cm (free-space wavelength at 10 GHz), and the amplitude falls by $1/e$ only after $\delta = 1/\alpha \approx 5.3$ m: many wavelengths. A "slightly lossy" wave.
          - A full numerical $\sqrt{j\omega\mu(\sigma + j\omega\epsilon)}$ gives $0.18850 + j209.44$: the approximation is exact to 4 figures.

        **Speed path.** Imperfect dielectric with $\epsilon = \epsilon_0$: $\alpha = \tfrac{\sigma}{2}\eta_0 = 60\pi\sigma$ and $\beta = \omega/c$. Two lines.

        **Where points go.** Using the good-conductor formula out of habit; forgetting the $\tfrac12$ in $\alpha$; $\beta = f/c$; giving $\gamma$ without units ($\text{m}^{-1}$, or Np/m and rad/m).

        ${LEARN('[Topic 5: γ and η from Maxwell](#/l/w2-gamma), [Topic 7](#/l/w2-limits)')}
      ` }),
    P({ src: 'Fall 2025 #1(d) · 4 pts', title: 'Dry earth at 100 Hz',
      q: md`If the frequency is $f = 100$ Hz, what kind of material is the dry earth? Explain.`,
      parts: [
        NT(md`$\sigma/\omega\epsilon$ at 100 Hz`, 1.8e5, '', [[1.8e5 * 2 * PI, 'That divides by f instead of ω = 2πf.'], [10, 'Check the powers of ten: ωε₀ = 100/(18×10⁹) ≈ 5.6×10⁻⁹ S/m.']]),
        mc('The dry earth at 100 Hz is', ['A. a perfect dielectric', 'B. an imperfect dielectric', 'C. a good conductor', 'D. a perfect conductor'], 2,
          [md`The same material: $\sigma = 10^{-3}$ S/m is still there, and now it dominates.`, md`That was the answer at 10 GHz. The ratio grows as $1/f$: at 100 Hz it is $1.8\times10^5$.`, null, md`A perfect conductor needs $\sigma = \infty$; dry earth has $\sigma = 10^{-3}$ S/m, which is large only compared with $\omega\epsilon$.`], true),
      ],
      hints: [md`The ratio $\sigma/\omega\epsilon$ is proportional to $1/f$. You already know it at 10 GHz.`],
      sol: md`
        **Step 1: scale the ratio.** $\sigma$ and $\epsilon$ do not change with frequency, so $\sigma/\omega\epsilon \propto 1/f$. From 10 GHz to 100 Hz, $f$ drops by $10^{10}/10^2 = 10^8$:
        $$\frac{\sigma}{\omega\epsilon} = 1.8\times10^{-3}\times10^8$$
        $$\frac{\sigma}{\omega\epsilon} = 1.8\times10^{5} \gg 1$$
        **Step 2: check directly.** $\omega\epsilon_0 = 2\pi(100)\tfrac{10^{-9}}{36\pi} = \tfrac{200}{36}\times10^{-9} \approx 5.6\times10^{-9}$ S/m, and $10^{-3}/5.6\times10^{-9} = 1.8\times10^5$. ✓
        $$\boxed{\text{C. good conductor}}$$

        !!intuition Does this make sense?
          Part (a) now applies: at 100 Hz, $\alpha = \beta = \sqrt{\pi f\mu\sigma} = \sqrt{\pi\cdot100\cdot4\pi\times10^{-7}\cdot10^{-3}} = 2\pi\times10^{-4}$ m$^{-1}$, so $\delta = 1/\alpha \approx 1.6$ km. "Good conductor" is about the ratio, not about being a metal: the earth carries low-frequency (e.g. submarine) signals as a conductor would.

        **Speed path.** The ratio scales as $1/f$: $1.8\times10^{-3}\times10^8 = 1.8\times10^5$. Good conductor.

        **Where points go.** An arithmetic slip in the powers of ten (getting a ratio near 1 and then guessing); "perfect conductor" (that needs $\sigma = \infty$).

        ${LEARN('[Topic 7](#/l/w2-limits)')}
      ` }),

    // ---------------------------------------------------------------- Problem 2
    RF(md`
      ### Problem 2 (35 points): from sea water into air

      A TEM wave is propagating in sea water ($z < 0$, $\mu = \mu_0$, $\epsilon = 81\epsilon_0$) towards the surface into air ($z > 0$), as seen in the figure below. The incident electric field phasor in the sea water is
      $$\tilde{\mathbf E}_i = \hat y\,50\,e^{-j\beta z}\ \ \text{V/m}$$
      Find the following.

      [[fig:sea]]

      The paper gives no conductivity: treat the sea water as a lossless dielectric with $\epsilon = 81\epsilon_0$. (Real sea water conducts, about 4 S/m; that would make it a good conductor at radio frequencies, a different problem.)
    `, { sea: { svg: seaFig(), cap: 'The incident wave travels up (+z) toward the surface. Arrows show the direction of travel of each wave.' } }),
    P({ src: 'Fall 2025 #2(a) · 5 pts', title: 'The reflection coefficient',
      q: md`Find the reflection coefficient $\Gamma$ of the sea water to air interface.`,
      parts: [NT('\\Gamma', 0.8, '', [[-0.8, 'That is (η₁ − η₂)/(η₁ + η₂), upside down. The wave comes from the water (η₁ = η₀/9) and meets air (η₂ = η₀): Γ = (η₂ − η₁)/(η₂ + η₁) > 0.'], [1.8, 'That is τ = 1 + Γ, the transmission coefficient.']])],
      hints: [md`$\eta = \sqrt{\mu/\epsilon}$, so the water has $\eta_1 = \eta_0/\sqrt{81} = \eta_0/9$.`, md`$\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$, with medium 1 the one the wave comes from.`],
      sol: md`
        **Step 1: the two impedances.** The intrinsic impedance of a lossless medium is $\eta = \sqrt{\mu/\epsilon}$:
        $$\eta_1 = \sqrt{\frac{\mu_0}{81\epsilon_0}} = \frac{\eta_0}{9} = \frac{40\pi}{3}\ \Omega$$
        Air is free space: $\eta_2 = \eta_0 = 120\pi\ \Omega$.

        **Step 2: where Γ comes from.** At $z = 0$ the tangential $\mathbf E$ and $\mathbf H$ are continuous. With $E_0$ the incident amplitude, $\Gamma E_0$ the reflected one and $\tau E_0$ the transmitted one:
        $$1 + \Gamma = \tau \qquad \text{(tangential E)}$$
        $$\frac{1 - \Gamma}{\eta_1} = \frac{\tau}{\eta_2} \qquad \text{(tangential H)}$$
        The minus sign in the second line comes from the reflected wave traveling the other way, which flips its $\mathbf H$. Eliminate $\tau$:
        $$\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$$
        **Step 3: put in the numbers.** Divide top and bottom by $\eta_0/9$:
        $$\Gamma = \frac{9 - 1}{9 + 1}$$
        $$\boxed{\Gamma = \frac45 = 0.8}$$
        No units: it is a ratio of fields.

        !!intuition Does this make sense?
          - Going from a low-impedance medium into a high-impedance one, $\Gamma > 0$: the reflected $\mathbf E$ has the same sign as the incident one at the surface, like a voltage wave hitting a larger resistor.
          - $|\Gamma|$ is large because the impedances differ by 9×. Water and air are a strong mismatch; that is why you see the sky reflected off a lake.

        **Speed path.** $\eta \propto 1/\sqrt{\epsilon_r}$, so $\eta_2/\eta_1 = 9$ and $\Gamma = (9 - 1)/(9 + 1) = 4/5$.

        **Where points go.** Swapping the media (gives $-0.8$); using $\epsilon_r = 81$ instead of $\sqrt{81} = 9$ (gives $80/82$); adding units.

        ${LEARN('[Topic 11: reflection and transmission](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Fall 2025 #2(b) · 5 pts', title: 'The transmitted E',
      q: md`Find the transmitted electric field phasor $\tilde{\mathbf E}_t(z)$, with units and direction. Here $\beta$ is the phase constant in the sea water, as in $\tilde{\mathbf E}_i$.`,
      parts: [
        NT(md`amplitude of $\tilde{\mathbf E}_t$`, 90, 'V/m', [[40, 'That is ΓE₀, the reflected amplitude.'], [10, 'That uses τ = 1 − Γ. The transmission coefficient is τ = 1 + Γ (continuity of tangential E).'], [50, 'The field is not continuous in amplitude across the interface unless Γ = 0: here E_t = (1 + Γ)E₀.']]),
        mc(md`the phase factor of $\tilde{\mathbf E}_t$ in the air`, [md`$e^{-j\beta z/9}$`, md`$e^{-j9\beta z}$`, md`$e^{-j\beta z}$`, md`$e^{+j\beta z/9}$`], 0,
          [null, md`That makes the wave slower in air than in water. In air $\beta_2 = \omega/c$, and in water $\beta = 9\omega/c$: the air value is smaller.`, md`$\beta$ is the water's phase constant. The air has its own, $\beta_2 = \omega\sqrt{\mu_0\epsilon_0} = \beta/9$.`, md`$e^{+j\ldots z}$ travels toward $-z$. The transmitted wave goes up, away from the surface.`]),
        mc(md`the direction of $\tilde{\mathbf E}_t$`, [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat x$`, md`$+\hat z$`], 0,
          [null, md`$\tau = 1 + \Gamma = 9/5$ is positive, so $\tilde{\mathbf E}_t$ points the same way as $\tilde{\mathbf E}_i$.`, md`Normal incidence keeps the polarization: $\mathbf E$ stays along $\hat y$. $\mathbf H$ is the one along $\hat x$.`, md`A TEM wave traveling along $z$ has no $z$ component.`]),
      ],
      hints: [md`$\tau = 1 + \Gamma$. The frequency is the same on both sides, so $\beta_2 = \omega/c$, while $\beta = \omega\sqrt{81}/c$.`],
      sol: md`
        **Step 1: the transmission coefficient.** Tangential $\mathbf E$ is continuous at $z = 0$: incident plus reflected equals transmitted, $E_0 + \Gamma E_0 = \tau E_0$:
        $$\tau = 1 + \Gamma = 1 + \frac45 = \frac95$$
        **Step 2: the amplitude.**
        $$\tau E_0 = \frac95\cdot50 = 90\ \text{V/m}$$
        **Step 3: the phase constant in air.** The frequency does not change across the interface. In water the paper's $\beta$ is
        $$\beta = \omega\sqrt{\mu_0\cdot81\epsilon_0} = \frac{9\omega}{c}$$
        In air:
        $$\beta_2 = \frac{\omega}{c} = \frac{\beta}{9}$$
        **Step 4: assemble.** The wave travels toward $+z$, so its phase is $e^{-j\beta_2 z}$, and $\tau > 0$ keeps the direction $+\hat y$:
        $$\boxed{\tilde{\mathbf E}_t(z) = \hat y\,90\,e^{-j\beta z/9}\ \text{V/m},\quad z > 0}$$

        !!intuition Does this make sense?
          - **The transmitted field is bigger than the incident one** (90 > 50 V/m). That is not a violation of energy: power density is $|E|^2/2\eta$, and air's $\eta$ is 9 times larger. Part (e) shows that the transmitted power is less than the incident power, as it must be.
          - The wavelength in air is 9 times longer than in water: light (and radio) slows down by $\sqrt{\epsilon_r} = 9$ in water.

        **Speed path.** $\tau = 1 + \Gamma = 9/5$, amplitude 90, same direction, and $\beta \to \beta/9$ in air.

        **Where points go.** $\tau = 1 - \Gamma$; keeping the water's $\beta$ in the air; writing $e^{+j\ldots}$; no direction or no units.

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Fall 2025 #2(c) · 5 pts', title: 'The reflected H',
      q: md`Find the reflected magnetic field phasor $\tilde{\mathbf H}_r(z)$, with units and direction.`,
      parts: [
        NT(md`amplitude of $\tilde{\mathbf H}_r$`, 3 / PI, 'A/m', [[1 / (3 * PI), 'That divides by η₀. The reflected wave lives in the water: divide by η₁ = η₀/9 = 40π/3 Ω.'], [40, 'That is the reflected E amplitude, ΓE₀ = 40 V/m. Divide by η₁ to get H.'], [15 / (4 * PI), 'That is the incident H, 50/η₁. The reflected one is Γ times smaller.']]),
        mc(md`the direction of $\tilde{\mathbf H}_r$`, [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat y$`, md`$-\hat z$`], 0,
          [null, md`That is the direction of the **incident** $\tilde{\mathbf H}$. The reflected wave travels toward $-z$: $\tilde{\mathbf H}_r = \frac{1}{\eta_1}(-\hat z)\times\tilde{\mathbf E}_r$, and $(-\hat z)\times\hat y = +\hat x$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ ($\hat y$) and to the travel ($\hat z$): it is along $\pm\hat x$.`, md`$-\hat z$ is the direction of travel of the reflected wave, not of its field.`]),
        mc(md`the phase factor of $\tilde{\mathbf H}_r$`, [md`$e^{+j\beta z}$`, md`$e^{-j\beta z}$`, md`$e^{+j\beta z/9}$`, md`$e^{-j\beta z/9}$`], 0,
          [null, md`$e^{-j\beta z}$ travels toward $+z$. The reflected wave goes back down, toward $-z$.`, md`The reflected wave stays in the water, so it keeps the water's $\beta$.`, md`That is the air's phase constant, and the wrong direction.`]),
      ],
      hints: [md`$\tilde{\mathbf E}_r = \hat y\,\Gamma\cdot50\,e^{+j\beta z}$. For any plane wave, $\tilde{\mathbf H} = \frac{1}{\eta}\hat v\times\tilde{\mathbf E}$, with $\hat v$ the direction of travel.`],
      sol: md`
        **Step 1: the reflected E.** It has amplitude $\Gamma E_0$, the same direction rule ($\Gamma > 0$ keeps $+\hat y$), and travels toward $-z$ in the water:
        $$\tilde{\mathbf E}_r = \hat y\,\frac45(50)\,e^{+j\beta z} = \hat y\,40\,e^{+j\beta z}\ \text{V/m}$$
        **Step 2: the rule for H.** In a plane wave, $\mathbf E$, $\mathbf H$ and the direction of travel $\hat v$ form a right-handed set:
        $$\tilde{\mathbf H} = \frac{1}{\eta}\,\hat v\times\tilde{\mathbf E}$$
        Here $\hat v = -\hat z$, and $\eta = \eta_1$ because the wave is in the water.

        **Step 3: the cross product.** $\hat z\times\hat y = -\hat x$, so
        $$(-\hat z)\times\hat y = +\hat x$$
        **Step 4: the size.** $\eta_1 = 40\pi/3\ \Omega$:
        $$\frac{40}{\eta_1} = \frac{40\cdot3}{40\pi} = \frac3\pi\ \text{A/m}$$
        $$\boxed{\tilde{\mathbf H}_r(z) = \hat x\,\frac{3}{\pi}\,e^{+j\beta z}\ \text{A/m}}$$
        That is about $0.955\,\hat x$ A/m.

        **Step 5: check with the boundary.** The incident $\tilde{\mathbf H}_i = \frac{1}{\eta_1}\hat z\times\hat y\,50 = -\hat x\,\frac{15}{4\pi}$, and the transmitted $\tilde{\mathbf H}_t = \frac{1}{\eta_0}\hat z\times\hat y\,90 = -\hat x\,\frac{3}{4\pi}$. Tangential $\mathbf H$ must be continuous at $z = 0$:
        $$-\frac{15}{4\pi} + \frac{12}{4\pi} = -\frac{3}{4\pi}\ \checkmark$$

        !!intuition Does this make sense?
          A reflection with $\Gamma > 0$ keeps $\mathbf E$ and flips $\mathbf H$ (the current-wave reflection coefficient is $-\Gamma$), exactly as on a transmission line where $I^- = -V^-/Z_0$. So $\tilde{\mathbf H}_r$ points opposite to $\tilde{\mathbf H}_i$: $+\hat x$ against $-\hat x$.

        **Speed path.** Size $= \Gamma E_0/\eta_1 = 40/(40\pi/3) = 3/\pi$. Direction: $\Gamma > 0$, so $\mathbf H$ flips relative to the incident $-\hat x$: $+\hat x$. Phase $e^{+j\beta z}$.

        **Where points go.** Dividing by $\eta_0$ instead of $\eta_1$; the sign of $\hat x$ (the most common loss here); $e^{-j\beta z}$ for a wave going down; no units.

        ${LEARN('[Topic 11](#/l/w4-gamma)')}
      ` }),
    P({ src: 'Fall 2025 #2(d) · 5 pts', title: 'Incident power',
      q: md`Find the time-average power density $\langle\mathbf S_i\rangle$ carried by the incident wave, with units and direction.`,
      parts: [
        NT(md`$|\langle\mathbf S_i\rangle|$`, 375 / (4 * PI), 'W/m²', [[2500 / (240 * PI), 'That divides by 2η₀. The incident wave is in the water: use η₁ = η₀/9.'], [2500 / (40 * PI / 3), 'That forgets the 1/2 of the time average.']]),
        mc(md`direction of $\langle\mathbf S_i\rangle$`, [md`$+\hat z$`, md`$-\hat z$`, md`$+\hat x$`, md`$+\hat y$`], 0,
          [null, md`The incident wave travels up toward the surface: $+\hat z$.`, md`Power flows along $\mathbf E\times\mathbf H = \hat y\times(-\hat x) = +\hat z$.`, md`$\hat y$ is the direction of $\mathbf E$, not of the power flow.`]),
      ],
      hints: [md`$\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\} = \dfrac{|E_0|^2}{2\eta}\hat v$ for one plane wave in a lossless medium.`],
      sol: md`
        **Step 1: the time average.** For phasors, $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. For one plane wave $\tilde{\mathbf H} = \frac1\eta\hat v\times\tilde{\mathbf E}$, and this simplifies to
        $$\langle\mathbf S\rangle = \frac{|E_0|^2}{2\eta}\,\hat v$$
        **Step 2: check the direction.** $\tilde{\mathbf E}_i\times\tilde{\mathbf H}_i^* \propto \hat y\times(-\hat x) = +\hat z$. ✓

        **Step 3: the numbers.** $|E_0|^2 = 2500$ and $2\eta_1 = 80\pi/3$:
        $$|\langle\mathbf S_i\rangle| = \frac{2500\cdot3}{80\pi} = \frac{375}{4\pi}$$
        $$\boxed{\langle\mathbf S_i\rangle = \frac{375}{4\pi}\,\hat z \approx 29.8\,\hat z\ \text{W/m}^2}$$

        !!intuition Does this make sense?
          Compare with the same 50 V/m in air: $2500/240\pi \approx 3.3$ W/m². In water the same E carries 9 times more power, because $\eta$ is 9 times smaller (more H for the same E).

        **Speed path.** $|E|^2/2\eta_1 = 2500\cdot9/(240\pi) = 375/(4\pi)$, along $+\hat z$.

        **Where points go.** $\eta_0$ instead of $\eta_1$; no $\tfrac12$; "power" given in W instead of W/m²; no direction.

        ${LEARN('[Topic 4: time-averaged power](#/l/w1-avg)')}
      ` }),
    P({ src: 'Fall 2025 #2(e) · 5 pts', title: 'Transmitted power',
      q: md`Find the time-average power density $\langle\mathbf S_t\rangle$ carried by the transmitted wave, with units and direction.`,
      parts: [
        NT(md`$|\langle\mathbf S_t\rangle|$`, 135 / (4 * PI), 'W/m²', [[8100 / (80 * PI / 3), 'That divides by 2η₁. The transmitted wave is in air: η₀ = 120π Ω.'], [375 / (4 * PI) * 81 / 25, 'That is τ² times the incident power. It forgets that η changes: S_t/S_i = τ²η₁/η₂ = 9/25.'], [8100 / (120 * PI), 'That forgets the 1/2.']]),
      ],
      hints: [md`$\langle S_t\rangle = \dfrac{|\tau E_0|^2}{2\eta_0}$, along $+\hat z$.`],
      sol: md`
        **Step 1: the formula.** The transmitted wave is a single plane wave in air, amplitude 90 V/m:
        $$|\langle\mathbf S_t\rangle| = \frac{90^2}{2\eta_0} = \frac{8100}{240\pi}$$
        **Step 2: simplify.** $8100/240 = 135/4$:
        $$\boxed{\langle\mathbf S_t\rangle = \frac{135}{4\pi}\,\hat z \approx 10.7\,\hat z\ \text{W/m}^2}$$
        (The same number is $33.75/\pi$ or $405/(12\pi)$.)

        !!intuition Does this make sense?
          The ratio to the incident power is
          $$\frac{135/4\pi}{375/4\pi} = \frac{9}{25}$$
          That is $1 - \Gamma^2 = 1 - \tfrac{16}{25}$. ✓ The bigger field (90 V/m) carries less power, because air's $\eta$ is 9 times larger.

        **Speed path.** $S_t = (1 - \Gamma^2)S_i = \tfrac{9}{25}\cdot\tfrac{375}{4\pi} = \tfrac{135}{4\pi}$. Or directly $8100/240\pi$.

        **Where points go.** Dividing by $\eta_1$ (gives a transmitted power bigger than the incident one: a red flag); $\tau^2 S_i$ without the impedance ratio; no direction.

        ${LEARN('[Topic 11](#/l/w4-gamma), [Topic 4](#/l/w1-avg)')}
      ` }),
    P({ src: 'Fall 2025 #2(f) · 10 pts', title: 'Energy balance and reflected power',
      q: md`Write the equation of conservation of energy at the sea water to air interface. Use it to find the time-average reflected power density $\langle\mathbf S_r\rangle$, with units and direction.`,
      parts: [
        mc('Conservation of energy at the interface (magnitudes)', [md`$|\langle\mathbf S_i\rangle| = |\langle\mathbf S_r\rangle| + |\langle\mathbf S_t\rangle|$`, md`$|\langle\mathbf S_i\rangle| + |\langle\mathbf S_r\rangle| = |\langle\mathbf S_t\rangle|$`, md`$|\langle\mathbf S_i\rangle| = |\langle\mathbf S_t\rangle|$`, md`$|\langle\mathbf S_t\rangle| = \tau^2|\langle\mathbf S_i\rangle|$`], 0,
          [null, md`That treats the reflected power as flowing into the surface. It flows away, toward $-z$: what arrives ($S_i$) splits into what goes back ($S_r$) and what goes through ($S_t$).`, md`That ignores the reflection. With $\Gamma = 0.8$ most of the power goes back.`, md`That is not an energy balance, and it is false: $\tau^2 = 81/25$ ignores that $\eta$ differs on the two sides.`]),
        NT(md`$|\langle\mathbf S_r\rangle|$`, 60 / PI, 'W/m²', [[375 / (4 * PI) * 0.8, 'That is Γ times the incident power. Power goes as the field squared: Γ² = 16/25.'], [(375 + 135) / (4 * PI), 'That adds S_i and S_t. The reflected power is the difference.']]),
        mc(md`direction of $\langle\mathbf S_r\rangle$`, [md`$-\hat z$`, md`$+\hat z$`, md`$+\hat x$`, md`$-\hat y$`], 0,
          [null, md`The reflected wave travels back down into the water: $-\hat z$.`, md`Power flows along $\mathbf E\times\mathbf H = \hat y\times\hat x = -\hat z$.`, md`$\mathbf E_r\times\mathbf H_r = \hat y\times\hat x = -\hat z$; no $y$ component.`]),
      ],
      hints: [md`No power is stored or lost in a zero-thickness surface: the net power flowing into it from below equals the power flowing out above.`, md`Below the surface the net flow is $\langle\mathbf S_i\rangle + \langle\mathbf S_r\rangle$ (vectors); above it is $\langle\mathbf S_t\rangle$.`],
      sol: md`
        **Step 1: the balance.** Take a thin pillbox around a patch of the surface. It has no volume, so it stores no energy and dissipates none. Poynting's theorem then says the power in equals the power out. The net (vector) flow just below is the sum of the two waves there, and just above there is only the transmitted wave:
        $$\langle\mathbf S_i\rangle + \langle\mathbf S_r\rangle = \langle\mathbf S_t\rangle$$
        Since $\langle\mathbf S_r\rangle$ points along $-\hat z$, in magnitudes:
        $$|\langle\mathbf S_i\rangle| = |\langle\mathbf S_r\rangle| + |\langle\mathbf S_t\rangle|$$
        (Cross terms between the incident and reflected waves average to zero in a lossless medium, so the two powers add as shown.)

        **Step 2: solve.**
        $$|\langle\mathbf S_r\rangle| = \frac{375}{4\pi} - \frac{135}{4\pi} = \frac{240}{4\pi}$$
        $$\boxed{\langle\mathbf S_r\rangle = -\frac{60}{\pi}\,\hat z \approx -19.1\,\hat z\ \text{W/m}^2}$$
        **Step 3: check with Γ².** The reflected wave is in the same medium as the incident one, so the power ratio is just $\Gamma^2$:
        $$\Gamma^2\cdot\frac{375}{4\pi} = \frac{16}{25}\cdot\frac{375}{4\pi} = \frac{60}{\pi}\ \checkmark$$

        !!intuition Does this make sense?
          64% of the power reflects and 36% gets through. A 9:1 impedance mismatch is a big one; the field is larger in the air, but the power is not.

        **Speed path.** Write $\langle\mathbf S_i\rangle + \langle\mathbf S_r\rangle = \langle\mathbf S_t\rangle$, then $|S_r| = S_i - S_t = 240/4\pi = 60/\pi$ along $-\hat z$. Check: $\Gamma^2 S_i$.

        **Where points go.** This part is worth 10 points, and most of them are the equation and the direction. Writing $S_r = \Gamma S_i$; signs that make the reflected power flow into the surface; forgetting the direction $-\hat z$.

        ${LEARN('[Topic 3: Poynting theorem](#/l/w1-poynting), [Topic 11](#/l/w4-gamma)')}
      ` }),

    // ---------------------------------------------------------------- Problem 3
    RF(md`
      ### Problem 3 (29 points): two lines and a delta source

      Consider a system of two transmission lines. It is fed by a voltage source $f(t) = 100\,\delta(t)$ V, connected through a $25\ \Omega$ resistor and a switch that is closed at $t = 0$. The lines have characteristic impedances $Z_1 = 25\ \Omega$ and $Z_2 = 37.5\ \Omega$; line 1 is closest to the source and line 2 is farthest. Line 2 is terminated in a $75\ \Omega$ resistor. Each line has a length such that a wave takes 1 µs to travel it.

      [[fig:tl]]

      **About $\delta(t)$.** The source is one very short spike. Every wave on the lines is then a spike too, and the number in front of each $\delta$ (its strength) behaves exactly like a voltage in a step bounce diagram: it is multiplied by the same $\tau_g$, $\Gamma$ and $\tau$ at each end and junction. Following the paper, strengths are written in volts.
    `, { tl: { svg: twoLineFig(), cap: 'Line 1 runs from z = 0 to l, line 2 from l to 2l. One-way delay 1 µs on each.' } }),
    P({ src: 'Fall 2025 #3(a) · 14 pts', title: 'The bounce diagram to 6 µs',
      q: md`Create a voltage bounce diagram for this system out to 6 µs. Label every arrow with its amplitude and direction, and mark units on the axes. Here, enter the coefficients and the strengths you would write on the arrows.`,
      parts: [
        NT(md`$\tau_g$ (the injection coefficient)`, 0.5, ''),
        NT(md`$\Gamma_{12}$ (a wave on line 1 meeting the junction)`, 0.2, '', [[-0.2, 'That is Γ₂₁, the coefficient for a wave coming from line 2. From line 1 the wave sees Z₂ = 37.5 Ω > Z₁: Γ₁₂ = (37.5 − 25)/(37.5 + 25) > 0.']]),
        NT(md`$\Gamma_{21}$ (a wave on line 2 meeting the junction)`, -0.2, '', [[0.2, 'From line 2 the wave sees Z₁ = 25 Ω < Z₂: the sign flips, Γ₂₁ = −Γ₁₂.']]),
        NT(md`$\Gamma_L$`, 1 / 3, '', [[0.5, 'That uses Z₁ = 25 Ω. The load terminates line 2: Γ_L = (75 − 37.5)/(75 + 37.5).']]),
        NT('strength launched at t = 0', 50, 'V', [[100, 'That forgets the divider: only τ_g = Z₁/(R_g + Z₁) = 1/2 of the source goes onto the line.']]),
        NT('strength sent into line 2 at t = 1 µs', 60, 'V', [[50, 'The junction does not pass the wave unchanged: τ₁₂ = 1 + Γ₁₂ = 6/5.'], [40, 'That uses τ = 1 − Γ. The transmission coefficient is 1 + Γ₁₂ = 6/5.']]),
        NT('strength reflected back into line 1 at t = 1 µs', 10, 'V'),
        NT('strength reflected by the load at t = 2 µs', 20, 'V', [[50 / 3, 'That reflects the launched 50 V. The load sees the 60 V that crossed the junction.']]),
        NT('strength sent back into line 1 at t = 3 µs', 16, 'V', [[24, 'Going from line 2 to line 1 use τ₂₁ = 1 + Γ₂₁ = 4/5, not 6/5.']]),
        NT('strength re-reflected toward the load at t = 3 µs', -4, 'V', [[4, 'Γ₂₁ = −1/5 is negative: −(1/5)(20) = −4 V.']]),
        NT('strength sent into line 1 at t = 5 µs', -16 / 15, 'V'),
        mc('What happens to each wave that returns to the generator?', [md`It is fully absorbed ($\Gamma_g = 0$)`, md`It reflects with $\Gamma_g = \tfrac12$`, md`It reflects with $\Gamma_g = -\tfrac12$`, md`It reflects with $\Gamma_g = -1$`], 0,
          [null, md`$\Gamma_g = \frac{R_g - Z_1}{R_g + Z_1} = \frac{25 - 25}{50} = 0$. $\tfrac12$ is $\tau_g$.`, md`$R_g = Z_1$, so $\Gamma_g = 0$.`, md`$\Gamma_g = -1$ is a short. Here $R_g = Z_1 = 25\ \Omega$: matched.`]),
      ],
      hints: [md`Four coefficients: $\tau_g = \frac{Z_1}{R_g + Z_1}$, $\Gamma_g = \frac{R_g - Z_1}{R_g + Z_1}$, $\Gamma_{12} = \frac{Z_2 - Z_1}{Z_2 + Z_1}$ (and $\Gamma_{21} = -\Gamma_{12}$), $\Gamma_L = \frac{R_L - Z_2}{R_L + Z_2}$. Transmission: $\tau = 1 + \Gamma$ for the side the wave comes from.`, md`A wave arrives at the junction at $t = 1, 3, 5$ µs (from either side) and at the load at $t = 2, 4, 6$ µs. Track every wave.`],
      sol: md`
        **Step 1: the coefficients, from KVL and KCL.** A wave meeting a resistance $R$ at the end of a line of impedance $Z_0$ must satisfy $V = RI$ there; that gives $\Gamma = \frac{R - Z_0}{R + Z_0}$. At a junction the second line acts, for the first wave, like a resistor $Z_2$. The four numbers:
        $$\tau_g = \frac{Z_1}{R_g + Z_1} = \frac{25}{50} = \frac12$$
        $$\Gamma_g = \frac{R_g - Z_1}{R_g + Z_1} = 0$$
        $$\Gamma_{12} = \frac{37.5 - 25}{37.5 + 25} = \frac{12.5}{62.5} = \frac15$$
        From the other side the impedances swap, so $\Gamma_{21} = -\tfrac15$. The voltage is continuous at the junction, so the transmitted wave is $1 + \Gamma$ times the arriving one:
        $$\tau_{12} = \frac65,\qquad \tau_{21} = \frac45$$
        $$\Gamma_L = \frac{75 - 37.5}{75 + 37.5} = \frac{37.5}{112.5} = \frac13$$
        Here $\tau_g$ is the injection coefficient (the generator's voltage divider) and $\tau_{12}$, $\tau_{21}$ are the junction's transmission coefficients $1 + \Gamma$.

        **Step 2: the launch.** At $t = 0$ the line looks like a resistor $Z_1$, so the divider sends
        $$\tau_g\cdot100 = 50\ \text{V}$$
        **Step 3: t = 1 µs, the junction.** The 50 V spike splits:
        - reflected into line 1: $\tfrac15\cdot50 = 10$ V, back toward the source;
        - transmitted into line 2: $\tfrac65\cdot50 = 60$ V, toward the load.

        **Step 4: t = 2 µs.** The 10 V reaches the generator and is absorbed ($\Gamma_g = 0$). The 60 V reaches the load:
        $$\Gamma_L\cdot60 = \tfrac13\cdot60 = 20\ \text{V, going back}$$
        **Step 5: t = 3 µs, the junction from the right.** The 20 V spike splits again, now with the line-2-side coefficients:
        - re-reflected toward the load: $-\tfrac15\cdot20 = -4$ V;
        - transmitted into line 1: $\tfrac45\cdot20 = 16$ V, toward the source.

        **Step 6: t = 4 µs.** The 16 V is absorbed at the generator. The $-4$ V reaches the load: $\tfrac13(-4) = -\tfrac43$ V goes back.

        **Step 7: t = 5 µs.** The $-\tfrac43$ V splits at the junction:
        - into line 1: $\tfrac45\left(-\tfrac43\right) = -\tfrac{16}{15} \approx -1.07$ V;
        - back toward the load: $-\tfrac15\left(-\tfrac43\right) = +\tfrac{4}{15}$ V, which reaches the load at 6 µs.

        [[fig:bd]]

        !!intuition Does this make sense?
          - Since $\Gamma_g = 0$, the generator end is "quiet": every wave that returns to it is absorbed. All the remaining action is the echo between the junction and the load, losing a factor $\Gamma_L\Gamma_{21} = -\tfrac1{15}$ per round trip.
          - The junction passes **more** than arrives ($\tau_{12} = 1.2$) because the voltage must be continuous: $50 + 10 = 60$. Voltage can grow; power cannot.

        **Speed path.** Write the four coefficients in a box first ($\tfrac12$, 0, $\pm\tfrac15$ with $\tau = \tfrac65, \tfrac45$, $\tfrac13$). Then walk the times 1, 2, 3, ...: each arrival is one multiplication. Label both the reflected and the transmitted arrow at every junction hit.

        **Where points go.** Using one $\tau$ for both directions at the junction; forgetting the 10 V reflection at 1 µs; $\Gamma_L$ with $Z_1$; drawing the generator reflection that does not exist; no time units on the axis (the paper asks for them).

        ${LEARN('[Topic 14: τ_g, Γ_L, Γ_g](#/l/w5-launch), [Topic 15: bounce diagrams](#/l/w5-bounce), [Topic 16: junctions](#/l/w5-multi)')}
      `,
      figs: { bd: { svg: TL.diagram(s3, { tMax: 6, w: 380, h: 340, probe: 0.5, zUnit: 'l' }), cap: 'Spike strengths in volts; position in units of $l$. Junction dashed at $z = l$; times in µs. The dashed probe line at l/2 (dots) is used in part (b).' } } }),
    P({ src: 'Fall 2025 #3(b) · 10 pts', title: 'The voltage at the midpoint of line 1',
      q: md`Sketch the voltage at the midpoint of the first transmission line from 0 to 6 µs. Label all coordinates and axes. Here, enter how many spikes you would draw and their strengths.`,
      parts: [
        mc('How many spikes reach the midpoint of line 1 between 0 and 6 µs?', ['2', '3', '4', '5'], 2,
          [md`You also need the two waves that come back from the junction side: 10 V at 1.5 µs and 16 V at 3.5 µs, and the $-\tfrac{16}{15}$ V at 5.5 µs.`, md`Count again: 0.5, 1.5, 3.5 and 5.5 µs.`, null, md`The generator absorbs everything ($\Gamma_g = 0$): no spike comes back from the left, so there is nothing at 2.5 or 4.5 µs.`], true),
        NT('strength at t = 0.5 µs', 50, 'V', [[100, 'The source is 100δ(t), but only τ_g = 1/2 of it is launched.']]),
        NT('strength at t = 1.5 µs', 10, 'V', [[60, 'That is the spike transmitted into line 2. Back on line 1 only the reflection Γ₁₂ · 50 = 10 V returns.']]),
        NT('strength at t = 3.5 µs', 16, 'V', [[20, 'That is the load reflection before it crosses the junction. Crossing back into line 1 multiplies by τ₂₁ = 4/5.']]),
        NT('strength at t = 5.5 µs', -16 / 15, 'V', [[-4 / 3, 'That is the spike on line 2 before it crosses the junction. Multiply by τ₂₁ = 4/5.']]),
      ],
      hints: [md`The midpoint is half a microsecond from both ends of line 1. Every wave on line 1 passes it once: forward waves 0.5 µs after leaving the source, backward waves 0.5 µs after leaving the junction.`],
      sol: md`
        **Step 1: which waves pass $z = l/2$.** Read them off the bounce diagram, along the dashed probe line. A forward wave on line 1 passes the midpoint 0.5 µs after leaving $z = 0$; a backward wave passes 0.5 µs after leaving the junction.
        - The launched 50 V: leaves $z = 0$ at $t = 0$, passes at **0.5 µs**.
        - The 10 V junction reflection: leaves the junction at 1 µs, passes at **1.5 µs**, absorbed at 2 µs.
        - The 16 V transmitted back at 3 µs: passes at **3.5 µs**.
        - The $-\tfrac{16}{15}$ V transmitted back at 5 µs: passes at **5.5 µs**.

        Because $\Gamma_g = 0$, no forward wave is ever re-launched, so there is nothing else on line 1.

        **Step 2: the answer.**
        $$V\!\left(\tfrac l2, t\right) = 50\,\delta(t - 0.5) + 10\,\delta(t - 1.5)$$
        $$\quad + 16\,\delta(t - 3.5) - \tfrac{16}{15}\,\delta(t - 5.5)$$
        with $t$ in µs: four spikes, the last one small and negative.

        [[fig:vt]]

        !!intuition Does this make sense?
          Between spikes the voltage is exactly zero: a delta source leaves nothing behind. The spikes are the step diagram's jumps: if the source were $100u(t)$, the voltage at $l/2$ would step up by 50, 10, 16 and $-\tfrac{16}{15}$ at the same times.

        **Speed path.** Draw the vertical probe line on your bounce diagram at $l/2$ and read every crossing: four spikes, at $0.5$, $1.5$, $3.5$, $5.5$ µs with strengths $50$, $10$, $16$, $-\tfrac{16}{15}$ V.

        **Where points go.** Missing the 10 V reflection; adding spikes at 2.5 or 4.5 µs from a generator reflection that does not exist; using the line-2 strengths (20 or $-\tfrac43$) without the junction's $\tau_{21}$; drawing steps instead of spikes; no units on the axes.

        ${LEARN('[Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi)')}
      `,
      figs: { vt: { svg: TL.plotT(s3, 0.5, { input: 'delta', tMax: 6, name: 'V(l/2,t)' }), cap: 'V at the midpoint of line 1: spike strengths in volts, times in µs.' } } }),
    P({ src: 'Fall 2025 #3(c) · 5 pts', title: 'The steady state',
      q: md`What is the steady-state voltage of this system at the center of the second transmission line?`,
      parts: [
        mc(md`$V_{ss}$ at the center of line 2`, ['0 V', '75 V', '50 V', '100 V', '60 V'], 0,
          [null, md`That is the DC steady state for a **step** source $100u(t)$: the lines vanish at DC and $R_L$ sits in a divider with $R_g$, $100\cdot\tfrac{75}{25 + 75} = 75$ V. This source is a single spike, $100\delta(t)$. Once the spikes have died away, nothing is left.`, md`50 V is the first spike's strength on line 1, not a steady state.`, md`100 is the source's strength, and it is not even a voltage that lasts: $\delta(t)$ is zero for every $t > 0$.`, md`60 V is the first spike's strength on line 2. It passes the center of line 2 once, at 1.5 µs, and is gone.`]),
      ],
      hints: [md`What does the source do for $t > 0$? Where does the energy of the spikes go?`],
      sol: md`
        **Step 1: what the source does.** $f(t) = 100\,\delta(t)$ is nonzero only at the instant $t = 0$. For every $t > 0$ the source is a 0 V source in series with $R_g$.

        **Step 2: where the spikes go.** Each spike loses energy at every bounce: the generator absorbs everything that reaches it ($\Gamma_g = 0$), and the load absorbs $1 - \Gamma_L^2 = \tfrac89$ of each spike's energy. On line 2 the spike strengths shrink by $\Gamma_L\Gamma_{21} = -\tfrac1{15}$ each round trip: $60, 20, -4, -\tfrac43, \tfrac4{15}, \ldots \to 0$.

        **Step 3: the steady state.** After the spikes die away, every voltage on the system is zero:
        $$\boxed{V_{ss} = 0\ \text{V}}$$
        **Compare: a step source.** If the source were a 100 V **step**, the steady state would be the DC circuit with the lines replaced by wires: $V = 100\cdot\frac{R_L}{R_g + R_L} = 100\cdot\frac{75}{100} = 75$ V everywhere. The impedances $Z_1$ and $Z_2$ do not appear at DC. Know both answers, and read the source carefully.

        !!intuition Does this make sense?
          The steady state of a step is the **sum** of all the spikes (the step diagram's jumps add up): $\sum = 75$ V for the step. A delta is the derivative of a step, so its steady state is the derivative of a constant: zero.

        **Speed path.** Delta source: steady state 0 V, always. Step source: DC divider $V_g R_L/(R_g + R_L)$.

        **Where points go.** Writing 75 V by reflex (the DC answer for a step source); using $Z_1$ or $Z_2$ in a DC divider; leaving out the unit.

        ${LEARN('[Topic 14: steady state](#/l/w5-launch)')}
      ` }),

    // ---------------------------------------------------------------- Problem 4
    Object.assign(RF(md`
      ### Problem 4 (18 points): periodic oscillations on a lossless line

      Answer the following short, **independent** questions about periodic oscillations on a lossless transmission-line circuit. In the diagram on the left, the circuit is driven by an AC voltage source with phasor $\tilde V_g$ and internal resistance $R_g = 50\ \Omega$, and the line is terminated by an arbitrary load $Z_L = R_L + jX_L$. The line has length $l$, characteristic impedance $Z_0 = 25\ \Omega$, and supports wave propagation at $v = c$. In the diagram on the right, the line and its load are represented by an equivalent impedance $Z_{eq} = R_{eq} + jX_{eq}$.

      [[fig:p4]]

      Distance $d$ is measured back from the load ($d = 0$) to the source end ($d = l$). The two formulas behind every part:
      $$\tilde V(d) = V^+\left(e^{j\beta d} + \Gamma_L e^{-j\beta d}\right)$$
      $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} - \Gamma_L e^{-j\beta d}\right)$$
    `, { p4: { svg: PF.row([{ svg: p4Line(), cap: 'The line circuit.' }, { svg: p4Eq(), cap: 'Its equivalent: $Z_{eq}$ is what the source sees.' }]).svg, cap: 'Left: the line circuit, $d$ measured from the load. Right: the same circuit with the line and load replaced by $Z_{eq}$.' } }), { later: true }),
    P({ later: true, src: 'Fall 2025 #4(a) · 3 pts', title: 'A 5λ/2 line',
      q: md`Let the line have electrical length $l = 5\lambda/2$. What is the voltage $\tilde V_{in} = \tilde V(l)$ across the input end of the line, in terms of $\tilde V_L$, the voltage across the load?`,
      parts: [mc(md`$\tilde V_{in}$`, [md`$-\tilde V_L$`, md`$\tilde V_L$`, md`$j\tilde V_L$`, md`$-j\tilde V_L$`, md`It depends on $Z_L$`], 0,
        [null, md`That holds for a whole number of wavelengths. A half wavelength gives $e^{\pm j\pi} = -1$, and $5\lambda/2$ is an odd number of half wavelengths.`, md`$\pm j$ appears at odd quarter wavelengths, where $e^{j\beta d} = \pm j$. At $5\lambda/2$, $\beta d = 5\pi$.`, md`$\pm j$ appears at odd quarter wavelengths. At $5\lambda/2$, $e^{\pm j5\pi} = -1$.`, md`At $\beta d = 5\pi$ both exponentials equal $-1$, so $\tilde V(l) = -V^+(1 + \Gamma_L) = -\tilde V_L$ for every load.`])],
      hints: [md`Put $d = 5\lambda/2$, so $\beta d = 5\pi$, into $\tilde V(d)$ and compare with $\tilde V(0) = V^+(1 + \Gamma_L)$.`],
      sol: md`
        **Step 1: the electrical length.** $\beta = 2\pi/\lambda$, so at $d = l = 5\lambda/2$:
        $$\beta l = \frac{2\pi}{\lambda}\cdot\frac{5\lambda}{2} = 5\pi$$
        **Step 2: the exponentials.** $e^{\pm j5\pi} = \cos5\pi \pm j\sin5\pi = -1$. Both terms flip sign together:
        $$\tilde V(l) = V^+\left(-1 - \Gamma_L\right) = -V^+(1 + \Gamma_L)$$
        **Step 3: compare with the load.** At $d = 0$, $\tilde V_L = \tilde V(0) = V^+(1 + \Gamma_L)$:
        $$\boxed{\tilde V_{in} = -\tilde V_L}$$
        true for **any** load.

        !!intuition Does this make sense?
          Along a line, the pattern of $\tilde V$ repeats every $\lambda/2$, but with a sign flip (each half wavelength is a phase of $\pi$ for both waves). After 5 half wavelengths: $(-1)^5 = -1$. Impedances repeat exactly: $Z_{eq} = Z_L$ for this line, since $\tilde I$ flips too.

        **Speed path.** Count half wavelengths: 5, odd, so $-\tilde V_L$.

        **Where points go.** Answering $\tilde V_L$ (true for impedance, not for voltage); answering "depends on $Z_L$"; adding units to a ratio-type answer is fine, but a wrong sign is not.

        ${LEARN('[Topic 17: V(d), Γ(d), Z(d)](#/l/w6-vd), [Topic 19: half-wave lines](#/l/w6-qw)')}
      ` }),
    P({ later: true, src: 'Fall 2025 #4(b) · 3 pts', title: 'A 3λ/4 line on 50 Ω',
      q: md`Let the line have electrical length $l = 3\lambda/4$ and be terminated by a purely resistive load $Z_L = 50\ \Omega$. What is the equivalent impedance $Z_{eq}$?`,
      parts: [NT('Z_{eq}', 12.5, 'Ω', [[50, 'That is the half-wave rule. 3λ/4 is an odd number of quarter waves: the impedance inverts, Z₀²/Z_L.'], [100, 'That is Z_L²/Z₀, upside down. The quarter-wave rule is Z₀²/Z_L = 625/50.'], [25, 'That is Z₀ itself, which you get only for a matched load.']])],
      hints: [md`$3\lambda/4 = \lambda/2 + \lambda/4$. The half wavelength changes nothing; the quarter wavelength inverts: $Z_{eq} = Z_0^2/Z_L$.`],
      sol: md`
        **Step 1: the general formula.** The input impedance of a line of length $l$ is
        $$Z_{eq} = Z_0\,\frac{Z_L + jZ_0\tan\beta l}{Z_0 + jZ_L\tan\beta l}$$
        **Step 2: the quarter-wave limit.** Here $\beta l = \tfrac{2\pi}{\lambda}\cdot\tfrac{3\lambda}{4} = \tfrac{3\pi}{2}$, where $\tan\beta l \to \infty$. Divide top and bottom by $\tan\beta l$ and let it grow:
        $$Z_{eq} \to Z_0\,\frac{jZ_0}{jZ_L} = \frac{Z_0^2}{Z_L}$$
        **Step 3: the numbers.**
        $$Z_{eq} = \frac{25^2}{50} = \frac{625}{50}$$
        $$\boxed{Z_{eq} = 12.5\ \Omega}$$

        !!intuition Does this make sense?
          A quarter-wave line is an impedance inverter: high in, low out. Since $Z_L = 2Z_0$, the input sees $Z_0/2$. Every odd multiple of $\lambda/4$ does the same, because the extra half waves change nothing.

        **Speed path.** $3\lambda/4$ = odd quarter wave: $Z_0^2/Z_L = 625/50 = 12.5\ \Omega$.

        **Where points go.** Treating $3\lambda/4$ like a half-wave line; inverting the wrong way ($Z_L^2/Z_0$); no units.

        ${LEARN('[Topic 19: half- and quarter-wave transformers](#/l/w6-qw)')}
      ` }),
    P({ later: true, src: 'Fall 2025 #4(c) · 3 pts', title: 'Frequency from length',
      q: md`Let the line have actual length $l = 1$ km, which corresponds to an electrical length $l = \lambda/3$. What is the angular frequency $\omega$ of the oscillating source?`,
      parts: [NT('\\omega', 2 * PI * 1e5, 'rad/s', [[1e5, 'That is f in hertz. The question asks for ω = 2πf.'], [2 * PI * 3e5, 'That uses λ = 1 km. Here 1 km is λ/3, so λ = 3 km.'], [2 * PI * 1e5 / 9, 'That uses λ = l/3. If l = λ/3 then λ = 3l = 3 km.']])],
      hints: [md`$\lambda = 3l = 3$ km. Then $f = v/\lambda$ with $v = c$, and $\omega = 2\pi f$.`],
      sol: md`
        **Step 1: the wavelength.** $l = \lambda/3$ means
        $$\lambda = 3l = 3000\ \text{m}$$
        **Step 2: the frequency.** The wave travels at $v = c$, and one wavelength passes per period:
        $$f = \frac{c}{\lambda} = \frac{3\times10^8}{3\times10^3} = 10^5\ \text{Hz}$$
        **Step 3: ω.**
        $$\boxed{\omega = 2\pi\times10^5 \approx 6.28\times10^5\ \text{rad/s}}$$

        !!intuition Does this make sense?
          100 kHz is a low radio frequency, where wavelengths are kilometers. A 1 km line is "electrically short" only at frequencies well below that.

        **Speed path.** $\lambda = 3$ km, $f = c/\lambda = 100$ kHz, $\omega = 2\pi\times10^5$ rad/s.

        **Where points go.** Giving $f$ instead of $\omega$; dividing instead of multiplying ($\lambda = l/3$); units Hz on $\omega$.

        ${LEARN('[Topic 18: periodic oscillations](#/l/w6-stubs)')}
      ` }),
    P({ later: true, src: 'Fall 2025 #4(d) · 3 pts', title: 'Shorted line with a voltage peak at l/2',
      q: md`The load $Z_L$ is replaced by a short. A maximum of the voltage oscillation along the line is observed at $d = l/2$. What is $Z_{eq}$?`,
      parts: [mc(md`$Z_{eq}$`, [md`$0\ \Omega$ (a short)`, md`$\infty$ (an open)`, md`$25\ \Omega$`, md`$j25\ \Omega$`, md`$-j25\ \Omega$`], 0,
        [null, md`That is a shorted quarter-wave line. The peak at $d = l/2$ makes the line a half wavelength (or $\lambda/2 + n\lambda$), which repeats the short.`, md`A purely reactive (lossless, shorted) line can never present a real $Z_0$; that needs a matched load.`, md`$jZ_0\tan\beta l$ equals $j25$ only for $\beta l = \pi/4$ (an eighth of a wavelength). The peak position says $\beta l = \pi$.`, md`That is $\beta l = 3\pi/4$. The peak position says $\beta l = \pi$ (plus multiples of $2\pi$).`])],
      hints: [md`With a short, $\Gamma_L = -1$ and $\tilde V(d) = 2jV^+\sin\beta d$. Where is $|\sin\beta d|$ largest? Use that to find $l$ in wavelengths.`],
      sol: md`
        **Step 1: the voltage on a shorted line.** $\Gamma_L = -1$:
        $$\tilde V(d) = V^+\left(e^{j\beta d} - e^{-j\beta d}\right) = 2jV^+\sin\beta d$$
        **Step 2: where the maxima are.** $|\sin\beta d| = 1$ at $\beta d = \tfrac\pi2, \tfrac{3\pi}{2}, \ldots$, that is at $d = \tfrac\lambda4 + n\tfrac\lambda2$.

        **Step 3: the length.** The maximum is at $d = l/2$:
        $$\frac l2 = \frac\lambda4 + n\frac\lambda2 \quad\Rightarrow\quad l = \frac\lambda2 + n\lambda$$
        **Step 4: Z_eq.** A shorted line has $Z_{eq} = jZ_0\tan\beta l$, and $\beta l = \pi + 2n\pi$:
        $$Z_{eq} = jZ_0\tan(\pi + 2n\pi) = 0$$
        $$\boxed{Z_{eq} = 0\ \Omega}$$
        [[fig:pk]]

        !!intuition Does this make sense?
          A half-wave line repeats its load, and the load is a short. The voltage is zero at both ends and peaks in the middle, like a guitar string fixed at both ends.

        **Speed path.** Short + peak in the middle = the line is a half wavelength (one "hump"). Half-wave repeats the load: $Z_{eq} = 0$.

        **Where points go.** Concluding $l = \lambda/4$ from "the peak is a quarter wave from the short" (that is $l/2$, not $l$); answering $\infty$.

        ${LEARN('[Topic 18: stubs and resonance](#/l/w6-stubs)')}
      `,
      figs: { pk: { svg: p4dFig(), cap: '|V(d)| on the shorted line, for the shortest length l = λ/2: zero at both ends, largest at d = l/2.' } } }),
    P({ later: true, src: 'Fall 2025 #4(e) · 3 pts', title: 'Open line with a current null at l/4',
      q: md`The line is disconnected from $Z_L$ (the line is left open). A current null is observed at $d = l/4$, that is $\tilde I(l/4) = 0$. What is the shortest possible electrical length of the line?`,
      parts: [NT(md`$l$, in wavelengths`, 2, 'λ', [[1, 'That puts the null at d = λ/4. An open line has its first current null (after d = 0) at d = λ/2, not λ/4: current nulls of an open line are λ/2 apart, starting at the open end.'], [0.5, 'That is l = λ/2, which puts d = l/4 = λ/8: sin(β λ/8) is not zero.'], [0.25, 'An open line has a current null at d = 0 and every λ/2 after. l/4 = λ/16 is not one of them.']])],
      hints: [md`Open: $\Gamma_L = +1$, so $\tilde I(d) = \frac{2jV^+}{Z_0}\sin\beta d$. Its nulls are at $d = n\lambda/2$. The point $d = l/4$ must be one of them with $n \ge 1$.`],
      sol: md`
        **Step 1: the current on an open line.** $\Gamma_L = +1$:
        $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} - e^{-j\beta d}\right) = \frac{2jV^+}{Z_0}\sin\beta d$$
        **Step 2: the nulls.** $\sin\beta d = 0$ at $\beta d = n\pi$, that is at
        $$d = 0,\ \frac\lambda2,\ \lambda,\ \ldots$$
        The first one is the open end itself, where no current can flow.

        **Step 3: the length.** $d = l/4$ is a null, and $l > 0$, so $n \ge 1$:
        $$\frac l4 = n\frac\lambda2 \quad\Rightarrow\quad l = 2n\lambda$$
        The shortest is $n = 1$:
        $$\boxed{l = 2\lambda}$$
        [[fig:nl]]

        !!intuition Does this make sense?
          On a $2\lambda$ open line the current has nulls at $d = 0, \lambda/2, \lambda, 3\lambda/2, 2\lambda$: every $l/4$. ✓ The question asks for an electrical length, so the answer is in wavelengths, not meters.

        **Speed path.** Open: current nulls every $\lambda/2$ from the end. $l/4 = \lambda/2$, so $l = 2\lambda$.

        **Where points go.** Using the voltage nulls (those sit at odd $\lambda/4$ on an open line); $l = \lambda$ from putting the first null at $\lambda/4$; a length in meters (no frequency is given).

        ${LEARN('[Topic 18](#/l/w6-stubs), [Topic 17](#/l/w6-vd)')}
      `,
      figs: { nl: { svg: p4eFig(), cap: '|I(d)| on an open line of length 2λ: nulls every λ/2, so one sits at d = l/4.' } } }),
    P({ later: true, src: 'Fall 2025 #4(f) · 3 pts', title: 'Matched load: is V(0) = V(l)?',
      q: md`Let $Z_L = Z_0$, a condition known as "matched impedance". In this case, does $\tilde V(0) = \tilde V(l)$? Explain.`,
      parts: [mc(md`Does $\tilde V(0) = \tilde V(l)$ when $Z_L = Z_0$?`, [md`No, in general: $|\tilde V(0)| = |\tilde V(l)|$, but the phases differ by $\beta l$`, md`Yes, always: a matched line has no reflection, so the voltage is the same everywhere`, md`No: the voltage decays along the line`, md`Yes, but only if $R_g = Z_0$ too`], 0,
        [null, md`No reflection makes the **amplitude** the same everywhere, but the single traveling wave still delays the phase: $\tilde V(d) = V^+e^{j\beta d}$, so $\tilde V(l) = \tilde V(0)\,e^{j\beta l}$.`, md`The line is lossless: no decay. Only the phase changes.`, md`$R_g$ only sets $V^+$. It does not change the phase difference $\beta l$ between the two ends.`])],
      hints: [md`With $\Gamma_L = 0$, $\tilde V(d) = V^+e^{j\beta d}$. Compare $d = 0$ and $d = l$.`],
      sol: md`
        **Step 1: matched means no reflected wave.** $Z_L = Z_0$ gives $\Gamma_L = 0$:
        $$\tilde V(d) = V^+e^{j\beta d}$$
        **Step 2: the two ends.**
        $$\tilde V(0) = V^+,\qquad \tilde V(l) = V^+e^{j\beta l}$$
        **Step 3: compare.** The magnitudes are equal, $|V^+|$. The phasors are equal only if $e^{j\beta l} = 1$, that is $l = n\lambda$:
        $$\boxed{\text{No, in general: }\tilde V(l) = \tilde V(0)\,e^{j\beta l}}$$

        !!intuition Does this make sense?
          A matched line carries one traveling wave. Every point sees the same sinusoid, of the same size, but later the farther it is from the source: $v(d, t) = |V^+|\cos(\omega t + \beta d + \phi)$. Same amplitude, different time: different phasor.

        **Speed path.** Matched: $|\tilde V|$ constant, phase shifts by $\beta l$. So no, unless $l$ is a whole number of wavelengths.

        **Where points go.** "Yes" from "no reflection, so nothing changes" (the phase changes); saying "no" without the reason (equal magnitudes, different phase).

        ${LEARN('[Topic 17](#/l/w6-vd)')}
      ` }),

    R(md`
      ### After the paper

      - **Score yourself honestly**, then redo every missed part tomorrow on a blank sheet.
      - The patterns to own before Monday: the ratio $\sigma/\omega\epsilon$ decides everything in a lossy medium, and $\omega\epsilon_0 = f/(18\times10^9)$ S/m; $\Gamma$, $\tau$, $\mathbf H = \frac1\eta\hat v\times\mathbf E$ with the reflected wave's direction flipped; power with the right $\eta$ on each side, then $S_i = S_r + S_t$; a bounce diagram walked one arrival at a time; and a delta source has a zero steady state.
      - Two new papers in exactly this style: [Practice exam M](#/l/e3-prac-m) and [Practice exam N](#/l/e3-prac-n).
    `),
  ];

  EM.lesson('e3-past', { id: 'e3-past-fa25', order: 0.5, title: 'Fall 2025 Exam 3 (Chen, Mitchell, Shao)', kind: 'exam', sub: '75 min · 100 pts · the most recent Exam 3', steps: fa25 });
})();

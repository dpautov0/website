/* Topic 19: half- and quarter-wave transformers, and the whole circuit (Lecture 33; the quarter-wave coating footnote of
   Lecture 25; formula sheet page 3, "Phasor equations", including V(l) = F Z(l)/(Zg + Z(l)) and P(d)).
   From V(d) and I(d): e^{±jβd} = −1 at a half wave and ±j at a quarter wave; Z_in = Z_L and Z_in = Z0²/Z_L; the four
   quarter-wave V/I relations with their signs; matching with Z0 = √(R_in R_L) and why it is narrow-band; cascades; the
   input divider and power; the same idea for plane waves (anti-reflection coatings).
   Same pace as w2-gamma.js. Every number was recomputed in Python (work-w6q/lesson.py, gens.py). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;
  const PI = Math.PI;

  // ---------------------------------------------------------------- figures
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
    const a = L / 2 - 14, b = L / 2 + 14, pts = [[x1, y1], [x1 + ux * a, y1 + uy * a]];
    for (let k = 0; k < 6; k++) { const t = a + (b - a) * (k + 0.5) / 6, s = k % 2 ? -5 : 5; pts.push([x1 + ux * t + px * s, y1 + uy * t + py * s]); }
    pts.push([x1 + ux * b, y1 + uy * b], [x2, y2]);
    g.pl(pts);
  }
  // source (F, Zg), then line sections listed from the source side, then a load box.
  // o: { secs: [{ z0, len }], load, src (default true), vin, vl, ticks: [[x fraction from the input, 'tex'], ...], alt }
  function ckt(o) {
    const g = PF.fig({ alt: o.alt });
    const yT = 40, yB = 120, ym = (yT + yB) / 2, W = o.w || 210;
    const xs = 30, xr = 100, x0 = 160, x1 = x0 + W, xe = x1 + 66;
    if (o.src !== false) {
      g.circle(xs, ym, 13); g.label(xs, ym, '\\sim', 'c');
      g.line(xs, yT, xs, ym - 13); g.line(xs, ym + 13, xs, yB);
      g.label(xs - 17, ym, '\\tilde F', 'r');
      zig(g, xs, yT, xr, yT); g.label((xs + xr) / 2, yT - 9, 'Z_g', 'b', 'small');
      g.line(xr, yT, x0, yT); g.line(xs, yB, x0, yB);
    } else {
      g.line(x0 - 40, yT, x0, yT); g.line(x0 - 40, yB, x0, yB); g.dot(x0 - 40, yT); g.dot(x0 - 40, yB);
    }
    const n = o.secs.length;
    o.secs.forEach((s, k) => {
      const xa = x0 + (W * k) / n, xb = x0 + (W * (k + 1)) / n;
      g.rect(xa, yT, xb - xa, yB - yT, { cls: 'shade nodecl' });
      g.line(xa, yT, xb, yT, { cls: 'thick' }); g.line(xa, yB, xb, yB, { cls: 'thick' });
      g.label((xa + xb) / 2, ym - 11, s.z0, 'c', 'small');
      if (s.len) g.label((xa + xb) / 2, ym + 12, s.len, 'c', 'small');
      if (k) { g.line(xa, yT + 6, xa, yB - 6, { cls: 'dim dash thin' }); }
    });
    g.dot(x0, yT); g.dot(x0, yB); g.dot(x1, yT); g.dot(x1, yB);
    g.line(x1, yT, xe, yT); g.line(x1, yB, xe, yB);
    g.line(xe, yT, xe, ym - 17); g.line(xe, ym + 17, xe, yB);
    g.rect(xe - 9, ym - 17, 18, 34);
    g.label(xe + 15, ym, o.load || 'Z_L', 'l', 'small');
    if (o.vin) {
      g.label(x0 - 13, yT + 13, '+', 'c', 'small'); g.label(x0 - 13, yB - 13, '-', 'c', 'small');
      g.label(x0 - 7, ym, '\\tilde V_{in}', 'r', 'small');
      g.arrow(x0 - 36, yT, x0 - 12, yT, { hs: 6 }); g.label(x0 - 24, yT - 7, '\\tilde I_{in}', 'b', 'small');
    }
    if (o.vl) {
      g.label(xe - 18, yT + 13, '+', 'c', 'small'); g.label(xe - 18, yB - 13, '-', 'c', 'small');
      g.label(xe - 13, ym, '\\tilde V_L', 'r', 'small');
      g.arrow(x1 + 12, yT, x1 + 36, yT, { hs: 6 }); g.label(x1 + 24, yT - 7, '\\tilde I_L', 'b', 'small');
    }
    if (o.ticks) {
      const yd = yB + 30;
      g.arrow(x1 + 8, yd, x0 - 30, yd, { cls: 'dim', hs: 6 }); g.label(x0 - 34, yd, 'd', 'r', 'small');
      o.ticks.forEach(([u, t]) => { const x = x0 + W * u; g.line(x, yd - 4, x, yd + 4, { cls: 'dim' }); g.label(x, yd + 7, t, 't', 'small'); });
    }
    return g.svg();
  }
  // what the source sees: F, Zg and one box Z_in
  function loopFig() {
    const g = PF.fig({ alt: 'the equivalent circuit seen by the source: the source F in series with Z_g and a single box Z_in that stands for the whole line and its load; the current I_in flows around the loop' });
    const yT = 40, yB = 120, ym = 80, xs = 30, xr = 100, xb = 170;
    g.circle(xs, ym, 13); g.label(xs, ym, '\\sim', 'c');
    g.line(xs, yT, xs, ym - 13); g.line(xs, ym + 13, xs, yB);
    g.label(xs - 17, ym, '\\tilde F', 'r');
    zig(g, xs, yT, xr, yT); g.label((xs + xr) / 2, yT - 9, 'Z_g', 'b', 'small');
    g.line(xr, yT, xb, yT); g.line(xs, yB, xb, yB);
    g.line(xb, yT, xb, ym - 20); g.line(xb, ym + 20, xb, yB);
    g.rect(xb - 11, ym - 20, 22, 40);
    g.label(xb + 17, ym, 'Z_{in}', 'l', 'small');
    g.arrow(xr + 14, yT, xr + 42, yT, { hs: 6 }); g.label(xr + 28, yT - 7, '\\tilde I_{in}', 'b', 'small');
    g.label(xb - 30, yT + 13, '+', 'c', 'small'); g.label(xb - 30, yB - 13, '-', 'c', 'small');
    g.label(xb - 22, ym, '\\tilde V_{in}', 'r', 'small');
    return g.svg();
  }
  // the two unit arrows e^{+jβd} and e^{−jβd} after a quarter wave (q) or a half wave (h)
  function wheel(kind) {
    const q = kind === 'q';
    const g = PF.fig({ alt: q
      ? 'unit circle: starting at 1 for d = 0, the arrow e to the plus j beta d turns counterclockwise to j, and e to the minus j beta d turns clockwise to minus j, after a quarter wave'
      : 'unit circle: after a half wave both arrows have turned half a circle, one each way, and both point at minus 1' });
    const cx = 92, cy = 92, r = 56;
    g.circle(cx, cy, r, { cls: 'dim' });
    g.line(cx - r - 14, cy, cx + r + 14, cy, { cls: 'dim thin' });
    g.line(cx, cy + r + 14, cx, cy - r - 14, { cls: 'dim thin' });
    g.line(cx, cy, cx + r, cy, { cls: 'dash dim' });
    g.label(cx + r + 4, cy + 4, '1', 'tl', 'small');
    const arcHead = (rad, a0, a1, ccw) => {
      g.arc(cx, cy, rad, a0, a1, { cls: 'dim' });
      const t = a1 * PI / 180, x = cx + rad * Math.cos(t), y = cy - rad * Math.sin(t), s = ccw ? 1 : -1;
      g.head(x, y, -s * Math.sin(t), -s * Math.cos(t), { hs: 6, cls: 'dim' });
    };
    if (q) {
      g.arrow(cx, cy, cx, cy - r, { cls: 'thick', hs: 8 });
      g.arrow(cx, cy, cx, cy + r, { cls: 'thick', hs: 8 });
      g.label(cx + 6, cy - r - 4, 'e^{j\\beta d} = j', 'bl', 'small');
      g.label(cx + 6, cy + r + 4, 'e^{-j\\beta d} = -j', 'tl', 'small');
      arcHead(24, 4, 84, true); arcHead(24, -4, -84, false);
    } else {
      g.arrow(cx, cy, cx - r, cy, { cls: 'thick', hs: 8 });
      g.label(cx - r - 4, cy - 6, 'e^{\\pm j\\beta d} = -1', 'br', 'small');
      arcHead(22, 4, 174, true); arcHead(32, -4, -174, false);
    }
    return g.svg();
  }
  // |Γ_in| of a quarter-wave matcher (50 Ω to 200 Ω through 100 Ω) against frequency
  function bandFig() {
    const gin = (x) => { const z = TL.zAt(200, 100, (PI / 2) * x); return z === Infinity ? 1 : z.sub(50).div(z.add(50)).abs(); };
    return PF.plot({
      w: 380, h: 200, x: [0, 4.2], y: [0, 0.8], xl: 'f/f_0', yl: '|\\Gamma_{in}|',
      xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[0.6, '0.6']],
      curves: [{ f: gin, n: 500 }],
      hlines: [[0.6, '\\text{no matcher}']],
    });
  }
  // a plane wave meets a coated surface: two echoes, one from each face
  function coatFig() {
    const g = PF.fig({ alt: 'a plane wave in medium 1 meets a coating layer of medium 2, a quarter wavelength thick, on top of medium 3. One echo comes back from the front face; a second echo comes back from the back face after crossing the layer twice' });
    const y0 = 40, y1 = 170, xa = 20, xf = 200, xb = 250, xz = 380;
    g.rect(xf, y0, xb - xf, y1 - y0, { cls: 'shade nodecl' });
    g.rect(xb, y0, xz - xb, y1 - y0, { cls: 'shade nodecl' });
    g.rect(xb, y0, xz - xb, y1 - y0, { cls: 'shade nodecl' });
    g.line(xf, y0, xf, y1); g.line(xb, y0, xb, y1);
    g.label((xa + xf) / 2, y1 + 6, '\\eta_1', 't', 'small');
    g.label((xf + xb) / 2, y1 + 6, '\\eta_2', 't', 'small');
    g.label((xb + xz) / 2, y1 + 6, '\\eta_3', 't', 'small');
    g.dim(xf, y0, xb, y0, '\\lambda_2/4', { off: -14 });
    g.arrow(40, 66, xf - 6, 66, { hs: 8 }); g.text(110, 58, 'incident', 'b', 'small');
    g.arrow(xf - 6, 96, 60, 96, { cls: 'dash', hs: 7 }); g.text(110, 104, 'echo 1', 't', 'small');
    g.pl([[xf - 6, 130], [xf + 2, 130], [xb - 3, 138], [xf + 3, 146]], { cls: 'dash' });
    g.arrow(xf + 3, 146, 60, 146, { cls: 'dash', hs: 7 }); g.text(110, 154, 'echo 2', 't', 'small');
    g.arrow(xb + 8, 66, xz - 16, 66, { hs: 8 }); g.text(315, 58, 'transmitted', 'b', 'small');
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  EM.lesson('w6', {
    id: 'w6-qw', topic: 19, ref: 'Lecture 33', title: 'Half-wave and quarter-wave transformers, and the whole circuit',
    steps: [
      RF(md`
        !!key Why you care
          Lecture 33 is the last lecture on Exam 3, and its two tricks earn a lot of points for very little algebra. Spring 2018 Problem 4(b) (10 points) is a quarter-wave line inside a circuit: one line for $Z_{in}$, one line for a voltage divider. Fall 2023 Problem 7 and Spring 2017 Problem 6 both turn on a shorted line that looks like an open circuit a quarter wave back. In this lesson you derive both tricks from $\tilde V(d)$ and $\tilde I(d)$. Then you solve whole circuits, source to load, without ever finding $V^+$ and $V^-$.

        ### Notation

        - $d$: distance **back from the load**, in m. $d = 0$ at the load and $d = l$ at the input, where the source is. This is the coordinate on your formula sheet.
        - $\lambda$: the wavelength **on the line**, $\lambda = v/f$, where $v$ is the line's speed. Not the free-space wavelength.
        - $\beta = 2\pi/\lambda$: the phase constant, in rad/m.
        - $\beta d$: the **electrical length** of a stretch of line, in radians. It says how much phase a wave gains crossing that stretch. A quarter wave is $\beta d = \pi/2$. A half wave is $\beta d = \pi$.
        - $Z_0$: the characteristic impedance, in $\Omega$. It is $\tilde V/\tilde I$ of one wave traveling alone ([Topic 13](#/l/w5-telegraph)). It is real here, because every line is lossless.
        - $\tilde V(d)$, $\tilde I(d)$: the voltage phasor across the line and the current phasor along it, at $d$. $\tilde I$ counts as positive when it flows toward the load in the top conductor.
        - $V^+$, $V^-$: the phasors of the wave going toward the load and of the wave coming back, both measured at the load.
        - $\Gamma_L = V^-/V^+$: the load reflection coefficient.
        - $Z_L$, $\tilde V_L$, $\tilde I_L$: the load impedance, voltage and current, at $d = 0$.
        - $Z_{in}$, $\tilde V_{in}$, $\tilde I_{in}$: the same three at the input, $d = l$. $Z_{in} = Z(l)$ is what the source sees.
        - $Z(d) = \tilde V(d)/\tilde I(d)$: the line impedance at $d$ ([Topic 17](#/l/w6-vd)).
        - $\tilde F$, $Z_g$: the source's open-circuit voltage phasor and its internal impedance. These are the formula sheet's names.
        - $P$: time-averaged power, in W.

        [[fig:ckt]]

        ### 1. The two waves, counted from the load

        [Topic 17](#/l/w6-vd) solves the phasor telegrapher's equations. Here is the result. Measured back from the load, the voltage is a wave going toward the load plus a wave coming back:
        $$\tilde V(d) = V^+e^{j\beta d} + V^-e^{-j\beta d}$$
        Each wave's current is its voltage divided by $Z_0$. The wave coming back gets a minus sign, because it carries power the other way:
        $$\tilde I(d) = \frac{V^+e^{j\beta d} - V^-e^{-j\beta d}}{Z_0}$$
        Why is the wave going toward the load written with $e^{+j\beta d}$? In $z$, that wave is $e^{-j\beta z}$. Put the load at $z = 0$ and the input at $z = -l$. Then $d = -z$, so
        $$e^{-j\beta z} = e^{+j\beta d}$$
        In words: walking back toward the source, you meet the incoming wave **earlier** in its journey, so its phase is **ahead**.

        Now set $d = 0$. Both exponentials become 1, and you get the load:
        $$\tilde V_L = V^+ + V^-$$
        $$Z_0\tilde I_L = V^+ - V^-$$
        Keep these two lines in view. Every result below comes from spotting one of them.

        The only things in $\tilde V(d)$ and $\tilde I(d)$ that change with $d$ are the two unit arrows $e^{+j\beta d}$ and $e^{-j\beta d}$. They start together at 1 and turn in opposite directions as $d$ grows. This lesson is about the two distances where they land somewhere simple.

        [[fig:arrows]]

        Each entry of this table is $\beta d = (2\pi/\lambda)\,d$, then Euler's formula $e^{j\theta} = \cos\theta + j\sin\theta$:

        | Stretch | $\beta d$ | $e^{+j\beta d}$ | $e^{-j\beta d}$ |
        |---|---|---|---|
        | $\lambda/4$ | $\pi/2$ | $j$ | $-j$ |
        | $\lambda/2$ | $\pi$ | $-1$ | $-1$ |

        For example, at $\theta = \pi/2$: $\cos\theta = 0$ and $\sin\theta = 1$, so $e^{j\pi/2} = j$.
      `, {
        ckt: { svg: ckt({ secs: [{ z0: 'Z_0', len: 'l' }], vin: true, vl: true, ticks: [[0, 'd = l'], [1, '0']], alt: 'a source F with internal impedance Z_g drives a line of impedance Z_0 and length l, which ends in a load Z_L. V_in and I_in are at the input, V_L and I_L at the load. The distance d is measured from the load (d = 0) back to the input (d = l)' }), cap: 'The circuit of this lesson. $d$ runs from the load back to the source.' },
        arrows: { svg: PF.row([{ svg: wheel('q'), cap: 'After $d = \\lambda/4$' }, { svg: wheel('h'), cap: 'After $d = \\lambda/2$' }]).svg, cap: 'The two arrows start at 1 (dashed) and turn opposite ways as $d$ grows.' },
      }),
      Q(md`**Predict.** At $d = \lambda/8$, the arrow $e^{j\beta d}$ is…`,
        [md`$(1 + j)/\sqrt2$`, md`$j$`, md`$(1 - j)/\sqrt2$`, md`$e^{j\pi/8}$`], 0,
        [null, md`$j$ belongs to a quarter wave. An eighth of a wave is half of that turn: $\beta d = \pi/4$.`, md`That is $e^{-j\beta d}$, the arrow that turns the other way.`, md`That drops the $2\pi$ in $\beta$. $\beta d = (2\pi/\lambda)(\lambda/8) = \pi/4$, not $\pi/8$.`],
        md`$\beta d = (2\pi/\lambda)(\lambda/8) = \pi/4$. Then $e^{j\pi/4} = \cos45° + j\sin45° = (1 + j)/\sqrt2$. Halfway between 1 and $j$, as it should be.`),
      R(md`
        ### 2. Half a wavelength: everything flips sign

        Put $d = \lambda/2$. Then
        $$\beta d = \frac{2\pi}{\lambda}\cdot\frac{\lambda}{2} = \pi$$
        and the two arrows land on the same spot:
        $$e^{+j\pi} = e^{-j\pi} = -1$$
        Put this into $\tilde V(d)$:
        $$\tilde V(\lambda/2) = -V^+ - V^-$$
        Pull out the minus sign. What is left in the bracket is the load voltage:
        $$\tilde V(\lambda/2) = -(V^+ + V^-) = -\tilde V_L$$
        Now the current. Both exponentials are $-1$ again:
        $$\tilde I(\lambda/2) = \frac{-V^+ + V^-}{Z_0}$$
        Pull out the minus sign. The bracket is $Z_0\tilde I_L$:
        $$\tilde I(\lambda/2) = -\frac{V^+ - V^-}{Z_0} = -\tilde I_L$$
        So for a line exactly half a wavelength long:
        $$\boxed{\tilde V_{in} = -\tilde V_L}$$
        $$\boxed{\tilde I_{in} = -\tilde I_L}$$
        Divide one by the other to get the impedance. The two minus signs cancel:
        $$Z_{in} = \frac{\tilde V_{in}}{\tilde I_{in}} = \frac{-\tilde V_L}{-\tilde I_L}$$
        $$\boxed{Z_{in} = Z_L}$$

        !!intuition Does this make sense?
          - **$Z_0$ dropped out.** A half-wave line of *any* $Z_0$ hands the source exactly the load's impedance. For impedance, it is invisible.
          - **The minus signs are half a cycle of delay.** A wave needs half a period to cross half a wavelength. Delaying a sinusoid by half a period flips its sign: $\cos(\omega t - \pi) = -\cos\omega t$.
          - **It repeats.** Each extra half wave multiplies both arrows by $-1$ again. So $Z(d + \lambda/2) = Z(d)$ at every point of a line. That is the sheet's $z(d) = z(d \pm \lambda/2)$. After an even number of half waves, the signs of $\tilde V$ and $\tilde I$ are back to $+$.
      `),
      Q(md`**Predict.** A $75\ \Omega$ line, half a wavelength long, ends in $Z_L = 30 - j40\ \Omega$. The source sees…`,
        [md`$30 - j40\ \Omega$`, md`$67.5 + j90\ \Omega$`, md`$-30 + j40\ \Omega$`, md`$75\ \Omega$`], 0,
        [null, md`That is $75^2/(30 - j40)$, the quarter-wave rule. A half wave hands over the load unchanged.`, md`Voltage and current both flip sign, so their ratio does not.`, md`Only a matched load ($Z_L = Z_0$) makes the input look like $Z_0$.`],
        md`$\beta l = \pi$, so $\tilde V_{in} = -\tilde V_L$ and $\tilde I_{in} = -\tilde I_L$. Their ratio is $Z_L = 30 - j40\ \Omega$. The $75\ \Omega$ never enters.`),
      R(md`
        ### 3. A quarter wavelength: the impedance inverter

        Now put $d = \lambda/4$:
        $$\beta d = \frac{2\pi}{\lambda}\cdot\frac{\lambda}{4} = \frac{\pi}{2}$$
        This time the arrows point opposite ways:
        $$e^{+j\pi/2} = j, \qquad e^{-j\pi/2} = -j$$
        Put them into $\tilde V(d)$:
        $$\tilde V(\lambda/4) = jV^+ - jV^-$$
        Factor out $j$:
        $$\tilde V(\lambda/4) = j(V^+ - V^-)$$
        Look at the bracket. It is not the load *voltage*. It is $Z_0\tilde I_L$, the second load line of Section 1. So
        $$\boxed{\tilde V_{in} = jZ_0\tilde I_L} \qquad\text{(1)}$$
        Now the current. The minus sign in front of $V^-$ meets $e^{-j\pi/2} = -j$, and two minus signs make a plus:
        $$\tilde I(\lambda/4) = \frac{jV^+ + jV^-}{Z_0}$$
        Factor out $j$:
        $$\tilde I(\lambda/4) = \frac{j(V^+ + V^-)}{Z_0}$$
        This time the bracket **is** the load voltage:
        $$\boxed{\tilde I_{in} = \frac{j\tilde V_L}{Z_0}} \qquad\text{(2)}$$
        Read (1) and (2) in words. **The input voltage is set by the load current, and the input current is set by the load voltage.** A quarter wave swaps the roles of $\tilde V$ and $\tilde I$.

        Divide (1) by (2). The $j$'s cancel:
        $$Z_{in} = \frac{jZ_0\tilde I_L}{j\tilde V_L/Z_0} = Z_0^2\,\frac{\tilde I_L}{\tilde V_L}$$
        And $\tilde I_L/\tilde V_L = 1/Z_L$:
        $$\boxed{Z_{in} = \frac{Z_0^2}{Z_L}}$$
        Written another way, $Z_{in}Z_L = Z_0^2$. In units of $Z_0$ (write $z = Z/Z_0$), it says $z_{in} = 1/z_L$: a quarter-wave line turns an impedance into its reciprocal. That is why it is called an **impedance inverter**. It is what the sheet means by $Z(d) = Y(d \pm \lambda/4)$, read in units of $Z_0$.

        !!intuition Does this make sense?
          - **Units.** $Z_0^2/Z_L$ has units $\Omega^2/\Omega = \Omega$ ✓.
          - **A matched load.** $Z_L = Z_0$ gives $Z_{in} = Z_0^2/Z_0 = Z_0$. With no wave coming back, every point on the line looks like $Z_0$ ✓.
          - **Why the swap?** At the load, the two waves add in the voltage ($V^+ + V^-$) and subtract in the current ($V^+ - V^-$). A quarter wave back, one arrow has turned $+90°$ and the other $-90°$: a relative turn of $180°$. So there the voltage holds the *difference* of the two waves and the current holds their *sum*.
      `),
      Q(md`**Predict.** A $50\ \Omega$ line, a quarter wave long, ends in $Z_L = 200\ \Omega$. The source sees…`,
        [md`$12.5\ \Omega$`, md`$200\ \Omega$`, md`$800\ \Omega$`, md`$100\ \Omega$`], 0,
        [null, md`That is the half-wave rule. A quarter wave inverts.`, md`That is $Z_L^2/Z_0$, the fraction upside down. Check with a matched load: it must give $Z_0$ back.`, md`That is $\sqrt{Z_0Z_L}$, the geometric mean. It is the $Z_0$ that would *match* $200\ \Omega$ to $50\ \Omega$ (Section 6), not $Z_{in}$.`],
        md`$Z_{in} = Z_0^2/Z_L = 2500/200 = 12.5\ \Omega$. A load four times bigger than $Z_0$ becomes four times smaller.`),
      R(md`
        **Play with it.** Pick a load, then slide $d/\lambda$ to $0.25$ and to $0.5$ and read $z(d) = Z(d)/Z_0$. At $0.5$ you get the load back. At $0.25$ you get $1/z_L$: the load $3Z_0$ ($z_L = 3$) shows $z = 1/3$, the short shows an open, and $Z_0(1 + j)$ shows $0.5 - j0.5$.
      `),
      W3.zline(),
      R(md`
        ### 4. What the inverter does to shorts, opens and reactances

        - **A short becomes an open.** $Z_L = 0$ gives $Z_{in} = Z_0^2/0 = \infty$. Physically: a short forces $\tilde V_L = 0$, and then (2) says $\tilde I_{in} = j\tilde V_L/Z_0 = 0$. No current enters the line, whatever voltage you put across it. This is the parallel resonance of a shorted stub ([Topic 18](#/l/w6-stubs)).
        - **An open becomes a short.** $Z_L = \infty$ means $\tilde I_L = 0$, and (1) says $\tilde V_{in} = jZ_0\tilde I_L = 0$.
        - **Large becomes small.** A $50\ \Omega$ quarter-wave line turns $500\ \Omega$ into $5\ \Omega$, and $5\ \Omega$ into $500\ \Omega$.

        **An inductor becomes a capacitor.** Take $Z_L = j\omega L$:
        $$Z_{in} = \frac{Z_0^2}{j\omega L}$$
        Use $1/j = -j$:
        $$Z_{in} = -j\,\frac{Z_0^2}{\omega L}$$
        A negative reactance is a capacitor. A capacitor $C_{eq}$ has impedance $1/(j\omega C_{eq}) = -j/(\omega C_{eq})$. Match the two:
        $$\frac{1}{\omega C_{eq}} = \frac{Z_0^2}{\omega L}$$
        The $\omega$ cancels. Flip both sides:
        $$\boxed{C_{eq} = \frac{L}{Z_0^2}}$$
        The same steps turn a capacitor $C$ into an inductor:
        $$\boxed{L_{eq} = CZ_0^2}$$
        Careful: $\omega$ cancelled, but the line is a quarter wave at only one frequency. The swap holds there.

        **Any complex load.** Multiply top and bottom by the conjugate $R - jX$. The bottom becomes $R^2 + X^2$:
        $$Z_{in} = \frac{Z_0^2}{R + jX} = \frac{Z_0^2(R - jX)}{R^2 + X^2}$$
        The resistance stays positive. The reactance changes sign. **An inductive load looks capacitive at the input, and a capacitive load looks inductive.** For example, $Z_0 = 50\ \Omega$ and $Z_L = 20 + j40\ \Omega$ give $R^2 + X^2 = 400 + 1600 = 2000$, so
        $$Z_{in} = \frac{2500(20 - j40)}{2000} = 25 - j50\ \Omega$$

        !!trap Do not invert the parts separately
          $Z_0^2/(R + jX)$ is **not** $Z_0^2/R + Z_0^2/(jX)$. A fraction over a sum does not split. For $20 + j40$, that wrong move gives $125 - j62.5\ \Omega$. The right answer is $25 - j50\ \Omega$.
      `),
      Q(md`**Predict.** A $100\ \Omega$ line, a quarter wave long, ends in an inductor whose impedance at this frequency is $j50\ \Omega$. The source sees…`,
        [md`$-j200\ \Omega$, a capacitor`, md`$+j200\ \Omega$, an inductor`, md`$-j50\ \Omega$, a capacitor`, md`$+j50\ \Omega$, an inductor`], 0,
        [null, md`That drops the $1/j = -j$. An inductor cannot stay an inductor through a quarter wave.`, md`That flips the sign but forgets to invert the size: $100^2/50 = 200$.`, md`That is the half-wave rule. A quarter wave inverts.`],
        md`$Z_{in} = 100^2/(j50) = 200/j = -j200\ \Omega$. Negative reactance: a capacitor.`),
      R(md`
        ### 5. Voltage and current across a quarter-wave line, with signs

        Equations (1) and (2) go from the load to the input. Often you know the input and want the load. So solve each one for the load quantity. Divide (1) by $jZ_0$:
        $$\tilde I_L = \frac{\tilde V_{in}}{jZ_0}$$
        Use $1/j = -j$:
        $$\boxed{\tilde I_L = -j\,\frac{\tilde V_{in}}{Z_0}} \qquad\text{(3)}$$
        Now multiply (2) by $Z_0/j$, which is $-jZ_0$:
        $$\boxed{\tilde V_L = -jZ_0\tilde I_{in}} \qquad\text{(4)}$$
        All four on one table:

        | You know | You want | Relation |
        |---|---|---|
        | $\tilde I_L$ | $\tilde V_{in}$ | $\tilde V_{in} = jZ_0\tilde I_L$ |
        | $\tilde V_L$ | $\tilde I_{in}$ | $\tilde I_{in} = j\tilde V_L/Z_0$ |
        | $\tilde V_{in}$ | $\tilde I_L$ | $\tilde I_L = -j\tilde V_{in}/Z_0$ |
        | $\tilde I_{in}$ | $\tilde V_L$ | $\tilde V_L = -jZ_0\tilde I_{in}$ |

        **The rule behind the signs.** Going from the load toward the source, multiply by $+j$. Going from the source toward the load, multiply by $-j$. The input end is a quarter period **ahead** of the load end, because the incoming wave passes it first. And $Z_0$ converts: a current times $Z_0$ is a voltage, a voltage over $Z_0$ is a current.

        **The load current does not care about the load.** Look at (3) again: $Z_L$ is not in it. Hold the input voltage fixed, for example with an ideal source right at the input, and the load current is fixed too, whatever the load is. Its size is
        $$|\tilde I_L| = \frac{|\tilde V_{in}|}{Z_0}$$
        A quarter-wave line turns a voltage source into a current source. Once you have $\tilde I_L$, the load voltage is Ohm's law: $\tilde V_L = Z_L\tilde I_L$.

        !!intuition Does this make sense?
          Check that the power gets through. Multiply (1) by the conjugate of (2). The conjugate of $j$ is $-j$:
          $$\tilde V_{in}\tilde I_{in}^* = (jZ_0\tilde I_L)\,\frac{-j\tilde V_L^*}{Z_0}$$
          Since $j(-j) = 1$ and the $Z_0$'s cancel, this is $\tilde I_L\tilde V_L^*$. That is the conjugate of $\tilde V_L\tilde I_L^*$, so it has the same real part. So $\tfrac12\Re\{\tilde V_{in}\tilde I_{in}^*\} = \tfrac12\Re\{\tilde V_L\tilde I_L^*\}$: power in equals power out ✓.
      `),
      Q(md`**Predict.** An ideal source holds $\tilde V_{in} = 6$ V at the input of a $30\ \Omega$ quarter-wave line. The load is $10\ \Omega$. The load current is…`,
        [md`$-j0.2$ A`, md`$+j0.2$ A`, md`$0.6$ A`, md`$-j0.6$ A`], 0,
        [null, md`From the source toward the load, multiply by $-j$, not $+j$. The load end lags.`, md`That is $\tilde V_{in}/Z_L$. The load does not have 6 V across it; the line sits in between.`, md`That divides by $Z_L$. Equation (3) has only $Z_0$ in it.`],
        md`$\tilde I_L = -j\tilde V_{in}/Z_0 = -j(6/30) = -j0.2$ A. Then $\tilde V_L = Z_L\tilde I_L = -j2$ V. Check: $Z_{in} = 900/10 = 90\ \Omega$, and $\tfrac12(6^2)/90 = 0.2$ W in; $\tfrac12(0.2^2)(10) = 0.2$ W out ✓.`),
      R(md`
        ### 6. Quarter-wave matching

        The problem: you have a resistive load $R_L$, and you want the source, or a long feed line, to see a different resistance $R_{in}$. For example, a $200\ \Omega$ antenna on a $50\ \Omega$ system. Connected directly, part of every wave reflects. Put a quarter-wave section of impedance $Z_0$ in between. Its input impedance is
        $$Z_{in} = \frac{Z_0^2}{R_L}$$
        Ask for $Z_{in} = R_{in}$:
        $$\frac{Z_0^2}{R_L} = R_{in}$$
        Multiply both sides by $R_L$:
        $$Z_0^2 = R_{in}R_L$$
        Take the positive root:
        $$\boxed{Z_0 = \sqrt{R_{in}R_L}}$$
        $Z_0$ is the **geometric mean** of the two resistances. For $R_{in} = 50\ \Omega$ and $R_L = 200\ \Omega$:
        $$Z_0 = \sqrt{50\cdot200} = \sqrt{10^4} = 100\ \Omega$$
        The section is a quarter of the wavelength **on the section**, at the design frequency $f_0$:
        $$l = \frac{\lambda_0}{4} = \frac{v}{4f_0}$$

        **Why the geometric mean? Two echoes that cancel.** A wave coming from the $50\ \Omega$ side meets two steps: $50 \to 100$ at the front of the section, and $100 \to 200$ at the load. Each step reflects:
        $$\frac{100 - 50}{100 + 50} = \frac13, \qquad \frac{200 - 100}{200 + 100} = \frac13$$
        They are equal, and that is no accident. Set the two step reflections equal in general:
        $$\frac{Z_0 - R_{in}}{Z_0 + R_{in}} = \frac{R_L - Z_0}{R_L + Z_0}$$
        Cross-multiply and everything cancels except $Z_0^2 = R_{in}R_L$. Now the timing. The second echo travels a quarter wave in and a quarter wave back: half a wavelength farther than the first. So it returns with its sign flipped. Two equal echoes of opposite sign cancel. (The weaker multiple echoes cancel too; $Z_{in} = R_{in}$ says so exactly.)

        **It needs a resistive load.** For $Z_L = R + jX$ with $X \neq 0$, Section 4 gives $Z_{in}$ a reactance $-Z_0^2X/(R^2 + X^2)$, which is never zero. A real $Z_0$ cannot remove it. The fix is to put the section where the line impedance is real, at a voltage maximum or minimum ([Topic 17](#/l/w6-vd)).
      `),
      Q(md`**Predict.** You want an $18\ \Omega$ load to look like $50\ \Omega$. The quarter-wave section needs $Z_0 =$…`,
        [md`$30\ \Omega$`, md`$34\ \Omega$`, md`$900\ \Omega$`, md`$139\ \Omega$`], 0,
        [null, md`That is the arithmetic mean, $(18 + 50)/2$. The match needs the geometric mean.`, md`That is $18\times50$ without the square root. Units: $\Omega^2$ is not $\Omega$.`, md`That is $50^2/18$, what a $50\ \Omega$ section would show the source. The unknown here is $Z_0$ itself.`],
        md`$Z_0 = \sqrt{18\cdot50} = \sqrt{900} = 30\ \Omega$. Check: $30^2/18 = 900/18 = 50\ \Omega$ ✓.`),
      RF(md`
        ### 7. Why it works at one frequency only

        The section's length $l$ is fixed in meters. Its electrical length is not: it grows with frequency. At $f_0$ it is $\pi/2$. At any other frequency $f$:
        $$\beta l = \frac{2\pi f}{v}\,l = \frac{\pi}{2}\cdot\frac{f}{f_0}$$
        Follow the $50 \to 200\ \Omega$ matcher of Section 6 as $f$ changes.

        - **At $f = 2f_0$:** $\beta l = \pi$. The section is now a **half** wave, and a half wave passes the load straight through: $Z_{in} = R_L = 200\ \Omega$. The source sees the bare load. The reflection at the input is
        $$\Gamma_{in} = \frac{200 - 50}{200 + 50} = 0.6$$
        exactly as if the section were not there.
        - **At $f = 3f_0$:** $\beta l = 3\pi/2$, three quarter waves. That is a half wave (no change) plus a quarter wave (inverts). Matched again.
        - **In between,** it is partly matched. The plot uses the full $Z(d)$ of [Topic 17](#/l/w6-vd).

        [[fig:band]]

        So a quarter-wave matcher works at $f_0, 3f_0, 5f_0, \ldots$ and does nothing at $0, 2f_0, 4f_0, \ldots$ (at $f = 0$ the line is just two wires). The dip around $f_0$ is broad but not flat: $10\%$ off $f_0$, $|\Gamma_{in}|$ is already about $0.12$ here.

        !!intuition Does this make sense?
          The cancellation in Section 6 needs the second echo to come back exactly half a wavelength late. At $2f_0$ the wavelength is half as long, so the same round trip is a whole wavelength. The two echoes arrive in step and add instead of cancel.
      `, { band: { svg: bandFig(), cap: 'The reflection at the input of a quarter-wave matcher from $50\\ \\Omega$ to $200\\ \\Omega$ ($Z_0 = 100\\ \\Omega$), against frequency. The dashed line is the bare load.' } }),
      Q(md`**Predict.** A quarter-wave matcher for $f_0 = 500$ MHz is 10 cm long. A second matcher for the same load, with the same $Z_0$ and the same $v$, is made **30 cm** long. At 500 MHz, the second one…`,
        [md`also matches perfectly`, md`does nothing: the source sees the bare load`, md`turns the load into its reciprocal, so it reflects completely`, md`matches only at 1.5 GHz`], 0,
        [null, md`That happens for an even number of quarter waves. 30 cm is three quarter waves.`, md`A quarter-wave inverter with the right $Z_0$ gives $R_{in}$, not a full reflection. Three quarter waves do exactly that.`, md`At 1.5 GHz the 30 cm line is nine quarter waves, which also matches. But it already works at 500 MHz.`],
        md`30 cm is $3\lambda/4$ at 500 MHz: a half wave (no change) plus a quarter wave (inverts with the same $Z_0$). So $Z_{in} = Z_0^2/R_L = R_{in}$, the same as the 10 cm section. It is narrower in band, though: its $\beta l$ moves three times faster with $f$.`),
      RF(md`
        ### 8. Cascades: walk from the load, one section at a time

        Real circuits join sections with different $Z_0$. At a junction, the conductors of the two lines are connected. So the voltage across them is the same on both sides (KVL), and the current that leaves one line enters the next (KCL). Therefore **the input of one section is the load of the next.** Walk from the load toward the source, one section at a time:

        - **A $\lambda/2$ section, any $Z_0$:** the impedance is unchanged; $\tilde V$ and $\tilde I$ flip sign.
        - **A $\lambda/4$ section of impedance $Z_{0k}$:** the impedance goes from $Z$ to $Z_{0k}^2/Z$, and $\tilde V$, $\tilde I$ swap through (1) and (2) with that section's $Z_{0k}$.

        Nothing in Sections 2 and 3 needed $d = 0$ to be a real load. Any point on a line can play the load for the line in front of it. So on one line, $\tilde V(d + \lambda/2) = -\tilde V(d)$ everywhere, and the quarter-wave relations hold between any two points $\lambda/4$ apart.

        [[fig:two]]

        **Two quarter-wave sections.** Call the one next to the load $Z_{02}$ and the one next to the source $Z_{01}$. At the junction:
        $$Z_m = \frac{Z_{02}^2}{Z_L}$$
        At the input, the first section inverts $Z_m$:
        $$Z_{in} = \frac{Z_{01}^2}{Z_m} = Z_{01}^2\cdot\frac{Z_L}{Z_{02}^2}$$
        $$\boxed{Z_{in} = \left(\frac{Z_{01}}{Z_{02}}\right)^2Z_L}$$
        Now the voltages. Equation (2) across the load section gives the current at the junction:
        $$\tilde I_m = \frac{j\tilde V_L}{Z_{02}}$$
        Equation (1) across the source section turns that current into the input voltage:
        $$\tilde V_{in} = jZ_{01}\tilde I_m = jZ_{01}\cdot\frac{j\tilde V_L}{Z_{02}}$$
        Since $j\cdot j = -1$:
        $$\boxed{\tilde V_{in} = -\frac{Z_{01}}{Z_{02}}\,\tilde V_L}$$
        Two quarter-wave sections act like an **ideal transformer** with turns ratio $Z_{01}:Z_{02}$, plus a sign flip. Voltages scale by the ratio; impedances scale by its square.

        !!intuition Does this make sense?
          Make the two sections equal, $Z_{01} = Z_{02}$. Then $Z_{in} = Z_L$ and $\tilde V_{in} = -\tilde V_L$. Two quarter waves of the same line are one half wave ✓.
      `, { two: { svg: ckt({ secs: [{ z0: 'Z_{01}', len: '\\lambda/4' }, { z0: 'Z_{02}', len: '\\lambda/4' }], src: false, w: 230, vin: true, vl: true, ticks: [[0, 'd_{in}'], [0.5, 'm'], [1, '0']], alt: 'two quarter-wave sections in a row: Z_01 next to the input, then Z_02 next to the load Z_L; the junction between them is labeled m' }), cap: 'Two sections. The junction $m$ is the load of the first section and the input of the second.' } }),
      Q(md`**Predict.** A $100\ \Omega$ load. Next to it, a quarter-wave section of $50\ \Omega$. In front of that, a quarter-wave section of $100\ \Omega$. The source sees…`,
        [md`$400\ \Omega$`, md`$100\ \Omega$`, md`$25\ \Omega$`, md`$200\ \Omega$`], 0,
        [null, md`Two inversions undo each other only when the two $Z_0$'s are equal. Here they are not.`, md`That stops after the first section ($50^2/100$), or walks the sections in the wrong order.`, md`That multiplies by the ratio $Z_{01}/Z_{02} = 2$ once. Impedances go as the square of the ratio.`],
        md`At the junction: $50^2/100 = 25\ \Omega$. At the input: $100^2/25 = 400\ \Omega$. Or in one step: $(100/50)^2\cdot100 = 400\ \Omega$.`),
      RF(md`
        ### 9. The input circuit: the source sees one impedance

        At the input terminals, whatever is inside, the voltage and the current are related by $\tilde V_{in} = Z_{in}\tilde I_{in}$. So the source cannot tell the line and load apart from a single lumped impedance $Z_{in}$.

        [[fig:loop]]

        Walk around the loop (KVL). The source's open-circuit voltage $\tilde F$ equals the drop across $Z_g$ plus the drop across the input:
        $$\tilde F = Z_g\tilde I_{in} + Z_{in}\tilde I_{in}$$
        Factor out $\tilde I_{in}$ and divide:
        $$\boxed{\tilde I_{in} = \frac{\tilde F}{Z_g + Z_{in}}}$$
        Multiply by $Z_{in}$ to get the input voltage:
        $$\boxed{\tilde V_{in} = \tilde F\,\frac{Z_{in}}{Z_g + Z_{in}}}$$
        That is the sheet's line $\tilde V(l) = \tilde F\,Z(l)/(Z_g + Z(l))$: a voltage divider.

        **The recipe for every circuit in this lesson.** Walk from the load to the input to get $Z_{in}$. Use the divider for $\tilde V_{in}$. Walk back to the load with (3), (4) and the half-wave flip.

        !!intuition Does this make sense?
          Take a matched load: $Z_{in} = Z_0$. The divider gives $\tilde V_{in} = \tilde FZ_0/(Z_g + Z_0)$. That is $\tau_g\tilde F$, where $\tau_g = Z_0/(Z_g + Z_0)$ is the injection coefficient: the share of the source the line takes at switch-on ([Topic 14](#/l/w5-launch)). With nothing coming back, the steady state is just that first wave, forever.
      `, { loop: { svg: loopFig(), cap: 'What the source sees. The box stands for everything to the right of the input terminals.' } }),
      Q(md`**Predict.** A source with $\tilde F = 9$ V and $Z_g = 50\ \Omega$ drives a $50\ \Omega$ quarter-wave line that ends in $25\ \Omega$. The input voltage $\tilde V_{in}$ is…`,
        [md`6 V`, md`3 V`, md`4.5 V`, md`9 V`], 0,
        [null, md`That puts $Z_L = 25\ \Omega$ into the divider: $9\cdot25/75$. The source sees $Z_{in}$, not $Z_L$.`, md`That puts $Z_0 = 50\ \Omega$ into the divider. Only a matched load makes $Z_{in} = Z_0$.`, md`That forgets the drop across $Z_g$.`],
        md`$Z_{in} = 2500/25 = 100\ \Omega$. Divider: $\tilde V_{in} = 9\cdot100/(50 + 100) = 6$ V.`),
      R(md`
        ### 10. Power: what goes in comes out

        The time-averaged power crossing the point $d$ is
        $$P(d) = \tfrac12\Re\{\tilde V(d)\tilde I^*(d)\}$$
        Show that it does not depend on $d$. Give the two waves at $d$ short names:
        $$A = V^+e^{j\beta d}, \qquad B = V^-e^{-j\beta d}$$
        Then $\tilde V = A + B$ and $Z_0\tilde I = A - B$. Multiply, with $Z_0$ real:
        $$Z_0\tilde V\tilde I^* = (A + B)(A^* - B^*)$$
        Expand the four products:
        $$Z_0\tilde V\tilde I^* = |A|^2 - |B|^2 + BA^* - AB^*$$
        The last two terms are a number minus its own conjugate, since $AB^* = (BA^*)^*$. That difference is purely imaginary, so it drops out of the real part. And $|A| = |V^+|$, $|B| = |V^-|$, because $|e^{\pm j\beta d}| = 1$. So
        $$\boxed{P = \frac{|V^+|^2}{2Z_0} - \frac{|V^-|^2}{2Z_0}}$$
        No $d$ anywhere. Incident power minus reflected power, the same at every point. A lossless line has nowhere to put power, so all of it reaches the load:
        $$P_{in} = P_L$$

        **Using it.** You can find the size of the load voltage without carrying phasors through the line. First get $P_{in}$ from the input circuit. Since $\tilde V_{in} = Z_{in}\tilde I_{in}$, the product $\tilde V_{in}\tilde I_{in}^*$ is $Z_{in}|\tilde I_{in}|^2$, so
        $$P_{in} = \tfrac12|\tilde I_{in}|^2\,\Re\{Z_{in}\}$$
        For a resistive load, $P_L = |\tilde V_L|^2/(2R_L)$. Set the two equal and solve:
        $$\boxed{|\tilde V_L| = \sqrt{2R_LP_{in}}}$$
        This works for **any** line length, not only quarter and half waves. It gives the size only. The phase still needs the walk.

        !!intuition Does this make sense?
          The 2 is there because phasors here hold peak values: $P = |\tilde V|^2/2R$, the same $\tfrac12$ as $\tfrac12 V_0^2/R$ for a resistor driven by $V_0\cos\omega t$. And a purely reactive input ($\Re\{Z_{in}\} = 0$) takes no average power, as a stub should ([Topic 18](#/l/w6-stubs)).
      `),
      Q(md`**Predict.** A lossless line takes in $P_{in} = 0.25$ W. Its load is a $50\ \Omega$ resistor. The load voltage has size…`,
        [md`5 V`, md`3.54 V`, md`12.5 V`, md`It depends on the line's length`], 0,
        [null, md`That is $\sqrt{50\cdot0.25}$: it leaves out the 2. Phasors hold peak values, so $P = |\tilde V|^2/2R$.`, md`That is $R_LP$ without the 2 and without the square root. $R_LP$ has units of $\text{V}^2$.`, md`Power is the same at every point of a lossless line, whatever its length.`],
        md`$|\tilde V_L| = \sqrt{2R_LP_{in}} = \sqrt{2\cdot50\cdot0.25} = \sqrt{25} = 5$ V.`),
      RF(md`
        ### 11. The same trick for plane waves: anti-reflection coatings

        A plane wave in medium 1 hitting medium 3 head-on reflects with $\Gamma = (\eta_3 - \eta_1)/(\eta_3 + \eta_1)$ ([Topic 11](#/l/w4-gamma)). To stop it, coat the surface with a layer of medium 2.

        Inside the layer there is a forward wave and a backward wave, exactly like on a line:
        $$\tilde E_x = E^+e^{-j\beta_2z} + E^-e^{+j\beta_2z}$$
        $$\tilde H_y = \frac{E^+e^{-j\beta_2z} - E^-e^{+j\beta_2z}}{\eta_2}$$
        These are $\tilde V$ and $\tilde I$ with $\eta_2$ in place of $Z_0$. And the boundary conditions, tangential $\mathbf E$ and $\mathbf H$ continuous at each face, are the same as $\tilde V$ and $\tilde I$ continuous at a line junction. So everything in this lesson carries over, with
        $$\tilde E \leftrightarrow \tilde V,\quad \tilde H \leftrightarrow \tilde I,\quad \eta \leftrightarrow Z_0$$
        At the back face, medium 3 holds only the transmitted wave, so there $\tilde E_x/\tilde H_y = \eta_3$. Medium 3 is the "load". Call $Z_w$ the ratio $\tilde E_x/\tilde H_y$ at the front face: the **wave impedance** that medium 1 sees. A layer $\lambda_2/4$ thick inverts the load:
        $$Z_w = \frac{\eta_2^2}{\eta_3}$$
        No reflection in medium 1 needs $Z_w = \eta_1$:
        $$\boxed{\eta_2 = \sqrt{\eta_1\eta_3}}$$
        and a thickness of $\lambda_2/4$, a quarter of the wavelength **in the coating**. For nonmagnetic media, $\eta = \eta_0/n$ with $n = \sqrt{\epsilon_r}$, and the same condition reads $n_2 = \sqrt{n_1n_3}$.

        [[fig:coat]]

        **A half-wave slab is transparent.** A slab $\lambda_2/2$ thick between two copies of the same medium hands the front face $Z_w = \eta_3 = \eta_1$. No reflection, whatever the slab is made of. Radar domes (radomes) use this.

        !!intuition Does this make sense?
          Camera lenses are coated for the middle of the visible band, green. Red and blue are off the design frequency, so a little of each reflects. That is the purple tint you see on a coated lens.
      `, { coat: { svg: coatFig(), cap: 'Two echoes, one from each face. The second crosses the layer twice: half a wavelength farther.' } }),
      Q(md`**Predict.** You want to coat glass with $\epsilon_r = 9$ (in air) against reflection. The coating needs $\epsilon_r =$…`,
        [md`$3$`, md`$\sqrt3 \approx 1.73$`, md`$5$`, md`$9$`], 0,
        [null, md`That is $n_2$, the coating's refractive index. Its $\epsilon_r$ is $n_2^2$.`, md`That is the arithmetic mean of 1 and 9. The match needs a geometric mean.`, md`Then the coating is just more glass, and the front face reflects as before.`],
        md`$n_1 = 1$ and $n_3 = 3$, so $n_2 = \sqrt{1\cdot3} = \sqrt3$ and $\epsilon_{r2} = n_2^2 = 3$. Check with impedances: $\eta_2 = \eta_0/\sqrt3$, and $\sqrt{\eta_0\cdot\eta_0/3} = \eta_0/\sqrt3$ ✓.`),
      R(md`
        ### The method

        !!method A circuit with half-wave and quarter-wave sections
          1. **Electrical lengths first.** For each section, $\lambda = v/f$, then $l/\lambda$. Only multiples of $\lambda/4$ use these shortcuts.
          2. **Walk in, from the load.** Half wave: $Z$ unchanged. Quarter wave: $Z \to Z_0^2/Z$, with that section's $Z_0$.
          3. **The divider.** $\tilde I_{in} = \tilde F/(Z_g + Z_{in})$ and $\tilde V_{in} = \tilde FZ_{in}/(Z_g + Z_{in})$.
          4. **Walk out, to the load.** Half wave: flip the signs of $\tilde V$ and $\tilde I$. Quarter wave: the far-end current is $-j/Z_0$ times the near-end voltage, and the far-end voltage is $-jZ_0$ times the near-end current. Ohm's law at the end.
          5. **Check with power.** $\tfrac12|\tilde I_{in}|^2\Re\{Z_{in}\}$ must equal the load's power. If you only need $|\tilde V_L|$, stop after step 3 and use $\sqrt{2R_LP_{in}}$.

        ### Worked example 1: a complex load, the whole circuit

        !!graded Problem
          A source with $\tilde F = 10$ V and $Z_g = 50\ \Omega$ drives a $50\ \Omega$ line that is a quarter wave long at the source frequency. The load is $Z_L = 25 + j25\ \Omega$. Find $Z_{in}$, $\tilde I_{in}$, $\tilde V_{in}$, $\tilde I_L$, $\tilde V_L$ and the power to the load.

        **Step 1: the input impedance.** $2500/25 = 100$, so
        $$Z_{in} = \frac{50^2}{25 + j25} = \frac{100}{1 + j}$$
        Multiply top and bottom by $1 - j$. The bottom becomes $1 + 1 = 2$:
        $$Z_{in} = \frac{100(1 - j)}{2} = 50 - j50\ \Omega$$
        The inductive load ($+j25$) looks capacitive ($-j50$) at the input ✓.

        **Step 2: the input current.** Around the loop, $Z_g + Z_{in} = 100 - j50\ \Omega$:
        $$\tilde I_{in} = \frac{10}{100 - j50}$$
        Multiply top and bottom by $100 + j50$. The bottom becomes $100^2 + 50^2 = 12500$:
        $$\tilde I_{in} = \frac{10(100 + j50)}{12500} = 0.08 + j0.04\ \text{A}$$
        **Step 3: the input voltage.**
        $$\tilde V_{in} = (50 - j50)(0.08 + j0.04)$$
        Multiply out: $4 + j2 - j4 - j^2\,2$. With $j^2 = -1$ the last term is $+2$:
        $$\tilde V_{in} = 6 - j2\ \text{V}$$
        **Step 4: walk to the load.** Equation (3):
        $$\tilde I_L = -j\,\frac{6 - j2}{50} = \frac{-j6 - 2}{50}$$
        $$\tilde I_L = -0.04 - j0.12\ \text{A}$$
        Equation (4):
        $$\tilde V_L = -j50(0.08 + j0.04) = 2 - j4\ \text{V}$$
        Check with Ohm's law: $(25 + j25)(-0.04 - j0.12) = -1 - j3 - j1 + 3 = 2 - j4$ ✓.

        **Step 5: power.** $|\tilde I_{in}|^2 = 0.0064 + 0.0016 = 0.008$, so
        $$P_{in} = \tfrac12(0.008)(50) = 0.2\ \text{W}$$
        At the load, $|\tilde I_L|^2 = 0.0016 + 0.0144 = 0.016$, so $P_L = \tfrac12(0.016)(25) = 0.2$ W ✓.

        ### Worked example 2: design a matcher, then change the frequency

        !!graded Problem
          A $200\ \Omega$ resistive antenna is fed by a source with $\tilde F = 10$ V and $R_g = 50\ \Omega$. Design a quarter-wave section for $f_0 = 300$ MHz, on a line with $v = 2\times10^8$ m/s. Find the power to the antenna at $f_0$ and at $2f_0$.

        **Step 1: the section's impedance.**
        $$Z_0 = \sqrt{50\cdot200} = 100\ \Omega$$
        **Step 2: its length.** The wavelength on the section is
        $$\lambda_0 = \frac{v}{f_0} = \frac{2\times10^8}{3\times10^8} = \tfrac23\ \text{m}$$
        so $l = \lambda_0/4 = 1/6$ m $\approx 16.7$ cm.

        **Step 3: at $f_0$.** $Z_{in} = 100^2/200 = 50\ \Omega$. The divider gives $\tilde V_{in} = 10\cdot50/100 = 5$ V, and
        $$P = \frac{|\tilde V_{in}|^2}{2Z_{in}} = \frac{25}{100} = 0.25\ \text{W}$$
        That is the most this source can ever deliver: a source gives its maximum power when it sees a resistance equal to its own. And without any phasor walk,
        $$|\tilde V_L| = \sqrt{2\cdot200\cdot0.25} = 10\ \text{V}$$
        (The walk agrees: $\tilde I_L = -j5/100 = -j0.05$ A, so $\tilde V_L = -j10$ V.)

        **Step 4: at $2f_0$.** The section is a half wave: $Z_{in} = 200\ \Omega$. The divider gives $\tilde V_{in} = 10\cdot200/250 = 8$ V, and
        $$P = \frac{8^2}{2\cdot200} = 0.16\ \text{W}$$
        That is exactly what the antenna gets with no section at all. Check with reflection: $\Gamma_{in} = 0.6$ sends back $0.36$ of the available $0.25$ W, and $0.25(1 - 0.36) = 0.16$ W ✓.

        ### Worked example 3: three quarters of a wavelength

        !!graded Problem
          A $100\ \Omega$ line is $3\lambda/4$ long and ends in $Z_L = 50\ \Omega$. The source has $\tilde F = 12$ V and $Z_g = 100\ \Omega$. Find $\tilde V_{in}$, $\tilde I_L$ and $\tilde V_L$.

        **Step 1: walk in.** From $d = 0$ to $d = \lambda/2$ is a half wave, so $Z(\lambda/2) = 50\ \Omega$. From $\lambda/2$ to $3\lambda/4$ is a quarter wave:
        $$Z_{in} = \frac{100^2}{50} = 200\ \Omega$$
        **Step 2: the divider.**
        $$\tilde V_{in} = 12\cdot\frac{200}{100 + 200} = 8\ \text{V}$$
        **Step 3: walk out.** From $d = 3\lambda/4$ to $d = \lambda/4$ is a half wave, so the voltage flips:
        $$\tilde V(\lambda/4) = -8\ \text{V}$$
        From $d = \lambda/4$ to the load is a quarter wave. Equation (3), with $\tilde V(\lambda/4)$ as the near-end voltage:
        $$\tilde I_L = -j\,\frac{-8}{100} = j0.08\ \text{A}$$
        **Step 4: Ohm's law.**
        $$\tilde V_L = 50\cdot j0.08 = j4\ \text{V}$$
        **Check.** $P_{in} = 8^2/(2\cdot200) = 0.16$ W, and $P_L = \tfrac12(0.08)^2(50) = 0.16$ W ✓.

        ### Worked example 4: two sections as a transformer

        !!graded Problem
          A source with $\tilde F = 10$ V and $R_g = 25\ \Omega$ must feed a $400\ \Omega$ load. Two quarter-wave sections are used: $Z_{02} = 200\ \Omega$ next to the load and $Z_{01} = 50\ \Omega$ next to the source. Find $Z_{in}$, $\tilde V_{in}$, $\tilde V_L$ and the load power.

        **Step 1: walk in.** At the junction, $Z_m = 200^2/400 = 100\ \Omega$. At the input:
        $$Z_{in} = \frac{50^2}{100} = 25\ \Omega$$
        The same in one step: $(50/200)^2\cdot400 = 400/16 = 25\ \Omega$. It equals $R_g$: matched.

        **Step 2: the divider.** $\tilde V_{in} = 10\cdot25/50 = 5$ V.

        **Step 3: walk out.** The transformer rule gives
        $$\tilde V_L = -\frac{Z_{02}}{Z_{01}}\,\tilde V_{in} = -4\cdot5 = -20\ \text{V}$$
        Step by step: $\tilde I_m = -j5/50 = -j0.1$ A, so $\tilde V_m = Z_m\tilde I_m = -j10$ V. Then $\tilde I_L = -j(-j10)/200 = -0.05$ A, and $\tilde V_L = 400(-0.05) = -20$ V ✓.

        **Step 4: power.** $P_{in} = 5^2/(2\cdot25) = 0.5$ W, and $P_L = 20^2/(2\cdot400) = 0.5$ W ✓. The impedance levels go $25 \to 50 \to 100 \to 200 \to 400$, doubling at each step. A single section would need $\sqrt{25\cdot400} = 100\ \Omega$.

        ### Worked example 5: an anti-reflection coating

        !!graded Problem
          A plane wave in air hits a dielectric with $\epsilon_r = 16$ head-on, at $f = 3$ GHz. Find the reflection coefficient with no coating. Then design a quarter-wave coating, and say what it does at 6 GHz.

        **Step 1: no coating.** $\eta_3 = 120\pi/\sqrt{16} = 30\pi\ \Omega$:
        $$\Gamma = \frac{30\pi - 120\pi}{30\pi + 120\pi} = -\frac{90}{150} = -0.6$$
        So $0.36$ of the incident power reflects.

        **Step 2: the coating's impedance.**
        $$\eta_2 = \sqrt{120\pi\cdot30\pi} = \sqrt{3600\pi^2} = 60\pi\ \Omega$$
        That is $\eta_0/2$, so $n_2 = 2$ and $\epsilon_{r2} = 4$.

        **Step 3: the thickness.** In air $\lambda_0 = c/f = 10$ cm. In the coating $\lambda_2 = \lambda_0/n_2 = 5$ cm. So the coating is $\lambda_2/4 = 1.25$ cm thick.

        **Step 4: at 6 GHz.** The same layer is now half a wavelength thick. A half wave hands over the load unchanged: $Z_w = \eta_3$, and $\Gamma = -0.6$ again, as if the coating were not there.

        ### The whole topic on one table

        | Situation | Result | Where it came from |
        |---|---|---|
        | $\lambda/2$, any $Z_0$ | $Z_{in} = Z_L$; $\tilde V_{in} = -\tilde V_L$, $\tilde I_{in} = -\tilde I_L$ | $e^{\pm j\pi} = -1$ |
        | $\lambda/4$ | $Z_{in} = Z_0^2/Z_L$ | $e^{\pm j\pi/2} = \pm j$ |
        | $\lambda/4$, load to input | $\tilde V_{in} = jZ_0\tilde I_L$, $\tilde I_{in} = j\tilde V_L/Z_0$ | the brackets are $Z_0\tilde I_L$ and $\tilde V_L$ |
        | $\lambda/4$, input to load | $\tilde I_L = -j\tilde V_{in}/Z_0$, $\tilde V_L = -jZ_0\tilde I_{in}$ | divide by $j$ |
        | matching | $Z_0 = \sqrt{R_{in}R_L}$, length $\lambda/4$ at $f_0$ | $Z_0^2/R_L = R_{in}$ |
        | two $\lambda/4$ sections | $Z_{in} = (Z_{01}/Z_{02})^2Z_L$, $\tilde V_{in} = -(Z_{01}/Z_{02})\tilde V_L$ | walk twice |
        | input circuit | $\tilde V_{in} = \tilde FZ_{in}/(Z_g + Z_{in})$ | KVL around the loop |
        | power | $P_{in} = P_L$, so $|\tilde V_L| = \sqrt{2R_LP_{in}}$ | $P(d)$ has no $d$ in it |
        | coating | $\eta_2 = \sqrt{\eta_1\eta_3}$, thickness $\lambda_2/4$ | $\tilde E \leftrightarrow \tilde V$, $\tilde H \leftrightarrow \tilde I$ |

        !!mistake Common mistakes
          - **The half-wave rule on a quarter wave**, or the other way around. Write $l/\lambda$ first.
          - **The free-space wavelength.** $\lambda = v/f$ with the line's own $v$.
          - **$Z_L$ in the divider.** The source sees $Z_{in}$.
          - **Losing the sign of $j$.** Load to input: $+j$. Input to load: $-j$.
          - **Inverting the real and imaginary parts separately.** $Z_0^2/(R + jX)$ needs the conjugate.
          - **The arithmetic mean for matching.** $Z_0 = \sqrt{R_{in}R_L}$, not $(R_{in} + R_L)/2$.
          - **Dropping the minus sign through a half wave.** $\tilde V_{in} = -\tilde V_L$: same size, opposite sign.
          - **Dropping the 2 in power.** These phasors hold peak values: $P = |\tilde V|^2/2R$.
          - **Coating thickness from the free-space wavelength.** It is a quarter of the wavelength in the coating, $\lambda_0/4n_2$.

        !!key Speed tricks
          - Write every length as a count of quarter waves before anything else. Even count: $Z_{in} = Z_L$. Odd count: $Z_{in} = Z_0^2/Z_L$.
          - Normalize for complex loads: $z_{in} = 1/z_L$. With $Z_0 = 50$ and $Z_L = 25 + j25$: $z_L = \tfrac12(1 + j)$, so $z_{in} = 2/(1 + j) = 1 - j$, and $Z_{in} = 50 - j50\ \Omega$.
          - A short at the end of an odd number of quarter waves: no current at the input. An open: no voltage at the input.
          - An ideal source right at a quarter-wave input: $|\tilde I_L| = |\tilde V_{in}|/Z_0$ for every load.
          - Matching pairs to know: $\sqrt{50\cdot200} = 100$, $\sqrt{50\cdot72} = 60$, $\sqrt{75\cdot300} = 150$, $\sqrt{25\cdot100} = 50$.
          - A matched source delivers its maximum, $|\tilde F|^2/(8R_g)$: half of $\tilde F$ lands on the input.
          - At $2f_0$ a quarter-wave matcher is a half wave: the source sees the bare load.
          - Power first, phasors second: $|\tilde V_L| = \sqrt{2R_LP_{in}}$ needs no walk at all.

        ### Check questions
      `),
      Q(md`A $75\ \Omega$ line, shorted at the far end, is a quarter wave long at 100 MHz. A 100 MHz source with internal impedance $Z_g$ is connected to its input. The current into the line is…`,
        [md`zero`, md`$\tilde F/Z_g$, as if the input were shorted`, md`$\tilde F/(Z_g + 75)$`, md`infinite`], 0,
        [null, md`A short at the input needs an even number of quarter waves. One quarter wave turns the short into an open.`, md`That is the matched case. A shorted line is not matched.`, md`Infinite current would need a short at the input. Here the short at the far end has become an open: nothing flows at all.`],
        md`$Z_{in} = Z_0^2/0 = \infty$, so $\tilde I_{in} = \tilde F/(Z_g + \infty) = 0$. Equivalently, (2) gives $\tilde I_{in} = j\tilde V_L/Z_0 = 0$ because the short holds $\tilde V_L = 0$.`),
      Q(md`On a half-wave line, $\tilde V_L = 4\angle30°$ V. Then $\tilde V_{in}$ is…`,
        [md`$4\angle{-150°}$ V`, md`$4\angle30°$ V`, md`$4\angle120°$ V`, md`$4\angle{-60°}$ V`], 0,
        [null, md`That forgets the sign flip. Half a wave is half a cycle: $\tilde V_{in} = -\tilde V_L$.`, md`That turns by $+90°$, the quarter-wave factor $j$. Half a wave turns by $180°$.`, md`That turns by $-90°$. Half a wave turns by $180°$.`],
        md`$\tilde V_{in} = -\tilde V_L$, and $-1 = 1\angle180°$. So $\tilde V_{in} = 4\angle(30° + 180°) = 4\angle210° = 4\angle{-150°}$ V.`),
      Q(md`An ideal 10 V source sits at the input of a $50\ \Omega$ quarter-wave line. The load is changed from $25\ \Omega$ to $100\ \Omega$. The size of the load current…`,
        [md`stays 0.2 A`, md`falls from 0.4 A to 0.1 A`, md`rises from 0.1 A to 0.4 A`, md`is zero both times`], 0,
        [null, md`That is $\tilde V_{in}/Z_L$, as if the load had the full 10 V across it. The line sits in between.`, md`That uses $Z_{in}$ in some form. Equation (3) has no load in it at all.`, md`Even a shorted load gets current here. What vanishes with a short is the *input* current, not the load current.`],
        md`$\tilde I_L = -j\tilde V_{in}/Z_0 = -j0.2$ A for every load: a quarter-wave line driven by a voltage source acts as a current source. Only $\tilde V_L = Z_L\tilde I_L$ changes (from $-j5$ V to $-j20$ V).`),
      Q(md`A $10$ pF capacitor terminates a $50\ \Omega$ line that is a quarter wave long. At that frequency, the input looks like…`,
        [md`an inductor of 25 nH`, md`a capacitor of 10 pF`, md`an inductor of 0.5 nH`, md`a capacitor of 4 fF`], 0,
        [null, md`That is the half-wave rule. A quarter wave turns a capacitor into an inductor.`, md`That is $CZ_0$. The rule is $L_{eq} = CZ_0^2$: one more factor of 50.`, md`That is $C/Z_0^2$, the inductor-to-capacitor rule run the wrong way.`],
        md`$L_{eq} = CZ_0^2 = (10\times10^{-12})(2500) = 25\times10^{-9}$ H $= 25$ nH.`),
      Q(md`A quarter-wave matcher is designed for 100 MHz. Up to 600 MHz, it matches perfectly at…`,
        [md`100, 300 and 500 MHz`, md`100, 200, 300, 400, 500 and 600 MHz`, md`100, 200 and 400 MHz`, md`100 MHz only`], 0,
        [null, md`At 200, 400 and 600 MHz the section is an even number of quarter waves, which hands the bare load to the source.`, md`Doubling the frequency makes it a half wave: the worst case, not a match.`, md`Every odd multiple works: the section is then an odd number of quarter waves.`],
        md`Matching needs an odd number of quarter waves: $f = f_0, 3f_0, 5f_0$. Even multiples give $Z_{in} = R_L$.`),
      Q(md`From the load: a $100\ \Omega$ load, then a half-wave section of $75\ \Omega$, then a quarter-wave section of $50\ \Omega$, then the source. The source sees…`,
        [md`$25\ \Omega$`, md`$56.25\ \Omega$`, md`$100\ \Omega$`, md`$44.4\ \Omega$`], 0,
        [null, md`That uses the half-wave section's $75\ \Omega$ in the inversion. The $75\ \Omega$ drops out; only the quarter-wave section's $Z_0$ inverts.`, md`That ignores the quarter-wave section.`, md`That is $(50/75)^2\cdot100$, the two-quarter-wave transformer rule. A half-wave section is not a quarter-wave section.`],
        md`The half wave hands over $100\ \Omega$ unchanged. The quarter wave inverts it with its own $50\ \Omega$: $2500/100 = 25\ \Omega$.`),
      Q(md`A lossless line of unknown length takes in 1 W. Its load is a $50\ \Omega$ resistor. The load current has size…`,
        [md`0.2 A`, md`0.141 A`, md`0.04 A`, md`It cannot be found without the length`], 0,
        [null, md`That is $\sqrt{P/R_L}$, without the 2 that peak phasors need.`, md`That is $2P/R_L$ without the square root. Its units are $\text{A}^2$.`, md`Power is the same at every point of a lossless line, whatever its length.`],
        md`$P_L = \tfrac12|\tilde I_L|^2R_L = 1$ W, so $|\tilde I_L| = \sqrt{2/50} = 0.2$ A.`),
      Q(md`At the end of a $100\ \Omega$ quarter-wave line, $\tilde V_L = -j20$ V. The input current $\tilde I_{in}$ is…`,
        [md`$0.2$ A`, md`$-0.2$ A`, md`$-j0.2$ A`, md`$-j2000$ A`], 0,
        [null, md`That uses $-j$. Load to input is $+j$: $\tilde I_{in} = +j\tilde V_L/Z_0$.`, md`That is $\tilde V_L/Z_0$ with no $j$. A quarter wave always adds a $\pm90°$ turn.`, md`That multiplies by $Z_0$. A voltage over $Z_0$ is a current.`],
        md`Equation (2): $\tilde I_{in} = j\tilde V_L/Z_0 = j(-j20)/100 = 20/100 = 0.2$ A, since $j(-j) = 1$.`),
      Q(md`A glass slab ($\epsilon_r = 4$) has air on both sides. At a frequency where it is exactly half a wavelength thick (in the glass), the fraction of the power it reflects is…`,
        [md`zero`, md`$1/9$, from the front face`, md`more than $1/9$, since there are two faces`, md`$1/3$`], 0,
        [null, md`That is one bare face, $((1 - 2)/(1 + 2))^2$. The half-wave slab hands the front face $\eta_0$, so nothing reflects.`, md`The two echoes cancel; they do not add.`, md`$1/3$ is the size of $\Gamma$ at one face, $(1 - 2)/(1 + 2)$, not a power, and the slab cancels it anyway.`],
        md`A half-wave layer passes its load straight through: medium 1 sees $Z_w = \eta_0 = \eta_1$, so $\Gamma = 0$. The slab is transparent at this frequency (a radome).`),
      Q(md`Which statement about a lossless quarter-wave line is **false**?`,
        [md`A purely reactive load gives $Z_{in} = Z_L$`, md`$Z_{in}Z_L = Z_0^2$`, md`A short at the load is an open at the input`, md`$\tilde I_L = -j\tilde V_{in}/Z_0$`], 0,
        [null, md`True: that is the boxed result of Section 3.`, md`True: $Z_0^2/0 = \infty$.`, md`True: equation (3).`],
        md`A reactance $jX$ becomes $Z_0^2/(jX) = -jZ_0^2/X$: the sign of the reactance flips, so an inductor looks like a capacitor. $Z_{in} = Z_L$ is the half-wave rule.`),
      R(md`
        ### Practice, level 1: input impedance in one move

        **The trick:** count quarter waves. Even: the load comes through unchanged. Odd: $Z_0^2/Z_L$, with the conjugate for a complex load. Each card asks for one move. Answer in about 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_w6q_zin', { need: 8 }), { id: 'w6-qw.r0' }),
      R(md`
        ### Practice, level 1: across the line, with signs

        **The trick:** load to input, multiply by $+j$; input to load, multiply by $-j$. $Z_0$ turns a current into a voltage. A half wave just flips the sign.
      `),
      Object.assign(G('rf_w6q_vi', { need: 8 }), { id: 'w6-qw.r1' }),
      R(md`
        ### Practice, level 1: matching and frequency

        **The trick:** $Z_0 = \sqrt{R_{in}R_L}$, length $v/4f_0$; it matches at odd multiples of $f_0$ and does nothing at even ones. For coatings, $\eta$ plays $Z_0$.
      `),
      Object.assign(G('rf_w6q_match', { need: 8 }), { id: 'w6-qw.r2' }),
      R(md`
        ### Practice, level 1: the input circuit and power

        **The trick:** the source sees only $Z_{in}$; a divider gives $\tilde V_{in}$; what goes in comes out at the load.
      `),
      Object.assign(G('rf_w6q_power', { need: 8 }), { id: 'w6-qw.r3' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Each problem asks how you would attack it before it shows the answer boxes. Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w6q_circuit', { need: 2 }),
      G('w6q_match', { need: 2 }),
      G('w6q_cascade', { need: 2 }),
      G('w6q_coat', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A line in a circuit, at two frequencies, the way Spring 2018 Problem 4 asks it: find the frequency, the input impedance, the divider, the load, the power, and what changes when the frequency doubles.
      `),
      G('w6q_exam', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- helpers for the generators
  const r3 = (x) => +x.toPrecision(3);
  const zt = (z) => (z === Infinity ? '\\infty' : Cx.of(z).tex());
  const oZ = (z) => `$${zt(z)}\\ \\Omega$`;
  const oC = (z, u) => `$${Cx.of(z).tex()}$ ${u}`;
  const oN = (x, u) => `$${p(r3(x))}$ ${u}`;
  const LEN = { 1: '\\lambda/4', 2: '\\lambda/2', 3: '3\\lambda/4', 4: '\\lambda', 5: '5\\lambda/4', 6: '3\\lambda/2' };
  const ang = (a) => { const x = ((a % 360) + 540) % 360 - 180; return x === -180 ? 180 : x; };
  const jm = Cx.of(0, -1), jp = Cx.of(0, 1);
  const tiny = (x, s) => Math.abs(x) < 1e-9 * Math.max(1, Math.abs(s));
  const T = (part, traps) => Object.assign(part, { traps: traps.map(([v, msg]) => ({ v, msg })) });
  const MHz = (fq) => (fq >= 1e9 ? `${p(fq / 1e9)}\\ \\text{GHz}` : `${p(fq / 1e6)}\\ \\text{MHz}`);
  const len = (m) => (m < 1 ? `${p(r3(m * 100))}\\ \\text{cm}` : `${p(r3(m))}\\ \\text{m}`);

  // ---------------------------------------------------------------- level 1: input impedance
  GENS.rf_w6q_zin = () => one([
    () => {
      const [Z0, RL] = pick([[50, 10], [50, 20], [50, 25], [50, 100], [50, 125], [50, 250], [100, 20], [100, 25], [100, 40], [100, 200], [100, 400], [75, 25], [75, 225], [150, 50], [150, 450], [60, 20], [60, 180], [30, 90]]);
      const n = pick([1, 1, 3, 5]), a = Z0 * Z0 / RL;
      return MC('Odd quarter waves', md`A $${Z0}\ \Omega$ line, $${LEN[n]}$ long, ends in $R_L = ${RL}\ \Omega$. The source sees…`, oZ(a),
        [[oZ(RL), md`That is the half-wave rule. $${LEN[n]}$ is an odd number of quarter waves, which inverts.`], [oZ(r3(RL * RL / Z0)), md`That is $R_L^2/Z_0$, upside down. A matched load must give $Z_0$ back.`], [oZ(Z0), md`Only a matched load shows $Z_0$.`], [oZ(r3(Math.sqrt(Z0 * RL))), md`That is $\sqrt{Z_0R_L}$, the matching recipe, not the input impedance.`]],
        md`${n > 1 ? md`$${LEN[n]}$ is half waves (no change) plus one quarter wave. ` : ''}$Z_{in} = Z_0^2/R_L = ${Z0 * Z0}/${RL} = ${p(a)}\ \Omega$.`);
    },
    () => {
      const Z0 = pick([50, 75, 100, 300]), [R0, X0] = pick([[30, -40], [20, 60], [100, 50], [75, -25], [40, 80], [150, -100]]), n = pick([2, 4, 6]);
      const zl = Cx.of(R0, X0);
      return MC('Half waves', md`A $${Z0}\ \Omega$ line, $${LEN[n]}$ long, ends in $Z_L = ${zl.tex()}\ \Omega$. The source sees…`, oZ(zl),
        [[oZ(Cx.of(Z0 * Z0).div(zl)), md`That is the quarter-wave rule. $${LEN[n]}$ is a whole number of half waves.`], [oZ(zl.scale(-1)), md`$\tilde V$ and $\tilde I$ both flip sign, so their ratio does not.`], [oZ(zl.conj()), md`No conjugate appears: each half wave multiplies $\tilde V$ and $\tilde I$ by the same $-1$.`], [oZ(Z0), md`Only a matched load makes the input look like $Z_0$.`]],
        md`Every half wave hands over the load unchanged, whatever $Z_0$ is: $Z_{in} = Z_L = ${zl.tex()}\ \Omega$.`);
    },
    () => {
      const [Z0, X] = pick([[50, 25], [50, 100], [50, 250], [100, 50], [100, 200], [100, 25], [50, -25], [50, -100], [100, -50], [100, -400]]);
      const a = -Z0 * Z0 / X, kind = X > 0 ? 'an inductor' : 'a capacitor';
      const ox = (v) => `$${Cx.of(0, v).tex()}\\ \\Omega$`;
      return MC('Reactive load', md`A $${Z0}\ \Omega$ quarter-wave line ends in ${kind} whose impedance is $${Cx.of(0, X).tex()}\ \Omega$ at this frequency. The source sees…`, ox(a),
        [[ox(-a), md`That drops $1/j = -j$. The reactance must change sign through a quarter wave.`], [ox(-X), md`That flips the sign but does not invert the size: $Z_0^2/|X| = ${p(Math.abs(a))}$.`], [ox(X), md`That is the half-wave rule.`], [ox(r3(-X * X / Z0)), md`That is $X^2/Z_0$, the fraction upside down.`]],
        md`$Z_{in} = Z_0^2/(jX) = -jZ_0^2/X = ${Cx.of(0, a).tex()}\ \Omega$: ${X > 0 ? 'a capacitor' : 'an inductor'} now.`);
    },
    () => {
      const sh = pick([true, false]), n = pick([1, 2, 3, 4, 5, 6]), Z0 = pick([50, 75, 100]);
      const open = (n % 2 === 1) === sh;
      const A = md`an open circuit, $Z_{in} = \infty$`, B = md`a short circuit, $Z_{in} = 0$`;
      return MC('Shorts and opens', md`A $${Z0}\ \Omega$ line ends in ${sh ? 'a short' : 'an open'} and is $${LEN[n]}$ long. At that frequency the source sees…`, open ? A : B,
        [[open ? B : A, n % 2 ? md`That keeps the end as it is. An odd number of quarter waves swaps short and open.` : md`That swaps the end. An even number of quarter waves is whole half waves, which hand the end over unchanged.`], [md`$${Z0}\ \Omega$`, md`Only a matched load shows $Z_0$. A short or open reflects everything.`], [md`a pure inductance`, md`A short or an open is reactive only between the quarter-wave points, not on them.`], [md`a pure capacitance`, md`A short or an open is reactive only between the quarter-wave points, not on them.`]],
        md`$${LEN[n]}$ is ${n} quarter wave${n > 1 ? 's' : ''}: ${n % 2 ? 'odd, so the end is inverted' : 'even, so the end comes through unchanged'}. ${sh ? 'Short' : 'Open'} becomes ${open ? 'an open' : 'a short'}.`);
    },
    () => {
      const [Z0, R0, X0] = pick([[50, 25, 25], [50, 50, 50], [50, 100, 100], [50, 25, -25], [50, 10, 20], [50, 20, 40], [50, 20, -40], [100, 50, 50], [100, 50, -100], [100, 200, 100], [100, 20, 40], [100, 40, -20]]);
      const zl = Cx.of(R0, X0), a = Cx.of(Z0 * Z0).div(zl);
      return MC('Complex load, quarter wave', md`A $${Z0}\ \Omega$ quarter-wave line ends in $Z_L = ${zl.tex()}\ \Omega$. The source sees…`, oZ(a),
        [[oZ(zl), md`That is the half-wave rule.`], [oZ(a.conj()), md`That keeps the sign of the reactance. Dividing by $R + jX$ multiplies by $R - jX$: the sign flips.`], [oZ(Cx.of(Z0 * Z0 / R0, -Z0 * Z0 / X0)), md`That inverts the real and imaginary parts separately. A fraction over a sum does not split.`], [oZ(zl.conj()), md`That only conjugates. The size must change too: $|Z_{in}| = Z_0^2/|Z_L|$.`]],
        md`Multiply by the conjugate: $Z_0^2(R - jX)/(R^2 + X^2) = ${Z0 * Z0}(${zl.conj().tex()})/${R0 * R0 + X0 * X0} = ${a.tex()}\ \Omega$.`);
    },
    () => {
      const [Z01, Z02, RL] = pick([[100, 50, 100], [50, 100, 100], [50, 200, 400], [100, 200, 200], [150, 50, 50], [50, 100, 200], [200, 100, 50], [100, 50, 25]]);
      const a = (Z01 / Z02) ** 2 * RL;
      return MC('Two quarter-wave sections', md`From the load: $R_L = ${RL}\ \Omega$, then a quarter wave of $${Z02}\ \Omega$, then a quarter wave of $${Z01}\ \Omega$, then the source. The source sees…`, oZ(a),
        [[oZ(RL), md`Two inversions cancel only when the two $Z_0$'s are equal.`], [oZ(Z02 * Z02 / RL), md`That stops after the first section.`], [oZ((Z02 / Z01) ** 2 * RL), md`That walks the sections in the wrong order: the one next to the load inverts first.`], [oZ((Z01 / Z02) * RL), md`That uses the ratio once. Impedances scale with its square.`]],
        md`Junction: $${Z02}^2/${RL} = ${p(Z02 * Z02 / RL)}\ \Omega$. Input: $${Z01}^2/${p(Z02 * Z02 / RL)} = ${p(a)}\ \Omega$, which is $(${Z01}/${Z02})^2\cdot${RL}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: V and I across
  GENS.rf_w6q_vi = () => one([
    () => {
      const V = pick([6, 10, 12, 20, -8]), Z0 = pick([25, 50, 100]), ZL = pick([10, 20, 40, 200]);
      const v = Cx.of(V), a = v.mul(jm).scale(1 / Z0);
      return MC('Input voltage to load current', md`An ideal source holds $\tilde V_{in} = ${V}$ V at the input of a $${Z0}\ \Omega$ quarter-wave line. The load is $${ZL}\ \Omega$. Then $\tilde I_L$ is…`, oC(a, 'A'),
        [[oC(a.scale(-1), 'A'), md`From the input toward the load, multiply by $-j$, not $+j$.`], [oC(v.scale(1 / ZL), 'A'), md`That is $\tilde V_{in}/Z_L$: the load does not have $\tilde V_{in}$ across it.`], [oC(v.mul(jm).scale(1 / ZL), 'A'), md`Equation (3) divides by $Z_0$; the load is not in it.`], [oC(v.scale(1 / Z0), 'A'), md`A quarter wave always turns the phase by $90°$: the $-j$ is missing.`]],
        md`$\tilde I_L = -j\tilde V_{in}/Z_0 = -j(${V}/${Z0}) = ${a.tex()}$ A, whatever the load.`);
    },
    () => {
      const I = pick([Cx.of(0.1), Cx.of(0.2), Cx.of(0, 0.1), Cx.of(-0.05), Cx.of(0, -0.2)]), Z0 = pick([50, 75, 100]), ZL = pick([25, 150, 300]);
      const a = I.mul(jm).scale(Z0);
      return MC('Input current to load voltage', md`At the input of a $${Z0}\ \Omega$ quarter-wave line, $\tilde I_{in} = ${I.tex()}$ A. The load is $${ZL}\ \Omega$. Then $\tilde V_L$ is…`, oC(a, 'V'),
        [[oC(a.scale(-1), 'V'), md`From the input toward the load, multiply by $-j$.`], [oC(I.scale(ZL), 'V'), md`That is $Z_L\tilde I_{in}$, but $\tilde I_{in}$ is not the load current.`], [oC(I.scale(Z0), 'V'), md`The $-j$ is missing: a quarter wave turns the phase by $90°$.`], [oC(I.mul(jm).scale(1 / Z0), 'V'), md`A voltage is a current *times* $Z_0$.`]],
        md`Equation (4): $\tilde V_L = -jZ_0\tilde I_{in} = -j(${Z0})(${I.tex()}) = ${a.tex()}$ V.`);
    },
    () => {
      const A = pick([2, 4, 5, 10]), ph = pick([0, 30, 45, 60, 90, -30, -60, 120]), n = pick([2, 2, 6]);
      const o = (x) => `$${A}\\angle{${ang(x)}°}$ V`;
      return MC('Through a half wave', md`On a line $${LEN[n]}$ long, $\tilde V_L = ${A}\angle{${ph}°}$ V. Then $\tilde V_{in}$ is…`, o(ph + 180),
        [[o(ph), md`That forgets the sign flip: an odd number of half waves gives $\tilde V_{in} = -\tilde V_L$.`], [o(ph + 90), md`That is a quarter-wave turn. A half wave turns by $180°$.`], [o(ph - 90), md`That is a quarter-wave turn. A half wave turns by $180°$.`], [o(-ph), md`That conjugates. A half wave multiplies by $-1$.`]],
        md`$${LEN[n]}$ is an odd number of half waves, so $\tilde V_{in} = -\tilde V_L = ${A}\angle{${ang(ph + 180)}°}$ V.`);
    },
    () => {
      const I = pick([Cx.of(0, -0.2), Cx.of(0.1), Cx.of(0, 0.05), Cx.of(-0.4)]), Z0 = pick([50, 100]), ZL = pick([20, 75, 300]);
      const a = I.mul(jp).scale(Z0);
      return MC('Load current to input voltage', md`At the load of a $${Z0}\ \Omega$ quarter-wave line, $\tilde I_L = ${I.tex()}$ A, and $Z_L = ${ZL}\ \Omega$. Then $\tilde V_{in}$ is…`, oC(a, 'V'),
        [[oC(a.scale(-1), 'V'), md`From the load toward the input, multiply by $+j$.`], [oC(I.scale(ZL), 'V'), md`That is $\tilde V_L$, the voltage at the other end.`], [oC(I.scale(Z0), 'V'), md`The $j$ is missing.`], [oC(I.mul(jp).scale(1 / Z0), 'V'), md`A voltage is a current *times* $Z_0$.`]],
        md`Equation (1): $\tilde V_{in} = jZ_0\tilde I_L = j(${Z0})(${I.tex()}) = ${a.tex()}$ V.`);
    },
    () => {
      const V = pick([Cx.of(0, -20), Cx.of(10), Cx.of(-5), Cx.of(0, 8)]), Z0 = pick([50, 100]), ZL = pick([25, 200]);
      const a = V.mul(jp).scale(1 / Z0);
      return MC('Load voltage to input current', md`At the load of a $${Z0}\ \Omega$ quarter-wave line, $\tilde V_L = ${V.tex()}$ V ($Z_L = ${ZL}\ \Omega$). Then $\tilde I_{in}$ is…`, oC(a, 'A'),
        [[oC(a.scale(-1), 'A'), md`From the load toward the input, multiply by $+j$.`], [oC(V.scale(1 / Z0), 'A'), md`The $j$ is missing.`], [oC(V.scale(1 / ZL), 'A'), md`That is $\tilde I_L$, the current at the other end.`], [oC(V.mul(jp).scale(Z0), 'A'), md`A current is a voltage *over* $Z_0$.`]],
        md`Equation (2): $\tilde I_{in} = j\tilde V_L/Z_0 = j(${V.tex()})/${Z0} = ${a.tex()}$ A.`);
    },
    () => {
      const V = pick([6, 8, 10, 12]), Z0 = pick([50, 100]);
      const a = Cx.of(0, V / Z0);
      return MC('Three quarter waves', md`An ideal source holds $\tilde V_{in} = ${V}$ V at the input of a $${Z0}\ \Omega$ line that is $3\lambda/4$ long. Then $\tilde I_L$ is…`, oC(a, 'A'),
        [[oC(a.scale(-1), 'A'), md`That treats it as one quarter wave. The extra half wave flips the sign first.`], [oC(-V / Z0, 'A'), md`The quarter-wave step brings a $j$.`], [oC(V / Z0, 'A'), md`The quarter-wave step brings a $j$, and the half wave a sign.`], [oC(Cx.of(0, V / Z0 / 2), 'A'), md`Nothing halves the current. The half wave flips signs only.`]],
        md`Half wave from $d = 3\lambda/4$ to $\lambda/4$: $\tilde V(\lambda/4) = -${V}$ V. Quarter wave to the load: $\tilde I_L = -j(-${V})/${Z0} = ${a.tex()}$ A.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: matching and frequency
  const MATCH = [[50, 200, 100], [50, 18, 30], [50, 72, 60], [50, 32, 40], [50, 450, 150], [50, 8, 20], [25, 100, 50], [25, 400, 100], [75, 300, 150], [75, 12, 30], [100, 25, 50], [100, 400, 200], [36, 100, 60]];
  GENS.rf_w6q_match = () => one([
    () => {
      const [Ri, RL, Z0] = pick(MATCH);
      return MC('The matching Z0', md`A quarter-wave section must make $R_L = ${RL}\ \Omega$ look like $${Ri}\ \Omega$. Its $Z_0$ is…`, oZ(Z0),
        [[oZ((Ri + RL) / 2), md`That is the arithmetic mean. The match needs $\sqrt{R_{in}R_L}$.`], [oZ(Ri * RL), md`That forgets the square root (its units are $\Omega^2$).`], [oZ(r3(Ri * Ri / RL)), md`That is what a $${Ri}\ \Omega$ section would show the source, not the $Z_0$ you need.`], [oZ(r3(Ri * RL / (Ri + RL))), md`That is the two resistors in parallel. No parallel connection here.`]],
        md`$Z_0 = \sqrt{${Ri}\cdot${RL}} = \sqrt{${Ri * RL}} = ${Z0}\ \Omega$. Check: $${Z0}^2/${RL} = ${Ri}\ \Omega$ ✓.`);
    },
    () => {
      const v = pick([3e8, 2e8, 1.5e8, 1e8]), f0 = pick([50e6, 100e6, 150e6, 250e6, 500e6, 1e9]);
      const lam = v / f0;
      return MC('Section length', md`A quarter-wave matcher for $f_0 = ${MHz(f0)}$ is built on a line with $v = ${p(v)}$ m/s. Its length is…`, `$${len(lam / 4)}$`,
        [[`$${len(lam)}$`, md`That is a whole wavelength.`], [`$${len(lam / 2)}$`, md`That is a half wave: it would hand the bare load through.`], [`$${len(3e8 / f0 / 4)}$`, md`That uses the free-space speed. The wavelength on the line is $v/f$.`], [`$${len(lam / 8)}$`, md`That is an eighth of a wavelength.`]],
        md`$\lambda = v/f_0 = ${len(lam)}$, so $l = \lambda/4 = ${len(lam / 4)}$.`);
    },
    () => {
      const f0 = pick([100e6, 200e6, 300e6, 500e6, 1e9]);
      return MC('Where else it works', md`A quarter-wave matcher is designed for $f_0 = ${MHz(f0)}$. Above $f_0$, the next frequency at which the same section matches perfectly is…`, `$${MHz(3 * f0)}$`,
        [[`$${MHz(2 * f0)}$`, md`There the section is a half wave: the source sees the bare load.`], [`$${MHz(4 * f0)}$`, md`There it is a whole wavelength: again the bare load.`], [`$${MHz(1.5 * f0)}$`, md`There it is $3\lambda/8$: only partly matched.`]],
        md`It needs an odd number of quarter waves: $f_0, 3f_0, 5f_0, \ldots$ The next is $3f_0 = ${MHz(3 * f0)}$.`);
    },
    () => {
      const [Ri, RL, Z0] = pick(MATCH);
      return MC('At twice the frequency', md`A $${Z0}\ \Omega$ quarter-wave section matches $R_L = ${RL}\ \Omega$ to $${Ri}\ \Omega$ at $f_0$. At $2f_0$ the source sees…`, oZ(RL),
        [[oZ(Ri), md`At $2f_0$ the section is a half wave, not a quarter wave.`], [oZ(Z0), md`Only a matched load shows the line's $Z_0$.`], [md`$0\ \Omega$`, md`A half-wave line repeats its load; it does not short it.`], [oZ(r3(Ri * Ri / RL)), md`That inverts about $${Ri}\ \Omega$. A half wave does not invert at all.`]],
        md`At $2f_0$, $\beta l = \pi$: a half wave hands over the load unchanged, $Z_{in} = ${RL}\ \Omega$.`);
    },
    () => {
      const [Ri, RL, Z0] = pick(MATCH), G2 = (RL - Ri) / (RL + Ri), st = (Z0 - Ri) / (Z0 + Ri);
      const o = (x) => `$${TL.frac(x)}$`;
      return MC('Reflection at twice the frequency', md`A $${Z0}\ \Omega$ quarter-wave section matches $R_L = ${RL}\ \Omega$ to a $${Ri}\ \Omega$ system at $f_0$. At $2f_0$, the reflection coefficient at its input is…`, o(G2),
        [[md`$0$`, md`That is $f_0$. At $2f_0$ the section is a half wave.`], [o(st), md`That is only the first step, $${Ri} \to ${Z0}$. At $2f_0$ the source sees the whole load.`], [o(-G2), md`Sign: $\Gamma = (Z_{in} - R_{in})/(Z_{in} + R_{in})$ with $Z_{in} = ${RL}\ \Omega$.`], [o(G2 * G2), md`That is $|\Gamma|^2$, the reflected power fraction.`]],
        md`$Z_{in} = R_L$ at $2f_0$, so $\Gamma_{in} = (${RL} - ${Ri})/(${RL} + ${Ri}) = ${TL.frac(G2)}$, as if there were no section.`);
    },
    () => {
      const [e1, e3] = pick([[1, 4], [1, 9], [1, 16], [1, 25], [1, 36], [1, 64], [1, 81], [4, 16], [4, 9], [9, 16]]);
      const e2 = Math.sqrt(e1 * e3);
      return MC('Coating permittivity', md`Medium 1 has $\epsilon_r = ${e1}$, medium 3 has $\epsilon_r = ${e3}$ (both nonmagnetic). A quarter-wave coating between them needs $\epsilon_r =$…`, `$${p(r3(e2))}$`,
        [[`$${p(r3(Math.sqrt(e2)))}$`, md`That is $n_2$, the coating's index. $\epsilon_{r2} = n_2^2$.`], [`$${p((e1 + e3) / 2)}$`, md`That is the arithmetic mean. It needs a geometric mean.`], [`$${e3}$`, md`That is medium 3 itself: then the front face reflects as before.`], [`$${e1 * e3}$`, md`That forgets the square root.`]],
        md`$\eta_2 = \sqrt{\eta_1\eta_3}$ means $n_2 = \sqrt{n_1n_3}$, so $\epsilon_{r2} = n_2^2 = \sqrt{\epsilon_{r1}\epsilon_{r3}} = \sqrt{${e1 * e3}} = ${p(r3(e2))}$.`);
    },
    () => {
      const er = pick([4, 9, 16, 2.25]), fq = pick([1e9, 2e9, 3e9, 5e9, 10e9]), n = Math.sqrt(er), l0 = 3e8 / fq;
      const mm = (x) => `$${p(r3(x * 1000))}$ mm`;
      return MC('Coating thickness', md`A quarter-wave coating with $\epsilon_r = ${er}$ is designed for $${MHz(fq)}$. Its thickness is…`, mm(l0 / (4 * n)),
        [[mm(l0 / 4), md`That is a quarter of the free-space wavelength. The wave inside is shorter by $n = ${p(n)}$.`], [mm(l0 / (2 * n)), md`That is a half wave: it would hand the bare surface through.`], [mm(l0 / (4 * er)), md`That divides by $\epsilon_r$. The wavelength shrinks by $n = \sqrt{\epsilon_r}$.`], [mm(l0 / n), md`That is a whole wavelength in the coating.`]],
        md`$\lambda_0 = c/f = ${p(r3(l0 * 1000))}$ mm, $\lambda_2 = \lambda_0/${p(n)}$, thickness $\lambda_2/4 = ${p(r3(l0 / (4 * n) * 1000))}$ mm.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: input circuit and power
  GENS.rf_w6q_power = () => one([
    () => {
      for (;;) {
        const F = pick([6, 9, 10, 12, 20]), Zg = pick([25, 50, 100]), Z0 = pick([50, 100]), RL = pick([25, 50, 100, 200, 400]);
        if (RL === Z0) continue;
        const Zi = Z0 * Z0 / RL, a = F * Zi / (Zg + Zi);
        return MC('The divider', md`A source with $\tilde F = ${F}$ V and $Z_g = ${Zg}\ \Omega$ drives a $${Z0}\ \Omega$ quarter-wave line ending in $${RL}\ \Omega$. Then $\tilde V_{in}$ is…`, oN(a, 'V'),
          [[oN(F * RL / (Zg + RL), 'V'), md`That puts $Z_L$ in the divider. The source sees $Z_{in} = ${p(Zi)}\ \Omega$.`], [oN(F * Z0 / (Zg + Z0), 'V'), md`That puts $Z_0$ in the divider. Only a matched load shows $Z_0$.`], [oN(F * Zg / (Zg + Zi), 'V'), md`That is the divider upside down: the drop across $Z_g$.`], [oN(F, 'V'), md`That forgets the drop across $Z_g$.`]],
          md`$Z_{in} = ${Z0 * Z0}/${RL} = ${p(Zi)}\ \Omega$, then $\tilde V_{in} = ${F}\cdot${p(Zi)}/(${Zg} + ${p(Zi)}) = ${p(r3(a))}$ V.`);
      }
    },
    () => {
      const [F, Zg, Ri] = pick([[10, 50, 150], [12, 100, 200], [10, 25, 100], [6, 50, 100], [20, 100, 300], [9, 50, 25]]);
      const P = 0.5 * F * F * Ri / (Zg + Ri) ** 2;
      return MC('Power into the line', md`A source with $\tilde F = ${F}$ V and $Z_g = ${Zg}\ \Omega$ sees $Z_{in} = ${Ri}\ \Omega$ at a lossless line. The line delivers to its load…`, oN(P, 'W'),
        [[oN(2 * P, 'W'), md`That forgets the $\tfrac12$ of peak phasors.`], [oN(F * F / (2 * Ri), 'W'), md`That puts all of $\tilde F$ across $Z_{in}$; $Z_g$ takes a share.`], [oN(0.5 * F * F / (Zg + Ri), 'W'), md`That is the power in $Z_g$ and $Z_{in}$ together.`], [oN(0.5 * F * F * Zg / (Zg + Ri) ** 2, 'W'), md`That is the power burned in $Z_g$, not delivered to the line.`]],
        md`$|\tilde I_{in}| = ${F}/${Zg + Ri}$ A, so $P = \tfrac12|\tilde I_{in}|^2(${Ri}) = ${p(r3(P))}$ W. All of it reaches the load.`);
    },
    () => {
      const [RL, P] = pick([[50, 0.25], [50, 1], [100, 0.5], [200, 0.25], [18, 1], [8, 1], [72, 0.25], [50, 0.16], [200, 0.16], [100, 0.08]]);
      const a = Math.sqrt(2 * RL * P);
      return MC('Load voltage from power', md`A lossless line takes in $${P}$ W and ends in $R_L = ${RL}\ \Omega$. The size of the load voltage is…`, oN(a, 'V'),
        [[oN(Math.sqrt(RL * P), 'V'), md`That leaves out the 2: $P = |\tilde V|^2/2R$.`], [oN(2 * RL * P, 'V'), md`That forgets the square root.`], [oN(Math.sqrt(2 * P / RL), 'V'), md`That is the load *current*.`], [md`It depends on the line's length`, md`Power is the same at every point of a lossless line.`]],
        md`$|\tilde V_L| = \sqrt{2R_LP} = \sqrt{2\cdot${RL}\cdot${P}} = ${p(r3(a))}$ V.`);
    },
    () => {
      const P = pick([2, 3, 4, 8]), G = pick([0.5, 0.2, 0.6]);
      return MC('Power reaches the load', md`A lossless line of length $0.37\lambda$ ends in a load with $|\Gamma_L| = ${G}$. The line takes in $P_{in} = ${P}$ W. The load absorbs…`, oN(P, 'W'),
        [[oN(P * (1 - G * G), 'W'), md`That removes the reflected power twice. $P_{in}$ is already incident minus reflected.`], [oN(P * G * G, 'W'), md`That is a reflected-power fraction, not what the load keeps.`], [oN(P / 2, 'W'), md`Nothing halves the power on a lossless line.`], [md`It depends on the length`, md`$P(d)$ has no $d$ in it.`]],
        md`$P(d) = |V^+|^2/2Z_0 - |V^-|^2/2Z_0$ is the same at every $d$, so $P_L = P_{in} = ${P}$ W.`);
    },
    () => {
      const [RL, P] = pick([[50, 1], [8, 1], [200, 1], [32, 0.16], [2, 1], [50, 0.25], [18, 0.09]]);
      const a = Math.sqrt(2 * P / RL);
      return MC('Load current from power', md`A lossless line takes in $${P}$ W and ends in $R_L = ${RL}\ \Omega$. The size of the load current is…`, oN(a, 'A'),
        [[oN(Math.sqrt(P / RL), 'A'), md`That leaves out the 2 of peak phasors.`], [oN(2 * P / RL, 'A'), md`That forgets the square root.`], [oN(Math.sqrt(2 * RL * P), 'A'), md`That is the load *voltage*.`], [oN(P / RL, 'A'), md`That is $P/R_L$: it has units of $	ext{A}^2$, and it is missing the 2 and the square root.`]],
        md`$P = \tfrac12|\tilde I_L|^2R_L$, so $|\tilde I_L| = \sqrt{2P/R_L} = ${p(r3(a))}$ A.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2
  const planWalk = {
    q: md`Before any numbers: what is the first move?`,
    opts: [md`Replace the line and load by $Z_{in}$ (walking in from the load), then use the divider`, md`Use the divider with $Z_L$`, md`Find $V^+$ and $V^-$ from $\Gamma_L$ first`, md`Draw the bounce diagram`], a: 0,
    why: [null, md`The source sees $Z_{in}$, not $Z_L$: the line sits in between.`, md`That works but is slow. On quarter and half waves, $Z_{in}$ and the divider take two lines.`, md`Bounce diagrams are for switched (time-domain) sources. This is sinusoidal steady state.`],
    move: md`Walk in: half wave keeps $Z$, quarter wave inverts it. Divider for $\tilde V_{in}$. Walk out with $-j$ rules.`,
  };
  GENS.w6q_circuit = () => {
    for (;;) {
      const Z0 = pick([50, 100]);
      const [R0, X0] = pick(Z0 === 50 ? [[25, 25], [50, 50], [100, 100], [25, -25], [50, -50], [10, 20], [20, 40], [20, -40], [40, 30], [40, -30]] : [[50, 50], [100, 100], [50, -50], [60, 80], [80, -60], [20, 40], [40, -20], [200, 200]]);
      const F = pick([5, 10, 20]), Zg = pick([Z0, Z0, Z0 / 2, 2 * Z0]);
      const zl = Cx.of(R0, X0), zi = Cx.of(Z0 * Z0).div(zl), Ii = Cx.of(F).div(zi.add(Zg)), Vi = zi.mul(Ii);
      const IL = Vi.mul(jm).scale(1 / Z0), VL = Ii.mul(jm).scale(Z0), P = 0.5 * Ii.abs() ** 2 * zi.re;
      if ([zi.re, zi.im, Vi.re, Vi.im].some((x) => tiny(x, F))) continue;
      const Vw = Cx.of(F).mul(zl).div(zl.add(Zg));
      return {
        title: 'A quarter-wave line in a circuit',
        q: md`A source with $\tilde F = ${F}$ V and $Z_g = ${Zg}\ \Omega$ drives a $${Z0}\ \Omega$ line that is a quarter wave long at the source frequency. The load is $Z_L = ${zl.tex()}\ \Omega$. Find $Z_{in}$, $\tilde V_{in}$, the size of the load current, and the power to the load.`,
        plan: planWalk,
        parts: [
          T(N('\\text{Re}\\,Z_{in}', zi.re, 'Ω'), [[R0, 'That is the load itself: the half-wave rule.'], [Z0 * Z0 / R0, 'That inverts the real part alone. Use the conjugate.']]),
          T(N('\\text{Im}\\,Z_{in}', zi.im, 'Ω'), [[-zi.im, 'Sign: dividing by R + jX flips the sign of the reactance.']]),
          T(N('\\text{Re}\\,\\tilde V_{in}', Vi.re, 'V'), [[Vw.re, 'That puts Z_L in the divider. The source sees Z_in.']]),
          N('\\text{Im}\\,\\tilde V_{in}', Vi.im, 'V'),
          T(N('|\\tilde I_L|', IL.abs(), 'A'), [[Vi.abs() / zl.abs(), 'That is |V_in|/|Z_L|. The load does not have V_in across it; use I_L = −jV_in/Z0.']]),
          T(N('P_L', P, 'W'), [[2 * P, 'Missing the ½ of peak phasors.']]),
        ],
        hints: [md`$Z_{in} = Z_0^2/Z_L$: multiply top and bottom by the conjugate of $Z_L$.`, md`$\tilde V_{in} = \tilde FZ_{in}/(Z_g + Z_{in})$, then $\tilde I_L = -j\tilde V_{in}/Z_0$.`],
        sol: md`
          **Step 1: walk in.** Multiply by the conjugate; $|Z_L|^2 = ${R0 * R0 + X0 * X0}$:
          $$Z_{in} = \frac{${Z0 * Z0}(${zl.conj().tex()})}{${R0 * R0 + X0 * X0}} = ${zi.tex()}\ \Omega$$
          **Step 2: the loop current.** $Z_g + Z_{in} = ${zi.add(Zg).tex()}\ \Omega$:
          $$\tilde I_{in} = \frac{${F}}{${zi.add(Zg).tex()}} = ${Ii.tex()}\ \text{A}$$
          **Step 3: the input voltage.**
          $$\tilde V_{in} = Z_{in}\tilde I_{in} = ${Vi.tex()}\ \text{V}$$
          **Step 4: walk out.** Equation (3):
          $$\tilde I_L = -j\,\frac{\tilde V_{in}}{${Z0}} = ${IL.tex()}\ \text{A}$$
          so $|\tilde I_L| = ${f(IL.abs())}$ A. (Equation (4) gives $\tilde V_L = -jZ_0\tilde I_{in} = ${VL.tex()}$ V; check: $Z_L\tilde I_L = ${zl.mul(IL).tex()}$ V ✓.)

          **Step 5: power.**
          $$P = \tfrac12|\tilde I_{in}|^2\,\Re\{Z_{in}\} = ${f(P)}\ \text{W}$$
          and at the load $\tfrac12|\tilde I_L|^2R_L = ${f(0.5 * IL.abs() ** 2 * R0)}$ W ✓.
        `,
      };
    }
  };

  GENS.w6q_match = () => {
    const [Ri, RL, Z0] = pick(MATCH), F = pick([4, 6, 10, 20]);
    const v = pick([3e8, 2e8, 1.5e8]), f0 = pick([100e6, 150e6, 200e6, 250e6, 300e6, 500e6]);
    const l = v / f0 / 4, P1 = F * F / (8 * Ri), G2 = (RL - Ri) / (RL + Ri), P2 = 0.5 * F * F * RL / (Ri + RL) ** 2;
    return {
      title: 'Design a matcher, then double the frequency',
      q: md`A resistive load $R_L = ${RL}\ \Omega$ is fed by a source with $\tilde F = ${F}$ V and $R_g = ${Ri}\ \Omega$. You insert a quarter-wave section for $f_0 = ${MHz(f0)}$ on a line with $v = ${p(v)}$ m/s. Find the section's $Z_0$ and length, the load power at $f_0$, and at $2f_0$ the reflection coefficient at the input and the load power.`,
      plan: { q: md`Before any numbers: what sets $Z_0$?`, opts: [md`$Z_0^2/R_L = R_g$, so $Z_0 = \sqrt{R_gR_L}$`, md`$Z_0 = (R_g + R_L)/2$`, md`$Z_0 = R_L$`, md`$Z_0 = R_g$`], a: 0,
        why: [null, md`The arithmetic mean does not make $Z_0^2/R_L$ equal $R_g$.`, md`A section equal to the load reflects at its front face.`, md`Then the input is $R_g^2/R_L$, not $R_g$.`], move: md`Geometric mean. Then $l = v/4f_0$, and at $2f_0$ the section is a half wave.` },
      parts: [
        T(N('Z_0', Z0, 'Ω'), [[(Ri + RL) / 2, 'That is the arithmetic mean. Use √(R_g R_L).']]),
        T(N('l\\ \\text{(in cm)}', l * 100, 'cm'), [[v / f0 * 100, 'That is a whole wavelength.'], [v / f0 / 2 * 100, 'That is a half wave.']]),
        T(N('P_L\\ \\text{at}\\ f_0', P1, 'W'), [[F * F / (2 * Ri), 'That puts all of F across the input. Half of it is across R_g.']]),
        T(N('\\Gamma_{in}\\ \\text{at}\\ 2f_0', G2, ''), [[-G2, 'Sign: Γ = (Z_in − R_g)/(Z_in + R_g) with Z_in = R_L.']]),
        T(N('P_L\\ \\text{at}\\ 2f_0', P2, 'W'), [[P1, 'At 2f0 the section is a half wave: no longer matched.']]),
      ],
      hints: [md`$Z_0 = \sqrt{R_gR_L}$ and $l = v/(4f_0)$.`, md`At $2f_0$ the section is a half wave, so the source sees $R_L$.`],
      sol: md`
        **Step 1: impedance.** $Z_0 = \sqrt{${Ri}\cdot${RL}} = ${Z0}\ \Omega$.

        **Step 2: length.** $\lambda_0 = v/f_0 = ${len(v / f0)}$, so $l = \lambda_0/4 = ${len(l)}$.

        **Step 3: at $f_0$.** $Z_{in} = ${Z0}^2/${RL} = ${Ri}\ \Omega = R_g$, so $\tilde V_{in} = \tilde F/2 = ${p(F / 2)}$ V and
        $$P = \frac{(${p(F / 2)})^2}{2\cdot${Ri}} = ${f(P1)}\ \text{W}$$
        the most this source can give, $|\tilde F|^2/8R_g$.

        **Step 4: at $2f_0$.** The section is a half wave: $Z_{in} = R_L = ${RL}\ \Omega$.
        $$\Gamma_{in} = \frac{${RL} - ${Ri}}{${RL} + ${Ri}} = ${f(G2)}$$
        Divider: $\tilde V_{in} = ${F}\cdot${RL}/${Ri + RL} = ${f(F * RL / (Ri + RL))}$ V, so $P = |\tilde V_{in}|^2/(2\cdot${RL}) = ${f(P2)}$ W.
        **Check:** $${f(P1)}(1 - ${f(G2 * G2)}) = ${f(P1 * (1 - G2 * G2))}$ W ✓.
      `,
    };
  };

  GENS.w6q_cascade = () => {
    for (;;) {
      const kind = pick(['qq', 'hq', 'qh', 'hh']);
      const Za = pick([50, 75, 100, 200]), Zb = pick([25, 50, 100, 150]), RL = pick([25, 50, 100, 200, 400]);
      if (Za === Zb) continue;
      const Rg = pick([25, 50, 100]), F = pick([6, 10, 12, 20]);
      // section a next to the load, section b next to the source
      const inv = (Z0, Z) => Z0 * Z0 / Z;
      const Zm = kind[0] === 'q' ? inv(Za, RL) : RL, Zi = kind[1] === 'q' ? inv(Zb, Zm) : Zm;
      if (Zi < 5 || Zi > 2000) continue;
      const Vi = F * Zi / (Rg + Zi);
      const step = (k, Z0, V, Zfar) => { if (k === 'h') return Cx.of(V).scale(-1); const I = Cx.of(V).mul(jm).scale(1 / Z0); return I.scale(Zfar); };
      const Vm = step(kind[1], Zb, Vi, Zm), VL = step(kind[0], Za, Vm, RL);
      const phs = Math.round(ang(VL.arg() * 180 / PI)), opts = [0, 90, 180, -90], P = Vi * Vi / (2 * Zi);
      const nm = { q: 'quarter-wave', h: 'half-wave' };
      return {
        title: 'Sections in a row',
        q: md`From the load: $R_L = ${RL}\ \Omega$, then a ${nm[kind[0]]} section of $${Za}\ \Omega$, then a ${nm[kind[1]]} section of $${Zb}\ \Omega$, then a source with $\tilde F = ${F}$ V and $Z_g = ${Rg}\ \Omega$. Find the impedance at the junction, $Z_{in}$, $\tilde V_{in}$, the load voltage (size and phase) and the load power.`,
        plan: planWalk,
        parts: [
          T(N('Z_m\\ \\text{(junction)}', Zm, 'Ω'), [[kind[0] === 'q' ? RL : inv(Za, RL), kind[0] === 'q' ? 'A quarter wave inverts.' : 'A half wave hands the load over unchanged.']]),
          T(N('Z_{in}', Zi, 'Ω'), [[kind[1] === 'q' ? Zm : inv(Zb, Zm), kind[1] === 'q' ? 'The source-side quarter wave inverts again.' : 'A half wave changes nothing, whatever its Z0.']]),
          N('\\tilde V_{in}', Vi, 'V'),
          N('|\\tilde V_L|', VL.abs(), 'V'),
          { lbl: md`the phase of $\tilde V_L$`, mc: opts.map((x) => `$${x}°$`), a: opts.indexOf(phs), fixed: true, why: opts.map((x) => (x === phs ? null : md`Track each step: a half wave multiplies by $-1$ ($180°$), a quarter wave toward the load by $-j$ ($-90°$), with real impedances in between.`)) },
          T(N('P_L', P, 'W'), [[2 * P, 'Missing the ½.']]),
        ],
        hints: [md`Walk in from the load: quarter wave $Z \to Z_0^2/Z$ with that section's $Z_0$; half wave: no change.`, md`Walk out: half wave flips the sign; quarter wave: far-end current $= -j\times$ near-end voltage$/Z_0$.`],
        sol: md`
          **Step 1: walk in.** The ${nm[kind[0]]} section next to the load: $Z_m = ${kind[0] === 'q' ? md`${Za}^2/${RL} = ` : ''}${p(r3(Zm))}\ \Omega$. The ${nm[kind[1]]} section: $Z_{in} = ${kind[1] === 'q' ? md`${Zb}^2/${p(r3(Zm))} = ` : ''}${p(r3(Zi))}\ \Omega$.

          **Step 2: divider.**
          $$\tilde V_{in} = ${F}\cdot\frac{${p(r3(Zi))}}{${Rg} + ${p(r3(Zi))}} = ${f(Vi)}\ \text{V}$$
          **Step 3: walk out.** Through the source-side ${nm[kind[1]]} section: $\tilde V_m = ${Vm.tex()}$ V${kind[1] === 'q' ? md` (from $\tilde I_m = -j\tilde V_{in}/${Zb}$ and $\tilde V_m = Z_m\tilde I_m$)` : ' (the sign flips)'}. Through the load-side ${nm[kind[0]]} section: $\tilde V_L = ${VL.tex()}$ V${kind[0] === 'q' ? md` (from $\tilde I_L = -j\tilde V_m/${Za}$ and $\tilde V_L = R_L\tilde I_L$)` : ' (the sign flips)'}. So $|\tilde V_L| = ${f(VL.abs())}$ V at $${phs}°$.

          **Step 4: power.** $P = |\tilde V_{in}|^2/(2Z_{in}) = ${f(P)}$ W. Check: $|\tilde V_L|^2/(2R_L) = ${f(VL.abs() ** 2 / (2 * RL))}$ W ✓.
        `,
      };
    }
  };

  GENS.w6q_coat = () => {
    const er3 = pick([4, 9, 16, 25, 36, 64, 81]), fq = pick([1e9, 2e9, 3e9, 5e9, 10e9]);
    const n3 = Math.sqrt(er3), n2 = Math.sqrt(n3), er2 = n3, eta2 = 120 * PI / n2, t = 3e8 / fq / (4 * n2), G = (1 - n3) / (1 + n3);
    return {
      title: 'An anti-reflection coating',
      q: md`A plane wave in air hits a nonmagnetic dielectric with $\epsilon_r = ${er3}$ head-on. Design a quarter-wave coating for $f = ${MHz(fq)}$: its $\eta$, its $\epsilon_r$, its thickness. Then find the reflection coefficient of the bare surface, and the fraction of power the coated surface reflects at $2f$.`,
      plan: { q: md`Before any numbers: which line idea is this?`, opts: [md`A quarter-wave matcher: $\eta_2 = \sqrt{\eta_1\eta_3}$, thickness $\lambda_2/4$`, md`A half-wave section: thickness $\lambda_2/2$`, md`A shorted stub`, md`A bounce diagram`], a: 0,
        why: [null, md`A half-wave layer passes the bare surface straight through: nothing changes.`, md`No short here: medium 3 is a resistive "load" $\eta_3$.`, md`This is a single frequency, so phasors, not bounces.`], move: md`$\eta \leftrightarrow Z_0$: the layer is a quarter-wave matcher between $\eta_1$ and $\eta_3$.` },
      parts: [
        T(N('\\eta_2', eta2, 'Ω'), [[(120 * PI + 120 * PI / n3) / 2, 'That is the arithmetic mean. Use √(η1η3).']]),
        T(N('\\epsilon_{r2}', er2, ''), [[n2, 'That is n2. εr = n².']]),
        T(N('\\text{thickness (mm)}', t * 1000, 'mm'), [[3e8 / fq / 4 * 1000, 'That uses the free-space wavelength.']]),
        T(N('\\Gamma\\ \\text{(bare surface)}', G, ''), [[-G, 'Sign: Γ = (η3 − η1)/(η3 + η1), and η3 < η1.']]),
        T(N('|\\Gamma|^2\\ \\text{at}\\ 2f\\ \\text{(coated)}', G * G, ''), [[Math.abs(G), 'That is |Γ|. Power goes as its square.']]),
      ],
      hints: [md`$\eta_3 = 120\pi/${p(n3)}$; $\eta_2 = \sqrt{\eta_1\eta_3}$, so $n_2 = \sqrt{n_3}$.`, md`At $2f$ the layer is a half wave: the surface looks bare.`],
      sol: md`
        **Step 1: impedances.** $n_3 = \sqrt{${er3}} = ${p(n3)}$, so $\eta_3 = 120\pi/${p(n3)}$.
        $$\eta_2 = \sqrt{120\pi\cdot\frac{120\pi}{${p(n3)}}} = \frac{120\pi}{${p(r3(n2))}} = ${f(eta2)}\ \Omega$$
        So $n_2 = \sqrt{n_3} = ${f(n2)}$ and $\epsilon_{r2} = n_2^2 = ${p(er2)}$.

        **Step 2: thickness.** $\lambda_0 = c/f = ${p(r3(3e8 / fq * 1000))}$ mm, $\lambda_2 = \lambda_0/n_2$, and
        $$\frac{\lambda_2}{4} = ${f(t * 1000)}\ \text{mm}$$
        **Step 3: bare surface.**
        $$\Gamma = \frac{1 - n_3}{1 + n_3} = \frac{1 - ${p(n3)}}{1 + ${p(n3)}} = ${f(G)}$$
        **Step 4: at $2f$.** The layer is $\lambda_2/2$: it hands medium 1 the bare $\eta_3$. So $\Gamma = ${f(G)}$ again and $|\Gamma|^2 = ${f(G * G)}$.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3: exam length
  GENS.w6q_exam = () => {
    const v = pick([1e8, 1.5e8, 2e8, 3e8]), l = pick([0.5, 1, 2, 5, 10, 25, 50]), Rs = pick([25, 50, 100]);
    const [Z0, RL] = pick([[50, 25], [50, 100], [50, 125], [50, 250], [50, 20], [75, 25], [75, 225], [100, 20], [100, 25], [100, 40], [100, 200], [100, 400]]);
    const F = pick([2, 4, 6, 10, 12]);
    const f1 = v / (4 * l), Zi = Z0 * Z0 / RL, Vi = F * Zi / (Rs + Zi), IL = Vi / Z0, P1 = Vi * Vi / (2 * Zi);
    const Vi2 = F * RL / (Rs + RL), P2 = Vi2 * Vi2 / (2 * RL), Zm = Math.sqrt(Rs * RL);
    const vm = `${p(v / 1e6)}\\ \\text{m}/\\mu\\text{s}`;
    return {
      title: 'A line in a circuit, at two frequencies', big: true,
      q: md`A lossless line has $v = ${vm}$, $Z_0 = ${Z0}\ \Omega$ and length $l = ${p(l)}$ m. It ends in a resistor $R_L = ${RL}\ \Omega$. Its input is connected in series with a resistor $R = ${Rs}\ \Omega$ and a sinusoidal source with phasor $\tilde F = ${F}\angle0°$ V.

(a) The lowest frequency $f_1$ at which the line is a quarter wave. At $f_1$: (b) $Z_{in}$, (c) $\tilde V_{in}$, (d) $|\tilde I_L|$, (e) the load power. At $2f_1$: (f) $Z_{in}$, (g) the load power. (h) What $Z_0$ would make the line a perfect matcher at $f_1$? (i) At $f_1$, the load is replaced by a short. What is the current through $R$?`,
      plan: { q: md`Before any numbers: at $f_1$, what replaces the line and load?`, opts: [md`$Z_{in} = Z_0^2/R_L$, in series with $R$`, md`$R_L$, in series with $R$`, md`$Z_0$, in series with $R$`, md`Nothing simple: find $V^+$ and $V^-$`], a: 0,
        why: [null, md`That is the half-wave rule; at $f_1$ the line is a quarter wave.`, md`Only a matched load shows $Z_0$.`, md`The quarter-wave rule gives $Z_{in}$ in one line.`], move: md`$f_1 = v/4l$. Then the divider, then $|\tilde I_L| = |\tilde V_{in}|/Z_0$, then power. At $2f_1$ the line is a half wave.` },
      parts: [
        T(N('f_1\\ \\text{(MHz)}', f1 / 1e6, 'MHz'), [[v / (2 * l) / 1e6, 'That makes the line a half wave.'], [v / l / 1e6, 'That makes the line a whole wavelength.']]),
        T(N('Z_{in}\\ \\text{at}\\ f_1', Zi, 'Ω'), [[RL, 'That is the half-wave rule.'], [RL * RL / Z0, 'Upside down: Z_in = Z0²/R_L.']]),
        T(N('\\tilde V_{in}\\ \\text{at}\\ f_1\\ \\text{(phase}\\ 0°)', Vi, 'V'), [[F * RL / (Rs + RL), 'That puts R_L in the divider. The source sees Z_in.'], [F * Z0 / (Rs + Z0), 'That puts Z0 in the divider.']]),
        T(N('|\\tilde I_L|\\ \\text{at}\\ f_1', IL, 'A'), [[Vi / RL, 'That is V_in/R_L. Use |I_L| = |V_in|/Z0.']]),
        T(N('P_L\\ \\text{at}\\ f_1', P1, 'W'), [[2 * P1, 'Missing the ½.']]),
        T(N('Z_{in}\\ \\text{at}\\ 2f_1', RL, 'Ω'), [[Zi, 'At 2f1 the line is a half wave.']]),
        T(N('P_L\\ \\text{at}\\ 2f_1', P2, 'W'), [[P1, 'The power changes: the source now sees R_L.']]),
        T(N('Z_0\\ \\text{for a match}', Zm, 'Ω'), [[(Rs + RL) / 2, 'Arithmetic mean. Use √(R R_L).']]),
        { lbl: md`(i) the current through $R$ with a shorted load, at $f_1$`, mc: [md`zero`, md`$\tilde F/R$`, md`$\tilde F/(R + Z_0)$`, md`$\tilde F/(2R)$`], a: 0,
          why: [null, md`That would need a short at the input. A quarter wave turns the short into an open.`, md`That is a matched line. A short is not matched.`, md`That would need $Z_{in} = R$.`] },
      ],
      hints: [md`Quarter wave: $l = \lambda/4$, so $\lambda = 4l$ and $f_1 = v/4l$.`, md`At $f_1$: $Z_{in} = Z_0^2/R_L$, divider, $|\tilde I_L| = |\tilde V_{in}|/Z_0$. At $2f_1$: $Z_{in} = R_L$.`],
      sol: md`
        **(a)** A quarter wave means $\lambda = 4l = ${p(4 * l)}$ m, so
        $$f_1 = \frac{v}{4l} = \frac{${p(v)}}{${p(4 * l)}} = ${f(f1 / 1e6)}\ \text{MHz}$$
        **(b)** $$Z_{in} = \frac{Z_0^2}{R_L} = \frac{${Z0 * Z0}}{${RL}} = ${p(Zi)}\ \Omega$$
        **(c)** The source sees $R$ and $Z_{in}$ in series, a divider:
        $$\tilde V_{in} = ${F}\cdot\frac{${p(Zi)}}{${Rs} + ${p(Zi)}} = ${f(Vi)}\ \text{V}$$
        **(d)** Equation (3): $\tilde I_L = -j\tilde V_{in}/Z_0$, so $|\tilde I_L| = ${f(Vi)}/${Z0} = ${f(IL)}$ A.

        **(e)** $P_L = P_{in} = |\tilde V_{in}|^2/(2Z_{in}) = ${f(P1)}$ W. Check: $\tfrac12|\tilde I_L|^2R_L = ${f(0.5 * IL * IL * RL)}$ W ✓.

        **(f)** At $2f_1$ the line is a half wave: $Z_{in} = R_L = ${RL}\ \Omega$.

        **(g)** $\tilde V_{in} = ${F}\cdot${RL}/${Rs + RL} = ${f(Vi2)}$ V, and $P_L = ${f(Vi2)}^2/(2\cdot${RL}) = ${f(P2)}$ W.

        **(h)** $Z_0^2/R_L = R$ gives $Z_0 = \sqrt{${Rs}\cdot${RL}} = ${f(Zm)}\ \Omega$.

        **(i)** A short a quarter wave away is an open at the input: $Z_{in} = \infty$, so no current flows through $R$ (and the full $\tilde F$ sits across the input).

        **Speed path.** $f_1 = v/4l$; $Z_0^2/R_L$; a two-resistor divider; $|\tilde V_{in}|/Z_0$; $|\tilde V|^2/2R$. At $2f_1$ the line disappears.

        **Where points go.** $\lambda$ from $c$ instead of $v$; $R_L$ or $Z_0$ in the divider; $\tilde V_{in}/R_L$ for the load current; dropping the $\tfrac12$ in power; using half waves for the shorted-load open.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank
  EM.BANK['w6-qw'] = [
    Q(md`At $d = 3\lambda/4$, the arrow $e^{j\beta d}$ is…`, [md`$-j$`, md`$j$`, md`$-1$`, md`$1$`], 0,
      [null, md`That is $d = \lambda/4$. Three quarter turns of $90°$ land at $270°$.`, md`That is a half wave.`, md`That is a whole wave.`], md`$\beta d = 3\pi/2$, and $e^{j3\pi/2} = -j$.`),
    Q(md`A line exactly one wavelength long ends in $Z_L$. Then…`, [md`$Z_{in} = Z_L$ and $\tilde V_{in} = +\tilde V_L$`, md`$Z_{in} = Z_L$ and $\tilde V_{in} = -\tilde V_L$`, md`$Z_{in} = Z_0^2/Z_L$`, md`$Z_{in} = Z_0$`], 0,
      [null, md`Two half waves flip the sign twice.`, md`A whole wave is an even number of quarter waves.`, md`Only a matched load shows $Z_0$.`], md`$e^{\pm j2\pi} = 1$: everything at the input equals the load.`),
    Q(md`$Z(d)$ on any lossless line repeats every…`, [md`$\lambda/2$`, md`$\lambda/4$`, md`$\lambda$`, md`$\lambda/8$`], 0,
      [null, md`Every $\lambda/4$ it inverts; it repeats only after two inversions.`, md`It repeats sooner: both arrows flip sign after $\lambda/2$, and the ratio is unchanged.`, md`An eighth wave changes it in general.`], md`$\tilde V$ and $\tilde I$ both flip sign after $\lambda/2$, so $Z(d + \lambda/2) = Z(d)$.`),
    Q(md`A quarter-wave line has $Z_L = Z_0$. Then $Z_{in}$ is…`, [md`$Z_0$`, md`$0$`, md`$\infty$`, md`$Z_0/2$`], 0,
      [null, md`That is a short load.`, md`That is a shorted load seen through a quarter wave.`, md`Nothing halves it.`], md`$Z_0^2/Z_0 = Z_0$: a matched line looks like $Z_0$ everywhere.`),
    Q(md`An open-ended line is $3\lambda/4$ long. The source sees…`, [md`a short circuit`, md`an open circuit`, md`$Z_0$`, md`an inductor`], 0,
      [null, md`Three quarter waves is odd: the open is inverted.`, md`Only a matched load shows $Z_0$.`, md`Between the quarter-wave points it is reactive; on them it is a short or an open.`], md`Odd number of quarter waves: open becomes short.`),
    Q(md`A capacitive load sits at the end of a quarter-wave line. At the input it looks…`, [md`inductive`, md`capacitive`, md`purely resistive`, md`like a short`], 0,
      [null, md`The reactance changes sign through a quarter wave.`, md`$Z_0^2(R - jX)/(R^2 + X^2)$ keeps the reactance nonzero.`, md`A short at the input comes from an open load, not a capacitor.`], md`$Z_0^2/(R - j|X|) \propto R + j|X|$: inductive.`),
    Q(md`On a $60\ \Omega$ quarter-wave line, $Z_L = 30\ \Omega$. In units of $Z_0$, $z_L = 0.5$. Then $Z_{in}$ is…`, [md`$120\ \Omega$`, md`$30\ \Omega$`, md`$0.5\ \Omega$`, md`$2\ \Omega$`], 0,
      [null, md`That is the half-wave rule.`, md`That is $z_L$, not an impedance.`, md`$z_{in} = 2$ is in units of $Z_0$: multiply by $60$.`], md`$z_{in} = 1/z_L = 2$, so $Z_{in} = 120\ \Omega$. Directly: $3600/30 = 120$.`),
    Q(md`A matched quarter-wave line ($Z_L = Z_0$) has $\tilde V_L = 5$ V. Then $\tilde V_{in}$ is…`, [md`$j5$ V`, md`$-j5$ V`, md`$5$ V`, md`$-5$ V`], 0,
      [null, md`The input is *ahead* of the load: the incoming wave passes it first.`, md`A quarter wave turns the phase by $90°$.`, md`That is a half wave.`], md`With no reflected wave, $\tilde V(d) = V^+e^{j\beta d}$, so $\tilde V_{in} = jV^+ = j5$ V.`),
    Q(md`An ideal 10 V source drives a $50\ \Omega$ quarter-wave line whose far end is **shorted**. Then…`, [md`$\tilde I_{in} = 0$ and $\tilde I_L = -j0.2$ A`, md`$\tilde I_{in} = 0$ and $\tilde I_L = 0$`, md`$\tilde I_{in}$ is infinite`, md`$\tilde I_{in} = 0.2$ A and $\tilde I_L = 0$`], 0,
      [null, md`The load current is $-j\tilde V_{in}/Z_0$, which does not depend on the load: the short carries it.`, md`The short sits a quarter wave away; at the input it is an open.`, md`The short carries current; it has no voltage.`], md`Short at the end: $\tilde V_L = 0$, so $\tilde I_{in} = j\tilde V_L/Z_0 = 0$. But $\tilde I_L = -j\tilde V_{in}/Z_0 = -j0.2$ A flows in the short: a standing wave.`),
    Q(md`The quarter-wave section that matches $450\ \Omega$ to $50\ \Omega$ has $Z_0 =$…`, [md`$150\ \Omega$`, md`$250\ \Omega$`, md`$22500\ \Omega$`, md`$9\ \Omega$`], 0,
      [null, md`That is the arithmetic mean.`, md`That forgets the square root.`, md`That is the ratio $450/50$.`], md`$\sqrt{50\cdot450} = \sqrt{22500} = 150\ \Omega$.`),
    Q(md`Can a single real-$Z_0$ quarter-wave section, placed right at the load, match $Z_L = 100 + j50\ \Omega$ to $50\ \Omega$?`, [md`No: the input keeps a reactance`, md`Yes, with $Z_0 = \sqrt{50\cdot100}$`, md`Yes, with $Z_0 = \sqrt{50|Z_L|}$`, md`Yes, with $Z_0 = 50\ \Omega$`], 0,
      [null, md`That cancels the resistance but leaves $-jZ_0^2X/|Z_L|^2$.`, md`Any real $Z_0$ leaves a reactance $-Z_0^2X/|Z_L|^2 \neq 0$.`, md`$Z_0 = 50$ gives $2500/(100 + j50) = 20 - j10\ \Omega$.`], md`$Z_0^2/(R + jX)$ has reactance $-Z_0^2X/(R^2 + X^2)$, never zero for $X \ne 0$. Move the section to a point where $Z(d)$ is real.`),
    Q(md`Why does $Z_0 = \sqrt{R_{in}R_L}$ make the two echoes cancel?`, [md`It makes the two step reflections equal, and the second returns half a wavelength late`, md`It makes both steps reflect nothing`, md`It makes the second echo twice as strong`, md`It makes the section lossless`], 0,
      [null, md`Each step does reflect ($1/3$ each for $50 \to 100 \to 200$); they cancel each other.`, md`Equal sizes are what cancel.`, md`Every line here is lossless anyway.`], md`$(Z_0 - R_{in})/(Z_0 + R_{in}) = (R_L - Z_0)/(R_L + Z_0)$ exactly when $Z_0^2 = R_{in}R_L$; the round trip of $\lambda/2$ flips the second echo.`),
    Q(md`At $2f_0$, a quarter-wave matcher's input reflection is…`, [md`the same as with no matcher`, md`zero`, md`total, $|\Gamma| = 1$`, md`half the unmatched value`], 0,
      [null, md`Zero happens at $f_0, 3f_0, \ldots$`, md`A half-wave line with a resistive load does not reflect totally.`, md`It is exactly the unmatched value.`], md`At $2f_0$ the section is a half wave: $Z_{in} = R_L$, the bare load.`),
    Q(md`A quarter-wave matcher for 1 GHz on a line with $v = 2\times10^8$ m/s is…`, [md`5 cm long`, md`7.5 cm long`, md`20 cm long`, md`10 cm long`], 0,
      [null, md`That uses $c$: $c/4f$.`, md`That is a whole wavelength.`, md`That is a half wave.`], md`$\lambda = v/f = 20$ cm; $\lambda/4 = 5$ cm.`),
    Q(md`Two quarter-wave sections in a row have the **same** $Z_0$. The source sees…`, [md`$Z_L$`, md`$Z_0^2/Z_L$`, md`$Z_0$`, md`$Z_L^2/Z_0$`], 0,
      [null, md`Two inversions undo each other.`, md`Only a matched load shows $Z_0$.`, md`That is not an inversion at all.`], md`Two quarter waves are a half wave: $Z_{in} = Z_L$.`),
    Q(md`Quarter-wave sections: $Z_{01} = 50\ \Omega$ next to the source, $Z_{02} = 100\ \Omega$ next to the load. $\tilde V_{in} = 6$ V. Then $\tilde V_L$ is…`, [md`$-12$ V`, md`$12$ V`, md`$-3$ V`, md`$j12$ V`], 0,
      [null, md`Two $j$'s make $-1$: the sign flips.`, md`The ratio is $Z_{02}/Z_{01} = 2$ from input to load, not $1/2$.`, md`Two quarter-wave steps give $j\cdot j = -1$, a real number.`], md`$\tilde V_L = -(Z_{02}/Z_{01})\tilde V_{in} = -2\cdot6 = -12$ V.`),
    Q(md`$\tilde F = 15$ V, $Z_g = 25\ \Omega$, and the line's input impedance is $50\ \Omega$. Then $\tilde V_{in}$ is…`, [md`10 V`, md`5 V`, md`15 V`, md`7.5 V`], 0,
      [null, md`That is the drop across $Z_g$.`, md`That forgets $Z_g$.`, md`That splits it equally; the impedances are not equal.`], md`$15\cdot50/75 = 10$ V.`),
    Q(md`The input current of a line circuit is…`, [md`$\tilde F/(Z_g + Z_{in})$`, md`$\tilde F/Z_{in}$`, md`$\tilde F/(Z_g + Z_L)$`, md`$\tilde F/(Z_g + Z_0)$`], 0,
      [null, md`That forgets $Z_g$.`, md`The source sees $Z_{in}$, not $Z_L$.`, md`Only a matched load shows $Z_0$ (or the instant of switch-on).`], md`KVL around the loop: $\tilde F = (Z_g + Z_{in})\tilde I_{in}$.`),
    Q(md`Why is $\tfrac12\Re\{\tilde V(d)\tilde I^*(d)\}$ the same at every $d$ of a lossless line?`, [md`The cross terms between the two waves are purely imaginary`, md`$\tilde V$ and $\tilde I$ are in phase everywhere`, md`$|\tilde V(d)|$ is constant`, md`It is not; it peaks at voltage maxima`], 0,
      [null, md`They are not in phase in general; only their power product's real part is fixed.`, md`$|\tilde V(d)|$ varies with a standing wave.`, md`Power does not pile up anywhere on a lossless line.`], md`$Z_0\tilde V\tilde I^* = |A|^2 - |B|^2 + (BA^* - AB^*)$, and the bracket is imaginary.`),
    Q(md`Incident power on a line is 4 W and $|\Gamma_L| = 0.5$. The load absorbs…`, [md`3 W`, md`4 W`, md`1 W`, md`2 W`], 0,
      [null, md`Part of it reflects.`, md`That is the reflected power.`, md`$|\Gamma_L|^2 = 0.25$, not $0.5$.`], md`$P = 4(1 - 0.25) = 3$ W.`),
    Q(md`A lossless line takes in 2 W and ends in $100\ \Omega$. The load voltage has size…`, [md`20 V`, md`14.1 V`, md`400 V`, md`0.2 A`], 0,
      [null, md`That leaves out the 2.`, md`That forgets the square root.`, md`That is the load current, not a voltage.`], md`$\sqrt{2\cdot100\cdot2} = 20$ V.`),
    Q(md`A quarter-wave line ends in a pure inductor. The average power it takes in is…`, [md`zero`, md`$\tfrac12|\tilde I_{in}|^2Z_0$`, md`$\tfrac12|\tilde V_{in}|^2/Z_0$`, md`infinite`], 0,
      [null, md`$Z_{in}$ is purely reactive, so $\Re\{Z_{in}\} = 0$.`, md`Same: no resistance anywhere.`, md`A reactance absorbs nothing on average.`], md`$P = \tfrac12|\tilde I_{in}|^2\Re\{Z_{in}\} = 0$: the line and inductor only store energy.`),
    Q(md`A wave in air meets $\eta_3 = 30\pi\ \Omega$. A quarter-wave coating needs $\eta_2 =$…`, [md`$60\pi\ \Omega$`, md`$75\pi\ \Omega$`, md`$3600\pi^2\ \Omega$`, md`$30\pi\ \Omega$`], 0,
      [null, md`That is the arithmetic mean.`, md`That forgets the square root.`, md`That is medium 3: no coating at all.`], md`$\sqrt{120\pi\cdot30\pi} = 60\pi\ \Omega$.`),
    Q(md`A quarter-wave coating's thickness is a quarter of…`, [md`the wavelength in the coating`, md`the wavelength in air`, md`the wavelength in medium 3`, md`the average of the two wavelengths`], 0,
      [null, md`The phase that matters is the phase gained inside the layer.`, md`The layer is made of medium 2.`, md`No averaging: it is the layer's own $\beta_2$.`], md`$\beta_2t = \pi/2$, so $t = \lambda_2/4 = \lambda_0/(4n_2)$.`),
    Q(md`A dielectric sheet in air is half a wavelength thick (in the sheet). It reflects…`, [md`nothing, whatever its $\epsilon_r$`, md`more than one face would`, md`exactly what one face would`, md`everything`], 0,
      [null, md`The two echoes cancel.`, md`That is a bare face. The half-wave slab's two echoes cancel.`, md`It is not a conductor.`], md`A half-wave layer hands the front face $\eta_3 = \eta_0$: the slab is invisible (a radome).`),
    Q(md`A shorted line is half a wavelength long. The source sees…`, [md`a short`, md`an open`, md`$Z_0$`, md`an inductor`], 0,
      [null, md`That is an odd number of quarter waves.`, md`Only a matched load shows $Z_0$.`, md`A shorted line is inductive only for lengths below $\lambda/4$ (and repeats).`], md`A half wave hands over the load unchanged: a short.`),
    Q(md`In the analogy between plane waves and lines, $\eta$ plays the role of…`, [md`$Z_0$`, md`$Z_L$`, md`$\Gamma$`, md`$\beta$`], 0,
      [null, md`The *last* medium plays $Z_L$; each medium's $\eta$ is its $Z_0$.`, md`$\Gamma$ is a ratio of waves.`, md`$\beta$ is the phase constant in both.`], md`$\tilde E \leftrightarrow \tilde V$, $\tilde H \leftrightarrow \tilde I$, so $\tilde E/\tilde H$ of one wave, $\eta$, matches $Z_0$.`),
    Q(md`Which change makes a quarter-wave matcher work at a **higher** design frequency?`, [md`Make it shorter`, md`Make it longer`, md`Raise its $Z_0$`, md`Lower its $Z_0$`], 0,
      [null, md`A longer section is a quarter wave at a lower frequency.`, md`$Z_0$ sets which resistances it matches, not the frequency.`, md`Same: $Z_0$ does not set the frequency.`], md`$l = v/4f_0$: higher $f_0$ needs a shorter section.`),
  ];
})();

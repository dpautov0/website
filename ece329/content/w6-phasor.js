/* Topics 17 and 18 (Lectures 31, 32 and 34; formula sheet page 3, "Phasor equations").
   w6-vd: the phasor telegrapher's equations, d measured back from the load, Gamma_L from Ohm's law at the load, Gamma(d),
   Z(d) and its tangent form (derived), the standing-wave envelope, where the maxima and minima sit, VSWR = z(d_max), power
   that is the same at every d, and the source end as a voltage divider.
   w6-stubs: source-free oscillations on open-open, short-short and open-short lines, shorted and open stubs (derived two
   ways), inductive and capacitive ranges, series and parallel resonance with their LC analogies, stubs inside circuits,
   stub filters. No Smith chart (not on Exam 3).
   Same pace as w2-gamma.js. Generator prefix w6v: rapid fire rf_w6v_*, problems w6v_*. */
(function () {
  'use strict';
  const { R, RF, Q, G, P } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;
  const PI = Math.PI;

  // ---------------------------------------------------------------- helpers
  const fr = (x) => TL.frac(x);
  // an angle in degrees, folded into (-180, 180]
  const ang = (a) => { let x = ((a % 360) + 360) % 360; if (x > 180 + 1e-9) x -= 360; return Math.abs(x) < 1e-9 ? 0 : x; };
  // m e^{j a°}; a plain number when a = 0
  const pol = (m, a) => { a = ang(a); const ms = typeof m === 'string' ? m : p(m); return a === 0 ? ms : `${ms}\\,e^{${a < 0 ? '-' : ''}j${p(Math.abs(a))}°}`; };
  // a complex number with small fractions: "j\tfrac{1}{3}", "\tfrac{1}{5} - j\tfrac{2}{5}"
  const cfr = (z) => {
    z = Cx.of(z);
    const eps = 1e-9 * Math.max(1, z.abs());
    const re = Math.abs(z.re) > eps, im = Math.abs(z.im) > eps;
    if (!re && !im) return '0';
    const imt = (v) => (Math.abs(Math.abs(v) - 1) < 1e-9 ? '' : fr(Math.abs(v)));
    if (!im) return fr(z.re);
    if (!re) return `${z.im < 0 ? '-' : ''}j${imt(z.im)}`;
    return `${fr(z.re)} ${z.im < 0 ? '-' : '+'} j${imt(z.im)}`;
  };
  const ctx = (z) => Cx.of(z).tex();                 // 3 s.f. rectangular
  const ohm = (z) => `$${ctx(z)}\\ \\Omega$`;
  const lam = (x) => (Math.abs(x) < 1e-12 ? '0' : Math.abs(x - 1) < 1e-12 ? '\\lambda' : `${fr(x)}\\lambda`);
  const gOf = (zn) => { const z = Cx.of(zn); return z.sub(1).div(z.add(1)); };      // normalized load -> Gamma
  const zOf = (g) => Cx.of(1).add(g).div(Cx.of(1).sub(g));                         // Gamma -> normalized impedance
  const deg = (r) => (r * 180) / PI;
  const LEN8 = ['0', '\\lambda/8', '\\lambda/4', '3\\lambda/8', '\\lambda/2', '5\\lambda/8', '3\\lambda/4', '7\\lambda/8', '\\lambda'];
  const hz = (x) => (x >= 1e9 ? `${p(x / 1e9)}\\ \\text{GHz}` : x >= 1e6 ? `${p(x / 1e6)}\\ \\text{MHz}` : `${p(x / 1e3)}\\ \\text{kHz}`);
  const vtx = (v) => (v === 3e8 ? '3\\times10^8' : `${p(v / 1e8)}\\times10^8`);

  // ---------------------------------------------------------------- figures, Topic 17
  // the whole circuit: generator, line, load; d measured back from the load
  function ckFig() {
    const g = PF.fig({ alt: 'A generator F with series impedance Z_g drives a line of characteristic impedance Z_0 ending in a load Z_L. Distance d is measured from the load, where d = 0, back toward the generator, where d = l.' });
    const y1 = 40, y2 = 120, xs = 40, xa = 150, xb = 370, ym = (y1 + y2) / 2;
    g.circle(xs, ym, 15);
    g.label(xs, ym, '\\sim', 'c');
    g.line(xs, y1, xs, ym - 15); g.line(xs, ym + 15, xs, y2);
    g.line(xs, y1, 76, y1); g.rect(76, y1 - 8, 36, 16); g.line(112, y1, xa, y1);
    g.line(xs, y2, xa, y2);
    g.label(xs - 21, ym, '\\tilde F', 'r');
    g.label(94, y1 - 12, 'Z_g', 'b', 'small');
    g.line(xa, y1, xb, y1, { cls: 'thick' }); g.line(xa, y2, xb, y2, { cls: 'thick' });
    g.dot(xa, y1); g.dot(xa, y2);
    g.label(xa + 8, ym, '\\leftarrow Z(l)', 'l', 'small');
    g.label(238, ym, 'Z_0,\\ \\beta', 'c');
    g.line(xb, y1, xb, ym - 18); g.rect(xb - 9, ym - 18, 18, 36); g.line(xb, ym + 18, xb, y2);
    g.label(xb + 14, ym, 'Z_L', 'l');
    const xd = 300;
    g.label(xd, y1 + 7, '+', 't', 'small'); g.label(xd, y2 - 7, '-', 'b', 'small');
    g.label(xd + 2, ym, '\\tilde V(d)', 'l', 'small');
    g.arrow(xd - 16, y1 - 9, xd + 14, y1 - 9, { hs: 6 });
    g.label(xd - 1, y1 - 14, '\\tilde I(d)', 'b', 'small');
    const ya = y2 + 26;
    g.arrow(xb, ya, xa - 14, ya, { cls: 'dim', hs: 6 });
    g.label(xa - 18, ya, 'd', 'r', 'small');
    [xa, xd, xb].forEach((x) => g.line(x, ya - 5, x, ya + 5, { cls: 'dim' }));
    g.label(xb, ya + 8, 'd = 0', 't', 'small'); g.label(xa, ya + 8, 'd = l', 't', 'small'); g.label(xd, ya + 8, 'd', 't', 'small');
    return g.svg();
  }
  // 1 + Gamma(d) on the complex plane: a point on a circle of radius |Gamma_L| about 1
  function circFig() {
    const g = PF.fig({ alt: 'The complex plane. A dashed circle of radius |Gamma_L| is centered on the point 1. Gamma(d) is an arrow from 1 to a point on the circle; 1 + Gamma(d) is the arrow from the origin to the same point. Its length is largest, 1 + |Gamma_L|, at the right of the circle and smallest, 1 - |Gamma_L|, at the left.' });
    const ox = 40, oy = 120, s = 130, r = 0.5;
    g.arrow(ox - 16, oy, ox + 2.05 * s, oy, { cls: 'dim', hs: 6 });
    g.arrow(ox, oy + 34, ox, oy - 96, { cls: 'dim', hs: 6 });
    g.label(ox + 2.05 * s + 4, oy, '\\text{Re}', 'l', 'small');
    g.label(ox + 6, oy - 96, '\\text{Im}', 'l', 'small');
    const c1 = ox + s, R0 = r * s;
    g.circle(c1, oy, R0, { cls: 'dash' });
    g.dot(c1, oy, 2.4); g.label(c1 - 2, oy + 6, '1', 'tr', 'small');
    const a = (52 * PI) / 180, px = c1 + R0 * Math.cos(a), py = oy - R0 * Math.sin(a);
    g.arrow(c1, oy, px, py, { hs: 6 });
    g.arrow(ox, oy, px, py, { cls: 'thick', hs: 8 });
    g.label(px + 6, py - 4, '1 + \\Gamma(d)', 'bl', 'small');
    g.label(c1 + 26, oy - 12, '\\Gamma(d)', 'l', 'small');
    g.dot(c1 + R0, oy, 2.6); g.dot(c1 - R0, oy, 2.6);
    g.label(c1 + R0 + 5, oy + 5, '1 + |\\Gamma_L|', 'tl', 'small');
    g.label(c1 - R0 - 5, oy + 5, '1 - |\\Gamma_L|', 'tr', 'small');
    return g.svg();
  }
  // the envelope along the line for a given Gamma_L (complex), d in wavelengths from the load
  const envFig = (GL, o = {}) => {
    const g0 = Cx.of(GL), m = g0.abs();
    const V = (d) => Cx.of(1).add(g0.mul(Cx.polar(1, -4 * PI * d))).abs();
    const I = (d) => Cx.of(1).sub(g0.mul(Cx.polar(1, -4 * PI * d))).abs();
    return PF.plot({
      w: 400, h: 190, x: [0, 1], y: [0, 1 + m + 0.35], xl: 'd', yl: o.yl || '\\text{size} / |V^+|',
      xt: o.xt || [[0.25, '\\tfrac{\\lambda}{4}'], [0.5, '\\tfrac{\\lambda}{2}'], [0.75, '\\tfrac{3\\lambda}{4}'], [1, '\\lambda']],
      yt: [[1 - m, fr(1 - m)], [1, '1'], [1 + m, fr(1 + m)]],
      curves: [{ f: V, n: 400 }, { f: I, n: 400, cls: 'dash' }],
    });
  };

  // ================================================================ Topic 17
  EM.lesson('w6', {
    id: 'w6-vd', topic: 17, ref: 'Lectures 32-34', title: 'Lines in sinusoidal steady state: V(d), Γ(d), Z(d), VSWR',
    steps: [
      RF(md`
        !!key Why you care
          Exam 3 ends with transmission lines driven by a sinusoid. Spring 2018 asked three multiple-choice parts on $\Gamma(d)$ and on a shorted line, then a 20-point problem on an input impedance and the voltage at the input. Spring 2017 had an 11-point shorted line inside a circuit. The bottom of page 3 of your formula sheet, under "Phasor equations", lists $\tilde V(d)$, $\tilde I(d)$, $Z(d)$, $P(d)$ and the VSWR. This lesson derives every one of those lines from the telegrapher's equations, one step at a time. [Topic 18](#/l/w6-stubs) (stubs and resonance) and [Topic 19](#/l/w6-qw) (quarter-wave transformers) are built on top of it.

        ### Notation

        [[fig:ck]]

        - $d$: **distance back from the load**, in m. $d = 0$ at the load and $d = l$ at the input. The sheet uses $d$ everywhere in the phasor section.
        - $\tilde V(d)$, $\tilde I(d)$: the **phasors** of the line voltage and current at $d$. The time signal is $V(d,t) = \Re\{\tilde V(d)\,e^{j\omega t}\}$, as in [Topic 1](#/l/w1-phasor).
        - $L$, $C$: inductance and capacitance **per meter** of line (H/m, F/m). The sheet writes them $\mathcal L$ and $\mathcal C$. From [Topic 13](#/l/w5-telegraph): $Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$.
        - $\beta = \omega/v = 2\pi/\lambda$: the **phase constant**, in rad/m. $\beta d$ is how many radians of phase fit in the distance $d$.
        - $V^+$, $V^-$: complex amplitudes of the wave going **toward** the load and the wave coming **back**, both measured at the load.
        - $Z_L$: the **load impedance**, any complex number with a real part $\ge 0$.
        - $\Gamma_L$: the **load reflection coefficient**, $V^-/V^+$. $\Gamma(d)$: the **generalized reflection coefficient** at $d$ (Section 4).
        - $Z(d) = \tilde V(d)/\tilde I(d)$: the **line impedance** at $d$. $z(d) = Z(d)/Z_0$ is the same thing **normalized**. $Y = 1/Z$, $Y_0 = 1/Z_0$.
        - $\tilde F$, $Z_g$: the generator's phasor voltage and its series impedance.
        - VSWR: the **voltage standing-wave ratio**, $|\tilde V|_{\max}/|\tilde V|_{\min}$.

        ### 1. The telegrapher's equations, in phasors

        You met these in [Topic 13](#/l/w5-telegraph), with $z$ running from the generator to the load:
        $$-\frac{\partial V}{\partial z} = L\frac{\partial I}{\partial t}$$
        $$-\frac{\partial I}{\partial z} = C\frac{\partial V}{\partial t}$$
        The first one is KVL on a short piece of line: the voltage drops along the piece because current through its inductance changes. The second is KCL: current leaks across the piece to charge its capacitance.

        Now let everything oscillate at one frequency $\omega$. Write $V(z,t) = \Re\{\tilde V(z)\,e^{j\omega t}\}$ and the same for $I$. As in [Topic 1](#/l/w1-phasor), $\partial/\partial t$ becomes multiplication by $j\omega$:
        $$-\frac{d\tilde V}{dz} = j\omega L\,\tilde I \qquad\text{(1)}$$
        $$-\frac{d\tilde I}{dz} = j\omega C\,\tilde V \qquad\text{(2)}$$
        These are the first two lines of the sheet's phasor section. Now get one equation with only $\tilde V$ in it. Differentiate (1) with respect to $z$:
        $$-\frac{d^2\tilde V}{dz^2} = j\omega L\,\frac{d\tilde I}{dz}$$
        Equation (2) says $d\tilde I/dz = -j\omega C\tilde V$. Substitute it:
        $$-\frac{d^2\tilde V}{dz^2} = j\omega L\,(-j\omega C\,\tilde V)$$
        On the right, $j\cdot(-j) = -j^2 = +1$, so the right side is $\omega^2LC\,\tilde V$. Move the minus sign across:
        $$\frac{d^2\tilde V}{dz^2} = -\omega^2LC\,\tilde V$$
        Give the constant a name. Since $v = 1/\sqrt{LC}$,
        $$\beta \equiv \omega\sqrt{LC} = \frac{\omega}{v}$$
        and the equation becomes
        $$\boxed{\frac{d^2\tilde V}{dz^2} = -\beta^2\,\tilde V}$$
        The sheet writes it as $d^2\tilde V/dz^2 - (j\omega)^2LC\,\tilde V = 0$. That is the same line, because $(j\omega)^2 = -\omega^2$.

        **Solve it.** Try $e^{-j\beta z}$. Each derivative pulls down a factor $-j\beta$, so the second derivative gives $(-j\beta)^2 = -\beta^2$. That is what the equation asks for. $e^{+j\beta z}$ works the same way. So
        $$\tilde V(z) = V^+e^{-j\beta z} + V^-e^{+j\beta z}$$
        Back in time, $\Re\{V^+e^{j(\omega t - \beta z)}\}$ is a cosine moving toward $+z$: the wave headed for the load. The other term moves toward $-z$: the wave coming back.

        **The current.** Solve (1) for $\tilde I$:
        $$\tilde I = -\frac{1}{j\omega L}\,\frac{d\tilde V}{dz}$$
        Differentiate $\tilde V(z)$:
        $$\frac{d\tilde V}{dz} = -j\beta V^+e^{-j\beta z} + j\beta V^-e^{+j\beta z}$$
        Put it in. The $j$'s cancel, and the minus signs combine:
        $$\tilde I = \frac{\beta}{\omega L}\left(V^+e^{-j\beta z} - V^-e^{+j\beta z}\right)$$
        The factor in front is $\omega\sqrt{LC}/(\omega L) = \sqrt{C/L} = 1/Z_0$. So
        $$\boxed{\tilde I(z) = \frac{V^+e^{-j\beta z} - V^-e^{+j\beta z}}{Z_0}}$$

        !!intuition Does this make sense?
          Each wave alone has voltage over current equal to $+Z_0$ (forward) or $-Z_0$ (backward). That is the same rule as $V^+/I^+ = Z_0$ and $V^-/I^- = -Z_0$ in [Topic 14](#/l/w5-launch). The backward wave carries its current toward $-z$, so its current has the opposite sign.
      `, { ck: { svg: ckFig(), cap: 'The circuit of this whole unit. The generator sees the line as one impedance, Z(l). Distance d grows from the load toward the generator.' } }),
      Q(md`**Predict.** On a $50\ \Omega$ line, only a backward wave is present: $\tilde V(z) = 10\,e^{+j3z}$ V. What is $\tilde I(z)$?`,
        [md`$-0.2\,e^{+j3z}$ A`, md`$+0.2\,e^{+j3z}$ A`, md`$-0.2\,e^{-j3z}$ A`, md`$-500\,e^{+j3z}$ A`], 0,
        [null, md`That forgets the sign. A backward wave has $\tilde V/\tilde I = -Z_0$.`, md`The current travels with its voltage. The exponent stays $e^{+j3z}$.`, md`Current is voltage divided by $Z_0$, not multiplied.`],
        md`With $V^+ = 0$, the boxed formula gives $\tilde I = -V^-e^{+j\beta z}/Z_0 = -(10/50)\,e^{+j3z} = -0.2\,e^{+j3z}$ A.`),
      Q(md`**Predict.** A line has $v = 2\times10^8$ m/s and carries $f = 100$ MHz. What is $\beta$?`,
        [md`$\pi$ rad/m`, md`$0.5$ rad/m`, md`$2\pi/3$ rad/m`, md`$2$ rad/m`], 0,
        [null, md`That is $f/v$. The phase constant uses $\omega = 2\pi f$: $\beta = 2\pi f/v$.`, md`That uses $c = 3\times10^8$ m/s. On this line the speed is $v$.`, md`That is $\lambda = v/f$ in meters, not $\beta$.`],
        md`$\beta = \omega/v = 2\pi(10^8)/(2\times10^8) = \pi$ rad/m. Check: $\lambda = v/f = 2$ m, and $2\pi/\lambda = \pi$ ✓.`),
      R(md`
        ### 2. Measure from the load

        Loads are where everything is decided, so the sheet measures distance **back from the load**. Put the load at $z = l$ and define
        $$d = l - z$$
        Then $d = 0$ at the load and $d = l$ at the generator. Substitute $z = l - d$ into the two exponentials:
        $$e^{-j\beta z} = e^{-j\beta l}\,e^{+j\beta d}$$
        $$e^{+j\beta z} = e^{+j\beta l}\,e^{-j\beta d}$$
        The factors $e^{\mp j\beta l}$ are fixed numbers. Fold them into the constants, and keep the names $V^+$ and $V^-$:
        $$\boxed{\tilde V(d) = V^+e^{j\beta d} + V^-e^{-j\beta d}}$$
        $$\boxed{\tilde I(d) = \frac{V^+e^{j\beta d} - V^-e^{-j\beta d}}{Z_0}}$$
        At $d = 0$ both exponentials equal 1. So now $V^+$ is the incident wave's phasor **at the load**, and $V^-$ is the reflected wave's phasor **at the load**. That is the main reason to use $d$.

        !!intuition Does this make sense?
          The incident wave now carries $e^{+j\beta d}$, a phase that **grows** as you move away from the load. Picture a crest heading for the load. It passes a point $d$ meters before the load $d/v$ seconds before it reaches the load. Earlier in time means ahead in phase, by $\omega d/v = \beta d$. The reflected wave passes the same point after it leaves the load, so it is behind by $\beta d$: $e^{-j\beta d}$.
      `),
      Q(md`**Predict.** Only an incident wave is present, and at the load it is $V^+ = 5$ V. What is $\tilde V(d)$ at $d = \lambda/4$ from the load?`,
        [md`$j5$ V`, md`$-j5$ V`, md`$5$ V`, md`$-5$ V`], 0,
        [null, md`That uses $e^{-j\beta d}$, the $z$-form sign. Measured back from the load, the incident wave carries $e^{+j\beta d}$.`, md`The size stays 5, but the phase changes along the line.`, md`That turns by $180°$, which is $2\beta d$. A single wave turns by $\beta d = 90°$.`],
        md`$\beta d = (2\pi/\lambda)(\lambda/4) = \pi/2$. So $\tilde V = 5e^{j\pi/2} = j5$ V. The point a quarter wave before the load is $90°$ ahead of the load.`),
      R(md`
        ### 3. The load sets the ratio: $\Gamma_L$

        At the load, $d = 0$, so
        $$\tilde V(0) = V^+ + V^-$$
        $$\tilde I(0) = \frac{V^+ - V^-}{Z_0}$$
        The load obeys Ohm's law in phasor form: $\tilde V(0) = Z_L\,\tilde I(0)$. Write that out:
        $$V^+ + V^- = \frac{Z_L}{Z_0}\left(V^+ - V^-\right)$$
        Multiply both sides by $Z_0$:
        $$Z_0V^+ + Z_0V^- = Z_LV^+ - Z_LV^-$$
        Collect the $V^-$ terms on the left and the $V^+$ terms on the right:
        $$V^-\left(Z_L + Z_0\right) = V^+\left(Z_L - Z_0\right)$$
        Divide. The ratio is the **load reflection coefficient**:
        $$\boxed{\Gamma_L \equiv \frac{V^-}{V^+} = \frac{Z_L - Z_0}{Z_L + Z_0}}$$
        It is the same formula as the $\Gamma_L$ for a resistor in [Topic 14](#/l/w5-launch). The only change is that $Z_L$ may now be complex, so $\Gamma_L$ may be complex: $\Gamma_L = |\Gamma_L|\,e^{j\theta_L}$.

        !!intuition Does this make sense?
          - $Z_L = Z_0$: $\Gamma_L = 0$. No reflected wave. The load is **matched**.
          - $Z_L = 0$ (a short): $\Gamma_L = -1$. The reflected voltage cancels the incident one, so $\tilde V(0) = 0$. ✓
          - $Z_L \to \infty$ (an open): divide top and bottom by $Z_L$, and $\Gamma_L \to +1$. The currents cancel, so $\tilde I(0) = 0$. ✓
          - $Z_L = jX$ (a pure reactance): $|jX - Z_0| = \sqrt{X^2 + Z_0^2} = |jX + Z_0|$, so $|\Gamma_L| = 1$. A reactance cannot absorb power, so all of it comes back. Only the phase is new.
      `),
      Q(md`**Predict.** A $50\ \Omega$ line ends in $Z_L = j50\ \Omega$. What is $\Gamma_L$?`,
        [md`$j$`, md`$-j$`, md`$0$`, md`$1$`], 0,
        [null, md`That is $(Z_0 - Z_L)/(Z_0 + Z_L)$, with the sign flipped. The load comes first in the top.`, md`$|Z_L| = Z_0$ is not a match. A match needs $Z_L = Z_0 = 50\ \Omega$, real.`, md`$+1$ is an open. A reactance also reflects everything, but with a phase.`],
        md`$\Gamma_L = (j50 - 50)/(j50 + 50) = (j - 1)/(j + 1)$. Multiply top and bottom by $1 - j$: the bottom is $2$, the top is $(j - 1)(1 - j) = j - j^2 - 1 + j = 2j$. So $\Gamma_L = j$. Its size is 1, as for every reactance.`),
      R(md`
        ### 4. Factor out the incident wave: $\Gamma(d)$

        Put $V^- = \Gamma_LV^+$ into $\tilde V(d)$:
        $$\tilde V(d) = V^+e^{j\beta d} + \Gamma_LV^+e^{-j\beta d}$$
        Pull out the incident wave, $V^+e^{j\beta d}$. What is left in the second term is $e^{-j\beta d}/e^{j\beta d} = e^{-j2\beta d}$:
        $$\tilde V(d) = V^+e^{j\beta d}\left(1 + \Gamma_Le^{-j2\beta d}\right)$$
        The bracket has a name. The **generalized reflection coefficient** is
        $$\boxed{\Gamma(d) \equiv \Gamma_L\,e^{-j2\beta d}}$$
        It is the reflected wave divided by the incident wave, both taken at the point $d$:
        $$\frac{V^-e^{-j\beta d}}{V^+e^{j\beta d}} = \Gamma_Le^{-j2\beta d} = \Gamma(d)$$
        Do the same for the current. The only change is the minus sign in front of $V^-$:
        $$\boxed{\tilde V(d) = V^+e^{j\beta d}\bigl(1 + \Gamma(d)\bigr)}$$
        $$\boxed{\tilde I(d) = \frac{V^+}{Z_0}\,e^{j\beta d}\bigl(1 - \Gamma(d)\bigr)}$$
        These are the third and fourth lines of the sheet's phasor section.

        **How $\Gamma(d)$ moves.** Its size never changes, because $|e^{-j2\beta d}| = 1$. Its angle falls by $2\beta d$:
        $$\Gamma(d) = |\Gamma_L|\,e^{j(\theta_L - 2\beta d)}$$
        On the complex plane, $\Gamma(d)$ walks **clockwise** around a circle of radius $|\Gamma_L|$ as you walk toward the generator. Since $2\beta d = 4\pi d/\lambda$, every eighth of a wavelength turns it by $90°$:

        | $d$ | $2\beta d$ | $\Gamma(d)$ |
        |---|---|---|
        | $\lambda/8$ | $90°$ | $-j\,\Gamma_L$ |
        | $\lambda/4$ | $180°$ | $-\Gamma_L$ |
        | $3\lambda/8$ | $270°$ | $+j\,\Gamma_L$ |
        | $\lambda/2$ | $360°$ | $\Gamma_L$ again |

        So everything that depends on $\Gamma(d)$ **repeats every half wavelength**.

        !!intuition Does this make sense?
          Why $2\beta d$ and not $\beta d$? Go from the load to the point $d$. The incident wave's phase rises by $\beta d$ and the reflected wave's falls by $\beta d$, so their ratio changes by $2\beta d$. Another way to see it: the reflected wave at $d$ has traveled from $d$ to the load and back, a round trip of $2d$.
      `),
      Q(md`**Predict.** $\Gamma_L = 0.5$. What is $\Gamma(d)$ at $d = \lambda/8$?`,
        [md`$-j0.5$`, md`$+j0.5$`, md`$0.5\,e^{-j45°}$`, md`$-0.5$`], 0,
        [null, md`That turns counterclockwise. The angle **falls** by $2\beta d$ as $d$ grows.`, md`That turns by $\beta d = 45°$. The ratio turns by $2\beta d = 90°$.`, md`That is a $180°$ turn, which takes $\lambda/4$.`],
        md`$2\beta d = 2(2\pi/\lambda)(\lambda/8) = \pi/2$. So $\Gamma(\lambda/8) = 0.5\,e^{-j\pi/2} = -j0.5$.`),
      Q(md`**Predict.** On a lossless line with an arbitrary load, which statement about $\Gamma(d)$ is **false**?`,
        [md`Its angle is the same at every $d$.`, md`Its size equals $|\Gamma_L|$ at every $d$.`, md`$\Gamma(d + \lambda/2) = \Gamma(d)$.`, md`$\Gamma(d + \lambda/4) = -\Gamma(d)$.`], 0,
        [null, md`True: $|e^{-j2\beta d}| = 1$, so the size never changes on a lossless line.`, md`True: half a wavelength turns the angle by $2\beta(\lambda/2) = 2\pi$, a full circle.`, md`True: a quarter wavelength turns it by $\pi$, and $e^{-j\pi} = -1$.`],
        md`The angle is $\theta_L - 2\beta d$: it changes with $d$. Only the size is constant. (Spring 2018 asked the same idea as a "which are true" question.)`),
      RF(md`
        ### 5. The line impedance $Z(d)$

        Divide voltage by current at the same point. The factor $V^+e^{j\beta d}$ is in both, so it cancels:
        $$Z(d) \equiv \frac{\tilde V(d)}{\tilde I(d)} = \frac{V^+e^{j\beta d}(1 + \Gamma(d))}{(V^+/Z_0)\,e^{j\beta d}(1 - \Gamma(d))}$$
        $$\boxed{Z(d) = Z_0\,\frac{1 + \Gamma(d)}{1 - \Gamma(d)}}$$
        Solve it for $\Gamma$ and you get the same shape as $\Gamma_L$:
        $$\Gamma(d) = \frac{Z(d) - Z_0}{Z(d) + Z_0}$$
        **What $Z(d)$ means.** Cut the line at $d$. Throw away everything between the cut and the load, and put a lumped impedance $Z(d)$ across the cut. The generator side cannot tell the difference: the same voltage and current sit at the cut. In particular, the generator sees the whole line as one impedance, the **input impedance** $Z(l)$.

        **The tangent form.** Often you know $Z_L$ and want $Z(d)$ without going through $\Gamma$. Start from section 2's form:
        $$Z(d) = Z_0\,\frac{e^{j\beta d} + \Gamma_Le^{-j\beta d}}{e^{j\beta d} - \Gamma_Le^{-j\beta d}}$$
        Put in $\Gamma_L = (Z_L - Z_0)/(Z_L + Z_0)$, and multiply the top and the bottom by $Z_L + Z_0$. The top becomes
        $$(Z_L + Z_0)e^{j\beta d} + (Z_L - Z_0)e^{-j\beta d}$$
        Group the $Z_L$ terms and the $Z_0$ terms:
        $$Z_L\left(e^{j\beta d} + e^{-j\beta d}\right) + Z_0\left(e^{j\beta d} - e^{-j\beta d}\right)$$
        Euler's formula gives $e^{jx} + e^{-jx} = 2\cos x$ and $e^{jx} - e^{-jx} = j2\sin x$. So the top is
        $$2Z_L\cos\beta d + j2Z_0\sin\beta d$$
        The bottom works the same way, with the roles swapped:
        $$2Z_0\cos\beta d + j2Z_L\sin\beta d$$
        Cancel the 2's and divide the top and the bottom by $\cos\beta d$:
        $$\boxed{Z(d) = Z_0\,\frac{Z_L + jZ_0\tan\beta d}{Z_0 + jZ_L\tan\beta d}}$$
        Divide the top and the bottom by $Z_0$ once more, and it gets shorter in normalized form, $z_L = Z_L/Z_0$:
        $$z(d) = \frac{z_L + j\tan\beta d}{1 + jz_L\tan\beta d}$$

        !!intuition Does this make sense?
          - $d = 0$: $\tan 0 = 0$, so $Z(0) = Z_L$. ✓
          - $Z_L = Z_0$: top and bottom are equal, so $Z(d) = Z_0$ everywhere. A matched line looks like $Z_0$ from anywhere.
          - $d = \lambda/2$: $\tan\pi = 0$, so $Z = Z_L$ again: the half-wave repeat.
          - $d = \lambda/4$: $\tan(\pi/2) \to \infty$. Keep only the terms with the tangent: $Z \to Z_0(jZ_0)/(jZ_L) = Z_0^2/Z_L$. A quarter wave **inverts** the load. [Topic 19](#/l/w6-qw) is built on this.
          - $Z_L = 0$: $Z(d) = jZ_0\tan\beta d$. $Z_L \to \infty$: $Z(d) = -jZ_0\cot\beta d$. These are the stubs of [Topic 18](#/l/w6-stubs).

        The quarter-wave inversion is also the sheet's "$z(d) = 1/y(d)$" line in disguise. A quarter wave flips the sign of $\Gamma$, and flipping the sign of $\Gamma$ turns $(1 + \Gamma)/(1 - \Gamma)$ upside down: $z(d + \lambda/4) = 1/z(d)$. The sheet's "$Z(d) = Y(d \pm \lambda/4)$" is this identity in normalized form, $z(d) = y(d \pm \lambda/4)$; with units it reads $Z(d) = Z_0^2\,Y(d \pm \lambda/4)$.
      `, {}),
      Q(md`**Predict.** A $100\ \Omega$ line ends in $Z_L = 50\ \Omega$. What is $Z(d)$ at $d = \lambda/8$?`,
        [md`$80 + j60\ \Omega$`, md`$80 - j60\ \Omega$`, md`$200\ \Omega$`, md`$50\ \Omega$`], 0,
        [null, md`That flips the sign of the tangent. At $\lambda/8$, $\tan\beta d = \tan45° = +1$.`, md`That is the quarter-wave answer $Z_0^2/Z_L$. Here $d = \lambda/8$.`, md`That is the load itself, which you see only at $d = 0$ or every $\lambda/2$.`],
        md`$z_L = 0.5$ and $\tan45° = 1$: $z = (0.5 + j)/(1 + j0.5)$. Multiply top and bottom by $1 - j0.5$: the bottom is $1.25$, the top is $0.5 - j0.25 + j + 0.5 = 1 + j0.75$. So $z = 0.8 + j0.6$, and $Z = 100z = 80 + j60\ \Omega$.`),
      Q(md`**Predict.** A $50\ \Omega$ line that is $\lambda/4$ long ends in $25\ \Omega$. The generator sees…`,
        [md`$100\ \Omega$`, md`$25\ \Omega$`, md`$50\ \Omega$`, md`$12.5\ \Omega$`], 0,
        [null, md`That is what a half wave would show. A quarter wave inverts.`, md`Only a matched load ($Z_L = Z_0$) looks like $Z_0$ from everywhere.`, md`That is $Z_L^2/Z_0$, the inversion upside down.`],
        md`$Z(\lambda/4) = Z_0^2/Z_L = 2500/25 = 100\ \Omega$. A load below $Z_0$ comes back above it.`),
      RF(md`
        ### 6. The standing wave: $|\tilde V(d)|$ and the VSWR

        A voltmeter that reads amplitudes, slid along the line, measures $|\tilde V(d)|$. Since $|e^{j\beta d}| = 1$,
        $$|\tilde V(d)| = |V^+|\,\bigl|1 + \Gamma(d)\bigr|$$
        Picture the number $1 + \Gamma(d)$. $\Gamma(d)$ runs around a circle of radius $|\Gamma_L|$ centered at 0, so $1 + \Gamma(d)$ runs around the same circle shifted to be centered at 1:

        [[fig:circ]]

        Its length is largest when $\Gamma(d)$ points along $+1$ (real and positive) and smallest when it points along $-1$ (real and negative):
        $$|\tilde V|_{\max} = |V^+|\,(1 + |\Gamma_L|)$$
        $$|\tilde V|_{\min} = |V^+|\,(1 - |\Gamma_L|)$$
        **Where they sit.** $\Gamma(d) = |\Gamma_L|e^{j(\theta_L - 2\beta d)}$ is real and positive when $2\beta d = \theta_L$. Take $\theta_L$ between $0°$ and $360°$, so the first maximum is the closest one in front of the load:
        $$d_{\max} = \frac{\theta_L}{2\beta} = \frac{\theta_L}{4\pi}\,\lambda$$
        In degrees, $d_{\max}/\lambda = \theta_L/720°$. A minimum is a quarter wave from a maximum, because a quarter wave turns $\Gamma(d)$ by $180°$. Maxima repeat every $\lambda/2$.

        **The current** has $1 - \Gamma(d)$ instead, so it is largest exactly where the voltage is smallest. Here is the pattern for a resistor $R_L = 3Z_0$ ($\Gamma_L = 0.5$). Solid is $|\tilde V(d)|/|V^+|$; dashed is $Z_0|\tilde I(d)|/|V^+|$; the load is at the left end:

        [[fig:env]]

        **The VSWR.** Divide the largest voltage by the smallest:
        $$\boxed{\text{VSWR} = \frac{|\tilde V|_{\max}}{|\tilde V|_{\min}} = \frac{1 + |\Gamma_L|}{1 - |\Gamma_L|}}$$
        It runs from 1 (matched, flat) to $\infty$ ($|\Gamma_L| = 1$: a short, an open or a reactance). Solve for $|\Gamma_L|$ when the VSWR is given:
        $$|\Gamma_L| = \frac{\text{VSWR} - 1}{\text{VSWR} + 1}$$
        **The impedance at a maximum.** There $\Gamma(d) = +|\Gamma_L|$, a real number, so section 5 gives a real impedance:
        $$Z(d_{\max}) = Z_0\,\frac{1 + |\Gamma_L|}{1 - |\Gamma_L|} = Z_0\cdot\text{VSWR}$$
        That is the last entry of the VSWR line on the sheet: $z(d_{\max}) = \text{VSWR}$. At a minimum $\Gamma(d) = -|\Gamma_L|$, and $Z(d_{\min}) = Z_0/\text{VSWR}$.

        !!intuition Does this make sense?
          A resistor $R_L > Z_0$ has $\Gamma_L > 0$, so $\theta_L = 0$ and the voltage maximum sits right at the load, with VSWR $= R_L/Z_0$. A resistor $R_L < Z_0$ has $\Gamma_L < 0$: a minimum at the load, VSWR $= Z_0/R_L$. Large voltage with small current means large impedance, and the other way round.

        Slide along a line and watch $\Gamma(d)$ and $z(d)$ change. Try the short, the open and $Z_0(1 + j)$:
      `, {
        circ: { svg: circFig(), cap: 'The length of $1 + \\Gamma(d)$ sets $|\\tilde V(d)|$. As $d$ grows, the tip runs clockwise around the dashed circle, so the length swings between $1 - |\\Gamma_L|$ and $1 + |\\Gamma_L|$.' },
        env: { svg: envFig(0.5), cap: '$R_L = 3Z_0$, so $\\Gamma_L = 0.5$: a voltage maximum (and current minimum) at the load, extremes every $\\lambda/4$, the pattern repeating every $\\lambda/2$.' },
      }),
      W3.zline(),
      Q(md`**Predict.** A $50\ \Omega$ line ends in a $200\ \Omega$ resistor. What is the VSWR, and what sits at the load?`,
        [md`VSWR $= 4$, a voltage maximum`, md`VSWR $= 4$, a voltage minimum`, md`VSWR $= 0.6$, a voltage maximum`, md`VSWR $= 2.5$, a voltage maximum`], 0,
        [null, md`$R_L > Z_0$ makes $\Gamma_L$ positive, so incident and reflected add at the load.`, md`$0.6$ is $|\Gamma_L|$. The VSWR is $(1 + 0.6)/(1 - 0.6)$.`, md`That is $1/(1 - |\Gamma_L|)$. The top is $1 + |\Gamma_L|$.`],
        md`$\Gamma_L = (200 - 50)/(200 + 50) = 0.6$, so VSWR $= 1.6/0.4 = 4$. Quicker: for a resistor above $Z_0$, VSWR $= R_L/Z_0 = 4$, with the maximum at the load.`),
      Q(md`**Predict.** $\Gamma_L = 0.5\,e^{-j90°}$. How far from the load is the first voltage **maximum**?`,
        [md`$3\lambda/8$`, md`$\lambda/8$`, md`$3\lambda/4$`, md`$5\lambda/8$`], 0,
        [null, md`That is $|\theta_L|/720°$ with the sign dropped. Write $\theta_L$ between $0°$ and $360°$: $-90°$ is $270°$.`, md`That uses $\beta d$. The angle of $\Gamma(d)$ falls by $2\beta d$.`, md`That is the second maximum, half a wave further out. The first one is closer.`],
        md`$\theta_L = -90° = 270°$. The maximum needs $2\beta d = 270°$, so $d/\lambda = 270°/720° = 3/8$. The first minimum is a quarter wave closer, at $\lambda/8$.`),
      R(md`
        ### 7. Power: the same at every $d$

        From [Topic 4](#/l/w1-avg), the time-averaged power carried past the point $d$ toward the load is
        $$P(d) = \tfrac12\Re\{\tilde V(d)\,\tilde I^*(d)\}$$
        Put in the two phasors. The conjugate of $e^{j\beta d}$ is $e^{-j\beta d}$, so they cancel:
        $$\tilde V\tilde I^* = \frac{|V^+|^2}{Z_0}\bigl(1 + \Gamma\bigr)\bigl(1 - \Gamma^*\bigr)$$
        Multiply out the brackets, using $\Gamma\Gamma^* = |\Gamma|^2$:
        $$(1 + \Gamma)(1 - \Gamma^*) = 1 - |\Gamma|^2 + (\Gamma - \Gamma^*)$$
        A number minus its own conjugate is purely imaginary: $\Gamma - \Gamma^* = j2\Im\{\Gamma\}$. So it drops out of the real part. And $|\Gamma(d)| = |\Gamma_L|$:
        $$\boxed{P(d) = \frac{|V^+|^2}{2Z_0}\left(1 - |\Gamma_L|^2\right)}$$
        Expand it and you get the sheet's form: incident power minus reflected power,
        $$P = \frac{|V^+|^2}{2Z_0} - \frac{|V^-|^2}{2Z_0}$$
        There is no $d$ left in it. The power is the same at every point of the line, and so it equals the power into the load, $\tfrac12\Re\{\tilde V_L\tilde I_L^*\}$.

        !!intuition Does this make sense?
          The line has no resistance, so it cannot turn any power into heat. On average, whatever crosses one point must cross every other point and end up in the load. A short, an open or a reactance has $|\Gamma_L| = 1$, so $P = 0$: energy sloshes back and forth, and none is used.
      `),
      Q(md`**Predict.** $|V^+| = 10$ V on a $50\ \Omega$ line, and $|\Gamma_L| = 0.6$. How much power reaches the load?`,
        [md`$0.64$ W`, md`$1$ W`, md`$0.4$ W`, md`$1.28$ W`], 0,
        [null, md`That is the incident power alone. The reflected part, $|\Gamma_L|^2 = 0.36$ of it, comes back.`, md`That uses $1 - |\Gamma_L|$. Power goes as the square of the voltage: $1 - |\Gamma_L|^2$.`, md`That drops the $\tfrac12$. Phasors here are peak values, so the average power has a $\tfrac12$.`],
        md`Incident: $|V^+|^2/2Z_0 = 100/100 = 1$ W. Delivered: $1\times(1 - 0.36) = 0.64$ W.`),
      R(md`
        ### 8. The generator end: a voltage divider

        Look at the circuit at the top of the lesson again. The generator sees the whole line as one impedance, $Z(l)$. So the generator, $Z_g$ and $Z(l)$ form a plain voltage divider:
        $$\boxed{\tilde V(l) = \tilde F\,\frac{Z(l)}{Z_g + Z(l)}}$$
        and the current into the line is
        $$\tilde I(l) = \frac{\tilde F}{Z_g + Z(l)}$$
        That is the sheet's $\tilde V(l)$ line. Now you can get the incident wave. Section 4's formula at $d = l$ says $\tilde V(l) = V^+e^{j\beta l}(1 + \Gamma(l))$. Solve for $V^+$:
        $$V^+ = \frac{\tilde V(l)\,e^{-j\beta l}}{1 + \Gamma(l)}$$
        Once you know $V^+$ and $\Gamma_L$, you know $\tilde V(d)$ and $\tilde I(d)$ everywhere.

        **A shortcut when $Z_g = Z_0$.** Then $Z_0 + Z(l) = Z_0\bigl[(1 - \Gamma) + (1 + \Gamma)\bigr]/(1 - \Gamma) = 2Z_0/(1 - \Gamma)$, with $\Gamma = \Gamma(l)$. The divider becomes
        $$\tilde V(l) = \tilde F\,\frac{1 + \Gamma(l)}{2}$$
        Compare with $\tilde V(l) = V^+e^{j\beta l}(1 + \Gamma(l))$:
        $$V^+e^{j\beta l} = \frac{\tilde F}{2}$$
        The incident wave at the input is half the generator voltage, whatever the load. That is the launch from [Topic 14](#/l/w5-launch), $\tau_g\tilde F$ with the **injection coefficient** $\tau_g = Z_0/(Z_g + Z_0) = \tfrac12$. A matched generator absorbs everything that comes back, so nothing else adds to the forward wave.

        **Power from the generator end.** $P = \tfrac12|\tilde I(l)|^2\,\Re\{Z(l)\}$. By section 7 it must equal the power in the load: a good check.
      `),
      Q(md`**Predict.** A generator with $\tilde F = 8$ V and $Z_g = 50\ \Omega$ drives a $50\ \Omega$ line that ends in $150\ \Omega$. What is $|V^+|$?`,
        [md`$4$ V`, md`$8$ V`, md`$6$ V`, md`It depends on the length of the line.`], 0,
        [null, md`That forgets the generator's own $Z_g$. Half of $\tilde F$ drops across it at launch.`, md`That is $\tilde F\,Z_L/(Z_g + Z_L)$: a divider with the load instead of $Z(l)$, and the total voltage instead of the incident wave.`, md`The length changes $Z(l)$ and $\tilde V(l)$, but with $Z_g = Z_0$ the incident wave is always $\tilde F/2$ in size.`],
        md`$Z_g = Z_0$, so $V^+e^{j\beta l} = \tilde F/2 = 4$ V. The size of $V^+$ does not change along a lossless line: $|V^+| = 4$ V.`),
      RF(md`
        ### The method

        !!method A line in sinusoidal steady state, from the load back to the generator
          1. **Electrical length.** $\lambda = v/f$ and $\beta = 2\pi/\lambda$. Write every length as a fraction of $\lambda$; $\lambda/8$ means $\tan\beta d = 1$.
          2. **Load.** $\Gamma_L = (Z_L - Z_0)/(Z_L + Z_0)$. Note its size $|\Gamma_L|$ and angle $\theta_L$.
          3. **Walk to the input.** $\Gamma(l) = \Gamma_Le^{-j2\beta l}$ (turn clockwise by $2\beta l$), then $Z(l) = Z_0(1 + \Gamma(l))/(1 - \Gamma(l))$. Or use the tangent form.
          4. **Generator.** $\tilde V(l) = \tilde F\,Z(l)/(Z_g + Z(l))$. If $Z_g = Z_0$, skip ahead: $V^+e^{j\beta l} = \tilde F/2$.
          5. **Incident wave.** $V^+ = \tilde V(l)\,e^{-j\beta l}/(1 + \Gamma(l))$.
          6. **Anything else.** $\tilde V(d)$, $\tilde I(d)$, $|\tilde V|_{\max} = |V^+|(1 + |\Gamma_L|)$, $P = (|V^+|^2/2Z_0)(1 - |\Gamma_L|^2)$.
          7. **Check.** $\tfrac12|\tilde I(l)|^2\Re\{Z(l)\}$ equals the power in the load.

        ### Worked example 1: a complex load and its pattern

        !!graded Problem
          A $50\ \Omega$ line ends in $Z_L = 40 + j30\ \Omega$. Find $\Gamma_L$, the VSWR, where the first voltage maximum and minimum sit, $Z(d)$ at both, and $Z(\lambda/4)$.

        **Step 1: $\Gamma_L$.**
        $$\Gamma_L = \frac{40 + j30 - 50}{40 + j30 + 50} = \frac{-10 + j30}{90 + j30}$$
        Divide the top and the bottom by 10:
        $$\Gamma_L = \frac{-1 + j3}{9 + j3}$$
        Multiply the top and the bottom by the conjugate of the bottom, $9 - j3$. The bottom becomes $81 + 9 = 90$. The top becomes $-9 + j3 + j27 - j^2\,9 = j30$:
        $$\Gamma_L = \frac{j30}{90} = j\tfrac13$$
        So $|\Gamma_L| = \tfrac13$ and $\theta_L = 90°$.

        **Step 2: the VSWR.**
        $$\text{VSWR} = \frac{1 + \tfrac13}{1 - \tfrac13} = \frac{4/3}{2/3} = 2$$
        **Step 3: where the extremes sit.** The maximum needs $2\beta d = \theta_L = 90°$, so $d_{\max} = (90°/720°)\lambda = \lambda/8$. The minimum is a quarter wave further: $d_{\min} = 3\lambda/8$.

        **Step 4: $Z$ at the extremes.**
        $$Z(d_{\max}) = Z_0\cdot\text{VSWR} = 100\ \Omega$$
        $$Z(d_{\min}) = Z_0/\text{VSWR} = 25\ \Omega$$
        Check the first one directly: $\Gamma(\lambda/8) = (j\tfrac13)(-j) = \tfrac13$, and $50\,(4/3)/(2/3) = 100\ \Omega$ ✓.

        **Step 5: $Z(\lambda/4)$.** A quarter wave inverts:
        $$Z(\lambda/4) = \frac{Z_0^2}{Z_L} = \frac{2500}{40 + j30}$$
        Multiply the top and the bottom by $40 - j30$. The bottom is $1600 + 900 = 2500$:
        $$Z(\lambda/4) = 40 - j30\ \Omega$$
        This load has $|Z_L| = Z_0$, so inverting it only flips the sign of its reactance.

        [[fig:we1]]

        **Speed path.** Spot that $|Z_L| = 50 = Z_0$: then $\Gamma_L$ is purely imaginary, and $\Gamma_L = jX/(R + Z_0)$-type arithmetic is quick. Once $\theta_L = 90°$, $d_{\max} = \lambda/8$ by the "$90°$ per $\lambda/8$" rule. Never compute $Z(d_{\max})$ from scratch: it is $Z_0\cdot$VSWR.

        **Where points go.** Turning $\Gamma$ the wrong way (that puts the maximum at $3\lambda/8$). Writing the VSWR as $\tfrac12$. Forgetting that the inverse of a complex number flips the sign of its angle.

        ### Worked example 2: the whole circuit

        !!graded Problem
          A generator with $\tilde F = 10$ V and $Z_g = 50\ \Omega$ drives a $50\ \Omega$ line that is $\lambda/8$ long and ends in $Z_L = 100\ \Omega$. Find $Z(l)$, $\tilde V(l)$, $V^+$, the load voltage, and the power delivered.

        **Step 1: $\Gamma_L$.** $(100 - 50)/(100 + 50) = \tfrac13$.

        **Step 2: $Z(l)$.** $\beta l = 45°$, so $\tan\beta l = 1$. In normalized form, $z_L = 2$:
        $$z(l) = \frac{2 + j}{1 + j2}$$
        Multiply the top and the bottom by $1 - j2$. The bottom is 5. The top is $2 - j4 + j - j^2\,2 = 4 - j3$:
        $$z(l) = \frac{4 - j3}{5} = 0.8 - j0.6$$
        $$Z(l) = 50\,z(l) = 40 - j30\ \Omega$$
        **Step 3: the divider.**
        $$\tilde V(l) = 10\,\frac{40 - j30}{50 + 40 - j30} = 10\,\frac{4 - j3}{9 - j3}$$
        Multiply the top and the bottom by $9 + j3$. The bottom is $90$; the top is $36 + j12 - j27 + 9 = 45 - j15$:
        $$\tilde V(l) = \frac{10(45 - j15)}{90} = 5 - j\tfrac53\ \text{V}$$
        Its size is $\sqrt{25 + 25/9} = 5.27$ V.

        **Step 4: $V^+$.** $Z_g = Z_0$, so $V^+e^{j\beta l} = \tilde F/2 = 5$ V, and
        $$V^+ = 5\,e^{-j45°}\ \text{V}$$
        Check with the long way: $\Gamma(l) = \tfrac13e^{-j90°} = -j\tfrac13$, so $V^+e^{j\beta l}(1 + \Gamma(l)) = 5(1 - j\tfrac13) = 5 - j\tfrac53$ ✓.

        **Step 5: the load voltage.**
        $$\tilde V(0) = V^+(1 + \Gamma_L) = 5e^{-j45°}\cdot\tfrac43 = 6.67\,e^{-j45°}\ \text{V}$$
        **Step 6: power.**
        $$P = \frac{|V^+|^2}{2Z_0}\left(1 - |\Gamma_L|^2\right) = \frac{25}{100}\cdot\frac89 = \frac29\ \text{W} \approx 0.222\ \text{W}$$
        **Check 1, at the load:** $|\tilde V_L|^2/2R_L = (400/9)/200 = 2/9$ W ✓. **Check 2, at the input:** $\tilde I(l) = 10/(90 - j30)$ has $|\tilde I(l)|^2 = 100/9000 = 1/90$, and $\tfrac12(1/90)(40) = 2/9$ W ✓.

        **Speed path.** With $Z_g = Z_0$, $|V^+| = \tilde F/2$ immediately, and the power is $(|V^+|^2/2Z_0)(1 - |\Gamma_L|^2)$. You need $Z(l)$ only if the question asks for $\tilde V(l)$ or $\tilde I(l)$.

        **Where points go.** Dividing $\tilde F$ between $Z_g$ and $Z_L$ (the line is not a wire). Dropping the $\tfrac12$ in the power. Saying the load voltage is $|V^+| = 5$ V (it is $|V^+||1 + \Gamma_L|$).

        ### Worked example 3: reading a load from its standing wave

        !!graded Problem
          On a $50\ \Omega$ line with $\lambda = 48$ cm, you measure VSWR $= 3$ and find the first voltage minimum $6$ cm from the load. What is $Z_L$?

        **Step 1: $|\Gamma_L|$.** $(3 - 1)/(3 + 1) = \tfrac12$.

        **Step 2: $\Gamma$ at the minimum.** At a voltage minimum, $\Gamma(d)$ is real and negative:
        $$\Gamma(d_{\min}) = -\tfrac12$$
        **Step 3: undo the walk.** $d_{\min} = 6/48 = \lambda/8$, so $2\beta d_{\min} = 90°$. $\Gamma(d) = \Gamma_Le^{-j2\beta d}$, so going back to the load turns $\Gamma$ **counterclockwise** by $90°$:
        $$\Gamma_L = \Gamma(d_{\min})\,e^{+j90°} = -\tfrac12\cdot j = -j\tfrac12$$
        **Step 4: $Z_L$.**
        $$Z_L = 50\,\frac{1 - j\tfrac12}{1 + j\tfrac12} = 50\,\frac{2 - j}{2 + j}$$
        Multiply the top and the bottom by $2 - j$. The bottom is 5; the top is $(2 - j)^2 = 4 - j4 - 1 = 3 - j4$:
        $$Z_L = 10(3 - j4) = 30 - j40\ \Omega$$
        **Check.** $\theta_L = -90° = 270°$ puts the first maximum at $270°/720° = 3/8$ of a wavelength and the first minimum at $\lambda/8$ ✓. A capacitive load (negative reactance) has its first minimum within $\lambda/4$ of the load.

        **Speed path.** "Minimum" means $\Gamma = -|\Gamma_L|$; "maximum" means $+|\Gamma_L|$. Then turn counterclockwise by $2\beta d$ to get back to the load.

        **Where points go.** Using $+\tfrac12$ at a minimum. Turning clockwise (that gives $30 + j40$, the conjugate).

        ### The whole topic on one table

        | Quantity | Formula | Where it came from |
        |---|---|---|
        | $\tilde V(d)$ | $V^+e^{j\beta d}(1 + \Gamma(d))$ | telegrapher's equations, $d = l - z$ |
        | $\tilde I(d)$ | $(V^+/Z_0)e^{j\beta d}(1 - \Gamma(d))$ | the backward wave's current is $-V^-/Z_0$ |
        | $\Gamma_L$ | $(Z_L - Z_0)/(Z_L + Z_0)$ | Ohm's law at the load |
        | $\Gamma(d)$ | $\Gamma_Le^{-j2\beta d}$ | reflected over incident at $d$ |
        | $Z(d)$ | $Z_0(1 + \Gamma(d))/(1 - \Gamma(d))$ | $\tilde V/\tilde I$ |
        | $Z(d)$ | $Z_0(Z_L + jZ_0\tan\beta d)/(Z_0 + jZ_L\tan\beta d)$ | Euler on the line above |
        | VSWR | $(1 + |\Gamma_L|)/(1 - |\Gamma_L|) = z(d_{\max})$ | largest over smallest $|1 + \Gamma|$ |
        | $P$ | $(|V^+|^2/2Z_0)(1 - |\Gamma_L|^2)$ | $\tfrac12\Re\{\tilde V\tilde I^*\}$ |
        | $\tilde V(l)$ | $\tilde F\,Z(l)/(Z_g + Z(l))$ | the generator sees $Z(l)$ |

        !!mistake Common mistakes
          - **Mixing $z$ and $d$.** Measured from the load, the incident wave is $e^{+j\beta d}$. A formula with $e^{-j\beta d}$ on $V^+$ is in the wrong coordinate.
          - **Dropping the 2 in $e^{-j2\beta d}$.** $\Gamma(d)$ turns by $2\beta d$: $90°$ per $\lambda/8$, $180°$ per $\lambda/4$.
          - **Turning $\Gamma$ the wrong way.** Toward the generator the angle **falls** (clockwise). Back toward the load it rises.
          - **$+$ in the current.** $\tilde I(d)$ has $1 - \Gamma(d)$. The voltage has $1 + \Gamma(d)$.
          - **A negative $d_{\max}$.** Write $\theta_L$ between $0°$ and $360°$ before dividing by $720°$.
          - **VSWR below 1.** It is the maximum over the minimum.
          - **$|V^+| = \tilde F/2$ when $Z_g \ne Z_0$.** The shortcut needs a matched generator. Otherwise use the divider and $V^+ = \tilde V(l)e^{-j\beta l}/(1 + \Gamma(l))$.
          - **Forgetting $1 - |\Gamma_L|^2$** in the power, or the $\tfrac12$.

        !!key Speed tricks
          - **Turn, don't compute.** $\lambda/8$: multiply $\Gamma$ by $-j$. $\lambda/4$: flip its sign. $\lambda/2$: nothing changes.
          - **Quarter wave:** $Z \to Z_0^2/Z$. **Half wave:** $Z$ repeats.
          - **$\lambda/8$:** $\tan\beta d = 1$, so $z = (z_L + j)/(1 + jz_L)$. At $3\lambda/8$, replace $j$ by $-j$.
          - **Resistor loads:** VSWR $= R_L/Z_0$ or $Z_0/R_L$, whichever is bigger; voltage maximum at the load if $R_L > Z_0$, minimum if $R_L < Z_0$.
          - **VSWR to $|\Gamma|$:** $2 \to \tfrac13$, $3 \to \tfrac12$, $4 \to \tfrac35$, $5 \to \tfrac23$. Delivered fraction $1 - |\Gamma|^2$: $\tfrac89$, $\tfrac34$, $\tfrac{16}{25}$, $\tfrac59$.
          - **$|Z_L| = Z_0$** makes $\Gamma_L$ purely imaginary: the extremes sit at $\lambda/8$ and $3\lambda/8$.
          - **Matched generator:** $|V^+| = \tilde F/2$, no matter what is at the other end.
          - **Reactive load:** $|\Gamma_L| = 1$, VSWR $= \infty$, no power.

        ### Check questions
      `, { we1: { svg: envFig(Cx.of(0, 1 / 3), { xt: [[0.125, '\\tfrac{\\lambda}{8}'], [0.375, '\\tfrac{3\\lambda}{8}'], [0.625, '\\tfrac{5\\lambda}{8}'], [0.875, '\\tfrac{7\\lambda}{8}']] }), cap: 'Worked example 1: $\\Gamma_L = j/3$. Solid $|\\tilde V|/|V^+|$ peaks at $\\lambda/8$ and dips at $3\\lambda/8$; dashed (current) does the opposite. VSWR $= (4/3)/(2/3) = 2$.' } }),
      Q(md`Why does $Z(d)$ repeat every $\lambda/2$ along a line, and not every $\lambda$?`,
        [md`$\Gamma(d)$ turns by $2\beta d$, a full circle every $\lambda/2$`, md`The voltage itself repeats every $\lambda/2$`, md`Reflections double the frequency`, md`It does repeat every $\lambda$; $\lambda/2$ is only for shorts`], 0,
        [null, md`$\tilde V(d)$ carries $e^{j\beta d}$ in front, which needs a full $\lambda$ to come back. Its **size** repeats every $\lambda/2$; the phasor does not.`, md`Nothing changes the frequency on a linear line.`, md`It repeats every $\lambda/2$ for any load, because $Z(d)$ depends only on $\Gamma(d)$.`],
        md`$Z(d) = Z_0(1 + \Gamma(d))/(1 - \Gamma(d))$, and $\Gamma(d + \lambda/2) = \Gamma(d)e^{-j2\pi} = \Gamma(d)$.`),
      Q(md`A $75\ \Omega$ line ends in a $75\ \Omega$ resistor. Which is right?`,
        [md`VSWR $= 1$, and $Z(d) = 75\ \Omega$ at every $d$`, md`VSWR $= 0$, and $Z(d) = 75\ \Omega$ at every $d$`, md`VSWR $= 1$, but $Z(d)$ changes with $d$`, md`VSWR $= \infty$, since no wave comes back`], 0,
        [null, md`The VSWR is a ratio of a maximum to a minimum: it is never below 1.`, md`With $\Gamma_L = 0$, $\Gamma(d) = 0$ everywhere, and $Z(d) = Z_0(1 + 0)/(1 - 0) = Z_0$.`, md`No reflected wave means a flat pattern: max = min, VSWR = 1. $\infty$ is total reflection.`],
        md`$\Gamma_L = 0$, so only the incident wave exists. Its size is the same everywhere (VSWR = 1), and $\tilde V/\tilde I = Z_0$ at every point.`),
      Q(md`At a voltage **minimum** on the line, $\Gamma(d)$ equals…`,
        [md`$-|\Gamma_L|$`, md`$+|\Gamma_L|$`, md`$0$`, md`$-1$`], 0,
        [null, md`That is the value at a voltage maximum, where $|1 + \Gamma|$ is largest.`, md`$|\Gamma(d)| = |\Gamma_L|$ at every point. It never vanishes unless the load is matched.`, md`Only a short or an open has $|\Gamma_L| = 1$.`],
        md`$|1 + \Gamma(d)|$ is smallest when $\Gamma(d)$ points straight along $-1$: $\Gamma = -|\Gamma_L|$.`),
      Q(md`How far apart are a voltage maximum and the nearest voltage minimum?`,
        [md`$\lambda/4$`, md`$\lambda/2$`, md`$\lambda/8$`, md`$\lambda$`], 0,
        [null, md`$\lambda/2$ is from one maximum to the next.`, md`$\lambda/8$ turns $\Gamma(d)$ by only $90°$; you need $180°$ to go from $+|\Gamma|$ to $-|\Gamma|$.`, md`That is two full periods of the pattern.`],
        md`From maximum to minimum, $\Gamma(d)$ must turn $180°$: $2\beta d = \pi$, so $d = \lambda/4$.`),
      Q(md`A line ends in $Z_L = -j80\ \Omega$. How much average power does the load take?`,
        [md`None: $|\Gamma_L| = 1$`, md`Some, since $|Z_L| \neq Z_0$`, md`All of it, since there is no resistance to stop it`, md`It depends on the line's length`], 0,
        [null, md`A pure reactance has $|\Gamma_L| = 1$ whatever its size, so $1 - |\Gamma_L|^2 = 0$.`, md`Resistance absorbs power. A reactance only stores and returns it.`, md`By section 7 the power is the same at every $d$, and at the load it is zero.`],
        md`$|{-j80} - Z_0| = |{-j80} + Z_0|$, so $|\Gamma_L| = 1$ and $P = (|V^+|^2/2Z_0)(1 - 1) = 0$.`),
      Q(md`Which identity follows from $\Gamma(d + \lambda/4) = -\Gamma(d)$?`,
        [md`$z(d + \lambda/4) = 1/z(d)$`, md`$z(d + \lambda/4) = -z(d)$`, md`$z(d + \lambda/4) = z^*(d)$`, md`$z(d + \lambda/4) = z(d)$`], 0,
        [null, md`$z$ is $(1 + \Gamma)/(1 - \Gamma)$. Changing the sign of $\Gamma$ swaps the top and the bottom; it does not negate the fraction.`, md`A conjugate needs $\Gamma \to \Gamma^*$, not $\Gamma \to -\Gamma$.`, md`That takes $\lambda/2$.`],
        md`$(1 - \Gamma)/(1 + \Gamma)$ is the reciprocal of $(1 + \Gamma)/(1 - \Gamma)$. With units: $Z(d + \lambda/4) = Z_0^2/Z(d)$.`),
      Q(md`On a lossless line, the average power that passes $d = \lambda/8$ compared with what passes $d = 3\lambda/8$ is…`,
        [md`the same`, md`larger at $\lambda/8$, closer to the load`, md`larger at $3\lambda/8$, closer to the generator`, md`larger wherever $|\tilde V|$ is larger`], 0,
        [null, md`$P(d) = (|V^+|^2/2Z_0)(1 - |\Gamma_L|^2)$ has no $d$ in it.`, md`A lossless line cannot use up power between two points.`, md`A large voltage comes with a small current there. The product's real part is the same everywhere.`],
        md`Section 7: $P$ does not depend on $d$. Whatever enters the line reaches the load.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** $\Gamma_L$ from the load, then turn it by $90°$ per $\lambda/8$. Each card is one move. Eight right completes a card.
      `),
      Object.assign(G('rf_w6v_gamma', { need: 8 }), { id: 'w6-vd.r0' }),
      R(md`
        ### Practice, level 1: the pattern

        **The trick:** VSWR $= (1 + |\Gamma|)/(1 - |\Gamma|)$; a maximum where $\Gamma(d) = +|\Gamma|$, a minimum where it is $-|\Gamma|$; $z(d_{\max}) = $ VSWR.
      `),
      Object.assign(G('rf_w6v_vswr', { need: 8 }), { id: 'w6-vd.r1' }),
      R(md`
        ### Practice, level 1: impedance along the line

        **The trick:** $\lambda/4$ inverts, $\lambda/2$ repeats, $\lambda/8$ has $\tan\beta d = \pm1$.
      `),
      Object.assign(G('rf_w6v_zd', { need: 8 }), { id: 'w6-vd.r2' }),
      R(md`
        ### Practice, level 1: voltages, currents and power

        **The trick:** $|\tilde V|$ swings between $|V^+|(1 \pm |\Gamma_L|)$; the delivered power is $(|V^+|^2/2Z_0)(1 - |\Gamma_L|^2)$; a matched generator launches $\tilde F/2$.
      `),
      Object.assign(G('rf_w6v_read', { need: 8 }), { id: 'w6-vd.r3' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w6v_load', { need: 2 }),
      G('w6v_zin', { need: 2 }),
      G('w6v_fromvswr', { need: 2 }),
      G('w6v_power', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        The whole circuit: from the load through the line to the generator, and back to the power in the load.
      `),
      G('w6v_circuit', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- Topic 17, level 1
  const RPAIRS = [[50, 2], [50, 3], [50, 4], [50, 1 / 2], [75, 2], [75, 1 / 3], [100, 1 / 2], [100, 1 / 4], [100, 3], [60, 1 / 3]];
  const VS = [[1 / 3, 2], [1 / 2, 3], [3 / 5, 4], [2 / 3, 5], [1 / 5, 1.5], [1 / 9, 1.25]];

  GENS.rf_w6v_gamma = () => one([
    // a resistor
    () => {
      const [Z0, r] = pick(RPAIRS), RL = Z0 * r, g = (r - 1) / (r + 1);
      return MC('Γ_L of a resistor', md`A $${Z0}\ \Omega$ line ends in a $${p(RL)}\ \Omega$ resistor. $\Gamma_L$ is…`, `$${fr(g)}$`,
        [[`$${fr(-g)}$`, md`That is $(Z_0 - Z_L)/(Z_0 + Z_L)$. The load comes first in the top: $Z_L - Z_0$.`],
          [`$${fr((r - 1) / r)}$`, md`That divides by $Z_L$ alone. The bottom is $Z_L + Z_0$.`],
          [`$${fr(r - 1)}$`, md`That divides by $Z_0$ alone. The bottom is $Z_L + Z_0$.`],
          [`$${fr(1 + g)}$`, md`That is $1 + \Gamma_L$, the load voltage over the incident voltage.`]],
        md`$\Gamma_L = (${p(RL)} - ${Z0})/(${p(RL)} + ${Z0}) = ${fr(g)}$. ${g > 0 ? 'A resistor above $Z_0$ gives a positive $\\Gamma_L$.' : 'A resistor below $Z_0$ gives a negative $\\Gamma_L$.'}`);
    },
    // a pure reactance of size Z0
    () => {
      const Z0 = pick([50, 75, 100]), s = pick([1, -1]), m = s < 0 ? '-' : '';
      return MC('Γ_L of a reactance', md`A $${Z0}\ \Omega$ line ends in $Z_L = ${m}j${Z0}\ \Omega$. $\Gamma_L$ is…`, `$${m}j$`,
        [[`$${s < 0 ? '' : '-'}j$`, md`That has the sign flipped: it is $(Z_0 - Z_L)/(Z_0 + Z_L)$.`],
          ['$0$', md`$|Z_L| = Z_0$ is not a match. A match needs $Z_L = Z_0$: a real ${Z0} Ω.`],
          ['$1$', md`$+1$ is an open. A reactance reflects everything too, but with a phase.`],
          ['$-1$', md`$-1$ is a short. A reactance of ${Z0} Ω is not a short.`]],
        md`$\Gamma_L = (${m}j - 1)/(${m}j + 1)$ after dividing by ${Z0}. Multiply top and bottom by the conjugate of the bottom: the result is $${m}j$. Its size is 1, as for every reactance.`);
    },
    // turn Gamma along the line
    () => {
      const mg = pick([0.2, 0.5, 0.8]), th = pick([0, 90, 180, -90, 60]), k = pick([1, 2, 3, 4]);
      return MC('Turn Γ along the line', md`$\Gamma_L = ${pol(mg, th)}$. At $d = ${LEN8[k]}$ from the load, $\Gamma(d)$ is…`, `$${pol(mg, th - 90 * k)}$`,
        [[`$${pol(mg, th + 90 * k)}$`, md`That turns counterclockwise. The angle **falls** by $2\beta d$ as you walk toward the generator.`],
          [`$${pol(mg, th - 45 * k)}$`, md`That turns by $\beta d$. The ratio of the two waves turns by $2\beta d$.`],
          [`$${pol(mg, th)}$`, md`Only the size of $\Gamma(d)$ is fixed. Its angle turns with $d$.`],
          [`$${pol(mg, th - 90 * k - 90)}$`, md`That turns one step too far. Each $\lambda/8$ is $90°$.`],
          ['$0$', md`On a lossless line the reflected wave never dies out: $|\Gamma(d)| = |\Gamma_L|$.`]],
        md`$2\beta d = 4\pi d/\lambda = ${90 * k}°$. So $\Gamma(d) = ${pol(mg, th)}\cdot e^{-j${90 * k}°} = ${pol(mg, th - 90 * k)}$.`);
    },
    // the load from Gamma_L
    () => {
      const Z0 = pick([50, 100]), gg = pick([[1 / 3, 0], [1 / 2, 0], [-1 / 3, 0], [-1 / 2, 0], [0, 1], [0, -1], [3 / 5, 0]]);
      const g = Cx.of(gg[0], gg[1]), ZL = zOf(g).scale(Z0), one1 = Cx.of(1);
      const W = [[ohm(one1.sub(g).div(one1.add(g)).scale(Z0)), md`That is $Z_0(1 - \Gamma_L)/(1 + \Gamma_L)$, upside down.`],
        [ohm(one1.add(g).scale(Z0)), md`That is only the top, $Z_0(1 + \Gamma_L)$. Divide by $1 - \Gamma_L$.`],
        [ohm(g.scale(Z0)), md`$Z_L$ is not $Z_0\Gamma_L$. Invert $\Gamma_L = (Z_L - Z_0)/(Z_L + Z_0)$.`],
        [ohm(one1.sub(g).scale(Z0)), md`That multiplies by $1 - \Gamma_L$, which belongs in the bottom.`]];
      return MC('The load from Γ_L', md`On a $${Z0}\ \Omega$ line, $\Gamma_L = ${cfr(g)}$. The load is…`, ohm(ZL), W,
        md`$Z_L = Z_0\dfrac{1 + \Gamma_L}{1 - \Gamma_L}$ with $\Gamma_L = ${cfr(g)}$ gives $${ctx(ZL)}\ \Omega$.`);
    },
    // ideas
    () => one([
      () => MC('What stays fixed', md`On a lossless line with any load, which of these is the same at every $d$?`, md`$|\Gamma(d)|$`,
        [[md`the angle of $\Gamma(d)$`, md`The angle falls by $2\beta d$.`], [md`$Z(d)$`, md`$Z(d)$ changes with $d$ unless the load is matched.`], [md`$|\tilde V(d)|$`, md`That is the standing wave: it swings between $|V^+|(1 \pm |\Gamma_L|)$.`], [md`$\tilde I(d)$`, md`The current phasor changes in size and phase along the line.`]],
        md`$\Gamma(d) = \Gamma_Le^{-j2\beta d}$ and $|e^{-j2\beta d}| = 1$. Only the size survives.`),
      () => MC('A quarter wave further', md`$\Gamma(d + \lambda/4)$ equals…`, md`$-\Gamma(d)$`,
        [[md`$\Gamma(d)$`, md`That takes $\lambda/2$.`], [md`$-j\Gamma(d)$`, md`That is $\lambda/8$ further: a $90°$ turn.`], [md`$\Gamma^*(d)$`, md`A conjugate flips the sign of the angle. Walking subtracts a fixed amount from it.`], [md`$1/\Gamma(d)$`, md`The size cannot change, and $1/\Gamma$ would have size $1/|\Gamma|$.`]],
        md`$2\beta(\lambda/4) = \pi$, and $e^{-j\pi} = -1$.`),
      () => MC('A half wave further', md`$Z(d + \lambda/2)$ equals…`, md`$Z(d)$`,
        [[md`$Z_0^2/Z(d)$`, md`That happens after $\lambda/4$.`], [md`$-Z(d)$`, md`A negative resistance would make power. $\Gamma$ turns a full circle in $\lambda/2$, so nothing changes.`], [md`$Z^*(d)$`, md`That is not a rule. After $\lambda/2$, $\Gamma(d)$ is back where it started.`], [md`$Z_0$`, md`Only a matched line has $Z = Z_0$ everywhere.`]],
        md`$2\beta(\lambda/2) = 2\pi$: $\Gamma(d)$ turns a full circle, so $Z(d)$ repeats.`),
    ]),
  ]);

  GENS.rf_w6v_vswr = () => one([
    // VSWR from |Gamma|
    () => {
      const [g, S] = pick(VS);
      return MC('VSWR from |Γ_L|', md`$|\Gamma_L| = ${fr(g)}$. The VSWR is…`, `$${p(S)}$`,
        [[`$${fr(1 / S)}$`, md`That is the minimum over the maximum. The VSWR is max over min, so it is at least 1.`],
          [`$${fr(1 + g)}$`, md`That is $1 + |\Gamma_L|$ alone. Divide it by $1 - |\Gamma_L|$.`],
          [`$${fr(1 / (1 - g))}$`, md`The top is $1 + |\Gamma_L|$, not 1.`],
          [`$${fr((1 + g * g) / (1 - g * g))}$`, md`That squares $|\Gamma_L|$. The VSWR is a ratio of voltages, so $|\Gamma_L|$ enters to the first power.`]],
        md`VSWR $= (1 + ${fr(g)})/(1 - ${fr(g)}) = ${p(S)}$.`);
    },
    // |Gamma| from VSWR
    () => {
      const [g, S] = pick(VS);
      return MC('|Γ_L| from the VSWR', md`A line has VSWR $= ${p(S)}$. Then $|\Gamma_L|$ is…`, `$${fr(g)}$`,
        [[`$${fr((S + 1) / (S - 1))}$`, md`That is upside down, and bigger than 1, which no passive load can give.`],
          [`$${fr(1 / S)}$`, md`$1/\text{VSWR}$ is the normalized impedance at a voltage minimum, not $|\Gamma_L|$.`],
          [`$${fr((S - 1) / S)}$`, md`The bottom is $\text{VSWR} + 1$.`],
          [`$${fr(g * g)}$`, md`That is $|\Gamma_L|^2$, the fraction of the power that comes back.`]],
        md`$|\Gamma_L| = (S - 1)/(S + 1) = ${p(S - 1)}/${p(S + 1)} = ${fr(g)}$.`);
    },
    // a resistor: VSWR and what sits at the load
    () => {
      const [Z0, r] = pick(RPAIRS), RL = Z0 * r, S = Math.max(r, 1 / r), up = r > 1;
      const at = (w) => `a voltage ${w} at the load`;
      return MC('A resistor: VSWR and where', md`A $${Z0}\ \Omega$ line ends in $${p(RL)}\ \Omega$. Which is right?`, md`VSWR $= ${p(S)}$, with ${at(up ? 'maximum' : 'minimum')}`,
        [[md`VSWR $= ${p(S)}$, with ${at(up ? 'minimum' : 'maximum')}`, up ? md`$R_L > Z_0$ gives $\Gamma_L > 0$: incident and reflected add at the load.` : md`$R_L < Z_0$ gives $\Gamma_L < 0$: incident and reflected subtract at the load.`],
          [md`VSWR $= ${fr(1 / S)}$, with ${at(up ? 'maximum' : 'minimum')}`, md`The VSWR is never below 1. For a resistor it is the larger of $R_L/Z_0$ and $Z_0/R_L$.`],
          [md`VSWR $= ${fr(Math.abs((r - 1) / (r + 1)))}$, with ${at(up ? 'maximum' : 'minimum')}`, md`That is $|\Gamma_L|$, not the VSWR.`],
          [md`VSWR $= ${p(S)}$, with a flat pattern`, md`A flat pattern needs VSWR $= 1$: a matched load.`]],
        md`$\Gamma_L = (${p(RL)} - ${Z0})/(${p(RL)} + ${Z0}) = ${fr((r - 1) / (r + 1))}$, so VSWR $= ${p(S)}$. ${up ? 'Positive' : 'Negative'} $\Gamma_L$ puts a ${up ? 'maximum' : 'minimum'} at the load.`);
    },
    // Z at a voltage maximum or minimum
    () => {
      const [g, S] = pick(VS.slice(0, 4)), Z0 = pick([50, 100]), mx = pick([true, false]);
      const zm = mx ? S * Z0 : Z0 / S, zo = mx ? Z0 / S : S * Z0;
      return MC(`Z at a voltage ${mx ? 'maximum' : 'minimum'}`, md`A $${Z0}\ \Omega$ line has VSWR $= ${p(S)}$. At a voltage ${mx ? 'maximum' : 'minimum'}, $Z(d)$ is…`, `$${p(zm)}\\ \\Omega$`,
        [[`$${p(zo)}\\ \\Omega$`, md`That is the value at a voltage ${mx ? 'minimum' : 'maximum'}. Large voltage with small current means large $Z$.`],
          [`$${Z0}\\ \\Omega$`, md`Only a matched line has $Z = Z_0$ everywhere.`],
          [`$j${p(zm)}\\ \\Omega$`, md`At a voltage extreme $\Gamma(d)$ is real, so $Z(d)$ is real.`],
          [`$${p(Z0 * (1 + (mx ? g : -g)))}\\ \\Omega$`, md`That is only the top of $Z_0(1 \pm |\Gamma_L|)/(1 \mp |\Gamma_L|)$.`]],
        md`At a voltage ${mx ? 'maximum' : 'minimum'}, $\Gamma(d) = ${mx ? '+' : '-'}|\Gamma_L|$, so $Z = ${mx ? 'Z_0\\cdot\\text{VSWR}' : 'Z_0/\\text{VSWR}'} = ${p(zm)}\ \Omega$.`);
    },
    // where the first maximum or minimum sits
    () => {
      const th = pick([90, -90, 60, -60, 45, 120, 180, -120]), mx = pick([true, false]);
      const tp = ((th % 360) + 360) % 360;
      const dmx = tp / 720, dmn = ((tp + 180) % 360) / 720;
      const right = mx ? dmx : dmn, other = mx ? dmn : dmx, tq = mx ? tp : (tp + 180) % 360;
      const o = (x) => (Math.abs(x) < 1e-12 ? md`$d = 0$, at the load` : `$d = ${lam(x)}$`);
      const W = [[o(other), md`That is the first ${mx ? 'minimum' : 'maximum'}. The two are a quarter wave apart.`],
        [o(tq / 360), md`That uses $\beta d$. The angle of $\Gamma(d)$ falls by $2\beta d$, so divide by $720°$.`],
        [o(right + 0.5), md`That is the second one. They repeat every $\lambda/2$, and the first is closer.`]];
      if (th < 0) W.push([`$d = ${lam((mx ? th : th + 180) / 720)}$`, md`A negative $d$ is beyond the load. Write $\theta_L$ between $0°$ and $360°$ first.`]);
      W.push([o(((360 - tq) % 360) / 720), md`That turns the wrong way. Toward the generator the angle of $\Gamma(d)$ falls.`]);
      return MC(`The first voltage ${mx ? 'maximum' : 'minimum'}`, md`$\Gamma_L = ${pol(0.5, th)}$. The first voltage ${mx ? 'maximum' : 'minimum'} in front of the load is at…`, o(right), W,
        md`${mx ? 'A maximum needs $\\Gamma(d) = +|\\Gamma_L|$' : 'A minimum needs $\\Gamma(d) = -|\\Gamma_L|$'}: $2\beta d = ${tq}°$, so $d/\lambda = ${tq}°/720° = ${fr(right)}$.`);
    },
    // fraction of power delivered
    () => {
      const [g, S] = pick(VS);
      return MC('Power that reaches the load', md`A line has VSWR $= ${p(S)}$. What fraction of the incident power reaches the load?`, `$${fr(1 - g * g)}$`,
        [[`$${fr(1 - g)}$`, md`That is $1 - |\Gamma_L|$. Power goes as the square: $1 - |\Gamma_L|^2$.`],
          [`$${fr(g * g)}$`, md`That is the fraction that comes back, $|\Gamma_L|^2$.`],
          [`$${fr(1 / S)}$`, md`$1/\text{VSWR}$ is not a power ratio. Get $|\Gamma_L| = (S - 1)/(S + 1)$ first.`],
          [`$${fr(g)}$`, md`That is $|\Gamma_L|$, a voltage ratio of the reflected wave.`]],
        md`$|\Gamma_L| = (S - 1)/(S + 1) = ${fr(g)}$, so the delivered fraction is $1 - ${fr(g * g)} = ${fr(1 - g * g)}$.`);
    },
  ]);

  GENS.rf_w6v_zd = () => one([
    // quarter and half waves, resistor loads
    () => {
      const [Z0, ZL] = pick([[50, 25], [50, 100], [50, 10], [50, 250], [50, 200], [100, 50], [100, 400], [75, 25]]);
      const [n, ltx] = pick([[1, '\\lambda/4'], [3, '3\\lambda/4'], [5, '5\\lambda/4'], [2, '\\lambda/2'], [4, '\\lambda'], [6, '3\\lambda/2']]);
      const odd = n % 2 === 1, right = odd ? (Z0 * Z0) / ZL : ZL;
      const om = (x) => `$${p(+x.toPrecision(3))}\\ \\Omega$`;
      return MC('Quarter and half waves', md`A $${Z0}\ \Omega$ line of length $${ltx}$ ends in $${ZL}\ \Omega$. The generator sees…`, om(right),
        [[om(odd ? ZL : (Z0 * Z0) / ZL), odd ? md`An odd number of quarter waves inverts the load. Only a whole number of half waves repeats it.` : md`A whole number of half waves repeats the load. Inversion needs an odd number of quarter waves.`],
          [om(Z0), md`Only a matched load looks like $Z_0$ from everywhere.`],
          [om((ZL * ZL) / Z0), md`That is $Z_L^2/Z_0$, the inversion upside down.`],
          [om(Math.sqrt(Z0 * ZL)), md`$\sqrt{Z_0Z_L}$ is the line you would need to match $Z_L$ with a quarter wave, not what the generator sees.`]],
        odd ? md`$${ltx}$ is an odd number of quarter waves, so $Z = Z_0^2/Z_L = ${Z0 * Z0}/${ZL} = ${p(+right.toPrecision(3))}\ \Omega$.` : md`$${ltx}$ is a whole number of half waves: $\Gamma$ turns full circles, so $Z = Z_L = ${ZL}\ \Omega$.`);
    },
    // eighths of a wave, resistor loads
    () => {
      const [Z0, r] = pick([[50, 2], [50, 1 / 2], [50, 3], [100, 2], [100, 1 / 2], [60, 1 / 3], [60, 3]]);
      const k = pick([1, 3, 5, 7]), t = k % 4 === 1 ? 1 : -1;
      const zin = Cx.of(r, t).div(Cx.of(1, t * r)).scale(Z0);
      return MC('Eighths of a wave', md`A $${Z0}\ \Omega$ line, $${LEN8[k]}$ long, ends in $${p(Z0 * r)}\ \Omega$. The generator sees…`, ohm(zin),
        [[ohm(zin.conj()), md`That has the wrong sign of $\tan\beta d$. At ${LEN8[k]}, $\tan\beta d = ${t}$.`],
          [ohm((Z0 * Z0) / (Z0 * r)), md`That is the quarter-wave inversion. This line is an odd number of eighths.`],
          [ohm(Z0 * r), md`That is the load. It comes back only every $\lambda/2$.`],
          [ohm(Cx.of(r, -t).div(Cx.of(1, t * r)).scale(Z0)), md`That has the sign of $j$ wrong in the top only. Top and bottom both carry $+j\tan\beta d$.`]],
        md`$\tan\beta d = ${t}$ and $z_L = ${fr(r)}$: $z = (z_L ${t > 0 ? '+' : '-'} j)/(1 ${t > 0 ? '+' : '-'} jz_L) = ${ctx(zin.scale(1 / Z0))}$, so $Z = ${ctx(zin)}\ \Omega$.`);
    },
    // Z from Gamma at a point
    () => {
      const Z0 = pick([50, 100]), gg = pick([[1 / 2, 0], [-1 / 2, 0], [1 / 3, 0], [-1 / 3, 0], [0, 1], [0, -1]]);
      const g = Cx.of(gg[0], gg[1]), z = zOf(g).scale(Z0), one1 = Cx.of(1);
      return MC('Z from Γ at a point', md`At a point on a $${Z0}\ \Omega$ line, $\Gamma(d) = ${cfr(g)}$. $Z(d)$ there is…`, ohm(z),
        [[ohm(one1.sub(g).div(one1.add(g)).scale(Z0)), md`That is $Z_0(1 - \Gamma)/(1 + \Gamma)$, upside down: the admittance form.`],
          [ohm(g.scale(Z0)), md`$Z$ is $Z_0(1 + \Gamma)/(1 - \Gamma)$, not $Z_0\Gamma$.`],
          [ohm(one1.add(g).scale(Z0)), md`That is only the top. Divide by $1 - \Gamma$.`],
          [ohm(Cx.of(Z0)), md`$Z = Z_0$ needs $\Gamma = 0$ at that point.`]],
        md`$Z = Z_0(1 + \Gamma)/(1 - \Gamma) = ${ctx(z)}\ \Omega$.`);
    },
    // which formula
    () => one([
      () => MC('The tangent form', md`In terms of the load, $Z(d)$ is…`, md`$Z_0\dfrac{Z_L + jZ_0\tan\beta d}{Z_0 + jZ_L\tan\beta d}$`,
        [[md`$Z_0\dfrac{Z_L - jZ_0\tan\beta d}{Z_0 - jZ_L\tan\beta d}$`, md`That is the formula with $d \to -d$: a point beyond the load.`],
          [md`$Z_0\dfrac{Z_0 + jZ_L\tan\beta d}{Z_L + jZ_0\tan\beta d}$`, md`That is upside down. At $d = 0$ it gives $Z_0^2/Z_L$, not $Z_L$.`],
          [md`$\dfrac{Z_L + jZ_0\tan\beta d}{Z_0 + jZ_L\tan\beta d}$`, md`That has no units: it is $z(d)$, missing the factor $Z_0$.`],
          [md`$Z_L\dfrac{Z_0 + jZ_L\tan\beta d}{Z_L + jZ_0\tan\beta d}$`, md`At $\beta d = \pi/2$ it gives $Z_L^2/Z_0$. A quarter wave gives $Z_0^2/Z_L$.`]],
        md`Check at $d = 0$: $Z_0Z_L/Z_0 = Z_L$ ✓. At $\lambda/4$: $Z_0^2/Z_L$ ✓.`),
      () => MC('From Γ(d)', md`In terms of $\Gamma(d)$, $Z(d)$ is…`, md`$Z_0\dfrac{1 + \Gamma(d)}{1 - \Gamma(d)}$`,
        [[md`$Z_0\dfrac{1 - \Gamma(d)}{1 + \Gamma(d)}$`, md`That is $Z_0^2$ times the admittance. The voltage has $1 + \Gamma$ and the current $1 - \Gamma$.`],
          [md`$Z_0\dfrac{1 + \Gamma_L}{1 - \Gamma_L}$`, md`That is $Z_L$ only. Away from the load use $\Gamma(d)$.`],
          [md`$Z_L\dfrac{1 + \Gamma(d)}{1 - \Gamma(d)}$`, md`The reference is $Z_0$. Each wave alone has $\tilde V/\tilde I = \pm Z_0$.`],
          [md`$Z_0\,\Gamma(d)$`, md`At a matched point $\Gamma = 0$, which would give $Z = 0$. It should give $Z_0$.`]],
        md`$Z = \tilde V/\tilde I = \dfrac{V^+e^{j\beta d}(1 + \Gamma)}{(V^+/Z_0)e^{j\beta d}(1 - \Gamma)}$.`),
    ]),
    // quarter wave with a complex load
    () => {
      const [Z0, a, b] = pick([[50, 25, 25], [50, 50, 50], [50, 100, 100], [50, 20, -40], [100, 50, 50], [100, 100, -100]]);
      const ZL = Cx.of(a, b), zin = Cx.of(Z0 * Z0).div(ZL);
      return MC('A quarter wave, complex load', md`A $${Z0}\ \Omega$ line, $\lambda/4$ long, ends in $${ctx(ZL)}\ \Omega$. The generator sees…`, ohm(zin),
        [[ohm(ZL), md`That is the load. A quarter wave inverts it.`],
          [ohm(zin.conj()), md`Dividing by a complex number flips the sign of its angle. An inductive load comes back capacitive.`],
          [ohm(ZL.conj()), md`That only flips the reactance. Its size must change too: $|Z| = Z_0^2/|Z_L|$.`],
          [ohm(ZL.mul(ZL).scale(1 / Z0)), md`That is $Z_L^2/Z_0$, the inversion upside down.`]],
        md`$Z = Z_0^2/Z_L = ${Z0 * Z0}/(${ctx(ZL)})$. Multiply top and bottom by $${ctx(ZL.conj())}$: $${ctx(zin)}\ \Omega$.`);
    },
  ]);

  GENS.rf_w6v_read = () => one([
    // power delivered
    () => {
      const V = pick([10, 20]), Z0 = pick([50, 100]), [g] = pick(VS.slice(0, 4));
      const Pi = (V * V) / (2 * Z0), PL = Pi * (1 - g * g), w = (x) => `$${p(+x.toPrecision(3))}$ W`;
      return MC('Power into the load', md`$|V^+| = ${V}$ V on a $${Z0}\ \Omega$ line with $|\Gamma_L| = ${fr(g)}$. The power into the load is…`, w(PL),
        [[w(Pi), md`That is the incident power. A fraction $|\Gamma_L|^2$ of it comes back.`],
          [w(2 * PL), md`That drops the $\tfrac12$. Phasors are peak values.`],
          [w(Pi * (1 - g)), md`Power goes as the square: $1 - |\Gamma_L|^2$, not $1 - |\Gamma_L|$.`],
          [w(Pi * g * g), md`That is the reflected power.`]],
        md`$P = \dfrac{|V^+|^2}{2Z_0}(1 - |\Gamma_L|^2) = ${p(Pi)}\cdot${fr(1 - g * g)} = ${p(+PL.toPrecision(3))}$ W.`);
    },
    // largest or smallest voltage
    () => {
      const V = pick([6, 9, 12]), [g] = pick(VS.slice(0, 4)), mx = pick([true, false]);
      const v = (x) => `$${p(+x.toPrecision(3))}$ V`;
      return MC(`The ${mx ? 'largest' : 'smallest'} voltage`, md`$|V^+| = ${V}$ V and $|\Gamma_L| = ${fr(g)}$. The ${mx ? 'largest' : 'smallest'} $|\tilde V(d)|$ on the line is…`, v(V * (1 + (mx ? g : -g))),
        [[v(V * (1 - (mx ? g : -g))), md`That is the ${mx ? 'smallest' : 'largest'} one.`], [v(V), md`That is the incident wave alone. The reflected one adds or subtracts.`],
          [v(V * (1 + (mx ? 1 : -1) * g * g)), md`$|\Gamma_L|$ enters to the first power for voltages.`], [v(2 * V), md`$2|V^+|$ needs $|\Gamma_L| = 1$.`]],
        md`$|\tilde V| = |V^+||1 + \Gamma(d)|$ runs from $|V^+|(1 - |\Gamma_L|)$ to $|V^+|(1 + |\Gamma_L|)$: here ${v(V * (1 - g))} to ${v(V * (1 + g))}.`);
    },
    // which current formula
    () => MC('The current along the line', md`Which is $\tilde I(d)$?`, md`$\dfrac{V^+}{Z_0}e^{j\beta d}\bigl(1 - \Gamma(d)\bigr)$`,
      [[md`$\dfrac{V^+}{Z_0}e^{j\beta d}\bigl(1 + \Gamma(d)\bigr)$`, md`That is the voltage's shape. The reflected current enters with a minus sign.`],
        [md`$\dfrac{V^+}{Z_0}e^{-j\beta d}\bigl(1 - \Gamma(d)\bigr)$`, md`That is the $z$ sign. Measured back from the load, the incident wave carries $e^{+j\beta d}$.`],
        [md`$\dfrac{V^+}{Z_0}e^{j\beta d}\bigl(1 - \Gamma_L\bigr)$`, md`That is right only at $d = 0$. Elsewhere use $\Gamma(d)$.`],
        [md`$Z_0V^+e^{j\beta d}\bigl(1 - \Gamma(d)\bigr)$`, md`Current is voltage over $Z_0$.`]],
      md`$\tilde I = (V^+e^{j\beta d} - V^-e^{-j\beta d})/Z_0$; factor out $V^+e^{j\beta d}$.`),
    // a matched generator
    () => {
      const F = pick([6, 8, 10, 12, 20]), Z0 = pick([50, 75]), r = pick([2, 3, 1 / 2]), ZL = Z0 * r;
      const v = (x) => `$${p(+x.toPrecision(3))}$ V`;
      return MC('A matched generator', md`A generator with $\tilde F = ${F}$ V and $Z_g = ${Z0}\ \Omega$ drives a long $${Z0}\ \Omega$ line ending in $${p(ZL)}\ \Omega$. $|V^+|$ is…`, v(F / 2),
        [[v(F), md`Half of $\tilde F$ drops across $Z_g$ at launch.`], [v((F * ZL) / (Z0 + ZL)), md`That divides $\tilde F$ between $Z_g$ and the load. The generator sees $Z(l)$, and $V^+$ is only the incident wave.`],
          [v(F / 4), md`That halves twice. The launch is $\tau_g\tilde F$ with $\tau_g = \tfrac12$.`], [md`It depends on the line's length.`, md`With $Z_g = Z_0$ the reflected wave is absorbed at the generator, so the incident wave is $\tilde F/2$ in size for any length.`]],
        md`$Z_g = Z_0$: $V^+e^{j\beta l} = \tilde F/2$, so $|V^+| = ${p(F / 2)}$ V.`);
    },
    // the load voltage
    () => {
      const V = pick([6, 9, 12]), g = pick([1 / 3, -1 / 3, 1 / 2, -1 / 2]);
      const v = (x) => `$${p(+x.toPrecision(3))}$ V`;
      return MC('Voltage across the load', md`$V^+ = ${V}$ V and $\Gamma_L = ${fr(g)}$. The load voltage $\tilde V(0)$ is…`, v(V * (1 + g)),
        [[v(V * (1 - g)), md`That is $V^+(1 - \Gamma_L)$, the current's shape times $Z_0$.`], [v(V), md`That is the incident wave alone.`], [v(V * g), md`That is the reflected wave alone.`], [v(V * (1 + Math.abs(g)) * (g < 0 ? 1 : 1.5)), md`That is not $V^+ + V^-$. Add the two waves at $d = 0$.`]],
        md`$\tilde V(0) = V^+ + V^- = V^+(1 + \Gamma_L) = ${V}(1 ${g < 0 ? '-' : '+'} ${fr(Math.abs(g))}) = ${p(+(V * (1 + g)).toPrecision(3))}$ V.`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 17, level 2 and 3
  const ZT = [[0.8, 0.6], [0.8, -0.6], [0.6, 0.8], [0.6, -0.8], [1.4, 1.2], [1.4, -1.2], [1, 1], [1, -1], [0.5, 0.5], [0.5, -0.5], [2, 1], [2, -1]];
  const polT = (z) => { const a = deg(Cx.of(z).arg()); return `${f(Cx.of(z).abs())}\\,e^{${a < 0 ? '-' : ''}j${f(Math.abs(a))}°}`; };

  GENS.w6v_load = () => {
    const Z0 = pick([50, 100]), [a, b] = pick(ZT), ZL = Cx.of(a * Z0, b * Z0);
    const g = gOf(Cx.of(a, b)), gm = g.abs(), th = deg(g.arg()), tp = (th + 360) % 360;
    const S = (1 + gm) / (1 - gm), dmx = tp / 720, dmn = ((tp + 180) % 360) / 720;
    const top = ZL.sub(Z0), bot = ZL.add(Z0);
    return {
      title: 'A complex load: Γ_L, VSWR and where the pattern sits',
      q: md`A $${Z0}\ \Omega$ line ends in $Z_L = ${ctx(ZL)}\ \Omega$. Find $|\Gamma_L|$, the VSWR, the distance from the load to the first voltage maximum as a fraction of $\lambda$, and $Z(d)$ at the first voltage minimum.`,
      parts: [
        N('|\\Gamma_L|', gm, ''),
        Object.assign(N('\\text{VSWR}', S, ''), { traps: [{ v: 1 / S, msg: 'That is min over max. The VSWR is (1 + |Γ|)/(1 − |Γ|), at least 1.' }, { v: 1 + gm, msg: 'That is only the top, 1 + |Γ_L|.' }] }),
        Object.assign(N('d_{\\max}/\\lambda', dmx, ''), { traps: [{ v: 2 * dmx, msg: 'That divides by 360°. The angle of Γ(d) falls by 2βd, so divide θ_L by 720°.' }, { v: dmn, msg: 'That is the first minimum, a quarter wave from the maximum.' }, ...(th < 0 ? [{ v: Math.abs(th) / 720, msg: 'θ_L is negative here. Write it between 0° and 360° (add 360°) before dividing.' }] : [])] }),
        Object.assign(N('Z(d_{\\min})', Z0 / S, 'Ω'), { traps: [{ v: Z0 * S, msg: 'That is Z at a voltage maximum. At a minimum, Z = Z0/VSWR.' }] }),
      ],
      hints: [md`$\Gamma_L = (Z_L - Z_0)/(Z_L + Z_0)$; rationalize with the conjugate of the bottom.`, md`The maximum is where $2\beta d = \theta_L$ (with $\theta_L$ between $0°$ and $360°$), so $d_{\max}/\lambda = \theta_L/720°$. At a minimum, $Z = Z_0/\text{VSWR}$.`],
      sol: md`
        **Step 1: $\Gamma_L$.**
        $$\Gamma_L = \frac{${ctx(top)}}{${ctx(bot)}}$$
        Multiply the top and the bottom by $${ctx(bot.conj())}$. The bottom becomes $${p(+(bot.abs() ** 2).toPrecision(4))}$:
        $$\Gamma_L = ${ctx(g)} = ${polT(g)}$$
        So $|\Gamma_L| = ${f(gm)}$ and $\theta_L = ${f(th)}°$.

        **Step 2: the VSWR.**
        $$\text{VSWR} = \frac{1 + ${f(gm)}}{1 - ${f(gm)}} = ${f(S)}$$
        **Step 3: the first maximum.** $\Gamma(d) = |\Gamma_L|e^{j(\theta_L - 2\beta d)}$ is real and positive when $2\beta d = \theta_L$. ${th < 0 ? md`$\theta_L$ is negative, so add $360°$: $\theta_L = ${f(tp)}°$. ` : ''}Since $2\beta d = 720°\cdot d/\lambda$:
        $$\frac{d_{\max}}{\lambda} = \frac{${f(tp)}°}{720°} = ${f(dmx)}$$
        **Step 4: the first minimum.** A quarter wave from the maximum, at $d_{\min} = ${f(dmn)}\lambda$. There $\Gamma = -|\Gamma_L|$:
        $$Z(d_{\min}) = \frac{Z_0}{\text{VSWR}} = \frac{${Z0}}{${f(S)}} = ${f(Z0 / S)}\ \Omega$$
        **Check.** At the maximum, $Z = Z_0\cdot\text{VSWR} = ${f(Z0 * S)}\ \Omega$, and the product of the two is $Z_0^2 = ${Z0 * Z0}$ ✓ (they are a quarter wave apart). ${b > 0 ? 'An inductive load (positive reactance) has its first maximum within λ/4 of the load ✓.' : 'A capacitive load (negative reactance) has its first minimum within λ/4 of the load ✓.'}
      `,
    };
  };

  GENS.w6v_zin = () => {
    for (let guard = 0; ; guard++) {
      const Z0 = pick([50, 100]), zl = pick([[2, 0], [3, 0], [0.5, 0], [1, 1], [1, -1], [2, 1], [0.5, 0.5], [1, 2], [0.5, -1]]);
      const [v, fq, lv] = pick([[3e8, 150e6, 2], [2e8, 100e6, 2], [2e8, 50e6, 4], [1.5e8, 75e6, 2], [3e8, 300e6, 1]]);
      const k = pick(zl[1] === 0 ? [1, 3, 5] : [1, 2, 3, 5]);
      const l = (k * lv) / 8, bl = (k * PI) / 4;
      const zL = Cx.of(zl[0], zl[1]), ZL = zL.scale(Z0), Zin = TL.zAt(ZL, Z0, bl);
      if (guard < 50 && (Math.abs(Zin.re) < 1e-6 * Zin.abs() || Math.abs(Zin.im) < 1e-6 * Zin.abs())) continue;
      const zin = Zin.scale(1 / Z0), qw = k === 2, t = k % 4 === 1 ? 1 : -1;
      const num = zL.add(Cx.of(0, t)), den = Cx.of(1).add(zL.mul(Cx.of(0, t)));
      return {
        title: 'Input impedance from the tangent form',
        q: md`A $${Z0}\ \Omega$ line with $v = ${vtx(v)}$ m/s is $${p(l * 100)}$ cm long and ends in $Z_L = ${ctx(ZL)}\ \Omega$. The frequency is $${hz(fq)}$. Find the input impedance $Z(l)$ (its real and imaginary parts) and $|\Gamma(l)|$.`,
        parts: [
          Object.assign(N('\\Re\\{Z(l)\\}', Zin.re, 'Ω'), { traps: qw ? [{ v: ZL.re, msg: 'That is the load. A quarter wave inverts it: Z0²/Z_L.' }] : [{ v: (Z0 * Z0) / ZL.abs() ** 2 * ZL.re, msg: 'That is the quarter-wave inversion. Check βl.' }] }),
          Object.assign(N('\\Im\\{Z(l)\\}', Zin.im, 'Ω'), { traps: [{ v: -Zin.im, msg: 'Wrong sign of the reactance. Check the sign of tan βl (or, for λ/4, that dividing by Z_L flips its angle).' }] }),
          N('|\\Gamma(l)|', TL.gamma(ZL, Z0).abs(), ''),
        ],
        hints: [md`$\lambda = v/f$. Write $l$ as a fraction of $\lambda$; then $\beta l = 2\pi l/\lambda$.`, qw ? md`A quarter wave: $Z(l) = Z_0^2/Z_L$.` : md`Normalized: $z(l) = (z_L + j\tan\beta l)/(1 + jz_L\tan\beta l)$, with $\tan\beta l = ${t}$.`],
        sol: md`
          **Step 1: the electrical length.**
          $$\lambda = \frac{v}{f} = \frac{${vtx(v)}}{${p(fq / 1e6)}\times10^6} = ${lv}\ \text{m}$$
          So $l = ${p(l)}$ m $= ${LEN8[k]}$, and $\beta l = ${45 * k}°$.

          ${qw ? md`**Step 2: a quarter wave inverts.**
          $$Z(l) = \frac{Z_0^2}{Z_L} = \frac{${Z0 * Z0}}{${ctx(ZL)}}$$
          Multiply the top and the bottom by $${ctx(ZL.conj())}$:
          $$Z(l) = ${ctx(Zin)}\ \Omega$$` : md`**Step 2: the tangent.** $\tan(${45 * k}°) = ${t}$. Work in normalized form, $z_L = Z_L/Z_0 = ${ctx(zL)}$:
          $$z(l) = \frac{z_L ${t > 0 ? '+' : '-'} j}{1 ${t > 0 ? '+' : '-'} jz_L}$$
          The top is $${ctx(num)}$ and the bottom is $${ctx(den)}$:
          $$z(l) = \frac{${ctx(num)}}{${ctx(den)}} = ${ctx(zin)}$$
          **Step 3: back to ohms.**
          $$Z(l) = ${Z0}\,z(l) = ${ctx(Zin)}\ \Omega$$`}

          **Step ${qw ? 3 : 4}: $|\Gamma(l)|$.** The size of $\Gamma$ never changes along the line, so it is $|\Gamma_L| = |Z_L - Z_0|/|Z_L + Z_0| = ${f(TL.gamma(ZL, Z0).abs())}$.

          **Check.** Put $Z(l)$ into $(Z - Z_0)/(Z + Z_0)$: its size is again $${f(TL.gamma(Zin, Z0).abs())}$ ✓.
        `,
      };
    }
  };

  GENS.w6v_fromvswr = () => {
    const [g, S] = pick(VS.slice(0, 3)), Z0 = pick([50, 75, 100]);
    const lcm = pick([48, 96]), [nu, de] = pick([[1, 8], [1, 16], [1, 12], [1, 6], [3, 16], [1, 24]]);
    const x = nu / de, dcm = x * lcm, tw = 720 * x;
    const GL = Cx.polar(g, PI + (tw * PI) / 180), ZL = zOf(GL).scale(Z0);
    const Gw = Cx.polar(g, PI - (tw * PI) / 180), Zw = zOf(Gw).scale(Z0);      // turned the wrong way
    const Gm = Cx.polar(g, (tw * PI) / 180), Zm = zOf(Gm).scale(Z0);           // treated as a maximum
    return {
      title: 'The load from its standing wave',
      q: md`On a $${Z0}\ \Omega$ line with $\lambda = ${lcm}$ cm you measure VSWR $= ${p(S)}$, and the first voltage minimum sits $${p(dcm)}$ cm from the load. Find $Z_L$.`,
      parts: [
        N('|\\Gamma_L|', g, ''),
        Object.assign(N('\\Re\\{Z_L\\}', ZL.re, 'Ω'), { traps: [{ v: Zm.re, msg: 'That puts +|Γ| at the minimum. At a voltage minimum Γ(d) = −|Γ_L|.' }] }),
        Object.assign(N('\\Im\\{Z_L\\}', ZL.im, 'Ω'), { traps: [{ v: Zw.im, msg: 'That turns Γ the wrong way. Going back toward the load, the angle rises: Γ_L = Γ(d)e^{+j2βd}.' }, { v: Zm.im, msg: 'That puts +|Γ| at the minimum. At a voltage minimum Γ(d) = −|Γ_L|.' }] }),
      ],
      hints: [md`$|\Gamma_L| = (S - 1)/(S + 1)$, and at a voltage minimum $\Gamma(d_{\min}) = -|\Gamma_L|$.`, md`$\Gamma_L = \Gamma(d_{\min})\,e^{+j2\beta d_{\min}}$, with $2\beta d = 720°\cdot d/\lambda$.`],
      sol: md`
        **Step 1: $|\Gamma_L|$.**
        $$|\Gamma_L| = \frac{${p(S)} - 1}{${p(S)} + 1} = ${fr(g)}$$
        **Step 2: $\Gamma$ at the minimum.** At a voltage minimum $\Gamma(d)$ is real and negative: $\Gamma(d_{\min}) = -${fr(g)}$.

        **Step 3: walk back to the load.** $d_{\min}/\lambda = ${p(dcm)}/${lcm} = ${fr(x)}$, so $2\beta d_{\min} = 720°\cdot${fr(x)} = ${p(tw)}°$. Since $\Gamma(d) = \Gamma_Le^{-j2\beta d}$, going back turns $\Gamma$ counterclockwise:
        $$\Gamma_L = -${fr(g)}\,e^{+j${p(tw)}°} = ${polT(GL)}$$
        In rectangular form, $\Gamma_L = ${ctx(GL)}$.

        **Step 4: $Z_L$.**
        $$Z_L = Z_0\,\frac{1 + \Gamma_L}{1 - \Gamma_L} = ${Z0}\cdot\frac{${ctx(Cx.of(1).add(GL))}}{${ctx(Cx.of(1).sub(GL))}}$$
        $$Z_L = ${ctx(ZL)}\ \Omega$$
        **Check.** $(Z_L - Z_0)/(Z_L + Z_0)$ has size $${f(TL.gamma(ZL, Z0).abs())}$ ✓, and a minimum within $\lambda/4$ of the load means a capacitive load: $\Im\{Z_L\} < 0$ ✓.
      `,
    };
  };

  GENS.w6v_power = () => {
    const F = pick([10, 12, 20]), Z0 = pick([50, 100]);
    const zl = pick([[2, 0], [3, 0], [0.5, 0], [0.8, 0.6], [0.6, -0.8], [1, 1], [0.25, 0]]);
    const zL = Cx.of(zl[0], zl[1]), ZL = zL.scale(Z0), g = gOf(zL), gm = g.abs();
    const Vp = F / 2, Pi = (Vp * Vp) / (2 * Z0), PL = Pi * (1 - gm * gm), Vmax = Vp * (1 + gm), VL = Vp * Cx.of(1).add(g).abs();
    return {
      title: 'A matched generator: incident wave, power, voltages',
      q: md`A generator with $\tilde F = ${F}$ V and $Z_g = ${Z0}\ \Omega$ drives a long lossless $${Z0}\ \Omega$ line that ends in $Z_L = ${ctx(ZL)}\ \Omega$. Find $|V^+|$, the power into the load, the largest $|\tilde V(d)|$ on the line, and $|\tilde V_L|$, the size of the load voltage.`,
      parts: [
        Object.assign(N('|V^+|', Vp, 'V'), { traps: [{ v: F, msg: 'Half of F̃ drops across Z_g at launch.' }] }),
        Object.assign(N('P_L', PL, 'W'), { traps: [{ v: Pi, msg: 'That is the incident power. Multiply by 1 − |Γ_L|².' }, { v: 2 * PL, msg: 'Missing the ½: phasors are peak values.' }] }),
        Object.assign(N('|\\tilde V|_{\\max}', Vmax, 'V'), { traps: [{ v: 2 * Vp, msg: '2|V⁺| needs |Γ_L| = 1.' }] }),
        Object.assign(N('|\\tilde V_L|', VL, 'V'), { traps: [{ v: Vp, msg: 'That is only the incident wave. The load voltage is |V⁺||1 + Γ_L|.' }] }),
      ],
      hints: [md`$Z_g = Z_0$ means $|V^+| = \tilde F/2$ for any load and any length.`, md`$P_L = (|V^+|^2/2Z_0)(1 - |\Gamma_L|^2)$, $|\tilde V|_{\max} = |V^+|(1 + |\Gamma_L|)$, $\tilde V_L = V^+(1 + \Gamma_L)$.`],
      sol: md`
        **Step 1: the incident wave.** The generator is matched, so $|V^+| = \tilde F/2 = ${p(Vp)}$ V.

        **Step 2: $\Gamma_L$.**
        $$\Gamma_L = \frac{${ctx(ZL.sub(Z0))}}{${ctx(ZL.add(Z0))}} = ${ctx(g)}$$
        Its size is $|\Gamma_L| = ${f(gm)}$, so $|\Gamma_L|^2 = ${f(gm * gm)}$.

        **Step 3: power.**
        $$P_L = \frac{${p(Vp)}^2}{2(${Z0})}\,(1 - ${f(gm * gm)}) = ${f(PL)}\ \text{W}$$
        **Step 4: the largest voltage.**
        $$|\tilde V|_{\max} = ${p(Vp)}(1 + ${f(gm)}) = ${f(Vmax)}\ \text{V}$$
        **Step 5: the load voltage.**
        $$|\tilde V_L| = |V^+|\,|1 + \Gamma_L| = ${p(Vp)}\,|${ctx(Cx.of(1).add(g))}| = ${f(VL)}\ \text{V}$$
        **Check.** $P_L = \tfrac12|\tilde V_L|^2\,\Re\{1/Z_L^*\}$: $\tfrac12(${f(VL)})^2\cdot${f(Cx.of(1).div(ZL).re)} = ${f(0.5 * VL * VL * Cx.of(1).div(ZL).re)}$ W ✓.
      `,
    };
  };

  GENS.w6v_circuit = () => {
    for (let guard = 0; ; guard++) {
      const F = pick([10, 12, 20]), Z0 = 50, Zg = pick([50, 25, 100]);
      const zl = pick([[2, 0], [3, 0], [0.5, 0], [0.8, 0.6], [0.6, -0.8], [1, 1], [1, -1]]);
      const k = pick(zl[1] === 0 ? [1, 3] : [1, 2, 3]);
      const [v, fq, lv] = pick([[2e8, 100e6, 2], [3e8, 150e6, 2], [3e8, 75e6, 4]]);
      const bl = (k * PI) / 4, l = (k * lv) / 8;
      const ZL = Cx.of(zl[0] * Z0, zl[1] * Z0), GL = TL.gamma(ZL, Z0), Gl = TL.gammaAt(GL, bl), Zin = TL.zAt(ZL, Z0, bl);
      if (guard < 50 && (Math.abs(Zin.re) < 1e-6 * Zin.abs() || Math.abs(Zin.im) < 1e-6 * Zin.abs())) continue;
      const Il = Cx.of(F).div(Zin.add(Zg)), Vl = Il.mul(Zin);
      const Vp = Vl.mul(Cx.polar(1, -bl)).div(Cx.of(1).add(Gl));
      const P = 0.5 * Il.abs() ** 2 * Zin.re, S = TL.vswr(GL), gm = GL.abs();
      const PL = (Vp.abs() ** 2 / (2 * Z0)) * (1 - gm * gm);
      const t = k % 4 === 1 ? 1 : -1, zL = ZL.scale(1 / Z0);
      const matched = Zg === Z0;
      return {
        title: 'The whole circuit: generator, line, load',
        q: md`A generator with $\tilde F = ${F}$ V (phasor) and $Z_g = ${Zg}\ \Omega$ drives a lossless $${Z0}\ \Omega$ line of length $${p(l * 100)}$ cm with $v = ${vtx(v)}$ m/s, at $${hz(fq)}$. The line ends in $Z_L = ${ctx(ZL)}\ \Omega$. Find $Z(l)$, $|\tilde V(l)|$, $|V^+|$, the power delivered to the load, and the VSWR.`,
        parts: [
          Object.assign(N('\\Re\\{Z(l)\\}', Zin.re, 'Ω'), { traps: [{ v: ZL.re, msg: 'That is the load itself. Walk the line: βl is not a multiple of π.' }] }),
          Object.assign(N('\\Im\\{Z(l)\\}', Zin.im, 'Ω'), { traps: [{ v: -Zin.im, msg: 'Wrong sign of the reactance: check tan βl.' }] }),
          Object.assign(N('|\\tilde V(l)|', Vl.abs(), 'V'), { traps: [{ v: Cx.of(F).mul(ZL).div(ZL.add(Zg)).abs(), msg: 'That divides F̃ between Z_g and Z_L. The generator sees Z(l), not Z_L.' }] }),
          Object.assign(N('|V^+|', Vp.abs(), 'V'), { traps: matched ? [{ v: Vl.abs(), msg: 'Ṽ(l) is incident plus reflected. With Z_g = Z0, |V⁺| = F̃/2.' }] : [{ v: F / 2, msg: 'F̃/2 is right only when Z_g = Z0. Use V⁺ = Ṽ(l)e^{−jβl}/(1 + Γ(l)).' }, { v: Vl.abs(), msg: 'Ṽ(l) is incident plus reflected. Divide by |1 + Γ(l)|.' }] }),
          Object.assign(N('P_L', P, 'W'), { traps: [{ v: Vp.abs() ** 2 / (2 * Z0), msg: 'That is the incident power. Multiply by 1 − |Γ_L|².' }, { v: 2 * P, msg: 'Missing the ½.' }] }),
          Object.assign(N('\\text{VSWR}', S, ''), { traps: [{ v: 1 / S, msg: 'Max over min: at least 1.' }] }),
        ],
        hints: [md`$\lambda = v/f$, so the line is $${LEN8[k]}$ long and $\beta l = ${45 * k}°$.`, md`$Z(l)$ from the tangent form, then the divider $\tilde V(l) = \tilde F\,Z(l)/(Z_g + Z(l))$, then $V^+ = \tilde V(l)e^{-j\beta l}/(1 + \Gamma(l))$.`],
        sol: md`
          **Step 1: the electrical length.** $\lambda = v/f = ${lv}$ m, so $l = ${p(l)}$ m $= ${LEN8[k]}$ and $\beta l = ${45 * k}°$.

          **Step 2: the load.**
          $$\Gamma_L = \frac{${ctx(ZL.sub(Z0))}}{${ctx(ZL.add(Z0))}} = ${ctx(GL)}$$
          $|\Gamma_L| = ${f(gm)}$, so
          $$\text{VSWR} = \frac{1 + ${f(gm)}}{1 - ${f(gm)}} = ${f(S)}$$
          **Step 3: $Z(l)$.** ${k === 2 ? md`A quarter wave inverts:
          $$Z(l) = \frac{Z_0^2}{Z_L} = \frac{2500}{${ctx(ZL)}} = ${ctx(Zin)}\ \Omega$$` : md`$\tan\beta l = ${t}$ and $z_L = ${ctx(zL)}$:
          $$z(l) = \frac{z_L ${t > 0 ? '+' : '-'} j}{1 ${t > 0 ? '+' : '-'} jz_L} = \frac{${ctx(zL.add(Cx.of(0, t)))}}{${ctx(Cx.of(1).add(zL.mul(Cx.of(0, t))))}}$$
          $$Z(l) = 50\,z(l) = ${ctx(Zin)}\ \Omega$$`}
          **Step 4: the divider.**
          $$\tilde I(l) = \frac{${F}}{${Zg} + ${ctx(Zin)}} = ${ctx(Il)}\ \text{A}$$
          $$\tilde V(l) = \tilde I(l)\,Z(l) = ${ctx(Vl)}\ \text{V}$$
          so $|\tilde V(l)| = ${f(Vl.abs())}$ V.

          **Step 5: the incident wave.** ${matched ? md`$Z_g = Z_0$, so $|V^+| = \tilde F/2 = ${p(F / 2)}$ V directly. The long way agrees:` : md`$Z_g \ne Z_0$, so use the general formula.`} $\Gamma(l) = \Gamma_Le^{-j${90 * k}°} = ${ctx(Gl)}$, and
          $$|V^+| = \frac{|\tilde V(l)|}{|1 + \Gamma(l)|} = \frac{${f(Vl.abs())}}{${f(Cx.of(1).add(Gl).abs())}} = ${f(Vp.abs())}\ \text{V}$$
          **Step 6: power.** At the input:
          $$P = \tfrac12|\tilde I(l)|^2\,\Re\{Z(l)\} = ${f(P)}\ \text{W}$$
          **Check, at the load.** $(|V^+|^2/2Z_0)(1 - |\Gamma_L|^2) = (${f(Vp.abs() ** 2)}/100)(1 - ${f(gm * gm)}) = ${f(PL)}$ W ✓.

          **Speed path.** ${matched ? 'Matched generator: |V⁺| = F̃/2 and the power is (|V⁺|²/2Z₀)(1 − |Γ_L|²) without touching Z(l).' : 'Get Z(l) by the λ/8 or λ/4 rule, then the divider; the power is ½|Ĩ(l)|²Re{Z(l)}, one line.'}

          **Where points go.** Dividing $\tilde F$ with $Z_L$ instead of $Z(l)$. ${matched ? '' : 'Using F̃/2 with a mismatched generator. '}Dropping the $\tfrac12$ in the power.
        `,
      };
    }
  };

  // ---------------------------------------------------------------- Topic 17 question bank
  EM.BANK['w6-vd'] = [
    Q(md`In $-d\tilde V/dz = j\omega L\tilde I$, the factor $j\omega$ came from…`,
      [md`replacing $\partial/\partial t$ by $j\omega$ for signals that go as $e^{j\omega t}$`, md`the phase constant $\beta$`, md`the line's resistance`, md`a Fourier series of the generator`], 0,
      [null, md`$\beta$ appears only after solving the wave equation.`, md`This line is lossless; there is no resistance in it.`, md`One frequency is enough. No series is needed.`],
      md`$\partial/\partial t\,\Re\{\tilde Ie^{j\omega t}\} = \Re\{j\omega\tilde Ie^{j\omega t}\}$.`),
    Q(md`Which is **not** a solution of $d^2\tilde V/dz^2 = -\beta^2\tilde V$?`,
      [md`$e^{-\beta z}$`, md`$e^{-j\beta z}$`, md`$3e^{+j\beta z}$`, md`$\cos\beta z$`], 0,
      [null, md`Two derivatives give $(-j\beta)^2 = -\beta^2$. It solves the equation.`, md`Any multiple of a solution is a solution.`, md`$d^2\cos\beta z/dz^2 = -\beta^2\cos\beta z$. It solves the equation.`],
      md`$d^2e^{-\beta z}/dz^2 = +\beta^2e^{-\beta z}$: the wrong sign. A real exponent decays; a lossless line needs an imaginary one.`),
    Q(md`The factor $\beta/(\omega L)$ in the current equals…`,
      [md`$1/Z_0$`, md`$Z_0$`, md`$v$`, md`$1/v$`], 0,
      [null, md`$\beta/(\omega L) = \sqrt{LC}/L = \sqrt{C/L}$, which is $1/Z_0$.`, md`$v$ has units of m/s; this factor is in siemens.`, md`$1/v = \sqrt{LC}$, which still has to be divided by $L$.`],
      md`$\beta/(\omega L) = \omega\sqrt{LC}/(\omega L) = \sqrt{C/L} = 1/Z_0$.`),
    Q(md`In $\tilde V(d) = V^+e^{j\beta d} + V^-e^{-j\beta d}$, the term $V^+e^{j\beta d}$ is…`,
      [md`the wave traveling toward the load`, md`the wave traveling toward the generator`, md`the reflected wave`, md`a standing wave`], 0,
      [null, md`$d$ grows toward the generator, so the sign is flipped from the $z$ form. $V^+$ is still the incident wave.`, md`The reflected wave is $V^-e^{-j\beta d}$.`, md`A standing wave needs both terms together.`],
      md`In time, $\Re\{V^+e^{j(\omega t + \beta d)}\}$ has crests moving toward smaller $d$: toward the load.`),
    Q(md`On a $50\ \Omega$ line the reflected wave alone has $V^- = 2$ V at the load. Its current at the load is…`,
      [md`$-0.04$ A`, md`$+0.04$ A`, md`$-100$ A`, md`$0$ A`], 0,
      [null, md`The backward wave has $\tilde V/\tilde I = -Z_0$.`, md`Divide by $Z_0$; do not multiply.`, md`A wave of voltage $V^-$ always carries current $-V^-/Z_0$.`],
      md`$I^- = -V^-/Z_0 = -2/50 = -0.04$ A.`),
    Q(md`For any load with a non-negative resistance on a line with real $Z_0$, $|\Gamma_L|$ is…`,
      [md`at most 1`, md`any number`, md`exactly 1`, md`exactly 0`], 0,
      [null, md`$|Z_L - Z_0| \le |Z_L + Z_0|$ when $\Re\{Z_L\} \ge 0$.`, md`Only a reactance (or a short or an open) gives exactly 1.`, md`Only a matched load gives 0.`],
      md`$|R - Z_0 + jX| \le |R + Z_0 + jX|$ for $R \ge 0$, so $|\Gamma_L| \le 1$.`),
    Q(md`Why does $\Gamma(d)$ contain $e^{-j2\beta d}$ and not $e^{-j\beta d}$?`,
      [md`The incident phase rises by $\beta d$ and the reflected phase falls by $\beta d$, so their ratio changes by $2\beta d$`, md`Because power is the square of voltage`, md`Because the line has two conductors`, md`Because $\Gamma$ is defined for the current`], 0,
      [null, md`Power is not involved; $\Gamma$ is a ratio of voltages.`, md`The number of conductors does not enter.`, md`$\Gamma$ is the ratio of voltage waves.`],
      md`Equivalently, the reflected wave at $d$ has made a round trip of $2d$.`),
    Q(md`$\Gamma_L = -0.4$. At $d = \lambda/4$, $\Gamma(d)$ is…`,
      [md`$+0.4$`, md`$-0.4$`, md`$+j0.4$`, md`$-j0.4$`], 0,
      [null, md`That takes $\lambda/2$.`, md`That is $3\lambda/8$: a $270°$ turn.`, md`That is $\lambda/8$: a $90°$ turn.`],
      md`$\lambda/4$ turns $\Gamma$ by $180°$, which flips its sign.`),
    Q(md`As $d$ grows, $\Gamma(d)$ moves on the complex plane…`,
      [md`clockwise around a circle of radius $|\Gamma_L|$`, md`counterclockwise around a circle of radius $|\Gamma_L|$`, md`inward toward 0`, md`along a straight line through 1`], 0,
      [null, md`The angle is $\theta_L - 2\beta d$, which falls as $d$ grows: clockwise.`, md`A lossless line keeps $|\Gamma|$ fixed.`, md`Only its angle changes, so it stays on a circle.`],
      md`$\Gamma(d) = |\Gamma_L|e^{j(\theta_L - 2\beta d)}$.`),
    Q(md`$Z(d)\cdot Z(d + \lambda/4)$ equals…`,
      [md`$Z_0^2$`, md`$Z_0$`, md`$Z_L^2$`, md`$1$`], 0,
      [null, md`The product of two impedances has units of $\Omega^2$.`, md`$Z_L$ is only the value at $d = 0$; the rule holds at every $d$.`, md`That is the normalized version: $z(d)\,z(d + \lambda/4) = 1$.`],
      md`A quarter wave flips $\Gamma$, which turns $z$ into $1/z$.`),
    Q(md`$Z(d) = Z_0$ at **every** $d$ exactly when…`,
      [md`$Z_L = Z_0$`, md`$|Z_L| = Z_0$`, md`the line is $\lambda/2$ long`, md`$Z_L = 0$`], 0,
      [null, md`$Z_L = jZ_0$ has $|Z_L| = Z_0$ but $|\Gamma_L| = 1$.`, md`A half-wave line repeats $Z_L$ at its input, not $Z_0$ along it.`, md`A short gives $jZ_0\tan\beta d$.`],
      md`Only $\Gamma_L = 0$ makes $\Gamma(d) = 0$ for all $d$.`),
    Q(md`A $100\ \Omega$ line, $3\lambda/4$ long, ends in $200\ \Omega$. The input impedance is…`,
      [md`$50\ \Omega$`, md`$200\ \Omega$`, md`$100\ \Omega$`, md`$400\ \Omega$`], 0,
      [null, md`$3\lambda/4$ is an odd number of quarter waves: an inversion.`, md`Only a matched load looks like $Z_0$.`, md`That is $Z_L^2/Z_0$.`],
      md`$Z_0^2/Z_L = 10000/200 = 50\ \Omega$.`),
    Q(md`A line exactly one wavelength long ends in $30 + j40\ \Omega$. The input impedance is…`,
      [md`$30 + j40\ \Omega$`, md`$30 - j40\ \Omega$`, md`$Z_0^2/(30 + j40)$`, md`$Z_0$`], 0,
      [null, md`Nothing flips: a whole wavelength is two half waves.`, md`That is a quarter wave's answer.`, md`Only a matched load looks like $Z_0$.`],
      md`$\Gamma$ turns two full circles; $Z$ repeats every $\lambda/2$.`),
    Q(md`In $z(d) = (z_L + j\tan\beta d)/(1 + jz_L\tan\beta d)$, put $z_L = 1$. You get…`,
      [md`$z(d) = 1$ for all $d$`, md`$z(d) = j\tan\beta d$`, md`$z(d) = 1 + j\tan\beta d$`, md`$z(d) = 0$`], 0,
      [null, md`That is the short ($z_L = 0$).`, md`The bottom is $1 + j\tan\beta d$ too; they cancel.`, md`$z_L = 1$ is a matched load, not a short.`],
      md`Top and bottom are both $1 + j\tan\beta d$.`),
    Q(md`Which loads give an infinite VSWR?`,
      [md`a short, an open, or any pure reactance`, md`only a short`, md`any load with $Z_L \neq Z_0$`, md`only loads larger than $Z_0$`], 0,
      [null, md`An open and any reactance also have $|\Gamma_L| = 1$.`, md`A resistor $\ne Z_0$ gives a finite VSWR.`, md`$R_L = 2Z_0$ gives VSWR $= 2$.`],
      md`VSWR $= \infty$ exactly when $|\Gamma_L| = 1$: the minimum voltage is zero.`),
    Q(md`How far is it from one voltage maximum to the next?`,
      [md`$\lambda/2$`, md`$\lambda$`, md`$\lambda/4$`, md`it depends on the load`], 0,
      [null, md`The pattern $|1 + \Gamma(d)|$ repeats when $\Gamma$ turns a full circle: $\lambda/2$.`, md`$\lambda/4$ is from a maximum to a minimum.`, md`The load sets where they sit and how big they are, not their spacing.`],
      md`$2\beta d = 2\pi$ gives $d = \lambda/2$.`),
    Q(md`Where on the line is $|\tilde I(d)|$ largest?`,
      [md`where $|\tilde V(d)|$ is smallest`, md`where $|\tilde V(d)|$ is largest`, md`at the load, always`, md`it is the same everywhere`], 0,
      [null, md`The current has $1 - \Gamma$: it peaks where $\Gamma = -|\Gamma_L|$, the voltage minimum.`, md`Only if the load is below $Z_0$.`, md`Only on a matched line.`],
      md`$|\tilde I| \propto |1 - \Gamma(d)|$ and $|\tilde V| \propto |1 + \Gamma(d)|$.`),
    Q(md`The sheet's $P(d) = |V^+|^2/2Z_0 - |V^-|^2/2Z_0$ says the power delivered is…`,
      [md`the incident power minus the reflected power`, md`the incident power plus the reflected power`, md`the reflected power only`, md`zero unless the line is matched`], 0,
      [null, md`The reflected wave carries power back toward the generator, so it subtracts.`, md`The incident wave also carries power.`, md`Any $|\Gamma_L| < 1$ delivers some power.`],
      md`Each traveling wave carries $|V|^2/2Z_0$, in its own direction.`),
    Q(md`On a lossless line, compare the average power at the input with the power at the load.`,
      [md`They are equal`, md`The input is larger`, md`The load is larger`, md`It depends on the VSWR`], 0,
      [null, md`Larger at the input would need the line to use some up.`, md`The line cannot create power.`, md`The VSWR changes how much is delivered, not where.`],
      md`$P(d)$ has no $d$ in it.`),
    Q(md`$Z(l) = 30 - j40\ \Omega$ and $|\tilde I(l)| = 0.2$ A (peak). The power into the line is…`,
      [md`$0.6$ W`, md`$1.2$ W`, md`$0.8$ W`, md`$1$ W`], 0,
      [null, md`That drops the $\tfrac12$.`, md`That uses the reactance $40$; only the resistance takes power.`, md`That uses $|Z(l)| = 50$.`],
      md`$P = \tfrac12|\tilde I|^2\Re\{Z\} = \tfrac12(0.04)(30) = 0.6$ W.`),
    Q(md`The sheet's $\tilde V(l) = \tilde F\,Z(l)/(Z_g + Z(l))$ is…`,
      [md`a voltage divider, with the whole line replaced by its input impedance`, md`the incident wave at the input`, md`true only when $Z_g = Z_0$`, md`the load voltage`], 0,
      [null, md`It is the total voltage, incident plus reflected.`, md`It holds for any $Z_g$.`, md`That is $\tilde V(0)$.`],
      md`The generator cannot tell the line from a lumped $Z(l)$.`),
    Q(md`At a voltage maximum, the line impedance is…`,
      [md`real, and equal to $Z_0\cdot\text{VSWR}$`, md`real, and equal to $Z_0/\text{VSWR}$`, md`purely imaginary`, md`equal to $Z_L$`], 0,
      [null, md`That is the minimum.`, md`$\Gamma(d) = +|\Gamma_L|$ is real there, so $Z$ is real.`, md`Only at the load, or where the pattern repeats it.`],
      md`$Z = Z_0(1 + |\Gamma_L|)/(1 - |\Gamma_L|)$.`),
    Q(md`A $50\ \Omega$ line ends in $25\ \Omega$. The first voltage **maximum** is…`,
      [md`$\lambda/4$ from the load`, md`at the load`, md`$\lambda/2$ from the load`, md`$\lambda/8$ from the load`], 0,
      [null, md`$R_L < Z_0$ puts a minimum at the load.`, md`That is the second minimum.`, md`$\lambda/8$ needs $\theta_L = 90°$.`],
      md`$\Gamma_L = -\tfrac13$, $\theta_L = 180°$, so $d_{\max} = 180°/720°\cdot\lambda = \lambda/4$.`),
    Q(md`A matched generator ($Z_g = Z_0$) drives a line ending in an open. The reflected wave that reaches the generator…`,
      [md`is absorbed: nothing reflects from the generator`, md`reflects back fully`, md`doubles the incident wave`, md`never reaches the generator`], 0,
      [null, md`$\Gamma_g = (Z_g - Z_0)/(Z_g + Z_0) = 0$.`, md`It is absorbed in $Z_g$, so the incident wave stays $\tilde F/2$.`, md`On a lossless line it arrives with its full size.`],
      md`That is why $V^+e^{j\beta l} = \tilde F/2$ with a matched generator.`),
  ];

  // ---------------------------------------------------------------- figures, Topic 18
  // |V| and |I| along a source-free line, z/l from 0 to 1
  const modeFig = (kind, n) => {
    // kind: 'oo' open-open, 'ss' short-short, 'os' open at z = 0, short at z = l; n: mode number (os: n = 0, 1, ...)
    const b = kind === 'os' ? ((2 * n + 1) * PI) / 2 : n * PI;
    const V = kind === 'ss' ? (z) => Math.abs(Math.sin(b * z)) : (z) => Math.abs(Math.cos(b * z));
    const I = kind === 'ss' ? (z) => Math.abs(Math.cos(b * z)) : (z) => Math.abs(Math.sin(b * z));
    const end = { oo: ['\\text{open}', '\\text{open}'], ss: ['\\text{short}', '\\text{short}'], os: ['\\text{open}', '\\text{short}'] }[kind];
    return PF.plot({ w: 260, h: 130, x: [0, 1], y: [0, 1.25], xl: 'z', xt: [[0, end[0]], [1, end[1]]], yt: [[1, '1']],
      curves: [{ f: V, n: 300 }, { f: I, n: 300, cls: 'dash' }] });
  };
  const modeRow = (kind, ns, labs) => PF.row(ns.map((n, i) => ({ svg: modeFig(kind, n), cap: labs[i] }))).svg;
  // X/Z0 of a shorted stub (tan) or an open stub (-cot) against the length l/lambda
  const reactFig = (short) => {
    const F = short ? (x) => Math.tan(2 * PI * x) : (x) => -1 / Math.tan(2 * PI * x);
    const pts = [];
    for (let i = 1; i < 800; i++) { const x = i / 800; const y = F(x); pts.push([x, y]); }
    // split at the poles so the plot does not draw vertical jumps
    const segs = []; let cur = [];
    pts.forEach((q, i) => { if (i && Math.abs(q[1] - pts[i - 1][1]) > 20) { segs.push(cur); cur = []; } cur.push(q); });
    segs.push(cur);
    return PF.plot({ w: 300, h: 190, x: [0, 1], y: [-4, 4], zero: true, xl: 'l', yl: 'X/Z_0',
      xt: [[0.25, '\\tfrac{\\lambda}{4}'], [0.5, '\\tfrac{\\lambda}{2}'], [0.75, '\\tfrac{3\\lambda}{4}'], [1, '\\lambda']], yt: [[1, '1'], [-1, '-1']],
      curves: segs.map((s) => ({ pts: s })) });
  };
  // a shunt stub across a load, fed by a generator
  function shuntFig() {
    const g = PF.fig({ alt: 'A generator with series resistance R feeds a load resistor R. A shorted stub of length l hangs below the junction, in parallel with the load.' });
    const y1 = 30, y2 = 90, xs = 30, xj = 200, xl = 290;
    g.circle(xs, 60, 13); g.label(xs, 60, '\\sim', 'c');
    g.line(xs, y1, xs, 47); g.line(xs, 73, xs, y2);
    g.line(xs, y1, 70, y1); g.rect(70, y1 - 7, 32, 14); g.line(102, y1, xl, y1);
    g.label(86, y1 - 10, 'R', 'b', 'small');
    g.line(xs, y2, xl, y2);
    g.line(xl, y1, xl, 44); g.rect(xl - 7, 44, 14, 32); g.line(xl, 76, xl, y2);
    g.label(xl + 12, 60, 'R', 'l', 'small');
    g.dot(xj, y1); g.dot(xj, y2);
    // the stub: two conductors going down from the junction, shorted at the bottom
    // the conductor from the top wire hops over the bottom wire (no connection there)
    g.line(xj, y1, xj - 22, y1); g.line(xj - 22, y1, xj - 22, y2 - 6, { cls: 'thick' });
    g.arc(xj - 22, y2, 6, 90, 270, { cls: 'thick' });
    g.line(xj - 22, y2 + 6, xj - 22, 200, { cls: 'thick' });
    g.line(xj, y2, xj, 200, { cls: 'thick' });
    g.line(xj - 30, 200, xj + 8, 200, { cls: 'thick' });
    g.label(xj + 14, 196, '\\text{short}', 'l', 'small');
    g.dim(xj + 26, y2 + 4, xj + 26, 200, 'l', { at: 'r' });
    g.label(xj - 34, 150, 'Z_0', 'r', 'small');
    return g.svg();
  }
  // the filter response: 2|V_L|/|F| for a shorted quarter-wave shunt stub (Z0 = R, matched generator)
  const respFig = () => PF.plot({ w: 400, h: 180, x: [0, 4.4], y: [0, 1.2], xl: 'f', yl: '2|\\tilde V_L|/|\\tilde F|',
    xt: [[1, 'f_0'], [2, '2f_0'], [3, '3f_0'], [4, '4f_0']], yt: [[1, '1']],
    curves: [{ f: (x) => { const t = Math.tan((PI / 2) * x); return isFinite(t) ? (2 * Math.abs(t)) / Math.hypot(1, 2 * t) : 1; }, n: 800 }] });

  // ================================================================ Topic 18
  EM.lesson('w6', {
    id: 'w6-stubs', topic: 18, ref: 'Lectures 31-32', title: 'Stubs, resonance and filters',
    steps: [
      RF(md`
        !!key Why you care
          Shorted and open lines come back on Exam 3 again and again. Spring 2018 asked three multiple-choice parts on a shorted line (its current, and its input impedance at twice and at half its resonance) and a 20-point problem where the current in a resistor vanishes. Spring 2017 had an 11-point shorted line in series with a resistor. The last two lines of your formula sheet are exactly the shorted and the open line. This lesson builds them, first from the standing waves a line can hold with no source at all (Lecture 31), then as circuit elements (Lecture 32): inductors, capacitors, resonators and filters.

        ### Notation

        - **Stub**: a piece of line with a short or an open at its far end, used through its two input terminals as one circuit element.
        - $l$: the stub's length. $\beta l = 2\pi l/\lambda$: its **electrical length**, in radians or degrees. It changes when the frequency changes, because $\lambda = v/f$.
        - $Z(l) = jX$: the stub's **input impedance**. $X$ is a **reactance** in $\Omega$: $X > 0$ acts like an inductor ($j\omega L$), $X < 0$ like a capacitor ($1/j\omega C$).
        - $Y = 1/Z$: admittance; $Y_0 = 1/Z_0$.
        - **Series resonance**: $Z = 0$. The element looks like a short. **Parallel resonance**: $Y = 0$, so $Z = \infty$. The element looks like an open.
        - $f_n$: the resonant frequencies, $n$ an index; $v$: the speed on the line.
        - $\Gamma_L$, $\Gamma(d)$, $Z(d)$: as in [Topic 17](#/l/w6-vd), with $d$ measured back from the far end.

        ### 1. What resonance means in an LC circuit

        Put an inductor and a capacitor in series. Their impedances add. With $1/j = -j$:
        $$Z_s = j\omega L + \frac{1}{j\omega C} = j\left(\omega L - \frac{1}{\omega C}\right)$$
        It is zero when $\omega L = 1/\omega C$, that is at
        $$\omega_0 = \frac{1}{\sqrt{LC}}$$
        There the pair looks like a short: **series resonance**. Below $\omega_0$ the capacitor term wins and $Z_s$ is capacitive; above, inductive.

        Now put them in parallel. Admittances add:
        $$Y_p = j\omega C + \frac{1}{j\omega L} = j\left(\omega C - \frac{1}{\omega L}\right)$$
        It is zero at the same $\omega_0$. Zero admittance means the pair draws no current: it looks like an open, **parallel resonance**. Below $\omega_0$, $Y_p$ is negative-imaginary, so $Z_p = 1/Y_p$ is positive-imaginary: inductive. Above, capacitive.

        !!intuition Does this make sense?
          A resonance is a frequency where the circuit can ring by itself, with no source. At parallel resonance current sloshes between $L$ and $C$ and none is drawn from outside. An LC has one resonance. A line, as you will see, has infinitely many.
      `, {}),
      Q(md`**Predict.** A parallel LC is driven at $\omega = \omega_0/2$. It looks…`,
        [md`inductive`, md`capacitive`, md`like an open`, md`like a short`], 0,
        [null, md`Below $\omega_0$ the inductor's admittance $1/\omega L$ is the bigger one, so $Y$ is negative-imaginary and $Z$ is inductive. Capacitive is the series LC below resonance.`, md`An open is the parallel LC exactly at $\omega_0$.`, md`A parallel LC is a short only at $\omega = 0$ (the inductor) or $\infty$ (the capacitor).`],
        md`$Y_p = j(\omega C - 1/\omega L)$. At $\omega_0/2$, $\omega C = \tfrac12\omega_0C$ and $1/\omega L = 2/\omega_0L$, and at $\omega_0$ these were equal. So $1/\omega L$ wins, $Y_p = -j|B|$, and $Z_p = +j/|B|$: inductive.`),
      RF(md`
        ### 2. A line with no source: what can ring on it?

        Take a line of length $l$ with nothing attached: both ends open. Measure $z$ from one end ($z = 0$) to the other ($z = l$). At one frequency, [Topic 17](#/l/w6-vd) gives
        $$\tilde V(z) = V^+e^{-j\beta z} + V^-e^{j\beta z}$$
        $$\tilde I(z) = \frac{V^+e^{-j\beta z} - V^-e^{j\beta z}}{Z_0}$$
        **The end at $z = 0$ is open**, so no current flows there: $\tilde I(0) = 0$. That means $V^+ - V^- = 0$:
        $$V^- = V^+$$
        Put it back. Use $e^{-jx} + e^{jx} = 2\cos x$ and $e^{-jx} - e^{jx} = -j2\sin x$:
        $$\tilde V(z) = 2V^+\cos\beta z$$
        $$\tilde I(z) = -j\,\frac{2V^+}{Z_0}\sin\beta z$$
        **The end at $z = l$ is open too**, so $\tilde I(l) = 0$. If $V^+ = 0$ nothing rings at all, so we need
        $$\sin\beta l = 0$$
        That happens when $\beta l = n\pi$ with $n = 1, 2, 3, \dots$ Put in $\beta = 2\pi f/v$:
        $$\frac{2\pi f\,l}{v} = n\pi$$
        $$\boxed{f_n = \frac{nv}{2l}}$$
        In words: the line must hold a whole number of half wavelengths, $l = n\lambda/2$.

        **Back in time.** Write $V^+ = |V^+|e^{j\phi}$. Since $\Re\{-je^{j\theta}\} = \sin\theta$,
        $$V(z,t) = 2|V^+|\cos\beta z\,\cos(\omega t + \phi)$$
        $$I(z,t) = \frac{2|V^+|}{Z_0}\sin\beta z\,\sin(\omega t + \phi)$$
        Nothing travels. These are **standing waves**: each point just oscillates. The voltage is largest at the open ends and the current is zero there. Here are the first two. Solid is $|V|/2|V^+|$; dashed is $Z_0|I|/2|V^+|$, so both peak at 1:

        [[fig:oo]]

        !!intuition Does this make sense? The round trip
          Launch any pulse on the line. It reflects with $\Gamma = +1$ at each open end, so after one round trip, $2l/v$ seconds, it is back exactly as it started. So any shape that repeats every $T = 2l/v$ can live on the line. A shape with period $T$ is a Fourier series of $f_1 = 1/T = v/2l$ and its whole multiples: exactly the $f_n$ above.
      `, { oo: { svg: modeRow('oo', [1, 2], ['$n = 1$: $l = \\lambda/2$', '$n = 2$: $l = \\lambda$']), cap: 'Open at both ends. Solid: |V|; dashed: |I| (scaled). The current is zero at both opens.' } }),
      Q(md`**Predict.** A $2$ m line with $v = 2\times10^8$ m/s is open at both ends. What is its lowest resonant frequency?`,
        [md`$50$ MHz`, md`$25$ MHz`, md`$100$ MHz`, md`$75$ MHz`], 0,
        [null, md`That is $v/4l$, the formula for ends of different kinds.`, md`That is $v/l$: a whole wavelength. The lowest mode fits half a wavelength.`, md`That uses $c = 3\times10^8$ m/s. On this line the speed is $v$.`],
        md`$f_1 = v/2l = (2\times10^8)/(4) = 5\times10^7$ Hz $= 50$ MHz. Its wavelength is $2l = 4$ m.`),
      RF(md`
        ### 3. Shorted at both ends, and one of each

        **Short at both ends.** At $z = 0$ the voltage is zero: $V^+ + V^- = 0$, so $V^- = -V^+$. Then
        $$\tilde V(z) = -j2V^+\sin\beta z$$
        $$\tilde I(z) = \frac{2V^+}{Z_0}\cos\beta z$$
        The short at $z = l$ needs $\tilde V(l) = 0$: again $\sin\beta l = 0$, and the same $f_n = nv/2l$. Voltage and current have swapped roles: now the current is largest at the ends.

        [[fig:ss]]

        **Open at $z = 0$, short at $z = l$.** The open gives the open-line shapes, $\tilde V = 2V^+\cos\beta z$. The short at $z = l$ needs
        $$\cos\beta l = 0$$
        so $\beta l = \pi/2, 3\pi/2, 5\pi/2, \dots$, that is $\beta l = (2n + 1)\pi/2$ with $n = 0, 1, 2, \dots$ Put in $\beta = 2\pi f/v$:
        $$\frac{2\pi f\,l}{v} = \frac{(2n + 1)\pi}{2}$$
        $$\boxed{f_n = \frac{(2n + 1)\,v}{4l}}$$
        The line holds an odd number of quarter wavelengths: $l = (2n + 1)\lambda/4$. The lowest one, $v/4l$, is **half** the lowest of a line with matching ends, and only **odd** multiples of it appear.

        [[fig:os]]

        !!intuition Does this make sense? The round trip again
          Now $\Gamma = +1$ at the open and $-1$ at the short. After one round trip, $2l/v$, a pulse comes back **upside down**; after two, $4l/v$, it is back as it was. So the period is $4l/v$ and the lowest frequency $v/4l$. A shape that flips sign every half period cannot contain even harmonics (they would come back the same, not flipped): only odd multiples survive.

        | Ends | What fits | $f_n$ | Lowest |
        |---|---|---|---|
        | open, open | $n\lambda/2$ | $nv/2l$, $n \ge 1$ | $v/2l$ |
        | short, short | $n\lambda/2$ | $nv/2l$, $n \ge 1$ | $v/2l$ |
        | open, short | $(2n + 1)\lambda/4$ | $(2n + 1)v/4l$, $n \ge 0$ | $v/4l$ |
      `, {
        ss: { svg: modeRow('ss', [1, 2], ['$n = 1$', '$n = 2$']), cap: 'Shorted at both ends. Solid: |V|, zero at both shorts; dashed: |I|, largest there.' },
        os: { svg: modeRow('os', [0, 1], ['$n = 0$: $l = \\lambda/4$', '$n = 1$: $l = 3\\lambda/4$']), cap: 'Open at the left, shorted at the right. The voltage peaks at the open and vanishes at the short.' },
      }),
      Q(md`**Predict.** A $1.5$ m air line ($v = 3\times10^8$ m/s) is open at one end and shorted at the other. What is its **second**-lowest resonant frequency?`,
        [md`$150$ MHz`, md`$100$ MHz`, md`$200$ MHz`, md`$50$ MHz`], 0,
        [null, md`That is $2\times v/4l$. Even multiples of $v/4l$ do not fit: the next one after $v/4l$ is $3v/4l$.`, md`That is $2v/2l$, the second resonance of a line whose ends match.`, md`That is the lowest one, $v/4l$.`],
        md`$f_n = (2n + 1)v/4l = (2n + 1)(50\ \text{MHz})$: 50, 150, 250 MHz, … The second is 150 MHz.`),
      Q(md`**Predict.** At the lowest resonance of a line **shorted at both ends**, where is $|I|$ largest?`,
        [md`at both ends`, md`in the middle`, md`it is the same everywhere`, md`at one end only`], 0,
        [null, md`The middle is where $|V|$ peaks: $\sin(\pi z/l)$ is 1 at $z = l/2$.`, md`A standing wave always has a pattern; uniform needs $\beta = 0$.`, md`The two ends are alike, so the pattern is symmetric.`],
        md`$\tilde I \propto \cos\beta z$ with $\beta l = \pi$: $|\cos|$ is 1 at $z = 0$ and $z = l$, and 0 in the middle.`),
      RF(md`
        ### 4. The shorted stub as a circuit element: $Z = jZ_0\tan\beta l$

        Now drive one end and short the other. Measure $d$ back from the short, so the short is at $d = 0$ and the input is at $d = l$. There are two ways to the input impedance.

        **Way 1: the tangent form** of [Topic 17](#/l/w6-vd), with $Z_L = 0$:
        $$Z(d) = Z_0\,\frac{0 + jZ_0\tan\beta d}{Z_0 + 0} = jZ_0\tan\beta d$$
        **Way 2: from the standing wave.** A short has $\Gamma_L = -1$. Put that in $\tilde V(d) = V^+(e^{j\beta d} + \Gamma_Le^{-j\beta d})$:
        $$\tilde V(d) = V^+\left(e^{j\beta d} - e^{-j\beta d}\right) = j2V^+\sin\beta d$$
        and in the current, which has the opposite sign on the reflected wave:
        $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} + e^{-j\beta d}\right) = \frac{2V^+}{Z_0}\cos\beta d$$
        These are the sheet's short-circuit line and the current from the 2025 review session. Divide; $2V^+$ cancels:
        $$\boxed{Z(l) = jZ_0\tan\beta l}$$
        Read it like a circuit element:
        - It is **purely reactive**: no resistance. A lossless stub cannot use up power.
        - $0 < l < \lambda/4$: $\tan\beta l > 0$, so $X > 0$: **inductive**.
        - $\lambda/4 < l < \lambda/2$: $\tan\beta l < 0$: **capacitive**.
        - It repeats every $\lambda/2$. Between $0$ and $\lambda/2$, $X$ takes every value from $-\infty$ to $\infty$: a shorted stub can stand in for any inductor or capacitor, at one frequency.

        [[fig:react]]

        !!intuition Does this make sense?
          A very short stub, $\beta l \ll 1$, has $\tan\beta l \approx \beta l$. Then $Z \approx jZ_0\beta l = j\sqrt{L/C}\cdot\omega\sqrt{LC}\cdot l = j\omega(Ll)$. That is an inductor whose inductance is the line's $L$ per meter times its length: a short loop of wire. ✓
      `, { react: { svg: PF.row([{ svg: reactFig(true), cap: 'Shorted: X = Z₀ tan βl' }, { svg: reactFig(false), cap: 'Open: X = −Z₀ cot βl' }]).svg, cap: 'Reactance of a stub against its length. Above the axis: inductive. Below: capacitive. Each quarter wave flips between a short (X = 0) and an open (X = ±∞).' } }),
      Q(md`**Predict.** A shorted $50\ \Omega$ stub is $\lambda/8$ long. Its input impedance is…`,
        [md`$j50\ \Omega$`, md`$-j50\ \Omega$`, md`$50\ \Omega$`, md`$j20.7\ \Omega$`], 0,
        [null, md`That is the open stub's $-jZ_0\cot\beta l$.`, md`A stub has no resistance: its impedance is purely imaginary.`, md`That uses $\beta l = 22.5°$. $\lambda/8$ is $45°$ of phase.`],
        md`$\beta l = (2\pi/\lambda)(\lambda/8) = 45°$ and $\tan45° = 1$: $Z = j50\ \Omega$, an inductor.`),
      R(md`
        ### 5. The open stub: $Z = -jZ_0\cot\beta l$

        **Way 1.** Let $Z_L \to \infty$ in the tangent form. Divide the top and the bottom by $Z_L$:
        $$Z(d) = Z_0\,\frac{1 + j(Z_0/Z_L)\tan\beta d}{Z_0/Z_L + j\tan\beta d}$$
        As $Z_L \to \infty$ the terms with $Z_0/Z_L$ vanish, leaving $Z_0/(j\tan\beta d)$. With $1/j = -j$:
        $$\boxed{Z(l) = -jZ_0\cot\beta l}$$
        **Way 2.** An open has $\Gamma_L = +1$:
        $$\tilde V(d) = V^+\left(e^{j\beta d} + e^{-j\beta d}\right) = 2V^+\cos\beta d$$
        $$\tilde I(d) = \frac{V^+}{Z_0}\left(e^{j\beta d} - e^{-j\beta d}\right) = j\,\frac{2V^+}{Z_0}\sin\beta d$$
        Divide: $Z = Z_0\cos\beta d/(j\sin\beta d) = -jZ_0\cot\beta d$. ✓ The sheet writes it as an admittance, $Y(d) = jY_0\tan\beta d$: the same line, turned over.

        - $0 < l < \lambda/4$: $\cot > 0$, so $X < 0$: **capacitive**.
        - $\lambda/4 < l < \lambda/2$: **inductive**.
        - An open stub of length $l$ acts like a shorted stub of length $l \pm \lambda/4$.

        !!intuition Does this make sense?
          A very short open stub: $\cot\beta l \approx 1/\beta l$, so $Z \approx -jZ_0/\beta l = 1/(j\omega(Cl))$. A capacitor whose capacitance is the line's $C$ per meter times its length: two short wires side by side. ✓
      `),
      Q(md`**Predict.** An open $100\ \Omega$ stub is $3\lambda/8$ long. It acts…`,
        [md`like an inductor, $Z = j100\ \Omega$`, md`like a capacitor, $Z = -j100\ \Omega$`, md`like a short`, md`like an open`], 0,
        [null, md`That is the open stub shorter than $\lambda/4$. Past $\lambda/4$ the sign flips.`, md`An open stub is a short at odd quarter waves; $3\lambda/8$ is not one.`, md`An open stub repeats an open only every $\lambda/2$.`],
        md`$\beta l = 135°$ and $\cot135° = -1$: $Z = -j100(-1) = +j100\ \Omega$. Inductive.`),
      R(md`
        ### 6. Series and parallel resonance of a stub

        Fix the length and raise the frequency. $\beta l = 2\pi fl/v$ grows in step with $f$, so the input impedance walks along the curves of section 4.

        **Shorted stub.**
        - $Z(l) = 0$ when $\tan\beta l = 0$: $\beta l = n\pi$, $l = n\lambda/2$, so $f = nv/2l$. It looks like a short: **series resonance**.
        - $Z(l) = \infty$ when $\beta l = (2n + 1)\pi/2$: $l = (2n + 1)\lambda/4$, so $f = (2n + 1)v/4l$. It looks like an open: **parallel resonance**.

        **Open stub:** the other way round. Series resonance at odd quarter waves, parallel resonance at whole half waves.

        | Stub | $Z(l)$ | $Z = 0$ (series) | $Z = \infty$ (parallel) |
        |---|---|---|---|
        | shorted | $jZ_0\tan\beta l$ | $l = n\lambda/2$, $f = nv/2l$ | $l = (2n + 1)\lambda/4$ |
        | open | $-jZ_0\cot\beta l$ | $l = (2n + 1)\lambda/4$ | $l = n\lambda/2$, $f = nv/2l$ |

        **These are the source-free resonances of sections 2 and 3.** A series resonance means you could short the input and nothing would change: a shorted stub with its input shorted is a short-short line, which rings at $nv/2l$. A parallel resonance means you could open the input: an open-short line, which rings at $(2n + 1)v/4l$. The zeros and the infinities of $Z(l)$ are where the stub rings by itself.

        **The LC analogy.** Just below $f = v/4l$, a shorted stub is inductive; just above, capacitive. That is how a parallel LC behaves around $\omega_0$. Around $f = v/2l$ it goes from capacitive to inductive, like a series LC. A stub is an infinite chain of LC resonators, alternating parallel and series.

        !!intuition Does this make sense?
          Starting from $f = 0$, a shorted stub is a short (a wire). It must become an open first, at $v/4l$, before it can be a short again at $v/2l$. An open stub starts as an open at $f = 0$ and becomes a short first, at $v/4l$.
      `),
      Q(md`**Predict.** A shorted line has its lowest **series** resonance at $\omega_0$. At $\omega = 3\omega_0/2$, its input impedance is…`,
        [md`infinite (an open)`, md`zero (a short)`, md`inductive`, md`capacitive`], 0,
        [null, md`Zero needs $\beta l = n\pi$; here $\beta l = 3\pi/2$.`, md`At $\beta l = 3\pi/2$ the tangent is infinite, not finite.`, md`At $\beta l = 3\pi/2$ the tangent is infinite, not finite.`],
        md`The lowest series resonance of a shorted line is $\beta l = \pi$. At $\tfrac32\omega_0$, $\beta l = 3\pi/2$, an odd number of quarter waves: $\tan \to \infty$, a parallel resonance. (Spring 2018 asked this at $2\omega_0$ and $\omega_0/2$.)`),
      Q(md`**Predict.** The same shorted line at $\omega = \omega_0/4$ is…`,
        [md`inductive`, md`capacitive`, md`an open`, md`a short`], 0,
        [null, md`$\beta l = \pi/4$ is shorter than a quarter wave, where a shorted stub is inductive.`, md`An open needs $\beta l = \pi/2$.`, md`A short needs $\beta l = \pi$.`],
        md`$\beta l = \pi/4$: $Z = jZ_0\tan45° = jZ_0$, inductive.`),
      RF(md`
        ### 7. Stubs inside circuits

        **A stub in series with a resistor** (Lecture 32's first example, with new numbers). A generator $\tilde F$, a shorted stub and a resistor $R$ are in series. The stub is $1$ m long with $v = 2\times10^8$ m/s and $Z_0 = R$. By the voltage divider,
        $$\frac{\tilde V_R}{\tilde F} = \frac{R}{R + jZ_0\tan\beta l} = \frac{1}{1 + j\tan\beta l}$$
        Its size is $1/\sqrt{1 + \tan^2\beta l} = |\cos\beta l|$. At the series resonances ($f = nv/2l = 100, 200, \dots$ MHz) the stub is a short and all of $\tilde F$ reaches $R$. At the parallel resonances ($50, 150, 250, \dots$ MHz) it is an open and $R$ gets nothing.

        **No current through the resistor** means the stub is an open: $Z(l) = \infty$. A shorted stub must then be an odd number of quarter waves long. The whole of $\tilde F$ sits across the stub's input, yet current still flows inside the stub: $\tilde I(d) = (2V^+/Z_0)\cos\beta d$ is largest at the short. The stub is ringing, like a parallel LC at resonance.

        **Adding a lumped element.** A stub at parallel resonance has $Z = \infty$. Put an inductor **in series** with it and the total is still $\infty$: nothing changes. Put it **in parallel** and the total is the inductor's own $j\omega L$: current flows again. The same logic for a series resonance ($Z = 0$): a parallel element changes nothing, a series element does. So a series element cannot move a parallel resonance, and a parallel element cannot move a series resonance; each can move the other kind (Lecture 32, Example 2).

        ### 8. Stub filters

        A stub can pass one frequency and kill another, because its length in wavelengths changes with $f$.

        **Where it goes decides what it does.**
        - A **shunt** stub sits across the line, in parallel with the load. When it is an open, it is invisible. When it is a short, it shorts the load and nothing gets through.
        - A **series** stub sits in one conductor, between the generator and the load. When it is a short, it is invisible. When it is an open, it breaks the circuit.

        [[fig:shunt]]

        **Design: pass $f_0$, block $2f_0$, with a shunt stub.** You need an open at $f_0$ and a short at $2f_0$. A shorted stub of length $\lambda_0/4$ (the quarter wave at $f_0$) is an open at $f_0$. At $2f_0$ the wavelength halves, so the same stub is $\lambda/2$ long: a short. ✓ It also blocks $4f_0, 6f_0, \dots$ (and DC, where it is a wire), and passes $3f_0, 5f_0, \dots$

        Could an open shunt stub do it? It is an open at $f_0$ only if $l = n\lambda_0/2$, and a short at $2f_0$ only if $l$ is an odd number of quarter waves at $2f_0$, that is an odd multiple of $\lambda_0/8$. No length is both.

        [[fig:resp]]

        The other three designs follow the same reasoning:

        | Goal | Shunt stub | Series stub |
        |---|---|---|
        | pass $f_0$, block $2f_0$ | shorted, $\lambda_0/4$ | open, $\lambda_0/4$ |
        | block $f_0$, pass $2f_0$ | open, $\lambda_0/4$ | shorted, $\lambda_0/4$ |
      `, {
        shunt: { svg: shuntFig(), cap: 'A shunt stub across the load. Open at its input: invisible. Short: the load sees nothing.' },
        resp: { svg: respFig(), cap: 'A shorted λ₀/4 shunt stub (Z₀ = R, matched generator): full output at f₀ and 3f₀, nothing at 2f₀ and 4f₀.' },
      }),
      Q(md`**Predict.** In the circuit "generator, resistor, shorted $\lambda/4$ stub in series", no current flows. You add a capacitor and now current flows. Where did you add it?`,
        [md`in parallel with the stub`, md`in series with the stub`, md`either place works`, md`neither: a capacitor cannot change it`], 0,
        [null, md`In series with an open, the total is still open.`, md`In series it changes nothing: $\infty + 1/j\omega C = \infty$.`, md`In parallel, the capacitor's own impedance takes over: $Z = 1/j\omega C$, finite.`],
        md`The $\lambda/4$ shorted stub is an open. Only a parallel path lets current through. (Spring 2017 asked this with an inductor.)`),
      Q(md`**Predict.** With $v = 3\times10^8$ m/s, you want a **shunt** stub that passes $150$ MHz and blocks $300$ MHz. Which works?`,
        [md`a shorted stub $50$ cm long`, md`an open stub $50$ cm long`, md`a shorted stub $100$ cm long`, md`an open stub $25$ cm long`], 0,
        [null, md`That one is a short at 150 MHz and an open at 300 MHz: it does the opposite.`, md`That is $\lambda_0/2$: a short at 150 MHz, which blocks the wanted signal.`, md`That is $\lambda_0/8$: a reactance at 150 MHz, not invisible.`],
        md`$\lambda_0 = 2$ m at 150 MHz. A shorted $\lambda_0/4 = 50$ cm stub is an open at 150 MHz and, being $\lambda/2$ at 300 MHz, a short there.`),
      RF(md`
        ### The method

        !!method Stub questions in four moves
          1. **Wavelength at this frequency.** $\lambda = v/f$. When the frequency changes, recompute it.
          2. **Count quarter waves.** $l/(\lambda/4)$.
          3. **Read the stub.** Shorted: an even count is a short, an odd count an open; in between, shorter than the next quarter wave is inductive, then capacitive. Open: the reverse. Exact values: $jZ_0\tan\beta l$ or $-jZ_0\cot\beta l$.
          4. **Place it.** Shunt: open is invisible, short blocks. Series: short is invisible, open blocks.

        ### Worked example 1: the resonances of one line

        !!graded Problem
          A $1$ m coaxial line has $v = 2\times10^8$ m/s. List its three lowest source-free resonant frequencies when (a) both ends are open, (b) both are shorted, (c) one is open and one shorted. Where is $|V|$ largest at the lowest resonance in (c)?

        **(a) and (b).** Matching ends need $l = n\lambda/2$:
        $$f_n = \frac{nv}{2l} = n\cdot\frac{2\times10^8}{2} = n\cdot100\ \text{MHz}$$
        So 100, 200 and 300 MHz, for both.

        **(c).** Mixed ends need $l = (2n + 1)\lambda/4$:
        $$f_n = \frac{(2n + 1)v}{4l} = (2n + 1)\cdot50\ \text{MHz}$$
        So 50, 150 and 250 MHz.

        **Where $|V|$ peaks in (c).** At 50 MHz, $\lambda = 4$ m $= 4l$: a quarter wave fits. The voltage is zero at the short and largest at the open end, a quarter wave away.

        **Speed path.** Compute $v/2l$ once. Matching ends: its multiples. Mixed: halve it, then take odd multiples.

        **Where points go.** Using $c$ instead of $v$. Listing 50, 100, 150 MHz for (c): even multiples of $v/4l$ do not fit.

        ### Worked example 2: one stub at four frequencies

        !!graded Problem
          A shorted $50\ \Omega$ stub is $25$ cm long with $v = 2\times10^8$ m/s. Find its input impedance at 100, 200, 300 and 400 MHz, and the element it imitates at 100 and 300 MHz.

        **100 MHz.** $\lambda = v/f = 2$ m, so $l = \lambda/8$ and $\beta l = 45°$:
        $$Z = j50\tan45° = j50\ \Omega$$
        Inductive. With $\omega = 2\pi\times10^8$ rad/s,
        $$L = \frac{X}{\omega} = \frac{50}{2\pi\times10^8} = 79.6\ \text{nH}$$
        **200 MHz.** $\lambda = 1$ m, $l = \lambda/4$: $\tan90° \to \infty$. An open: parallel resonance.

        **300 MHz.** $\lambda = 2/3$ m, $l = 3\lambda/8$, $\beta l = 135°$:
        $$Z = j50\tan135° = -j50\ \Omega$$
        Capacitive. $X = -1/\omega C$, so
        $$C = \frac{1}{\omega|X|} = \frac{1}{(6\pi\times10^8)(50)} = 10.6\ \text{pF}$$
        **400 MHz.** $\lambda = 0.5$ m, $l = \lambda/2$: $\tan180° = 0$. A short: series resonance.

        **Check with the short-stub picture.** $L$ per meter is $Z_0/v = 50/(2\times10^8) = 0.25\ \mu$H/m, so $25$ cm of it is $62.5$ nH. That is below the exact $79.6$ nH because $\tan45° = 1$ exceeds $\beta l = 0.785$: the approximation needs $\beta l \ll 1$.

        **Speed path.** Write each frequency as eighths of a wave: 1, 2, 3, 4 eighths give $+jZ_0$, open, $-jZ_0$, short.

        **Where points go.** Keeping $\lambda = 2$ m at every frequency. Writing $C = \omega|X|$ instead of $1/\omega|X|$.

        ### Worked example 3: in the style of Spring 2017, new numbers

        !!graded Problem
          A generator $\tilde F = 12$ V, a resistor $R = 60\ \Omega$ and a shorted air line ($Z_0 = 75\ \Omega$, $v = 3\times10^8$ m/s) are in series, at $f = 150$ MHz. (a) $\lambda$? (b) The resistor current is zero. What is $Z(l)$, and what is the shortest $l$? (c) Can $\tilde V(l/2)$ be zero? (d) How big is the current at the short? (e) An inductor is added and current flows again. Series or parallel?

        **(a)** $\lambda = v/f = 3\times10^8/1.5\times10^8 = 2$ m.

        **(b)** No current means the stub is an open: $Z(l) = \infty$. A shorted stub is open at odd quarter waves; the shortest is $l = \lambda/4 = 0.5$ m.

        **(c)** $\tilde V(d) = j2V^+\sin\beta d$ is zero only at $d = 0, \lambda/2, \lambda, \dots$ With $l = (2n + 1)\lambda/4$, $l/2 = (2n + 1)\lambda/8$, never a multiple of $\lambda/2$. So no.

        **(d)** No current means no drop across $R$, so all of $\tilde F$ sits across the stub's input: $\tilde V(l) = 12$ V. With $\sin\beta l = 1$, $j2V^+ = 12$, so $|V^+| = 6$ V. At the short,
        $$|\tilde I(0)| = \frac{2|V^+|}{Z_0} = \frac{12}{75} = 0.16\ \text{A}$$
        The stub rings with a real current even though none enters it.

        **(e)** In series with an open, an inductor changes nothing. It must be in parallel.

        **Speed path.** "Zero current" = open = odd quarter waves for a shorted stub. The current at the short is $\tilde F/Z_0$ in size.

        **Where points go.** Answering $\lambda/2$ in (b) (that makes $Z = 0$ and the largest current). Forgetting that $d$ is measured from the short in (c).

        ### The whole topic on one table

        | Fact | Formula |
        |---|---|
        | open-open, short-short | $f_n = nv/2l$ |
        | open-short | $f_n = (2n + 1)v/4l$ |
        | shorted stub | $Z = jZ_0\tan\beta l$; $\tilde V = j2V^+\sin\beta d$, $\tilde I = (2V^+/Z_0)\cos\beta d$ |
        | open stub | $Z = -jZ_0\cot\beta l$; $\tilde V = 2V^+\cos\beta d$, $\tilde I = j(2V^+/Z_0)\sin\beta d$ |
        | series resonance | $Z = 0$ |
        | parallel resonance | $Y = 0$, $Z = \infty$ |
        | tiny shorted stub | inductor $Ll$ |
        | tiny open stub | capacitor $Cl$ |

        !!mistake Common mistakes
          - **Naming them backward.** Series resonance is $Z = 0$ (a short); parallel resonance is $Z = \infty$ (an open).
          - **$\tan$ for an open stub.** An open stub is $-jZ_0\cot\beta l$.
          - **Even multiples on a mixed line.** Open-short resonances are odd multiples of $v/4l$ only.
          - **Same $\lambda$ at a new frequency.** $\lambda = v/f$ changes; the stub's length in wavelengths changes with it.
          - **$c$ instead of $v$** on a filled line.
          - **"No current into the stub means no current in it."** The standing wave inside is largest at the short.
          - **A shunt short passes everything.** A short across the load kills the load voltage.

        !!key Speed tricks
          - **Count eighths.** Shorted: $\lambda/8 \to +jZ_0$, $\lambda/4 \to$ open, $3\lambda/8 \to -jZ_0$, $\lambda/2 \to$ short. Open: shift by one quarter.
          - **$|X| = Z_0$ exactly at odd eighths.**
          - **Lowest resonance:** matching ends $v/2l$, mixed ends $v/4l$. Period: round-trip time $2l/v$, or twice it for mixed ends.
          - **Shunt: open is invisible. Series: short is invisible.**
          - **A shorted $\lambda_0/4$ shunt stub** passes the odd harmonics and kills the even ones.
          - **Frequency ratio = length ratio in wavelengths.** Doubling $f$ doubles $\beta l$.
          - **Small stubs:** shorted is $L\cdot l$, open is $C\cdot l$.

        ### Check questions
      `, {}),
      Q(md`On a line shorted at the load, $\tilde I(d)$ is…`,
        [md`$\dfrac{2V^+}{Z_0}\cos\beta d$`, md`$j\dfrac{2V^+}{Z_0}\sin\beta d$`, md`$\dfrac{V^+}{Z_0}e^{j\beta d}$`, md`$0$`], 0,
        [null, md`That is the open line's current: it vanishes at the open.`, md`That is the incident wave alone. The reflected one adds with $\Gamma_L = -1$.`, md`A short carries the largest current of all.`],
        md`$\tilde I = (V^+/Z_0)(e^{j\beta d} - \Gamma_Le^{-j\beta d})$ with $\Gamma_L = -1$ gives $(V^+/Z_0)\cdot2\cos\beta d$.`),
      Q(md`As the frequency rises from zero, the first resonance a **shorted** stub reaches is…`,
        [md`a parallel resonance, at $v/4l$`, md`a series resonance, at $v/4l$`, md`a series resonance, at $v/2l$`, md`a parallel resonance, at $v/2l$`], 0,
        [null, md`At $v/4l$ the shorted stub is a quarter wave: an open, which is a parallel resonance.`, md`That is the second one. The first comes at a quarter wave.`, md`At $v/2l$ a shorted stub is a short.`],
        md`At DC the stub is a wire (a short). It turns into an open at $l = \lambda/4$ first.`),
      Q(md`The sheet writes the open line as $Y(d) = jY_0\tan\beta d$. In impedance form that is…`,
        [md`$-jZ_0\cot\beta d$`, md`$jZ_0\cot\beta d$`, md`$jZ_0\tan\beta d$`, md`$-jZ_0\tan\beta d$`], 0,
        [null, md`$1/j = -j$: the sign flips.`, md`That is the shorted line.`, md`Inverting $\tan$ gives $\cot$.`],
        md`$Z = 1/Y = 1/(jY_0\tan\beta d) = -jZ_0\cot\beta d$.`),
      Q(md`An open stub much shorter than a wavelength acts like…`,
        [md`a capacitor of size $C$ per meter times its length`, md`an inductor of size $L$ per meter times its length`, md`a short`, md`a resistor $Z_0$`], 0,
        [null, md`That is the shorted stub.`, md`A very short open stub is close to an open, not a short.`, md`A lossless stub has no resistance.`],
        md`$-jZ_0\cot\beta l \approx -jZ_0/\beta l = 1/(j\omega Cl)$.`),
      Q(md`A shunt open stub is $\lambda_0/4$ long at $f_0$. At $2f_0$ it is…`,
        [md`an open, so it is invisible`, md`a short, so it blocks`, md`inductive`, md`capacitive`], 0,
        [null, md`At $2f_0$ it is $\lambda/2$ long. An open stub repeats an open every $\lambda/2$.`, md`$\beta l = \pi$ exactly: $\cot\pi$ is infinite, not finite.`, md`$\beta l = \pi$ exactly: $\cot\pi$ is infinite, not finite.`],
        md`$\lambda$ halves when $f$ doubles, so the stub becomes $\lambda/2$: $Z = -jZ_0\cot\pi = \infty$.`),
      Q(md`What is the period of a source-free oscillation on a line open at one end and shorted at the other?`,
        [md`$4l/v$`, md`$2l/v$`, md`$l/v$`, md`$l/2v$`], 0,
        [null, md`After one round trip ($2l/v$) the wave is upside down: it needs two round trips.`, md`That is a one-way trip.`, md`That is half a one-way trip.`],
        md`$\Gamma = +1$ at the open and $-1$ at the short, so one round trip inverts. The lowest frequency is $v/4l$.`),
      R(md`
        ### Practice, level 1: resonances

        **The trick:** matching ends, multiples of $v/2l$; mixed ends, odd multiples of $v/4l$.
      `),
      Object.assign(G('rf_w6v_res', { need: 8 }), { id: 'w6-stubs.r0' }),
      R(md`
        ### Practice, level 1: what a stub looks like

        **The trick:** count eighths of a wave. Shorted: $+jZ_0$, open, $-jZ_0$, short. Open: the same, a quarter wave later.
      `),
      Object.assign(G('rf_w6v_stub', { need: 8 }), { id: 'w6-stubs.r1' }),
      R(md`
        ### Practice, level 1: resonance and filters

        **The trick:** scale $\beta l$ with the frequency. Shunt: open passes. Series: short passes.
      `),
      Object.assign(G('rf_w6v_filt', { need: 8 }), { id: 'w6-stubs.r2' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w6v_modes', { need: 2 }),
      G('w6v_stubz', { need: 2 }),
      G('w6v_design', { need: 2 }),
      G('w6v_tune', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A stub in series with a generator and a resistor, the way past exams ask it.
      `),
      G('w6v_stubckt', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- Topic 18, level 1
  const LV = [[1, 2e8], [2, 2e8], [1.5, 3e8], [3, 3e8], [0.5, 2e8], [0.75, 1.5e8], [150, 3e8], [300, 3e8]];
  const ORD = ['', 'lowest', 'second-lowest', 'third-lowest'];
  const lenTx = (l) => (l >= 10 ? `${p(l)}\\ \\text{m}` : l >= 1 ? `${p(l)}\\ \\text{m}` : `${p(l * 100)}\\ \\text{cm}`);
  const sec = (t) => (t >= 1e-6 ? `${p(t * 1e6)}\\ \\mu\\text{s}` : `${p(t * 1e9)}\\ \\text{ns}`);

  GENS.rf_w6v_res = () => one([
    // matching ends
    () => {
      const [l, v] = pick(LV), kind = pick(['open', 'shorted']), n = pick([1, 2, 3]);
      const f1 = v / (2 * l), H = (x) => `$${hz(x)}$`;
      const W = [[H((n * v) / (4 * l)), md`That uses $v/4l$, the formula for ends of different kinds.`], [H(((2 * n - 1) * v) / (4 * l)), md`That is the open-short list, odd multiples of $v/4l$.`], [H((n * v) / l), md`That fits whole wavelengths. The lowest mode fits half a wavelength.`]];
      if (v !== 3e8) W.push([H((n * 3e8) / (2 * l)), md`That uses $c$. On this line the speed is $v$.`]);
      return MC('Matching ends', md`A line of length $${lenTx(l)}$ with $v = ${vtx(v)}$ m/s is ${kind} at both ends. Its ${ORD[n]} resonant frequency is…`, H(n * f1), W,
        md`Matching ends hold $n$ half waves: $f_n = nv/2l = ${n}\cdot${hz(f1)} = ${hz(n * f1)}$.`);
    },
    // mixed ends
    () => {
      const [l, v] = pick(LV), n = pick([1, 2, 3]), q = v / (4 * l), H = (x) => `$${hz(x)}$`;
      return MC('One open, one shorted', md`A line of length $${lenTx(l)}$ with $v = ${vtx(v)}$ m/s is open at one end and shorted at the other. Its ${ORD[n]} resonant frequency is…`, H((2 * n - 1) * q),
        [[H((n * v) / (2 * l)), md`That is $nv/2l$, for ends of the same kind.`], [H(n * q), md`Even multiples of $v/4l$ do not fit: only odd ones.`], [H((2 * n + 1) * q), md`Off by one: the lowest is $v/4l$ itself ($n = 0$ in $(2n + 1)v/4l$).`], [H((2 * n - 1) * 2 * q), md`That is $(2n - 1)v/2l$: the right pattern on the wrong base. The base is $v/4l$.`]],
        md`Odd quarter waves: $f = (2n + 1)v/4l$ with $n = 0, 1, 2$: $${hz(q)}$, $${hz(3 * q)}$, $${hz(5 * q)}$. The ${ORD[n]} is $${hz((2 * n - 1) * q)}$.`);
    },
    // which harmonics
    () => {
      const mixed = pick([true, false]);
      const A = md`every whole multiple of the lowest one`, B = md`only the odd multiples of the lowest one`;
      return MC('Which harmonics', md`On a lossless line ${mixed ? 'open at one end and shorted at the other' : pick(['open at both ends', 'shorted at both ends'])}, the resonant frequencies are…`, mixed ? B : A,
        [[mixed ? A : B, mixed ? md`One round trip flips the wave ($\Gamma = +1$ and $-1$), so even harmonics cannot survive.` : md`With matching ends a round trip returns the wave unchanged, so every multiple of $v/2l$ fits.`],
          [md`only the even multiples of the lowest one`, md`No line keeps only even multiples: the lowest one itself is odd.`],
          [md`only the lowest one, like an LC circuit`, md`A line holds $n$ half (or odd quarter) waves for every $n$: infinitely many resonances.`]],
        mixed ? md`$f_n = (2n + 1)v/4l$: $1, 3, 5, \dots$ times $v/4l$.` : md`$f_n = nv/2l$: $1, 2, 3, \dots$ times $v/2l$.`);
    },
    // the period
    () => {
      const [l, v] = pick(LV), mixed = pick([true, false]), T = ((mixed ? 4 : 2) * l) / v, S = (x) => `$${sec(x)}$`;
      return MC('The period', md`A line of length $${lenTx(l)}$ with $v = ${vtx(v)}$ m/s is ${mixed ? 'open at one end and shorted at the other' : 'open at both ends'}. The period of its slowest source-free oscillation is…`, S(T),
        [[S(((mixed ? 2 : 4) * l) / v), mixed ? md`$2l/v$ is one round trip, but here a round trip flips the wave. Two are needed.` : md`$4l/v$ is for mixed ends, where one round trip flips the wave.`],
          [S(l / v), md`That is a one-way trip.`], [S((8 * l) / v), md`That is four round trips.`]],
        md`${mixed ? 'Two round trips' : 'One round trip'}: $T = ${mixed ? 4 : 2}l/v = ${sec(T)}$.`);
    },
    // the shape of a mode
    () => {
      const n = pick([1, 2, 3]), ss = pick([true, false]);
      return MC('Counting nulls', md`A line ${ss ? 'shorted' : 'open'} at both ends oscillates at its ${ORD[n]} resonance. How many ${ss ? 'voltage' : 'current'} nulls does it have, counting both ends?`, `$${n + 1}$`,
        [[`$${n}$`, md`Count again: $n$ half waves have $n + 1$ ends.`], [`$${n - 1}$`, md`That leaves out the two ends, where the ${ss ? 'shorts force V' : 'opens force I'} to zero.`], [`$${2 * n + 1}$`, md`That counts nulls every quarter wave. ${ss ? 'Voltage' : 'Current'} nulls are half a wave apart.`], [`$${n + 2}$`, md`One too many: $n$ half waves have $n + 1$ ends.`]],
        md`The ${ss ? 'voltage' : 'current'} goes as $\sin\beta z$ with $\beta l = ${n}\pi$: zero at $z = 0, l/${n}, \dots, l$, which is ${n + 1} points.`);
    },
  ]);

  // the stub at k eighths of a wave
  const stubAt = (short, k, Z0) => {
    const m = ((k % 4) + 4) % 4;
    if (short) return m === 0 ? { t: '0', w: 'a short' } : m === 2 ? { t: '\\infty', w: 'an open' } : m === 1 ? { t: `j${Z0}`, w: 'inductive' } : { t: `-j${Z0}`, w: 'capacitive' };
    return m === 0 ? { t: '\\infty', w: 'an open' } : m === 2 ? { t: '0', w: 'a short' } : m === 1 ? { t: `-j${Z0}`, w: 'capacitive' } : { t: `j${Z0}`, w: 'inductive' };
  };
  GENS.rf_w6v_stub = () => one([
    // value at k eighths
    () => {
      const Z0 = pick([50, 75, 100]), k = pick([1, 2, 3, 4, 5, 6, 7]), sh = pick([true, false]);
      const o = (s) => `$Z = ${s.t}${s.t === '0' || s.t === '\\infty' ? '' : '\\ \\Omega'}$`;
      return MC(`${sh ? 'Shorted' : 'Open'} stub`, md`${sh ? 'A shorted' : 'An open'} $${Z0}\ \Omega$ stub is $${LEN8[k]}$ long. Its input impedance is…`, o(stubAt(sh, k, Z0)),
        [[o(stubAt(!sh, k, Z0)), md`That is the ${sh ? 'open' : 'shorted'} stub's value. ${sh ? 'Shorted: $jZ_0\\tan\\beta l$.' : 'Open: $-jZ_0\\cot\\beta l$.'}`],
          [o(stubAt(sh, k + 2, Z0)), md`That is a quarter wave off. Count: $\beta l = ${45 * k}°$.`],
          [`$Z = ${Z0}\\ \\Omega$`, md`A lossless stub has no resistance.`],
          [o(stubAt(sh, k + 1, Z0)), md`That is an eighth of a wave off. Count: $\beta l = ${45 * k}°$.`]],
        md`$\beta l = ${45 * k}°$. ${sh ? md`$Z = jZ_0\tan(${45 * k}°)$` : md`$Z = -jZ_0\cot(${45 * k}°)$`}: ${stubAt(sh, k, Z0).w}.`);
    },
    // inductive or capacitive
    () => {
      const sh = pick([true, false]), x = pick([0.05, 0.1, 0.15, 0.2, 0.3, 0.35, 0.4, 0.45, 0.6, 0.7, 0.85, 0.9]);
      const m = x - 0.5 * Math.floor(x / 0.5 + 1e-9), ind = sh ? m < 0.25 : m > 0.25;
      return MC('Inductive or capacitive', md`${sh ? 'A shorted' : 'An open'} stub is $${p(x)}\lambda$ long. At its input it is…`, ind ? 'inductive' : 'capacitive',
        [[ind ? 'capacitive' : 'inductive', sh ? md`A shorted stub is inductive in the first quarter of each half wave and capacitive in the second.` : md`An open stub is capacitive in the first quarter of each half wave and inductive in the second.`],
          ['a short circuit', md`That needs a whole number of ${sh ? 'half' : 'odd quarter'} waves.`], ['an open circuit', md`That needs ${sh ? 'an odd number of quarter' : 'a whole number of half'} waves.`], ['resistive', md`A lossless stub has no resistance.`]],
        md`Within each half wave (it repeats every $\lambda/2$), this is $${p(+m.toFixed(3))}\lambda$, ${m < 0.25 ? 'before' : 'after'} the quarter-wave point. ${sh ? 'Shorted' : 'Open'}: ${ind ? 'inductive' : 'capacitive'}.`);
    },
    // the element it imitates
    () => {
      const Z0 = pick([50, 100]), w = pick([1e8, 2e8, 5e8, 1e9]), sh = pick([true, false]), k = pick([1, 3]);
      const X = (sh ? 1 : -1) * (k === 1 ? 1 : -1) * Z0, isL = X > 0;
      const Ln = (x) => `$L = ${p(+(x * 1e9).toPrecision(3))}\\ \\text{nH}$`, Cp = (x) => `$C = ${p(+(x * 1e12).toPrecision(3))}\\ \\text{pF}$`;
      const Lv = Z0 / w, Cv = 1 / (w * Z0);
      const right = isL ? Ln(Lv) : Cp(Cv);
      return MC('The element it imitates', md`${sh ? 'A shorted' : 'An open'} $${Z0}\ \Omega$ stub is $${LEN8[k]}$ long at $\omega = ${p(w)}$ rad/s. It acts like…`, right,
        [[isL ? Cp(Cv) : Ln(Lv), md`Wrong kind. Here $X = ${X > 0 ? '+' : '-'}${Z0}\ \Omega$, ${isL ? 'positive: an inductor' : 'negative: a capacitor'}.`],
          [isL ? Ln(1 / (w * Z0)) : Cp(Z0 / w), isL ? md`That inverts it. $X = \omega L$, so $L = X/\omega$.` : md`That treats it like an inductor. $X = -1/\omega C$, so $C = 1/\omega|X|$.`],
          [isL ? Ln(Lv / (2 * PI)) : Cp(Cv / (2 * PI)), md`An extra $2\pi$: $\omega$ is already in rad/s.`],
          [isL ? Ln(2 * Lv) : Cp(Cv / 2), md`At odd eighths $|X| = Z_0$ exactly, not $2Z_0$.`]],
        md`$\beta l = ${45 * k}°$, so $X = ${X}\ \Omega$. ${isL ? md`$L = X/\omega = ${Z0}/${p(w)}$` : md`$C = 1/(\omega|X|) = 1/(${p(w)}\cdot${Z0})$`}, which is ${right}.`);
    },
    // the line formulas
    () => one([
      () => MC('The open line', md`On a line that is open at the load, $\tilde V(d)$ is…`, md`$2V^+\cos\beta d$`,
        [[md`$j2V^+\sin\beta d$`, md`That is the shorted line: zero at the load.`], [md`$2V^+\sin\beta d$`, md`At an open the voltage is largest, so it cannot vanish at $d = 0$.`], [md`$V^+e^{j\beta d}$`, md`That is the incident wave alone.`]],
        md`$\Gamma_L = +1$: $\tilde V = V^+(e^{j\beta d} + e^{-j\beta d}) = 2V^+\cos\beta d$.`),
      () => MC('The open stub', md`The input impedance of an open stub of length $l$ is…`, md`$-jZ_0\cot\beta l$`,
        [[md`$jZ_0\tan\beta l$`, md`That is the shorted stub.`], [md`$jZ_0\cot\beta l$`, md`$1/j = -j$: the sign is negative.`], [md`$-jZ_0\tan\beta l$`, md`At $l \to 0$ an open stub is an open, so its impedance must blow up: that needs $\cot$.`]],
        md`$Z = \tilde V/\tilde I = 2V^+\cos\beta l/(j(2V^+/Z_0)\sin\beta l)$.`),
      () => MC('The shorted line', md`On a line shorted at the load, $\tilde V(d)$ is…`, md`$j2V^+\sin\beta d$`,
        [[md`$2V^+\cos\beta d$`, md`That is the open line: it does not vanish at the short.`], [md`$\dfrac{2V^+}{Z_0}\cos\beta d$`, md`That is the current, in amperes.`], [md`$0$ everywhere`, md`Only at the short itself, and every $\lambda/2$ from it.`]],
        md`$\Gamma_L = -1$: $\tilde V = V^+(e^{j\beta d} - e^{-j\beta d}) = j2V^+\sin\beta d$.`),
    ]),
  ]);

  // what the stub does where it is placed
  const actAt = (short, quarters) => {     // quarters: l in units of lambda/4 (may be fractional)
    const r = quarters - 2 * Math.floor(quarters / 2 + 1e-9);
    if (Math.abs(r) < 1e-9) return short ? 'short' : 'open';
    if (Math.abs(r - 1) < 1e-9) return short ? 'open' : 'short';
    return 'react';
  };
  GENS.rf_w6v_filt = () => one([
    // scaling the frequency (Spring 2018 style)
    () => {
      const sh = pick([true, false]), ser = pick([true, false]), r = pick([0.25, 0.5, 0.75, 1.5, 2, 2.5, 3]);
      // the lowest series (Z = 0) or parallel (Z = inf) resonance, in quarter waves
      const q0 = sh ? (ser ? 2 : 1) : (ser ? 1 : 2), q = q0 * r;
      const a = actAt(sh, q), bl = (q * 90);
      const sgn = sh ? Math.tan((bl * PI) / 180) : -1 / Math.tan((bl * PI) / 180);
      const right = a === 'short' ? md`$Z_{\text{in}} = 0$` : a === 'open' ? md`$Z_{\text{in}} = \infty$` : sgn > 0 ? 'inductive' : 'capacitive';
      const all = [md`$Z_{\text{in}} = 0$`, md`$Z_{\text{in}} = \infty$`, 'inductive', 'capacitive'];
      const why = (o) => md`At ${p(r)}$\omega_0$, $\beta l = ${p(bl)}°$, which gives ${a === 'short' ? 'a short' : a === 'open' ? 'an open' : sgn > 0 ? 'a positive reactance' : 'a negative reactance'}, not this.`;
      return MC('Scaling the frequency', md`A line of length $l$ is ${sh ? 'shorted' : 'open'} at its far end. Its lowest **${ser ? 'series' : 'parallel'}** resonance is at $\omega_0$. At $\omega = ${fr(r)}\,\omega_0$ its input impedance is…`, right,
        all.filter((o) => o !== right).map((o) => [o, why(o)]),
        md`The lowest ${ser ? 'series' : 'parallel'} resonance of ${sh ? 'a shorted' : 'an open'} line is at $\beta l = ${q0 * 90}°$. $\beta l$ scales with $\omega$, so at ${fr(r)}$\omega_0$ it is $${p(bl)}°$: ${a === 'react' ? (sgn > 0 ? 'inductive' : 'capacitive') : a === 'short' ? 'a short' : 'an open'}.`);
    },
    // a shunt or series stub at some multiple of f0
    () => {
      const sh = pick([true, false]), shunt = pick([true, false]), r = pick([0.5, 1, 1.5, 2, 3, 4]);
      const a = actAt(sh, r);   // the stub is lambda0/4 at f0
      const pass = shunt ? a === 'open' : a === 'short', block = shunt ? a === 'short' : a === 'open';
      const A = md`all of it: the stub is invisible`, B = md`nothing: the stub blocks it`, Cc = md`part of it: the stub is a reactance`;
      const right = pass ? A : block ? B : Cc;
      return MC(`A ${shunt ? 'shunt' : 'series'} stub`, md`${sh ? 'A shorted' : 'An open'} stub, $\lambda_0/4$ long at $f_0$, is connected ${shunt ? 'across the load (shunt)' : 'in series between the generator and the load'}. At $f = ${fr(r)}f_0$, how much of the signal reaches the load?`, right,
        [A, B, Cc, md`all of it: ${shunt ? 'a short across the load passes everything' : 'an open in series passes everything'}`].filter((o) => o !== right).map((o) => [o, md`At ${fr(r)}$f_0$ the stub is $${fr(r)}\cdot\lambda/4$ long: ${a === 'react' ? 'neither a short nor an open' : a === 'short' ? 'a short' : 'an open'}. ${shunt ? 'In shunt, an open is invisible and a short kills the load.' : 'In series, a short is invisible and an open breaks the circuit.'}`]),
        md`At ${fr(r)}$f_0$ the length is ${fr(r)} quarter waves, so the ${sh ? 'shorted' : 'open'} stub is ${a === 'react' ? 'a reactance' : a === 'short' ? 'a short' : 'an open'}. ${shunt ? 'In shunt' : 'In series'}, that ${pass ? 'is invisible' : block ? 'blocks the signal' : 'lets part through'}.`);
    },
    // pick the design
    () => {
      const shunt = pick([true, false]), passF0 = pick([true, false]);
      const goal = passF0 ? md`passes $f_0$ and blocks $2f_0$` : md`blocks $f_0$ and passes $2f_0$`;
      const opts = [[true, 1], [false, 1], [true, 2], [false, 2], [true, 0.5]];   // [shorted?, length in lambda0/4]
      const ok = (s, q) => { const a1 = actAt(s, q), a2 = actAt(s, 2 * q); const good = (a, want) => (shunt ? (want ? a === 'open' : a === 'short') : (want ? a === 'short' : a === 'open')); return good(a1, passF0) && good(a2, !passF0); };
      const name = (s, q) => md`${s ? 'a shorted' : 'an open'} stub, $${q === 1 ? '\\lambda_0/4' : q === 2 ? '\\lambda_0/2' : '\\lambda_0/8'}$ long`;
      const ri = opts.findIndex(([s, q]) => ok(s, q));
      const word = (a) => (a === 'react' ? 'a reactance' : a === 'short' ? 'a short' : 'an open');
      return MC('Choose the stub', md`Which ${shunt ? 'shunt' : 'series'} stub ${goal}? ($\lambda_0$ is the wavelength at $f_0$.)`, name(...opts[ri]),
        opts.filter((_, i) => i !== ri).map(([s, q]) => [name(s, q), md`It is ${word(actAt(s, q))} at $f_0$ and ${word(actAt(s, 2 * q))} at $2f_0$. ${shunt ? 'In shunt you need an open to pass and a short to block.' : 'In series you need a short to pass and an open to block.'}`]),
        md`${shunt ? 'Shunt: open passes, short blocks.' : 'Series: short passes, open blocks.'} ${name(...opts[ri])} is ${word(actAt(...opts[ri]))} at $f_0$ and ${word(actAt(opts[ri][0], 2 * opts[ri][1]))} at $2f_0$ ✓.`);
    },
    // the length in cm
    () => {
      const v = pick([2e8, 3e8]), f0 = pick([50e6, 75e6, 100e6, 150e6]), lam0 = v / f0;
      const c = (x) => `$${p(+(x * 100).toPrecision(3))}$ cm`;
      const W = [[c(lam0 / 2), md`$\lambda_0/2$ shorted is a short at $f_0$: it blocks what you want.`], [c(lam0 / 8), md`$\lambda_0/8$ is a reactance at $f_0$, not invisible.`], [c(lam0), md`A whole wavelength is a short at $f_0$.`]];
      if (v !== 3e8) W.push([c(3e8 / f0 / 4), md`That uses $c$. On this line the speed is $v$.`]);
      return MC('How long', md`A line has $v = ${vtx(v)}$ m/s. How long must a **shorted shunt** stub be (shortest choice) to pass $${hz(f0)}$ and block $${hz(2 * f0)}$?`, c(lam0 / 4), W,
        md`$\lambda_0 = v/f_0 = ${p(lam0)}$ m. A shorted $\lambda_0/4$ stub is an open at $f_0$ and a short at $2f_0$: $${p(+(lam0 * 25).toPrecision(3))}$ cm.`);
    },
    // adding a lumped element
    () => {
      const par = pick([true, false]), atPar = pick([true, false]), el = pick(['an inductor', 'a capacitor']);
      const elZ = el === 'an inductor' ? 'j\\omega L' : '1/j\\omega C';
      const stubZ = atPar ? '\\infty' : '0';
      // series element on an open: still open; parallel element on an open: element alone; series on a short: element; parallel on a short: short
      const res = atPar ? (par ? elZ : '\\infty') : (par ? '0' : elZ);
      const o = (t) => `$Z = ${t}$`;
      const why = md`${par ? 'In parallel, admittances add' : 'In series, impedances add'}. ${atPar ? (par ? 'An open adds zero admittance, so the element alone is left.' : 'Anything in series with an open is still open.') : (par ? 'A short in parallel shorts everything.' : 'Zero plus the element is the element.')}`;
      return MC('Adding a lumped element', md`A stub is at its ${atPar ? 'parallel' : 'series'} resonance ($Z = ${stubZ}$). You connect ${el} **in ${par ? 'parallel' : 'series'}** with it. The total impedance is…`, o(res),
        ['\\infty', '0', elZ, `2\\cdot ${elZ}`].filter((t) => t !== res).map((t) => [o(t), why]),
        why);
    },
  ]);

  // ---------------------------------------------------------------- Topic 18, level 2 and 3
  GENS.w6v_modes = () => {
    const kind = pick(['oo', 'ss', 'os']), l = pick([0.5, 1, 1.5, 2, 3]), [er, v] = pick([[1, 3e8], [2.25, 2e8], [4, 1.5e8]]);
    const mixed = kind === 'os', fn = (n) => (mixed ? ((2 * n - 1) * v) / (4 * l) : (n * v) / (2 * l));
    const lam2 = v / fn(2), name = { oo: 'open at both ends', ss: 'shorted at both ends', os: 'open at one end and shorted at the other' }[kind];
    return {
      title: 'The resonances of a line',
      q: md`A lossless line of length $${p(l)}$ m is filled with a dielectric of $\epsilon_r = ${er}$ ($\mu = \mu_0$). It is ${name}. Find its lowest resonant frequency, its third-lowest, and the wavelength at its second-lowest.`,
      parts: [
        Object.assign(N('f_1', fn(1) / 1e6, 'MHz'), { traps: [{ v: (mixed ? 2 : 0.5) * fn(1) / 1e6, msg: mixed ? 'That is v/2l, for matching ends. Mixed ends: v/4l.' : 'That is v/4l, for mixed ends. Matching ends: v/2l.' }, { v: (fn(1) * Math.sqrt(er)) / 1e6, msg: 'That uses c. In the dielectric v = c/√ε_r.' }] }),
        Object.assign(N('f_3', fn(3) / 1e6, 'MHz'), { traps: mixed ? [{ v: (3 * fn(1)) / 1e6, msg: 'Only odd multiples of v/4l fit: 1, 3, 5. The third is 5v/4l.' }] : [] }),
        N('\\lambda\\text{ at }f_2', lam2, 'm'),
      ],
      hints: [md`$v = c/\sqrt{\epsilon_r}$.`, mixed ? md`Mixed ends: $l = (2n + 1)\lambda/4$, $f = (2n + 1)v/4l$.` : md`Matching ends: $l = n\lambda/2$, $f = nv/2l$.`],
      sol: md`
        **Step 1: the speed.**
        $$v = \frac{c}{\sqrt{\epsilon_r}} = \frac{3\times10^8}{${p(Math.sqrt(er))}} = ${vtx(v)}\ \text{m/s}$$
        **Step 2: what fits.** ${mixed ? md`One open and one short: the voltage is largest at the open and zero at the short, so an odd number of quarter waves fits, $l = (2n + 1)\lambda/4$:
        $$f_n = \frac{(2n + 1)v}{4l},\quad n = 0, 1, 2, \dots$$` : md`Matching ends: a whole number of half waves fits, $l = n\lambda/2$:
        $$f_n = \frac{nv}{2l},\quad n = 1, 2, 3, \dots$$`}
        **Step 3: the numbers.** The base is $${mixed ? 'v/4l' : 'v/2l'} = ${f(fn(1) / 1e6)}$ MHz. The list is ${[1, 2, 3].map((n) => `${f(fn(n) / 1e6)}`).join(', ')} MHz, so $f_1 = ${f(fn(1) / 1e6)}$ MHz and $f_3 = ${f(fn(3) / 1e6)}$ MHz.

        **Step 4: the wavelength at the second.** $\lambda = v/f_2 = ${f(lam2)}$ m. Check: ${mixed ? `three quarter waves, 3λ/4 = ${f(0.75 * lam2)} m = l` : `two half waves, λ = ${f(lam2)} m = l`} ✓.
      `,
    };
  };

  GENS.w6v_stubz = () => {
    const sh = pick([true, false]), Z0 = pick([50, 75, 100]);
    const [v, fq] = pick([[3e8, 100e6], [3e8, 150e6], [3e8, 300e6], [2e8, 100e6], [2e8, 200e6]]);
    const lv = v / fq, bd = pick(Math.abs(lv - 3) < 1e-9 ? [30, 45, 60, 120, 135, 150] : [45, 135]), l = (lv * bd) / 360, w = 2 * PI * fq;
    const X = sh ? Z0 * Math.tan((bd * PI) / 180) : -Z0 / Math.tan((bd * PI) / 180), isL = X > 0;
    const val = isL ? (X / w) * 1e9 : 1e12 / (w * Math.abs(X));
    const Xw = sh ? -Z0 / Math.tan((bd * PI) / 180) : Z0 * Math.tan((bd * PI) / 180);
    return {
      title: 'A stub as an inductor or a capacitor',
      q: md`${sh ? 'A shorted' : 'An open'} $${Z0}\ \Omega$ stub has $v = ${vtx(v)}$ m/s and is $${p(+(l * 100).toPrecision(4))}$ cm long. At $${hz(fq)}$, find its reactance $X$ (with sign), say what it acts like, and give the size of that element (in nH for an inductor, in pF for a capacitor).`,
      parts: [
        Object.assign(N('X', X, 'Ω'), { traps: [{ v: Xw, msg: sh ? 'That is the open stub, −Z0 cot βl. Shorted: Z0 tan βl.' : 'That is the shorted stub, Z0 tan βl. Open: −Z0 cot βl.' }, { v: -X, msg: 'Wrong sign.' }] }),
        { lbl: md`It acts like…`, mc: ['an inductor', 'a capacitor'], a: isL ? 0 : 1, why: isL ? [null, md`$X > 0$ is inductive: $j\omega L$.`] : [md`$X < 0$ is capacitive: $1/j\omega C = -j/\omega C$.`, null] },
        Object.assign(N('\\text{element value (nH or pF)}', val, ''), { traps: [{ v: isL ? (X / fq) * 1e9 : 1e12 / (fq * Math.abs(X)), msg: 'That uses f for ω. Use ω = 2πf.' }] }),
      ],
      hints: [md`$\lambda = v/f$, $\beta l = 360°\cdot l/\lambda$.`, md`${sh ? md`$X = Z_0\tan\beta l$` : md`$X = -Z_0\cot\beta l$`}. $X > 0$: $L = X/\omega$. $X < 0$: $C = 1/(\omega|X|)$.`],
      sol: md`
        **Step 1: electrical length.** $\lambda = v/f = ${p(lv)}$ m, so
        $$\beta l = 360°\cdot\frac{${p(l)}}{${p(lv)}} = ${bd}°$$
        **Step 2: the reactance.** ${sh ? md`Shorted: $X = Z_0\tan\beta l = ${Z0}\tan${bd}°$` : md`Open: $X = -Z_0\cot\beta l = -${Z0}\cot${bd}°$`}:
        $$X = ${f(X)}\ \Omega$$
        **Step 3: the element.** $X ${isL ? '> 0' : '< 0'}$: ${isL ? 'an inductor' : 'a capacitor'}. With $\omega = 2\pi f = ${f(w)}$ rad/s,
        $$${isL ? `L = \\frac{X}{\\omega} = ${f(val)}\\ \\text{nH}` : `C = \\frac{1}{\\omega|X|} = ${f(val)}\\ \\text{pF}`}$$
        **Check.** ${bd < 90 ? `βl < 90°: ${sh ? 'a shorted' : 'an open'} stub shorter than λ/4 is ${sh ? 'inductive' : 'capacitive'} ✓.` : `90° < βl < 180°: past the quarter wave ${sh ? 'a shorted' : 'an open'} stub is ${sh ? 'capacitive' : 'inductive'} ✓.`}
      `,
    };
  };

  GENS.w6v_design = () => {
    const shunt = pick([true, false]), passF0 = pick([true, false]);
    const [v, f0] = pick([[2e8, 100e6], [3e8, 150e6], [3e8, 75e6], [2e8, 50e6]]);
    const lam0 = v / f0;
    const shorted = shunt === passF0;           // shunt+pass: shorted; series+pass: open; shunt+block: open; series+block: shorted
    const nextF = passF0 ? 3 * f0 : 4 * f0;      // lowest frequency above 2f0 passed completely
    return {
      title: 'Design a stub filter',
      q: md`A line has $v = ${vtx(v)}$ m/s. Design the shortest **${shunt ? 'shunt' : 'series'}** stub that ${passF0 ? 'passes' : 'blocks'} $${hz(f0)}$ and ${passF0 ? 'blocks' : 'passes'} $${hz(2 * f0)}$. Say whether it is shorted or open, give its length, and the lowest frequency above $${hz(2 * f0)}$ that it passes completely.`,
      parts: [
        { lbl: md`The far end of the stub is…`, mc: ['shorted', 'open'], a: shorted ? 0 : 1, why: shorted ? [null, md`An open $\lambda_0/4$ stub is a short at $f_0$ and an open at $2f_0$: the opposite of what this placement needs.`] : [md`A shorted $\lambda_0/4$ stub is an open at $f_0$ and a short at $2f_0$: the opposite of what this placement needs.`, null] },
        Object.assign(N('l', (lam0 / 4) * 100, 'cm'), { traps: [{ v: (lam0 / 2) * 100, msg: 'That is λ0/2. The quarter wave is what flips between f0 and 2f0.' }] }),
        Object.assign(N('f_{\\text{next}}', nextF / 1e6, 'MHz'), { traps: [{ v: (passF0 ? 4 : 3) * f0 / 1e6, msg: passF0 ? 'That one is blocked: the stub is a whole number of half waves there.' : 'That one is blocked: the stub is an odd number of quarter waves there.' }] }),
      ],
      hints: [md`${shunt ? 'Shunt: open passes, short blocks.' : 'Series: short passes, open blocks.'}`, md`A $\lambda_0/4$ stub is an odd number of quarter waves at $f_0, 3f_0, 5f_0$ and a whole number of half waves at $2f_0, 4f_0$.`],
      sol: md`
        **Step 1: what each frequency needs.** ${shunt ? 'In shunt, an open is invisible and a short kills the load.' : 'In series, a short is invisible and an open breaks the circuit.'} So the stub must be ${(shunt === passF0) ? 'an open' : 'a short'} at $f_0$ and ${(shunt === passF0) ? 'a short' : 'an open'} at $2f_0$.

        **Step 2: the stub.** A $\lambda_0/4$ stub doubles to $\lambda/2$ at $2f_0$. ${shorted ? 'A shorted' : 'An open'} stub is ${shorted ? 'an open at λ/4 and a short at λ/2' : 'a short at λ/4 and an open at λ/2'} ✓. So: **${shorted ? 'shorted' : 'open'}**.

        **Step 3: the length.**
        $$\lambda_0 = \frac{v}{f_0} = ${p(lam0)}\ \text{m},\qquad l = \frac{\lambda_0}{4} = ${p(lam0 * 25)}\ \text{cm}$$
        **Step 4: the next passed frequency.** At $mf_0$ the stub is $m$ quarter waves. It ${passF0 ? 'passes at odd m' : 'passes at even m'}, so above $2f_0$ the next is $${passF0 ? 3 : 4}f_0 = ${hz(nextF)}$.
      `,
    };
  };

  GENS.w6v_tune = () => {
    const sh = pick([true, false]), Z0 = pick([50, 100]), bd = pick([30, 45, 60]), w = pick([1e8, 2e8, 5e8]);
    const X = sh ? Z0 * Math.tan((bd * PI) / 180) : -Z0 / Math.tan((bd * PI) / 180);
    const val = sh ? 1e12 / (w * X) : (Math.abs(X) / w) * 1e9;
    return {
      title: 'Tune a stub into parallel resonance',
      q: md`${sh ? 'A shorted' : 'An open'} $${Z0}\ \Omega$ stub has electrical length $\beta l = ${bd}°$ at $\omega = ${p(w)}$ rad/s. Find its reactance, then the ${sh ? 'capacitor' : 'inductor'} to put **in parallel** with it so that the pair is in parallel resonance at this frequency.`,
      parts: [
        Object.assign(N('X', X, 'Ω'), { traps: [{ v: -X, msg: 'Wrong sign: check tan versus −cot.' }] }),
        Object.assign(N(sh ? 'C' : 'L', val, sh ? 'pF' : 'nH'), { traps: bd === 45 ? [] : [{ v: sh ? 1e12 / (w * Z0) : (Z0 / w) * 1e9, msg: 'That uses |X| = Z0, true only at βl = 45°. Compute X first.' }] }),
      ],
      hints: [md`${sh ? md`$X = Z_0\tan\beta l$` : md`$X = -Z_0\cot\beta l$`}.`, md`Parallel resonance: the admittances cancel, $1/(jX) + ${sh ? 'j\\omega C' : '1/(j\\omega L)'} = 0$.`],
      sol: md`
        **Step 1: the stub.**
        $$X = ${sh ? `${Z0}\\tan${bd}°` : `-${Z0}\\cot${bd}°`} = ${f(X)}\ \Omega$$
        ${sh ? 'Positive: the stub is inductive, so a capacitor can cancel it.' : 'Negative: the stub is capacitive, so an inductor can cancel it.'}

        **Step 2: cancel the admittances.** The stub's admittance is $1/(jX) = -j/X$. ${sh ? md`A capacitor adds $j\omega C$. They cancel when
        $$\omega C = \frac1X$$
        $$C = \frac{1}{\omega X} = \frac{1}{(${p(w)})(${f(X)})} = ${f(val)}\ \text{pF}$$` : md`An inductor adds $1/(j\omega L) = -j/\omega L$. With $X < 0$ the stub gives $+j/|X|$, and they cancel when
        $$\omega L = |X|$$
        $$L = \frac{|X|}{\omega} = \frac{${f(Math.abs(X))}}{${p(w)}} = ${f(val)}\ \text{nH}$$`}
        **Check.** At resonance the pair draws no current: the same as a stub a quarter wave long, which is what the lumped element has "lengthened" this stub into.
      `,
    };
  };

  GENS.w6v_stubckt = () => {
    const F = pick([10, 12, 20]), R0 = pick([50, 60, 100]), Z0 = pick([50, 75, 100]);
    const [v, fq] = pick([[3e8, 150e6], [2e8, 100e6], [3e8, 75e6], [2e8, 50e6]]);
    const lv = v / fq, k = pick([1, 3]), la = (k * lv) / 8, X = (k === 1 ? 1 : -1) * Z0;
    const IR = F / Math.hypot(R0, X);
    return {
      title: 'A shorted line in series with a resistor',
      q: md`A generator $\tilde F = ${F}$ V (phasor), a resistor $R = ${R0}\ \Omega$ and a lossless line **shorted at its far end** ($Z_0 = ${Z0}\ \Omega$, $v = ${vtx(v)}$ m/s) are connected in series, at $f = ${hz(fq)}$. (a) Find $\lambda$. (b) With $l = ${p(la * 100)}$ cm, find $|\tilde I_R|$. (c) Find the shortest $l$ for which $\tilde I_R = 0$. (d) For that $l$, find $|\tilde I|$ at the short. (e) Find the shortest nonzero $l$ that makes $|\tilde I_R|$ as large as possible.`,
      parts: [
        N('\\lambda', lv, 'm'),
        Object.assign(N('|\\tilde I_R|', IR, 'A'), { traps: [{ v: F / (R0 + Z0), msg: 'That adds the reactance as if it were a resistance. Use |R + jX|.' }, { v: F / R0, msg: 'That ignores the stub.' }] }),
        Object.assign(N('l_{\\text{zero}}', lv / 4, 'm'), { traps: [{ v: lv / 2, msg: 'λ/2 makes the stub a short (largest current). Zero current needs an open: λ/4.' }] }),
        Object.assign(N('|\\tilde I(0)|', F / Z0, 'A'), { traps: [{ v: F / R0, msg: 'No current flows through R. The stub current comes from the standing wave: 2|V⁺|/Z0 with |Ṽ(l)| = F̃.' }] }),
        Object.assign(N('l_{\\max}', lv / 2, 'm'), { traps: [{ v: lv / 4, msg: 'λ/4 is an open: zero current.' }] }),
      ],
      hints: [md`$Z(l) = jZ_0\tan\beta l$. The current is $\tilde F/(R + Z(l))$.`, md`Zero current: $Z(l) = \infty$. Then all of $\tilde F$ is across the stub: $j2V^+\sin\beta l = \tilde F$, and $|\tilde I(0)| = 2|V^+|/Z_0$.`],
      sol: md`
        **(a)** $\lambda = v/f = ${p(lv)}$ m.

        **(b)** $l = ${p(la)}$ m $= ${LEN8[k]}$, so $\beta l = ${45 * k}°$ and
        $$Z(l) = j${Z0}\tan${45 * k}° = ${k === 1 ? '' : '-'}j${Z0}\ \Omega$$
        $$|\tilde I_R| = \frac{${F}}{|${R0} ${k === 1 ? '+' : '-'} j${Z0}|} = \frac{${F}}{${f(Math.hypot(R0, Z0))}} = ${f(IR)}\ \text{A}$$
        **(c)** Zero current means the stub is an open: $\tan\beta l \to \infty$, $\beta l = 90°$. The shortest is $l = \lambda/4 = ${p(lv / 4)}$ m.

        **(d)** No current flows, so nothing drops across $R$: $\tilde V(l) = \tilde F$. With $\tilde V(d) = j2V^+\sin\beta d$ and $\sin90° = 1$, $|V^+| = ${p(F / 2)}$ V. At the short,
        $$|\tilde I(0)| = \frac{2|V^+|}{Z_0} = \frac{${F}}{${Z0}} = ${f(F / Z0)}\ \text{A}$$
        **(e)** The largest current needs $Z(l) = 0$, a series resonance: $\beta l = 180°$, $l = \lambda/2 = ${p(lv / 2)}$ m. Then $|\tilde I_R| = \tilde F/R = ${f(F / R0)}$ A.

        **Speed path.** Count eighths: $\lambda/8 \to \pm jZ_0$, $\lambda/4$ open, $\lambda/2$ short. The current at the short at parallel resonance is $\tilde F/Z_0$.

        **Where points go.** Swapping $\lambda/4$ and $\lambda/2$. Adding $Z_0$ to $R$ as a resistance. Saying the stub current is zero because no current enters it.
      `,
    };
  };

  // ---------------------------------------------------------------- Topic 18 question bank
  EM.BANK['w6-stubs'] = [
    Q(md`A series LC below its resonance looks…`, [md`capacitive`, md`inductive`, md`like a short`, md`like an open`], 0,
      [null, md`Below $\omega_0$, $1/\omega C > \omega L$: the capacitor wins.`, md`A short is exactly at $\omega_0$.`, md`An open is the series LC only at $\omega = 0$.`],
      md`$Z_s = j(\omega L - 1/\omega C) < 0$ in its imaginary part below $\omega_0$.`),
    Q(md`A parallel LC above its resonance looks…`, [md`capacitive`, md`inductive`, md`like an open`, md`like a short`], 0,
      [null, md`Above $\omega_0$, $\omega C > 1/\omega L$: $Y$ is positive-imaginary, a capacitor.`, md`An open is exactly at $\omega_0$.`, md`It approaches a short only as $\omega \to \infty$.`],
      md`$Y_p = j(\omega C - 1/\omega L)$.`),
    Q(md`A line open at both ends rings only when its length is…`, [md`a whole number of half wavelengths`, md`an odd number of quarter wavelengths`, md`a whole number of wavelengths only`, md`any length`], 0,
      [null, md`Odd quarter waves are for mixed ends.`, md`Half waves already fit; whole waves are only the even modes.`, md`The current must vanish at both ends, which picks the lengths.`],
      md`$\sin\beta l = 0$: $l = n\lambda/2$.`),
    Q(md`The lowest resonance of an open-short line has $l$ equal to…`, [md`$\lambda/4$`, md`$\lambda/2$`, md`$\lambda$`, md`$\lambda/8$`], 0,
      [null, md`That is the lowest for matching ends.`, md`That is two half waves.`, md`The voltage must go from its peak to zero: a quarter wave.`],
      md`$\cos\beta l = 0$ first at $\beta l = \pi/2$.`),
    Q(md`On an open-open line at resonance, the voltage at the ends is…`, [md`at its largest`, md`zero`, md`half its largest`, md`equal to the current times $Z_0$`], 0,
      [null, md`Zero voltage is at a short.`, md`$\cos\beta z = \pm1$ at the ends.`, md`The current is zero there; no ratio applies.`],
      md`$\tilde V = 2V^+\cos\beta z$ is $\pm2V^+$ at $z = 0$ and $z = l$.`),
    Q(md`A $30$ m air line shorted at both ends has its lowest resonance at…`, [md`$5$ MHz`, md`$2.5$ MHz`, md`$10$ MHz`, md`$15$ MHz`], 0,
      [null, md`That is $c/4l$, for mixed ends.`, md`That is $c/l$.`, md`That is $c/2l$ with $l$ halved.`],
      md`$c/2l = 3\times10^8/60 = 5$ MHz.`),
    Q(md`A shorted stub $\lambda/2$ long looks at its input like…`, [md`a short`, md`an open`, md`an inductor`, md`a capacitor`], 0,
      [null, md`An open is at odd quarter waves.`, md`$\tan180° = 0$.`, md`$\tan180° = 0$.`],
      md`$Z = jZ_0\tan\pi = 0$: half a wave repeats the short.`),
    Q(md`An open stub $\lambda/4$ long looks like…`, [md`a short`, md`an open`, md`a capacitor`, md`$Z_0$`], 0,
      [null, md`It is an open only every $\lambda/2$.`, md`$\cot90° = 0$, so the reactance is zero.`, md`A stub is purely reactive.`],
      md`$Z = -jZ_0\cot90° = 0$.`),
    Q(md`A shorted stub $\lambda/4$ long looks like…`, [md`an open`, md`a short`, md`an inductor`, md`a resistor`], 0,
      [null, md`That is $\lambda/2$.`, md`$\tan90°$ is infinite.`, md`No resistance in a lossless stub.`],
      md`$\tan\beta l \to \infty$: parallel resonance.`),
    Q(md`A shorted stub much shorter than a wavelength acts like…`, [md`an inductor`, md`a capacitor`, md`an open`, md`a resistor`], 0,
      [null, md`That is the short open stub.`, md`Short and nearly zero length: a wire, a small inductance.`, md`No resistance.`],
      md`$jZ_0\tan\beta l \approx j\omega(Ll)$.`),
    Q(md`A shorted stub of the right length can supply…`, [md`any reactance, but never a resistance`, md`only inductance`, md`only capacitance`, md`any impedance, including resistance`], 0,
      [null, md`Past $\lambda/4$ it is capacitive.`, md`Below $\lambda/4$ it is inductive.`, md`A lossless line cannot absorb power.`],
      md`$X = Z_0\tan\beta l$ covers $-\infty$ to $\infty$ within $\lambda/2$.`),
    Q(md`"Series resonance" of a stub means…`, [md`$Z = 0$`, md`$Z = \infty$`, md`$Z = Z_0$`, md`$X > 0$`], 0,
      [null, md`That is parallel resonance.`, md`$Z_0$ is a match, not a resonance.`, md`That is just inductive.`],
      md`Like a series LC at $\omega_0$: a short.`),
    Q(md`"Parallel resonance" of a stub means…`, [md`$Y = 0$: the stub draws no current`, md`$Z = 0$`, md`$Y = Y_0$`, md`$X < 0$`], 0,
      [null, md`That is series resonance.`, md`That is a match.`, md`That is just capacitive.`],
      md`Like a parallel LC at $\omega_0$: an open.`),
    Q(md`As the frequency rises from zero, an **open** stub first reaches…`, [md`a series resonance, at $v/4l$`, md`a parallel resonance, at $v/4l$`, md`a series resonance, at $v/2l$`, md`a parallel resonance, at $v/2l$`], 0,
      [null, md`At $v/4l$ the open stub is a short.`, md`At $v/2l$ it is an open again.`, md`That is the second one.`],
      md`At DC it is an open; at a quarter wave it becomes a short first.`),
    Q(md`A shorted $75\ \Omega$ stub is $\lambda/8$ long. Its impedance is…`, [md`$j75\ \Omega$`, md`$-j75\ \Omega$`, md`$75\ \Omega$`, md`$j37.5\ \Omega$`], 0,
      [null, md`That is the open stub.`, md`No resistance.`, md`$\tan45° = 1$, not $\tfrac12$.`],
      md`$jZ_0\tan45° = j75\ \Omega$.`),
    Q(md`Doubling the frequency on a shorted stub that was $\lambda/8$ long makes it…`, [md`an open`, md`a short`, md`capacitive`, md`unchanged`], 0,
      [null, md`A short needs $\lambda/2$; doubling $\lambda/8$ gives $\lambda/4$.`, md`It lands exactly on $\lambda/4$.`, md`$\beta l$ doubles with $f$.`],
      md`$\beta l$ goes from $45°$ to $90°$.`),
    Q(md`At a stub's parallel resonance, the current at its shorted end is…`, [md`not zero: a standing wave rings inside`, md`zero, since none enters`, md`infinite`, md`equal to the input current`], 0,
      [null, md`The input current is zero, but $\tilde I(d) = (2V^+/Z_0)\cos\beta d$ is largest at the short.`, md`A lossless line at resonance holds a finite standing wave when driven by a finite voltage.`, md`The input current is zero; the current at the short is not.`],
      md`Energy sloshes inside the stub, as in a parallel LC.`),
    Q(md`An inductor is put in series with a stub at its **series** resonance. The resonance…`, [md`moves: the total is now $j\omega L$`, md`stays: nothing changes`, md`becomes a parallel resonance`, md`disappears completely at every frequency`], 0,
      [null, md`A series element adds to $Z = 0$, giving $j\omega L$: it shifts where the total is zero.`, md`It shifts to where $jX_{\text{stub}} + j\omega L = 0$.`, md`It still has series resonances, just shifted.`],
      md`Series elements move series resonances; they cannot move parallel ones.`),
    Q(md`A shunt shorted stub is $\lambda_0/4$ at $f_0$. Which frequencies does it block?`, [md`DC, $2f_0$, $4f_0$, …`, md`$f_0$, $3f_0$, $5f_0$, …`, md`only $2f_0$`, md`none`], 0,
      [null, md`At odd multiples it is an open: invisible.`, md`Every even multiple makes it a whole number of half waves: a short.`, md`At even multiples it shorts the load.`],
      md`At $mf_0$ it is $m$ quarter waves: a short when $m$ is even.`),
    Q(md`A series open stub, $\lambda_0/4$ long, at $f_0$ is…`, [md`a short, so it is invisible`, md`an open, so it blocks`, md`inductive`, md`capacitive`], 0,
      [null, md`An open stub is a short at odd quarter waves.`, md`$\cot90° = 0$.`, md`$\cot90° = 0$.`],
      md`So a series open $\lambda_0/4$ stub passes $f_0$.`),
    Q(md`Why can no open shunt stub pass $f_0$ and block $2f_0$?`, [md`It would need to be a multiple of $\lambda_0/2$ and an odd multiple of $\lambda_0/8$ at once`, md`Open stubs cannot be shorts`, md`Open stubs radiate`, md`It can: any $\lambda_0/4$ stub works`], 0,
      [null, md`At odd quarter waves an open stub is a short.`, md`Lossless lines here do not radiate.`, md`An open $\lambda_0/4$ stub is a short at $f_0$: it blocks it.`],
      md`Open at $f_0$: $l = n\lambda_0/2$. Short at $2f_0$: $l = (2m + 1)\lambda_0/8$. No length is both.`),
    Q(md`The voltage on an open-short line at its lowest resonance is zero…`, [md`only at the short`, md`at both ends`, md`in the middle`, md`nowhere`], 0,
      [null, md`At the open the voltage is largest.`, md`The line is only a quarter wave long; the first zero is at the short.`, md`A short forces it to zero.`],
      md`$\tilde V \propto \cos\beta z$, zero at $\beta z = \pi/2$, which is $z = l$.`),
  ];
})();

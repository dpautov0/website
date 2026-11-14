/* Topics 1 and 2 (Lectures 21-22): phasors, then Maxwell's equations in phasor form.
   w1-phasor: why one frequency makes a linear system simple, the rotating arrow, cosine to phasor and back, a sine is a
   late cosine, adding sinusoids (derived), d/dt -> j omega (derived), a traveling wave and its e^{-j beta z}, vector
   phasors with a different phase per component, the average of a product = (1/2) Re{A B*} (derived), traps.
   w1-maxwell: the four laws with d/dt -> j omega, the Helmholtz equation and beta = omega sqrt(mu eps), plane waves in
   phasor form, H from E through Faraday's law (the curl component by component), checking a given field is a valid wave,
   reading omega, beta, lambda, direction and polarization pieces from a phasor, and back to the time domain.
   Generator prefix: w1p (rapid fire rf_w1p_*, problems w1p_*). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- helpers
  const DEG = Math.PI / 180;
  const AX = ['x', 'y', 'z'];
  const r1 = (x) => Math.round(x * 10) / 10;
  // an angle in degrees, folded into (-180, 180]
  const wrap = (d) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return r1(x); };
  const dg = (d) => `${r1(d)}°`;
  // e^{j d°}, or nothing for d = 0
  const ex = (d) => (Math.abs(d) < 1e-9 ? '' : `e^{${d < 0 ? '-' : ''}j${r1(Math.abs(d))}°}`);
  const pol = (A, d) => `${String(A) === "1" && ex(d) ? "" : A}${ex(d)}`;   // a size of 1 is not written in front of an exponential
  // a phase inside a cosine: " + 30°", " - 45°", or nothing
  const phs = (d) => (Math.abs(d) < 1e-9 ? '' : d > 0 ? ` + ${r1(d)}°` : ` - ${r1(-d)}°`);
  const co = (s) => (s === '1' ? '' : s);           // a coefficient of 1 is not written
  const nf = (x) => `$${p(+x.toFixed(3))}$`;        // a short number as an option

  // ---------------------------------------------------------------- figures (lesson 1)
  // the four arrows: cos, sin, -cos, -sin at t = 0
  function compassFig() {
    const g = PF.fig({ alt: 'the complex plane with four arrows from the origin: right for cos (phasor 1), down for sin (phasor minus j), left for minus cos (phasor minus 1), up for minus sin (phasor plus j)' });
    const cx = 170, cy = 112, L = 72;
    g.line(cx - L - 34, cy, cx + L + 34, cy, { cls: 'dim' });
    g.line(cx, cy + L + 24, cx, cy - L - 24, { cls: 'dim' });
    g.label(cx + L + 38, cy, '\\text{Re}', 'l', 'small');
    g.label(cx + 8, cy - L - 24, '\\text{Im}', 'l', 'small');
    g.arrow(cx, cy, cx + L, cy, { cls: 'thick', hs: 9 });
    g.arrow(cx, cy, cx, cy + L, { cls: 'thick', hs: 9 });
    g.arrow(cx, cy, cx - L, cy, { hs: 8 });
    g.arrow(cx, cy, cx, cy - L, { hs: 8 });
    g.label(cx + L / 2 + 4, cy - 8, '\\cos\\to 1', 'b', 'small');
    g.label(cx + 10, cy + L - 4, '\\sin\\to -j', 'l', 'small');
    g.label(cx - L / 2 - 4, cy - 8, '-\\cos\\to -1', 'b', 'small');
    g.label(cx + 10, cy - L + 14, '-\\sin\\to +j', 'l', 'small');
    return g.svg();
  }
  // 3 + (-4j), tip to tail
  function sumFig() {
    const g = PF.fig({ alt: 'adding the phasors 3 and minus 4j tip to tail: 3 to the right, then 4 down; the sum 3 minus 4j has length 5, at minus 53.1 degrees' });
    const ox = 44, oy = 34, s = 34;
    g.line(ox - 18, oy, ox + 3 * s + 60, oy, { cls: 'dim' });
    g.line(ox, oy + 4 * s + 22, ox, oy - 20, { cls: 'dim' });
    g.label(ox + 3 * s + 64, oy, '\\text{Re}', 'l', 'small');
    g.label(ox + 6, oy - 20, '\\text{Im}', 'l', 'small');
    g.arrow(ox, oy, ox + 3 * s, oy, { hs: 8 });
    g.arrow(ox + 3 * s, oy, ox + 3 * s, oy + 4 * s, { hs: 8 });
    g.arrow(ox, oy, ox + 3 * s, oy + 4 * s, { cls: 'thick', hs: 9 });
    g.label(ox + 1.5 * s + 14, oy - 6, '3', 'b');
    g.label(ox + 3 * s + 8, oy + 2 * s, '-4j', 'l');
    g.label(ox + 1.5 * s - 8, oy + 2 * s + 8, '5', 'tr');
    g.angle(ox, oy, 44, -53.1, 0, '53.1°');
    return g.svg();
  }
  // the phasor e^{-j beta z} drawn at nine points along z
  function zArrowsFig() {
    const g = PF.fig({ alt: 'the phasor of a wave traveling toward plus z, drawn as a small arrow at z = 0, one eighth wavelength, and so on up to one wavelength; each arrow is turned 45 degrees clockwise from the one before, and after one wavelength it points the same way again' });
    // a row of small "clocks": each circle is the complex plane at that z, and the arrow is the phasor there
    const x0 = 34, y0 = 40, dx = 44, r = 17, ya = y0 + r + 12;
    g.line(x0 - 20, ya, x0 + 8 * dx + 24, ya, { cls: 'dim' });
    g.label(x0 + 8 * dx + 28, ya, 'z', 'l', 'small');
    for (let k = 0; k <= 8; k++) {
      const th = -k * 45 * DEG, x = x0 + k * dx;
      g.circle(x, y0, r, { cls: 'dim thin' });
      g.dot(x, y0, 1.8);
      g.arrow(x, y0, x + (r - 1) * Math.cos(th), y0 - (r - 1) * Math.sin(th), { cls: 'thick', hs: 6 });
      g.line(x, ya - 3, x, ya + 3, { cls: 'dim' });
    }
    [['0', 0], ['\\lambda/4', 2], ['\\lambda/2', 4], ['3\\lambda/4', 6], ['\\lambda', 8]].forEach(([t, k]) => g.label(x0 + k * dx, ya + 8, t, 't', 'small'));
    return g.svg();
  }
  // a(t), b(t) 60 degrees apart, their product, and its average
  const avgFig = () => PF.plot({
    w: 400, h: 210, x: [0, 4 * Math.PI], y: [-1.15, 1.25], zero: true, xl: '\\omega t',
    xt: [[Math.PI, '\\pi'], [2 * Math.PI, '2\\pi'], [3 * Math.PI, '3\\pi'], [4 * Math.PI, '4\\pi']], yt: [[1, '1'], [0.25, '\\tfrac14']],
    curves: [
      { f: (t) => Math.cos(t), cls: 'dim thin' },
      { f: (t) => Math.cos(t - Math.PI / 3), cls: 'dim dash' },
      { f: (t) => Math.cos(t) * Math.cos(t - Math.PI / 3), n: 400 },
    ],
    hlines: [[0.25, '']],
  });

  // ================================================================ lesson 1
  EM.lesson('w1', {
    id: 'w1-phasor', topic: 1, ref: 'Lecture 21', title: 'Phasors: a cosine as an arrow',
    steps: [
      R(md`
        !!key Why you care
          Every Exam 3 problem with one frequency in it is written in phasors. Prof. Chen's Spring 2024 Problem 1 asks for the field phasors of two current sheets in all three regions, and gives 2 of its 18 points just for simplifying $e^{j\theta} - e^{-j\theta}$. Fall 2023 #6 hands you $\Et = \hat x\,5e^{-0.2z}e^{-j0.2z}$ and asks for the power. Spring 2017 #4 and Summer 2019 #1 ask you to turn a field made of a cosine and a sine into $\Et$ and $\Ht$. HW 8 #4 drills exactly that conversion. Each of these takes a few minutes if phasors are automatic, and a page of trigonometry if they are not. This lesson builds them from nothing.

        ### Notation

        - $\omega$: the angular frequency, in rad/s. $\omega = 2\pi f$, and the period is $T = 2\pi/\omega = 1/f$.
        - $j$: the imaginary unit, $j^2 = -1$. Engineers write $j$ because $i$ is current. If complex numbers are rusty, do [complex numbers from zero](#/l/e3-complex) first.
        - $e^{j\theta} = \cos\theta + j\sin\theta$: **Euler's formula**. A complex number of size 1 at angle $\theta$.
        - $\Re\{z\}$, $\Im\{z\}$: the real part and the imaginary part of $z$.
        - $z^*$: the **complex conjugate**. It flips the sign of the imaginary part, which flips the angle: $(Ae^{j\theta})^* = Ae^{-j\theta}$.
        - $\tilde A$ (a tilde): the **phasor** of the real signal $a(t)$. A complex number with no $t$ in it. $\Et$ is the phasor of $\mathbf E$.
        - $\langle\cdots\rangle$: the average over one period $T$.

        ### 1. Why one frequency makes everything simple

        Suppose the source of a problem (a current sheet, a generator) is a cosine at one frequency, $\cos\omega t$. Maxwell's equations in an ordinary material are **linear**. They only do three things to fields: add them, multiply them by constants, and take derivatives. What does each of those do to a cosine?

        Multiplying by a constant changes its size. It is still a cosine at $\omega$.

        Differentiating with the chain rule gives
        $$\frac{d}{dt}\cos\omega t = -\omega\sin\omega t$$
        Section 4 shows that $-\sin x = \cos(x + 90°)$. So
        $$-\omega\sin\omega t = \omega\cos(\omega t + 90°)$$
        Still a cosine at $\omega$. Its size changed (times $\omega$) and its starting angle changed ($+90°$).

        Adding two cosines at the same $\omega$: Section 5 shows the result is again one cosine at $\omega$.

        So nothing in a linear system can create a new frequency. Every field, current and voltage, at every point, has the form
        $$a(t) = A\cos(\omega t + \phi)$$
        with the same $\omega$. Only two numbers change from one quantity to the next:

        - the **amplitude** $A$ (how big; we always take $A \ge 0$),
        - the **phase** $\phi$ (when it peaks: a larger $\phi$ means an earlier peak).

        A phasor is a way to carry exactly those two numbers and nothing else.

        !!intuition Does this make sense?
          Hum one note in a stairwell. The echoes come back louder or softer, earlier or later, but always at the pitch you hummed. A linear system can change the size and the timing of a sinusoid, never its frequency.
      `),
      Q(md`**Predict.** A linear medium is driven by $\cos\omega t$ and has settled into its steady state. Which signal can appear somewhere in it?`,
        [md`$7\cos(\omega t + 40°)$`, md`$\cos2\omega t$`, md`$3 + \cos\omega t$`, md`$\cos\omega t\,\cos3\omega t$`], 0,
        [null, md`A new frequency needs a product of signals, as in $\cos^2\omega t = \tfrac12 + \tfrac12\cos2\omega t$. Adding, scaling and differentiating never multiply two signals together.`, md`The constant 3 is a frequency of zero. A cosine has no constant part, and adding, scaling or differentiating cosines cannot create one.`, md`That is a product of two signals. It contains $2\omega$ and $4\omega$, which a linear system cannot make from $\omega$.`],
        md`Scaling changes the size (here to 7), and a derivative or a delay changes the phase (here $40°$). The frequency stays locked at $\omega$.`),
      Q(md`**Predict.** $a(t) = 3\cos(\omega t + 20°)$. Then $da/dt$ is…`,
        [md`$3\omega\cos(\omega t + 110°)$`, md`$3\omega\cos(\omega t - 70°)$`, md`$3\cos(\omega t + 110°)$`, md`$3\omega\cos(\omega t + 20°)$`], 0,
        [null, md`That is $+3\omega\sin(\omega t + 20°)$. The derivative of a cosine is **minus** a sine, and $-\sin x = \cos(x + 90°)$: the phase goes up.`, md`That leaves out the factor $\omega$ that the chain rule brings down.`, md`A derivative turns a cosine into a sine, so the phase must move by $90°$.`],
        md`$\frac{d}{dt}3\cos(\omega t + 20°) = -3\omega\sin(\omega t + 20°)$. With $-\sin x = \cos(x + 90°)$ this is $3\omega\cos(\omega t + 110°)$.`),
      R(md`
        ### 2. The rotating arrow

        Start from Euler's formula:
        $$e^{j\theta} = \cos\theta + j\sin\theta$$
        Draw the complex plane: real part across, imaginary part up. Then $e^{j\theta}$ is the point at angle $\theta$ on the circle of radius 1, measured counterclockwise from the right. Its real part, its "shadow" on the horizontal axis, is $\cos\theta$.

        Now let the angle grow with time, $\theta = \omega t + \phi$, and stretch the arrow to length $A$:
        $$Ae^{j(\omega t + \phi)} = A\cos(\omega t + \phi) + jA\sin(\omega t + \phi)$$
        This arrow spins counterclockwise, one full turn every period $T$. Its real part is our signal:
        $$\Re\{Ae^{j(\omega t + \phi)}\} = A\cos(\omega t + \phi)$$
        Split the exponential into a factor that does not depend on time and a factor that does. Exponents add, so
        $$Ae^{j(\omega t + \phi)} = Ae^{j\phi}\cdot e^{j\omega t}$$
        The factor $e^{j\omega t}$ is the spin. It is **the same for every quantity in the problem**, so it carries no information about any one of them. The fixed factor is the **phasor**:
        $$\boxed{\tilde A = Ae^{j\phi}}$$
        And the rule that takes you back to the signal is
        $$\boxed{a(t) = \Re\{\tilde A\,e^{j\omega t}\}}$$
        In words: **the phasor is the arrow frozen at $t = 0$.** Its length is the amplitude, and its angle is the phase.

        !!intuition Does this make sense?
          Put $t = 0$ in the rule: $a(0) = \Re\{\tilde A\}$. So the real part of a phasor is the value of the signal at $t = 0$. Check it: $a(t) = A\cos(\omega t + \phi)$ gives $a(0) = A\cos\phi$, and $\Re\{Ae^{j\phi}\} = A\cos\phi$ ✓.

        Watch it. Change the length and the starting angle, and see the shadow trace out the cosine.
      `),
      W3.phasor(),
      Q(md`**Predict.** A signal has the phasor $4e^{j60°}$. What is its value at $t = 0$?`,
        ['2', '4', '3.46', md`$4\cos(\omega t + 60°)$`], 0,
        [null, md`4 is the peak. At $t = 0$ the arrow points at $60°$, so its shadow is shorter than the arrow.`, md`$4\sin60° = 3.46$ is the imaginary part: the arrow's height, not its shadow.`, md`That is the whole signal $a(t)$. At $t = 0$ it is one number, $4\cos60°$.`],
        md`$a(0) = \Re\{4e^{j60°}\} = 4\cos60° = 2$.`),
      R(md`
        ### 3. From a cosine to a phasor, and back

        **Forward.** Write the signal as $A\cos(\omega t + \phi)$ with $A > 0$. Its phasor is $Ae^{j\phi}$. For example:
        $$5\cos(\omega t + 30°)\ \longrightarrow\ 5e^{j30°}$$
        $$2\cos(\omega t - 45°)\ \longrightarrow\ 2e^{-j45°}$$
        A minus sign in front is a half turn, because $-1 = e^{j180°}$:
        $$-3\cos\omega t\ \longrightarrow\ -3 = 3e^{j180°}$$

        **Backward, from polar form.** $Ae^{j\phi}$ gives $A\cos(\omega t + \phi)$. Read the length and the angle straight off.

        **Backward, from rectangular form.** If the phasor is given as $\tilde A = a + jb$, first find its size and angle:
        $$|\tilde A| = \sqrt{a^2 + b^2}$$
        For the angle, **sketch the point $(a, b)$** and read the angle from the sketch. A calculator's $\tan^{-1}(b/a)$ cannot tell $(1, 1)$ from $(-1, -1)$; the sketch can.

        Example: $\tilde A = 2 - 2j$. The point is 2 to the right and 2 down. Its size is
        $$|\tilde A| = \sqrt{4 + 4} = 2\sqrt2$$
        and its angle is $45°$ below the real axis, $\phi = -45°$. So
        $$a(t) = 2\sqrt2\cos(\omega t - 45°)$$

        **A second way back, with no polar form.** Multiply the phasor by $e^{j\omega t} = \cos\omega t + j\sin\omega t$:
        $$(a + jb)(\cos\omega t + j\sin\omega t)$$
        Only two of the four products are real: $a\cos\omega t$, and $jb\cdot j\sin\omega t = -b\sin\omega t$. So
        $$\Re\{(a + jb)e^{j\omega t}\} = a\cos\omega t - b\sin\omega t$$
        For $2 - 2j$, that is $2\cos\omega t + 2\sin\omega t$: the same signal, written as two pieces.

        !!intuition Does this make sense?
          Compare the two answers at $t = 0$: $2\sqrt2\cos(-45°) = 2$, and $2\cos0 + 2\sin0 = 2$ ✓. At $\omega t = 90°$: $2\sqrt2\cos45° = 2$, and $0 + 2 = 2$ ✓.
      `),
      Q(md`**Predict.** A phasor is $\tilde A = -1 + j\sqrt3$. The signal is…`,
        [md`$2\cos(\omega t + 120°)$`, md`$2\cos(\omega t - 60°)$`, md`$2\cos(\omega t + 60°)$`, md`$4\cos(\omega t + 120°)$`], 0,
        [null, md`That is what $\tan^{-1}(\sqrt3/(-1))$ gives on a calculator: the wrong quadrant. The point is 1 to the left and $\sqrt3$ up, in the second quadrant.`, md`That is the angle of $1 + j\sqrt3$. Here the real part is negative.`, md`$1 + 3 = 4$ is the size squared. Take the square root: 2.`],
        md`Sketch: 1 to the left, $\sqrt3$ up. Size $\sqrt{1 + 3} = 2$. The triangle makes $60°$ with the **negative** real axis, so the angle is $180° - 60° = 120°$. Check at $t = 0$: $2\cos120° = -1 = \Re\{\tilde A\}$ ✓.`),
      RF(md`
        ### 4. A sine is a late cosine

        Phasors are defined with cosines, so a sine has to be rewritten first. Use the identity $\cos(x - y) = \cos x\cos y + \sin x\sin y$ with $y = 90°$. Since $\cos90° = 0$ and $\sin90° = 1$:
        $$\cos(x - 90°) = \sin x$$
        Turn it around:
        $$\boxed{\sin x = \cos(x - 90°)}$$
        A sine is a cosine that peaks a quarter period **later**. So its phasor has an extra $-90°$:
        $$\sin(\omega t + \phi)\ \longrightarrow\ e^{j(\phi - 90°)} = e^{j\phi}\,e^{-j90°}$$
        And $e^{-j90°} = \cos90° - j\sin90° = -j$. So:
        $$\sin(\omega t + \phi)\ \longrightarrow\ -j\,e^{j\phi}$$
        The same identity with $y = -90°$ gives $\cos(x + 90°) = -\sin x$, the fact used in Section 1. Here are the four cases to know by heart:

        | Signal | Phasor | Arrow at $t = 0$ |
        |---|---|---|
        | $\cos\omega t$ | $1$ | right |
        | $\sin\omega t$ | $-j$ | down |
        | $-\cos\omega t$ | $-1$ | left |
        | $-\sin\omega t$ | $+j$ | up |

        [[fig:compass]]

        !!intuition Does this make sense?
          The arrow spins counterclockwise. Start it pointing down ($-j$). A quarter turn later it points right, so its shadow is at its maximum. And $\sin\omega t$ does peak at $\omega t = 90°$, a quarter period in ✓. Start it pointing up ($+j$): a quarter turn later it points left, a minimum. That is $-\sin\omega t$ ✓.
      `, { compass: { svg: compassFig(), cap: md`The four arrows at $t = 0$. Each one spins counterclockwise; its shadow on the real axis is the signal.` } }),
      Q(md`**Predict.** The phasor of $6\sin(\omega t + 30°)$ is…`,
        [md`$6e^{-j60°}$`, md`$6e^{j120°}$`, md`$6e^{j30°}$`, md`$6e^{-j30°}$`], 0,
        [null, md`That adds $90°$, as if a sine were $+j$. A sine is a **late** cosine: subtract $90°$.`, md`That treats the sine as a cosine. Rewrite it first: $\sin x = \cos(x - 90°)$.`, md`That flips the sign of the $30°$ and forgets that it is a sine.`],
        md`$6\sin(\omega t + 30°) = 6\cos(\omega t + 30° - 90°) = 6\cos(\omega t - 60°)$. The phasor is $6e^{-j60°}$, which is also $-j\cdot6e^{j30°}$.`),
      RF(md`
        ### 5. Adding sinusoids: add the arrows

        Take two signals at the same frequency, with phasors $\tilde A$ and $\tilde B$:
        $$a(t) = \Re\{\tilde Ae^{j\omega t}\}, \qquad b(t) = \Re\{\tilde Be^{j\omega t}\}$$
        Add them. The real part of a sum is the sum of the real parts, so the two $\Re$ can be merged into one:
        $$a + b = \Re\{\tilde Ae^{j\omega t} + \tilde Be^{j\omega t}\}$$
        Factor out the common spin:
        $$a + b = \Re\{(\tilde A + \tilde B)\,e^{j\omega t}\}$$
        This has exactly the form of the definition in Section 2, with $\tilde A + \tilde B$ as the phasor. So
        $$\boxed{\text{phasor of }(a + b) = \tilde A + \tilde B}$$
        Adding two sinusoids is adding two complex numbers. And the answer is one sinusoid at $\omega$, as Section 1 promised.

        **Example.** $3\cos\omega t + 4\sin\omega t$. From the table, the phasors are $3$ and $-4j$. Add them:
        $$\tilde A + \tilde B = 3 - 4j$$

        [[fig:sum]]

        The 3-4-5 triangle gives the size and the angle:
        $$|3 - 4j| = 5, \qquad \phi = -\tan^{-1}\tfrac43 = -53.1°$$
        So
        $$3\cos\omega t + 4\sin\omega t = 5\cos(\omega t - 53.1°)$$

        !!intuition Does this make sense?
          The peak is 5, less than $3 + 4 = 7$, because the two pieces never peak at the same time: they are $90°$ apart. At $t = 0$ the left side is 3, and the right side is $5\cos53.1° = 5(0.6) = 3$ ✓.

        The trick works only for **one frequency**. In $\cos\omega t + \cos2\omega t$ the two arrows spin at different rates, and no single frozen arrow describes the sum.
      `, { sum: { svg: sumFig(), cap: md`Adding phasors tip to tail: $3$, then $-4j$. The sum has length 5 and points 53.1° below the real axis.` } }),
      Q(md`**Predict.** $2\cos(\omega t + 60°) + 2\cos(\omega t - 60°)$ equals…`,
        [md`$2\cos\omega t$`, md`$4\cos\omega t$`, md`$0$`, md`$2\sqrt3\cos\omega t$`], 0,
        [null, md`That adds the peaks. The two signals are $120°$ apart, so they partly cancel.`, md`Only arrows pointing in opposite directions cancel completely. These two are $120°$ apart, not $180°$.`, md`That uses $\sin60°$ for the real parts. The imaginary parts cancel, and each real part is $2\cos60° = 1$.`],
        md`Phasors: $2e^{j60°} + 2e^{-j60°}$. The imaginary parts $\pm2\sin60°$ cancel, and the real parts give $2(2\cos60°) = 2$. So the sum is $2\cos\omega t$.`),
      R(md`
        ### 6. A time derivative is multiplication by jω

        Differentiate $a(t) = \Re\{\tilde Ae^{j\omega t}\}$. Taking the real part and taking $d/dt$ can be done in either order, because $t$ is a real variable: the derivative of the real part is the real part of the derivative. The phasor $\tilde A$ is a constant. So only $e^{j\omega t}$ is differentiated:
        $$\frac{da}{dt} = \Re\Bigl\{\tilde A\,\frac{d}{dt}e^{j\omega t}\Bigr\}$$
        The chain rule brings down $j\omega$:
        $$\frac{d}{dt}e^{j\omega t} = j\omega\,e^{j\omega t}$$
        Put it back:
        $$\frac{da}{dt} = \Re\{(j\omega\tilde A)\,e^{j\omega t}\}$$
        Read off what multiplies $e^{j\omega t}$. The phasor of $da/dt$ is $j\omega\tilde A$:
        $$\boxed{\frac{d}{dt}\ \longrightarrow\ \times\,j\omega}$$
        In polar form $j = e^{j90°}$. So multiplying by $j\omega$ makes the arrow $\omega$ times longer and turns it $90°$ counterclockwise: **a derivative leads by $90°$.**

        **Check with $\cos\omega t$**, whose phasor is 1. The rule gives $j\omega$. Back to time with the table of Section 4 ($+j \to -\sin$): $j\omega \to -\omega\sin\omega t$. Directly, $\frac{d}{dt}\cos\omega t = -\omega\sin\omega t$ ✓.

        Two more rules come for free:

        - A second derivative multiplies by $(j\omega)^2 = -\omega^2$.
        - An integral (with no constant part) divides by $j\omega$: the arrow shrinks by $\omega$ and turns $90°$ back. **An integral lags by $90°$.**

        This is the rule that turns Maxwell's equations from differential equations in time into algebra. [Topic 2](#/l/w1-maxwell) does that.

        !!intuition Does this make sense?
          Units: $d/dt$ brings a 1/s, and so does $\omega$ ✓. A faster signal changes faster, so its derivative is bigger: the factor $\omega$ says exactly that.
      `),
      Q(md`**Predict.** $E = 10\cos(\omega t - 30°)$ V/m at a point. The phase of $\partial E/\partial t$ is…`,
        [md`$60°$`, md`$-120°$`, md`$-30°$`, md`$30°$`], 0,
        [null, md`That subtracts $90°$, which is what an integral does. A derivative multiplies by $j$, which adds $90°$.`, md`A derivative always moves the phase: its phasor is $j\omega$ times the original.`, md`That flips the sign of the original phase and does not shift it.`],
        md`The phasor of $\partial E/\partial t$ is $j\omega\cdot10e^{-j30°} = 10\omega\,e^{j(90° - 30°)} = 10\omega\,e^{j60°}$. Its phase is $60°$.`),
      RF(md`
        ### 7. A traveling wave: the phase depends on position

        Take a wave traveling toward $+z$:
        $$E_x(z,t) = E_0\cos(\omega t - \beta z + \phi)$$
        Stand still at one point $z$. There, $E_x$ is a cosine in time with amplitude $E_0$ and phase $\phi - \beta z$ (with $\beta z$ in radians). So its phasor at that point is
        $$\tilde E_x = E_0e^{j(\phi - \beta z)}$$
        Split the exponent into two factors:
        $$\boxed{\tilde E_x(z) = E_0e^{j\phi}\,e^{-j\beta z}}$$
        The phasor has no $t$ in it, but it does depend on $z$: it is one complex number at each point. $E_0e^{j\phi}$ is the phasor at $z = 0$, and the factor $e^{-j\beta z}$ turns it clockwise by $\beta z$ as you move out.

        [[fig:zarrows]]

        **Why the phase falls with distance.** The wave reaches a farther point later. A later peak is a more negative phase. After one wavelength $\lambda = 2\pi/\beta$ the arrow has turned a full circle, and the pattern repeats.

        **The other direction.** A wave toward $-z$ has $\cos(\omega t + \beta z + \phi)$, and the same steps give
        $$E_0\cos(\omega t + \beta z + \phi)\ \longrightarrow\ E_0e^{j\phi}\,e^{+j\beta z}$$
        The rule: **the sign in the exponent copies the sign of $\beta z$ in the cosine.** Read the direction from the phasor: $e^{-j\beta z}$ travels toward $+z$, and $e^{+j\beta z}$ toward $-z$.

        **With loss.** A decaying wave $E_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)$ has a real, positive factor $e^{-\alpha z}$ in front. A real positive factor is part of the amplitude, so it goes straight into the phasor:
        $$\tilde E_x(z) = E_0e^{j\phi}\,e^{-\alpha z}e^{-j\beta z}$$
        The two exponentials combine:
        $$\tilde E_x(z) = E_0e^{j\phi}\,e^{-(\alpha + j\beta)z}$$
        With $\gamma = \alpha + j\beta$ this is $E_0e^{j\phi}e^{-\gamma z}$, the line on your formula sheet. [Topic 5](#/l/w2-gamma) derives $\gamma$.

        !!intuition Does this make sense?
          Follow a crest of $\cos(\omega t - \beta z)$: its argument stays at 0, so $z = \omega t/\beta$, which grows with $t$. The crest moves toward $+z$ at speed $\omega/\beta$ ✓. The phasor shows the same thing with its minus sign.
      `, { zarrows: { svg: zArrowsFig(), cap: md`The phasor $e^{-j\beta z}$ at nine points along $z$. Each circle is the complex plane at that point (real to the right, imaginary up). The arrow turns 45° clockwise every $\lambda/8$ and is back where it started after $\lambda$.` } }),
      Q(md`**Predict.** $E_y = 4\cos(\omega t + 2x - 45°)$ V/m, with $x$ in meters. Its phasor and its direction of travel are…`,
        [md`$4e^{-j45°}e^{+j2x}$, toward $-x$`, md`$4e^{-j45°}e^{-j2x}$, toward $+x$`, md`$4e^{+j45°}e^{+j2x}$, toward $-x$`, md`$4e^{-j45°}e^{+j2x}$, toward $+x$`], 0,
        [null, md`The exponent copies the sign of $2x$ in the cosine, which is $+$. A minus sign there would be a different wave.`, md`That flips the starting phase. The cosine has $-45°$, so the phasor has $e^{-j45°}$.`, md`The phasor is right, but $e^{+j2x}$ goes toward $-x$: the crest $\omega t + 2x = 0$ sits at $x = -\omega t/2$, which moves toward $-x$.`],
        md`At each $x$ the field is a cosine with phase $2x - 45°$ (with $2x$ in radians), so $\tilde E_y = 4e^{-j45°}e^{j2x}$. The signs of $\omega t$ and $2x$ are the same: the wave travels toward $-x$.`),
      R(md`
        ### 8. Vectors: one phasor per component

        A field has up to three components, and each one is a cosine at $\omega$ with its own amplitude and phase. So give each component its own phasor and keep the unit vectors. For example:
        $$\mathbf E = 3\cos(\omega t - \beta z)\,\hat x + 4\sin(\omega t - \beta z)\,\hat y$$
        The $\hat x$ part is a cosine. Its phasor is $3e^{-j\beta z}$.

        The $\hat y$ part is a sine, so it gets a $-j$. Its phasor is $-j4e^{-j\beta z}$.

        Both share the factor $e^{-j\beta z}$. Factor it out:
        $$\Et(z) = (3\hat x - j4\hat y)\,e^{-j\beta z}$$
        Going back works component by component, with the same rule:
        $$\mathbf E(z,t) = \Re\{\Et(z)\,e^{j\omega t}\}$$

        **Why this matters.** The $j$ on the $\hat y$ part says that the two components peak a quarter period apart. Watch $\mathbf E$ at $z = 0$:

        - At $t = 0$: $\Re\{3\hat x - j4\hat y\} = 3\hat x$.
        - A quarter period later, $e^{j\omega t} = e^{j90°} = j$. Then $\Re\{j(3\hat x - j4\hat y)\} = \Re\{j3\hat x + 4\hat y\} = 4\hat y$.

        The field has turned from $\hat x$ to $\hat y$. A vector phasor whose components have **different phases** describes a field whose direction turns in time. That is polarization, and [Topic 9](#/l/w3-pol) reads it off a phasor in seconds. If the components have the same phase (or opposite phases), the field only swings back and forth along one line.

        !!intuition Does this make sense?
          Check $t = T/4$ in the original: at $z = 0$, $\omega t = 90°$ gives $3\cos90°\,\hat x + 4\sin90°\,\hat y = 4\hat y$ ✓.
      `),
      Q(md`**Predict.** $\mathbf E = 2\cos(\omega t + \beta y)\,\hat z - 2\sin(\omega t + \beta y)\,\hat x$. Its phasor is…`,
        [md`$(2\hat z + j2\hat x)\,e^{j\beta y}$`, md`$(2\hat z - j2\hat x)\,e^{j\beta y}$`, md`$(2\hat z + j2\hat x)\,e^{-j\beta y}$`, md`$(2\hat z - 2\hat x)\,e^{j\beta y}$`], 0,
        [null, md`That is the phasor of $+2\sin$. Here the sine has a minus sign in front, and $-\sin\to+j$.`, md`The exponent copies the sign of $\beta y$ in the cosine, which is $+$.`, md`That puts the two parts in phase. A sine and a cosine of the same argument are $90°$ apart, so a $j$ has to appear.`],
        md`$\hat z$: a cosine, phasor $2e^{j\beta y}$. $\hat x$: $-\sin\to+j$, phasor $j2e^{j\beta y}$. Together: $(2\hat z + j2\hat x)e^{j\beta y}$.`),
      RF(md`
        ### 9. The average of a product: ½Re{ÃB̃*}

        Power is always a product: $vi$, $\mathbf E\times\mathbf H$, $\mathbf J\cdot\mathbf E$. A product is not a linear operation. The product of two cosines at $\omega$ contains $2\omega$, so **the phasor of a product is not the product of the phasors**. But what we usually want is the **time average** of the product, and that has a clean phasor formula. Let us derive it.

        Take two signals at the same frequency:
        $$a(t) = A\cos(\omega t + \theta_a)$$
        $$b(t) = B\cos(\omega t + \theta_b)$$
        **Step 1: product to sum.** The identity is
        $$\cos X\cos Y = \tfrac12\cos(X - Y) + \tfrac12\cos(X + Y)$$
        Here $X - Y = \theta_a - \theta_b$, since the $\omega t$ cancels. And $X + Y = 2\omega t + \theta_a + \theta_b$. So
        $$ab = \tfrac12AB\cos(\theta_a - \theta_b) + \tfrac12AB\cos(2\omega t + \theta_a + \theta_b)$$
        **Step 2: average over one period.** The first term has no $t$ in it, so it is its own average. The second term oscillates at $2\omega$: it goes through exactly two full cycles in one period $T$, as much above zero as below. Its average is zero. So
        $$\langle ab\rangle = \tfrac12AB\cos(\theta_a - \theta_b)$$

        [[fig:avg]]

        **Step 3: write it with phasors.** The phasors are $\tilde A = Ae^{j\theta_a}$ and $\tilde B = Be^{j\theta_b}$. The conjugate flips the angle of $\tilde B$:
        $$\tilde B^* = Be^{-j\theta_b}$$
        Multiply $\tilde A$ by it. Sizes multiply and angles add:
        $$\tilde A\tilde B^* = AB\,e^{j(\theta_a - \theta_b)}$$
        The real part of $e^{j\psi}$ is $\cos\psi$:
        $$\Re\{\tilde A\tilde B^*\} = AB\cos(\theta_a - \theta_b)$$
        That is exactly twice the average from Step 2. So
        $$\boxed{\langle a(t)\,b(t)\rangle = \tfrac12\Re\{\tilde A\tilde B^*\}}$$

        **Why the conjugate.** The average needs the *difference* of the two phases, and $\tilde A\tilde B^*$ is the product whose angle is that difference. Without the conjugate, $\tilde A\tilde B$ has the angle $\theta_a + \theta_b$: the phase of the $2\omega$ term, the part that averaged away.

        **A square.** Put $b = a$. Then $\tilde A\tilde A^* = |\tilde A|^2$, which is real, and
        $$\langle a^2\rangle = \tfrac12|\tilde A|^2$$
        For $A\cos(\omega t + \phi)$ this is $A^2/2$: the familiar fact that $\cos^2$ averages to $\tfrac12$.

        **Vectors.** Apply the rule to each pair of components. $\mathbf E\times\mathbf H$ is a sum of products like $E_xH_y$, so
        $$\langle\mathbf E\times\mathbf H\rangle = \tfrac12\Re\{\Et\times\Ht^*\}$$
        That is the time-averaged Poynting vector on your formula sheet. The same step gives $\langle\mathbf J\cdot\mathbf E\rangle = \tfrac12\Re\{\tilde{\mathbf J}\cdot\Et^*\}$, and on a transmission line $P = \tfrac12\Re\{\Vt\It^*\}$. [Topic 4](#/l/w1-avg) uses this one line for every power in the course.

        !!intuition Does this make sense?
          In phase ($\theta_a = \theta_b$): $\langle ab\rangle = \tfrac12AB$, the largest it can be. A quarter period apart: $\cos90° = 0$, so the average is zero. The product is positive half the time and negative half the time: energy goes out and comes back. Opposite ($180°$): $-\tfrac12AB$, the power flows the other way.
      `, { avg: { svg: avgFig(), cap: md`$a = \cos\omega t$ (thin), $b = \cos(\omega t - 60°)$ (dashed), and their product $ab$ (accent). The product wiggles at $2\omega$ around its average, the dashed level $\tfrac12\cos60° = \tfrac14$.` } }),
      Q(md`**Predict.** $v = 10\cos(\omega t + 50°)$ V and $i = 4\cos(\omega t - 10°)$ A. The average power $\langle vi\rangle$ is…`,
        ['10 W', '20 W', '15.3 W', '17.3 W'], 0,
        [null, md`That leaves out the $\tfrac12$: $(10)(4)\cos60° = 20$.`, md`That uses the **sum** of the phases, $50° + (-10°) = 40°$. It is $\tfrac12\Re\{\tilde V\tilde I\}$, without the conjugate.`, md`That uses $\sin60°$ instead of $\cos60°$.`],
        md`$\tfrac12\Re\{\tilde V\tilde I^*\} = \tfrac12(10)(4)\cos(50° - (-10°)) = 20\cos60° = 10$ W.`),
      R(md`
        ### The method

        !!method Time domain to phasor
          1. Write every component as $A\cos(\omega t \mp \beta z + \phi)$ with $A > 0$. A sine becomes $\cos(\cdots - 90°)$. A minus sign in front becomes $+180°$, or keep it as a factor $-1$.
          2. The phasor is $Ae^{j\phi}e^{\mp j\beta z}$, with the same sign on $\beta z$ as in the cosine.
          3. The shortcut table: $\cos\to1$, $\sin\to-j$, $-\cos\to-1$, $-\sin\to+j$.
          4. For a vector, do each component, then factor out the common $e^{\mp j\beta z}$.

        !!method Phasor to time domain
          1. Multiply by $e^{j\omega t}$ and take the real part.
          2. Polar form: $Ae^{j\phi}e^{\mp j\beta z}$ gives $A\cos(\omega t \mp \beta z + \phi)$.
          3. Rectangular form: $(a + jb)e^{j\theta}$ gives $a\cos\theta - b\sin\theta$, where $\theta = \omega t \mp \beta z$.
          4. Check at $t = 0$, $z = 0$: the field there is the real part of the phasor.

        ### Worked example 1: a field with two components (the skill HW 8 #4 asks for)

        !!graded Problem
          $\mathbf E = 6\cos(\omega t + \beta x - 60°)\,\hat y + 6\sin(\omega t + \beta x + 30°)\,\hat z$ V/m. Find $\Et(x)$, the direction of travel, and $\mathbf E$ at $x = 0$, $t = 0$. Does the direction of $\mathbf E$ turn in time?

        **Step 1: the $\hat y$ part.** A cosine with amplitude 6, phase $-60°$, and $+\beta x$ inside:
        $$\tilde E_y = 6e^{-j60°}e^{+j\beta x}$$
        **Step 2: the $\hat z$ part.** It is a sine, so rewrite it as a cosine a quarter period late:
        $$\sin(\omega t + \beta x + 30°) = \cos(\omega t + \beta x + 30° - 90°)$$
        The two angles combine, $30° - 90° = -60°$:
        $$\sin(\omega t + \beta x + 30°) = \cos(\omega t + \beta x - 60°)$$
        So
        $$\tilde E_z = 6e^{-j60°}e^{+j\beta x}$$
        **Step 3: assemble.** Both components have the same factor $6e^{-j60°}e^{j\beta x}$:
        $$\Et(x) = 6e^{-j60°}(\hat y + \hat z)\,e^{j\beta x}$$
        in V/m.

        **Step 4: direction.** The exponent is $e^{+j\beta x}$, matching the $+\beta x$ in the cosines: the wave travels toward $-x$.

        **Step 5: the field at the origin at $t = 0$.** It is the real part of $\Et(0)$:
        $$\Re\{6e^{-j60°}\}(\hat y + \hat z) = 6\cos60°\,(\hat y + \hat z)$$
        $$\mathbf E(0, 0) = 3(\hat y + \hat z)\ \text{V/m}$$
        **Step 6: does it turn?** The two components have the **same** phasor, so they rise and fall together. $\mathbf E$ always points along $+(\hat y + \hat z)$ or $-(\hat y + \hat z)$. It does not turn; it swings along one line, halfway between $\hat y$ and $\hat z$, with peak $6\sqrt2$ V/m.

        !!intuition Does this make sense?
          At $x = 0$, $t = 0$ in the original: $6\cos(-60°) = 3$ and $6\sin30° = 3$ ✓. The sine and the cosine looked $90°$ apart, but their written phases ($30°$ and $-60°$) were also $90°$ apart, and the two shifts cancel. The phasor saw through it in one line.

        **Speed path.** Sine: subtract $90°$ from its phase. Compare the two phases: equal, so the field swings along a line. The exponent copies $+\beta x$: travel toward $-x$.

        **Where points go.** Writing the sine's phasor as $6e^{+j120°}$ (adding $90°$); writing $e^{-j\beta x}$ out of habit; calling it circular because "a sine and a cosine" appear.

        ### Worked example 2: two waves going opposite ways (the skill Spring 2024 #1 asks for)

        !!graded Problem
          $E_x(z,t) = 5\cos(\omega t - \beta z) - 5\cos(\omega t + \beta z)$ V/m. Write the total phasor in its simplest form, then the total field in the time domain. Where is $E_x$ zero at every instant?

        **Step 1: each wave's phasor.** The first travels toward $+z$. The second travels toward $-z$ and has a minus sign in front:
        $$\tilde E_x = 5e^{-j\beta z} - 5e^{+j\beta z}$$
        **Step 2: factor out $-5$.**
        $$\tilde E_x = -5\,(e^{j\beta z} - e^{-j\beta z})$$
        **Step 3: Euler.** Subtract $e^{-j\theta} = \cos\theta - j\sin\theta$ from $e^{j\theta} = \cos\theta + j\sin\theta$. The cosines cancel and the sines add:
        $$e^{j\theta} - e^{-j\theta} = 2j\sin\theta$$
        So
        $$\tilde E_x = -5\cdot2j\sin\beta z = -j10\sin\beta z$$
        **Step 4: back to time.** At each $z$, $\sin\beta z$ is just a real number. The factor $-j$ means "a sine in time" (Section 4):
        $$E_x(z,t) = \Re\{-j10\sin\beta z\;e^{j\omega t}\}$$
        $$E_x(z,t) = 10\sin\beta z\,\sin\omega t\ \text{V/m}$$
        **Step 5: the nulls.** $\sin\beta z = 0$ at $\beta z = 0, \pi, 2\pi, \dots$, so at $z = 0, \lambda/2, \lambda, \dots$ There the field is zero at every instant.

        !!intuition Does this make sense?
          The trig identity $\cos(A - B) - \cos(A + B) = 2\sin A\sin B$, with $A = \omega t$ and $B = \beta z$, gives $10\sin\omega t\sin\beta z$ directly ✓. The phasor route never needed that identity, only $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$, which the Spring 2024 exam prints on the page.

        This field does not travel. Each point just oscillates with its own fixed amplitude $|10\sin\beta z|$: a **standing wave**. [Topic 12](#/l/w4-standing) builds these from reflections.

        **Speed path.** Write the two exponentials. Recognize $e^{j\theta} + e^{-j\theta} = 2\cos\theta$ or $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$. A real phasor is a cosine in time; a $-j$ is a sine.

        **Where points go.** Losing the $j$ (writing $-10\sin\beta z$, which would be $-10\sin\beta z\cos\omega t$ in time); writing $e^{-j\beta z}$ for the wave toward $-z$; leaving the answer unsimplified (Spring 2024 took 2 points for that).

        ### Worked example 3: average power from a sine and a cosine

        !!graded Problem
          A voltage $v(t) = 10\cos(\omega t + 30°)$ V drives a current $i(t) = 2\sin(\omega t + 60°)$ A. Find the average power $\langle vi\rangle$.

        **Step 1: phasors.** The voltage is a cosine: $\tilde V = 10e^{j30°}$. The current is a sine, so subtract $90°$:
        $$\tilde I = 2e^{j(60° - 90°)} = 2e^{-j30°}$$
        **Step 2: conjugate the current.** Flip its angle:
        $$\tilde I^* = 2e^{+j30°}$$
        **Step 3: multiply.** Sizes multiply, angles add:
        $$\tilde V\tilde I^* = 20\,e^{j60°}$$
        **Step 4: half the real part.**
        $$\langle vi\rangle = \tfrac12\Re\{20e^{j60°}\} = 10\cos60° = 5\ \text{W}$$

        !!intuition Does this make sense?
          The voltage's phase is $30°$ and the current's is $-30°$: they are $60°$ apart. In phase, the average would be $\tfrac12(10)(2) = 10$ W. Being $60°$ apart keeps $\cos60° = \tfrac12$ of that ✓.

        **Where points go.** Treating the sine as a cosine: the phase difference becomes $30° - 60° = -30°$, and the answer $10\cos30° = 8.66$ W. Forgetting the $\tfrac12$: 10 W.

        ### Speed tricks

        !!key Speed tricks
          - **Four arrows.** $\cos\to1$, $\sin\to-j$, $-\cos\to-1$, $-\sin\to+j$. Draw the compass on your card.
          - **Copy the sign.** The exponent $e^{\mp j\beta z}$ copies the sign of $\beta z$ in the cosine. $e^{-j\beta z}$ travels toward $+z$.
          - **The value at $t = 0$** is the real part of the phasor. A quarter period later it is $\Re\{j\tilde A\} = -\Im\{\tilde A\}$.
          - **Triangles.** $1 + j = \sqrt2\,e^{j45°}$; $1 + j\sqrt3 = 2e^{j60°}$; $\sqrt3 + j = 2e^{j30°}$; $3 + 4j = 5e^{j53.1°}$. Sketch for the quadrant.
          - **Euler pairs.** $e^{j\theta} + e^{-j\theta} = 2\cos\theta$; $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$; $e^{j\pi} = -1$; $e^{\pm j\pi/2} = \pm j$.
          - **Averages.** $\tfrac12AB\cos(\text{phase difference})$. Same phase: $\tfrac12AB$. $90°$ apart: zero. One signal squared: $\tfrac12|\tilde A|^2$.

        !!mistake Common mistakes
          - **A sine as $+j$.** A sine is a *late* cosine: $-j$.
          - **The sign of the phase.** $\cos(\omega t - 30°)\to e^{-j30°}$, not $e^{+j30°}$.
          - **$e^{+j\beta z}$ for a wave toward $+z$.** It is the minus sign that means $+z$.
          - **Forgetting the real part.** $\tilde Ae^{j\omega t}$ is complex; the field is its real part. Writing "$\mathbf E = 5e^{j(\omega t - \beta z)}\hat x$" as the field loses points.
          - **Keeping $e^{j\omega t}$ in the phasor.** The phasor has no $t$ in it.
          - **Adding amplitudes.** $3\cos\omega t + 4\sin\omega t$ peaks at 5, not 7.
          - **Multiplying phasors.** $\tilde A\tilde B$ is not the phasor of $ab$, and $\tfrac12\Re\{\tilde A\tilde B\}$, with no conjugate, is not its average.
          - **The wrong quadrant.** The angle of $-1 + j\sqrt3$ is $120°$, not $-60°$. Sketch the point.

        ### Check questions
      `),
      Q(md`Which line **defines** the phasor $\tilde A$ of a signal $a(t)$ at frequency $\omega$?`,
        [md`$a(t) = \Re\{\tilde A\,e^{j\omega t}\}$`, md`$a(t) = \tilde A\,e^{j\omega t}$`, md`$a(t) = \Re\{\tilde A\}\,e^{j\omega t}$`, md`$\tilde A = a(t)\,e^{j\omega t}$`], 0,
        [null, md`The right side is complex, and a field you can measure is real. The real part is missing.`, md`$\Re\{\tilde A\}$ is just a number, and multiplying it by $e^{j\omega t}$ makes a complex signal again.`, md`That keeps the time dependence in the phasor. The phasor is the constant that multiplies $e^{j\omega t}$.`],
        md`$\tilde A$ is the frozen arrow, $e^{j\omega t}$ the spin, and the real part the shadow.`),
      Q(md`$\Et = (1 + j)\,e^{-j\pi z}\,\hat x$ V/m, with $z$ in meters. What is $\mathbf E$ at $z = 0.5$ m and $t = 0$?`,
        [md`$1\,\hat x$ V/m`, md`$-1\,\hat x$ V/m`, md`$1.41\,\hat x$ V/m`, md`$0$`], 0,
        [null, md`That uses $e^{+j\pi z}$: $(1 + j)(+j) = -1 + j$. The exponent here is $e^{-j\pi z}$, which is $-j$ at $z = 0.5$.`, md`$\sqrt2 = |1 + j|$ is the peak at that point. At $t = 0$ you need the real part.`, md`A quarter wavelength turns the arrow by $90°$; it does not make it vanish.`],
        md`$e^{-j\pi(0.5)} = e^{-j90°} = -j$. So $\Et(0.5) = (1 + j)(-j) = -j - j^2 = 1 - j$. At $t = 0$ the field is the real part: $1\,\hat x$ V/m.`),
      Q(md`In phasor form, $d^2/dt^2$ becomes multiplication by…`,
        [md`$-\omega^2$`, md`$j\omega^2$`, md`$\omega^2$`, md`$2j\omega$`], 0,
        [null, md`Each derivative brings a whole $j\omega$, and $(j\omega)^2 = j^2\omega^2$.`, md`The $j^2 = -1$ is missing. A second derivative of a cosine is a negative cosine.`, md`That differentiates $(j\omega)^2$ instead of squaring $j\omega$.`],
        md`$(j\omega)^2 = -\omega^2$. Check: $\frac{d^2}{dt^2}\cos\omega t = -\omega^2\cos\omega t$ ✓.`),
      Q(md`$a(t) = 3\cos\omega t$ and $b(t) = 4\cos2\omega t$. Can you find $a + b$ by adding the phasors $3 + 4$?`,
        [md`No: they are at different frequencies`, md`Yes, and the peak is 7`, md`Yes, and the peak is 5`, md`Only at $t = 0$`], 0,
        [null, md`The two arrows spin at different rates. "Adding phasors" assumes one common $e^{j\omega t}$.`, md`5 would need a $90°$ difference at the same frequency.`, md`At $t = 0$ the sum is 7, but that is a coincidence of one instant, not a phasor.`],
        md`Phasors add only when the spin $e^{j\omega t}$ is common to both. Here one has $e^{j\omega t}$ and the other $e^{j2\omega t}$.`),
      Q(md`Fall 2023 #6: $E_x = 5e^{-0.2z}\cos(\omega t - 0.2z)$ V/m. Its phasor is…`,
        [md`$5e^{-0.2z}e^{-j0.2z}$`, md`$5e^{-j0.2z}$`, md`$5e^{-0.2z}e^{+j0.2z}$`, md`$5e^{-j0.4z}$`], 0,
        [null, md`That drops the decay. A real factor $e^{-0.2z}$ in front is part of the amplitude, so it stays.`, md`The phase term copies the $-0.2z$ in the cosine.`, md`That treats the decay as a phase. $e^{-0.2z}$ is real and shrinks the size; only the $-0.2z$ inside the cosine is a phase.`],
        md`At each $z$: amplitude $5e^{-0.2z}$, phase $-0.2z$. Phasor $5e^{-0.2z}e^{-j0.2z} = 5e^{-(0.2 + j0.2)z}$, so $\gamma = 0.2 + j0.2$.`, { src: 'Fall 2023 #6' }),
      Q(md`Two signals have the phasors $\tilde A = 3e^{j20°}$ and $\tilde B = 2e^{j110°}$. Their time-averaged product $\langle ab\rangle$ is…`,
        [md`$0$`, md`$3$`, md`$-1.93$`, md`$6$`], 0,
        [null, md`$3 = \tfrac12(3)(2)$ is the average only if they are in phase.`, md`That uses the **sum** of the angles: $\tfrac12(3)(2)\cos130° \approx -1.93$. That is $\tfrac12\Re\{\tilde A\tilde B\}$, with no conjugate. The rule needs the difference.`, md`That is the product of the peaks, with no $\tfrac12$ and no phase.`],
        md`$\tfrac12\Re\{\tilde A\tilde B^*\} = \tfrac12(3)(2)\cos(20° - 110°) = 3\cos(-90°) = 0$. They are a quarter period apart.`),
      Q(md`Compared with $a(t)$, the signal whose phasor is $j\tilde A$…`,
        [md`is the same shape, a quarter period earlier`, md`is the same shape, a quarter period later`, md`is $a(t)$ turned upside down`, md`is $a(t)$ with twice the amplitude`], 0,
        [null, md`Later would be $-j\tilde A$, a turn clockwise.`, md`Upside down is $-\tilde A$, a half turn.`, md`$|j| = 1$: the size does not change.`],
        md`$j = e^{j90°}$ adds $90°$ to the phase. A larger phase means an earlier peak: $\cos(\omega t + \phi + 90°)$ peaks a quarter period before $\cos(\omega t + \phi)$.`),
      Q(md`$\mathbf E = 3\cos\omega t\,\hat x + 4\sin\omega t\,\hat y$ V/m at a point. What is $\langle|\mathbf E|^2\rangle$?`,
        [md`$12.5\ \text{V}^2/\text{m}^2$`, md`$25\ \text{V}^2/\text{m}^2$`, md`$24.5\ \text{V}^2/\text{m}^2$`, md`$4.5\ \text{V}^2/\text{m}^2$`], 0,
        [null, md`That is $|\Et|^2$, with no $\tfrac12$.`, md`That squares the sum of the peaks, $(3 + 4)^2/2$. The components are perpendicular, so their squares add.`, md`That keeps only the $\hat x$ part.`],
        md`$\langle|\mathbf E|^2\rangle = \tfrac12\Re\{\Et\cdot\Et^*\} = \tfrac12(|3|^2 + |-4j|^2) = \tfrac12(9 + 16) = 12.5$.`),
      R(md`
        ### Practice, level 1: from time to phasor

        **The trick:** $\cos\to1$, $\sin\to-j$, $-\cos\to-1$, $-\sin\to+j$; then copy the sign of $\beta z$ into the exponent. Each card asks for one move; answer in about 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_w1p_tophasor', { need: 8 }), { id: 'w1-phasor.r0' }),
      R(md`
        ### Practice, level 1: from phasor to time

        **The trick:** the angle of the phasor is the phase of the cosine. For $a + jb$, sketch the point to get the quadrant. The value at $t = 0$ is the real part.
      `),
      Object.assign(G('rf_w1p_totime', { need: 8 }), { id: 'w1-phasor.r1' }),
      R(md`
        ### Practice, level 1: one operation at a time

        **The trick:** add phasors to add signals; multiply by $j\omega$ to differentiate; $\tfrac12\Re\{\tilde A\tilde B^*\}$ to average a product.
      `),
      Object.assign(G('rf_w1p_ops', { need: 8 }), { id: 'w1-phasor.r2' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w1p_sum', { need: 2 }),
      G('w1p_avg', { need: 2 }),
      G('w1p_vec', { need: 2 }),
      G('w1p_deriv', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        Two waves going opposite ways, in the shape of Spring 2024 #1: combine, simplify with Euler, go back to time, read the nulls, average.
      `),
      G('w1p_standing', { need: 2 }),
    ],
  });

  // ================================================================ lesson 1 generators
  // ---------------------------------------------------------------- level 1: time to phasor
  GENS.rf_w1p_tophasor = () => one([
    // a cosine with a phase
    () => {
      const A = pick([2, 3, 4, 5, 6, 8, 10]), d = pick([-150, -120, -60, -30, 30, 60, 120, 150]);
      return MC('Cosine to phasor', md`The phasor of $${A}\cos(\omega t${phs(d)})$ is…`, md`$${pol(A, d)}$`,
        [[md`$${pol(A, -d)}$`, md`That flips the sign of the phase. $\cos(\omega t${phs(d)})$ starts at $${dg(d)}$, and the phasor keeps exactly that angle.`],
          [md`$${pol(A, wrap(d - 90))}$`, md`That subtracts $90°$, the correction for a **sine**. A cosine needs no correction.`],
          [md`$${pol(A, wrap(d + 90))}$`, md`That adds $90°$. Nothing shifts a cosine's phase: the angle inside the cosine is the angle of the phasor.`],
          [md`$${A}$`, md`That drops the starting angle. A phasor carries two numbers: the size and the phase.`]],
        md`$A\cos(\omega t + \phi)\to Ae^{j\phi}$. Here $A = ${A}$ and $\phi = ${dg(d)}$, so the phasor is $${pol(A, d)}$.`);
    },
    // a sine
    () => {
      const A = pick([2, 3, 4, 5, 6, 10]), d = pick([0, 30, 60, 120, -30, -60]), r = wrap(d - 90);
      return MC('Sine to phasor', md`The phasor of $${A}\sin(\omega t${phs(d)})$ is…`, md`$${pol(A, r)}$`,
        [[md`$${pol(A, wrap(d + 90))}$`, md`That adds $90°$, as if a sine were $+j$. A sine peaks a quarter period **later** than a cosine: subtract $90°$.`],
          [md`$${pol(A, d)}$`, md`That treats the sine as a cosine. Rewrite it first: $\sin x = \cos(x - 90°)$.`],
          [md`$${pol(A, wrap(90 - d))}$`, md`That has the right size of angle with the wrong sign. The phase is $${dg(d)} - 90° = ${dg(r)}$.`],
          [md`$${pol(A, wrap(d + 180))}$`, md`That reads the sine as a minus cosine ($180°$). A sine is a quarter period off, not a half.`]],
        md`$\sin x = \cos(x - 90°)$, so $${A}\sin(\omega t${phs(d)}) = ${A}\cos(\omega t${phs(r)})$. The phasor is $${pol(A, r)}${d === 0 ? ` = -j${A}` : ''}$.`);
    },
    // a minus sign in front
    () => {
      const A = pick([2, 3, 4, 5, 8]), d = pick([0, 30, 60, -30, -60, 120]), r = wrap(d + 180);
      return MC('A minus sign in front', md`The phasor of $-${A}\cos(\omega t${phs(d)})$ is…`, md`$${pol(A, r)}$`,
        [[md`$${pol(A, d)}$`, md`That drops the minus sign. $-1 = e^{j180°}$: a half turn.`],
          [md`$${pol(A, wrap(d - 90))}$`, md`A minus sign is a half turn ($180°$), not a quarter turn.`],
          [md`$${pol(A, wrap(-d))}$`, md`That flips the sign of the phase instead of adding $180°$.`],
          [md`$${pol(A, wrap(d + 90))}$`, md`Adding $90°$ turns a cosine into $-\sin$. A minus sign in front is $180°$.`]],
        md`$-1 = e^{j180°}$, so $-${A}\cos(\omega t${phs(d)}) = ${A}\cos(\omega t${phs(d)} + 180°)$. The phasor is $${pol(A, r)}$, the same number as $-${pol(A, d)}$.`);
    },
    // a traveling wave
    () => {
      const E0 = pick([2, 3, 5, 10, 20]), d = pick([-60, -45, -30, 30, 45, 60]), u = pick(AX), s = pick([1, -1]);
      const b = pick(['2', '3', '\\pi', '2\\pi', '4']), c = pick(AX.filter((a) => a !== u));
      const arg = `\\omega t ${s > 0 ? '-' : '+'} ${b} ${u}`;
      const ep = (sg) => `e^{${sg > 0 ? '-' : '+'}j${b} ${u}}`;
      return MC('A traveling wave', md`$\mathbf E = ${E0}\cos(${arg}${phs(d)})\,\hat ${c}$ V/m. Its phasor is…`, md`$${pol(E0, d)}\,${ep(s)}\,\hat ${c}$`,
        [[md`$${pol(E0, d)}\,${ep(-s)}\,\hat ${c}$`, md`The exponent has the wrong sign. It copies the sign of $${b} ${u}$ inside the cosine.`],
          [md`$${pol(E0, -d)}\,${ep(s)}\,\hat ${c}$`, md`The starting phase has the wrong sign: the cosine has $${dg(d)}$.`],
          [md`$${E0}\,e^{j(${arg}${phs(d)})}\,\hat ${c}$`, md`That keeps $e^{j\omega t}$. The phasor is what multiplies $e^{j\omega t}$, so it has no $t$ in it.`],
          [md`$${pol(E0, -d)}\,${ep(-s)}\,\hat ${c}$`, md`Both signs are flipped: that is the complex conjugate of the phasor.`]],
        md`At each point the field is a cosine with phase $${dg(d)}$ ${s > 0 ? 'minus' : 'plus'} $${b} ${u}$. So the phasor is $${pol(E0, d)}${ep(s)}\,\hat ${c}$, and the wave travels toward $${s > 0 ? '+' : '-'}${u}$.`);
    },
    // two components, a cosine and a sine
    () => {
      const u = pick(AX), [c1, c2] = U.shuffle(AX.filter((a) => a !== u)), s = pick([1, -1]);
      const A = pick([1, 2, 3, 4, 5]), B = pick([2, 3, 4, 6]), sn = pick([1, -1]);
      const arg = `\\omega t ${s > 0 ? '-' : '+'} \\beta ${u}`;
      const ep = (sg) => `e^{${sg > 0 ? '-' : '+'}j\\beta ${u}}`;
      const vec = (jsg) => `(${co(String(A))}\\hat ${c1} ${jsg > 0 ? '+' : '-'} j${B}\\hat ${c2})`;
      const right = -sn;                                   // +sin -> -j, -sin -> +j
      return MC('Two components', md`$\mathbf E = ${co(String(A))}\cos(${arg})\,\hat ${c1} ${sn > 0 ? '+' : '-'} ${B}\sin(${arg})\,\hat ${c2}$. Its phasor is…`, md`$${vec(right)}\,${ep(s)}$`,
        [[md`$${vec(-right)}\,${ep(s)}$`, md`The sign of the $j$ is wrong. ${sn > 0 ? md`$+\sin\to-j$: a sine is a late cosine.` : md`$-\sin\to+j$: the minus sign in front flips the $-j$ of a sine.`}`],
          [md`$${vec(right)}\,${ep(-s)}$`, md`The exponent copies the sign of $\beta ${u}$ in the cosine.`],
          [md`$(${co(String(A))}\hat ${c1} ${sn > 0 ? '+' : '-'} ${B}\hat ${c2})\,${ep(s)}$`, md`That puts the two components in phase. A sine and a cosine of the same argument are a quarter period apart, so a $j$ must appear.`]],
        md`$\hat ${c1}$: a cosine, phasor $${A}${ep(s)}$. $\hat ${c2}$: ${sn > 0 ? md`$+\sin\to-j$` : md`$-\sin\to+j$`}, phasor $${right > 0 ? '+' : '-'}j${B}${ep(s)}$. Factor out $${ep(s)}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: phasor to time
  const TRI3 = [
    { a: 1, b: 1, at: '1', bt: '1', m: '\\sqrt2', mv: Math.SQRT2 },
    { a: 1, b: Math.sqrt(3), at: '1', bt: '\\sqrt3', m: '2', mv: 2 },
    { a: Math.sqrt(3), b: 1, at: '\\sqrt3', bt: '1', m: '2', mv: 2 },
    { a: 3, b: 4, at: '3', bt: '4', m: '5', mv: 5 },
    { a: 4, b: 3, at: '4', bt: '3', m: '5', mv: 5 },
  ];
  GENS.rf_w1p_totime = () => one([
    // polar form
    () => {
      const A = pick([2, 3, 4, 5, 6, 10]), d = pick([-120, -60, -30, 30, 60, 120]);
      return MC('Phasor to signal', md`A signal has the phasor $${pol(A, d)}$. The signal is…`, md`$${A}\cos(\omega t${phs(d)})$`,
        [[md`$${A}\cos(\omega t${phs(-d)})$`, md`The sign of the angle is the sign of the phase: $e^{j\phi}$ means $\cos(\omega t + \phi)$.`],
          [md`$${A}\sin(\omega t${phs(d)})$`, md`Phasors are built on cosines: $\Re\{Ae^{j\phi}e^{j\omega t}\} = A\cos(\omega t + \phi)$.`],
          [md`$${A}\cos(${dg(d)})$`, md`That is the value at $t = 0$ only. The signal keeps its $\omega t$.`],
          [md`$${A}e^{j(\omega t${phs(d)})}$`, md`That forgets the real part. A field you can measure is real.`]],
        md`$\Re\{${pol(A, d)}e^{j\omega t}\} = ${A}\cos(\omega t${phs(d)})$.`);
    },
    // j, -j, -1
    () => {
      const A = pick([2, 3, 4, 5, 6, 10]), k = pick(['j', 'mj', 'm']);
      const forms = { j: md`$-${A}\sin\omega t$`, mj: md`$${A}\sin\omega t$`, m: md`$-${A}\cos\omega t$`, one: md`$${A}\cos\omega t$` };
      const ph = { j: `j${A}`, mj: `-j${A}`, m: `-${A}` }[k];
      const why = {
        j: md`That is the signal of $+j${A}$: an arrow pointing up, which a quarter turn later points left, a minimum.`,
        mj: md`That is the signal of $-j${A}$: an arrow pointing down, which a quarter turn later points right, a maximum.`,
        m: md`That is the signal of $-${A}$: an arrow pointing left.`,
        one: md`That is the signal of the real phasor $${A}$. A $j$ means a quarter-period shift.`,
      };
      const how = {
        j: md`$\Re\{j${A}(\cos\omega t + j\sin\omega t)\} = -${A}\sin\omega t$, since $j\cdot j = -1$.`,
        mj: md`$\Re\{-j${A}(\cos\omega t + j\sin\omega t)\} = +${A}\sin\omega t$, since $-j\cdot j = +1$.`,
        m: md`$\Re\{-${A}e^{j\omega t}\} = -${A}\cos\omega t$.`,
      };
      return MC('Phasor to signal: j, −j, −1', md`A signal has the phasor $${ph}$. The signal is…`, forms[k],
        Object.keys(forms).filter((x) => x !== k).map((x) => [forms[x], why[x]]), how[k]);
    },
    // rectangular form with a clean triangle
    () => {
      const t = pick(TRI3), sa = pick([1, -1]), sb = pick([1, -1]);
      const d = r1(Math.atan2(sb * t.b, sa * t.a) / DEG), sw = r1(Math.atan2(sb * t.a, sa * t.b) / DEG);
      const ph = `${sa < 0 ? '-' : ''}${t.at} ${sb < 0 ? '-' : '+'} j${co(t.bt)}`;
      const sum = p(+(t.a + t.b).toFixed(2));
      return MC('Rectangular phasor to signal', md`A signal has the phasor $${ph}$. The signal is…`, md`$${t.m}\cos(\omega t${phs(d)})$`,
        [[md`$${t.m}\cos(\omega t${phs(-d)})$`, md`The angle has the wrong sign. The point is ${sb > 0 ? 'above' : 'below'} the real axis.`],
          [md`$${t.m}\cos(\omega t${phs(wrap(d + 180))})$`, md`That is $180°$ off: the point is ${sa > 0 ? 'right' : 'left'} of the imaginary axis. ${sa < 0 ? md`A calculator's $\tan^{-1}(b/a)$ cannot see that; a sketch can.` : md`That angle belongs to the opposite phasor.`}`],
          [md`$${t.m}\cos(\omega t${phs(sw)})$`, md`That swaps the two legs of the triangle: $\tan\phi = \text{imaginary}/\text{real}$.`],
          [md`$${sum}\cos(\omega t${phs(d)})$`, md`That adds the legs. The size of $a + jb$ is $\sqrt{a^2 + b^2}$.`]],
        md`Size: $\sqrt{(${t.at})^2 + (${t.bt})^2} = ${t.m}$. Sketch the point (${sa > 0 ? 'right' : 'left'}, ${sb > 0 ? 'up' : 'down'}): the angle is $${dg(d)}$. So the signal is $${t.m}\cos(\omega t${phs(d)})$.`);
    },
    // the value at t = 0 or at t = T/4
    () => {
      let a, b;
      do { a = pick([-4, -3, -2, -1, 1, 2, 3, 4]); b = pick([-4, -3, -2, -1, 1, 2, 3, 4]); } while (Math.abs(a) === Math.abs(b));
      const q4 = pick([false, true]), ph = `${a} ${b < 0 ? '-' : '+'} j${Math.abs(b)}`;
      const pk = p(+Math.hypot(a, b).toFixed(3));
      const all = [
        [a, q4 ? md`That is the value at $t = 0$. A quarter period later the arrow has turned $90°$.` : null],
        [b, md`That is the imaginary part: the arrow's height, not its shadow.`],
        [-b, q4 ? null : md`That is the value a quarter period later, $\Re\{j\tilde A\} = -\Im\{\tilde A\}$.`],
        [-a, md`That is the value half a period later, when the arrow points the other way.`],
      ];
      const right = q4 ? -b : a;
      return MC(q4 ? 'The value a quarter period in' : 'The value at t = 0', md`A signal has the phasor $\tilde A = ${ph}$. What is the signal at ${q4 ? '$t = T/4$' : '$t = 0$'}?`, `$${right}$`,
        all.filter((x) => x[0] !== right).map((x) => [`$${x[0]}$`, x[1]]).concat([[`$${pk}$`, md`That is the peak $|\tilde A|$, reached only when the arrow points right.`]]),
        q4 ? md`At $t = T/4$, $e^{j\omega t} = e^{j90°} = j$. So $a(T/4) = \Re\{j(${ph})\} = \Re\{${a}j ${b < 0 ? '+' : '-'} ${Math.abs(b)}\} = ${-b}$.` : md`At $t = 0$, $e^{j\omega t} = 1$, so $a(0) = \Re\{\tilde A\} = ${a}$.`);
    },
    // a traveling phasor back to time, with its direction
    () => {
      const E0 = pick([2, 4, 5, 10]), d = pick([-60, -30, 30, 45, 60, 90, -90]), u = pick(AX), s = pick([1, -1]);
      const c = pick(AX.filter((a) => a !== u)), b = pick(['2', '5', '\\pi', '3\\pi']);
      const cs = (sg, dd, fn = '\\cos') => `${E0}${fn}(\\omega t ${sg > 0 ? '-' : '+'} ${b} ${u}${phs(dd)})\\,\\hat ${c}`;
      const dir = (sg) => `toward $${sg > 0 ? '+' : '-'}${u}$`;
      return MC('A traveling phasor back to time', md`$\Et = ${pol(E0, d)}\,e^{${s > 0 ? '-' : '+'}j${b} ${u}}\,\hat ${c}$ V/m. The field and its direction of travel are…`, `$${cs(s, d)}$, ${dir(s)}`,
        [[`$${cs(-s, d)}$, ${dir(-s)}`, md`The sign of $${b} ${u}$ in the cosine is the sign in the exponent. Both the cosine and the direction came out flipped.`],
          [`$${cs(s, d)}$, ${dir(-s)}`, md`The field is right, but ${s > 0 ? md`$e^{-j${b} ${u}}$ travels toward $+${u}$` : md`$e^{+j${b} ${u}}$ travels toward $-${u}$`}: follow a crest where the cosine's argument stays fixed.`],
          [`$${cs(s, -d)}$, ${dir(s)}`, md`The starting phase has the wrong sign. The phasor's angle is $${dg(d)}$.`],
          [`$${cs(s, d, '\\sin')}$, ${dir(s)}`, md`Phasors are built on cosines. The real part of $e^{j\theta}$ is $\cos\theta$.`]],
        md`$\Re\{${pol(E0, d)}e^{${s > 0 ? '-' : '+'}j${b} ${u}}e^{j\omega t}\} = ${cs(s, d)}$. ${s > 0 ? 'Opposite' : 'Equal'} signs on $\omega t$ and $${b} ${u}$: the wave travels toward $${s > 0 ? '+' : '-'}${u}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: one operation
  const SUMS = [
    { a: 3, b: 4, at: '3', bt: '4', m: '5' },
    { a: 4, b: 3, at: '4', bt: '3', m: '5' },
    { a: 6, b: 8, at: '6', bt: '8', m: '10' },
    { a: 5, b: 12, at: '5', bt: '12', m: '13' },
    { a: 1, b: 1, at: '1', bt: '1', m: '\\sqrt2' },
    { a: 1, b: Math.sqrt(3), at: '1', bt: '\\sqrt3', m: '2' },
    { a: Math.sqrt(3), b: 1, at: '\\sqrt3', bt: '1', m: '2' },
  ];
  GENS.rf_w1p_ops = () => one([
    // a derivative
    () => {
      const A = pick([2, 3, 4, 5]), d = pick([0, 30, -30, 60, -60, 120]);
      return MC('A derivative', md`$a(t) = ${A}\cos(\omega t${phs(d)})$. Then $da/dt$ is…`, md`$${A}\omega\cos(\omega t${phs(wrap(d + 90))})$`,
        [[md`$${A}\omega\cos(\omega t${phs(wrap(d - 90))})$`, md`That subtracts $90°$, which is what an integral does. $\times j\omega$ adds $90°$.`],
          [md`$${A}\cos(\omega t${phs(wrap(d + 90))})$`, md`The chain rule brings down a factor $\omega$.`],
          [md`$${A}\omega\cos(\omega t${phs(d)})$`, md`The factor $j$ turns the arrow by $90°$: a derivative leads.`],
          [md`$\tfrac{${A}}{\omega}\cos(\omega t${phs(wrap(d + 90))})$`, md`A derivative multiplies by $\omega$; an integral divides.`]],
        md`Phasor: $j\omega\cdot${pol(A, d)} = ${A}\omega\,${ex(wrap(d + 90)) || '1'}$. Back to time: $${A}\omega\cos(\omega t${phs(wrap(d + 90))})$.`);
    },
    // an integral
    () => {
      const A = pick([2, 3, 4, 6]), d = pick([0, 30, -30, 60, 90, 120]);
      return MC('An integral', md`$a(t) = ${A}\cos(\omega t${phs(d)})$. The integral $\int a\,dt$ (with no constant part) is…`, md`$\tfrac{${A}}{\omega}\cos(\omega t${phs(wrap(d - 90))})$`,
        [[md`$\tfrac{${A}}{\omega}\cos(\omega t${phs(wrap(d + 90))})$`, md`Dividing by $j$ multiplies by $-j$: the phase goes **down** by $90°$.`],
          [md`$${A}\omega\cos(\omega t${phs(wrap(d - 90))})$`, md`An integral divides by $\omega$.`],
          [md`$\tfrac{${A}}{\omega}\cos(\omega t${phs(d)})$`, md`Dividing by $j\omega$ also turns the arrow by $90°$.`]],
        md`Phasor: $${pol(A, d)}/(j\omega) = -j\cdot${pol(A, d)}/\omega$. The $-j$ subtracts $90°$: $\tfrac{${A}}{\omega}\cos(\omega t${phs(wrap(d - 90))})$.`);
    },
    // a sum of a cosine and a sine
    () => {
      const t = pick(SUMS), sa = pick([1, -1]), sb = pick([1, -1]);
      const d = r1(Math.atan2(-sb * t.b, sa * t.a) / DEG), sw = r1(Math.atan2(-sb * t.a, sa * t.b) / DEG);
      const sum = p(+(t.a + t.b).toFixed(2));
      const sig = `${sa < 0 ? '-' : ''}${co(t.at)}\\cos\\omega t ${sb < 0 ? '-' : '+'} ${co(t.bt)}\\sin\\omega t`;
      return MC('A cosine plus a sine', md`$${sig}$ equals…`, md`$${t.m}\cos(\omega t${phs(d)})$`,
        [[md`$${sum}\cos(\omega t${phs(d)})$`, md`That adds the peaks. The pieces are $90°$ apart, so the size is $\sqrt{a^2 + b^2}$.`],
          [md`$${t.m}\cos(\omega t${phs(-d)})$`, md`That takes the sine as $+j$. A sine's phasor is $-j$.`],
          [md`$${t.m}\cos(\omega t${phs(wrap(d + 180))})$`, md`That is $180°$ off. Sketch the phasor to find its quadrant.`],
          [md`$${t.m}\cos(\omega t${phs(sw)})$`, md`That swaps the two legs: the angle's tangent is imaginary over real.`]],
        md`Phasor: $${sa < 0 ? '-' : ''}${t.at} ${sb > 0 ? '-' : '+'} j${co(t.bt)}$ (the sine gives $-j$). Size $${t.m}$, angle $${dg(d)}$ from a sketch.`);
    },
    // the average of a product
    () => {
      const A = pick([2, 4, 6, 10]), B = pick([1, 2, 3, 5]);
      let ta, tb, D;
      do {
        ta = pick([-60, -30, 0, 30, 60, 90]); tb = pick([-60, -30, 0, 30, 60, 90, 120]); D = wrap(ta - tb);
      } while (![0, 60, 120, 180, 90].includes(Math.abs(D)) || Math.abs(Math.cos((ta + tb) * DEG) - Math.cos(D * DEG)) < 1e-9);
      const v = 0.5 * A * B * Math.cos(D * DEG), S = ta + tb;
      return MC('The average of a product', md`$a = ${A}\cos(\omega t${phs(ta)})$ and $b = ${B}\cos(\omega t${phs(tb)})$. The average $\langle ab\rangle$ is…`, nf(v),
        [[nf(A * B * Math.cos(D * DEG)), md`That leaves out the $\tfrac12$ from the product-to-sum identity.`],
          [nf(0.5 * A * B), md`That ignores the phase difference. Only in-phase signals give $\tfrac12AB$.`],
          [nf(0.5 * A * B * Math.cos(S * DEG)), md`That uses the **sum** of the phases, $${dg(S)}$: no conjugate. The average needs the difference.`],
          [nf(0.5 * A * B * Math.sin(D * DEG)), md`That uses the sine of the phase difference. The real part of $e^{j\psi}$ is $\cos\psi$.`],
          [nf(A * B), md`That is the product of the peaks, with no $\tfrac12$ and no phase.`]],
        md`$\tfrac12\Re\{\tilde A\tilde B^*\} = \tfrac12(${A})(${B})\cos(${dg(ta)} - (${dg(tb)})) = ${A * B / 2}\cos(${dg(D)}) = ${p(+v.toFixed(3))}$.`);
    },
    // the average of a square
    () => {
      let a, b;
      do { a = pick([-3, -2, -1, 1, 2, 3, 4]); b = pick([-4, -3, -2, -1, 1, 2, 3]); } while (a + b === 0 || Math.abs(a) === Math.abs(b));
      const ph = `${a} ${b < 0 ? '-' : '+'} j${Math.abs(b)}`, v = (a * a + b * b) / 2;
      return MC('The average of a square', md`A signal has the phasor $${ph}$. Its mean square $\langle a^2\rangle$ is…`, nf(v),
        [[nf(a * a + b * b), md`That is $|\tilde A|^2$. The average of $\cos^2$ is $\tfrac12$.`],
          [nf(a * a / 2), md`That keeps only the real part. Both parts belong to the size: $|\tilde A|^2 = a^2 + b^2$.`],
          [nf((a + b) ** 2 / 2), md`That squares $a + b$. The size squared is $a^2 + b^2$.`],
          [nf(Math.hypot(a, b) / 2), md`That is half the peak, not half the peak squared.`]],
        md`$\langle a^2\rangle = \tfrac12|\tilde A|^2 = \tfrac12(${a * a} + ${b * b}) = ${p(v)}$.`);
    },
    // Euler, the identities the exam prints
    () => {
      const [q, r, w, s] = pick([
        [md`$e^{j\theta} + e^{-j\theta}$ equals…`, md`$2\cos\theta$`, [[md`$2j\sin\theta$`, md`That is the difference $e^{j\theta} - e^{-j\theta}$.`], [md`$2\sin\theta$`, md`The imaginary parts $\pm j\sin\theta$ cancel; the real parts $\cos\theta$ add.`], [md`$0$`, md`They are conjugates, not opposites: their real parts add.`], [md`$2e^{j\theta}$`, md`That treats $e^{-j\theta}$ as if it were $e^{j\theta}$.`]], md`$(\cos\theta + j\sin\theta) + (\cos\theta - j\sin\theta) = 2\cos\theta$.`],
        [md`$e^{j\theta} - e^{-j\theta}$ equals…`, md`$2j\sin\theta$`, [[md`$2\cos\theta$`, md`That is the sum $e^{j\theta} + e^{-j\theta}$.`], [md`$2\sin\theta$`, md`The $j$ stays: the imaginary parts $+j\sin\theta$ and $-(-j\sin\theta)$ add.`], [md`$-2j\sin\theta$`, md`That is $e^{-j\theta} - e^{j\theta}$, the other order.`], [md`$0$`, md`The real parts cancel, but the imaginary parts add.`]], md`$(\cos\theta + j\sin\theta) - (\cos\theta - j\sin\theta) = 2j\sin\theta$.`],
        [md`$e^{j\pi}$ equals…`, md`$-1$`, [[md`$1$`, md`That is $e^{j2\pi}$, a full turn.`], [md`$j$`, md`That is $e^{j\pi/2}$, a quarter turn.`], [md`$-j$`, md`That is $e^{-j\pi/2}$.`]], md`$\cos\pi + j\sin\pi = -1 + 0 = -1$: a half turn.`],
        [md`$e^{-j\pi/2}$ equals…`, md`$-j$`, [[md`$j$`, md`That is $e^{+j\pi/2}$.`], [md`$-1$`, md`That is $e^{\pm j\pi}$, a half turn.`], [md`$1$`, md`That is $e^{j0}$.`]], md`$\cos(-\pi/2) + j\sin(-\pi/2) = 0 - j = -j$.`],
        [md`$1/j$ equals…`, md`$-j$`, [[md`$j$`, md`$j\cdot j = -1$, not 1.`], [md`$-1$`, md`$j\cdot(-1) = -j$, not 1.`], [md`$1$`, md`$j\cdot1 = j$, not 1.`]], md`$j\cdot(-j) = -j^2 = 1$, so $1/j = -j$. Dividing by $j$ turns an arrow $90°$ clockwise.`],
        [md`$e^{j\pi/2}\,e^{-j\beta z}$ equals…`, md`$je^{-j\beta z}$`, [[md`$-je^{-j\beta z}$`, md`$e^{+j\pi/2} = +j$.`], [md`$e^{-j(\beta z + \pi/2)}$`, md`The exponents add: $j\pi/2 - j\beta z = -j(\beta z - \pi/2)$, not $-j(\beta z + \pi/2)$.`], [md`$-e^{-j\beta z}$`, md`$e^{j\pi/2}$ is a quarter turn, $j$, not a half turn.`]], md`$e^{j\pi/2} = j$, so the product is $je^{-j\beta z}$.`],
      ]);
      return MC('Euler in one line', q, r, w, s);
    },
  ]);

  // ---------------------------------------------------------------- level 2: a sum of two sinusoids
  GENS.w1p_sum = () => {
    let A, ph, sig, how, peaks;
    const kind = pick(['cs', 'cc', 'eq']);
    if (kind === 'cs') {
      const t = pick(SUMS), sa = pick([1, -1]), sb = pick([1, -1]);
      sig = `${sa < 0 ? '-' : ''}${co(t.at)}\\cos\\omega t ${sb < 0 ? '-' : '+'} ${co(t.bt)}\\sin\\omega t`;
      const re = sa * t.a, im = -sb * t.b;
      A = Math.hypot(re, im); ph = Math.atan2(im, re) / DEG; peaks = t.a + t.b;
      how = md`
        **Step 1: each phasor.** The cosine gives $${sa < 0 ? '-' : ''}${t.at}$. The sine ${sb < 0 ? 'has a minus sign, so it gives $+j' : 'gives $-j'}${co(t.bt)}$.

        **Step 2: add them.**
        $$\tilde X = ${sa < 0 ? '-' : ''}${t.at} ${sb > 0 ? '-' : '+'} j${co(t.bt)}$$
      `;
    } else if (kind === 'cc') {
      // two equal cosines
      const C0 = pick([2, 3, 4, 5]);
      let t1, t2;
      do { t1 = pick([-90, -60, -30, 0, 30, 60, 90, 120]); t2 = pick([-90, -60, -30, 0, 30, 60, 90, 120]); } while (![60, 90, 120].includes(Math.abs(t1 - t2)) || (((t1 + t2) / 2) % 90 === 0));
      sig = `${C0}\\cos(\\omega t${phs(t1)}) + ${C0}\\cos(\\omega t${phs(t2)})`;
      const re = C0 * (Math.cos(t1 * DEG) + Math.cos(t2 * DEG)), im = C0 * (Math.sin(t1 * DEG) + Math.sin(t2 * DEG));
      A = Math.hypot(re, im); ph = Math.atan2(im, re) / DEG; peaks = 2 * C0;
      how = md`
        **Step 1: each phasor.** $${pol(C0, t1)}$ and $${pol(C0, t2)}$.

        **Step 2: add them in rectangular form.** Real parts: $${C0}\cos(${dg(t1)}) + ${C0}\cos(${dg(t2)}) = ${f(re)}$. Imaginary parts: $${C0}\sin(${dg(t1)}) + ${C0}\sin(${dg(t2)}) = ${f(im)}$.
        $$\tilde X = ${f(re)} ${im < 0 ? '-' : '+'} j${f(Math.abs(im))}$$
        (Shortcut: two equal arrows $${dg(Math.abs(t1 - t2))}$ apart add to $2(${C0})\cos(${dg(Math.abs(t1 - t2) / 2)})$, pointing halfway between them, at $${dg((t1 + t2) / 2)}$.)
      `;
    } else {
      // A cos(wt + th) + A sin(wt + th) = A sqrt2 cos(wt + th - 45)
      const C0 = pick([1, 2, 3, 4]), th = pick([0, 15, 30, 60, 75, 90, 120, -30, -60]);
      sig = `${co(String(C0))}\\cos(\\omega t${phs(th)}) + ${co(String(C0))}\\sin(\\omega t${phs(th)})`;
      A = C0 * Math.SQRT2; ph = th - 45; peaks = 2 * C0;
      how = md`
        **Step 1: each phasor.** The cosine gives $${pol(C0, th)}$. The sine gives $-j$ times that.

        **Step 2: add them.** Factor out the common $${pol(C0, th)}$:
        $$\tilde X = ${pol(C0, th)}\,(1 - j)$$
        And $1 - j = \sqrt2\,e^{-j45°}$, so $\tilde X = ${C0}\sqrt2\,${ex(wrap(th - 45)) || ''}$.
      `;
    }
    ph = wrap(ph);
    const x0 = A * Math.cos(ph * DEG), tp = (((-ph % 360) + 360) % 360) / 360;
    return {
      title: 'Two sinusoids, one arrow',
      q: md`$x(t) = ${sig}$ V. Write it as one sinusoid $x(t) = C\cos(\omega t + \psi)$ with $C > 0$ and $-180° < \psi \le 180°$. Then find $x(0)$ and the first time $t \ge 0$ at which $x$ peaks, as a fraction of the period $T$.`,
      parts: [
        Object.assign(N('C', A, 'V'), { traps: [{ v: peaks, msg: 'That adds the two peaks. They are not in phase, so add the arrows.' }] }),
        Object.assign(N('\\psi', ph, '°'), { traps: [{ v: -ph, msg: 'The sign is flipped. Check the sine: its phasor is −j times a cosine’s.' }] }),
        N('x(0)', x0, 'V'),
        N('t_{\\text{peak}}/T', tp, ''),
      ],
      hints: [md`$\cos\to1$, $\sin\to-j$. Add the two phasors as complex numbers.`, md`$C = |\tilde X|$ and $\psi$ is its angle (sketch it). The peak comes when $\omega t + \psi = 0$ or $360°$.`],
      sol: md`
        ${how}
        **Step 3: size and angle.** Sketch the point to get the quadrant.
        $$C = |\tilde X| = ${f(A)}\ \text{V}, \qquad \psi = ${f(ph)}°$$
        So $x(t) = ${f(A)}\cos(\omega t${phs(ph)})$ V.

        **Step 4: the value at $t = 0$** is the real part of $\tilde X$:
        $$x(0) = ${f(A)}\cos(${f(ph)}°) = ${f(x0)}\ \text{V}$$
        **Step 5: the first peak.** The cosine peaks when its argument is a multiple of $360°$. The first one with $t \ge 0$ has $\omega t = ${f(tp * 360)}°$, so
        $$\frac{t_{\text{peak}}}{T} = \frac{${f(tp * 360)}°}{360°} = ${f(tp)}$$
        **Check.** The peak $C = ${f(A)}$ is at most the sum of the two peaks, ${p(+peaks.toFixed(3))}, as it must be.
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: the average of a product, as a power density
  GENS.w1p_avg = () => {
    const E = pick([2, 4, 6, 10, 20]), H = pick([0.1, 0.2, 0.5, 1]);
    let kE, kH, t1, t2, pE, pH, D;
    do {
      kE = pick(['cos', 'sin']); kH = pick(['cos', 'sin']);
      t1 = pick([-60, -30, 0, 30, 45, 60, 90]); t2 = pick([-60, -45, -30, 0, 30, 60, 90]);
      pE = t1 - (kE === 'sin' ? 90 : 0); pH = t2 - (kH === 'sin' ? 90 : 0); D = wrap(pE - pH);
    } while (![30, 45, 60, 120, 135, 150].includes(Math.abs(D)));
    const avg = 0.5 * E * H * Math.cos(D * DEG), mx = 0.5 * E * H * (Math.cos(D * DEG) + 1), mn = 0.5 * E * H * (Math.cos(D * DEG) - 1);
    const naive = wrap(t1 - t2);
    const dTraps = [{ v: -D, msg: 'That is the phase of H minus the phase of E. The question asks for E minus H.' }];
    if (Math.abs(naive - D) > 0.5 && Math.abs(naive + D) > 0.5) dTraps.push({ v: naive, msg: 'That compares the written angles directly. Turn each sine into a cosine first: subtract 90°.' });
    return {
      title: 'The average power at a point',
      q: md`At one point in space, $E_x(t) = ${E}${"\\" + kE}(\omega t${phs(t1)})$ V/m and $H_y(t) = ${H}${"\\" + kH}(\omega t${phs(t2)})$ A/m. The power density along $\hat z$ is $S_z = E_xH_y$. Find the phase difference (phase of $\tilde E_x$ minus phase of $\tilde H_y$, between $-180°$ and $180°$), the time average $\langle S_z\rangle$, and the largest and smallest values $S_z(t)$ reaches.`,
      parts: [
        Object.assign(N('\\theta_E - \\theta_H', D, '°'), { traps: dTraps }),
        Object.assign(N('\\langle S_z\\rangle', avg, 'W/m²'), { traps: [{ v: 2 * avg, msg: 'That leaves out the ½.' }, { v: 0.5 * E * H * Math.cos((pE + pH) * DEG), msg: 'That uses the sum of the phases: no conjugate.' }] }),
        N('\\max S_z', mx, 'W/m²'),
        N('\\min S_z', mn, 'W/m²'),
      ],
      hints: [md`Phasors: a cosine keeps its angle, a sine loses $90°$. Then $\langle S_z\rangle = \tfrac12\Re\{\tilde E_x\tilde H_y^*\}$.`, md`The product is $\tfrac12EH\cos(\theta_E - \theta_H) + \tfrac12EH\cos(2\omega t + \cdots)$. The second term swings between $\pm\tfrac12EH$.`],
      sol: md`
        **Step 1: phasors.** ${kE === 'sin' ? md`$E_x$ is a sine, so subtract $90°$: ` : md`$E_x$ is a cosine: `}$\tilde E_x = ${pol(E, wrap(pE))}$ V/m. ${kH === 'sin' ? md`$H_y$ is a sine, so subtract $90°$: ` : md`$H_y$ is a cosine: `}$\tilde H_y = ${pol(H, wrap(pH))}$ A/m.

        **Step 2: the phase difference.**
        $$\theta_E - \theta_H = ${dg(wrap(pE))} - (${dg(wrap(pH))}) = ${dg(D)}$$
        **Step 3: the average.** Conjugate $\tilde H_y$, multiply, take half the real part:
        $$\langle S_z\rangle = \tfrac12\Re\{\tilde E_x\tilde H_y^*\} = \tfrac12(${E})(${H})\cos(${dg(D)})$$
        $$\langle S_z\rangle = ${f(avg)}\ \text{W/m}^2$$
        **Step 4: the swing.** From the product-to-sum identity, $S_z(t) = \tfrac12EH\cos(\theta_E - \theta_H) + \tfrac12EH\cos(2\omega t + \theta_E + \theta_H)$. The second term swings between $\pm\tfrac12EH = \pm${f(0.5 * E * H)}$:
        $$\max S_z = ${f(avg)} + ${f(0.5 * E * H)} = ${f(mx)}\ \text{W/m}^2$$
        $$\min S_z = ${f(avg)} - ${f(0.5 * E * H)} = ${f(mn)}\ \text{W/m}^2$$
        ${mn < 0 ? '**Read it.** The minimum is negative: for part of each cycle, energy flows back toward $-z$. The average is what is left over.' : ''}
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: a vector phasor
  GENS.w1p_vec = () => {
    const u = pick(AX), [c1, c2] = U.shuffle(AX.filter((a) => a !== u)), s = pick([1, -1]);
    const mode = pick(['circle', 'line', 'ellipse']);
    let A, B, k2, t1, t2, p1, p2, D;
    for (let i = 0; i < 400; i++) {
      A = pick([1, 2, 3, 4, 5]); B = mode === 'circle' ? A : pick([1, 2, 3, 4, 5]);
      k2 = pick(['cos', 'sin']); t1 = pick([-60, -30, 30, 60, 90, 120]); t2 = pick([-60, -30, 0, 30, 60, 90, 120]);
      p1 = t1; p2 = wrap(t2 - (k2 === 'sin' ? 90 : 0)); D = wrap(p2 - p1);
      const ok = mode === 'circle' ? Math.abs(D) === 90 : mode === 'line' ? Math.abs(D) === 180 : (Math.abs(D) !== 180 && D !== 0 && !(A === B && Math.abs(D) === 90));
      if (ok && Math.abs(Math.abs(p2) - 90) > 1e-9 && p1 % 180 !== 0) break;
    }
    const arg = `\\omega t ${s > 0 ? '-' : '+'} \\beta ${u}`;
    const ep = (sg) => `e^{${sg > 0 ? '-' : '+'}j\\beta ${u}}`;
    const vec = (a1, a2) => `(${pol(A, a1)}\\,\\hat ${c1} + ${pol(B, a2)}\\,\\hat ${c2})`;
    const alt2 = wrap(t2 + (k2 === 'sin' ? 90 : -90));
    const y0 = B * Math.cos(p2 * DEG), x4 = -A * Math.sin(p1 * DEG);
    const shape = mode === 'circle' ? 0 : mode === 'line' ? 1 : 2;
    return {
      title: 'A field with two components',
      q: md`$\mathbf E = ${A}\cos(${arg}${phs(t1)})\,\hat ${c1} + ${B}${"\\" + k2}(${arg}${phs(t2)})\,\hat ${c2}$ V/m.`,
      parts: [
        { lbl: md`$\Et$ is`, mc: [md`$${vec(p1, p2)}\,${ep(s)}$`, md`$${vec(p1, p2)}\,${ep(-s)}$`, md`$${vec(p1, alt2)}\,${ep(s)}$`, md`$${vec(-p1, -p2)}\,${ep(s)}$`], a: 0,
          why: [null, md`The exponent copies the sign of $\beta ${u}$ in the cosine.`, k2 === 'sin' ? md`That adds $90°$ for the sine. A sine is a late cosine: subtract $90°$.` : md`That subtracts $90°$ from a cosine. Only a sine needs that.`, md`Both phases have the wrong sign. The angle inside each cosine is the angle of its phasor.`] },
        Object.assign(N(`\\text{phase of }\\tilde E_${c2} - \\text{phase of }\\tilde E_${c1}`, D, '°'), { traps: k2 === 'sin' ? [{ v: wrap(t2 - t1), msg: 'That compares the written angles. Turn the sine into a cosine first: subtract 90°.' }] : [] }),
        { lbl: md`At a fixed point, the tip of $\mathbf E$ traces`, mc: [md`a circle`, md`a line`, md`an ellipse`], a: shape,
          why: [md`A circle needs equal amplitudes **and** a $90°$ difference.`, md`A line needs the two phases to be equal or $180°$ apart.`, md`An ellipse is what you get otherwise: unequal amplitudes, or a difference other than $0°$, $90°$, $180°$.`].map((w, i) => (i === shape ? null : w)) },
        N(`E_${c2}\\text{ at }${u} = 0,\\ t = 0`, y0, 'V/m'),
        N(`E_${c1}\\text{ at }${u} = 0,\\ t = T/4`, x4, 'V/m'),
      ],
      hints: [md`Each component gets its own phasor. $\cos\to$ its angle; $\sin\to$ its angle minus $90°$.`, md`At $t = 0$ the field is $\Re\{\Et\}$; at $t = T/4$ it is $\Re\{j\Et\}$.`],
      sol: md`
        **Step 1: the $\hat ${c1}$ part** is a cosine: $\tilde E_${c1} = ${pol(A, p1)}\,${ep(s)}$.

        **Step 2: the $\hat ${c2}$ part** is a ${k2 === 'sin' ? md`sine, so subtract $90°$: $${dg(t2)} - 90° = ${dg(p2)}$` : md`cosine, so it keeps its angle $${dg(p2)}$`}. $\tilde E_${c2} = ${pol(B, p2)}\,${ep(s)}$.

        **Step 3: assemble.** The exponent copies the sign of $\beta ${u}$, so the wave travels toward $${s > 0 ? '+' : '-'}${u}$:
        $$\Et = ${vec(p1, p2)}\,${ep(s)}$$
        **Step 4: the phase difference.**
        $$${dg(p2)} - (${dg(p1)}) = ${dg(D)}$$
        **Step 5: the shape.** ${mode === 'circle' ? md`Equal amplitudes ($${A}$) and $90°$ apart: a circle.` : mode === 'line' ? md`The components are $180°$ apart: they always have opposite signs, so the field swings along one line.` : md`${A === B ? md`Equal amplitudes, but $${dg(Math.abs(D))}$ apart, not $90°$` : md`Unequal amplitudes ($${A}$ and $${B}$)`}, and not in phase: an ellipse.`}

        **Step 6: the values.** At $${u} = 0$, $t = 0$, each component is the real part of its phasor:
        $$E_${c2} = ${B}\cos(${dg(p2)}) = ${f(y0)}\ \text{V/m}$$
        At $t = T/4$, multiply by $e^{j90°} = j$ first; $\Re\{jAe^{j\phi}\} = -A\sin\phi$:
        $$E_${c1} = -${A}\sin(${dg(p1)}) = ${f(x4)}\ \text{V/m}$$
        **Check** against the original: at $${u} = 0$, $\omega t = 90°$, $${A}\cos(90°${phs(t1)}) = ${f(x4)}$ ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: d/dt -> j omega, the displacement current
  GENS.w1p_deriv = () => {
    const [fr, ftex] = pick([[180e6, '180\\ \\text{MHz}'], [360e6, '360\\ \\text{MHz}'], [900e6, '900\\ \\text{MHz}'], [1.8e9, '1.8\\ \\text{GHz}']]);
    const er = pick([1, 2, 4, 9]), E0 = pick([5, 10, 20, 50, 100]), phi = pick([30, 45, 60, -30, -45, -60, 120, -120, 150]);
    const w = 2 * Math.PI * fr, we = w * er * 1e-9 / (36 * Math.PI), J = we * E0, ph = wrap(phi + 90), J0 = -J * Math.sin(phi * DEG);
    return {
      title: 'The displacement current, by jω',
      q: md`In a lossless dielectric with $\epsilon_r = ${er}$, a wave has $\mathbf E = ${E0}\cos(\omega t - \beta z${phs(phi)})\,\hat x$ V/m at $f = ${ftex}$. The displacement current density is $\mathbf J_d = \epsilon\,\partial\mathbf E/\partial t$. At $z = 0$, find the amplitude and phase of $\tilde J_d$, and $J_d$ at $t = 0$. Use $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$ F/m.`,
      parts: [
        Object.assign(N('|\\tilde J_d|', J, 'A/m²'), { traps: [{ v: J / (2 * Math.PI), msg: 'That uses f in place of ω = 2πf.' }, { v: J / er, msg: 'That uses ε₀. The material has ε = εᵣε₀.' }] }),
        Object.assign(N('\\text{phase of }\\tilde J_d', ph, '°'), { traps: [{ v: wrap(phi - 90), msg: 'That subtracts 90°, which an integral would do. A derivative multiplies by j: +90°.' }, { v: phi, msg: 'A derivative turns the arrow by 90°.' }] }),
        N('J_d(z = 0, t = 0)', J0, 'A/m²'),
        { lbl: md`The time average $\langle J_dE_x\rangle$ at $z = 0$ is`, mc: [md`zero`, md`positive`, md`negative`], a: 0,
          why: [null, md`$\tilde J_d$ is $90°$ ahead of $\tilde E_x$, and $\cos90° = 0$. Displacement current stores energy and gives it back; it does no net work.`, md`$\tfrac12\Re\{\tilde J_d\tilde E_x^*\} = \tfrac12\Re\{j\omega\epsilon|\tilde E_x|^2\} = 0$: purely imaginary, so no average.`] },
      ],
      hints: [md`$\partial/\partial t\to j\omega$, so $\tilde J_d = j\omega\epsilon\tilde E_x$.`, md`$\omega\epsilon = 2\pi f\epsilon_r\epsilon_0 = f\epsilon_r\times10^{-9}/18$.`],
      sol: md`
        **Step 1: the phasor of $\mathbf E$ at $z = 0$.**
        $$\tilde E_x(0) = ${pol(E0, phi)}\ \text{V/m}$$
        **Step 2: the derivative is $\times j\omega$.**
        $$\tilde J_d = j\omega\epsilon\,\tilde E_x$$
        **Step 3: $\omega\epsilon$.** With $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$, the $\pi$ cancels:
        $$\omega\epsilon = 2\pi f\cdot${er}\cdot\frac{10^{-9}}{36\pi} = \frac{f\cdot${er}\times10^{-9}}{18}$$
        $$\omega\epsilon = ${f(we)}\ \text{S/m}$$
        **Step 4: size and phase.** $j = e^{j90°}$ adds $90°$:
        $$\tilde J_d = (${f(we)})(${E0})\,e^{j(${dg(phi)} + 90°)}$$
        $$\tilde J_d = ${f(J)}\,${ex(ph) || ''}\ \text{A/m}^2$$
        **Step 5: at $t = 0$** take the real part:
        $$J_d = ${f(J)}\cos(${dg(ph)}) = ${f(J0)}\ \text{A/m}^2$$
        **Step 6: the average work.** $\tfrac12\Re\{\tilde J_d\tilde E_x^*\} = \tfrac12\Re\{j\omega\epsilon|\tilde E_x|^2\} = 0$. The two are $90°$ apart: the displacement current only stores and returns energy.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3: two waves going opposite ways
  GENS.w1p_standing = () => {
    const E0 = pick([2, 3, 4, 5, 10]), kind = pick(['cc+', 'cc-', 'ss+', 'ss-']);
    const [fMHz, lam, bt] = pick([[150, 2, '\\pi'], [300, 1, '2\\pi'], [600, 0.5, '4\\pi']]);
    const beta = 2 * Math.PI / lam;
    const k = pick([8, 6, 12]), z1 = lam / k, bz = 2 * Math.PI / k;  // beta z1 = 45, 60 or 30 degrees
    const tk = pick([8, 6, 12]), wt = 2 * Math.PI / tk;
    const fn = kind[0] === 'c' ? '\\cos' : '\\sin', sg = kind[2];
    // the four simplified phasors and time forms, all with the same 2E0
    const P = {
      'cc+': md`$${2 * E0}\cos(${bt} z)$`, 'cc-': md`$-j${2 * E0}\sin(${bt} z)$`, 'ss+': md`$-j${2 * E0}\cos(${bt} z)$`, 'ss-': md`$-${2 * E0}\sin(${bt} z)$`,
    };
    const amp = { 'cc+': Math.cos(bz), 'cc-': Math.sin(bz), 'ss+': Math.cos(bz), 'ss-': Math.sin(bz) }[kind] * 2 * E0;
    const tf = { 'cc+': Math.cos(wt), 'cc-': Math.sin(wt), 'ss+': Math.sin(wt), 'ss-': -Math.cos(wt) }[kind];
    const val = amp * tf, ms = 0.5 * amp * amp, nul = (kind === 'cc+' || kind === 'ss+') ? lam / 4 : lam / 2;
    const timeForm = { 'cc+': md`${2 * E0}\cos(${bt} z)\cos\omega t`, 'cc-': md`${2 * E0}\sin(${bt} z)\sin\omega t`, 'ss+': md`${2 * E0}\cos(${bt} z)\sin\omega t`, 'ss-': md`-${2 * E0}\sin(${bt} z)\cos\omega t` }[kind];
    const whyP = {
      'cc+': md`That is the phasor of $\cos(\omega t - \beta z) + \cos(\omega t + \beta z)$: two cosines added.`,
      'cc-': md`That is the phasor of $\cos(\omega t - \beta z) - \cos(\omega t + \beta z)$: two cosines subtracted.`,
      'ss+': md`That is the phasor of $\sin(\omega t - \beta z) + \sin(\omega t + \beta z)$: two sines added. Sines bring a factor $-j$.`,
      'ss-': md`That is the phasor of $\sin(\omega t - \beta z) - \sin(\omega t + \beta z)$: two sines subtracted, $-j\cdot(-2j\sin\beta z)$.`,
    };
    const keys = ['cc+', 'cc-', 'ss+', 'ss-'];
    const steps = {
      'cc+': md`$$\tilde E_x = ${E0}(e^{-j${bt} z} + e^{+j${bt} z})$$
        Euler: $e^{j\theta} + e^{-j\theta} = 2\cos\theta$:
        $$\tilde E_x = ${2 * E0}\cos(${bt} z)$$
        A real phasor is a cosine in time.`,
      'cc-': md`$$\tilde E_x = ${E0}(e^{-j${bt} z} - e^{+j${bt} z})$$
        Euler: $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$, and here the order is reversed, so a minus sign appears:
        $$\tilde E_x = -j${2 * E0}\sin(${bt} z)$$
        A factor $-j$ is a sine in time.`,
      'ss+': md`Each sine's phasor carries $-j$:
        $$\tilde E_x = -j${E0}(e^{-j${bt} z} + e^{+j${bt} z})$$
        Euler: the bracket is $2\cos(${bt} z)$:
        $$\tilde E_x = -j${2 * E0}\cos(${bt} z)$$
        A factor $-j$ is a sine in time.`,
      'ss-': md`Each sine's phasor carries $-j$:
        $$\tilde E_x = -j${E0}(e^{-j${bt} z} - e^{+j${bt} z})$$
        The bracket is $-2j\sin(${bt} z)$, and $(-j)(-2j) = 2j^2 = -2$:
        $$\tilde E_x = -${2 * E0}\sin(${bt} z)$$
        A real phasor is a cosine in time, here with a minus sign.`,
    };
    return {
      title: 'Two waves, one standing wave',
      q: md`In free space at $f = ${fMHz}$ MHz, $E_x(z,t) = ${E0}${fn}(\omega t - ${bt} z) ${sg} ${E0}${fn}(\omega t + ${bt} z)$ V/m, with $z$ in meters. (a) Simplify the total phasor $\tilde E_x(z)$. (b) Find the amplitude of $E_x$ at $z_1 = \tfrac{1}{${k / lam}}$ m. (c) Find the smallest $z > 0$ where $E_x$ is zero at every instant. (d) Find $E_x(z_1, t)$ at $t = T/${tk}$. (e) Find the time average of $E_x^2$ at $z_1$.`,
      parts: [
        { lbl: md`(a) $\tilde E_x(z)$, in V/m`, mc: keys.map((x) => P[x]), a: keys.indexOf(kind), why: keys.map((x) => (x === kind ? null : whyP[x])) },
        Object.assign(N('(b)\\ |\\tilde E_x(z_1)|', amp, 'V/m'), { traps: [{ v: 2 * E0, msg: 'That is the largest amplitude anywhere. At z₁ the cos or sin factor is less than 1.' }] }),
        Object.assign(N('(c)\\ z_{\\text{null}}', nul, 'm'), { traps: [{ v: nul === lam / 4 ? lam / 2 : lam / 4, msg: 'Check which function of βz the amplitude has: cos βz vanishes at λ/4, sin βz at λ/2.' }] }),
        N('(d)\\ E_x(z_1, T/' + tk + ')', val, 'V/m'),
        Object.assign(N('(e)\\ \\langle E_x^2\\rangle\\text{ at }z_1', ms, 'V²/m²'), { traps: [{ v: amp * amp, msg: 'That is |Ẽ|². The average of a squared cosine is half of it.' }] }),
      ],
      hints: [md`Write each wave as a phasor: $e^{-j\beta z}$ toward $+z$, $e^{+j\beta z}$ toward $-z$; a sine carries $-j$. Then use $e^{j\theta} \pm e^{-j\theta}$.`, md`$\beta = 2\pi/\lambda$ with $\lambda = c/f = ${lam}$ m. The amplitude at a point is $|\tilde E_x|$; the mean square is $\tfrac12|\tilde E_x|^2$.`],
      sol: md`
        **Step 0: the numbers.** $\lambda = c/f = (3\times10^8)/(${fMHz}\times10^6) = ${lam}$ m, so $\beta = 2\pi/\lambda = ${bt}$ rad/m.

        **(a) Step 1: one phasor per wave.** The first wave travels toward $+z$ ($e^{-j${bt} z}$), the second toward $-z$ ($e^{+j${bt} z}$).
        ${steps[kind]}

        Back in time:
        $$E_x(z,t) = ${timeForm}$$
        **(b) Step 2: the amplitude at $z_1$.** $\beta z_1 = ${bt}\cdot\tfrac{1}{${k / lam}} = ${dg(360 / k)}$:
        $$|\tilde E_x(z_1)| = ${2 * E0}\,|${kind === 'cc+' || kind === 'ss+' ? '\\cos' : '\\sin'}(${dg(360 / k)})| = ${f(amp)}\ \text{V/m}$$
        **(c) Step 3: the first null.** ${nul === lam / 4 ? md`$\cos(\beta z) = 0$ first at $\beta z = \pi/2$, so $z = \lambda/4 = ${p(nul)}$ m.` : md`$\sin(\beta z) = 0$ at $\beta z = \pi$ (the next zero after $z = 0$), so $z = \lambda/2 = ${p(nul)}$ m. (At $z = 0$ it is zero too, but the question asks for $z > 0$.)`}

        **(d) Step 4: one instant.** At $t = T/${tk}$, $\omega t = ${dg(360 / tk)}$:
        $$E_x = ${f(amp)}\times(${f(tf)}) = ${f(val)}\ \text{V/m}$$
        **(e) Step 5: the mean square.** $\langle E_x^2\rangle = \tfrac12|\tilde E_x(z_1)|^2$:
        $$\langle E_x^2\rangle = \tfrac12(${f(amp)})^2 = ${f(ms)}\ \text{V}^2/\text{m}^2$$
        **Speed path.** Two equal waves going opposite ways always make $2E_0\cos\beta z$ or $2E_0\sin\beta z$ (times $1$ or $-j$). Decide which by checking $z = 0$: there both waves have the same phase, so they add (cos) or cancel (sin).

        **Where points go.** Writing $e^{-j\beta z}$ for both waves; losing the $-j$ of a sine; leaving $e^{j\theta} + e^{-j\theta}$ unsimplified.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank (lesson 1)
  EM.BANK['w1-phasor'] = [
    Q(md`$e^{j\pi}$ equals…`, [md`$-1$`, md`$1$`, md`$j$`, md`$0$`], 0,
      [null, md`That is a full turn, $e^{j2\pi}$.`, md`That is a quarter turn, $e^{j\pi/2}$.`, md`$|e^{j\theta}| = 1$ for every $\theta$: it is never zero.`],
      md`$\cos\pi + j\sin\pi = -1$. A half turn. This is why a minus sign in front of a cosine is $e^{j180°}$.`),
    Q(md`The phasor of $\sin\omega t$ is…`, [md`$-j$`, md`$j$`, md`$1$`, md`$-1$`], 0,
      [null, md`$j$ belongs to $-\sin\omega t$, a quarter period early.`, md`1 belongs to $\cos\omega t$.`, md`$-1$ belongs to $-\cos\omega t$.`],
      md`$\sin\omega t = \cos(\omega t - 90°)$, and $e^{-j90°} = -j$.`),
    Q(md`$|(3 + 4j)\,e^{-j\beta z}|$ is…`, [md`$5$ at every $z$`, md`$5e^{-\beta z}$`, md`$7$`, md`$5\cos\beta z$`], 0,
      [null, md`$e^{-j\beta z}$ has size 1; only a real exponent like $e^{-\alpha z}$ shrinks a wave.`, md`That adds the parts. The size is $\sqrt{9 + 16}$.`, md`The size of a phasor is not its real part.`],
      md`$|3 + 4j| = 5$ and $|e^{-j\beta z}| = 1$. A lossless traveling wave has the same amplitude everywhere.`),
    Q(md`The phasor of $-5\sin(\omega t - \beta z)$ is…`, [md`$j5e^{-j\beta z}$`, md`$-j5e^{-j\beta z}$`, md`$-5e^{-j\beta z}$`, md`$j5e^{+j\beta z}$`], 0,
      [null, md`That is $+5\sin$. The minus sign in front flips $-j$ to $+j$.`, md`That reads the sine as a cosine.`, md`The exponent copies the $-\beta z$ in the argument.`],
      md`$\sin\to-j$, and the minus sign makes it $+j$: $j5e^{-j\beta z}$.`),
    Q(md`$\int\cos\omega t\,dt$ (no constant) has the phasor…`, [md`$-j/\omega$`, md`$j/\omega$`, md`$j\omega$`, md`$1/\omega$`], 0,
      [null, md`$1/j = -j$, not $j$.`, md`That is the phasor of the derivative.`, md`Dividing by $j$ also turns the arrow by $90°$.`],
      md`$1/(j\omega) = -j/\omega$, which is $\sin(\omega t)/\omega$ in time ✓.`),
    Q(md`Which pair of signals has a time-averaged product of zero?`, [md`$\cos\omega t$ and $\sin\omega t$`, md`$\cos\omega t$ and $\cos\omega t$`, md`$\cos\omega t$ and $-\cos\omega t$`, md`$\sin\omega t$ and $\sin\omega t$`], 0,
      [null, md`A signal times itself averages to $\tfrac12$.`, md`Opposite signals average to $-\tfrac12$, not zero.`, md`$\sin^2$ averages to $\tfrac12$.`],
      md`Phasors 1 and $-j$: $\tfrac12\Re\{1\cdot(-j)^*\} = \tfrac12\Re\{j\} = 0$. A quarter period apart.`),
    Q(md`$\tilde A = 2 + 2j$. The signal is…`, [md`$2\sqrt2\cos(\omega t + 45°)$`, md`$4\cos(\omega t + 45°)$`, md`$2\sqrt2\cos(\omega t - 45°)$`, md`$2\cos\omega t - 2\sin(\omega t + 45°)$`], 0,
      [null, md`That adds the parts. The size is $\sqrt{4 + 4}$.`, md`The imaginary part is positive, so the angle is positive.`, md`That mixes two forms. $a + jb\to a\cos\omega t - b\sin\omega t$, with no extra phase on the sine.`],
      md`Size $\sqrt8 = 2\sqrt2$, angle $45°$. Or: $2\cos\omega t - 2\sin\omega t$, the same signal.`),
    Q(md`The conjugate of $3e^{j40°}$ is…`, [md`$3e^{-j40°}$`, md`$-3e^{j40°}$`, md`$3e^{j220°}$`, md`$\tfrac13e^{-j40°}$`], 0,
      [null, md`That is the negative, a half turn.`, md`That is also the negative.`, md`That is the reciprocal.`],
      md`Conjugating flips the sign of the imaginary part, which flips the angle. The size stays.`),
    Q(md`The angle of $\tilde A\tilde B^*$ is…`, [md`$\theta_A - \theta_B$`, md`$\theta_A + \theta_B$`, md`$\theta_B - \theta_A$`, md`$\theta_A\theta_B$`], 0,
      [null, md`That is the angle of $\tilde A\tilde B$, with no conjugate.`, md`That is the angle of $\tilde A^*\tilde B$. Its real part is the same, but the angle is the opposite.`, md`Angles add or subtract when complex numbers multiply; they never multiply.`],
      md`$Ae^{j\theta_A}\cdot Be^{-j\theta_B} = ABe^{j(\theta_A - \theta_B)}$.`),
    Q(md`A wave $\Et = 4e^{-j\beta z}\hat x$. Compared with $z = 0$, the phasor at $z = \lambda/2$ is…`, [md`the negative: $-4\hat x$`, md`the same: $4\hat x$`, md`$-j4\hat x$`, md`zero`], 0,
      [null, md`That happens after a full wavelength, not half.`, md`That is a quarter wavelength.`, md`A traveling wave of constant amplitude is never zero in phasor form.`],
      md`$\beta\lambda/2 = \pi$, and $e^{-j\pi} = -1$.`),
    Q(md`$\tilde E_x(z) = 2e^{-(1 + j3)z}$. The wave…`, [md`travels toward $+z$ and its amplitude falls to $1/e$ in 1 m`, md`travels toward $-z$`, md`travels toward $+z$ and falls to $1/e$ in $\tfrac13$ m`, md`does not decay`], 0,
      [null, md`$e^{-j3z}$ has the minus sign of a wave toward $+z$.`, md`That uses $\beta = 3$ for the decay. $\alpha = 1$ is the real part.`, md`The real part of the exponent, $-z$, shrinks it.`],
      md`$e^{-z}$: $\alpha = 1$ Np/m, so $1/\alpha = 1$ m. $e^{-j3z}$: $\beta = 3$ rad/m toward $+z$.`),
    Q(md`$\Et(0) = j5\,\hat y$ V/m. What is $\mathbf E$ at that point at $t = 0$?`, [md`$0$`, md`$5\hat y$ V/m`, md`$-5\hat y$ V/m`, md`$j5\hat y$ V/m`], 0,
      [null, md`5 is the peak, reached a quarter period earlier or later.`, md`$-5$ is the value a quarter period later: $\Re\{j\cdot j5\} = -5$.`, md`A measured field is real. Take the real part.`],
      md`$\Re\{j5\} = 0$. A purely imaginary phasor means the field passes through zero at $t = 0$.`),
    Q(md`$\Et = 2e^{-j4z}\,\hat x$ V/m, with $z$ in meters. Then $\beta$ and $\lambda$ are…`, [md`$4$ rad/m and $\pi/2$ m`, md`$4$ rad/m and $4$ m`, md`$2$ rad/m and $\pi$ m`, md`$4\pi$ rad/m and $0.5$ m`], 0,
      [null, md`$\lambda = 2\pi/\beta$, not $\beta$ itself.`, md`2 is the amplitude.`, md`The $\pi$ is not in the exponent: $\beta = 4$.`],
      md`$\beta = 4$ rad/m, $\lambda = 2\pi/4 = \pi/2 \approx 1.57$ m.`),
    Q(md`$3\cos\omega t + 3\cos(\omega t + 180°)$ equals…`, [md`$0$`, md`$6\cos\omega t$`, md`$3\sqrt2\cos(\omega t + 90°)$`, md`$-6\cos\omega t$`], 0,
      [null, md`That adds the peaks of opposite signals.`, md`$180°$ is a half turn, not a quarter.`, md`That keeps only the second signal, twice.`],
      md`Phasors $3 + 3e^{j180°} = 3 - 3 = 0$. Two opposite arrows cancel.`),
    Q(md`Which quantity can you **not** read from a phasor $\tilde E_x(z)$ alone?`, [md`$\omega$`, md`the amplitude`, md`the phase at $z = 0$`, md`the direction of travel`], 0,
      [null, md`$|\tilde E_x|$ is the amplitude.`, md`The angle of $\tilde E_x(0)$ is the phase.`, md`The sign in $e^{\mp j\beta z}$ gives the direction.`],
      md`The phasor drops $e^{j\omega t}$, so $\omega$ must be stated separately (or found from $\beta$ and the medium).`),
    Q(md`$\tilde A = -4$. The signal is…`, [md`$4\cos(\omega t + 180°)$`, md`$4\cos\omega t$`, md`$-4\sin\omega t$`, md`$4\cos(\omega t - 90°)$`], 0,
      [null, md`That drops the minus sign.`, md`That is the signal of $4j$.`, md`That is $4\sin\omega t$, the signal of $-4j$.`],
      md`$-4 = 4e^{j180°}$, so $-4\cos\omega t = 4\cos(\omega t + 180°)$.`),
    Q(md`The time average of $a(t) = A\cos(\omega t + \phi)$ itself is…`, [md`$0$`, md`$A/2$`, md`$A\cos\phi$`, md`$A^2/2$`], 0,
      [null, md`$A/2$ is not the average of anything here.`, md`That is $a(0)$.`, md`That is the average of $a^2$.`],
      md`A cosine is as much above zero as below over a period. Only products (like $a^2$) have a nonzero average.`),
    Q(md`$\langle ab\rangle = \tfrac12\Re\{\tilde A\tilde B^*\}$. Is $\tfrac12\Re\{\tilde A^*\tilde B\}$ also correct?`, [md`Yes: it is the conjugate of $\tilde A\tilde B^*$, which has the same real part`, md`No: it gives the opposite sign`, md`No: it is the phasor of the $2\omega$ term`, md`Only if $\tilde A$ is real`], 0,
      [null, md`Conjugating flips the imaginary part only. The real part, which is what we keep, does not change.`, md`That is $\tilde A\tilde B$, with no conjugate.`, md`It holds for any phasors.`],
      md`$(\tilde A\tilde B^*)^* = \tilde A^*\tilde B$, and $\Re\{z^*\} = \Re\{z\}$.`),
    Q(md`$\cos(\omega t - \beta z)$ at a fixed time, as a function of $z$, repeats every…`, [md`$\lambda = 2\pi/\beta$`, md`$T = 2\pi/\omega$`, md`$\beta$`, md`$1/\beta$`], 0,
      [null, md`$T$ is the repeat in time at a fixed point.`, md`$\beta$ has units of rad/m, not m.`, md`One full cycle needs $\beta z = 2\pi$.`],
      md`$\beta z$ grows by $2\pi$ over $z = 2\pi/\beta = \lambda$.`),
    Q(md`$\tilde E_x = e^{-j\beta z} + e^{+j\beta z}$. In time, $E_x$ is…`, [md`$2\cos\beta z\cos\omega t$`, md`$2\cos(\omega t - \beta z)$`, md`$2\sin\beta z\sin\omega t$`, md`$0$`], 0,
      [null, md`That would be one wave of double amplitude. Here two waves travel opposite ways.`, md`That is the difference, $e^{-j\beta z} - e^{j\beta z}$, in time.`, md`They cancel only where $\cos\beta z = 0$.`],
      md`$e^{j\theta} + e^{-j\theta} = 2\cos\theta$, a real phasor: $2\cos\beta z\cos\omega t$. A standing wave.`),
    Q(md`$\Et = (\hat x + j\hat y)e^{-j\beta z}$. A quarter period after $t = 0$, at $z = 0$, $\mathbf E$ points along…`, [md`$-\hat y$`, md`$+\hat y$`, md`$+\hat x$`, md`$-\hat x$`], 0,
      [null, md`$\Re\{j(\hat x + j\hat y)\} = \Re\{j\hat x - \hat y\} = -\hat y$.`, md`That is the direction at $t = 0$.`, md`That would be half a period later.`],
      md`At $T/4$, multiply by $j$: $j\hat x + j^2\hat y = j\hat x - \hat y$; the real part is $-\hat y$.`),
    Q(md`On a line, $\tilde V = 10$ V and $\tilde I = 0.2e^{-j60°}$ A at one point. The average power flowing past is…`, [md`$0.5$ W`, md`$1$ W`, md`$0.87$ W`, md`$2$ W`], 0,
      [null, md`That leaves out the $\tfrac12$.`, md`That uses $\sin60°$.`, md`That is the product of the peaks.`],
      md`$\tfrac12\Re\{\tilde V\tilde I^*\} = \tfrac12(10)(0.2)\cos60° = 0.5$ W.`),
    Q(md`$e^{j(\omega t - \beta z)}$ written as "the field" is wrong because…`, [md`a field is real; the field is the real part, $\cos(\omega t - \beta z)$`, md`the sign of $\beta z$ must be $+$`, md`the phasor must contain $t$`, md`it should be $e^{-j(\omega t - \beta z)}$`], 0,
      [null, md`The sign is right for a wave toward $+z$.`, md`The phasor never contains $t$.`, md`The convention is $e^{+j\omega t}$; the real part would be the same anyway.`],
      md`$E = \Re\{\tilde E\,e^{j\omega t}\}$. Without $\Re$, half of the expression is imaginary and nothing you could measure.`),
  ];

  // ================================================================ lesson 2
  // unit-vector cross products: cross('x', 'y') = ['z', 1]
  const CR = { 'x,y': ['z', 1], 'y,z': ['x', 1], 'z,x': ['y', 1], 'y,x': ['z', -1], 'z,y': ['x', -1], 'x,z': ['y', -1] };
  const cross = (a, b) => CR[`${a},${b}`];
  const sgn = (s) => (s > 0 ? '+' : '-');

  // E, H and the direction of travel
  function triadFig() {
    const g = PF.fig({ alt: 'E along x to the right, H along y upward, and the direction of travel z coming out of the page at the origin; E cross H points along the travel' });
    const ox = 110, oy = 120, L = 112;
    g.arrow(ox, oy, ox + L, oy, { cls: 'thick', hs: 9 });
    g.arrow(ox, oy, ox, oy - 90, { cls: 'thick', hs: 9 });
    g.odot(ox, oy, 8);
    g.label(ox + L + 6, oy, '\\tilde{\\mathbf E}\\ (\\hat x)', 'l');
    g.label(ox + 10, oy - 78, '\\tilde{\\mathbf H}\\ (\\hat y)', 'l');
    g.track(ox - 20, oy - 112, ox + 20, oy - 100);
    g.label(ox, oy + 16, '\\hat k = \\hat z\\ \\text{(out of the page)}', 't', 'small');
    return g.svg();
  }
  // the tip of (y - jz) at x = 0 over one period
  function circFig() {
    const g = PF.fig({ alt: 'the plane x = 0 with y to the right and z up; the tip of E goes around a circle: along +y at t = 0, +z at T/4, minus y at T/2, minus z at 3T/4, counterclockwise; the travel direction +x points out of the page' });
    const cx = 150, cy = 118, r = 66;
    g.line(cx - r - 30, cy, cx + r + 30, cy, { cls: 'dim' });
    g.line(cx, cy + r + 26, cx, cy - r - 26, { cls: 'dim' });
    g.label(cx + r + 34, cy, 'y', 'l', 'small');
    g.label(cx + 6, cy - r - 26, 'z', 'l', 'small');
    g.circle(cx, cy, r, { cls: 'dash' });
    g.arrow(cx, cy, cx + r, cy, { cls: 'thick', hs: 9 });
    [[0, 't = 0', 'tl', 6, 6], [90, 't = T/4', 'bl', 6, -4], [180, 't = T/2', 'tr', -6, 6], [270, 't = 3T/4', 'tl', 6, 4]].forEach(([a, t, an, dx, dy]) => {
      const x = cx + r * Math.cos(a * DEG), y = cy - r * Math.sin(a * DEG);
      g.dot(x, y, 3.4);
      g.label(x + dx, y + dy, t, an, 'small');
    });
    const a = 45 * DEG;
    g.head(cx + r * Math.cos(a), cy - r * Math.sin(a), -Math.sin(a), -Math.cos(a), { hs: 10 });
    g.odot(cx - r - 22, cy - r - 8, 7, { lab: '\\hat x\\ \\text{(travel)}', at: 'r' });
    return g.svg();
  }

  EM.lesson('w1', {
    id: 'w1-maxwell', topic: 2, ref: 'Lecture 22', title: 'Maxwell\'s equations in phasor form',
    steps: [
      R(md`
        !!key Why you care
          Every "find $\mathbf H$" on Exam 3 is Faraday's law in phasor form, and every "what medium is this?" is the relation between $\beta$ and $\omega$ that comes out of it. Spring 2018 #2 hands you $\Et = 10e^{-j12y}\hat z$ V/m at $\omega = 3\times10^9$ rad/s and asks for the propagation constant, the medium and the fields. Spring 2017 #4 and Summer 2019 #1 ask for $\Ht$ from $\Et$. Prof. Chen's Spring 2024 #1 asks for $\Ht$ in all three regions of a two-sheet cavity, and #2 asks you to go from a lossy wave to its material using $\eta\gamma = j\omega\mu$, a line this lesson starts. Here you derive the phasor laws, then get $\Ht$ from $\Et$ component by component, check whether a given field can exist, and read everything off one line of phasor.

        ### Notation

        - $\nabla\times$, $\nabla\cdot$: the curl and the divergence. Their component formulas are on page 1 of your formula sheet.
        - $\Et(\mathbf r)$, $\Ht(\mathbf r)$, $\tilde{\mathbf D}$, $\tilde{\mathbf B}$, $\tilde{\mathbf J}$, $\tilde\rho$: the phasors of the fields and sources ([Topic 1](#/l/w1-phasor)). Each is a function of position only.
        - $\epsilon$, $\mu$, $\sigma$: the material's permittivity, permeability and conductivity, with $\tilde{\mathbf D} = \epsilon\Et$, $\tilde{\mathbf B} = \mu\Ht$, $\tilde{\mathbf J} = \sigma\Et$.
        - $\beta$: the **wavenumber**, in rad/m. How fast the phase turns with distance.
        - $\hat k$: the unit vector pointing in the **direction of travel**.
        - $\eta = \sqrt{\mu/\epsilon}$: the **intrinsic impedance**, in $\Omega$. $\eta_0 = 120\pi\ \Omega$ in free space.
        - **Monochromatic**: one frequency only, so phasors apply.

        ### 1. Each law: ∂/∂t becomes jω

        Start with Faraday's law, as it is on your sheet:
        $$\nabla\times\mathbf E = -\frac{\partial\mathbf B}{\partial t}$$
        At one frequency, write both fields through their phasors:
        $$\mathbf E = \Re\{\Et\,e^{j\omega t}\}, \qquad \mathbf B = \Re\{\tilde{\mathbf B}\,e^{j\omega t}\}$$
        **The left side.** The curl takes derivatives with respect to $x$, $y$ and $z$. The factor $e^{j\omega t}$ does not depend on position, so it passes through the curl. Taking the real part also passes through, because the coordinates are real:
        $$\nabla\times\mathbf E = \Re\{(\nabla\times\Et)\,e^{j\omega t}\}$$
        **The right side.** From Topic 1, a time derivative multiplies the phasor by $j\omega$:
        $$-\frac{\partial\mathbf B}{\partial t} = \Re\{-j\omega\tilde{\mathbf B}\,e^{j\omega t}\}$$
        **Set them equal**, and move everything to one side:
        $$\Re\{(\nabla\times\Et + j\omega\tilde{\mathbf B})\,e^{j\omega t}\} = 0$$
        This must hold at every instant. Call the bracket $X$. When is $\Re\{Xe^{j\omega t}\} = 0$ for all $t$?

        - At $t = 0$ it says $\Re\{X\} = 0$.
        - At $\omega t = -90°$, $e^{j\omega t} = -j$, and it says $\Re\{-jX\} = \Im\{X\} = 0$.

        Both parts of $X$ are zero, so $X = 0$. That gives the phasor form:
        $$\boxed{\nabla\times\Et = -j\omega\tilde{\mathbf B}}$$
        The same three steps work on every law. Gauss's two laws have no time derivative at all, so only the tildes change. The full set:

        | Law | Time domain | Phasor form |
        |---|---|---|
        | Gauss | $\nabla\cdot\mathbf D = \rho$ | $\nabla\cdot\tilde{\mathbf D} = \tilde\rho$ |
        | No monopoles | $\nabla\cdot\mathbf B = 0$ | $\nabla\cdot\tilde{\mathbf B} = 0$ |
        | Faraday | $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$ | $\nabla\times\Et = -j\omega\tilde{\mathbf B}$ |
        | Ampère | $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$ | $\nabla\times\Ht = \tilde{\mathbf J} + j\omega\tilde{\mathbf D}$ |

        The material relations carry over unchanged, because multiplying by a constant is linear: $\tilde{\mathbf D} = \epsilon\Et$, $\tilde{\mathbf B} = \mu\Ht$, $\tilde{\mathbf J} = \sigma\Et$.

        !!intuition Does this make sense?
          The phasor equations contain no $t$ at all: only $x$, $y$, $z$. Time has become the letter $j\omega$. Units still match: $\partial/\partial t$ and $\omega$ both bring a 1/s.
      `),
      Q(md`**Predict.** Charge conservation is $\nabla\cdot\mathbf J + \partial\rho/\partial t = 0$. In phasor form it reads…`,
        [md`$\nabla\cdot\tilde{\mathbf J} + j\omega\tilde\rho = 0$`, md`$\nabla\cdot\tilde{\mathbf J} - j\omega\tilde\rho = 0$`, md`$\nabla\cdot\tilde{\mathbf J} = 0$`, md`$j\omega\,\nabla\cdot\tilde{\mathbf J} + \tilde\rho = 0$`], 0,
        [null, md`$\partial/\partial t$ becomes $+j\omega$; the sign in front stays as it was.`, md`That drops the charge term. It is zero only for static (DC) currents, not at $\omega \ne 0$.`, md`The $j\omega$ belongs to the term that had $\partial/\partial t$: the charge.`],
        md`Only the time derivative changes: $\partial\rho/\partial t\to j\omega\tilde\rho$. The divergence acts on space and stays.`),
      R(md`
        ### 2. The wave equation, and β = ω√(με)

        Take a region with no charge and no current ($\tilde\rho = 0$, $\tilde{\mathbf J} = 0$) and constant $\epsilon$, $\mu$. Put the material relations into the four laws:
        $$\nabla\cdot\Et = 0, \qquad \nabla\cdot\Ht = 0$$
        $$\nabla\times\Et = -j\omega\mu\Ht \qquad\text{(1)}$$
        $$\nabla\times\Ht = j\omega\epsilon\Et \qquad\text{(2)}$$
        **Step 1.** Take the curl of both sides of (1):
        $$\nabla\times\nabla\times\Et = -j\omega\mu\,\nabla\times\Ht$$
        **Step 2.** Equation (2) says what $\nabla\times\Ht$ is. Substitute it:
        $$\nabla\times\nabla\times\Et = -j\omega\mu\,(j\omega\epsilon\Et)$$
        **Step 3.** $-j\cdot j = -j^2 = +1$:
        $$\nabla\times\nabla\times\Et = \omega^2\mu\epsilon\,\Et$$
        **Step 4.** Your sheet has the identity $\nabla\times\nabla\times\mathbf A = \nabla(\nabla\cdot\mathbf A) - \nabla^2\mathbf A$. Here $\nabla\cdot\Et = 0$, so only $-\nabla^2\Et$ is left:
        $$-\nabla^2\Et = \omega^2\mu\epsilon\,\Et$$
        Move everything to one side:
        $$\boxed{\nabla^2\Et + \omega^2\mu\epsilon\,\Et = 0}$$
        This is the wave equation in phasor form (the **Helmholtz equation**).

        **Step 5: one dimension.** Let $\Et = \hat x\,\tilde E_x(z)$, depending on $z$ only. Then $\nabla^2$ is just $d^2/dz^2$:
        $$\frac{d^2\tilde E_x}{dz^2} = -\omega^2\mu\epsilon\,\tilde E_x$$
        **Step 6: try $e^{-j\beta z}$.** Each derivative pulls down a factor $-j\beta$:
        $$\frac{d^2}{dz^2}e^{-j\beta z} = (-j\beta)^2e^{-j\beta z} = -\beta^2e^{-j\beta z}$$
        This matches the equation when $-\beta^2 = -\omega^2\mu\epsilon$. So
        $$\boxed{\beta = \omega\sqrt{\mu\epsilon}}$$
        The same steps show $e^{+j\beta z}$ works too: the wave toward $-z$.

        !!intuition Does this make sense?
          $\beta = \omega\sqrt{\mu\epsilon} = \omega/v$, with $v = 1/\sqrt{\mu\epsilon}$, the speed from Exam 2. In free space $\beta = \omega/c$. Also, the time-domain wave equation $\partial^2E_x/\partial z^2 = \mu\epsilon\,\partial^2E_x/\partial t^2$ turns into the same line when $\partial^2/\partial t^2\to(j\omega)^2 = -\omega^2$ ✓.
      `),
      Q(md`**Predict.** A lossless medium has $\epsilon_r = 9$ and $\mu_r = 1$. At $\omega = 3\times10^8$ rad/s, $\beta$ is…`,
        [md`$3$ rad/m`, md`$1$ rad/m`, md`$9$ rad/m`, md`$\tfrac13$ rad/m`], 0,
        [null, md`That is the free-space value $\omega/c$. The medium slows the wave by $\sqrt{\epsilon_r}$.`, md`That uses $\epsilon_r$ itself. $\beta$ has $\sqrt{\mu\epsilon}$, so $\sqrt{\epsilon_r} = 3$.`, md`That divides by $\sqrt{\epsilon_r}$. A slower wave has a **larger** $\beta$.`],
        md`$\beta = \omega\sqrt{\mu_0\epsilon_r\epsilon_0} = \frac{\omega}{c}\sqrt{\epsilon_r} = (1)(3) = 3$ rad/m.`),
      R(md`
        ### 3. Plane waves: every derivative is a multiplication

        A uniform plane wave traveling toward $+z$ is
        $$\Et = \tilde{\mathbf E}_0\,e^{-j\beta z}$$
        where $\tilde{\mathbf E}_0$ is a constant vector. Its components may be complex, so each can have its own phase ([Topic 1](#/l/w1-phasor), Section 8).

        Now look at what the derivatives do to it:

        - $\partial/\partial x$ and $\partial/\partial y$ give zero: nothing depends on $x$ or $y$.
        - $\partial/\partial z$ pulls down $-j\beta$: $\frac{\partial}{\partial z}e^{-j\beta z} = -j\beta\,e^{-j\beta z}$.

        So for this wave, **$\partial/\partial z$ is multiplication by $-j\beta$.** For a wave toward $-z$, $e^{+j\beta z}$, it is $+j\beta$. The same goes for $x$ and $y$: for $e^{-j\beta x}$, $\partial/\partial x\to-j\beta$.

        **What the divergence says.** For the wave toward $+z$:
        $$\nabla\cdot\Et = \frac{\partial\tilde E_z}{\partial z} = -j\beta\,\tilde E_z$$
        Gauss's law in empty space says this is zero. Since $\beta \ne 0$:
        $$\tilde E_z = 0$$
        **A plane wave has no field along its direction of travel.** In general, $\hat k\cdot\tilde{\mathbf E}_0 = 0$, and the same for $\Ht$. Both fields lie in the plane perpendicular to $\hat k$.

        !!intuition Does this make sense?
          This is the "T" in TEM (transverse electromagnetic): both fields are transverse to the travel. It came out of one line of $\nabla\cdot\Et = 0$.
      `),
      Q(md`**Predict.** Someone proposes $\Et = (2\hat x + 3\hat z)\,e^{-j5z}$ V/m as a plane wave in empty space. What is wrong?`,
        [md`$\nabla\cdot\Et = -j15e^{-j5z} \ne 0$: the $\hat z$ part points along the travel`, md`Nothing: any constant amplitude vector is allowed`, md`The $\hat x$ part should be zero, because the wave travels toward $+z$`, md`The amplitudes must be equal`], 0,
        [null, md`Gauss's law forces $\hat k\cdot\tilde{\mathbf E}_0 = 0$. A component along $\hat k$ gives a nonzero divergence.`, md`It is the $\hat z$ part that breaks Gauss's law. Components across the travel, like $\hat x$, are exactly what a plane wave has.`, md`Any amplitudes are allowed across the travel direction; they only set the polarization.`],
        md`$\nabla\cdot\Et = \partial\tilde E_z/\partial z = 3(-j5)e^{-j5z} = -j15e^{-j5z}$. Without a charge there, it must be zero, so $\tilde E_z = 0$ is required.`),
      RF(md`
        ### 4. H from E through Faraday's law

        Solve (1) for $\Ht$. Divide by $-j\omega\mu$:
        $$\Ht = -\frac{1}{j\omega\mu}\nabla\times\Et$$
        Since $1/j = -j$, the two minus signs cancel:
        $$\Ht = \frac{j}{\omega\mu}\,\nabla\times\Et \qquad\text{(3)}$$
        Now take a general wave toward $+z$, with two complex constants $E_{x0}$ and $E_{y0}$:
        $$\Et = (E_{x0}\,\hat x + E_{y0}\,\hat y)\,e^{-j\beta z}$$
        **The curl, one component at a time** (from page 1 of the sheet). There is no $\tilde E_z$, and nothing depends on $x$ or $y$.

        The $x$-component:
        $$(\nabla\times\Et)_x = \frac{\partial\tilde E_z}{\partial y} - \frac{\partial\tilde E_y}{\partial z}$$
        The first term is zero. The second has $\partial/\partial z\to-j\beta$, and its minus sign cancels that one:
        $$(\nabla\times\Et)_x = +j\beta E_{y0}\,e^{-j\beta z}$$
        The $y$-component:
        $$(\nabla\times\Et)_y = \frac{\partial\tilde E_x}{\partial z} - \frac{\partial\tilde E_z}{\partial x}$$
        Only the first term survives:
        $$(\nabla\times\Et)_y = -j\beta E_{x0}\,e^{-j\beta z}$$
        The $z$-component, $\partial\tilde E_y/\partial x - \partial\tilde E_x/\partial y$, is zero: nothing depends on $x$ or $y$.

        **Put it into (3).** Collect the curl as one vector:
        $$\nabla\times\Et = j\beta(E_{y0}\hat x - E_{x0}\hat y)e^{-j\beta z}$$
        Multiply by $j/\omega\mu$. The two $j$'s give $j^2 = -1$:
        $$\Ht = -\frac{\beta}{\omega\mu}(E_{y0}\hat x - E_{x0}\hat y)e^{-j\beta z}$$
        Distribute the minus sign:
        $$\Ht = \frac{\beta}{\omega\mu}(E_{x0}\hat y - E_{y0}\hat x)e^{-j\beta z}$$
        **The factor.** With $\beta = \omega\sqrt{\mu\epsilon}$:
        $$\frac{\beta}{\omega\mu} = \frac{\sqrt{\mu\epsilon}}{\mu} = \sqrt{\frac{\epsilon}{\mu}} = \frac1\eta$$
        **The direction.** $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$. So the bracket is exactly $\hat z\times(E_{x0}\hat x + E_{y0}\hat y)$. Altogether:
        $$\boxed{\Ht = \frac{1}{\eta}\,\hat k\times\Et}$$
        with $\hat k = +\hat z$ here. For a wave toward $-z$, $\partial/\partial z\to+j\beta$ flips every sign, which is the same formula with $\hat k = -\hat z$.

        [[fig:triad]]

        **In words:** turn each component of $\Et$ by $90°$ about the direction of travel, and divide by $\eta$. The complex constants ride along untouched: whatever phase a component of $\Et$ has, its partner in $\Ht$ has the same phase.

        **The other way.** Cross $\hat k$ into the box. The identity $\hat k\times(\hat k\times\Et) = \hat k(\hat k\cdot\Et) - \Et$, with $\hat k\cdot\Et = 0$, gives $\hat k\times\Ht = -\Et/\eta$. So
        $$\boxed{\Et = \eta\,\Ht\times\hat k}$$
        This is the same as Ampère's law (2) would give.

        The pairs to know, for travel toward $+\hat k$ (flip both signs for $-\hat k$):

        | Travel | $\Et$ along | $\Ht$ along |
        |---|---|---|
        | $+\hat z$ | $\hat x$, $\hat y$ | $\hat y$, $-\hat x$ |
        | $+\hat x$ | $\hat y$, $\hat z$ | $\hat z$, $-\hat y$ |
        | $+\hat y$ | $\hat z$, $\hat x$ | $\hat x$, $-\hat z$ |

        !!intuition Does this make sense?
          At any instant $\mathbf E\times\mathbf H$ points along $\hat k$ (the energy goes the way the wave goes), and $|\mathbf E|/|\mathbf H| = \eta$, as on Exam 2. For $\Et = E_0\hat x\,e^{-j\beta z}$ the box gives $\Ht = (E_0/\eta)\hat y\,e^{-j\beta z}$, and $\hat x\times\hat y = \hat z$ ✓.
      `, { triad: { svg: triadFig(), cap: md`$\Et$, $\Ht$ and the direction of travel form a right-handed set: $\mathbf E\times\mathbf H$ points along $\hat k$.` } }),
      Q(md`**Predict.** In free space, $\Et = 6\hat y\,e^{+j2x}$ V/m. Then $\Ht$ is…`,
        [md`$-\tfrac{1}{20\pi}\hat z\,e^{+j2x}$ A/m`, md`$+\tfrac{1}{20\pi}\hat z\,e^{+j2x}$ A/m`, md`$-\tfrac{1}{20\pi}\hat z\,e^{-j2x}$ A/m`, md`$-720\pi\,\hat z\,e^{+j2x}$ A/m`], 0,
        [null, md`That uses $\hat k = +\hat x$. The exponent $e^{+j2x}$ means travel toward $-x$, so $\hat k = -\hat x$.`, md`$\Ht$ has the same exponent as $\Et$: both are the same wave.`, md`That multiplies by $\eta_0$. $\Ht$ is $\Et$ divided by $\eta$.`],
        md`Travel toward $-x$, so $\hat k = -\hat x$. $(-\hat x)\times\hat y = -\hat z$. Size $6/120\pi = 1/20\pi$. So $\Ht = -\tfrac{1}{20\pi}\hat z\,e^{j2x}$ A/m. Check: $\hat y\times(-\hat z) = -\hat x$ ✓.`),
      R(md`
        ### 5. Is a given field a real wave?

        Faraday's law alone will give an $\Ht$ for **any** $\Et$ you write down. But a wave also has to satisfy Ampère's law (2), and that is a real test. Put the $\Ht$ from the box into the left side of (2). The curl of $e^{-j\beta z}$ again turns into $-j\beta\hat k\times$:
        $$\nabla\times\Ht = -j\beta\,\hat k\times\Ht$$
        Substitute $\Ht = \hat k\times\Et/\eta$:
        $$\nabla\times\Ht = -\frac{j\beta}{\eta}\,\hat k\times(\hat k\times\Et)$$
        The identity of Section 4 makes $\hat k\times(\hat k\times\Et) = -\Et$:
        $$\nabla\times\Ht = \frac{j\beta}{\eta}\,\Et$$
        Ampère's law needs this to equal $j\omega\epsilon\Et$. So we need $\beta/\eta = \omega\epsilon$:
        $$\beta = \omega\epsilon\eta = \omega\epsilon\sqrt{\frac{\mu}{\epsilon}} = \omega\sqrt{\mu\epsilon}$$
        That is the same condition as Section 2. So the whole test fits in three lines.

        !!method Is it a valid plane wave?
          1. **Transverse.** No component of $\Et$ (or $\Ht$) along the direction of travel. This is $\nabla\cdot\Et = 0$.
          2. **The right β.** $\beta = \omega\sqrt{\mu\epsilon}$, which is $\beta = \omega\sqrt{\mu_r\epsilon_r}/c$. If the medium is unknown, this tells you $\sqrt{\mu_r\epsilon_r}$.
          3. **The right H.** $\Ht = \hat k\times\Et/\eta$: the size ratio is $\eta = 120\pi\sqrt{\mu_r/\epsilon_r}$, and $\Et\times\Ht^*$ points along $\hat k$.

        Tests 2 and 3 together pin down both $\epsilon$ and $\mu$. With $\gamma = j\beta$ they are the sheet's line $\eta\gamma = j\omega\mu$, which gives $\mu = \eta\beta/\omega$, and its partner $\epsilon = \beta/(\omega\eta)$.

        !!intuition Does this make sense?
          In free space, $\eta_0 = 120\pi$ and $\beta = \omega/c$. Then $\eta_0\beta/\omega = 120\pi/c = 120\pi/(3\times10^8) = 4\pi\times10^{-7} = \mu_0$ ✓.
      `),
      Q(md`**Predict.** At $\omega = 3\times10^8$ rad/s, is $\Et = 5\hat x\,e^{-j2z}$ V/m a valid plane wave in free space?`,
        [md`No: free space needs $\beta = 1$ rad/m. It fits a nonmagnetic medium with $\epsilon_r = 4$`, md`Yes: it is transverse, so it is valid`, md`No: $\Et$ must point along $\hat z$, the direction of travel`, md`No: free space needs $\beta = 1$ rad/m. It fits a nonmagnetic medium with $\epsilon_r = 2$`], 0,
        [null, md`Being transverse is test 1. Test 2 fails: $\omega/c = 1$ rad/m, not 2.`, md`That is backwards: a plane wave has no component along its travel.`, md`$\sqrt{\epsilon_r} = 2$ means $\epsilon_r = 4$. Square it.`],
        md`Free space: $\beta = \omega/c = (3\times10^8)/(3\times10^8) = 1$ rad/m, but the phasor has 2. A medium with $\sqrt{\epsilon_r} = 2$, so $\epsilon_r = 4$, would carry it.`),
      RF(md`
        ### 6. Reading a phasor

        Take the phasor
        $$\Et = (\hat y - j\hat z)\,e^{-j2\pi x}\ \text{V/m}$$
        Read it piece by piece.

        | Piece | What it says |
        |---|---|
        | the minus sign in $e^{-j2\pi x}$ | travels toward $+x$ |
        | $2\pi$ in the exponent | $\beta = 2\pi$ rad/m, so $\lambda = 2\pi/\beta = 1$ m |
        | no $\hat x$ in the bracket | transverse ✓ |
        | $\hat y$ with coefficient $1$ | amplitude 1, phase $0°$ |
        | $\hat z$ with coefficient $-j$ | amplitude 1, phase $-90°$ |

        **The frequency is not in the phasor.** The phasor dropped $e^{j\omega t}$. You need the medium: in free space, $v = c$, so
        $$f = \frac{v}{\lambda} = \frac{3\times10^8}{1} = 300\ \text{MHz}$$
        and $\omega = 2\pi f = 6\pi\times10^8$ rad/s. In a medium with $\epsilon_r = 4$ the same phasor would mean $f = 150$ MHz.

        **The polarization pieces.** Equal amplitudes and a $90°$ phase difference: the tip of $\mathbf E$ traces a **circle**. Which way does it turn? At $x = 0$:

        - At $t = 0$: $\Re\{\hat y - j\hat z\} = \hat y$.
        - At $t = T/4$, multiply by $j$: $\Re\{j\hat y + \hat z\} = \hat z$.

        It turns from $\hat y$ to $\hat z$. That is a turn about $\hat y\times\hat z = \hat x$, which is the direction of travel. A turn that is counterclockwise about the travel direction is **right-handed**; [Topic 9](#/l/w3-pol) makes this a 5-second read.

        [[fig:circ]]

        !!intuition Does this make sense?
          At every instant the field has size $\sqrt{\cos^2 + \sin^2} = 1$ (Section 7 shows the cosine and the sine). A constant size and a turning direction: a circle ✓.
      `, { circ: { svg: circFig(), cap: md`The tip of $\mathbf E$ at $x = 0$ over one period, for $\Et = (\hat y - j\hat z)e^{-j2\pi x}$. The travel direction, $+\hat x$, points out of the page.` } }),
      Q(md`**Predict.** $\Et = 4(\hat x + j\hat z)\,e^{+j\pi y}$ V/m. Which reading is right?`,
        [md`toward $-y$, $\lambda = 2$ m, circular`, md`toward $+y$, $\lambda = 2$ m, circular`, md`toward $-y$, $\lambda = 0.5$ m, circular`, md`toward $-y$, $\lambda = 2$ m, linear`], 0,
        [null, md`$e^{+j\pi y}$ has a plus sign: travel toward $-y$.`, md`$\lambda = 2\pi/\beta = 2\pi/\pi = 2$ m. $0.5$ m is $\beta/2\pi$.`, md`The $j$ puts the two components $90°$ apart. With equal sizes that is a circle, not a line.`],
        md`Plus sign: toward $-y$. $\beta = \pi$, $\lambda = 2$ m. Equal amplitudes 4 and 4, $90°$ apart: circular.`),
      R(md`
        ### 7. Back to the time domain, and the H that goes with it

        **E.** Multiply by $e^{j\omega t}$ and take the real part, one component at a time. Write $\theta = \omega t - 2\pi x$ for short.

        The $\hat y$ part has phasor $e^{-j2\pi x}$:
        $$\Re\{e^{j\theta}\} = \cos\theta$$
        The $\hat z$ part has phasor $-je^{-j2\pi x}$, and $-j$ means a sine (Topic 1):
        $$\Re\{-je^{j\theta}\} = \sin\theta$$
        So
        $$\mathbf E = \hat y\cos\theta + \hat z\sin\theta$$
        in V/m, with $\theta = \omega t - 2\pi x$.

        **H.** Use the box with $\hat k = \hat x$ and $\eta_0 = 120\pi$:
        $$\Ht = \frac{1}{120\pi}\,\hat x\times(\hat y - j\hat z)\,e^{-j2\pi x}$$
        Cross each piece: $\hat x\times\hat y = \hat z$, and $\hat x\times\hat z = -\hat y$, so $\hat x\times(-j\hat z) = +j\hat y$:
        $$\Ht = \frac{1}{120\pi}(\hat z + j\hat y)\,e^{-j2\pi x}\ \text{A/m}$$
        Back to time. A real coefficient is a cosine; $+j$ is $-\sin$:
        $$\mathbf H = \frac{\hat z\cos\theta - \hat y\sin\theta}{120\pi}$$
        in A/m.

        !!intuition Does this make sense?
          At $x = 0$, $t = 0$: $\mathbf E = \hat y$ and $\mathbf H = \hat z/120\pi$. $\hat y\times\hat z = \hat x$, the travel ✓. A quarter period later: $\mathbf E = \hat z$ and $\mathbf H = -\hat y/120\pi$, and $\hat z\times(-\hat y) = \hat x$ ✓. $\mathbf H$ turns with $\mathbf E$, always a quarter turn ahead of it about $\hat x$.
      `),
      Q(md`**Predict.** $\Ht = \frac{1}{120\pi}(\hat z + j\hat y)e^{-j2\pi x}$ A/m. Its $y$-component in time is…`,
        [md`$-\tfrac{1}{120\pi}\sin(\omega t - 2\pi x)$`, md`$+\tfrac{1}{120\pi}\sin(\omega t - 2\pi x)$`, md`$\tfrac{1}{120\pi}\cos(\omega t - 2\pi x)$`, md`$-\tfrac{1}{120\pi}\sin(\omega t + 2\pi x)$`], 0,
        [null, md`$+\sin$ belongs to $-j$. Here the coefficient is $+j$: $\Re\{je^{j\theta}\} = -\sin\theta$.`, md`That ignores the $j$. A $j$ shifts the signal by a quarter period.`, md`The exponent $e^{-j2\pi x}$ gives $\omega t - 2\pi x$.`],
        md`$\Re\{j\,e^{j(\omega t - 2\pi x)}\} = \Re\{j\cos\theta - \sin\theta\} = -\sin\theta$.`),
      R(md`
        ### 8. With conductivity: one bracket changes

        If the material conducts, $\tilde{\mathbf J} = \sigma\Et$, and Ampère's law becomes
        $$\nabla\times\Ht = \sigma\Et + j\omega\epsilon\Et$$
        Factor out $\Et$:
        $$\nabla\times\Ht = (\sigma + j\omega\epsilon)\Et$$
        Compare with (2). The only change is $j\omega\epsilon\to\sigma + j\omega\epsilon$. So every step above goes through with that one substitution. In the lossless case, Sections 2 and 4 can be written as
        $$\gamma = j\beta = \sqrt{(j\omega\mu)(j\omega\epsilon)}$$
        $$\eta = \sqrt{\frac{j\omega\mu}{j\omega\epsilon}}$$
        With conductivity, put $\sigma + j\omega\epsilon$ in place of $j\omega\epsilon$:
        $$\gamma = \sqrt{j\omega\mu(\sigma + j\omega\epsilon)}$$
        $$\eta = \sqrt{\frac{j\omega\mu}{\sigma + j\omega\epsilon}}$$
        Multiply the two: $\eta\gamma = j\omega\mu$. Divide them: $\gamma/\eta = \sigma + j\omega\epsilon$. Those are the two lines on page 2 of your sheet. [Topic 5](#/l/w2-gamma) derives them from scratch and finds what $\alpha$, $\beta$ and the angle of $\eta$ do.

        !!intuition Does this make sense?
          Set $\sigma = 0$: $\gamma = j\omega\sqrt{\mu\epsilon} = j\beta$ and $\eta = \sqrt{\mu/\epsilon}$, the lossless values ✓. And $\eta\gamma = \sqrt{\mu/\epsilon}\cdot j\omega\sqrt{\mu\epsilon} = j\omega\mu$ ✓.
      `),
      Q(md`**Predict.** A lossless medium has $\eta = 60\pi\ \Omega$ and carries a wave with $\beta = 4$ rad/m at $\omega = 6\times10^8$ rad/s. What is $\mu_r$?`,
        [md`$1$`, md`$2$`, md`$0.5$`, md`$4$`], 0,
        [null, md`$\mu = \eta\beta/\omega = (60\pi)(4)/(6\times10^8) = 4\pi\times10^{-7}$, which is $\mu_0$.`, md`That is $\beta/\eta$ scaled the wrong way; use $\mu = \eta\beta/\omega$.`, md`$\beta c/\omega = 2$ is $\sqrt{\mu_r\epsilon_r}$. Squared it is $\mu_r\epsilon_r = 4$, and $\eta$ shows $\epsilon_r = 4$, so $\mu_r = 1$.`],
        md`From $\eta\gamma = j\omega\mu$ with $\gamma = j\beta$: $\mu = \eta\beta/\omega = 240\pi/(6\times10^8) = 4\pi\times10^{-7} = \mu_0$. So $\mu_r = 1$, and then $\eta = 120\pi/\sqrt{\epsilon_r}$ gives $\epsilon_r = 4$.`),
      R(md`
        ### The method

        !!method From a phasor $\Et$ to everything
          1. **Direction.** The sign in $e^{\mp j\beta u}$: minus means $+u$.
          2. **β and λ.** The number in the exponent is $\beta$; $\lambda = 2\pi/\beta$.
          3. **The medium or ω.** $\beta = \omega\sqrt{\mu_r\epsilon_r}/c$: given one of $\omega$ and $\epsilon_r$, get the other.
          4. **Valid?** No component along the travel; the right $\beta$.
          5. **H.** $\Ht = \hat k\times\Et/\eta$: turn each component, divide by $\eta = 120\pi\sqrt{\mu_r/\epsilon_r}$, keep every $j$.
          6. **Time domain.** $\Re\{\cdot\,e^{j\omega t}\}$, one component at a time.
          7. **Check.** At one instant, $\mathbf E\times\mathbf H$ points along the travel.

        ### Worked example 1: H by the curl, component by component

        !!graded Problem
          A lossless, nonmagnetic medium carries $\Et = (3\hat x + j4\hat z)\,e^{+j6y}$ V/m at $\omega = 9\times10^8$ rad/s. Find the direction of travel, $\epsilon_r$, $\eta$, $\lambda$ and $f$. Then find $\Ht$ from Faraday's law, component by component, and write $\mathbf E$ and $\mathbf H$ in the time domain.

        **Step 1: direction.** $e^{+j6y}$: travel toward $-y$. The bracket has no $\hat y$ part, so the wave is transverse ✓.

        **Step 2: the medium.** $\beta = 6$ rad/m. From $\beta = \omega\sqrt{\epsilon_r}/c$:
        $$\sqrt{\epsilon_r} = \frac{\beta c}{\omega} = \frac{6\times3\times10^8}{9\times10^8} = 2$$
        So $\epsilon_r = 4$, and
        $$\eta = \frac{120\pi}{\sqrt{\epsilon_r}} = 60\pi\ \Omega$$
        **Step 3: λ and f.**
        $$\lambda = \frac{2\pi}{6} = \frac{\pi}{3} \approx 1.05\ \text{m}$$
        $$f = \frac{\omega}{2\pi} = \frac{9\times10^8}{2\pi} \approx 143\ \text{MHz}$$
        **Step 4: the curl.** The components are $\tilde E_x = 3e^{j6y}$, $\tilde E_y = 0$, $\tilde E_z = j4e^{j6y}$. Only $y$ appears, and $\partial/\partial y\to+j6$.
        $$(\nabla\times\Et)_x = \frac{\partial\tilde E_z}{\partial y} - \frac{\partial\tilde E_y}{\partial z}$$
        The first term is $(j6)(j4)e^{j6y} = -24e^{j6y}$, and the second is zero:
        $$(\nabla\times\Et)_x = -24\,e^{j6y}$$
        The $y$-component, $\partial\tilde E_x/\partial z - \partial\tilde E_z/\partial x$, is zero: nothing depends on $z$ or $x$.
        $$(\nabla\times\Et)_z = \frac{\partial\tilde E_y}{\partial x} - \frac{\partial\tilde E_x}{\partial y}$$
        The first term is zero, and the second is $(j6)(3)e^{j6y}$:
        $$(\nabla\times\Et)_z = -j18\,e^{j6y}$$
        **Step 5: Faraday.** $\Ht = \frac{j}{\omega\mu}\nabla\times\Et$, with $\omega\mu_0 = (9\times10^8)(4\pi\times10^{-7}) = 360\pi$:
        $$\Ht = \frac{j}{360\pi}(-24\hat x - j18\hat z)\,e^{j6y}$$
        Multiply the $j$ in: $j(-24) = -j24$ and $j(-j18) = 18$:
        $$\Ht = \frac{-j24\hat x + 18\hat z}{360\pi}\,e^{j6y}$$
        Divide 24 and 18 by 6:
        $$\Ht = \frac{1}{60\pi}(3\hat z - j4\hat x)\,e^{j6y}\ \text{A/m}$$
        **Step 6: check with the shortcut.** $\hat k = -\hat y$. $(-\hat y)\times\hat x = \hat z$ and $(-\hat y)\times\hat z = -\hat x$. So $\hat k\times(3\hat x + j4\hat z) = 3\hat z - j4\hat x$, divided by $\eta = 60\pi$ ✓.

        **Step 7: time domain.** With $\theta = \omega t + 6y$: a real coefficient is a cosine, $+j\to-\sin$, $-j\to+\sin$:
        $$\mathbf E = 3\cos\theta\,\hat x - 4\sin\theta\,\hat z$$
        in V/m, and
        $$\mathbf H = \frac{3\cos\theta\,\hat z + 4\sin\theta\,\hat x}{60\pi}$$
        in A/m.

        !!intuition Does this make sense?
          At $y = 0$, $t = 0$: $\mathbf E = 3\hat x$ and $\mathbf H = (3/60\pi)\hat z$. $\hat x\times\hat z = -\hat y$, the travel ✓. Sizes: $3/(3/60\pi) = 60\pi = \eta$ ✓.

        **Speed path.** Skip the curl: $\hat k = -\hat y$ turns $\hat x\to\hat z$ and $\hat z\to-\hat x$; divide by $60\pi$; keep the $j$. The curl is your check if you have time.

        **Where points go.** Using $\hat k = +\hat y$ (every sign of $\Ht$ flips); dropping the $j$ on the $\hat x$ part of $\Ht$; $\epsilon_r = 2$ from forgetting to square; $\eta = 120\pi/4$ from dividing by $\epsilon_r$.

        ### Worked example 2: can these fields exist?

        !!graded Problem
          (a) Is $\Et = 2(\hat x + \hat z)\,e^{-j2z}$ V/m a plane wave in free space at $\omega = 6\times10^8$ rad/s?

          (b) At $\omega = 3\times10^8$ rad/s, $\Et = 5\hat x\,e^{-j2z}$ V/m and $\Ht = \tfrac{1}{24\pi}\hat y\,e^{-j2z}$ A/m. Can they be one wave in a nonmagnetic medium? If not, what $\mu_r$ and $\epsilon_r$ would make them one?

        **(a) Step 1: β.** Free space needs $\beta = \omega/c = 2$ rad/m. The phasor has 2 ✓.

        **Step 2: transverse?** The travel is $+z$, and the bracket has a $\hat z$ part:
        $$\nabla\cdot\Et = \frac{\partial\tilde E_z}{\partial z} = 2(-j2)e^{-j2z} = -j4\,e^{-j2z}$$
        That is not zero, so Gauss's law fails without a charge. **Not a plane wave.**

        **(b) Step 1: the direction pair.** $\hat x\times\hat y = \hat z$, along the travel ✓.

        **Step 2: η from the ratio.**
        $$\eta = \frac{|\tilde E|}{|\tilde H|} = 5\times24\pi = 120\pi\ \Omega$$
        **Step 3: what β needs.** A nonmagnetic medium with $\eta = 120\pi$ has $\epsilon_r = 1$: free space. But then $\beta = \omega/c = 1$ rad/m, not 2. **Not a wave in any nonmagnetic medium.**

        **Step 4: allow $\mu_r$.** Use the two relations of Section 5. From $\eta\gamma = j\omega\mu$ with $\gamma = j2$:
        $$\mu = \frac{\eta\beta}{\omega} = \frac{(120\pi)(2)}{3\times10^8}$$
        $$\mu = 8\pi\times10^{-7} = 2\mu_0$$
        And from $\gamma/\eta = j\omega\epsilon$:
        $$\epsilon = \frac{\beta}{\omega\eta} = \frac{2}{(3\times10^8)(120\pi)}$$
        Since $\epsilon_0 = 1/(c\eta_0) = 1/(3\times10^8\cdot120\pi)$, this is $\epsilon = 2\epsilon_0$. So $\mu_r = \epsilon_r = 2$.

        !!intuition Does this make sense?
          $\eta = 120\pi\sqrt{\mu_r/\epsilon_r} = 120\pi\sqrt{2/2} = 120\pi$ ✓, and $\beta = (\omega/c)\sqrt{\mu_r\epsilon_r} = (1)(2) = 2$ ✓. Raising $\mu$ and $\epsilon$ together slows the wave without changing the impedance.

        **Speed path.** Ratio gives $\eta$, exponent gives $\beta$. Then $\sqrt{\mu_r/\epsilon_r} = \eta/120\pi$ and $\sqrt{\mu_r\epsilon_r} = \beta c/\omega$: multiply and divide the two.

        ### Worked example 3: a transmitted wave (the skill Spring 2018 #2 asks for)

        !!graded Problem
          A wave enters a perfect dielectric with $\mu = \mu_0$. Its transmitted phasor is $\Et_t = 5e^{-j10y}\hat z$ V/m, at $\omega = 2\times10^9$ rad/s. Find $\gamma_t$, $\epsilon_r$, $\eta$ and $\Ht_t$, and the propagation constant $\gamma_0$ in the free-space region.

        **Step 1: γ.** No decay, so $\alpha = 0$ and $\gamma_t = j\beta = j10$ 1/m.

        **Step 2: $\epsilon_r$.**
        $$\sqrt{\epsilon_r} = \frac{\beta c}{\omega} = \frac{10\times3\times10^8}{2\times10^9} = 1.5$$
        So $\epsilon_r = 2.25$.

        **Step 3: η.**
        $$\eta = \frac{120\pi}{1.5} = 80\pi\ \Omega$$
        Check with $\eta\gamma = j\omega\mu$: $(80\pi)(j10) = j800\pi$, and $j\omega\mu_0 = j(2\times10^9)(4\pi\times10^{-7}) = j800\pi$ ✓.

        **Step 4: H.** Travel toward $+y$, so $\hat k = \hat y$, and $\hat y\times\hat z = \hat x$:
        $$\Ht_t = \frac{5}{80\pi}\,\hat x\,e^{-j10y} = \frac{1}{16\pi}\,\hat x\,e^{-j10y}\ \text{A/m}$$
        **Step 5: free space.** There $\beta_0 = \omega/c = (2\times10^9)/(3\times10^8) = 20/3$ rad/m, so
        $$\gamma_0 = j\tfrac{20}{3} \approx j6.67\ \text{1/m}$$

        !!intuition Does this make sense?
          The dielectric slows the wave by 1.5, so its $\beta$ is $1.5\times\tfrac{20}{3} = 10$ ✓.

        **Where points go.** Writing $\gamma = 10$ (real) instead of $j10$; $\epsilon_r = 1.5$ (forgot to square); $\Ht$ along $-\hat x$ from crossing in the wrong order.

        ### Speed tricks

        !!key Speed tricks
          - **Derivatives become numbers.** $\partial/\partial t\to j\omega$; for $e^{\mp j\beta u}$, $\partial/\partial u\to\mp j\beta$. So $\nabla\to-j\beta\hat k$.
          - **H in one move.** $\Ht = \hat k\times\Et/\eta$: turn each component $90°$ about the travel, divide by $\eta$, keep every $j$. Reverse: $\Et = \eta\,\Ht\times\hat k$.
          - **Read the exponent.** Sign: direction. Number: $\beta$, then $\lambda = 2\pi/\beta$. The frequency needs the medium: $\omega = \beta c/\sqrt{\mu_r\epsilon_r}$.
          - **Free space.** $\beta = \omega/c$; $\lambda$ in meters is $300/f$ in MHz.
          - **Valid wave.** Transverse; $\beta c/\omega = \sqrt{\mu_r\epsilon_r}$; $\eta = 120\pi\sqrt{\mu_r/\epsilon_r}$.
          - **η from β, no ε needed.** Lossless: $\eta = \omega\mu/\beta$ (from $\eta\gamma = j\omega\mu$).

        !!mistake Common mistakes
          - **Losing the $j$ in a derivative.** $\partial e^{-j\beta z}/\partial z = -j\beta e^{-j\beta z}$, not $-\beta e^{-j\beta z}$.
          - **The signs inside the curl.** Copy the component formula from the sheet and fill it in one term at a time.
          - **$\Ht = \Et/\eta$ with the same direction.** $\Ht$ is turned $90°$ about the travel.
          - **$\hat k$ with the wrong sign.** $e^{+j\beta y}$ means $\hat k = -\hat y$.
          - **Dropping a $j$** from a component when forming $\Ht$. Each component of $\Ht$ keeps the phase of its partner in $\Et$.
          - **$\beta = \omega\epsilon_r/c$.** It is $\sqrt{\epsilon_r}$.
          - **Looking for ω in the phasor.** It is not there.
          - **A component along the travel.** It breaks $\nabla\cdot\Et = 0$.

        ### Check questions
      `),
      Q(md`Ampère's law in a conducting material, in phasor form, is…`,
        [md`$\nabla\times\Ht = (\sigma + j\omega\epsilon)\Et$`, md`$\nabla\times\Ht = (\sigma - j\omega\epsilon)\Et$`, md`$\nabla\times\Ht = (j\omega\sigma + \epsilon)\Et$`, md`$\nabla\times\Ht = j\omega\epsilon\Et$`], 0,
        [null, md`$\partial\mathbf D/\partial t\to+j\omega\epsilon\Et$: the sign is $+$.`, md`The $j\omega$ goes with the time derivative, which acts on $\mathbf D = \epsilon\mathbf E$, not on $\mathbf J = \sigma\mathbf E$.`, md`That drops the conduction current $\tilde{\mathbf J} = \sigma\Et$.`],
        md`$\nabla\times\mathbf H = \sigma\mathbf E + \epsilon\,\partial\mathbf E/\partial t\to\sigma\Et + j\omega\epsilon\Et$.`),
      Q(md`For a wave $\propto e^{+j3x}$, the operator $\partial/\partial x$ becomes…`,
        [md`$+j3$`, md`$-j3$`, md`$3$`, md`$-3$`], 0,
        [null, md`$-j3$ goes with $e^{-j3x}$.`, md`The derivative of $e^{j3x}$ brings down the whole exponent's coefficient, $j3$.`, md`The $j$ stays: the exponent is imaginary.`],
        md`$\frac{d}{dx}e^{j3x} = j3\,e^{j3x}$.`),
      Q(md`A wave in a medium with impedance $\eta$ has $\Et = 2\hat z\,e^{-j\beta x}$. Then $\Ht$ is…`,
        [md`$-\tfrac{2}{\eta}\hat y\,e^{-j\beta x}$`, md`$+\tfrac{2}{\eta}\hat y\,e^{-j\beta x}$`, md`$\tfrac{2}{\eta}\hat z\,e^{-j\beta x}$`, md`$-2\eta\,\hat y\,e^{-j\beta x}$`], 0,
        [null, md`$\hat x\times\hat z = -\hat y$, not $+\hat y$.`, md`$\Ht$ is $\Et$ turned $90°$ about the travel, not parallel to it.`, md`$\Ht$ is $\Et$ divided by $\eta$.`],
        md`$\hat k = \hat x$, and $\hat x\times\hat z = -\hat y$. Check: $\hat z\times(-\hat y) = \hat x$ ✓.`),
      Q(md`A lossless medium with $\epsilon_r = 4$, $\mu_r = 1$ carries $\Et = 4(\hat x + j\hat y)e^{-j10z}$ V/m. The angular frequency is…`,
        [md`$1.5\times10^9$ rad/s`, md`$3\times10^9$ rad/s`, md`$7.5\times10^8$ rad/s`, md`$2.4\times10^8$ rad/s`], 0,
        [null, md`That is $\beta c$, the free-space answer. This medium slows the wave by $\sqrt{\epsilon_r} = 2$.`, md`That divides by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.`, md`That divides by $2\pi$ as well: it is close to $f$, but with the wrong factor.`],
        md`$\omega = \beta c/\sqrt{\epsilon_r} = (10)(3\times10^8)/2 = 1.5\times10^9$ rad/s.`),
      Q(md`In free space, $\Ht = 0.1\,\hat x\,e^{-j4z}$ A/m. Then $\Et$ is…`,
        [md`$-12\pi\,\hat y\,e^{-j4z}$ V/m`, md`$+12\pi\,\hat y\,e^{-j4z}$ V/m`, md`$12\pi\,\hat x\,e^{-j4z}$ V/m`, md`$-\tfrac{1}{1200\pi}\hat y\,e^{-j4z}$ V/m`], 0,
        [null, md`$\Et = \eta\,\Ht\times\hat k$, and $\hat x\times\hat z = -\hat y$.`, md`$\Et$ and $\Ht$ are perpendicular.`, md`$\Et$ is $\eta$ **times** $\Ht$.`],
        md`$\Et = 120\pi(0.1)(\hat x\times\hat z)e^{-j4z} = -12\pi\,\hat y\,e^{-j4z}$. Check: $(-\hat y)\times\hat x = \hat z$ ✓.`),
      Q(md`Why does a plane wave in empty space have no field component along its direction of travel?`,
        [md`$\nabla\cdot\Et = -j\beta\,\hat k\cdot\Et$ must be zero`, md`Because $\nabla\times\Et = 0$`, md`Because $\Ht$ must be zero along the travel, and $\Et$ copies $\Ht$`, md`It does have one; it is just small`], 0,
        [null, md`The curl of a wave is not zero: it is what makes $\Ht$.`, md`$\Et$ and $\Ht$ are perpendicular, not copies; and the reason for each is its own divergence.`, md`It is exactly zero, from Gauss's law.`],
        md`For $e^{-j\beta\hat k\cdot\mathbf r}$, $\nabla\to-j\beta\hat k$. So $\nabla\cdot\Et = -j\beta\hat k\cdot\Et = 0$ forces $\hat k\cdot\Et = 0$.`),
      Q(md`Faraday's law gives $\Ht$ for any $\Et$ you write. Which law, applied next, forces $\beta = \omega\sqrt{\mu\epsilon}$?`,
        [md`Ampère's law`, md`Gauss's law`, md`$\nabla\cdot\tilde{\mathbf B} = 0$`, md`Faraday's law again`], 0,
        [null, md`Gauss's law forces the field to be transverse; it says nothing about $\beta$.`, md`That also only forces $\Ht$ to be transverse.`, md`Faraday's law is already used to find $\Ht$; it is satisfied by construction.`],
        md`$\nabla\times\Ht = (j\beta/\eta)\Et$ must equal $j\omega\epsilon\Et$, so $\beta = \omega\epsilon\eta = \omega\sqrt{\mu\epsilon}$.`),
      R(md`
        ### Practice, level 1: the laws and the operators

        **The trick:** $\partial/\partial t\to j\omega$ with the sign kept; for $e^{\mp j\beta u}$, $\partial/\partial u\to\mp j\beta$; $\beta = \omega\sqrt{\mu_r\epsilon_r}/c$. Eight right completes a card.
      `),
      Object.assign(G('rf_w1p_law', { need: 8 }), { id: 'w1-maxwell.r0' }),
      R(md`
        ### Practice, level 1: read the phasor

        **The trick:** sign of the exponent, number in the exponent, then the bracket. $\omega$ is not in the phasor.
      `),
      Object.assign(G('rf_w1p_read', { need: 8 }), { id: 'w1-maxwell.r1' }),
      R(md`
        ### Practice, level 1: H from E, and back

        **The trick:** $\Ht = \hat k\times\Et/\eta$ and $\Et = \eta\,\Ht\times\hat k$. Find $\hat k$ from the exponent first.
      `),
      Object.assign(G('rf_w1p_h', { need: 8 }), { id: 'w1-maxwell.r2' }),
      R(md`
        ### Practice, level 1: can it exist?

        **The trick:** transverse, the right $\beta$, the right $\eta$ and the right-hand rule.
      `),
      Object.assign(G('rf_w1p_valid', { need: 8 }), { id: 'w1-maxwell.r3' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w1p_faraday', { need: 2 }),
      G('w1p_medium', { need: 2 }),
      G('w1p_back', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        One phasor in, everything out: direction, medium, $\lambda$, $\Ht$, a value in time, the power, the shape.
      `),
      G('w1p_wave', { need: 2 }),
    ],
  });

  // ================================================================ lesson 2 generators
  const BETAS = [[2, '2'], [Math.PI, '\\pi'], [2 * Math.PI, '2\\pi'], [4, '4'], [6, '6'], [10, '10']];
  const unitTex = (s, a) => `${s < 0 ? '-' : '+'}\\hat ${a}`;

  // ---------------------------------------------------------------- level 1: the laws and the operators
  GENS.rf_w1p_law = () => one([
    () => {
      const [q, r, w, s] = pick([
        [md`Faraday's law in phasor form is…`, md`$\nabla\times\Et = -j\omega\mu\Ht$`, [[md`$\nabla\times\Et = +j\omega\mu\Ht$`, md`The minus sign of $-\partial\mathbf B/\partial t$ stays.`], [md`$\nabla\times\Et = -j\omega\epsilon\Et$`, md`Faraday's law links $\mathbf E$ to $\mathbf B = \mu\mathbf H$.`], [md`$\nabla\times\Et = -\mu\,\partial\Ht/\partial t$`, md`A phasor has no $t$ to differentiate: $\partial/\partial t$ has already become $j\omega$.`], [md`$\nabla\times\Et = -\omega\mu\Ht$`, md`The $j$ is part of the rule: $\partial/\partial t\to j\omega$.`]], md`$\nabla\times\mathbf E = -\partial\mathbf B/\partial t$, with $\partial/\partial t\to j\omega$ and $\tilde{\mathbf B} = \mu\Ht$.`],
        [md`Ampère's law in a conductor, in phasor form, is…`, md`$\nabla\times\Ht = (\sigma + j\omega\epsilon)\Et$`, [[md`$\nabla\times\Ht = (\sigma - j\omega\epsilon)\Et$`, md`$\partial/\partial t\to+j\omega$.`], [md`$\nabla\times\Ht = j\omega(\sigma + \epsilon)\Et$`, md`Only the displacement term had a time derivative.`], [md`$\nabla\times\Ht = -j\omega\mu\Et$`, md`That mixes in Faraday's law.`]], md`$\mathbf J + \partial\mathbf D/\partial t\to\sigma\Et + j\omega\epsilon\Et$.`],
        [md`Gauss's law in phasor form is…`, md`$\nabla\cdot\tilde{\mathbf D} = \tilde\rho$`, [[md`$\nabla\cdot\tilde{\mathbf D} = j\omega\tilde\rho$`, md`Gauss's law has no time derivative, so no $j\omega$ appears.`], [md`$\nabla\cdot\tilde{\mathbf D} = 0$ always`, md`Only where there is no charge.`], [md`$\nabla\times\tilde{\mathbf D} = \tilde\rho$`, md`Gauss's law is a divergence.`]], md`No $\partial/\partial t$, so only tildes are added.`],
        [md`The phasor wave equation in a lossless, source-free medium is…`, md`$\nabla^2\Et + \omega^2\mu\epsilon\Et = 0$`, [[md`$\nabla^2\Et - \omega^2\mu\epsilon\Et = 0$`, md`$\partial^2/\partial t^2\to(j\omega)^2 = -\omega^2$, which makes the sign $+$ once moved over.`], [md`$\nabla^2\Et + \omega\mu\epsilon\Et = 0$`, md`Two time derivatives bring $\omega^2$.`], [md`$\nabla^2\Et + j\omega\mu\epsilon\Et = 0$`, md`$(j\omega)^2$ is real: $-\omega^2$.`]], md`$\nabla^2\Et = \mu\epsilon(j\omega)^2\Et = -\omega^2\mu\epsilon\Et$.`],
        [md`Charge conservation in phasor form is…`, md`$\nabla\cdot\tilde{\mathbf J} = -j\omega\tilde\rho$`, [[md`$\nabla\cdot\tilde{\mathbf J} = j\omega\tilde\rho$`, md`From $\nabla\cdot\mathbf J = -\partial\rho/\partial t$ the minus sign stays.`], [md`$\nabla\cdot\tilde{\mathbf J} = 0$`, md`That holds only at DC.`], [md`$\nabla\cdot\tilde{\mathbf J} = -\omega\tilde\rho$`, md`The $j$ belongs to the rule $\partial/\partial t\to j\omega$.`]], md`$\nabla\cdot\mathbf J + \partial\rho/\partial t = 0\to\nabla\cdot\tilde{\mathbf J} + j\omega\tilde\rho = 0$.`],
      ]);
      return MC('Which law?', q, r, w, s);
    },
    // the operator for a given exponent
    () => {
      const [b, bt] = pick(BETAS), u = pick(AX), s = pick([1, -1]);
      const ex1 = `e^{${s > 0 ? '-' : '+'}j${bt}${/[a-z]$/.test(bt) ? ' ' : ''}${u}}`;
      const op = (sg, j = true) => `$${sg > 0 ? '+' : '-'}${j ? 'j' : ''}${bt}$`;
      return MC('A derivative becomes a number', md`For a field $\propto ${ex1}$, the operator $\partial/\partial ${u}$ becomes…`, op(-s),
        [[op(s), md`That is the opposite sign. The derivative brings down the exponent's coefficient, sign and all.`], [op(-s, false), md`The $j$ stays: the exponent is imaginary.`], [op(s, false), md`Both the $j$ and the sign are lost.`], [md`$0$`, md`The field depends on $${u}$, so its $${u}$-derivative is not zero.`]],
        md`$\frac{\partial}{\partial ${u}}${ex1} = (${s > 0 ? '-' : '+'}j${bt})\,${ex1}$.`);
    },
    // beta from omega and the medium
    () => {
      const n = pick([1, 1.5, 2, 3]), wc = pick([1, 2, 4]), w = wc * 3e8, b = n * wc;
      return MC('β from ω and the medium', md`A lossless, nonmagnetic medium has $\epsilon_r = ${p(n * n)}$. At $\omega = ${p(w)}$ rad/s, $\beta$ is…`, md`$${p(b)}$ rad/m`,
        [[md`$${p(wc)}$ rad/m`, md`That is free space, $\omega/c$. The medium multiplies it by $\sqrt{\epsilon_r}$.`], [md`$${p(wc * n * n)}$ rad/m`, md`That uses $\epsilon_r$ itself instead of its square root.`], [md`$${p(+(wc / n).toFixed(4))}$ rad/m`, md`That divides by $\sqrt{\epsilon_r}$. A slower wave has a larger $\beta$.`], [md`$${p(+(b / (2 * Math.PI)).toFixed(3))}$ rad/m`, md`That divides by $2\pi$ as if $\omega$ were $f$.`]],
        md`$\beta = \omega\sqrt{\epsilon_r}/c = (${wc})(${n}) = ${p(b)}$ rad/m.`);
    },
    // omega from beta
    () => {
      const n = pick([1, 1.5, 2, 3]), b = pick([2, 3, 6, 12]), w = b * 3e8 / n;
      return MC('ω from β', md`A lossless, nonmagnetic medium with $\epsilon_r = ${p(n * n)}$ carries a wave with $\beta = ${b}$ rad/m. Then $\omega$ is…`, md`$${p(w)}$ rad/s`,
        [[md`$${p(b * 3e8)}$ rad/s`, md`That is the free-space answer, $\beta c$. Here the wave is slower by $\sqrt{\epsilon_r}$.`], [md`$${p(b * 3e8 * n)}$ rad/s`, md`That multiplies by $\sqrt{\epsilon_r}$. $\omega = \beta v$, and $v = c/\sqrt{\epsilon_r}$ is smaller than $c$.`], [md`$${p(+(w / (2 * Math.PI)).toPrecision(3))}$ rad/s`, md`That is $f$ in Hz, not $\omega$.`], [md`$${p(+(b * 3e8 / (n * n)).toPrecision(4))}$ rad/s`, md`That divides by $\epsilon_r$ instead of its square root.`]],
        md`$\omega = \beta v = \beta c/\sqrt{\epsilon_r} = (${b})(3\times10^8)/${n} = ${p(w)}$ rad/s.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: read a phasor
  const AMPS = [
    { t: (a, b) => `(\\hat ${a} - j\\hat ${b})`, re: (a) => `\\hat ${a}`, shape: 'circle' },
    { t: (a, b) => `(\\hat ${a} + j\\hat ${b})`, re: (a) => `\\hat ${a}`, shape: 'circle' },
    { t: (a, b) => `2(\\hat ${a} + \\hat ${b})`, re: (a, b) => `2(\\hat ${a} + \\hat ${b})`, shape: 'line' },
    { t: (a, b) => `(3\\hat ${a} + j4\\hat ${b})`, re: (a) => `3\\hat ${a}`, shape: 'ellipse' },
    { t: (a, b) => `(\\hat ${a} - \\hat ${b})`, re: (a, b) => `\\hat ${a} - \\hat ${b}`, shape: 'line' },
    { t: (a, b) => `(2\\hat ${a} - j\\hat ${b})`, re: (a) => `2\\hat ${a}`, shape: 'ellipse' },
    { t: (a, b) => `(j\\hat ${a} + 2\\hat ${b})`, re: (a, b) => `2\\hat ${b}`, shape: 'ellipse' },
  ];
  GENS.rf_w1p_read = () => {
    const u = pick(AX), [c1, c2] = U.shuffle(AX.filter((a) => a !== u)), s = pick([1, -1]);
    const [b, bt] = pick(BETAS), amp = pick(AMPS);
    const sp = /[a-z]$/.test(bt) ? ' ' : '';
    const ph = `${amp.t(c1, c2)}\\,e^{${s > 0 ? '-' : '+'}j${bt}${sp}${u}}`;
    const lam = 2 * Math.PI / b;
    return one([
      () => MC('Direction of travel', md`$\Et = ${ph}$ V/m. The wave travels toward…`, md`$${s > 0 ? '+' : '-'}${u}$`,
        [[md`$${s > 0 ? '-' : '+'}${u}$`, md`The sign in the exponent is the opposite of the travel: $e^{-j\beta ${u}}$ goes toward $+${u}$.`], [md`$+${c1}$`, md`$\hat ${c1}$ is a direction of $\mathbf E$. A plane wave has no field along its travel.`], [md`$+${c2}$`, md`$\hat ${c2}$ is a direction of $\mathbf E$. The travel is the coordinate in the exponent.`], [md`$-${c1}$`, md`The travel is along the coordinate in the exponent, $${u}$.`]],
        md`The exponent has $${u}$, with a ${s > 0 ? 'minus' : 'plus'} sign: toward $${s > 0 ? '+' : '-'}${u}$.`),
      () => MC('Wavelength', md`$\Et = ${ph}$ V/m, with lengths in meters. The wavelength is…`, md`$${p(+lam.toFixed(4))}$ m`,
        [[md`$${p(+b.toFixed(4))}$ m`, md`That is $\beta$, in rad/m. $\lambda = 2\pi/\beta$.`], [md`$${p(+(1 / b).toFixed(4))}$ m`, md`That leaves out the $2\pi$.`], [md`$${p(+(b / (2 * Math.PI)).toFixed(4))}$ m`, md`That is $1/\lambda$, upside down.`], [md`$${p(+(2 * Math.PI * b).toFixed(3))}$ m`, md`That multiplies by $\beta$. A larger $\beta$ means a **shorter** wavelength.`]],
        md`$\beta = ${bt}$ rad/m, so $\lambda = 2\pi/\beta = ${p(+lam.toFixed(4))}$ m.`),
      () => {
        const fr = 3e8 / lam;
        return MC('Frequency, in free space', md`In free space, $\Et = ${ph}$ V/m, with lengths in meters. The frequency $f$ is…`, md`$${p(+fr.toPrecision(3))}$ Hz`,
          [[md`$${p(+(b * 3e8).toPrecision(3))}$ Hz`, md`That is $\omega = \beta c$, in rad/s. Divide by $2\pi$ for $f$.`], [md`$${p(+(3e8 / b).toPrecision(3))}$ Hz`, md`That is $c/\beta$; the frequency is $c/\lambda = \beta c/2\pi$.`], [md`$${p(+(fr * 2).toPrecision(3))}$ Hz`, md`That uses $\lambda/2$.`]],
          md`$f = c/\lambda = \beta c/2\pi = ${p(+fr.toPrecision(3))}$ Hz. The phasor alone does not give $f$: free space supplies $v = c$.`);
      },
      () => MC('The shape of the tip', md`$\Et = ${ph}$ V/m. At a fixed point, the tip of $\mathbf E$ traces…`, amp.shape === 'circle' ? 'a circle' : amp.shape === 'line' ? 'a line' : 'an ellipse',
        [['a circle', md`A circle needs equal sizes and a $90°$ phase difference.`], ['a line', md`A line needs the two components in phase or $180°$ apart (a real ratio).`], ['an ellipse', md`An ellipse is the general case: unequal sizes with a $j$ between them.`], ['nothing: it needs ω to tell', md`The shape comes from the bracket alone. $\omega$ only sets how fast the tip goes around.`]].filter((x) => x[0] !== (amp.shape === 'circle' ? 'a circle' : amp.shape === 'line' ? 'a line' : 'an ellipse')),
        md`Compare the two coefficients: ${amp.shape === 'circle' ? 'equal sizes, a factor $\\pm j$ apart: a circle.' : amp.shape === 'line' ? 'a real ratio, so the components rise and fall together: a line.' : 'a factor $j$ apart but unequal sizes: an ellipse.'}`),
      () => {
        const right = amp.re(c1, c2);
        const all = [`\\hat ${c1}`, `\\hat ${c2}`, `2\\hat ${c1}`, `2\\hat ${c2}`, `3\\hat ${c1}`, `2(\\hat ${c1} + \\hat ${c2})`, `\\hat ${c1} - \\hat ${c2}`, `-\\hat ${c2}`];
        const wr = U.shuffle(all.filter((x) => x !== right)).slice(0, 4).map((x) => [`$${x}$ V/m`, md`At $${u} = 0$, $t = 0$ the field is the real part of the bracket: drop the $j$ terms and keep the rest.`]);
        return MC('The field at the origin at t = 0', md`$\Et = ${ph}$ V/m. At $${u} = 0$ and $t = 0$, $\mathbf E$ is…`, `$${right}$ V/m`, wr,
          md`At $${u} = 0$ the exponential is 1, and at $t = 0$ the field is $\Re\{${amp.t(c1, c2)}\} = ${right}$.`);
      },
    ]);
  };

  // ---------------------------------------------------------------- level 1: H from E and back
  GENS.rf_w1p_h = () => {
    const u = pick(AX), s = pick([1, -1]), others = AX.filter((a) => a !== u);
    const n = pick([1, 2, 3]), eta = 120 / n;                           // eta / pi
    const med = n === 1 ? 'free space' : md`a lossless, nonmagnetic medium with $\epsilon_r = ${n * n}$`;
    const ep = `e^{${s > 0 ? '-' : '+'}j\\beta ${u}}`;
    return one([
      // H from a one-component E
      () => {
        const c = pick(others), E0 = pick([3, 6, 12, 30, 60]), [d, sd] = cross(u, c), hs = s * sd;
        const amp = (x) => `${p(+(x).toFixed(4))}`;
        const H = `${amp(E0 / eta)}/\\pi`;
        return MC('H from E', md`In ${med}, $\Et = ${E0}\hat ${c}\,${ep}$ V/m. Then $\Ht$ is…`, md`$${hs < 0 ? '-' : ''}\tfrac{${E0}}{${eta}\pi}\hat ${d}\,${ep}$ A/m`,
          [[md`$${hs > 0 ? '-' : ''}\tfrac{${E0}}{${eta}\pi}\hat ${d}\,${ep}$ A/m`, md`The sign is flipped: $\hat k = ${unitTex(s, u)}$, and $\hat k\times\hat ${c} = ${unitTex(hs, d)}$.`], [md`$\tfrac{${E0}}{${eta}\pi}\hat ${c}\,${ep}$ A/m`, md`$\Ht$ is perpendicular to $\Et$: turn it $90°$ about the travel.`], [md`$${hs < 0 ? '-' : ''}${E0 * eta}\pi\,\hat ${d}\,${ep}$ A/m`, md`That multiplies by $\eta$. $\Ht = \hat k\times\Et/\eta$.`], [md`$${hs < 0 ? '-' : ''}\tfrac{${E0}}{120\pi}\hat ${d}\,${ep}$ A/m`, md`That uses $\eta_0$. In this medium $\eta = ${eta}\pi\ \Omega$.`]].filter((x, i) => !(n === 1 && i === 3)),
          md`$\hat k = ${unitTex(s, u)}$ from the exponent. $\hat k\times\hat ${c} = ${unitTex(hs, d)}$. Divide by $\eta = ${eta}\pi\ \Omega$ (that is $${H}$ A/m in size).`);
      },
      // E from H
      () => {
        const c = pick(others), H0 = pick([0.1, 0.2, 0.5, 1]), [d, sd] = cross(c, u), es = s * sd, E0 = +(H0 * eta).toFixed(4);
        return MC('E from H', md`In ${med}, $\Ht = ${H0}\hat ${c}\,${ep}$ A/m. Then $\Et$ is…`, md`$${es < 0 ? '-' : ''}${p(E0)}\pi\,\hat ${d}\,${ep}$ V/m`,
          [[md`$${es > 0 ? '-' : ''}${p(E0)}\pi\,\hat ${d}\,${ep}$ V/m`, md`The sign is flipped. $\Et = \eta\,\Ht\times\hat k$, and $\hat ${c}\times(${unitTex(s, u)}) = ${unitTex(es, d)}$.`], [md`$${p(E0)}\pi\,\hat ${c}\,${ep}$ V/m`, md`$\Et$ is perpendicular to $\Ht$.`], [md`$${es < 0 ? '-' : ''}${p(+(H0 / eta).toFixed(5))}/\pi\,\hat ${d}\,${ep}$ V/m`, md`That divides by $\eta$. $\Et$ is $\eta$ times $\Ht$.`]],
          md`$\Et = \eta\,\Ht\times\hat k = ${eta}\pi(${H0})\,\hat ${c}\times(${unitTex(s, u)})\,${ep} = ${es < 0 ? '-' : ''}${p(E0)}\pi\,\hat ${d}\,${ep}$. Check: $\Et\times\Ht$ along $${unitTex(s, u)}$ ✓.`);
      },
      // two components with a j
      () => {
        const [c1, c2] = U.shuffle(others), sj = pick([1, -1]);
        const [d1, s1] = cross(u, c1), [d2, s2] = cross(u, c2);   // d1 = c2, d2 = c1
        const a1 = s * s1, a2 = s * s2 * sj;                        // H = (a1 c2 + j a2 c1)/eta
        const Ht = (x1, x2) => `\\tfrac{1}{${eta}\\pi}(${x1 < 0 ? '-' : ''}\\hat ${d1} ${x2 < 0 ? '-' : '+'} j\\hat ${d2})\\,${ep}`;
        return MC('H of a two-component wave', md`In ${med}, $\Et = (\hat ${c1} ${sj > 0 ? '+' : '-'} j\hat ${c2})\,${ep}$ V/m. Then $\Ht$ in A/m is…`, md`$${Ht(a1, a2)}$`,
          [[md`$${Ht(-a1, -a2)}$`, md`Both signs are flipped: that is $\hat k$ with the wrong sign. The exponent says $\hat k = ${unitTex(s, u)}$.`], [md`$${Ht(a1, -a2)}$`, md`The $j$ term has the wrong sign. $\hat k\times(${sj > 0 ? '+' : '-'}j\hat ${c2}) = ${a2 > 0 ? '+' : '-'}j\hat ${d2}$.`], [md`$\tfrac{1}{${eta}\pi}(\hat ${c1} ${sj > 0 ? '+' : '-'} j\hat ${c2})\,${ep}$`, md`That keeps $\Et$'s directions. Each component turns $90°$ about the travel.`], [md`$${Ht(-a1, a2)}$`, md`The real term has the wrong sign: $\hat k\times\hat ${c1} = ${unitTex(a1, d1)}$.`]],
          md`$\hat k = ${unitTex(s, u)}$. $\hat k\times\hat ${c1} = ${unitTex(a1, d1)}$ and $\hat k\times(${sj > 0 ? '+' : '-'}j\hat ${c2}) = ${a2 > 0 ? '+' : '-'}j\hat ${d2}$. Divide by $\eta = ${eta}\pi$. The $j$ rides along with its component.`);
      },
      // the curl of a one-component field
      () => {
        const c = pick(others), [d, sd] = cross(u, c), [b, bt] = pick(BETAS), E0 = pick([2, 3, 5]);
        const sp = /[a-z]$/.test(bt) ? ' ' : '', e = `e^{${s > 0 ? '-' : '+'}j${bt}${sp}${u}}`;
        // curl = (-j s beta) u x E
        const k = -s * sd;
        const cv = (sg, j = true) => md`$${sg < 0 ? '-' : ''}${j ? 'j' : ''}${co(String(E0))}${bt === '2' || bt === '4' || bt === '6' || bt === '10' ? `(${bt})` : bt}\,\hat ${d}\,${e}$`;
        return MC('One curl', md`$\Et = ${E0}\hat ${c}\,${e}$. Then $\nabla\times\Et$ is…`, cv(k),
          [[cv(-k), md`The sign is off. Use $\partial/\partial ${u}\to${s > 0 ? '-' : '+'}j${bt}$ in the sheet's formula, minus signs included.`], [cv(k, false), md`The derivative of an imaginary exponential keeps the $j$.`], [md`$${k < 0 ? '-' : ''}j${co(String(E0))}${bt === '2' || bt === '4' || bt === '6' || bt === '10' ? `(${bt})` : bt}\,\hat ${c}\,${e}$`, md`A curl is perpendicular to the field here: it points along $\hat k\times\hat ${c}$.`], [md`$0$`, md`The field varies along $${u}$, across its own direction, so it curls.`]],
          md`For $${e}$, $\nabla\to${s > 0 ? '-' : '+'}j${bt}\hat ${u}$. So $\nabla\times\Et = (${s > 0 ? '-' : '+'}j${bt})\hat ${u}\times${E0}\hat ${c}$, and $\hat ${u}\times\hat ${c} = ${unitTex(sd, d)}$.`);
      },
    ]);
  };

  // ---------------------------------------------------------------- level 1: can it exist?
  GENS.rf_w1p_valid = () => one([
    // one valid field among broken ones
    () => {
      const wc = pick([1, 2, 3]), u = pick(AX), s = pick([1, -1]), c = pick(AX.filter((a) => a !== u)), E0 = pick([2, 5, 10]);
      const e = (b) => `e^{${s > 0 ? '-' : '+'}j${b}${u}}`;
      return MC('Which one can exist?', md`Which is a valid plane wave in free space at $\omega = ${p(wc * 3e8)}$ rad/s? (Lengths in meters.)`, md`$${E0}\hat ${c}\,${e(wc)}$`,
        [[md`$${E0}\hat ${u}\,${e(wc)}$`, md`It points along its own travel: $\nabla\cdot\Et \ne 0$.`], [md`$${E0}\hat ${c}\,${e(2 * wc)}$`, md`$\beta$ is twice $\omega/c$: that would need $\epsilon_r = 4$.`], [md`$${E0}(\hat ${c} + j\hat ${u})\,${e(wc)}$`, md`The $\hat ${u}$ part lies along the travel, which Gauss's law forbids.`], [md`$${E0}\hat ${c}\,e^{-${wc}${u}}$`, md`A real exponent only decays; nothing travels. A lossless medium needs an imaginary exponent.`]],
        md`Free space needs $\beta = \omega/c = ${wc}$ rad/m and no component along the travel, $\hat ${u}$.`);
    },
    // an E-H pair with at most one defect
    () => {
      const defect = pick(['none', 'dir', 'ratio', 'para']);
      const u = pick(AX), c = pick(AX.filter((a) => a !== u)), [d, sd] = cross(u, c), E0 = pick([12, 24, 60]);
      const sg = (x) => (x < 0 ? '-' : '');
      const Htex = defect === 'dir' ? `${sg(-sd)}\\tfrac{${E0}}{120\\pi}\\hat ${d}` : defect === 'ratio' ? `${sg(sd)}\\tfrac{${E0}}{60\\pi}\\hat ${d}` : defect === 'para' ? `\\tfrac{${E0}}{120\\pi}\\hat ${c}` : `${sg(sd)}\\tfrac{${E0}}{120\\pi}\\hat ${d}`;
      const opts = {
        none: ['valid', md`All three tests pass: transverse, $\Et\times\Ht^*$ along $+\hat ${u}$, and $|\tilde E|/|\tilde H| = 120\pi$.`],
        dir: [md`not valid: $\Et\times\Ht^*$ points against the travel`, md`$\Et\times\Ht^*$ points along $-\hat ${u}$, but $e^{-j\beta ${u}}$ travels toward $+${u}$.`],
        ratio: [md`not valid: $|\tilde E|/|\tilde H|$ is not $\eta_0$`, md`The ratio is $60\pi$, but free space needs $120\pi$.`],
        para: [md`not valid: $\Ht$ is parallel to $\Et$`, md`$\Ht$ must be perpendicular to $\Et$ and to the travel.`],
      };
      return MC('Is this pair a wave?', md`In free space, $\Et = ${E0}\hat ${c}\,e^{-j\beta ${u}}$ V/m and $\Ht = ${Htex}\,e^{-j\beta ${u}}$ A/m, with $\beta = \omega/c$. The pair is…`, opts[defect][0],
        Object.keys(opts).filter((k) => k !== defect).map((k) => [opts[k][0], defect === 'none' ? md`Check it: ${opts.none[1]}` : md`That is not the problem here. ${opts[defect][1]}`]),
        opts[defect][1]);
    },
    // the epsilon_r that makes it valid
    () => {
      const n = pick([1.5, 2, 3, 1.2]), wc = pick([1, 2, 4]), b = +(n * wc).toFixed(4), u = pick(AX), c = pick(AX.filter((a) => a !== u));
      return MC('The medium that fits', md`$\Et = 5\hat ${c}\,e^{-j${p(b)}${u}}$ V/m at $\omega = ${p(wc * 3e8)}$ rad/s. What $\epsilon_r$ of a lossless nonmagnetic medium makes it a valid wave?`, md`$${p(+(n * n).toFixed(4))}$`,
        [[md`$${p(n)}$`, md`That is $\sqrt{\epsilon_r} = \beta c/\omega$. Square it.`], [md`$${p(+(1 / (n * n)).toFixed(4))}$`, md`That is upside down: a larger $\beta$ needs a larger $\epsilon_r$.`], [md`$${p(+(n * n * n * n).toFixed(4))}$`, md`That squares twice.`], [md`$1$`, md`Free space would need $\beta = \omega/c = ${wc}$ rad/m.`]],
        md`$\sqrt{\epsilon_r} = \beta c/\omega = ${p(b)}/${wc} = ${p(n)}$, so $\epsilon_r = ${p(+(n * n).toFixed(4))}$.`);
    },
    // eta from a given pair
    () => {
      const etaPi = pick([40, 60, 80, 120, 240]), H0 = pick([0.1, 0.5, 1, 2]), E0 = +(etaPi * H0).toFixed(4);
      return MC('η from the ratio', md`A plane wave has $\Et = ${p(E0)}\pi\,\hat x\,e^{-j\beta z}$ V/m and $\Ht = ${H0}\,\hat y\,e^{-j\beta z}$ A/m. The medium's $\eta$ is…`, md`$${etaPi}\pi\ \Omega$`,
        [[md`$${p(+(H0 / E0).toPrecision(3))}/\pi\ \Omega$`, md`That is $|\tilde H|/|\tilde E|$, upside down.`], [md`$120\pi\ \Omega$`, md`That assumes free space. The ratio decides.`], [md`$${p(+(E0 * H0).toPrecision(3))}\pi\ \Omega$`, md`That multiplies instead of dividing.`]].filter((x) => x[0] !== md`$${etaPi}\pi\ \Omega$`),
        md`$\eta = |\tilde E|/|\tilde H| = ${p(E0)}\pi/${H0} = ${etaPi}\pi\ \Omega$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2: H by Faraday, with the medium
  GENS.w1p_faraday = () => {
    const u = pick(AX), [c1, c2] = U.shuffle(AX.filter((a) => a !== u)), s = pick([1, -1]), sj = pick([1, -1]);
    const n = pick([1, 1.5, 2, 3]), wc = pick([1, 2, 4]), b = n * wc, w = wc * 3e8, eta = 120 * Math.PI / n;
    const A = pick([2, 3, 4, 6]), B = pick([1, 2, 3, 5]);
    const [d1, s1] = cross(u, c1), [d2, s2] = cross(u, c2);      // d1 = c2, d2 = c1
    const h2 = s * s1 * A / eta, h1 = s * s2 * sj * B / eta;       // H = h2 c2 + j h1 c1
    const ep = `e^{${s > 0 ? '-' : '+'}j${p(b)}${u}}`;
    return {
      title: 'H by Faraday\'s law, and the medium',
      q: md`A lossless, nonmagnetic medium carries $\Et = (${A}\hat ${c1} ${sj > 0 ? '+' : '-'} j${B}\hat ${c2})\,${ep}$ V/m at $\omega = ${p(w)}$ rad/s (lengths in meters). Find $\epsilon_r$ and $\eta$. Then write $\Ht = (H_${c2}\hat ${c2} + jH'_${c1}\hat ${c1})\,${ep}$ and find the real numbers $H_${c2}$ and $H'_${c1}$ (signs included).`,
      parts: [
        Object.assign(N('\\epsilon_r', n * n, ''), { traps: [{ v: n, msg: 'That is √εᵣ = βc/ω. Square it.' }] }),
        Object.assign(N('\\eta', eta, 'Ω'), { traps: [{ v: 120 * Math.PI / (n * n), msg: 'η = 120π/√εᵣ, not 120π/εᵣ.' }] }),
        Object.assign(N(`H_${c2}`, h2, 'A/m'), { traps: [{ v: -h2, msg: `Check the sign: k̂ = ${s > 0 ? '+' : '−'}${u}̂ from the exponent, and k̂ × ${c1}̂ decides the direction.` }, { v: A * eta, msg: 'That multiplies by η. H is E divided by η.' }] }),
        Object.assign(N(`H'_${c1}`, h1, 'A/m'), { traps: [{ v: -h1, msg: 'Check the sign of the j term: k̂ × (±j c₂) keeps the ± and turns the direction.' }] }),
      ],
      hints: [md`$\beta = ${p(b)}$ rad/m $= \omega\sqrt{\epsilon_r}/c$. Then $\eta = 120\pi/\sqrt{\epsilon_r}$.`, md`$\Ht = \hat k\times\Et/\eta$ with $\hat k = ${unitTex(s, u)}$. Or the curl: $\Ht = \frac{j}{\omega\mu}\nabla\times\Et$ with $\partial/\partial ${u}\to${s > 0 ? '-' : '+'}j${p(b)}$.`],
      sol: md`
        **Step 1: the medium.** The exponent gives $\beta = ${p(b)}$ rad/m. From $\beta = \omega\sqrt{\epsilon_r}/c$:
        $$\sqrt{\epsilon_r} = \frac{\beta c}{\omega} = \frac{(${p(b)})(3\times10^8)}{${p(w)}} = ${p(n)}$$
        So $\epsilon_r = ${p(n * n)}$ and
        $$\eta = \frac{120\pi}{${p(n)}} = ${f(eta)}\ \Omega$$
        **Step 2: the direction.** $${s > 0 ? '-' : '+'}$ in the exponent: $\hat k = ${unitTex(s, u)}$. The bracket has no $\hat ${u}$ part ✓.

        **Step 3: turn each component.**
        $$\hat k\times\hat ${c1} = ${unitTex(s * s1, d1)}$$
        $$\hat k\times\hat ${c2} = ${unitTex(s * s2, d2)}$$
        So
        $$\hat k\times\Et = (${s * s1 * A > 0 ? '' : '-'}${A}\hat ${d1} ${s * s2 * sj > 0 ? '+' : '-'} j${B}\hat ${d2})\,${ep}$$
        **Step 4: divide by η.**
        $$H_${c2} = \frac{${s * s1 * A}}{${f(eta)}} = ${f(h2)}\ \text{A/m}$$
        $$H'_${c1} = \frac{${s * s2 * sj * B}}{${f(eta)}} = ${f(h1)}\ \text{A/m}$$
        **Check by the curl.** For $${ep}$, every $\partial/\partial ${u}$ is $${s > 0 ? '-' : '+'}j${p(b)}$, so $\nabla\times\Et = (${s > 0 ? '-' : '+'}j${p(b)})\,\hat ${u}\times\Et$. Faraday gives $\Ht = \frac{j}{\omega\mu_0}\nabla\times\Et$, and $j\cdot(${s > 0 ? '-' : '+'}j) = ${s > 0 ? '+' : '-'}1$:
        $$\Ht = ${s > 0 ? '' : '-'}\frac{${p(b)}}{\omega\mu_0}\,\hat ${u}\times\Et$$
        And $\beta/\omega\mu_0 = ${p(b)}/(${p(w)}\cdot4\pi\times10^{-7}) = 1/${f(eta)} = 1/\eta$ ✓: the same as the shortcut.

        **Check by the right-hand rule.** $\hat ${c1}\times(${unitTex(s * s1, d1)}) = ${unitTex(s, u)}$, the travel ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: the medium from E and H (mu_r too)
  const MEDS = [[1, 4], [1, 9], [2, 2], [2, 8], [4, 1], [4, 4], [4, 9], [9, 4], [8, 2]];
  GENS.w1p_medium = () => {
    const [mr, er] = pick(MEDS), wc = pick([1, 2, 4]), w = wc * 3e8, b = wc * Math.sqrt(mr * er), eta = 120 * Math.PI * Math.sqrt(mr / er);
    const u = pick(AX), c = pick(AX.filter((a) => a !== u)), [d, sd] = cross(u, c), E0 = pick([6, 12, 24, 60]), H0 = E0 / eta;
    const etaPi = 120 * Math.sqrt(mr / er), v = w / b;
    return {
      title: 'The medium from one wave',
      q: md`A lossless medium carries $\Et = ${E0}\hat ${c}\,e^{-j${p(b)}${u}}$ V/m and $\Ht = ${sd < 0 ? '-' : ''}\tfrac{${E0}}{${p(etaPi)}\pi}\hat ${d}\,e^{-j${p(b)}${u}}$ A/m at $\omega = ${p(w)}$ rad/s (lengths in meters). The medium may be magnetic. Find $\eta$, the phase speed $v_p$, $\mu_r$ and $\epsilon_r$.`,
      parts: [
        N('\\eta', eta, 'Ω'),
        N('v_p', v, 'm/s'),
        Object.assign(N('\\mu_r', mr, ''), { traps: mr !== 1 ? [{ v: 1, msg: 'The medium may be magnetic: use μ = ηβ/ω.' }] : [] }),
        Object.assign(N('\\epsilon_r', er, ''), { traps: mr !== 1 ? [{ v: mr * er, msg: 'That is (βc/ω)², which equals μᵣεᵣ. It is εᵣ only if μᵣ = 1.' }] : [] }),
      ],
      hints: [md`$\eta = |\tilde E|/|\tilde H|$ and $v_p = \omega/\beta$.`, md`From $\eta\gamma = j\omega\mu$ with $\gamma = j\beta$: $\mu = \eta\beta/\omega$. From $\gamma/\eta = j\omega\epsilon$: $\epsilon = \beta/(\omega\eta)$.`],
      sol: md`
        **Step 1: η.** Divide the sizes:
        $$\eta = \frac{${E0}}{${E0}/(${p(etaPi)}\pi)} = ${p(etaPi)}\pi = ${f(eta)}\ \Omega$$
        **Step 2: the phase speed.**
        $$v_p = \frac{\omega}{\beta} = \frac{${p(w)}}{${p(b)}} = ${f(v)}\ \text{m/s}$$
        **Step 3: μ.** With $\gamma = j\beta$, $\eta\gamma = j\omega\mu$ gives $\mu = \eta\beta/\omega$:
        $$\mu = \frac{(${f(eta)})(${p(b)})}{${p(w)}} = ${f(eta * b / w)}\ \text{H/m}$$
        Divide by $\mu_0 = 4\pi\times10^{-7}$: $\mu_r = ${mr}$.

        **Step 4: ε.** $\gamma/\eta = j\omega\epsilon$ gives $\epsilon = \beta/(\omega\eta)$:
        $$\epsilon = \frac{${p(b)}}{(${p(w)})(${f(eta)})} = ${f(b / (w * eta))}\ \text{F/m}$$
        Divide by $\epsilon_0 = \tfrac{1}{36\pi}\times10^{-9}$: $\epsilon_r = ${er}$.

        **Check.** $\eta = 120\pi\sqrt{\mu_r/\epsilon_r} = 120\pi\sqrt{${mr}/${er}}$ ✓ and $\beta = (\omega/c)\sqrt{\mu_r\epsilon_r} = ${wc}\sqrt{${mr * er}} = ${p(b)}$ ✓.

        **Speed path.** $\eta/120\pi = \sqrt{\mu_r/\epsilon_r} = ${p(Math.sqrt(mr / er))}$ and $\beta c/\omega = \sqrt{\mu_r\epsilon_r} = ${p(Math.sqrt(mr * er))}$. Multiply them: $\mu_r = ${mr}$. Divide them: $\epsilon_r = ${er}$.
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: from a phasor to values in time
  GENS.w1p_back = () => {
    const u = pick(AX), [c1, c2] = U.shuffle(AX.filter((a) => a !== u)), s = pick([1, -1]);
    const [b, bt, lam] = pick([[Math.PI, '\\pi', 2], [2 * Math.PI, '2\\pi', 1], [Math.PI / 2, '\\tfrac{\\pi}{2}', 4]]);
    let A, B, p1, p2, uf, tf, e1, e2, hv;
    for (let i = 0; i < 500; i++) {
      A = pick([1, 2, 3, 4]); B = pick([1, 2, 3, 4]); p1 = pick([0, 30, 45, 60, -30, -45]); p2 = pick([90, -90, 0, 180, 60, -60, 120]);
      uf = pick([[1, 8], [1, 4], [1, 6], [3, 8], [1, 3]]); tf = pick([[1, 8], [1, 4], [1, 6], [1, 12], [1, 3]]);
      const th = 360 * tf[0] / tf[1] - s * 360 * uf[0] / uf[1];
      e1 = A * Math.cos((th + p1) * DEG); e2 = B * Math.cos((th + p2) * DEG);
      const [d1, s1] = cross(u, c1); hv = s * s1 * e1 / (120 * Math.PI);    // the H component paired with c1, along d1 = c2
      if (Math.abs(e1) > 1e-6 && Math.abs(e2) > 1e-6 && A !== B) break;
    }
    const [d1, s1] = cross(u, c1);
    const u1 = lam * uf[0] / uf[1];
    const vec = `(${pol(A, p1)}\\,\\hat ${c1} + ${pol(B, p2)}\\,\\hat ${c2})`;
    const th0 = 360 * tf[0] / tf[1], thu = s * 360 * uf[0] / uf[1];
    return {
      title: 'From the phasor to the field at a point',
      q: md`In free space, $\Et = ${vec}\,e^{${s > 0 ? '-' : '+'}j${bt}${/[a-z]$/.test(bt) ? ' ' : ''}${u}}$ V/m, with lengths in meters. Find $E_${c1}$ and $E_${c2}$ at $${u} = ${TL.frac(u1)}$ m and $t = T/${tf[1]}$, and $H_${d1}$ at the same point and time.`,
      parts: [
        N(`E_${c1}`, e1, 'V/m'),
        Object.assign(N(`E_${c2}`, e2, 'V/m'), { traps: [{ v: B * Math.cos((th0 + thu + p2) * DEG), msg: 'That uses the wrong sign on β·' + u + '. The exponent’s sign is the sign inside the cosine.' }].filter((t) => Math.abs(t.v - e2) > 0.05 * Math.abs(e2)) }),
        Object.assign(N(`H_${d1}`, hv, 'A/m'), { traps: [{ v: -hv, msg: `Check k̂: the exponent says ${s > 0 ? '+' : '−'}${u}, and k̂ × ${c1}̂ sets the sign.` }] }),
      ],
      hints: [md`Each component: $A\cos(\omega t ${s > 0 ? '-' : '+'} \beta ${u} + \phi)$. Here $\omega t = 360°\cdot t/T$ and $\beta ${u} = 360°\cdot ${u}/\lambda$, with $\lambda = ${lam}$ m.`, md`$\Ht = \hat k\times\Et/120\pi$ with $\hat k = ${unitTex(s, u)}$: the $\hat ${c1}$ part of $\Et$ makes the $\hat ${d1}$ part of $\Ht$.`],
      sol: md`
        **Step 1: the angles.** $\lambda = 2\pi/\beta = ${lam}$ m. At $${u} = ${TL.frac(u1)}$ m, $\beta ${u} = 360°\times\tfrac{${uf[0]}}{${uf[1]}} = ${dg(360 * uf[0] / uf[1])}$. At $t = T/${tf[1]}$, $\omega t = ${dg(th0)}$.

        **Step 2: the time-domain components.** Multiply by $e^{j\omega t}$ and take the real part:
        $$E_${c1} = ${A}\cos(\omega t ${s > 0 ? '-' : '+'} \beta ${u}${phs(p1)})$$
        $$E_${c2} = ${B}\cos(\omega t ${s > 0 ? '-' : '+'} \beta ${u}${phs(p2)})$$
        **Step 3: substitute.**
        $$E_${c1} = ${A}\cos(${dg(th0)} ${s > 0 ? '-' : '+'} ${dg(360 * uf[0] / uf[1])}${phs(p1)}) = ${f(e1)}\ \text{V/m}$$
        $$E_${c2} = ${B}\cos(${dg(th0)} ${s > 0 ? '-' : '+'} ${dg(360 * uf[0] / uf[1])}${phs(p2)}) = ${f(e2)}\ \text{V/m}$$
        **Step 4: H.** $\hat k = ${unitTex(s, u)}$ and $\hat k\times\hat ${c1} = ${unitTex(s * s1, d1)}$, so $\Ht$ has the $\hat ${d1}$ part $${s * s1 < 0 ? '-' : ''}\tilde E_${c1}/120\pi$, and in time
        $$H_${d1} = \frac{${s * s1 < 0 ? '-' : ''}E_${c1}}{120\pi} = ${f(hv)}\ \text{A/m}$$
        **Check.** $E_${c1}\hat ${c1}\times H_${d1}\hat ${d1}$ has the sign of $E_${c1}^2$ times $${unitTex(s, u)}$: along the travel ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3: one phasor, everything out
  GENS.w1p_wave = () => {
    const u = pick(AX), [c1, c2] = U.shuffle(AX.filter((a) => a !== u)), s = pick([1, -1]);
    const n = pick([1.5, 2, 3]), wc = pick([1, 2, 4]), w = wc * 3e8, b = n * wc, eta = 120 * Math.PI / n, lam = 2 * Math.PI / b;
    const E0 = pick([2, 3, 6, 10]);
    const [a, bb, zeta] = pick([[1, 1, 'j'], [1, 1, '-j'], [1, 2, 'j'], [2, 1, '-j'], [1, 1, '1'], [1, 2, '-1'], [3, 4, 'j'], [2, 2, '1']]);
    const shape = zeta === '1' || zeta === '-1' ? 1 : (a === bb ? 0 : 2);
    const zs = zeta.startsWith('-') ? -1 : 1, zj = zeta.includes('j');
    const [d1, s1] = cross(u, c1), [d2, s2] = cross(u, c2);
    const ep = `e^{${s > 0 ? '-' : '+'}j${p(b)}${u}}`;
    const co2 = `${zs < 0 ? '-' : '+'} ${zj ? 'j' : ''}${co(String(bb))}\\hat ${c2}`;
    const Et = `${E0}(${co(String(a))}\\hat ${c1} ${co2})`;
    // H = (E0/eta) [ a (s s1) d1 + zs zj bb (s s2) d2 ]
    const hA = s * s1 * a, hB = s * s2 * zs * bb;
    const Hopt = (x, y, scale) => md`$${scale}(${x < 0 ? '-' : ''}${co(String(Math.abs(x)))}\hat ${d1} ${y < 0 ? '-' : '+'} ${zj ? 'j' : ''}${co(String(Math.abs(y)))}\hat ${d2})\,${ep}$`;
    const sc = `\\tfrac{${E0}}{${p(120 / n)}\\pi}`;
    const hv = E0 * hA / eta;                                     // H along d1 at the origin, t = 0
    const S = E0 * E0 * (a * a + bb * bb) / (2 * eta);
    const dirs = [`+${u}`, `-${u}`, `+${c1}`, `-${c2}`];
    return {
      title: 'A plane wave from its phasor',
      q: md`A lossless, nonmagnetic medium carries $\Et = ${Et}\,${ep}$ V/m at $\omega = ${p(w)}$ rad/s (lengths in meters).`,
      parts: [
        { lbl: md`(a) The wave travels toward`, mc: dirs.map((x) => md`$${x}$`), a: s > 0 ? 0 : 1,
          why: dirs.map((x, i) => (i === (s > 0 ? 0 : 1) ? null : i < 2 ? md`The sign in the exponent is opposite to the travel: $e^{-j\beta ${u}}$ goes toward $+${u}$.` : md`$\hat ${x.slice(1)}$ is a direction of $\mathbf E$; the travel is the coordinate in the exponent.`)) },
        Object.assign(N('(b)\\ \\epsilon_r', n * n, ''), { traps: [{ v: n, msg: 'That is √εᵣ. Square it.' }] }),
        Object.assign(N('(c)\\ \\lambda', lam, 'm'), { traps: [{ v: 1 / lam, msg: 'That is β/2π, upside down.' }] }),
        { lbl: md`(d) $\Ht$ is`, mc: [Hopt(hA, hB, sc), Hopt(-hA, -hB, sc), Hopt(hA, -hB, sc), Hopt(hA, hB, `${E0 * 120 / n}\\pi`)], a: 0,
          why: [null, md`Both signs flipped: $\hat k$ has the wrong sign. The exponent gives $\hat k = ${unitTex(s, u)}$.`, md`The second term's sign is wrong: $\hat k\times\hat ${c2} = ${unitTex(s * s2, d2)}$, and the coefficient's sign rides along.`, md`That multiplies by $\eta$ instead of dividing.`] },
        Object.assign(N(`(e)\\ H_${d1}\\text{ at the origin, }t = 0`, hv, 'A/m'), { traps: [{ v: -hv, msg: 'The sign of k̂ × ' + c1 + '̂ decides it.' }] }),
        Object.assign(N('(f)\\ |\\langle\\mathbf S\\rangle|', S, 'W/m²'), { traps: [{ v: 2 * S, msg: 'That leaves out the ½ of the time average.' }, { v: E0 * E0 * (a + bb) ** 2 / (2 * eta), msg: 'Add the squares of the two parts, not the parts.' }] }),
        { lbl: md`(g) At a fixed point the tip of $\mathbf E$ traces`, mc: [md`a circle`, md`a line`, md`an ellipse`], a: shape,
          why: [md`A circle needs equal sizes and a factor $\pm j$ between them.`, md`A line needs a real ratio between the components.`, md`An ellipse is the general case: a $j$ between unequal sizes.`].map((x, i) => (i === shape ? null : x)) },
      ],
      hints: [md`Sign of the exponent: direction. $\beta = ${p(b)}$ rad/m $= \omega\sqrt{\epsilon_r}/c$; $\lambda = 2\pi/\beta$.`, md`$\Ht = \hat k\times\Et/\eta$ with $\eta = 120\pi/\sqrt{\epsilon_r}$. For a plane wave $|\langle\mathbf S\rangle| = |\tilde{\mathbf E}_0|^2/2\eta$, where $|\tilde{\mathbf E}_0|^2$ adds the squared sizes of the components.`],
      sol: md`
        **(a) Direction.** ${s > 0 ? 'Minus' : 'Plus'} sign on $${p(b)}${u}$: toward $${s > 0 ? '+' : '-'}${u}$. No $\hat ${u}$ in the bracket ✓.

        **(b) The medium.**
        $$\sqrt{\epsilon_r} = \frac{\beta c}{\omega} = \frac{${p(b)}\times3\times10^8}{${p(w)}} = ${p(n)}$$
        So $\epsilon_r = ${p(n * n)}$, and $\eta = 120\pi/${p(n)} = ${p(120 / n)}\pi\ \Omega = ${f(eta)}\ \Omega$.

        **(c) Wavelength.**
        $$\lambda = \frac{2\pi}{${p(b)}} = ${f(lam)}\ \text{m}$$
        **(d) H.** $\hat k = ${unitTex(s, u)}$:
        $$\hat k\times\hat ${c1} = ${unitTex(s * s1, d1)}, \quad \hat k\times\hat ${c2} = ${unitTex(s * s2, d2)}$$
        Turn each component, keep its coefficient (and its $j$), divide by $\eta$:
        $$\Ht = ${sc}(${hA < 0 ? '-' : ''}${co(String(Math.abs(hA)))}\hat ${d1} ${hB < 0 ? '-' : '+'} ${zj ? 'j' : ''}${co(String(Math.abs(hB)))}\hat ${d2})\,${ep}$$
        in A/m.

        **(e) A value.** At the origin at $t = 0$ the field is the real part of the phasor. The $\hat ${d1}$ part is real:
        $$H_${d1} = \frac{${E0 * hA}}{${f(eta)}} = ${f(hv)}\ \text{A/m}$$
        **(f) Power.** $\langle\mathbf S\rangle = \tfrac12\Re\{\Et\times\Ht^*\}$. For a plane wave this is $|\tilde{\mathbf E}_0|^2/2\eta$ along $\hat k$, and the squared sizes of the two components add:
        $$|\tilde{\mathbf E}_0|^2 = ${E0}^2(${a}^2 + ${bb}^2) = ${E0 * E0 * (a * a + bb * bb)}$$
        $$|\langle\mathbf S\rangle| = \frac{${E0 * E0 * (a * a + bb * bb)}}{2(${f(eta)})} = ${f(S)}\ \text{W/m}^2$$
        **(g) Shape.** ${shape === 0 ? 'Equal sizes and a factor $\\pm j$: a circle.' : shape === 1 ? 'A real ratio: the components rise and fall together, a line.' : 'A factor $\\pm j$ between unequal sizes: an ellipse.'}

        **Speed path.** Exponent first (direction, $\beta$, then $\epsilon_r$ and $\lambda$). $\Ht$ by turning, not by the curl. Power: add the squares, divide by $2\eta$.

        **Where points go.** $\hat k$ with the wrong sign (every sign of $\Ht$ flips); $\epsilon_r = \sqrt{\epsilon_r}$; dropping the $\tfrac12$; adding amplitudes before squaring.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank (lesson 2)
  EM.BANK['w1-maxwell'] = [
    Q(md`$\nabla\cdot\tilde{\mathbf B}$ equals…`, [md`$0$`, md`$j\omega\tilde\rho$`, md`$-j\omega\mu\Ht$`, md`$\tilde\rho$`], 0,
      [null, md`There is no magnetic charge, at any frequency.`, md`That is a curl law's right side, and a vector; a divergence is a scalar.`, md`$\tilde\rho$ goes with $\nabla\cdot\tilde{\mathbf D}$.`],
      md`$\nabla\cdot\mathbf B = 0$ has no time derivative, so in phasors it is $\nabla\cdot\tilde{\mathbf B} = 0$.`),
    Q(md`Why may we drop "$\Re$" and equate the phasors in $\Re\{Xe^{j\omega t}\} = 0$?`, [md`It holds at every $t$: $t = 0$ forces $\Re X = 0$ and $\omega t = -90°$ forces $\Im X = 0$`, md`Because $e^{j\omega t}$ is never zero`, md`Because $X$ is always real`, md`It is only an approximation`], 0,
      [null, md`$e^{j\omega t} \ne 0$ is true, but a real part can vanish at one instant. It is "every instant" that does it.`, md`$X$ is complex in general.`, md`It is exact.`],
      md`Two instants a quarter period apart pin down both parts of $X$.`),
    Q(md`In free space at $f = 300$ MHz, $\beta$ is…`, [md`$2\pi$ rad/m`, md`$1$ rad/m`, md`$\pi$ rad/m`, md`$300$ rad/m`], 0,
      [null, md`That is $\omega/c$ with $\omega$ mistaken for $f$: $3\times10^8/3\times10^8$.`, md`$\lambda = 1$ m, so $\beta = 2\pi/\lambda = 2\pi$.`, md`$\beta$ is not $f$ in MHz.`],
      md`$\lambda = c/f = 1$ m and $\beta = 2\pi/\lambda = 2\pi$ rad/m.`),
    Q(md`In a nonmagnetic dielectric with $\epsilon_r = 4$ at $f = 300$ MHz, $\beta$ is…`, [md`$4\pi$ rad/m`, md`$2\pi$ rad/m`, md`$8\pi$ rad/m`, md`$\pi$ rad/m`], 0,
      [null, md`That is free space.`, md`That multiplies by $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.`, md`A dielectric makes $\beta$ larger, not smaller.`],
      md`$\beta = 2\pi f\sqrt{\epsilon_r}/c = 2\pi(2) = 4\pi$ rad/m.`),
    Q(md`For $\Et = \tilde{\mathbf E}_0e^{-j\beta z}$, $\nabla\times\Et$ equals…`, [md`$-j\beta\,\hat z\times\Et$`, md`$+j\beta\,\hat z\times\Et$`, md`$-j\beta\,\Et\times\hat z$`, md`$-\beta\,\hat z\times\Et$`], 0,
      [null, md`$\partial/\partial z\to-j\beta$ for $e^{-j\beta z}$.`, md`The order of a cross product matters: $\Et\times\hat z = -\hat z\times\Et$.`, md`The $j$ stays.`],
      md`$\nabla\to-j\beta\hat z$, so $\nabla\times\Et = -j\beta\hat z\times\Et$.`),
    Q(md`For $\Et$ perpendicular to $\hat z$, $\hat z\times(\hat z\times\Et)$ equals…`, [md`$-\Et$`, md`$\Et$`, md`$0$`, md`$\hat z$`], 0,
      [null, md`Two quarter turns make a half turn: the sign flips.`, md`$\hat z\times\Et$ is not zero when $\Et\perp\hat z$.`, md`The result is a vector in the plane of $\Et$.`],
      md`$\hat z(\hat z\cdot\Et) - \Et(\hat z\cdot\hat z) = 0 - \Et$. Check: $\hat z\times(\hat z\times\hat x) = \hat z\times\hat y = -\hat x$ ✓.`),
    Q(md`In free space, $\Et = E_0\hat x\,e^{-j\beta z}$. Then $\Ht$ is…`, [md`$\tfrac{E_0}{120\pi}\hat y\,e^{-j\beta z}$`, md`$-\tfrac{E_0}{120\pi}\hat y\,e^{-j\beta z}$`, md`$\tfrac{E_0}{120\pi}\hat x\,e^{-j\beta z}$`, md`$\tfrac{E_0}{120\pi}\hat y\,e^{+j\beta z}$`], 0,
      [null, md`$\hat z\times\hat x = +\hat y$.`, md`$\Ht\perp\Et$.`, md`It is the same wave: the same exponent.`],
      md`$\Ht = \hat z\times\Et/\eta_0$, and $\hat z\times\hat x = \hat y$.`),
    Q(md`$\Et = E_0\hat x\,e^{+j\beta z}$ in free space. Compared with the wave toward $+z$, its $\Ht$…`, [md`points along $-\hat y$`, md`points along $+\hat y$`, md`points along $\hat x$`, md`is zero`], 0,
      [null, md`Reversing the travel with the same $\Et$ must reverse $\Ht$, so that $\Et\times\Ht$ follows the travel.`, md`$\Ht\perp\Et$ always.`, md`A traveling wave always has both fields.`],
      md`$\hat k = -\hat z$; $(-\hat z)\times\hat x = -\hat y$.`),
    Q(md`$\Et = (\hat x + j\hat y)e^{-j\beta z}$ in a medium with impedance $\eta$. Then $\Ht$ is…`, [md`$\tfrac1\eta(\hat y - j\hat x)e^{-j\beta z}$`, md`$\tfrac1\eta(\hat y + j\hat x)e^{-j\beta z}$`, md`$\tfrac1\eta(\hat x - j\hat y)e^{-j\beta z}$`, md`$\tfrac1\eta(-\hat y - j\hat x)e^{-j\beta z}$`], 0,
      [null, md`$\hat z\times\hat y = -\hat x$, so $\hat z\times(j\hat y) = -j\hat x$.`, md`$\Ht$'s components are turned $90°$ from $\Et$'s.`, md`The real term: $\hat z\times\hat x = +\hat y$.`],
      md`$\hat z\times\hat x = \hat y$ and $\hat z\times j\hat y = -j\hat x$.`),
    Q(md`$\Et = 3(\hat x + \hat y)e^{-j\beta z}$. Its polarization is…`, [md`linear, at $45°$ between $\hat x$ and $\hat y$`, md`circular`, md`elliptical`, md`along $\hat z$`], 0,
      [null, md`Circular needs a $90°$ phase difference; here the ratio is real.`, md`Elliptical also needs a phase difference other than $0°$ or $180°$.`, md`A plane wave has no field along its travel.`],
      md`Both components have the same phasor, so they rise and fall together: a line at $45°$.`),
    Q(md`To find $f$ from a phasor $\Et = \tilde{\mathbf E}_0e^{-j\beta z}$, you also need…`, [md`the medium (its speed $v$)`, md`the amplitude $|\tilde{\mathbf E}_0|$`, md`nothing: $f = \beta/2\pi$`, md`the value of $\Ht$`], 0,
      [null, md`The amplitude does not set the frequency.`, md`$\beta/2\pi = 1/\lambda$ is a spatial frequency, in 1/m, not a frequency in Hz.`, md`$\Ht$ gives $\eta$, which constrains the medium, but you still need $\mu$ or $\epsilon$ (or $v$) to turn $\beta$ into $\omega$.`],
      md`$f = v/\lambda = v\beta/2\pi$, and $v$ depends on the medium.`),
    Q(md`$\Et = 4\hat y\,e^{-j\beta z}$ in a medium with impedance $\eta$. $\Ht$ is…`, [md`$-\tfrac4\eta\hat x\,e^{-j\beta z}$`, md`$\tfrac4\eta\hat x\,e^{-j\beta z}$`, md`$\tfrac4\eta\hat y\,e^{-j\beta z}$`, md`$-4\eta\,\hat x\,e^{-j\beta z}$`], 0,
      [null, md`$\hat z\times\hat y = -\hat x$.`, md`$\Ht\perp\Et$.`, md`Divide by $\eta$.`],
      md`$\hat z\times\hat y = -\hat x$. Check: $\hat y\times(-\hat x) = \hat z$ ✓.`),
    Q(md`$\eta\gamma = j\omega\mu$ follows from…`, [md`putting $e^{-\gamma z}$ into Faraday's law`, md`putting $e^{-\gamma z}$ into Gauss's law`, md`the boundary conditions`, md`the Poynting theorem`], 0,
      [null, md`Gauss's law gives transversality only.`, md`Boundary conditions give $\Gamma$ and $\tau$.`, md`Poynting's theorem is about energy.`],
      md`Faraday: $\gamma\tilde E_x = j\omega\mu\tilde H_y$, and $\tilde E_x/\tilde H_y = \eta$.`),
    Q(md`In a lossless medium, $\gamma$ is…`, [md`purely imaginary, $j\beta$`, md`purely real, $\beta$`, md`zero`, md`$\alpha + j\beta$ with $\alpha > 0$`], 0,
      [null, md`A real $\gamma$ would only decay.`, md`The phase still turns with distance.`, md`$\alpha > 0$ needs loss.`],
      md`$\gamma = \sqrt{(j\omega\mu)(j\omega\epsilon)} = j\omega\sqrt{\mu\epsilon}$.`),
    Q(md`Which is **not** a valid source-free plane wave?`, [md`$\hat x\,e^{-j\beta x}$`, md`$\hat y\,e^{-j\beta x}$`, md`$(\hat y + j\hat z)\,e^{+j\beta x}$`, md`$\hat z\,e^{+j\beta y}$`], 0,
      [null, md`$\hat y$ is across the travel $\hat x$: fine.`, md`Both components are across the travel $\hat x$: fine.`, md`$\hat z$ is across the travel $\hat y$: fine.`],
      md`$\hat x\,e^{-j\beta x}$ points along its own travel: $\nabla\cdot\Et = -j\beta e^{-j\beta x} \ne 0$.`),
    Q(md`Putting the Faraday $\Ht$ into Ampère's law requires…`, [md`$\beta/\eta = \omega\epsilon$`, md`$\beta\eta = \omega\epsilon$`, md`$\beta = \omega\mu$`, md`$\eta = \omega\epsilon$`], 0,
      [null, md`Units: $\beta\eta$ is $\Omega$/m, and $\omega\epsilon$ is S/m.`, md`$\omega\mu$ has $\Omega$/m; $\beta$ has 1/m.`, md`$\eta$ is in $\Omega$; $\omega\epsilon$ in S/m.`],
      md`$\nabla\times\Ht = (j\beta/\eta)\Et = j\omega\epsilon\Et$. With $\eta = \sqrt{\mu/\epsilon}$ it is $\beta = \omega\sqrt{\mu\epsilon}$.`),
    Q(md`$\nabla\times\Ht = j\omega\epsilon\Et$ in the time domain is…`, [md`$\nabla\times\mathbf H = \epsilon\,\partial\mathbf E/\partial t$`, md`$\nabla\times\mathbf H = j\omega\epsilon\mathbf E$`, md`$\nabla\times\mathbf H = \omega\epsilon\mathbf E$`, md`$\nabla\times\mathbf H = -\epsilon\,\partial\mathbf E/\partial t$`], 0,
      [null, md`A real field equation has no $j$.`, md`Multiplying by $\omega$ loses the $90°$ shift; the derivative has it.`, md`The sign of $j\omega\to\partial/\partial t$ is $+$.`],
      md`$j\omega\to\partial/\partial t$, back to the time domain.`),
    Q(md`Spring 2018 #2: a transmitted phasor $10e^{-j12y}\hat z$ V/m at $\omega = 3\times10^9$ rad/s in a nonmagnetic dielectric. $\epsilon_r$ is…`, [md`$1.44$`, md`$1.2$`, md`$0.69$`, md`$144$`], 0,
      [null, md`$1.2 = \beta c/\omega$ is $\sqrt{\epsilon_r}$.`, md`That is upside down: $(\omega/\beta c)^2$.`, md`That forgets the $c/\omega$ factor: $12^2$.`],
      md`$\sqrt{\epsilon_r} = (12)(3\times10^8)/(3\times10^9) = 1.2$, so $\epsilon_r = 1.44$.`, { src: 'Spring 2018 #2' }),
    Q(md`$\Ht = \frac{1}{120\pi}(\hat z + j\hat y)e^{-j2\pi x}$ A/m. At $x = 0$, $t = 0$, $\mathbf H$ is…`, [md`$\tfrac{1}{120\pi}\hat z$`, md`$\tfrac{1}{120\pi}(\hat z + \hat y)$`, md`$\tfrac{1}{120\pi}\hat y$`, md`$\tfrac{\sqrt2}{120\pi}\hat z$`], 0,
      [null, md`The $j\hat y$ part is imaginary: its real part at $t = 0$ is zero.`, md`The $\hat y$ part peaks a quarter period away from $t = 0$ (at $T/4$ it is $-\hat y/120\pi$); at $t = 0$ only $\hat z$ is left.`, md`The size of $\hat z$'s coefficient is 1, not $\sqrt2$; $\sqrt2$ would add the $\hat y$ size as if it were in phase.`],
      md`$\Re\{\hat z + j\hat y\} = \hat z$.`),
    Q(md`A lossless medium has $\eta = 240\pi\ \Omega$ and $\beta = 2\omega/c$. Then…`, [md`$\mu_r = 4$, $\epsilon_r = 1$`, md`$\mu_r = 1$, $\epsilon_r = 4$`, md`$\mu_r = 2$, $\epsilon_r = 2$`, md`$\mu_r = 1$, $\epsilon_r = 0.25$`], 0,
      [null, md`That gives $\eta = 60\pi$.`, md`That gives $\eta = 120\pi$.`, md`That gives $\beta = 0.5\omega/c$.`],
      md`$\sqrt{\mu_r/\epsilon_r} = 2$ and $\sqrt{\mu_r\epsilon_r} = 2$. Multiply: $\mu_r = 4$. Divide: $\epsilon_r = 1$.`),
    Q(md`For $\Et\propto e^{-j\beta\hat k\cdot\mathbf r}$, the operator $\nabla$ acts like…`, [md`$-j\beta\hat k$`, md`$j\beta\hat k$`, md`$-\beta\hat k$`, md`$j\omega$`], 0,
      [null, md`The sign comes from the minus in the exponent.`, md`The $j$ stays.`, md`$j\omega$ is the time derivative.`],
      md`Each spatial derivative pulls down $-j\beta$ times the matching component of $\hat k$.`),
    Q(md`$\Et = 2\hat x\,e^{-j3z}$ V/m and $\Ht = \tfrac{1}{20\pi}\hat y\,e^{-j3z}$ A/m. The medium's $\eta$ is…`, [md`$40\pi\ \Omega$`, md`$120\pi\ \Omega$`, md`$10\pi\ \Omega$`, md`$\tfrac{1}{40\pi}\ \Omega$`], 0,
      [null, md`That assumes free space. The ratio decides.`, md`That divides $20\pi$ by 2. Dividing by a fraction multiplies: $2\div\tfrac{1}{20\pi} = 2\cdot20\pi$.`, md`That is $|\tilde H|/|\tilde E|$, upside down.`],
      md`$\eta = 2/(1/20\pi) = 40\pi\ \Omega$, so $\sqrt{\mu_r/\epsilon_r} = 1/3$.`),
  ];
})();

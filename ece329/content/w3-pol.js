/* Topics 9 and 10 (Lectures 19 and 24): polarization, and the current sheets that make it.
   w3-pol: the tip of E at a fixed point; line, circle or ellipse derived from the two components; the course's handedness
   rule (Lecture 24: right thumb along the travel, fingers along the turn); the snapshot test p x q; the phasor test
   (E~ = a + jb, E(t) = a cos wt - b sin wt, the tip goes from a toward -b, compare a x (-b) with the travel); the review
   session's "ahead x behind" shown to be the same test; any axis (cyclic order); sin and minus signs; H has the same
   polarization; RHCP + LHCP = linear; reflection reverses the hand.
   w3-antenna: the sheet field E~ = -(eta/2) J~s e^{-j beta|z|} from the boundary conditions; the power a sheet delivers;
   designing a sheet for a chosen polarization and direction; two parallel sheets (three regions by superposition,
   SP24 #1: a standing wave between, cancellation outside); the lambda/4 + 90 degree pair that radiates one way, the
   power each sheet delivers; perpendicular currents on two sheets and the hand on each side (the HW 10 #4 skill).
   Handedness convention: Lecture 24 (IEEE): right thumb along the propagation direction, right fingers curl the way the
   tip of E turns at a fixed point -> right-handed. Equivalently a x (-b) along the travel.
   Generator prefix: w3 (rapid fire rf_w3_*, problems w3_*). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick, shuffle } = U;
  const PI = Math.PI, DEG = PI / 180, ETA0 = EM.eta0;
  const NL2 = String.fromCharCode(10, 10);          // a paragraph break inside a solution

  // ---------------------------------------------------------------- figures
  // the path of the tip of E = A cos(wt) x + B cos(wt - ph) y; solid arrow at wt = 0, dashed a quarter period later
  function tipFig(A, B, ph, alt) {
    const g = PF.fig({ alt });
    const Rr = 54;
    g.arrow(-Rr - 12, 0, Rr + 16, 0, { cls: 'dim', hs: 6 }); g.label(Rr + 19, 0, '\\hat x', 'l', 'small accent');
    g.arrow(0, Rr + 12, 0, -Rr - 16, { cls: 'dim', hs: 6 }); g.label(-5, -Rr - 18, '\\hat y', 'br', 'small accent');
    const pos = (u) => [Rr * A * Math.cos(u), -Rr * B * Math.cos(u - ph * DEG)];
    const p0 = pos(0);
    if (Math.abs(Math.sin(ph * DEG)) < 1e-9) {
      g.line(-p0[0], -p0[1], p0[0], p0[1], { cls: 'curve' });
      g.arrow(0, 0, p0[0], p0[1], { cls: 'thick', hs: 8 });
      g.arrow(0, 0, -p0[0] * 0.98, -p0[1] * 0.98, { cls: 'dash', hs: 7 });
      return g.svg();
    }
    const pts = []; for (let i = 0; i <= 144; i++) pts.push(pos(2 * PI * i / 144));
    g.pl(pts, { cls: 'curve' });
    const p1 = pos(PI / 2);
    g.arrow(0, 0, p0[0], p0[1], { cls: 'thick', hs: 8 });
    g.arrow(0, 0, p1[0], p1[1], { cls: 'dash', hs: 7 });
    const u = 1.25 * PI, q = pos(u), q2 = pos(u + 0.02);
    g.head(q[0], q[1], q2[0] - q[0], q2[1] - q[1], { hs: 9 });
    return g.svg();
  }
  // the same counterclockwise turn seen with the wave coming toward you (right-handed) or going away (left-handed)
  function handFig(out) {
    const g = PF.fig({ alt: out
      ? 'x to the right, y up, the wave travels out of the page toward you (a dot in a circle at the origin); the tip of E turns counterclockwise, from x toward y'
      : 'x to the right, y up, the wave travels into the page away from you (a cross in a circle at the origin); the tip of E turns counterclockwise, from x toward y' });
    const Rr = 50;
    g.arrow(-Rr - 12, 0, Rr + 16, 0, { cls: 'dim', hs: 6 }); g.label(Rr + 19, 0, '\\hat x', 'l', 'small accent');
    g.arrow(0, Rr + 12, 0, -Rr - 16, { cls: 'dim', hs: 6 }); g.label(-5, -Rr - 18, '\\hat y', 'br', 'small accent');
    g.circle(0, 0, Rr, { cls: 'dash dim' });
    g.arrow(0, 0, Rr * Math.cos(35 * DEG), -Rr * Math.sin(35 * DEG), { cls: 'thick', hs: 8 });
    const r2 = Rr + 12, t2 = 80 * DEG;
    g.arc(0, 0, r2, 20, 80, { cls: 'thick' });
    g.head(r2 * Math.cos(t2), -r2 * Math.sin(t2), -Math.sin(t2), -Math.cos(t2), { hs: 9 });
    if (out) g.odot(0, 0, 8); else g.otimes(0, 0, 8);
    g.text(0, Rr + 34, out ? 'travel: toward you' : 'travel: away from you', 'c');
    return g.svg();
  }
  // the cyclic order x -> y -> z -> x
  function cycFig() {
    const g = PF.fig({ alt: 'x, y and z placed around a circle with arrows from x to y, from y to z and from z back to x: going forward around the circle gives a plus sign' });
    const Rr = 46, at = [90, -30, 210], lab = ['\\hat x', '\\hat y', '\\hat z'];
    for (let k = 0; k < 3; k++) {
      const a0 = at[k] - 22, a1 = at[k] - 98;
      g.arc(0, 0, Rr, a0, a1, { cls: 'thick' });
      const t = a1 * DEG;
      g.head(Rr * Math.cos(t), -Rr * Math.sin(t), Math.sin(t), Math.cos(t), { hs: 8 });
      g.label(Rr * Math.cos(at[k] * DEG), -Rr * Math.sin(at[k] * DEG), lab[k], 'c', 'accent');
    }
    g.text(0, 0, 'forward: +', 'c', 'small');
    return g.svg();
  }

  // ---------------------------------------------------------------- lesson 1: polarization
  EM.lesson('w3', {
    id: 'w3-pol', topic: 9, ref: 'Lecture 24', title: 'Polarization: linear, circular, elliptical, and which hand',
    steps: [
      RF(md`
        !!key Why you care
          Every recent Exam 3 asks you to name a polarization. FA23 #2 gave three fields and 9 points for three words. SP18 #1(iii) and (iv) were two multiple-choice parts on one phasor. SP24 #2(d) asked which magnetic-field phasor makes a wave left-handed. HW 9 #1(c) and HW 10 #3 and #4 drill the same skill, and [Topic 10](#/l/w3-antenna) uses it to design antennas. With a test that cannot fail, each of these takes under a minute. Without one, it is a coin toss: "clockwise" depends on where you stand. By the end of this lesson you will name the shape and the hand of any wave, along any axis, in about ten seconds.

        ### Notation

        - $\mathbf E(t)$ **at a fixed point**: the field at one place, watched as time goes on. Its **tip** is the arrowhead, with the arrow drawn from the origin.
        - $\hat k$: the unit vector along the **direction of travel**. You read it from the phase: $e^{-j\beta z}$ or $\cos(\omega t - \beta z)$ means $\hat k = +\hat z$; $e^{+j\beta x}$ or $\cos(\omega t + \beta x)$ means $\hat k = -\hat x$.
        - $u = \omega t - \beta z$: shorthand for the phase of a wave going toward $+z$.
        - $A$, $B$: the amplitudes (peak values) of the two components, in V/m. Always taken $\ge 0$.
        - $\phi$: how many degrees the second component **lags** the first.
        - $\tilde{\mathbf E} = \mathbf a + j\mathbf b$: a vector phasor split into its real part $\mathbf a$ and imaginary part $\mathbf b$. Both are ordinary real vectors. Bold means a vector; plain $A$, $B$ are numbers.
        - $\hat a$, $\hat b$: unit vectors (possibly with a minus sign, like $-\hat y$).
        - **RHCP**, **LHCP**: right-hand and left-hand circular polarization.

        ### 1. Polarization is the path of the tip

        Stand at one point and watch $\mathbf E$. It is a vector that changes with time. Draw it as an arrow from the origin. As time goes on, its tip moves and traces a curve, and after one period $T = 2\pi/\omega$ the curve repeats. **The shape of that curve is the polarization.** There are only three possible shapes: a line, a circle and an ellipse.

        Take a wave going toward $+z$ with an $x$ part and a $y$ part. The most general one is
        $$\mathbf E = A\cos u\,\hat x + B\cos(u - \phi)\,\hat y$$
        with $u = \omega t - \beta z$ and the $y$ part lagging the $x$ part by $\phi$.

        Does the curve depend on where you stand? Pick a plane $z = z_0$. There
        $$u = \omega t - \beta z_0 = \omega\left(t - \frac{\beta z_0}{\omega}\right)$$
        Call the bracket $t'$, a clock that started $\beta z_0/\omega$ seconds later. Then
        $$\mathbf E = A\cos\omega t'\,\hat x + B\cos(\omega t' - \phi)\,\hat y$$
        That is exactly the field at $z = 0$, only read on the later clock. **Every plane sees the same path, traced the same way.** So you may always study the field at the most convenient plane, usually the one where the $\beta z$ term is zero.

        !!intuition Does this make sense?
          A traveling wave carries its pattern along unchanged. Whatever the tip does at $z = 0$, it does a little later at $z = z_0$. Polarization belongs to the wave, not to the point where you watch it.
      `, {}),
      Q(md`**Predict.** $\mathbf E = 5\cos(\omega t - \beta z)\,\hat x + 5\sin(\omega t - \beta z)\,\hat y$ V/m. At $z = 0$ the tip goes around a circle of radius 5 V/m, turning from $\hat x$ toward $\hat y$. At $z = \lambda/4$ the tip…`,
        [md`goes around the same circle, the same way, a quarter period later`, md`goes around the same circle the opposite way`, md`swings back and forth along a line`, md`stays at the origin, since $\cos(\beta z) = 0$ there`], 0,
        [null, md`The $-\beta z$ is the same in both components, so it only delays the clock. A delay cannot reverse a rotation.`, md`A line needs the two parts in phase. Both carry the same $-\beta z$, so their $90°$ relation is the same at every $z$.`, md`$\beta z$ sits inside the phase. It shifts time; it never multiplies the amplitude.`],
        md`At $z = \lambda/4$, $\beta z = 90°$, so $u = \omega t - 90°$. The field is the $z = 0$ field a quarter period later: same circle, same sense.`),
      R(md`
        ### 2. When the tip stays on a line

        Start with $\phi = 0$. Both components have the same cosine, so factor it out:
        $$\mathbf E = (A\,\hat x + B\,\hat y)\cos u$$
        The bracket is a fixed vector. The cosine is a number that swings between $+1$ and $-1$. So the tip slides back and forth along one line through the origin, the line of $A\hat x + B\hat y$. This is **linear polarization**. The line makes an angle $\theta$ with $\hat x$, where
        $$\tan\theta = \frac{B}{A}$$
        Now take $\phi = 180°$. Delaying a cosine by half a period flips its sign:
        $$\cos(u - 180°) = -\cos u$$
        so
        $$\mathbf E = (A\,\hat x - B\,\hat y)\cos u$$
        Linear again, now along $A\hat x - B\hat y$. And if $A = 0$ or $B = 0$, only one component is left, which is linear too.

        !!intuition Does this make sense?
          "In phase" means the two components peak together and pass through zero together. Their ratio $E_y/E_x$ never changes, so the direction of $\mathbf E$ never changes. Linear means a constant ratio; the amplitudes do not have to be equal.
      `),
      Q(md`**Predict.** $\mathbf E = 4\cos(\omega t - \beta z)\,\hat x - 4\cos(\omega t - \beta z)\,\hat y$ V/m. The tip moves along…`,
        [md`a line along $\hat x - \hat y$, at $-45°$ from $\hat x$`, md`a line along $\hat x + \hat y$`, md`a circle of radius 4 V/m`, md`the $x$ axis only`], 0,
        [null, md`That drops the minus sign. When $E_x = +4$, $E_y = -4$: the tip is at $4\hat x - 4\hat y$.`, md`A circle needs the parts $90°$ apart. Here they are $180°$ apart: in step, with opposite signs.`, md`Both components are nonzero at the same instants, so the tip leaves the $x$ axis.`],
        md`$\mathbf E = 4(\hat x - \hat y)\cos u$: a fixed vector times a swinging number. The line is along $\hat x - \hat y$, the case $\phi = 180°$.`),
      R(md`
        ### 3. When the tip goes around a circle

        Now take $\phi = 90°$. A cosine delayed by a quarter period is a sine:
        $$\cos(u - 90°) = \sin u$$
        so
        $$\mathbf E = A\cos u\,\hat x + B\sin u\,\hat y$$
        How long is this vector? Square its length:
        $$|\mathbf E|^2 = A^2\cos^2u + B^2\sin^2u$$
        If the amplitudes are equal, $A = B$, factor out $A^2$ and use $\cos^2u + \sin^2u = 1$:
        $$|\mathbf E|^2 = A^2(\cos^2u + \sin^2u) = A^2$$
        The length never changes. The tip stays on a circle of radius $A$: **circular polarization**. Follow it at $z = 0$, where $u = \omega t$, one quarter period at a time:

        | $\omega t$ | $E_x$ | $E_y$ | tip at |
        |---|---|---|---|
        | $0°$ | $A$ | $0$ | $+\hat x$ |
        | $90°$ | $0$ | $A$ | $+\hat y$ |
        | $180°$ | $-A$ | $0$ | $-\hat x$ |
        | $270°$ | $0$ | $-A$ | $-\hat y$ |

        The tip turns from $\hat x$ toward $\hat y$. With $\phi = -90°$ the $y$ part is $-A\sin u$ instead, and the tip turns from $\hat x$ toward $-\hat y$: the other way round.

        !!intuition Does this make sense?
          When $E_x$ is at its peak, $E_y$ is passing through zero, and the reverse. Neither part ever stops the other, so the tip never comes back to the center: it goes around, once per period, at the angular rate $\omega$.
      `),
      Q(md`**Predict.** $\mathbf E = 3\cos(\omega t - \beta z)\,\hat x + 2\sin(\omega t - \beta z)\,\hat y$ V/m. The tip traces…`,
        [md`an ellipse with half-axes 3 V/m along $\hat x$ and 2 V/m along $\hat y$`, md`a circle of radius 3 V/m`, md`a line, since the amplitudes differ`, md`a circle of radius $\sqrt{13}$ V/m`], 0,
        [null, md`A circle needs $A = B$. Here $|\mathbf E|^2 = 9\cos^2u + 4\sin^2u$ swings between 4 and 9.`, md`Unequal amplitudes do not make a line; a line needs the parts in phase. These are $90°$ apart.`, md`That adds both peaks as if they happened together. They never do: when $E_x = 3$, $E_y = 0$.`],
        md`At $u = 0$ the tip is at $3\hat x$; at $u = 90°$ at $2\hat y$. $|\mathbf E|^2 = 9\cos^2u + 4\sin^2u$ is not constant: an ellipse with half-axes 3 and 2 on the axes.`),
      RF(md`
        ### 4. Everything else is an ellipse

        Now find the path for any $A$, $B$, $\phi$. At $z = 0$, call the two components $x$ and $y$:
        $$x = A\cos u, \qquad y = B\cos(u - \phi)$$
        Expand the second one with the angle-difference formula:
        $$\frac{y}{B} = \cos u\cos\phi + \sin u\sin\phi$$
        The first line says $\cos u = x/A$. Put it in:
        $$\frac{y}{B} = \frac{x}{A}\cos\phi + \sin u\sin\phi$$
        Solve for $\sin u$:
        $$\sin u = \frac{y/B - (x/A)\cos\phi}{\sin\phi}$$
        Now remove time with $\cos^2u + \sin^2u = 1$:
        $$\frac{x^2}{A^2} + \frac{\bigl(y/B - (x/A)\cos\phi\bigr)^2}{\sin^2\phi} = 1$$
        Multiply through by $\sin^2\phi$ and expand the square. Two terms have $x^2/A^2$, one with $\sin^2\phi$ and one with $\cos^2\phi$; they add to $x^2/A^2$:
        $$\boxed{\frac{x^2}{A^2} - \frac{2xy\cos\phi}{AB} + \frac{y^2}{B^2} = \sin^2\phi}$$
        This is an ellipse, tilted in general. Read the special cases off it:

        - $\phi = 0$: the left side is $(x/A - y/B)^2$ and the right side is 0. So $y = (B/A)x$: the line of Section 2.
        - $\phi = 90°$: $\cos\phi = 0$ and $\sin\phi = 1$, so $x^2/A^2 + y^2/B^2 = 1$: an ellipse with half-axes $A$ and $B$ on the axes. If $A = B$ it is the circle of Section 3.
        - Anything else: a tilted ellipse.

        [[fig:tips]]

        | Condition | Shape |
        |---|---|
        | $\phi = 0°$ or $180°$, or one amplitude is 0 | linear |
        | $\phi = \pm90°$ **and** $A = B$ | circular |
        | anything else | elliptical |

        A circle needs **both** conditions. $\phi = 90°$ with $A \ne B$ is an ellipse. $A = B$ with $\phi = 60°$ is an ellipse too.

        Play with it. "First" is the horizontal component, "second" the vertical one, and the slider sets how far the second lags. Find the circle, the two lines, and an ellipse of each hand. (The hand is the next section.)
      `, { tips: { svg: PF.row([
        { svg: tipFig(1, 0.6, 0, 'a line through the origin along x plus 0.6 y: the tip slides back and forth'), cap: '$\\phi = 0$: a line.' },
        { svg: tipFig(1, 1, 90, 'a circle; the solid arrow at time zero points along x, the dashed arrow a quarter period later along y; the arrowhead on the path shows counterclockwise motion'), cap: '$\\phi = 90°$, $A = B$: a circle.' },
        { svg: tipFig(1, 0.7, 60, 'a tilted ellipse; the solid arrow at time zero, the dashed arrow a quarter period later, the arrowhead shows counterclockwise motion'), cap: '$\\phi = 60°$, $B = 0.7A$: an ellipse.' },
      ]).svg, cap: 'The path of the tip in the plane z = 0. Solid arrow: E at ωt = 0. Dashed: E a quarter period later. The arrowhead on the path shows which way the tip moves.' } }),
      W3.pol(),
      Q(md`**Predict.** $\mathbf E = 2\cos(\omega t - \beta z)\,\hat x + 2\cos(\omega t - \beta z + 120°)\,\hat y$ V/m. The polarization is…`,
        ['elliptical', 'circular', 'linear', 'circular, because any phase other than 0° or 180° makes the tip go around'], 0,
        [null, md`Equal amplitudes are only half of the condition. The phase difference is $120°$, not $\pm90°$.`, md`A line needs the parts $0°$ or $180°$ apart. These are $120°$ apart.`, md`The tip does go around, but its length changes: with $\phi = -120°$ the ellipse equation has a $\cos\phi$ term, which tilts and stretches it.`],
        md`$A = B = 2$, but $\phi = -120°$ (the $y$ part leads by $120°$). Neither $0°$/$180°$ nor $\pm90°$: elliptical.`),
      RF(md`
        ### 5. Which hand: the course's definition

        The shape does not say which way the tip turns. Two identical circles can turn opposite ways. Lecture 24 names them with your hands:

        !!key The definition (Lecture 24)
          Point your **right thumb along the direction of travel**. If the fingers of your right hand curl the way the tip of $\mathbf E$ turns, the wave is **right-handed** (RHCP, if the path is a circle). If only your left hand fits, it is **left-handed** (LHCP). A linear wave has no hand. An ellipse has a hand exactly as a circle does.

        [[fig:hands]]

        The same rule as a picture: if the wave comes **toward you** (out of the page), a right-handed tip turns **counterclockwise**. Turn around so the wave moves **away** from you, and the very same tip looks clockwise. That is why "clockwise" alone is useless: it depends on where you stand. The thumb rule does not.

        Hands are slow, and easy to flip under exam stress. So turn the rule into one cross product. Say the tip is at the vector $\mathbf p$ now and at $\mathbf q$ a quarter period later. The right-hand rule of the cross product says your right fingers curl from $\mathbf p$ toward $\mathbf q$ when your thumb points along $\mathbf p\times\mathbf q$. So the thumb rule becomes:
        $$\boxed{\mathbf p\times\mathbf q\ \text{along}\ \hat k\ \Rightarrow\ \text{right-handed}}$$
        If $\mathbf p\times\mathbf q$ points along $-\hat k$, the wave is left-handed.

        Try it on the lecture's right-circular wave, $\mathbf E = \cos(\omega t - \beta z)\,\hat x + \sin(\omega t - \beta z)\,\hat y$. At $z = 0$ and $\omega t = 0$ the tip is at $\mathbf p = \hat x$. At $\omega t = 90°$ it is at $\mathbf q = \hat y$. Then
        $$\mathbf p\times\mathbf q = \hat x\times\hat y = +\hat z$$
        and the travel is $+\hat z$. Right-handed ✓, as the lecture says.

        !!intuition Does this make sense?
          Reverse the travel and keep the rotation: $\cos(\omega t + \beta z)\,\hat x + \sin(\omega t + \beta z)\,\hat y$. At $z = 0$ the tip does exactly the same thing, so $\mathbf p\times\mathbf q = +\hat z$ still. But now $\hat k = -\hat z$, so the wave is left-handed. **Same rotation, opposite travel, opposite hand.** You will use that sentence for current sheets and for reflections.
      `, { hands: { svg: PF.row([
        { svg: handFig(true), cap: 'Wave toward you: counterclockwise is right-handed.' },
        { svg: handFig(false), cap: 'Wave away from you: the same turn is left-handed.' },
      ]).svg, cap: 'The same counterclockwise turn of the tip, with two directions of travel. Right thumb along the travel: only the left panel fits the right hand.' } }),
      Q(md`**Predict.** $\mathbf E = 2\cos(\omega t + \beta z)\,\hat x - 2\sin(\omega t + \beta z)\,\hat y$ V/m. The wave is…`,
        ['right-handed circular (RHCP)', 'left-handed circular (LHCP)', 'linear', 'right-handed elliptical'], 0,
        [null, md`That puts the thumb on $+\hat z$. The $+\beta z$ means the wave travels toward $-\hat z$.`, md`The parts are $90°$ apart (a cosine and a sine), so the tip never stays on a line.`, md`Equal amplitudes and exactly $90°$ apart: $|\mathbf E| = 2$ always, a circle.`],
        md`Travel: $-\hat z$. At $z = 0$: $\mathbf p = 2\hat x$ at $\omega t = 0$ and $\mathbf q = -2\hat y$ at $\omega t = 90°$. $\hat x\times(-\hat y) = -\hat z$, along the travel: right-handed. Equal amplitudes, $90°$: circular.`),
      R(md`
        ### 6. The phasor test

        Most exam fields come as phasors. Let us find $\mathbf p$ and $\mathbf q$ straight from $\tilde{\mathbf E}$. Work at the plane where the propagation factor equals 1, and split the phasor into its real and imaginary parts:
        $$\tilde{\mathbf E} = \mathbf a + j\mathbf b$$
        Here $\mathbf a$ and $\mathbf b$ are real vectors. For example $3\hat x - j3\hat y$ has $\mathbf a = 3\hat x$ and $\mathbf b = -3\hat y$.

        Go to the time domain. Multiply by $e^{j\omega t} = \cos\omega t + j\sin\omega t$:
        $$(\mathbf a + j\mathbf b)(\cos\omega t + j\sin\omega t)$$
        Multiply out all four terms. The last one has $j\cdot j = -1$:
        $$\mathbf a\cos\omega t + j\mathbf a\sin\omega t + j\mathbf b\cos\omega t - \mathbf b\sin\omega t$$
        Keep the real part:
        $$\boxed{\mathbf E(t) = \mathbf a\cos\omega t - \mathbf b\sin\omega t}$$
        Now read the tip. At $\omega t = 0$, $\mathbf p = \mathbf a$. At $\omega t = 90°$, $\mathbf q = -\mathbf b$. **The tip moves from $\mathbf a$ toward $-\mathbf b$.** So the hand test becomes one line.

        !!key The phasor test
          Write $\tilde{\mathbf E} = \mathbf a + j\mathbf b$ and compute $\mathbf a\times(-\mathbf b)$.
          - Along $+\hat k$: right-handed.
          - Along $-\hat k$: left-handed.
          - Zero ($\mathbf a$ parallel to $\mathbf b$, or one of them zero): linear, no hand.

        **Does the tip ever turn back?** Differentiate $\mathbf E(t)$:
        $$\frac{d\mathbf E}{dt} = -\omega(\mathbf a\sin\omega t + \mathbf b\cos\omega t)$$
        Cross $\mathbf E$ with it. With $c = \cos\omega t$ and $s = \sin\omega t$, and $\mathbf a\times\mathbf a = \mathbf b\times\mathbf b = 0$, the bracket $(\mathbf a c - \mathbf b s)\times(\mathbf a s + \mathbf b c)$ leaves only
        $$c^2\,\mathbf a\times\mathbf b - s^2\,\mathbf b\times\mathbf a = (c^2 + s^2)\,\mathbf a\times\mathbf b$$
        which is just $\mathbf a\times\mathbf b$. Put back the $-\omega$:
        $$\mathbf E\times\frac{d\mathbf E}{dt} = \omega\,\mathbf a\times(-\mathbf b)$$
        The same vector at every instant. The tip always turns the same way, so one snapshot pair decides the hand.

        **The shape from the same two vectors.** Square the length of $\mathbf E(t)$:
        $$\begin{aligned}|\mathbf E|^2 &= |\mathbf a|^2\cos^2\omega t + |\mathbf b|^2\sin^2\omega t\\ &\quad - 2\,\mathbf a\cdot\mathbf b\,\sin\omega t\cos\omega t\end{aligned}$$
        This is constant only if $|\mathbf a| = |\mathbf b|$ and $\mathbf a\cdot\mathbf b = 0$. So **circular means $\mathbf a$ and $\mathbf b$ are perpendicular and equally long.**

        Check both of the lecture's circles, traveling toward $+\hat z$:
        - $\hat x - j\hat y$: $\mathbf a = \hat x$, $\mathbf b = -\hat y$, so $-\mathbf b = \hat y$. $\hat x\times\hat y = +\hat z$: **RHCP** ✓.
        - $\hat x + j\hat y$: $-\mathbf b = -\hat y$. $\hat x\times(-\hat y) = -\hat z$: **LHCP** ✓.

        A five-second version: in $\hat a - j\hat b$ the tip turns from $\hat a$ toward $\hat b$; in $\hat a + j\hat b$ it turns from $\hat a$ toward $-\hat b$. "Minus $j$: toward."
      `),
      Q(md`**Predict.** $\tilde{\mathbf E} = (4\hat y + j4\hat x)\,e^{-j\beta z}$ V/m. The wave is…`,
        ['right-handed circular (RHCP)', 'left-handed circular (LHCP)', 'linear', 'right-handed elliptical'], 0,
        [null, md`That crosses $\mathbf a$ with $+\mathbf b$: $\hat y\times\hat x = -\hat z$. The tip moves toward $-\mathbf b$, not $\mathbf b$.`, md`$\mathbf a = 4\hat y$ and $\mathbf b = 4\hat x$ are perpendicular and nonzero, so the tip goes around.`, md`$|\mathbf a| = |\mathbf b| = 4$ and $\mathbf a\perp\mathbf b$: a circle.`],
        md`$\mathbf a = 4\hat y$, $\mathbf b = 4\hat x$, $-\mathbf b = -4\hat x$. $\hat y\times(-\hat x) = +\hat z$, the travel. RHCP. In time: $4\cos\omega t\,\hat y - 4\sin\omega t\,\hat x$, which goes from $\hat y$ to $-\hat x$.`),
      R(md`
        ### 7. The review session's shortcut is the same test

        The 2025 review session teaches this: write each component as a cosine, decide which one is **ahead** (it peaks first) and which is **behind**, then
        $$\text{ahead}\times\text{behind} = \hat k\ \Rightarrow\ \text{RHCP}$$
        Why does that agree with the phasor test? Take
        $$\mathbf E = A\cos u\,\hat a + B\cos(u - \phi)\,\hat b$$
        with $A, B > 0$ and $0 < \phi < 180°$. The $\hat a$ part is ahead; the $\hat b$ part peaks $\phi$ later. The phasor is
        $$\tilde{\mathbf E} = A\hat a + Be^{-j\phi}\,\hat b$$
        Expand $e^{-j\phi} = \cos\phi - j\sin\phi$ and sort into real and imaginary parts:
        $$\mathbf a = A\hat a + B\cos\phi\,\hat b, \qquad \mathbf b = -B\sin\phi\,\hat b$$
        So $-\mathbf b = B\sin\phi\,\hat b$. Cross, term by term:
        $$\begin{aligned}\mathbf a\times(-\mathbf b) &= AB\sin\phi\,(\hat a\times\hat b)\\ &\quad + B^2\sin\phi\cos\phi\,(\hat b\times\hat b)\end{aligned}$$
        A vector crossed with itself is zero, so the second line drops:
        $$\mathbf a\times(-\mathbf b) = AB\sin\phi\,(\hat a\times\hat b)$$
        $AB\sin\phi$ is positive, so $\mathbf a\times(-\mathbf b)$ points along $\hat a\times\hat b$, which is ahead $\times$ behind. **The same test** ✓. The slide's other line, "RHCP: $\Re\{\tilde{\mathbf E}\}\times\Im\{-\tilde{\mathbf E}\}$ = propagation direction", is $\mathbf a\times(-\mathbf b)$ written out.

        Three cautions when you use it:
        1. **Signs belong to the unit vectors.** In $-3\cos(u - 90°)\,\hat y$ the amplitude is 3 and the direction is $-\hat y$. Cross with $-\hat y$.
        2. **Turn sines into cosines first.** $\sin u = \cos(u - 90°)$, so a sine is $90°$ **behind** a cosine with the same argument.
        3. **Ahead means the larger phase, at a fixed point.** The $\pm\beta z$ is the same in both parts, so only the constant phases decide.

        **The slide's example.** $\mathbf E = 3\cos(\omega t + \beta x)\,\hat z - 3\cos(\omega t + \beta x - 90°)\,\hat y$.
        - Travel: $+\beta x$ means $\hat k = -\hat x$.
        - Ahead: $\hat z$ (phase $0$). Behind: $-\hat y$ (phase $-90°$; the minus sign goes with the unit vector).
        - $\hat z\times(-\hat y) = -(\hat z\times\hat y) = -(-\hat x) = +\hat x$, against the travel. **LHCP.**

        **The next slide** changes $-90°$ to $+90°$: $3\cos(\omega t + \beta x)\,\hat z - 3\cos(\omega t + \beta x + 90°)\,\hat y$. Now $-\hat y$ is ahead and $\hat z$ is behind:
        $$(-\hat y)\times\hat z = -(\hat y\times\hat z) = -\hat x$$
        That is along the travel: **RHCP**. (The handwritten note on that slide reads $-\hat y\times\hat z = \hat x$ with a question mark. The product is $-\hat x$, since $\hat y\times\hat z = +\hat x$. With $-\hat x$ it matches the travel, which gives the slide's final answer, RHCP.)
      `),
      Q(md`**Predict.** $\mathbf E = 6\cos(\omega t - \beta y + 30°)\,\hat z + 6\cos(\omega t - \beta y - 60°)\,\hat x$ V/m. The wave is…`,
        ['right-handed circular (RHCP)', 'left-handed circular (LHCP)', 'linear', 'right-handed elliptical'], 0,
        [null, md`That crosses behind $\times$ ahead: $\hat x\times\hat z = -\hat y$. The $\hat z$ part has the larger phase, so it is ahead and goes first.`, md`The phases differ by $90°$, not $0°$ or $180°$.`, md`Equal amplitudes and a difference of exactly $90°$: a circle.`],
        md`Travel $+\hat y$. Ahead: $\hat z$ ($+30°$). Behind: $\hat x$ ($-60°$), $90°$ later. $\hat z\times\hat x = +\hat y$: along the travel, RHCP.`),
      RF(md`
        ### 8. Any axis: keep the cyclic order

        Waves on exams travel along $x$ or $y$ as often as along $z$. The test does not change; only the cross products do. Keep the cyclic order $x\to y\to z\to x$:
        $$\hat x\times\hat y = \hat z, \quad \hat y\times\hat z = \hat x, \quad \hat z\times\hat x = \hat y$$
        Going backward around the cycle gives a minus sign:
        $$\hat y\times\hat x = -\hat z, \quad \hat z\times\hat y = -\hat x, \quad \hat x\times\hat z = -\hat y$$

        [[fig:cyc]]

        **Lecture 24's Example 1.** $\tilde{\mathbf E} = (\hat z + j\hat y)\,e^{j\beta x}$.
        - Travel: $e^{+j\beta x}$, so $\hat k = -\hat x$.
        - Split: $\mathbf a = \hat z$ and $\mathbf b = \hat y$, so $-\mathbf b = -\hat y$.
        - Cross: $\hat z\times(-\hat y) = -(\hat z\times\hat y) = +\hat x$.
        - Compare: $+\hat x$ is against the travel $-\hat x$. **Left-handed**, as the lecture finds.

        Five more, all circular, to practice on. Cover the last three columns and fill them in:

        | $\tilde{\mathbf E}$ | $\hat k$ | tip turns | $\mathbf a\times(-\mathbf b)$ | hand |
        |---|---|---|---|---|
        | $(\hat y - j\hat z)e^{-j\beta x}$ | $+\hat x$ | $\hat y\to\hat z$ | $+\hat x$ | R |
        | $(\hat y - j\hat z)e^{+j\beta x}$ | $-\hat x$ | $\hat y\to\hat z$ | $+\hat x$ | L |
        | $(\hat z - j\hat x)e^{-j\beta y}$ | $+\hat y$ | $\hat z\to\hat x$ | $+\hat y$ | R |
        | $(\hat x - j\hat z)e^{-j\beta y}$ | $+\hat y$ | $\hat x\to\hat z$ | $-\hat y$ | L |
        | $(\hat x + j\hat y)e^{+j\beta z}$ | $-\hat z$ | $\hat x\to-\hat y$ | $-\hat z$ | R |

        The first two rows are the sentence from Section 5 again: same rotation, opposite travel, opposite hand.
      `, { cyc: { svg: cycFig(), cap: 'Forward around the cycle (x to y, y to z, z to x) the cross product is the third unit vector with a plus sign. Backward, with a minus sign.' } }),
      Q(md`**Predict.** $\tilde{\mathbf E} = (\hat z - j\hat x)\,e^{+j\beta y}$ V/m. The wave is…`,
        ['left-handed circular (LHCP)', 'right-handed circular (RHCP)', 'linear', 'left-handed elliptical'], 0,
        [null, md`$\hat z\times\hat x = +\hat y$ would be right-handed for travel toward $+\hat y$. But $e^{+j\beta y}$ travels toward $-\hat y$.`, md`$\mathbf a = \hat z$ and $\mathbf b = -\hat x$ are perpendicular and nonzero: the tip goes around.`, md`$|\mathbf a| = |\mathbf b| = 1$ and they are perpendicular: a circle.`],
        md`Travel $-\hat y$. The tip turns $\hat z\to\hat x$ ("minus $j$: toward"). $\hat z\times\hat x = +\hat y$, against the travel: LHCP.`),
      R(md`
        ### 9. Sines, minus signs and common phases

        Exam fields mix sines, cosines and minus signs. Convert each part to a phasor with the cosine reference:

        | time form | phasor |
        |---|---|
        | $\cos u$ | $1$ |
        | $\sin u = \cos(u - 90°)$ | $-j$ |
        | $-\cos u = \cos(u + 180°)$ | $-1$ |
        | $-\sin u = \cos(u + 90°)$ | $+j$ |
        | $\cos(u + \theta)$ | $e^{j\theta}$ |

        Some things **never** change the polarization: a factor that multiplies **both** parts, whether it is a common amplitude, a common minus sign, or a common phase $e^{j\theta}$. It only rescales the path or shifts the clock. Only the **relative** amplitude and the **relative** phase of the two parts matter.

        **Example.** $\mathbf E = 5\sin(\omega t - \beta y)\,\hat x + 5\cos(\omega t - \beta y)\,\hat z$ V/m.
        - Travel: $+\hat y$.
        - Phasor at $y = 0$: the sine becomes $-j$, so $\tilde{\mathbf E} = -j5\,\hat x + 5\,\hat z = 5\hat z - j5\hat x$.
        - Split: $\mathbf a = 5\hat z$, $\mathbf b = -5\hat x$, $-\mathbf b = 5\hat x$.
        - Cross: $\hat z\times\hat x = +\hat y$, along the travel. Equal lengths, perpendicular: **RHCP**.

        With the review session's words: the cosine ($\hat z$) is ahead of the sine ($\hat x$), and $\hat z\times\hat x = +\hat y$. Same answer.
      `),
      Q(md`**Predict.** $\mathbf E = 2\cos(\omega t - \beta z + 40°)\,\hat x - 2\sin(\omega t - \beta z + 40°)\,\hat y$ V/m. The wave is…`,
        ['left-handed circular (LHCP)', 'right-handed circular (RHCP)', 'right-handed elliptical', 'linear'], 0,
        [null, md`That reads $-\sin$ as $\sin$. But $-\sin x = \cos(x + 90°)$: the $y$ part is **ahead** of the $x$ part.`, md`The $40°$ is in both parts: a common phase only shifts the clock. It cannot turn a circle into an ellipse.`, md`The parts are $90°$ apart, so the tip goes around.`],
        md`Phasor: $2e^{j40°}(\hat x + j\hat y)$. Drop the common $2e^{j40°}$. The tip turns $\hat x\to-\hat y$; $\hat x\times(-\hat y) = -\hat z$, against the travel $+\hat z$: LHCP.`),
      R(md`
        ### 10. Three facts that save time

        **(a) H has the same polarization as E.** For one traveling wave,
        $$\tilde{\mathbf H} = \frac{1}{\eta}\,\hat k\times\tilde{\mathbf E}$$
        Crossing with $\hat k$ turns every vector across the travel by $90°$ about $\hat k$. Turning the whole path rigidly cannot change its shape or its sense of rotation. Dividing by $\eta$ only rescales it (and, in a lossy medium, delays it by the angle $\tau$ of $\eta$). So **$\mathbf H$ has the same shape and the same hand as $\mathbf E$.** Lecture 24's Example 3 shows it: $\tilde{\mathbf E} = \hat x - j\hat y$ toward $+\hat z$ gives
        $$\tilde{\mathbf H} = \frac{1}{\eta_0}(\hat y + j\hat x)$$
        For this $\mathbf H$: $\mathbf a = \hat y$ and $-\mathbf b = -\hat x$, so $\hat y\times(-\hat x) = +\hat z$. RHCP, like $\mathbf E$ ✓.

        **(b) Two circles make a line.** Add equal RHCP and LHCP waves going toward $+\hat z$:
        $$(\hat x - j\hat y) + (\hat x + j\hat y) = 2\hat x$$
        Linear along $\hat x$. Subtract them instead and you get $-2j\hat y$: linear along $\hat y$. With unequal weights the sum is elliptical and takes the hand of the larger circle:
        $$3(\hat x - j\hat y) + (\hat x + j\hat y) = 4\hat x - j2\hat y$$
        which is right-handed elliptical. Read backward, this says any linear wave is half RHCP plus half LHCP (Lecture 24, and FA23 #1(a)).

        **(c) Reflection reverses the hand.** A wave $(\mathbf a + j\mathbf b)\,e^{-j\beta z}$ hits a flat boundary head-on. The reflected wave is $\Gamma(\mathbf a + j\mathbf b)\,e^{+j\beta z}$, where $\Gamma$ is the reflection coefficient ([Topic 11](#/l/w4-gamma) derives it; a perfect conductor has $\Gamma = -1$). Multiplying the whole phasor by one number scales the path and shifts the clock, so at a fixed point the reflected tip turns the **same way** as the incident tip. But it travels the other way. Same rotation, opposite travel: **opposite hand.** An RHCP wave comes back from a mirror as LHCP.

        **(d) Power adds over the two parts.** Each perpendicular part carries its own power ([Topic 4](#/l/w1-avg)):
        $$\langle S\rangle = \frac{A^2 + B^2}{2\eta}$$
        So a circular wave carries twice the power of a linear wave with the same peak $|\mathbf E|$ (Lecture 24, Example 3).
      `),
      Q(md`**Predict.** An LHCP wave traveling toward $+\hat z$ reflects head-on from a perfect conductor. The reflected wave is…`,
        ['RHCP, traveling toward $-\\hat z$', 'LHCP, traveling toward $-\\hat z$', 'linear, traveling toward $-\\hat z$', 'elliptical, because only part of it reflects'], 0,
        [null, md`The tip turns the same way at a fixed point, but the thumb now points along $-\hat z$. Same rotation, opposite travel, opposite hand.`, md`$\Gamma$ multiplies both components by the same number, so their $90°$ relation survives.`, md`A perfect conductor reflects everything: $|\Gamma| = 1$. And a common factor could not change the shape anyway.`],
        md`$\tilde{\mathbf E}_r = -(\mathbf a + j\mathbf b)e^{+j\beta z}$: the same rotation sense as the incident wave, traveling toward $-\hat z$. So the hand flips: RHCP.`),
      R(md`
        ### The method

        !!method Name the polarization of any wave
          1. **Travel.** Read $\hat k$ from the phase: $-\beta x$ means $+\hat x$, $+\beta x$ means $-\hat x$.
          2. **Phasor at a convenient plane.** Drop the propagation factor. Turn $\sin$ into $-j$, $-\sin$ into $+j$, minus signs into $-1$.
          3. **Split.** $\tilde{\mathbf E} = \mathbf a + j\mathbf b$. Drop any factor common to both parts.
          4. **Shape.** $\mathbf a\parallel\mathbf b$ or one is zero: linear. $|\mathbf a| = |\mathbf b|$ and $\mathbf a\perp\mathbf b$: circular. Otherwise: elliptical.
          5. **Hand.** The tip goes from $\mathbf a$ to $-\mathbf b$. $\mathbf a\times(-\mathbf b)$ along $\hat k$: right. Against: left. (Or ahead $\times$ behind, the same thing.)
          6. **Check** with one snapshot in time: where is the tip at $\omega t = 0$, and where a quarter period later?

        ### Worked example 1: a magnetic field along $-\hat x$

        !!graded Problem
          In free space, $\mathbf H = 2\cos(\omega t + \beta x - 30°)\,\hat y - 2\sin(\omega t + \beta x - 30°)\,\hat z$ A/m. Find the travel direction, the polarization of $\mathbf H$ and of $\mathbf E$, the phasor $\tilde{\mathbf E}$, and $\langle\mathbf S\rangle$.

        **Step 1: travel.** The phase has $+\beta x$, so $\hat k = -\hat x$.

        **Step 2: phasors.** The $\hat y$ part is $2\cos(u - 30°)$ with $u = \omega t + \beta x$: phasor $2e^{-j30°}$. The $\hat z$ part is $-2\sin(u - 30°)$. Since $-\sin\theta = \cos(\theta + 90°)$, its phasor is $2e^{-j30°}\cdot j$. Together:
        $$\tilde{\mathbf H} = 2e^{-j30°}(\hat y + j\hat z)\,e^{j\beta x}$$
        **Step 3: shape and hand.** Drop the common $2e^{-j30°}$. Then $\mathbf a = \hat y$ and $\mathbf b = \hat z$: equal and perpendicular, a circle. The tip goes from $\hat y$ to $-\hat z$:
        $$\hat y\times(-\hat z) = -\hat x$$
        That is the travel direction: **RHCP**.

        **Step 4: E from H.** Start from $\eta\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}$ and cross both sides with $\hat k$ from the left. The identity $\hat k\times(\hat k\times\tilde{\mathbf E}) = -\tilde{\mathbf E}$ (true because $\tilde{\mathbf E}\perp\hat k$) gives
        $$\tilde{\mathbf E} = \eta\,\tilde{\mathbf H}\times\hat k$$
        With $\hat k = -\hat x$, cross each unit vector: $\hat y\times(-\hat x) = +\hat z$ and $\hat z\times(-\hat x) = -\hat y$. So
        $$(\hat y + j\hat z)\times(-\hat x) = \hat z - j\hat y$$
        and with $\eta_0 = 120\pi\ \Omega$:
        $$\tilde{\mathbf E} = 240\pi\,e^{-j30°}(\hat z - j\hat y)\,e^{j\beta x}$$
        in V/m. **Check the hand of E:** the tip goes $\hat z\to\hat y$, and $\hat z\times\hat y = -\hat x$, the travel. RHCP, the same as $\mathbf H$ ✓.

        **Step 5: power.** The two parts of $\mathbf H$ each have amplitude 2 A/m, and their powers add:
        $$\langle S\rangle = \frac{\eta_0}{2}(2^2 + 2^2) = 480\pi \approx 1510\ \text{W/m}^2$$
        directed along $-\hat x$.

        **Speed path.** "$-\sin$ is $+j$." $\hat y + j\hat z$ turns $\hat y\to-\hat z$; $\hat y\times(-\hat z) = -\hat x$ = travel: RHCP, and $\mathbf E$ has the same hand without computing it.

        **Where points go.** Reading $+\beta x$ as travel toward $+\hat x$. Treating $-\sin$ as $-j$. Computing $\mathbf E$ as $\eta\,\hat k\times\tilde{\mathbf H}$ (the wrong order flips its sign).

        ### Worked example 2: an ellipse along $\hat y$

        !!graded Problem
          $\mathbf E = 4\cos(\omega t - \beta y)\,\hat z + 2\cos(\omega t - \beta y + 45°)\,\hat x$ V/m in free space. Name the polarization and find $\langle S\rangle$.

        **Step 1: travel.** $-\beta y$: $\hat k = +\hat y$.

        **Step 2: ahead and behind.** The $\hat x$ part has phase $+45°$, the $\hat z$ part $0°$. So $\hat x$ is ahead by $45°$:
        $$\text{ahead}\times\text{behind} = \hat x\times\hat z = -\hat y$$
        That is against the travel: **left-handed**.

        **Step 3: shape.** The amplitudes differ (4 and 2) and the phase difference is $45°$: **elliptical**. Left-handed elliptical.

        **Step 4: check with the phasor test.** $\tilde{\mathbf E} = 4\hat z + 2e^{j45°}\hat x$. With $2e^{j45°} = \sqrt2 + j\sqrt2$:
        $$\mathbf a = 4\hat z + \sqrt2\,\hat x, \qquad \mathbf b = \sqrt2\,\hat x$$
        Then $\mathbf a\times(-\mathbf b) = 4\hat z\times(-\sqrt2\,\hat x) = -4\sqrt2\,\hat y$ (the $\hat x\times\hat x$ term is zero). Against the travel ✓.

        **Step 5: power.**
        $$\langle S\rangle = \frac{4^2 + 2^2}{2(120\pi)} = \frac{1}{12\pi} \approx 0.0265\ \text{W/m}^2$$

        **Speed path.** Larger phase = ahead. $\hat x\times\hat z = -\hat y$ (backward around the cycle). Opposite to $+\hat y$: left. Unequal: elliptical.

        ### Worked example 3: design for a hand

        !!graded Problem
          $E_x = 6\cos(\omega t + \beta z)$ V/m. Choose $E_y$ so that the wave is LHCP.

        **Step 1: travel.** $+\beta z$: $\hat k = -\hat z$.

        **Step 2: what left-handed needs.** $\mathbf a\times(-\mathbf b)$ must point **against** the travel, so along $+\hat z$.

        **Step 3: build it.** Circular needs the same amplitude and a $90°$ shift: $\tilde E_y = \pm j6$. The $x$ part gives $\mathbf a = 6\hat x$. We need $6\hat x\times(-\mathbf b)$ along $+\hat z$, so $-\mathbf b$ must point along $+\hat y$: $\mathbf b = -6\hat y$. That is $\tilde{\mathbf E} = 6\hat x - j6\hat y$.

        **Step 4: back to time.** $-j6$ is $6\sin$:
        $$E_y = 6\sin(\omega t + \beta z)\ \text{V/m}$$
        **Check.** The cosine ($\hat x$) is ahead of the sine ($\hat y$); $\hat x\times\hat y = +\hat z$, against the travel $-\hat z$: left ✓. This is the lecture's right-circular carrier sent the other way, so its hand flips, as it must.

        **Where points go.** Copying the RHCP answer for $+\hat z$ ($+\sin$) without noticing the travel is $-\hat z$. Choosing $-6\sin$, which gives RHCP.

        ### The whole topic on one table

        | Question | Test |
        |---|---|
        | Travel | sign of $\beta$ term: $-\beta x\to+\hat x$ |
        | Linear | parts $0°$ or $180°$ apart (any amplitudes) |
        | Circular | equal amplitudes **and** $\pm90°$ |
        | Elliptical | anything else |
        | Hand | $\mathbf a\times(-\mathbf b)$, or ahead $\times$ behind, vs $\hat k$ |
        | $\mathbf H$ | same shape, same hand |
        | Reflection | same turn, opposite travel: hand flips |
        | Power | $\langle S\rangle = (A^2 + B^2)/2\eta$ |

        !!mistake Common mistakes
          - **"Clockwise" without saying from where.** The same turn is clockwise from one side and counterclockwise from the other. Use the thumb or the cross product.
          - **Misreading the travel.** $e^{+j\beta x}$ and $\cos(\omega t + \beta x)$ travel toward $-\hat x$.
          - **Crossing $\mathbf a$ with $+\mathbf b$.** The tip moves from $\mathbf a$ toward $-\mathbf b$.
          - **Leaving a minus sign out of the unit vector** in ahead $\times$ behind. $-3\cos(\cdot)\,\hat y$ points along $-\hat y$.
          - **Thinking $\sin$ leads $\cos$.** $\sin u = \cos(u - 90°)$: the sine is behind.
          - **Half a circle condition.** $90°$ with unequal amplitudes is an ellipse; equal amplitudes at $60°$ are an ellipse.
          - **Cyclic order.** $\hat z\times\hat x = +\hat y$ and $\hat x\times\hat z = -\hat y$.
          - **A common phase or sign "changes" nothing.** Only relative amplitude and relative phase matter.
          - **Judging a reflected wave with the incident travel direction.**

        !!key Speed tricks
          - **Minus $j$ means toward.** $\hat a - j\hat b$: the tip turns $\hat a\to\hat b$. $\hat a + j\hat b$: $\hat a\to-\hat b$.
          - **One cross product.** From $\times$ to $= \hat k$: right. $= -\hat k$: left.
          - **Cyclic order** $x\,y\,z\,x\,y\,z$: forward is $+$, backward is $-$.
          - **Same rotation, opposite travel, opposite hand:** backward waves, the far side of a current sheet, reflections.
          - **Circle in two seconds:** equal amplitudes **and** exactly $\pm90°$. **Line:** $0°$ or $180°$, any amplitudes.
          - **Given H?** Judge $\mathbf H$ directly: same answer as $\mathbf E$.
          - **Ignore** common amplitudes, common signs and common phases.

        ### Check questions
      `),
      Q(md`FA23 #2(c): $\mathbf H = \hat x\,2\cos(\omega t - kz) + \hat y\,2\cos(\omega t - kz + \pi/4)$ A/m. (The paper labels the amplitudes in V/m; for $\mathbf H$ they are A/m.) The polarization is…`,
        ['elliptical (left-handed)', 'right circular', 'left circular', 'linear'], 0,
        [null, md`Equal amplitudes are only half the condition for a circle; the phase difference is $\pi/4$, not $\pi/2$. (It is left-handed, too.)`, md`Equal amplitudes, but $\pi/4$ apart, not $\pi/2$: $|\mathbf H|$ changes as the tip goes round.`, md`Linear needs $0$ or $\pi$ between the parts; here it is $\pi/4$.`],
        md`Amplitudes 2 and 2, phase difference $45°$: elliptical, as the FA23 key says. Its hand: $\hat y$ is ahead by $45°$; $\hat y\times\hat x = -\hat z$, against the travel $+\hat z$: left-handed.`, { src: 'FA23 #2(c)' }),
      Q(md`FA23 #2(b): $\mathbf H = \hat x\,4\cos(\omega t - kz) + \hat y\,2\cos(\omega t - kz + \pi)$ A/m. The tip of $\mathbf H$ moves…`,
        [md`on a line along $2\hat x - \hat y$`, md`on a line along $2\hat x + \hat y$`, md`around an ellipse with half-axes 4 and 2`, md`around a left-handed circle`], 0,
        [null, md`$\cos(\theta + \pi) = -\cos\theta$: when $H_x = +4$, $H_y = -2$.`, md`An ellipse needs a phase difference other than $0$ or $\pi$. A shift of $\pi$ only flips a sign.`, md`A circle needs equal amplitudes and $\pi/2$. Neither holds.`],
        md`$\mathbf H = (4\hat x - 2\hat y)\cos(\omega t - kz)$: linear along $2\hat x - \hat y$. The FA23 key: linear.`, { src: 'FA23 #2(b)' }),
      Q(md`SP18 #1(iii): $\tilde{\mathbf E} = 10e^{-j\beta z}\hat x + Be^{j\phi}e^{-j\beta z}\hat y$ V/m, with $B\ge 0$ and $0\le\phi<2\pi$. Which statements are true? I. Linear if $\phi = 0$, for any $B$. II. Linear if $\phi = \pi/2$, for any $B$. III. Linear if $B = 0$, for any $\phi$.`,
        ['I and III only', 'I only', 'III only', 'I, II and III'], 0,
        [null, md`III is true too: with $B = 0$ only the $\hat x$ part is left, and one component is always linear.`, md`I is true too: $\phi = 0$ puts the parts in phase, a line along $10\hat x + B\hat y$.`, md`II is false: $\phi = \pi/2$ with $B = 10$ gives $10(\hat x + j\hat y)$, a circle.`],
        md`I: in phase, linear ✓. II: a quarter period apart, circular or elliptical unless $B = 0$ ✗. III: one component, linear ✓. Answer: I and III only.`, { src: 'SP18 #1(iii)' }),
      Q(md`SP18 #1(iv): the same wave. Which is right-circularly polarized? I. $\phi = 0$, $B = 10$. II. $\phi = \pi/2$, $B = 10$. III. $\phi = 3\pi/2$, $B = 10$.`,
        ['III only', 'II only', 'I only', 'II and III'], 0,
        [null, md`$e^{j\pi/2} = +j$: $\hat x + j\hat y$ turns $\hat x\to-\hat y$, and $\hat x\times(-\hat y) = -\hat z$: left-handed.`, md`$\phi = 0$ is in phase: linear, with no hand.`, md`II and III turn opposite ways, so they cannot both be right-handed.`],
        md`$e^{j3\pi/2} = -j$, so $\tilde{\mathbf E} \propto \hat x - j\hat y$: the tip turns $\hat x\to\hat y$, $\hat x\times\hat y = +\hat z$ = travel. RHCP. Answer: III only.`, { src: 'SP18 #1(iv)' }),
      Q(md`SP24 #2(d): a wave in a good conductor travels toward $+\hat x$ with $\mathbf E$ along $\hat z$. A $\hat y$ part is added so that the wave is **left-handed** circular. Which is its magnetic-field phasor ($H_0 = |\mathbf H(0,0)|$)?`,
        [md`$H_0e^{-\alpha x}e^{-j\beta x}(-\hat y - j\hat z)$ A/m`, md`$H_0e^{-\alpha x}e^{-j\beta x}(\hat z + j\hat y)$ A/m`, md`$H_0e^{-\alpha x}e^{-j\beta x}(\hat y - j\hat z)$ A/m`, md`$H_0e^{\alpha x}e^{j\beta x}(\hat z - j\hat y)$ A/m`], 0,
        [null, md`The tip turns $\hat z\to-\hat y$, and $\hat z\times(-\hat y) = +\hat x$: right-handed. Also an $\mathbf H$ with a $\hat z$ part this size cannot go with an $\mathbf E$ along $\hat z$.`, md`The tip turns $\hat y\to\hat z$, and $\hat y\times\hat z = +\hat x$: right-handed.`, md`$e^{+j\beta x}$ travels toward $-\hat x$, and $e^{+\alpha x}$ grows the wrong way.`],
        md`LHCP $\mathbf E$ toward $+\hat x$: $\tilde{\mathbf E}\propto\hat z - j\hat y$ (tip $\hat z\to\hat y$, $\hat z\times\hat y = -\hat x$, against the travel). Then $\tilde{\mathbf H}\propto\hat x\times(\hat z - j\hat y) = -\hat y - j\hat z$. Its tip turns $-\hat y\to\hat z$, and $(-\hat y)\times\hat z = -\hat x$: left-handed, like $\mathbf E$. Strictly, $\tilde{\mathbf H} = \tilde{\mathbf E}/\eta$ also carries $e^{-j45°}$ in a good conductor; every option leaves it out, and a common phase changes nothing.`, { src: 'SP24 #2(d)' }),
      Q(md`FA23 #1(a): given the direction of travel, which is true? (1) A field of any polarization is a superposition of two orthogonally polarized fields. (2) A linearly polarized field is a superposition of circularly polarized fields.`,
        ['Both (1) and (2)', 'Only (1)', 'Only (2)', 'Neither'], 0,
        [null, md`(2) holds too: $\hat x = \tfrac12(\hat x - j\hat y) + \tfrac12(\hat x + j\hat y)$.`, md`(1) holds too: any $\tilde{\mathbf E}$ across $\hat z$ is $\tilde E_x\hat x + \tilde E_y\hat y$.`, md`Both are standard results of Lecture 24.`],
        md`Any transverse phasor splits into $\hat x$ and $\hat y$ parts, and equally into RHCP and LHCP parts. The FA23 key: all of the above.`, { src: 'FA23 #1(a)' }),
      Q(md`$\tilde{\mathbf E} = (3\hat y - j3\hat z)e^{+j\beta x}$ V/m is multiplied by $-j$. The new wave is…`,
        ['LHCP, exactly like the original', 'RHCP: multiplying by $-j$ reverses the turn', 'linear', 'elliptical'], 0,
        [null, md`A common factor multiplies both parts, so it only shifts the clock by a quarter period. The turn is unchanged.`, md`A common factor cannot change the relation between the two parts.`, md`$|-j| = 1$: it changes no amplitude.`],
        md`The original: tip $\hat y\to\hat z$, $\hat y\times\hat z = +\hat x$, travel $-\hat x$: LHCP. A common factor changes nothing: still LHCP.`),
      Q(md`$\tilde{\mathbf E}$ is RHCP and travels toward $-\hat y$ in free space. Then $\tilde{\mathbf H}$ is…`,
        ['RHCP, traveling toward $-\\hat y$', 'LHCP, traveling toward $-\\hat y$', 'linear, perpendicular to $\\mathbf E$', 'RHCP, traveling toward $+\\hat y$'], 0,
        [null, md`$\hat k\times$ turns the whole path rigidly by $90°$; a rigid turn keeps the sense of rotation.`, md`$\mathbf H$ is perpendicular to $\mathbf E$ at each instant, but it turns along with $\mathbf E$: a circle too.`, md`$\mathbf E$ and $\mathbf H$ of one wave travel together.`],
        md`$\tilde{\mathbf H} = \frac{1}{\eta_0}\hat k\times\tilde{\mathbf E}$: same shape, same hand, same travel.`),
      R(md`
        ### Practice, level 1: name the hand, along any axis

        **The trick:** travel from the phase; phasor $\mathbf a + j\mathbf b$; the tip goes from $\mathbf a$ to $-\mathbf b$ (or ahead to behind); cross; compare with $\hat k$. Answer in about 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_w3_hand', { need: 8 }), { id: 'w3-pol.r0' }),
      R(md`
        ### Practice, level 1: line, circle or ellipse

        **The trick:** $0°$ or $180°$ is a line; equal amplitudes **and** $\pm90°$ is a circle; everything else is an ellipse. Then the hand, if there is one.
      `),
      Object.assign(G('rf_w3_shape', { need: 8 }), { id: 'w3-pol.r1' }),
      R(md`
        ### Practice, level 1: the small moves

        **The trick:** $\sin\to-j$, $-\sin\to+j$; $e^{+j\beta x}$ travels toward $-\hat x$; cyclic order for cross products; $\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta$.
      `),
      Object.assign(G('rf_w3_moves', { need: 8 }), { id: 'w3-pol.r2' }),
      R(md`
        ### Practice, level 2: whole waves, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w3_read', { need: 2 }),
      G('w3_make', { need: 2 }),
      G('w3_hfield', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A circularly polarized wave, its magnetic field, its power, and what comes back from a mirror.
      `),
      G('w3_exam', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- generator helpers
  // A transverse part of a field: amplitude A > 0 along +unit vector of axis i, cosine phase th (deg): A cos(u + th) e_i.
  const XYZ = ['x', 'y', 'z'];
  const uv = (i, s = 1) => { const v = [0, 0, 0]; v[i] = s; return v; };
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const axisOf = (v) => { const i = [0, 1, 2].find((k) => Math.abs(v[k]) > 1e-9); return [i, Math.sign(v[i])]; };
  const sh = (i, s = 1) => `${s < 0 ? '-' : ''}\\hat ${XYZ[i]}`;
  const shV = (v) => sh(...axisOf(v));
  const kT = (k) => { const [i, s] = axisOf(k); return `${s > 0 ? '+' : '-'}\\hat ${XYZ[i]}`; };
  const wrap = (d) => { let x = ((Math.round(d) % 360) + 360) % 360; if (x > 180) x -= 360; return x; };
  const cmp = (i, A, th, At) => ({ i, A, th: wrap(th), At });
  // the second part with its phase mirrored about the first: same parts, opposite turn
  const flipC = (c0, c1) => cmp(c1.i, c1.A, 2 * c0.th - c1.th, c1.At);
  const angT = (d) => `e^{${d < 0 ? '-' : ''}j${Math.abs(d)}°}`;
  // the cos / sin / -cos / -sin form with the smallest phase (the way a person would write it)
  const bestForm = (c) => FORMS.map((fm) => [fm, Math.abs(wrap(c.th + { cos: 0, sin: 90, mcos: 180, msin: -90 }[fm]))]).sort((x, y) => x[1] - y[1])[0][0];
  const geom = () => { const c = pick([0, 1, 2]), s = pick([1, -1]); const [i1, i2] = shuffle([0, 1, 2].filter((i) => i !== c)); return { c, s, i1, i2, k: uv(c, s) }; };
  const phasorOf = (cs) => { const a = [0, 0, 0], b = [0, 0, 0]; cs.forEach((c) => { a[c.i] += c.A * Math.cos(c.th * DEG); b[c.i] += c.A * Math.sin(c.th * DEG); }); return [a, b]; };
  // 'LIN', 'RC', 'LC', 'RE', 'LE' from a x (-b) and the travel
  const classify = (cs, k) => classifyAB(...phasorOf(cs), k);
  function classifyAB(a, b, k) {
    const ax = cross(a, b.map((x) => -x)), scl = dot(a, a) + dot(b, b);
    if (Math.hypot(...ax) < 1e-9 * scl) return 'LIN';
    const circ = Math.abs(dot(a, a) - dot(b, b)) < 1e-9 * scl && Math.abs(dot(a, b)) < 1e-9 * scl;
    return (dot(ax, k) > 0 ? 'R' : 'L') + (circ ? 'C' : 'E');
  }
  const LAB = { RC: 'right-handed circular (RHCP)', LC: 'left-handed circular (LHCP)', LIN: 'linear', RE: 'right-handed elliptical', LE: 'left-handed elliptical' };
  const SHORT = { RC: 'RHCP', LC: 'LHCP', LIN: 'linear', RE: 'right-handed elliptical', LE: 'left-handed elliptical' };
  const ampT = (c) => c.At || (c.A === 1 ? '' : p(c.A));
  const ampV = (c) => c.At || p(c.A);
  const degT = (d) => (d === 0 ? '' : d > 0 ? ` + ${d}°` : ` - ${-d}°`);
  const uT = (g) => `\\omega t ${g.s > 0 ? '-' : '+'} \\beta ${XYZ[g.c]}`;
  const expT = (g) => `e^{${g.s > 0 ? '-' : ''}j\\beta ${XYZ[g.c]}}`;
  // a phasor coefficient times a unit vector: '3\hat x', ' - j3\hat y', ' + 2e^{j45°}\hat z'
  function pTerm(c, first) {
    const th = wrap(c.th), a = ampT(c), u = `\\hat ${XYZ[c.i]}`;
    let sg = '+', body;
    if (th === 0) body = a;
    else if (th === 180) { sg = '-'; body = a; }
    else if (th === 90) body = `j${a}`;
    else if (th === -90) { sg = '-'; body = `j${a}`; }
    else body = `${a}e^{${th < 0 ? '-' : ''}j${Math.abs(th)}°}`;
    return `${first ? (sg === '-' ? '-' : '') : ` ${sg} `}${body}${u}`;
  }
  const phT = (cs, g, H) => `\\tilde{\\mathbf ${H ? 'H' : 'E'}} = (${pTerm(cs[0], true)}${pTerm(cs[1])})\\,${expT(g)}`;
  const phOnly = (cs, g) => `(${pTerm(cs[0], true)}${pTerm(cs[1])})\\,${expT(g)}`;
  // A cos(u + th) written as cos, sin, -cos or -sin (all equal): cos x = sin(x + 90) = -cos(x + 180) = -sin(x - 90)
  function tTerm(c, first, g, form) {
    const shift = { cos: 0, sin: 90, mcos: 180, msin: -90 }[form];
    const ph = wrap(c.th + shift), neg = form[0] === 'm', fn = form.endsWith('cos') ? 'cos' : 'sin';
    return `${first ? (neg ? '-' : '') : neg ? ' - ' : ' + '}${ampT(c)}\\${fn}(${uT(g)}${degT(ph)})\\,\\hat ${XYZ[c.i]}`;
  }
  const tmT = (cs, g, forms, H) => `\\mathbf ${H ? 'H' : 'E'} = ${tTerm(cs[0], true, g, forms[0])}${tTerm(cs[1], false, g, forms[1])}`;
  // ahead x behind, for two parts on different axes (not linear)
  function ab(cs, k) {
    const d = wrap(cs[0].th - cs[1].th);
    const [ah, bh] = d > 0 ? [cs[0], cs[1]] : [cs[1], cs[0]];
    const X = cross(uv(ah.i), uv(bh.i));
    return { d: Math.abs(d), ah, bh, X, along: dot(X, k) > 0, txt: md`$\hat ${XYZ[ah.i]}$ is ahead by $${Math.abs(d)}°$; ahead $\times$ behind $= \hat ${XYZ[ah.i]}\times\hat ${XYZ[bh.i]} = ${shV(X)}$, ${dot(X, k) > 0 ? 'along' : 'against'} the travel $${kT(k)}$` };
  }
  // why a wrong label is wrong, for a field whose right label is rk
  function whyL(rk, wk, cs, k) {
    const d = Math.abs(wrap(cs[0].th - cs[1].th)), eq = Math.abs(cs[0].A - cs[1].A) < 1e-9;
    if (rk === 'LIN') return md`The two parts are ${d === 0 ? 'in phase' : '$180°$ apart'}, so the tip only slides along one line. A line has no hand.`;
    if (wk === 'LIN') return md`The parts are $${d}°$ apart, not $0°$ or $180°$, so the tip never stays on one line.`;
    const out = [];
    if (wk[0] !== rk[0]) { const A = ab(cs, k); out.push(md`Wrong hand: ${A.txt}. This option comes from reading the travel backward, or crossing in the wrong order.`); }
    if (wk[1] !== rk[1]) {
      if (wk[1] === 'C') out.push(eq ? md`The amplitudes are equal, but the parts are $${d}°$ apart, not $90°$: $|\mathbf E|$ changes as the tip goes round.` : md`The amplitudes differ (${ampV(cs[0])} and ${ampV(cs[1])}), so $|\mathbf E|$ changes as the tip goes round.`);
      else out.push(md`Equal amplitudes and exactly $90°$ apart: $|\mathbf E|$ stays constant, a circle.`);
    }
    return out.join(' ');
  }
  // the solution of a "name it" card, from the parts written as cosines
  function nameSol(cs, g, rk, fieldName) {
    const F = fieldName || 'E';
    const lines = [md`**Travel.** The phase has $${g.s > 0 ? '-' : '+'}\beta ${XYZ[g.c]}$, so $\hat k = ${kT(g.k)}$.`,
      md`**As cosines with positive amplitudes** (using $\sin x = \cos(x - 90°)$, $-\cos x = \cos(x + 180°)$, $-\sin x = \cos(x + 90°)$, and $u = ${uT(g)}$): the $\hat ${XYZ[cs[0].i]}$ part is $${ampV(cs[0])}\cos(u${degT(cs[0].th)})$ and the $\hat ${XYZ[cs[1].i]}$ part is $${ampV(cs[1])}\cos(u${degT(cs[1].th)})$.`];
    const d = Math.abs(wrap(cs[0].th - cs[1].th));
    if (rk === 'LIN') lines.push(md`**Shape.** They are ${d === 0 ? 'in phase' : '$180°$ apart'}: $\mathbf ${F}$ is a fixed vector times one cosine. **Linear**, no hand.`);
    else {
      const A = ab(cs, g.k);
      lines.push(md`**Hand.** ${A.txt}: **${rk[0] === 'R' ? 'right' : 'left'}-handed**.`);
      lines.push(rk[1] === 'C' ? md`**Shape.** Equal amplitudes, exactly $90°$ apart: **circular**.` : md`**Shape.** ${Math.abs(cs[0].A - cs[1].A) < 1e-9 ? `Equal amplitudes but $${d}°$ apart` : d === 90 ? 'A quarter period apart but unequal amplitudes' : `Unequal amplitudes and $${d}°$ apart`}: **elliptical**.`);
    }
    return lines.join(NL2);
  }
  // the card: right label plus four wrong labels
  function nameCard(title, q, cs, g, fieldName) {
    const rk = classify(cs, g.k);
    const wr = Object.keys(LAB).filter((x) => x !== rk).map((wk) => [LAB[wk], whyL(rk, wk, cs, g.k)]);
    return MC(title, q, LAB[rk], wr, nameSol(cs, g, rk, fieldName));
  }
  const amps = [1, 2, 3, 4, 5, 6, 8, 10];
  const FORMS = ['cos', 'sin', 'mcos', 'msin'];
  // a random pair of parts: circular (equal, +-90), or any shape
  function pair(g, kind) {
    const A = pick(amps), t1 = pick([0, 0, 0, 30, -45, 60, 90, 180]);
    if (kind === 'circ') return [cmp(g.i1, A, t1), cmp(g.i2, A, t1 + pick([90, -90]))];
    if (kind === 'ell') {
      if (pick([true, false])) return [cmp(g.i1, A, t1), cmp(g.i2, pick(amps.filter((x) => x !== A)), t1 + pick([90, -90]))];
      return [cmp(g.i1, A, t1), cmp(g.i2, pick([A, pick(amps)]), t1 + pick([45, -45, 60, -60, 120, -120, 135, -135, 30, -150]))];
    }
    return [cmp(g.i1, A, t1), cmp(g.i2, pick(amps), t1 + pick([0, 180]))];
  }
  const anyKind = () => pick(['circ', 'circ', 'ell', 'ell', 'lin']);

  // ---------------------------------------------------------------- level 1: name the hand
  GENS.rf_w3_hand = () => one([
    // phasor form, along any axis
    () => { const g = geom(), cs = pair(g, pick(['circ', 'circ', 'ell'])); return nameCard('Name it: a phasor', md`$${phT(cs, g)}$ V/m. The wave is…`, cs, g); },
    // time form with sines, cosines and minus signs
    () => { const g = geom(), cs = pair(g, pick(['circ', 'circ', 'ell'])); return nameCard('Name it: sines and cosines', md`$${tmT(cs, g, [pick(['cos', 'cos', 'mcos']), pick(FORMS)])}$ V/m. The wave is…`, cs, g); },
    // the review session's style: two cosines with phases
    () => { const g = geom(), cs = pair(g, anyKind()); return nameCard('Name it: ahead and behind', md`$${tmT(cs, g, [pick(['cos', 'mcos']), pick(['cos', 'mcos'])])}$ V/m. The wave is…`, cs, g); },
    // a magnetic field
    () => {
      const g = geom(), cs = pair(g, pick(['circ', 'ell'])), H = pick([true, false]);
      const q = H ? md`A wave has $${phT(cs, g, true)}$ A/m. Its polarization is…` : md`A wave has $${tmT(cs, g, [pick(['cos', 'sin']), pick(FORMS)], true)}$ A/m. Its polarization is…`;
      const c = nameCard('Name it from H', q, cs, g, 'H');
      c.sol += NL2 + md`$\mathbf H$ and $\mathbf E$ of one wave always have the same shape and hand.`;
      return c;
    },
    // which phasor has a given hand and direction?
    () => {
      const g = geom(), A = pick([1, 2, 3, 5]), want = pick(['R', 'L']);
      const c1 = cmp(g.i1, A, 0); let c2 = cmp(g.i2, A, 90);
      if (classify([c1, c2], g.k)[0] !== want) c2 = cmp(g.i2, A, -90);
      const flip = flipC(c1, c2), gb = Object.assign({}, g, { s: -g.s, k: uv(g.c, -g.s) });
      const nm = want === 'R' ? 'RHCP' : 'LHCP';
      const qv = uv(g.i2, c2.th === -90 ? 1 : -1), X = qv;       // the tip goes from e_i1 toward qv (that is -b)
      return MC('Which one is it?', md`Which phasor is **${nm}**, traveling toward $${kT(g.k)}$?`, `$${phOnly([c1, c2], g)}$`,
        [[`$${phOnly([c1, flip], g)}$`, md`That one turns the other way, from $\hat ${XYZ[g.i1]}$ toward $${sh(g.i2, flip.th === -90 ? 1 : -1)}$: the opposite hand.`],
          [`$${phOnly([c1, c2], gb)}$`, md`The right turn, but its exponent sends it toward $${kT(gb.k)}$. Same rotation, opposite travel: the opposite hand.`],
          [`$${phOnly([c1, cmp(g.i2, A, 0)], g)}$`, md`No $j$: the parts are in phase, so it is linear.`],
          [`$${phOnly([c1, cmp(g.i2, 2 * A, c2.th)], g)}$`, md`The right hand, but the amplitudes differ (${p(A)} and ${p(2 * A)}): elliptical, not circular.`]],
        md`"Minus $j$: toward." The tip turns from $\hat ${XYZ[g.i1]}$ toward $${shV(X)}$, and $\hat ${XYZ[g.i1]}\times${shV(X)} = ${shV(cross(uv(g.i1), X))}$, ${want === 'R' ? 'along' : 'against'} $\hat k = ${kT(g.k)}$: ${nm}.`);
    },
    // reflection reverses the hand
    () => {
      const g = geom(), cs = pair(g, 'circ'), rk = classify(cs, g.k), ok = rk === 'RC' ? 'LC' : 'RC', back = kT(uv(g.c, -g.s));
      return MC('After a mirror', md`$${phT(cs, g)}$ V/m hits a perfect conductor head-on. The reflected wave is…`, `${SHORT[ok]}, traveling toward $${back}$`,
        [[`${SHORT[rk]}, traveling toward $${back}$`, md`At a fixed point the reflected tip turns the same way as the incident one, but the travel reverses. Same turn, opposite travel: opposite hand.`],
          [`linear, traveling toward $${back}$`, md`$\Gamma = -1$ multiplies both parts by the same number, so their $90°$ relation survives.`],
          [`${SHORT[ok]}, traveling toward $${kT(g.k)}$`, md`A reflected wave travels back, toward $${back}$.`],
          [`${SHORT[rk]}, traveling toward $${kT(g.k)}$`, md`That is the incident wave itself. The reflected wave travels back, and its hand flips.`]],
        md`The incident wave: ${ab(cs, g.k).txt}, so it is ${SHORT[rk]}. The reflected phasor is $-1$ times the same bracket, traveling toward $${back}$. At a fixed point $-1$ only shifts the clock, so the tip turns the same way; the thumb now points along $${back}$. Same turn, opposite travel: **${SHORT[ok]}**.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: line, circle or ellipse
  GENS.rf_w3_shape = () => one([
    // FA23 #2 style: A cos(wt - bz) x + B cos(wt - bz + phi) y
    () => {
      const g = { c: 2, s: 1, i1: 0, i2: 1, k: uv(2) };
      const A = pick([2, 3, 4]), B = pick([2, 3, 4]), ph = pick([0, 180, 90, -90, 45, -45, 60, 120, -135]);
      const cs = [cmp(0, A, 0), cmp(1, B, ph)], fld = pick(['E', 'H']);
      return nameCard('Line, circle or ellipse?', md`$\mathbf ${fld} = ${A}\cos(\omega t - \beta z)\,\hat x + ${B}\cos(\omega t - \beta z${degT(ph)})\,\hat y$ ${fld === 'E' ? 'V/m' : 'A/m'}. The polarization is…`, cs, g, fld);
    },
    // SP18 style: 10 x + B e^{j phi} y
    () => {
      const g = geom(), B = pick([5, 10, 10, 20]), ph = pick([0, 90, 180, 270, 45, 135]);
      const cs = [cmp(g.i1, 10, 0), cmp(g.i2, B, ph)];
      return nameCard('Line, circle or ellipse?', md`$\tilde{\mathbf E} = 10\,${expT(g)}\,\hat ${XYZ[g.i1]} + ${B}e^{j${ph}°}\,${expT(g)}\,\hat ${XYZ[g.i2]}$ V/m. The polarization is…`, cs, g);
    },
    // a sum of an RHCP and an LHCP wave: A(x - jy) + sg B(x + jy) = re x + j im y
    () => {
      const A = pick([1, 2, 3]), B = pick([1, 2, 3]), sg = pick([1, -1]);
      const re = A + sg * B, im = -A + sg * B;
      const rk = re === 0 || im === 0 ? 'LIN' : (A > B ? 'RE' : 'LE');
      const big = A > B ? 'RHCP' : 'LHCP';
      const sumT = `${A === 1 ? '' : A}(\\hat x - j\\hat y) ${sg > 0 ? '+' : '-'} ${B === 1 ? '' : B}(\\hat x + j\\hat y)`;
      const nT = (v) => (Math.abs(v) === 1 ? '' : Math.abs(v));
      const resT = re === 0 ? `${im < 0 ? '-' : ''}j${nT(im)}\\hat y` : im === 0 ? `${re < 0 ? '-' : ''}${nT(re)}\\hat x` : `${re < 0 ? '-' : ''}${nT(re)}\\hat x ${im < 0 ? '-' : '+'} j${nT(im)}\\hat y`;
      const why = rk === 'LIN'
        ? { RC: md`The two circles have equal weights, so one component cancels: the sum is $${resT}$, a single component.`, LC: md`The two circles have equal weights, so one component cancels: the sum is $${resT}$.`, RE: md`An ellipse needs two parts; the sum $${resT}$ has only one.`, LE: md`An ellipse needs two parts; the sum $${resT}$ has only one.` }
        : { LIN: md`The weights differ (${A} and ${B}), so nothing cancels: the sum $${resT}$ has two parts $90°$ apart.`, RC: md`A circle needs the $\hat x$ and $\hat y$ parts equal in size; the sum is $${resT}$.`, LC: md`A circle needs the $\hat x$ and $\hat y$ parts equal in size; the sum is $${resT}$.`, RE: md`The larger circle sets the hand, and here that is the ${big} one.`, LE: md`The larger circle sets the hand, and here that is the ${big} one.` };
      return MC('Two circles', md`Two waves travel toward $+\hat z$ together: $\tilde{\mathbf E} = [${sumT}]\,e^{-j\beta z}$ V/m. The total is…`, LAB[rk],
        Object.keys(why).filter((x) => x !== rk).map((x) => [LAB[x], why[x]]),
        md`Add the parts: $${sumT} = ${resT}$. ${rk === 'LIN' ? 'Only one component is left: linear.' : `Two parts of different sizes, $90°$ apart: elliptical. The ${big} wave has the larger weight, and its hand wins: check with $\\mathbf a\\times(-\\mathbf b)$ on $${resT}$.`}`);
    },
    // which way does a line point?
    () => {
      const g = geom(), A = pick([1, 2, 3, 4]), B = pick([1, 2, 3, 4]), opp = pick([true, false]);
      const s1 = sh(g.i1), s2 = sh(g.i2);
      const dir = (sa, sb) => `$${A === 1 ? '' : A}${s1} ${sb} ${B === 1 ? '' : B}${s2}$`;
      return MC('Which line?', md`$\mathbf E = ${A === 1 ? '' : A}\cos(${uT(g)})\,${s1} ${opp ? '-' : '+'} ${B === 1 ? '' : B}\cos(${uT(g)})\,${s2}$ V/m. The tip moves…`, `on a line along ${dir(0, opp ? '-' : '+')}`,
        [[`on a line along ${dir(0, opp ? '+' : '-')}`, md`Watch the sign: at the instant $E_{${XYZ[g.i1]}} = +${A}$, the other part is ${opp ? `$-${B}$` : `$+${B}$`}.`],
          [`around a circle of radius ${Math.hypot(A, B) % 1 === 0 ? Math.hypot(A, B) : `$\\sqrt{${A * A + B * B}}$`} V/m`, md`The parts are in phase (one cosine), so the tip never leaves a line.`],
          [`on a line along $${s1}$ only`, md`Both parts are nonzero at the same instants, so the tip leaves the $${XYZ[g.i1]}$ axis.`],
          [`around an ellipse with half-axes ${A} and ${B} V/m`, md`An ellipse needs the parts out of step. One shared cosine keeps them in step.`]],
        md`Factor the common cosine: $\mathbf E = (${A === 1 ? '' : A}${s1} ${opp ? '-' : '+'} ${B === 1 ? '' : B}${s2})\cos(${uT(g)})$. A fixed vector times a swinging number: a line.`);
    },
    // which of four is circular?
    () => {
      const g = geom(), A = pick([2, 3, 4, 5]);
      const mk = (B, d) => `$${tmT([cmp(g.i1, A, 0), cmp(g.i2, B, d)], g, ['cos', 'cos'])}$`;
      const dR = pick([90, -90]);
      return MC('Find the circle', md`All four travel toward $${kT(g.k)}$. Which one is circularly polarized?`, mk(A, dR),
        [[mk(A, 0), md`In phase: a line along $\hat ${XYZ[g.i1]} + \hat ${XYZ[g.i2]}$.`], [mk(A + 1, dR), md`$90°$ apart, but amplitudes ${A} and ${A + 1}: an ellipse.`],
          [mk(A, 45), md`Equal amplitudes, but $45°$ apart: an ellipse.`], [mk(A, 180), md`$180°$ apart: a line along $\hat ${XYZ[g.i1]} - \hat ${XYZ[g.i2]}$.`]],
        md`A circle needs equal amplitudes **and** $\pm90°$. Only one option has both.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: the small moves
  GENS.rf_w3_moves = () => one([
    // the phasor of one term
    () => {
      const A = pick([2, 3, 4, 5]), th = pick([0, 30, -30, 45, 60, -60]), form = pick(['sin', 'mcos', 'msin']);
      const e = (d) => `$${A}${angT(wrap(d))}$`;
      const fnT = { sin: '', mcos: '-', msin: '-' }[form] + A + (form === 'mcos' ? '\\cos' : '\\sin');
      const W = {
        sin: [th - 90, [[th + 90, md`That treats the sine as leading. $\sin x = \cos(x - 90°)$: a sine lags a cosine.`], [th, md`That ignores the sine: only a plain cosine has phasor $Ae^{j\theta}$.`], [th + 180, md`That is $-90°$ the wrong way and a sign error: there is no minus here.`]]],
        mcos: [th + 180, [[th, md`That ignores the minus sign, which is a shift of $180°$.`], [th + 90, md`A minus sign is $180°$, not $90°$. Only a sine brings $90°$.`], [th - 90, md`A minus sign is $180°$, not $-90°$.`]]],
        msin: [th + 90, [[th - 90, md`That is the phasor of $+\sin$. The minus sign adds another $180°$: $-\sin x = \cos(x + 90°)$.`], [th + 180, md`That counts the minus sign but forgets that the sine lags by $90°$.`], [th, md`That ignores both the minus sign and the sine.`]]],
      }[form];
      const ang = wrap(W[0]);
      return MC('One phasor', md`The phasor of $${fnT}(\omega t - \beta z${degT(th)})$ (cosine reference) is…`, e(ang),
        W[1].map(([d, w]) => [e(d), w]),
        md`${form === 'sin' ? md`$\sin x = \cos(x - 90°)$, so subtract $90°$` : form === 'mcos' ? md`$-\cos x = \cos(x + 180°)$, so add $180°$` : md`$-\sin x = \cos(x + 90°)$, so add $90°$`}: the angle is $${ang}°$, and the phasor is $${A}${angT(ang)}$.`);
    },
    // the travel direction
    () => {
      const c = pick([0, 1, 2]), s = pick([1, -1]), fm = pick(['ph', 't']);
      const ex = fm === 'ph' ? `e^{${s > 0 ? '-' : '+'}j${pick(['\\beta ', '2', '4\\pi '])}${XYZ[c]}}` : `\\cos(\\omega t ${s > 0 ? '-' : '+'} \\beta ${XYZ[c]})`;
      const o = (i, sg) => `$${sg > 0 ? '+' : '-'}\\hat ${XYZ[i]}$`;
      const [i2, i3] = [0, 1, 2].filter((i) => i !== c);
      const off = md`A wave travels along the coordinate that appears in its phase, $${XYZ[c]}$.`;
      return MC('Which way?', md`A field varies as $${ex}$. It travels toward…`, o(c, s),
        [[o(c, -s), fm === 'ph' ? md`The sign in the exponent is opposite to the direction: $e^{-j\beta x}$ goes toward $+\hat x$.` : md`$\omega t - \beta x$ = constant means $x$ grows with $t$: a minus means $+\hat x$.`],
          [o(i2, s), off], [o(i2, -s), off], [o(i3, s), off]],
        md`Constant phase: ${s > 0 ? md`$\omega t - \beta ${XYZ[c]}$ fixed means $${XYZ[c]}$ grows with $t$` : md`$\omega t + \beta ${XYZ[c]}$ fixed means $${XYZ[c]}$ shrinks as $t$ grows`}: toward ${o(c, s)}.`);
    },
    // a cross product in cyclic order
    () => {
      const [i, j] = shuffle([0, 1, 2]).slice(0, 2), si = pick([1, -1]), sj = pick([1, -1]);
      const X = cross(uv(i, si), uv(j, sj));
      return MC('Cyclic order', md`$${sh(i, si)}\times${sh(j, sj)} = $`, `$${shV(X)}$`,
        [[`$${shV(X.map((x) => -x))}$`, md`Check the order: $\hat x\times\hat y = \hat z$, $\hat y\times\hat z = \hat x$, $\hat z\times\hat x = \hat y$; backward gives a minus. Then apply the signs.`],
          [`$${sh(i, si)}$`, md`A cross product is perpendicular to both factors.`], [`$${sh(j, -sj)}$`, md`A cross product is perpendicular to both factors.`], ['$0$', md`Only parallel vectors give zero.`]],
        md`${i === j ? '' : md`$\hat ${XYZ[i]}\times\hat ${XYZ[j]} = ${shV(cross(uv(i), uv(j)))}$`}${si * sj < 0 ? ', and one minus sign flips it' : ''}: $${shV(X)}$.`);
    },
    // where is the tip a quarter period later?
    () => {
      const g = geom(), A0 = pick([1, 2, 3, 5]), cs = [cmp(g.i1, A0, pick([0, 180])), cmp(g.i2, A0, pick([90, -90]))], [a, b] = phasorOf(cs);
      const A = A0, P = a.map((x) => x / A), Qv = b.map((x) => -x / A);
      const sv = (v) => { const [i, s] = axisOf(v); return `${s < 0 ? '-' : ''}${A === 1 ? '' : A}\\hat ${XYZ[i]}`; };
      const r = (v) => `$${sv(v)}$`;
      return MC('A quarter period later', md`At the plane $${XYZ[g.c]} = 0$, $${phT(cs, g)}$ V/m. At $\omega t = 0$ the tip is at ${r(P)}. At $\omega t = 90°$ it is at…`, r(Qv),
        [[r(Qv.map((x) => -x)), md`That is $+\mathbf b$. $\mathbf E(t) = \mathbf a\cos\omega t - \mathbf b\sin\omega t$, so at $90°$ the tip is at $-\mathbf b$.`],
          [r(P.map((x) => -x)), md`That is half a period later, $-\mathbf a$.`], [r(P), md`The tip moves; it is at $\mathbf a$ only at $\omega t = 0$ (and every full period).`]],
        md`$\mathbf a = ${sv(P)}$ and the tip at $90°$ is $-\mathbf b = ${sv(Qv)}$.`);
    },
    // H from E
    () => {
      const g = geom(), A = pick([1, 2, 3]), cs = [cmp(g.i1, A, 0), cmp(g.i2, A, pick([90, -90]))];
      const [a, b] = phasorOf(cs), ha = cross(g.k, a), hb = cross(g.k, b);
      const tm = (re, im, sb) => { const [i1, s1] = axisOf(re), [i2, s2] = axisOf(im); return `$\\tfrac{1}{\\eta_0}(${s1 < 0 ? '-' : ''}${A === 1 ? '' : A}\\hat ${XYZ[i1]} ${s2 * sb < 0 ? '-' : '+'} j${A === 1 ? '' : A}\\hat ${XYZ[i2]})$`; };
      return MC('H from E', md`$${phT(cs, g)}$ V/m in free space. At the plane $${XYZ[g.c]} = 0$, $\tilde{\mathbf H}$ is…`, tm(ha, hb, 1),
        [[tm(ha.map((x) => -x), hb.map((x) => -x), 1), md`That is $\tilde{\mathbf E}\times\hat k/\eta_0$, the wrong order: it points backward and would send the power toward $${kT(g.k.map((x) => -x))}$.`],
          [tm(ha, hb, -1), md`That flips only the imaginary part, which reverses the hand. $\mathbf H$ always has the same hand as $\mathbf E$.`],
          [`$\\tfrac{1}{\\eta_0}(${pTerm(cs[0], true)}${pTerm(cs[1])})$`, md`$\mathbf H$ is perpendicular to $\mathbf E$; you need $\hat k\times\tilde{\mathbf E}$, not $\tilde{\mathbf E}$ itself.`]],
        md`$\tilde{\mathbf H} = \frac{1}{\eta_0}\hat k\times\tilde{\mathbf E}$ with $\hat k = ${kT(g.k)}$. Cross each part: $${kT(g.k)}\times\hat ${XYZ[g.i1]} = ${shV(cross(g.k, uv(g.i1)))}$ and $${kT(g.k)}\times\hat ${XYZ[g.i2]} = ${shV(cross(g.k, uv(g.i2)))}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2
  const PIAMP = [6, 12, 24, 30, 60];
  const sAvg = (cs) => cs.reduce((s, c) => s + c.A * c.A, 0) / (2 * ETA0);
  // MC part labels are shown as text: TeX labels go inside $...$
  const mcPart = (lbl, opts, why) => ({ lbl: /\\/.test(lbl) && !lbl.includes('$') ? `$${lbl}$` : lbl, mc: opts, a: 0, why: [null, ...why] });

  GENS.w3_read = () => {
    const g = geom(), kind = pick(['circ', 'ell', 'ell']), cs = pair(g, kind);
    const m1 = pick(PIAMP), m2 = kind === 'circ' ? m1 : pick(PIAMP.filter((x) => x !== m1));
    cs[0].A = m1 * PI; cs[0].At = `${m1}\\pi `; cs[1].A = m2 * PI; cs[1].At = `${m2}\\pi `;
    const forms = [pick(['cos', 'cos', 'sin']), pick(FORMS)];
    const rk = classify(cs, g.k), rel = wrap(cs[1].th - cs[0].th), S = sAvg(cs);
    const others = [0, 1, 2].filter((i) => i !== g.c);
    return {
      title: 'Read a wave: travel, phase, shape, hand, power',
      q: md`In free space, $${tmT(cs, g, forms)}$ V/m. Write its phasor at $${XYZ[g.c]} = 0$ as $\tilde E_1\hat ${XYZ[cs[0].i]} + \tilde E_2\hat ${XYZ[cs[1].i]}$.`,
      parts: [
        mcPart('Direction of travel', [`$${kT(g.k)}$`, `$${kT(g.k.map((x) => -x))}$`, `$+\\hat ${XYZ[others[0]]}$`, `$-\\hat ${XYZ[others[1]]}$`],
          [md`The sign in front of $\beta$ is opposite to the direction: $\omega t - \beta x$ goes toward $+x$.`, md`A wave travels along the coordinate in its phase, $${XYZ[g.c]}$.`, md`A wave travels along the coordinate in its phase, $${XYZ[g.c]}$.`]),
        Object.assign(N(`\\text{angle of }\\tilde E_2/\\tilde E_1\\text{ in }(-180°, 180°]`, rel, '°', 0.01), { traps: [{ v: -rel, msg: 'That is the angle of E1/E2, or a sine read as leading. sin x = cos(x − 90°) lags.' }] }),
        mcPart('Polarization', [LAB[rk], ...Object.keys(LAB).filter((x) => x !== rk).map((x) => LAB[x])].slice(0, 4),
          Object.keys(LAB).filter((x) => x !== rk).slice(0, 3).map((x) => whyL(rk, x, cs, g.k))),
        Object.assign(N('\\langle S\\rangle', S, 'W/m²'), { traps: [{ v: S / 2, msg: 'That counts one component. Powers of perpendicular parts add.' }, { v: (cs[0].A + cs[1].A) ** 2 / (2 * ETA0), msg: 'That adds the amplitudes before squaring. Add the squares.' }] }),
      ],
      hints: [md`$\sin x = \cos(x - 90°)$, $-\cos x = \cos(x + 180°)$, $-\sin x = \cos(x + 90°)$.`, md`$\langle S\rangle = (|\tilde E_1|^2 + |\tilde E_2|^2)/(2\eta_0)$, with $\eta_0 = 120\pi\ \Omega$.`],
      sol: md`
        ${nameSol(cs, g, rk)}

        **Phasor.** $\tilde E_1 = ${cs[0].At}${angT(cs[0].th)}$ and $\tilde E_2 = ${cs[1].At}${angT(cs[1].th)}$. Dividing subtracts the angles: $${cs[1].th}° - (${cs[0].th}°)$, which is $${rel}°$ once brought into $(-180°, 180°]$.

        **Power.** The two parts are perpendicular, so their powers add:
        $$\langle S\rangle = \frac{(${m1}\pi)^2 + (${m2}\pi)^2}{240\pi} = ${f(S)}\ \text{W/m}^2$$
        directed along $${kT(g.k)}$.
      `,
    };
  };

  GENS.w3_make = () => {
    const g = geom(), A = pick([3, 4, 6, 12]), th = pick([0, 0, 30, -60]), want = pick(['RC', 'LC']);
    const c1 = cmp(g.i1, A, th);
    const cand = (d, B = A) => [c1, cmp(g.i2, B, th + d)];
    const dR = classify(cand(90), g.k) === want ? 90 : -90, right = cand(dR);
    const opt = (cs) => `$${tTerm(cs[1], true, g, bestForm(cs[1]))}$`;
    const pool = [cand(-dR), cand(0), cand(180), cand(dR, 2 * A)];
    const wr = pool.map((cs) => { const k = classify(cs, g.k); return [opt(cs), k === 'LIN' ? md`That puts the two parts ${wrap(cs[1].th - th) === 0 ? 'in step' : '$180°$ apart'}: linear.` : k[1] === 'E' ? md`The turn is right, but the amplitudes differ (${A} and ${2 * A} V/m): elliptical, not circular.` : md`That gives ${SHORT[k]}: the opposite turn.`]; });
    const S = (A * A + right[1].A ** 2) / (2 * ETA0);
    const c = MC('Make the polarization', md`A wave in free space has $E_${XYZ[g.i1]} = ${A}\cos(${uT(g)}${degT(th)})$ V/m. Which $E_${XYZ[g.i2]}$ makes it **${SHORT[want]}**?`, opt(right), wr,
      md`${nameSol(right, g, want)}`);
    c.parts.push(Object.assign(N('\\langle S\\rangle\\text{ of the result}', S, 'W/m²'), { traps: [{ v: A * A / (2 * ETA0), msg: 'That is the given component alone. Both parts carry power.' }] }));
    c.sol += NL2 + md`**Power.** Both parts have amplitude ${A} V/m: $\langle S\rangle = 2\cdot${A}^2/(240\pi) = ${f(S)}$ W/m².`;
    c.title = 'Make the polarization';
    return c;
  };

  GENS.w3_hfield = () => {
    const g = geom(), m = pick([12, 24, 60, 120]), kind = pick(['circ', 'ell']);
    const cs = pair(g, kind); cs[0].A = m * PI; cs[0].At = `${m}\\pi `;
    cs[1].A = kind === 'circ' ? m * PI : m * PI / 2; cs[1].At = kind === 'circ' ? `${m}\\pi ` : `${m / 2}\\pi `;
    cs[1].th = wrap(cs[0].th + pick([90, -90]));
    const rk = classify(cs, g.k);
    // H parts: k x e_i, amplitude A/eta0, same phase
    const hc = cs.map((c) => { const [i, s] = axisOf(cross(g.k, uv(c.i))); return cmp(i, c.A / ETA0, c.th + (s < 0 ? 180 : 0), p(+(c.A / ETA0).toPrecision(4))); });
    const wrongE = cs.map((c) => { const [i, s] = axisOf(cross(uv(c.i), g.k)); return cmp(i, c.A / ETA0, c.th + (s < 0 ? 180 : 0), p(+(c.A / ETA0).toPrecision(4))); });
    const flipH = [hc[0], flipC(hc[0], hc[1])];
    const opt = (h) => `$${phOnly(h, g)}$ A/m`;
    const S = sAvg(cs);
    return {
      title: 'H, its hand, and the power',
      q: md`In free space, $${phT(cs, g)}$ V/m.`,
      parts: [
        mcPart('\\tilde{\\mathbf H}', [opt(hc), opt(wrongE), opt(flipH), `$${phOnly(cs.map((c) => cmp(c.i, c.A / ETA0, c.th, p(+(c.A / ETA0).toPrecision(4)))), g)}$ A/m`],
          [md`That is $\tilde{\mathbf E}\times\hat k/\eta_0$: the order is backward, so $\mathbf E\times\mathbf H$ would point against the travel.`, md`That flips the sign of one part only, which reverses the hand. $\mathbf H$ has the same hand as $\mathbf E$.`, md`$\mathbf H$ must be perpendicular to $\mathbf E$; this one is parallel to it. Use $\hat k\times\tilde{\mathbf E}$.`]),
        mcPart('Polarization of \\mathbf H', [LAB[rk], LAB[rk[0] === 'R' ? 'L' + rk[1] : 'R' + rk[1]], LAB.LIN, LAB[rk[0] + (rk[1] === 'C' ? 'E' : 'C')]],
          [md`$\hat k\times$ turns the path rigidly; it cannot reverse the turn.`, md`$\mathbf H$ copies the shape of $\mathbf E$, which is not a line.`, md`$\mathbf H$ copies the shape of $\mathbf E$; dividing both parts by the same $\eta_0$ keeps their ratio.`]),
        Object.assign(N(`\\text{amplitude of }H_${XYZ[hc[0].i]}`, hc[0].A, 'A/m'), { traps: [{ v: cs[0].A, msg: 'Divide by η0 = 120π Ω.' }] }),
        Object.assign(N('\\langle S\\rangle', S, 'W/m²'), { traps: [{ v: S / 2, msg: 'Both parts carry power: add their squares.' }] }),
      ],
      hints: [md`$\tilde{\mathbf H} = \frac{1}{\eta_0}\hat k\times\tilde{\mathbf E}$ with $\hat k = ${kT(g.k)}$.`, md`$\langle S\rangle = (|\tilde E_1|^2 + |\tilde E_2|^2)/(2\eta_0)$.`],
      sol: md`
        **Step 1: travel.** $\hat k = ${kT(g.k)}$.

        **Step 2: cross each unit vector with $\hat k$.** $${kT(g.k)}\times\hat ${XYZ[cs[0].i]} = ${shV(cross(g.k, uv(cs[0].i)))}$ and $${kT(g.k)}\times\hat ${XYZ[cs[1].i]} = ${shV(cross(g.k, uv(cs[1].i)))}$. Divide by $120\pi$:
        $$${phT(hc, g, true)}$$
        in A/m.

        **Step 3: hand.** ${nameSol(hc, g, rk, 'H').split(NL2).slice(1).join(' ')} The same as $\mathbf E$, as it must be.

        **Step 4: power.**
        $$\langle S\rangle = \frac{(${cs[0].At})^2 + (${cs[1].At})^2}{240\pi} = ${f(S)}\ \text{W/m}^2$$
      `,
    };
  };

  // ---------------------------------------------------------------- level 3
  GENS.w3_exam = () => {
    const g0 = geom(), g = Object.assign(g0, { s: 1, k: uv(g0.c) });        // travels toward +c, mirror at c = 0 on the far side
    const m = pick([12, 24, 60]), cs = pair(g, 'circ');
    cs.forEach((c) => { c.A = m * PI; c.At = `${m}\\pi `; });
    const rk = classify(cs, g.k), ok = rk === 'RC' ? 'LC' : 'RC', ax = XYZ[g.c];
    const back = Object.assign({}, g, { s: -1, k: uv(g.c, -1) });
    const refl = cs.map((c) => cmp(c.i, c.A, c.th + 180, c.At));
    const keep = cs.map((c) => cmp(c.i, c.A, c.th, c.At));
    const hc = cs.map((c) => { const [i, s] = axisOf(cross(g.k, uv(c.i))); return cmp(i, c.A / ETA0, c.th + (s < 0 ? 180 : 0), p(+(c.A / ETA0).toPrecision(4))); });
    const S = sAvg(cs);
    return {
      title: 'A circular wave and a mirror',
      q: md`In free space ($${ax} < 0$), $\tilde{\mathbf E}_i = (${pTerm(cs[0], true)}${pTerm(cs[1])})\,e^{-j\beta ${ax}}$ V/m. A perfect conductor fills $${ax} > 0$, so the reflected wave has $\tilde{\mathbf E}_r = -(\ldots)\,e^{+j\beta ${ax}}$ with the same bracket.`,
      parts: [
        mcPart('(a) The incident wave is', [LAB[rk], LAB[ok], LAB.LIN, LAB[rk[0] + 'E']],
          [whyL(rk, ok, cs, g.k), whyL(rk, 'LIN', cs, g.k), whyL(rk, rk[0] + 'E', cs, g.k)]),
        mcPart('(b) The reflected phasor', [`$${phOnly(refl, back)}$`, `$${phOnly(keep, back)}$`, `$${phOnly(refl, g)}$`, `$${phOnly([refl[0], flipC(refl[0], refl[1])], back)}$`],
          [md`A perfect conductor has $\Gamma = -1$: the bracket changes sign.`, md`The reflected wave travels back, toward $-\hat ${ax}$: its exponent is $e^{+j\beta ${ax}}$.`, md`$\Gamma$ multiplies both parts by $-1$; flipping only one part is not a reflection.`]),
        mcPart('(c) The reflected wave is', [LAB[ok], LAB[rk], LAB.LIN, LAB[ok[0] + 'E']],
          [md`Same turn at a fixed point, but the travel is reversed: the hand flips.`, md`Both parts are multiplied by $-1$, so they stay $90°$ apart.`, md`Both parts keep equal amplitudes ($|\Gamma| = 1$): a circle.`]),
        mcPart('(d) The incident magnetic field', [`$${phOnly(hc, g)}$ A/m`, `$${phOnly(hc.map((c) => cmp(c.i, c.A, c.th + 180, c.At)), g)}$ A/m`, `$${phOnly([hc[0], flipC(hc[0], hc[1])], g)}$ A/m`, `$${phOnly(cs.map((c) => cmp(c.i, c.A / ETA0, c.th, p(+(c.A / ETA0).toPrecision(4)))), g)}$ A/m`],
          [md`That is $\tilde{\mathbf E}\times\hat k/\eta_0$: backward.`, md`Flipping one part reverses the hand; $\mathbf H$ has the same hand as $\mathbf E$.`, md`That is parallel to $\mathbf E$. Use $\hat k\times\tilde{\mathbf E}$.`]),
        Object.assign(N('(e)\\ \\langle S\\rangle\\text{ of the incident wave}', S, 'W/m²'), { traps: [{ v: S / 2, msg: 'Both parts carry power.' }] }),
        Object.assign(N(`(f)\\ \\text{amplitude of the total }E_${XYZ[cs[0].i]}\\text{ at }${ax} = -\\lambda/4`, 2 * m * PI, 'V/m'), { traps: [{ v: m * PI, msg: 'That is the incident wave alone. At a quarter wavelength from the mirror the two waves add.' }] }),
      ],
      hints: [md`Hand: the tip goes from $\mathbf a$ to $-\mathbf b$; compare $\mathbf a\times(-\mathbf b)$ with $+\hat ${ax}$.`, md`Total: $\tilde E\,(e^{-j\beta ${ax}} - e^{+j\beta ${ax}}) = -2j\tilde E\sin\beta ${ax}$, and $\beta ${ax} = -\pi/2$ at $${ax} = -\lambda/4$.`],
      sol: md`
        **(a)** ${nameSol(cs, g, rk).replace(/\n\n/g, ' ')}

        **(b)** $\Gamma = -1$ and the travel reverses:
        $$\tilde{\mathbf E}_r = ${phOnly(refl, back)}$$
        **(c)** At a fixed point, $-1$ times a phasor only shifts the clock by half a period, so the tip turns the same way. The thumb now points along $-\hat ${ax}$: **${SHORT[ok]}**.

        **(d)** $\tilde{\mathbf H} = \frac{1}{\eta_0}\hat ${ax}\times\tilde{\mathbf E}_i$. Divide $${m}\pi$ by $120\pi$ to get $${p(m / 120)}$ A/m and cross each unit vector with $\hat ${ax}$:
        $$\tilde{\mathbf H}_i = ${phOnly(hc, g)}$$
        **(e)** Two perpendicular parts of amplitude $${m}\pi$ V/m:
        $$\langle S\rangle = \frac{2(${m}\pi)^2}{240\pi} = ${f(S)}\ \text{W/m}^2$$
        **(f)** For one component, incident plus reflected is $\tilde E(e^{-j\beta ${ax}} - e^{j\beta ${ax}}) = -2j\tilde E\sin\beta ${ax}$. At $${ax} = -\lambda/4$, $\sin(-\pi/2) = -1$, so the amplitude is $2(${m}\pi) = ${f(2 * m * PI)}$ V/m: a peak of the standing wave ([Topic 12](#/l/w4-standing)).

        **Speed path.** "Minus $j$: toward", one cross product, then "mirror flips the hand". $\mathbf H$ copies the hand of $\mathbf E$.

        **Where points go.** Judging the reflected wave with the thumb along $+\hat ${ax}$. Forgetting the second component in the power.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank
  EM.BANK['w3-pol'] = [
    Q(md`The polarization of a wave describes…`,
      ['the path traced by the tip of $\\mathbf E$ at one fixed point over one period', 'the direction in which the wave travels', 'the direction of $\\mathbf H$ relative to $\\mathbf E$', 'how fast the amplitude decays'], 0,
      [null, md`Travel is $\hat k$. Polarization is about the motion of $\mathbf E$ across $\hat k$.`, md`$\mathbf H$ is always $\hat k\times\mathbf E/\eta$; that relation is the same for every polarization.`, md`Decay is $\alpha$, a property of the medium.`],
      md`Fix a point and watch the tip of $\mathbf E$ for one period: a line, a circle or an ellipse.`),
    Q(md`$\mathbf E = 3\cos(\omega t - \beta z)\,\hat x + 3\cos(\omega t - \beta z - 90°)\,\hat y$. Which statement is true?`,
      ['$|\\mathbf E| = 3$ V/m at every instant', '$|\\mathbf E|$ swings between 0 and $3\\sqrt2$ V/m', '$|\\mathbf E|$ swings between 0 and 3 V/m', '$\\mathbf E$ always points along $\\hat x + \\hat y$'], 0,
      [null, md`That would be the in-phase (linear) case. These are $90°$ apart.`, md`The tip never passes through the origin: when one part is zero the other is at its peak.`, md`That direction would need the parts in phase.`],
      md`$|\mathbf E|^2 = 9\cos^2u + 9\sin^2u = 9$.`),
    Q(md`For linear polarization the two perpendicular components must…`,
      ['be in phase or $180°$ apart; their amplitudes can be anything', 'have equal amplitudes', 'be $90°$ apart', 'have equal amplitudes and be in phase'], 0,
      [null, md`Unequal in-phase parts still give a line, just tilted: $\tan\theta = B/A$.`, md`$90°$ apart gives a circle or an ellipse.`, md`Equal amplitudes are not needed.`],
      md`In phase: $\mathbf E = (A\hat a + B\hat b)\cos u$, a fixed vector times a number.`),
    Q(md`$\mathbf E = 5\cos(\omega t - \beta z)\,\hat x + 5\cos(\omega t - \beta z + 90°)\,\hat y$. At $z = 0$, a quarter period after $\omega t = 0$, the tip is at…`,
      ['$-5\\hat y$', '$+5\\hat y$', '$-5\\hat x$', '$5\\hat x$'], 0,
      [null, md`$\cos(90° + 90°) = \cos180° = -1$: the $y$ part is negative.`, md`Half a period would give $-5\hat x$. A quarter period gives $E_x = 0$.`, md`That is the tip at $\omega t = 0$.`],
      md`At $\omega t = 90°$: $E_x = 5\cos90° = 0$ and $E_y = 5\cos180° = -5$. The tip went from $\hat x$ to $-\hat y$.`),
    Q(md`Lecture 24 calls a wave right-handed when…`,
      ['your right thumb points along the travel and your right fingers curl the way the tip of $\\mathbf E$ turns', 'the tip turns clockwise as seen on the page', 'your right thumb points along $\\mathbf E$ and the fingers along $\\mathbf H$', 'the tip turns counterclockwise when you look along the travel'], 0,
      [null, md`Clockwise depends on whether the wave comes toward you or goes away.`, md`That is a mix of the Poynting rule and the hand rule; neither defines handedness.`, md`Looking along the travel (wave going away from you), a right-handed tip turns **clockwise**.`],
      md`Thumb along $\hat k$, fingers along the turn. The lecture adds: seen looking along the travel, right-circular turns clockwise.`),
    Q(md`$\tilde{\mathbf E} = \mathbf a + j\mathbf b$. In the time domain, $\mathbf E(t)$ equals…`,
      ['$\\mathbf a\\cos\\omega t - \\mathbf b\\sin\\omega t$', '$\\mathbf a\\cos\\omega t + \\mathbf b\\sin\\omega t$', '$\\mathbf a\\sin\\omega t - \\mathbf b\\cos\\omega t$', '$(\\mathbf a + \\mathbf b)\\cos\\omega t$'], 0,
      [null, md`$\Re\{j\mathbf b(\cos + j\sin)\} = -\mathbf b\sin\omega t$: $j\cdot j = -1$.`, md`At $\omega t = 0$ the field is $\Re\{\tilde{\mathbf E}\} = \mathbf a$, not $-\mathbf b$.`, md`That treats $j$ as 1.`],
      md`$\Re\{(\mathbf a + j\mathbf b)(\cos\omega t + j\sin\omega t)\} = \mathbf a\cos\omega t - \mathbf b\sin\omega t$.`),
    Q(md`$\tilde{\mathbf E} = (2\hat x + j2\hat z)\,e^{-j\beta y}$. The wave is…`,
      ['right-handed circular', 'left-handed circular', 'linear', 'right-handed elliptical'], 0,
      [null, md`That crosses $\mathbf a$ with $+\mathbf b$: $\hat x\times\hat z = -\hat y$. The tip moves toward $-\mathbf b = -2\hat z$.`, md`Two perpendicular parts $90°$ apart: not a line.`, md`Equal amplitudes, $90°$: a circle.`],
      md`$\mathbf a = 2\hat x$, $-\mathbf b = -2\hat z$; $\hat x\times(-\hat z) = -(\hat x\times\hat z) = +\hat y$, the travel: RHCP.`),
    Q(md`Which never changes the polarization of a wave?`,
      ['Multiplying the whole phasor by $e^{j60°}$', 'Multiplying only the $\\hat y$ part by $e^{j60°}$', 'Doubling only the $\\hat x$ part', 'Reversing the direction of travel'], 0,
      [null, md`That changes the relative phase, which is what decides the shape and the hand.`, md`That changes the relative amplitude: a circle becomes an ellipse.`, md`Same turn with opposite travel flips the hand.`],
      md`A common factor only shifts the clock. Shape and hand depend on the relative amplitude and relative phase.`),
    Q(md`$\hat z\times(-\hat x)$ equals…`,
      ['$-\\hat y$', '$+\\hat y$', '$+\\hat x$', '$-\\hat z$'], 0,
      [null, md`$\hat z\times\hat x = +\hat y$, and the minus sign flips it.`, md`A cross product is perpendicular to both factors.`, md`A cross product is perpendicular to both factors.`],
      md`Forward around the cycle: $\hat z\times\hat x = \hat y$. With the minus: $-\hat y$.`),
    Q(md`A wave varies as $\cos(\omega t + \beta x)$. It travels toward…`,
      ['$-\\hat x$', '$+\\hat x$', '$+\\hat z$', 'nowhere: it is a standing wave'], 0,
      [null, md`Fixed phase $\omega t + \beta x$ needs $x$ to fall as $t$ grows.`, md`The coordinate in the phase is $x$.`, md`A single cosine of $\omega t \pm \beta x$ travels; a standing wave is a product like $\cos\omega t\cos\beta x$.`],
      md`$\omega t + \beta x = $ const gives $dx/dt = -\omega/\beta$: toward $-\hat x$.`),
    Q(md`$\mathbf E = 4\cos(\omega t - \beta z)\,\hat x + 4\sin(\omega t - \beta z)\,\hat y$ and $\mathbf E' = 4\cos(\omega t + \beta z)\,\hat x + 4\sin(\omega t + \beta z)\,\hat y$. At $z = 0$ their tips turn the same way. Their hands are…`,
      ['RHCP and LHCP', 'both RHCP', 'both LHCP', 'LHCP and RHCP'], 0,
      [null, md`The second travels toward $-\hat z$: same turn, opposite thumb.`, md`The first: $\hat x\times\hat y = \hat z$ = travel, right-handed.`, md`The first: $\hat x\times\hat y = +\hat z$ along its travel $+\hat z$: right, not left.`],
      md`Same rotation $\hat x\to\hat y$; travel $+\hat z$ (right) and $-\hat z$ (left).`),
    Q(md`$\tilde{\mathbf E} = 3\hat x - j4\hat y$ (travel $+\hat z$). The tip traces…`,
      ['a right-handed ellipse with half-axes 3 along $\\hat x$ and 4 along $\\hat y$', 'a right-handed circle of radius 5', 'a left-handed ellipse', 'a line along $3\\hat x - 4\\hat y$'], 0,
      [null, md`5 would need both parts at their peaks together; they are $90°$ apart, so $|\mathbf E|$ swings between 3 and 4.`, md`$\hat x - j\hat y$ turns $\hat x\to\hat y$; $\hat x\times\hat y = +\hat z$ = travel: right.`, md`The $-j$ puts them $90°$ apart, so not a line.`],
      md`$\mathbf E = 3\cos\omega t\,\hat x + 4\sin\omega t\,\hat y$: half-axes 3 and 4, turning $\hat x\to\hat y$, right-handed.`),
    Q(md`The review-session rule "ahead $\times$ behind $= \hat k$ means RHCP" works because…`,
      ['ahead $\\times$ behind points the same way as $\\mathbf a\\times(-\\mathbf b)$', 'the ahead component is always the larger one', 'behind $\\times$ ahead is the Poynting vector', 'it only works for waves along $\\hat z$'], 0,
      [null, md`Ahead is about phase, not size.`, md`The Poynting vector is $\mathbf E\times\mathbf H$, a different product.`, md`The derivation used general unit vectors $\hat a$, $\hat b$.`],
      md`With $\mathbf E = A\cos u\,\hat a + B\cos(u - \phi)\,\hat b$, $\mathbf a\times(-\mathbf b) = AB\sin\phi\,(\hat a\times\hat b)$, and $\sin\phi > 0$.`),
    Q(md`$\mathbf E = 2\cos(\omega t - \beta x)\,\hat y + 2\sin(\omega t - \beta x)\,\hat z$. Ahead and behind are…`,
      ['ahead $\\hat y$, behind $\\hat z$: RHCP', 'ahead $\\hat z$, behind $\\hat y$: LHCP', 'ahead $\\hat z$, behind $\\hat y$: RHCP', 'neither: a sine and a cosine are in phase'], 0,
      [null, md`$\sin u = \cos(u - 90°)$: the sine is behind.`, md`Ahead must be the cosine; and $\hat z\times\hat y = -\hat x$ would be left, not right.`, md`They are $90°$ apart.`],
      md`$\hat y\times\hat z = +\hat x$ = travel: RHCP.`),
    Q(md`Two waves travel toward $+\hat z$: $2(\hat x - j\hat y)e^{-j\beta z}$ and $2(\hat x + j\hat y)e^{-j\beta z}$. Their sum is…`,
      ['linear along $\\hat x$', 'RHCP', 'LHCP', 'zero'], 0,
      [null, md`The LHCP part is just as large; they cancel each other's $\hat y$ parts.`, md`The RHCP part is just as large.`, md`The $\hat x$ parts add: $4\hat x$.`],
      md`$2\hat x - j2\hat y + 2\hat x + j2\hat y = 4\hat x$: linear.`),
    Q(md`A linearly polarized wave $\hat y\,e^{-j\beta z}$ written as RHCP plus LHCP is…`,
      ['$\\tfrac{j}{2}(\\hat x - j\\hat y) - \\tfrac{j}{2}(\\hat x + j\\hat y)$', '$\\tfrac12(\\hat x - j\\hat y) + \\tfrac12(\\hat x + j\\hat y)$', '$(\\hat x - j\\hat y) - (\\hat x + j\\hat y)$', 'impossible: a line is not made of circles'], 0,
      [null, md`That sum is $\hat x$, not $\hat y$.`, md`That is $-2j\hat y$, twice too big and with a phase.`, md`Lecture 24 does exactly this: circles are a complete basis.`],
      md`$\tfrac{j}{2}\hat x + \tfrac12\hat y - \tfrac{j}{2}\hat x + \tfrac12\hat y = \hat y$ ✓.`),
    Q(md`An RHCP wave in a good conductor travels toward $+\hat z$. Its $\mathbf H$ lags $\mathbf E$ by $45°$. $\mathbf H$ is…`,
      ['RHCP: the $45°$ lag is a common delay for both parts', 'LHCP: the lag reverses the turn', 'elliptical: the lag distorts the circle', 'linear'], 0,
      [null, md`A delay common to both parts cannot reverse anything.`, md`$1/\eta$ multiplies both parts by the same complex number.`, md`$\mathbf H$ is still $\hat k\times\mathbf E$ divided by one number.`],
      md`$\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta$: one complex factor, the same path delayed by $\tau = 45°$.`),
    Q(md`An RHCP wave hits a perfect conductor head-on. At a fixed point in front of the mirror, the reflected wave's tip turns…`,
      ['the same way as the incident tip, and the reflected wave is LHCP', 'the opposite way, and the reflected wave is RHCP', 'the opposite way, and the reflected wave is LHCP', 'not at all: $\\Gamma = -1$ makes it linear'], 0,
      [null, md`$\Gamma = -1$ multiplies both parts by $-1$: same turn. The hand flips because the travel flips.`, md`The turn does not change, and two flips would cancel, giving RHCP.`, md`$-1$ is common to both parts; the shape is unchanged.`],
      md`$\tilde{\mathbf E}_r = -(\mathbf a + j\mathbf b)e^{+j\beta z}$: same $\mathbf a\times(-\mathbf b)$, opposite $\hat k$.`),
    Q(md`$\mathbf E = 6\cos(\omega t - \beta z)\,\hat x + 6\cos(\omega t - \beta z)\,\hat y$ and $\mathbf E = 6\cos(\omega t - \beta z)\,\hat x + 6\sin(\omega t - \beta z)\,\hat y$ carry average power densities in the ratio…`,
      ['1 : 1', '1 : 2', '2 : 1', '$\\sqrt2$ : 1'], 0,
      [null, md`Both have two parts of amplitude 6 V/m. The powers add in both cases.`, md`The phase between the parts does not change how much power each part carries.`, md`Power goes as the sum of the squares, $36 + 36$ in both.`],
      md`$\langle S\rangle = (6^2 + 6^2)/2\eta$ for both. (A circular wave carries twice the power of a linear wave with the same **peak** $|\mathbf E|$; the linear one here has peak $6\sqrt2$.)`),
    Q(md`$\tilde{\mathbf E} = (\hat x + e^{j30°}\hat y)e^{-j\beta z}$. The wave is…`,
      ['left-handed elliptical', 'right-handed elliptical', 'left-handed circular', 'linear'], 0,
      [null, md`The $\hat y$ part has the larger phase, so it is ahead: $\hat y\times\hat x = -\hat z$, against the travel.`, md`Equal amplitudes, but $30°$ apart, not $90°$.`, md`$30°$ is not $0°$ or $180°$.`],
      md`Ahead $\hat y$ by $30°$; $\hat y\times\hat x = -\hat z$; travel $+\hat z$: left-handed. $30°$: elliptical.`),
    Q(md`HW 9-type: a right-hand circularly polarized wave travels toward $+\hat z$ with $|\mathbf E| = E_0$. Which phasor fits?`,
      ['$E_0(\\hat x - j\\hat y)\\,e^{-j\\beta z}$','$E_0(\\hat x + j\\hat y)\\,e^{-j\\beta z}$', '$E_0(\\hat x - j\\hat y)\\,e^{+j\\beta z}$', '$E_0(\\hat x + \\hat y)\\,e^{-j\\beta z}$'], 0,
      [null, md`$\hat x + j\hat y$ turns $\hat x\to-\hat y$: left-handed toward $+\hat z$.`, md`$e^{+j\beta z}$ travels toward $-\hat z$, which flips the hand.`, md`No $j$: linear, with peak $\sqrt2E_0$.`],
      md`$\hat x - j\hat y$: tip $\hat x\to\hat y$, $\hat x\times\hat y = \hat z$. Each part has amplitude $E_0$, so $|\mathbf E| = E_0$ always.`),
  ];

  // ======================================================================================== lesson 2: current sheets
  // side view: z to the right, x up, y out of the page; one sheet at z = 0 carrying current along +x
  function sheetFig() {
    const g = PF.fig({ alt: 'side view of a current sheet in the plane z = 0, drawn as a dashed vertical line; its current points up, along +x; on both sides E points down, against the current; H is out of the page on the left and into the page on the right; the waves travel away from the sheet on both sides' });
    g.arrow(-175, 0, 180, 0, { cls: 'dim', hs: 7 }); g.label(184, 0, 'z', 'l', 'small accent');
    g.line(0, -88, 0, 88, { cls: 'thick dash' });
    g.arrow(-12, 46, -12, -24, { hs: 8 }); g.label(-18, 12, '\\tilde{\\mathbf J}_s', 'r', 'small');
    g.label(0, 94, 'z = 0', 't', 'small');
    for (const s of [1, -1]) {
      g.arrow(s * 70, -34, s * 70, 30, { cls: 'thick', hs: 8 }); g.label(s * 70 + (s > 0 ? 8 : -8), -14, '\\mathbf E', s > 0 ? 'l' : 'r', 'small');
      if (s > 0) g.otimes(128, -44, 7); else g.odot(-128, -44, 7);
      g.label(s * 128 + (s > 0 ? 11 : -11), -44, '\\mathbf H', s > 0 ? 'l' : 'r', 'small');
      g.arrow(s * 100, 56, s * 160, 56, { hs: 8 }); g.label(s * 130, 64, '\\text{travel}', 't', 'small');
    }
    g.arrow(-150, -70, -150, -100, { hs: 6 }); g.label(-144, -98, 'x', 'l', 'small accent');
    g.odot(-150, -58, 5); g.label(-141, -56, 'y', 'l', 'small accent');
    return g.svg();
  }
  // two sheets and the three regions
  function twoFig() {
    const g = PF.fig({ alt: 'two current sheets, at z = 0 and z = d, drawn as dashed vertical lines; region I is z < 0, region II is between the sheets, region III is z > d; in region I two waves travel left, in region III two waves travel right, and in region II one wave from each sheet travels toward the other sheet' });
    const d = 120;
    g.arrow(-140, 0, d + 150, 0, { cls: 'dim', hs: 7 }); g.label(d + 154, 0, 'z', 'l', 'small accent');
    g.line(0, -70, 0, 70, { cls: 'thick dash' }); g.line(d, -70, d, 70, { cls: 'thick dash' });
    g.label(0, 76, '0', 't', 'small'); g.label(d, 76, 'd', 't', 'small');
    g.label(0, -76, '\\tilde{\\mathbf J}_1', 'b', 'small'); g.label(d, -76, '\\tilde{\\mathbf J}_2', 'b', 'small');
    g.label(-80, -40, '\\text{I}', 'c'); g.label(d / 2, -40, '\\text{II}', 'c'); g.label(d + 80, -40, '\\text{III}', 'c');
    g.arrow(-20, 24, -110, 24, { hs: 7 }); g.arrow(-20, 42, -110, 42, { cls: 'dash', hs: 7 });
    g.arrow(d + 20, 24, d + 110, 24, { hs: 7 }); g.arrow(d + 20, 42, d + 110, 42, { cls: 'dash', hs: 7 });
    g.arrow(12, 24, d - 12, 24, { hs: 7 }); g.arrow(d - 12, 42, 12, 42, { cls: 'dash', hs: 7 });
    return g.svg();
  }
  const sp24Plot = () => PF.plot({
    w: 380, h: 170, x: [-0.35, 0.85], y: [0, 1.2], xl: 'z\\,(\\text{m})', yl: '|\\tilde E_x|/240\\pi',
    xt: [[0, '0'], [0.25, '0.25'], [0.5, '0.5']], yt: [[1, '1']],
    curves: [{ f: (z) => (z > 0 && z < 0.5 ? Math.abs(Math.sin(2 * PI * z)) : 0), n: 480 }],
  });
  const onewayPlot = () => PF.plot({
    w: 380, h: 170, x: [-0.35, 0.7], y: [0, 1.25], xl: 'z/\\lambda', yl: '|\\tilde E|/\\eta|J|',
    xt: [[0, '0'], [0.25, '\\tfrac14']], yt: [[1, '1']],
    curves: [{ f: (z) => (z <= 0 ? 0 : z < 0.25 ? Math.abs(Math.sin(2 * PI * z)) : 1), n: 480 }],
  });

  EM.lesson('w3', {
    id: 'w3-antenna', topic: 10, ref: 'Lectures 19 and 24', title: 'Designing current-sheet antennas, and two sheets',
    steps: [
      RF(md`
        !!key Why you care
          Prof. Chen's SP24 Exam 3 opened with two current sheets: 18 of the 100 points for the fields in three regions. HW 9 #2 and #5 and HW 10 #4 are sheet problems, and HW 10 #4 is exactly "design two sheets for RHCP". The formula sheet gives you one line, $\mathbf E = -\frac{\eta}{2}\mathbf J_s(t \mp z/v)$. In this lesson you derive it in phasor form from the boundary conditions, then use nothing but superposition and [Topic 9](#/l/w3-pol)'s hand test to handle any number of sheets: standing waves between them, cancellation or doubling outside, a pair that radiates only one way, and a pair that sends the same hand both ways.

        ### Notation

        - $\tilde{\mathbf J}_s$: the **phasor of the surface current density**, in A/m. It flows in the plane of the sheet. Each component has its own size and phase: $\tilde{\mathbf J}_s = 2\hat x - j2\hat y$ means $\mathbf J_s(t) = 2\cos\omega t\,\hat x + 2\sin\omega t\,\hat y$.
        - $\eta$, $\beta$: the medium's impedance and phase constant. Free space: $\eta_0 = 120\pi\ \Omega$, $\beta = \omega/c = 2\pi/\lambda$.
        - $\hat n$: the unit normal of a boundary, pointing from side 2 into side 1.
        - $d$: the spacing of two sheets. $\psi$: the phase of sheet 2's current relative to sheet 1's, so $\tilde{\mathbf J}_2 = \tilde{\mathbf J}_1e^{j\psi}$ for parallel currents.
        - Regions I ($z < 0$), II ($0 < z < d$) and III ($z > d$).
        - $\langle S\rangle$: time-averaged power density, W/m² ([Topic 4](#/l/w1-avg)).

        ### 1. What the sheet has to do

        A sheet at $z = 0$ carries $\tilde{\mathbf J}_s = \tilde J_s\,\hat x$. Away from the sheet there are no sources, so the field on each side is a plane wave. Which way does each wave travel? **Away from the sheet.** Nothing comes in from infinity; the sheet is the only source (Lecture 19 calls this causality, like ripples leaving a pebble). So we try
        $$z > 0:\ \ \tilde{\mathbf E} = E_1e^{-j\beta z}\,\hat x$$
        $$z < 0:\ \ \tilde{\mathbf E} = E_2e^{+j\beta z}\,\hat x$$
        Each wave's $\mathbf H$ is $\frac{1}{\eta}\hat k\times\tilde{\mathbf E}$ with its own $\hat k$. Above, $\hat k = +\hat z$ and $\hat z\times\hat x = \hat y$. Below, $\hat k = -\hat z$ and $-\hat z\times\hat x = -\hat y$:
        $$z > 0:\ \ \tilde{\mathbf H} = \frac{E_1}{\eta}e^{-j\beta z}\,\hat y$$
        $$z < 0:\ \ \tilde{\mathbf H} = -\frac{E_2}{\eta}e^{+j\beta z}\,\hat y$$
        Two unknowns, $E_1$ and $E_2$. The two boundary conditions at $z = 0$ fix them.

        **Condition 1: tangential $\mathbf E$ is continuous.** At $z = 0$ both exponentials are 1, so
        $$E_1 = E_2 \equiv E_0$$
        **Condition 2: tangential $\mathbf H$ jumps by the surface current.** With $\hat n = \hat z$ pointing from below into above:
        $$\hat z\times(\tilde{\mathbf H}_{\text{above}} - \tilde{\mathbf H}_{\text{below}}) = \tilde{\mathbf J}_s$$
        At $z = 0$ the bracket is $\frac{E_0}{\eta}\hat y - \left(-\frac{E_0}{\eta}\hat y\right) = \frac{2E_0}{\eta}\hat y$. And $\hat z\times\hat y = -\hat x$, so
        $$-\frac{2E_0}{\eta}\,\hat x = \tilde J_s\,\hat x$$
        Solve for $E_0$:
        $$E_0 = -\frac{\eta}{2}\tilde J_s$$
        Put it back:
        $$\boxed{\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s\,e^{\mp j\beta z},\quad z \gtrless 0}$$
        $$\boxed{\tilde{\mathbf H} = \mp\frac{\tilde J_s}{2}\,e^{\mp j\beta z}\,\hat y,\quad z \gtrless 0}$$

        [[fig:sheet]]

        !!intuition Does this make sense?
          **The minus sign.** At the sheet, $\mathbf E$ points against $\mathbf J_s$. The sheet pushes current against the field, like a battery pushing current from $-$ to $+$: it is a **source**, and $-\mathbf J_s\cdot\mathbf E > 0$ is the power it delivers.
          **The $\tfrac12$.** Right at the sheet, $|\mathbf H| = |J_s|/2$ on each side, pointing opposite ways: the static current-sheet result from Exam 1, now carried off by waves.
          **Time domain.** $e^{\mp j\beta z}$ is a delay of $|z|/v$, so $\mathbf E = -\frac{\eta}{2}\mathbf J_s(t \mp z/v)$: the line on your formula sheet.
      `, { sheet: { svg: sheetFig(), cap: 'One sheet, current up (along +x, with y out of the page). E points against the current on both sides; H points opposite ways on the two sides; both waves travel away.' } }),
      Q(md`**Predict.** A sheet at $z = 0$ in free space carries $\tilde{\mathbf J}_s = 4\,\hat x$ A/m. For $z > 0$, $\tilde{\mathbf E}$ is…`,
        [md`$-240\pi\,e^{-j\beta z}\,\hat x$ V/m`, md`$+240\pi\,e^{-j\beta z}\,\hat x$ V/m`, md`$-480\pi\,e^{-j\beta z}\,\hat x$ V/m`, md`$-240\pi\,e^{+j\beta z}\,\hat x$ V/m`], 0,
        [null, md`At the sheet $\mathbf E$ points against the current: the factor is $-\eta/2$.`, md`That uses $\eta$ instead of $\eta/2$. The jump in $\mathbf H$ is shared by the two sides.`, md`$e^{+j\beta z}$ travels toward $-\hat z$, back toward the sheet. Above the sheet the wave leaves upward.`],
        md`$-\frac{\eta_0}{2}\tilde J_s = -60\pi\cdot4 = -240\pi$ V/m, traveling toward $+\hat z$: $-240\pi e^{-j\beta z}\,\hat x$.`),
      R(md`
        ### 2. Any direction of current, any plane

        Nothing in Section 1 depended on the current being along $\hat x$ in particular. A current with two parts radiates the sum of what each part radiates (superposition), so in vector form
        $$\boxed{\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z|}}$$
        and each side's $\mathbf H$ is $\frac{1}{\eta}\hat k\times\tilde{\mathbf E}$ with $\hat k$ pointing **away from the sheet**. The distance from the sheet is what goes in the exponent. A sheet in the plane $x = x_0$ gives $e^{-j\beta|x - x_0|}$, with $\hat k = \pm\hat x$.

        **Example (the skill HW 9 #5 asks for, new numbers).** A sheet in the plane $y = 1$ m carries $\tilde{\mathbf J}_s = 3\,\hat z$ A/m in free space at $f = 300$ MHz, so $\lambda = 1$ m and $\beta = 2\pi$ rad/m.
        - The size: $\frac{\eta_0}{2}\cdot3 = 180\pi$ V/m, pointing against $\hat z$.
        - For $y > 1$: $\tilde{\mathbf E} = -180\pi\,e^{-j2\pi(y - 1)}\,\hat z$ V/m.
        - Its $\mathbf H$: $\hat k = +\hat y$ and $\hat y\times\hat z = \hat x$, so $\tilde{\mathbf H} = -1.5\,e^{-j2\pi(y - 1)}\,\hat x$ A/m.
        - For $y < 1$: $\tilde{\mathbf E} = -180\pi\,e^{+j2\pi(y - 1)}\,\hat z$, and with $\hat k = -\hat y$, $\tilde{\mathbf H} = +1.5\,e^{+j2\pi(y - 1)}\,\hat x$.

        **Check the jump.** $\hat y\times(\tilde{\mathbf H}_{\text{above}} - \tilde{\mathbf H}_{\text{below}}) = \hat y\times(-3\hat x) = -3(\hat y\times\hat x) = 3\hat z$ ✓, the current.

        !!intuition Does this make sense?
          The sheet's field at its own plane has phase factor 1, so it copies the current there exactly, times $-\eta/2$. Every other point sees that copy delayed by the travel time. In a lossy medium the same two boundary conditions give $\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s e^{-\gamma|z|}$ with complex $\eta$; SP24 #2 has such a sheet launching a wave into a good conductor.
      `),
      Q(md`**Predict.** A sheet in the plane $x = 0$ carries $\tilde{\mathbf J}_s = 2\,\hat y$ A/m in free space. For $x > 0$, $\tilde{\mathbf H}$ is…`,
        [md`$-\hat z\,e^{-j\beta x}$ A/m`, md`$+\hat z\,e^{-j\beta x}$ A/m`, md`$-2\hat z\,e^{-j\beta x}$ A/m`, md`$-\hat y\,e^{-j\beta x}$ A/m`], 0,
        [null, md`Then $\mathbf E\times\mathbf H$ would point toward $-\hat x$, into the sheet. $\tilde{\mathbf E} = -120\pi\hat y$ and $\hat x\times(-\hat y) = -\hat z$.`, md`Each side gets half of the jump: $|\mathbf H| = |J_s|/2 = 1$ A/m.`, md`$\mathbf H$ of a plane wave is perpendicular to $\mathbf E$, which is along $\hat y$.`],
        md`$\tilde{\mathbf E} = -60\pi\cdot2\,\hat y\,e^{-j\beta x}$. Then $\tilde{\mathbf H} = \frac{1}{120\pi}\hat x\times\tilde{\mathbf E} = -\hat z\,e^{-j\beta x}$ A/m. Check: $\hat x\times(\tilde{\mathbf H}_+ - \tilde{\mathbf H}_-) = \hat x\times(-2\hat z) = 2\hat y$ ✓.`),
      R(md`
        ### 3. The power a sheet delivers

        Each side carries a plane wave of amplitude $\frac{\eta}{2}|\tilde{\mathbf J}_s|$. Its average power density is
        $$\langle S\rangle = \frac{|\tilde{\mathbf E}|^2}{2\eta} = \frac{\eta^2|\tilde{\mathbf J}_s|^2/4}{2\eta}$$
        which simplifies to
        $$\boxed{\langle S\rangle_{\text{each side}} = \frac{\eta}{8}|\tilde{\mathbf J}_s|^2}$$
        Where does it come from? The Poynting theorem says a current delivers $-\mathbf J\cdot\mathbf E$ per unit volume; for a sheet, $-\mathbf J_s\cdot\mathbf E$ per unit area ([Topic 3](#/l/w1-poynting)). Its time average, with the product rule $\langle ab\rangle = \frac12\Re\{\tilde A\tilde B^*\}$:
        $$P_{\text{sheet}} = -\frac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}_s^*\}$$
        At the sheet $\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s$, and $\tilde{\mathbf J}_s\cdot\tilde{\mathbf J}_s^* = |\tilde{\mathbf J}_s|^2$, so
        $$P_{\text{sheet}} = \frac{\eta}{4}|\tilde{\mathbf J}_s|^2\ \ \text{W/m}^2$$
        That is exactly the two sides together, $2\times\frac{\eta}{8}|\tilde{\mathbf J}_s|^2$ ✓. Energy is conserved.

        !!intuition Does this make sense?
          Only $|\tilde{\mathbf J}_s|^2 = |\tilde J_x|^2 + |\tilde J_y|^2$ appears. Two perpendicular currents deliver the sum of their powers, whatever their phases. A circular current with parts of amplitude $J$ delivers twice what one part does, with the same peak current: the "circular carries twice the power" fact of [Topic 9](#/l/w3-pol), seen from the source.
      `),
      Q(md`**Predict.** A sheet in free space carries a current of amplitude 2 A/m along one direction. The average power per square meter that flows to **one** side is…`,
        [md`$60\pi\approx188$ W/m²`, md`$120\pi\approx377$ W/m²`, md`$240\pi\approx754$ W/m²`, md`$30\pi\approx94$ W/m²`], 0,
        [null, md`That is both sides together, $\frac{\eta}{4}|J|^2$.`, md`That uses $|\mathbf E| = \eta|J|$. Each side's field is $\frac{\eta}{2}|J|$.`, md`That is $\frac{\eta}{16}|J|^2$: one factor of $\tfrac12$ too many.`],
        md`$\frac{\eta_0}{8}|J|^2 = \frac{120\pi}{8}\cdot4 = 60\pi \approx 188$ W/m² each way; the sheet delivers $120\pi$ in all.`),
      R(md`
        ### 4. Designing one sheet for a polarization

        Look at the boxed field again: $\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s e^{-j\beta|z|}$. The factor $-\frac{\eta}{2}e^{-j\beta|z|}$ multiplies **both** components of the current. A common factor changes nothing about shape or turn ([Topic 9](#/l/w3-pol), Section 9). So:

        !!key The design rule
          **The radiated wave has the polarization of the current.** In-phase parts give a linear wave. Equal parts $90°$ apart give a circular wave. The hand is read with the thumb along each side's own travel.

        **Which hand on which side?** At a fixed point the tip of $\mathbf E$ turns the way the current turns, on both sides (the field is continuous at the sheet). But the travel is $+\hat z$ above and $-\hat z$ below. Same turn, opposite travel: **one sheet always sends opposite hands to its two sides.** Lecture 24's Example 2 is this: $\mathbf J_s = \cos\omega t\,\hat x + \sin\omega t\,\hat y$, or $\tilde{\mathbf J}_s = \hat x - j\hat y$, turns $\hat x\to\hat y$; the wave above is RHCP and the wave below is LHCP.

        **A recipe.** To send RHCP toward $\hat k$, pick $\hat a$, $\hat b$ in the sheet with $\hat a\times\hat b = \hat k$ and use
        $$\tilde{\mathbf J}_s = J(\hat a - j\hat b)$$
        The tip turns $\hat a\to\hat b$ ("minus $j$: toward"), and $\hat a\times\hat b = \hat k$. For LHCP, swap to $+j$.

        **Example.** A sheet in the plane $y = 0$ should send RHCP toward $-\hat y$, using $\hat x$ and $\hat z$ currents. We need $\hat a\times\hat b = -\hat y$. Forward around the cycle $\hat z\times\hat x = +\hat y$, so backward: $\hat x\times\hat z = -\hat y$. Take $\hat a = \hat x$, $\hat b = \hat z$:
        $$\tilde{\mathbf J}_s = J(\hat x - j\hat z)$$
        that is, $J_x = J\cos\omega t$ and $J_z = J\sin\omega t$. **Check** on the field below the sheet: $\tilde{\mathbf E}\propto-(\hat x - j\hat z) = -\hat x + j\hat z$, so $\mathbf a = -\hat x$, $\mathbf b = \hat z$, $-\mathbf b = -\hat z$, and $(-\hat x)\times(-\hat z) = \hat x\times\hat z = -\hat y$, the travel ✓. The side $y > 0$ gets LHCP.
      `),
      Q(md`**Predict.** A sheet in the plane $x = 0$ carries $\tilde{\mathbf J}_s = 2(\hat y + j\hat z)$ A/m. The wave in $x < 0$ is…`,
        ['RHCP', 'LHCP', 'linear', 'RHCP, and so is the wave in $x > 0$'], 0,
        [null, md`That is the wave in $x > 0$. Below the sheet the thumb points along $-\hat x$.`, md`The two parts are $90°$ apart with equal sizes: circular.`, md`One sheet always sends opposite hands to its two sides: same turn, opposite travel.`],
        md`The current turns $\hat y\to-\hat z$ ("plus $j$: away"), and $\hat y\times(-\hat z) = -\hat x$. For $x < 0$ the travel is $-\hat x$: they match, RHCP. For $x > 0$ the same turn is LHCP. The factor $-\eta/2$ changes nothing.`),
      RF(md`
        ### 5. Two parallel sheets: superposition, region by region

        Now two sheets: $\tilde{\mathbf J}_1$ at $z = 0$ and $\tilde{\mathbf J}_2$ at $z = d$, in one medium. Each radiates exactly as if it were alone, and the fields add. Write each sheet's field with **its own** distance:
        $$\tilde{\mathbf E} = -\frac{\eta}{2}\left[\tilde{\mathbf J}_1e^{-j\beta|z|} + \tilde{\mathbf J}_2e^{-j\beta|z - d|}\right]$$

        [[fig:two]]

        Now remove the absolute values in each region.

        **Region III, $z > d$.** Here $|z| = z$ and $|z - d| = z - d$. Pull out $e^{-j\beta z}$:
        $$\tilde{\mathbf E}_{\text{III}} = -\frac{\eta}{2}e^{-j\beta z}\left[\tilde{\mathbf J}_1 + \tilde{\mathbf J}_2e^{+j\beta d}\right]$$
        **Region I, $z < 0$.** Here $|z| = -z$ and $|z - d| = d - z$. Pull out $e^{+j\beta z}$:
        $$\tilde{\mathbf E}_{\text{I}} = -\frac{\eta}{2}e^{+j\beta z}\left[\tilde{\mathbf J}_1 + \tilde{\mathbf J}_2e^{-j\beta d}\right]$$
        **Region II, $0 < z < d$.** Here $|z| = z$ and $|z - d| = d - z$:
        $$\tilde{\mathbf E}_{\text{II}} = -\frac{\eta}{2}\left[\tilde{\mathbf J}_1e^{-j\beta z} + \tilde{\mathbf J}_2e^{-j\beta d}e^{+j\beta z}\right]$$
        Read the brackets. Above both sheets, sheet 2's wave has $\beta d$ **less** distance to travel than sheet 1's, so it arrives $\beta d$ ahead: $e^{+j\beta d}$. Below both sheets it has $\beta d$ more to travel: $e^{-j\beta d}$. Outside, each region holds one traveling wave whose size is set by its bracket. Between, the two waves go opposite ways: a standing pattern.

        **Parallel currents.** Let $\tilde{\mathbf J}_2 = \tilde{\mathbf J}_1e^{j\psi}$. The brackets become $\tilde{\mathbf J}_1(1 + e^{j\theta})$ with
        $$\theta_{\text{III}} = \psi + \beta d, \qquad \theta_{\text{I}} = \psi - \beta d$$
        To find the size, take out half the angle:
        $$1 + e^{j\theta} = e^{j\theta/2}\left(e^{-j\theta/2} + e^{j\theta/2}\right) = 2\cos\tfrac{\theta}{2}\,e^{j\theta/2}$$
        So
        $$\boxed{|1 + e^{j\theta}| = 2\left|\cos\tfrac{\theta}{2}\right|}$$
        $\theta = 0°$: the waves add, double the field (four times one sheet's power on that side). $\theta = 180°$: they cancel. $\theta = \pm90°$: $\sqrt2$ times one sheet's field.

        | spacing $d$ | $\psi$ | $\theta_{\text{III}}$ | above | $\theta_{\text{I}}$ | below |
        |---|---|---|---|---|---|
        | $\lambda/2$ | $0°$ | $180°$ | zero | $-180°$ | zero |
        | $\lambda/2$ | $180°$ | $360°$ | double | $0°$ | double |
        | $\lambda/4$ | $-90°$ | $0°$ | double | $-180°$ | zero |
        | $\lambda/4$ | $+90°$ | $180°$ | zero | $0°$ | double |
        | $\lambda$ | $0°$ | $360°$ | double | $-360°$ | double |

        The first row is SP24 #1. The third row is the one-way antenna of Section 7.
      `, { two: { svg: twoFig(), cap: 'Each sheet radiates both ways. Outside, two waves travel together and their phases decide if they add or cancel. Between, two waves travel toward each other.' } }),
      Q(md`**Predict.** Two sheets $\lambda/4$ apart carry parallel currents, sheet 2's current lagging sheet 1's by $90°$ ($\psi = -90°$). Which side gets a wave?`,
        ['only the side beyond sheet 2 (region III)', 'only the side beyond sheet 1 (region I)', 'both sides, each $\\sqrt2$ times one sheet', 'neither: they cancel everywhere outside'], 0,
        [null, md`Below, $\theta_{\text{I}} = -90° - 90° = -180°$: cancellation. Above, $\theta_{\text{III}} = -90° + 90° = 0°$: doubling.`, md`That would need $\theta = \pm90°$ on both sides. Here the two sides get $0°$ and $-180°$.`, md`Cancellation on both sides needs $\theta = 180°$ on both, as with $\lambda/2$ and $\psi = 0$.`],
        md`Sheet 2 starts a quarter period late but is a quarter wavelength closer to every point above: the two waves arrive in step above. Below, its wave is a quarter period late and has a quarter wavelength farther to go: half a period behind, and they cancel.`),
      RF(md`
        ### 6. SP24 #1, step by step

        !!graded Problem (SP24 #1, 18 points)
          Two infinite current sheets lie on $z = 0$ and $z = 0.5$ m, both with $\tilde{\mathbf J}_s = -2\hat x$ A/m, in free space, at $f = 300$ MHz. Find $\tilde{\mathbf E}$ and $\tilde{\mathbf H}$ in all three regions, simplified.

        **Step 1: the numbers.**
        $$\lambda = \frac{c}{f} = \frac{3\times10^8}{3\times10^8} = 1\ \text{m}, \qquad \beta = \frac{2\pi}{\lambda} = 2\pi\ \text{rad/m}$$
        So $d = 0.5$ m $= \lambda/2$ and $\beta d = \pi$.

        **Step 2: one sheet's field.** $-\frac{\eta_0}{2}(-2\hat x) = +120\pi\,\hat x$. So
        $$\tilde{\mathbf E}_1 = 120\pi\,e^{-j\beta|z|}\,\hat x, \qquad \tilde{\mathbf E}_2 = 120\pi\,e^{-j\beta|z - 0.5|}\,\hat x$$
        **Step 3: outside.** Above: the bracket is $1 + e^{j\beta d} = 1 + e^{j\pi} = 0$. Below: $1 + e^{-j\pi} = 0$. So
        $$\tilde{\mathbf E}(z < 0) = \tilde{\mathbf E}(z > 0.5) = 0$$
        **Step 4: between.** From Region II with $e^{-j\beta d} = e^{-j\pi} = -1$:
        $$\tilde{\mathbf E} = 120\pi\left[e^{-j\beta z} - e^{+j\beta z}\right]\hat x$$
        The bracket is $-2j\sin\beta z$ (from $\sin\theta = \frac{e^{j\theta} - e^{-j\theta}}{2j}$):
        $$\boxed{\tilde{\mathbf E} = -j240\pi\sin(2\pi z)\,\hat x\ \text{V/m}}$$
        **Step 5: H, one wave at a time.** Each wave needs its own $\hat k$, so do not use one $\hat k$ for the whole region. Sheet 1's wave in region II goes toward $+\hat z$: $\tilde{\mathbf H}_1 = \frac{1}{120\pi}\hat z\times120\pi e^{-j\beta z}\hat x = e^{-j\beta z}\,\hat y$. Sheet 2's wave there goes toward $-\hat z$:
        $$\tilde{\mathbf H}_2 = \frac{1}{120\pi}(-\hat z)\times\tilde{\mathbf E}_2 = -e^{-j\beta(0.5 - z)}\,\hat y$$
        and $-e^{-j\pi}e^{j\beta z} = +e^{j\beta z}$. Add:
        $$\boxed{\tilde{\mathbf H} = 2\cos(2\pi z)\,\hat y\ \text{A/m}}$$
        between the sheets, and $\tilde{\mathbf H} = 0$ outside (the same brackets vanish).

        [[fig:sp]]

        **The posted key** writes $-240j\sin(2\pi z)\,\hat x$ for the field between the sheets. The correct value is $-j240\pi\sin(2\pi z)\,\hat x$ V/m: the factor is $2\cdot\frac{\eta_0}{2}\cdot2 = 2\eta_0 = 240\pi$, and the $\pi$ was dropped. Its $\mathbf H$, $2\cos(2\pi z)\,\hat y$ A/m, is right.

        **Check 1: the jump at $z = 0$.** Below, $\mathbf H = 0$; just above, $2\hat y$. $\hat z\times(2\hat y - 0) = -2\hat x = \tilde{\mathbf J}_s$ ✓.
        **Check 2: no power anywhere.** In region II, $\frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$ has $-j240\pi\sin\cdot2\cos$, which is purely imaginary: zero average flow. And $\tilde{\mathbf E} = 0$ at both sheets ($\sin0 = \sin\pi = 0$), so $-\frac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}_s^*\} = 0$: the sheets deliver nothing ✓.

        **Speed path.** $\lambda = 1$ m, so the sheets are $\lambda/2$ apart with equal currents: outside cancels ($1 + e^{j\pi} = 0$). Between, $e^{-j\beta z} - e^{j\beta z} = -2j\sin\beta z$ for $\mathbf E$, and a plus sign, $2\cos\beta z$, for $\mathbf H$.

        **Where points go.** The $\pi$ in $240\pi$. The $j$ (or its sign). Writing nonzero fields outside. Using one $\hat k$ for $\mathbf H$ between the sheets. The 2 points for "simplified": leave $\sin$ and $\cos$, not exponentials.
      `, { sp: { svg: sp24Plot(), cap: 'SP24 #1: the size of E between the sheets is 240π |sin 2πz|. It is zero at both sheets and outside them; a standing wave sits between.' } }),
      Q(md`**Predict.** Change SP24 #1 so that the sheet at $z = 0.5$ m carries $+2\hat x$ A/m (opposite to the first). Outside the sheets, $|\tilde{\mathbf E}|$ is…`,
        [md`$240\pi$ V/m on both sides`, md`zero on both sides`, md`$120\pi$ V/m on both sides`, md`$240\pi$ V/m above and zero below`], 0,
        [null, md`$\psi = 180°$ and $\beta d = 180°$: $\theta = 360°$ above and $0°$ below. Both double.`, md`That is one sheet's field. The two waves add in step on both sides.`, md`Only a quarter-wave spacing with a $90°$ phase makes the two sides differ.`],
        md`Each sheet alone gives $120\pi$. With $\psi = 180°$, $\theta_{\text{III}} = 180° + 180° = 360°$ and $\theta_{\text{I}} = 180° - 180° = 0°$: both double, $|\tilde{\mathbf E}| = 240\pi$ V/m.`),
      RF(md`
        ### 7. The quarter-wave pair that radiates one way

        Take $\tilde{\mathbf J}_1 = J\hat x$ at $z = 0$ and $\tilde{\mathbf J}_2 = -jJ\hat x$ at $z = \lambda/4$: sheet 2 lags by $90°$, and $\beta d = 90°$, so $e^{\pm j\beta d} = \pm j$.

        **Above.** The bracket is $J + (-jJ)(j) = J + J = 2J$:
        $$\tilde{\mathbf E}_{\text{III}} = -\eta J\,e^{-j\beta z}\,\hat x$$
        **Below.** The bracket is $J + (-jJ)(-j) = J - J = 0$. Nothing.

        **Between.** Sheet 2's wave there is $-\frac{\eta}{2}(-jJ)e^{-j\pi/2}e^{j\beta z} = +\frac{\eta}{2}Je^{j\beta z}$, because $(-j)(-j) = -1$. Add sheet 1's wave:
        $$\tilde{\mathbf E}_{\text{II}} = \frac{\eta J}{2}\left(e^{j\beta z} - e^{-j\beta z}\right)\hat x = j\eta J\sin\beta z\,\hat x$$
        It grows from 0 at sheet 1 to $\eta|J|$ at sheet 2, and continues as a traveling wave of that size.

        [[fig:ow]]

        **Power.** Above: $\langle S\rangle = \frac{(\eta|J|)^2}{2\eta} = \frac{\eta}{2}|J|^2$. Below: 0. One sheet alone would send $\frac{\eta}{8}|J|^2$ each way, so the pair sends four times that upward, and the total equals what the two sheets would deliver separately, $2\times\frac{\eta}{4}|J|^2$.

        **Who delivers it?** Use $P = -\frac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*\}$ at each sheet.
        - At sheet 1, $\tilde{\mathbf E}_{\text{II}}(0) = j\eta J\sin0 = 0$. **Sheet 1 delivers nothing.**
        - At sheet 2, $\tilde{\mathbf E} = j\eta J$ and $\tilde{\mathbf J}_2^* = +jJ^*$, so $\tilde{\mathbf E}\cdot\tilde{\mathbf J}_2^* = -\eta|J|^2$ and $P_2 = +\frac{\eta}{2}|J|^2$: **all of it** ✓.

        !!intuition Does this make sense?
          Sheet 2's backward wave reaches sheet 1 exactly cancelling sheet 1's own field there. A current that feels no field does no work, however large it is. The whole job of sheet 1 is to make the wave going down cancel; the power comes out of sheet 2. A real two-element antenna array uses the same trick.
      `, { ow: { svg: onewayPlot(), cap: 'The quarter-wave pair (sheet 2 lagging by 90°): no field below sheet 1, a growing standing pattern between, a full traveling wave above.' } }),
      Q(md`**Predict.** In the one-way pair above, the current of sheet 2 is changed to $+jJ\hat x$ (leading by $90°$). Now…`,
        ['everything goes toward $-\\hat z$, and sheet 1 delivers all of it', 'everything still goes toward $+\\hat z$', 'half goes each way', 'nothing is radiated at all'], 0,
        [null, md`Above, the bracket is now $J + (jJ)(j) = 0$.`, md`Below, $J + (jJ)(-j) = 2J$; above, 0. One side only.`, md`Cancellation on both sides needs $\theta = 180°$ on both; here the two sides get $180°$ and $0°$.`],
        md`$\theta_{\text{III}} = 90° + 90° = 180°$: cancel. $\theta_{\text{I}} = 90° - 90° = 0°$: double. By the mirror image of the argument, now sheet 2 feels zero field and sheet 1 does all the work.`),
      R(md`
        ### 8. Perpendicular currents on two sheets: the hand on each side

        This is the skill HW 10 #4 asks for. Sheet 1 at $z = 0$ carries $J\hat a$; sheet 2 at $z = d$ carries $Je^{j\psi}\hat b$, with $\hat a\perp\hat b$ in the plane. Perpendicular currents can never cancel each other; they only set the **relative phase** of the two components. From the brackets of Section 5:
        $$\text{above: } \hat a + e^{j(\psi + \beta d)}\hat b$$
        $$\text{below: } \hat a + e^{j(\psi - \beta d)}\hat b$$
        (each times $-\frac{\eta}{2}Je^{\mp j\beta z}$, a common factor). Both sides have equal amplitudes, so the shape depends only on the phase in the exponent.

        **Take $d = \lambda/4$, $\hat a = \hat x$, $\hat b = \hat y$.** Then $\beta d = 90°$.
        - $\psi = 0$. Above: $\hat x + j\hat y$, tip $\hat x\to-\hat y$, $\hat x\times(-\hat y) = -\hat z$, against $+\hat z$: **LHCP**. Below: $\hat x - j\hat y$, tip $\hat x\to\hat y$, $\hat x\times\hat y = +\hat z$, against the travel $-\hat z$: **LHCP**.
        - $\psi = 180°$. Above: $\hat x + e^{j270°}\hat y = \hat x - j\hat y$: **RHCP**. Below: $\hat x + e^{j90°}\hat y = \hat x + j\hat y$, and $\hat x\times(-\hat y) = -\hat z$ is along the travel: **RHCP**.
        - $\psi = \pm90°$. The exponents become $0°$ and $180°$ on the two sides: **linear** both ways.

        **The same hand on both sides.** Going up, sheet 2's part gains $\beta d$; going down it loses $\beta d$. With $\beta d = 90°$ the relative phase on the two sides differs by $180°$, so the tip turns **opposite** ways at a fixed point on the two sides. The travel is also opposite. Two flips: the same hand. A single sheet could never do this.

        **Power.** The parts are perpendicular, so they never interfere: each side gets $\frac{\eta}{8}|J|^2$ from each sheet, $\frac{\eta}{4}|J|^2$ in all. Switch sheet 2 off and each side gets $\frac{\eta}{8}|J|^2$, a linear wave with the **same peak** $|\mathbf E| = \frac{\eta}{2}|J|$. Same peak, twice the power: HW 10 #4(d)'s conclusion.
      `),
      Q(md`**Predict.** Sheet 1 at $z = 0$ carries $J\hat x$; sheet 2 at $z = \lambda/4$ carries $Je^{j\psi}\hat y$. Which $\psi$ makes the wave **below** ($z < 0$) right-handed circular?`,
        ['$180°$', '$0°$', '$90°$', '$-90°$'], 0,
        [null, md`$\psi = 0$ gives $\hat x + e^{-j90°}\hat y = \hat x - j\hat y$ below: tip $\hat x\to\hat y$, $+\hat z$, against the travel $-\hat z$: LHCP.`, md`$\psi - 90° = 0°$: the parts are in phase below: linear.`, md`$\psi - 90° = -180°$: opposite phase below: linear.`],
        md`Below, the relative phase is $\psi - 90°$. $\psi = 180°$ gives $e^{j90°} = j$: $\hat x + j\hat y$ turns $\hat x\to-\hat y$, and $\hat x\times(-\hat y) = -\hat z$, the travel. RHCP (and the wave above is RHCP too).`),
      R(md`
        ### The method

        !!method Fields and polarization of any set of sheets
          1. **One sheet at a time.** $\tilde{\mathbf E}_n = -\frac{\eta}{2}\tilde{\mathbf J}_ne^{-j\beta\cdot(\text{distance to sheet }n)}$, traveling away from sheet $n$.
          2. **Add in each region.** Outside, factor out $e^{\mp j\beta z}$; the bracket holds $\tilde{\mathbf J}_1 + \tilde{\mathbf J}_2e^{\pm j\beta d}$ (plus above, minus below).
          3. **Parallel currents:** $|1 + e^{j\theta}| = 2|\cos(\theta/2)|$ with $\theta = \psi\pm\beta d$. **Perpendicular currents:** read the shape and the hand from the bracket, thumb along that side's travel.
          4. **H wave by wave.** $\frac{1}{\eta}\hat k\times\tilde{\mathbf E}_n$ for each sheet's wave with its own $\hat k$, then add. Between sheets the two waves have opposite $\hat k$.
          5. **Power.** Outside: $|\tilde{\mathbf E}|^2/2\eta$. Delivered by sheet $n$: $-\frac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}_n^*\}$ at its plane.
          6. **Check.** The $\mathbf H$ jump equals each current; power out of both sides equals the sum delivered.

        ### Worked example 2: design two sheets for RHCP (new numbers)

        !!graded Problem
          In free space at $f = 150$ MHz, sheet 1 in the plane $y = 0$ carries $\tilde{\mathbf J}_1 = \hat z$ A/m. Sheet 2 is in the plane $y = d$ and carries $\tilde{\mathbf J}_2 = e^{j\psi}\,\hat x$ A/m. (a) Choose $d$ (smallest) and $\psi$ so that the wave in $y > d$ is RHCP. (b) What is the wave in $y < 0$? (c) Find $\langle S\rangle$ in $y > d$, and again with sheet 2 switched off.

        **Step 1: the numbers.** $\lambda = c/f = 2$ m, $\beta = \pi$ rad/m.

        **Step 2: what RHCP toward $+\hat y$ needs.** A tip turning $\hat a\to\hat b$ with $\hat a\times\hat b = +\hat y$. Forward around the cycle, $\hat z\times\hat x = +\hat y$. So we want the bracket $\hat z - j\hat x$: the $\hat x$ part lagging the $\hat z$ part by $90°$.

        **Step 3: the bracket above.** From Section 5,
        $$\hat z + e^{j(\psi + \beta d)}\,\hat x$$
        We need $e^{j(\psi + \beta d)} = -j$, so $\psi + \beta d = -90°$. Circular needs the two parts $90°$ apart, so the smallest useful spacing is $\beta d = 90°$: $d = \lambda/4 = 0.5$ m, and then $\psi = -180°$, the same as $180°$. So $\tilde{\mathbf J}_2 = -\hat x$ A/m: $J_{2}(t) = -\cos\omega t\,\hat x$.

        **Step 4: the field above.**
        $$\tilde{\mathbf E}_{\text{III}} = -60\pi\,e^{-j\pi y}(\hat z - j\hat x)$$
        in V/m. Its tip: the common $-60\pi$ does not matter; $\hat z - j\hat x$ turns $\hat z\to\hat x$, $\hat z\times\hat x = +\hat y$ ✓ RHCP.

        **Step 5: the field below.** The relative phase is $\psi - \beta d = -180° - 90° = -270°$, the same as $+90°$:
        $$\tilde{\mathbf E}_{\text{I}} = -60\pi\,e^{+j\pi y}(\hat z + j\hat x)$$
        The tip turns $\hat z\to-\hat x$, and $\hat z\times(-\hat x) = -\hat y$: along the travel $-\hat y$. **RHCP below too.**

        **Step 6: power.** Above, two perpendicular parts of $60\pi$ V/m each:
        $$\langle S\rangle = \frac{(60\pi)^2 + (60\pi)^2}{240\pi} = 30\pi \approx 94.2\ \text{W/m}^2$$
        With sheet 2 off, one part only: $\frac{(60\pi)^2}{240\pi} = 15\pi \approx 47.1$ W/m², with the same peak $|\mathbf E| = 60\pi$ V/m. Circular: twice the power at the same peak.

        **Speed path.** Pick the pair whose cross product is the travel ($\hat z\times\hat x = \hat y$), demand "$-j$" in front of the second, then $\psi = -90° - \beta d$.

        **Where points go.** Using $\psi - \beta d$ for the region above (the sheet nearer to the observer arrives earlier, so above it is $+\beta d$). Claiming the far side must be LHCP: that holds for one sheet, not for two.

        ### Worked example 3: the one-way pair in numbers

        !!graded Problem
          In free space at $f = 300$ MHz, $\tilde{\mathbf J}_1 = 0.5\,\hat y$ A/m on $x = 0$ and $\tilde{\mathbf J}_2 = -j0.5\,\hat y$ A/m on $x = 0.25$ m. Find $\langle S\rangle$ on each side, $|\tilde{\mathbf E}|$ at $x = 0.125$ m, and the power each sheet delivers.

        **Step 1.** $\lambda = 1$ m, so $d = \lambda/4$ and $\beta d = 90°$. Sheet 2 lags by $90°$: the pair of Section 7, radiating toward $+\hat x$.

        **Step 2: power.** Above: $|\tilde{\mathbf E}| = \eta_0|J| = 60\pi$ V/m, so
        $$\langle S\rangle_{x > 0.25} = \frac{(60\pi)^2}{240\pi} = 15\pi \approx 47.1\ \text{W/m}^2$$
        and $\langle S\rangle_{x < 0} = 0$.

        **Step 3: between.** $|\tilde{\mathbf E}| = \eta_0|J|\,|\sin\beta x|$ with $\beta x = 2\pi(0.125) = 45°$:
        $$|\tilde{\mathbf E}| = 60\pi\cdot\tfrac{\sqrt2}{2} = 30\sqrt2\,\pi \approx 133\ \text{V/m}$$
        **Step 4: delivered.** Sheet 1 sees $\tilde{\mathbf E} = 0$: it delivers nothing. Sheet 2 delivers all $15\pi \approx 47.1$ W/m².

        **Check.** Alone, each sheet would deliver $\frac{\eta_0}{4}(0.5)^2 = 7.5\pi$; together $15\pi$ ✓, the same total, all sent one way.

        ### The whole topic on one table

        | Setup | Result |
        |---|---|
        | one sheet | $\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_se^{-j\beta|z|}$, away from the sheet |
        | its $\mathbf H$ | $\frac{1}{\eta}\hat k\times\tilde{\mathbf E}$, size $|J_s|/2$ |
        | power | $\frac{\eta}{8}|\tilde{\mathbf J}_s|^2$ each side, $\frac{\eta}{4}|\tilde{\mathbf J}_s|^2$ delivered |
        | polarization | that of the current; opposite hands on the two sides |
        | two sheets, outside | bracket $\tilde{\mathbf J}_1 + \tilde{\mathbf J}_2e^{\pm j\beta d}$ |
        | parallel | $2|\cos\frac{\psi\pm\beta d}{2}|$ times one sheet |
        | $\lambda/2$, same phase | zero outside, standing wave between |
        | $\lambda/4$, $-90°$ | all power past sheet 2, delivered by sheet 2 |
        | perpendicular, $\lambda/4$ | relative phase $\psi\pm90°$; can give the same hand both sides |

        !!mistake Common mistakes
          - **The sign.** $\mathbf E$ points against $\mathbf J_s$ at the sheet: the factor is $-\eta/2$.
          - **$\eta$ instead of $\eta/2$.** Each side gets half of the $\mathbf H$ jump.
          - **Measuring from the origin.** A sheet at $z = d$ has $e^{-j\beta|z - d|}$.
          - **The sign of $\beta d$.** Above both sheets the upper sheet's wave is ahead by $\beta d$; below, behind.
          - **One $\hat k$ between the sheets.** Two waves go opposite ways there; compute $\mathbf H$ wave by wave.
          - **The same hand both sides from one sheet.** Impossible: same turn, opposite travel.
          - **Dropping $\pi$:** $2\eta_0 = 240\pi$, not 240 (the SP24 key's slip).
          - **Per side versus total power.** $\frac{\eta}{8}|J|^2$ each side; $\frac{\eta}{4}|J|^2$ from the sheet.

        !!key Speed tricks
          - **E copies $-J$.** The radiated polarization is the current's; then thumb along each side's travel.
          - **One sheet:** opposite hands on the two sides, always.
          - **$\lambda/2$, equal currents:** nothing outside; between, $\mathbf E\propto\sin\beta z$ (zero at the sheets) and $\mathbf H\propto\cos\beta z$.
          - **$\lambda/2$, opposite currents:** double outside both ways.
          - **$\lambda/4$:** the lagging sheet is the one the wave goes past. That sheet does all the work.
          - **Brackets:** above $1 + e^{j(\psi + \beta d)}$, below $1 + e^{j(\psi - \beta d)}$; size $2|\cos(\theta/2)|$.
          - **Perpendicular currents never cancel;** at $\lambda/4$ the relative phase is $\psi + 90°$ above and $\psi - 90°$ below.

        ### Check questions
      `),
      Q(md`SP24 #1(a)(iii): two sheets on $z = 0$ and $z = 0.5$ m, each $\tilde{\mathbf J}_s = -2\hat x$ A/m, free space, $f = 300$ MHz. $\tilde{\mathbf E}(z > 0.5)$ is…`,
        ['$0$ V/m', '$240\\pi\\,e^{-j2\\pi z}\\,\\hat x$ V/m', '$120\\pi\\,e^{-j2\\pi z}\\,\\hat x$ V/m', '$-j240\\pi\\sin(2\\pi z)\\,\\hat x$ V/m'], 0,
        [null, md`Doubling needs the waves in step; with $\beta d = \pi$ and equal currents they are half a period apart.`, md`That is one sheet alone. The other sheet's wave cancels it.`, md`That is the standing wave between the sheets, not the field beyond them.`],
        md`Above both sheets: $120\pi e^{-j\beta z}(1 + e^{j\pi}) = 0$. The key: 0 V/m.`, { src: 'SP24 #1(a)' }),
      Q(md`SP24 #1(b)(ii): in the same problem, $\tilde{\mathbf H}$ between the sheets is…`,
        ['$2\\cos(2\\pi z)\\,\\hat y$ A/m', '$-2j\\sin(2\\pi z)\\,\\hat y$ A/m', '$2\\cos(2\\pi z)\\,\\hat x$ A/m', '$0$ A/m'], 0,
        [null, md`That uses one $\hat k$ for both waves. The two waves go opposite ways, so their $\mathbf H$ parts add with the opposite sign from $\mathbf E$: a cosine.`, md`$\mathbf H$ of a wave with $\mathbf E$ along $\hat x$ traveling along $\pm\hat z$ is along $\hat y$.`, md`$\mathbf H$ cannot be zero between: it must jump by the current at each sheet.`],
        md`$\tilde{\mathbf H} = e^{-j\beta z}\hat y + e^{+j\beta z}\hat y = 2\cos(2\pi z)\,\hat y$ A/m, as the key says. Check: at $z = 0^+$ it is $2\hat y$, and $\hat z\times2\hat y = -2\hat x$ ✓.`, { src: 'SP24 #1(b)' }),
      Q(md`Lecture 24's Example 2: $\mathbf J_s(t) = \cos\omega t\,\hat x + \sin\omega t\,\hat y$ on $z = 0$. The waves radiated toward $+\hat z$ and $-\hat z$ are…`,
        ['RHCP and LHCP', 'LHCP and RHCP', 'RHCP and RHCP', 'linear, because each current is linear'], 0,
        [null, md`$\tilde{\mathbf J}_s = \hat x - j\hat y$ turns $\hat x\to\hat y$, and $\hat x\times\hat y = +\hat z$: right-handed above, so the swap is wrong.`, md`One sheet cannot send the same hand both ways: the turn is the same, the travel is opposite.`, md`Two perpendicular linear currents $90°$ apart make a rotating current, and the field copies it.`],
        md`$\mathbf E^\pm = -\frac{\eta}{2}\mathbf J_s(t \mp z/v)$: at $z = 0$ the tip turns $\hat x\to\hat y$. Thumb along $+\hat z$: right. Along $-\hat z$: left.`, { src: 'Lecture 24, Example 2' }),
      Q(md`A sheet in free space carries $\tilde{\mathbf J}_s = 2\hat x - j2\hat y$ A/m. The total power it delivers per square meter is…`,
        [md`$240\pi$ W/m²`, md`$120\pi$ W/m²`, md`$480\pi$ W/m²`, md`$60\pi$ W/m²`], 0,
        [null, md`That counts only one current component, $\frac{\eta}{4}\cdot4$. $|\tilde{\mathbf J}_s|^2 = 4 + 4 = 8$.`, md`That uses $\frac{\eta}{2}|J|^2$, twice the sheet's output.`, md`That is one component sent to one side.`],
        md`$\frac{\eta_0}{4}|\tilde{\mathbf J}_s|^2 = 30\pi\cdot8 = 240\pi$ W/m², half to each side.`),
      Q(md`Two sheets one full wavelength apart carry identical currents $J\hat x$. Beyond them, the field is…`,
        ['twice one sheet\'s field, on both sides', 'zero on both sides', 'one sheet\'s field', 'twice on one side and zero on the other'], 0,
        [null, md`Cancellation needs $\theta = 180°$. Here $\theta = \pm360°$.`, md`The waves arrive in step and add.`, md`That needs $\lambda/4$ spacing with a $90°$ phase.`],
        md`$\theta = 0 \pm 360°$: $|1 + e^{j\theta}| = 2$ on both sides.`),
      Q(md`True or false: "Between SP24's two sheets the time-averaged Poynting vector is zero, although the fields are not."`,
        ['True: E and H are $90°$ apart in time everywhere between', 'False: energy flows from each sheet to the other', 'False: the fields are zero between the sheets', 'True, but only at the midpoint'], 0,
        [null, md`Each sheet's wave does carry power toward the other, but the two flows are equal and opposite: the average is zero.`, md`They are a standing wave, $-j240\pi\sin2\pi z$ and $2\cos2\pi z$.`, md`$\frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$ is zero at every $z$ between, not just one point.`],
        md`$\tilde E_x\tilde H_y^*$ is $-j480\pi\sin\cos$, purely imaginary. Energy sloshes between electric and magnetic form, with no net flow.`),
      Q(md`HW 10-type: sheet 1 on $x = 0$ carries $J\hat z$, sheet 2 on $x = \lambda/4$ carries $Je^{j\psi}\hat y$. For which $\psi$ is the wave in $x > \lambda/4$ **linearly** polarized?`,
        ['$\\psi = \\pm90°$', '$\\psi = 0$ or $180°$', 'any $\\psi$: perpendicular currents give a line', 'no $\\psi$: the parts always have equal size'], 0,
        [null, md`With $\psi = 0$ or $180°$, the relative phase above is $\pm90°$: circular.`, md`Perpendicular parts make a line only when they are in or out of step.`, md`Equal size does not stop a line: in-phase parts of equal size make a line at $45°$.`],
        md`Above, the relative phase is $\psi + 90°$. It is $0°$ or $180°$ when $\psi = -90°$ or $+90°$.`),
      R(md`
        ### Practice, level 1: one sheet

        **The trick:** $\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s$ at the sheet, traveling away; $\mathbf H = \hat k\times\mathbf E/\eta$; $\frac{\eta}{8}|J|^2$ per side; the hand flips across the sheet.
      `),
      Object.assign(G('rf_w3_sheet', { need: 8 }), { id: 'w3-antenna.r0' }),
      R(md`
        ### Practice, level 1: two parallel sheets

        **The trick:** $\theta = \psi\pm\beta d$ (plus above, minus below), size $2|\cos(\theta/2)|$ times one sheet.
      `),
      Object.assign(G('rf_w3_pair', { need: 8 }), { id: 'w3-antenna.r1' }),
      R(md`
        ### Practice, level 1: perpendicular sheets and the hand

        **The trick:** at $\lambda/4$ spacing the relative phase is $\psi + 90°$ above and $\psi - 90°$ below; then Topic 9's hand test with each side's own thumb.
      `),
      Object.assign(G('rf_w3_cross', { need: 8 }), { id: 'w3-antenna.r2' }),
      R(md`
        ### Practice, level 2: whole antennas, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w3_onesheet', { need: 2 }),
      G('w3_twosheets', { need: 2 }),
      G('w3_oneway', { need: 2 }),
      G('w3_crossed', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A two-sheet antenna from start to finish: wavelength, direction, fields between, then a redesign for a chosen hand.
      `),
      G('w3_antenna_exam', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- sheet helpers
  const cx = (re, im = 0) => ({ re, im });
  const cpol = (m, deg) => cx(m * Math.cos(deg * DEG), m * Math.sin(deg * DEG));
  const cad = (a, b) => cx(a.re + b.re, a.im + b.im);
  // sheets [{ at, parts: [{ i, A, th }] }] on the planes c = at, in free space; E and H phasors at c = s (lam in the same unit)
  function fieldAt(sheets, c, s, lam) {
    const E = [cx(0), cx(0), cx(0)], H = [cx(0), cx(0), cx(0)];
    sheets.forEach((S) => {
      const k = uv(c, s >= S.at ? 1 : -1), ph = -360 * Math.abs(s - S.at) / lam;
      S.parts.forEach((q) => {
        const e = cpol(-ETA0 / 2 * q.A, q.th + ph);
        E[q.i] = cad(E[q.i], e);
        const [hi, hs] = axisOf(cross(k, uv(q.i)));
        H[hi] = cad(H[hi], cx(hs * e.re / ETA0, hs * e.im / ETA0));
      });
    });
    return { E, H };
  }
  const vmag = (V) => Math.sqrt(V.reduce((s, z) => s + z.re * z.re + z.im * z.im, 0));
  const classV = (V, k) => classifyAB(V.map((z) => z.re), V.map((z) => z.im), k);
  // time-averaged power a sheet delivers: -1/2 Re{E . J*} at its plane
  function delivered(sheets, c, n, lam) {
    const S = sheets[n], { E } = fieldAt(sheets, c, S.at, lam);
    return -0.5 * S.parts.reduce((s, q) => s + E[q.i].re * q.A * Math.cos(q.th * DEG) + E[q.i].im * q.A * Math.sin(q.th * DEG), 0);
  }
  const FREQ = [{ f: 75, lam: 4 }, { f: 150, lam: 2 }, { f: 300, lam: 1 }, { f: 600, lam: 0.5 }];
  const jT = (q) => {      // a current part as TeX: '2\hat x', '-j0.5\hat y', '3e^{j45°}\hat z'
    const th = wrap(q.th), a = q.A === 1 ? '' : p(q.A), u = `\\hat ${XYZ[q.i]}`;
    if (th === 0) return `${a}${u}`; if (th === 180) return `-${a}${u}`;
    if (th === 90) return `j${a}${u}`; if (th === -90) return `-j${a}${u}`;
    return `${a}${angT(th)}${u}`;
  };
  const jSum = (parts) => parts.map((q, n) => { const t = jT(q); return n === 0 ? t : t[0] === '-' ? ` - ${t.slice(1)}` : ` + ${t}`; }).join('');
  const sideT = (c, s) => `${XYZ[c]} ${s > 0 ? '>' : '<'} `;

  // ---------------------------------------------------------------- level 1: one sheet
  GENS.rf_w3_sheet = () => one([
    // E on one side
    () => {
      const g = geom(), J = pick([0.5, 1, 2, 3, 4]) * pick([1, -1]), side = pick([1, -1]);
      const E0 = -60 * J, ax = XYZ[g.c], u = `\\hat ${XYZ[g.i1]}`;
      const e = (m, sg) => `$${p(m)}\\pi\\,e^{${sg > 0 ? '-' : ''}j\\beta ${ax}}\\,${u}$ V/m`;
      return MC('One sheet: E', md`A sheet in the plane $${ax} = 0$ carries $\tilde{\mathbf J}_s = ${p(J)}\,${u}$ A/m in free space. For $${sideT(g.c, side)}0$, $\tilde{\mathbf E}$ is…`, e(E0, side),
        [[e(-E0, side), md`At the sheet $\mathbf E$ points **against** $\mathbf J_s$: the factor is $-\eta_0/2$.`],
          [e(2 * E0, side), md`That uses $\eta_0$ instead of $\eta_0/2$.`],
          [e(E0, -side), md`That exponent travels toward the sheet. Each wave travels away from it.`],
          [e(-2 * E0, side), md`Both the sign and the factor: $-\eta_0/2 = -60\pi$ per A/m.`]],
        md`$-\frac{\eta_0}{2}\tilde J_s = -60\pi(${p(J)}) = ${p(E0)}\pi$ V/m, with $e^{${side > 0 ? '-' : '+'}j\beta ${ax}}$ so that the wave travels away from the sheet (toward $${side > 0 ? '+' : '-'}\hat ${ax}$).`);
    },
    // H on one side
    () => {
      const g = geom(), J = pick([1, 2, 4, 6]) * pick([1, -1]), side = pick([1, -1]);
      const k = uv(g.c, side), Hv = cross(k, uv(g.i1)).map((x) => x * (-J / 2));   // H = k x (-J/2 e)
      const hT = (v, m) => `$${p(m)}\\,${shV(v)}$ A/m`;
      const mag = Math.abs(J) / 2, sign = (v) => v.map((x) => Math.sign(x));
      return MC('One sheet: H', md`A sheet in the plane $${XYZ[g.c]} = 0$ carries $\tilde{\mathbf J}_s = ${p(J)}\,\hat ${XYZ[g.i1]}$ A/m. Just ${side > 0 ? 'above' : 'below'} it ($${sideT(g.c, side)}0$), $\tilde{\mathbf H}$ is…`, hT(sign(Hv), mag),
        [[hT(sign(Hv).map((x) => -x), mag), md`Then $\mathbf E\times\mathbf H$ would point back into the sheet. $\tilde{\mathbf H} = \frac{1}{\eta}\hat k\times\tilde{\mathbf E}$ with $\hat k$ away from the sheet.`],
          [hT(sign(Hv), 2 * mag), md`The jump across the sheet is $|J_s|$; each side gets half.`],
          [hT(uv(g.i1, Math.sign(J)), mag), md`$\mathbf H$ is perpendicular to both the current and the travel.`],
          [hT(uv(g.c, side), mag), md`A plane wave's $\mathbf H$ is across the travel, not along it.`]],
        md`$\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s$ at the sheet, and $\tilde{\mathbf H} = \frac{1}{\eta}\hat k\times\tilde{\mathbf E} = -\frac12\hat k\times\tilde{\mathbf J}_s$ with $\hat k = ${kT(k)}$: $-\tfrac{${p(J)}}{2}(${kT(k)}\times\hat ${XYZ[g.i1]})$, size $${p(mag)}$ A/m.`);
    },
    // power
    () => {
      const J = pick([0.5, 1, 2, 3, 4]), both = pick([true, false]);
      const v = (m) => `$${p(+(m * J * J).toPrecision(4))}\\pi$ W/m²`;
      return MC('One sheet: power', md`A sheet in free space carries a current of amplitude ${p(J)} A/m along one direction. The average power per m² ${both ? 'it delivers in all (both sides)' : 'flowing to one side'} is…`, v(both ? 30 : 15),
        [[v(both ? 15 : 30), both ? md`That is one side only. The sheet feeds both.` : md`That is both sides together.`], [v(both ? 120 : 60), md`That uses $|\mathbf E| = \eta|J|$; each side's field is $\frac{\eta}{2}|J|$.`], [v(both ? 60 : 7.5), md`A factor of 2 off: one side is $\frac{\eta}{8}|J|^2$, both sides $\frac{\eta}{4}|J|^2$.`]],
        md`One side: $\frac{\eta_0}{8}|J|^2 = 15\pi|J|^2$. Both: $\frac{\eta_0}{4}|J|^2 = 30\pi|J|^2$. With $|J| = ${p(J)}$: ${v(both ? 30 : 15)}.`);
    },
    // the polarization on one side
    () => {
      const g = geom(), side = pick([1, -1]), A = pick([1, 2, 3]), kind = pick(['circ', 'circ', 'ell']);
      const parts = kind === 'circ' ? [cmp(g.i1, A, 0), cmp(g.i2, A, pick([90, -90]))] : [cmp(g.i1, A, 0), cmp(g.i2, pick([1, 2, 3].filter((x) => x !== A)), pick([90, -90]))];
      const k = uv(g.c, side), rk = classify(parts, k);
      const wr = Object.keys(LAB).filter((x) => x !== rk).map((x) => [LAB[x], x[1] === rk[1] && x !== 'LIN' && rk !== 'LIN' ? md`Wrong hand. ${ab(parts, k).txt}. Remember the thumb on this side points along $${kT(k)}$; the other side gets the other hand.` : whyL(rk, x, parts, k)]);
      return MC('One sheet: which hand?', md`A sheet in the plane $${XYZ[g.c]} = 0$ carries $\tilde{\mathbf J}_s = ${jSum(parts)}$ A/m. The wave in $${sideT(g.c, side)}0$ is…`, LAB[rk], wr,
        md`$\tilde{\mathbf E}$ copies $-\frac{\eta}{2}\tilde{\mathbf J}_s$, and the common factor changes nothing. This side travels toward $${kT(k)}$. ${ab(parts, k).txt}: **${SHORT[rk]}**. The other side gets the opposite hand.`);
    },
    // design one sheet
    () => {
      const g = geom(), side = pick([1, -1]), want = pick(['R', 'L']), A = pick([1, 2]);
      const k = uv(g.c, side);
      let r = [cmp(g.i1, A, 0), cmp(g.i2, A, -90)];
      if (classify(r, k)[0] !== want) r = [cmp(g.i1, A, 0), cmp(g.i2, A, 90)];
      const o = (ps) => `$${jSum(ps)}$`;
      return MC('One sheet: design', md`Which current on the plane $${XYZ[g.c]} = 0$ sends ${want === 'R' ? 'RHCP' : 'LHCP'} toward $${kT(k)}$?`, o(r),
        [[o([r[0], flipC(r[0], r[1])]), md`That turns the other way: it sends ${want === 'R' ? 'LHCP' : 'RHCP'} toward $${kT(k)}$ (and the asked hand toward the other side).`],
          [o([r[0], cmp(g.i2, A, 0)]), md`In phase: linear.`], [o([r[0], cmp(g.i2, 2 * A, r[1].th)]), md`The right turn, but unequal parts: elliptical.`],
          [o([cmp(g.c, A, 0), cmp(g.i2, A, r[1].th)]), md`A current along $\hat ${XYZ[g.c]}$ would flow out of the sheet; a sheet current lies in its plane.`]],
        md`${ab(r, k).txt}. The field copies the current (times $-\eta/2$), so this current sends ${want === 'R' ? 'RHCP' : 'LHCP'} toward $${kT(k)}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: two parallel sheets
  const SIZE = { 0: 'twice one sheet\'s field', 180: 'zero', 90: '$\\sqrt2$ times one sheet\'s field', 270: '$\\sqrt2$ times one sheet\'s field' };
  const sizeOf = (th) => SIZE[((wrap(th) % 360) + 360) % 360];
  GENS.rf_w3_pair = () => one([
    // what reaches each side
    () => {
      const dq = pick([1, 2, 3, 4]), psi = pick([0, 90, -90, 180]), up = pick([true, false]);
      const bd = 90 * dq, th = up ? psi + bd : psi - bd, right = sizeOf(th);
      const dT = { 1: '\\lambda/4', 2: '\\lambda/2', 3: '3\\lambda/4', 4: '\\lambda' }[dq];
      const all = ['twice one sheet\'s field', 'zero', '$\\sqrt2$ times one sheet\'s field', 'one sheet\'s field'];
      return MC('Two sheets: outside', md`Sheet 1 at $z = 0$ carries $J\hat x$; sheet 2 at $z = ${dT}$ carries $Je^{j${psi}°}\hat x$. ${up ? 'Above both ($z > d$)' : 'Below both ($z < 0$)'}, the field is…`, right,
        all.filter((x) => x !== right).map((x) => [x, md`The bracket is $1 + e^{j\theta}$ with $\theta = \psi ${up ? '+' : '-'} \beta d = ${psi}° ${up ? '+' : '-'} ${bd}° = ${th}°$, and $|1 + e^{j\theta}| = 2|\cos(\theta/2)| = ${p(+(2 * Math.abs(Math.cos(th * DEG / 2))).toPrecision(3))}$.${x === 'one sheet\'s field' ? ' One sheet\'s field would need $\\theta = \\pm120°$.' : ''}`]),
        md`${up ? 'Above, sheet 2 is nearer: its wave is ahead by $\\beta d$' : 'Below, sheet 2 is farther: its wave is behind by $\\beta d$'}. $\theta = ${th}°$ and $2|\cos(${th}°/2)| = ${p(+(2 * Math.abs(Math.cos(th * DEG / 2))).toPrecision(3))}$: ${right}.`);
    },
    // between two sheets half a wavelength apart
    () => {
      const same = pick([true, false]), J = pick([1, 2, 3]);
      const r = same ? `$\\sin\\beta z$, zero at both sheets` : `$\\cos\\beta z$, largest at both sheets`;
      return MC('Two sheets: between', md`Sheets at $z = 0$ and $z = \lambda/2$ carry ${same ? 'equal currents' : 'opposite currents'}, $${J}\hat x$ and $${same ? '' : '-'}${J}\hat x$ A/m. Between them, $|\tilde E_x|$ varies as…`, r,
        [[same ? `$\\cos\\beta z$, largest at both sheets` : `$\\sin\\beta z$, zero at both sheets`, md`Write it out: $e^{-j\beta z} ${same ? '-' : '+'} e^{j\beta z}$ (the $e^{-j\beta d} = -1$ ${same ? 'turns the plus into a minus' : 'cancels the minus of the opposite current'}).`],
          ['a constant: a traveling wave', md`Two waves going opposite ways with equal sizes make a standing pattern, not a traveling wave.`],
          ['zero everywhere', md`The tangential $\mathbf H$ must jump by the current at each sheet, so the fields between cannot all vanish.`]],
        md`Between, $\tilde E_x = -\frac{\eta}{2}${J}\left[e^{-j\beta z} ${same ? '+' : '-'} e^{-j\pi}e^{j\beta z}\right] = -\frac{\eta}{2}${J}\left[e^{-j\beta z} ${same ? '-' : '+'} e^{j\beta z}\right]$, which is ${same ? '$\\propto -2j\\sin\\beta z$' : '$\\propto 2\\cos\\beta z$'}. ${same ? 'Outside: zero.' : 'Outside: doubled.'}`);
    },
    // the power on one side
    () => {
      const J = pick([0.5, 1, 2]), dq = pick([1, 2]), psi = pick([0, 90, -90, 180]), up = pick([true, false]);
      const th = up ? psi + 90 * dq : psi - 90 * dq, fac = 4 * Math.cos(th * DEG / 2) ** 2;      // in units of one sheet's one-side power
      if (fac < 1e-9) return GENS.rf_w3_pair();
      const one1 = 15 * J * J, v = (m) => `$${p(+(m).toPrecision(4))}\\pi$ W/m²`;
      return MC('Two sheets: power', md`Free space. Sheet 1 at $z = 0$ carries $${p(J)}\hat x$ A/m; sheet 2 at $z = ${dq === 1 ? '\\lambda/4' : '\\lambda/2'}$ carries $${p(J)}e^{j${psi}°}\hat x$ A/m. The average power per m² ${up ? 'above both sheets' : 'below both sheets'} is…`, v(fac * one1),
        [[v(one1), md`That is one sheet alone. The bracket has size $2|\cos(\theta/2)|$ with $\theta = ${th}°$.`], [v(2 * one1 === fac * one1 ? 3 * one1 : 2 * one1), md`Powers do not simply add when parallel waves overlap: the fields add, then you square.`], [v(fac * one1 / 2), md`That is half: one side gets $|\tilde{\mathbf E}|^2/2\eta$ with $|\tilde{\mathbf E}| = \frac{\eta}{2}|J|\cdot2|\cos(\theta/2)|$.`]],
        md`$\theta = ${th}°$, $|1 + e^{j\theta}|^2 = 4\cos^2(${th}°/2) = ${p(+fac.toPrecision(3))}$. One sheet sends $\frac{\eta_0}{8}|J|^2 = ${p(one1)}\pi$ W/m² each way, so this side gets $${p(+fac.toPrecision(3))}\times${p(one1)}\pi = ${p(+(fac * one1).toPrecision(4))}\pi$ W/m².`);
    },
    // which sheet does the work in a one-way pair
    () => {
      const lead = pick([true, false]);           // sheet 2 leads (+90) or lags (-90), spacing lambda/4
      const dirT = lead ? '$-\\hat z$ (past sheet 1)' : '$+\\hat z$ (past sheet 2)';
      return MC('Two sheets: who works?', md`Sheet 1 ($z = 0$) carries $J\hat x$, sheet 2 ($z = \lambda/4$) carries $${lead ? '' : '-'}jJ\hat x$. All the power goes toward ${dirT}. Which sheet delivers it?`, lead ? 'sheet 1 alone' : 'sheet 2 alone',
        [[lead ? 'sheet 2 alone' : 'sheet 1 alone', md`That sheet sits where the other sheet's wave exactly cancels its own field: $\tilde{\mathbf E} = 0$ there, so $-\frac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*\} = 0$.`],
          ['each sheet half', md`Equal currents do not mean equal work: the work depends on the field each current feels.`], ['neither: the power comes from the field between them', md`Fields only carry energy; currents driven against $\mathbf E$ supply it.`]],
        md`The wave goes past the sheet that ${lead ? 'leads' : 'lags'}... more simply: compute $\tilde{\mathbf E}$ at each sheet. At sheet ${lead ? 2 : 1} the two contributions cancel, so it delivers nothing; sheet ${lead ? 1 : 2} feels $|\tilde{\mathbf E}| = \eta|J|$ in step against its current and delivers all $\frac{\eta}{2}|J|^2$.`);
    },
    // the phase each wave arrives with
    () => {
      const dq = pick([1, 2, 3]), psi = pick([0, 45, 90, -90, 180]), up = pick([true, false]);
      const bd = 90 * dq, r = wrap(up ? psi + bd : psi - bd), wv = wrap(up ? psi - bd : psi + bd);
      const dT = { 1: '\\lambda/4', 2: '\\lambda/2', 3: '3\\lambda/4' }[dq];
      const o = (d) => `$${d}°$`;
      const opts = [[o(wv), md`That swaps the regions: ${up ? 'above both sheets, sheet 2 is nearer, so its wave arrives $\\beta d$ earlier' : 'below both sheets, sheet 2 is farther, so its wave arrives $\\beta d$ later'}.`], [o(wrap(psi)), md`That forgets the extra path $\beta d = ${bd}°$.`], [o(wrap(up ? bd : -bd)), md`That forgets the phase $\psi$ of the current itself.`]];
      return MC('Two sheets: the phase', md`Sheet 2 is $${dT}$ above sheet 1 and its current leads by $\psi = ${psi}°$. ${up ? 'Above both sheets' : 'Below both sheets'}, sheet 2's wave leads sheet 1's wave by…`, o(r),
        opts.filter(([x]) => x !== o(r)),
        md`${up ? 'Above' : 'Below'}: $\theta = \psi ${up ? '+' : '-'} \beta d = ${psi}° ${up ? '+' : '-'} ${bd}° \to ${r}°$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: perpendicular sheets
  // sheet 1 at c = 0 carries J e_i1, sheet 2 at c = d carries J e^{j psi} e_i2; on each side the bracket is e_i1 + e^{j(psi +- beta d)} e_i2
  const crossParts = (g, psi, bd, side) => [cmp(g.i1, 1, 0), cmp(g.i2, 1, psi + side * bd)];
  GENS.rf_w3_cross = () => one([
    // the hand on one side
    () => {
      const g = geom(), psi = pick([0, 180, 90, -90, 0, 180]), dq = pick([1, 1, 3]), side = pick([1, -1]);
      const k = uv(g.c, side), ps = crossParts(g, psi, 90 * dq, side), rk = classify(ps, k);
      const dT = dq === 1 ? '\\lambda/4' : '3\\lambda/4';
      return MC('Crossed sheets: the hand', md`Sheet 1 on $${XYZ[g.c]} = 0$ carries $J\hat ${XYZ[g.i1]}$; sheet 2 on $${XYZ[g.c]} = ${dT}$ carries $Je^{j${psi}°}\hat ${XYZ[g.i2]}$. The wave ${side > 0 ? 'beyond sheet 2' : 'beyond sheet 1'} ($${XYZ[g.c]} ${side > 0 ? `> ${dT}` : '< 0'}$) is…`, LAB[rk],
        Object.keys(LAB).filter((x) => x !== rk).map((x) => [LAB[x], whyL(rk, x, ps, k)]),
        md`On this side the relative phase is $\psi ${side > 0 ? '+' : '-'} \beta d = ${psi}° ${side > 0 ? '+' : '-'} ${90 * dq}° \to ${wrap(psi + side * 90 * dq)}°$, so the bracket is $${jSum(ps)}$. ${rk === 'LIN' ? 'In or out of step: linear.' : `${ab(ps, k).txt}: **${SHORT[rk]}**.`}`);
    },
    // choose psi
    () => {
      const g = geom(), side = pick([1, -1]), want = pick(['RC', 'LC']), k = uv(g.c, side);
      const ok = [0, 180, 90, -90].find((ps) => classify(crossParts(g, ps, 90, side), k) === want);
      const o = (d) => `$\\psi = ${d}°$`;
      return MC('Crossed sheets: design', md`Sheet 1 on $${XYZ[g.c]} = 0$ carries $J\hat ${XYZ[g.i1]}$; sheet 2 on $${XYZ[g.c]} = \lambda/4$ carries $Je^{j\psi}\hat ${XYZ[g.i2]}$. Which $\psi$ makes the wave in $${XYZ[g.c]} ${side > 0 ? '> \\lambda/4' : '< 0'}$ **${SHORT[want]}**?`, o(ok),
        [0, 180, 90, -90].filter((x) => x !== ok).map((x) => { const r = classify(crossParts(g, x, 90, side), k); return [o(x), r === 'LIN' ? md`The relative phase on this side becomes $${wrap(x + side * 90)}°$: in or out of step, linear.` : md`That gives ${SHORT[r]} on this side: the opposite turn.`]; }),
        md`On this side the bracket is $\hat ${XYZ[g.i1]} + e^{j(\psi ${side > 0 ? '+' : '-'} 90°)}\hat ${XYZ[g.i2]}$. With $\psi = ${ok}°$: $${jSum(crossParts(g, ok, 90, side))}$. ${ab(crossParts(g, ok, 90, side), k).txt}: ${SHORT[want]}.`);
    },
    // same or opposite hands on the two sides
    () => {
      const sep = pick(['zero', 'quarter']), psi = pick([0, 180]);
      const right = sep === 'zero' ? 'opposite hands' : 'the same hand';
      return MC('Crossed sheets: both sides', md`Two perpendicular currents, $J\hat x$ and $Je^{j${psi === 0 ? 90 : -90}°}\hat y$ (equal sizes), sit ${sep === 'zero' ? 'on the same plane $z = 0$' : 'on two planes, $z = 0$ and $z = \\lambda/4$'}. The circular waves on the two sides have…`, right,
        [[sep === 'zero' ? 'the same hand' : 'opposite hands', sep === 'zero' ? md`One plane is one sheet: the same turn on both sides with opposite travel, so opposite hands.` : md`Going up, sheet 2's part gains $90°$; going down it loses $90°$. The turn flips between the sides, and so does the travel: the hand does not.`],
          ['no hand: the waves are linear', sep === 'zero' ? md`Equal parts $90°$ apart are circular.` : md`At $\lambda/4$ the relative phases are $\psi\pm90°$, which here are $\pm90°$ or $0°/180°$... check: they give a circle for these currents.`],
          ['a hand that depends on the distance from the sheets', md`A traveling wave has one polarization at every plane.`]],
        md`${sep === 'zero' ? 'One plane: the field copies the current, the same turn both ways, opposite travel: opposite hands.' : 'Two planes $\\lambda/4$ apart: the relative phase is shifted by $+90°$ above and $-90°$ below, so the turns are opposite, and with opposite travel the hands agree.'}`);
    },
    // power with and without the second sheet
    () => {
      const J = pick([0.5, 1, 2]), v = (m) => `$${p(+(m * J * J).toPrecision(4))}\\pi$ W/m²`;
      return MC('Crossed sheets: power', md`Sheet 1 carries $${p(J)}\hat x$ A/m on $z = 0$; sheet 2 carries $${p(J)}e^{j\psi}\hat y$ A/m on $z = \lambda/4$, chosen to make circular waves. In free space, the average power per m² going toward $+\hat z$ is…`, v(30),
        [[v(15), md`That is one sheet alone. The perpendicular part adds its own power.`], [v(60), md`Perpendicular parts never interfere: their powers add, they never double the field.`], [v(120), md`That is $\frac{\eta}{2}|J|^2$ per part, four times too big.`]],
        md`Each part sends $\frac{\eta_0}{8}|J|^2 = 15\pi|J|^2$ each way, and perpendicular parts add: $30\pi|J|^2 = $ ${v(30)}.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2
  GENS.w3_onesheet = () => {
    const g = geom(), F = pick(FREQ), c0 = pick([0, 1, 2]), A1 = pick([1, 2]), A2 = pick([1, 2]), psi = pick([90, -90, 90, -90, 0, 180]);
    const parts = [cmp(g.i1, A1, 0), cmp(g.i2, A2, psi)], ax = XYZ[g.c], bT = p(+(2 / F.lam).toPrecision(3));
    const kP = uv(g.c, 1), kM = uv(g.c, -1), rP = classify(parts, kP), rM = classify(parts, kM);
    const dist = (s) => (c0 === 0 ? `${ax}` : `(${ax} - ${c0})`);
    const eT = (sg, mult, useDist) => `$-${p(60 * mult)}\\pi(${jSum(parts)})\\,e^{${sg > 0 ? '-' : ''}j${bT}\\pi ${useDist ? dist() : ax}}$ V/m`;
    const S = 15 * (A1 * A1 + A2 * A2) * PI;
    const labOpts = (rk, k) => [LAB[rk], ...Object.keys(LAB).filter((x) => x !== rk).slice(0, 3).map((x) => LAB[x])];
    const labWhy = (rk, k) => Object.keys(LAB).filter((x) => x !== rk).slice(0, 3).map((x) => whyL(rk, x, parts, k));
    return {
      title: 'One sheet: field, hands, power',
      q: md`A sheet in the plane $${ax} = ${c0}$ m carries $\tilde{\mathbf J}_s = ${jSum(parts)}$ A/m in free space at $f = ${F.f}$ MHz.`,
      parts: [
        Object.assign(N(`\\text{amplitude of }E_${XYZ[g.i1]}`, 60 * PI * A1, 'V/m'), { traps: [{ v: 120 * PI * A1, msg: 'That uses η0, not η0/2.' }] }),
        mcPart(`\\tilde{\\mathbf E}\\text{ for }${ax} > ${c0}`, [eT(1, 1, true), eT(-1, 1, true), c0 === 0 ? eT(1, 2, true) : eT(1, 1, false), eT(1, 2, true).replace('-', '')],
          [md`That exponent travels toward the sheet; above it the wave goes toward $+\hat ${ax}$.`, c0 === 0 ? md`That uses $\eta_0$ instead of $\eta_0/2$.` : md`The phase counts the distance from the sheet, $${ax} - ${c0}$, not from the origin.`, md`Both the sign ($\mathbf E$ points against $\mathbf J_s$) and the factor ($\eta_0/2$, not $\eta_0$).`]),
        mcPart(`\\text{The wave in }${ax} > ${c0}`, labOpts(rP, kP), labWhy(rP, kP)),
        mcPart(`\\text{The wave in }${ax} < ${c0}`, labOpts(rM, kM), labWhy(rM, kM)),
        Object.assign(N('\\langle S\\rangle\\text{ on one side}', S, 'W/m²'), { traps: [{ v: 2 * S, msg: 'That is both sides together.' }, { v: 15 * A1 * A1 * PI, msg: 'That is one current component. Both parts carry power.' }] }),
      ],
      hints: [md`$\tilde{\mathbf E} = -\frac{\eta_0}{2}\tilde{\mathbf J}_se^{-j\beta|${ax} - ${c0}|}$, with $\beta = 2\pi/\lambda$ and $\lambda = c/f$.`, md`The field copies the current; the hand flips across the sheet.`],
      sol: md`
        **Step 1: numbers.** $\lambda = c/f = ${p(F.lam)}$ m, $\beta = 2\pi/\lambda = ${bT}\pi$ rad/m.

        **Step 2: the field.** $-\frac{\eta_0}{2} = -60\pi$ per A/m, so the $\hat ${XYZ[g.i1]}$ amplitude is $60\pi(${A1}) = ${f(60 * PI * A1)}$ V/m, and above the sheet
        $$\tilde{\mathbf E} = -60\pi(${jSum(parts)})\,e^{-j${bT}\pi ${dist()}}$$
        in V/m. Below, the exponent is $e^{+j${bT}\pi ${dist()}}$.

        **Step 3: the hands.** The common factor changes nothing. Above, the thumb points along $+\hat ${ax}$: ${rP === 'LIN' ? 'linear' : `${ab(parts, kP).txt}, so **${SHORT[rP]}**`}. Below, along $-\hat ${ax}$: **${SHORT[rM]}**${rP === 'LIN' ? '' : ' (same turn, opposite travel)'}.

        **Step 4: power.** $\langle S\rangle = \frac{\eta_0}{8}|\tilde{\mathbf J}_s|^2 = 15\pi(${A1 * A1} + ${A2 * A2}) = ${f(S)}$ W/m² on each side.
      `,
    };
  };

  GENS.w3_twosheets = () => {
    const g = geom(), F = pick(FREQ), J = pick([-2, -1, 1, 2, 3]), dmul = pick([0.5, 0.5, 1]), opp = pick([false, true]);
    const ax = XYZ[g.c], u = g.i1, d = dmul * F.lam, J2 = opp ? -J : J;
    const sh2 = [{ at: 0, parts: [cmp(u, Math.abs(J), J > 0 ? 0 : 180)] }, { at: d, parts: [cmp(u, Math.abs(J2), J2 > 0 ? 0 : 180)] }];
    const zP = F.lam / 6, { E, H } = fieldAt(sh2, g.c, zP, F.lam), Em = vmag(E), Hm = vmag(H);
    const th = (opp ? 180 : 0) + 360 * dmul, outside = Math.abs(Math.cos(th * DEG / 2)) < 1e-9 ? 'zero on both sides' : 'twice one sheet\'s field on both sides';
    const sinCase = Math.abs(Math.cos(((opp ? 180 : 0) - 360 * dmul) * DEG / 2)) < 1e-9;    // between: e^{-jbz} - e^{jbz} when psi - beta d = 180
    const bT = p(+(2 / F.lam).toPrecision(3));
    const eBetween = sinCase ? `j${p(120 * -J)}\\pi\\sin(${bT}\\pi ${ax})` : `${p(-120 * J)}\\pi\\cos(${bT}\\pi ${ax})`;
    const eWrong = sinCase ? `${p(-120 * J)}\\pi\\cos(${bT}\\pi ${ax})` : `j${p(120 * -J)}\\pi\\sin(${bT}\\pi ${ax})`;
    return {
      title: 'Two sheets: three regions (the SP24 #1 structure)',
      q: md`In free space at $f = ${F.f}$ MHz, sheet 1 on $${ax} = 0$ carries $${p(J)}\,\hat ${XYZ[u]}$ A/m and sheet 2 on $${ax} = ${p(d)}$ m carries $${p(J2)}\,\hat ${XYZ[u]}$ A/m.`,
      parts: [
        mcPart('Outside the sheets, the field is', [outside, outside[0] === 'z' ? 'twice one sheet\'s field on both sides' : 'zero on both sides', 'twice one sheet\'s field on one side, zero on the other', 'one sheet\'s field on both sides'],
          [md`$\theta = \psi \pm \beta d$; here $\psi = ${opp ? 180 : 0}°$ and $\beta d = ${360 * dmul}°$.`, md`One-sided radiation needs a quarter-wave spacing with a $90°$ phase.`, md`The other sheet's wave is just as large; it either adds or cancels.`]),
        mcPart(`\\tilde E_${XYZ[u]}\\text{ between the sheets}`, [`$${eBetween}$ V/m`, `$${eWrong}$ V/m`, `$${sinCase ? `j${p(60 * -J)}\\pi\\sin(${bT}\\pi ${ax})` : `${p(-60 * J)}\\pi\\cos(${bT}\\pi ${ax})`}$ V/m`, `$${p(-60 * J)}\\pi\\,e^{-j${bT}\\pi ${ax}}$ V/m`],
          [md`$e^{-j\beta ${ax}} ${sinCase ? '-' : '+'} e^{j\beta ${ax}}$ is ${sinCase ? '$-2j\\sin$' : '$2\\cos$'}, not the other one. Check the sign that $e^{-j\beta d}$ and the second current give.`, md`Two sheets each contribute $\frac{\eta_0}{2}|J|$; the factor 2 from $2\cos$ or $2j\sin$ makes it $\eta_0|J|$.`, md`That is sheet 1's wave alone; sheet 2's wave runs the other way through the same region.`]),
        Object.assign(N(`|\\tilde{\\mathbf E}|\\text{ at }${ax} = \\lambda/6 = ${p(+zP.toPrecision(3))}\\text{ m}`, Em, 'V/m'), { traps: [{ v: 60 * PI * Math.abs(J), msg: 'That is one sheet alone.' }] }),
        Object.assign(N(`|\\tilde{\\mathbf H}|\\text{ at the same point}`, Hm, 'A/m'), { traps: [{ v: Em / ETA0, msg: 'Between the sheets E and H are standing patterns: H is not |E|/η0 there. Compute each wave’s H with its own k̂.' }] }),
      ],
      hints: [md`$\lambda = ${p(F.lam)}$ m, so $d = ${dmul === 0.5 ? '\\lambda/2' : '\\lambda'}$ and $\beta d = ${360 * dmul}°$.`, md`Between: $-\frac{\eta_0}{2}\left[J_1e^{-j\beta ${ax}} + J_2e^{-j\beta d}e^{+j\beta ${ax}}\right]$. For $\mathbf H$, the second wave has $\hat k = -\hat ${ax}$.`],
      sol: md`
        **Step 1.** $\lambda = c/f = ${p(F.lam)}$ m, $\beta = ${bT}\pi$ rad/m, $d = ${p(d)}$ m, so $\beta d = ${360 * dmul}°$ and $e^{\pm j\beta d} = ${dmul === 0.5 ? '-1' : '1'}$. Each sheet alone gives $-\frac{\eta_0}{2}J = ${p(-60 * J)}\pi$ V/m${opp ? ' for sheet 1 and the negative of that for sheet 2' : ''}.

        **Step 2: outside.** $\theta = \psi \pm \beta d = ${opp ? 180 : 0}° \pm ${360 * dmul}°$: ${outside}.

        **Step 3: between.** $\tilde E_${XYZ[u]} = ${p(-60 * J)}\pi\left[e^{-j\beta ${ax}} ${sinCase ? '-' : '+'} e^{+j\beta ${ax}}\right]$, so
        $$\tilde E_${XYZ[u]} = ${eBetween}$$
        in V/m.

        **Step 4: at $${ax} = \lambda/6$** ($\beta ${ax} = 60°$): $|\tilde{\mathbf E}| = ${f(Em)}$ V/m.

        **Step 5: H.** Wave by wave: sheet 1's wave ($\hat k = +\hat ${ax}$) and sheet 2's wave ($\hat k = -\hat ${ax}$) give $\mathbf H$ parts that combine with the opposite sign from $\mathbf E$, so $|\tilde{\mathbf H}| \propto ${sinCase ? '\\cos' : '\\sin'}\beta ${ax}$: at $60°$, $|\tilde{\mathbf H}| = ${f(Hm)}$ A/m.
      `,
    };
  };

  GENS.w3_oneway = () => {
    const g = geom(), F = pick(FREQ), J = pick([0.5, 1, 2]), lead = pick([true, false]);
    const ax = XYZ[g.c], u = XYZ[g.i1], d = F.lam / 4;
    const sh2 = [{ at: 0, parts: [cmp(g.i1, J, 0)] }, { at: d, parts: [cmp(g.i1, J, lead ? 90 : -90)] }];
    const S = 60 * J * J * PI, Emid = vmag(fieldAt(sh2, g.c, d / 2, F.lam).E);
    const P1 = delivered(sh2, g.c, 0, F.lam), P2 = delivered(sh2, g.c, 1, F.lam);
    const worker = P1 > P2 ? 1 : 2;
    return {
      title: 'The quarter-wave pair',
      q: md`In free space at $f = ${F.f}$ MHz, sheet 1 on $${ax} = 0$ carries $${p(J)}\,\hat ${u}$ A/m and sheet 2 on $${ax} = ${p(d)}$ m carries $${lead ? '' : '-'}j${p(J)}\,\hat ${u}$ A/m.`,
      parts: [
        mcPart('The radiated power goes', [lead ? `only toward $-\\hat ${ax}$` : `only toward $+\\hat ${ax}$`, lead ? `only toward $+\\hat ${ax}$` : `only toward $-\\hat ${ax}$`, 'equally both ways', 'nowhere'],
          [md`On that side $\theta = \psi ${lead ? '+' : '-'} \beta d = ${lead ? '90° + 90° = 180°' : '-90° - 90° = -180°'}$: cancellation.`, md`Equal sharing needs $|\cos(\theta/2)|$ equal on both sides; here one side gets $\theta = 0$, the other $180°$.`, md`One side gets $\theta = 0°$: the waves add.`]),
        Object.assign(N('\\langle S\\rangle\\text{ on the radiating side}', S, 'W/m²'), { traps: [{ v: S / 4, msg: 'That is one sheet alone. The two waves add in field, so four times that.' }, { v: S / 2, msg: 'Add the fields first, then square: |2E|² = 4|E|².' }] }),
        Object.assign(N(`|\\tilde{\\mathbf E}|\\text{ halfway between the sheets}`, Emid, 'V/m'), { traps: [{ v: 120 * PI * J, msg: 'That is the full size, reached only at the working sheet.' }] }),
        mcPart('The power is delivered by', [`sheet ${worker} alone`, `sheet ${3 - worker} alone`, 'each sheet half', 'neither sheet'],
          [md`Sheet ${3 - worker} feels $\tilde{\mathbf E} = 0$: the other sheet's wave cancels its own field there.`, md`The work $-\frac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*\}$ depends on the field each current feels, and those differ.`, md`Energy is conserved: what leaves must be delivered by the currents.`]),
        Object.assign(N(`\\text{power delivered by sheet }${worker}`, Math.max(P1, P2), 'W/m²'), { traps: [{ v: 30 * J * J * PI, msg: 'That is what one sheet delivers alone, (η/4)|J|². Here the other sheet’s wave changes the field it feels.' }] }),
      ],
      hints: [md`$\beta d = 90°$. Above: $\theta = \psi + 90°$. Below: $\theta = \psi - 90°$.`, md`Delivered by a sheet: $-\frac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf J}^*\}$, with $\tilde{\mathbf E}$ the total field at its plane.`],
      sol: md`
        **Step 1.** $\lambda = ${p(F.lam)}$ m, $d = \lambda/4$, $\beta d = 90°$, $\psi = ${lead ? '+90°' : '-90°'}$.

        **Step 2: direction.** Above: $\theta = ${lead ? '180°' : '0°'}$; below: $\theta = ${lead ? '0°' : '-180°'}$. Everything goes toward $${lead ? '-' : '+'}\hat ${ax}$.

        **Step 3: power.** On that side $|\tilde{\mathbf E}| = 2\cdot\frac{\eta_0}{2}|J| = 120\pi(${p(J)})$ V/m, so $\langle S\rangle = \frac{(120\pi J)^2}{240\pi} = 60\pi J^2 = ${f(S)}$ W/m².

        **Step 4: between.** $|\tilde{\mathbf E}| = \eta_0|J|\,|\sin\beta s|$ with $s$ measured from the idle sheet; halfway, $\beta s = 45°$: $|\tilde{\mathbf E}| = 120\pi(${p(J)})\tfrac{\sqrt2}{2} = ${f(Emid)}$ V/m.

        **Step 5: who delivers.** At sheet ${3 - worker} the total field is zero, so it delivers nothing. Sheet ${worker} feels $\eta_0|J|$ and delivers $${f(Math.max(P1, P2))}$ W/m², all of the output ✓.
      `,
    };
  };

  GENS.w3_crossed = () => {
    const g = geom(), F = pick(FREQ), J = pick([0.5, 1, 2]), side = pick([1, -1]), want = pick(['RC', 'LC']);
    const ax = XYZ[g.c], k = uv(g.c, side), d = F.lam / 4;
    const psiOK = [0, 180, 90, -90].find((ps) => classify(crossParts(g, ps, 90, side), k) === want);
    const other = uv(g.c, -side), rO = classify(crossParts(g, psiOK, 90, -side), other);
    const S = 30 * J * J * PI;
    const o = (x) => `$\\psi = ${x}°$`;
    return {
      title: 'Two crossed sheets for a chosen hand (the HW 10 #4 skill)',
      q: md`In free space at $f = ${F.f}$ MHz, sheet 1 on $${ax} = 0$ carries $${p(J)}\,\hat ${XYZ[g.i1]}$ A/m and sheet 2 on $${ax} = ${p(d)}$ m carries $${p(J)}e^{j\psi}\,\hat ${XYZ[g.i2]}$ A/m. The wave in $${ax} ${side > 0 ? `> ${p(d)}` : '< 0'}$ must be **${SHORT[want]}**.`,
      parts: [
        mcPart('\\psi', [o(psiOK), ...[0, 180, 90, -90].filter((x) => x !== psiOK).map(o)],
          [0, 180, 90, -90].filter((x) => x !== psiOK).map((x) => { const r = classify(crossParts(g, x, 90, side), k); return r === 'LIN' ? md`The relative phase on this side would be $${wrap(x + side * 90)}°$: linear.` : md`That gives ${SHORT[r]} on this side.`; })),
        mcPart(`\\text{Then the wave in }${ax} ${side > 0 ? '< 0' : `> ${p(d)}`}\\text{ is}`, [LAB[rO], LAB[rO[0] === 'R' ? 'LC' : 'RC'], LAB.LIN, LAB[rO[0] + 'E']],
          [md`Two sheets $\lambda/4$ apart flip the turn between the sides, and the travel flips too: the hand stays. (One sheet alone would give opposite hands.)`, md`On that side the relative phase is $\psi ${side > 0 ? '-' : '+'} 90° = ${wrap(psiOK - side * 90)}°$, not $0°$ or $180°$.`, md`Both parts have the same size on both sides: circular.`]),
        Object.assign(N(`\\langle S\\rangle\\text{ in }${ax} ${side > 0 ? `> ${p(d)}` : '< 0'}`, S, 'W/m²'), { traps: [{ v: S / 2, msg: 'That is one sheet only. Perpendicular parts add their powers.' }, { v: 2 * S, msg: 'Perpendicular waves never double each other’s field.' }] }),
        Object.assign(N('\\langle S\\rangle\\text{ there with sheet 2 switched off}', S / 2, 'W/m²'), { traps: [{ v: S, msg: 'Without sheet 2 only one part is left.' }] }),
      ],
      hints: [md`On the side $${ax} ${side > 0 ? '>' : '<'}$, the bracket is $\hat ${XYZ[g.i1]} + e^{j(\psi ${side > 0 ? '+' : '-'} 90°)}\hat ${XYZ[g.i2]}$.`, md`RHCP: $\mathbf a\times(-\mathbf b)$ along the travel $${kT(k)}$.`],
      sol: md`
        **Step 1.** $\lambda = ${p(F.lam)}$ m, $d = \lambda/4$, $\beta d = 90°$.

        **Step 2: the bracket on the asked side.** Travel $${kT(k)}$; sheet 2's part is ${side > 0 ? 'ahead by' : 'behind by'} $90°$ there:
        $$\hat ${XYZ[g.i1]} + e^{j(\psi ${side > 0 ? '+' : '-'} 90°)}\,\hat ${XYZ[g.i2]}$$
        **Step 3: choose $\psi$.** With $\psi = ${psiOK}°$ the bracket is $${jSum(crossParts(g, psiOK, 90, side))}$. ${ab(crossParts(g, psiOK, 90, side), k).txt}: ${SHORT[want]} ✓.

        **Step 4: the other side.** The relative phase is $${psiOK}° ${side > 0 ? '-' : '+'} 90°$, giving $${jSum(crossParts(g, psiOK, 90, -side))}$, and the travel is $${kT(other)}$. ${ab(crossParts(g, psiOK, 90, -side), other).txt}: **${SHORT[rO]}**, the same hand.

        **Step 5: power.** Each part sends $\frac{\eta_0}{8}|J|^2 = ${p(15 * J * J)}\pi$ W/m² each way; perpendicular parts add: $${f(S)}$ W/m². With sheet 2 off: $${f(S / 2)}$ W/m², with the same peak $|\mathbf E| = 60\pi(${p(J)})$ V/m. Circular carries twice the power at the same peak.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3
  GENS.w3_antenna_exam = () => {
    const g = geom(), F = pick(FREQ), J = pick([0.5, 1, 2]), up = pick([1, -1]), want = pick(['RC', 'LC']);
    const ax = XYZ[g.c], d = F.lam / 4, k = uv(g.c, up);
    const psi1 = up > 0 ? -90 : 90;                             // parallel pair radiating toward k
    const sh2 = [{ at: 0, parts: [cmp(g.i1, J, 0)] }, { at: d, parts: [cmp(g.i1, J, psi1)] }];
    const S = 60 * J * J * PI, Eq = vmag(fieldAt(sh2, g.c, d / 2, F.lam).E);
    const psi2 = [0, 180, 90, -90].find((ps) => classify(crossParts(g, ps, 90, up), k) === want);
    const rO = classify(crossParts(g, psi2, 90, -up), uv(g.c, -up));
    const o = (x) => `$${x}°$`;
    return {
      title: 'Exam problem: a two-sheet antenna, then a circular one',
      q: md`Two current sheets in free space at $f = ${F.f}$ MHz: sheet 1 on $${ax} = 0$ carries $\tilde{\mathbf J}_1 = ${p(J)}\,\hat ${XYZ[g.i1]}$ A/m; sheet 2 on $${ax} = d$ carries $\tilde{\mathbf J}_2 = ${p(J)}e^{j\psi}\,\hat ${XYZ[g.i1]}$ A/m, with $d$ a quarter wavelength. Parts (e) to (g) then turn sheet 2's current to $${p(J)}e^{j\psi'}\,\hat ${XYZ[g.i2]}$.`,
      parts: [
        N('(a)\\ d', d, 'm'),
        mcPart(`(b)\\ \\psi\\text{ so that nothing goes toward }${kT(uv(g.c, -up))}`, [o(psi1), o(-psi1), o(0), o(180)],
          [md`That cancels the other side: $\theta = \psi ${up > 0 ? '+' : '-'} 90°$ would be $180°$ on the side you want.`, md`In phase at $\lambda/4$: $\theta = \pm90°$ on both sides, $\sqrt2$ times one sheet each way.`, md`$\theta = 180° \pm 90°$: again $\sqrt2$ times one sheet each way.`]),
        Object.assign(N(`(c)\\ \\langle S\\rangle\\text{ toward }${kT(k)}`, S, 'W/m²'), { traps: [{ v: S / 4, msg: 'That is one sheet alone; the fields add, so the power is four times as much.' }] }),
        Object.assign(N(`(d)\\ |\\tilde{\\mathbf E}|\\text{ at }${ax} = d/2`, Eq, 'V/m'), { traps: [{ v: 120 * PI * J, msg: 'That is the field beyond the pair. Between, it grows as |sin|.' }] }),
        mcPart(`(e)\\ \\psi'\\text{ for ${SHORT[want]} toward }${kT(k)}`, [o(psi2), ...[0, 180, 90, -90].filter((x) => x !== psi2).map(o)],
          [0, 180, 90, -90].filter((x) => x !== psi2).map((x) => { const r = classify(crossParts(g, x, 90, up), k); return r === 'LIN' ? md`The relative phase there would be $${wrap(x + up * 90)}°$: linear.` : md`That gives ${SHORT[r]} toward $${kT(k)}$.`; })),
        mcPart(`(f)\\ \\text{Then the wave toward }${kT(uv(g.c, -up))}\\text{ is}`, [LAB[rO], LAB[rO[0] === 'R' ? 'LC' : 'RC'], LAB.LIN, 'nothing: it still cancels'],
          [md`Two sheets $\lambda/4$ apart: the turn flips between sides and so does the travel. The hand is the same.`, md`The relative phase there is $\psi' ${up > 0 ? '-' : '+'} 90°$, not $0°$ or $180°$.`, md`Perpendicular currents can never cancel each other.`]),
        Object.assign(N('(g)\\ \\text{total power delivered per m}^2\\text{ in the circular design}', 60 * J * J * PI, 'W/m²'), { traps: [{ v: 30 * J * J * PI, msg: 'That is one side. The circular design radiates both ways.' }] }),
      ],
      hints: [md`$\lambda = c/f$; $\beta d = 90°$; above $\theta = \psi + 90°$, below $\theta = \psi - 90°$.`, md`Perpendicular currents: the bracket on each side is $\hat ${XYZ[g.i1]} + e^{j(\psi'\pm90°)}\hat ${XYZ[g.i2]}$.`],
      sol: md`
        **(a)** $\lambda = c/f = ${p(F.lam)}$ m, so $d = \lambda/4 = ${p(d)}$ m.

        **(b)** Toward $${kT(uv(g.c, -up))}$ the bracket is $1 + e^{j(\psi ${up > 0 ? '-' : '+'} 90°)}$; it vanishes when $\psi ${up > 0 ? '-' : '+'} 90° = \pm180°$, so $\psi = ${psi1}°$. Then toward $${kT(k)}$, $\theta = 0$: the waves add. (The sheet the wave leaves past is the lagging one${up > 0 ? ', sheet 2' : ', sheet 1'}.)

        **(c)** $|\tilde{\mathbf E}| = 2\cdot60\pi(${p(J)}) = ${f(120 * PI * J)}$ V/m, so $\langle S\rangle = |\tilde{\mathbf E}|^2/240\pi = 60\pi(${p(J)})^2 = ${f(S)}$ W/m².

        **(d)** Between, $|\tilde{\mathbf E}| = \eta_0|J|\,|\sin\beta s|$ with $s$ measured from the idle sheet; at the midpoint $\beta s = 45°$: $${f(Eq)}$ V/m.

        **(e)** Toward $${kT(k)}$ the bracket is $\hat ${XYZ[g.i1]} + e^{j(\psi' ${up > 0 ? '+' : '-'} 90°)}\hat ${XYZ[g.i2]}$. With $\psi' = ${psi2}°$: $${jSum(crossParts(g, psi2, 90, up))}$. ${ab(crossParts(g, psi2, 90, up), k).txt}: ${SHORT[want]} ✓.

        **(f)** Toward $${kT(uv(g.c, -up))}$: $${jSum(crossParts(g, psi2, 90, -up))}$, ${ab(crossParts(g, psi2, 90, -up), uv(g.c, -up)).txt}: **${SHORT[rO]}**.

        **(g)** Perpendicular currents do not interact: each delivers $\frac{\eta_0}{4}|J|^2 = 30\pi(${p(J)})^2$, total $${f(60 * J * J * PI)}$ W/m², split equally between the two sides.

        **Speed path.** $\lambda/4$ and parallel: the lagging sheet points the beam. Crossed: relative phase $\psi'\pm90°$, then one cross product per side.

        **Where points go.** The sign of $\beta d$ on each side; "far side must be the opposite hand" (true for one sheet only); counting one side's power as the total.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank
  EM.BANK['w3-antenna'] = [
    Q(md`Why does a current sheet radiate only waves traveling **away** from it?`,
      ['The sheet is the only source; waves coming in from infinity would need another source', 'Waves cannot travel toward a conductor', 'The boundary conditions forbid incoming waves', 'Incoming waves would have negative power'], 0,
      [null, md`The sheet is not a conductor here; it is a given current in empty space.`, md`The boundary conditions alone would allow incoming waves; causality rules them out.`, md`An incoming wave carries positive power toward the sheet; it simply has no source.`],
      md`Lecture 19: causality. Like ripples from a pebble, the waves leave the source.`),
    Q(md`At a current sheet, the tangential $\mathbf H$…`,
      ['jumps by the surface current: $\\hat n\\times(\\mathbf H_1 - \\mathbf H_2) = \\mathbf J_s$', 'is continuous', 'is zero on both sides', 'doubles'], 0,
      [null, md`That is tangential $\mathbf E$. $\mathbf H$ jumps.`, md`It is $\mp J_s/2$ on the two sides, not zero.`, md`It flips direction across the sheet; its size is $|J_s|/2$ on each side.`],
      md`The jump is the surface current. With equal sizes on both sides, each side gets half.`),
    Q(md`At the plane of a radiating sheet, $\tilde{\mathbf E}$ and $\tilde{\mathbf J}_s$ are…`,
      ['antiparallel: $\\tilde{\\mathbf E} = -\\frac{\\eta}{2}\\tilde{\\mathbf J}_s$', 'parallel: $\\tilde{\\mathbf E} = +\\frac{\\eta}{2}\\tilde{\\mathbf J}_s$', 'perpendicular', 'unrelated'], 0,
      [null, md`Parallel would make $\mathbf J\cdot\mathbf E > 0$: the sheet would absorb power.`, md`$\mathbf E$ copies the current direction, with a minus sign.`, md`The boundary conditions fix $\tilde{\mathbf E}$ in terms of $\tilde{\mathbf J}_s$.`],
      md`A source drives current against the field: $-\mathbf J_s\cdot\mathbf E > 0$.`),
    Q(md`A sheet in free space carries $\tilde{\mathbf J}_s = 0.5\hat y$ A/m. $|\tilde{\mathbf E}|$ on either side is…`,
      ['$30\\pi\\approx94$ V/m', '$60\\pi\\approx188$ V/m', '$15\\pi$ V/m', '$0.5$ V/m'], 0,
      [null, md`That uses $\eta_0$ instead of $\eta_0/2$.`, md`That halves twice.`, md`That forgets $\eta$.`],
      md`$\frac{\eta_0}{2}(0.5) = 60\pi(0.5) = 30\pi$ V/m.`),
    Q(md`A sheet at $z = 2$ m radiates. For $z > 2$, the phase factor is…`,
      ['$e^{-j\\beta(z - 2)}$', '$e^{-j\\beta z}$', '$e^{+j\\beta(z - 2)}$', '$e^{-j\\beta(z + 2)}$'], 0,
      [null, md`That measures from the origin: the field at the sheet would not equal $-\frac{\eta}{2}\tilde{\mathbf J}_s$.`, md`That travels toward the sheet.`, md`The distance from the sheet is $z - 2$.`],
      md`The phase counts the distance from the sheet, so it is 1 at $z = 2$.`),
    Q(md`A sheet carries $\tilde{\mathbf J}_s = \hat x + \hat y$ A/m (in phase). The radiated waves are…`,
      ['linear on both sides, along $\\hat x + \\hat y$', 'circular', 'linear on one side and circular on the other', 'elliptical'], 0,
      [null, md`Circular needs a $90°$ phase between the parts.`, md`Both sides copy the same current.`, md`In-phase parts make a line, at any ratio of sizes.`],
      md`$\tilde{\mathbf E} = -\frac{\eta}{2}(\hat x + \hat y)e^{-j\beta|z|}$: a line at $45°$ (direction $-(\hat x + \hat y)$, the same line).`),
    Q(md`A single sheet sends RHCP toward $+\hat y$. Toward $-\hat y$ it sends…`,
      ['LHCP', 'RHCP', 'linear', 'nothing'], 0,
      [null, md`Same turn at a fixed point, opposite travel: opposite hand.`, md`The field is continuous at the sheet: both sides have the same shape.`, md`A sheet always radiates both ways equally.`],
      md`Lecture 24, Example 2.`),
    Q(md`Which current on $z = 0$ sends LHCP toward $+\hat z$?`,
      ['$\\hat x + j\\hat y$', '$\\hat x - j\\hat y$', '$\\hat x + \\hat y$', '$\\hat x + j2\\hat y$'], 0,
      [null, md`$\hat x - j\hat y$ turns $\hat x\to\hat y$: RHCP toward $+\hat z$.`, md`In phase: linear.`, md`Unequal parts: elliptical.`],
      md`$\hat x + j\hat y$ turns $\hat x\to-\hat y$, and $\hat x\times(-\hat y) = -\hat z$, against $+\hat z$: LHCP.`),
    Q(md`Two sheets $\lambda/2$ apart carry equal currents. Between them, where is $\mathbf E$ zero at all times?`,
      ['at both sheets', 'midway between them', 'nowhere', 'everywhere'], 0,
      [null, md`Midway, $\sin\beta z = \sin90° = 1$: the largest field.`, md`$\tilde E\propto\sin\beta z$ vanishes at $z = 0$ and $z = \lambda/2$.`, md`Only outside is it zero everywhere.`],
      md`$\tilde E = -j\eta J\sin\beta z$ (times the direction): nodes at the sheets, a maximum midway.`),
    Q(md`Two sheets $\lambda/2$ apart carry equal currents. How much power do they deliver?`,
      ['none', 'twice one sheet', 'the same as one sheet', 'four times one sheet'], 0,
      [null, md`Nothing leaves either side, so nothing can be delivered.`, md`The waves cancel outside.`, md`The fields at both sheets are zero, so $-\mathbf J\cdot\mathbf E = 0$.`],
      md`$\tilde{\mathbf E} = 0$ at both sheets, and outside: a pure standing wave between, with no average flow.`),
    Q(md`$|1 + e^{j\theta}|$ equals…`,
      ['$2|\\cos(\\theta/2)|$', '$2|\\sin(\\theta/2)|$', '$1 + |\\cos\\theta|$', '$\\sqrt2$ always'], 0,
      [null, md`At $\theta = 0$ that gives 0, but $1 + 1 = 2$.`, md`At $\theta = 180°$ it should be 0; this gives 2.`, md`It depends on $\theta$: 2 at $0°$, 0 at $180°$.`],
      md`$1 + e^{j\theta} = e^{j\theta/2}\cdot2\cos(\theta/2)$.`),
    Q(md`Above two sheets (sheet 2 at distance $d$ above sheet 1), sheet 2's wave is ahead of sheet 1's by…`,
      ['$\\psi + \\beta d$', '$\\psi - \\beta d$', '$\\beta d$', '$\\psi$'], 0,
      [null, md`That is below both sheets, where sheet 2 is farther away.`, md`The current's own phase $\psi$ adds too.`, md`The path difference $\beta d$ adds too.`],
      md`Sheet 2 is $d$ nearer to every point above, so its wave has $\beta d$ less phase delay, on top of its own lead $\psi$.`),
    Q(md`A quarter-wave pair of parallel sheets radiates only toward $+\hat z$. Sheet 2 (the upper one)…`,
      ['lags sheet 1 by $90°$', 'leads sheet 1 by $90°$', 'is in phase with sheet 1', 'is opposite to sheet 1'], 0,
      [null, md`Leading by $90°$ sends everything toward $-\hat z$.`, md`In phase gives $\sqrt2$ times one sheet both ways.`, md`Opposite also gives $\sqrt2$ times one sheet both ways.`],
      md`Above: $\theta = -90° + 90° = 0°$, double. Below: $-90° - 90° = -180°$, cancel.`),
    Q(md`In a one-way quarter-wave pair, the sheet that delivers no power is the one…`,
      ['the wave does not pass (the one on the dark side)', 'the wave passes last', 'with the leading current', 'neither: they each deliver half'], 0,
      [null, md`The one the wave passes last is the one that does all the work.`, md`For a pair radiating toward $+\hat z$ the leading sheet is sheet 1, which is the idle one; toward $-\hat z$ it is the reverse. "Leading" alone does not decide.`, md`The field at the idle sheet is exactly zero.`],
      md`At the idle sheet the other sheet's backward wave cancels its own field, so it feels $\mathbf E = 0$.`),
    Q(md`Two perpendicular currents $J\hat x$ and $Je^{j\psi}\hat y$ on two sheets. Can they cancel on one side?`,
      ['No: perpendicular fields never cancel', 'Yes, if $\\psi = 180°$', 'Yes, if the spacing is $\\lambda/2$', 'Yes, if $\\psi + \\beta d = 180°$'], 0,
      [null, md`$\hat x$ and $\hat y$ parts cannot cancel each other, whatever the phase.`, md`Spacing changes only the relative phase.`, md`That cancels parallel currents only.`],
      md`They only set the relative phase, which decides the shape and the hand.`),
    Q(md`Sheets $\lambda/4$ apart: $J\hat x$ on $z = 0$, $J\hat y$ on $z = \lambda/4$ ($\psi = 0$). The waves are…`,
      ['LHCP on both sides', 'RHCP on both sides', 'RHCP above, LHCP below', 'linear on both sides'], 0,
      [null, md`Above: $\hat x + j\hat y$, tip $\hat x\to-\hat y$, $-\hat z$, against $+\hat z$: left.`, md`That is the single-sheet pattern; two sheets $\lambda/4$ apart give the same hand.`, md`The relative phases are $\pm90°$: circular.`],
      md`Above: $\hat x + j\hat y$ (LHCP). Below: $\hat x - j\hat y$ with travel $-\hat z$: $\hat x\times\hat y = +\hat z$, against: LHCP.`),
    Q(md`HW 10 #4(d)'s lesson: a circular wave and a linear wave with the same peak $|\mathbf E|$ carry power in the ratio…`,
      ['2 : 1', '1 : 1', '1 : 2', '$\\sqrt2$ : 1'], 0,
      [null, md`The circle has two parts of that size; the line has one.`, md`The circle has more parts carrying power, not fewer.`, md`Power goes as the square of the fields: $A^2 + A^2$ versus $A^2$.`],
      md`Circular: $(A^2 + A^2)/2\eta$. Linear with peak $A$: $A^2/2\eta$.`),
    Q(md`Between two sheets carrying the same current, why can't you get $\mathbf H$ from $\hat k\times\tilde{\mathbf E}/\eta$ directly?`,
      ['There are two waves going opposite ways, each with its own $\\hat k$', 'Because $\\eta$ is different between the sheets', 'Because $\\mathbf H$ is zero there', 'You can; it gives the right answer'], 0,
      [null, md`The medium is the same everywhere.`, md`$\mathbf H$ must jump by the current at each sheet; it is not zero between.`, md`It would give $\mathbf H\propto\sin$ like $\mathbf E$, but the true $\mathbf H$ goes as $\cos$.`],
      md`Compute each wave's $\mathbf H$ with its own $\hat k$, then add.`),
    Q(md`A sheet in a good conductor is driven by $\tilde{\mathbf J}_s$. The launched field is…`,
      ['$-\\frac{\\eta}{2}\\tilde{\\mathbf J}_se^{-\\gamma|z|}$ with complex $\\eta$', '$-\\frac{\\eta_0}{2}\\tilde{\\mathbf J}_se^{-j\\beta|z|}$', 'zero: conductors do not carry waves', '$-\\eta\\tilde{\\mathbf J}_se^{-\\gamma|z|}$'], 0,
      [null, md`The medium's $\eta$ and $\gamma$ replace the free-space ones.`, md`It decays fast, but a wave is launched (SP24 #2).`, md`The jump is still shared between two sides: $\eta/2$.`],
      md`The same two boundary conditions, with $\gamma$ and complex $\eta$.`),
    Q(md`Two sheets in free space, $\lambda/4$ apart, parallel currents of amplitude 1 A/m, set to radiate one way. $\langle S\rangle$ on the bright side is…`,
      ['$60\\pi$ W/m²', '$15\\pi$ W/m²', '$30\\pi$ W/m²', '$120\\pi$ W/m²'], 0,
      [null, md`That is one sheet alone, one side.`, md`That adds powers. The fields add: $(2\cdot60\pi)^2/240\pi$.`, md`That would be a field of $120\sqrt2\,\pi$.`],
      md`$|\tilde{\mathbf E}| = \eta_0\cdot1 = 120\pi$; $\langle S\rangle = (120\pi)^2/240\pi = 60\pi$ W/m².`),
    Q(md`The formula sheet writes $\mathbf E = -\frac{\eta}{2}\mathbf J_s(t \mp z/v)$. In phasor form the delay $z/v$ becomes…`,
      ['the factor $e^{-j\\beta|z|}$', 'the factor $e^{-|z|/v}$', 'the factor $j\\omega z/v$', 'nothing: phasors have no delay'], 0,
      [null, md`A delay is a phase, not a decay.`, md`A delay multiplies by $e^{-j\omega\tau}$, not by $j\omega\tau$.`, md`A delay $\tau$ is the phase factor $e^{-j\omega\tau}$.`],
      md`$e^{-j\omega|z|/v} = e^{-j\beta|z|}$, since $\beta = \omega/v$.`),
  ];
})();

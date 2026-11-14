/* Topic 5: where gamma and eta come from (Lecture 22, formula sheet page 2). The whole derivation from Maxwell's curl
   equations, one line at a time: the two kinds of current and their ratio, phasors, the 1-D equations, the wave equation
   and gamma, what alpha and beta do, eta and its two relations, the angle tau, the exact alpha and beta.
   THE PACE OF THIS FILE IS THE PACE OF EVERY EXAM 3 LESSON: one display equation at a time, one small sentence saying
   what the next move is, nothing skipped, boxed results, a "does this make sense?" check, a prediction after each idea,
   worked examples, then a practice ladder (one move, whole quantities, exam length). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- figures
  const decayFig = () => PF.plot({
    w: 380, h: 180, x: [0, 3.2], y: [-1.25, 1.5], zero: true, xl: 'z', yl: 'E_x',
    xt: [[1, '1/\\alpha']], yt: [[1, 'E_0'], [-1, '-E_0']],
    curves: [
      { f: (z) => Math.exp(-z) * Math.cos(2 * Math.PI * z / 1.1), n: 500 },
      { f: (z) => Math.exp(-z), cls: 'dash', lab: 'E_0e^{-\\alpha z}', labAt: 1.55, dx: 8, dy: -12 },
      { f: (z) => -Math.exp(-z), cls: 'dash' },
    ],
  });
  // 1 - jR drawn in the complex plane: the right triangle that gives its size and angle
  function triFig() {
    const g = PF.fig({ alt: 'the complex number one minus j times the loss tangent: one along the real axis, the loss tangent down the imaginary axis, angle theta below the real axis' });
    const ox = 40, oy = 34, s = 150, h = 120;
    g.arrow(ox - 20, oy, ox + s + 40, oy, { cls: 'dim', hs: 7 });
    g.arrow(ox, oy + h + 26, ox, oy - 22, { cls: 'dim', hs: 7 });
    g.label(ox + s + 44, oy, '\\text{real}', 'l', 'small');
    g.label(ox + 6, oy - 22, '\\text{imaginary}', 'l', 'small');
    g.line(ox + s, oy, ox + s, oy + h, { cls: 'dash' });
    g.arrow(ox, oy, ox + s, oy + h, { cls: 'thick', hs: 9 });
    g.label(ox + s / 2, oy - 6, '1', 'b');
    g.label(ox + s + 8, oy + h / 2, '\\sigma/\\omega\\epsilon', 'l');
    g.angle(ox, oy, 44, -38.7, 0, '\\theta');
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  EM.lesson('w2', {
    id: 'w2-gamma', topic: 5, ref: 'Lecture 22', title: 'Where γ and η come from',
    steps: [
      RF(md`
        !!key Why you care
          Every Exam 3 has a wave in a lossy material. It is 30 of the 100 points on Prof. Chen's Spring 2024 paper. The formula sheet hands you $\gamma$ and $\eta$, but it does not tell you what they mean or why they look that way. In this lesson you build both from Maxwell's equations, one line at a time. After this, the top half of page 2 of the sheet will read like something you wrote yourself.

        ### Notation

        - $\sigma$: **conductivity**, in S/m. How easily charges flow in the material. Copper has about $6\times10^7$; seawater about 4; glass almost 0.
        - $\epsilon$, $\mu$: the material's permittivity and permeability. $\epsilon = \epsilon_r\epsilon_0$, $\mu = \mu_r\mu_0$.
        - $\omega = 2\pi f$: angular frequency, in rad/s. Be careful: the formulas use $\omega$, while problems often give $f$.
        - $\tilde E_x(z)$: the **phasor** of $E_x$, a complex number at each $z$ ([Topic 1](#/l/w1-phasor)). The tilde means phasor.
        - $\gamma = \alpha + j\beta$: the **propagation constant**, in 1/m. $\alpha$ (nepers/m) is decay; $\beta$ (rad/m) is phase.
        - $\eta = |\eta|e^{j\tau}$: the **intrinsic impedance**, in $\Omega$. Warning: this $\tau$ is an angle, not the transmission coefficient of Unit 4.

        ### 1. The one new thing: charges can move

        In a perfect dielectric an electric field cannot make free charges flow. In a material with conductivity $\sigma$ it can. Ohm's law, written at a point, says the field drives a current density
        $$\mathbf J = \sigma\mathbf E$$
        Now write Maxwell's two curl equations for this material, with $\mathbf J$ included. They are Faraday's law and Ampère's law:
        $$\nabla\times\mathbf E = -\mu\frac{\partial\mathbf H}{\partial t} \qquad\text{(1)}$$
        $$\nabla\times\mathbf H = \sigma\mathbf E + \epsilon\frac{\partial\mathbf E}{\partial t} \qquad\text{(2)}$$
        Look at the right side of (2). It has two terms, and this whole unit is about them.

        - $\sigma\mathbf E$ is the **conduction current**. Real charges move, they collide with the material, and the wave's energy becomes heat. This term is the loss.
        - $\epsilon\,\partial\mathbf E/\partial t$ is the **displacement current**. No charge travels. The field stores energy and hands it back. This term is what lets a wave propagate.

        Both of them make $\mathbf H$ curl. So a wave in a material is a **competition between two ways of carrying current**. Everything below is the mathematics of who wins.

        ### 2. Phasors turn time derivatives into $j\omega$

        Take one frequency $\omega$. Write the field as the real part of its phasor times $e^{j\omega t}$:
        $$E_x(z,t) = \Re\{\tilde E_x(z)\,e^{j\omega t}\}$$
        Differentiate in time. Only $e^{j\omega t}$ depends on $t$, and its derivative is $j\omega\,e^{j\omega t}$:
        $$\frac{\partial E_x}{\partial t} = \Re\{j\omega\tilde E_x\,e^{j\omega t}\}$$
        Compare the two lines. The phasor of $\partial E_x/\partial t$ is $j\omega\tilde E_x$. So in phasor form, $\partial/\partial t$ becomes multiplication by $j\omega$. Do that to (1) and (2):
        $$\nabla\times\tilde{\mathbf E} = -j\omega\mu\tilde{\mathbf H} \qquad\text{(3)}$$
        $$\nabla\times\tilde{\mathbf H} = \sigma\tilde{\mathbf E} + j\omega\epsilon\tilde{\mathbf E}$$
        Factor out $\tilde{\mathbf E}$ in the second one:
        $$\nabla\times\tilde{\mathbf H} = (\sigma + j\omega\epsilon)\tilde{\mathbf E} \qquad\text{(4)}$$

        The two currents now sit side by side inside one bracket. The conduction part $\sigma$ is real, so that current is in phase with $\mathbf E$. The displacement part $j\omega\epsilon$ is imaginary, so that current leads $\mathbf E$ by $90°$. How big is one compared with the other? Take the ratio of their sizes:
        $$\frac{|\text{conduction current}|}{|\text{displacement current}|} = \frac{\sigma|\tilde E|}{\omega\epsilon|\tilde E|}$$
        The field cancels:
        $$\boxed{\frac{|\text{conduction current}|}{|\text{displacement current}|} = \frac{\sigma}{\omega\epsilon}}$$
        This ratio is called the **loss tangent**. It is a plain number with no units. It is not a resistance. It simply tells you how many times larger the conduction current is than the displacement current:

        | $\sigma/\omega\epsilon$ | What it says |
        |---|---|
        | 0.01 | displacement current is 100 times larger: nearly a perfect dielectric |
        | 1 | the two currents are equal: an honest fight |
        | 100 | conduction current is 100 times larger: a good conductor |

        Notice the $\omega$ in the denominator. The same material can behave like a conductor at low frequency and like a dielectric at high frequency.
      `, {}),
      Q(md`**Predict.** At a point in a material, $E = 10\cos\omega t$ V/m, with $\sigma = 0.02$ S/m and $\omega\epsilon = 0.01$ S/m. What is the peak of the **total** current density?`,
        ['$0.224\\ \\text{A/m}^2$', '$0.3\\ \\text{A/m}^2$', '$0.2\\ \\text{A/m}^2$', '$0.1\\ \\text{A/m}^2$'], 0,
        [null, md`That adds the two peaks, $0.2 + 0.1$. They are $90°$ apart in time, so they never peak together. Add them as phasors.`, md`That is the conduction current alone. The displacement current is there too.`, md`That subtracts the peaks, or keeps only the displacement current. A $90°$ phase difference means neither.`],
        md`The conduction current has peak $\sigma E_0 = (0.02)(10) = 0.2\ \text{A/m}^2$. The displacement current has peak $\omega\epsilon E_0 = 0.1\ \text{A/m}^2$. As phasors they are $0.2$ and $j0.1$, $90°$ apart, so the total has size $\sqrt{0.2^2 + 0.1^2} = \sqrt{0.05} = 0.224\ \text{A/m}^2$.`),
      Q(md`**Predict.** A material has $\sigma/\omega\epsilon = 100$ at 1 MHz. Assume $\sigma$ and $\epsilon$ do not change with frequency. What is the ratio at 100 MHz?`,
        ['1', '100', '10,000', '0.01'], 0,
        [null, md`The ratio has $\omega$ in the denominator, so it must change with frequency.`, md`That multiplies by the frequency increase. Raising $\omega$ makes the displacement current bigger, so the ratio falls.`, md`That divides by $100^2$. The ratio goes as $1/\omega$, not $1/\omega^2$.`],
        md`$\sigma/\omega\epsilon \propto 1/\omega$. The frequency went up by 100, so the ratio goes down by 100: from 100 to 1. The material went from good conductor to an even contest.`),
      R(md`
        ### 3. Make it one-dimensional

        Take the plane wave you know from Exam 2: $\mathbf E$ along $\hat x$, $\mathbf H$ along $\hat y$, and everything depends only on $z$.
        $$\tilde{\mathbf E} = \hat x\,\tilde E_x(z), \qquad \tilde{\mathbf H} = \hat y\,\tilde H_y(z)$$
        We need the curl of each one. The $y$-component of a curl, from the sheet, is
        $$(\nabla\times\tilde{\mathbf E})_y = \frac{\partial\tilde E_x}{\partial z} - \frac{\partial\tilde E_z}{\partial x}$$
        There is no $\tilde E_z$, so the second term is zero. And $\tilde E_x$ depends only on $z$, so the partial derivative is an ordinary one:
        $$(\nabla\times\tilde{\mathbf E})_y = \frac{d\tilde E_x}{dz}$$
        Equation (3) says this equals the $y$-component of $-j\omega\mu\tilde{\mathbf H}$:
        $$\frac{d\tilde E_x}{dz} = -j\omega\mu\tilde H_y \qquad\text{(5)}$$
        Now the same thing for $\tilde{\mathbf H}$. The $x$-component of a curl is
        $$(\nabla\times\tilde{\mathbf H})_x = \frac{\partial\tilde H_z}{\partial y} - \frac{\partial\tilde H_y}{\partial z}$$
        There is no $\tilde H_z$. So only the second term is left, with its minus sign:
        $$(\nabla\times\tilde{\mathbf H})_x = -\frac{d\tilde H_y}{dz}$$
        Equation (4) says this equals $(\sigma + j\omega\epsilon)\tilde E_x$. Move the minus sign across:
        $$\frac{d\tilde H_y}{dz} = -(\sigma + j\omega\epsilon)\tilde E_x \qquad\text{(6)}$$
        Read (5) and (6) in words. How fast $\tilde E$ changes with distance depends on $\tilde H$. How fast $\tilde H$ changes with distance depends on $\tilde E$. Each one feeds the other as you move along $z$. That mutual feeding is the wave.
      `),
      Q(md`**Predict.** Redo the curl for a different polarization: $\tilde{\mathbf E} = \hat y\,\tilde E_y(z)$ and $\tilde{\mathbf H} = \hat x\,\tilde H_x(z)$. Equation (5) becomes…`,
        ['$d\\tilde E_y/dz = +j\\omega\\mu\\tilde H_x$', '$d\\tilde E_y/dz = -j\\omega\\mu\\tilde H_x$', '$d\\tilde E_y/dz = +j\\omega\\epsilon\\tilde H_x$', '$d\\tilde E_y/dz = -(\\sigma + j\\omega\\epsilon)\\tilde H_x$'], 0,
        [null, md`That copies (5). But $(\nabla\times\tilde{\mathbf E})_x = \partial\tilde E_z/\partial y - \partial\tilde E_y/\partial z$ has a minus sign on the term that survives, so the sign flips.`, md`Faraday's law brings $\mu$. The $\epsilon$ belongs to Ampère's law.`, md`The bracket $(\sigma + j\omega\epsilon)$ belongs to Ampère's law, equation (4).`],
        md`$(\nabla\times\tilde{\mathbf E})_x = -d\tilde E_y/dz$. Equation (3) sets this equal to $-j\omega\mu\tilde H_x$. Cancel the minus signs: $d\tilde E_y/dz = +j\omega\mu\tilde H_x$. The sign is different because this $\mathbf E$ and $\mathbf H$ need $\hat y\times\hat x = -\hat z$; the wave that travels toward $+z$ has $\tilde H_x = -\tilde E_y/\eta$.`),
      R(md`
        ### 4. The wave equation, and where γ appears

        We have two coupled equations. Get one equation with only $\tilde E_x$ in it.

        **Step 1.** Differentiate (5) with respect to $z$:
        $$\frac{d^2\tilde E_x}{dz^2} = -j\omega\mu\frac{d\tilde H_y}{dz}$$
        **Step 2.** Equation (6) tells us exactly what $d\tilde H_y/dz$ is. Substitute it:
        $$\frac{d^2\tilde E_x}{dz^2} = -j\omega\mu\,\bigl[-(\sigma + j\omega\epsilon)\tilde E_x\bigr]$$
        **Step 3.** The two minus signs cancel:
        $$\frac{d^2\tilde E_x}{dz^2} = j\omega\mu(\sigma + j\omega\epsilon)\tilde E_x$$
        **Step 4.** The coefficient on the right is one complex number. It does not depend on $z$. Give it a name:
        $$\gamma^2 \equiv j\omega\mu(\sigma + j\omega\epsilon)$$
        Now the wave equation reads
        $$\boxed{\frac{d^2\tilde E_x}{dz^2} = \gamma^2\tilde E_x}$$
        **Step 5.** What function has a second derivative equal to a constant times itself? An exponential. Try $e^{-\gamma z}$. The first derivative pulls down one factor of $-\gamma$:
        $$\frac{d}{dz}e^{-\gamma z} = -\gamma\,e^{-\gamma z}$$
        The second derivative pulls down another:
        $$\frac{d^2}{dz^2}e^{-\gamma z} = (-\gamma)(-\gamma)\,e^{-\gamma z} = \gamma^2e^{-\gamma z}$$
        That is what the equation asked for. The same steps show $e^{+\gamma z}$ works too. So the general solution is
        $$\tilde E_x(z) = E^+e^{-\gamma z} + E^-e^{+\gamma z}$$
        **Step 6.** Now put $\gamma$ into the form on your formula sheet. Pull $j\omega$ out of the bracket:
        $$\sigma + j\omega\epsilon = j\omega\left(\epsilon + \frac{\sigma}{j\omega}\right)$$
        Since $1/j = -j$, this is
        $$\sigma + j\omega\epsilon = j\omega\left(\epsilon - j\frac{\sigma}{\omega}\right)$$
        Multiply by the $j\omega\mu$ in front:
        $$\gamma^2 = j\omega\mu\cdot j\omega\left(\epsilon - j\frac{\sigma}{\omega}\right) = (j\omega)^2\,\mu\left(\epsilon - j\frac{\sigma}{\omega}\right)$$
        Take the square root:
        $$\boxed{\gamma = j\omega\sqrt{\mu\left(\epsilon - j\frac{\sigma}{\omega}\right)}}$$
        That is the line on the sheet.

        !!intuition Does this make sense?
          Set $\sigma = 0$. Then $\gamma = j\omega\sqrt{\mu\epsilon}$: purely imaginary, so $\alpha = 0$ and $\beta = \omega\sqrt{\mu\epsilon}$, exactly what you had on Exam 2. Conductivity does only one thing to the formula: it replaces the real $\epsilon$ with the complex number $\epsilon - j\sigma/\omega$. All of the loss lives in that one extra term.
      `),
      Q(md`**Predict.** Why must $\gamma$ have a factor of $j$ in the lossless case? If instead $\gamma$ were the real number $\omega\sqrt{\mu\epsilon}$, then $e^{-\gamma z}$ would be…`,
        ['a pure decay with no oscillation in $z$: not a wave', 'a wave with no decay', 'the same wave, since only $|\\gamma|$ matters', 'a wave traveling in $-z$ instead'], 0,
        [null, md`That is what the imaginary case gives: $e^{-j\beta z}$ has size 1 and turning phase. A real exponent has no phase.`, md`The real and imaginary parts of $\gamma$ do different jobs, so its angle matters as much as its size.`, md`Direction comes from the sign in the exponent. A real exponent has no phase to travel at all.`],
        md`$e^{-\gamma z}$ with real $\gamma$ only shrinks; nothing oscillates along $z$, and no pattern moves. A phase term $e^{-j\beta z}$ needs an imaginary part. Real part: decay. Imaginary part: propagation.`),
      RF(md`
        ### 5. What α and β do

        $\gamma$ is complex, so split it into real and imaginary parts. Both are real numbers, and we pick the square root that makes both of them positive:
        $$\gamma = \alpha + j\beta$$
        Then the exponential splits into two factors:
        $$e^{-\gamma z} = e^{-\alpha z}\,e^{-j\beta z}$$
        Take the forward wave, and write its constant as $E^+ = E_0e^{j\phi}$, a size and a starting phase:
        $$\tilde E_x(z) = E_0e^{j\phi}\,e^{-\alpha z}\,e^{-j\beta z}$$
        Go back to the time domain. Multiply by $e^{j\omega t}$ and collect the phases:
        $$\tilde E_x\,e^{j\omega t} = E_0e^{-\alpha z}\,e^{j(\omega t - \beta z + \phi)}$$
        $E_0e^{-\alpha z}$ is a real number, so it passes straight through the real part. The real part of $e^{j\theta}$ is $\cos\theta$:
        $$\boxed{E_x(z,t) = E_0\,e^{-\alpha z}\cos(\omega t - \beta z + \phi)}$$

        [[fig:decay]]

        Now each symbol has one job.

        | Symbol | Job | Consequence |
        |---|---|---|
        | $\alpha$ | shrinks the amplitude with distance | amplitude falls to $1/e \approx 37\%$ every $1/\alpha$ meters |
        | $\beta$ | turns the phase with distance | $\lambda = 2\pi/\beta$ and $v_p = \omega/\beta$ |

        The other solution $E^-e^{+\gamma z}$ gives $E_0e^{+\alpha z}\cos(\omega t + \beta z + \phi)$. Does it grow forever? No. It travels toward $-z$, so as it travels, $z$ decreases and $e^{+\alpha z}$ gets smaller. **Both waves shrink in the direction they travel.** That has to be true: the material can only take energy from a wave, never give it energy.

        Play with it. Slide the loss tangent from dielectric to conductor and watch $\alpha$ grow, the wavelength shrink, and $H$ slip behind $E$. The next section explains that slip.
      `, { decay: { svg: decayFig(), cap: 'A snapshot of the wave at one instant. The oscillation is cos(ωt − βz + φ). The dashed envelope is the decay, and the wave stays inside it as it moves.' } }),
      W3.damped(),
      Q(md`**Predict.** $E_x = 5e^{-2z}\cos(\omega t - 3z + 20°)$ V/m, with $z$ in meters. How far must the wave travel for its amplitude to fall from 5 V/m to about 1.84 V/m?`,
        ['0.5 m', '2 m', '$2\\pi/3$ m', '1.84 m'], 0,
        [null, md`That is $\alpha$ itself, in Np/m. The distance is $1/\alpha$.`, md`That is the wavelength $2\pi/\beta$. Decay is set by $\alpha$, not by $\beta$.`, md`That reuses the amplitude as a distance. Solve $5e^{-2z} = 1.84$.`],
        md`$1.84/5 = 0.368 = 1/e$. So $e^{-2z} = e^{-1}$, which gives $z = 1/2$ m. In general the amplitude falls by $1/e$ every $1/\alpha$ meters.`),
      RF(md`
        ### 6. Where η comes from

        $\eta$ is the ratio of $\tilde E$ to $\tilde H$ in one traveling wave. Take the forward wave alone:
        $$\tilde E_x = E^+e^{-\gamma z}$$
        Differentiating an exponential just pulls down its exponent's coefficient, so
        $$\frac{d\tilde E_x}{dz} = -\gamma\tilde E_x$$
        Equation (5) says the same derivative equals $-j\omega\mu\tilde H_y$. Set them equal:
        $$-\gamma\tilde E_x = -j\omega\mu\tilde H_y$$
        Cancel the minus signs and form the ratio:
        $$\frac{\tilde E_x}{\tilde H_y} = \frac{j\omega\mu}{\gamma}$$
        The right side has no $z$ in it. So the ratio is the same everywhere along the wave. That constant is the intrinsic impedance:
        $$\boxed{\eta \equiv \frac{\tilde E_x}{\tilde H_y} = \frac{j\omega\mu}{\gamma}}$$
        Multiply through by $\gamma$ and you have a line of the sheet:
        $$\boxed{\eta\gamma = j\omega\mu}$$
        Now put in the expression for $\gamma$:
        $$\eta = \frac{j\omega\mu}{j\omega\sqrt{\mu(\epsilon - j\sigma/\omega)}}$$
        The $j\omega$ cancels:
        $$\eta = \frac{\mu}{\sqrt{\mu}\,\sqrt{\epsilon - j\sigma/\omega}}$$
        And $\mu/\sqrt\mu = \sqrt\mu$:
        $$\boxed{\eta = \sqrt{\frac{\mu}{\epsilon - j\sigma/\omega}}}$$
        Set $\sigma = 0$ and you get $\sqrt{\mu/\epsilon}$, the $\eta$ from Exam 2. ✓

        **A second way to reach $\eta$.** Use (6) instead. For the forward wave, $\tilde H_y$ also goes as $e^{-\gamma z}$, so $d\tilde H_y/dz = -\gamma\tilde H_y$. Then (6) says
        $$-\gamma\tilde H_y = -(\sigma + j\omega\epsilon)\tilde E_x$$
        Form the ratio again:
        $$\frac{\tilde E_x}{\tilde H_y} = \frac{\gamma}{\sigma + j\omega\epsilon}$$
        This is $\eta$ too, so
        $$\boxed{\frac{\gamma}{\eta} = \sigma + j\omega\epsilon}$$
        Keep these two boxes together: $\eta\gamma = j\omega\mu$ and $\gamma/\eta = \sigma + j\omega\epsilon$. If you know $\gamma$ and $\eta$, they give you $\mu$, $\sigma$ and $\epsilon$ back. [Topic 6](#/l/w2-read) uses them to read a material from its wave.

        **The backward wave.** Now take $\tilde E_x = E^-e^{+\gamma z}$. This time the derivative pulls down $+\gamma$:
        $$\frac{d\tilde E_x}{dz} = +\gamma\tilde E_x$$
        Equation (5) gives $+\gamma\tilde E_x = -j\omega\mu\tilde H_y$, so
        $$\tilde H_y = -\frac{\gamma}{j\omega\mu}\tilde E_x = -\frac{\tilde E_x}{\eta}$$
        There is the $\pm$ on the sheet. Forward: $\tilde H_y = +\tilde E_x/\eta$. Backward: $\tilde H_y = -\tilde E_x/\eta$. It has to be this way: $\mathbf E\times\mathbf H$ must point along the direction of travel, so reversing the travel with the same $\mathbf E$ must reverse $\mathbf H$.
      `, {}),
      Q(md`**Predict.** A wave in a material has $\gamma = 2 + j2$ 1/m, and $\omega\mu = 400$. What is $\eta$?`,
        ['$100 + j100\\ \\Omega$', '$100 - j100\\ \\Omega$', '$200 + j200\\ \\Omega$', '$j100\\ \\Omega$'], 0,
        [null, md`Check it: $\gamma\eta$ must equal $j400$. $(2 + j2)(100 - j100) = 400$, which is real. The angle has to come out $90°$.`, md`That forgets to rationalize: $(2 + j2)(200 + j200) = j800$, twice too big.`, md`$(2 + j2)(j100) = -200 + j200$, which is not $j400$.`],
        md`$\eta = j\omega\mu/\gamma = j400/(2 + j2)$. Multiply top and bottom by $2 - j2$: the bottom is $4 + 4 = 8$, the top is $j400(2 - j2) = 800 + j800$. So $\eta = 100 + j100\ \Omega$. Check: $(2 + j2)(100 + j100) = 200 + j200 + j200 - 200 = j400$ ✓.`),
      RF(md`
        ### 7. The angle of η: why H falls behind E

        $\eta$ is complex in general, so write it as a size and an angle:
        $$\eta = |\eta|\,e^{j\tau}$$
        Let us find $\tau$. Square $\eta$ to remove the root, then pull $\epsilon$ out of the bottom:
        $$\eta^2 = \frac{\mu}{\epsilon - j\sigma/\omega} = \frac{\mu/\epsilon}{1 - j\sigma/\omega\epsilon}$$
        The loss tangent has appeared. The number $1 - j\sigma/\omega\epsilon$ is a point in the complex plane: 1 to the right, and $\sigma/\omega\epsilon$ down.

        [[fig:tri]]

        The picture is a right triangle. Pythagoras gives its size, and the angle is below the real axis:
        $$1 - j\frac{\sigma}{\omega\epsilon} = \sqrt{1 + \left(\frac{\sigma}{\omega\epsilon}\right)^2}\;e^{-j\theta}$$
        where the angle is
        $$\theta = \tan^{-1}\frac{\sigma}{\omega\epsilon}$$
        It is in the denominator of $\eta^2$, so its angle changes sign:
        $$\eta^2 = \frac{\mu/\epsilon}{\sqrt{1 + (\sigma/\omega\epsilon)^2}}\;e^{+j\theta}$$
        Taking the square root halves the angle, and turns the size into its square root:
        $$\eta = \frac{\sqrt{\mu/\epsilon}}{\left[1 + (\sigma/\omega\epsilon)^2\right]^{1/4}}\;e^{j\theta/2}$$
        So the angle of $\eta$ is half of $\theta$:
        $$\boxed{\tau = \frac12\tan^{-1}\frac{\sigma}{\omega\epsilon}}$$
        $\tan^{-1}$ runs from $0°$ to $90°$, so $\tau$ runs from $0°$ to $45°$. **It can never exceed $45°$.** And the size of $\eta$ is
        $$\boxed{|\eta| = \frac{\sqrt{\mu/\epsilon}}{\left[1 + (\sigma/\omega\epsilon)^2\right]^{1/4}}}$$
        which only gets smaller as the loss grows.

        **What the angle does.** Divide the phasor $\tilde E_x$ by $\eta = |\eta|e^{j\tau}$ to get $\tilde H_y$:
        $$\tilde H_y = \frac{\tilde E_x}{\eta} = \frac{E_0}{|\eta|}\,e^{j\phi}\,e^{-\gamma z}\,e^{-j\tau}$$
        Dividing by $e^{j\tau}$ subtracts $\tau$ from the phase. Back in the time domain, exactly as in Section 5:
        $$\boxed{H_y(z,t) = \frac{E_0}{|\eta|}\,e^{-\alpha z}\cos(\omega t - \beta z + \phi - \tau)}$$
        Compare with $E_x$. Same decay, same $\beta$, and an extra $-\tau$ in the phase. At any fixed point, $H$ reaches its peak a little later than $E$. **$H$ lags $E$ by $\tau$.**

        !!intuition Does this make sense?
          No loss: $\sigma = 0$, $\tau = 0$. $E$ and $H$ rise and fall together, which is Exam 2. Extreme loss: $\sigma/\omega\epsilon \to \infty$, so $\tan^{-1}\to 90°$ and $\tau \to 45°$. That is the good-conductor line on your sheet. In [Topic 8](#/l/w2-loss) you will see the power formula has $\cos\tau$ in it, so the lag also reduces how much power the wave carries for a given $E$ and $|\eta|$.
      `, { tri: { svg: triFig(), cap: 'The number 1 − jσ/ωε. Its size comes from Pythagoras, its angle θ from the triangle.' } }),
      Q(md`**Predict.** A material has $\sigma/\omega\epsilon = 1$ at the frequency of interest. What is $\tau$?`,
        ['$22.5°$', '$45°$', '$90°$', '$0°$'], 0,
        [null, md`$\tan^{-1}(1) = 45°$ is $\theta$. The square root in $\eta$ halves it.`, md`That would need the angle of $\eta$ to equal $\tan^{-1}$ of an infinite ratio, and then double it. $\tau$ never exceeds $45°$.`, md`$\tau = 0$ needs $\sigma = 0$.`],
        md`$\tau = \tfrac12\tan^{-1}(1) = \tfrac12(45°) = 22.5°$. Halving is the step people forget, because $\eta$ has a square root and $\eta^2$ does not.`),
      Q(md`**Predict.** $E_x = 6e^{-z}\cos(\omega t - 2z + 40°)$ V/m, and at this frequency $\eta = 30e^{j25°}\ \Omega$. Then $H_y$ is…`,
        ['$0.2e^{-z}\\cos(\\omega t - 2z + 15°)$ A/m', '$0.2e^{-z}\\cos(\\omega t - 2z + 65°)$ A/m', '$180e^{-z}\\cos(\\omega t - 2z + 65°)$ A/m', '$0.2\\cos(\\omega t - 2z + 15°)$ A/m'], 0,
        [null, md`That adds the angle of $\eta$. $\tilde H = \tilde E/\eta$, and dividing subtracts: $H$ lags $E$.`, md`That multiplies by $\eta$. $H$ is $E$ divided by $\eta$.`, md`$H$ decays exactly as $E$ does. The factor $e^{-z}$ cannot disappear.`],
        md`Amplitude: $6/30 = 0.2$. Phase: $40° - 25° = 15°$. Decay and $\beta$ stay the same: $H_y = 0.2e^{-z}\cos(\omega t - 2z + 15°)$ A/m. The sign is $+$ because the wave travels toward $+z$.`),
      R(md`
        ### 8. The exact α and β

        Sometimes you want $\alpha$ and $\beta$ as separate formulas. Square $\gamma = \alpha + j\beta$:
        $$\gamma^2 = \alpha^2 - \beta^2 + j2\alpha\beta$$
        And we know from Section 4 that
        $$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon) = -\omega^2\mu\epsilon + j\omega\mu\sigma$$
        Two complex numbers are equal only if their real parts match and their imaginary parts match. The real parts give
        $$\alpha^2 - \beta^2 = -\omega^2\mu\epsilon \qquad\text{(7)}$$
        We need one more relation. The size of $\gamma^2$ is $|\gamma|^2 = \alpha^2 + \beta^2$. The size of the right side comes from Pythagoras:
        $$\alpha^2 + \beta^2 = \sqrt{(\omega^2\mu\epsilon)^2 + (\omega\mu\sigma)^2}$$
        Factor $\omega^2\mu\epsilon$ out of the root:
        $$\alpha^2 + \beta^2 = \omega^2\mu\epsilon\sqrt{1 + \left(\frac{\sigma}{\omega\epsilon}\right)^2} \qquad\text{(8)}$$
        Two equations in $\alpha^2$ and $\beta^2$. Add (7) and (8), then divide by 2:
        $$\alpha^2 = \frac{\omega^2\mu\epsilon}{2}\left[\sqrt{1 + \left(\frac{\sigma}{\omega\epsilon}\right)^2} - 1\right]$$
        Subtract (7) from (8), then divide by 2:
        $$\beta^2 = \frac{\omega^2\mu\epsilon}{2}\left[\sqrt{1 + \left(\frac{\sigma}{\omega\epsilon}\right)^2} + 1\right]$$
        Take square roots, using $\omega\sqrt{\mu\epsilon}$ as the common piece:
        $$\boxed{\alpha = \omega\sqrt{\mu\epsilon}\;\sqrt{\tfrac12\left[\sqrt{1 + (\sigma/\omega\epsilon)^2} - 1\right]}}$$
        $$\boxed{\beta = \omega\sqrt{\mu\epsilon}\;\sqrt{\tfrac12\left[\sqrt{1 + (\sigma/\omega\epsilon)^2} + 1\right]}}$$
        These are not on your sheet, and you do not need to memorize them. The polar method below is faster for the numbers an exam without a calculator can use. But the derivation shows that everything depends on just two things: $\omega\sqrt{\mu\epsilon}$, the lossless answer, and $\sigma/\omega\epsilon$, the loss tangent.

        !!intuition Does this make sense?
          $\sigma = 0$ makes the bracket $\sqrt1 - 1 = 0$ in $\alpha$ and $\sqrt1 + 1 = 2$ in $\beta$. So $\alpha = 0$ and $\beta = \omega\sqrt{\mu\epsilon}$. ✓ As the loss grows, both grow, and $\beta$ is always larger than $\alpha$.

        ### The method

        !!method From the material to the wave: $\mu$, $\epsilon$, $\sigma$, $\omega$ in; $\gamma$, $\eta$ out
          1. **Lossless first.** Compute $k = \omega\sqrt{\mu\epsilon}$ and $\eta_i = \sqrt{\mu/\epsilon}$.
          2. **Loss tangent.** Compute $\sigma/\omega\epsilon$. Use $\omega$, not $f$, and the material's $\epsilon$, not $\epsilon_0$.
          3. **Polar form.** Write $1 - j\sigma/\omega\epsilon = \rho\,e^{-j\theta}$, with $\rho = \sqrt{1 + (\sigma/\omega\epsilon)^2}$ and $\theta = \tan^{-1}(\sigma/\omega\epsilon)$.
          4. **Assemble.** $\gamma = jk\sqrt\rho\,e^{-j\theta/2}$ and $\eta = (\eta_i/\sqrt\rho)\,e^{+j\theta/2}$.
          5. **Split.** $\gamma = \sqrt\rho\,k\,e^{j(90° - \theta/2)}$, so $\alpha$ and $\beta$ are its real and imaginary parts, and $\tau = \theta/2$.
          6. **Check.** $|\gamma||\eta| = \omega\mu$, and the two angles add to $90°$. This is $\eta\gamma = j\omega\mu$, and it takes ten seconds.

        ### Worked example 1: a loss tangent of $\sqrt3$

        !!graded Problem
          A medium has $\mu = \mu_0$, $\epsilon = 4\epsilon_0$, $\sigma = \sqrt3/(30\pi)$ S/m. A wave at $\omega = 3\times10^8$ rad/s has $E_x(0,t) = 10\cos\omega t$ V/m and travels toward $+z$. Find $\gamma$, $\eta$, $E_x(z,t)$ and $H_y(z,t)$.

        **Step 1: the lossless numbers.** The speed with no loss would be $v = c/\sqrt{\epsilon_r} = c/2 = 1.5\times10^8$ m/s. So
        $$k = \omega\sqrt{\mu\epsilon} = \frac{\omega}{v} = \frac{3\times10^8}{1.5\times10^8} = 2\ \text{rad/m}$$
        And the lossless impedance is
        $$\eta_i = \sqrt{\frac{\mu}{\epsilon}} = \frac{\eta_0}{\sqrt{\epsilon_r}} = \frac{120\pi}{2} = 60\pi\ \Omega$$
        **Step 2: the loss tangent.** First the displacement term, using $\epsilon_0 = \frac{1}{36\pi}\times10^{-9}$:
        $$\omega\epsilon = (3\times10^8)(4)\frac{10^{-9}}{36\pi} = \frac{1}{30\pi}\ \text{S/m}$$
        Now the ratio:
        $$\frac{\sigma}{\omega\epsilon} = \frac{\sqrt3/(30\pi)}{1/(30\pi)} = \sqrt3$$
        **Step 3: polar form.** The triangle has legs 1 and $\sqrt3$, so its hypotenuse is 2 and its angle is $60°$:
        $$1 - j\sqrt3 = 2\,e^{-j60°}$$
        **Step 4: γ.** The square root of a polar number takes the root of its size and half of its angle:
        $$\gamma = jk\sqrt{2\,e^{-j60°}} = j2\cdot\sqrt2\,e^{-j30°}$$
        Write $j$ as $e^{j90°}$ and add the angles:
        $$\gamma = 2\sqrt2\,e^{j60°}$$
        Convert to rectangular form:
        $$\gamma = 2\sqrt2\left(\tfrac12 + j\tfrac{\sqrt3}{2}\right) = \sqrt2 + j\sqrt6\ \ \text{1/m}$$
        So $\alpha = \sqrt2 \approx 1.41$ Np/m and $\beta = \sqrt6 \approx 2.45$ rad/m.

        **Step 5: η.** Divide $\eta_i$ by the square root of the same polar number:
        $$\eta = \frac{60\pi}{\sqrt2\,e^{-j30°}} = \frac{60\pi}{\sqrt2}\,e^{+j30°} \approx 133\,e^{j30°}\ \Omega$$
        **Step 6: check.** The sizes: $|\gamma||\eta| = (2\sqrt2)(60\pi/\sqrt2) = 120\pi$. And $\omega\mu = (3\times10^8)(4\pi\times10^{-7}) = 120\pi$. ✓ The angles: $60° + 30° = 90°$. ✓

        **Step 7: the fields.** $E_0 = 10$ and $\phi = 0$, and the wave goes toward $+z$:
        $$E_x = 10\,e^{-\sqrt2\,z}\cos(\omega t - \sqrt6\,z)\ \text{V/m}$$
        with $\omega = 3\times10^8$ rad/s. The amplitude of $H$ is $10/|\eta| = 10/133 = 0.075$ A/m, and its phase is $\tau = 30°$ behind:
        $$H_y = 0.075\,e^{-\sqrt2\,z}\cos(\omega t - \sqrt6\,z - 30°)$$
        in A/m.

        ### Worked example 2: the same medium, traveling the other way

        !!graded Problem
          The same medium and frequency, but now the wave travels toward $-z$, with $E_x(0,t) = 10\cos\omega t$ V/m. Write $E_x(z,t)$ and $H_y(z,t)$.

        **Step 1.** The medium has not changed, so $\alpha$, $\beta$, $|\eta|$ and $\tau$ have not changed.

        **Step 2.** Travel toward $-z$ means the exponent is $e^{+\gamma z}$. So $e^{+\alpha z}$ and $+\beta z$:
        $$E_x = 10\,e^{+\sqrt2\,z}\cos(\omega t + \sqrt6\,z)\ \text{V/m}$$
        **Step 3.** The backward wave has $\tilde H_y = -\tilde E_x/\eta$. So the amplitude gets a minus sign, and the phase still lags by $\tau$:
        $$H_y = -0.075\,e^{+\sqrt2\,z}\cos(\omega t + \sqrt6\,z - 30°)$$
        in A/m.
        **Check.** At $z = 0$ and with the phase ignored, $E$ is along $+\hat x$ and $H$ along $-\hat y$. $\hat x\times(-\hat y) = -\hat z$: the travel direction. ✓ And $e^{+\sqrt2z}$ shrinks as $z$ decreases, so the wave shrinks as it travels. ✓

        ### Worked example 3: when the triangle is 3-4-5

        !!graded Problem
          $\mu = \mu_0$, $\epsilon = 9\epsilon_0$, $\sigma/\omega\epsilon = 3/4$, $\omega = 4\times10^8$ rad/s. Find $\alpha$, $\beta$, $|\eta|$ and $\tau$ without a calculator (a 3-4-5 triangle makes the root exact).

        **Step 1: lossless numbers.** $v = c/3 = 10^8$ m/s, so $k = \omega/v = 4$ rad/m. And $\eta_i = 120\pi/3 = 40\pi\ \Omega$.

        **Step 2: the root that appears everywhere.**
        $$\sqrt{1 + \left(\tfrac34\right)^2} = \sqrt{\tfrac{25}{16}} = \tfrac54$$
        **Step 3: the exact formulas from Section 8.** For $\alpha$:
        $$\alpha = 4\sqrt{\tfrac12\left(\tfrac54 - 1\right)} = 4\sqrt{\tfrac18} = \sqrt2 \approx 1.41\ \text{Np/m}$$
        For $\beta$:
        $$\beta = 4\sqrt{\tfrac12\left(\tfrac54 + 1\right)} = 4\sqrt{\tfrac98} = 3\sqrt2 \approx 4.24\ \text{rad/m}$$
        **Step 4: η.** The size:
        $$|\eta| = \frac{40\pi}{\sqrt{5/4}} = 80\pi/\sqrt5 \approx 112\ \Omega$$
        The angle, with $\tan^{-1}(3/4) \approx 36.9°$:
        $$\tau = \tfrac12(36.9°) \approx 18.4°$$
        **Check.** $\gamma = \sqrt2 + j3\sqrt2$ has size $\sqrt{2 + 18} = \sqrt{20} = 4.47$ and angle $\tan^{-1}3 = 71.6°$. Then $(4.47)(112) = 501 \approx \omega\mu = 160\pi = 503$ ✓ and $71.6° + 18.4° = 90°$ ✓.

        ### The whole topic on one table

        | Quantity | Formula | Where it came from |
        |---|---|---|
        | Loss tangent | $\sigma/\omega\epsilon$ | conduction current over displacement current |
        | $\gamma^2$ | $j\omega\mu(\sigma + j\omega\epsilon)$ | combine (5) and (6) |
        | $\eta$ | $j\omega\mu/\gamma = \gamma/(\sigma + j\omega\epsilon)$ | put $e^{-\gamma z}$ in (5) or (6) |
        | $\tau$ | $\tfrac12\tan^{-1}(\sigma/\omega\epsilon)$ | polar form of $1 - j\sigma/\omega\epsilon$, then a square root |
        | $E_x$ forward | $E_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)$ | real part of the phasor |
        | $H_y$ forward | $(E_0/|\eta|)e^{-\alpha z}\cos(\omega t - \beta z + \phi - \tau)$ | $\tilde H = \tilde E/\eta$ |
        | $H_y$ backward | $-(E_0/|\eta|)e^{+\alpha z}\cos(\omega t + \beta z + \phi - \tau)$ | $\tilde H = -\tilde E/\eta$ |

        !!mistake Common mistakes
          - **Forgetting to halve the angle.** $\tan^{-1}(\sigma/\omega\epsilon)$ is the angle of $\eta^2$. $\tau$ is half of it, so it never exceeds $45°$.
          - **Using $f$ for $\omega$** in the loss tangent. That is off by a factor of $2\pi$.
          - **Using $\epsilon_0$ for $\epsilon$.** The loss tangent uses the material's $\epsilon = \epsilon_r\epsilon_0$.
          - **Adding $\tau$ instead of subtracting.** $H$ **lags** $E$: its phase is $\phi - \tau$.
          - **Dropping the decay from $H$.** $H$ shrinks exactly as $E$ does.
          - **Forgetting the minus sign for a backward wave.** $\tilde H_y = -\tilde E_x/\eta$ when $\tilde E_x$ goes as $e^{+\gamma z}$.
          - **Mixing up $\alpha$ and $1/\alpha$.** $\alpha$ is in Np/m; the distance for a $1/e$ drop is $1/\alpha$ meters.

        ### Check questions
      `),
      Q(md`Which line is on the formula sheet and follows directly from putting $e^{-\gamma z}$ into Faraday's law?`,
        ['$\\eta\\gamma = j\\omega\\mu$', '$\\gamma/\\eta = j\\omega\\mu$', '$\\eta/\\gamma = \\sigma + j\\omega\\epsilon$', '$\\eta\\gamma = \\sigma + j\\omega\\epsilon$'], 0,
        [null, md`$\gamma/\eta$ comes from Ampère's law and equals $\sigma + j\omega\epsilon$.`, md`That has the ratio upside down: it is $\gamma/\eta$ that equals $\sigma + j\omega\epsilon$.`, md`The product goes with Faraday's law, which has $\mu$. The material terms $\sigma$ and $\epsilon$ come with the ratio.`],
        md`Faraday's law in phasors is (5): $d\tilde E_x/dz = -j\omega\mu\tilde H_y$. With $e^{-\gamma z}$ it gives $\gamma\tilde E_x = j\omega\mu\tilde H_y$, so $\eta\gamma = j\omega\mu$.`),
      Q(md`If $\sigma$ is doubled at fixed $\omega$, $\epsilon$, $\mu$, what happens to $|\eta|$?`,
        ['It decreases', 'It increases', 'It stays the same', 'It doubles'], 0,
        [null, md`$|\eta| = \sqrt{\mu/\epsilon}/[1 + (\sigma/\omega\epsilon)^2]^{1/4}$: the denominator grows with $\sigma$.`, md`$\sigma$ is in the formula, in the denominator.`, md`Doubling $\sigma$ raises the denominator, so $|\eta|$ falls. At large $\sigma$ it falls as $1/\sqrt\sigma$.`],
        md`More conduction current means more $\mathbf H$ per unit $\mathbf E$, so the ratio $|\tilde E/\tilde H|$ falls.`),
      Q(md`In a lossy material at a fixed point, $E_x$ peaks at $t = 0$. When does $H_y$ of the forward wave peak?`,
        ['At $t = \\tau/\\omega$, a little later', 'At $t = 0$', 'At $t = -\\tau/\\omega$, a little earlier', 'A quarter period later, always'], 0,
        [null, md`That would need $\tau = 0$, which means no loss.`, md`That is $H$ leading. The phase of $H$ is $\phi - \tau$, so $H$ lags.`, md`A quarter period is $90°$. The lag is $\tau$, which is at most $45°$.`],
        md`$\cos(\omega t - \beta z + \phi - \tau)$ peaks when the argument is 0, so $\omega t = \beta z - \phi + \tau$, later by $\tau/\omega$ than $E$.`),
      Q(md`The two terms in $\gamma^2 = -\omega^2\mu\epsilon + j\omega\mu\sigma$ come from…`,
        ['the displacement current and the conduction current, in that order', 'the conduction current and the displacement current, in that order', 'the electric and the magnetic energy', 'the forward and the backward waves'], 0,
        [null, md`$\sigma$ carries the conduction current, and it sits in the imaginary term.`, md`Energy is not in this equation; it comes from combining the two curl equations.`, md`Both waves have the same $\gamma$. The two terms are from the bracket $\sigma + j\omega\epsilon$.`],
        md`$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon)$. Distribute: $j\omega\mu\cdot j\omega\epsilon = -\omega^2\mu\epsilon$ is the displacement term, and $j\omega\mu\cdot\sigma$ is the conduction term.`),
      Q(md`A wave has $\gamma = 3 + j4$ 1/m. What are its $1/e$ distance and its wavelength?`,
        ['$1/3$ m and $\\pi/2$ m', '$1/4$ m and $2\\pi/3$ m', '$3$ m and $4$ m', '$1/5$ m and $2\\pi/5$ m'], 0,
        [null, md`That swaps $\alpha$ and $\beta$. $\alpha$ is the real part, 3.`, md`Those are $\alpha$ and $\beta$ themselves. The distances are $1/\alpha$ and $2\pi/\beta$.`, md`That uses $|\gamma| = 5$. Decay and phase use the real and imaginary parts separately.`],
        md`$\alpha = 3$ gives $1/\alpha = 1/3$ m. $\beta = 4$ gives $\lambda = 2\pi/4 = \pi/2$ m.`),
      Q(md`Which statement is always true of the forward wave in any material with $\sigma > 0$?`,
        ['$\\beta > \\alpha$ and $0 < \\tau < 45°$', '$\\beta = \\alpha$ and $\\tau = 45°$', '$\\alpha > \\beta$ and $\\tau > 45°$', '$\\beta = \\omega\\sqrt{\\mu\\epsilon}$ exactly'], 0,
        [null, md`That is only the limit of an extremely good conductor, reached but never quite passed.`, md`The exact formulas give $\beta^2 - \alpha^2 = \omega^2\mu\epsilon > 0$, and $\tau$ is half of an angle below $90°$.`, md`Loss raises $\beta$ above $\omega\sqrt{\mu\epsilon}$; only $\sigma = 0$ gives exactly that.`],
        md`Equation (7) says $\beta^2 - \alpha^2 = \omega^2\mu\epsilon$, which is positive. And $\theta = \tan^{-1}(\sigma/\omega\epsilon)$ lies strictly between $0°$ and $90°$, so $\tau = \theta/2$ lies strictly between $0°$ and $45°$.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** do the lossless numbers first, then look at the loss tangent. Each card asks for one move. Answer in about 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_g_move', { need: 8 }), { id: 'w2-gamma.r0' }),
      R(md`
        ### Practice, level 1: read the angle

        **The trick:** $\theta = \tan^{-1}(\sigma/\omega\epsilon)$ from the triangle; $\tau = \theta/2$; $\gamma$'s angle is $90° - \tau$. The three triangles worth knowing: $1$ and $\sqrt3$ give $60°$; $1$ and $1$ give $45°$; $\sqrt3$ and $1$ give $30°$.
      `),
      Object.assign(G('rf_g_angle', { need: 8 }), { id: 'w2-gamma.r1' }),
      R(md`
        ### Practice, level 1: decay and wavelength

        **The trick:** the amplitude factor is $e^{-\alpha\cdot\text{distance}}$, $\lambda = 2\pi/\beta$, $v_p = \omega/\beta$. The wave is written for you; just read it.
      `),
      Object.assign(G('rf_g_read', { need: 8 }), { id: 'w2-gamma.r2' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('g_polar', { need: 2 }),
      G('g_exact', { need: 2 }),
      G('g_fromgamma', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        Start from the material, end with both fields written out, with the right signs.
      `),
      G('g_fields', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- level 1, one move
  const opt = (x) => `$${p(+x.toPrecision(3))}$`;
  GENS.rf_g_move = () => one([
    // the ratio of currents, with a frequency change
    () => {
      const r0 = pick([0.01, 0.1, 1, 10, 100]), k = pick([10, 100, 1000]), up = pick([true, false]);
      const r = up ? r0 / k : r0 * k;
      return MC('Loss tangent and frequency', md`A material has $\sigma/\omega\epsilon = ${p(r0)}$ at some frequency. With $\sigma$ and $\epsilon$ fixed, the frequency is ${up ? 'raised' : 'lowered'} by a factor of ${k}. The ratio becomes…`, opt(r),
        [[opt(up ? r0 * k : r0 / k), md`That moves it the wrong way. $\omega$ is in the denominator.`], [opt(r0), md`The ratio has $\omega$ in it, so it must change.`], [opt(up ? r0 / (k * k) : r0 * k * k), md`It goes as $1/\omega$, not $1/\omega^2$.`]],
        md`$\sigma/\omega\epsilon\propto1/\omega$. ${up ? 'Raising' : 'Lowering'} the frequency by ${k} ${up ? 'divides' : 'multiplies'} the ratio by ${k}: $${p(r)}$.`);
    },
    // sizes of the two currents
    () => {
      const E0 = pick([2, 5, 10, 20]), s = pick([0.01, 0.02, 0.05, 0.1, 0.5]), we = pick([0.01, 0.02, 0.05, 0.1, 0.5]);
      const ask = pick(['c', 'd']);
      const val = ask === 'c' ? s * E0 : we * E0, other = ask === 'c' ? we * E0 : s * E0;
      return MC('The two currents', md`$E = ${E0}\cos\omega t$ V/m at a point, with $\sigma = ${s}$ S/m and $\omega\epsilon = ${we}$ S/m. The peak **${ask === 'c' ? 'conduction' : 'displacement'}** current density, in A/m², is…`, opt(val),
        [[opt(other), md`That is the other current. Conduction goes with $\sigma$; displacement goes with $\omega\epsilon$.`], [opt(Math.hypot(s, we) * E0), md`That is the total of the two, added at $90°$.`], [opt(val / E0), md`That left out the field: multiply by $E_0 = ${E0}$.`], [opt((s + we) * E0), md`That is the two peaks added. They are also not the current asked about.`]],
        md`${ask === 'c' ? md`$J_c = \sigma E_0 = (${s})(${E0})$` : md`$|J_d| = \omega\epsilon E_0 = (${we})(${E0})$`} $= ${p(+val.toPrecision(3))}$ A/m².`);
    },
    // symbolic: which relation
    () => {
      const [q, r, w, s] = pick([
        [md`The product $\eta\gamma$ equals…`, '$j\\omega\\mu$', [['$\\sigma + j\\omega\\epsilon$', md`That is the ratio $\gamma/\eta$.`], ['$j\\omega\\epsilon$', md`Faraday's law brings $\mu$, not $\epsilon$.`], ['$\\omega\\sqrt{\\mu\\epsilon}$', md`That is the lossless $\beta$.`]], md`Put $e^{-\gamma z}$ into Faraday's law: $\gamma\tilde E = j\omega\mu\tilde H$.`],
        [md`The ratio $\gamma/\eta$ equals…`, '$\\sigma + j\\omega\\epsilon$', [['$j\\omega\\mu$', md`That is the product $\eta\gamma$.`], ['$\\sigma$', md`Only its real part is $\sigma$.`], ['$j\\omega\\epsilon$', md`That is true only when $\sigma = 0$.`]], md`Put $e^{-\gamma z}$ into Ampère's law: $\gamma\tilde H = (\sigma + j\omega\epsilon)\tilde E$.`],
        [md`With $\sigma = 0$, $\gamma$ equals…`, '$j\\omega\\sqrt{\\mu\\epsilon}$', [['$\\omega\\sqrt{\\mu\\epsilon}$', md`A real $\gamma$ would only decay and never oscillate.`], ['$\\sqrt{\\mu/\\epsilon}$', md`That is the lossless $\eta$.`], ['$0$', md`The wave still has phase, so $\beta$ is not zero.`]], md`$\gamma = j\omega\sqrt{\mu(\epsilon - j0)} = j\omega\sqrt{\mu\epsilon}$.`],
        [md`The complex $\epsilon$ that hides all of the loss is…`, '$\\epsilon - j\\sigma/\\omega$', [['$\\epsilon + j\\sigma/\\omega$', md`Check it: $j\omega(\epsilon + j\sigma/\omega) = j\omega\epsilon - \sigma$. The sign of $\sigma$ came out wrong.`], ['$\\epsilon - j\\omega\\sigma$', md`Units: $\sigma/\omega$ has the units of $\epsilon$. $\omega\sigma$ does not.`], ['$\\sigma - j\\omega\\epsilon$', md`That has the wrong units, and $\sigma$ and $\epsilon$ swapped.`]], md`$j\omega(\epsilon - j\sigma/\omega) = j\omega\epsilon + \sigma$. ✓`],
        [md`For the backward wave $\tilde E_x = E^-e^{+\gamma z}$, $\tilde H_y$ equals…`, '$-\\tilde E_x/\\eta$', [['$+\\tilde E_x/\\eta$', md`That is the forward wave. The derivative now gives $+\gamma$, which flips the sign.`], ['$-\\eta\\tilde E_x$', md`$H$ is $E$ divided by $\eta$, not multiplied.`], ['$-\\tilde E_x/\\eta^*$', md`No conjugate appears. Conjugates come in only when computing power.`]], md`Faraday: $+\gamma\tilde E_x = -j\omega\mu\tilde H_y$, so $\tilde H_y = -\tilde E_x/\eta$.`],
      ]);
      return MC('Which relation?', q, r, w, s);
    },
    // lossless numbers
    () => {
      const er = pick([4, 9, 16, 25]), wv = pick([1, 2, 3]) * 1e8;
      const n = Math.sqrt(er), v = 3e8 / n, k = wv / v;
      return one([
        () => MC('Lossless β', md`$\mu = \mu_0$, $\epsilon = ${er}\epsilon_0$, $\omega = ${wv / 1e8}\times10^8$ rad/s. Then $k = \omega\sqrt{\mu\epsilon}$ is…`, `$${p(+k.toPrecision(3))}$ rad/m`,
          [[`$${p(+(wv / 3e8).toPrecision(3))}$ rad/m`, md`That uses the free-space speed $c$. The wave is slower here: $v = c/${n}$.`], [`$${p(+(k * n).toPrecision(3))}$ rad/m`, md`That uses $\epsilon_r$ where $\sqrt{\epsilon_r}$ belongs.`], [`$${p(+(k * 2 * Math.PI).toPrecision(3))}$ rad/m`, md`That has an extra $2\pi$. $\omega$ is already in rad/s.`]],
          md`$v = c/\sqrt{\epsilon_r} = ${p(v)}$ m/s, so $k = \omega/v = ${p(+k.toPrecision(3))}$ rad/m.`),
        () => MC('Lossless η', md`$\mu = \mu_0$ and $\epsilon = ${er}\epsilon_0$. Then $\sqrt{\mu/\epsilon}$ is…`, `$${p(120 / n)}\\pi\\ \\Omega$`,
          [[`$${p(120 * n)}\\pi\\ \\Omega$`, md`A larger $\epsilon$ lowers the impedance, so divide by $\sqrt{\epsilon_r}$.`], [`$${p(+(120 / er).toPrecision(3))}\\pi\\ \\Omega$`, md`That divides by $\epsilon_r$. The formula has its square root.`], ['$120\\pi\\ \\Omega$', md`That is free space. The material has $\epsilon_r = ${er}$.`]],
          md`$\sqrt{\mu/\epsilon} = \eta_0/\sqrt{\epsilon_r} = 120\pi/${n} = ${p(120 / n)}\pi\ \Omega$.`),
      ]);
    },
  ]);

  // ---------------------------------------------------------------- level 1, the angle
  const TRI = [
    { R: '\\tfrac{1}{\\sqrt3}', v: 1 / Math.sqrt(3), th: 30 },
    { R: '1', v: 1, th: 45 },
    { R: '\\sqrt3', v: Math.sqrt(3), th: 60 },
  ];
  GENS.rf_g_angle = () => one([
    () => {
      const t = pick(TRI), s = t.th / 2;
      return MC('τ from the loss tangent', md`$\sigma/\omega\epsilon = ${t.R}$. Then $\tau$ is…`, `$${s}°$`,
        [[`$${t.th}°$`, md`That is $\tan^{-1}(\sigma/\omega\epsilon)$. The square root in $\eta$ halves it.`], [`$${90 - s}°$`, md`That is the angle of $\gamma$, not of $\eta$.`], [`$${t.th === 45 ? 90 : 90 - t.th}°$`, md`That is the other acute angle of the triangle, or a doubled $\theta$. Use $\tan\theta = \sigma/\omega\epsilon$, then halve it.`], ['$0°$', md`That needs $\sigma = 0$.`]],
        md`$\theta = \tan^{-1}(${t.R}) = ${t.th}°$, and $\tau = \theta/2 = ${s}°$.`);
    },
    () => {
      const t = pick(TRI), s = t.th / 2;
      return MC('Angle of γ', md`$\sigma/\omega\epsilon = ${t.R}$. The angle of $\gamma$ is…`, `$${90 - s}°$`,
        [[`$${s}°$`, md`That is $\tau$, the angle of $\eta$. The angles of $\gamma$ and $\eta$ add to $90°$.`], [`$${90 - t.th}°$`, md`The root halves $\theta$ before you add it to the $90°$ from $j$: $90° - \theta/2$.`], ['$90°$', md`That is the lossless case. Loss takes some of the angle away.`], ['$45°$', md`$\gamma$ reaches $45°$ only in the limit of a good conductor.`]],
        md`$\gamma = j\,k\sqrt{\rho}\,e^{-j\theta/2}$, with $\theta = ${t.th}°$. The $j$ gives $90°$, and the root gives $-${s}°$. So the angle is $${90 - s}°$. Check: $(${90 - s}°) + (${s}°) = 90°$.`);
    },
    () => {
      const tau = pick([15, 22.5, 30]), R0 = Math.tan(2 * tau * Math.PI / 180);
      const lab = { 15: '\\tfrac{1}{\\sqrt3}', 22.5: '1', 30: '\\sqrt3' }[tau];
      return MC('Loss tangent from τ', md`A wave has $\tau = ${tau}°$. Then $\sigma/\omega\epsilon$ is…`, `$${lab}$`,
        TRI.filter((t) => t.R !== lab).map((t) => [`$${t.R}$`, md`$\tan(2\tau) = \tan(${2 * tau}°)$, which is not this. Double $\tau$ first, then take the tangent.`]).concat([[`$${p(+Math.tan(tau * Math.PI / 180).toPrecision(3))}$`, md`That is $\tan\tau$. The formula has $\tan(2\tau)$, since $\tau$ is half of $\tan^{-1}(\sigma/\omega\epsilon)$.`]]),
        md`$\tau = \tfrac12\tan^{-1}(\sigma/\omega\epsilon)$ means $\sigma/\omega\epsilon = \tan(2\tau) = \tan(${2 * tau}°) = ${lab} \approx ${p(+R0.toPrecision(3))}$.`);
    },
    () => {
      const a = pick([10, 20, 30, 40]), e = pick([0, 20, 40, 60]);
      const lagged = e - a;
      return MC('The phase of H', md`$E_x$ has phase $${e}°$ in its cosine and $\eta = |\eta|e^{j${a}°}$. For the forward wave, the phase of $H_y$ is…`, `$${lagged}°$`,
        [[`$${e + a}°$`, md`That adds the angle of $\eta$. $\tilde H = \tilde E/\eta$ subtracts it: $H$ lags.`], [`$${e}°$`, md`That is true only for $\tau = 0$. This $\eta$ has an angle.`], [`$${a}°$`, md`That is the angle of $\eta$ alone. It is subtracted from $E$'s phase.`]],
        md`Dividing by $e^{j${a}°}$ subtracts $${a}°$: $${e}° - ${a}° = ${lagged}°$.`);
    },
    () => {
      const t = pick(TRI);
      const rho = Math.hypot(1, t.v);
      return MC('Size of 1 − jσ/ωε', md`$\sigma/\omega\epsilon = ${t.R}$. The size of $1 - j\sigma/\omega\epsilon$ is…`, `$${p(+rho.toPrecision(3))}$`,
        [[`$${p(+(1 + t.v).toPrecision(3))}$`, md`That adds the legs. A size needs Pythagoras.`], [`$${p(+(1 + t.v * t.v).toPrecision(3))}$`, md`That is the size squared. Take the root.`], [`$${p(+Math.sqrt(rho).toPrecision(3))}$`, md`That is its square root: what appears in $\gamma$ and $\eta$. The question asks for the size itself.`]],
        md`$\sqrt{1^2 + (${t.R})^2} = ${p(+rho.toPrecision(3))}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1, read a wave
  GENS.rf_g_read = () => {
    const a = pick([1, 2, 3, 4, 5, 10]), b = pick([2, 3, 4, 5, 6, 8]), E0 = pick([2, 5, 10, 20]), wv = pick([1, 2, 3, 6]);
    const wave = md`E_x = ${E0}\,e^{-${a}z}\cos(${wv}\times10^8t - ${b}z)\ \text{V/m}`;
    return one([
      () => {
        const d = pick([1, 2, 3]);
        const dist = d / a;
        return MC('Amplitude down the line', md`$${wave}$, with $z$ in meters. The amplitude at $z = ${p(+dist.toPrecision(3))}$ m is…`, `$${E0}\\,e^{-${d}}$ V/m`,
          [[`$${E0}\\,e^{-${d + 1}}$ V/m`, md`Multiply $\alpha$ by the distance: $(${a})(${p(+dist.toPrecision(3))}) = ${d}$.`], [`$${E0}$ V/m`, md`The amplitude shrinks with $z$. The factor $e^{-\alpha z}$ cannot be dropped.`], [`$${p(+(E0 * Math.cos(b * dist)).toPrecision(2))}$ V/m`, md`That uses the cosine. Amplitude means the envelope, $E_0e^{-\alpha z}$.`]],
          md`The amplitude is $E_0e^{-\alpha z}$, with $\alpha z = (${a})(${p(+dist.toPrecision(3))}) = ${d}$: $${E0}e^{-${d}}$ V/m.`);
      },
      () => MC('Wavelength', md`$${wave}$. The wavelength is…`, `$${p(+(2 * Math.PI / b).toPrecision(3))}$ m`,
        [[`$${p(+(2 * Math.PI / a).toPrecision(3))}$ m`, md`That uses $\alpha$. The wavelength comes from $\beta = ${b}$.`], [`$${p(+(1 / b).toPrecision(3))}$ m`, md`That left out the $2\pi$: $\lambda = 2\pi/\beta$.`], [`$${p(+(2 * Math.PI * b).toPrecision(3))}$ m`, md`$\lambda = 2\pi/\beta$. A larger $\beta$ means a shorter wave.`]],
        md`$\beta = ${b}$ rad/m, so $\lambda = 2\pi/\beta = ${p(+(2 * Math.PI / b).toPrecision(3))}$ m.`),
      () => MC('Phase speed', md`$${wave}$. The phase speed is…`, `$${p(wv * 1e8 / b)}$ m/s`,
        [[`$${p(wv * 1e8 / a)}$ m/s`, md`That uses $\alpha$. Phase speed is $\omega/\beta$.`], [`$${p(wv * 1e8 * b)}$ m/s`, md`Divide, do not multiply: $v_p = \omega/\beta$.`], ['$3\\times10^8$ m/s', md`That is $c$. In a material, $v_p = \omega/\beta$.`]],
        md`$v_p = \omega/\beta = (${wv}\times10^8)/${b} = ${p(wv * 1e8 / b)}$ m/s.`),
      () => MC('1/e distance', md`$${wave}$. The amplitude falls to $1/e$ of its value in a distance of…`, `$${p(+(1 / a).toPrecision(3))}$ m`,
        [[`$${a}$ m`, md`$\alpha$ itself is in Np/m. The distance is $1/\alpha$.`], [`$${p(+(1 / b).toPrecision(3))}$ m`, md`That uses $\beta$. Decay is $\alpha$.`], [`$${p(+(2 * Math.PI / a).toPrecision(3))}$ m`, md`No $2\pi$ here: $e^{-\alpha z} = e^{-1}$ at $z = 1/\alpha$.`]],
        md`$e^{-${a}z} = e^{-1}$ at $z = 1/${a} = ${p(+(1 / a).toPrecision(3))}$ m.`),
    ]);
  };

  // ---------------------------------------------------------------- level 2 and 3
  // the lossless numbers for a chosen medium and frequency
  const medium = () => {
    const er = pick([1, 4, 9, 16]), k = pick([1, 2, 3, 4, 6, 8]);
    const n = Math.sqrt(er), v = 3e8 / n, w = k * v, etai = 120 * Math.PI / n;
    return { er, n, k, v, w, etai };
  };
  const wTex = (w) => p(+w.toPrecision(4));
  const solveM = (m, Rv) => {
    const rho = Math.hypot(1, Rv), th = Math.atan(Rv);
    const gm = m.k * Math.sqrt(rho), ga = Math.PI / 2 - th / 2;
    return { rho, th, a: gm * Math.cos(ga), b: gm * Math.sin(ga), gm, gd: ga * 180 / Math.PI, em: m.etai / Math.sqrt(rho), td: th / 2 * 180 / Math.PI };
  };

  GENS.g_polar = () => {
    const m = medium(), t = pick(TRI), s = solveM(m, t.v);
    return {
      title: 'From the material to γ and η',
      q: md`A medium has $\mu = \mu_0$, $\epsilon = ${m.er}\epsilon_0$, and at $\omega = ${wTex(m.w)}$ rad/s its loss tangent is $\sigma/\omega\epsilon = ${t.R}$. Find $\alpha$, $\beta$, $|\eta|$ and $\tau$.`,
      parts: [
        Object.assign(N('\\alpha', s.a, 'Np/m'), { traps: [{ v: s.b, msg: 'That is β. α is the real part of γ, the smaller of the two.' }] }),
        Object.assign(N('\\beta', s.b, 'rad/m'), { traps: [{ v: s.a, msg: 'That is α. β is the imaginary part of γ.' }] }),
        Object.assign(N('|\\eta|', s.em, 'Ω'), { traps: [{ v: m.etai, msg: 'That is the lossless impedance. Divide it by the square root of the size of 1 − jσ/ωε.' }, { v: m.etai / s.rho, msg: 'That divides by the full size of 1 − jσ/ωε. η has a square root, so divide by the root of that size.' }] }),
        Object.assign(N('\\tau', s.td, '°'), { traps: [{ v: s.th * 180 / Math.PI, msg: 'That is the angle of η². Halve it.' }] }),
      ],
      hints: [md`Lossless first: $k = \omega\sqrt{\mu\epsilon} = \omega\sqrt{\epsilon_r}/c$ and $\eta_i = 120\pi/\sqrt{\epsilon_r}$.`, md`Write $1 - j\sigma/\omega\epsilon$ in polar form. Then $\gamma = jk\sqrt\rho\,e^{-j\theta/2}$ and $\eta = (\eta_i/\sqrt\rho)\,e^{j\theta/2}$.`],
      sol: md`
        **Step 1: the lossless numbers.**
        $$v = \frac{c}{\sqrt{\epsilon_r}} = ${p(m.v)}\ \text{m/s}, \qquad k = \frac{\omega}{v} = ${m.k}\ \text{rad/m}, \qquad \eta_i = \frac{120\pi}{${m.n}} = ${f(m.etai)}\ \Omega$$
        **Step 2: polar form of the loss term.** The triangle has legs 1 and $${t.R}$:
        $$1 - j${t.R} = ${f(s.rho)}\,e^{-j${t.th}°}$$
        **Step 3: γ.** The root takes the root of the size and half the angle. The $j$ adds $90°$:
        $$\gamma = jk\sqrt{${f(s.rho)}\,e^{-j${t.th}°}} = (${m.k})(${f(Math.sqrt(s.rho))})\,e^{j(90° - ${t.th / 2}°)} = ${f(s.gm)}\,e^{j${f(s.gd)}°}$$
        **Step 4: split γ.**
        $$\alpha = ${f(s.gm)}\cos(${f(s.gd)}°) = ${f(s.a)}\ \text{Np/m}, \qquad \beta = ${f(s.gm)}\sin(${f(s.gd)}°) = ${f(s.b)}\ \text{rad/m}$$
        **Step 5: η.**
        $$\eta = \frac{${f(m.etai)}}{${f(Math.sqrt(s.rho))}\,e^{-j${t.th / 2}°}} = ${f(s.em)}\,e^{j${t.th / 2}°}\ \Omega$$
        So $|\eta| = ${f(s.em)}\ \Omega$ and $\tau = ${t.th / 2}°$.

        **Check.** $|\gamma||\eta| = (${f(s.gm)})(${f(s.em)}) = ${f(s.gm * s.em)}$, and $\omega\mu = (${wTex(m.w)})(4\pi\times10^{-7}) = ${f(m.w * EM.mu0)}$ ✓. Angles: $${f(s.gd)}° + ${t.th / 2}° = 90°$ ✓.
      `,
    };
  };

  // Pythagorean triangles make the exact formulas come out by hand
  const PY = [
    { R: '\\tfrac34', v: 3 / 4, h: '\\tfrac54', hv: 5 / 4 },
    { R: '\\tfrac43', v: 4 / 3, h: '\\tfrac53', hv: 5 / 3 },
    { R: '\\tfrac{5}{12}', v: 5 / 12, h: '\\tfrac{13}{12}', hv: 13 / 12 },
    { R: '\\tfrac{12}{5}', v: 12 / 5, h: '\\tfrac{13}{5}', hv: 13 / 5 },
  ];
  GENS.g_exact = () => {
    const m = medium(), t = pick(PY), s = solveM(m, t.v);
    return {
      title: 'The exact formulas, with a clean triangle',
      q: md`A medium has $\mu = \mu_0$, $\epsilon = ${m.er}\epsilon_0$, and at $\omega = ${wTex(m.w)}$ rad/s, $\sigma/\omega\epsilon = ${t.R}$. Use the exact formulas for $\alpha$ and $\beta$. (Here $\sqrt{1 + (\sigma/\omega\epsilon)^2}$ comes out exact.)`,
      parts: [N('\\alpha', s.a, 'Np/m'), N('\\beta', s.b, 'rad/m'), N('\\text{the }1/e\\text{ distance}', 1 / s.a, 'm'), N('\\lambda', 2 * Math.PI / s.b, 'm')],
      hints: [md`$k = \omega\sqrt{\mu\epsilon} = ${m.k}$ rad/m.`, md`$\alpha = k\sqrt{\tfrac12(\sqrt{1 + (\sigma/\omega\epsilon)^2} - 1)}$. The $\beta$ formula has $+1$.`],
      sol: md`
        **Step 1: the lossless number.** $v = c/${m.n} = ${p(m.v)}$ m/s, so $k = \omega/v = ${m.k}$ rad/m.

        **Step 2: the root.**
        $$\sqrt{1 + \left(${t.R}\right)^2} = ${t.h}$$
        **Step 3: α.**
        $$\alpha = ${m.k}\sqrt{\tfrac12\left(${t.h} - 1\right)} = ${f(s.a)}\ \text{Np/m}$$
        **Step 4: β.**
        $$\beta = ${m.k}\sqrt{\tfrac12\left(${t.h} + 1\right)} = ${f(s.b)}\ \text{rad/m}$$
        **Step 5: the distances.**
        $$\frac{1}{\alpha} = ${f(1 / s.a)}\ \text{m}, \qquad \lambda = \frac{2\pi}{\beta} = ${f(2 * Math.PI / s.b)}\ \text{m}$$
        **Check.** Equation (7) says $\beta^2 - \alpha^2 = k^2$: $(${f(s.b)})^2 - (${f(s.a)})^2 = ${f(s.b * s.b - s.a * s.a)}$, and $k^2 = ${m.k * m.k}$ ✓.
      `,
    };
  };

  // given gamma and omega mu, get eta and the rest by complex division
  GENS.g_fromgamma = () => {
    const [a, b] = pick([[1, 1], [3, 4], [4, 3], [1, 2], [2, 3], [1, 3], [2, 2]]);
    const wm = pick([50, 100, 200, 500, 1000]);
    const g2 = a * a + b * b;
    const er = wm * b / g2, ei = wm * a / g2;  // eta = j wm (a - jb)/(a^2+b^2) = wm (b + ja)/g2
    return {
      title: 'η from γ, by complex division',
      q: md`A wave has $\gamma = ${a} + j${b}$ 1/m, and at this frequency $\omega\mu = ${wm}\ \Omega$/m. Find $\eta$ in rectangular form, then its size and $\tau$.`,
      parts: [
        N('\\text{Re}\\,\\eta', er, 'Ω'),
        N('\\text{Im}\\,\\eta', ei, 'Ω'),
        N('|\\eta|', Math.hypot(er, ei), 'Ω'),
        Object.assign(N('\\tau', Math.atan2(ei, er) * 180 / Math.PI, '°'), { traps: [{ v: Math.atan2(b, a) * 180 / Math.PI, msg: 'That is the angle of γ. The angle of η is what is left of 90°.' }] }),
      ],
      hints: [md`$\eta = j\omega\mu/\gamma$.`, md`Multiply top and bottom by the conjugate of $\gamma$, $${a} - j${b}$.`],
      sol: md`
        **Step 1: the formula.**
        $$\eta = \frac{j\omega\mu}{\gamma} = \frac{j${wm}}{${a} + j${b}}$$
        **Step 2: multiply top and bottom by the conjugate.** The bottom becomes $${a}^2 + ${b}^2 = ${g2}$:
        $$\eta = \frac{j${wm}(${a} - j${b})}{${g2}}$$
        **Step 3: multiply out the top.** $j\cdot(-j) = +1$:
        $$\eta = \frac{${wm * b} + j${wm * a}}{${g2}} = ${f(er)} + j${f(ei)}\ \Omega$$
        **Step 4: polar form.**
        $$|\eta| = \sqrt{(${f(er)})^2 + (${f(ei)})^2} = ${f(Math.hypot(er, ei))}\ \Omega, \qquad \tau = \tan^{-1}\frac{${f(ei)}}{${f(er)}} = ${f(Math.atan2(ei, er) * 180 / Math.PI)}°$$
        **Check.** The angle of $\gamma$ is $\tan^{-1}(${b}/${a}) = ${f(Math.atan2(b, a) * 180 / Math.PI)}°$. Added to $\tau$ it gives $90°$ ✓.
      `,
    };
  };

  GENS.g_fields = () => {
    const m = medium(), t = pick(TRI), s = solveM(m, t.v);
    const E0 = pick([5, 10, 20, 50]), ph = pick([0, 30, 45, 60]), fwd = pick([true, false]);
    const sg = fwd ? '-' : '+', H0 = E0 / s.em, ps = ph - t.th / 2;
    const phT = (x) => (x === 0 ? '' : x > 0 ? ` + ${x}°` : ` - ${-x}°`);
    return {
      title: 'Both fields, from the material',
      q: md`A medium has $\mu = \mu_0$, $\epsilon = ${m.er}\epsilon_0$, $\sigma/\omega\epsilon = ${t.R}$ at $\omega = ${wTex(m.w)}$ rad/s. A wave travels toward **${fwd ? '$+z$' : '$-z$'}** with $E_x(0,t) = ${E0}\cos(\omega t${phT(ph)})$ V/m and $\mathbf H$ along $\pm\hat y$. Write down $H_y(z,t)$: find its coefficient (with its sign), its phase at $z = 0$, and the value of the decay exponent and the phase term.`,
      parts: [
        Object.assign(N('H_y\\text{ coefficient (signed)}', fwd ? H0 : -H0, 'A/m'), { traps: [{ v: fwd ? -H0 : H0, msg: 'Check the sign. Forward: H̃ = +Ẽ/η. Backward: H̃ = −Ẽ/η.' }, { v: (fwd ? 1 : -1) * E0 / m.etai, msg: 'That uses the lossless impedance. Use |η| in this material.' }] }),
        Object.assign(N('\\text{phase of }H_y\\text{ at }z = 0', ps, '°'), { traps: [{ v: ph + t.th / 2, msg: 'H lags E. Subtract τ, do not add it.' }, { v: ph - t.th, msg: 'τ is half of tan⁻¹(σ/ωε).' }] }),
        N('\\alpha', s.a, 'Np/m'),
        N('\\beta', s.b, 'rad/m'),
      ],
      hints: [md`Do the method: lossless numbers, polar form, $\gamma$, $\eta$.`, md`${fwd ? 'Forward' : 'Backward'} wave: $\tilde H_y = ${fwd ? '+' : '-'}\tilde E_x/\eta$, so the coefficient is $${fwd ? '+' : '-'}E_0/|\eta|$ and the phase is $\phi - \tau$.`],
      sol: md`
        **Step 1: lossless numbers.** $k = ${m.k}$ rad/m and $\eta_i = ${f(m.etai)}\ \Omega$.

        **Step 2: polar form.** $1 - j${t.R} = ${f(s.rho)}\,e^{-j${t.th}°}$.

        **Step 3: γ and η.**
        $$\gamma = (${m.k})(${f(Math.sqrt(s.rho))})\,e^{j${f(s.gd)}°}, \quad\text{so}\quad \alpha = ${f(s.a)}\ \text{Np/m},\ \ \beta = ${f(s.b)}\ \text{rad/m}$$
        $$\eta = \frac{${f(m.etai)}}{${f(Math.sqrt(s.rho))}}\,e^{j${t.th / 2}°} = ${f(s.em)}\,e^{j${t.th / 2}°}\ \Omega$$
        **Step 4: E.** The wave travels toward ${fwd ? '$+z$' : '$-z$'}, so the exponent is $e^{${fwd ? '-' : '+'}\gamma z}$:
        $$E_x = ${E0}\,e^{${sg}${f(s.a)}z}\cos(\omega t ${sg} ${f(s.b)}z${phT(ph)})$$
        in V/m.
        **Step 5: H.** The size is $E_0/|\eta| = ${E0}/${f(s.em)} = ${f(H0)}$ A/m. The phase is $${ph}° - ${t.th / 2}° = ${ps}°$. The sign is ${fwd ? '$+$ for a forward wave' : '$-$ for a backward wave'}:
        $$H_y = ${fwd ? '' : '-'}${f(H0)}\,e^{${sg}${f(s.a)}z}\cos(\omega t ${sg} ${f(s.b)}z${phT(ps)})$$
        in A/m.
        **Check.** At a moment when both cosines are positive, $\mathbf E\times\mathbf H$ is $\hat x\times(${fwd ? '+' : '-'}\hat y) = ${fwd ? '+' : '-'}\hat z$, the direction of travel ✓. And the wave shrinks in the direction it goes ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank
  EM.BANK['w2-gamma'] = [
    Q(md`In $\nabla\times\tilde{\mathbf H} = (\sigma + j\omega\epsilon)\tilde{\mathbf E}$, the real part of the bracket stands for…`,
      ['conduction current, in phase with $\\mathbf E$', 'displacement current, in phase with $\\mathbf E$', 'conduction current, leading $\\mathbf E$ by $90°$', 'displacement current, lagging $\\mathbf E$ by $90°$'], 0,
      [null, md`Displacement current is the imaginary part, $j\omega\epsilon$. It leads $\mathbf E$ by $90°$.`, md`Real means in phase. Leading by $90°$ is what the factor $j$ does.`, md`$+j$ means a lead of $90°$, not a lag, and it is the imaginary part in any case.`],
      md`$\sigma$ is real: $\mathbf J_c = \sigma\mathbf E$ is in phase with $\mathbf E$.`),
    Q(md`The loss tangent $\sigma/\omega\epsilon$ is best described as…`,
      ['the ratio of conduction current to displacement current', 'the resistance of the material', 'the ratio of magnetic energy to electric energy', 'the wave\'s attenuation in Np/m'], 0,
      [null, md`It has no units, so it cannot be a resistance.`, md`Energy in the two fields has nothing to do with the formula: it is two current terms in Ampère's law.`, md`$\alpha$ has units of 1/m. This ratio has none.`],
      md`$|\sigma\tilde E|/|\omega\epsilon\tilde E| = \sigma/\omega\epsilon$.`),
    Q(md`Seawater has $\sigma = 4$ S/m and $\epsilon_r = 81$. As the frequency goes up, seawater acts…`,
      ['less like a conductor', 'more like a conductor', 'the same, since $\\sigma$ is fixed', 'like a conductor only above some frequency'], 0,
      [null, md`The ratio $\sigma/\omega\epsilon$ falls as $\omega$ rises.`, md`What counts is $\sigma/\omega\epsilon$, which depends on $\omega$.`, md`Backwards: it is a conductor at low frequency.`],
      md`$\sigma/\omega\epsilon\propto1/\omega$: raising $f$ makes displacement current grow until it wins.`),
    Q(md`$1/j$ equals…`,
      ['$-j$', '$j$', '$1$', '$-1$'], 0,
      [null, md`$j\cdot j = -1$, so $1/j$ can't be $j$.`, md`$j\cdot1 = j \neq 1$.`, md`$j\cdot(-1) = -j \neq 1$.`],
      md`$j\cdot(-j) = -j^2 = +1$, so $1/j = -j$. This is the step that turns $\epsilon + \sigma/j\omega$ into $\epsilon - j\sigma/\omega$.`),
    Q(md`The wave equation in a lossy medium is $d^2\tilde E_x/dz^2 = \gamma^2\tilde E_x$. Which is **not** a solution?`,
      ['$\\tilde E_x = \\cos(\\gamma z)$', '$\\tilde E_x = e^{-\\gamma z}$', '$\\tilde E_x = e^{+\\gamma z}$', '$\\tilde E_x = 3e^{-\\gamma z} + 2e^{+\\gamma z}$'], 0,
      [null, md`Differentiate twice: $\gamma^2e^{-\gamma z}$. It solves the equation.`, md`Differentiate twice: $\gamma^2e^{+\gamma z}$. It solves the equation.`, md`Any combination of solutions also solves a linear equation.`],
      md`$d^2\cos(\gamma z)/dz^2 = -\gamma^2\cos(\gamma z)$. The sign is wrong. Only exponentials give $+\gamma^2$.`),
    Q(md`Why do we choose the square root of $\gamma^2$ with $\alpha > 0$ for $e^{-\gamma z}$?`,
      ['So that the wave traveling toward $+z$ loses amplitude as it travels', 'Because $\\gamma$ has to be real', 'Because $\\beta$ must equal $\\alpha$', 'It makes no difference'], 0,
      [null, md`$\gamma$ is complex in general; the choice is only about the sign.`, md`They are equal only in the good-conductor limit.`, md`It does: $\alpha < 0$ would mean a wave growing as it goes, gaining energy from nowhere.`],
      md`A passive material only takes energy from a wave, so the amplitude must shrink in the direction of travel.`),
    Q(md`A wave has $\gamma = 0.1 + j10$ 1/m. Which description fits best?`,
      ['Low loss: many wavelengths before it dies', 'High loss: it dies within one wavelength', 'No phase change with distance', 'A good conductor'], 0,
      [null, md`Its $1/e$ distance is 10 m, while its wavelength is $0.63$ m.`, md`$\beta = 10$ rad/m is a lot of phase change per meter.`, md`A good conductor has $\alpha \approx \beta$. Here $\beta$ is 100 times larger.`],
      md`$1/\alpha = 10$ m and $\lambda = 2\pi/10 = 0.63$ m: about 16 wavelengths per $1/e$ distance.`),
    Q(md`$\eta$ comes out complex because…`,
      ['the $\\mathbf E$ and $\\mathbf H$ of the wave are out of phase in time', 'the wave is traveling in two directions', 'the phasors are not real at $z = 0$', 'the medium has a magnetic loss'], 0,
      [null, md`A single traveling wave has a complex $\eta$ as soon as $\sigma \neq 0$.`, md`An overall phase on both phasors would cancel in the ratio.`, md`Here $\mu$ is real. The angle comes from $\sigma$.`],
      md`The ratio of the phasors $\tilde E/\tilde H = \eta$. A complex ratio means a phase difference between them: $\tau$.`),
    Q(md`A lossy medium has $|\eta| = 100\ \Omega$ and $\tau = 30°$. Which is $\eta$ in rectangular form?`,
      ['$86.6 + j50\\ \\Omega$', '$50 + j86.6\\ \\Omega$', '$86.6 - j50\\ \\Omega$', '$100 + j30\\ \\Omega$'], 0,
      [null, md`That swaps cosine and sine. The angle is small, so the real part is the larger.`, md`$\tau$ is positive, so the imaginary part is positive.`, md`$\tau$ is an angle, not an imaginary part. Convert with $\cos$ and $\sin$.`],
      md`$100e^{j30°} = 100\cos30° + j100\sin30° = 86.6 + j50$.`),
    Q(md`Which is the correct $\tilde H_y$ for $\tilde E_x = E_0e^{j\phi}e^{-\gamma z}$?`,
      ['$(E_0/|\\eta|)e^{j\\phi}e^{-\\gamma z}e^{-j\\tau}$', '$(E_0/|\\eta|)e^{j\\phi}e^{-\\gamma z}e^{+j\\tau}$', '$(E_0|\\eta|)e^{j\\phi}e^{-\\gamma z}e^{-j\\tau}$', '$(E_0/|\\eta|)e^{j\\phi}e^{-j\\beta z}e^{-j\\tau}$'], 0,
      [null, md`Dividing by $e^{j\tau}$ gives $e^{-j\tau}$.`, md`$H = E/\eta$, not $E\cdot\eta$.`, md`That lost the decay: $e^{-\gamma z}$ includes $e^{-\alpha z}$.`],
      md`$\tilde H_y = \tilde E_x/\eta = \tilde E_x/(|\eta|e^{j\tau})$.`),
    Q(md`The units of $\gamma$ are 1/m. What about $\eta\gamma$?`,
      ['$\\Omega$/m, the same as $\\omega\\mu$', '$\\Omega$', 'S/m', 'no units'], 0,
      [null, md`$\eta$ is in $\Omega$, and $\gamma$ adds a 1/m.`, md`S/m are the units of $\gamma/\eta$.`, md`$\eta$ has $\Omega$ and $\gamma$ has 1/m, so the product has units.`],
      md`H/m times rad/s is $\Omega$/m, since an inductance times a frequency is an impedance. ✓`),
    Q(md`The units of $\gamma/\eta$ are…`,
      ['S/m, the same as $\\sigma$', '$\\Omega$/m', '1/m', 'F/m'], 0,
      [null, md`Those are the units of $\eta\gamma$.`, md`Those are the units of $\gamma$ alone.`, md`F/m are the units of $\epsilon$; $\omega\epsilon$ has S/m.`],
      md`$(1/\text{m})/\Omega = \text{S/m}$. This matches $\sigma + j\omega\epsilon$.`),
    Q(md`$\gamma = 2\sqrt2\,e^{j60°}$. Then $\alpha$ is…`,
      ['$\\sqrt2$', '$\\sqrt6$', '$2\\sqrt2$', '$1$'], 0,
      [null, md`That is $\beta$, the imaginary part.`, md`That is $|\gamma|$. $\alpha$ is $|\gamma|\cos60°$.`, md`$|\gamma|\cos60° = 2\sqrt2\cdot\tfrac12$, which is not 1.`],
      md`$\alpha = 2\sqrt2\cos60° = \sqrt2$. And $\beta = 2\sqrt2\sin60° = \sqrt6$.`),
    Q(md`A forward wave in a lossy medium has $E$ peak at $z = 0$, $t = 0$. Which is true about $H$ at the same $z$?`,
      ['Its peak occurs at $t = \\tau/\\omega$, and it has a lower amplitude $E_0/|\\eta|$', 'Its peak occurs at $t = 0$', 'Its peak occurs at $t = -\\tau/\\omega$', 'Its peak occurs at $t = \\beta/\\omega$'], 0,
      [null, md`Only with $\tau = 0$, meaning no loss.`, md`That would be a lead. $H$ lags.`, md`$\beta/\omega$ has the units of time per meter, not time. The lag is set by $\tau$.`],
      md`$\cos(\omega t - \tau)$ peaks at $\omega t = \tau$.`),
    Q(md`A medium with $\sigma/\omega\epsilon = 1$ has $\sqrt{\mu/\epsilon} = 200\ \Omega$. Its $|\eta|$ is…`,
      ['$200/2^{1/4} \\approx 168\\ \\Omega$', '$200/\\sqrt2 \\approx 141\\ \\Omega$', '$200\\ \\Omega$', '$200/2 = 100\\ \\Omega$'], 0,
      [null, md`The $\sqrt2$ is the size of $1 - j$. $\eta$ takes its square root, which leaves $2^{1/4}$.`, md`That is the lossless value. Loss reduces $|\eta|$.`, md`That divides by the square of the size.`],
      md`$|\eta| = 200/[1 + 1]^{1/4} = 200/2^{1/4} = 168\ \Omega$.`),
    Q(md`The exact formulas give $\beta^2 - \alpha^2$ equal to…`,
      ['$\\omega^2\\mu\\epsilon$', '$\\omega\\mu\\sigma$', '$\\omega^2\\mu\\epsilon\\sqrt{1 + (\\sigma/\\omega\\epsilon)^2}$', '$0$'], 0,
      [null, md`That is $2\alpha\beta$, from the imaginary parts.`, md`That is $\alpha^2 + \beta^2$.`, md`They are equal only in the good-conductor limit, and even there the difference is $\omega^2\mu\epsilon$.`],
      md`Real parts of $\gamma^2$: $\alpha^2 - \beta^2 = -\omega^2\mu\epsilon$.`),
    Q(md`The exact formulas give $2\alpha\beta$ equal to…`,
      ['$\\omega\\mu\\sigma$', '$\\omega^2\\mu\\epsilon$', '$\\sigma/\\omega\\epsilon$', '$\\omega\\mu\\epsilon$'], 0,
      [null, md`That is $\beta^2 - \alpha^2$, from the real parts.`, md`$2\alpha\beta$ has units of $1/\text{m}^2$. This ratio has no units.`, md`Check units: $\omega\mu\sigma$ has $1/\text{m}^2$; this one does not.`],
      md`Imaginary parts of $\gamma^2 = -\omega^2\mu\epsilon + j\omega\mu\sigma$: $2\alpha\beta = \omega\mu\sigma$.`),
    Q(md`Given only $\gamma$ and $\eta$ and $\omega$, you can recover…`,
      ['$\\mu$, $\\epsilon$ and $\\sigma$', 'only $\\mu$', 'only $\\sigma$', 'none of them without knowing $E_0$'], 0,
      [null, md`$\gamma/\eta$ also gives $\sigma$ and $\epsilon$.`, md`$\eta\gamma/j\omega$ also gives $\mu$.`, md`$\gamma$ and $\eta$ describe the medium and do not depend on the amplitude.`],
      md`$\mu = \eta\gamma/j\omega$; $\sigma = \Re\{\gamma/\eta\}$; $\epsilon = \Im\{\gamma/\eta\}/\omega$. All on the sheet.`),
    Q(md`Two media differ only in $\sigma$. Compared at the same $\omega$, the one with the larger $\sigma$ has…`,
      ['larger $\\alpha$, larger $\\beta$, larger $\\tau$, smaller $|\\eta|$', 'larger $\\alpha$, smaller $\\beta$, larger $\\tau$, smaller $|\\eta|$', 'larger $\\alpha$, larger $\\beta$, smaller $\\tau$, larger $|\\eta|$', 'the same $\\beta$ and the same $\\tau$'], 0,
      [null, md`Both $\alpha$ and $\beta$ grow: the bracket in $\beta$ has $\sqrt{1 + (\sigma/\omega\epsilon)^2} + 1$.`, md`More loss means more lag and a lower impedance, so this has them backward.`, md`Both change with the loss tangent.`],
      md`The bracket $\sqrt{1 + (\sigma/\omega\epsilon)^2}$ grows with $\sigma$. So $\alpha$, $\beta$ and $\tau$ grow, while $|\eta|$ falls.`),
    Q(md`A larger $\beta$ at the same $\omega$ means…`,
      ['a shorter wavelength and a slower wave', 'a longer wavelength and a faster wave', 'a faster decay and the same wavelength', 'the same wavelength and a slower wave'], 0,
      [null, md`$\lambda = 2\pi/\beta$ and $v_p = \omega/\beta$: both fall as $\beta$ grows.`, md`Decay is $\alpha$. $\beta$ controls phase.`, md`$\lambda$ falls with $\beta$ too.`],
      md`$\lambda = 2\pi/\beta$ and $v_p = \omega/\beta$. So a lossy medium slows the wave and shortens its wavelength compared with the same $\epsilon$ without loss.`),
    Q(md`Which expression for $\gamma^2$ is correct?`,
      ['$-\\omega^2\\mu\\epsilon + j\\omega\\mu\\sigma$', '$+\\omega^2\\mu\\epsilon + j\\omega\\mu\\sigma$', '$-\\omega^2\\mu\\epsilon - j\\omega\\mu\\sigma$', '$\\omega\\mu\\sigma + j\\omega^2\\mu\\epsilon$'], 0,
      [null, md`$j\cdot j = -1$, which makes the first term negative.`, md`$j\omega\mu\cdot\sigma$ is positive-imaginary.`, md`The conduction term is the imaginary one, since it comes from $j\omega\mu\cdot\sigma$.`],
      md`$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon) = j\omega\mu\sigma - \omega^2\mu\epsilon$.`),
    Q(md`In $\gamma = jk\sqrt\rho\,e^{-j\theta/2}$, the factor $e^{-j\theta/2}$ comes from…`,
      ['taking the root of the angle of $1 - j\\sigma/\\omega\\epsilon$', 'the time dependence', 'the direction of travel', 'the reflection at a boundary'], 0,
      [null, md`Time dependence is $e^{j\omega t}$, which was removed by going to phasors.`, md`Direction sets the sign of the exponent $e^{\mp\gamma z}$.`, md`No boundary is in this derivation.`],
      md`$1 - j\sigma/\omega\epsilon = \rho e^{-j\theta}$, and its square root has angle $-\theta/2$.`),
    Q(md`You compute $\gamma = 3e^{j50°}$ and $\eta = 40e^{j25°}$ at some frequency. What should you think?`,
      ['Something is wrong: the angles must add to $90°$', 'All is fine', 'The medium must be magnetic', 'The wave must be traveling toward $-z$'], 0,
      [null, md`$\eta\gamma = j\omega\mu$ has angle $90°$ for real $\mu$. Here they add to $75°$.`, md`A real $\mu$ of any size gives $90°$. A complex $\mu$ isn't part of this course.`, md`$\gamma$ and $\eta$ describe the medium, not the direction.`],
      md`$\eta\gamma = j\omega\mu$ means angle$(\eta)$ + angle$(\gamma)$ = $90°$, always. It is the fastest check you have.`),
    Q(md`The wave $E_x = E_0e^{\alpha z}\cos(\omega t + \beta z)$ with $\alpha, \beta > 0$ travels…`,
      ['toward $-z$, and it shrinks as it travels', 'toward $-z$, and it grows as it travels', 'toward $+z$, and it grows as it travels', 'toward $+z$, and it shrinks as it travels'], 0,
      [null, md`It looks like growth only if you read $z$ in the wrong direction. As it travels, $z$ decreases and $e^{\alpha z}$ falls.`, md`$\omega t + \beta z$ means a peak moves toward $-z$. Also growth would create energy.`, md`The sign of $\beta z$ matching the sign of $\omega t$ means the travel is toward $-z$.`],
      md`Constant phase: $\omega t + \beta z = $ const, so $z$ falls as $t$ grows. With $z$ falling, $e^{\alpha z}$ falls too. Both waves shrink as they travel.`),
    Q(md`You measure at $z = 0$ that $E$ and $H$ of a traveling wave peak $30°$ apart. Then $\sigma/\omega\epsilon$ is…`,
      ['$\\sqrt3$', '$1/\\sqrt3$', '$1$', '$\\tan30°$ only if $\\mu = \\mu_0$'], 0,
      [null, md`That is $\tan30°$. The formula is $\tan(2\tau)$, with $2\tau = 60°$.`, md`That goes with $\tau = 22.5°$.`, md`$\mu$ does not enter the angle.`],
      md`$\tau = 30°$, so $\tan(2\tau) = \tan60° = \sqrt3$.`),
  ];
})();

/* Topic 8: where the power goes (Lectures 23 and 26). The time average of a product, <S> = (1/2)Re{E x H*} worked out for a
   lossy wave, why the power decays as e^{-2 alpha z} and why cos(tau) appears, the heat 1/2 sigma |E|^2 and the check that
   it balances the books (sigma = 2 alpha cos tau / |eta|), power lost between two planes, decibels and 8.686, the 1/e and 1%
   depths, surface resistance R_s = Re{eta} = 1/(sigma delta) and the skin as a resistive sheet, sqrt(f) scaling, copper
   against seawater. Same pace as w2-gamma.js. Generators: rf_w2l_*, w2l_*. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;
  const D = Math.PI / 180, L10E = Math.LOG10E, DBN = 20 * Math.LOG10E;   // 8.686 dB per neper

  // ---------------------------------------------------------------- figures
  // field amplitude and power against depth, in skin depths
  const decayFig = () => PF.plot({
    w: 380, h: 200, x: [0, 3.3], y: [0, 1.12], xl: 'z',
    xt: [[0.5, '\\delta/2'], [1, '\\delta'], [2, '2\\delta'], [3, '3\\delta']],
    yt: [[1, '1'], [Math.exp(-1), '0.37'], [Math.exp(-2), '0.14']],
    curves: [
      { f: (z) => Math.exp(-z), cls: 'dash' },
      { f: (z) => Math.exp(-2 * z) },
      // a small legend in the empty top right
      { pts: [[1.45, 0.95], [1.75, 0.95]], cls: 'dash', lab: '\\text{field, } e^{-\\alpha z}', labAt: 1.75, dx: 6, dy: 0 },
      { pts: [[1.45, 0.78], [1.75, 0.78]], lab: '\\text{power, } e^{-2\\alpha z}', labAt: 1.75, dx: 6, dy: 0 },
    ],
    pts: [{ x: 0.5, y: Math.exp(-1) }, { x: 1, y: Math.exp(-1) }, { x: 1, y: Math.exp(-2) }],
  });
  // instantaneous S_z(t) at z = 0, in units of E0^2/|eta|, for tau = 45 deg and tau = 0
  const stFig = () => PF.plot({
    w: 380, h: 210, x: [0, 360], y: [-0.3, 1.12], zero: true, xl: '\\omega t',
    xt: [[90, '90^\\circ'], [180, '180^\\circ'], [270, '270^\\circ'], [360, '360^\\circ']],
    yt: [[1, '1'], [0.5 * Math.cos(45 * D), '0.35']],
    curves: [
      { f: (x) => Math.cos(x * D) ** 2, cls: 'dash', n: 400 },
      { f: (x) => Math.cos(x * D) * Math.cos(x * D - 45 * D), n: 400 },
      // legend where both curves are low
      { pts: [[60, 1.05], [85, 1.05]], cls: 'dash', lab: '\\tau = 0', labAt: 85, dx: 6, dy: 0 },
      { pts: [[60, 0.88], [85, 0.88]], lab: '\\tau = 45^\\circ', labAt: 85, dx: 6, dy: 0 },
    ],
  });
  // a slab between two planes: power in, power out, heat inside
  function slabFig() {
    const g = PF.fig({ alt: 'a slab between the planes z1 and z2: a thick arrow of power enters on the left, a thinner arrow leaves on the right, and the difference stays inside as heat' });
    const x1 = 120, x2 = 260, y0 = 20, y1 = 140, ym = 80;
    g.rect(x1, y0, x2 - x1, y1 - y0, { cls: 'shade' });
    g.line(x1, y0, x1, y1, { cls: 'thick' });
    g.line(x2, y0, x2, y1, { cls: 'thick' });
    g.arrow(18, ym, x1 - 6, ym, { cls: 'thick', hs: 10 });
    g.arrow(x2 + 6, ym, x2 + 66, ym, { hs: 7 });
    g.label(64, ym - 10, '\\langle S\\rangle(z_1)', 'b', 'small');
    g.label(x2 + 36, ym - 10, '\\langle S\\rangle(z_2)', 'b', 'small');
    g.text((x1 + x2) / 2, ym - 14, 'heat', 'b', 'small');
    g.label((x1 + x2) / 2, ym + 6, '\\tfrac12\\sigma|\\tilde E|^2', 't', 'small');
    g.label(x1, y1 + 6, 'z_1', 't', 'small');
    g.label(x2, y1 + 6, 'z_2', 't', 'small');
    g.arrow(x2 + 70, y1 + 14, x2 + 104, y1 + 14, { cls: 'dim', hs: 6 });
    g.label(x2 + 108, y1 + 14, 'z', 'l', 'small');
    return g.svg();
  }
  // current density in a thick good conductor against the uniform layer one skin depth thick
  const skinFig = () => PF.plot({
    w: 380, h: 190, x: [0, 4.2], y: [0, 1.12], xl: 'z',
    xt: [[1, '\\delta'], [2, '2\\delta'], [3, '3\\delta'], [4, '4\\delta']],
    yt: [[1, '1'], [Math.SQRT1_2, '0.71']],
    curves: [
      { f: (z) => Math.exp(-z), lab: '|\\tilde J(z)|', labAt: 1.9, dx: 6, dy: -8 },
      { pts: [[0, Math.SQRT1_2], [1, Math.SQRT1_2], [1, 0]], cls: 'dash' },
      { pts: [[2.2, 0.95], [2.5, 0.95]], cls: 'dash', lab: '\\text{uniform layer}', labAt: 2.5, dx: 6, dy: 0 },
    ],
  });

  // ---------------------------------------------------------------- the lesson
  EM.lesson('w2', {
    id: 'w2-loss', topic: 8, ref: 'Lectures 23 and 26', title: 'Where the power goes: decay, dB, surface resistance',
    steps: [
      R(md`
        !!key Why you care
          A wave in a lossy material does two things on every exam: it carries power, and it loses power. Summer 2018 and Summer 2019 both asked the same question: seawater at 1 kHz carries 1 W/m² at $z = 0$; how much is left 10 m further on? Prof. Chen's Spring 2024 paper asked you to judge five statements about $\langle\mathbf S\rangle$ in a good conductor (SP24 #2(c)), and whether the power absorbed between two planes changes with frequency (#2(e)). The homework asks for the power dissipated inside a cube (the skill HW 9 #3(f) asks for) and how deep a submarine can go and still receive 1% of the signal (HW 9 #4). This lesson derives everything those questions need. The starting line, $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$, is on your sheet. The rest (decibels, the 1% depth, surface resistance) is **not**, so you build it here.

        ### Notation

        - $\tilde{\mathbf E}$, $\tilde{\mathbf H}$: phasors ([Topic 1](#/l/w1-phasor)). The real field is $\mathbf E(t) = \Re\{\tilde{\mathbf E}e^{j\omega t}\}$.
        - $A^*$: the **complex conjugate** of $A$: flip the sign of every $j$. So $(e^{j\theta})^* = e^{-j\theta}$, and $AA^* = |A|^2$, a real number.
        - $\langle\;\rangle$: the **time average** over one period $T = 2\pi/\omega$.
        - $\langle\mathbf S\rangle$ (W/m²): the time-averaged Poynting vector, the power per square meter the wave carries on average. $S_0$ is its size at $z = 0$.
        - $\alpha$ (Np/m), $\beta$ (rad/m), $\eta = |\eta|e^{j\tau}$ ($\Omega$): from [Topic 5](#/l/w2-gamma). Here $\tau$ is the **angle of $\eta$**, how far $H$ lags $E$. It is not the transmission coefficient $\tau = 1 + \Gamma$ of [Topic 11](#/l/w4-gamma).
        - $\langle p_d\rangle = \langle\mathbf J\cdot\mathbf E\rangle$ (W/m³): the average power the field hands to the charges in each cubic meter. It becomes heat.
        - $\delta = 1/\alpha$ (m): the **skin depth**, or penetration depth ([Topic 7](#/l/w2-limits)).
        - dB: **decibels**, a logarithmic way to write a power ratio.
        - $R_s$ ($\Omega$): the **surface resistance** of a good conductor. $\tilde{\mathbf J}_s$ (A/m): the total current per meter of width flowing in the conductor's skin.
        - $\mathbf H_{\tan}$: the part of $\mathbf H$ parallel to a surface.

        ### 1. The average of a product of two sinusoids

        Power is always a product: $\mathbf E\times\mathbf H$, $\mathbf J\cdot\mathbf E$, $vi$. And exams ask for its average. So first find the average of a product of two cosines at the same frequency:
        $$A(t) = |A|\cos(\omega t + a)$$
        $$B(t) = |B|\cos(\omega t + b)$$
        Multiply them, and use $\cos x\cos y = \tfrac12[\cos(x - y) + \cos(x + y)]$:
        $$\begin{aligned}A(t)B(t) &= \tfrac12|A||B|\cos(a - b)\\ &\quad+ \tfrac12|A||B|\cos(2\omega t + a + b)\end{aligned}$$
        The first line does not depend on time. The second oscillates at $2\omega$: over a period it spends as long below zero as above, so it averages to zero. What is left:
        $$\langle AB\rangle = \tfrac12|A||B|\cos(a - b)$$
        Now look at the phasors $\tilde A = |A|e^{ja}$ and $\tilde B = |B|e^{jb}$. Multiply $\tilde A$ by the **conjugate** of $\tilde B$. The sizes multiply and the angles subtract:
        $$\tilde A\tilde B^* = |A||B|\,e^{j(a - b)}$$
        Its real part is $|A||B|\cos(a - b)$, which is exactly twice the average. So
        $$\boxed{\langle A(t)B(t)\rangle = \tfrac12\Re\{\tilde A\tilde B^*\}}$$
        This is why the sheet writes $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. The conjugate subtracts the two phases, because only the phase **difference** matters for the average. [Topic 4](#/l/w1-avg) spends longer on this.

        !!intuition Does this make sense?
          Set $B = A$. Then $\langle A^2\rangle = \tfrac12|A|^2$: the familiar "the average of $\cos^2$ is one half". And if $A$ and $B$ are $90°$ apart, $\cos(a - b) = 0$. That is a capacitor's voltage and current: they trade energy back and forth and deliver none on average.
      `),
      Q(md`**Predict.** $A(t) = 10\cos\omega t$ and $B(t) = 3\cos(\omega t - 60°)$. The time average of $A(t)B(t)$ is…`,
        [md`$7.5$`, md`$15$`, md`$30$`, md`$13.0$`], 0,
        [null, md`That is $\tfrac12|A||B|$. It leaves out $\cos(a - b) = \cos60° = \tfrac12$: the two are not in step.`, md`That is $|A||B|$, the peak of the product if they were in step. The average has a $\tfrac12$ and a $\cos(a - b)$.`, md`That uses $\sin60°$. The real part of $e^{j60°}$ is $\cos60°$.`],
        md`$\tilde A = 10$, $\tilde B = 3e^{-j60°}$, so $\tilde A\tilde B^* = 30e^{+j60°}$. Half its real part: $\tfrac12(30)\cos60° = 7.5$.`),
      R(md`
        ### 2. ⟨S⟩ for a wave in a lossy material

        Take the forward wave of [Topic 5](#/l/w2-gamma), with its starting phase set to zero:
        $$\tilde{\mathbf E} = \hat x\,E_0e^{-\alpha z}e^{-j\beta z}$$
        Its $\tilde{\mathbf H}$ is $\tilde{\mathbf E}/\eta$, along $\hat y$. Dividing by $\eta = |\eta|e^{j\tau}$ divides the size by $|\eta|$ and subtracts $\tau$ from the phase:
        $$\tilde{\mathbf H} = \hat y\,\frac{E_0}{|\eta|}e^{-\alpha z}e^{-j\beta z}e^{-j\tau}$$
        **Step 1: conjugate $\tilde{\mathbf H}$.** Flip the sign of every $j$. $E_0$, $|\eta|$ and $e^{-\alpha z}$ are real, so they do not change:
        $$\tilde{\mathbf H}^* = \hat y\,\frac{E_0}{|\eta|}e^{-\alpha z}e^{+j\beta z}e^{+j\tau}$$
        **Step 2: the cross product.** The directions give $\hat x\times\hat y = \hat z$. The sizes multiply, and so do the exponentials:
        $$\begin{aligned}\tilde{\mathbf E}\times\tilde{\mathbf H}^* &= \hat z\,\frac{E_0^2}{|\eta|}e^{-2\alpha z}\\ &\quad\times e^{-j\beta z}e^{+j\beta z}e^{j\tau}\end{aligned}$$
        **Step 3: simplify.** $e^{-j\beta z}e^{+j\beta z} = 1$. The phase that travels with the wave cancels, because $E$ and $H$ carry the same one:
        $$\tilde{\mathbf E}\times\tilde{\mathbf H}^* = \hat z\,\frac{E_0^2}{|\eta|}e^{-2\alpha z}e^{j\tau}$$
        **Step 4: real part, times one half.** $\Re\{e^{j\tau}\} = \cos\tau$, and everything else is real:
        $$\boxed{\langle\mathbf S\rangle = \hat z\,\frac{E_0^2}{2|\eta|}\,e^{-2\alpha z}\cos\tau}$$
        Every piece has a job:

        | Piece | Where it came from | What it says |
        |---|---|---|
        | $E_0^2/2|\eta|$ | $E_0$ times $E_0/|\eta|$, and the $\tfrac12$ of an average | the power at $z = 0$ if $E$ and $H$ were in step |
        | $e^{-2\alpha z}$ | $e^{-\alpha z}$ from $E$ times $e^{-\alpha z}$ from $H$ | how fast the power dies |
        | $\cos\tau$ | the angle of $\eta$, left over after the $\beta z$ phases cancel | how much the lag of $H$ costs |
        | $\hat z$ | $\hat x\times\hat y$ | which way the power flows |

        !!intuition Does this make sense?
          No loss: $\alpha = 0$, $\tau = 0$, and $|\eta| = \eta$. Then $\langle\mathbf S\rangle = \hat z\,E_0^2/2\eta$, the Exam 2 result. Units: (V/m)²/Ω = W/m². ✓ And $\beta$ appears nowhere in the answer: the phase that travels with the wave says nothing about how much power it carries.
      `),
      Q(md`**Predict.** At $z = 0$ a wave has $E_0 = 10$ V/m in a medium with $\eta = 40 + j30\ \Omega$. Its $\langle S\rangle$ there is…`,
        [md`$0.8$ W/m²`, md`$1.0$ W/m²`, md`$0.6$ W/m²`, md`$1.25$ W/m²`, md`$1.6$ W/m²`], 0,
        [null, md`That is $E_0^2/2|\eta| = 100/100$, without $\cos\tau$. $H$ lags $E$ here, and the lag costs a factor $\cos\tau = 40/50 = 0.8$.`, md`That uses $\sin\tau = 30/50$. The real part of $e^{j\tau}$ is $\cos\tau$.`, md`That is $E_0^2/(2\Re\{\eta\}) = 100/80$. Dividing by the real part of $\eta$ is not the same as taking the real part of $1/\eta$ (Section 4).`, md`That forgets the $\tfrac12$ of the time average.`],
        md`$|\eta| = \sqrt{40^2 + 30^2} = 50\ \Omega$ and $\cos\tau = 40/50 = 0.8$. So $\langle S\rangle = \dfrac{100}{2(50)}(0.8) = 0.8$ W/m².`),
      RF(md`
        ### 3. Why the power decays as e^{−2αz}

        The field amplitude carries one factor $e^{-\alpha z}$. The power carries two, one from $\mathbf E$ and one from $\mathbf H$, so it dies twice as fast:
        $$\frac{\langle S\rangle(z)}{S_0} = e^{-2\alpha z} = \big(e^{-\alpha z}\big)^2$$
        **The power ratio is the square of the field ratio.** That is all there is to it, and forgetting it is the most common mistake on this topic. In skin depths, $\delta = 1/\alpha$:

        | Distance | Field amplitude | Power |
        |---|---|---|
        | $\delta/2$ | $e^{-1/2} = 61\%$ | $e^{-1} = 37\%$ |
        | $\delta$ | $e^{-1} = 37\%$ | $e^{-2} = 13.5\%$ |
        | $2\delta$ | $e^{-2} = 13.5\%$ | $e^{-4} = 1.8\%$ |
        | $3\delta$ | $e^{-3} = 5\%$ | $e^{-6} = 0.25\%$ |

        The field falls by $1/e$ every $\delta$. The power falls by $1/e$ every $\delta/2$.

        [[fig:decay]]

        **A wave traveling toward $-z$.** Its phasor is $E_0e^{+\alpha z}e^{+j\beta z}$, and $\tilde H_y = -\tilde E_x/\eta$ ([Topic 5](#/l/w2-gamma)). Run the same four steps. The minus sign on $\tilde H$ turns $\hat z$ into $-\hat z$, and the two factors $e^{+\alpha z}$ make $e^{+2\alpha z}$:
        $$\langle\mathbf S\rangle = -\hat z\,\frac{E_0^2}{2|\eta|}\,e^{+2\alpha z}\cos\tau$$
        At $z = -10$ m the factor is $e^{-20\alpha}$, smaller than at $z = 0$. The wave shrinks in the direction it travels, as it must. The rule that never fails, whatever the sign of $z$: **multiply by $e^{-2\alpha d}$, where $d$ is the distance the wave has traveled.**

        !!intuition Does this make sense?
          If the field is cut in half, $E$ is half and $H$ is half, so $E\times H$ is a quarter. A resistor does the same: its power goes as $v^2/R$.
      `, { decay: { svg: decayFig(), cap: 'Dashed: the field amplitude, $e^{-\\alpha z}$. Solid: the power, $e^{-2\\alpha z}$. The power reaches 37% at $\\delta/2$, where the field is still at 61%.' } }),
      Q(md`**Predict.** A wave's field amplitude halves every 3 m. After 6 m, its power is what fraction of the starting power?`,
        [md`$1/16$`, md`$1/4$`, md`$1/2$`, md`$1/256$`], 0,
        [null, md`That is the field ratio after 6 m (two halvings), or the power after 3 m. Here you need both: square the field ratio of 6 m.`, md`That treats the power as halving every 6 m. The power is the field ratio squared, and the field quarters in 6 m.`, md`That squares twice. The field after 6 m is $1/4$; the power is $(1/4)^2$, once.`],
        md`Over 6 m the field halves twice: $1/4$. Power is field squared: $(1/4)^2 = 1/16$.`),
      Q(md`**Predict.** A wave travels toward $-z$ in a medium with $\alpha = 0.05$ Np/m, and $\langle S\rangle = 4$ W/m² at $z = 0$. At $z = -10$ m, $\langle S\rangle$ is about…`,
        [md`$1.47$ W/m²`, md`$10.9$ W/m²`, md`$2.43$ W/m²`, md`$4$ W/m²`], 0,
        [null, md`That puts $z = -10$ into $e^{-2\alpha z}$, the forward formula, and gets $4e^{+1}$: a wave that gains power. This wave goes toward $-z$, so it has traveled 10 m and lost power.`, md`That is $4e^{-\alpha d} = 4e^{-0.5}$, the field's rate. Power decays at $2\alpha$.`, md`$\langle S\rangle$ is not constant in a lossy medium. It shrinks along the direction of travel, whichever way that is.`],
        md`The wave has traveled $d = 10$ m. $2\alpha d = 2(0.05)(10) = 1$, so $\langle S\rangle = 4e^{-1} \approx 1.47$ W/m². With the backward formula: $4e^{+2\alpha z}$ at $z = -10$ gives the same $4e^{-1}$.`),
      RF(md`
        ### 4. Why cos τ appears

        Go back to the time domain at $z = 0$. From [Topic 5](#/l/w2-gamma):
        $$E_x = E_0\cos\omega t$$
        $$H_y = \frac{E_0}{|\eta|}\cos(\omega t - \tau)$$
        Multiply them, with the product rule of Section 1 ($a = 0$, $b = -\tau$, so $a - b = \tau$):
        $$S_z(t) = \frac{E_0^2}{2|\eta|}\big[\cos\tau + \cos(2\omega t - \tau)\big]$$
        The first term is the average. The second sloshes at twice the frequency. Whenever $E$ and $H$ have opposite signs, the product is negative: **for a moment, energy flows backward**, toward the source. The lag $\tau$ is what makes opposite signs possible. Each half cycle, $\cos\omega t$ changes sign $\tau$ before $\cos(\omega t - \tau)$ does, so $S_z < 0$ for a fraction $2\tau/360°$ of every period.

        [[fig:st]]

        So $\cos\tau$ is the fraction of the "in step" power that the wave really delivers. The rest is energy the field stores and hands back every half cycle.

        **Two more ways to write it.** Both come from the same Step 2 of Section 2.

        From $E_0$ alone: $\tilde H = \tilde E/\eta$, so $\tilde H^* = \tilde E^*/\eta^*$, and
        $$\langle S\rangle = \tfrac12\Re\Big\{\frac{\tilde E\tilde E^*}{\eta^*}\Big\} = \tfrac12|E_0|^2\,\Re\Big\{\frac1{\eta^*}\Big\}$$
        $1/\eta^* = e^{j\tau}/|\eta|$ has real part $\cos\tau/|\eta|$: the same answer. (Conjugates have the same real part, so $\Re\{1/\eta^*\} = \Re\{1/\eta\}$.)

        From $H_0$ alone: $\tilde E = \eta\tilde H$, so
        $$\langle S\rangle = \tfrac12\Re\{\eta\tilde H\tilde H^*\} = \tfrac12|H_0|^2\,\Re\{\eta\}$$
        Together:
        $$\boxed{\langle S\rangle = \frac{|E_0|^2}{2}\Re\Big\{\frac{1}{\eta}\Big\} = \frac{|H_0|^2}{2}\Re\{\eta\}}$$
        The $H$ form is the one you need for good conductors in Section 9.

        !!trap Re{1/η} is not 1/Re{η}
          With $\eta = 40 + j30\ \Omega$: $\Re\{1/\eta\} = 40/2500 = 0.016$ S, but $1/\Re\{\eta\} = 1/40 = 0.025$ S. Writing $E_0^2/(2\Re\{\eta\})$ is wrong by a factor $\cos^2\tau$.

        !!intuition Does this make sense?
          $|\eta|$ alone cannot set the power: two materials can have the same $|\eta|$ and different lags. The real part of $\eta$ is the part that acts like a resistor, in step, and only a resistor absorbs power on average. It is exactly a circuit load: $\tfrac12|I|^2\Re\{Z\}$.
      `, { st: { svg: stFig(), cap: 'The instantaneous $S_z$ at $z = 0$, in units of $E_0^2/|\\eta|$. Dashed: $\\tau = 0$, never negative, average 0.5. Solid: $\\tau = 45°$. It dips below zero for a quarter of each period, and its average drops to $\\tfrac12\\cos45° = 0.35$.' } }),
      Q(md`**Predict.** Just inside a material, $|\tilde H| = 2$ A/m and $\eta = 12 + j5\ \Omega$. The power per square meter flowing in is…`,
        [md`$24$ W/m²`, md`$26$ W/m²`, md`$10$ W/m²`, md`$48$ W/m²`, md`$0.167$ W/m²`], 0,
        [null, md`That uses $|\eta| = 13\ \Omega$. Only the real part of $\eta$, the part in step, carries average power.`, md`That uses the imaginary part. $\Im\{\eta\}$ stores energy and gives it back; it delivers none on average.`, md`That forgets the $\tfrac12$ of the time average.`, md`That divides by $2\Re\{\eta\}$, mixing up the two forms. With $H$ you multiply: $\tfrac12|H_0|^2\Re\{\eta\}$.`],
        md`$\langle S\rangle = \tfrac12|H_0|^2\Re\{\eta\} = \tfrac12(4)(12) = 24$ W/m².`),
      R(md`
        ### 5. Where the power goes: ½σ|Ẽ|²

        The power that vanishes from the wave has to go somewhere. In a conductor $\mathbf J = \sigma\mathbf E$, and [Topic 3](#/l/w1-poynting) showed that $\mathbf J\cdot\mathbf E$ is the power per cubic meter the field hands to the charges. Average it with the rule of Section 1, using $\tilde{\mathbf J} = \sigma\tilde{\mathbf E}$:
        $$\langle\mathbf J\cdot\mathbf E\rangle = \tfrac12\Re\{\tilde{\mathbf J}\cdot\tilde{\mathbf E}^*\} = \tfrac12\Re\{\sigma\tilde{\mathbf E}\cdot\tilde{\mathbf E}^*\}$$
        $\tilde{\mathbf E}\cdot\tilde{\mathbf E}^* = |\tilde{\mathbf E}|^2$ is real, and so is $\sigma$. With $|\tilde{\mathbf E}| = E_0e^{-\alpha z}$:
        $$\boxed{\langle p_d\rangle = \tfrac12\sigma|\tilde{\mathbf E}|^2 = \tfrac12\sigma E_0^2\,e^{-2\alpha z}}$$
        This is the heat per cubic meter, in W/m³. It is largest at the front of the material and dies with the same $e^{-2\alpha z}$ as the power.

        **Now check that the books balance.** Average the Poynting theorem of [Topic 3](#/l/w1-poynting), $\nabla\cdot\mathbf S + \partial w/\partial t + \mathbf J\cdot\mathbf E = 0$. The stored energy density $w$ at a point repeats every period, so it ends each period where it began, and the average of its derivative is zero:
        $$\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$$
        Our $\langle\mathbf S\rangle$ has only a $z$-component, so the divergence is $d\langle S\rangle/dz$. Differentiate the box of Section 2. Only $e^{-2\alpha z}$ depends on $z$, and it brings down $-2\alpha$:
        $$\frac{d\langle S\rangle}{dz} = -2\alpha\,\frac{E_0^2}{2|\eta|}\cos\tau\;e^{-2\alpha z}$$
        The theorem says this equals $-\tfrac12\sigma E_0^2e^{-2\alpha z}$. Cancel $-\tfrac12E_0^2e^{-2\alpha z}$ from both sides. The theorem holds only if
        $$\sigma = \frac{2\alpha\cos\tau}{|\eta|} \qquad\text{(1)}$$
        Is (1) true? Prove it from two facts of [Topic 5](#/l/w2-gamma).

        **Fact 1.** $\eta\gamma = j\omega\mu$, so $1/\eta = \gamma/j\omega\mu$. Put in $\gamma = \alpha + j\beta$ and use $1/j = -j$:
        $$\frac1\eta = \frac{\beta - j\alpha}{\omega\mu}$$
        Its real part is $\beta/\omega\mu$. But $1/\eta = e^{-j\tau}/|\eta|$ has real part $\cos\tau/|\eta|$. So
        $$\frac{\cos\tau}{|\eta|} = \frac{\beta}{\omega\mu}$$
        **Fact 2.** The imaginary part of $\gamma^2 = (\alpha + j\beta)^2$ is $2\alpha\beta$. The imaginary part of $\gamma^2 = -\omega^2\mu\epsilon + j\omega\mu\sigma$ is $\omega\mu\sigma$. They are the same number:
        $$2\alpha\beta = \omega\mu\sigma$$
        **Put them together.** Use Fact 1 on the right side of (1), then Fact 2:
        $$\frac{2\alpha\cos\tau}{|\eta|} = \frac{2\alpha\beta}{\omega\mu} = \frac{\omega\mu\sigma}{\omega\mu} = \sigma\ \checkmark$$
        Every watt the wave loses is a watt of heat in the material, at every $z$. Nothing is missing from the books.

        !!intuition Does this make sense?
          $\tfrac12\sigma E_0^2$ is the field version of $\tfrac12V_0^2/R$ for a resistor driven with peak voltage $V_0$: $\sigma$ plays the conductance and the $\tfrac12$ is the average of $\cos^2$. And with $\sigma = 0$ there is no heat, so (1) says $\alpha = 0$: no loss, no decay.
      `),
      Q(md`**Predict.** At a point in a material with $\sigma = 0.02$ S/m, the field is $E = 10\cos(\omega t + 30°)$ V/m. The average heat per cubic meter there is…`,
        [md`$1$ W/m³`, md`$2$ W/m³`, md`$0.2$ W/m³`, md`$2500$ W/m³`], 0,
        [null, md`That is $\sigma E_0^2$, the peak of $\sigma E^2$. The average of $\cos^2$ brings a $\tfrac12$.`, md`That is $\sigma E_0$, the peak current density $J$ in A/m², not a power.`, md`That is $E_0^2/2\sigma$. Conductance multiplies here: more $\sigma$, more current, more heat.`],
        md`$\langle p_d\rangle = \tfrac12\sigma E_0^2 = \tfrac12(0.02)(100) = 1$ W/m³. The $30°$ phase does not matter: $|\tilde E|^2$ has no phase.`),
      RF(md`
        ### 6. The power lost between two planes

        Exams ask for the power absorbed in a slab, a box, a cube: everything between two planes $z_1 < z_2$. There are two ways to count it, and they must agree.

        [[fig:slab]]

        **Way 1: the flow.** Take a box with faces of area $A$ on the planes $z_1$ and $z_2$. Power enters through the face at $z_1$ and leaves through the face at $z_2$. The four side faces carry nothing, because $\langle\mathbf S\rangle$ points along $\hat z$, parallel to them. What enters and does not leave stays inside as heat:
        $$P_{\text{abs}} = A\big[\langle S\rangle(z_1) - \langle S\rangle(z_2)\big]$$
        With $\langle S\rangle(z) = S_0e^{-2\alpha z}$:
        $$P_{\text{abs}} = AS_0\big(e^{-2\alpha z_1} - e^{-2\alpha z_2}\big)$$
        **Way 2: the heat.** Add up $\langle p_d\rangle$ over the volume. A slice of thickness $dz$ has volume $A\,dz$:
        $$P_{\text{abs}} = A\int_{z_1}^{z_2}\tfrac12\sigma E_0^2e^{-2\alpha z}\,dz$$
        The integral of $e^{-2\alpha z}$ is $e^{-2\alpha z}/(-2\alpha)$. Evaluate it at the two ends; the minus sign flips the order:
        $$P_{\text{abs}} = \frac{A\sigma E_0^2}{4\alpha}\big(e^{-2\alpha z_1} - e^{-2\alpha z_2}\big)$$
        **They agree.** The brackets are the same. The factors in front, $S_0 = E_0^2\cos\tau/2|\eta|$ and $\sigma E_0^2/4\alpha$, are equal exactly when $\sigma = 2\alpha\cos\tau/|\eta|$, which is (1) again. ✓ This is the box form of the Poynting theorem ([Topic 3](#/l/w1-poynting)) with $dW/dt$ averaging to zero: **power in = heat inside.**

        On an exam, **use Way 1**. It needs $\langle S\rangle$ at two places and no integral. Keep Way 2 as your check.

        !!intuition Does this make sense?
          Let the slab start at the surface and go on forever: $z_1 = 0$, $z_2\to\infty$. Then $P_{\text{abs}} = AS_0$: everything that enters ends up as heat. The first skin depth alone takes $1 - e^{-2} = 86\%$ of it.
      `, { slab: { svg: slabFig(), cap: 'Power in through the face at $z_1$, minus power out through the face at $z_2$, is the heat made inside. The side faces carry nothing.' } }),
      Q(md`**Predict.** A wave carries $\langle S\rangle = 8$ W/m² into the face $z = z_1$ of a slab and $2$ W/m² out of its face at $z = z_2$. The faces have area 3 m². The slab absorbs…`,
        [md`$18$ W`, md`$6$ W`, md`$30$ W`, md`$24$ W`], 0,
        [null, md`That is per square meter. The faces are 3 m², so multiply by 3.`, md`That adds what enters and what leaves. Heat is what enters and does **not** leave.`, md`That is everything that enters. 6 W of it leaves through the far face.`],
        md`$P_{\text{abs}} = A(S_1 - S_2) = 3(8 - 2) = 18$ W.`),
      R(md`
        ### 7. Decibels: 8.686 α dB per meter

        Power ratios in lossy media span many powers of ten ($e^{-10} \approx 4.5\times10^{-5}$), so engineers write them on a log scale. The **decibel** value of a power ratio is
        $$\text{ratio in dB} = 10\log_{10}\frac{P_2}{P_1}$$
        A few to know cold, using $\log_{10}2 \approx 0.301$:

        | $P_2/P_1$ | dB |
        |---|---|
        | 10 | $+10$ |
        | 2 | $+3$ |
        | 1/2 | $-3$ |
        | 1/10 | $-10$ |
        | 1/100 | $-20$ |
        | 1/1000 | $-30$ |

        Why logs? Along a path the ratios multiply, and logs turn multiplying into adding: a 10 dB loss followed by a 3 dB loss is a 13 dB loss.

        **Field ratios.** Power goes as field squared, and $\log(x^2) = 2\log x$. So for an amplitude ratio,
        $$10\log_{10}\Big(\frac{E_2}{E_1}\Big)^2 = 20\log_{10}\frac{E_2}{E_1}$$
        Same dB, written with a 20. The field falling to $1/10$ is the power falling to $1/100$: $-20$ dB either way.

        **The loss of a lossy medium.** Over a distance $d$ the power ratio is $e^{-2\alpha d}$. Take $10\log_{10}$ of it, using $\log(e^x) = x\log e$:
        $$10\log_{10}e^{-2\alpha d} = -2\alpha d\cdot10\log_{10}e$$
        The number $\log_{10}e = 1/\ln10 = 0.4343$, so $10\log_{10}e = 4.343$:
        $$-2\alpha d\,(4.343) = -8.686\,\alpha d$$
        So the loss, in dB, is
        $$\boxed{\text{loss (dB)} = 8.686\,\alpha d}$$
        with $\alpha$ in Np/m and $d$ in m. One more name: $\alpha d$ itself is the loss in **nepers**, the natural-log unit ($\ln$ of the field ratio). So $1\ \text{Np} = 8.686$ dB.

        !!intuition Does this make sense?
          One skin depth is $\alpha d = 1$: $8.7$ dB. Check against Section 3: $10\log_{10}e^{-2} = 10(-2)(0.434) = -8.7$ dB, the $13.5\%$ of the table. ✓ Every skin depth costs about 9 dB, so three cost 26 dB.
      `),
      Q(md`**Predict.** A medium has $\alpha = 0.1$ Np/m. A wave crosses 50 m of it. The loss is about…`,
        [md`$43$ dB`, md`$22$ dB`, md`$5$ dB`, md`$87$ dB`], 0,
        [null, md`That uses $4.343\,\alpha d$: $10\log_{10}$ of the **field** ratio $e^{-\alpha d}$. Power needs the square, which is $8.686$.`, md`That is $\alpha d = 5$ nepers. Convert: $1$ Np $= 8.686$ dB.`, md`That doubles twice: $17.37\,\alpha d$. The 2 of $e^{-2\alpha d}$ is already inside the $8.686$.`],
        md`$8.686\,\alpha d = 8.686(0.1)(50) = 43.4$ dB. The power is down by $e^{-10}$.`),
      Q(md`**Predict.** A cable run loses 30 dB. What fraction of the input **power** arrives?`,
        [md`$1/1000$`, md`$1/30$`, md`$1/100$`, md`$0.032$`], 0,
        [null, md`dB are logs: $-30$ dB is $10^{-30/10}$, not $1/30$.`, md`That is $-20$ dB. Every 10 dB is another factor of 10.`, md`That is $10^{-30/20}$, the **field** amplitude that arrives. The power is its square.`],
        md`$10^{-30/10} = 10^{-3}$. The field amplitude is $10^{-1.5} \approx 0.032$ of its input.`),
      R(md`
        ### 8. How deep: the 1/e and the 1% depths

        "How deep can you go and still have a fraction $x$ left?" Set the ratio equal to $x$ and take $\ln$ of both sides.

        **The field amplitude falls to a fraction $x$:**
        $$e^{-\alpha d} = x\ \ \Rightarrow\ \ d = \frac{1}{\alpha}\ln\frac1x = \delta\ln\frac1x$$
        **The power falls to a fraction $x$:** the exponent is twice as big, so the distance is half:
        $$e^{-2\alpha d} = x\ \ \Rightarrow\ \ d = \frac{\delta}{2}\ln\frac1x$$
        The logs you need, without a calculator: $\ln10 = 2.30$, so $\ln100 = 4.61$ and $\ln1000 = 6.91$. Also $\ln2 = 0.69$.

        | Left over | Field amplitude | Power |
        |---|---|---|
        | $1/e$ | $\delta$ | $\delta/2$ |
        | $1\%$ | $4.6\delta$ | $2.3\delta$ |
        | $0.1\%$ | $6.9\delta$ | $3.45\delta$ |

        **Read the question carefully.** "1% of the signal amplitude" (the skill HW 9 #4 asks for) is the field: $4.6\delta$. "1% of the power" is $2.3\delta$. In dB the same two are $-40$ dB and $-20$ dB.

        !!intuition Does this make sense?
          $4.6\delta$ in dB is $8.686\times4.6 = 40$ dB, an amplitude ratio of $10^{-40/20} = 10^{-2}$. ✓ The table and the dB rule are the same fact written two ways.
      `),
      Q(md`**Predict.** A medium has $\delta = 2$ m. At what depth is the field amplitude 1% of its value at the surface?`,
        [md`$9.2$ m`, md`$4.6$ m`, md`$2$ m`, md`$200$ m`], 0,
        [null, md`That is where the **power** is 1%. The field needs twice the distance.`, md`That is one skin depth, where the field is $1/e = 37\%$.`, md`Decay is exponential, not linear: $e^{-d/\delta} = 0.01$ gives $d = \delta\ln100$, not $100\delta$.`],
        md`$d = \delta\ln100 = 2(4.61) = 9.2$ m.`),
      R(md`
        ### 9. Good conductors: the power that enters the surface

        Now the case that matters most for metals. In a good conductor $\sigma \gg \omega\epsilon$, so you can drop $\epsilon$ next to $\sigma/\omega$ in $\eta$ ([Topic 7](#/l/w2-limits)):
        $$\eta = \sqrt{\frac{\mu}{\epsilon - j\sigma/\omega}} \approx \sqrt{\frac{\mu}{-j\sigma/\omega}}$$
        Since $1/(-j) = j$:
        $$\eta \approx \sqrt{\frac{j\omega\mu}{\sigma}}$$
        $j = e^{j90°}$, and its square root is $e^{j45°} = (1 + j)/\sqrt2$:
        $$\eta \approx \sqrt{\frac{\omega\mu}{\sigma}}\cdot\frac{1 + j}{\sqrt2} = (1 + j)\sqrt{\frac{\omega\mu}{2\sigma}}$$
        Its real part has a name, the **surface resistance**. With $\omega = 2\pi f$:
        $$R_s \equiv \Re\{\eta\} = \sqrt{\frac{\omega\mu}{2\sigma}} = \sqrt{\frac{\pi f\mu}{\sigma}}$$
        The same steps on $\gamma \approx \sqrt{j\omega\mu\sigma}$ give $\alpha = \beta = \sqrt{\pi f\mu\sigma} = 1/\delta$. That gives $R_s$ a third form. Multiply the top and the bottom of $\sqrt{\pi f\mu/\sigma}$ by $\sqrt\sigma$:
        $$R_s = \frac{\sqrt{\pi f\mu\sigma}}{\sigma} = \frac{\alpha}{\sigma}$$
        and $\alpha = 1/\delta$:
        $$\boxed{R_s = \Re\{\eta\} = \frac{1}{\sigma\delta} = \sqrt{\frac{\pi f\mu}{\sigma}}}$$
        So $\eta = (1 + j)R_s$, with $|\eta| = \sqrt2\,R_s$ and $\tau = 45°$.

        **The power that enters.** Use the $H$ form of Section 4 just inside the surface:
        $$\langle S\rangle = \tfrac12|H_0|^2\,\Re\{\eta\}$$
        $H_0$ is parallel to the surface. Tangential $\mathbf H$ is continuous across the surface (a finite $\sigma$ carries no true sheet of current), so you may use $|\mathbf H_{\tan}|$ just **outside**, which is usually easier to find:
        $$\boxed{\langle S\rangle_{\text{in}} = \tfrac12|\tilde{\mathbf H}_{\tan}|^2R_s}$$
        All of it becomes heat within a few skin depths (Section 6, with $z_2\to\infty$).

        **The same in terms of $E$.** $\Re\{1/\eta\} = \Re\{(1 - j)/2R_s\} = 1/2R_s$, so $\langle S\rangle = \tfrac12E_0^2/2R_s$:
        $$\langle S\rangle_{\text{in}} = \frac{E_0^2}{4R_s}$$
        with $E_0$ the field just inside the surface.

        !!intuition Does this make sense?
          Units: (A/m)²·Ω = W/m². ✓ It is $\tfrac12|I|^2R$ for each square meter. A better conductor (bigger $\sigma$) has a smaller $R_s$ and absorbs less for the same $H$. A perfect conductor, $R_s = 0$, absorbs nothing: a perfect mirror.
      `),
      Q(md`**Predict.** A metal has $\sigma = 2\times10^7$ S/m and, at the frequency of interest, $\delta = 5\ \mu$m. Its surface resistance is…`,
        [md`$0.01\ \Omega$`, md`$100\ \Omega$`, md`$0.0141\ \Omega$`, md`$5\times10^{-8}\ \Omega$`], 0,
        [null, md`That is $\sigma\delta$. The resistance goes the other way: $1/(\sigma\delta)$.`, md`That is $\sqrt2/(\sigma\delta) = |\eta|$. $R_s$ is only the real part.`, md`That is $1/\sigma$, a resistivity in $\Omega\cdot$m. Divide it by the thickness the current uses, $\delta$.`],
        md`$\sigma\delta = (2\times10^7)(5\times10^{-6}) = 100$, so $R_s = 1/100 = 0.01\ \Omega$.`),
      RF(md`
        ### 10. The skin as a sheet of resistance

        Why call $R_s$ the resistance of a **surface**? Follow the current. Inside the conductor $\tilde J = \sigma\tilde E$ falls as $e^{-\gamma z}$. Add it all up under one meter of surface width:
        $$\tilde J_s = \int_0^\infty\tilde J(0)e^{-\gamma z}\,dz = \frac{\tilde J(0)}{\gamma}$$
        That is the **total current per meter of width**, in A/m, the units of a sheet current. Now relate it to $\tilde H_0$. Put in $\tilde J(0) = \sigma\tilde E_0 = \sigma\eta\tilde H_0$:
        $$\tilde J_s = \frac{\sigma\eta}{\gamma}\,\tilde H_0$$
        From [Topic 5](#/l/w2-gamma), $\gamma/\eta = \sigma + j\omega\epsilon$, which is $\approx\sigma$ in a good conductor. So $\sigma\eta/\gamma \approx 1$:
        $$|\tilde J_s| = |\tilde H_0|$$
        This is the boundary condition $\hat n\times\mathbf H = \mathbf J_s$ of a perfect conductor, recovered for a real one (Lecture 26 does this integral). Put it in the box of Section 9:
        $$\boxed{\langle S\rangle_{\text{in}} = \tfrac12|\tilde J_s|^2R_s}$$
        That is a resistor's heat, $\tfrac12|I|^2R$, for each square meter: $\tilde J_s$ is the current and $R_s$ the resistance.

        **What resistance is $R_s$?** Take a square of a plate, side $L$, thickness $t$, with DC current flowing across it. Resistance is length over (conductivity times cross-section):
        $$R = \frac{L}{\sigma\,Lt} = \frac{1}{\sigma t}$$
        $L$ cancels: every square has the same resistance, called "ohms per square". Compare with $R_s = 1/(\sigma\delta)$. **A thick conductor at frequency $f$ acts like a sheet exactly one skin depth thick, carrying its current uniformly.**

        [[fig:skin]]

        Check that claim. The real current has $|\tilde J(z)| = |\tilde J(0)|e^{-z/\delta}$, and $|\gamma| = |1 + j|/\delta = \sqrt2/\delta$, so
        $$|\tilde J_s| = \frac{|\tilde J(0)|}{|\gamma|} = \frac{|\tilde J(0)|\,\delta}{\sqrt2}$$
        The heat in the real conductor, per square meter, is $\int\tfrac12|\tilde J|^2/\sigma\,dz$:
        $$\int_0^\infty\frac{|\tilde J(0)|^2}{2\sigma}e^{-2z/\delta}dz = \frac{|\tilde J(0)|^2\,\delta}{4\sigma}$$
        Now spread the same $|\tilde J_s|$ uniformly over a layer $\delta$ thick. Its density is $|\tilde J_s|/\delta = |\tilde J(0)|/\sqrt2$, and its heat is
        $$\frac{1}{2\sigma}\cdot\frac{|\tilde J(0)|^2}{2}\cdot\delta = \frac{|\tilde J(0)|^2\,\delta}{4\sigma}\ \checkmark$$
        Same total current, same heat. (Why is the layer's height $1/\sqrt2$ and not 1? The real current's phase turns with depth, $e^{-j\beta z}$, so deep current partly cancels shallow current in the total.)

        **Why "much thicker than $\delta$".** The integrals ran to $z = \infty$. A real plate of thickness $t$ gives the same answer only if the current has died before the back face. At $t = 3\delta$ the heat that would lie beyond the back is $e^{-6} = 0.25\%$ of the total; at $t = \delta$ it is $13.5\%$, and the sheet picture fails. A plate a few skin depths thick is "infinitely thick" to the wave.

        !!intuition Does this make sense?
          At DC, $\delta\to\infty$ and the current uses the whole plate: $1/(\sigma t)$. At high frequency the current crowds into a skin $\delta \ll t$, and the plate acts thinner and more resistive: $R_s/R_{DC} = t/\delta$.
      `, { skin: { svg: skinFig(), cap: 'Solid: $|\\tilde J(z)|/|\\tilde J(0)|$ in a thick good conductor. Dashed: a uniform layer one skin depth thick, at height $1/\\sqrt2$. Both carry the same total current and make the same heat.' } }),
      Q(md`**Predict.** A metal plate 1 mm thick is used at a frequency where $\delta = 10\ \mu$m. Its resistance per square at that frequency, compared with its DC value, is…`,
        [md`100 times larger`, md`10 times larger`, md`the same`, md`100 times smaller`], 0,
        [null, md`That takes a square root of $t/\delta$. The ratio is $t/\delta$ itself: the current uses $\delta$ instead of $t$.`, md`At DC the current fills the whole 1 mm. At this frequency it crowds into the top 10 $\mu$m.`, md`Upside down. Less thickness to flow in means **more** resistance.`],
        md`$R_s/R_{DC} = \dfrac{1/\sigma\delta}{1/\sigma t} = \dfrac{t}{\delta} = \dfrac{1\text{ mm}}{10\ \mu\text{m}} = 100$.`),
      R(md`
        ### 11. Frequency and material: copper against seawater

        Every good-conductor quantity is a square root:
        $$\delta = \frac{1}{\sqrt{\pi f\mu\sigma}}, \qquad R_s = \sqrt{\frac{\pi f\mu}{\sigma}}$$
        So **$R_s\propto\sqrt f$ and $\delta\propto1/\sqrt f$**. Four times the frequency halves the skin depth and doubles the surface resistance. A hundred times the frequency makes $\delta$ ten times thinner and $R_s$ ten times bigger. Higher frequency: the current crowds into a thinner skin, and the surface gets lossier. The angle $\tau = 45°$ does not change: it comes from $\sqrt j$, which has no $f$ in it.

        In the material, $R_s\propto1/\sqrt\sigma$ and $\delta\propto1/\sqrt\sigma$. Two good conductors, with $\mu = \mu_0$ (copper: $\sigma = 5.8\times10^7$ S/m; seawater: $\sigma = 4$ S/m, $\epsilon_r = 81$):

        | $f$ | copper $\delta$ | copper $R_s$ | seawater $\delta$ | seawater $R_s$ |
        |---|---|---|---|---|
        | 60 Hz | 8.5 mm | 2.0 μΩ | 32 m | 7.7 mΩ |
        | 1 kHz | 2.1 mm | 8.3 μΩ | 8.0 m | 31 mΩ |
        | 1 MHz | 66 μm | 0.26 mΩ | 25 cm | 0.99 Ω |
        | 1 GHz | 2.1 μm | 8.3 mΩ | — | — |

        - **Down a column, $\sqrt f$.** From 1 kHz to 1 MHz is a factor 1000 in $f$, so $\delta$ shrinks and $R_s$ grows by $\sqrt{1000}\approx32$.
        - **Across a row, $\sqrt\sigma$.** Copper conducts $1.45\times10^7$ times better than seawater. Its $\delta$ is $\sqrt{1.45\times10^7}\approx3800$ times thinner and its $R_s$ 3800 times smaller.
        - **The dashes.** At 1 GHz seawater has $\sigma/\omega\epsilon\approx0.9$. It is no longer a good conductor, and none of these formulas apply. Check the loss tangent before you use them.

        This table is why submarines listen at very low frequencies: at 60 Hz the field still has $1/e$ of its strength 32 m down, while at 1 MHz it is gone within a meter or two.

        !!intuition Does this make sense?
          Copper's $R_s$ at 1 GHz, 8 mΩ, is tiny next to $\eta_0 = 377\ \Omega$. To a wave in air, a metal looks almost like a short circuit. That is why it reflects almost everything ([Topic 11](#/l/w4-gamma)), and Worked example 4 finds how little it absorbs.
      `),
      Q(md`**Predict.** A metal has $R_s = 6$ mΩ at 100 MHz. At 900 MHz its $R_s$ is…`,
        [md`$18$ mΩ`, md`$54$ mΩ`, md`$2$ mΩ`, md`$6$ mΩ`], 0,
        [null, md`That scales with $f$. $R_s\propto\sqrt f$, and $\sqrt9 = 3$.`, md`That divides by 3. It is $\delta$ that shrinks with frequency; $R_s$ grows.`, md`$R_s = \sqrt{\pi f\mu/\sigma}$ has $f$ in it.`],
        md`$900/100 = 9$ and $\sqrt9 = 3$: $R_s = 3(6) = 18$ mΩ.`),
      R(md`
        ### The method

        !!method Power in a lossy medium
          1. **The medium.** Get $\alpha$, $|\eta|$ and $\tau$ ([Topic 5](#/l/w2-gamma), [Topic 7](#/l/w2-limits)). Check the loss tangent to pick the right limit.
          2. **Power at the start.** $S_0 = \dfrac{E_0^2}{2|\eta|}\cos\tau$, or $\tfrac12|H_0|^2\Re\{\eta\}$ when you know $H$.
          3. **Power further on.** Multiply by $e^{-2\alpha d}$, where $d$ is the distance traveled along the direction of travel, whatever the sign of $z$.
          4. **Power absorbed between two planes.** $A\big[\langle S\rangle(z_1) - \langle S\rangle(z_2)\big]$: in minus out.
          5. **dB and depths.** Loss is $8.686\,\alpha d$ dB. The amplitude falls to $x$ at $\delta\ln(1/x)$; the power at half that.
          6. **Good conductor.** $R_s = 1/(\sigma\delta)$. Power into the surface: $\tfrac12|\mathbf H_{\tan}|^2R_s = \tfrac12|\tilde J_s|^2R_s = E_0^2/4R_s$.
          7. **Check.** The heat at the surface, $\tfrac12\sigma E_0^2$, must equal $2\alpha S_0$ (that is (1)). Units: W/m² for $\langle S\rangle$, W/m³ for heat.

        ### Worked example 1: a lossy dielectric at 1 GHz

        !!graded Problem
          A non-magnetic material has $\epsilon_r = 4$ and $\sigma = 1/(600\pi)$ S/m. A 1 GHz wave travels toward $+z$ with $E_0 = 30$ V/m at $z = 0$. Find (a) $\langle S\rangle$ at $z = 0$; (b) $\langle S\rangle$ at $z = 10$ m; (c) the loss in dB over those 10 m; (d) the heat per cubic meter at $z = 0$; (e) the power absorbed between $z = 0$ and $z = 10$ m under each square meter, both ways.

        **Step 1: what kind of medium?** The displacement term, with $\epsilon_0 = \frac{10^{-9}}{36\pi}$:
        $$\omega\epsilon = (2\pi\times10^9)(4)\frac{10^{-9}}{36\pi} = \frac{8}{36} = \frac29\ \text{S/m}$$
        The loss tangent:
        $$\frac{\sigma}{\omega\epsilon} = \frac{1}{600\pi}\cdot\frac92 = \frac{3}{400\pi} \approx 0.0024$$
        Much less than 1: an **imperfect dielectric**.

        **Step 2: $|\eta|$, $\tau$, $\alpha$.** With so little loss, $|\eta|$ is the lossless value:
        $$|\eta| \approx \frac{120\pi}{\sqrt4} = 60\pi\ \Omega$$
        and $\tau \approx \sigma/2\omega\epsilon \approx 0.0012$ rad, so $\cos\tau = 0.999999$: call it 1. The sheet's low-loss line, $\alpha \approx \frac\sigma2\sqrt{\mu/\epsilon}$:
        $$\alpha \approx \frac{1}{2}\cdot\frac{1}{600\pi}\cdot60\pi = \frac{1}{20}\ \text{Np/m}$$
        **(a)**
        $$S_0 = \frac{E_0^2}{2|\eta|} = \frac{900}{120\pi} = \frac{7.5}{\pi} \approx 2.39\ \text{W/m}^2$$
        along $+\hat z$.

        **(b)** The wave travels 10 m, so multiply by $e^{-2\alpha d}$, with $2\alpha d = 2(0.05)(10) = 1$:
        $$\langle S\rangle(10\ \text{m}) = \frac{7.5}{\pi}e^{-1} \approx 0.878\ \text{W/m}^2$$
        **(c)** $8.686\,\alpha d = 8.686(0.05)(10) = 4.34$ dB. Check: $10\log_{10}e^{-1} = -4.34$. ✓

        **(d)**
        $$\langle p_d\rangle(0) = \tfrac12\sigma E_0^2 = \frac{900}{2(600\pi)} = \frac{0.75}{\pi} \approx 0.239\ \text{W/m}^3$$
        **(e) Way 1, the flow.** In minus out, per square meter:
        $$\frac{7.5}{\pi}\big(1 - e^{-1}\big) \approx 1.51\ \text{W}$$
        **Way 2, the heat.** Integrate (d) times $e^{-2\alpha z}$ from 0 to 10 m. The integral of $e^{-2\alpha z}$ is $(1 - e^{-1})/2\alpha = 10(1 - e^{-1})$:
        $$\frac{0.75}{\pi}\cdot10\,(1 - e^{-1}) = \frac{7.5}{\pi}(1 - e^{-1})\ \checkmark$$
        **Speed path.** Low loss means $\cos\tau = 1$ and $|\eta| = \eta_0/\sqrt{\epsilon_r}$. The 10 m is the power's $1/e$ distance, $1/2\alpha$, so (b) is $S_0/e$ and (c) is $4.34$ dB without arithmetic.

        **Where points go.** $e^{-\alpha d}$ for the power (that gives $e^{-1/2}$); $\eta_0$ in place of $\eta_0/2$; the missing $\tfrac12$ in (d).

        ### Worked example 2: talking to a submarine

        !!graded Problem
          Seawater has $\sigma = 4$ S/m, $\epsilon_r = 81$, $\mu = \mu_0$. Just below the surface, a 25 kHz wave has $E_0 = 1$ V/m and travels down. Find (a) $\alpha$ and $\delta$; (b) $|\eta|$, $\tau$ and $R_s$; (c) $S_0$, two ways; (d) the depth where the amplitude is 1% of its surface value; (e) the loss in dB per meter; (f) the depth of (d) at 250 Hz.

        **Step 1: a good conductor?** $\omega\epsilon = (2\pi)(25\times10^3)(81)\frac{10^{-9}}{36\pi} \approx 1.1\times10^{-4}$ S/m. Against $\sigma = 4$ S/m the ratio is about 36,000. Yes.

        **(a)** $\alpha = \sqrt{\pi f\mu\sigma}$. Collect the factors:
        $$\pi f\mu\sigma = \pi(25\times10^3)(4\pi\times10^{-7})(4)$$
        $$= 16\pi^2(2.5\times10^{-3}) = 0.04\pi^2$$
        So $\alpha = 0.2\pi \approx 0.628$ Np/m, and $\delta = 1/(0.2\pi) = 5/\pi \approx 1.59$ m.

        **(b)** $|\eta| = \sqrt{\omega\mu/\sigma}$:
        $$\frac{\omega\mu}{\sigma} = \frac{(2\pi)(25\times10^3)(4\pi\times10^{-7})}{4} = \frac{\pi^2}{200}$$
        So $|\eta| = \pi/\sqrt{200} = \pi/(10\sqrt2) \approx 0.222\ \Omega$, $\tau = 45°$, and
        $$R_s = |\eta|\cos45° = \frac{\pi}{20} \approx 0.157\ \Omega$$
        Check with the third form: $1/(\sigma\delta) = 1/(4\cdot5/\pi) = \pi/20$. ✓

        **(c) From $E$.** $1/|\eta| = 10\sqrt2/\pi$, so
        $$S_0 = \frac{E_0^2}{2|\eta|}\cos45° = \frac{10\sqrt2}{2\pi}\cdot\frac{1}{\sqrt2} = \frac5\pi$$
        That is $\approx1.59$ W/m². **From $H$.** $H_0 = E_0/|\eta| = 10\sqrt2/\pi \approx 4.50$ A/m, and
        $$S_0 = \tfrac12H_0^2R_s = \tfrac12\cdot\frac{200}{\pi^2}\cdot\frac{\pi}{20} = \frac5\pi\ \checkmark$$
        **(d)** 1% of the amplitude: $d = \delta\ln100 = 4.61(5/\pi) \approx 7.33$ m.

        **(e)** $8.686\,\alpha = 8.686(0.2\pi) \approx 5.46$ dB/m. Check: $7.33\times5.46 = 40$ dB, the 1% amplitude. ✓

        **(f)** 250 Hz is $1/100$ of the frequency, so $\delta$ is $\sqrt{100} = 10$ times larger: $\delta = 50/\pi \approx 15.9$ m, and the 1% depth is about $73$ m.

        **Speed path.** Remember seawater's $\alpha = \pi/25$ at 1 kHz (the lecture's number) and scale by $\sqrt f$: 25 kHz is $\sqrt{25} = 5$ times higher, so $\alpha = \pi/5$. For the power in a good conductor, $S_0 = E_0^2/4R_s = 1/(4\pi/20) = 5/\pi$ in one line.

        **Where points go.** Using the 1% **power** depth ($2.3\delta = 3.66$ m) when the question says amplitude; scaling $\delta$ with $f$ instead of $\sqrt f$; dropping $\cos45°$ in $S_0$.

        ### Worked example 3: the energy books of a cube

        !!graded Problem
          The skill HW 9 #3(e, f) asks for, with new numbers. In a non-magnetic material, $\tilde{\mathbf E} = \hat x\,20e^{-\gamma z}$ V/m with $\gamma = 1 + j\sqrt3$ 1/m, and $\eta = 100e^{j30°}\ \Omega$. Find $\sigma$, the power entering and leaving the cube $0 < x, y, z < 1$ m, and the power dissipated inside it. Check with the heat integral.

        **Step 1: σ from the sheet.** $\sigma = \Re\{\gamma/\eta\}$. In polar form $\gamma = 2e^{j60°}$:
        $$\frac\gamma\eta = \frac{2e^{j60°}}{100e^{j30°}} = 0.02e^{j30°}$$
        $$\sigma = 0.02\cos30° = \frac{\sqrt3}{100} \approx 0.0173\ \text{S/m}$$
        Check with (1): $2\alpha\cos\tau/|\eta| = 2(1)(\sqrt3/2)/100 = \sqrt3/100$. ✓ And $60° + 30° = 90°$, as $\eta\gamma = j\omega\mu$ demands.

        **Step 2: power in through the face $z = 0$.** Its area is 1 m²:
        $$S_0 = \frac{20^2}{2(100)}\cos30° = 2\cdot\frac{\sqrt3}{2} = \sqrt3 \approx 1.73\ \text{W}$$
        **Step 3: power out through the face $z = 1$ m.** $2\alpha d = 2$:
        $$\sqrt3\,e^{-2} \approx 0.234\ \text{W}$$
        The four side faces carry nothing: $\langle\mathbf S\rangle$ is along $\hat z$.

        **Step 4: dissipated.** In minus out:
        $$P_{\text{abs}} = \sqrt3\,(1 - e^{-2}) \approx 1.50\ \text{W}$$
        **Check by integrating.** At $z = 0$, $\tfrac12\sigma E_0^2 = \tfrac12\cdot\frac{\sqrt3}{100}\cdot400 = 2\sqrt3$ W/m³. It falls as $e^{-2z}$; integrate over the cube:
        $$\int_0^12\sqrt3\,e^{-2z}dz = 2\sqrt3\cdot\frac{1 - e^{-2}}{2} = \sqrt3(1 - e^{-2})\ \checkmark$$
        **Speed path.** You never needed $\sigma$: power in minus power out. Use the integral only as a check, or when a question insists on "integrate $\langle\mathbf J\cdot\mathbf E\rangle$".

        **Where points go.** $e^{-\alpha}$ instead of $e^{-2\alpha}$ at the exit face (it gives $\sqrt3e^{-1}$); dropping $\cos\tau$, which inflates everything by $2/\sqrt3$.

        ### Worked example 4: a metal surface at 1 GHz

        !!graded Problem
          A thick block of metal with $\sigma = 6.4\times10^7$ S/m (close to silver) and $\mu = \mu_0$. At 1 GHz the tangential $\mathbf H$ at its surface has amplitude 2 A/m. Find (a) $R_s$ and $\delta$; (b) the power absorbed per square meter, and the skin current $|\tilde J_s|$; (c) both at 4 GHz with the same surface $H$; (d) what fraction of an incident wave's power the metal absorbs, if that $H$ comes from a wave in air with $H_i = 1$ A/m reflecting off the metal.

        **(a)**
        $$R_s = \sqrt{\frac{\pi f\mu}{\sigma}} = \sqrt{\frac{\pi(10^9)(4\pi\times10^{-7})}{6.4\times10^7}}$$
        The top is $4\pi^2\times10^2$, whose root is $20\pi$. The bottom's root is $\sqrt{6.4\times10^7} = 8000$:
        $$R_s = \frac{20\pi}{8000} = \frac{\pi}{400} \approx 7.85\ \text{m}\Omega$$
        Then $\delta = 1/(\sigma R_s)$:
        $$\delta = \frac{400}{\pi(6.4\times10^7)} \approx 1.99\ \mu\text{m}$$
        **(b)** $\tfrac12|H|^2R_s = \tfrac12(4)\frac{\pi}{400} = \frac{\pi}{200} \approx 15.7$ mW/m². The skin current is $|\tilde J_s| = |\tilde H_{\tan}| = 2$ A/m, and $\tfrac12|\tilde J_s|^2R_s$ is the same number.

        **(c)** Four times the frequency: $R_s\propto\sqrt f$ doubles to $\pi/200 \approx 15.7$ mΩ, $\delta$ halves to $0.99\ \mu$m, and the absorbed power doubles to $31.4$ mW/m². $|\tilde J_s|$ is still 2 A/m, squeezed into half the depth.

        **(d)** The incident wave carries $\tfrac12H_i^2\eta_0 = \tfrac12(1)^2(120\pi) = 60\pi \approx 188$ W/m². At a nearly perfect conductor the reflected wave doubles the tangential $H$ at the surface ([Topic 12](#/l/w4-standing)), so $|\mathbf H_{\tan}| = 2$ A/m, which is part (b). The fraction absorbed:
        $$\frac{\pi/200}{60\pi} = \frac{1}{12000} \approx 8.3\times10^{-5}$$
        In symbols, $\tfrac12(2H_i)^2R_s\big/\tfrac12H_i^2\eta_0 = 4R_s/\eta_0$. A silver mirror at 1 GHz absorbs less than 0.01% of the power and reflects the rest.

        **Speed path.** Group $\pi\cdot4\pi = 4\pi^2$ under the root so it comes out as $2\pi$ times a power of ten. For any other frequency, scale by $\sqrt f$; never recompute.

        **Where points go.** $|\eta| = \sqrt2R_s$ in place of $R_s$ (too big by $\sqrt2$); the missing $\tfrac12$; scaling with $f$ instead of $\sqrt f$.

        ### Worked example 5: the exam versions (Summer 2018 and 2019 #3(b); SP24 #2(c))

        !!graded Problem
          (a) Seawater ($\sigma = 4$ S/m, $\epsilon_r = 81$, $\mu = \mu_0$) carries a 1 kHz wave toward $-z$, with $\langle S\rangle = 1$ W/m² at $z = 0$. Find $\langle S\rangle$ at $z = -10$ m. (b) A wave travels toward $+\hat x$ in a good conductor. Which are true? (i) $-\nabla\cdot\mathbf S$ equals the rate of change of the stored energy density. (ii) $\nabla\cdot\langle\mathbf S\rangle$ equals the time-averaged rate of energy dissipation in the medium. (iii) $\langle\mathbf S\rangle$ decreases as the wave propagates along $+\hat x$. (iv) $\langle\mathbf S\rangle$ would increase if the wave propagated along $-\hat x$. (v) $|\langle\mathbf S\rangle| = |\mathbf E|^2/2\eta_0$ at $x = 0$.

        **(a)** At 1 kHz:
        $$\pi f\mu\sigma = \pi(10^3)(4\pi\times10^{-7})(4) = 16\pi^2\times10^{-4}$$
        so $\alpha = 4\pi\times10^{-2} = \pi/25$ Np/m. The wave has traveled 10 m to reach $z = -10$, so multiply by $e^{-2\alpha d}$:
        $$\langle S\rangle(-10) = e^{-2(\pi/25)(10)} = e^{-4\pi/5}\ \text{W/m}^2$$
        which is about $0.081$ W/m², a loss of $8.686(\pi/25)(10) \approx 10.9$ dB. Both summer keys get $0.081$ W/m². Without a calculator: $4\pi/5 \approx 2.5$, and $e^{-2.5} = e^{-2}e^{-1/2} \approx 0.135\times0.61 = 0.082$.

        **(b)** Only (iii) is true.

        - (i) False. The full theorem is $-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$, and in a good conductor $\mathbf J\cdot\mathbf E$ is the main term.
        - (ii) False, by a sign: $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$ (Section 5). The flow shrinks where heat appears.
        - (iii) True: $\langle S\rangle\propto e^{-2\alpha x}$.
        - (iv) False. A wave toward $-\hat x$ has $\langle S\rangle\propto e^{+2\alpha x}$, which also shrinks along its own direction of travel.
        - (v) False, twice over. The medium's $\eta$ is not $\eta_0$, and $\cos\tau = \cos45°$ is missing. The right value is $|E|^2\cos45°/2|\eta| = |E|^2/4R_s$.

        The posted SP24 key circles only (iii), which is right. In its margin it writes $\langle\mathbf S\rangle = \tfrac12|E|^2e^{-2\alpha x}/\eta$. With a complex $\eta$ that is not even a real number. The correct form is $\tfrac12|E|^2\Re\{1/\eta\}\,e^{-2\alpha x} = (|E|^2/2|\eta|)\cos\tau\,e^{-2\alpha x}$.

        **Speed path.** Test each statement against two lines: $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$, and "power shrinks along the direction of travel".

        **Where points go.** Putting $z = -10$ into $e^{-2\alpha z}$ (that gives $e^{+4\pi/5} \approx 12$ W/m², a gain); circling (ii) because it sounds right; missing that (v) also drops $\cos\tau$.

        ### The whole topic on one table

        | Quantity | Formula | Where it came from |
        |---|---|---|
        | average of a product | $\tfrac12\Re\{\tilde A\tilde B^*\}$ | product of two cosines |
        | power density | $\dfrac{E_0^2}{2|\eta|}e^{-2\alpha z}\cos\tau$ | $\tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$ |
        | the same, from $H$ | $\tfrac12|H_0|^2\Re\{\eta\}$ | $\tilde E = \eta\tilde H$ |
        | heat density | $\tfrac12\sigma|\tilde E|^2$ | $\langle\mathbf J\cdot\mathbf E\rangle$ with $\mathbf J = \sigma\mathbf E$ |
        | the books balance | $\sigma = 2\alpha\cos\tau/|\eta|$ | $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$ |
        | absorbed in a slab | $A[\langle S\rangle(z_1) - \langle S\rangle(z_2)]$ | in minus out |
        | loss in dB | $8.686\,\alpha d$ | $10\log_{10}e^{-2\alpha d}$ |
        | amplitude down to $x$ | $\delta\ln(1/x)$ | $e^{-\alpha d} = x$ |
        | power down to $x$ | $\tfrac12\delta\ln(1/x)$ | $e^{-2\alpha d} = x$ |
        | surface resistance | $R_s = \Re\{\eta\} = 1/\sigma\delta = \sqrt{\pi f\mu/\sigma}$ | $\eta = (1 + j)R_s$ in a good conductor |
        | power into a conductor | $\tfrac12|\mathbf H_{\tan}|^2R_s = \tfrac12|\tilde J_s|^2R_s$ | $\langle S\rangle$ from $H$; $|\tilde J_s| = |\mathbf H_{\tan}|$ |

        !!mistake Common mistakes
          - **$e^{-\alpha z}$ for the power.** Power decays as $e^{-2\alpha z}$: square the field ratio.
          - **Dropping $\cos\tau$, or using $\eta_0$.** In a good conductor $\cos\tau = 1/\sqrt2$, and $\eta$ is the conductor's, not free space's.
          - **$E_0^2/(2\Re\{\eta\})$.** The $E$ form is $\tfrac12E_0^2\Re\{1/\eta\}$, and $\Re\{1/\eta\}\ne1/\Re\{\eta\}$.
          - **$10\log$ of a field ratio.** Fields take $20\log$.
          - **4.343 for 8.686.** The 2 of $e^{-2\alpha d}$ is inside 8.686.
          - **The wrong 1% depth.** Amplitude: $4.6\delta$. Power: $2.3\delta$.
          - **A negative $z$ in $e^{-2\alpha z}$ for a backward wave.** Use the distance traveled.
          - **$R_s = |\eta|$.** $R_s$ is the real part, $|\eta|/\sqrt2$.
          - **$R_s\propto f$.** It goes as $\sqrt f$.
          - **The missing $\tfrac12$** in $\tfrac12\sigma E_0^2$ and $\tfrac12|H|^2R_s$.
          - **$\nabla\cdot\langle\mathbf S\rangle = +\langle\mathbf J\cdot\mathbf E\rangle$.** The sign is minus.

        !!key Speed tricks
          - **$\langle S\rangle$ in one breath:** $\dfrac{E_0^2}{2|\eta|}\cos\tau$. Low loss: $\cos\tau = 1$. Good conductor: $E_0^2/4R_s$, or $\tfrac12H^2R_s$.
          - **Square the field ratio.** Field to 1/2 means power to 1/4.
          - **Every skin depth costs 8.7 dB.** After $\delta$, 13.5% of the power is left; 86% was absorbed in the first $\delta$.
          - **1% amplitude = $4.6\delta$ = 40 dB. 1% power = $2.3\delta$ = 20 dB.**
          - **$e^{-1} = 0.37$, $e^{-2} = 0.135$, $e^{-3} = 0.05$, $e^{-1/2} = 0.61$.** 3 dB is a factor of 2; 10 dB a factor of 10.
          - **Seawater:** $\alpha = \pi/25$ Np/m at 1 kHz ($\delta = 8$ m). Scale by $\sqrt f$.
          - **Metals:** $R_s = 1/\sigma\delta$. Scale by $\sqrt f$.
          - **Absorbed in a slab = in − out.** Integrate only to check.
          - **A metal mirror absorbs $4R_s/\eta_0$** of the incident power.

        ### Check questions
      `),
      Q(md`A wave has $\langle S\rangle = 6$ W/m² at $z = 0$ and travels toward $+z$ with $\alpha = 0.25$ Np/m. At $z = 4$ m, $\langle S\rangle$ is about…`,
        [md`$0.81$ W/m²`, md`$2.21$ W/m²`, md`$5.19$ W/m²`, md`$0.11$ W/m²`], 0,
        [null, md`That is $6e^{-1}$, the field's rate. Power decays at $2\alpha$: $2\alpha d = 2$.`, md`That is $6(1 - e^{-2})$, the power **absorbed** on the way, not what is left.`, md`That is $6e^{-4}$: it squares the power ratio a second time.`],
        md`$2\alpha d = 2(0.25)(4) = 2$, so $\langle S\rangle = 6e^{-2} \approx 6(0.135) = 0.81$ W/m².`),
      Q(md`Two lossy media have the same $|\eta|$. In one, $\tau = 0$; in the other, $\tau = 45°$. For the same $E_0$, the ratio of their $S_0$ (second over first) is…`,
        [md`$1/\sqrt2$`, md`$1/2$`, md`$1$`, md`$\sqrt2$`], 0,
        [null, md`That is $\cos^2\tau$. The power has one factor of $\cos\tau$.`, md`$|\eta|$ alone does not set the power. The lag costs a factor $\cos\tau$.`, md`A lag can only reduce the average power, never raise it.`],
        md`$S_0 = (E_0^2/2|\eta|)\cos\tau$: the ratio is $\cos45° = 1/\sqrt2$.`),
      Q(md`A slab starting at the surface of a lossy medium absorbs 75% of the power that enters it. How thick is it, in skin depths?`,
        [md`$0.69\delta$`, md`$1.39\delta$`, md`$0.75\delta$`, md`$0.35\delta$`], 0,
        [null, md`That solves $e^{-\alpha d} = 1/4$, the field. 25% of the **power** left means $e^{-2\alpha d} = 1/4$.`, md`Absorption is not linear in thickness. Solve $e^{-2\alpha d} = 0.25$.`, md`That halves the right answer once more. $e^{-2\alpha d} = 1/4$ gives $2\alpha d = \ln4 = 2\ln2$.`],
        md`25% is left: $e^{-2\alpha d} = 1/4$, so $2\alpha d = \ln4 = 1.39$ and $d = 0.69/\alpha = 0.69\delta$.`),
      Q(md`A 20 dB loss leaves what fraction of the **field amplitude**?`,
        [md`$1/10$`, md`$1/100$`, md`$1/20$`, md`$e^{-20}$`], 0,
        [null, md`That is the power fraction. The field is its square root.`, md`dB are logarithms, not divisions.`, md`dB use $\log_{10}$, not $\ln$: $-20$ dB is $10^{-20/20}$ for a field.`],
        md`$20\log_{10}(E_2/E_1) = -20$ gives $E_2/E_1 = 10^{-1}$. The power is down to $1/100$.`),
      Q(md`A good conductor's $\sigma$ is doubled at a fixed frequency. For the same $|\mathbf H_{\tan}|$ at its surface, the absorbed power per square meter is multiplied by…`,
        [md`$1/\sqrt2$`, md`$1/2$`, md`$\sqrt2$`, md`$1$`], 0,
        [null, md`$R_s = \sqrt{\pi f\mu/\sigma}$ has $\sigma$ under a square root.`, md`A better conductor absorbs **less**, not more.`, md`$R_s$ depends on $\sigma$, and the absorbed power is $\tfrac12|H|^2R_s$.`],
        md`$R_s\propto1/\sqrt\sigma$, so doubling $\sigma$ multiplies $R_s$, and the power $\tfrac12|H|^2R_s$, by $1/\sqrt2$.`),
      Q(md`Inside a thick good conductor, where is the heat per cubic meter largest?`,
        [md`At the surface`, md`At one skin depth`, md`It is the same everywhere in the first skin depth`, md`At the back face`], 0,
        [null, md`$\tfrac12\sigma|\tilde E|^2$ falls as $e^{-2z/\delta}$ from the surface down. Nothing peaks inside.`, md`That is the uniform-layer **model**. The real current is largest at the surface.`, md`The fields have died long before the back of a thick conductor.`],
        md`$\langle p_d\rangle = \tfrac12\sigma E_0^2e^{-2z/\delta}$, largest at $z = 0$.`),
      Q(md`Which is the time-averaged Poynting theorem in a lossy medium?`,
        [md`$\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$`, md`$\nabla\cdot\langle\mathbf S\rangle = +\langle\mathbf J\cdot\mathbf E\rangle$`, md`$\nabla\cdot\langle\mathbf S\rangle = 0$`, md`$\nabla\cdot\langle\mathbf S\rangle = -\partial\langle w\rangle/\partial t$`], 0,
        [null, md`Wrong sign: that would make the flow grow where heat appears.`, md`That is true only with no loss. Here the flow shrinks to pay for the heat.`, md`The average stored energy does not change from period to period; the loss term is what survives.`],
        md`Average $\nabla\cdot\mathbf S + \partial w/\partial t + \mathbf J\cdot\mathbf E = 0$; $\langle\partial w/\partial t\rangle = 0$ in steady state.`),
      Q(md`A metal has $R_s = 10$ mΩ, and $|\mathbf H_{\tan}| = 4$ A/m at its surface. The power absorbed per square meter is…`,
        [md`$80$ mW/m²`, md`$160$ mW/m²`, md`$113$ mW/m²`, md`$20$ mW/m²`], 0,
        [null, md`That forgets the $\tfrac12$ of the time average.`, md`That uses $|\eta| = \sqrt2R_s$. Only the real part absorbs.`, md`That forgets to square $H$.`],
        md`$\tfrac12(4)^2(0.01) = 0.08$ W/m² $= 80$ mW/m².`),
      Q(md`Copper has $R_s \approx 0.83$ mΩ at 10 MHz. At 1 GHz it is about…`,
        [md`$8.3$ mΩ`, md`$83$ mΩ`, md`$0.083$ mΩ`, md`$0.83$ mΩ`], 0,
        [null, md`That scales with $f$. $R_s\propto\sqrt f$: $\sqrt{100} = 10$.`, md`That divides. $R_s$ grows with frequency; it is $\delta$ that shrinks.`, md`$R_s = \sqrt{\pi f\mu/\sigma}$ depends on $f$.`],
        md`$1\text{ GHz}/10\text{ MHz} = 100$, and $\sqrt{100} = 10$: $R_s = 8.3$ mΩ.`),
      Q(md`In a good conductor, the depth where the **power** is 1% compared with the depth where the **amplitude** is 1%:`,
        [md`half as deep`, md`the same`, md`twice as deep`, md`$\sqrt2$ times as deep`], 0,
        [null, md`Power decays twice as fast as the field, so it reaches 1% sooner.`, md`Backward: the power goes first, since it decays at $2\alpha$.`, md`The exponents are $\alpha d$ and $2\alpha d$: a plain factor 2, no root.`],
        md`$2.3\delta$ against $4.6\delta$.`),
      R(md`
        ### Practice, level 1: the power density

        **The trick:** $\langle S\rangle = \dfrac{E_0^2}{2|\eta|}\cos\tau = \tfrac12|H_0|^2\Re\{\eta\}$. Good conductor: $E_0^2/4R_s$. Each card asks for one move. Answer in about 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_w2l_S', { need: 8 }), { id: 'w2-loss.r0' }),
      R(md`
        ### Practice, level 1: how much is left

        **The trick:** multiply by $e^{-2\alpha d}$ with $d$ the distance traveled. Power ratio = field ratio squared. In a slab: in minus out.
      `),
      Object.assign(G('rf_w2l_decay', { need: 8 }), { id: 'w2-loss.r1' }),
      R(md`
        ### Practice, level 1: decibels and depths

        **The trick:** loss $= 8.686\,\alpha d$ dB; $10\log$ for power, $20\log$ for fields. 1% of the amplitude at $4.6\delta$, of the power at $2.3\delta$.
      `),
      Object.assign(G('rf_w2l_db', { need: 8 }), { id: 'w2-loss.r2' }),
      R(md`
        ### Practice, level 1: surface resistance

        **The trick:** $R_s = 1/\sigma\delta = \sqrt{\pi f\mu/\sigma}\propto\sqrt f$, and $|\eta| = \sqrt2R_s$. Power in: $\tfrac12|\mathbf H_{\tan}|^2R_s$.
      `),
      Object.assign(G('rf_w2l_rs', { need: 8 }), { id: 'w2-loss.r3' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w2l_lossy', { need: 2 }),
      G('w2l_cube', { need: 2 }),
      G('w2l_metal', { need: 2 }),
      G('w2l_depth', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A good conductor from start to finish, the way SP24 #2 asks it: $\gamma$, the surface resistance, the power at two depths, the power absorbed between two planes, and a statement to judge.
      `),
      G('w2l_exam', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- helpers for the generators
  const n3 = (x) => p(+x.toPrecision(3));
  const Wm = (x) => `$${n3(x)}$ W/m²`;
  const eT = (S, n) => `$${p(S)}e^{-${p(n)}}$ W/m²`;
  const dB = (x) => `$${n3(x)}$ dB`;
  // traps that are not (nearly) the right answer
  const TR = (part, list) => Object.assign(part, { traps: list.filter(([v]) => isFinite(v) && Math.abs(v - part.ans) > 0.03 * Math.abs(part.ans)).map(([v, msg]) => ({ v, msg })) });
  const dTex = (d) => (d < 1e-3 ? `${p(+(d * 1e6).toPrecision(4))}\\ \\mu\\text{m}` : d < 0.1 ? `${p(+(d * 1e3).toPrecision(4))}\\ \\text{mm}` : `${p(d)}\\ \\text{m}`);

  // ---------------------------------------------------------------- level 1: the power density
  GENS.rf_w2l_S = () => one([
    () => {
      const E0 = pick([2, 4, 6, 10, 20]), m = pick([50, 100, 200, 400]), t = pick([30, 45]);
      const c = Math.cos(t * D), s = Math.sin(t * D), r = E0 * E0 * c / (2 * m);
      return MC('⟨S⟩ from E₀ and η', md`At $z = 0$ a wave has $E_0 = ${E0}$ V/m, in a medium with $\eta = ${m}e^{j${t}°}\ \Omega$. Its $\langle S\rangle$ there is…`, Wm(r),
        [[Wm(E0 * E0 / (2 * m)), md`That drops $\cos\tau$. $H$ lags $E$ by $${t}°$, which costs a factor $\cos${t}°$.`],
          [Wm(E0 * E0 * s / (2 * m)), md`That uses $\sin\tau$. The real part of $e^{j\tau}$ is $\cos\tau$.`],
          [Wm(E0 * E0 * c / m), md`That forgets the $\tfrac12$ of the time average.`],
          [Wm(E0 * c / (2 * m)), md`That forgets to square $E_0$: the power is $E_0$ times $H_0 = E_0/|\eta|$.`],
          [Wm(E0 * E0 / (2 * m * c)), md`That divides by $\cos\tau$. The lag lowers the power, so $\cos\tau$ multiplies.`]],
        md`$\langle S\rangle = \dfrac{E_0^2}{2|\eta|}\cos\tau = \dfrac{${E0 * E0}}{${2 * m}}\cos${t}° = ${n3(r)}$ W/m².`);
    },
    () => {
      const H0 = pick([1, 2, 3, 4]), [a, b] = pick([[40, 30], [24, 7], [80, 60], [8, 6], [20, 15], [60, 11]]);
      const mag = Math.hypot(a, b), r = 0.5 * H0 * H0 * a;
      return MC('⟨S⟩ from H₀ and η', md`Just inside a material, $|\tilde H| = ${H0}$ A/m and $\eta = ${a} + j${b}\ \Omega$. The power per square meter flowing in is…`, Wm(r),
        [[Wm(0.5 * H0 * H0 * mag), md`That uses $|\eta| = ${n3(mag)}\ \Omega$. Only the real part of $\eta$ carries average power.`],
          [Wm(0.5 * H0 * H0 * b), md`That uses $\Im\{\eta\}$, the part that stores energy and gives it back.`],
          [Wm(H0 * H0 * a), md`That forgets the $\tfrac12$ of the time average.`],
          [Wm(H0 * H0 / (2 * a)), md`That divides by $2\Re\{\eta\}$. With $H$, $\eta$ multiplies: $\tfrac12|H_0|^2\Re\{\eta\}$.`]],
        md`$\langle S\rangle = \tfrac12|H_0|^2\Re\{\eta\} = \tfrac12(${H0 * H0})(${a}) = ${n3(r)}$ W/m².`);
    },
    () => {
      const E0 = pick([5, 10, 20, 50]), [a, b] = pick([[80, 60], [120, 50], [240, 70], [160, 120], [48, 14]]);
      const mag2 = a * a + b * b, r = 0.5 * E0 * E0 * a / mag2;
      return MC('⟨S⟩ from E₀ and a rectangular η', md`At $z = 0$, $E_0 = ${E0}$ V/m in a medium with $\eta = ${a} + j${b}\ \Omega$. Its $\langle S\rangle$ there is…`, Wm(r),
        [[Wm(E0 * E0 / (2 * a)), md`That is $E_0^2/2\Re\{\eta\}$. The $E$ form needs $\Re\{1/\eta\} = ${a}/${mag2}$, not $1/${a}$.`],
          [Wm(E0 * E0 / (2 * Math.sqrt(mag2))), md`That is $E_0^2/2|\eta|$, without $\cos\tau = ${a}/${p(Math.sqrt(mag2))}$.`],
          [Wm(E0 * E0 * a / mag2), md`That forgets the $\tfrac12$ of the time average.`],
          [Wm(0.5 * E0 * E0 * a), md`That multiplies by $\Re\{\eta\}$, the form for $H$. With $E$, divide: $\tilde H = \tilde E/\eta$.`]],
        md`$\Re\{1/\eta\} = \dfrac{${a}}{${a}^2 + ${b}^2} = \dfrac{${a}}{${mag2}}$ S, so $\langle S\rangle = \tfrac12(${E0 * E0})\dfrac{${a}}{${mag2}} = ${n3(r)}$ W/m².`);
    },
    () => {
      const E0 = pick([0.1, 0.2, 0.5, 1]), Rs = pick([0.05, 0.1, 0.2, 0.5]), r = E0 * E0 / (4 * Rs);
      return MC('⟨S⟩ into a good conductor', md`Just inside a good conductor with $R_s = ${p(Rs)}\ \Omega$, the field amplitude is $E_0 = ${p(E0)}$ V/m. The power per square meter flowing in is…`, Wm(r),
        [[Wm(E0 * E0 / (2 * Rs)), md`That is $E_0^2/2\Re\{\eta\}$. The $E$ form needs $\Re\{1/\eta\}$, and $\Re\{1/[(1 + j)R_s]\} = 1/2R_s$.`],
          [Wm(E0 * E0 / (2 * Math.SQRT2 * Rs)), md`That uses $|\eta| = \sqrt2R_s$ but drops $\cos45°$.`],
          [Wm(E0 * E0 / (240 * Math.PI)), md`That uses $\eta_0$. The wave is inside the conductor, whose $\eta$ is $(1 + j)R_s$.`],
          [Wm(0.5 * E0 * E0 * Rs), md`That multiplies by $R_s$. $\tfrac12|\cdot|^2R_s$ is the form for $H$, not $E$.`]],
        md`$\eta = (1 + j)R_s$: $|\eta| = \sqrt2R_s$ and $\cos\tau = 1/\sqrt2$. So $\langle S\rangle = \dfrac{E_0^2}{2\sqrt2R_s}\cdot\dfrac{1}{\sqrt2} = \dfrac{E_0^2}{4R_s} = \dfrac{${p(E0 * E0)}}{${p(4 * Rs)}} = ${n3(r)}$ W/m².`);
    },
    () => {
      const [q, r, w, s] = pick([
        [md`In terms of the amplitude $H_0$ of $\tilde H$, $\langle S\rangle$ is…`, md`$\tfrac12|H_0|^2\Re\{\eta\}$`,
          [[md`$\tfrac12|H_0|^2|\eta|$`, md`The imaginary part of $\eta$ carries no average power; $|\eta|$ includes it.`], [md`$|H_0|^2/(2\Re\{\eta\})$`, md`With $H$, $\eta$ multiplies: $\tilde E = \eta\tilde H$.`], [md`$\tfrac12|H_0|^2\Im\{\eta\}$`, md`The imaginary part stores energy and gives it back.`]],
          md`$\tilde E = \eta\tilde H$, so $\tfrac12\Re\{\tilde E\tilde H^*\} = \tfrac12|H_0|^2\Re\{\eta\}$.`],
        [md`In terms of the amplitude $E_0$, $\langle S\rangle$ is…`, md`$\tfrac12|E_0|^2\Re\{1/\eta\}$`,
          [[md`$|E_0|^2/(2\Re\{\eta\})$`, md`$\Re\{1/\eta\}$ is not $1/\Re\{\eta\}$; this one is off by $\cos^2\tau$.`], [md`$\tfrac12|E_0|^2\Re\{\eta\}$`, md`With $E$, $\eta$ divides: $\tilde H = \tilde E/\eta$.`], [md`$|E_0|^2/2|\eta|$`, md`That drops $\cos\tau$.`]],
          md`$\tilde H^* = \tilde E^*/\eta^*$, so $\langle S\rangle = \tfrac12|E_0|^2\Re\{1/\eta^*\} = \tfrac12|E_0|^2\Re\{1/\eta\}$.`],
        [md`$A(t)$ and $B(t)$ are sinusoids at one frequency, with phasors $\tilde A$ and $\tilde B$. The time average of $A(t)B(t)$ is…`, md`$\tfrac12\Re\{\tilde A\tilde B^*\}$`,
          [[md`$\Re\{\tilde A\tilde B\}$`, md`Without the conjugate the phases add instead of subtracting, and the $\tfrac12$ is missing.`], [md`$\tfrac12|\tilde A||\tilde B|$`, md`That ignores the phase difference; it is right only when they are in step.`], [md`$\tfrac12\Im\{\tilde A\tilde B^*\}$`, md`The average is $\tfrac12|A||B|\cos(a - b)$, a real part.`]],
          md`$\langle AB\rangle = \tfrac12|A||B|\cos(a - b) = \tfrac12\Re\{\tilde A\tilde B^*\}$.`],
        [md`The time-averaged heat per cubic meter in a conductor is…`, md`$\tfrac12\sigma|\tilde E|^2$`,
          [[md`$\sigma|\tilde E|^2$`, md`That is the peak of $\sigma E^2$. The average of $\cos^2$ is $\tfrac12$.`], [md`$|\tilde E|^2/2\sigma$`, md`Conductance multiplies: more $\sigma$, more current, more heat.`], [md`$\tfrac12\sigma|\tilde E|$`, md`That has the units of a current density. Heat goes as $E^2$.`]],
          md`$\langle\mathbf J\cdot\mathbf E\rangle = \tfrac12\Re\{\sigma\tilde{\mathbf E}\cdot\tilde{\mathbf E}^*\} = \tfrac12\sigma|\tilde E|^2$.`],
      ]);
      return MC('Which formula?', q, r, w, s);
    },
  ]);

  // ---------------------------------------------------------------- level 1: how much is left
  GENS.rf_w2l_decay = () => one([
    () => {
      const S0 = pick([2, 4, 5, 10]), a = pick([0.05, 0.1, 0.2, 0.5, 1, 2]), n = pick([1, 2, 3]), d = n / (2 * a);
      return MC('Power further on', md`A wave carries $\langle S\rangle = ${S0}$ W/m² at $z = 0$ and travels toward $+z$ in a medium with $\alpha = ${p(a)}$ Np/m. At $z = ${p(d)}$ m, $\langle S\rangle$ is…`, eT(S0, n),
        [[eT(S0, n / 2), md`That uses $e^{-\alpha d}$, the field's rate. Power decays as $e^{-2\alpha d}$.`],
          [eT(S0, 2 * n), md`That doubles twice: $2\alpha d = ${n}$, not $${2 * n}$.`],
          [`$${S0}$ W/m²`, md`In a lossy medium the power shrinks as the wave travels.`],
          [`$${S0}e^{+${n}}$ W/m²`, md`A passive material cannot give the wave power. The exponent is negative along the direction of travel.`]],
        md`$2\alpha d = 2(${p(a)})(${p(d)}) = ${n}$, so $\langle S\rangle = ${S0}e^{-${n}} \approx ${n3(S0 * Math.exp(-n))}$ W/m².`);
    },
    () => {
      const S0 = pick([1, 2, 4, 10]), a = pick([0.05, 0.1, 0.25, 0.5]), n = pick([1, 2, 3]), d = n / (2 * a);
      return MC('A wave toward −z', md`A wave travels toward $-z$ with $\alpha = ${p(a)}$ Np/m, and $\langle S\rangle = ${S0}$ W/m² at $z = 0$. At $z = -${p(d)}$ m, $\langle S\rangle$ is…`, eT(S0, n),
        [[`$${S0}e^{+${n}}$ W/m²`, md`That puts $z = -${p(d)}$ into the forward formula $e^{-2\alpha z}$. This wave has traveled ${p(d)} m by then, so it has lost power.`],
          [eT(S0, n / 2), md`That uses $\alpha$, the field's rate. Power decays at $2\alpha$.`],
          [eT(S0, 2 * n), md`That doubles twice: $2\alpha d = ${n}$.`],
          [`$${S0}$ W/m²`, md`A backward wave decays too, along its own direction of travel.`]],
        md`The wave has traveled $d = ${p(d)}$ m, and $2\alpha d = ${n}$: $\langle S\rangle = ${S0}e^{-${n}} \approx ${n3(S0 * Math.exp(-n))}$ W/m². The backward formula, $e^{+2\alpha z}$ at $z = -${p(d)}$, gives the same.`);
    },
    () => {
      const S0 = pick([2, 5, 10, 20]), a = pick([0.1, 0.25, 0.5, 1]), n = pick([1, 2]), A = pick([1, 2, 5]), d = n / (2 * a);
      const r = A * S0 * (1 - Math.exp(-n)), Wt = (x) => `$${n3(x)}$ W`;
      return MC('Absorbed in a slab', md`A wave with $\langle S\rangle = ${S0}$ W/m² enters the face $z = 0$ of a slab ${p(d)} m thick, in a medium with $\alpha = ${p(a)}$ Np/m. The faces have area ${A} m². The slab absorbs…`, Wt(r),
        [[Wt(A * S0 * Math.exp(-n)), md`That is the power that **leaves** through the far face. Absorbed is in minus out.`],
          [Wt(A * S0 * (1 - Math.exp(-n / 2))), md`That uses $e^{-\alpha d}$. Power decays at $2\alpha$.`],
          [Wt(S0 * (1 - Math.exp(-n))), md`That is per square meter. Multiply by the area, ${A} m².`],
          [Wt(A * S0), md`That is everything that enters. A slab of finite thickness lets $e^{-2\alpha d}$ of it through.`]],
        md`In minus out: $AS_0(1 - e^{-2\alpha d})$, with $2\alpha d = ${n}$: $${A}(${S0})(1 - e^{-${n}}) \approx ${n3(r)}$ W.`);
    },
    () => {
      const k = pick([2, 3, 4, 5, 10]);
      return MC('Field ratio to power ratio', md`Between two planes, the field amplitude of a wave falls to $1/${k}$ of its value. Its power falls to…`, `$1/${k * k}$`,
        [[`$1/${k}$`, md`That is the field ratio. Power is $E$ times $H$, and both fall.`], [`$1/${2 * k}$`, md`Squaring is not doubling: $(1/${k})^2 = 1/${k * k}$.`], [`$1/${k ** 4}$`, md`That squares twice.`], [k === 4 ? '$1/2$' : md`$1/\sqrt{${k}}$`, md`Power falls faster than the field, not slower.`]],
        md`$(1/${k})^2 = 1/${k * k}$.`);
    },
    () => {
      const a = pick([0.02, 0.05, 0.1, 0.25, 0.5, 2, 4]), m = (x) => `$${n3(x)}$ m`;
      return MC('The power’s 1/e distance', md`A medium has $\alpha = ${p(a)}$ Np/m. The **power** of a wave falls to $1/e$ of its value in a distance of…`, m(1 / (2 * a)),
        [[m(1 / a), md`That is the field's $1/e$ distance, $\delta = 1/\alpha$. Power decays twice as fast.`], [m(2 / a), md`Power decays faster than the field, so its distance is shorter, not longer.`], [m(2 * a), md`$\alpha$ is a rate per meter; a distance needs $1/\alpha$.`], [m(a / 2), md`That is $\alpha/2$, not $1/2\alpha$. Invert the rate.`]],
        md`$e^{-2\alpha d} = e^{-1}$ at $d = 1/2\alpha = ${n3(1 / (2 * a))}$ m: half a skin depth.`);
    },
    () => {
      const n = pick([1, 2, 3, 4]), d = pick([1, 2, 5, 10]), S1 = pick([3, 5, 8]), Np = (x) => `$${n3(x)}$ Np/m`;
      return MC('α from two readings', md`Along the direction of travel, $\langle S\rangle$ falls from $${S1}$ W/m² to $${S1}e^{-${n}}$ W/m² over ${d} m. $\alpha$ is…`, Np(n / (2 * d)),
        [[Np(n / d), md`That reads the exponent as $\alpha d$. For power it is $2\alpha d$.`], [Np(2 * n / d), md`The 2 divides: $2\alpha d = ${n}$.`], [Np(d / (2 * n)), md`That is upside down: $\alpha$ is per meter.`], [Np(n / (4 * d)), md`That divides by 2 twice.`]],
        md`$2\alpha d = ${n}$, so $\alpha = ${n}/(2\cdot${d}) = ${n3(n / (2 * d))}$ Np/m.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: decibels and depths
  GENS.rf_w2l_db = () => one([
    () => {
      const [r, rt, db] = pick([[10, '10', 10], [100, '100', 20], [1000, '1000', 30], [2, '2', 10 * Math.log10(2)], [0.5, '1/2', -10 * Math.log10(2)], [0.1, '1/10', -10], [0.01, '1/100', -20], [0.001, '1/1000', -30]]);
      return MC('Power ratio in dB', md`The power ratio $P_2/P_1 = ${rt}$, in decibels, is…`, dB(db),
        [[dB(2 * db), md`That uses $20\log_{10}$, which is for field ratios. Power takes $10\log_{10}$.`], [dB(db / 10), md`That is $\log_{10}$ alone. Decibels are ten times it.`], [dB(-db), md`Check the sign: a ratio ${r > 1 ? 'above' : 'below'} 1 has a ${r > 1 ? 'positive' : 'negative'} log.`], [dB(10 * Math.log(r)), md`That uses $\ln$. Decibels use $\log_{10}$.`]],
        md`$10\log_{10}(${rt}) = ${n3(db)}$ dB.`);
    },
    () => {
      const n = pick([1, 2, 3, 4, 6]);
      const fr = (k) => (k === 1 ? '1/10' : k === 2 ? '1/100' : k === 3 ? '1/1000' : `10^{-${k}}`);
      return MC('dB to a power ratio', md`A wave loses ${10 * n} dB. The fraction of its **power** that is left is…`, `$${fr(n)}$`,
        [[`$10^{-${p(n / 2)}}$`, md`That is $10^{-${10 * n}/20}$, the fraction of the **field** amplitude.`], [`$1/${10 * n}$`, md`dB are logarithms: $-${10 * n}$ dB means $10^{-${10 * n}/10}$.`], [`$10^{-${10 * n}}$`, md`Divide the dB by 10 first: $10^{-${n}}$.`], [`$e^{-${10 * n}}$`, md`dB count powers of 10, not of $e$.`]],
        md`$10^{-${10 * n}/10} = ${fr(n)}$. The field amplitude is down to $10^{-${p(n / 2)}}$.`);
    },
    () => {
      const a = pick([0.1, 0.2, 0.5, 1, 2]), d = pick([2, 5, 10, 20]);
      return MC('Loss in dB', md`A wave crosses ${d} m of a medium with $\alpha = ${p(a)}$ Np/m. The loss is…`, dB(DBN * a * d),
        [[dB(DBN / 2 * a * d), md`That is $4.343\,\alpha d$, $10\log$ of the **field** ratio. Power: $8.686\,\alpha d$.`], [dB(a * d), md`That is $\alpha d$ in nepers. $1$ Np $= 8.686$ dB.`], [dB(2 * a * d), md`That is $2\alpha d$, the power exponent, not yet in dB.`], [dB(2 * DBN * a * d), md`That doubles twice; the 2 of $e^{-2\alpha d}$ is already inside $8.686$.`]],
        md`$8.686\,\alpha d = 8.686(${p(a)})(${d}) = ${n3(DBN * a * d)}$ dB.`);
    },
    () => {
      const [k, kt] = pick([[10, '10'], [100, '100'], [1000, '1000'], [2, '2']]), Lk = 20 * Math.log10(k);
      return MC('A field ratio in dB', md`Between two points the field amplitude falls to $1/${kt}$ of its value. The loss is…`, dB(Lk),
        [[dB(Lk / 2), md`That uses $10\log$ on a field ratio. Fields take $20\log$, because power goes as field squared.`], [dB(2 * Lk), md`$20\log$ already includes the square.`], [dB(20 * Math.log(k)), md`dB use $\log_{10}$, not $\ln$.`]],
        md`$20\log_{10}(${kt}) = ${n3(Lk)}$ dB. The power is down to $1/${p(k * k)}$: the same number of dB.`);
    },
    () => {
      const n = pick([1, 2, 3, 4, 5]);
      return MC('dB per skin depth', md`A wave travels ${n} skin depth${n > 1 ? 's' : ''} into a conductor. Its power has dropped by…`, dB(DBN * n),
        [[dB(DBN / 2 * n), md`That is $4.343$ dB per neper, the field's $10\log$. The loss is $8.686$ dB per skin depth.`], [dB(n), md`That is the loss in nepers, $\alpha d = ${n}$.`], [dB(20 * n), md`One skin depth is $1/e$ in field, not $1/10$: $20\log_{10}e = 8.69$ dB.`], [dB(3 * n), md`3 dB is a factor of 2. One skin depth cuts the power to $e^{-2} = 13.5\%$, much more.`]],
        md`Each skin depth is $\alpha d = 1$, so $8.686$ dB; ${n} of them make $${n3(DBN * n)}$ dB.`);
    },
    () => {
      const del = pick([0.5, 1, 2, 5, 10]), amp = pick([true, false]);
      const [x, xt, ln] = pick([[0.01, '1\\%', Math.log(100)], [0.001, '0.1\\%', Math.log(1000)]]);
      const k = amp ? 1 : 0.5, d = k * del * ln, m = (v) => `$${n3(v)}$ m`;
      return MC('How deep', md`A medium has $\delta = ${p(del)}$ m. At what depth is the wave's **${amp ? 'field amplitude' : 'power'}** down to $${xt}$ of its surface value?`, m(d),
        [[m((amp ? 0.5 : 1) * del * ln), amp ? md`That is the depth for the **power**. The amplitude decays half as fast, so it takes twice as far.` : md`That is the depth for the **amplitude**. Power decays twice as fast.`],
          [m(k * del / x), md`Decay is exponential, not linear: solve with a logarithm.`],
          [m(k * del * Math.log10(1 / x)), md`That uses $\log_{10}$. Undoing an $e^{-x}$ needs $\ln$.`],
          [m(del), md`At one skin depth the field is $1/e = 37\%$, far from $${xt}$.`]],
        md`${amp ? md`$e^{-d/\delta} = ${p(x)}$ gives $d = \delta\ln${p(1 / x)}$` : md`$e^{-2d/\delta} = ${p(x)}$ gives $d = \tfrac12\delta\ln${p(1 / x)}$`} $= ${n3(d)}$ m.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1: surface resistance
  GENS.rf_w2l_rs = () => one([
    () => {
      const [s, dl] = pick([[1e7, 2e-5], [5e7, 1e-5], [4, 0.25], [4, 2.5], [5e7, 2e-6], [1e7, 1e-5], [1e5, 1e-3]]);
      const Om = (x) => `$${n3(x)}\\ \\Omega$`, r = 1 / (s * dl);
      return MC('Surface resistance', md`A good conductor has $\sigma = ${p(s)}$ S/m and, at the frequency of interest, $\delta = ${dTex(dl)}$. Its $R_s$ is…`, Om(r),
        [[Om(s * dl), md`That is $\sigma\delta$. The resistance is its inverse.`], [Om(Math.SQRT2 * r), md`That is $|\eta| = \sqrt2/\sigma\delta$. $R_s$ is the real part.`], [Om(1 / s), md`That is $1/\sigma$, a resistivity in $\Omega\cdot$m. Divide by the thickness the current uses, $\delta$.`], [Om(r / Math.SQRT2), md`That takes $\cos45°$ again. $R_s$ already is the real part of $\eta$.`]],
        md`$R_s = 1/(\sigma\delta) = 1/${p(+(s * dl).toPrecision(4))} = ${n3(r)}\ \Omega$.`);
    },
    () => {
      const H = pick([1, 2, 4, 5, 10]), Rs = pick([2, 5, 8, 10, 20]), mW = (x) => `$${n3(x)}$ mW/m²`;
      return MC('Power into a metal', md`A metal has $R_s = ${Rs}$ mΩ, and $|\mathbf H_{\tan}| = ${H}$ A/m at its surface. The power absorbed per square meter is…`, mW(0.5 * H * H * Rs),
        [[mW(H * H * Rs), md`That forgets the $\tfrac12$ of the time average.`], [mW(0.5 * H * Rs), md`That forgets to square $H$.`], [mW(0.5 * Math.SQRT2 * H * H * Rs), md`That uses $|\eta| = \sqrt2R_s$. Only the real part absorbs.`], [mW(0.25 * H * H * Rs), md`That halves twice. $R_s$ is already the real part; there is one $\tfrac12$.`]],
        md`$\tfrac12|H|^2R_s = \tfrac12(${H * H})(${Rs}) = ${n3(0.5 * H * H * Rs)}$ mW/m².`);
    },
    () => {
      const R0 = pick([2, 5, 8, 10]), f0 = pick([1, 10, 100]), k = pick([2, 3, 4, 10]), f1 = f0 * k * k;
      const ft = (x) => (x >= 1000 ? `${p(x / 1000)} GHz` : `${p(x)} MHz`), mO = (x) => `$${n3(x)}$ mΩ`;
      return MC('Surface resistance and frequency', md`A metal has $R_s = ${R0}$ mΩ at ${ft(f0)}. At ${ft(f1)} its $R_s$ is…`, mO(R0 * k),
        [[mO(R0 * k * k), md`That scales with $f$. $R_s\propto\sqrt f$.`], [mO(R0 / k), md`That divides. $R_s$ grows with $f$; $\delta$ is what shrinks.`], [mO(R0), md`$R_s = \sqrt{\pi f\mu/\sigma}$ has $f$ in it.`], [mO(R0 * Math.sqrt(k)), md`That takes a fourth root. The frequency went up ${k * k} times, and $\sqrt{${k * k}} = ${k}$.`]],
        md`$f$ went up ${k * k} times, so $R_s$ goes up $\sqrt{${k * k}} = ${k}$ times: $${R0 * k}$ mΩ.`);
    },
    () => {
      const d0 = pick([4, 6, 10, 20, 60]), k = pick([2, 3, 10]), up = pick([true, false]), r = up ? d0 / k : d0 * k;
      const um = (x) => `$${n3(x)}\\ \\mu\\text{m}$`;
      return MC('Skin depth and frequency', md`A metal has $\delta = ${d0}\ \mu\text{m}$ at some frequency. The frequency is ${up ? 'multiplied' : 'divided'} by ${k * k}. Now $\delta$ is…`, um(r),
        [[um(up ? d0 * k : d0 / k), md`Backward: a higher frequency means a thinner skin.`], [um(up ? d0 / (k * k) : d0 * k * k), md`$\delta\propto1/\sqrt f$, not $1/f$.`], [um(d0), md`$\delta = 1/\sqrt{\pi f\mu\sigma}$ depends on $f$.`]],
        md`$\delta\propto1/\sqrt f$: ${up ? 'divide' : 'multiply'} by $\sqrt{${k * k}} = ${k}$, giving $${n3(r)}\ \mu\text{m}$.`);
    },
    () => {
      const X = pick([2, 5, 8, 10, 20]), mO = (x) => `$${n3(x)}$ mΩ`;
      return one([
        () => MC('R_s from η', md`A good conductor has $\eta = ${X}\sqrt2\,e^{j45°}$ mΩ. Its surface resistance is…`, mO(X),
          [[mO(X * Math.SQRT2), md`That is $|\eta|$. $R_s$ is the real part, $|\eta|\cos45°$.`], [mO(X / Math.SQRT2), md`That takes $\cos45°$ twice.`], [mO(2 * X), md`That adds the real and imaginary parts. $R_s$ is the real part alone.`]],
          md`$\Re\{\eta\} = ${X}\sqrt2\cos45° = ${X}$ mΩ.`),
        () => MC('|η| from R_s', md`A good conductor has $R_s = ${X}$ mΩ. The size of its $\eta$ is…`, mO(X * Math.SQRT2),
          [[mO(X), md`That is the real part. $\eta = (1 + j)R_s$ has size $\sqrt2R_s$.`], [mO(2 * X), md`That adds the real and imaginary parts. A size needs Pythagoras.`], [mO(X / Math.SQRT2), md`$|1 + j| = \sqrt2$ multiplies.`]],
          md`$\eta = (1 + j)R_s$, so $|\eta| = \sqrt2R_s = ${n3(X * Math.SQRT2)}$ mΩ.`),
      ]);
    },
    () => {
      const [k2, k] = pick([[4, 2], [100, 10], [16, 4], [9, 3]]);
      return MC('Two metals', md`Metal A conducts ${k2} times better than metal B ($\sigma_A = ${k2}\sigma_B$, same $\mu$). At the same frequency, $R_{s,A}/R_{s,B}$ is…`, `$1/${k}$`,
        [[`$1/${k2}$`, md`$R_s\propto1/\sqrt\sigma$, not $1/\sigma$.`], [`$${k}$`, md`A better conductor has the **smaller** surface resistance.`], ['$1$', md`$R_s = \sqrt{\pi f\mu/\sigma}$ depends on $\sigma$.`], [k === 4 ? '$1/2$' : md`$1/\sqrt{${k}}$`, md`That takes a fourth root of the conductivity ratio.`]],
        md`$R_{s,A}/R_{s,B} = \sqrt{\sigma_B/\sigma_A} = 1/\sqrt{${k2}} = 1/${k}$. Metal A's skin is also ${k} times thinner, but $\sigma\delta$ still comes out ${k} times bigger.`);
    },
    () => {
      const t = pick([0.5, 1, 2, 5]), dl = pick([2, 5, 10, 20]), r = t * 1000 / dl;
      return MC('AC against DC', md`A metal plate ${p(t)} mm thick is used at a frequency where $\delta = ${dl}\ \mu\text{m}$. Its resistance per square there is how many times its DC value?`, `$${n3(r)}$`,
        [[`$${n3(Math.sqrt(r))}$`, md`That takes a square root. The ratio is $t/\delta$ itself.`], [`$${n3(1 / r)}$`, md`Upside down: the AC current uses less of the plate, so the resistance is higher.`], ['$1$', md`At this frequency the current does not use the whole thickness.`]],
        md`$R_s/R_{DC} = \dfrac{1/\sigma\delta}{1/\sigma t} = \dfrac{t}{\delta} = \dfrac{${p(t)}\text{ mm}}{${dl}\ \mu\text{m}} = ${n3(r)}$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2: a lossy dielectric
  GENS.w2l_lossy = () => {
    const n = pick([1, 2, 3, 4]), al = pick([0.01, 0.02, 0.05, 0.1, 0.2]), E0 = pick([10, 20, 30, 60]), fG = pick([1, 2, 3]), nn = pick([1, 2]);
    const er = n * n, etai = 120 * Math.PI / n, K = Math.round(60 / (al * n)), sig = 1 / (K * Math.PI);
    const lt = sig * 18 / (fG * er), d = nn / (2 * al);
    const S0 = E0 * E0 / (2 * etai), Sd = S0 * Math.exp(-nn), L = DBN * al * d, pd = 0.5 * sig * E0 * E0;
    return {
      title: 'A lossy dielectric: power, decay, dB and heat',
      q: md`A non-magnetic material has $\epsilon_r = ${er}$ and $\sigma = \dfrac{1}{${K}\pi}$ S/m. A ${fG} GHz wave travels toward $+z$ with $E_0 = ${E0}$ V/m at $z = 0$. Find $\alpha$; $\langle S\rangle$ at $z = 0$ and at $z = ${p(d)}$ m; the loss in dB over those ${p(d)} m; and the heat per cubic meter at $z = 0$.`,
      parts: [
        TR(N('\\alpha', al, 'Np/m'), [[sig * etai, md`That is $\sigma\sqrt{\mu/\epsilon}$. The low-loss formula has a $\tfrac12$: $\alpha \approx \tfrac\sigma2\sqrt{\mu/\epsilon}$.`], [sig * 60 * Math.PI, md`That uses $\eta_0$. This material has $\sqrt{\mu/\epsilon} = \eta_0/\sqrt{\epsilon_r}$.`]]),
        TR(N('\\langle S\\rangle(0)', S0, 'W/m^2'), [[E0 * E0 / (240 * Math.PI), md`That uses $\eta_0$. The material's $|\eta|$ is $\eta_0/${n}$.`], [E0 * E0 / etai, md`That forgets the $\tfrac12$ of the time average.`]]),
        TR(N(`\\langle S\\rangle(${p(d)}\\text{ m})`, Sd, 'W/m^2'), [[S0 * Math.exp(-nn / 2), md`That uses $e^{-\alpha d}$. Power decays as $e^{-2\alpha d}$.`]]),
        TR(N('\\text{loss}', L, 'dB'), [[L / 2, md`That uses $4.343\,\alpha d$. The power loss is $8.686\,\alpha d$ dB.`], [al * d, md`That is the loss in nepers. Multiply by $8.686$.`]]),
        TR(N('\\langle p_d\\rangle(0)', pd, 'W/m^3'), [[2 * pd, md`That forgets the $\tfrac12$: the heat is $\tfrac12\sigma E_0^2$.`]]),
      ],
      hints: [md`Check the loss tangent first. If it is small, $|\eta| \approx \eta_0/\sqrt{\epsilon_r}$, $\cos\tau \approx 1$ and $\alpha \approx \tfrac\sigma2|\eta|$.`, md`$S_0 = E_0^2/2|\eta|$, then multiply by $e^{-2\alpha d}$. The loss is $8.686\,\alpha d$ dB and the heat $\tfrac12\sigma E_0^2$.`],
      sol: md`
        **Step 1: what kind of medium?** The displacement term:
        $$\omega\epsilon = (2\pi)(${fG}\times10^9)(${er})\frac{10^{-9}}{36\pi} = \frac{${fG * er}}{18}\ \text{S/m}$$
        so
        $$\frac{\sigma}{\omega\epsilon} = \frac{18}{${K}\pi\cdot${fG * er}} \approx ${f(lt)}$$
        Much less than 1: an imperfect dielectric. So $\cos\tau \approx 1$ ($\tau \approx \sigma/2\omega\epsilon \approx ${f(lt / 2)}$ rad).

        **Step 2: $|\eta|$ and $\alpha$.**
        $$|\eta| \approx \frac{120\pi}{\sqrt{${er}}} = ${n === 1 ? '120' : p(120 / n)}\pi\ \Omega$$
        $$\alpha \approx \frac\sigma2|\eta| = \frac{${n === 1 ? '120' : p(120 / n)}\pi}{2\cdot${K}\pi} = ${p(al)}\ \text{Np/m}$$
        **Step 3: power at $z = 0$.**
        $$S_0 = \frac{E_0^2}{2|\eta|} = \frac{${E0 * E0}}{${p(240 / n)}\pi} = ${f(S0)}\ \text{W/m}^2$$
        **Step 4: power at $z = ${p(d)}$ m.** $2\alpha d = 2(${p(al)})(${p(d)}) = ${nn}$:
        $$\langle S\rangle = ${f(S0)}\,e^{-${nn}} = ${f(Sd)}\ \text{W/m}^2$$
        **Step 5: dB.** $8.686\,\alpha d = 8.686(${p(al)})(${p(d)}) = ${f(L)}$ dB.

        **Step 6: heat at $z = 0$.**
        $$\tfrac12\sigma E_0^2 = \frac{${E0 * E0}}{2\cdot${K}\pi} = ${f(pd)}\ \text{W/m}^3$$
        **Check.** The heat at the surface must equal $2\alpha S_0 = 2(${p(al)})(${f(S0)}) = ${f(2 * al * S0)}$ W/m³ ✓, which is equation (1).
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: the books of a box
  GENS.w2l_cube = () => {
    const tau = pick([30, 45, 37]), a = pick([0.5, 1, 2]), m = pick([50, 100, 200]), A = pick([1, 2, 4]), nn = pick([1, 2]);
    // never Worked example 3 itself (tau 30, alpha 1, |eta| 100, E0 20, a 1 m cube)
    const E0 = tau === 30 && a === 1 && m === 100 && nn === 2 && A === 1 ? 40 : pick([10, 20, 40]);
    const ct = tau === 37 ? 0.8 : Math.cos(tau * D), st = tau === 37 ? 0.6 : Math.sin(tau * D), b = a * ct / st;
    const bT = tau === 30 ? (a === 1 ? '\\sqrt3' : `${p(a)}\\sqrt3`) : tau === 45 ? p(a) : { 0.5: '\\tfrac23', 1: '\\tfrac43', 2: '\\tfrac83' }[a];
    const etaT = tau === 37 ? `${p(m * 0.8)} + j${p(m * 0.6)}` : `${m}e^{j${tau}°}`;
    const cT = { 30: '\\tfrac{\\sqrt3}{2}', 45: '\\tfrac{1}{\\sqrt2}', 37: '0.8' }[tau];
    const Lz = nn / (2 * a), sig = 2 * a * ct / m, S0 = E0 * E0 * ct / (2 * m), Pin = A * S0, Pout = Pin * Math.exp(-nn), Pabs = Pin - Pout, pd = 0.5 * sig * E0 * E0;
    return {
      title: 'The energy books of a box',
      q: md`In a non-magnetic material, $\tilde{\mathbf E} = \hat x\,${E0}e^{-\gamma z}$ V/m with $\gamma = ${p(a)} + j${bT}$ 1/m and $\eta = ${etaT}\ \Omega$. A box has faces of area ${A} m² on the planes $z = 0$ and $z = ${p(Lz)}$ m. Find $\sigma$, $\langle S\rangle$ at $z = 0$, the power dissipated inside the box, and the heat per cubic meter at $z = 0$.`,
      parts: [
        TR(N('\\sigma', sig, 'S/m'), [[Math.hypot(a, b) / m, md`That is $|\gamma|/|\eta|$, the size of $\gamma/\eta$. $\sigma$ is its real part.`], [a * ct / m, md`That is missing the 2: $\sigma = 2\alpha\cos\tau/|\eta|$.`]]),
        TR(N('\\langle S\\rangle(0)', S0, 'W/m^2'), [[E0 * E0 / (2 * m), md`That drops $\cos\tau$.`], [E0 * E0 * ct / m, md`That forgets the $\tfrac12$.`]]),
        TR(N('P_{\\text{abs}}', Pabs, 'W'), [[Pout, md`That is the power that **leaves** through the far face. Absorbed is in minus out.`], [Pin * (1 - Math.exp(-nn / 2)), md`That uses $e^{-\alpha d}$ for the power.`], [S0 * (1 - Math.exp(-nn)), md`That is per square meter. Multiply by the face area.`]]),
        TR(N('\\langle p_d\\rangle(0)', pd, 'W/m^3'), [[2 * pd, md`That forgets the $\tfrac12$ in $\tfrac12\sigma E_0^2$.`]]),
      ],
      hints: [md`$\alpha = ${p(a)}$ Np/m. $\sigma = \Re\{\gamma/\eta\}$, or faster, $\sigma = 2\alpha\cos\tau/|\eta|$.`, md`The side faces carry nothing. Power in at $z = 0$ minus power out at $z = ${p(Lz)}$ m is the heat inside.`],
      sol: md`
        **Step 1: read the wave.** $\alpha = ${p(a)}$ Np/m, $|\eta| = ${m}\ \Omega$, ${tau === 37 ? md`$\cos\tau = ${p(m * 0.8)}/${m} = 0.8$ ($\tau \approx 36.9°$)` : md`$\tau = ${tau}°$, $\cos\tau = ${cT}$`}. Check: $\tan\tau = \alpha/\beta$, so the angles of $\gamma$ and $\eta$ add to $90°$ ✓.

        **Step 2: σ.** From equation (1), which is $\Re\{\gamma/\eta\}$ worked out:
        $$\sigma = \frac{2\alpha\cos\tau}{|\eta|} = \frac{2(${p(a)})(${cT})}{${m}} = ${f(sig)}\ \text{S/m}$$
        **Step 3: power in at $z = 0$.**
        $$S_0 = \frac{E_0^2}{2|\eta|}\cos\tau = \frac{${E0 * E0}}{${2 * m}}(${cT}) = ${f(S0)}\ \text{W/m}^2$$
        Through ${A} m²: $P_{\text{in}} = ${f(Pin)}$ W.

        **Step 4: power out at $z = ${p(Lz)}$ m.** $2\alpha d = 2(${p(a)})(${p(Lz)}) = ${nn}$:
        $$P_{\text{out}} = ${f(Pin)}\,e^{-${nn}} = ${f(Pout)}\ \text{W}$$
        The four side faces carry nothing: $\langle\mathbf S\rangle$ is along $\hat z$.

        **Step 5: dissipated.**
        $$P_{\text{abs}} = ${f(Pin)}(1 - e^{-${nn}}) = ${f(Pabs)}\ \text{W}$$
        **Step 6: heat density, and the check.** $\tfrac12\sigma E_0^2 = \tfrac12(${f(sig)})(${E0 * E0}) = ${f(pd)}$ W/m³. Integrate it, times $e^{-2\alpha z}$, over the box:
        $$A\,\frac{${f(pd)}}{2\alpha}(1 - e^{-${nn}}) = ${f(A * pd / (2 * a) * (1 - Math.exp(-nn)))}\ \text{W}\ \checkmark$$
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: a metal surface
  GENS.w2l_metal = () => {
    const opts = [];
    for (const s of [1, 4]) for (const [g, ft] of [[0.01, '1 MHz'], [0.25, '25 MHz'], [1, '100 MHz'], [4, '400 MHz'], [9, '900 MHz']]) if (!(s === 1 && g === 1)) opts.push([s, g, ft]);
    const [s, g, ft] = pick(opts), H = pick([1, 2, 5, 10]), k = pick([2, 3]);
    const sig = s * 1e7, fz = g * 1e8, q = Math.sqrt(s * g) * 1e4, al = 2 * Math.PI * q, del = 1 / al, Rs = al / sig, P = 0.5 * H * H * Rs;
    const fk = fz * k * k, fkT = fk >= 1e9 ? `${p(fk / 1e9)} GHz` : `${p(fk / 1e6)} MHz`;
    return {
      title: 'A metal surface: skin depth, surface resistance, absorbed power',
      q: md`A thick metal block has $\sigma = ${p(sig)}$ S/m and $\mu = \mu_0$. At ${ft}, the tangential $\mathbf H$ at its surface has amplitude ${H} A/m. Find $\delta$, $R_s$, and the power absorbed per square meter. Then find the power absorbed per square meter at ${fkT}, with the same surface $H$.`,
      parts: [
        TR(N('\\delta', del * 1e6, 'µm'), [[del * 1e6 / Math.SQRT2, md`That uses $\alpha = \sqrt{\omega\mu\sigma}$. The root of $j$ brings a $\tfrac12$: $\alpha = \sqrt{\pi f\mu\sigma}$.`]]),
        TR(N('R_s', Rs * 1e3, 'mΩ'), [[Math.SQRT2 * Rs * 1e3, md`That is $|\eta| = \sqrt2R_s$. $R_s$ is the real part.`]]),
        TR(N('\\langle S\\rangle_{\\text{in}}', P * 1e3, 'mW/m^2'), [[2 * P * 1e3, md`That forgets the $\tfrac12$.`], [Math.SQRT2 * P * 1e3, md`That uses $|\eta|$ in place of $R_s$.`]]),
        TR(N(`\\langle S\\rangle_{\\text{in}}\\text{ at ${fkT}}`, k * P * 1e3, 'mW/m^2'), [[k * k * P * 1e3, md`That scales with $f$. $R_s\propto\sqrt f$.`], [P * 1e3, md`$R_s$ changes with frequency, so the absorbed power does too.`]]),
      ],
      hints: [md`$\alpha = \sqrt{\pi f\mu\sigma}$, $\delta = 1/\alpha$, $R_s = 1/\sigma\delta$. Group $\pi\cdot4\pi = 4\pi^2$ under the root.`, md`Power in: $\tfrac12|\mathbf H_{\tan}|^2R_s$. $R_s\propto\sqrt f$.`],
      sol: md`
        **Step 1: a good conductor?** $\omega\epsilon_0$ at ${ft} is below $0.06$ S/m, and $\sigma = ${p(sig)}$ S/m. Yes, by a factor of millions.

        **Step 2: α and δ.** Collect the factors:
        $$\pi f\mu\sigma = 4\pi^2(${p(fz)})(${p(sig)})(10^{-7})$$
        $$= 4\pi^2\times${p(q * q)}$$
        so $\alpha = 2\pi\times${p(q)} \approx ${f(al)}$ Np/m, and
        $$\delta = \frac1\alpha = ${f(del * 1e6)}\ \mu\text{m}$$
        **Step 3: R_s.**
        $$R_s = \frac{1}{\sigma\delta} = \frac{\alpha}{\sigma} = \frac{${f(al)}}{${p(sig)}} = ${f(Rs * 1e3)}\ \text{m}\Omega$$
        **Step 4: absorbed power.**
        $$\tfrac12|H|^2R_s = \tfrac12(${H * H})(${f(Rs)}\ \Omega) = ${f(P * 1e3)}\ \text{mW/m}^2$$
        **Step 5: at ${fkT}.** The frequency is ${k * k} times higher, so $R_s$ is $\sqrt{${k * k}} = ${k}$ times bigger ($\delta$ is ${k} times thinner). With the same $H$, the power is ${k} times bigger:
        $$${k}\times${f(P * 1e3)} = ${f(k * P * 1e3)}\ \text{mW/m}^2$$
        **Check.** $|\tilde J_s| = |\mathbf H_{\tan}| = ${H}$ A/m flowing through a sheet of resistance $R_s$: $\tfrac12|\tilde J_s|^2R_s$, the same number ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- level 2: seawater depths
  GENS.w2l_depth = () => {
    const [fz, fT, aP] = pick([[250, '250 Hz', 0.02], [1000, '1 kHz', 0.04], [4000, '4 kHz', 0.08], [25000, '25 kHz', 0.2], [100000, '100 kHz', 0.4]]);
    const al = aP * Math.PI, del = 1 / al, amp = pick([true, false]);
    const [x, xt, ln] = pick([[0.01, '1\\%', Math.log(100)], [0.001, '0.1\\%', Math.log(1000)]]);
    const k = amp ? 1 : 0.5, dx = k * del * ln, S0 = pick([1, 2, 5, 10]), mm = pick([0.5, 1, 2]), SD = S0 * Math.exp(-2 * mm);
    const mmT = mm === 0.5 ? 'half a skin depth' : mm === 1 ? 'one skin depth' : 'two skin depths';
    return {
      title: 'Seawater: how deep, and how much is left',
      q: md`Seawater has $\sigma = 4$ S/m, $\epsilon_r = 81$, $\mu = \mu_0$. A ${fT} wave enters it from above and carries $\langle S\rangle = ${S0}$ W/m² just below the surface. Find $\alpha$, $\delta$, the depth at which the **${amp ? 'field amplitude' : 'power'}** is $${xt}$ of its surface value, the loss in dB per meter, and $\langle S\rangle$ at a depth of ${mmT}.`,
      parts: [
        TR(N('\\alpha', al, 'Np/m'), [[al * Math.SQRT2, md`That is $\sqrt{\omega\mu\sigma}$. The root of $j$ brings a $\tfrac12$: $\alpha = \sqrt{\omega\mu\sigma/2} = \sqrt{\pi f\mu\sigma}$.`]]),
        TR(N('\\delta', del, 'm'), [[del / Math.SQRT2, md`That comes from $\alpha = \sqrt{\omega\mu\sigma}$, too big by $\sqrt2$.`]]),
        TR(N(md`depth for $${xt}$`, dx, 'm'), [[(amp ? 0.5 : 1) * del * ln, amp ? md`That is the depth for the power. The amplitude takes twice as far.` : md`That is the depth for the amplitude. Power decays twice as fast.`], [k * del * Math.log10(1 / x), md`That uses $\log_{10}$. Undo an $e^{-x}$ with $\ln$.`]]),
        TR(N('\\text{loss per meter}', DBN * al, 'dB/m'), [[DBN / 2 * al, md`That is $4.343\,\alpha$. Power: $8.686\,\alpha$ dB/m.`]]),
        TR(N(`\\langle S\\rangle\\text{ at }${p(mm)}\\delta`, SD, 'W/m^2'), [[S0 * Math.exp(-mm), md`That uses $e^{-\alpha d}$. Power decays as $e^{-2\alpha d}$.`]]),
      ],
      hints: [md`Check $\sigma/\omega\epsilon$, then $\alpha = \sqrt{\pi f\mu\sigma}$. Seawater at 1 kHz has $\alpha = \pi/25$; it scales as $\sqrt f$.`, md`Amplitude to $x$: $d = \delta\ln(1/x)$. Power to $x$: half that. Loss: $8.686\,\alpha$ dB/m.`],
      sol: md`
        **Step 1: a good conductor?** $\omega\epsilon = (2\pi f)(81)\frac{10^{-9}}{36\pi} = 4.5f\times10^{-9}$ S/m $\approx ${f(4.5 * fz * 1e-9)}$ S/m, against $\sigma = 4$ S/m. The ratio is about $${f(4 / (4.5 * fz * 1e-9))}$: a good conductor.

        **Step 2: α and δ.**
        $$\pi f\mu\sigma = \pi(${p(fz)})(4\pi\times10^{-7})(4)$$
        $$= 16\pi^2(${p(fz)}\times10^{-7}) = (${p(aP)}\pi)^2$$
        So $\alpha = ${p(aP)}\pi \approx ${f(al)}$ Np/m, and $\delta = 1/\alpha \approx ${f(del)}$ m.

        **Step 3: the depth.** ${amp ? md`The amplitude goes as $e^{-\alpha d}$: $e^{-\alpha d} = ${p(x)}$ gives $d = \delta\ln${p(1 / x)}$:` : md`The power goes as $e^{-2\alpha d}$: $e^{-2\alpha d} = ${p(x)}$ gives $d = \tfrac12\delta\ln${p(1 / x)}$:`}
        $$d = ${amp ? '' : '\\tfrac12'}(${f(del)})(${f(ln)}) = ${f(dx)}\ \text{m}$$
        **Step 4: dB per meter.** $8.686\,\alpha = 8.686(${f(al)}) = ${f(DBN * al)}$ dB/m.

        **Step 5: power at ${mmT}.** $2\alpha d = ${p(2 * mm)}$:
        $$\langle S\rangle = ${S0}e^{-${p(2 * mm)}} = ${f(SD)}\ \text{W/m}^2$$
        **Check.** The depth of Step 3 in dB: $${f(DBN * al)}\times${f(dx)} = ${f(DBN * al * dx)}$ dB, which is $${amp ? '20' : '10'}\log_{10}(1/${p(x)})$ ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3: SP24 #2 style
  GENS.w2l_exam = () => {
    const [dl, dT] = pick([[1e-3, '1\\ \\text{mm}'], [2e-3, '2\\ \\text{mm}'], [0.5e-3, '0.5\\ \\text{mm}'], [1e-4, '0.1\\ \\text{mm}']]);
    const sd = pick([10, 20, 50, 100]), sig = +(sd / dl).toPrecision(6), Rs = 1 / sd, E0 = pick([1, 2, 5, 10]);
    const al = 1 / dl, eta = Math.SQRT2 * Rs, S0 = E0 * E0 / (4 * Rs), S2 = S0 * Math.exp(-4), Pab = S0 * (Math.exp(-2) - Math.exp(-4));
    const fz = 1 / (Math.PI * EM.mu0 * sig * dl * dl), lt = sig / (2 * Math.PI * fz * 1e-9 / (36 * Math.PI));
    const TRUE = [
      md`$\langle\mathbf S\rangle$ decreases as the wave travels along $+\hat x$`,
      md`$\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$ everywhere in the conductor`,
      md`At $x = 0$, $\langle S\rangle = \tfrac12|\tilde H(0)|^2R_s$`,
      md`More than 80% of the power entering at $x = 0$ becomes heat before $x = \delta$`,
    ];
    const FALSE = [
      [md`$-\nabla\cdot\mathbf S$ equals the rate of change of the stored energy density`, md`That leaves out $\mathbf J\cdot\mathbf E$, the biggest term in a conductor: $-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$.`],
      [md`$\nabla\cdot\langle\mathbf S\rangle$ equals the average power dissipated per unit volume`, md`Wrong sign: $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$. The flow shrinks where heat appears.`],
      [md`If the wave traveled toward $-\hat x$ instead, $\langle\mathbf S\rangle$ would grow along its direction of travel`, md`Every wave in a passive medium shrinks along its own direction of travel.`],
      [md`$|\langle\mathbf S\rangle| = |\tilde E(0)|^2/2\eta_0$ at $x = 0$`, md`That uses free space's $\eta_0$ and drops $\cos45°$. The right value is $|\tilde E|^2/4R_s$.`],
      [md`$\langle S\rangle$ falls as $e^{-\alpha x}$`, md`That is the field. The power carries two factors: $e^{-2\alpha x}$.`],
      [md`$\mathbf E$ and $\mathbf H$ are in phase at every point`, md`In a good conductor $\tau = 45°$: $H$ lags $E$ by $45°$.`],
    ];
    const tr = pick(TRUE), fl = U.shuffle(FALSE.slice()).slice(0, 3);
    return {
      title: 'A good conductor, start to finish',
      q: md`A cosinusoidal TEM wave, made by a current sheet on the plane $x = 0$, travels toward $+\hat x$ through a good conductor ($\sigma \gg \omega\epsilon$, $\mu = \mu_0$) with $\sigma = ${p(sig)}$ S/m. Its skin depth is $\delta = ${dT}$, and just inside, at $x = 0$, the electric field has amplitude $E_0 = ${E0}$ V/m. Find $\alpha$ (it equals $\beta$); the surface resistance $R_s$ and $|\eta|$; $\langle S\rangle$ at $x = 0$ and at $x = 2\delta$; and the power absorbed per square meter between $x = \delta$ and $x = 2\delta$. Then pick the true statement.`,
      parts: [
        TR(N('\\alpha', al, 'Np/m'), [[dl, md`That is $\delta$ itself. $\alpha = 1/\delta$.`]]),
        TR(N('R_s', Rs, 'Ω'), [[Math.SQRT2 * Rs, md`That is $|\eta|$. $R_s$ is its real part.`], [sd, md`That is $\sigma\delta$. $R_s = 1/\sigma\delta$.`]]),
        TR(N('|\\eta|', eta, 'Ω'), [[Rs, md`That is $R_s$, the real part. $\eta = (1 + j)R_s$ has size $\sqrt2R_s$.`], [2 * Rs, md`That adds the real and imaginary parts. A size needs Pythagoras.`]]),
        TR(N('\\langle S\\rangle(0)', S0, 'W/m^2'), [[E0 * E0 / (2 * eta), md`That is $E_0^2/2|\eta|$ without $\cos45°$.`], [E0 * E0 / (2 * Rs), md`That is $E_0^2/2\Re\{\eta\}$. The $E$ form needs $\Re\{1/\eta\} = 1/2R_s$.`], [E0 * E0 / (240 * Math.PI), md`That uses $\eta_0$: statement (v) of SP24 #2(c).`]]),
        TR(N('\\langle S\\rangle(2\\delta)', S2, 'W/m^2'), [[S0 * Math.exp(-2), md`That uses $e^{-\alpha x}$, the field's rate. Power: $e^{-2\alpha x} = e^{-4}$ at $2\delta$.`]]),
        TR(N('P_{\\text{abs}}\\ (\\delta\\text{ to }2\\delta)', Pab, 'W/m^2'), [[S0 * (Math.exp(-1) - Math.exp(-2)), md`That uses the field's $e^{-\alpha x}$ at both planes.`], [S0 * Math.exp(-2), md`That is what crosses $x = \delta$. Subtract what crosses $x = 2\delta$.`], [S0 * (1 - Math.exp(-2)), md`That is the first skin depth, $0$ to $\delta$.`]]),
        { lbl: 'Which statement is true?', mc: [tr, ...fl.map((z) => z[0])], a: 0, why: [null, ...fl.map((z) => z[1])] },
      ],
      hints: [md`Good conductor: $\gamma = (1 + j)/\delta$ and $\eta = (1 + j)R_s$ with $R_s = 1/\sigma\delta$.`, md`$\langle S\rangle(0) = \dfrac{E_0^2}{2|\eta|}\cos45° = \dfrac{E_0^2}{4R_s}$. Then $e^{-2\alpha x}$; absorbed is in minus out.`],
      sol: md`
        **Step 1: γ.** In a good conductor $\alpha = \beta = 1/\delta$:
        $$\gamma = \frac{1 + j}{\delta} = ${p(al)}(1 + j)\ \text{1/m}$$
        so $\alpha = ${p(al)}$ Np/m. (For the record, this $\delta$ and $\sigma$ mean $f = 1/(\pi\mu_0\sigma\delta^2) \approx ${f(fz)}$ Hz, where $\sigma/\omega\epsilon_0 \approx ${f(lt)}$: a good conductor indeed.)

        **Step 2: R_s and |η|.** $\eta = (1 + j)R_s$ with
        $$R_s = \frac{1}{\sigma\delta} = \frac{1}{(${p(sig)})(${p(dl)})} = ${f(Rs)}\ \Omega$$
        and $|\eta| = \sqrt2R_s = ${f(eta)}\ \Omega$, at $\tau = 45°$.

        **Step 3: power at $x = 0$.**
        $$\langle S\rangle(0) = \frac{E_0^2}{2|\eta|}\cos45° = \frac{E_0^2}{4R_s}$$
        $$= \frac{${E0 * E0}}{4(${f(Rs)})} = ${f(S0)}\ \text{W/m}^2$$
        **Step 4: power at $x = 2\delta$.** $2\alpha x = 4$:
        $$\langle S\rangle(2\delta) = ${f(S0)}\,e^{-4} = ${f(S2)}\ \text{W/m}^2$$
        **Step 5: absorbed between $\delta$ and $2\delta$.** In minus out, per square meter:
        $$S_0\big(e^{-2} - e^{-4}\big) = ${f(S0)}(0.1170) = ${f(Pab)}\ \text{W}$$
        **Step 6: the statement.** True: "${tr}". ${fl.map((z) => `False: "${z[0]}". ${z[1]}`).join(' ')}

        **Speed path.** $\alpha = 1/\delta$, $R_s = 1/\sigma\delta$, $S_0 = E_0^2/4R_s$, then powers of $e^{-2}$ per skin depth: 13.5%, 1.8%. Five numbers in a minute.

        **Where points go.** $e^{-\alpha x}$ for the power; $\eta_0$ or a missing $\cos45°$ in $S_0$; $|\eta|$ called $R_s$; "absorbed between" read as "what is left at".
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank
  EM.BANK['w2-loss'] = [
    Q(md`A wave in a good conductor has $E_0$ just inside the surface and intrinsic impedance of size $|\eta|$. The power per square meter entering is…`,
      [md`$E_0^2/(2\sqrt2|\eta|)$`, md`$E_0^2/(2|\eta|)$`, md`$E_0^2/(\sqrt2|\eta|)$`, md`$E_0^2/2\eta_0$`], 0,
      [null, md`That drops $\cos\tau$. In a good conductor $\tau = 45°$.`, md`That is missing the $\tfrac12$ of the time average.`, md`That uses free space's $\eta_0$; the wave is inside the conductor.`],
      md`$\dfrac{E_0^2}{2|\eta|}\cos45° = \dfrac{E_0^2}{2\sqrt2|\eta|}$.`),
    Q(md`Which of these does **not** appear in $\langle\mathbf S\rangle$ of a single traveling wave in a lossy medium?`,
      [md`$\beta$`, md`$\alpha$`, md`$\tau$`, md`$|\eta|$`], 0,
      [null, md`$\alpha$ sets the decay $e^{-2\alpha z}$.`, md`$\tau$ appears as $\cos\tau$.`, md`$|\eta|$ is in the denominator.`],
      md`In $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$ the phases $e^{-j\beta z}$ and $e^{+j\beta z}$ cancel.`),
    Q(md`Why does $e^{-j\beta z}$ drop out of $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$?`,
      [md`The conjugate gives $\tilde H^*$ the opposite phase, $e^{+j\beta z}$`, md`Because $\beta$ is small in a lossy medium`, md`Because $\Re\{\cdot\}$ removes all phases`, md`Because $E$ and $H$ are in phase`], 0,
      [null, md`It cancels for any $\beta$, small or not.`, md`$\Re\{\cdot\}$ keeps $\cos$ of the remaining phase, as with $\cos\tau$.`, md`They are not in phase here ($\tau \ne 0$), and the cancellation happens anyway.`],
      md`$e^{-j\beta z}\cdot(e^{-j\beta z})^* = e^{-j\beta z}e^{+j\beta z} = 1$.`),
    Q(md`A lossless medium has $\eta = 120\pi\ \Omega$ and a wave with $E_0 = 120\pi$ V/m. Its $\langle S\rangle$ is…`,
      [md`$60\pi$ W/m²`, md`$120\pi$ W/m²`, md`$30\pi$ W/m²`, md`$1$ W/m²`], 0,
      [null, md`That forgets the $\tfrac12$ of the time average.`, md`That divides by $4\eta$.`, md`That is $E_0/\eta$, the amplitude of $H$ in A/m.`],
      md`$E_0^2/2\eta = (120\pi)^2/(240\pi) = 60\pi \approx 188$ W/m².`),
    Q(md`A wave's field falls by 8.7 dB over one skin depth. Over the same distance its **power** falls by…`,
      [md`$8.7$ dB`, md`$17.4$ dB`, md`$4.3$ dB`, md`$26$ dB`], 0,
      [null, md`dB already measure power: the field's $20\log$ and the power's $10\log$ give the same number.`, md`That halves it, as if fields took $10\log$.`, md`That is three skin depths.`],
      md`A loss in dB is the same number whether you read it from the field ($20\log$) or the power ($10\log$).`),
    Q(md`A 3 dB loss leaves what fraction of the field amplitude?`,
      [md`about $0.71$`, md`$0.5$`, md`$0.97$`, md`$0.25$`], 0,
      [null, md`That is the **power** fraction. The field is its square root.`, md`dB are logs; 3 dB is a factor of 2 in power, not 3%.`, md`That is a 6 dB loss in power.`],
      md`3 dB halves the power, so the field is $1/\sqrt2 \approx 0.71$.`),
    Q(md`A wave loses 6 dB. Its power is down to about…`,
      [md`$1/4$`, md`$1/6$`, md`$1/2$`, md`$1/36$`], 0,
      [null, md`dB add for ratios that multiply: 6 dB is 3 dB twice.`, md`That is 3 dB.`, md`That squares the ratio.`],
      md`3 dB is a factor of 2; 6 dB is $2\times2 = 4$.`),
    Q(md`A current sheet inside a good conductor keeps $|\tilde H(0)|$ fixed while its frequency is raised. The power entering the conductor…`,
      [md`grows as $\sqrt f$`, md`stays the same`, md`falls as $1/\sqrt f$`, md`grows as $f$`], 0,
      [null, md`$\tfrac12|H|^2R_s$ with $R_s\propto\sqrt f$: fixed $H$, rising $R_s$.`, md`It is $\delta$ that falls as $1/\sqrt f$; $R_s = 1/\sigma\delta$ rises.`, md`$R_s = \sqrt{\pi f\mu/\sigma}$ has $f$ under a square root.`],
      md`This is why SP24 #2(e) says the power carried across a plane and absorbed between two planes both change with frequency.`),
    Q(md`Just inside a good conductor with $R_s = 0.25\ \Omega$, $E_0 = 1$ V/m. The power per square meter entering is…`,
      [md`$1$ W/m²`, md`$2$ W/m²`, md`$1.41$ W/m²`, md`$0.125$ W/m²`], 0,
      [null, md`That is $E_0^2/2R_s$, which treats $R_s$ as if it were $1/\Re\{1/\eta\}$.`, md`That is $E_0^2/2|\eta|$ with $|\eta| = \sqrt2R_s$, without $\cos45°$.`, md`That is $\tfrac12E_0^2R_s$, the $H$ form used with $E$.`],
      md`$E_0^2/4R_s = 1/(4\times0.25) = 1$ W/m².`),
    Q(md`5 W flows into a closed box in a lossy medium and 2 W flows out, on average. What happens to the other 3 W?`,
      [md`It becomes heat inside the box`, md`It is stored as field energy that keeps growing`, md`It is reflected back out`, md`It leaves through the side faces`], 0,
      [null, md`In steady state the average stored energy does not change from period to period.`, md`The 2 W out already counts everything that leaves.`, md`"Out" means every face; nothing else leaves.`],
      md`Averaged Poynting theorem: power in = $\langle\mathbf J\cdot\mathbf E\rangle$ inside.`),
    Q(md`Why is $\langle\partial w/\partial t\rangle = 0$ for a sinusoidal steady state?`,
      [md`$w$ repeats every period, so it ends each period where it began`, md`Because $w = 0$ in a lossy medium`, md`Because $\partial w/\partial t$ is always zero`, md`Because the fields decay`], 0,
      [null, md`$w = \tfrac12\epsilon E^2 + \tfrac12\mu H^2$ is positive wherever there is a field.`, md`$w$ rises and falls twice per period; only its average change is zero.`, md`Decay in space has nothing to do with change in time at one point.`],
      md`The average of a derivative over a period is (value at end − value at start)/$T$ = 0.`),
    Q(md`In a lossy medium the heat per cubic meter at depth $\delta$ is what fraction of its value at the surface?`,
      [md`$e^{-2} \approx 13.5\%$`, md`$e^{-1} \approx 37\%$`, md`$50\%$`, md`$0$`], 0,
      [null, md`That is the field's fraction. Heat goes as $|E|^2$.`, md`Exponential decay does not halve at $\delta$.`, md`It only approaches zero far beyond $\delta$.`],
      md`$\tfrac12\sigma|\tilde E|^2\propto e^{-2\alpha z} = e^{-2}$ at $z = \delta$.`),
    Q(md`At the surface of a lossy medium the heat is $\tfrac12\sigma E_0^2 = 4$ W/m³, and $\alpha = 0.5$ Np/m. $S_0$ is…`,
      [md`$4$ W/m²`, md`$8$ W/m²`, md`$2$ W/m²`, md`$16$ W/m²`], 0,
      [null, md`That divides by $\alpha$. The rate of power loss is $2\alpha S_0$.`, md`That multiplies by $\alpha$ instead of dividing by $2\alpha$.`, md`That divides by $\alpha^2$.`],
      md`$-dS/dz = 2\alpha S_0 = \tfrac12\sigma E_0^2$ at the surface, so $S_0 = 4/(2\times0.5) = 4$ W/m².`),
    Q(md`A 1 cm by 1 cm square of a thick metal surface and a 1 m by 1 m square of the same surface: their surface resistances are…`,
      [md`the same`, md`$10^4$ times bigger for the small square`, md`$10^4$ times bigger for the big square`, md`100 times bigger for the small square`], 0,
      [null, md`For a square, length over width is 1 whatever its size: "ohms per square".`, md`Bigger squares are longer but also wider, by the same factor.`, md`Length and width cancel for any square.`],
      md`$R = L/(\sigma Lt) = 1/(\sigma t)$, with $t = \delta$ at high frequency.`),
    Q(md`Why is $R_s = 1/(\sigma\delta)$, the DC resistance of a sheet exactly one skin depth thick?`,
      [md`The real current, with the same total, makes the same heat as a uniform current in a layer $\delta$ thick`, md`Because all the current flows in the top $\delta$, and none below`, md`Because the current density is uniform down to $\delta$`, md`Because $\delta$ is the wavelength inside the conductor`], 0,
      [null, md`13.5% of the heat is below $\delta$; the current dies smoothly, not at a cutoff.`, md`It falls as $e^{-z/\delta}$ from the surface; it is the **equivalent** layer that is uniform.`, md`The wavelength inside is $2\pi\delta$.`],
      md`Total current $|\tilde J(0)|\delta/\sqrt2$ and heat $|\tilde J(0)|^2\delta/4\sigma$ match the uniform layer exactly.`),
    Q(md`A metal plate is $2\delta$ thick. Using $\tfrac12|H|^2R_s$ for its loss is…`,
      [md`roughly right: the heat beyond $2\delta$ would be about 2%`, md`exact`, md`wrong by a factor of 2`, md`meaningless: $R_s$ is only for $t \gg 1$ m`], 0,
      [null, md`The formula integrates to $z = \infty$; a plate cut at $2\delta$ is close but not exact.`, md`The missing heat is $e^{-4} \approx 1.8\%$ of the total, not half.`, md`$R_s$ needs $t \gg \delta$, not a meter.`],
      md`Heat beyond depth $t$ is a fraction $e^{-2t/\delta}$; at $t = 2\delta$ that is $e^{-4} = 1.8\%$. At a few $\delta$ the plate is "infinitely thick".`),
    Q(md`Seawater at 1 kHz has $\delta \approx 8$ m. At 100 kHz, $\delta$ is about…`,
      [md`$0.8$ m`, md`$0.08$ m`, md`$80$ m`, md`$8$ m`], 0,
      [null, md`That scales with $1/f$. $\delta\propto1/\sqrt f$.`, md`A higher frequency gives a thinner skin.`, md`$\delta$ depends on $f$.`],
      md`$f$ up by 100, $\delta$ down by $\sqrt{100} = 10$.`),
    Q(md`To reach a submarine 100 m down in seawater, which transmitter frequency loses the least power?`,
      [md`$100$ Hz`, md`$10$ kHz`, md`$1$ MHz`, md`$1$ GHz`], 0,
      [null, md`$\alpha\propto\sqrt f$: at 10 kHz, $\alpha = 0.4\pi\cdot\tfrac{1}{\sqrt{10}}\approx0.4$ Np/m, so 100 m costs about 350 dB.`, md`At 1 MHz $\delta$ is 25 cm; 100 m is 400 skin depths.`, md`At 1 GHz seawater is not even a good conductor, and the loss is enormous.`],
      md`$\alpha\propto\sqrt f$, so the lowest frequency penetrates deepest (at 100 Hz, $\delta \approx 25$ m). The price is a tiny bandwidth: very slow messages.`),
    Q(md`A field amplitude down to 1% of its starting value is a loss of…`,
      [md`$40$ dB`, md`$20$ dB`, md`$100$ dB`, md`$4.6$ dB`], 0,
      [null, md`That is $10\log$ on a field ratio. Fields take $20\log$.`, md`dB are logs: $20\log_{10}100 = 40$.`, md`That is $\ln100$, the depth in skin depths, not dB.`],
      md`$20\log_{10}(100) = 40$ dB. The power is down to $10^{-4}$.`),
    Q(md`The number $8.686$ in "loss $= 8.686\,\alpha d$ dB" is…`,
      [md`$20\log_{10}e$`, md`$10\log_{10}e$`, md`$10\ln10$`, md`$2\ln10$`], 0,
      [null, md`That is $4.343$, the factor for $e^{-\alpha d}$ under $10\log$.`, md`$10\ln10 \approx 23$.`, md`$2\ln10 \approx 4.6$, the 1% depth in skin depths.`],
      md`$10\log_{10}e^{-2\alpha d} = -2\alpha d(10\log_{10}e) = -20\log_{10}e\cdot\alpha d$.`),
    Q(md`A loss of $\alpha d = 3$ nepers is, in dB, about…`,
      [md`$26$ dB`, md`$13$ dB`, md`$3$ dB`, md`$52$ dB`], 0,
      [null, md`That uses $4.343$ per neper.`, md`Nepers and decibels are different units: 1 Np = 8.686 dB.`, md`That doubles twice.`],
      md`$3\times8.686 = 26$ dB.`),
    Q(md`$\alpha = 0.02$ Np/m. The loss over 1 km is…`,
      [md`$174$ dB`, md`$87$ dB`, md`$20$ dB`, md`$17.4$ dB`], 0,
      [null, md`That uses $4.343\,\alpha d$, the field's $10\log$.`, md`That is $\alpha d$ in nepers.`, md`That uses 100 m instead of 1000 m.`],
      md`$8.686(0.02)(1000) = 174$ dB.`),
    Q(md`Two slabs in a row lose 7 dB and 13 dB. Together they pass what fraction of the power?`,
      [md`$1/100$`, md`$1/91$`, md`$1/20$`, md`$1/1000$`], 0,
      [null, md`Multiply ratios, add dB: $7 + 13 = 20$ dB, not $7\times13$.`, md`20 dB is a power ratio of $10^{2}$, not 20.`, md`That is 30 dB.`],
      md`$7 + 13 = 20$ dB $\Rightarrow 10^{-2}$.`),
    Q(md`$S_0$ enters a good conductor. The power absorbed between depths $\delta$ and $2\delta$ is about…`,
      [md`$0.12\,S_0$`, md`$0.23\,S_0$`, md`$0.135\,S_0$`, md`$0.86\,S_0$`], 0,
      [null, md`That uses $e^{-1} - e^{-2}$, the field's fractions.`, md`That is what crosses $\delta$; some of it continues past $2\delta$.`, md`That is the first skin depth.`],
      md`$S_0(e^{-2} - e^{-4}) = S_0(0.135 - 0.018) = 0.117\,S_0$.`),
    Q(md`Someone writes $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}\}$, without the conjugate, for a lossy wave. What goes wrong?`,
      [md`The phases add: the result carries $e^{-j2\beta z}$ and swings with $z$, which is not an average`, md`Nothing; the conjugate only matters at $z = 0$`, md`It loses the factor $e^{-2\alpha z}$`, md`It doubles the answer`], 0,
      [null, md`Even at $z = 0$ it gives $\cos(-\tau)$ only by luck of the chosen phase; in general it is wrong.`, md`The real factors $e^{-\alpha z}$ are unaffected by conjugation.`, md`The size is the same; the phase is wrong.`],
      md`$\tilde E\tilde H^*$ subtracts phases; $\tilde E\tilde H$ adds them, giving $e^{-2\alpha z}\cos(2\beta z + \tau)$, which can even be negative.`),
    Q(md`A good conductor carries $|\mathbf H_{\tan}| = 3$ A/m at its surface. The total skin current per meter of width is…`,
      [md`$3$ A/m`, md`$6$ A/m`, md`$3\sqrt2$ A/m`, md`$3/\sqrt2$ A/m`], 0,
      [null, md`The doubling happens to an incident $H_i$ at a mirror; $\mathbf H_{\tan}$ at the surface already includes it.`, md`$|\tilde J_s| = |\sigma\eta/\gamma||\tilde H| \approx |\tilde H|$; no $\sqrt2$.`, md`The $1/\sqrt2$ is the height of the equivalent uniform layer in units of $|\tilde J(0)|$, not of $H$.`],
      md`$\tilde J_s = \tilde J(0)/\gamma = (\sigma\eta/\gamma)\tilde H_0 \approx \tilde H_0$, since $\gamma/\eta \approx \sigma$.`),
    Q(md`A good conductor's surface resistance is $R_s$. In terms of $R_s$, its intrinsic impedance is…`,
      [md`$\eta = (1 + j)R_s$`, md`$\eta = R_s$`, md`$\eta = jR_s$`, md`$\eta = \sqrt2\,R_s$`], 0,
      [null, md`$\eta$ of a good conductor has an angle of $45°$, so it has an imaginary part.`, md`The real part, $R_s$, is not zero.`, md`That is $|\eta|$, the size; $\eta$ itself is complex.`],
      md`$\eta \approx \sqrt{j\omega\mu/\sigma} = (1 + j)\sqrt{\omega\mu/2\sigma} = (1 + j)R_s$.`),
    Q(md`A silver mirror ($R_s \approx 8$ mΩ at 1 GHz) reflects a wave from air. The fraction of the incident power it absorbs is about…`,
      [md`$4R_s/\eta_0 \approx 10^{-4}$`, md`$R_s/\eta_0 \approx 2\times10^{-5}$`, md`$1/2$`, md`$0$ exactly`], 0,
      [null, md`At the mirror the total tangential $H$ is $2H_i$, so the absorbed power has a factor $2^2 = 4$.`, md`A good conductor reflects almost everything.`, md`Only a perfect conductor ($R_s = 0$) absorbs nothing.`],
      md`$\tfrac12(2H_i)^2R_s\big/\tfrac12H_i^2\eta_0 = 4R_s/\eta_0 = 0.032/377 \approx 8.5\times10^{-5}$.`),
  ];
})();

/* Topic 12 — Displacement current and the Ampère–Maxwell law (Lectures 13, 16a). The capacitor paradox, ∂D/∂t as a
   current, why charge conservation forces it, conduction versus displacement current (σ/ωε), Maxwell's equations
   complete, and getting H from E (or E from H) with the two curl equations (HW 7 #4).
   Charge relaxation is Topic 3; the wave equation that the two curl equations produce is Topic 14. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;
  const EPS0 = EM.eps0, CL = EM.c, ETA0 = EM.eta0;

  // a multiple-choice question whose options keep their printed order (a)–(e), "none of the above" last
  const fixedQ = (...a) => { const q = Q(...a); q.parts[0].fixed = true; return q; };

  // unit vectors as [axis index, sign]; cross(a, b) for two different axes
  const AX = ['x', 'y', 'z'];
  const cross = (a, b) => [3 - a[0] - b[0], a[1] * b[1] * ((b[0] - a[0] + 3) % 3 === 1 ? 1 : -1)];
  const vec = (v) => `${v[1] < 0 ? '-' : '+'}\\hat ${AX[v[0]]}`;
  const sg = (s) => (s < 0 ? '-' : '');

  // ---------------------------------------------------------------- figures
  // side view: a wire feeds the left plate; loop C around the wire bounds a flat disk S1 (pierced by the wire)
  // and a bag S2 that wraps the plate and closes in the gap
  function paradoxFig() {
    const g = PF.fig({ alt: 'a wire carrying current I into the left plate of a capacitor; a loop C around the wire bounds a flat disk S1 that the wire pierces and a bag S2 that wraps around the plate and closes between the plates' });
    const y = 110;
    g.ellipse(100, y, 13, 42, { cls: 'shade' });
    g.line(10, y, 168, y, { cls: 'thick' });
    g.head(46, y, 1, 0, { hs: 9 });
    g.label(46, y - 9, 'I', 'b');
    g.line(168, 40, 168, 180, { cls: 'thick' });
    g.line(204, 40, 204, 180, { cls: 'thick' });
    g.line(204, y, 290, y, { cls: 'thick' });
    g.head(256, y, 1, 0, { hs: 9 });
    for (const yy of [54, 82, 138, 166]) g.arrow(171, yy, 201, yy, { cls: 'dim thin', hs: 5 });
    g.label(214, 38, '\\mathbf E', 'bl');
    g.ellipse(100, y, 13, 42, { cls: 'thick' });
    g.label(88, 66, 'C', 'br');
    g.label(82, 134, 'S_1', 'r');
    g.pl([[100, 68], [110, 50], [124, 34], [142, 24], [162, 21], [186, 21], [186, 199], [162, 199], [142, 196], [124, 186], [110, 170], [100, 152]], { cls: 'dash' });
    g.label(150, 16, 'S_2', 'b');
    return g.svg();
  }

  // side view of the worked example: circular plates on the z-axis, E up and growing, H into the page on the right
  function capFig() {
    const g = PF.fig({ alt: 'side view of a circular parallel-plate capacitor on the z-axis, bottom plate positive; E points up between the plates and grows; H circles the axis, into the page on the right and out of it on the left, inside and outside the plates' });
    const cx = 150, yt = 60, yb = 132, ym = (yt + yb) / 2;
    g.line(cx, 6, cx, yt, { cls: 'thick' });
    g.line(cx, yb, cx, 196, { cls: 'thick' });
    g.head(cx, 172, 0, -1, { hs: 9 }); g.label(cx + 9, 176, 'I', 'l');
    g.head(cx, 30, 0, -1, { hs: 9 }); g.label(cx + 9, 32, 'I', 'l');
    g.line(60, yt, 240, yt, { cls: 'thick' });
    g.line(60, yb, 240, yb, { cls: 'thick' });
    for (const x of [72, 96, 204]) g.arrow(x, yb - 5, x, yt + 5, { cls: 'dim thin', hs: 5 });
    g.label(212, ym, '\\mathbf E', 'l');
    g.line(cx, yt, cx, yb, { cls: 'dash dim' });
    g.otimes(cx + 30, ym, 6); g.odot(cx - 30, ym, 6);
    g.otimes(268, ym, 6, { lab: '\\mathbf H' }); g.odot(32, ym, 6);
    g.label(64, yb + 6, '+', 'tl', 'small'); g.label(64, yt - 6, '-', 'bl', 'small');
    g.dim(cx, yb + 22, 240, yb + 22, 'a');
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u4', {
    id: 't12-displacement', topic: 12, ref: 'Lectures 13, 16', title: 'Displacement current and the Ampère–Maxwell law',
    steps: [
      R(md`
        !!key Why you care
          Spring 2018 1(iv) asks what must hold for $\mathbf D$ where $\mathbf J = 0$. HW 7 #4 gets $\mathbf H$ from a given $\mathbf E$, and $\mathbf E$ from a given $\mathbf H$, with the two curl equations. Lecture 16 finds the circulation of $\mathbf H$ around a point charge leaking down a wire. Every wave in Topics 14–17 exists only because of the term this topic adds.

        ### Notation

        - $\mathbf H$: magnetic field intensity, A/m. $\mathbf B = \mu\mathbf H$; in free space $\mu = \mu_0$.
        - $\mathbf E$: electric field, V/m. $\mathbf D = \epsilon\mathbf E$: electric flux density, C/m². $\epsilon = \epsilon_r\epsilon_0$ is the permittivity (F/m), $\epsilon_r$ the relative permittivity.
        - $\mathbf J$: conduction current density, A/m²; in a conductor $\mathbf J = \sigma\mathbf E$, with conductivity $\sigma$ in S/m. $I = \int_S\mathbf J\cdot d\mathbf S$: conduction current through $S$, A.
        - $\rho$: charge density, C/m³. $Q$: charge, C.
        - $C$ and $S$: a closed path and a surface with $C$ as its rim, tied by the right-hand rule (RHR) as in [Topic 8](#/l/t8-faraday).
        - $\Psi_E = \int_S\mathbf D\cdot d\mathbf S$: the **electric flux** through $S$, in coulombs.
        - $\mathbf J_d = \partial\mathbf D/\partial t$: the **displacement current density**, A/m². $I_d = d\Psi_E/dt$: the **displacement current** through $S$, A.
        - $\omega = 2\pi f$: angular frequency of a sinusoid, rad/s. $\eta = \sqrt{\mu/\epsilon}$: intrinsic impedance, Ω; $\eta_0 = 120\pi\ \Omega$ in free space.
        - $\nabla\times$, $\nabla\cdot$: curl and divergence ([Unit 0](#/l/u0-vectors)).

        ### The idea

        Static Ampère, $\oint_C\mathbf H\cdot d\mathbf l = I_{\text{enc}}$, counts the current through a surface with rim $C$. Where charge piles up, two surfaces with the same rim carry different currents, and the law contradicts itself. Maxwell's fix: a changing electric flux counts as current.
        $$\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S + \frac{d}{dt}\int_S\mathbf D\cdot d\mathbf S, \qquad \nabla\times\mathbf H = \mathbf J + \frac{\partial\mathbf D}{\partial t}$$
        The new term makes the right side the same for every surface. It also lets a changing $\mathbf E$ create $\mathbf H$ with no charge anywhere: that is what makes waves.
      `),
      RF(md`
        ### Step 1: the capacitor paradox

        [[fig:paradox]]

        A wire carries current $I$ into a capacitor. Loop $C$ circles the wire. Two surfaces share $C$ as their rim:

        - $S_1$, flat: the wire pierces it. Static Ampère gives $\oint_C\mathbf H\cdot d\mathbf l = I$.
        - $S_2$, a bag through the gap: no wire, no charge crosses it. Static Ampère gives $0$.

        Same path, same $\oint\mathbf H\cdot d\mathbf l$, two answers. Something crosses $S_2$ that static Ampère misses. $S_1$ and $S_2$ together enclose the plate, and almost no $\mathbf D$ crosses $S_1$, so by Gauss's law the flux through $S_2$ is the plate's charge: $\Psi_E = Q$. It changes at the rate
        $$\frac{d\Psi_E}{dt} = \frac{dQ}{dt} = I$$
        The rate of change of electric flux through $S_2$ equals the current through $S_1$. Count it as current and the two surfaces agree.
      `, { paradox: { svg: paradoxFig(), cap: 'Same rim C. The flat S₁ is pierced by the wire: conduction current I. The bag S₂ passes between the plates: no charge crosses it, but the flux of D through it grows at the rate I.' } }),
      Q(md`**Predict.** A capacitor is being charged by a current of 3 A in its leads. Through a surface that passes between the plates and is pierced by no wire, $d\Psi_E/dt$ is…`,
        ['3 A', '0: no charge crosses the gap', '$3\\epsilon_0$ A', 'larger for a smaller gap'], 0,
        [null, 'No charge crosses, but the flux of $\\mathbf D$ through the surface grows as the plate charges.', '$\\Psi_E = \\int\\mathbf D\\cdot d\\mathbf S$ already contains $\\epsilon$; its rate of change is $dQ/dt$, in amperes.', 'The gap sets the capacitance, not the relation $d\\Psi_E/dt = dQ/dt$.'],
        md`The surface and a disk around the lead together enclose the plate, so $\Psi_E = Q$ and $d\Psi_E/dt = dQ/dt = 3$ A, whatever the gap or the filling.`),
      R(md`
        ### Step 2: displacement current

        Maxwell named the rate of change of $\mathbf D$ the **displacement current density**:
        $$\mathbf J_d = \frac{\partial\mathbf D}{\partial t}\ \ (\text{A/m}^2), \qquad I_d = \int_S\frac{\partial\mathbf D}{\partial t}\cdot d\mathbf S = \frac{d\Psi_E}{dt}\ \ (\text{A})$$

        - It is not moving charge. In vacuum nothing flows; $\epsilon_0\,\partial\mathbf E/\partial t$ is all of it.
        - It points along the **change** of $\mathbf D$. A shrinking $\mathbf D$ gives $\mathbf J_d$ opposite to $\mathbf D$.
        - A constant $\mathbf D$, however large, gives none.

        Lecture 13's example: a uniform $\mathbf E = E_0\,te^{-t^2}\hat z$ ($t$ in seconds) crosses an area $A$ in the $xy$-plane, with $d\mathbf S = +\hat z$. Then $\Psi_E = \epsilon_0E_0A\,te^{-t^2}$ and
        $$I_d = \frac{d\Psi_E}{dt} = \epsilon_0E_0A\,(1 - 2t^2)\,e^{-t^2}$$
        It reverses at $t = 1/\sqrt2$ s, the instant $\Psi_E$ peaks.
      `),
      Q(md`**Predict.** Between two plates $\mathbf D = D(t)\,\hat z$ with $D > 0$ and **shrinking**. $\mathbf J_d$ points along…`,
        ['$-\\hat z$', '$+\\hat z$', 'nowhere: no charge moves between the plates', '$\\hat\\phi$, around the axis'], 0,
        [null, 'That is the direction of $\\mathbf D$. $\\mathbf J_d = \\partial\\mathbf D/\\partial t$ follows the change, and $D_z$ is falling.', 'Displacement current needs no moving charge, only a changing $\\mathbf D$.', 'The magnetic field circles the axis; $\\partial\\mathbf D/\\partial t$ lies along $\\mathbf D$\'s own line, $\\pm\\hat z$.'],
        md`$\partial D_z/\partial t < 0$, so $\mathbf J_d$ points along $-\hat z$. The $\mathbf H$ it makes circles clockwise seen from $+z$ (RHR, thumb down).`),
      R(md`
        ### Step 3: why the term must be there

        The divergence of a curl is zero: $\nabla\cdot(\nabla\times\mathbf H) = 0$ for any $\mathbf H$. Apply it to both versions of Ampère's law.

        - Static, $\nabla\times\mathbf H = \mathbf J$: then $\nabla\cdot\mathbf J = 0$ everywhere. Current could never pile up charge anywhere. A charging capacitor plate says otherwise.
        - With Maxwell's term, and Gauss's law $\nabla\cdot\mathbf D = \rho$:
        $$0 = \nabla\cdot\mathbf J + \frac{\partial}{\partial t}(\nabla\cdot\mathbf D) = \nabla\cdot\mathbf J + \frac{\partial\rho}{\partial t}$$
        That is the continuity equation, charge conservation ([Topic 3](#/l/t3-relaxation)).

        So Gauss's law and charge conservation together force the $\partial\mathbf D/\partial t$ term. In integral form: two surfaces with the same rim close into one surface, and the total current $\mathbf J + \partial\mathbf D/\partial t$ out of any closed surface is $-dQ/dt + dQ/dt = 0$. Total current has no beginning and no end.
      `),
      Q(md`**Predict.** Static Ampère's law, $\nabla\times\mathbf H = \mathbf J$, implies $\nabla\cdot\mathbf J = 0$ everywhere. Which situation does that forbid?`,
        ['a capacitor plate charging up', 'a steady current around a closed circuit', 'a uniform current in an infinite slab', 'equal and opposite currents in a coaxial cable'], 0,
        [null, 'A steady loop current has $\\nabla\\cdot\\mathbf J = 0$: what flows in flows out.', 'A uniform $\\mathbf J$ has zero divergence.', 'Steady currents with nowhere to pile up charge have $\\nabla\\cdot\\mathbf J = 0$.'],
        md`Current flows into the plate and none flows out: $\nabla\cdot\mathbf J < 0$ there, and $\partial\rho/\partial t > 0$. Static Ampère cannot describe it; Ampère–Maxwell can.`),
      R(md`
        ### Step 4: conduction or displacement?

        In a material with conductivity $\sigma$ and permittivity $\epsilon$, both currents flow:
        $$\nabla\times\mathbf H = \sigma\mathbf E + \epsilon\frac{\partial\mathbf E}{\partial t}$$
        For $\mathbf E = E_0\cos(\omega t)\,\hat x$ they are $\sigma E_0\cos\omega t$ and $-\omega\epsilon E_0\sin\omega t$: the same frequency, a quarter period apart, with amplitude ratio
        $$\frac{|\mathbf J|}{|\partial\mathbf D/\partial t|} = \frac{\sigma}{\omega\epsilon}$$

        | $\sigma/\omega\epsilon$ | the material is | keep |
        |---|---|---|
        | $\gg 1$ | a good conductor | $\sigma\mathbf E$ only |
        | $\ll 1$ | a good dielectric | $\epsilon\,\partial\mathbf E/\partial t$ only |
        | $\sim 1$ | neither | both |

        The crossover is $\omega = \sigma/\epsilon$, or $f_c = \sigma/2\pi\epsilon$: the same $\epsilon/\sigma$ as the relaxation time of Topic 3. A material conducts at frequencies whose period is long compared with its relaxation time. Seawater ($\sigma = 4$ S/m, $\epsilon = 81\epsilon_0$) has $f_c \approx 0.89$ GHz: a conductor at 1 MHz, a good dielectric at 100 GHz.
      `),
      Q(md`**Predict.** Copper ($\sigma = 5.8\times10^7$ S/m, $\epsilon \approx \epsilon_0$) carries a 1 GHz signal. Inside the copper, $\sigma/\omega\epsilon$ is about…`,
        ['$10^9$: conduction dominates', '$10^{-9}$: displacement dominates', '1: both matter', '$10^{18}$: conduction dominates'], 0,
        [null, 'That is $\\omega\\epsilon/\\sigma$, the ratio upside down.', 'Copper is a conductor by nine orders of magnitude, even at 1 GHz.', 'That squares the ratio; $\\omega\\epsilon_0 \\approx 0.056$ S/m at 1 GHz.'],
        md`$\omega\epsilon_0 = 2\pi(10^9)(8.854\times10^{-12}) = 0.056$ S/m, and $5.8\times10^7/0.056 \approx 1.0\times10^9$. In a metal, displacement current is negligible at any frequency an exam will use.`),
      R(md`
        ### Step 5: Maxwell's equations, complete

        | law | integral form | differential form | what it says |
        |---|---|---|---|
        | Gauss | $\oint_S\mathbf D\cdot d\mathbf S = Q_{\text{enc}}$ | $\nabla\cdot\mathbf D = \rho$ | charge is the source of $\mathbf D$: its lines start on $+$ and end on $-$ |
        | no monopoles | $\oint_S\mathbf B\cdot d\mathbf S = 0$ | $\nabla\cdot\mathbf B = 0$ | $\mathbf B$ lines never end: flux in equals flux out |
        | Faraday | $\oint_C\mathbf E\cdot d\mathbf l = -\frac{d}{dt}\int_S\mathbf B\cdot d\mathbf S$ | $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$ | a changing $\mathbf B$ makes $\mathbf E$ circulate, against the change (the minus sign) |
        | Ampère–Maxwell | $\oint_C\mathbf H\cdot d\mathbf l = I + \frac{d}{dt}\int_S\mathbf D\cdot d\mathbf S$ | $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$ | current and a changing $\mathbf D$ make $\mathbf H$ circulate around them by the RHR |

        Add $\mathbf D = \epsilon\mathbf E$, $\mathbf B = \mu\mathbf H$, $\mathbf J = \sigma\mathbf E$. Continuity, $\nabla\cdot\mathbf J = -\partial\rho/\partial t$, is not a separate law: it is the divergence of Ampère–Maxwell plus Gauss. All of it is on the formula sheet; you bring what each line says and which one a problem needs.

        The two curl equations drive waves: a changing $\mathbf E$ makes $\mathbf H$, a changing $\mathbf H$ makes $\mathbf E$, with no charge or current needed ([Topic 14](#/l/t14-wave-eq)).
      `),
      Q(md`**Predict.** The continuity equation $\nabla\cdot\mathbf J = -\partial\rho/\partial t$ follows from which two of Maxwell's equations?`,
        ['Ampère–Maxwell and Gauss for $\\mathbf D$', 'Faraday and Gauss for $\\mathbf B$', 'Faraday and Ampère–Maxwell', 'Gauss for $\\mathbf D$ and Gauss for $\\mathbf B$'], 0,
        [null, 'Neither contains $\\mathbf J$ or $\\rho$.', 'Faraday has no $\\mathbf J$ or $\\rho$; you need Gauss to turn $\\nabla\\cdot\\mathbf D$ into $\\rho$.', 'Neither contains $\\mathbf J$.'],
        md`Take the divergence of $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$: $0 = \nabla\cdot\mathbf J + \partial(\nabla\cdot\mathbf D)/\partial t$. Gauss turns $\nabla\cdot\mathbf D$ into $\rho$.`),
      R(md`
        ### Step 6: one field from the other

        Most exam fields have **one component that depends on one coordinate** $u$ (and on $t$). For those the curl is a single term, the gradient of the component crossed into its direction:
        $$\nabla\times\big(F(u,t)\,\hat a\big) = \frac{\partial F}{\partial u}\,(\hat u\times\hat a)$$
        Then:

        - **$\mathbf E$ given:** $\partial\mathbf H/\partial t = -\frac1\mu\nabla\times\mathbf E$. Integrate in $t$.
        - **$\mathbf H$ given** ($\sigma = 0$): $\partial\mathbf E/\partial t = \frac1\epsilon\nabla\times\mathbf H$. Integrate in $t$.
        - Drop the constant of integration: a static field is not part of the wave.

        HW 7 #4(a): $\mathbf E = \cos(\omega t - \beta x)\,\hat y$ V/m, with $\omega/\beta = c$ and $\mu = \mu_0$.
        $$\nabla\times\mathbf E = \frac{\partial E_y}{\partial x}(\hat x\times\hat y) = \beta\sin(\omega t - \beta x)\,\hat z$$
        $$\frac{\partial\mathbf H}{\partial t} = -\frac{\beta}{\mu_0}\sin(\omega t - \beta x)\,\hat z \quad\Rightarrow\quad \mathbf H = \frac{\beta}{\omega\mu_0}\cos(\omega t - \beta x)\,\hat z = \frac{1}{120\pi}\cos(\omega t - \beta x)\,\hat z\ \ \text{A/m}$$
        since $\beta/\omega = 1/c$ and $\mu_0c = \eta_0 = 120\pi\ \Omega$. Check: $\mathbf E\times\mathbf H \propto \hat y\times\hat z = \hat x$, the way $\omega t - \beta x$ travels. Put this $\mathbf H$ into Ampère–Maxwell and you get the same $\mathbf E$ back only if $\beta = \omega\sqrt{\mu\epsilon}$: the two curl equations agree only at the right speed.
      `),
      Q(md`**Predict.** HW 7 #4(b): $\mathbf H = \cos(\omega t + \beta y)\,\hat x$ A/m in a medium with $\sigma = 0$, $\epsilon = 2.25\epsilon_0$, $\mu = \mu_0$ and $\omega/\beta = \tfrac23c$. Ampère–Maxwell gives $\mathbf E = $`,
        ['$-80\\pi\\cos(\\omega t + \\beta y)\\,\\hat z$ V/m', '$+80\\pi\\cos(\\omega t + \\beta y)\\,\\hat z$ V/m', '$-120\\pi\\cos(\\omega t + \\beta y)\\,\\hat z$ V/m', '$-80\\pi\\sin(\\omega t + \\beta y)\\,\\hat z$ V/m'], 0,
        [null, 'Sign: $\\hat y\\times\\hat x = -\\hat z$, and the $t$-integral of $\\sin$ is $-\\cos/\\omega$. Then $\\mathbf E\\times\\mathbf H$ must point along $-\\hat y$, the way $\\omega t + \\beta y$ travels.', 'That is $\\eta_0$; in this medium $\\eta = \\eta_0/\\sqrt{2.25} = 80\\pi\\ \\Omega$.', 'Integrating $\\sin$ in time gives $\\cos$: $\\mathbf E$ and $\\mathbf H$ of one traveling wave are in phase.'],
        md`$\nabla\times\mathbf H = \frac{\partial H_x}{\partial y}(\hat y\times\hat x) = [-\beta\sin(\omega t + \beta y)](-\hat z) = \beta\sin(\omega t + \beta y)\,\hat z$. Then $\mathbf E = \frac1\epsilon\int\nabla\times\mathbf H\,dt = -\frac{\beta}{\epsilon\omega}\cos(\omega t + \beta y)\,\hat z$, and $\frac{\beta}{\epsilon\omega} = \frac{1}{(2.25\epsilon_0)(\frac23c)} = \frac{\eta_0}{1.5} = 80\pi\ \Omega$. Check: $(-\hat z)\times\hat x = -\hat y$, the travel direction of $\omega t + \beta y$. ✓`),
      RF(md`
        ### The method

        !!method Ampère–Maxwell in four steps
          1. **Pick $C$ and its direction**; the RHR fixes $d\mathbf S$. Choose the surface that makes counting easy: every surface with rim $C$ gives the same total.
          2. **Conduction:** $I = \int_S\mathbf J\cdot d\mathbf S$, the wires that pierce $S$.
          3. **Displacement:** $\Psi_E = \int_S\mathbf D\cdot d\mathbf S$, then $I_d = d\Psi_E/dt$.
          4. **Solve:** $\oint_C\mathbf H\cdot d\mathbf l = I + I_d$; with circular symmetry, $H_\phi\,2\pi r = I + I_d$.

          For one field from the other: curl the given field (one term), set it equal to $-\mu\,\partial\mathbf H/\partial t$ or $\sigma\mathbf E + \epsilon\,\partial\mathbf E/\partial t$, integrate in $t$, then check that $\mathbf E\times\mathbf H$ points along the travel and $|\mathbf E|/|\mathbf H| = \eta$.

        ### Worked example

        !!graded Problem
          A parallel-plate capacitor has circular plates of radius $a = 10$ cm on the $z$-axis, separated by $d = 1$ mm of air. The bottom plate is positive, so between the plates $\mathbf E = (V/d)\,\hat z$ (uniform, no fringing), and the voltage $V$ rises at $dV/dt = 10^9$ V/s. Find (a) the displacement current density, (b) the displacement current between the plates, (c) $\mathbf H$ in the midplane at $r = 4$ cm and at $r = 15$ cm, and (d) the current in the leads.

        [[fig:cap]]

        **1. Displacement current density.**
        $$\mathbf J_d = \epsilon_0\frac{\partial\mathbf E}{\partial t} = \frac{\epsilon_0}{d}\frac{dV}{dt}\,\hat z = \frac{(8.854\times10^{-12}\,\text{F/m})(10^9\,\text{V/s})}{10^{-3}\,\text{m}}\,\hat z = 8.85\,\hat z\ \ \text{A/m}^2$$

        **2. Total displacement current.** $I_d = J_d\,\pi a^2 = (8.85\,\text{A/m}^2)\,\pi\,(0.1\,\text{m})^2 = 0.278$ A, along $+\hat z$.

        **3. Path and surface.** A circle of radius $r$ in the midplane, counterclockwise from $+z$, so $d\mathbf S = +\hat z$ on the flat disk it bounds. No wire pierces that disk: only $I_d$ counts. By symmetry $\mathbf H = H_\phi(r)\hat\phi$.
        $$r < a:\ \ H_\phi\,2\pi r = J_d\,\pi r^2 \ \Rightarrow\ H_\phi = \frac{J_dr}{2} = \frac{(8.85)(0.04)}{2} = 0.177\ \text{A/m}$$
        $$r > a:\ \ H_\phi\,2\pi r = J_d\,\pi a^2 \ \Rightarrow\ H_\phi = \frac{I_d}{2\pi r} = \frac{0.278}{2\pi(0.15)} = 0.295\ \text{A/m}$$
        Both positive: $\mathbf H$ circulates counterclockwise seen from $+z$.

        **4. Lead current.** $C = \epsilon_0\pi a^2/d = 278$ pF, so $I = C\,dV/dt = 0.278$ A, flowing up into the bottom plate and up out of the top plate.

        **5. Check.** $I_d = I$: the current is continuous through the gap, as Step 3 demands. Outside the plates $\mathbf H$ is the same as around the lead wire at the same $r$. Direction: RHR with the thumb along $\mathbf J_d = +\hat z$ curls counterclockwise from above. ✓

        !!mistake Common mistakes
          - Treating $I_d$ as moving charge, or looking for it only in dielectrics. In vacuum, $\epsilon_0\,\partial\mathbf E/\partial t$ is all of it.
          - Using $\mathbf D$ instead of its rate of change: a large constant field gives no displacement current and no $\mathbf H$.
          - Pointing $\mathbf J_d$ along $\mathbf D$. It points along $\partial\mathbf D/\partial t$; a shrinking $\mathbf D$ gives $\mathbf J_d$ against $\mathbf D$.
          - Counting the lead current on a surface it does not pierce, or forgetting $I_d$ on a surface through the gap. Count only what crosses the surface you chose.
          - Using $\epsilon_0$ in a dielectric: $\mathbf J_d = \epsilon_r\epsilon_0\,\partial\mathbf E/\partial t$.
          - $\sigma/\omega\epsilon$ with $f$ in place of $\omega$: off by $2\pi$.
          - Carrying Faraday's minus sign into Ampère–Maxwell. $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$, but $\nabla\times\mathbf H = +\mathbf J + \partial\mathbf D/\partial t$.

        ### Check questions
      `, { cap: { svg: capFig(), cap: 'Side view, z up. E grows upward between the plates, so H circles counterclockwise seen from +z: into the page on the right, out of it on the left, inside and outside the plates.' } }),
      fixedQ(md`If the current density $\mathbf J = 0$ within a certain volume in free space, which statement must be true for the electric displacement $\mathbf D$ in that volume?`,
        ['$\\partial\\mathbf D/\\partial t = 0$', '$\\partial(\\nabla\\cdot\\mathbf D)/\\partial t = 0$', '$\\nabla\\cdot\\mathbf D = 0$', '$\\mathbf D = 0$', 'None of the above'], 1,
        ['No current does not mean no change: a wave crossing the volume has $\\partial\\mathbf D/\\partial t \\ne 0$ with $\\mathbf J = 0$.', null, 'Static charge may sit in the volume: $\\mathbf J = 0$ says no charge moves, not that none is there.', 'Charges outside the volume, or a passing wave, can fill it with field.', '$\\partial(\\nabla\\cdot\\mathbf D)/\\partial t = 0$ must hold: take the divergence of Ampère–Maxwell.'],
        md`$\nabla\cdot(\nabla\times\mathbf H) = 0$ turns Ampère–Maxwell into $0 = \nabla\cdot\mathbf J + \partial(\nabla\cdot\mathbf D)/\partial t$. With $\mathbf J = 0$: $\partial(\nabla\cdot\mathbf D)/\partial t = 0$, i.e. $\partial\rho/\partial t = 0$. With no current, the charge density cannot change. (Spring 2018 1(iv); option (b) on the paper.)`, { src: 'Spring 2018 Exam 2' }),
      Q(md`A point charge $Q(t)$ at the origin leaks away through a thin wire along the $+z$-axis, carrying current $I$ off to infinity, so $dQ/dt = -I$. Around a circle of radius $a$ in the $xy$-plane centered on the origin, counterclockwise seen from $+z$, $\oint\mathbf H\cdot d\mathbf l = $`,
        ['$I/2$', '$I$', '$0$', '$-I/2$'], 0,
        [null, 'That counts the wire through the upper hemisphere but not the displacement current: the outward flux of $\\mathbf D$ through that hemisphere, $Q/2$, is shrinking.', 'That counts the lower hemisphere\'s conduction current (none) but not its displacement current.', 'The wire current crosses the upper hemisphere along $d\\mathbf S$ (+), and the shrinking flux takes away only half of it.'],
        md`Use the upper hemisphere; the RHR makes $d\mathbf S$ point outward. The wire crosses it: $+I$. Half the charge's flux exits through it: $\Psi_E = Q/2$, so $I_d = \frac{d}{dt}\frac Q2 = -\frac I2$. Total $I/2$. The lower hemisphere ($d\mathbf S$ up, into the sphere) gives $0 + \frac{d}{dt}\left(-\frac Q2\right) = +\frac I2$: the same, as it must be. (Lecture 16.)`),
      Q(md`A uniform $\mathbf E = E_0\,te^{-t^2}\hat z$ crosses a fixed area in the $xy$-plane. The displacement current through it is zero at…`,
        ['$t = 1/\\sqrt2$ s, where the flux peaks', '$t = 0$, where $\\mathbf E = 0$', 'no time: $\\mathbf E$ keeps changing', '$t \\to \\infty$ only'], 0,
        [null, 'At $t = 0$ the field is zero but changing fastest: $(1 - 2t^2)e^{-t^2} = 1$ there.', 'At the peak of $te^{-t^2}$ the field stops changing for an instant.', 'It also vanishes at $t = 1/\\sqrt2$ s, where $1 - 2t^2 = 0$.'],
        md`$I_d \propto \frac{d}{dt}(te^{-t^2}) = (1 - 2t^2)e^{-t^2}$, zero at $t = 1/\sqrt2$ s. Displacement current follows the slope of $\mathbf E$, not its value. (Lecture 13.)`),
      Q(md`Seawater has $\sigma = 4$ S/m and $\epsilon = 81\epsilon_0$. A 1 kHz field in it drives…`,
        ['mostly conduction current: $\\sigma/\\omega\\epsilon \\approx 9\\times10^5$', 'mostly displacement current: $\\epsilon_r = 81$ is large', 'equal conduction and displacement currents', 'no current: water is a dielectric'], 0,
        [null, 'A large $\\epsilon_r$ is not enough: $\\omega\\epsilon = 4.5\\times10^{-6}$ S/m at 1 kHz, tiny next to 4 S/m.', 'They are equal only near $f_c = \\sigma/2\\pi\\epsilon \\approx 0.89$ GHz.', 'Salt makes seawater a conductor; it acts as a dielectric only well above $f_c \\approx 0.89$ GHz.'],
        md`$\omega\epsilon = 2\pi(10^3)(81)(8.854\times10^{-12}) = 4.5\times10^{-6}$ S/m, and $4/4.5\times10^{-6} \approx 9\times10^5$. Conduction wins by six orders of magnitude.`),
      Q(md`The units of $\epsilon_0\,\partial\mathbf E/\partial t$ are…`,
        ['A/m²', 'A', 'C/m²', 'A/m'], 0,
        [null, 'A current density integrated over an area gives amperes; this is a density.', 'That is $\\mathbf D$ itself; the time derivative adds 1/s, and C/s = A.', 'A/m is $\\mathbf H$ or a surface current $\\mathbf J_s$.'],
        md`(F/m)(V/m)/s = (C/V·m)(V/m)/s = C/(m²·s) = A/m², the same as $\mathbf J$. That is why the two can be added.`),
      Q(md`A circular capacitor of plate radius $a$ is charging (no fringing). In the midplane, $|\mathbf H|$ at distance $r$ from the axis…`,
        ['grows as $r$ for $r < a$, and falls as $1/r$ for $r > a$', 'is zero: no current flows between the plates', 'is uniform for $r < a$', 'falls as $1/r$ everywhere, as around a wire'], 0,
        [null, 'The displacement current between the plates makes $\\mathbf H$ just as conduction current would.', 'The enclosed displacement current grows as $\\pi r^2$, so $H_\\phi = J_dr/2$ grows with $r$.', 'Inside the plates the enclosed current is only the fraction $r^2/a^2$ of the total.'],
        md`$H_\phi\,2\pi r = J_d\,\pi\min(r, a)^2$: $H_\phi = J_dr/2$ inside, $J_da^2/2r$ outside. The same profile as a thick wire carrying a uniform current.`),
      Q(md`HW 7 #4(a) reversed: for $\mathbf E = \cos(\omega t + \beta x)\,\hat y$ V/m in free space with $\omega/\beta = c$, Faraday's law gives $\mathbf H = $`,
        ['$-\\frac{1}{120\\pi}\\cos(\\omega t + \\beta x)\\,\\hat z$ A/m', '$+\\frac{1}{120\\pi}\\cos(\\omega t + \\beta x)\\,\\hat z$ A/m', '$-120\\pi\\cos(\\omega t + \\beta x)\\,\\hat z$ A/m', '$-\\frac{1}{120\\pi}\\sin(\\omega t + \\beta x)\\,\\hat z$ A/m'], 0,
        [null, 'That copies the forward wave of Step 6. Here $\\partial_xE_y$ flips sign, and $\\mathbf E\\times\\mathbf H$ must point along $-\\hat x$, the travel of $\\omega t + \\beta x$.', '$|\\mathbf H| = |\\mathbf E|/\\eta_0$, not $\\eta_0|\\mathbf E|$.', 'The time integral of $\\sin$ is $-\\cos/\\omega$: $\\mathbf H$ is in phase with $\\mathbf E$.'],
        md`$\nabla\times\mathbf E = \frac{\partial E_y}{\partial x}(\hat x\times\hat y) = -\beta\sin(\omega t + \beta x)\,\hat z = -\mu_0\,\partial\mathbf H/\partial t$, so $\mathbf H = -\frac{\beta}{\omega\mu_0}\cos(\omega t + \beta x)\,\hat z$, and $\frac{\beta}{\omega\mu_0} = \frac{1}{\mu_0c} = \frac{1}{120\pi}$ S. Check: $\hat y\times(-\hat z) = -\hat x$, the travel of $\omega t + \beta x$. ✓`),
      Q(md`A closed surface surrounds one plate of a capacitor that is charging through a lead wire; the wire pierces the surface. The total current, conduction plus displacement, out of the surface is…`,
        ['zero', '$-I$: the lead current flows in', '$+I$: the flux of $\\mathbf D$ flows out', '$2I$'], 0,
        [null, 'That counts only the conduction current. The flux of $\\mathbf D$ out of the surface grows at the same rate $I$.', 'That counts only the displacement current; the lead brings $I$ in.', 'The two terms have opposite signs: one in, one out.'],
        md`Conduction in: $-I$. Displacement out: $d\Psi_E/dt = dQ/dt = +I$. Sum: 0. The total current out of any closed surface is zero; that is why Ampère–Maxwell does not care which surface you use.`),
      R(md`
        ### Rapid fire: which current, which way

        **The trick:** $\mathbf J_d$ follows the **change** of $\mathbf D$; count only what crosses the surface you chose; $\sigma/\omega\epsilon$ decides which current matters; $\mathbf E\times\mathbf H$ points along the travel.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t12_dir', { need: 8 }), { id: 't12-displacement.r0' }),
      R(md`
        ### Rapid fire: sizes

        **The trick:** a sinusoid has $|\mathbf J_d|_{\max} = \omega\epsilon E_0$; a capacitor has $I_d = C\,dV/dt$; a disk of radius $r$ between plates of radius $a$ catches the fraction $r^2/a^2$ of it.
      `),
      Object.assign(G('rf_t12_num', { need: 8 }), { id: 't12-displacement.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t12_cap', { need: 2 }),
      G('t12_ratio', { need: 2 }),
      G('t12_curl', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const fHz = (x) => (x >= 1e9 ? `${+(x / 1e9).toPrecision(3)} GHz` : x >= 1e6 ? `${+(x / 1e6).toPrecision(3)} MHz` : x >= 1e3 ? `${+(x / 1e3).toPrecision(3)} kHz` : `${x} Hz`);
  const MATS = [['copper', 5.8e7, 1], ['seawater', 4, 81], ['fresh water', 1e-2, 80], ['wet soil', 1e-2, 15], ['dry soil', 1e-4, 3], ['glass', 1e-12, 5], ['doped silicon', 10, 11.7]];
  const FREQS = [60, 1e3, 1e5, 1e6, 1e8, 1e9, 1e10, 1e11];
  const MAXW = {
    gauss: ['Gauss: $\\nabla\\cdot\\mathbf D = \\rho$', 'charge is the source of $\\mathbf D$'],
    mono: ['no monopoles: $\\nabla\\cdot\\mathbf B = 0$', '$\\mathbf B$ lines never end'],
    far: ['Faraday: $\\nabla\\times\\mathbf E = -\\partial\\mathbf B/\\partial t$', 'a changing $\\mathbf B$ makes $\\mathbf E$ circulate'],
    amp: ['Ampère–Maxwell: $\\nabla\\times\\mathbf H = \\mathbf J + \\partial\\mathbf D/\\partial t$', 'current and a changing $\\mathbf D$ make $\\mathbf H$ circulate'],
  };

  GENS.rf_t12_dir = () => one([
    // direction of J_d from a growing or shrinking D
    () => {
      const k = pick(AX), sD = pick([1, -1]), grow = pick([true, false]);
      const s = sD * (grow ? 1 : -1);
      const o = AX.filter((a) => a !== k);
      return MC('Which way is the displacement current?', md`$\mathbf D = ${sD > 0 ? '' : '-'}D(t)\,\hat ${k}$ with $D > 0$ **${grow ? 'growing' : 'shrinking'}**. $\mathbf J_d$ points along…`, `$${vec([AX.indexOf(k), s])}$`,
        [[`$${vec([AX.indexOf(k), -s])}$`, grow ? 'That points against $\\mathbf D$; a growing $\\mathbf D$ changes along itself.' : 'That is the direction of $\\mathbf D$ itself; $\\mathbf J_d$ follows the change, and $|\\mathbf D|$ is falling.'],
          ['nowhere: no charge moves', 'Displacement current needs only a changing $\\mathbf D$, not moving charge.'],
          [`$\\pm\\hat ${o[0]}$`, `$\\partial\\mathbf D/\\partial t$ lies along the line of $\\mathbf D$, $\\pm\\hat ${k}$.`],
          [`$\\pm\\hat ${o[1]}$`, `$\\partial\\mathbf D/\\partial t$ lies along the line of $\\mathbf D$, $\\pm\\hat ${k}$.`]],
        md`$\partial D_${k}/\partial t$ is ${s > 0 ? 'positive' : 'negative'}, so $\mathbf J_d = \partial\mathbf D/\partial t$ points along $${vec([AX.indexOf(k), s])}$.`);
    },
    // what crosses which surface of a charging capacitor
    () => {
      // options as [conduction, displacement] in units of I
      const O = [[1, 0], [0, 1], [1, 1], [0, 0.25], [0, 0]];
      const txt = ([c, d]) => `conduction $${c ? 'I' : '0'}$, displacement $${d === 1 ? 'I' : d ? 'I/4' : '0'}$`;
      const [surf, r] = pick([
        ['a flat disk around the lead wire, pierced by it', 0],
        ['a bag through the gap, with the same rim as a loop around the lead', 1],
        ['a flat disk between the plates, as large as the plates', 1],
        ['a flat disk between the plates, centered on the axis, of half the plate radius', 3],
      ]);
      const [c0, d0] = O[r];
      const why = ([c, d]) => (c !== c0 ? (c0 ? 'The lead wire pierces this surface: its conduction current counts.' : 'No wire pierces this surface: no conduction current.')
        : d0 === 0 ? 'Almost no $\\mathbf D$ crosses this surface: no displacement current.'
          : d0 === 1 ? 'All of the plate\'s $\\mathbf D$ crosses this surface, and it grows at $dQ/dt = I$.'
            : 'With no fringing $\\mathbf D$ is uniform: a disk of half the radius catches $(1/2)^2 = 1/4$ of it.');
      return MC('What crosses this surface?', md`A capacitor with circular plates is charged by current $I$ in its leads (no fringing). Through **${surf}**, the currents are…`, txt(O[r]),
        O.filter((_, i) => i !== r).map((o) => [txt(o), why(o)]),
        md`Count only what crosses the surface. A wire contributes conduction current where it pierces; the plate's flux of $\mathbf D$, growing at $dQ/dt = I$, contributes displacement current wherever it crosses.`);
    },
    // which current dominates
    () => {
      let m, fq, r;
      do { m = pick(MATS); fq = pick(FREQS); r = m[1] / (2 * Math.PI * fq * m[2] * EPS0); } while (r > 0.02 && r < 50);
      const cond = r >= 50;
      return MC('Which current dominates?', md`${m[0][0].toUpperCase() + m[0].slice(1)} ($\sigma = ${p(m[1])}$ S/m, $\epsilon_r = ${m[2]}$) at ${fHz(fq)}: which current dominates?`, cond ? 'conduction' : 'displacement',
        [[cond ? 'displacement' : 'conduction', `$\\sigma/\\omega\\epsilon = ${f(r)}$, ${cond ? 'far above' : 'far below'} 1.`], ['they are equal', `Only near $f_c = \\sigma/2\\pi\\epsilon$; here $\\sigma/\\omega\\epsilon = ${f(r)}$.`], ['neither: both vanish', 'A field in any medium with $\\sigma$ or $\\epsilon$ drives current.']],
        md`$\sigma/\omega\epsilon = \dfrac{${p(m[1])}}{2\pi(${p(fq)})(${m[2]})(8.854\times10^{-12})} = ${f(r)}$: ${cond ? 'a good conductor, keep $\\sigma\\mathbf E$' : 'a good dielectric, keep $\\epsilon\\,\\partial\\mathbf E/\\partial t$'}.`);
    },
    // which Maxwell equation says it
    () => {
      const [stmt, key] = pick([
        ['electric field lines begin and end on charge', 'gauss'],
        ['the flux of $\\mathbf B$ out of any closed surface is zero', 'mono'],
        ['there are no isolated magnetic poles', 'mono'],
        ['a loop whose flux changes gets an emf', 'far'],
        ['a changing $\\mathbf B$ makes a circulating $\\mathbf E$', 'far'],
        ['a changing $\\mathbf E$ makes a circulating $\\mathbf H$, even in vacuum', 'amp'],
        ['a charging capacitor has $\\mathbf H$ between its plates', 'amp'],
        ['the flux of $\\mathbf D$ out of a closed surface equals the charge inside', 'gauss'],
      ]);
      return MC('Which law says it?', md`Which of Maxwell's equations says: *${stmt}*?`, MAXW[key][0],
        Object.keys(MAXW).filter((k) => k !== key).map((k) => [MAXW[k][0], `That one says ${MAXW[k][1]}.`]),
        md`${MAXW[key][0]}: ${MAXW[key][1]}.`);
    },
    // H direction from E (or E from H) for a traveling wave
    () => {
      const ui = ri(0, 2), s = pick([1, -1]), giveE = pick([true, false]);
      const ai = pick([0, 1, 2].filter((i) => i !== ui)), P = [ui, s];
      const other = giveE ? cross(P, [ai, 1]) : cross([ai, 1], P);
      const ph = `\\omega t ${s > 0 ? '-' : '+'} \\beta ${AX[ui]}`;
      const ans = `$${vec(other)}$`;
      return MC(giveE ? 'Which way is H?' : 'Which way is E?', md`${giveE ? `$\\mathbf E = E_0\\cos(${ph})\\,\\hat ${AX[ai]}$` : `$\\mathbf H = H_0\\cos(${ph})\\,\\hat ${AX[ai]}$`} with ${giveE ? '$E_0' : '$H_0'} > 0$, in a lossless medium. The ${giveE ? '$\\mathbf H$' : '$\\mathbf E$'} that goes with it is ${giveE ? '$H_0' : '$E_0'}\cos(${ph})$, with ${giveE ? '$H_0 = E_0/\\eta$' : '$E_0 = \\eta H_0$'}, times…`, ans,
        [[`$${vec([other[0], -other[1]])}$`, `Then $\\mathbf E\\times\\mathbf H$ would point along $${vec([ui, -s])}$, against the travel of $${ph}$.`],
          [`$+\\hat ${AX[ui]}$`, 'The fields of a plane wave are transverse: neither has a component along the travel.'],
          [`$+\\hat ${AX[ai]}$`, '$\\mathbf E$ and $\\mathbf H$ of a plane wave are perpendicular.']],
        md`$${ph}$ travels toward $${vec(P)}$. ${giveE ? `$\\hat ${AX[ai]}\\times(${vec(other)}) = ${vec(P)}$` : `$(${vec(other)})\\times\\hat ${AX[ai]} = ${vec(P)}$`} ✓. (The curl equations give the same: $\nabla\times(F\hat a) = \partial_uF\,(\hat u\times\hat a)$.)`);
    },
  ]);

  GENS.rf_t12_num = () => one([
    // peak displacement current density of a sinusoid
    () => {
      const E = pick([10, 100, 1000]), w = pick([1e6, 1e8, 1e9, 1e10]), er = pick([1, 1, 4]);
      const J = er * EPS0 * w * E;
      const o = (x) => `$${f(x)}$ A/m²`;
      return MC('Peak displacement current', md`$\mathbf E = ${E}\cos(\omega t)\,\hat x$ V/m with $\omega = ${p(w)}$ rad/s in a medium with $\epsilon = ${er === 1 ? '\\epsilon_0' : `${er}\\epsilon_0`}$. The peak of $|\mathbf J_d|$ is…`, o(J),
        [[o(J / w), 'That is $\\epsilon E_0$, a flux density in C/m²: the time derivative brings a factor $\\omega$.'], [o(J * 2 * Math.PI), '$\\omega$ is already in rad/s: no extra $2\\pi$.'], [o(er === 1 ? J * 10 : J / er), er === 1 ? 'Off by ten: recheck the powers of ten.' : 'The relative permittivity was left out.'], [o(J / 2), 'The derivative of $\\cos\\omega t$ peaks at $\\omega$, not $\\omega/2$.']],
        md`$|\mathbf J_d|_{\max} = \omega\epsilon E_0 = (${p(w)})(${er}\times8.854\times10^{-12})(${E}) = ${f(J)}$ A/m².`);
    },
    // ratio sigma / omega epsilon with epsilon given as a number
    () => {
      const sg_ = pick([1e-4, 1e-2, 1, 10]), ep = pick([1e-11, 1e-10, 5e-11]), w = pick([1e3, 1e6, 1e9]);
      const r = sg_ / (w * ep);
      const o = (x) => `$${f(x)}$`;
      return MC('Conduction over displacement', md`$\sigma = ${p(sg_)}$ S/m, $\epsilon = ${p(ep)}$ F/m, $\omega = ${p(w)}$ rad/s. $\sigma/\omega\epsilon = $`, o(r),
        [[o(1 / r), 'That is $\\omega\\epsilon/\\sigma$, upside down.'], [o(r / (2 * Math.PI)), '$\\omega$ is given; no extra $2\\pi$.'], [o(r * 10), 'Off by ten: recheck the powers of ten.'], [o(r / 10), 'Off by ten: recheck the powers of ten.']],
        md`$\omega\epsilon = ${p(w * ep)}$ S/m, so $\sigma/\omega\epsilon = ${f(r)}$: ${r > 10 ? 'conduction dominates' : r < 0.1 ? 'displacement dominates' : 'both matter'}.`);
    },
    // fraction of the displacement current caught by a smaller disk
    () => {
      const I = pick([1, 2, 4, 8, 10]), [fr, ft] = pick([[0.5, '\\tfrac12'], [0.25, '\\tfrac14'], [0.75, '\\tfrac34'], [0.1, '0.1']]);
      const o = (x) => `${+x.toPrecision(3)} A`;
      return MC('Part of the gap', md`A capacitor with circular plates of radius $a$ is charged by ${I} A (no fringing). The displacement current through a disk of radius $${ft}a$ centered between the plates is…`, o(I * fr * fr),
        [[o(I * fr), 'Flux scales with area, so with $r^2$, not $r$.'], [o(I), 'That is the whole gap; the disk catches only part of the uniform $\\mathbf D$.'], ['0 A', 'No charge crosses, but $\\mathbf D$ through the disk is changing.']],
        md`Uniform $\mathbf D$: $I_d = I\,(r/a)^2 = ${I}\times(${ft})^2 = ${+(I * fr * fr).toPrecision(3)}$ A.`);
    },
    // I_d = C dV/dt
    () => {
      const Cp = pick([1, 5, 10, 50, 100]), rate = pick([1, 10, 100]);   // pF, V/μs
      const I = Cp * 1e-12 * rate * 1e6;
      const o = (x) => `$${f(x)}$ A`;
      return MC('Displacement current of a capacitor', md`A ${Cp} pF capacitor's voltage rises at ${rate} V/μs. The displacement current between its plates is…`, o(I),
        [[o(I * 1e6), 'pF is $10^{-12}$ F, not $10^{-6}$ F.'], [o(I / 1e6), 'μs is $10^{-6}$ s: V/μs means $\\times10^6$ V/s.'], [o(I * 10), 'Off by ten: recheck the powers of ten.'], ['$0$ A', 'Nothing crosses the gap but $\\mathbf D$ changes there: $I_d = C\\,dV/dt$.']],
        md`$I_d = dQ/dt = C\,dV/dt = (${Cp}\times10^{-12}\,\text{F})(${rate}\times10^6\,\text{V/s}) = ${f(I)}$ A, the same as the lead current.`);
    },
    // Lecture 16: leaking point charge
    () => {
      const I = pick([2, 4, 6, 10, 0.5]);
      const o = (x) => `${+x.toPrecision(3)} A`;
      return MC('Leaking point charge', md`A point charge at the origin leaks along a wire on the $+z$-axis carrying ${I} A to infinity. $\oint\mathbf H\cdot d\mathbf l$ counterclockwise (from $+z$) around a circle in the $xy$-plane centered on the origin is…`, o(I / 2),
        [[o(I), 'The upper hemisphere sees the wire, but also the shrinking outward flux $Q/2$: $I - I/2$.'], ['0 A', 'The lower hemisphere has no wire, but its flux $-Q/2$ grows at $+I/2$.'], [o(1.5 * I), 'That adds the displacement current. The outward flux $Q/2$ through the upper hemisphere is shrinking: $I_d = -I/2$.']],
        md`Upper hemisphere: $I + \frac{d}{dt}\frac Q2 = I - \frac I2 = ${+(I / 2).toPrecision(3)}$ A. (Lecture 16.)`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  GENS.t12_cap = () => {
    const a = pick([5, 8, 10, 15, 20]), d = pick([0.5, 1, 2]), er = pick([1, 1, 2, 4]);
    const rate = pick([1e6, 1e7, 1e8, 1e9]) * pick([1, -1]);
    const r1 = pick([0.25, 0.5, 0.6, 0.8]) * a, r2 = pick([1.5, 2, 2.5, 3]) * a;
    const eps = er * EPS0;
    const Jd = eps * rate / (d * 1e-3);                     // signed, along +z
    const Id = Jd * Math.PI * (a / 100) ** 2;
    const H1 = Jd * (r1 / 100) / 2, H2 = Id / (2 * Math.PI * (r2 / 100));
    const up = Jd > 0;
    const fill = er === 1 ? 'air' : `a dielectric with $\\epsilon = ${er}\\epsilon_0$`;
    return {
      title: 'Displacement current in a capacitor gap',
      q: md`A parallel-plate capacitor has circular plates of radius $${a}$ cm on the $z$-axis, a gap of $${d}$ mm filled with ${fill}. Between the plates $\mathbf E = (V/d)\,\hat z$ (uniform, no fringing), where $V$ is the bottom plate's voltage relative to the top plate, and $dV/dt = ${p(rate)}$ V/s. Find $|\mathbf J_d|$ between the plates, the total displacement current, $|\mathbf H|$ in the midplane at $r_1 = ${+r1.toPrecision(3)}$ cm and at $r_2 = ${+r2.toPrecision(3)}$ cm from the axis, and the direction of $\mathbf H$.`,
      parts: [
        N('|\\mathbf J_d|', Math.abs(Jd), 'A/m^2'),
        N('|I_d|', Math.abs(Id), 'A'),
        N('|\\mathbf H(r_1)|', Math.abs(H1), 'A/m'),
        N('|\\mathbf H(r_2)|', Math.abs(H2), 'A/m'),
        { lbl: 'Seen from $+z$, $\\mathbf H$ circulates', mc: ['counterclockwise', 'clockwise'], a: up ? 0 : 1, fixed: true, why: up ? [null, 'The displacement current points along $+\\hat z$; the RHR with the thumb up curls counterclockwise.'] : ['The voltage is falling, so $\\mathbf J_d$ points along $-\\hat z$; the RHR with the thumb down curls clockwise.', null] },
      ],
      hints: ['$\\mathbf J_d = \\epsilon\\,\\partial\\mathbf E/\\partial t = (\\epsilon/d)(dV/dt)\\,\\hat z$, uniform between the plates; $I_d = J_d\\pi a^2$.', 'Ampère–Maxwell on a midplane circle: $H_\\phi\\,2\\pi r = J_d\\pi r^2$ inside ($r < a$), $J_d\\pi a^2$ outside.'],
      sol: sol({
        eq: md`$\oint_C\mathbf H\cdot d\mathbf l = \dfrac{d}{dt}\int_S\mathbf D\cdot d\mathbf S$ on a midplane circle (counterclockwise from $+z$, $d\mathbf S = +\hat z$); no wire pierces the flat disk.`,
        sym: md`$J_d = \dfrac{\epsilon}{d}\dfrac{dV}{dt}$, $\;I_d = J_d\pi a^2$, $\;H_\phi(r_1) = \dfrac{J_dr_1}{2}$ $(r_1 < a)$, $\;H_\phi(r_2) = \dfrac{I_d}{2\pi r_2}$ $(r_2 > a)$.`,
        sub: md`$$J_d = \frac{(${er}\times8.854\times10^{-12}\,\text{F/m})(${p(rate)}\,\text{V/s})}{${d / 1000}\,\text{m}} = ${f(Jd)}\ \text{A/m}^2, \qquad I_d = (${f(Jd)})\,\pi\,(${a / 100}\,\text{m})^2 = ${f(Id)}\ \text{A}$$
$$H_\phi(r_1) = \frac{(${f(Jd)})(${+(r1 / 100).toPrecision(3)})}{2} = ${f(H1)}\ \text{A/m}, \qquad H_\phi(r_2) = \frac{${f(Id)}}{2\pi(${+(r2 / 100).toPrecision(3)})} = ${f(H2)}\ \text{A/m}$$`,
        ans: md`$|\mathbf J_d| = ${f(Math.abs(Jd))}$ A/m², $|I_d| = ${f(Math.abs(Id))}$ A, $|\mathbf H(r_1)| = ${f(Math.abs(H1))}$ A/m, $|\mathbf H(r_2)| = ${f(Math.abs(H2))}$ A/m, ${up ? 'counterclockwise' : 'clockwise'} seen from $+z$.`,
        check: md`$I_d = C\,dV/dt$ with $C = \epsilon\pi a^2/d$: the lead current, so the current is continuous through the gap. Outside the plates $\mathbf H$ equals that of the lead wire at the same $r$. Direction: $\mathbf J_d$ along ${up ? '$+\\hat z$' : '$-\\hat z$'}, RHR. ✓`,
      }),
    };
  };

  GENS.t12_ratio = () => {
    let m, fq, r;
    do { m = pick(MATS.filter((x) => x[0] !== 'glass')); fq = pick(FREQS); r = m[1] / (2 * Math.PI * fq * m[2] * EPS0); } while (!(r >= 20 || r <= 0.05 || (r >= 0.5 && r <= 2)));
    const fc = m[1] / (2 * Math.PI * m[2] * EPS0);
    const cls = r >= 20 ? 0 : r <= 0.05 ? 1 : 2;
    const C3 = ['a good conductor: drop the displacement current', 'a good dielectric: drop the conduction current', 'neither: keep both currents'];
    return {
      title: 'Conduction or displacement?',
      q: md`A field $\mathbf E = E_0\cos(2\pi ft)\,\hat x$ at $f =$ ${fHz(fq)} exists in ${m[0]} ($\sigma = ${p(m[1])}$ S/m, $\epsilon = ${m[2] === 1 ? '' : m[2]}\epsilon_0$, $\mu = \mu_0$). Find the ratio of the conduction-current amplitude to the displacement-current amplitude, the crossover frequency $f_c$ where they are equal, and how the material behaves at $f$.`,
      parts: [
        N('\\sigma/\\omega\\epsilon', r, ''),
        N('f_c', fc, 'Hz'),
        { lbl: 'At this frequency the material is', mc: C3, a: cls, fixed: true, why: C3.map((_, i) => (i === cls ? null : `The ratio is $${f(r)}$: ${cls === 0 ? 'far above 1' : cls === 1 ? 'far below 1' : 'close to 1'}.`)) },
      ],
      hints: ['$|\\sigma\\mathbf E|$ and $|\\epsilon\\,\\partial\\mathbf E/\\partial t|$ have amplitudes $\\sigma E_0$ and $\\omega\\epsilon E_0$, with $\\omega = 2\\pi f$.', 'They are equal when $\\omega\\epsilon = \\sigma$: $f_c = \\sigma/2\\pi\\epsilon$.'],
      sol: sol({
        eq: md`$\nabla\times\mathbf H = \sigma\mathbf E + \epsilon\,\partial\mathbf E/\partial t$; for $E_0\cos\omega t$ the amplitudes are $\sigma E_0$ and $\omega\epsilon E_0$.`,
        sym: md`$\dfrac{\sigma}{\omega\epsilon} = \dfrac{\sigma}{2\pi f\epsilon_r\epsilon_0}$, $\;f_c = \dfrac{\sigma}{2\pi\epsilon_r\epsilon_0}$.`,
        sub: md`$$\frac{\sigma}{\omega\epsilon} = \frac{${p(m[1])}\,\text{S/m}}{2\pi(${p(fq)}\,\text{Hz})(${m[2]})(8.854\times10^{-12}\,\text{F/m})} = ${f(r)}, \qquad f_c = \frac{${p(m[1])}}{2\pi(${m[2]})(8.854\times10^{-12})} = ${f(fc)}\ \text{Hz}$$`,
        ans: md`$\sigma/\omega\epsilon = ${f(r)}$, $f_c = ${f(fc)}$ Hz: ${C3[cls]}.`,
        check: md`$f/f_c = ${f(fq / fc)} = (\sigma/\omega\epsilon)^{-1}$. ${cls === 0 ? 'Below the crossover a material conducts.' : cls === 1 ? 'Above the crossover a material acts as a dielectric.' : 'Near the crossover neither term can be dropped.'} ✓`,
      }),
    };
  };

  // HW 7 #4 style: one field from the other with the curl equations
  GENS.t12_curl = () => {
    const er = pick([1, 2.25, 4, 9]), mr = pick([1, 1, 1, 4]);
    const v = CL / Math.sqrt(er * mr), eta = ETA0 * Math.sqrt(mr / er);
    const ui = ri(0, 2), ai = pick([0, 1, 2].filter((i) => i !== ui)), s = pick([1, -1]);
    const giveE = pick([true, false]);
    const A0 = giveE ? pick([1, 2, 5, 10, 60]) : pick([0.1, 0.2, 0.5, 1, 2]);
    const w = pick([1, 2, 3, 6]) * 1e8, beta = w / v;
    const P = [ui, s], fld = [ai, 1];
    const other = giveE ? cross(P, fld) : cross(fld, P);
    const amp = giveE ? A0 / eta : A0 * eta;
    const u = AX[ui], a = AX[ai], k = AX[other[0]];
    const ph = `\\omega t ${s > 0 ? '-' : '+'} \\beta ${u}`;
    const uxa = cross([ui, 1], [ai, 1]);                  // û × â
    const sc = s * uxa[1];                                // sign of the curl along k
    const med = `$\\epsilon = ${er === 1 ? '' : er}\\epsilon_0$, $\\mu = ${mr === 1 ? '' : mr}\\mu_0$`;
    const given = giveE ? md`$\mathbf E = ${A0}\cos(${ph})\,\hat ${a}$ V/m` : md`$\mathbf H = ${A0}\cos(${ph})\,\hat ${a}$ A/m`;
    const findT = giveE ? '\\mathbf H' : '\\mathbf E', findW = `$${findT}$`;
    const DIRS = [vec(other), vec([other[0], -other[1]]), `+\\hat ${u}`, `+\\hat ${a}`];
    return {
      title: giveE ? 'H from E with Faraday\'s law' : 'E from H with Ampère–Maxwell',
      q: md`In a source-free, lossless medium with ${med} ($\sigma = 0$), ${given}, with $\omega = ${p(w)}$ rad/s. Find the $\beta$ that both curl equations require, then the ${findW} that goes with this field: $${findT} = X_0\cos(${ph})\,\hat d$ with $X_0 > 0$. Give $X_0$ and $\hat d$.`,
      parts: [
        N('\\beta', beta, 'rad/m'),
        N('X_0', amp, giveE ? 'A/m' : 'V/m'),
        { lbl: '$\\hat d = $', mc: DIRS.map((d) => `$${d}$`), a: 0, why: [null, `Then $\\mathbf E\\times\\mathbf H$ would point along $${vec([ui, -s])}$, against the travel of $${ph}$.`, 'Plane-wave fields are transverse: no component along the travel.', '$\\mathbf E$ and $\\mathbf H$ of a plane wave are perpendicular.'] },
      ],
      hints: [`$\\nabla\\times(F(${u},t)\\,\\hat ${a}) = \\dfrac{\\partial F}{\\partial ${u}}(\\hat ${u}\\times\\hat ${a})$, and $\\hat ${u}\\times\\hat ${a} = ${vec(uxa)}$.`, giveE ? '$\\partial\\mathbf H/\\partial t = -\\frac1\\mu\\nabla\\times\\mathbf E$; integrate in $t$ and drop the constant. $\\beta = \\omega\\sqrt{\\mu\\epsilon}$, $\\eta = \\sqrt{\\mu/\\epsilon}$.' : '$\\partial\\mathbf E/\\partial t = \\frac1\\epsilon\\nabla\\times\\mathbf H$; integrate in $t$ and drop the constant. $\\beta = \\omega\\sqrt{\\mu\\epsilon}$, $\\eta = \\sqrt{\\mu/\\epsilon}$.'],
      sol: sol({
        eq: giveE ? md`Faraday: $\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$, with $\nabla\times(F\hat ${a}) = \partial_${u}F\,(\hat ${u}\times\hat ${a})$.` : md`Ampère–Maxwell with $\sigma = 0$: $\nabla\times\mathbf H = \epsilon\,\partial\mathbf E/\partial t$, with $\nabla\times(F\hat ${a}) = \partial_${u}F\,(\hat ${u}\times\hat ${a})$.`,
        sym: giveE
          ? md`With $E_0 = ${A0}$ V/m: $\nabla\times\mathbf E = \dfrac{\partial E_${a}}{\partial ${u}}(${vec(uxa)}) = ${sg(sc)}\beta E_0\sin(${ph})\,\hat ${k}$, so $\mathbf H = ${sg(sc)}\dfrac{\beta E_0}{\mu\omega}\cos(${ph})\,\hat ${k} = ${sg(sc)}\dfrac{E_0}{\eta}\cos(${ph})\,\hat ${k}$, using $\beta = \omega\sqrt{\mu\epsilon}$ (the value Ampère–Maxwell needs to return the same $\mathbf E$) and $\mu\omega/\beta = \eta$.`
          : md`With $H_0 = ${A0}$ A/m: $\nabla\times\mathbf H = \dfrac{\partial H_${a}}{\partial ${u}}(${vec(uxa)}) = ${sg(sc)}\beta H_0\sin(${ph})\,\hat ${k}$, so $\mathbf E = ${sg(-sc)}\dfrac{\beta H_0}{\epsilon\omega}\cos(${ph})\,\hat ${k} = ${sg(-sc)}\eta H_0\cos(${ph})\,\hat ${k}$, using $\beta = \omega\sqrt{\mu\epsilon}$ (the value Faraday needs to return the same $\mathbf H$) and $\beta/\epsilon\omega = \eta$.`,
        sub: md`$$\beta = \frac{\omega\sqrt{\mu_r\epsilon_r}}{c} = \frac{(${p(w)})\sqrt{${mr * er}}}{3\times10^8} = ${f(beta)}\ \text{rad/m}, \qquad \eta = 120\pi\sqrt{\frac{${mr}}{${er}}} = ${f(eta)}\ \Omega$$
$$X_0 = ${giveE ? `\\frac{${A0}}{${f(eta)}} = ${f(amp)}\\ \\text{A/m}` : `(${f(eta)})(${A0}) = ${f(amp)}\\ \\text{V/m}`}$$`,
        ans: md`$\beta = ${f(beta)}$ rad/m; $${findT} = ${f(amp)}\cos(${ph})\,(${vec(other)})$ ${giveE ? 'A/m' : 'V/m'}.`,
        check: md`$\mathbf E\times\mathbf H$ points along ${giveE ? `$\\hat ${a}\\times(${vec(other)})$` : `$(${vec(other)})\\times\\hat ${a}$`} $= ${vec(P)}$, the way $${ph}$ travels, and $|\mathbf E|/|\mathbf H| = \eta$. ✓`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t12-displacement'] = [
    Q(md`A capacitor holds a large, constant charge (no current in the leads). Between its plates the magnetic field is…`,
      ['zero', 'large, since $\\mathbf D$ is large', 'the same as during charging', 'along $\\mathbf E$'], 0,
      [null, 'Only a changing $\\mathbf D$ is a displacement current; a constant one makes no $\\mathbf H$.', 'During charging $\\mathbf D$ changes; now it does not.', '$\\mathbf H$ from a displacement current circles it, it never points along it.'],
      md`$\partial\mathbf D/\partial t = 0$ and $\mathbf J = 0$: $\nabla\times\mathbf H = 0$ and, with no other sources, $\mathbf H = 0$.`),
    Q(md`Displacement current density is defined as…`,
      ['$\\partial\\mathbf D/\\partial t$', '$\\mathbf D$', '$\\sigma\\mathbf E$', '$\\rho\\mathbf v$'], 0,
      [null, '$\\mathbf D$ is a flux density in C/m², not a current.', 'That is conduction current density.', 'That is the current of moving charge, the conduction (convection) current.'],
      md`$\mathbf J_d = \partial\mathbf D/\partial t$, in A/m².`),
    Q(md`Without the displacement current term, which could not exist?`,
      ['electromagnetic waves in vacuum', 'the magnetic field of a steady current', 'Faraday induction', 'static charge distributions'], 0,
      [null, 'Steady currents are fully described by static Ampère.', 'Faraday\'s law is a separate equation; it does not need $\\partial\\mathbf D/\\partial t$.', 'Electrostatics needs only Gauss and $\\nabla\\times\\mathbf E = 0$.'],
      md`In vacuum there is no $\mathbf J$; only $\partial\mathbf D/\partial t$ lets a changing $\mathbf E$ regenerate $\mathbf H$, which regenerates $\mathbf E$ through Faraday.`),
    Q(md`The divergence of the total current density, $\nabla\cdot(\mathbf J + \partial\mathbf D/\partial t)$, is…`,
      ['zero everywhere', '$\\rho$', '$-\\partial\\rho/\\partial t$', 'zero only where $\\rho = 0$'], 0,
      [null, 'That is $\\nabla\\cdot\\mathbf D$.', 'That is $\\nabla\\cdot\\mathbf J$ alone; the displacement part adds $+\\partial\\rho/\\partial t$.', 'It is the divergence of a curl, $\\nabla\\times\\mathbf H$: always zero.'],
      md`$\mathbf J + \partial\mathbf D/\partial t = \nabla\times\mathbf H$, and $\nabla\cdot(\nabla\times\mathbf H) = 0$.`),
    Q(md`In a dielectric, $\mathbf D = \epsilon_0\mathbf E + \mathbf P$ with $\mathbf P$ the polarization. The part $\partial\mathbf P/\partial t$ of the displacement current is…`,
      ['bound charge actually moving (polarization current)', 'zero, since bound charges cannot move', 'the conduction current', 'present in vacuum too'], 0,
      [null, 'Bound charges shift a little within their atoms; a changing $\\mathbf P$ is that shift in motion.', 'Conduction is free charge; $\\mathbf P$ involves bound charge.', 'In vacuum $\\mathbf P = 0$; only $\\epsilon_0\\,\\partial\\mathbf E/\\partial t$ remains.'],
      md`$\partial\mathbf D/\partial t = \epsilon_0\,\partial\mathbf E/\partial t + \partial\mathbf P/\partial t$: a vacuum part with no moving charge, plus the real motion of bound charge.`),
    Q(md`For $\mathbf E = E_0\cos\omega t$ in a lossy material, the displacement current density…`,
      ['leads the conduction current by $90°$', 'is in phase with the conduction current', 'lags the conduction current by $90°$', 'is $180°$ out of phase'], 0,
      [null, 'One is $\\propto\\cos\\omega t$, the other $\\propto\\frac{d}{dt}\\cos\\omega t = -\\omega\\sin\\omega t$.', '$-\\sin\\omega t = \\cos(\\omega t + 90°)$: a lead, not a lag.', 'The derivative shifts the phase by $90°$, not $180°$.'],
      md`$\sigma E_0\cos\omega t$ versus $-\omega\epsilon E_0\sin\omega t = \omega\epsilon E_0\cos(\omega t + 90°)$.`),
    Q(md`A material has relaxation time $\tau = \epsilon/\sigma$. It behaves as a good conductor at frequencies where…`,
      ['$\\omega\\tau \\ll 1$', '$\\omega\\tau \\gg 1$', '$\\omega\\tau = 1$', 'never: that depends only on $\\sigma$'], 0,
      [null, 'That is the dielectric limit: the field reverses before charge can relax.', 'That is the crossover, where neither current can be dropped.', '$\\sigma/\\omega\\epsilon = 1/\\omega\\tau$ involves both $\\sigma$ and $\\epsilon$, and the frequency.'],
      md`$\sigma/\omega\epsilon = 1/(\omega\tau)$. Conduction wins when the period is long compared with the time free charge needs to relax.`),
    Q(md`Which two of Maxwell's equations contain sources ($\rho$ or $\mathbf J$)?`,
      ['Gauss for $\\mathbf D$ and Ampère–Maxwell', 'Faraday and Ampère–Maxwell', 'Gauss for $\\mathbf D$ and Gauss for $\\mathbf B$', 'Faraday and Gauss for $\\mathbf B$'], 0,
      [null, 'Faraday has no source term: $\\nabla\\times\\mathbf E = -\\partial\\mathbf B/\\partial t$.', '$\\nabla\\cdot\\mathbf B = 0$ has no source: there are no magnetic charges.', 'Neither has a source term.'],
      md`$\nabla\cdot\mathbf D = \rho$ and $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$. The other two are source-free.`),
    Q(md`In a region with $\rho = 0$ and $\mathbf J = 0$, $\mathbf E$ and $\mathbf H$…`,
      ['can be nonzero and change in time: a wave', 'must both be zero', 'must both be static', 'must have $\\mathbf E = 0$ but may have $\\mathbf H \\ne 0$'], 0,
      [null, 'Source-free regions carry waves: the curl equations sustain each other.', 'Time-varying fields are allowed; they are waves.', 'Neither field is singled out; they generate each other.'],
      md`$\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$ and $\nabla\times\mathbf H = \epsilon\,\partial\mathbf E/\partial t$ have nonzero solutions: plane waves (Topic 14).`),
    Q(md`$\mathbf E = E_0\cos(\omega t - \beta z)\,\hat x$ in free space. For the $\mathbf H$ from Faraday's law to also satisfy Ampère–Maxwell, $\beta$ must be…`,
      ['$\\omega/c$', '$\\omega c$', 'any value', '$c/\\omega$'], 0,
      [null, 'Units: $\\beta$ is in rad/m, $\\omega c$ in rad·m/s².', 'Faraday gives an $\\mathbf H$ for any $\\beta$, but Ampère–Maxwell returns the same $\\mathbf E$ only for $\\beta^2 = \\omega^2\\mu_0\\epsilon_0$.', 'Units: $c/\\omega$ is in meters, not rad/m.'],
      md`Faraday then Ampère–Maxwell returns $\mathbf E$ multiplied by $\beta^2/(\omega^2\mu_0\epsilon_0)$, which must be 1: $\beta = \omega\sqrt{\mu_0\epsilon_0} = \omega/c$.`),
    Q(md`Static Ampère's law gives different answers for two surfaces with the same rim when…`,
      ['charge is piling up somewhere between them', 'the rim is not a circle', 'the current is large', 'the surfaces are curved'], 0,
      [null, 'The shape of the rim does not matter; only what crosses the surfaces.', 'Size never causes a contradiction.', 'Curved surfaces are fine for steady currents.'],
      md`The two surfaces form a closed surface. Steady currents enter and leave it equally; if charge accumulates inside, they do not, and only the $\partial\mathbf D/\partial t$ term restores agreement.`),
    Q(md`A capacitor is filled with a dielectric of $\epsilon_r = 4$ instead of air and charged by the same lead current $I$. The displacement current between its plates is…`,
      ['$I$', '$4I$', '$I/4$', '$I/\\epsilon_0$'], 0,
      [null, 'The dielectric raises $C$ but the charge still arrives at the rate $I$; $\\Psi_E = Q$.', 'Gauss: the flux of $\\mathbf D$ is $Q$ in any filling.', 'Units: $I_d$ is in amperes, and $\\Psi_E$ already includes $\\epsilon$.'],
      md`$\Psi_E = \oint\mathbf D\cdot d\mathbf S = Q$ regardless of the filling, so $I_d = dQ/dt = I$.`),
    Q(md`At what frequency are conduction and displacement current equal in a material with $\sigma = 10^{-3}$ S/m and $\epsilon = 4\epsilon_0$?`,
      ['about 4.5 MHz', 'about 28 MHz', 'about 4.5 kHz', 'about 0.7 MHz'], 0,
      [null, 'That is $\\omega$, in rad/s; divide by $2\\pi$.', 'Off by $10^3$: $\\sigma/2\\pi\\epsilon = 10^{-3}/(2\\pi\\cdot3.54\\times10^{-11})$.', 'That divides by $2\\pi$ twice.'],
      md`$f_c = \sigma/2\pi\epsilon = 10^{-3}/(2\pi\times4\times8.854\times10^{-12}) = 4.5\times10^6$ Hz.`),
    Q(md`Faraday's law has a minus sign, $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$; Ampère–Maxwell has a plus, $\nabla\times\mathbf H = +\partial\mathbf D/\partial t$ (no $\mathbf J$). Physically…`,
      ['$\\mathbf H$ circles $\\partial\\mathbf D/\\partial t$ by the right-hand rule; $\\mathbf E$ circles $\\partial\\mathbf B/\\partial t$ the opposite way (Lenz)', 'both circle their sources the same way', 'the signs are conventions with no physical meaning', 'the minus sign means $\\mathbf E$ is always opposite to $\\mathbf B$'], 0,
      [null, 'The signs differ: the circulation senses are opposite.', 'The relative sign is physics: with the same sign there would be no waves, only growth or decay.', 'The sign relates the curl of $\\mathbf E$ to the change of $\\mathbf B$, not $\\mathbf E$ to $\\mathbf B$.'],
      md`The opposite signs are what make the pair oscillate: each field's change regenerates the other with the sign that sustains a traveling wave.`),
    Q(md`A wire carrying current $I$ ends at a sphere that collects the charge (the sphere's charge grows at $dQ/dt = I$). A loop around the wire, far from the sphere, has $\oint\mathbf H\cdot d\mathbf l = I$. For a surface on that loop that balloons around the sphere instead…`,
      ['the displacement current through it is $I$, and the total is still $I$', 'the total is 0: no wire crosses it', 'the total is $2I$', 'the total depends on the sphere\'s radius'], 0,
      [null, 'The sphere\'s flux of $\\mathbf D$ crosses the balloon and grows at $I$.', 'Conduction and displacement do not both cross this surface: only the displacement does.', 'Gauss fixes the flux at $Q$, independent of size.'],
      md`The balloon encloses the sphere, so $\Psi_E = Q$ through it and $I_d = dQ/dt = I$. Every surface on the same rim gives $I$.`),
    Q(md`Units check: $\dfrac{d}{dt}\int_S\mathbf D\cdot d\mathbf S$ is measured in…`,
      ['amperes', 'coulombs', 'A/m', 'volts'], 0,
      [null, 'The integral alone is in coulombs; $d/dt$ makes it C/s.', 'A/m is $\\mathbf H$; the circulation $\\oint\\mathbf H\\cdot d\\mathbf l$ is in amperes.', 'Volts belong to $\\oint\\mathbf E\\cdot d\\mathbf l$.'],
      md`(C/m²)(m²)/s = C/s = A, matching $\oint\mathbf H\cdot d\mathbf l$ (A/m × m).`),
    Q(md`Inside an ideal conductor in steady state ($\mathbf E = 0$), the displacement current is…`,
      ['zero', 'equal to the conduction current', 'infinite', 'equal to $\\sigma\\mathbf E$'], 0,
      [null, 'With $\\mathbf E = 0$ both terms vanish.', 'Nothing diverges; $\\mathbf D = \\epsilon\\mathbf E = 0$ is constant.', '$\\sigma\\mathbf E$ is conduction current, and it is also zero here.'],
      md`$\mathbf D = \epsilon\mathbf E = 0$ at all times, so $\partial\mathbf D/\partial t = 0$.`),
    Q(md`$\mathbf H = H_0\cos(\omega t - \beta z)\,\hat y$ in free space. Ampère–Maxwell ($\sigma = 0$) gives $\mathbf E$ along…`,
      ['$+\\hat x$', '$-\\hat x$', '$+\\hat z$', '$+\\hat y$'], 0,
      [null, 'Then $\\mathbf E\\times\\mathbf H$ would point along $-\\hat z$, against the travel of $\\omega t - \\beta z$.', 'Plane-wave fields are transverse: no component along $\\hat z$, the travel direction.', '$\\mathbf E\\perp\\mathbf H$.'],
      md`$\nabla\times\mathbf H = \partial_zH_y(\hat z\times\hat y) = \beta H_0\sin(\omega t - \beta z)(-\hat x)$, so $\mathbf E = \frac{\beta H_0}{\epsilon_0\omega}\cos(\omega t - \beta z)\,\hat x = \eta_0H_0\cos(\cdot)\,\hat x$. Check: $\hat x\times\hat y = \hat z$. ✓`),
  ];
})();

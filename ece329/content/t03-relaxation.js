/* Topic 3 — Charge conservation and relaxation (Lecture 16a). The continuity equation in integral and differential
   form, KCL as its static limit, ∂ρ/∂t from a given J, charge relaxation in a homogeneous conductor (τ = ε/σ),
   E from ρ(z, t) by Gauss's law, and where the charge and its field energy go. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;
  const e0 = EM.eps0;
  const q3 = (x) => +x.toPrecision(3);

  // ---------------------------------------------------------------- figures
  // a closed surface with charge inside and current crossing it outward
  function boxFig() {
    const g = PF.fig({ alt: 'a closed surface S around a region holding positive charge; the current density J crosses the surface outward, so the enclosed charge decreases' });
    const cx = 130, cy = 95, rx = 78, ry = 52;
    g.ellipse(cx, cy, rx, ry, { cls: 'shade' });
    g.ellipse(cx, cy, rx, ry, { cls: 'dash' });
    for (const [x, y] of [[106, 84], [132, 104], [154, 84], [116, 114], [148, 118]]) g.charge(x, y, { q: '+', r: 5 });
    for (const deg of [20, 160, 250, 320]) {
      const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
      g.arrow(cx + rx * 0.74 * c, cy - ry * 0.74 * s, cx + rx * 1.36 * c, cy - ry * 1.36 * s, { hs: 7 });
    }
    g.label(cx + rx * 1.36 * Math.cos(20 * Math.PI / 180) + 6, cy - ry * 1.36 * Math.sin(20 * Math.PI / 180), '\\mathbf J', 'l');
    g.label(cx - rx * 0.78, cy - ry * 0.86, 'S', 'br');
    g.label(cx, cy - 32, 'Q_{\\text{enc}}', 'c', 'small');
    return g.svg();
  }

  // ρ ∝ cos kz and the field it makes, E_z ∝ sin kz
  const rhoEPlot = () => PF.plot({
    w: 320, h: 190, x: [0, 2 * Math.PI], y: [-1.25, 1.25], zero: true, xl: 'kz',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi'], [1.5 * Math.PI, '\\tfrac{3\\pi}{2}'], [2 * Math.PI, '2\\pi']],
    curves: [{ f: Math.cos, lab: '\\rho', labAt: 0.25, dy: -12 }, { f: Math.sin, cls: 'dash', lab: 'E_z', labAt: 1.2, dy: -14 }],
  });
  // ρ and E decay with τ; the stored energy with τ/2
  const decayPlot = () => PF.plot({
    w: 300, h: 170, x: [0, 3.2], y: [0, 1.1], xl: 't/\\tau',
    xt: [[1, '1'], [2, '2'], [3, '3']], yt: [[1, '1'], [Math.exp(-1), '1/e']],
    curves: [{ f: (t) => Math.exp(-t), lab: '\\rho,\\ E', labAt: 1.6, dy: -10 }, { f: (t) => Math.exp(-2 * t), cls: 'dash', lab: 'w_e', labAt: 0.55, dy: 4, anchor: 'tl' }],
  });

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u1', {
    id: 't3-relaxation', topic: 3, ref: 'Lecture 16', title: 'Charge conservation and relaxation',
    steps: [
      R(md`
        !!key Why you care
          Charge relaxation is half of a past exam question twice: Summer 2017 #2(a) and Summer 2020 #1(b) (solve $\partial\rho/\partial t + (\sigma/\epsilon_0)\rho = 0$, then find $\mathbf E$ from $\rho$ by Gauss's law, at $t = 0$ and $t \to \infty$). HW 7 #2 and #3 ($\partial\rho/\partial t$ from a given $\mathbf J$, units of its coefficients, the time to decay, where the energy goes), and Spring 2018 1(iv) test the continuity equation itself.

        ### Notation

        - $\rho$: volume charge density, C/m³. $Q_{\text{enc}}$: charge inside a closed surface $S$, C. $V$: the volume $S$ encloses.
        - $\mathbf J$: current density, A/m². $I = \int\mathbf J\cdot d\mathbf S$: current through a surface, A.
        - $\oint_S\mathbf J\cdot d\mathbf S$: net current **out** of the closed surface $S$ ($d\mathbf S$ points outward).
        - $\nabla\cdot\mathbf J$: net outflow of current per unit volume at a point, A/m³.
        - $\sigma$: conductivity, S/m. $\epsilon$: permittivity, F/m. In a conductor, $\mathbf J = \sigma\mathbf E$ (Ohm's law at a point).
        - $\tau = \epsilon/\sigma$: the **relaxation time**, s.
        - $w_e = \tfrac12\epsilon E^2$: electric energy density, J/m³. $p = \mathbf J\cdot\mathbf E = \sigma E^2$: Joule heating, W/m³.

        ### The idea

        Charge moves but is never created or destroyed. Whatever current leaves a closed surface lowers the charge inside:
        $$\oint_S\mathbf J\cdot d\mathbf S = -\frac{dQ_{\text{enc}}}{dt} \qquad\Longleftrightarrow\qquad \nabla\cdot\mathbf J + \frac{\partial\rho}{\partial t} = 0$$
        In a conductor, add Ohm's law and Gauss's law and this becomes a decay law: any charge inside dies away as $e^{-t/\tau}$, with $\tau = \epsilon/\sigma$.
      `),
      RF(md`
        ### Step 1: the integral form

        [[fig:box]]

        Count the charge in a closed region. Current out means charge lost, at exactly that rate. Lecture 16's example: $\mathbf J = x\hat x + y\hat y + z\hat z$ A/m² through the unit cube with corners $(0,0,0)$ and $(1,1,1)$. On the face $x = 1$, $J_x = 1$ over 1 m²: 1 A out; on $x = 0$, $J_x = 0$. The same for $y$ and $z$: 3 A out in total, so the charge inside drops at 3 C/s.
      `, { box: { svg: boxFig(), cap: 'Net current out through S = rate at which the enclosed charge decreases.' } }),
      Q(md`**Predict.** $\mathbf J = 2x\,\hat x$ A/m² (no other components). For the cube with corners $(0,0,0)$ and $(1,1,1)$ m, $dQ_{\text{enc}}/dt = $`,
        ['$-2$ C/s', '$+2$ C/s', '$0$', '$-1$ C/s'], 0,
        [null, 'Current leaves through the face $x = 1$, so the charge inside falls.', 'More current leaves through $x = 1$ ($J_x = 2$) than enters through $x = 0$ ($J_x = 0$).', 'That uses the average $J_x$ over the cube, but only the faces count: 2 A out at $x = 1$.'],
        md`Out through $x = 1$: $(2)(1\ \text{m}^2) = 2$ A; through $x = 0$: nothing. $dQ/dt = -2$ C/s. (Check: $\nabla\cdot\mathbf J = 2$ A/m³ times 1 m³.)`),
      R(md`
        ### Step 2: the differential form, and KCL

        The divergence theorem turns the surface integral into $\int_V\nabla\cdot\mathbf J\,dV$, and $Q_{\text{enc}} = \int_V\rho\,dV$. This holds for every volume, so it holds at every point:
        $$\frac{\partial\rho}{\partial t} = -\nabla\cdot\mathbf J$$
        **KCL is the static limit.** Where nothing piles up ($\partial\rho/\partial t = 0$), $\nabla\cdot\mathbf J = 0$: as much current enters any region as leaves it. Around a circuit node, that is $\sum I_{\text{out}} = 0$.

        **HW 7 #2.** $\mathbf J = 5z^2\hat x + 4x^3y\,\hat y + 3z(y - y_0)^2\hat z$ A/m² (time-independent), $y_0 = 2$ m. Each component is differentiated along its own axis: $\nabla\cdot\mathbf J = 0 + 4x^3 + 3(y - y_0)^2$. At the origin that is $3(0 - 2)^2 = 12$ A/m³, so $\partial\rho/\partial t = -12$ C/(m³·s) and, starting from $\rho = 0$, $\rho(0, t) = -12t$ C/m³. Units: $\mathbf J$ is A/m², so a coefficient multiplying $n$ powers of length carries A/m$^{2+n}$: 5 is A/m⁴, 4 is A/m⁶, 3 is A/m⁵.
      `),
      Q(md`**Predict.** $\mathbf J = 3x^2\hat x - 2y\,\hat y$ A/m², steady in time. At the point $(1, 0, 0)$ m, $\partial\rho/\partial t = $`,
        ['$-4$ C/(m³·s)', '$+4$ C/(m³·s)', '$-8$ C/(m³·s)', '$-1$ C/(m³·s)'], 0,
        [null, 'Sign: $\\partial\\rho/\\partial t = -\\nabla\\cdot\\mathbf J$.', 'That treats $-2y\\,\\hat y$ as $+2y\\,\\hat y$.', 'That differentiates $3x^2$ to $3x$; it is $6x$.'],
        md`$\nabla\cdot\mathbf J = 6x - 2 = 4$ A/m³ at $x = 1$, so $\partial\rho/\partial t = -4$ C/(m³·s): charge drains from that point.`),
      R(md`
        ### Step 3: relaxation inside a conductor

        In a homogeneous conductor, $\mathbf J = \sigma\mathbf E$ and Gauss's law $\nabla\cdot\mathbf E = \rho/\epsilon$ give $\nabla\cdot\mathbf J = \sigma\rho/\epsilon$. Put that into continuity:
        $$\frac{\partial\rho}{\partial t} + \frac{\sigma}{\epsilon}\rho = 0 \quad\Rightarrow\quad \rho(\mathbf r, t) = \rho(\mathbf r, 0)\,e^{-t/\tau}, \qquad \tau = \frac{\epsilon}{\sigma}$$
        The pattern does not move or spread; it fades everywhere at the same rate. For metals the course takes $\epsilon = \epsilon_0$. Units: (F/m)/(S/m) = F·Ω = s ✓. Its inverse, $\sigma/\epsilon$, is a rate in s⁻¹. (The Summer 2017 key writes $\tau = \sigma/\epsilon_0$: upside down. It is $\epsilon_0/\sigma$.)

        | material | $\sigma$ (S/m) | $\epsilon$ | $\tau$ |
        |---|---|---|---|
        | copper | $5.8\times10^7$ | $\epsilon_0$ | $1.5\times10^{-19}$ s |
        | seawater | 4 | $81\epsilon_0$ | $0.18$ ns |
        | lossy filling (Summer 2019) | $10^{-6}$ | $2\epsilon_0$ | $17.7$ µs |
        | good insulator | $\sim10^{-15}$ | $5\epsilon_0$ | hours |

        This is the same $\tau = \epsilon/\sigma$ as the self-discharge of a lossy capacitor ([Topic 2](#/l/t2-capacitance)).
      `),
      Q(md`**Predict.** Charge is placed inside a block of aluminum ($\sigma = 3.5\times10^7$ S/m, $\epsilon = \epsilon_0$). It relaxes with $\tau = $`,
        ['$2.5\\times10^{-19}$ s', '$4.0\\times10^{18}$ s', '$3.1\\times10^{-4}$ s', '$2.5\\times10^{-7}$ s'], 0,
        [null, 'That is $\\sigma/\\epsilon_0$, a rate in s⁻¹, read as a time.', 'That is $\\sigma\\epsilon_0$: units F·S/m², not s.', 'Off by $10^{12}$: $\\epsilon_0$ is $8.85\\times10^{-12}$, not $8.85$.'],
        md`$\tau = \epsilon_0/\sigma = 8.854\times10^{-12}/3.5\times10^7 = 2.5\times10^{-19}$ s. For any practical purpose a metal has no interior charge.`),
      RF(md`
        ### Step 4: E from ρ(z, t)

        When $\rho$ depends only on $z$ and nothing varies in $x$ or $y$, take $\mathbf E = E_z\hat z$. Gauss's law becomes one derivative:
        $$\frac{\partial E_z}{\partial z} = \frac{\rho}{\epsilon} \quad\Rightarrow\quad E_z = \frac1\epsilon\int\rho\,dz$$
        The constant of integration would be a uniform field that nothing in the problem produces; set it to zero. $E_z$ inherits the same $e^{-t/\tau}$.

        [[fig:rhoE]]

        **Summer 2017 #2(a):** $\rho = \cos(3z)e^{-t/\tau}$ C/m³ gives $E_z = \dfrac{\sin(3z)}{3\epsilon_0}e^{-t/\tau}$ V/m. As $t \to \infty$, $\mathbf E \to 0$.

        **Check with continuity:** $J_z = \sigma E_z$, so $-\partial J_z/\partial z = -\sigma\rho/\epsilon = -\rho/\tau = \partial\rho/\partial t$ ✓.
      `, { rhoE: { svg: rhoEPlot(), cap: '$\\rho \\propto \\cos kz$ (solid) and $E_z \\propto \\sin kz$ (dashed). E points from the positive regions to the negative ones; the current σE follows it.' } }),
      Q(md`**Predict.** In a homogeneous conductor $\rho(z, 0) = \sin(4z)$ C/m³. The field at $t = 0$ (only a $z$-component, no uniform part) is $E_z(z, 0) = $`,
        ['$-\\dfrac{\\cos(4z)}{4\\epsilon_0}$ V/m', '$+\\dfrac{\\cos(4z)}{4\\epsilon_0}$ V/m', '$\\dfrac{4\\cos(4z)}{\\epsilon_0}$ V/m', '$\\dfrac{\\sin(4z)}{\\epsilon_0}$ V/m'], 0,
        [null, 'The antiderivative of $\\sin$ is $-\\cos$.', 'That differentiates $\\rho$ instead of integrating it.', '$\\rho$ is the derivative of $\\epsilon_0E_z$, not $\\epsilon_0E_z$ itself.'],
        md`$E_z = \dfrac{1}{\epsilon_0}\displaystyle\int\sin(4z)\,dz = -\dfrac{\cos(4z)}{4\epsilon_0}$. (Summer 2020 #1(b); as $t \to \infty$, $\mathbf E = 0$.)`),
      RF(md`
        ### Step 5: where the charge and the energy go

        **The charge** is not destroyed; it is moved. $\mathbf J = \sigma\mathbf E$ points from positive regions to negative ones, and they neutralize each other. In a finite conductor, the excess charge ends up on its surface.

        **The energy.** At $t = 0$ the field stores $w_e = \tfrac12\epsilon E^2 > 0$; at $t \to \infty$, nothing. It becomes heat. With $E = E_0e^{-t/\tau}$ at a point:
        $$\int_0^\infty\sigma E^2\,dt = \sigma E_0^2\frac{\tau}{2} = \frac12\epsilon E_0^2$$
        Exactly the stored energy, point by point. Nothing radiates: the conduction current $\sigma\mathbf E$ and the displacement current $\epsilon\,\partial\mathbf E/\partial t = -\sigma\mathbf E$ cancel, so $\nabla\times\mathbf H = 0$ and no $\mathbf H$ appears ([Topic 12](#/l/t12-displacement)).

        [[fig:decay]]
      `, { decay: { svg: decayPlot(), cap: 'ρ and E fall as $e^{-t/\\tau}$; the stored energy, $\\propto E^2$, falls twice as fast.' } }),
      Q(md`**Predict.** One relaxation time after $t = 0$, the energy stored in the field is what fraction of its initial value?`,
        ['$e^{-2} \\approx 13.5\\%$', '$e^{-1} \\approx 37\\%$', '$50\\%$', '$0$'], 0,
        [null, 'That is $\\rho$ or $E$. Energy goes as $E^2$.', 'The half-life of the energy is $(\\tau/2)\\ln2 = 0.35\\tau$.', 'Exponential decay is never exactly finished.'],
        md`$w_e \propto E^2 \propto e^{-2t/\tau}$: at $t = \tau$, $e^{-2} = 0.135$. The rest has gone into heat.`),
      R(md`
        ### The method

        !!method Charge conservation and relaxation
          1. **Continuity:** $\partial\rho/\partial t = -\nabla\cdot\mathbf J$ at a point; $dQ_{\text{enc}}/dt = -\oint\mathbf J\cdot d\mathbf S$ for a region.
          2. **Time-independent $\mathbf J$:** $\partial\rho/\partial t$ is constant, so $\rho(t) = \rho(0) + (\partial\rho/\partial t)\,t$.
          3. **Inside a homogeneous conductor:** $\rho(\mathbf r, t) = \rho(\mathbf r, 0)e^{-t/\tau}$ with $\tau = \epsilon/\sigma$ ($\epsilon_0$ for metals). Time to fall to a fraction $f$: $t = \tau\ln(1/f)$.
          4. **E from ρ** (1-D): $E_z = \frac1\epsilon\int\rho\,dz$ with no uniform part; it decays with the same exponential.
          5. **Limits and energy:** $t = 0$ gives the initial field; $t \to \infty$ gives $\rho = 0$, $\mathbf E = 0$. The stored $\tfrac12\epsilon E^2$ becomes Joule heat $\sigma E^2$.

        ### Worked example

        !!graded Problem
          A homogeneous conductor has $\sigma = 2\times10^{-5}$ S/m and $\epsilon = \epsilon_0$. At $t = 0$, $\rho(z, 0) = 6\cos(2z)$ µC/m³ ($z$ in m). Find $\rho(z, t)$ and $\tau$; the field $\mathbf E(z, t)$ (only a $z$-component, no uniform part); $E_z$ at $z = \pi/4$ m at $t = 0$ and at $t = \tau$; and the energy density there at $t = 0$. Where does that energy go?

        **1. Relaxation.** $\tau = \dfrac{\epsilon_0}{\sigma} = \dfrac{8.854\times10^{-12}\ \text{F/m}}{2\times10^{-5}\ \text{S/m}} = 4.43\times10^{-7}$ s $= 0.443$ µs, and $\rho(z, t) = 6\cos(2z)\,e^{-t/\tau}$ µC/m³.

        **2. Field.** $\dfrac{\partial E_z}{\partial z} = \dfrac{\rho}{\epsilon_0}$, so
        $$E_z = \frac{6\times10^{-6}}{\epsilon_0}\int\cos(2z)\,dz = \frac{3\times10^{-6}\ \text{C/m}^2}{8.854\times10^{-12}\ \text{F/m}}\sin(2z)\,e^{-t/\tau} = 3.39\times10^5\sin(2z)\,e^{-t/\tau}\ \text{V/m}$$

        **3. Numbers.** At $z = \pi/4$, $\sin(2z) = 1$: $E_z = 3.39\times10^5$ V/m at $t = 0$, and $3.39\times10^5e^{-1} = 1.25\times10^5$ V/m at $t = \tau$.

        **4. Energy.** $w_e = \tfrac12\epsilon_0E_z^2 = \tfrac12(8.854\times10^{-12})(3.39\times10^5)^2 = 0.508$ J/m³ at $t = 0$. It is dissipated as Joule heat, $\sigma E^2$, as the charge flows from the positive to the negative regions; $\int_0^\infty\sigma E^2dt = 0.508$ J/m³.

        **Check.** Continuity: $-\partial(\sigma E_z)/\partial z = -\sigma\rho/\epsilon_0 = -\rho/\tau = \partial\rho/\partial t$ ✓. Units: C/m² ÷ F/m = V/m ✓. As $t \to \infty$, $\rho = 0$ and $\mathbf E = 0$ ✓.

        !!mistake Common mistakes
          - $\tau = \sigma/\epsilon$ (the Summer 2017 key). That is a rate, s⁻¹. Check units: $\tau = \epsilon/\sigma$ is in seconds.
          - Dropping the minus sign: $\partial\rho/\partial t = -\nabla\cdot\mathbf J$. Outflow lowers the charge.
          - Differentiating $\rho$ to get $E$, or integrating with the wrong sign ($\int\sin = -\cos$).
          - Adding an arbitrary uniform field as the integration constant. Nothing produces it; set it to zero.
          - Using KCL ($\nabla\cdot\mathbf J = 0$) while charge is piling up. It holds only in steady state.
          - Giving $J$'s coefficients the unit A/m². A coefficient times $n$ lengths has A/m$^{2+n}$.
          - Saying the charge "disappears". It moves (to the surface, or onto charge of the other sign); its field energy becomes heat.

        ### Check questions
      `),
      Q(md`If the current density $\mathbf J = 0$ within a certain volume in free space, which must be true there for $\mathbf D$?`,
        ['$\\partial(\\nabla\\cdot\\mathbf D)/\\partial t = 0$', '$\\partial\\mathbf D/\\partial t = 0$', '$\\nabla\\cdot\\mathbf D = 0$', '$\\mathbf D = 0$'], 0,
        [null, '$\\mathbf D$ can still change in time (a passing wave), as long as its divergence does not.', 'A static charge could sit there: $\\nabla\\cdot\\mathbf D = \\rho$ need not be zero, only constant.', 'Nothing forbids a field from charges elsewhere.'],
        md`Continuity: $\partial\rho/\partial t = -\nabla\cdot\mathbf J = 0$, and $\rho = \nabla\cdot\mathbf D$, so $\partial(\nabla\cdot\mathbf D)/\partial t = 0$. Any charge there stays constant.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`Kirchhoff's current law follows from charge conservation when…`,
        ['charge does not accumulate at the node: $\\partial\\rho/\\partial t = 0$', 'the currents are DC and the wires are perfect conductors', 'the node is grounded', 'always, even while a capacitor plate charges'], 0,
        [null, 'Perfect wires are not needed; only that nothing piles up.', 'Grounding is irrelevant.', 'A charging capacitor plate is a node where charge piles up: the conduction currents into it do not add to zero.'],
        md`$\oint\mathbf J\cdot d\mathbf S = -dQ/dt = 0$ around the node: current in equals current out.`),
      Q(md`The Summer 2017 key solves $\partial\rho/\partial t + (\sigma/\epsilon_0)\rho = 0$ as $\rho = \rho_0e^{-t/\tau}$ with $\tau = \sigma/\epsilon_0$. What is wrong?`,
        ['$\\tau$ is inverted: $\\tau = \\epsilon_0/\\sigma$', 'Nothing: that is correct', 'The exponent should be $-t^2/\\tau$', 'It should be $\\epsilon_0\\sigma$'], 0,
        [null, '$\\sigma/\\epsilon_0$ has units s⁻¹, so $t/\\tau$ would not be dimensionless.', 'A first-order linear equation gives a plain exponential.', 'Units: F·S/m², not seconds.'],
        md`Substitute: $-\rho/\tau + (\sigma/\epsilon_0)\rho = 0$ needs $1/\tau = \sigma/\epsilon_0$, so $\tau = \epsilon_0/\sigma$.`, { src: 'Summer 2017 Exam 2' }),
      Q(md`Charge inside copper ($\sigma = 5.8\times10^7$ S/m) falls to $1/1000$ of its initial value after about…`,
        ['$1.1\\times10^{-18}$ s', '$1.5\\times10^{-19}$ s', '$1.5\\times10^{-16}$ s', '$4.6\\times10^{-19}$ s'], 0,
        [null, 'That is one $\\tau$, a drop to $1/e$.', 'That multiplies $\\tau$ by 1000; the time is $\\tau\\ln1000$.', 'That uses $\\log_{10}1000 = 3$; the decay needs the natural log, $\\ln1000 = 6.9$.'],
        md`$t = \tau\ln1000 = (1.53\times10^{-19})(6.91) = 1.06\times10^{-18}$ s.`),
      Q(md`A closed surface holds 10 C. A steady net current of 2 A flows **out** through it. After 3 s it holds…`,
        ['4 C', '16 C', '10 C', '6 C'], 0,
        [null, 'Current out lowers the charge.', 'A net current out changes the charge inside.', 'That is the charge that left.'],
        md`$Q(t) = Q_0 - I_{\text{out}}t = 10 - (2)(3) = 4$ C.`),
      Q(md`Excess charge is placed at the center of a large copper block. A short time later it is…`,
        ['on the block\'s outer surface', 'still at the center, slowly spreading', 'gone: it has been neutralized and destroyed', 'spread uniformly through the volume'], 0,
        [null, 'Relaxation is fast ($10^{-19}$ s) and does not spread $\\rho$; it removes it from the interior.', 'Charge is conserved; it moves.', 'In equilibrium $\\rho = 0$ everywhere inside.'],
        md`$\rho$ decays to zero inside; conservation puts the charge where the conductor ends: on the surface.`),
      Q(md`In a relaxing conductor, the energy initially stored in the electric field…`,
        ['is dissipated as heat by the current', 'is radiated as an electromagnetic wave', 'is stored in the magnetic field', 'stays in the field forever'], 0,
        [null, 'Conduction and displacement current cancel, so there is no $\\mathbf H$ and no radiation.', 'No $\\mathbf H$ is produced.', '$\\mathbf E \\to 0$, so the field energy goes to zero.'],
        md`$\int_0^\infty\sigma E^2dt = \tfrac12\epsilon E_0^2$ at each point: all of it becomes Joule heat (HW 7 #3(d)).`),
      Q(md`In a homogeneous conductor, $\rho(\mathbf r, 0)$ has a bump at the origin. As it relaxes, the bump…`,
        ['keeps its shape and shrinks everywhere at the same rate', 'spreads out like diffusing heat', 'moves away from the origin as a wave', 'shrinks fastest at its edges'], 0,
        [null, 'The equation has no spatial derivatives of $\\rho$: there is no diffusion.', 'Nothing propagates; each point decays on its own.', 'Every point has the same $\\tau = \\epsilon/\\sigma$.'],
        md`$\rho(\mathbf r, t) = \rho(\mathbf r, 0)e^{-t/\tau}$: a fixed shape times a common decaying factor.`),
      Q(md`HW 7 #2(b): $J_x = 5z^2$ A/m², with $z$ in meters. The unit of the coefficient 5 is…`,
        ['A/m⁴', 'A/m²', 'A', 'A·m²'], 0,
        [null, 'That is the unit of $J_x$ itself; $z^2$ carries m².', 'Divide A/m² by m², do not multiply.', 'Inverted: divide by the length powers.'],
        md`$5\times z^2$ must be A/m², and $z^2$ is m², so 5 is (A/m²)/m² = A/m⁴.`),
      R(md`
        ### Rapid fire: continuity

        **The trick:** $\partial\rho/\partial t = -\nabla\cdot\mathbf J$; differentiate each component along its own axis only. For a closed surface: current out = charge lost per second.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t3_cont', { need: 8 }), { id: 't3-relaxation.r0' }),
      R(md`
        ### Rapid fire: relaxation times

        **The trick:** $\tau = \epsilon/\sigma$ (seconds). After $n\tau$, $\rho$ and $E$ are down to $e^{-n}$, energy to $e^{-2n}$. Down to a fraction $f$: $t = \tau\ln(1/f)$; $\ln 2 = 0.69$, $\ln10 = 2.3$, $\ln100 = 4.6$.
      `),
      Object.assign(G('rf_t3_tau', { need: 8 }), { id: 't3-relaxation.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t3_cont', { need: 2 }),
      G('t3_relax', { need: 2 }),
      G('t3_energy', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const sgn = (v) => (v < 0 ? `- ${-v}` : `+ ${v}`);
  const lead = (k, v) => `${k === 1 ? '' : k === -1 ? '-' : k}${v}`;                       // first term: 'x', '-x', '3x'
  const term = (k, v) => `${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}${v}`;   // later terms: '+ y', '- 3y'
  const RATE = (v) => `$${p(q3(v))}$ C/(m³·s)`;
  GENS.rf_t3_cont = () => one([
    // linear J: ∇·J is the sum of the coefficients
    () => {
      let a, b, c;
      do { a = pick([1, 2, 3, 4, -2]); b = pick([1, 2, -1, -3]); c = pick([2, 3, 5, -4]); } while (a + b + c === 0);
      const d = a + b + c;
      return MC('Divergence', md`$\mathbf J = ${lead(a, 'x')}\,\hat x ${term(b, 'y')}\,\hat y ${term(c, 'z')}\,\hat z$ A/m². Everywhere, $\partial\rho/\partial t = $`, RATE(-d),
        [[RATE(d), 'Sign: outflow lowers the charge, $\\partial\\rho/\\partial t = -\\nabla\\cdot\\mathbf J$.'], [RATE(-a * b * c), 'The divergence adds the derivatives; it does not multiply them.'], [RATE(-(Math.abs(a) + Math.abs(b) + Math.abs(c))), 'Keep the signs of the coefficients.'], [RATE(0), 'Only a steady state has $\\nabla\\cdot\\mathbf J = 0$; here it is not zero.']],
        md`$\nabla\cdot\mathbf J = ${a} ${sgn(b)} ${sgn(c)} = ${d}$ A/m³, so $\partial\rho/\partial t = ${-d}$ C/(m³·s).`);
    },
    // a nonlinear J at a point
    () => {
      const a = pick([1, 2, 3]), b = pick([2, 4, -2]), x0 = pick([1, 2, -1]), y0 = pick([1, 2, 3]);
      const d = 2 * a * x0 + b * x0;                                   // J = a x² x̂ + b x y ŷ
      if (d === 0) return GENS.rf_t3_cont();
      return MC('At a point', md`$\mathbf J = ${lead(a, 'x^2')}\hat x ${sgn(b)}xy\,\hat y$ A/m². At $(${x0}, ${y0}, 0)$, $\partial\rho/\partial t = $`, RATE(-d),
        [[RATE(d), 'Sign: $\\partial\\rho/\\partial t = -\\nabla\\cdot\\mathbf J$.'], [RATE(-(2 * a * x0 + b * y0)), '$\\partial(bxy)/\\partial y = bx$, not $by$: differentiate $J_y$ along $y$.'], [RATE(-(a * x0 * x0 + b * x0 * y0)), 'That evaluates $J$ instead of its divergence.'], [RATE(-(2 * a * x0)), 'The $y$-component contributes $\\partial J_y/\\partial y = bx$.']],
        md`$\nabla\cdot\mathbf J = 2(${a})x + (${b})x = ${d}$ A/m³ at $x = ${x0}$; $\partial\rho/\partial t = ${-d}$ C/(m³·s).`);
    },
    // integral form
    () => {
      const I = pick([2, 3, 5, 0.5, 4]), out = pick([true, false]);
      const o = (v) => `$${p(v)}$ C/s`;
      return MC('Through a closed surface', md`A net current of $${I}$ A flows **${out ? 'out of' : 'into'}** a closed surface. The charge inside changes at $dQ_{\text{enc}}/dt = $`, o(out ? -I : I),
        [[o(out ? I : -I), out ? 'Current out lowers the charge inside.' : 'Current in raises the charge inside.'], [o(0), 'Only zero net current leaves the charge unchanged.'], [o(out ? -2 * I : 2 * I), 'No factor of 2: one ampere is one coulomb per second.']],
        md`$dQ_{\text{enc}}/dt = -\oint\mathbf J\cdot d\mathbf S = -I_{\text{out}} = ${p(out ? -I : I)}$ C/s.`);
    },
    // units of a coefficient
    () => {
      const [tex, n] = pick([['z^2', 2], ['x^3y', 4], ['z(y - y_0)^2', 3], ['xy', 2], ['x', 1], ['y^2z^3', 5]]);
      const u = (k) => (k === 0 ? '$\\text{A}$' : k === -1 ? '$\\text{A}\\cdot\\text{m}$' : k < 0 ? `$\\text{A}\\cdot\\text{m}^{${-k}}$` : k === 1 ? '$\\text{A/m}$' : `$\\text{A/m}^{${k}}$`);
      return MC('Units', md`$J_x = k\,${tex}$ A/m², with lengths in meters. The unit of $k$ is…`, u(2 + n),
        [[u(2), 'That is the unit of $J_x$; the length factors carry their own meters.'], [u(2 - n), 'That multiplies by the length factors instead of dividing.'], [u(n), `Start from A/m², then divide by $\\text{m}^{${n}}$.`], [u(2 + n + 1), 'Count the powers of length again.']],
        md`$k\,(\text{m}^{${n}}) = \text{A/m}^2$, so $k$ is A/m$^{${2 + n}}$.`);
    },
    // steady state
    () => MC('Steady state', md`In a DC circuit in steady state, $\nabla\cdot\mathbf J$ inside the wires is…`, '$0$',
      [['positive', 'Positive would drain charge out of every point, without end.'], ['negative', 'Negative would pile charge up without end.'], ['$\\sigma\\rho/\\epsilon$, which is nonzero', 'In steady state $\\rho$ inside a conductor is zero, so this is zero too.']],
      md`Steady: $\partial\rho/\partial t = 0$, so $\nabla\cdot\mathbf J = 0$. This is KCL at every point.`),
  ]);

  const S_ = (t) => `$${f(t)}$ s`;
  GENS.rf_t3_tau = () => one([
    // τ for a metal
    () => {
      const [name, s] = pick([['copper', 5.8e7], ['aluminum', 3.5e7], ['a resistive alloy', 1e6], ['graphite', 1e5], ['silver', 6.3e7]]);
      const t = e0 / s;
      return MC('Metal', md`Charge relaxation time of ${name} ($\sigma = ${p(s)}$ S/m, $\epsilon = \epsilon_0$):`, S_(t),
        [[S_(s / e0), 'That is $\\sigma/\\epsilon_0$, a rate, read as a time.'], [S_(e0 * s), 'Divide $\\epsilon_0$ by $\\sigma$, do not multiply.'], [S_(t * 1e12), 'Use $\\epsilon_0 = 8.854\\times10^{-12}$ F/m.']],
        md`$\tau = \epsilon_0/\sigma = 8.854\times10^{-12}/${p(s)} = ${f(t)}$ s.`);
    },
    // fraction left after nτ
    () => {
      const [n, fr] = pick([[1, '37\\%'], [2, '13.5\\%'], [3, '5.0\\%'], [5, '0.67\\%']]);
      const what = pick(['the charge density', 'the field $E$']);
      const all = ['37\\%', '13.5\\%', '5.0\\%', '0.67\\%', '1.8\\%'];
      return MC('After nτ', md`After $t = ${n}\tau$, ${what} inside a relaxing conductor is what fraction of its initial value?`, `$${fr}$`,
        all.filter((x) => x !== fr).map((x) => [`$${x}$`, `That is $e^{-${{ '37\\%': 1, '13.5\\%': 2, '5.0\\%': 3, '0.67\\%': 5, '1.8\\%': 4 }[x]}}$; here the exponent is $-t/\\tau = -${n}$.`]),
        md`$e^{-${n}} = ${fr.replace('\\%', '')}\%$. ${what === 'the field $E$' ? '$E$ follows $\\rho$ with the same exponential.' : ''}`);
    },
    // time to fall to a fraction
    () => {
      const [fr, ln, lt] = pick([['1\\%', Math.log(100), '4.6'], ['10\\%', Math.log(10), '2.3'], ['half', Math.log(2), '0.69'], ['0.1\\%', Math.log(1000), '6.9']]);
      const o = (k) => `$${k}\\tau$`;
      return MC('Time to decay', md`How long until the charge density in a relaxing conductor is ${fr === 'half' ? 'half' : `$${fr}$`} of its initial value?`, o(lt),
        [[o(fr === 'half' ? '0.5' : fr === '1\\%' ? '100' : fr === '10\\%' ? '10' : '1000'), 'That uses the fraction directly; take its logarithm: $t = \\tau\\ln(1/f)$.'], [o('1'), 'One $\\tau$ brings it to $1/e = 37\\%$.'], [o(fr === 'half' ? '1.39' : fr === '1\\%' ? '9.2' : fr === '10\\%' ? '4.6' : '13.8'), 'That doubles the time. The charge decays with $\\tau$ itself; the energy is what decays with $\\tau/2$.']],
        md`$e^{-t/\tau} = f$ gives $t = \tau\ln(1/f) = ${q3(ln)}\tau$.`);
    },
    // energy fraction
    () => {
      const n = pick([0.5, 1, 2]);
      const pc = (x) => `$${p(q3(x * 100))}\\%$`;
      return MC('Energy', md`After $t = ${n}\tau$, the electric energy stored inside a relaxing conductor is what fraction of its initial value?`, pc(Math.exp(-2 * n)),
        [[pc(Math.exp(-n)), 'That is $E$ (or $\\rho$). Energy goes as $E^2$.'], [pc(Math.exp(-n / 2)), 'Energy decays faster than $E$, not slower.'], [pc(1 - Math.exp(-2 * n)), 'That is the fraction already turned into heat.']],
        md`$w_e \propto E^2 \propto e^{-2t/\tau} = e^{-${2 * n}}$.`);
    },
    // which material relaxes faster
    () => {
      const pairs = [[['seawater', 81, 4], ['distilled water', 80, 5.5e-6]], [['copper', 1, 5.8e7], ['seawater', 81, 4]], [['a lossy plastic', 2, 1e-6], ['an oil', 3, 1e-9]], [['graphite', 1, 1e5], ['silicon', 11.7, 4e-4]]];
      const [A, B] = pick(pairs);
      const tA = A[1] * e0 / A[2], tB = B[1] * e0 / B[2];
      const fast = tA < tB ? A : B, slow = tA < tB ? B : A;
      return MC('Faster', md`Which relaxes faster: ${A[0]} ($\epsilon_r = ${A[1]}$, $\sigma = ${p(A[2])}$ S/m) or ${B[0]} ($\epsilon_r = ${B[1]}$, $\sigma = ${p(B[2])}$ S/m)?`, fast[0],
        [[slow[0], `Its $\\tau = \\epsilon/\\sigma = ${f(Math.max(tA, tB))}$ s is the longer one.`], ['the same: both conduct', 'Their $\\epsilon/\\sigma$ differ by orders of magnitude.'], ['neither: only metals relax', 'Every conductor relaxes, with $\\tau = \\epsilon/\\sigma$.']],
        md`$\tau = \epsilon/\sigma$: ${A[0]} ${f(tA)} s, ${B[0]} ${f(tB)} s.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // HW 7 #2 style: a time-independent J; ∂ρ/∂t at a point, ρ later, and the unit of a coefficient
  GENS.t3_cont = () => {
    let a, b, c, y0, P, X, Y, Z, d, r0, t1, rt;
    const cf = (k) => (k === 1 ? '' : k);          // no '1' in front of a monomial
    const JX = [
      { tex: (k) => `${k}x^2`, d: (k, P) => 2 * k * P[0], n: 2 }, { tex: (k) => `${k}xy`, d: (k, P) => k * P[1], n: 2 },
      { tex: (k) => `${k}z^2`, d: () => 0, n: 2 }, { tex: (k) => `${k}x`, d: (k) => k, n: 1 }, { tex: (k) => `${k}x^3`, d: (k, P) => 3 * k * P[0] ** 2, n: 3 },
    ];
    const JY = [
      { tex: (k) => `${cf(k)}y^2`, d: (k, P) => 2 * k * P[1] }, { tex: (k) => `${cf(k)}x^3y`, d: (k, P) => k * P[0] ** 3 },
      { tex: (k) => `${cf(k)}yz`, d: (k, P) => k * P[2] }, { tex: (k) => `${cf(k)}x^2`, d: () => 0 }, { tex: (k) => `${cf(k)}y`, d: (k) => k },
    ];
    const JZ = [
      { tex: (k) => `${cf(k)}z`, d: (k) => k }, { tex: (k, y) => `${cf(k)}z(y - ${y})^2`, d: (k, P, y) => k * (P[1] - y) ** 2 },
      { tex: (k) => `${cf(k)}z^2`, d: (k, P) => 2 * k * P[2] }, { tex: (k) => `${cf(k)}xy`, d: () => 0 }, { tex: (k) => `${cf(k)}xz`, d: (k, P) => k * P[0] },
    ];
    do {
      a = pick([2, 3, 4, 5]); b = pick([1, 2, 4, 6]); c = pick([1, 2, 3, 5]); y0 = pick([1, 2, 3]);
      P = [pick([-1, 0, 1, 2]), pick([0, 1, 2]), pick([-1, 0, 1, 2])];
      X = pick(JX); Y = pick(JY); Z = pick(JZ);
      d = X.d(a, P) + Y.d(b, P) + Z.d(c, P, y0);
      r0 = pick([0, 0, 5, 10, -4]); t1 = pick([2, 3, 5, 10]); rt = r0 - d * t1;
    } while (d === 0 || rt === 0);
    const units = [`$\\text{A/m}^{${2 + X.n}}$`, '$\\text{A/m}^2$', `$\\text{A}\\cdot\\text{m}^{${X.n}}$`, `$\\text{C/m}^{${2 + X.n}}$`];
    const jtex = `${X.tex(a)}\\,\\hat x + ${Y.tex(b)}\\,\\hat y + ${Z.tex(c, y0)}\\,\\hat z`;
    return {
      title: 'Continuity at a point',
      q: md`A time-independent current density $\mathbf J = ${jtex}$ A/m² flows in a region ($x$, $y$, $z$ in meters). At $P = (${P.join(', ')})$, $\rho = ${r0}$ C/m³ at $t = 0$. Find $\partial\rho/\partial t$ at $P$, $\rho$ at $P$ at $t = ${t1}$ s, and the unit of the coefficient ${a} in $J_x$.`,
      parts: [
        N('\\partial\\rho/\\partial t', -d, 'C/(m^3·s)'),
        N(`\\rho(P, ${t1}\\ \\text{s})`, rt, 'C/m^3'),
        { lbl: `The unit of the coefficient ${a} in $J_x$ is`, mc: units, a: 0, why: [null, 'That is the unit of $J_x$ itself; the length factors carry meters of their own.', 'That multiplies by the lengths instead of dividing by them.', 'It multiplies a current density: amperes, not coulombs.'] },
      ],
      hints: ['$\\partial\\rho/\\partial t = -\\nabla\\cdot\\mathbf J = -(\\partial J_x/\\partial x + \\partial J_y/\\partial y + \\partial J_z/\\partial z)$. Each component is differentiated along its own axis only.', '$\\mathbf J$ does not change in time, so neither does $\\partial\\rho/\\partial t$: $\\rho(t) = \\rho(0) + (\\partial\\rho/\\partial t)\\,t$.'],
      sol: sol({
        eq: md`$\dfrac{\partial\rho}{\partial t} = -\nabla\cdot\mathbf J$.`,
        sym: md`$\dfrac{\partial J_x}{\partial x} = ${X.d(a, P)}$, $\;\dfrac{\partial J_y}{\partial y} = ${Y.d(b, P)}$, $\;\dfrac{\partial J_z}{\partial z} = ${Z.d(c, P, y0)}$ A/m³ at $P$.`,
        sub: md`$$\nabla\cdot\mathbf J = ${d}\ \text{A/m}^3 \;\Rightarrow\; \frac{\partial\rho}{\partial t} = ${-d}\ \text{C/(m}^3\text{s)}, \qquad \rho(P, ${t1}) = ${r0} + (${-d})(${t1}) = ${rt}\ \text{C/m}^3$$`,
        ans: md`$\partial\rho/\partial t = ${-d}$ C/(m³·s); $\rho = ${rt}$ C/m³ at $t = ${t1}$ s; the coefficient ${a} has units A/m$^{${2 + X.n}}$.`,
        check: md`${d > 0 ? 'More current leaves the neighborhood of $P$ than enters it, so the charge there falls' : 'More current enters the neighborhood of $P$ than leaves it, so charge piles up'} ✓. This only works because nothing restores $\rho$: in a conductor, $\mathbf J$ would respond to the new charge.`,
      }),
    };
  };

  // relaxation of ρ0 cos kz or ρ0 sin kz: τ, the field, the time to decay
  GENS.t3_relax = () => {
    const s = pick([1e-5, 1e-4, 1e-3, 1e-2]), er = pick([1, 1, 2, 5]), r0 = pick([2, 5, 10, 20]), k = pick([2, 4, 5, 10]), cosine = pick([true, false]), [fr, ftex] = pick([[0.01, '1\\%'], [0.1, '10\\%'], [0.5, '50\\%']]);
    const eps = er * e0, tau = eps / s, E0 = r0 * 1e-6 / (eps * k), tf = tau * Math.log(1 / fr);
    const fn = cosine ? 'cos' : 'sin', gn = cosine ? 'sin' : 'cos', FN = `\\${fn}`, GN = `\\${gn}`;
    const et = er === 1 ? '\\epsilon_0' : `${er}\\epsilon_0`;
    const right = cosine ? `$+\\dfrac{\\rho_0}{\\epsilon k}\\sin(kz)\\,e^{-t/\\tau}$` : `$-\\dfrac{\\rho_0}{\\epsilon k}\\cos(kz)\\,e^{-t/\\tau}$`;
    const opts = [right,
      cosine ? '$-\\dfrac{\\rho_0}{\\epsilon k}\\sin(kz)\\,e^{-t/\\tau}$' : '$+\\dfrac{\\rho_0}{\\epsilon k}\\cos(kz)\\,e^{-t/\\tau}$',
      cosine ? '$-\\dfrac{\\rho_0k}{\\epsilon}\\sin(kz)\\,e^{-t/\\tau}$' : '$\\dfrac{\\rho_0k}{\\epsilon}\\cos(kz)\\,e^{-t/\\tau}$',
      cosine ? '$+\\dfrac{\\rho_0}{\\epsilon k}\\sin(kz)$' : '$-\\dfrac{\\rho_0}{\\epsilon k}\\cos(kz)$'];
    return {
      title: 'Charge relaxation and its field',
      q: md`A homogeneous conductor has $\sigma = ${p(s)}$ S/m and $\epsilon = ${et}$. At $t = 0$, $\rho(z, 0) = \rho_0${FN}(kz)$ with $\rho_0 = ${r0}$ µC/m³ and $k = ${k}$ rad/m. Find $\tau$, the field $E_z(z, t)$ (no uniform part) and its amplitude at $t = 0$, and the time for $\rho$ to fall to ${ftex.replace('\\', '')} of its initial value.`,
      parts: [
        N('\\tau', tau, 's'),
        { lbl: '$E_z(z, t) = $', mc: opts, a: 0, why: [null, `Sign: the antiderivative of $\\${fn}$ is $${cosine ? '+' : '-'}\\${gn}$, over $k$.`, 'That differentiates $\\rho$ instead of integrating it.', 'The field decays with the charge: it needs $e^{-t/\\tau}$.'] },
        N('|E_z|_{\\max}(t = 0)', E0, 'V/m'),
        N(`t_{${ftex}}`, tf, 's'),
      ],
      hints: ['$\\tau = \\epsilon/\\sigma$, and $\\rho(z, t) = \\rho(z, 0)e^{-t/\\tau}$.', '$\\partial E_z/\\partial z = \\rho/\\epsilon$: integrate in $z$. The amplitude is $\\rho_0/(\\epsilon k)$. Then $e^{-t/\\tau} = f$ gives $t = \\tau\\ln(1/f)$.'],
      sol: sol({
        eq: md`$\dfrac{\partial\rho}{\partial t} + \dfrac{\sigma}{\epsilon}\rho = 0$; $\;\dfrac{\partial E_z}{\partial z} = \dfrac{\rho}{\epsilon}$.`,
        sym: md`$\rho = \rho_0${FN}(kz)e^{-t/\tau}$ with $\tau = \epsilon/\sigma$; $\;E_z = \dfrac{1}{\epsilon}\displaystyle\int\rho\,dz = ${cosine ? '' : '-'}\dfrac{\rho_0}{\epsilon k}${GN}(kz)e^{-t/\tau}$; $\;t_f = \tau\ln(1/f)$.`,
        sub: md`$$\tau = \frac{${er === 1 ? '' : er}(8.854\times10^{-12})}{${p(s)}} = ${f(tau)}\ \text{s}, \qquad \frac{\rho_0}{\epsilon k} = \frac{${r0}\times10^{-6}}{(${f(eps)})(${k})} = ${f(E0)}\ \text{V/m}, \qquad t_f = ${f(tau)}\ln${p(q3(1 / fr))} = ${f(tf)}\ \text{s}$$`,
        ans: md`$\tau = ${f(tau)}$ s; $E_z = ${cosine ? '' : '-'}${f(E0)}\,${GN}(${k}z)\,e^{-t/\tau}$ V/m; $t = ${f(tf)}$ s.`,
        check: md`Gauss: $\partial E_z/\partial z = (\rho_0/\epsilon)${FN}(kz)e^{-t/\tau} = \rho/\epsilon$ ✓. As $t \to \infty$, $\rho$ and $\mathbf E$ both vanish ✓.`,
      }),
    };
  };

  // where the energy goes: stored energy density, heating rate, half-life of the energy
  GENS.t3_energy = () => {
    const s = pick([1e-5, 1e-4, 1e-3]), r0 = pick([5, 10, 20, 50]), k = pick([1, 2, 5]);
    const tau = e0 / s, E0 = r0 * 1e-6 / (e0 * k), w0 = 0.5 * e0 * E0 * E0, p0 = s * E0 * E0, th = tau * Math.log(2) / 2;
    return {
      title: 'Where the field energy goes',
      q: md`A conductor with $\sigma = ${p(s)}$ S/m and $\epsilon = \epsilon_0$ holds $\rho(z, 0) = \rho_0\cos(kz)$ with $\rho_0 = ${r0}$ µC/m³ and $k = ${k}$ rad/m; its field is $E_z = \dfrac{\rho_0}{\epsilon_0k}\sin(kz)e^{-t/\tau}$. At $z = \dfrac{\pi}{${2 * k}}$ m (where $|E_z|$ is largest), find the energy density at $t = 0$, the Joule heating rate at $t = 0$, the time for the energy density to halve, and the total heat released per unit volume there.`,
      parts: [N('w_e(0)', w0, 'J/m^3'), N('p(0)', p0, 'W/m^3'), N('t_{1/2}', th, 's'), N('\\int_0^\\infty p\\,dt', w0, 'J/m^3')],
      hints: ['At that point $E_z(0) = \\rho_0/(\\epsilon_0k)$. Then $w_e = \\tfrac12\\epsilon_0E^2$ and $p = \\sigma E^2$.', '$w_e \\propto e^{-2t/\\tau}$, so it halves at $t = (\\tau/2)\\ln2$. The heat is $\\int_0^\\infty\\sigma E_0^2e^{-2t/\\tau}dt$.'],
      sol: sol({
        eq: md`$w_e = \tfrac12\epsilon_0E^2$, $\;p = \sigma E^2$, $\;E = E_0e^{-t/\tau}$ with $\tau = \epsilon_0/\sigma$.`,
        sym: md`$w_e(t) = w_0e^{-2t/\tau}$ halves at $t_{1/2} = \tfrac{\tau}{2}\ln2$; $\;\displaystyle\int_0^\infty\sigma E_0^2e^{-2t/\tau}dt = \sigma E_0^2\frac{\tau}{2} = \tfrac12\epsilon_0E_0^2 = w_0$.`,
        sub: md`$$E_0 = \frac{${r0}\times10^{-6}}{(8.854\times10^{-12})(${k})} = ${f(E0)}\ \text{V/m}, \qquad w_0 = \tfrac12(8.854\times10^{-12})(${f(E0)})^2 = ${f(w0)}\ \text{J/m}^3$$
$$p(0) = (${p(s)})(${f(E0)})^2 = ${f(p0)}\ \text{W/m}^3, \qquad \tau = ${f(tau)}\ \text{s}, \qquad t_{1/2} = ${f(th)}\ \text{s}$$`,
        ans: md`$w_e(0) = ${f(w0)}$ J/m³, $p(0) = ${f(p0)}$ W/m³, $t_{1/2} = ${f(th)}$ s, total heat $= ${f(w0)}$ J/m³.`,
        check: md`$p(0)\cdot\tau/2 = ${f(p0 * tau / 2)}$ J/m³ $= w_0$ ✓: every joule stored in the field becomes heat at that point; none is radiated.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t3-relaxation'] = [
    Q(md`The continuity equation $\nabla\cdot\mathbf J + \partial\rho/\partial t = 0$ expresses…`,
      ['conservation of charge', 'Gauss\'s law', 'Ohm\'s law', 'conservation of energy'], 0,
      [null, 'Gauss relates $\\mathbf E$ to $\\rho$; continuity relates $\\mathbf J$ to $\\rho$.', 'Ohm\'s law is $\\mathbf J = \\sigma\\mathbf E$, a material law.', 'Energy conservation is Poynting\'s theorem.'],
      md`Outflow of current from a point equals the rate of loss of charge there.`),
    Q(md`Current $I$ flows away from a point charge $Q(t)$ along a wire to infinity. Then…`,
      ['$dQ/dt = -I$', '$dQ/dt = +I$', '$dQ/dt = 0$', '$Q = It$'], 0,
      [null, 'Current leaving lowers the charge.', 'Charge leaves through the wire.', 'Only if $Q(0) = 0$ and the current flowed in.'],
      md`A sphere around the charge: $\oint\mathbf J\cdot d\mathbf S = I = -dQ/dt$ (Lecture 16).`),
    Q(md`$\nabla\cdot\mathbf J$ has units of…`,
      ['A/m³', 'A/m²', 'C/m³', 'A·m'], 0,
      [null, 'That is $\\mathbf J$; the divergence adds one more 1/m.', 'Close: it equals $-\\partial\\rho/\\partial t$, in C/(m³·s) = A/m³.', 'Divergence divides by length.'],
      md`(A/m²)/m = A/m³ = C/(m³·s), matching $\partial\rho/\partial t$.`),
    Q(md`$\mathbf J = J_0\hat x$ (uniform). The charge density everywhere…`,
      ['stays constant', 'decreases linearly', 'increases linearly', 'decays exponentially'], 0,
      [null, '$\\nabla\\cdot\\mathbf J = 0$: what flows into any region also flows out.', 'Inflow equals outflow everywhere.', 'There is nothing to relax: $\\partial\\rho/\\partial t = 0$.'],
      md`A uniform $\mathbf J$ has zero divergence: a steady flow that piles nothing up.`),
    Q(md`Deriving $\partial\rho/\partial t + (\sigma/\epsilon)\rho = 0$ uses which three laws?`,
      ['continuity, Ohm\'s law $\\mathbf J = \\sigma\\mathbf E$, Gauss\'s law', 'Faraday, Ampère, Gauss', 'continuity, Faraday, Ohm', 'Gauss, Ohm, and $\\nabla\\cdot\\mathbf B = 0$'], 0,
      [null, 'No magnetic laws enter.', 'Faraday is not needed; Gauss supplies $\\nabla\\cdot\\mathbf E$.', '$\\nabla\\cdot\\mathbf B = 0$ says nothing about charge; the time derivative comes from continuity.'],
      md`$\partial\rho/\partial t = -\nabla\cdot(\sigma\mathbf E) = -\sigma\rho/\epsilon$.`),
    Q(md`Seawater ($\sigma = 4$ S/m, $\epsilon = 81\epsilon_0$) has a relaxation time of about…`,
      ['0.18 ns', '2.2 ps', '18 ns', '0.18 s'], 0,
      [null, 'That uses $\\epsilon_0$ and drops the 81.', 'Off by 100.', 'Off by $10^9$.'],
      md`$\tau = 81(8.854\times10^{-12})/4 = 1.79\times10^{-10}$ s.`),
    Q(md`Why does excess charge in a good conductor reach the surface so fast?`,
      ['$\\tau = \\epsilon_0/\\sigma$ is tiny because $\\sigma$ is huge', 'electrons travel at nearly $c$', 'the surface attracts charge', 'the field inside is always zero'], 0,
      [null, 'Electrons drift slowly (mm/s); the field rearranges, not single electrons racing.', 'Mutual repulsion pushes it out; the speed is set by $\\epsilon_0/\\sigma$.', 'It becomes zero only after relaxation; that is the result, not the cause.'],
      md`The decay rate $\sigma/\epsilon_0$ is about $10^{19}$ s⁻¹ in copper.`),
    Q(md`In a relaxing conductor, the total current density (conduction plus displacement) is…`,
      ['zero', '$\\sigma\\mathbf E$', '$2\\sigma\\mathbf E$', '$\\epsilon\\mathbf E/\\tau$, not zero'], 0,
      [null, 'That is only the conduction part; the displacement part $\\epsilon\\,\\partial\\mathbf E/\\partial t = -\\sigma\\mathbf E$ cancels it.', 'They have opposite signs.', 'That equals $\\sigma\\mathbf E$, cancelled by the displacement current.'],
      md`$\sigma\mathbf E + \epsilon\,\partial\mathbf E/\partial t = \sigma\mathbf E - \sigma\mathbf E = 0$, so no $\mathbf H$ is produced.`),
    Q(md`$\rho(z, 0) = \rho_0\cos(kz)$ in a conductor. At $z = 0$ (a positive peak), the current density…`,
      ['is zero, and current flows away from $z = 0$ on both sides', 'is largest, pointing $+\\hat z$', 'is largest, pointing $-\\hat z$', 'points toward $z = 0$ from both sides'], 0,
      [null, '$E_z \\propto \\sin(kz)$ vanishes at $z = 0$.', '$E_z \\propto \\sin(kz)$ vanishes at $z = 0$.', 'Current flows from positive to negative regions, so away from a positive peak.'],
      md`$J_z = \sigma E_z \propto \sin(kz)$: zero at the peak, $+\hat z$ just above it, $-\hat z$ just below. Charge drains out of the peak.`),
    Q(md`A charge distribution decays to 1% of its value in 4.6 ns. Its relaxation time is…`,
      ['1 ns', '4.6 ns', '0.46 ns', '2.3 ns'], 0,
      [null, 'That is $\\tau\\ln100$.', 'Use $t = \\tau\\ln(1/f)$ with $\\ln100 = 4.6$.', 'That would be the time to 10%.'],
      md`$\tau = t/\ln100 = 4.6/4.6 = 1$ ns.`),
    Q(md`HW 7 #3: $\rho(x, 0) = \sin(100x)$ C/m³ in a conductor with $\sigma = 5\times10^7$ S/m. The time for $\rho$ to reach $0.01\sin(100x)$ is about…`,
      ['$8.2\\times10^{-19}$ s', '$1.8\\times10^{-19}$ s', '$4.1\\times10^{-19}$ s', '$1.8\\times10^{-17}$ s'], 0,
      [null, 'That is one $\\tau$.', 'That is $\\tau\\ln10$, the time to fall to 10%.', 'That uses a factor of 100 instead of $\\ln100$.'],
      md`$t = (\epsilon_0/\sigma)\ln100 = (1.77\times10^{-19})(4.61) = 8.2\times10^{-19}$ s.`),
    Q(md`For time-independent $\mathbf J$ with $\nabla\cdot\mathbf J = 3$ A/m³ at a point, $\rho$ there…`,
      ['falls by 3 C/m³ every second, without limit', 'decays exponentially', 'stays constant', 'rises by 3 C/m³ every second'], 0,
      [null, 'Exponential decay needs $\\mathbf J$ to respond to $\\rho$ (a conductor); here $\\mathbf J$ is fixed.', 'Positive divergence drains charge.', 'Sign: $\\partial\\rho/\\partial t = -3$.'],
      md`$\partial\rho/\partial t = -3$ C/(m³·s), constant: $\rho(t) = \rho(0) - 3t$ (HW 7 #2).`),
    Q(md`Energy stored in the field of a relaxing charge distribution decays with time constant…`,
      ['$\\tau/2$', '$\\tau$', '$2\\tau$', '$\\tau^2$'], 0,
      [null, 'That is the field and the charge.', 'Energy falls faster than $E$, not slower.', 'Units: s².'],
      md`$w_e \propto E^2 \propto e^{-2t/\tau}$.`),
    Q(md`Ohm's law $\mathbf J = \sigma\mathbf E$ and $\nabla\cdot\mathbf E = \rho/\epsilon$ imply that inside a homogeneous conductor in steady state (DC current flowing)…`,
      ['$\\rho = 0$', '$\\mathbf E = 0$', '$\\mathbf J = 0$', '$\\rho$ is uniform and nonzero'], 0,
      [null, 'A DC current needs $\\mathbf E \\ne 0$ inside the wire.', 'A DC current flows.', 'Any interior $\\rho$ would relax away.'],
      md`Steady: $\nabla\cdot\mathbf J = 0 = \sigma\rho/\epsilon$, so $\rho = 0$. The field that drives the current comes from surface charges.`),
    Q(md`The equation $\partial\rho/\partial t = -\nabla\cdot\mathbf J$ can be derived from…`,
      ['the divergence of Ampère–Maxwell plus Gauss\'s law', 'Faraday\'s law alone', 'Gauss\'s law for $\\mathbf B$', 'Ohm\'s law'], 0,
      [null, 'Faraday involves $\\mathbf B$ and $\\mathbf E$, no current.', 'That says nothing about charge.', 'Continuity holds in any material, not only ohmic ones.'],
      md`$\nabla\cdot(\nabla\times\mathbf H) = 0 = \nabla\cdot\mathbf J + \partial(\nabla\cdot\mathbf D)/\partial t = \nabla\cdot\mathbf J + \partial\rho/\partial t$. Maxwell's correction makes the equations conserve charge.`),
    Q(md`A perfect insulator ($\sigma = 0$) holds a charge distribution. Its relaxation time is…`,
      ['infinite: the charge stays put', 'zero', '$\\epsilon$', 'the same as a metal\'s'], 0,
      [null, 'Zero would mean instant relaxation, a perfect conductor.', 'Units: F/m, not s.', '$\\tau = \\epsilon/\\sigma$ depends strongly on $\\sigma$.'],
      md`$\tau = \epsilon/\sigma \to \infty$: no current can move the charge.`),
  ];
})();

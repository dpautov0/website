/* Topics 3 and 4 (Lectures 20-21): the energy of a wave.
   w1-poynting: the Poynting theorem derived from Faraday and Ampère with J, the identity div(E x H) proved component by
   component, the point and box forms, what each term means and its sign, standing-wave energy that sloshes (FA23 #1(c)),
   energy entering a resistive wire from the side, a box with no sources (stored or released?), the power a sheet delivers.
   w1-avg: instantaneous versus time-averaged power, the product rule <ab> = (1/2)Re{A B*}, <S> = (1/2)Re{E x H*},
   E0^2/2eta, power through an area, rms, two polarizations (powers add), two directions (powers subtract), standing waves
   (energy without flow), averaged energy densities and <S> = v<w>, the lossy preview e^{-2 alpha z} cos(tau), SP24 #2(c).
   Exam 2's Topic 17 (t17-poynting) gave S = E x H for one plane wave; this file builds on it and does not repeat it.
   Generator prefix: w1s (rapid fire rf_w1s_*, problems w1s_*). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick, ri } = U;

  // ---------------------------------------------------------------- helpers
  const ETA0 = EM.eta0, CC = EM.c, EPS0 = 1e-9 / (36 * Math.PI);
  const DEG = Math.PI / 180;
  const cos2 = (d) => Math.cos(d * DEG) ** 2;
  const W = (x, u) => `$${f(x)}$ ${u}`;                       // a number with its unit, for options
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const frac = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? `${n}` : `\\tfrac{${n}}{${d}}`; };
  const etaPi = (er, mr = 1) => 120 * Math.sqrt(mr / er);      // eta / pi, a whole number for the media used here
  const medTex = (er, mr = 1) => (er === 1 && mr === 1 ? 'free space' : md`a lossless medium with $\epsilon_r = ${er}$, $\mu_r = ${mr}$`);
  const betaTex = (lam) => (lam === 1 ? '2\\pi' : lam === 2 ? '\\pi' : `\\tfrac{2\\pi}{${lam}}`);
  const ang = (d) => (d === 0 ? '0°' : `${d}°`);

  // ---------------------------------------------------------------- figures
  // a region V with its closed surface A: energy flows in and out, is stored, and is handed to charges
  function boxFig() {
    const g = PF.fig({ alt: 'a closed region V with surface A; a Poynting arrow enters on the left and a smaller one leaves on the right; outward dA on top; inside, energy is stored and handed to charges' });
    g.rect(120, 50, 170, 110, { cls: 'shade' });
    g.rect(120, 50, 170, 110);
    g.arrow(28, 105, 114, 105, { cls: 'thick', hs: 9 });
    g.label(66, 98, '\\mathbf S', 'b');
    g.arrow(296, 105, 350, 105, { cls: 'thick', hs: 8 });
    g.label(324, 98, '\\mathbf S', 'b');
    g.arrow(205, 50, 205, 14, { hs: 7 });
    g.label(212, 20, 'd\\mathbf A\\ \\text{(outward)}', 'l', 'small');
    g.label(205, 84, 'w\\ \\text{stored}', 'c', 'small');
    g.label(205, 126, '\\mathbf J\\cdot\\mathbf E\\ \\text{to charges}', 'c', 'small');
    g.label(126, 156, 'V', 'bl', 'small');
    g.label(296, 156, 'A', 'l', 'small');
    return g.svg();
  }
  // a resistive wire: E along the axis, H around it, S pointing in through the side
  function wireFig() {
    const g = PF.fig({ alt: 'a wire seen from the side, current to the right; E inside points along the wire; H comes out of the page above the wire and goes into it below; S points into the wire from above and from below' });
    g.rect(50, 70, 260, 52, { cls: 'shade' });
    g.rect(50, 70, 260, 52);
    g.arrow(90, 106, 170, 106, { hs: 8 });
    g.label(130, 100, '\\mathbf E', 'b', 'small');
    g.arrow(318, 96, 362, 96, { cls: 'thick', hs: 8 });
    g.label(340, 89, 'I', 'b');
    g.odot(150, 44, 7, { lab: '\\mathbf H', at: 'l' });
    g.otimes(150, 148, 7, { lab: '\\mathbf H', at: 'l' });
    g.arrow(250, 8, 250, 62, { cls: 'thick', hs: 9 });
    g.label(258, 24, '\\mathbf S', 'l');
    g.arrow(250, 184, 250, 130, { cls: 'thick', hs: 9 });
    g.label(258, 168, '\\mathbf S', 'l');
    return g.svg();
  }
  // energy density of the standing wave at two instants: all magnetic at wt = 0, all electric at wt = 90 deg
  const sloshFig = () => PF.plot({
    w: 380, h: 190, x: [0, 0.5], y: [0, 1.35], xl: 'z', yl: 'w/2\\epsilon E_0^2',
    xt: [[0.125, '\\tfrac{\\lambda}{8}'], [0.25, '\\tfrac{\\lambda}{4}'], [0.375, '\\tfrac{3\\lambda}{8}'], [0.5, '\\tfrac{\\lambda}{2}']], yt: [[1, '1']],
    curves: [
      { f: (z) => Math.cos(2 * Math.PI * z) ** 2, cls: 'dash', lab: '\\omega t = 0', labAt: 0.05, dx: 6, dy: -14 },
      { f: (z) => Math.sin(2 * Math.PI * z) ** 2, lab: '\\omega t = 90°', labAt: 0.3, dx: 4, dy: -16 },
    ],
  });
  // a thin box (pillbox) around a current sheet: the stored energy vanishes, the outflow equals -J_s . E
  function pillFig() {
    const g = PF.fig({ alt: 'a current sheet seen edge-on with a thin dashed box around it; Poynting arrows leave through both faces of the box' });
    const X = 170;
    g.sheet(X, 20, 180);
    g.rect(X - 18, 40, 36, 120, { cls: 'dash dim' });
    g.label(X + 6, 22, '\\mathbf J_s', 'tl', 'small');
    g.arrow(X + 24, 100, X + 104, 100, { cls: 'thick', hs: 9 });
    g.label(X + 64, 93, '\\mathbf S', 'b');
    g.arrow(X - 24, 100, X - 104, 100, { cls: 'thick', hs: 9 });
    g.label(X - 64, 93, '\\mathbf S', 'b');
    g.dim(X - 18, 172, X + 18, 172, 'h', { at: 'b' });
    g.label(X - 22, 44, '\\text{area }A', 'r', 'small');
    return g.svg();
  }

  // ---------------------------------------------------------------- lesson 1: the theorem
  EM.lesson('w1', {
    id: 'w1-poynting', topic: 3, ref: 'Lecture 20', title: 'The Poynting theorem, derived',
    steps: [
      RF(md`
        !!key Why you care
          Energy questions are on every Exam 3. Prof. Chen's Spring 2024 paper asked you to judge five statements about $\mathbf S$ and $\nabla\cdot\mathbf S$ for a wave in a good conductor (SP24 #2(c)). Fall 2023 asked whether $\tfrac12\epsilon_0\mathbf E\cdot\mathbf E + \tfrac12\mu_0\mathbf H\cdot\mathbf H$ is zero in a standing wave (FA23 #1(c)). The homework asks whether energy is being stored or released inside a box, given $\mathbf S$ on its faces (the skill HW 8 #3(g) asks for). All three are one equation, the **Poynting theorem**, and it is on your formula sheet. In Exam 2 ([Topic 17](#/l/t17-poynting)) you used $\mathbf S = \mathbf E\times\mathbf H$ for one plane wave. Here you derive the theorem from Maxwell's equations, line by line, so you know what every term means and when one of them is zero.

        ### Notation

        - $\mathbf E$ (V/m) and $\mathbf H$ (A/m): the fields at one point and one instant. In a simple material $\mathbf D = \epsilon\mathbf E$ and $\mathbf B = \mu\mathbf H$, with $\epsilon$ and $\mu$ constants.
        - $\mathbf J$ (A/m²): the **current density** of free charges. In a conductor $\mathbf J = \sigma\mathbf E$. It can also be a current that something else drives: a battery, a generator, a current sheet.
        - $\mathbf S = \mathbf E\times\mathbf H$ (W/m²): the **Poynting vector**, energy flow per unit area per unit time.
        - $w_e = \tfrac12\epsilon\,\mathbf E\cdot\mathbf E$ and $w_m = \tfrac12\mu\,\mathbf H\cdot\mathbf H$ (J/m³): the **electric and magnetic energy densities**; $w = w_e + w_m$. Note $\mathbf E\cdot\mathbf E = E^2$, the squared length of $\mathbf E$.
        - $\mathbf J\cdot\mathbf E$ (W/m³): the power per unit volume the field hands to the charges.
        - $\nabla\cdot\mathbf S$ (W/m³): the **divergence**: the net energy flowing out of a tiny box around a point, per unit volume of the box.
        - $V$ and $A$: a volume and the closed surface around it. $d\mathbf A$ points **outward**. $\oint_A$ means "integrate over the whole closed surface". $W = \int_V w\,dV$ is the field energy inside, in J.
        - $\partial_x$ is short for $\partial/\partial x$, and $\partial_t$ for $\partial/\partial t$.

        ### 1. What a conservation law looks like

        Start with a law you already have: charge. Take a small box. The charge inside can change for one reason only: current carries charge in or out through the walls. On your sheet that is the **continuity equation**:
        $$\nabla\cdot\mathbf J + \frac{\partial\rho}{\partial t} = 0$$
        Read it term by term. $\nabla\cdot\mathbf J$ is the net current flowing **out** of a tiny box, per unit volume. $\partial\rho/\partial t$ is how fast the stored charge grows. Their sum is zero: whatever flows out is lost from storage.

        Energy can do one more thing that charge cannot. It can change form. A field can give its energy to moving charges, which turn it into heat, or chemical energy, or motion. So an energy law needs three slots:
        $$\begin{aligned}&(\text{net flow out}) + (\text{growth of storage})\\ &\quad + (\text{handed to charges}) = 0\end{aligned}$$
        Your job in this lesson: find the field quantities that fill the three slots. Nothing is guessed. Everything comes out of Faraday's law and Ampère's law.
      `, {}),
      Q(md`**Predict.** A small closed box has 3 A flowing in through one wall and 5 A flowing out through another. No other wall carries current. The charge inside changes at…`,
        [md`$-2$ C/s`, md`$+2$ C/s`, md`$+8$ C/s`, md`$0$ C/s`], 0,
        [null, md`That has the sign backward. More leaves than enters, so the charge inside falls.`, md`That adds the two currents. Current in raises the charge and current out lowers it, so they partly cancel.`, md`That would need the same current in and out. Here 2 A more leaves than enters.`],
        md`Net outflow: $5 - 3 = 2$ A. Continuity says the stored charge falls at the rate it flows out: $dQ/dt = -2$ C/s. The energy law has the same shape, plus one extra slot for energy that changes form.`),
      R(md`
        ### 2. Dot the two curl equations

        Write Faraday's law and Ampère's law for a simple material, with the current kept in. Both are on your sheet; put in $\mathbf B = \mu\mathbf H$ and $\mathbf D = \epsilon\mathbf E$:
        $$\nabla\times\mathbf E = -\mu\frac{\partial\mathbf H}{\partial t} \qquad\text{(1)}$$
        $$\nabla\times\mathbf H = \mathbf J + \epsilon\frac{\partial\mathbf E}{\partial t} \qquad\text{(2)}$$
        We want a power per unit volume, W/m³. One product already has those units: $\mathbf J\cdot\mathbf E$, since (A/m²)(V/m) = W/m³. It appears if you take the dot product of (2) with $\mathbf E$:
        $$\mathbf E\cdot(\nabla\times\mathbf H) = \mathbf E\cdot\mathbf J + \epsilon\,\mathbf E\cdot\frac{\partial\mathbf E}{\partial t} \qquad\text{(3)}$$
        To treat the magnetic side the same way, take the dot product of (1) with $\mathbf H$:
        $$\mathbf H\cdot(\nabla\times\mathbf E) = -\mu\,\mathbf H\cdot\frac{\partial\mathbf H}{\partial t} \qquad\text{(4)}$$
        Check the units of the left side of (4). $\nabla\times\mathbf E$ is (V/m) per meter. Times $\mathbf H$ in A/m, that is V·A per m³, which is W/m³. ✓ Every term in (3) and (4) is a power per unit volume.

        !!intuition Does this make sense?
          A dot product keeps only the part of one vector that lies along the other. So $\mathbf J\cdot\mathbf E$ counts only current that flows along the field. Current that flows across the field takes no work from it, just as a force does no work on motion perpendicular to it.
      `),
      Q(md`**Predict.** At a point, $\mathbf E = 200\,\hat x$ V/m and $\mathbf J = 3\hat x + 4\hat y$ A/m². Then $\mathbf J\cdot\mathbf E$ is…`,
        [md`$600$ W/m³`, md`$1000$ W/m³`, md`$1400$ W/m³`, md`$800$ W/m³`], 0,
        [null, md`That multiplies the sizes, $|\mathbf J||\mathbf E| = (5)(200)$. A dot product keeps only the part of $\mathbf J$ along $\mathbf E$.`, md`That multiplies both components of $\mathbf J$ by 200 and adds them. But $\hat y\cdot\hat x = 0$: the $y$-current gets nothing.`, md`That uses the $y$-component. The $y$-current flows across the field and takes no power from it.`],
        md`$\mathbf J\cdot\mathbf E = (3)(200) + (4)(0) = 600$ W/m³. The current along $\hat y$ crosses the field and does not take energy from it.`),
      R(md`
        ### 3. The time derivatives are energy densities

        Look at the last term of (3): $\mathbf E\cdot\partial\mathbf E/\partial t$. Write $\mathbf E\cdot\mathbf E$ in components:
        $$\mathbf E\cdot\mathbf E = E_x^2 + E_y^2 + E_z^2$$
        Differentiate each square in time with the chain rule, $\partial_t(E_x^2) = 2E_x\,\partial_tE_x$, and add the three. The sum $E_x\partial_tE_x + E_y\partial_tE_y + E_z\partial_tE_z$ is itself a dot product:
        $$\frac{\partial}{\partial t}(\mathbf E\cdot\mathbf E) = 2\,\mathbf E\cdot\frac{\partial\mathbf E}{\partial t}$$
        Divide by 2 and multiply by the constant $\epsilon$:
        $$\epsilon\,\mathbf E\cdot\frac{\partial\mathbf E}{\partial t} = \frac{\partial}{\partial t}\Big(\tfrac12\epsilon\,\mathbf E\cdot\mathbf E\Big)$$
        The bracket is the electric energy density $w_e$, the same $\tfrac12\epsilon E^2$ as the energy of a charged capacitor per unit volume. So
        $$\epsilon\,\mathbf E\cdot\frac{\partial\mathbf E}{\partial t} = \frac{\partial w_e}{\partial t}$$
        The same three steps for $\mathbf H$ give
        $$\mu\,\mathbf H\cdot\frac{\partial\mathbf H}{\partial t} = \frac{\partial w_m}{\partial t}$$
        Put these into (3) and (4):
        $$\mathbf E\cdot(\nabla\times\mathbf H) = \mathbf J\cdot\mathbf E + \frac{\partial w_e}{\partial t} \qquad\text{(5)}$$
        $$\mathbf H\cdot(\nabla\times\mathbf E) = -\frac{\partial w_m}{\partial t} \qquad\text{(6)}$$
        Two of the three slots are filled: storage ($w_e$, $w_m$) and "handed to charges" ($\mathbf J\cdot\mathbf E$). The left sides must give the flow.

        !!intuition Does this make sense?
          $\epsilon\,\mathbf E\cdot\partial\mathbf E/\partial t$ is the displacement current $\epsilon\,\partial\mathbf E/\partial t$ times $\mathbf E$. It is positive while $|\mathbf E|$ grows and negative while it shrinks. Displacement current "charges up" the field the way a current charges a capacitor, and gives the energy back when the field falls.
      `),
      Q(md`**Predict.** At a point in a dielectric, $\mathbf E = 10\cos(\omega t)\,\hat x$ V/m. At the instant $\omega t = 30°$, the electric energy density there is…`,
        ['decreasing', 'increasing', 'momentarily not changing', 'negative'], 0,
        [null, md`$E$ is still positive, but it passed its peak at $\omega t = 0$ and is shrinking toward zero.`, md`That happens only where $E$ or $\partial E/\partial t$ is zero: at $\omega t = 0°, 90°, 180°, \ldots$`, md`$w_e = \tfrac12\epsilon E^2$ is never negative. Its rate of change can be.`],
        md`$\partial w_e/\partial t = \epsilon\,E\,\partial E/\partial t = \epsilon(10\cos\omega t)(-10\omega\sin\omega t) = -50\epsilon\omega\sin2\omega t$. At $\omega t = 30°$, $\sin60° > 0$, so the rate is negative: the stored electric energy is falling.`),
      R(md`
        ### 4. The left sides: one vector identity

        The left sides of (5) and (6) are each a field dotted with the curl of the other field. One identity joins them:
        $$\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)$$
        It is not on your sheet, so here is the proof. It uses only the cross product and the product rule.

        **Step 1.** Write the three components of $\mathbf E\times\mathbf H$:
        $$(\mathbf E\times\mathbf H)_x = E_yH_z - E_zH_y$$
        $$(\mathbf E\times\mathbf H)_y = E_zH_x - E_xH_z$$
        $$(\mathbf E\times\mathbf H)_z = E_xH_y - E_yH_x$$
        **Step 2.** The divergence differentiates the $x$-component by $x$, the $y$-component by $y$, the $z$-component by $z$, and adds the three. That is six products to differentiate.

        **Step 3.** Each product splits in two by the product rule. The first one:
        $$\partial_x(E_yH_z) = H_z\,\partial_xE_y + E_y\,\partial_xH_z$$
        Six products, two pieces each: twelve terms. In six of them a component of $\mathbf E$ is differentiated. In the other six, a component of $\mathbf H$.

        **Step 4.** Collect the six terms where $\mathbf E$ is differentiated, grouped by the component of $\mathbf H$ in front:
        $$H_x(\partial_yE_z - \partial_zE_y)$$
        $$+\,H_y(\partial_zE_x - \partial_xE_z)$$
        $$+\,H_z(\partial_xE_y - \partial_yE_x)$$
        Compare with the curl on your sheet. The three brackets are exactly $(\nabla\times\mathbf E)_x$, $(\nabla\times\mathbf E)_y$ and $(\nabla\times\mathbf E)_z$. So these six terms add up to $\mathbf H\cdot(\nabla\times\mathbf E)$.

        **Step 5.** Now the six terms where $\mathbf H$ is differentiated:
        $$E_x(\partial_zH_y - \partial_yH_z)$$
        $$+\,E_y(\partial_xH_z - \partial_zH_x)$$
        $$+\,E_z(\partial_yH_x - \partial_xH_y)$$
        Each bracket is a component of $\nabla\times\mathbf H$ with its two terms in the opposite order, so it is **minus** that component. These six terms add up to $-\mathbf E\cdot(\nabla\times\mathbf H)$.

        **Step 6.** Add Steps 4 and 5:
        $$\boxed{\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)}$$

        !!intuition Does this make sense?
          Swap the letters: $\mathbf H\times\mathbf E = -\mathbf E\times\mathbf H$, so the left side flips sign. The right side becomes $\mathbf E\cdot(\nabla\times\mathbf H) - \mathbf H\cdot(\nabla\times\mathbf E)$, which also flips sign. ✓ The minus sign in the identity is the antisymmetry of the cross product.
      `),
      Q(md`**Predict.** By the same identity, $\nabla\cdot(\mathbf H\times\mathbf E)$ equals…`,
        [md`$\mathbf E\cdot(\nabla\times\mathbf H) - \mathbf H\cdot(\nabla\times\mathbf E)$`, md`$\mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)$`, md`$\mathbf H\cdot(\nabla\times\mathbf E) + \mathbf E\cdot(\nabla\times\mathbf H)$`, md`$0$, for any two fields`], 0,
        [null, md`That is $\nabla\cdot(\mathbf E\times\mathbf H)$. Swapping the order of a cross product flips its sign, so the answer must flip too.`, md`The two terms come from the two halves of each product rule, with opposite signs from the cross product. They never both carry a plus sign.`, md`$\nabla\cdot(\nabla\times\mathbf A) = 0$ is a different identity. A cross product of two fields can have any divergence.`],
        md`In the identity, put $\mathbf H$ where $\mathbf E$ was and $\mathbf E$ where $\mathbf H$ was: $\nabla\cdot(\mathbf H\times\mathbf E) = \mathbf E\cdot(\nabla\times\mathbf H) - \mathbf H\cdot(\nabla\times\mathbf E)$. It is minus $\nabla\cdot(\mathbf E\times\mathbf H)$, as it must be.`),
      R(md`
        ### 5. Put it together: the theorem at a point

        Subtract (5) from (6). The left side is
        $$\mathbf H\cdot(\nabla\times\mathbf E) - \mathbf E\cdot(\nabla\times\mathbf H)$$
        and the right side is
        $$-\frac{\partial w_m}{\partial t} - \mathbf J\cdot\mathbf E - \frac{\partial w_e}{\partial t}$$
        By the identity of Section 4, the left side is $\nabla\cdot(\mathbf E\times\mathbf H)$. Call $\mathbf S = \mathbf E\times\mathbf H$ and set the two sides equal:
        $$\nabla\cdot\mathbf S = -\frac{\partial w_e}{\partial t} - \frac{\partial w_m}{\partial t} - \mathbf J\cdot\mathbf E$$
        Move everything to the left and combine $w = w_e + w_m$:
        $$\boxed{\nabla\cdot\mathbf S + \frac{\partial w}{\partial t} + \mathbf J\cdot\mathbf E = 0}$$
        with
        $$\mathbf S = \mathbf E\times\mathbf H, \qquad w = \tfrac12\epsilon E^2 + \tfrac12\mu H^2$$
        That is the line on your sheet, $\nabla\cdot\mathbf S + \partial_t(\tfrac12\mathbf D\cdot\mathbf E + \tfrac12\mathbf B\cdot\mathbf H) + \mathbf J\cdot\mathbf E = 0$, because $\mathbf D\cdot\mathbf E = \epsilon E^2$ and $\mathbf B\cdot\mathbf H = \mu H^2$.

        Now line it up with the continuity equation, slot by slot:

        | Slot | Charge | Energy |
        |---|---|---|
        | flow per unit area | $\mathbf J$ (A/m²) | $\mathbf S$ (W/m²) |
        | stored per unit volume | $\rho$ (C/m³) | $w$ (J/m³) |
        | net flow out of a point | $\nabla\cdot\mathbf J$ | $\nabla\cdot\mathbf S$ |
        | changed into another form | nothing | $\mathbf J\cdot\mathbf E$ |

        $\mathbf S$ sits exactly in the slot that $\mathbf J$ holds for charge. That is why $\mathbf E\times\mathbf H$ is called the energy flux: the theorem puts it there, nobody chose it.

        !!intuition Does this make sense?
          Units: $\nabla\cdot\mathbf S$ is (W/m²)/m = W/m³; $\partial w/\partial t$ is (J/m³)/s = W/m³; $\mathbf J\cdot\mathbf E$ is W/m³. ✓ And with no fields at all, every term is zero.
      `),
      Q(md`**Predict.** In empty space ($\mathbf J = 0$), at some point and instant, $\partial w/\partial t = -5$ W/m³. Then $\nabla\cdot\mathbf S$ there is…`,
        [md`$+5$ W/m³: energy flows away from the point`, md`$-5$ W/m³: energy flows toward the point`, md`$0$: nothing converts energy in empty space`, md`impossible to say without $\mathbf E$ and $\mathbf H$`], 0,
        [null, md`Then energy would be flowing in while the stored energy falls. It would have to vanish somewhere, and with $\mathbf J = 0$ it has nowhere to go.`, md`$\mathbf J\cdot\mathbf E = 0$ does not make the other two terms zero. It makes them equal and opposite.`, md`With $\mathbf J\cdot\mathbf E = 0$ the theorem fixes $\nabla\cdot\mathbf S = -\partial w/\partial t$ without any more information.`],
        md`$\nabla\cdot\mathbf S = -\partial w/\partial t - \mathbf J\cdot\mathbf E = -(-5) - 0 = +5$ W/m³. The stored energy falls because it flows away.`),
      RF(md`
        ### 6. The box form: any region at all

        The point form talks about one point. Exams ask about boxes, slabs and wires. So integrate each term of the theorem over a volume $V$.

        **The flow term.** The **divergence theorem** turns the volume integral of a divergence into the flux through the closed surface $A$:
        $$\int_V\nabla\cdot\mathbf S\,dV = \oint_A\mathbf S\cdot d\mathbf A$$
        Why it is true: chop $V$ into tiny boxes. $\nabla\cdot\mathbf S\,dV$ is the net outflow of one tiny box. Where two boxes touch, what leaves one enters the other, so those inner flows cancel in the sum. Only the flow through the outer surface survives.

        **The storage term.** The volume does not move, so the time derivative can come outside the integral:
        $$\int_V\frac{\partial w}{\partial t}\,dV = \frac{d}{dt}\int_Vw\,dV = \frac{dW}{dt}$$
        where $W$ is the total field energy inside, in joules.

        **Put the three together:**
        $$\boxed{\oint_A\mathbf S\cdot d\mathbf A + \frac{dW}{dt} + \int_V\mathbf J\cdot\mathbf E\,dV = 0}$$

        [[fig:box]]

        The most useful way to read it moves the flow to the other side. Call $P_{\text{in}} = -\oint_A\mathbf S\cdot d\mathbf A$ the net power flowing **in**, and $P_{\text{heat}} = \int_V\mathbf J\cdot\mathbf E\,dV$ the power handed to charges inside:
        $$\boxed{P_{\text{in}} = \frac{dW}{dt} + P_{\text{heat}}}$$
        Energy that flows in is either stored or handed to the charges. Nothing else can happen to it.

        !!intuition Does this make sense?
          $d\mathbf A$ points outward, so $\mathbf S\cdot d\mathbf A > 0$ where energy leaves. The minus sign in $P_{\text{in}}$ turns outflow into inflow. When you set up a box on an exam, say which way $d\mathbf A$ points on each face. It costs five seconds and saves the sign.
      `, { box: { svg: boxFig(), cap: 'The bookkeeping for any region: power in through the surface = rate of storage + power to the charges inside.' } }),
      Q(md`**Predict.** 10 W of electromagnetic power flows in through a closed surface, and the field energy inside is not changing. The power handed to charges inside is…`,
        [md`$10$ W`, md`$-10$ W`, md`$0$ W`, md`$20$ W`], 0,
        [null, md`$P_{\text{heat}} = P_{\text{in}} - dW/dt = 10 - 0$. The sign is positive: the charges absorb.`, md`The inflow has to go somewhere. Storage is constant, so it all goes to the charges.`, md`That counts the 10 W twice, once flowing in and once again for the charges.`],
        md`$P_{\text{in}} = dW/dt + P_{\text{heat}}$, so $P_{\text{heat}} = 10 - 0 = 10$ W. This is a resistor in steady state: everything that flows in becomes heat.`),
      R(md`
        ### 7. What each term means, and its sign

        | Term | Meaning | Units | Negative means |
        |---|---|---|---|
        | $\mathbf S = \mathbf E\times\mathbf H$ | energy flow per unit area; points the way energy moves | W/m² | a vector: its direction tells the way |
        | $\nabla\cdot\mathbf S$ | net energy flowing out of a point | W/m³ | net inflow at that point |
        | $\partial w/\partial t$ | how fast stored field energy grows | W/m³ | the field is giving energy back |
        | $\mathbf J\cdot\mathbf E$ | power handed from the field to charges | W/m³ | the charges give energy to the field |

        The sign of $\mathbf J\cdot\mathbf E$ tells you what the charges are doing.

        - **$\mathbf J\cdot\mathbf E > 0$: a load.** Current flows along $\mathbf E$. The field pushes the charges and does work on them. In a conductor $\mathbf J = \sigma\mathbf E$, so $\mathbf J\cdot\mathbf E = \sigma E^2 \ge 0$ at every instant. That is Ohmic heat, also called Joule heating.
        - **$\mathbf J\cdot\mathbf E < 0$: a source.** Something else drives the current **against** $\mathbf E$: chemistry in a battery, a generator, whatever drives a current sheet. The charges give energy to the field. $-\mathbf J\cdot\mathbf E$ is the power per unit volume the source injects.
        - **$\mathbf J\cdot\mathbf E = 0$: nothing converts.** Vacuum and perfect dielectrics have $\mathbf J = 0$. There energy can only flow and be stored, and the theorem becomes $\nabla\cdot\mathbf S = -\partial w/\partial t$.

        That last line is the trap in SP24 #2(c)(i), which says "$-\nabla\cdot\mathbf S$ equals the time rate of change of the stored energy density" for a wave in a good conductor. It is **false** there, because $\mathbf J\cdot\mathbf E = \sigma E^2$ is large. The true statement is $-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$.

        !!intuition Does this make sense?
          In a circuit, $p = vi$ is the power an element absorbs, and a battery that delivers power has $p < 0$. $\mathbf J\cdot\mathbf E$ is the same idea per unit volume: $\mathbf E$ plays the voltage per meter and $\mathbf J$ the current per square meter.
      `),
      Q(md`**Predict.** A current sheet on $z = 0$ carries $\mathbf J_s = -2\,\hat x$ A/m at an instant when the field at the sheet is $\mathbf E = +377\,\hat x$ V/m. Per square meter of sheet, $\mathbf J_s\cdot\mathbf E$ is…`,
        [md`$-754$ W/m², so the sheet is a source`, md`$+754$ W/m², so the sheet is a load`, md`$-754$ W/m², so the sheet is a load`, md`$0$, because the sheet has no thickness`], 0,
        [null, md`$(-2)(+377) = -754$. The current points against the field, so the sign is negative.`, md`The number is right, but a negative $\mathbf J\cdot\mathbf E$ means the charges give energy to the field: a source.`, md`A thin sheet still carries current per meter; its $\mathbf J_s\cdot\mathbf E$ is a power per square meter of sheet, and it is not zero here.`],
        md`$\mathbf J_s\cdot\mathbf E = (-2)(377) = -754$ W/m². Negative: the current is pushed against the field, so the sheet hands 754 W/m² to the fields. That power leaves as two waves, 377 W/m² on each side.`),
      RF(md`
        ### 8. Energy that sloshes: the standing wave

        This is FA23 #1(c). Take two equal waves in a lossless medium, traveling in opposite directions:
        $$E_x = E_0\cos(\omega t - \beta z) - E_0\cos(\omega t + \beta z)$$
        A metal wall at $z = 0$ makes exactly this pattern ([Topic 12](#/l/w4-standing) builds it); here you only need its energy. Use $\cos A - \cos B = -2\sin\tfrac{A+B}{2}\sin\tfrac{A-B}{2}$. Here $\tfrac{A+B}{2} = \omega t$ and $\tfrac{A-B}{2} = -\beta z$, and $\sin(-\beta z) = -\sin\beta z$:
        $$E_x = 2E_0\sin\beta z\,\sin\omega t$$
        Each wave brings its own $H$. Forward: $H_y = +E_x/\eta$. Backward: $H_y = -E_x/\eta$ ([Topic 5](#/l/w2-gamma)). The backward $E$ is $-E_0\cos(\omega t + \beta z)$, so its $H_y$ is $+\tfrac{E_0}{\eta}\cos(\omega t + \beta z)$:
        $$H_y = \frac{E_0}{\eta}\big[\cos(\omega t - \beta z) + \cos(\omega t + \beta z)\big]$$
        With $\cos A + \cos B = 2\cos\tfrac{A+B}{2}\cos\tfrac{A-B}{2}$:
        $$H_y = \frac{2E_0}{\eta}\cos\beta z\,\cos\omega t$$
        **The energy density.** Square each field. For the magnetic part use $\mu/\eta^2 = \mu\epsilon/\mu = \epsilon$:
        $$w_e = 2\epsilon E_0^2\sin^2\!\beta z\,\sin^2\!\omega t$$
        $$w_m = 2\epsilon E_0^2\cos^2\!\beta z\,\cos^2\!\omega t$$
        Is $w = w_e + w_m$ zero? Only where both terms vanish at once: for example at $z = 0$ (where $\sin\beta z = 0$) at the instant $\omega t = 90°$ (where $\cos\omega t = 0$). Those are isolated points at isolated instants. Everywhere else $w > 0$. So "$\tfrac12\epsilon_0\mathbf E\cdot\mathbf E + \tfrac12\mu_0\mathbf H\cdot\mathbf H = 0$ in a standing wave" is **false**, which is the FA23 key's answer.

        **The flow.** Multiply $E_x$ and $H_y$:
        $$S_z = \frac{4E_0^2}{\eta}\sin\beta z\cos\beta z\,\sin\omega t\cos\omega t$$
        Use $2\sin x\cos x = \sin2x$ twice:
        $$S_z = \frac{E_0^2}{\eta}\sin2\beta z\,\sin2\omega t$$
        $S_z = 0$ at all times at $z = 0, \tfrac{\lambda}{4}, \tfrac{\lambda}{2}, \ldots$, where $\sin2\beta z = 0$: at every node of $E$ and every node of $H$. No energy ever crosses those planes. Between two of them, the energy sloshes back and forth, twice per period.

        [[fig:slosh]]

        **Check it with the theorem.** No current, so $\partial S_z/\partial z + \partial w/\partial t$ must be zero. Differentiate $S_z$:
        $$\frac{\partial S_z}{\partial z} = \frac{2\beta E_0^2}{\eta}\cos2\beta z\,\sin2\omega t$$
        Differentiate $w$, using $\partial_t\sin^2\omega t = \omega\sin2\omega t$ and $\partial_t\cos^2\omega t = -\omega\sin2\omega t$:
        $$\frac{\partial w}{\partial t} = 2\epsilon\omega E_0^2\sin2\omega t\,(\sin^2\!\beta z - \cos^2\!\beta z)$$
        and $\sin^2 - \cos^2 = -\cos2\beta z$:
        $$\frac{\partial w}{\partial t} = -2\epsilon\omega E_0^2\cos2\beta z\,\sin2\omega t$$
        The two cancel exactly when $\beta/\eta = \epsilon\omega$. And $\beta/\eta = \omega\sqrt{\mu\epsilon}/\sqrt{\mu/\epsilon} = \omega\epsilon$. ✓

        **The energy in one cell.** Integrate $w$ over $0 < z < \lambda/4$, per square meter. Over a quarter wavelength, $\sin^2\beta z$ and $\cos^2\beta z$ each average to $\tfrac12$, so each integral is $\lambda/8$:
        $$W = 2\epsilon E_0^2\Big(\tfrac{\lambda}{8}\sin^2\omega t + \tfrac{\lambda}{8}\cos^2\omega t\Big)$$
        and $\sin^2 + \cos^2 = 1$:
        $$W = \frac{\epsilon E_0^2\lambda}{4}$$
        Constant in time, as the box form demands: no current inside, and $S = 0$ on both faces. The energy is never lost. It changes form, magnetic near $z = 0$, electric near $z = \lambda/4$, and back.
      `, { slosh: { svg: sloshFig(), cap: 'Energy density of the standing wave. Dashed: at $\\omega t = 0$, when $E = 0$ and all the energy is magnetic, piled near $z = 0$ and $\\lambda/2$. Solid: a quarter period later, all electric, piled near $\\lambda/4$. No energy crosses $z = 0$, $\\lambda/4$ or $\\lambda/2$.' } }),
      Q(md`**Predict.** In that standing wave, at $z = \lambda/8$ and $t = 0$, the energy density is…`,
        ['all magnetic', 'all electric', 'half electric and half magnetic', 'zero'], 0,
        [null, md`At $t = 0$, $\sin\omega t = 0$, so $E = 0$ everywhere at that instant.`, md`At $z = \lambda/8$ the space factors $\sin^2\beta z$ and $\cos^2\beta z$ are equal, but the time factors are $\sin^2 0 = 0$ and $\cos^2 0 = 1$.`, md`$H_y = (2E_0/\eta)\cos(\pi/4)\cos0 \neq 0$, so the magnetic energy is not zero.`],
        md`At $t = 0$: $w_e \propto \sin^2\omega t = 0$ and $w_m = 2\epsilon E_0^2\cos^2(\pi/4) = \epsilon E_0^2$. All of it is magnetic.`),
      RF(md`
        ### The method

        !!method The Poynting theorem on an exam
          1. **Pick the region.** Say which way $d\mathbf A$ points on each face (outward).
          2. **Flow.** Find $\mathbf S = \mathbf E\times\mathbf H$ on each face. When $\mathbf S$ is uniform over a face, the power out through it is $(\mathbf S\cdot\hat n)\times(\text{area})$. Add the faces with signs: out is positive.
          3. **Conversion.** $\mathbf J\cdot\mathbf E$ inside: $\sigma E^2$ in a conductor (positive), $\mathbf J_s\cdot\mathbf E$ per m² on a driven sheet (negative: it supplies), zero in vacuum and perfect dielectrics.
          4. **Storage.** $dW/dt = P_{\text{in}} - P_{\text{heat}}$. Its sign tells you stored (+) or released (−).
          5. **Check.** Units (W). One limit: in steady DC nothing changes, so $dW/dt = 0$ and $P_{\text{in}} = P_{\text{heat}}$.

        ### Worked example 1: energy enters a resistive wire from the side

        !!graded Problem
          A straight wire of radius $a = 1$ mm and length $L = 2$ m has conductivity $\sigma = 10^7/\pi$ S/m and carries a steady current $I = 5$ A along $+\hat z$. Find $\mathbf E$ inside, $\mathbf H$ at its surface, $\mathbf S$ at its surface, and the total power flowing in through its side. Compare with $I^2R$.

        **Step 1: the resistance.** The cross-section is $\pi a^2 = \pi\times10^{-6}$ m², so
        $$R = \frac{L}{\sigma\pi a^2} = \frac{2}{(10^7/\pi)(\pi\times10^{-6})}$$
        The $\pi$ cancels and $10^7\times10^{-6} = 10$:
        $$R = \frac{2}{10} = 0.2\ \Omega$$
        **Step 2: E inside.** The current spreads evenly over the cross-section, $J = I/\pi a^2$, and $E = J/\sigma$:
        $$E = \frac{I}{\sigma\pi a^2} = \frac{5}{10} = 0.5\ \text{V/m}$$
        along $+\hat z$, with the current. Check: $EL = 1$ V and $IR = (5)(0.2) = 1$ V. ✓ Just outside the wire the tangential $E$ is the same (tangential $\mathbf E$ is continuous), so $\mathbf E = 0.5\,\hat z$ V/m on the surface too.

        **Step 3: H at the surface.** Ampère's law around a circle of radius $a$ encloses all of $I$: $H(2\pi a) = I$.
        $$H = \frac{I}{2\pi a} = \frac{5}{2\pi\times10^{-3}} \approx 796\ \text{A/m}$$
        By the right-hand rule it circles the wire, along $\hat\phi$.

        **Step 4: S at the surface.** $\mathbf S = \mathbf E\times\mathbf H = EH\,(\hat z\times\hat\phi)$, and $\hat z\times\hat\phi = -\hat r$: **into** the wire.
        $$|\mathbf S| = (0.5)(796) \approx 398\ \text{W/m}^2$$
        **Step 5: total power in.** $\mathbf S$ is the same all over the side, whose area is $2\pi aL$:
        $$P_{\text{in}} = \frac{I}{\sigma\pi a^2}\cdot\frac{I}{2\pi a}\cdot2\pi aL$$
        The $2\pi a$ cancels:
        $$P_{\text{in}} = I^2\,\frac{L}{\sigma\pi a^2} = I^2R$$
        Numbers: $(25)(0.2) = 5$ W. The end faces carry nothing, because $\mathbf S$ is radial and has no $z$-component.

        **Step 6: the theorem.** Steady DC, so $dW/dt = 0$ and $P_{\text{in}} = P_{\text{heat}}$. Inside, $\mathbf J\cdot\mathbf E = \sigma E^2$ over the volume $\pi a^2L$ gives $(10^7/\pi)(0.25)(2\pi\times10^{-6}) = 5$ W. ✓

        [[fig:wire]]

        !!intuition Does this make sense?
          The energy does not travel inside the wire along the current. It travels through the space around the wire, guided by the fields, and enters the wire from the side, where it becomes heat. The battery sends it out through the fields; the wire only receives it.

        **Speed path.** $P_{\text{in}} = EH(2\pi aL) = (E L)(H\,2\pi a) = V\cdot I$. Voltage times current: you know the answer before you start.

        **Where points go.** Writing $\mathbf S$ outward (it points in, toward the load); multiplying by the end-face area $\pi a^2$ instead of the side area; forgetting that tangential $\mathbf E$ is the same just outside.
      `, { wire: { svg: wireFig(), cap: 'A wire carrying current to the right. $\\mathbf E$ points along the wire, $\\mathbf H$ circles it (out of the page above, into it below), so $\\mathbf S = \\mathbf E\\times\\mathbf H$ points into the wire from every side.' } }),
      RF(md`
        ### Worked example 2: a box with no sources, storing or releasing?

        !!graded Problem
          In a lossless dielectric with $\epsilon_r = 4$ and $\mu_r = 1$, the wave $\mathbf E = 30\cos(\omega t - 2\pi z)\,\hat x$ V/m travels at $f = 150$ MHz ($z$ in meters). A box has 1 m² faces on the planes $z = 0$ and $z = 1/8$ m. Find the net power flowing into the box at $t = 0$, and say whether its stored energy is growing or shrinking. Repeat at the instant $\omega t = 45°$.

        **Step 1: the medium.** $\eta = 120\pi/\sqrt4 = 60\pi\ \Omega$ and $v = c/2 = 1.5\times10^8$ m/s. Then $\lambda = v/f = 1$ m, so $\beta = 2\pi$ rad/m, consistent with the wave as written. ✓

        **Step 2: H.** The wave travels toward $+z$, so $\mathbf H = (E_0/\eta)\cos(\omega t - 2\pi z)\,\hat y$ with $E_0/\eta = 30/60\pi = 1/2\pi$ A/m.

        **Step 3: S.** $\hat x\times\hat y = \hat z$, and the amplitude is $E_0^2/\eta = 900/60\pi = 15/\pi$:
        $$S_z = \frac{15}{\pi}\cos^2(\omega t - 2\pi z)\ \ \text{W/m}^2$$
        **Step 4: at t = 0.** On the face $z = 0$ the phase is 0 and $\cos^2 = 1$: $15/\pi$ W flows in through it. On the face $z = 1/8$ m the phase is $-\pi/4$ and $\cos^2 = \tfrac12$: $7.5/\pi$ W flows out.
        $$P_{\text{in}} = \frac{15}{\pi} - \frac{7.5}{\pi} = \frac{7.5}{\pi} \approx 2.39\ \text{W}$$
        **Step 5: the theorem.** A perfect dielectric has $\mathbf J = 0$, so $dW/dt = P_{\text{in}} = +2.39$ W. The box is **storing** energy.

        **Step 6: at ωt = 45°.** Face $z = 0$: phase $45°$, $\cos^2 = \tfrac12$, so $7.5/\pi$ W in. Face $z = 1/8$: phase $45° - 45° = 0$, $\cos^2 = 1$, so $15/\pi$ W out.
        $$P_{\text{in}} = \frac{7.5}{\pi} - \frac{15}{\pi} = -2.39\ \text{W}$$
        The box is **releasing** energy at 2.39 W.

        **Check.** Integrate $w = \epsilon E^2$ over the box and differentiate in time: it gives the same $\pm2.39$ W. Over a full period the two cases balance, and the box gains nothing on average ([Topic 4](#/l/w1-avg) makes this precise).

        **Speed path.** Only the ratio of the two $\cos^2$ values matters: (entry − exit) × $E_0^2/\eta$ × area. Thirty seconds.

        **Where points go.** Treating "$S$ is larger at the far face" as "energy is stored" (it is the opposite); forgetting the area; using $\eta_0$ in the dielectric.

        ### Worked example 3: the power a sheet delivers, from a thin box

        !!graded Problem
          A current sheet on $z = 0$ in a lossless dielectric with $\epsilon_r = 9$, $\mu_r = 1$ carries $\mathbf J_s = -2\cos(\omega t)\,\hat x$ A/m. Using the sheet's fields from your formula sheet, find $-\mathbf J_s\cdot\mathbf E$ at the sheet and $\mathbf S$ on each side, and show that the Poynting theorem holds for a thin box around the sheet. Evaluate at $\omega t = 60°$.

        **Step 1: the medium.** $\eta = 120\pi/3 = 40\pi\ \Omega$.

        **Step 2: the fields.** The sheet's lines read: for $\mathbf J_s = -J_s(t)\hat x$, $E_x = \tfrac{\eta}{2}J_s(t \mp z/v_p)$ and $H_y = \pm\tfrac12J_s(t \mp z/v_p)$ for $z \gtrless 0$. Here $J_s(t) = 2\cos\omega t$:
        $$E_x = 40\pi\cos(\omega t \mp \beta z)\ \text{V/m}$$
        $$H_y = \pm\cos(\omega t \mp \beta z)\ \text{A/m}$$
        **Step 3: at the sheet.** At $z = 0$, $E_x = 40\pi\cos\omega t$:
        $$\mathbf J_s\cdot\mathbf E = (-2\cos\omega t)(40\pi\cos\omega t)$$
        $$-\mathbf J_s\cdot\mathbf E = 80\pi\cos^2\omega t\ \ \text{W/m}^2$$
        Positive at every instant: the sheet is a source.

        **Step 4: S on each side.** For $z > 0$: $S_z = (40\pi\cos)(+\cos) = +40\pi\cos^2(\omega t - \beta z)$, along $+\hat z$. For $z < 0$: $S_z = (40\pi\cos)(-\cos) = -40\pi\cos^2(\omega t + \beta z)$, along $-\hat z$. Both point away from the sheet.

        **Step 5: the thin box.** Take a box of face area $A$ and thickness $h$ around the sheet, and let $h\to0$.
        - **Flow out:** top face $(+40\pi\cos^2\omega t)A$; bottom face, where $d\mathbf A$ points along $-\hat z$, $(-40\pi\cos^2\omega t)(-A) = +40\pi\cos^2\omega t\,A$. The sides have area proportional to $h$ and drop out. Total: $80\pi\cos^2\omega t\,A$.
        - **Storage:** the fields are finite and the volume $Ah\to0$, so $W\to0$.
        - **Conversion:** the sheet is the limit of a current $\mathbf J$ in a layer of thickness $h$ with $\mathbf Jh = \mathbf J_s$. So $\int\mathbf J\cdot\mathbf E\,dV = (\mathbf J\cdot\mathbf E)Ah = A\,\mathbf J_s\cdot\mathbf E = -80\pi\cos^2\omega t\,A$.

        [[fig:pill]]

        Add: $80\pi\cos^2\omega t\,A + 0 - 80\pi\cos^2\omega t\,A = 0$. ✓

        **Step 6: at ωt = 60°.** $\cos^260° = \tfrac14$: the sheet delivers $20\pi \approx 62.8$ W/m², and each side carries $10\pi \approx 31.4$ W/m² away.

        **The rule you keep:** a sheet delivers $-\mathbf J_s\cdot\mathbf E$ per square meter at every instant, and all of it leaves through the two faces.

        **Speed path.** In a uniform medium, $-\mathbf J_s\cdot\mathbf E = \tfrac{\eta}{2}J_s^2$ and each side gets half, $\tfrac{\eta}{4}J_s^2$.

        **Where points go.** Using the lecture's sign convention ($\mathbf J_s = +\hat xf(t)$) with the sheet's formulas; forgetting that the bottom face's $d\mathbf A$ points down; counting only one side.

        ### The whole topic on one table

        | Quantity | Formula | Where it came from |
        |---|---|---|
        | Poynting vector | $\mathbf S = \mathbf E\times\mathbf H$ | the flow slot of the theorem |
        | Energy density | $w = \tfrac12\epsilon E^2 + \tfrac12\mu H^2$ | $\epsilon\mathbf E\cdot\partial_t\mathbf E$ and $\mu\mathbf H\cdot\partial_t\mathbf H$ |
        | Point form | $\nabla\cdot\mathbf S + \partial_tw + \mathbf J\cdot\mathbf E = 0$ | (6) minus (5), plus the identity |
        | Box form | $P_{\text{in}} = dW/dt + P_{\text{heat}}$ | the divergence theorem |
        | Ohmic heat | $\mathbf J\cdot\mathbf E = \sigma E^2 \ge 0$ | $\mathbf J = \sigma\mathbf E$ |
        | Sheet | delivers $-\mathbf J_s\cdot\mathbf E$ per m² | a thin box |
        | Standing wave | $S = 0$ at the nodes; $W$ per $\lambda/4$ constant | $E$ and $H$ are $90°$ apart in $z$ and $t$ |

        !!mistake Common mistakes
          - **Dropping $\mathbf J\cdot\mathbf E$.** "$-\nabla\cdot\mathbf S = \partial w/\partial t$" holds only where $\mathbf J\cdot\mathbf E = 0$. In a conductor most of the inflow becomes heat.
          - **The sign of $\mathbf J\cdot\mathbf E$.** A resistor (load) has $\mathbf J$ along $\mathbf E$: positive. A battery or driven sheet (source) has $\mathbf J$ against $\mathbf E$: negative.
          - **Outflow versus inflow.** $\oint\mathbf S\cdot d\mathbf A$ with outward $d\mathbf A$ is the power **out**. Power in is minus that.
          - **$\mathbf H\times\mathbf E$.** Energy flows along $\mathbf E\times\mathbf H$; the other order points backward.
          - **Mixing points or instants.** $\mathbf S$ multiplies $\mathbf E$ and $\mathbf H$ at the same point and the same instant.
          - **"A standing wave has no energy."** Its flow averages to zero, but $w$ is not zero.
          - **Energy flowing along the inside of a wire.** It enters through the side.

        !!key Speed tricks
          - **Units first.** Every term of the point form is W/m³; every term of the box form is W.
          - **Box with no current:** $dW/dt = (S_{\text{entry}} - S_{\text{exit}})\times\text{area}$. Larger $S$ at the exit face means energy is leaving storage.
          - **Steady DC:** storage is constant, so the power flowing in equals $I^2R = VI$.
          - **Statement test:** "$-\nabla\cdot\mathbf S = \partial w/\partial t$" is false in any lossy medium. "$\mathbf J\cdot\mathbf E < 0$ in a resistor" is always false.
          - **Standing wave:** $S = 0$ at every node of $E$ and of $H$, at all times. Energy never crosses them, and $w$ is zero only at isolated points.
          - **Sheet:** delivers $-\mathbf J_s\cdot\mathbf E$ per m²; in a uniform medium, half to each side.

        ### Check questions
      `, { pill: { svg: pillFig(), cap: 'A thin box of face area $A$ and thickness $h$ around the sheet. As $h\\to0$ it stores nothing, so all the power the sheet delivers leaves through its two faces.' } }),
      Q(md`A wave travels through a good conductor. Which statement holds at every point and instant?`,
        [md`$-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$`, md`$-\nabla\cdot\mathbf S = \partial w/\partial t$`, md`$\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$`, md`$-\nabla\cdot\mathbf S = \mathbf J\cdot\mathbf E$ only`], 0,
        [null, md`That drops the Ohmic term. It is true only where $\mathbf J = 0$; in a good conductor $\sigma E^2$ is the largest term.`, md`That has the sign of $\nabla\cdot\mathbf S$ backward: inflow ($-\nabla\cdot\mathbf S$) feeds the storage and the heat.`, md`That drops the storage term. The stored energy changes within each period, so $\partial w/\partial t$ is not zero at an instant.`],
        md`Rearrange the sheet's theorem: $-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$. Net inflow at a point is either stored or turned into heat. This is the idea SP24 #2(c)(i) tests.`, { src: 'the idea in SP24 #2(c)(i)' }),
      Q(md`FA23 #1(c): "In a region of free space where a standing wave exists, $\tfrac12\epsilon_0\mathbf E\cdot\mathbf E + \tfrac12\mu_0\mathbf H\cdot\mathbf H = 0$." Judge it.`,
        ['False: the energy density is zero only at isolated points and instants', 'True: the two waves cancel each other', 'True on average, false at each instant', 'True at the nodes of E, at all times'], 0,
        [null, md`The waves cancel $E$ at the nodes of $E$, but $H$ is largest there. The energy just changes form.`, md`Its average is $\epsilon_0E_0^2$, the energy of the two waves added. It is the average power that is zero.`, md`At a node of $E$, $w = w_m = 2\epsilon_0E_0^2\cos^2\omega t$, which is zero only at the instants $\cos\omega t = 0$.`],
        md`$w = 2\epsilon_0E_0^2(\sin^2\beta z\sin^2\omega t + \cos^2\beta z\cos^2\omega t)$. It vanishes only where both terms vanish, for example $z = 0$ at $\omega t = 90°$. So the statement is false, as the FA23 key says.`, { src: 'FA23 #1(c)' }),
      Q(md`In free space at one instant, $\mathbf S = 3\,\hat z$ W/m² on the plane $z = 0.5$ m and $\mathbf S = 5\,\hat z$ W/m² on $z = 1$ m. Consider a box with 1 m² faces on those planes. Its field energy is…`,
        ['being released at 2 W', 'being stored at 2 W', 'being stored at 8 W', 'constant, because free space has no losses'], 0,
        [null, md`3 W enters and 5 W leaves. More leaves than enters, so storage must fall.`, md`That adds the flows. The 3 W enters and the 5 W leaves, so they subtract.`, md`No losses means no heat, not no change in storage: $dW/dt = P_{\text{in}}$.`],
        md`$P_{\text{in}} = 3 - 5 = -2$ W and $\mathbf J = 0$, so $dW/dt = -2$ W: the box releases energy at 2 W. This is the skill HW 8 #3(g) asks for.`),
      Q(md`Inside a battery that is delivering power to a circuit, $\mathbf J\cdot\mathbf E$ is…`,
        ['negative', 'positive', 'zero', 'positive for AC, zero for DC'], 0,
        [null, md`Positive means a load. Inside the battery, chemistry drives the charges from the − terminal to the + terminal, against $\mathbf E$.`, md`Current flows through the battery, and $\mathbf E$ is there (it points from + to −), so the product is not zero.`, md`A battery delivers DC. $\mathbf J\cdot\mathbf E < 0$ is what any source has, AC or DC.`],
        md`Inside the battery $\mathbf E$ points from the + plate to the − plate, while the current flows from − to +. Antiparallel: $\mathbf J\cdot\mathbf E < 0$, a source, like $vi < 0$ in circuits.`),
      Q(md`In Worked example 1, the current is doubled to 10 A and nothing else changes. The power flowing in through the side of the wire becomes…`,
        ['20 W, four times as much', '10 W, twice as much', '5 W, the same', '40 W, eight times as much'], 0,
        [null, md`Both $E$ and $H$ are proportional to $I$, so $S = EH$ goes as $I^2$.`, md`The wire's resistance does not change, so the heat $I^2R$ must change.`, md`$E$ doubles and $H$ doubles: that is $2^2$, not $2^3$.`],
        md`$E \propto I$ and $H \propto I$, so $P_{\text{in}} = EH(2\pi aL) \propto I^2$: $4\times5 = 20$ W $= I^2R = (100)(0.2)$.`),
      Q(md`Throughout a cube of side 2 m, $\nabla\cdot\mathbf S = 3$ W/m³. The net power flowing **out** through its six faces is…`,
        ['24 W', '12 W', '72 W', '3 W'], 0,
        [null, md`That multiplies by a face area, $2^2$. The divergence theorem integrates over the volume, $2^3$.`, md`That multiplies by the total surface area, $6\times4$. The divergence is per unit volume.`, md`$\nabla\cdot\mathbf S$ is per cubic meter; multiply by the 8 m³.`],
        md`$\oint\mathbf S\cdot d\mathbf A = \int\nabla\cdot\mathbf S\,dV = (3)(8) = 24$ W.`),
      Q(md`In the thin-box argument for a current sheet, why does the stored-energy term drop out?`,
        ['The fields stay finite while the volume of the box goes to zero', 'The fields are zero at the sheet', 'A sheet stores energy only when it is a perfect conductor', 'The stored energy cancels between the two sides'], 0,
        [null, md`$E$ at the sheet is $\tfrac{\eta}{2}J_s$, not zero; that is what makes $\mathbf J_s\cdot\mathbf E$ nonzero.`, md`The argument does not need the sheet to be a conductor. It only needs the box to be thin.`, md`Energy density is never negative, so nothing can cancel it. It drops out because there is no room left to store it.`],
        md`$W = \int w\,dV \le w_{\max}Ah\to0$ as $h\to0$. The current term survives because $\mathbf J$ grows as $1/h$ while the volume shrinks as $h$: $\mathbf Jh = \mathbf J_s$.`),
      Q(md`At the surface of a resistor carrying DC, $\mathbf S$ points…`,
        ['into the resistor', 'out of the resistor', 'along the current', 'nowhere: DC fields carry no energy'], 0,
        [null, md`The resistor absorbs power, so the flow must enter it.`, md`Inside, $\mathbf E$ points along the current, but $\mathbf S = \mathbf E\times\mathbf H$ is perpendicular to $\mathbf E$.`, md`Static $\mathbf E$ and $\mathbf H$ still give $\mathbf S = \mathbf E\times\mathbf H \neq 0$ around a current-carrying wire.`],
        md`$\mathbf E$ along the wire and $\mathbf H$ circling it make $\mathbf E\times\mathbf H$ point radially inward, delivering $I^2R$.`),
      R(md`
        ### Practice, level 1: what each term is

        **The trick:** flow ($\mathbf S$, $\nabla\cdot\mathbf S$), storage ($w$, $\partial w/\partial t$), conversion ($\mathbf J\cdot\mathbf E$: positive in a load, negative in a source, zero in vacuum). Answer in about 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_w1s_terms', { need: 8 }), { id: 'w1-poynting.r0' }),
      R(md`
        ### Practice, level 1: balance the books

        **The trick:** $P_{\text{in}} = dW/dt + P_{\text{heat}}$. Read the numbers, put each in its slot, watch the signs.
      `),
      Object.assign(G('rf_w1s_box', { need: 8 }), { id: 'w1-poynting.r1' }),
      R(md`
        ### Practice, level 1: the steps of the derivation

        **The trick:** dot Ampère with $\mathbf E$ and Faraday with $\mathbf H$; $\epsilon\mathbf E\cdot\partial_t\mathbf E = \partial_tw_e$; the identity has a minus sign; the divergence theorem turns $\int\nabla\cdot\mathbf S\,dV$ into $\oint\mathbf S\cdot d\mathbf A$.
      `),
      Object.assign(G('rf_w1s_derive', { need: 8 }), { id: 'w1-poynting.r2' }),
      R(md`
        ### Practice, level 2: whole problems, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w1s_wire', { need: 2 }),
      G('w1s_box', { need: 2 }),
      G('w1s_sheet', { need: 2 }),
      G('w1s_slosh', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A sheet, a box downstream, and the bookkeeping that ties them together.
      `),
      G('w1s_exam1', { need: 2 }),
    ],
  });

  // ================================================================ lesson 1: generators
  // ---------------------------------------------------------------- level 1, what each term is
  const TERMS = [
    { t: md`$\mathbf J\cdot\mathbf E$`, d: 'the power per unit volume that the field hands to moving charges', is: md`$\mathbf J\cdot\mathbf E$ is the power per unit volume handed to charges, heat in a resistor.` },
    { t: md`$\partial w/\partial t$`, d: 'how fast the field energy stored per unit volume is growing', is: md`$\partial w/\partial t$ is how fast the stored energy per unit volume grows.` },
    { t: md`$\nabla\cdot\mathbf S$`, d: 'the net energy flowing out of a point, per unit volume and per unit time', is: md`$\nabla\cdot\mathbf S$ is the net outflow at a point per unit volume, a scalar in W/m³.` },
    { t: md`$\mathbf S$`, d: 'the energy crossing a unit area per unit time, together with the direction it moves', is: md`$\mathbf S$ is the flow per unit area, a vector in W/m².` },
    { t: md`$\oint_A\mathbf S\cdot d\mathbf A$`, d: 'the total power flowing out through a closed surface', is: md`$\oint_A\mathbf S\cdot d\mathbf A$ is the total power out through a closed surface, in W.` },
    { t: md`$\tfrac12\epsilon E^2$`, d: 'the electric energy stored per unit volume', is: md`$\tfrac12\epsilon E^2$ is the stored electric energy per unit volume, in J/m³.` },
  ];
  const SIGNWHY = {
    positive: 'Positive means the field does work on the charges: a load, like a resistor.',
    negative: 'Negative means the charges give energy to the field: a source, like a battery.',
    zero: md`Zero needs no current, or current flowing across $\mathbf E$.`,
    'it changes sign every half period': md`In a resistor and in a driven sheet, $\mathbf J$ and $\mathbf E$ reverse together, so their product keeps its sign.`,
  };
  const STMT_T = [
    md`$-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$ at every point`,
    md`In vacuum, $\nabla\cdot\mathbf S = -\partial w/\partial t$`,
    'In a resistor carrying DC, energy enters through its side surface',
    md`A source has $\mathbf J\cdot\mathbf E < 0$`,
    'In steady DC, the power flowing into a closed surface equals the heat produced inside it',
  ];
  const STMT_F = [
    [md`$-\nabla\cdot\mathbf S = \partial w/\partial t$ in every medium`, md`That drops $\mathbf J\cdot\mathbf E$. It holds only where there is no current.`],
    [md`In a resistor, $\mathbf J\cdot\mathbf E < 0$`, md`$\mathbf J = \sigma\mathbf E$ gives $\sigma E^2 \ge 0$. Negative is a source.`],
    ['Energy flows inside a wire, along the current', md`$\mathbf S = \mathbf E\times\mathbf H$ is radial at the surface: the energy enters from the side.`],
    [md`$\oint_A\mathbf S\cdot d\mathbf A$ with outward $d\mathbf A$ is the power flowing in`, 'With outward dA it is the power flowing out. Power in is minus it.'],
    ['In a standing wave the energy density is zero everywhere', 'It is zero only at isolated points at isolated instants. The energy changes form between E and H.'],
    ['The stored energy in a region can change only if charges inside do work', md`Flow through the surface changes it too: in vacuum $dW/dt = P_{\text{in}}$.`],
  ];

  GENS.rf_w1s_terms = () => one([
    () => {
      const i = ri(0, TERMS.length - 1), T = TERMS[i];
      return MC('Name the term', md`In the Poynting theorem, which quantity is ${T.d}?`, T.t,
        TERMS.filter((_, j) => j !== i).map((o) => [o.t, md`That one is something else: ${o.is}`]),
        T.is);
    },
    () => {
      const [where, ans, why] = pick([
        ['a copper wire carrying a steady current', 'positive', md`$\mathbf J = \sigma\mathbf E$, so $\mathbf J\cdot\mathbf E = \sigma E^2 \ge 0$: Ohmic heat.`],
        ['seawater with a radio wave passing through it', 'positive', md`Seawater conducts: $\mathbf J\cdot\mathbf E = \sigma E^2 \ge 0$ at every instant.`],
        ['the inside of a battery that is delivering power', 'negative', md`Chemistry drives the current from the − terminal to the + terminal inside, against $\mathbf E$: a source.`],
        ['the inside of a battery that is being charged', 'positive', md`The charger forces current from + to − inside the battery, along $\mathbf E$: here the battery is the load.`],
        ['a driven current sheet launching two waves', 'negative', md`$\mathbf J_s\cdot\mathbf E = -\tfrac{\eta}{2}J_s^2 \le 0$ at every instant: the sheet supplies what the waves carry.`],
        ['empty space with a wave passing through it', 'zero', md`No charges, so $\mathbf J = 0$. Energy can only flow and be stored.`],
        ['a perfect dielectric with a wave passing through it', 'zero', md`$\sigma = 0$, so no conduction current: $\mathbf J\cdot\mathbf E = 0$.`],
      ]);
      return MC('Load, source or neither?', md`In ${where}, $\mathbf J\cdot\mathbf E$ is…`, ans,
        Object.keys(SIGNWHY).filter((k) => k !== ans).map((k) => [k, SIGNWHY[k]]), why);
    },
    () => {
      if (pick([true, false])) {
        const s = pick([0.5, 2, 4, 10]), E0 = pick([2, 3, 5, 10]), P = s * E0 * E0;
        return MC('Ohmic heat', md`A conductor with $\sigma = ${s}$ S/m has $|\mathbf E| = ${E0}$ V/m at a point. The power per unit volume turned into heat there is…`, W(P, 'W/m³'),
          [[W(s * E0, 'W/m³'), md`That is $\sigma E$, the current density in A/m². Multiply by $E$ once more.`],
            [W(P / 2, 'W/m³'), md`No ½ here: $\mathbf J\cdot\mathbf E = \sigma E^2$ at an instant. The ½ belongs to time averages of sinusoids.`],
            [W(E0 * E0 / s, 'W/m³'), md`That divides by $\sigma$. A better conductor at the same $E$ carries more current and heats more.`],
            [W(2 * P, 'W/m³'), md`There is no factor 2: $(\sigma E)(E)$.`]],
          md`$\mathbf J\cdot\mathbf E = (\sigma\mathbf E)\cdot\mathbf E = \sigma E^2 = (${s})(${E0})^2 = ${f(P)}$ W/m³.`);
      }
      let e1, e2, j1, j2, j3, d;
      do { e1 = pick([100, 200, 300]); e2 = pick([-100, 100, 200]); j1 = pick([1, 2, 3, -2]); j2 = pick([1, 2, 4, -1]); j3 = pick([2, 5]); d = e1 * j1 + e2 * j2; } while (d === 0 || e1 * j1 - e2 * j2 === d);
      const sg = (v) => (v < 0 ? `- ${-v}` : `+ ${v}`);
      return MC('A dot product', md`At a point, $\mathbf E = ${e1}\,\hat x ${sg(e2)}\,\hat y$ V/m and $\mathbf J = ${j1}\,\hat x ${sg(j2)}\,\hat y + ${j3}\,\hat z$ A/m². Then $\mathbf J\cdot\mathbf E$ is…`, W(d, 'W/m³'),
        [[W(Math.hypot(e1, e2) * Math.hypot(j1, j2, j3), 'W/m³'), md`That multiplies the sizes. Only the part of $\mathbf J$ along $\mathbf E$ counts.`],
          [W(e1 * j1 - e2 * j2, 'W/m³'), md`That subtracts the $y$ product. A dot product adds component by component, signs included.`],
          [W(e1 * j1 + e2 * j2 + j3 * (e1 + e2), 'W/m³'), md`$\mathbf E$ has no $z$-component, so $J_z$ multiplies zero.`],
          [W(e1 * j1, 'W/m³'), md`That keeps only $x$. The $y$-parts are parallel too and count.`]],
        md`$\mathbf J\cdot\mathbf E = (${j1})(${e1}) + (${j2})(${e2}) + (${j3})(0) = ${d}$ W/m³. ${d > 0 ? 'Positive: the field does work on these charges.' : 'Negative: these charges give energy to the field.'}`);
    },
    () => {
      const UN = [[md`$\mathbf S$`, 'W/m²'], [md`$\nabla\cdot\mathbf S$`, 'W/m³'], [md`$\partial w/\partial t$`, 'W/m³'], [md`$\mathbf J\cdot\mathbf E$`, 'W/m³'], [md`$\oint_A\mathbf S\cdot d\mathbf A$`, 'W'], [md`the field energy $W = \int_Vw\,dV$`, 'J'], [md`$w = \tfrac12\epsilon E^2 + \tfrac12\mu H^2$`, 'J/m³'], [md`$dW/dt$`, 'W']];
      const WH = { 'W/m²': 'W/m² is a power per area, the units of S itself.', 'W/m³': 'W/m³ is a power per volume, the units of every term of the point form.', W: 'W is a total power: what a surface or volume integral of the point form gives.', J: 'J is an energy, not a rate of energy.', 'J/m³': 'J/m³ is an energy density, not a rate.', 'A/m²': 'A/m² is a current density.' };
      const [q, u] = pick(UN);
      return MC('Units', md`The units of ${q} are…`, u, Object.keys(WH).filter((k) => k !== u).map((k) => [k, WH[k]]),
        md`${q} is in ${u}. Check: $\mathbf S$ is (V/m)(A/m) = W/m²; a divergence divides by a meter, giving W/m³; a time derivative of J/m³ is W/m³; integrating W/m³ over m³, or W/m² over m², gives W.`);
    },
    () => MC('Which statement is true?', 'Pick the true statement about the Poynting theorem.', pick(STMT_T), STMT_F,
      md`The theorem: $\nabla\cdot\mathbf S + \partial w/\partial t + \mathbf J\cdot\mathbf E = 0$, or in a box, $P_{\text{in}} = dW/dt + P_{\text{heat}}$. Every true statement is one of these, read with the right signs.`),
  ]);

  // ---------------------------------------------------------------- level 1, balance the books
  GENS.rf_w1s_box = () => one([
    () => {
      let Pin, Pout, Qh, d;
      do { Pin = pick([6, 8, 10, 12, 20]); Pout = pick([1, 2, 3, 4, 9]); Qh = pick([1, 2, 3, 5]); d = Pin - Pout - Qh; } while (d === 0);
      return MC('Stored or released?', md`Through a closed surface, ${Pin} W of electromagnetic power flows in through some faces and ${Pout} W flows out through others. Charges inside absorb ${Qh} W as heat. The field energy inside changes at…`, `$${d}$ W`,
        [[`$${Pin - Pout + Qh}$ W`, 'That adds the heat. Heat is energy leaving the field, so subtract it.'], [`$${Pin + Pout - Qh}$ W`, 'That adds the outflow. Power flowing out lowers the stored energy.'],
          [`$${-d}$ W`, 'That flips every sign: inflow raises storage, outflow and heat lower it.'], [`$${Pin - Pout}$ W`, `That leaves out the ${Qh} W the charges absorb.`]],
        md`$dW/dt = P_{\text{in}} - P_{\text{heat}} = (${Pin} - ${Pout}) - ${Qh} = ${d}$ W. ${d > 0 ? 'Positive: energy is being stored.' : 'Negative: stored energy is being released.'}`);
    },
    () => {
      const I = pick([2, 3, 5, 10]), Rv = pick([0.5, 2, 4, 10]), P = I * I * Rv, out = pick([true, false]);
      const ans = out ? -P : P;
      return MC('A resistor, DC', md`A resistor of ${Rv} Ω carries a steady ${I} A. Through a closed surface around it, ${out ? md`the flux $\oint\mathbf S\cdot d\mathbf A$ with outward $d\mathbf A$` : 'the net electromagnetic power flowing in'} is…`, W(ans, 'W'),
        [[W(-ans, 'W'), out ? md`With outward $d\mathbf A$ the integral is the power out. Energy flows in here, so it is negative.` : 'The resistor absorbs power, so the net flow is inward and positive.'],
          [W(I * Rv * (out ? -1 : 1), 'W'), md`That is $IR$, the voltage. Power is $I^2R$.`], [W(ans / 2, 'W'), 'No ½ for DC. The ½ belongs to time averages of sinusoids.'],
          ['$0$ W', md`Static fields still carry energy: $\mathbf E$ along the wire and $\mathbf H$ around it make $\mathbf S$ point inward.`]],
        md`Steady state: $dW/dt = 0$, so the power flowing in equals the heat, $I^2R = (${I})^2(${Rv}) = ${f(P)}$ W. ${out ? md`With outward $d\mathbf A$ the flux is $-${f(P)}$ W.` : ''}`);
    },
    () => {
      const S1 = pick([2, 3, 4, 6, 8]), S2 = pick([1, 2, 5, 7, 9].filter((x) => x !== S1)), A = pick([1, 2, 4]);
      const z1 = pick([0, 0.5, 1]), z2 = z1 + pick([0.25, 0.5]), d = A * (S1 - S2);
      const say = (v) => (v > 0 ? `growing at ${f(v)} W` : `shrinking at ${f(-v)} W`);
      return MC('A box in a perfect dielectric', md`In a perfect dielectric at one instant, $\mathbf S = ${S1}\,\hat z$ W/m² on the plane $z = ${z1}$ m and $\mathbf S = ${S2}\,\hat z$ W/m² on the plane $z = ${z2}$ m. A box has ${A} m² faces on these two planes. Its stored energy is…`, say(d),
        [[say(-d), md`That has the flow backward. Energy enters through the face at $z = ${z1}$ and leaves through the face at $z = ${z2}$.`], [say(A * (S1 + S2)), 'That adds the two faces. One is an entry and the other an exit, so they subtract.'],
          ['constant: a perfect dielectric has no losses', md`No losses means no heat. Storage still changes when inflow and outflow differ: $dW/dt = P_{\text{in}}$.`], ...(A !== 1 ? [[say(S1 - S2), 'That forgets the face area. Multiply W/m² by m².']] : [])],
        md`$P_{\text{in}} = (${S1} - ${S2})(${A}) = ${f(d)}$ W and $\mathbf J = 0$, so $dW/dt = ${f(d)}$ W.`);
    },
    () => {
      let dw, je, dv;
      do { dw = pick([-6, -3, -2, 2, 4, 5]); je = pick([1, 2, 3, 4]); dv = -dw - je; } while (dv === 0);
      return MC('The point form', md`At a point, $\partial w/\partial t = ${dw}$ W/m³ and $\mathbf J\cdot\mathbf E = ${je}$ W/m³. Then $\nabla\cdot\mathbf S$ is…`, `$${dv}$ W/m³`,
        [[`$${-dv}$ W/m³`, 'That flips every sign of the theorem.'], [`$${-dw + je}$ W/m³`, md`That gives $\mathbf J\cdot\mathbf E$ the wrong sign. Heat drains the field, like outflow.`],
          [`$${-dw}$ W/m³`, md`That drops $\mathbf J\cdot\mathbf E$. It is not zero here.`], [`$${dw - je}$ W/m³`, md`That gives $\partial w/\partial t$ the wrong sign.`]],
        md`$\nabla\cdot\mathbf S = -\partial w/\partial t - \mathbf J\cdot\mathbf E = -(${dw}) - ${je} = ${dv}$ W/m³.`);
    },
    () => {
      const er = pick([1, 4, 9]), J0 = pick([1, 2, 4]), th = pick([30, 45, 60]), e = etaPi(er) * Math.PI, P = e / 2 * J0 * J0 * cos2(th);
      return MC('What a sheet delivers', md`A sheet on $z = 0$ in ${medTex(er)} carries $\mathbf J_s = -${J0}\cos(\omega t)\,\hat x$ A/m. At the instant $\omega t = ${th}°$, the power per square meter it delivers, $-\mathbf J_s\cdot\mathbf E$, is…`, W(P, 'W/m²'),
        [[W(P / 2, 'W/m²'), 'That is what one side carries. The sheet feeds both.'], [W(e / 2 * J0 * J0, 'W/m²'), md`That is the peak, at $\omega t = 0$. Put in $\cos^2${th}°$.`],
          [W(e * J0 * J0 * cos2(th), 'W/m²'), md`That uses $E = \eta J_s$ at the sheet. The sheet formula has $\eta/2$.`], [W(e / 2 * J0 * J0 * Math.cos(th * DEG), 'W/m²'), md`$\mathbf J_s$ and $\mathbf E$ each carry a $\cos\omega t$, so the product has $\cos^2$, not $\cos$.`]],
        md`$\eta = ${etaPi(er)}\pi\ \Omega$. At the sheet $E_x = \tfrac{\eta}{2}J_0\cos\omega t$, so $-\mathbf J_s\cdot\mathbf E = \tfrac{\eta}{2}J_0^2\cos^2\omega t = (${etaPi(er) / 2}\pi)(${J0 * J0})\cos^2${th}° = ${f(P)}$ W/m².`);
    },
  ]);

  // ---------------------------------------------------------------- level 1, the steps of the derivation
  GENS.rf_w1s_derive = () => one([
    () => {
      const [a, b] = pick([['E', 'H'], ['H', 'E'], ['A', 'B'], ['F', 'G']]);
      const A = `\\mathbf ${a}`, B = `\\mathbf ${b}`;
      return MC('The identity', md`For any two fields, $\nabla\cdot(${A}\times${B})$ equals…`, `$${B}\\cdot(\\nabla\\times${A}) - ${A}\\cdot(\\nabla\\times${B})$`,
        [[`$${A}\\cdot(\\nabla\\times${B}) - ${B}\\cdot(\\nabla\\times${A})$`, md`That is $\nabla\cdot(${B}\times${A})$: the sign is flipped. Each field is dotted with the curl of the other, and the first term belongs to the curl of the first factor.`],
          [`$${B}\\cdot(\\nabla\\times${A}) + ${A}\\cdot(\\nabla\\times${B})$`, 'The cross product makes the two halves of each product rule enter with opposite signs.'],
          [`$(\\nabla\\cdot${A})(\\nabla\\cdot${B})$`, 'The divergence of a cross product brings curls, not divergences.'],
          [`$${A}\\cdot(\\nabla\\times${A}) - ${B}\\cdot(\\nabla\\times${B})$`, 'Each field is dotted with the curl of the other one, not its own.']],
        md`$\nabla\cdot(${A}\times${B}) = ${B}\cdot(\nabla\times${A}) - ${A}\cdot(\nabla\times${B})$. With $${A} = \mathbf E$, $${B} = \mathbf H$ this is the step that turns the dotted curl equations into $\nabla\cdot\mathbf S$.`);
    },
    () => one([
      () => MC('Chain rule', md`$\dfrac{\partial}{\partial t}(\mathbf E\cdot\mathbf E)$ equals…`, md`$2\,\mathbf E\cdot\dfrac{\partial\mathbf E}{\partial t}$`,
        [[md`$\mathbf E\cdot\dfrac{\partial\mathbf E}{\partial t}$`, md`The chain rule on $E_x^2$ gives $2E_x\,\partial_tE_x$: you lost the 2.`], [md`$2\dfrac{\partial\mathbf E}{\partial t}$`, 'That is a vector. The left side is a scalar.'],
          [md`$\dfrac{\partial\mathbf E}{\partial t}\cdot\dfrac{\partial\mathbf E}{\partial t}$`, md`Differentiating a square brings down the function once, not its derivative twice.`]],
        md`$\partial_t(E_x^2 + E_y^2 + E_z^2) = 2(E_x\partial_tE_x + E_y\partial_tE_y + E_z\partial_tE_z) = 2\mathbf E\cdot\partial_t\mathbf E$.`),
      () => MC('An energy density appears', md`$\epsilon\,\mathbf E\cdot\dfrac{\partial\mathbf E}{\partial t}$ equals…`, md`$\dfrac{\partial}{\partial t}\Big(\tfrac12\epsilon E^2\Big)$`,
        [[md`$\dfrac{\partial}{\partial t}\big(\epsilon E^2\big)$`, md`$\partial_t(\epsilon E^2) = 2\epsilon\mathbf E\cdot\partial_t\mathbf E$: twice too big.`], [md`$\tfrac12\epsilon\dfrac{\partial E}{\partial t}$`, md`That lost the factor $E$ and the square.`],
          [md`$\dfrac{\partial}{\partial t}\Big(\tfrac12\mu H^2\Big)$`, md`That is the magnetic energy. It comes from Faraday's law dotted with $\mathbf H$.`]],
        md`$\partial_t(\tfrac12\epsilon E^2) = \tfrac12\epsilon\cdot2\mathbf E\cdot\partial_t\mathbf E = \epsilon\mathbf E\cdot\partial_t\mathbf E$. This is $\partial w_e/\partial t$.`),
      () => MC('From Faraday', md`Dotting Faraday's law $\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$ with $\mathbf H$ gives $\mathbf H\cdot(\nabla\times\mathbf E) = $…`, md`$-\partial w_m/\partial t$`,
        [[md`$+\partial w_m/\partial t$`, 'The minus sign of Faraday\'s law stays.'], [md`$-\partial w_e/\partial t$`, md`$\mu$ and $\mathbf H$ make the magnetic energy, not the electric.`], [md`$-\mathbf J\cdot\mathbf E$`, md`$\mathbf J$ appears only in Ampère's law.`], [md`$-2\,\partial w_m/\partial t$`, md`$\mu\mathbf H\cdot\partial_t\mathbf H = \partial_t(\tfrac12\mu H^2)$: no extra 2.`]],
        md`$\mathbf H\cdot(\nabla\times\mathbf E) = -\mu\mathbf H\cdot\partial_t\mathbf H = -\partial_t(\tfrac12\mu H^2) = -\partial w_m/\partial t$.`),
    ]),
    () => one([
      () => MC('Where J·E comes from', md`To make $\mathbf J\cdot\mathbf E$ appear, you take the dot product of…`, md`Ampère's law with $\mathbf E$`,
        [[md`Faraday's law with $\mathbf E$`, md`Faraday's law has no $\mathbf J$ in it.`], [md`Ampère's law with $\mathbf H$`, md`That gives $\mathbf H\cdot\mathbf J$, in A²/m³: not a power.`], [md`Gauss's law with $\mathbf E$`, md`Gauss's law is a scalar equation with $\rho$, not $\mathbf J$.`]],
        md`Ampère: $\nabla\times\mathbf H = \mathbf J + \epsilon\partial_t\mathbf E$. Dot with $\mathbf E$: $\mathbf E\cdot(\nabla\times\mathbf H) = \mathbf J\cdot\mathbf E + \partial_tw_e$.`),
      () => MC('Which laws?', 'The Poynting theorem is derived from which two of Maxwell\'s equations?', 'Faraday\'s law and Ampère\'s law with J',
        [['the two Gauss laws', 'Gauss\'s laws are about divergences of D and B; the theorem needs the curls.'], ['Gauss\'s law and Ampère\'s law', 'The magnetic energy comes from Faraday\'s law, which Gauss\'s law cannot replace.'], ['Ampère\'s law alone', 'Ampère gives the electric energy and J·E; the magnetic energy needs Faraday.']],
        md`Dot Faraday with $\mathbf H$, dot Ampère with $\mathbf E$, subtract, and use $\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot\nabla\times\mathbf E - \mathbf E\cdot\nabla\times\mathbf H$.`),
      () => MC('In the proof', md`In the component proof of the identity, the six terms in which a component of $\mathbf E$ is differentiated add up to…`, md`$\mathbf H\cdot(\nabla\times\mathbf E)$`,
        [[md`$\mathbf E\cdot(\nabla\times\mathbf H)$`, md`Those would need derivatives of $\mathbf H$.`], [md`$-\mathbf H\cdot(\nabla\times\mathbf E)$`, md`Grouped by $H_x$, $H_y$, $H_z$, the brackets are the curl components of $\mathbf E$ in their usual order, with a plus sign.`], [md`$\mathbf H\,(\nabla\cdot\mathbf E)$`, 'Each bracket is a difference of cross derivatives, like a curl, not a sum like a divergence.']],
        md`$H_x(\partial_yE_z - \partial_zE_y) + H_y(\partial_zE_x - \partial_xE_z) + H_z(\partial_xE_y - \partial_yE_x) = \mathbf H\cdot(\nabla\times\mathbf E)$.`),
    ]),
    () => {
      const s = pick([2, 3]), k = pick([2, 3, 5, -4]);
      return MC('The divergence theorem', md`Throughout a cube of side ${s} m, $\nabla\cdot\mathbf S = ${k}$ W/m³. The net power flowing **out** of its surface is…`, W(k * s ** 3, 'W'),
        [[W(k * s * s, 'W'), 'That multiplies by one face area. The divergence is per unit volume.'], [W(6 * k * s * s, 'W'), 'That multiplies by the total surface area. The divergence is per unit volume.'],
          [W(-k * s ** 3, 'W'), md`With outward $d\mathbf A$, $\oint\mathbf S\cdot d\mathbf A = +\int\nabla\cdot\mathbf S\,dV$: no sign change.`], [W(k * s, 'W'), 'Multiply by the volume, s³.']],
        md`$\oint\mathbf S\cdot d\mathbf A = \int_V\nabla\cdot\mathbf S\,dV = (${k})(${s})^3 = ${k * s ** 3}$ W.${k < 0 ? ' Negative: net power flows in.' : ''}`);
    },
    () => {
      const c = pick(['x', 'y', 'z']);
      const R3 = { x: md`$\partial_yE_z - \partial_zE_y$`, y: md`$\partial_zE_x - \partial_xE_z$`, z: md`$\partial_xE_y - \partial_yE_x$` };
      const NEG = { x: md`$\partial_zE_y - \partial_yE_z$`, y: md`$\partial_xE_z - \partial_zE_x$`, z: md`$\partial_yE_x - \partial_xE_y$` };
      const others = ['x', 'y', 'z'].filter((o) => o !== c);
      return MC('A curl component', md`From your sheet, $(\nabla\times\mathbf E)_${c}$ is…`, R3[c],
        [[NEG[c], 'The two terms are in the wrong order, which flips the sign.'], [R3[others[0]], md`That is $(\nabla\times\mathbf E)_${others[0]}$.`], [R3[others[1]], md`That is $(\nabla\times\mathbf E)_${others[1]}$.`],
          [md`$\partial_${c}E_${c}$`, md`That is one term of the divergence. A curl component never differentiates a component along its own axis.`]],
        md`The sheet: $\nabla\times\mathbf A = \hat x(\partial_yA_z - \partial_zA_y) + \hat y(\partial_zA_x - \partial_xA_z) + \hat z(\partial_xA_y - \partial_yA_x)$. Cyclic order $x\to y\to z$.`);
    },
  ]);

  // ---------------------------------------------------------------- level 2
  GENS.w1s_wire = () => {
    const k = pick([1, 2, 5]), amm = pick([0.5, 1, 2]), L = pick([1, 2, 5, 10]), I = pick([1, 2, 5, 10]);
    const sig = k * 1e7 / Math.PI, a = amm * 1e-3, area = Math.PI * a * a;
    const Rw = L / (sig * area), E = I / (sig * area), H = I / (2 * Math.PI * a), S = E * H, P = S * 2 * Math.PI * a * L;
    const sigT = k === 1 ? '10^7/\\pi' : `${k}\\times10^7/\\pi`;
    return {
      title: 'Energy into a resistive wire',
      q: md`A straight wire of radius $a = ${amm}$ mm and length $L = ${L}$ m has conductivity $\sigma = ${sigT}$ S/m and carries a steady current $I = ${I}$ A along $+\hat z$. Find $E$ inside, $H$ at the surface, $|\mathbf S|$ at the surface, the total power entering through the side, and the direction of $\mathbf S$ there.`,
      parts: [
        N('E', E, 'V/m'),
        Object.assign(N('H(a)', H, 'A/m'), { traps: [{ v: I / (2 * Math.PI * amm), msg: 'Convert a to meters first: 1 mm = 10⁻³ m.' }] }),
        N('|\\mathbf S|\\text{ at the surface}', S, 'W/m²'),
        Object.assign(N('P_{\\text{in}}\\text{ through the side}', P, 'W'), { traps: [{ v: S * area, msg: 'That multiplies by the end-face area πa². The energy enters through the side, area 2πaL.' }, { v: S * 2 * Math.PI * a, msg: 'That is the power per meter of wire. Multiply by L.' }] }),
        { lbl: 'At the surface of the wire, S points', mc: ['radially into the wire', 'radially out of the wire', 'along the current', 'around the wire, along φ'], a: 0,
          why: [null, md`$\mathbf E\times\mathbf H = EH(\hat z\times\hat\phi) = -EH\,\hat r$. The wire absorbs power, so the flow must enter it.`, md`$\mathbf S$ is perpendicular to $\mathbf E$, and $\mathbf E$ points along the current.`, md`$\mathbf S$ is perpendicular to $\mathbf H$, and $\mathbf H$ is the field that circles the wire.`] },
      ],
      hints: [md`$E = J/\sigma = I/(\sigma\pi a^2)$; Ampère around the surface: $H = I/2\pi a$.`, md`$\mathbf S = \mathbf E\times\mathbf H$ is radial. Multiply by the side area $2\pi aL$, and compare with $I^2R$, $R = L/\sigma\pi a^2$.`],
      sol: md`
        **Step 1: the resistance.** $\sigma\pi a^2 = (${sigT})(\pi)(${amm}\times10^{-3})^2 = ${f(sig * area)}$ S·m, so
        $$R = \frac{L}{\sigma\pi a^2} = \frac{${L}}{${f(sig * area)}} = ${f(Rw)}\ \Omega$$
        **Step 2: E inside.**
        $$E = \frac{I}{\sigma\pi a^2} = \frac{${I}}{${f(sig * area)}} = ${f(E)}\ \text{V/m}$$
        along $+\hat z$. Check: $EL = ${f(E * L)}$ V $= IR$ ✓. Tangential $\mathbf E$ is continuous, so the same $\mathbf E$ sits just outside.

        **Step 3: H at the surface.** Ampère: $H(2\pi a) = I$.
        $$H = \frac{${I}}{2\pi(${amm}\times10^{-3})} = ${f(H)}\ \text{A/m}$$
        **Step 4: S.** $\hat z\times\hat\phi = -\hat r$: into the wire.
        $$|\mathbf S| = EH = (${f(E)})(${f(H)}) = ${f(S)}\ \text{W/m}^2$$
        **Step 5: power through the side,** area $2\pi aL = ${f(2 * Math.PI * a * L)}$ m²:
        $$P_{\text{in}} = (${f(S)})(${f(2 * Math.PI * a * L)}) = ${f(P)}\ \text{W}$$
        **Check.** $I^2R = (${I})^2(${f(Rw)}) = ${f(I * I * Rw)}$ W ✓. Steady DC stores nothing new, so all the inflow becomes heat.

        **Speed path.** $P_{\text{in}} = (EL)(2\pi aH) = VI$, so you can check it against $I^2R$ at once.
      `,
    };
  };

  GENS.w1s_box = () => {
    const er = pick([1, 4, 9]), n = Math.sqrt(er), eP = etaPi(er), eta = eP * Math.PI;
    const lam = pick([1, 2]), fM = 300 / n / lam, E0 = pick([10, 20, 30, 60]), A = pick([0.5, 1, 2]), dir = pick([1, -1]);
    let th, k1, dk, c1, c2;
    do {
      th = pick([0, 30, 45, 60, 90, 120]); k1 = pick([0, 1, 2, 3]); dk = pick([1, 2, 3]);
      c1 = cos2(th - dir * 30 * k1); c2 = cos2(th - dir * 30 * (k1 + dk));
    } while (c1 < 1e-9 || c2 < 1e-9 || Math.abs(c1 - c2) < 1e-9);
    const S0 = E0 * E0 / eta, S1 = dir * S0 * c1, S2 = dir * S0 * c2, dW = A * (S1 - S2);
    const z1 = frac(k1 * lam, 12), z2 = frac((k1 + dk) * lam, 12), sg = dir > 0 ? '-' : '+';
    const ph1 = th - dir * 30 * k1, ph2 = th - dir * 30 * (k1 + dk);
    return {
      title: 'A box downstream: storing or releasing?',
      q: md`In ${medTex(er)}, the wave $\mathbf E = ${E0}\cos(\omega t ${sg} ${betaTex(lam)}\,z)\,\hat x$ V/m ($z$ in meters) has $f = ${p(fM)}$ MHz. A box has faces of area ${A} m² on the planes $z = ${z1}$ m and $z = ${z2}$ m. At the instant $\omega t = ${th}°$, find $S_z$ on each face (with its sign), the rate of change of the field energy inside, and whether it is being stored or released.`,
      parts: [
        Object.assign(N(md`$S_z$ at $z = ${z1}$ m`, S1, 'W/m²'), { traps: [{ v: -S1, msg: dir > 0 ? 'Check the sign: this wave travels toward +z.' : 'This wave travels toward −z, so H̃ = −Ẽ/η and S_z is negative.' }] }),
        Object.assign(N(md`$S_z$ at $z = ${z2}$ m`, S2, 'W/m²'), { traps: [{ v: -S2, msg: 'Check the sign: S points along the direction of travel.' }] }),
        Object.assign(N('dW/dt', dW, 'W'), { traps: [{ v: -dW, msg: 'P_in = (S_z at the lower face − S_z at the upper face) × area. You have it backward.' }, { v: dW / A, msg: 'Multiply by the face area.' }] }),
        { lbl: 'At that instant the field energy in the box is', mc: ['being stored', 'being released'], a: dW > 0 ? 0 : 1, why: dW > 0 ? [null, 'dW/dt is positive: more power enters than leaves.'] : ['dW/dt is negative: more power leaves than enters.', null] },
      ],
      hints: [md`$\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$. For this wave $S_z = ${dir > 0 ? '+' : '-'}(E_0^2/\eta)\cos^2(\text{phase})$.`, md`With $\mathbf J = 0$: $dW/dt = P_{\text{in}} = [S_z(z_{\text{low}}) - S_z(z_{\text{high}})]\times A$.`],
      sol: md`
        **Step 1: the medium.** $\eta = ${eP}\pi\ \Omega$. The wave travels toward ${dir > 0 ? '$+z$' : '$-z$'}, so ${dir > 0 ? md`$H_y = +E_x/\eta$` : md`$H_y = -E_x/\eta$`} and
        $$S_z = E_xH_y = ${dir > 0 ? '' : '-'}\frac{E_0^2}{\eta}\cos^2(\omega t ${sg} \beta z)$$
        with $E_0^2/\eta = ${E0 * E0}/(${eP}\pi) = ${f(S0)}$ W/m².

        **Step 2: the phases.** $\beta = ${betaTex(lam)}$ rad/m, so $\beta z = ${30 * k1}°$ at $z = ${z1}$ m and $${30 * (k1 + dk)}°$ at $z = ${z2}$ m. The phase $\omega t ${sg} \beta z$ is $${ph1}°$ and $${ph2}°$, with $\cos^2 = ${f(c1)}$ and $${f(c2)}$.

        **Step 3: S on each face.**
        $$S_z(${z1}) = ${f(S1)}, \qquad S_z(${z2}) = ${f(S2)}\ \ \text{W/m}^2$$
        **Step 4: the balance.** Outward $d\mathbf A$ is $-\hat z$ on the lower face and $+\hat z$ on the upper one, so the net power in is
        $$P_{\text{in}} = [S_z(${z1}) - S_z(${z2})](${A}) = ${f(dW)}\ \text{W}$$
        A perfect dielectric has $\mathbf J = 0$, so $dW/dt = ${f(dW)}$ W: the energy is being **${dW > 0 ? 'stored' : 'released'}**.

        **Speed path.** $dW/dt = A\,(E_0^2/\eta)\times(\pm)(\cos^2_{\text{low}} - \cos^2_{\text{high}})$, with $+$ for a wave toward $+z$.
      `,
    };
  };

  GENS.w1s_sheet = () => {
    const er = pick([1, 4, 9]), n = Math.sqrt(er), eP = etaPi(er), eta = eP * Math.PI, J0 = pick([0.5, 1, 2, 4]), lam = pick([1, 2]);
    let th, k;
    do { th = pick([0, 30, 45, 60, 120]); k = pick([1, 2, 3, 4, 5]); } while (cos2(th) < 1e-9 || cos2(th - 30 * k) < 1e-9);
    const E0 = eta * J0 / 2, Ex0 = E0 * Math.cos(th * DEG), Pd = eta / 2 * J0 * J0 * cos2(th), Sp = eta / 4 * J0 * J0 * cos2(th - 30 * k);
    const z1 = frac(k * lam, 12), fM = 300 / n / lam;
    return {
      title: 'A sheet delivering power, instant by instant',
      q: md`A current sheet on $z = 0$ in ${medTex(er)} carries $\mathbf J_s = -${J0}\cos(\omega t)\,\hat x$ A/m at $f = ${p(fM)}$ MHz (so $\lambda = ${lam}$ m). At the instant $\omega t = ${th}°$, find $E_x$ at the sheet, the power per square meter the sheet delivers, and $S_z$ at $z = +${z1}$ m and at $z = -${z1}$ m.`,
      parts: [
        Object.assign(N('E_x(0)', Ex0, 'V/m'), { traps: [{ v: eta * J0 * Math.cos(th * DEG), msg: 'The sheet formula has η/2: E_x = (η/2)J_s(t).' }] }),
        Object.assign(N('-\\mathbf J_s\\cdot\\mathbf E', Pd, 'W/m²'), { traps: [{ v: Pd / 2, msg: 'That is one side. The sheet feeds both.' }, { v: -Pd, msg: 'The sheet is a source: −J_s·E is positive.' }] }),
        N(md`$S_z$ at $z = +${z1}$ m`, Sp, 'W/m²'),
        Object.assign(N(md`$S_z$ at $z = -${z1}$ m`, -Sp, 'W/m²'), { traps: [{ v: Sp, msg: 'On the z < 0 side the energy flows toward −z, so S_z is negative.' }] }),
      ],
      hints: [md`The sheet's fields: $E_x = \tfrac{\eta}{2}J_s(t \mp z/v)$, $H_y = \pm\tfrac12J_s(t \mp z/v)$ for $z \gtrless 0$, with $J_s(t) = ${J0}\cos\omega t$.`, md`$\beta z_1 = 360°\times z_1/\lambda$. On either side, $S_z = \pm\tfrac{\eta}{4}J_0^2\cos^2(\omega t - \beta|z|)$.`],
      sol: md`
        **Step 1: medium and fields.** $\eta = ${eP}\pi\ \Omega$, so $E_0 = \tfrac{\eta}{2}J_0 = ${f(E0)}$ V/m and $H_0 = \tfrac12J_0 = ${J0 / 2}$ A/m:
        $$E_x = ${f(E0)}\cos(\omega t \mp \beta z)$$
        $$H_y = \pm${J0 / 2}\cos(\omega t \mp \beta z)$$
        **Step 2: at the sheet.** $E_x(0) = ${f(E0)}\cos${th}° = ${f(Ex0)}$ V/m.
        $$-\mathbf J_s\cdot\mathbf E = (${J0}\cos${th}°)(${f(Ex0)}) = ${f(Pd)}\ \text{W/m}^2$$
        **Step 3: at z = ±${z1} m.** $\beta|z| = 360°\times(${z1})/${lam} = ${30 * k}°$, so the phase is $${th - 30 * k}°$ on both sides and $\cos^2 = ${f(cos2(th - 30 * k))}$:
        $$|S_z| = E_0H_0\cos^2 = (${f(E0)})(${J0 / 2})(${f(cos2(th - 30 * k))}) = ${f(Sp)}$$
        in W/m², along $+\hat z$ on the right and $-\hat z$ on the left: $S_z(+${z1}) = ${f(Sp)}$ and $S_z(-${z1}) = ${f(-Sp)}$ W/m².

        **Check.** At $z = 0$ itself each side carries $\tfrac{\eta}{4}J_0^2\cos^2${th}° = ${f(Pd / 2)}$ W/m², and two of them make the $${f(Pd)}$ W/m² the sheet delivers ✓.
      `,
    };
  };

  GENS.w1s_slosh = () => {
    const er = pick([1, 4]), eP = etaPi(er), eta = eP * Math.PI, eps = er * EPS0, E0 = pick([1, 2, 5, 10]), lam = pick([1, 2, 4]);
    const m = pick([2, 3, 4, 9]), th = pick([30, 45, 60, 120]), bz = 15 * m;
    const sb = Math.sin(bz * DEG), cb = Math.cos(bz * DEG), st = Math.sin(th * DEG), ct = Math.cos(th * DEG);
    const we = 2 * eps * E0 * E0 * sb * sb * st * st, wm = 2 * eps * E0 * E0 * cb * cb * ct * ct;
    const Sz = E0 * E0 / eta * Math.sin(2 * bz * DEG) * Math.sin(2 * th * DEG), Wc = eps * E0 * E0 * lam / 4;
    const z = frac(m * lam, 24);
    return {
      title: 'Energy in a standing wave',
      q: md`In ${medTex(er)} two equal waves make the standing wave $E_x = ${2 * E0}\sin(\beta z)\sin(\omega t)$ V/m, $H_y = \dfrac{${2 * E0}}{\eta}\cos(\beta z)\cos(\omega t)$ A/m, with $\lambda = ${lam}$ m. At $z = ${z}$ m and the instant $\omega t = ${th}°$, find $w_e$, $w_m$ and $S_z$. Then find the field energy per square meter between $z = 0$ and $z = \lambda/4$. (Use $\epsilon_0 = 10^{-9}/36\pi$ F/m.)`,
      parts: [N('w_e', we, 'J/m³'), N('w_m', wm, 'J/m³'), Object.assign(N('S_z', Sz, 'W/m²'), { traps: [{ v: 4 * Sz, msg: 'E_xH_y = (4E0²/η) sin βz cos βz sin ωt cos ωt = (E0²/η) sin 2βz sin 2ωt: the two factors of 2 from the double angles leave E0²/η.' }] }),
        Object.assign(N('W\\ (0 < z < \\lambda/4)', Wc, 'J/m²'), { traps: [{ v: 2 * Wc, msg: 'Each of sin²βz and cos²βz integrates to λ/8 over a quarter wavelength, not λ/4.' }] })],
      hints: [md`$w_e = \tfrac12\epsilon E_x^2$ and $w_m = \tfrac12\mu H_y^2$; with $\mu/\eta^2 = \epsilon$, $w_m = 2\epsilon E_0^2\cos^2\beta z\cos^2\omega t$ where $E_0 = ${E0}$ V/m.`, md`$\beta z = 360°\times z/\lambda$. $S_z = E_xH_y = (E_0^2/\eta)\sin2\beta z\sin2\omega t$. The energy in the cell is $\epsilon E_0^2\lambda/4$.`],
      sol: md`
        **Step 1: numbers.** $\epsilon = ${er === 1 ? '\\epsilon_0' : `${er}\\epsilon_0`} = ${f(eps)}$ F/m, $\eta = ${eP}\pi\ \Omega$, and $\beta z = 360°\times(${z})/${lam} = ${bz}°$. The fields' amplitudes are $2E_0 = ${2 * E0}$ V/m and $2E_0/\eta$, so $E_0 = ${E0}$ V/m.

        **Step 2: electric energy.**
        $$w_e = 2\epsilon E_0^2\sin^2${bz}°\,\sin^2${th}° = ${f(we)}\ \text{J/m}^3$$
        **Step 3: magnetic energy.**
        $$w_m = 2\epsilon E_0^2\cos^2${bz}°\,\cos^2${th}° = ${f(wm)}\ \text{J/m}^3$$
        **Step 4: the flow.**
        $$S_z = \frac{E_0^2}{\eta}\sin${2 * bz}°\,\sin${2 * th}° = ${f(Sz)}\ \text{W/m}^2$$
        ${Sz > 0 ? 'Positive: at this instant energy moves toward +z here.' : 'Negative: at this instant energy moves toward −z here.'}

        **Step 5: the cell.** Over $0 < z < \lambda/4$, $\int\sin^2\beta z\,dz = \int\cos^2\beta z\,dz = \lambda/8$, so
        $$W = 2\epsilon E_0^2\tfrac{\lambda}{8}(\sin^2\omega t + \cos^2\omega t) = \frac{\epsilon E_0^2\lambda}{4}$$
        $$W = ${f(Wc)}\ \text{J/m}^2$$
        the same at every instant: $S = 0$ on both faces and nothing inside converts energy.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3
  GENS.w1s_exam1 = () => {
    const er = pick([1, 4, 9]), n = Math.sqrt(er), eP = etaPi(er), eta = eP * Math.PI, J0 = pick([0.5, 1, 2, 4]), lam = pick([1, 2]), A = pick([1, 2, 4]);
    let th, k1, k2, c0, c1, c2;
    do {
      th = pick([0, 30, 45, 60, 120]); k1 = pick([1, 2, 3]); k2 = k1 + pick([1, 2, 3]);
      c0 = cos2(th); c1 = cos2(th - 30 * k1); c2 = cos2(th - 30 * k2);
    } while (c0 < 1e-9 || c1 < 1e-9 || c2 < 1e-9 || Math.abs(c1 - c2) < 1e-9);
    const E0 = eta * J0 / 2, S0 = E0 * J0 / 2, Pd = 2 * S0 * c0, S1 = S0 * c1, S2 = S0 * c2, dW = A * (S1 - S2);
    const z1 = frac(k1 * lam, 12), z2 = frac(k2 * lam, 12), fM = 300 / n / lam;
    return {
      title: 'Exam problem: a sheet and a box downstream',
      q: md`A current sheet on $z = 0$ in ${medTex(er)} carries $\mathbf J_s = -${J0}\cos(\omega t)\,\hat x$ A/m at $f = ${p(fM)}$ MHz. A box has faces of area ${A} m² on the planes $z = ${z1}$ m and $z = ${z2}$ m. No charges move inside the box.

        (a) Find the amplitude $E_0$ of $E_x$ in the waves.

        (b) At the instant $\omega t = ${th}°$, find the power per square meter the sheet delivers.

        (c) At that instant, find $S_z$ on each face of the box.

        (d) At that instant, find $dW/dt$ for the box.

        (e) Judge a statement about the box over a full period.`,
      parts: [
        Object.assign(N('E_0', E0, 'V/m'), { traps: [{ v: eta * J0, msg: 'The sheet formula has η/2: E0 = (η/2)J0.' }, { v: ETA0 * J0 / 2, msg: 'Use the medium\'s η, not η0.' }] }),
        Object.assign(N('-\\mathbf J_s\\cdot\\mathbf E', Pd, 'W/m²'), { traps: [{ v: Pd / 2, msg: 'That is one side. The sheet feeds two waves.' }] }),
        N(md`$S_z$ at $z = ${z1}$ m`, S1, 'W/m²'),
        N(md`$S_z$ at $z = ${z2}$ m`, S2, 'W/m²'),
        Object.assign(N('dW/dt', dW, 'W'), { traps: [{ v: -dW, msg: 'P_in = (S_z on the near face − S_z on the far face) × A.' }] }),
        { lbl: '(e) Averaged over one full period, the field energy the box gains is', mc: ['zero', md`$${f(Math.abs(dW))}$ W times the period`, 'positive, because the sheet keeps delivering power', 'negative, because the wave loses energy as it travels'], a: 0,
          why: [null, 'That is the rate at one instant. Over a period the rate swings both ways and averages to zero.', 'The power the sheet delivers passes through the box: what enters on average also leaves.', 'In a lossless medium the wave carries the same average power at every z.'] },
      ],
      hints: [md`$\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$; $E_0 = \tfrac{\eta}{2}J_0$, $H_0 = \tfrac12J_0$. For $z > 0$, $S_z = E_0H_0\cos^2(\omega t - \beta z)$.`, md`$\beta z = 360°\times z/\lambda$. $dW/dt = A[S_z(z_1) - S_z(z_2)]$. The averages of $\cos^2$ on the two faces are both $\tfrac12$.`],
      sol: md`
        **(a)** $\eta = ${eP}\pi\ \Omega$. From the sheet formula,
        $$E_0 = \tfrac{\eta}{2}J_0 = (${eP / 2}\pi)(${J0}) = ${f(E0)}\ \text{V/m}$$
        and $H_0 = \tfrac12J_0 = ${J0 / 2}$ A/m.

        **(b)** At the sheet $E_x = E_0\cos\omega t$, so
        $$-\mathbf J_s\cdot\mathbf E = J_0E_0\cos^2\omega t$$
        $$= (${J0})(${f(E0)})\cos^2${th}° = ${f(Pd)}\ \text{W/m}^2$$
        **(c)** For $z > 0$, $S_z = E_0H_0\cos^2(\omega t - \beta z)$ with $E_0H_0 = ${f(S0)}$ W/m². Here $\lambda = v/f = ${lam}$ m, so $\beta z = 360°\,z/\lambda$: $${30 * k1}°$ and $${30 * k2}°$. The phases are $${th - 30 * k1}°$ and $${th - 30 * k2}°$:
        $$S_z(${z1}) = ${f(S0)}\times${f(c1)} = ${f(S1)}\ \text{W/m}^2$$
        $$S_z(${z2}) = ${f(S0)}\times${f(c2)} = ${f(S2)}\ \text{W/m}^2$$
        **(d)** No current inside, so $dW/dt = P_{\text{in}}$:
        $$\frac{dW}{dt} = (${f(S1)} - ${f(S2)})(${A}) = ${f(dW)}\ \text{W}$$
        ${dW > 0 ? 'The box is storing energy at this instant.' : 'The box is releasing energy at this instant.'}

        **(e)** Over a period, $\langle\cos^2\rangle = \tfrac12$ on both faces, so the average inflow and outflow are equal and the box gains **zero** on average.

        **Speed path.** (a) $\eta J_0/2$; (b) twice one side; (c) one $\cos^2$ per face; (d) subtract, times area; (e) a lossless box never gains energy on average.

        **Where points go.** $\eta_0$ in a dielectric; one side only in (b); the sign in (d); confusing "the far face carries more" with "energy is stored".
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank, lesson 1
  EM.BANK['w1-poynting'] = [
    Q(md`The Poynting theorem is a statement of…`,
      ['conservation of energy', 'conservation of charge', 'conservation of momentum', 'the wave equation'], 0,
      [null, md`That is the continuity equation, $\nabla\cdot\mathbf J + \partial\rho/\partial t = 0$, the model the theorem copies.`, 'Momentum needs a force law and the fields\' momentum; this theorem is about energy and power.', 'The wave equation comes from the curls too, but it describes how fields move, not where energy goes.'],
      md`Flow out + growth of storage + conversion to other forms = 0. Every term is a power per unit volume.`),
    Q(md`The units of $\mathbf S = \mathbf E\times\mathbf H$ are…`,
      ['W/m²', 'W/m³', 'J/m³', 'V·A'], 0,
      [null, md`W/m³ is the units of $\nabla\cdot\mathbf S$, one derivative later.`, 'J/m³ is an energy density.', md`V·A = W is a total power; $\mathbf S$ is per square meter: (V/m)(A/m).`],
      md`(V/m)(A/m) = W/m².`),
    Q(md`In a perfect dielectric carrying a wave, which term of the Poynting theorem is zero?`,
      [md`$\mathbf J\cdot\mathbf E$`, md`$\nabla\cdot\mathbf S$`, md`$\partial w/\partial t$`, 'none of them'], 0,
      [null, md`$\nabla\cdot\mathbf S$ is not zero at an instant: energy piles up and drains as the wave passes.`, md`The stored energy rises and falls twice per period.`, md`$\sigma = 0$ makes $\mathbf J = 0$, so one term vanishes.`],
      md`No free current, so $\mathbf J\cdot\mathbf E = 0$ and $\nabla\cdot\mathbf S = -\partial w/\partial t$.`),
    Q(md`In a lossless dielectric, at a point where $\nabla\cdot\mathbf S < 0$, the stored energy density is…`,
      ['increasing', 'decreasing', 'constant', 'zero'], 0,
      [null, md`Negative divergence means net inflow. With no losses, inflow is stored.`, md`Only if $\nabla\cdot\mathbf S = 0$.`, 'The sign of the divergence says nothing about the size of w, only how it changes.'],
      md`$\partial w/\partial t = -\nabla\cdot\mathbf S > 0$.`),
    Q(md`In the component proof of $\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot\nabla\times\mathbf E - \mathbf E\cdot\nabla\times\mathbf H$, the product rule produces how many terms before grouping?`,
      ['12', '6', '9', '3'], 0,
      [null, 'That counts the products, before the product rule splits each one in two.', 'Each of the three components has two products, and each product splits in two: 3 × 2 × 2.', 'That is the number of components.'],
      md`Three components × two products each × two pieces each = 12. Six group into $\mathbf H\cdot\nabla\times\mathbf E$ and six into $-\mathbf E\cdot\nabla\times\mathbf H$.`),
    Q(md`The divergence theorem, as used for the box form, says…`,
      [md`$\int_V\nabla\cdot\mathbf S\,dV = \oint_A\mathbf S\cdot d\mathbf A$`, md`$\int_V\nabla\cdot\mathbf S\,dV = -\oint_A\mathbf S\cdot d\mathbf A$`, md`$\oint_C\mathbf S\cdot d\mathbf l = \int_A\nabla\times\mathbf S\cdot d\mathbf A$`, md`$\int_V\nabla\cdot\mathbf S\,dV = 0$ for any closed surface`], 0,
      [null, md`With outward $d\mathbf A$ there is no minus sign; the minus appears when you talk about power flowing in.`, 'That is Stokes\' theorem, for curls and line integrals.', 'Only if the net flow out is zero, which is not true in general.'],
      md`The sum of the tiny boxes' outflows: inner faces cancel, the outer surface remains.`),
    Q(md`A resistor of $4\ \Omega$ carries a steady 3 A. With outward $d\mathbf A$ on a closed surface around it, $\oint\mathbf S\cdot d\mathbf A$ is…`,
      ['−36 W', '+36 W', '−12 W', '0'], 0,
      [null, 'With outward dA the integral is the power out. The resistor absorbs, so energy flows in: negative.', md`That is $IR$, a voltage, with the power's sign.`, md`DC fields still carry energy: $\mathbf S$ points into the resistor.`],
      md`Steady state: power in $= I^2R = 36$ W, so the outward flux is $-36$ W.`),
    Q(md`While a parallel-plate capacitor is being charged, the Poynting vector at the open edge of the gap points…`,
      ['into the gap, toward the axis', 'out of the gap, away from the axis', 'from one plate to the other', 'it is zero, since no charge crosses the gap'], 0,
      [null, md`Outward flow would empty the field, but the stored energy $\tfrac12CV^2$ is growing.`, md`$\mathbf S$ is perpendicular to $\mathbf E$, which runs plate to plate.`, md`Displacement current makes $\mathbf H$ in the gap, and $\mathbf E\times\mathbf H \neq 0$.`],
      md`$\mathbf E$ grows across the gap; the displacement current makes $\mathbf H$ circle the axis; $\mathbf E\times\mathbf H$ points radially inward. Energy enters the gap from the sides, as the box form needs.`),
    Q(md`A closed surface in empty space: at some instant 4 W flows in through one part and 4 W flows out through another. The stored field energy inside is…`,
      ['not changing at that instant', 'growing at 8 W', 'shrinking at 4 W', 'growing at 4 W'], 0,
      [null, 'That adds the in- and outflow. They cancel.', 'In and out are equal, so nothing is lost.', 'The 4 W that enters also leaves.'],
      md`$P_{\text{in}} = 4 - 4 = 0$ and $\mathbf J = 0$, so $dW/dt = 0$.`),
    Q(md`Is $\nabla\cdot\mathbf S + \partial w/\partial t = 0$ true for a radio wave in seawater?`,
      [md`No: $\mathbf J\cdot\mathbf E = \sigma E^2$ is missing`, md`Yes: it is the Poynting theorem`, md`Yes, because seawater stores no magnetic energy`, md`No: seawater has no $\partial w/\partial t$`], 0,
      [null, md`The full theorem has a third term. Seawater conducts, so it is not zero.`, md`Seawater has $\mu \approx \mu_0$; it stores magnetic energy like anything else.`, 'The fields oscillate, so the stored energy changes.'],
      md`$\nabla\cdot\mathbf S + \partial w/\partial t = -\sigma E^2$ in a conductor.`),
    Q(md`On a current sheet, $-\mathbf J_s\cdot\mathbf E > 0$ means…`,
      ['the sheet supplies power to the fields', 'the sheet absorbs power from the fields', 'the sheet stores energy', 'the waves carry energy toward the sheet'], 0,
      [null, md`Absorbing means $\mathbf J_s\cdot\mathbf E > 0$, like a resistor.`, 'A sheet has no volume to store energy in.', 'The waves leave the sheet; their S points away from it.'],
      md`$-\mathbf J\cdot\mathbf E$ is the power injected per unit volume; per unit area on a sheet.`),
    Q(md`In a standing wave, how much energy crosses a plane where $E$ is always zero?`,
      ['none, at any instant', 'half of the stored energy each period', 'all of it, twice per period', 'it depends on the instant'], 0,
      [null, md`$S = E\times H = 0$ when $E = 0$, at every instant.`, md`With $E = 0$ there, $\mathbf S = 0$ there.`, md`$S_z \propto \sin2\beta z$ vanishes at the node for all $t$.`],
      md`$\mathbf S = \mathbf E\times\mathbf H$ and $\mathbf E = 0$ on the plane: nothing crosses it.`),
    Q(md`At an instant when $E = 0$ everywhere in a standing wave, the field energy is…`,
      ['all magnetic', 'zero', 'all electric', 'half electric, half magnetic'], 0,
      [null, md`$H$ is at its peak at that instant; its energy is not zero.`, md`$E = 0$ means $w_e = 0$.`, md`The split is equal only in a single traveling wave.`],
      md`$E \propto \sin\omega t$ and $H \propto \cos\omega t$: when one is zero, the other peaks.`),
    Q(md`$\dfrac{\partial}{\partial t}(\mathbf H\cdot\mathbf H)$ equals…`,
      [md`$2\mathbf H\cdot\partial\mathbf H/\partial t$`, md`$\mathbf H\cdot\partial\mathbf H/\partial t$`, md`$2\,\partial\mathbf H/\partial t$`, md`$(\partial\mathbf H/\partial t)^2$`], 0,
      [null, 'The chain rule brings down a factor of 2.', 'That is a vector; the left side is a scalar.', 'Differentiating a square brings down the function once.'],
      md`$\partial_t(H_x^2 + H_y^2 + H_z^2) = 2\mathbf H\cdot\partial_t\mathbf H$.`),
    Q(md`At some point $w_e = 3$ nJ/m³ and $w_m = 1$ nJ/m³ at the same instant, in a lossless medium. The field there can be…`,
      ['a superposition of waves, such as a standing wave', 'a single traveling plane wave', 'nothing: w_e must always equal w_m', 'a single plane wave in a lossy medium only'], 0,
      [null, md`A single traveling wave has $E = \eta H$, which forces $w_e = w_m$ at every point and instant.`, md`That equality holds only for one traveling wave. Two waves can split the energy unequally.`, 'The medium here is lossless; superposition is enough.'],
      md`In a standing wave $w_e \propto \sin^2\beta z\sin^2\omega t$ and $w_m \propto \cos^2\beta z\cos^2\omega t$: any split is possible.`),
    Q(md`A conductor with $\sigma = 2$ S/m has $|\mathbf E| = 3$ V/m at a point. $\mathbf J\cdot\mathbf E$ there is…`,
      ['18 W/m³', '6 W/m³', '9 W/m³', '4.5 W/m³'], 0,
      [null, md`That is $\sigma E$, the current density in A/m².`, md`That is $\sigma E^2/2$: no ½ at an instant.`, md`That is $E^2/\sigma$; heat grows with $\sigma$.`],
      md`$\sigma E^2 = (2)(9) = 18$ W/m³.`),
    Q(md`7 W of electromagnetic power flows into a region and 3 W becomes heat inside. The stored field energy changes at…`,
      ['+4 W', '+10 W', '−4 W', '+7 W'], 0,
      [null, 'Heat leaves the field; subtract it.', 'That flips both signs.', 'That forgets the heat.'],
      md`$dW/dt = P_{\text{in}} - P_{\text{heat}} = 7 - 3 = 4$ W.`),
    Q(md`A closed region in empty space loses field energy at 2 W. The net power flowing out through its surface is…`,
      ['2 W', '−2 W', '0', '4 W'], 0,
      [null, 'Out is positive in this sign convention, and energy is leaving.', md`Only if the energy stayed constant. Here $dW/dt = -2$ W.`, 'Nothing doubles it.'],
      md`$\oint\mathbf S\cdot d\mathbf A = -dW/dt - \int\mathbf J\cdot\mathbf E\,dV = 2 - 0 = 2$ W.`),
    Q(md`Which product has units of W/m³?`,
      [md`$\mathbf J\cdot\mathbf E$`, md`$\mathbf E\cdot\mathbf H$`, md`$\epsilon E^2$`, md`$\mathbf J\cdot\mathbf H$`], 0,
      [null, md`(V/m)(A/m) = W/m², the units of $|\mathbf S|$.`, md`$\epsilon E^2$ is J/m³, an energy density.`, md`(A/m²)(A/m) = A²/m³, not a power.`],
      md`(A/m²)(V/m) = W/m³.`),
    Q(md`The energy in a quarter-wave cell of a standing wave, between a node of $E$ and the next node of $H$, is constant in time because…`,
      [md`$\mathbf S = 0$ on both faces and $\mathbf J = 0$ inside`, 'the fields inside are constant', 'the electric and magnetic energies are always equal', 'the cell is a whole number of wavelengths long'], 0,
      [null, 'The fields oscillate; only their total energy in the cell is fixed.', 'They trade places: all magnetic at one instant, all electric a quarter period later.', 'A quarter wavelength is not a whole number of wavelengths.'],
      md`Box form: $dW/dt = P_{\text{in}} - P_{\text{heat}} = 0 - 0$.`),
    Q(md`Why does $\mathbf S = \mathbf E\times\mathbf H$ deserve the name "energy flux"?`,
      ['In the theorem it sits where J sits in the continuity equation', 'Because it points along E', 'Because its units are J/m³', 'Because it is always positive'], 0,
      [null, md`$\mathbf S$ is perpendicular to $\mathbf E$.`, 'Its units are W/m², energy per area per time.', 'It is a vector with any direction; its components can be negative.'],
      md`$\nabla\cdot\mathbf S$ plays the role of $\nabla\cdot\mathbf J$: net flow out of a point.`),
    Q(md`The sheet's formula gives $E_x = \tfrac{\eta}{2}J_s(t)$ at $z = 0$ for $\mathbf J_s = -J_s(t)\hat x$. In free space with $J_s = 4$ A/m (steady, during a long pulse), the sheet delivers…`,
      ['3016 W/m²', '1508 W/m²', '754 W/m²', '6032 W/m²'], 0,
      [null, 'That is one side. The sheet feeds both.', md`That uses $J_s = 2$; square the 4.`, md`That uses $E = \eta J_s$; the formula has $\eta/2$.`],
      md`$-\mathbf J_s\cdot\mathbf E = \tfrac{\eta_0}{2}J_s^2 = (60\pi)(16) = 960\pi \approx 3016$ W/m², half to each side.`),
  ];

  // ================================================================ lesson 2: time-averaged power
  // ---------------------------------------------------------------- figures
  // the product of two sinusoids and its average: 60 degrees apart (average 1/4) and 90 degrees apart (average 0)
  const prodPlot = (lagDeg, avg) => PF.plot({
    w: 300, h: 170, x: [0, 2], y: [-1.15, 1.25], zero: true, xl: 't/T', mr: 30,
    xt: [[1, '1'], [2, '2']], yt: [[1, '1'], [-1, '-1']],
    curves: [
      { f: (t) => Math.cos(2 * Math.PI * t), cls: 'dim thin' },
      { f: (t) => Math.cos(2 * Math.PI * t - lagDeg * DEG), cls: 'dash thin' },
      { f: (t) => Math.cos(2 * Math.PI * t) * Math.cos(2 * Math.PI * t - lagDeg * DEG), n: 400 },
    ],
    hlines: [[avg, '']],
  });
  const prodFig = () => PF.row([
    { svg: prodPlot(60, 0.25), cap: '$60°$ apart: the product (solid) is mostly positive and averages $\\tfrac12\\cos60° = \\tfrac14$ (dashed line).' },
    { svg: prodPlot(90, 0), cap: '$90°$ apart: the product spends equal time above and below zero and averages 0.' },
  ]).svg;
  // two opposite waves, E+ = 10 and E- = 5: the electric and magnetic averages trade places along z, the sum is flat
  const wFig = () => PF.plot({
    w: 380, h: 190, x: [0, 1], y: [0, 2.35], xl: 'z/\\lambda', yl: '\\langle w\\rangle',
    xt: [[0.25, '\\tfrac14'], [0.5, '\\tfrac12'], [0.75, '\\tfrac34'], [1, '1']], yt: [[1, '1'], [2, '2']],
    curves: [
      { f: (z) => 1 + 0.8 * Math.cos(4 * Math.PI * z), lab: '\\langle w_e\\rangle', labAt: 0.03, dx: 6, dy: -12 },
      { f: (z) => 1 - 0.8 * Math.cos(4 * Math.PI * z), cls: 'dash', lab: '\\langle w_m\\rangle', labAt: 0.21, dx: 10, dy: 2 },
      { f: () => 2, cls: 'thick', lab: '\\text{sum}', labAt: 0.78, dx: 0, dy: -10 },
    ],
  });
  // a lossy wave: the field envelope falls as e^{-alpha z}, the average power as e^{-2 alpha z}
  const lossFig = () => PF.plot({
    w: 380, h: 180, x: [0, 2.6], y: [0, 1.15], xl: '\\alpha z', yl: '\\text{fraction}',
    xt: [[1, '1'], [2, '2']], yt: [[1, '1'], [Math.exp(-1), 'e^{-1}'], [Math.exp(-2), 'e^{-2}']],
    curves: [
      { f: (z) => Math.exp(-z), cls: 'dash', lab: '|E|', labAt: 1.6, dx: 6, dy: -12 },
      { f: (z) => Math.exp(-2 * z), lab: '\\langle S\\rangle', labAt: 0.7, dx: 8, dy: -2 },
    ],
  });

  // ---------------------------------------------------------------- the lesson
  EM.lesson('w1', {
    id: 'w1-avg', topic: 4, ref: 'Lectures 20-21', title: 'Time-averaged power',
    steps: [
      R(md`
        !!key Why you care
          Almost every exam asks for a time-averaged Poynting vector. Spring 2017 asked for $\langle\mathbf S\rangle$ of a wave with two components (SP17 #4(b)). Spring 2024 asked how $\langle\mathbf S\rangle$ changes as a wave moves through a good conductor (SP24 #2(c)). The homework asks for the average power through 1 m². Your sheet gives one line, $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. In this lesson you derive it from the average of a product of two cosines, then use it on one wave, on two polarizations, on waves going both ways, and on lossy waves. Three slips cost the most points: **dropping the conjugate, dropping the ½, and treating an rms value as a peak.**

        ### Notation

        - $\mathbf S(t) = \mathbf E(t)\times\mathbf H(t)$: the **instantaneous** Poynting vector (W/m²). It changes within each period.
        - $\langle g\rangle = \dfrac1T\displaystyle\int_0^Tg(t)\,dt$: the **time average** of $g$ over one period $T = 2\pi/\omega$.
        - $\tilde{\mathbf E}$, $\tilde{\mathbf H}$: phasors ([Topic 1](#/l/w1-phasor)), with $\mathbf E(t) = \Re\{\tilde{\mathbf E}e^{j\omega t}\}$.
        - $\tilde H^*$: the **complex conjugate**: flip the sign of every $j$. If $\tilde H = He^{j\theta}$, then $\tilde H^* = He^{-j\theta}$.
        - $\langle\mathbf S\rangle$ (W/m²): the time-averaged Poynting vector, what exams call "the average power density".
        - $E_0$: the **peak** value, the number in front of the cosine. $E_{\text{rms}} = E_0/\sqrt2$: the root-mean-square value.
        - $E^+$, $E^-$: the amplitudes of the waves traveling toward $+z$ and toward $-z$.
        - $\alpha$, $|\eta|$, $\tau$: the decay constant, and the size and angle of $\eta$ in a lossy medium ([Topic 5](#/l/w2-gamma)).

        ### 1. Why average, and the average of cos²

        A wave at 1 GHz swings its $\mathbf S$ two billion times a second. No thermometer, solar cell or power meter can follow that. They respond to the average. So define the average over one period:
        $$\langle g\rangle = \frac1T\int_0^Tg(t)\,dt$$
        For one traveling plane wave, watched at a fixed point, $S(t) = (E_0^2/\eta)\cos^2(\omega t + \phi)$ ([Topic 17](#/l/t17-poynting)). So you need $\langle\cos^2\rangle$. Use the double-angle identity:
        $$\cos^2x = \tfrac12\big(1 + \cos2x\big)$$
        Average each piece. The $\tfrac12$ is a constant, so its average is $\tfrac12$. The term $\cos(2\omega t + 2\phi)$ runs through exactly two full cycles in one period, with as much area above zero as below, so its average is 0:
        $$\langle\cos^2(\omega t + \phi)\rangle = \tfrac12$$
        Therefore
        $$\boxed{\langle S\rangle = \frac{E_0^2}{2\eta}}$$
        **The average is half the peak**, whatever the phase $\phi$.

        !!intuition Does this make sense?
          $\cos^2$ swings between 0 and 1 and spends as long above $\tfrac12$ as below it. Its graph is symmetric about $\tfrac12$, so its average must be $\tfrac12$. The same holds for $\sin^2$.
      `),
      Q(md`**Predict.** At a fixed point, $S(t) = 8\cos^2(\omega t + 30°)$ W/m². Its time average is…`,
        [md`$4$ W/m²`, md`$8$ W/m²`, md`$2$ W/m²`, md`$3.46$ W/m²`], 0,
        [null, md`That is the peak. $\cos^2$ averages to $\tfrac12$.`, md`That takes half twice. $\langle\cos^2\rangle = \tfrac12$, once.`, md`That is $4\cos30°$. The phase does not change the average of $\cos^2$.`],
        md`$\langle S\rangle = 8\langle\cos^2(\omega t + 30°)\rangle = 8\times\tfrac12 = 4$ W/m².`),
      RF(md`
        ### 2. The average of a product of two cosines

        $\mathbf E$ and $\mathbf H$ are not always in phase: in a lossy medium $H$ lags $E$ by $\tau$. So you need the average of a product of two cosines with different phases:
        $$a(t) = A\cos(\omega t + \theta_a)$$
        $$b(t) = B\cos(\omega t + \theta_b)$$
        Use the product-to-sum identity:
        $$\cos x\cos y = \tfrac12\big[\cos(x - y) + \cos(x + y)\big]$$
        With $x = \omega t + \theta_a$ and $y = \omega t + \theta_b$, the $\omega t$ cancels in $x - y$ and doubles in $x + y$:
        $$ab = \tfrac12AB\big[\cos(\theta_a - \theta_b) + \cos(2\omega t + \theta_a + \theta_b)\big]$$
        The first term is a constant. The second goes through two full cycles in one period and averages to zero:
        $$\boxed{\langle ab\rangle = \tfrac12AB\cos(\theta_a - \theta_b)}$$

        [[fig:prod]]

        !!intuition Does this make sense?
          Same phase: $\cos0 = 1$ and you are back to $\tfrac12AB$, Section 1. $90°$ apart: $\cos90° = 0$, no average at all: half the time the product is positive and half the time negative. $180°$ apart: $-\tfrac12AB$, the average points backward. **Only the part of $b$ that is in time phase with $a$ counts.**
      `, { prod: { svg: prodFig(), cap: 'Thin solid: $a = \\cos\\omega t$. Thin dashed: $b$, lagging. Thick: the product $ab$.' } }),
      Q(md`**Predict.** $\langle4\cos(\omega t)\cdot3\cos(\omega t - 60°)\rangle$ equals…`,
        ['3', '6', '12', '5.2'], 0,
        [null, md`That is $\tfrac12AB$: it ignores the $60°$ between them.`, md`That is $AB$, with neither the $\tfrac12$ nor the $\cos$.`, md`That is $\tfrac12AB\sin60°$. The formula has the cosine of the phase difference.`],
        md`$\tfrac12(4)(3)\cos(0° - (-60°)) = 6\cos60° = 3$.`),
      R(md`
        ### 3. The same thing with phasors: where the conjugate comes from

        The phasors of $a$ and $b$ are $\tilde A = Ae^{j\theta_a}$ and $\tilde B = Be^{j\theta_b}$. You want a phasor expression that produces $\tfrac12AB\cos(\theta_a - \theta_b)$. The **difference** of the angles appears when you multiply $\tilde A$ by the **conjugate** of $\tilde B$:
        $$\tilde A\tilde B^* = Ae^{j\theta_a}\,Be^{-j\theta_b}$$
        Multiply the sizes and add the exponents:
        $$\tilde A\tilde B^* = AB\,e^{j(\theta_a - \theta_b)}$$
        Its real part is $AB\cos(\theta_a - \theta_b)$. So
        $$\boxed{\langle ab\rangle = \tfrac12\Re\{\tilde A\tilde B^*\}}$$
        This is the product rule of [Topic 1](#/l/w1-phasor).

        **Why the conjugate is not optional.** Without it the angles add:
        $$\tilde A\tilde B = AB\,e^{j(\theta_a + \theta_b)}$$
        Now shift the clock by $t_0$. Both $\theta_a$ and $\theta_b$ grow by $\omega t_0$. Their sum changes, so $\Re\{\tilde A\tilde B\}$ changes. But a true average cannot depend on when you started the clock. In the difference $\theta_a - \theta_b$ the shifts cancel. ✓

        **Which one gets the star?** Either. $\tilde A\tilde B^*$ and $\tilde A^*\tilde B$ are conjugates of each other, and a number and its conjugate have the same real part.

        !!intuition Does this make sense?
          This is the circuits formula $P = \tfrac12\Re\{\tilde V\tilde I^*\}$ from ECE 210, with the same ½ and the same star. Lecture 21 proves the field version the same way.
      `),
      Q(md`**Predict.** $\tilde A = 4e^{j90°}$ and $\tilde B = 3e^{-j30°}$. Then $\langle ab\rangle$ is…`,
        ['−3', '3', '−6', '6'], 0,
        [null, md`That forgets the conjugate: $\tfrac12\Re\{\tilde A\tilde B\}$ adds the angles, $90° - 30° = 60°$, and $\tfrac12(12)\cos60° = 3$.`, md`That is $\Re\{\tilde A\tilde B^*\}$ without the $\tfrac12$.`, md`That ignores the phase: $\tfrac12AB$. The angles are $120°$ apart.`],
        md`$\tilde A\tilde B^* = 12e^{j(90° + 30°)} = 12e^{j120°}$, and $\tfrac12\Re = 6\cos120° = -3$. Negative: on average the product points backward.`),
      R(md`
        ### 4. Vectors: ⟨S⟩ = ½Re{Ẽ × H̃*}

        $\mathbf S = \mathbf E\times\mathbf H$ is built from products of components. Its $x$-component is
        $$S_x = E_yH_z - E_zH_y$$
        Average it. The average of a difference is the difference of the averages, and each product follows Section 3:
        $$\langle S_x\rangle = \tfrac12\Re\{\tilde E_y\tilde H_z^*\} - \tfrac12\Re\{\tilde E_z\tilde H_y^*\}$$
        Both $\tfrac12$ and "real part of" pass through a difference, so pull them out:
        $$\langle S_x\rangle = \tfrac12\Re\{\tilde E_y\tilde H_z^* - \tilde E_z\tilde H_y^*\}$$
        The bracket is the $x$-component of $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$. The $y$- and $z$-components work the same way, so
        $$\boxed{\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}}$$
        That is the line on your sheet. The vector $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$ itself is called the **complex Poynting vector**.

        !!intuition Does this make sense?
          Where does the ½ come from? From $\langle\cos^2\rangle = \tfrac12$: a sinusoid spends only part of its time near its peak. Where does the star come from? From the angle **difference**: only the part of $\mathbf H$ that is in time phase with $\mathbf E$ carries power on average.
      `),
      Q(md`**Predict.** At a point, $\tilde{\mathbf E} = 10\,\hat x$ V/m and $\tilde{\mathbf H} = j0.1\,\hat y$ A/m. Then $\langle\mathbf S\rangle$ is…`,
        [md`$0$`, md`$0.5\,\hat z$ W/m²`, md`$1\,\hat z$ W/m²`, md`$-0.5\,\hat z$ W/m²`], 0,
        [null, md`That drops the $j$: $\tfrac12|E||H|$. But $\tilde{\mathbf H}^* = -j0.1\hat y$ makes the product imaginary.`, md`That drops both the $j$ and the $\tfrac12$.`, md`That treats $j\cdot(-j)$ as $-1$. Here the product is $10\times(-j0.1) = -j$, which has no real part at all.`],
        md`$\tilde{\mathbf E}\times\tilde{\mathbf H}^* = 10\hat x\times(-j0.1\hat y) = -j\,\hat z$. Its real part is 0. $E$ and $H$ are $90°$ apart in time, so the energy sloshes back and forth with no average flow.`),
      R(md`
        ### 5. One plane wave: E₀²/2η

        Take the forward plane wave in a lossless medium, with a starting phase $\phi$:
        $$\tilde{\mathbf E} = \hat x\,E_0e^{j\phi}e^{-j\beta z}$$
        $$\tilde{\mathbf H} = \hat y\,\frac{E_0}{\eta}e^{j\phi}e^{-j\beta z}$$
        Conjugate $\tilde{\mathbf H}$. Every $j$ changes sign; $E_0$ and $\eta$ are real and stay:
        $$\tilde{\mathbf H}^* = \hat y\,\frac{E_0}{\eta}e^{-j\phi}e^{+j\beta z}$$
        Cross them. $\hat x\times\hat y = \hat z$, and the exponentials cancel in pairs:
        $$\tilde{\mathbf E}\times\tilde{\mathbf H}^* = \hat z\,\frac{E_0^2}{\eta}$$
        Take the real part and the $\tfrac12$. With $H_0 = E_0/\eta$:
        $$\boxed{\langle\mathbf S\rangle = \hat z\,\frac{E_0^2}{2\eta} = \hat z\,\frac{\eta H_0^2}{2}}$$
        Two things to notice. **It does not depend on $z$**: a lossless wave carries the same power everywhere. **It does not depend on $\phi$**: shifting the clock changes nothing.

        !!intuition Does this make sense?
          Free-space numbers to keep: $\eta_0 = 120\pi \approx 377\ \Omega$. $E_0 = 1$ V/m gives $1/240\pi \approx 1.33$ mW/m². $H_0 = 1$ A/m gives $60\pi \approx 188$ W/m².

        !!trap A built-in alarm
          If your $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$ for a single lossless wave still contains $e^{-j2\beta z}$, you forgot the conjugate. Its average power cannot depend on where you stand.
      `),
      Q(md`**Predict.** A plane wave with $E_0 = 60$ V/m travels in a lossless medium with $\epsilon_r = 4$, $\mu_r = 1$. Its $\langle S\rangle$ is…`,
        [md`$9.55$ W/m²`, md`$19.1$ W/m²`, md`$4.77$ W/m²`, md`$0.159$ W/m²`], 0,
        [null, md`That is $E_0^2/\eta$, the peak. The average has a $\tfrac12$.`, md`That uses $\eta_0 = 120\pi$. In this medium $\eta = 60\pi$.`, md`That forgets to square $E_0$: $60/(2\cdot60\pi)$.`],
        md`$\eta = 120\pi/2 = 60\pi\ \Omega$, so $\langle S\rangle = 3600/(120\pi) = 30/\pi \approx 9.55$ W/m².`),
      R(md`
        ### 6. Power through an area, and rms values

        $\langle S\rangle$ is power per square meter. For a flat area $A$ whose unit normal $\hat n$ makes an angle $\theta$ with $\langle\mathbf S\rangle$:
        $$\langle P\rangle = (\langle\mathbf S\rangle\cdot\hat n)\,A = \langle S\rangle A\cos\theta$$
        Only the part of the flow that crosses the area counts. Over a time $\Delta t$ much longer than a period, the energy through it is $\langle P\rangle\Delta t$.

        **rms values.** Meters and power engineers often quote $E_{\text{rms}} = E_0/\sqrt2$. Then $E_0^2 = 2E_{\text{rms}}^2$, and
        $$\langle S\rangle = \frac{E_0^2}{2\eta} = \frac{2E_{\text{rms}}^2}{2\eta}$$
        The 2s cancel:
        $$\boxed{\langle S\rangle = \frac{E_{\text{rms}}^2}{\eta}}$$
        **No ½ with rms values**: it is already inside $E_{\text{rms}}^2$. Exam fields are peak values, the number in front of the cosine, unless the problem says rms.
      `),
      Q(md`**Predict.** A meter reads $E_{\text{rms}} = 30$ V/m in free space. The average power density is…`,
        [md`$2.39$ W/m²`, md`$1.19$ W/m²`, md`$4.77$ W/m²`, md`$0.0796$ W/m²`], 0,
        [null, md`That puts a $\tfrac12$ on an rms value. The $\tfrac12$ is already inside $E_{\text{rms}}^2$.`, md`That converts rms to peak with a factor 2 instead of $\sqrt2$: $60^2/2\eta_0$.`, md`That forgets to square: $30/377$.`],
        md`$\langle S\rangle = E_{\text{rms}}^2/\eta_0 = 900/(120\pi) = 7.5/\pi \approx 2.39$ W/m².`),
      R(md`
        ### 7. Two polarizations: the powers add

        Two waves travel toward $+z$ in the same medium, one polarized along $\hat x$, one along $\hat y$, with any phase difference $\psi$:
        $$\tilde{\mathbf E} = \big(\hat x\,E_1 + \hat y\,E_2e^{j\psi}\big)e^{-j\beta z}$$
        For a wave toward $+z$, $\tilde{\mathbf H} = \tfrac1\eta\hat z\times\tilde{\mathbf E}$. Since $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$:
        $$\tilde{\mathbf H} = \frac1\eta\big(\hat y\,E_1 - \hat x\,E_2e^{j\psi}\big)e^{-j\beta z}$$
        Multiply out $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$. There are four cross products. Two are zero, because a vector crossed with itself is zero ($\hat x\times\hat x = \hat y\times\hat y = 0$). Two survive:

        - $\hat x E_1\times\hat y\tfrac{E_1}{\eta} = \hat z\tfrac{E_1^2}{\eta}$
        - $\hat yE_2e^{j\psi}\times(-\hat x)\tfrac{E_2}{\eta}e^{-j\psi} = \hat z\tfrac{E_2^2}{\eta}$, because $\hat y\times(-\hat x) = \hat z$ and $e^{j\psi}e^{-j\psi} = 1$

        So
        $$\langle\mathbf S\rangle = \hat z\,\frac{E_1^2 + E_2^2}{2\eta}$$
        The phase $\psi$ dropped out. **Perpendicular polarizations carry their power independently: the powers add.** Linear, circular or elliptical, a single wave carries $|\tilde{\mathbf E}|^2/2\eta$ with $|\tilde{\mathbf E}|^2 = E_1^2 + E_2^2$.

        **Same polarization, by contrast.** Two $\hat x$-waves with phases 0 and $\psi$ add their amplitudes first, $\tilde E_x = (E_1 + E_2e^{j\psi})e^{-j\beta z}$, so
        $$\langle S\rangle = \frac{|E_1 + E_2e^{j\psi}|^2}{2\eta}$$
        and $|E_1 + E_2e^{j\psi}|^2 = E_1^2 + E_2^2 + 2E_1E_2\cos\psi$. That ranges from $(E_1 - E_2)^2/2\eta$ to $(E_1 + E_2)^2/2\eta$. **Parallel fields interfere; perpendicular fields do not.**
      `),
      Q(md`**Predict.** In free space, $\tilde{\mathbf E} = (3\,\hat x + j4\,\hat y)e^{-j\beta z}$ V/m. Its $\langle S\rangle$ is…`,
        [md`$0.0332$ W/m²`, md`$0.0650$ W/m²`, md`$0.00928$ W/m²`, md`$0.0663$ W/m²`], 0,
        [null, md`That adds the amplitudes first, $(3 + 4)^2/2\eta_0$. Perpendicular components add powers, not amplitudes.`, md`That treats $j4$ times its conjugate as $-16$. $|j4|^2 = (j4)(-j4) = +16$.`, md`That is $|\tilde{\mathbf E}|^2/\eta_0$: the $\tfrac12$ is missing.`],
        md`$|\tilde{\mathbf E}|^2 = 9 + 16 = 25$, so $\langle S\rangle = 25/(240\pi) \approx 0.0332$ W/m².`),
      R(md`
        ### 8. Two waves going opposite ways: the powers subtract

        Now an $\hat x$-polarized wave toward $+z$ plus one toward $-z$, in a lossless medium:
        $$\tilde E_x = E^+e^{-j\beta z} + E^-e^{+j\beta z}$$
        The backward wave's $H$ carries a minus sign ([Topic 5](#/l/w2-gamma)):
        $$\tilde H_y = \frac1\eta\big(E^+e^{-j\beta z} - E^-e^{+j\beta z}\big)$$
        Multiply $\tilde E_x$ by $\tilde H_y^*$. There are four terms. The two "same-wave" terms give $|E^+|^2$ and $-|E^-|^2$; the two cross terms are $X$ and $-X^*$, with
        $$X = E^-E^{+*}e^{j2\beta z}$$
        So
        $$\eta\,\tilde E_x\tilde H_y^* = |E^+|^2 - |E^-|^2 + X - X^*$$
        A number minus its conjugate is purely imaginary: $X - X^* = 2j\,\Im\{X\}$. It disappears under $\Re$:
        $$\boxed{\langle S_z\rangle = \frac{|E^+|^2 - |E^-|^2}{2\eta}}$$
        **The net power is the difference of the two powers.** The cross terms make the energy slosh back and forth ([Topic 3](#/l/w1-poynting)) but carry no net power. Your sheet has the same structure for transmission lines: $P = |\tilde V^+|^2/2Z_0 - |\tilde V^-|^2/2Z_0$.

        **A pure standing wave** has $|E^-| = |E^+|$, so $\langle S\rangle = 0$ everywhere. Yet its energy is not zero. Energy without net flow.
      `),
      Q(md`**Predict.** In free space, $\tilde E_x = 10e^{-j\beta z} + 6e^{+j\beta z}$ V/m. The net $\langle S_z\rangle$ is…`,
        [md`$0.0849$ W/m², along $+\hat z$`, md`$0.0212$ W/m², along $+\hat z$`, md`$0.180$ W/m², along $+\hat z$`, md`$0$: two opposite waves make a standing wave`], 0,
        [null, md`That subtracts the amplitudes first, $(10 - 6)^2$. The powers subtract: $10^2 - 6^2$.`, md`That adds the two powers. The backward wave carries its power the other way.`, md`Only equal amplitudes give zero. Here more power goes forward.`],
        md`$\langle S_z\rangle = (100 - 36)/(240\pi) = 64/(240\pi) \approx 0.0849$ W/m², positive, so along $+\hat z$.`),
      RF(md`
        ### 9. Average energy densities, and ⟨S⟩ = v⟨w⟩

        The product rule with $a = b$ gives the average of a square: $\langle\mathbf E\cdot\mathbf E\rangle = \tfrac12\Re\{\tilde{\mathbf E}\cdot\tilde{\mathbf E}^*\} = \tfrac12|\tilde{\mathbf E}|^2$. So
        $$\langle w_e\rangle = \tfrac14\epsilon|\tilde{\mathbf E}|^2$$
        $$\langle w_m\rangle = \tfrac14\mu|\tilde{\mathbf H}|^2$$
        **One traveling wave.** $|\tilde{\mathbf E}| = E_0$ and $|\tilde{\mathbf H}| = E_0/\eta$. With $\mu/\eta^2 = \epsilon$, both averages equal $\tfrac14\epsilon E_0^2$:
        $$\langle w\rangle = \tfrac12\epsilon E_0^2$$
        Multiply by the speed $v = 1/\sqrt{\mu\epsilon}$:
        $$v\langle w\rangle = \frac{\epsilon E_0^2}{2\sqrt{\mu\epsilon}} = \frac{E_0^2}{2}\sqrt{\frac{\epsilon}{\mu}}$$
        and $\sqrt{\epsilon/\mu} = 1/\eta$:
        $$v\langle w\rangle = \frac{E_0^2}{2\eta} = \langle S\rangle$$
        The average power is the average energy riding along at the wave speed:
        $$\boxed{\langle S\rangle = v\langle w\rangle}$$
        **Two opposite waves.** From Section 8, $|\tilde E_x|^2 = |E^+|^2 + |E^-|^2 + 2\Re\{X\}$ and $\eta^2|\tilde H_y|^2 = |E^+|^2 + |E^-|^2 - 2\Re\{X\}$. In $\langle w_e\rangle + \langle w_m\rangle$ the cross terms cancel:
        $$\langle w\rangle = \tfrac12\epsilon\big(|E^+|^2 + |E^-|^2\big)$$
        **Energies add; powers subtract.** So $\langle S\rangle = v\langle w\rangle$ holds only for a single traveling wave. With two, the energy creeps forward on average at
        $$\frac{\langle S\rangle}{\langle w\rangle} = v\,\frac{|E^+|^2 - |E^-|^2}{|E^+|^2 + |E^-|^2}$$
        which is zero for a pure standing wave.

        [[fig:w]]
      `, { w: { svg: wFig(), cap: 'Two opposite waves with $E^+ = 10$, $E^- = 5$, in units of $\\tfrac14\\epsilon(125)$. The averaged electric and magnetic energies trade places every quarter wavelength, but their sum is the same everywhere.' } }),
      Q(md`**Predict.** Two equal waves, amplitude $E_0$ each, travel in opposite directions and make a standing wave. Its average energy density, compared with one of the waves alone, is…`,
        ['twice as large', 'zero', 'four times as large', 'the same'], 0,
        [null, md`That is the average power. The energy is there; it just does not flow.`, md`At the antinodes $|\tilde E| = 2E_0$, but at the nodes it is 0. Averaged electric plus magnetic, the total is $\tfrac12\epsilon(E_0^2 + E_0^2)$.`, md`The second wave brings its own energy; energies add.`],
        md`$\langle w\rangle = \tfrac12\epsilon(|E^+|^2 + |E^-|^2) = \epsilon E_0^2$, twice the $\tfrac12\epsilon E_0^2$ of one wave.`),
      RF(md`
        ### 10. A preview of lossy media: e^{−2αz} and cos τ

        In a lossy medium ([Topic 5](#/l/w2-gamma)) the forward wave and its $\mathbf H$ are
        $$\tilde{\mathbf E} = \hat x\,E_0e^{-\alpha z}e^{-j\beta z}$$
        $$\tilde{\mathbf H} = \hat y\,\frac{E_0}{|\eta|}e^{-\alpha z}e^{-j\beta z}e^{-j\tau}$$
        Conjugate $\tilde{\mathbf H}$. $e^{-\alpha z}$ is real, so it stays; the two phases flip:
        $$\tilde{\mathbf H}^* = \hat y\,\frac{E_0}{|\eta|}e^{-\alpha z}e^{+j\beta z}e^{+j\tau}$$
        Multiply: the $\beta$ phases cancel, the decays multiply, and $e^{j\tau}$ is left:
        $$\tilde{\mathbf E}\times\tilde{\mathbf H}^* = \hat z\,\frac{E_0^2}{|\eta|}e^{-2\alpha z}e^{j\tau}$$
        Take $\tfrac12\Re$, with $\Re\{e^{j\tau}\} = \cos\tau$:
        $$\boxed{\langle\mathbf S\rangle = \hat z\,\frac{E_0^2\cos\tau}{2|\eta|}e^{-2\alpha z}}$$
        Two new things. The power decays as $e^{-2\alpha z}$, twice as fast in the exponent as the field, because power goes as field squared. And $\cos\tau < 1$: $H$ lags $E$ by $\tau$, and only the in-phase part carries power (Section 2).

        [[fig:loss]]

        **Where does the lost power go?** Average the Poynting theorem of [Topic 3](#/l/w1-poynting). The stored energy repeats every period, so $\langle\partial w/\partial t\rangle = [w(T) - w(0)]/T = 0$:
        $$\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$$
        Here $\nabla\cdot\langle\mathbf S\rangle = d\langle S_z\rangle/dz = -2\alpha\langle S_z\rangle$, and $\langle\mathbf J\cdot\mathbf E\rangle = \langle\sigma E^2\rangle = \tfrac12\sigma E_0^2e^{-2\alpha z}$. The power that leaves the wave becomes Ohmic heat. (The two agree because $\sigma = 2\alpha\cos\tau/|\eta|$, which follows from $\gamma/\eta = \sigma + j\omega\epsilon$.) [Topic 8](#/l/w2-loss) works this out fully, with dB and good conductors.
      `, { loss: { svg: lossFig(), cap: 'A lossy wave. The field (dashed) falls to $e^{-1}$ at $\\alpha z = 1$; the average power (solid) is already at $e^{-2} \\approx 14\\%$ there.' } }),
      Q(md`**Predict.** In a lossy medium with $\alpha = 0.5$ Np/m, after 2 m the average power has fallen to what fraction of its starting value?`,
        [md`$e^{-2} \approx 13.5\%$`, md`$e^{-1} \approx 36.8\%$`, md`$1 - e^{-2} \approx 86.5\%$`, md`$e^{-4} \approx 1.8\%$`], 0,
        [null, md`That is the field: $e^{-\alpha z}$. Power goes as $e^{-2\alpha z}$.`, md`That is the fraction absorbed along the way, not the fraction left.`, md`That doubles twice: $e^{-2\alpha z}$ with $\alpha z = 1$ is $e^{-2}$.`],
        md`$\langle S\rangle(2)/\langle S\rangle(0) = e^{-2\alpha z} = e^{-2(0.5)(2)} = e^{-2} \approx 0.135$.`),
      R(md`
        ### The method

        !!method ⟨S⟩ from phasors
          1. **Phasors.** Write $\tilde{\mathbf E}$. For each traveling wave, $\tilde{\mathbf H} = \tfrac1\eta\hat k\times\tilde{\mathbf E}$, where $\hat k$ is its direction of travel (so a backward wave gets a minus sign).
          2. **Conjugate $\tilde{\mathbf H}$.** Every $j$ flips sign; real factors ($E_0$, a real $\eta$, $e^{-\alpha z}$) stay.
          3. **Cross.** $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$. Parallel unit vectors give zero.
          4. **Take ½Re.** Keep only the real part, times $\tfrac12$.
          5. **Check.** For a single lossless wave: no $z$ left, $\langle\mathbf S\rangle$ along $\hat k$, and it equals $|\tilde{\mathbf E}|^2/2\eta$. Units W/m².

        ### Worked example 1: a wave with two components

        !!graded Problem
          In free space, $\tilde{\mathbf E} = (6\,\hat x - j8\,\hat y)e^{-j\beta z}$ V/m. Find $\tilde{\mathbf H}$, $\langle\mathbf S\rangle$, the average power through a 3 m² window whose normal makes $60°$ with $\hat z$, and the range of the instantaneous $S_z$ at $z = 0$.

        **Step 1: H̃.** The wave travels toward $+z$, so $\tilde{\mathbf H} = \tfrac1{\eta_0}\hat z\times\tilde{\mathbf E}$. With $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$:
        $$\tilde{\mathbf H} = \frac{1}{\eta_0}\big(6\,\hat y + j8\,\hat x\big)e^{-j\beta z}$$
        **Step 2: conjugate.**
        $$\tilde{\mathbf H}^* = \frac{1}{\eta_0}\big(6\,\hat y - j8\,\hat x\big)e^{+j\beta z}$$
        **Step 3: cross.** Four products; the two with parallel unit vectors vanish. The others:
        - $6\hat x\times6\hat y = 36\,\hat z$
        - $(-j8\hat y)\times(-j8\hat x) = (-j8)^2(\hat y\times\hat x) = (-64)(-\hat z) = 64\,\hat z$

        The exponentials cancel, so
        $$\tilde{\mathbf E}\times\tilde{\mathbf H}^* = \frac{100}{\eta_0}\,\hat z$$
        **Step 4: ½Re.**
        $$\langle\mathbf S\rangle = \frac{50}{120\pi}\,\hat z = \frac{5}{12\pi}\,\hat z \approx 0.133\,\hat z\ \text{W/m}^2$$
        Check with the shortcut: $|\tilde{\mathbf E}|^2 = 36 + 64 = 100$, and $100/2\eta_0$ ✓.

        **Step 5: the window.**
        $$\langle P\rangle = (0.133)(3)\cos60° \approx 0.199\ \text{W}$$
        **Step 6: instantaneous.** At $z = 0$, $\mathbf E = 6\cos\omega t\,\hat x + 8\sin\omega t\,\hat y$ (since $\Re\{-j8e^{j\omega t}\} = 8\sin\omega t$), and $\mathbf H = \tfrac1{\eta_0}(6\cos\omega t\,\hat y - 8\sin\omega t\,\hat x)$. Then
        $$S_z = \frac{36\cos^2\omega t + 64\sin^2\omega t}{\eta_0}$$
        It swings between $36/\eta_0 \approx 0.0955$ and $64/\eta_0 \approx 0.170$ W/m², and never reaches zero: the wave is elliptically polarized. Its average is $(36 + 64)/2\eta_0$ ✓. (For circular polarization, $E_1 = E_2$, $S$ would be constant in time.)

        **Speed path.** $\langle S\rangle = |\tilde{\mathbf E}|^2/2\eta$: add the squared sizes of the components, ignore the $j$s. Ten seconds.

        **Where points go.** Dropping the conjugate: with $+j8\,\hat x$ from $\tilde{\mathbf H}$ instead of $-j8\,\hat x$ from $\tilde{\mathbf H}^*$, the second product becomes $-64\,\hat z$ and a leftover $e^{-j2\beta z}$ appears, both signs that something is wrong; adding amplitudes $(6 + 8)^2$; forgetting $\cos60°$.

        ### Worked example 2: two waves going opposite ways

        !!graded Problem
          In free space, $\tilde E_x = 10e^{-j\beta z} + 5e^{+j\beta z}$ V/m. Find $\langle S_z\rangle$, the complex Poynting vector, $\langle w\rangle$, and the average speed at which energy moves forward.

        **Step 1: H̃.** Backward wave with a minus sign:
        $$\tilde H_y = \frac{1}{\eta_0}\big(10e^{-j\beta z} - 5e^{+j\beta z}\big)$$
        **Step 2: the product.** The same-wave terms give $100 - 25 = 75$. The cross term is $X = (5)(10)e^{j2\beta z} = 50e^{j2\beta z}$, and $X - X^* = j100\sin2\beta z$:
        $$\eta_0\tilde E_x\tilde H_y^* = 75 + j100\sin2\beta z$$
        **Step 3: ⟨S⟩.**
        $$\langle S_z\rangle = \frac{75}{2\eta_0} = \frac{5}{16\pi} \approx 0.0995\ \text{W/m}^2$$
        along $+\hat z$. The imaginary part, $100\sin2\beta z/\eta_0$, changes with $z$: that is the energy sloshing locally, with no net transport.

        **Step 4: ⟨w⟩.**
        $$\langle w\rangle = \tfrac12\epsilon_0(100 + 25) = 62.5\epsilon_0$$
        $$\langle w\rangle \approx 5.53\times10^{-10}\ \text{J/m}^3$$
        **Step 5: energy speed.**
        $$\frac{\langle S\rangle}{\langle w\rangle} = c\,\frac{100 - 25}{100 + 25} = 0.6c$$
        That is $1.8\times10^8$ m/s. The energy creeps forward at 60% of the wave speed.

        **Speed path.** Powers subtract ($|E^+|^2 - |E^-|^2$), energies add ($|E^+|^2 + |E^-|^2$).

        **Where points go.** $(10 - 5)^2$ instead of $10^2 - 5^2$; forgetting the minus sign on the backward $H$, which turns the difference into a sum.

        ### Worked example 3: SP24 #2(c), judged statement by statement

        !!graded Problem
          A $\hat z$-polarized cosinusoidal wave travels toward $+\hat x$ through a good conductor, with penetration depth $\delta = 1$ mm. Which statements about $\mathbf S$ and $\langle\mathbf S\rangle$ are true? (i) $-\nabla\cdot\mathbf S$ equals the time rate of change of the stored energy density. (ii) $\nabla\cdot\langle\mathbf S\rangle$ equals the time-averaged rate of energy dissipation. (iii) $\langle\mathbf S\rangle$ decreases as the wave propagates along $+\hat x$. (iv) $\langle\mathbf S\rangle$ would increase if the wave propagated along $-\hat x$. (v) $|\langle\mathbf S\rangle| = |\mathbf E|^2/2\eta_0$ at $x = 0$.

        **Step 1: the tools.** Point form: $-\nabla\cdot\mathbf S = \partial w/\partial t + \mathbf J\cdot\mathbf E$. Averaged: $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$. Lossy wave: $\langle S_x\rangle = \tfrac{E_0^2\cos\tau}{2|\eta|}e^{-2\alpha x}$, with $\alpha = 1/\delta = 10^3$ Np/m.

        **(i) False.** It leaves out $\mathbf J\cdot\mathbf E = \sigma E^2$, the largest term in a good conductor.

        **(ii) False as written.** $\nabla\cdot\langle\mathbf S\rangle$ is **minus** the dissipation: the flow shrinks because power is absorbed. The posted key writes "equal but opposite" next to (ii); read literally, the statement is false.

        **(iii) True.** $\langle S_x\rangle \propto e^{-2\alpha x}$ falls as $x$ grows.

        **(iv) False.** A wave toward $-\hat x$ has $\langle S\rangle \propto e^{+2\alpha x}$, which also falls in the direction it travels (as $x$ decreases). A passive material never feeds a wave.

        **(v) False.** In a good conductor $|\eta| = \sqrt{\omega\mu/\sigma}$, far below $\eta_0$, and $\tau = 45°$. The right value is $\tfrac{E_0^2\cos45°}{2|\eta|}$.

        **Answer:** only (iii).

        **Speed path.** Any statement that drops $\mathbf J\cdot\mathbf E$, flips its sign, or uses $\eta_0$ inside a material is false. Power always decays in the direction of travel.

        **Where points go.** Circling (ii) because "equal" sounds right: check the sign. Circling (iv) by reading $e^{+2\alpha x}$ as growth without asking which way the wave moves.

        !!mistake Common mistakes
          - **Forgetting the conjugate.** $\tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}\}$ depends on $z$ and on when you start the clock. The alarm: a leftover $e^{-j2\beta z}$.
          - **Forgetting the ½.** $E_0^2/\eta$ is the peak of $S(t)$, not its average.
          - **Peak versus rms.** With rms values, $\langle S\rangle = E_{\text{rms}}^2/\eta$: no ½. Exam amplitudes are peaks unless stated.
          - **$\eta_0$ in a material.** $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$, and in a lossy medium use $|\eta|$ and $\cos\tau$.
          - **Adding amplitudes of perpendicular components.** $\hat x$ and $\hat y$ parts add powers: $(E_1^2 + E_2^2)/2\eta$.
          - **Subtracting amplitudes of opposite waves.** The powers subtract: $(|E^+|^2 - |E^-|^2)/2\eta$, not $(E^+ - E^-)^2/2\eta$.
          - **$e^{-\alpha z}$ for power.** Fields decay as $e^{-\alpha z}$; power as $e^{-2\alpha z}$.

        !!key Speed tricks
          - **Any single lossless wave, any polarization:** $\langle S\rangle = |\tilde{\mathbf E}|^2/2\eta$. Add the squared sizes of the components; ignore every $j$.
          - **Free space:** $\langle S\rangle = E_0^2/240\pi$, or $60\pi H_0^2$. One V/m peak is 1.33 mW/m².
          - **rms:** drop the ½.
          - **Opposite waves:** powers subtract, energies add. Equal amplitudes: zero power.
          - **Lossy:** multiply by $\cos\tau$ and by $e^{-2\alpha z}$. A good conductor has $\cos\tau = 1/\sqrt2$.
          - **Conjugate check:** if $z$ survives in the answer for a single lossless wave, you forgot the star.

        ### Check questions
      `),
      Q(md`SP17 #4(b): a wave in a lossless medium has $\mathbf E = E_x\cos(\omega t - \beta z)\,\hat x + E_y\sin(\omega t - \beta z + \phi)\,\hat y$. Its time-averaged Poynting vector is…`,
        [md`$\dfrac{E_x^2 + E_y^2}{2\eta}\,\hat z$`, md`$\dfrac{E_x^2 + E_y^2 + 2E_xE_y\sin\phi}{2\eta}\,\hat z$`, md`$\dfrac{(E_x + E_y)^2}{2\eta}\,\hat z$`, md`$\dfrac{E_x^2 - E_y^2}{2\eta}\,\hat z$`], 0,
        [null, md`A cross term would need parallel components. $\hat x$ and $\hat y$ parts never mix in $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$.`, md`That adds the amplitudes. Perpendicular components add powers.`, md`The minus sign would come from waves going opposite ways. Both of these travel toward $+z$.`],
        md`Each component is its own plane wave toward $+z$; perpendicular polarizations add powers: $\langle\mathbf S\rangle = (E_x^2 + E_y^2)/2\eta\,\hat z$, for any $\phi$.`, { src: 'SP17 #4(b)' }),
      Q(md`For a single lossless plane wave you compute $\tilde{\mathbf E}\times\tilde{\mathbf H}^* = 4e^{-j2\beta z}\,\hat z$. What went wrong?`,
        ['the conjugate was left off H̃', 'nothing: average power can vary with z', 'the ½ was left off', 'the wave must be traveling toward −z'], 0,
        [null, md`A lossless single wave carries the same power at every $z$. A $z$-dependent phase means the exponentials did not cancel.`, md`A missing $\tfrac12$ changes the size, not the $z$-dependence.`, md`Direction changes the sign of $\langle\mathbf S\rangle$, not whether $z$ cancels.`],
        md`With $\tilde{\mathbf H}^*$ the $e^{-j\beta z}$ of $\tilde{\mathbf E}$ meets $e^{+j\beta z}$ and cancels. Without the star they multiply to $e^{-j2\beta z}$.`),
      Q(md`Two free-space waves: one has a peak of 10 V/m, the other an rms value of 10 V/m. Compare their average power densities.`,
        ['the rms one carries twice as much', 'they carry the same', 'the peak one carries twice as much', 'the rms one carries √2 times as much'], 0,
        [null, md`An rms of 10 V/m means a peak of $10\sqrt2$ V/m.`, md`Backwards: the peak of the rms one is larger.`, md`Power goes as the square of the field: $(\sqrt2)^2 = 2$.`],
        md`Peak 10: $100/2\eta_0$. Rms 10: $100/\eta_0$. Ratio 2.`),
      Q(md`A good conductor has $\tau = 45°$. Compared with a lossless medium of the same $|\eta|$ and the same $E_0$, its $\langle S\rangle$ at $z = 0$ is multiplied by…`,
        [md`$\cos45° \approx 0.707$`, md`$\cos^245° = 0.5$`, md`$1$: $\tau$ only shifts the phase of $H$`, md`$\sin45°$ and $\cos45°$ together, so 1`], 0,
        [null, md`$\Re\{e^{j\tau}\} = \cos\tau$, once.`, md`The lag between $E$ and $H$ is exactly what reduces the average power.`, md`Only the real part survives: $\cos\tau$.`],
        md`$\langle S\rangle = \tfrac{E_0^2}{2|\eta|}\cos\tau$ at $z = 0$; $\cos45° = 1/\sqrt2$.`),
      Q(md`A plane wave travels along $\hat z$. The average power through a flat area whose normal is $\hat y$ is…`,
        ['zero', md`$\langle S\rangle A$`, md`$\langle S\rangle A/2$`, 'negative'], 0,
        [null, md`$\langle\mathbf S\rangle\cdot\hat y = 0$: the energy slides along the area, not through it.`, md`$\cos90° = 0$, not $\tfrac12$.`, md`$\langle\mathbf S\rangle\cdot\hat n$ is zero, not negative.`],
        md`$\langle P\rangle = \langle\mathbf S\rangle\cdot\hat n\,A = 0$.`),
      Q(md`A circularly polarized wave in free space has two perpendicular components, each of peak $E_0$. Its $\langle S\rangle$ is…`,
        [md`$E_0^2/\eta_0$`, md`$E_0^2/2\eta_0$`, md`$2E_0^2/\eta_0$`, md`$0$, since the two components are $90°$ apart`], 0,
        [null, md`That is one component. The two add their powers.`, md`That adds the amplitudes first, $(2E_0)^2/2\eta_0$.`, md`The $90°$ is between $E_x$ and $E_y$, not between $E$ and its own $H$. Each component is in phase with its $H$.`],
        md`$(E_0^2 + E_0^2)/2\eta_0 = E_0^2/\eta_0$. And $S(t)$ is constant: the tip of $\mathbf E$ keeps the same length.`),
      Q(md`In a standing wave, $\langle S\rangle = 0$ everywhere. Which statement is true?`,
        ['the average energy density is the same as two traveling waves together', 'the energy density is zero everywhere', 'E and H are in time phase', 'there is no magnetic field'], 0,
        [null, md`Energy density is zero only at isolated points and instants.`, md`They are $90°$ apart in time, which is why the average flow is zero.`, md`$H$ is largest where $E$ has its nodes.`],
        md`$\langle w\rangle = \tfrac12\epsilon(|E^+|^2 + |E^-|^2)$: energies add even when powers cancel.`),
      Q(md`The time-averaged power a sheet delivers per square meter is…`,
        [md`$\tfrac12\Re\{-\tilde{\mathbf J}_s\cdot\tilde{\mathbf E}^*\}$`, md`$\Re\{-\tilde{\mathbf J}_s\cdot\tilde{\mathbf E}\}$`, md`$\tfrac12|\tilde{\mathbf J}_s||\tilde{\mathbf E}|$, always`, md`$-\tilde{\mathbf J}_s\cdot\tilde{\mathbf E}^*$`], 0,
        [null, md`That has neither the $\tfrac12$ nor the conjugate.`, md`Only when $\tilde{\mathbf J}_s$ and $\tilde{\mathbf E}$ are in phase. In general the phase difference matters.`, md`That is complex in general, and twice too big. Take $\tfrac12\Re$.`],
        md`The same product rule: $\langle-\mathbf J_s\cdot\mathbf E\rangle = \tfrac12\Re\{-\tilde{\mathbf J}_s\cdot\tilde{\mathbf E}^*\}$ (Lecture 21).`),
      R(md`
        ### Practice, level 1: averages of products

        **The trick:** $\langle ab\rangle = \tfrac12AB\cos(\theta_a - \theta_b) = \tfrac12\Re\{\tilde A\tilde B^*\}$. Subtract the angles, take the cosine, halve. Eight right completes a card.
      `),
      Object.assign(G('rf_w1s_avg', { need: 8 }), { id: 'w1-avg.r0' }),
      R(md`
        ### Practice, level 1: how many watts

        **The trick:** $\langle S\rangle = E_0^2/2\eta = \eta H_0^2/2 = E_{\text{rms}}^2/\eta$; through an area, times $A\cos\theta$.
      `),
      Object.assign(G('rf_w1s_pw', { need: 8 }), { id: 'w1-avg.r1' }),
      R(md`
        ### Practice, level 1: adding waves

        **The trick:** perpendicular polarizations add powers; parallel ones add amplitudes; opposite directions subtract powers; loss multiplies by $e^{-2\alpha z}$.
      `),
      Object.assign(G('rf_w1s_two', { need: 8 }), { id: 'w1-avg.r2' }),
      R(md`
        ### Practice, level 2: whole problems, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w1s_vec', { need: 2 }),
      G('w1s_counter', { need: 2 }),
      G('w1s_inst', { need: 2 }),
      G('w1s_lossy', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        Two current sheets, the waves they make, and where their power goes. Spring 2024 #1 used this setup with the sheets half a wavelength apart; the solution says what happens then.
      `),
      G('w1s_twosheet', { need: 2 }),
    ],
  });

  // ================================================================ lesson 2: generators
  const cl = (x) => (Math.abs(x) < 1e-9 ? 0 : x);
  const Wc = (x, u) => W(cl(x), u);
  const phT = (d) => (d === 0 ? '' : d > 0 ? ` + ${d}°` : ` - ${-d}°`);
  const norm = (d) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return x; };

  // ---------------------------------------------------------------- level 1, averages of products
  GENS.rf_w1s_avg = () => one([
    () => {
      const S0 = pick([2, 6, 10, 20, 50]), ph = pick([0, 30, 45, 60, -40]), fn = pick(['\\cos', '\\sin']);
      return MC('Average of a square', md`At a fixed point, $S(t) = ${S0}${fn}^2(\omega t${phT(ph)})$ W/m². Its time average is…`, Wc(S0 / 2, 'W/m²'),
        [[Wc(S0, 'W/m²'), md`That is the peak. $\langle\cos^2\rangle = \langle\sin^2\rangle = \tfrac12$.`], [Wc(S0 / 4, 'W/m²'), md`That halves twice. One factor of $\tfrac12$.`],
          [Wc(S0 / Math.SQRT2, 'W/m²'), md`$1/\sqrt2$ is the rms of a cosine. The average of its square is $\tfrac12$.`], ...(ph ? [[Wc(S0 / 2 * Math.cos(ph * DEG), 'W/m²'), md`The phase shifts $S(t)$ in time but does not change its average.`]] : [])],
        md`$\langle${fn}^2(\omega t + \phi)\rangle = \tfrac12$ for any $\phi$, so $\langle S\rangle = ${S0}/2 = ${f(S0 / 2)}$ W/m².`);
    },
    () => {
      const A = pick([2, 4, 6]), B = pick([1, 3, 5]), a = pick([0, 30, 60, 90]), d = pick([0, 60, 90, 120, 180, -60]), useSin = pick([true, false]);
      const be = norm(a - d), bs = norm(useSin ? be + 90 : be);
      const ans = 0.5 * A * B * Math.cos(d * DEG);
      const fb = useSin ? '\\sin' : '\\cos';
      return MC('Average of a product', md`$\big\langle ${A}\cos(\omega t${phT(a)})\cdot${B}${fb}(\omega t${phT(bs)})\big\rangle$ equals…`, `$${f(cl(ans))}$`,
        [[`$${f(0.5 * A * B)}$`, md`That is $\tfrac12AB$: it ignores the phase difference.`], [`$${f(cl(A * B * Math.cos(d * DEG)))}$`, md`That leaves out the $\tfrac12$.`],
          [`$${f(cl(0.5 * A * B * Math.cos((a + be) * DEG)))}$`, md`That uses the sum of the phases. The average keeps their difference.`],
          ...(useSin ? [[`$${f(cl(0.5 * A * B * Math.cos((a - bs) * DEG)))}$`, md`That treats the sine as a cosine. First write $\sin x = \cos(x - 90°)$.`]] : [[`$${f(cl(0.5 * A * B * Math.sin(d * DEG)))}$`, md`That uses the sine of the phase difference. The formula has the cosine.`]]),
          [`$${f(-0.5 * A * B)}$`, md`A negative average needs the two $180°$ apart. The order of the subtraction does not matter, since $\cos$ is even.`], [`$${f(A * B)}$`, md`That is $AB$: no $\tfrac12$ and no phase.`]],
        md`${useSin ? md`$\sin(\omega t${phT(bs)}) = \cos(\omega t${phT(be)})$. ` : ''}The phase difference is $${a}° - (${be}°) = ${d}°$, so $\langle ab\rangle = \tfrac12(${A})(${B})\cos${d}° = ${f(cl(ans))}$.`);
    },
    () => {
      const A = pick([2, 4, 10]), B = pick([1, 3, 5]), a = pick([0, 30, 60, 90, -30]), d = pick([0, 60, 120, 180, -60, 90]);
      const b = norm(a - d), ans = 0.5 * A * B * Math.cos(d * DEG);
      const pol = (m, t) => (t === 0 ? `${m}` : `${m}e^{j${t}°}`);
      return MC('With phasors', md`$\tilde A = ${pol(A, a)}$ and $\tilde B = ${pol(B, b)}$. The average $\langle ab\rangle = \tfrac12\Re\{\tilde A\tilde B^*\}$ is…`, `$${f(cl(ans))}$`,
        [[`$${f(cl(0.5 * A * B * Math.cos((a + b) * DEG)))}$`, md`That is $\tfrac12\Re\{\tilde A\tilde B\}$: without the conjugate the angles add.`], [`$${f(cl(A * B * Math.cos(d * DEG)))}$`, md`That leaves out the $\tfrac12$.`],
          [`$${f(0.5 * A * B)}$`, md`That is $\tfrac12|\tilde A||\tilde B|$: it ignores the angles.`], [`$${f(cl(0.5 * A * B * Math.sin(d * DEG)))}$`, md`That is half the imaginary part. Power is the real part.`],
          [`$${f(-0.5 * A * B)}$`, md`A negative average needs the phasors $180°$ apart. Which one carries the star does not matter.`], [`$${f(A * B)}$`, md`That is $|\tilde A||\tilde B|$: no $\tfrac12$ and no angle.`]],
        md`$\tilde A\tilde B^* = ${A * B}e^{j(${a}° - (${b}°))} = ${A * B}e^{j${d}°}$, so $\tfrac12\Re = ${A * B / 2}\cos${d}° = ${f(cl(ans))}$.`);
    },
    () => {
      let pr, qi, rr, si;
      do { pr = pick([1, 2, 3, -2]); qi = pick([1, 2, -1, -3]); rr = pick([2, 3, 4, -1]); si = pick([1, 2, -2, 4]); } while (pr * rr + qi * si === 0 || pr * rr - qi * si === pr * rr + qi * si);
      const cx = (x, y) => `${x}${y < 0 ? ' - ' : ' + '}j${Math.abs(y)}`;
      const ans = 0.5 * (pr * rr + qi * si);
      return MC('Rectangular phasors', md`$\tilde A = ${cx(pr, qi)}$ and $\tilde B = ${cx(rr, si)}$. Then $\tfrac12\Re\{\tilde A\tilde B^*\}$ is…`, `$${f(ans)}$`,
        [[`$${f(0.5 * (pr * rr - qi * si))}$`, md`That is $\tfrac12\Re\{\tilde A\tilde B\}$. With the conjugate, $(jq)(-js) = +qs$.`], [`$${f(pr * rr + qi * si)}$`, md`That leaves out the $\tfrac12$.`],
          [`$${f(0.5 * Math.hypot(pr, qi) * Math.hypot(rr, si))}$`, md`That is $\tfrac12|\tilde A||\tilde B|$, which assumes they are in phase.`], [`$${f(cl(0.5 * (qi * rr - pr * si)))}$`, md`That is half the imaginary part of $\tilde A\tilde B^*$.`],
          [`$${f(0.25 * (pr * rr + qi * si))}$`, md`That halves twice. One $\tfrac12$.`]],
        md`$\tilde B^* = ${cx(rr, -si)}$. The real part of $(p + jq)(r - js)$ is $pr + qs = (${pr})(${rr}) + (${qi})(${si}) = ${pr * rr + qi * si}$. Half of it: $${f(ans)}$.`);
    },
    () => {
      const SC = [
        [md`$\tilde{\mathbf H} = j0.2\,\hat y$`, '0'], [md`$\tilde{\mathbf H} = -j0.2\,\hat y$`, '0'], [md`$\tilde{\mathbf H} = 0.2\,\hat y$`, '1'], [md`$\tilde{\mathbf H} = -0.2\,\hat y$`, '-1'], [md`$\tilde{\mathbf H} = 0.2e^{-j60°}\,\hat y$`, '0.5'],
      ];
      const OPT = { 0: [md`$0$`, md`Zero needs $\mathbf E$ and $\mathbf H$ exactly $90°$ apart in time, a factor of $\pm j$.`], 1: [md`$1\,\hat z$ W/m²`, md`That is $\tfrac12E_0H_0$ with $E$ and $H$ in phase and $\mathbf H$ along $+\hat y$.`],
        '-1': [md`$-1\,\hat z$ W/m²`, md`A minus sign needs $\tilde{\mathbf H}$ along $-\hat y$ in phase with $\mathbf E$.`], 0.5: [md`$0.5\,\hat z$ W/m²`, md`That is $\tfrac12E_0H_0\cos60°$, which needs a $60°$ difference.`], 2: [md`$2\,\hat z$ W/m²`, md`That is $E_0H_0$: the $\tfrac12$ is missing.`] };
      const [h, k] = pick(SC);
      return MC('Which way, on average?', md`At a point, $\tilde{\mathbf E} = 10\,\hat x$ V/m and ${h} A/m. Then $\langle\mathbf S\rangle$ is…`, OPT[k][0],
        Object.keys(OPT).filter((x) => x !== k).map((x) => OPT[x]),
        md`$\langle\mathbf S\rangle = \tfrac12\Re\{10\hat x\times\tilde{\mathbf H}^*\}$, and $\hat x\times\hat y = \hat z$. Only the part of $\tilde H_y$ in phase with $\tilde E_x$ survives the real part.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1, how many watts
  const MEDIA = [[1, 1], [4, 1], [9, 1], [16, 1], [1, 4], [9, 4]];
  GENS.rf_w1s_pw = () => one([
    () => {
      const [er, mr] = pick(MEDIA), eP = etaPi(er, mr), eta = eP * Math.PI, E0 = pick([12, 24, 60, 120]), S = E0 * E0 / (2 * eta);
      return MC('Average power from E', md`A plane wave in ${medTex(er, mr)} has $E_0 = ${E0}$ V/m. $\langle S\rangle$ is…`, W(S, 'W/m²'),
        [[W(2 * S, 'W/m²'), md`That is $E_0^2/\eta$, the peak. The average has a $\tfrac12$.`], [W(E0 / (2 * eta), 'W/m²'), md`$E_0$ must be squared.`], [W(eta * E0 * E0 / 2, 'W/m²'), md`Divide by $\eta$; do not multiply.`],
          ...(er !== 1 || mr !== 1 ? [[W(E0 * E0 / (2 * ETA0), 'W/m²'), md`That uses $\eta_0$. Here $\eta = \eta_0\sqrt{\mu_r/\epsilon_r} = ${eP}\pi\ \Omega$.`]] : [[W(E0 * E0 / (4 * eta), 'W/m²'), md`One $\tfrac12$ too many.`]])],
        md`$\eta = ${eP}\pi\ \Omega$; $\langle S\rangle = E_0^2/2\eta = ${E0 * E0}/(${2 * eP}\pi) = ${f(S)}$ W/m².`);
    },
    () => {
      const [er, mr] = pick(MEDIA), eP = etaPi(er, mr), eta = eP * Math.PI, H0 = pick([0.1, 0.5, 1, 2]), S = eta * H0 * H0 / 2;
      return MC('Average power from H', md`A plane wave in ${medTex(er, mr)} has $H_0 = ${H0}$ A/m. $\langle S\rangle$ is…`, W(S, 'W/m²'),
        [[W(2 * S, 'W/m²'), md`That is $\eta H_0^2$, the peak.`], [W(H0 * H0 / (2 * eta), 'W/m²'), md`With $H$, multiply by $\eta$: $\langle S\rangle = \eta H_0^2/2$.`], [W(eta * H0 / 2, 'W/m²'), md`$H_0$ must be squared.`],
          [W(H0 * H0 / 2, 'W/m²'), md`The impedance is missing: $\langle S\rangle = \tfrac12\eta H_0^2$.`],
          ...(er !== 1 || mr !== 1 ? [[W(ETA0 * H0 * H0 / 2, 'W/m²'), md`That uses $\eta_0$. Here $\eta = ${eP}\pi\ \Omega$.`]] : [])],
        md`$\langle S\rangle = \tfrac12\eta H_0^2 = \tfrac12(${eP}\pi)(${H0})^2 = ${f(S)}$ W/m².`);
    },
    () => {
      const [er, mr] = pick(MEDIA.slice(0, 3)), eP = etaPi(er, mr), eta = eP * Math.PI, Er = pick([6, 12, 30, 60]), S = Er * Er / eta;
      return MC('rms values', md`A meter reads $E_{\text{rms}} = ${Er}$ V/m for a plane wave in ${medTex(er, mr)}. $\langle S\rangle$ is…`, W(S, 'W/m²'),
        [[W(S / 2, 'W/m²'), md`That puts a $\tfrac12$ on an rms value. With rms, $\langle S\rangle = E_{\text{rms}}^2/\eta$.`], [W(2 * S, 'W/m²'), md`That converts rms to peak with a factor 2 instead of $\sqrt2$.`], [W(Er / eta, 'W/m²'), md`The field must be squared.`]],
        md`$\langle S\rangle = E_{\text{rms}}^2/\eta = ${Er * Er}/(${eP}\pi) = ${f(S)}$ W/m². (Peak: $E_0 = ${Er}\sqrt2$, and $E_0^2/2\eta$ gives the same.)`);
    },
    () => {
      const S = pick([2, 5, 10, 40]), A = pick([0.5, 2, 4]), th = pick([0, 60]), [dt, dtT] = pick([[10, '10 s'], [60, '1 minute'], [3600, '1 hour']]);
      const P = S * A * Math.cos(th * DEG), U = P * dt;
      return MC('Energy through a window', md`A plane wave has $\langle S\rangle = ${S}$ W/m². A ${A} m² window's normal makes $${th}°$ with the direction of travel. The energy through it in ${dtT} is…`, W(U, 'J'),
        [[W(P, 'J'), 'That is the power, in W. Multiply by the time in seconds.'], [W(U / 2, 'J'), md`$\langle S\rangle$ is already an average. Do not halve it again.`],
          ...(th ? [[W(S * A * dt, 'J'), md`Only the normal part crosses: multiply by $\cos${th}°$.`]] : [[W(2 * U, 'J'), md`That doubles the average, as if it were the peak.`]]), [W(S * dt / A, 'J'), 'Multiply by the area; do not divide.']],
        md`$\langle P\rangle = \langle S\rangle A\cos\theta = (${S})(${A})(${th ? '\\tfrac12' : '1'}) = ${f(P)}$ W, and over ${dtT} ($${dt}$ s) the energy is $${f(U)}$ J.`);
    },
    () => {
      const E0 = pick([12, 24, 60, 120]), S = E0 * E0 / (240 * Math.PI), num = E0 * E0 / 240;
      return MC('Back to the field', md`A free-space plane wave carries $\langle S\rangle = ${p(num)}/\pi$ W/m². Its peak field $E_0$ is…`, `$${f(E0)}$ V/m`,
        [[`$${f(E0 / Math.SQRT2)}$ V/m`, md`That solves $\langle S\rangle = E^2/\eta_0$, which gives the rms value, not the peak.`], [`$${f(E0 * E0)}$ V/m`, 'That is E0², and the square root is missing.'],
          [`$${f(Math.sqrt(2 * S / ETA0))}$ V/m`, md`That divides by $\eta_0$ instead of multiplying: $E_0 = \sqrt{2\eta_0\langle S\rangle}$.`], [`$${f(E0 * Math.SQRT2)}$ V/m`, md`That uses $\langle S\rangle = E_0^2/4\eta_0$: one $\tfrac12$ too many.`]],
        md`$E_0 = \sqrt{2\eta_0\langle S\rangle} = \sqrt{2(120\pi)(${p(num)}/\pi)} = \sqrt{${E0 * E0}} = ${E0}$ V/m.`);
    },
  ]);

  // ---------------------------------------------------------------- level 1, adding waves
  GENS.rf_w1s_two = () => one([
    () => {
      const [a, b] = pick([[3, 4], [6, 8], [5, 12], [2, 2], [4, 1], [5, 5]]), er = pick([1, 4]), eP = etaPi(er), eta = eP * Math.PI;
      const [ph, c] = pick([['', 1], ['j', 0], ['-j', 0], ['e^{j60°}', 0.5]]);
      const t2 = ph === '-j' ? `- j${b}` : ph === 'j' ? `+ j${b}` : ph ? `+ ${b}${ph}` : `+ ${b}`;
      const S = (a * a + b * b) / (2 * eta);
      return MC('Two polarizations', md`In ${medTex(er)}, $\tilde{\mathbf E} = (${a}\,\hat x ${t2}\,\hat y)e^{-j\beta z}$ V/m. $\langle S\rangle$ is…`, W(S, 'W/m²'),
        [[W((a + b) ** 2 / (2 * eta), 'W/m²'), md`That adds the amplitudes. Perpendicular components add their powers.`], [W(Math.abs(a * a - b * b) / (2 * eta), 'W/m²'), md`That subtracts. $|j${b}|^2 = (j${b})(-j${b}) = +${b * b}$, never negative.`],
          [W((a * a + b * b) / eta, 'W/m²'), md`The $\tfrac12$ is missing.`], [W((a * a + b * b + 2 * a * b * (c || 0.3)) / (2 * eta), 'W/m²'), md`There is no cross term between $\hat x$ and $\hat y$ parts: $\hat x\times\hat x = 0$ kills it.`],
          [W((a * a + b * b) / (4 * eta), 'W/m²'), md`That halves twice. One $\tfrac12$, from the time average.`]],
        md`$|\tilde{\mathbf E}|^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$, whatever the phase between them, so $\langle S\rangle = ${a * a + b * b}/(2\cdot${eP}\pi) = ${f(S)}$ W/m².`);
    },
    () => {
      const [a, b] = pick([[10, 6], [8, 4], [5, 3], [4, 8], [3, 9], [12, 4]]), eta = ETA0, S = (a * a - b * b) / (2 * eta);
      const say = (v) => `$${f(Math.abs(v))}$ W/m² along $${v > 0 ? '+' : '-'}\\hat z$`;
      return MC('Two directions', md`In free space, $\tilde E_x = ${a}e^{-j\beta z} + ${b}e^{+j\beta z}$ V/m. The net $\langle\mathbf S\rangle$ is…`, say(S),
        [[say(-S), md`The larger wave sets the direction. The ${a > b ? 'forward' : 'backward'} wave is larger.`], [say(Math.sign(S) * (a - b) ** 2 / (2 * eta)), md`That subtracts the amplitudes first. The powers subtract: $${a}^2 - ${b}^2$.`],
          [say(Math.sign(S) * (a * a + b * b) / (2 * eta)), 'That adds the powers. The backward wave carries its power the other way.'], ['$0$: they form a standing wave', 'Only equal amplitudes give zero net power.']],
        md`$\langle S_z\rangle = (|E^+|^2 - |E^-|^2)/2\eta_0 = (${a * a} - ${b * b})/(240\pi) = ${f(S)}$ W/m².`);
    },
    () => {
      const [a, b] = pick([[3, 4], [2, 6], [5, 5], [4, 2]]), psi = pick([0, 60, 90, 120, 180]), eta = ETA0;
      if (psi === 180 && a === b) return GENS.rf_w1s_two();
      const S = (a * a + b * b + 2 * a * b * Math.cos(psi * DEG)) / (2 * eta);
      return MC('Same polarization', md`Two free-space waves, both $\hat x$-polarized and both traveling toward $+z$: $\tilde E_x = (${a} + ${b}${psi ? `e^{j${psi}°}` : ''})e^{-j\beta z}$ V/m. $\langle S\rangle$ is…`, Wc(S, 'W/m²'),
        [[W((a * a + b * b) / (2 * eta), 'W/m²'), md`That adds powers, which only perpendicular polarizations do. Parallel fields add amplitudes first.`], [W((a + b) ** 2 / (2 * eta), 'W/m²'), md`That ignores the phase $${psi}°$ between them.`],
          [Wc((a * a + b * b - 2 * a * b * Math.cos(psi * DEG)) / (2 * eta), 'W/m²'), md`The cross term is $+2ab\cos\psi$.`], [Wc(2 * S, 'W/m²'), md`The $\tfrac12$ is missing.`],
          [W((a - b) ** 2 / (2 * eta), 'W/m²'), md`That subtracts the amplitudes, which needs them $180°$ apart.`], [Wc(S / 2, 'W/m²'), md`That halves twice. One $\tfrac12$, from the time average.`]],
        md`$|${a} + ${b}e^{j\psi}|^2 = ${a}^2 + ${b}^2 + 2(${a})(${b})\cos${psi}° = ${f(cl(a * a + b * b + 2 * a * b * Math.cos(psi * DEG)))}$. Divide by $2\eta_0 = 240\pi$: $${f(cl(S))}$ W/m².`);
    },
    () => {
      const n = pick([0.5, 1, 1.5, 2]), al = pick([0.5, 1, 2, 5]), d = n / al, ask = pick(['left', 'gone']);
      const e = (x) => `$e^{-${p(x)}}$`, oneMinus = (x) => `$1 - e^{-${p(x)}}$`;
      return MC('Power in a lossy medium', md`A wave travels through a lossy medium with $\alpha = ${al}$ Np/m. Over a distance of ${p(d)} m, what fraction of its average power is ${ask === 'left' ? 'left' : 'absorbed'}?`, ask === 'left' ? e(2 * n) : oneMinus(2 * n),
        [[ask === 'left' ? e(n) : oneMinus(n), md`That uses $e^{-\alpha z}$, the field. Power goes as $e^{-2\alpha z}$.`], [ask === 'left' ? oneMinus(2 * n) : e(2 * n), ask === 'left' ? 'That is the part absorbed, not the part left.' : 'That is the part left, not the part absorbed.'],
          [ask === 'left' ? e(4 * n) : oneMinus(4 * n), md`That squares twice. $e^{-2\alpha z}$ with $\alpha z = ${p(n)}$.`], [ask === 'left' ? e(n / 2) : oneMinus(n / 2), md`That halves $\alpha z$. Power decays faster than the field, not slower.`]],
        md`$\alpha z = (${al})(${p(d)}) = ${p(n)}$, so the power left is $e^{-2\alpha z} = e^{-${p(2 * n)}}$${ask === 'gone' ? md` and the part absorbed is $1 - e^{-${p(2 * n)}}$` : ''}.`);
    },
    () => {
      const [a, b] = pick([[10, 5], [3, 1], [2, 1], [5, 3], [4, 2]]), r = (a * a - b * b) / (a * a + b * b);
      return MC('Energy speed', md`$\tilde E_x = ${a}e^{-j\beta z} + ${b}e^{+j\beta z}$ in a lossless medium with wave speed $v$. On average, energy moves forward at…`, `$${f(r)}\\,v$`,
        [[`$${f((a - b) / (a + b))}\\,v$`, md`That uses amplitudes. Powers and energies go as squares: $(${a * a} - ${b * b})/(${a * a} + ${b * b})$.`], ['$v$', md`$\langle S\rangle = v\langle w\rangle$ holds for one traveling wave. Two opposite waves add energy but subtract power.`],
          ['$0$', 'Zero needs equal amplitudes, a pure standing wave.'], [`$${f((a * a - b * b) / (a * a))}\\,v$`, md`The energy density counts both waves: $|E^+|^2 + |E^-|^2$ in the denominator.`]],
        md`$\langle S\rangle/\langle w\rangle = v(|E^+|^2 - |E^-|^2)/(|E^+|^2 + |E^-|^2) = v(${a * a - b * b})/(${a * a + b * b}) = ${f(r)}\,v$.`);
    },
    () => MC('Circular polarization', md`A circularly polarized wave in a lossless medium has two perpendicular components, each of peak $E_0$. At a fixed point, its instantaneous $|\mathbf S|$…`, md`is constant, equal to $E_0^2/\eta$`,
      [[md`swings between 0 and $2E_0^2/\eta$`, md`That is a linear wave of peak $\sqrt2E_0$. In a circular wave $|\mathbf E|$ never changes, so neither does $S$.`], [md`swings between 0 and $E_0^2/\eta$`, md`Each component alone does that, but the two are $90°$ apart: $\cos^2 + \sin^2 = 1$.`],
        ['averages to zero', md`The components are $90°$ apart from each other, not from their own $\mathbf H$. The wave carries power.`], [md`is constant, equal to $E_0^2/2\eta$`, md`That is one component's average. Two components, and no averaging needed.`]],
      md`$S = (E_0^2\cos^2\omega t + E_0^2\sin^2\omega t)/\eta = E_0^2/\eta$ at every instant, which is also its average: $2\times E_0^2/2\eta$.`),
  ]);

  // ---------------------------------------------------------------- level 2
  GENS.w1s_vec = () => {
    const er = pick([1, 4, 9]), eP = etaPi(er), eta = eP * Math.PI;
    const [a, b] = pick([[3, 4], [6, 8], [5, 12], [4, 4], [10, 10], [8, 6], [12, 5], [2, 6]]);
    const s = pick([1, -1]), dir = pick([1, -1]), A = pick([1, 2, 3, 4]), th = pick([0, 30, 60]);
    const Sav = (a * a + b * b) / (2 * eta), Smax = Math.max(a, b) ** 2 / eta, Smin = Math.min(a, b) ** 2 / eta, P = Sav * A * Math.cos(th * DEG);
    const jy = s > 0 ? `+ j${b}` : `- j${b}`;
    // H~ = (1/eta)(dir z) x E~ :  z x x = y,  z x y = -x
    const hx = -dir * s, hy = dir;  // H~ = (1/eta)(hy*a y + hx*j b x) e^{..}
    return {
      title: 'A wave with two components',
      q: md`In ${medTex(er)}, $\tilde{\mathbf E} = (${a}\,\hat x ${jy}\,\hat y)e^{${dir > 0 ? '-' : '+'}j\beta z}$ V/m. Find the size and direction of $\langle\mathbf S\rangle$, the largest and smallest values of the instantaneous $|\mathbf S|$ at $z = 0$, and the average power through a ${A} m² window whose normal makes $${th}°$ with the direction of travel.`,
      parts: [
        Object.assign(N('|\\langle\\mathbf S\\rangle|', Sav, 'W/m²'), { traps: [{ v: (a + b) ** 2 / (2 * eta), msg: 'Perpendicular components add powers, not amplitudes.' }, { v: (a * a + b * b) / eta, msg: 'The ½ is missing.' }, ...(a !== b ? [{ v: Math.abs(a * a - b * b) / (2 * eta), msg: 'The j does not make a minus sign: |jb|² = +b².' }] : [])] }),
        { lbl: md`$\langle\mathbf S\rangle$ points along`, mc: [md`$+\hat z$`, md`$-\hat z$`], a: dir > 0 ? 0 : 1, why: dir > 0 ? [null, md`$e^{-j\beta z}$ travels toward $+z$, and power flows with the wave.`] : [md`$e^{+j\beta z}$ travels toward $-z$, and power flows with the wave.`, null] },
        N('|\\mathbf S|_{\\max}', Smax, 'W/m²'),
        N('|\\mathbf S|_{\\min}', Smin, 'W/m²'),
        Object.assign(N('\\langle P\\rangle\\ \\text{window}', P, 'W'), { traps: th ? [{ v: Sav * A, msg: `Only the normal part crosses: multiply by cos ${th}°.` }] : [] }),
      ],
      hints: [md`$\langle S\rangle = |\tilde{\mathbf E}|^2/2\eta$ for one lossless wave, with $|\tilde{\mathbf E}|^2 = ${a}^2 + ${b}^2$.`, md`At $z = 0$, $\mathbf E(t) = ${a}\cos\omega t\,\hat x ${s > 0 ? '-' : '+'} ${b}\sin\omega t\,\hat y$, so $|\mathbf S| = (${a * a}\cos^2\omega t + ${b * b}\sin^2\omega t)/\eta$.`],
      sol: md`
        **Step 1: η and H̃.** $\eta = ${eP}\pi\ \Omega$. The wave travels toward ${dir > 0 ? '$+z$' : '$-z$'}, so $\tilde{\mathbf H} = \tfrac1\eta(${dir > 0 ? '' : '-'}\hat z)\times\tilde{\mathbf E}$. With $\hat z\times\hat x = \hat y$ and $\hat z\times\hat y = -\hat x$:
        $$\tilde{\mathbf H} = \frac{1}{\eta}\big(${hy > 0 ? '' : '-'}${a}\,\hat y ${hx > 0 ? '+' : '-'} j${b}\,\hat x\big)e^{${dir > 0 ? '-' : '+'}j\beta z}$$
        **Step 2: ⟨S⟩.** The parallel pairs vanish, and the surviving products give $${a * a} + ${b * b}$ along ${dir > 0 ? '$+\\hat z$' : '$-\\hat z$'} (the $j$ meets its conjugate: $(\pm j)(\mp j) = +1$):
        $$|\langle\mathbf S\rangle| = \frac{${a * a + b * b}}{2(${eP}\pi)} = ${f(Sav)}\ \text{W/m}^2$$
        **Step 3: instantaneous.** At $z = 0$, $\Re\{\pm j${b}e^{j\omega t}\} = \mp${b}\sin\omega t$, so $\mathbf E$ has components $${a}\cos\omega t$ and $${b}\sin\omega t$ (up to sign), each in phase with its own part of $\mathbf H$:
        $$|\mathbf S| = \frac{${a * a}\cos^2\omega t + ${b * b}\sin^2\omega t}{\eta}$$
        It swings between $${Math.min(a, b) ** 2}/\eta = ${f(Smin)}$ and $${Math.max(a, b) ** 2}/\eta = ${f(Smax)}$ W/m²${a === b ? ': the same number, because a circular wave has constant $|\\mathbf S|$' : ''}. Its average is the mean of the two, $${f(Sav)}$ W/m² ✓.

        **Step 4: the window.**
        $$\langle P\rangle = (${f(Sav)})(${A})\cos${th}° = ${f(P)}\ \text{W}$$
        **Speed path.** $|\tilde{\mathbf E}|^2/2\eta$, direction from the sign in the exponent, extremes $a^2/\eta$ and $b^2/\eta$.
      `,
    };
  };

  GENS.w1s_counter = () => {
    const er = pick([1, 4]), eP = etaPi(er), eta = eP * Math.PI, eps = er * EPS0, v = CC / Math.sqrt(er);
    const [Ep, Em] = pick([[10, 5], [6, 2], [9, 3], [5, 10], [4, 12], [8, 6], [10, 6]]);
    const Sz = (Ep * Ep - Em * Em) / (2 * eta), wav = eps * (Ep * Ep + Em * Em) / 2, ve = Sz / wav, weMax = eps * (Ep + Em) ** 2 / 4;
    return {
      title: 'Two waves going opposite ways',
      q: md`In ${medTex(er)}, $\tilde E_x = ${Ep}e^{-j\beta z} + ${Em}e^{+j\beta z}$ V/m. Find the net $\langle S_z\rangle$ (with its sign), the average energy density $\langle w\rangle$, the average speed at which energy moves (with its sign), and $\langle w_e\rangle$ at a point where $|\tilde E_x|$ is largest. (Use $\epsilon_0 = 10^{-9}/36\pi$ F/m.)`,
      parts: [
        Object.assign(N('\\langle S_z\\rangle', Sz, 'W/m²'), { traps: [{ v: Math.sign(Sz) * (Ep - Em) ** 2 / (2 * eta), msg: 'The powers subtract, not the amplitudes: E+² − E−².' }, { v: (Ep * Ep + Em * Em) / (2 * eta), msg: 'The backward wave carries power the other way: subtract.' }] }),
        Object.assign(N('\\langle w\\rangle', wav, 'J/m³'), { traps: [{ v: eps * (Ep - Em) ** 2 / 2, msg: 'Energies add even though powers subtract: ½ε(E+² + E−²).' }, { v: eps * (Ep + Em) ** 2 / 2, msg: 'That is the energy at a maximum of |E|, doubled. Averaged over z, the cross terms cancel.' }] }),
        Object.assign(N('\\langle S_z\\rangle/\\langle w\\rangle', ve, 'm/s'), { traps: [{ v: v, msg: '⟨S⟩ = v⟨w⟩ holds only for a single traveling wave.' }] }),
        Object.assign(N('\\langle w_e\\rangle\\text{ where }|\\tilde E_x|\\text{ is largest}', weMax, 'J/m³'), { traps: [{ v: 2 * weMax, msg: '⟨w_e⟩ = ¼ε|Ẽ|²: one ½ from the energy formula and one from the time average.' }] }),
        { lbl: md`The imaginary part of $\tilde E_x\tilde H_y^*$…`, mc: ['carries energy back and forth with no net transport', 'is the power carried by the backward wave', 'is power lost as heat', 'must be zero in a lossless medium'], a: 0,
          why: [null, md`The backward wave's power is $-|E^-|^2/2\eta$, a real number.`, md`A lossless medium has no heat at all, yet the imaginary part is there.`, md`It is $\tfrac{2}{\eta}\Im\{X\}$ with $X = E^-E^{+*}e^{j2\beta z}$, nonzero wherever $\sin2\beta z \neq 0$.`] },
      ],
      hints: [md`$\langle S_z\rangle = (|E^+|^2 - |E^-|^2)/2\eta$ and $\langle w\rangle = \tfrac12\epsilon(|E^+|^2 + |E^-|^2)$.`, md`$|\tilde E_x|$ is largest where the two waves are in phase: $|\tilde E_x| = ${Ep} + ${Em}$. Then $\langle w_e\rangle = \tfrac14\epsilon|\tilde E_x|^2$.`],
      sol: md`
        **Step 1: numbers.** $\eta = ${eP}\pi\ \Omega$, $\epsilon = ${f(eps)}$ F/m, $v = ${p(v)}$ m/s.

        **Step 2: net power.** The backward wave's $H$ carries a minus sign, so the same-wave terms give $|E^+|^2 - |E^-|^2$ and the cross terms are purely imaginary:
        $$\langle S_z\rangle = \frac{${Ep * Ep} - ${Em * Em}}{2(${eP}\pi)} = ${f(Sz)}\ \text{W/m}^2$$
        ${Sz > 0 ? 'Positive: net power flows toward +z.' : 'Negative: the backward wave is stronger, so net power flows toward −z.'}

        **Step 3: energy.** The cross terms cancel between $\langle w_e\rangle$ and $\langle w_m\rangle$:
        $$\langle w\rangle = \tfrac12\epsilon(${Ep * Ep} + ${Em * Em}) = ${f(wav)}\ \text{J/m}^3$$
        **Step 4: energy speed.**
        $$\frac{\langle S_z\rangle}{\langle w\rangle} = v\,\frac{${Ep * Ep - Em * Em}}{${Ep * Ep + Em * Em}} = ${f(ve)}\ \text{m/s}$$
        **Step 5: at a maximum of |Ẽ|.** There the two waves are in phase and $|\tilde E_x| = ${Ep + Em}$ V/m:
        $$\langle w_e\rangle = \tfrac14\epsilon(${Ep + Em})^2 = ${f(weMax)}\ \text{J/m}^3$$
        At the same point $|\tilde H_y|$ is smallest, so $\langle w_m\rangle$ is small there: the energy is mostly electric at maxima of $|\tilde E|$ and mostly magnetic at its minima.

        **Speed path.** Powers subtract, energies add; their ratio times $v$ is the energy speed.
      `,
    };
  };

  GENS.w1s_inst = () => {
    const er = pick([1, 4, 9]), n = Math.sqrt(er), eP = etaPi(er), eta = eP * Math.PI, E0 = pick([10, 20, 30, 60]), lam = pick([1, 2]), fM = 300 / n / lam, A = pick([1, 2, 5]);
    let th, k;
    do { th = pick([0, 30, 45, 60, 90]); k = pick([1, 2, 3, 4, 5]); } while (cos2(th - 30 * k) < 1e-9);
    const [dt, dtT] = pick([[1, '1 s'], [10, '10 s'], [60, '1 minute']]);
    const Pi = E0 * E0 / eta * cos2(th - 30 * k) * A, Pmax = E0 * E0 / eta * A, Pav = Pmax / 2, U = Pav * dt, Erms = E0 / Math.SQRT2;
    const z0 = frac(k * lam, 12);
    return {
      title: 'Instantaneous and average power through a window',
      q: md`In ${medTex(er)}, $\mathbf E = ${E0}\cos(\omega t - \beta z)\,\hat x$ V/m at $f = ${p(fM)}$ MHz. A ${A} m² window lies in the plane $z = ${z0}$ m. Find the power through it at the instant $\omega t = ${th}°$, its peak, its time average, the energy through it in ${dtT}, and the rms value of $E$.`,
      parts: [
        N('P(t)', Pi, 'W'),
        N('P_{\\max}', Pmax, 'W'),
        Object.assign(N('\\langle P\\rangle', Pav, 'W'), { traps: [{ v: Pmax, msg: 'That is the peak. The average of cos² is ½.' }] }),
        Object.assign(N(md`energy in ${dtT}`, U, 'J'), { traps: [{ v: Pmax * dt, msg: 'Use the average power, not the peak.' }] }),
        N('E_{\\text{rms}}', Erms, 'V/m'),
      ],
      hints: [md`$S_z = (E_0^2/\eta)\cos^2(\omega t - \beta z)$, with $\beta z = 360°\times z/\lambda$ and $\lambda = v/f$.`, md`Average: half the peak. Energy over many periods: $\langle P\rangle\Delta t$. $E_{\text{rms}} = E_0/\sqrt2$.`],
      sol: md`
        **Step 1: the medium.** $\eta = ${eP}\pi\ \Omega$, $v = c/${n} = ${p(CC / n)}$ m/s, $\lambda = v/f = ${lam}$ m. At $z = ${z0}$ m, $\beta z = 360°\times(${z0})/${lam} = ${30 * k}°$.

        **Step 2: instantaneous.** The phase is $${th}° - ${30 * k}° = ${th - 30 * k}°$, and $\cos^2 = ${f(cos2(th - 30 * k))}$:
        $$P(t) = \frac{E_0^2}{\eta}\cos^2(${th - 30 * k}°)\,A$$
        $$P(t) = \frac{${E0 * E0}}{${eP}\pi}(${f(cos2(th - 30 * k))})(${A}) = ${f(Pi)}\ \text{W}$$
        **Step 3: peak and average.** $P_{\max} = (E_0^2/\eta)A = ${f(Pmax)}$ W and $\langle P\rangle = \tfrac12P_{\max} = ${f(Pav)}$ W.

        **Step 4: energy.** Many periods fit in ${dtT}, so $U = \langle P\rangle\Delta t = (${f(Pav)})(${dt}) = ${f(U)}$ J.

        **Step 5: rms.** $E_{\text{rms}} = ${E0}/\sqrt2 = ${f(Erms)}$ V/m. Check: $E_{\text{rms}}^2A/\eta = ${f(Erms * Erms * A / eta)}$ W $= \langle P\rangle$ ✓.
      `,
    };
  };

  GENS.w1s_lossy = () => {
    const [tau, lab] = pick([[15, 'τ = 15°'], [22.5, 'τ = 22.5°'], [30, 'τ = 30°'], [45, 'τ ≈ 45° (a good conductor)']]);
    const etaM = pick([50, 100, 150, 200, 300]), al = pick([0.5, 1, 2, 5, 10]), E0 = pick([10, 20, 50, 100]), nE = pick([0.5, 1, 1.5, 2]);
    const d = nE / al, ct = Math.cos(tau * DEG), S0 = E0 * E0 * ct / (2 * etaM), Sd = S0 * Math.exp(-2 * nE), Pab = S0 - Sd, JE = 2 * al * S0, sig = 2 * al * ct / etaM;
    return {
      title: 'Power in a lossy medium',
      q: md`A plane wave travels toward $+z$ in a lossy medium with $\alpha = ${al}$ Np/m, $|\eta| = ${etaM}\ \Omega$ and ${lab.replace('τ', '$\\tau$')}. At $z = 0$ its electric field amplitude is $E_0 = ${E0}$ V/m. Find $\langle S\rangle$ at $z = 0$ and at $z = ${p(d)}$ m, the power absorbed per square meter between those planes, the average Ohmic power density $\langle\mathbf J\cdot\mathbf E\rangle$ at $z = 0$, and the conductivity $\sigma$.`,
      parts: [
        Object.assign(N('\\langle S\\rangle(0)', S0, 'W/m²'), { traps: [{ v: E0 * E0 / (2 * etaM), msg: 'H lags E by τ: multiply by cos τ.' }, { v: E0 * E0 / (2 * ETA0), msg: 'Use the medium\'s |η|, not η0.' }] }),
        Object.assign(N(md`$\langle S\rangle$ at $z = ${p(d)}$ m`, Sd, 'W/m²'), { traps: [{ v: S0 * Math.exp(-nE), msg: 'That uses e^{−αz}, the field. Power decays as e^{−2αz}.' }] }),
        N('\\text{absorbed per m}^2', Pab, 'W/m²'),
        Object.assign(N('\\langle\\mathbf J\\cdot\\mathbf E\\rangle(0)', JE, 'W/m³'), { traps: [{ v: al * S0, msg: 'd⟨S⟩/dz = −2α⟨S⟩: the factor is 2α.' }] }),
        N('\\sigma', sig, 'S/m'),
      ],
      hints: [md`$\langle S\rangle(z) = \dfrac{E_0^2\cos\tau}{2|\eta|}e^{-2\alpha z}$.`, md`Averaged theorem: $\langle\mathbf J\cdot\mathbf E\rangle = -d\langle S\rangle/dz = 2\alpha\langle S\rangle$. And $\langle\sigma E^2\rangle = \tfrac12\sigma E_0^2$, so $\sigma = 2\alpha\cos\tau/|\eta|$.`],
      sol: md`
        **Step 1: at z = 0.** $\cos${tau}° = ${f(ct)}$:
        $$\langle S\rangle(0) = \frac{${E0 * E0}\times${f(ct)}}{2(${etaM})} = ${f(S0)}\ \text{W/m}^2$$
        **Step 2: at z = ${p(d)} m.** $2\alpha z = 2(${al})(${p(d)}) = ${p(2 * nE)}$:
        $$\langle S\rangle = ${f(S0)}\,e^{-${p(2 * nE)}} = ${f(Sd)}\ \text{W/m}^2$$
        **Step 3: absorbed.** What enters at $z = 0$ and does not leave at $z = ${p(d)}$ m became heat:
        $$${f(S0)} - ${f(Sd)} = ${f(Pab)}\ \text{W/m}^2$$
        **Step 4: the averaged theorem at z = 0.** The stored energy repeats each period, so $\langle\partial w/\partial t\rangle = 0$ and
        $$\langle\mathbf J\cdot\mathbf E\rangle = -\frac{d\langle S\rangle}{dz} = 2\alpha\langle S\rangle$$
        $$= 2(${al})(${f(S0)}) = ${f(JE)}\ \text{W/m}^3$$
        **Step 5: σ.** $\langle\sigma E^2\rangle = \tfrac12\sigma E_0^2$ must equal that:
        $$\sigma = \frac{2(${f(JE)})}{${E0 * E0}} = ${f(sig)}\ \text{S/m}$$
        which is $2\alpha\cos\tau/|\eta|$ ✓.

        **Speed path.** Power fraction left: $e^{-2\alpha z}$. Heat per volume at a plane: $2\alpha$ times the power density there.
      `,
    };
  };

  // ---------------------------------------------------------------- level 3
  GENS.w1s_twosheet = () => {
    const er = pick([1, 4]), n = Math.sqrt(er), eP = etaPi(er), eta = eP * Math.PI, eps = er * EPS0, J0 = pick([1, 2, 4]), psi = pick([0, 180]), lam = pick([1, 2]);
    const [dn, dd] = pick([[1, 8], [1, 6], [1, 4], [1, 3], [3, 4]]);
    const bd = 360 * dn / dd, c = cos2((bd + psi) / 2), fM = 300 / n / lam;
    const Sr = eta * J0 * J0 / 2 * c, Eout = eta * J0 * Math.sqrt(c), wB = eps * eta * eta * J0 * J0 / 4;
    const dT = frac(dn * lam, dd);
    const J2 = psi === 0 ? `-${J0}` : `+${J0}`;
    return {
      title: 'Exam problem: two sheets and where their power goes',
      q: md`Two current sheets in ${medTex(er)} radiate at $f = ${p(fM)}$ MHz: $\tilde{\mathbf J}_{s1} = -${J0}\,\hat x$ A/m on $z = 0$ and $\tilde{\mathbf J}_{s2} = ${J2}\,\hat x$ A/m on $z = d = ${dT}$ m.

        (a) Find the amplitude of $\tilde E_x$ for $z > d$.

        (b) Find $\langle S_z\rangle$ for $z > d$ and for $z < 0$ (with signs).

        (c) What is $\langle S_z\rangle$ between the sheets?

        (d) Find the average power per square meter delivered by sheet 1, and the total radiated per square meter.

        (e) Find $\langle w\rangle$ between the sheets. (Use $\epsilon_0 = 10^{-9}/36\pi$ F/m.)`,
      parts: [
        Object.assign(N('|\\tilde E_x|\\ (z > d)', Eout, 'V/m'), { traps: [{ v: eta * J0, msg: 'That adds the two amplitudes as if they were in phase. The second wave arrives with phase βd, plus the sheets\' own phase difference.' }, { v: eta * J0 / 2, msg: 'That is one sheet alone.' }] }),
        Object.assign(N('\\langle S_z\\rangle\\ (z > d)', Sr, 'W/m²'), { traps: [{ v: eta * J0 * J0 / 4, msg: 'That adds the two waves\' powers. They have the same polarization and direction, so their fields interfere.' }] }),
        Object.assign(N('\\langle S_z\\rangle\\ (z < 0)', -Sr, 'W/m²'), { traps: [{ v: Sr, msg: 'For z < 0 the power flows toward −z.' }] }),
        { lbl: md`(c) Between the sheets, $\langle S_z\rangle$ is`, mc: ['zero', md`$${f(Sr)}$ W/m²`, md`$${f(eta * J0 * J0 / 8)}$ W/m², the power of one sheet's wave`, md`$${f(-Sr)}$ W/m²`], a: 0,
          why: [null, 'That is the power outside. Between the sheets one wave goes each way with equal amplitude.', 'Each sheet\'s wave carries that much, but the two travel in opposite directions between the sheets and cancel.', 'Between the sheets the two waves have equal amplitudes, so their powers cancel exactly.'] },
        Object.assign(N('P_1\\ \\text{(sheet 1)}', Sr, 'W/m²'), { traps: [{ v: eta * J0 * J0 / 4, msg: 'That is what sheet 1 delivers alone. Sheet 2\'s field at z = 0 changes it.' }] }),
        N('P_{\\text{total}}', 2 * Sr, 'W/m²'),
        Object.assign(N('\\langle w\\rangle\\ (0 < z < d)', wB, 'J/m³'), { traps: [{ v: wB / 2, msg: 'Energies add: two waves of amplitude ηJ0/2 each.' }] }),
      ],
      hints: [md`Each sheet alone: $\tilde E_x = \tfrac{\eta}{2}J\,e^{-j\beta|z - z_s|}$, where $\tilde{\mathbf J}_s = -J\hat x$. Here $\eta = ${eP}\pi\ \Omega$ and $\beta d = ${bd}°$.`, md`$|1 + e^{jx}|^2 = 4\cos^2(x/2)$. Sheet 1 delivers $\tfrac12\Re\{-\tilde{\mathbf J}_{s1}\cdot\tilde{\mathbf E}^*(0)\}$.`],
      sol: md`
        **Step 1: each sheet alone.** From the sheet formula, a sheet $\tilde{\mathbf J}_s = -J\hat x$ makes $\tilde E_x = \tfrac{\eta}{2}Je^{-j\beta|z - z_s|}$ on both sides, with $\eta = ${eP}\pi\ \Omega$ and $\tfrac{\eta}{2}J_0 = ${f(eta * J0 / 2)}$ V/m. Sheet 2 has $J = ${J0}${psi ? 'e^{j180°}' : ''}$. The spacing is $\beta d = 360°\times(${dT})/${lam} = ${bd}°$.

        **Step 2: z > d.** Both waves go toward $+z$:
        $$\tilde E_x = \tfrac{\eta}{2}J_0e^{-j\beta z}\big(1 + e^{j(\beta d + ${psi}°)}\big)$$
        $|1 + e^{jx}|^2 = 4\cos^2(x/2)$ with $x = ${bd + psi}°$, so $|\tilde E_x| = \eta J_0|\cos${(bd + psi) / 2}°| = ${f(Eout)}$ V/m. Then
        $$\langle S_z\rangle = \frac{|\tilde E_x|^2}{2\eta} = ${f(Sr)}\ \text{W/m}^2$$
        **Step 3: z < 0.** By the same steps the factor is $|1 + e^{j(${psi}° - \beta d)}|^2 = 4\cos^2${(bd + psi) / 2}°$ again, so $\langle S_z\rangle = ${f(-Sr)}$ W/m², toward $-z$.

        **Step 4: between.** Sheet 1's wave goes toward $+z$ and sheet 2's toward $-z$, both of amplitude $\tfrac{\eta}{2}J_0$. Equal and opposite: $\langle S_z\rangle = (|E^+|^2 - |E^-|^2)/2\eta = 0$.

        **Step 5: power from sheet 1.** At $z = 0$, $\tilde E_x = \tfrac{\eta}{2}J_0(1 + e^{j(${psi}° - \beta d)})$, and $-\tilde{\mathbf J}_{s1}\cdot\tilde{\mathbf E}^* = J_0\tilde E_x^*$:
        $$P_1 = \tfrac12J_0\Re\{\tilde E_x(0)\} = \tfrac{\eta}{4}J_0^2\big(1 + \cos(${bd}° - ${psi}°)\big)$$
        $$P_1 = ${f(Sr)}\ \text{W/m}^2$$
        By symmetry sheet 2 delivers the same, so the total is $${f(2 * Sr)}$ W/m², which equals the $2\times${f(Sr)}$ W/m² that leaves on the two sides ✓. The second sheet changes how much power the first one delivers: alone it would give $\tfrac{\eta}{4}J_0^2 = ${f(eta * J0 * J0 / 4)}$ W/m².

        **Step 6: energy between.** Two waves of amplitude $\tfrac{\eta}{2}J_0$: energies add,
        $$\langle w\rangle = \tfrac12\epsilon\cdot2\big(\tfrac{\eta}{2}J_0\big)^2 = ${f(wB)}\ \text{J/m}^3$$
        Energy without flow: a standing wave sits between the sheets.

        **Spring 2024 #1** has $\beta d = 180°$ with equal currents: then $\cos^2 90° = 0$, nothing is radiated, each sheet delivers zero power, and the fields outside cancel.

        **Speed path.** Outside: $\langle S\rangle = \tfrac{\eta}{2}J_0^2\cos^2\tfrac{\beta d + \psi}{2}$ per side. Between: zero. Total from the sheets: twice one side.

        **Where points go.** Adding powers of parallel waves; forgetting the propagation phase $\beta d$; the sign of $\langle S_z\rangle$ for $z < 0$.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank, lesson 2
  EM.BANK['w1-avg'] = [
    Q(md`$\langle\cos\omega t\cdot\sin\omega t\rangle$ equals…`,
      ['0', '½', '¼', '1'], 0,
      [null, md`That is $\langle\cos^2\rangle$. Cosine and sine are $90°$ apart.`, md`$\cos\sin = \tfrac12\sin2\omega t$, whose average is zero, not $\tfrac14$.`, md`The product swings between $-\tfrac12$ and $\tfrac12$.`],
      md`$\cos\omega t\sin\omega t = \tfrac12\sin2\omega t$, which averages to zero over a period.`),
    Q(md`$\langle\sin^2(\omega t + 70°)\rangle$ equals…`,
      ['½', md`$\tfrac12\sin70°$`, '0', md`$\sin^270°$`], 0,
      [null, 'A phase shift moves the curve in time; it does not change its average.', md`$\sin^2 \ge 0$ always, so its average cannot be zero.`, 'That is its value at t = 0, not its average.'],
      md`$\sin^2x = \tfrac12(1 - \cos2x)$, and the cosine averages to zero.`),
    Q(md`How do $\Re\{\tilde A\tilde B^*\}$ and $\Re\{\tilde A^*\tilde B\}$ compare?`,
      ['they are equal', 'they are negatives of each other', 'they are equal only if both phasors are real', 'one is the real part and the other the imaginary part'], 0,
      [null, md`They are complex conjugates of each other, which share the same real part.`, md`Conjugates have equal real parts for any phasors.`, md`Both are real parts of complex numbers.`],
      md`$\tilde A^*\tilde B = (\tilde A\tilde B^*)^*$, and $\Re\{z^*\} = \Re\{z\}$.`),
    Q(md`At a point, $\tilde{\mathbf E} = 5\,\hat x$ V/m and $\tilde{\mathbf H} = 2e^{-j60°}\,\hat y$ A/m. $\langle\mathbf S\rangle$ is…`,
      [md`$2.5\,\hat z$ W/m²`, md`$5\,\hat z$ W/m²`, md`$10\,\hat z$ W/m²`, md`$4.33\,\hat z$ W/m²`], 0,
      [null, md`That ignores the $60°$: $\tfrac12(5)(2)$.`, md`That has neither the $\tfrac12$ nor the $\cos60°$.`, md`That uses $\sin60°$ instead of $\cos60°$.`],
      md`$\tfrac12\Re\{5\cdot2e^{+j60°}\} = 5\cos60° = 2.5$ W/m², along $\hat x\times\hat y = \hat z$.`),
    Q(md`A free-space plane wave has $E_0 = 1$ V/m. Its $\langle S\rangle$ is about…`,
      ['1.33 mW/m²', '2.65 mW/m²', '377 W/m²', '0.5 W/m²'], 0,
      [null, md`That is $E_0^2/\eta_0$, the peak.`, md`That multiplies by $\eta_0$.`, md`That leaves out $\eta_0$.`],
      md`$1/(240\pi) \approx 1.33\times10^{-3}$ W/m².`),
    Q(md`A free-space plane wave has $H_0 = 1$ A/m. Its $\langle S\rangle$ is about…`,
      ['188 W/m²', '377 W/m²', '1.33 mW/m²', '0.5 W/m²'], 0,
      [null, md`That is $\eta_0H_0^2$, the peak.`, md`That divides by $\eta_0$; with $H$ you multiply.`, md`That leaves out $\eta_0$.`],
      md`$\tfrac12\eta_0H_0^2 = 60\pi \approx 188$ W/m².`),
    Q(md`Two lossless media carry plane waves with the same $E_0$. Medium B has half the intrinsic impedance of medium A. Medium B's $\langle S\rangle$ is…`,
      ['twice A\'s', 'half of A\'s', 'the same', 'four times A\'s'], 0,
      [null, md`$\langle S\rangle = E_0^2/2\eta$: a smaller $\eta$ means more power for the same $E$.`, md`$\eta$ is in the formula.`, md`$\eta$ appears to the first power.`],
      md`Halving $\eta$ at fixed $E_0$ doubles $H_0 = E_0/\eta$ and doubles $E_0^2/2\eta$.`),
    Q(md`For a linearly polarized plane wave, the ratio of the peak of $S(t)$ to its average is…`,
      ['2', '√2', '1', '4'], 0,
      [null, md`$\sqrt2$ is the peak-to-rms ratio of the field. Power goes as its square.`, 'Only a circularly polarized wave has a constant S.', 'The peak is E0²/η and the average E0²/2η.'],
      md`Peak $E_0^2/\eta$, average $E_0^2/2\eta$.`),
    Q(md`A window receives an average of 1 W. How much energy passes through it in one hour?`,
      ['3600 J', '1 J', '1800 J', '7200 J'], 0,
      [null, 'That is the energy in one second.', md`The 1 W is already an average: no further $\tfrac12$.`, 'That doubles the average, as if it were the peak.'],
      md`$U = \langle P\rangle\Delta t = (1)(3600) = 3600$ J.`),
    Q(md`A wave is partly reflected, and the reflected field amplitude is half the incident one. The net forward power is what fraction of the incident power?`,
      ['75%', '50%', '25%', '100%'], 0,
      [null, md`That subtracts amplitudes. The reflected power is $(\tfrac12)^2 = \tfrac14$ of the incident.`, 'That is the reflected fraction, not what is left going forward.', 'The reflected wave carries power back.'],
      md`$(|E^+|^2 - |E^-|^2)/|E^+|^2 = 1 - \tfrac14 = \tfrac34$.`),
    Q(md`In a lossy medium, the forward wave's $\langle S\rangle$ depends on $z$ as…`,
      [md`$\cos\tau\,e^{-2\alpha z}$ times a constant`, md`$e^{-\alpha z}$ times a constant`, md`$\cos(\beta z - \tau)$ times a constant`, 'it does not depend on z'], 0,
      [null, md`That is the field envelope. Power is quadratic in the field.`, md`The $\beta z$ phases cancel between $\tilde{\mathbf E}$ and $\tilde{\mathbf H}^*$.`, 'The material absorbs power as the wave travels.'],
      md`$\langle S\rangle = \tfrac{E_0^2\cos\tau}{2|\eta|}e^{-2\alpha z}$; the $\cos\tau$ is a constant factor, the decay is $e^{-2\alpha z}$.`),
    Q(md`A wave's field amplitude has fallen to $1/e$ of its starting value. Its average power has fallen to…`,
      [md`$1/e^2 \approx 13.5\%$`, md`$1/e \approx 36.8\%$`, md`$1/\sqrt e \approx 60.7\%$`, md`$1 - 1/e \approx 63\%$`], 0,
      [null, 'That is the field.', 'Power falls faster than the field, not slower.', 'That is the fraction of the field lost, not the power left.'],
      md`Power goes as field squared: $(1/e)^2$.`),
    Q(md`Why is the average electric energy density $\tfrac14\epsilon|\tilde{\mathbf E}|^2$ rather than $\tfrac12\epsilon|\tilde{\mathbf E}|^2$?`,
      [md`One $\tfrac12$ is in $w_e = \tfrac12\epsilon E^2$, the other comes from $\langle\cos^2\rangle$`, md`Because only half the energy is electric`, md`Because the phasor is the rms value`, md`Because the energy is split between two directions`], 0,
      [null, md`The electric half is already $w_e$ alone; the second $\tfrac12$ is the time average.`, md`On this site phasors carry peak values; $|\tilde{\mathbf E}| = E_0$.`, 'Energy density has no direction.'],
      md`$\langle\tfrac12\epsilon E^2\rangle = \tfrac12\epsilon\cdot\tfrac12|\tilde{\mathbf E}|^2$.`),
    Q(md`What does the imaginary part of the complex Poynting vector $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$ describe?`,
      ['energy sloshing back and forth with no net transport', 'the power lost as heat', 'the power of the reflected wave', 'nothing: it is always zero'], 0,
      [null, md`Heat shows up as a change in the real part ($\nabla\cdot\langle\mathbf S\rangle < 0$), not in the imaginary part.`, md`The reflected wave's power is a real number, $-|E^-|^2/2\eta$.`, md`For two opposite waves it is $\tfrac{2}{\eta}\Im\{X\}$, nonzero in general.`],
      md`The real part is the average flow; the imaginary part measures energy that moves back and forth each period: reactive power.`),
    Q(md`A wave travels toward $-\hat x$ in a good conductor. As a function of $x$, its $\langle S\rangle$…`,
      [md`goes as $e^{+2\alpha x}$, so it shrinks as the wave moves toward $-x$`, md`goes as $e^{+2\alpha x}$, so it grows as the wave travels`, md`goes as $e^{-2\alpha x}$`, 'is constant'], 0,
      [null, md`The wave moves toward smaller $x$, where $e^{+2\alpha x}$ is smaller. It shrinks as it travels.`, md`That is the forward wave's dependence.`, 'A conductor absorbs power.'],
      md`Both directions decay in the direction of travel: this is SP24 #2(c)(iv), which is false.`),
    Q(md`Lecture 21: a sheet $\tilde{\mathbf J}_s = 2\,\hat x$ A/m in free space makes $\tilde{\mathbf E}(0) = -\eta_0\,\hat x$ V/m at the sheet. The average power it delivers per square meter is…`,
      ['377 W/m²', '754 W/m²', '188 W/m²', '−377 W/m²'], 0,
      [null, md`That leaves out the $\tfrac12$ of the time average.`, md`That is one side's share.`, md`$-\tilde{\mathbf J}_s\cdot\tilde{\mathbf E}^* = -2(-\eta_0) = +2\eta_0$: positive, a source.`],
      md`$\tfrac12\Re\{-\tilde{\mathbf J}_s\cdot\tilde{\mathbf E}^*\} = \tfrac12(2\eta_0) = \eta_0 \approx 377$ W/m², split equally between the two waves.`),
    Q(md`The units of the complex Poynting vector $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$ are…`,
      ['W/m² (V·A/m²)', 'W/m³', 'J/m²', 'Ω'], 0,
      [null, md`That is one derivative more: the units of $\nabla\cdot\mathbf S$.`, 'Joules would need a time integral.', md`$E/H$ has ohms; $E\times H$ has watts per square meter.`],
      md`(V/m)(A/m) = W/m², the same as $\mathbf S$.`),
    Q(md`$\langle S\rangle = v\langle w\rangle$ fails for…`,
      ['two waves traveling in opposite directions', 'a single wave in a dielectric', 'a single circularly polarized wave', 'a single wave of very high frequency'], 0,
      [null, md`For one lossless traveling wave it holds exactly.`, md`Polarization does not matter: both components ride at $v$.`, 'Frequency does not enter the argument.'],
      md`Two opposite waves: energies add, powers subtract, so $\langle S\rangle < v\langle w\rangle$.`),
    Q(md`In free space, $\tilde{\mathbf E} = E_0(\hat x + \hat y)e^{-j\beta z}$. Its $\langle S\rangle$ is…`,
      [md`$E_0^2/\eta_0$`, md`$E_0^2/2\eta_0$`, md`$2E_0^2/\eta_0$`, md`$4E_0^2/2\eta_0$`], 0,
      [null, 'That is one component.', 'That adds amplitudes: (2E0)²/2η0. The components are perpendicular.', md`That is the same as $2E_0^2/\eta_0$: adding amplitudes.`],
      md`$|\tilde{\mathbf E}|^2 = 2E_0^2$, so $\langle S\rangle = 2E_0^2/2\eta_0 = E_0^2/\eta_0$. It is a linear wave at $45°$ with amplitude $\sqrt2E_0$.`),
    Q(md`$\tilde{\mathbf E}_1 = E_0(\hat x + j\hat y)e^{-j\beta z}$ and $\tilde{\mathbf E}_2 = E_0(\hat x - j\hat y)e^{-j\beta z}$ have opposite handedness. Their average powers…`,
      ['are equal', 'differ by a factor of 2', 'are opposite in sign', 'are zero for one of them'], 0,
      [null, md`Both have $|\tilde{\mathbf E}|^2 = 2E_0^2$.`, md`Both travel toward $+z$; handedness does not change direction.`, 'Neither is zero: each component carries power.'],
      md`$|\pm j|^2 = 1$: both carry $E_0^2/\eta$.`),
    Q(md`Averaging the Poynting theorem over a period removes the stored-energy term because…`,
      ['the stored energy returns to its starting value after each period', 'the stored energy is zero on average', 'w_e and w_m cancel', 'the fields are zero on average'], 0,
      [null, md`$\langle w\rangle$ is not zero. What averages to zero is its rate of change.`, md`They add; neither is negative.`, md`The fields average to zero, but $w$ goes as their squares and does not.`],
      md`$\langle\partial w/\partial t\rangle = [w(T) - w(0)]/T = 0$ in sinusoidal steady state, leaving $\nabla\cdot\langle\mathbf S\rangle = -\langle\mathbf J\cdot\mathbf E\rangle$.`),
    Q(md`A closed surface surrounds a region of perfect dielectric with no sources inside, in sinusoidal steady state. The average net power out through it is…`,
      ['zero', 'positive', 'negative', 'equal to the power of the wave'], 0,
      [null, 'Positive would need a source inside.', 'Negative would need something absorbing inside.', 'Whatever enters on one side leaves on the other.'],
      md`$\oint\langle\mathbf S\rangle\cdot d\mathbf A = -\int\langle\mathbf J\cdot\mathbf E\rangle dV = 0$.`),
    Q(md`Two equal $\hat x$-polarized waves travel toward $+z$, exactly $180°$ out of phase. The total $\langle S\rangle$ is…`,
      ['zero', 'twice one wave\'s', 'four times one wave\'s', 'the same as one wave\'s'], 0,
      [null, md`Parallel fields add amplitudes: $E_0 - E_0 = 0$. There is no wave at all.`, md`That would need them in phase: $(2E_0)^2$.`, md`Same polarization means they interfere; powers do not simply add.`],
      md`$|E_0 + E_0e^{j180°}|^2 = 0$.`),
  ];
})();

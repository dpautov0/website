/* Topic 1 — Dielectrics, D and boundary conditions (Lectures 9, 16b). Polarization and bound charge, D and Gauss's law
   with free charge, conductors in equilibrium, the E_t and D_n boundary conditions, layered dielectrics between plates
   (fixed charge vs fixed voltage), and what a small conductivity does in steady state. Capacitance is Topic 2;
   charge relaxation is Topic 3. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;
  const e0 = EM.eps0;
  const q3 = (x) => +x.toPrecision(3);

  // ---------------------------------------------------------------- figures
  // a dielectric slab between charged plates: free charge on the plates, bound charge on the slab faces, P inside
  function slabFig() {
    const g = PF.fig({ alt: 'a dielectric slab between a positive plate (top) and a negative plate (bottom); the slab carries negative bound charge on its top face and positive bound charge on its bottom face; P points down' });
    const x1 = 30, x2 = 230, yT = 20, yB = 180, s1 = 62, s2 = 138;
    g.rect(x1, s1, x2 - x1, s2 - s1, { cls: 'shade nodecl' });
    g.line(x1, yT, x2, yT, { cls: 'thick' });
    g.line(x1, yB, x2, yB, { cls: 'thick' });
    for (const x of [50, 90, 170, 210]) {
      g.charge(x, yT + 11, { q: '+', r: 5 });
      g.charge(x, yB - 11, { q: '-', r: 5 });
      g.charge(x, s1 + 8, { q: '-', r: 4 });
      g.charge(x, s2 - 8, { q: '+', r: 4 });
    }
    g.arrow(130, s1 + 10, 130, s2 - 10, { cls: 'thick', hs: 8 });
    g.label(137, 100, '\\mathbf P', 'l');
    g.label(x2 + 8, yT + 11, '+\\rho_s\\ \\text{free}', 'l', 'small');
    g.label(x2 + 8, s1 + 8, '\\text{bound}\\ -', 'l', 'small');
    g.label(x2 + 8, s2 - 8, '\\text{bound}\\ +', 'l', 'small');
    g.label(x2 + 8, yB - 11, '-\\rho_s\\ \\text{free}', 'l', 'small');
    return g.svg();
  }

  // a charged conductor: E = 0 inside, charge on the surface, field lines leave at right angles
  function condFig() {
    const g = PF.fig({ alt: 'a charged conductor: positive charge sits on its surface, E is zero inside, and the field outside leaves the surface at right angles' });
    const cx = 120, cy = 100, Rr = 44;
    g.circle(cx, cy, Rr, { cls: 'shade' });
    g.circle(cx, cy, Rr, { cls: 'thick' });
    for (let k = 0; k < 8; k++) {
      const a = (k + 0.5) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      g.charge(cx + (Rr - 9) * c, cy - (Rr - 9) * s, { q: '+', r: 4.5 });
      g.arrow(cx + (Rr + 5) * c, cy - (Rr + 5) * s, cx + (Rr + 33) * c, cy - (Rr + 33) * s, { hs: 6 });
    }
    g.label(cx, cy, '\\mathbf E = 0', 'c', 'small');
    g.label(cx + Rr + 44, cy, '\\mathbf E\\perp\\text{surface}', 'l', 'small');
    return g.svg();
  }

  // an interface: region − below (shaded), region + above, n̂ from − to +, a pillbox and a thin loop across it
  function bcFig() {
    const g = PF.fig({ alt: 'an interface between region minus (below) and region plus (above), the normal n pointing from minus to plus, a flat pillbox and a thin rectangular loop straddling the interface' });
    g.rect(20, 100, 260, 56, { cls: 'shade nodecl' });
    g.line(20, 100, 280, 100, { cls: 'thick' });
    g.label(28, 148, '\\epsilon^-\\ (\\text{region}\\ -)', 'bl', 'small');
    g.label(28, 30, '\\epsilon^+\\ (\\text{region}\\ +)', 'tl', 'small');
    g.arrow(262, 100, 262, 64, { hs: 7 });
    g.label(268, 68, '\\hat n', 'l');
    g.rect(84, 86, 56, 28, { cls: 'dash' });
    g.label(112, 82, '\\text{pillbox}', 'b', 'small');
    g.loopRect(168, 89, 62, 22, { dir: 'ccw', cls: 'thin' });
    g.label(199, 84, '\\text{loop}', 'b', 'small');
    return g.svg();
  }

  // parallel plates with layers (listed bottom to top): [{h, lab, shade}], labels for the plates and the z of each boundary
  function platesFig(o) {
    const g = PF.fig({ alt: o.alt });
    const x1 = 40, x2 = 230, yT = 24;
    const H = o.layers.reduce((s, L) => s + L.h, 0), yB = yT + H;
    const bounds = [yB];
    let y = yB;
    o.layers.forEach((L, i) => {
      const top = y - L.h;
      if (L.shade) g.rect(x1, top, x2 - x1, L.h, { cls: 'shade nodecl' });
      if (L.lab) g.label((x1 + x2) / 2, top + L.h / 2, L.lab, 'c', 'small');
      if (i < o.layers.length - 1) g.line(x1, top, x2, top, { cls: o.sheetAt === i + 1 ? 'thick dash' : 'dim dash' });
      bounds.push(top);
      y = top;
    });
    g.plane(x1, x2, yB, { side: 'below', t: 8 });
    g.plane(x1, x2, yT, { side: 'above', t: 8 });
    if (o.bot) g.label(x1 - 8, yB, o.bot, 'r', 'small');
    if (o.top) g.label(x1 - 8, yT, o.top, 'r', 'small');
    (o.z || []).forEach((t, i) => { if (t) g.label(x2 + 8, bounds[i], t, 'l', 'small'); });
    (o.arrows || []).forEach((x) => g.arrow(x, yT + 6, x, yB - 6, { cls: 'dim', hs: 7 }));
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u1', {
    id: 't1-dielectrics', topic: 1, ref: 'Lectures 9, 16', title: 'Dielectrics, D and boundary conditions',
    steps: [
      R(md`
        !!key Why you care
          Summer 2020 #1(a) is a capacitor filled with two dielectric layers: find $V$, $\mathbf E$, $\mathbf D$, $\mathbf P$ and $C$ per area. HW 4 #1, #2, #3, #5 and #6 drill the same tools (layered plates, a charge sheet between grounded plates, a fluid that becomes conducting, a coax of mixed materials). Boundary conditions come back in every wave and magnetic-materials problem.

        ### Notation

        - $\mathbf E$: electric field, V/m.
        - $\mathbf P$: **polarization**, the dipole moment per unit volume of a material, C/m². It points from the $-$ end to the $+$ end of the dipoles.
        - $\mathbf D$: **electric flux density** (displacement), C/m².
        - $\epsilon_0 = 8.854\times10^{-12}$ F/m. $\epsilon_r$: relative permittivity (no unit). $\epsilon = \epsilon_0\epsilon_r$, F/m. $\chi_e = \epsilon_r - 1$: electric susceptibility (no unit).
        - $\rho$ (C/m³), $\rho_s$ (C/m²): **free** charge densities: charge placed somewhere or free to move (on conductors).
        - $\rho_b$ (C/m³), $\rho_{sb}$ (C/m²): **bound** charge densities: the ends of the dipoles. They cannot leave their molecules.
        - $\hat n$: unit normal. At an interface it points from region $-$ into region $+$ (as on the formula sheet); at a material's own surface it points outward. Superscripts $\pm$ mark the field just on each side.
        - $E_n = \hat n\cdot\mathbf E$ and $E_t$: the parts of $\mathbf E$ normal and tangential to a surface; the same for $D$.
        - $\sigma$: conductivity, S/m. $\mathbf J = \sigma\mathbf E$: conduction current density, A/m².

        ### The idea

        An applied $\mathbf E$ stretches every molecule into a tiny dipole along $\mathbf E$. Inside a uniform material neighboring dipole ends cancel. At the surfaces they do not: a thin layer of **bound charge** is left, and it opposes the field that made it. So $\mathbf E$ in a dielectric is weaker than the free charges alone would make it. $\mathbf D$ is built to count only the free charge:
        $$\oint_S\mathbf D\cdot d\mathbf S = Q_{\text{free, enc}}, \qquad \mathbf D = \epsilon_0\mathbf E + \mathbf P = \epsilon\mathbf E$$
        Find $\mathbf D$ from the free charge, then $\mathbf E = \mathbf D/\epsilon$.
      `),
      RF(md`
        ### Step 1: polarization and bound charge

        [[fig:slab]]

        In a linear material $\mathbf P = \epsilon_0\chi_e\mathbf E$: proportional to $\mathbf E$ and along it. Where $\mathbf P$ ends on a surface, bound charge is left:
        $$\rho_{sb} = \mathbf P\cdot\hat n\ \ (\hat n\ \text{out of the material}), \qquad \rho_b = -\nabla\cdot\mathbf P\ \ (\text{inside})$$
        Positive where $\mathbf P$ leaves the material, negative where it enters. A uniform slab has $\rho_b = 0$: only its faces are charged, and each face's bound charge has the opposite sign of the plate it faces. That is the cancellation that weakens $\mathbf E$. A neutral dielectric's bound charges always add to zero.
      `, { slab: { svg: slabFig(), cap: 'P points along E (down). It leaves the slab through the bottom face (+ bound) and enters through the top face (− bound), next to the + plate.' } }),
      Q(md`**Predict.** A slab $0 < z < d$ has uniform $\mathbf P = P_0\hat z$ with $P_0 > 0$. The bound surface charge on its top face, $z = d$, is…`,
        ['$+P_0$', '$-P_0$', '$0$', '$P_0d$'], 0,
        [null, 'On the top face the outward normal is $+\\hat z$, along $\\mathbf P$: the $+$ ends of the dipoles sit there.', 'Uniform $\\mathbf P$ gives no volume bound charge ($\\nabla\\cdot\\mathbf P = 0$), but its faces are charged.', 'A surface density has units C/m², the units of $P$ itself; no thickness enters.'],
        md`$\rho_{sb} = \mathbf P\cdot\hat n = P_0\hat z\cdot\hat z = +P_0$. The bottom face ($\hat n = -\hat z$) carries $-P_0$; together they are neutral.`),
      R(md`
        ### Step 2: D, and Gauss's law with free charge only

        $\mathbf E$ is made by all charge: $\nabla\cdot(\epsilon_0\mathbf E) = \rho + \rho_b = \rho - \nabla\cdot\mathbf P$. Move the bound term to the left:
        $$\nabla\cdot(\epsilon_0\mathbf E + \mathbf P) = \rho \quad\Rightarrow\quad \nabla\cdot\mathbf D = \rho, \qquad \mathbf D = \epsilon_0\mathbf E + \mathbf P = \epsilon_0(1 + \chi_e)\mathbf E = \epsilon\mathbf E$$
        **Plates with free charge $\pm\rho_s$, gap filled with $\epsilon$:** Gauss gives $D = \rho_s$, pointing from $+$ to $-$. Then
        $$E = \frac{\rho_s}{\epsilon}, \qquad P = D - \epsilon_0E = \Big(1 - \frac{1}{\epsilon_r}\Big)\rho_s$$
        The bound face charge $P$ cancels a fraction $1 - 1/\epsilon_r$ of the free charge; what is left, $\rho_s/\epsilon_r$, makes $E$.
      `),
      Q(md`**Predict.** Isolated plates carry $\pm\rho_s$. The gap is filled with $\epsilon_r = 4$. The polarization in the gap has magnitude…`,
        ['$\\tfrac34\\rho_s$', '$\\rho_s$', '$\\tfrac14\\rho_s$', '$4\\rho_s$'], 0,
        [null, 'That is $D$. $P = D - \\epsilon_0E$, and $\\epsilon_0E = \\rho_s/4$ is not zero.', 'That is $\\epsilon_0E$, the part of $D$ that is not polarization.', '$P$ can never exceed $D$ here: the bound charge only partly cancels the free charge.'],
        md`$D = \rho_s$, $\epsilon_0E = \rho_s/4$, so $P = D - \epsilon_0E = \tfrac34\rho_s$.`),
      RF(md`
        ### Step 3: conductors in electrostatic equilibrium

        [[fig:cond]]

        Free charges in a conductor move until nothing pushes them. Then:
        - **$\mathbf E = 0$ inside.** Any field would drive a current.
        - **$\rho = 0$ inside.** Gauss's law on any small surface inside: no flux, so no charge. Excess charge sits on the surface.
        - **The conductor is an equipotential**, so $\mathbf E$ just outside is **normal** to the surface. A tangential part would push charge along it.
        - **Surface charge:** a pillbox through the surface has $\mathbf D = 0$ on its inner face, so $\rho_s = \hat n\cdot\mathbf D$ just outside, with $\hat n$ pointing **out of the conductor**.

        $\mathbf D$ pointing away from the surface means $\rho_s > 0$; pointing toward it, $\rho_s < 0$. Lecture 16b: $\mathbf D = D_0\langle1, -2, 2\rangle$ pointing away gives $\rho_s = +|\mathbf D| = +3D_0$; $D_0\langle1, 0, \sqrt3\rangle$ pointing toward gives $\rho_s = -2D_0$.
      `, { cond: { svg: condFig(), cap: 'Charge spreads over the surface; inside, E = 0. Outside, the field leaves at right angles.' } }),
      Q(md`**Predict.** Just outside a conductor, $\mathbf D = D_0\langle2, 3, 6\rangle$ and it points **toward** the surface. The surface charge there is…`,
        ['$-7D_0$', '$+7D_0$', '$-11D_0$', '$-6D_0$'], 0,
        [null, 'Pointing toward the surface means $\\hat n\\cdot\\mathbf D < 0$, with $\\hat n$ out of the conductor.', 'That adds the components; use the length $\\sqrt{4 + 9 + 36}$.', 'That keeps one component. $\\mathbf D$ is normal to the surface, so all of it is the normal part.'],
        md`$\mathbf D$ is normal to the surface, so $|\rho_s| = |\mathbf D| = D_0\sqrt{4 + 9 + 36} = 7D_0$. It points into the conductor: $\rho_s = -7D_0$.`),
      RF(md`
        ### Step 4: boundary conditions

        [[fig:bc]]

        Shrink a pillbox across an interface (Gauss) and a thin loop around it ($\oint\mathbf E\cdot d\mathbf l = 0$; with a changing $\mathbf B$ the flux through a loop of zero width is still zero, so this holds for dynamic fields too):
        $$\hat n\times(\mathbf E^+ - \mathbf E^-) = 0\ \ (E_t\ \text{continuous}), \qquad \hat n\cdot(\mathbf D^+ - \mathbf D^-) = \rho_s\ \ (\text{free})$$
        - **Two perfect dielectrics** ($\sigma = 0$, no free charge): $D_n$ is continuous, so $\epsilon^+E_n^+ = \epsilon^-E_n^-$. The normal $E$ jumps, and it is smaller on the high-$\epsilon$ side. The jump times $\epsilon_0$ is the bound surface charge.
        - **Field lines bend:** $E_t$ stays, $E_n$ shrinks on entering higher $\epsilon$, so the line tilts away from the normal: $\tan\theta^+/\tan\theta^- = \epsilon^+/\epsilon^-$ ($\theta$ from the normal).
        - **A perfect conductor** on one side (all its fields zero): $E_t = 0$ and $\hat n\cdot\mathbf D = \rho_s$ outside. Only a purely normal $\mathbf E$ can exist there.
      `, { bc: { svg: bcFig(), cap: 'The pillbox (Gauss) gives the jump in $D_n$; the thin loop gives continuity of $E_t$. $\\hat n$ points from region − into region +.' } }),
      Q(md`**Predict.** For $z < 0$, $\epsilon = 2\epsilon_0$ and $\mathbf E = 3\hat x + 4\hat z$ V/m. For $z > 0$, $\epsilon = 4\epsilon_0$. There is no free surface charge. Just above the interface, $\mathbf E = $`,
        ['$3\\hat x + 2\\hat z$ V/m', '$3\\hat x + 4\\hat z$ V/m', '$1.5\\hat x + 2\\hat z$ V/m', '$3\\hat x + 8\\hat z$ V/m'], 0,
        [null, 'That makes all of $\\mathbf E$ continuous. Only $E_t$ is; $D_n$ is the continuous normal quantity.', 'The tangential part does not scale with $\\epsilon$.', 'Inverted ratio: going into the higher-$\\epsilon$ side, $E_n$ shrinks.'],
        md`$E_x$ is tangential: $3$ V/m. $D_z$ is continuous: $4\epsilon_0E_z^+ = 2\epsilon_0(4)$, so $E_z^+ = 2$ V/m.`),
      RF(md`
        ### Step 5: layered dielectrics between plates

        [[fig:layers]]

        With the layers parallel to the plates, $\mathbf D$ is normal to every interface. No free charge sits at the interfaces, so **$D$ is the same in every layer**. Then
        $$E_i = \frac{D}{\epsilon_i}, \qquad V = \sum_iE_id_i = D\sum_i\frac{d_i}{\epsilon_i}, \qquad \frac{C}{A} = \frac{\rho_s}{V} = \frac{1}{\sum_id_i/\epsilon_i}$$
        The **low-$\epsilon$ layer has the strongest field** and takes most of the voltage. That is why a thin air gap in insulation breaks down first.

        **Inserting a slab that fills the gap:**

        | | battery disconnected ($Q$ fixed) | battery connected ($V$ fixed) |
        |---|---|---|
        | $D$, plate charge | unchanged | $\times\epsilon_r$ |
        | $E$, $V$ | $\div\epsilon_r$ | unchanged |
        | $C$ | $\times\epsilon_r$ | $\times\epsilon_r$ |
        | stored energy | $\div\epsilon_r$ | $\times\epsilon_r$ |
      `, { layers: { svg: platesFig({ alt: 'two dielectric layers between parallel plates; D arrows run unbroken through both layers', layers: [{ h: 46, lab: '\\epsilon_1:\\ E_1 = D/\\epsilon_1', shade: true }, { h: 70, lab: '\\epsilon_2:\\ E_2 = D/\\epsilon_2' }], top: '+\\rho_s', bot: '-\\rho_s', z: ['z = 0', 'z = d_1', 'z = d_1 + d_2'], arrows: [58, 212] }), cap: 'The same D crosses both layers (no free charge at the interface); E is larger in the layer with smaller ε.' } }),
      Q(md`**Predict.** A capacitor stays connected to its battery while a slab of $\epsilon_r = 3$ is pushed in to fill the gap. The charge on the plates…`,
        ['triples', 'stays the same', 'drops to a third', 'grows ninefold'], 0,
        [null, 'That is the disconnected case. Here $V$ is fixed, so $E = V/d$ is fixed and $D = \\epsilon E$ triples.', 'That would be the field in the disconnected case.', '$Q = CV$ with $C\\times3$ and $V$ fixed: one factor of 3.'],
        md`$V$ fixed, so $E = V/d$ is unchanged; $D = \epsilon E$ and so $\rho_s = D$ grow by $\epsilon_r = 3$. The battery supplies the extra charge.`),
      R(md`
        ### Step 6: a dielectric that conducts a little

        Give a layer a conductivity $\sigma > 0$. Wherever $\mathbf E \ne 0$ in it, $\mathbf J = \sigma\mathbf E$ moves charge. Charge flows until it cannot:
        - If the circuit closes through the layer (a battery across a single leaky layer), a steady current flows and $E = V/d$ stays.
        - If no steady current can pass (the layer is in series with a perfect insulator, or the plates are isolated), the steady state has **$\mathbf E = 0$ in the conducting layer**. Charge piles up at its boundaries: free surface charge appears at the interface, and the insulating layers take all the voltage.
        - An isolated capacitor filled with a slightly conducting fluid discharges through it: $\mathbf E$, $\mathbf D$ and $\mathbf P$ all go to zero (HW 4 #5(d)).

        How fast: $\tau = \epsilon/\sigma$ for a single material ([Topic 3](#/l/t3-relaxation)); seawater ($\sigma = 4$ S/m, $\epsilon = 81\epsilon_0$) gets there in $0.18$ ns.
      `),
      Q(md`**Predict.** Two layers fill a capacitor held at $V_0$ by a battery. Layer 1 is then made slightly conducting; layer 2 stays a perfect insulator. In the new steady state…`,
        ['layer 2 carries all of $V_0$', 'the voltage splits as before, in proportion to $d_i/\\epsilon_i$', 'layer 1 carries all of $V_0$', 'both fields are zero: the capacitor discharges'], 0,
        [null, 'That split holds only while no charge has moved through layer 1.', 'The conducting layer is the one that cannot keep a field: $\\mathbf J = \\sigma\\mathbf E$ would keep flowing.', 'The battery holds $V_0$ across the plates, and layer 2 can hold a field.'],
        md`No steady current can cross the insulating layer, so in steady state $J = \sigma E_1 = 0$: $E_1 = 0$. Then $V_0 = E_2d_2$. Free charge has collected on the interface to make that happen.`),
      R(md`
        ### The method

        !!method Fields in dielectrics, step by step
          1. **Free charge first.** Find $\mathbf D$ by Gauss's law with free charge only, or straight from the plates' $\rho_s$. Across layers stacked along the field, $D$ is the same in each.
          2. **$\mathbf E = \mathbf D/\epsilon$** in each region. If a voltage is given instead of a charge, write $V = \sum E_id_i$ and solve for $D$.
          3. **$\mathbf P = \mathbf D - \epsilon_0\mathbf E = (\epsilon - \epsilon_0)\mathbf E$.** Vacuum and conductors have $\mathbf P = 0$.
          4. **Bound charge:** $\rho_{sb} = \mathbf P\cdot\hat n$ ($\hat n$ out of the dielectric), $\rho_b = -\nabla\cdot\mathbf P$.
          5. **Conductors:** $\mathbf E = 0$ inside; $\rho_s = \hat n\cdot\mathbf D$ just outside, $\hat n$ out of the conductor. A region that conducts but cannot carry a steady current has $\mathbf E = 0$ in steady state.
          6. **Check** every interface: $E_t$ continuous, $\hat n\cdot(\mathbf D^+ - \mathbf D^-) = \rho_s$, and $\sum E_id_i = V$.

        ### Worked example

        !!graded Problem
          Infinite plates sit at $z = 0$ (grounded) and $z = 3$ mm (held at $V_0 = 120$ V). A slab of $\epsilon_r = 4$ fills $0 < z < 1$ mm; air fills the rest. Find $\mathbf D$, $\mathbf E$ in each layer, $V$ at the interface, $\mathbf P$ in the slab, the bound charge on the slab's top face, the charge density on the top plate and the capacitance per unit area.

        **1. Free charge and D.** Symmetry: $\mathbf D = D_z\hat z$, the same in both layers (no free charge at $z = 1$ mm). The top plate is at the higher potential, so the field points down: $D_z < 0$.

        **2. Voltage fixes D.**
        $$V_0 = |D|\left(\frac{d_1}{\epsilon_1} + \frac{d_2}{\epsilon_0}\right) \;\Rightarrow\; |D| = \frac{(120\ \text{V})(8.854\times10^{-12}\ \text{F/m})}{\frac{1\times10^{-3}}{4} + 2\times10^{-3}\ \text{m}} = 4.72\times10^{-7}\ \text{C/m}^2$$
        so $\mathbf D = -4.72\times10^{-7}\hat z$ C/m² in both layers.

        **3. E in each layer.** $\mathbf E_1 = \mathbf D/(4\epsilon_0) = -1.33\times10^4\hat z$ V/m; $\mathbf E_2 = \mathbf D/\epsilon_0 = -5.33\times10^4\hat z$ V/m.

        **4. Interface potential.** $V(1\ \text{mm}) = |E_1|d_1 = (1.33\times10^4\ \text{V/m})(10^{-3}\ \text{m}) = 13.3$ V. The air layer drops the other $106.7$ V: 89% of the voltage across two thirds of the gap.

        **5. P and bound charge.** $\mathbf P_1 = (\epsilon_1 - \epsilon_0)\mathbf E_1 = \tfrac34\mathbf D = -3.54\times10^{-7}\hat z$ C/m²; in air $\mathbf P = 0$. Top face of the slab ($\hat n = +\hat z$): $\rho_{sb} = \mathbf P_1\cdot\hat z = -3.54\times10^{-7}$ C/m², negative, facing the positive plate. (The bottom face carries $+3.54\times10^{-7}$ C/m².)

        **6. Plate charge and C.** The top plate's normal points out of it, into the gap: $\hat n = -\hat z$. $\rho_s = \hat n\cdot\mathbf D = +4.72\times10^{-7}$ C/m². $C/A = \rho_s/V_0 = 3.94\times10^{-9}$ F/m².

        **Check.** $13.3 + 106.7 = 120$ V ✓. $D_n$ is continuous and there is no $E_t$ ✓. All air would give $\epsilon_0/(3\ \text{mm}) = 2.95\times10^{-9}$ F/m², less, as it must ✓.

        !!mistake Common mistakes
          - Making all of $\mathbf E$ continuous at a dielectric interface. Only $E_t$ is; $E_n^+ = (\epsilon^-/\epsilon^+)E_n^-$.
          - Counting bound charge in $\oint\mathbf D\cdot d\mathbf S$. $\mathbf D$ sees free charge only; $\epsilon_0\mathbf E$ sees all of it.
          - Writing $\mathbf P = \epsilon\mathbf E$. It is $(\epsilon - \epsilon_0)\mathbf E = \epsilon_0\chi_e\mathbf E$; vacuum has $\mathbf P = 0$.
          - The wrong $\hat n$ in $\rho_s = \hat n\cdot\mathbf D$. It points out of the conductor, into the field: $-\hat z$ for a plate on top of the gap.
          - Mixing up fixed $Q$ (disconnected: $D$ fixed) and fixed $V$ (connected: $\sum E_id_i$ fixed).
          - Leaving a field in a conducting region through which no steady current can flow. In steady state $\mathbf E = 0$ there.

        ### Check questions
      `),
      Q(md`Three fields are drawn just outside a flat perfect conductor: (1) a field oblique to the surface, (2) a field tangential to it, (3) a field normal to it. At a perfect conductor $E_t = 0$ and $B_n = 0$. Which is true?`,
        ['1 can be neither $\\mathbf E$ nor $\\mathbf H$; 2 is $\\mathbf H$; 3 is $\\mathbf E$', '1, 2 and 3 can each be $\\mathbf E$ or $\\mathbf H$', '1 can be either; 2 is $\\mathbf E$; 3 is $\\mathbf H$', '1 can be neither; 2 is $\\mathbf E$; 3 is $\\mathbf H$'], 0,
        [null, 'A perfect conductor forbids tangential $\\mathbf E$ and normal $\\mathbf B$ just outside it.', 'An oblique field has both a tangential and a normal part, so it breaks both conditions.', 'Swapped: $\\mathbf E$ must be normal ($E_t = 0$) and $\\mathbf H$ tangential ($B_n = 0$).'],
        md`$E_t = 0$ allows only a normal $\mathbf E$ (field 3). $B_n = 0$ allows only a tangential $\mathbf H$ (field 2). The oblique field 1 has both parts and fits neither. (Lecture 16b challenge question.)`),
      Q(md`$\mathbf E$ is normal to the interface between $\epsilon_r = 2$ (below) and $\epsilon_r = 6$ (above), with no free surface charge. Below, $E = 300$ V/m. Above, $E = $`,
        ['100 V/m', '300 V/m', '900 V/m', '0'], 0,
        [null, 'The normal $E$ is not continuous; the normal $D$ is.', 'Inverted: the higher-$\\epsilon$ side has the weaker field.', 'Only a perfect conductor would kill the field.'],
        md`$D_n$ continuous: $2\epsilon_0(300) = 6\epsilon_0E^+$, so $E^+ = 100$ V/m.`),
      Q(md`At $z = 0$, with $\hat n = \hat z$, $\mathbf D^- = 5\hat z$ µC/m² (below) and $\mathbf D^+ = 2\hat z$ µC/m² (above). The free surface charge on $z = 0$ is…`,
        ['$-3$ µC/m²', '$+3$ µC/m²', '$+7$ µC/m²', '$0$, since $D_n$ is continuous'], 0,
        [null, 'Order matters: $\\rho_s = D^+_n - D^-_n$, region $+$ first.', 'That adds the two sides; the condition is a difference.', '$D_n$ is continuous only where there is no free charge. Here it jumps, so there is some.'],
        md`$\rho_s = \hat n\cdot(\mathbf D^+ - \mathbf D^-) = 2 - 5 = -3$ µC/m². Flux lines end on negative charge.`),
      Q(md`A slab $0 < z < d$ has $\mathbf P = P_0\dfrac{z}{d}\hat z$. The bound volume charge density inside is…`,
        ['$-P_0/d$', '$+P_0/d$', '$0$', '$-P_0z/d^2$'], 0,
        [null, 'Sign: $\\rho_b = -\\nabla\\cdot\\mathbf P$.', 'A nonuniform $\\mathbf P$ leaves charge inside: the dipole ends no longer cancel.', 'Differentiating $z/d$ gives $1/d$, a constant.'],
        md`$\rho_b = -\partial P_z/\partial z = -P_0/d$. The faces carry $\rho_{sb}(d) = +P_0$ and $\rho_{sb}(0) = 0$; total $P_0 - (P_0/d)d = 0$, neutral ✓.`),
      Q(md`A point charge $q$ sits in an empty cavity inside an uncharged metal block. In equilibrium the cavity wall carries…`,
        ['$-q$, and the outer surface $+q$', '$0$: the metal shields the charge', '$-q$, and the outer surface $0$', '$+q$, and the outer surface $-q$'], 0,
        [null, 'A Gaussian surface inside the metal (where $\\mathbf E = 0$) must enclose zero charge, so the wall holds $-q$.', 'The block is neutral, so if the wall holds $-q$ the outer surface holds $+q$.', 'Signs reversed: the wall charge cancels the enclosed $q$.'],
        md`Gauss on a surface inside the metal: $\mathbf E = 0$, so $q + Q_{\text{wall}} = 0$. Neutrality puts $+q$ on the outside, so the charge is still "seen" from outside.`),
      Q(md`An isolated charged capacitor stores energy $U$. A slab of $\epsilon_r = 5$ is slid in to fill the gap. The stored energy becomes…`,
        ['$U/5$', '$5U$', '$U$', '$U/25$'], 0,
        [null, 'That is the battery-connected case.', 'With $Q$ fixed, $C$ grows, so $Q^2/2C$ falls.', 'One factor: $C\\times5$ at fixed $Q$.'],
        md`$U = Q^2/(2C)$ with $Q$ fixed and $C\times5$: $U/5$. The field does work pulling the slab in.`),
      Q(md`A field line passes from a region of $\epsilon_r = 2$ into one of $\epsilon_r = 8$ (no free surface charge). Measured from the normal, the line on the $\epsilon_r = 8$ side is…`,
        ['farther from the normal', 'closer to the normal', 'at the same angle', 'exactly along the normal'], 0,
        [null, 'That would need $E_n$ to grow; it shrinks by $2/8$ entering the higher-$\\epsilon$ side.', 'The angle changes whenever $\\epsilon$ does (unless the line is exactly normal).', 'Only a conductor forces a normal field.'],
        md`$E_t$ is unchanged and $E_n$ drops by 4, so $\tan\theta$ grows by 4: the line leans toward the surface.`),
      Q(md`Two layers between plates: layer 1 is glass ($\epsilon_r = 6$), layer 2 is air, equal thickness, fixed $V$. Which layer has the larger field, and by how much?`,
        ['air, 6 times larger', 'glass, 6 times larger', 'equal: $D$ is the same', 'air, 36 times larger'], 0,
        [null, '$E = D/\\epsilon$: the larger $\\epsilon$ gives the smaller field.', 'Equal $D$ means unequal $E$ when $\\epsilon$ differs.', 'One factor of the ratio, not its square.'],
        md`$D$ is common, $E_i = D/\epsilon_i$: $E_{\text{air}}/E_{\text{glass}} = 6$. The air gap carries 6/7 of the voltage.`),
      R(md`
        ### Rapid fire: boundary conditions

        **The trick:** tangential $E$ copies across; normal $D$ copies across unless there is free charge ($\rho_s$ is the jump, region $+$ minus region $-$). At a conductor, $\rho_s = \hat n\cdot\mathbf D$ with $\hat n$ out of the metal.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t1_bc', { need: 8 }), { id: 't1-dielectrics.r0' }),
      R(md`
        ### Rapid fire: layers and fillings

        **The trick:** layers along the field share $D$, so $E_i \propto 1/\epsilon_i$. Disconnected: $D$ fixed. Connected: $V$ fixed. $P = \epsilon_0(\epsilon_r - 1)E$.
      `),
      Object.assign(G('rf_t1_cap', { need: 8 }), { id: 't1-dielectrics.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t1_layers', { need: 2 }),
      G('t1_interface', { need: 2 }),
      G('t1_coated', { need: 2 }),
      G('t1_leaky', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const V_M = (v) => `$${p(q3(v))}$ V/m`;
  const sg = (v, t = String(v)) => (v < 0 ? `- ${t.replace(/^-/, '')}` : `+ ${t}`);     // ' + 3' or ' - 3' after a first term
  const PAIRS = [[2, 4], [3, 6], [2, 5], [4, 2], [6, 3], [1, 3], [2, 8], [5, 2]];
  GENS.rf_t1_bc = () => one([
    // tangential E carries straight across
    () => {
      const [e1, e2] = pick(PAIRS), Ex = pick([2, 3, 4, 5, 6]) * pick([1, -1]), Ez = pick([2, 4, 6, 8]);
      return MC('Tangential E', md`Region 1 ($z < 0$, $\epsilon_r = ${e1}$) meets region 2 ($z > 0$, $\epsilon_r = ${e2}$), with no free surface charge. Just below, $\mathbf E_1 = ${Ex}\hat x + ${Ez}\hat z$ V/m. Just above, $E_{2x} = $`, V_M(Ex),
        [[V_M(Ex * e1 / e2), 'That scales the tangential part by the permittivity ratio; only the normal part changes.'], [V_M(Ex * e2 / e1), 'Tangential $E$ is continuous: no ratio at all.'], [V_M(0), 'Tangential $E$ vanishes only at a perfect conductor.'], [V_M(-Ex), 'No sign flip: the tangential part carries straight across.']],
        md`$\hat n\times(\mathbf E^+ - \mathbf E^-) = 0$: $E_{2x} = E_{1x} = ${Ex}$ V/m.`);
    },
    // normal E jumps by the permittivity ratio
    () => {
      const [e1, e2] = pick(PAIRS), Ez = pick([6, 12, 24, 30, 60]) * pick([1, -1]);
      const a = e1 * Ez / e2;
      return MC('Normal E', md`Region 1 ($z < 0$, $\epsilon_r = ${e1}$), region 2 ($z > 0$, $\epsilon_r = ${e2}$), no free surface charge. Just below, $E_{1z} = ${Ez}$ V/m. Just above, $E_{2z} = $`, V_M(a),
        [[V_M(Ez), 'Normal $E$ is not continuous across a change of $\\epsilon$; normal $D$ is.'], [V_M(e2 * Ez / e1), 'Inverted ratio: $\\epsilon_2E_{2z} = \\epsilon_1E_{1z}$.'], [V_M(-a), 'No sign flip: the flux keeps going the same way.'], [V_M(e1 * e2 * Ez), 'Divide by $\\epsilon_2$, do not multiply.']],
        md`$D_z$ is continuous: $${e2}\epsilon_0E_{2z} = ${e1}\epsilon_0(${Ez})$, so $E_{2z} = ${p(q3(a))}$ V/m.`);
    },
    // surface charge on a conductor from D
    () => {
      const [v, m] = pick([[[1, -2, 2], 3], [[2, 3, 6], 7], [[1, 4, 8], 9], [[2, -1, 2], 3], [[4, 4, 7], 9], [[0, 3, 4], 5], [[6, 2, 3], 7]]);
      const away = pick([true, false]), sum = v[0] + v[1] + v[2];
      const o = (k) => `$${k > 0 ? '+' : ''}${k}D_0$`;
      return MC('Charge on a conductor', md`Just outside a conductor, $\mathbf D = D_0\langle${v.join(', ')}\rangle$ ($D_0 > 0$), pointing **${away ? 'away from' : 'toward'}** the surface. $\rho_s = $`, o(away ? m : -m),
        [[o(away ? -m : m), md`${away ? 'Away' : 'Toward'} means $\hat n\cdot\mathbf D ${away ? '> 0' : '< 0'}$ with $\hat n$ out of the conductor.`], [o(away ? sum : -sum), 'That adds the components; the normal part is the full length $|\\mathbf D|$.'], [o(away ? v[2] : -v[2]), 'That keeps one component. At a conductor $\\mathbf D$ is purely normal, so all of it counts.'], ['$0$', 'The field ends on surface charge; $\\mathbf D \\ne 0$ outside means $\\rho_s \\ne 0$.']],
        md`$\mathbf D$ is normal to the surface, $|\mathbf D| = ${m}D_0$, and it points ${away ? 'out of' : 'into'} the conductor: $\rho_s = ${away ? '+' : '-'}${m}D_0$.`);
    },
    // free surface charge from the jump in D_n
    () => {
      const D1 = pick([2, 3, 5, 8]) * pick([1, -1]), D2 = pick([1, 4, 6, 7]) * pick([1, -1]);
      const o = (k) => `$${k}$ µC/m²`;
      return MC('Jump in D', md`At $z = 0$ with $\hat n = \hat z$: $D_z^- = ${D1}$ µC/m² just below and $D_z^+ = ${D2}$ µC/m² just above. The free surface charge is…`, o(D2 - D1),
        [[o(D1 - D2), 'Order: region $+$ minus region $-$.'], [o(D1 + D2), 'The condition is a difference, not a sum.'], [o(0), '$D_n$ is continuous only without free charge; here it jumps.']],
        md`$\rho_s = D_z^+ - D_z^- = ${D2} - (${D1}) = ${D2 - D1}$ µC/m².`);
    },
    // which E can exist just outside a perfect conductor
    () => {
      const ok = pick(['$5\\hat z$ V/m', '$-3\\hat z$ V/m', '$10\\hat z$ V/m']);
      return MC('At a perfect conductor', md`A perfect conductor fills $z < 0$, with air above. Which electric field can exist just above it?`, ok,
        [['$4\\hat x$ V/m', 'A tangential $\\mathbf E$ would push charge along the surface: $E_t = 0$ at a perfect conductor.'], ['$3\\hat x + 4\\hat z$ V/m', 'Its $x$-part is tangential, and $E_t$ must vanish.'], ['$2\\hat y - \\hat z$ V/m', 'Its $y$-part is tangential, and $E_t$ must vanish.'], ['none: $\\mathbf E = 0$ outside too', 'Outside, a normal field ending on surface charge is allowed: $\\rho_s = \\epsilon E_n$.']],
        md`Only a purely normal field satisfies $E_t = 0$. Its size sets the surface charge: $\rho_s = \epsilon_0E_z$.`);
    },
  ]);

  // fixed Q (disconnected) or fixed V (connected): what happens to each quantity when a slab fills the gap
  const FILL = {
    Q: { E: 'div', V: 'div', D: 'same', C: 'mul', U: 'div' },
    V: { E: 'same', V: 'same', D: 'mul', C: 'mul', U: 'mul' },
  };
  const QNAME = { E: 'the field $E$ in the gap', V: 'the voltage between the plates', D: 'the plate charge (and $D$)', C: 'the capacitance', U: 'the stored energy' };
  const WHY = {
    Q: { E: '$D = \\rho_s$ is fixed and $E = D/\\epsilon$.', V: '$V = Ed$ and $E$ drops.', D: 'Disconnected plates cannot gain or lose charge.', C: '$C = \\epsilon A/d$ for any connection.', U: '$U = Q^2/2C$ with $Q$ fixed.' },
    V: { E: '$E = V/d$ with $V$ fixed by the battery.', V: 'The battery holds $V$.', D: '$D = \\epsilon E$ with $E$ fixed; the battery supplies the charge.', C: '$C = \\epsilon A/d$ for any connection.', U: '$U = CV^2/2$ with $V$ fixed.' },
  };
  GENS.rf_t1_cap = () => one([
    () => {
      const er = pick([2, 3, 4, 5, 8]), mode = pick(['Q', 'V']), k = pick(['E', 'V', 'D', 'C', 'U']);
      const txt = { mul: `multiplied by ${er}`, div: `divided by ${er}`, same: 'unchanged', sq: `multiplied by ${er * er}` };
      const ans = FILL[mode][k];
      const other = FILL[mode === 'Q' ? 'V' : 'Q'][k];
      const why = (x) => (x === 'sq' ? 'Only one factor of $\\epsilon_r$ enters.'
        : x === 'same' ? `It changes. ${WHY[mode][k]}`
          : x === other ? `That is the battery-${mode === 'Q' ? 'connected' : 'disconnected'} result. Here: ${WHY[mode][k]}`
            : ans === 'same' ? `It stays the same. ${WHY[mode][k]}` : `Inverted. ${WHY[mode][k]}`);
      const w = ['mul', 'div', 'same', 'sq'].filter((x) => x !== ans).map((x) => [txt[x], why(x)]);
      return MC(mode === 'Q' ? 'Battery disconnected' : 'Battery connected', md`A parallel-plate capacitor is charged by a battery, which is then **${mode === 'Q' ? 'disconnected' : 'left connected'}**. A slab of $\epsilon_r = ${er}$ is slid in to fill the gap. ${QNAME[k][0].toUpperCase() + QNAME[k].slice(1)} is…`, txt[ans], w,
        md`${mode === 'Q' ? 'Disconnected: $Q$ (so $D$) is fixed.' : 'Connected: $V$ (so $E = V/d$) is fixed.'} ${WHY[mode][k]}`);
    },
    // ratio of fields in two layers
    () => {
      const [a, b] = pick([[2, 6], [3, 6], [2, 8], [4, 12], [1, 4], [1, 3], [5, 10], [3, 9]]);
      const o = (x) => `$${p(q3(x))}$`;
      return MC('Field ratio', md`Two layers fill a parallel-plate gap: layer 1 has $\epsilon_r = ${a}$, layer 2 has $\epsilon_r = ${b}$. $E_1/E_2 = $`, o(b / a),
        [[o(a / b), 'Inverted: $E = D/\\epsilon$, so the smaller $\\epsilon$ has the larger field.'], [o(1), 'That makes $E$ continuous; it is $D$ that is the same in both layers.'], [o((b / a) ** 2), 'One power of the ratio.']],
        md`Same $D$: $E_1/E_2 = \epsilon_2/\epsilon_1 = ${b}/${a}$.`);
    },
    // share of the voltage across a layer
    () => {
      const [a, b] = pick([[1, 3], [1, 4], [2, 6], [3, 6], [1, 9], [2, 8]]);
      const o = (x) => `$${p(q3(x * 100))}\\%$`;
      return MC('Voltage share', md`Equal-thickness layers of $\epsilon_r = ${a}$ (layer 1) and $\epsilon_r = ${b}$ (layer 2) fill a capacitor at voltage $V$. The fraction of $V$ across layer 1 is…`, o(b / (a + b)),
        [[o(a / (a + b)), 'Swapped: the lower-$\\epsilon$ layer has the larger field and takes the larger share.'], [o(0.5), 'Equal thickness, but not equal field: $E \\propto 1/\\epsilon$.'], [o(1), 'Both layers hold a field; neither conducts.']],
        md`$V_i \propto d_i/\epsilon_i$. With equal $d$: $V_1/V = \dfrac{1/${a}}{1/${a} + 1/${b}} = \dfrac{${b}}{${a + b}}$.`);
    },
    // P from E
    () => {
      const er = pick([2, 3, 4, 5, 9]), E = pick([100, 200, 500, 1000]);
      const o = (k) => `$${p(k)}\\,\\epsilon_0$ C/m²`;
      return MC('Polarization', md`A dielectric with $\epsilon_r = ${er}$ has a field $E = ${E}$ V/m in it. $|\mathbf P| = $`, o((er - 1) * E),
        [[o(er * E), 'That is $D = \\epsilon E$. Subtract $\\epsilon_0E$: $P = D - \\epsilon_0E$.'], [o(E), 'That is $\\epsilon_0E$, the vacuum part of $D$.'], [o((er + 1) * E), '$\\chi_e = \\epsilon_r - 1$, not $\\epsilon_r + 1$.'], [o((er - 1) * E / er), 'That divides by $\\epsilon_r$; $P = \\epsilon_0\\chi_eE$ with $\\chi_e = \\epsilon_r - 1$.']],
        md`$P = \epsilon_0\chi_eE = \epsilon_0(${er} - 1)(${E}) = ${(er - 1) * E}\,\epsilon_0$ C/m².`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // two dielectric layers between plates at a fixed voltage
  GENS.t1_layers = () => {
    const d1 = pick([1, 2, 3]), d2 = pick([1, 2, 4]), e1 = pick([2, 3, 4, 6, 9]), e2 = pick([1, 1, 2, 5]), V0 = pick([12, 24, 50, 100, 120]);
    const S = d1 * 1e-3 / e1 + d2 * 1e-3 / e2;                     // m; D = ε0 V0 / S
    const D = e0 * V0 / S, E1 = V0 / (e1 * S), E2 = V0 / (e2 * S), Vi = E1 * d1 * 1e-3, P1 = (e1 - 1) * e0 * E1, CA = e0 / S;
    const zt = d1 + d2;
    return {
      title: 'Two layers at a fixed voltage',
      q: md`Infinite plates sit at $z = 0$ (grounded) and $z = ${zt}$ mm (held at $V_0 = ${V0}$ V). A dielectric of $\epsilon_r = ${e1}$ fills $0 < z < ${d1}$ mm and ${e2 === 1 ? 'air' : `a dielectric of $\\epsilon_r = ${e2}$`} fills the rest. Find $|\mathbf D|$, the signed $E_z$ in each layer, the potential at the interface, $|\mathbf P|$ in the lower layer and the capacitance per unit area.`,
      parts: [
        N('|\\mathbf D|', D, 'C/m^2'),
        N('E_{1z}', -E1, 'V/m'),
        N('E_{2z}', -E2, 'V/m'),
        N(`V(${d1}\\ \\text{mm})`, Vi, 'V'),
        N('|\\mathbf P_1|', P1, 'C/m^2'),
        N('C/A', CA, 'F/m^2'),
      ],
      hints: ['No free charge sits at the interface, so $D$ is the same in both layers.', '$V_0 = |D|\\left(\\dfrac{d_1}{\\epsilon_1} + \\dfrac{d_2}{\\epsilon_2}\\right)$; the field points from the high plate to the low one, along $-\\hat z$.'],
      sol: sol({
        eq: md`$D$ common to both layers; $E_i = D/\epsilon_i$; $V_0 = \sum E_id_i$; $\mathbf P = (\epsilon - \epsilon_0)\mathbf E$; $C/A = \rho_s/V_0$.`,
        sym: md`$|D| = \dfrac{V_0}{d_1/\epsilon_1 + d_2/\epsilon_2}$, $E_{iz} = -|D|/\epsilon_i$ (top plate high, field down), $V(d_1) = |E_1|d_1$, $|P_1| = (1 - 1/\epsilon_{r1})|D|$, $C/A = \dfrac{1}{d_1/\epsilon_1 + d_2/\epsilon_2}$.`,
        sub: md`$$|D| = \frac{(${V0}\ \text{V})(8.854\times10^{-12}\ \text{F/m})}{\frac{${d1}\times10^{-3}}{${e1}} + \frac{${d2}\times10^{-3}}{${e2}}\ \text{m}} = ${f(D)}\ \text{C/m}^2$$
$$E_{1z} = -${f(E1)}\ \text{V/m}, \qquad E_{2z} = -${f(E2)}\ \text{V/m}, \qquad V(${d1}\ \text{mm}) = (${f(E1)})(${d1}\times10^{-3}) = ${f(Vi)}\ \text{V}$$`,
        ans: md`$|\mathbf D| = ${f(D)}$ C/m², $E_{1z} = -${f(E1)}$ V/m, $E_{2z} = -${f(E2)}$ V/m, $V = ${f(Vi)}$ V at the interface, $|\mathbf P_1| = ${f(P1)}$ C/m², $C/A = ${f(CA)}$ F/m².`,
        check: md`$|E_1|d_1 + |E_2|d_2 = ${f(Vi)} + ${f(E2 * d2 * 1e-3)} = ${V0}$ V ✓. The layer with smaller $\epsilon_r$ carries the larger field ✓.`,
      }),
    };
  };

  // boundary conditions at a dielectric interface with (or without) free surface charge
  GENS.t1_interface = () => {
    let e1, e2, a, c, s, E2z;
    do {
      e1 = pick([1, 2, 3, 4]); e2 = pick([2, 3, 4, 6, 8]); a = pick([2, 3, 5, -4, -6]); c = pick([4, 6, 8, 12, -6, -9]); s = pick([0, 0, 2, 4, -3, 6]);
      E2z = (e1 * c + s) / e2;
    } while (e1 === e2 || Math.abs(E2z) < 1e-9);
    const P2 = (e2 - 1) * E2z;
    return {
      title: 'Fields across an interface',
      q: md`Region 1 ($z < 0$) has $\epsilon = ${e1 === 1 ? '' : e1}\epsilon_0$; region 2 ($z > 0$) has $\epsilon = ${e2}\epsilon_0$. Just below $z = 0$, $\mathbf E_1 = ${a}\hat x ${sg(c)}\hat z$ V/m. ${s === 0 ? 'There is no free surface charge on $z = 0$.' : `The plane $z = 0$ carries free surface charge $\\rho_s = ${s}\\epsilon_0$ C/m².`} Find $\mathbf E_2$ just above, and $P_{2z}$.`,
      parts: [
        N('E_{2x}', a, 'V/m'),
        N('E_{2z}', E2z, 'V/m'),
        N('P_{2z}/\\epsilon_0', P2, 'V/m'),
      ],
      hints: ['$E_x$ is tangential: continuous.', `$\\hat n = \\hat z$ points from region 1 into region 2: $${e2}\\epsilon_0E_{2z} - ${e1 === 1 ? '' : e1}\\epsilon_0E_{1z} = \\rho_s$.`],
      sol: sol({
        eq: md`$\hat n\times(\mathbf E_2 - \mathbf E_1) = 0$ and $\hat n\cdot(\mathbf D_2 - \mathbf D_1) = \rho_s$ with $\hat n = \hat z$; $\mathbf P = (\epsilon - \epsilon_0)\mathbf E$.`,
        sym: md`$E_{2x} = E_{1x}$; $\;E_{2z} = \dfrac{\epsilon_1E_{1z} + \rho_s}{\epsilon_2}$; $\;P_{2z} = (\epsilon_2 - \epsilon_0)E_{2z}$.`,
        sub: md`$$E_{2z} = \frac{${e1}\epsilon_0(${c}) + (${s})\epsilon_0}{${e2}\epsilon_0} = ${f(E2z)}\ \text{V/m}, \qquad \frac{P_{2z}}{\epsilon_0} = (${e2} - 1)(${f(E2z)}) = ${f(P2)}\ \text{V/m}$$`,
        ans: md`$\mathbf E_2 = ${a}\hat x ${sg(E2z, f(E2z))}\hat z$ V/m; $P_{2z} = ${f(P2)}\,\epsilon_0$ C/m².`,
        check: md`The tangential part carries across unchanged. ${s === 0 ? 'With no free charge, $D_z$ is the same on both sides ✓.' : `$D_z$ jumps by exactly $\\rho_s$: $${e2}(${f(E2z)}) - ${e1}(${c}) = ${s}$ (in units of $\\epsilon_0$) ✓.`}`,
      }),
    };
  };

  // a charged metal sphere with a dielectric coating
  GENS.t1_coated = () => {
    const a = pick([1, 2, 3, 5]), b = a * pick([2, 3]), er = pick([2, 3, 4, 5]), Qn = pick([2, 5, 10, -4, -8]);
    const r = (a + b) / 2, Q = Qn * 1e-9, A = a / 100, B = b / 100, Rr = r / 100;
    const Er = Q / (4 * Math.PI * er * e0 * Rr * Rr), k = 1 - 1 / er;
    const sa = -k * Q / (4 * Math.PI * A * A), sb = k * Q / (4 * Math.PI * B * B), Eb = Q / (4 * Math.PI * e0 * B * B);
    return {
      title: 'Coated metal sphere',
      q: md`A metal sphere of radius $a = ${a}$ cm holds charge $Q = ${Qn}$ nC. A dielectric coating ($\epsilon_r = ${er}$) covers it out to $b = ${b}$ cm; air lies beyond. Find $E_r$ at $r = ${r}$ cm, the bound surface charge on the coating's inner face ($r = a$) and outer face ($r = b$), and $E_r$ just outside the coating.`,
      parts: [
        N(`E_r(${r}\\ \\text{cm})`, Er, 'V/m'),
        N('\\rho_{sb}(a)', sa, 'C/m^2'),
        N('\\rho_{sb}(b)', sb, 'C/m^2'),
        N('E_r(b^+)', Eb, 'V/m'),
      ],
      hints: ['Gauss with free charge: $D_r = Q/(4\\pi r^2)$ everywhere outside the metal.', '$\\mathbf P = (1 - 1/\\epsilon_r)\\mathbf D$ in the coating; $\\rho_{sb} = \\mathbf P\\cdot\\hat n$ with $\\hat n = -\\hat r$ on the inner face and $+\\hat r$ on the outer face.'],
      sol: sol({
        eq: md`$\oint\mathbf D\cdot d\mathbf S = Q$; $\mathbf E = \mathbf D/\epsilon$; $\mathbf P = \mathbf D - \epsilon_0\mathbf E$; $\rho_{sb} = \mathbf P\cdot\hat n$ ($\hat n$ out of the coating).`,
        sym: md`$D_r = \dfrac{Q}{4\pi r^2}$; in the coating $E_r = \dfrac{Q}{4\pi\epsilon_r\epsilon_0r^2}$ and $P_r = \Big(1 - \dfrac1{\epsilon_r}\Big)\dfrac{Q}{4\pi r^2}$. $\rho_{sb}(a) = -P_r(a)$, $\rho_{sb}(b) = +P_r(b)$; outside, $E_r = \dfrac{Q}{4\pi\epsilon_0r^2}$.`,
        sub: md`$$E_r = \frac{${Qn}\times10^{-9}}{4\pi(${er})(8.854\times10^{-12})(${Rr})^2} = ${f(Er)}\ \text{V/m}, \qquad \rho_{sb}(a) = -\Big(1 - \frac{1}{${er}}\Big)\frac{${Qn}\times10^{-9}}{4\pi(${A})^2} = ${f(sa)}\ \text{C/m}^2$$
$$\rho_{sb}(b) = \Big(1 - \frac{1}{${er}}\Big)\frac{${Qn}\times10^{-9}}{4\pi(${B})^2} = ${f(sb)}\ \text{C/m}^2, \qquad E_r(b^+) = \frac{${Qn}\times10^{-9}}{4\pi(8.854\times10^{-12})(${B})^2} = ${f(Eb)}\ \text{V/m}$$`,
        ans: md`$E_r(${r}\ \text{cm}) = ${f(Er)}$ V/m, $\rho_{sb}(a) = ${f(sa)}$ C/m², $\rho_{sb}(b) = ${f(sb)}$ C/m², $E_r(b^+) = ${f(Eb)}$ V/m.`,
        check: md`Total bound charge: $4\pi a^2\rho_{sb}(a) + 4\pi b^2\rho_{sb}(b) = 0$ ✓. The inner face's bound charge has the opposite sign of $Q$ and cuts the field by $\epsilon_r = ${er}$; crossing $r = b$, $|E_r|$ grows by the factor ${er} ✓.`,
      }),
    };
  };

  // two layers at a fixed voltage, the lower one slightly conducting: the steady state and how long it takes
  GENS.t1_leaky = () => {
    const d1 = pick([1, 2, 4]), d2 = pick([1, 2, 3]), e1 = pick([2, 3, 4, 6]), e2 = pick([2, 3, 5].filter((x) => x !== e1)), V0 = pick([10, 20, 50, 100]), s1 = pick([1e-9, 2e-9, 5e-9, 1e-8]);
    const D1 = d1 * 1e-3, D2 = d2 * 1e-3;
    const E2 = V0 / D2, rs = -e2 * e0 * V0 / D2, tau = (e1 * e0 + e2 * e0 * D1 / D2) / s1;
    const E1i = V0 / (e1 * (D1 / e1 + D2 / e2));        // the field in layer 1 before any charge has moved
    return {
      title: 'A leaky layer in steady state',
      q: md`Plates at $z = 0$ (grounded) and $z = ${d1 + d2}$ mm (at $V_0 = ${V0}$ V). Layer 1, $0 < z < ${d1}$ mm, has $\epsilon_r = ${e1}$ and a small conductivity $\sigma_1 = ${p(s1)}$ S/m. Layer 2 above it is a perfect insulator with $\epsilon_r = ${e2}$. Long after $V_0$ is applied, find the field in each layer and the free surface charge on the interface. How long does it take to get there (the time constant)?`,
      parts: [
        { lbl: 'In steady state, the field in layer 1 is', mc: ['zero', `$${f(E1i)}$ V/m, as before the charge moved`, `$V_0/d_1 = ${f(V0 / D1)}$ V/m`, `$V_0/(d_1 + d_2) = ${f(V0 / (D1 + D2))}$ V/m`], a: 0, why: [null, 'That is the field just after $V_0$ is applied, before any charge flows through layer 1.', 'That would put all the voltage on the conducting layer, which cannot hold a steady field.', 'That ignores both layers\' properties.'] },
        N('|E_2|', E2, 'V/m'),
        N('\\rho_s\\ \\text{(interface)}', rs, 'C/m^2'),
        N('\\tau', tau, 's'),
      ],
      hints: ['No steady current can cross the insulator, so in steady state $J_1 = \\sigma_1E_1 = 0$.', 'Per unit area the layers are $C_1 = \\epsilon_1/d_1$ in parallel with $G_1 = \\sigma_1/d_1$, in series with $C_2 = \\epsilon_2/d_2$; the interface voltage relaxes with $\\tau = (C_1 + C_2)/G_1$.'],
      sol: sol({
        eq: md`Steady state: $\mathbf J_1 = \sigma_1\mathbf E_1 = 0$. Interface: $\hat z\cdot(\mathbf D_2 - \mathbf D_1) = \rho_s$. Transient: $\tau = (C_1 + C_2)/G_1$ per unit area.`,
        sym: md`$E_1 = 0$, so $V_0 = |E_2|d_2$: $|E_2| = V_0/d_2$, pointing $-\hat z$. $D_{2z} = -\epsilon_2V_0/d_2$ and $D_{1z} = 0$, so $\rho_s = -\epsilon_2V_0/d_2$. $\tau = \dfrac{\epsilon_1/d_1 + \epsilon_2/d_2}{\sigma_1/d_1} = \dfrac{\epsilon_1 + \epsilon_2d_1/d_2}{\sigma_1}$.`,
        sub: md`$$|E_2| = \frac{${V0}\ \text{V}}{${d2}\times10^{-3}\ \text{m}} = ${f(E2)}\ \text{V/m}, \qquad \rho_s = -\frac{(${e2})(8.854\times10^{-12})(${V0})}{${d2}\times10^{-3}} = ${f(rs)}\ \text{C/m}^2$$
$$\tau = \frac{(8.854\times10^{-12})\left(${e1} + ${e2}\cdot\frac{${d1}}{${d2}}\right)}{${p(s1)}\ \text{S/m}} = ${f(tau)}\ \text{s}$$`,
        ans: md`$E_1 = 0$; $|E_2| = ${f(E2)}$ V/m (along $-\hat z$); $\rho_s = ${f(rs)}$ C/m² on the interface; $\tau = ${f(tau)}$ s.`,
        check: md`The interface charge is negative: it sits right under the positive top plate and cancels its flux, so none reaches layer 1 ✓. The top plate holds $+${f(-rs)}$ C/m², more than the $${f(e0 * e1 * E1i)}$ C/m² it held at first (the battery supplied it) ✓.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t1-dielectrics'] = [
    Q(md`A material has $\epsilon_r = 5$. Its electric susceptibility $\chi_e$ is…`,
      ['4', '5', '6', '1/5'], 0,
      [null, 'That is $\\epsilon_r$ itself; $\\chi_e = \\epsilon_r - 1$.', 'Subtract 1, do not add.', '$\\chi_e$ is not a reciprocal.'],
      md`$\epsilon_r = 1 + \chi_e$, so $\chi_e = 4$. Vacuum has $\chi_e = 0$.`),
    Q(md`$\mathbf D$ and $\mathbf P$ are measured in…`,
      ['C/m², both', 'V/m, both', 'C/m² and V/m', 'F/m, both'], 0,
      [null, 'V/m is the unit of $\\mathbf E$; $\\mathbf D = \\epsilon_0\\mathbf E + \\mathbf P$ has the units of $\\epsilon_0E$: C/m².', 'They are added in $\\mathbf D = \\epsilon_0\\mathbf E + \\mathbf P$, so they share a unit.', 'F/m is the unit of $\\epsilon$.'],
      md`$\epsilon_0E$: (F/m)(V/m) = C/m². $\mathbf P$, a dipole moment (C·m) per volume (m³), is also C/m².`),
    Q(md`Across an interface between two perfect dielectrics with no free surface charge, which pair is continuous?`,
      ['$E_t$ and $D_n$', '$E_n$ and $D_t$', '$\\mathbf E$ and $\\mathbf D$ entirely', '$E_n$ and $D_n$'], 0,
      [null, 'Those are the two that jump when $\\epsilon$ changes.', '$\\mathbf E$ entirely would need $E_n$ continuous too, which fails when $\\epsilon^+ \\ne \\epsilon^-$.', '$E_n$ and $D_n$ cannot both be continuous when $\\epsilon$ changes, since $D_n = \\epsilon E_n$.'],
      md`The loop gives $E_t$; the pillbox (no free charge) gives $D_n$. Then $D_t = \epsilon E_t$ and $E_n = D_n/\epsilon$ both jump.`),
    Q(md`In air just outside a charged conductor, $E = 10^5$ V/m. The surface charge density there is about…`,
      ['0.885 µC/m²', '8.85 µC/m²', '0.0885 µC/m²', '$10^5$ C/m²'], 0,
      [null, 'Off by ten: $\\epsilon_0E = 8.854\\times10^{-12}\\times10^5$.', 'Off by ten the other way.', 'Multiply by $\\epsilon_0$: $\\rho_s = \\epsilon_0E_n$.'],
      md`$\rho_s = \epsilon_0E_n = (8.854\times10^{-12})(10^5) = 8.85\times10^{-7}$ C/m².`),
    Q(md`A neutral dielectric object is polarized by an external field. Its total bound charge is…`,
      ['zero', 'negative', 'positive', 'equal to the free charge nearby'], 0,
      [null, 'Polarization only separates charge inside each molecule; nothing is added.', 'Polarization only separates charge inside each molecule; nothing is added.', 'Bound charge belongs to the object; it is not set by charges elsewhere.'],
      md`Every dipole has a $+$ and a $-$ end. $\int\rho_b\,dV + \oint\rho_{sb}\,dS = 0$.`),
    Q(md`In vacuum, $\mathbf P$ and $\mathbf D$ are…`,
      ['$\\mathbf P = 0$, $\\mathbf D = \\epsilon_0\\mathbf E$', '$\\mathbf P = \\epsilon_0\\mathbf E$, $\\mathbf D = 2\\epsilon_0\\mathbf E$', '$\\mathbf P = \\mathbf D = 0$', '$\\mathbf P = \\mathbf D$'], 0,
      [null, 'Vacuum has nothing to polarize: $\\chi_e = 0$.', '$\\mathbf D$ is not zero when $\\mathbf E$ is not.', '$\\mathbf P = 0$ and $\\mathbf D = \\epsilon_0\\mathbf E \\ne 0$.'],
      md`$\chi_e = 0$, so $\mathbf P = 0$ and $\mathbf D = \epsilon_0\mathbf E$ (Summer 2020 #1(a): the free-space layer has $\mathbf P = 0$).`),
    Q(md`The field just outside a conductor has a tangential component. What does this tell you?`,
      ['The conductor is not in equilibrium: charge is still moving', 'The surface charge is negative there', 'The conductor is grounded', 'Nothing: tangential fields are allowed'], 0,
      [null, 'The sign of $\\rho_s$ comes from $E_n$, not from $E_t$.', 'Grounding fixes the potential; the field is still normal.', 'A tangential field along the surface would drive surface current.'],
      md`$E_t$ is continuous, so it would also exist just inside the surface and push charge. Equilibrium requires $E_t = 0$.`),
    Q(md`A dielectric with no free charge and uniform $\epsilon$ has $\rho_b$ inside equal to…`,
      ['zero', 'negative where the field enters, positive where it leaves', 'proportional to $|\\mathbf E|$', 'the face charge $\\rho_{sb}$ spread over the thickness'], 0,
      [null, 'That describes the bound charge on the faces (C/m²), not inside the volume.', 'Linear and uniform: $\\nabla\\cdot\\mathbf P = \\epsilon_0\\chi_e\\nabla\\cdot\\mathbf E = 0$ however strong the field.', 'Face charge is a surface density in its own right; the two faces cancel each other, not a volume charge.'],
      md`$\rho_b = -\nabla\cdot\mathbf P = -\dfrac{\chi_e}{1 + \chi_e}\rho = 0$. Bound charge lives only on the surfaces.`),
    Q(md`In HW 4 #2, two grounded plates sandwich a charged sheet $\rho_{s0}$. The induced charges on the two plates add up to…`,
      ['$-\\rho_{s0}$', '$+\\rho_{s0}$', '$0$', '$-2\\rho_{s0}$'], 0,
      [null, 'The plates hold the opposite sign: field lines start on the sheet and end on the plates.', 'Zero is the total including the sheet: with no field outside, $\\rho_s(0) + \\rho_{s0} + \\rho_s(5) = 0$.', 'Each line ends once; the total is just $-\\rho_{s0}$.'],
      md`Outside the grounded plates $\mathbf E = 0$, so a pillbox around the whole stack encloses zero charge: $\rho_s(0) + \rho_{s0} + \rho_s(5) = 0$.`),
    Q(md`$\mathbf P = \alpha(x\hat x + y\hat y)$ with $\alpha$ constant. The bound volume charge density is…`,
      ['$-2\\alpha$', '$+2\\alpha$', '$0$', '$-\\alpha$'], 0,
      [null, 'Minus sign: $\\rho_b = -\\nabla\\cdot\\mathbf P$.', 'The divergence of $x\\hat x + y\\hat y$ is 2.', 'Two components contribute, 1 each.'],
      md`$\nabla\cdot\mathbf P = 2\alpha$, so $\rho_b = -2\alpha$.`),
    Q(md`Stored energy density in a linear dielectric is…`,
      ['$\\tfrac12\\mathbf D\\cdot\\mathbf E = \\tfrac12\\epsilon E^2$', '$\\tfrac12\\epsilon_0E^2$ always', '$\\mathbf D\\cdot\\mathbf E$', '$\\tfrac12\\epsilon D^2$'], 0,
      [null, 'That ignores the energy stored in stretching the molecules.', 'Missing the factor ½.', 'Units: $\\epsilon D^2$ is not J/m³.'],
      md`$w_e = \tfrac12\mathbf D\cdot\mathbf E$ (J/m³). In vacuum it reduces to $\tfrac12\epsilon_0E^2$.`),
    Q(md`High-voltage insulation (glass, $\epsilon_r = 6$) has a thin air bubble with faces normal to the field. Where does breakdown start?`,
      ['in the air bubble', 'in the glass', 'equally likely anywhere', 'nowhere: the bubble lowers the field'], 0,
      [null, 'The glass has the weaker field ($E = D/6\\epsilon_0$) and the higher breakdown strength.', 'The field is 6 times stronger in the air.', 'It raises the field inside itself.'],
      md`$D_n$ is continuous, so $E_{\text{air}} = 6E_{\text{glass}}$, and air breaks down at a lower field (about 3 MV/m).`),
    Q(md`At a boundary between two perfect dielectrics, the bound surface charge equals…`,
      ['$\\epsilon_0(E_n^+ - E_n^-)$', '$D_n^+ - D_n^-$', '$0$', '$\\hat n\\cdot(\\mathbf P^+ - \\mathbf P^-)$'], 0,
      [null, 'That is the free charge, zero here.', 'The two materials polarize differently, so their bound face charges do not cancel.', 'Sign: each face carries $\\mathbf P\\cdot$(its own outward normal), $+\\hat n$ for region $-$ and $-\\hat n$ for region $+$, so it is $\\hat n\\cdot(\\mathbf P^- - \\mathbf P^+)$.'],
      md`All charge (free + bound) is the jump of $\epsilon_0E_n$. With no free charge, it is all bound: $\epsilon_0(E_n^+ - E_n^-) = \hat n\cdot(\mathbf P^- - \mathbf P^+)$.`),
    Q(md`A capacitor's gap holds glycerin. The voltage is fixed; the glycerin is slowly drained and replaced by air. The plate charge…`,
      ['falls by the factor $\\epsilon_r$', 'stays the same', 'rises by $\\epsilon_r$', 'drops to zero'], 0,
      [null, 'At fixed $V$, $E$ is fixed and $D = \\epsilon E$ shrinks.', 'Inverted.', 'Air still holds a field and so a charge.'],
      md`$\rho_s = D = \epsilon V/d$. The battery takes the extra charge back.`),
    Q(md`Inside a conductor in electrostatic equilibrium, the potential is…`,
      ['the same everywhere, including the surface', 'zero', 'largest at the center', 'largest at sharp points'], 0,
      [null, 'Constant, but not necessarily zero; that depends on the reference.', '$\\mathbf E = -\\nabla V = 0$ means no variation at all.', 'Sharp points have the largest surface charge and field outside, not a different potential.'],
      md`$\mathbf E = 0$ inside means $\nabla V = 0$: one constant value, the conductor's potential.`),
    Q(md`Two layers, $\epsilon_1$ (thickness $d_1$) and $\epsilon_2$ ($d_2$), fill a parallel-plate capacitor. Its capacitance per unit area is…`,
      ['$\\dfrac{1}{d_1/\\epsilon_1 + d_2/\\epsilon_2}$', '$\\dfrac{\\epsilon_1}{d_1} + \\dfrac{\\epsilon_2}{d_2}$', '$\\dfrac{\\epsilon_1 + \\epsilon_2}{d_1 + d_2}$', '$\\dfrac{\\epsilon_1\\epsilon_2}{d_1 + d_2}$'], 0,
      [null, 'That is parallel; stacked layers share $D$ and add voltages: series.', 'That ignores which thickness each $\\epsilon$ fills; with $\\epsilon_1 = \\epsilon_2 = \\epsilon$ it gives $2\\epsilon/d$, twice too much.', 'Units: F²/m³, not F/m².'],
      md`$V = D(d_1/\epsilon_1 + d_2/\epsilon_2)$ and $\rho_s = D$, so $C/A = 1/(d_1/\epsilon_1 + d_2/\epsilon_2)$ (HW 4 #3(f)).`),
    Q(md`Isolated plates with $\pm\rho_s$ have a dielectric slab in the middle of the gap, touching neither plate. The slab becomes slightly conducting and the system reaches a steady state. Then…`,
      ['$\\mathbf E$ is zero in the slab; the air gaps keep their field', 'the plates discharge and $\\mathbf E = 0$ everywhere', '$\\mathbf E$ in the slab is unchanged', '$\\mathbf E$ in the slab doubles'], 0,
      [null, 'The slab does not touch the plates: no current can reach them across the air.', 'Any field in the conducting slab would keep driving current.', 'Charge moves to cancel the field inside, not to increase it.'],
      md`Charge in the slab moves to its faces until $\mathbf E = 0$ inside, like any conductor. The air gaps, bounded by the plates, keep $E = \rho_s/\epsilon_0$.`),
    Q(md`$\mathbf D$ just outside a perfect conductor is $D_0\langle1, 0, \sqrt3\rangle$, pointing toward the surface. $\rho_s = $`,
      ['$-2D_0$', '$+2D_0$', '$-(1 + \\sqrt3)D_0$', '$-\\sqrt3D_0$'], 0,
      [null, 'Toward the surface: $\\hat n\\cdot\\mathbf D < 0$ with $\\hat n$ out of the conductor.', 'Use the length $\\sqrt{1 + 3}$, not the sum of components.', 'The whole $\\mathbf D$ is normal at a conductor.'],
      md`$|\mathbf D| = D_0\sqrt{1 + 3} = 2D_0$, pointing in: $\rho_s = -2D_0$ (Lecture 16b).`),
  ];
})();

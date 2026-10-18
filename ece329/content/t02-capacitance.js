/* Topic 2 — Capacitance, conductance, RC (Lectures 10, 15). C = Q/V and the Gauss recipe; parallel plates, coax,
   concentric and isolated spheres; series and parallel fillings; resistance of a filling (dR summed over shells);
   G/C = σ/ε; the lossy capacitor as C ∥ R with τ = ε/σ; a lossy capacitor driven through a source resistance.
   Dielectrics and boundary conditions are Topic 1; charge relaxation inside a conductor is Topic 3. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;
  const e0 = EM.eps0;
  const q3 = (x) => +x.toPrecision(3);

  // ---------------------------------------------------------------- figures
  // coax (or concentric spheres) in cross-section: radial E between the conductors, a Gaussian circle of radius r
  function coaxFig() {
    const g = PF.fig({ alt: 'cross-section of a coax: inner conductor of radius a, outer conductor of radius b, the filling between them shaded, radial E arrows, and a dashed Gaussian circle of radius r' });
    const cx = 120, cy = 110, a = 22, b = 82, r = 54;
    g.circle(cx, cy, b, { cls: 'shade' });
    g.circle(cx, cy, a, { cls: 'bgfill' });
    g.circle(cx, cy, a, { cls: 'thick' });
    g.circle(cx, cy, b, { cls: 'thick' });
    g.circle(cx, cy, r, { cls: 'dash dim' });
    for (const deg of [-80, -40, 0, 40, 80]) {
      const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
      g.arrow(cx + (a + 6) * c, cy - (a + 6) * s, cx + (b - 7) * c, cy - (b - 7) * s, { hs: 6 });
    }
    // radii as dimension lines below the drawing, measured from the center line
    const y0 = cy + b + 14;
    g.line(cx, cy, cx, y0 + 36, { cls: 'dim thin dash' });
    [[a, 'a'], [r, 'r'], [b, 'b']].forEach(([R0, lab], k) => {
      const y = y0 + 15 * k;
      g.line(cx - R0, cy, cx - R0, y + 3, { cls: 'dim thin dash' });
      g.dim(cx - R0, y, cx, y, '');
      g.label(cx - R0 - 5, y, lab, 'r', 'small');
    });
    g.label(cx + b * 0.72 + 8, cy - b * 0.72 - 4, '\\mathbf E', 'bl');
    return g.svg();
  }

  // two fillings of the same plates: layers stacked along E (series) and side by side (parallel)
  function fillFig(series) {
    const g = PF.fig({ alt: series ? 'two layers stacked between the plates, one above the other' : 'two fillings side by side, each spanning the whole gap' });
    const x1 = 20, x2 = 150, yT = 20, yB = 100;
    if (series) {
      g.rect(x1, 60, x2 - x1, 40, { cls: 'shade nodecl' });
      g.line(x1, 60, x2, 60, { cls: 'dim dash' });
      g.label(85, 80, '\\epsilon_1, d_1', 'c', 'small');
      g.label(85, 40, '\\epsilon_2, d_2', 'c', 'small');
    } else {
      g.rect(x1, yT, 65, yB - yT, { cls: 'shade nodecl' });
      g.line(85, yT, 85, yB, { cls: 'dim dash' });
      g.label(52, 60, '\\epsilon_1, A_1', 'c', 'small');
      g.label(118, 60, '\\epsilon_2, A_2', 'c', 'small');
    }
    g.line(x1, yT, x2, yT, { cls: 'thick' });
    g.line(x1, yB, x2, yB, { cls: 'thick' });
    return g.svg();
  }

  // a source V_s with series R_s driving a lossy capacitor, drawn as C in parallel with R
  const zigH = (g, x1, x2, y, n = 6, h = 6) => { const pts = [[x1, y]]; for (let i = 0; i < n; i++) pts.push([x1 + (x2 - x1) * (i + 0.5) / n, y + (i % 2 ? h : -h)]); pts.push([x2, y]); g.pl(pts); };
  const zigV = (g, x, y1, y2, n = 6, w = 6) => { const pts = [[x, y1]]; for (let i = 0; i < n; i++) pts.push([x + (i % 2 ? w : -w), y1 + (y2 - y1) * (i + 0.5) / n]); pts.push([x, y2]); g.pl(pts); };
  function circFig() {
    const g = PF.fig({ alt: 'a DC source V_s in series with R_s drives a lossy capacitor, drawn as a capacitor C in parallel with a resistor R' });
    const xL = 30, xc = 160, xr = 220, yT = 30, yB = 150, ym = 90;
    g.circle(xL, ym, 14);
    g.add(`<path class="glyph" d="M${xL - 4},${ym - 5}H${xL + 4}M${xL},${ym - 9}V${ym - 1}M${xL - 4},${ym + 6}H${xL + 4}"/>`);   // + above, − below
    g.line(xL, yT, xL, ym - 14);
    g.line(xL, ym + 14, xL, yB);
    g.label(xL - 20, ym, 'V_s', 'r');
    g.line(xL, yT, 70, yT);
    zigH(g, 70, 116, yT);
    g.label(93, yT - 10, 'R_s', 'b', 'small');
    g.line(116, yT, xr, yT);
    g.line(xc, yT, xc, ym - 6);
    g.line(xc - 14, ym - 6, xc + 14, ym - 6, { cls: 'thick' });
    g.line(xc - 14, ym + 6, xc + 14, ym + 6, { cls: 'thick' });
    g.line(xc, ym + 6, xc, yB);
    g.label(xc - 20, ym, 'V_c', 'r', 'small');
    g.label(xc + 18, ym, 'C', 'l', 'small');
    g.line(xr, yT, xr, ym - 26);
    zigV(g, xr, ym - 26, ym + 26);
    g.line(xr, ym + 26, xr, yB);
    g.label(xr + 12, ym, 'R', 'l', 'small');
    g.line(xL, yB, xr, yB);
    return g.svg();
  }

  const decayPlot = () => PF.plot({
    w: 300, h: 170, x: [0, 4.2], y: [0, 1.1], xl: 't/\\tau', yl: 'V_c/V_c(0)',
    xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[1, '1'], [Math.exp(-1), '1/e']],
    curves: [{ f: (t) => Math.exp(-t) }], pts: [{ x: 1, y: Math.exp(-1) }],
  });

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u1', {
    id: 't2-capacitance', topic: 2, ref: 'Lectures 10, 15', title: 'Capacitance, conductance, RC',
    steps: [
      R(md`
        !!key Why you care
          Capacitors open two past exams: Summer 2019 #1 (a lossy coax: $\mathcal C$ from $\mathcal G$, the steady voltage behind a source resistance, the decay time), its conflict exam #1 (the same for parallel plates), Summer 2020 #1(a)(iii) ($C$ per area of two layers). HW 4 #3(f), #4 (spherical shells: $C$, $G$ by summing shells, the RC discharge) and HW 7 #1 (measuring $\epsilon$ from an RC time constant) use it too.

        ### Notation

        - $Q$: charge on the positive conductor, C (the other holds $-Q$). $V$: potential difference from the $+$ to the $-$ conductor, V.
        - $C = Q/V$: capacitance, F = C/V. For long structures, per unit length: $\mathcal C$, F/m.
        - $A$: plate area, m². $d$: gap, m. $a$, $b$: inner and outer radii, m. $\ell$: length, m.
        - $\epsilon$ (F/m) and $\sigma$ (S/m): permittivity and conductivity of the filling.
        - $\mathbf J = \sigma\mathbf E$: conduction current density, A/m² (Ohm's law at a point).
        - $I$: current, A. $R = V/I$: resistance, Ω. $G = 1/R = I/V$: conductance, S (siemens, 1/Ω). Per unit length: $\mathcal G$, S/m.
        - $V_s$, $R_s$: a source voltage and its series (internal) resistance. $V_c$: the capacitor's voltage.
        - $\tau$: time constant, s.

        ### The idea

        Put $\pm Q$ on two conductors. The field, and so the voltage between them, is proportional to $Q$; the ratio depends only on the shape and on $\epsilon$:
        $$C = \frac{Q}{V} = \epsilon\times(\text{geometric factor})$$
        Fill the same space with a material of conductivity $\sigma$ and the same field drives $\mathbf J = \sigma\mathbf E$ from one conductor to the other. The conductance has the **same** geometric factor, $G = \sigma\times(\text{geometric factor})$, so
        $$\frac{G}{C} = \frac{\sigma}{\epsilon}$$
        A real capacitor is $C$ in parallel with $R = 1/G$. It leaks its own charge with $\tau = RC = \epsilon/\sigma$, whatever its shape.
      `),
      R(md`
        ### Step 1: the recipe, on parallel plates

        Assume $\pm Q$; find $\mathbf E$ by Gauss's law; integrate to get $V$; divide. For plates of area $A$ a distance $d$ apart (ignore the edges): $D = Q/A$, $E = Q/(\epsilon A)$, $V = Ed$, so
        $$C = \frac{\epsilon A}{d}$$
        $Q$ cancels: it always does, which is why $C$ is a property of the geometry alone. For layered fillings, $C/A = 1/\sum(d_i/\epsilon_i)$ ([Topic 1](#/l/t1-dielectrics)).
      `),
      Q(md`**Predict.** A charged parallel-plate capacitor is disconnected, then its plates are pulled apart to twice the gap. The voltage between them…`,
        ['doubles', 'halves', 'stays the same', 'quadruples'], 0,
        [null, 'That is $C$, which halves. With $Q$ fixed, $V = Q/C$ doubles.', '$V$ stays the same only if a battery holds it.', '$C \\propto 1/d$: one factor of 2.'],
        md`Isolated: $Q$ fixed, so $E = Q/(\epsilon A)$ is fixed, and $V = Ed$ doubles. (Equivalently $C$ halves.) You did work pulling the plates apart; it is stored in the extra field volume.`),
      RF(md`
        ### Step 2: coax and spheres

        [[fig:coax]]

        **Coax** (inner radius $a$, outer $b$, $\pm\rho_l$ per unit length): Gauss on a cylinder of radius $r$ and length $\ell$ gives $D\,2\pi r\ell = \rho_l\ell$, so $E = \dfrac{\rho_l}{2\pi\epsilon r}$. Then
        $$V = \int_a^b\frac{\rho_l}{2\pi\epsilon r}dr = \frac{\rho_l}{2\pi\epsilon}\ln\frac ba, \qquad \mathcal C = \frac{\rho_l}{V} = \frac{2\pi\epsilon}{\ln(b/a)}$$
        **Concentric spheres** ($\pm Q$ on radii $a < b$): $E = \dfrac{Q}{4\pi\epsilon r^2}$ and
        $$V = \frac{Q}{4\pi\epsilon}\Big(\frac1a - \frac1b\Big), \qquad C = 4\pi\epsilon\frac{ab}{b - a}$$
        **Isolated sphere** ($b \to \infty$): $C = 4\pi\epsilon a$. In air, a 1 m sphere has $111$ pF; the whole Earth, $0.71$ mF.
      `, { coax: { svg: coaxFig(), cap: 'Inner conductor $+\\rho_l$ per length, outer $-\\rho_l$. E points radially out and falls as 1/r. Concentric spheres look the same in cross-section, with E ∝ 1/r².' } }),
      Q(md`**Predict.** An isolated metal sphere of radius 10 cm sits in air. Its capacitance is about…`,
        ['11 pF', '111 pF', '1.1 pF', '0.89 pF'], 0,
        [null, 'That is a 1 m sphere: $C$ grows with the radius.', 'Off by ten: $4\\pi\\epsilon_0 = 111$ pF/m times $0.1$ m.', 'That is $\\epsilon_0a$: the $4\\pi$ is missing.'],
        md`$C = 4\pi\epsilon_0a = (111\ \text{pF/m})(0.1\ \text{m}) = 11.1$ pF.`),
      RF(md`
        ### Step 3: layered and side-by-side fillings

        [[fig:fill]]

        - **Layers stacked along $\mathbf E$** share the same $D$ and their voltages add: **series**. $\dfrac1C = \sum\dfrac{d_i}{\epsilon_iA}$.
        - **Fillings side by side**, each spanning the gap, share the same $E = V/d$ and their charges add: **parallel**. $C = \sum\dfrac{\epsilon_iA_i}{d}$.

        **HW 7 #1, measuring $\epsilon$.** A capacitor in an RC circuit (fixed external $R$) has $\tau = RC$, so $\tau$ tracks $C$. A slab that fills the gap and raises $\tau$ by 50% raises $C$ by 50%: $\epsilon = 1.5\epsilon_0$. A slab only half the gap's thickness must do more: $\dfrac{1}{C} = \dfrac{d/2}{\epsilon A} + \dfrac{d/2}{\epsilon_0A} = \dfrac{1}{1.5}\dfrac{d}{\epsilon_0A}$ gives $\epsilon = 3\epsilon_0$.
      `, { fill: { svg: PF.row([{ svg: fillFig(true), cap: 'Stacked: same D, series.' }, { svg: fillFig(false), cap: 'Side by side: same E, parallel.' }]).svg } }),
      Q(md`**Predict.** A slab of $\epsilon_r = 3$, half as thick as the gap, lies flat on one plate of an air capacitor $C_0$. The capacitance becomes…`,
        ['$1.5C_0$', '$2C_0$', '$3C_0$', '$0.75C_0$'], 0,
        [null, 'That is the side-by-side result, $(1 + 3)/2$. A flat slab is in series with the air.', 'That fills the whole gap.', 'Adding dielectric cannot lower $C$.'],
        md`Series halves: $\dfrac{C_0}{C} = \dfrac12\cdot\dfrac13 + \dfrac12 = \dfrac23$, so $C = 1.5C_0$.`),
      R(md`
        ### Step 4: resistance and conductance of a filling

        Give the filling a conductivity $\sigma$. The conductors are still equipotentials, so $\mathbf E$ has the same shape, and $\mathbf J = \sigma\mathbf E$. The current leaving the $+$ conductor is
        $$I = \oint\mathbf J\cdot d\mathbf S = \sigma\oint\mathbf E\cdot d\mathbf S = \frac{\sigma}{\epsilon}Q \quad\Rightarrow\quad G = \frac IV = \frac{\sigma}{\epsilon}C$$
        **Directly, by adding resistances.** A uniform bar: $R = \ell/(\sigma A)$. A filling whose cross-section changes along the current: cut it into thin pieces in series and add $dR = d\ell/(\sigma A(\ell))$. Spherical shells:
        $$dR = \frac{dr}{\sigma\,4\pi r^2} \quad\Rightarrow\quad R = \frac{1}{4\pi\sigma}\Big(\frac1a - \frac1b\Big), \qquad G = 4\pi\sigma\frac{ab}{b - a}$$
        exactly $(\sigma/\epsilon)C$ ✓. Coax: $\mathcal G = \dfrac{2\pi\sigma}{\ln(b/a)}$.

        $G/C = \sigma/\epsilon$ needs **one** material between the conductors. With layers, compute $C$ (series $d_i/\epsilon_i$) and $R$ (series $d_i/\sigma_i$) separately.
      `),
      Q(md`**Predict.** A coax has $\mathcal C = 100$ pF/m with a filling of $\epsilon = 2\epsilon_0$ and $\sigma = 10^{-6}$ S/m. Its leakage conductance per unit length is…`,
        ['5.6 µS/m', '11.3 µS/m', '$1.8\\times10^{-15}$ S/m', '1 µS/m'], 0,
        [null, 'That uses $\\epsilon_0$; the filling has $\\epsilon = 2\\epsilon_0$.', 'That multiplies by $\\epsilon/\\sigma$ instead of $\\sigma/\\epsilon$; check the units: s·F/m is not S/m.', 'That is just $\\sigma\\times$(1 m); the geometry matters.'],
        md`$\mathcal G = \dfrac{\sigma}{\epsilon}\mathcal C = \dfrac{10^{-6}}{1.77\times10^{-11}}(10^{-10}) = 5.6\times10^{-6}$ S/m.`),
      RF(md`
        ### Step 5: the lossy capacitor in a circuit

        [[fig:circ]]

        **Alone.** Charge leaks through its own conductance: $dQ/dt = -GV = -(G/C)Q$, so
        $$Q(t) = Q(0)e^{-t/\tau}, \qquad \tau = RC = \frac{C}{G} = \frac{\epsilon}{\sigma}$$
        The geometry cancels. This is charge relaxation ([Topic 3](#/l/t3-relaxation)).

        **Driven through $R_s$ by a DC source $V_s$.** In steady state no current charges $C$; the leakage $R$ and $R_s$ form a divider:
        $$V_c = V_s\frac{R}{R + R_s}$$
        **Source disconnected at $t = 0$:** $C$ discharges through its own $R$ only, with $\tau = RC = \epsilon/\sigma$. (While connected, the capacitor sees $R \parallel R_s$, so it charges with $(R\parallel R_s)C$, faster.)

        [[fig:decay]]
      `, { circ: { svg: circFig(), cap: 'The lossy capacitor is C in parallel with its leakage R = 1/G. At DC, C carries no current.' }, decay: { svg: decayPlot(), cap: 'After disconnection: $V_c$ falls to $1/e$ of its start in one $\\tau = \\epsilon/\\sigma$.' } }),
      Q(md`**Predict.** A lossy capacitor with leakage $R = 1$ MΩ is connected through $R_s = 1$ MΩ to a 10 V DC source. In steady state, $V_c = $`,
        ['5 V', '10 V', '0 V', '3.3 V'], 0,
        [null, 'That is an ideal capacitor. The leakage current drops voltage across $R_s$.', 'The leakage does not short the capacitor; it forms a divider with $R_s$.', 'That would need $R = R_s/2$.'],
        md`No current into $C$ at DC; $I = 10\ \text{V}/2\ \text{M}\Omega = 5$ µA flows through $R_s$ and $R$, and $V_c = IR = 5$ V. (Summer 2019 #1(b).)`),
      R(md`
        ### The method

        !!method Capacitance, conductance and the lossy capacitor
          1. **Charge it:** $+Q$ on one conductor, $-Q$ on the other ($\pm\rho_l$ per length for long structures).
          2. **Gauss** with $\mathbf D$ (free charge) gives $\mathbf D(r)$, then $\mathbf E = \mathbf D/\epsilon$ in each region.
          3. **Voltage:** $V = \int\mathbf E\cdot d\mathbf l$ from the $+$ conductor to the $-$ conductor.
          4. **$C = Q/V$.** Check: F (or F/m), positive, and the thin-gap limit $\epsilon A/d$.
          5. **Conductance:** $G = (\sigma/\epsilon)C$ for a single filling; otherwise add $dR = d\ell/(\sigma A)$ along the current.
          6. **Circuit:** $C\parallel R$ with $R = 1/G$. DC steady state: $C$ is open. Alone or disconnected: $\tau = RC = \epsilon/\sigma$.

        ### Worked example

        !!graded Problem
          A coax of length $\ell = 2$ m is filled with a material of $\epsilon = 4\epsilon_0$ and $\sigma = 10^{-6}$ S/m; its leakage conductance is $\mathcal G = 5$ µS/m. (a) Find $\mathcal C$ and $b/a$. (b) It is connected through $R_s = 200$ kΩ to a 12 V DC source. Find $V_c$ in steady state. (c) The source is disconnected at $t = 0$. When is $V_c = V_c(0)/e$?

        **1. Per-unit-length capacitance.** One filling, so $\mathcal C/\mathcal G = \epsilon/\sigma$:
        $$\mathcal C = \frac{\epsilon}{\sigma}\mathcal G = \frac{4(8.854\times10^{-12}\ \text{F/m})}{10^{-6}\ \text{S/m}}(5\times10^{-6}\ \text{S/m}) = 1.77\times10^{-10}\ \text{F/m} = 177\ \text{pF/m}$$

        **2. Geometry.** $\mathcal G = 2\pi\sigma/\ln(b/a)$, so $\ln(b/a) = \dfrac{2\pi(10^{-6})}{5\times10^{-6}} = 1.257$ and $b/a = 3.51$.

        **3. Totals.** $C = \mathcal C\ell = 354$ pF. $G = \mathcal G\ell = 10$ µS, so $R = 100$ kΩ.

        **4. Steady state.** $C$ draws no DC current; $R$ and $R_s$ divide $V_s$:
        $$V_c = (12\ \text{V})\frac{100\ \text{k}\Omega}{100\ \text{k}\Omega + 200\ \text{k}\Omega} = 4.00\ \text{V}$$

        **5. Discharge.** Disconnected, $C$ sees only its own $R$: $\tau = RC = (10^5\ \Omega)(3.54\times10^{-10}\ \text{F}) = 35.4$ µs. $V_c(t) = 4e^{-t/\tau}$ V reaches $V_c(0)/e$ at $t_1 = 35.4$ µs.

        **Check.** $\tau = \epsilon/\sigma = 3.54\times10^{-11}/10^{-6} = 35.4$ µs, independent of $\ell$ and $b/a$ ✓. Ω·F = s ✓. As $\sigma \to 0$, $R \to \infty$ and $V_c \to 12$ V, the ideal capacitor ✓.

        !!mistake Common mistakes
          - Using $G/C = \sigma/\epsilon$ for a layered filling. It needs one material; otherwise find $C$ and $R$ separately.
          - Treating layers stacked along the field as parallel. They share $D$ and add voltages: series.
          - Forgetting the length: $C = \mathcal C\ell$, $G = \mathcal G\ell$, but $R = 1/(\mathcal G\ell)$, not $\ell/\mathcal G$.
          - Putting the diameter in $C = 4\pi\epsilon a$, or forgetting the $4\pi$ ($111$ pF per meter of radius in air).
          - Including $R_s$ in the decay after the source is disconnected. Only the capacitor's own leakage remains.
          - Expecting a lossy capacitor to charge to the full $V_s$ through $R_s$. At DC it sits at the divider voltage.

        ### Check questions
      `),
      Q(md`For a parallel-plate line of plate width $w$, per unit length $\mathcal C = \epsilon w/d$, $\mathcal G = \sigma w/d$ and the inductance $\mathcal L = \mu d/w$. The plate separation $d$ is increased. Which is true?`,
        ['$\\mathcal L$ increases, $\\mathcal C$ decreases', '$\\mathcal G$ and $\\mathcal L$ both increase', '$\\mathcal C$ and $\\mathcal G$ both increase', '$\\mathcal G$ increases, $\\mathcal L$ decreases'], 0,
        [null, '$\\mathcal G \\propto 1/d$ falls.', 'Both are proportional to $1/d$.', 'Reversed: $\\mathcal G$ falls and $\\mathcal L$ grows.'],
        md`$\mathcal C$ and $\mathcal G$ go as $w/d$; $\mathcal L$ goes as $d/w$. Their products $\mathcal L\mathcal C = \mu\epsilon$ and ratio $\mathcal G/\mathcal C = \sigma/\epsilon$ do not change. (Lecture 15 challenge question.)`),
      Q(md`An air-filled parallel-plate capacitor has $C = 8.854$ pF. The gap is filled with a dielectric of $\epsilon = 2\epsilon_0$. Now $C = $`,
        ['17.7 pF', '8.85 pF', '4.43 pF', '35.4 pF'], 0,
        [null, '$C$ is proportional to $\\epsilon$.', 'Inverted: more $\\epsilon$, more $C$.', 'One factor of 2.'],
        md`$C = \epsilon\times(\text{G.F.})$; doubling $\epsilon$ doubles $C$: $17.7$ pF. (The geometric factor is $C/\epsilon_0 = 1$ m.)`, { src: 'Summer 2019 Exam 2 (conflict)' }),
      Q(md`The same capacitor ($C = 8.854$ pF in air, so its geometric factor is 1 m), filled with the $\epsilon = 2\epsilon_0$ dielectric, has $C = 17.7$ pF. The dielectric's conductivity is $\sigma = 10^{-6}$ S/m. The conductance is…`,
        ['$10^{-6}$ S', '$10^{6}$ S', '$1.77\\times10^{-17}$ S', '$10^{-6}$ Ω'], 0,
        [null, 'That is the resistance in ohms, $1/G$.', 'That multiplies $\\sigma$ by $C$; $G = \\sigma\\times$(G.F.) $= (\\sigma/\\epsilon)C$.', 'Conductance is measured in siemens.'],
        md`$G = \sigma\times(\text{G.F.}) = (10^{-6}\ \text{S/m})(1\ \text{m}) = 10^{-6}$ S, so $R = 1$ MΩ.`, { src: 'Summer 2019 Exam 2 (conflict)' }),
      Q(md`A coax filled with $\epsilon = 2\epsilon_0$, $\sigma = 10^{-6}$ S/m is charged and disconnected. Its voltage falls to $1/e$ of its starting value after…`,
        ['17.7 µs, for any length', '17.7 µs per meter of length', '8.85 µs', '$5.65\\times10^{4}$ s'], 0,
        [null, '$\\tau = \\epsilon/\\sigma$: length and radii cancel.', 'That uses $\\epsilon_0$ instead of $2\\epsilon_0$.', 'That is $\\sigma/\\epsilon$, a rate in s⁻¹, read as a time.'],
        md`$\tau = RC = \epsilon/\sigma = (17.7\times10^{-12})/10^{-6} = 17.7$ µs. (Summer 2019 #1(c).)`, { src: 'Summer 2019 Exam 2' }),
      Q(md`Both radii of a coax are doubled; the filling stays the same. Its capacitance per unit length…`,
        ['is unchanged', 'doubles', 'halves', 'quadruples'], 0,
        [null, '$\\mathcal C$ depends on $b/a$ only, which is unchanged.', 'Only the ratio enters, through $\\ln(b/a)$.', 'There is no area factor in a coax.'],
        md`$\mathcal C = 2\pi\epsilon/\ln(b/a)$: scale-free. Only the ratio of the radii matters.`),
      Q(md`Concentric spheres with $b = 2a$ have capacitance $C_1$. An isolated sphere of radius $a$ has $C_2$. Then $C_1/C_2 = $`,
        ['2', '1/2', '1', '4'], 0,
        [null, 'Adding a nearby outer shell raises $C$: it needs less voltage for the same charge.', '$4\\pi\\epsilon ab/(b - a) = 8\\pi\\epsilon a$ differs from $4\\pi\\epsilon a$.', '$ab/(b - a) = 2a$: one factor of 2.'],
        md`$C_1 = 4\pi\epsilon\dfrac{a(2a)}{a} = 8\pi\epsilon a = 2C_2$.`),
      Q(md`Two layers of equal thickness, $\epsilon_r = 2$ and $\epsilon_r = 6$, fill an air capacitor's gap ($C_{\text{air}}$), stacked along the field. Now $C = $`,
        ['$3C_{\\text{air}}$', '$4C_{\\text{air}}$', '$8C_{\\text{air}}$', '$1.5C_{\\text{air}}$'], 0,
        [null, 'That is the side-by-side (parallel) average.', 'That adds them as if each filled the whole gap.', 'That is $1/(1/2 + 1/6)$ without the halves.'],
        md`$\dfrac{C_{\text{air}}}{C} = \dfrac12\cdot\dfrac12 + \dfrac12\cdot\dfrac16 = \dfrac13$, so $C = 3C_{\text{air}}$.`),
      Q(md`A lossy capacitor ($C$, leakage $R$) is connected at $t = 0$ through $R_s$ to a DC source. It charges toward its steady voltage with time constant…`,
        ['$(R\\parallel R_s)C$', '$RC$', '$R_sC$', '$(R + R_s)C$'], 0,
        [null, 'That is the time constant after the source is removed.', 'That ignores the leakage path.', 'Seen from $C$, the two resistors are in parallel (the source is a short for the transient).'],
        md`Thevenin from the capacitor's terminals: $R_{\text{th}} = R\parallel R_s$. So it charges faster than it later discharges on its own.`),
      R(md`
        ### Rapid fire: scaling

        **The trick:** $C = \epsilon\times$(geometry) and $G = \sigma\times$(the same geometry). Plates: $A/d$. Coax: $2\pi/\ln(b/a)$ per meter. Sphere: $4\pi a$. $\tau = \epsilon/\sigma$ ignores geometry.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t2_scale', { need: 8 }), { id: 't2-capacitance.r0' }),
      R(md`
        ### Rapid fire: numbers

        **The trick:** $\epsilon_0 = 8.85$ pF/m and $4\pi\epsilon_0 = 111$ pF/m. Steady DC: $V_c = V_sR/(R + R_s)$.
      `),
      Object.assign(G('rf_t2_num', { need: 8 }), { id: 't2-capacitance.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t2_coax', { need: 2 }),
      G('t2_sphere', { need: 2 }),
      G('t2_circuit', { need: 2 }),
      G('t2_measure', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const FAC = (x) => (x === 1 ? 'unchanged' : x > 1 ? `multiplied by ${p(x)}` : `divided by ${p(1 / x)}`);
  GENS.rf_t2_scale = () => one([
    // parallel plates
    () => {
      const [what, k] = pick([['double the plate area', 2], ['double the gap', 0.5], ['fill the gap with $\\epsilon_r = 3$ instead of air', 3], ['halve the gap and double the area', 4], ['double both the area and the gap', 1], ['triple the gap', 1 / 3]]);
      const w = k === 1 ? [[FAC(2), 'Doubling $A$ doubles $C$, but doubling $d$ halves it.'], [FAC(4), 'The two changes cancel in $A/d$.'], [FAC(0.5), 'The two changes cancel in $A/d$.']]
        : [[FAC(1 / k), 'Inverted: $C = \\epsilon A/d$ grows with $A$ and $\\epsilon$, falls with $d$.'], [FAC(k * k), 'Each factor enters once.'], ['unchanged', 'This change does alter $\\epsilon A/d$.']];
      return MC('Parallel plates', md`A parallel-plate capacitor: you ${what}. Its capacitance is…`, FAC(k), w, md`$C = \epsilon A/d$.`);
    },
    // coax per unit length
    () => {
      const [what, k, why, w] = pick([
        ['double both radii', 1, '$\\mathcal C$ depends on $b/a$ only.', [[FAC(2), 'Only the ratio $b/a$ enters, and it is unchanged.'], [FAC(0.5), 'Only the ratio $b/a$ enters, and it is unchanged.'], [FAC(4), 'There is no area factor in a coax.']]],
        ['fill it with $\\epsilon_r = 4$ instead of air', 4, '$\\mathcal C \\propto \\epsilon$.', [[FAC(0.25), 'Inverted: more $\\epsilon$, more capacitance.'], [FAC(16), 'One factor of $\\epsilon_r$.'], [FAC(2), 'No square root: $\\mathcal C \\propto \\epsilon$.']]],
        ['change $b/a$ from $e$ to $e^2$', 0.5, '$\\ln(b/a)$ goes from 1 to 2.', [[FAC(2), 'Inverted: $\\ln(b/a)$ is in the denominator.'], [FAC(1 / Math.E), 'The ratio enters through its logarithm, not directly.'], [FAC(0.25), 'The logarithm doubles; it is not squared.']]],
        ['double its length', 1, 'Per unit length, nothing changed (the total $C$ doubles).', [[FAC(2), 'That is the total $C$; per unit length it is unchanged.'], [FAC(0.5), 'A longer coax does not dilute each meter.'], [FAC(4), 'Neither total nor per-length $C$ grows fourfold.']]],
      ]);
      return MC('Coax', md`A coax: you ${what}. Its capacitance **per unit length** is…`, FAC(k), w,
        md`$\mathcal C = 2\pi\epsilon/\ln(b/a)$. ${why}`);
    },
    // spheres
    () => {
      const [what, ans, w] = pick([
        ['An isolated sphere\'s radius is doubled. $C$ is…', 'multiplied by 2', [['multiplied by 4', '$C = 4\\pi\\epsilon a$ is linear in $a$, not in the area.'], ['unchanged', 'A bigger sphere needs less voltage per coulomb.'], ['divided by 2', 'Inverted.']]],
        ['An outer shell at $b = 2a$ is added around an isolated sphere of radius $a$ (and connected as the return conductor). $C$ is…', 'multiplied by 2', [['unchanged', 'The shell brings the $-Q$ closer: $ab/(b - a) = 2a$.'], ['divided by 2', 'A nearby return conductor raises $C$.'], ['multiplied by 4', '$ab/(b - a)$ is $2a$, not $4a$.']]],
        ['The outer shell of a pair of concentric spheres is moved out to infinity. $C$…', 'falls to $4\\pi\\epsilon a$', [['grows without limit', 'The voltage grows, so $C$ shrinks toward a finite value.'], ['falls to zero', '$ab/(b - a) \\to a$, not 0.'], ['is unchanged', '$ab/(b - a)$ depends on $b$.']]],
      ]);
      return MC('Spheres', what, ans, w, md`$C = 4\pi\epsilon\dfrac{ab}{b - a}$, which tends to $4\pi\epsilon a$ as $b \to \infty$.`);
    },
    // time constant
    () => {
      const [what, ans, w] = pick([
        ['A lossy capacitor\'s plates are moved closer, doubling $C$. Its self-discharge time $\\tau$ is…', 'unchanged', [['doubled', '$G$ doubles too: $\\tau = C/G = \\epsilon/\\sigma$.'], ['halved', '$\\tau$ depends on the material only.'], ['quadrupled', '$\\tau$ depends on the material only.']]],
        ['The filling\'s conductivity doubles. $\\tau$ is…', 'halved', [['doubled', 'A better conductor leaks faster.'], ['unchanged', '$\\tau = \\epsilon/\\sigma$ does depend on $\\sigma$.'], ['quartered', 'One factor of $\\sigma$.']]],
        ['The filling\'s permittivity doubles (same $\\sigma$). $\\tau$ is…', 'doubled', [['halved', 'More $\\epsilon$ stores more charge per volt; the same leak takes longer.'], ['unchanged', '$\\tau = \\epsilon/\\sigma$.'], ['quadrupled', 'One factor of $\\epsilon$.']]],
        ['A lossy coax is cut to half its length. Its self-discharge $\\tau$ is…', 'unchanged', [['halved', '$C$ and $G$ both halve.'], ['doubled', '$C$ and $G$ both halve.'], ['quartered', '$C$ and $G$ both halve.']]],
      ]);
      return MC('Time constant', what, ans, w, md`$\tau = RC = C/G = \epsilon/\sigma$: geometry cancels.`);
    },
    // Lecture 15: which way do C, G, L move
    () => {
      const [q, ans, w] = pick([
        ['The gap $d$ of a parallel-plate line grows. $\\mathcal G$…', 'decreases', [['increases', '$\\mathcal G = \\sigma w/d$.'], ['is unchanged', '$\\mathcal G$ depends on $d$.']]],
        ['The gap $d$ of a parallel-plate line grows. $\\mathcal L$…', 'increases', [['decreases', '$\\mathcal L = \\mu d/w$.'], ['is unchanged', '$\\mathcal L$ depends on $d$.']]],
        ['The gap $d$ of a parallel-plate line grows. $\\mathcal L\\mathcal C$…', 'is unchanged', [['increases', '$\\mathcal L\\mathcal C = \\mu\\epsilon$.'], ['decreases', '$\\mathcal L\\mathcal C = \\mu\\epsilon$.']]],
        ['The ratio $b/a$ of a coax grows. $\\mathcal C$…', 'decreases', [['increases', '$\\mathcal C = 2\\pi\\epsilon/\\ln(b/a)$.'], ['is unchanged', '$\\mathcal C$ depends on $b/a$.']]],
      ]);
      return MC('Which way', q, ans, w, md`$\mathcal C = \epsilon\cdot\text{G.F.}$, $\mathcal G = \sigma\cdot\text{G.F.}$, $\mathcal L = \mu/\text{G.F.}$`);
    },
  ]);

  const SEC = (t) => `$${f(t)}$ s`;
  GENS.rf_t2_num = () => one([
    // τ = ε/σ for a material
    () => {
      const [name, er, s] = pick([['a lossy plastic', 2, 1e-6], ['seawater', 81, 4], ['copper', 1, 5.8e7], ['a damp ceramic', 6, 1e-4], ['an oil', 3, 1e-9], ['a leaky gel', 4, 1e-5]]);
      const t = er * e0 / s;
      return MC('Self-discharge time', md`A capacitor is filled with ${name}: $\epsilon = ${er === 1 ? '' : er}\epsilon_0$, $\sigma = ${p(s)}$ S/m. Its self-discharge time constant is…`, SEC(t),
        [[SEC(s / (er * e0)), 'That is $\\sigma/\\epsilon$, a rate in s⁻¹.'], [SEC(e0 / s), er === 1 ? 'Off: recompute $\\epsilon/\\sigma$.' : 'That uses $\\epsilon_0$ and drops $\\epsilon_r$.'], [SEC(t * 1000), 'Off by $10^3$: recheck the powers of ten.'], [SEC(er * s), 'That multiplies $\\epsilon_r$ by $\\sigma$; divide $\\epsilon$ (in F/m) by $\\sigma$.']],
        md`$\tau = \epsilon/\sigma = ${er}(8.854\times10^{-12})/${p(s)} = ${f(t)}$ s.`);
    },
    // isolated sphere
    () => {
      const a = pick([0.1, 0.5, 1, 2, 5, 10]);
      const pf = (x) => `$${p(q3(x))}$ pF`;
      const C = 4 * Math.PI * e0 * a * 1e12;
      return MC('Isolated sphere', md`An isolated metal sphere of radius $${a}$ m in air has $C = $`, pf(C),
        [[pf(C / (4 * Math.PI)), 'That is $\\epsilon_0a$: the $4\\pi$ is missing.'], [pf(C * a), 'That uses $a^2$; $C$ is linear in $a$.'], [pf(2 * C), 'That uses the diameter.'], [pf(C * 10), 'Off by ten: $4\\pi\\epsilon_0 = 111$ pF/m.']],
        md`$C = 4\pi\epsilon_0a = (111\ \text{pF/m})(${a}\ \text{m}) = ${p(q3(C))}$ pF.`);
    },
    // divider at DC
    () => {
      const [Rk, Rs, Vs] = pick([[3, 1, 10], [1, 4, 10], [2, 1, 12], [1, 2, 9], [4, 1, 20], [2, 3, 10]]);
      const v = (x) => `$${p(q3(x))}$ V`;
      const Vc = Vs * Rk / (Rk + Rs);
      return MC('Steady state', md`A lossy capacitor with leakage $R = ${Rk}$ MΩ is fed by a ${Vs} V DC source through $R_s = ${Rs}$ MΩ. In steady state $V_c = $`, v(Vc),
        [[v(Vs), 'That is an ideal capacitor; the leakage current drops voltage across $R_s$.'], [v(Vs * Rs / (Rk + Rs)), 'That is the drop across $R_s$, not across the capacitor.'], [v(0), 'The leakage forms a divider with $R_s$; it does not short the capacitor.']],
        md`At DC the capacitor draws nothing: $V_c = V_s\dfrac{R}{R + R_s} = ${Vs}\cdot\dfrac{${Rk}}{${Rk + Rs}} = ${p(q3(Vc))}$ V.`);
    },
    // parallel plates in pF
    () => {
      const Acm = pick([100, 200, 400, 50]), dmm = pick([0.5, 1, 2]), er = pick([1, 2, 4]);
      const C = er * e0 * Acm * 1e-4 / (dmm * 1e-3) * 1e12;
      const pf = (x) => `$${p(q3(x))}$ pF`;
      return MC('Parallel plates', md`Plates of area $${Acm}\,\text{cm}^2$, $${dmm}$ mm apart, filled with $\epsilon_r = ${er}$. $C = $`, pf(C),
        [[pf(C * 100), 'cm² converted with $10^{-2}$; $1\\,\\text{cm}^2 = 10^{-4}\\,\\text{m}^2$.'], [pf(C / 10), 'Off by ten: mm is $10^{-3}$ m.'], [pf(er === 1 ? C * 4 * Math.PI : C / er), er === 1 ? 'No $4\\pi$ in the plate formula.' : 'Multiply by $\\epsilon_r$, do not leave it out.']],
        md`$C = \epsilon A/d = ${er}(8.854\times10^{-12})(${Acm}\times10^{-4})/(${dmm}\times10^{-3}) = ${p(q3(C))}$ pF.`);
    },
    // two fillings
    () => {
      const [a, b] = pick([[2, 6], [3, 6], [1, 3], [4, 12], [1, 4]]);
      const stacked = pick([true, false]);
      const ser = 2 / (1 / a + 1 / b), par = (a + b) / 2;
      const o = (x) => `$${p(q3(x))}\\,C_{\\text{air}}$`;
      return MC('Two fillings', md`Fillings of $\epsilon_r = ${a}$ and $\epsilon_r = ${b}$ share an air capacitor's gap equally, ${stacked ? '**stacked** one above the other (each half the thickness)' : '**side by side** (each over half the area)'}. $C = $`, o(stacked ? ser : par),
        [[o(stacked ? par : ser), stacked ? 'That is the side-by-side (parallel) result.' : 'That is the stacked (series) result.'], [o(a + b), stacked ? 'That adds them in parallel, as if each filled the whole gap.' : 'Each fills only half the area: average them, do not add.'], [o(a * b / (a + b)), stacked ? `Forgot that each layer is half the thickness: $C_{\\text{air}}/C = \\tfrac12(1/${a} + 1/${b})$.` : 'That combines them in series; side-by-side fillings are in parallel.']],
        md`${stacked ? `Series halves: $C_{\\text{air}}/C = \\tfrac12(1/${a} + 1/${b})$.` : `Parallel halves: $C/C_{\\text{air}} = \\tfrac12(${a} + ${b})$.`}`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // a lossy coax: C per length, R of a length, τ
  GENS.t2_coax = () => {
    const a = pick([0.5, 1, 2]), k = pick([2, 3, 4, 5]), er = pick([2, 2.25, 3, 4]), s = pick([1e-7, 1e-6, 1e-5]), l = pick([1, 2, 5, 10]);
    const b = a * k, ln = Math.log(k), eps = er * e0;
    const Cp = 2 * Math.PI * eps / ln, Gp = 2 * Math.PI * s / ln, Rl = 1 / (Gp * l), tau = eps / s;
    return {
      title: 'Lossy coax',
      q: md`A coax has inner radius $a = ${a}$ mm and outer radius $b = ${b}$ mm, filled with a material of $\epsilon_r = ${er}$ and $\sigma = ${p(s)}$ S/m. Find its capacitance per unit length, the leakage resistance between the conductors of a $${l}$ m length, and the self-discharge time constant.`,
      parts: [N('\\mathcal C', Cp * 1e12, 'pF/m'), N(`R\\ (${l}\\ \\text{m})`, Rl / 1e3, 'kΩ'), N('\\tau', tau * 1e6, 'μs')],
      hints: ['$\\mathcal C = 2\\pi\\epsilon/\\ln(b/a)$ and $\\mathcal G = 2\\pi\\sigma/\\ln(b/a)$.', '$R = 1/(\\mathcal G\\ell)$: a longer coax has more leakage paths in parallel, so less resistance. $\\tau = \\epsilon/\\sigma$.'],
      sol: sol({
        eq: md`$\mathcal C = \dfrac{2\pi\epsilon}{\ln(b/a)}$, $\;\mathcal G = \dfrac{\sigma}{\epsilon}\mathcal C = \dfrac{2\pi\sigma}{\ln(b/a)}$, $\;R = \dfrac{1}{\mathcal G\ell}$, $\;\tau = RC = \dfrac{\epsilon}{\sigma}$.`,
        sym: md`$\ln(b/a) = \ln ${k} = ${f(ln)}$.`,
        sub: md`$$\mathcal C = \frac{2\pi(${er})(8.854\times10^{-12})}{${f(ln)}} = ${f(Cp * 1e12)}\ \text{pF/m}, \qquad \mathcal G = \frac{2\pi(${p(s)})}{${f(ln)}} = ${f(Gp)}\ \text{S/m}$$
$$R = \frac{1}{(${f(Gp)})(${l})} = ${f(Rl)}\ \Omega, \qquad \tau = \frac{(${er})(8.854\times10^{-12})}{${p(s)}} = ${f(tau)}\ \text{s}$$`,
        ans: md`$\mathcal C = ${f(Cp * 1e12)}$ pF/m, $R = ${f(Rl / 1e3)}$ kΩ, $\tau = ${f(tau * 1e6)}$ µs.`,
        check: md`$R\cdot\mathcal C\ell = ${f(Rl * Cp * l)}$ s $= \tau$ ✓: the length and the radii cancel.`,
      }),
    };
  };

  // concentric spheres: C, G (by summing shells), τ, charge left after t
  GENS.t2_sphere = () => {
    const a = pick([2, 5, 10]), k = pick([2, 3, 4]), er = pick([2, 3, 4]), s = pick([1e-7, 1e-6, 1e-5]), Q0 = pick([1, 2, 5]), m = pick([0.5, 1, 2, 3]);
    const A = a / 100, B = a * k / 100, eps = er * e0, gf = A * B / (B - A);
    const Cc = 4 * Math.PI * eps * gf, Gg = 4 * Math.PI * s * gf, tau = eps / s;
    const t = +(m * tau * 1e6).toPrecision(2), Qt = Q0 * Math.exp(-t * 1e-6 / tau);
    return {
      title: 'Leaky spherical capacitor',
      q: md`Metal spheres of radii $a = ${a}$ cm and $b = ${a * k}$ cm share a center. The space between them has $\epsilon_r = ${er}$ and $\sigma = ${p(s)}$ S/m. Find $C$, the conductance $G$ between the spheres, and the time constant. At $t = 0$ the inner sphere holds $+${Q0}$ µC, the outer $-${Q0}$ µC, and nothing is connected. How much charge is left at $t = ${p(t)}$ µs?`,
      parts: [N('C', Cc * 1e12, 'pF'), N('G', Gg * 1e6, 'μS'), N('\\tau', tau * 1e6, 'μs'), N(`Q(${p(t)}\\ \\mu\\text{s})`, Qt, 'μC')],
      hints: ['Sum thin shells in series: $dR = dr/(\\sigma\\,4\\pi r^2)$ from $a$ to $b$.', 'Isolated, the capacitor discharges through its own $G$: $Q(t) = Q_0e^{-t/\\tau}$ with $\\tau = C/G = \\epsilon/\\sigma$.'],
      sol: sol({
        eq: md`$C = 4\pi\epsilon\dfrac{ab}{b - a}$; $\;R = \displaystyle\int_a^b\frac{dr}{\sigma 4\pi r^2} = \frac{1}{4\pi\sigma}\Big(\frac1a - \frac1b\Big)$; $\;Q(t) = Q_0e^{-t/\tau}$.`,
        sym: md`$G = 1/R = 4\pi\sigma\dfrac{ab}{b - a}$, so $G/C = \sigma/\epsilon$ and $\tau = C/G = \epsilon/\sigma$.`,
        sub: md`$$\frac{ab}{b - a} = \frac{(${A})(${B})}{${q3(B - A)}} = ${f(gf)}\ \text{m}, \qquad C = 4\pi(${er})(8.854\times10^{-12})(${f(gf)}) = ${f(Cc * 1e12)}\ \text{pF}$$
$$G = 4\pi(${p(s)})(${f(gf)}) = ${f(Gg * 1e6)}\ \mu\text{S}, \qquad \tau = \frac{${er}(8.854\times10^{-12})}{${p(s)}} = ${f(tau * 1e6)}\ \mu\text{s}, \qquad Q = ${Q0}e^{-${p(t)}/${f(tau * 1e6)}} = ${f(Qt)}\ \mu\text{C}$$`,
        ans: md`$C = ${f(Cc * 1e12)}$ pF, $G = ${f(Gg * 1e6)}$ µS, $\tau = ${f(tau * 1e6)}$ µs, $Q = ${f(Qt)}$ µC.`,
        check: md`$C/G = ${f(Cc / Gg * 1e6)}$ µs $= \epsilon/\sigma$ ✓. Where does the charge go? Radially through the filling to the outer sphere, which held $-${Q0}$ µC: both go to zero together.`,
      }),
    };
  };

  // Summer 2019 #1: a lossy coax behind a source resistance
  GENS.t2_circuit = () => {
    const Gp = pick([1, 2, 5, 10]), s = pick([1e-6, 2e-6, 5e-6]), er = pick([2, 3, 4]), l = pick([0.5, 1, 2]), Vs = pick([5, 10, 12, 20]), Rs = pick([0.1, 0.5, 1, 2]);
    const eps = er * e0, Cp = eps / s * Gp * 1e-6, Rr = 1 / (Gp * 1e-6 * l), Cc = Cp * l, RsO = Rs * 1e6;
    const Vc = Vs * Rr / (Rr + RsO), toff = Rr * Cc, ton = (Rr * RsO / (Rr + RsO)) * Cc;
    return {
      title: 'Lossy coax in a circuit',
      q: md`A dielectric-filled coax has leakage conductance $\mathcal G = ${Gp}$ µS/m; its filling has $\sigma = ${p(s)}$ S/m and $\epsilon = ${er}\epsilon_0$. A $${l}$ m length is connected across a $${Vs}$ V DC source with internal resistance $R_s = ${p(RsO)}\ \Omega$. Find $\mathcal C$, the steady capacitor voltage $V_c$, the time constant with which it charged when first connected, and the time after disconnection at which $V_c$ falls to $V_c(0)/e$.`,
      parts: [N('\\mathcal C', Cp * 1e12, 'pF/m'), N('V_c', Vc, 'V'), N('\\tau_{\\text{charge}}', ton * 1e6, 'μs'), N('t_1', toff * 1e6, 'μs')],
      hints: ['One filling: $\\mathcal C = (\\epsilon/\\sigma)\\mathcal G$. The leakage resistance is $R = 1/(\\mathcal G\\ell)$.', 'Steady DC: the capacitor is open, so $R$ and $R_s$ divide $V_s$. Charging: $C$ sees $R\\parallel R_s$. Disconnected: only $R$.'],
      sol: sol({
        eq: md`$\mathcal C = \dfrac{\epsilon}{\sigma}\mathcal G$; $\;R = \dfrac{1}{\mathcal G\ell}$; $\;V_c = V_s\dfrac{R}{R + R_s}$; $\;\tau_{\text{charge}} = (R\parallel R_s)C$; $\;t_1 = RC = \epsilon/\sigma$.`,
        sym: md`$C = \mathcal C\ell$; the source resistance only matters while connected.`,
        sub: md`$$\mathcal C = \frac{${er}(8.854\times10^{-12})}{${p(s)}}(${Gp}\times10^{-6}) = ${f(Cp * 1e12)}\ \text{pF/m}, \qquad R = \frac{1}{(${Gp}\times10^{-6})(${l})} = ${f(Rr)}\ \Omega$$
$$V_c = ${Vs}\cdot\frac{${f(Rr)}}{${f(Rr)} + ${f(RsO)}} = ${f(Vc)}\ \text{V}, \qquad \tau_{\text{charge}} = (${f(Rr)}\parallel${f(RsO)})(${f(Cc)}) = ${f(ton * 1e6)}\ \mu\text{s}, \qquad t_1 = (${f(Rr)})(${f(Cc)}) = ${f(toff * 1e6)}\ \mu\text{s}$$`,
        ans: md`$\mathcal C = ${f(Cp * 1e12)}$ pF/m, $V_c = ${f(Vc)}$ V, $\tau_{\text{charge}} = ${f(ton * 1e6)}$ µs, $t_1 = ${f(toff * 1e6)}$ µs.`,
        check: md`$t_1 = \epsilon/\sigma = ${f(eps / s * 1e6)}$ µs, independent of the length ✓; charging is faster than the self-discharge ✓.`,
      }),
    };
  };

  // HW 7 #1: measure ε from the change in an RC time constant
  GENS.t2_measure = () => {
    const [frac, k] = pick([[1, 20], [1, 50], [1, 150], [1, 300], [0.5, 20], [0.5, 50], [0.5, 60], [0.5, 80], [0.25, 20], [0.25, 25]]);
    const r = 1 + k / 100, er = frac === 1 ? r : frac / (1 / r - (1 - frac));
    const C0 = pick([10, 22, 47, 100]);
    const what = frac === 1 ? 'exactly fills the gap' : frac === 0.5 ? 'is half as thick as the gap (it lies flat on one plate, leaving air above it)' : 'is a quarter as thick as the gap (lying flat on one plate)';
    return {
      title: 'Measuring ε with an RC circuit',
      q: md`An air-filled parallel-plate capacitor, $C_0 = ${C0}$ pF, discharges through a fixed external resistor. A slab of unknown $\epsilon$ is inserted; it ${what}. The time constant grows by ${k}%. Find the new capacitance and $\epsilon_r$ of the slab.`,
      parts: [N('C', C0 * r, 'pF'), N('\\epsilon_r', er, ''),
        { lbl: 'Why does $\\tau$ measure $C$?', mc: ['$\\tau = RC$ with $R$ fixed', '$\\tau = \\epsilon/\\sigma$ of the slab', '$\\tau$ depends only on the gap', 'the slab adds resistance in series'], a: 0, why: [null, 'That is the self-discharge time of a lossy filling; here the external resistor sets the discharge.', 'Then the slab would not change it.', 'The slab is an insulator; it changes $C$, not $R$.'] }],
      hints: ['$\\tau = RC$ with the same $R$, so $C/C_0 = \\tau/\\tau_0$.', frac === 1 ? 'A full slab multiplies $C$ by $\\epsilon_r$.' : `Series: $\\dfrac{C_0}{C} = ${frac}\\cdot\\dfrac{1}{\\epsilon_r} + ${1 - frac}$.`],
      sol: sol({
        eq: md`$\tau = RC$ with $R$ fixed: $C/C_0 = ${q3(r)}$. ${frac === 1 ? '$C = \\epsilon_rC_0$.' : `Slab and air in series: $\\dfrac{C_0}{C} = \\dfrac{${frac}}{\\epsilon_r} + ${1 - frac}$.`}`,
        sym: md`${frac === 1 ? '$\\epsilon_r = C/C_0$.' : `$\\epsilon_r = \\dfrac{${frac}}{C_0/C - ${1 - frac}}$.`}`,
        sub: md`$C = ${q3(r)}(${C0}\ \text{pF}) = ${f(C0 * r)}$ pF. ${frac === 1 ? `$\\epsilon_r = ${f(er)}$.` : `$$\\epsilon_r = \\frac{${frac}}{1/${q3(r)} - ${1 - frac}} = \\frac{${frac}}{${f(1 / r - (1 - frac))}} = ${f(er)}$$`}`,
        ans: md`$C = ${f(C0 * r)}$ pF; $\epsilon = ${f(er)}\epsilon_0$.`,
        check: frac === 1 ? 'A full slab: $\\epsilon_r$ is just the ratio of time constants.' : md`A thinner slab needs a larger $\epsilon_r$ for the same change; even $\epsilon_r \to \infty$ only gives $C = C_0/${1 - frac}$, a ${p(q3((1 / (1 - frac) - 1) * 100))}% increase.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t2-capacitance'] = [
    Q(md`Capacitance depends on…`,
      ['the geometry and $\\epsilon$ only', 'the charge on the plates', 'the voltage across it', 'the conductivity of the filling'], 0,
      [null, '$Q$ cancels in $Q/V$.', '$V$ is proportional to $Q$; their ratio is fixed.', '$\\sigma$ sets the leakage conductance, not $C$.'],
      md`$V \propto Q$, so $C = Q/V$ is a property of shape and material.`),
    Q(md`One farad equals…`,
      ['1 C/V', '1 V/C', '1 C·V', '1 A/V'], 0,
      [null, 'Inverted.', 'C·V is a joule.', 'A/V is a siemens.'],
      md`$C = Q/V$: coulombs per volt.`),
    Q(md`A coax has $\mathcal C = 2\pi\epsilon/\ln(b/a)$. If $b/a = e$ and the filling is air, $\mathcal C$ is about…`,
      ['55.6 pF/m', '8.85 pF/m', '111 pF/m', '27.8 pF/m'], 0,
      [null, 'That is $\\epsilon_0$ alone; the factor $2\\pi$ is missing.', 'That is $4\\pi\\epsilon_0$.', 'That uses $\\pi\\epsilon_0$.'],
      md`$\ln e = 1$, so $\mathcal C = 2\pi\epsilon_0 = 55.6$ pF/m.`),
    Q(md`The resistance between two concentric spheres ($a < b$) filled with conductivity $\sigma$ is found by…`,
      ['adding $dR = dr/(\\sigma4\\pi r^2)$ from $a$ to $b$', 'using $R = \\ell/(\\sigma A)$ with $A = 4\\pi a^2$', 'using $R = \\ell/(\\sigma A)$ with $A = 4\\pi b^2$', 'adding thin shells in parallel'], 0,
      [null, 'The area grows with $r$; one area does not describe the whole path.', 'The area grows with $r$; one area does not describe the whole path.', 'The current crosses one shell after another: series.'],
      md`$R = \dfrac{1}{4\pi\sigma}\Big(\dfrac1a - \dfrac1b\Big)$. Most of it sits near the small inner sphere.`),
    Q(md`For an isolated sphere of radius $a$ in a medium of conductivity $\sigma$, the resistance to infinity is…`,
      ['$1/(4\\pi\\sigma a)$', 'infinite', '$a/(4\\pi\\sigma)$', '$1/(4\\pi\\sigma a^2)$'], 0,
      [null, 'The shells far away are huge and add almost nothing: $\\int^\\infty dr/r^2$ converges.', 'Units: $a/\\sigma$ is Ω·m², not Ω.', 'Units: $1/(\\sigma a^2)$ is Ω/m, not Ω.'],
      md`$b \to \infty$ in $\dfrac{1}{4\pi\sigma}\Big(\dfrac1a - \dfrac1b\Big)$. Grounding rods work because of this.`),
    Q(md`$G/C = \sigma/\epsilon$ holds when…`,
      ['one uniform material fills the space between the conductors', 'the conductors are parallel plates', 'the filling is layered', 'always'], 0,
      [null, 'Any shape works, as long as one material fills it.', 'Layers give different ratios for $C$ and $G$.', 'Not for layered fillings.'],
      md`The derivation uses $\oint\sigma\mathbf E\cdot d\mathbf S = (\sigma/\epsilon)Q$, which needs the same $\sigma/\epsilon$ everywhere.`),
    Q(md`A lossy capacitor, alone, is modeled as…`,
      ['$C$ in parallel with $R$', '$C$ in series with $R$', '$R$ alone', '$C$ alone'], 0,
      [null, 'In series, no DC could flow; leakage is DC current between the plates.', 'It still stores charge.', 'It also leaks.'],
      md`The displacement path ($C$) and the conduction path ($R$) connect the same two conductors: parallel.`),
    Q(md`Two capacitors with identical fillings but different shapes have $C_1 = 10C_2$. Their self-discharge times satisfy…`,
      ['$\\tau_1 = \\tau_2$', '$\\tau_1 = 10\\tau_2$', '$\\tau_1 = \\tau_2/10$', '$\\tau_1 = 100\\tau_2$'], 0,
      [null, '$G_1 = 10G_2$ as well.', 'Inverted, and still wrong: the ratio is 1.', 'Geometry cancels.'],
      md`$\tau = \epsilon/\sigma$ depends only on the material.`),
    Q(md`Energy stored in a capacitor is…`,
      ['$\\tfrac12CV^2 = Q^2/2C$', '$CV^2$', '$\\tfrac12QV^2$', '$Q/2C$'], 0,
      [null, 'Missing ½: the voltage grows from 0 to $V$ while charging.', 'Units: C·V² is not J.', 'Units: that is volts.'],
      md`$U = \int_0^QV\,dq = Q^2/2C$, equal to $\int\tfrac12\epsilon E^2dV$ over the field.`),
    Q(md`A 10 µF lossy capacitor has a leakage of 100 MΩ. Its self-discharge time is…`,
      ['1000 s', '10 s', '0.1 s', '$10^{-13}$ s'], 0,
      [null, '$10^{-5}\\times10^8 = 10^3$.', 'Off by $10^4$.', 'That divides $C$ by $R$ instead of multiplying.'],
      md`$\tau = RC = (10^8)(10^{-5}) = 10^3$ s, about 17 minutes.`),
    Q(md`In steady state at DC, the current through the capacitance part of a lossy capacitor is…`,
      ['zero', 'equal to the leakage current', '$V_s/R_s$', 'growing linearly'], 0,
      [null, 'The leakage current flows through $R$; $C$ carries $C\\,dV/dt = 0$.', 'That is the current with the capacitor shorted.', 'Nothing changes in steady state.'],
      md`$I_C = C\,dV_c/dt = 0$ when $V_c$ is constant.`),
    Q(md`A coax has capacitance $\mathcal C$ and leakage conductance $\mathcal G$ per unit length. The total capacitance of a length $\ell$ and its total leakage resistance are…`,
      ['$\\mathcal C\\ell$ and $1/(\\mathcal G\\ell)$', '$\\mathcal C\\ell$ and $\\ell/\\mathcal G$', '$\\mathcal C/\\ell$ and $\\mathcal G\\ell$', '$\\mathcal C\\ell$ and $\\mathcal G\\ell$'], 0,
      [null, 'Leakage paths along the length are in parallel: $G$ adds, $R$ shrinks.', 'Longer means more capacitance, not less.', '$\\mathcal G\\ell$ is the conductance, in S.'],
      md`Each meter is a capacitor and a conductance in parallel with the rest: $C$ and $G$ add with length.`),
    Q(md`A parallel-plate capacitor has $C = \epsilon A/d$ only when…`,
      ['$d$ is much smaller than the plate size (fringing ignored)', 'the plates are square', 'the plates are grounded', '$\\epsilon = \\epsilon_0$'], 0,
      [null, 'Any shape works if the gap is small.', 'Grounding sets a reference, not $C$.', 'Any uniform filling works.'],
      md`The uniform-field picture fails near the edges; it is good when the gap is small compared with the plates.`),
    Q(md`HW 4 #4: a metal sphere ($a = 1$ m) in an infinite medium with $\epsilon = 2\epsilon_0$, $\sigma = 2\times10^{-6}$ S/m. Its capacitance is about…`,
      ['223 pF', '111 pF', '25 µS', '8.85 µs'], 0,
      [null, 'That is in air; $\\epsilon = 2\\epsilon_0$ doubles it.', 'That is its conductance, $4\\pi\\sigma a$.', 'That is its time constant, $\\epsilon/\\sigma$.'],
      md`$C = 4\pi\epsilon a = 4\pi(2)(8.854\times10^{-12})(1) = 2.23\times10^{-10}$ F.`),
    Q(md`A charged lossy capacitor is left alone for $3\tau$. The fraction of its initial stored energy left is…`,
      ['$e^{-6} \\approx 0.25\\%$', '$e^{-3} \\approx 5\\%$', '$e^{-1.5} \\approx 22\\%$', '$0$'], 0,
      [null, 'That is the charge (or voltage). Energy goes as $V^2$.', 'Energy decays faster than $V$, not slower.', 'Exponential decay never reaches exactly zero.'],
      md`$U \propto V^2 \propto e^{-2t/\tau}$: at $3\tau$, $e^{-6}$.`),
    Q(md`Where does the leakage current flow in a lossy coax?`,
      ['radially, from the inner to the outer conductor', 'along the inner conductor', 'around the circumference', 'along the outer conductor only'], 0,
      [null, 'That is the signal current; leakage crosses the filling.', '$\\mathbf E$ is radial, and so is $\\mathbf J = \\sigma\\mathbf E$.', 'Leakage crosses the filling between the two conductors.'],
      md`$\mathbf J = \sigma\mathbf E$ follows $\mathbf E$, which is radial.`),
    Q(md`A parallel-plate capacitor holds two side-by-side fillings ($\epsilon_1$ on area $A_1$, $\epsilon_2$ on $A_2$). The field in each half is…`,
      ['the same, $V/d$', 'larger in the low-$\\epsilon$ half', 'larger in the high-$\\epsilon$ half', 'zero in one half'], 0,
      [null, 'That is the stacked case. Side by side, each half spans the same $V$ over the same $d$.', 'That is the stacked case reversed.', 'Neither filling conducts.'],
      md`Tangential $E$ is continuous across the vertical interface, and each half has $V = Ed$. The charge density differs: $\rho_s = \epsilon_iV/d$.`),
  ];
})();

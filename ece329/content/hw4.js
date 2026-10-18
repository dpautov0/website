/* HW 4 (Fall 2026): two dielectric slabs between plates, a charge sheet between grounded plates, a given two-layer
   field, leaky spherical shells, a fluid that becomes conducting, and a coax of mixed materials. Every problem as
   assigned, blank, with answer boxes wherever there is a number or a choice, and full worked solutions. There is no
   official key: every answer was solved and checked independently. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const e0 = EM.eps0;
  const N = (lbl, ans, unit, rel = 0.02) => ({ lbl, ans, unit, tol: { rel } });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // options shuffled
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // natural order kept

  // ---------------------------------------------------------------- figures
  // parallel plates with layers (bottom to top): [{h, lab, shade}]; labels for the plates and each boundary's z
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
    return g.svg();
  }

  // HW 4 #6: the coax's five regions along r (conductors hatched, dielectrics shaded)
  function coaxStrip() {
    const g = PF.fig({ alt: 'the coax regions along the radius: a conducting core out to a, a dielectric of 10 epsilon_0 to b, a conducting sheath from b to c, a dielectric of 2 epsilon_0 from c to d, and free space beyond d' });
    const X = { 0: 20, a: 62, b: 132, c: 164, d: 236, end: 296 }, y0 = 40, y1 = 72;
    g.hatchBand([[X[0], y0], [X.a, y0], [X.a, y1], [X[0], y1]]);
    g.hatchBand([[X.b, y0], [X.c, y0], [X.c, y1], [X.b, y1]]);
    g.rect(X.a, y0, X.b - X.a, y1 - y0, { cls: 'shade nodecl' });
    g.rect(X.c, y0, X.d - X.c, y1 - y0, { cls: 'shade nodecl' });
    g.line(X[0], y0, X.end, y0, { cls: 'dim' });
    for (const k of ['a', 'b', 'c', 'd']) { g.line(X[k], y0, X[k], y1 + 5); g.label(X[k], y1 + 8, k, 't', 'small'); }
    g.line(X[0], y0, X[0], y1);
    g.arrow(X[0], y1, X.end + 14, y1, { cls: 'dim', hs: 6 });
    g.label(X.end + 18, y1, 'r', 'l', 'small');
    g.label((X[0] + X.a) / 2, y0 - 6, '+2\\ \\text{C/m}', 'b', 'small');
    g.label((X.b + X.c) / 2, y0 - 6, '-4\\ \\text{C/m}', 'b', 'small');
    g.label((X.a + X.b) / 2, (y0 + y1) / 2, '10\\epsilon_0', 'c', 'small');
    g.label((X.c + X.d) / 2, (y0 + y1) / 2, '2\\epsilon_0', 'c', 'small');
    g.label((X.d + X.end) / 2, (y0 + y1) / 2, '\\epsilon_0', 'c', 'small');
    return g.svg();
  }

  const fig1 = { svg: platesFig({ alt: 'plates at z = 0 (V = 0) and z = z0 (V = Vp), slab epsilon_1 below z = d and epsilon_2 above', layers: [{ h: 42, lab: '\\epsilon_1', shade: true }, { h: 78, lab: '\\epsilon_2' }], bot: 'V = 0', top: 'V_p', z: ['z = 0', 'z = d', 'z = z_0'] }), cap: 'Problem 1: region 1 (ε₁) below z = d, region 2 (ε₂) above.' };
  const fig2 = { svg: platesFig({ alt: 'grounded plates at z = 0 and z = 5 m with a charged sheet at z = 2 m; epsilon_0 below the sheet and 2 epsilon_0 above', layers: [{ h: 48, lab: '\\epsilon_0' }, { h: 72, lab: '2\\epsilon_0', shade: true }], sheetAt: 1, bot: 'V = 0', top: 'V = 0', z: ['z = 0', 'z = 2\\ \\text{m}:\\ 6\\epsilon_0\\ \\text{C/m}^2', 'z = 5\\ \\text{m}'] }), cap: 'Problem 2: both plates grounded; the dashed line is the charged sheet.' };
  const fig3 = { svg: platesFig({ alt: 'plates at z = 0 (V0) and z = z0 (grounded), slab epsilon_1 up to z = d = 4 m and epsilon_2 above', layers: [{ h: 80, lab: '\\epsilon_1', shade: true }, { h: 34, lab: '\\epsilon_2' }], bot: 'V_0', top: 'V = 0', z: ['z = 0', 'z = d = 4\\ \\text{m}', 'z = z_0'] }), cap: 'Problem 3: the bottom plate is at V₀, the top plate grounded.' };
  const fig5 = { svg: platesFig({ alt: 'copper plates at z = 0 (positive) and z = W (negative) with a vacuum gap that is later filled with a fluid', layers: [{ h: 60, lab: '\\epsilon_0\\ \\to\\ 81\\epsilon_0' }], bot: '+\\rho_s', top: '-\\rho_s', z: ['z = 0', 'z = W'] }), cap: 'Problem 5: E = 3ẑ V/m in the vacuum gap, so the bottom plate is the positive one.' };
  const fig6 = { svg: coaxStrip(), cap: 'Problem 6, along any radius: core and sheath (hatched) conduct; the shaded shells are perfect dielectrics.' };

  // ---------------------------------------------------------------- numbers (checked in Python)
  const rs1 = 15 * e0;                              // 1(c)
  const V2 = 36 / 7, r20 = -18 / 7 * e0, r25 = -24 / 7 * e0;   // 2
  const C4 = 4 * Math.PI * 2 * e0, G4 = 4 * Math.PI * 2e-6, tau4 = 2 * e0 / 2e-6;   // 4(b), (c), (e)
  const D5 = 3 * e0, E5c = 3 / 81, P5c = 3 * e0 * 80 / 81, tau5 = 81 * e0 / 4;   // 5
  const PI = Math.PI;

  const steps = [
    R(md`**Homework 4** · reading: Kudeki, Lectures 9–12. Six problems: dielectric layers between plates, boundary conditions, a coax of mixed materials, capacitance and conductance of spherical shells, and what conduction does to a capacitor. The tools are [Topic 1](#/l/t1-dielectrics), [Topic 2](#/l/t2-capacitance) and [Topic 3](#/l/t3-relaxation).

There is no official key; every answer below was solved and checked independently. Work each part on paper first, with units, the way you would hand it in. Then enter your answers and open the solution to compare your reasoning.`),

    // ================================================================ Problem 1
    RF(md`### Problem 1 · Two dielectric slabs between charged plates

Two infinite, parallel, perfectly conducting plates at $z = 0$ and $z = z_0 > 0$ hold equal and opposite surface charge densities and are kept at potentials $V = 0$ and $V = V_p > 0$. The region between them is filled with two slabs of perfect dielectric: permittivity $\epsilon_1$ for $0 < z < d$ (region 1) and $\epsilon_2$ for $d < z < z_0$ (region 2).

[[fig:f1]]`, { f1: fig1 }),
    P({ src: 'HW 4 #1(a)', title: 'Laplace in two layers',
      q: md`(a) Find the general solution for the potential $V(z)$ in the two regions (in terms of $V_p$, $d$, $z_0$, $\epsilon_1$, $\epsilon_2$) by solving Laplace's equation piecewise and enforcing the continuity of $V(z)$ at $z = d$. Hint: you will also need the fact that no surface charge accumulates at a boundary between two perfect dielectrics.`,
      parts: [MC('$V(z)$ in region 1 ($0 < z < d$) is', [md`$\dfrac{\epsilon_2V_pz}{\epsilon_2d + \epsilon_1(z_0 - d)}$`, md`$\dfrac{\epsilon_1V_pz}{\epsilon_1d + \epsilon_2(z_0 - d)}$`, md`$\dfrac{V_pz}{z_0}$`, md`$\dfrac{\epsilon_2V_pz}{\epsilon_1d + \epsilon_2(z_0 - d)}$`], 0,
        [null, 'That swaps $\\epsilon_1$ and $\\epsilon_2$: the higher-$\\epsilon$ layer must have the gentler slope.', 'That ignores the dielectrics; it holds only if $\\epsilon_1 = \\epsilon_2$.', 'With this slope, $V(z_0) \\ne V_p$ unless $\\epsilon_1 = \\epsilon_2$: in the denominator each thickness must carry the other layer\'s $\\epsilon$ ($\\epsilon_2d$, $\\epsilon_1(z_0 - d)$).'])],
      hints: ['No free charge inside the slabs: $d^2V/dz^2 = 0$, so $V$ is linear in each region: $V_1 = A_1z + B_1$, $V_2 = A_2z + B_2$.', 'Four conditions: $V_1(0) = 0$, $V_2(z_0) = V_p$, $V_1(d) = V_2(d)$, and $D_z$ continuous at $z = d$: $\\epsilon_1A_1 = \\epsilon_2A_2$.'],
      sol: md`In each slab there is no free charge, so Laplace's equation holds: $d^2V/dz^2 = 0$ and $V$ is linear,
$$V_1 = A_1z + B_1\ (0 < z < d), \qquad V_2 = A_2z + B_2\ (d < z < z_0)$$
**Conditions.** $V_1(0) = 0 \Rightarrow B_1 = 0$. $V_2(z_0) = V_p$. Continuity at $z = d$: $A_1d = A_2d + B_2$. No free surface charge at $z = d$, so $D_z$ is continuous; with $E_z = -dV/dz$ that is $\epsilon_1A_1 = \epsilon_2A_2$.

**Solve.** Write $V_2 = V_p + A_2(z - z_0)$ and use $A_2 = (\epsilon_1/\epsilon_2)A_1$ in the continuity condition: $A_1d = V_p - (\epsilon_1/\epsilon_2)A_1(z_0 - d)$, so
$$A_1 = \frac{\epsilon_2V_p}{\epsilon_2d + \epsilon_1(z_0 - d)}, \qquad A_2 = \frac{\epsilon_1V_p}{\epsilon_2d + \epsilon_1(z_0 - d)}$$
$$V(z) = \begin{cases}\dfrac{\epsilon_2V_p\,z}{\epsilon_2d + \epsilon_1(z_0 - d)}, & 0 < z < d\\[2ex] V_p\,\dfrac{\epsilon_2d + \epsilon_1(z - d)}{\epsilon_2d + \epsilon_1(z_0 - d)}, & d < z < z_0\end{cases}$$
**Check.** Both pieces give $\epsilon_2V_pd/(\epsilon_2d + \epsilon_1(z_0 - d))$ at $z = d$ ✓, and $V(z_0) = V_p$ ✓. The slopes satisfy $A_1/A_2 = \epsilon_2/\epsilon_1$: the field is weaker in the higher-$\epsilon$ layer. With $\epsilon_1 = \epsilon_2$ this reduces to $V_pz/z_0$ ✓.` }),
    P({ src: 'HW 4 #1(b)–(c)', title: 'Numbers',
      q: md`(b) Given $z_0 = 4d = 2$ m, $\epsilon_1 = 3\epsilon_0$, $\epsilon_2 = \epsilon_0$ and $\mathbf E(0 < z < d) = -5\hat z$ V/m, what is the potential $V_p$ of the plate at $z = z_0$?

(c) With the same parameters, what is the surface charge density $\rho_s$ on the plate at $z = z_0$?`,
      parts: [N('V_p', 25, 'V'), N('\\rho_s(z_0)', rs1, 'C/m^2')],
      hints: ['$\\mathbf E = -\\nabla V = -A_1\\hat z$ in region 1, so $A_1 = 5$ V/m. Then $E_{2z} = (\\epsilon_1/\\epsilon_2)E_{1z}$.', 'At the top plate the normal points out of the conductor, into region 2: $\\hat n = -\\hat z$, and $\\rho_s = \\hat n\\cdot\\mathbf D_2$.'],
      sol: md`(b) $d = 0.5$ m and $z_0 = 2$ m. In region 1, $\mathbf E = -A_1\hat z = -5\hat z$ V/m, so $A_1 = 5$ V/m. $D_z$ is continuous: $E_{2z} = (\epsilon_1/\epsilon_2)E_{1z} = 3(-5) = -15$ V/m. Then
$$V_p = |E_1|d + |E_2|(z_0 - d) = (5\ \text{V/m})(0.5\ \text{m}) + (15\ \text{V/m})(1.5\ \text{m}) = 2.5 + 22.5 = 25\ \text{V}$$
(the same as $A_1[d + (\epsilon_1/\epsilon_2)(z_0 - d)] = 5(0.5 + 4.5)$ from part (a)).

(c) $\mathbf D_2 = \epsilon_2\mathbf E_2 = -15\epsilon_0\hat z$ C/m². The plate at $z_0$ sits on top of region 2; its outward normal (into the field region) is $\hat n = -\hat z$:
$$\rho_s = \hat n\cdot\mathbf D_2 = (-\hat z)\cdot(-15\epsilon_0\hat z) = 15\epsilon_0 = 1.33\times10^{-10}\ \text{C/m}^2$$
Positive, as it must be on the higher-potential plate. The bottom plate has $\rho_s = \hat z\cdot\mathbf D_1 = 3\epsilon_0(-5) = -15\epsilon_0$: equal and opposite ✓.` }),

    // ================================================================ Problem 2
    P({ src: 'HW 4 #2', title: 'A charge sheet between grounded plates',
      q: md`Conducting plates lie on $z = 0$ and $z = 5$ m; both are grounded ($V = 0$). Between them, on the surface $z = 2$ m, is a uniform static surface charge of $6\epsilon_0$ C/m². The permittivity is $\epsilon_0$ for $z < 2$ m and $2\epsilon_0$ for $z > 2$ m. Determine the surface charge densities on the plates at $z = 0$ and $z = 5$ m.

Hint: let $V_o$ be the potential at $z = 2$ m. Express $\mathbf E$ and $\mathbf D$ above and below $z = 2$ m in terms of $V_o$, and use the boundary conditions on $z = 0$, 2 and 5 m to relate $V_o$ to the surface charge densities.

[[fig:f2]]`,
      figs: { f2: fig2 },
      parts: [N('V_o', V2, 'V'), N('\\rho_s(0)', r20, 'C/m^2'), N('\\rho_s(5\\ \\text{m})', r25, 'C/m^2')],
      hints: ['No volume charge between the plates, so $V$ is linear on each side of the sheet: $V = V_oz/2$ below, $V = V_o(5 - z)/3$ above.', 'At $z = 2$: $D_z^+ - D_z^- = 6\\epsilon_0$. At each plate, $\\rho_s = \\hat n\\cdot\\mathbf D$ with $\\hat n$ pointing out of the plate into the gap.'],
      sol: md`**Fields in terms of $V_o$.** With no volume charge, $V$ is linear in each region and vanishes at both plates:
$$V = \frac{V_oz}{2}\ (0 < z < 2), \qquad V = \frac{V_o(5 - z)}{3}\ (2 < z < 5)$$
$$\mathbf E_1 = -\frac{V_o}{2}\hat z,\ \ \mathbf D_1 = -\frac{\epsilon_0V_o}{2}\hat z; \qquad \mathbf E_2 = +\frac{V_o}{3}\hat z,\ \ \mathbf D_2 = +\frac{2\epsilon_0V_o}{3}\hat z$$
The field points away from the positive sheet on both sides ✓.

**Sheet at $z = 2$** ($\hat n = \hat z$ from region 1 to region 2):
$$D_{2z} - D_{1z} = \Big(\frac23 + \frac12\Big)\epsilon_0V_o = 6\epsilon_0 \;\Rightarrow\; V_o = \frac{36}{7}\ \text{V} = 5.14\ \text{V}$$
**Plates.** At $z = 0$, $\hat n = +\hat z$: $\rho_s = D_{1z} = -\dfrac{\epsilon_0V_o}{2} = -\dfrac{18}{7}\epsilon_0 = -2.28\times10^{-11}$ C/m². At $z = 5$ m, $\hat n = -\hat z$: $\rho_s = -D_{2z} = -\dfrac{2\epsilon_0V_o}{3} = -\dfrac{24}{7}\epsilon_0 = -3.04\times10^{-11}$ C/m².

**Check.** $-\tfrac{18}{7} - \tfrac{24}{7} = -6$: the plates hold exactly the opposite of the sheet's $6\epsilon_0$, as Gauss's law around the whole stack requires (no field outside grounded plates) ✓. The far plate gets more, because each side's share goes as $\epsilon_i/d_i$: $\tfrac{1}{2}$ versus $\tfrac{2}{3}$, a 3 : 4 split.` }),

    // ================================================================ Problem 3
    RF(md`### Problem 3 · A given two-layer field

The region between two infinite, parallel, perfectly conducting plates at $z = 0$ and $z = z_0$ m is filled with two perfect dielectric slabs: $\epsilon_1$ for $0 < z < d$ m (region 1) and $\epsilon_2$ for $d < z < z_0$ (region 2), with $d = 4$ m. The bottom plate is held at constant potential $V_0$; the top plate is grounded. The electrostatic field exists only between the plates and is
$$\mathbf E(z) = \begin{cases}\dfrac{4\epsilon_2}{\epsilon_1 + 8\epsilon_2}\hat z\ \text{V/m}, & 0 < z < d\\[2ex] \dfrac{4\epsilon_1}{\epsilon_1 + 8\epsilon_2}\hat z\ \text{V/m}, & d < z < z_0\end{cases}$$

[[fig:f3]]`, { f3: fig3 }),
    P({ src: 'HW 4 #3(a)–(b)', title: 'Boundary condition and potential',
      q: md`(a) Verify that this field satisfies Maxwell's boundary condition on $\mathbf D$ at the boundary between the two slabs.

(b) Write $V(z)$ throughout both regions ($0 < z < z_0$) in terms of $\epsilon_1$, $\epsilon_2$, $z_0$, $V_0$ and $d$.`,
      parts: [MC('(a) At $z = d$, $D_z$ is', [md`continuous: $\epsilon_1E_{1z} = \epsilon_2E_{2z} = \dfrac{4\epsilon_1\epsilon_2}{\epsilon_1 + 8\epsilon_2}$, as there is no free surface charge`, md`discontinuous by the bound charge between the slabs`, 'continuous because $\\mathbf E$ is continuous', md`discontinuous: $D_{2z} - D_{1z} = \dfrac{4(\epsilon_1 - \epsilon_2)}{\epsilon_1 + 8\epsilon_2}$`], 0,
          [null, 'The $\\mathbf D$ condition counts free charge only; bound charge makes $E_n$ jump, not $D_n$.', '$\\mathbf E$ is not continuous here: $E_{1z} \\ne E_{2z}$ when $\\epsilon_1 \\ne \\epsilon_2$.', 'That is the jump in $E_z$, not in $D_z$.']),
        MC('(b) For $d < z < z_0$, $V(z) = $', [md`$\dfrac{4\epsilon_1(z_0 - z)}{\epsilon_1 + 8\epsilon_2}$`, md`$V_0 - \dfrac{4\epsilon_1z}{\epsilon_1 + 8\epsilon_2}$`, md`$\dfrac{4\epsilon_1(z - z_0)}{\epsilon_1 + 8\epsilon_2}$`, md`$\dfrac{4\epsilon_2(z_0 - z)}{\epsilon_1 + 8\epsilon_2}$`], 0,
          [null, 'That uses region 2\'s field all the way from $z = 0$; region 1 has a different field.', 'Sign: $V$ falls along $+\\hat z$ (the direction of $\\mathbf E$), from $V_0$ at the bottom to 0 at the top.', 'That is region 1\'s field.'])],
      hints: ['Between perfect dielectrics there is no free surface charge, so $\\hat n\\cdot(\\mathbf D_2 - \\mathbf D_1) = 0$.', 'Integrate $V(z) = V_0 - \\int_0^zE_z\\,dz$, region by region; the grounded top gives $V(z_0) = 0$.'],
      sol: md`(a) $D_{1z} = \epsilon_1E_{1z} = \dfrac{4\epsilon_1\epsilon_2}{\epsilon_1 + 8\epsilon_2}$ and $D_{2z} = \epsilon_2E_{2z} = \dfrac{4\epsilon_2\epsilon_1}{\epsilon_1 + 8\epsilon_2}$: equal. Between perfect dielectrics there is no free surface charge, so $\hat z\cdot(\mathbf D_2 - \mathbf D_1) = \rho_s = 0$ ✓. There is no tangential $\mathbf E$ to check.

(b) $V(z) = V_0 - \int_0^zE_z\,dz$ with uniform fields:
$$V(z) = V_0 - \frac{4\epsilon_2z}{\epsilon_1 + 8\epsilon_2}, \qquad 0 < z < d$$
$$V(z) = V_0 - \frac{4\epsilon_2d + 4\epsilon_1(z - d)}{\epsilon_1 + 8\epsilon_2}, \qquad d < z < z_0$$
The grounded top plate, $V(z_0) = 0$, ties $V_0$ to $z_0$: $V_0 = \dfrac{4\epsilon_2d + 4\epsilon_1(z_0 - d)}{\epsilon_1 + 8\epsilon_2}$. Using it, region 2 is simply $V(z) = \dfrac{4\epsilon_1(z_0 - z)}{\epsilon_1 + 8\epsilon_2}$. (With $d = 4$ m, $4\epsilon_2d = 16\epsilon_2$.)` }),
    P({ src: 'HW 4 #3(c)–(d)', title: 'Find ε₁, then the thickness',
      q: md`(c) Determine $\epsilon_1$ if $\epsilon_2 = 2\epsilon_0$ and the surface charge density on the bottom plate ($z = 0$) is $\rho_s = 4\epsilon_0$ C/m².

(d) What is the thickness of region 2 in meters if $V_0 = 3$ V? Use the $\epsilon_1$ and $\epsilon_2$ from part (c).`,
      parts: [N('\\epsilon_1/\\epsilon_0', 16, ''), N('z_0 - d', 1, 'm')],
      hints: ['Bottom plate: $\\hat n = +\\hat z$, so $\\rho_s = D_{1z} = \\epsilon_1E_{1z}$.', 'Then $E_1$ and $E_2$ are numbers, and $V_0 = E_1d + E_2(z_0 - d)$.'],
      sol: md`(c) At the bottom plate $\hat n = +\hat z$ (out of the conductor, into region 1):
$$\rho_s = D_{1z} = \frac{4\epsilon_1\epsilon_2}{\epsilon_1 + 8\epsilon_2} = \frac{8\epsilon_0\epsilon_1}{\epsilon_1 + 16\epsilon_0} = 4\epsilon_0 \;\Rightarrow\; 8\epsilon_1 = 4\epsilon_1 + 64\epsilon_0 \;\Rightarrow\; \epsilon_1 = 16\epsilon_0$$
(d) Now $E_1 = \dfrac{4(2)}{16 + 16} = 0.25$ V/m and $E_2 = \dfrac{4(16)}{32} = 2$ V/m. The voltage across the stack:
$$V_0 = E_1d + E_2(z_0 - d) = (0.25)(4) + 2(z_0 - d) = 3\ \text{V} \;\Rightarrow\; z_0 - d = 1\ \text{m}$$
**Check.** $D_1 = 16\epsilon_0(0.25) = 4\epsilon_0$ ✓ and $D_2 = 2\epsilon_0(2) = 4\epsilon_0$ ✓. The thin low-$\epsilon$ layer (1 m) takes 2 of the 3 volts.` }),
    P({ src: 'HW 4 #3(e)–(f)', title: 'Laplace, and the capacitance',
      q: md`(e) Does $V(z)$ from part (b) satisfy Laplace's equation in $0 < z < z_0$? Explain.

(f) Determine the capacitance $C$ of the structure if the plates at $z = 0$ and $z = z_0$ had finite areas $A = W^2$ facing one another ($W \gg z_0$, so fringing is negligible). Express $C$ in terms of $\epsilon_1$, $\epsilon_2$, $d$, $z_0$ and $A$.`,
      parts: [MC('(e) Laplace\'s equation in $0 < z < z_0$:', ['Yes inside each region ($V$ is linear there); at $z = d$ the slope jumps, so only $\\nabla\\cdot(\\epsilon\\nabla V) = 0$ holds across it', 'No: $V$ is not linear anywhere', 'Yes, everywhere including $z = d$, because $V$ is continuous', 'No: the plates carry charge, so $\\nabla^2V = -\\rho/\\epsilon$ with $\\rho \\ne 0$'], 0,
          [null, 'Each region has a uniform $\\mathbf E$, so $V$ is linear in each.', 'Continuity of $V$ is not enough: its slope changes at $z = d$, where bound surface charge sits.', 'The plate charges are on the boundaries, not inside $0 < z < z_0$.']),
        MC('(f) $C = $', [md`$\dfrac{\epsilon_1\epsilon_2A}{\epsilon_2d + \epsilon_1(z_0 - d)}$`, md`$\dfrac{(\epsilon_1 + \epsilon_2)A}{z_0}$`, md`$\dfrac{\epsilon_1A}{d} + \dfrac{\epsilon_2A}{z_0 - d}$`, md`$\dfrac{\epsilon_1\epsilon_2A}{\epsilon_1d + \epsilon_2(z_0 - d)}$`], 0,
          [null, 'That averages the permittivities as if they were side by side.', 'That is the parallel combination; stacked layers are in series.', 'Swapped: each thickness is divided by its own permittivity.']),
        N('C/A\\ \\text{with (c), (d)}', 4 / 3 * e0, 'F/m^2')],
      hints: ['In each region there is no free volume charge and $\\epsilon$ is uniform.', '$C = Q/V_0$ with $Q = \\rho_sA = \\epsilon_1E_1A$ and $V_0 = E_1d + E_2(z_0 - d)$. Equivalently, two capacitors in series.'],
      sol: md`(e) **Yes, region by region.** $\mathbf E$ is uniform in each slab, so $V$ is linear there and $d^2V/dz^2 = 0$: there is no free charge inside either perfect dielectric. At $z = d$ the slope of $V$ jumps (from $-0.25$ to $-2$ V/m with the numbers of (c), (d)): a bound surface charge $\epsilon_0(E_{2z} - E_{1z}) = 1.75\epsilon_0$ C/m² sits there, so $\nabla^2V = 0$ fails on that plane. What holds everywhere is $\nabla\cdot(\epsilon\nabla V) = -\rho_{\text{free}} = 0$.

(f) $Q = \rho_sA = \epsilon_1E_1A$ and $V_0 = E_1d + E_2(z_0 - d) = E_1\big[d + (\epsilon_1/\epsilon_2)(z_0 - d)\big]$:
$$C = \frac{Q}{V_0} = \frac{\epsilon_1A}{d + (\epsilon_1/\epsilon_2)(z_0 - d)} = \frac{\epsilon_1\epsilon_2A}{\epsilon_2d + \epsilon_1(z_0 - d)} = \left(\frac{d}{\epsilon_1A} + \frac{z_0 - d}{\epsilon_2A}\right)^{-1}$$
two capacitors in series. With (c), (d): $C/A = \dfrac{1}{4/16 + 1/2}\epsilon_0 = \tfrac43\epsilon_0 = 1.18\times10^{-11}$ F/m², the same as $\rho_s/V_0 = 4\epsilon_0/3$ ✓.` }),

    // ================================================================ Problem 4
    R(md`### Problem 4 · Leaky spherical shells

Metallic spherical shells of radii $a$ and $b > a$ share a center at the origin. The medium between them has $\epsilon = 2\epsilon_0$ and $\sigma = 2\times10^{-6}$ S/m.`),
    P({ src: 'HW 4 #4(a)–(b)', title: 'Capacitance',
      q: md`(a) Use the integral form of Gauss's law to relate the static field between the shells to the charge $Q$ on the (outer) surface of the inner shell, and integrate the field from $a$ to $b$ to obtain $Q = CV$, where $V$ is the potential drop from the inner to the outer shell and
$$C = 4\pi\epsilon\frac{ab}{b - a}$$
(b) Taking $b \to \infty$, find the capacitance (in pF) of a metallic shell of radius $a = 1$ m embedded in an infinite region of $\epsilon = 2\epsilon_0$ and $\sigma = 2\times10^{-6}$ S/m.`,
      parts: [N('C', C4 * 1e12, 'pF')],
      hints: ['A sphere of radius $r$ between the shells encloses $Q$: $D\\,4\\pi r^2 = Q$.', '$\\dfrac{ab}{b - a} \\to a$ as $b \\to \\infty$.'],
      sol: md`(a) Gauss's law on a sphere of radius $a < r < b$: $\oint\mathbf D\cdot d\mathbf S = D_r4\pi r^2 = Q$, so $\mathbf E = \dfrac{Q}{4\pi\epsilon r^2}\hat r$. The drop from inner to outer shell:
$$V = \int_a^b\frac{Q}{4\pi\epsilon r^2}dr = \frac{Q}{4\pi\epsilon}\Big(\frac1a - \frac1b\Big) = \frac{Q(b - a)}{4\pi\epsilon ab} \;\Rightarrow\; C = \frac QV = 4\pi\epsilon\frac{ab}{b - a}$$
(b) As $b \to \infty$, $ab/(b - a) \to a$:
$$C = 4\pi\epsilon a = 4\pi(2)(8.854\times10^{-12}\ \text{F/m})(1\ \text{m}) = 2.23\times10^{-10}\ \text{F} = 223\ \text{pF}$$` }),
    P({ src: 'HW 4 #4(c)', title: 'Conductance by summing shells',
      q: md`(c) What is the conductance (in µS) of the configuration in (b)? Hint: find the resistance $dR$ of a thin spherical shell of radius $r$ and thickness $dr$. The resistance of the medium between the shells is the sum of the $dR$ from $r = a$ to $r = b$. Check your result against $G = \dfrac{\sigma}{\epsilon}C$.`,
      parts: [N('G', G4 * 1e6, 'μS')],
      hints: ['A thin shell is a short conductor of length $dr$ and area $4\\pi r^2$: $dR = dr/(\\sigma4\\pi r^2)$.', 'The shells are in series (the current crosses each in turn): add them.'],
      sol: md`A shell of radius $r$ and thickness $dr$ is a slab of length $dr$ and area $4\pi r^2$: $dR = \dfrac{dr}{\sigma\,4\pi r^2}$. The current crosses one shell after another, so they add in series:
$$R = \int_a^b\frac{dr}{4\pi\sigma r^2} = \frac{1}{4\pi\sigma}\Big(\frac1a - \frac1b\Big) \;\xrightarrow{\ b\to\infty\ }\; \frac{1}{4\pi\sigma a} = \frac{1}{4\pi(2\times10^{-6})(1)} = 3.98\times10^4\ \Omega$$
$$G = 4\pi\sigma a = 2.51\times10^{-5}\ \text{S} = 25.1\ \mu\text{S}$$
**Check.** $\dfrac{\sigma}{\epsilon}C = \dfrac{2\times10^{-6}}{1.771\times10^{-11}}(2.225\times10^{-10}) = 25.1$ µS ✓.` }),
    P({ src: 'HW 4 #4(d)–(e)', title: 'The RC model and the discharge',
      q: md`(d) Develop an RC equivalent circuit for this system and use it to derive a differential equation for the charge on the spherical shell. Hint: the lossy capacitor (Lecture 10, page 4) conducts no external current: the external circuit is an effective open, with no path for a return current.

(e) Assume $Q = 1$ C on the shell of radius $a$ at $t = 0$. Its radial field drives a radial current that discharges the shell. Solve the equation from (d) for $Q(t)$, $t > 0$.`,
      parts: [MC('(d) The charge obeys', [md`$\dfrac{dQ}{dt} + \dfrac{\sigma}{\epsilon}Q = 0$`, md`$\dfrac{dQ}{dt} - \dfrac{\sigma}{\epsilon}Q = 0$`, md`$\dfrac{dQ}{dt} + \dfrac{\epsilon}{\sigma}Q = 0$`, md`$\dfrac{d^2Q}{dt^2} + \dfrac{\sigma}{\epsilon}Q = 0$`], 0,
          [null, 'That makes the charge grow: the leakage removes it.', 'Units: $\\epsilon/\\sigma$ is a time, not a rate.', 'One energy store (no inductance): first order.']),
        N('\\tau', tau4 * 1e6, 'μs')],
      hints: ['Model: $C$ in parallel with $G$, nothing else connected. The leakage current is $GV = (G/C)Q$, and it comes out of $Q$.', '$Q(t) = Q(0)e^{-t/\\tau}$ with $\\tau = C/G$.'],
      sol: md`(d) The lossy shell is $C$ in parallel with $G$ (the leakage through the medium), and nothing else is connected. The only current is the leakage, $I = GV = GQ/C$, flowing out of the shell:
$$\frac{dQ}{dt} = -\frac GCQ \quad\Longrightarrow\quad \frac{dQ}{dt} + \frac{\sigma}{\epsilon}Q = 0$$
since $G/C = \sigma/\epsilon$. This is the charge-relaxation equation, integrated over the sphere.

(e) $Q(t) = Q(0)e^{-t/\tau}$ with
$$\tau = \frac{C}{G} = \frac{\epsilon}{\sigma} = \frac{2(8.854\times10^{-12})}{2\times10^{-6}} = 8.85\times10^{-6}\ \text{s}, \qquad Q(t) = e^{-t/(8.85\ \mu\text{s})}\ \text{C}$$
Check: $RC = (3.98\times10^4\ \Omega)(2.23\times10^{-10}\ \text{F}) = 8.85$ µs ✓.` }),

    // ================================================================ Problem 5
    RF(md`### Problem 5 · A capacitor whose filling starts to conduct

The gap between parallel infinite copper plates runs from $z = 0$ to $z = W > 0$ and is initially vacuum ($\epsilon_0$, $\mu_0$). The plates carry equal and opposite surface charge densities, so that $\mathbf E = 3\hat z$ V/m in the gap and $\mathbf E = 0$ elsewhere.

[[fig:f5]]`, { f5: fig5 }),
    P({ src: 'HW 4 #5(a)–(b)', title: 'Vacuum gap',
      q: md`(a) What are $\mathbf D$ and $\mathbf P$ in the gap?

(b) What is the surface charge density $\rho_s$ of the copper plate at $z = 0$?`,
      parts: [N('D_z', D5, 'C/m^2'), FIX('$\\mathbf P$ in the gap', ['$0$', '$3\\epsilon_0\\hat z$ C/m²', '$-3\\epsilon_0\\hat z$ C/m²'], 0, [null, 'That is $\\mathbf D$. Vacuum has nothing to polarize.', 'Vacuum has nothing to polarize.']), N('\\rho_s(0)', D5, 'C/m^2')],
      hints: ['In vacuum $\\mathbf D = \\epsilon_0\\mathbf E$ and $\\mathbf P = \\mathbf D - \\epsilon_0\\mathbf E$.', 'At $z = 0$ the normal out of the copper into the gap is $+\\hat z$.'],
      sol: md`(a) $\mathbf D = \epsilon_0\mathbf E = 3\epsilon_0\hat z = 2.66\times10^{-11}\hat z$ C/m². $\mathbf P = \mathbf D - \epsilon_0\mathbf E = 0$: vacuum does not polarize.

(b) $\hat n = +\hat z$ (out of the plate, into the gap): $\rho_s = \hat n\cdot\mathbf D = 3\epsilon_0 = 2.66\times10^{-11}$ C/m². The field points away from it: the bottom plate is the positive one. The top plate holds $-3\epsilon_0$.` }),
    P({ src: 'HW 4 #5(c)', title: 'Fill with a fluid, charge fixed',
      q: md`(c) The gap is filled with a non-conducting fluid of $\epsilon = 81\epsilon_0$ without changing the plates' surface charge densities. What are the new $\mathbf E$, $\mathbf D$ and $\mathbf P$ in the gap?`,
      parts: [N('E_z', E5c, 'V/m'), N('D_z', D5, 'C/m^2'), N('P_z', P5c, 'C/m^2')],
      hints: ['$\\mathbf D$ is set by the free charge, which did not change.', '$\\mathbf E = \\mathbf D/\\epsilon$ and $\\mathbf P = \\mathbf D - \\epsilon_0\\mathbf E$.'],
      sol: md`Gauss's law with free charge: $\rho_s$ is unchanged, so $\mathbf D = 3\epsilon_0\hat z = 2.66\times10^{-11}\hat z$ C/m², as before. Then
$$\mathbf E = \frac{\mathbf D}{81\epsilon_0} = \frac{3}{81}\hat z = 0.0370\hat z\ \text{V/m}, \qquad \mathbf P = \mathbf D - \epsilon_0\mathbf E = 3\epsilon_0\Big(1 - \frac{1}{81}\Big)\hat z = \frac{80}{27}\epsilon_0\hat z = 2.62\times10^{-11}\hat z\ \text{C/m}^2$$
The fluid's bound charge next to the bottom plate, $\mathbf P\cdot(-\hat z) = -2.62\times10^{-11}$ C/m², cancels 80/81 of the plate's charge; what is left makes the much weaker $E$.` }),
    P({ src: 'HW 4 #5(d)', title: 'Add salt',
      q: md`(d) Salt is dissolved in the fluid of part (c), raising its conductivity to $\sigma = 4$ S/m (sea water). What are the equilibrium values of $\mathbf E$, $\mathbf D$ and $\mathbf P$ in the gap once a steady state is reached? Briefly explain.`,
      parts: [MC('In steady state', ['$\\mathbf E = \\mathbf D = \\mathbf P = 0$', '$\\mathbf E$, $\\mathbf D$, $\\mathbf P$ as in part (c)', '$\\mathbf E = 0$ but $\\mathbf D = 3\\epsilon_0\\hat z$ C/m²', '$\\mathbf E = 3\\hat z$ V/m again, $\\mathbf P = 0$'], 0,
          [null, 'With $\\sigma > 0$, any field drives a current $\\mathbf J = \\sigma\\mathbf E$; charge keeps flowing until the field is gone.', '$\\mathbf D = \\epsilon\\mathbf E$ in the fluid: no $E$, no $D$. The plate charge that supported $D$ has been neutralized.', 'The fluid is still there with $\\epsilon = 81\\epsilon_0$, and the plates have discharged.'])],
      hints: ['$\\mathbf J = \\sigma\\mathbf E$: what does a field do in a conducting fluid touching both plates?', 'The plates are isolated; once their charges have met through the fluid, nothing makes a field.'],
      sol: md`The fluid now connects the plates through a conductor. The field drives $\mathbf J = \sigma\mathbf E$ from the positive plate to the negative one (ions drift to the plates and cancel their charge), and the plates are isolated, so nothing replaces the charge. Current flows until it is no longer driven: in steady state
$$\mathbf E = 0, \qquad \mathbf D = \epsilon\mathbf E = 0, \qquad \mathbf P = \mathbf D - \epsilon_0\mathbf E = 0$$
the same as inside any conductor in equilibrium. It happens fast: $\tau = \epsilon/\sigma = 81(8.854\times10^{-12})/4 = 1.8\times10^{-10}$ s ([Topic 3](#/l/t3-relaxation)). The stored field energy ends up as heat in the salt water.` }),

    // ================================================================ Problem 6
    RF(md`### Problem 6 · A coax of mixed materials

An infinitely long coaxial (cylindrically symmetric) cable is in **steady-state equilibrium**, with $r = \sqrt{x^2 + y^2}$:
- (i) Core, $r \le a$: a conductor with $\epsilon = \epsilon_0$ and $\sigma = 10^6$ S/m, holding a net charge per unit length of $2$ C/m.
- (ii) $a < r < b$: a perfect dielectric shell with $\epsilon = 10\epsilon_0$.
- (iii) $b \le r \le c$: a conducting shell with the same properties as the core, holding a net charge per unit length of $-4$ C/m.
- (iv) $c < r < d$: a perfect dielectric shell with $\epsilon = 2\epsilon_0$.
- (v) $r \ge d$: free space.

Determine in all five regions (a) $\mathbf D$, (b) $\mathbf E$ and (c) $\mathbf P$, and (d) the surface charge densities (C/m²) at the four material boundaries $r = a$, $b$, $c$ and $d$. Hint: use Gauss's law in integral form, $\oint_S\mathbf D\cdot d\mathbf S = \int_V\rho\,dV$, with $\mathbf D = \epsilon\mathbf E = \epsilon_0\mathbf E + \mathbf P$, and a crucial fact about steady-state fields inside conductors.

[[fig:f6]]

Enter radial components multiplied by $r$ (for example $rD_r$ in C/m), since each falls as $1/r$.`, { f6: fig6 }),
    P({ src: 'HW 4 #6(a)', title: 'D in all five regions',
      q: md`(a) Find $\mathbf D$ in all five regions.`,
      parts: [MC('Inside the core ($r < a$) and the sheath ($b < r < c$)', ['$\\mathbf D = \\mathbf E = \\mathbf P = 0$', '$\\mathbf E = 0$ but $\\mathbf D \\ne 0$', '$\\mathbf D = \\dfrac{2}{2\\pi r}\\hat r$ C/m², as for a line charge', '$\\mathbf E$ is small but nonzero, since $\\sigma$ is finite'], 0,
          [null, 'In a conductor $\\mathbf D = \\epsilon_0\\mathbf E$, so $\\mathbf E = 0$ forces $\\mathbf D = 0$.', 'Inside a conductor in equilibrium there is no field at all; the enclosed charge is cancelled by surface charge.', 'Steady state: any field would keep driving $\\mathbf J = \\sigma\\mathbf E$; equilibrium means $\\mathbf E = 0$ for any $\\sigma > 0$.']),
        N('rD_r\\ (a < r < b)', 1 / PI, 'C/m'), N('rD_r\\ (c < r < d)', -1 / PI, 'C/m'), N('rD_r\\ (r > d)', -1 / PI, 'C/m')],
      hints: ['Steady state: $\\mathbf E = 0$ inside both conductors, and so $\\mathbf D = \\mathbf P = 0$ there.', 'Gauss on a cylinder of radius $r$, length $\\ell$: $D_r\\,2\\pi r\\ell = Q_{\\text{free, enc}}$. Count the core\'s $+2$ C/m, then add the sheath\'s $-4$ C/m once $r > c$.'],
      sol: md`**Conductors.** In steady-state equilibrium a conductor has $\mathbf E = 0$ inside (otherwise $\mathbf J = \sigma\mathbf E$ would keep flowing), so $\mathbf D = \epsilon_0\mathbf E = 0$ and $\mathbf P = 0$ for $r < a$ and $b < r < c$.

**Gauss** on a cylinder of radius $r$ and length $\ell$: $D_r\,2\pi r\ell = Q_{\text{free, enc}}$.
- $a < r < b$: encloses $2$ C/m: $\mathbf D = \dfrac{2}{2\pi r}\hat r = \dfrac{1}{\pi r}\hat r$ C/m², so $rD_r = 1/\pi = 0.318$ C/m.
- $c < r < d$ and $r > d$: encloses $2 - 4 = -2$ C/m: $\mathbf D = -\dfrac{1}{\pi r}\hat r$ C/m², $rD_r = -0.318$ C/m.

$\mathbf D$ does not care about the dielectrics: it sees free charge only, so it is the same in regions (iv) and (v).` }),
    P({ src: 'HW 4 #6(b)–(c)', title: 'E and P',
      q: md`(b) Find $\mathbf E$ and (c) $\mathbf P$ in all five regions.`,
      parts: [N('rE_r\\ (a < r < b)', 1 / (10 * PI * e0), 'V'), N('rE_r\\ (c < r < d)', -1 / (2 * PI * e0), 'V'), N('rE_r\\ (r > d)', -1 / (PI * e0), 'V'),
        N('rP_r\\ (a < r < b)', 0.9 / PI, 'C/m'), N('rP_r\\ (c < r < d)', -1 / (2 * PI), 'C/m'),
        FIX('$\\mathbf P$ for $r > d$', ['$0$', '$-\\dfrac{1}{2\\pi r}\\hat r$ C/m²', '$-\\dfrac{1}{\\pi r}\\hat r$ C/m²'], 0, [null, 'That is the polarization of the $2\\epsilon_0$ shell; free space does not polarize.', 'That is $\\mathbf D$; in free space $\\mathbf P = \\mathbf D - \\epsilon_0\\mathbf E = 0$.'])],
      hints: ['$\\mathbf E = \\mathbf D/\\epsilon$ region by region (zero in the conductors).', '$\\mathbf P = \\mathbf D - \\epsilon_0\\mathbf E = (1 - \\epsilon_0/\\epsilon)\\mathbf D$.'],
      sol: md`$\mathbf E = \mathbf D/\epsilon$ and $\mathbf P = (1 - \epsilon_0/\epsilon)\mathbf D$:

| region | $\mathbf D$ (C/m²) | $\mathbf E$ (V/m) | $\mathbf P$ (C/m²) |
|---|---|---|---|
| $r < a$ (conductor) | 0 | 0 | 0 |
| $a < r < b$ ($10\epsilon_0$) | $\dfrac{1}{\pi r}\hat r$ | $\dfrac{1}{10\pi\epsilon_0r}\hat r$ | $\dfrac{9}{10\pi r}\hat r$ |
| $b < r < c$ (conductor) | 0 | 0 | 0 |
| $c < r < d$ ($2\epsilon_0$) | $-\dfrac{1}{\pi r}\hat r$ | $-\dfrac{1}{2\pi\epsilon_0r}\hat r$ | $-\dfrac{1}{2\pi r}\hat r$ |
| $r > d$ (free space) | $-\dfrac{1}{\pi r}\hat r$ | $-\dfrac{1}{\pi\epsilon_0r}\hat r$ | 0 |

Numerically, $rE_r = \dfrac{1}{10\pi\epsilon_0} = 3.60\times10^9$ V in (ii), $-\dfrac{1}{2\pi\epsilon_0} = -1.80\times10^{10}$ V in (iv), $-\dfrac{1}{\pi\epsilon_0} = -3.60\times10^{10}$ V in (v); $rP_r = 0.286$ C/m in (ii) and $-0.159$ C/m in (iv). The field points inward outside $r = c$ because the net enclosed charge there is negative.` }),
    P({ src: 'HW 4 #6(d)', title: 'Surface charges',
      q: md`(d) Determine the surface charge densities at $r = a$, $b$, $c$ and $d$. Enter the free surface charge at $r = a$, $b$, $c$ multiplied by that radius (C/m).`,
      parts: [N('a\\,\\rho_s(a)', 1 / PI, 'C/m'), N('b\\,\\rho_s(b)', -1 / PI, 'C/m'), N('c\\,\\rho_s(c)', -1 / PI, 'C/m'),
        MC('At $r = d$ (dielectric to free space)', ['no free charge; a bound charge $\\rho_{sb} = -\\dfrac{1}{2\\pi d}$ C/m²', 'free charge $-\\dfrac{1}{\\pi d}$ C/m²', 'no charge of any kind', 'a bound charge $+\\dfrac{1}{2\\pi d}$ C/m²'], 0,
          [null, 'No conductor ends at $r = d$; $D_r$ is continuous there.', 'The polarization of the $2\\epsilon_0$ shell ends at $r = d$ and leaves bound charge.', 'Sign: $\\mathbf P$ points inward ($-\\hat r$), and the outward normal is $+\\hat r$.'])],
      hints: ['Free charge: $\\rho_s = \\hat n\\cdot(\\mathbf D^+ - \\mathbf D^-)$ with $\\hat n = \\hat r$; inside a conductor $\\mathbf D = 0$.', 'Bound charge on a dielectric face: $\\rho_{sb} = \\mathbf P\\cdot\\hat n$ with $\\hat n$ out of the dielectric.'],
      sol: md`**Free surface charge**, $\rho_s = \hat r\cdot(\mathbf D^+ - \mathbf D^-)$ (it sits on the conductor surfaces):
- $r = a$: $\rho_s = \dfrac{1}{\pi a}$ C/m². The core's $2$ C/m spread over $2\pi a$ ✓.
- $r = b$ (inner face of the sheath): $\rho_s = 0 - \dfrac{1}{\pi b} = -\dfrac{1}{\pi b}$ C/m²: $-2$ C/m, the image of the core's charge.
- $r = c$ (outer face of the sheath): $\rho_s = -\dfrac{1}{\pi c} - 0 = -\dfrac{1}{\pi c}$ C/m²: the remaining $-2$ C/m of the sheath's $-4$ ✓.
- $r = d$: $0$ (no conductor; $D_r$ is continuous).

**Bound surface charge**, $\rho_{sb} = \mathbf P\cdot\hat n$ with $\hat n$ out of each dielectric:
- $r = a$ (inner face of shell (ii), $\hat n = -\hat r$): $-\dfrac{9}{10\pi a}$; $\;r = b$ (outer face, $+\hat r$): $+\dfrac{9}{10\pi b}$.
- $r = c$ (inner face of shell (iv), $-\hat r$): $+\dfrac{1}{2\pi c}$; $\;r = d$ (outer face, $+\hat r$): $-\dfrac{1}{2\pi d}$.

**Check.** The total charge at each radius equals $\epsilon_0$ times the jump in $E_r$. At $r = a$: $\dfrac{1}{\pi a} - \dfrac{9}{10\pi a} = \dfrac{1}{10\pi a} = \epsilon_0E_r(a^+)$ ✓. At $r = d$: $\epsilon_0\Big(-\dfrac{1}{\pi\epsilon_0d} + \dfrac{1}{2\pi\epsilon_0d}\Big) = -\dfrac{1}{2\pi d}$ ✓.` }),
  ];

  EM.lesson('e2-hw', { id: 'hw4', kind: 'hw', title: 'HW 4 · dielectrics, capacitance, conductance, lossy capacitors', steps });
})();

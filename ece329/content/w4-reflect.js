/* Unit 4: reflection and standing waves (Lectures 25-26).
     w4-gamma     Topic 11  reflection and transmission at a boundary: Gamma and tau from the two boundary conditions,
                            the H coefficient, power, the perfect conductor and its surface current, radiation pressure,
                            a good conductor and surface resistance, handedness, any axis
     w4-standing  Topic 12  standing waves: incident + reflected, the PEC pattern, nodes, energy sloshing, partial
                            standing waves and VSWR, a probe, the two-sheet cavity (SP24 #1), reading a plot (FA23 #1(d))
   Same pace as w2-gamma.js: one display at a time, a sentence before each move, a check after each idea, a prediction
   after each section, worked examples, then a practice ladder. Generators: rf_w4_*, w4_* (Topic 11), rf_w4s_*, w4s_*
   (Topic 12). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;
  const PI = Math.PI, ETA0 = 120 * PI, MU0 = 4e-7 * PI, C0 = 3e8;

  // ---------------------------------------------------------------- helpers
  const fr = (x) => TL.frac(x);                                   // TeX of a small fraction, else 3 s.f.
  const trap = (part, list) => Object.assign(part, { traps: list.map(([v, msg]) => ({ v, msg })) });
  // nonmagnetic perfect dielectrics with a clean refractive index n = sqrt(eps_r)
  const ER = [{ n: 1, er: '1' }, { n: 1.5, er: '2.25' }, { n: 2, er: '4' }, { n: 2.5, er: '6.25' }, { n: 3, er: '9' }, { n: 4, er: '16' }];
  const medTex = (m) => (m.n === 1 ? 'free space' : md`a dielectric with $\epsilon_r = ${m.er}$`);
  const two = (list = ER) => { const a = pick(list); let b; do { b = pick(ER); } while (b.n === a.n); return [a, b]; };
  const G12 = (n1, n2) => (n1 - n2) / (n1 + n2);                 // Gamma for nonmagnetic dielectrics
  const etaTex = (n) => (n === 1 ? '120\\pi' : `${p(120 / n)}\\pi`);
  // axes: a wave along s*u-hat with E along a-hat has H along k x a
  const AXN = ['x', 'y', 'z'];
  const hat = (i, s = 1) => `${s < 0 ? '-' : '+'}\\hat ${AXN[i]}`;
  const hat0 = (i, s = 1) => `${s < 0 ? '-' : ''}\\hat ${AXN[i]}`;
  const lc = (a, b, c) => ((a - b) * (b - c) * (c - a)) / 2;       // Levi-Civita symbol for indices 0, 1, 2
  const crossAx = (a, sa, b, sb) => { const c = 3 - a - b; return [c, sa * sb * lc(a, b, c)]; };
  const geom = () => {
    const u = pick([0, 1, 2]), a = pick([0, 1, 2].filter((i) => i !== u)), s = pick([1, -1]);
    const [h, sh] = crossAx(u, s, a, 1);                          // incident H direction: k-hat x a-hat
    const U1 = AXN[u];
    return { u, a, s, h, sh, U: U1, reg1: s > 0 ? `${U1} < 0` : `${U1} > 0`, reg2: s > 0 ? `${U1} > 0` : `${U1} < 0`, sg: s > 0 ? '-' : '+' };
  };
  const pct = (x) => `${p(+(100 * x).toPrecision(3))}\\%`;

  // ---------------------------------------------------------------- figures
  function setupFig() {
    const g = PF.fig({ alt: 'a boundary at z = 0. Region 1 on the left has eta 1 and beta 1; region 2 on the right has eta 2 and gamma 2. The incident wave arrives from the left, the reflected wave goes back to the left, the transmitted wave continues to the right. Axes: z to the right, x up, y out of the page.' });
    const bx = 220;
    g.line(bx, 14, bx, 196, { cls: 'thick' });
    g.label(bx, 200, 'z = 0', 't', 'small');
    g.arrow(40, 52, 196, 52, { cls: 'thick', hs: 9 });
    g.label(118, 44, '\\text{incident}\\ \\tilde E_i', 'b', 'small');
    g.arrow(196, 112, 40, 112, { cls: 'thick', hs: 9 });
    g.label(118, 104, '\\text{reflected}\\ \\Gamma\\tilde E_i', 'b', 'small');
    g.arrow(244, 82, 404, 82, { cls: 'thick', hs: 9 });
    g.label(324, 74, '\\text{transmitted}\\ \\tau\\tilde E_i', 'b', 'small');
    g.label(118, 150, '\\text{region 1:}\\ \\eta_1,\\ \\beta_1', 'c', 'small');
    g.label(324, 128, '\\text{region 2:}\\ \\eta_2,\\ \\gamma_2', 'c', 'small');
    const ox = 330, oy = 186;
    g.arrow(ox, oy, ox + 44, oy, { hs: 6 }); g.label(ox + 48, oy, 'z', 'l', 'small');
    g.arrow(ox, oy, ox, oy - 34, { hs: 6 }); g.label(ox, oy - 38, 'x', 'b', 'small');
    g.odot(ox, oy, 5); g.label(ox - 9, oy + 2, 'y', 'r', 'small');
    return g.svg();
  }
  const gammaPlot = () => PF.plot({
    w: 380, h: 210, x: [0, 4.2], y: [-1.15, 2.15], zero: true, xl: 'n_2/n_1',
    xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[-1, '-1'], [1, '1'], [2, '2']],
    curves: [
      { f: (r) => (1 - r) / (1 + r), lab: '\\Gamma', labAt: 3.4, dx: 2, dy: -12 },
      { f: (r) => 2 / (1 + r), cls: 'dash', lab: '\\tau = 1 + \\Gamma', labAt: 2.2, dx: 4, dy: -12 },
    ],
  });
  function pecFig() {
    const g = PF.fig({ alt: 'a perfect conductor filling the right side. The incident wave arrives from the left and the reflected wave returns with Gamma = -1. A surface current J s flows on the conductor surface along the incident E. At the surface the total E is zero and the total H is twice the incident H.' });
    const wx = 250;
    g.wall(wx, 14, 196, { side: 'right' });
    g.label(wx + 16, 30, '\\text{PEC}', 'l', 'small');
    g.arrow(40, 46, 226, 46, { cls: 'thick', hs: 9 }); g.label(133, 38, '\\text{incident}', 'b', 'small');
    g.arrow(226, 96, 40, 96, { cls: 'thick', hs: 9 }); g.label(133, 88, '\\text{reflected},\\ \\Gamma = -1', 'b', 'small');
    g.arrow(wx - 7, 186, wx - 7, 128, { cls: 'thick', hs: 8 }); g.label(wx - 14, 150, '\\mathbf J_s\\parallel\\tilde{\\mathbf E}_i(0)', 'r', 'small');
    g.label(30, 136, '\\text{at the wall: } E_{\\text{tot}} = 0', 'l', 'small');
    g.label(30, 162, 'H_{\\text{tot}} = 2H_i', 'l', 'small');
    return g.svg();
  }

  // ================================================================ Topic 11: reflection and transmission
  EM.lesson('w4', {
    id: 'w4-gamma', topic: 11, ref: 'Lecture 25', title: 'Reflection and transmission at a boundary',
    steps: [
      RF(md`
        !!key Why you care
          Every Exam 3 has a wave hitting a boundary. Spring 2018 #2 (20 points) gives you only the transmitted field and asks for everything else. Summer 2017 #3 (25 points) is the same skill. HW 11 #1-#3 drill it with a dielectric, a perfect conductor, and waves along $x$ and $y$ instead of $z$. The formula sheet gives you two lines: $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$ and $\tau = 1 + \Gamma$. It does not say where they come from, which $\eta$ is which, what happens to $\mathbf H$, where the power goes, or what a mirror feels. In this lesson you derive all of it from two boundary conditions.

        ### Notation

        - **Region 1**: the medium the wave **comes from**. Lossless, with $\eta_1$ and $\beta_1$.
        - **Region 2**: the medium on the other side, with $\eta_2$ and $\gamma_2 = \alpha_2 + j\beta_2$. It may be lossy.
        - Subscripts $i$, $r$, $t$: the **incident**, **reflected** and **transmitted** waves.
        - $E_0$: the incident electric field phasor at the boundary, in V/m. It may be complex.
        - $\Gamma$: the **reflection coefficient**, $\tilde E_r/\tilde E_i$ at the boundary. A plain number.
        - $\tau$: the **transmission coefficient**, $\tilde E_t/\tilde E_i$ at the boundary. A plain number. Warning: three different taus live in Exam 3. This one; the angle $\tau$ of $\eta$ from [Topic 5](#/l/w2-gamma); and the injection coefficient $\tau_g$ of a transmission line in [Topic 14](#/l/w5-launch).
        - $n = \sqrt{\epsilon_r}$: the **refractive index** of a nonmagnetic dielectric: how many times slower than $c$ the wave goes there.
        - $\hat n$: a unit vector normal to the boundary. $\mathbf J_s$: a surface current density, in A/m (amperes per meter of width).
        - $\langle\mathbf S\rangle$: the time-averaged Poynting vector, in W/m² ([Topic 4](#/l/w1-avg)). $\langle P\rangle$: an average pressure, in N/m² = Pa.

        ### 1. One wave is not enough

        Put a boundary at $z = 0$. Region 1 ($z < 0$) has $\eta_1$; region 2 ($z > 0$) has $\eta_2$. A wave comes from a source far away on the left:
        $$\tilde{\mathbf E}_i = \hat x\,E_0e^{-j\beta_1z}$$
        Its $\mathbf H$ is $\tilde E$ divided by $\eta_1$, turned so that $\mathbf E\times\mathbf H$ points along the travel, $+\hat z$. Since $\hat x\times\hat y = \hat z$:
        $$\tilde{\mathbf H}_i = \hat y\,\frac{E_0}{\eta_1}e^{-j\beta_1z}$$
        Suppose this were the only wave. Just left of the boundary, $\tilde E_x = E_0$. Just right of it there is nothing. But tangential $\mathbf E$ must be continuous across any boundary (your sheet: $\hat n\times(\mathbf E^+ - \mathbf E^-) = 0$). One wave alone breaks the rule.

        What is the least we can add? Two more plane waves, each a solution of Maxwell's equations in its own region:

        - a **reflected** wave in region 1, going back toward $-z$;
        - a **transmitted** wave in region 2, going on toward $+z$.

        Give each one an unknown size, measured against $E_0$. The reflected wave travels toward $-z$, so the sign in its exponent flips:
        $$\tilde{\mathbf E}_r = \hat x\,\Gamma E_0e^{+j\beta_1z}$$
        Its $\mathbf E\times\mathbf H$ must point along $-\hat z$. With $\mathbf E$ along $\hat x$, that needs $\mathbf H$ along $-\hat y$. ([Topic 5](#/l/w2-gamma) showed it: a backward wave has $\tilde H = -\tilde E/\eta$.)
        $$\tilde{\mathbf H}_r = -\hat y\,\frac{\Gamma E_0}{\eta_1}e^{+j\beta_1z}$$
        The transmitted wave lives in region 2, so it uses $\gamma_2$ and $\eta_2$:
        $$\tilde{\mathbf E}_t = \hat x\,\tau E_0e^{-\gamma_2z}$$
        $$\tilde{\mathbf H}_t = \hat y\,\frac{\tau E_0}{\eta_2}e^{-\gamma_2z}$$

        [[fig:setup]]

        Two unknowns, $\Gamma$ and $\tau$, so we need two equations. The boundary gives exactly two: tangential $\mathbf E$ and tangential $\mathbf H$.

        !!intuition Does this make sense?
          Why no backward wave in region 2? It would travel toward $-z$ in region 2, so it would have to come from a source at $z = +\infty$. There is none. Only the side with the source gets two waves.
      `, { setup: { svg: setupFig(), cap: 'Three waves: the incident and reflected waves share region 1; the transmitted wave is alone in region 2. Drawn with E along x (up) and the travel along z.' } }),
      Q(md`**Predict.** Change the polarization. A reflected wave has $\tilde{\mathbf E}_r = \hat y\,B\,e^{+j\beta_1z}$ (along $\hat y$, traveling toward $-z$). Its $\tilde{\mathbf H}_r$ is…`,
        [md`$+\hat x\,(B/\eta_1)\,e^{+j\beta_1z}$`, md`$-\hat x\,(B/\eta_1)\,e^{+j\beta_1z}$`, md`$+\hat x\,(B/\eta_1)\,e^{-j\beta_1z}$`, md`$+\hat x\,B\eta_1\,e^{+j\beta_1z}$`], 0,
        [null, md`That copies the minus sign from the $\hat x$-polarized case without redoing the cross product. Here $(-\hat z)\times\hat y = +\hat x$.`, md`$\mathbf H$ of a wave has the same exponent as its $\mathbf E$. This wave goes as $e^{+j\beta_1z}$.`, md`$H$ is $E$ divided by $\eta$, not multiplied.`],
        md`$\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta$ with $\hat k = -\hat z$. $(-\hat z)\times\hat y = -(\hat z\times\hat y) = -(-\hat x) = +\hat x$. So $\tilde{\mathbf H}_r = +\hat x\,(B/\eta_1)e^{+j\beta_1z}$. Check: $\hat y\times\hat x = -\hat z$, the direction of travel. ✓ The minus sign of the $\hat x$ case is not a rule to memorize; it comes out of $\hat k\times\hat E$.`),
      R(md`
        ### 2. Condition one: tangential E is continuous

        At $z = 0$ every exponential equals 1. So at the boundary the incident field is $E_0$, the reflected field is $\Gamma E_0$, and the transmitted field is $\tau E_0$, all along $\hat x$, which is tangential to the boundary.

        Region 1 holds two waves, so the field just left of the boundary is their sum. Region 2 holds one. Set them equal:
        $$E_0 + \Gamma E_0 = \tau E_0$$
        Divide by $E_0$:
        $$\boxed{1 + \Gamma = \tau} \qquad (1)$$
        That is the last line of the reflection block on your sheet. It says nothing more than "the field just left equals the field just right."

        !!intuition Does this make sense?
          If region 2 were the same material as region 1, nothing should reflect: $\Gamma = 0$. Then (1) gives $\tau = 1$: the whole wave goes on unchanged. ✓
      `),
      Q(md`**Predict.** At $z = 0$ the incident field is $6\hat x$ V/m and the reflected field is $-2\hat x$ V/m. The transmitted field at $z = 0^+$ is…`,
        [md`$4\hat x$ V/m`, md`$8\hat x$ V/m`, md`$6\hat x$ V/m`, md`$-2\hat x$ V/m`], 0,
        [null, md`That adds the sizes and ignores the sign. The reflected field points along $-\hat x$, so it subtracts.`, md`That ignores the reflected wave. The field just left of the boundary is the sum of both waves in region 1.`, md`That is the reflected field itself. The transmitted field must equal the total on the left.`],
        md`Continuity: $\tilde E_t(0) = 6 - 2 = 4$ V/m along $\hat x$. Here $\Gamma = -2/6 = -1/3$ and $\tau = 4/6 = 2/3 = 1 + \Gamma$ ✓.`),
      R(md`
        ### 3. Condition two: tangential H is continuous

        The other tangential condition on your sheet is $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$. Is there a surface current on this boundary? A surface current is a finite current squeezed into a layer of zero thickness. A material with finite $\sigma$ carries $\mathbf J = \sigma\mathbf E$, a finite current density, and a finite density in zero thickness carries zero current. So unless region 2 is a perfect conductor,
        $$\mathbf J_s = 0$$
        and tangential $\mathbf H$ is continuous too. At $z = 0$ the three $y$-components are: incident $E_0/\eta_1$, reflected $-\Gamma E_0/\eta_1$, transmitted $\tau E_0/\eta_2$. Left side equals right side:
        $$\frac{E_0}{\eta_1} - \frac{\Gamma E_0}{\eta_1} = \frac{\tau E_0}{\eta_2}$$
        Cancel $E_0$ and multiply both sides by $\eta_1$:
        $$\boxed{1 - \Gamma = \frac{\eta_1}{\eta_2}\,\tau} \qquad (2)$$
        Compare (1) and (2). The only difference on the left is the sign in front of $\Gamma$, and it came from the reflected wave's $\mathbf H$ pointing the other way. That one sign is the whole story of reflection: whatever the reflected wave does to $E$ at the boundary, it does the opposite to $H$.
      `),
      Q(md`**Predict.** Why is there no surface current on the boundary between glass and seawater ($\sigma = 4$ S/m)?`,
        ['Seawater has finite σ: its current is spread through a volume, and a layer of zero thickness carries none', 'There is no electric field at the boundary', 'Glass has σ = 0, and a surface current needs both sides to conduct', 'Surface currents exist only for static fields'], 0,
        [null, md`$E$ at the boundary is $(1 + \Gamma)E_0$, which is not zero for a dielectric or seawater.`, md`A perfect conductor on one side is enough to carry $\mathbf J_s$: that is the mirror of Section 7.`, md`A mirror carries an oscillating $\mathbf J_s(t)$, as Section 7 shows.`],
        md`$\mathbf J_s = \lim_{h\to0}\mathbf J h$. With $\mathbf J = \sigma\mathbf E$ finite, the limit is 0. Only $\sigma\to\infty$ can keep $\mathbf J h$ finite as $h\to0$.`),
      RF(md`
        ### 4. Solve the two equations

        Equation (1) says $\tau = 1 + \Gamma$. Put that into (2):
        $$1 - \Gamma = \frac{\eta_1}{\eta_2}(1 + \Gamma)$$
        Multiply both sides by $\eta_2$ to clear the fraction:
        $$\eta_2 - \eta_2\Gamma = \eta_1 + \eta_1\Gamma$$
        Move every $\Gamma$ to the right and everything else to the left:
        $$\eta_2 - \eta_1 = (\eta_2 + \eta_1)\Gamma$$
        Divide by $\eta_2 + \eta_1$:
        $$\boxed{\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}}$$
        Now $\tau = 1 + \Gamma$. Write the 1 as $(\eta_2 + \eta_1)/(\eta_2 + \eta_1)$ and add the tops:
        $$\tau = \frac{(\eta_2 + \eta_1) + (\eta_2 - \eta_1)}{\eta_2 + \eta_1}$$
        The $\eta_1$'s cancel:
        $$\boxed{\tau = \frac{2\eta_2}{\eta_2 + \eta_1}}$$
        **Which η is which?** $\eta_1$ is where the wave comes from; $\eta_2$ is where it is going. "Going minus coming, over the sum."

        !!intuition Does this make sense? Three limits.
          - $\eta_2 = \eta_1$: $\Gamma = 0$ and $\tau = 1$. Nothing changed, so nothing reflects. ✓
          - $\eta_2 \to 0$ (a perfect conductor, Section 7): $\Gamma = -1$ and $\tau = 0$. Everything reflects, nothing gets in. ✓
          - $\eta_2 \to \infty$: $\Gamma = +1$ and $\tau = 2$. The reflected $E$ doubles the field at the boundary, and the reflected $H$ cancels $H$ there.

          For real impedances, $\Gamma$ always lies between $-1$ and $+1$.

        **A quick number.** Air into a nonmagnetic dielectric with $\epsilon_r = 9/4$. Then $\eta_2 = \eta_0/\sqrt{9/4} = \tfrac23\eta_0$, and the $\eta_0$'s cancel inside $\Gamma$:
        $$\Gamma = \frac{\tfrac23 - 1}{\tfrac23 + 1} = \frac{-\tfrac13}{\tfrac53} = -\frac15$$
        and $\tau = 1 - \tfrac15 = \tfrac45$. You never needed $120\pi$.

        [[fig:gplot]]
      `, { gplot: { svg: gammaPlot(), cap: 'Γ and τ for two nonmagnetic dielectrics, against n₂/n₁ (which equals η₁/η₂). Γ crosses zero when the media match and goes negative into a denser medium; τ = 1 + Γ is never negative.' } }),
      Q(md`**Predict.** Region 2 has $\eta_2 = 3\eta_1$. Then $\Gamma$ and $\tau$ are…`,
        [md`$\Gamma = \tfrac12$, $\tau = \tfrac32$`, md`$\Gamma = -\tfrac12$, $\tau = \tfrac12$`, md`$\Gamma = \tfrac12$, $\tau = \tfrac12$`, md`$\Gamma = \tfrac23$, $\tau = \tfrac53$`], 0,
        [null, md`That swaps $\eta_1$ and $\eta_2$. The wave goes into the medium with $3\eta_1$, so the top is $3\eta_1 - \eta_1$.`, md`That uses $\tau = 1 - \Gamma$. Equation (1) says $\tau = 1 + \Gamma$.`, md`That divides by $\eta_2$ alone: $(3 - 1)/3$. The bottom is the sum, $3 + 1$.`],
        md`$\Gamma = (3 - 1)/(3 + 1) = \tfrac12$, and $\tau = 1 + \tfrac12 = \tfrac32 = 2(3)/(3 + 1)$ ✓.`),
      R(md`
        ### 5. Reading the sign of Γ, and what H does

        Most exam problems use nonmagnetic dielectrics, $\mu = \mu_0$ and $\epsilon = \epsilon_r\epsilon_0$. Then
        $$\eta = \frac{\eta_0}{\sqrt{\epsilon_r}} = \frac{\eta_0}{n}$$
        Put this into $\Gamma$. The $\eta_0$'s cancel:
        $$\Gamma = \frac{1/n_2 - 1/n_1}{1/n_2 + 1/n_1}$$
        Multiply the top and the bottom by $n_1n_2$:
        $$\boxed{\Gamma = \frac{n_1 - n_2}{n_1 + n_2}}$$
        Now the sign reads off at a glance.

        | The wave goes… | $\eta$ | $\Gamma$ | Reflected $E$ at the boundary |
        |---|---|---|---|
        | into a denser medium ($n_2 > n_1$) | falls | negative | points against the incident $E$ |
        | into a thinner medium ($n_2 < n_1$) | rises | positive | points along the incident $E$ |
        | into a perfect conductor | $0$ | $-1$ | cancels the incident $E$ exactly |

        **What about H?** Section 3 showed that at the boundary the reflected $H$ is $-\Gamma$ times the incident $H$ (same axis). So **the reflection coefficient for $\mathbf H$ is $-\Gamma$**. The reason is the travel direction: the reflected wave goes backward, so its $\mathbf H$ is flipped relative to its $\mathbf E$. Whenever the reflection weakens $E$ at the boundary, it strengthens $H$, and the other way round. The totals just left of the boundary are
        $$\tilde E_1(0) = (1 + \Gamma)E_0$$
        $$\tilde H_1(0) = (1 - \Gamma)\frac{E_0}{\eta_1}$$

        **Can τ be bigger than 1?** Yes, whenever $\Gamma > 0$. From glass into air, $\tau$ is between 1 and 2. That is not free energy. The transmitted wave has a bigger $E$, but it lives where $\eta$ is bigger, so its $H$ is smaller. Divide its $H$, $\tau E_0/\eta_2$, by the incident $H$, $E_0/\eta_1$, and use (2):
        $$\frac{\tilde H_t}{\tilde H_i} = \frac{\eta_1}{\eta_2}\tau = 1 - \Gamma$$
        which is less than 1 when $\Gamma > 0$. Power needs both $E$ and $H$, and the next section shows it always balances.

        !!intuition Does this make sense?
          A pulse on a rope tied to a much heavier rope comes back upside down; tied to a light string it comes back upright. Waves going into a "denser" medium flip, going into a "thinner" one do not. A wall is the extreme heavy rope: the pulse comes back upside down and full size, $\Gamma = -1$.
      `),
      Q(md`**Predict.** A wave in glass ($\epsilon_r = 9$) hits a flat glass-air surface from inside the glass. $\Gamma$ is…`,
        [md`$+\tfrac12$`, md`$-\tfrac12$`, md`$+\tfrac45$`, md`$+\tfrac32$`], 0,
        [null, md`That is air into glass. The wave comes from the glass, so $n_1 = 3$ and $n_2 = 1$.`, md`That uses $\epsilon_r$ in place of $n$: $(9 - 1)/(9 + 1)$. $\eta$ goes as $1/\sqrt{\epsilon_r}$.`, md`That is $\tau = 1 + \Gamma$.`],
        md`$\Gamma = (n_1 - n_2)/(n_1 + n_2) = (3 - 1)/(3 + 1) = \tfrac12$. Into a thinner medium, $\Gamma > 0$: the reflected $E$ is upright.`),
      Q(md`**Predict.** A wave in air hits a nonmagnetic dielectric with $\epsilon_r = 4$. At the boundary, the total $H$ in region 1 is how many times the incident $H$?`,
        [md`$\tfrac43$`, md`$\tfrac23$`, md`$\tfrac13$`, md`$1$`], 0,
        [null, md`That is $1 + \Gamma$, the ratio for $E$. For $H$ the reflected part enters with $-\Gamma$.`, md`That is the reflected $H$ alone, $|\Gamma|$. The total adds the incident $H$.`, md`That ignores the reflected wave, which is there because $\Gamma \neq 0$.`],
        md`$\Gamma = (1 - 2)/(1 + 2) = -\tfrac13$. The $H$ ratio is $1 - \Gamma = \tfrac43$. $E$ at the boundary is weakened to $\tfrac23$ while $H$ is boosted to $\tfrac43$.`),
      R(md`
        ### 6. Where the power goes

        Each of the three waves is a single traveling wave, so its average power density is the one from [Topic 4](#/l/w1-avg):
        $$\langle S\rangle = \frac{|E|^2}{2\eta}$$
        Take region 2 lossless for now, so both $\eta$'s are real. The incident wave:
        $$\langle S_i\rangle = \frac{|E_0|^2}{2\eta_1}$$
        The reflected wave has amplitude $|\Gamma E_0|$ in the same medium:
        $$\langle S_r\rangle = |\Gamma|^2\frac{|E_0|^2}{2\eta_1} = |\Gamma|^2\langle S_i\rangle$$
        The transmitted wave has amplitude $|\tau E_0|$ in region 2:
        $$\langle S_t\rangle = |\tau|^2\frac{|E_0|^2}{2\eta_2} = \frac{\eta_1}{\eta_2}|\tau|^2\langle S_i\rangle$$
        So the fractions of the incident power are
        $$\boxed{R = |\Gamma|^2, \qquad T = \frac{\eta_1}{\eta_2}|\tau|^2}$$
        ($R$ for reflectance, $T$ for transmittance.)

        **They add to 1.** Multiply equation (1) by equation (2). The left sides give $(1 + \Gamma)(1 - \Gamma) = 1 - \Gamma^2$. The right sides give $\tau\cdot(\eta_1/\eta_2)\tau$. So
        $$1 - \Gamma^2 = \frac{\eta_1}{\eta_2}\tau^2$$
        which says $T = 1 - R$:
        $$\boxed{T = 1 - |\Gamma|^2}$$
        Energy is conserved, and the two boundary conditions are the reason. Whatever does not reflect goes through. On the exam use $1 - |\Gamma|^2$: it is faster than squaring $\tau$, and it cannot forget the $\eta_1/\eta_2$.

        If region 2 is lossy, $\eta_2$ is complex and the formula with $\eta_1/\eta_2$ no longer applies as written. $T = 1 - |\Gamma|^2$ still does: it is the power just past the boundary, before the material starts eating it.

        **In decibels.** Reflectance is often quoted as $10\log_{10}|\Gamma|^2$, which is $20\log_{10}|\Gamma|$. $|\Gamma| = 0.1$ is $-20$ dB: one hundredth of the power comes back. (The skill HW 11 #2(d) asks for.)

        !!intuition Does this make sense?
          Squaring $\tau$ alone can give nonsense. From $\epsilon_r = 4$ into air: $\Gamma = (2 - 1)/(2 + 1) = \tfrac13$, $\tau = \tfrac43$, and $\tau^2 = \tfrac{16}{9}$, more than the incident power. The factor $\eta_1/\eta_2 = \tfrac12$ fixes it: $T = \tfrac89$. And $R = \tfrac19$. They add to 1. ✓
      `),
      Q(md`**Predict.** Region 2 has $\eta_2 = 3\eta_1$, both lossless. What fraction of the incident power is transmitted?`,
        [md`$\tfrac34$`, md`$\tfrac94$`, md`$\tfrac12$`, md`$\tfrac14$`], 0,
        [null, md`That is $\tau^2$ without the factor $\eta_1/\eta_2 = \tfrac13$. A fraction above 1 should ring an alarm.`, md`That is $\Gamma$, a ratio of fields. Power goes as the square.`, md`That is the reflected fraction $|\Gamma|^2$.`],
        md`$\Gamma = \tfrac12$, so $T = 1 - \tfrac14 = \tfrac34$. The long way agrees: $(\eta_1/\eta_2)\tau^2 = \tfrac13\cdot\tfrac94 = \tfrac34$ ✓.`),
      RF(md`
        ### 7. A perfect conductor: Γ = −1 and a surface current

        A perfect electric conductor (PEC) has $\sigma\to\infty$. In [Topic 7](#/l/w2-limits), a good conductor has $|\eta| = \sqrt{\omega\mu/\sigma}$, which goes to 0 as $\sigma$ grows. Put $\eta_2 = 0$:
        $$\Gamma = \frac{0 - \eta_1}{0 + \eta_1} = -1$$
        and $\tau = 1 + \Gamma = 0$. Nothing gets in, and all of the power comes back. At the surface:

        - total $E$: $(1 + \Gamma)E_0 = 0$. A perfect conductor allows no tangential $E$ on its surface.
        - total $H$: $(1 - \Gamma)E_0/\eta_1 = 2E_0/\eta_1$, twice the incident $H$.

        **The surface current.** Inside the PEC, $\mathbf H = 0$. Just outside, $\mathbf H = \hat y\,2E_0/\eta_1$. $\mathbf H$ jumps, so now the boundary condition needs a $\mathbf J_s$. Let $\hat n$ point from the conductor into region 1; here $\hat n = -\hat z$. The condition $\hat n\times(\mathbf H_1 - \mathbf H_2) = \mathbf J_s$ with $\mathbf H_2 = 0$ gives
        $$\mathbf J_s = \hat n\times\mathbf H_1(0)$$
        Put in $\hat n = -\hat z$ and $\mathbf H_1(0) = \hat y\,2E_0/\eta_1$:
        $$\mathbf J_s = (-\hat z\times\hat y)\frac{2E_0}{\eta_1}$$
        Since $\hat z\times\hat y = -\hat x$:
        $$\mathbf J_s = \hat x\,\frac{2E_0}{\eta_1}$$
        For a real $E_0$, in time: $\mathbf J_s(t) = \hat x\,(2E_0/\eta_1)\cos\omega t$ A/m.

        Look at its direction: $\hat x$, the direction of the incident $\mathbf E$ at the surface. That is no accident; the incident field is what drives the current. It holds for any geometry:
        $$\boxed{\tilde{\mathbf J}_s = \frac{2\tilde{\mathbf E}_i(0)}{\eta_1}}$$

        [[fig:pec]]

        !!intuition Does this make sense? The mirror is a current sheet.
          In [Topic 10](#/l/w3-antenna), a sheet $\mathbf J_s$ radiates $\tilde{\mathbf E} = -\tfrac{\eta}{2}\tilde{\mathbf J}_se^{-j\beta|z|}$ to both sides. Put in $\tilde{\mathbf J}_s = 2\tilde{\mathbf E}_i(0)/\eta_1$: the sheet radiates $-\tilde{\mathbf E}_i(0)$ to both sides. Into the conductor it cancels the incident wave. Back into region 1 it **is** the reflected wave, with $\Gamma = -1$. Reflection is radiation from the induced current.
      `, { pec: { svg: pecFig(), cap: 'A perfect conductor: total reflection. The surface current flows along the incident E at the surface; E vanishes there and H doubles.' } }),
      Q(md`**Predict.** In $z < 0$ the incident wave is $\tilde{\mathbf E}_i = \hat y\,E_0e^{-j\beta_1z}$; a perfect conductor fills $z > 0$. The surface current is…`,
        [md`$\hat y\,2E_0/\eta_1$`, md`$-\hat y\,2E_0/\eta_1$`, md`$\hat x\,2E_0/\eta_1$`, md`$\hat y\,E_0/\eta_1$`], 0,
        [null, md`That takes $\hat n$ pointing into the conductor. $\hat n$ points out of it, into region 1: $-\hat z$.`, md`That copies the $\hat x$ of the example. $\mathbf J_s$ follows the incident $\mathbf E$, which is along $\hat y$ here.`, md`That uses the incident $H$ alone. The total $H$ at the surface is twice that.`],
        md`$\tilde{\mathbf H}_i = \hat z\times\hat y\,E_0/\eta_1 = -\hat x\,E_0/\eta_1$, and at the wall it doubles: $-\hat x\,2E_0/\eta_1$. Then $\mathbf J_s = (-\hat z)\times(-\hat x)\,2E_0/\eta_1 = \hat y\,2E_0/\eta_1$, which is $2\tilde{\mathbf E}_i(0)/\eta_1$ ✓.`),
      R(md`
        ### 8. Radiation pressure: the mirror is pushed

        The surface current sits in a magnetic field, so it feels a force: $q\mathbf v\times\mathbf B$ on each moving charge, which is $\mathbf J\times\mathbf B$ per unit volume. Which $\mathbf B$? At the surface, $B$ jumps from $2\mu_0E_0/\eta_1$ outside to 0 inside. A real mirror spreads the current over a thin layer (a few skin depths), and we can follow $B$ through it. Take the metal nonmagnetic, $\mu = \mu_0$.

        Inside the metal the displacement current is negligible, so Ampère's law reads $\nabla\times\mathbf H = \mathbf J$. Its $x$-component, with only $H_y(z)$ present:
        $$J_x = -\frac{\partial H_y}{\partial z}$$
        The force per volume is $\mathbf J\times\mathbf B = \hat x J_x\times\hat y\,\mu_0H_y$, along $\hat z$:
        $$f_z = J_x\,\mu_0H_y = -\mu_0H_y\frac{\partial H_y}{\partial z}$$
        That is a perfect derivative:
        $$f_z = -\frac{\partial}{\partial z}\left(\tfrac12\mu_0H_y^2\right)$$
        Integrate through the layer, from the surface (where $H_y = H_s$) to deep inside (where $H_y = 0$). The force per unit area is
        $$P = \tfrac12\mu_0H_s^2$$
        pointing along $+\hat z$, into the mirror. With $H_s = (2E_0/\eta_1)\cos\omega t$:
        $$P(t) = \frac{2\mu_0E_0^2}{\eta_1^2}\cos^2\omega t$$
        The average of $\cos^2$ is $\tfrac12$:
        $$\langle P\rangle = \frac{\mu_0E_0^2}{\eta_1^2}$$
        Compare with the incident power. In air, $\eta_0 = \mu_0c$, so $\mu_0/\eta_0^2 = 1/(\eta_0c)$, and
        $$\langle P\rangle = \frac{E_0^2}{\eta_0c} = \frac{2}{c}\cdot\frac{E_0^2}{2\eta_0}$$
        $$\boxed{\langle P\rangle_{\text{mirror}} = \frac{2\langle S_i\rangle}{c}}$$
        A handy form: $E_0/\eta_1 = H_0$, the incident $H$, so $\langle P\rangle = \mu_0H_0^2$.

        **The momentum picture.** A wave carries momentum as well as energy: a beam with power density $\langle S\rangle$ delivers momentum $\langle S\rangle/c$ per square meter per second, and force is momentum per second.

        - A black **absorber** stops the wave and keeps its momentum: $\langle P\rangle = \langle S\rangle/c$.
        - A perfect **mirror** sends the wave back, so the momentum reverses: a change of $2\langle S\rangle/c$. Same answer as the force on the current.
        - A surface that reflects a fraction $|\Gamma|^2$ and absorbs the rest: $\langle P\rangle = (1 + |\Gamma|^2)\langle S\rangle/c$.

        For a beam of total power $P_b$ hitting a surface, the force is $P_b/c$ (absorber) or $2P_b/c$ (mirror), whatever the spot size.

        !!intuition Does this make sense?
          It is tiny. Sunlight, about $1.4$ kW/m², pushes a mirror with $2(1400)/(3\times10^8) \approx 9\ \mu$Pa. On a 1 m² mirror that is about $9\ \mu$N. You would never feel it, but a solar sail in space can ride it for years.
      `),
      Q(md`**Predict.** A 3 W laser beam is completely absorbed by a black target. The force on the target is…`,
        ['10 nN', '20 nN', md`$3.3\times10^{-17}$ N`, 'zero: light has no mass, so it carries no momentum'], 0,
        [null, md`That is $2P/c$, for a mirror. An absorber only stops the momentum; it does not reverse it.`, md`That divides by $c^2$. Momentum per second is $P/c$.`, md`Light carries momentum $\langle S\rangle/c$ per m² per second even without mass. Section 8 got the force from $\mathbf J\times\mathbf B$ directly.`],
        md`$F = P/c = 3/(3\times10^8) = 10^{-8}$ N $= 10$ nN. A mirror would feel 20 nN.`),
      R(md`
        ### 9. A good conductor: almost a mirror

        A real metal has a large but finite $\sigma$. In [Topic 7](#/l/w2-limits), its impedance has size $\sqrt{\omega\mu/\sigma}$ and angle $45°$:
        $$\eta_2 = \sqrt{\frac{\omega\mu}{\sigma}}\,e^{j45°}$$
        Since $e^{j45°} = (1 + j)/\sqrt2$, this is
        $$\eta_2 = (1 + j)R_s, \qquad R_s = \sqrt{\frac{\omega\mu}{2\sigma}}$$
        $R_s$ is the **surface resistance** of [Topic 8](#/l/w2-loss). It also equals $1/(\sigma\delta)$, with $\delta$ the skin depth. For copper at 1 GHz, $R_s \approx 8$ mΩ, while $\eta_0 \approx 377\ \Omega$. So $\eta_2 \ll \eta_1$.

        Call $x = \eta_2/\eta_1$, a tiny complex number. Divide the top and bottom of $\Gamma$ by $\eta_1$:
        $$\Gamma = \frac{x - 1}{x + 1} = -\frac{1 - x}{1 + x}$$
        For tiny $x$, $1/(1 + x) \approx 1 - x$. So
        $$\Gamma \approx -(1 - x)(1 - x) \approx -(1 - 2x)$$
        after dropping $x^2$. That is
        $$\boxed{\Gamma \approx -1 + \frac{2\eta_2}{\eta_1}}$$
        Almost $-1$, plus a small correction. And $\tau = 1 + \Gamma \approx 2\eta_2/\eta_1$: tiny.

        **How much power does the metal absorb?** The fraction that does not reflect is $1 - |\Gamma|^2$. Write $x = a + jb$, so $\Gamma \approx -1 + 2a + j2b$:
        $$|\Gamma|^2 \approx (1 - 2a)^2 + (2b)^2$$
        To first order in the small numbers this is $1 - 4a$. And $a = \Re\{x\} = R_s/\eta_1$. So the absorbed fraction is
        $$\boxed{1 - |\Gamma|^2 \approx \frac{4R_s}{\eta_1}}$$
        **Check with the surface current.** Multiply by $\langle S_i\rangle = E_0^2/2\eta_1$: the absorbed power is $2R_sE_0^2/\eta_1^2$ per square meter. The current is almost the mirror's, $|\tilde J_s| = 2E_0/\eta_1$, and [Topic 8](#/l/w2-loss) says it heats the metal at $\tfrac12R_s|\tilde J_s|^2$ per square meter:
        $$\tfrac12R_s\left(\frac{2E_0}{\eta_1}\right)^2 = \frac{2R_sE_0^2}{\eta_1^2}$$
        The same. ✓ This is how engineers compute wall losses: find $\mathbf J_s$ as if the wall were perfect, then charge $\tfrac12R_s|\mathbf J_s|^2$ per square meter.

        !!intuition Does this make sense?
          For copper at 1 GHz, $4R_s/\eta_0 \approx 4(0.008)/377 \approx 10^{-4}$: copper reflects 99.99% of the power. That is why metal mirrors, microwave ovens and shielded cables work. As $\sigma\to\infty$, $R_s\to0$, and we are back to the perfect mirror.
      `),
      Q(md`**Predict.** A wave in air hits a metal with $R_s = 0.03\pi\ \Omega$. About what fraction of the incident power does the metal absorb?`,
        ['0.1%', '0.14%', '0.05%', '99.9%'], 0,
        [null, md`That uses $|\eta_2| = \sqrt2R_s$. Only the real part of $\eta_2$, which is $R_s$, absorbs.`, md`That is $2R_s/\eta_0$. The expansion of $|\Gamma|^2$ gives $1 - 4\Re\{x\}$: the factor is 4.`, md`That is the reflected fraction, $|\Gamma|^2$.`],
        md`$4R_s/\eta_0 = 4(0.03\pi)/(120\pi) = 0.12/120 = 0.001 = 0.1\%$.`),
      R(md`
        ### 10. Any axis, either direction, any polarization

        Nothing above depended on the names $x$, $y$, $z$. Here is the recipe for any geometry.

        1. **Region 1 is where the wave comes from.** If the wave travels toward $-y$ and meets a boundary at $y = 0$, region 1 is $y > 0$, and $\eta_1$ is that side's.
        2. **Reflected E:** take the incident $\tilde{\mathbf E}$ at the boundary, multiply by $\Gamma$, and flip the sign of $\beta_1$ in the exponent.
        3. **Transmitted E:** multiply by $\tau$ and use region 2's $\beta_2$ (or $\gamma_2$). The direction of travel is unchanged.
        4. **Every H:** $\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta$, with $\hat k$ the direction **that** wave travels and $\eta$ of **its** medium. The reflected wave's flip comes out by itself.

        Step 2 works for any polarization, because $\Gamma$ multiplies every component of $\mathbf E$ by the same number.

        **Handedness flips on reflection.** Take a right-hand circular wave going toward $+z$:
        $$\tilde{\mathbf E}_i = E_0(\hat x - j\hat y)e^{-j\beta_1z}$$
        At $z = 0$, $E_x = E_0\cos\omega t$ and $E_y = \Re\{-jE_0e^{j\omega t}\} = E_0\sin\omega t$. The tip turns from $\hat x$ toward $\hat y$. Thumb along $+\hat z$, fingers curling from $\hat x$ to $\hat y$: the right hand ([Topic 9](#/l/w3-pol)). ✓ The reflected wave is
        $$\tilde{\mathbf E}_r = \Gamma E_0(\hat x - j\hat y)e^{+j\beta_1z}$$
        At $z = 0$ its tip turns the same way, from $\hat x$ toward $\hat y$. A real $\Gamma$, even a negative one, cannot change the sense of turning: $\Gamma = -1$ only turns the whole picture by $180°$. But this wave travels toward $-z$. Thumb along $-\hat z$ with the same turning: the **left** hand. Reflection turns RHC into LHC and LHC into RHC. The transmitted wave keeps both its turning and its direction, so it keeps its hand.

        !!intuition Does this make sense?
          A mirror swaps left and right: the reflection of your right hand is a left hand. The turning of the field did not change; the direction of travel did, and handedness is turning measured against the direction of travel.
      `),
      Q(md`**Predict.** $\tilde{\mathbf E}_i = E_0(\hat y - j\hat z)e^{-j\beta_1x}$ hits a dielectric at $x = 0$ and $\Gamma = -\tfrac13$. The reflected wave is…`,
        ['left-hand circular, traveling toward −x', 'right-hand circular, traveling toward −x', 'linear, because Γ is real', 'left-hand elliptical, because |Γ| < 1'], 0,
        [null, md`The turning is the same as the incident wave's, but the travel reversed, so the hand flips.`, md`$\Gamma$ multiplies both components by the same number. The $-j$ between them, which makes the circle, survives.`, md`$|\Gamma|$ shrinks both components equally, so the circle just gets smaller.`],
        md`Incident: $E_y = E_0\cos\omega t$, $E_z = E_0\sin\omega t$ at $x = 0$: it turns from $\hat y$ to $\hat z$, and $\hat y\times\hat z = +\hat x$, the travel: RHC. Reflected: $-\tfrac13E_0(\hat y - j\hat z)e^{+j\beta_1x}$ turns the same way but travels toward $-x$: LHC. This is the skill HW 11 #1(a) asks for.`),
      R(md`
        ### The method

        !!method An interface problem, start to finish
          1. **Name the regions.** Region 1 is where the wave comes from. Find $\eta_1$, $\beta_1$ and $\eta_2$, $\beta_2$ (or $\gamma_2$). For nonmagnetic dielectrics just find $n = \sqrt{\epsilon_r}$ on each side.
          2. **Coefficients.** $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1) = (n_1 - n_2)/(n_1 + n_2)$, and $\tau = 1 + \Gamma$.
          3. **E fields.** Reflected: $\Gamma$ times the incident vector at the boundary, exponent flipped. Transmitted: $\tau$ times it, with $\beta_2$.
          4. **H fields.** $\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta$ for each wave, with its own $\hat k$ and $\eta$.
          5. **Power.** $R = |\Gamma|^2$, $T = 1 - |\Gamma|^2$; each $\langle S\rangle = |E|^2/2\eta$ in its own medium.
          6. **Check.** At the boundary: $E_i + E_r = E_t$ and $H_i + H_r = H_t$ (or $\mathbf J_s = \hat n\times\mathbf H_1$ on a conductor).

        ### Worked example 1: everything from the incident wave

        !!graded Problem
          Free space fills $z < 0$. A wave $\mathbf E_i = \hat x\,6\sin(\omega t - \beta_1z)$ V/m travels toward $+z$ and hits a perfect dielectric with $\mu = \mu_0$, $\epsilon = 2.25\epsilon_0$ that fills $z > 0$. Find the phasors of all six fields, the three average power densities, and the reflectance in dB. (The skill HW 11 #2 asks for.)

        **Step 1: the incident phasor.** $\sin x = \cos(x - 90°)$, so the field is $6\cos(\omega t - \beta_1z - 90°)$. The phasor of $e^{-j90°}$ is $-j$:
        $$\tilde{\mathbf E}_i = -j6\,\hat x\,e^{-j\beta_1z}$$
        **Step 2: the impedances.** $\eta_1 = 120\pi\ \Omega$. In region 2, $n_2 = \sqrt{2.25} = 1.5$, so $\eta_2 = 120\pi/1.5 = 80\pi\ \Omega$. Its phase constant is $\beta_2 = 1.5\beta_1$.

        **Step 3: Γ and τ.**
        $$\Gamma = \frac{80\pi - 120\pi}{80\pi + 120\pi} = \frac{-40}{200} = -\frac15$$
        Check with the indices: $(1 - 1.5)/(1 + 1.5) = -0.5/2.5 = -\tfrac15$ ✓. And $\tau = 1 - \tfrac15 = \tfrac45$.

        **Step 4: the E phasors.** Reflected: $\Gamma$ times $-j6$, exponent flipped:
        $$\tilde{\mathbf E}_r = \left(-\tfrac15\right)(-j6)\,\hat x\,e^{+j\beta_1z}$$
        $$\tilde{\mathbf E}_r = j1.2\,\hat x\,e^{+j\beta_1z}\ \text{V/m}$$
        Transmitted: $\tau$ times $-j6$, with $\beta_2$:
        $$\tilde{\mathbf E}_t = -j4.8\,\hat x\,e^{-j\beta_2z}\ \text{V/m}$$
        **Step 5: the H phasors.** Incident: $\hat z\times\hat x = \hat y$, and $-j6/(120\pi) = -j/(20\pi)$:
        $$\tilde{\mathbf H}_i = -\frac{j}{20\pi}\,\hat y\,e^{-j\beta_1z}\ \text{A/m}$$
        Reflected: $\hat k = -\hat z$ and $(-\hat z)\times\hat x = -\hat y$. The size is $1.2/(120\pi) = 1/(100\pi)$:
        $$\tilde{\mathbf H}_r = -\frac{j}{100\pi}\,\hat y\,e^{+j\beta_1z}\ \text{A/m}$$
        Transmitted: $-j4.8/(80\pi) = -j0.06/\pi = -j3/(50\pi)$:
        $$\tilde{\mathbf H}_t = -\frac{j3}{50\pi}\,\hat y\,e^{-j\beta_2z}\ \text{A/m}$$
        **Check at $z = 0$.** $E$: $-j6 + j1.2 = -j4.8$ ✓. $H$: $-\tfrac{j}{20\pi} - \tfrac{j}{100\pi} = -\tfrac{j6}{100\pi} = -\tfrac{j3}{50\pi}$ ✓.

        **Step 6: the powers.** $|E_0| = 6$:
        $$\langle S_i\rangle = \frac{36}{240\pi} = \frac{3}{20\pi} \approx 0.0477\ \text{W/m}^2$$
        along $+\hat z$. The reflected wave carries $|\Gamma|^2 = \tfrac1{25}$ of it, along $-\hat z$:
        $$\langle S_r\rangle = \frac{3}{500\pi} \approx 0.00191\ \text{W/m}^2$$
        The transmitted wave, along $+\hat z$:
        $$\langle S_t\rangle = \frac{4.8^2}{2(80\pi)} = \frac{0.144}{\pi} \approx 0.0458\ \text{W/m}^2$$
        Balance: $0.006/\pi + 0.144/\pi = 0.15/\pi = 3/(20\pi)$ ✓, which is $T = \tfrac{24}{25} = 1 - |\Gamma|^2$.

        **Step 7: reflectance in dB.**
        $$10\log_{10}\tfrac1{25} = -10\log_{10}25 \approx -14.0\ \text{dB}$$
        **Speed path.** $\Gamma = (1 - 1.5)/(1 + 1.5) = -\tfrac15$ in five seconds; $R = 4\%$, $T = 96\%$. Multiply $-j6$ by $\Gamma$ and $\tau$; flip the exponent for the reflected wave; divide by each medium's $\eta$ for $H$, with a minus sign for the reflected wave.

        **Where points go.** Dropping the $-j$ from the sine. Writing the reflected wave with $e^{-j\beta_1z}$. Giving $\tilde{\mathbf H}_r$ a $+\hat y$. Computing $\langle S_t\rangle$ with $\eta_1$. Writing $20\log_{10}|\Gamma|^2 \approx -28$ dB.

        ### Worked example 2: backward from the transmitted wave

        !!graded Problem
          Free space fills $y < 0$; a nonmagnetic perfect dielectric fills $y > 0$. A wave comes from $y < 0$, and the transmitted field is $\tilde{\mathbf E}_t = 8\,\hat z\,e^{-j10y}$ V/m at $\omega = 1.5\times10^9$ rad/s. Find $\epsilon_r$, $\Gamma$, $\tau$, and the incident and reflected $\mathbf E$ and $\mathbf H$. (The skill of Spring 2018 #2 and Summer 2017 #3.)

        **Step 1: free space.** $\beta_1 = \omega/c = (1.5\times10^9)/(3\times10^8) = 5$ rad/m, and $\eta_1 = 120\pi\ \Omega$.

        **Step 2: the dielectric.** Read $\beta_2 = 10$ rad/m from the exponent. Since $\beta_2 = n_2\omega/c = 5n_2$:
        $$n_2 = \frac{10}{5} = 2, \qquad \epsilon_r = n_2^2 = 4$$
        So $\eta_2 = 120\pi/2 = 60\pi\ \Omega$. (Or use the sheet's $\eta\gamma = j\omega\mu$: $\eta_2 = \omega\mu_0/\beta_2 = 600\pi/10 = 60\pi$ ✓.)

        **Step 3: Γ and τ.**
        $$\Gamma = \frac{60\pi - 120\pi}{60\pi + 120\pi} = -\frac{60}{180} = -\frac13$$
        and $\tau = \tfrac23$.

        **Step 4: the incident wave.** At the boundary $\tilde E_t(0) = \tau\tilde E_i(0)$, so $\tilde E_i(0) = 8/(2/3) = 12$ V/m, along $\hat z$:
        $$\tilde{\mathbf E}_i = 12\,\hat z\,e^{-j5y}\ \text{V/m}$$
        **Step 5: the reflected wave.** $\Gamma(12) = -4$, exponent flipped:
        $$\tilde{\mathbf E}_r = -4\,\hat z\,e^{+j5y}\ \text{V/m}$$
        **Step 6: the H fields.** Incident: $\hat k = \hat y$ and $\hat y\times\hat z = \hat x$; $12/(120\pi) = 1/(10\pi)$:
        $$\tilde{\mathbf H}_i = \frac{1}{10\pi}\,\hat x\,e^{-j5y}\ \text{A/m}$$
        Reflected: $\hat k = -\hat y$ and $(-\hat y)\times\hat z = -\hat x$. Times $-4/(120\pi)$, the two minus signs cancel:
        $$\tilde{\mathbf H}_r = \frac{1}{30\pi}\,\hat x\,e^{+j5y}\ \text{A/m}$$
        Transmitted, for the check: $8/(60\pi) = 2/(15\pi)$ along $\hat x$.

        **Check at $y = 0$.** $E$: $12 - 4 = 8$ ✓. $H$: $\tfrac1{10\pi} + \tfrac1{30\pi} = \tfrac4{30\pi} = \tfrac2{15\pi}$ ✓.

        **Speed path.** $\beta_2/\beta_1 = 2$ is $n_2$, so $\Gamma = (1 - 2)/(1 + 2) = -\tfrac13$ without ever writing $\eta$. Then $E_i = E_t/\tau = 12$ and $E_r = \Gamma E_i = -4$.

        **Where points go.** Using $\beta_2 = 10$ in the incident wave (region 1's is 5). Writing $E_i = \tau E_t$ instead of $E_t/\tau$. Swapping $\eta_1$ and $\eta_2$, which gives $\Gamma = +\tfrac13$.

        ### Worked example 3: a perfect conductor

        !!graded Problem
          A nonmagnetic dielectric with $\epsilon_r = 9$ fills $y > 0$; a perfect conductor fills $y < 0$. The incident wave is $\mathbf H_i = \hat z\,3\cos(\omega t + \beta_1y)$ A/m. Find $\tilde{\mathbf E}_i$, $\tilde{\mathbf E}_r$, $\tilde{\mathbf H}_r$ and the surface current $\mathbf J_s(t)$. (The skill HW 11 #3 asks for.)

        **Step 1: direction.** $\omega t + \beta_1y$ means the wave travels toward $-y$, toward the conductor ✓. So $\hat k = -\hat y$.

        **Step 2: impedance.** $\eta_1 = 120\pi/\sqrt9 = 40\pi\ \Omega$.

        **Step 3: the incident E.** In a plane wave $\mathbf E$, $\mathbf H$, $\hat k$ form a right-handed set, so $\tilde{\mathbf E} = \eta\,\tilde{\mathbf H}\times\hat k$. Here $\hat z\times(-\hat y) = \hat x$, and $\eta_1H_0 = (40\pi)(3) = 120\pi$:
        $$\tilde{\mathbf E}_i = 120\pi\,\hat x\,e^{+j\beta_1y}\ \text{V/m}$$
        Check: $\hat x\times\hat z = -\hat y$, the direction of travel ✓.

        **Step 4: the reflected E.** $\Gamma = -1$, exponent flipped:
        $$\tilde{\mathbf E}_r = -120\pi\,\hat x\,e^{-j\beta_1y}\ \text{V/m}$$
        **Step 5: the reflected H.** $\hat k = +\hat y$ and $\hat y\times(-\hat x) = \hat z$; the size is $120\pi/40\pi = 3$:
        $$\tilde{\mathbf H}_r = 3\,\hat z\,e^{-j\beta_1y}\ \text{A/m}$$
        At $y = 0$: total $E = 120\pi - 120\pi = 0$ ✓ and total $H = 6\hat z$, doubled ✓.

        **Step 6: the surface current.** $\hat n$ points out of the conductor, into region 1: $\hat n = +\hat y$. Then $\hat y\times6\hat z = 6\hat x$:
        $$\mathbf J_s(t) = 6\cos(\omega t)\,\hat x\ \text{A/m}$$
        Check with the shortcut: $2\tilde{\mathbf E}_i(0)/\eta_1 = 2(120\pi)/(40\pi)\,\hat x = 6\hat x$ ✓.

        **Speed path.** $|\mathbf J_s| = 2H_0 = 6$ A/m at once: the surface $H$ doubles, and $J_s$ equals it. The direction is the incident $\mathbf E$'s, $\hat x$.

        **Where points go.** $\hat n$ pointing into the conductor (sign flipped). Using $\eta_0$ for $\eta_1$. Keeping $e^{+j\beta_1y}$ in the reflected wave. Forgetting $\cos\omega t$ in $\mathbf J_s(t)$.

        ### Worked example 4: the push on a mirror

        !!graded Problem
          A wave in air with $E_0 = 120\pi$ V/m (so $H_0 = 1$ A/m) hits a perfect mirror at normal incidence. Find $\langle S_i\rangle$, the average pressure on the mirror, and the pressure on a perfect absorber in its place.

        **Step 1: the power density.**
        $$\langle S_i\rangle = \frac{(120\pi)^2}{2(120\pi)} = 60\pi \approx 188\ \text{W/m}^2$$
        **Step 2: the mirror.**
        $$\langle P\rangle = \frac{2(60\pi)}{3\times10^8} = 4\pi\times10^{-7}\ \text{Pa}$$
        about $1.26\ \mu$Pa. Check with the force form: $\mu_0H_0^2 = (4\pi\times10^{-7})(1)^2$ ✓.

        **Step 3: the absorber.** Half as much: $2\pi\times10^{-7} \approx 0.63\ \mu$Pa.

        **Speed path.** In any nonmagnetic medium, mirror pressure $= \mu_0H_0^2$ with $H_0$ the incident amplitude; an absorber feels half.

        ### Worked example 5: a real metal

        !!graded Problem
          A wave with $E_0 = 10$ V/m in air hits a metal with $\sigma = 5\times10^7$ S/m, whose skin depth at this frequency is $\delta = 2\ \mu$m. Find $R_s$, $\Gamma$ to first order, the absorbed fraction, and the absorbed power per square meter.

        **Step 1: surface resistance.**
        $$R_s = \frac{1}{\sigma\delta} = \frac{1}{(5\times10^7)(2\times10^{-6})} = 0.01\ \Omega$$
        **Step 2: Γ.** $\eta_2 = (1 + j)(0.01)\ \Omega$, so $2\eta_2/\eta_0 = (0.02 + j0.02)/(120\pi) \approx (5.3 + j5.3)\times10^{-5}$:
        $$\Gamma \approx -1 + (5.3 + j5.3)\times10^{-5}$$
        **Step 3: absorbed fraction.**
        $$\frac{4R_s}{\eta_0} = \frac{0.04}{120\pi} = \frac{1}{3000\pi} \approx 1.06\times10^{-4}$$
        **Step 4: absorbed power.** $\langle S_i\rangle = 100/(240\pi) \approx 0.133$ W/m², so the metal absorbs about
        $$(1.06\times10^{-4})(0.133) \approx 1.41\times10^{-5}\ \text{W/m}^2$$
        Check with the current: $|J_s| = 2E_0/\eta_0 = 1/(6\pi) \approx 0.0531$ A/m and $\tfrac12R_s|J_s|^2 = 0.005(0.0531)^2 \approx 1.41\times10^{-5}$ W/m² ✓.

        ### The whole topic on one table

        | Quantity | Result | Where it came from |
        |---|---|---|
        | $\Gamma$ | $(\eta_2 - \eta_1)/(\eta_2 + \eta_1) = (n_1 - n_2)/(n_1 + n_2)$ | tangential $E$ and $H$ continuous |
        | $\tau$ | $1 + \Gamma = 2\eta_2/(\eta_2 + \eta_1)$ | tangential $E$ continuous |
        | $H$ reflection | $-\Gamma$ | the reflected wave travels backward |
        | Power | $R = |\Gamma|^2$, $T = 1 - |\Gamma|^2$ | (1) times (2) |
        | Perfect conductor | $\Gamma = -1$, $\tau = 0$, $\mathbf J_s = 2\tilde{\mathbf E}_i(0)/\eta_1$ | $\eta_2 = 0$, $\mathbf J_s = \hat n\times\mathbf H_1$ |
        | Pressure | mirror $2\langle S\rangle/c$, absorber $\langle S\rangle/c$ | $\mathbf J\times\mathbf B$, or momentum |
        | Good conductor | $\Gamma \approx -1 + 2\eta_2/\eta_1$, absorbs $4R_s/\eta_1$ | $\eta_2 = (1 + j)R_s$ is tiny |
        | Handedness | reflected flips, transmitted keeps | travel reverses, turning does not |

        !!mistake Common mistakes
          - **Swapping $\eta_1$ and $\eta_2$.** $\eta_1$ is the side the wave comes from. Swapping flips the sign of $\Gamma$.
          - **Using $\epsilon_r$ for $n$.** $\Gamma = (n_1 - n_2)/(n_1 + n_2)$ with $n = \sqrt{\epsilon_r}$.
          - **Forgetting to flip the exponent** of the reflected wave. It travels the other way.
          - **Giving $\tilde{\mathbf H}_r$ the sign of $\Gamma\tilde{\mathbf E}$.** The $H$ coefficient is $-\Gamma$; derive it from $\hat k\times\tilde{\mathbf E}$.
          - **$T = \tau^2$.** It needs $\eta_1/\eta_2$; better, use $1 - |\Gamma|^2$.
          - **$\tau = 1 - \Gamma$.** It is $1 + \Gamma$.
          - **"$\tau > 1$ creates energy."** The transmitted $H$ is smaller; the power still balances.
          - **$\hat n$ into the conductor** in $\mathbf J_s = \hat n\times\mathbf H$. It points out of the conductor.
          - **$\langle S\rangle/c$ for a mirror.** A mirror reverses the momentum: $2\langle S\rangle/c$.
          - **Keeping the hand on reflection.** RHC reflects as LHC.

        !!key Speed tricks
          - **Index form.** $\Gamma = (n_1 - n_2)/(n_1 + n_2)$. From air: into $\epsilon_r = 2.25$, $-\tfrac15$; into 4, $-\tfrac13$; into 9, $-\tfrac12$; into 16, $-\tfrac35$. Out of glass into air, the same numbers with $+$.
          - **Sign at a glance.** Into a denser medium $\Gamma < 0$: the reflected $E$ flips at the boundary, the reflected $H$ does not.
          - **Power.** $R = |\Gamma|^2$, $T = 1 - |\Gamma|^2$. Never square $\tau$ unless asked.
          - **Backward problems.** $E_i = E_t/\tau$ and $E_r = \Gamma E_t/\tau$. The ratio $\beta_2/\beta_1$ is $n_2/n_1$.
          - **Mirror.** $\mathbf J_s = 2\tilde{\mathbf E}_i(0)/\eta_1$, along the incident $E$; its size is $2H_0$.
          - **Pressure.** Mirror $2\langle S\rangle/c = \mu_0H_0^2$; absorber half; a beam of power $P_b$ pushes with $2P_b/c$ or $P_b/c$.
          - **Metal.** Absorbs $4R_s/\eta_1$ of the power, with $R_s = 1/(\sigma\delta)$.

        ### Check questions
      `),
      Q(md`Region 2 is made of exactly the same material as region 1. Which is true?`,
        [md`$\Gamma = 0$ and $\tau = 1$: there is no boundary as far as the wave can tell`, md`$\Gamma = 1$ and $\tau = 0$`, md`$\Gamma = 0$ and $\tau = 0$`, md`$\Gamma = -1$ and $\tau = 2$`], 0,
        [null, md`$\Gamma = 1$ needs $\eta_2\to\infty$, not $\eta_2 = \eta_1$.`, md`$\tau = 1 + \Gamma = 1$. A wave cannot just vanish.`, md`$\tau = 1 + \Gamma$, so $\Gamma = -1$ goes with $\tau = 0$.`],
        md`$\eta_2 = \eta_1$ makes the top of $\Gamma$ zero, and $\tau = 1 + 0 = 1$. This is the "matched" case.`),
      Q(md`A wave in air hits a nonmagnetic dielectric with $\epsilon_r = 16$. What fraction of the incident power enters the dielectric?`,
        ['64%', '36%', '40%', '16%'], 0,
        [null, md`That is the reflected fraction, $|\Gamma|^2 = \tfrac{9}{25}$.`, md`That is $\tau = \tfrac25$, a field ratio.`, md`That is $\tau^2$ without the factor $\eta_1/\eta_2 = 4$.`],
        md`$\Gamma = (1 - 4)/(1 + 4) = -\tfrac35$, so $T = 1 - \tfrac9{25} = \tfrac{16}{25} = 64\%$. The long way: $(\eta_1/\eta_2)\tau^2 = 4\cdot\tfrac{4}{25}$ ✓.`),
      Q(md`Summer 2017 #3: a wave goes from a dielectric with $\epsilon_r = 9/4$ into vacuum, and the transmitted field has amplitude 6 V/m. The incident and reflected amplitudes are…`,
        ['5 V/m and 1 V/m', '7.2 V/m and 1.2 V/m', '7.5 V/m and −1.5 V/m', '6 V/m and 1.2 V/m'], 0,
        [null, md`That multiplies by $\tau$ instead of dividing: $E_t = \tau E_i$, so $E_i = E_t/\tau$.`, md`That uses $\Gamma = -\tfrac15$, the air-into-dielectric value. Here the wave leaves the dielectric: $\Gamma = +\tfrac15$, $\tau = \tfrac65$.`, md`The transmitted field is not the incident field; $\tau \neq 1$ here.`],
        md`$\Gamma = (1.5 - 1)/(1.5 + 1) = \tfrac15$, $\tau = \tfrac65$. So $E_i = 6/(6/5) = 5$ V/m and $E_r = \tfrac15(5) = 1$ V/m. $\tau > 1$ here, and the power still balances: $T = 1 - \tfrac1{25}$.`, { src: 'Summer 2017 #3(c)(d)' }),
      Q(md`Spring 2018 #2: free space for $y < 0$, a nonmagnetic dielectric for $y > 0$, and $\tilde{\mathbf E}_t = 10e^{-j12y}\hat z$ V/m at $\omega = 3\times10^9$ rad/s. The incident amplitude is…`,
        ['11 V/m', '9.09 V/m', '12 V/m', '10 V/m'], 0,
        [null, md`That is $\tau E_t$. Divide instead: $E_i = E_t/\tau$.`, md`That is $10\times1.2$, scaling by $n_2$. The field ratio is $\tau$, not $n$.`, md`That forgets the boundary: $\tau = \tfrac{10}{11}$, not 1.`],
        md`$\beta_1 = \omega/c = 10$ rad/m, so $n_2 = 12/10 = 1.2$ and $\eta_2 = 100\pi\ \Omega$. $\Gamma = (100 - 120)/(100 + 120) = -\tfrac1{11}$, $\tau = \tfrac{10}{11}$, and $E_i = 10/(10/11) = 11$ V/m. The reflected field is $-1\cdot\hat z\,e^{+j10y}$ V/m.`, { src: 'Spring 2018 #2(d)(e)' }),
      Q(md`A surface reflects with $|\Gamma| = 0.1$. Its reflectance in dB is…`,
        ['−20 dB', '−10 dB', '−40 dB', '+20 dB'], 0,
        [null, md`That is $10\log_{10}|\Gamma|$. The reflectance is $|\Gamma|^2$: $10\log_{10}(0.01)$.`, md`That is $20\log_{10}|\Gamma|^2$, squaring twice.`, md`A fraction smaller than 1 has a negative dB value.`],
        md`$10\log_{10}|\Gamma|^2 = 10\log_{10}0.01 = -20$ dB. One percent of the power comes back.`),
      Q(md`A wave in air with $E_0 = 60\pi$ V/m hits a perfect conductor. The size of the surface current is…`,
        ['1 A/m', '0.5 A/m', '2 A/m', '0'], 0,
        [null, md`That is the incident $H$, $E_0/\eta_0$. The total $H$ at the wall, and the current, is twice that.`, md`That doubles twice. $|\mathbf J_s| = 2E_0/\eta_0 = 120\pi/120\pi$.`, md`Zero is the surface current on a dielectric boundary. A perfect conductor carries one.`],
        md`$|\mathbf J_s| = 2E_0/\eta_0 = 2(60\pi)/(120\pi) = 1$ A/m, along the incident $\mathbf E$.`),
      Q(md`The same light beam hits a perfect mirror and then a perfect absorber. The ratio of the pressures (mirror : absorber) is…`,
        ['2 : 1', '1 : 1', '1 : 2', '4 : 1'], 0,
        [null, md`The mirror reverses the momentum, which doubles the change.`, md`That is backward: absorbing takes the momentum, reflecting reverses it.`, md`That squares the factor 2. Pressure is linear in the momentum change.`],
        md`Absorber: $\langle S\rangle/c$. Mirror: $2\langle S\rangle/c$. Equivalently the mirror's surface $H$ doubles, and $\tfrac12\mu_0H_s^2$ averages to $\mu_0H_0^2$.`),
      Q(md`Which statement about a wave going from glass into air is true?`,
        [md`$\tau > 1$, yet the transmitted power is less than the incident power`, md`$\tau > 1$, so the transmitted wave carries more power than the incident wave`, md`$\tau < 1$, because a wave always loses field at a boundary`, md`$\Gamma < 0$, because the wave reflects`], 0,
        [null, md`Power needs $H$ too, and the transmitted $H$ is $(1 - \Gamma)$ times the incident $H$, which is smaller.`, md`Out of a denser medium $\Gamma > 0$, so $\tau = 1 + \Gamma > 1$.`, md`From glass into air $\Gamma = (n_1 - n_2)/(n_1 + n_2) > 0$.`],
        md`$n_1 > n_2$ gives $\Gamma > 0$ and $\tau > 1$. $T = 1 - |\Gamma|^2 < 1$: the bigger $E$ sits in a bigger $\eta$.`),
      R(md`
        ### Practice, level 1: Γ and τ in one move

        **The trick:** for nonmagnetic dielectrics, $\Gamma = (n_1 - n_2)/(n_1 + n_2)$ with $n = \sqrt{\epsilon_r}$; region 1 is where the wave comes from; $\tau = 1 + \Gamma$; the $H$ coefficient is $-\Gamma$. Eight right completes a card.
      `),
      Object.assign(G('rf_w4_coef', { need: 8 }), { id: 'w4-gamma.r0' }),
      R(md`
        ### Practice, level 1: where the power goes

        **The trick:** $R = |\Gamma|^2$, $T = 1 - |\Gamma|^2$; each wave carries $|E|^2/2\eta$ in its own medium; dB is $20\log_{10}|\Gamma|$.
      `),
      Object.assign(G('rf_w4_power', { need: 8 }), { id: 'w4-gamma.r1' }),
      R(md`
        ### Practice, level 1: mirrors, pressure, metals, hands

        **The trick:** $\mathbf J_s = 2\tilde{\mathbf E}_i(0)/\eta_1$; mirror pressure $2\langle S\rangle/c$, absorber $\langle S\rangle/c$; a metal absorbs $4R_s/\eta_1$; reflection flips the hand.
      `),
      Object.assign(G('rf_w4_pec', { need: 8 }), { id: 'w4-gamma.r2' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. The axes and directions change too. Two correct answers without opening the solution complete each one.
      `),
      G('w4_fields', { need: 2 }),
      G('w4_back', { need: 2 }),
      G('w4_pecjs', { need: 2 }),
      G('w4_metal', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A Spring 2018 / Summer 2017 style problem: the transmitted field is given, and you rebuild everything.
      `),
      G('w4_exam', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- Topic 11, level 1: coefficients
  GENS.rf_w4_coef = () => one([
    () => {
      const [m1, m2] = two(), n1 = m1.n, n2 = m2.n, Gm = G12(n1, n2), e1 = n1 * n1, e2 = n2 * n2;
      return MC('Γ from two dielectrics', md`A wave in ${medTex(m1)} hits ${medTex(m2)} at normal incidence (both nonmagnetic). $\Gamma$ is…`, `$${fr(Gm)}$`,
        [[`$${fr(-Gm)}$`, md`That swaps the regions. Region 1 is where the wave comes from: $\Gamma = (n_1 - n_2)/(n_1 + n_2)$.`],
          [`$${fr((e1 - e2) / (e1 + e2))}$`, md`That uses $\epsilon_r$ where $n = \sqrt{\epsilon_r}$ belongs; $\eta$ goes as $1/\sqrt{\epsilon_r}$.`],
          [`$${fr(2 * n1 / (n1 + n2))}$`, md`That is $\tau = 1 + \Gamma$, the transmission coefficient.`],
          [`$${fr((n1 - n2) / n2)}$`, md`That divides by $\eta_1$ alone. The bottom is the sum $\eta_1 + \eta_2$.`]],
        md`$n_1 = ${p(n1)}$, $n_2 = ${p(n2)}$: $\Gamma = \dfrac{${p(n1)} - ${p(n2)}}{${p(n1)} + ${p(n2)}} = ${fr(Gm)}$.`);
    },
    () => {
      const [m1, m2] = two(), n1 = m1.n, n2 = m2.n, Gm = G12(n1, n2), t = 1 + Gm;
      return MC('τ from two dielectrics', md`A wave in ${medTex(m1)} hits ${medTex(m2)} (both nonmagnetic). The transmission coefficient $\tau$ is…`, `$${fr(t)}$`,
        [[`$${fr(1 - Gm)}$`, md`That is $1 - \Gamma$ (or $2\eta_1$ on top). $\tau = 1 + \Gamma = 2\eta_2/(\eta_1 + \eta_2)$.`],
          [`$${fr(Gm)}$`, md`That is $\Gamma$ itself.`],
          [`$${fr(n1 / n2)}$`, md`That is the ratio $\eta_2/\eta_1$ alone. $\tau = 2\eta_2/(\eta_1 + \eta_2)$.`],
          [`$${fr(1 - Gm * Gm)}$`, md`That is the transmitted power fraction $1 - \Gamma^2$, not a field ratio.`]],
        md`$\Gamma = ${fr(Gm)}$, so $\tau = 1 + \Gamma = ${fr(t)}$, which is $2n_1/(n_1 + n_2)$.`);
    },
    () => {
      const k = pick([0.25, 1 / 3, 0.5, 2, 3, 4]), Gm = (k - 1) / (k + 1);
      return MC('Γ from the impedances', md`Region 2 has $\eta_2 = ${fr(k)}\,\eta_1$. $\Gamma$ is…`, `$${fr(Gm)}$`,
        [[`$${fr(-Gm)}$`, md`That puts $\eta_1 - \eta_2$ on top: the regions are swapped.`],
          [`$${fr(2 * k / (k + 1))}$`, md`That is $\tau = 2\eta_2/(\eta_1 + \eta_2)$.`],
          [`$${fr((k - 1) / k)}$`, md`That divides by $\eta_2$ alone. The bottom is $\eta_2 + \eta_1$.`],
          [`$${fr(k - 1)}$`, md`That leaves out the denominator: $\eta_2 - \eta_1$ must be divided by $\eta_2 + \eta_1$.`]],
        md`Divide the top and bottom by $\eta_1$: $\Gamma = (${fr(k)} - 1)/(${fr(k)} + 1) = ${fr(Gm)}$.`);
    },
    () => {
      const m = pick(ER.slice(1)), Gm = G12(1, m.n);
      return MC('The medium from Γ', md`A wave in air reflects from a nonmagnetic dielectric with $\Gamma = ${fr(Gm)}$. The dielectric's $\epsilon_r$ is…`, `$${m.er}$`,
        [[`$${p(m.n)}$`, md`That is $n = (1 - \Gamma)/(1 + \Gamma)$. Square it: $\epsilon_r = n^2$.`],
          [`$${fr(1 / m.n)}$`, md`That is $\eta_2/\eta_1 = (1 + \Gamma)/(1 - \Gamma)$. Then $\epsilon_r = (\eta_1/\eta_2)^2$.`],
          [`$${fr(1 / (m.n * m.n))}$`, md`That is upside down. $\Gamma < 0$ means a denser medium, so $\epsilon_r > 1$.`]],
        md`$\Gamma = (1 - n)/(1 + n)$ gives $n = (1 - \Gamma)/(1 + \Gamma) = ${p(m.n)}$, so $\epsilon_r = ${m.er}$.`);
    },
    () => {
      const [m1, m2] = two(), Gm = G12(m1.n, m2.n), tot = pick([true, false]);
      const right = tot ? 1 - Gm : -Gm;
      return MC(tot ? 'Total H at the boundary' : 'The H coefficient', md`A wave in ${medTex(m1)} hits ${medTex(m2)}. At the boundary, ${tot ? 'the **total** $H$ in region 1' : 'the **reflected** $H$'} divided by the incident $H$ (same axis, signed) is…`, `$${fr(right)}$`,
        [[`$${fr(tot ? 1 + Gm : Gm)}$`, md`That is the ratio for $E$. The reflected $H$ enters with $-\Gamma$, because the reflected wave travels backward.`],
          [`$${fr(tot ? -Gm : 1 - Gm)}$`, md`${tot ? md`That is the reflected $H$ alone. The total adds the incident $H$: $1 - \Gamma$.` : md`That is the total $H$, incident plus reflected. The reflected part alone is $-\Gamma$.`}`],
          [`$${fr(tot ? 1 : Gm * Gm)}$`, md`${tot ? md`That ignores the reflected wave.` : md`That is a power ratio, $|\Gamma|^2$, not a field ratio.`}`],
          [`$${fr(tot ? (m1.n / m2.n) * (1 + Gm) : -(1 + Gm))}$`, md`${tot ? md`That multiplies $\tau$ by $\eta_2/\eta_1$. The $H$ ratio is $\tau\,\eta_1/\eta_2$, which is $1 - \Gamma$.` : md`That is $-\tau$; the reflected $H$ is $-\Gamma$ times the incident $H$.`}`]],
        md`$\Gamma = ${fr(Gm)}$. The reflected $H$ is $-\Gamma$ times the incident $H$${tot ? md`, so the total is $1 - \Gamma = ${fr(right)}$` : md`: $${fr(right)}$`}.`);
    },
    () => {
      const [m1, m2] = two(), Gm = G12(m1.n, m2.n);
      const R0 = Gm < 0 ? 'points against the incident $E$ ($\\Gamma < 0$)' : 'points along the incident $E$ ($\\Gamma > 0$)';
      const R1 = Gm < 0 ? 'points along the incident $E$ ($\\Gamma > 0$)' : 'points against the incident $E$ ($\\Gamma < 0$)';
      return MC('Sign at a glance', md`A wave goes from ${medTex(m1)} into ${medTex(m2)}. At the boundary, the reflected $E$…`, R0,
        [[R1, md`$\Gamma = (n_1 - n_2)/(n_1 + n_2)$: ${Gm < 0 ? 'into a denser medium the top is negative' : 'into a thinner medium the top is positive'}.`],
          ['is zero, since only a conductor reflects', md`Any change of $\eta$ reflects; here $\Gamma = ${fr(Gm)}$.`],
          ['is perpendicular to the incident $E$', md`$\Gamma$ is a number that multiplies the incident vector, so the reflected $E$ is along the same axis.`]],
        md`$n_1 = ${p(m1.n)}$, $n_2 = ${p(m2.n)}$, $\Gamma = ${fr(Gm)}$. ${Gm < 0 ? 'Into a denser medium the reflected E flips.' : 'Into a thinner medium the reflected E stays upright.'}`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 11, level 1: power
  GENS.rf_w4_power = () => one([
    () => {
      const [m1, m2] = two(), Gm = G12(m1.n, m2.n), t = 1 + Gm;
      return MC('Reflected fraction', md`A wave in ${medTex(m1)} hits ${medTex(m2)}. The fraction of the incident power that reflects is…`, `$${fr(Gm * Gm)}$`,
        [[`$${fr(Math.abs(Gm))}$`, md`That is $|\Gamma|$, a ratio of fields. Power goes as the square.`],
          [`$${fr(1 - Gm * Gm)}$`, md`That is the transmitted fraction.`],
          [`$${fr(t * t)}$`, md`That is $\tau^2$, which is not a power fraction of anything.`]],
        md`$\Gamma = ${fr(Gm)}$, so $R = |\Gamma|^2 = ${fr(Gm * Gm)}$.`);
    },
    () => {
      const [m1, m2] = two(), Gm = G12(m1.n, m2.n), t = 1 + Gm;
      return MC('Transmitted fraction', md`A wave in ${medTex(m1)} hits ${medTex(m2)}. The fraction of the incident power that is transmitted is…`, `$${fr(1 - Gm * Gm)}$`,
        [[`$${fr(t * t)}$`, md`That is $\tau^2$ without the factor $\eta_1/\eta_2$.`],
          [`$${fr(t)}$`, md`That is $\tau$, a field ratio.`],
          [`$${fr(Gm * Gm)}$`, md`That is the reflected fraction.`],
          [`$${fr(1 - Math.abs(Gm))}$`, md`That is $1 - |\Gamma|$. Power needs $1 - |\Gamma|^2$.`]],
        md`$\Gamma = ${fr(Gm)}$: $T = 1 - ${fr(Gm * Gm)} = ${fr(1 - Gm * Gm)}$. Check: $(\eta_1/\eta_2)\tau^2 = ${fr(m2.n / m1.n)}\cdot${fr(t * t)}$ ✓.`);
    },
    () => {
      const [g, tex] = pick([[0.1, '0.1'], [0.01, '0.01'], [0.5, '\\tfrac12'], [1 / 3, '\\tfrac13'], [0.2, '\\tfrac15'], [Math.sqrt(0.1), '1/\\sqrt{10}']]);
      const dB = 20 * Math.log10(g);
      return MC('Reflectance in dB', md`$|\Gamma| = ${tex}$. The reflectance $|\Gamma|^2$ in dB is…`, `$${f(dB)}$ dB`,
        [[`$${f(dB / 2)}$ dB`, md`That is $10\log_{10}|\Gamma|$. The reflectance is $|\Gamma|^2$, so use $20\log_{10}|\Gamma|$.`],
          [`$${f(2 * dB)}$ dB`, md`That squares twice: $20\log_{10}|\Gamma|^2$.`],
          [`$+${f(-dB)}$ dB`, md`A fraction below 1 has a negative dB value.`]],
        md`$10\log_{10}|\Gamma|^2 = 20\log_{10}(${tex}) = ${f(dB)}$ dB.`);
    },
    () => {
      const [m1, m2] = two(), Gm = G12(m1.n, m2.n), S0 = pick([2, 5, 10, 18, 45, 90]), ask = pick(['r', 't']);
      const v = ask === 'r' ? Gm * Gm * S0 : (1 - Gm * Gm) * S0, o = ask === 'r' ? (1 - Gm * Gm) * S0 : Gm * Gm * S0;
      return MC('Power densities', md`A wave in ${medTex(m1)} with $\langle S_i\rangle = ${S0}$ W/m² hits ${medTex(m2)}. The ${ask === 'r' ? 'reflected' : 'transmitted'} power density is…`, `$${f(v)}$ W/m²`,
        [[`$${f(o)}$ W/m²`, md`That is the ${ask === 'r' ? 'transmitted' : 'reflected'} wave.`],
          [`$${f((ask === 'r' ? Math.abs(Gm) : 1 + Gm) * S0)}$ W/m²`, md`That multiplies by ${ask === 'r' ? '$|\\Gamma|$' : '$\\tau$'}, a field ratio. Power needs ${ask === 'r' ? '$|\\Gamma|^2$' : '$1 - |\\Gamma|^2$'}.`],
          [`$${f(S0)}$ W/m²`, md`That ignores the boundary; $\Gamma = ${fr(Gm)}$ here.`]],
        md`$\Gamma = ${fr(Gm)}$, $|\Gamma|^2 = ${fr(Gm * Gm)}$. ${ask === 'r' ? md`$\langle S_r\rangle = ${fr(Gm * Gm)}(${S0})$` : md`$\langle S_t\rangle = (1 - ${fr(Gm * Gm)})(${S0})$`} $= ${f(v)}$ W/m².`);
    },
    () => {
      const m = pick(ER.slice(0, 5)), E0 = pick([6, 10, 12, 20, 30]), eta = ETA0 / m.n, S = E0 * E0 / (2 * eta);
      return MC('Power of one wave', md`A wave of amplitude $${E0}$ V/m travels in ${medTex(m)} ($\mu = \mu_0$). Its $\langle S\rangle$ is…`, `$${f(S)}$ W/m²`,
        [[`$${f(2 * S)}$ W/m²`, md`That leaves out the $\tfrac12$ of the time average.`],
          [`$${f(S / m.n)}$ W/m²`, md`That multiplies $\eta$ by $n$. In a dielectric $\eta = \eta_0/n$, smaller.`],
          [`$${f(E0 / (2 * eta))}$ W/m²`, md`That forgets to square $E_0$.`]].concat(m.n === 1 ? [] : [[`$${f(E0 * E0 / (2 * ETA0))}$ W/m²`, md`That uses $\eta_0$. In this dielectric $\eta = \eta_0/${p(m.n)}$.`]]),
        md`$\eta = ${etaTex(m.n)}\ \Omega$, so $\langle S\rangle = ${E0}^2/(2\eta) = ${f(S)}$ W/m².`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 11, level 1: mirrors, pressure, metals, hands
  GENS.rf_w4_pec = () => one([
    () => {
      const m = pick(ER.filter((x) => [1, 2, 3, 4].includes(x.n))), k = pick([1, 2, 4]), E0 = 30 * k;
      const Js = 2 * E0 * m.n / 120;
      return MC('Surface current size', md`A wave with $E_0 = ${E0}\pi$ V/m in ${medTex(m)} ($\mu = \mu_0$) hits a perfect conductor. $|\mathbf J_s|$ is…`, `$${p(Js)}$ A/m`,
        [[`$${p(Js / 2)}$ A/m`, md`That is the incident $H$, $E_0/\eta_1$. The surface $H$ doubles, and $J_s$ equals it.`],
          [`$${p(2 * E0 / 120)}$ A/m`, md`That uses $\eta_0$. The wave is in a medium with $\eta_1 = \eta_0/${p(m.n)}$.`],
          ['$0$', md`Zero is right for a dielectric boundary. A perfect conductor carries a surface current.`],
          [`$${p(2 * Js)}$ A/m`, md`That doubles twice. $|\mathbf J_s| = 2E_0/\eta_1$.`]],
        md`$\eta_1 = ${etaTex(m.n)}\ \Omega$; $|\mathbf J_s| = 2E_0/\eta_1 = 2(${E0}\pi)/(${etaTex(m.n)}) = ${p(Js)}$ A/m.`);
    },
    () => {
      const g = geom();
      const Ei = `\\tilde{\\mathbf E}_i = ${hat0(g.a)}\\,E_0e^{${g.sg}j\\beta_1${g.U}}`;
      return MC('Surface current direction', md`In the region $${g.reg1}$, a wave $${Ei}$ travels toward a perfect conductor that fills $${g.reg2}$. $\tilde{\mathbf J}_s$ points along…`, `$${hat(g.a)}$`,
        [[`$${hat(g.a, -1)}$`, md`That uses $\hat n$ pointing into the conductor. It must point out of it, into the region with the fields.`],
          [`$${hat(g.h, g.sh)}$`, md`That is the direction of $\mathbf H$ at the surface. $\mathbf J_s = \hat n\times\mathbf H$ is perpendicular to $\mathbf H$.`],
          [`$${hat(g.u, -g.s)}$`, md`That is the normal to the surface. A surface current flows along the surface.`]],
        md`$\tilde{\mathbf J}_s = 2\tilde{\mathbf E}_i(0)/\eta_1$, along the incident $\mathbf E$ at the surface: $${hat(g.a)}$. Long way: $\hat n = ${hat(g.u, -g.s)}$, $\mathbf H$ at the surface is along $${hat(g.h, g.sh)}$, and $\hat n\times\mathbf H$ is along $${hat(g.a)}$.`);
    },
    () => {
      const S = pick([150, 300, 600, 900, 1500]), kind = pick(['mirror', 'absorber', 'half']);
      const fac = kind === 'mirror' ? 2 : kind === 'absorber' ? 1 : 1.25;
      const v = fac * S / C0;
      const desc = kind === 'mirror' ? 'a perfect mirror' : kind === 'absorber' ? 'a perfect black absorber' : 'a surface that reflects 25% of the power and absorbs the rest';
      return MC('Radiation pressure', md`A wave with $\langle S\rangle = ${S}$ W/m² in air hits ${desc} at normal incidence. The average pressure is…`, `$${f(v)}$ Pa`,
        [[`$${f((kind === 'mirror' ? 1 : 2) * S / C0)}$ Pa`, md`${kind === 'mirror' ? 'That is an absorber. A mirror reverses the momentum: 2⟨S⟩/c.' : kind === 'absorber' ? 'That is a mirror. An absorber only stops the momentum: ⟨S⟩/c.' : 'That is a full mirror. Only 25% reverses: (1 + 0.25)⟨S⟩/c.'}`],
          [`$${f(fac * S / (C0 * C0))}$ Pa`, md`That divides by $c^2$: $\langle S\rangle/c^2$ is the momentum per cubic meter, not the pressure.`],
          [`$${f(kind === 'half' ? 0.75 * S / C0 : fac * S / C0 / 2)}$ Pa`, md`${kind === 'half' ? 'That uses (1 − |Γ|²): the reflected part adds to the push, it does not subtract.' : 'That halves the answer again. The cos² average is already inside ⟨S⟩.'}`]],
        md`${kind === 'mirror' ? md`$2\langle S\rangle/c = 2(${S})/(3\times10^8)$` : kind === 'absorber' ? md`$\langle S\rangle/c = ${S}/(3\times10^8)$` : md`$(1 + |\Gamma|^2)\langle S\rangle/c = 1.25(${S})/(3\times10^8)$`} $= ${f(v)}$ Pa.`);
    },
    () => {
      const P = pick([0.3, 1.5, 3, 6, 15, 30]), mir = pick([true, false]), F = (mir ? 2 : 1) * P / C0;
      return MC('Force of a beam', md`A ${p(P)} W laser beam hits ${mir ? 'a perfect mirror' : 'a black absorber'} at normal incidence. The force on it is…`, `$${f(F)}$ N`,
        [[`$${f((mir ? 1 : 2) * P / C0)}$ N`, md`${mir ? 'That is P/c, for an absorber. The mirror reverses the momentum: 2P/c.' : 'That is 2P/c, for a mirror. An absorber takes P/c.'}`],
          [`$${f((mir ? 2 : 1) * P / (C0 * C0))}$ N`, md`That divides by $c^2$. Force is momentum per second, $P/c$.`],
          [`$${f((mir ? 2 : 1) * P / C0 / 2)}$ N`, md`That puts in an extra $\tfrac12$. The beam power is already a time average, so no further $\langle\cos^2\rangle$ is needed.`],
          [`$${f((mir ? 2 : 1) * P * C0)}$ N`, md`That multiplies by $c$. Momentum per second is the power divided by $c$.`]],
        md`${mir ? '$F = 2P/c$' : '$F = P/c$'} $= ${mir ? 2 : 1}(${p(P)})/(3\times10^8) = ${f(F)}$ N, whatever the spot size.`);
    },
    () => {
      const [Rs, tex] = pick([[0.03 * PI, '0.03\\pi'], [0.003 * PI, '0.003\\pi'], [0.06 * PI, '0.06\\pi'], [0.015 * PI, '0.015\\pi'], [0.012 * PI, '0.012\\pi']]);
      const fr4 = 4 * Rs / ETA0;
      return MC('A metal absorbs a little', md`A wave in air hits a good conductor with $R_s = ${tex}\ \Omega$. The fraction of the power it absorbs is about…`, `$${f(fr4)}$`,
        [[`$${f(2 * Rs / ETA0)}$`, md`That is $2R_s/\eta_0$. $|\Gamma|^2 \approx 1 - 4R_s/\eta_0$: the factor is 4.`],
          [`$${f(4 * Math.SQRT2 * Rs / ETA0)}$`, md`That uses $|\eta_2| = \sqrt2R_s$. Only the real part of $\eta_2$, $R_s$, absorbs.`],
          [`$${f(1 - fr4)}$`, md`That is the reflected fraction.`],
          [`$${f(Rs / ETA0)}$`, md`That is $R_s/\eta_0$, missing the factor 4.`]],
        md`$1 - |\Gamma|^2 \approx 4R_s/\eta_0 = 4(${tex})/(120\pi) = ${f(fr4)}$.`);
    },
    () => {
      const inc = pick(['right', 'left']), what = pick(['reflected', 'transmitted']);
      const other = inc === 'right' ? 'left' : 'right';
      const right = what === 'reflected' ? `${other}-hand circular` : `${inc}-hand circular`;
      const wrong = what === 'reflected' ? `${inc}-hand circular` : `${other}-hand circular`;
      return MC('Which hand after the boundary?', md`A ${inc}-hand circularly polarized wave hits a dielectric boundary at normal incidence (real $\Gamma \neq 0$). The **${what}** wave is…`, right,
        [[wrong, what === 'reflected' ? md`The turning in a fixed plane is unchanged, but the travel reversed, so the hand flips.` : md`The transmitted wave keeps its direction and its turning, so it keeps its hand.`],
          ['linearly polarized', md`$${what === 'reflected' ? '\\Gamma' : '\\tau'}$ multiplies both components by the same number, so the $90°$ between them survives.`],
          ['elliptically polarized', md`Both components are scaled by the same factor, so the circle only changes size.`]],
        what === 'reflected' ? md`Reflection: same turning, opposite travel, so the hand flips: ${right}.` : md`Transmission: same turning, same travel: ${right}.`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 11, level 2
  GENS.w4_fields = () => {
    const g = geom(), [m1, m2] = two(), n1 = m1.n, n2 = m2.n, E0 = pick([6, 10, 12, 15, 20, 30]);
    const eta1 = ETA0 / n1, eta2 = ETA0 / n2, Gm = G12(n1, n2), tau = 1 + Gm;
    const Er = Gm * E0, Hr = -Gm * E0 / eta1, Ht = tau * E0 / eta2, St = (tau * E0) ** 2 / (2 * eta2);
    const A = hat0(g.a), Hd = hat0(g.h, g.sh);
    return {
      title: 'All the fields from the incident wave',
      q: md`Region 1, $${g.reg1}$, is ${medTex(m1)}; region 2, $${g.reg2}$, is ${medTex(m2)}; both have $\mu = \mu_0$. The incident wave is $\mathbf E_i = ${A}\,${E0}\cos(\omega t ${g.sg} \beta_1${g.U})$ V/m, so its $\mathbf H$ is along $${Hd}$. Give each field as a **signed** coefficient at the boundary: $\mathbf E$ along $${A}$, $\mathbf H$ along $${Hd}$.`,
      parts: [
        trap(N('\\Gamma', Gm, ''), [[-Gm, 'That swaps the regions. Region 1 is where the wave comes from.'], [(n1 * n1 - n2 * n2) / (n1 * n1 + n2 * n2), 'That uses ε_r where n = √ε_r belongs.']]),
        trap(N('\\tau', tau, ''), [[1 - Gm, 'τ = 1 + Γ, not 1 − Γ.']]),
        trap(N(md`\tilde E_r(0)\text{ along }${A}`, Er, 'V/m'), [[-Er, 'Check the sign: E_r(0) = Γ E_i(0), and Γ carries its own sign.']]),
        trap(N(md`\tilde H_r(0)\text{ along }${Hd}`, Hr, 'A/m'), [[-Hr, 'The reflected H is −Γ times the incident H: the reflected wave travels backward.']]),
        trap(N(md`\tilde H_t(0)\text{ along }${Hd}`, Ht, 'A/m'), [[tau * E0 / eta1, 'That divides by η1. The transmitted wave lives in region 2: use η2.']]),
        trap(N('\\langle S_t\\rangle', St, 'W/m²'), [[tau * tau * E0 * E0 / (2 * eta1), 'That uses η1. Use |E_t|²/2η2, or (1 − Γ²)⟨S_i⟩.']]),
      ],
      hints: [md`$\eta = 120\pi/n$ with $n = \sqrt{\epsilon_r}$; $\Gamma = (n_1 - n_2)/(n_1 + n_2)$.`, md`The reflected $H$ coefficient is $-\Gamma E_0/\eta_1$; the transmitted one is $\tau E_0/\eta_2$.`],
      sol: md`
        **Step 1: the media.** $n_1 = ${p(n1)}$, $\eta_1 = ${etaTex(n1)} = ${f(eta1)}\ \Omega$; $n_2 = ${p(n2)}$, $\eta_2 = ${etaTex(n2)} = ${f(eta2)}\ \Omega$.

        **Step 2: Γ and τ.**
        $$\Gamma = \frac{${p(n1)} - ${p(n2)}}{${p(n1)} + ${p(n2)}} = ${fr(Gm)}$$
        and $\tau = 1 + \Gamma = ${fr(tau)}$.

        **Step 3: the reflected E.** $\tilde E_r(0) = \Gamma E_0 = (${fr(Gm)})(${E0}) = ${f(Er)}$ V/m along $${A}$. It travels toward $${hat0(g.u, -g.s)}$, so its exponent has the opposite sign.

        **Step 4: the reflected H.** The reflected wave goes backward, so its $H$ coefficient along $${Hd}$ is $-\Gamma E_0/\eta_1$:
        $$-\frac{(${fr(Gm)})(${E0})}{${f(eta1)}} = ${f(Hr)}\ \text{A/m}$$
        **Step 5: the transmitted H.**
        $$\frac{\tau E_0}{\eta_2} = \frac{(${fr(tau)})(${E0})}{${f(eta2)}} = ${f(Ht)}\ \text{A/m}$$
        **Step 6: transmitted power.**
        $$\langle S_t\rangle = \frac{(${f(tau * E0)})^2}{2(${f(eta2)})} = ${f(St)}\ \text{W/m}^2$$
        **Check.** $H$ at the boundary: $E_0/\eta_1 + (${f(Hr)}) = ${f(E0 / eta1 + Hr)}$, equal to $\tilde H_t(0) = ${f(Ht)}$ ✓. Power: $(1 - \Gamma^2)E_0^2/2\eta_1 = ${f((1 - Gm * Gm) * E0 * E0 / (2 * eta1))}$ ✓.
      `,
    };
  };

  GENS.w4_back = () => {
    const g = geom(), m1 = pick(ER.slice(0, 3)), m2 = pick(ER.filter((m) => m.n !== m1.n));
    const n1 = m1.n, n2 = m2.n, k0 = pick([2, 4, 5, 10]), w = k0 * C0, b2 = k0 * n2;
    const A = pick([2, 4, 6, 8, 12]), Gm = G12(n1, n2), tau = 1 + Gm, Ei = A / tau, Er = Gm * Ei;
    const eta1 = ETA0 / n1, eta2 = ETA0 / n2, Si = Ei * Ei / (2 * eta1);
    const Av = hat0(g.a);
    return {
      title: 'Backward from the transmitted field',
      q: md`Region 1, $${g.reg1}$, is ${medTex(m1)}; region 2, $${g.reg2}$, is a nonmagnetic perfect dielectric of unknown $\epsilon_r$. A wave comes from region 1, and the transmitted field is $\tilde{\mathbf E}_t = ${A}\,${Av}\,e^{${g.sg}j${p(b2)}${g.U}}$ V/m at $\omega = ${p(w)}$ rad/s. Find region 2's $\epsilon_r$ and $\eta_2$, then $\Gamma$, the incident and reflected fields at the boundary (signed, along $${Av}$), and $\langle S_i\rangle$.`,
      parts: [
        trap(N('\\epsilon_{r2}', n2 * n2, ''), [[n2, 'That is n = β2/(ω/c). Square it.']]),
        trap(N('\\eta_2', eta2, 'Ω'), [[ETA0 * n2, 'A denser medium has a smaller η: η = 120π/n.']]),
        trap(N('\\Gamma', Gm, ''), [[-Gm, 'Region 1 is where the wave comes from: Γ = (η2 − η1)/(η2 + η1).']]),
        trap(N(md`\tilde E_i(0)`, Ei, 'V/m'), [[A * tau, 'That multiplies by τ. E_t = τE_i, so E_i = E_t/τ.'], [A, 'The transmitted field is τ times the incident field, and τ ≠ 1.']]),
        trap(N(md`\tilde E_r(0)`, Er, 'V/m'), [[-Er, 'Check the sign of Γ.'], [Gm * A, 'That is Γ E_t. The reflected field is Γ E_i.']]),
        trap(N('\\langle S_i\\rangle', Si, 'W/m²'), [[A * A / (2 * eta1), 'That uses the transmitted amplitude. ⟨S_i⟩ uses E_i.']]),
      ],
      hints: [md`In region 1, $\beta_1 = n_1\omega/c = ${p(k0 * n1)}$ rad/m. The ratio $\beta_2/(\omega/c)$ is $n_2$.`, md`$\tilde E_i(0) = \tilde E_t(0)/\tau$ and $\tilde E_r(0) = \Gamma\tilde E_i(0)$.`],
      sol: md`
        **Step 1: region 2 from its β.** $\omega/c = ${p(w)}/(3\times10^8) = ${k0}$ rad/m, and $\beta_2 = ${p(b2)}$ rad/m, so
        $$n_2 = \frac{${p(b2)}}{${k0}} = ${p(n2)}, \qquad \epsilon_{r2} = ${p(n2 * n2)}$$
        Then $\eta_2 = 120\pi/${p(n2)} = ${f(eta2)}\ \Omega$. (The sheet's $\eta\gamma = j\omega\mu$ gives the same: $\omega\mu_0/\beta_2 = ${f(w * MU0 / b2)}\ \Omega$.)

        **Step 2: Γ and τ.** $n_1 = ${p(n1)}$:
        $$\Gamma = \frac{${p(n1)} - ${p(n2)}}{${p(n1)} + ${p(n2)}} = ${fr(Gm)}$$
        and $\tau = ${fr(tau)}$.

        **Step 3: the incident field.** $\tilde E_t(0) = \tau\tilde E_i(0)$:
        $$\tilde E_i(0) = \frac{${A}}{${fr(tau)}} = ${f(Ei)}\ \text{V/m}$$
        **Step 4: the reflected field.** $\tilde E_r(0) = \Gamma\tilde E_i(0) = ${f(Er)}$ V/m. Its exponent has $\beta_1 = ${p(k0 * n1)}$ rad/m with the opposite sign to the incident one.

        **Step 5: incident power.** $\eta_1 = ${f(eta1)}\ \Omega$:
        $$\langle S_i\rangle = \frac{(${f(Ei)})^2}{2(${f(eta1)})} = ${f(Si)}\ \text{W/m}^2$$
        **Check.** $\tilde E_i + \tilde E_r = ${f(Ei)} + (${f(Er)}) = ${f(Ei + Er)} = ${A}$ ✓. And $\langle S_t\rangle = ${A}^2/(2\eta_2) = ${f(A * A / (2 * eta2))}$ equals $(1 - \Gamma^2)\langle S_i\rangle = ${f((1 - Gm * Gm) * Si)}$ ✓.
      `,
    };
  };

  GENS.w4_pecjs = () => {
    const g = geom(), m = pick(ER.filter((x) => [1, 2, 3, 4].includes(x.n))), H0 = pick([0.5, 1, 2, 3, 4, 5]);
    const eta1 = ETA0 / m.n, E0 = eta1 * H0, P = MU0 * H0 * H0;
    const Hd = hat0(g.h, g.sh);
    const dirOpts = [hat(g.a), hat(g.a, -1), hat(g.h, 1), hat(g.h, -1)].map((s) => `$${s}$`);
    const jsOpts = [hat(g.a), hat(g.a, -1), hat(g.h, g.sh), hat(g.u, -g.s)].map((s) => `$${s}$`);
    return {
      title: 'A perfect conductor: fields, current, push',
      q: md`Region $${g.reg1}$ is ${medTex(m)} ($\mu = \mu_0$); a perfect conductor fills $${g.reg2}$. The incident wave is $\mathbf H_i = ${Hd}\,${p(H0)}\cos(\omega t ${g.sg} \beta_1${g.U})$ A/m.`,
      parts: [
        trap(N(md`|\tilde{\mathbf E}_i|`, E0, 'V/m'), [[ETA0 * H0, 'That uses η0. The wave is in a medium with η1 = 120π/n.']]),
        { lbl: md`The reflected $\mathbf E$ at the surface points along`, mc: dirOpts, a: 1,
          why: [md`That is the incident $\mathbf E$. $\Gamma = -1$ reverses it at the surface.`, null, md`$\mathbf E$ of these waves is perpendicular to both $\mathbf H$ and the travel; $\mathbf H$ is along $\pm\hat ${AXN[g.h]}$.`, md`$\mathbf E$ of these waves is perpendicular to both $\mathbf H$ and the travel; $\mathbf H$ is along $\pm\hat ${AXN[g.h]}$.`] },
        trap(N(md`|\mathbf J_s|`, 2 * H0, 'A/m'), [[H0, 'That is the incident H. At the surface H doubles, and |J_s| equals the surface H.']]),
        { lbl: md`$\mathbf J_s$ points along`, mc: jsOpts, a: 0,
          why: [null, md`That uses $\hat n$ pointing into the conductor.`, md`That is $\mathbf H$ itself; $\mathbf J_s = \hat n\times\mathbf H$ is perpendicular to it.`, md`That is the normal; a surface current flows along the surface.`] },
        trap(N('\\langle P\\rangle', P, 'Pa'), [[P / 2, 'That is an absorber. A mirror feels 2⟨S⟩/c = μ0 H0².']]),
      ],
      hints: [md`$\mathbf E = \eta_1\,\mathbf H\times\hat k$, with $\hat k = ${hat0(g.u, g.s)}$ and $\eta_1 = 120\pi/${p(m.n)}$.`, md`$\mathbf J_s = 2\tilde{\mathbf E}_i(0)/\eta_1$; mirror pressure $= \mu_0H_0^2$.`],
      sol: md`
        **Step 1: travel.** $\omega t ${g.sg} \beta_1${g.U}$ travels toward $${hat0(g.u, g.s)}$, into the conductor ✓.

        **Step 2: the incident E.** $\eta_1 = ${etaTex(m.n)} = ${f(eta1)}\ \Omega$. $\mathbf E = \eta_1\mathbf H\times\hat k$, and $(${Hd})\times(${hat0(g.u, g.s)}) = ${hat0(g.a)}$:
        $$|\tilde E_i| = (${f(eta1)})(${p(H0)}) = ${f(E0)}\ \text{V/m}$$
        along $${hat0(g.a)}$.

        **Step 3: the reflected E.** $\Gamma = -1$: at the surface it is $-${f(E0)}$ V/m along $${hat0(g.a)}$, that is, along $${hat0(g.a, -1)}$.

        **Step 4: the surface current.** The surface $H$ is $2H_0 = ${p(2 * H0)}$ A/m along $${Hd}$. With $\hat n = ${hat0(g.u, -g.s)}$ (out of the conductor), $\hat n\times(${Hd}) = ${hat0(g.a)}$:
        $$\mathbf J_s = ${p(2 * H0)}\cos(\omega t)\,${hat0(g.a)}\ \text{A/m}$$
        Check: $2|\tilde E_i|/\eta_1 = 2H_0$ ✓, along the incident $\mathbf E$ ✓.

        **Step 5: the pressure.** $\langle P\rangle = 2\langle S_i\rangle/v_1 = \mu_0H_0^2$:
        $$\langle P\rangle = (4\pi\times10^{-7})(${p(H0)})^2 = ${f(P)}\ \text{Pa}$$
      `,
    };
  };

  GENS.w4_metal = () => {
    const sig = pick([1, 2, 4, 5]) * 1e7, del = pick([1, 2, 4, 5]) * 1e-6, E0 = pick([5, 10, 20, 50]);
    const Rs = 1 / (sig * del), frac = 4 * Rs / ETA0, Si = E0 * E0 / (2 * ETA0), Pa = frac * Si, Js = 2 * E0 / ETA0;
    return {
      title: 'A real metal: how much it absorbs',
      q: md`A wave with $E_0 = ${E0}$ V/m in air hits a nonmagnetic metal with $\sigma = ${p(sig)}$ S/m, whose skin depth at this frequency is $\delta = ${p(del * 1e6)}\ \mu$m. Find $R_s$, the fraction of the incident power absorbed, the absorbed power per square meter, and the size of the surface current.`,
      parts: [
        trap(N('R_s', Rs, 'Ω'), [[sig * del, 'That is σδ. R_s = 1/(σδ).']]),
        trap(N('1 - |\\Gamma|^2', frac, ''), [[2 * Rs / ETA0, 'That is 2R_s/η0. The expansion gives 4R_s/η0.'], [4 * Math.SQRT2 * Rs / ETA0, 'That uses |η2| = √2 R_s. Only Re η2 = R_s absorbs.']]),
        trap(N('\\text{absorbed power}', Pa, 'W/m²'), [[Pa / 2, 'Check the factor: ⟨S_i⟩ = E0²/2η0 and the fraction is 4R_s/η0.']]),
        trap(N(md`|\tilde J_s|`, Js, 'A/m'), [[E0 / ETA0, 'That is the incident H. The surface H, and so J_s, is twice that.']]),
      ],
      hints: [md`$R_s = 1/(\sigma\delta)$ and $\eta_2 = (1 + j)R_s$.`, md`Absorbed fraction $\approx 4R_s/\eta_0$; check with $\tfrac12R_s|J_s|^2$.`],
      sol: md`
        **Step 1: surface resistance.**
        $$R_s = \frac{1}{\sigma\delta} = \frac{1}{(${p(sig)})(${p(del)})} = ${f(Rs)}\ \Omega$$
        **Step 2: absorbed fraction.** $\Gamma \approx -1 + 2\eta_2/\eta_0$ with $\eta_2 = (1 + j)R_s$, so
        $$1 - |\Gamma|^2 \approx \frac{4R_s}{\eta_0} = \frac{${f(4 * Rs)}}{120\pi} = ${f(frac)}$$
        **Step 3: absorbed power.** $\langle S_i\rangle = ${E0}^2/(240\pi) = ${f(Si)}$ W/m², so the metal absorbs
        $$(${f(frac)})(${f(Si)}) = ${f(Pa)}\ \text{W/m}^2$$
        **Step 4: the current.** $|\tilde J_s| \approx 2E_0/\eta_0 = ${f(Js)}$ A/m.

        **Check.** $\tfrac12R_s|J_s|^2 = \tfrac12(${f(Rs)})(${f(Js)})^2 = ${f(0.5 * Rs * Js * Js)}$ W/m² ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- Topic 11, level 3
  GENS.w4_exam = () => {
    const g = geom();
    const [m1, m2] = pick([[ER[1], ER[0]], [ER[2], ER[0]], [ER[0], ER[1]], [ER[0], ER[2]], [ER[0], ER[4]], [ER[2], ER[4]], [ER[4], ER[2]], [ER[1], ER[2]]]);
    const n1 = m1.n, n2 = m2.n, fM = pick([1, 3, 15, 30, 150]), w = 2 * PI * fM * 1e6;
    const b1 = w * n1 / C0, b2 = w * n2 / C0, eta1 = ETA0 / n1, eta2 = ETA0 / n2;
    const Gm = G12(n1, n2), tau = 1 + Gm, A = pick([4, 6, 8, 12]), Ei = A / tau, Er = Gm * Ei, Hr = -Gm * Ei / eta1;
    const St = A * A / (2 * eta2), Rpc = 100 * Gm * Gm;
    const Av = hat0(g.a), Hd = hat0(g.h, g.sh);
    return {
      title: 'Exam problem: rebuild the interface from the transmitted wave',
      q: md`A plane wave travels toward $${hat0(g.u, g.s)}$ in region 1, $${g.reg1}$: ${medTex(m1)} with $\mu = \mu_0$. It hits the plane $${g.U} = 0$; region 2, $${g.reg2}$, is ${medTex(m2)} with $\mu = \mu_0$. The transmitted field is $\mathbf E_t = ${Av}\,${A}\cos(\omega t ${g.sg} \beta_2${g.U})$ V/m at $f = ${fM}$ MHz. (a) $\eta_1$ and $\eta_2$. (b) $\beta_1$ and $\beta_2$. (c) $\Gamma$ and $\tau$. (d) The incident and reflected $E$ amplitudes (signed, along $${Av}$). (e) The reflected $H$ coefficient along $${Hd}$. (f) $\langle S_t\rangle$ and the percentage of the incident power that reflects.`,
      parts: [
        N('(a)\\ \\eta_1', eta1, 'Ω'),
        trap(N('(a)\\ \\eta_2', eta2, 'Ω'), [[eta1, 'That is region 1. Region 2 has its own n.']]),
        trap(N('(b)\\ \\beta_1', b1, 'rad/m'), [[b1 / (2 * PI), 'That uses f for ω. β = ωn/c with ω = 2πf.']]),
        trap(N('(b)\\ \\beta_2', b2, 'rad/m'), [[b1, 'That is region 1. β2 = ωn2/c.']]),
        trap(N('(c)\\ \\Gamma', Gm, ''), [[-Gm, 'That swaps the regions.']]),
        trap(N('(c)\\ \\tau', tau, ''), [[1 - Gm, 'τ = 1 + Γ.']]),
        trap(N('(d)\\ E_i', Ei, 'V/m'), [[A * tau, 'E_i = E_t/τ, not τE_t.']]),
        trap(N('(d)\\ E_r', Er, 'V/m'), [[-Er, 'Check the sign of Γ.']]),
        trap(N(md`(e)\ H_r\text{ along }${Hd}`, Hr, 'A/m'), [[-Hr, 'The reflected H coefficient is −Γ E_i/η1.']]),
        trap(N('(f)\\ \\langle S_t\\rangle', St, 'W/m²'), [[A * A / (2 * eta1), 'That uses η1; the transmitted wave is in region 2.']]),
        trap(N('(f)\\ \\text{reflected}', Rpc, '%'), [[100 * Math.abs(Gm), 'That is |Γ| in percent. Power needs |Γ|².']]),
      ],
      hints: [md`$\eta = 120\pi/n$, $\beta = 2\pi f n/c$. Region 1 is the side the wave comes from.`, md`$E_i = E_t/\tau$, $E_r = \Gamma E_i$, and the reflected $H$ coefficient is $-\Gamma E_i/\eta_1$.`],
      sol: md`
        **(a) Impedances.** $n_1 = ${p(n1)}$, $n_2 = ${p(n2)}$:
        $$\eta_1 = ${etaTex(n1)} \approx ${f(eta1)}\ \Omega, \quad \eta_2 = ${etaTex(n2)} \approx ${f(eta2)}\ \Omega$$
        **(b) Phase constants.** $\omega = 2\pi(${fM}\times10^6)$ rad/s and $\omega/c = ${f(w / C0)}$ rad/m. Multiply by each $n$:
        $$\beta_1 = ${f(b1)}\ \text{rad/m}, \qquad \beta_2 = ${f(b2)}\ \text{rad/m}$$
        **(c) Coefficients.**
        $$\Gamma = \frac{n_1 - n_2}{n_1 + n_2} = \frac{${p(n1)} - ${p(n2)}}{${p(n1)} + ${p(n2)}} = ${fr(Gm)}$$
        and $\tau = 1 + \Gamma = ${fr(tau)}$.

        **(d) Amplitudes.** At the boundary $E_t = \tau E_i$:
        $$E_i = \frac{${A}}{${fr(tau)}} = ${f(Ei)}\ \text{V/m}, \qquad E_r = \Gamma E_i = ${f(Er)}\ \text{V/m}$$
        So $\mathbf E_i = ${Av}\,${f(Ei)}\cos(\omega t ${g.sg} ${f(b1)}${g.U})$ and $\mathbf E_r = ${Av}\,(${f(Er)})\cos(\omega t ${g.s > 0 ? '+' : '-'} ${f(b1)}${g.U})$, in V/m.

        **(e) Reflected H.** It travels backward, so along $${Hd}$ its coefficient is
        $$-\frac{\Gamma E_i}{\eta_1} = -\frac{${f(Er)}}{${f(eta1)}} = ${f(Hr)}\ \text{A/m}$$
        **(f) Power.**
        $$\langle S_t\rangle = \frac{${A}^2}{2\eta_2} = ${f(St)}\ \text{W/m}^2$$
        and the reflected share is $|\Gamma|^2 = ${fr(Gm * Gm)} = ${f(Rpc)}\%$.

        **Check.** $\langle S_i\rangle = E_i^2/2\eta_1 = ${f(Ei * Ei / (2 * eta1))}$ W/m², and $(1 - |\Gamma|^2)\langle S_i\rangle = ${f((1 - Gm * Gm) * Ei * Ei / (2 * eta1))} = \langle S_t\rangle$ ✓.

        **Speed path.** $n_1$ and $n_2$ give $\Gamma$ in one line; $E_i = E_t/\tau$; everything else is one division each. ${tau > 1 ? '$\\tau > 1$ here (the wave leaves a denser medium), which is fine: the power still balances.' : ''}

        **Where points go.** Using $f$ for $\omega$ in $\beta$; swapping the regions; $E_i = \tau E_t$; dropping the sign of the reflected $H$; computing $\langle S_t\rangle$ with $\eta_1$.
      `,
    };
  };

  // ---------------------------------------------------------------- Topic 11, the question bank
  EM.BANK['w4-gamma'] = [
    Q(md`The two equations that fix $\Gamma$ and $\tau$ come from…`,
      ['continuity of tangential E and of tangential H at the boundary', 'continuity of normal D and normal B', 'conservation of energy and of momentum', 'the wave equation in each region'], 0,
      [null, md`Normal components are zero for these waves: $\mathbf E$ and $\mathbf H$ are both tangential to the boundary.`, md`Energy balance follows from the two conditions; it is not one of them.`, md`The wave equation fixes each wave's form; the boundary fixes their sizes.`],
      md`$1 + \Gamma = \tau$ from tangential $E$; $1 - \Gamma = (\eta_1/\eta_2)\tau$ from tangential $H$.`),
    Q(md`In $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$, $\eta_1$ is…`,
      ['the impedance of the side the wave comes from', 'the smaller of the two impedances', 'always the free-space value 120π Ω', 'the impedance of the side the wave goes into'], 0,
      [null, md`Either side can have the smaller $\eta$; the sign of $\Gamma$ tells you which.`, md`Only when region 1 is free space.`, md`That is $\eta_2$.`],
      md`Region 1 holds the incident and reflected waves; region 2 holds the transmitted wave.`),
    Q(md`A wave in air hits a nonmagnetic dielectric with $\epsilon_r = 4$. $\Gamma$ and $\tau$ are…`,
      [md`$-\tfrac13$ and $\tfrac23$`, md`$\tfrac13$ and $\tfrac43$`, md`$-\tfrac35$ and $\tfrac25$`, md`$-\tfrac13$ and $\tfrac43$`], 0,
      [null, md`That is the reverse trip, from the dielectric into air.`, md`That uses $\epsilon_r$ for $n$: $(1 - 4)/(1 + 4)$.`, md`$\tau = 1 + \Gamma$, not $1 - \Gamma$.`],
      md`$n_2 = 2$: $\Gamma = (1 - 2)/(1 + 2) = -\tfrac13$ and $\tau = \tfrac23$.`),
    Q(md`Why does the reflected wave have $\tilde{\mathbf H}_r = -\hat y\,\Gamma E_0e^{j\beta_1z}/\eta_1$ when $\tilde{\mathbf E}_r = \hat x\,\Gamma E_0e^{j\beta_1z}$?`,
      [md`It travels toward $-z$, so $\mathbf E\times\mathbf H$ must point along $-\hat z$`, md`Because $\Gamma$ is negative`, md`Because the boundary is a conductor`, md`Because $H$ always lags $E$ by $180°$`], 0,
      [null, md`The minus sign is there for any $\Gamma$, positive or negative.`, md`It holds at any boundary, conducting or not.`, md`$H$ and $E$ of a traveling wave in a lossless medium are in phase; the sign is about direction.`],
      md`$\tilde{\mathbf H} = \hat k\times\tilde{\mathbf E}/\eta$ with $\hat k = -\hat z$: $(-\hat z)\times\hat x = -\hat y$.`),
    Q(md`At a boundary with $\Gamma = -\tfrac12$, the total $E$ and total $H$ in region 1 at the boundary are (relative to the incident wave's)…`,
      [md`$E$: $\tfrac12$, $H$: $\tfrac32$`, md`$E$: $\tfrac32$, $H$: $\tfrac12$`, md`$E$: $\tfrac12$, $H$: $\tfrac12$`, md`$E$: $-\tfrac12$, $H$: $\tfrac12$`], 0,
      [null, md`That uses $+\Gamma$ for $H$ and $-\Gamma$ for $E$: backward.`, md`$H$ has the $-\Gamma$ coefficient, so it grows when $E$ shrinks.`, md`$-\tfrac12$ is the reflected $E$ alone; the total adds the incident.`],
      md`$E$: $1 + \Gamma = \tfrac12$. $H$: $1 - \Gamma = \tfrac32$.`),
    Q(md`Can the transmitted $E$ amplitude be larger than the incident $E$ amplitude?`,
      ['Yes, when η2 > η1 (Γ > 0); the power still balances', 'No: that would violate energy conservation', 'Only when region 2 is a conductor', 'Only for circular polarization'], 0,
      [null, md`Power needs $H$ too: the transmitted $H$ is $(1 - \Gamma)$ times the incident $H$, smaller when $\Gamma > 0$.`, md`A conductor gives $\tau \approx 0$, the opposite.`, md`$\tau$ does not depend on the polarization at normal incidence.`],
      md`$\tau = 2\eta_2/(\eta_1 + \eta_2) > 1$ when $\eta_2 > \eta_1$. For example glass to air, $\tau = 1.5$.`),
    Q(md`A wave goes from a dielectric with $\epsilon_r = 4$ into air. The fraction of the power that reflects is…`,
      [md`$\tfrac19$`, md`$\tfrac13$`, md`$\tfrac89$`, md`$\tfrac{16}{9}$`], 0,
      [null, md`That is $|\Gamma|$. Power goes as $|\Gamma|^2$.`, md`That is the transmitted fraction.`, md`That is $\tau^2$, which is not a power fraction.`],
      md`$\Gamma = (2 - 1)/(2 + 1) = \tfrac13$; $R = \tfrac19$.`),
    Q(md`Which formula for the transmitted power fraction is correct for lossless media?`,
      [md`$(\eta_1/\eta_2)|\tau|^2$`, md`$|\tau|^2$`, md`$(\eta_2/\eta_1)|\tau|^2$`, md`$1 - |\Gamma|$`], 0,
      [null, md`$|\tau|^2$ alone can exceed 1, for example going from glass to air.`, md`Upside down: $\langle S_t\rangle = |\tau E_0|^2/2\eta_2$ divided by $|E_0|^2/2\eta_1$.`, md`Power needs $1 - |\Gamma|^2$.`],
      md`$\langle S_t\rangle/\langle S_i\rangle = (|\tau|^2/\eta_2)/(1/\eta_1) = (\eta_1/\eta_2)|\tau|^2 = 1 - |\Gamma|^2$.`),
    Q(md`The identity $(\eta_1/\eta_2)\tau^2 = 1 - \Gamma^2$ follows fastest from…`,
      ['multiplying the two boundary equations, (1 + Γ)(1 − Γ)', 'differentiating Γ with respect to η2', 'adding the two boundary equations', 'the definition of the Poynting vector alone'], 0,
      [null, md`No calculus is involved.`, md`Adding gives $2 = \tau(1 + \eta_1/\eta_2)$, which is the $\tau$ formula, not the power identity.`, md`The Poynting vector gives the three powers; the boundary conditions make them balance.`],
      md`$(1 + \Gamma)(1 - \Gamma) = \tau\cdot(\eta_1/\eta_2)\tau$.`),
    Q(md`Why is $\eta = 0$ for a perfect conductor?`,
      [md`$|\eta| = \sqrt{\omega\mu/\sigma}$ in a good conductor, which goes to 0 as $\sigma\to\infty$`, md`A conductor has no magnetic field inside, so $\mu = 0$`, md`Because $\Gamma = -1$ by definition`, md`Because $\epsilon\to\infty$ in a metal`], 0,
      [null, md`$\mu$ of copper is $\mu_0$; the fields vanish because $\sigma$ is huge.`, md`It is the other way around: $\eta_2 = 0$ is what makes $\Gamma = -1$.`, md`It is $\sigma$, not $\epsilon$, that becomes large.`],
      md`A perfect conductor supports any current with no $E$, so the ratio $E/H$ inside its surface is zero.`),
    Q(md`On a perfect conductor at $z = 0$ with region 1 in $z < 0$, the boundary condition gives $\mathbf J_s = \hat n\times\mathbf H_1(0)$ with $\hat n = $…`,
      [md`$-\hat z$, pointing out of the conductor into region 1`, md`$+\hat z$, pointing into the conductor`, md`either one; only the size matters`, md`$\hat x$, along the current`], 0,
      [null, md`$\hat n\times(\mathbf H^+ - \mathbf H^-)$ has $\hat n$ pointing from the $-$ side to the $+$ side. With region 1 as the $+$ side, $\hat n$ points into region 1.`, md`The sign decides the direction of $\mathbf J_s$, so it matters.`, md`$\hat n$ is normal to the surface.`],
      md`Take region 1 as the $+$ side and the conductor (where $\mathbf H = 0$) as the $-$ side; $\hat n$ points from $-$ to $+$: $-\hat z$.`),
    Q(md`A wave in a dielectric with $\epsilon_r = 4$ has $E_0 = 30\pi$ V/m and hits a perfect conductor. $|\mathbf J_s|$ is…`,
      ['1 A/m', '0.5 A/m', '2 A/m', '0.25 A/m'], 0,
      [null, md`That uses $\eta_0$: $2(30\pi)/(120\pi)$. In the dielectric $\eta_1 = 60\pi$.`, md`That doubles twice. $2E_0/\eta_1 = 60\pi/60\pi$.`, md`That is $E_0/\eta_0$, the incident $H$ computed in air.`],
      md`$\eta_1 = 60\pi\ \Omega$ and $|\mathbf J_s| = 2E_0/\eta_1 = 60\pi/60\pi = 1$ A/m.`),
    Q(md`Why does a mirror feel twice the pressure of an absorber?`,
      ['The reflected wave carries its momentum back, so the momentum change doubles', 'The mirror has twice the area exposed', 'The electric field doubles at the mirror', 'Absorbers convert half the momentum to heat'], 0,
      [null, md`Pressure is per unit area, so the area cancels.`, md`At a perfect mirror $E$ is zero at the surface; it is $H$ that doubles, and the pressure is $\tfrac12\mu_0H_s^2$.`, md`Heat carries energy, not momentum. The absorber takes all the momentum.`],
      md`Momentum in: $\langle S\rangle/c$ per m² per s. An absorber ends with 0, a mirror with $-\langle S\rangle/c$: twice the change.`),
    Q(md`Inside a good conductor, the force per volume on the current is $f_z = -\partial(\tfrac12\mu_0H_y^2)/\partial z$. The total force per area is therefore…`,
      [md`$\tfrac12\mu_0H_s^2$, with $H_s$ the field at the surface`, md`zero, because the integral of a derivative vanishes`, md`$\mu_0H_s^2$, with $H_s$ the field at the surface`, md`$\tfrac12\epsilon_0E_s^2$, with $E_s$ the field at the surface`], 0,
      [null, md`The integral of a derivative is the difference of the end values: $\tfrac12\mu_0H_s^2 - 0$.`, md`The $\tfrac12$ stays. $\mu_0H_0^2$ is the time average, after $H_s = 2H_0\cos\omega t$ is put in.`, md`$E$ at a good conductor's surface is nearly zero; the push is magnetic.`],
      md`$\int_0^\infty f_z\,dz = -[\tfrac12\mu_0H_y^2]_0^\infty = \tfrac12\mu_0H_s^2$. Its time average with $H_s = 2H_0\cos\omega t$ is $\mu_0H_0^2 = 2\langle S_i\rangle/c$.`),
    Q(md`For a good conductor, $\eta_2 \approx$…`,
      [md`$(1 + j)R_s$, with $R_s = \sqrt{\omega\mu/2\sigma} = 1/(\sigma\delta)$`, md`$R_s$, a real number`, md`$jR_s$, purely reactive`, md`$\sqrt{\mu/\epsilon}$`], 0,
      [null, md`Its angle is $45°$, so it has equal real and imaginary parts.`, md`Its angle is $45°$, not $90°$.`, md`That is the lossless value; a good conductor is dominated by $\sigma$.`],
      md`$\eta = \sqrt{j\omega\mu/\sigma} = \sqrt{\omega\mu/\sigma}\,e^{j45°} = (1 + j)\sqrt{\omega\mu/2\sigma}$.`),
    Q(md`A metal has $R_s = 0.01\ \Omega$. A wave in air hits it. The fraction of power it absorbs is closest to…`,
      [md`$1.1\times10^{-4}$`, md`$5.3\times10^{-5}$`, md`$2.7\times10^{-5}$`, md`$0.01$`], 0,
      [null, md`That is $2R_s/\eta_0$. The factor is 4.`, md`That is $R_s/\eta_0$.`, md`That is $R_s$ itself, not a fraction.`],
      md`$4R_s/\eta_0 = 0.04/377 \approx 1.06\times10^{-4}$.`),
    Q(md`The heat per square meter in a good conductor carrying an effective surface current $\tilde J_s$ is…`,
      [md`$\tfrac12R_s|\tilde J_s|^2$`, md`$R_s|\tilde J_s|^2$`, md`$\tfrac12|\tilde J_s|^2/R_s$`, md`$\tfrac12\eta_0|\tilde J_s|^2$`], 0,
      [null, md`That forgets the $\tfrac12$ of a time average of a sinusoid.`, md`A resistance multiplies $I^2$; it does not divide it.`, md`$\eta_0$ belongs to free space, not to the metal.`],
      md`Like $\tfrac12R|I|^2$ in a circuit, with $R_s$ in ohms "per square".`),
    Q(md`A right-hand circular wave reflects from a perfect conductor. The reflected wave is…`,
      ['left-hand circular', 'right-hand circular', 'linear', 'absent, since the conductor absorbs it'], 0,
      [null, md`The turning in a fixed plane is unchanged, but the travel reversed.`, md`$\Gamma = -1$ flips both components together, so the $90°$ between them survives.`, md`A perfect conductor reflects everything: $|\Gamma|^2 = 1$.`],
      md`Same turning, opposite direction: the hand flips. This is why a circularly polarized radar cannot see a flat metal plate with the same antenna hand.`),
    Q(md`$\tilde{\mathbf E}_i = \hat x\,E_0e^{+j\beta_1z}$ in $z > 0$ hits a boundary at $z = 0$. The reflected wave is…`,
      [md`$\hat x\,\Gamma E_0e^{-j\beta_1z}$, traveling toward $+z$`, md`$\hat x\,\Gamma E_0e^{+j\beta_1z}$, traveling toward $-z$`, md`$-\hat x\,\Gamma E_0e^{-j\beta_1z}$`, md`$\hat y\,\Gamma E_0e^{-j\beta_1z}$`], 0,
      [null, md`That is the incident wave's direction. The reflected wave goes back toward $+z$.`, md`$\Gamma$ already carries the sign; no extra minus for $\mathbf E$.`, md`$\Gamma$ multiplies the incident vector; the axis stays $\hat x$.`],
      md`The incident wave travels toward $-z$; the reflected one goes back toward $+z$, with the opposite exponent.`),
    Q(md`A wave in air hits a nonmagnetic dielectric and $\Gamma = -\tfrac12$. The dielectric's $\epsilon_r$ is…`,
      ['9', '3', '1/9', '4'], 0,
      [null, md`That is $n = (1 - \Gamma)/(1 + \Gamma)$. Square it.`, md`$\Gamma < 0$ means a denser medium.`, md`$\epsilon_r = 4$ gives $\Gamma = -\tfrac13$.`],
      md`$n = (1 + \tfrac12)/(1 - \tfrac12) = 3$, so $\epsilon_r = 9$.`),
    Q(md`In free space, a wave hits a nonmagnetic dielectric. Which quantity is the same on both sides of the boundary?`,
      ['the frequency', 'the wavelength', 'the phase constant β', 'the amplitude of E'], 0,
      [null, md`$\lambda = 2\pi/\beta$ changes with $n$.`, md`$\beta = n\omega/c$ changes with $n$.`, md`The amplitude changes by $\tau$.`],
      md`The boundary conditions must hold at every instant, so all three waves share $\omega$.`),
    Q(md`A wave reflects from the boundary between two dielectrics. The reflected wave's phase constant is…`,
      [md`$\beta_1$, with the opposite sign in the exponent`, md`$\beta_2$`, md`$-\beta_2$`, md`$(\beta_1 + \beta_2)/2$`], 0,
      [null, md`The reflected wave lives in region 1, so it uses region 1's $\beta$.`, md`It lives in region 1; only the sign of the exponent flips.`, md`There is no averaging; each wave uses its own medium.`],
      md`$\tilde{\mathbf E}_r = \hat x\,\Gamma E_0e^{+j\beta_1z}$.`),
  ];

  // ================================================================ Topic 12: standing waves
  // ---------------------------------------------------------------- figures
  const SNAP = [[1, 'thick'], [0.6, ''], [0.25, 'thin dim'], [-0.25, 'thin dim'], [-0.6, ''], [-1, 'thick']];
  const snapE = () => PF.plot({
    w: 360, h: 190, x: [-1.5, 0.08], y: [-2.3, 2.5], zero: true, xl: 'z/\\lambda',
    xt: [[-1.5, '-1.5'], [-1, '-1'], [-0.5, '-0.5'], [0, '0']], yt: [[2, '2E_0'], [-2, '-2E_0']],
    vlines: [[0, '\\text{PEC}']],
    curves: SNAP.map(([s, cls]) => ({ f: (x) => 2 * Math.sin(2 * PI * x) * s, cls, to: 0 })),
  });
  const snapH = () => PF.plot({
    w: 360, h: 190, x: [-1.5, 0.08], y: [-2.3, 2.5], zero: true, xl: 'z/\\lambda',
    xt: [[-1.5, '-1.5'], [-1, '-1'], [-0.5, '-0.5'], [0, '0']], yt: [[2, '2H_0'], [-2, '-2H_0']],
    vlines: [[0, '\\text{PEC}']],
    curves: SNAP.map(([s, cls]) => ({ f: (x) => 2 * Math.cos(2 * PI * x) * s, cls, to: 0 })),
  });
  const envAt = (Gm, d) => Math.hypot(1 + Gm * Math.cos(4 * PI * d), -Gm * Math.sin(4 * PI * d));   // d in wavelengths
  const envPlot = () => PF.plot({
    w: 380, h: 200, x: [-1, 0.06], y: [0, 2.2], xl: 'z/\\lambda',
    xt: [[-1, '-1'], [-0.75, '-0.75'], [-0.5, '-0.5'], [-0.25, '-0.25'], [0, '0']], yt: [[1, '1'], [4 / 3, '\\tfrac43'], [2 / 3, '\\tfrac23']],
    vlines: [[0, '\\text{boundary}']],
    curves: [
      { f: (x) => envAt(-1 / 3, -x), to: 0, lab: '\\Gamma = -\\tfrac13', labAt: -0.25, dx: -24, dy: -16 },
      { f: (x) => envAt(1 / 3, -x), to: 0, cls: 'dash', lab: '\\Gamma = +\\tfrac13', labAt: -0.5, dx: -24, dy: -16 },
    ],
  });
  const cavPlot = () => PF.plot({
    w: 380, h: 190, x: [-0.3, 0.85], y: [0, 1.3], xl: 'z\\ (\\text{m})',
    xt: [[0, '0'], [0.25, '0.25'], [0.5, '0.5']], yt: [[1, '1']],
    vlines: [[0, '\\text{sheet}'], [0.5, '\\text{sheet}']],
    curves: [
      { f: (z) => (z > 0 && z < 0.5 ? Math.abs(Math.sin(2 * PI * z)) : 0), n: 460, lab: '|\\tilde E|', labAt: 0.25, dx: -10, dy: -14 },
      { f: (z) => Math.abs(Math.cos(2 * PI * z)), from: 0, to: 0.5, cls: 'dash', lab: '|\\tilde H|', labAt: 0.06, dx: 6, dy: 2 },
    ],
  });
  const panel = (curves, envs = []) => PF.plot({ w: 260, h: 140, x: [0, 2.05], y: [-1.6, 1.6], zero: true, xl: 'z', curves: envs.concat(curves) });
  const threeFig = () => PF.row([
    { svg: panel([1, 0.55, 0.15, -0.15, -0.55, -1].map((s, i) => ({ f: (x) => s * Math.sin(2 * PI * x), cls: i === 0 || i === 5 ? 'thick' : i === 2 || i === 3 ? 'thin dim' : '' }))), cap: '(a)' },
    { svg: panel([0, 0.35, 0.7].map((ph, i) => ({ f: (x) => Math.cos(2 * PI * x - ph * PI), cls: i === 0 ? 'thick' : i === 2 ? 'thin dim' : '' }))), cap: '(b)' },
    { svg: panel([0, 0.3, 0.6].map((ph, i) => ({ f: (x) => (Math.cos(2 * PI * x + ph * PI) - 0.4 * Math.cos(-2 * PI * x + ph * PI)) / 1.0, cls: i === 0 ? 'thick' : i === 2 ? 'thin dim' : '' })),
      [{ f: (x) => envAt(-0.4, x), cls: 'dash dim' }, { f: (x) => -envAt(-0.4, x), cls: 'dash dim' }]), cap: '(c)' },
  ]).svg;

  EM.lesson('w4', {
    id: 'w4-standing', topic: 12, ref: 'Lecture 26', title: 'Standing waves',
    steps: [
      RF(md`
        !!key Why you care
          Prof. Chen's Spring 2024 Exam 3 opened with a standing wave: two current sheets half a wavelength apart, 18 points, the fields in three regions. Fall 2023 #1(c) and (d) asked whether a standing wave has zero energy and which plot shows one. The review session worked the standing wave in front of a perfect conductor. And Unit 6 lives on the same pattern: the formula sheet's $\tilde V(d) = \tilde V^+e^{j\beta d}(1 + \Gamma_Le^{-j2\beta d})$ and VSWR are this lesson with $V$ in place of $E$. Learn it here once, with fields you can picture.

        ### Notation

        - Region 1: where the wave comes from. Unless a problem says otherwise, the boundary is at $z = 0$ and region 1 is $z < 0$.
        - $\beta$, $\lambda = 2\pi/\beta$, $\eta_1$: region 1's phase constant, wavelength and impedance.
        - $d = -z$: the **distance back from the boundary**, in m. $d = 0$ at the boundary, and $d$ grows into region 1. The formula sheet uses the same $d$ on transmission lines.
        - $\Gamma = |\Gamma|e^{j\theta}$: the reflection coefficient of [Topic 11](#/l/w4-gamma), with size $|\Gamma|$ and angle $\theta$.
        - **Envelope** $|\tilde E(d)|$: the amplitude of the oscillation at the point $d$; what a meter held there would read.
        - **Node**: a point where the envelope is smallest (zero, in a pure standing wave). **Antinode**: where it is largest.
        - **VSWR** $S$: the voltage standing wave ratio, $|E|_{\max}/|E|_{\min}$, a plain number from 1 to $\infty$.

        ### 1. Add the two waves

        Region 1 holds the incident wave and the reflected wave. The total field is their sum (drop the subscript on $\beta_1$):
        $$\tilde E_x = E_0e^{-j\beta z} + \Gamma E_0e^{+j\beta z}$$
        The same for $H$, with the reflected term's minus sign from [Topic 11](#/l/w4-gamma):
        $$\tilde H_y = \frac{E_0}{\eta_1}\left(e^{-j\beta z} - \Gamma e^{+j\beta z}\right)$$
        Now measure position backward from the boundary, $d = -z$. Then $e^{-j\beta z} = e^{+j\beta d}$ and $e^{+j\beta z} = e^{-j\beta d}$:
        $$\tilde E_x = E_0\left(e^{j\beta d} + \Gamma e^{-j\beta d}\right)$$
        Factor out $e^{j\beta d}$. Inside the bracket the second term becomes $e^{-j\beta d}/e^{j\beta d} = e^{-j2\beta d}$:
        $$\tilde E_x = E_0e^{j\beta d}\left(1 + \Gamma e^{-j2\beta d}\right)$$
        And the same for $H$:
        $$\tilde H_y = \frac{E_0}{\eta_1}e^{j\beta d}\left(1 - \Gamma e^{-j2\beta d}\right)$$
        The factor $e^{j\beta d}$ has size 1. So the **envelope**, the size of the field at each point, is
        $$\boxed{|\tilde E_x(d)| = |E_0|\,\left|1 + \Gamma e^{-j2\beta d}\right|}$$
        Compare the sheet's line $\tilde V(d) = \tilde V^+e^{j\beta d}(1 + \Gamma_Le^{-j2\beta d})$: identical.

        Read the bracket as two arrows added: a fixed arrow of length 1, and an arrow of length $|\Gamma|$ that turns as you move. Stepping back a distance $d$ turns it by $-2\beta d$: twice $\beta d$, because the reflected wave had to travel out to the boundary and back. Where the two arrows line up, the field is large; where they point opposite ways, it is small.

        !!intuition Does this make sense?
          $\Gamma = 0$: the bracket is 1 everywhere, a flat envelope. A single traveling wave has the same amplitude at every point. ✓ At $d = 0$ the bracket is $1 + \Gamma = \tau$: the field at the boundary is $\tau E_0$, exactly what [Topic 11](#/l/w4-gamma) said. ✓
      `, {}),
      Q(md`**Predict.** $\Gamma = -\tfrac13$ and $E_0 = 6$ V/m. What is $|\tilde E|$ at $d = \lambda/4$? (There $2\beta d = \pi$.)`,
        ['8 V/m', '4 V/m', '6 V/m', '2 V/m'], 0,
        [null, md`That is $|1 + \Gamma|E_0$, the value at the boundary, $d = 0$.`, md`That ignores the reflected wave.`, md`That is the reflected wave's amplitude, $|\Gamma|E_0$, alone.`],
        md`$e^{-j\pi} = -1$, so the bracket is $1 - \Gamma = 1 + \tfrac13 = \tfrac43$, and $|\tilde E| = \tfrac43(6) = 8$ V/m. A quarter wavelength back, the reflected wave has turned around to help.`),
      R(md`
        ### 2. A perfect conductor: Γ = −1

        Put $\Gamma = -1$ into the sum (in $z$ again):
        $$\tilde E_x = E_0\left(e^{-j\beta z} - e^{j\beta z}\right)$$
        Recall the sine written with exponentials:
        $$\sin x = \frac{e^{jx} - e^{-jx}}{2j}$$
        So $e^{jx} - e^{-jx} = 2j\sin x$. Our bracket has the two terms in the other order, so it has the opposite sign:
        $$e^{-j\beta z} - e^{j\beta z} = -2j\sin\beta z$$
        Therefore
        $$\boxed{\tilde{\mathbf E} = -2jE_0\sin(\beta z)\,\hat x}$$
        For $H$, $\Gamma = -1$ makes the bracket $e^{-j\beta z} + e^{j\beta z}$, and the cosine identity $\cos x = (e^{jx} + e^{-jx})/2$ turns it into $2\cos\beta z$:
        $$\boxed{\tilde{\mathbf H} = \frac{2E_0}{\eta_1}\cos(\beta z)\,\hat y}$$
        At the wall, $z = 0$: $\sin0 = 0$, so $E = 0$ ✓ (no tangential $E$ on a perfect conductor). $\cos0 = 1$, so $H = 2E_0/\eta_1$, the doubled $H$ of Topic 11 ✓.

        **The same wave written along y.** The review session wrote the incident wave as $\tilde{\mathbf E}_i = -E_0e^{-j\beta y}\hat x$, hitting a conductor at $y = 0$. $\Gamma = -1$ flips it: $\tilde{\mathbf E}_r = +E_0e^{j\beta y}\hat x$. Their sum is
        $$\tilde{\mathbf E} = E_0\left(e^{j\beta y} - e^{-j\beta y}\right)\hat x$$
        which is $2j\sin x$ directly:
        $$\tilde{\mathbf E} = 2jE_0\sin(\beta y)\,\hat x$$
        The overall sign is opposite to the box above only because that incident wave started with $-E_0$. Derive the sign each time; never memorize it.

        !!intuition Does this make sense?
          Measured from the wall, $E$ goes like $\sin$ (zero at the wall) and $H$ goes like $\cos$ (largest at the wall). In $d$: $\sin\beta z = -\sin\beta d$, so $\tilde{\mathbf E} = 2jE_0\sin(\beta d)\,\hat x$. Same pattern, written from the wall outward.
      `),
      Q(md`**Predict.** In $x < 0$, $\tilde{\mathbf E}_i = 4\hat z\,e^{-j\beta x}$ V/m hits a perfect conductor at $x = 0$. The total $\tilde{\mathbf E}$ in $x < 0$ is…`,
        [md`$-8j\sin(\beta x)\,\hat z$`, md`$8j\sin(\beta x)\,\hat z$`, md`$8\cos(\beta x)\,\hat z$`, md`$-4j\sin(\beta x)\,\hat z$`], 0,
        [null, md`That has the identity's sign backward: $e^{-jx} - e^{jx} = -2j\sin x$.`, md`That is $\Gamma = +1$. A conductor has $\Gamma = -1$, and $E$ must vanish at $x = 0$; $\cos0 \neq 0$.`, md`That drops the 2 of $2j\sin x$.`],
        md`$4(e^{-j\beta x} - e^{j\beta x})\hat z = 4(-2j\sin\beta x)\hat z = -8j\sin(\beta x)\,\hat z$. At $x = 0$ it is zero ✓.`),
      RF(md`
        ### 3. Back to time: a wave that does not travel

        Multiply the phasor by $e^{j\omega t}$ and take the real part. Take $E_0$ real:
        $$\mathbf E = \Re\{-2jE_0\sin(\beta z)\,e^{j\omega t}\}\,\hat x$$
        $2E_0\sin\beta z$ is real, so it passes straight through the real part:
        $$\mathbf E = 2E_0\sin(\beta z)\,\Re\{-je^{j\omega t}\}\,\hat x$$
        Expand: $-je^{j\omega t} = -j(\cos\omega t + j\sin\omega t) = \sin\omega t - j\cos\omega t$. Its real part is $\sin\omega t$:
        $$\boxed{\mathbf E(z,t) = 2E_0\sin(\beta z)\sin(\omega t)\,\hat x}$$
        The $H$ phasor is real, so $\Re\{e^{j\omega t}\} = \cos\omega t$:
        $$\boxed{\mathbf H(z,t) = \frac{2E_0}{\eta_1}\cos(\beta z)\cos(\omega t)\,\hat y}$$
        Look at the form. A traveling wave is a function of $\omega t - \beta z$ together, $f(t - z/v)$: a shape that slides. Here $z$ and $t$ sit in **separate** factors. $\sin\beta z$ fixes a shape in space; $\sin\omega t$ only makes the whole shape grow, shrink and flip in time. Every point oscillates in step with every other (or exactly against it), and the zeros of $\sin\beta z$ never move. **Nothing travels.** That is a **standing wave**.

        [[fig:snap]]

        Watch it below. With $\Gamma = -1$ the accent curve breathes in place. Slide $\Gamma$ toward 0 and it starts to travel.
      `, { snap: { svg: PF.row([{ svg: snapE(), cap: 'Ex(z, t) ∝ sin βz sin ωt at six instants' }, { svg: snapH(), cap: 'Hy(z, t) ∝ cos βz cos ωt at six instants' }]).svg, cap: 'Snapshots in front of a perfect conductor at z = 0. Thick lines: the extreme instants. The zeros stay put; E and H swap places every quarter wavelength.' } }),
      W3.standing(),
      Q(md`**Predict.** Which of these fields, in V/m, is a pure standing wave?`,
        [md`$5\sin(3z)\cos(\omega t)$`, md`$5\cos(\omega t - 3z)$`, md`$5\cos(\omega t - 3z) + 2\cos(\omega t + 3z)$`, md`$5e^{-z}\cos(\omega t - 3z)$`], 0,
        [null, md`$\omega t - 3z$ together: a shape sliding toward $+z$.`, md`Two unequal waves: a partial standing wave. Its minima are not zeros, and part of it still travels.`, md`A decaying traveling wave; $\omega t - 3z$ still appears together.`],
        md`$\sin(3z)\cos(\omega t)$ separates $z$ and $t$: zeros at $3z = n\pi$ that never move.`),
      R(md`
        ### 4. Nodes and antinodes

        **Nodes of E** are where $\sin\beta z = 0$, so $\beta z = -n\pi$ for $n = 0, 1, 2, \dots$ With $\beta = 2\pi/\lambda$:
        $$z = -n\frac{\pi}{\beta} = -n\frac{\lambda}{2}$$
        In terms of $d$: $d = 0, \lambda/2, \lambda, \dots$ The wall is one of them.

        **Antinodes of E** ($|E| = 2E_0$) are where $|\sin\beta z| = 1$: $d = \lambda/4, 3\lambda/4, \dots$

        **H** follows $\cos\beta z$, so everything swaps: nodes of $H$ at $d = \lambda/4, 3\lambda/4, \dots$, antinodes ($2E_0/\eta_1$) at $d = 0, \lambda/2, \dots$

        | Distance from the wall | $0$ | $\lambda/4$ | $\lambda/2$ | $3\lambda/4$ |
        |---|---|---|---|---|
        | $|E|$ | $0$ (node) | $2E_0$ | $0$ | $2E_0$ |
        | $|H|$ | $2E_0/\eta_1$ | $0$ (node) | $2E_0/\eta_1$ | $0$ |

        Two facts to keep: neighbouring nodes of the same field are $\lambda/2$ apart. A node of $E$ sits on an antinode of $H$, $\lambda/4$ from the nearest node of $H$.

        **The circuit picture.** A node of $E$ acts like a short circuit ($V = 0$, current flows); a node of $H$ acts like an open circuit ($I = 0$). On a transmission line ended in a short, the sheet gives $\tilde V(d) = j2\tilde V^+\sin\beta d$: the same sine. You will meet it again in [Topic 18](#/l/w6-stubs).

        !!intuition Does this make sense?
          Slide a thin metal sheet into region 1 exactly at an $E$ node, $d = \lambda/2$. Nothing changes: $E$ is already zero there, and the sheet just carries the current that $H$ needs. That is how a cavity works (Section 8).
      `),
      Q(md`**Predict.** A 600 MHz wave in air hits a perfect conductor. The nearest point to the conductor where $|E|$ is largest is…`,
        ['12.5 cm from it', '25 cm from it', 'on the conductor itself', '50 cm from it'], 0,
        [null, md`That is $\lambda/2$, the spacing between nodes. The first maximum is halfway between the first two nodes.`, md`$E$ is zero on a perfect conductor: the wall is a node.`, md`That is a full wavelength.`],
        md`$\lambda = c/f = 3\times10^8/(6\times10^8) = 0.5$ m. The first $E$ antinode is at $\lambda/4 = 12.5$ cm.`),
      R(md`
        ### 5. No power flows, but the energy sloshes

        Compute the time-averaged Poynting vector:
        $$\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$$
        $\hat x\times\hat y = \hat z$, and $\tilde H$ is real, so $\tilde H^* = \tilde H$:
        $$\langle S_z\rangle = \tfrac12\Re\left\{-2jE_0\sin\beta z\cdot\frac{2E_0}{\eta_1}\cos\beta z\right\}$$
        Everything inside is real except the $-j$:
        $$\langle S_z\rangle = \frac{2E_0^2}{\eta_1}\sin\beta z\cos\beta z\;\Re\{-j\} = 0$$
        Zero at every point. The incident wave carries $E_0^2/2\eta_1$ forward, and the reflected wave carries the same back. The $j$ is the reason: $E$ and $H$ are $90°$ apart in time ($\sin\omega t$ against $\cos\omega t$).

        **The instantaneous S is not zero.** Multiply the time-domain fields:
        $$S_z = \frac{4E_0^2}{\eta_1}\sin\beta z\cos\beta z\,\sin\omega t\cos\omega t$$
        Use $\sin x\cos x = \tfrac12\sin2x$ twice:
        $$S_z = \frac{E_0^2}{\eta_1}\sin(2\beta z)\sin(2\omega t)$$
        It changes sign twice per period: energy flows one way for a quarter period, then back. At every node of $E$ ($\sin\beta z = 0$) and every node of $H$ ($\cos\beta z = 0$), $S_z = 0$ **at all times**. Energy never crosses a node. It is trapped in each quarter-wavelength cell, sloshing between electric form (piled up at the $E$ antinode) and magnetic form (at the $H$ antinode), like the energy in an LC circuit.

        **Energy density.** Start from
        $$w = \tfrac12\epsilon_1E^2 + \tfrac12\mu_1H^2$$
        Put in the fields. Since $\mu_1/\eta_1^2 = \epsilon_1$, the magnetic part has the same prefactor as the electric part:
        $$w = 2\epsilon_1E_0^2\left(\sin^2\beta z\sin^2\omega t + \cos^2\beta z\cos^2\omega t\right)$$
        Average over time: $\sin^2\omega t$ and $\cos^2\omega t$ each average to $\tfrac12$:
        $$\langle w\rangle = \epsilon_1E_0^2\left(\sin^2\beta z + \cos^2\beta z\right) = \epsilon_1E_0^2$$
        The same everywhere: twice what one traveling wave of amplitude $E_0$ stores ($\tfrac12\epsilon_1E_0^2$), because the two waves' energies add. At a single point and instant, $w$ is zero only where both terms vanish, for example at the wall when $\omega t = 90°$: isolated points and instants. So Fall 2023 #1(c)'s statement, "in a standing wave $\tfrac12\epsilon_0\mathbf E\cdot\mathbf E + \tfrac12\mu_0\mathbf H\cdot\mathbf H = 0$", is **false**.
      `),
      Q(md`**Predict.** A wave of amplitude $E_0$ in air reflects from a perfect conductor. The time-averaged energy density at a node of $E$ is…`,
        [md`$\epsilon_0E_0^2$`, '0', md`$2\epsilon_0E_0^2$`, md`$\tfrac12\epsilon_0E_0^2$`], 0,
        [null, md`$E$ is zero there at all times, but $H$ is at its largest, $2H_0\cos\omega t$.`, md`That is the peak in time, $\tfrac12\mu_0(2H_0)^2$. The average of $\cos^2$ is $\tfrac12$.`, md`That is one traveling wave's energy. Two waves are present.`],
        md`At an $E$ node, $w = \tfrac12\mu_0(2H_0)^2\cos^2\omega t$, which averages to $\mu_0H_0^2 = \epsilon_0E_0^2$. Section 5 showed the average is the same everywhere.`),
      RF(md`
        ### 6. Partial standing waves: |Γ| < 1

        Write $\Gamma = |\Gamma|e^{j\theta}$. The bracket of Section 1 is
        $$1 + |\Gamma|e^{j(\theta - 2\beta d)}$$
        a fixed arrow 1 plus an arrow of length $|\Gamma|$ at angle $\theta - 2\beta d$. The sum is longest when the small arrow points along the real axis, and shortest when it points backward:
        $$|E|_{\max} = (1 + |\Gamma|)|E_0|$$
        $$|E|_{\min} = (1 - |\Gamma|)|E_0|$$
        **Where?** The maxima are where $\theta - 2\beta d = -2\pi n$. Solve for $d$, using $2\pi/(2\beta) = \lambda/2$:
        $$d_{\max} = \frac{\theta}{2\beta} + n\frac{\lambda}{2}$$
        The minima are where the angle is an extra $-\pi$, a quarter wavelength further on:
        $$d_{\min} = d_{\max} + \frac{\lambda}{4}$$
        (pick $n$ so that $d \ge 0$). Two cases cover almost every exam:

        | $\Gamma$ | $\theta$ | at the boundary | first $E$ max | first $E$ min |
        |---|---|---|---|---|
        | negative (into denser, or a conductor) | $180°$ | $E$ minimum | $d = \lambda/4$ | $d = 0$ |
        | positive (into thinner) | $0°$ | $E$ maximum | $d = 0$ | $d = \lambda/4$ |

        $H$ does the opposite: its bracket has $-\Gamma$, so $H$ is largest exactly where $E$ is smallest.

        [[fig:env]]

        The pattern still repeats every $\lambda/2$, but its minima are not zeros. They cannot be: part of the wave keeps traveling, carrying the power that goes into region 2.

        !!intuition Does this make sense?
          $|\Gamma| = 1$: max $2|E_0|$ and min 0, the pure standing wave. $|\Gamma| = 0$: max = min = $|E_0|$, a flat traveling wave. ✓ The pattern repeats every $\lambda/2$, not every $\lambda$, because of the $2\beta d$.
      `, { env: { svg: envPlot(), cap: 'The envelope |1 + Γe^(−j2βd)| for Γ = −1/3 (solid) and Γ = +1/3 (dashed), with the boundary at the right. Same max 4/3 and min 2/3, shifted by λ/4.' } }),
      Q(md`**Predict.** A wave with $E_0 = 5$ V/m in air hits a nonmagnetic dielectric with $\epsilon_r = 16$. The $E$ envelope in the air has…`,
        ['max 8 V/m, a quarter wavelength from the boundary; min 2 V/m at the boundary', 'max 8 V/m at the boundary; min 2 V/m a quarter wavelength away', 'max 10 V/m a quarter wavelength away; min 0 at the boundary', 'max 6.8 V/m; min 3.2 V/m'], 0,
        [null, md`That is the pattern for $\Gamma > 0$. Into a denser medium $\Gamma < 0$, so $E$ is smallest at the boundary.`, md`That is a perfect conductor, $|\Gamma| = 1$. Here $|\Gamma| = \tfrac35$.`, md`That uses $|\Gamma|^2 = 0.36$. The envelope uses $|\Gamma|$, a field ratio.`],
        md`$\Gamma = (1 - 4)/(1 + 4) = -\tfrac35$. Max $(1 + \tfrac35)5 = 8$ V/m at $d = \lambda/4$; min $(1 - \tfrac35)5 = 2$ V/m at $d = 0$.`),
      R(md`
        ### 7. VSWR, and measuring Γ with a probe

        The standing wave ratio compares the largest and smallest envelope:
        $$S = \frac{|E|_{\max}}{|E|_{\min}} = \frac{1 + |\Gamma|}{1 - |\Gamma|}$$
        Solve for $|\Gamma|$. Multiply out: $S - S|\Gamma| = 1 + |\Gamma|$. Collect the $|\Gamma|$ terms: $S - 1 = |\Gamma|(S + 1)$. So
        $$\boxed{|\Gamma| = \frac{S - 1}{S + 1}}$$
        $S = 1$ means no reflection; $S\to\infty$ means total reflection.

        **A probe measures Γ.** Slide a small antenna through region 1 and read $|E|$:

        1. The ratio of the largest to the smallest reading is $S$, which gives $|\Gamma|$.
        2. Neighbouring minima are $\lambda/2$ apart. That gives $\lambda$, and then $f = v/\lambda$.
        3. Where the minima sit gives the angle $\theta$. At a minimum $\theta - 2\beta d_{\min} = -\pi$, so $\theta = 2\beta d_{\min} - \pi$. Minima on the boundary (and every $\lambda/2$ from it) mean $\theta = 180°$: $\Gamma$ is negative. Maxima there mean $\Gamma$ is positive.
        4. Invert $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$ to find region 2. Multiply out: $\Gamma\eta_2 + \Gamma\eta_1 = \eta_2 - \eta_1$. Collect $\eta_2$: $\eta_2(1 - \Gamma) = \eta_1(1 + \Gamma)$. So
        $$\eta_2 = \eta_1\,\frac{1 + \Gamma}{1 - \Gamma}$$
        For nonmagnetic dielectrics this is $n_2 = n_1(1 - \Gamma)/(1 + \Gamma)$.

        **The net power is the same at every d.** Multiply the $E$ and $H^*$ brackets from Section 1:
        $$(1 + \Gamma e^{-j2\beta d})(1 - \Gamma^*e^{j2\beta d})$$
        The product is $1 - |\Gamma|^2$ plus the two cross terms $\Gamma e^{-j2\beta d} - \Gamma^*e^{j2\beta d}$. Those are a number minus its own conjugate: purely imaginary. They drop out of the real part, so
        $$\langle S\rangle = (1 - |\Gamma|^2)\frac{|E_0|^2}{2\eta_1}$$
        at every $d$: exactly the power that [Topic 11](#/l/w4-gamma) sends into region 2. The standing part carries nothing; only the traveling surplus does. (Sheet: $P(d) = |\tilde V^+|^2/2Z_0 - |\tilde V^-|^2/2Z_0$.)
      `),
      Q(md`**Predict.** A probe finds $\text{VSWR} = 3$. Then $|\Gamma|$ is…`,
        [md`$\tfrac12$`, '2', md`$\tfrac13$`, md`$\tfrac23$`], 0,
        [null, md`That is $(S + 1)/(S - 1)$. $|\Gamma|$ can never exceed 1.`, md`That is $1/S$.`, md`That is $(S - 1)/S$; the bottom is $S + 1$.`],
        md`$|\Gamma| = (3 - 1)/(3 + 1) = \tfrac12$. Check: $(1 + \tfrac12)/(1 - \tfrac12) = 3$ ✓.`),
      RF(md`
        ### 8. Two sheets make a cavity (Spring 2024 #1)

        Section 4 said a metal sheet slid into an $E$ node changes nothing. So a pure standing wave can sit between two mirrors spaced by a multiple of $\lambda/2$. Spring 2024 #1 builds the same field without any metal, from two current sheets.

        Take two sheets, each carrying $\tilde{\mathbf J}_s = J_0\,\hat x$, at $z = 0$ and $z = L$, in a medium with $\eta$ and $\beta$. Each sheet radiates to both sides ([Topic 10](#/l/w3-antenna)):
        $$\tilde{\mathbf E} = -\frac{\eta}{2}\tilde{\mathbf J}_s\,e^{-j\beta|z - z_0|}$$
        Let $L = \lambda/2$, so $\beta L = \pi$ and $e^{\pm j\beta L} = -1$.

        **Outside, $z > L$.** Both waves travel toward $+z$:
        $$\tilde E_x = -\frac{\eta J_0}{2}\left(e^{-j\beta z} + e^{-j\beta(z - L)}\right)$$
        Pull out $e^{-j\beta z}$. What is left is $1 + e^{j\beta L} = 1 + e^{j\pi} = 0$. **Zero.** The second sheet's wave starts half a period out of step and cancels the first. The same happens for $z < 0$.

        **Inside, $0 < z < L$.** Sheet 1's wave travels toward $+z$. Sheet 2's travels toward $-z$, with $|z - L| = L - z$:
        $$\tilde E_x = -\frac{\eta J_0}{2}\left(e^{-j\beta z} + e^{-j\beta(L - z)}\right)$$
        Split the second exponential: $e^{-j\beta(L - z)} = e^{-j\beta L}e^{j\beta z} = -e^{j\beta z}$:
        $$\tilde E_x = -\frac{\eta J_0}{2}\left(e^{-j\beta z} - e^{j\beta z}\right)$$
        The bracket is $-2j\sin\beta z$ (Section 2), and the two minus signs cancel:
        $$\boxed{\tilde E_x = j\eta J_0\sin\beta z}$$
        A pure standing wave, with $E$ nodes exactly on the two sheets.

        **H inside.** Sheet 1's wave goes toward $+z$, and $\hat z\times\hat x = \hat y$, so its $\tilde H_y = -\tfrac12J_0e^{-j\beta z}$. Sheet 2's wave goes toward $-z$ with $\tilde E_x = +\tfrac{\eta J_0}{2}e^{j\beta z}$, and $(-\hat z)\times\hat x = -\hat y$, so its $\tilde H_y = -\tfrac12J_0e^{j\beta z}$. Add them:
        $$\tilde H_y = -J_0\cos\beta z$$
        **Check at $z = 0$.** Outside $\mathbf H = 0$; just inside, $\mathbf H = -J_0\hat y$. The jump condition: $\hat z\times(-J_0\hat y - 0) = J_0\hat x = \tilde{\mathbf J}_s$ ✓.

        **Spring 2024 numbers.** $J_0 = -2$ A/m, $f = 300$ MHz in free space: $\lambda = 1$ m, $\beta = 2\pi$ rad/m, and $L = 0.5$ m $= \lambda/2$ ✓. Inside:
        $$\tilde{\mathbf E} = j(120\pi)(-2)\sin(2\pi z)\,\hat x$$
        $$\tilde{\mathbf E} = -j240\pi\sin(2\pi z)\,\hat x\ \text{V/m}$$
        and $\tilde{\mathbf H} = 2\cos(2\pi z)\,\hat y$ A/m; both fields are zero outside. The posted key writes $-240j\sin(2\pi z)$; the correct amplitude is $240\pi \approx 754$ V/m, because $\eta_0 = 120\pi\ \Omega$. The key dropped the $\pi$.

        [[fig:cav]]
      `, { cav: { svg: cavPlot(), cap: 'Spring 2024 #1: |E| (solid, in units of 240π V/m) and |H| (dashed, in units of 2 A/m). Zero outside the sheets; E has nodes on the sheets, H is largest there.' } }),
      Q(md`**Predict.** In Spring 2024 #1, where between the sheets ($0 < z < 0.5$ m) is $|\tilde E|$ largest?`,
        ['at z = 0.25 m', 'at the sheets, z = 0 and z = 0.5 m', 'at z = 0.125 m and z = 0.375 m', 'nowhere in particular: |E| is the same everywhere inside'], 0,
        [null, md`The sheets are $E$ nodes; $H$ is largest there.`, md`Those are $\lambda/8$ points, where $|\sin2\pi z| = 1/\sqrt2$.`, md`That would be a single traveling wave. Two waves going opposite ways make nodes and antinodes.`],
        md`$|\sin2\pi z| = 1$ at $z = 0.25$ m, a quarter wavelength from each sheet. There $|\tilde E| = 240\pi \approx 754$ V/m.`),
      RF(md`
        ### 9. Reading a picture of a standing wave (Fall 2023 #1(d))

        Exams draw several snapshots on one axis, a thick line at one instant and thinner lines at others. There are three patterns to tell apart.

        [[fig:three]]

        - **(a) Zeros that never move, heights that change, every point in step:** a pure standing wave. Is it $E$ or $H$? From the shape alone you cannot tell: both are standing patterns, shifted from each other by $\lambda/4$. Only the boundary decides. A zero on a perfect conductor must be $E$; a maximum there must be $H$.
        - **(b) The same height in every snapshot, with the pattern shifted:** a traveling wave.
        - **(c) Wiggles inside a fixed envelope that never reaches zero:** a partial standing wave, $|\Gamma| < 1$.
      `, { three: { svg: threeFig(), cap: 'Three sets of snapshots. Thick: one instant; thinner and dimmer: later instants. In (c) the dashed lines are the envelope.' } }),
      Q(md`**Predict.** Snapshots of a field in front of a perfect conductor (at the right edge) show zeros that never move, 25 cm apart, and every curve reaches its **largest** height right at the conductor. The plotted field is…`,
        ['H of a standing wave', 'E of a standing wave', 'E of a traveling wave', 'H of a traveling wave'], 0,
        [null, md`$E$ must be zero on a perfect conductor, so a maximum there cannot be $E$.`, md`Fixed zeros mean nothing travels.`, md`Fixed zeros mean nothing travels.`],
        md`At the wall $H$ doubles while $E$ vanishes. A standing pattern with an antinode on the conductor is $H$. (The zeros 25 cm apart say $\lambda = 50$ cm.)`),
      R(md`
        ### The method

        !!method A standing-wave problem
          1. **Write the total field** in region 1: incident + $\Gamma\times$ incident with the exponent flipped. For $H$, the reflected term carries $-\Gamma$.
          2. **Perfect conductor ($\Gamma = -1$):** combine with $e^{jx} - e^{-jx} = 2j\sin x$ and $e^{jx} + e^{-jx} = 2\cos x$. Expect $E \propto \sin$ and $H \propto \cos$ measured from the wall.
          3. **Partial ($|\Gamma| < 1$):** envelope $|E_0||1 + \Gamma e^{-j2\beta d}|$; max $(1 + |\Gamma|)|E_0|$, min $(1 - |\Gamma|)|E_0|$; $\Gamma < 0$ puts the minimum on the boundary, $\Gamma > 0$ the maximum.
          4. **To the time domain:** multiply by $e^{j\omega t}$, take the real part. A factor $-j$ becomes $\sin\omega t$; $+j$ becomes $-\sin\omega t$.
          5. **Power:** $\langle S\rangle = (1 - |\Gamma|^2)|E_0|^2/2\eta_1$ at every point of region 1; zero for $|\Gamma| = 1$.
          6. **Check:** $E = 0$ on a conductor; the jump in $\mathbf H$ equals $\mathbf J_s$ at any sheet.

        ### Worked example 1: a conductor behind a dielectric

        !!graded Problem
          A nonmagnetic dielectric with $\epsilon_r = 4$ fills $z < 0$; a perfect conductor fills $z > 0$. The incident wave is $\tilde{\mathbf E}_i = 5\,\hat y\,e^{-j\beta z}$ V/m at $f = 300$ MHz. Find $\lambda$, the total $\tilde{\mathbf E}$ and $\tilde{\mathbf H}$, their time-domain forms, the nodes of $E$, $|E|$ at $z = -\lambda/12$, and $\mathbf J_s$.

        **Step 1: the medium.** $v = c/2 = 1.5\times10^8$ m/s, so
        $$\lambda = \frac{v}{f} = \frac{1.5\times10^8}{3\times10^8} = 0.5\ \text{m}$$
        and $\beta = 2\pi/\lambda = 4\pi$ rad/m. $\eta_1 = 120\pi/2 = 60\pi\ \Omega$.

        **Step 2: total E.** $\Gamma = -1$:
        $$\tilde{\mathbf E} = 5\left(e^{-j4\pi z} - e^{j4\pi z}\right)\hat y$$
        $$\tilde{\mathbf E} = -j10\sin(4\pi z)\,\hat y\ \text{V/m}$$
        **Step 3: total H.** Incident: $\hat z\times\hat y = -\hat x$ and $5/(60\pi) = 1/(12\pi)$, so $\tilde{\mathbf H}_i = -\hat x\,\tfrac{1}{12\pi}e^{-j4\pi z}$. Reflected: $\tilde{\mathbf E}_r = -5\hat y\,e^{j4\pi z}$ travels toward $-z$, and $(-\hat z)\times(-\hat y) = -\hat x$, so $\tilde{\mathbf H}_r = -\hat x\,\tfrac{1}{12\pi}e^{j4\pi z}$. Add, using $e^{-jx} + e^{jx} = 2\cos x$:
        $$\tilde{\mathbf H} = -\frac{1}{6\pi}\cos(4\pi z)\,\hat x\ \text{A/m}$$
        **Step 4: time domain.** $\Re\{-je^{j\omega t}\} = \sin\omega t$ and $\Re\{e^{j\omega t}\} = \cos\omega t$:
        $$\mathbf E = 10\sin(4\pi z)\sin(\omega t)\,\hat y\ \text{V/m}$$
        $$\mathbf H = -\frac{1}{6\pi}\cos(4\pi z)\cos(\omega t)\,\hat x\ \text{A/m}$$
        **Step 5: nodes of E.** $\sin4\pi z = 0$ at $z = 0, -0.25, -0.5, \dots$ m (every $\lambda/2$). The antinodes, $|E| = 10$ V/m, are at $z = -0.125, -0.375, \dots$ m.

        **Step 6: |E| at $z = -\lambda/12$.** $4\pi z = -\pi/6$, and $|\sin(-30°)| = \tfrac12$:
        $$|\tilde E| = 10\cdot\tfrac12 = 5\ \text{V/m}$$
        **Step 7: the surface current.** $\hat n = -\hat z$ (out of the conductor) and $\tilde{\mathbf H}(0) = -\hat x/(6\pi)$:
        $$\mathbf J_s = (-\hat z)\times\left(-\frac{\hat x}{6\pi}\right) = \frac{\hat y}{6\pi}\ \text{A/m}$$
        since $\hat z\times\hat x = \hat y$. Check: $2\tilde{\mathbf E}_i(0)/\eta_1 = 10\hat y/(60\pi) = \hat y/(6\pi)$ ✓. In time, $\mathbf J_s = (1/6\pi)\cos(\omega t)\,\hat y$ A/m.

        **Speed path.** $\lambda$ in the medium first. Then $\tilde E = -2jE_0\sin\beta z$ and $|\tilde H| = (2E_0/\eta_1)|\cos\beta z|$ straight from the box; only the direction of $H$ needs a cross product.

        **Where points go.** Using the free-space $\lambda = 1$ m. Dropping the $j$ (then $E$ and $H$ come out in phase, which would carry power). Putting the first $E$ maximum at the wall.

        ### Worked example 2: a partial standing wave

        !!graded Problem
          A wave with $E_0 = 4$ V/m at $f = 1$ GHz in air hits a nonmagnetic dielectric with $\epsilon_r = 9$. Describe the envelopes of $E$ and $H$ in the air: largest and smallest values, where they sit, the VSWR, and the net power density.

        **Step 1: Γ.** $n_2 = 3$:
        $$\Gamma = \frac{1 - 3}{1 + 3} = -\frac12$$
        **Step 2: E envelope.** Max $(1 + \tfrac12)(4) = 6$ V/m; min $(1 - \tfrac12)(4) = 2$ V/m. $\Gamma < 0$, so the minimum is on the boundary.

        **Step 3: where.** $\lambda = c/f = 0.3$ m. Minima at $d = 0, 15, 30, \dots$ cm; maxima halfway, at $d = 7.5, 22.5, \dots$ cm.

        **Step 4: H envelope.** $H_0 = 4/(120\pi) = 1/(30\pi)$ A/m. $H$ is largest where $E$ is smallest:
        $$|H|_{\max} = \tfrac32\cdot\frac{1}{30\pi} = \frac{1}{20\pi}\ \text{A/m}$$
        at the boundary, and $|H|_{\min} = \tfrac12\cdot\tfrac{1}{30\pi} = \tfrac{1}{60\pi}$ A/m at $d = 7.5$ cm.

        **Step 5: VSWR.** $6/2 = 3$, which is $(1 + \tfrac12)/(1 - \tfrac12)$ ✓.

        **Step 6: net power.**
        $$\langle S\rangle = \left(1 - \tfrac14\right)\frac{16}{240\pi} = \frac{1}{20\pi} \approx 0.0159\ \text{W/m}^2$$
        Check: $\tau = \tfrac12$, $E_t = 2$ V/m, and $\langle S_t\rangle = 4/(2\cdot40\pi) = 1/(20\pi)$ ✓.

        ### Worked example 3: reading a probe

        !!graded Problem
          A probe slides through the air in front of a flat nonmagnetic dielectric. It reads a largest $|E|$ of 6 V/m and a smallest of 3 V/m. It cannot get closer than 20 cm to the dielectric, and it finds minima at 25 cm and 50 cm from it, maxima halfway between. Find the VSWR, $\Gamma$, $f$, $\epsilon_r$ of the dielectric, $E_0$, and the fraction of power transmitted.

        **Step 1: VSWR and |Γ|.** $S = 6/3 = 2$, and
        $$|\Gamma| = \frac{2 - 1}{2 + 1} = \frac13$$
        **Step 2: λ and f.** Neighbouring minima are $\lambda/2 = 25$ cm apart, so $\lambda = 0.5$ m and $f = c/\lambda = 600$ MHz.

        **Step 3: the sign of Γ.** Minima repeat every 25 cm, at 25 and 50 cm, so the pattern puts a minimum at $d = 0$ too, on the boundary. That is $\theta = 180°$:
        $$\Gamma = -\tfrac13$$
        (A dielectric seen from air always gives $\Gamma < 0$, so this is consistent.)

        **Step 4: the dielectric.** $n_2 = (1 - \Gamma)/(1 + \Gamma) = (\tfrac43)/(\tfrac23) = 2$, so $\epsilon_r = 4$.

        **Step 5: E₀.** $|E|_{\max} = (1 + |\Gamma|)E_0$, so $E_0 = 6/(4/3) = 4.5$ V/m. Check: $(1 - \tfrac13)(4.5) = 3$ ✓.

        **Step 6: power.** $T = 1 - \tfrac19 = \tfrac89$: about 89% goes in.

        **Speed path.** Max/min → $S$ → $|\Gamma|$; minimum spacing → $\lambda$; minimum on the boundary → $\Gamma$ negative.

        ### Worked example 4: Spring 2024 #1, the two-sheet cavity

        !!graded Problem
          Two infinite sheets of current lie on $z = 0$ and $z = 0.5$ m, each with $\tilde{\mathbf J}_s = -2\hat x$ A/m. All of space is free space and $f = 300$ MHz. Write the electric and magnetic field phasors in all three regions, simplified. (18 points.)

        **Step 1: the numbers.** $\lambda = c/f = 1$ m, $\beta = 2\pi$ rad/m, and the spacing is $0.5$ m $= \lambda/2$.

        **Step 2: each sheet's field.** With $\tilde{\mathbf E} = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_se^{-j\beta|z - z_0|}$ and $-\tfrac{\eta_0}{2}(-2) = 120\pi$:
        $$\tilde{\mathbf E}_1 = 120\pi\,e^{-j2\pi|z|}\,\hat x$$
        $$\tilde{\mathbf E}_2 = 120\pi\,e^{-j2\pi|z - 0.5|}\,\hat x$$
        **Step 3: z > 0.5.** $|z| = z$ and $|z - 0.5| = z - 0.5$. Pull out $e^{-j2\pi z}$; the bracket is $1 + e^{j\pi} = 0$:
        $$\tilde{\mathbf E} = 0, \qquad \tilde{\mathbf H} = 0$$
        **Step 4: z < 0.** $|z| = -z$ and $|z - 0.5| = 0.5 - z$. Pull out $e^{j2\pi z}$; the bracket is $1 + e^{-j\pi} = 0$. Again $\tilde{\mathbf E} = \tilde{\mathbf H} = 0$.

        **Step 5: 0 < z < 0.5.** $|z| = z$, $|z - 0.5| = 0.5 - z$, and $e^{-j2\pi(0.5 - z)} = -e^{j2\pi z}$:
        $$\tilde{\mathbf E} = 120\pi\left(e^{-j2\pi z} - e^{j2\pi z}\right)\hat x$$
        $$\tilde{\mathbf E} = -j240\pi\sin(2\pi z)\,\hat x\ \text{V/m}$$
        **Step 6: H inside.** Sheet 1's wave goes toward $+z$: $\tilde{\mathbf H}_1 = \hat z\times\tilde{\mathbf E}_1/\eta_0 = e^{-j2\pi z}\hat y$. Sheet 2's wave goes toward $-z$ with $\tilde{\mathbf E}_2 = -120\pi e^{j2\pi z}\hat x$: $\tilde{\mathbf H}_2 = (-\hat z)\times\tilde{\mathbf E}_2/\eta_0 = e^{j2\pi z}\hat y$. Add:
        $$\tilde{\mathbf H} = 2\cos(2\pi z)\,\hat y\ \text{A/m}$$
        **Check.** At $z = 0$: $\hat z\times(2\hat y - 0) = -2\hat x = \tilde{\mathbf J}_s$ ✓. At $z = 0.5$: $\hat z\times(0 - 2\cos\pi\,\hat y) = \hat z\times2\hat y = -2\hat x$ ✓.

        **About the posted key.** It writes $\tilde{\mathbf E}(0 < z < 0.5) = -240j\sin(2\pi z)\hat x$. The amplitude is $2\times120\pi = 240\pi \approx 754$ V/m, not 240. The $H$ answer in the key is right.

        **Speed path.** Spacing $\lambda/2$ with equal currents: zero outside, a standing wave inside with $E$ nodes on the sheets. The amplitude is $\eta_0|J_0| = 240\pi$, and $|H| = |J_0| = 2$ at the sheets. Fix the signs with one jump condition.

        **Where points go.** Leaving the answers unsimplified (2 points are for simplifying). Using $e^{-j\beta z}$ for sheet 2's wave inside (it travels toward $-z$). Dropping the $\pi$ of $\eta_0$. A sign slip in $\hat k\times\tilde{\mathbf E}$ for the backward wave.

        ### The whole topic on one table

        | Quantity | Result | Where it came from |
        |---|---|---|
        | Total field | $E_0e^{j\beta d}(1 + \Gamma e^{-j2\beta d})$ | incident + reflected, $d = -z$ |
        | PEC phasors | $\tilde E = -2jE_0\sin\beta z$, $\tilde H = (2E_0/\eta_1)\cos\beta z$ | $\Gamma = -1$ and Euler |
        | PEC in time | $2E_0\sin\beta z\sin\omega t$, $(2E_0/\eta_1)\cos\beta z\cos\omega t$ | $\Re\{-je^{j\omega t}\} = \sin\omega t$ |
        | Nodes | $E$: $d = 0, \lambda/2, \dots$; $H$: $d = \lambda/4, 3\lambda/4, \dots$ | zeros of sin and cos |
        | Power | $\langle S\rangle = (1 - |\Gamma|^2)E_0^2/2\eta_1$; 0 for a PEC | cross terms are imaginary |
        | Energy | $\langle w\rangle = \epsilon_1E_0^2$ everywhere (PEC) | two waves' energies add |
        | Envelope | max $(1 + |\Gamma|)E_0$, min $(1 - |\Gamma|)E_0$, period $\lambda/2$ | arrows 1 and $\Gamma e^{-j2\beta d}$ |
        | VSWR | $S = (1 + |\Gamma|)/(1 - |\Gamma|)$, $|\Gamma| = (S - 1)/(S + 1)$ | max over min |
        | Two sheets $\lambda/2$ apart | zero outside; $\tilde E = j\eta J_0\sin\beta z$ inside | the two waves cancel outside |

        !!mistake Common mistakes
          - **Dropping the $j$** in $-2jE_0\sin\beta z$. It is what puts $E$ and $H$ $90°$ apart in time, and why no power flows.
          - **The sign of the sine.** $e^{-jx} - e^{jx} = -2j\sin x$; in $d$, $\sin\beta z = -\sin\beta d$. Derive it each time.
          - **Calling $\sin\beta z\sin\omega t$ a traveling wave.** $z$ and $t$ are in separate factors: it stands.
          - **E nodes at $\lambda/4$ from a conductor.** Those are $H$ nodes. $E$ is zero on the wall itself.
          - **Node spacing $\lambda$.** Neighbouring nodes are $\lambda/2$ apart; an $E$ node and the nearest $H$ node are $\lambda/4$ apart.
          - **Max $2E_0$ and min 0 for a partial reflection.** Those are only for $|\Gamma| = 1$; in general $(1 \pm |\Gamma|)E_0$.
          - **$|\Gamma| = (S + 1)/(S - 1)$** or $1/S$. It is $(S - 1)/(S + 1)$.
          - **"No power flows, so there is no energy."** $\langle w\rangle = \epsilon_1E_0^2$; it sloshes in place.
          - **The free-space $\lambda$** in a dielectric region. Use $\lambda = c/(f\sqrt{\epsilon_r})$.

        !!key Speed tricks
          - **PEC pattern from the wall:** $|E| = 2E_0|\sin\beta d|$, $|H| = (2E_0/\eta_1)|\cos\beta d|$. At $d = \lambda/12, \lambda/8, \lambda/6, \lambda/4$: $|E|/E_0 = 1, \sqrt2, \sqrt3, 2$.
          - **Spacings:** same-field nodes $\lambda/2$ apart; $E$ node to $H$ node $\lambda/4$.
          - **Envelope:** $(1 \pm |\Gamma|)E_0$. $\Gamma < 0$: $E$ minimum on the boundary. $\Gamma > 0$: $E$ maximum on the boundary.
          - **VSWR ↔ |Γ|:** $S = 2, 3, 4, 9$ give $|\Gamma| = \tfrac13, \tfrac12, \tfrac35, \tfrac45$.
          - **Phasor to time:** $-j \to \sin\omega t$, $+j \to -\sin\omega t$, real $\to \cos\omega t$.
          - **Two equal sheets $\lambda/2$ apart:** zero outside; inside $|E|_{\max} = \eta|J_0|$ midway, $|H| = |J_0|$ at the sheets.
          - **Plot test:** fixed zeros and changing heights = standing; equal heights shifting = traveling; no zeros inside an envelope = partial.

        ### Check questions
      `),
      Q(md`A 150 MHz wave in air reflects from a perfect conductor. Neighbouring nodes of $E$ are how far apart?`,
        ['1 m', '0.5 m', '2 m', '0.25 m'], 0,
        [null, md`That is $\lambda/4$, the distance from an $E$ node to the nearest $H$ node.`, md`That is a full wavelength.`, md`That is $\lambda/8$.`],
        md`$\lambda = 3\times10^8/1.5\times10^8 = 2$ m; nodes are $\lambda/2 = 1$ m apart.`),
      Q(md`"A standing wave carries no average power, so it stores no energy." Judge it.`,
        ['False: the energy is stored and sloshes in place; only its average flow is zero', 'True: E and H cancel', 'True at the nodes, false at the antinodes', 'False: a standing wave carries power at twice the frequency'], 0,
        [null, md`They cancel only in the product's time average. $\langle w\rangle = \epsilon_1E_0^2$ everywhere.`, md`At an $E$ node, $H$ is at its largest; the average energy density is the same at every point.`, md`The instantaneous flow oscillates at $2\omega$, but its average is zero: nothing is carried anywhere.`],
        md`$\langle\mathbf S\rangle = 0$, but $\langle w\rangle = \epsilon_1E_0^2$, twice one traveling wave's. Energy is trapped between nodes.`),
      Q(md`A wave goes from glass into air, so $\Gamma = +\tfrac12$ in the glass. On the glass side of the boundary, $|E|$ is…`,
        [md`$\tfrac32E_0$, a maximum of the envelope`, md`$\tfrac12E_0$, a minimum of the envelope`, '0, a node', md`$E_0$, as for a traveling wave`], 0,
        [null, md`That is the case $\Gamma < 0$. Here $1 + \Gamma = \tfrac32$.`, md`Only a perfect conductor forces $E = 0$.`, md`The reflection changes the field at the boundary to $\tau E_0$.`],
        md`At $d = 0$ the bracket is $1 + \Gamma = \tfrac32$: the largest value $1 + |\Gamma|$. $\Gamma > 0$ puts an $E$ maximum on the boundary.`),
      Q(md`The VSWR in front of a boundary is 1. What does that mean?`,
        ['No reflection: Γ = 0 and the region holds a pure traveling wave', 'Total reflection: |Γ| = 1', 'Half the power reflects', 'The boundary is a perfect conductor'], 0,
        [null, md`Total reflection makes the minimum zero and $S\to\infty$.`, md`Half the power means $|\Gamma| = 1/\sqrt2$ and $S \approx 5.8$.`, md`A conductor gives $S = \infty$.`],
        md`$S = 1$ means max = min: a flat envelope. $|\Gamma| = (1 - 1)/(1 + 1) = 0$.`),
      Q(md`The review session found $\tilde{\mathbf E} = 2jE_0\sin(\beta y)\,\hat x$ in front of a conductor. In the time domain (with $E_0$ real) this is…`,
        [md`$-2E_0\sin(\beta y)\sin(\omega t)\,\hat x$`, md`$2E_0\sin(\beta y)\sin(\omega t)\,\hat x$`, md`$2E_0\sin(\beta y)\cos(\omega t)\,\hat x$`, md`$2E_0\cos(\omega t - \beta y)\,\hat x$`], 0,
        [null, md`That is the result for $-2j$. Here $\Re\{je^{j\omega t}\} = \Re\{j\cos\omega t - \sin\omega t\} = -\sin\omega t$.`, md`That drops the $j$. A factor $j$ shifts the time dependence by $90°$.`, md`That is a traveling wave; the phasor has $\sin\beta y$ as a separate factor.`],
        md`$\Re\{2jE_0\sin\beta y\,e^{j\omega t}\} = 2E_0\sin\beta y\,\Re\{je^{j\omega t}\} = -2E_0\sin(\beta y)\sin(\omega t)$. The slide's last line says the same.`, { src: 'the 2025 review session, standing waves' }),
      Q(md`In Spring 2024 #1, the field for $z > 0.5$ m is…`,
        ['zero, because the two sheets\' waves arrive half a period apart and cancel', 'a traveling wave of amplitude 240π V/m', 'a traveling wave of amplitude 120π V/m', 'a standing wave'], 0,
        [null, md`That would need the waves to add: spacing $\lambda$ with equal currents, not $\lambda/2$.`, md`That is one sheet alone. The second sheet's wave cancels it.`, md`Outside, both waves travel the same way; they cannot form a standing wave.`],
        md`$e^{-j\beta z}(1 + e^{j\beta L})$ with $\beta L = \pi$ gives 0.`, { src: 'Spring 2024 #1(a)(iii)' }),
      Q(md`Which reading tells a probe that $\Gamma$ is negative?`,
        ['A minimum of |E| sits on the boundary (or an integer number of half wavelengths from it)', 'The VSWR is less than 1', 'The minima are a full wavelength apart', 'The maximum reading equals the minimum reading'], 0,
        [null, md`$S \ge 1$ always.`, md`Minima are always $\lambda/2$ apart, whatever $\Gamma$ is.`, md`That means $\Gamma = 0$.`],
        md`At $d = 0$ the bracket is $1 + \Gamma$, smallest when $\Gamma$ points backward, $\theta = 180°$.`),
      R(md`
        ### Practice, level 1: nodes and distances

        **The trick:** find $\lambda$ in the medium first. From a conductor: $E$ nodes at $0, \lambda/2, \dots$; $E$ maxima at $\lambda/4, 3\lambda/4, \dots$; $|E| = 2E_0|\sin\beta d|$. Eight right completes a card.
      `),
      Object.assign(G('rf_w4s_nodes', { need: 8 }), { id: 'w4-standing.r0' }),
      R(md`
        ### Practice, level 1: envelopes and VSWR

        **The trick:** max $(1 + |\Gamma|)E_0$, min $(1 - |\Gamma|)E_0$, $S = (1 + |\Gamma|)/(1 - |\Gamma|)$; the sign of $\Gamma$ decides what sits on the boundary.
      `),
      Object.assign(G('rf_w4s_env', { need: 8 }), { id: 'w4-standing.r1' }),
      R(md`
        ### Practice, level 1: time, power and pictures

        **The trick:** $-j\to\sin\omega t$, $+j\to-\sin\omega t$; separate $z$ and $t$ factors mean a standing wave; $\langle S\rangle = 0$ and $\langle w\rangle = \epsilon E_0^2$ for a pure one.
      `),
      Object.assign(G('rf_w4s_time', { need: 8 }), { id: 'w4-standing.r2' }),
      R(md`
        ### Practice, level 2: whole quantities, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w4s_pec', { need: 2 }),
      G('w4s_partial', { need: 2 }),
      G('w4s_probe', { need: 2 }),
      G('w4s_cavity', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        A Spring 2024 #1 style problem with new sheets, new numbers and new axes.
      `),
      G('w4s_exam', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- Topic 12 helpers
  const cm = (x) => `$${f(100 * x)}$ cm`;
  const NICE = [[1, '1'], [Math.SQRT2, '\\sqrt2'], [Math.sqrt(3), '\\sqrt3'], [2, '2'], [0.5, '\\tfrac12'], [Math.SQRT1_2, '\\tfrac{1}{\\sqrt2}'], [Math.sqrt(3) / 2, '\\tfrac{\\sqrt3}{2}'], [0, '0']];
  const nice = (x) => { const h = NICE.find(([v]) => Math.abs(v - x) < 1e-9); return h ? h[1] : f(x); };
  const DFR = [[1 / 12, '\\lambda/12'], [1 / 8, '\\lambda/8'], [1 / 6, '\\lambda/6'], [1 / 3, '\\lambda/3'], [3 / 8, '3\\lambda/8'], [5 / 12, '5\\lambda/12']];

  // ---------------------------------------------------------------- Topic 12, level 1: nodes
  GENS.rf_w4s_nodes = () => one([
    () => {
      const m = pick(ER.slice(0, 5)), fM = pick([150, 300, 600, 750, 1500]), lam = C0 / (fM * 1e6 * m.n);
      return MC('First E maximum', md`A ${fM} MHz wave in ${medTex(m)} ($\mu = \mu_0$) hits a perfect conductor. The nearest point to the conductor where $|E|$ is largest is at a distance of…`, cm(lam / 4),
        [[cm(lam / 2), md`That is $\lambda/2$, the spacing between nodes. The first maximum is halfway between the first two.`],
          ['0: on the conductor', md`$E$ is zero on a perfect conductor; the wall is a node.`],
          [cm(lam), md`That is a full wavelength.`]].concat(m.n === 1 ? [] : [[cm(C0 / (fM * 1e6) / 4), md`That uses the free-space wavelength. In the medium $\lambda = c/(f\sqrt{\epsilon_r})$.`]]),
        md`$\lambda = c/(f n) = ${f(lam)}$ m; the first $E$ antinode is at $\lambda/4 = ${f(100 * lam / 4)}$ cm.`);
    },
    () => {
      const lamCm = pick([20, 40, 60, 100, 120, 200]), ask = pick(['EE', 'EH', 'HH']);
      const v = ask === 'EH' ? lamCm / 4 : lamCm / 2;
      const what = { EE: 'two neighbouring nodes of $E$', EH: 'a node of $E$ and the nearest node of $H$', HH: 'two neighbouring nodes of $H$' }[ask];
      return MC('Node spacing', md`A pure standing wave has $\lambda = ${lamCm}$ cm. The distance between ${what} is…`, `$${p(v)}$ cm`,
        [[`$${p(ask === 'EH' ? lamCm / 2 : lamCm / 4)}$ cm`, ask === 'EH' ? md`That is the spacing of the same field's nodes. $E$ and $H$ nodes alternate, $\lambda/4$ apart.` : md`That is the distance from a node of one field to the nearest node of the other.`],
          [`$${p(lamCm)}$ cm`, md`That is a full wavelength. $|\sin\beta z|$ repeats every $\lambda/2$.`],
          [`$${p(lamCm / 8)}$ cm`, md`That is $\lambda/8$, where $|\sin\beta z| = |\cos\beta z|$.`]],
        md`Same-field nodes are $\lambda/2$ apart; $E$ and $H$ nodes alternate, so an $E$ node and the nearest $H$ node are $\lambda/4$ apart. Here: $${p(v)}$ cm.`);
    },
    () => {
      const [r, tex] = pick(DFR), v = 2 * Math.abs(Math.sin(2 * PI * r)), h = 2 * Math.abs(Math.cos(2 * PI * r));
      return MC('|E| near a mirror', md`In front of a perfect conductor the incident amplitude is $E_0$. At a distance $${tex}$ from the conductor, $|E|/E_0$ is…`, `$${nice(v)}$`,
        [[`$${nice(h)}$`, md`That is the $H$ pattern, $2|\cos\beta d|$. $E$ follows $\sin$, zero at the wall.`],
          [`$${nice(v / 2)}$`, md`That drops the 2: two waves of amplitude $E_0$ make $2E_0\sin\beta d$.`],
          ['$2$', md`$2E_0$ is reached only at $d = \lambda/4, 3\lambda/4, \dots$`],
          ['$0$', md`$E$ is zero only at $d = 0, \lambda/2, \dots$`]],
        md`$\beta d = 360°\times${fr(r)} = ${p(360 * r)}°$, and $|E| = 2E_0|\sin\beta d| = ${nice(v)}E_0$.`);
    },
    () => {
      const lam = pick([0.2, 0.4, 0.5, 1, 2]), k = pick([2, 3, 4, 5]), L = (k + 0.25) * lam / 2, cnt = k + 1;
      return MC('Counting nodes', md`A pure standing wave with $\lambda = ${p(lam)}$ m sits in front of a perfect conductor. How many nodes of $E$ lie within $${p(+L.toPrecision(4))}$ m of the conductor, counting the conductor's surface?`, `${cnt}`,
        [[`${cnt - 1}`, md`That leaves out the node on the conductor itself.`],
          [`${2 * cnt - 1}`, md`That counts every $\lambda/4$: it includes the $H$ nodes.`],
          [`${cnt + 1}`, md`The next node, at $${p(+((k + 1) * lam / 2).toPrecision(4))}$ m, is beyond the range.`]],
        md`$E$ nodes at $d = 0, \lambda/2, \lambda, \dots$, every $${p(lam / 2)}$ m. Up to $${p(+L.toPrecision(4))}$ m that is $d = 0$ through $${p(+(k * lam / 2).toPrecision(4))}$ m: ${cnt} nodes.`);
    },
    () => {
      const m = pick(ER.filter((x) => [1, 2, 3].includes(x.n))), E0 = pick([2, 3, 6, 12]) * PI, H = 2 * E0 / (ETA0 / m.n);
      return MC('H at the wall', md`A wave with $E_0 = ${p(E0 / PI)}\pi$ V/m in ${medTex(m)} ($\mu = \mu_0$) reflects from a perfect conductor. The amplitude of $H$ right at the conductor is…`, `$${f(H)}$ A/m`,
        [[`$${f(H / 2)}$ A/m`, md`That is the incident $H$ alone. At the wall $H$ is an antinode: it doubles.`],
          ['$0$', md`$E$ is zero at the wall; $H$ is at its largest.`],
          [`$${f(2 * H)}$ A/m`, md`That doubles twice. The incident $H$ is $E_0/\eta_1$, and the wall doubles it once.`],
          [`$${f(2 * E0 / ETA0)}$ A/m`, md`That uses $\eta_0$. In this medium $\eta_1 = 120\pi/${p(m.n)}$.`]],
        md`$|H| = 2E_0/\eta_1 = 2(${p(E0 / PI)}\pi)/(${etaTex(m.n)}) = ${f(H)}$ A/m.`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 12, level 1: envelopes
  const GLIST = [[1 / 3, '\\tfrac13'], [0.5, '\\tfrac12'], [0.2, '\\tfrac15'], [0.6, '\\tfrac35'], [1 / 7, '\\tfrac17'], [3 / 7, '\\tfrac37'], [0.8, '\\tfrac45']];
  GENS.rf_w4s_env = () => one([
    () => {
      const [g, t] = pick(GLIST), s = pick([1, -1]), E0 = pick([3, 5, 6, 10, 15]);
      const mx = (1 + g) * E0, mn = (1 - g) * E0;
      return MC('Max and min', md`$\Gamma = ${s < 0 ? '-' : ''}${t}$ and $E_0 = ${E0}$ V/m. The $E$ envelope in region 1 runs between…`, `$${f(mn)}$ and $${f(mx)}$ V/m`,
        [[`$0$ and $${2 * E0}$ V/m`, md`Those are for $|\Gamma| = 1$ only.`],
          [`$${f((1 - g * g) * E0)}$ and $${f((1 + g * g) * E0)}$ V/m`, md`That uses $|\Gamma|^2$. The envelope adds fields, so it uses $|\Gamma|$.`],
          [`$${f(g * E0)}$ and $${f(E0)}$ V/m`, md`Those are the two waves' own amplitudes. The envelope is their sum and difference.`]],
        md`$(1 - |\Gamma|)E_0 = ${f(mn)}$ V/m and $(1 + |\Gamma|)E_0 = ${f(mx)}$ V/m, whatever the sign of $\Gamma$.`);
    },
    () => {
      const [g, t] = pick(GLIST), S = (1 + g) / (1 - g);
      return MC('VSWR from Γ', md`$|\Gamma| = ${t}$. The VSWR is…`, `$${fr(S)}$`,
        [[`$${fr(1 / S)}$`, md`That is min over max. The VSWR is max over min, at least 1.`],
          [`$${fr(1 + g)}$`, md`That is the maximum alone, in units of $E_0$.`],
          [`$${fr(1 / g)}$`, md`That is $1/|\Gamma|$.`]],
        md`$S = (1 + ${t})/(1 - ${t}) = ${fr(S)}$.`);
    },
    () => {
      const S = pick([1.5, 2, 3, 4, 5, 9]), g = (S - 1) / (S + 1);
      return MC('Γ from VSWR', md`A probe measures $\text{VSWR} = ${p(S)}$. Then $|\Gamma|$ is…`, `$${fr(g)}$`,
        [[`$${fr((S + 1) / (S - 1))}$`, md`That is upside down; $|\Gamma|$ cannot exceed 1.`],
          [`$${fr(1 / S)}$`, md`That is $1/S$.`],
          [`$${fr((S - 1) / S)}$`, md`The bottom is $S + 1$, not $S$.`]],
        md`$|\Gamma| = (S - 1)/(S + 1) = (${p(S)} - 1)/(${p(S)} + 1) = ${fr(g)}$.`);
    },
    () => {
      const [m1, m2] = two(), Gm = G12(m1.n, m2.n), H = pick([false, true]);
      const atB = (Gm > 0) !== H;    // E max at boundary when Gamma > 0; H max at boundary when Gamma < 0
      const R0 = atB ? 'on the boundary' : 'a quarter wavelength from the boundary';
      return MC(H ? 'Where H peaks' : 'Where E peaks', md`A wave in ${medTex(m1)} hits ${medTex(m2)}. The nearest maximum of the ${H ? '$H$' : '$E$'} envelope to the boundary is…`, R0,
        [[atB ? 'a quarter wavelength from the boundary' : 'on the boundary', H ? md`$H$ has the bracket $1 - \Gamma e^{-j2\beta d}$: it peaks where $E$ is smallest.` : md`At $d = 0$ the bracket is $1 + \Gamma$; with $\Gamma = ${fr(Gm)}$ that is the ${Gm > 0 ? 'largest' : 'smallest'} value.`],
          ['half a wavelength from the boundary', md`Maxima are $\lambda/2$ apart, so if one is at $\lambda/2$ another is at 0.`],
          ['nowhere: the envelope is flat', md`$\Gamma = ${fr(Gm)} \neq 0$, so there is a standing pattern.`]],
        md`$\Gamma = ${fr(Gm)}$. At the boundary $|E| \propto |1 + \Gamma|$ and $|H| \propto |1 - \Gamma|$. ${H ? '$H$' : '$E$'} peaks ${R0}.`);
    },
    () => {
      const [g, t] = pick(GLIST), S0 = pick([2, 4, 10, 20, 45]), v = (1 - g * g) * S0;
      return MC('Net power in region 1', md`$|\Gamma| = ${t}$ and the incident wave carries $${S0}$ W/m². The net average power density flowing toward the boundary in region 1 is…`, `$${f(v)}$ W/m²`,
        [[`$${S0}$ W/m²`, md`That ignores the reflected wave, which carries $|\Gamma|^2$ of it back.`],
          ['$0$', md`Zero is only for $|\Gamma| = 1$.`],
          [`$${f((1 + g * g) * S0)}$ W/m²`, md`That adds the reflected power. It flows the other way.`],
          [`$${f((1 - g) * S0)}$ W/m²`, md`That uses $1 - |\Gamma|$. Power needs $|\Gamma|^2$.`]],
        md`$\langle S\rangle = (1 - |\Gamma|^2)\langle S_i\rangle = (1 - ${fr(g * g)})(${S0}) = ${f(v)}$ W/m², the same at every $d$.`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 12, level 1: time, power, pictures
  GENS.rf_w4s_time = () => one([
    () => {
      const c = pick([-1, 1, 0]), A = pick([3, 4, 5, 10]), bt = pick(['2', '3', '4', '2\\pi']), ax = pick(['x', 'y', 'z']);
      const amp = 2 * A, arg = `${bt}${ax}`.replace('\\pi', '\\pi ');
      const sp = (fn) => `\\${fn}(${arg})`;
      const ph = c === 0 ? `${amp}${sp('cos')}` : `${c < 0 ? '-' : ''}j${amp}${sp('sin')}`;
      const fnS = c === 0 ? sp('cos') : sp('sin');
      const right = c === 0 ? `${amp}${fnS}\\cos(\\omega t)` : `${c < 0 ? '' : '-'}${amp}${fnS}\\sin(\\omega t)`;
      const wr = c === 0
        ? [[`${amp}${fnS}\\sin(\\omega t)`, md`A real phasor gives $\Re\{e^{j\omega t}\} = \cos\omega t$; $\sin\omega t$ needs a factor $-j$.`],
          [`-${amp}${fnS}\\cos(\\omega t)`, md`A real, positive phasor keeps its sign: $\Re\{${amp}e^{j\omega t}\} = ${amp}\cos\omega t$.`],
          [`${amp}${sp('sin')}\\cos(\\omega t)`, md`The space factor stays exactly as in the phasor; only $e^{j\omega t}$ turns into a function of time.`]]
        : [[`${c < 0 ? '-' : ''}${amp}${fnS}\\sin(\\omega t)`, md`Check the sign: $\Re\{-je^{j\omega t}\} = +\sin\omega t$ and $\Re\{je^{j\omega t}\} = -\sin\omega t$.`],
          [`${amp}${fnS}\\cos(\\omega t)`, md`That drops the $j$. A factor $\pm j$ shifts the time dependence by $90°$.`],
          [`-${amp}${fnS}\\cos(\\omega t)`, md`That drops the $j$ and guesses a sign. The $j$ is what turns $\cos\omega t$ into $\pm\sin\omega t$.`]];
      wr.push([`${amp}\\cos(\\omega t - ${arg})`, md`That is a traveling wave. The phasor has no $e^{-j\beta ${ax}}$; its $${ax}$ dependence is a separate factor.`]);
      return MC('Phasor to time', md`A field phasor is $${ph}$ V/m. With $E(t) = \Re\{\tilde E e^{j\omega t}\}$, the field is…`, `$${right}$ V/m`,
        wr.map(([o, w]) => [`$${o}$ V/m`, w]),
        md`Multiply $${ph}$ by $e^{j\omega t}$. The real part of ${c < 0 ? '$-je^{j\\omega t}$ is $\\sin\\omega t$' : c > 0 ? '$je^{j\\omega t}$ is $-\\sin\\omega t$' : '$e^{j\\omega t}$ is $\\cos\\omega t$'}. So the field is $${right}$ V/m: a standing wave.`);
    },
    () => {
      const kind = pick(['st', 'tp', 'tm', 'pa']), A = pick([3, 4, 6, 8]), b = pick([2, 3, 5]);
      const ex = { st: `${A}\\sin(${b}z)\\cos(\\omega t)`, tp: `${A}\\cos(\\omega t - ${b}z)`, tm: `${A}\\cos(\\omega t + ${b}z)`, pa: `${A}\\cos(\\omega t - ${b}z) + ${A / 2}\\cos(\\omega t + ${b}z)` }[kind];
      const lab = { st: 'a pure standing wave', tp: 'a traveling wave toward +z', tm: 'a traveling wave toward −z', pa: 'a partial standing wave' };
      const why = { st: md`$z$ and $t$ sit in separate factors: the zeros never move.`, tp: md`$\omega t - \beta z$ together slides toward $+z$.`, tm: md`$\omega t + \beta z$ together slides toward $-z$.`, pa: md`Two unequal waves going opposite ways: an envelope with no true zeros.` };
      return MC('What kind of wave?', md`$E_x = ${ex}$ V/m is…`, lab[kind],
        Object.keys(lab).filter((k) => k !== kind).map((k) => [lab[k], md`That is what ${k === 'st' ? `$\\sin(${b}z)\\cos\\omega t$` : k === 'pa' ? 'two unequal opposite waves' : k === 'tp' ? `$\\cos(\\omega t - ${b}z)$` : `$\\cos(\\omega t + ${b}z)$`} would be. ${why[kind]}`]),
        md`${why[kind]}`);
    },
    () => {
      const st = pick([0, 1, 2, 3]);
      const S = [
        ['In a pure standing wave, ⟨S⟩ = 0 at every point', true, md`$\tfrac12\Re\{\tilde E\tilde H^*\}$ has a factor $\Re\{\pm j\} = 0$.`],
        ['In a pure standing wave, the instantaneous S is zero at every point and instant', false, md`$S_z = (E_0^2/\eta)\sin2\beta z\sin2\omega t$ sloshes back and forth; it is zero at all times only at the nodes.`],
        ['In a pure standing wave, E and H peak at the same instants', false, md`$E\propto\sin\omega t$ and $H\propto\cos\omega t$: $90°$ apart in time.`],
        ['In a pure standing wave, energy never crosses a node of E or of H', true, md`$S_z \propto \sin2\beta z$ is zero at every node, at all times.`],
      ][st];
      return MC('True or false?', md`"${S[0]}." This statement is…`, S[1] ? 'true' : 'false',
        [[S[1] ? 'false' : 'true', S[2]], ['true only for a perfect conductor in air', md`The medium does not matter; only $|\Gamma| = 1$ does.`], ['true only on average over a wavelength', md`The statement is about each point, and it is ${S[1] ? 'true there' : 'false there'}.`]],
        S[2]);
    },
    () => {
      const m = pick(ER.filter((x) => [1, 2, 3].includes(x.n))), E0 = pick([2, 5, 10, 30]), eps = 1e-9 / (36 * PI) * m.n * m.n, w = eps * E0 * E0;
      return MC('Average energy density', md`A wave of amplitude $E_0 = ${E0}$ V/m in ${medTex(m)} ($\mu = \mu_0$) reflects from a perfect conductor. The time-averaged energy density at an antinode of $E$ is…`, `$${f(w)}$ J/m³`,
        [[`$${f(2 * w)}$ J/m³`, md`That is the peak in time at the antinode, $\tfrac12\epsilon(2E_0)^2$. The average of $\sin^2\omega t$ is $\tfrac12$.`],
          [`$${f(w / 2)}$ J/m³`, md`That is one traveling wave's energy. Two waves are present.`],
          ['$0$', md`Energy sloshes in place; its average is $\epsilon E_0^2$ everywhere.`]],
        md`$\langle w\rangle = \epsilon E_0^2 = (${f(eps)})(${E0})^2 = ${f(w)}$ J/m³, the same at every point (with $\epsilon = ${m.er}\epsilon_0$, $\epsilon_0 = 10^{-9}/36\pi$).`);
    },
    () => {
      const J = pick([0.5, 1, 2, 4]), n = pick([1, 2]), eta = ETA0 / n;
      return MC('Two sheets, half a wavelength apart', md`Two sheets each carry $\tilde{\mathbf J}_s = ${p(J)}\,\hat x$ A/m, half a wavelength apart, in ${n === 1 ? 'free space' : md`a dielectric with $\epsilon_r = 4$`}. The largest $|\tilde E|$ between them is…`, `$${p(J * 120 / n)}\\pi$ V/m`,
        [[`$${p(J * 60 / n)}\\pi$ V/m`, md`That is one sheet's field, $\eta J_0/2$. Midway the two waves add to $\eta J_0$.`],
          ['$0$', md`Zero is the field outside. Inside there is a standing wave.`],
          [`$${p(J * 240 / n)}\\pi$ V/m`, md`That doubles twice: two waves of $\eta J_0/2$ give at most $\eta J_0$.`]],
        md`Inside, $\tilde E = j\eta J_0\sin\beta z$, largest midway: $\eta J_0 = (${etaTex(n)})(${p(J)}) = ${p(J * 120 / n)}\pi$ V/m.`);
    },
  ]);

  // ---------------------------------------------------------------- Topic 12, level 2
  GENS.w4s_pec = () => {
    const g = geom(), m = pick(ER.filter((x) => [1, 2, 3].includes(x.n))), fM = pick([150, 300, 600]), E0 = pick([2, 3, 5, 10]);
    const lam = C0 / (fM * 1e6 * m.n), b = 2 * PI / lam, eta1 = ETA0 / m.n, [r, rt] = pick(DFR.slice(0, 3));
    const Ed = 2 * E0 * Math.sin(2 * PI * r), Et90 = -2 * E0 * Math.sin(2 * PI * r);
    return {
      title: 'A perfect conductor: the standing wave in numbers',
      q: md`Region $${g.reg1}$ is ${medTex(m)} ($\mu = \mu_0$); a perfect conductor fills $${g.reg2}$. The incident wave is $\tilde{\mathbf E}_i = ${hat0(g.a)}\,${E0}e^{${g.sg}j\beta ${g.U}}$ V/m at $f = ${fM}$ MHz. Let $d$ be the distance from the conductor.`,
      parts: [
        trap(N('\\lambda', lam, 'm'), [[C0 / (fM * 1e6), 'That is the free-space wavelength. In the medium λ = c/(f√ε_r).']]),
        trap(N('\\text{nearest }E\\text{ maximum, }d', lam / 4, 'm'), [[lam / 2, 'That is the first E node after the wall. The maximum is halfway.']]),
        trap(N(md`|\tilde E|\text{ at }d = ${rt}`, Ed, 'V/m'), [[2 * E0 * Math.abs(Math.cos(2 * PI * r)), 'That is the H pattern, cos βd. E follows sin βd, zero at the wall.'], [Ed / 2, 'Two waves of amplitude E0: the pattern is 2E0 sin βd.']]),
        trap(N(md`E\text{ along }${hat0(g.a)}\text{ at }d = ${rt},\ \omega t = 90°`, Et90, 'V/m'), [[-Et90, 'Check the sign: the total phasor is 2jE0 sin(βd), and Re{j e^{jωt}} = −sin ωt.']]),
        trap(N(md`|\mathbf J_s|`, 2 * E0 / eta1, 'A/m'), [[E0 / eta1, 'That is the incident H. At the wall H doubles.'], [2 * E0 / ETA0, 'That uses η0; the medium has η1 = 120π/n.']]),
      ],
      hints: [md`$\lambda = c/(f\sqrt{\epsilon_r})$. In terms of $d$, the total phasor is $\tilde{\mathbf E} = ${hat0(g.a)}\,2jE_0\sin(\beta d)$.`, md`$\Re\{2jE_0\sin\beta d\,e^{j\omega t}\} = -2E_0\sin\beta d\sin\omega t$.`],
      sol: md`
        **Step 1: the wavelength.** $n = ${p(m.n)}$:
        $$\lambda = \frac{3\times10^8}{(${fM}\times10^6)(${p(m.n)})} = ${f(lam)}\ \text{m}$$
        so $\beta = 2\pi/\lambda = ${f(b)}$ rad/m.

        **Step 2: the total field.** With $d$ measured from the wall into the medium, the incident wave is $E_0e^{j\beta d}$ and the reflected one is $-E_0e^{-j\beta d}$:
        $$\tilde{\mathbf E} = ${E0}\left(e^{j\beta d} - e^{-j\beta d}\right)${hat0(g.a)} = j${2 * E0}\sin(\beta d)\,${hat0(g.a)}$$
        **Step 3: the first maximum.** $|\sin\beta d| = 1$ first at $d = \lambda/4 = ${f(lam / 4)}$ m.

        **Step 4: at $d = ${rt}$.** $\beta d = 2\pi(${f(r)}) $, so $|\tilde E| = ${2 * E0}|\sin\beta d| = ${f(Ed)}$ V/m.

        **Step 5: in time.** $\Re\{je^{j\omega t}\} = -\sin\omega t$, so $E = -${2 * E0}\sin(\beta d)\sin(\omega t)$ along $${hat0(g.a)}$. At $\omega t = 90°$:
        $$E = -${2 * E0}\sin(\beta d) = ${f(Et90)}\ \text{V/m}$$
        **Step 6: the surface current.** $|\mathbf J_s| = 2E_0/\eta_1 = ${2 * E0}/${f(eta1)} = ${f(2 * E0 / eta1)}$ A/m, along $${hat0(g.a)}$ (the incident $\mathbf E$ at the wall).
      `,
    };
  };

  GENS.w4s_partial = () => {
    const [m1, m2] = two(), Gm = G12(m1.n, m2.n), g = Math.abs(Gm), E0 = pick([3, 4, 6, 10, 12]), fM = pick([100, 150, 300, 500]);
    const lam = C0 / (fM * 1e6 * m1.n), eta1 = ETA0 / m1.n, firstMin = Gm < 0 ? lam / 2 : lam / 4, P = (1 - g * g) * E0 * E0 / (2 * eta1);
    return {
      title: 'A partial standing wave',
      q: md`A wave with $E_0 = ${E0}$ V/m at $f = ${fM}$ MHz travels in ${medTex(m1)} and hits ${medTex(m2)} at normal incidence (both $\mu = \mu_0$). Describe the standing pattern in region 1.`,
      parts: [
        trap(N('\\Gamma', Gm, ''), [[-Gm, 'Region 1 is where the wave comes from: Γ = (n1 − n2)/(n1 + n2).']]),
        trap(N('|E|_{\\max}', (1 + g) * E0, 'V/m'), [[2 * E0, 'That is a perfect conductor. Here the max is (1 + |Γ|)E0.']]),
        trap(N('|E|_{\\min}', (1 - g) * E0, 'V/m'), [[(1 - g * g) * E0, 'That uses |Γ|²; the envelope uses |Γ|.']]),
        trap(N('\\text{VSWR}', (1 + g) / (1 - g), ''), [[(1 - g) / (1 + g), 'VSWR is max over min, at least 1.']]),
        trap(N('\\text{first }E\\text{ minimum with }d > 0', firstMin, 'm'), [[Gm < 0 ? lam / 4 : lam / 2, Gm < 0 ? 'Γ < 0 puts a minimum on the boundary; the next is λ/2 away. λ/4 is a maximum.' : 'Γ > 0 puts a maximum on the boundary; the first minimum is λ/4 away.']]),
        trap(N('\\langle S\\rangle\\text{ in region 1}', P, 'W/m²'), [[E0 * E0 / (2 * eta1), 'That is the incident power alone. Subtract the reflected part: (1 − |Γ|²).']]),
      ],
      hints: [md`$\Gamma = (n_1 - n_2)/(n_1 + n_2)$ and $\lambda = c/(f n_1)$ in region 1.`, md`$\Gamma < 0$: $E$ minimum on the boundary. $\Gamma > 0$: $E$ maximum on the boundary. Minima and maxima alternate every $\lambda/4$.`],
      sol: md`
        **Step 1: Γ.** $n_1 = ${p(m1.n)}$, $n_2 = ${p(m2.n)}$:
        $$\Gamma = \frac{${p(m1.n)} - ${p(m2.n)}}{${p(m1.n)} + ${p(m2.n)}} = ${fr(Gm)}$$
        **Step 2: the envelope.** $|E|_{\max} = (1 + ${fr(g)})(${E0}) = ${f((1 + g) * E0)}$ V/m and $|E|_{\min} = (1 - ${fr(g)})(${E0}) = ${f((1 - g) * E0)}$ V/m. The VSWR is their ratio, $${f((1 + g) / (1 - g))}$.

        **Step 3: where.** In region 1, $\lambda = c/(f n_1) = ${f(lam)}$ m. ${Gm < 0 ? md`$\Gamma < 0$, so the boundary is an $E$ minimum; the next minimum is at $d = \lambda/2 = ${f(lam / 2)}$ m (maxima at $\lambda/4, 3\lambda/4, \dots$).` : md`$\Gamma > 0$, so the boundary is an $E$ maximum; the first minimum is at $d = \lambda/4 = ${f(lam / 4)}$ m.`}

        **Step 4: power.** $\eta_1 = ${f(eta1)}\ \Omega$:
        $$\langle S\rangle = (1 - ${fr(g * g)})\frac{${E0}^2}{2(${f(eta1)})} = ${f(P)}\ \text{W/m}^2$$
        the same at every $d$.
      `,
    };
  };

  GENS.w4s_probe = () => {
    const m1 = pick(ER.filter((x) => [2, 3].includes(x.n))), m2 = pick(ER.filter((x) => x.n !== m1.n)), Gm = G12(m1.n, m2.n), g = Math.abs(Gm);
    const fM = pick([100, 150, 250, 300, 500, 750]), lam = C0 / (fM * 1e6 * m1.n), E0 = pick([2, 3, 4, 6, 9]);
    const mx = (1 + g) * E0, mn = (1 - g) * E0, S = mx / mn;
    return {
      title: 'Read the probe, find the material',
      q: md`Region 1 is ${medTex(m1)} ($\mu = \mu_0$). A probe slides through it toward a flat boundary with an unknown nonmagnetic dielectric. The largest reading is $${f(mx)}$ V/m and the smallest $${f(mn)}$ V/m. Neighbouring minima are $${f(100 * lam / 2)}$ cm apart, and the readings show ${Gm < 0 ? 'a **minimum**' : 'a **maximum**'} at the boundary. Find the VSWR, $\Gamma$ (with its sign), the frequency, the unknown $\epsilon_r$, and $E_0$.`,
      parts: [
        trap(N('\\text{VSWR}', S, ''), [[1 / S, 'Max over min.']]),
        trap(N('\\Gamma', Gm, ''), [[-Gm, Gm < 0 ? 'A minimum on the boundary means 1 + Γ is small: Γ < 0.' : 'A maximum on the boundary means 1 + Γ is large: Γ > 0.']]),
        trap(N('f', fM, 'MHz'), [[fM / 2, 'Minima are λ/2 apart, not λ.'], [fM * m1.n, 'That uses c. The probe is in the medium: v = c/n1.']]),
        trap(N('\\epsilon_{r2}', m2.n * m2.n, ''), [[m2.n, 'That is n2. Square it.']]),
        trap(N('E_0', E0, 'V/m'), [[mx / 2, 'That is half the maximum, true only for |Γ| = 1. E0 = max/(1 + |Γ|).']]),
      ],
      hints: [md`$|\Gamma| = (S - 1)/(S + 1)$; the sign comes from what sits on the boundary.`, md`$\lambda = 2\times$ the minimum spacing; $f = c/(n_1\lambda)$; $n_2 = n_1(1 - \Gamma)/(1 + \Gamma)$.`],
      sol: md`
        **Step 1: VSWR and |Γ|.**
        $$S = \frac{${f(mx)}}{${f(mn)}} = ${f(S)}, \qquad |\Gamma| = \frac{S - 1}{S + 1} = ${fr(g)}$$
        **Step 2: the sign.** ${Gm < 0 ? 'A minimum on the boundary means the bracket 1 + Γ is the small one: Γ is negative.' : 'A maximum on the boundary means the bracket 1 + Γ is the large one: Γ is positive.'} So $\Gamma = ${fr(Gm)}$.

        **Step 3: the frequency.** $\lambda = 2(${f(100 * lam / 2)}\ \text{cm}) = ${f(lam)}$ m in region 1, where $v = c/${p(m1.n)}$:
        $$f = \frac{c}{${p(m1.n)}\lambda} = ${f(fM)}\ \text{MHz}$$
        **Step 4: the material.** $n_2 = n_1(1 - \Gamma)/(1 + \Gamma)$:
        $$n_2 = ${p(m1.n)}\cdot\frac{1 - (${fr(Gm)})}{1 + (${fr(Gm)})} = ${p(m2.n)}$$
        so $\epsilon_{r2} = ${p(m2.n * m2.n)}$.

        **Step 5: E₀.** $E_0 = |E|_{\max}/(1 + |\Gamma|) = ${f(mx)}/(1 + ${fr(g)}) = ${f(E0)}$ V/m. Check: $(1 - |\Gamma|)E_0 = ${f(mn)}$ ✓.
      `,
    };
  };

  GENS.w4s_cavity = () => {
    const g = geom(), n = pick([1, 2]), J0 = pick([0.5, 1, 2, 3]), fM = pick([150, 300, 600]), lam = C0 / (fM * 1e6 * n), eta = ETA0 / n;
    const kind = pick(['half', 'full']), L = kind === 'half' ? lam / 2 : lam, J2 = kind === 'half' ? J0 : -J0;
    const [r, rt] = pick([[1 / 12, '\\lambda/12'], [1 / 8, '\\lambda/8'], [1 / 6, '\\lambda/6']]);
    const U1 = AXN[g.u];
    return {
      title: 'Two sheets that trap a standing wave',
      q: md`In ${n === 1 ? 'free space' : md`a dielectric with $\epsilon_r = 4$ ($\mu = \mu_0$)`}, one sheet at $${U1} = 0$ carries $\tilde{\mathbf J}_s = ${p(J0)}\,${hat0(g.a)}$ A/m and another at $${U1} = ${f(L)}$ m carries $${p(J2)}\,${hat0(g.a)}$ A/m. The frequency is $${fM}$ MHz.`,
      parts: [
        trap(N('\\lambda', lam, 'm'), [[C0 / (fM * 1e6), 'That is the free-space wavelength.']]),
        trap(N('|\\tilde E|_{\\max}\\text{ between the sheets}', eta * J0, 'V/m'), [[eta * J0 / 2, 'That is one sheet alone. The two waves add to ηJ0 at the antinodes.']]),
        trap(N(md`|\tilde E|\text{ at }${rt}\text{ from the first sheet}`, eta * J0 * Math.abs(Math.sin(2 * PI * r)), 'V/m'), [[eta * J0 * Math.abs(Math.cos(2 * PI * r)), 'That uses cos. E has nodes on the sheets, so it goes as sin of the distance from a sheet.']]),
        trap(N('|\\tilde H|\\text{ at the first sheet}', J0, 'A/m'), [[J0 / 2, 'That is one sheet alone. H jumps by J0 across the sheet, from 0 outside.']]),
        { lbl: md`The field beyond the second sheet is`, mc: ['zero', md`a traveling wave of amplitude $\eta J_0$`, md`a traveling wave of amplitude $\eta J_0/2$`, 'a standing wave'], a: 0,
          why: [null, md`That needs the two waves to add outside, which these currents and this spacing prevent.`, md`That is one sheet alone; the other sheet's wave cancels it.`, md`Outside, both waves travel the same way.`] },
      ],
      hints: [md`Each sheet radiates $-\tfrac{\eta}{2}\tilde{\mathbf J}_se^{-j\beta|${U1} - ${U1}_0|}$.`, md`Check whether $1 + (J_2/J_1)e^{j\beta L}$ is zero: then the outside fields cancel and the inside is a pure standing wave.`],
      sol: md`
        **Step 1: the wavelength.** $\lambda = c/(f n) = ${f(lam)}$ m, so the spacing $${f(L)}$ m is ${kind === 'half' ? '$\\lambda/2$' : '$\\lambda$'} and $e^{j\beta L} = ${kind === 'half' ? '-1' : '+1'}$.

        **Step 2: outside.** Beyond the second sheet both waves travel away:
        $$\tilde E \propto J_1 + J_2e^{j\beta L} = ${p(J0)} + (${p(J2)})(${kind === 'half' ? '-1' : '1'}) = 0$$
        Zero, and the same on the other side.

        **Step 3: inside.** Sheet 1's wave goes one way, sheet 2's the other. With $u$ the distance from sheet 1:
        $$\tilde E = -\frac{\eta}{2}\left(J_1e^{-j\beta u} + J_2e^{-j\beta(L - u)}\right)$$
        and $J_2e^{-j\beta L} = -J_1$, so the bracket is $J_1(e^{-j\beta u} - e^{j\beta u}) = -2jJ_1\sin\beta u$:
        $$\tilde E = j\eta J_0\sin(\beta u)\ \text{along}\ ${hat0(g.a)}$$
        The largest $|\tilde E|$ is $\eta J_0 = (${f(eta)})(${p(J0)}) = ${f(eta * J0)}$ V/m.

        **Step 4: at $u = ${rt}$.** $|\tilde E| = ${f(eta * J0)}|\sin(2\pi\cdot${f(r)})| = ${f(eta * J0 * Math.abs(Math.sin(2 * PI * r)))}$ V/m.

        **Step 5: H at the sheet.** Inside, $|\tilde H| = J_0|\cos\beta u|$, so at the sheet it is $${p(J0)}$ A/m: exactly the jump the sheet's current demands, since $H = 0$ outside.
      `,
    };
  };

  // ---------------------------------------------------------------- Topic 12, level 3
  GENS.w4s_exam = () => {
    const g = geom(), J0 = pick([-4, -2, -1, 1, 2, 3]), fM = pick([150, 300, 600]), lam = C0 / (fM * 1e6), b = 2 * PI / lam, L = lam / 2;
    const U1 = AXN[g.u], [hh, sh] = crossAx(g.u, 1, g.a, 1), C = ETA0 * J0, D = -J0;
    const Hd = hat0(hh, sh), Av = hat0(g.a);
    const wAvg = MU0 * J0 * J0 / 4;
    return {
      title: 'Exam problem: two sheets, all three regions',
      q: md`Two infinite current sheets lie on $${U1} = 0$ and $${U1} = ${f(L)}$ m, each with $\tilde{\mathbf J}_s = ${p(J0)}\,${Av}$ A/m. All of space is free space and $f = ${fM}$ MHz. (a) Find $\lambda$ and $\beta$. (b) Between the sheets write $\tilde{\mathbf E} = jC\sin(\beta ${U1})\,${Av}$: find $C$. (c) Between the sheets write $\tilde{\mathbf H} = D\cos(\beta ${U1})\,${Hd}$: find $D$. (d) What is the field for $${U1} > ${f(L)}$ m? (e) Find $E$ along $${Av}$ at $${U1} = \lambda/4$ when $\omega t = 90°$. (f) Find the time-averaged energy density between the sheets. (g) What is $\langle\mathbf S\rangle$ between the sheets?`,
      parts: [
        trap(N('(a)\\ \\lambda', lam, 'm'), [[lam / 2, 'That is the spacing, λ/2.']]),
        trap(N('(a)\\ \\beta', b, 'rad/m'), [[1 / lam, 'β = 2π/λ.']]),
        trap(N('(b)\\ C', C, 'V/m'), [[-C, 'Check the sign: inside, E = −(η0/2)J0(e^{−jβu} − e^{jβu}) = jη0J0 sin βu.'], [C / 2, 'That is one sheet. The two waves add.'], [J0 * 240, 'That drops the π of η0 = 120π (the posted SP24 key makes this slip).']]),
        trap(N('(c)\\ D', D, 'A/m'), [[-D, `Check the sign with the jump condition at the first sheet: n̂ × (H_inside − 0) = J_s.`]]),
        { lbl: md`(d) For $${U1} > ${f(L)}$ m the field is`, mc: ['zero', md`a traveling wave of amplitude $${f(Math.abs(C))}$ V/m`, md`a traveling wave of amplitude $${f(Math.abs(C) / 2)}$ V/m`, 'a standing wave'], a: 0,
          why: [null, md`The waves cancel: $1 + e^{j\beta L} = 1 + e^{j\pi} = 0$.`, md`That is one sheet alone.`, md`Outside, both waves travel the same way.`] },
        trap(N(md`(e)\ E\text{ at }\lambda/4,\ \omega t = 90°`, -C, 'V/m'), [[C, 'Re{jC e^{jωt}} = −C sin ωt: at ωt = 90° it is −C.']]),
        trap(N('(f)\\ \\langle w\\rangle', wAvg, 'J/m³'), [[2 * wAvg, 'Each wave has amplitude η0|J0|/2, and ⟨w⟩ = ε0(η0J0/2)² for the pair. Check the factor 2.']]),
        { lbl: md`(g) $\langle\mathbf S\rangle$ between the sheets is`, mc: ['zero', md`along $${hat0(g.u)}$`, md`along $${hat0(g.u, -1)}$`, md`along $${Av}$`], a: 0,
          why: [null, md`The two waves carry equal power in opposite directions. $\tilde E$ and $\tilde H$ are $90°$ apart.`, md`The two waves carry equal power in opposite directions.`, md`$\mathbf S$ is perpendicular to $\mathbf E$.`] },
      ],
      hints: [md`Each sheet: $\tilde{\mathbf E} = -\tfrac{\eta_0}{2}\tilde{\mathbf J}_se^{-j\beta|${U1} - ${U1}_0|}$. Inside, sheet 2's wave travels toward $${hat0(g.u, -1)}$.`, md`$e^{-j\beta(L - ${U1})} = -e^{j\beta ${U1}}$ when $\beta L = \pi$. For $H$, use $\hat k\times\tilde{\mathbf E}/\eta_0$ for each wave.`],
      sol: md`
        **(a)** $\lambda = c/f = ${f(lam)}$ m and $\beta = 2\pi/\lambda = ${f(b)}$ rad/m. The spacing is $\lambda/2$.

        **(b) E inside.** Each sheet radiates $-\tfrac{\eta_0}{2}J_0 = ${f(-ETA0 * J0 / 2)}$ V/m times $e^{-j\beta|${U1} - ${U1}_0|}$, along $${Av}$. Inside, $|${U1} - L| = L - ${U1}$ and $e^{-j\beta L} = -1$:
        $$\tilde E = -\frac{\eta_0J_0}{2}\left(e^{-j\beta ${U1}} - e^{j\beta ${U1}}\right)$$
        The bracket is $-2j\sin\beta ${U1}$:
        $$\tilde E = j\eta_0J_0\sin\beta ${U1}, \qquad C = 120\pi(${p(J0)}) = ${f(C)}\ \text{V/m}$$
        **(c) H inside.** Sheet 1's wave travels toward $${hat0(g.u)}$: $\tilde{\mathbf H}_1 = ${hat0(g.u)}\times\tilde{\mathbf E}_1/\eta_0 = -\tfrac{J_0}{2}e^{-j\beta ${U1}}\,${Hd}$. Sheet 2's travels toward $${hat0(g.u, -1)}$ with $\tilde E_2 = +\tfrac{\eta_0J_0}{2}e^{j\beta ${U1}}$: $\tilde{\mathbf H}_2 = -\tfrac{J_0}{2}e^{j\beta ${U1}}\,${Hd}$. Add:
        $$\tilde{\mathbf H} = -J_0\cos(\beta ${U1})\,${Hd}, \qquad D = ${p(D)}\ \text{A/m}$$
        Check at the first sheet: $${hat0(g.u)}\times(${p(D)}\,${Hd}) = ${p(J0)}\,${Av} = \tilde{\mathbf J}_s$ ✓.

        **(d)** For $${U1} > L$ both waves travel away, and $1 + e^{j\beta L} = 0$: the field is **zero**. The same for $${U1} < 0$.

        **(e)** $E = \Re\{jC\sin(\beta ${U1})e^{j\omega t}\} = -C\sin(\beta ${U1})\sin\omega t$. At $${U1} = \lambda/4$, $\sin = 1$; at $\omega t = 90°$, $\sin = 1$: $E = -C = ${f(-C)}$ V/m.

        **(f)** The inside is two waves of amplitude $\eta_0|J_0|/2$ going opposite ways, so $\langle w\rangle = \epsilon_0(\eta_0J_0/2)^2 = \mu_0J_0^2/4$:
        $$\langle w\rangle = \frac{(4\pi\times10^{-7})(${p(J0 * J0)})}{4} = ${f(wAvg)}\ \text{J/m}^3$$
        **(g)** Zero: $\tilde E$ has a factor $j$ and $\tilde H$ is real, so $\tfrac12\Re\{\tilde E\tilde H^*\} = 0$.

        **Speed path.** $\lambda/2$ spacing and equal currents: zero outside, $|C| = \eta_0|J_0|$, $|D| = |J_0|$. Fix both signs with the jump condition at the first sheet.

        **Where points go.** Dropping the $\pi$ in $\eta_0$; using $e^{-j\beta ${U1}}$ for sheet 2's wave inside; unsimplified exponentials; a sign slip in $\hat k\times\tilde{\mathbf E}$.
      `,
    };
  };

  // ---------------------------------------------------------------- Topic 12, the question bank
  EM.BANK['w4-standing'] = [
    Q(md`Fall 2023 #1(d) draws several snapshots of a field against $z$ on one axis: every curve crosses zero at the same evenly spaced points, and only the heights differ from one snapshot to the next. It could represent…`,
      ['either the electric or the magnetic field of a standing wave', 'only the electric field of a standing wave', 'the electric field of a traveling wave', 'either the electric field of a standing wave or of a traveling wave'], 0,
      [null, md`$H$ of a standing wave has the same shape, shifted by $\lambda/4$. Without a boundary drawn you cannot tell them apart.`, md`A traveling wave's zeros move from one snapshot to the next.`, md`A traveling wave's zeros move; these do not.`],
      md`Fixed zeros and changing heights: a standing pattern. $E$ and $H$ standing patterns look alike, so either fits, as the FA23 key says.`, { src: 'Fall 2023 #1(d)' }),
    Q(md`The total phasor in front of a perfect conductor is $\tilde E = -2jE_0\sin\beta z$ because…`,
      [md`$e^{-j\beta z} - e^{j\beta z} = -2j\sin\beta z$, with $\Gamma = -1$`, md`$e^{-j\beta z} + e^{j\beta z} = -2j\sin\beta z$`, md`the conductor absorbs half the wave`, md`$\Gamma = +1$ at a conductor`], 0,
      [null, md`A sum of the two exponentials is $2\cos\beta z$.`, md`A perfect conductor absorbs nothing.`, md`$\Gamma = -1$ at a conductor, because $\eta_2 = 0$.`],
      md`$\sin x = (e^{jx} - e^{-jx})/2j$, so $e^{-jx} - e^{jx} = -2j\sin x$.`),
    Q(md`In front of a perfect conductor, $\mathbf E = 2E_0\sin\beta z\sin\omega t$ and $\mathbf H \propto \cos\beta z\cos\omega t$. Which describes them?`,
      ['E and H are 90° apart in space and in time', 'E and H are in phase in time', 'E and H are 180° apart in time', 'E and H are in phase in space'], 0,
      [null, md`$\sin\omega t$ and $\cos\omega t$ are $90°$ apart.`, md`$\sin$ and $\cos$ are a quarter period apart, not half.`, md`$\sin\beta z$ and $\cos\beta z$ are a quarter wavelength apart.`],
      md`Space: sin against cos ($\lambda/4$). Time: sin against cos ($T/4$).`),
    Q(md`A wave in a dielectric with $\epsilon_r = 9$ reflects from a perfect conductor at $f = 100$ MHz. The nearest $E$ maximum to the conductor is…`,
      ['25 cm away', '75 cm away', '50 cm away', 'on the conductor'], 0,
      [null, md`That uses the free-space $\lambda = 3$ m.`, md`That is $\lambda/2$, the next node.`, md`$E$ is zero on a conductor.`],
      md`$\lambda = c/(f\cdot3) = 1$ m; the maximum is at $\lambda/4 = 25$ cm.`),
    Q(md`In front of a perfect conductor, at $d = \lambda/8$ from it, $|E|$ and $|H|$ (in units of $E_0$ and $E_0/\eta_1$) are…`,
      [md`$\sqrt2$ and $\sqrt2$`, md`$2$ and $0$`, md`$1$ and $1$`, md`$\sqrt2$ and $0$`], 0,
      [null, md`Those are at $d = \lambda/4$.`, md`That drops the factor 2 of the standing wave.`, md`$H$ is zero only at $d = \lambda/4, 3\lambda/4, \dots$`],
      md`$\beta d = \pi/4$: $2|\sin45°| = \sqrt2$ and $2|\cos45°| = \sqrt2$. Here electric and magnetic energy peaks are equal.`),
    Q(md`The instantaneous Poynting vector in a pure standing wave, $S_z = (E_0^2/\eta)\sin2\beta z\sin2\omega t$, is…`,
      ['zero at all times at every node of E or H, and oscillating at 2ω elsewhere', 'zero everywhere at all times', 'constant in time, varying in space', 'largest at the nodes of E'], 0,
      [null, md`Only its time average is zero everywhere.`, md`It has a factor $\sin2\omega t$.`, md`At a node of $E$, $\sin2\beta z = 0$.`],
      md`$\sin2\beta z = 0$ at every multiple of $\lambda/4$: exactly the nodes of $E$ and of $H$.`),
    Q(md`Why is $\langle w\rangle$ the same at every point of a pure standing wave?`,
      [md`$\sin^2\beta z$ (electric) and $\cos^2\beta z$ (magnetic) add to 1 after time-averaging`, md`Because $E$ and $H$ are both zero on average`, md`Because the wave travels and spreads the energy`, md`It is not; it is zero at the nodes`], 0,
      [null, md`Their squares do not average to zero.`, md`A pure standing wave does not travel.`, md`At an $E$ node the energy is magnetic, and its average is the same size.`],
      md`$\langle w\rangle = \epsilon E_0^2(\sin^2\beta z + \cos^2\beta z) = \epsilon E_0^2$.`),
    Q(md`On a transmission line ended in a short, $\tilde V(d) = j2\tilde V^+\sin\beta d$. The field version of this is…`,
      ['the electric field in front of a perfect conductor', 'the magnetic field in front of a perfect conductor', 'a traveling wave in a matched medium', 'the field between two sheets one wavelength apart with equal currents'], 0,
      [null, md`$H$ goes as $\cos$, like the current on a shorted line.`, md`A matched line has no standing wave.`, md`Equal currents one wavelength apart add outside, not cancel.`],
      md`A short forces $V = 0$, a conductor forces $E = 0$: both give $\sin\beta d$ from the end.`),
    Q(md`$\Gamma = -0.5$ and $E_0 = 10$ V/m. The VSWR and the smallest $|E|$ are…`,
      ['3 and 5 V/m', '3 and 0 V/m', '1/3 and 5 V/m', '2 and 5 V/m'], 0,
      [null, md`Zero minimum is only for $|\Gamma| = 1$.`, md`VSWR is max over min, at least 1.`, md`$(1 + 0.5)/(1 - 0.5) = 3$, not 2.`],
      md`Max $15$, min $5$, VSWR $3$.`),
    Q(md`Neighbouring minima of a partial standing wave are 40 cm apart in air. The frequency is…`,
      ['375 MHz', '750 MHz', '187.5 MHz', '1.5 GHz'], 0,
      [null, md`That takes $\lambda = 40$ cm. Minima are $\lambda/2$ apart, so $\lambda = 80$ cm.`, md`That takes $\lambda = 160$ cm.`, md`That takes $\lambda = 20$ cm.`],
      md`$\lambda = 0.8$ m, $f = 3\times10^8/0.8 = 375$ MHz.`),
    Q(md`A probe in air in front of a dielectric reads max 9 V/m and min 1 V/m. $|\Gamma|$ is…`,
      [md`$\tfrac45$`, md`$\tfrac19$`, md`$\tfrac89$`, md`$\tfrac{5}{4}$`], 0,
      [null, md`That is $1/S$.`, md`That is $(S - 1)/S$.`, md`That is upside down; $|\Gamma| \le 1$.`],
      md`$S = 9$, $|\Gamma| = 8/10 = \tfrac45$.`),
    Q(md`A partial standing wave carries net power. That power is…`,
      [md`$(1 - |\Gamma|^2)|E_0|^2/2\eta_1$ at every point of region 1`, md`largest at the maxima of the envelope`, md`zero at the minima of the envelope`, md`$(1 + |\Gamma|^2)|E_0|^2/2\eta_1$`], 0,
      [null, md`Energy cannot pile up anywhere on average, so the flow is the same at every $d$.`, md`Only a pure standing wave carries zero; the minimum here is not zero.`, md`The reflected power flows backward and subtracts.`],
      md`The cross terms of $\tilde E\tilde H^*$ are purely imaginary, so the real part is $1 - |\Gamma|^2$ at every $d$.`),
    Q(md`$\Gamma = +\tfrac13$ at a boundary. Where are the $H$ maxima?`,
      [md`at $d = \lambda/4, 3\lambda/4, \dots$`, md`at $d = 0, \lambda/2, \dots$`, md`at $d = \lambda/8, 5\lambda/8, \dots$`, 'nowhere: H has no standing pattern'], 0,
      [null, md`Those are the $E$ maxima for $\Gamma > 0$. $H$ peaks where $E$ is smallest.`, md`The maxima are where the bracket's angle is a multiple of $2\pi$; $\lambda/8$ gives $90°$.`, md`$H$ has the bracket $1 - \Gamma e^{-j2\beta d}$, which varies just as much.`],
      md`$|H| \propto |1 - \Gamma e^{-j2\beta d}|$, largest when $\Gamma e^{-j2\beta d} = -|\Gamma|$: $2\beta d = \pi$, $d = \lambda/4$.`),
    Q(md`Why is the period of the envelope $\lambda/2$ and not $\lambda$?`,
      [md`The bracket has $e^{-j2\beta d}$: the reflected wave's path out and back doubles the phase`, md`Because $\Gamma$ halves the wavelength`, md`Because the wave slows down by half near the boundary`, md`It is $\lambda$ for a perfect conductor`], 0,
      [null, md`$\Gamma$ is a fixed number; it does not change $\lambda$.`, md`The speed is set by the medium, the same everywhere in region 1.`, md`Nodes of $\sin\beta z$ are $\lambda/2$ apart too.`],
      md`$2\beta d$ advances by $2\pi$ when $d$ grows by $\lambda/2$.`),
    Q(md`Spring 2024 #1: what is $\tilde{\mathbf H}$ between the sheets?`,
      [md`$2\cos(2\pi z)\,\hat y$ A/m`, md`$-2\cos(2\pi z)\,\hat y$ A/m`, md`$-j2\sin(2\pi z)\,\hat y$ A/m`, md`$\cos(2\pi z)\,\hat y$ A/m`], 0,
      [null, md`Check the jump at $z = 0$: $\hat z\times(\mathbf H_{\text{in}} - 0)$ must equal $-2\hat x$, so $\mathbf H_{\text{in}}(0) = +2\hat y$.`, md`That is the $E$ pattern. $H$ has antinodes on the sheets.`, md`That is one sheet's contribution at each point; the two add.`],
      md`$\tilde{\mathbf H} = (e^{-j2\pi z} + e^{j2\pi z})\hat y = 2\cos(2\pi z)\hat y$ A/m, as the key says.`, { src: 'Spring 2024 #1(b)(ii)' }),
    Q(md`Spring 2024 #1's posted key gives $\tilde{\mathbf E}(0 < z < 0.5) = -240j\sin(2\pi z)\hat x$ V/m. What is wrong?`,
      [md`The amplitude should be $240\pi$: $\eta_0 = 120\pi$, so $\eta_0|J_0| = 240\pi$`, md`The sign should be $+$`, md`It should be a cosine`, md`Nothing; it is correct`], 0,
      [null, md`The sign is right: $j\eta_0J_0\sin\beta z$ with $J_0 = -2$.`, md`$E$ must vanish on the sheets, where $\sin$ is zero.`, md`It dropped the $\pi$.`],
      md`$\tilde E = j(120\pi)(-2)\sin(2\pi z) = -j240\pi\sin(2\pi z)$, amplitude about 754 V/m.`, { src: 'Spring 2024 #1(a)(ii), key error' }),
    Q(md`Two sheets one wavelength apart carry equal currents $J_0\hat x$ in free space. Outside them the field is…`,
      [md`a traveling wave of amplitude $\eta_0J_0$`, 'zero', md`a traveling wave of amplitude $\eta_0J_0/2$`, 'a standing wave'], 0,
      [null, md`Zero needs $1 + e^{j\beta L} = 0$, which is $L = \lambda/2$ for equal currents.`, md`That is one sheet alone; here the two add.`, md`Outside, both waves travel the same way.`],
      md`$1 + e^{j2\pi} = 2$: the two waves add to $2\cdot\eta_0J_0/2$.`),
    Q(md`$\tilde E = 6\sin(4z)$ V/m (a real phasor). Its time-domain form is…`,
      [md`$6\sin(4z)\cos(\omega t)$`, md`$6\sin(4z)\sin(\omega t)$`, md`$6\sin(4z - \omega t)$`, md`$6\cos(\omega t - 4z)$`], 0,
      [null, md`A real phasor gives $\cos\omega t$; $\sin\omega t$ needs a $-j$.`, md`That is a traveling wave.`, md`That is a traveling wave.`],
      md`$\Re\{6\sin(4z)e^{j\omega t}\} = 6\sin(4z)\cos\omega t$.`),
    Q(md`Where in front of a perfect conductor would a thin new metal sheet (parallel to it) leave the field unchanged?`,
      [md`at any node of $E$: $d = \lambda/2, \lambda, \dots$`, md`at any node of $H$: $d = \lambda/4, \dots$`, 'anywhere', 'nowhere'], 0,
      [null, md`At an $H$ node $E$ is largest; a conductor there would force it to zero and change everything.`, md`A conductor forces $E = 0$, which only holds at $E$ nodes.`, md`At $E$ nodes the field already satisfies the conductor's condition.`],
      md`The sheet needs $E = 0$ on it, true at $d = n\lambda/2$; the current it carries matches the $H$ there.`),
    Q(md`$\Gamma = -1$, $E_0 = 3$ V/m, and $\omega t = 90°$. At $d = \lambda/4$ from the conductor, the total $E$ (along the incident direction) is…`,
      ['−6 V/m', '6 V/m', '0', '3 V/m'], 0,
      [null, md`In $d$ the phasor is $2jE_0\sin\beta d$, and $\Re\{je^{j\omega t}\} = -\sin\omega t$.`, md`$\lambda/4$ is an antinode of $E$.`, md`Two waves at an antinode give $2E_0$.`],
      md`$E = -2E_0\sin(\beta d)\sin\omega t = -2(3)(1)(1) = -6$ V/m.`),
    Q(md`A perfectly matched boundary ($\Gamma = 0$). The envelope in region 1 is…`,
      ['flat: |E| = E0 everywhere', 'zero at the boundary', 'largest at the boundary', 'periodic with period λ/2 and nodes'], 0,
      [null, md`Nothing reflects, so there is nothing to interfere with.`, md`$|E|$ at the boundary is $\tau E_0 = E_0$.`, md`No reflected wave, no pattern.`],
      md`$|1 + 0\cdot e^{-j2\beta d}| = 1$.`),
  ];
})();

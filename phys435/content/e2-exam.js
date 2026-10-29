/* Hour Exam II toolkit: what to memorize, speed tricks, the common-setups table, a rapid-fire round,
   two timed mock exams and the concept quiz. zz-scope.js places these lessons on the study path. */
(function () {
  'use strict';
  const { R, Q, G } = C;

  const paper = (title, items) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>PHYS 435 · ${title}</span><span>100 pts</span></div><div class="pp-meta"><span>50 minutes</span><span>Formula sheet allowed</span></div>`,
    items,
  });

  C.unit({
    id: 'h-e2-exam', num: '', title: 'Exam II toolkit (holding)',
    lessons: [
      // ------------------------------------------------------------------ memorize
      {
        id: 'e2-sheet', title: 'Formula sheet: what you get and what to memorize', kind: 'read',
        steps: [
          R(md`
            **What the sheet likely has.** Exam I's sheet already listed Maxwell's equations, Biot–Savart, $\vb F = q(\vb E + \vb v\times\vb B)$, the Physics 212 results ($\mu_0I/2\pi s$, $\mu_0nI$, $\mu_0NI/2\pi s$) and the coordinate formulas (the full typed version is in the Exam I review under "The formula sheet"). Expect the Exam II sheet to look like it. Check the course schedule's "Formula sheet" link under Hour Exam II as soon as it is posted, and **assume nothing about materials is printed** until you have seen it.

            ### Memorize cold (one page)

            **Polarization and dielectrics**

            $$\sigma_b = \vb P\cdot\uv n,\quad\rho_b = -\nabla\cdot\vb P,\quad\vb D = \varepsilon_0\vb E + \vb P,\quad\oint\vb D\cdot d\vb a = Q_f,\quad\vb D = \varepsilon\vb E,\quad\varepsilon = \varepsilon_0(1+\chi_e)$$

            $$D^\perp_1 - D^\perp_2 = \sigma_f,\quad E^\parallel\text{ continuous},\quad W = \tfrac12\int\vb D\cdot\vb E\,d\tau,\quad F = \tfrac12V^2\frac{dC}{dx}$$

            $$\vb N = \vb p\times\vb E,\quad U = -\vb p\cdot\vb E,\quad\vb F = \nabla(\vb p\cdot\vb E)$$

            **Magnetostatics**

            $$\vb B_{\text{seg}} = \frac{\mu_0I}{4\pi s}(\sin\theta_2 - \sin\theta_1),\quad B_{\text{arc}} = \frac{\mu_0I\phi}{4\pi R},\quad B_{\text{axis}} = \frac{\mu_0IR^2}{2(R^2+z^2)^{3/2}},\quad B_{\text{sheet}} = \frac{\mu_0K}{2}$$

            $$\vb B = \nabla\times\vb A,\quad\vb A = \frac{\mu_0}{4\pi}\int\frac{\vb J}{\srm}d\tau,\quad\oint\vb A\cdot d\vb l = \Phi_B,\quad\vb B_{\text{above}} - \vb B_{\text{below}} = \mu_0\vb K\times\uv n$$

            $$\vb m = I\vb a,\quad\vb B_{\text{dip}} = \frac{\mu_0m}{4\pi r^3}(2\cos\theta\,\uv r + \sin\theta\,\hat{\boldsymbol\theta}),\quad\vb A_{\text{dip}} = \frac{\mu_0}{4\pi}\frac{\vb m\times\uv r}{r^2},\quad\vb N = \vb m\times\vb B,\quad\vb F = \nabla(\vb m\cdot\vb B)$$

            **Magnetic matter**

            $$\vb J_b = \nabla\times\vb M,\quad\vb K_b = \vb M\times\uv n,\quad\vb H = \vb B/\mu_0 - \vb M,\quad\oint\vb H\cdot d\vb l = I_f,\quad\vb B = \mu\vb H,\quad\mu = \mu_0(1+\chi_m)$$

            **Results worth their weight**

            | Thing | Result |
            |---|---|
            | Uniformly polarized sphere | $\vb E_{\text{in}} = -\vb P/3\varepsilon_0$; outside dipole $\vb p = \frac43\pi R^3\vb P$ |
            | Dielectric sphere in $\vb E_0$ | $\vb E_{\text{in}} = \dfrac{3}{\varepsilon_r+2}\vb E_0$ |
            | Depolarization | $E_{\text{in}} = E_0/(1 + N\chi_e)$; $N$: slab⊥ 1, sphere ⅓, cylinder⊥ ½, along 0 |
            | Spinning shell | $\vb B_{\text{in}} = \frac23\mu_0\sigma\omega R\,\hat{\mathbf z}$; $m = \frac43\pi\sigma\omega R^4$ |
            | Uniformly magnetized sphere | $\vb B_{\text{in}} = \frac23\mu_0\vb M$; $\vb m = \frac43\pi R^3\vb M$ |
            | Spinning anything | $m = \dfrac{Q}{2M}L$ |
            | Hole in a wire | $\vb B = \frac{\mu_0}{2}\vb J\times\vb d$, uniform |
            | $n$-gon center | $\dfrac{n\mu_0I}{2\pi R}\sin\dfrac\pi n$ |
          `),
        ],
      },

      // ------------------------------------------------------------------ speed
      {
        id: 'e2-speed', title: 'Beating the clock: twelve speed tricks',
        steps: [
          R(md`
            Kuo's exams are long on purpose. The students who finish aren't faster at algebra; they skip it. Every trick below replaces a page of work with a line.

            !!method Exam triage (first 2 minutes)
                Read every problem. Mark each part **S** (a standard result you can write down), **R** (a recipe you know, 3–5 min), or **H** (real work). Do all the S parts on every problem first, then R, then H. Writing the setup of an H part (correct form of $V$, correct BCs, correct Ampère loop) usually earns most of its points even if you never finish the algebra.

            ### Shortcuts that skip whole calculations

            1. **No free charge + symmetry → $\vb D = 0$**, so $\vb E = -\vb P/\varepsilon_0$ inside, $0$ outside. (HW 4.10, 4.15.)
            2. **No free current + symmetry → $\vb H = 0$**, so $\vb B = \mu_0\vb M$. (HW 6.8, 6.12.)
            3. **Depolarizing factor $N$.** Uniform $\vb P$: $\vb E_{\text{in}} = -N\vb P/\varepsilon_0$. Linear in $\vb E_0$: $E_{\text{in}} = E_0/(1 + N\chi_e)$. Uniform $\vb M$: $\vb B_{\text{in}} = \mu_0(1-N)\vb M$. One number per shape: slab⊥ 1, sphere ⅓, long cylinder⊥ ½, long rod along 0.
            4. **$m = \dfrac{Q}{2M}L$.** Magnetic moment of anything spinning, from its moment of inertia.
            5. **Recognize the current.** $\sin\theta\,\hat{\boldsymbol\phi}$ on a sphere = spinning shell (uniform inside). $M\hat{\boldsymbol\phi}$ on a cylinder's side = solenoid. $\hat{\boldsymbol\phi}$-directed $\vb M$ = toroid (field trapped inside).
            6. **Pieces on the line give zero.** In bent-wire Biot–Savart, cross off straight pieces whose line passes through the point, then use the segment / arc table.
            7. **The half-trick.** Beside the end of a semi-infinite wire: $\mu_0I/4\pi s$. Mouth of a semi-infinite solenoid: $\mu_0nI/2$.
            8. **Series/parallel capacitors.** Stacked dielectrics: same $D$, add $d_i/\varepsilon_i$. Side by side: same $E$, add $\varepsilon_iA_i$. Coax shells: add $\ln(b_i/a_i)/\varepsilon_i$.
            9. **$W = \tfrac12QV$** instead of $\tfrac12\int\vb D\cdot\vb E$, once you have $V$.
            10. **Force by energy.** $F = \tfrac12V^2\,dC/dx$; things move to raise $C$. Dipoles: $F = \nabla(\vb m\cdot\vb B)$, one derivative of a scalar.
            11. **Steal the electrostatics answer.** $\vb A$ from $\vb J$ is $V$ from $\rho$ with $\rho/\varepsilon_0\to\mu_0J$, per component. Magnetic dipole field = electric dipole field with $p/\varepsilon_0\to\mu_0m$. Linear magnetic media = linear dielectrics with $\varepsilon\to\mu$.
            12. **Superpose holes.** Cavity or hole = whole object + a negative copy. Gives uniform fields in off-center holes.

            ### Checks that take 10 seconds

            - **Total bound charge = 0. Total bound current = 0** (through any cross-section of a magnetized object with no net free current).
            - **Limits:** $\varepsilon_r\to1$ (vacuum), $\varepsilon_r\to\infty$ (conductor), $\chi_m\to0$, $a\to0$, $b\to a$, $n\to\infty$.
            - **Units:** $\mu_0I/\text{length}$, $\mu_0K$, $\mu_0M$, $\mu_0\sigma v$ are all tesla. $P$, $D$, $\sigma$ are C/m². $M$, $H$, $K$ are A/m.
            - **Continuity at the boundary:** your inside and outside answers must match the BCs at the surface ($B$ for a wire at $s = a$; $E^\parallel$; $D^\perp$).

            ### Classic traps

            - Using $\varepsilon_0E^2/2$ instead of $\tfrac12\vb D\cdot\vb E$ for the energy with dielectrics.
            - $\vb E$ inside a polarized sphere is **against** $\vb P$; $\vb B$ inside a magnetized sphere is **along** $\vb M$.
            - Uniform $\vb P$ charges the caps; uniform $\vb M$ puts current on the sides.
            - $\sin\theta$ in the spinning-sphere speed $\omega r\sin\theta$.
            - Force on a current sheet uses the **other** sheet's field (or the average), not the total.
            - On an inner surface, $\uv n$ points **inward** (toward the axis or center).
            - Fixed $Q$ vs fixed $V$ when a dielectric is inserted.
          `),
          Q(md`A thin disk is uniformly polarized perpendicular to its faces. Without calculating, $\vb E$ inside is approximately`,
            [md`$-\vb P/\varepsilon_0$`, md`$-\vb P/3\varepsilon_0$`, md`$0$`, md`$+\vb P/\varepsilon_0$`], 0,
            [null, md`Sphere, $N = \tfrac13$.`, md`Long rod along $\vb P$, $N = 0$.`, md`Sign: $\vb E$ inside always opposes $\vb P$ for frozen-in polarization.`],
            md`Thin slab ⊥ $\vb P$: $N = 1$. It's a parallel-plate capacitor with $\sigma = \pm P$.`),
          Q(md`A thin disk is uniformly **magnetized** perpendicular to its faces. $\vb B$ inside is approximately`,
            [md`$0$`, md`$\mu_0\vb M$`, md`$-\mu_0\vb M$`, md`$\tfrac23\mu_0\vb M$`], 0,
            [null, md`That's a long rod along $\vb M$ ($N = 0$).`, md`That's $\mu_0\vb H$, not $\vb B$.`, md`That's the sphere.`],
            md`$\vb B_{\text{in}} = \mu_0(1 - N)\vb M$ with $N = 1$. The only bound current runs around the thin rim: a single wide, short loop.`),
          Q(md`A uniformly charged ring (charge $Q$, radius $R$) spins at $\omega$. Its magnetic moment is`,
            [md`$\tfrac12Q\omega R^2$`, md`$Q\omega R^2$`, md`$\tfrac14Q\omega R^2$`, md`$\pi Q\omega R^2$`], 0,
            [null, md`$I = Q\omega/2\pi$, area $\pi R^2$: product $\tfrac12Q\omega R^2$.`, md`That's the disk.`, md`The $\pi$'s cancel: $I = Q/T = Q\omega/2\pi$.`],
            md`$m = \frac{Q}{2M}\cdot MR^2\omega = \tfrac12Q\omega R^2$. Or $I\pi R^2$ with $I = Q\omega/2\pi$.`),
        ],
      },

      // ------------------------------------------------------------------ setups
      {
        id: 'e2-setups', title: 'Common setups: the answer table', kind: 'read',
        steps: [
          R(md`
            Every problem below has shown up as homework, discussion or a lecture example. If you can produce each answer in under a minute, you will have time for the hard parts.

            ### Electric side

            | Setup | Answer |
            |---|---|
            | Sphere, $\vb P = k\vb r$ (HW 4.10) | $\sigma_b = kR$, $\rho_b = -3k$, $\vb E_{\text{in}} = -k\vb r/\varepsilon_0$, $\vb E_{\text{out}} = 0$ |
            | Shell, $\vb P = (k/r)\uv r$ (4.15) | $\rho_b = -k/r^2$, $\vb E = -\frac{k}{\varepsilon_0r}\uv r$ in the shell, 0 elsewhere |
            | Uniform $\vb P$ sphere | $-\vb P/3\varepsilon_0$ in, dipole $\frac43\pi R^3\vb P$ out |
            | Bar electret (4.11) | $\sigma_b = \pm P$ on caps; long → two point charges; short → capacitor |
            | Point charge in dielectric | $E = \dfrac{q}{4\pi\varepsilon r^2}$; bound charge $-q\chi_e/(1+\chi_e)$ at the charge |
            | Conductor $Q$ + shell to $b$ | $V(a) = \frac{Q}{4\pi\varepsilon_0}\left[\frac1b + \frac1{\varepsilon_r}(\frac1a - \frac1b)\right]$ |
            | Two stacked slabs (4.18) | $D = \sigma$; $E_i = \sigma/\varepsilon_i$; $V = \sum E_id_i$ |
            | Half-filled capacitor (4.19) | stacked $\frac{2\varepsilon_r}{1+\varepsilon_r}C_0$; side by side $\frac{1+\varepsilon_r}{2}C_0$ |
            | Partly filled coax (4.21) | $C/L = 2\pi\varepsilon_0/[\ln\frac ba + \frac1{\varepsilon_r}\ln\frac cb]$ |
            | Dielectric sphere in $\vb E_0$ | $\frac{3}{\varepsilon_r+2}\vb E_0$ inside |
            | Coated conductor in $\vb E_0$ (4.24) | $A = -3E_0/[(\varepsilon_r + 2) + 2(\varepsilon_r - 1)a^3/b^3]$ |
            | Energy, coated conductor (4.26) | $\frac{Q^2}{8\pi\varepsilon_0(1+\chi_e)}\left(\frac1a + \frac{\chi_e}b\right)$ |
            | Slab pulled into capacitor | $F = \varepsilon_0\chi_ewV^2/2d$ |
            | Dipole above grounded plane (4.6) | $N = \frac{p^2\sin\theta\cos\theta}{4\pi\varepsilon_0(2z)^3}$, rests ⊥ to plane |

            ### Magnetic side

            | Setup | Answer |
            |---|---|
            | Spinning disk / shell / sphere current | $K = \sigma\omega s$; $K = \sigma\omega R\sin\theta$; $J = \rho\omega r\sin\theta$ ($\hat{\boldsymbol\phi}$) |
            | Square loop center (5.8) | $\sqrt2\mu_0I/\pi R$ |
            | Loop near wire (5.10a) | $\mu_0I^2a^2/2\pi s(s+a)$, toward the wire |
            | Loop in $\vb B = kz\hat{\mathbf x}$ (5.4) | $\vb F = Ika^2\hat{\mathbf z}$ |
            | Finite solenoid on axis (5.11) | $\frac{\mu_0nI}2(\cos\theta_2 - \cos\theta_1)$ |
            | Wire, $J\propto s$ (5.14b) | $B_{\text{in}} = \mu_0Is^2/2\pi a^3$ |
            | Slab $J\hat{\mathbf x}$ (5.15) | $-\mu_0Jz\hat{\mathbf y}$ in; $\mp\mu_0Ja\hat{\mathbf y}$ out |
            | Coaxial solenoids, opposite (5.17) | $\mu_0(n_1 - n_2)I$, $\mu_0n_2I$, $0$ |
            | Moving capacitor (5.18) | $B = \mu_0\sigma v$ between; balance at $v = c$ |
            | Finite wire $\vb A$ (5.25) | $\frac{\mu_0I}{4\pi}\ln\frac{z_2 + \sqrt{z_2^2+s^2}}{z_1+\sqrt{z_1^2+s^2}}\hat{\mathbf z}$ |
            | $\vb A = k\hat{\boldsymbol\phi}$ (5.26) | $\vb J = \frac{k}{\mu_0s^2}\hat{\boldsymbol\phi}$ |
            | Sheet $\vb A$ (5.29) | $-\frac{\mu_0K}{2}|z|\hat{\mathbf x}$ |
            | Loop dipole (5.37) | $m = I\pi R^2$; $B_z\to\mu_0IR^2/2z^3$ |
            | Disk / shell moment (5.39) | $\frac14\pi\sigma\omega R^4$ / $\frac43\pi\sigma\omega R^4$ |
            | Solid sphere (5.63) | $m = Q\omega R^2/5$; $B_{\text{avg}} = \mu_0Q\omega/10\pi R$ |
            | Coaxial dipoles (6.3) | $F = 3\mu_0m_1m_2/2\pi r^4$, attractive |
            | $\vb M = ks^2\hat{\boldsymbol\phi}$ (6.8) | $\vb B = \mu_0\vb M$ in, 0 out |
            | $\vb M = ks\hat{\mathbf z}$ (6.12) | $\vb H = 0$, $\vb B = \mu_0\vb M$ in, 0 out |
            | Coax with $\chi_m$ (6.16) | $B = \mu_0(1+\chi_m)I/2\pi s$; $I_b = \chi_mI$ on inner surface |
            | Uniformly magnetized sphere | $\frac23\mu_0\vb M$ in; dipole $\frac43\pi R^3\vb M$ out |
          `),
        ],
      },

      // ------------------------------------------------------------------ rapid fire
      {
        id: 'e2-rapid', title: 'Rapid fire: 30 seconds each', kind: 'review',
        steps: [
          R(md`Answer each in under 30 seconds. If one takes longer, the trick it tests is the one to review.`),
          Q(md`Sphere with $\vb P = k\vb r$. The bound volume charge is`,
            [md`$-3k$`, md`$-2k$`, md`$-k$`, md`$3k$`], 0,
            [null, md`That's the cylinder, $\vb P = ks\hat{\mathbf s}$.`, md`$\nabla\cdot\vb r = 3$.`, md`Sign: $\rho_b = -\nabla\cdot\vb P$.`],
            md`$\rho_b = -\nabla\cdot(k\vb r) = -3k$.`),
          Q(md`Wire radius $a$, uniform current $I$. $B$ at $s = a/2$ is`,
            [md`$\mu_0I/4\pi a$`, md`$\mu_0I/\pi a$`, md`$\mu_0I/2\pi a$`, md`$\mu_0I/8\pi a$`], 0,
            [null, md`That's $\mu_0I/2\pi s$ at $s = a/2$, which is the outside formula.`, md`That's at the surface.`, md`Inside: $\dfrac{\mu_0Is}{2\pi a^2} = \dfrac{\mu_0I}{4\pi a}$.`],
            md`$B = \mu_0Is/2\pi a^2$ at $s = a/2$: $\mu_0I/4\pi a$, half the surface value.`),
          Q(md`A capacitor at fixed voltage gets a dielectric slab half inserted. The slab is`,
            [md`pulled further in`, md`pushed out`, md`in equilibrium`, md`pulled in only if $Q$ is fixed`], 0,
            [null, md`Pulling in raises $C$; systems move to raise $C$ at fixed $V$ or fixed $Q$.`, md`Only at full insertion.`, md`Both fixed $V$ and fixed $Q$ pull it in.`],
            md`$F = \tfrac12V^2\,dC/dx>0$.`),
          Q(md`Quarter-circle arc (radius $R$, current $I$). $B$ at its center:`,
            [md`$\mu_0I/8R$`, md`$\mu_0I/4R$`, md`$\mu_0I/2R$`, md`$\mu_0I/16R$`], 0,
            [null, md`That's a half circle.`, md`That's a full loop.`, md`$\phi = \pi/2$: $\dfrac{\mu_0I(\pi/2)}{4\pi R} = \dfrac{\mu_0I}{8R}$.`],
            md`$\dfrac{\mu_0I\phi}{4\pi R}$ with $\phi = \pi/2$.`),
          Q(md`In a homogeneous linear dielectric with no free charge, the bound volume charge is`,
            [md`$0$`, md`$-\varepsilon_0\chi_e\nabla\cdot\vb E\ne0$`, md`$-\chi_e\rho_f$`, md`depends on the shape`], 0,
            [null, md`$\nabla\cdot\vb E\propto\nabla\cdot\vb D = \rho_f = 0$.`, md`With $\rho_f = 0$ that's zero too.`, md`$\rho_b = -\frac{\chi_e}{1+\chi_e}\rho_f$, independent of shape.`],
            md`Bound charge only on the surfaces. That's why Laplace + BCs works inside dielectrics.`),
          Q(md`$\vb B = B_0\hat{\mathbf z}$ uniform. A valid vector potential is`,
            [md`$\tfrac12B_0s\,\hat{\boldsymbol\phi}$`, md`$B_0s\,\hat{\boldsymbol\phi}$`, md`$B_0z\,\hat{\mathbf z}$`, md`$\tfrac12B_0\,\hat{\mathbf z}\times\hat{\mathbf s}$`], 0,
            [null, md`Curl of $B_0s\hat{\boldsymbol\phi}$ is $\frac1s\partial_s(B_0s^2) = 2B_0$.`, md`Curl is zero.`, md`Missing the factor of $s$; units don't work.`],
            md`$\vb A = \tfrac12\vb B\times\vb r = \tfrac12B_0s\,\hat{\boldsymbol\phi}$. Check: $\frac1s\partial_s(s\cdot\tfrac12B_0s) = B_0$ ✓.`),
          Q(md`Above a sheet with $\vb K = K\hat{\mathbf y}$ at $z = 0$, $\vb B$ points along`,
            [md`$+\hat{\mathbf x}$`, md`$-\hat{\mathbf x}$`, md`$+\hat{\mathbf z}$`, md`$+\hat{\mathbf y}$`], 0,
            [null, md`$\vb K\times\uv n = \hat{\mathbf y}\times\hat{\mathbf z} = +\hat{\mathbf x}$.`, md`$B^\perp$ from an infinite sheet is zero.`, md`$\vb B\perp\vb K$.`],
            md`$\tfrac{\mu_0K}{2}\,\hat{\mathbf y}\times\hat{\mathbf z} = +\tfrac{\mu_0K}{2}\hat{\mathbf x}$ above, $-\hat{\mathbf x}$ below.`),
          Q(md`A uniformly charged solid sphere spins. $m$ in terms of $Q$, $\omega$, $R$:`,
            [md`$Q\omega R^2/5$`, md`$Q\omega R^2/3$`, md`$2Q\omega R^2/5$`, md`$Q\omega R^2/2$`], 0,
            [null, md`Shell.`, md`That's $L/M$, missing the $\tfrac12$ in $Q/2M$.`, md`Ring.`],
            md`$\frac Q{2M}\cdot\frac25MR^2\omega$.`),
          Q(md`Linear dielectric sphere, $\varepsilon_r = 7$, in $\vb E_0$. $E_{\text{in}}/E_0 = $`,
            [md`$1/3$`, md`$1/7$`, md`$3/7$`, md`$7/9$`], 0,
            [null, md`That's the slab ⊥ field, $1/\varepsilon_r$.`, md`The sphere's factor is $3/(\varepsilon_r + 2)$, not $3/\varepsilon_r$.`, md`Inverted: the inside field is weaker, so the ratio must be small.`],
            md`$3/(7 + 2) = 1/3$.`),
          Q(md`Given $\vb B$ everywhere, the fastest way to get $\vb J$ is`,
            [md`$\vb J = \frac1{\mu_0}\nabla\times\vb B$`, md`Invert Biot–Savart`, md`Ampère's integral law around every loop`, md`$\vb J = \nabla\cdot\vb B$`], 0,
            [null, md`Possible in principle, never fast.`, md`The differential form does all loops at once.`, md`$\nabla\cdot\vb B = 0$ always.`],
            md`One curl. Use the cylindrical/spherical curl formula on the sheet.`),
          Q(md`Two parallel slabs of free surface current would give $\mu_0K$ between them. Fill the space between with a linear material $\chi_m$. Now $B$ between is`,
            [md`$\mu_0(1+\chi_m)K$`, md`$\mu_0K$`, md`$\mu_0K/(1+\chi_m)$`, md`$\mu_0\chi_mK$`], 0,
            [null, md`That's $\mu_0H$. $H = K$ is fixed by free current; $B = \mu H$.`, md`That's the dielectric pattern (fixed free charge reduces $E$). For magnets fixed free current **increases** $B$ by $\mu_r$.`, md`Missing the $\mu_0H$ part.`],
            md`$H = K$ (Ampère with free current), $B = \mu_0(1+\chi_m)K$. Contrast: a dielectric at fixed free charge **reduces** $E$ by $\varepsilon_r$.`),
        ],
      },

      // ------------------------------------------------------------------ mock A
      {
        id: 'e2-mockA', title: 'Mock Exam II (A): the standard mix', kind: 'mock',
        steps: [
          R(md`50 minutes, closed book, formula sheet only. Kuo-length on purpose: you are not expected to finish everything cleanly. Practice the triage: write every standard result first.`),
          paper('Mock Hour Exam II (A)', [
            {
              q: md`
                **Problem 1 (25 pts).** A long coaxial cable: inner conductor radius $a$ with free charge $\lambda$ per length; dielectric $\varepsilon_{r1}$ for $a<s<b$; dielectric $\varepsilon_{r2}$ for $b<s<c$; grounded outer conductor at $s = c$.

                (a) Find $\vb D$, $\vb E$ and $\vb P$ in each dielectric. (b) Find the bound surface charge at $s = a$, $s = b$ and $s = c$ (per area). (c) Find the capacitance per length. (d) Find the energy per length.
              `,
              ans: md`
                - (a) $\vb D = \dfrac{\lambda}{2\pi s}\hat{\mathbf s}$; $\vb E_i = \dfrac{\lambda}{2\pi\varepsilon_0\varepsilon_{ri}s}\hat{\mathbf s}$; $\vb P_i = \dfrac{\chi_i}{\varepsilon_{ri}}\dfrac{\lambda}{2\pi s}\hat{\mathbf s}$.
                - (b) $\sigma_b(a) = -\dfrac{\chi_1\lambda}{2\pi\varepsilon_{r1}a}$; $\sigma_b(b) = \dfrac{\lambda}{2\pi b}\left(\dfrac{\chi_1}{\varepsilon_{r1}} - \dfrac{\chi_2}{\varepsilon_{r2}}\right)$; $\sigma_b(c) = \dfrac{\chi_2\lambda}{2\pi\varepsilon_{r2}c}$.
                - (c) $\dfrac CL = \dfrac{2\pi\varepsilon_0}{\frac{1}{\varepsilon_{r1}}\ln\frac ba + \frac1{\varepsilon_{r2}}\ln\frac cb}$.
                - (d) $\dfrac WL = \dfrac{\lambda^2}{4\pi\varepsilon_0}\left[\dfrac{1}{\varepsilon_{r1}}\ln\dfrac ba + \dfrac{1}{\varepsilon_{r2}}\ln\dfrac cb\right]$.
              `,
              sol: md`
                **(a)** Cylindrical Gauss for $\vb D$ (free charge only): $D\cdot2\pi s\ell = \lambda\ell$. Then $E = D/\varepsilon$ and $P = D - \varepsilon_0E = D\chi/\varepsilon_r$.

                **(b)** $\sigma_b = \vb P\cdot\uv n$, with $\uv n$ pointing **out of the dielectric**. At $a$: $\uv n = -\hat{\mathbf s}$ (negative, next to $+\lambda$). At $b$: slab 1's outer face ($+P_1$) plus slab 2's inner face ($-P_2$). At $c$: $+P_2$. **Check:** per length, $2\pi a\sigma_b(a) + 2\pi b\sigma_b(b) + 2\pi c\sigma_b(c) = \lambda\left(-\frac{\chi_1}{\varepsilon_{r1}} + \frac{\chi_1}{\varepsilon_{r1}} - \frac{\chi_2}{\varepsilon_{r2}} + \frac{\chi_2}{\varepsilon_{r2}}\right) = 0$ ✓.

                **(c)** $V = \int_a^cE\,ds$ split at $b$. Series coax shells.

                **(d)** $W/L = \lambda^2/(2C/L)$, the speed trick, instead of $\tfrac12\int DE\,2\pi s\,ds$ (which gives the same).
              `,
            },
            {
              q: md`
                **Problem 2 (25 pts).** A sphere of radius $R$ carries a frozen-in uniform polarization $\vb P = P\hat{\mathbf z}$.

                (a) Find all bound charge. (b) Find $\vb E$ inside and $V$ outside. (c) A linear dielectric sphere ($\varepsilon_r$) of the same size sits in a uniform $\vb E_0$. What $E_0$ gives it the same polarization? (d) The frozen sphere is now placed in a uniform $\vb E_0$ making angle $\alpha$ with $\vb P$. Find the net force and the torque.
              `,
              ans: md`
                - (a) $\sigma_b = P\cos\theta$, $\rho_b = 0$.
                - (b) $\vb E_{\text{in}} = -\dfrac{P}{3\varepsilon_0}\hat{\mathbf z}$; $V_{\text{out}} = \dfrac{PR^3\cos\theta}{3\varepsilon_0r^2}$.
                - (c) $E_0 = \dfrac{(\varepsilon_r + 2)P}{3\varepsilon_0(\varepsilon_r - 1)}$.
                - (d) $\vb F = 0$; $|\vb N| = \tfrac43\pi R^3PE_0\sin\alpha$, turning $\vb P$ toward $\vb E_0$.
              `,
              sol: md`
                **(a)** Uniform $\vb P$: $\rho_b = 0$, $\sigma_b = \vb P\cdot\uv r = P\cos\theta$.

                **(b)** Standard result (or: it's the Exam I $\sigma = k\cos\theta$ shell with $k = P$). Outside, a pure dipole $p = \frac43\pi R^3P$: $V = \dfrac{p\cos\theta}{4\pi\varepsilon_0r^2} = \dfrac{PR^3\cos\theta}{3\varepsilon_0r^2}$.

                **(c)** $P = 3\varepsilon_0\dfrac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0$, solve for $E_0$.

                **(d)** Uniform field: no net force. $\vb N = \vb p\times\vb E_0$ with $p = \frac43\pi R^3P$.
              `,
            },
            {
              q: md`
                **Problem 3 (25 pts).** A loop is made of two concentric arcs, radius $a$ and $b>a$, each spanning $90°$, joined by two radial segments. Current $I$ runs counterclockwise around the loop (out along one radial segment, along the outer arc, back along the other radial segment, along the inner arc).

                (a) Find $\vb B$ at the common center. (b) Find the magnetic dipole moment. (c) The loop sits in a uniform field $\vb B_0$ in its own plane. Find the net force and the torque. (d) Far away on the axis through the center perpendicular to the loop, how does $B$ fall off, and what is it?
              `,
              ans: md`
                - (a) $B = \dfrac{\mu_0I}{8}\left(\dfrac1a - \dfrac1b\right)$, perpendicular to the loop (into the page for this sense).
                - (b) $m = I\dfrac\pi4(b^2 - a^2)$, perpendicular to the loop (out of the page).
                - (c) $\vb F = 0$; $|\vb N| = mB_0$.
                - (d) $1/z^3$: $B\approx\dfrac{\mu_0}{4\pi}\dfrac{2m}{z^3}$.
              `,
              sol: md`
                **(a)** The radial segments point straight at the center: zero. Each arc gives $\dfrac{\mu_0I(\pi/2)}{4\pi R} = \dfrac{\mu_0I}{8R}$. They circulate in **opposite** senses about the center (counterclockwise on the outer, clockwise on the inner), so they subtract, and the inner one (closer, stronger) wins: $\dfrac{\mu_0I}{8}\left(\dfrac1a - \dfrac1b\right)$, in the inner arc's direction: into the page.

                **Trap:** at the center, $\vb B$ points **opposite** to $\vb m$. That's fine: the dipole formula only holds far away.

                **(b)** $m = I\times$ area $= I\cdot\tfrac14\pi(b^2 - a^2)$, right-hand rule with the counterclockwise sense: out of the page.

                **(c)** Uniform field: $\vb F = 0$. $\vb B_0$ in the plane is perpendicular to $\vb m$: $N = mB_0$.

                **(d)** No monopole term: dipole, $\dfrac{\mu_0}{4\pi}\dfrac{2m}{z^3}$.
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts).** An infinite slab $-a<z<a$ carries a frozen-in magnetization $\vb M = kz\,\hat{\mathbf x}$. There is no free current.

                (a) Find $\vb J_b$ and $\vb K_b$ on both faces. (b) Find $\vb H$ and $\vb B$ everywhere. (c) Check (b) with Ampère's law applied to the bound currents. (d) Now replace $\vb M$ by a frozen-in **polarization** $\vb P = kz\,\hat{\mathbf z}$ in the same slab. Find $\rho_b$, $\sigma_b$, and $\vb E$ inside.
              `,
              ans: md`
                - (a) $\vb J_b = k\hat{\mathbf y}$; $\vb K_b = -ka\,\hat{\mathbf y}$ on both faces.
                - (b) $\vb H = 0$ everywhere; $\vb B = \mu_0kz\,\hat{\mathbf x}$ inside, $0$ outside.
                - (c) ✓ (see solution).
                - (d) $\rho_b = -k$; $\sigma_b = +ka$ on both faces; $\vb E = -\dfrac{kz}{\varepsilon_0}\hat{\mathbf z}$ inside, $0$ outside.
              `,
              sol: md`
                **(a)** $(\nabla\times\vb M)_y = \partial_zM_x = k$. Top ($\uv n = \hat{\mathbf z}$): $ka\,\hat{\mathbf x}\times\hat{\mathbf z} = -ka\,\hat{\mathbf y}$. Bottom ($\uv n = -\hat{\mathbf z}$, $\vb M = -ka\hat{\mathbf x}$): $(-ka\hat{\mathbf x})\times(-\hat{\mathbf z}) = -ka\,\hat{\mathbf y}$. Net current per length in $x$: $2ka - 2ka = 0$ ✓.

                **(b)** **Speed trick:** no free current, planar symmetry, $\vb H\to0$ far away ⇒ $\vb H = 0$. So $\vb B = \mu_0\vb M$.

                **(c)** Superpose sheets. A sheet $K\hat{\mathbf y}$ gives $\pm\tfrac{\mu_0K}{2}\hat{\mathbf x}$ above/below. At height $z$ inside: the two face sheets ($K = -ka$ each, one above, one below) cancel. The volume current $k\hat{\mathbf y}$ below the point (thickness $z + a$) gives $+\tfrac{\mu_0k(z+a)}{2}$, above it (thickness $a - z$) gives $-\tfrac{\mu_0k(a-z)}{2}$. Total $B_x = \mu_0kz$ ✓. Above the slab: $-\tfrac{\mu_0ka}{2}\cdot2 + \tfrac{\mu_0k\cdot2a}{2} = 0$ ✓.

                **(d)** $\rho_b = -\partial_z(kz) = -k$. Top: $\vb P\cdot\hat{\mathbf z} = ka$. Bottom: $\vb P\cdot(-\hat{\mathbf z}) = (-ka)(-1) = +ka$. Total $-2ka + 2ka = 0$ ✓. Planar, no free charge ⇒ $\vb D = 0$ ⇒ $\vb E = -\vb P/\varepsilon_0$. **Note the contrast:** $\vb B$ follows $\vb M$, $\vb E$ opposes $\vb P$.
              `,
            },
          ]),
        ],
      },

      // ------------------------------------------------------------------ mock B
      {
        id: 'e2-mockB', title: 'Mock Exam II (B): five short problems, no slack', kind: 'mock',
        steps: [
          R(md`50 minutes, five problems, about 10 minutes each. Each has one trick that makes it short. If a part takes you more than 4 minutes, you missed the trick: write the setup and move on.`),
          paper('Mock Hour Exam II (B)', [
            {
              q: md`**Problem 1 (20 pts).** A disk of radius $R$ with uniform surface charge $\sigma$ spins at $\omega$ about its axis. Find (a) $\vb K$, (b) $m$, (c) $B$ at the center, (d) $B$ on the axis far away ($z\gg R$).`,
              ans: md`- (a) $\sigma\omega s\,\hat{\boldsymbol\phi}$. (b) $\tfrac14\pi\sigma\omega R^4$. (c) $\tfrac12\mu_0\sigma\omega R$. (d) $\dfrac{\mu_0\sigma\omega R^4}{8z^3}$.`,
              sol: md`
                (a) $v = \omega s$. (b) $m = \frac{Q}{2M}\cdot\frac12MR^2\omega = \frac14Q\omega R^2$ with $Q = \pi R^2\sigma$. (c) Rings of width $ds$ carry $dI = K\,ds = \sigma\omega s\,ds$, each giving $\dfrac{\mu_0dI}{2s}$ at the center: $\int_0^R\tfrac12\mu_0\sigma\omega\,ds = \tfrac12\mu_0\sigma\omega R$. (d) $\dfrac{\mu_0}{4\pi}\dfrac{2m}{z^3} = \dfrac{\mu_0\sigma\omega R^4}{8z^3}$.
              `,
            },
            {
              q: md`**Problem 2 (20 pts).** A sphere of radius $R$ made of linear dielectric $\varepsilon_r$ contains uniform **free** charge density $\rho_f$. Find (a) $\vb E$ inside and outside, (b) $\rho_b$, (c) $\sigma_b$. (d) Verify that the total bound charge is zero.`,
              ans: md`- (a) $\dfrac{\rho_fr}{3\varepsilon_0\varepsilon_r}\uv r$ inside; $\dfrac{\rho_fR^3}{3\varepsilon_0r^2}\uv r$ outside. (b) $-\dfrac{\chi_e}{\varepsilon_r}\rho_f$. (c) $\dfrac{\chi_e\rho_fR}{3\varepsilon_r}$. (d) ✓.`,
              sol: md`
                (a) $D = \rho_fr/3$ inside (Gauss on free charge), $E = D/\varepsilon$; outside, vacuum. (b) $\rho_b = -\frac{\chi_e}{1+\chi_e}\rho_f$. (c) $P(R) = \varepsilon_0\chi_eE(R) = \dfrac{\chi_e\rho_fR}{3\varepsilon_r}$. (d) $-\dfrac{\chi_e\rho_f}{\varepsilon_r}\cdot\dfrac43\pi R^3 + \dfrac{\chi_e\rho_fR}{3\varepsilon_r}4\pi R^2 = 0$ ✓.
              `,
            },
            {
              q: md`**Problem 3 (20 pts).** A thick cylindrical shell $a<s<b$ carries $\vb J = \dfrac ks\hat{\mathbf z}$. Find $B$ (a) for $s<a$, (b) for $a<s<b$, (c) for $s>b$. (d) Check (b) against $\nabla\times\vb B = \mu_0\vb J$.`,
              ans: md`- (a) $0$. (b) $\dfrac{\mu_0k(s-a)}{s}$. (c) $\dfrac{\mu_0k(b-a)}{s}$. (d) ✓.`,
              sol: md`
                $I_{\text{enc}} = \int_a^s\frac k{s'}2\pi s'\,ds' = 2\pi k(s - a)$. Then $B = \mu_0I_{\text{enc}}/2\pi s$. (d) $(\nabla\times\vb B)_z = \frac1s\frac{d}{ds}(sB) = \frac1s\frac{d}{ds}\mu_0k(s - a) = \frac{\mu_0k}{s}$ ✓.
              `,
            },
            {
              q: md`**Problem 4 (20 pts).** A sheet at $z = 0$ carries $\vb K = K_0\hat{\mathbf y}$. Just below it, $\vb B = B_0\hat{\mathbf x} + B_1\hat{\mathbf z}$. (a) Find $\vb B$ just above. (b) If the region below is instead filled with a linear magnetic material $\mu_r$ and $K_0$ is a **free** current, with $\vb H_{\text{below}} = H_0\hat{\mathbf x} + H_1\hat{\mathbf z}$ and vacuum above, find $\vb B$ just above.`,
              ans: md`- (a) $(B_0 + \mu_0K_0)\hat{\mathbf x} + B_1\hat{\mathbf z}$. (b) $\mu_0(H_0 + K_0)\hat{\mathbf x} + \mu_0\mu_rH_1\hat{\mathbf z}$.`,
              sol: md`
                (a) $\vb B_{\text{above}} = \vb B_{\text{below}} + \mu_0\vb K\times\hat{\mathbf z} = \vb B_{\text{below}} + \mu_0K_0\hat{\mathbf x}$; $B_z$ continuous.

                (b) $H^\parallel$ jumps by $\vb K_f\times\uv n$: $H_x^{\text{above}} = H_0 + K_0$. $B^\perp$ continuous: $B_z^{\text{above}} = \mu_0\mu_rH_1$. Above is vacuum: $B_x = \mu_0(H_0 + K_0)$.
              `,
            },
            {
              q: md`**Problem 5 (20 pts).** A parallel-plate capacitor (plates at $x = 0$ with $+\sigma$ and at $x = d$ with $-\sigma$, area $A$) is filled with a dielectric whose permittivity varies: $\varepsilon(x) = \varepsilon_0(1 + x/d)$. Find (a) $E(x)$, (b) $V$ and $C$, (c) $\rho_b(x)$.`,
              ans: md`- (a) $\dfrac{\sigma}{\varepsilon_0(1 + x/d)}$. (b) $V = \dfrac{\sigma d\ln2}{\varepsilon_0}$, $C = \dfrac{\varepsilon_0A}{d\ln2}$. (c) $-\dfrac{\sigma d}{(d + x)^2}$.`,
              sol: md`
                (a) Planar symmetry: $D = \sigma$ everywhere, $E = D/\varepsilon(x)$.

                (b) $V = \int_0^d\dfrac{\sigma\,dx}{\varepsilon_0(1 + x/d)} = \dfrac{\sigma d}{\varepsilon_0}\ln2$.

                (c) $P = D - \varepsilon_0E = \sigma\left(1 - \dfrac{d}{d + x}\right) = \dfrac{\sigma x}{d + x}$; $\rho_b = -\dfrac{dP}{dx} = -\dfrac{\sigma d}{(d+x)^2}$. A **nonuniform** dielectric has bound volume charge even with no free charge inside: the "homogeneous" condition matters. **Check:** $\sigma_b$ at $x = d$ is $P(d) = \sigma/2$, at $x = 0$ is $0$, and $\int_0^d\rho_b\,dx = -\sigma/2$ ✓ total zero.
              `,
            },
          ]),
        ],
      },

      // ------------------------------------------------------------------ quiz (steps filled in by zz-scope.js)
      { id: 'e2-quiz', title: 'Concept quiz (Exam II)', kind: 'quiz', steps: [] },
    ],
  });
})();

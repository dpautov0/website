/* Hour Exam II, round 3: endless randomized speed drills (js/gens-e2.js) and Mock Exams F, G, H.
   zz-scope.js places each drill at the end of the unit it drills, and the mocks in the practice unit. */
(function () {
  'use strict';
  const { R, G } = C;

  const drill = (id, title, intro, gens) => ({
    id, title, kind: 'pset',
    steps: [R(intro)].concat(gens.map(([name, opts]) => G(name, opts))),
  });
  const paper = (title, items) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>PHYS 435 · ${title}</span><span>100 pts</span></div><div class="pp-meta"><span>50 minutes · 4 problems</span><span>Formula sheet allowed</span></div>`,
    items,
  });

  C.unit({
    id: 'h-e2-drills', num: '', title: 'Exam II drills and mocks F–H (holding)',
    lessons: [
      // ================================================================== drills
      drill('e2-drill-bound', 'Speed drill: bound charge from P', md`Fresh numbers every time. **Target: 60 seconds per card.** If you're slower, you're writing the full divergence formula: use the one-liner $\frac{1}{r^2}\frac{d}{dr}(r^2P_r)$ or $\frac1s\frac{d}{ds}(sP_s)$ and the $\vb D = 0$ shortcut.`,
        [['e2_bound', { need: 4, kinds: ['Psph', 'Pcyl'] }]]),
      drill('e2-drill-diel', 'Speed drill: capacitors, shapes, and images', md`Three kinds of card, endless versions. **Target: 45 seconds each.** Capacitors are springs in series/parallel; shapes are one depolarizing factor; dielectric images are one fraction, $\frac{\varepsilon_r - 1}{\varepsilon_r + 1}$.`,
        [['e2_cap', { need: 3 }], ['e2_depol', { need: 4, kinds: ['P', 'E0'] }], ['e2_dimg', { need: 3 }]]),
      drill('e2-drill-bs', 'Speed drill: bent wires', md`Arcs, radial leads and tangent leads in random combinations. **Target: 45 seconds.** Cross off what points at the center, then add arcs ($\phi$) and semi-infinite leads ($1$ each) in units of $\frac{\mu_0I}{4\pi R}$.`,
        [['e2_bentwire', { need: 5 }]]),
      drill('e2-drill-amp', 'Speed drill: Ampère at one radius', md`Power-law wires, thick tubes, coax. **Target: 45 seconds.** Enclosed current over $2\pi s$; for $J\propto s^k$ the enclosed fraction is $(s/a)^{k+2}$.`,
        [['e2_ampere', { need: 5 }]]),
      drill('e2-drill-spin', 'Speed drill: spinning charge', md`Ring, disk, shell, ball. **Target: 30 seconds.** $m = \frac{Q}{2M}L$; center fields: ring $\frac14$, disk $\frac12$, shell $\frac16$, ball $\frac14$ (units $\frac{\mu_0Q\omega}{\pi R}$).`,
        [['e2_spin', { need: 4 }]]),
      drill('e2-drill-mag', 'Speed drill: magnetization', md`Bound currents from power-law $\vb M$, then shapes. **Target: 60 seconds.** No free current + symmetry: $\vb H = 0$, $\vb B = \mu_0\vb M$. Shapes: $\vb B_{\text{in}} = \mu_0(1 - N)\vb M$, $\vb H_{\text{in}} = -N\vb M$.`,
        [['e2_bound', { need: 4, kinds: ['Mphi', 'Mz'] }], ['e2_depol', { need: 3, kinds: ['M', 'H'] }]]),
      drill('e2-drill-mixed', 'Mixed speed drill: everything, against the clock', md`Every generator, shuffled by section. Set a timer for **10 minutes** and see how many you clear. The goal on exam day: each of these is a single line you write without thinking, so your 50 minutes go to the parts that need real work.`,
        [['e2_bentwire', { need: 2 }], ['e2_ampere', { need: 2 }], ['e2_spin', { need: 2 }], ['e2_cap', { need: 2 }], ['e2_depol', { need: 2 }], ['e2_dimg', { need: 2 }], ['e2_bound', { need: 2 }]]),

      // ================================================================== F
      {
        id: 'e2-mockF', title: 'Mock Exam II (F): Griffiths classics you haven\'t done yet', kind: 'mock',
        steps: [
          R(md`50 minutes, four problems, on paper. These are standard textbook setups that were **not** on your homework, the kind Kuo pulls from. Each solution names the trick.`),
          paper('Mock Hour Exam II (F)', [
            {
              q: md`
                **Problem 1 (25 pts).** A toroid with **rectangular** cross-section (inner radius $a$, outer radius $b$, height $h$) has $N$ turns carrying $I$.

                (a) Find $\vb B$ inside and outside. (b) Find the flux through one turn. (c) The core is filled with linear material $\chi_m$. Find $\vb B$ and $\vb M$ in the core. (d) Find the total bound surface current on the inner face ($s = a$) of the core, and its direction relative to the windings.
              `,
              ans: md`
                - (a) $\dfrac{\mu_0NI}{2\pi s}\hat{\boldsymbol\phi}$ inside, $0$ outside.
                - (b) $\Phi = \dfrac{\mu_0NIh}{2\pi}\ln\dfrac ba$.
                - (c) $\vb B = \dfrac{\mu_0(1+\chi_m)NI}{2\pi s}\hat{\boldsymbol\phi}$, $\vb M = \dfrac{\chi_mNI}{2\pi s}\hat{\boldsymbol\phi}$.
                - (d) $\chi_mNI$, parallel to the winding current on that face (for $\chi_m>0$).
              `,
              sol: md`
                **(a)** Circle of radius $s$ inside the core links $NI$. Outside (or in the hole) it links zero net current.

                **(b)** $\int_a^b\frac{\mu_0NI}{2\pi s}h\,ds$.

                **(c)** Ampère for $\vb H$ gives $\frac{NI}{2\pi s}$, unchanged by the material; $\vb B = \mu\vb H$.

                **(d)** On the inner face $\uv n = -\hat{\mathbf s}$, so $\vb K_b = \vb M\times(-\hat{\mathbf s}) = \frac{\chi_mNI}{2\pi a}\hat{\mathbf z}$, running along $z$ like the windings there. Around the full circumference $2\pi a$ that's $\chi_mNI$ in total: the core acts like $\chi_mN$ extra turns. That's why a paramagnetic core multiplies $B$ by $(1 + \chi_m)$.

                **The trick:** $\vb H$ ignores the core; $\vb B = \mu\vb H$.
              `,
            },
            {
              q: md`
                **Problem 2 (25 pts).** A sphere of radius $R$ made of linear dielectric $\varepsilon_r$ carries free charge $Q$.

                (a) The free charge is spread uniformly over the **surface**. Find $\vb E$, $\vb P$ inside and the bound charges. (b) The free charge is instead spread uniformly through the **volume**. Find $\vb E$ inside, $\rho_b$ and $\sigma_b$. (c) Find the energy in each case.
              `,
              ans: md`
                - (a) Inside $\vb E = 0$, $\vb P = 0$, no bound charge at all; outside $\dfrac{Q}{4\pi\varepsilon_0r^2}\uv r$.
                - (b) $\vb E = \dfrac{Qr}{4\pi\varepsilon_0\varepsilon_rR^3}\uv r$, $\rho_b = -\dfrac{\chi_e}{\varepsilon_r}\dfrac{3Q}{4\pi R^3}$, $\sigma_b = \dfrac{\chi_e}{\varepsilon_r}\dfrac{Q}{4\pi R^2}$.
                - (c) (a) $\dfrac{Q^2}{8\pi\varepsilon_0R}$; (b) $\dfrac{Q^2}{8\pi\varepsilon_0R}\left(1 + \dfrac{1}{5\varepsilon_r}\right)$.
              `,
              sol: md`
                **(a)** The trap: no free charge is enclosed by any sphere inside, so $\vb D = 0$ there, hence $\vb E = 0$ and $\vb P = 0$. The dielectric is never polarized. It makes no difference at all.

                **(b)** $D = \frac{Qr}{4\pi R^3}$, $E = D/\varepsilon$, $\rho_b = -\frac{\chi_e}{1+\chi_e}\rho_f$, $\sigma_b = P(R)$.

                **(c)** (a) is a charged shell. (b) is the memorized ball-of-dielectric result.

                **The trick:** always ask "is there free charge enclosed?" before computing anything.
              `,
            },
            {
              q: md`
                **Problem 3 (25 pts).** An infinite sheet at $z = 0$ carries $\vb K = K\hat{\mathbf x}$ and sits in an external uniform field $B_0\hat{\mathbf z}$.

                (a) Find $\vb B$ above and below. (b) Find the force per unit area on the sheet. (c) Find a vector potential $\vb A$ for the whole field. (d) Check the boundary condition on $\partial\vb A/\partial z$.
              `,
              ans: md`
                - (a) $\vb B = B_0\hat{\mathbf z}\mp\dfrac{\mu_0K}{2}\hat{\mathbf y}$ for $z\gtrless0$.
                - (b) $\vb f = -KB_0\hat{\mathbf y}$.
                - (c) $\vb A = -\dfrac{\mu_0K}{2}|z|\hat{\mathbf x} + \dfrac{B_0}{2}(-y\hat{\mathbf x} + x\hat{\mathbf y})$.
                - (d) $\partial_zA_x$ jumps from $+\mu_0K/2$ to $-\mu_0K/2$: by $-\mu_0K$ ✓.
              `,
              sol: md`
                **(b)** The sheet's own field is $\pm\frac{\mu_0K}2\hat{\mathbf y}$ on the two sides; its average **at** the sheet is zero, so only $B_0$ pushes: $\vb K\times\vb B_0$.

                **(c)** Superpose the sheet's $\vb A$ and $\tfrac12\vb B_0\times\vb r$.

                **The trick:** the field at a current sheet is the average of the two sides.
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts).** Charges $q$ at $z = a$, $-2q$ at the origin, $q$ at $z = -a$.

                (a) Find $Q$ and $\vb p$. (b) Find the leading term of $V$ far away. (c) Find the net force and torque in a uniform field $E_0\hat{\mathbf z}$. (d) Find the net force in the nonuniform field $\vb E = kz^2\hat{\mathbf z}$.
              `,
              ans: md`
                - (a) $Q = 0$, $\vb p = 0$.
                - (b) $V\approx\dfrac{qa^2(3\cos^2\theta - 1)}{4\pi\varepsilon_0r^3}$.
                - (c) Both zero.
                - (d) $\vb F = 2qka^2\hat{\mathbf z}$.
              `,
              sol: md`
                **(b)** Quadrupole term: $\frac{1}{4\pi\varepsilon_0r^3}\sum q_ir_i^2P_2(\cos\alpha_i) = \frac{2qa^2P_2(\cos\theta)}{4\pi\varepsilon_0r^3}$.

                **(d)** Just add the forces on the three charges: $qk a^2 + 0 + qka^2$. (In $\vb E = kz\hat{\mathbf z}$ it would be zero: a quadrupole needs a field **curvature** to feel a force, the way a dipole needs a gradient.)

                **The trick:** for point charges, never use the multipole force formulas. Add $q_i\vb E(\vb r_i)$.
              `,
            },
          ]),
        ],
      },

      // ================================================================== G
      {
        id: 'e2-mockG', title: 'Mock Exam II (G): the evil one (long integrals, little time)', kind: 'mock',
        steps: [
          R(md`50 minutes. This one is deliberately too long, like a Kuo exam. Aim to get every **setup** down and finish three of the four problems. Afterward, check which steps ate your time.`),
          paper('Mock Hour Exam II (G)', [
            {
              q: md`
                **Problem 1 (25 pts).** A vector potential is $\vb A = A_0\dfrac{s^2}{a^2}\hat{\boldsymbol\phi}$ for $s<a$ and $\vb A = A_0\dfrac as\hat{\boldsymbol\phi}$ for $s>a$.

                (a) Is it in Coulomb gauge? (b) Find $\vb B$ everywhere. (c) Find $\vb J$ inside and any surface current at $s = a$. (d) Check that the net current per unit length (around the axis) is zero, and explain why that had to be true. (e) Check Stokes: $\oint\vb A\cdot d\vb l$ at $s = a$ vs the flux.
              `,
              ans: md`
                - (a) Yes: $\hat{\boldsymbol\phi}$-only, depends on $s$.
                - (b) $\vb B = \dfrac{3A_0s}{a^2}\hat{\mathbf z}$ inside, $0$ outside.
                - (c) $\vb J = -\dfrac{3A_0}{\mu_0a^2}\hat{\boldsymbol\phi}$; $\vb K = \dfrac{3A_0}{\mu_0a}\hat{\boldsymbol\phi}$.
                - (d) $-\frac{3A_0}{\mu_0a} + \frac{3A_0}{\mu_0a} = 0$: $\vb B = 0$ outside requires zero net circulating current (like a solenoid with zero turns).
                - (e) Both $2\pi aA_0$ ✓.
              `,
              sol: md`
                **(b)** $\frac1s\frac{d}{ds}(sA_\phi)$: inside $\frac1s\frac{d}{ds}\frac{A_0s^3}{a^2} = \frac{3A_0s}{a^2}$; outside $\frac1s\frac{d}{ds}(A_0a) = 0$.

                **(c)** $\mu_0J_\phi = -\frac{dB_z}{ds}$. $\vb B$ jumps from $\frac{3A_0}{a}$ to $0$: $\vb B_{\text{out}} - \vb B_{\text{in}} = \mu_0\vb K\times\hat{\mathbf s}$ with $\hat{\boldsymbol\phi}\times\hat{\mathbf s} = -\hat{\mathbf z}$ gives $K = 3A_0/\mu_0a$.

                **(e)** $\int_0^a\frac{3A_0s}{a^2}2\pi s\,ds = 2\pi A_0a$ ✓.

                **The trick:** one-line curls; the BC gives $\vb K$ without integrating.
              `,
            },
            {
              q: md`
                **Problem 2 (25 pts).** A spherical capacitor (radii $a<b$, charges $\pm Q$) is filled with dielectric whose permittivity grows outward: $\varepsilon(r) = \varepsilon_0(1 + r/a)$.

                (a) Find $\vb E$ between the shells. (b) Find the potential difference. (c) Find $\rho_b$. (d) Find the energy.
              `,
              ans: md`
                - (a) $\vb E = \dfrac{Q}{4\pi\varepsilon_0r^2(1 + r/a)}\uv r$.
                - (b) $V = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac1a - \dfrac1b + \dfrac1a\ln\dfrac{a+b}{2b}\right]$.
                - (c) $\rho_b = -\dfrac{Qa}{4\pi r^2(a + r)^2}$.
                - (d) $W = \tfrac12QV$.
              `,
              sol: md`
                **(b)** The nasty integral. Partial fractions: $\dfrac{a}{r^2(r + a)} = \dfrac{1}{r^2} - \dfrac{1}{ar} + \dfrac{1}{a(r + a)}$. Integrate from $a$ to $b$: $\left(\dfrac1a - \dfrac1b\right) - \dfrac1a\ln\dfrac ba + \dfrac1a\ln\dfrac{a+b}{2a}$, and the two logs combine to $\frac1a\ln\frac{a+b}{2b}$. Check $b\to a$: $0$ ✓. The log is negative, so $V$ is smaller than in vacuum ✓.

                **(c)** $P = D - \varepsilon_0E = \frac{Q}{4\pi r^2}\cdot\frac{r/a}{1 + r/a} = \frac{Q}{4\pi r(a + r)}$. $\rho_b = -\frac{1}{r^2}\frac{d}{dr}\frac{Qr}{4\pi(a + r)} = -\frac{1}{r^2}\frac{Q}{4\pi}\frac{a}{(a+r)^2}$. Nonzero because $\varepsilon$ varies.

                **(d)** Don't integrate $D\cdot E$ again: $W = Q^2/2C = QV/2$.

                **The trick:** partial fractions on sight; then $W = \tfrac12QV$.
              `,
            },
            {
              q: md`
                **Problem 3 (25 pts).** A slab $|z|<a$ carries uniform $\vb J = J\hat{\mathbf x}$, except for a cylindrical hole of radius $R<a$ whose axis is the $x$ axis.

                (a) Find $\vb B$ inside the hole. (b) Evaluate it at $(0, 0, R/2)$. (c) Find $B_y$ above the slab on the $z$ axis at height $h>a$.
              `,
              ans: md`
                - (a) $\vb B = -\dfrac{\mu_0J}{2}(z\hat{\mathbf y} + y\hat{\mathbf z})$.
                - (b) $-\dfrac{\mu_0JR}{4}\hat{\mathbf y}$.
                - (c) $B_y = -\mu_0Ja + \dfrac{\mu_0JR^2}{2h}$.
              `,
              sol: md`
                **(a)** Slab: $-\mu_0Jz\hat{\mathbf y}$. Minus a wire along $x$ with $J\hat{\mathbf x}$, whose inside field is $\frac{\mu_0}{2}J\hat{\mathbf x}\times(y\hat{\mathbf y} + z\hat{\mathbf z}) = \frac{\mu_0J}{2}(y\hat{\mathbf z} - z\hat{\mathbf y})$. Subtract. (Not uniform this time: the slab's field isn't the field of a cylinder.)

                **(c)** Slab above: $-\mu_0Ja\hat{\mathbf y}$. Minus the wire ($I = J\pi R^2$ along $+x$), whose field at $(0,0,h)$ is $\frac{\mu_0I}{2\pi h}\hat{\mathbf x}\times\hat{\mathbf z} = -\frac{\mu_0I}{2\pi h}\hat{\mathbf y}$; subtracting gives $+\frac{\mu_0JR^2}{2h}\hat{\mathbf y}$.

                **The trick:** vector form of each piece with its own center, then subtract.
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts).** A point dipole $\vb p = -p\hat{\mathbf z}$ (pointing **at** the plane) sits at height $z$ above a grounded conducting plane.

                (a) Find the image dipole. (b) Find the force on the dipole. (c) Find the work needed to bring it in from infinity. (d) The conductor is replaced by a dielectric $\varepsilon_r$. How does the force change?
              `,
              ans: md`
                - (a) $\vb p' = -p\hat{\mathbf z}$ at $-z$ (same direction: the normal component is kept).
                - (b) $F_z = -\dfrac{3p^2}{32\pi\varepsilon_0z^4}$ (attractive).
                - (c) $W = -\dfrac{p^2}{32\pi\varepsilon_0z^3}$.
                - (d) Multiply by $\dfrac{\varepsilon_r - 1}{\varepsilon_r + 1}$.
              `,
              sol: md`
                **(a)** Image each charge: the normal component of $\vb p$ survives, the parallel one flips.

                **(b)** Two coaxial dipoles head to tail, separation $2z$: $F = \frac{3p^2}{2\pi\varepsilon_0(2z)^4}$, attractive.

                **(c)** As for a point charge and its image, the real work is **half** the interaction energy (the image moves as you move): $W = \frac12(-\vb p\cdot\vb E_{\text{image}}) = -\frac12\frac{2p^2}{4\pi\varepsilon_0(2z)^3}$. Check: $-dW/dz$ reproduces (b) ✓.

                **(d)** Every image charge is scaled by $-\frac{\varepsilon_r - 1}{\varepsilon_r + 1}$ instead of $-1$, so the image dipole and the force scale by $\frac{\varepsilon_r - 1}{\varepsilon_r + 1}$.

                **The trick:** HW 4.6's image rule, and the factor of ½ for induced images.
              `,
            },
          ]),
        ],
      },

      // ================================================================== H
      {
        id: 'e2-mockH', title: 'Mock Exam II (H): dress rehearsal', kind: 'mock',
        steps: [
          R(md`50 minutes, the night before. One problem of each Exam I type plus a Biot–Savart classic. If you can do this one cleanly in time, you're ready.`),
          paper('Mock Hour Exam II (H)', [
            {
              q: md`
                **Problem 1 (25 pts).** In cylindrical coordinates, $\vb E = ks^2\hat{\mathbf s}$ for $s<a$ and $\vb E = \dfrac{ka^3}{s}\hat{\mathbf s}$ for $s>a$.

                (a) Find $\rho$ everywhere and the charge per unit length. (b) Find $V(s)$ inside with $V(0) = 0$. (c) Find the energy per unit length stored **inside** $s<a$. (d) What is the total energy per unit length, and why?
              `,
              ans: md`
                - (a) $\rho = 3\varepsilon_0ks$ inside, $0$ outside; $\lambda = 2\pi\varepsilon_0ka^3$.
                - (b) $V = -\dfrac{ks^3}{3}$.
                - (c) $\dfrac{\pi\varepsilon_0k^2a^6}{6}$.
                - (d) Infinite: outside, $\int\frac{ds}{s}$ diverges, as for any infinite line charge.
              `,
              sol: md`
                **(a)** $\frac{\varepsilon_0}{s}\frac{d}{ds}(ks^3)$. $\lambda$ from Gauss at $s = a$: $2\pi a\varepsilon_0ka^2$.

                **(c)** $\frac{\varepsilon_0}{2}\int_0^ak^2s^4\,2\pi s\,ds$.

                **The trick:** shells ($2\pi s\,ds$) and spotting the divergent log before you waste time on it.
              `,
            },
            {
              q: md`
                **Problem 2 (25 pts).** A spherical shell $a<r<b$ has frozen-in uniform magnetization $M\hat{\mathbf z}$.

                (a) Find $\vb B$ in the cavity $r<a$. (b) Find $\vb B$ outside. (c) Find $\vb H$ in the cavity. (d) The same shell with uniform **polarization** $P\hat{\mathbf z}$ instead: find $\vb E$ in the cavity.
              `,
              ans: md`
                - (a) $\vb B = 0$.
                - (b) A pure dipole, $\vb m = \tfrac43\pi(b^3 - a^3)M\hat{\mathbf z}$.
                - (c) $\vb H = 0$.
                - (d) $\vb E = 0$.
              `,
              sol: md`
                **(a)** Superpose a solid ball of radius $b$ with $+\vb M$ ($\frac23\mu_0\vb M$ inside) and a ball of radius $a$ with $-\vb M$ ($-\frac23\mu_0\vb M$ inside). They cancel in the cavity.

                **(d)** Same superposition: $-\frac{\vb P}{3\varepsilon_0} + \frac{\vb P}{3\varepsilon_0} = 0$.

                **The trick:** a uniformly polarized or magnetized spherical **shell** shields its cavity completely. Two lines, if you think "ball minus ball".
              `,
            },
            {
              q: md`
                **Problem 3 (25 pts).** (Griffiths 4.28.) Two long coaxial metal tubes (radii $a<b$) stand vertically in a tank of dielectric oil (susceptibility $\chi_e$, mass density $\rho$). They're held at potential difference $V$.

                (a) With oil filling a length $x$ of the gap, find the capacitance (total length $L$). (b) Find the upward force on the oil. (c) Find the height $h$ the oil rises above the tank level.
              `,
              ans: md`
                - (a) $C = \dfrac{2\pi\varepsilon_0(L + \chi_ex)}{\ln(b/a)}$.
                - (b) $F = \dfrac{\pi\varepsilon_0\chi_eV^2}{\ln(b/a)}$.
                - (c) $h = \dfrac{\varepsilon_0\chi_eV^2}{\rho g(b^2 - a^2)\ln(b/a)}$.
              `,
              sol: md`
                **(a)** Two coax capacitors in parallel: length $x$ with $\varepsilon$, length $L - x$ empty.

                **(b)** $F = \tfrac12V^2\frac{dC}{dx}$, upward (the oil rises to raise $C$).

                **(c)** Balance the weight of the raised column: $F = \rho g\,\pi(b^2 - a^2)h$.

                **The trick:** force by $\frac12V^2\,dC/dx$; never touch the fringing field.
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts).** Two coaxial circular loops of radius $R$, each carrying $I$ in the same sense, are separated by $d$ (at $z = \pm d/2$).

                (a) Find $B_z$ on the axis at the midpoint. (b) Why is $dB_z/dz = 0$ there for any $d$? (c) For which $d$ is $d^2B_z/dz^2 = 0$ too? (Just state it.) (d) Evaluate (a) for that $d$.
              `,
              ans: md`
                - (a) $B_z = \dfrac{\mu_0IR^2}{(R^2 + d^2/4)^{3/2}}$.
                - (b) $B_z(z)$ is even about the midpoint.
                - (c) $d = R$ (Helmholtz coils).
                - (d) $\dfrac{8\mu_0I}{5\sqrt5\,R}$.
              `,
              sol: md`
                **(a)** Twice the single-loop axis field at distance $d/2$.

                **(d)** $(5R^2/4)^{3/2} = \frac{5\sqrt5}{8}R^3$.

                **The trick:** one memorized formula, used twice. Symmetry kills the first derivative for free.
              `,
            },
          ]),
        ],
      },
    ],
  });
})();

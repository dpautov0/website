/* Hour Exam II, night-before priority: the exam from two semesters ago, as a student who took it described it
   (lots of D/E/P; a cylinder with an off-axis hole, currents from the area ratio; a vector potential found from the curl
   because the integral can't be done). Lessons e2-past, e2-dep, e2-hole, e2-Acurl and Mock I. */
(function () {
  'use strict';
  const { R, P, Q } = C;
  const paper = (title, items) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>PHYS 435 · ${title}</span><span>100 pts</span></div><div class="pp-meta"><span>50 minutes · 4 problems</span><span>Formula sheet + your cheat sheet</span></div>`,
    items,
  });

  C.unit({
    id: 'h-e2-past', num: '', title: 'Exam II: the past exam (holding)',
    lessons: [
      {
        id: 'e2-past', title: 'What last spring\'s exam tested, and the drills for it', kind: 'read',
        steps: [
          R(md`
            Last spring's Hour Exam II is on this site in full: [Spring 2026 Exam II](#/l/e2-s26) (original PDF: [sp26-exam2.pdf](sp26-exam2.pdf)). It tested:

            1. **A lot of D, E, P**: given free charge and dielectrics (or a frozen polarization), find $\vb D$, $\vb E$, $\vb P$ and the bound charges.
            2. **The magnetic field of a cylinder with an off-axis hole.** Given the total current, use the **ratio of the areas** to find the current of the full cylinder ($+$) and of the hole ($-$), then superpose with Ampère.
            3. **A vector potential you couldn't get by integrating**: you had to use the **curl** (and the D/E/P-style reasoning about which component survives).

            This unit drills each of those problem types, then Mock I gives you a fresh exam of the same kind in 50 minutes. Your **cheat sheet** ([printable PDF](cheatsheet-e2.pdf) · [page](cheatsheet-e2.html)) has a box for each.

            | Past-exam problem | Lesson | Cheat-sheet box |
            |---|---|---|
            | D, E, P | [The D–E–P chain, drilled](#/l/e2-dep) | §1, §2, §5, §6, §12b |
            | Off-axis hole | [Cylinder with an off-axis hole](#/l/e2-hole) | §14 |
            | A from the curl | [Vector potential from the curl](#/l/e2-Acurl) | §15 |
            | All together | [Mock I](#/l/e2-mockI) | §23 |
          `),
        ],
      },

      // ================================================================== D, E, P
      {
        id: 'e2-dep', title: 'The D–E–P chain, drilled',
        steps: [
          R(md`
            Every D/E/P problem is the same four lines. Say them out loud until they're automatic:

            1. **D** from free charge (Gauss, with symmetry).
            2. **E** $= \vb D/\varepsilon$ in each region (or $(\vb D - \vb P)/\varepsilon_0$ if $\vb P$ is frozen in).
            3. **P** $= \vb D - \varepsilon_0\vb E$ (works for both cases).
            4. **Bound charge:** $\sigma_b = \vb P\cdot\uv n$ (normal **out of the material**), $\rho_b = -\nabla\cdot\vb P$. Check that it sums to zero.

            !!key D is the one that doesn't care about the material
                In every problem with symmetry, $\vb D$ is the **same** function of position no matter what dielectrics are present, because only free charge sources it. Draw $\vb D$ first, then let each material divide it by its own $\varepsilon$.

            !!trap The three ways students lose D/E/P points
                (1) Using $\varepsilon_0$ instead of $\varepsilon$ in one region. (2) Wrong normal on an **inner** surface ($\uv n = -\uv r$ there, so $\sigma_b$ is negative next to a positive conductor). (3) With frozen $\vb P$, writing $\vb D = \varepsilon\vb E$: there is no $\varepsilon$; use $\vb E = (\vb D - \vb P)/\varepsilon_0$.

            ### At an interface between two dielectrics (no free charge)

            $D^\perp$ continuous, $E^\parallel$ continuous, $E^\perp$ jumps by $\sigma_b/\varepsilon_0$, and $\sigma_b = \vb P_1\cdot\uv n_1 + \vb P_2\cdot\uv n_2$ (each normal pointing out of its own material). For stacked slabs carrying $D$: $\sigma_b = D\left(\frac{1}{\varepsilon_{r2}} - \frac{1}{\varepsilon_{r1}}\right)$ on the side going from 1 into 2.
          `),
          Q(md`A conductor (charge $Q$) is wrapped in dielectric shell 1 ($\varepsilon_{r1}$), then shell 2 ($\varepsilon_{r2}$). Which is the same function of $r$ in both shells?`,
            [md`$D = Q/4\pi r^2$`, md`$E$`, md`$P$`, md`$\varepsilon_0E$`], 0,
            [null, md`$E = D/\varepsilon$ differs between the shells.`, md`$P = D(1 - 1/\varepsilon_r)$ differs.`, md`That's $D/\varepsilon_r$: differs.`],
            md`Gauss for $\vb D$ only sees $Q$. That's why you always start with $\vb D$.`),
          Q(md`A slab with **frozen** uniform $\vb P$ (perpendicular to its faces) sits inside a capacitor whose plates carry $\pm\sigma$ (free). In the slab, $\vb E$ is`,
            [md`$(\sigma - P)/\varepsilon_0$`, md`$\sigma/\varepsilon$`, md`$\sigma/\varepsilon_0$`, md`$-P/\varepsilon_0$`], 0,
            [null, md`There's no $\varepsilon$ for a frozen polarization.`, md`That's the gap, where $P = 0$.`, md`That ignores the free charge on the plates. $\vb D = \sigma$ inside the slab too.`],
            md`$D = \sigma$ everywhere between the plates (planar symmetry, free charge only). In the slab $E = (D - P)/\varepsilon_0$.`),
          P({
            id: 'e2-dep-p1', title: 'Two dielectric shells around a conductor',
            q: md`A conducting sphere (radius $a$, charge $Q$) is surrounded by dielectric $\varepsilon_{r1}$ for $a<r<b$ and $\varepsilon_{r2}$ for $b<r<c$; vacuum beyond. Find (a) $E$ at radius $r$ in shell 2, (b) $P$ at radius $r$ in shell 1, (c) the net bound surface charge **density** at $r = b$, (d) the potential of the conductor.`,
            hints: [md`$D = Q/4\pi r^2$ everywhere outside the conductor.`, md`At $r = b$: $+P_1(b)$ (outer face of shell 1) $-P_2(b)$ (inner face of shell 2).`],
            parts: [
              { lbl: md`(a) $E_2$`, expr: 'Q/(4*pi*eps0*epsr2*r^2)', vars: { Q: [1, 3], eps0: [0.5, 2], epsr2: [1.5, 5], r: [1, 2] } },
              { lbl: md`(b) $P_1$`, expr: 'Q*(1 - 1/epsr1)/(4*pi*r^2)', vars: { Q: [1, 3], epsr1: [1.5, 5], r: [0.5, 1] } },
              { lbl: md`(c) $\sigma_b(b)$`, expr: 'Q*(1/epsr2 - 1/epsr1)/(4*pi*b^2)', vars: { Q: [1, 3], epsr1: [1.5, 5], epsr2: [1.5, 5], b: [1, 2] } },
              { lbl: md`(d) $V(a)$`, expr: 'Q/(4*pi*eps0)*((1/a - 1/b)/epsr1 + (1/b - 1/c)/epsr2 + 1/c)', vars: { Q: [1, 3], eps0: [0.5, 2], epsr1: [1.5, 5], epsr2: [1.5, 5], a: [0.3, 0.5], b: [0.8, 1.2], c: [1.5, 2.5] } },
            ],
            sol: md`
              (a) $E = D/\varepsilon_0\varepsilon_{r2}$. (b) $P = D(1 - 1/\varepsilon_{r1})$.

              (c) $\left(1 - \frac1{\varepsilon_{r1}}\right)D(b) - \left(1 - \frac1{\varepsilon_{r2}}\right)D(b) = \frac{Q}{4\pi b^2}\left(\frac{1}{\varepsilon_{r2}} - \frac{1}{\varepsilon_{r1}}\right)$. Positive if shell 1 is the stronger dielectric.

              (d) Integrate $E$ in from infinity, one region at a time: $\frac{Q}{4\pi\varepsilon_0}\left[\frac1c + \frac{1}{\varepsilon_{r2}}\left(\frac1b - \frac1c\right) + \frac{1}{\varepsilon_{r1}}\left(\frac1a - \frac1b\right)\right]$. Spherical capacitors in series.
            `,
          }),
          P({
            id: 'e2-dep-p2', title: 'Frozen slab inside a capacitor',
            q: md`Plates at $z = 0$ ($+\sigma$) and $z = d$ ($-\sigma$). A slab of thickness $t<d$ with frozen $\vb P = P\hat{\mathbf z}$ fills $0<z<t$; vacuum above it. Find (a) $D$ in the slab, (b) $E_z$ in the slab, (c) $E_z$ in the vacuum gap, (d) the potential difference $V(0) - V(d)$, (e) $\sigma_b$ on the slab's top face.`,
            hints: [md`Planar symmetry: $D = \sigma$ everywhere between the plates.`, md`Slab: $E = (D - P)/\varepsilon_0$.`],
            parts: [
              { lbl: md`(a) $D$`, expr: 'sigma', vars: { sigma: [1, 3] } },
              { lbl: md`(b) $E_z$ slab`, expr: '(sigma - P)/eps0', vars: { sigma: [3, 5], P: [0.5, 2], eps0: [0.5, 2] } },
              { lbl: md`(c) $E_z$ gap`, expr: 'sigma/eps0', vars: { sigma: [1, 3], eps0: [0.5, 2] } },
              { lbl: md`(d) $\Delta V$`, expr: '(sigma*d - P*t)/eps0', vars: { sigma: [1, 3], P: [0.5, 2], d: [2, 3], t: [0.5, 1.5], eps0: [0.5, 2] } },
              { lbl: md`(e) $\sigma_b$ top`, expr: 'P', vars: { P: [0.5, 2] } },
            ],
            sol: md`
              (a) $\sigma$: Gauss pillbox from inside the bottom plate. (b) $(\sigma - P)/\varepsilon_0$. (c) $\sigma/\varepsilon_0$. (d) $E_{\text{slab}}t + E_{\text{gap}}(d - t)$. (e) $\vb P\cdot\hat{\mathbf z} = P$ on top, $-P$ on the bottom face. Check with charges: the slab's $\pm P$ sheets make $-P/\varepsilon_0$ inside it, added to $\sigma/\varepsilon_0$ from the plates ✓.
            `,
          }),
          P({
            id: 'e2-dep-p3', title: 'Given E in a dielectric: free vs bound charge',
            q: md`Inside a ball of linear dielectric $\varepsilon_r$, the field is $\vb E = kr\,\uv r$. Find (a) $\rho_f$, (b) $\rho_b$, (c) the total $\rho$.`,
            hints: [md`$\rho_f = \nabla\cdot\vb D = \varepsilon\nabla\cdot\vb E$; total $\rho = \varepsilon_0\nabla\cdot\vb E$.`],
            parts: [
              { lbl: md`(a) $\rho_f$`, expr: '3*eps0*epsr*k', vars: { eps0: [0.5, 2], epsr: [1.5, 5], k: [1, 3] } },
              { lbl: md`(b) $\rho_b$`, expr: '-3*eps0*(epsr-1)*k', vars: { eps0: [0.5, 2], epsr: [1.5, 5], k: [1, 3] } },
              { lbl: md`(c) $\rho$`, expr: '3*eps0*k', vars: { eps0: [0.5, 2], k: [1, 3] } },
            ],
            sol: md`$\nabla\cdot\vb E = 3k$. (a) $\varepsilon\cdot3k$. (b) $-\nabla\cdot\vb P = -\varepsilon_0\chi_e3k$. (c) Sum $= 3\varepsilon_0k$ ✓ $= \varepsilon_0\nabla\cdot\vb E$. Ratio $\rho_b/\rho_f = -\chi_e/\varepsilon_r$ ✓.`,
          }),
          P({
            id: 'e2-dep-p4', title: 'Coated wire',
            q: md`A long wire with free charge $\lambda$ per length (radius $a$) is coated with dielectric $\varepsilon_r$ out to radius $b$. Find (a) $E$ in the coating, (b) $\sigma_b$ at $s = a$, (c) $\sigma_b$ at $s = b$, (d) $V(a) - V(b)$.`,
            hints: [md`$D = \lambda/2\pi s$.`, md`At $s = a$ the normal out of the coating points toward the axis.`],
            parts: [
              { lbl: md`(a) $E$`, expr: 'lambda/(2*pi*eps0*epsr*s)', vars: { lambda: [1, 3], eps0: [0.5, 2], epsr: [1.5, 5], s: [1, 2] } },
              { lbl: md`(b) $\sigma_b(a)$`, expr: '-(1 - 1/epsr)*lambda/(2*pi*a)', vars: { lambda: [1, 3], epsr: [1.5, 5], a: [0.3, 0.6] } },
              { lbl: md`(c) $\sigma_b(b)$`, expr: '(1 - 1/epsr)*lambda/(2*pi*b)', vars: { lambda: [1, 3], epsr: [1.5, 5], b: [1, 2] } },
              { lbl: md`(d) $\Delta V$`, expr: 'lambda*ln(b/a)/(2*pi*eps0*epsr)', vars: { lambda: [1, 3], eps0: [0.5, 2], epsr: [1.5, 5], a: [0.3, 0.6], b: [1, 2] } },
            ],
            sol: md`$P = (1 - 1/\varepsilon_r)\frac{\lambda}{2\pi s}$. (b) $-P(a)$. (c) $+P(b)$. Check per length: $-2\pi aP(a) + 2\pi bP(b) = 0$ ✓. (d) $\int_a^b E\,ds$.`,
          }),
          P({
            id: 'e2-dep-p5', title: 'Nonuniform frozen P in a slab',
            q: md`A slab $|z|<a$ (infinite in $x$, $y$) has frozen $\vb P = P_0\dfrac za\hat{\mathbf z}$ and no free charge. Find (a) $\rho_b$, (b) $\sigma_b$ on the top face, (c) $\sigma_b$ on the bottom face, (d) $E_z$ inside.`,
            hints: [md`Bottom face: $\uv n = -\hat{\mathbf z}$ and $P_z(-a) = -P_0$.`, md`No free charge, planar symmetry: $\vb D = 0$.`],
            parts: [
              { lbl: md`(a) $\rho_b$`, expr: '-P0/a', vars: { P0: [1, 3], a: [0.5, 2] } },
              { lbl: md`(b) $\sigma_b$ top`, expr: 'P0', vars: { P0: [1, 3] } },
              { lbl: md`(c) $\sigma_b$ bottom`, expr: 'P0', vars: { P0: [1, 3] } },
              { lbl: md`(d) $E_z$`, expr: '-P0*z/(a*eps0)', vars: { P0: [1, 3], z: [-0.4, 0.4], a: [0.5, 2], eps0: [0.5, 2] } },
            ],
            sol: md`(a) $-\partial_zP_z$. (b) $P_z(a) = P_0$. (c) $(-P_0)(-1) = P_0$. Total per area: $2P_0 - \frac{P_0}{a}2a = 0$ ✓. (d) $\vb D = 0$ so $\vb E = -\vb P/\varepsilon_0$, and $0$ outside.`,
          }),
        ],
      },

      // ================================================================== off-axis hole
      {
        id: 'e2-hole', title: 'Cylinder with an off-axis hole: currents from the area ratio',
        steps: [
          R(md`
            **Setup:** a long cylinder of radius $a$ carries total current $I$, uniformly distributed over its cross-section, **except** a cylindrical hole of radius $b$ whose axis is displaced by $\vb d$ (with $d + b < a$).

            **Step 1, the area ratio.** The current flows only through the metal, area $\pi(a^2 - b^2)$:

            $$J = \frac{I}{\pi(a^2 - b^2)}.$$

            **Step 2, split into two full cylinders.** A solid cylinder of radius $a$ with current density $+J$ everywhere, plus a solid cylinder of radius $b$ (the hole) with $-J$:

            $$I_+ = J\pi a^2 = I\frac{a^2}{a^2 - b^2},\qquad I_- = -J\pi b^2 = -I\frac{b^2}{a^2 - b^2},\qquad I_+ + I_- = I\ ✓.$$

            !!intuition Why the ratio of areas
                The hole "removes" current that would have flowed there if the cylinder were solid. Since $J$ is the same everywhere in the metal, each piece carries current proportional to its area. The full cylinder carries **more** than $I$; the hole carries the negative excess.

            **Step 3, Ampère for each piece** (each alone is perfectly symmetric about **its own** axis):

            - Inside a uniform cylinder: $\vb B = \frac{\mu_0}{2}\vb J\times\vb s$ ($\vb s$ from its own axis). Magnitude $\frac{\mu_0Js}{2} = \frac{\mu_0I_{\text{piece}}s}{2\pi R_{\text{piece}}^2}$.
            - Outside: $\frac{\mu_0I_{\text{piece}}}{2\pi s}$ around its own axis.

            **Step 4, superpose region by region:**

            | Point is in… | Big cylinder ($+J$) | Hole cylinder ($-J$) |
            |---|---|---|
            | the hole | inside formula | inside formula → total $\frac{\mu_0}{2}\vb J\times\vb d$, **uniform** |
            | the metal | inside formula | **outside** formula (distance $s'$ from hole axis) |
            | outside everything | outside formula, $I_+$ | outside formula, $I_-$ |

            In the hole, $|\vb B| = \dfrac{\mu_0Jd}{2} = \dfrac{\mu_0Id}{2\pi(a^2 - b^2)}$, perpendicular to $\vb d$.

            !!method On the line through both axes
                Put the big axis at the origin and the hole at $(d, 0)$, current along $+z$. At $(x, 0)$ every field is along $\pm\hat{\mathbf y}$, so you just add signed numbers: a positive current at $x_0$ gives $B_y = \frac{\mu_0I}{2\pi(x - x_0)}$ outside it (positive to its right). Use $I_-$ (negative) for the hole.

            !!trap Far away it's just $I$
                Far outside, $\frac{\mu_0I_+}{2\pi s} + \frac{\mu_0I_-}{2\pi s'}\to\frac{\mu_0I}{2\pi s}$. If your far field isn't $\mu_0I/2\pi s$, the area ratio is wrong.
          `),
          P({
            id: 'e2-hole-p1', title: 'The past-exam problem',
            q: md`A long cylinder (radius $a$) carries total current $I$ along $+z$, uniform in the metal, with a hole of radius $b$ centered at $(d, 0)$. Find (a) $I_+$, (b) $I_-$, (c) $|B|$ in the hole, (d) $B_y$ at $(x, 0)$ with $x>a$ (outside, on the hole's side).`,
            hints: [md`$J = I/\pi(a^2 - b^2)$.`, md`At $(x, 0)$: $B_y = \frac{\mu_0}{2\pi}\left[\frac{I_+}{x} + \frac{I_-}{x - d}\right]$.`],
            parts: [
              { lbl: md`(a) $I_+$`, expr: 'I*a^2/(a^2-b^2)', vars: { I: [1, 3], a: [2, 3], b: [0.3, 0.8] } },
              { lbl: md`(b) $I_-$`, expr: '-I*b^2/(a^2-b^2)', vars: { I: [1, 3], a: [2, 3], b: [0.3, 0.8] } },
              { lbl: md`(c) $|B|$ in hole`, expr: 'mu0*I*d/(2*pi*(a^2-b^2))', vars: { mu0: [0.5, 2], I: [1, 3], d: [0.5, 1], a: [2, 3], b: [0.3, 0.8] } },
              { lbl: md`(d) $B_y(x)$`, expr: 'mu0*I/(2*pi*(a^2-b^2))*(a^2/x - b^2/(x-d))', vars: { mu0: [0.5, 2], I: [1, 3], a: [2, 3], b: [0.3, 0.8], d: [0.5, 1], x: [4, 6] } },
            ],
            sol: md`
              (a), (b) Area ratio. (c) $\frac{\mu_0}{2}Jd$. (d) Superpose the two outside fields with signs.

              **Checks:** $b\to0$: (d) $\to\frac{\mu_0I}{2\pi x}$ ✓. $x\to\infty$: $\frac{\mu_0I}{2\pi x}$ ✓.
            `,
          }),
          P({
            id: 'e2-hole-p2', title: 'Inside the metal, opposite the hole',
            q: md`Same cylinder. Find $B_y$ at $(-x_0, 0)$, a point in the metal on the far side from the hole ($0<x_0<a$).`,
            hints: [md`Big cylinder (inside): $\frac{\mu_0J}{2}\hat{\mathbf z}\times(-x_0\hat{\mathbf x}) = -\frac{\mu_0Jx_0}{2}\hat{\mathbf y}$.`, md`Hole cylinder (outside it, at distance $d + x_0$, to its left): a positive current there would give $-\hat{\mathbf y}$; $I_-$ is negative.`],
            parts: [{ lbl: md`$B_y$`, expr: 'mu0*I/(2*pi*(a^2-b^2))*(b^2/(d+x0) - x0)', vars: { mu0: [0.5, 2], I: [1, 3], a: [2, 3], b: [0.3, 0.8], d: [0.5, 1], x0: [0.5, 1.5] } }],
            sol: md`
              $B_y = -\frac{\mu_0Jx_0}{2} + \frac{\mu_0|I_-|}{2\pi(d + x_0)} = \frac{\mu_0J}{2}\left(-x_0 + \frac{b^2}{d + x_0}\right)$, with $J = \frac{I}{\pi(a^2 - b^2)}$.

              The hole slightly **weakens** the field there: removing current on the far side.
            `,
          }),
          P({
            id: 'e2-hole-p3', title: 'A of the holey cylinder, in the hole',
            q: md`Inside a uniform cylinder with $\vb J = J\hat{\mathbf z}$, $A_z = -\frac{\mu_0J}{4}s^2$ (+ const). Using superposition, find $A_z$ in the hole as a function of $x$ (hole at $(d, 0)$), up to a constant, and confirm $\vb B$ is uniform. Give $\partial A_z/\partial x$.`,
            hints: [md`$A_z = -\frac{\mu_0J}{4}\left[(x^2 + y^2) - ((x - d)^2 + y^2)\right]$.`, md`$B_y = -\partial_xA_z$.`],
            parts: [{ lbl: md`$\partial_xA_z$`, expr: '-mu0*J*d/2', vars: { mu0: [0.5, 2], J: [1, 3], d: [0.5, 1] } }],
            sol: md`$A_z = -\frac{\mu_0J}{4}(2xd - d^2)$: linear in $x$, so $\vb B = \nabla\times(A_z\hat{\mathbf z}) = (\partial_yA_z, -\partial_xA_z, 0) = \left(0, \frac{\mu_0Jd}{2}, 0\right)$, uniform ✓, matches $\frac{\mu_0}{2}\vb J\times\vb d$.`,
          }),
        ],
      },

      // ================================================================== A from the curl
      {
        id: 'e2-Acurl', title: 'Vector potential from the curl (when you can\'t integrate)',
        steps: [
          R(md`
            $\vb A = \frac{\mu_0}{4\pi}\int\frac{\vb J}{\srm}d\tau'$ only converges if the current is **localized**. For infinite wires, sheets, solenoids, or anything with ugly geometry, the exam wants you to get $\vb A$ from $\nabla\times\vb A = \vb B$ instead.

            !!method The recipe (2 minutes)
                1. Find $\vb B$ first (Ampère, usually).
                2. **Guess the direction of $\vb A$:** parallel to the current. Straight currents along $\hat{\mathbf z}$ → $\vb A = A_z(s)\hat{\mathbf z}$. Circulating currents (solenoids, spinning things) → $\vb A = A_\phi\hat{\boldsymbol\phi}$. Sheet $K\hat{\mathbf x}$ → $A_x(z)\hat{\mathbf x}$.
                3. Write the **one** surviving curl component and solve the 1-D ODE:
                    - $A_z(s)\hat{\mathbf z}$: $B_\phi = -\frac{dA_z}{ds}$.
                    - $A_\phi(s)\hat{\boldsymbol\phi}$: $B_z = \frac1s\frac{d}{ds}(sA_\phi)$, or Stokes $A_\phi\cdot2\pi s = \Phi(s)$.
                    - $A_x(z)\hat{\mathbf x}$: $B_y = \frac{dA_x}{dz}$.
                    - $A_\phi(r,\theta)\hat{\boldsymbol\phi}$ (spheres): $B_r = \frac{1}{r\sin\theta}\partial_\theta(\sin\theta A_\phi)$, $B_\theta = -\frac1r\partial_r(rA_\phi)$.
                4. Fix constants: $\vb A$ **continuous** at every boundary, regular at the axis, and pick the reference (e.g. $A = 0$ at $s = a$) when it would blow up at infinity.
                5. Check: $\nabla\cdot\vb A = 0$ (automatic for these forms) and $\nabla^2A_i = -\mu_0J_i$.

            !!intuition Why this works
                $\vb B$ alone doesn't fix $\vb A$ (you can add any gradient). Choosing the form $A_z(s)\hat{\mathbf z}$ or $A_\phi(s)\hat{\boldsymbol\phi}$ automatically puts you in Coulomb gauge, and the ODE plus continuity fixes the rest up to a constant. It's the magnetic version of getting $V$ by integrating $\vb E$: you never touch the source integral.

            ### Worked: uniform-J wire, everywhere

            $B_\phi = \frac{\mu_0Js}{2}$ inside, $\frac{\mu_0Ja^2}{2s}$ outside. Choose $A_z(a) = 0$.

            Inside: $-\frac{dA_z}{ds} = \frac{\mu_0Js}{2}$ ⇒ $A_z = \frac{\mu_0J}{4}(a^2 - s^2)$. Outside: $-\frac{dA_z}{ds} = \frac{\mu_0Ja^2}{2s}$ ⇒ $A_z = -\frac{\mu_0Ja^2}{2}\ln\frac sa = -\frac{\mu_0I}{2\pi}\ln\frac sa$. Continuous at $a$ ✓. Check inside: $\frac1s\frac{d}{ds}\left(s\frac{dA_z}{ds}\right) = -\mu_0J$ ✓.

            ### Worked: spinning shell, inside

            $\vb B = B_0\hat{\mathbf z}$ uniform with $B_0 = \frac23\mu_0\sigma\omega R$. Guess $A_\phi = cs = cr\sin\theta$: $\frac1s\frac{d}{ds}(cs^2) = 2c = B_0$, so $\vb A = \frac{B_0}{2}r\sin\theta\,\hat{\boldsymbol\phi} = \frac{\mu_0R\omega\sigma}{3}r\sin\theta\,\hat{\boldsymbol\phi}$, Griffiths' answer, with no integral. Outside it's the dipole $\frac{\mu_0m\sin\theta}{4\pi r^2}$, and at $r = R$ both give $\frac{\mu_0\sigma\omega R^2}{3}\sin\theta$ ✓.
          `),
          Q(md`For an infinite straight wire, why can't you compute $\vb A$ from $\frac{\mu_0}{4\pi}\int\frac{I\,d\vb l}{\srm}$?`,
            [md`The integral diverges logarithmically, like $V$ for an infinite line charge`, md`$\vb A$ is zero for a straight wire`, md`The integral gives $\vb A$ along $\hat{\boldsymbol\phi}$, which is wrong`, md`The current isn't steady`], 0,
            [null, md`$\vb A = -\frac{\mu_0I}{2\pi}\ln(s/s_0)\hat{\mathbf z}$: not zero.`, md`It would point along $\hat{\mathbf z}$, but it diverges.`, md`It's steady.`],
            md`$\int_{-\infty}^\infty\frac{dz}{\sqrt{z^2 + s^2}}$ diverges. Solve $-dA_z/ds = B_\phi$ instead and pick a reference radius.`),
          Q(md`$\vb B = B_0\hat{\mathbf z}$ for $s<R$, $0$ outside (a solenoid). Which is $\vb A$ outside?`,
            [md`$\frac{B_0R^2}{2s}\hat{\boldsymbol\phi}$`, md`$0$, because $\vb B = 0$ there`, md`$\frac{B_0s}{2}\hat{\boldsymbol\phi}$`, md`$-\frac{B_0R^2}{2}\ln s\,\hat{\mathbf z}$`], 0,
            [null, md`$\oint\vb A\cdot d\vb l$ = enclosed flux $B_0\pi R^2\ne0$.`, md`That's the inside form.`, md`$\vb A$ follows the current, which circulates: $\hat{\boldsymbol\phi}$.`],
            md`Stokes: $A_\phi\cdot2\pi s = B_0\pi R^2$. Curl-free outside, but not zero.`),
          P({
            id: 'e2-Acurl-p1', title: 'Wire with J ∝ s: B and A everywhere',
            q: md`A long wire of radius $a$ carries $\vb J = J_0\dfrac sa\hat{\mathbf z}$. With $A_z(a) = 0$, find (a) $B_\phi$ inside, (b) $A_z$ inside, (c) $A_z$ outside.`,
            hints: [md`$I_{\text{enc}} = \frac{2\pi J_0s^3}{3a}$; total $I = \frac{2\pi J_0a^2}{3}$.`, md`$-\frac{dA_z}{ds} = B_\phi$.`],
            parts: [
              { lbl: md`(a) $B_\phi$ in`, expr: 'mu0*J0*s^2/(3*a)', vars: { mu0: [0.5, 2], J0: [1, 3], s: [0.2, 0.8], a: [1, 2] } },
              { lbl: md`(b) $A_z$ in`, expr: 'mu0*J0*(a^3 - s^3)/(9*a)', vars: { mu0: [0.5, 2], J0: [1, 3], s: [0.2, 0.8], a: [1, 2] } },
              { lbl: md`(c) $A_z$ out`, expr: '-mu0*J0*a^2*ln(s/a)/3', vars: { mu0: [0.5, 2], J0: [1, 3], s: [2.5, 4], a: [1, 2] } },
            ],
            sol: md`
              (a) $\frac{\mu_0I_{\text{enc}}}{2\pi s}$. (b) $A_z = -\frac{\mu_0J_0s^3}{9a} + C$ with $A_z(a) = 0$. (c) $B_\phi = \frac{\mu_0J_0a^2}{3s}$ ⇒ $A_z = -\frac{\mu_0J_0a^2}{3}\ln\frac sa$.

              **Check:** $\frac1s\frac{d}{ds}\left(s\cdot\left(-\frac{\mu_0J_0s^2}{3a}\right)\right) = -\frac{\mu_0J_0s}{a} = -\mu_0J_z$ ✓.
            `,
          }),
          P({
            id: 'e2-Acurl-p2', title: 'Thick slab of current: A(z)',
            q: md`A slab $|z|<a$ carries $\vb J = J\hat{\mathbf x}$ (so $B_y = -\mu_0Jz$ inside, $\mp\mu_0Ja$ outside). With $A_x(0) = 0$, find (a) $A_x$ inside, (b) $A_x$ above the slab ($z>a$).`,
            hints: [md`$B_y = \frac{dA_x}{dz}$.`, md`Match $A_x$ at $z = a$.`],
            parts: [
              { lbl: md`(a) $A_x$ in`, expr: '-mu0*J*z^2/2', vars: { mu0: [0.5, 2], J: [1, 3], z: [-0.4, 0.4] } },
              { lbl: md`(b) $A_x$ above`, expr: '-mu0*J*a*z + mu0*J*a^2/2', vars: { mu0: [0.5, 2], J: [1, 3], a: [0.5, 1], z: [1.5, 3] } },
            ],
            sol: md`(a) Integrate $-\mu_0Jz$. Check $\frac{d^2A_x}{dz^2} = -\mu_0J$ ✓. (b) $A_x = -\mu_0Jaz + C$; continuity at $a$: $-\frac{\mu_0Ja^2}{2} = -\mu_0Ja^2 + C$.`,
          }),
          P({
            id: 'e2-Acurl-p3', title: 'Given A, find B and J (the other direction)',
            q: md`$\vb A = ks^3\hat{\mathbf z}$ (cylindrical). Find (a) $B_\phi$, (b) $J_z$. (c) Is $\vb A$ in Coulomb gauge?`,
            parts: [
              { lbl: md`(a) $B_\phi$`, expr: '-3*k*s^2', vars: { k: [1, 3], s: [0.5, 2] } },
              { lbl: md`(b) $J_z$`, expr: '-9*k*s/mu0', vars: { k: [1, 3], s: [0.5, 2], mu0: [0.5, 2] } },
              { lbl: md`(c)`, mc: [md`Yes`, md`No`], a: 0, why: [null, md`$\partial_zA_z = 0$: the divergence vanishes.`] },
            ],
            sol: md`(a) $-\frac{d}{ds}(ks^3)$. (b) $\frac{1}{\mu_0s}\frac{d}{ds}(s\cdot(-3ks^2)) = -\frac{9ks}{\mu_0}$. Check: $\nabla^2A_z = \frac1s(s\cdot3ks^2)' = 9ks = -\mu_0J_z$ ✓.`,
          }),
        ],
      },

      // ================================================================== Mock I
      {
        id: 'e2-mockI', title: 'Mock Exam II (I): same style as Spring 2026', kind: 'mock',
        steps: [
          R(md`A fresh exam of the same kind as Spring 2026: D/E/P, a cylinder with an off-axis hole, and a vector potential you get from the curl. 50 minutes, formula sheet plus your cheat sheet. Do this one tonight.`),
          paper('Mock Hour Exam II (I)', [
            {
              q: md`
                **Problem 1 (25 pts, D/E/P).** A conducting sphere of radius $a$ carries charge $Q$. It is surrounded by linear dielectric $\varepsilon_{r1}$ for $a<r<b$ and $\varepsilon_{r2}$ for $b<r<c$; vacuum outside.

                (a) Find $\vb D$, $\vb E$ and $\vb P$ in every region. (b) Find all bound surface charge densities and $\rho_b$. (c) Verify that the total bound charge is zero. (d) Find the potential of the conductor.
              `,
              ans: md`
                - (a) $\vb D = \frac{Q}{4\pi r^2}\uv r$ for $r>a$; $\vb E = \vb D/\varepsilon_0\varepsilon_{ri}$ in shell $i$, $\vb D/\varepsilon_0$ outside; $\vb P = (1 - \frac1{\varepsilon_{ri}})\vb D$ in shell $i$.
                - (b) $\sigma_b(a) = -\frac{\chi_1}{\varepsilon_{r1}}\frac{Q}{4\pi a^2}$; $\sigma_b(b) = \frac{Q}{4\pi b^2}\left(\frac1{\varepsilon_{r2}} - \frac1{\varepsilon_{r1}}\right)$; $\sigma_b(c) = \frac{\chi_2}{\varepsilon_{r2}}\frac{Q}{4\pi c^2}$; $\rho_b = 0$.
                - (c) $Q\left[-\frac{\chi_1}{\varepsilon_{r1}} + \frac{\chi_1}{\varepsilon_{r1}} - \frac{\chi_2}{\varepsilon_{r2}} + \frac{\chi_2}{\varepsilon_{r2}}\right] = 0$ ✓.
                - (d) $V = \frac{Q}{4\pi\varepsilon_0}\left[\frac1c + \frac1{\varepsilon_{r2}}\left(\frac1b - \frac1c\right) + \frac1{\varepsilon_{r1}}\left(\frac1a - \frac1b\right)\right]$.
              `,
              sol: md`The chain: $\vb D$ (Gauss, free only) → $\vb E$ per region → $\vb P = \vb D - \varepsilon_0\vb E$ → $\sigma_b = \vb P\cdot\uv n$ (inner faces: $\uv n = -\uv r$). $\rho_b = 0$ because each shell is linear and homogeneous with no free charge. **The trick:** write $\vb D$ once; every other line is a division.`,
            },
            {
              q: md`
                **Problem 2 (25 pts, D/E/P with frozen P).** A long cylinder of radius $R$ has frozen-in $\vb P = ks\,\hat{\mathbf s}$. A line charge $\lambda$ (free) runs along its axis.

                (a) Find $\vb D$ everywhere. (b) Find $\vb E$ inside and outside. (c) Find $\rho_b$ and $\sigma_b$. (d) Check $\vb E$ inside using Gauss with **all** the charge.
              `,
              ans: md`
                - (a) $\vb D = \frac{\lambda}{2\pi s}\hat{\mathbf s}$ everywhere ($s>0$).
                - (b) Inside $\vb E = \frac{1}{\varepsilon_0}\left(\frac{\lambda}{2\pi s} - ks\right)\hat{\mathbf s}$; outside $\frac{\lambda}{2\pi\varepsilon_0s}\hat{\mathbf s}$.
                - (c) $\rho_b = -2k$, $\sigma_b = kR$.
                - (d) Enclosed per length: $\lambda - 2k\pi s^2$; $E = \frac{\lambda - 2\pi ks^2}{2\pi\varepsilon_0s}$ ✓.
              `,
              sol: md`$\vb D$ sees only $\lambda$ (cylindrical symmetry). Frozen $\vb P$: $\vb E = (\vb D - \vb P)/\varepsilon_0$, no $\varepsilon$. Outside, the bound charge cancels ($kR\cdot2\pi R - 2k\pi R^2 = 0$). **The trick:** with a frozen $\vb P$, never write $\varepsilon\vb E$.`,
            },
            {
              q: md`
                **Problem 3 (25 pts, the off-axis hole).** A long cylinder of radius $a$ carries total current $I$ (along $+z$), uniformly distributed over the metal, with a cylindrical hole of radius $b = a/2$ whose axis is at distance $d = a/3$ from the main axis.

                (a) Find $J$, and the currents $I_+$, $I_-$ of the two superposed solid cylinders. (b) Find $\vb B$ in the hole (magnitude and direction relative to $\vb d$). (c) Find $B$ outside at distance $2a$ from the main axis, on the side of the hole, along the line through both axes. (d) Find the same on the opposite side.
              `,
              ans: md`
                - (a) $J = \frac{4I}{3\pi a^2}$; $I_+ = \frac43I$, $I_- = -\frac13I$.
                - (b) $B = \frac{\mu_0Jd}{2} = \frac{2\mu_0I}{9\pi a}$, perpendicular to $\vb d$ ($\hat{\mathbf z}\times\hat{\mathbf d}$).
                - (c) $\frac{\mu_0I}{2\pi a}\left(\frac{2}{3} - \frac15\right) = \frac{7\mu_0I}{30\pi a}$.
                - (d) $\frac{\mu_0I}{2\pi a}\left(\frac23 - \frac17\right) = \frac{11\mu_0I}{42\pi a}$.
              `,
              sol: md`
                **(a)** Metal area $\pi(a^2 - a^2/4) = \frac34\pi a^2$. $I_+ = J\pi a^2$, $I_- = -J\pi\frac{a^2}{4}$.

                **(b)** $\frac{\mu_0}{2}\cdot\frac{4I}{3\pi a^2}\cdot\frac a3$.

                **(c)** Point at $x = 2a$; hole axis at $a/3$, distance $\frac53a$. $B = \frac{\mu_0}{2\pi}\left[\frac{4I/3}{2a} - \frac{I/3}{5a/3}\right] = \frac{\mu_0I}{2\pi a}\left(\frac23 - \frac15\right)$.

                **(d)** $x = -2a$: distance to the hole axis $\frac73a$. Magnitudes: $\frac{\mu_0}{2\pi}\left[\frac{4I/3}{2a} - \frac{I/3}{7a/3}\right]$. (Both pieces point the same way around, the hole still subtracts.)

                **Check:** both are close to $\frac{\mu_0I}{2\pi(2a)} = \frac{\mu_0I}{4\pi a}$ ($0.250$ vs $0.233$ and $0.262$ in units $\frac{\mu_0I}{\pi a}$): the near side loses more.
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts, A from the curl).** A long cylindrical shell of radius $R$ carries a surface current $\vb K = K\hat{\boldsymbol\phi}$ (a solenoid), and a thin wire along its axis carries current $I$ along $\hat{\mathbf z}$.

                (a) Find $\vb B$ everywhere. (b) Explain why $\frac{\mu_0}{4\pi}\int\frac{\vb J}{\srm}d\tau$ can't be used here. (c) Find $\vb A$ everywhere (choose $A_z = 0$ at $s = R$). (d) Check the boundary condition on $\vb A$ and on $\partial\vb A/\partial s$ at $s = R$.
              `,
              ans: md`
                - (a) $\vb B = \frac{\mu_0I}{2\pi s}\hat{\boldsymbol\phi} + \mu_0K\hat{\mathbf z}$ inside; $\frac{\mu_0I}{2\pi s}\hat{\boldsymbol\phi}$ outside.
                - (b) Both currents extend to infinity: the integral diverges.
                - (c) $A_\phi = \frac{\mu_0Ks}{2}$ inside, $\frac{\mu_0KR^2}{2s}$ outside; $A_z = -\frac{\mu_0I}{2\pi}\ln\frac sR$ everywhere.
                - (d) $\vb A$ continuous ✓; $\partial_sA_\phi$ jumps from $\frac{\mu_0K}{2}$ to $-\frac{\mu_0K}{2}$, by $-\mu_0K$ ✓.
              `,
              sol: md`
                **(a)** Superpose a solenoid ($\mu_0nI\to\mu_0K$ inside) and a wire.

                **(c)** Two pieces, each from one curl component: $\hat{\mathbf z}$-field → $A_\phi$ by Stokes ($A_\phi2\pi s = \Phi$); $\hat{\boldsymbol\phi}$-field → $A_z$ from $-dA_z/ds = B_\phi$. Superpose.

                **The trick:** split by current direction; each piece of $\vb A$ is parallel to its own current and comes from a one-line ODE.
              `,
            },
          ]),
        ],
      },
    ],
  });
})();

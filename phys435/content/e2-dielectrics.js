/* Hour Exam II, part 1: fields in matter, electric side (Lectures 15–19, Griffiths 4.1–4.4, HW 6–7, Discussion 5).
   Registers a holding unit; zz-scope.js places each lesson on the Exam II study path. */
(function () {
  'use strict';
  const { R, P, Q } = C;

  C.unit({
    id: 'h-e2-diel', num: '', title: 'Exam II: dielectrics (holding)',
    lessons: [
      // ------------------------------------------------------------------ dipoles in fields
      {
        id: 'e2-dipE', title: 'A dipole in an external field: torque, energy, force',
        steps: [
          R(md`
            Exam I asked what field a dipole **makes**. This lesson flips it: a dipole sitting **in** someone else's field $\vb E$. This is the bridge to polarization, because a dielectric is just a crowd of tiny dipoles that the field twists into line.

            | Quantity | Formula | Uniform $\vb E$? |
            |---|---|---|
            | Torque | $\vb N = \vb p\times\vb E$ | yes, twists $\vb p$ toward $\vb E$ |
            | Energy | $U = -\vb p\cdot\vb E$ | lowest when $\vb p\parallel\vb E$ |
            | Force | $\vb F = (\vb p\cdot\nabla)\vb E = \nabla(\vb p\cdot\vb E)$ | **zero** in a uniform field |

            !!intuition Picture it as two charges
                $+q$ and $-q$ in a uniform field feel equal and opposite forces: no net push, but a twist. In a nonuniform field the end sitting in the stronger field wins, so an aligned dipole gets **pulled toward the strong field**. That is why a charged comb picks up paper: the paper polarizes along $\vb E$, then gets dragged toward the comb where $|\vb E|$ is bigger.

            !!method Speed trick: never compute $(\vb p\cdot\nabla)\vb E$ if you can avoid it
                For a dipole **held fixed** in direction, $\vb F = \nabla(\vb p\cdot\vb E) = -\nabla U$. Write $U$ as a function of position and take one derivative. On a symmetry axis this is a single $d/dz$.

            **HW 4.6 in one line.** A dipole $\vb p$ at height $z$ above a grounded plane, tilted $\theta$ from the normal. The image is a dipole at $-z$ with the **parallel component flipped** and the perpendicular component kept: $\vb p' = (-p\sin\theta, 0, p\cos\theta)$. The image field at $\vb p$ (distance $2z$, along $\hat{\mathbf z}$) is $\vb E = \dfrac{p}{4\pi\varepsilon_0(2z)^3}(\sin\theta\,\hat{\mathbf x} + 2\cos\theta\,\hat{\mathbf z})$, and

            $$|\vb N| = |\vb p\times\vb E| = \frac{p^2\sin\theta\cos\theta}{4\pi\varepsilon_0(2z)^3}.$$

            It vanishes at $\theta = 0, \pi/2, \pi$. Only $\theta = 0$ and $\pi$ (perpendicular to the plane) are stable: the dipole ends up lined up with its image, head to tail.

            !!trap Image of a dipole
                Image each charge, not the arrow. The charge at the tip goes to the mirror point with opposite sign. Net effect: the component **along** the plane flips, the component **normal** to the plane stays. Students who just "negate $\vb p$" get the torque wrong.
          `),
          Q(md`A pure dipole sits in a **uniform** field, tilted 30° from $\vb E$. What happens?`,
            [md`It feels a torque but no net force`, md`It feels a force along $\vb E$ and no torque`, md`It feels both a force and a torque`, md`Nothing: a neutral object ignores a uniform field`], 0,
            [null, md`Force needs a gradient: $\vb F = (\vb p\cdot\nabla)\vb E = 0$ when $\vb E$ is uniform.`, md`No gradient means no force. Only the torque $\vb p\times\vb E$ survives.`, md`Neutral kills the net force, but the two ends are pushed opposite ways, which is a torque.`],
            md`Equal and opposite forces on $\pm q$ cancel, but they act at different points, so $\vb N = \vb p\times\vb E \ne 0$ while $\vb F = 0$.`),
          Q(md`A dipole aligned with the field of a point charge $Q>0$ ($\vb p$ pointing radially outward) is released. Which way does it move?`,
            [md`Toward $Q$`, md`Away from $Q$`, md`It does not move, only rotates`, md`It depends on the sign of $p$`], 0,
            [null, md`$U = -pE$ gets more negative where $E$ is larger, so the dipole is pulled toward larger $E$, i.e. toward $Q$.`, md`It is already aligned, so there is no torque. The field gradient gives a net force.`, md`$p$ is a magnitude here; the alignment is what matters.`],
            md`$U = -pE(r) = -\dfrac{pQ}{4\pi\varepsilon_0r^2}$ is lowest at small $r$, so $F_r = -dU/dr = -\dfrac{2pQ}{4\pi\varepsilon_0r^3} < 0$: attracted. An aligned dipole always heads for the strong field.`),
          Q(md`Dipole above a grounded plane (HW 4.6). If it is free to rotate, how does it come to rest?`,
            [md`Perpendicular to the plane (pointing toward or away from it)`, md`Parallel to the plane`, md`At 45°, where $\sin\theta\cos\theta$ is largest`, md`Any angle; the torque is zero`], 0,
            [null, md`$\theta = \pi/2$ is an equilibrium (torque $\propto\sin\theta\cos\theta = 0$), but unstable: tip it slightly and the torque pushes it further.`, md`45° is where the torque is **largest**, the opposite of an equilibrium.`, md`$\vb N\propto\sin\theta\cos\theta$, which is nonzero except at $0, \pi/2, \pi$.`],
            md`$N \propto \sin\theta\cos\theta$ and its sign pushes $\theta$ toward $0$ or $\pi$. The dipole lines up head to tail with its image, which is the low-energy arrangement.`),
          P({
            id: 'e2-dipE-p1', title: 'Two dipoles on an axis',
            q: md`$\vb p_1 = p_1\hat{\mathbf z}$ sits at the origin and $\vb p_2 = p_2\hat{\mathbf z}$ at $z = r$ on the axis. (a) What is the field of $\vb p_1$ at $\vb p_2$? Give $E_z$. (b) What is the force on $\vb p_2$? Give $F_z$ (negative means attraction).`,
            hints: [md`On its axis a dipole's field is $\dfrac{2p}{4\pi\varepsilon_0 z^3}$.`, md`$F_z = p_2\,dE_z/dz$, evaluated at $z = r$.`],
            parts: [
              { lbl: md`(a) $E_z$`, expr: 'p1/(2*pi*eps0*r^3)', vars: { p1: [1, 3], eps0: [0.5, 2], r: [1, 3] } },
              { lbl: md`(b) $F_z$`, expr: '-3*p1*p2/(2*pi*eps0*r^4)', vars: { p1: [1, 3], p2: [1, 3], eps0: [0.5, 2], r: [1, 3] } },
            ],
            sol: md`
              (a) On the axis $\theta = 0$: $E_z = \dfrac{2p_1}{4\pi\varepsilon_0r^3} = \dfrac{p_1}{2\pi\varepsilon_0r^3}$.

              (b) $F_z = p_2\dfrac{d}{dz}\dfrac{p_1}{2\pi\varepsilon_0z^3} = -\dfrac{3p_1p_2}{2\pi\varepsilon_0r^4}$. Head to tail attracts. Falls off as $1/r^4$: one power faster than the field, because force is a gradient.

              **Same math, magnetic version:** HW 6.3 is identical with $\dfrac{1}{4\pi\varepsilon_0}\to\dfrac{\mu_0}{4\pi}$: $F = \dfrac{3\mu_0m_1m_2}{2\pi r^4}$.
            `,
          }),
        ],
      },

      // ------------------------------------------------------------------ polarization and bound charge
      {
        id: 'e2-bound', title: 'Polarization and bound charge',
        steps: [
          R(md`
            $\vb P$ = dipole moment per unit volume. Units C·m / m³ = **C/m²**, the same units as a surface charge. That is not an accident.

            A polarized object acts exactly like two charge distributions:

            $$\boxed{\sigma_b = \vb P\cdot\uv n} \qquad \boxed{\rho_b = -\nabla\cdot\vb P}$$

            and then you forget it is a dielectric and do Exam I physics: Gauss, superposition, $V = \frac{1}{4\pi\varepsilon_0}\int\frac{dq}{\srm}$.

            !!intuition Why uniform $\vb P$ only shows up at the surface
                Line up a row of dipoles head to tail: $(-+)(-+)(-+)$. Inside, each $+$ sits next to a $-$ and they cancel. Only the two ends are left uncovered: a $-$ at the tail end and a $+$ at the head end. So uniform $\vb P$ means $\rho_b = 0$ and charge only on faces that $\vb P$ **pierces**. Faces parallel to $\vb P$ get nothing ($\vb P\cdot\uv n = 0$).

            !!intuition Why $\rho_b = -\nabla\cdot\vb P$ has a minus sign
                If $\vb P$ spreads out from a point (positive divergence), the $+$ ends of the dipoles point away and leave their $-$ ends piled up behind. Diverging $\vb P$ leaves **negative** charge.

            !!key Free check on every bound-charge problem
                A neutral dielectric that got polarized has **zero total bound charge**: $\oint\sigma_b\,da + \int\rho_b\,d\tau = 0$. It is just the divergence theorem. Compute both, add, and if you don't get zero, you have an error. Ten seconds that catches most sign errors.

            ### The four standard shapes (memorize)

            | Object, uniform $\vb P = P\hat{\mathbf z}$ | Bound charge | Field inside |
            |---|---|---|
            | Sphere radius $R$ | $\sigma_b = P\cos\theta$ | $\vb E = -\dfrac{\vb P}{3\varepsilon_0}$, uniform |
            | Slab with $\vb P$ ⊥ faces | $\pm P$ on the faces | $\vb E = -\dfrac{\vb P}{\varepsilon_0}$ |
            | Long rod with $\vb P$ along axis | $\pm P$ on the far ends only | $\vb E\approx0$ |
            | Short disk (HW 4.11, $L\ll a$) | $\pm P$ on the faces | $\approx-\vb P/\varepsilon_0$, like a capacitor |

            Outside the sphere the field is **exactly** a pure dipole with $\vb p = \frac43\pi R^3\vb P$ (total moment = moment per volume × volume). You already know the $\sigma = k\cos\theta$ shell from Exam I; this is the same problem.

            !!method Speed trick: one formula for all uniform shapes
                Inside a uniformly polarized ellipsoid, $\vb E = -N\vb P/\varepsilon_0$, with the "depolarizing factor" $N$: slab ⊥ $\vb P$ → $N = 1$, sphere → $N = \tfrac13$, long cylinder ⊥ $\vb P$ → $N = \tfrac12$, long needle along $\vb P$ → $N = 0$. You will see the same $N$ again for dielectrics in a field and for magnets.

            **HW 4.11 (bar electret), the sketch question.** Uniform $\vb P$ along the axis of a cylinder: $\sigma_b = +P$ on the top cap, $-P$ on the bottom, nothing on the side. $L\gg a$: two small charged disks far apart, the field looks like two point charges $\pm P\pi a^2$. $L\ll a$: a parallel-plate capacitor, $\vb E\approx-\vb P/\varepsilon_0$ inside and almost nothing outside. $L\approx a$: in between, like a physical dipole. Inside, $\vb E$ points **opposite** $\vb P$ (from the $+$ cap to the $-$ cap).
          `),
          Q(md`A cube carries uniform polarization $\vb P = P\hat{\mathbf z}$. Where is the bound charge?`,
            [md`$+P$ on the top face, $-P$ on the bottom face, nothing elsewhere`, md`Spread uniformly through the volume`, md`On all six faces`, md`Nowhere: uniform $\vb P$ has no bound charge`], 0,
            [null, md`$\rho_b = -\nabla\cdot\vb P = 0$ for uniform $\vb P$.`, md`On the four side faces $\uv n\perp\vb P$, so $\sigma_b = \vb P\cdot\uv n = 0$.`, md`Uniform $\vb P$ has no **volume** charge, but the faces it pierces get $\sigma_b = \pm P$.`],
            md`$\rho_b = 0$; $\sigma_b = \vb P\cdot\uv n$ is $+P$ on top ($\uv n = \hat{\mathbf z}$), $-P$ on the bottom, $0$ on the sides.`),
          Q(md`Inside a uniformly polarized sphere, which way does $\vb E$ point?`,
            [md`Opposite $\vb P$, magnitude $P/3\varepsilon_0$`, md`Along $\vb P$, magnitude $P/3\varepsilon_0$`, md`Opposite $\vb P$, magnitude $P/\varepsilon_0$`, md`$\vb E = 0$ inside`], 0,
            [null, md`Sign: $+$ charge sits on the top cap ($\sigma_b = P\cos\theta>0$ at $\theta = 0$), so the field inside runs from top to bottom, against $\vb P$.`, md`That is the slab ($N = 1$). The sphere's factor is $N = \tfrac13$.`, md`$\vb E = 0$ is a conductor. A polarized sphere has surface charge whose field fills the inside.`],
            md`$\vb E_{\text{in}} = -\vb P/3\varepsilon_0$. It points from the $+$ cap to the $-$ cap, which is against $\vb P$. Bound charge always produces a field that fights the polarization inside: this is "depolarization".`),
          Q(md`An object's polarization is $\vb P(\vb r)$ and it carries no free charge. What is $\oint\sigma_b\,da + \int\rho_b\,d\tau$?`,
            [md`$0$, always`, md`$\int\vb P\cdot d\vb a$`, md`It depends on the shape`, md`$\varepsilon_0\oint\vb E\cdot d\vb a$, which can be anything`], 0,
            [null, md`That is $\oint\sigma_b\,da$ alone. The volume term $-\int\nabla\cdot\vb P\,d\tau$ cancels it exactly.`, md`The divergence theorem works for every shape.`, md`$\varepsilon_0\oint\vb E\cdot d\vb a$ over a surface just outside equals the total charge inside, which is this sum, which is zero.`],
            md`$\oint\vb P\cdot d\vb a - \int\nabla\cdot\vb P\,d\tau = 0$ by the divergence theorem. Polarizing a neutral object only moves charge around.`),
          Q(md`A long cylinder carries uniform $\vb P$ along its axis. The field **inside, far from the ends** is approximately`,
            [md`$0$`, md`$-\vb P/\varepsilon_0$`, md`$-\vb P/3\varepsilon_0$`, md`$-\vb P/2\varepsilon_0$`], 0,
            [null, md`That is the short disk (capacitor limit). Here the $\pm$ caps are far away.`, md`That is the sphere.`, md`$\tfrac12$ is the long cylinder with $\vb P$ **perpendicular** to the axis.`],
            md`The only bound charge is $\pm P$ on the two end caps, far away. Their field in the middle is tiny: $N = 0$. (The magnetic analog, a long bar magnet, is the opposite: big $\vb B$ inside. Keep that contrast in mind for Unit 8.)`),
          P({
            id: 'e2-bound-p1', title: 'HW 4.10: a sphere with P = k r',
            q: md`A sphere of radius $R$ has $\vb P = k\vb r$ (radial, growing linearly from the center). Find (a) $\sigma_b$, (b) $\rho_b$, (c) $E_r$ inside at radius $r$, (d) $E_r$ outside.`,
            hints: [md`$\nabla\cdot(k\vb r) = \frac{1}{r^2}\frac{d}{dr}(r^2\cdot kr)$.`, md`There is no free charge and the setup is spherically symmetric, so $\vb D = 0$ everywhere.`],
            parts: [
              { lbl: md`(a) $\sigma_b$`, expr: 'k*R', vars: { k: [1, 3], R: [0.5, 2] } },
              { lbl: md`(b) $\rho_b$`, expr: '-3*k', vars: { k: [1, 3] } },
              { lbl: md`(c) $E_r$ inside`, expr: '-k*r/eps0', vars: { k: [1, 3], r: [0.2, 0.9], eps0: [0.5, 2] } },
              { lbl: md`(d) $E_r$ outside`, mc: [md`$0$`, md`$-kR^3/\varepsilon_0r^2$`, md`$kR^3/3\varepsilon_0r^2$`, md`$-kR/\varepsilon_0$`], a: 0,
                why: [null, md`That would need net charge $-4\pi kR^3$; the total bound charge is zero.`, md`Same: zero total charge means zero field outside a spherical distribution.`, md`That's the inside field at the surface, not outside.`] },
            ],
            sol: md`
              (a) $\sigma_b = \vb P\cdot\uv r\,|_{R} = kR$.

              (b) $\rho_b = -\frac{1}{r^2}\frac{d}{dr}(kr^3) = -3k$.

              **Check:** $kR\cdot4\pi R^2 - 3k\cdot\frac43\pi R^3 = 0$ ✓.

              (c) **Fast way:** no free charge plus spherical symmetry means $\vb D = 0$, so $\vb E = -\vb P/\varepsilon_0 = -\dfrac{k r}{\varepsilon_0}\uv r$. **Slow way (check):** Gauss with $Q_{\text{enc}} = -3k\cdot\frac43\pi r^3$ gives the same.

              (d) Total charge is zero and the setup is spherical, so $\vb E = 0$ outside.
            `,
          }),
          P({
            id: 'e2-bound-p2', title: 'Griffiths 4.15: a shell with P = k/r',
            q: md`A thick shell $a<r<b$ has $\vb P = \dfrac{k}{r}\uv r$, no free charge. Find (a) $\rho_b$, (b) $\sigma_b$ on the inner surface $r = a$, (c) $E_r$ for $a<r<b$, (d) $E$ for $r<a$ and $r>b$.`,
            hints: [md`On the inner surface the outward normal of the material points **toward the center**: $\uv n = -\uv r$.`, md`The fast way again: $\vb D = 0$.`],
            parts: [
              { lbl: md`(a) $\rho_b$`, expr: '-k/r^2', vars: { k: [1, 3], r: [1, 2] } },
              { lbl: md`(b) $\sigma_b(a)$`, expr: '-k/a', vars: { k: [1, 3], a: [0.5, 1] } },
              { lbl: md`(c) $E_r$`, expr: '-k/(eps0*r)', vars: { k: [1, 3], r: [1, 2], eps0: [0.5, 2] } },
              { lbl: md`(d) inside and outside`, mc: [md`$0$ in both regions`, md`$0$ inside, $-k/\varepsilon_0 r$ outside`, md`$-k/\varepsilon_0r$ in both`, md`Not determined without more information`], a: 0,
                why: [null, md`Outside, Gauss encloses all the bound charge, which totals zero.`, md`Inside $r<a$ there is no charge enclosed at all.`, md`Spherical symmetry plus Gauss determines it.`] },
            ],
            sol: md`
              (a) $\rho_b = -\frac{1}{r^2}\frac{d}{dr}(r^2\cdot k/r) = -\dfrac{k}{r^2}$.

              (b) $\sigma_b(a) = \vb P\cdot(-\uv r) = -k/a$; and $\sigma_b(b) = +k/b$.

              (c) $\vb D = 0$ (no free charge, spherical), so $\vb E = -\vb P/\varepsilon_0 = -\dfrac{k}{\varepsilon_0r}\uv r$.

              (d) Both zero. **Check** total: $-\frac ka 4\pi a^2 + \frac kb 4\pi b^2 - \int_a^b\frac{k}{r^2}4\pi r^2dr = 4\pi k(-a + b - (b - a)) = 0$ ✓.
            `,
          }),
          P({
            id: 'e2-bound-p3', title: 'Twist: a cylinder with P = k s',
            q: md`An infinitely long cylinder of radius $a$ has $\vb P = ks\,\hat{\mathbf s}$ (cylindrical $s$). Find (a) $\rho_b$, (b) $\sigma_b$, (c) $E_s$ inside.`,
            hints: [md`Cylindrical divergence: $\frac1s\frac{\partial}{\partial s}(sP_s)$.`],
            parts: [
              { lbl: md`(a) $\rho_b$`, expr: '-2*k', vars: { k: [1, 3] } },
              { lbl: md`(b) $\sigma_b$`, expr: 'k*a', vars: { k: [1, 3], a: [0.5, 2] } },
              { lbl: md`(c) $E_s$ inside`, expr: '-k*s/eps0', vars: { k: [1, 3], s: [0.1, 0.5], eps0: [0.5, 2] } },
            ],
            sol: md`
              (a) $\rho_b = -\frac1s\frac{d}{ds}(ks^2) = -2k$. **Trap:** the sphere gave $-3k$; the cylinder gives $-2k$ (it's the dimension count: $\nabla\cdot\vb r = 3$, $\nabla\cdot(s\hat{\mathbf s}) = 2$).

              (b) $\sigma_b = ka$. Check per length: $ka\cdot2\pi a - 2k\pi a^2 = 0$ ✓.

              (c) $\vb D = 0$ by symmetry, $\vb E = -\vb P/\varepsilon_0 = -\dfrac{ks}{\varepsilon_0}\hat{\mathbf s}$.
            `,
          }),
        ],
      },

      // ------------------------------------------------------------------ D
      {
        id: 'e2-D', title: 'The displacement D: Gauss with free charge only',
        steps: [
          R(md`
            Split all charge into free (what you put there) and bound (what the material does). Define

            $$\vb D = \varepsilon_0\vb E + \vb P \qquad\Rightarrow\qquad \nabla\cdot\vb D = \rho_f,\qquad \oint\vb D\cdot d\vb a = Q_{f,\text{enc}}.$$

            The bound charge vanished from Gauss's law. That is the whole point: you can find $\vb D$ without knowing how the material responds.

            !!trap The trap Kuo will set: $\vb D$ is NOT a "free-charge field"
                $\nabla\times\vb D = \nabla\times\vb P$, which is generally **not** zero. So there is no Coulomb's law for $\vb D$, and no $\vb D = -\nabla(\text{something})$. Gauss for $\vb D$ only gives an answer when **symmetry** (spherical, cylindrical, planar) tells you $\vb D$ is constant on the Gaussian surface. Example: the bar electret has $\rho_f = 0$ everywhere, yet $\vb D \neq 0$ (outside it, $\vb D = \varepsilon_0\vb E \neq 0$).

            !!method Speed trick: no free charge plus symmetry means D = 0
                If there is no free charge and the problem is spherically or cylindrically symmetric (or an infinite slab), then $\vb D = 0$ and instantly $\vb E = -\vb P/\varepsilon_0$ inside the material and $\vb E = 0$ outside. That solved 4.10, 4.15 and the cylinder above in one line each.

            **The universal recipe** (works whenever symmetry holds):

            1. Gauss on free charge → $\vb D$.
            2. $\vb E = \vb D/\varepsilon$ (linear) or $\vb E = (\vb D - \vb P)/\varepsilon_0$ (given $\vb P$).
            3. $\vb P = \vb D - \varepsilon_0\vb E$ (or $\varepsilon_0\chi_e\vb E$).
            4. $\sigma_b = \vb P\cdot\uv n$, $\rho_b = -\nabla\cdot\vb P$.
            5. $V = -\int\vb E\cdot d\vb l$, crossing each region with its own $\vb E$.
          `),
          Q(md`A region has $\rho_f = 0$ everywhere. Must $\vb D = 0$ there?`,
            [md`No: $\nabla\cdot\vb D = 0$ does not mean $\vb D = 0$, because $\nabla\times\vb D$ can be nonzero`, md`Yes, by Gauss's law for $\vb D$`, md`Yes, but only in a linear dielectric`, md`No, because $\vb D$ only depends on bound charge`], 0,
            [null, md`Gauss fixes only the divergence. A field is pinned down by its divergence **and** curl (plus boundary conditions).`, md`Even in a linear dielectric, the boundaries of the material can make $\nabla\times\vb D\ne0$ at the interface, and outside fields can enter.`, md`$\vb D$'s divergence comes from free charge only. Its curl comes from $\vb P$.`],
            md`$\nabla\cdot\vb D = 0$ only. The bar electret is the counterexample: no free charge, nonzero $\vb D$. You need symmetry to conclude $\vb D = 0$.`),
          Q(md`Which is the correct unit of $\vb D$?`,
            [md`C/m²`, md`V/m`, md`C/m³`, md`C·m`], 0,
            [null, md`That is $\vb E$. $\vb D = \varepsilon_0\vb E + \vb P$ has units of $\varepsilon_0\vb E$, which is C/m².`, md`That is a volume density; $\nabla\cdot\vb D$ has those units.`, md`That is a dipole moment.`],
            md`$\vb D$, $\vb P$ and $\varepsilon_0\vb E$ all carry C/m², which is why $\sigma_b = \vb P\cdot\uv n$ and $D_\perp$ jumps by $\sigma_f$.`),
        ],
      },

      // ------------------------------------------------------------------ linear dielectrics
      {
        id: 'e2-linear', title: 'Linear dielectrics: the screened charge and capacitors',
        steps: [
          R(md`
            Most materials respond in proportion: $\vb P = \varepsilon_0\chi_e\vb E$. Then

            $$\vb D = \varepsilon\vb E,\qquad \varepsilon = \varepsilon_0(1 + \chi_e) = \varepsilon_0\varepsilon_r.$$

            **Bound charge in a linear material (homogeneous):** $\rho_b = -\dfrac{\chi_e}{1+\chi_e}\rho_f$. So **no free charge inside means no bound volume charge**: in the bulk you're solving Laplace's equation, and all the bound charge sits on the surfaces. That's why the Exam I machinery (separation of variables) works unchanged.

            !!intuition What $\varepsilon_r$ does
                A free charge $q$ inside the material pulls a cloud of opposite bound charge tight around itself: $q_b = -\dfrac{\chi_e}{1+\chi_e}\,q$. From outside that little cloud, it looks like a point charge $q/\varepsilon_r$. So every field from free charge is **divided by $\varepsilon_r$** if the dielectric fills all space. Water ($\varepsilon_r \approx 80$) screens charges so well that salt falls apart in it.

            ### Setup 1: conductor $Q$ coated with dielectric (Lecture 17, HW 4.26)

            Sphere radius $a$, charge $Q$, dielectric $\varepsilon_r$ out to $b$. Gauss: $D = \dfrac{Q}{4\pi r^2}$ for every $r>a$. Then $E = \dfrac{Q}{4\pi\varepsilon_0\varepsilon_rr^2}$ in the shell, $\dfrac{Q}{4\pi\varepsilon_0r^2}$ outside. Potential of the conductor:

            $$V(a) = \frac{Q}{4\pi\varepsilon_0}\left[\frac1b + \frac{1}{\varepsilon_r}\left(\frac1a - \frac1b\right)\right].$$

            Bound charges: $\sigma_b(a) = -\dfrac{\chi_e}{1+\chi_e}\dfrac{Q}{4\pi a^2}$ (negative, hugging the $+Q$), $\sigma_b(b) = +\dfrac{\chi_e}{1+\chi_e}\dfrac{Q}{4\pi b^2}$, $\rho_b = 0$. They cancel in total, as always.

            ### Setup 2: capacitors (the most common exam setup)

            !!method Speed trick: slabs are springs in series or parallel
                **Stacked** slabs (interfaces parallel to the plates, field crosses one then the other): $D = \sigma_f$ is the **same** in each, $E_i = \sigma_f/\varepsilon_i$. Capacitors in **series**: $\dfrac1C = \sum\dfrac{d_i}{\varepsilon_iA}$.

                **Side by side** (interfaces perpendicular to plates): $E = V/d$ is the **same**, $D_i = \varepsilon_iE$, so the free charge density differs. Capacitors in **parallel**: $C = \sum\dfrac{\varepsilon_iA_i}{d}$.

            **HW 4.18** (slab 1 on top, $\varepsilon_{r1} = 2$; slab 2 below, $\varepsilon_{r2} = 1.5$; each thickness $a$; $\pm\sigma$ on the plates):

            | | Slab 1 | Slab 2 |
            |---|---|---|
            | $D$ | $\sigma$ | $\sigma$ |
            | $E$ | $\sigma/2\varepsilon_0$ | $2\sigma/3\varepsilon_0$ |
            | $P = D - \varepsilon_0E$ | $\sigma/2$ | $\sigma/3$ |
            | $\sigma_b$ top / bottom | $-\sigma/2$ / $+\sigma/2$ | $-\sigma/3$ / $+\sigma/3$ |

            $V = \dfrac{\sigma a}{\varepsilon_0}\left(\dfrac12 + \dfrac23\right) = \dfrac{7\sigma a}{6\varepsilon_0}$. Check (f): field in slab 2 from all charge above it, $(\sigma - \tfrac\sigma2 + \tfrac\sigma2 - \tfrac\sigma3)/\varepsilon_0 = \tfrac{2\sigma}{3\varepsilon_0}$ ✓.

            **Discussion 4.19** (enough dielectric to half-fill): stacked (a), $C/C_0 = \dfrac{2\varepsilon_r}{1+\varepsilon_r}$; side by side (b), $C/C_0 = \dfrac{1+\varepsilon_r}{2}$. Side by side always wins (arithmetic mean ≥ harmonic mean).

            **HW 4.21** (coax, wire $a$, tube $c$, dielectric only from $b$ to $c$): $D = \lambda/2\pi s$ everywhere between, so

            $$\frac CL = \frac{2\pi\varepsilon_0}{\ln(b/a) + \frac{1}{\varepsilon_r}\ln(c/b)}.$$

            Each region contributes its own $\ln$ divided by its own $\varepsilon_r$: coaxial shells are capacitors in series.

            !!trap Free vs bound vs total
                "Charge on the plate" means **free** charge. The bound charge sits on the dielectric's face, right next to the plate. If they ask for the "total" surface charge at the interface, add them: $\sigma_f + \sigma_b = \sigma_f/\varepsilon_r$ next to a conductor.
          `),
          Q(md`A capacitor has two stacked slabs ($\varepsilon_{r1}\ne\varepsilon_{r2}$) filling the gap. Which quantity is the same in both slabs?`,
            [md`$D$`, md`$E$`, md`$P$`, md`Nothing`], 0,
            [null, md`$E = D/\varepsilon$ differs because $\varepsilon$ differs.`, md`$P = \varepsilon_0\chi_eE$ depends on the slab.`, md`$D_\perp$ is continuous across an interface with no free charge.`],
            md`The interface carries no free charge, so $D_\perp$ is continuous. With planar symmetry, Gauss gives $D = \sigma_f$ in both.`),
          Q(md`Same capacitor, but the two dielectrics sit side by side (each fills half the plate area, full thickness). Now which is the same in both halves?`,
            [md`$E$`, md`$D$`, md`The free charge density on the plate`, md`$P$`], 0,
            [null, md`$D = \varepsilon E$ differs. So does the free $\sigma_f$ on each half of the plate.`, md`$\sigma_f = D$, which differs between halves.`, md`$P$ depends on $\chi_e$.`],
            md`Both halves span the same plates at the same $\Delta V$, so $E = V/d$ in both (and $E_\parallel$ is continuous across the vertical interface). The plate's free charge rearranges itself: more on the high-$\varepsilon$ side.`),
          Q(md`A point charge $q$ sits in an infinite sea of dielectric $\varepsilon_r$. How much bound charge collects on the tiny cavity around it?`,
            [md`$-q\,\chi_e/(1+\chi_e)$`, md`$-q$`, md`$-q\,\chi_e$`, md`$0$, because the total bound charge is zero`], 0,
            [null, md`That would make it a conductor (perfect screening). A dielectric only partly screens.`, md`Too big for $\chi_e>1$; it would over-screen.`, md`The total is zero, but the compensating $+$ charge sits "at infinity". The local cloud is negative.`],
            md`Net charge seen from outside the cloud: $q/\varepsilon_r$. So $q_b = q/\varepsilon_r - q = -q\,\chi_e/(1+\chi_e)$.`),
          Q(md`Half-filling a capacitor: stacked (a) versus side-by-side (b), $\varepsilon_r = 3$. The capacitance ratios $C/C_0$ are`,
            [md`(a) 1.5, (b) 2`, md`(a) 2, (b) 1.5`, md`(a) 2, (b) 2`, md`(a) 0.75, (b) 2`], 0,
            [null, md`Swapped. Series (stacked) always gives less than parallel.`, md`They can't be equal unless $\varepsilon_r = 1$.`, md`Adding dielectric never lowers $C$.`],
            md`(a) $2\varepsilon_r/(1+\varepsilon_r) = 6/4 = 1.5$. (b) $(1+\varepsilon_r)/2 = 2$.`),
          P({
            id: 'e2-linear-p1', title: 'HW 4.18: the two-slab capacitor',
            q: md`Plates carry $\pm\sigma$. Top slab: $\varepsilon_{r1} = 2$, bottom slab: $\varepsilon_{r2} = 3/2$, each thickness $a$. Find (a) $P$ in the top slab, (b) $P$ in the bottom slab, (c) the potential difference, (d) the bound charge at the interface between the slabs (total of both faces).`,
            hints: [md`$D = \sigma$ in both. $P = D(1 - 1/\varepsilon_r)$.`, md`At the interface: bottom face of slab 1 ($+P_1$) plus top face of slab 2 ($-P_2$).`],
            parts: [
              { lbl: md`(a) $P_1$`, expr: 'sigma/2', vars: { sigma: [1, 3] } },
              { lbl: md`(b) $P_2$`, expr: 'sigma/3', vars: { sigma: [1, 3] } },
              { lbl: md`(c) $V$`, expr: '7*sigma*a/(6*eps0)', vars: { sigma: [1, 3], a: [0.5, 2], eps0: [0.5, 2] } },
              { lbl: md`(d) $\sigma_b$ at interface`, expr: 'sigma/6', vars: { sigma: [1, 3] } },
            ],
            sol: md`
              **Speed trick:** $P = D - \varepsilon_0 E = D(1 - 1/\varepsilon_r) = D\,\chi_e/\varepsilon_r$. No need to compute $E$ first.

              (a) $\sigma(1 - \tfrac12) = \sigma/2$. (b) $\sigma(1 - \tfrac23) = \sigma/3$.

              (c) $V = E_1a + E_2a = \dfrac{\sigma a}{\varepsilon_0}\left(\tfrac12 + \tfrac23\right) = \dfrac{7\sigma a}{6\varepsilon_0}$.

              (d) $+\sigma/2 - \sigma/3 = +\sigma/6$. Check: the jump in $\varepsilon_0E$ across the interface is $\sigma(\tfrac23 - \tfrac12) = \sigma/6$ ✓.
            `,
          }),
          P({
            id: 'e2-linear-p2', title: 'HW 4.21: the partly filled coax',
            q: md`Coax: inner wire radius $a$, outer tube radius $c$. Dielectric $\varepsilon_r$ fills $b<s<c$; vacuum fills $a<s<b$. Find the capacitance per length.`,
            hints: [md`$D = \lambda/2\pi s$ in both regions.`, md`$V = \int_a^c E\,ds$, split at $b$.`],
            parts: [{ lbl: md`$C/L$`, expr: '2*pi*eps0/(ln(b/a) + ln(c/b)/epsr)', vars: { eps0: [0.5, 2], a: [0.2, 0.5], b: [0.8, 1.2], c: [1.5, 3], epsr: [1.5, 4] } }],
            sol: md`
              $V = \dfrac{\lambda}{2\pi\varepsilon_0}\left[\ln\dfrac ba + \dfrac1{\varepsilon_r}\ln\dfrac cb\right]$, so $\dfrac CL = \dfrac{\lambda}{V} = \dfrac{2\pi\varepsilon_0}{\ln(b/a) + \ln(c/b)/\varepsilon_r}$.

              **Limit checks (do these on the exam):** $\varepsilon_r = 1$ gives $2\pi\varepsilon_0/\ln(c/a)$ ✓; $b = a$ (fully filled) gives $2\pi\varepsilon_0\varepsilon_r/\ln(c/a)$ ✓.
            `,
          }),
          P({
            id: 'e2-linear-p3', title: 'Coated conductor: bound charges',
            q: md`A conducting sphere (radius $a$, free charge $Q$) is coated with dielectric $\chi_e$ out to $b$. Find (a) $\sigma_b$ at $r = a$, (b) the potential of the conductor (zero at infinity).`,
            hints: [md`$P = \varepsilon_0\chi_eE = \dfrac{\chi_e}{1+\chi_e}D$.`, md`On the inner surface of the dielectric, $\uv n = -\uv r$.`],
            parts: [
              { lbl: md`(a) $\sigma_b(a)$`, expr: '-chi*Q/((1+chi)*4*pi*a^2)', vars: { chi: [0.5, 3], Q: [1, 3], a: [0.5, 1] } },
              { lbl: md`(b) $V(a)$`, expr: 'Q/(4*pi*eps0)*(1/b + (1/a - 1/b)/(1+chi))', vars: { Q: [1, 3], eps0: [0.5, 2], a: [0.3, 0.6], b: [1, 2], chi: [0.5, 3] } },
            ],
            sol: md`
              (a) $P_r = \dfrac{\chi_e}{1+\chi_e}\dfrac{Q}{4\pi r^2}$, and $\sigma_b(a) = -P_r(a) = -\dfrac{\chi_eQ}{(1+\chi_e)4\pi a^2}$. Negative, hugging $+Q$.

              (b) $V(a) = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac1b + \dfrac{1}{1+\chi_e}\left(\dfrac1a - \dfrac1b\right)\right]$. Come in from infinity: vacuum part to $b$, then the dielectric part, weaker by $\varepsilon_r$.
            `,
          }),
        ],
      },

      // ------------------------------------------------------------------ boundary conditions + Laplace with dielectrics
      {
        id: 'e2-dielbc', title: 'Boundary conditions with dielectrics; the sphere in a uniform field',
        steps: [
          R(md`
            At an interface between two linear dielectrics:

            $$D^\perp_{\text{above}} - D^\perp_{\text{below}} = \sigma_f,\qquad \vb E^\parallel_{\text{above}} = \vb E^\parallel_{\text{below}},\qquad V\text{ continuous}.$$

            In potentials, with no free charge on the interface (the usual case):

            $$\varepsilon_{\text{above}}\frac{\partial V_{\text{above}}}{\partial n} = \varepsilon_{\text{below}}\frac{\partial V_{\text{below}}}{\partial n}.$$

            This is the **only** change from Exam I's separation of variables: the derivative condition picks up the $\varepsilon$'s.

            !!intuition Field lines bend away from the normal entering a high-$\varepsilon$ material
                $E_\parallel$ is shared, but $E_\perp$ drops by $\varepsilon_1/\varepsilon_2$ going into the denser medium. Result: $\dfrac{\tan\theta_1}{\tan\theta_2} = \dfrac{\varepsilon_1}{\varepsilon_2}$, angles from the normal. The field inside a dielectric is always weaker and leans more along the surface.

            ### Dielectric sphere in a uniform field (Lectures 18–19)

            Guess $V_{\text{in}} = Ar\cos\theta$ and $V_{\text{out}} = -E_0r\cos\theta + \dfrac{B\cos\theta}{r^2}$ (only $\ell = 1$ survives, because $E_0r\cos\theta$ is pure $P_1$). Matching $V$ and $\varepsilon\,\partial_rV$ at $R$:

            $$\vb E_{\text{in}} = \frac{3}{\varepsilon_r + 2}\vb E_0 \quad(\text{uniform}),\qquad \vb P = 3\varepsilon_0\frac{\varepsilon_r - 1}{\varepsilon_r + 2}\vb E_0,\qquad B = \frac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0R^3.$$

            !!method Speed trick: the same depolarizing factor $N$
                For any of the standard shapes in a uniform $\vb E_0$: $\boxed{E_{\text{in}} = \dfrac{E_0}{1 + N\chi_e}}$. Slab ⊥ field ($N = 1$): $E_0/\varepsilon_r$. Sphere ($N = \tfrac13$): $\dfrac{3E_0}{\varepsilon_r + 2}$. Long cylinder ⊥ field ($N = \tfrac12$): $\dfrac{2E_0}{\varepsilon_r + 1}$. Slab or needle along the field ($N = 0$): $E_0$. If a problem asks for one of these, write it down in 10 seconds and move on.

            !!method Speed trick: limit checks catch every algebra slip
                $\varepsilon_r\to1$ must give back the empty field. $\varepsilon_r\to\infty$ must look like a **conductor** ($\vb E_{\text{in}} = 0$, $B = E_0R^3$). Check both before you box anything.

            **HW 4.24** (uncharged conducting sphere $a$, coated with $\varepsilon_r$ out to $b$, in $\vb E_0$). In the shell $V = A\left(r - \dfrac{a^3}{r^2}\right)\cos\theta$ (zero on the conductor), outside $V = -E_0r\cos\theta + \dfrac{C\cos\theta}{r^2}$. Matching at $b$ gives

            $$A = -\frac{3E_0}{(\varepsilon_r + 2) + 2(\varepsilon_r - 1)(a/b)^3},\qquad \vb E = -A\left[\left(1 + \frac{2a^3}{r^3}\right)\cos\theta\,\uv r - \left(1 - \frac{a^3}{r^3}\right)\sin\theta\,\hat{\boldsymbol\theta}\right].$$

            Checks: $a\to0$ gives the dielectric sphere ✓; $\varepsilon_r = 1$ gives the bare conducting sphere ($A = -E_0$) ✓; $\varepsilon_r\to\infty$ gives $\vb E\to0$ in the coating, so it acts like a bigger conductor ✓.
          `),
          Q(md`A dielectric sphere ($\varepsilon_r = 4$) sits in a uniform field $E_0$. The field inside is`,
            [md`$E_0/2$, uniform`, md`$E_0/4$, uniform`, md`$E_0$`, md`$0$`], 0,
            [null, md`$E_0/\varepsilon_r$ is the slab perpendicular to the field. The sphere gets $3/(\varepsilon_r + 2) = 1/2$.`, md`The sphere's bound charge partly cancels $E_0$ inside.`, md`Only a conductor ($\varepsilon_r\to\infty$) zeroes the inside.`],
            md`$3E_0/(\varepsilon_r + 2) = 3E_0/6 = E_0/2$.`),
          Q(md`A field line in vacuum hits a flat dielectric ($\varepsilon_r = 3$) at 45° from the normal. Inside, its angle from the normal is`,
            [md`$\arctan 3\approx 72°$, bent toward the surface`, md`$\arctan(1/3)\approx18°$, bent toward the normal`, md`45°, unchanged`, md`90°: it runs along the surface`], 0,
            [null, md`That's the optics instinct (light bends toward the normal). Static field lines do the opposite: $E_\perp$ shrinks, $E_\parallel$ stays.`, md`Only if $\varepsilon_1 = \varepsilon_2$.`, md`Only for $\varepsilon_r\to\infty$.`],
            md`$\tan\theta_2 = \tan\theta_1\cdot\varepsilon_2/\varepsilon_1 = 3$, so $\theta_2\approx71.6°$. $E_\parallel$ is shared, $E_\perp$ drops by 3.`),
          Q(md`A long dielectric cylinder ($\varepsilon_r$) lies with its axis **perpendicular** to a uniform $\vb E_0$. The field inside is`,
            [md`$2E_0/(\varepsilon_r + 1)$`, md`$3E_0/(\varepsilon_r + 2)$`, md`$E_0/\varepsilon_r$`, md`$E_0$`], 0,
            [null, md`That's the sphere ($N = \tfrac13$).`, md`That's the slab ($N = 1$).`, md`That's the cylinder **along** the field ($N = 0$).`],
            md`$N = \tfrac12$: $E_0/(1 + \chi_e/2) = 2E_0/(2 + \chi_e) = 2E_0/(\varepsilon_r + 1)$.`),
          P({
            id: 'e2-dielbc-p1', title: 'Sphere in a field: the polarization and the outside dipole',
            q: md`A dielectric sphere of radius $R$ and constant $\varepsilon_r$ sits in $\vb E_0 = E_0\hat{\mathbf z}$. Find (a) $P$ inside, (b) the dipole moment $p$ of the sphere, (c) the bound surface charge $\sigma_b$ at the north pole ($\theta = 0$).`,
            hints: [md`$E_{\text{in}} = 3E_0/(\varepsilon_r + 2)$ and $P = \varepsilon_0(\varepsilon_r - 1)E_{\text{in}}$.`, md`$p = \frac43\pi R^3P$, and $\sigma_b = P\cos\theta$.`],
            parts: [
              { lbl: md`(a) $P$`, expr: '3*eps0*(epsr-1)*E0/(epsr+2)', vars: { eps0: [0.5, 2], epsr: [1.5, 5], E0: [1, 3] } },
              { lbl: md`(b) $p$`, expr: '4*pi*eps0*R^3*(epsr-1)*E0/(epsr+2)', vars: { eps0: [0.5, 2], epsr: [1.5, 5], E0: [1, 3], R: [0.5, 2] } },
              { lbl: md`(c) $\sigma_b(\theta = 0)$`, expr: '3*eps0*(epsr-1)*E0/(epsr+2)', vars: { eps0: [0.5, 2], epsr: [1.5, 5], E0: [1, 3] } },
            ],
            sol: md`
              (a) $P = \varepsilon_0\chi_eE_{\text{in}} = 3\varepsilon_0\dfrac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0$.

              (b) $p = \frac43\pi R^3P = 4\pi\varepsilon_0R^3\dfrac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0$. Matches $V_{\text{out}}$'s $\dfrac{B\cos\theta}{r^2} = \dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$ with $B = \dfrac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0R^3$ ✓. As $\varepsilon_r\to\infty$, $p\to4\pi\varepsilon_0R^3E_0$, the conducting sphere's induced dipole ✓.

              (c) $\sigma_b = P\cos0 = P$.
            `,
          }),
          P({
            id: 'e2-dielbc-p2', title: 'HW 4.24: coated conductor in a uniform field',
            q: md`An uncharged conducting sphere (radius $a$) is coated with dielectric $\varepsilon_r$ out to radius $b$ and placed in a uniform $\vb E_0$. In the coating, $V = A\left(r - a^3/r^2\right)\cos\theta$. Find $A$. Then, which limit check does **not** hold?`,
            hints: [md`Outside: $V = -E_0r\cos\theta + C\cos\theta/r^2$. Two conditions at $r = b$: $V$ continuous and $\varepsilon_r\partial_rV_{\text{in}} = \partial_rV_{\text{out}}$.`, md`Eliminate $C$ using the continuity equation.`],
            parts: [
              { lbl: md`$A$`, expr: '-3*E0/((epsr+2) + 2*(epsr-1)*a^3/b^3)', vars: { E0: [1, 3], epsr: [1.5, 5], a: [0.3, 0.7], b: [1, 2] } },
              { lbl: md`Which check fails?`, mc: [md`None; all of these hold`, md`$a\to0$ gives $E_{\text{in}} = 3E_0/(\varepsilon_r + 2)$`, md`$\varepsilon_r = 1$ gives $A = -E_0$`, md`$b\to a$ gives $E_r(a) = 3E_0\cos\theta/\varepsilon_r$`], a: 0,
                why: [null, md`It holds: the conductor disappears.`, md`It holds: the bare conducting sphere.`, md`It holds: $D_r = \varepsilon_0\varepsilon_rE_r = 3\varepsilon_0E_0\cos\theta$, the conductor's usual surface charge.`] },
            ],
            sol: md`
              Continuity at $b$: $A(b - a^3/b^2) = -E_0b + C/b^2$, so $\dfrac{2C}{b^3} = 2A(1 - a^3/b^3) + 2E_0$.

              Derivative: $\varepsilon_rA(1 + 2a^3/b^3) = -E_0 - \dfrac{2C}{b^3} = -3E_0 - 2A(1 - a^3/b^3)$.

              Collect: $A\left[(\varepsilon_r + 2) + 2(\varepsilon_r - 1)\dfrac{a^3}{b^3}\right] = -3E_0$.

              All three limits hold, which is how you know the algebra is right. **On the exam, if you are short on time,** write the setup (the two forms of $V$ and the two matching conditions) and the limits: that is most of the credit.
            `,
          }),
        ],
      },

      // ------------------------------------------------------------------ energy
      {
        id: 'e2-energy', title: 'Energy in dielectrics and the force on a dielectric',
        steps: [
          R(md`
            With dielectrics present, the work **you** do bringing in the free charge is

            $$\boxed{W = \frac12\int\vb D\cdot\vb E\,d\tau}\quad\text{(linear media)},\qquad\text{not }\frac{\varepsilon_0}{2}\int E^2\,d\tau.$$

            $\frac{\varepsilon_0}{2}\int E^2$ counts assembling every charge, bound ones included. $\frac12\int\vb D\cdot\vb E$ also pays for stretching the molecules, which is what you actually spend. Lecture 19 calls this "the energy we usually mean".

            !!trap What is held fixed?
                Fill a capacitor with dielectric. **Fixed $Q$** (isolated): $D$ unchanged, $E$ drops by $\varepsilon_r$, so $W\to W/\varepsilon_r$. **Fixed $V$** (battery attached): $E$ unchanged, $D$ grows by $\varepsilon_r$, so $W\to\varepsilon_rW$. Always ask which one before you answer.

            **HW 4.26** (conductor $Q$, radius $a$, dielectric $\chi_e$ out to $b$):

            $$W = \frac12\int\frac{D^2}{\varepsilon}d\tau = \frac{Q^2}{8\pi\varepsilon_0}\left[\frac{1}{\varepsilon_r}\left(\frac1a - \frac1b\right) + \frac1b\right] = \frac{Q^2}{8\pi\varepsilon_0(1+\chi_e)}\left(\frac1a + \frac{\chi_e}{b}\right).$$

            !!method Speed trick: $W = \tfrac12QV$ is faster than the integral
                You already found $V(a)$ in the linear-dielectric lesson. $W = \tfrac12QV(a)$ gives the same answer with no integral. Use the integral only when they insist on "use Eq. 4.58".

            ### Force on a dielectric (Griffiths 4.4.4)

            A slab partly inserted into a capacitor gets **sucked in** by the fringing field. Don't compute fringing; use energy:

            $$F = +\frac12V^2\frac{dC}{dx}\ \ (\text{fixed }V),\qquad F = -\frac{dW}{dx} = \frac{Q^2}{2C^2}\frac{dC}{dx}\ \ (\text{fixed }Q).$$

            Both are the **same** number (Griffiths shows the battery's work accounts for the sign difference). For plates of width $w$, gap $d$, slab inserted a length $x$: $C = \dfrac{\varepsilon_0w}{d}(\ell + \chi_ex)$, so $F = \dfrac{\varepsilon_0\chi_ewV^2}{2d}$, pulling in.

            !!trap The battery sign trap
                At fixed $V$, $W$ goes **up** as the slab enters, yet the slab is pulled **in**. $F = -dW/dx$ is wrong here because the battery also does work ($V\,dQ = 2\,dW$). Use $F = +\tfrac12V^2\,dC/dx$, or just remember: things always move to **raise $C$**.
          `),
          Q(md`An isolated charged capacitor (battery disconnected) is filled with dielectric $\varepsilon_r$. The stored energy`,
            [md`drops by a factor $\varepsilon_r$`, md`grows by a factor $\varepsilon_r$`, md`is unchanged`, md`drops by $\varepsilon_r^2$`], 0,
            [null, md`That is the fixed-$V$ case.`, md`$Q$ is fixed and $C$ grows, so $Q^2/2C$ drops.`, md`$W = \tfrac12\int DE$; $D$ stays and $E$ drops by $\varepsilon_r$, so $W$ drops by $\varepsilon_r$, not $\varepsilon_r^2$.`],
            md`$W = Q^2/2C$ with $C\to\varepsilon_rC$. The missing energy went into pulling the dielectric in (it does work on whatever holds it).`),
          Q(md`Which expression gives the work needed to assemble the free charge in a system with linear dielectrics?`,
            [md`$\frac12\int\vb D\cdot\vb E\,d\tau$`, md`$\frac{\varepsilon_0}2\int E^2\,d\tau$`, md`$\frac12\int\vb P\cdot\vb E\,d\tau$`, md`$\frac{1}{2\varepsilon_0}\int D^2\,d\tau$`], 0,
            [null, md`That counts only the electrostatic energy of all the charges (free and bound), not the energy stored in stretched molecules.`, md`That's just the polarization part.`, md`$D^2/2\varepsilon_0$ would be right only in vacuum; in the material it's $D^2/2\varepsilon$.`],
            md`$W = \tfrac12\int\vb D\cdot\vb E$ includes the "spring" energy in the polarized molecules: the work you actually do.`),
          P({
            id: 'e2-energy-p1', title: 'HW 4.26: energy of a coated conductor',
            q: md`Conductor radius $a$, charge $Q$, surrounded by dielectric $\chi_e$ out to $b$. Find the energy.`,
            hints: [md`$W = \tfrac12QV(a)$ is fastest.`],
            parts: [{ lbl: md`$W$`, expr: 'Q^2/(8*pi*eps0*(1+chi))*(1/a + chi/b)', vars: { Q: [1, 3], eps0: [0.5, 2], chi: [0.5, 3], a: [0.3, 0.6], b: [1, 2] }, accepts: ['Q^2/(8*pi*eps0)*((1/a-1/b)/(1+chi) + 1/b)'] }],
            sol: md`
              $V(a) = \dfrac{Q}{4\pi\varepsilon_0}\left[\dfrac1b + \dfrac{1}{1+\chi_e}\left(\dfrac1a - \dfrac1b\right)\right]$, so $W = \tfrac12QV(a) = \dfrac{Q^2}{8\pi\varepsilon_0(1+\chi_e)}\left(\dfrac1a + \dfrac{\chi_e}{b}\right)$.

              **Checks:** $\chi_e = 0$ gives $Q^2/8\pi\varepsilon_0a$ ✓. $b\to\infty$ gives $Q^2/(8\pi\varepsilon a)$ ✓.
            `,
          }),
          P({
            id: 'e2-energy-p2', title: 'The slab sucked into a capacitor',
            q: md`Square plates side $\ell$, gap $d$, held at voltage $V$. A dielectric slab ($\chi_e$, thickness $d$, width $\ell$) is inserted a distance $x$. Find (a) $C(x)$, (b) the force on the slab.`,
            hints: [md`Two capacitors in parallel: filled width $x$, empty width $\ell - x$.`],
            parts: [
              { lbl: md`(a) $C(x)$`, expr: 'eps0*l*(l + chi*x)/d', vars: { eps0: [0.5, 2], l: [1, 2], chi: [0.5, 3], x: [0.2, 0.8], d: [0.1, 0.3] } },
              { lbl: md`(b) $F$ (positive = pulled in)`, expr: 'eps0*chi*l*V^2/(2*d)', vars: { eps0: [0.5, 2], chi: [0.5, 3], l: [1, 2], V: [1, 3], d: [0.1, 0.3] } },
            ],
            sol: md`
              (a) $C = \dfrac{\varepsilon_0\varepsilon_r\ell x}{d} + \dfrac{\varepsilon_0\ell(\ell - x)}{d} = \dfrac{\varepsilon_0\ell}{d}(\ell + \chi_ex)$.

              (b) $F = \tfrac12V^2\dfrac{dC}{dx} = \dfrac{\varepsilon_0\chi_e\ell V^2}{2d}$, independent of $x$. Pulled in, because that raises $C$.
            `,
          }),
        ],
      },
    ],
  });
})();

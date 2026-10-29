/* Hour Exam II, part 2: magnetostatics (Lectures 20–24, Griffiths 5.1–5.4, HW 7–9, Discussions 6–7).
   Registers a holding unit; zz-scope.js places each lesson on the Exam II study path. */
(function () {
  'use strict';
  const { R, P, Q } = C;

  C.unit({
    id: 'h-e2-mag', num: '', title: 'Exam II: magnetostatics (holding)',
    lessons: [
      // ------------------------------------------------------------------ currents and forces
      {
        id: 'e2-currents', title: 'Currents, spinning charge, and the force on a current',
        steps: [
          R(md`
            Moving charge density × velocity = current density. One rule, three dimensions:

            | Charge | Current | Units |
            |---|---|---|
            | line $\lambda$ | $\vb I = \lambda\vb v$ | A |
            | sheet $\sigma$ | $\vb K = \sigma\vb v$ (current per **width**) | A/m |
            | volume $\rho$ | $\vb J = \rho\vb v$ (current per **area**) | A/m² |

            **Spinning things** ($\vb v = \boldsymbol\omega\times\vb r$, speed $\omega\times$(distance from the axis)):

            - Disk (HW 5.6a): $\vb K = \sigma\omega s\,\hat{\boldsymbol\phi}$.
            - Spherical shell: $\vb K = \sigma\omega R\sin\theta\,\hat{\boldsymbol\phi}$. Largest at the equator, zero at the poles.
            - Solid sphere (HW 5.6b): $\vb J = \rho\omega r\sin\theta\,\hat{\boldsymbol\phi}$ with $\rho = \dfrac{3Q}{4\pi R^3}$.

            !!trap $r\sin\theta$, not $r$
                The speed is set by the distance **from the axis** ($s = r\sin\theta$), not from the center. Forgetting $\sin\theta$ is the #1 slip on spinning-sphere problems.

            **Continuity:** $\nabla\cdot\vb J = -\partial\rho/\partial t$. Magnetostatics means steady currents, $\nabla\cdot\vb J = 0$.

            **Force on a current:** $\vb F = \int I\,d\vb l\times\vb B = \int\vb K\times\vb B\,da = \int\vb J\times\vb B\,d\tau$.

            !!method Speed trick: closed loop in a uniform $\vb B$ feels no net force
                $\oint I\,d\vb l\times\vb B = I\left(\oint d\vb l\right)\times\vb B = 0$. A net force needs a **nonuniform** $\vb B$. Only the torque survives: $\vb N = \vb m\times\vb B$.

            **Discussion 5.4** ($\vb B = kz\,\hat{\mathbf x}$, square loop side $a$ in the $yz$ plane, centered at the origin). The two vertical sides see $B$ that is odd in $z$, so their forces cancel. The top side ($z = a/2$) and bottom side ($z = -a/2$) carry opposite currents in opposite $\vb B$, so their forces **add**: $\vb F = Ika^2\,\hat{\mathbf z}$. Same direction twice is the giveaway that the gradient is doing the work.

            **Parallel wires:** force per length $f = \dfrac{\mu_0I_1I_2}{2\pi d}$. Same direction **attracts**, opposite repels. (Opposite of charges. Same as dipoles head to tail.)

            **HW 5.10a** (square loop side $a$, near side at distance $s$ from a long wire, both carry $I$ with the near side parallel to the wire's current): the two sides perpendicular to the wire cancel; the near side is attracted more than the far side is repelled:

            $$F = \frac{\mu_0I^2a}{2\pi}\left(\frac1s - \frac1{s+a}\right) = \frac{\mu_0I^2a^2}{2\pi s(s + a)},\quad\text{toward the wire.}$$
          `),
          Q(md`A rigid circular loop carrying $I$ sits in a **uniform** $\vb B$ at some tilt. The net force is`,
            [md`zero, but there can be a torque`, md`$I\pi R^2B$ along $\vb B$`, md`$2\pi RIB$ toward the center`, md`zero, and the torque is zero too`], 0,
            [null, md`$I\pi R^2$ is $m$; $mB$ is a torque magnitude, not a force.`, md`Each element is pulled outward or inward (hoop stress), but the vector sum is zero.`, md`$\vb N = \vb m\times\vb B\ne0$ unless $\vb m\parallel\vb B$.`],
            md`$\oint d\vb l = 0$, so $\vb F = 0$ in any uniform field. Torque $\vb m\times\vb B$ remains.`),
          Q(md`A uniformly charged shell (charge $Q$, radius $R$) spins at $\omega$. What is $K$ at polar angle $\theta$?`,
            [md`$\dfrac{Q\omega\sin\theta}{4\pi R}$`, md`$\dfrac{Q\omega}{4\pi R}$`, md`$\dfrac{Q\omega R\sin\theta}{4\pi}$`, md`$\dfrac{Q\omega\sin\theta}{4\pi R^2}$`], 0,
            [null, md`Missing $\sin\theta$: the speed is $\omega R\sin\theta$.`, md`Units: $K$ is A/m. $Q\omega R$ is C·m/s = A·m. Divide by area, $\sigma = Q/4\pi R^2$.`, md`One too many powers of $R$: $\sigma\omega R\sin\theta = \dfrac{Q}{4\pi R^2}\omega R\sin\theta$.`],
            md`$K = \sigma v = \dfrac{Q}{4\pi R^2}\cdot\omega R\sin\theta = \dfrac{Q\omega\sin\theta}{4\pi R}$.`),
          Q(md`Two long parallel wires carry currents in **opposite** directions. They`,
            [md`repel`, md`attract`, md`feel no force (net current is zero)`, md`twist about each other`], 0,
            [null, md`Like currents attract. Opposite currents repel.`, md`Each wire feels the other's field; net current does not enter.`, md`Straight wires have no torque about each other.`],
            md`Wire 1's $\vb B$ at wire 2, crossed with wire 2's opposite current, points away from wire 1.`),
          P({
            id: 'e2-cur-p1', title: 'HW 5.10a: a square loop next to a wire',
            q: md`A long wire carries $I$. A square loop (side $a$, current $I$) lies in the same plane with its near side a distance $s$ from the wire, current in that side parallel to the wire's. Find the magnitude of the net force.`,
            hints: [md`Only the two sides parallel to the wire matter.`],
            parts: [
              { lbl: md`$F$`, expr: 'mu0*I^2*a^2/(2*pi*s*(s+a))', vars: { mu0: [0.5, 2], I: [1, 3], a: [0.5, 2], s: [0.5, 2] } },
              { lbl: md`Direction`, mc: [md`Toward the wire`, md`Away from the wire`, md`Parallel to the wire`, md`Zero`], a: 0,
                why: [null, md`The near side (parallel current, attracted) feels a stronger field than the far side (antiparallel, repelled).`, md`The forces on the parallel sides are perpendicular to the wire.`, md`$B$ differs at the two sides.`] },
            ],
            sol: md`$F = \dfrac{\mu_0I\cdot Ia}{2\pi s} - \dfrac{\mu_0I\cdot Ia}{2\pi(s + a)} = \dfrac{\mu_0I^2a^2}{2\pi s(s+a)}$, attractive.`,
          }),
          P({
            id: 'e2-cur-p2', title: 'Discussion 5.4: loop in B = kz x̂',
            q: md`$\vb B = kz\,\hat{\mathbf x}$. A square loop (side $a$) lies in the $yz$ plane, centered at the origin, current $I$ counterclockwise seen from $+x$. Find $F_z$.`,
            hints: [md`Seen from $+x$ with $z$ up, $+y$ points to the right. Counterclockwise: the top side runs toward $-y$.`, md`Top: $\vb F = Ia(-\hat{\mathbf y})\times(ka/2)\hat{\mathbf x}$.`],
            parts: [{ lbl: md`$F_z$`, expr: 'I*k*a^2', vars: { I: [1, 3], k: [1, 3], a: [0.5, 2] } }],
            sol: md`
              Top: $Ia(-\hat{\mathbf y})\times\tfrac{ka}{2}\hat{\mathbf x} = \tfrac{Ika^2}{2}\hat{\mathbf z}$. Bottom: $Ia\hat{\mathbf y}\times(-\tfrac{ka}{2})\hat{\mathbf x} = \tfrac{Ika^2}{2}\hat{\mathbf z}$. Sides: $\int z\,dz$ over a symmetric range is $0$. Total $\vb F = Ika^2\hat{\mathbf z}$.

              **Quick check:** $\vb F = \nabla(\vb m\cdot\vb B)$ with $\vb m = Ia^2\hat{\mathbf x}$ gives $\nabla(Ia^2kz) = Ika^2\hat{\mathbf z}$ ✓. For a small loop that's a 5-second solution.
            `,
          }),
        ],
      },

      // ------------------------------------------------------------------ Biot–Savart
      {
        id: 'e2-bs', title: 'Biot–Savart: the five results that solve everything',
        steps: [
          R(md`
            $$\vb B(\vb r) = \frac{\mu_0}{4\pi}\int\frac{I\,d\vb l\times\uv{\srm}}{\srm^2}$$

            Exam problems are almost never "integrate this from scratch". They are **a wire bent into pieces**, and every piece is one of these:

            | Piece | $B$ at the point | Notes |
            |---|---|---|
            | Straight segment, perpendicular distance $s$ | $\dfrac{\mu_0I}{4\pi s}(\sin\theta_2 - \sin\theta_1)$ | $\theta$ measured from the perpendicular foot |
            | Infinite wire | $\dfrac{\mu_0I}{2\pi s}$ | $\theta = \pm90°$ |
            | Semi-infinite wire, point beside its end | $\dfrac{\mu_0I}{4\pi s}$ | half the infinite wire |
            | Point on the line of a straight piece | $0$ | $d\vb l\parallel\uv{\srm}$ |
            | Arc of angle $\phi$, at its center | $\dfrac{\mu_0I\phi}{4\pi R}$ | full loop $\dfrac{\mu_0I}{2R}$, half $\dfrac{\mu_0I}{4R}$ |
            | Loop on its axis | $\dfrac{\mu_0IR^2}{2(R^2+z^2)^{3/2}}$ | $\to\dfrac{\mu_0IR^2}{2z^3} = \dfrac{\mu_0}{4\pi}\dfrac{2m}{z^3}$ far away |

            !!method The recipe for bent-wire problems (2 minutes, not 10)
                1. Chop the wire into straight pieces and arcs.
                2. Cross off every piece whose line passes **through** the point (it gives 0).
                3. Write each surviving piece from the table. Direction by the right-hand rule on each piece.
                4. Add with signs. Done. No integrals.

            !!intuition Why the arc formula is so simple
                Every $d\vb l$ on an arc is perpendicular to the radius and at the same distance $R$. So $dB = \dfrac{\mu_0I\,dl}{4\pi R^2}$, all pointing the same way, and $\int dl = R\phi$.

            **HW 5.8 (square and $n$-gon).** Each side is a segment at distance $R$ with $\theta = \pm\pi/n$: $B_{\text{side}} = \dfrac{\mu_0I}{4\pi R}\cdot2\sin\dfrac\pi n$. Total

            $$B = \frac{n\mu_0I}{2\pi R}\sin\frac{\pi}{n}\quad\xrightarrow{n = 4}\quad\frac{\sqrt2\,\mu_0I}{\pi R}\quad\xrightarrow{n\to\infty}\quad\frac{\mu_0I}{2R}\ ✓$$

            **Discussion 5.11 (finite solenoid on its axis).** Stack loops: $B = \dfrac{\mu_0nI}{2}(\cos\theta_2 - \cos\theta_1)$, angles from the axis to the two ends' rims. Infinite: $\mu_0nI$. **At the end of a semi-infinite solenoid: $\mu_0nI/2$** (half, by superposition: two half-solenoids make a whole one).

            !!method Speed trick: the half-trick works everywhere
                Semi-infinite wire beside its end = half the infinite wire. End of a semi-infinite solenoid = half the infinite solenoid. Same reasoning: two copies glue into the infinite case, and by symmetry each contributes half.
          `),
          Q(md`A straight segment runs from $(0,0,0)$ to $(L,0,0)$. What does it contribute to $\vb B$ at $(2L, 0, 0)$?`,
            [md`Nothing: the point is on the segment's line`, md`$\dfrac{\mu_0I}{4\pi L}$`, md`$\dfrac{\mu_0I}{2\pi L}$`, md`It depends on the rest of the circuit`], 0,
            [null, md`$d\vb l\parallel\uv{\srm}$ for every element, so $d\vb l\times\uv{\srm} = 0$.`, md`Same: the cross product vanishes.`, md`Superposition: each piece contributes on its own; the rest of the circuit adds its own part.`],
            md`Every $d\vb l$ points along the line to the field point, so the cross product is zero. Step 2 of the recipe: cross these pieces off first.`),
          Q(md`A hairpin: two long parallel wires distance $2R$ apart joined by a semicircle of radius $R$. Current $I$ flows in one wire, around, and out the other. $B$ at the center of the semicircle is`,
            [md`$\dfrac{\mu_0I}{4R} + \dfrac{\mu_0I}{2\pi R}$`, md`$\dfrac{\mu_0I}{4R}$`, md`$\dfrac{\mu_0I}{4R} + \dfrac{\mu_0I}{\pi R}$`, md`$\dfrac{\mu_0I}{2R} + \dfrac{\mu_0I}{2\pi R}$`], 0,
            [null, md`The straight wires don't pass through the center; each gives $\mu_0I/4\pi R$ in the same direction as the arc.`, md`Each straight wire is **semi**-infinite (ends beside the point): $\mu_0I/4\pi R$, not $\mu_0I/2\pi R$.`, md`The arc is a half circle: $\mu_0I/4R$.`],
            md`Semicircle $\dfrac{\mu_0I}{4R}$ plus two semi-infinite wires, each $\dfrac{\mu_0I}{4\pi R}$, all along the same direction by the right-hand rule: $\dfrac{\mu_0I}{4R} + \dfrac{\mu_0I}{2\pi R}$.`),
          Q(md`Far from a loop on its axis, $B\to\dfrac{\mu_0IR^2}{2z^3}$. This is`,
            [md`the dipole field on axis, $\dfrac{\mu_0}{4\pi}\dfrac{2m}{z^3}$ with $m = I\pi R^2$`, md`a monopole field`, md`a quadrupole field`, md`only true for square loops`], 0,
            [null, md`There are no magnetic monopoles; the lowest term is the dipole.`, md`It falls as $1/z^3$, which is the dipole field (dipole potential $1/r^2$, field $1/r^3$).`, md`Any small loop is a dipole far away.`],
            md`$\dfrac{\mu_0}{4\pi}\dfrac{2\pi R^2I}{z^3} = \dfrac{\mu_0IR^2}{2z^3}$ ✓. HW 5.37c is this check.`),
          Q(md`A square loop with center-to-side distance $R$ carries $I$. At its center, $B$ compared to a circular loop of radius $R$ is`,
            [md`smaller, about $0.90\times$`, md`larger, about $1.11\times$`, md`exactly equal`, md`smaller, about $0.64\times$`], 0,
            [null, md`The square's corners stick out beyond $R$, so they contribute less than a circle's arc would.`, md`The shapes differ: the square's corners are farther away.`, md`$2/\pi\approx0.64$ isn't the ratio: $\dfrac{\sqrt2/\pi}{1/2} = \dfrac{2\sqrt2}{\pi}\approx0.90$.`],
            md`Square: $\dfrac{\sqrt2\,\mu_0I}{\pi R}\approx0.450\,\dfrac{\mu_0I}{R}$. Circle: $0.500\,\dfrac{\mu_0I}{R}$. Ratio $2\sqrt2/\pi\approx0.90$. A quick sanity check on your $n$-gon formula.`),
          P({
            id: 'e2-bs-p1', title: 'HW 5.8: the n-gon',
            q: md`A regular $n$-sided polygon carries current $I$; the distance from its center to each side is $R$. Find $B$ at the center.`,
            hints: [md`Each side subtends $\theta$ from $-\pi/n$ to $+\pi/n$ at the center.`],
            parts: [{ lbl: md`$B$`, expr: 'n*mu0*I*sin(pi/n)/(2*pi*R)', vars: { n: [3, 8], mu0: [0.5, 2], I: [1, 3], R: [0.5, 2] } }],
            sol: md`Per side $\dfrac{\mu_0I}{4\pi R}\left[\sin\tfrac\pi n - \sin(-\tfrac\pi n)\right] = \dfrac{\mu_0I\sin(\pi/n)}{2\pi R}$. Times $n$. Check $n\to\infty$: $n\sin(\pi/n)\to\pi$, giving $\mu_0I/2R$ ✓.`,
          }),
          P({
            id: 'e2-bs-p3', title: 'Corner wire: field at (0, a, 0) and (a, 0, 0)',
            q: md`A long wire runs along the $x$ axis from $x = -\infty$ to the origin, then turns and runs up the $y$ axis to $y = +\infty$. Current $I$ flows in that order. Find $B_z$ at (a) $(a, 0, 0)$ and (b) $(0, -a, 0)$.`,
            hints: [md`$(a, 0, 0)$ is on the line of the first leg (gives 0) and beside the start of the second leg.`, md`$(0, -a, 0)$ is on the line of the second leg (gives 0) and beside the end of the first leg, on its $-y$ side.`, md`Right-hand rule: thumb along the current; fingers give $\vb B$.`],
            parts: [
              { lbl: md`(a) $B_z$ at $(a, 0, 0)$`, expr: '-mu0*I/(4*pi*a)', vars: { mu0: [0.5, 2], I: [1, 3], a: [0.5, 2] } },
              { lbl: md`(b) $B_z$ at $(0, -a, 0)$`, expr: '-mu0*I/(4*pi*a)', vars: { mu0: [0.5, 2], I: [1, 3], a: [0.5, 2] } },
            ],
            sol: md`
              (a) First leg: the point lies on its line, 0. Second leg (current $+\hat{\mathbf y}$, starting at the origin): the point is beside its start, distance $a$, on the $+x$ side. Thumb up $+y$: on the $+x$ side the field points into the page, $-\hat{\mathbf z}$. Semi-infinite: $B_z = -\dfrac{\mu_0I}{4\pi a}$.

              (b) Second leg: on its line, 0. First leg (current $+\hat{\mathbf x}$, ending at the origin): the point is beside its end, on the $-y$ side. Thumb along $+x$: on the $-y$ side the field points into the page, $-\hat{\mathbf z}$. $B_z = -\dfrac{\mu_0I}{4\pi a}$.

              **The trick:** each answer took one line because a point on a wire's line kills that leg, and "beside the end" is always half the infinite wire.
            `,
          }),
          P({
            id: 'e2-bs-p4', title: 'Discussion 5.11: end of a solenoid',
            q: md`A long solenoid ($n$ turns per length, current $I$) runs from $z = 0$ to $z = \infty$. Find $B$ on the axis (a) at $z = 0$, (b) deep inside.`,
            hints: [md`$B = \frac{\mu_0nI}{2}(\cos\theta_2 - \cos\theta_1)$; or use the half-trick.`],
            parts: [
              { lbl: md`(a) $B(0)$`, expr: 'mu0*n*I/2', vars: { mu0: [0.5, 2], n: [1, 5], I: [1, 3] } },
              { lbl: md`(b) deep inside`, expr: 'mu0*n*I', vars: { mu0: [0.5, 2], n: [1, 5], I: [1, 3] } },
            ],
            sol: md`Two semi-infinite solenoids glued at $z = 0$ make an infinite one with $B = \mu_0nI$; by symmetry each supplies half. So $\mu_0nI/2$ at the mouth and $\mu_0nI$ deep inside.`,
          }),
        ],
      },

      // ------------------------------------------------------------------ Ampère
      {
        id: 'e2-ampere', title: 'Ampère\'s law: the four symmetric setups',
        steps: [
          R(md`
            $$\oint\vb B\cdot d\vb l = \mu_0I_{\text{enc}},\qquad\nabla\times\vb B = \mu_0\vb J,\qquad\nabla\cdot\vb B = 0.$$

            Like Gauss, Ampère only gives $B$ when symmetry says $B$ is constant along your loop. There are exactly four shapes where it works, and every exam Ampère problem is one of them or a superposition of them.

            | Setup | Loop | Answer |
            |---|---|---|
            | **Line** (wire, cylinder, coax) | circle radius $s$ | $B\cdot2\pi s = \mu_0I_{\text{enc}}$, $\vb B\parallel\hat{\boldsymbol\phi}$ |
            | **Plane** (sheet, slab) | rectangle straddling it | sheet: $B = \tfrac{\mu_0K}{2}$, direction $\vb K\times\uv n$ |
            | **Solenoid** | rectangle, one side inside | $B = \mu_0nI$ inside, $0$ outside |
            | **Toroid** | circle inside the donut | $B = \dfrac{\mu_0NI}{2\pi s}$ inside, $0$ outside |

            !!intuition The sheet result is "half up, half down"
                A sheet of current makes $\vb B$ parallel to the sheet and perpendicular to $\vb K$, pointing **opposite ways** on the two sides, with the same magnitude $\mu_0K/2$ on each. The jump across it is $\mu_0K$. Two opposite sheets (a parallel-plate capacitor in motion, a flat solenoid): fields **add** between, **cancel** outside, giving $\mu_0K$ inside and $0$ outside.

            ### The setups you've seen

            - **Uniform wire** radius $a$: $B = \dfrac{\mu_0Is}{2\pi a^2}$ inside, $\dfrac{\mu_0I}{2\pi s}$ outside.
            - **Surface current** on the wire (HW 5.14a): $0$ inside.
            - **$J\propto s$** (HW 5.14b): $I_{\text{enc}} = I\,s^3/a^3$, so $B = \dfrac{\mu_0Is^2}{2\pi a^3}$ inside.
            - **Slab** $-a<z<a$, $\vb J = J\hat{\mathbf x}$ (Discussion 5.15): $\vb B = -\mu_0Jz\,\hat{\mathbf y}$ inside; $\mp\mu_0Ja\,\hat{\mathbf y}$ above/below. (Outside it looks like a sheet with $K = 2aJ$.)
            - **Coax**, $+I$ in, $-I$ back: $\mu_0I/2\pi s$ between, $0$ outside.
            - **Coaxial solenoids, opposite currents** (HW 5.17): inside both $\mu_0(n_1 - n_2)I$, between $\mu_0n_2I$ (only the outer one), outside $0$.
            - **Moving capacitor** (HW 5.18): $K = \sigma v$ on each plate, opposite. $B = \mu_0\sigma v$ between, $0$ outside. Magnetic force per area on the top plate (from the bottom plate's field only, $\mu_0K/2$): $\tfrac12\mu_0\sigma^2v^2$, **repulsive**. Electric: $\sigma^2/2\varepsilon_0$, attractive. They balance at $v = 1/\sqrt{\mu_0\varepsilon_0} = c$. (So the magnetic force can never win. Kuo likes this kind of punchline.)

            !!method Speed trick: $I_{\text{enc}}$ with a nonuniform $J$
                For $J(s)$ in a wire, $I_{\text{enc}}(s) = \int_0^s J(s')\,2\pi s'\,ds'$. If $J\propto s^k$, then $I_{\text{enc}}/I = (s/a)^{k+2}$ and $B_{\text{in}} = \dfrac{\mu_0I}{2\pi s}\left(\dfrac sa\right)^{k+2}$. No need to redo the integral.

            !!trap Force on a sheet uses the average field
                The field right at a current sheet is the **average** of the fields on its two sides. Equivalently: use only the field from everything **else**. Using the full $\mu_0K$ between the plates doubles the force.

            !!method Speed trick: the off-center hole
                A long wire with uniform $\vb J$ and a cylindrical hole whose axis is displaced by $\vb d$: superpose the full wire ($+\vb J$) and a hole-sized wire ($-\vb J$). Inside the hole, $\vb B = \dfrac{\mu_0}{2}\vb J\times\vb d$: **uniform**. (The full wire alone gives $\tfrac{\mu_0}2\vb J\times\vb s$; subtracting the hole's gives $\tfrac{\mu_0}{2}\vb J\times(\vb s - \vb s') = \tfrac{\mu_0}2\vb J\times\vb d$.) This is the magnetic twin of the uniform $\vb E$ in a cavity of a charged sphere.
          `),
          Q(md`A long wire of radius $a$ carries $I$ with $J\propto s^2$. Inside, $B$ grows as`,
            [md`$s^3$`, md`$s$`, md`$s^2$`, md`$s^4$`], 0,
            [null, md`That's uniform $J$.`, md`$I_{\text{enc}}\propto s^4$, then divide by $2\pi s$: $s^3$.`, md`You forgot to divide by the loop length $2\pi s$.`],
            md`$I_{\text{enc}}\propto\int s^2\cdot s\,ds\propto s^4$; $B = \mu_0I_{\text{enc}}/2\pi s\propto s^3$.`),
          Q(md`Two infinite sheets carry equal and **opposite** surface currents $\pm K\hat{\mathbf x}$ at $z = \pm d/2$. The field between them and outside is`,
            [md`$\mu_0K$ between, $0$ outside`, md`$\mu_0K/2$ everywhere`, md`$0$ between, $\mu_0K$ outside`, md`$\mu_0K$ everywhere`], 0,
            [null, md`Each sheet alone is $\mu_0K/2$; they add or cancel depending on the region.`, md`Swapped.`, md`Outside, the two contributions point opposite ways.`],
            md`Between: both $\mu_0K/2$ in the same direction. Outside: opposite. This is the moving capacitor and the flattened solenoid.`),
          Q(md`Coaxial solenoids with **opposite** currents: inner (radius $a$, $n_1$), outer (radius $b$, $n_2$). In the gap $a<s<b$,`,
            [md`$B = \mu_0n_2I$`, md`$B = \mu_0(n_1 - n_2)I$`, md`$B = \mu_0(n_1 + n_2)I$`, md`$B = 0$`], 0,
            [null, md`That's inside the inner one, where both solenoids contribute.`, md`The currents are opposite, so their fields subtract where both act; and in the gap only the outer acts.`, md`The outer solenoid's field fills everything inside it, including the gap.`],
            md`A solenoid's field is confined to its own interior. In the gap you're outside the inner solenoid but inside the outer: $\mu_0n_2I$.`),
          Q(md`The two plates of a capacitor ($\pm\sigma$) slide together at speed $v$ parallel to themselves. The magnetic force between them`,
            [md`is repulsive, and equals the electric attraction only at $v = c$`, md`is attractive, adding to the electric attraction`, md`is zero, since the net current is zero`, md`is repulsive, and cancels the electric force at $v = c/2$`], 0,
            [null, md`Opposite currents repel.`, md`Each plate feels the other's $B$.`, md`The ratio is $\mu_0\varepsilon_0v^2 = v^2/c^2$; equality is at $v = c$.`],
            md`$f_B/f_E = \dfrac{\mu_0\sigma^2v^2/2}{\sigma^2/2\varepsilon_0} = \dfrac{v^2}{c^2}$. Magnetism is the relativistic correction to electrostatics.`),
          P({
            id: 'e2-amp-p1', title: 'HW 5.14b: J proportional to s',
            q: md`A wire of radius $a$ carries total current $I$ with $J = ks$. Find (a) $k$ in terms of $I$, (b) $B$ inside at radius $s$.`,
            hints: [md`$I = \int_0^a ks\cdot2\pi s\,ds$.`],
            parts: [
              { lbl: md`(a) $k$`, expr: '3*I/(2*pi*a^3)', vars: { I: [1, 3], a: [0.5, 2] } },
              { lbl: md`(b) $B$`, expr: 'mu0*I*s^2/(2*pi*a^3)', vars: { mu0: [0.5, 2], I: [1, 3], s: [0.1, 0.4], a: [0.5, 2] } },
            ],
            sol: md`(a) $I = \tfrac{2\pi ka^3}{3}$, so $k = \dfrac{3I}{2\pi a^3}$. (b) $I_{\text{enc}} = I s^3/a^3$, $B = \dfrac{\mu_0Is^2}{2\pi a^3}$. Check at $s = a$: $\mu_0I/2\pi a$ ✓ matches outside.`,
          }),
          P({
            id: 'e2-amp-p2', title: 'Discussion 5.15: the thick slab',
            q: md`A slab $-a<z<a$, infinite in $x$ and $y$, carries $\vb J = J\hat{\mathbf x}$. Find $B_y$ (a) inside at height $z$, (b) above the slab.`,
            hints: [md`By symmetry $B_y(-z) = -B_y(z)$, so $B = 0$ at $z = 0$.`, md`Rectangular loop from $z = 0$ up to $z$, length $\ell$ along $y$: $B\ell = \mu_0J\ell z$.`],
            parts: [
              { lbl: md`(a) $B_y$ inside`, expr: '-mu0*J*z', vars: { mu0: [0.5, 2], J: [1, 3], z: [0.1, 0.4] } },
              { lbl: md`(b) $B_y$ above`, expr: '-mu0*J*a', vars: { mu0: [0.5, 2], J: [1, 3], a: [0.5, 2] } },
            ],
            sol: md`
              Direction: above a sheet with $\vb K\parallel\hat{\mathbf x}$, $\vb B\parallel\vb K\times\hat{\mathbf z} = \hat{\mathbf x}\times\hat{\mathbf z} = -\hat{\mathbf y}$. So $B_y<0$ above, $>0$ below.

              (a) A loop from the midplane ($B = 0$) to height $z$ encloses $J\ell z$: $B_y = -\mu_0Jz$. (b) For $z>a$, the enclosed current stops growing: $B_y = -\mu_0Ja$ (= $\mu_0K/2$ with $K = 2aJ$ ✓).
            `,
          }),
          P({
            id: 'e2-amp-p3', title: 'HW 5.18: the moving capacitor',
            q: md`Capacitor plates with $\pm\sigma$ move at speed $v$ parallel to themselves. Find (a) $B$ between the plates, (b) the magnetic force per area on the top plate, (c) the speed at which it balances the electric force.`,
            hints: [md`$K = \sigma v$. Between: both sheets add.`, md`On the top plate use only the bottom plate's field, $\mu_0K/2$.`],
            parts: [
              { lbl: md`(a) $B$`, expr: 'mu0*sigma*v', vars: { mu0: [0.5, 2], sigma: [1, 3], v: [1, 3] } },
              { lbl: md`(b) $f$`, expr: 'mu0*sigma^2*v^2/2', vars: { mu0: [0.5, 2], sigma: [1, 3], v: [1, 3] } },
              { lbl: md`(c) $v$`, expr: '1/sqrt(mu0*eps0)', vars: { mu0: [0.5, 2], eps0: [0.5, 2] } },
            ],
            sol: md`(a) $\mu_0K = \mu_0\sigma v$ between, $0$ outside. (b) $f = K\cdot\tfrac{\mu_0K}{2} = \tfrac12\mu_0\sigma^2v^2$, repulsive. (c) $\tfrac12\mu_0\sigma^2v^2 = \sigma^2/2\varepsilon_0$, so $v = 1/\sqrt{\mu_0\varepsilon_0} = c$.`,
          }),
          P({
            id: 'e2-amp-p4', title: 'Exam twist: the off-center hole',
            q: md`A long wire of radius $a$ carries uniform current density $\vb J = J\hat{\mathbf z}$, except for a cylindrical hole of radius $b$ whose axis is parallel to the wire's and displaced by $\vb d = d\,\hat{\mathbf x}$. Find $\vb B$ inside the hole. Give $B_y$.`,
            hints: [md`Full wire with $+\vb J$ plus a hole-sized wire with $-\vb J$.`, md`Inside a uniform wire, $\vb B = \tfrac{\mu_0}{2}\vb J\times\vb s$ (vector $\vb s$ from its axis).`],
            parts: [{ lbl: md`$B_y$`, expr: 'mu0*J*d/2', vars: { mu0: [0.5, 2], J: [1, 3], d: [0.1, 0.5] } }],
            sol: md`$\vb B = \tfrac{\mu_0}{2}\vb J\times\vb s - \tfrac{\mu_0}{2}\vb J\times(\vb s - \vb d) = \tfrac{\mu_0}{2}\vb J\times\vb d = \tfrac{\mu_0Jd}{2}\,\hat{\mathbf z}\times\hat{\mathbf x} = \tfrac{\mu_0Jd}{2}\hat{\mathbf y}$. Uniform throughout the hole.`,
          }),
        ],
      },

      // ------------------------------------------------------------------ vector potential
      {
        id: 'e2-A', title: 'The vector potential A',
        steps: [
          R(md`
            $\nabla\cdot\vb B = 0$ always, so $\vb B = \nabla\times\vb A$. In the Coulomb gauge ($\nabla\cdot\vb A = 0$):

            $$\nabla^2\vb A = -\mu_0\vb J\qquad\Rightarrow\qquad\vb A(\vb r) = \frac{\mu_0}{4\pi}\int\frac{\vb J\,d\tau'}{\srm}\quad(\text{or }\tfrac{\mu_0}{4\pi}\int\tfrac{I\,d\vb l'}{\srm}).$$

            !!intuition $\vb A$ is "V for currents", component by component
                Each Cartesian component obeys its own Poisson equation: $A_x$ is to $\mu_0J_x$ what $V$ is to $\rho/\varepsilon_0$. So $\vb A$ **points along the current** that makes it (for straight currents), and you can steal every electrostatic answer by renaming $\rho/\varepsilon_0\to\mu_0J$.

            !!method Speed trick: Stokes for $\vb A$ (Ampère's law for $\vb A$)
                $\oint\vb A\cdot d\vb l = \int\vb B\cdot d\vb a = \Phi_B$. Same symmetry game as Ampère, with **flux** playing "enclosed current". Solenoid radius $R$, field $B_0$ inside: $A\cdot2\pi s = B_0\pi s^2$ inside, so $A = \tfrac{B_0s}{2}$; outside $A = \dfrac{B_0R^2}{2s}$, both $\hat{\boldsymbol\phi}$. Uniform $\vb B$ anywhere: $\vb A = \tfrac12\vb B\times\vb r$.

            ### The catalog

            | Source | $\vb A$ |
            |---|---|
            | Uniform $\vb B$ | $\tfrac12\vb B\times\vb r$ |
            | Infinite wire | $-\dfrac{\mu_0I}{2\pi}\ln\dfrac{s}{s_0}\,\hat{\mathbf z}$ (log, like a line charge's $V$) |
            | Finite wire $z_1$ to $z_2$ (HW 5.25) | $\dfrac{\mu_0I}{4\pi}\ln\dfrac{z_2 + \sqrt{z_2^2 + s^2}}{z_1 + \sqrt{z_1^2 + s^2}}\,\hat{\mathbf z}$ |
            | Sheet $\vb K = K\hat{\mathbf x}$ at $z = 0$ (HW 5.29) | $-\dfrac{\mu_0K}{2}|z|\,\hat{\mathbf x}$ (like a sheet's $V\propto-|z|$) |
            | Solenoid | $\tfrac{\mu_0nI}{2}s\,\hat{\boldsymbol\phi}$ in, $\dfrac{\mu_0nIR^2}{2s}\hat{\boldsymbol\phi}$ out |
            | Dipole $\vb m$ | $\dfrac{\mu_0}{4\pi}\dfrac{\vb m\times\uv r}{r^2}$ |

            !!trap You can't use $\int\vb J/\srm$ when current goes to infinity
                Just like $V$ for an infinite line charge, the integral diverges. Use Stokes (flux) or solve $\nabla\times\vb A = \vb B$ directly, and pick a reference point.

            **HW 5.26** ($\vb A = k\hat{\boldsymbol\phi}$, what $\vb J$?). Take two curls in cylindrical coordinates:

            $$\vb B = \nabla\times\vb A = \frac1s\frac{\partial(sk)}{\partial s}\hat{\mathbf z} = \frac ks\hat{\mathbf z},\qquad\mu_0\vb J = \nabla\times\vb B = -\frac{\partial B_z}{\partial s}\hat{\boldsymbol\phi} = \frac{k}{s^2}\hat{\boldsymbol\phi}.$$

            So $\vb J = \dfrac{k}{\mu_0s^2}\hat{\boldsymbol\phi}$.
          `),
          Q(md`A long straight wire carries $I$ along $\hat{\mathbf z}$. Its vector potential points`,
            [md`along $\hat{\mathbf z}$`, md`along $\hat{\boldsymbol\phi}$, like $\vb B$`, md`radially`, md`nowhere; $\vb A = 0$ for a straight wire`], 0,
            [null, md`$\vb B$ circles the wire; $\vb A$ follows the current.`, md`Nothing in $\int I\,d\vb l/\srm$ points radially.`, md`$\vb A\propto\ln s\,\hat{\mathbf z}$; its curl is the familiar $\hat{\boldsymbol\phi}$ field.`],
            md`$\vb A\propto\int I\,d\vb l'/\srm$ is a sum of vectors along the current.`),
          Q(md`A solenoid (radius $R$, interior field $B_0$). At $s = 2R$, outside, $\vb B = 0$. What is $|\vb A|$ there?`,
            [md`$B_0R/4$`, md`$0$`, md`$B_0R$`, md`$B_0R/2$`], 0,
            [null, md`$\vb B = 0$ there, but $\oint\vb A\cdot d\vb l$ equals the flux $B_0\pi R^2$ inside, which isn't zero.`, md`$A\cdot2\pi(2R) = B_0\pi R^2$ gives $B_0R/4$.`, md`That's $A$ at $s = R$.`],
            md`$A = \dfrac{\Phi}{2\pi s} = \dfrac{B_0\pi R^2}{4\pi R} = \dfrac{B_0R}{4}$. $\vb A$ can be nonzero where $\vb B = 0$ (Aharonov–Bohm).`),
          Q(md`Which gauge choice makes $\nabla^2\vb A = -\mu_0\vb J$?`,
            [md`$\nabla\cdot\vb A = 0$ (Coulomb)`, md`$\nabla\times\vb A = 0$`, md`$\vb A = 0$ at the origin`, md`Any gauge works`], 0,
            [null, md`Then $\vb B = 0$.`, md`That's a reference point, not a gauge condition on the whole field.`, md`In general $\nabla\times(\nabla\times\vb A) = \nabla(\nabla\cdot\vb A) - \nabla^2\vb A$; the first term only drops if $\nabla\cdot\vb A = 0$.`],
            md`$\nabla\times\vb B = \nabla(\nabla\cdot\vb A) - \nabla^2\vb A = \mu_0\vb J$; the Coulomb gauge kills the first term. You can always reach it by adding $\nabla\lambda$ with $\nabla^2\lambda = -\nabla\cdot\vb A_0$.`),
          P({
            id: 'e2-A-p1', title: 'HW 5.26: from A to J',
            q: md`$\vb A = k\hat{\boldsymbol\phi}$ (cylindrical, $k$ constant). Find (a) $B_z$, (b) $J_\phi$.`,
            hints: [md`$(\nabla\times\vb A)_z = \frac1s\partial_s(sA_\phi)$.`, md`$(\nabla\times\vb B)_\phi = \partial_zB_s - \partial_sB_z$.`],
            parts: [
              { lbl: md`(a) $B_z$`, expr: 'k/s', vars: { k: [1, 3], s: [0.5, 2] } },
              { lbl: md`(b) $J_\phi$`, expr: 'k/(mu0*s^2)', vars: { k: [1, 3], mu0: [0.5, 2], s: [0.5, 2] } },
            ],
            sol: md`$B_z = \frac1s\frac{d}{ds}(ks) = \frac ks$. $\mu_0J_\phi = -\frac{d}{ds}\frac ks = \frac{k}{s^2}$.`,
          }),
          P({
            id: 'e2-A-p2', title: 'HW 5.29: A of a sheet',
            q: md`A sheet at $z = 0$ carries $\vb K = K\hat{\mathbf x}$. With $\vb A = A_x(z)\hat{\mathbf x}$ and $A_x(0) = 0$, find $A_x$ for $z>0$.`,
            hints: [md`$B_y = \partial A_x/\partial z$ and above the sheet $B_y = -\mu_0K/2$.`],
            parts: [{ lbl: md`$A_x(z>0)$`, expr: '-mu0*K*z/2', vars: { mu0: [0.5, 2], K: [1, 3], z: [0.5, 2] } }],
            sol: md`$(\nabla\times\vb A)_y = \partial_zA_x = -\mu_0K/2$ above, $+\mu_0K/2$ below, so $A_x = -\tfrac{\mu_0K}{2}|z|$. Continuous at $z = 0$ ✓, and its slope jumps by $-\mu_0K$ ✓ (the BC for $\vb A$).`,
          }),
        ],
      },

      // ------------------------------------------------------------------ BCs and dipoles
      {
        id: 'e2-mbc', title: 'Magnetic boundary conditions and the magnetic dipole',
        steps: [
          R(md`
            ### Boundary conditions at a current sheet

            $$B^\perp_{\text{above}} = B^\perp_{\text{below}},\qquad\vb B_{\text{above}} - \vb B_{\text{below}} = \mu_0\vb K\times\uv n,\qquad\vb A\ \text{continuous}.$$

            Compare electrostatics: there $E^\parallel$ is continuous and $E^\perp$ jumps by $\sigma/\varepsilon_0$. Magnetism swaps the roles: $B^\perp$ continuous, $B^\parallel$ jumps by $\mu_0K$, in the direction perpendicular to $\vb K$.

            !!method Speed trick: get the inside field from the outside (Lecture 24)
                Given $\vb B$ on one side of a known $\vb K$, the BCs hand you the other side in one line. Spinning shell ($\vb K = \sigma\omega R\sin\theta\,\hat{\boldsymbol\phi}$), outside a dipole. At the equator: $\vb B_{\text{out}} = -\tfrac{\mu_0\sigma\omega R}{3}\hat{\mathbf z}$ and $\mu_0\vb K\times\uv r = -\mu_0\sigma\omega R\,\hat{\mathbf z}$, so $\vb B_{\text{in}} = \vb B_{\text{out}} - \mu_0\vb K\times\uv r = +\tfrac23\mu_0\sigma\omega R\,\hat{\mathbf z}$ ✓.

            ### The magnetic dipole

            The multipole expansion of $\vb A$ has **no monopole term** ($\oint d\vb l = 0$). The leading term is the dipole:

            $$\vb m = I\int d\vb a = I\,\vb a\quad(\text{right-hand rule}),\qquad\vb B_{\text{dip}} = \frac{\mu_0m}{4\pi r^3}(2\cos\theta\,\uv r + \sin\theta\,\hat{\boldsymbol\theta}).$$

            Same shape as the electric dipole, with $\dfrac{p}{4\pi\varepsilon_0}\to\dfrac{\mu_0m}{4\pi}$ (outside the source; inside they differ).

            !!method Speed trick: $m = \dfrac{Q}{2M}L$ for anything spinning
                If charge and mass are spread the same way, every bit has the same $dm/dL = Q/2M$. So $m = \dfrac{Q}{2M}I_{\text{moment}}\,\omega$, and you only need the moment of inertia you memorized in mechanics:

                | Spinning object, total charge $Q$ | $I_{\text{moment}}/M$ | $m$ |
                |---|---|---|
                | Ring | $R^2$ | $\tfrac12Q\omega R^2$ |
                | Disk (Discussion 5.39a) | $\tfrac12R^2$ | $\tfrac14Q\omega R^2 = \tfrac14\pi\sigma\omega R^4$ |
                | Spherical shell (5.39b) | $\tfrac23R^2$ | $\tfrac13Q\omega R^2 = \tfrac43\pi\sigma\omega R^4$ |
                | Solid sphere (5.63a) | $\tfrac25R^2$ | $\tfrac15Q\omega R^2$ |

                Seconds instead of a ring-by-ring integral.

            **Spinning shell (Griffiths Ex. 5.11), memorize:** inside $\vb B = \tfrac23\mu_0\sigma\omega R\,\hat{\mathbf z}$, **uniform**; outside a perfect dipole with $m = \tfrac43\pi\sigma\omega R^4$.

            **Average field inside a sphere** from currents inside it (Prob. 5.59): $\vb B_{\text{avg}} = \dfrac{\mu_0}{4\pi}\dfrac{2\vb m}{R^3}$. Solid spinning sphere: $\dfrac{\mu_0Q\omega}{10\pi R}$.
          `),
          Q(md`Across a surface current $\vb K$, which component of $\vb B$ jumps?`,
            [md`The tangential component perpendicular to $\vb K$`, md`The normal component`, md`The tangential component along $\vb K$`, md`All three`], 0,
            [null, md`$\nabla\cdot\vb B = 0$ (pillbox) keeps $B^\perp$ continuous.`, md`An Ampèrian loop in the plane containing $\vb K$ and $\uv n$ encloses no current, so this component is continuous.`, md`Only one jumps: by $\mu_0K$, along $\vb K\times\uv n$.`],
            md`$\vb B_{\text{above}} - \vb B_{\text{below}} = \mu_0\vb K\times\uv n$: tangential and perpendicular to $\vb K$. The other two components are continuous.`),
          Q(md`A uniformly charged **disk** (total $Q$, radius $R$) spins at $\omega$. Its magnetic moment is`,
            [md`$\tfrac14Q\omega R^2$`, md`$\tfrac12Q\omega R^2$`, md`$\tfrac13Q\omega R^2$`, md`$\tfrac15Q\omega R^2$`], 0,
            [null, md`That's a ring (all charge at $R$).`, md`That's the spherical shell.`, md`That's the solid sphere.`],
            md`$m = \frac{Q}{2M}\cdot\tfrac12MR^2\omega = \tfrac14Q\omega R^2$. With $Q = \sigma\pi R^2$: $\tfrac14\pi\sigma\omega R^4$ ✓ (Discussion 5.39a).`),
          Q(md`Inside a uniformly charged spinning spherical shell, $\vb B$ is`,
            [md`uniform, $\tfrac23\mu_0\sigma\omega R$ along $\boldsymbol\omega$`, md`zero, like $\vb E$ inside a charged shell`, md`a dipole field`, md`largest near the equator`], 0,
            [null, md`$\vb E$ inside a charged shell is zero; $\vb B$ inside a **spinning** one is not. The surface current acts like a (spherical) solenoid.`, md`That's outside.`, md`It's uniform.`],
            md`The $\sin\theta$ surface current on a sphere is the one current distribution that gives an exactly uniform interior field (same math as $\sigma = k\cos\theta$ giving uniform $\vb E$).`),
          P({
            id: 'e2-mbc-p1', title: 'Discussion 5.63: the spinning solid sphere',
            q: md`A solid sphere (radius $R$, charge $Q$ uniform) spins at $\omega$. Find (a) $m$, (b) the average $B$ inside.`,
            hints: [md`$m = \frac{Q}{2M}L$ with $L = \tfrac25MR^2\omega$.`, md`$B_{\text{avg}} = \frac{\mu_0}{4\pi}\frac{2m}{R^3}$.`],
            parts: [
              { lbl: md`(a) $m$`, expr: 'Q*omega*R^2/5', vars: { Q: [1, 3], omega: [1, 3], R: [0.5, 2] } },
              { lbl: md`(b) $B_{\text{avg}}$`, expr: 'mu0*Q*omega/(10*pi*R)', vars: { mu0: [0.5, 2], Q: [1, 3], omega: [1, 3], R: [0.5, 2] } },
            ],
            sol: md`
              (a) $m = \dfrac{Q}{2M}\cdot\dfrac25MR^2\omega = \dfrac{Q\omega R^2}{5}$. **Slow check:** shells of radius $r$, charge $dq = \rho4\pi r^2dr$, each $dm = \tfrac13dq\,\omega r^2$: $\int_0^R\tfrac13\rho4\pi\omega r^4dr = \tfrac{4\pi\rho\omega R^5}{15} = \tfrac{Q\omega R^2}{5}$ ✓.

              (b) $\dfrac{\mu_0}{4\pi}\dfrac{2Q\omega R^2/5}{R^3} = \dfrac{\mu_0Q\omega}{10\pi R}$.
            `,
          }),
          P({
            id: 'e2-mbc-p2', title: 'HW 5.37: a loop as a dipole',
            q: md`A loop of radius $R$ in the $xy$ plane carries $I$ counterclockwise seen from $+z$. Far away, find (a) $m_z$, (b) $B_r$ at $(r, \theta)$, (c) $B_z$ on the $z$ axis at $z\gg R$.`,
            hints: [md`$\vb m = I\pi R^2\hat{\mathbf z}$.`],
            parts: [
              { lbl: md`(a) $m_z$`, expr: 'I*pi*R^2', vars: { I: [1, 3], R: [0.5, 2] } },
              { lbl: md`(b) $B_r$`, expr: 'mu0*I*R^2*cos(theta)/(2*r^3)', vars: { mu0: [0.5, 2], I: [1, 3], R: [0.5, 2], theta: [0.2, 1.2], r: [5, 9] } },
              { lbl: md`(c) $B_z$ on axis`, expr: 'mu0*I*R^2/(2*z^3)', vars: { mu0: [0.5, 2], I: [1, 3], R: [0.5, 2], z: [5, 9] } },
            ],
            sol: md`(a) $I\pi R^2$. (b) $\dfrac{\mu_0m}{4\pi r^3}2\cos\theta = \dfrac{\mu_0IR^2\cos\theta}{2r^3}$. (c) $\theta = 0$: $\dfrac{\mu_0IR^2}{2z^3}$, the large-$z$ limit of the exact $\dfrac{\mu_0IR^2}{2(R^2+z^2)^{3/2}}$ ✓.`,
          }),
        ],
      },
    ],
  });
})();

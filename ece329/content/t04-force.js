/* Topic 4 — Magnetic force and Biot–Savart (Lectures 11–12). The Lorentz force on a charge, the force on a current
   element and on a straight wire, parallel wires, and the field of a current from Biot–Savart: the infinite line
   (derived), a loop on its axis (center and far field), and the right-hand rules that give every direction.
   Ampère's law with symmetry is Topic 5; sheets, slabs and delta-function currents are Topic 6. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- small vector helpers (local)
  const AX = ['x', 'y', 'z'];
  const unit = (k, s = 1) => { const v = [0, 0, 0]; v[AX.indexOf(k)] = s; return v; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const neg = (v) => v.map((x) => -x);
  // a unit vector along an axis as TeX, e.g. '$-\hat y$'
  const dirT = (v) => { const i = v.findIndex((x) => Math.abs(x) > 1e-12); return i < 0 ? '$0$' : `$${v[i] > 0 ? '+' : '-'}\\hat ${AX[i]}$`; };
  const sgnT = (s) => (s > 0 ? '+' : '-');
  const r3 = (x) => +x.toPrecision(3);

  // ---------------------------------------------------------------- figures
  // q > 0 moving right in B into the page: F = qv x B points up, toward the center of a circular path
  function lorentzFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a positive charge moving right through a magnetic field into the page; the force points up, toward the center of the circle it follows' });
    g.marks('x', 20, 18, 230, 150, 7, 5);
    g.arc(70, 64, 66, 270, 372, { cls: 'dash' });
    g.charge(70, 130, { q: '+' });
    g.arrow(80, 130, 140, 130, { cls: 'thick', hs: 8 });
    g.label(144, 130, '\\mathbf v', 'l');
    g.arrow(70, 120, 70, 72, { cls: 'thick', hs: 8 });
    g.label(64, 98, '\\mathbf F', 'r');
    g.label(232, 14, '\\mathbf B\\ \\text{into page}', 'br', 'small');
    return g.svg();
  }

  // a straight wire carrying I to the right in B into the page: F = I l x B points up
  function wireForceFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a horizontal wire carrying current to the right in a magnetic field into the page; the force on it points up' });
    g.marks('x', 20, 24, 230, 144, 7, 4);
    g.line(14, 124, 236, 124, { cls: 'thick', arrow: 'end', hs: 9 });
    g.label(207, 128, 'I', 'tl');
    g.arrow(110, 118, 110, 50, { cls: 'thick', hs: 8 });
    g.label(116, 84, '\\mathbf F = I\\boldsymbol\\ell\\times\\mathbf B', 'l', 'small');
    return g.svg();
  }

  // Biot–Savart for the infinite wire: element I dz' at height z', point P at distance r; dB into the page
  function bsFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a vertical wire carrying current up; a short element at height z prime; the vector R from it to a point P at distance r; the element field at P points into the page' });
    g.line(60, 214, 60, 16, { cls: 'thick', arrow: 'end', hs: 9 });
    g.label(66, 22, 'I', 'l');
    g.line(60, 78, 60, 62, { cls: 'thick' });
    g.circle(60, 70, 9, { cls: 'dim' });
    g.label(48, 70, "I\\,dz'", 'r', 'small');
    g.arrow(66, 74, 196, 146, { cls: 'dash', hs: 7 });
    g.label(132, 100, '\\mathbf R', 'bl');
    g.otimes(206, 150, 7, { lab: 'd\\mathbf B', at: 'r' });
    g.label(206, 166, 'P', 't', 'small');
    g.dim(60, 186, 206, 186, 'r', { at: 'b' });
    g.dim(34, 150, 34, 70, "z'", { at: 'l' });
    g.line(60, 150, 196, 150, { cls: 'dim thin dash' });
    return g.svg();
  }

  // a loop on its axis: opposite elements give dB's whose sideways parts cancel; the axial parts add (B up for ccw from above)
  function loopAxisFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a horizontal current loop, counterclockwise seen from above; at a point on its axis the fields of two opposite elements tilt left and right, and their sum points up the axis' });
    const cx = 150, cy = 176, rx = 92, ry = 24, P = [150, 70];
    g.line(cx, cy + 34, cx, P[1], { cls: 'dim dash' });
    g.ellipse(cx, cy, rx, ry, { half: 'back', cls: 'dim' });
    g.ellipse(cx, cy, rx, ry, { half: 'front', cls: 'thick' });
    g.head(cx + 4, cy + ry, 1, 0, { hs: 9 });
    g.head(cx - 4, cy - ry, -1, 0, { cls: 'dim', hs: 8 });
    g.label(cx + 12, cy + ry + 4, 'I', 'tl');
    g.line(cx - rx, cy, P[0], P[1], { cls: 'dim thin dash' });
    g.line(cx + rx, cy, P[0], P[1], { cls: 'dim thin dash' });
    g.arrow(P[0], P[1], P[0] + 46, P[1] - 38, { hs: 7 });
    g.arrow(P[0], P[1], P[0] - 46, P[1] - 38, { hs: 7 });
    g.label(P[0] + 50, P[1] - 40, 'd\\mathbf B', 'bl', 'small');
    g.arrow(P[0], P[1], P[0], P[1] - 52, { cls: 'thick', hs: 9 });
    g.label(P[0] + 6, P[1] - 56, '\\mathbf B', 'l');
    g.dot(P[0], P[1], 2.6);
    g.dim(cx, cy, cx + rx, cy, 'a', { at: 'b' });
    g.dim(cx - 112, cy, cx - 112, P[1], 'z', { at: 'l' });
    g.line(cx - 112, P[1], P[0] - 6, P[1], { cls: 'dim thin dash' });
    g.line(cx - 112, cy, cx - rx, cy, { cls: 'dim thin dash' });
    return g.svg();
  }

  // two wires: wire 2 sits in B1; the force on it points toward wire 1 (same direction) or away (opposite)
  function wiresFig(same) {
    const g = PF.fig({ scale: 1.15, alt: same ? 'two wires with current out of the page; the field of the left wire at the right wire points up; the forces pull the wires together' : 'left wire current out of the page, right wire into the page; the forces push the wires apart' });
    const y = 90, x1 = 40, x2 = 180, rr = x2 - x1, t = 24 * Math.PI / 180;
    g.arc(x1, y, rr, -24, 24, { cls: 'dim', arrow: 'end', hs: 6 });
    g.label(x1 + rr * Math.cos(t) + 6, y - rr * Math.sin(t), '\\mathbf B_1', 'l', 'small');
    g.odot(x1, y, 8);
    if (same) g.odot(x2, y, 8); else g.otimes(x2, y, 8);
    g.label(x1, y + 14, 'I_1', 't', 'small');
    g.label(x2 + 12, y + 12, 'I_2', 'tl', 'small');
    const s = same ? -1 : 1;
    g.arrow(x2 + s * 12, y, x2 + s * 44, y, { cls: 'thick', hs: 8 });
    g.arrow(x1 - s * 12, y, x1 - s * 44, y, { cls: 'thick', hs: 8 });
    g.label(x2 + s * 30, y - 8, '\\mathbf F', 'b', 'small');
    g.label(x1 - s * 30, y - 8, '\\mathbf F', 'b', 'small');
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  EM.lesson('u2', {
    id: 't4-force', topic: 4, ref: 'Lectures 11–12', title: 'Magnetic force and Biot–Savart',
    steps: [
      R(md`
        !!key Why you care
          Spring 2018 1(i) asks whether parallel wires attract. HW 6 #5 (the rail gun) is $\mathbf F = I\boldsymbol\ell\times\mathbf B$ on the armature. HW 6 #4 needs the field at a loop's center, $\mu_0I/2a$; Summer 2017 #2(b) hands you a loop's far field $\mu_0Ia^2/2z^3$ and asks for an emf. Every delta-function current problem (Summer 2017 #1(a), Summer 2018 #1(b), Summer 2020 #2(a)) is a line-current field with its right-hand rule. Faraday and Ampère problems start from fields you get here.

        ### Notation

        - $q$: charge, C. $\mathbf v$: its velocity, m/s. $\mathbf F$: force, N.
        - $\mathbf E$: electric field, V/m. $\mathbf B$: **magnetic flux density**, in tesla, $\text{T} = \text{N/(A·m)} = \text{Wb/m}^2$.
        - $I$: current, A. $d\mathbf l$: a short piece of wire, m, pointing along the current. $I\,d\mathbf l$ (A·m) is a **current element**. $\boldsymbol\ell$: a straight length of wire along the current.
        - $\mathbf R$: vector **from the current element to the field point**; $R = |\mathbf R|$, $\hat R = \mathbf R/R$.
        - $\mu_0 = 4\pi\times10^{-7}$ H/m (= T·m/A), the permeability of free space. Handy: $\mu_0/2\pi = 2\times10^{-7}$.
        - For a straight wire: $r$ = perpendicular distance from the wire, $\hat r$ = unit vector from the wire to the point, $\hat\phi$ = the direction that circles the wire.
        - For a loop: $a$ = its radius, $z$ = distance along its axis from its center. For two wires: $d$ = their spacing.
        - $\times$: cross product. **RHR for $\mathbf A\times\mathbf B$:** fingers along $\mathbf A$, curl them toward $\mathbf B$, the thumb gives $\mathbf A\times\mathbf B$. Cyclic order: $\hat x\times\hat y = \hat z$, $\hat y\times\hat z = \hat x$, $\hat z\times\hat x = \hat y$; reversing the order flips the sign.

        ### The idea

        Magnetic fields push only on **moving** charge, and only moving charge makes them. A current is moving charge, so currents push on currents. Two laws do the whole topic:
        $$\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B) \qquad\qquad d\mathbf B = \frac{\mu_0}{4\pi}\frac{I\,d\mathbf l\times\hat R}{R^2}$$
        The force law is on the formula sheet. The second, **Biot–Savart**, is not; neither are the loop results it gives.
      `),
      RF(md`
        ### Step 1: the force on a moving charge

        [[fig:lor]]

        The magnetic part, $q\mathbf v\times\mathbf B$, is perpendicular to both $\mathbf v$ and $\mathbf B$. Its size is $|q|vB\sin\theta$, with $\theta$ the angle between $\mathbf v$ and $\mathbf B$. A charge moving along $\mathbf B$ feels nothing.

        Since $\mathbf F_m\perp\mathbf v$, $\mathbf F_m\cdot\mathbf v = 0$: **the magnetic force does no work.** It turns the velocity but never changes the speed. Across a uniform $\mathbf B$, a charge goes in a circle at constant speed.

        For a negative charge, find $\mathbf v\times\mathbf B$, then reverse it.
      `, { lor: { svg: lorentzFig(), cap: 'q > 0 moving right, B into the page: v × B points up, toward the center of the circle. An electron would curve down.' } }),
      Q(md`**Predict.** An electron moves with $\mathbf v = v_0\hat x$ through $\mathbf B = B_0\hat z$ ($v_0, B_0 > 0$). The magnetic force on it points along…`,
        ['$+\\hat y$', '$-\\hat y$', '$+\\hat z$', 'nowhere: the force is zero'], 0,
        [null, 'That is the direction of $\\mathbf v\\times\\mathbf B$. The electron\'s negative charge reverses it.', 'The magnetic force is perpendicular to $\\mathbf B$; it can never point along $\\hat z$ here.', '$\\mathbf v\\perp\\mathbf B$, so the force is as large as it can be, $ev_0B_0$.'],
        md`$\mathbf v\times\mathbf B = v_0B_0\,\hat x\times\hat z = -v_0B_0\hat y$. Multiply by $q = -e$: $\mathbf F = +ev_0B_0\hat y$.`),
      RF(md`
        ### Step 2: a current is moving charge

        The charge $dq$ in a piece $d\mathbf l$ of wire moves at $\mathbf v$, and $dq\,\mathbf v = I\,d\mathbf l$ (both in A·m). So each piece of wire feels
        $$d\mathbf F = I\,d\mathbf l\times\mathbf B \qquad\Rightarrow\qquad \mathbf F = I\boldsymbol\ell\times\mathbf B\quad\text{(straight wire, uniform }\mathbf B)$$
        with $|\mathbf F| = I\ell B\sin\theta$. This is the tesla's definition: 1 T pushes 1 N on 1 m of wire carrying 1 A across it.

        [[fig:wire]]

        A **closed** loop in a **uniform** $\mathbf B$ feels no net force, because $\oint d\mathbf l = 0$; it can only twist.
      `, { wire: { svg: wireForceFig(), cap: 'Current to the right, B into the page: the force on the wire is up (fingers along I, curl into the page, thumb up).' } }),
      Q(md`**Predict.** A $0.5$ m length of wire carries $4$ A along $+\hat x$ in a uniform $\mathbf B = 0.2\,\hat z$ T. The force on it is…`,
        ['$-0.4\\,\\hat y$ N', '$+0.4\\,\\hat y$ N', '$0.4\\,\\hat z$ N', '$0$'], 0,
        [null, 'That is $\\mathbf B\\times I\\boldsymbol\\ell$: the order of a cross product matters.', 'The force is perpendicular to $\\mathbf B$, so it has no $z$-part.', 'The wire runs across the field, so the force is at its maximum.'],
        md`$\mathbf F = I\boldsymbol\ell\times\mathbf B = (4\,\text{A})(0.5\,\text{m})(0.2\,\text{T})\,\hat x\times\hat z = 0.4\,(-\hat y)$ N.`),
      RF(md`
        ### Step 3: the field of a current (Biot–Savart)

        Each current element adds
        $$d\mathbf B = \frac{\mu_0}{4\pi}\frac{I\,d\mathbf l\times\hat R}{R^2}$$
        Like Coulomb's law it falls as $1/R^2$. Unlike it, the direction is a cross product: $\mathbf B$ **circles** the current. An element pointing straight at the field point ($d\mathbf l\parallel\mathbf R$) adds nothing.

        For a whole wire, Lecture 12's five steps: **(1)** draw it, with a cross-section; **(2)** slice the current into elements; **(3)** write $d\mathbf B$ of one element; **(4)** use symmetry to cancel components; **(5)** integrate what survives.

        [[fig:bs]]

        **The infinite straight wire** on the $z$-axis, field point at distance $r$. The element $I\,dz'\,\hat z$ at height $z'$ has $\mathbf R = r\hat r - z'\hat z$, so $d\mathbf l\times\mathbf R = dz'\,\hat z\times(r\hat r - z'\hat z) = r\,dz'\,\hat\phi$. Every element pushes the same way, $\hat\phi$, so nothing cancels and the integral is a number:
        $$\mathbf B = \frac{\mu_0I}{4\pi}\hat\phi\int_{-\infty}^{\infty}\frac{r\,dz'}{(r^2 + z'^2)^{3/2}} = \frac{\mu_0I}{4\pi}\,\frac{2}{r}\,\hat\phi = \frac{\mu_0I}{2\pi r}\,\hat\phi$$

        **RHR for a wire:** thumb along the current, fingers curl along $\mathbf B$. As vectors, $\hat\phi = \hat I\times\hat r$, with $\hat I$ along the current and $\hat r$ from the wire to the point.
      `, { bs: { svg: bsFig(), cap: 'Current up: the element field at P points into the page for every z′, so the elements add. Summed, B = μ₀I/2πr.' } }),
      Q(md`**Predict.** A long wire on the $z$-axis carries current along $+\hat z$. At the point $(0, d, 0)$, $\mathbf B$ points along…`,
        ['$-\\hat x$', '$+\\hat x$', '$+\\hat y$', '$+\\hat z$'], 0,
        [null, 'That is $\\hat r\\times\\hat I$: the order is $\\hat I\\times\\hat r$.', '$\\hat y$ points from the wire to the point: that is $\\hat r$, and $\\mathbf B$ is perpendicular to it.', '$\\mathbf B$ circles the current; it has no part along the wire.'],
        md`$\hat\phi = \hat I\times\hat r = \hat z\times\hat y = -\hat x$. Check with the hand: thumb up $z$, fingers sweep from $+x$ toward $+y$ toward $-x$; at the $+y$ axis they point along $-x$.`),
      RF(md`
        ### Step 4: a loop, on its axis

        [[fig:loop]]

        Ring of radius $a$, current counterclockwise seen from above, field point on the axis at height $z$. Every element is perpendicular to its $\mathbf R$, and every $R = \sqrt{a^2 + z^2}$, so each contributes $|d\mathbf B| = \mu_0I\,dl/4\pi(a^2 + z^2)$. Elements on opposite sides tilt their $d\mathbf B$ in opposite sideways directions, which cancel. The axial parts, a fraction $a/\sqrt{a^2 + z^2}$ of each, add around the ring ($\oint dl = 2\pi a$):
        $$B_z = \frac{\mu_0Ia^2}{2(a^2 + z^2)^{3/2}} \qquad\text{center } (z = 0):\ \frac{\mu_0I}{2a} \qquad |z|\gg a:\ \frac{\mu_0Ia^2}{2|z|^3}$$
        The far field falls as $1/z^3$ (a magnetic dipole), much faster than a wire's $1/r$. No $\pi$ in the center field: $\mu_0I/2a$, not $\mu_0I/2\pi a$.

        **RHR for a loop:** fingers along the current, the thumb gives $\mathbf B$ through the middle.
      `, { loop: { svg: loopAxisFig(), cap: 'Opposite elements: the sideways parts of dB cancel, the axial parts add. Counterclockwise from above gives B up.' } }),
      Q(md`**Predict.** Far out on a loop's axis ($z \gg a$), you double your distance $z$. $B$ becomes…`,
        ['$B/8$', '$B/2$', '$B/4$', '$B/16$'], 0,
        [null, 'A wire falls as $1/r$; a loop\'s far field falls faster.', '$1/z^2$ is Coulomb or Biot–Savart for one element, not the whole loop.', 'One power too many: the far field is $\\propto 1/z^3$.'],
        md`$B \approx \mu_0Ia^2/2z^3$, so $2z$ gives $1/2^3 = 1/8$.`),
      RF(md`
        ### Step 5: two parallel wires

        Wire 1 sits in wire 2's field, $B_2 = \mu_0I_2/2\pi d$, which is perpendicular to wire 1. So a length $\ell$ of wire 1 feels $I_1\ell B_2$:
        $$\frac{F}{\ell} = \frac{\mu_0I_1I_2}{2\pi d}$$
        Wire 2 feels the same, opposite. **Same direction: they attract. Opposite: they repel.** (The reverse of charges.) Two wires 1 m apart with 1 A each: $2\times10^{-7}$ N per meter.

        [[fig:pair]]
      `, { pair: PF.row([{ svg: wiresFig(true), cap: 'Both out of the page: B₁ at wire 2 points up; ẑ × ŷ = −x̂, toward wire 1. Attract.' }, { svg: wiresFig(false), cap: 'Wire 2 reversed: the force reverses. Repel.' }]) }),
      Q(md`**Predict.** Two long parallel wires carry $I_1 = 10$ A and $I_2 = 5$ A in the same direction. Which wire feels the larger force per meter?`,
        ['they feel equal forces, toward each other', 'wire 1, since it carries more current', 'wire 2, since it sits in the stronger field', 'neither: parallel currents exert no force'], 0,
        [null, 'Wire 1 carries more current but sits in the weaker field ($B_2$); the products are equal.', 'It does sit in the stronger field, but it carries less current; $I_2B_1 = I_1B_2$.', 'Each wire is in the other\'s field and carries current across it.'],
        md`$F_1/\ell = I_1\,\mu_0I_2/2\pi d$ and $F_2/\ell = I_2\,\mu_0I_1/2\pi d$: the same product. (For whole infinite wires, Newton's third law holds; Lecture 11 notes it can fail for isolated elements.)`),
      R(md`
        ### The method

        !!method Field and force from currents
          1. **Draw it**, with a cross-section, in coordinates that match the symmetry.
          2. **Field of each piece:** long straight wire $\mu_0I/2\pi r$; loop on its axis $\mu_0Ia^2/2(a^2 + z^2)^{3/2}$. Anything else: slice into elements, Biot–Savart, cancel by symmetry, integrate.
          3. **Direction of each piece** by its RHR ($\hat\phi = \hat I\times\hat r$ for a wire). Add the pieces as **vectors**.
          4. **Force:** $\mathbf F = I\boldsymbol\ell\times\mathbf B$ on a straight wire in a uniform field; $q(\mathbf E + \mathbf v\times\mathbf B)$ on a charge, reversed for $q < 0$.
          5. **Check:** parallel currents attract; the magnetic force does no work; T = N/(A·m).

        ### Worked example

        !!graded Problem
          A long wire on the $z$-axis carries $I_1 = 20$ A along $+\hat z$. A parallel wire through $(0.2\,\text{m}, 0, 0)$ carries $I_2 = 10$ A along $-\hat z$. Find (a) $\mathbf B$ at $P = (0.1\,\text{m}, 0, 0)$; (b) the force on a 2 m length of wire 2; (c) the point on the $x$-axis where $\mathbf B = 0$.

        **1. Field of one wire on the $x$-axis.** For a wire at $x_0$ with current $I$ along $+\hat z$ (negative $I$ for $-\hat z$), at $(x, 0, 0)$: $\hat\phi = \hat z\times\text{sgn}(x - x_0)\hat x$, so
        $$B_y = \frac{\mu_0}{2\pi}\frac{I}{x - x_0}$$
        (signs included).

        **2. (a)** At $x = 0.1$ m:
        $$B_y = (2\times10^{-7}\,\text{T·m/A})\left[\frac{20\,\text{A}}{0.1\,\text{m}} + \frac{-10\,\text{A}}{0.1\,\text{m} - 0.2\,\text{m}}\right] = (2\times10^{-7})(200 + 100) = 6.0\times10^{-5}\ \text{T}$$
        $\mathbf B = 60\,\hat y\ \mu$T. Between antiparallel wires the two fields point the same way and add.

        **3. (b)** Wire 1's field at wire 2: $B_y = (2\times10^{-7})(20/0.2) = 2.0\times10^{-5}$ T. Then
        $$\mathbf F = I_2\boldsymbol\ell\times\mathbf B = (10\,\text{A})(2\,\text{m})(-\hat z)\times(2.0\times10^{-5}\,\text{T})\,\hat y = 4.0\times10^{-4}\,\hat x\ \text{N}$$
        Along $+\hat x$: away from wire 1.

        **4. (c)** Between the wires the fields add, so the zero is outside, nearer the weaker wire ($x > 0.2$ m):
        $$\frac{20}{x} = \frac{10}{x - 0.2} \quad\Rightarrow\quad 20x - 4 = 10x \quad\Rightarrow\quad x = 0.4\ \text{m}$$

        **5. Check.** Opposite currents repel, and (b) points away. ✓ At $x = 0.4$ m: $20/0.4 = 50$ and $10/0.2 = 50$, opposite signs. ✓ Units: $(\text{T·m/A})(\text{A/m}) = \text{T}$; $\text{A·m·T} = \text{N}$. ✓

        !!mistake Common mistakes
          - $\mathbf R$ backwards. It runs **from the source to the field point**; reversing it flips $\mathbf B$.
          - Treating $\hat\phi$ as a fixed direction. It depends on where the point is: at $(0, d, 0)$ around a $+\hat z$ current, $\hat\phi = -\hat x$. Use $\hat\phi = \hat I\times\hat r$.
          - "Like currents repel." They **attract**.
          - Using $\mu_0I/2\pi r$ for a short segment or a loop. It is only for a long straight wire.
          - Loop center $\mu_0I/2a$ written with a $\pi$, or the far field with $1/z^2$.
          - Forgetting that $q < 0$ reverses the force, or computing $\mathbf B\times\mathbf v$.
          - cm left unconverted: $r = 5$ cm is $0.05$ m.

        ### Check questions
      `),
      Q(md`Two parallel wires lie in the $xy$-plane and carry currents $I_1 > 0$ and $I_2 > 0$, pointing in the same direction. The wires…`,
        ['experience an attractive force', 'experience a repulsive force', 'experience a force in the $z$ direction', 'experience no force between them'], 0,
        [null, 'Repulsion is for antiparallel currents.', 'Each wire\'s field at the other is along $\\pm\\hat z$; the force $I\\,d\\mathbf l\\times\\mathbf B$ is then in the plane, toward the other wire.', 'Each wire carries current across the other\'s field, so each feels $\\mu_0I_1I_2/2\\pi d$ per meter.'],
        md`Wire 2's field at wire 1 is perpendicular to the plane; $I_1\,d\mathbf l\times\mathbf B_2$ then points in the plane, toward wire 2. Parallel currents attract. (Spring 2018, 1(i).)`, { src: 'Spring 2018 Exam 2' }),
      Q(md`A proton circles in a uniform $\mathbf B$. After 10 revolutions its speed is…`,
        ['the same as at the start', 'larger: $\\mathbf B$ accelerates it', 'smaller: the force slows it down', 'zero: the force eventually stops it'], 0,
        [null, 'The force is perpendicular to the velocity: it changes the direction, not the speed.', 'A force perpendicular to $\\mathbf v$ does no work, so it cannot remove kinetic energy.', 'The force never has a part along $\\mathbf v$, so nothing can bring the proton to rest.'],
        md`$\mathbf F\cdot\mathbf v = q(\mathbf v\times\mathbf B)\cdot\mathbf v = 0$: no work, so constant kinetic energy and constant speed.`),
      Q(md`The field at the center of a circular loop of radius $5$ cm carrying $1$ A is…`,
        ['12.6 µT', '4.0 µT', '6.3 µT', '0.126 µT'], 0,
        [null, 'That is $\\mu_0I/2\\pi a$, the straight-wire formula at $r = a$.', 'That is $\\mu_0I/4a$: half a loop.', 'That leaves $a$ in cm, or misplaces a power of ten.'],
        md`$B = \mu_0I/2a = (4\pi\times10^{-7})(1)/(2\times0.05) = 1.26\times10^{-5}$ T $= 12.6$ µT.`),
      Q(md`A loop in the $xy$-plane carries current **clockwise** seen from $+z$. At its center, $\mathbf B$ points along…`,
        ['$-\\hat z$', '$+\\hat z$', 'the plane of the loop', 'nowhere: the elements cancel at the center'], 0,
        [null, 'Counterclockwise from $+z$ gives $+\\hat z$; clockwise reverses it.', 'Every element\'s $d\\mathbf l\\times\\hat R$ at the center points perpendicular to the plane.', 'All elements give $d\\mathbf B$ the same way at the center; nothing cancels.'],
        md`Fingers clockwise (seen from above), thumb points down: $-\hat z$.`),
      Q(md`A charge moves **along** a uniform $\mathbf B$. The magnetic force on it is…`,
        ['zero', 'maximal, $qvB$', 'along $\\mathbf B$', 'opposite to $\\mathbf v$'], 0,
        [null, 'Maximal is for $\\mathbf v\\perp\\mathbf B$.', 'The magnetic force is always perpendicular to $\\mathbf B$.', 'That would be a drag force; $q\\mathbf v\\times\\mathbf B$ is never along $\\mathbf v$.'],
        md`$\mathbf v\times\mathbf B = 0$ when $\mathbf v\parallel\mathbf B$ ($\sin0 = 0$).`),
      Q(md`Two long parallel wires carry equal currents $I$ in **opposite** directions, a distance $d$ apart. At the midpoint, $|\mathbf B|$ is…`,
        ['$2\\mu_0I/\\pi d$', '$0$', '$\\mu_0I/\\pi d$', '$\\mu_0I/2\\pi d$'], 0,
        [null, 'Zero is the midpoint of **parallel** currents; antiparallel fields add there.', 'That is one wire\'s field at $d/2$; the other wire adds the same.', 'That is one wire at distance $d$.'],
        md`Each wire gives $\mu_0I/(2\pi\cdot d/2) = \mu_0I/\pi d$, in the same direction: $2\mu_0I/\pi d$.`),
      Q(md`A closed rectangular loop carrying current sits in a **uniform** $\mathbf B$. The net force on it is…`,
        ['zero, since $\\oint d\\mathbf l = 0$', '$IAB$', '$4I\\ell B$, one $I\\ell B$ per side', 'along $\\mathbf B$'], 0,
        [null, '$IAB$ is the size of the torque (for $\\mathbf B$ in the plane), not a force.', 'Opposite sides carry opposite currents, so their forces cancel.', 'Magnetic forces are perpendicular to $\\mathbf B$.'],
        md`$\mathbf F = I\left(\oint d\mathbf l\right)\times\mathbf B = 0$. A nonuniform field (near another wire) can give a net force.`),
      Q(md`The tesla equals…`,
        ['N/(A·m)', 'N/(C·m)', 'A/m', 'Wb·m²'], 0,
        [null, 'From $F = qvB$: T = N/(C·m/s) = N·s/(C·m); missing the seconds.', 'A/m is the unit of $H$ (and of $J_s$).', 'T = Wb/m², not Wb·m².'],
        md`$F = I\ell B$, so $B = F/(I\ell)$: N/(A·m). Equivalently Wb/m².`),
      R(md`
        ### Rapid fire: directions

        **The trick:** write each direction as a cross product of unit vectors, then use the cyclic order $\hat x\to\hat y\to\hat z\to\hat x$ (forward is $+$, backward is $-$). Force: $\hat v\times\hat B$ (reverse for $q < 0$) or $\hat I\times\hat B$. Field of a wire: $\hat I\times\hat r$.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t4_dir', { need: 8 }), { id: 't4-force.r0' }),
      R(md`
        ### Rapid fire: sizes

        **The trick:** $\mu_0/2\pi = 2\times10^{-7}$, so a wire gives $B = 2\times10^{-7}I/r$ and two wires $F/\ell = 2\times10^{-7}I_1I_2/d$. A loop's center is $\mu_0I/2a = 2\pi\times10^{-7}I/a$. Convert cm to m first.
      `),
      Object.assign(G('rf_t4_num', { need: 8 }), { id: 't4-force.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t4_wires', { need: 2 }),
      G('t4_loop', { need: 2 }),
      G('t4_lorentz', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  GENS.rf_t4_dir = () => one([
    // force on a charge
    () => {
      const a = pick(AX), b = pick(AX.filter((k) => k !== a)), sv = pick([1, -1]), sB = pick([1, -1]), e = pick([true, false]);
      const vb = cross(unit(a, sv), unit(b, sB)), F = e ? neg(vb) : vb;
      return MC('Force on a charge', md`${e ? 'An electron' : 'A proton'} moves along $${sgnT(sv)}\hat ${a}$ through $\mathbf B$ along $${sgnT(sB)}\hat ${b}$. The magnetic force points along…`, dirT(F),
        [[dirT(neg(F)), e ? 'That is $\\mathbf v\\times\\mathbf B$; the electron\'s negative charge reverses it.' : 'That is $\\mathbf B\\times\\mathbf v$: the order is $\\mathbf v\\times\\mathbf B$.'],
          [dirT(unit(b, sB)), 'The magnetic force is perpendicular to $\\mathbf B$.'], [dirT(unit(a, -sv)), 'The magnetic force is perpendicular to $\\mathbf v$: it never slows the charge.'], ['$0$', '$\\mathbf v\\perp\\mathbf B$: the force is at its largest.']],
        md`$\hat v\times\hat B = (${sgnT(sv)}\hat ${a})\times(${sgnT(sB)}\hat ${b}) = ${dirT(vb).slice(1, -1)}$${e ? ', reversed for the negative charge' : ''}: ${dirT(F)}.`);
    },
    // force on a wire
    () => {
      const a = pick(AX), b = pick(AX.filter((k) => k !== a)), sI = pick([1, -1]), sB = pick([1, -1]);
      const F = cross(unit(a, sI), unit(b, sB));
      return MC('Force on a wire', md`A straight wire carries current along $${sgnT(sI)}\hat ${a}$ in a uniform $\mathbf B$ along $${sgnT(sB)}\hat ${b}$. The force on it points along…`, dirT(F),
        [[dirT(neg(F)), 'That is $\\mathbf B\\times I\\boldsymbol\\ell$; the order is $I\\boldsymbol\\ell\\times\\mathbf B$.'], [dirT(unit(b, sB)), 'The force is perpendicular to $\\mathbf B$.'], [dirT(unit(a, sI)), 'The force is perpendicular to the wire.'], ['$0$', 'The wire crosses the field, so the force is $I\\ell B$.']],
        md`$\hat I\times\hat B = (${sgnT(sI)}\hat ${a})\times(${sgnT(sB)}\hat ${b}) = ${dirT(F).slice(1, -1)}$.`);
    },
    // field of a long wire at a point
    () => {
      const a = pick(AX), b = pick(AX.filter((k) => k !== a)), sI = pick([1, -1]), sr = pick([1, -1]);
      const Bd = cross(unit(a, sI), unit(b, sr));
      const pt = AX.map((k) => (k === b ? (sr > 0 ? 'd' : '-d') : '0')).join(', ');
      return MC('Field of a wire', md`A long wire on the $${a}$-axis carries current along $${sgnT(sI)}\hat ${a}$. At $(${pt})$, $\mathbf B$ points along…`, dirT(Bd),
        [[dirT(neg(Bd)), 'That is $\\hat r\\times\\hat I$: the order is $\\hat I\\times\\hat r$.'], [dirT(unit(b, sr)), 'That is $\\hat r$, from the wire to the point; $\\mathbf B$ circles the wire, perpendicular to it.'], [dirT(unit(a, sI)), '$\\mathbf B$ of a straight wire has no part along the wire.'], ['$0$', 'Only points on the wire\'s own line get zero.']],
        md`$\hat\phi = \hat I\times\hat r = (${sgnT(sI)}\hat ${a})\times(${sgnT(sr)}\hat ${b}) = ${dirT(Bd).slice(1, -1)}$.`);
    },
    // parallel wires
    () => {
      const same = pick([true, false]), what = pick(['wires', 'beams']);
      const right = same ? 'they attract' : 'they repel';
      return MC('Two currents', what === 'wires'
        ? md`Two long parallel wires carry currents in ${same ? 'the **same** direction' : '**opposite** directions'}. The magnetic force between them: …`
        : md`Two parallel beams of **${pick(['protons', 'electrons'])}** move side by side in ${same ? 'the same direction' : 'opposite directions'} (count only the magnetic force). The magnetic force between them: …`, right,
        [[same ? 'they repel' : 'they attract', same ? 'Parallel currents attract; it is like charges that repel.' : 'Antiparallel currents repel.'], ['no force', 'Each current sits in the other\'s field and crosses it.'], ['a force along the wires', '$I\\,d\\mathbf l\\times\\mathbf B$ is perpendicular to the wire.']],
        md`Currents (of either sign of carrier) in the same direction attract, opposite directions repel. Two beams of the same charge moving together are parallel currents.`);
    },
    // loop: direction of B at its center
    () => {
      const k = pick(AX), ccw = pick([true, false]);
      const plane = { x: 'yz', y: 'xz', z: 'xy' }[k];
      return MC('Field of a loop', md`A loop in the $${plane}$-plane carries current **${ccw ? 'counterclockwise' : 'clockwise'}** seen from $+${k}$. At its center $\mathbf B$ points along…`, ccw ? `$+\\hat ${k}$` : `$-\\hat ${k}$`,
        [[ccw ? `$-\\hat ${k}$` : `$+\\hat ${k}$`, 'Fingers along the current: the thumb gives $\\mathbf B$ through the middle.'], ['the plane of the loop', 'At the center every element gives $d\\mathbf B$ perpendicular to the plane.'], ['$0$: opposite sides cancel', 'Opposite sides carry opposite currents but sit on opposite sides of the center: their fields add.']],
        md`Curl the fingers ${ccw ? 'counterclockwise' : 'clockwise'} as seen from $+${k}$: the thumb points ${ccw ? 'toward' : 'away from'} you, ${ccw ? `$+\\hat ${k}$` : `$-\\hat ${k}$`}.`);
    },
  ]);

  GENS.rf_t4_num = () => one([
    // B of a long wire
    () => {
      const I = pick([1, 2, 5, 10, 20, 50]), rc = pick([1, 2, 4, 5, 10, 20]);
      const B = 2e-7 * I / (rc / 100) * 1e6;
      const o = (x) => `${p(r3(x))} µT`;
      return MC('Field of a wire', md`A long straight wire carries $${I}$ A. $B$ at $${rc}$ cm from it is…`, o(B),
        [[o(B * Math.PI), 'That is $\\mu_0I/2r$, the loop formula; a wire is $\\mu_0I/2\\pi r$.'], [o(B / 100), 'That treats $r$ as ${rc}$ m: convert cm to m.'], [o(B * 2), 'That is $\\mu_0I/\\pi r$: one factor of 2 lost.'], [o(B / (2 * Math.PI)), 'One extra $2\\pi$.']],
        md`$B = \dfrac{\mu_0I}{2\pi r} = (2\times10^{-7})\dfrac{${I}}{${rc / 100}} = ${p(r3(B))}\ \mu\text{T}$.`);
    },
    // loop center
    () => {
      const I = pick([1, 2, 5, 10]), ac = pick([1, 2, 5, 10, 20]);
      const B = 4 * Math.PI * 1e-7 * I / (2 * ac / 100) * 1e6;
      const o = (x) => `${p(r3(x))} µT`;
      return MC('Center of a loop', md`A circular loop of radius $${ac}$ cm carries $${I}$ A. $B$ at its center is…`, o(B),
        [[o(B / Math.PI), 'That is $\\mu_0I/2\\pi a$, the straight-wire formula.'], [o(B * 2), 'That is $\\mu_0I/a$; the center field is $\\mu_0I/2a$.'], [o(B / 100), 'Convert cm to m.'], [o(B / 2), 'That is $\\mu_0I/4a$, half a loop.']],
        md`$B = \dfrac{\mu_0I}{2a} = \dfrac{(4\pi\times10^{-7})(${I})}{2(${ac / 100})} = ${p(r3(B))}\ \mu\text{T}$.`);
    },
    // force between wires
    () => {
      const I1 = pick([1, 2, 5, 10, 20]), I2 = pick([1, 2, 5, 10]), dc = pick([1, 2, 5, 10]);
      const Fl = 2e-7 * I1 * I2 / (dc / 100) * 1e6;
      const o = (x) => `${p(r3(x))} µN/m`;
      return MC('Two wires', md`Two long parallel wires $${dc}$ cm apart carry $${I1}$ A and $${I2}$ A. The force per meter on each is…`, o(Fl),
        [[o(Fl / 100), 'Convert cm to m: $d = ${dc / 100}$ m.'], [o(Fl * Math.PI), 'That uses $\\mu_0/2$ instead of $\\mu_0/2\\pi$.'], [o(Fl / 2), 'That uses $\\mu_0/4\\pi$ instead of $\\mu_0/2\\pi$.'], [o(Fl * 2), 'One factor of 2 too many.']],
        md`$F/\ell = \dfrac{\mu_0I_1I_2}{2\pi d} = (2\times10^{-7})\dfrac{(${I1})(${I2})}{${dc / 100}} = ${p(r3(Fl))}\ \mu\text{N/m}$.`);
    },
    // F = I l B sin(theta)
    () => {
      const I = pick([2, 4, 5, 10]), l = pick([0.5, 1, 2]), B = pick([0.1, 0.2, 0.5]), [th, s, st] = pick([[90, 1, '1'], [30, 0.5, '\\tfrac12'], [0, 0, '0']]);
      const F = I * l * B * s;
      const o = (x) => `${x < 1e-12 ? 0 : p(r3(x))} N`;
      return MC('Force on a wire', md`A straight $${l}$ m wire carries $${I}$ A at $${th}°$ to a uniform $B = ${B}$ T. $|\mathbf F| = $`, o(F),
        [[o(I * l * B * Math.cos(th * Math.PI / 180)), 'That uses $\\cos\\theta$; the cross product gives $\\sin\\theta$.'], [o(th === 90 ? F / 2 : th === 30 ? I * l * B : 2 * I * l * B), th === 90 ? 'At 90° the sine is 1.' : th === 30 ? 'Only the part of $\\mathbf B$ across the wire pushes on it.' : 'A wire along the field feels nothing.'], [o(F === 0 ? I * l * B / 2 : th === 30 ? F / 2 : 2 * F), F === 0 ? 'A wire along the field feels nothing.' : th === 30 ? 'That uses $\\sin^2\\theta$.' : 'One factor of 2 too many.']],
        md`$F = I\ell B\sin\theta = (${I})(${l})(${B})(${st}) = ${F < 1e-12 ? 0 : p(r3(F))}$ N.`);
    },
    // scaling
    () => {
      const [q, r, w] = pick([
        ['You double your distance from a long straight wire. Its field', 'halves', [['quarters', 'A wire\'s field is $\\propto 1/r$, not $1/r^2$.'], ['stays the same', 'That is a sheet; a wire\'s field falls as $1/r$.'], ['drops to 1/8', 'That is a loop\'s far field.']]],
        ['You double your distance along a loop\'s axis, far from the loop. Its field', 'drops to 1/8', [['halves', 'That is a straight wire.'], ['quarters', 'The far field of a loop is $\\propto 1/z^3$.'], ['stays the same', 'That is an infinite sheet.']]],
        ['You double a loop\'s radius, same current. The field at its center', 'halves', [['doubles', 'The center field is $\\mu_0I/2a$: bigger loop, weaker center.'], ['quarters', 'Only one power of $a$.'], ['stays the same', '$a$ appears in $\\mu_0I/2a$.']]],
        ['You double both wire currents and the spacing between the two wires. The force per meter', 'doubles', [['quadruples', 'The doubled spacing halves it again.'], ['stays the same', '$I_1I_2$ grows by 4, $d$ by 2.'], ['halves', '$F/\\ell \\propto I_1I_2/d$: $4/2 = 2$.']]],
        ['You double the speed of a charge moving across a uniform $\\mathbf B$. The magnetic force on it', 'doubles', [['quadruples', '$F = qvB$ is linear in $v$.'], ['stays the same', 'The force is proportional to $v$.'], ['drops to zero', 'Only motion along $\\mathbf B$ gives zero.']]],
      ]);
      return MC('Scaling', md`${q}…`, r, w, md`Wire $\propto I/r$; loop center $\propto I/a$; loop far field $\propto Ia^2/z^3$; wires $F/\ell \propto I_1I_2/d$; charge $F \propto qvB$.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // B_y on the x-axis from wires along z at x0 with signed current I (+ for +z)
  const byWire = (I, x0, x) => 2e-7 * I / (x - x0);

  GENS.t4_wires = () => {
    let I1, I2, d, fx, B;
    do {
      I1 = pick([5, 10, 15, 20, 30]); I2 = pick([-20, -10, -5, 5, 10, 20]); d = pick([0.1, 0.2, 0.3, 0.5]); fx = pick([0.25, 0.5, 0.75, -0.5, 1.5, 2]);
      B = byWire(I1, 0, fx * d) + byWire(I2, d, fx * d);
    } while (Math.abs(B) < 1e-7);
    const xP = fx * d;
    const Fl = -2e-7 * I1 * I2 / d;                    // F_x per meter on wire 2 (negative: toward wire 1)
    const attract = I1 * I2 > 0;
    const dir2 = I2 > 0 ? '+\\hat z' : '-\\hat z';
    return {
      title: 'Two parallel wires',
      q: md`A long wire on the $z$-axis carries $I_1 = ${I1}$ A along $+\hat z$. A parallel wire through $(${d}\,\text{m}, 0, 0)$ carries $${Math.abs(I2)}$ A along $${dir2}$. Find $B_y$ at $P = (${p(xP)}\,\text{m}, 0, 0)$, the size of the force per meter on wire 2, and its direction.`,
      parts: [
        N('B_y(P)', B * 1e6, 'µT'),
        N('|F|/\\ell\\ \\text{on wire 2}', Math.abs(Fl) * 1e6, 'µN/m'),
        { lbl: 'Wire 2 is pushed', mc: ['toward wire 1 ($-\\hat x$)', 'away from wire 1 ($+\\hat x$)'], a: attract ? 0 : 1, fixed: true, why: attract ? [null, 'The currents are parallel: they attract.'] : ['The currents are antiparallel: they repel.', null] },
      ],
      hints: ['On the $x$-axis a wire at $x_0$ with current $I$ along $+\\hat z$ gives $B_y = \\dfrac{\\mu_0}{2\\pi}\\dfrac{I}{x - x_0}$ (signs included; $I < 0$ for $-\\hat z$).', 'Force: $I_2\\boldsymbol\\ell\\times\\mathbf B_1$ with $B_1 = \\mu_0I_1/2\\pi d$ at wire 2. Parallel currents attract.'],
      sol: sol({
        eq: md`$B_y = \dfrac{\mu_0}{2\pi}\dfrac{I}{x - x_0}$ for each wire (from $\hat\phi = \hat z\times\text{sgn}(x - x_0)\hat x$); $\;\dfrac{F}{\ell} = \dfrac{\mu_0I_1I_2}{2\pi d}$.`,
        sym: md`$B_y(P) = \dfrac{\mu_0}{2\pi}\left[\dfrac{I_1}{x_P} + \dfrac{I_2}{x_P - d}\right]$ with $I_2 = ${I2}$ A (signed).`,
        sub: md`$$B_y = (2\times10^{-7})\left[\frac{${I1}}{${p(xP)}} + \frac{${I2}}{${p(xP - d)}}\right] = ${f(B * 1e6)}\ \mu\text{T}, \qquad \frac{F}{\ell} = (2\times10^{-7})\frac{(${I1})(${Math.abs(I2)})}{${d}} = ${f(Math.abs(Fl) * 1e6)}\ \mu\text{N/m}$$`,
        ans: md`$B_y(P) = ${f(B * 1e6)}$ µT; $|F|/\ell = ${f(Math.abs(Fl) * 1e6)}$ µN/m, ${attract ? 'toward wire 1 (attract)' : 'away from wire 1 (repel)'}.`,
        check: md`The currents are ${attract ? 'parallel, so they attract' : 'antiparallel, so they repel'}. ✓ ${xP > 0 && xP < d ? (attract ? 'Between parallel wires the fields oppose.' : 'Between antiparallel wires the fields add.') : 'Outside the pair, the nearer wire dominates.'}`,
      }),
    };
  };

  GENS.t4_loop = () => {
    const I = pick([1, 2, 5, 10]), ac = pick([2, 5, 10, 20]), zr = pick([0.5, 1, 2, 3]), ccw = pick([true, false]);
    const a = ac / 100, z = zr * a, s = ccw ? 1 : -1;
    const B0 = 4 * Math.PI * 1e-7 * I / (2 * a);
    const Bz = s * 4 * Math.PI * 1e-7 * I * a * a / (2 * Math.pow(a * a + z * z, 1.5));
    return {
      title: 'A loop and its axis',
      q: md`A circular loop of radius $a = ${ac}$ cm in the $xy$-plane, centered at the origin, carries $${I}$ A ${ccw ? 'counterclockwise' : 'clockwise'} seen from $+z$. Find $B_z$ at the center, $B_z$ at $(0, 0, ${p(z * 100)}\,\text{cm})$, and the height $z > 0$ at which $|B|$ is $1/8$ of its center value.`,
      parts: [
        N('B_z(0)', s * B0 * 1e6, 'µT'),
        N(`B_z(z = ${p(z * 100)}\\ \\text{cm})`, Bz * 1e6, 'µT'),
        N('z_{1/8}', Math.sqrt(3) * ac, 'cm'),
      ],
      hints: [`RHR: ${ccw ? 'counterclockwise' : 'clockwise'} from $+z$ puts $\\mathbf B$ along $${ccw ? '+' : '-'}\\hat z$ through the middle.`, '$B_z = \\dfrac{\\mu_0Ia^2}{2(a^2 + z^2)^{3/2}}$; at $z = 0$ this is $\\mu_0I/2a$. For the last part set $(a^2 + z^2)^{3/2} = 8a^3$.'],
      sol: sol({
        eq: md`$B_z = \pm\dfrac{\mu_0Ia^2}{2(a^2 + z^2)^{3/2}}$ (Biot–Savart, sideways parts cancel), sign by the RHR.`,
        sym: md`Center: $\mu_0I/2a$. Ratio to the center: $\left(\dfrac{a^2}{a^2 + z^2}\right)^{3/2}$; it equals $1/8$ when $a^2 + z^2 = 4a^2$, $z = \sqrt3\,a$.`,
        sub: md`$$B_z(0) = ${ccw ? '' : '-'}\frac{(4\pi\times10^{-7})(${I})}{2(${a})} = ${f(s * B0 * 1e6)}\ \mu\text{T}, \qquad B_z(${p(z)}\,\text{m}) = ${ccw ? '' : '-'}\frac{(4\pi\times10^{-7})(${I})(${a})^2}{2\left((${a})^2 + (${p(z)})^2\right)^{3/2}} = ${f(Bz * 1e6)}\ \mu\text{T}$$`,
        ans: md`$B_z(0) = ${f(s * B0 * 1e6)}$ µT, $B_z = ${f(Bz * 1e6)}$ µT at $z = ${p(z * 100)}$ cm, $z_{1/8} = \sqrt3\,a = ${f(Math.sqrt(3) * ac)}$ cm.`,
        check: md`The axial field is largest at the center and has the same sign all along the axis. Far away ($z\gg a$) it approaches $\mu_0Ia^2/2z^3$.`,
      }),
    };
  };

  GENS.t4_lorentz = () => {
    const e = pick([true, false]), E0 = pick([1, 2, 5, 10]) * 1e3, B0 = pick([0.01, 0.02, 0.05, 0.1]), s = pick([1, -1]);
    const vs = E0 / B0;                                     // selector speed
    const v0 = pick([0.5, 2, 3]) * vs;
    const q = e ? -1.602e-19 : 1.602e-19;
    const Ey = s * E0, Bz = s * B0;
    const Fy = q * (Ey - v0 * Bz);                         // v x B = v0 x x Bz z = -v0 Bz y
    return {
      title: 'Crossed E and B',
      q: md`${e ? 'An electron' : 'A proton'} moves with $\mathbf v = ${p(v0)}\,\hat x$ m/s through $\mathbf E = ${s > 0 ? '' : '-'}${p(E0)}\,\hat y$ V/m and $\mathbf B = ${s > 0 ? '' : '-'}${B0}\,\hat z$ T. Find the force $F_y$ on it now, and the speed along $\hat x$ at which it would pass straight through. Then: with $\mathbf E$ switched off, what happens to its speed?`,
      parts: [
        N('F_y', Fy, 'N'),
        N('v_{\\text{straight}}', vs, 'm/s'),
        { lbl: 'With only $\\mathbf B$, its speed', mc: ['stays the same', 'increases', 'decreases'], a: 0, fixed: true, why: [null, 'The magnetic force is perpendicular to $\\mathbf v$ and does no work.', 'The magnetic force is perpendicular to $\\mathbf v$ and does no work.'] },
      ],
      hints: ['$\\mathbf v\\times\\mathbf B = v_xB_z\\,(\\hat x\\times\\hat z) = -v_xB_z\\hat y$.', 'Straight through means $E_y - v_xB_z = 0$, so $v = E/B$, for either sign of charge.'],
      sol: sol({
        eq: md`$\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B)$, with $\hat x\times\hat z = -\hat y$.`,
        sym: md`$F_y = q(E_y - v_xB_z)$; zero when $v_x = E_y/B_z = E_0/B_0$.`,
        sub: md`$$F_y = (${e ? '-' : ''}1.602\times10^{-19}\,\text{C})\left[(${p(Ey)}\,\text{V/m}) - (${p(v0)}\,\text{m/s})(${p(Bz)}\,\text{T})\right] = ${f(Fy)}\ \text{N}, \qquad v = \frac{${p(E0)}}{${B0}} = ${f(vs)}\ \text{m/s}$$`,
        ans: md`$F_y = ${f(Fy)}$ N; $v_{\text{straight}} = ${f(vs)}$ m/s; with $\mathbf E$ off the speed stays the same (the path bends into a circle).`,
        check: md`${v0 > vs ? 'Faster than $E/B$: the magnetic term wins' : 'Slower than $E/B$: the electric term wins'}, so $F_y$ has the sign of $${v0 > vs ? '-qB_z' : 'qE_y'}$. ✓ The selector speed $E/B$ does not depend on the charge or the mass.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t4-force'] = [
    Q(md`A charge at **rest** in a strong magnetic field feels a magnetic force of…`,
      ['zero', '$qB$', '$qcB$', 'it depends on the field\'s direction'], 0,
      [null, '$qB$ does not even have units of force; the force needs a velocity.', 'The force uses the charge\'s own velocity, here zero.', 'With $\\mathbf v = 0$, $\\mathbf v\\times\\mathbf B = 0$ for any direction.'],
      md`$\mathbf F_m = q\mathbf v\times\mathbf B = 0$ for $\mathbf v = 0$. Only an electric field pushes a charge at rest.`),
    Q(md`A proton enters a uniform $\mathbf B$ with its velocity at $45°$ to the field. Its path is…`,
      ['a helix along $\\mathbf B$', 'a circle', 'a straight line', 'a parabola'], 0,
      [null, 'The part of $\\mathbf v$ along $\\mathbf B$ feels no force and keeps carrying the proton along the field.', 'The part of $\\mathbf v$ across $\\mathbf B$ is turned in a circle.', 'Parabolas come from a constant force (a uniform $\\mathbf E$).'],
      md`Split $\mathbf v$: the part across $\mathbf B$ circles, the part along $\mathbf B$ drifts unchanged. Together: a helix.`),
    Q(md`What are the base SI units of the tesla?`,
      ['kg/(A·s²)', 'kg·m/(A·s)', 'A/m', 'kg/(C·s²)'], 0,
      [null, 'T = N/(A·m) = (kg·m/s²)/(A·m): the meters cancel.', 'A/m is the unit of $H$.', 'With coulombs it would be kg/(C·s): T = N·s/(C·m).'],
      md`$\text{T} = \dfrac{\text{N}}{\text{A·m}} = \dfrac{\text{kg·m/s}^2}{\text{A·m}} = \dfrac{\text{kg}}{\text{A·s}^2}$.`),
    Q(md`At a point **on the line** of a long straight wire's extension, beyond its end, the field from that straight wire is…`,
      ['zero', '$\\mu_0I/2\\pi r$', 'infinite', 'along the wire'], 0,
      [null, 'That needs a perpendicular distance $r$; here every element points straight at the point.', 'Only on the wire itself does the line-current model blow up.', 'Biot–Savart never gives $d\\mathbf B$ along $d\\mathbf l$.'],
      md`Every element has $d\mathbf l\parallel\mathbf R$, so $d\mathbf l\times\hat R = 0$.`),
    Q(md`A semicircle of radius $a$ carries $I$, fed by two straight leads that point radially toward its center. $B$ at the center is…`,
      ['$\\mu_0I/4a$', '$\\mu_0I/2a$', '$\\mu_0I/4a + \\mu_0I/2\\pi a$', '$\\mu_0I/\\pi a$'], 0,
      [null, 'That is a full loop.', 'That is the hairpin: two straight leads tangent to the arc add $\\mu_0I/4\\pi a$ each. Radial leads point straight at the center and add nothing.', 'That treats the two leads as long wires a distance $a$ away, $2\\times\\mu_0I/2\\pi a$; they point at the center and add nothing.'],
      md`Each arc element gives the same $d\mathbf B$ at the center, so half a loop gives half of $\mu_0I/2a$. Radial leads have $d\mathbf l\parallel\mathbf R$: zero.`),
    Q(md`Biot–Savart: the vector $\mathbf R$ in $d\mathbf B = \frac{\mu_0}{4\pi}\frac{I\,d\mathbf l\times\hat R}{R^2}$ points…`,
      ['from the current element to the field point', 'from the field point to the current element', 'along the current', 'perpendicular to both'], 0,
      [null, 'That reverses every field direction.', 'That is $d\\mathbf l$.', '$d\\mathbf B$ is perpendicular to both $d\\mathbf l$ and $\\mathbf R$; $\\mathbf R$ itself is the separation.'],
      md`Source to field point, as in Coulomb's law.`),
    Q(md`A finite straight segment of length $2L$ carries $I$. At distance $r$ from its midpoint, perpendicular to it, $B$ is…`,
      ['less than $\\mu_0I/2\\pi r$', 'exactly $\\mu_0I/2\\pi r$', 'more than $\\mu_0I/2\\pi r$', 'zero'], 0,
      [null, 'That is the infinite wire; the missing ends would have added more.', 'Every element of an infinite wire adds in the same direction; removing some can only reduce the sum.', 'All elements give $d\\mathbf B$ the same way; it is not zero.'],
      md`The infinite wire's elements all push along $\hat\phi$. A segment has fewer of them: $B = \dfrac{\mu_0I}{2\pi r}\dfrac{L}{\sqrt{L^2 + r^2}}$.`),
    Q(md`A square loop lies beside a long straight wire, in the same plane, with its near side parallel to the wire. The near side's current is parallel to the wire's. The net force on the loop…`,
      ['pulls it toward the wire', 'pushes it away from the wire', 'is zero, since the loop is closed', 'is perpendicular to the plane'], 0,
      [null, 'The near side attracts more strongly than the far (antiparallel) side repels.', 'A closed loop feels no net force only in a **uniform** field; this one falls off as $1/r$.', 'All forces lie in the plane, perpendicular to the wires.'],
      md`Near side: parallel, attracts, strong field. Far side: antiparallel, repels, weaker field. The two side pieces cancel each other. Net: toward the wire.`),
    Q(md`Two long parallel wires carry equal currents in the **same** direction. At the midpoint between them, $\mathbf B$ is…`,
      ['zero', 'twice one wire\'s field', 'along the wires', 'pointing toward one wire'], 0,
      [null, 'That is the antiparallel case.', 'Neither wire\'s field has a part along the wires.', 'A line current\'s field circles it; it never points toward a wire.'],
      md`At the midpoint the two $\hat\phi$s point opposite ways with equal size: they cancel.`),
    Q(md`Two wires 1 m apart, each carrying 1 A. The force per meter between them is…`,
      ['$2\\times10^{-7}$ N/m', '$4\\pi\\times10^{-7}$ N/m', '$10^{-7}$ N/m', '$1$ N/m'], 0,
      [null, 'That is $\\mu_0$ itself; the formula divides by $2\\pi$.', 'That is $\\mu_0/4\\pi$; the parallel-wire force is $\\mu_0/2\\pi$.', 'Magnetic forces between ordinary currents are tiny.'],
      md`$F/\ell = \mu_0I_1I_2/2\pi d = 2\times10^{-7}$ N/m: the old definition of the ampere.`),
    Q(md`On a loop's axis, where is $|B|$ largest?`,
      ['at the center of the loop', 'at $z = a$', 'far away', 'it is the same everywhere on the axis'], 0,
      [null, '$B_z(a)$ is $1/2^{3/2} \\approx 0.35$ of the center value.', 'It falls as $1/z^3$ far away.', '$(a^2 + z^2)^{-3/2}$ is largest at $z = 0$.'],
      md`$B_z\propto(a^2 + z^2)^{-3/2}$, maximal at $z = 0$: $\mu_0I/2a$.`),
    Q(md`Far from a loop, compared with a long wire carrying the same current, the loop's field falls off…`,
      ['faster: $1/z^3$ versus $1/r$', 'slower: $1/z$ versus $1/r^2$', 'the same way, as $1/r$', 'faster: $1/z^2$ versus $1/r$'], 0,
      [null, 'A wire falls as $1/r$, the slowest of all.', 'A loop is a dipole: its opposite sides nearly cancel far away.', 'The loop field is $\\mu_0Ia^2/2z^3$.'],
      md`Seen from far away, the two sides of a loop carry opposite currents almost on top of each other; what is left is a dipole field, $\propto1/z^3$.`),
    Q(md`Two coaxial loops carry currents in the **same** direction (both counterclockwise seen from above), one above the other. They…`,
      ['attract', 'repel', 'feel no force', 'twist to face each other'], 0,
      [null, 'Opposite circulations repel.', 'Each loop is in the other\'s nonuniform field.', 'They already face each other along a common axis.'],
      md`Nearby pieces of the two loops carry parallel currents, so they attract, like two parallel wires.`),
    Q(md`A wire carrying $5$ A runs at $30°$ to a uniform $0.4$ T field. The force per meter is…`,
      ['1 N/m', '1.73 N/m', '2 N/m', '0.5 N/m'], 0,
      [null, 'That uses $\\cos30°$; the cross product gives $\\sin\\theta$.', 'That ignores the angle.', 'A factor of 2 too small.'],
      md`$F/\ell = IB\sin\theta = (5)(0.4)(0.5) = 1$ N/m.`),
    Q(md`Halving the distance between two long parallel wires (same currents) makes the force between them…`,
      ['double', 'quadruple', 'halve', 'stay the same'], 0,
      [null, 'That would be $1/d^2$; the wire field is $1/d$.', 'Closer wires push harder.', '$F/\\ell \\propto 1/d$.'],
      md`$F/\ell = \mu_0I_1I_2/2\pi d$.`),
    Q(md`Which current element makes **no** field at point $P$?`,
      ['one that points straight at $P$', 'one that is perpendicular to the line to $P$', 'one far from $P$', 'one carrying a small current'], 0,
      [null, 'That one gives the largest $|d\\mathbf B|$ for its distance.', 'A far element gives a small but nonzero field.', 'A small current gives a small but nonzero field.'],
      md`$d\mathbf l\times\hat R = 0$ when $d\mathbf l\parallel\hat R$.`),
    Q(md`An electron and a proton move side by side at the same velocity across the same uniform $\mathbf B$. The magnetic forces on them are…`,
      ['equal in size and opposite in direction', 'equal and in the same direction', 'larger on the proton, since it is heavier', 'zero, since their charges cancel'], 0,
      [null, 'The force is $q\\mathbf v\\times\\mathbf B$: opposite $q$, opposite force.', 'Mass changes how much each one accelerates, not the force.', 'Each feels its own force; they are separate particles.'],
      md`$|q|$ is the same, the sign is opposite. (The electron accelerates about 1836 times more.)`),
    Q(md`A long wire on the $z$-axis carries current along $+\hat z$. A charge $q > 0$ at $(r, 0, 0)$ moves along $+\hat z$, parallel to the current. The magnetic force on it points…`,
      ['toward the wire ($-\\hat x$)', 'away from the wire ($+\\hat x$)', 'along $+\\hat z$', 'zero, since it moves parallel to the wire'], 0,
      [null, 'A positive charge moving with the current is a parallel current: it is attracted.', 'The magnetic force is perpendicular to the velocity.', 'It moves across $\\mathbf B$ (which is along $\\hat y$ there), so it feels a force.'],
      md`$\mathbf B = B\hat y$ at $(r, 0, 0)$. $\hat z\times\hat y = -\hat x$: toward the wire.`),
  ];
})();

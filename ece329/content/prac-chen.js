/* Two practice exams in Prof. Xu Chen's format (unit e2-prac; loaded before practice.js, so they list first).
   Chen wrote the Fall 2026 Exam 1: four problems of 21–30 points cut into short parts of 5–8 points, boxed symbolic
   answers with units, clean closed-form fields, one trap part, limits that check themselves. These papers keep that
   skeleton and move each problem to Exam 2 material.
   prac-chen-a: a given H (div B, J = curl H, flux, Ampère on a triangle, Faraday); a slab with a |x| current profile;
                two magnetic materials; a coax with two magnetic layers (trap: the outer conductor's current).
   prac-chen-b: a plane wave E(z,t) (H by Faraday, displacement current and epsilon, eta, Poynting); a wire with a
                parabolic current profile; two magnetic materials with a current sheet; a toroid with a two-layer core
                (trap: a loop around the outside of the toroid).
   Symbolic answers use expression boxes (checked by evaluating at random values); every answer was derived by hand
   and re-derived in sympy. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;

  // ---------------------------------------------------------------- helpers
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  // sampling ranges for the symbolic boxes (any positive values work; b > c > a keeps the logs readable)
  const VR = {
    H0: [0.5, 3], mu0: [0.5, 2], x: [0.2, 2], y: [0.2, 2], omega: [1, 10], t: [0.1, 3], J0: [0.5, 3],
    a: [0.2, 0.6], c: [0.7, 1.1], b: [1.2, 3], r: [0.3, 2], I: [0.5, 5], I0: [0.5, 5], mu1: [0.5, 5], mu2: [0.5, 5],
    N: [10, 500], h1: [0.2, 1], h2: [0.2, 1], E0: [1, 10], beta: [0.5, 5], z: [-2, 2],
  };
  const ex = (lbl, expr, names) => ({ lbl, expr, vars: Object.fromEntries(names.map((n) => [n, VR[n]])) });
  const plot = (o) => PF.plot(Object.assign({ w: 330, h: 190 }, o));

  // ======================================================================================== EXAM A: figures
  // A1: the triangle T in the xy-plane, seen from +z
  function figA1() {
    const g = PF.fig({ alt: 'the xy-plane seen from +z: a shaded triangle with corners O at the origin, P at (1, 0) and Q at (1, 1); its edge C runs O to P to Q and back to O, counterclockwise; dS points out of the page' });
    const X = (x) => 40 + 150 * x, Y = (y) => 190 - 150 * y;
    g.arrow(X(0), Y(0), X(1.4), Y(0), { cls: 'dim', hs: 6 }); g.label(X(1.4) + 4, Y(0), 'x', 'l', 'small accent');
    g.arrow(X(0), Y(0), X(0), Y(1.3), { cls: 'dim', hs: 6 }); g.label(X(0) + 4, Y(1.3), 'y', 'bl', 'small accent');
    g.poly([[X(0), Y(0)], [X(1), Y(0)], [X(1), Y(1)]], { cls: 'shade nodecl' });
    g.line(X(0), Y(0), X(1), Y(0), { cls: 'thick', mid: true, hs: 8 });
    g.line(X(1), Y(0), X(1), Y(1), { cls: 'thick', mid: true, hs: 8 });
    g.line(X(1), Y(1), X(0), Y(0), { cls: 'thick', mid: true, hs: 8 });
    g.odot(X(0.7), Y(0.27), 6); g.label(X(0.7) - 10, Y(0.27), 'd\\mathbf S', 'r', 'small');
    g.tag(X(0), Y(0), 'O', 'bl', 8); g.tag(X(1), Y(0), 'P', 'br', 8); g.tag(X(1), Y(1), 'Q', 'tr', 8);
    g.label(X(1) + 12, Y(0.5), 'C', 'l');
    return g.svg();
  }
  // A2: the current profile J_z(x), and H_y(x) for the solution
  const plotA2J = () => plot({
    x: [-2, 2], y: [0, 1.3], xl: 'x', yl: 'J_z', xt: [[-1, '-a'], [1, 'a']], yt: [[1, 'J_0']],
    curves: [{ pts: [[-2, 0], [-1, 0], [-1, 1], [0, 0], [1, 1], [1, 0], [2, 0]] }],
  });
  const plotA2H = () => plot({
    x: [-2.2, 2.2], y: [-0.7, 0.7], zero: true, xl: 'x', yl: 'H_y', xt: [[-1, '-a'], [1, 'a']],
    yt: [[-0.5, '-\\tfrac12J_0a'], [0.5, '\\tfrac12J_0a']],
    curves: [{ f: (x) => (Math.abs(x) < 1 ? x * Math.abs(x) / 2 : Math.sign(x) / 2) }],
  });
  // A3: the interface z = 0
  function figA3() {
    const g = PF.fig({ alt: 'side view: the plane z = 0 is horizontal; region 1 above it has mu1 = 3 mu0; region 2 below it, shaded, has mu2 = 6 mu0; the normal n = z-hat points up, from region 2 into region 1' });
    g.rect(20, 90, 270, 60, { cls: 'shade' });
    g.line(20, 90, 290, 90, { cls: 'thick' });
    g.label(120, 55, '\\text{region 1: } \\mu_1 = 3\\mu_0', 'c', 'small');
    g.label(120, 122, '\\text{region 2: } \\mu_2 = 6\\mu_0', 'c', 'small');
    g.arrow(262, 90, 262, 48, { hs: 7 }); g.label(268, 50, '\\hat n = \\hat z', 'l', 'small');
    g.label(294, 90, 'z = 0', 'l', 'small');
    return g.svg();
  }
  // A4: coax cross-section with two layers
  function figA4() {
    const g = PF.fig({ alt: 'cross-section of the coax: an inner conductor of radius a carrying current out of the page; a shaded layer mu1 from a to c; a layer mu2 from c to b; a thin outer conductor at b' });
    const cx = 120, cy = 120, ra = 18, rc = 52, rb = 94;
    g.circle(cx, cy, rb, { cls: 'thick' });
    g.circle(cx, cy, rc, { cls: 'shade' }); g.circle(cx, cy, rc, { cls: 'dim' });
    g.circle(cx, cy, ra, { cls: 'bgfill' }); g.circle(cx, cy, ra); g.odot(cx, cy, 6);
    g.label(cx + 8, cy - 8, 'I', 'bl', 'small');
    g.line(cx, cy + 8, cx, cy + rb, { cls: 'dim thin' });
    for (const [r, l] of [[ra, 'a'], [rc, 'c'], [rb, 'b']]) { g.line(cx - 4, cy + r, cx + 4, cy + r, { cls: 'dim' }); g.label(cx + 7, cy + r, l, 'l', 'small'); }
    const s = Math.SQRT1_2;
    g.label(cx - 35 * s, cy - 35 * s, '\\mu_1', 'c', 'small');
    g.label(cx - 73 * s, cy - 73 * s, '\\mu_2', 'c', 'small');
    return g.svg();
  }

  // ======================================================================================== EXAM A
  const examA = [
    R(md`
      **75 minutes, 100 points, four problems.** Closed book. One 4″×6″ index card of your own handwritten notes. No calculator: every answer is a symbol or a clean number. Box each answer and give its units.

      **Why this format.** Prof. Xu Chen wrote this semester's Exam 1 and is likely to write Exam 2. His Exam 1 had four problems of 21–30 points, each cut into short parts of 5–8 points: a given field worked by hand with vector calculus, a slab with a density proportional to $|x|$, a boundary between two materials, and a coax with two layers. Answers were symbols in the given parameters, the fields were clean polynomials, limits checked the results, and one part was a trap that tested a concept rather than algebra. This paper keeps that skeleton and moves each problem to Exam 2 material. It has no waves or displacement current: [Exam B](#/l/prac-chen-b) covers those, with new situations.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | A given $\mathbf H$: $\nabla\cdot\mathbf B$, $\mathbf J = \nabla\times\mathbf H$, flux, Ampère around a triangle, then Faraday | 25 |
      | 2 | A current slab with a $|x|$ profile: current per width, $\mathbf H$ by Ampère, flux per length | 21 |
      | 3 | Two magnetic materials: $\mathbf H$, $\mathbf B$ and $\mathbf M$ on both sides | 24 |
      | 4 | A coax with two magnetic layers: $\mathbf H$, $\mathbf B$, the return current, flux and inductance per length | 30 |

      **Draws on:** [Ampère's law](#/l/t5-ampere), [sheets and slabs](#/l/t6-sheets), [flux and ∇·B](#/l/t7-flux), [Faraday's law](#/l/t8-faraday), [inductance](#/l/t11-inductance), [magnetic materials](#/l/t13-materials), and [curl and divergence](#/l/u0-curl-div).

      **Entering answers.** Symbolic boxes take expressions in the variables listed under each box, such as <code>mu1*I/(2*pi*r)</code> or <code>ln(b/a)</code>; type <code>mu0</code> for $\mu_0$ and <code>omega</code> for $\omega$. The unit is in each label. Work on paper under time first, then enter your answers.
    `),

    // ---------------------------------------------------------------- Problem 1
    RF(md`
      ### Problem 1 (25 points): a given magnetic field

      In a nonmagnetic region ($\mu = \mu_0$), a static magnetic field is
      $$\mathbf H = H_0\left(-y^2\,\hat x + x^2\,\hat y + xy\,\hat z\right)\ \text{A/m}$$
      with $x, y, z$ in meters and $H_0$ a constant in A/m³. $T$ is the triangle in the plane $z = 0$ with corners $O = (0,0,0)$, $P = (1,0,0)$ and $Q = (1,1,0)$ m. Its edge $C$ runs $O\to P\to Q\to O$, counterclockwise seen from $+z$, so $d\mathbf S = +\hat z\,dS$ on $T$. Express answers in terms of $H_0$, $\mu_0$, $\omega$, $t$, $x$ and $y$ as needed.

      [[fig:tri]]
    `, { tri: { svg: figA1(), cap: 'Seen from +z. C runs O → P → Q → O, counterclockwise, so the RHR puts dS out of the page, along +z.' } }),
    P({ src: 'Chen style A #1(a) · 5 pts', title: 'Is it a magnetic field?',
      q: md`**(a) (5 pts)** Find $\nabla\cdot\mathbf B$. Can this $\mathbf H$ be a magnetostatic field?`,
      parts: [mc('', [md`$\nabla\cdot\mathbf B = 0$: yes`, md`$\nabla\cdot\mathbf B = 2\mu_0H_0(x - y)$: no`, md`$\nabla\cdot\mathbf B = \mu_0H_0(x + y)$: no`, md`$\nabla\cdot\mathbf B = 0$, but it cannot be static because $\nabla\times\mathbf H \ne 0$`], 0,
        [null, md`That is $\partial H_x/\partial y + \partial H_y/\partial x$: each component differentiated along the wrong axis. The divergence takes $\partial H_x/\partial x$, and $H_x = -y^2$ has no $x$ in it.`,
          md`That differentiates $H_z = xy$ along $x$ and $y$. Only $\partial H_z/\partial z$ enters the divergence, and $H_z$ has no $z$ in it.`,
          md`A nonzero curl is allowed: it says current flows there, $\mathbf J = \nabla\times\mathbf H$ (part b). A static field needs $\nabla\cdot\mathbf B = 0$, and its source needs $\nabla\cdot\mathbf J = 0$.`])],
      hints: [md`In free space $\mathbf B = \mu_0\mathbf H$, and $\nabla\cdot\mathbf B = \mu_0\left(\dfrac{\partial H_x}{\partial x} + \dfrac{\partial H_y}{\partial y} + \dfrac{\partial H_z}{\partial z}\right)$: each component along its own axis.`],
      sol: md`
        **1. Law.** Every magnetic field has $\nabla\cdot\mathbf B = 0$: there is no magnetic charge. In free space $\mathbf B = \mu_0\mathbf H$.

        **2. Compute.**
        $$\nabla\cdot\mathbf B = \mu_0H_0\left[\frac{\partial(-y^2)}{\partial x} + \frac{\partial(x^2)}{\partial y} + \frac{\partial(xy)}{\partial z}\right] = \mu_0H_0\,(0 + 0 + 0)$$
        $$\boxed{\nabla\cdot\mathbf B = 0\ \ \text{T/m}}$$
        So $\mathbf H$ can be a magnetic field. This is the magnetic counterpart of checking $\nabla\times\mathbf E = 0$ for an electrostatic field: a one-line test that the given field is legal.
      ` }),
    P({ src: 'Chen style A #1(b) · 5 pts', title: 'The current that makes it',
      q: md`**(b) (5 pts)** Find the current density $\mathbf J$ that produces this field.`,
      parts: [ex(md`$J_x$ (A/m²)`, 'H0*x', ['H0', 'x', 'y']), ex(md`$J_y$ (A/m²)`, '-H0*y', ['H0', 'x', 'y']), ex(md`$J_z$ (A/m²)`, '2*H0*(x+y)', ['H0', 'x', 'y'])],
      hints: [md`Static fields: $\mathbf J = \nabla\times\mathbf H$. Expand the curl as a determinant with rows $(\hat x, \hat y, \hat z)$, $(\partial_x, \partial_y, \partial_z)$, $(H_x, H_y, H_z)$.`],
      sol: md`
        **1. Law.** Ampère's law in point form, static case: $\mathbf J = \nabla\times\mathbf H$.

        **2. Curl,** one component at a time:
        $$J_x = \frac{\partial H_z}{\partial y} - \frac{\partial H_y}{\partial z} = H_0x,\qquad J_y = \frac{\partial H_x}{\partial z} - \frac{\partial H_z}{\partial x} = -H_0y,\qquad J_z = \frac{\partial H_y}{\partial x} - \frac{\partial H_x}{\partial y} = 2H_0x + 2H_0y$$
        $$\boxed{\mathbf J = H_0\left[x\,\hat x - y\,\hat y + 2(x + y)\,\hat z\right]\ \ \text{A/m}^2}$$
        **Units.** $H_0x^2$ is A/m; one derivative per meter leaves A/m² ✓.

        **Check.** $\nabla\cdot\mathbf J = H_0 - H_0 + 0 = 0$: a steady current never piles up, as it must, since $\nabla\cdot(\nabla\times\mathbf H) = 0$ for any field.
      ` }),
    P({ src: 'Chen style A #1(c) · 5 pts', title: 'Flux through the triangle',
      q: md`**(c) (5 pts)** Find the magnetic flux $\Psi$ through $T$, with $d\mathbf S = +\hat z\,dS$.`,
      parts: [ex(md`$\Psi$ (Wb)`, 'mu0*H0/8', ['mu0', 'H0'])],
      hints: [md`Only $B_z = \mu_0H_0xy$ crosses $T$. Integrate $y$ from 0 up to the diagonal $y = x$, then $x$ from 0 to 1.`],
      sol: md`
        **1. Law.** $\Psi = \int_T\mathbf B\cdot d\mathbf S$ with $\mathbf B = \mu_0\mathbf H$ and $d\mathbf S = \hat z\,dx\,dy$: only $B_z$ counts.

        **2. Integrate** over the triangle, $y$ from 0 to $x$:
        $$\Psi = \mu_0H_0\int_0^1\!\!\int_0^x xy\,dy\,dx = \mu_0H_0\int_0^1\frac{x^3}{2}\,dx = \frac{\mu_0H_0}{8}$$
        $$\boxed{\Psi = \frac{\mu_0H_0}{8}\ \ \text{Wb}}$$
        **Check.** Units: (H/m)(A/m³)(m⁴) = H·A = Wb ✓. Sign: $B_z = \mu_0H_0xy > 0$ everywhere on $T$, along $d\mathbf S$, so $\Psi > 0$ ✓.
      ` }),
    P({ src: 'Chen style A #1(d) · 5 pts', title: 'Ampère around the triangle',
      q: md`**(d) (5 pts)** Evaluate $\oint_C\mathbf H\cdot d\mathbf l$ along $O\to P\to Q\to O$, and the current $I_T = \int_T\mathbf J\cdot d\mathbf S$ through $T$. Compare them.`,
      parts: [ex(md`$\oint_C\mathbf H\cdot d\mathbf l$ (A)`, 'H0', ['H0']), ex(md`$I_T$ (A)`, 'H0', ['H0'])],
      hints: [md`Edge by edge. On $OP$, $y = 0$. On $PQ$, $x = 1$ and $d\mathbf l = \hat y\,dy$. On $QO$, $x = y = s$ with $d\mathbf l = (\hat x + \hat y)\,ds$ and $s$ running from 1 down to 0.`, md`$I_T = \displaystyle\int_0^1\!\!\int_0^x 2H_0(x + y)\,dy\,dx$.`],
      sol: md`
        **1. Line integral, edge by edge.**
        - $O\to P$ ($y = 0$, $d\mathbf l = \hat x\,dx$): $H_x = -H_0y^2 = 0$. Contributes 0.
        - $P\to Q$ ($x = 1$, $d\mathbf l = \hat y\,dy$): $H_y = H_0x^2 = H_0$. Contributes $\int_0^1H_0\,dy = H_0$.
        - $Q\to O$ ($x = y = s$, $d\mathbf l = (\hat x + \hat y)\,ds$): $H_x + H_y = H_0(-s^2 + s^2) = 0$. Contributes 0.

        $$\boxed{\oint_C\mathbf H\cdot d\mathbf l = H_0\ \ \text{A}}$$
        **2. Enclosed current.**
        $$I_T = \int_0^1\!\!\int_0^x 2H_0(x + y)\,dy\,dx = 2H_0\int_0^1\frac{3x^2}{2}\,dx = H_0 \qquad \boxed{I_T = H_0\ \ \text{A}}$$
        **3. Compare.** Equal: that is Ampère's law, $\oint_C\mathbf H\cdot d\mathbf l = I_{\text{enc}}$, which is Stokes' theorem applied to $\mathbf J = \nabla\times\mathbf H$. On an exam, compute one side and use the other as a check. The orientations agree: $C$ counterclockwise from $+z$ counts current along $+z$ as positive, the same $d\mathbf S = +\hat z$ used for $I_T$.
      ` }),
    P({ src: 'Chen style A #1(e) · 5 pts', title: 'Make it oscillate: Faraday',
      q: md`**(e) (5 pts)** The source is now driven so that the field keeps its shape but oscillates, $\mathbf H(x,y,t) = \mathbf H(x,y)\cos\omega t$, slowly enough that the static picture holds at each instant. A thin wire loop is laid along $C$. Find the emf $\emf(t)$ along $C$ ($O\to P\to Q\to O$).`,
      parts: [ex(md`$\emf(t)$ along $C$ (V)`, 'mu0*H0*omega*sin(omega*t)/8', ['mu0', 'H0', 'omega', 't'])],
      hints: [md`Faraday: $\emf = -d\Psi/dt$, with $\Psi(t)$ the flux through $T$ along $d\mathbf S = +\hat z$. Part (c) gives $\Psi$ at the peak.`],
      sol: md`
        **1. Law.** Faraday: $\emf = \oint_C\mathbf E\cdot d\mathbf l = -\dfrac{d\Psi}{dt}$, with $d\mathbf S = +\hat z$ tied to $C$ by the RHR.

        **2. Flux.** Every value of $\mathbf B$ is multiplied by $\cos\omega t$, so by part (c), $\Psi(t) = \dfrac{\mu_0H_0}{8}\cos\omega t$.

        **3. Emf.**
        $$\boxed{\emf(t) = -\frac{d\Psi}{dt} = \frac{\mu_0H_0\,\omega}{8}\sin\omega t\ \ \text{V}}$$
        **Check (Lenz).** Just after $t = 0$ the flux along $+z$ is shrinking and $\emf > 0$: current flows along $C$, counterclockwise, which makes $+z$ field inside $T$ and props the flux up ✓. Units: Wb/s = V ✓.
      ` }),

    // ---------------------------------------------------------------- Problem 2
    RF(md`
      ### Problem 2 (21 points): a slab with a $|x|$ current profile

      An infinite slab $-a < x < a$ carries the static current density
      $$\mathbf J = J_0\frac{|x|}{a}\,\hat z\ \ \text{A/m}^2 \qquad (|x| < a)$$
      and $\mathbf J = 0$ outside. Everything is nonmagnetic ($\mu_0$), and nothing depends on $y$ or $z$. Express answers in terms of $J_0$, $a$, $b$, $x$ and $\mu_0$.

      [[fig:J]]
    `, { J: { svg: plotA2J(), cap: 'J_z(x): zero at the center plane, J₀ at both faces, zero outside. The current flows out of the page (+z).' } }),
    P({ src: 'Chen style A #2(a) · 7 pts', title: 'Current per unit width',
      q: md`**(a) (7 pts)** Find the current per unit width $K$: the current through a strip 1 m wide (along $y$) that spans the slab from $x = -a$ to $x = a$.`,
      parts: [ex(md`$K$ (A/m)`, 'J0*a', ['J0', 'a'])],
      hints: [md`$K = \int_{-a}^{a}J_z\,dx$. The integrand is even: twice the integral from 0 to $a$.`],
      sol: md`
        **1. Definition.** Current per unit width is $J_z$ integrated across the slab's thickness.

        **2. Integrate.** $|x|$ is even, so
        $$K = \int_{-a}^{a}J_0\frac{|x|}{a}\,dx = \frac{2J_0}{a}\int_0^a x\,dx = \frac{2J_0}{a}\cdot\frac{a^2}{2} \qquad \boxed{K = J_0a\ \ \text{A/m}}$$
        **Check.** Units: (A/m²)(m) = A/m ✓. The average density is $J_0/2$ over a thickness $2a$: $K = (J_0/2)(2a)$ ✓.
      ` }),
    P({ src: 'Chen style A #2(b) · 7 pts', title: 'H by Ampère',
      q: md`**(b) (7 pts)** Use Ampère's law to find $\mathbf H$ everywhere: give $H_y$ for $0 < x < a$ and for $x > a$, and say how $\mathbf H$ at $x < 0$ relates to $\mathbf H$ at $-x$.`,
      parts: [ex(md`$H_y$ for $0 < x < a$ (A/m)`, 'J0*x^2/(2*a)', ['J0', 'a', 'x']), ex(md`$H_y$ for $x > a$ (A/m)`, 'J0*a/2', ['J0', 'a']),
        mc(md`For $x < 0$, $\mathbf H(x)$ is`, [md`$-\mathbf H(-x)$: the same size, along $-\hat y$`, md`$+\mathbf H(-x)$: the same vector, along $+\hat y$`, md`zero: no field reaches the far side`, md`along $\pm\hat x$`], 0,
          [null, md`Field lines circle the current, so on the two sides they run opposite ways. RHR at $x < 0$: $\hat z\times(-\hat x) = -\hat y$.`,
            md`Every current element makes field on both sides. The left half is the mirror image of the right, with $H_y$ reversed.`,
            md`$\mathbf H$ is perpendicular to the current ($\hat z$) and to the direction things vary ($\hat x$): only $H_y$ survives.`])],
      hints: [md`Symmetry: $\mathbf H = H_y(x)\,\hat y$ with $H_y$ odd in $x$, so $H_y(0) = 0$. Take a rectangle in the $xy$-plane with sides at $x = \pm x_0$ (length $\ell$ along $y$), counterclockwise from $+z$.`, md`It gives $2H_y(x_0)\,\ell = \ell\displaystyle\int_{-x_0}^{x_0}J_z\,dx$.`],
      sol: md`
        **1. Symmetry.** The slab is infinite in $y$ and $z$ and the current is along $\hat z$, so $\mathbf H = H_y(x)\,\hat y$. Mirroring $x\to-x$ maps the slab onto itself and reverses the circulation, so $H_y(-x) = -H_y(x)$ and $H_y(0) = 0$.

        **2. Ampère.** A rectangle in the $xy$-plane with sides at $x = \pm x_0$ of length $\ell$, counterclockwise from $+z$. The sides along $x$ give nothing ($H_x = 0$); the sides along $y$ give $H_y(x_0)\ell - H_y(-x_0)\ell = 2H_y(x_0)\ell$. The enclosed current is $\ell\int_{-x_0}^{x_0}J_z\,dx$. So $H_y(x_0) = \tfrac12\int_{-x_0}^{x_0}J_z\,dx$.

        **3. Inside and outside.**
        $$0 < x < a:\quad H_y = \frac12\cdot\frac{2J_0}{a}\cdot\frac{x^2}{2} \qquad \boxed{H_y = \frac{J_0x^2}{2a}\ \ \text{A/m}}$$
        $$x > a:\quad \boxed{H_y = \frac{J_0a}{2}\ \ \text{A/m}}\qquad\qquad x < 0:\quad \mathbf H(x) = -\mathbf H(-x)$$
        In one line: $H_y = \dfrac{J_0\,x|x|}{2a}$ inside and $\pm\dfrac{J_0a}{2}$ outside.

        [[fig:h]]

        **Check.** Direction: at $x > 0$, $\hat z\times\hat x = +\hat y$ (RHR around a $+z$ current) ✓. Continuous at $x = a$, as it must be with no sheet there ✓. Outside it is $K/2$, the field of a sheet of $K = J_0a$ ✓. Point form: $dH_y/dx = J_0|x|/a = J_z$ ✓.
      `,
      figs: { h: { svg: plotA2H(), cap: 'H_y(x): odd in x, a parabola inside the slab, flat at ±J₀a/2 outside.' } } }),
    P({ src: 'Chen style A #2(c) · 7 pts', title: 'Flux per unit length',
      q: md`**(c) (7 pts)** Find the magnetic flux per unit length $\Psi'$ (per meter along $z$) through the strip $0 < x < b$ of the plane $y = 0$, where $b > a$, counted along $+\hat y$.`,
      parts: [ex(md`$\Psi'$ (Wb/m)`, 'mu0*J0*a*(3*b-2*a)/6', ['mu0', 'J0', 'a', 'b'])],
      hints: [md`$\Psi' = \int_0^b\mu_0H_y\,dx$. Split the integral at $x = a$.`],
      sol: md`
        **1. Law.** $\Psi' = \int_0^bB_y\,dx$ for a strip 1 m long in $z$, with $B_y = \mu_0H_y$.

        **2. Split at $a$.**
        $$\Psi' = \mu_0\int_0^a\frac{J_0x^2}{2a}\,dx + \mu_0\int_a^b\frac{J_0a}{2}\,dx = \mu_0J_0\left[\frac{a^2}{6} + \frac{a(b - a)}{2}\right]$$
        $$\boxed{\Psi' = \frac{\mu_0J_0a\,(3b - 2a)}{6}\ \ \text{Wb/m}}$$
        **Check.** At $b = a$ only the inside term is left, $\mu_0J_0a^2/6$ ✓. Past $a$ the field is uniform, so $\Psi'$ grows linearly in $b$ at the rate $B_y = \mu_0J_0a/2$ ✓. Units: (H/m)(A/m²)(m²) = Wb/m ✓. (The electric twin: the potential outside a charged slab, found by integrating $\mathbf E$ across it.)
      ` }),

    // ---------------------------------------------------------------- Problem 3
    RF(md`
      ### Problem 3 (24 points): two magnetic materials

      Two linear magnetic materials meet at the plane $z = 0$: region 1 ($z > 0$) has $\mu_1 = 3\mu_0$, and region 2 ($z < 0$) has $\mu_2 = 6\mu_0$. No free surface current flows on the interface. Just above it,
      $$\mathbf H_1 = 6\,\hat x - 2\,\hat y + 4\,\hat z\ \ \text{A/m}$$

      [[fig:mat]]
    `, { mat: { svg: figA3(), cap: 'Region 2, below, is the more permeable one. The normal points from region 2 into region 1.' } }),
    P({ src: 'Chen style A #3(a) · 8 pts', title: 'H below',
      q: md`**(a) (8 pts)** Find $\mathbf H_2$, the field just below the interface.`,
      parts: [N('H_{2x}', 6, 'A/m'), N('H_{2y}', -2, 'A/m'), N('H_{2z}', 2, 'A/m')],
      hints: [md`No free sheet: tangential $\mathbf H$ ($H_x$ and $H_y$) is continuous. Normal $\mathbf B$ is continuous: $\mu_1H_{1z} = \mu_2H_{2z}$.`],
      sol: md`
        **1. Boundary conditions** (no free surface current): $\mathbf H_t$ continuous; $B_n$ continuous, so $\mu_1H_{1z} = \mu_2H_{2z}$.

        **2. Tangential.** $H_{2x} = 6$ A/m, $H_{2y} = -2$ A/m.

        **3. Normal.** $H_{2z} = \dfrac{\mu_1}{\mu_2}H_{1z} = \dfrac36(4) = 2$ A/m.
        $$\boxed{\mathbf H_2 = 6\,\hat x - 2\,\hat y + 2\,\hat z\ \ \text{A/m}}$$
        **Check.** The field leans further from the normal on the more permeable side: $|\mathbf H_t|/H_z$ is $\sqrt{40}/4$ above and $\sqrt{40}/2$ below, a ratio of $2 = \mu_2/\mu_1$ ✓.
      ` }),
    P({ src: 'Chen style A #3(b) · 8 pts', title: 'B on both sides',
      q: md`**(b) (8 pts)** Find $\mathbf B_1$ and $\mathbf B_2$ in terms of $\mu_0$.`,
      parts: [ex(md`$B_{1x}$ (T)`, '18*mu0', ['mu0']), ex(md`$B_{1y}$ (T)`, '-6*mu0', ['mu0']), ex(md`$B_{1z}$ (T)`, '12*mu0', ['mu0']),
        ex(md`$B_{2x}$ (T)`, '36*mu0', ['mu0']), ex(md`$B_{2y}$ (T)`, '-12*mu0', ['mu0']), ex(md`$B_{2z}$ (T)`, '12*mu0', ['mu0'])],
      hints: [md`$\mathbf B = \mu\mathbf H$ on each side, with that side's own $\mu$.`],
      sol: md`
        **1. Law.** In a linear material $\mathbf B = \mu\mathbf H$, with each region's own $\mu$.

        **2. Multiply.**
        $$\boxed{\mathbf B_1 = 3\mu_0\mathbf H_1 = \mu_0\left(18\,\hat x - 6\,\hat y + 12\,\hat z\right)\ \text{T}}$$
        $$\boxed{\mathbf B_2 = 6\mu_0\mathbf H_2 = \mu_0\left(36\,\hat x - 12\,\hat y + 12\,\hat z\right)\ \text{T}}$$
        **Check.** $B_z = 12\mu_0$ on both sides: normal $B$ is continuous ✓. Tangential $\mathbf B$ doubles going down ($\mu_2/\mu_1 = 2$), because tangential $\mathbf H$ is what carries across ✓. Units: (H/m)(A/m) = Wb/m² = T ✓. In numbers, $12\mu_0 = 1.51\times10^{-5}$ T.
      ` }),
    P({ src: 'Chen style A #3(c) · 8 pts', title: 'Magnetization',
      q: md`**(c) (8 pts)** Find the magnetizations $\mathbf M_1$ and $\mathbf M_2$.`,
      parts: [N('M_{1x}', 12, 'A/m'), N('M_{1y}', -4, 'A/m'), N('M_{1z}', 8, 'A/m'), N('M_{2x}', 30, 'A/m'), N('M_{2y}', -10, 'A/m'), N('M_{2z}', 10, 'A/m')],
      hints: [md`$\mathbf M = \chi_m\mathbf H$ with $\chi_m = \mu_r - 1$. Or $\mathbf M = \mathbf B/\mu_0 - \mathbf H$.`],
      sol: md`
        **1. Law.** $\mathbf M = \chi_m\mathbf H = (\mu_r - 1)\mathbf H$: $\chi_{m1} = 2$ and $\chi_{m2} = 5$.

        **2. Multiply.**
        $$\boxed{\mathbf M_1 = 2\mathbf H_1 = 12\,\hat x - 4\,\hat y + 8\,\hat z\ \ \text{A/m}}$$
        $$\boxed{\mathbf M_2 = 5\mathbf H_2 = 30\,\hat x - 10\,\hat y + 10\,\hat z\ \ \text{A/m}}$$
        **Check.** $\mathbf B/\mu_0 = \mathbf H + \mathbf M$: above, $(6 + 12,\ -2 - 4,\ 4 + 8) = (18, -6, 12)$ ✓; below, $(36, -12, 12)$ ✓. Neither $M_z$ (8 vs 10) nor $H_z$ (4 vs 2) is continuous, but their sum is: $12 = 12 = B_z/\mu_0$ ✓.
      ` }),

    // ---------------------------------------------------------------- Problem 4
    RF(md`
      ### Problem 4 (30 points): a coax with two magnetic layers

      A long coax has an inner conductor of radius $a$ and a thin outer conductor of radius $b$. Between them are two nonconducting magnetic layers: permeability $\mu_1$ for $a < r < c$ and $\mu_2$ for $c < r < b$. The inner conductor carries a steady current $I$ along $+\hat z$. Ignore the fields inside the conductors. **Express your answers in terms of $\mu_1$, $\mu_2$, $a$, $b$, $c$, $r$ and $I$, and include units.**

      [[fig:coax]]
    `, { coax: { svg: figA4(), cap: 'Cross-section, not to scale. Current I comes out of the page in the inner conductor.' } }),
    P({ src: 'Chen style A #4(a) · 6 pts', title: 'H in both layers',
      q: md`**(a) (6 pts)** Find $\mathbf H$ for $a < r < b$.`,
      parts: [ex(md`$H_\phi$ for $a < r < c$ (A/m)`, 'I/(2*pi*r)', ['I', 'r']), ex(md`$H_\phi$ for $c < r < b$ (A/m)`, 'I/(2*pi*r)', ['I', 'r']),
        mc(md`$\mathbf H$ points along`, [md`$+\hat\phi$`, md`$-\hat\phi$`, md`$+\hat r$`, md`$+\hat z$`], 0,
          [null, md`RHR: thumb along the current ($+\hat z$), fingers curl along $+\hat\phi$.`, md`$\mathbf H$ circles a line current. A radial $\mathbf B$ would have net flux out of a closed cylinder around the wire, violating $\nabla\cdot\mathbf B = 0$.`, md`$\mathbf H$ is perpendicular to the current that makes it.`])],
      hints: [md`Ampère's law for $\mathbf H$ counts **free** current only. A circle of radius $r$ encloses $I$ in either layer.`],
      sol: md`
        **1. Law.** $\oint_C\mathbf H\cdot d\mathbf l = I_{\text{free,enc}}$. The layers' bound currents are already inside $\mathbf H$; they do not appear.

        **2. Symmetry.** $\mathbf H = H_\phi(r)\,\hat\phi$. At $r = c$ it is tangential to the interface, and tangential $\mathbf H$ is continuous where no free sheet flows: the layers cannot make $H_\phi$ jump.

        **3. Solve.** On a circle of radius $r$, counterclockwise from $+z$: $H_\phi\,2\pi r = I$ for every $a < r < b$.
        $$\boxed{\mathbf H = \frac{I}{2\pi r}\,\hat\phi\ \ \text{A/m}\quad (a < r < b,\ \text{both layers})}$$
        **Check.** RHR: current along $+z$, $\mathbf H$ along $+\hat\phi$ ✓. It is the empty coax's $\mathbf H$: here $\mathbf H$ does not depend on $\mu$.
      ` }),
    P({ src: 'Chen style A #4(b) · 6 pts', title: 'B in each layer',
      q: md`**(b) (6 pts)** Find $\mathbf B$ in each layer.`,
      parts: [ex(md`$B_\phi$ for $a < r < c$ (T)`, 'mu1*I/(2*pi*r)', ['mu1', 'I', 'r']), ex(md`$B_\phi$ for $c < r < b$ (T)`, 'mu2*I/(2*pi*r)', ['mu2', 'I', 'r'])],
      hints: [md`$\mathbf B = \mu\mathbf H$ with the local $\mu$.`],
      sol: md`
        **1. Law.** $\mathbf B = \mu\mathbf H$ in each linear layer.

        **2. Multiply.**
        $$\boxed{\mathbf B = \frac{\mu_1I}{2\pi r}\,\hat\phi\ \ \text{T}\quad (a < r < c)}\qquad\boxed{\mathbf B = \frac{\mu_2I}{2\pi r}\,\hat\phi\ \ \text{T}\quad (c < r < b)}$$
        **Check.** At $r = c$, $B_\phi$ jumps by the factor $\mu_2/\mu_1$. That is allowed: $B_\phi$ is tangential there, and only **normal** $B$ must be continuous ✓. Units: (H/m)(A)/(m) = T ✓.
      ` }),
    P({ src: 'Chen style A #4(c) · 6 pts', title: 'The outer conductor',
      q: md`**(c) (6 pts)** A source at one end of the coax and a load at the other are each connected between the inner and outer conductors. What total current does the outer conductor carry? Give its size and direction, and state the assumption you make.`,
      parts: [mc('', [md`$I$, along $-\hat z$`, md`$(\mu_2/\mu_0)\,I$, along $-\hat z$`, md`zero: only the inner conductor is driven`, md`$I$, along $+\hat z$`], 0,
        [null, md`That reads the enclosed current off $\mathbf B$ just inside $r = b$, $B_\phi = \mu_2I/2\pi b$, as if $\oint\mathbf B\cdot d\mathbf l = \mu_0I_{\text{enc}}$ counted only free current. $\mathbf B$ also sees the layers' bound currents, which add $\chi_2I$ inside $r = b$ and cancel on the layer's outer face. Ampère for $\mathbf H$ counts free current only.`,
          md`The load joins the inner conductor to the outer one, so the current that goes out on the inner conductor comes back on the outer one. With zero there, a circle outside the coax would enclose $I$ and see $H_\phi = I/2\pi r$, as around a bare wire; a coax keeps its field inside.`,
          md`Then a circle outside encloses $2I$ and the outside field doubles. The outer conductor is the return path.`])],
      hints: [md`Close an Amperian circle **outside** the coax, $r > b$. What is $\mathbf H$ there for a coax, and which currents does Ampère's law for $\mathbf H$ count?`],
      sol: md`
        !!trap The trap
          The magnetic layers do not change the answer, and the answer is not read off $\mathbf B$.

        **Assumption (write it on the paper).** The coax is the whole circuit: the current that goes out on the inner conductor comes back through the load on the outer one, with no other return path, so the field outside the coax is zero. Ampère's law alone cannot fix the outer current; this assumption does. If a problem says only "a coax", make the same assumption and write it down: the outer conductor is the return path unless the problem says it is isolated.

        **Ampère for H** on a circle of radius $r > b$: $H_\phi\,2\pi r = I + I_{\text{out}} = 0$, so
        $$\boxed{I_{\text{out}} = -I:\ \text{a current } I \text{ along } {-\hat z}\ \text{(A)}}$$
        **Why the layers drop out.** Their bound surface currents, $\mathbf M\times\hat n$ with $\hat n$ out of each layer, are $+\chi_1I$ on $r = a$, $-\chi_1I$ and $+\chi_2I$ on $r = c$, and $-\chi_2I$ on $r = b$ (with $\chi = \mu/\mu_0 - 1$); inside each layer $\nabla\times\mathbf M = 0$ because $M_\phi \propto 1/r$. They add to zero. A magnetized layer moves current around inside itself; it carries none on balance.
      ` }),
    P({ src: 'Chen style A #4(d) · 6 pts', title: 'Flux per unit length',
      q: md`**(d) (6 pts)** Find the magnetic flux per unit length $\Psi'$ between the conductors: through a flat strip from $r = a$ to $r = b$, 1 m long in $z$.`,
      parts: [ex(md`$\Psi'$ (Wb/m)`, 'I*(mu1*ln(c/a)+mu2*ln(b/c))/(2*pi)', ['I', 'mu1', 'mu2', 'a', 'b', 'c'])],
      hints: [md`$\Psi' = \int_a^bB_\phi\,dr$; split at $r = c$. $\int dr/r$ is a log.`],
      sol: md`
        **1. Law.** $\Psi' = \int_a^bB_\phi\,dr$: a strip of unit length, crossed normally by $\mathbf B$.

        **2. Split at $c$.**
        $$\Psi' = \int_a^c\frac{\mu_1I}{2\pi r}\,dr + \int_c^b\frac{\mu_2I}{2\pi r}\,dr \qquad \boxed{\Psi' = \frac{I}{2\pi}\left[\mu_1\ln\frac ca + \mu_2\ln\frac bc\right]\ \ \text{Wb/m}}$$
        **Check.** Units: (H/m)(A) = Wb/m ✓. Each layer adds its own term, weighted by its own $\mu$ and its own log ratio.
      ` }),
    P({ src: 'Chen style A #4(e) · 6 pts', title: 'Inductance per unit length',
      q: md`**(e) (6 pts)** Find the inductance per unit length $L'$. Then check it: what does it become when layer 1 fills the whole gap ($c\to b$)?`,
      parts: [ex(md`$L'$ (H/m)`, '(mu1*ln(c/a)+mu2*ln(b/c))/(2*pi)', ['mu1', 'mu2', 'a', 'b', 'c']),
        mc(md`As $c\to b$, $L'\to$`, [md`$\dfrac{\mu_1}{2\pi}\ln\dfrac ba$`, md`$\dfrac{\mu_2}{2\pi}\ln\dfrac ba$`, md`$\dfrac{\mu_1 + \mu_2}{2\pi}\ln\dfrac ba$`, md`$\dfrac{\mu_1}{\pi}\ln\dfrac ba$`], 0,
          [null, md`As $c\to b$, $\ln(b/c)\to0$: layer 2 shrinks to nothing, not layer 1.`, md`The two logs share the gap: $\ln(c/a) + \ln(b/c) = \ln(b/a)$. In the limit one of them is zero.`, md`The $2\pi$ comes from the circumference in Ampère's law; a limit does not change it.`])],
      hints: [md`$L' = \Psi'/I$: the coax is a single turn.`],
      sol: md`
        **1. Law.** $L' = \Psi'/I$. The coax is one turn: the flux between the conductors links the circuit once.

        **2. Divide.**
        $$\boxed{L' = \frac{1}{2\pi}\left[\mu_1\ln\frac ca + \mu_2\ln\frac bc\right]\ \ \text{H/m}}$$
        **3. Limits.**
        - $c\to b$ (all $\mu_1$): $L'\to\dfrac{\mu_1}{2\pi}\ln\dfrac ba$ ✓
        - $c\to a$ (all $\mu_2$): $L'\to\dfrac{\mu_2}{2\pi}\ln\dfrac ba$ ✓
        - $\mu_1 = \mu_2 = \mu$: the logs combine into $\dfrac{\mu}{2\pi}\ln\dfrac ba$, the one-material coax ✓

        $I$ cancels, as it must: $L'$ depends only on geometry and materials.
      ` }),
  ];

  EM.lesson('e2-prac', { id: 'prac-chen-a', title: 'Practice exam: Prof. Chen style A', kind: 'mock', sub: '75 min · 100 pts · four problems in Prof. Chen\'s format', steps: examA });

  // ======================================================================================== EXAM B: figures
  const plotB2J = () => plot({
    x: [0, 2], y: [0, 1.25], xl: 'r', yl: 'J_z', xt: [[1, 'a']], yt: [[1, 'J_0']],
    curves: [{ f: (r) => (r < 1 ? 1 - r * r : 0) }],
  });
  const RSTAR = Math.sqrt(2 / 3), HMAX = Math.sqrt(6) / 9;
  const plotB2H = () => plot({
    x: [0, 3], y: [0, 0.34], xl: 'r', yl: 'H_\\phi/J_0a', xt: [[1, 'a'], [2, '2a']], yt: [[0.25, '\\tfrac14']],
    vlines: [[RSTAR, '']], curves: [{ f: (r) => (r < 1 ? r / 2 - r ** 3 / 4 : 1 / (4 * r)) }],
    pts: [{ x: RSTAR, y: HMAX, lab: 'r = a\\sqrt{2/3}' }],
  });
  // B3: interface y = 0 carrying a sheet along +z (out of the page)
  function figB3() {
    const g = PF.fig({ alt: 'side view with y up and x to the right, z out of the page: region 1 below the plane y = 0 is shaded and has mu1 = 2 mu0; region 2 above has mu2 = 4 mu0; the plane carries a surface current along +z, drawn as dots; the normal n = y-hat points up from region 1 into region 2' });
    g.rect(20, 90, 260, 60, { cls: 'shade' });
    g.line(20, 90, 280, 90, { cls: 'thick dash' });
    for (const x of [45, 95, 145, 195]) g.odot(x, 90, 5);
    g.label(120, 55, '\\text{region 2: } \\mu_2 = 4\\mu_0', 'c', 'small');
    g.label(120, 124, '\\text{region 1: } \\mu_1 = 2\\mu_0', 'c', 'small');
    g.arrow(252, 90, 252, 48, { hs: 7 }); g.label(258, 50, '\\hat n = \\hat y', 'l', 'small');
    g.label(284, 90, '\\mathbf J_s = 4\\hat z\\ \\text{A/m}', 'l', 'small');
    return g.svg();
  }
  // B4: the toroid cut along its axis: two rectangular cross-sections, two layers each
  function figB4() {
    const g = PF.fig({ alt: 'the toroid cut through its axis: two rectangular cross-sections, left and right of the dashed axis, each from radius a to radius b; the lower layer, shaded, has thickness h1 and permeability mu1; the upper layer has thickness h2 and permeability mu2' });
    const cx = 170, ra = 40, rb = 120, z0 = 160, z1 = 128, z2 = 84;
    g.line(cx, 40, cx, 182, { cls: 'dash dim' }); g.label(cx + 4, 184, '\\text{axis}', 'tl', 'small accent');
    for (const s of [-1, 1]) {
      const L = s > 0 ? cx + ra : cx - rb, W = rb - ra;
      g.rect(L, z1, W, z0 - z1, { cls: 'shade' });
      g.rect(L, z2, W, z0 - z2);
      g.line(L, z1, L + W, z1, { cls: 'dim' });
    }
    g.label(cx + (ra + rb) / 2, (z0 + z1) / 2, '\\mu_1', 'c', 'small');
    g.label(cx + (ra + rb) / 2, (z1 + z2) / 2, '\\mu_2', 'c', 'small');
    g.dim(cx, z2 - 12, cx + ra, z2 - 12, 'a', { at: 't' });
    g.dim(cx, z2 - 36, cx + rb, z2 - 36, 'b', { at: 't' });
    g.dim(cx + rb + 12, z0, cx + rb + 12, z1, 'h_1', { at: 'r' });
    g.dim(cx + rb + 12, z1, cx + rb + 12, z2, 'h_2', { at: 'r' });
    return g.svg();
  }

  // ======================================================================================== EXAM B
  const examB = [
    R(md`
      **75 minutes, 100 points, four problems.** Same rules as Prof. Chen's paper: closed book, one 4″×6″ index card of handwritten notes, no calculator. Box each answer and give its units.

      **Why this format.** Prof. Chen wrote this semester's Exam 1, and its shape is the best guess for Exam 2: four problems of 21–30 points in short parts of 5–8 points, symbolic answers, clean fields, one trap. This paper has the skeleton of [Exam A](#/l/prac-chen-a) with new situations: a plane wave instead of a static field, a round wire instead of a slab, a current sheet on the interface, and a toroid instead of a coax.

      | Problem | Topic | Points |
      |---|---|---|
      | 1 | A plane wave given as $\mathbf E(z,t)$: direction, $v_p$, $\mathbf H$ by Faraday, displacement current and $\epsilon$, $\eta$, Poynting | 30 |
      | 2 | A wire with a parabolic current profile: total current, $\mathbf H$ by Ampère, where $H$ peaks | 21 |
      | 3 | Two magnetic materials with a current sheet on the interface: $\mathbf H$, $\mathbf B$, $\mathbf M$ | 24 |
      | 4 | A toroid with a two-layer core: $\mathbf H$, $\mathbf B$, flux, $L$, the emf in two loops | 25 |

      **Draws on:** [the wave equation](#/l/t14-wave-eq), [sinusoidal plane waves](#/l/t16-sinusoids), [the Poynting vector](#/l/t17-poynting), [displacement current](#/l/t12-displacement), [Ampère's law](#/l/t5-ampere), [magnetic materials](#/l/t13-materials), [inductance](#/l/t11-inductance) and [Faraday's law](#/l/t8-faraday).

      **Entering answers.** Symbolic boxes take expressions in the variables listed under each box, such as <code>E0*beta*cos(omega*t+beta*z)/(mu0*omega)</code> or <code>N^2*ln(b/a)</code>. The unit is in each label. Work on paper under time first.
    `),

    // ---------------------------------------------------------------- Problem 1
    R(md`
      ### Problem 1 (30 points): a given plane wave

      In a lossless, nonmagnetic ($\mu = \mu_0$) dielectric of unknown permittivity $\epsilon$, with no free charge and no conduction current,
      $$\mathbf E(z,t) = E_0\cos(\omega t + \beta z)\,\hat y\ \ \text{V/m}$$
      where $E_0$, $\omega$ and $\beta$ are positive constants. Express answers in terms of $E_0$, $\omega$, $\beta$, $\mu_0$, $z$ and $t$ unless a part gives numbers.
    `),
    P({ src: 'Chen style B #1(a) · 6 pts', title: 'Direction and speed',
      q: md`**(a) (6 pts)** Which way does the wave travel, and at what phase velocity $v_p$?`,
      parts: [mc(md`The wave travels along`, [md`$-\hat z$`, md`$+\hat z$`, md`$+\hat y$`, md`$-\hat y$`], 0,
        [null, md`Follow a crest: $\omega t + \beta z = $ const gives $dz/dt = -\omega/\beta < 0$. A **plus** sign between $\omega t$ and $\beta z$ means travel toward $-z$.`,
          md`$\hat y$ is the polarization, the direction of $\mathbf E$. A plane wave travels perpendicular to $\mathbf E$.`,
          md`The field depends only on $z$ and $t$, so it moves along $\pm\hat z$; $\pm\hat y$ is the direction $\mathbf E$ points, not where it goes.`]),
        ex(md`$v_p$ (m/s)`, 'omega/beta', ['omega', 'beta'])],
      hints: [md`Follow a point of constant phase, $\omega t + \beta z = $ const, and differentiate in $t$.`],
      sol: md`
        **1. Constant phase.** A crest keeps $\omega t + \beta z$ fixed. Differentiate: $\omega + \beta\,dz/dt = 0$, so $dz/dt = -\omega/\beta$.

        **2. Answer.**
        $$\boxed{\text{travel along } -\hat z,\qquad v_p = \frac{\omega}{\beta}\ \ \text{m/s}}$$
        **Check.** Units: (rad/s)/(rad/m) = m/s ✓. $\cos(\omega t - \beta z)$ would travel along $+\hat z$: the sign between the two terms decides.
      ` }),
    P({ src: 'Chen style B #1(b) · 6 pts', title: 'H from Faraday',
      q: md`**(b) (6 pts)** Use Faraday's law, $\nabla\times\mathbf E = -\mu_0\,\partial\mathbf H/\partial t$, to find $\mathbf H(z,t)$. It has one nonzero component.`,
      parts: [mc(md`The nonzero component of $\mathbf H$ is along`, [md`$\hat x$`, md`$\hat y$`, md`$\hat z$`], 0,
        [null, md`In a plane wave $\mathbf H$ is perpendicular to $\mathbf E$, which is along $\hat y$.`, md`$\mathbf H$ is perpendicular to the direction of travel, $-\hat z$.`]),
        ex(md`That component, $H(z,t)$ (A/m)`, 'E0*beta*cos(omega*t+beta*z)/(mu0*omega)', ['E0', 'beta', 'omega', 'mu0', 'z', 't'])],
      hints: [md`For $\mathbf E = E_y(z,t)\,\hat y$: $\nabla\times\mathbf E = -\hat x\,\partial E_y/\partial z$.`, md`Integrate $\partial H_x/\partial t$ in time and drop the constant: there is no static field.`],
      sol: md`
        **1. Law.** Faraday's law in point form: $\nabla\times\mathbf E = -\mu_0\,\partial\mathbf H/\partial t$.

        **2. Curl.** Only $E_y(z,t)$ is nonzero, so
        $$\nabla\times\mathbf E = -\hat x\,\frac{\partial E_y}{\partial z} = E_0\beta\sin(\omega t + \beta z)\,\hat x$$
        **3. Integrate in time.** $\dfrac{\partial H_x}{\partial t} = -\dfrac{E_0\beta}{\mu_0}\sin(\omega t + \beta z)$, so (no constant: no static field)
        $$\boxed{\mathbf H = \frac{E_0\beta}{\mu_0\omega}\cos(\omega t + \beta z)\,\hat x\ \ \text{A/m}}$$
        **Check.** When both fields are positive, $\mathbf E\times\mathbf H \propto \hat y\times\hat x = -\hat z$: along the travel from (a) ✓. $\mathbf H$ is in phase with $\mathbf E$, as in any lossless medium ✓.
      ` }),
    P({ src: 'Chen style B #1(c) · 6 pts', title: 'Displacement current',
      q: md`**(c) (6 pts)** With no conduction current, Ampère–Maxwell reads $\nabla\times\mathbf H = \partial\mathbf D/\partial t$. Use your $\mathbf H$ to find the displacement current density $\mathbf J_d = \partial\mathbf D/\partial t$, then the permittivity $\epsilon$.`,
      parts: [ex(md`$J_{d,y}(z,t)$, its only component (A/m²)`, '-E0*beta^2*sin(omega*t+beta*z)/(mu0*omega)', ['E0', 'beta', 'omega', 'mu0', 'z', 't']),
        ex(md`$\epsilon$ (F/m)`, 'beta^2/(mu0*omega^2)', ['beta', 'mu0', 'omega'])],
      hints: [md`For $\mathbf H = H_x(z,t)\,\hat x$: $\nabla\times\mathbf H = \hat y\,\partial H_x/\partial z$.`, md`Then set $\mathbf J_d$ equal to $\epsilon\,\partial\mathbf E/\partial t$ and solve for $\epsilon$.`],
      sol: md`
        **1. Law.** Ampère–Maxwell with $\mathbf J = 0$: $\nabla\times\mathbf H = \partial\mathbf D/\partial t = \mathbf J_d$.

        **2. Curl of H.**
        $$\mathbf J_d = \hat y\,\frac{\partial H_x}{\partial z} \qquad \boxed{\mathbf J_d = -\frac{E_0\beta^2}{\mu_0\omega}\sin(\omega t + \beta z)\,\hat y\ \ \text{A/m}^2}$$
        **3. Permittivity.** $\mathbf D = \epsilon\mathbf E$, so $\partial\mathbf D/\partial t = -\epsilon E_0\omega\sin(\omega t + \beta z)\,\hat y$. Match the two:
        $$\epsilon\,\omega = \frac{\beta^2}{\mu_0\omega} \qquad \boxed{\epsilon = \frac{\beta^2}{\mu_0\omega^2}\ \ \text{F/m}}$$
        **Check.** This is $\beta = \omega\sqrt{\mu_0\epsilon}$: Faraday and Ampère–Maxwell together allow the wave only if $\omega/\beta = 1/\sqrt{\mu_0\epsilon}$ ✓. $\mathbf J_d$ is a sine against $\mathbf E$'s cosine, a quarter period ahead: displacement current follows the **rate** of change of $\mathbf E$ ✓.
      ` }),
    P({ src: 'Chen style B #1(d) · 6 pts', title: 'Impedance, with numbers',
      q: md`**(d) (6 pts)** Find the intrinsic impedance $\eta$ in symbols. Then, for $\omega = 6\pi\times10^8$ rad/s and $\beta = 4\pi$ rad/m, find $\epsilon_r$ and $\eta$ as numbers ($c = 3\times10^8$ m/s, $\mu_0 = 4\pi\times10^{-7}$ H/m, $\eta_0 = 120\pi\ \Omega$).`,
      parts: [ex(md`$\eta$ (Ω)`, 'mu0*omega/beta', ['mu0', 'omega', 'beta']), N('\\epsilon_r', 4, ''), N('\\eta', 60 * PI, 'Ω')],
      hints: [md`$\eta = E_0/H_0$, the ratio of the amplitudes from part (b).`, md`$v_p = \omega/\beta = c/\sqrt{\epsilon_r}$ in a nonmagnetic medium, and $\eta = \eta_0/\sqrt{\epsilon_r}$.`],
      sol: md`
        **1. Definition.** $\eta = E_0/H_0$ for a plane wave. From (b), $H_0 = E_0\beta/\mu_0\omega$:
        $$\boxed{\eta = \frac{\mu_0\omega}{\beta}\ \ \Omega}$$
        It equals $\sqrt{\mu_0/\epsilon}$ with $\epsilon$ from (c) ✓.

        **2. Numbers.** $v_p = \omega/\beta = 6\pi\times10^8/4\pi = 1.5\times10^8$ m/s $= c/2$, so $\sqrt{\epsilon_r} = 2$:
        $$\boxed{\epsilon_r = 4}\qquad\boxed{\eta = \frac{\eta_0}{2} = 60\pi \approx 188\ \Omega}$$
        **Check.** Directly: $\mu_0\omega/\beta = (4\pi\times10^{-7})(6\pi\times10^8)/(4\pi) = 60\pi\ \Omega$ ✓. When $\beta = \omega/c$ the formula gives $\mu_0c = 120\pi = \eta_0$, free space ✓.
      ` }),
    P({ src: 'Chen style B #1(e) · 6 pts', title: 'Poynting vector',
      q: md`**(e) (6 pts)** Find the Poynting vector $\mathbf S(z,t)$ and its time average $\langle\mathbf S\rangle$.`,
      parts: [ex(md`$S_z(z,t)$ (W/m²)`, '-E0^2*beta*cos(omega*t+beta*z)^2/(mu0*omega)', ['E0', 'beta', 'omega', 'mu0', 'z', 't']),
        ex(md`$\langle S_z\rangle$ (W/m²)`, '-E0^2*beta/(2*mu0*omega)', ['E0', 'beta', 'mu0', 'omega'])],
      hints: [md`$\mathbf S = \mathbf E\times\mathbf H$, with $\hat y\times\hat x = -\hat z$. Over a period, $\cos^2$ averages to $\tfrac12$.`],
      sol: md`
        **1. Law.** $\mathbf S = \mathbf E\times\mathbf H$, in W/m².

        **2. Cross product.** $E_y\hat y\times H_x\hat x = -E_yH_x\,\hat z$:
        $$\boxed{\mathbf S = -\frac{E_0^2\beta}{\mu_0\omega}\cos^2(\omega t + \beta z)\,\hat z\ \ \text{W/m}^2}$$
        **3. Average.** $\langle\cos^2\rangle = \tfrac12$:
        $$\boxed{\langle\mathbf S\rangle = -\frac{E_0^2\beta}{2\mu_0\omega}\,\hat z = -\frac{E_0^2}{2\eta}\,\hat z\ \ \text{W/m}^2}$$
        **Check.** $\mathbf S$ points along $-\hat z$ at every instant, the direction of travel ✓. It never reverses, because $E$ and $H$ change sign together ✓. Units: (V/m)(A/m) = W/m² ✓.
      ` }),

    // ---------------------------------------------------------------- Problem 2
    RF(md`
      ### Problem 2 (21 points): a wire with a parabolic current profile

      A long straight wire of radius $a$ lies along the $z$-axis and carries the steady current density
      $$\mathbf J = J_0\left(1 - \frac{r^2}{a^2}\right)\hat z\ \ \text{A/m}^2 \qquad (r < a)$$
      Everything is nonmagnetic ($\mu_0$). Express answers in terms of $J_0$, $a$ and $r$.

      [[fig:J]]
    `, { J: { svg: plotB2J(), cap: 'J_z(r): J₀ on the axis, falling to zero at the surface r = a.' } }),
    P({ src: 'Chen style B #2(a) · 7 pts', title: 'Total current',
      q: md`**(a) (7 pts)** Find the total current $I$ in the wire.`,
      parts: [ex(md`$I$ (A)`, 'pi*J0*a^2/2', ['J0', 'a'])],
      hints: [md`$I = \int_0^aJ_z\,2\pi r\,dr$: a ring of radius $r$ and width $dr$ has area $2\pi r\,dr$.`],
      sol: md`
        **1. Law.** $I = \int_S\mathbf J\cdot d\mathbf S$ over the cross-section, in rings of area $2\pi r\,dr$.

        **2. Integrate.**
        $$I = \int_0^aJ_0\left(1 - \frac{r^2}{a^2}\right)2\pi r\,dr = 2\pi J_0\left[\frac{a^2}{2} - \frac{a^2}{4}\right] \qquad \boxed{I = \frac{\pi J_0a^2}{2}\ \ \text{A}}$$
        **Check.** Half of $J_0\pi a^2$: the density falls from $J_0$ on the axis to zero at the surface, and the outer rings, which hold the most area, carry the least ✓. Units: (A/m²)(m²) = A ✓.
      ` }),
    P({ src: 'Chen style B #2(b) · 7 pts', title: 'H by Ampère',
      q: md`**(b) (7 pts)** Use Ampère's law to find $\mathbf H$ inside ($r < a$) and outside ($r > a$) the wire.`,
      parts: [ex(md`$H_\phi$ for $r < a$ (A/m)`, 'J0*r/2-J0*r^3/(4*a^2)', ['J0', 'a', 'r']), ex(md`$H_\phi$ for $r > a$ (A/m)`, 'J0*a^2/(4*r)', ['J0', 'a', 'r'])],
      hints: [md`A circle of radius $r$: $H_\phi\,2\pi r = I_{\text{enc}}(r)$, where $I_{\text{enc}}(r)$ is the integral of part (a) stopped at $r$.`],
      sol: md`
        **1. Law.** $\oint\mathbf H\cdot d\mathbf l = I_{\text{enc}}$. Symmetry makes $\mathbf H = H_\phi(r)\,\hat\phi$, so the left side is $H_\phi\,2\pi r$.

        **2. Inside.** $I_{\text{enc}}(r) = 2\pi J_0\left(\dfrac{r^2}{2} - \dfrac{r^4}{4a^2}\right)$. Divide by $2\pi r$:
        $$\boxed{H_\phi = J_0\left(\frac r2 - \frac{r^3}{4a^2}\right)\ \ \text{A/m}\quad (r < a)}$$
        **3. Outside,** all of $I$ is enclosed:
        $$\boxed{H_\phi = \frac{I}{2\pi r} = \frac{J_0a^2}{4r}\ \ \text{A/m}\quad (r > a)}$$
        Direction: $+\hat\phi$, by the RHR around a $+z$ current.

        **Check.** At $r = a$ both give $J_0a/4$: continuous, as it must be with no surface current ✓. Point form: $\frac1r\frac{d}{dr}(rH_\phi) = J_0(1 - r^2/a^2) = J_z$ ✓.
      ` }),
    P({ src: 'Chen style B #2(c) · 7 pts', title: 'Where H peaks',
      q: md`**(c) (7 pts)** At what radius is $|\mathbf H|$ largest, and how large is it there?`,
      parts: [ex(md`$r$ at the maximum (m)`, 'a*sqrt(2/3)', ['a']), ex(md`$H_{\max}$ (A/m)`, 'sqrt(6)*J0*a/9', ['J0', 'a'])],
      hints: [md`Outside, $H_\phi$ only falls. Inside, set $dH_\phi/dr = 0$.`],
      sol: md`
        **1. Outside,** $H_\phi \propto 1/r$ only falls, so the maximum is at $r \le a$.

        **2. Inside,** $\dfrac{dH_\phi}{dr} = J_0\left(\dfrac12 - \dfrac{3r^2}{4a^2}\right) = 0$:
        $$\boxed{r_{\max} = a\sqrt{\tfrac23} \approx 0.816\,a\ \ \text{m}}\qquad \boxed{H_{\max} = J_0a\sqrt{\tfrac23}\left(\frac12 - \frac16\right) = \frac{\sqrt6}{9}\,J_0a \approx 0.272\,J_0a\ \ \text{A/m}}$$
        **Check.** $H_{\max} > H(a) = 0.25\,J_0a$: the peak is inside the wire, not at its surface. Near the surface $J\to0$, so $I_{\text{enc}}$ barely grows while the circumference $2\pi r$ keeps growing, and $H = I_{\text{enc}}/2\pi r$ turns down before $r = a$. With a uniform $J$ the peak would sit exactly at $r = a$.

        [[fig:h]]
      `,
      figs: { h: { svg: plotB2H(), cap: 'H_φ(r) in units of J₀a: it peaks inside the wire, at r = a√(2/3), then falls as 1/r outside.' } } }),

    // ---------------------------------------------------------------- Problem 3
    RF(md`
      ### Problem 3 (24 points): an interface carrying a current sheet

      The plane $y = 0$ separates region 1 ($y < 0$, $\mu_1 = 2\mu_0$) from region 2 ($y > 0$, $\mu_2 = 4\mu_0$). It carries a free surface current $\mathbf J_s = 4\,\hat z$ A/m. Just below the plane, in region 1,
      $$\mathbf H_1 = 3\,\hat x + 4\,\hat y + 2\,\hat z\ \ \text{A/m}$$

      [[fig:mat]]
    `, { mat: { svg: figB3(), cap: 'x to the right, y up, z out of the page. The sheet current flows out of the page.' } }),
    P({ src: 'Chen style B #3(a) · 8 pts', title: 'H above the sheet',
      q: md`**(a) (8 pts)** Find $\mathbf H_2$, the field just above the plane.`,
      parts: [N('H_{2x}', -1, 'A/m'), N('H_{2y}', 2, 'A/m'), N('H_{2z}', 2, 'A/m')],
      hints: [md`$\hat n = +\hat y$ points from region 1 into region 2. Tangential: $\mathbf H_{2t} = \mathbf H_{1t} + \mathbf J_s\times\hat n$. Normal: $\mu_1H_{1y} = \mu_2H_{2y}$.`],
      sol: md`
        **1. Boundary conditions,** with $\hat n = +\hat y$ from region 1 into region 2: $\hat n\times(\mathbf H_2 - \mathbf H_1) = \mathbf J_s$, equivalently $\mathbf H_{2t} = \mathbf H_{1t} + \mathbf J_s\times\hat n$; and $B_y$ continuous.

        **2. Tangential** ($x$ and $z$). $\mathbf J_s\times\hat n = 4\hat z\times\hat y = -4\hat x$, so $H_{2x} = 3 - 4 = -1$ A/m and $H_{2z} = 2$ A/m. The sheet changes only the tangential part perpendicular to $\mathbf J_s$.

        **3. Normal.** $H_{2y} = \dfrac{\mu_1}{\mu_2}H_{1y} = \dfrac24(4) = 2$ A/m.
        $$\boxed{\mathbf H_2 = -\hat x + 2\,\hat y + 2\,\hat z\ \ \text{A/m}}$$
        **Check.** $\hat n\times(\mathbf H_2 - \mathbf H_1) = \hat y\times(-4\hat x) = 4\hat z = \mathbf J_s$ ✓. The sheet's own field is $\tfrac12\mathbf J_s\times\hat n$ with $\hat n$ toward the point: $-2\hat x$ above, $+2\hat x$ below, a jump of $-4\hat x$ ✓.
      ` }),
    P({ src: 'Chen style B #3(b) · 8 pts', title: 'B on both sides',
      q: md`**(b) (8 pts)** Find $\mathbf B_1$ and $\mathbf B_2$ in terms of $\mu_0$.`,
      parts: [ex(md`$B_{1x}$ (T)`, '6*mu0', ['mu0']), ex(md`$B_{1y}$ (T)`, '8*mu0', ['mu0']), ex(md`$B_{1z}$ (T)`, '4*mu0', ['mu0']),
        ex(md`$B_{2x}$ (T)`, '-4*mu0', ['mu0']), ex(md`$B_{2y}$ (T)`, '8*mu0', ['mu0']), ex(md`$B_{2z}$ (T)`, '8*mu0', ['mu0'])],
      hints: [md`$\mathbf B = \mu\mathbf H$ on each side, with that side's own $\mu$.`],
      sol: md`
        **1. Law.** $\mathbf B = \mu\mathbf H$, each region with its own $\mu$.

        **2. Multiply.**
        $$\boxed{\mathbf B_1 = 2\mu_0\mathbf H_1 = \mu_0\left(6\,\hat x + 8\,\hat y + 4\,\hat z\right)\ \text{T}}$$
        $$\boxed{\mathbf B_2 = 4\mu_0\mathbf H_2 = \mu_0\left(-4\,\hat x + 8\,\hat y + 8\,\hat z\right)\ \text{T}}$$
        **Check.** $B_y = 8\mu_0$ on both sides: normal $B$ is continuous, sheet or no sheet ✓. $B_z$ doubles (4 to 8) because $H_z$ is continuous (it is tangential and parallel to $\mathbf J_s$) and $\mu$ doubles ✓.
      ` }),
    P({ src: 'Chen style B #3(c) · 8 pts', title: 'Magnetization',
      q: md`**(c) (8 pts)** Find the magnetizations $\mathbf M_1$ and $\mathbf M_2$.`,
      parts: [N('M_{1x}', 3, 'A/m'), N('M_{1y}', 4, 'A/m'), N('M_{1z}', 2, 'A/m'), N('M_{2x}', -3, 'A/m'), N('M_{2y}', 6, 'A/m'), N('M_{2z}', 6, 'A/m')],
      hints: [md`$\mathbf M = (\mu_r - 1)\mathbf H$.`],
      sol: md`
        **1. Law.** $\mathbf M = \chi_m\mathbf H = (\mu_r - 1)\mathbf H$: $\chi_{m1} = 1$, $\chi_{m2} = 3$.

        **2. Multiply.**
        $$\boxed{\mathbf M_1 = \mathbf H_1 = 3\,\hat x + 4\,\hat y + 2\,\hat z\ \ \text{A/m}}\qquad\boxed{\mathbf M_2 = 3\mathbf H_2 = -3\,\hat x + 6\,\hat y + 6\,\hat z\ \ \text{A/m}}$$
        **Check.** $\mathbf H + \mathbf M = \mathbf B/\mu_0$: $(6, 8, 4)$ below and $(-4, 8, 8)$ above ✓. The jump in tangential $\mathbf B/\mu_0$ counts **all** the surface current, free and bound: $\hat n\times(\mathbf B_2 - \mathbf B_1)/\mu_0 = \hat y\times(-10\hat x + 4\hat z) = 4\hat x + 10\hat z$ A/m. The free part is $4\hat z$; the bound part, $\mathbf M_1\times\hat y + \mathbf M_2\times(-\hat y) = 4\hat x + 6\hat z$, makes up the rest ✓.
      ` }),

    // ---------------------------------------------------------------- Problem 4
    RF(md`
      ### Problem 4 (25 points): a toroid with a two-layer core

      A toroid of $N$ turns has a rectangular cross-section, inner radius $a$ and outer radius $b$. Its core is two flat layers stacked along the axis: a lower layer of thickness $h_1$ and permeability $\mu_1$, and an upper layer of thickness $h_2$ and permeability $\mu_2$. The winding carries current $I$. Treat the toroid as ideal: the field is confined to the core. Express answers in terms of $N$, $I$, $a$, $b$, $h_1$, $h_2$, $\mu_1$, $\mu_2$ and $r$.

      [[fig:tor]]
    `, { tor: { svg: figB4(), cap: 'The toroid cut through its axis. The N turns wrap uniformly around the core (not drawn).' } }),
    P({ src: 'Chen style B #4(a) · 5 pts', title: 'H in the core',
      q: md`**(a) (5 pts)** Find $H_\phi$ in each layer of the core, $a < r < b$.`,
      parts: [ex(md`$H_\phi$ in layer 1 (A/m)`, 'N*I/(2*pi*r)', ['N', 'I', 'r']), ex(md`$H_\phi$ in layer 2 (A/m)`, 'N*I/(2*pi*r)', ['N', 'I', 'r'])],
      hints: [md`A circle of radius $r$ around the axis, inside the core, passes through every turn once, in either layer. Ampère's law for $\mathbf H$ counts free current only.`],
      sol: md`
        **1. Law.** $\oint\mathbf H\cdot d\mathbf l = I_{\text{free,enc}}$ on a circle of radius $r$ around the axis, inside the core.

        **2. Enclosed current.** The circle threads every turn once: $I_{\text{enc}} = NI$, whichever layer it lies in. The interface is horizontal and $\mathbf H = H_\phi\hat\phi$ is tangential to it, so $H_\phi$ is continuous across it.
        $$\boxed{H_\phi = \frac{NI}{2\pi r}\ \ \text{A/m in both layers}}$$
        **Check.** A circle in the hole ($r < a$) encloses nothing; one outside ($r > b$) encloses $NI$ up the inner side and $NI$ down the outer side, net zero. So $\mathbf H = 0$ outside the core ✓, which is why the ideal toroid confines its field.
      ` }),
    P({ src: 'Chen style B #4(b) · 5 pts', title: 'B in each layer',
      q: md`**(b) (5 pts)** Find $B_\phi$ in each layer.`,
      parts: [ex(md`$B_\phi$ in layer 1 (T)`, 'mu1*N*I/(2*pi*r)', ['mu1', 'N', 'I', 'r']), ex(md`$B_\phi$ in layer 2 (T)`, 'mu2*N*I/(2*pi*r)', ['mu2', 'N', 'I', 'r'])],
      hints: [md`$\mathbf B = \mu\mathbf H$ with the local $\mu$.`],
      sol: md`
        **1. Law.** $\mathbf B = \mu\mathbf H$ in each layer.
        $$\boxed{B_\phi = \frac{\mu_1NI}{2\pi r}\ \ \text{T (layer 1)}}\qquad\boxed{B_\phi = \frac{\mu_2NI}{2\pi r}\ \ \text{T (layer 2)}}$$
        **Check.** $B_\phi$ jumps across the interface by $\mu_2/\mu_1$. Allowed: it is tangential there; only normal $B$ must be continuous ✓.
      ` }),
    P({ src: 'Chen style B #4(c) · 5 pts', title: 'Flux and inductance',
      q: md`**(c) (5 pts)** Find the flux $\Psi$ through one turn (the core's cross-section) and the inductance $L$.`,
      parts: [ex(md`$\Psi$ (Wb)`, 'N*I*(mu1*h1+mu2*h2)*ln(b/a)/(2*pi)', ['N', 'I', 'mu1', 'mu2', 'h1', 'h2', 'a', 'b']),
        ex(md`$L$ (H)`, 'N^2*(mu1*h1+mu2*h2)*ln(b/a)/(2*pi)', ['N', 'mu1', 'mu2', 'h1', 'h2', 'a', 'b'])],
      hints: [md`$\Psi = \int B_\phi\,dr\,dz$ over the rectangle $a < r < b$, $0 < z < h_1 + h_2$. Each layer contributes its own strip.`, md`$L = N\Psi/I$: the flux links all $N$ turns.`],
      sol: md`
        **1. Flux through one turn.** $dS = dr\,dz$ on the cross-section; the layers are two strips of it, one above the other:
        $$\Psi = \int_a^b\left(\mu_1h_1 + \mu_2h_2\right)\frac{NI}{2\pi r}\,dr \qquad \boxed{\Psi = \frac{NI\left(\mu_1h_1 + \mu_2h_2\right)}{2\pi}\ln\frac ba\ \ \text{Wb}}$$
        **2. Inductance.** The flux links each of the $N$ turns, $\Lambda = N\Psi$, and $L = \Lambda/I$:
        $$\boxed{L = \frac{N^2\left(\mu_1h_1 + \mu_2h_2\right)}{2\pi}\ln\frac ba\ \ \text{H}}$$
        **Check.** $\mu_1 = \mu_2 = \mu$ with $h_1 + h_2 = h$: $L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$, the one-material toroid ✓. $h_2\to0$: only layer 1 is left ✓. $I$ cancels in $L$ ✓.
      ` }),
    P({ src: 'Chen style B #4(d) · 5 pts', title: 'A secondary turn',
      q: md`**(d) (5 pts)** The current becomes $I(t) = I_0\cos\omega t$. A one-turn secondary loop is wound once around the core, through the hole and around the outside, like one more turn of the winding. Find the amplitude of the emf induced in it.`,
      parts: [ex(md`$|\emf|_{\max}$ (V)`, 'omega*N*I0*(mu1*h1+mu2*h2)*ln(b/a)/(2*pi)', ['omega', 'N', 'I0', 'mu1', 'mu2', 'h1', 'h2', 'a', 'b'])],
      hints: [md`The secondary links the core flux once: $\emf = -d\Psi/dt$, with $\Psi$ from (c) and $I\to I_0\cos\omega t$.`],
      sol: md`
        **1. Law.** Faraday: $\emf = -d\Psi/dt$; one turn links the core flux once.

        **2. Flux.** From (c), $\Psi(t) = MI_0\cos\omega t$ with $M = \dfrac{N(\mu_1h_1 + \mu_2h_2)}{2\pi}\ln\dfrac ba$, the mutual inductance between winding and secondary.

        **3. Emf.** $\emf = MI_0\,\omega\sin\omega t$:
        $$\boxed{|\emf|_{\max} = \frac{\omega NI_0\left(\mu_1h_1 + \mu_2h_2\right)}{2\pi}\ln\frac ba\ \ \text{V}}$$
        **Check.** Units: (1/s)(H)(A) = V ✓. One factor of $N$, not two: the secondary has one turn ✓. The sign depends on which way the secondary is wound; the amplitude does not.
      ` }),
    P({ src: 'Chen style B #4(e) · 5 pts', title: 'A loop around the outside',
      q: md`**(e) (5 pts)** A second loop, a circle of radius $R > b$, lies in the toroid's midplane, centered on its axis: it goes around the **outside** of the whole toroid and does not pass through the hole. The current is still $I_0\cos\omega t$. The amplitude of this loop's emf is…`,
      parts: [mc('', [md`$0$`, md`the same as the secondary's in (d)`, md`$N$ times the secondary's`, md`nonzero, and larger for larger $R$`], 0,
        [null, md`The secondary threads the core; this loop does not. Its flat disk cuts the core with $\mathbf B$ lying **in** the disk ($\mathbf B$ is along $\hat\phi$), so no flux crosses it.`,
          md`$N$ belongs to the winding, not to this loop, which has one turn and links no flux.`,
          md`What counts is $\int\mathbf B\cdot d\mathbf S$ over the loop's disk. Inside the core $\mathbf B$ is parallel to the disk; outside the core $\mathbf B = 0$. The integral is zero for every $R$.`])],
      hints: [md`Faraday needs flux **through** the loop. Picture the loop's flat disk: which way does $\mathbf B$ point where the disk cuts the core?`],
      sol: md`
        !!trap The trap
          A loop can go around the whole toroid and still link no flux. Size and closeness do not matter; flux through the surface does.

        **1. Law.** $\emf = -d\Psi/dt$ with $\Psi = \int\mathbf B\cdot d\mathbf S$ over any surface bounded by the loop. Take its flat disk, $d\mathbf S = \hat z\,dS$.

        **2. Flux.** Where the disk cuts the core ($a < r < b$), $\mathbf B = B_\phi\hat\phi$ lies in the disk's plane: $\mathbf B\cdot\hat z = 0$. Everywhere else on the disk $\mathbf B = 0$. So $\Psi(t) = 0$ at all times.
        $$\boxed{|\emf|_{\max} = 0\ \ \text{V}}$$
        **Contrast with (d).** The secondary's surface is the core's cross-section, which $\mathbf B$ crosses head-on.

        **Fine print.** A real winding also advances once around the ring, so it acts like one extra loop of current $I$ around the axis. That gives this loop a small emf, which the ideal-toroid model leaves out.
      ` }),
  ];

  EM.lesson('e2-prac', { id: 'prac-chen-b', title: 'Practice exam: Prof. Chen style B', kind: 'mock', sub: '75 min · 100 pts · waves, a round wire, a current sheet, a toroid', steps: examB });
})();

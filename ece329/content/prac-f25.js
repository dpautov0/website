/* Two practice exams in the Fall 2025 Exam 2 format (unit e2-prac): four problems, 100 points, answers symbolic in the
   given parameters with units and directions, one sketch problem read off a given graph.
   prac-f25a: a toroid switched on through an exponential; a leaky capacitor on a source with a DC part; a sheet wave given
              as a snapshot of H, turned into E in space and in time; a discharging capacitor seen inside and outside the plates.
   prac-f25b: a coax with a magnetic sleeve and a ramped current; a capacitor pulled apart on a battery; a sheet in a
              dielectric driven by a given J_s(t); an AC capacitor with a dielectric core.
   Loaded before practice.js, so these head the practice unit. Every answer was derived independently and checked. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const { N } = EM;
  const PI = Math.PI;

  // ---------------------------------------------------------------- answer helpers
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });      // options are shuffled on screen: no fixed order gives the answer away
  const DISP = { mu0: '\\mu_0', chim: '\\chi_m', I0: 'I_0', tau: '\\tau', eps0: '\\epsilon_0', eps: '\\epsilon', epsr: '\\epsilon_r', omega: '\\omega', sigma: '\\sigma', V0: 'V_0', d0: 'd_0' };
  // a symbolic answer, checked by evaluating at random values of the variables
  const VR = {
    mu0: [0.5, 2], chim: [0.2, 5], N: [5, 50], I0: [0.5, 3], r: [0.3, 2], a: [0.2, 0.5], b: [1.2, 3], c: [0.6, 1.1], h: [0.3, 2],
    tau: [0.5, 2], t: [0.1, 3], T: [0.5, 2], A: [0.5, 2], d: [0.2, 1], eps: [0.5, 2], eps0: [0.5, 2], epsr: [1.5, 6],
    sigma: [0.2, 3], V0: [1, 5], omega: [0.5, 4], u: [0.2, 2], d0: [0.3, 1], R: [0.5, 2],
  };
  const X = (lbl, expr, names) => ({ lbl, expr, vars: Object.fromEntries(names.split(' ').map((k) => [k, VR[k]])), disp: DISP });
  const plot = (o) => PF.plot(Object.assign({ w: 340, h: 200 }, o));
  const DEG = PI / 180;

  // ================================================================ EXAM A figures
  // 1: the toroid from above (z out of the page) and one turn's cross-section (phi-hat into the page)
  function torTop() {
    const g = PF.fig({ scale: 1.15, alt: 'top view, z out of the page: an annular core between radius a and radius b; the windings cross it radially; each winding current comes out of the page at the inner face and goes into the page at the outer face' });
    const cx = 110, cy = 110, ra = 46, rb = 98;
    g.circle(cx, cy, rb, { cls: 'shade' }); g.circle(cx, cy, ra, { cls: 'bgfill' });
    g.circle(cx, cy, rb); g.circle(cx, cy, ra);
    for (const a of [40, 90, 140, 220, 270, 320]) {
      const k = Math.cos(a * DEG), s = Math.sin(a * DEG);
      g.line(cx + (ra + 6) * k, cy - (ra + 6) * s, cx + (rb - 6) * k, cy - (rb - 6) * s, { cls: 'thin' });
      g.odot(cx + ra * k, cy - ra * s, 5);
      g.otimes(cx + rb * k, cy - rb * s, 5);
    }
    g.dim(cx, cy, cx - ra, cy, 'a', { at: 't' });
    g.dim(cx, cy, cx + rb, cy, 'b', { at: 't' });
    g.label(cx + 72, cy + 22, '\\chi_m', 'c', 'small');
    return g.svg();
  }
  function torCut() {
    const g = PF.fig({ scale: 1.15, alt: 'cross-section through one turn at fixed phi: the core is the rectangle a < r < b, 0 < z < h, at distance a to b from the z-axis; the turn carries current up the inner face, outward across the top, down the outer face and back along the bottom; phi-hat points into the page' });
    const ax = 22, xa = 84, xb = 184, yt = 40, yb = 124;
    g.line(ax, 14, ax, 150, { cls: 'dim dash thin' });
    g.label(ax + 5, 12, 'z\\ \\text{axis}', 'bl', 'small accent');
    g.rect(xa, yt, xb - xa, yb - yt, { cls: 'shade' });
    g.label((xa + xb) / 2, (yt + yb) / 2, '\\chi_m', 'c');
    g.loopRect(xa, yt, xb - xa, yb - yt, { dir: 'cw' });
    g.label(xa - 9, (yt + yb) / 2, 'I', 'r');
    g.dim(ax, yb + 18, xa, yb + 18, 'a', { at: 'b' });
    g.dim(ax, yb + 40, xb, yb + 40, 'b', { at: 'b' });
    g.dim(xb + 16, yt, xb + 16, yb, 'h', { at: 'r' });
    g.otimes(xb + 52, yt - 6, 6, { lab: '\\hat\\phi', at: 'r' });
    return g.svg();
  }
  // 2: the leaky capacitor on its source
  function leakyFig() {
    const g = PF.fig({ alt: 'a parallel-plate capacitor of plate area A and gap d filled with a leaky material of permittivity epsilon and conductivity sigma; a source holds the top plate at V(t) relative to the bottom plate' });
    const x0 = 34, x1 = 174, yt = 40, yb = 100;
    g.rect(x0, yt, x1 - x0, yb - yt, { cls: 'shade' });
    g.line(x0, yt, x1, yt, { cls: 'thick' }); g.line(x0, yb, x1, yb, { cls: 'thick' });
    g.label((x0 + x1) / 2, (yt + yb) / 2, '\\epsilon,\\ \\sigma', 'c');
    g.label((x0 + x1) / 2, yt - 6, '\\text{area}\\ A', 'b', 'small');
    g.dim(x0 - 14, yt, x0 - 14, yb, 'd', { at: 'l' });
    g.pl([[x1, yt], [252, yt], [252, 54]]); g.pl([[x1, yb], [252, yb], [252, 86]]);
    g.circle(252, 70, 16); g.label(252, 70, '\\sim', 'c');
    g.label(274, 70, 'V(t)', 'l');
    g.label(266, 47, '+', 'c', 'small'); g.label(266, 93, '-', 'c', 'small');
    return g.svg();
  }
  // 3: the given H snapshot, and the two sketches of the solution
  const E30 = 30 * PI, E60 = 60 * PI;
  const plotA3h = () => plot({
    x: [0, 17.5], y: [-0.62, 0.36], zero: true, xl: 'z\\ (\\text{m})', yl: 'H_y\\ (\\text{A/m})',
    xt: [3, 6, 9, 12, 15], yt: [[0.25, '0.25'], [-0.5, '-0.5']],
    curves: [{ pts: [[0, 0], [3, 0], [3, 0.25], [6, 0.25], [6, -0.5], [9, -0.5], [15, 0], [17.5, 0]] }],
  });
  const plotA3z = () => plot({
    w: 380, h: 210, x: [-18, 18], y: [-215, 125], zero: true, xl: 'z\\ (\\text{m})', yl: 'E_x\\ (\\text{V/m})',
    xt: [-15, -9, -6, -3, 3, 6, 9, 15], yt: [[E30, '30\\pi'], [-E60, '-60\\pi']],
    curves: [{ pts: [[-18, 0], [-15, 0], [-9, -E60], [-6, -E60], [-6, E30], [-3, E30], [-3, 0], [3, 0], [3, E30], [6, E30], [6, -E60], [9, -E60], [15, 0], [18, 0]] }],
    pts: [{ x: 7.5, y: -E60 }, { x: -4.5, y: E30 }, { x: -13.5, y: -15 * PI }],
  });
  const plotA3t = () => plot({
    w: 360, h: 210, x: [0, 80], y: [-215, 125], zero: true, xl: 't\\ (\\text{ns})', yl: 'E_x\\ (\\text{V/m})',
    xt: [20, 40, 50, 60], yt: [[E30, '30\\pi'], [-E60, '-60\\pi']],
    curves: [{ pts: [[0, 0], [20, 0], [40, -E60], [50, -E60], [50, E30], [60, E30], [60, 0], [80, 0]] }],
    pts: [{ x: 30, y: -E30 }, { x: 45, y: -E60 }, { x: 55, y: E30 }],
  });
  // 4: the discharging capacitor, with a midplane circle outside the plates
  function dischargeFig() {
    const g = PF.fig({ alt: 'side view: two circular plates of radius R a distance d apart along z, the bottom plate positive; E points up between them; leads run along the axis above and below to a distant resistor; a dashed circle of radius r larger than R lies in the midplane, outside the plates' });
    const cx = 160, R0 = 80, yt = 52, yb = 136, ym = 94;
    g.line(cx, 10, cx, yt, { cls: 'thick' }); g.line(cx, yb, cx, 182, { cls: 'thick' });
    g.line(cx - R0, yt, cx + R0, yt, { cls: 'thick' }); g.line(cx - R0, yb, cx + R0, yb, { cls: 'thick' });
    for (const x of [cx - 62, cx - 34, cx + 34, cx + 62]) g.arrow(x, yb - 6, x, yt + 7, { cls: 'dim thin', hs: 5 });
    g.label(cx - 48, yt + 14, '\\mathbf E', 'c', 'small');
    g.ellipse(cx, ym, 122, 15, { cls: 'dash' });
    g.label(cx + 122, ym + 12, 'r > R', 'tl', 'small');
    g.label(cx + R0 + 4, yb + 4, '+', 'tl', 'small'); g.label(cx + R0 + 4, yt - 4, '-', 'bl', 'small');
    g.dim(cx, yb + 22, cx + R0, yb + 22, 'R', { at: 'b' });
    g.dim(cx - 140, yt, cx - 140, yb, 'd', { at: 'l' });
    g.label(cx + 6, 14, '\\text{lead to a distant resistor}', 'l', 'small');
    g.arrow(cx + 150, 178, cx + 150, 146, { cls: 'dim', hs: 6 }); g.label(cx + 155, 150, '\\hat z', 'l', 'small accent');
    return g.svg();
  }

  // ================================================================ EXAM A
  const examA = [
    R(md`
      **75 minutes, 100 points, four problems**, in the format of the [Fall 2025 Exam 2](#/l/past-f25) (7:00–8:15 PM on the real paper). Closed book and closed notes; no calculators; **one 4″×6″ index card of handwritten notes**. Show all your work and reasoning for each answer. All answers include units wherever appropriate. No credit for work on scratch pages.

      | Problem | What it asks | Points |
      |---|---|---|
      | 1 | A toroid with a magnetic core, switched on: $\mathbf H$, $\mathbf B$, $\mathbf M$ at an instant; the winding's emf and its direction; inductance and energy | 30 |
      | 2 | A leaky capacitor on a source with a DC part: conduction and displacement current | 15 |
      | 3 | A sheet-launched wave given as a snapshot of $\mathbf H$: sketch $\mathbf E$ in space on both sides, and in time | 30 |
      | 4 | A discharging capacitor: Ampère–Maxwell, $\Psi_e$, $\mathbf H$ inside and outside the plates | 25 |

      **Topics it draws on.** [Ampère's law](#/l/t5-ampere), [magnetic materials](#/l/t13-materials), [flux](#/l/t7-flux), [Faraday and Lenz](#/l/t8-faraday), [inductance and energy](#/l/t11-inductance), [capacitance and conductance](#/l/t2-capacitance), [relaxation](#/l/t3-relaxation), [displacement current](#/l/t12-displacement), [sheet waves](#/l/t15-sheet-waves), [traveling waveforms](#/l/t14-wave-eq).

      **How to use it.** Set a 75-minute timer and work on paper. Then enter your answers. Symbolic boxes take expressions in the given parameters, such as <code>I0*(1-exp(-t/tau))</code>, <code>mu0*(1+chim)</code> or <code>ln(b/a)</code>; the variables each box accepts are listed under it. Directions and units are choices. Sketches are checked through values read off them; the solutions draw them. Constants: $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = 8.854\times10^{-12}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$.
    `),

    // ---------------------------------------------------------------- A1
    RF(md`
      ### Problem 1 (30 points): a toroid with a magnetic core, switched on

      A toroid of rectangular cross-section has inner radius $a$, outer radius $b$ and height $h$. Its axis is the $z$-axis, and its core fills $a < r < b$, $0 < z < h$. The core is a linear magnetic material with susceptibility $\chi_m > 0$. $N$ turns ($N$ is a number) are wound tightly around it. In each turn the current runs up the inner face $r = a$ (along $+\hat z$), outward across the top, down the outer face $r = b$, and back across the bottom. At $t = 0$ a source is connected, and
      $$I(t) = I_0\left(1 - e^{-t/\tau}\right),\qquad t \ge 0$$
      with $I = 0$ before. Ignore the field of the leads.

      [[fig:tor]]
    `, { tor: PF.row([{ svg: torTop(), cap: 'From above ($z$ out of the page): the current comes up (⊙) at the inner face and goes down (⊗) at the outer face.' }, { svg: torCut(), cap: 'One turn, cut at fixed $\\phi$: $\\hat\\phi$ points into the page.' }]) }),
    P({ src: 'Fall 2025 style A #1(a) · 10 pts', title: 'H, B and M at t = τ ln 2',
      q: md`At $t = \tau\ln2$, find the magnitudes and directions of $\mathbf H$, $\mathbf B$ and $\mathbf M$ in the core at radius $r$ ($a < r < b$). Include units.`,
      parts: [
        X(md`$|\mathbf H|$ in A/m (use chim, N, I0, r)`, 'N*I0/(4*pi*r)', 'chim N I0 r'),
        X(md`$|\mathbf B|$ in T (use mu0, chim, N, I0, r)`, 'mu0*(1+chim)*N*I0/(4*pi*r)', 'mu0 chim N I0 r'),
        X(md`$|\mathbf M|$ in A/m (use chim, N, I0, r)`, 'chim*N*I0/(4*pi*r)', 'chim N I0 r'),
        MC('$\\mathbf H$, $\\mathbf B$ and $\\mathbf M$ all point along', [md`$+\hat\phi$ (counterclockwise seen from $+z$)`, md`$-\hat\phi$ (clockwise seen from $+z$)`, md`$+\hat z$ (along the inner-face current)`, md`$+\hat r$ (outward, from $a$ toward $b$)`], 0,
          [null, md`That is the field of a current along $-\hat z$ on the inner face. Thumb along $+\hat z$: the fingers curl along $+\hat\phi$.`, md`$+\hat z$ is the current on the inner face; $\mathbf H$ circles that current, around the ring.`, md`$+\hat r$ is the way the current crosses the top face. $\mathbf H$ circles the inner-face current that Ampère's circle encloses, and a radial $\mathbf B$ would send net flux out of a closed cylinder around the axis ($\nabla\cdot\mathbf B \ne 0$).`]),
      ],
      hints: [md`$e^{-\ln2} = \tfrac12$, so $I = I_0/2$ at that instant.`, md`Ampère for $\mathbf H$ (free current only) on a circle of radius $r$ inside the core: it is pierced by the $N$ inner-face wires, so $H_\phi\,2\pi r = NI$. Then $\mathbf B = \mu_0(1 + \chi_m)\mathbf H$ and $\mathbf M = \chi_m\mathbf H$.`],
      sol: md`
        **1. Governing law.** Ampère's law for $\mathbf H$ counts free current only, so the core does not enter it. Take a circle of radius $r$ in the core, counterclockwise from $+z$ ($d\mathbf S = +\hat z$). The $N$ inner-face wires pierce its disk, each carrying $I$ along $+\hat z$; the outer-face wires lie outside it.
        $$\oint_C\mathbf H\cdot d\mathbf l = H_\phi\,2\pi r = NI \quad\Rightarrow\quad H_\phi = \frac{NI}{2\pi r}$$
        **2. The instant.** $I(\tau\ln2) = I_0\left(1 - e^{-\ln2}\right) = \tfrac12I_0$.

        **3. The material.** $\mathbf B = \mu_0(1 + \chi_m)\mathbf H$ and $\mathbf M = \chi_m\mathbf H$:
        $$\boxed{\mathbf H = \frac{NI_0}{4\pi r}\,\hat\phi\ \ \text{A/m}}\qquad\boxed{\mathbf B = \frac{\mu_0(1 + \chi_m)NI_0}{4\pi r}\,\hat\phi\ \ \text{T}}\qquad\boxed{\mathbf M = \frac{\chi_mNI_0}{4\pi r}\,\hat\phi\ \ \text{A/m}}$$
        **4. Direction.** Thumb along the inner-face current ($+\hat z$): the fingers curl along $+\hat\phi$, counterclockwise from $+z$ and into the page in the cross-section. $\mathbf B$ and $\mathbf M$ follow $\mathbf H$ because $\chi_m > 0$.

        **Check.** $\mathbf B = \mu_0(\mathbf H + \mathbf M)$ ✓. Units: (turns)(A)/m = A/m, and (H/m)(A/m) = T ✓. All three fall as $1/r$, strongest at the inner face.
      ` }),
    P({ src: 'Fall 2025 style A #1(b) · 10 pts', title: 'The emf of the winding',
      q: md`Find the emf $\emf(t)$ induced in the $N$ turns for $t > 0$, taking the positive sense **along the winding current**. When is its magnitude largest, what is that largest value, and which way does the emf push? Include units.`,
      parts: [
        X(md`$\emf(t)$ in V, positive along the current (use mu0, chim, N, h, a, b, I0, tau, t)`, '-mu0*(1+chim)*N^2*h*I0*ln(b/a)*exp(-t/tau)/(2*pi*tau)', 'mu0 chim N h a b I0 tau t'),
        MC('$|\\mathcal E|$ is largest', [md`at $t = 0^+$`, md`at $t = \tau$`, md`as $t \to \infty$`, md`at $t = \tau\ln2$`], 0,
          [null, md`At $t = \tau$ the emf has already fallen to $e^{-1}$ of its starting value.`, md`As $t \to \infty$ the current stops changing, so the emf goes to zero.`, md`That is when $I = I_0/2$ (part a); $dI/dt$ has halved by then.`]),
        X(md`$|\emf|_{\max}$ in V (use mu0, chim, N, h, a, b, I0, tau)`, 'mu0*(1+chim)*N^2*h*I0*ln(b/a)/(2*pi*tau)', 'mu0 chim N h a b I0 tau'),
        MC('The emf pushes', ['against the current at every $t > 0$', 'along the current at every $t > 0$', 'against the current until $t = \\tau$, then along it', 'along $+\\hat z$, out of the core'], 0,
          [null, 'Along the current would speed up the growth of the flux; Lenz forbids it.', md`$dI/dt = (I_0/\tau)e^{-t/\tau} > 0$ for every $t > 0$: the current never stops growing, so the sign never changes.`, 'An emf acts around its path, here the winding: along the current or against it.']),
      ],
      hints: [md`One turn bounds the rectangle $a < r < b$, $0 < z < h$ at fixed $\phi$, and $\mathbf B$ crosses it face-on: $\Psi_1 = \displaystyle\int_0^h\!\!\int_a^b B_\phi\,dr\,dz$.`, md`$\emf = -N\,d\Psi_1/dt$, and $dI/dt = (I_0/\tau)e^{-t/\tau}$.`],
      sol: md`
        **1. Flux through one turn.** A turn bounds the rectangle $a < r < b$, $0 < z < h$ at fixed $\phi$. With the path along the current, the RHR gives $d\mathbf S = +\hat\phi\,dr\,dz$, along $\mathbf B$. With $\mu = \mu_0(1 + \chi_m)$:
        $$\Psi_1 = \int_0^h\!\!\int_a^b\frac{\mu NI}{2\pi r}\,dr\,dz = \frac{\mu NIh}{2\pi}\ln\frac ba$$
        **2. Faraday for $N$ turns.** $\emf = -N\,d\Psi_1/dt$ with $dI/dt = (I_0/\tau)e^{-t/\tau}$:
        $$\boxed{\emf(t) = -\frac{\mu_0(1 + \chi_m)N^2hI_0}{2\pi\tau}\ln\frac ba\;e^{-t/\tau}\ \ \text{V}}$$
        **3. Largest** at $t = 0^+$, where the current rises fastest:
        $$\boxed{|\emf|_{\max} = \frac{\mu_0(1 + \chi_m)N^2hI_0}{2\pi\tau}\ln\frac ba\ \ \text{V}}$$
        It jumps to this value at the switch-on and decays with the same $\tau$ with which $I$ approaches $I_0$.

        **4. Direction.** $\emf < 0$ along the current for every $t > 0$: it pushes **against** the current. Lenz: the flux grows, so the winding opposes the growth of its own current (a back emf).

        **Check.** $|\emf| = L\,dI/dt$ with the $L$ of part (c) ✓. Units: (H/m)(m)(A)/(s) = H·A/s = V ✓. One factor of $N$ is in the field, the other counts the turns that link it.
      ` }),
    P({ src: 'Fall 2025 style A #1(c) · 10 pts', title: 'Inductance and stored energy',
      q: md`Find the inductance of the toroid, and the magnetic energy stored in it once the current has settled ($t \gg \tau$). Include units.`,
      parts: [
        X(md`$L$ in H (use mu0, chim, N, h, a, b)`, 'mu0*(1+chim)*N^2*h*ln(b/a)/(2*pi)', 'mu0 chim N h a b'),
        X(md`$W_m$ in J (use mu0, chim, N, h, a, b, I0)`, 'mu0*(1+chim)*N^2*h*I0^2*ln(b/a)/(4*pi)', 'mu0 chim N h a b I0'),
      ],
      hints: [md`$L = N\Psi_1/I$, with $\Psi_1$ from part (b).`, md`$W_m = \tfrac12LI^2$ with $I \to I_0$; or integrate $\tfrac12\mathbf B\cdot\mathbf H$ over the core.`],
      sol: md`
        **1. Definition.** Inductance is flux linkage per ampere, $L = N\Psi_1/I$:
        $$\boxed{L = \frac{\mu_0(1 + \chi_m)N^2h}{2\pi}\ln\frac ba\ \ \text{H}}$$
        **2. Energy.** For $t \gg \tau$, $I \to I_0$:
        $$\boxed{W_m = \tfrac12LI_0^2 = \frac{\mu_0(1 + \chi_m)N^2hI_0^2}{4\pi}\ln\frac ba\ \ \text{J}}$$
        **Check by the field.** $w_m = \tfrac12\mathbf B\cdot\mathbf H = \dfrac{\mu N^2I_0^2}{8\pi^2r^2}$, and a shell of the core has $dV = 2\pi rh\,dr$:
        $$\int_a^b\frac{\mu N^2I_0^2}{8\pi^2r^2}\,2\pi rh\,dr = \frac{\mu N^2hI_0^2}{4\pi}\ln\frac ba\ \checkmark$$
        $L$ grows as $N^2$ and with the core's $\mu$, and does not depend on $I$. And $|\emf|_{\max} = LI_0/\tau$ matches part (b) ✓.
      ` }),

    // ---------------------------------------------------------------- A2
    RF(md`
      ### Problem 2 (15 points): a leaky capacitor

      A parallel-plate capacitor has plate area $A$ and gap $d$. The material between the plates leaks: permittivity $\epsilon$, conductivity $\sigma$. A source holds the top plate at
      $$V(t) = V_0\left[1 + \cos(\omega t)\right]$$
      relative to the bottom plate. Ignore fringing.

      [[fig:leak]]
    `, { leak: { svg: leakyFig(), cap: 'The material conducts and polarizes: both kinds of current cross the gap.' } }),
    P({ src: 'Fall 2025 style A #2 · 15 pts', title: 'Conduction and displacement current',
      q: md`Find the conduction current $I_c(t)$ and the displacement current $I_d(t)$ through the material, both counted from the top plate toward the bottom plate; the current $I(t)$ the source delivers to the top plate; and the angular frequency $\omega^*$ at which the oscillating parts of $I_c$ and $I_d$ have equal amplitudes. Include units.`,
      parts: [
        X(md`$I_c(t)$ in A (use sigma, A, V0, d, omega, t)`, 'sigma*A*V0*(1+cos(omega*t))/d', 'sigma A V0 d omega t'),
        X(md`$I_d(t)$ in A (use eps, A, V0, d, omega, t)`, '-eps*A*V0*omega*sin(omega*t)/d', 'eps A V0 d omega t'),
        X(md`$I(t)$ in A (use sigma, eps, A, V0, d, omega, t)`, '(A*V0/d)*(sigma*(1+cos(omega*t))-eps*omega*sin(omega*t))', 'sigma eps A V0 d omega t'),
        X(md`$\omega^*$ in rad/s (use sigma, eps)`, 'sigma/eps', 'sigma eps'),
      ],
      hints: [md`$E = V/d$, from the top plate to the bottom one. Conduction: $J_c = \sigma E$. Displacement: $J_d = \partial D/\partial t = \epsilon\,\partial E/\partial t$.`, md`The lead current continues across the gap as conduction plus displacement current (Ampère–Maxwell), so $I = I_c + I_d$.`],
      sol: md`
        **1. Field.** No fringing: $E = V(t)/d$, uniform, pointing from the top plate to the bottom plate.

        **2. Conduction current.** Ohm's law, $\mathbf J_c = \sigma\mathbf E$, over the area $A$:
        $$\boxed{I_c(t) = \frac{\sigma A}{d}V(t) = \frac{\sigma AV_0}{d}\left[1 + \cos(\omega t)\right]\ \ \text{A}}$$
        **3. Displacement current.** $\mathbf J_d = \partial\mathbf D/\partial t$ with $\mathbf D = \epsilon\mathbf E$:
        $$\boxed{I_d(t) = \frac{\epsilon A}{d}\frac{dV}{dt} = -\frac{\epsilon AV_0\omega}{d}\sin(\omega t)\ \ \text{A}}$$
        **4. Source current.** Ampère–Maxwell: the circulation of $\mathbf H$ around the lead equals the total current through any surface it bounds, including one that passes through the gap. So the lead current continues inside as $I_c + I_d$:
        $$\boxed{I(t) = \frac{AV_0}{d}\Big[\sigma\left(1 + \cos\omega t\right) - \epsilon\omega\sin\omega t\Big]\ \ \text{A}}$$
        This is a conductance $G = \sigma A/d$ in parallel with a capacitance $C = \epsilon A/d$.

        **5. Equal amplitudes.** $\dfrac{\sigma AV_0}{d} = \dfrac{\epsilon AV_0\omega^*}{d}$ gives $\boxed{\omega^* = \sigma/\epsilon\ \ \text{rad/s}}$, the inverse of the relaxation time $\epsilon/\sigma$. Below $\omega^*$ the material behaves as a conductor, above it as a dielectric.

        **Check.** The DC part $V_0$ drives conduction current but no displacement current ($dV_0/dt = 0$). Units: (S/m)(m²)(V)/(m) = A and (F/m)(m²)(V)(1/s)/(m) = A ✓.
      ` }),

    // ---------------------------------------------------------------- A3
    RF(md`
      ### Problem 3 (30 points): a sheet-launched wave, given H

      A current sheet $\mathbf J_s = J_s(t)\,\hat x$ on the plane $z = 0$ launches waves into free space toward $+\hat z$ and $-\hat z$ ($\eta_0 = 120\pi\ \Omega$, $c = 3\times10^8$ m/s). The sheet carried current only between $t = 0$ and $t = 40$ ns. Below is the magnetic field $H_y(z)$ of the wave traveling toward $+\hat z$, as a snapshot at $t = 50$ ns.

      [[fig:h]]
    `, { h: { svg: plotA3h(), cap: md`$H_y(z)$ at $t = 50$ ns, $z > 0$: zero up to 3 m, $+0.25$ A/m from 3 to 6 m, $-0.5$ A/m from 6 to 9 m, then a linear return to zero at $z = 15$ m.` } }),
    P({ src: 'Fall 2025 style A #3(a) · 15 pts', title: 'Sketch E(z) at t = 50 ns',
      q: md`Sketch the electric field at $t = 50$ ns as a function of $z$ on **both** sides of the sheet, $-18 < z < 18$ m. Label the component of $\mathbf E$, its unit, and numbers on both axes. Then read these values off your sketch, and find the sheet current at $t = 25$ ns.`,
      parts: [
        MC('Component of $\\mathbf E$', [md`$E_x$`, md`$E_y$`, md`$E_z$`], 0,
          [null, md`$\mathbf E$ is perpendicular to $\mathbf H$ (along $y$) and lies along the sheet current, $\hat x$.`, md`A plane wave has no field along its direction of travel, $\pm\hat z$.`]),
        N('\\text{that component at}\\ z = 7.5\\ \\text{m}', -60 * PI, 'V/m'),
        N('\\text{that component at}\\ z = -4.5\\ \\text{m}', 30 * PI, 'V/m'),
        N('\\text{that component at}\\ z = -13.5\\ \\text{m}', -15 * PI, 'V/m'),
        N('J_s\\ \\text{at}\\ t = 25\\ \\text{ns}', 1, 'A/m'),
      ],
      hints: [md`For $z > 0$ the wave travels along $+\hat z$, and $\mathbf E\times\mathbf H$ must point that way: $\hat x\times\hat y = \hat z$, so $E_x = +\eta_0H_y$.`, md`The sheet launches $\mathbf E = -\tfrac{\eta_0}{2}\mathbf J_s(t - |z|/c)$ on both sides, so $E_x(-z) = E_x(z)$. The field at distance $|z|$ at $t = 50$ ns left the sheet at $t' = 50 - |z|/0.3$ (ns, m).`],
      sol: md`
        **1. Governing relations.** In each wave $|\mathbf E| = \eta_0|\mathbf H|$, with $\mathbf E\times\mathbf H$ along the travel. The sheet launches $\mathbf E = -\tfrac{\eta_0}{2}\mathbf J_s(t - |z|/c)$ on **both** sides, so $\mathbf E$ is the same at $\pm z$.

        **2. $z > 0$.** The travel is $+\hat z = \hat x\times\hat y$, so $E_x = \eta_0H_y$: $0.25$ A/m becomes $30\pi = 94.2$ V/m, and $-0.5$ A/m becomes $-60\pi = -188$ V/m.

        **3. $z < 0$.** The mirror image, $E_x(-z) = E_x(z)$: $E_x$ is even in $z$. (There $H_y = -E_x/\eta_0$: $\mathbf H$ is odd.)

        [[fig:e]]

        **4. Values.**
        - $E_x(7.5\ \text{m}) = \eta_0(-0.5) = -60\pi = -188$ V/m.
        - $E_x(-4.5\ \text{m}) = E_x(4.5\ \text{m}) = \eta_0(0.25) = 30\pi = 94.2$ V/m.
        - At $13.5$ m, $H_y$ is three quarters of the way up the ramp from $-0.5$ (9 m) to 0 (15 m): $-0.125$ A/m. So $E_x(-13.5\ \text{m}) = -15\pi = -47.1$ V/m.

        **5. Sheet current.** For $z > 0$, $\mathbf H = \tfrac12\mathbf J_s\times\hat z = -\tfrac12J_s\hat y$, so $J_s(t') = -2H_y$. The field at $z = (0.3\ \text{m/ns})(50 - 25)\ \text{ns} = 7.5$ m left the sheet at $t' = 25$ ns:
        $$\boxed{J_s(25\ \text{ns}) = -2(-0.5) = +1\ \text{A/m}}$$
        **Check.** The fronts sit at $|z| = c(50\ \text{ns}) = 15$ m, since the sheet switched on at $t = 0$ ✓. The jumps at $|z| = 3$ and 6 m are the switch-off (40 ns) and the sudden reversal (30 ns). $\mathbf E$ opposes $\mathbf J_s$ ($E_x = -60\pi$ while $J_s = +1$): the sheet delivers power to the waves ✓.
      `,
      figs: { e: { svg: plotA3z(), cap: md`$E_x(z)$ at $t = 50$ ns: $\eta_0H_y$ for $z > 0$, its mirror image for $z < 0$. Dots: the three values read off.` } } }),
    P({ src: 'Fall 2025 style A #3(b) · 15 pts', title: 'Sketch E(t) at z = −6 m',
      q: md`Sketch the electric field as a function of time at $z = -6$ m, for $0 \le t \le 80$ ns. Label the component, the unit and numbers on both axes. Then read these values off your sketch.`,
      parts: [
        MC('Component of $\\mathbf E$', [md`$E_x$`, md`$E_y$`, md`$E_z$`], 0,
          [null, md`$\mathbf E$ lies along the sheet current, $\hat x$, on both sides.`, md`No field along the direction of travel.`]),
        N('\\text{the field first arrives at}\\ t', 20, 'ns'),
        N('\\text{that component at}\\ t = 30\\ \\text{ns}', -30 * PI, 'V/m'),
        N('\\text{that component at}\\ t = 45\\ \\text{ns}', -60 * PI, 'V/m'),
        N('\\text{that component at}\\ t = 55\\ \\text{ns}', 30 * PI, 'V/m'),
        N('\\text{zero for good after}\\ t', 60, 'ns'),
      ],
      hints: [md`$|z|/c = 6/0.3 = 20$ ns. At $z = -6$ m the field is what the sheet launched 20 ns earlier: $E_x(-6\ \text{m}, t) = E_x(0, t - 20\ \text{ns})$.`, md`Read $E_x(0, t')$ off the snapshot: the field at distance $|z|$ at $t = 50$ ns left the sheet at $t' = 50 - |z|/0.3$. What is farthest out in $z$ happened first in time.`],
      sol: md`
        **1. Governing relation.** The sheet's $E_x$ travels outward unchanged on both sides: $E_x(z, t) = E_x(0, t - |z|/c)$. At $|z| = 6$ m the delay is $6/0.3 = 20$ ns.

        **2. The history at the sheet**, from the snapshot ($t' = 50 - |z|/0.3$):

        | $\lvert z\rvert$ at 50 ns (m) | 15 → 9 | 9 → 6 | 6 → 3 | 3 → 0 |
        |---|---|---|---|---|
        | left the sheet at $t'$ (ns) | 0 → 20 | 20 → 30 | 30 → 40 | 40 → 50 |
        | $E_x(0, t')$ (V/m) | 0 → $-60\pi$, a ramp | $-60\pi$ | $+30\pi$ | 0 |

        **3. At $z = -6$ m**, the same history 20 ns later ($t$ in ns):
        $$E_x(-6\ \text{m}, t) = \begin{cases} 0, & t < 20\\ -3\pi(t - 20), & 20 < t < 40\\ -60\pi, & 40 < t < 50\\ +30\pi, & 50 < t < 60\\ 0, & t > 60\end{cases}\quad\text{V/m}$$

        [[fig:t]]

        **4. Values.** The field arrives at $t = 20$ ns, rising from zero. $E_x(30\ \text{ns}) = -30\pi = -94.2$ V/m, $E_x(45\ \text{ns}) = -60\pi = -188$ V/m, $E_x(55\ \text{ns}) = +30\pi = 94.2$ V/m, and it is zero for good after $60$ ns.

        **Check.** $z = -6$ m is on the far side of the sheet from the snapshot, but $\mathbf E$ is even in $z$, so it records the same trace as $z = +6$ m. In the snapshot the ramp is farthest out; in time it comes first ✓. The trace at $t = 50$ ns jumps from $-60\pi$ to $+30\pi$, matching the snapshot's jump at $|z| = 6$ m ✓.
      `,
      figs: { t: { svg: plotA3t(), cap: md`$E_x(t)$ at $z = -6$ m: the sheet's history, delayed 20 ns. Dots: the three values read off.` } } }),

    // ---------------------------------------------------------------- A4
    RF(md`
      ### Problem 4 (25 points): a discharging capacitor

      Two circular plates of radius $R$ lie a distance $d$ apart along $z$, with air between them. The capacitor was charged with the bottom plate ($z = 0$) positive. At $t = 0$ it starts discharging through a distant resistor, connected by leads that run along the axis above and below the plates. Between the plates
      $$\mathbf E = \frac{V_0}{d}\,e^{-t/\tau}\,\hat z,\qquad t > 0$$
      Ignore fringing: outside $r = R$ there is no electric field between the plate planes.

      [[fig:dis]]
    `, { dis: { svg: dischargeFig(), cap: md`Side view. The dashed circle lies in the midplane $z = d/2$, outside the plates.` } }),
    P({ src: 'Fall 2025 style A #4(a) · 8 pts', title: 'The law for H',
      q: md`Write the one integral Maxwell equation that gives $\mathbf H$ in the gap, at any radius (inside or outside the plates). Which of its terms is zero for a disk in the midplane $z = d/2$?`,
      parts: [
        MC('The equation', [md`$\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S + \dfrac{d}{dt}\int_S\mathbf D\cdot d\mathbf S$`, md`$\oint_C\mathbf E\cdot d\mathbf l = -\dfrac{d}{dt}\int_S\mathbf B\cdot d\mathbf S$`, md`$\oint_S\mathbf D\cdot d\mathbf S = \int_V\rho\,dV$`, md`$\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S$`], 0,
          [null, md`Faraday gives the circulation of $\mathbf E$ from a changing $\mathbf B$. Here $\mathbf E$ is given and $\mathbf H$ is wanted.`, md`Gauss's law gives the flux of $\mathbf D$ from enclosed charge; it says nothing about $\mathbf H$.`, md`Without the displacement term, $\mathbf H$ would vanish in the gap (no conduction current there) yet not around the leads: the same loop would give two answers.`]),
        MC('For a disk in the midplane, the term that is zero is', [md`$\int_S\mathbf J\cdot d\mathbf S$: no conduction current crosses the midplane`, md`the displacement term: the capacitor is discharging, not charging`, md`$\oint_C\mathbf H\cdot d\mathbf l$ for $r > R$: there is no field outside the plates`, 'none of them'], 0,
          [null, md`Discharging changes $\mathbf D$ just as charging does; only the sign of $d\mathbf D/dt$ differs.`, md`$\mathbf E = 0$ outside the plates, but a circle of radius $r > R$ still encloses the changing flux inside $r = R$.`, md`The air does not conduct and no lead crosses $z = d/2$: $\mathbf J = 0$ on the whole midplane.`]),
      ],
      hints: [md`$\mathbf H$ is wanted, from a known, changing $\mathbf E$.`, md`Where is there conduction current? Only in the leads, which end at the plates.`],
      sol: md`
        **Ampère–Maxwell:**
        $$\boxed{\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S + \frac{d}{dt}\int_S\mathbf D\cdot d\mathbf S}$$
        For a disk in the midplane the conduction term is zero at every radius: air does not conduct, and the leads end at the plates, so no wire crosses $z = d/2$. The circulation of $\mathbf H$ is set entirely by the displacement current $d\Psi_e/dt$ through the disk. (Writing all four Maxwell equations would earn nothing on the real paper.)
      ` }),
    P({ src: 'Fall 2025 style A #4(b) · 8 pts', title: 'Electric flux through a midplane disk',
      q: md`Find the electric flux $\Psi_e = \int_S\mathbf D\cdot d\mathbf S$ through a disk of radius $r$ in the midplane, with $d\mathbf S = +\hat z\,dS$, for $r < R$ and for $r > R$. Give its unit.`,
      parts: [
        X(md`$\Psi_e$ for $r < R$ (use eps0, R, r, V0, d, t, tau)`, 'eps0*pi*r^2*V0*exp(-t/tau)/d', 'eps0 R r V0 d t tau'),
        X(md`$\Psi_e$ for $r > R$ (use eps0, R, r, V0, d, t, tau)`, 'eps0*pi*R^2*V0*exp(-t/tau)/d', 'eps0 R r V0 d t tau'),
        MC('The unit of $\\Psi_e$', ['C', 'V·m', 'C/m²', 'Wb'], 0,
          [null, md`V·m is the unit of $\int\mathbf E\cdot d\mathbf S$. Electric flux in this course is the flux of $\mathbf D$, which carries $\epsilon_0$: coulombs.`, md`C/m² is $\mathbf D$ itself; integrating over an area adds m².`, 'The weber is the unit of magnetic flux.']),
      ],
      hints: [md`$\mathbf D = \epsilon_0\mathbf E$, uniform over the plates and zero outside them (no fringing).`],
      sol: md`
        **1. Definition.** $\Psi_e = \int_S\mathbf D\cdot d\mathbf S$, in coulombs. Between the plates $\mathbf D = \epsilon_0\mathbf E = \dfrac{\epsilon_0V_0}{d}e^{-t/\tau}\hat z$; outside $r = R$, $\mathbf D = 0$.

        **2. Inside** ($r < R$): $\mathbf D$ is uniform over the whole disk.
        $$\boxed{\Psi_e = \frac{\epsilon_0\pi r^2V_0}{d}e^{-t/\tau}\ \ \text{C}}$$
        **3. Outside** ($r > R$): only the part of the disk inside $r = R$ carries flux.
        $$\boxed{\Psi_e = \frac{\epsilon_0\pi R^2V_0}{d}e^{-t/\tau}\ \ \text{C}}$$
        **Check.** At $r = R$ the two agree ✓. The outside value is the charge on the bottom plate (Gauss's law around it), $Q = CV$ with $C = \epsilon_0\pi R^2/d$ ✓.
      ` }),
    P({ src: 'Fall 2025 style A #4(c) · 9 pts', title: 'H inside and outside the plates',
      q: md`Find $\mathbf H(r, t)$ in the midplane for $r > R$ (outside the plates) and for $r < R$, with its direction.`,
      parts: [
        X(md`$H_\phi$ for $r > R$, in A/m, signed (use eps0, R, r, V0, d, t, tau)`, '-eps0*R^2*V0*exp(-t/tau)/(2*r*d*tau)', 'eps0 R r V0 d t tau'),
        X(md`$H_\phi$ for $r < R$, in A/m, signed (use eps0, R, r, V0, d, t, tau)`, '-eps0*r*V0*exp(-t/tau)/(2*d*tau)', 'eps0 R r V0 d t tau'),
        MC('$\\mathbf H$ points along', [md`$-\hat\phi$: clockwise seen from $+z$`, md`$+\hat\phi$: counterclockwise seen from $+z$`, md`$-\hat z$: along the displacement current`, md`nowhere for $r > R$: $\mathbf H = 0$ outside the plates`], 0,
          [null, md`That is the field of a growing $\mathbf D$ along $+\hat z$ (charging). Here $\mathbf D$ shrinks: the displacement current points along $-\hat z$.`, md`$\mathbf H$ circles the displacement current; it is not along it.`, md`$\mathbf E = 0$ outside the plates, but the circle encloses the changing flux inside $r = R$.`]),
      ],
      hints: [md`Symmetry: $\mathbf H = H_\phi(r, t)\hat\phi$. On a circle of radius $r$, counterclockwise from $+z$: $H_\phi\,2\pi r = d\Psi_e/dt$.`, md`Use the $\Psi_e$ of part (b) for each region.`],
      sol: md`
        **1. Governing law.** Ampère–Maxwell on a circle of radius $r$ in the midplane, counterclockwise from $+z$ ($d\mathbf S = +\hat z$), with no conduction current through its disk. By symmetry $\mathbf H = H_\phi(r, t)\hat\phi$:
        $$H_\phi\,2\pi r = \frac{d\Psi_e}{dt}$$
        **2. Outside** ($r > R$): $\dfrac{d\Psi_e}{dt} = -\dfrac{\epsilon_0\pi R^2V_0}{d\tau}e^{-t/\tau}$, so
        $$\boxed{H_\phi = -\frac{\epsilon_0R^2V_0}{2rd\tau}\,e^{-t/\tau}\ \ \text{A/m}}$$
        **3. Inside** ($r < R$):
        $$\boxed{H_\phi = -\frac{\epsilon_0rV_0}{2d\tau}\,e^{-t/\tau}\ \ \text{A/m}}$$
        **4. Direction.** $\mathbf D$ points along $+\hat z$ and shrinks, so the displacement current points along $-\hat z$, and $\mathbf H$ circles it **clockwise** seen from $+z$ ($-\hat\phi$). The leads agree: the discharge current leaves the positive bottom plate down its lead and enters the top plate from above, along $-\hat z$ on the whole axis.

        **Check.** The two results agree at $r = R$ ✓. Outside, $|H_\phi| = I/2\pi r$ with $I = \dfrac{\epsilon_0\pi R^2V_0}{d\tau}e^{-t/\tau} = \dfrac{CV_0}{\tau}e^{-t/\tau}$, the discharge current in the leads: seen from outside, the gap looks like the rest of the wire ✓. Units: (F/m)(m²)(V)/(m·m·s) = A/m ✓.
      ` }),
  ];
  EM.lesson('e2-prac', { id: 'prac-f25a', title: 'Practice exam: Fall 2025 style A', kind: 'mock', sub: '75 min · 100 pts · four problems in the Fall 2025 format', steps: examA });

  // ================================================================ EXAM B figures
  // 1: the coax end-on (current out of the page) and cut along its axis, with the one-turn loop in the sleeve
  function coaxEnd() {
    const g = PF.fig({ alt: 'cross-section of the coax with the inner current out of the page: a thin inner tube of radius a, air out to radius c, a shaded magnetic sleeve from c to the thin outer conductor at b; the pickup loop is seen edge-on as a thick radial segment from r = c to r = b along +x' });
    const cx = 110, cy = 110, ra = 14, rc = 48, rb = 88;
    g.circle(cx, cy, rb, { cls: 'shade' }); g.circle(cx, cy, rc, { cls: 'bgfill' });
    g.circle(cx, cy, rb, { cls: 'thick' }); g.circle(cx, cy, rc, { cls: 'dim' }); g.circle(cx, cy, ra, { cls: 'thick' });
    g.odot(cx, cy, 5);
    g.line(cx + rc, cy, cx + rb, cy, { cls: 'thick' });
    g.label(cx + (rc + rb) / 2, cy - 6, '\\text{loop}', 'b', 'small');
    g.line(cx, cy + 7, cx, cy + rb, { cls: 'dim thin' });
    for (const [r, l] of [[ra, 'a'], [rc, 'c'], [rb, 'b']]) { g.line(cx - 4, cy + r, cx + 4, cy + r, { cls: 'dim' }); g.label(cx + 7, cy + r, l, 'l', 'small'); }
    g.label(cx - 48, cy + 48, '\\chi_m', 'c', 'small');
    g.label(cx - 22, cy - 22, '\\text{air}', 'c', 'small');
    g.arrow(cx + rb + 14, cy, cx + rb + 40, cy, { cls: 'dim', hs: 6 }); g.label(cx + rb + 44, cy, 'x', 'l', 'small accent');
    return g.svg();
  }
  function coaxSide() {
    const g = PF.fig({ alt: 'the upper half of the coax cut along its axis, z to the right: the inner conductor at r = a carries I to the right, the sleeve fills c < r < b, the outer conductor at r = b carries I back to the left; the one-turn loop is a rectangle of length h lying in the sleeve between r = c and r = b' });
    const x0 = 20, x1 = 280, Y = (r) => 160 - r, ya = Y(14), yc = Y(56), yb = Y(110);
    g.line(x0, 160, x1, 160, { cls: 'dim dash thin' }); g.label(x1 + 4, 160, 'z\\ \\text{axis}', 'l', 'small accent');
    g.rect(x0, yb, x1 - x0, yc - yb, { cls: 'shade' });
    g.line(x0, ya, x1, ya, { cls: 'thick' }); g.line(x0, yc, x1, yc, { cls: 'dim' }); g.line(x0, yb, x1, yb, { cls: 'thick' });
    g.arrow(60, ya - 9, 104, ya - 9, { hs: 7 }); g.label(108, ya - 9, 'I', 'l', 'small');
    g.arrow(104, yb - 9, 60, yb - 9, { hs: 7 }); g.label(56, yb - 9, 'I', 'r', 'small');
    g.rect(150, yb + 4, 90, yc - yb - 8, { cls: 'thick' });
    g.label(195, (yb + yc) / 2, '\\text{loop}', 'c', 'small');
    g.dim(150, yc + 14, 240, yc + 14, 'h', { at: 'b' });
    for (const [y, l] of [[ya, 'r = a'], [yc, 'r = c'], [yb, 'r = b']]) g.label(x0 - 4, y, l, 'r', 'small');
    return g.svg();
  }
  // 2: the capacitor whose top plate is pulled up, on a battery
  function pullFig() {
    const g = PF.fig({ scale: 1.15, alt: 'side view: a fixed bottom plate at z = 0 and a top plate a distance d(t) above it, moving up at speed u; a battery V0 connects its + terminal to the bottom plate and its − terminal to the top plate' });
    const x0 = 46, x1 = 186, yb = 140, yt = 80, xb = 258;
    g.line(x0, yb, x1, yb, { cls: 'thick' }); g.line(x0, yt, x1, yt, { cls: 'thick' });
    g.arrow(116, yt - 6, 116, yt - 38, { hs: 7 }); g.label(122, yt - 32, 'u', 'l');
    g.dim(x0 - 14, yt, x0 - 14, yb, 'd(t)', { at: 'l' });
    g.pl([[x1, yb], [xb, yb], [xb, 115]]);
    g.line(xb - 13, 115, xb + 13, 115);
    g.line(xb - 6, 106, xb + 6, 106, { cls: 'thick' });
    g.pl([[xb, 106], [xb, yt], [x1, yt]]);
    g.label(xb + 16, 118, '+', 'l', 'small'); g.label(xb + 16, 103, '-', 'l', 'small');
    g.label(xb + 30, 110, 'V_0', 'l');
    g.label(x0 + 4, yb + 8, 'z = 0', 'tl', 'small');
    g.arrow(18, 176, 18, 146, { cls: 'dim', hs: 6 }); g.label(23, 150, '\\hat z', 'l', 'small accent');
    return g.svg();
  }
  // 3: the given sheet current, and the two sketches of the solution
  const plotB3js = () => plot({
    x: [-8, 56], y: [-3, 5], zero: true, xl: 't\\ (\\text{ns})', yl: 'J_s\\ (\\text{A/m})',
    xt: [10, 20, 30, 40], yt: [[4, '4'], [2, '2'], [-2, '-2']],
    curves: [{ pts: [[-8, 0], [0, 0], [0, 4], [30, -2], [40, -2], [40, 0], [56, 0]] }],
  });
  const plotB3z = () => plot({
    w: 380, h: 210, x: [-6.5, 6.5], y: [-2.6, 2.6], zero: true, xl: 'z\\ (\\text{m})', yl: 'H_x\\ (\\text{A/m})',
    xt: [-5, -3, -2, -1, 1, 2, 3, 5], yt: [-2, -1, 1, 2],
    curves: [{ pts: [[-6.5, 0], [-5, 0], [-5, -2], [-2, 1], [-1, 1], [-1, 0], [1, 0], [1, -1], [2, -1], [5, 2], [5, 0], [6.5, 0]] }],
    pts: [{ x: 1.5, y: -1 }, { x: 3.5, y: 0.5 }, { x: -4.5, y: -1.5 }],
  });
  const E40 = 40 * PI, E80 = 80 * PI;
  const plotB3t = () => plot({
    w: 360, h: 210, x: [0, 90], y: [-275, 150], zero: true, xl: 't\\ (\\text{ns})', yl: 'E_y\\ (\\text{V/m})',
    xt: [30, 40, 50, 60, 70], yt: [[E40, '40\\pi'], [-E40, '-40\\pi'], [-E80, '-80\\pi']],
    curves: [{ pts: [[0, 0], [30, 0], [30, -E80], [60, E40], [70, E40], [70, 0], [90, 0]] }],
    pts: [{ x: 40, y: -E40 }, { x: 65, y: E40 }],
  });
  // 4: the capacitor with a dielectric core
  function coreFig() {
    const g = PF.fig({ scale: 1.15, alt: 'side view: two circular plates of radius R a distance d apart; a shaded dielectric disk of radius b fills the middle, air fills the outer ring; leads on the axis connect the bottom plate to V(t) and the top plate to 0 V' });
    const cx = 150, R0 = 104, b0 = 48, yt = 60, yb = 122;
    g.rect(cx - b0, yt, 2 * b0, yb - yt, { cls: 'shade' });
    g.line(cx - b0, yt, cx - b0, yb, { cls: 'dim' }); g.line(cx + b0, yt, cx + b0, yb, { cls: 'dim' });
    g.line(cx - R0, yt, cx + R0, yt, { cls: 'thick' }); g.line(cx - R0, yb, cx + R0, yb, { cls: 'thick' });
    g.label(cx - 24, (yt + yb) / 2, '\\epsilon_r\\epsilon_0', 'c', 'small');
    g.label(cx + 76, (yt + yb) / 2, '\\text{air}', 'c', 'small'); g.label(cx - 76, (yt + yb) / 2, '\\text{air}', 'c', 'small');
    g.line(cx, yt, cx, 24, { cls: 'thick' }); g.circle(cx, 20, 3.5, { cls: 'bgfill' }); g.label(cx + 8, 20, '0\\ \\text{V}', 'l', 'small');
    g.line(cx, yb, cx, 176, { cls: 'thick' }); g.circle(cx, 180, 3.5, { cls: 'bgfill' }); g.label(cx + 8, 180, 'V(t)', 'l', 'small');
    g.dim(cx - b0, yb + 16, cx, yb + 16, 'b', { at: 'b' });
    g.dim(cx - R0, yb + 40, cx, yb + 40, 'R', { at: 'b' });
    g.dim(cx + R0 + 14, yt, cx + R0 + 14, yb, 'd', { at: 'r' });
    return g.svg();
  }

  // ================================================================ EXAM B
  const examB = [
    R(md`
      **75 minutes, 100 points, four problems**, in the format of the [Fall 2025 Exam 2](#/l/past-f25). Closed book and closed notes; no calculators; **one 4″×6″ index card of handwritten notes**. Show all your work and reasoning for each answer. All answers include units wherever appropriate. No credit for work on scratch pages. None of the situations repeats [exam A](#/l/prac-f25a).

      | Problem | What it asks | Points |
      |---|---|---|
      | 1 | A coax with a magnetic sleeve and a ramped current: $\mathbf H$, $\mathbf B$, $\mathbf M$; the emf of a loop in the sleeve; inductance per length and the sleeve's energy | 30 |
      | 2 | Displacement current when the gap of a capacitor on a battery grows | 15 |
      | 3 | A sheet in a dielectric driven by a given $J_s(t)$: sketch $\mathbf H$ in space on both sides, and $\mathbf E$ in time | 30 |
      | 4 | An AC capacitor with a dielectric core: $\mathbf E$, $\mathbf D$, $\Psi_e$ and $\mathbf H$ in both regions | 25 |

      **Topics it draws on.** [Ampère's law](#/l/t5-ampere), [magnetic materials](#/l/t13-materials), [flux](#/l/t7-flux), [Faraday and Lenz](#/l/t8-faraday), [inductance and energy](#/l/t11-inductance), [dielectrics and D](#/l/t1-dielectrics), [displacement current](#/l/t12-displacement), [sheet waves](#/l/t15-sheet-waves), [traveling waveforms](#/l/t14-wave-eq).

      **How to use it.** Set a 75-minute timer and work on paper. Then enter your answers. Symbolic boxes take expressions such as <code>I0*t/T</code>, <code>mu0*(1+chim)</code>, <code>ln(b/c)</code> or <code>sin(omega*t)</code>; the variables each box accepts are listed under it (type <code>epsr</code> for $\epsilon_r$). Directions and units are choices. Sketches are checked through values read off them; the solutions draw them. Constants: $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = 8.854\times10^{-12}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$.
    `),

    // ---------------------------------------------------------------- B1
    RF(md`
      ### Problem 1 (30 points): a coax with a magnetic sleeve

      A long coaxial cable on the $z$-axis has a thin-walled inner conductor of radius $a$ and a thin outer conductor of radius $b$. The space $a < r < c$ is air; a sleeve of linear magnetic material with susceptibility $\chi_m > 0$ fills $c < r < b$, lining the outer conductor. The inner conductor carries $I(t)$ along $+\hat z$, and the outer conductor carries it back. The current ramps up, then holds:
      $$I(t) = I_0\,\frac tT\quad(0 \le t \le T),\qquad I(t) = I_0\quad(t \ge T)$$
      A thin, insulated, one-turn rectangular wire loop lies in the half-plane $\phi = 0$ (the plane $y = 0$, $x > 0$). Two of its sides, of length $h$, run along $z$ at $r = c$ and (just inside the outer conductor) at $r = b$; the other two are radial. Ignore the loop's own field.

      [[fig:coax]]
    `, { coax: PF.row([{ svg: coaxEnd(), cap: md`End view: inner current out of the page. The loop is seen edge-on, along $+x$.` }, { svg: coaxSide(), cap: 'Cut along the axis (upper half): the loop spans the sleeve.' }]) }),
    P({ src: 'Fall 2025 style B #1(a) · 10 pts', title: 'H, B and M in the sleeve',
      q: md`At $t = 2T$, find the magnitudes and directions of $\mathbf H$, $\mathbf B$ and $\mathbf M$ in the sleeve at radius $r$ ($c < r < b$). Include units. Then compare $H_\phi$ and $B_\phi$ on the two sides of $r = c$.`,
      parts: [
        X(md`$|\mathbf H|$ in A/m (use chim, I0, r)`, 'I0/(2*pi*r)', 'chim I0 r'),
        X(md`$|\mathbf B|$ in T (use mu0, chim, I0, r)`, 'mu0*(1+chim)*I0/(2*pi*r)', 'mu0 chim I0 r'),
        X(md`$|\mathbf M|$ in A/m (use chim, I0, r)`, 'chim*I0/(2*pi*r)', 'chim I0 r'),
        MC('$\\mathbf H$, $\\mathbf B$ and $\\mathbf M$ all point along', [md`$+\hat\phi$ (counterclockwise seen from $+z$)`, md`$-\hat\phi$ (clockwise seen from $+z$)`, md`$+\hat z$ (along the inner current)`, md`$+\hat r$ (outward)`], 0,
          [null, md`That is the field of a current along $-\hat z$. Thumb along the inner conductor's $+\hat z$ current: the fingers curl along $+\hat\phi$.`, md`$+\hat z$ is the current's direction; $\mathbf H$ circles it.`, md`A radial $\mathbf B$ would carry net flux out of a closed cylinder around the axis: $\nabla\cdot\mathbf B \ne 0$.`]),
        MC('Across $r = c$ (air to sleeve)', [md`$H_\phi$ is continuous; $B_\phi$ jumps up by the factor $1 + \chi_m$`, md`$B_\phi$ is continuous; $H_\phi$ drops by the factor $1 + \chi_m$`, md`both are continuous`, md`both jump by the factor $1 + \chi_m$`], 0,
          [null, md`Continuous normal $B$ is the rule for the component **across** the boundary ($B_r$, zero here). $B_\phi$ is tangential; tangential $\mathbf H$ is the continuous one when there is no free surface current.`, md`$\mathbf B = \mu\mathbf H$ and $\mu$ changes at $r = c$: if $H_\phi$ is continuous, $B_\phi$ cannot be.`, md`Ampère with free current only gives $H_\phi = I/2\pi r$ on both sides: $H_\phi$ does not jump.`]),
      ],
      hints: [md`For $t \ge T$ the current is $I_0$. Ampère for $\mathbf H$ on a circle of radius $r$ in the sleeve encloses only the inner conductor's current.`, md`$\mathbf B = \mu_0(1 + \chi_m)\mathbf H$ in the sleeve, $\mu_0\mathbf H$ in the air; $\mathbf M = \chi_m\mathbf H$.`],
      sol: md`
        **1. Governing law.** Ampère's law for $\mathbf H$ counts free current only. A circle of radius $r$ ($c < r < b$), counterclockwise from $+z$, encloses the inner conductor's current; the outer conductor is outside it. At $t = 2T$, $I = I_0$:
        $$H_\phi\,2\pi r = I_0$$
        **2. The material.** $\mathbf B = \mu_0(1 + \chi_m)\mathbf H$, $\mathbf M = \chi_m\mathbf H$:
        $$\boxed{\mathbf H = \frac{I_0}{2\pi r}\,\hat\phi\ \ \text{A/m}}\qquad\boxed{\mathbf B = \frac{\mu_0(1 + \chi_m)I_0}{2\pi r}\,\hat\phi\ \ \text{T}}\qquad\boxed{\mathbf M = \frac{\chi_mI_0}{2\pi r}\,\hat\phi\ \ \text{A/m}}$$
        **3. Direction.** Thumb along $+\hat z$ (the inner current): $+\hat\phi$, counterclockwise seen from $+z$. $\mathbf B$ and $\mathbf M$ follow $\mathbf H$ since $\chi_m > 0$.

        **4. Across $r = c$.** The fields are along $\hat\phi$, tangential to the cylinder $r = c$, and no free current flows there: $H_\phi = I_0/2\pi c$ on both sides. $B_\phi$ jumps from $\mu_0H_\phi$ to $\mu_0(1 + \chi_m)H_\phi$.

        **Check.** $\mathbf B = \mu_0(\mathbf H + \mathbf M)$ ✓. The jump in $B_\phi$ comes from a bound surface current $\mathbf M\times\hat n$ on the sleeve's inner face ($\hat n = -\hat r$ out of the sleeve): $\dfrac{\chi_mI_0}{2\pi c}\,\hat\phi\times(-\hat r) = +\dfrac{\chi_mI_0}{2\pi c}\hat z$, along the inner current, which is why $\mathbf B$ grows in the sleeve.
      ` }),
    P({ src: 'Fall 2025 style B #1(b) · 10 pts', title: 'The emf of a loop in the sleeve',
      q: md`Find the magnitude of the emf around the loop during the ramp ($0 < t < T$) and after it ($t > T$), and the direction of the induced current in the loop's side at $r = c$ during the ramp.`,
      parts: [
        X(md`$|\emf|$ during the ramp, in V (use mu0, chim, h, I0, a, b, c, T)`, 'mu0*(1+chim)*h*I0*ln(b/c)/(2*pi*T)', 'mu0 chim h I0 a b c T'),
        MC('For $t > T$ the emf is', ['zero', 'the same as during the ramp', 'reversed', md`decaying as $e^{-(t - T)/T}$`], 0,
          [null, 'An emf needs a changing flux. After $t = T$ the current, and so the flux, is constant.', 'A reversal needs a falling current; the current holds at $I_0$.', 'The current stops changing at once at $t = T$ (it is held, not relaxed), so the emf drops straight to zero.']),
        MC('During the ramp, the induced current in the side at $r = c$ flows along', [md`$-\hat z$, opposite to the inner conductor's current`, md`$+\hat z$, with the inner conductor's current`, md`$+\hat\phi$, around the axis with the field`, 'nowhere: the loop does not enclose the inner conductor'], 0,
          [null, md`A current along $+\hat z$ at $r = c$ makes $+\hat\phi$ field inside the loop, adding to the growing flux. Lenz requires the opposite.`, md`The loop's side at $r = c$ runs along $z$; current flows along the wire.`, 'The loop links the sleeve\'s flux, which grows during the ramp. Linking changing flux is enough; enclosing the inner conductor is not needed.']),
      ],
      hints: [md`At $\phi = 0$, $\hat\phi = \hat y$: $\mathbf B$ crosses the loop face-on. $\Psi = \displaystyle\int_0^h\!\!\int_c^b\frac{\mu I}{2\pi r}\,dr\,dz$ with $\mu = \mu_0(1 + \chi_m)$.`, md`$|\emf| = |d\Psi/dt|$ with $dI/dt = I_0/T$ during the ramp. Lenz for the direction: oppose the growing $+\hat y$ flux.`],
      sol: md`
        **1. Flux.** At $\phi = 0$, $\hat\phi = \hat y$, the loop's normal. Orient the loop so that $d\mathbf S = +\hat y\,dr\,dz$; the whole loop lies in the sleeve, $\mu = \mu_0(1 + \chi_m)$:
        $$\Psi = \int_0^h\!\!\int_c^b\frac{\mu I}{2\pi r}\,dr\,dz = \frac{\mu Ih}{2\pi}\ln\frac bc$$
        **2. Faraday.** $|\emf| = |d\Psi/dt|$. During the ramp $dI/dt = I_0/T$:
        $$\boxed{|\emf| = \frac{\mu_0(1 + \chi_m)hI_0}{2\pi T}\ln\frac bc\ \ \text{V}\quad(0 < t < T)}$$
        For $t > T$ the current is constant, so $\Psi$ is constant: $\boxed{\emf = 0}$, however large $\mathbf B$ is.

        **3. Direction (Lenz).** The flux along $+\hat y$ grows, so the induced current makes $-\hat y$ field inside the loop. A current along $-\hat z$ at $x = c$ makes $(-\hat z)\times\hat x = -\hat y$ at points beyond it: the side at $r = c$ carries current along **$-\hat z$**, and the side at $r = b$ along $+\hat z$. Like a loop beside a wire whose current grows: the near side runs opposite to the wire.

        **Check.** $|\emf|/h$ is the sleeve's share of $L'\,dI/dt$ from part (c) ✓. Units: (H/m)(m)(A/s) = V ✓.
      ` }),
    P({ src: 'Fall 2025 style B #1(c) · 10 pts', title: 'Inductance per length and the sleeve\'s energy',
      q: md`Find the inductance per unit length $L'$ of the cable, and the magnetic energy per unit length stored in the sleeve for $t > T$. Include units.`,
      parts: [
        X(md`$L'$ in H/m (use mu0, chim, a, b, c)`, '(mu0/(2*pi))*(ln(c/a)+(1+chim)*ln(b/c))', 'mu0 chim a b c'),
        X(md`$W'_{\text{sleeve}}$ in J/m (use mu0, chim, I0, a, b, c)`, 'mu0*(1+chim)*I0^2*ln(b/c)/(4*pi)', 'mu0 chim I0 a b c'),
      ],
      hints: [md`$L' = \Psi'/I$, with $\Psi'$ the flux per meter between the conductors: integrate $B_\phi$ from $a$ to $b$, split at $c$.`, md`Energy density $w_m = \tfrac12\mathbf B\cdot\mathbf H = \tfrac12\mu H^2$; per meter, a shell has volume $2\pi r\,dr$.`],
      sol: md`
        **1. Flux per meter** between the conductors, through a radial strip 1 m long:
        $$\Psi' = \int_a^c\frac{\mu_0I}{2\pi r}\,dr + \int_c^b\frac{\mu_0(1 + \chi_m)I}{2\pi r}\,dr = \frac{\mu_0I}{2\pi}\left[\ln\frac ca + (1 + \chi_m)\ln\frac bc\right]$$
        **2. Inductance per length,** $L' = \Psi'/I$:
        $$\boxed{L' = \frac{\mu_0}{2\pi}\left[\ln\frac ca + (1 + \chi_m)\ln\frac bc\right]\ \ \text{H/m}}$$
        **3. Energy in the sleeve.** $w_m = \tfrac12\mu H^2$ with $H = I_0/2\pi r$, over a shell $2\pi r\,dr$ per meter:
        $$\boxed{W'_{\text{sleeve}} = \int_c^b\frac{\mu_0(1 + \chi_m)}{2}\left(\frac{I_0}{2\pi r}\right)^2 2\pi r\,dr = \frac{\mu_0(1 + \chi_m)I_0^2}{4\pi}\ln\frac bc\ \ \text{J/m}}$$
        **Checks.** Adding the air's share $\dfrac{\mu_0I_0^2}{4\pi}\ln\dfrac ca$ gives $\tfrac12L'I_0^2$ ✓. With $\chi_m \to 0$, $L' \to \dfrac{\mu_0}{2\pi}\ln\dfrac ba$, the plain coax ✓. Units: H/m, and (H/m)(A²) = J/m ✓.
      ` }),

    // ---------------------------------------------------------------- B2
    RF(md`
      ### Problem 2 (15 points): pulling a capacitor apart

      An air-filled parallel-plate capacitor has plates of area $A$. A battery holds the bottom plate ($z = 0$) at $V_0$ and the top plate at 0 V. From $t = 0$ the top plate is pulled upward at constant speed $u$, so the gap is $d(t) = d_0 + ut$; the battery stays connected. Ignore fringing.

      [[fig:pull]]
    `, { pull: { svg: pullFig(), cap: 'The battery stays connected while the gap grows.' } }),
    P({ src: 'Fall 2025 style B #2 · 15 pts', title: 'Displacement current with a moving plate',
      q: md`Find $\mathbf D$ between the plates, the displacement current $I_d(t)$ through the gap (counted positive along $+\hat z$), and the direction of the current in the wire that joins the bottom plate to the battery. Include units.`,
      parts: [
        X(md`$D_z$ in C/m² (use eps0, V0, d0, u, t)`, 'eps0*V0/(d0+u*t)', 'eps0 V0 d0 u t'),
        X(md`$I_d(t)$ in A, positive along $+\hat z$ (use eps0, A, V0, d0, u, t)`, '-eps0*A*V0*u/(d0+u*t)^2', 'eps0 A V0 d0 u t'),
        MC('In the wire at the bottom plate, current flows', ['out of the bottom plate, into the battery\'s + terminal', 'from the battery\'s + terminal into the bottom plate', 'nowhere: the voltage is constant', 'out of the bottom plate only at the instant the plate starts to move'], 0,
          [null, md`That would add charge to the bottom plate, but $Q = \epsilon_0AV_0/d$ falls as $d$ grows.`, md`$V$ is fixed but $Q = CV$ is not: $C = \epsilon_0A/d$ falls as the gap grows, so charge must flow.`, md`$Q$ keeps falling as long as the plate moves: $dQ/dt = -\epsilon_0AV_0u/d^2 \ne 0$ at every $t$.`]),
      ],
      hints: [md`$E = V_0/d(t)$, from the high plate to the low one; $D = \epsilon_0E$. The voltage is fixed, but $E$ is not: the gap grows.`, md`$I_d = A\,\partial D_z/\partial t$. It equals the rate of change of the bottom plate's charge, $Q = AD_z$.`],
      sol: md`
        **1. Field.** A fixed $V_0$ across a growing gap: $E = V_0/d(t)$, pointing from the bottom (high) plate up to the top plate. With $\mathbf D = \epsilon_0\mathbf E$:
        $$\boxed{\mathbf D = \frac{\epsilon_0V_0}{d_0 + ut}\,\hat z\ \ \text{C/m}^2}$$
        **2. Displacement current.** $\mathbf J_d = \partial\mathbf D/\partial t$, uniform over the plate area:
        $$\boxed{I_d(t) = A\frac{\partial D_z}{\partial t} = -\frac{\epsilon_0AV_0u}{(d_0 + ut)^2}\ \ \text{A}}$$
        Negative: it points along $-\hat z$, from the top plate down to the bottom plate.

        **3. Wire current.** By Gauss's law the bottom plate holds $Q = AD_z = \dfrac{\epsilon_0AV_0}{d_0 + ut}$, which falls. So current flows **out of the bottom plate into the battery's + terminal**: the battery is being charged, by the work done pulling the plates apart.

        **Check.** The loop closes: down the gap as displacement current, out of the bottom plate, through the battery from + to −, into the top plate ✓. $dQ/dt = I_d$ ✓. Units: (F/m)(m²)(V)(m/s)/(m²) = C/s = A ✓.
      ` }),

    // ---------------------------------------------------------------- B3
    RF(md`
      ### Problem 3 (30 points): a sheet in a dielectric, driven by a given current

      A current sheet $\mathbf J_s = J_s(t)\,\hat y$ on the plane $z = 0$ is embedded in a lossless, nonmagnetic dielectric with $\epsilon_r = 9$ that fills all space. $J_s(t)$ is plotted below: zero before $t = 0$, a jump to 4 A/m at $t = 0$, a linear fall to $-2$ A/m at $t = 30$ ns, $-2$ A/m until 40 ns, and zero after that. ($c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$.)

      [[fig:js]]
    `, { js: { svg: plotB3js(), cap: md`$J_s(t)$: a jump to 4 A/m at $t = 0$, a straight fall through zero at 20 ns to $-2$ A/m at 30 ns, flat to 40 ns, then off.` } }),
    P({ src: 'Fall 2025 style B #3(a) · 15 pts', title: 'Sketch H(z) at t = 50 ns',
      q: md`Find the wave speed and the intrinsic impedance of the medium. Then sketch the magnetic field at $t = 50$ ns as a function of $z$ on **both** sides of the sheet, $-6 < z < 6$ m. Label its component, its unit, and numbers on both axes, and read these values off your sketch.`,
      parts: [
        N('v', 1e8, 'm/s'),
        N('\\eta', 40 * PI, 'Ω'),
        MC('Component of $\\mathbf H$', [md`$H_x$`, md`$H_y$`, md`$H_z$`], 0,
          [null, md`$\mathbf H$ is perpendicular to $\mathbf E$, and $\mathbf E$ lies along the sheet current, $\hat y$.`, md`A plane wave has no field along its direction of travel, $\pm\hat z$.`]),
        N('\\text{that component at}\\ z = 1.5\\ \\text{m}', -1, 'A/m'),
        N('\\text{that component at}\\ z = 3.5\\ \\text{m}', 0.5, 'A/m'),
        N('\\text{that component at}\\ z = -4.5\\ \\text{m}', -1.5, 'A/m'),
        N('\\text{the fronts are at}\\ |z|', 5, 'm'),
      ],
      hints: [md`$v = c/\sqrt{\epsilon_r}$, $\eta = \eta_0/\sqrt{\epsilon_r}$. On each side $\mathbf H = \tfrac12\mathbf J_s(t - |z|/v)\times\hat n$, with $\hat n$ pointing from the sheet toward the point.`, md`At $t = 50$ ns the field at distance $|z|$ left the sheet at $t' = 50 - 10|z|$ (ns, m). For $z > 0$, $H_x = +\tfrac12J_s(t')$; for $z < 0$, $H_x = -\tfrac12J_s(t')$.`],
      sol: md`
        **1. Medium.** $v = c/\sqrt9 = 10^8$ m/s $= 0.1$ m/ns, and $\eta = 120\pi/3 = 40\pi = 126\ \Omega$.

        **2. Fields.** On both sides $\mathbf E = -\tfrac\eta2\mathbf J_s(t - |z|/v) = -20\pi J_s\,\hat y$, and $\mathbf H = \tfrac12\mathbf J_s\times\hat n$:
        - $z > 0$ ($\hat n = +\hat z$): $\mathbf H = \tfrac12J_s\,\hat y\times\hat z = +\tfrac12J_s(t - z/v)\,\hat x$.
        - $z < 0$ ($\hat n = -\hat z$): $\mathbf H = -\tfrac12J_s(t + z/v)\,\hat x$.

        $H_x$ is odd in $z$. Check: $\mathbf E\times\mathbf H \propto (-\hat y)\times\hat x = +\hat z$ for $z > 0$, away from the sheet ✓.

        **3. Snapshot at 50 ns** ($t' = 50 - 10|z|$):

        | $\lvert z\rvert$ (m) | 0 – 1 | 1 – 2 | 2 – 5 | beyond 5 |
        |---|---|---|---|---|
        | $t'$ (ns) | 50 – 40 | 40 – 30 | 30 – 0 | not yet |
        | $J_s(t')$ (A/m) | 0 | $-2$ | $-2$ → 4, linear | 0 |
        | $H_x$ for $z > 0$ (A/m) | 0 | $-1$ | $-1$ → 2 | 0 |

        [[fig:h]]

        **4. Values.** $H_x(1.5\ \text{m}) = \tfrac12(-2) = -1$ A/m. At 3.5 m, $t' = 15$ ns and $J_s = 4 - 0.2(15) = 1$ A/m: $H_x = 0.5$ A/m. At $-4.5$ m, $t' = 5$ ns and $J_s = 3$ A/m: $H_x = -1.5$ A/m. The fronts are at $|z| = v(50\ \text{ns}) = 5$ m, where $H_x$ jumps to $\pm2$ A/m: the sheet's jump at $t = 0$.

        **Check.** In space the pulse appears reversed: the jump, which happened first, is farthest out; the switch-off at 40 ns sits at $|z| = 1$ m ✓. Across the sheet, $\hat z\times(\mathbf H^+ - \mathbf H^-) = \hat z\times J_s\hat x = J_s\hat y = \mathbf J_s$ ✓.
      `,
      figs: { h: { svg: plotB3z(), cap: md`$H_x(z)$ at $t = 50$ ns: $+\tfrac12J_s(t')$ for $z > 0$, $-\tfrac12J_s(t')$ for $z < 0$. Dots: the three values read off.` } } }),
    P({ src: 'Fall 2025 style B #3(b) · 15 pts', title: 'Sketch E(t) at z = −3 m',
      q: md`Sketch the electric field as a function of time at $z = -3$ m, for $0 \le t \le 90$ ns. Label its component, the unit and numbers on both axes. Then read these values off your sketch.`,
      parts: [
        MC('Component of $\\mathbf E$', [md`$E_x$`, md`$E_y$`, md`$E_z$`], 1,
          [md`$\mathbf E = -\tfrac\eta2\mathbf J_s$ lies along the sheet current, $\hat y$.`, null, md`No field along the direction of travel.`]),
        N('\\text{the front arrives at}\\ t', 30, 'ns'),
        N('\\text{that component just after the front}', -80 * PI, 'V/m'),
        N('\\text{that component at}\\ t = 40\\ \\text{ns}', -40 * PI, 'V/m'),
        N('\\text{that component at}\\ t = 65\\ \\text{ns}', 40 * PI, 'V/m'),
        N('\\text{zero for good after}\\ t', 70, 'ns'),
      ],
      hints: [md`$|z|/v = 3/0.1 = 30$ ns. $E_y(-3\ \text{m}, t) = -\tfrac\eta2J_s(t - 30\ \text{ns})$, with $\eta/2 = 20\pi\ \Omega$.`, md`At a fixed point the trace keeps the source's order in time; only the delay and the factor $-20\pi$ change it.`],
      sol: md`
        **1. Governing relation.** $\mathbf E = -\tfrac\eta2\mathbf J_s(t - |z|/v)$ on both sides. At $|z| = 3$ m the delay is $3/0.1 = 30$ ns:
        $$E_y(-3\ \text{m}, t) = -20\pi\,J_s(t - 30\ \text{ns})$$
        **2. The trace** ($t$ in ns):
        $$E_y = \begin{cases} 0, & t < 30\\ -80\pi + 4\pi(t - 30), & 30 < t < 60\\ +40\pi, & 60 < t < 70\\ 0, & t > 70\end{cases}\quad\text{V/m}$$
        The ramp's slope is $-20\pi\times(-0.2\ \text{A/m per ns}) = +4\pi$ V/m per ns; it crosses zero at $t = 50$ ns.

        [[fig:t]]

        **3. Values.** The front arrives at $t = 30$ ns with $E_y = -80\pi = -251$ V/m. $E_y(40\ \text{ns}) = -20\pi(2) = -40\pi = -126$ V/m. $E_y(65\ \text{ns}) = -20\pi(-2) = +40\pi = 126$ V/m. Zero for good after $70$ ns.

        **Check.** $\mathbf E$ opposes $\mathbf J_s$ at every instant ($E_y = -20\pi J_s$), so $\mathbf E\cdot\mathbf J_s \le 0$: the sheet delivers power to the waves ✓. $z = -3$ m is on the $-z$ side, but $\mathbf E$ is even in $z$; only $\mathbf H$ flips.
      `,
      figs: { t: { svg: plotB3t(), cap: md`$E_y(t)$ at $z = -3$ m: $J_s(t)$ delayed 30 ns and multiplied by $-20\pi$. Dots: the values at 40 and 65 ns.` } } }),

    // ---------------------------------------------------------------- B4
    RF(md`
      ### Problem 4 (25 points): an AC capacitor with a dielectric core

      Two circular plates of radius $R$ lie a distance $d$ apart along $z$. Between them a coaxial dielectric disk of radius $b < R$ and relative permittivity $\epsilon_r$ fills $r < b$; the ring $b < r < R$ is air. A source holds the bottom plate ($z = 0$) at $V(t) = V_0\sin(\omega t)$ relative to the top plate. Ignore fringing: between the plates the field is along $z$ and does not change with height.

      [[fig:core]]
    `, { core: { svg: coreFig(), cap: 'Side view. The shaded disk is the dielectric; the leads run along the axis.' } }),
    P({ src: 'Fall 2025 style B #4(a) · 8 pts', title: 'E and D in each region',
      q: md`Find $\mathbf E$ and $\mathbf D$ between the plates, in the dielectric ($r < b$) and in the air ($b < r < R$).`,
      parts: [
        X(md`$E_z$ in the dielectric, in V/m (use epsr, V0, omega, t, d)`, 'V0*sin(omega*t)/d', 'epsr V0 omega t d'),
        MC('$\\mathbf E$ in the air ring, compared with the dielectric', ['the same', md`smaller by the factor $\epsilon_r$`, md`larger by the factor $\epsilon_r$`, 'zero: the field stays in the dielectric'], 0,
          [null, md`That is $\mathbf D$, which is smaller in the air by $\epsilon_r$. $\mathbf E$ is set by the voltage: each vertical line from plate to plate carries the same $V$ over the same length $d$.`, md`That is the rule for layers stacked **along** $\mathbf E$, where $\mathbf D$ is shared. Here the regions sit side by side, each spanning the full voltage across the same gap.`, md`The air ring also spans the voltage $V$ across $d$: $E = V/d$ there too.`]),
        X(md`$D_z$ in the dielectric, in C/m² (use epsr, eps0, V0, omega, t, d)`, 'epsr*eps0*V0*sin(omega*t)/d', 'epsr eps0 V0 omega t d'),
        X(md`$D_z$ in the air, in C/m² (use epsr, eps0, V0, omega, t, d)`, 'eps0*V0*sin(omega*t)/d', 'epsr eps0 V0 omega t d'),
      ],
      hints: [md`$\int\mathbf E\cdot d\mathbf l$ from the bottom plate to the top plate along any vertical line equals $V(t)$, in the dielectric or in the air.`, md`$\mathbf D = \epsilon\mathbf E$ with the local $\epsilon$.`],
      sol: md`
        **1. E.** The field is along $z$ and uniform in height, and the line integral from the bottom plate to the top along any vertical line is $V(t)$. So $E_zd = V(t)$ in **both** regions, pointing up (from the high bottom plate) when $V > 0$:
        $$\boxed{\mathbf E = \frac{V_0\sin(\omega t)}{d}\,\hat z\ \ \text{V/m}\quad(r < R)}$$
        Equivalently: $E_z$ is tangential to the cylinder $r = b$, so it is continuous there.

        **2. D** $= \epsilon\mathbf E$ with the local $\epsilon$:
        $$\boxed{D_z = \frac{\epsilon_r\epsilon_0V_0\sin(\omega t)}{d}\ \ (r < b)}\qquad\boxed{D_z = \frac{\epsilon_0V_0\sin(\omega t)}{d}\ \ (b < r < R)}\quad\text{C/m}^2$$
        **Check.** $D_z$ jumps at $r = b$. That is allowed: the "continuous normal $D$" rule concerns $D_r$, the component across the boundary, which is zero here. The plates carry more charge per area opposite the dielectric.
      ` }),
    P({ src: 'Fall 2025 style B #4(b) · 8 pts', title: 'Electric flux through a midplane disk',
      q: md`Find the electric flux $\Psi_e = \int_S\mathbf D\cdot d\mathbf S$ through a disk of radius $r$ in the midplane, $d\mathbf S = +\hat z\,dS$, for $r < b$ and for $b < r < R$. Give its unit.`,
      parts: [
        X(md`$\Psi_e$ for $r < b$ (use epsr, eps0, b, r, V0, omega, t, d)`, 'pi*r^2*epsr*eps0*V0*sin(omega*t)/d', 'epsr eps0 b r V0 omega t d'),
        X(md`$\Psi_e$ for $b < r < R$ (use epsr, eps0, b, r, V0, omega, t, d)`, 'pi*eps0*(epsr*b^2+r^2-b^2)*V0*sin(omega*t)/d', 'epsr eps0 b r V0 omega t d'),
        MC('The unit of $\\Psi_e$', ['C', 'V·m', 'C/m²', 'Wb'], 0,
          [null, md`V·m is the unit of $\int\mathbf E\cdot d\mathbf S$. Electric flux in this course is the flux of $\mathbf D$: coulombs.`, md`C/m² is $\mathbf D$ itself; the area adds m².`, 'The weber is the unit of magnetic flux.']),
      ],
      hints: [md`For $b < r < R$, add the dielectric disk ($\pi b^2$) and the air annulus ($\pi(r^2 - b^2)$), each with its own $D_z$.`],
      sol: md`
        **1. Inside the core** ($r < b$): $D_z$ is uniform over the disk.
        $$\boxed{\Psi_e = \frac{\pi r^2\epsilon_r\epsilon_0V_0\sin(\omega t)}{d}\ \ \text{C}}$$
        **2. In the air ring** ($b < r < R$): the dielectric disk plus the air annulus.
        $$\boxed{\Psi_e = \frac{\pi\epsilon_0\left[\epsilon_rb^2 + (r^2 - b^2)\right]V_0\sin(\omega t)}{d}\ \ \text{C}}$$
        **Check.** The two agree at $r = b$ ✓. At $r = R$, $\Psi_e$ is the bottom plate's charge (Gauss), $Q = CV$ with $C = \dfrac{\pi\epsilon_0\left[\epsilon_rb^2 + R^2 - b^2\right]}{d}$: two capacitors in parallel, core and ring ✓.
      ` }),
    P({ src: 'Fall 2025 style B #4(c) · 9 pts', title: 'H in both regions',
      q: md`Find $\mathbf H(r, t)$ in the midplane for $r < b$ and for $b < r < R$, with its direction at $t = 0$. Is $H_\phi$ continuous at $r = b$?`,
      parts: [
        X(md`$H_\phi$ for $r < b$, in A/m (use epsr, eps0, b, r, V0, omega, t, d)`, 'epsr*eps0*r*omega*V0*cos(omega*t)/(2*d)', 'epsr eps0 b r V0 omega t d'),
        X(md`$H_\phi$ for $b < r < R$, in A/m (use epsr, eps0, b, r, V0, omega, t, d)`, 'eps0*((epsr-1)*b^2+r^2)*omega*V0*cos(omega*t)/(2*r*d)', 'epsr eps0 b r V0 omega t d'),
        MC('At $t = 0$, $\\mathbf H$ points along', [md`$+\hat\phi$: counterclockwise seen from $+z$`, md`$-\hat\phi$: clockwise seen from $+z$`, md`$+\hat z$: along the displacement current`, md`nowhere: $V = 0$ at $t = 0$, so $\mathbf H = 0$`], 0,
          [null, md`That is the field of a shrinking $D_z$. At $t = 0$, $V$ rises: $dD_z/dt > 0$.`, md`$\mathbf H$ circles the displacement current; it is not along it.`, md`$\mathbf H$ follows $\partial\mathbf D/\partial t$, not $\mathbf D$. At $t = 0$, $V = 0$ but it changes fastest: $\mathbf H$ is at its largest.`]),
        MC('At $r = b$, $H_\\phi$', ['is continuous', md`jumps by the factor $\epsilon_r$`, 'drops to zero on the air side', md`is continuous only when $\omega t = \pi/2$`], 0,
          [null, md`$D_z$ jumps at $r = b$, but $H_\phi$ depends on the flux of $\mathbf D$ enclosed by the circle, and that is continuous in $r$.`, md`Air carries displacement current too: $\epsilon_0\,\partial E_z/\partial t \ne 0$.`, md`Both results carry the same factor $\cos\omega t$; they agree at $r = b$ at every instant.`]),
      ],
      hints: [md`Ampère–Maxwell on a circle of radius $r$ in the midplane, with no conduction current through its disk: $H_\phi\,2\pi r = d\Psi_e/dt$.`],
      sol: md`
        **1. Governing law.** Ampère–Maxwell on a circle of radius $r$ in the midplane, counterclockwise from $+z$ ($d\mathbf S = +\hat z$). No conduction current crosses the midplane (perfect dielectric and air; the leads end at the plates). By symmetry $\mathbf H = H_\phi(r, t)\hat\phi$:
        $$H_\phi\,2\pi r = \frac{d\Psi_e}{dt}$$
        **2. Core** ($r < b$):
        $$\boxed{H_\phi = \frac{\epsilon_r\epsilon_0\,r\,\omega V_0\cos(\omega t)}{2d}\ \ \text{A/m}}$$
        **3. Air ring** ($b < r < R$):
        $$\boxed{H_\phi = \frac{\epsilon_0\left[(\epsilon_r - 1)b^2 + r^2\right]\omega V_0\cos(\omega t)}{2rd}\ \ \text{A/m}}$$
        **4. Direction at $t = 0$.** $V = 0$ but $dV/dt = \omega V_0 > 0$: $D_z$ grows, the displacement current points along $+\hat z$, and $\mathbf H$ circles it counterclockwise from $+z$ ($+\hat\phi$). $\mathbf H$ is largest when $V$ crosses zero, not when $V$ peaks.

        **5. Continuity.** At $r = b$ both give $\dfrac{\epsilon_r\epsilon_0b\,\omega V_0\cos\omega t}{2d}$: $H_\phi$ is continuous, as tangential $\mathbf H$ must be with no surface current. $D_z$ jumps there, but the enclosed flux of $\mathbf D$ does not.

        **Check.** At $r = R$, $H_\phi\,2\pi R = C\,dV/dt$ with the $C$ of part (b): the lead current. Just outside the plates, $\mathbf H$ is the field of that current ✓. Units: (F/m)(m)(1/s)(V)/(m) = A/m ✓.
      ` }),
  ];
  EM.lesson('e2-prac', { id: 'prac-f25b', title: 'Practice exam: Fall 2025 style B', kind: 'mock', sub: '75 min · 100 pts · four new situations in the Fall 2025 format', steps: examB });
})();

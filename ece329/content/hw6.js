/* HW 6 (Fall 2026): Faraday's law on fixed paths, a hinged loop turning in a uniform field, a loop drifting through a
   nonuniform field, mutual inductance of concentric loops (and the emf of the small one as it rises), rails with a
   sliding armature and a rail gun, and a loop spinning on a shaft. Every problem as assigned, blank, with answer boxes
   wherever there is a number or a choice, and full worked solutions. There is no official key: every answer was
   solved and checked independently (numerically, in Python). */
(function () {
  'use strict';
  const { R, RF, P } = C;
  // abs: 0, as in EM.N: the default absolute tolerance (1e-9) would accept 0 for the 6.17e-10 H of #4(c)
  const N = (lbl, ans, unit, rel = 0.02) => ({ lbl, ans, unit, tol: { rel, abs: 0 } });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // options shuffled
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // natural order kept

  // ---------------------------------------------------------------- figures
  // Problem 1: the two closed paths in the z = 0 plane, x right and y up
  function pathsFig(tri) {
    const g = PF.fig({ scale: 1.1, alt: tri ? 'the triangular path from the origin to (1,0,0) to (1,1,0) and back to the origin' : 'the square path from the origin up to (0,1,0), across to (1,1,0), down to (1,0,0) and back to the origin' });
    const ox = 40, oy = 130, s = 90;
    g.axes(ox, oy, { x: [-10, 120], y: [-10, 120], xl: 'x', yl: 'y' });
    const P0 = [ox, oy], P1 = [ox + s, oy], P2 = [ox + s, oy - s], P3 = [ox, oy - s];
    const pts = tri ? [P0, P1, P2] : [P0, P3, P2, P1];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; g.line(a[0], a[1], b[0], b[1], { cls: 'thick', mid: true, hs: 8 }); }
    g.label(ox + s + 6, oy + 4, '1', 'tl', 'small');
    g.label(ox - 6, oy - s, '1', 'r', 'small');
    g.label(ox + s / 2, oy + 20, tri ? '\\text{(c)}' : '\\text{(a)}', 't', 'small');
    return g.svg();
  }

  // Problem 2: side view, x out of the page, y right, z up; the loop (edge-on) dips below +y by theta
  function hingeFig() {
    const g = PF.fig({ scale: 1.2, alt: 'side view with x out of the page: the loop seen edge-on as a line from the origin, at angle theta below the +y axis; dS is perpendicular to it, pointing down and to the left; B points along +y' });
    const ox = 60, oy = 70, th = 28 * Math.PI / 180, Lp = 120;
    g.arrow(ox - 40, oy, ox + 160, oy, { cls: 'dim', hs: 6 }); g.label(ox + 164, oy, 'y', 'l', 'small accent');
    g.arrow(ox, oy + 70, ox, oy - 56, { cls: 'dim', hs: 6 }); g.label(ox + 4, oy - 60, 'z', 'bl', 'small accent');
    g.odot(ox, oy, 4.5); g.label(ox - 8, oy - 8, 'x', 'br', 'small accent');
    const ex = ox + Lp * Math.cos(th), ey = oy + Lp * Math.sin(th);
    g.line(ox, oy, ex, ey, { cls: 'thick' });
    const mx = ox + 0.62 * Lp * Math.cos(th), my = oy + 0.62 * Lp * Math.sin(th);
    g.arrow(mx, my, mx - 30 * Math.sin(th), my + 30 * Math.cos(th), { hs: 8 });
    g.label(mx - 30 * Math.sin(th) - 4, my + 30 * Math.cos(th) + 4, 'd\\mathbf S', 'tr', 'small');
    g.angle(ox, oy, 44, -28, 0, '\\theta(t)');
    g.arrow(ox + 90, oy - 34, ox + 136, oy - 34, { cls: 'thick', hs: 8 }); g.label(ox + 112, oy - 40, '\\mathbf B', 'b');
    return g.svg();
  }

  // Problem 3: a circular loop moving right through a field (out of the page) that weakens with x
  function driftFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a circular loop moving to the right through a field pointing out of the page that weakens to the right' });
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) {
      const x = 20 + i * 32, y = 20 + j * 32;
      if (Math.abs(Math.hypot(x - 116, y - 68) - 40) < 8 || (x > 160 && Math.abs(y - 68) < 14)) continue;
      g.dot(x, y, 4.0 - i * 0.44, { cls: 'dimfill' });
    }
    g.loopCirc(116, 68, 40, { dir: 'ccw' });
    g.arrow(162, 68, 196, 68, { hs: 7 }); g.label(199, 68, '\\mathbf v = 2\\hat x', 'l', 'small');
    g.arrow(20, 142, 70, 142, { cls: 'dim', hs: 6 }); g.label(74, 142, 'x', 'l', 'small accent');
    return g.svg();
  }

  // Problem 4: concentric loops in the xy-plane, battery on the outer one
  function ringsFig() {
    const g = PF.fig({ scale: 1.15, alt: 'two concentric loops in the xy-plane: a large one of radius a with a battery, + on its left terminal, and a small one of radius b at the center' });
    const cx = 150, cy = 100;
    g.line(cx, cy + 40, cx, 26, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(cx + 4, 24, 'z', 'bl', 'small accent');
    g.ellipse(cx, cy, 108, 30, { half: 'back' });
    g.ellipse(cx, cy, 108, 30, { half: 'front', cls: 'thick' });
    g.ellipse(cx, cy, 14, 4.5, { cls: 'thick' });
    g.head(cx + 6, cy + 30, 1, 0, { hs: 9 });
    g.label(cx + 64, cy + 30, 'I_a', 'tl', 'small');
    g.circle(cx - 70, cy - 24, 9, { cls: 'bgfill' });
    g.label(cx - 86, cy - 30, '+', 'c', 'small'); g.label(cx - 54, cy - 32, '-', 'c', 'small');
    g.label(cx - 70, cy - 40, '3\\ \\text{V}', 'b', 'small');
    g.line(cx, cy, cx + 108, cy, { cls: 'dim thin' }); g.label(cx + 70, cy - 4, 'a', 'b', 'small');
    g.label(cx + 18, cy + 6, 'b', 'tl', 'small');
    return g.svg();
  }

  // Problem 5: rails, fixed rod AD at z = 0, armature BC at z0; x out of the page, z right, y down; B = -B0 x (into)
  function railsFig() {
    const g = PF.fig({ scale: 1.15, alt: 'two rails a distance L apart, joined on the left by the fixed rod AD at z = 0 and bridged by the armature BC at z = z0, free to slide; B points into the page; axes: x out of the page, z to the right, y down' });
    const x0 = 40, x1 = 280, yt = 30, yb = 110, xa = 160;
    for (const [x, y] of [[66, 52], [112, 52], [92, 88], [138, 88], [198, 52], [244, 52], [222, 88], [264, 88]]) g.otimes(x, y, 6);
    g.line(x0, yt, x1, yt, { cls: 'thick' }); g.line(x0, yb, x1, yb, { cls: 'thick' });
    g.line(x0, yt, x0, yb, { cls: 'thick' });
    g.rect(xa - 3, yt - 4, 6, yb - yt + 8, { cls: 'fill' });
    g.arrow(xa - 10, 70, xa - 40, 70, { cls: 'dim', hs: 7 }); g.arrow(xa + 10, 70, xa + 40, 70, { cls: 'dim', hs: 7 });
    g.label(x0 - 4, yt - 4, 'A', 'br'); g.label(x0 - 4, yb + 4, 'D', 'tr');
    g.label(xa, yt - 6, 'B', 'b'); g.label(xa, yb + 6, 'C', 't');
    g.label(x0, yb + 22, '(z = 0)', 't', 'small'); g.label(xa, yb + 22, '(z = z_0)', 't', 'small');
    g.dim(x0 - 18, yt, x0 - 18, yb, 'L', { at: 'l' });
    const ox = 316, oy = 44;
    g.odot(ox, oy, 4.5); g.label(ox - 7, oy, '\\hat x', 'r', 'small');
    g.arrow(ox + 5, oy, ox + 34, oy, { hs: 5 }); g.label(ox + 38, oy, '\\hat z', 'l', 'small');
    g.arrow(ox, oy + 5, ox, oy + 34, { hs: 5 }); g.label(ox, oy + 38, '\\hat y', 't', 'small');
    g.label(ox + 10, oy + 64, '\\mathbf B = -B_0\\hat x', 't', 'small');
    return g.svg();
  }

  // Problem 6 (A): head-on view at phi = 0, B from the left; (B): top view, the loop at angle phi from x
  function shaftFig() {
    const g = PF.fig({ scale: 1.05, alt: 'head-on view: a rectangular loop b wide and a tall on a vertical shaft, B pointing to the right along x, the leads coming out at the bottom' });
    const L0 = 60, T0 = 30, W = 100, H = 130, cx = L0 + W / 2;
    g.line(cx, 6, cx, T0 + H + 52, { cls: 'curve' });
    g.pl([[cx - 10, T0 + H], [L0, T0 + H], [L0, T0], [L0 + W, T0], [L0 + W, T0 + H], [cx + 10, T0 + H]], { cls: 'thick' });
    g.pl([[cx - 10, T0 + H], [cx - 10, T0 + H + 30]]); g.pl([[cx + 10, T0 + H], [cx + 10, T0 + H + 30]]);
    g.circle(cx - 10, T0 + H + 34, 4, { cls: 'bgfill' }); g.circle(cx + 10, T0 + H + 34, 4, { cls: 'bgfill' });
    for (const y of [50, 90, 130]) g.arrow(12, y, 50, y, { hs: 6 });
    g.label(20, 70, '\\mathbf B', 'c', 'small');
    g.dim(L0, T0 + 16, L0 + W, T0 + 16, '');
    g.label(L0 + W * 0.75, T0 + 12, 'b', 'b', 'small');
    g.dim(L0 + W + 14, T0, L0 + W + 14, T0 + H, 'a');
    const ox = 18, oy = T0 + H + 44;
    g.arrow(ox, oy, ox + 24, oy, { cls: 'dim', hs: 5 }); g.label(ox + 28, oy, 'x', 'l', 'small accent');
    g.arrow(ox, oy, ox, oy - 24, { cls: 'dim', hs: 5 }); g.label(ox, oy - 28, 'z', 'b', 'small accent');
    return g.svg();
  }
  function topFig() {
    const g = PF.fig({ scale: 1.05, alt: 'top view: the loop is a line through the shaft at angle phi = omega t from the x-axis; its normal s-hat is perpendicular to it, pointing up and to the left' });
    const ox = 100, oy = 110, ph = 35 * Math.PI / 180;
    g.arrow(ox - 70, oy, ox + 110, oy, { cls: 'dim', hs: 6 }); g.label(ox + 114, oy, 'x', 'l', 'small accent');
    g.arrow(ox, oy + 50, ox, oy - 90, { cls: 'dim', hs: 6 }); g.label(ox + 4, oy - 94, 'y', 'bl', 'small accent');
    g.line(ox - 70 * Math.cos(ph), oy + 70 * Math.sin(ph), ox + 70 * Math.cos(ph), oy - 70 * Math.sin(ph), { cls: 'thick' });
    g.arrow(ox, oy, ox - 50 * Math.sin(ph), oy - 50 * Math.cos(ph), { hs: 8 });
    g.label(ox - 54 * Math.sin(ph) - 4, oy - 54 * Math.cos(ph), '\\hat s', 'r');
    g.angle(ox, oy, 40, 0, 35, '\\phi = \\omega t');
    g.dot(ox, oy, 3);
    return g.svg();
  }
  const currentPlot = () => PF.plot({
    w: 320, h: 170, x: [0, 2 * Math.PI], y: [-1.3, 1.3], zero: true, xl: 't\\ (\\text{s})', yl: 'I/B\\ (\\text{A/T})',
    xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi'], [3 * Math.PI / 2, '\\tfrac{3\\pi}{2}'], [2 * Math.PI, '2\\pi']],
    yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: Math.cos, to: 2 * Math.PI * 0.999 }],
  });

  // ---------------------------------------------------------------- the paper
  const steps = [
    R(md`**Homework 6** · due Thursday, October 8, 2026 · reading: Kudeki, Lectures 14–17. Six problems: Faraday's law on fixed paths, a hinged loop turning in a uniform field, a loop drifting through a nonuniform field, mutual inductance of concentric loops, rails with an armature and a rail gun, and a loop spinning on a shaft. The tools are [Topic 8](#/l/t8-faraday), [Topic 9](#/l/t9-motional) and [Topic 11](#/l/t11-inductance).

There is no official key; every answer below was solved and checked independently. Work each part on paper first, with units, the way you would hand it in. Then enter your answers and open the solution to compare your reasoning.`),

    // ================================================================ Problem 1
    P({ src: 'HW 6 #1', title: 'Emf around fixed paths',
      q: md`Given the time-varying magnetic field $\mathbf B = B_0\big(t\sin(\omega t)\,\hat y - \cos(\omega t)\,\hat z\big)$ Wb/m², find the emf $\emf$ for the following closed paths $C$:

(a) $C$ is a rectangular path going from $(0,0,0)$ to $(0,1,0)$ to $(1,1,0)$ to $(1,0,0)$ back to $(0,0,0)$, with distance along the path measured in meters.

(b) $C$ is a rectangular path with the same coordinates as above, but with the path direction reversed.

(c) $C$ is a triangular path going from $(0,0,0)$ to $(1,0,0)$ to $(1,1,0)$ back to $(0,0,0)$, with distance in meters.

[[fig:paths]]`,
      figs: { paths: { svg: PF.row([{ svg: pathsFig(false), cap: '(a): up the y-axis first, clockwise seen from +z.' }, { svg: pathsFig(true), cap: '(c): along the x-axis first, counterclockwise.' }]).svg } },
      parts: [
        N('(a) $\\mathcal E$ as a multiple of $B_0\\omega\\sin\\omega t$', 1, ''),
        N('(b) $\\mathcal E$ as a multiple of $B_0\\omega\\sin\\omega t$', -1, ''),
        N('(c) $\\mathcal E$ as a multiple of $B_0\\omega\\sin\\omega t$', -0.5, ''),
      ],
      hints: ['All three paths lie in the plane $z = 0$, so only $B_z$ crosses them; the $\\hat y$ part (however it varies) is parallel to the plane.', 'Get $d\\mathbf S$ from each path\'s direction by the right-hand rule: (a) runs up the $y$-axis first, which is clockwise seen from $+z$.'],
      sol: md`Only $B_z = -B_0\cos\omega t$ crosses a surface in the $z = 0$ plane; the $\hat y$ term lies in that plane and contributes no flux, however oddly it depends on time.

**(a)** Up the $y$-axis, across, down, back: **clockwise** seen from $+z$, so the RHR gives $d\mathbf S = -\hat z\,dx\,dy$. Area 1 m².
$$\Psi = \int_S(-B_0\cos\omega t)(-1)\,dx\,dy = B_0\cos\omega t\ \text{Wb} \qquad \emf = -\frac{d\Psi}{dt} = B_0\omega\sin\omega t\ \text{V}$$
**(b)** Reversed path: $d\mathbf S = +\hat z$, $\Psi = -B_0\cos\omega t$, and $\emf = -B_0\omega\sin\omega t$ V.

**(c)** $(0,0) \to (1,0) \to (1,1) \to (0,0)$ is **counterclockwise** from $+z$: $d\mathbf S = +\hat z$, area ½ m².
$$\Psi = -\tfrac12B_0\cos\omega t \qquad \emf = -\tfrac12B_0\omega\sin\omega t\ \text{V}$$
**Check.** Reversing the path flips the sign: (b) $= -$(a). The triangle has half the area and the orientation of (b): (c) $=$ (b)/2. ✓` }),

    // ================================================================ Problem 2
    P({ src: 'HW 6 #2', title: 'A hinged loop turning in a uniform field',
      q: md`A square loop of wire of some finite resistance $R$ and $4\ \text{cm}^2$ surface area is located within a region of constant magnetic field $\mathbf B = 8\hat y$ Wb/m², as illustrated (the assignment shows a perspective view and this side view). One edge of the loop lies along the $x$-axis, about which it turns; $\theta$ is the angle between the loop and the $xy$-plane, with the loop dipping below $+y$ as $\theta$ grows.

[[fig:hinge]]

(a) What is the magnetic flux $\Psi$ through the loop when $\theta = 0°$? When $\theta = 90°$? Use the $d\mathbf S$ orientation shown in the side view.

(b) What is $\Psi$ as a function of $\theta$ (same sign convention)?

(c) Assume $\theta$ varies at $d\theta/dt = \pi$ rad/s, and $d\mathbf S$ points along $-\hat z$ at $t = 0$. What is the emf $\emf$ around the loop at $t = 0.25$ s?

(d) In what direction does a positive induced current flow around the loop at that instant? Justify your answer.

(e) What is $\emf$ with the **opposite** $d\mathbf S$ orientation? In what direction does a positive induced current flow in that case?`,
      figs: { hinge: { svg: hingeFig(), cap: 'Side view (x out of the page). The loop is the thick line; dS is perpendicular to it, down and to the left.' } },
      parts: [
        MC('(a) $\\Psi$ at $\\theta = 0°$', ['$0$', '$-3.2\\times10^{-3}$ Wb', '$+3.2\\times10^{-3}$ Wb', '$-8$ Wb'], 0,
          [null, 'At $\\theta = 0$ the loop lies in the $xy$-plane; $\\mathbf B = 8\\hat y$ runs along it.', 'Flat in the $xy$-plane, the loop is edge-on to $\\mathbf B$.', 'That is $B$ alone, with no area; and at $\\theta = 0$ the loop is edge-on anyway.']),
        N('(a) $\\Psi$ at $\\theta = 90°$', -3.2e-3, 'Wb'),
        N('(b) $\\Psi(\\theta)$ as a multiple of $\\sin\\theta$', -3.2e-3, 'Wb'),
        N('(c) $\\mathcal E(t = 0.25\\ \\text{s})$', 3.2e-3 * Math.PI * Math.SQRT1_2, 'V'),
        MC('(d) At $t = 0.25$ s, on the loop\'s free edge (the side opposite the hinge) the current flows along', ['$+\\hat x$', '$-\\hat x$', '$\\pm\\hat y$, along the edge', 'nowhere: $\\mathbf B$ is constant'], 0,
          [null, 'That is the direction against $C$; $\\emf > 0$ means the current runs along $C$.', 'The free edge runs along $\\hat x$, parallel to the hinge.', 'The loop turns, so $\\Psi = \\mathbf B\\cdot\\hat n A$ changes.']),
        N('(e) $\\mathcal E$ with the opposite $d\\mathbf S$', -3.2e-3 * Math.PI * Math.SQRT1_2, 'V'),
        MC('(e) With the opposite $d\\mathbf S$, the physical current', ['is the same as in (d): it is negative relative to the reversed $C$', 'reverses', 'vanishes', 'doubles'], 0,
          [null, 'Physics cannot depend on a sign convention; only the signs of $\\Psi$, $\\emf$ and $I$ flip.', 'The flux still changes.', 'Flipping $d\\mathbf S$ changes signs, not sizes.']),
      ],
      hints: ['From the side view, $d\\mathbf S$ is along $\\hat n(\\theta) = -\\sin\\theta\\,\\hat y - \\cos\\theta\\,\\hat z$: at $\\theta = 0$ it is $-\\hat z$, at $90°$ it is $-\\hat y$.', '$\\Psi = \\mathbf B\\cdot\\hat n\\,A$ with $A = 4\\times10^{-4}$ m²; then $\\theta = \\pi t$ and $\\emf = -d\\Psi/dt$.'],
      sol: md`**Normal.** In the side view the loop is a line at angle $\theta$ below $+y$, along $\cos\theta\,\hat y - \sin\theta\,\hat z$. The drawn $d\mathbf S$ is perpendicular to it, down and to the left:
$$\hat n(\theta) = -\sin\theta\,\hat y - \cos\theta\,\hat z \qquad (\hat n(0) = -\hat z,\ \ \hat n(90°) = -\hat y)$$
**(a)** $\Psi = \mathbf B\cdot\hat nA = (8)(-\sin\theta)(4\times10^{-4})$. At $\theta = 0$: $\Psi = 0$ (the loop is flat, edge-on to $\mathbf B$). At $\theta = 90°$: $\Psi = -3.2\times10^{-3}$ Wb (face-on, $\mathbf B$ against $d\mathbf S$).

**(b)** $\Psi(\theta) = -3.2\times10^{-3}\sin\theta$ Wb.

**(c)** $d\mathbf S = -\hat z$ at $t = 0$ means $\theta(0) = 0$, so $\theta = \pi t$:
$$\Psi(t) = -3.2\times10^{-3}\sin\pi t \qquad \emf = -\frac{d\Psi}{dt} = 3.2\times10^{-3}\,\pi\cos\pi t$$
$$\emf(0.25\ \text{s}) = (3.2\times10^{-3})(\pi)\cos\frac\pi4 = 7.11\times10^{-3}\ \text{V}$$
**(d)** $\emf > 0$: the current flows **along $C$**, the circulation tied to $d\mathbf S$ by the RHR, i.e. counterclockwise seen from the tip of $d\mathbf S$ (from below and to the $-y$ side). Edge by edge: out from the hinge, along $+\hat x$ on the free edge, back, and along $-\hat x$ on the hinge. *Lenz:* as the loop turns face-on, more $+\hat y$ flux crosses it; the current makes field along $d\mathbf S$ (which has a $-\hat y$ part) inside the loop, fighting the increase. ✓ *Motional check:* the free edge moves along $\hat n$ at speed $s\dot\theta$ ($s = 2$ cm), and $\hat n\times\hat y = (-\cos\theta\,\hat z)\times\hat y = +\cos\theta\,\hat x$: the push on the free edge is along $+\hat x$, and $s\dot\theta B\cos\theta\cdot s = (8)(4\times10^{-4})\pi\cos\theta$ reproduces (c). ✓

**(e)** Flipping $d\mathbf S$ flips $\Psi$ and $\emf$: $\emf(0.25\ \text{s}) = -7.11\times10^{-3}$ V, measured along the reversed circulation. A positive current would now mean the opposite circulation; the actual current is negative relative to it, so it is **the same physical current** as in (d).` }),

    // ================================================================ Problem 3
    P({ src: 'HW 6 #3', title: 'A loop drifting through a weak gradient',
      q: md`A conducting wire loop of radius $r = 1$ m is moved with velocity $\mathbf v = 2\hat x$ m/s in a region where the background magnetostatic field is
$$\mathbf B(x, y, z) = \hat z\,25\times10^{-6}(1 - x/L)\ \text{T}$$
where $L = 1000$ m. The center of the loop is at the origin at $t = 0$ and the plane of the loop coincides with the $z = 0$ plane.

(a) Obtain an expression for the induced emf $\emf(t)$ of the loop in motion for $t > 0$. Since $r \ll L$, the field across the loop can be considered nearly constant at each instant.

(b) What is the magnitude of the loop current as a function of time for $t > 0$ if the loop resistance is 2 Ω?

*Interesting facts:* Earth's field is about $25\times10^{-6}$ T at equatorial latitudes, but its scale length $L$ is much longer than 1000 m.

[[fig:drift]]`,
      figs: { drift: { svg: driftFig(), cap: 'Smaller dots, weaker B: moving right, the loop loses upward flux, so the current runs counterclockwise from +z.' } },
      parts: [
        N('(a) $\\mathcal E$ along $C$ (counterclockwise from $+z$)', 5 * Math.PI * 1e-8, 'V'),
        FIX('(a) For $t > 0$, $\\mathcal E(t)$ is', ['constant', 'growing linearly in $t$', 'decaying as $e^{-t}$', 'oscillating'], 0,
          [null, '$\\Psi$ is linear in $t$, so its derivative is constant.', 'Nothing here decays exponentially.', 'The motion is steady, the field static.']),
        N('(b) $|I|$', 2.5 * Math.PI * 1e-8, 'A'),
      ],
      hints: ['Take $C$ counterclockwise from $+z$, $d\\mathbf S = +\\hat z$. With the loop centered at $x_c = 2t$: $\\Psi(t) \\approx B_z(x_c)\\,\\pi r^2$.', '$\\emf = -d\\Psi/dt$; $|I| = |\\emf|/R$.'],
      sol: md`**(a)** $C$ counterclockwise from $+z$, $d\mathbf S = +\hat z$. The center moves as $x_c = 2t$ m. $B_z$ is linear in $x$, so its average over the circle is its value at the center, and the flux is exactly
$$\Psi(t) = 25\times10^{-6}\Big(1 - \frac{2t}{1000}\Big)\pi(1)^2\ \text{Wb}$$
$$\emf(t) = -\frac{d\Psi}{dt} = \frac{(25\times10^{-6})(2)\pi}{1000} = 5\pi\times10^{-8} = 1.57\times10^{-7}\ \text{V}$$
constant for $t > 0$, positive: **counterclockwise** from $+z$. *Lenz:* the loop moves into weaker upward field, so its upward flux shrinks; the current tops it up with upward field inside, counterclockwise. ✓

**(b)** $|I| = \dfrac{1.57\times10^{-7}\ \text{V}}{2\ \Omega} = 7.85\times10^{-8}$ A, constant, counterclockwise from $+z$.` }),

    // ================================================================ Problem 4
    RF(md`### Problem 4 · Mutual inductance of concentric loops

Two concentric circular wire loops of radii $a = 8$ cm and $b = 0.5$ cm lie in the $xy$-plane with their centers at the origin, in free space. Both are made of wire of conductivity $\sigma = 4\times10^7$ S/m with a circular cross-section of radius $r_w = 1$ mm. A 3 V battery is connected in the outer loop.

[[fig:rings]]`, { rings: { svg: ringsFig(), cap: 'The battery (+ on its left) drives $I_a$ counterclockwise seen from +z.' } }),
    P({ src: 'HW 6 #4(a)–(c)', title: 'Current, flux, mutual inductance',
      q: md`(a) Calculate the current $I_a$ in the outer loop. Hint: the resistance of the outer loop follows from $R = d/\sigma A$ (Lecture 10) with $d = 2\pi a$ and $A = \pi r_w^2$.

(b) Derive an expression for the magnetic flux $\Psi_{a\to b}$ that links the inner loop due to the current in the outer loop, in terms of $\mu_0$, $I_a$ and the two radii. Hint: use the field of a circular loop (Lecture 13), and take advantage of $b \ll a$ so that the field across the small loop is nearly constant.

(c) $L_{a\to b} \equiv \Psi_{a\to b}/I_a$ is defined to be the **mutual inductance** between the outer and inner loop. What is its numerical value?`,
      parts: [
        N('(a) $R_a$', 4e-3, 'Ω'),
        N('(a) $I_a$', 750, 'A'),
        MC('(b) $\\Psi_{a\\to b} \\approx$', ['$\\dfrac{\\mu_0I_a\\pi b^2}{2a}$', '$\\dfrac{\\mu_0I_a\\pi a^2}{2b}$', '$\\dfrac{\\mu_0I_ab^2}{2a}$', '$\\dfrac{\\mu_0I_a\\pi b^2}{2\\pi a}$'], 0,
          [null, 'Swapped: the field is the big loop\'s, $\\mu_0I_a/2a$, through the small loop\'s area $\\pi b^2$.', 'The area of the small loop is $\\pi b^2$.', 'That uses a straight wire\'s field $\\mu_0I/2\\pi r$; at the center of a loop it is $\\mu_0I/2a$.']),
        N('(c) $L_{a\\to b}$', 4 * Math.PI * 1e-7 * Math.PI * 0.005 ** 2 / 0.16, 'H'),
      ],
      hints: ['$R_a = 2\\pi a/(\\sigma\\pi r_w^2)$, then $I_a = 3\\ \\text{V}/R_a$.', 'At the center of a loop, $B = \\mu_0I/2a$. Multiply by the small loop\'s area.'],
      sol: md`**(a)**
$$R_a = \frac{2\pi a}{\sigma\pi r_w^2} = \frac{2(0.08\ \text{m})}{(4\times10^7\ \text{S/m})(10^{-3}\ \text{m})^2} = 4\times10^{-3}\ \Omega \qquad I_a = \frac{3\ \text{V}}{4\times10^{-3}\ \Omega} = 750\ \text{A}$$
(An enormous current: a 3 V battery shorted through 50 cm of thick copper-like wire. A real battery's internal resistance would limit it.) With the battery's + terminal on the left as drawn, $I_a$ circulates counterclockwise seen from $+z$.

**(b)** On the axis of a loop, $B_z = \dfrac{\mu_0I_aa^2}{2(a^2 + z^2)^{3/2}}$; at the center, $B = \mu_0I_a/2a$ along $+\hat z$. Since $b \ll a$ it is nearly uniform over the small loop:
$$\Psi_{a\to b} \approx \frac{\mu_0I_a}{2a}\,\pi b^2$$
**(c)**
$$L_{a\to b} = \frac{\mu_0\pi b^2}{2a} = \frac{(4\pi\times10^{-7})\pi(0.005)^2}{2(0.08)} = 6.17\times10^{-10}\ \text{H}$$
So $\Psi_{a\to b} = (6.17\times10^{-10})(750) = 4.63\times10^{-7}$ Wb.` }),
    P({ src: 'HW 6 #4(d)–(e)', title: 'The inner loop rises',
      q: md`(d) Assume next that the inner loop moves upward, in the $+z$ direction, at 2 m/s (starting in the plane of the outer loop). Calculate the emf induced in the inner loop, assuming that the flux linking the loop due to its own induced current is negligible.

(e) You are given that the inductance of the inner loop is 0.2 µH. If the loop moves upward at 2 m/s, derive a differential equation for the induced current in the loop.

Hint: the current around the inner loop is its induced emf divided by its resistance, and the emf is the negative time derivative of the **total** flux produced by the currents in both loops.`,
      parts: [
        MC('(d) With $z = vt$ and $C$ counterclockwise from $+z$, $\\mathcal E_b(t) =$', ['$\\dfrac{3\\pi b^2\\mu_0I_aa^2\\,v^2t}{2(a^2 + v^2t^2)^{5/2}}$', '$0$, because $L_{a\\to b}I_a$ is constant', '$-\\dfrac{3\\pi b^2\\mu_0I_aa^2\\,v^2t}{2(a^2 + v^2t^2)^{5/2}}$', '$\\dfrac{\\pi b^2\\mu_0I_aa^2\\,v}{2(a^2 + v^2t^2)^{3/2}}$'], 0,
          [null, '$L_{a\\to b}$ uses the field at the center; once the loop leaves the plane it sees the weaker on-axis field.', 'Sign: the upward flux falls as the loop rises, so $-d\\Psi/dt > 0$ along the counterclockwise $C$.', 'That multiplies the field by $v$ instead of differentiating it with respect to $z$.']),
        N('(d) $\\mathcal E_b$ at $t = 20$ ms ($z = a/2$, where it peaks)', 9.931e-6, 'V'),
        MC('(e) The induced current $i$ (counterclockwise from $+z$) obeys', ['$L_b\\dfrac{di}{dt} + R_bi = \\mathcal E_b(t)$', '$L_b\\dfrac{di}{dt} = \\mathcal E_b(t)$', '$R_bi = \\mathcal E_b(t) + L_b\\dfrac{di}{dt}$', '$L_b\\dfrac{di}{dt} + R_bi = 0$'], 0,
          [null, 'The loop has resistance: $R_b = 2\\pi b/\\sigma\\pi r_w^2$.', 'Sign: the self-flux $L_bi$ opposes the change, so $L_b\\,di/dt$ subtracts from $\\mathcal E_b$.', 'The moving loop is driven by $\\mathcal E_b(t)$ from the big loop\'s field.']),
        N('(e) $R_b$', 2.5e-4, 'Ω'),
        N('(e) $\\tau = L_b/R_b$', 8e-4, 's'),
      ],
      hints: ['$\\Psi_b(z) = \\pi b^2B_z(z)$ with the on-axis field $B_z = \\mu_0I_aa^2/2(a^2 + z^2)^{3/2}$; then $\\emf_b = -\\dfrac{d\\Psi_b}{dz}\\dfrac{dz}{dt}$.', 'Total flux through the small loop: $L_{a\\to b}(z)I_a + L_bi$. Set $iR_b = -\\dfrac{d}{dt}(\\text{total})$.'],
      sol: md`**(d)** The inner loop at height $z = vt$ sees the on-axis field, nearly uniform over it ($b \ll a$). With $d\mathbf S = +\hat z$:
$$\Psi_b(z) = \pi b^2\,\frac{\mu_0I_aa^2}{2(a^2 + z^2)^{3/2}} \qquad \emf_b = -\frac{d\Psi_b}{dz}\frac{dz}{dt} = \frac{3\pi b^2\mu_0I_aa^2\,z\,v}{2(a^2 + z^2)^{5/2}}$$
With $z = vt$, $v = 2$ m/s, $I_a = 750$ A, $a = 0.08$ m, $b = 0.005$ m:
$$\emf_b(t) = \frac{3\pi b^2\mu_0I_aa^2v^2\,t}{2(a^2 + v^2t^2)^{5/2}} = \frac{2.84\times10^{-9}\,t}{(0.0064 + 4t^2)^{5/2}}\ \text{V}\quad(t\ \text{in s})$$
It is **zero at $t = 0$** (the field is flat at the center), rises to a peak where $z = a/2$ ($t = 20$ ms), $\emf_b = 9.93\times10^{-6}$ V, then falls off as $z^{-4}$. Positive: counterclockwise from $+z$, the same sense as $I_a$. *Lenz:* rising, the loop loses upward flux; it tops it up. ✓

**(e)** The total flux through the inner loop is $\Psi_{\text{tot}} = L_{a\to b}(z)I_a + L_bi$, where $L_{a\to b}(z) = \pi b^2\mu_0a^2/2(a^2 + z^2)^{3/2}$. Ohm and Faraday:
$$iR_b = -\frac{d\Psi_{\text{tot}}}{dt} = \emf_b(t) - L_b\frac{di}{dt} \quad\Rightarrow\quad L_b\frac{di}{dt} + R_bi = \emf_b(t)$$
with $R_b = \dfrac{2\pi b}{\sigma\pi r_w^2} = \dfrac{2(0.005)}{(4\times10^7)(10^{-6})} = 2.5\times10^{-4}\ \Omega$ and $L_b = 0.2\ \mu$H:
$$(2\times10^{-7}\ \text{H})\frac{di}{dt} + (2.5\times10^{-4}\ \Omega)\,i = \frac{2.84\times10^{-9}\,t}{(0.0064 + 4t^2)^{5/2}}\ \text{V}, \qquad i(0) = 0$$
**Check.** The time constant $L_b/R_b = 0.8$ ms is short next to the ~20 ms over which $\emf_b$ changes, so $i \approx \emf_b/R_b$: about 40 mA at the peak. (Neglecting the self-flux, as part (d) did, is good to within a delay of about $\tau = 0.8$ ms.)` }),

    // ================================================================ Problem 5
    RF(md`### Problem 5 · Rails, an armature, and a rail gun

A pair of conducting rails a distance $L$ apart is connected at $z = 0$ to a fixed conducting rod $AD$, and at $z = z_0$ to a conducting armature $BC$ that can slide along the rails in the $\pm\hat z$ direction. A constant field $\mathbf B = -B_0\hat x$ fills the region (into the page in the diagram). The armature is pulled mechanically in the $+\hat z$ direction at constant velocity $\mathbf v = v_0\hat z$ m/s from $z = z_0$, and the changing flux through $ABCD$ induces an emf $\emf$ and a current $I_0$ around the loop.

[[fig:rails]]`, { rails: { svg: railsFig(), cap: 'A and D on the fixed rod at z = 0; B and C on the armature. x̂ out of the page, ẑ right, ŷ down.' } }),
    P({ src: 'HW 6 #5(a)–(c)', title: 'Emf, current, and the brake force',
      q: md`(a) What is the emf $\emf$ induced in the loop $ABCD$?

(b) What are the magnitude and direction of the induced current $I_0$, in terms of the resistance $R$ of the loop $ABCD$?

(c) What are the magnitude and direction of the Lorentz force $\mathbf F = q(\mathbf v\times\mathbf B)$ exerted on the armature by $\mathbf B$? Hint: express it in terms of $I_0$.`,
      parts: [
        MC('(a) The emf around $A\\to B\\to C\\to D$ is', ['$-B_0Lv_0$', '$+B_0Lv_0$', '$-B_0L(z_0 + v_0t)$', '$-B_0Lv_0t$'], 0,
          [null, '$ABCD$ runs clockwise on the page, so $d\\mathbf S = -\\hat x$, along $\\mathbf B$: $\\Psi > 0$ and growing, $\\emf = -d\\Psi/dt < 0$.', 'That is the flux in Wb, not its rate of change.', 'The emf is constant: the area grows at a steady rate.']),
        MC('(b) $|I_0| = $', ['$B_0Lv_0/R$', '$B_0Lv_0R$', '$B_0L(z_0 + v_0t)/R$', '$B_0v_0/R$'], 0,
          [null, 'Ohm\'s law divides by $R$.', 'That divides the flux, not the emf, by $R$.', 'The length $L$ of the armature is missing.']),
        FIX('(b) $I_0$ flows', ['$A\\to D\\to C\\to B$: up the armature ($C\\to B$), counterclockwise on the page', '$A\\to B\\to C\\to D$: down the armature, clockwise on the page'], 0,
          [null, 'The emf along $ABCD$ is negative, so the current runs the other way.']),
        MC('(c) The force on the armature is', ['$-\\hat z\\,I_0B_0L$, against the motion', '$+\\hat z\\,I_0B_0L$', '$-\\hat y\\,I_0B_0L$', '$+\\hat x\\,I_0B_0L$'], 0,
          [null, 'An induced current always brakes the motion that makes it.', 'The force is perpendicular to the current, which runs along $\\mp\\hat y$.', 'The force is perpendicular to $\\mathbf B$, which is along $\\hat x$.']),
      ],
      hints: ['Going $A\\to B\\to C\\to D$ is clockwise on the page, so the RHR puts $d\\mathbf S$ into the page: $-\\hat x$.', 'In the armature $\\mathbf v\\times\\mathbf B = v_0\\hat z\\times(-B_0\\hat x)$. For (c), the moving charges add up to $\\mathbf F = I_0\\boldsymbol\\ell\\times\\mathbf B$ with $\\boldsymbol\\ell$ along the current.'],
      sol: md`**(a)** Take $C = ABCD$: right along the top rail, down the armature, left, up the rod: clockwise on the page, so $d\mathbf S = -\hat x\,dy\,dz$ (into the page). The area is $L\,z(t)$ with $z(t) = z_0 + v_0t$:
$$\Psi = (-B_0\hat x)\cdot(-\hat x)\,L(z_0 + v_0t) = B_0L(z_0 + v_0t) \qquad \emf_{ABCD} = -\frac{d\Psi}{dt} = -B_0Lv_0$$
Magnitude $B_0Lv_0$; it drives current around $ADCB$. *Check:* in the armature $\mathbf v\times\mathbf B = v_0\hat z\times(-B_0\hat x) = -v_0B_0\hat y$, up the page, from $C$ to $B$, over length $L$: $B_0Lv_0$. ✓

**(b)** $|I_0| = B_0Lv_0/R$, flowing $A\to D\to C\to B\to A$: up the armature, left along the top rail, down the rod, right along the bottom. *Lenz:* the into-page flux grows; the current makes out-of-page field inside, counterclockwise on the page. ✓

**(c)** Summing $q\mathbf v\times\mathbf B$ over the moving charges gives $\mathbf F = I_0\boldsymbol\ell\times\mathbf B$, with $\boldsymbol\ell = -L\hat y$ (along the current, $C\to B$):
$$\mathbf F = I_0(-L\hat y)\times(-B_0\hat x) = I_0LB_0(\hat y\times\hat x) = -\hat z\,I_0B_0L = -\hat z\,\frac{B_0^2L^2v_0}{R}$$
It opposes $\mathbf v$; the pulling agent supplies $Fv_0 = (B_0Lv_0)^2/R = I_0^2R$, the Joule heat. ✓` }),
    P({ src: 'HW 6 #5(d)', title: 'Rail gun',
      q: md`(d) Now the armature is no longer moved mechanically (though it is still free to move in response to Lorentz forces), and a projectile of mass $M$ is attached to it. A constant current of magnitude $I'$ is introduced into the loop at point $A$ so that it flows along the contour $ABCD$. The field of this current loop is negligible compared with the background $\mathbf B$, and the armature's mass is negligible compared with $M$. What are the magnitude and direction of the projectile's acceleration $\mathbf a$? Hint: $\mathbf F = M\mathbf a$.`,
      parts: [MC('(d) $\\mathbf a = $', ['$+\\hat z\\,I\'LB_0/M$', '$-\\hat z\\,I\'LB_0/M$', '$+\\hat y\\,I\'LB_0/M$', '$+\\hat z\\,I\'B_0/LM$'], 0,
        [null, 'Along $ABCD$ the armature current runs $B\\to C$, $+\\hat y$: $\\hat y\\times(-\\hat x) = +\\hat z$.', 'The force is perpendicular to the armature current.', 'The force grows with the armature length: $F = I\'LB_0$.'])],
      hints: ['Along $ABCD$, the armature carries $I\'$ from $B$ to $C$: $\\boldsymbol\\ell = +L\\hat y$.', '$\\mathbf F = I\'\\boldsymbol\\ell\\times\\mathbf B$, then $\\mathbf a = \\mathbf F/M$.'],
      sol: md`Along $ABCD$ the armature carries $I'$ from $B$ to $C$: $\boldsymbol\ell = +L\hat y$.
$$\mathbf F = I'L\hat y\times(-B_0\hat x) = I'LB_0(\hat x\times\hat y) = +\hat z\,I'LB_0 \qquad \mathbf a = \frac{\mathbf F}{M} = +\hat z\,\frac{I'LB_0}{M}$$
A constant acceleration, away from the fixed rod. *Why outward:* $ABCD$ is clockwise on the page, so the loop's own field inside points into the page, along $\mathbf B$; a loop in a parallel field is pushed to grow. As the armature speeds up it also generates a back-emf $B_0Lv$ (part (a)), which the source must overcome to hold $I'$ constant: that is where the projectile's kinetic energy comes from.` }),

    // ================================================================ Problem 6
    RF(md`### Problem 6 · A loop spinning on a shaft: the generator

A rectangular conducting loop of side lengths $a$ and $b$ is mounted on a vertical shaft along $\hat z$, in a uniform field $\mathbf B = B\hat x$. The loop, $C$, encloses an area $S$ with unit normal $\hat s$ and area element $d\mathbf S = \hat s\,dS$. Figure (A) is a head-on view at $\phi = 0$; figure (B) is a top-down view defining $\phi$.

[[fig:shaft]]`, { shaft: { svg: PF.row([{ svg: shaftFig(), cap: '(A) Head-on at φ = 0: the loop lies in the xz-plane.' }, { svg: topFig(), cap: '(B) Top view: the loop at φ = ωt from x, ŝ perpendicular to it.' }]).svg } }),
    P({ src: 'HW 6 #6', title: 'Flux, emf and current of the spinning loop',
      q: md`(a) Find the unit normal $\hat s$ as a function of $\phi$, "the angle between $\hat s$ and $\hat x$". Hint: $\hat s$ stays perpendicular to the surface for every $\phi$, and $\hat s(\phi = 0) = \hat y$. (That quoted wording contradicts the hint and figure (B), where $\phi$ is the loop's angle from $\hat x$; use the figure's $\phi$.)

(b) Using this expression, calculate the magnetic flux $\Psi = \int_S\mathbf B\cdot d\mathbf S$ through the loop for an arbitrary angle $\phi \in [0, 2\pi)$.

(c) The loop now spins counterclockwise at $\omega$ rad/s, so its angle relative to the $x$-axis is $\phi(t) = \omega t$. Using (b), find the flux through the loop as a function of time, and use Faraday's law to find the induced emf.

(d) The loop has an internal resistance $R$. Find and plot the current through the loop for $a = b = R = \omega = 1$ (SI units) on $t \in [0, 2\pi)$ s.`,
      parts: [
        MC('(a) $\\hat s(\\phi) = $', ['$-\\sin\\phi\\,\\hat x + \\cos\\phi\\,\\hat y$', '$\\cos\\phi\\,\\hat x + \\sin\\phi\\,\\hat y$', '$\\sin\\phi\\,\\hat x - \\cos\\phi\\,\\hat y$', '$\\sin\\phi\\,\\hat x + \\cos\\phi\\,\\hat y$'], 0,
          [null, 'That is along the loop\'s own edge in figure (B), not its normal. It is the literal reading of "the angle between $\\hat s$ and $\\hat x$", which the hint rules out: it gives $\\hat x$ at $\\phi = 0$, not $\\hat y$.', 'That is $-\\hat s$: it gives $-\\hat y$ at $\\phi = 0$.', 'At $\\phi = 90°$ it gives $+\\hat x$, but turning the loop counterclockwise by 90° turns $\\hat s$ from $\\hat y$ to $-\\hat x$.']),
        MC('(b) $\\Psi(\\phi) = $', ['$-Bab\\sin\\phi$', '$Bab\\cos\\phi$', '$Bab\\sin\\phi$', '$Bab$'], 0,
          [null, '$\\mathbf B\\cdot\\hat s = B\\hat x\\cdot\\hat s$ picks the $\\hat x$ part of $\\hat s$, which is $-\\sin\\phi$.', 'Sign: for small positive $\\phi$, $\\hat s$ tips toward $-\\hat x$, against $\\mathbf B$.', 'The flux changes as the loop turns.']),
        MC('(c) $\\mathcal E(t) = $', ['$Bab\\,\\omega\\cos\\omega t$', '$Bab\\,\\omega\\sin\\omega t$', '$-Bab\\,\\omega\\cos\\omega t$', '$-Bab\\sin\\omega t$'], 0,
          [null, 'That follows if $\\phi$ is read as the angle from $\\hat x$ to $\\hat s$ (the wording of (a)); the figure and $\\hat s(0) = \\hat y$ put $\\hat s$ at $\\phi + 90°$. Same waveform, shifted by a quarter period.', 'Sign: $\\emf = -\\dfrac{d}{dt}(-Bab\\sin\\omega t) = +Bab\\,\\omega\\cos\\omega t$.', 'That is the flux, not its negative derivative.']),
        MC('(d) With $a = b = R = \\omega = 1$, $I(t) = $', ['$B\\cos t$ (A, with $B$ in T)', '$B\\sin t$', '$\\cos^2t$', '$B$, constant'], 0,
          [null, 'Follows the emf of (c), which is a cosine here.', 'The current is linear in the emf, not its square.', 'The emf oscillates, so the current does.']),
      ],
      hints: ['In figure (B) the loop lies along $\\cos\\phi\\,\\hat x + \\sin\\phi\\,\\hat y$. Rotate that by 90° counterclockwise to get $\\hat s$ (so that $\\hat s(0) = \\hat y$).', '$\\Psi = \\mathbf B\\cdot\\hat s\\,ab$, then $\\emf = -d\\Psi/dt$ and $I = \\emf/R$.'],
      figs: { iplot: { svg: currentPlot(), cap: 'I(t)/B = cos t for a = b = R = ω = 1: positive (along C) at t = 0, when the loop is edge-on to B.' } },
      sol: md`**(a)** In the top view the loop lies along $\cos\phi\,\hat x + \sin\phi\,\hat y$. Its normal in the plane is that direction turned by 90°; the turn that gives $\hat s(0) = \hat y$ (and $\hat s$ up and to the left, as drawn) is counterclockwise:
$$\hat s(\phi) = -\sin\phi\,\hat x + \cos\phi\,\hat y$$
**(b)** $\Psi = \int_S B\hat x\cdot\hat s\,dS = -Bab\sin\phi$ Wb.

**(c)** $\Psi(t) = -Bab\sin\omega t$, and
$$\emf(t) = -\frac{d\Psi}{dt} = Bab\,\omega\cos\omega t\ \text{V}$$
measured along $C$, the circulation tied to $\hat s$ by the RHR. At $t = 0$ the loop is edge-on to $\mathbf B$ ($\Psi = 0$, changing fastest), so the emf is at its peak; a quarter turn later it is face-on and the emf is zero. (Read literally, part (a)'s "angle between $\hat s$ and $\hat x$" would give $\Psi = Bab\cos\omega t$ and $\emf = Bab\,\omega\sin\omega t$, the same waveform shifted by a quarter period.)

**(d)** $I(t) = \emf/R = \dfrac{Bab\,\omega}{R}\cos\omega t = B\cos t$ A (with $B$ in T), positive along $C$:

[[fig:iplot]]

One full cycle per turn. The average power into $R$ is $(Bab\,\omega)^2/2R$, supplied by whatever turns the shaft.` }),
  ];

  EM.lesson('e2-hw', { id: 'hw6', kind: 'hw', title: 'HW 6 · emf, moving and rotating loops, mutual inductance, rails', steps });
})();

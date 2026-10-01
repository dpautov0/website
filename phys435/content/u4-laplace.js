/* Unit 4 — Laplace's equation and uniqueness.
   Lecture 8 from Poisson's equation on (the capacitor recap at its start is Unit 3) and all of Lecture 9; Griffiths 3.1.
   HW 4 & Discussion 3: Griffiths 3.1. HW 4: Griffiths 3.5. */
(function () {
  'use strict';
  const { RF, P, Q, W } = C;
  const D2R = Math.PI / 180;

  // ================================================================== drawing helpers
  // a closed, slightly irregular outline ("potato")
  const potato = (cx, cy, rx, ry, a = [0.07, 0.05, 0.03], ph = [0.4, 1.7, 2.9]) => {
    const pts = [];
    for (let i = 0; i < 96; i++) {
      const t = (2 * Math.PI * i) / 96;
      const w = 1 + a[0] * Math.sin(2 * t + ph[0]) + a[1] * Math.sin(3 * t + ph[1]) + a[2] * Math.sin(5 * t + ph[2]);
      pts.push([cx + rx * w * Math.cos(t), cy - ry * w * Math.sin(t)]);
    }
    return pts;
  };
  const region = (f, pts, cls = '') => { f.poly(pts, { cls: 'shade nodecl' }); f.poly(pts, { cls }); };
  const metal = (f, pts) => { f.hatchBand(pts); f.poly(pts); };
  const disk = (f, cx, cy, r) => metal(f, f.arcPts(cx, cy, r, r, 0, 360).slice(0, -1));
  // hatched annulus: a thick metal shell (polygon with a hole)
  const shell = (f, cx, cy, r1, r2) => {
    f.hatchBand(f.arcPts(cx, cy, r2, r2, 0, 360).concat(f.arcPts(cx, cy, r1, r1, 360, 0)));
    f.circle(cx, cy, r2); f.circle(cx, cy, r1);
  };
  // hatched frame = a closed metal box in cross-section; (x, y, w, h) is the inside
  const frame = (f, x, y, w, h, t = 9) => {
    f.hatchBand([[x - t, y - t], [x + w + t, y - t], [x + w + t, y + h + t], [x - t, y + h + t], [x - t, y - t], [x, y], [x, y + h], [x + w, y + h], [x + w, y], [x, y]]);
    f.rect(x, y, w, h); f.rect(x - t, y - t, w + 2 * t, h + 2 * t);
  };
  // relaxation grid: numbers are fixed (shaded) cells, strings are interior cells ('' = blank)
  const gridSvg = (rows, o = {}) => {
    const f = PF.fig();
    const cw = o.cw || 50, ch = o.ch || 32;
    rows.forEach((row, i) => row.forEach((v, j) => {
      const x = j * cw, y = i * ch, fixed = typeof v === 'number';
      if (fixed) f.rect(x, y, cw, ch, { cls: 'shade nodecl' });
      f.rect(x, y, cw, ch, { cls: 'dim thin' });
      const s = String(v);
      if (s !== '') f.label(x + cw / 2, y + ch / 2, s, 'c', fixed ? 'small' : '');
    }));
    if (o.extra) o.extra(f, cw, ch);
    return f.svg();
  };
  // small equipotential maps for "could this be charge-free?" questions
  const cmapBox = (kind) => {
    const f = PF.fig({ pad: 6 });
    const S = 44, cx = 50, cy = 50;
    const Pt = (u, v) => [cx + S * u, cy - S * v];
    const curve = (pts) => { if (pts.length > 1) f.pl(pts.map(([u, v]) => Pt(u, v))); };
    f.rect(cx - S - 4, cy - S - 4, 2 * S + 8, 2 * S + 8, { cls: 'dim thin' });
    if (kind === 'circles') [0.24, 0.48, 0.72, 0.96].forEach((r) => f.circle(cx, cy, S * r));
    if (kind === 'ovals') [0.28, 0.56, 0.84].forEach((r) => f.ellipse(cx + 6, cy - 4, S * r, S * r * 0.62));
    if (kind === 'lines') [-0.6, -0.2, 0.2, 0.6].forEach((c) => curve([[c - 0.3, -1], [c + 0.3, 1]]));
    if (kind === 'saddle') {
      for (const c of [0.12, 0.42]) for (const sg of [1, -1]) {
        const a = [], b = [];
        for (let i = 0; i <= 40; i++) {
          const v = -1 + i / 20;
          const u = sg * Math.sqrt(c + v * v); if (Math.abs(u) <= 1) a.push([u, v]);
          const w = sg * Math.sqrt(c + v * v); if (Math.abs(w) <= 1) b.push([v, w]);
        }
        curve(a); curve(b);
      }
      f.line(...Pt(-1, -1), ...Pt(1, 1), { cls: 'dim thin dash' });
      f.line(...Pt(-1, 1), ...Pt(1, -1), { cls: 'dim thin dash' });
    }
    return f.svg();
  };

  // ================================================================== Lesson 1 figures
  const fUnknown = (grounded) => {
    const f = PF.fig();
    const cx = 80, cy = 80, R = 48;
    disk(f, cx, cy, R);
    [-40, -20, 0, 20, 40].forEach((a) => f.label(cx + (R + 12) * Math.cos(a * D2R), cy - (R + 12) * Math.sin(a * D2R), '-', 'c', 'small'));
    if (!grounded) [145, 180, 215].forEach((a) => f.label(cx + (R + 12) * Math.cos(a * D2R), cy - (R + 12) * Math.sin(a * D2R), '+', 'c', 'small'));
    f.charge(cx + R + 92, cy, { q: '+', lab: 'q', at: 'r' });
    if (grounded) { f.line(cx, cy + R, cx, cy + R + 12); f.ground(cx, cy + R + 12); f.label(cx + 16, cy + R + 22, 'V=0', 'l', 'small'); }
    f.text(cx + R + 92, cy + 62, md`$\sigma$ on the sphere = ?`, 'c');
    return f.svg();
  };
  const fRegion = () => {
    const f = PF.fig();
    const pts = potato(170, 96, 100, 60, [0.06, 0.05, 0.03], [0.9, 2.2, 0.4]);
    region(f, pts, 'thick');
    f.label(170, 82, '\\nabla^2 V = 0', 'c');
    f.text(170, 108, 'no charge in here', 'c');
    f.charge(30, 28, { q: '+', lab: 'q_1', at: 'r' });
    f.charge(322, 178, { q: '-', lab: 'q_2', at: 'l' });
    f.charge(318, 22, { q: '+', lab: 'q_3', at: 'l' });
    const b = pts[60];
    f.arrow(b[0] - 44, b[1] + 40, b[0] - 3, b[1] + 3, { cls: 'dim' });
    f.text(b[0] - 48, b[1] + 44, md`boundary: $V$ known here`, 'tr');
    return f.svg();
  };
  const fPoints = () => {
    const f = PF.fig();
    f.circle(62, 82, 46, { cls: 'shade nodecl' }); f.circle(62, 82, 46);
    f.label(62, 56, '\\rho_0', 'c', 'small');
    f.dot(62, 94); f.tag(62, 94, 'P_1', 'r', 7);
    f.dot(160, 40); f.tag(160, 40, 'P_2', 'r', 7);
    metal(f, [[220, 34], [296, 34], [296, 128], [220, 128]]);
    f.dot(258, 81, 3.2); f.line(261, 81, 322, 81, { cls: 'dim thin' }); f.label(328, 81, 'P_3', 'l');
    f.charge(160, 124, { q: '+', lab: 'P_4', at: 'r' });
    return f.svg();
  };
  const fPlatesH = (top = 'V_0', bot = 'V=0', mid = 'no charge between') => {
    const f = PF.fig();
    f.plane(20, 250, 34, { side: 'above', lab: top });
    f.plane(20, 250, 134, { side: 'below', lab: bot });
    f.dim(274, 34, 274, 134, 'd');
    if (mid) f.text(135, 84, mid, 'c');
    return f.svg();
  };
  const fPeak = () => {
    const f = PF.fig();
    const cx = 130, cy = 92;
    [[30, 22, 24, '3\\text{ V}'], [62, 42, 12, '2\\text{ V}'], [94, 64, 8, '1\\text{ V}']].forEach(([rx, ry, gap, lab]) => {
      f.pl(f.arcPts(cx, cy, rx, ry, gap, 360 - gap));
      f.label(cx + rx, cy, lab, 'c', 'small');
    });
    f.dot(cx, cy); f.tag(cx, cy, 'P', 'l', 6);
    return f.svg();
  };
  const fTiny = () => {
    const f = PF.fig();
    f.sphere(80, 70, 36);
    f.dot(80, 70); f.tag(80, 70, 'P', 'l', 6);
    const ex = 80 + 36 * Math.cos(30 * D2R), ey = 70 - 36 * Math.sin(30 * D2R);
    f.line(80, 70, ex, ey, { cls: 'dim' });
    f.tag(ex, ey, 'a', 'tr', 7);
    f.text(130, 118, 'a tiny sphere centered on P', 'l');
    return f.svg();
  };
  const fBall = (o = {}) => {
    const f = PF.fig();
    const cx = 90, cy = 86, R = 60;
    f.circle(cx, cy, R, { cls: 'shade nodecl' }); f.circle(cx, cy, R);
    const ex = cx + R * Math.cos(-28 * D2R), ey = cy - R * Math.sin(-28 * D2R);
    f.line(cx, cy, ex, ey, { cls: 'dim' });
    f.tag((cx + ex) / 2, (cy + ey) / 2, 'R', 'b', 8);
    f.dot(cx, cy, 2);
    f.label(cx, cy - (o.r ? 45 : 32), o.lab || '\\rho_0', 'c');
    if (o.r) { f.circle(cx, cy, 30, { cls: 'dash dim' }); f.tag(cx - 30 * Math.cos(45 * D2R), cy + 30 * Math.sin(45 * D2R), 'r', 'bl', 6); }
    return f.svg();
  };
  const fCyl = () => {
    const f = PF.fig();
    const cx = 80, top = 34, bot = 160, rx = 40, ry = 11;
    f.line(cx, top - 26, cx, bot + 26, { cls: 'dim dash thin' });
    f.ellipse(cx, top, rx, ry);
    f.ellipse(cx, bot, rx, ry, { half: 'front' }); f.ellipse(cx, bot, rx, ry, { half: 'back', cls: 'dash dim' });
    f.line(cx - rx, top, cx - rx, bot); f.line(cx + rx, top, cx + rx, bot);
    f.line(cx, top, cx + rx, top, { cls: 'dim' });
    f.label(cx + rx / 2, top - 14, 'a', 'b', 'small');
    f.label(cx + 18, 98, '\\rho_0', 'c');
    f.text(cx + rx + 14, 98, 'long cylinder, uniform charge', 'l');
    return f.svg();
  };
  const fBoxQ = (o = {}) => {
    const f = PF.fig();
    const x = 24, y = 22, w = o.w || 200, h = o.h || 116;
    frame(f, x, y, w, h);
    f.line(x + w / 2, y + h + 9, x + w / 2, y + h + 16); f.ground(x + w / 2, y + h + 16);
    f.label(x + w + 16, y + h / 2, o.wall || 'V=0', 'l', 'small');
    if (o.q !== false) f.charge(x + w * 0.38, y + h * 0.46, { q: '+', lab: 'q', at: 'r' });
    return f.svg();
  };
  const miniBox = (kind) => {
    const f = PF.fig();
    const x = 22, y = 24, w = 92, h = 60;
    frame(f, x, y, w, h, 6);
    const top = kind === 'B' || kind === 'D' ? 'V_0' : '0';
    const rest = kind === 'D' ? 'V_0' : '0';
    f.label(x + w / 2, y - 12, top, 'b', 'small');
    f.label(x + w / 2, y + h + 12, rest, 't', 'small');
    f.label(x - 12, y + h / 2, rest, 'r', 'small');
    f.label(x + w + 12, y + h / 2, rest, 'l', 'small');
    if (kind === 'C') f.charge(x + w / 2, y + h / 2, { q: '+', r: 6 });
    return f.svg();
  };
  const fFourBoxes = () => PF.row(['A', 'B', 'C', 'D'].map((k) => ({ svg: miniBox(k), cap: k }))).svg;
  const fPlates1D = (o = {}) => {
    const f = PF.fig();
    const xa = 50, xb = 250, y0 = 20, y1 = 136;
    if (o.slab) f.rect(xa, y0, xb - xa, y1 - y0, { cls: 'shade nodecl' });
    f.wall(xa, y0, y1, { side: 'left', lab: o.la });
    f.wall(xb, y0, y1, { side: 'right', lab: o.lb });
    if (o.slab) f.label((xa + xb) / 2, (y0 + y1) / 2 - 12, o.slab, 'c');
    if (o.mid) f.text((xa + xb) / 2, (y0 + y1) / 2 - 12, o.mid, 'c');
    const ya = y1 + 24;
    f.arrow(xa - 30, ya, xb + 36, ya, { cls: 'dim', hs: 6 });
    f.label(xb + 42, ya, 'x', 'l', 'small accent');
    (o.ticks || [[xa, '0'], [xb, 'L']]).forEach(([X, s]) => { f.line(X, ya - 4, X, ya + 4, { cls: 'dim' }); f.label(X, ya + 8, s, 't', 'small'); });
    if (o.probe) { f.line(o.probe, y0 + 6, o.probe, y1 - 6, { cls: 'dash dim thin' }); f.label(o.probe + 8, y1 - 26, '?', 'l'); }
    return f.svg();
  };
  const fLine = () => PF.plot({ w: 300, h: 200, x: [0, 6], y: [0, 5], xl: 'x', yl: 'V', xt: [1, 2, 3, 4, 5], yt: [1, 2, 3, 4],
    curves: [{ f: (x) => 5 - x, from: 1, to: 5 }], pts: [{ x: 1, y: 4 }, { x: 5, y: 0 }] });
  const fDip = () => {
    const f = PF.fig();
    const pts = [];
    for (let i = 0; i <= 40; i++) { const u = -1 + i / 20; pts.push([120 + 90 * u, 120 - 84 * u * u]); }
    f.pl(pts);
    const yd = 120 - 84 * 0.5625;
    f.dot(52.5, yd); f.dot(187.5, yd);
    f.line(62, yd, 178, yd, { cls: 'dash dim' });
    f.dot(120, 120); f.tag(120, 120, 'V(x)', 'b', 7);
    f.text(120, yd - 10, 'average', 'b');
    f.tag(52.5, yd, 'V(x-a)', 'l', 9); f.tag(187.5, yd, 'V(x+a)', 'r', 9);
    return f.svg();
  };
  const fFourCurves = () => {
    const sm = (fn) => PF.plot({ w: 150, h: 112, x: [0, 1], y: [0, 1], xl: 'x', yl: 'V', ml: 16, mr: 16, mt: 14, mb: 16, curves: [{ f: fn }] });
    return PF.row([
      { svg: sm((x) => 0.2 + 0.6 * x), cap: 'A' },
      { svg: sm((x) => 0.2 + 1.6 * x * (1 - x)), cap: 'B' },
      { svg: sm((x) => 0.2 + 1.1 * Math.abs(x - 0.45)), cap: 'C' },
      { svg: sm((x) => 0.5 + 0.35 * Math.tanh(6 * (x - 0.5))), cap: 'D' },
    ]).svg;
  };
  const fSlabPlot = () => PF.plot({ w: 320, h: 200, x: [0, 1], y: [0, 0.16], xl: 'x', yl: 'V', xt: [[0.5, 'd/2'], [1, 'd']],
    yt: [[0.125, '\\tfrac{\\rho d^2}{8\\varepsilon_0}']], curves: [{ f: (x) => x * (1 - x) / 2 }] });

  // ================================================================== Lesson 1
  const L1 = {
    id: 'u4-poisson', title: "Poisson and Laplace; the 1-D case",
    steps: [
      RF(md`
        ### Why switch to a differential equation

        The job of electrostatics is to find the field of a given stationary charge distribution, and the best route is usually through the potential. If you know every charge, you can integrate:

        $$V(\vb r) = \kq\int \frac{\rho(\vb r\,')}{\srm}\,d\tau'$$

        Two things go wrong.

        1. The integral is often too hard to do by hand.
        2. With conductors you **don't know** $\rho$. Charge on a conductor moves until the conductor is an equipotential. You control its total charge, or its potential (by wiring it to a battery or to ground), not how the charge spreads over its surface. The integral needs exactly the distribution you're trying to find.

        [[fig:unknown]]

        So go back to the differential form. Gauss's law $\divg\vb E = \rho/\varepsilon_0$ together with $\vb E = -\nabla V$ gives **Poisson's equation**:

        $$\nabla^2 V = -\frac{\rho}{\varepsilon_0}$$

        Poisson's equation plus boundary conditions is equivalent to the integral. The lecture splits the job in two: deal with the **boundary conditions**, and deal with the **source** $\rho$.
      `, { unknown: { svg: fUnknown(false), cap: md`A point charge $q$ near a neutral metal sphere. The induced surface charge is part of the answer, so you can't put it into the Coulomb integral up front.` } }),

      Q(md`A point charge $q$ sits near a **grounded** metal sphere. Before solving anything, which of these do you actually know?`,
        [md`The sphere's total charge: zero`, md`The surface charge density $\sigma$ on the sphere`, md`The sphere's potential: $V = 0$`, md`The field just outside the sphere`], 2,
        [md`Grounding connects the sphere to the earth, so charge flows on or off until $V = 0$. The net charge is whatever that takes; it's part of the answer (and it isn't zero here).`,
          md`That's exactly what adjusts itself to $q$. It's an output of the calculation, not an input.`,
          null,
          md`The field at a conductor's surface is $\sigma/\varepsilon_0$, and $\sigma$ is unknown.`],
        md`"Grounded" means held at $V = 0$: that is the boundary condition on the sphere. Had the sphere been **isolated** instead, you'd know its total charge and not its potential. Either way you know one number about the conductor and never the distribution. Lesson 5 shows that either number is enough.`,
        { figHtml: fUnknown(true) }),

      Q(md`Start from Gauss's law $\nabla\cdot\vb E = \rho/\varepsilon_0$ and $\vb E = -\nabla V$. Which equation follows?`,
        [md`$\nabla^2 V = \rho/\varepsilon_0$`, md`$\nabla^2 V = -\varepsilon_0\rho$`, md`$\nabla V = -\rho/\varepsilon_0$`, md`$\nabla^2 V = -\rho/\varepsilon_0$`], 3,
        [md`The minus sign from $\vb E = -\nabla V$ is lost: $\nabla\cdot(-\nabla V) = -\nabla^2 V$.`,
          md`$\varepsilon_0$ divides $\rho$ in Gauss's law, and it stays in the denominator.`,
          md`The divergence of a gradient is the Laplacian, a scalar. $\nabla V$ is a vector and can't equal a scalar.`, null],
        md`$\nabla\cdot\vb E = \nabla\cdot(-\nabla V) = -\nabla^2 V = \rho/\varepsilon_0$, so $\nabla^2V = -\rho/\varepsilon_0$. Keep the minus sign in mind: it is the rule "positive charge makes a peak in $V$" that you'll use all unit.`,
        { nofig: 'derivation' }),

      RF(md`
        ### Laplace's equation

        Start with the source-free problem. Where $\rho = 0$, Poisson's equation becomes **Laplace's equation**:

        $$\nabla^2 V = \frac{\partial^2 V}{\partial x^2}+\frac{\partial^2 V}{\partial y^2}+\frac{\partial^2 V}{\partial z^2} = 0$$

        It does **not** say there is no charge anywhere. It says there is no charge in the region you're solving in. The charges sit on the boundaries (conductor surfaces, plates) or outside the region, and they enter the problem only through the boundary conditions. That's why it's so useful.

        [[fig:region]]

        $V = 0$ always satisfies Laplace's equation. It is usually the wrong answer, because it doesn't match the boundary values. Laplace's equation has infinitely many solutions (called **harmonic functions**); the boundary conditions pick the physical one.

        !!key Poisson or Laplace?
          - Poisson, $\nabla^2V = -\rho/\varepsilon_0$: holds everywhere; $\rho$ is the charge density at that point.
          - Laplace, $\nabla^2 V = 0$: holds where $\rho = 0$, including inside the metal of a conductor (there $V$ is constant).
          - In a Laplace problem all the information sits on the boundary.
      `, { region: { svg: fRegion(), cap: md`Laplace's equation holds in the shaded region, which contains no charge. The charges outside affect $V$ inside only through the values of $V$ on the region's boundary.` } }),

      Q(md`At which marked points is $\nabla^2 V = 0$? $P_1$ is inside a uniformly charged ball, $P_2$ is in empty space, $P_3$ is inside a piece of metal, and $P_4$ is at a point charge.`,
        [md`$P_2$ only`, md`$P_2$ and $P_3$`, md`$P_1$, $P_2$ and $P_3$`, md`All four: $\nabla^2V = 0$ holds everywhere in electrostatics`], 1,
        [md`Inside the metal $\rho = 0$ too (any net charge sits on the surface), and $V$ is constant there, so $\nabla^2 V = 0$ at $P_3$ as well.`,
          null,
          md`At $P_1$ there is charge: $\nabla^2 V = -\rho_0/\varepsilon_0 \ne 0$. Laplace needs $\rho = 0$ at that point.`,
          md`Poisson's equation holds everywhere; Laplace's only where $\rho = 0$. At $P_1$ and $P_4$ there is charge.`],
        md`Laplace's equation is Poisson's with $\rho = 0$, so check $\rho$ at each point. Empty space ($P_2$): $\rho = 0$. Inside a conductor ($P_3$): $\rho = 0$, and $V$ is constant, so all its derivatives vanish. Inside the charged ball ($P_1$): $\nabla^2V = -\rho_0/\varepsilon_0$. At a point charge ($P_4$): $\rho$ is a delta function, and so is $\nabla^2 V$.`,
        { figHtml: fPoints() }),

      Q(md`Two large parallel plates: the bottom one is grounded and the top one is held at $V_0$. The space between has no charge. $V = 0$ satisfies Laplace's equation there. Why is it not the answer?`,
        [md`It violates the boundary condition $V = V_0$ on the top plate.`, md`$V = 0$ does not satisfy Laplace's equation.`, md`Laplace's equation doesn't hold between the plates, because the plates are charged.`, md`It is the answer: the field between the plates really is zero.`], 0,
        [null,
          md`$\nabla^2 0 = 0$, so it does. It solves the equation; it just doesn't solve this problem.`,
          md`The charge is on the plates, which are the boundary. Between them $\rho = 0$, so Laplace holds there.`,
          md`A constant $V$ would have to equal $0$ and $V_0$ at once. The field between the plates is $V_0/d$, as in Unit 3.`],
        md`Laplace's equation has many solutions; the boundary values select one. Here $V = V_0\,z/d$ ($z$ measured up from the bottom plate) satisfies $\nabla^2 V = 0$ and both plate values, and Lesson 4 shows that this makes it the only answer.`,
        { figHtml: fPlatesH() }),

      Q(md`In some region $V(x,y,z) = C\,(x^2 + y^2 - 2z^2)$, with $C$ a constant. What is the charge density there?`,
        [md`$\rho = 0$`, md`$\rho = -2\varepsilon_0 C$`, md`$\rho = 8\varepsilon_0 C$`, md`$\rho = -6\varepsilon_0 C$`], 0,
        [null,
          md`That's $-\varepsilon_0$ times one term. Add all three second derivatives: $2C + 2C - 4C$.`,
          md`$8$ comes from adding the magnitudes $2+2+4$. The $z$ term enters with its minus sign.`,
          md`$-6\varepsilon_0 C$ is right for $C(x^2+y^2+z^2)$, where all three second derivatives are $+2C$. Here the $z$ one is $-4C$.`],
        md`$\nabla^2 V = 2C + 2C - 4C = 0$, so $\rho = -\varepsilon_0\nabla^2V = 0$. This $V$ is harmonic: the potential in an empty region produced by charges somewhere outside it.`,
        { nofig: 'formula only' }),

      Q(md`A point charge $q$ sits inside a closed metal box whose walls are grounded. You want $V$ inside. In the lecture's terms, what are the boundary conditions, and what is the source?`,
        [md`Source: none, since the box is empty except for one point. Boundary: $V = 0$ on the walls.`, md`Source: the charge induced on the walls. Boundary: $V = 0$ on the walls.`, md`Source: $q$. Boundary: $V\to 0$ at infinity.`, md`Source: $q$, the only charge in the region. Boundary: $V = 0$ on every wall.`], 3,
        [md`A point charge is a source: $\nabla^2V = -\rho/\varepsilon_0$ with $\rho$ a delta function at $q$. Without it the answer would be $V = 0$.`,
          md`The induced charge is on the walls, the boundary of the region. The condition $V = 0$ there accounts for it; you never need it in advance.`,
          md`Infinity is outside the box. The region ends at the walls, where $V = 0$.`, null],
        md`The region is the inside of the box. The only charge in it is $q$, so Poisson's equation has $q$ as its source. The walls are the boundary, and grounded means $V = 0$ there. The induced charge on the walls is unknown, but you don't need it: the boundary condition replaces it. (Afterwards you can get it from $\sigma = -\varepsilon_0\,\partial V/\partial n$.)`,
        { figHtml: fBoxQ() }),

      Q(md`In which of these boxes is $V = 0$ everywhere inside the correct answer? (Labels give each wall's potential.)`,
        [md`A and D`, md`A only`, md`A and C`, md`A, B and C`], 1,
        [md`In D every wall is at $V_0$, so $V = V_0$ inside, not $0$.`, null,
          md`In C the charge is a source; $V = 0$ fails Poisson's equation at the charge.`,
          md`In B one wall is at $V_0$, so $V = 0$ fails that boundary condition. In C, the charge is a source.`],
        md`$V = 0$ needs both: no source in the region and $V = 0$ on every wall. Only A has both. (D is the same idea with a constant: $V = V_0$ fits Laplace's equation and every wall value.)`,
        { figHtml: fFourBoxes() }),

      RF(md`
        !!intuition What the Laplacian measures
          Average $V$ over a small sphere of radius $a$ around a point. A Taylor expansion gives

          $$\langle V\rangle_{\text{sphere}} = V(\text{center}) + \frac{a^2}{6}\,\nabla^2 V + \dots$$

          So $\nabla^2 V$ compares a point with the average of its surroundings. With Poisson's equation:

          - $\rho > 0$ gives $\nabla^2 V < 0$: the point sits **above** its surroundings. Positive charge makes peaks in $V$.
          - $\rho < 0$: the point sits **below** its surroundings, a dip.
          - $\rho = 0$: the point equals the average of its surroundings. No peaks and no dips. The rest of this unit is this one line worked out.
      `),

      Q(md`The figure shows equipotentials near a point $P$: closed loops around $P$, with $V$ falling as you move away. What can you conclude about the charge density near $P$?`,
        [md`$\rho = 0$ there; equipotentials say nothing about charge.`, md`$\rho < 0$ near $P$.`, md`$\rho > 0$ near $P$.`, md`Nothing; it depends on the boundary conditions.`], 2,
        [md`A local maximum of $V$ is impossible where $\rho = 0$, since there $V$ equals the average of its surroundings. So there must be charge.`,
          md`Negative charge pulls $V$ below its surroundings (a dip). Here $P$ is a peak.`, null,
          md`The local shape of $V$ fixes $\nabla^2 V$, and Poisson's equation then fixes $\rho$ at that spot, whatever the boundaries are.`],
        md`$V$ at $P$ is higher than all around it, so the average of $V$ over a small sphere around $P$ is below $V(P)$: $\nabla^2 V < 0$. Poisson: $\rho = -\varepsilon_0\nabla^2 V > 0$. Positive charge makes a peak of potential, like the $1/r$ spike of a point charge.`,
        { figHtml: fPeak() }),

      Q(md`At a point $P$, $V(P) = 20.000$ V, and the average of $V$ over a tiny sphere centered on $P$ is $20.003$ V. What is the sign of $\rho$ at $P$?`,
        [md`Positive`, md`Zero`, md`You can't tell without knowing $\vb E$`, md`Negative`], 3,
        [md`If $\rho > 0$, $P$ would sit above its surroundings, and the average would be less than $V(P)$.`,
          md`If $\rho = 0$, the average would equal $V(P)$ exactly.`,
          md`The difference (average minus center) is $\tfrac{a^2}{6}\nabla^2V$, which fixes the sign of $\nabla^2 V$ and so of $\rho$. You don't need $\vb E$.`, null],
        md`$\langle V\rangle - V(P) = \tfrac{a^2}{6}\nabla^2V > 0$, so $\nabla^2 V > 0$ and $\rho = -\varepsilon_0\nabla^2V < 0$. $P$ sits in a dip of potential, the signature of negative charge.`,
        { figHtml: fTiny() }),

      Q(md`Inside a uniformly charged ball (density $\rho_0$, radius $R$), $V(r) = \dfrac{\rho_0}{6\varepsilon_0}\left(3R^2 - r^2\right)$. With the spherical Laplacian $\nabla^2 V = \dfrac{1}{r^2}\dfrac{d}{dr}\!\left(r^2\dfrac{dV}{dr}\right)$, what is $\nabla^2 V$ inside?`,
        [md`$0$`, md`$-\rho_0/\varepsilon_0$`, md`$-\rho_0/(3\varepsilon_0)$`, md`$+\rho_0/\varepsilon_0$`], 1,
        [md`Zero would mean no charge, but the point is inside the charged ball.`, null,
          md`That's $\dfrac1r\dfrac{dV}{dr}$. Finish the job: $\dfrac{1}{r^2}\dfrac{d}{dr}\left(-\dfrac{\rho_0 r^3}{3\varepsilon_0}\right) = -\dfrac{\rho_0}{\varepsilon_0}$.`,
          md`Sign. $V$ falls from the center outward (a peak), so $\nabla^2 V < 0$, as Poisson's equation needs for $\rho_0 > 0$.`],
        md`$\dfrac{dV}{dr} = -\dfrac{\rho_0 r}{3\varepsilon_0}$, so $r^2\dfrac{dV}{dr} = -\dfrac{\rho_0 r^3}{3\varepsilon_0}$, and $\dfrac{1}{r^2}\dfrac{d}{dr}\left(-\dfrac{\rho_0 r^3}{3\varepsilon_0}\right) = -\dfrac{\rho_0}{\varepsilon_0}$. Poisson's equation, with exactly the charge that's there.`,
        { figHtml: fBall() }),

      Q(md`Outside the same ball, $V(r) = \dfrac{\rho_0 R^3}{3\varepsilon_0 r}$. What is $\nabla^2 V$ for $r > R$?`,
        [md`$-\rho_0/\varepsilon_0$, the same as inside`, md`$-\dfrac{\rho_0R^3}{3\varepsilon_0 r^3}$`, md`$0$`, md`Undefined, because $1/r$ blows up at $r = 0$`], 2,
        [md`Outside the ball $\rho = 0$; all the charge is in $r < R$.`,
          md`That's $V/r^2$, not the Laplacian. Here $r^2\,dV/dr$ is a constant, so its derivative is zero.`, null,
          md`The blow-up is at $r = 0$, which is not in the region $r > R$. (Inside, the other formula applies and is finite.)`],
        md`$r^2 \dfrac{dV}{dr} = -\dfrac{\rho_0R^3}{3\varepsilon_0}$, a constant, so $\nabla^2 V = 0$. $1/r$ is harmonic away from the origin. Outside the ball you have a Laplace region; its only memory of the ball is the boundary value at $r = R$ (plus $V\to 0$ far away).`,
        { figHtml: fBall() }),

      RF(md`
        ### Worked example: read the charge off a potential

        A long cylinder of radius $a$ has the potential
        $$V(s) = -\frac{\rho_0}{4\varepsilon_0}\,s^2 \;\;(s<a), \qquad V(s) = -\frac{\rho_0 a^2}{2\varepsilon_0}\ln\frac{s}{a} - \frac{\rho_0a^2}{4\varepsilon_0}\;\;(s>a).$$
        Where is the charge, and how much is there?

        [[fig:cyl]]

        Use the cylindrical Laplacian from the formula sheet; only $s$ appears, so $\nabla^2 V = \dfrac1s\dfrac{d}{ds}\left(s\dfrac{dV}{ds}\right)$.

        - Inside: $\dfrac{dV}{ds} = -\dfrac{\rho_0 s}{2\varepsilon_0}$, so $s\dfrac{dV}{ds} = -\dfrac{\rho_0 s^2}{2\varepsilon_0}$ and $\nabla^2 V = \dfrac1s\left(-\dfrac{\rho_0 s}{\varepsilon_0}\right) = -\dfrac{\rho_0}{\varepsilon_0}$. Poisson gives $\rho = \rho_0$: uniform charge.
        - Outside: $s\dfrac{dV}{ds} = -\dfrac{\rho_0a^2}{2\varepsilon_0}$, a constant, so $\nabla^2 V = 0$: no charge. $\ln s$ is harmonic for $s>0$.
        - At $s = a$ both formulas give $-\rho_0a^2/(4\varepsilon_0)$, and both slopes are $-\rho_0 a/(2\varepsilon_0)$. No jump in $\partial V/\partial s$ means no surface charge at $s = a$.

        Check with Gauss's law: outside, $E_s = -\dfrac{dV}{ds} = \dfrac{\rho_0 a^2}{2\varepsilon_0 s}$, which is $\dfrac{\lambda}{2\pi\varepsilon_0 s}$ with $\lambda = \rho_0\pi a^2$, the charge per unit length.

        !!method Poisson's equation run backwards
          To check a proposed $V$, compute $\nabla^2V$ region by region. Wherever it isn't zero there is charge, $\rho = -\varepsilon_0\nabla^2 V$. A jump in the normal derivative across a surface means surface charge there.
      `, { cyl: { svg: fCyl(), cap: md`A long cylinder of radius $a$; the potential is given inside and outside.` } }),

      P({
        id: 'u4-p-r3', title: 'A potential that grows like r cubed',
        q: md`Inside a ball of radius $R$ the potential is $V(r) = V_0 - k r^3$, where $V_0$ and $k>0$ are constants. Find the charge density $\rho(r)$ inside, and the total charge inside the ball.`,
        figHtml: fBall({ lab: '\\rho(r)', r: true }),
        hints: [
          md`This is Poisson's equation run backwards: $\rho = -\varepsilon_0\nabla^2V$. $V$ depends only on $r$, so use the radial part of the spherical Laplacian (formula sheet).`,
          md`$\nabla^2 V = \dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{dV}{dr}\right)$ with $\dfrac{dV}{dr} = -3kr^2$.`,
          md`For the total charge, integrate $\rho\,4\pi r^2\,dr$ from $0$ to $R$, or use Gauss's law with $E_r = -dV/dr$ at $r = R$. They must agree.`,
        ],
        parts: [
          { lbl: md`\rho(r)`, expr: '12*eps0*k*r', vars: { eps0: [0.5, 2], k: [0.5, 3], r: [0.2, 2] } },
          { lbl: md`Q_{\text{inside}}`, expr: '12*pi*eps0*k*R^4', vars: { eps0: [0.5, 2], k: [0.5, 3], R: [0.5, 2] } },
          { lbl: md`Where inside the ball is the charge density largest?`, mc: [md`At the center`, md`Nowhere: it is uniform`, md`It is zero: $V_0$ is just a constant`, md`At the surface, $r = R$`], a: 3,
            why: [md`At the center $\rho = 12\varepsilon_0 k\cdot 0 = 0$.`, md`Uniform $\rho$ needs $V\propto r^2$ (as inside the uniformly charged ball). An $r^3$ potential gives $\rho\propto r$.`, md`$V_0$ is a constant, but $-kr^3$ isn't; its Laplacian is $-12kr\ne0$.`, null] },
        ],
        sol: md`
          Not a boundary-value problem: $V$ is given, and Poisson's equation is used backwards to find its source.

          $\dfrac{dV}{dr} = -3kr^2$, so $r^2\dfrac{dV}{dr} = -3kr^4$ and

          $$\nabla^2V = \frac{1}{r^2}\frac{d}{dr}\left(-3kr^4\right) = -12kr.$$

          Poisson: $\rho = -\varepsilon_0\nabla^2V = 12\varepsilon_0 k\,r$. It grows linearly, from zero at the center to $12\varepsilon_0 kR$ at the surface.

          Total charge:

          $$Q = \int_0^R 12\varepsilon_0 k r\cdot 4\pi r^2\,dr = 48\pi\varepsilon_0 k\,\frac{R^4}{4} = 12\pi\varepsilon_0 k R^4.$$

          Check with Gauss's law: $E_r = -dV/dr = 3kr^2$, so the flux through the surface is $3kR^2\cdot 4\pi R^2 = 12\pi kR^4 = Q/\varepsilon_0$. Same answer.

          **What to remember.** The constant $V_0$ drops out: adding a constant to $V$ never changes $\rho$ or $\vb E$. $V\propto r^2$ means uniform charge; steeper powers mean charge concentrated toward the outside.
        `,
      }),

      RF(md`
        ### One dimension

        If $V$ depends only on $x$, Laplace's equation is an ordinary differential equation:

        $$\frac{d^2V}{dx^2} = 0 \quad\Longrightarrow\quad V(x) = ax + b.$$

        A straight line with two constants, so you need **two boundary conditions**. For instance $V = 4$ at $x = 1$ and $V = 0$ at $x = 5$ give $a = -1$, $b = 5$: $V = 5 - x$ (Griffiths Fig. 3.1).

        [[fig:line]]

        Two properties look trivial here, but they are the ones that carry over to 2-D and 3-D:

        1. **$V$ is the average of its neighbours:** $V(x) = \tfrac12\left[V(x+a) + V(x-a)\right]$ for every $a$. Laplace's equation is an instruction to make each point the average of the points on either side.
        2. **No local maxima or minima.** The extreme values are at the ends. If $V$ had a dip at some $x$, $V(x)$ would be below the average of the values on either side.

        [[fig:dip]]

        (A zero second derivative at one point doesn't rule out an extremum: $x^4$ has a minimum at $0$. The averaging property, true at every point and for every $a$, does.)
      `, {
        line: { svg: fLine(), cap: md`$V = 4$ at $x=1$ and $V = 0$ at $x = 5$, no charge between: a straight line.` },
        dip: { svg: fDip(), cap: md`The lecture's sketch of a local minimum. The bottom is lower than the average of the two dots on either side, so it can't satisfy the averaging rule.` },
      }),

      Q(md`Two large plates: $V = 6$ V at $x = 0$ and $V = -2$ V at $x = 4$ m, with no charge between them. What is $V$ at $x = 1$ m?`,
        [md`$4$ V`, md`$2$ V`, md`$5$ V`, md`$8$ V`], 0,
        [null, md`$2$ V is the midpoint value, $V(2\text{ m})$. At $x = 1$ m you're only a quarter of the way across.`,
          md`The slope is $(-2-6)/4 = -2$ V/m, not $-1$ V/m: the drop is $8$ V over $4$ m.`,
          md`Wrong sign of the slope. $V$ goes from $+6$ down to $-2$, so it decreases.`],
        md`$V(x) = ax + b$. $V(0) = 6$ V gives $b = 6$ V; $V(4\text{ m}) = 4a + 6 = -2$ gives $a = -2$ V/m. So $V(1\text{ m}) = 4$ V. Check with averaging: $V(2) = \tfrac12[V(0) + V(4)] = 2$ V, then $V(1) = \tfrac12[V(0)+V(2)] = 4$ V.`,
        { figHtml: fPlates1D({ la: '6\\text{ V}', lb: '-2\\text{ V}', ticks: [[50, '0'], [250, '4\\text{ m}']], probe: 100 }) }),

      Q(md`Which of these graphs could be $V(x)$ in a charge-free 1-D region?`,
        [md`A and B`, md`A and D`, md`A only`, md`All four, with suitable boundary values`], 2,
        [md`B curves: $V'' < 0$ throughout, which means positive charge in the region (as in a charged slab).`,
          md`D curves up on one side and down on the other: $V''\ne 0$ almost everywhere, so there's charge of both signs.`, null,
          md`Boundary values only choose $a$ and $b$ in $V = ax+b$. Every charge-free solution is a straight line.`],
        md`In 1-D, $V'' = 0$ means a straight line, full stop. B: $V'' < 0$ (positive charge). C: the corner is a jump in $dV/dx$, a sheet of charge at the corner (negative here, since $V$ has a minimum there). D: $V''$ changes sign (charge of both signs). Only A has no charge anywhere.`,
        { figHtml: fFourCurves() }),

      RF(md`
        ### Which pairs of conditions work?

        $V = ax+b$ has two unknowns, so you need two pieces of information, but not just any two (Griffiths 3.1.5):

        | Given | Determines $V$? |
        |---|---|
        | $V$ at both ends | yes |
        | $V$ and $dV/dx$ at the same end | yes |
        | $V$ at one end, $dV/dx$ at the other | yes |
        | $dV/dx$ at both ends | no: redundant if they're equal ($b$ stays free), impossible if not |
        | a single value | no |

        Derivative conditions fix the slope $a$ and never the offset $b$. Remember this: in 3-D, giving only $\partial V/\partial n$ on every boundary fixes $\vb E$ but leaves $V$ free up to a constant (Lesson 4).
      `),

      Q(md`The region $0 < x < L$ between two large plates is charge-free, and $V$ depends only on $x$. Which pair of conditions does **not** determine $V(x)$?`,
        [md`$V(0)$ and $V(L)$`, md`$V(0)$ and $dV/dx$ at $x = 0$`, md`$V(L)$ and $dV/dx$ at $x = 0$`, md`$dV/dx$ at $x=0$ and $dV/dx$ at $x = L$`], 3,
        [md`Two values fix the line through two points.`, md`A value and a slope at the same point fix a line (point-slope form).`,
          md`The slope fixes $a$; then $V(L) = aL + b$ fixes $b$.`, null],
        md`$V = ax+b$. Slopes fix $a$, and nothing fixes $b$. Slopes at both ends either repeat the same information (if equal: $V$ known only up to a constant) or contradict each other (if not: no solution). Physically $dV/dx = -E_x$, and knowing $\vb E$ never pins down the zero of potential.`,
        { figHtml: fPlates1D({ mid: 'no charge' }) }),

      Q(md`Same plates. You're told $dV/dx = -3$ V/m at both $x = 0$ and $x = L$. What does that tell you?`,
        [md`$V(x) = -3x$ exactly`, md`Nothing; the conditions are inconsistent`, md`$\vb E$ everywhere ($E_x = 3$ V/m), but $V$ only up to an additive constant`, md`$V$, but not $\vb E$`], 2,
        [md`$V = -3x + b$ fits for every $b$. You've assumed $b = 0$ without being told.`,
          md`They'd be inconsistent if the two slopes differed. Equal slopes are consistent but redundant.`, null,
          md`It's the other way round: the slope is $-E_x$, so $\vb E$ is what you know.`],
        md`Either condition gives $a = -3$ V/m; $b$ is free. $E_x = -dV/dx = 3$ V/m everywhere. Derivative data fixes the field, not the zero of potential.`,
        { figHtml: fPlates1D({ mid: 'no charge' }) }),

      P({
        id: 'u4-p-1d', title: 'A straight-line potential',
        q: md`The region between two large parallel plates is charge-free. The plates are at $x = 2$ cm, where $V = 10$ V, and $x = 6$ cm, where $V = -2$ V. Find $V$ at $x = 3$ cm, the field $E_x$ between the plates, and the position where $V = 0$.`,
        figHtml: fPlates1D({ la: '10\\text{ V}', lb: '-2\\text{ V}', ticks: [[50, '2\\text{ cm}'], [250, '6\\text{ cm}']], probe: 100 }),
        hints: [
          md`No charge and only $x$-dependence: 1-D Laplace, so $V = ax + b$. Write down the two boundary conditions first.`,
          md`The slope is $a = \dfrac{-2 - 10}{6 - 2}$ V/cm. Then $E_x = -dV/dx = -a$; convert V/cm to V/m.`,
          md`Set $V = 0$ in $V = 10 + a(x - 2)$.`,
        ],
        parts: [
          { lbl: md`V(3\text{ cm})`, ans: 7, unit: 'V' },
          { lbl: md`E_x`, ans: 300, unit: 'V/m' },
          { lbl: md`x \text{ where } V = 0`, ans: 5.333, unit: 'cm' },
        ],
        sol: md`
          **Boundary conditions.**
          1. $V = 10$ V at $x = 2$ cm (left plate).
          2. $V = -2$ V at $x = 6$ cm (right plate).

          No charge between, so $V'' = 0$ and $V = ax+b$. The slope is $a = \dfrac{-2-10}{6-2} = -3$ V/cm, and $V = 10 - 3(x - 2)$ with $x$ in cm.

          - $V(3\text{ cm}) = 10 - 3 = 7$ V.
          - $E_x = -dV/dx = +3$ V/cm $= 300$ V/m. It points in $+x$, from high potential to low.
          - $V = 0$ when $x - 2 = 10/3$, so $x = 5.33$ cm.

          **Check.** The midpoint $x = 4$ cm should be the average of the ends: $10 - 6 = 4$ V $= \tfrac12(10 + (-2))$. It is.
        `,
      }),

      Q(md`Now fill the space between two grounded plates with uniform positive charge density $\rho$. Where is $V$ largest?`,
        [md`At either plate, because extremes of $V$ are always on the boundary`, md`In the middle, $x = d/2$`, md`Nowhere in particular: $V$ is constant between the plates`, md`Nowhere: $V$ is a straight line, so it has no maximum between the plates`], 1,
        [md`"No interior extrema" belongs to Laplace's equation. Here there is charge between the plates, so Poisson's equation holds and an interior peak is allowed (in fact required).`, null,
          md`A constant $V$ would make $\nabla^2V = 0$, but $V'' = -\rho/\varepsilon_0 \ne 0$ here.`,
          md`Straight lines solve $V'' = 0$. With charge, $V'' = -\rho/\varepsilon_0$ makes $V$ a downward parabola.`],
        md`$V'' = -\rho/\varepsilon_0 < 0$: $V$ is a downward parabola, zero at both plates, so it peaks in the middle. Positive charge makes a peak. The full solution is the next problem.`,
        { figHtml: fPlates1D({ la: 'V=0', lb: 'V=0', slab: '\\rho', ticks: [[50, '0'], [250, 'd']] }) }),

      P({
        id: 'u4-p-slab', title: 'Charged slab between grounded plates',
        q: md`Two large grounded plates sit at $x = 0$ and $x = d$. The space between them is filled with uniform charge density $\rho$ (no other charge). Find $V(x)$ between the plates, the maximum potential, and $E_x$ at the plate $x = 0$.`,
        figHtml: fPlates1D({ la: 'V=0', lb: 'V=0', slab: '\\rho', ticks: [[50, '0'], [250, 'd']] }),
        hints: [
          md`$V$ depends only on $x$ (the plates are large), and there is charge in the region, so this is 1-D **Poisson**: $\dfrac{d^2V}{dx^2} = -\dfrac{\rho}{\varepsilon_0}$. List the boundary conditions.`,
          md`Integrate twice: $V = -\dfrac{\rho}{2\varepsilon_0}x^2 + ax + b$. Apply $V(0) = 0$ and $V(d) = 0$.`,
          md`$b = 0$ and $a = \dfrac{\rho d}{2\varepsilon_0}$. The peak is at $x = d/2$ by symmetry; $E_x = -dV/dx$.`,
        ],
        parts: [
          { lbl: md`V(x)`, expr: 'rho*x*(d-x)/(2*eps0)', vars: { rho: [0.5, 2], eps0: [0.5, 2], x: [0.1, 0.9], d: [1, 2] }, accepts: ['(rho/(2*eps0))*(d*x - x^2)'] },
          { lbl: md`V_{\max}`, expr: 'rho*d^2/(8*eps0)', vars: { rho: [0.5, 2], eps0: [0.5, 2], d: [0.5, 2] } },
          { lbl: md`E_x(0)`, expr: '-rho*d/(2*eps0)', vars: { rho: [0.5, 2], eps0: [0.5, 2], d: [0.5, 2] } },
        ],
        sol: md`
          **Boundary conditions.**
          1. $V(0) = 0$ (grounded plate).
          2. $V(d) = 0$ (grounded plate).

          **Equation.** Large plates, so $V = V(x)$; charge in the region, so Poisson: $V'' = -\rho/\varepsilon_0$.

          **Integrate twice.** $V' = -\dfrac{\rho}{\varepsilon_0}x + a$, and $V = -\dfrac{\rho}{2\varepsilon_0}x^2 + ax + b$.

          **Apply the conditions.** $V(0) = 0$ gives $b = 0$. $V(d) = 0$ gives $-\dfrac{\rho d^2}{2\varepsilon_0} + ad = 0$, so $a = \dfrac{\rho d}{2\varepsilon_0}$:

          $$V(x) = \frac{\rho}{2\varepsilon_0}\,x\,(d - x).$$

          [[fig:vx]]

          **Maximum** at $x = d/2$: $V_{\max} = \dfrac{\rho}{2\varepsilon_0}\cdot\dfrac d2\cdot\dfrac d2 = \dfrac{\rho d^2}{8\varepsilon_0}$.

          **Field.** $E_x = -\dfrac{dV}{dx} = -\dfrac{\rho}{2\varepsilon_0}(d - 2x)$, so $E_x(0) = -\dfrac{\rho d}{2\varepsilon_0}$. It points in $-x$: out of the slab and into the plate, as it should for positive charge. By symmetry $E_x(d) = +\dfrac{\rho d}{2\varepsilon_0}$.

          **Checks.** Gauss's law on a box spanning the slab (face area $A$): the outward flux is $2A\cdot\dfrac{\rho d}{2\varepsilon_0} = \dfrac{\rho d A}{\varepsilon_0}$, which is the enclosed charge $\rho dA$ over $\varepsilon_0$. Units: $\rho d^2/\varepsilon_0$ is $(\text{C/m}^3)(\text{m}^2)/(\text{C/(V m)}) = $ V.

          **What to remember.** With charge in the region $V$ curves ($V'' = -\rho/\varepsilon_0$) and can peak inside. Without charge it's a straight line between the boundary values. Two boundary conditions fix both constants either way.
        `,
        figs: { vx: { svg: fSlabPlot(), cap: md`$V(x)$ is a downward parabola, zero on both grounded plates, with its peak $\rho d^2/8\varepsilon_0$ in the middle.` } },
      }),

      RF(md`
        !!method Patterns from this lesson
          - $\rho$ known everywhere and a simple shape: integrate. Conductors present, or $\rho$ unknown on surfaces: solve Poisson or Laplace with boundary conditions.
          - Laplace holds where $\rho = 0$, including inside metal. It doesn't mean "no charge anywhere".
          - $V = 0$ always solves the equation; the boundaries decide whether it's the answer.
          - $\nabla^2V$ compares a point with its surroundings: $\rho>0$ makes peaks, $\rho<0$ makes dips, $\rho = 0$ neither.
          - 1-D: charge-free means a straight line, fixed by two conditions, at least one of which is a value of $V$. Uniform charge means a parabola.
          - Every boundary-value solution starts by listing the boundary conditions.
      `),
    ],
  };

  // ================================================================== Lesson 2 figures
  const fSaddle = () => PF.row([
    { svg: cmapBox('saddle'), cap: '$V = x^2 - y^2$: a saddle (harmonic)' },
    { svg: cmapBox('circles'), cap: '$V = x^2 + y^2$: a bowl (not harmonic)' },
  ]).svg;
  const fMaps = () => PF.row([
    { svg: cmapBox('circles'), cap: 'A' }, { svg: cmapBox('saddle'), cap: 'B' },
    { svg: cmapBox('lines'), cap: 'C' }, { svg: cmapBox('ovals'), cap: 'D' },
  ]).svg;
  const fSquareT = () => {
    const f = PF.fig();
    const x = 60, y = 30, s = 130;
    f.rect(x, y, s, s, { cls: 'thick' });
    f.label(x + s / 2, y - 10, '60\\,^\\circ\\text{C}', 'b', 'small');
    f.label(x + s + 10, y + s / 2, '40\\,^\\circ\\text{C}', 'l', 'small');
    f.label(x + s / 2, y + s + 10, '20\\,^\\circ\\text{C}', 't', 'small');
    f.label(x - 10, y + s / 2, '30\\,^\\circ\\text{C}', 'r', 'small');
    return f.svg();
  };
  const fSquarePipe = () => {
    const f = PF.fig();
    const x = 50, y = 24, s = 130;
    f.rect(x, y, s, s, { cls: 'thick' });
    f.label(x + s / 2, y - 10, '0', 'b', 'small');
    f.label(x + s / 2, y + s + 10, '0', 't', 'small');
    f.label(x - 10, y + s / 2, '0', 'r', 'small');
    f.label(x + s + 10, y + s / 2, 'V_0(y)', 'l', 'small');
    f.arrow(x - 26, y + s + 26, x + 14, y + s + 26, { cls: 'dim', hs: 5 }); f.label(x + 18, y + s + 26, 'x', 'l', 'small accent');
    f.arrow(x - 26, y + s + 26, x - 26, y + s - 14, { cls: 'dim', hs: 5 }); f.label(x - 26, y + s - 18, 'y', 'b', 'small accent');
    return f.svg();
  };
  // circle of radius R about (cx, cy) on x-y axes; the center is marked by dashed guides to the axes
  const fCircleXY = (o) => {
    const f = PF.fig();
    const sc = o.sc, ox = 30 + sc * Math.max(0, -o.xmin), oy = 30 + sc * o.ymax;
    const X = (x) => ox + sc * x, Y = (y) => oy - sc * y;
    f.arrow(X(o.xmin), oy, X(o.xmax), oy, { cls: 'dim', hs: 6 }); f.label(X(o.xmax) + 6, oy, 'x', 'l', 'small accent');
    f.arrow(ox, Y(o.ymin), ox, Y(o.ymax), { cls: 'dim', hs: 6 }); f.label(ox, Y(o.ymax) - 6, 'y', 'b', 'small accent');
    f.circle(X(o.cx), Y(o.cy), sc * o.R);
    f.dot(X(o.cx), Y(o.cy));
    f.line(X(o.cx), Y(o.cy), X(o.cx), oy, { cls: 'dash dim thin' });
    f.line(X(o.cx), Y(o.cy), ox, Y(o.cy), { cls: 'dash dim thin' });
    f.line(X(o.cx), oy - 4, X(o.cx), oy + 4, { cls: 'dim' }); f.label(X(o.cx) + (o.tdx || 0), oy + 8, String(o.cx), 't', 'small');
    f.line(ox - 4, Y(o.cy), ox + 4, Y(o.cy), { cls: 'dim' });
    if (o.yin) f.label(ox + 6, Y(o.cy) - 6, String(o.cy), 'bl', 'small'); else f.label(ox - 8, Y(o.cy), String(o.cy), 'r', 'small');
    const ex = X(o.cx) + sc * o.R * Math.cos(40 * D2R), ey = Y(o.cy) - sc * o.R * Math.sin(40 * D2R);
    f.line(X(o.cx), Y(o.cy), ex, ey, { cls: 'dim' });
    f.tag(ex, ey, o.rlab, 'tr', 6);
    return f.svg();
  };
  const fCircle21 = () => fCircleXY({ sc: 52, xmin: 0, xmax: 3.1, ymin: 0, ymax: 1.9, cx: 2, cy: 1, R: 0.4, rlab: '0.4\\text{ m}' });
  const fCircleMC = () => fCircleXY({ sc: 20, xmin: -1.8, xmax: 6, ymin: -2.6, ymax: 4.8, cx: 2, cy: 1, R: 3, rlab: '3\\text{ m}', tdx: 8, yin: true });
  const fLecGrid = (a = 'A', b = 'B') => gridSvg([[100, 100, 100, 100], [0, a, b, 0], [0, 0, 0, 0]]);
  const fBox9 = (o = {}) => {
    const rows = [];
    for (let i = 0; i < 9; i++) {
      const r = [];
      for (let j = 0; j < 9; j++) r.push(i === 0 ? 100 : (i === 8 || j === 0 || j === 8) ? 0 : (o.c && i === 4 && j === 4 ? '?' : ''));
      rows.push(r);
    }
    return gridSvg(rows, { cw: 30, ch: 24 });
  };
  const fSpike = () => gridSvg([[0, 0, 0, 0, 0], [0, '0', '0', '0', 0], [0, '0', '1000', '0', 0], [0, '0', '0', '0', 0], [0, 0, 0, 0, 0]], { cw: 48, ch: 30 });
  const fGuess = () => PF.row([
    { svg: fLecGrid('0', '0'), cap: 'start from 0' },
    { svg: fLecGrid('50', '50'), cap: 'start from 50' },
  ]).svg;
  const fPoissonCell = () => gridSvg([['30', '40', '30'], ['20', '?', '60'], ['10', '20', '30']]);
  const fPatchA = () => gridSvg([['60', '40', '60'], ['20', '?', '20'], ['0', '0', '0']]);
  const fPatchB = () => gridSvg([['100', '80', '60'], ['40', '?', '20'], ['20', '0', '0']]);

  // ------------------------------------------------------------------ relaxation widget
  const relaxWidget = () => W(`
    <div class="w-title">Relaxation: each interior value becomes the average of its neighbours, pass after pass</div>
    <div class="w-row">
      <label>Grid <select class="rg">
        <option value="lec">Lecture 8 grid (unknowns A and B)</option>
        <option value="box">Square box: 7 x 7 interior points, top edge at 100</option>
      </select></label>
      <label>Average over <select class="rs">
        <option value="8">all 8 surrounding points (Lecture 8)</option>
        <option value="4">the 4 nearest neighbours (Griffiths)</option>
      </select></label>
    </div>
    <div class="w-row">
      <button type="button" class="btn r1">One pass</button>
      <button type="button" class="btn rr">Run until no value changes by more than 0.5</button>
      <button type="button" class="btn r0">Reset to the initial guess (all 0)</button>
    </div>
    <div class="rgrid" style="overflow-x:auto"></div>
    <div class="w-note rinfo"></div>
    <div class="w-note"><p>Values update in reading order (left to right, top to bottom), and each new value is used immediately, as in the lecture. Interior cells are tinted by value. Try the box with the 4-neighbour rule and press "Run until...": the stopping rule fires while the center is still well below its converged value.</p></div>`, (el) => {
    const $ = (s) => el.querySelector(s);
    let g = [], fx = [], pass = 0, last = null;
    const build = () => {
      const box = $('.rg').value === 'box';
      const nr = box ? 9 : 3, nc = box ? 9 : 4;
      g = []; fx = [];
      for (let i = 0; i < nr; i++) {
        g.push([]); fx.push([]);
        for (let j = 0; j < nc; j++) { g[i].push(i === 0 ? 100 : 0); fx[i].push(i === 0 || j === 0 || i === nr - 1 || j === nc - 1); }
      }
      pass = 0; last = null;
    };
    const sweep = (G) => {
      const st = +$('.rs').value;
      let mx = 0;
      for (let i = 1; i < G.length - 1; i++) for (let j = 1; j < G[0].length - 1; j++) {
        if (fx[i][j]) continue;
        let s = G[i - 1][j] + G[i + 1][j] + G[i][j - 1] + G[i][j + 1], n = 4;
        if (st === 8) { s += G[i - 1][j - 1] + G[i - 1][j + 1] + G[i + 1][j - 1] + G[i + 1][j + 1]; n = 8; }
        const v = s / n;
        mx = Math.max(mx, Math.abs(v - G[i][j]));
        G[i][j] = v;
      }
      return mx;
    };
    const converged = () => { const G = g.map((r) => r.slice()); for (let k = 0; k < 20000; k++) if (sweep(G) < 1e-11) break; return G; };
    const draw = () => {
      const box = $('.rg').value === 'box';
      const E = converged();
      let h = '<table style="border-collapse:collapse;width:auto;margin:6px auto;font-variant-numeric:tabular-nums">';
      g.forEach((row, i) => {
        h += '<tr>';
        row.forEach((v, j) => {
          const fixd = fx[i][j];
          const t = Math.max(0, Math.min(1, v / 100));
          const bg = fixd ? 'var(--raise)' : `rgba(180,4,38,${(0.06 + 0.5 * t).toFixed(3)})`;
          const tag = !box && !fixd ? `<div style="font-size:11px;color:var(--dim)">${j === 1 ? 'A' : 'B'}</div>` : '';
          h += `<td style="width:${box ? 40 : 66}px;height:${box ? 30 : 46}px;padding:0;text-align:center;vertical-align:middle;border:1px solid var(--line-2);background:${bg};${fixd ? 'color:var(--dim);' : ''}font-size:${box ? 12 : 14}px">${tag}${v.toFixed(fixd ? 0 : (box ? 1 : 3))}</td>`;
        });
        h += '</tr>';
      });
      $('.rgrid').innerHTML = h + '</table>';
      const key = box ? `center = ${g[4][4].toFixed(2)} (fully converged: ${E[4][4].toFixed(2)})`
        : `A = ${g[1][1].toFixed(4)}, B = ${g[1][2].toFixed(4)} (fully converged: ${E[1][1].toFixed(4)})`;
      $('.rinfo').innerHTML = `<p>After pass ${pass}: ${key}.${last === null ? '' : ` Largest change in the last pass: ${last.toFixed(3)}.`}</p>`;
    };
    $('.rg').addEventListener('change', () => { build(); draw(); });
    $('.rs').addEventListener('change', () => { build(); draw(); });
    $('.r1').addEventListener('click', () => { last = sweep(g); pass++; draw(); });
    $('.rr').addEventListener('click', () => { do { last = sweep(g); pass++; } while (last >= 0.5 && pass < 2000); draw(); });
    $('.r0').addEventListener('click', () => { build(); draw(); });
    build(); draw();
  });

  // ================================================================== Lesson 2
  const L2 = {
    id: 'u4-2d', title: 'Two dimensions: averaging and relaxation',
    steps: [
      RF(md`
        ### Two dimensions

        If $V$ depends on $x$ and $y$:

        $$\frac{\partial^2 V}{\partial x^2} + \frac{\partial^2 V}{\partial y^2} = 0.$$

        Now it's a partial differential equation, and the 1-D rules break. There's no general solution with a fixed number of constants. The boundary is a whole curve (an edge, a line), and you need $V$ all along it: infinitely many boundary conditions. You'll solve such problems by separation of variables in Units 6 and 7. For now, two observations from Lecture 8:

        1. **Mean value on circles.** $V$ at a point is the average of $V$ around any circle centered there, as long as there is no charge inside the circle:
        $$V(x,y) = \frac{1}{2\pi R}\oint_{\text{circle}} V\,dl.$$
        2. **No local maxima or minima** inside the region. All extremes are on the boundary. (This follows from 1, just as in 1-D.)

        The lecture's remark: look at the form of Laplace's equation. The two second derivatives must cancel. If $V$ curves up along $x$ ($\partial_x^2V>0$), it must curve down along $y$ by the same amount. A harmonic function has no bowls and no domes, only saddles.

        [[fig:saddle]]

        Griffiths' picture: stretch a rubber sheet over a frame with a wavy edge. Its height obeys (approximately) Laplace's equation. Put a ping-pong ball on it and it rolls off the edge; there's no pocket for it to settle in. The sheet is as featureless as it can be while still fitting the frame.
      `, { saddle: { svg: fSaddle(), cap: md`Equipotentials of two functions. Left: the $x$ and $y$ curvatures cancel (a saddle; the dashed lines are $V = 0$). Right: both curvatures are positive (a bowl with a minimum), so $\nabla^2V = 4\ne0$.` } }),

      Q(md`Which of these is **not** a solution of Laplace's equation in 2-D?`,
        [md`$xy$`, md`$e^{x}\sin y$`, md`$x^2 + y^2$`, md`$x^3 - 3xy^2$`], 2,
        [md`$\partial_x^2(xy) = 0$ and $\partial_y^2(xy) = 0$: harmonic. (It's $x^2-y^2$ rotated by $45°$, halved.)`,
          md`$\partial_x^2 = e^x\sin y$ and $\partial_y^2 = -e^x\sin y$: they cancel.`, null,
          md`$\partial_x^2 = 6x$ and $\partial_y^2 = -6x$: they cancel.`],
        md`$\nabla^2(x^2+y^2) = 2 + 2 = 4 \ne 0$. It curves up in both directions, a bowl with a minimum at the origin, which a harmonic function can't have.`,
        { nofig: 'testing formulas' }),

      Q(md`For which $m$ is $V = e^{kx}\cos(my)$ harmonic ($k > 0$)?`,
        [md`$m = k^2$`, md`Any $m$`, md`$m = 0$`, md`$m = \pm k$`], 3,
        [md`$\partial_x^2$ brings down $k^2$ and $\partial_y^2$ brings down $-m^2$. You need $m^2 = k^2$.`,
          md`$\nabla^2 V = (k^2 - m^2)V$, which vanishes only if $m^2 = k^2$.`,
          md`With $m = 0$, $V = e^{kx}$ and $\nabla^2V = k^2e^{kx} \ne 0$.`, null],
        md`$\nabla^2V = (k^2 - m^2)\,e^{kx}\cos(my) = 0$ requires $m = \pm k$. Exponential behaviour in one direction must be paired with oscillation at the same rate in the other. This pairing is the heart of separation of variables (Unit 6): $e^{\pm kx}\sin ky$ and $e^{\pm kx}\cos ky$.`,
        { nofig: 'testing a formula' }),

      Q(md`$f(x) = x^4$ has $f''(0) = 0$ and yet a minimum at $x = 0$. Why doesn't that break the rule that solutions of Laplace's equation have no local extrema?`,
        [md`The rule only holds in 2-D and 3-D.`, md`$x^4$ does not satisfy $f'' = 0$ near $0$: $f'' = 12x^2 > 0$ on both sides. The rule needs $f''=0$ throughout a neighbourhood.`, md`Because $x^4$ can't be a potential.`, md`The rule is only approximately true.`], 1,
        [md`It holds in 1-D too: the solutions are straight lines, which have no interior extrema.`, null,
          md`Any smooth function can be a potential, given the right charge. The question is whether it solves Laplace's equation in the region.`,
          md`It's exact. It follows from the averaging property, which harmonic functions satisfy exactly.`],
        md`Laplace's equation must hold at every point of the region, not at one point. $x^4$ has $f'' = 12x^2$, positive everywhere except at $0$. Griffiths makes the same point: a vanishing second derivative at a single point doesn't prevent an extremum, but the averaging property (true at every point, for every $a$) does.`,
        { nofig: 'about a formula' }),

      Q(md`Each map shows equipotentials in a square region. In which maps could the region be charge-free?`,
        [md`A and D`, md`B and C`, md`C only`, md`All four`], 1,
        [md`A and D have closed equipotential loops around a point, so $V$ has a maximum or minimum inside. That needs charge.`, null,
          md`B is a saddle: $V$ rises along one direction and falls along the other. That's allowed; a saddle isn't an extremum.`,
          md`Closed loops around a point (A, D) mean an interior extremum, which Laplace's equation forbids.`],
        md`In a charge-free region $V$ has no interior extremum. A closed equipotential loop with no charge inside would even force $V$ to be constant inside it (its max and min would both be on the loop), so nested loops with different values (A, D) need charge inside. C (parallel lines) is a uniform field, $V = ax + by + c$. B (hyperbolas) is a saddle, like $x^2 - y^2$: along one axis $V$ rises, along the other it falls, and the average around any circle still equals the center value.`,
        { figHtml: fMaps() }),

      Q(md`A thin square metal plate has its four edges held at $60$, $40$, $20$ and $30$ °C, and there are no heat sources inside. In steady state the temperature also obeys Laplace's equation. Where is the hottest point of the plate?`,
        [md`Near the center`, md`At the corner between the $60$ °C and $40$ °C edges`, md`At an interior point where the gradient vanishes`, md`On the $60$ °C edge`], 3,
        [md`The center is close to the average of the four edges (about $37.5$ °C), not a maximum.`,
          md`Nothing in the plate is hotter than $60$ °C, and that value is reached along the whole $60$ °C edge, not just at a corner.`,
          md`Interior points with zero gradient can exist, but they are saddles, not maxima.`, null],
        md`A harmonic function takes its extremes on the boundary. The maximum, $60$ °C, is reached along that edge; every interior point is cooler. Steady-state temperature with no sources, soap films, and electrostatic potential in a charge-free region all share this averaging property.`,
        { figHtml: fSquareT() }),

      Q(md`A long metal pipe with square cross-section: three walls are grounded and the fourth is held at a given $V_0(y)$. Inside, $V = V(x, y)$. What boundary information does Laplace's equation need?`,
        [md`Two numbers, as in 1-D`, md`One number per wall: four in all`, md`$V$ at the four corners`, md`$V$ at every point of the boundary: $V_0(y)$ on one wall and $0$ on the other three`], 3,
        [md`2-D Laplace is a PDE, not an ODE; the solution isn't $ax + b$ with two constants.`,
          md`One number per wall is enough only when each wall is at a constant potential. Here one wall varies, and you need the whole function $V_0(y)$.`,
          md`Corners are four points. The boundary is a whole curve, and $V$ must be known along all of it.`, null],
        md`In 2-D the boundary is a closed curve, and you need $V$ at every point of it: infinitely many conditions. "Three walls at $0$" are three whole lines of conditions, and the fourth wall contributes the function $V_0(y)$. Units 6 and 7 turn data like this into a solution by matching a Fourier series to $V_0(y)$.`,
        { figHtml: fSquarePipe() }),

      Q(md`In a charge-free region $V(x,y) = x^2 - y^2 + 4$ (volts, with $x$ and $y$ in meters). What is the average of $V$ around the circle of radius $3$ m centered at $(2, 1)$?`,
        [md`$7$ V`, md`$16$ V`, md`$4$ V`, md`$11.5$ V`], 0,
        [null, md`A $+R^2$ appears in the circle average of $x^2 + y^2$, which is not harmonic. For $x^2 - y^2$ the $R^2$ pieces from $x^2$ and $y^2$ cancel.`,
          md`$x^2$ and $y^2$ don't average to zero around a circle that isn't centered at the origin; it's the combination that reproduces the center value.`,
          md`You kept the $+R^2/2$ from averaging $x^2$ but not the matching $-R^2/2$ from $-y^2$.`],
        md`$V$ is harmonic ($\nabla^2 V = 2 - 2 = 0$) and the disk has no charge, so the circle average is the center value: $V(2,1) = 4 - 1 + 4 = 7$ V. Directly: around the circle $\langle x^2\rangle = x_0^2 + R^2/2$ and $\langle y^2 \rangle = y_0^2 + R^2/2$, so $\langle x^2 - y^2\rangle = x_0^2 - y_0^2$.`,
        { figHtml: fCircleMC() }),

      P({
        id: 'u4-p-2dmean', title: 'Harmonic or not, and circle averages',
        q: md`(a) For which constant $c$ is $V = 2x^3 + c\,xy^2$ harmonic in 2-D?

        (b) In a charge-free region $V(x,y) = 3x^2 - 3y^2 + 2xy + 5$ (volts, meters). Find the average of $V$ around the circle of radius $0.4$ m centered at $(2, 1)$.

        (c) Now take $W(x,y) = x^2 + y^2$, which is not harmonic. Find its average around the same circle.`,
        figHtml: fCircle21(),
        hints: [
          md`(a) Add the second derivatives: $\partial_x^2$ and $\partial_y^2$ of each term, and set the sum to zero for all $x$.`,
          md`(b) Check that $V$ is harmonic. If it is, you don't need to integrate: the mean value property gives the average.`,
          md`(c) No shortcut for a non-harmonic function. Write $x = 2 + 0.4\cos\phi$, $y = 1 + 0.4\sin\phi$ and average over $\phi$; $\langle\cos\phi\rangle = 0$ and $\langle\cos^2\phi\rangle = \tfrac12$.`,
        ],
        parts: [
          { lbl: md`c`, ans: -6 },
          { lbl: md`\langle V\rangle`, ans: 18, unit: 'V' },
          { lbl: md`\langle W\rangle`, ans: 5.16 },
        ],
        sol: md`
          Not a boundary-value problem: the functions are given, and you only test and average them.

          **(a)** $\nabla^2(2x^3 + c\,xy^2) = 12x + 2c\,x$. This vanishes for all $x$ only if $c = -6$.

          **(b)** $\nabla^2 V = 6 - 6 + 0 = 0$: harmonic, and the disk is charge-free. So the circle average is the center value:
          $$\langle V\rangle = V(2,1) = 12 - 3 + 4 + 5 = 18\text{ V}.$$

          **(c)** With $x = 2 + 0.4\cos\phi$, $y = 1 + 0.4\sin\phi$:
          $$\langle x^2\rangle = 4 + 0.16\cdot\tfrac12,\qquad \langle y^2\rangle = 1 + 0.16\cdot\tfrac12,\qquad \langle W\rangle = 5 + 0.16 = 5.16.$$
          The center value is $W(2,1) = 5$. The circle average is higher by $\tfrac{R^2}{4}\nabla^2 W = \tfrac{0.16}{4}\cdot 4 = 0.16$: the 2-D version of "average minus center $\propto\nabla^2$". The center sits in a dip, as it would at negative charge.

          **What to remember.** For a harmonic function, circle (or sphere) averages are free: evaluate at the center. Any mismatch between average and center value measures $\nabla^2$, which is charge.
        `,
      }),

      RF(md`
        ### Relaxation: Laplace as averaging, done by a computer

        The averaging property turns into an algorithm. Lecture 8: "this is how a computer solves Laplace's equation."

        1. Lay a grid over the region and fix $V$ at the boundary points.
        2. Guess the interior values (zeros will do).
        3. Sweep through the interior, replacing each value by the average of its neighbours.
        4. Repeat until the numbers stop changing ("relax").

        ### The lecture's example

        Top row held at $100$; the ends of the middle row and the whole bottom row at $0$. Two unknowns, $A$ and $B$. Initial guess $A_0 = B_0 = 0$.

        [[fig:grid]]

        The lecture replaces each unknown by the average of **all 8 surrounding points** (diagonals included), and uses each new value as soon as it's computed:

        $$A_1 = \tfrac18\,(100+100+100+0+B_0+0+0+0) = \tfrac{300}{8} = 37.5$$

        $$B_1 = \tfrac18\,(100+100+100+A_1+0+0+0+0) = \tfrac{337.5}{8} = 42.1875$$

        $$A_2 = \tfrac18\,(300 + B_1) = 42.77,\qquad B_2 = \tfrac18\,(300 + A_2) = 42.85$$

        (The notes write $A_2 = 42.75$, a rounding slip: $342.1875/8 = 42.77$.) The values settle where $A = \tfrac18(300 + B)$ and $B = \tfrac18(300+A)$ hold together: $A = B = 300/7 \approx 42.86$. Two passes already get within $0.1$.
      `, { grid: { svg: fLecGrid(), cap: md`Lecture 8's grid. Shaded cells are fixed boundary values; $A$ and $B$ are the unknowns.` } }),

      RF(md`
        ### Which neighbours?

        Griffiths (and most codes) average only the **4 nearest neighbours**: up, down, left, right. Same grid, same start:

        $$A_1 = \tfrac14\,(100 + 0 + B_0 + 0) = 25,\qquad B_1 = \tfrac14\,(100 + A_1 + 0 + 0) = 31.25$$

        | pass | $A$, 8 neighbours | $B$, 8 neighbours | $A$, 4 neighbours | $B$, 4 neighbours |
        |---|---|---|---|---|
        | 0 | 0 | 0 | 0 | 0 |
        | 1 | 37.5 | 42.19 | 25 | 31.25 |
        | 2 | 42.77 | 42.85 | 32.81 | 33.20 |
        | 3 | 42.856 | 42.857 | 33.30 | 33.33 |
        | converged | 42.86 | 42.86 | 33.33 | 33.33 |

        The two rules converge to different numbers, $300/7$ and $100/3$. Neither is the exact continuum potential at $A$'s location, which is about $34.3$: a grid with two interior points is very coarse. Both rules are legitimate discrete versions of $\nabla^2V = 0$, and both approach $34.3$ as the grid is refined.

        !!trap Read the stencil
          "The average of the neighbours" can mean 4 or 8 points. The lecture used 8 (diagonals included); Griffiths uses the 4 nearest. Same grid, different numbers. Use the rule a problem states, and say which one you use.

        In the widget below you can run both rules on the lecture's grid and on a bigger box.
      `),

      relaxWidget(),

      Q(md`One relaxation update of the center cell using the **4 nearest neighbours**. What is its new value?`,
        [md`$25$`, md`$22.2$`, md`$20$`, md`$80$`], 2,
        [md`$25$ is the 8-point average (diagonals included), the lecture's rule. This question asks for the 4 nearest: up, down, left, right.`,
          md`$200/9$ averages all nine cells, including the center's old value. The update uses only the neighbours.`, null,
          md`$80$ is the sum of the four neighbours. Divide by $4$.`],
        md`Nearest neighbours: up $40$, left $20$, right $20$, down $0$. Average $= 80/4 = 20$. (With the lecture's 8-point rule you'd add the corners $60, 60, 0, 0$: $200/8 = 25$.)`,
        { figHtml: fPatchA() }),

      Q(md`Now use the lecture's rule (the average of all **8** surrounding points). What is the new value of the center cell?`,
        [md`$35$`, md`$40$`, md`$35.6$`, md`$320$`], 1,
        [md`$35$ is the 4-nearest-neighbour average. The lecture's rule also includes the four corners.`, null,
          md`$320/9$ includes the center's old value $0$. Only the 8 surrounding points count.`,
          md`That's the sum. Divide by $8$.`],
        md`$\tfrac18(100 + 80 + 60 + 40 + 20 + 20 + 0 + 0) = \tfrac{320}{8} = 40$. The 4-neighbour rule would give $\tfrac14(80 + 40 + 20 + 0) = 35$.`,
        { figHtml: fPatchB() }),

      Q(md`Relaxation on the lecture's grid has converged. Could any interior value end up above $100$ or below $0$?`,
        [md`Yes, if the initial guess was above $100$`, md`Yes: overshoot near the boundary is normal`, md`No: each converged value is an average of its neighbours, so the largest value must sit on the boundary`, md`Only with the 8-point rule`], 2,
        [md`The initial guess doesn't survive; the converged values are fixed by the boundary values alone.`,
          md`Averaging never overshoots: an average lies between the smallest and largest of the values averaged.`, null,
          md`Both rules are averages, so both obey the same bound.`],
        md`Suppose the largest value sat at an interior point. It equals the average of its neighbours, so they must all equal it too. Repeat outward until you reach the boundary: the maximum is a boundary value. That's the discrete version of "no local maxima". So every converged interior value lies between $0$ and $100$.`,
        { figHtml: fLecGrid() }),

      Q(md`You run relaxation twice on the same grid with the same boundary values: once starting from zeros, once starting from $50$ in every interior cell. What happens?`,
        [md`They converge to different answers; the guess matters`, md`They converge to the same values; only the number of passes differs`, md`Starting from $50$ never converges`, md`Starting from zeros gives the exact continuum answer`], 1,
        [md`The converged values satisfy "each equals the average of its neighbours" with fixed boundary values, and that system has exactly one solution. The guess only sets where you start.`, null,
          md`Averaging pulls any guess toward the solution; the error shrinks every pass whatever it starts as.`,
          md`The grid spacing, not the guess, sets the accuracy. Zeros are just a convenient start.`],
        md`The discrete problem has a unique solution, the grid version of the uniqueness theorem (Lesson 4). A better guess needs fewer passes; it can't change where you end up.`,
        { figHtml: fGuess() }),

      Q(md`In real simulations you stop when a convergence criterion is met, e.g. "no value changed by more than $0.5$ in the last pass". Lecture 8 asks: what is a possible failure mechanism? (Picture the bigger box: top edge at $100$, other edges at $0$.)`,
        [md`The rule can fire while the values are still far from converged: on a big grid each pass changes things only a little, but many passes remain.`, md`The rule can never fire, because relaxation never converges.`, md`Relaxation always overshoots the true solution, so it stops too late.`, md`The boundary values drift during the passes.`], 0,
        [null, md`It does converge: each pass shrinks the error. The question is how fast.`,
          md`Starting from zero the values creep up toward the solution; averaging doesn't overshoot.`,
          md`Boundary values are fixed and never updated.`],
        md`A small change per pass doesn't mean a small error. On the $7\times 7$ box with the 4-neighbour rule, "largest change below $0.5$" stops after 16 passes with the center at $22.4$, while the converged value is $25$: a 10% error hidden behind a tiny per-pass change. Other failure modes: a grid too coarse to be accurate converges to the wrong numbers (like $33.3$ instead of $34.3$ above), and a badly chosen update rule can oscillate or diverge. Try it in the widget.`,
        { figHtml: fBox9() }),

      Q(md`Square grid, top edge held at $100$, the other three edges at $0$. Using the 4-neighbour rule, what does the center cell converge to?`,
        [md`$50$`, md`$33.3$`, md`$25$`, md`$12.5$`], 2,
        [md`$50$ would be halfway between top and bottom, as for two plates. Here three of the four sides are at $0$.`,
          md`$100/3$ was the lecture grid's answer, a different shape.`, null,
          md`Rotate the problem four times and add the results (see the solution): the center gets exactly a quarter.`],
        md`Superposition plus symmetry. Rotate the problem by $90°$: now the right edge is at $100$, and the rotated grid values solve it. Do all four rotations and add: every edge is at $100$, and the solution of that is $100$ everywhere. The center is the same cell in all four, so $4V_c = 100$ and $V_c = 25$. The same argument gives $V_0/4$ at the center of a continuous square. (With the 8-point rule the corner cells, which belong to two edges, spoil the symmetry slightly: the center comes out $25.6$.)`,
        { figHtml: fBox9({ c: true }) }),

      Q(md`To solve Poisson's equation instead, a code updates a cell where $\rho > 0$ (the center cell in the figure) as: new value $=$ (average of the 4 neighbours) $+$ an extra term. What sign must the extra term have?`,
        [md`Positive: the cell should sit above the average of its neighbours`, md`Negative`, md`Zero: charge only matters on the boundary`, md`It depends on the boundary values`], 0,
        [null, md`A negative term makes a dip, which is what negative charge does.`,
          md`Charge inside the region is the source term of Poisson's equation; it changes $V$ right where it sits.`,
          md`The sign is set by $\rho$ alone: $\nabla^2V = -\rho/\varepsilon_0$.`],
        md`The discrete Laplacian is $(V_{\text{up}}+V_{\text{down}}+V_{\text{left}}+V_{\text{right}} - 4V)/h^2$. Setting it equal to $-\rho/\varepsilon_0$ gives $V = \langle V\rangle_{\text{4 nb}} + \dfrac{h^2\rho}{4\varepsilon_0}$. Positive charge lifts a point above its neighbours' average, a peak, as in Lesson 1.`,
        { figHtml: fPoissonCell() }),

      Q(md`On the lecture's grid the 4-neighbour rule converges to $33.3$ at $A$, but the exact potential there is about $34.3$. How do you get closer?`,
        [md`Run more passes`, md`Use a finer grid (smaller spacing)`, md`Start from a better initial guess`, md`Use a stricter stopping rule`], 1,
        [md`It has already converged; more passes won't change $33.33$.`, null,
          md`The guess only affects how fast you converge, not where.`,
          md`Same as more passes: the discrete answer itself is off.`],
        md`Converged but wrong means discretization error, set by the grid spacing $h$. Halving $h$ again and again gives $34.02$, $34.26$, $34.32$, ..., approaching $34.34$.`,
        { figHtml: fLecGrid() }),

      Q(md`Your initial guess has one interior cell at $1000$ and every other interior cell at $0$ (the boundary is at $0$). What does one pass do to the spike?`,
        [md`It moves it one cell to the right.`, md`It doubles it.`, md`Nothing, until the boundary values reach it.`, md`It spreads it out: the spike drops sharply and its neighbours rise. The error gets smoother and smaller.`], 3,
        [md`Averaging is symmetric; it doesn't carry the spike in one direction (the sweep order only changes which neighbours update first).`,
          md`An average of values between $0$ and $1000$ can't exceed $1000$.`,
          md`Every interior cell is updated each pass; the spike's own neighbours change immediately.`, null],
        md`The spike cell is replaced by the average of its neighbours ($0$), and each neighbour, when it's updated, picks up a quarter of the spike. Averaging is smoothing: sharp errors die fastest, smooth long-wavelength errors die slowly, which is why big grids need many passes.`,
        { figHtml: fSpike() }),

      P({
        id: 'u4-p-relax4', title: 'Relaxation by hand: 4 neighbours',
        q: md`Boundary values: $80$ along the top, $40$ down the left side, $0$ on the right side and the bottom. The interior points $A, B, C, D$ start at $0$. Use the **4-nearest-neighbour** average and update in the order $A, B, C, D$, using each new value as soon as you have it (as in the lecture). Find the values after the first pass, and the converged value $A_\infty$.`,
        figHtml: gridSvg([[80, 80, 80, 80], [40, 'A', 'B', 0], [40, 'C', 'D', 0], [0, 0, 0, 0]]),
        hints: [
          md`Each update: new value $=$ (up $+$ down $+$ left $+$ right)$/4$, using the newest values available.`,
          md`$A_1 = (80 + 40 + B_0 + C_0)/4$ with $B_0 = C_0 = 0$. Then $B_1$ uses $A_1$, $C_1$ uses $A_1$, and $D_1$ uses $B_1$ and $C_1$.`,
          md`For the converged values, write the four "equals the average of its neighbours" equations and solve them together. $A - D$ and $B - C$ come out simply.`,
        ],
        parts: [
          { lbl: md`A_1`, ans: 30 }, { lbl: md`B_1`, ans: 27.5 }, { lbl: md`C_1`, ans: 17.5 }, { lbl: md`D_1`, ans: 11.25 },
          { lbl: md`A_\infty`, ans: 45 },
        ],
        sol: md`
          **Boundary conditions.**
          1. Top row: $80$.
          2. Left column: $40$.
          3. Right column and bottom row: $0$.
          (Corner cells are never used by the 4-neighbour rule.)

          **First pass**, newest values first:
          - $A_1 = \tfrac14(80 + 40 + 0 + 0) = 30$
          - $B_1 = \tfrac14(80 + A_1 + 0 + 0) = \tfrac14(110) = 27.5$
          - $C_1 = \tfrac14(A_1 + 40 + 0 + 0) = \tfrac14(70) = 17.5$
          - $D_1 = \tfrac14(B_1 + C_1 + 0 + 0) = \tfrac14(45) = 11.25$

          The second pass gives $41.25$, $33.13$, $23.13$, $14.06$, already close to the end.

          **Converged values.** Each must equal the average of its neighbours:
          $$4A = 120 + B + C,\quad 4B = 80 + A + D,\quad 4C = 40 + A + D,\quad 4D = B + C.$$
          The first and last give $4A - 4D = 120$, so $A = D + 30$. The middle two give $B - C = 10$ and $B + C = 30 + \tfrac12(A + D) = 45 + D$. Then $4D = 45 + D$, so $D = 15$, $A = 45$, $B + C = 60$, $B = 35$, $C = 25$.

          Check $A$: $\tfrac14(80 + 40 + 35 + 25) = 45$. Every converged value lies between $0$ and $80$, as the averaging property demands.
        `,
      }),

      P({
        id: 'u4-p-relax8', title: "Relaxation by hand: the lecture's rule",
        q: md`Same shape as the lecture's grid, new numbers: top row at $60$, the left end of the middle row at $20$, the right end at $0$, bottom row at $0$. Start from $A_0 = B_0 = 0$. Using the lecture's rule (the average of all **8** surrounding points, newest values first), find $A_1$, $B_1$, $A_2$, and the converged value $A_\infty$ to four significant figures.`,
        figHtml: gridSvg([[60, 60, 60, 60], [20, 'A', 'B', 0], [0, 0, 0, 0]]),
        hints: [
          md`List $A$'s 8 neighbours: three in the top row, left, right ($B$), and three in the bottom row. Do the same for $B$.`,
          md`$A = \tfrac18(200 + B)$ and $B = \tfrac18(180 + A)$.`,
          md`For $A_\infty$, solve the two equations together: substitute $B$ into the first.`,
        ],
        parts: [
          { lbl: md`A_1`, ans: 25 }, { lbl: md`B_1`, ans: 25.625 }, { lbl: md`A_2`, ans: 28.203 },
          { lbl: md`A_\infty`, ans: 28.254, tol: { rel: 0.0004 } },
        ],
        sol: md`
          **Boundary conditions.**
          1. Top row: $60$ (all four cells).
          2. Middle row: $20$ at the left end, $0$ at the right end.
          3. Bottom row: $0$.

          $A$'s eight neighbours: $60, 60, 60$ above, $20$ to the left, $B$ to the right, $0, 0, 0$ below. So $A = \tfrac18(200 + B)$. $B$'s: $60, 60, 60$ above, $A$ to the left, $0$ to the right, $0, 0, 0$ below. So $B = \tfrac18(180 + A)$.

          - $A_1 = \tfrac18(200 + 0) = 25$
          - $B_1 = \tfrac18(180 + 25) = 25.625$
          - $A_2 = \tfrac18(200 + 25.625) = 28.203$

          **Converged:** $64A = 1600 + 180 + A$, so $A_\infty = 1780/63 = 28.25$ (and $B_\infty = 1640/63 = 26.03$). The lecture's rule converges fast here: $A_2$ is already within $0.2\%$.
        `,
      }),

      RF(md`
        !!method Patterns from this lesson
          - 2-D: you need $V$ along the whole boundary curve. Harmonic functions have saddles, never bowls or domes; closed equipotential loops around a point mean charge inside.
          - Quick harmonic test: add the second derivatives. $x^2 - y^2$, $xy$, $e^{kx}\sin ky$ pass; $x^2+y^2$ and $e^{kx}$ alone fail.
          - Circle averages of a harmonic function equal the center value; that's the fast way to evaluate them.
          - Relaxation is the averaging property as an algorithm. State the stencil (4 or 8 neighbours). Converged values are bounded by the boundary values and don't depend on the initial guess.
          - Failure modes: stopping when per-pass changes are small but the values are still drifting; a grid too coarse to be accurate; an update rule that oscillates.
          - Symmetry plus superposition can give exact values with no iteration: the center of a square with one side at $V_0$ (others $0$) is at $V_0/4$.
      `),
    ],
  };

  // ================================================================== Lesson 3 figures
  const fAvg = () => {
    const f = PF.fig();
    const cx = 140, cy = 92, R = 52;
    f.sphere(cx, cy, R);
    f.dot(cx, cy); f.tag(cx, cy, 'P', 'l', 6);
    const ex = cx + R * Math.cos(35 * D2R), ey = cy - R * Math.sin(35 * D2R);
    f.line(cx, cy, ex, ey, { cls: 'dim' }); f.tag(ex, ey, 'R', 'tr', 6);
    f.charge(276, 30, { q: '+', lab: 'q_1', at: 'l' });
    f.charge(22, 36, { q: '-', lab: 'q_2', at: 'r' });
    f.charge(280, 150, { q: '+', lab: 'q_3', at: 't' });
    f.text(cx, cy + R + 12, 'charge-free inside', 't');
    return f.svg();
  };
  // sphere of radius R with q on the z axis at distance z (outside, or inside with o.inside); o.detail adds da, theta, script-r
  const fSphereZ = (o = {}) => {
    const f = PF.fig();
    const cx = 130, cy = 160, R = 62;
    f.circle(cx, cy, R);
    const zq = o.inside ? 32 : 124;
    const ztop = o.inside ? R + 34 : zq + 30;
    f.arrow(cx, cy, cx, cy - ztop, { cls: 'dim', hs: 6 }); f.label(cx + 6, cy - ztop - 2, 'z', 'bl', 'small accent');
    f.arrow(cx, cy, cx + R + 52, cy, { cls: 'dim', hs: 6 }); f.label(cx + R + 58, cy, 'y', 'l', 'small accent');
    f.arrow(cx, cy, cx - 58, cy + 44, { cls: 'dim', hs: 6 }); f.label(cx - 62, cy + 48, 'x', 'tr', 'small accent');
    f.charge(cx, cy - zq, { q: '+', r: 6 });
    const th = (o.inside ? 125 : 50) * D2R, px = cx + R * Math.sin(th), py = cy - R * Math.cos(th);
    if (o.detail) {
      f.label(cx + 12, cy - zq, 'q', 'l');
      f.line(cx, cy, px, py);
      if (o.inside) f.tag((cx + px) / 2, (cy + py) / 2, 'R', 'bl', 6); else f.tag((cx + px) / 2, (cy + py) / 2, 'R', 'r', 6);
      f.circle(px, py, 4.5, { cls: 'bgfill' }); f.tag(px, py, 'da', 'r', 9);
      f.line(cx, cy - zq, px, py, { cls: 'dash' });
      const mx = (cx + px) / 2, my = (cy - zq + py) / 2, L = Math.hypot(px - cx, py - cy + zq);
      const nx = (py - cy + zq) / L, ny = -(px - cx) / L;
      f.label(mx + 13 * nx, my + 13 * ny, '\\srm', 'c');
      f.angle(cx, cy, 22, 90 - th / D2R, 90, '\\theta');
    } else {
      f.label(cx + 12, cy - zq, 'q', 'l');
      const rx = cx + R * Math.cos(-38 * D2R), ry = cy - R * Math.sin(-38 * D2R);
      f.line(cx, cy, rx, ry, { cls: 'dim' });
      f.tag((cx + rx) / 2, (cy + ry) / 2, 'R', 'bl', 6);
    }
    f.dim(cx, cy, cx, cy - zq, 'z', { off: -24, at: 'l' });
    return f.svg();
  };
  const fVavePlot = () => PF.plot({ w: 330, h: 200, x: [0, 4], y: [0, 1.25], xl: 'z', yl: 'V_{\\text{ave}}', xt: [[1, 'R'], [2, '2R'], [3, '3R']],
    yt: [[1, '\\tfrac{q}{4\\pi\\varepsilon_0R}']], curves: [{ f: (z) => (z < 1 ? 1 : 1 / z), n: 400 }] });
  const fSphere3q = () => {
    const f = PF.fig();
    const cx = 140, cy = 104, R = 52;
    f.circle(cx, cy, R);
    f.dot(cx, cy, 2); f.tag(cx, cy, 'O', 'tl', 6);
    const lx = cx + R * Math.cos(200 * D2R), ly = cy - R * Math.sin(200 * D2R);
    f.line(cx, cy, lx, ly, { cls: 'dim' }); f.tag((cx + lx) / 2, (cy + ly) / 2, 'R', 'b', 8);
    f.charge(cx + 130, cy - 8, { q: '+', lab: 'q_1', at: 't' });
    f.charge(cx - 116, cy - 70, { q: '-', lab: 'q_2', at: 'r' });
    f.charge(cx + 14, cy + 8, { q: '+', r: 5, lab: 'q_3', at: 'r' });
    return f.svg();
  };
  const fCube8 = () => {
    const g = PF.fig({ proj: { ox: 70, oy: 190, s: 1 } });
    const a = 120;
    g.box3(a, a, a);
    for (const x of [0, a]) for (const y of [0, a]) for (const z of [0, a]) { const [X, Y] = g.p3(x, y, z); g.charge(X, Y, { q: '+', r: 6 }); }
    const [Px, Py] = g.p3(a / 2, a / 2, a / 2);
    g.dot(Px, Py); g.tag(Px, Py, 'P', 'r', 6);
    return g.svg();
  };
  const fRing = () => {
    const f = PF.fig();
    const cx = 150, cy = 100, rx = 112, ry = 30;
    f.line(cx, cy + 74, cx, cy - 84, { cls: 'dim dash thin' });
    f.label(cx + 6, cy - 86, 'z', 'bl', 'small accent');
    f.ellipse(cx, cy, rx, ry, { half: 'back', cls: 'dim' }); f.ellipse(cx, cy, rx, ry, { half: 'front' });
    for (let k = 0; k < 8; k++) { const t = (k * 45 + 22.5) * D2R; f.charge(cx + rx * Math.cos(t), cy - ry * Math.sin(t), { q: '+', r: 6 }); }
    f.charge(cx, cy, { q: '+', r: 5 }); f.tag(cx, cy, 'q', 'r', 10);
    return f.svg();
  };
  const fTwoQ = () => {
    const f = PF.fig();
    const y = 60;
    f.charge(40, y, { q: '+', lab: '+Q', at: 't' });
    f.charge(240, y, { q: '+', lab: '+Q', at: 't' });
    f.charge(140, y, { q: '+', r: 5 }); f.tag(140, y, 'q', 't', 10);
    f.dim(40, y + 30, 240, y + 30, '2a', { at: 'b' });
    return f.svg();
  };
  const fShellQ = () => {
    const f = PF.fig();
    const cx = 110, cy = 100, R = 72;
    f.circle(cx, cy, R, { cls: 'thick' });
    for (let k = 0; k < 12; k++) { const t = k * 30 * D2R; f.label(cx + (R + 12) * Math.cos(t), cy - (R + 12) * Math.sin(t), '+', 'c', 'small'); }
    f.charge(cx + 26, cy - 18, { q: '+', r: 5, lab: 'q', at: 'r' });
    return f.svg();
  };
  const fTwoSpheres = () => {
    const f = PF.fig();
    disk(f, 70, 84, 38); f.label(70, 136, '5\\text{ V}', 't', 'small');
    disk(f, 230, 94, 28); f.label(230, 136, '2\\text{ V}', 't', 'small');
    f.dot(150, 36); f.tag(150, 36, 'P', 'r', 7);
    return f.svg();
  };
  const fCenterQ = () => {
    const f = PF.fig();
    const cx = 90, cy = 84, R = 56;
    f.circle(cx, cy, R);
    f.charge(cx, cy, { q: '+', lab: 'q', at: 'b' });
    const ex = cx + R * Math.cos(140 * D2R), ey = cy - R * Math.sin(140 * D2R);
    f.line(cx, cy, ex, ey, { cls: 'dim' }); f.tag((cx + ex) / 2, (cy + ey) / 2, 'R', 'tr', 6);
    return f.svg();
  };
  const fQmove = () => {
    const f = PF.fig();
    const cx = 100, cy = 90, R = 66;
    f.circle(cx, cy, R);
    f.dot(cx, cy, 2);
    f.charge(cx - 24, cy + 16, { q: '+', r: 6, lab: 'q', at: 'b' });
    f.charge(cx + 30, cy - 28, { q: '+', r: 6, image: true });
    f.arrow(cx - 15, cy + 9, cx + 21, cy - 20, { cls: 'dim' });
    return f.svg();
  };

  // ================================================================== Lesson 3
  const L3 = {
    id: 'u4-3d', title: 'Three dimensions: averages, extremes, Earnshaw',
    steps: [
      RF(md`
        ### Three dimensions

        $$\frac{\partial^2V}{\partial x^2}+\frac{\partial^2V}{\partial y^2}+\frac{\partial^2V}{\partial z^2} = 0$$

        There is no explicit general solution and no rubber-sheet picture, but the same two properties hold:

        1. **Mean value theorem.** $V$ at a point equals the average of $V$ over any spherical surface centered there, as long as there is no charge inside the sphere:
        $$V(\vb r) = \frac{1}{4\pi R^2}\oint_{\text{sphere}} V\,da.$$
        2. **No local maxima or minima.** If $V$ had a maximum at $\vb r$, you could draw a small sphere around $\vb r$ on which every value is lower, so the average would be lower than $V(\vb r)$, contradicting 1. The extreme values of $V$ sit on the boundaries of the region (and infinity counts as a boundary).

        [[fig:avg]]
      `, { avg: { svg: fAvg(), cap: md`No charge inside the sphere around $P$. Whatever the charges outside do, the average of $V$ over the sphere equals $V(P)$.` } }),

      Q(md`A sphere of radius $R$ contains no charge. The charges outside it produce a potential whose average over the sphere's surface is $12$ V. What is $V$ at the center?`,
        [md`$0$, since there's no charge inside`, md`$12$ V`, md`It depends on where the outside charges are`, md`$12/(4\pi R^2)$ V`], 1,
        [md`No charge inside makes $\nabla^2V = 0$ inside, not $V = 0$. The outside charges set $V$ there.`, null,
          md`Their positions affect both numbers, but the mean value theorem ties the two together for any arrangement outside.`,
          md`$\dfrac{1}{4\pi R^2}\oint V\,da$ is already the average; there's nothing left to divide by.`],
        md`Mean value theorem: with no charge inside, $V(\text{center}) = \langle V\rangle_{\text{sphere}} = 12$ V, wherever the outside charges sit.`,
        { figHtml: fAvg() }),

      Q(md`Why can't $V$ have a local maximum at a point $P$ of a charge-free region?`,
        [md`A small sphere around $P$ would have $V$ below $V(P)$ everywhere on it, so its average would be below $V(P)$, but the mean value theorem says the two are equal.`, md`Because $\vb E = 0$ at a maximum, and $\vb E$ can't vanish in a charge-free region.`, md`Because $V$ always decreases away from positive charges.`, md`Because $\nabla V$ is never zero in a charge-free region.`], 0,
        [null, md`$\vb E$ can vanish in a charge-free region, e.g. midway between two equal charges. Those points are saddles, not maxima.`,
          md`Away from a single positive charge $V$ does fall, but the outside charges can be arranged any way. The argument has to work for every arrangement.`,
          md`$\nabla V = 0$ happens at saddle points (midway between two equal charges, for instance). Laplace's equation forbids extrema, not stationary points.`],
        md`That's Griffiths' one-line argument. The mean value theorem is the engine; "no extrema" follows from it.`,
        { figHtml: fAvg() }),

      RF(md`
        ### Why the average equals the center value (Lecture 8)

        Start with one point charge $q$ outside a sphere of radius $R$. Center the sphere at the origin and put $q$ on the $z$ axis at distance $z > R$.

        [[fig:proof]]

        The distance from $q$ to a surface point at polar angle $\theta$ comes from the law of cosines, $\srm^2 = z^2 + R^2 - 2zR\cos\theta$, and there $V = \dfrac{q}{4\pi\varepsilon_0\srm}$. With $da = R^2\sin\theta\,d\theta\,d\phi$:

        $$V_{\text{ave}} = \frac{1}{4\pi R^2}\,\frac{q}{4\pi\varepsilon_0}\int_0^{2\pi}\!\!\int_0^{\pi}\frac{R^2\sin\theta\,d\theta\,d\phi}{\sqrt{z^2+R^2-2zR\cos\theta}} = \frac{q}{4\pi\varepsilon_0}\,\frac12\int_0^{\pi}\frac{\sin\theta\,d\theta}{\sqrt{z^2+R^2-2zR\cos\theta}}.$$

        Substitute $u = \cos\theta$ (the notes call it $x$), $du = -\sin\theta\,d\theta$. As $\theta$ runs from $0$ to $\pi$, $u$ runs from $1$ to $-1$, and the minus sign flips the limits back:

        $$V_{\text{ave}} = \frac{q}{4\pi\varepsilon_0}\,\frac12\int_{-1}^{1}\frac{du}{\sqrt{z^2+R^2-2zRu}} = \frac{q}{4\pi\varepsilon_0}\,\frac12\left[-\frac{1}{zR}\sqrt{z^2+R^2-2zRu}\,\right]_{-1}^{1}$$

        $$= \frac{q}{4\pi\varepsilon_0}\,\frac{1}{2zR}\Big[\sqrt{(z+R)^2} - \sqrt{(z-R)^2}\Big] = \frac{q}{4\pi\varepsilon_0}\,\frac{1}{2zR}\Big[(z+R) - (z-R)\Big] = \frac{1}{4\pi\varepsilon_0}\,\frac{q}{z}.$$

        That's the potential of $q$ at the center of the sphere. The step $\sqrt{(z-R)^2} = z - R$ is where "outside" ($z>R$) is used. By superposition the same holds for any set of charges outside: **their average potential over the sphere is the potential they produce at the center.**

        !!trap Slips in the notes (L8-6)
          - The notes write $\srm = z^2+R^2-2zR\cos\theta$; it should be $\srm^2$. The next line correctly uses the power $-\tfrac12$.
          - After $x = \cos\theta$ the notes keep the limits as $\int_1^{-1}$ and use $+\tfrac{1}{zR}\sqrt{\cdots}$ as the antiderivative. Both signs are off: taken literally, each of those lines gives $-q/(4\pi\varepsilon_0 z)$. The final answer $+q/(4\pi\varepsilon_0z)$ is right.
      `, { proof: { svg: fSphereZ({ detail: true }), cap: md`Lecture 8's picture: $q$ on the $z$ axis at distance $z>R$ from the center; a patch $da$ at polar angle $\theta$, a distance $\srm$ from $q$.` } }),

      Q(md`Which of these is **not** a solution of Laplace's equation for $r>0$? (Use the spherical Laplacian from the formula sheet.)`,
        [md`$1/r$`, md`$r\cos\theta$`, md`$\dfrac{\cos\theta}{r^2}$`, md`$r^2$`], 3,
        [md`$r^2\,\tfrac{d}{dr}(1/r) = -1$, a constant: the Laplacian is $0$. (The point-charge potential.)`,
          md`$r\cos\theta = z$, and $\nabla^2 z = 0$. (The potential of a uniform field.)`,
          md`Radial part $\tfrac{1}{r^2}\tfrac{\partial}{\partial r}\big(r^2\cdot(-2\cos\theta/r^3)\big) = 2\cos\theta/r^4$; angular part $\tfrac{1}{r^2\sin\theta}\tfrac{\partial}{\partial \theta}\big(\sin\theta\cdot(-\sin\theta)/r^2\big) = -2\cos\theta/r^4$. They cancel. (A dipole.)`, null],
        md`$\nabla^2 r^2 = \tfrac{1}{r^2}\tfrac{d}{dr}(r^2\cdot 2r) = 6$. In Cartesian terms $r^2 = x^2+y^2+z^2$, a bowl in every direction. The other three are the potentials of a point charge, a uniform field and a dipole; you'll meet them again as the $\ell = 0$ and $\ell = 1$ terms of separation of variables in spherical coordinates.`,
        { nofig: 'testing formulas' }),

      Q(md`Which of these is harmonic for $s > 0$ (cylindrical coordinates, depending on $s$ only)?`,
        [md`$1/s$`, md`$\ln s$`, md`$s^2$`, md`$s$`], 1,
        [md`$s\,\tfrac{d}{ds}(1/s) = -1/s$, whose derivative over $s$ gives $1/s^3 \ne 0$. $1/s$ is not the 2-D analogue of $1/r$.`, null,
          md`$\tfrac1s\tfrac{d}{ds}(s\cdot 2s) = 4$.`, md`$\tfrac1s\tfrac{d}{ds}(s\cdot 1) = 1/s \ne 0$.`],
        md`$s\,\tfrac{d}{ds}\ln s = 1$, a constant, so $\nabla^2\ln s = 0$. $\ln s$ is the potential of an infinite line charge: in 2-D, $\ln s$ plays the role that $1/r$ plays in 3-D.`,
        { nofig: 'testing formulas' }),

      P({
        id: 'HW4-3.1', src: 'HW 4 & Discussion 3 · Griffiths 3.1', title: 'Average potential with the charge inside', big: true,
        q: md`Find the average potential over a spherical surface of radius $R$ due to a point charge $q$ located inside (same as above, in other words, only with $z < R$). (In this case, of course, Laplace's equation does not hold within the sphere.) Show that, in general,
        $$V_{\text{ave}} = V_{\text{center}} + \frac{\Qenc}{4\pi\varepsilon_0 R},$$
        where $V_{\text{center}}$ is the potential at the center due to all the external charges, and $\Qenc$ is the total enclosed charge.

        ("Same as above" is the calculation earlier in this lesson, with the charge on the $z$ axis at distance $z$ from the center.)`,
        figHtml: fSphereZ({ inside: true }),
        hints: [
          md`Same integral as for an outside charge: $V_{\text{ave}} = \dfrac{q}{4\pi\varepsilon_0}\,\dfrac12\displaystyle\int_{-1}^{1}\dfrac{du}{\sqrt{z^2+R^2-2zRu}}$. Exactly one step changes when $z<R$.`,
          md`The antiderivative gives $\dfrac{1}{zR}\Big[\sqrt{(z+R)^2}-\sqrt{(z-R)^2}\Big]$. A square root is never negative: for $z<R$, what is $\sqrt{(z-R)^2}$?`,
          md`For the general result use superposition: the average of a sum is the sum of the averages. Split the charges into those outside (Lecture 8's result) and those inside (the first part).`,
        ],
        parts: [
          { lbl: md`For $z < R$, $\sqrt{(z-R)^2}$ equals`, mc: [md`$z - R$`, md`$R - z$`, md`$z + R$`, md`$\lvert z\rvert + R$`], a: 1,
            why: [md`That's negative for $z<R$, and a square root can't be negative. Using it gives back the outside answer $q/(4\pi\varepsilon_0 z)$, which is wrong here.`, null, md`That's $\sqrt{(z+R)^2}$, the other end of the interval.`, md`$(z-R)^2$ is not $(\lvert z\rvert + R)^2$.`] },
          { lbl: md`V_{\text{ave}}\ (\text{one charge } q \text{ inside, at distance } z<R)`, expr: 'q/(4*pi*eps0*R)', vars: { q: [1, 3], eps0: [0.5, 2], R: [1.2, 2], z: [0.1, 1] } },
          { lbl: md`In the general formula, each charge **outside** the sphere contributes to $V_{\text{ave}}$:`, mc: [md`$q_i/(4\pi\varepsilon_0 R)$`, md`nothing`, md`its potential at the center of the sphere`, md`its potential at the nearest point of the sphere`], a: 2,
            why: [md`That's the contribution of a charge **inside**.`, md`Outside charges do change $V$ on the sphere; they contribute their center value.`, null, md`The average over the whole sphere is the center value, not the nearest-point value.`] },
          { lbl: md`A charge $q$ **inside** contributes the same to $V_{\text{ave}}$ as:`, mc: [md`the same charge moved to the center`, md`the same charge moved to the nearest point of the sphere`, md`nothing`, md`a charge $qz/R$ at the center`], a: 0,
            why: [null, md`A charge on the sphere would give a different (larger at nearby points) potential; the average comes out $q/(4\pi\varepsilon_0 R)$ only for a charge anywhere inside.`, md`It contributes $q/(4\pi\varepsilon_0 R)$, which isn't zero.`, md`The result doesn't depend on $z$ at all.`] },
        ],
        sol: md`
          No boundary conditions here: the potential of each charge is known, and you average it directly.

          **One charge inside.** Center the sphere at the origin and put $q$ on the $z$ axis at distance $z<R$.

          [[fig:geom]]

          Everything up to the last step is the same as for an outside charge:

          $$V_{\text{ave}} = \frac{1}{4\pi R^2}\oint\frac{q}{4\pi\varepsilon_0\srm}\,da = \frac{q}{4\pi\varepsilon_0}\,\frac12\int_{-1}^{1}\frac{du}{\sqrt{z^2+R^2-2zRu}} = \frac{q}{4\pi\varepsilon_0}\,\frac{1}{2zR}\Big[\sqrt{(z+R)^2} - \sqrt{(z-R)^2}\Big].$$

          ($u = \cos\theta$. At $u = 1$ the surface point is at the top, a distance $\lvert z - R\rvert$ from $q$; at $u=-1$ it's at the bottom, a distance $z + R$.) A square root is never negative, so for $z<R$:

          $$\sqrt{(z-R)^2} = R - z \quad(\text{not } z - R).$$

          Then

          $$V_{\text{ave}} = \frac{q}{4\pi\varepsilon_0}\,\frac{1}{2zR}\Big[(z+R) - (R-z)\Big] = \frac{q}{4\pi\varepsilon_0}\,\frac{2z}{2zR} = \frac{1}{4\pi\varepsilon_0}\,\frac{q}{R}.$$

          It doesn't depend on $z$: wherever the charge sits inside, the average is what it would be if the charge were at the center.

          [[fig:plot]]

          **General case.** Averaging is linear: the average of the total potential is the sum of the averages of each charge's potential.
          - Each charge outside contributes its potential at the center (Lecture 8). Together these give $V_{\text{center}}$, the potential at the center due to the external charges.
          - Each charge $q_j$ inside contributes $q_j/(4\pi\varepsilon_0R)$. Together: $\Qenc/(4\pi\varepsilon_0R)$.

          $$V_{\text{ave}} = V_{\text{center}} + \frac{\Qenc}{4\pi\varepsilon_0 R}.\qquad\square$$

          For a continuous distribution replace the sums by integrals over $\rho\,d\tau$; nothing changes.

          **Checks.** Charge at the center ($z = 0$): every surface point is a distance $R$ away, so $V = q/(4\pi\varepsilon_0R)$ everywhere on the sphere. Charge approaching the surface ($z\to R$): the inside and outside formulas meet at $q/(4\pi\varepsilon_0R)$. No charge inside: back to the mean value theorem.

          **Why this works.** The average of $q$'s potential over the sphere, $\dfrac{1}{4\pi R^2}\oint\dfrac{q\,da}{4\pi\varepsilon_0\srm}$, is exactly the potential **at $q$'s position** produced by a charge $q$ spread uniformly over the sphere. A uniform shell's potential is constant inside ($q/4\pi\varepsilon_0 R$) and $q/(4\pi\varepsilon_0 z)$ outside: both results at once. To remember: inside charges count as if at the center; outside charges contribute their potential at the center.
        `,
        figs: {
          geom: { svg: fSphereZ({ inside: true, detail: true }), cap: md`Charge inside: $z < R$. The geometry of the integral is the same as before.` },
          plot: { svg: fVavePlot(), cap: md`Average of $q$'s potential over a sphere of radius $R$, against the distance $z$ of $q$ from the center: flat inside, $1/z$ outside.` },
        },
      }),

      Q(md`$V = \dfrac{q}{4\pi\varepsilon_0 r}$ satisfies $\nabla^2V = 0$ for $r > 0$. Yet its average over a sphere of radius $R$ centered on the charge is $\dfrac{q}{4\pi\varepsilon_0 R}$, while $V(0)$ is infinite. Why doesn't the mean value theorem apply?`,
        [md`It does apply; the theorem is only approximate for big spheres`, md`The average over the sphere is actually infinite too`, md`The sphere encloses the charge, and the theorem needs a charge-free interior`, md`$1/r$ isn't harmonic anywhere`], 2,
        [md`The theorem is exact for every radius when its condition holds.`,
          md`On the sphere $r = R$ everywhere, so $V = q/(4\pi\varepsilon_0R)$ at every point: finite.`, null,
          md`It is harmonic for $r > 0$: $r^2\,\tfrac{d}{dr}(1/r) = -1$, a constant. It fails only at $r = 0$, where the charge is.`],
        md`At $r=0$ there's a point charge, and $\nabla^2(1/r) = -4\pi\delta^3(\vb r)$. The mean value theorem needs $\nabla^2V = 0$ throughout the ball, not just on its surface. With charge inside, HW 3.1 applies instead: each enclosed charge contributes $q/(4\pi\varepsilon_0R)$ to the average.`,
        { figHtml: fCenterQ() }),

      Q(md`A charge $q$ sits inside a sphere of radius $R$. You move it to another spot, still inside. What happens to the average over the sphere of its potential?`,
        [md`Nothing: it stays $q/(4\pi\varepsilon_0 R)$`, md`It grows as the charge nears the surface`, md`It becomes $q/(4\pi\varepsilon_0 z)$ for the new distance $z$ from the center`, md`It drops to zero`], 0,
        [null, md`Surface points near the charge gain, but the points on the far side lose exactly as much.`,
          md`$q/(4\pi\varepsilon_0 z)$ is the result for a charge outside. Inside, the $z$ cancels.`,
          md`Every point of the sphere has $V>0$ for $q > 0$, so the average can't be zero.`],
        md`From HW 3.1: for $z<R$, $V_{\text{ave}} = q/(4\pi\varepsilon_0R)$, independent of where inside the charge sits. Inside charges count as if they were at the center.`,
        { figHtml: fQmove() }),

      P({
        id: 'u4-p-avg', title: 'Averages over a sphere, with numbers',
        q: md`A sphere of radius $10$ cm is centered at $O$. Outside it: $q_1 = +4$ nC at $30$ cm from $O$ and $q_2 = -2$ nC at $50$ cm from $O$. Inside it: $q_3 = +1$ nC at $4$ cm from $O$. Use $1/(4\pi\varepsilon_0) = 8.99\times10^9\ \text{N m}^2/\text{C}^2$.

        (a) Find the average potential over the sphere due to $q_1$ and $q_2$ alone. (b) Find the average due to all three.`,
        figHtml: fSphere3q(),
        hints: [
          md`(a) Both charges are outside: their average over the sphere is their potential at the center $O$.`,
          md`(b) Add the inside charge's contribution, $q_3/(4\pi\varepsilon_0R)$ with $R = 0.10$ m. Its distance from $O$ doesn't matter.`,
        ],
        parts: [
          { lbl: md`(a)\ \langle V\rangle_{1,2}`, ans: 83.9, unit: 'V' },
          { lbl: md`(b)\ \langle V\rangle_{1,2,3}`, ans: 173.8, unit: 'V' },
          { lbl: md`(c) If $q_3$ moved to $8$ cm from $O$ (still inside), the answer to (b) would:`, mc: [md`increase`, md`decrease`, md`stay the same`, md`double`], a: 2,
            why: [md`Inside charges contribute $q/(4\pi\varepsilon_0R)$ wherever they are.`, md`Inside charges contribute $q/(4\pi\varepsilon_0R)$ wherever they are.`, null, md`Nothing in $q_3/(4\pi\varepsilon_0 R)$ changes.`] },
        ],
        sol: md`
          No boundary conditions: the charges are all given, so use $V_{\text{ave}} = V_{\text{center}} + \Qenc/(4\pi\varepsilon_0R)$.

          **(a)** Outside charges: their potential at $O$.
          $$\langle V\rangle_{1,2} = 8.99\times10^9\left(\frac{4\times10^{-9}}{0.30} - \frac{2\times10^{-9}}{0.50}\right) = 8.99\times10^{9}\times 9.33\times10^{-9} = 83.9\text{ V}.$$

          **(b)** Add the enclosed charge:
          $$\frac{q_3}{4\pi\varepsilon_0R} = 8.99\times10^9\times\frac{1\times10^{-9}}{0.10} = 89.9\text{ V},\qquad \langle V\rangle_{1,2,3} = 173.8\text{ V}.$$

          **(c)** Unchanged: an inside charge contributes $q_3/(4\pi\varepsilon_0R)$ wherever it sits.

          **What to remember.** Sphere averages need no integral: outside charges at the center value, inside charges at $q/(4\pi\varepsilon_0R)$.
        `,
      }),

      RF(md`
        ### Earnshaw's theorem

        **A charged particle cannot be held in stable equilibrium by electrostatic forces alone.**

        One-sentence reason (Griffiths Prob. 3.2): a positive test charge has potential energy $qV$, so stable equilibrium needs a local minimum of $V$; but in the charge-free region around the equilibrium point (the test charge's own field doesn't count) $V$ has no local minimum. A negative test charge would need a local maximum, which is just as forbidden.

        The equilibrium points that do exist are saddles: stable along some directions, unstable along others.

        **Example: a ring of positive charges, with a positive test charge at the center.** Move the test charge within the plane of the ring and it gets closer to the charges on one side: $V$ rises and it's pushed back. Stable. Move it along the axis and every ring charge gets farther away (for a uniform ring, $V = \dfrac{Q}{4\pi\varepsilon_0\sqrt{R^2+z^2}}$, which falls as $\lvert z\rvert$ grows), so $V$ drops and the charge slides out. Unstable. The curvatures cancel as Laplace's equation demands: up in two directions, down in the third.

        [[fig:ring]]

        !!intuition Why traps need more than static charges
          Particle traps add a magnetic field (Penning trap) or switch the electric field rapidly (Paul trap), and fusion plasmas are confined magnetically. Neither is electrostatics, so Earnshaw's theorem doesn't apply.
      `, { ring: { svg: fRing(), cap: md`Eight fixed positive charges on a ring, a positive test charge $q$ at the center. Stable in the plane, unstable along the axis.` } }),

      Q(md`Eight equal positive charges are fixed at the corners of a cube (Griffiths Fig. 3.4). A positive test charge sits at the center $P$, where the forces cancel. Where is the "leak" in this electrostatic bottle?`,
        [md`There is none: it's repelled from every corner, so it's trapped`, md`Along a body diagonal, toward a corner`, md`Toward the center of a face`, md`Toward the midpoint of an edge`], 2,
        [md`That's the intuition Earnshaw's theorem kills: with no charge at $P$, $V$ can't have a minimum there.`,
          md`Toward a corner you approach a positive charge: $V$ rises and the force pushes the test charge back. That direction is stable.`, null,
          md`Toward an edge midpoint you approach two corner charges; $V$ rises there too (stable).`],
        md`$V$ has no minimum at $P$, so some direction must lead downhill. By symmetry the candidates are the corners, edge midpoints and face centers. Toward a corner or an edge midpoint you get closer to charges and $V$ rises. Toward a face center you head into the biggest gap between the charges, and $V$ falls: the test charge escapes through a face. (Near $P$ the change in $V$ is only fourth order in the displacement: the cube's symmetry plus $\nabla^2V = 0$ kill every second-order term. A numerical check of $V$ along each direction confirms the signs.)`,
        { figHtml: fCube8() }),

      Q(md`Two equal positive charges are fixed a distance $2a$ apart, and a positive test charge sits exactly midway. For which displacements is the equilibrium stable?`,
        [md`All directions`, md`No direction`, md`Perpendicular to the line only`, md`Along the line only`], 3,
        [md`Earnshaw: electrostatic forces alone never give stability in all directions.`,
          md`Along the line you approach one of the charges, $V$ rises, and you're pushed back: stable that way.`,
          md`Reversed. Perpendicular to the line you move away from both charges, $V$ falls, and the test charge drifts off.`, null],
        md`Along the line $V$ rises toward either charge: restoring. Perpendicular to it both charges recede and $V$ drops: the test charge slides out. A saddle, as Earnshaw requires: $\partial^2V/\partial x^2 > 0$ along the line is balanced by $\partial^2V/\partial y^2 + \partial^2V/\partial z^2 < 0$.`,
        { figHtml: fTwoQ() }),

      Q(md`A small positive charge is placed inside a uniformly charged spherical shell (total charge $+Q$), away from the center. What happens?`,
        [md`It is pushed back toward the center: a stable trap`, md`No force anywhere inside: it stays where it's put`, md`It drifts toward the nearest part of the shell`, md`It is pushed toward the far side of the shell`], 1,
        [md`That would be a stable electrostatic equilibrium, which Earnshaw forbids. Inside the shell $V$ is constant, so there's no force at all.`, null,
          md`The shell repels a positive charge, and in any case the net force inside is zero (shell theorem).`,
          md`The near part of the shell pushes harder per unit charge but has less charge; the two sides cancel exactly.`],
        md`Inside the shell $V$ is constant: Laplace's equation inside a sphere whose surface is at one value (uniqueness, Lesson 4). So $\vb E = 0$ and there is no force. That's neutral equilibrium, which Earnshaw allows; it forbids only a restoring (stable) one.`,
        { figHtml: fShellQ() }),

      Q(md`Which of these can hold a charged particle in stable equilibrium?`,
        [md`A cleverly shaped arrangement of fixed charges`, md`A charged conducting bowl`, md`A strong uniform electric field`, md`Static electric fields combined with a magnetic field (a Penning trap)`], 3,
        [md`Earnshaw: any arrangement of fixed charges leaves $V$ without a minimum in the empty space where the particle sits.`,
          md`A conductor is just another arrangement of charges; Earnshaw still applies in the empty space above it.`,
          md`A uniform field pushes the particle steadily one way: no equilibrium at all.`, null],
        md`Earnshaw's theorem is about electrostatic forces alone. Magnetic forces depend on velocity and escape the argument; so do rapidly varying electric fields (Paul traps).`,
        { nofig: 'list of devices' }),

      Q(md`Two conducting spheres are held at $5$ V and $2$ V. There is no other charge, and $V\to 0$ far away. Which of these could be the potential at a point $P$ in the empty space?`,
        [md`$3.5$ V`, md`$7$ V`, md`$-1$ V`, md`$6$ V`], 0,
        [null, md`Potentials don't add like that here. $V$ in the empty space is bounded by its boundary values, the largest of which is $5$ V.`,
          md`The smallest boundary value is $0$ (at infinity). $V$ in a charge-free region can't go below it.`,
          md`Above the largest boundary value: that would be an interior maximum.`],
        md`The region is the space outside both spheres. Its boundaries are sphere 1 ($5$ V), sphere 2 ($2$ V), and infinity ($0$). No charge in the region, so $V$ there lies between the smallest and the largest boundary value: $0 \le V \le 5$ V. Only $3.5$ V qualifies.`,
        { figHtml: fTwoSpheres() }),

      Q(md`A metal box has all six walls grounded, and a positive point charge sits inside. Where is $V$ largest inside the box?`,
        [md`On the walls, since extremes are on the boundary`, md`At the center of the box`, md`At the charge, where $V$ grows without bound`, md`Nowhere: $V = 0$ throughout`], 2,
        [md`"Extremes on the boundary" holds in charge-free regions. This region contains the charge.`,
          md`The center has no special role unless the charge is there.`, null,
          md`$V = 0$ on the walls, but not inside: near the charge $V\approx q/(4\pi\varepsilon_0 r)$.`],
        md`With charge in the region, Poisson's equation holds and peaks are allowed at positive charges. In the rest of the box (cut out a tiny ball around $q$) the max and min sit on the boundaries: the walls ($0$) and the tiny sphere around $q$ (large and positive).`,
        { figHtml: fBoxQ() }),

      RF(md`
        !!method Patterns from this lesson
          - Sphere averages: charges outside contribute their potential at the center; charges inside contribute $q/(4\pi\varepsilon_0R)$, as if at the center. $V_{\text{ave}} = V_{\text{center}} + \Qenc/(4\pi\varepsilon_0R)$.
          - No local extrema in a charge-free region: the max and min of $V$ are on the boundaries, infinity included. Use it to bound $V$ without solving anything.
          - Earnshaw: no stable equilibrium from electrostatics alone; equilibria are saddles. The unstable direction points where the charges are sparse.
          - Harmonic in 3-D: $1/r$, $z = r\cos\theta$, $\cos\theta/r^2$, $\ln s$, $x^2-y^2$, $xyz$. Not harmonic: $r^2$, $1/s$, $x^2+y^2$.
      `),
    ],
  };

  // ================================================================== Lesson 4 figures
  const fBlob = (o = {}) => {
    const f = PF.fig();
    const cx = 190, cy = 92;
    const pts = potato(cx, cy, 120, 68, [0.06, 0.05, 0.03], [0.5, 1.8, 2.6]);
    region(f, pts, 'thick');
    f.text(cx, cy - 12, o.in1 || 'we want V in the volume', 'c');
    if (o.in2) f.label(cx, cy + 16, o.in2, 'c');
    const b = pts[62];
    f.arrow(b[0] - 40, b[1] + 36, b[0] - 3, b[1] + 3, { cls: 'dim' });
    f.text(b[0] - 44, b[1] + 40, o.out || 'V given on the surface', 'tr');
    return f.svg();
  };
  const fIslands = () => {
    const f = PF.fig();
    const out = potato(190, 100, 150, 82, [0.05, 0.04, 0.03], [0.2, 1.4, 2.2]);
    region(f, out, 'thick');
    const isl = potato(116, 104, 38, 27, [0.05, 0.03, 0.02], [1.0, 0.3, 2.0]);
    metal(f, isl);
    f.label(116, 148, 'V = V_1', 't', 'small');
    f.label(250, 96, '\\rho\\text{ given}', 'c');
    const p = out[12];
    f.label(p[0] + 8, p[1] - 8, 'V = V_0', 'bl', 'small');
    return f.svg();
  };
  const fCavity = (o = {}) => {
    const f = PF.fig();
    const outer = potato(150, 100, 112, 76, [0.05, 0.04, 0.02], [0.3, 1.1, 2.0]);
    const cav = potato(146, 100, 56, 40, [0.06, 0.05, 0.03], [1.2, 0.4, 2.7]);
    f.hatchBand(outer.concat([outer[0]], cav.concat([cav[0]]).reverse()));
    f.poly(outer); f.poly(cav);
    if (o.q) f.charge(140, 104, { q: '+', r: 6, lab: 'q', at: 'r' }); else f.text(146, 100, 'cavity', 'c');
    if (o.Q) f.charge(322, 40, { q: '+', lab: 'Q', at: 'l' });
    return f.svg();
  };
  const fCubeFaces = (two) => {
    const g = PF.fig({ proj: { ox: 60, oy: 180, s: 1 } });
    const a = 110;
    if (two) g.add(`<path class="shade nodecl" d="M${[[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0]].map((p) => g.p3(...p).map((v) => v.toFixed(1)).join(',')).join('L')}Z"/>`);
    g.box3(a, a, a, { shadeTop: true });
    const [tx, ty] = g.p3(a / 2, a / 2, a); g.label(tx, ty, 'V_0', 'c', 'small');
    if (two) { const [bx, by] = g.p3(a / 2, a / 2, 0); g.label(bx, by, 'V_0', 'c', 'small'); }
    const [px, py] = g.p3(a / 2, a / 2, a / 2); g.dot(px, py); g.tag(px, py, 'C', 'r', 6);
    return g.svg();
  };
  const fBox3 = () => { const g = PF.fig({ proj: { ox: 60, oy: 150, s: 1 } }); g.box3(170, 110, 80); return g.svg(); };
  const fSphereV0 = () => {
    const f = PF.fig();
    disk(f, 120, 80, 40);
    f.label(120 + 40 * 0.72 + 8, 80 - 40 * 0.72 - 8, 'V_0', 'bl', 'small');
    f.text(120, 80 + 40 + 14, 'the region: all space outside the sphere', 't');
    return f.svg();
  };
  const fConc = (o = {}) => {
    const f = PF.fig();
    const cx = 130, cy = 120, a = 34, b = 92;
    disk(f, cx, cy, a);
    shell(f, cx, cy, b, b + 8);
    const t1 = 150 * D2R;
    f.line(cx, cy, cx + a * Math.cos(t1), cy - a * Math.sin(t1), { cls: 'dim' });
    f.label(cx + (a + 12) * Math.cos(t1), cy - (a + 12) * Math.sin(t1), 'a', 'c', 'small');
    const t2 = 35 * D2R;
    f.line(cx, cy, cx + b * Math.cos(t2), cy - b * Math.sin(t2), { cls: 'dim' });
    f.tag(cx + 64 * Math.cos(t2), cy - 64 * Math.sin(t2), 'b', 'tl', 6);
    f.label(cx, cy + a + 14, o.inner || 'V_0', 't', 'small');
    f.label(cx + b + 20, cy, o.outer || 'V=0', 'l', 'small');
    return f.svg();
  };
  const fHW35 = () => {
    const f = PF.fig();
    const cx = 190, cy = 104;
    const out = potato(cx, cy, 150, 86, [0.05, 0.04, 0.02], [0.3, 1.2, 2.0]);
    region(f, out, 'thick');
    const icx = 118, icy = 110;
    const isl = potato(icx, icy, 40, 28, [0.05, 0.04, 0.02], [1.1, 0.2, 2.5]);
    f.poly(isl, { cls: 'bgfill' });
    const p = out[11], ux = Math.cos(41.25 * D2R), uy = -Math.sin(41.25 * D2R);
    f.arrow(p[0], p[1], p[0] + 26 * ux, p[1] + 26 * uy, { hs: 6 });
    f.tag(p[0] + 26 * ux, p[1] + 26 * uy, '\\hat{\\mathbf n}', 'r', 6);
    const q = isl[0];
    f.arrow(q[0], q[1], q[0] - 20, q[1], { hs: 6 });
    f.label(q[0] - 26, q[1], '\\hat{\\mathbf n}', 'r');
    const s1 = out[34];
    f.label(s1[0] - 6, s1[1] - 8, 'S_1', 'br');
    f.label(icx + 62, icy - 30, 'S_2', 'c');
    f.label(cx + 66, cy + 26, '\\mathcal V', 'c');
    f.label(cx + 72, cy - 22, '\\rho\\text{ given}', 'c', 'small');
    return f.svg();
  };
  const fTwoBoxes = () => PF.row([{ svg: fBoxQ({ q: false }), cap: 'empty box' }, { svg: fBoxQ(), cap: 'charge inside' }]).svg;

  // ================================================================== Lesson 4
  const L4 = {
    id: 'u4-unique1', title: 'The first uniqueness theorem',
    steps: [
      RF(md`
        ### Is the boundary enough?

        Laplace's equation alone has infinitely many solutions; you need boundary conditions to single one out (Lecture 9). Two questions: is knowing $V$ on the boundary enough to fix $V$ inside? And could a second, different solution sneak in?

        [[fig:blob]]

        !!key First uniqueness theorem
          The solution to Laplace's equation in a volume is uniquely determined if $V$ is specified on the boundary surface.

        The boundary can have several pieces: "islands" inside the region (with $V$ given on their surfaces too), and an outer surface, which may be at infinity, where the usual condition is $V\to 0$.

        **Proof** (the lecture's hint: look at the difference). Suppose two functions both solve the problem,
        $$\nabla^2V_1 = 0, \qquad \nabla^2 V_2 = 0,$$
        with the same values on the boundary. Build a third function, $V_3 = V_1 - V_2$.

        1. It satisfies Laplace's equation: $\nabla^2V_3 = \nabla^2V_1 - \nabla^2V_2 = 0$.
        2. It vanishes on the boundary: $V_3 = V_1 - V_2 = 0$ there, since both take the given values.
        3. Laplace's equation allows no extrema except on the boundary, so the maximum and the minimum of $V_3$ are both boundary values: both $0$.
        4. A function whose maximum and minimum are both $0$ is $0$ everywhere. So $V_3 = 0$, and $V_1 = V_2$. $\square$
      `, { blob: { svg: fBlob(), cap: md`Lecture 9's picture: $V$ is given on the closed surface, and you want $V$ in the volume.` } }),

      Q(md`Step 3 of the proof says the maximum and the minimum of $V_3$ are both $0$. Which fact is it using?`,
        [md`$V_3$ is harmonic, so its extremes are on the boundary, where it is $0$`, md`$V_3$ is constant on each conductor`, md`$\nabla V_3 = 0$ everywhere`, md`$V_3$ is the difference of two equal functions`], 0,
        [null, md`That's an ingredient of the second theorem (Lesson 5). Here the boundary values themselves are given, so $V_3 = 0$ there.`,
          md`That's a conclusion, not an ingredient.`,
          md`That's what you're trying to prove; assuming it is circular.`],
        md`Harmonic functions take their max and min on the boundary (the mean value property). $V_3$ is harmonic and is $0$ on the whole boundary, so $0\le V_3\le 0$ everywhere inside.`,
        { figHtml: fBlob({ in1: md`$V_3 = V_1 - V_2$`, in2: '\\nabla^2 V_3 = 0', out: md`$V_3 = 0$ on the surface` }) }),

      RF(md`
        ### With charge inside: Poisson

        The same proof works when the region contains charge, as long as both solutions have the **same** $\rho$:
        $$\nabla^2V_1 = -\frac{\rho}{\varepsilon_0},\qquad \nabla^2V_2 = -\frac{\rho}{\varepsilon_0}\quad\Longrightarrow\quad \nabla^2V_3 = 0.$$
        $V_3$ again obeys Laplace's equation and vanishes on the boundary, so $V_3 = 0$.

        [[fig:islands]]

        !!key Corollary: the licence to guess
          The potential in a volume is uniquely determined if (a) the charge density throughout the region and (b) the value of $V$ on all boundaries are specified.

          So if you find **any** function that satisfies Poisson's equation in the region and takes the right values on every boundary, it is **the** solution, however you found it: a guess, symmetry, superposition, a trick.
      `, { islands: { svg: fIslands(), cap: md`The boundary may have several pieces, here the outer surface and an island (a conductor at $V_1$). $V$ must be given on all of them, and $\rho$ throughout the shaded region.` } }),

      Q(md`In the Poisson version of the proof, why does $V_3 = V_1 - V_2$ satisfy Laplace's equation even though the region contains charge?`,
        [md`Because $V_3$ is zero on the boundary`, md`Because both solutions have the same $\rho$, which cancels in $\nabla^2V_1 - \nabla^2V_2$`, md`Because the charge sits only on the boundary`, md`Because the Laplacian of a difference is always zero`], 1,
        [md`Zero on the boundary is a separate fact (step 2). $\nabla^2V_3 = 0$ is a statement about the inside.`, null,
          md`The region can contain charge; that's the point of extending the theorem to Poisson's equation.`,
          md`$\nabla^2(V_1-V_2) = \nabla^2V_1 - \nabla^2 V_2$, which is zero only because the two right-hand sides are equal.`],
        md`$\nabla^2V_3 = -\rho/\varepsilon_0 - (-\rho/\varepsilon_0) = 0$. This is why uniqueness needs the charge density to be given: two potentials from different $\rho$'s are answers to different problems.`,
        { figHtml: fIslands() }),

      Q(md`Two potentials take the same values on the walls of a box, but they come from different charge densities inside ($\rho_1\ne\rho_2$). Must they be equal inside?`,
        [md`Yes, by the uniqueness theorem`, md`Yes, but only if the box is closed`, md`No: $\nabla^2V_3 = -(\rho_1-\rho_2)/\varepsilon_0 \ne 0$, so $V_3$ can have an interior extremum`, md`No, because two different $\rho$'s can't give the same wall values`], 2,
        [md`The theorem needs the boundary values **and** $\rho$ in the region. Different $\rho$ means a different problem.`,
          md`Closing the box doesn't help: the difference obeys Poisson's equation with source $\rho_1-\rho_2$.`, null,
          md`They can: a grounded box has $V = 0$ on its walls whether or not there's a charge inside.`],
        md`Example: an empty grounded box and the same box with a charge $q$ inside. Both have $V = 0$ on the walls; inside, one is $0$ everywhere and the other has a peak at $q$. Same $\rho$ plus same boundary values gives the same $V$; change either and all bets are off.`,
        { figHtml: fTwoBoxes() }),

      Q(md`Which reasoning is a valid use of the uniqueness theorem?`,
        [md`"My guess satisfies the boundary conditions, so it's the solution."`, md`"My guess satisfies Poisson's equation in the region, so it's the solution."`, md`"My guess has the right symmetry, so it's the solution."`, md`"My guess satisfies Poisson's equation with the given $\rho$ in the region and takes the given values on every boundary, so it's the solution."`], 3,
        [md`The equation is needed too. $V = 0$ meets "grounded walls" but not Poisson's equation if there's a charge inside.`,
          md`Infinitely many functions satisfy the equation; the boundary values pick one.`,
          md`Symmetry is a good way to guess, but the guess still has to be checked against the equation and every boundary value.`, null],
        md`The corollary has two requirements: the equation (with the right $\rho$) in the region and the right values on all boundaries. Meet both and the guess is the answer.`,
        { nofig: 'logic of the theorem' }),

      RF(md`
        ### Guess and check

        **An empty cavity in a conductor (Griffiths Ex. 3.1).**

        Boundary conditions:
        1. $V = V_0$ on the cavity wall (it's part of one conductor, so it's all at one potential).

        Try $V = V_0$ everywhere in the cavity. A constant satisfies Laplace's equation and has the right boundary value, so by uniqueness it's the solution. $\vb E = 0$ in an empty cavity, whatever goes on outside: a closed metal box shields its inside.

        [[fig:cavity]]

        **Symmetry plus superposition: a cube with one face at $V_0$.** No charge inside. What is $V$ at the center $C$?

        Boundary conditions:
        1. $V = V_0$ on the top face.
        2. $V = 0$ on the other five faces.

        Rotate the problem so each face takes its turn at $V_0$: six problems. Add their solutions. The sum satisfies Laplace's equation and equals $V_0$ on **every** face, and the unique solution of that problem is $V = V_0$ everywhere. Uniqueness also says each rotated problem's solution is just the rotated function, so all six give the same value at the center. Hence $6V_C = V_0$ and $V_C = V_0/6$, with no series at all. (Units 6 and 7 get the same number from a double Fourier series.)

        [[fig:cube]]
      `, {
        cavity: { svg: fCavity(), cap: md`A charge-free cavity inside a conductor. Its wall is an equipotential.` },
        cube: { svg: fCubeFaces(false), cap: md`One face at $V_0$ (shaded), five grounded; $C$ is the center.` },
      }),

      Q(md`A charge-free cavity sits inside a solid piece of metal. A large charge $Q$ is brought near the outside. What is the field inside the cavity?`,
        [md`Zero`, md`It points away from $Q$`, md`It points toward $Q$`, md`It depends on the cavity's shape`], 0,
        [null, md`The metal rearranges its charge so the whole conductor, cavity wall included, is one equipotential. Inside the cavity $V$ = constant is the unique solution.`,
          md`Same reason: no field reaches the cavity.`,
          md`Any shape works: $V = V_0$ satisfies Laplace's equation and the constant boundary value for every cavity shape.`],
        md`Cavity wall at a constant $V_0$, no charge inside: $V = V_0$ is a solution, so it's the solution, and $\vb E = -\nabla V = 0$. Bringing $Q$ near changes the value of $V_0$, not the fact that $V$ is constant inside.`,
        { figHtml: fCavity({ Q: true }) }),

      Q(md`Now a point charge $q$ sits in the cavity, and you move the outside charge $Q$ around. Does the field inside the cavity change?`,
        [md`Yes, it follows $Q$`, md`No: inside, $V$ solves Poisson's equation with source $q$ and a constant value on the wall; moving $Q$ only changes that constant`, md`Yes, unless $q = -Q$`, md`No, because the field in a cavity is always zero`], 1,
        [md`The metal shields the cavity. The only way the outside reaches the inside is through the wall's potential, and that's a constant.`, null,
          md`The relation between $q$ and $Q$ doesn't matter for the shielding.`,
          md`Zero only for an empty cavity. With $q$ inside there is a field, with lines from $q$ to the wall.`],
        md`Boundary conditions for the cavity: $V = V_0$ (some constant) on the wall; source: $q$. Changing $V_0$ adds a constant to $V$ and leaves $\vb E$ alone. So $\vb E$ in the cavity is fixed by $q$ and the cavity's shape alone.`,
        { figHtml: fCavity({ q: true, Q: true }) }),

      Q(md`A cube has two opposite faces held at $V_0$ and the other four grounded, with no charge inside. What is $V$ at the center $C$?`,
        [md`$V_0/6$`, md`$V_0/2$`, md`$V_0/3$`, md`$2V_0/3$`], 2,
        [md`$V_0/6$ is what one live face gives. Here two faces each contribute that.`,
          md`$V_0/2$ would need half of the boundary at $V_0$. Only 2 of the 6 faces are.`, null,
          md`That's $4V_0/6$, counting the grounded faces instead of the live ones.`],
        md`One face at $V_0$ with the rest grounded gives $V_0/6$ at the center. This problem is the sum of two such problems (superposition: add the solutions, and the boundary values add), so $V_C = 2\cdot V_0/6 = V_0/3$.`,
        { figHtml: fCubeFaces(true) }),

      Q(md`Region between two concentric spheres: the inner one at $V_0$, the outer one grounded, no charge between. You find $V = A + B/r$ fitting both spheres. A classmate's computer simulation gives a potential that also matches both spheres but varies slightly with $\theta$. What do you conclude?`,
        [md`Both are valid solutions`, md`Yours is wrong because it ignores $\theta$`, md`The simulation is right because it uses more information`, md`The $\theta$-dependence must be numerical error: yours satisfies everything, and the solution is unique`], 3,
        [md`Two different functions can't both satisfy Laplace's equation and the same boundary values: that's the theorem.`,
          md`Nothing in the boundary data depends on $\theta$, and your solution satisfies Laplace and both boundary values, which is all that's required.`,
          md`The simulation uses the same information (Laplace plus the two sphere values). If it disagrees with an exact solution, it's in error.`, null],
        md`Check yours: $\nabla^2(A + B/r) = 0$ for $r>0$, and $A$, $B$ were fitted to both spheres. That makes it the solution. A different answer from the same data must be wrong.`,
        { figHtml: fConc() }),

      P({
        id: 'u4-p-conc', title: 'Concentric spheres by guessing',
        q: md`A metal sphere of radius $a$ is held at $V_0$. A thin concentric metal shell of radius $b > a$ is grounded. There's no charge between them. Find $V(r)$ for $a \le r \le b$ and the field $E_r(r)$ there.`,
        figHtml: fConc(),
        hints: [
          md`List the boundary conditions first. The region $a<r<b$ is charge-free and nothing depends on angle, so guess $V = A + B/r$, the general spherically symmetric solution of Laplace's equation.`,
          md`Two conditions, two constants: $A + B/a = V_0$ and $A + B/b = 0$.`,
          md`$E_r = -dV/dr$.`,
        ],
        parts: [
          { lbl: md`V(r)`, expr: 'V0*a*(b - r)/(r*(b - a))', vars: { V0: [1, 3], a: [0.5, 1], b: [2, 3], r: [1.1, 1.9] }, accepts: ['V0*a/(b-a)*(b/r - 1)'] },
          { lbl: md`E_r(r)`, expr: 'V0*a*b/((b - a)*r^2)', vars: { V0: [1, 3], a: [0.5, 1], b: [2, 3], r: [1.1, 1.9] } },
          { lbl: md`Why can't the true potential depend on $\theta$?`, mc: [md`It can; the guess just ignores it`, md`The guess satisfies Laplace's equation and both boundary conditions, so by uniqueness it is the solution, and it has no $\theta$ in it`, md`Spheres are symmetric, so $V$ must be too`, md`$\vb E$ must be radial at a conductor's surface`], a: 1,
            why: [md`If it could, there would be two solutions with the same data, which the theorem rules out.`, null, md`Symmetry makes the guess natural; uniqueness is what proves no other answer exists.`, md`$\vb E$ is normal at each conductor, but that alone doesn't rule out $\theta$-dependence in between.`] },
        ],
        sol: md`
          **Boundary conditions.**
          1. $V(a) = V_0$ (inner sphere held at $V_0$).
          2. $V(b) = 0$ (outer shell grounded).

          **Guess.** Charge-free region, no angle dependence in the data: try $V = A + B/r$. It satisfies Laplace's equation for $r>0$, since $r^2\,dV/dr = -B$ is constant.

          **Fit.** $A + B/a = V_0$ and $A + B/b = 0$. Subtract: $B\left(\tfrac1a - \tfrac1b\right) = V_0$, so $B = \dfrac{V_0ab}{b-a}$ and $A = -\dfrac{B}{b} = -\dfrac{V_0 a}{b-a}$:
          $$V(r) = \frac{V_0 a}{b-a}\left(\frac{b}{r} - 1\right) = \frac{V_0\,a\,(b-r)}{r\,(b-a)}.$$

          **Field.** $E_r = -\dfrac{dV}{dr} = \dfrac{V_0ab}{(b-a)\,r^2}$, outward for $V_0>0$.

          **Uniqueness.** The guess satisfies Laplace's equation in the region and both boundary conditions, so it is the solution; no $\theta$ or $\phi$ dependence can appear.

          **Checks.** $V(a) = V_0$ and $V(b) = 0$. As $b\to\infty$, $V \to V_0a/r$, the isolated sphere. The field is $Q/(4\pi\varepsilon_0r^2)$ with $Q = 4\pi\varepsilon_0V_0\,\dfrac{ab}{b-a}$ on the inner sphere: capacitance $4\pi\varepsilon_0\,\dfrac{ab}{b-a}$, as in Unit 3.
        `,
      }),

      RF(md`
        ### Other kinds of boundary data

        $V$ itself isn't the only acceptable data. On each piece of the boundary you may instead give:

        - the normal derivative $\dfrac{\partial V}{\partial n} = \hat{\mathbf n}\cdot\nabla V = -E_n$, a **Neumann** condition (giving $V$ is a **Dirichlet** condition). On a conductor's surface this is the same as giving $\sigma$, because $\sigma = -\varepsilon_0\,\dfrac{\partial V}{\partial n}$ with $\hat{\mathbf n}$ pointing out of the metal;
        - for a conductor, its total charge (Lesson 5).

        Mixed is fine: $V$ on some pieces and $\partial V/\partial n$ on others (HW 3.5 below proves it). If only $\partial V/\partial n$ is given everywhere, $\vb E$ is unique but $V$ is fixed only up to an additive constant, exactly like two slope conditions in 1-D.

        | Data on the boundary | $\vb E$ unique? | $V$ unique? |
        |---|---|---|
        | $V$ on every piece (Dirichlet) | yes | yes |
        | $V$ on some pieces, $\partial V/\partial n$ on the rest | yes | yes |
        | $\partial V/\partial n$ on every piece (Neumann) | yes | up to a constant |
        | some piece with no condition | no | no |
        | $V$ and $\partial V/\partial n$ on the same piece | usually no solution exists | |
      `),

      Q(md`A closed box contains no charge. Which set of boundary data does **not** determine $V$ uniquely inside?`,
        [md`$V$ on all six faces`, md`$V$ on five faces and $\partial V/\partial n$ on the sixth`, md`$V$ on one face and $\partial V/\partial n$ on the other five`, md`$V$ on five faces, and nothing about the sixth`], 3,
        [md`That's the first uniqueness theorem exactly.`, md`Mixed conditions are fine: on each face either $V$ or $\partial V/\partial n$ (HW 3.5).`,
          md`Still one condition on every face, and $V$ given somewhere fixes the additive constant.`, null],
        md`Every piece of boundary needs a condition. With the sixth face unspecified, you could set $V$ there to anything you like and get a different interior solution for each choice.`,
        { figHtml: fBox3() }),

      Q(md`Same box, but you're given only $\partial V/\partial n$ on all six faces (consistent with Gauss's law). What is determined?`,
        [md`$V$, uniquely`, md`Nothing`, md`$V$ on the faces, but not inside`, md`$\vb E$ uniquely; $V$ only up to an additive constant`], 3,
        [md`If $V$ works, so does $V + 7$ V: the same derivatives everywhere. Only derivatives are given, so the constant is free.`,
          md`The field is fixed: the difference of two solutions has $\nabla V_3 = 0$ (HW 3.5).`,
          md`Even the face values are only known up to that same constant.`, null],
        md`HW 3.5 shows $\nabla V_3 = 0$, so $\vb E_1 = \vb E_2$. $V_3$ is a constant that nothing pins down, just as two slope conditions in 1-D leave $b$ free. Give $V$ at even one point (or on one face) and $V$ is fixed too.`,
        { figHtml: fBox3() }),

      Q(md`Someone specifies both $V$ and $\partial V/\partial n$ on every face of the box. What's wrong with that?`,
        [md`Nothing; more data is always better`, md`It's too little information`, md`It's too much: $V$ on the faces already fixes the solution, and therefore its normal derivative; an arbitrary $\partial V/\partial n$ will usually contradict it`, md`$\partial V/\partial n$ can never be specified for Laplace's equation`], 2,
        [md`Extra conditions are harmless only if they agree with what the others already force; in general they won't, and then no solution exists.`,
          md`$V$ on every face alone is already enough (first theorem).`, null,
          md`It can (Neumann conditions), just not on top of $V$ on the same face.`],
        md`It's the 3-D version of specifying the value and the slope at both ends in 1-D: redundant at best, contradictory at worst. The right amount is one condition per piece of boundary: $V$ or $\partial V/\partial n$, not both.`,
        { figHtml: fBox3() }),

      Q(md`You want $V$ everywhere outside a metal sphere held at $V_0$, out to infinity. The sphere is one piece of the boundary. What is the other?`,
        [md`Infinity, where $V\to 0$`, md`Nothing else; the sphere is the whole boundary`, md`The sphere's center`, md`A large sphere on which $\partial V/\partial n = 0$`], 0,
        [null, md`The region reaches infinity, which is part of its boundary. Without a condition there, $V = V_0$ everywhere would also fit Laplace and the sphere's value.`,
          md`The center isn't in the region; it's inside the metal.`,
          md`That would say no flux leaves, i.e. no net charge, yet a sphere at $V_0\ne0$ is charged. The standard outer condition is $V\to 0$.`],
        md`With $V\to 0$ at infinity, $V = V_0R/r$ satisfies Laplace's equation for $r>R$, equals $V_0$ on the sphere and vanishes at infinity: it's the solution. Without the condition at infinity, the constant $V = V_0$ would fit as well, and uniqueness would fail.`,
        { figHtml: fSphereV0() }),

      P({
        id: 'HW4-3.5', src: 'HW 4 · Griffiths 3.5', title: 'Uniqueness with V or its normal derivative on each boundary', big: true,
        q: md`Prove that the field is uniquely determined when the charge density $\rho$ is given and either $V$ or the normal derivative $\partial V/\partial n$ is specified on each boundary surface. Do not assume the boundaries are conductors, or that $V$ is constant over any given surface.`,
        figHtml: fHW35(),
        hints: [
          md`Same strategy as both uniqueness theorems: suppose two solutions $V_1$, $V_2$ and study $V_3 = V_1 - V_2$. What equation does $V_3$ satisfy, and what do you know about it on each boundary piece?`,
          md`You can't use "$V_3$ is constant on each surface": the boundaries aren't conductors. Use the product rule $\nabla\cdot(V_3\nabla V_3) = (\nabla V_3)^2 + V_3\nabla^2V_3$, integrate over the volume, and apply the divergence theorem.`,
          md`The surface term is $\oint V_3\,\dfrac{\partial V_3}{\partial n}\,da$. At every boundary point one of the two factors is zero.`,
        ],
        parts: [
          { lbl: md`In the volume, $V_3 = V_1 - V_2$ satisfies:`, mc: [md`$\nabla^2V_3 = -\rho/\varepsilon_0$`, md`$\nabla^2V_3 = -2\rho/\varepsilon_0$`, md`$\nabla^2V_3 = 0$`, md`$\nabla V_3 = 0$`], a: 2,
            why: [md`That's what each of $V_1$, $V_2$ satisfies. Subtract: the $\rho$ terms cancel.`, md`That would be the sum $V_1 + V_2$.`, null, md`That's the conclusion, not a starting fact. At this stage you only know the Laplacian.`] },
          { lbl: md`On a boundary piece where $\partial V/\partial n$ is specified, you know:`, mc: [md`$V_3 = 0$ there`, md`$\partial V_3/\partial n = 0$ there`, md`$V_3$ is constant there`, md`nothing about $V_3$`], a: 1,
            why: [md`$V_1$ and $V_2$ may differ there; only their normal derivatives agree.`, null, md`That's true on a conductor, which you may not assume.`, md`Both solutions have the same specified normal derivative, so the difference has zero normal derivative.`] },
          { lbl: md`$\nabla\cdot(V_3\nabla V_3)$ equals:`, mc: [md`$(\nabla V_3)^2 + V_3\nabla^2V_3$`, md`$V_3\nabla^2V_3$`, md`$2V_3\nabla V_3$`, md`$(\nabla V_3)^2 - V_3\nabla^2 V_3$`], a: 0,
            why: [null, md`You dropped the term where the divergence hits $V_3$: $\nabla V_3\cdot\nabla V_3$.`, md`That's the gradient of $V_3^2$, a vector, not a divergence.`, md`Product rule: $\nabla\cdot(f\vb A) = f\,\nabla\cdot\vb A + \vb A\cdot\nabla f$. Both terms enter with $+$.`] },
          { lbl: md`Why does $\oint_S V_3\,\dfrac{\partial V_3}{\partial n}\,da$ vanish?`, mc: [md`$V_3$ is constant on each surface and $\oint\partial V_3/\partial n\,da = 0$`, md`$V_3 = 0$ on every boundary`, md`At every boundary point either $V_3 = 0$ or $\partial V_3/\partial n = 0$, so the integrand vanishes point by point`, md`Gauss's law gives $\oint\nabla V_3\cdot d\vb a = 0$`], a: 2,
            why: [md`That's the conductor argument of the second theorem. The problem forbids assuming $V$ is constant on a surface.`, md`Only on the pieces where $V$ is specified. Where $\partial V/\partial n$ is specified, $V_3$ needn't vanish.`, null, md`Zero total flux doesn't make $\oint V_3\,\partial_nV_3\,da$ zero when $V_3$ varies over the surface.`] },
          { lbl: md`What exactly does the proof establish?`, mc: [md`$V$ is unique in every case`, md`$\vb E$ is unique; $V$ is unique up to a constant, and fully unique if $V$ is specified on at least one boundary piece`, md`$\vb E$ is unique only if the boundaries are conductors`, md`Only $\rho$ is unique`], a: 1,
            why: [md`With $\partial V/\partial n$ given everywhere, $V + c$ satisfies all the data too.`, null, md`The proof never uses conductors; that's the point of the problem.`, md`$\rho$ was given, not derived.`] },
        ],
        sol: md`
          **Boundary conditions.** The region $\mathcal V$ has boundary pieces $S_1, S_2, \dots$ (the outer surface and any inner surfaces). On each piece, or each part of a piece, exactly one is given:
          1. $V$ (Dirichlet), or
          2. $\partial V/\partial n = \hat{\mathbf n}\cdot\nabla V$ (Neumann), with $\hat{\mathbf n}$ pointing out of $\mathcal V$.

          Suppose $V_1$ and $V_2$ both satisfy
          $$\nabla^2 V_1 = -\frac{\rho}{\varepsilon_0},\qquad \nabla^2 V_2 = -\frac{\rho}{\varepsilon_0}\quad\text{in }\mathcal V,$$
          and both meet the given boundary data.

          **Step 1: the difference.** $V_3 \equiv V_1 - V_2$ satisfies $\nabla^2V_3 = 0$ in $\mathcal V$ (the same $\rho$ cancels). Where $V$ is given, $V_3 = 0$. Where $\partial V/\partial n$ is given, $\partial V_3/\partial n = 0$.

          **Step 2: the identity.** Product rule with $f = V_3$ and $\vb A = \nabla V_3$:
          $$\nabla\cdot(V_3\nabla V_3) = \nabla V_3\cdot\nabla V_3 + V_3\nabla^2V_3 = (\nabla V_3)^2,$$
          since $\nabla^2V_3 = 0$.

          **Step 3: integrate** over $\mathcal V$ and use the divergence theorem on the left:
          $$\int_{\mathcal V}(\nabla V_3)^2\,d\tau = \oint_S V_3\,\nabla V_3\cdot d\vb a = \oint_S V_3\,\frac{\partial V_3}{\partial n}\,da.$$

          **Step 4: the surface term vanishes.** At every point of $S$, either $V$ was specified there (so $V_3 = 0$) or $\partial V/\partial n$ was (so $\partial V_3/\partial n = 0$). The integrand is zero at every point, so the integral is zero. No assumption that $V_3$ is constant on a surface is needed: it vanishes point by point. (If the region extends to infinity, that part of the surface term also vanishes: $V_3\sim 1/r$ and $\partial V_3/\partial n\sim 1/r^2$, while the area grows only like $r^2$.)

          **Step 5: conclude.** $\displaystyle\int_{\mathcal V}(\nabla V_3)^2\,d\tau = 0$ and the integrand is never negative, so $\nabla V_3 = 0$ everywhere in $\mathcal V$. Then $\vb E_3 = -\nabla V_3 = 0$, i.e. $\vb E_1 = \vb E_2$: the field is unique. $\square$

          [[fig:proof]]

          **What about $V$ itself?** $\nabla V_3 = 0$ makes $V_3$ a constant. If $V$ is specified on at least one piece of the boundary, $V_3 = 0$ there, so the constant is $0$ and $V$ is unique too. If only $\partial V/\partial n$ is given everywhere, $V$ is unique up to an additive constant. (Pure Neumann data can't be arbitrary either: Gauss's law requires $\oint\dfrac{\partial V}{\partial n}\,da = -\dfrac{\Qenc}{\varepsilon_0}$.)

          **Why this works / what to remember.** Every uniqueness proof has the same skeleton: two solutions, look at the difference, show the difference is harmonic with "zero" boundary data, then show a harmonic function with zero data vanishes. Lecture 9 did the last step two ways: the no-extrema argument (first theorem, $V_3 = 0$ on $S$) and the integral of $E_3^2$ (second theorem). This problem uses the integral, which also handles derivative data, where the no-extrema argument can't.
        `,
        figs: { proof: { svg: fHW35(), cap: md`Mixed data: $V$ given on $S_1$, $\partial V/\partial n$ given on $S_2$. On every point of the boundary one factor of $V_3\,\partial V_3/\partial n$ vanishes.` } },
      }),

      RF(md`
        !!method Patterns from this lesson
          - Uniqueness proof skeleton: two solutions, take the difference $V_3$; it's harmonic with zero boundary data; so it's zero.
          - Corollary (the licence to guess): if a function satisfies Poisson's equation with the given $\rho$ and every boundary condition, it's the answer, however you found it.
          - Empty cavity in a conductor: $V$ constant, $\vb E = 0$. With a charge inside, the cavity field depends only on that charge and the cavity's shape.
          - Symmetry plus superposition plus uniqueness gives exact numbers: $V_0/6$ at the center of a cube with one face at $V_0$.
          - One condition per piece of boundary: $V$ (Dirichlet) or $\partial V/\partial n$ (Neumann); mixed is fine; Neumann everywhere fixes $\vb E$ but leaves $V$ up to a constant; both on one piece is too much.
          - Unbounded region: infinity is part of the boundary, usually with $V\to 0$.
      `),
    ],
  };

  // ================================================================== Lesson 5 figures
  const fCond4 = () => {
    const f = PF.fig();
    const cx = 200, cy = 110;
    const sh = [0.04, 0.03, 0.02], sp = [0.3, 1.0, 2.0];
    f.poly(potato(cx, cy, 180, 96, sh, sp), { cls: 'thick' });
    f.poly(potato(cx, cy, 166, 84, sh, sp), { cls: 'dash' });
    [[86, 100, 'Q_a', 'b'], [196, 62, 'Q_b', 'b'], [296, 84, 'Q_c', 'b'], [150, 152, 'Q_d', 'r']].forEach(([x, y, lab, at], k) => {
      const ph = [0.3 + k, 1.1 + k, 2.2 + k];
      metal(f, potato(x, y, 19, 13, [0.12, 0.08, 0.05], ph));
      f.poly(potato(x, y, 30, 23, [0.08, 0.05, 0.03], ph), { cls: 'dash dim' });
      if (at === 'b') f.label(x, y + 30, lab, 't', 'small'); else f.label(x + 36, y, lab, 'l', 'small');
    });
    f.label(262, 140, '\\rho(\\vb r)', 'c');
    f.arrow(372, 214, 344, 186, { cls: 'dim' }); f.text(376, 218, 'outer boundary', 'tl');
    f.arrow(338, 18, 314, 62, { cls: 'dim' }); f.text(342, 14, 'Gaussian surface', 'bl');
    return f.svg();
  };
  const fPurcell = (mode) => {
    const f = PF.fig();
    const P4 = [[110, 40, '+'], [140, 40, '-'], [110, 140, '-'], [140, 140, '+']];
    if (mode !== 'bare') {
      f.pl([[103, 40], [60, 40]].concat(f.arcPts(60, 90, 50, 50, 90, 270), [[93, 140], [103, 140]]));
      f.pl([[147, 40], [190, 40]].concat(f.arcPts(190, 90, 50, 50, 90, -90), [[157, 140], [147, 140]]));
    }
    P4.forEach(([x, y, s]) => f.charge(x, y, { q: mode === 'zero' ? '' : s }));
    return f.svg();
  };
  const fSphereIso = () => {
    const f = PF.fig();
    disk(f, 90, 74, 44);
    f.label(90 + 44 * 0.72 + 8, 74 - 44 * 0.72 - 8, 'Q', 'bl', 'small');
    f.text(90, 74 + 44 + 12, 'isolated', 't');
    return f.svg();
  };

  // ================================================================== Lesson 5
  const L5 = {
    id: 'u4-unique2', title: 'Conductors and the second uniqueness theorem',
    steps: [
      RF(md`
        ### Conductors with given charges

        Often you don't know a conductor's potential but its charge: "put $Q_a$ on this one and $Q_b$ on that one". You don't control how the charge spreads over each surface; it rearranges itself. Is the field still determined?

        !!key Second uniqueness theorem
          In a volume surrounded by conductors and containing a specified charge density $\rho$, the electric field is uniquely determined if the total charge on each conductor is given. (The region as a whole can be bounded by another conductor, or unbounded.)

        [[fig:cond]]

        **Proof sketch (Lecture 9).** Suppose two fields $\vb E_1$ and $\vb E_2$ both fit.
        - Between the conductors both obey Gauss's law in differential form: $\nabla\cdot\vb E_1 = \nabla\cdot\vb E_2 = \rho/\varepsilon_0$.
        - For a surface enclosing conductor $i$: $\oint\vb E_1\cdot d\vb a = \oint\vb E_2\cdot d\vb a = Q_i/\varepsilon_0$.
        - For the outer boundary: $\oint\vb E\cdot d\vb a = Q_{\text{tot}}/\varepsilon_0$ for both, where $Q_{\text{tot}} = \sum_n Q_n + \int\rho\,d\tau$.

        Let $\vb E_3 = \vb E_1 - \vb E_2$. Then $\nabla\cdot\vb E_3 = 0$ between the conductors, and $\oint\vb E_3\cdot d\vb a = 0$ over every one of those surfaces.

        One more fact: each conductor is an equipotential, so $V_3 = V_1 - V_2$ is constant over each conductor (a different constant on each, not necessarily zero).

        Product rule:
        $$\nabla\cdot(V_3\vb E_3) = V_3\,(\nabla\cdot\vb E_3) + \vb E_3\cdot\nabla V_3 = 0 - E_3^2,$$
        using $\nabla\cdot\vb E_3 = 0$ and $\nabla V_3 = -\vb E_3$. Integrate over the region and use the divergence theorem:
        $$-\int_{\mathcal V} E_3^2\,d\tau = \oint_{\text{all boundaries}} V_3\,\vb E_3\cdot d\vb a = \sum_{\text{surfaces}} V_3\oint\vb E_3\cdot d\vb a = 0.$$
        $V_3$ comes out of each surface integral because it is constant on that surface (and $V_3\to 0$ at infinity), and each remaining flux is zero. Since $E_3^2\ge 0$, $\int E_3^2\,d\tau = 0$ forces $\vb E_3 = 0$ everywhere: $\vb E_1 = \vb E_2$. $\square$

        !!trap Slips in the notes (L9-4)
          - The last line reads $= \int (E_3)^2\,d\tau$; the product rule gives $-\int E_3^2\,d\tau$. The conclusion is the same, since the integral is zero either way.
          - The surface integral should run over every boundary (each conductor and the outer surface), not only $S_{\text{outer}}$, and the $\vb E$ in the second line should be $\vb E_3$.

        !!key What the second theorem fixes
          $\vb E$, and so $V$ up to one additive constant. If $V$ is pinned anywhere ($V\to 0$ at infinity, or a grounded conductor), $V$ is fixed too, and with it each conductor's potential and surface charge $\sigma = \varepsilon_0E_n$.
      `, { cond: { svg: fCond4(), cap: md`Lecture 9's picture: conductors with total charges $Q_a,\dots,Q_d$, a given $\rho$ between them, and Gaussian surfaces (dashed) around each conductor and just inside the outer boundary.` } }),

      Q(md`Conductors with given total charges $Q_a, \dots, Q_d$, a given $\rho$ between them, and $V\to 0$ at infinity. What does the second uniqueness theorem guarantee?`,
        [md`The charge distribution on each conductor, but not the field`, md`The field $\vb E$ everywhere in the region (and so $V$, given $V\to0$ at infinity)`, md`Only the potential of each conductor`, md`Nothing, unless the conductors' potentials are given too`], 1,
        [md`It's the other way round: the field is what the proof shows to be unique. The surface charges then follow from $\sigma = \varepsilon_0E_n$.`, null,
          md`It gives much more: $\vb E$ at every point.`,
          md`Potentials are the first theorem's data. The second shows that total charges can replace them.`],
        md`Two candidate fields $\vb E_1$, $\vb E_2$ must be equal. With $V\to 0$ at infinity fixing the constant, $V$ is unique too, and so is each conductor's potential and each $\sigma = \varepsilon_0 E_n$ at its surface.`,
        { figHtml: fCond4() }),

      Q(md`Why is $\oint \vb E_3\cdot d\vb a = 0$ over a surface hugging conductor $i$?`,
        [md`Because every conductor is neutral`, md`Because $V_3$ is constant on that surface`, md`Because both fields enclose the same total charge $Q_i$, so by Gauss's law both fluxes are $Q_i/\varepsilon_0$`, md`Because $\vb E_3$ is tangent to the surface`], 2,
        [md`The $Q_i$ can be anything; what matters is that it's the same $Q_i$ for both solutions.`,
          md`Constancy of $V_3$ is a separate ingredient: it lets $V_3$ out of the integral.`, null,
          md`At a conductor's surface the field is normal, not tangent, and the flux of each field is $Q_i/\varepsilon_0$, not zero.`],
        md`$\oint\vb E_1\cdot d\vb a = Q_i/\varepsilon_0 = \oint\vb E_2\cdot d\vb a$, so the difference has zero flux. This is exactly where "the total charge is given" enters the proof.`,
        { figHtml: fCond4() }),

      Q(md`Why can $V_3$ be pulled out of each surface integral $\oint V_3\,\vb E_3\cdot d\vb a$?`,
        [md`Each conductor is an equipotential, so $V_3 = V_1 - V_2$ is constant over each conductor's surface`, md`$V_3 = 0$ on every conductor`, md`$V_3$ is constant everywhere in the region`, md`$\vb E_3$ is perpendicular to the surface`], 0,
        [null, md`Not necessarily zero: the two solutions may give a conductor different potentials. Constant is enough.`,
          md`That's the conclusion (once $\vb E_3 = 0$), not an input.`,
          md`$\vb E_3$ is normal to each conductor, but that alone doesn't let $V_3$ out of the integral; constancy does.`],
        md`$V_1$ is constant on conductor $i$, and so is $V_2$: each is an equipotential in both solutions. Their difference is a constant $c_i$, so $\oint V_3\,\vb E_3\cdot d\vb a = c_i\oint\vb E_3\cdot d\vb a = 0$.`,
        { figHtml: fCond4() }),

      Q(md`The product rule gives $\nabla\cdot(V_3\vb E_3) = V_3(\nabla\cdot\vb E_3) + \vb E_3\cdot\nabla V_3$. In the region between the conductors this equals:`,
        [md`$+E_3^2$`, md`$0$`, md`$V_3E_3^2$`, md`$-E_3^2$`], 3,
        [md`$\nabla V_3 = -\vb E_3$, so $\vb E_3\cdot\nabla V_3 = -E_3^2$. (The lecture notes drop this minus sign on L9-4; the conclusion survives because the integral is zero either way.)`,
          md`The first term is $0$, since $\nabla\cdot\vb E_3 = 0$, but the second isn't.`,
          md`$V_3$ multiplies only the divergence term, which is zero.`, null],
        md`$\nabla\cdot\vb E_3 = 0$ and $\vb E_3\cdot\nabla V_3 = \vb E_3\cdot(-\vb E_3) = -E_3^2$. Integrating, $-\int E_3^2\,d\tau = \sum_i V_3\oint\vb E_3\cdot d\vb a = 0$, and an integral of a square that vanishes means the square is zero everywhere.`,
        { nofig: 'algebra step' }),

      Q(md`The second theorem shows $\vb E_1 = \vb E_2$. What does that say about $V_1$ and $V_2$?`,
        [md`$V_1 = V_2$ always`, md`$V_1 - V_2$ is a constant; it's zero if $V$ is pinned somewhere (a grounded conductor, or $V\to0$ at infinity)`, md`Nothing`, md`$V_1 = -V_2$`], 1,
        [md`Adding a constant to $V$ changes no field. With nothing grounded and no reference point, the constant is free.`, null,
          md`Equal gradients everywhere force the difference to be constant.`,
          md`Then $\vb E_1 = -\vb E_2$, which contradicts $\vb E_1 = \vb E_2$ unless both vanish.`],
        md`$\nabla(V_1-V_2) = 0$ in a connected region, so $V_1 - V_2 = c$. Any reference point fixes $c = 0$.`,
        { nofig: 'logic of the theorem' }),

      Q(md`Which of these problems needs the **second** theorem (the first alone doesn't cover it)?`,
        [md`Isolated conductors with known total charges, and $V\to0$ far away`, md`Conductors all held at known potentials`, md`A point charge inside a grounded box`, md`An empty cavity inside a conductor`], 0,
        [null, md`Known potentials on every boundary is exactly the first theorem.`,
          md`Poisson's equation with $V = 0$ on the walls: first theorem (its corollary).`,
          md`The cavity wall is at one constant potential: first theorem.`],
        md`The first theorem needs $V$ on the boundaries. When only the charges on the conductors are known, their potentials are unknown, and the second theorem is what guarantees the answer is still unique.`,
        { figHtml: fSphereIso() }),

      Q(md`Four small conductors carry charges $+Q, -Q, -Q, +Q$, each positive one next to a negative one (left). Now they are joined in pairs by thin wires (right): each wire links a $+Q$ conductor to the $-Q$ conductor on the same side. What happens?`,
        [md`Nothing: each charge already sits next to an opposite charge, so it stays put`, md`The charges pile up on the conductors nearest each other`, md`Charge flows through the wires until every conductor is neutral, and the field becomes zero everywhere`, md`Charge flows back and forth forever`], 2,
        [md`Plausible, but the second uniqueness theorem rules it out: see the solution.`,
          md`There's no way to create net charge; each joined pair has total charge zero.`, null,
          md`In electrostatics the charges settle, and the final static state is unique.`],
        md`After the wiring there are two conductors, each with total charge $+Q - Q = 0$. One field that fits these data is $\vb E = 0$ everywhere, with no charge anywhere. By the second uniqueness theorem it's the only one. So the charge flows through the wires and cancels (Purcell's example, Griffiths Figs. 3.7 to 3.9).

        [[fig:zero]]

        If the theorem feels "obvious", this example is the reminder that it isn't: the comfortable-looking arrangement is impossible.`,
        { figHtml: PF.row([{ svg: fPurcell('bare'), cap: 'four conductors' }, { svg: fPurcell('wired'), cap: 'joined in pairs' }]).svg,
          figs: { zero: { svg: fPurcell('zero'), cap: md`The final state: every conductor neutral, no field anywhere.` } } }),

      Q(md`An isolated metal sphere of radius $R$ carries charge $Q$. Why can you be sure the charge spreads uniformly over its surface?`,
        [md`Because like charges repel equally in all directions`, md`Because $\vb E = 0$ inside a conductor`, md`Because Gauss's law requires it`, md`Because a uniform $\sigma$ makes the sphere an equipotential with total charge $Q$ and $V\to0$ far away, so by the second uniqueness theorem it gives the field`], 3,
        [md`That's a hand-wave. The rigorous reason is uniqueness: a uniform distribution satisfies every condition, so any other would be a second solution, which can't exist.`,
          md`$\vb E = 0$ inside holds for a conductor of any shape, and on a non-spherical one $\sigma$ is not uniform. It doesn't single out uniform $\sigma$.`,
          md`Gauss's law gives the total flux; it can't tell a uniform distribution from a lopsided one.`, null],
        md`Symmetry arguments quietly use uniqueness. A uniform $\sigma$ meets all the conditions: Laplace's equation outside, the sphere an equipotential, total charge $Q$, $V\to0$ at infinity. If a lopsided arrangement also worked there would be two solutions, and there can't be.`,
        { figHtml: fSphereIso() }),

      P({
        id: 'u4-p-shell', title: 'A charged sphere inside a grounded shell',
        q: md`A metal sphere of radius $a = 5$ cm carries charge $Q = 2$ nC. It sits at the center of a thin metal shell of radius $b = 15$ cm, which is grounded. Find the potential of the inner sphere and the total charge on the shell, then answer the two questions about the field. Use $1/(4\pi\varepsilon_0) = 8.99\times10^9\ \text{N m}^2/\text{C}^2$.`,
        figHtml: fConc({ inner: 'Q', outer: 'V=0' }),
        hints: [
          md`List the conditions, one per conductor: the sphere is isolated with total charge $Q$; the shell is grounded, $V = 0$; and $V\to0$ far away.`,
          md`Between them, guess the field of a uniformly charged sphere, $E = Q/(4\pi\varepsilon_0 r^2)$, and fix the constant in $V$ with $V(b) = 0$.`,
          md`Outside the shell, which function is $0$ on the shell, $0$ at infinity, and harmonic in between?`,
        ],
        parts: [
          { lbl: md`V_{\text{sphere}}`, ans: 239.7, unit: 'V' },
          { lbl: md`Q_{\text{shell}}`, ans: -2, unit: 'nC' },
          { lbl: md`The field outside the shell ($r > b$) is:`, mc: [md`zero`, md`$Q/(4\pi\varepsilon_0 r^2)$`, md`$-Q/(4\pi\varepsilon_0 r^2)$`, md`$2Q/(4\pi\varepsilon_0 r^2)$`], a: 0,
            why: [null, md`That's what you'd get with an isolated (ungrounded) neutral shell. Grounding changes the outside.`, md`The shell's $-Q$ sits on its inner surface; the total enclosed charge for $r>b$ is $0$.`, md`No: the enclosed charge for $r>b$ is $Q - Q = 0$.`] },
          { lbl: md`The data were "charge $Q$ on the sphere" and "shell grounded". Is that enough to fix the field?`, mc: [md`No: you also need the sphere's potential`, md`No: you also need the shell's charge`, md`Yes: one condition per conductor (a charge on one, a potential on the other), plus $V\to 0$ far away`, md`Only because of the spherical symmetry`], a: 2,
            why: [md`That would be a second condition on the same conductor. Its potential comes out of the solution ($240$ V).`, md`The shell's potential is given; its charge is an output.`, null, md`Uniqueness doesn't care about symmetry; symmetry only made the guess easy.`] },
        ],
        sol: md`
          **Boundary conditions.**
          1. Inner sphere: isolated, total charge $Q$ (an equipotential at an unknown $V_a$).
          2. Shell: grounded, $V = 0$ (its charge is unknown).
          3. Far away: $V\to 0$.

          **Between them ($a<r<b$).** Guess: $Q$ spread uniformly over the sphere, so $E = \dfrac{Q}{4\pi\varepsilon_0r^2}$ and $V(r) = \dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1r - \dfrac1b\right)$. It satisfies Laplace's equation, is constant on the sphere, encloses $Q$, and vanishes at $r = b$: every condition holds, so it's the answer.
          $$V_a = \frac{Q}{4\pi\varepsilon_0}\left(\frac1a-\frac1b\right) = 8.99\times10^9\times2\times10^{-9}\times(20 - 6.67)\ \text{V} = 240\ \text{V}.$$

          **Outside ($r>b$).** Conditions: $V = 0$ on the shell, $V\to0$ at infinity, no charge in between. $V = 0$ satisfies all of them, so it's the solution: $\vb E = 0$ outside.

          **Charge on the shell.** A Gaussian surface inside the shell's metal has $\vb E = 0$ on it, so it encloses zero charge: the shell's inner surface carries $-Q$. Outside, $\vb E = 0$, so the outer surface carries nothing. Total on the shell: $-Q = -2$ nC, which flowed up from the ground.

          **What to remember.** Grounding fixed the shell's potential and let its charge adjust; the inner sphere was the other way round. One condition per conductor, of either kind, plus the condition at infinity.
        `,
      }),

      RF(md`
        !!method Patterns from this lesson
          - Second theorem: given $\rho$ and each conductor's total charge, $\vb E$ is unique; $V$ follows up to a constant, fixed by any reference.
          - Proof ingredients: $\nabla\cdot\vb E_3 = 0$; zero flux of $\vb E_3$ around each conductor (same $Q_i$); $V_3$ constant on each conductor; then $-\int E_3^2\,d\tau = 0$.
          - Symmetry arguments ("the charge must spread uniformly") are uniqueness in disguise.
          - Wiring conductors together changes the data: the total charge of the connected set is what counts (Purcell's example).
          - Grounded fixes $V$ and frees $Q$; isolated fixes $Q$ and frees $V$.
      `),
    ],
  };

  // ================================================================== Lesson 6 figures
  const dictFig = (k) => {
    const f = PF.fig();
    const cx = 50, cy = 40, r = 24;
    if (k === 'far') {
      f.charge(cx - 9, cy - 4, { q: '+', r: 5 }); f.charge(cx + 10, cy + 7, { q: '-', r: 5 });
      f.circle(cx, cy, 40, { cls: 'dash dim' });
      [40, 150, 270].forEach((a) => { const t = a * D2R; f.arrow(cx + 43 * Math.cos(t), cy - 43 * Math.sin(t), cx + 60 * Math.cos(t), cy - 60 * Math.sin(t), { cls: 'dim', hs: 5 }); });
      f.label(cx + 50, cy + 34, 'V\\to 0', 'tl', 'small');
      return f.svg();
    }
    disk(f, cx, cy, r);
    if (k === 'gnd') { f.line(cx, cy + r, cx, cy + r + 16); f.ground(cx, cy + r + 16); f.label(cx + r + 10, cy, 'V = 0', 'l', 'small'); }
    if (k === 'bat') {
      const y0 = cy + r;
      f.line(cx, y0, cx, y0 + 12);
      f.line(cx - 11, y0 + 12, cx + 11, y0 + 12); f.line(cx - 5, y0 + 18, cx + 5, y0 + 18, { cls: 'thick' });
      f.line(cx, y0 + 18, cx, y0 + 28); f.ground(cx, y0 + 28);
      f.label(cx + r + 10, cy, 'V = V_0', 'l', 'small');
    }
    if (k === 'iso') f.label(cx + r + 10, cy, 'Q', 'l', 'small');
    return f.svg();
  };
  const fDict = () => PF.row([
    { svg: dictFig('gnd'), cap: 'grounded' }, { svg: dictFig('bat'), cap: 'held at $V_0$ by a battery' },
    { svg: dictFig('iso'), cap: 'isolated, charge $Q$' }, { svg: dictFig('far'), cap: 'far away' },
  ]).svg;
  const fBoxSphere = (lab) => {
    const f = PF.fig();
    const x = 24, y = 22, w = 210, h = 120;
    frame(f, x, y, w, h);
    f.line(x + w / 2, y + h + 9, x + w / 2, y + h + 16); f.ground(x + w / 2, y + h + 16);
    f.label(x + w + 16, y + h / 2, 'V=0', 'l', 'small');
    disk(f, x + 90, y + 60, 30);
    f.label(x + 90 + 30 + 12, y + 60, lab, 'l', 'small');
    return f.svg();
  };
  const fBoxAB = () => {
    const f = PF.fig();
    const x = 24, y = 22, w = 230, h = 124;
    frame(f, x, y, w, h);
    f.line(x + w / 2, y + h + 9, x + w / 2, y + h + 16); f.ground(x + w / 2, y + h + 16);
    f.label(x + w + 16, y + h / 2, 'V=0', 'l', 'small');
    metal(f, potato(x + 62, y + 52, 30, 22, [0.08, 0.05, 0.03], [0.5, 1.5, 2.5]));
    f.label(x + 62, y + 52 + 36, 'A', 't');
    metal(f, potato(x + 162, y + 56, 34, 24, [0.08, 0.05, 0.03], [1.5, 0.5, 2.0]));
    f.label(x + 162, y + 56 + 38, 'B', 't');
    return f.svg();
  };
  const fTwoSpheresBat = () => {
    const f = PF.fig();
    const r = 24;
    disk(f, 60, 40, r);
    f.line(60, 40 + r, 60, 40 + r + 12);
    f.line(49, 40 + r + 12, 71, 40 + r + 12); f.line(55, 40 + r + 18, 65, 40 + r + 18, { cls: 'thick' });
    f.line(60, 40 + r + 18, 60, 40 + r + 28); f.ground(60, 40 + r + 28);
    f.label(78, 40 + r + 15, '9\\text{ V}', 'l', 'small');
    f.label(60, 40 - r - 8, 'A', 'b');
    disk(f, 240, 40, r);
    f.label(240, 40 - r - 8, 'B', 'b');
    f.label(240 + r + 10, 40, '5\\text{ nC}', 'l', 'small');
    return f.svg();
  };
  const fPipeIns = () => {
    const f = PF.fig();
    const x = 50, y = 24, s = 130, g = 7;
    f.pl([[x + s - g, y], [x, y], [x, y + s], [x + s - g, y + s]], { cls: 'thick' });
    f.line(x + s, y + g, x + s, y + s - g, { cls: 'thick' });
    f.label(x + s / 2, y - 10, '0', 'b', 'small');
    f.label(x + s / 2, y + s + 10, '0', 't', 'small');
    f.label(x - 10, y + s / 2, '0', 'r', 'small');
    f.label(x + s + 10, y + s / 2, 'V_0', 'l', 'small');
    return f.svg();
  };
  const fSphereOutQ = () => {
    const f = PF.fig();
    disk(f, 80, 70, 40);
    f.line(80, 110, 80, 122); f.ground(80, 122);
    f.label(128, 100, 'V=0', 'tl', 'small');
    f.charge(220, 60, { q: '+', lab: 'q', at: 'r' });
    return f.svg();
  };
  const fFieldSphere = (grounded) => {
    const f = PF.fig();
    const cx = 146, cy = 100, R = 36;
    [24, 56, 236, 268].forEach((x) => f.arrow(x, 182, x, 24, { cls: 'dim', hs: 6 }));
    f.label(274, 32, 'E_0', 'l', 'small');
    disk(f, cx, cy, R);
    if (grounded) { f.line(cx, cy + R, cx, cy + R + 12); f.ground(cx, cy + R + 12); f.label(cx + 14, cy + R + 20, 'V=0', 'l', 'small'); }
    else f.label(cx + R + 6, cy - R + 2, 'Q = 0', 'bl', 'small');
    return f.svg();
  };
  const fPlastic = () => {
    const f = PF.fig();
    const cx = 100, cy = 92, R = 60;
    f.circle(cx, cy, R, { cls: 'dash' });
    [45, 60, 75, 90, 105, 120, 135].forEach((a) => { const t = a * D2R; f.label(cx + (R + 12) * Math.cos(t), cy - (R + 12) * Math.sin(t), '+', 'c', 'small'); });
    f.text(cx, cy + R + 12, 'thin plastic shell', 't');
    return f.svg();
  };
  const fIsoVQ = () => {
    const f = PF.fig();
    metal(f, potato(80, 66, 48, 34, [0.08, 0.05, 0.03], [0.4, 1.2, 2.2]));
    f.label(146, 50, 'V = 5\\text{ V}', 'l', 'small');
    f.label(146, 82, 'Q = 3\\text{ nC}', 'l', 'small');
    return f.svg();
  };
  const fPlates2 = () => {
    const f = PF.fig();
    f.plane(30, 260, 40, { side: 'above', lab: 'V = V_0' });
    f.plane(30, 260, 140, { side: 'below', lab: 'V = 0' });
    f.arrow(14, 140, 14, 24, { cls: 'dim', hs: 6 }); f.label(14, 18, 'z', 'b', 'small accent');
    f.label(6, 140, '0', 'r', 'small'); f.label(6, 40, 'd', 'r', 'small');
    f.text(145, 90, 'no charge between', 'c');
    return f.svg();
  };
  const fPlaneSigma = () => {
    const f = PF.fig();
    f.plane(20, 270, 120, { side: 'below', lab: 'grounded' });
    f.arrow(40, 120, 40, 30, { cls: 'dim', hs: 6 }); f.label(46, 30, 'z', 'l', 'small accent');
    f.label(150, 104, '\\sigma(x,y)\\text{ on the top surface}', 'b', 'small');
    f.text(160, 60, 'region: z > 0', 'c');
    return f.svg();
  };
  const fSlot = () => {
    const f = PF.fig();
    const x0 = 50, x1 = 300, y0 = 40, y1 = 140;
    f.plane(x0, x1, y0, { side: 'above', lab: 'V=0', labx: x1 - 20 });
    f.plane(x0, x1, y1, { side: 'below', lab: 'V=0', labx: x1 - 20 });
    f.line(x0, y0, x0, y1, { cls: 'thick' });
    f.label(x0 - 8, (y0 + y1) / 2, 'V_0(y)', 'r', 'small');
    f.dim(x0 + 26, y0, x0 + 26, y1, 'a');
    f.label(x1 + 10, (y0 + y1) / 2, 'x\\to\\infty', 'l', 'small');
    return f.svg();
  };
  const fImg3D = () => {
    const g = PF.fig({ proj: { ox: 150, oy: 150, s: 1 } });
    const L = 110, d = 90;
    const c = [[-L, -L, 0], [L, -L, 0], [L, L, 0], [-L, L, 0]].map((p) => g.p3(...p));
    g.hatchBand(c); g.poly(c);
    const [qx, qy] = g.p3(0, 0, d), [fx, fy] = g.p3(0, 0, 0);
    g.line(qx, qy + 7, qx, fy - 30, { cls: 'dash dim' });
    g.charge(qx, qy, { q: '+', lab: 'q', at: 'r' });
    g.label(qx - 8, qy + 30, 'd', 'r', 'small');
    g.label(c[2][0] + 6, c[2][1] + 8, 'V = 0', 'tl', 'small');
    g.text(qx + 70, qy - 6, 'charge at (0, 0, d)', 'l');
    return g.svg();
  };
  const fImgSide = () => {
    const f = PF.fig();
    f.plane(20, 290, 150, { side: 'below', lab: 'V=0' });
    f.charge(155, 60, { q: '+', lab: 'q', at: 'r' });
    f.line(155, 67, 155, 150, { cls: 'dash dim' });
    f.label(149, 105, 'd', 'r', 'small');
    f.arrow(40, 150, 40, 30, { cls: 'dim', hs: 6 }); f.label(46, 30, 'z', 'l', 'small accent');
    f.text(236, 95, 'region: z > 0', 'c');
    return f.svg();
  };

  // ================================================================== Lesson 6
  const L6 = {
    id: 'u4-bcs', title: 'Boundary conditions: enough, missing, too much',
    steps: [
      RF(md`
        ### Translating words into boundary conditions

        Problems describe boundaries in words. Each phrase is one condition on one surface.

        [[fig:dict]]

        | The problem says | Condition on that surface | What stays unknown |
        |---|---|---|
        | "grounded" | $V = 0$ | its charge: charge flows to or from the earth |
        | "held at $V_0$", "connected to a battery" | $V = V_0$ | its charge |
        | "isolated" or "insulated", carrying charge $Q$ | $V$ = an unknown constant on it, and $\oint\sigma\,da = Q$ | its potential |
        | "neutral" or "uncharged" (and isolated) | the same, with $Q = 0$ | its potential |
        | "surface charge $\sigma$" on a conductor | $\dfrac{\partial V}{\partial n} = -\dfrac{\sigma}{\varepsilon_0}$, with $\hat{\mathbf n}$ out of the metal | nothing |
        | "far away", all charges in a finite region | $V\to 0$ as $r\to\infty$ | |
        | "far away the field is uniform, $E_0\hat{\mathbf z}$" | $V\to -E_0z + C = -E_0r\cos\theta + C$ | |

        Three habits:
        - **Grounded is not neutral.** Grounded fixes $V$ and lets the charge adjust; isolated fixes the charge and lets $V$ adjust.
        - **A charged sheet inside the region is not a boundary** but a matching surface: $V$ is continuous across it, and $\partial V/\partial n$ jumps by $-\sigma/\varepsilon_0$ (the potential form of $\vb E_{\text{above}} - \vb E_{\text{below}} = \tfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$).
        - **Write the list before solving**: numbered, one line per surface, infinity included. That list is half the problem.
      `, { dict: { svg: fDict(), cap: md`Four phrases, four conditions: $V = 0$; $V = V_0$; an equipotential with total charge $Q$; $V\to 0$ at infinity.` } }),

      Q(md`An **uncharged, isolated** metal sphere is placed near a charge $q$. Which conditions describe the sphere?`,
        [md`$V = 0$ on the sphere`, md`$V$ = some unknown constant on the sphere, and its total charge is $0$`, md`$\sigma = 0$ everywhere on the sphere`, md`$\partial V/\partial n = 0$ on the sphere`], 1,
        [md`That's grounded. An isolated sphere floats at whatever potential the nearby charge gives it.`, null,
          md`Neutral means the total is zero, not the density: $q$ induces negative charge on the near side and positive on the far side.`,
          md`That would mean no field at the surface, i.e. $\sigma = 0$ everywhere, which isn't what happens.`],
        md`Isolated: no wire, so the total charge stays what it was ($0$). Conductor: one potential over the whole surface, value unknown. Those two facts together are one complete condition (second theorem).`,
        { figHtml: fUnknown(false) }),

      Q(md`An uncharged metal sphere sits in a field that, far from the sphere, is uniform: $\vb E = E_0\hat{\mathbf z}$. What is the condition far away?`,
        [md`$V\to 0$`, md`$V\to +E_0 z$`, md`$V\to -E_0z$, plus a constant`, md`$\partial V/\partial r\to 0$`], 2,
        [md`The field doesn't die off far away here. $V\to 0$ fits charges confined to a finite region.`,
          md`Sign: $\vb E = -\nabla V$, so $E_z = E_0$ needs $V = -E_0z$.`, null,
          md`In a uniform field $\partial V/\partial r = -E_0\cos\theta\ne 0$.`],
        md`$\vb E = -\nabla V = E_0\hat{\mathbf z}$ gives $V = -E_0z + C = -E_0 r\cos\theta + C$ far away. Together with "the sphere is an equipotential with total charge $0$" that's the complete set of conditions for Griffiths Ex. 3.8, solved in Unit 7.`,
        { figHtml: fFieldSphere(false) }),

      Q(md`Two identical metal spheres, far apart. Sphere A is connected to a $9$ V battery whose other terminal is grounded. Sphere B is isolated and carries $5$ nC. Which quantities are **unknown** before you solve?`,
        [md`A's potential and B's charge`, md`Both potentials`, md`Both charges`, md`A's charge and B's potential`], 3,
        [md`Those are exactly the given data: A at $9$ V, B with $5$ nC.`, md`A's potential is given ($9$ V).`, md`B's charge is given ($5$ nC).`, null],
        md`Each conductor gets one condition and the other quantity is an output. A: $V = 9$ V, charge unknown (the battery supplies whatever it takes). B: total charge $5$ nC, potential unknown.`,
        { figHtml: fTwoSpheresBat() }),

      Q(md`A typical Griffiths statement: "a long metal pipe of square cross-section; three sides are grounded, and the fourth side, **insulated from the others**, is held at $V_0$." What does "insulated" tell you about the fourth side?`,
        [md`It carries no charge: $Q = 0$ on that side`, md`$\partial V/\partial n = 0$ on that side, like an insulated edge in a heat problem`, md`Nothing; it cancels "held at $V_0$"`, md`Only that thin insulating gaps separate it from the grounded sides, so it can sit at a different potential: the condition there is $V = V_0$`], 3,
        [md`Its charge is whatever it takes to hold it at $V_0$. "Insulated" refers to the joints, not to its charge.`,
          md`That's the heat-flow meaning (no flux through an insulated edge). Here the side is a conductor held at $V_0$: a Dirichlet condition.`,
          md`"Insulated from the others" explains how it can be held at $V_0$ while touching grounded sides; the condition is still $V = V_0$.`, null],
        md`Boundary conditions for the pipe (the setup of several Unit 6 problems):
        1. $V = 0$ on the three grounded sides.
        2. $V = V_0$ on the fourth side.

        "Insulated from the others" only explains why touching sides can sit at different potentials (the gaps in the figure). Compare an **isolated** or insulated conductor that is not held at any potential: then its total charge stays fixed and its potential floats.`,
        { figHtml: fPipeIns() }),

      Q(md`A thin **plastic** spherical shell of radius $R$ carries a glued-on surface charge $\sigma(\theta)$. There are no conductors. At $r = R$, which conditions connect the solutions inside and outside?`,
        [md`$V = 0$ at $r = R$`, md`$\partial V/\partial r$ continuous, and $V$ jumps by $\sigma/\varepsilon_0$`, md`$V_{\text{in}} = V_{\text{out}}$ at $r = R$, and $\dfrac{\partial V_{\text{out}}}{\partial r} - \dfrac{\partial V_{\text{in}}}{\partial r} = -\dfrac{\sigma}{\varepsilon_0}$`, md`$V$ is constant over the shell`], 2,
        [md`Nothing is grounded; $V$ at the shell is whatever the charge makes it.`,
          md`Reversed: $V$ is continuous across a surface charge; it's the normal derivative that jumps.`, null,
          md`Only a conductor's surface is an equipotential. Plastic holds its charge wherever it was put.`],
        md`A surface charge is not a boundary of the region but a matching surface. $V$ is continuous (a finite field can't make $V$ jump). The normal field jumps by $\sigma/\varepsilon_0$: $E_{r,\text{out}} - E_{r,\text{in}} = \sigma/\varepsilon_0$, i.e. $\partial_r V_{\text{out}} - \partial_rV_{\text{in}} = -\sigma/\varepsilon_0$. Add $V$ finite at $r = 0$ and $V\to 0$ at infinity, and you have Griffiths Ex. 3.9 (Unit 7).`,
        { figHtml: fPlastic() }),

      Q(md`A grounded metal plate fills the plane $z = 0$, and the region of interest is $z > 0$. You're told the charge density on the plate's top surface is $\sigma(x,y)$. Which condition on $\partial V/\partial z$ just above the plate does that give?`,
        [md`$\partial V/\partial z = -\sigma/\varepsilon_0$`, md`$\partial V/\partial z = +\sigma/\varepsilon_0$`, md`$\partial V/\partial z = 0$`, md`$\partial V/\partial z = -\sigma/(2\varepsilon_0)$`], 0,
        [null, md`Sign. The field just above is $E_z = +\sigma/\varepsilon_0$, and $E_z = -\partial V/\partial z$.`,
          md`That would mean no charge on the surface.`,
          md`$\sigma/2\varepsilon_0$ is the field of an isolated sheet. At a conductor the whole field $\sigma/\varepsilon_0$ is on the outside.`],
        md`Just outside a conductor $\vb E = \dfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$, with $\hat{\mathbf n}$ pointing out of the metal (here $+\hat{\mathbf z}$). $E_z = -\partial V/\partial z$, so $\partial V/\partial z = -\sigma/\varepsilon_0$: Neumann data. Unit 5 runs this backwards: find $V$ first, then read off $\sigma = -\varepsilon_0\,\partial V/\partial z$.`,
        { figHtml: fPlaneSigma() }),

      RF(md`
        ### Enough, missing, too much

        **Enough** means: on every piece of the boundary (each conductor, each other surface, and infinity if the region is unbounded) exactly one of
        1. $V$ (Dirichlet: grounded, held at $V_0$, a given $V(\theta)$, ...);
        2. $\partial V/\partial n$ (Neumann; on a conductor this is the same as giving $\sigma$);
        3. for a conductor only, its total charge $Q$ (being an equipotential supplies the rest);

        plus $\rho$ throughout the region. Mixed choices are fine: one conductor grounded and another isolated with charge $Q$ is a perfectly good problem.

        **Missing** (more than one solution):
        - a surface with no condition at all, such as a conductor you're told nothing about;
        - the condition at infinity, for an unbounded region;
        - only the total charge on a **non-conducting** surface (the charge could sit in many arrangements);
        - an unknown $\rho$ inside the region.

        **Too much** (usually no solution at all):
        - both $V$ and $Q$ for the same conductor (they're tied together by the geometry, as in $Q = CV$);
        - both $V$ and $\partial V/\partial n$ on the same surface.

        If only charges or only $\partial V/\partial n$ are given and $V$ is pinned nowhere, $\vb E$ is still unique and $V$ is fixed up to a constant. That's usually fine: the field is the physics.
      `),

      Q(md`A grounded metal box contains a metal sphere that is isolated and carries charge $Q$. There's no other charge. Is that enough to determine $V$ everywhere inside the box?`,
        [md`Yes: the box is at $V = 0$ and the sphere has a known total charge; one condition per conductor`, md`No: you also need the sphere's potential`, md`No: you need $\sigma$ on the sphere`, md`No: you need the box's charge`], 0,
        [null, md`That would be a second condition on the same conductor, which over-determines it. The sphere's potential comes out of the solution.`,
          md`$\sigma$ is part of the answer. The total charge plus "the sphere is an equipotential" is enough.`,
          md`The box is grounded: its potential is its condition, and its charge is an output.`],
        md`Boundary conditions: 1. $V = 0$ on the walls. 2. The sphere is an equipotential with total charge $Q$. No source in the region. One condition per conductor, so the field is unique (second theorem), and the grounded box pins $V$.`,
        { figHtml: fBoxSphere('Q') }),

      Q(md`Same grounded box and metal sphere, but nothing at all is said about the sphere: not its charge, not its potential. Is $V$ inside determined?`,
        [md`Yes: the sphere's charge must be zero`, md`Yes: the sphere must be at $V = 0$, like the box`, md`No: the sphere could carry any charge (or sit at any potential), and each choice gives a different field`, md`Yes: uniqueness fixes it`], 2,
        [md`Nothing says it's neutral. Unstated is not the same as zero.`,
          md`Nothing connects it to the box or to ground.`, null,
          md`Uniqueness needs a condition on every boundary piece. The sphere's surface has none.`],
        md`Each value of the sphere's charge (or potential) gives a different, perfectly valid field. A boundary with no condition means no uniqueness.`,
        { figHtml: fBoxSphere('?') }),

      Q(md`A grounded box contains two conductors, $A$ and $B$, and no other charge. Which set of data is **not** enough to determine the field?`,
        [md`$A$ at $10$ V, $B$ grounded`, md`$A$ at $10$ V, $B$ isolated and neutral`, md`$A$ carries $+2$ nC, $B$ carries $-5$ nC`, md`$A$ at $10$ V, and nothing known about $B$`], 3,
        [md`Both potentials given (first theorem); the box is at $0$.`,
          md`"Isolated and neutral" is a charge condition, $Q_B = 0$. Mixed data are fine.`,
          md`Charges on both, box grounded: second theorem, with the box pinning $V$.`, null],
        md`Every conductor needs its potential or its total charge. With nothing known about $B$, its charge could be anything, and each value gives a different field.`,
        { figHtml: fBoxAB() }),

      Q(md`A thin **plastic** spherical shell carries total charge $Q$, but you aren't told how it's spread over the shell. Is the field outside determined?`,
        [md`No: for an insulator the total charge isn't enough; the charge could sit in many arrangements, each with a different outside field`, md`Yes, by the second uniqueness theorem`, md`Yes: by Gauss's law it's $Q/(4\pi\varepsilon_0 r^2)$ whatever the distribution`, md`There's no field outside at all`], 0,
        [null, md`The second theorem needs conductors; it uses the fact that each one is an equipotential. Plastic isn't.`,
          md`Gauss's law gives the flux, not the field. $E = Q/(4\pi\varepsilon_0r^2)$ only for a spherically symmetric distribution.`,
          md`There's net charge, so there is flux: $\oint\vb E\cdot d\vb a = Q/\varepsilon_0 \ne 0$.`],
        md`On a conductor the charge arranges itself in the one way that makes the surface an equipotential, so the total charge is enough. On an insulator the charge stays where it was put; you need $\sigma$ point by point (or $V$, or $\partial V/\partial n$, on the surface). Put all the charge near one pole and the outside field differs from a uniform coat's.`,
        { figHtml: fPlastic() }),

      Q(md`A problem says an isolated conductor is held at $V = 5$ V **and** carries $Q = 3$ nC, with $V \to 0$ far away and nothing else around. What's the issue?`,
        [md`None; more data can't hurt`, md`It's over-specified: for an isolated conductor $Q = CV$ with $C$ set by its shape, so you may choose one of them, not both`, md`It's under-specified: you also need $\sigma$`, md`A conductor's potential can't be specified`], 1,
        [md`If the numbers don't satisfy $Q = CV$ for this conductor, no solution exists; if they do, one of them is redundant.`, null,
          md`$\sigma$ is an output; it's fixed once $V$ or $Q$ is given.`,
          md`Wiring the conductor to a battery fixes its potential; that's the first theorem's data.`],
        md`Give either $V$ (first theorem) or $Q$ (second theorem) for each conductor, never both. They're linked by the geometry: $C = Q/V$ is a property of the shape.`,
        { figHtml: fIsoVQ() }),

      Q(md`The region between two long coaxial metal cylinders (cross-section shown) is charge-free. The inner cylinder is held at $V_0$. What else do you need to fix $V$ between them?`,
        [md`A condition on the outer cylinder: its potential or its charge`, md`Nothing: Laplace's equation plus $V_0$ on the inner cylinder is enough`, md`The charge on the inner cylinder`, md`$V\to 0$ at infinity`], 0,
        [null, md`The outer cylinder is part of the boundary. Without a condition there, $V = V_0 + c\ln(s/a)$ fits for every $c$.`,
          md`That's a second condition on the inner conductor, which already has one ($V_0$).`,
          md`The region ends at the outer cylinder; infinity isn't part of it.`],
        md`Two boundary pieces, two conditions. With $V_0$ on the inner cylinder and, say, $V = 0$ on the outer one, $V = V_0\,\dfrac{\ln(b/s)}{\ln(b/a)}$ is the unique answer.`,
        { figHtml: fConc({ inner: 'V_0', outer: '?' }) }),

      Q(md`A charge $q$ sits outside a grounded metal sphere, and you want $V$ everywhere outside the sphere. You have Poisson's equation with source $q$, and $V = 0$ on the sphere. What's missing?`,
        [md`The sphere's total charge`, md`$\partial V/\partial n$ on the sphere`, md`Nothing`, md`$V\to 0$ far away`], 3,
        [md`The sphere is grounded: $V = 0$ is its condition, and its charge is an output.`,
          md`One condition per surface; the sphere already has $V = 0$.`,
          md`The region is unbounded, and infinity is a boundary that needs its own condition.`, null],
        md`Boundary conditions: 1. $V = 0$ on the sphere. 2. $V\to0$ far away. Source: $q$. Without 2 you could add, for instance, $c\,(1 - R/r)$ for any $c$: it's harmonic outside and zero on the sphere. (Unit 5 solves this problem with an image charge.)`,
        { figHtml: fSphereOutQ() }),

      Q(md`Two grounded semi-infinite plates sit at $y = 0$ and $y = a$; the strip at $x = 0$ joining them is held at $V_0(y)$, and the slot runs off to $x\to\infty$. Besides $V = 0$ on both plates and $V = V_0(y)$ at $x = 0$, which condition is needed?`,
        [md`$\partial V/\partial y = 0$ on the plates`, md`$V\to 0$ as $x\to\infty$`, md`$V = V_0$ as $x\to\infty$`, md`None`], 1,
        [md`The plates already have a condition ($V = 0$); a second one would over-determine them.`, null,
          md`Far from the strip its influence dies away; nothing holds the far end at $V_0$.`,
          md`The open end is a boundary too. Without a condition there, solutions growing like $e^{kx}$ would be allowed.`],
        md`Boundary conditions for this slot (Griffiths Ex. 3.3, Unit 6): 1. $V = 0$ at $y = 0$. 2. $V = 0$ at $y = a$. 3. $V = V_0(y)$ at $x = 0$. 4. $V\to 0$ as $x\to\infty$. Number 4 is the one people forget; in separation of variables it is what kills the $e^{+kx}$ terms.`,
        { figHtml: fSlot() }),

      Q(md`A grounded plane at $z = 0$ and a plate at $z = d$ held at $V_0$, no charge between. Which function satisfies Laplace's equation **and** both boundary conditions?`,
        [md`$V_0 z/d$`, md`$V_0\sin\left(\dfrac{\pi z}{2d}\right)$`, md`$V_0 z^2/d^2$`, md`$V_0(1 - z/d)$`], 0,
        [null, md`Right boundary values ($0$ at $z = 0$, $V_0$ at $z = d$), but $\nabla^2 V = -(\pi/2d)^2 V \ne 0$: it implies charge between the plates.`,
          md`Right boundary values, but $\nabla^2 V = 2V_0/d^2\ne 0$.`,
          md`Laplace is fine, but the boundary values are swapped: it gives $V_0$ on the grounded plane.`],
        md`Check both requirements every time: the equation in the region and every boundary value. Only $V_0z/d$ passes both, so by uniqueness it is the answer. The sine and the parabola fail the equation; the last one fails the boundary values.`,
        { figHtml: fPlates2() }),

      Q(md`A grounded metal sphere of radius $R$ sits in a field that is uniform far away, $\vb E\to E_0\hat{\mathbf z}$. The conditions: $\nabla^2V = 0$ outside, $V = 0$ at $r = R$, and $V\to -E_0r\cos\theta$ far away. Which guess satisfies all three?`,
        [md`$-E_0r\cos\theta$`, md`$-E_0(r - R)\cos\theta$`, md`$-E_0 r\cos\theta\; e^{-R/r}$`, md`$-E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$`], 3,
        [md`Harmonic and right far away, but at $r = R$ it gives $-E_0R\cos\theta\ne0$.`,
          md`Zero at $r = R$ and right far away, but $R\cos\theta$ on its own is not harmonic: $\nabla^2(R\cos\theta) = -2R\cos\theta/r^2\ne0$.`,
          md`Not zero at $r = R$ (it gives $-E_0Re^{-1}\cos\theta$), and not harmonic either.`, null],
        md`$r\cos\theta$ and $\cos\theta/r^2$ are both harmonic (the uniform-field and dipole potentials), so any combination is. $-E_0(r - R^3/r^2)\cos\theta$ vanishes at $r = R$ and tends to $-E_0r\cos\theta$ far away. All three conditions hold, so by uniqueness it's the answer (Griffiths Ex. 3.8, derived properly in Unit 7). The dipole term is the field of the charge induced on the sphere.`,
        { figHtml: fFieldSphere(true) }),

      RF(md`
        ### The licence to guess

        Lecture 9's conclusion: the uniqueness theorems mean you can guess. Given a charge distribution $\rho$ and a set of boundary conditions, if you guess a potential that satisfies Poisson's equation with that $\rho$ in the region and meets every boundary condition, it must be the correct solution, however you came up with it.

        The next units are two systematic ways of guessing:
        - **Method of images (Unit 5).** Build $V$ from the real charges plus fictitious charges placed **outside** the region of interest. Charges outside the region don't change $\rho$ inside it, so Poisson's equation in the region is untouched; the fictitious charges only have to make the boundary conditions come out right.
        - **Separation of variables (Units 6 and 7).** Build $V$ from products like $X(x)Y(y)$ or $R(r)\Theta(\theta)$, each harmonic on its own, and choose the coefficients so the sum matches the boundary values.

        ### The classic image problem: the setup

        Lecture 9 ends here. A point charge $q$ sits at $(0, 0, d)$, a height $d$ above an infinite grounded conducting plane at $z = 0$. What is $V$ in the region $z > 0$?

        [[fig:img]]

        It isn't just $q/(4\pi\varepsilon_0\srm)$: $q$ induces negative charge on the plane, and that charge contributes too. You don't know how much is induced or where, so you can't integrate. Instead, list the conditions. Lecture 9 asks exactly this in class: what are the boundary conditions? Decide before the next question.
      `, { img: { svg: fImg3D(), cap: md`Lecture 9's picture: $q$ at height $d$ above an infinite grounded conducting plane.` } }),

      Q(md`Lecture 9's in-class question: for the charge above the grounded plane, solving in the region $z > 0$, what are the boundary conditions?`,
        [md`$V = 0$ at $z = 0$ only`, md`$V = q/(4\pi\varepsilon_0 d)$ at the point of the plane right below $q$`, md`$\partial V/\partial z = 0$ at $z = 0$`, md`$V = 0$ at $z = 0$ for every $(x, y)$, and $V\to0$ far away`], 3,
        [md`The region $z>0$ is unbounded; its boundary also includes infinity, where $V\to 0$.`,
          md`The plane is grounded: $V = 0$ at every point of it, including right below $q$.`,
          md`That would mean no normal field at the plane, i.e. no induced charge. A grounded conductor fixes $V$, not its derivative.`, null],
        md`Boundary conditions:
        1. $V = 0$ at $z = 0$, for all $x$ and $y$ (the plane is grounded).
        2. $V\to 0$ far from the charge, $x^2 + y^2 + z^2 \gg d^2$.

        Plus the equation: in $z>0$, Poisson's equation with exactly one source, $q$ at $(0,0,d)$. By the corollary exactly one function meets all of these. Unit 5 finds it.`,
        { figHtml: fImg3D() }),

      Q(md`To build a valid guess for $V$ in $z>0$, which of these moves is allowed?`,
        [md`Adding charges in $z>0$ to cancel the potential on the plane`, md`Adding fictitious charges in $z<0$, below the plane, if that makes the boundary conditions come out right`, md`Changing the condition at infinity to $V\to$ a constant`, md`Moving $q$ to a more convenient height`], 1,
        [md`Charges in $z>0$ change $\rho$ in the region, so the guess would solve a different Poisson equation.`, null,
          md`The boundary conditions are part of the problem; changing them changes the problem.`,
          md`$q$'s position is given.`],
        md`Charges placed outside the region ($z<0$) don't change $\rho$ inside it, so Poisson's equation in $z>0$ stays the same. If you can choose them so that $V = 0$ on the plane and $V\to0$ at infinity, the uniqueness theorem certifies the result for $z\ge0$. Which charges to choose is Unit 5.`,
        { figHtml: fImgSide() }),

      P({
        id: 'u4-p-teaser', title: 'Testing guesses for the classic image problem',
        q: md`Charge $q$ at $(0,0,d)$ above an infinite grounded plane at $z = 0$; you want $V$ for $z>0$. Let $\srm_1 = \sqrt{x^2+y^2+(z-d)^2}$, the distance to $q$. Test each candidate against the three requirements: (1) Poisson's equation in $z>0$ with $q$ as the only source; (2) $V = 0$ on the plane; (3) $V\to 0$ far away.

        (a) $V_a = 0$.

        (b) $V_b = \dfrac{q}{4\pi\varepsilon_0\srm_1}$.

        (c) $V_c = \dfrac{q}{4\pi\varepsilon_0\srm_1}\left(1 - e^{-z/d}\right)$.`,
        figHtml: fImgSide(),
        hints: [
          md`For each candidate check the three requirements separately. For (2), set $z = 0$. For (3), let $x^2+y^2+z^2\to\infty$.`,
          md`For (1): does the candidate have a point charge of strength exactly $q$ at $(0,0,d)$, and is it harmonic everywhere else in $z>0$?`,
          md`Near $(0,0,d)$ the factor $1 - e^{-z/d}$ is about $1 - e^{-1}$, and away from $q$ it spoils $\nabla^2 V = 0$.`,
        ],
        parts: [
          { lbl: md`(a) $V_a = 0$ fails:`, mc: [md`(1) Poisson's equation`, md`(2) $V = 0$ on the plane`, md`(3) $V\to0$ far away`, md`none of them`], a: 0,
            why: [null, md`$V_a$ is zero everywhere, the plane included.`, md`$V_a$ is zero far away too.`, md`There's no charge in it at all, so it can't satisfy Poisson's equation with $q$ at $(0,0,d)$.`] },
          { lbl: md`(b) $V_b$, the charge alone, fails:`, mc: [md`(1) Poisson's equation`, md`(2) $V = 0$ on the plane`, md`(3) $V\to0$ far away`, md`none of them`], a: 1,
            why: [md`It's the potential of exactly $q$ at $(0,0,d)$ and is harmonic elsewhere: the equation is fine.`, null, md`It falls off like $1/r$: fine.`, md`At $z = 0$ it equals $\dfrac{q}{4\pi\varepsilon_0\sqrt{x^2+y^2+d^2}}\ne0$.`] },
          { lbl: md`(c) $V_c$ fails:`, mc: [md`(2) $V = 0$ on the plane`, md`(3) $V\to0$ far away`, md`(1) Poisson's equation`, md`none of them`], a: 2,
            why: [md`The factor $1 - e^{-z/d}$ is zero at $z = 0$, so $V_c = 0$ on the plane.`, md`$1/\srm_1\to 0$ and the factor stays below $1$, so $V_c\to 0$.`, null, md`It meets (2) and (3), but its source is wrong: see (1).`] },
          { lbl: md`What does candidate (c) teach you?`, mc: [md`Any function that is zero on the plane and at infinity is the answer`, md`The boundary conditions alone determine $V$`, md`Multiplying by a factor that vanishes on the plane is a safe fix`, md`Matching the boundary conditions isn't enough: the guess must also satisfy Poisson's equation with exactly the given charges in the region`], a: 3,
            why: [md`$V_c$ is zero on the plane and at infinity, and it's still wrong.`, md`Uniqueness needs the equation in the region too; infinitely many functions meet the boundary conditions.`, md`The factor changes $\nabla^2V$ everywhere, inventing charge that isn't there.`, null] },
        ],
        sol: md`
          **Boundary conditions** (and the source), the same for every candidate:
          1. Poisson's equation in $z>0$ with only $q$ at $(0,0,d)$ as the source.
          2. $V = 0$ on the plane $z = 0$.
          3. $V\to 0$ far away.

          **(a) $V_a = 0$.** Meets 2 and 3, fails 1: there's no point charge in it ($\nabla^2V_a = 0$ everywhere, including at $(0,0,d)$).

          **(b) $V_b$, the charge alone.** Meets 1 and 3, fails 2: on the plane $V_b = \dfrac{q}{4\pi\varepsilon_0\sqrt{x^2+y^2+d^2}} > 0$. The induced charge is missing.

          **(c) $V_c$.** Meets 2 (the factor $1 - e^{-z/d}$ vanishes at $z = 0$) and 3, but fails 1: near $q$ it looks like the potential of a charge $(1 - e^{-1})q\approx 0.63q$, not $q$, and away from $q$ the factor makes $\nabla^2V_c\ne0$, a fake charge density spread through the region.

          **What to remember.** A guess must pass all three tests. Patching the boundary by multiplying or subtracting functions usually breaks the equation. The safe way to change $V$ in the region without touching $\rho$ there is to add the potential of charges placed outside the region, which is harmonic inside it. That is the method of images, Unit 5.
        `,
      }),

      RF(md`
        !!method Patterns from this unit's boundary-condition work
          - Translate every phrase into one condition on one surface: grounded $\to V = 0$; held at $V_0 \to V = V_0$; isolated with charge $Q\to$ equipotential with $\oint\sigma\,da = Q$; neutral $\to Q = 0$; surface charge on a conductor $\to \partial V/\partial n = -\sigma/\varepsilon_0$; far away $\to V\to 0$ (or $V\to -E_0z$ in a uniform field).
          - Enough = one condition on every piece of boundary, infinity included, plus $\rho$ in the region. Mixed kinds are fine.
          - Missing: a surface with no condition, no condition at infinity, only a total charge on an insulator, unknown $\rho$.
          - Too much: $V$ and $Q$ on one conductor, or $V$ and $\partial V/\partial n$ on one surface.
          - A guess is the answer only if it passes every test: the equation (with exactly the given charges) and every boundary condition.
          - Coming next: images (Unit 5) and separation of variables (Units 6 and 7) are systematic ways to build guesses that pass.
      `),
    ],
  };

  // @@MORE-LESSONS@@

  C.unit({
    id: 'u4', num: 'Unit 4', title: "Laplace's equation and uniqueness",
    blurb: "Poisson's and Laplace's equations, the averaging property and relaxation, no extrema and Earnshaw, boundary conditions, and the uniqueness theorems that make guessing legitimate.",
    lessons: [L1, L2, L3, L4, L5, L6],
  });
})();

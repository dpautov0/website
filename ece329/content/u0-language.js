/* Unit 0 — the language the exam assumes, taught from zero but fast: vectors and right-hand rules (A), line and surface
   integrals (B), divergence, curl and partial anti-derivatives (C), delta functions, steps and pulses (D), and traveling
   waveforms (E). Each lesson: notation, the idea, a few steps with a prediction at each, a short worked example, check
   questions, then leveled drills with new numbers every time (Level 1 recognize, Level 2 apply, Level 3 multi-step). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;
  const DEG = Math.PI / 180;
  const level = (n, t, trick) => R(md`
    #### Level ${n} · ${t}

    ${trick}
  `);

  // ---------------------------------------------------------------- helpers
  const AX = ['x', 'y', 'z'];
  const hat = (k) => (k === 'phi' ? '\\hat\\phi' : `\\hat ${k}`);
  const uv = (k, s = 1) => `${s < 0 ? '-' : ''}${hat(k)}`;          // a signed unit vector, TeX
  const $u = (k, s = 1) => `$${uv(k, s)}$`;
  // cross product of two signed unit vectors of one right-handed triple T; null when parallel
  function crossT(T, a, sa, b, sb) {
    const i = T.indexOf(a), j = T.indexOf(b);
    if (i === j) return null;
    return [T[3 - i - j], sa * sb * ((j - i + 3) % 3 === 1 ? 1 : -1)];
  }
  const cx = (a, sa, b, sb) => crossT(AX, a, sa, b, sb);
  const fwd = (T, a, b) => (T.indexOf(b) - T.indexOf(a) + 3) % 3 === 1;
  // components as TeX: [3, -2, 0] -> 3\hat x - 2\hat y
  function vt(c, names = ['\\hat x', '\\hat y', '\\hat z']) {
    let s = '';
    c.forEach((v, i) => {
      if (!v) return;
      const a = Math.abs(v), co = a === 1 ? '' : EM.p(a);
      s += (v < 0 ? (s ? ' - ' : '-') : (s ? ' + ' : '')) + co + names[i];
    });
    return s || '0';
  }
  // a unit vector in the xy-plane (axis or diagonal) as TeX
  function vec2(v) {
    const r = v.map((x) => Math.round(x * 1e6) / 1e6);
    if (Math.abs(r[1]) < 1e-6) return uv('x', Math.sign(r[0]));
    if (Math.abs(r[0]) < 1e-6) return uv('y', Math.sign(r[1]));
    return `\\tfrac{1}{\\sqrt2}(${r[0] < 0 ? '-' : ''}\\hat x ${r[1] < 0 ? '-' : '+'} \\hat y)`;
  }
  const n3 = (x) => +(+x).toPrecision(3);
  const sgnTxt = (s) => (s > 0 ? '+' : '-');
  // a signed term for a sum: term(-3, 'x', false) -> " - 3x"
  function term(c, sym, first) {
    const a = Math.abs(c), co = a === 1 ? '' : EM.p(a);
    return first ? `${c < 0 ? '-' : ''}${co}${sym}` : ` ${c < 0 ? '-' : '+'} ${co}${sym}`;
  }

  // ---------------------------------------------------------------- figures
  // the cycle x -> y -> z -> x
  function cycleFig() {
    const g = PF.fig({ alt: 'the letters x, y and z on a circle with arrows from x to y, y to z and z to x' });
    const cx0 = 80, cy0 = 70, Rr = 46;
    const at = (d) => [cx0 + Rr * Math.cos(d * DEG), cy0 - Rr * Math.sin(d * DEG)];
    [[75, -15], [-45, -135], [195, 105]].forEach(([a0, a1]) => g.arc(cx0, cy0, Rr, a0, a1, { cls: 'thick', arrow: 'end', hs: 8 }));
    const lx = at(90), ly = at(-30), lz = at(210);
    g.label(lx[0], lx[1] - 4, '\\hat x', 'b');
    g.label(ly[0] + 8, ly[1] + 2, '\\hat y', 'l');
    g.label(lz[0] - 8, lz[1] + 2, '\\hat z', 'r');
    g.label(cx0, cy0, '+', 'c');
    return g.svg();
  }

  // a straight wire with current up; B circles it counterclockwise seen from above
  function wireFig() {
    const g = PF.fig({ alt: 'a vertical wire carrying current I upward; a circle of magnetic field around it runs counterclockwise seen from above' });
    const cx0 = 100, cy0 = 100, rx = 62, ry = 18;
    g.ellipse(cx0, cy0, rx, ry, { half: 'back', cls: 'dim' });
    g.line(cx0, 178, cx0, 26, { cls: 'thick', arrow: 'end', hs: 9 });
    g.ellipse(cx0, cy0, rx, ry, { half: 'front' });
    g.head(cx0 + 24, cy0 + ry - 1, 1, 0, { hs: 8 });             // the front of the circle moves right: ccw from above
    g.head(cx0 - 24, cy0 - ry + 1, -1, 0, { hs: 8, cls: 'dim' });
    g.label(cx0 + 8, 32, 'I', 'l');
    g.label(cx0 + rx + 6, cy0 + 6, '\\mathbf B', 'l');
    return g.svg();
  }

  // a horizontal loop, C counterclockwise from above, dS up
  function loopFig() {
    const g = PF.fig({ alt: 'a circular loop lying flat with its circulation counterclockwise seen from above; the thumb, dS, points up' });
    const cx0 = 100, cy0 = 120, rx = 70, ry = 20;
    g.ellipse(cx0, cy0, rx, ry, { half: 'back', cls: 'thick' });
    g.ellipse(cx0, cy0, rx, ry, { half: 'front', cls: 'thick' });
    g.head(cx0 + 4, cy0 + ry, 1, 0, { hs: 9 });
    g.head(cx0 - 4, cy0 - ry, -1, 0, { hs: 9 });
    g.label(cx0 + rx * 0.8, cy0 + ry + 6, 'C', 'tl');
    g.arrow(cx0, cy0, cx0, cy0 - 70, { cls: 'thick', hs: 8 });
    g.label(cx0 + 6, cy0 - 66, 'd\\mathbf S', 'l');
    return g.svg();
  }

  // top view: r-hat and phi-hat at two points
  function cylFig() {
    const g = PF.fig({ alt: 'top view of the xy-plane: at two points on a circle about the z-axis, r-hat points away from the axis and phi-hat along the circle, counterclockwise; the two points have different unit vectors' });
    const ox = 120, oy = 120, Rr = 76, L = 34;
    g.axes(ox, oy, { x: [-112, 118], y: [-100, 112], xl: 'x', yl: 'y' });
    g.circle(ox, oy, Rr, { cls: 'dim dash' });
    [35, 140].forEach((d) => {
      const t = d * DEG, px = ox + Rr * Math.cos(t), py = oy - Rr * Math.sin(t);
      g.line(ox, oy, px, py, { cls: 'dim thin' });
      g.dot(px, py, 2.6);
      g.arrow(px, py, px + L * Math.cos(t), py - L * Math.sin(t), { cls: 'thick', hs: 7 });
      g.arrow(px, py, px - L * Math.sin(t), py - L * Math.cos(t), { cls: 'thick', hs: 7 });
      g.label(px + (L + 10) * Math.cos(t), py - (L + 10) * Math.sin(t), '\\hat r', 'c');
      g.label(px - (L + 10) * Math.sin(t), py - (L + 10) * Math.cos(t), '\\hat\\phi', 'c');
    });
    g.angle(ox, oy, 24, 0, 35, '\\phi');
    return g.svg();
  }

  // a closed cylinder on the z-axis with its outward normals
  function boxFig() {
    const g = PF.fig({ alt: 'a closed cylinder around the z-axis: the outward normal points up on the top face, down on the bottom face and radially outward on the curved side' });
    const cx0 = 100, top = 60, bot = 160, rx = 52, ry = 14;
    g.line(cx0, 20, cx0, 200, { cls: 'dim dash' });
    g.ellipse(cx0, top, rx, ry, {});
    g.ellipse(cx0, bot, rx, ry, { half: 'back', cls: 'dash dim' });
    g.ellipse(cx0, bot, rx, ry, { half: 'front' });
    g.line(cx0 - rx, top, cx0 - rx, bot);
    g.line(cx0 + rx, top, cx0 + rx, bot);
    g.arrow(cx0 + 22, top, cx0 + 22, top - 40, { cls: 'thick', hs: 7 });
    g.label(cx0 + 28, top - 36, '+\\hat z', 'l');
    g.arrow(cx0 + 22, bot, cx0 + 22, bot + 40, { cls: 'thick', hs: 7 });
    g.label(cx0 + 28, bot + 36, '-\\hat z', 'l');
    g.arrow(cx0 + rx, 110, cx0 + rx + 42, 110, { cls: 'thick', hs: 7 });
    g.label(cx0 + rx + 46, 110, '\\hat r', 'l');
    g.label(cx0 - 6, 24, 'z', 'r', 'small accent');
    return g.svg();
  }

  // a long wire and a rectangle beside it in the same plane: B into the page, C clockwise, dS into the page
  function wireRectFig() {
    const g = PF.fig({ alt: 'a long wire with current I upward and a rectangle to its right in the same plane; the field is into the page over the rectangle; the path C runs clockwise' });
    const wx = 30, x0 = 80, x1 = 210, y0 = 40, y1 = 140;
    g.line(wx, 182, wx, 12, { cls: 'thick', arrow: 'end', hs: 9 });
    g.label(wx - 7, 18, 'I', 'r');
    g.marks('x', x0 + 18, y0 + 18, x1 - 18, y1 - 18, 4, 3);
    g.loopRect(x0, y0, x1 - x0, y1 - y0, { dir: 'cw' });
    g.label(x1 + 6, y0 - 4, 'C', 'bl');
    g.dim(wx, y1 + 24, x0, y1 + 24, 'd', { at: 'b' });
    g.dim(x0, y1 + 24, x1, y1 + 24, 'w', { at: 'b' });
    g.dim(x1 + 20, y0, x1 + 20, y1, 'h');
    return g.svg();
  }

  // F = y x-hat with a paddle wheel at the origin
  function shearFig() {
    const g = PF.fig({ alt: 'the field y times x-hat: arrows point right above the x-axis and left below it, longer farther from the axis; a paddle wheel at the origin turns clockwise' });
    const ox = 110, oy = 90;
    g.line(20, oy, 200, oy, { cls: 'dim thin' });
    g.field((x, y) => [oy - y, 0], [30, 20, 190, 160], 5, 5, { mag: true, len: 34 });
    g.circle(ox, oy, 9, { cls: 'dim' });
    g.line(ox - 9, oy, ox + 9, oy, { cls: 'dim' });
    g.line(ox, oy - 9, ox, oy + 9, { cls: 'dim' });
    g.arc(ox, oy, 19, 150, 30, { arrow: 'end', hs: 6 });
    g.label(204, oy, 'x', 'l', 'small accent');
    return g.svg();
  }

  // top view: a thin wedge between r and r + dr, angle dphi, circulated counterclockwise (z out of the page)
  function wedgeFig() {
    const g = PF.fig({ alt: 'top view with the z-axis out of the page at the lower left: a thin wedge between radius r and r + dr spanning a small angle d-phi, circulated counterclockwise; the inner arc has length r d-phi and the longer outer arc (r + dr) d-phi' });
    const ox = 30, oy = 200, r1 = 112, r2 = 168, a0 = 20, a1 = 56, am = (a0 + a1) / 2;
    const P = (R, d) => [ox + R * Math.cos(d * DEG), oy - R * Math.sin(d * DEG)];
    g.line(ox, oy, ...P(r1, a0), { cls: 'dim thin dash' });
    g.line(ox, oy, ...P(r1, a1), { cls: 'dim thin dash' });
    g.angle(ox, oy, 38, a0, a1, 'd\\phi');
    g.odot(ox, oy, 6);
    g.label(ox - 10, oy, 'z', 'r', 'small accent');
    g.line(...P(r1, a0), ...P(r2, a0), { cls: 'thick', mid: true, hs: 8 });     // out along phi
    g.arc(ox, oy, r2, a0, a1, { cls: 'thick' });                               // counterclockwise along the outer arc
    g.line(...P(r2, a1), ...P(r1, a1), { cls: 'thick', mid: true, hs: 8 });     // back in along phi + dphi
    g.arc(ox, oy, r1, a1, a0, { cls: 'thick' });                               // clockwise along the inner arc
    const t = am * DEG, [xo, yo] = P(r2, am), [xi, yi] = P(r1, am);
    g.head(xo, yo, -Math.sin(t), -Math.cos(t), { hs: 8 });
    g.head(xi, yi, Math.sin(t), Math.cos(t), { hs: 8 });
    g.label(...P(r2 + 10, am), '(r + dr)\\,d\\phi', 'bl', 'small');
    g.label(...P(r1 - 10, am), 'r\\,d\\phi', 'tr', 'small');
    g.label(...P((r1 + r2) / 2, a0 - 4), 'dr', 't', 'small');
    g.label(...P(r1 * 0.62, a0 - 5), 'r', 't', 'small');
    return g.svg();
  }

  // narrowing rectangles of area 1
  function deltaFig() {
    const box = (w) => (x) => (Math.abs(x) < w / 2 ? 1 / w : 0);
    return PF.plot({
      w: 300, h: 200, x: [-1.5, 1.5], y: [0, 2.4], xl: 'x',
      xt: [[-1, '-1'], [-0.5, '-\\tfrac12'], [0.5, '\\tfrac12'], [1, '1']], yt: [[0.5, '\\tfrac12'], [1, '1'], [2, '2']],
      curves: [{ f: box(2), n: 600, cls: 'dim' }, { f: box(1), n: 600, cls: 'dash' }, { f: box(0.5), n: 600 }],
    });
  }

  function pulseFig() {
    const common = { w: 230, h: 150, x: [-1, 1], y: [0, 1.3], xl: 't', xt: [[-0.5, '-\\tfrac{\\tau}{2}'], [0, '0'], [0.5, '\\tfrac{\\tau}{2}']], yt: [[1, '1']] };
    const rect = PF.plot(Object.assign({}, common, { curves: [{ pts: [[-1, 0], [-0.5, 0], [-0.5, 1], [0.5, 1], [0.5, 0], [1, 0]] }] }));
    const tri = PF.plot(Object.assign({}, common, { curves: [{ pts: [[-1, 0], [-0.5, 0], [0, 1], [0.5, 0], [1, 0]] }] }));
    return PF.row([{ svg: rect, cap: 'rect(t/τ): height 1 for |t| < τ/2. Width τ, area τ.' }, { svg: tri, cap: '△(t/τ): peak 1 at t = 0, zero at ±τ/2. Base τ, area τ/2.' }]).svg;
  }

  // the waveform at z = 0 and the profile at t = 6 μs for v = 300 m/μs toward +z
  function waveFig() {
    const wf = PF.plot({ w: 250, h: 150, x: [-0.5, 5.5], y: [0, 1.3], xl: 't\\ (\\mu\\text{s})', xt: [[0, '0'], [1, '1'], [4, '4']], yt: [[1, '1']], curves: [{ pts: [[-0.5, 0], [0, 0], [1, 1], [4, 0], [5.5, 0]] }] });
    const pr = PF.plot({ w: 250, h: 150, x: [0, 2.1], y: [0, 1.3], xl: 'z\\ (\\text{km})', xt: [[0.6, '0.6'], [1.5, '1.5'], [1.8, '1.8']], yt: [[1, '1']], curves: [{ pts: [[0, 0], [0.6, 0], [1.5, 1], [1.8, 0], [2.1, 0]] }] });
    return PF.row([{ svg: wf, cap: 'E(0, t): what a probe at z = 0 records. Fast rise, slow fall.' }, { svg: pr, cap: 'E(z, 6 μs), a snapshot, for v = 300 m/μs toward +z. The fast rise is at the front (1.5 to 1.8 km): the shape is flipped.' }]).svg;
  }

  function cosFig() {
    return PF.plot({
      w: 300, h: 170, x: [0, 2], y: [-1.3, 1.3], zero: true, xl: 'z',
      xt: [[0.5, '\\tfrac{\\lambda}{2}'], [1, '\\lambda'], [1.5, '\\tfrac{3\\lambda}{2}'], [2, '2\\lambda']], yt: [[1, '1'], [-1, '-1']],
      curves: [{ f: (z) => Math.cos(-2 * Math.PI * z) }, { f: (z) => Math.cos(2 * Math.PI * (0.125 - z)), cls: 'dash' }],
    });
  }

  // ================================================================ A: vectors
  EM.lesson('u0', {
    id: 'u0-vectors', topic: 'A', order: 1, ref: 'Used in every topic', title: 'Vectors, cross products and right-hand rules',
    steps: [
      R(md`
        !!key Why you care
          Every direction on Exam 2 is a cross product or a right-hand rule: the force $q\mathbf v\times\mathbf B$, the field circling a wire, $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ beside a sheet, the Poynting vector $\mathbf E\times\mathbf H$, the $d\mathbf S$ that goes with a path $C$. Spring 2018 1(i), 1(vi) and 5(a, b) and HW 5 #2 all turn on a direction.

        ### Notation

        - $\mathbf A$ (bold): a **vector**, a size and a direction. $A = |\mathbf A|$: its **magnitude**, a number $\ge 0$ with units.
        - $\hat x, \hat y, \hat z$: **unit vectors** (length 1, no units) along the axes. A hat always means length 1: $\hat n$ is a unit normal to a surface.
        - $A_x, A_y, A_z$: the **components**, signed numbers with the units of $\mathbf A$: $\mathbf A = A_x\hat x + A_y\hat y + A_z\hat z$, also written $(A_x, A_y, A_z)$.
        - $\theta$: the angle between two vectors, $0 \le \theta \le 180°$.
        - $\mathbf A\cdot\mathbf B$: the **dot product**, a number. $\mathbf A\times\mathbf B$: the **cross product**, a vector.
        - $(r, \phi, z)$: **cylindrical coordinates**. $r$ (m) is the distance from the $z$-axis, $\phi$ (rad) the angle from the $+x$ axis measured toward $+y$. $\hat r, \hat\phi, \hat z$: unit vectors away from the axis, around it, along it.

        ### The idea

        A field puts a vector at every point. Two products do all the work. The **dot product** asks how much of one vector lies along another: flux ($\mathbf B\cdot d\mathbf S$), work and voltage ($\mathbf E\cdot d\mathbf l$). The **cross product** builds a vector **perpendicular to both**: forces, the field of a current, the direction power flows. Its direction comes from your right hand.
      `),
      R(md`
        ### Step 1: components and the dot product

        $$\mathbf A\cdot\mathbf B = A_xB_x + A_yB_y + A_zB_z = AB\cos\theta$$

        - Dotting with a unit vector **picks out a component**: $\mathbf A\cdot\hat x = A_x$.
        - Perpendicular: $\mathbf A\cdot\mathbf B = 0$. Parallel: $AB$. Opposite: $-AB$.
        - $\mathbf A\cdot\mathbf A = A^2$, so $A = \sqrt{A_x^2 + A_y^2 + A_z^2}$, and the unit vector along $\mathbf A$ is $\hat a = \mathbf A/A$.

        **Example.** $\mathbf A = 3\hat x + 4\hat y$: $A = 5$ and $\hat a = 0.6\hat x + 0.8\hat y$. With $\mathbf B = 2\hat x - \hat z$: $\mathbf A\cdot\mathbf B = (3)(2) + (4)(0) + (0)(-1) = 6$.
      `),
      Q(md`**Predict.** $\mathbf E = 3\hat x - 2\hat y + \hat z$ V/m. A short step of a path points along $-\hat y$: $d\mathbf l = -\hat y\,dl$. Then $\mathbf E\cdot d\mathbf l = $`,
        [md`$+2\,dl$`, md`$-2\,dl$`, md`$2\,dl\,\hat y$`, md`$\sqrt{14}\,dl$`], 0,
        [null, md`That uses $d\mathbf l = +\hat y\,dl$. The step points along $-\hat y$ and $E_y$ is negative too: two minus signs.`, 'A dot product is a number, not a vector.', md`That is $|\mathbf E|\,dl$: it counts the whole field, not the part along the step.`],
        md`$\mathbf E\cdot d\mathbf l = E_y\,(-dl) = (-2)(-dl) = +2\,dl$ (volts, with $dl$ in meters). Only the component along the step counts.`),
      RF(md`
        ### Step 2: the cross product

        $$\mathbf A\times\mathbf B = (A_yB_z - A_zB_y)\,\hat x + (A_zB_x - A_xB_z)\,\hat y + (A_xB_y - A_yB_x)\,\hat z$$

        - **Size:** $|\mathbf A\times\mathbf B| = AB\sin\theta$, the area of the parallelogram the two vectors span. Parallel vectors give $0$.
        - **Direction:** perpendicular to both, by the **right-hand rule**: fingers along $\mathbf A$, curl them toward $\mathbf B$ through the smaller angle; the thumb is $\mathbf A\times\mathbf B$.
        - **Order matters:** $\mathbf B\times\mathbf A = -\mathbf A\times\mathbf B$.

        [[fig:cycle]]

        For unit vectors, follow the cycle $x \to y \to z \to x$. Forward gives $+$, backward gives $-$, and a vector crossed with itself gives $0$:
        $$\hat x\times\hat y = \hat z \qquad \hat y\times\hat z = \hat x \qquad \hat z\times\hat x = \hat y \qquad \hat y\times\hat x = -\hat z$$

        **Example.** A charge moves with $\mathbf v = v\hat x$ through $\mathbf B = B\hat z$: $\mathbf v\times\mathbf B = vB\,(\hat x\times\hat z) = -vB\,\hat y$ ($x \to z$ is backward). A proton is pushed toward $-y$, an electron toward $+y$.
      `, { cycle: { svg: cycleFig(), cap: 'Cross two unit vectors along the arrows and you get the third with a plus sign; against the arrows, a minus sign.' } }),
      Q(md`**Predict.** $\hat z\times\hat y = $`,
        [md`$-\hat x$`, md`$+\hat x$`, md`$0$`, md`$-\hat y$`], 0,
        [null, md`$z \to y$ runs against the cycle $x \to y \to z$, so the sign is minus.`, 'Only parallel vectors have a zero cross product.', md`A cross product is perpendicular to both factors, so it has no $\hat y$ part.`],
        md`$\hat y\times\hat z = \hat x$, and reversing the order flips the sign: $\hat z\times\hat y = -\hat x$.`),
      RF(md`
        ### Step 3: the curl right-hand rule

        The second form of the rule ties a **circulation** to an **axis**: curl the fingers along the circulation and the thumb gives the axis (or the reverse). Three uses:

        - **A path and its surface.** Fingers along the path $C$, thumb along $d\mathbf S$ (Ampère, Faraday, Stokes).
        - **A loop current and its field.** Fingers along the current, thumb along $\mathbf B$ inside the loop and at its center.
        - **A straight wire.** Thumb along the current $I$; the fingers curl the way $\mathbf B$ circles. For $I$ along $+\hat z$, $\mathbf B$ is along $+\hat\phi$: counterclockwise seen from $+z$, looking back at the current coming toward you.

        [[fig:rhr]]

        It is the cross product in disguise: for a current along $\hat z$, $\mathbf B$ at a point is along $\hat z\times\hat r = \hat\phi$, where $\hat r$ points from the wire to the point.
      `, { rhr: { svg: PF.row([{ svg: wireFig(), cap: 'Thumb along I (up): B circles counterclockwise seen from above.' }, { svg: loopFig(), cap: 'Fingers along C (counterclockwise from above): the thumb gives dS, up.' }]).svg } }),
      Q(md`**Predict.** A long wire on the $z$-axis carries current toward $-z$. At the point $(0, 2, 0)$ m, $\mathbf B$ points along…`,
        [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat y$, away from the wire`, md`$-\hat z$, along the current`], 0,
        [null, md`That is the field for current along $+z$. Reversing the current reverses $\mathbf B$.`, 'The field of a wire circles it; it never points away from it.', md`$\mathbf B$ is perpendicular to the current that makes it.`],
        md`The current is along $-\hat z$ and the point lies along $\hat r = \hat y$ from the wire: $\mathbf B \propto (-\hat z)\times\hat y = -(\hat z\times\hat y) = +\hat x$. With the hand: thumb down; on the $+y$ side the fingers move toward $+x$.`),
      RF(md`
        ### Step 4: cylindrical coordinates

        Around a wire or a cylinder, use the distance $r$ from the $z$-axis and the angle $\phi$:
        $$x = r\cos\phi, \quad y = r\sin\phi, \quad r = \sqrt{x^2 + y^2}$$
        $$\hat r = \cos\phi\,\hat x + \sin\phi\,\hat y \qquad \hat\phi = -\sin\phi\,\hat x + \cos\phi\,\hat y$$

        [[fig:cyl]]

        - $\hat r$ points straight away from the axis. $\hat\phi$ is tangent to the circle through the point, **counterclockwise seen from $+z$**.
        - $(\hat r, \hat\phi, \hat z)$ is right-handed, the same cycle as $(x, y, z)$: $\hat r\times\hat\phi = \hat z$, $\hat\phi\times\hat z = \hat r$, $\hat z\times\hat r = \hat\phi$.
        - **They change from point to point.** At $(1, 0)$: $\hat r = \hat x$, $\hat\phi = \hat y$. At $(0, 1)$: $\hat r = \hat y$, $\hat\phi = -\hat x$. Fields from different sources, each written with its own $\hat\phi$, cannot be added term by term; convert to $\hat x, \hat y$ first.
        - The formula sheet's $r$ is this cylindrical radius for lines and cylinders, and the distance from the origin for a point charge.
      `, { cyl: { svg: cylFig(), cap: 'Top view. At each point r̂ points away from the z-axis and φ̂ along the circle, counterclockwise. The two points have different r̂ and φ̂.' } }),
      Q(md`**Predict.** At the point $(x, y) = (0, -3)$ m, $\hat\phi = $`,
        [md`$+\hat x$`, md`$-\hat x$`, md`$-\hat y$`, md`$+\hat y$`], 0,
        [null, md`That is clockwise. On the $-y$ side, counterclockwise (seen from $+z$) runs toward $+x$.`, md`That is $\hat r$ there: it points away from the axis.`, md`That points toward the axis: $-\hat r$.`],
        md`$\phi = 270°$: $\hat\phi = -\sin270°\,\hat x + \cos270°\,\hat y = +\hat x$. Picture it: the bottom of a counterclockwise circle moves to the right.`),
      R(md`
        ### The method

        !!method Any direction in four moves
          1. Write each vector in unit vectors: $\hat x, \hat y, \hat z$, or $\hat r, \hat\phi, \hat z$ **at that point**.
          2. Cross the unit vectors with the cycle: forward $+$, backward $-$, parallel $0$.
          3. Multiply the signs and the sizes, including the sign of the charge.
          4. Check with your right hand.

        ### Worked example

        !!graded Problem
          An electron ($q = -1.6\times10^{-19}$ C) moves with $\mathbf v = (3\hat x + 4\hat y)\times10^5$ m/s through $\mathbf B = 0.2\,\hat z$ T. Find $\mathbf F = q\mathbf v\times\mathbf B$ and its size.

        **1. Unit vectors.** $\hat x\times\hat z = -\hat y$ (backward), $\hat y\times\hat z = +\hat x$ (forward).

        **2. Cross product.**
        $$\mathbf v\times\mathbf B = (10^5)(0.2)\left[3(\hat x\times\hat z) + 4(\hat y\times\hat z)\right] = 2\times10^4\,(4\hat x - 3\hat y)\ \text{T·m/s}$$

        **3. Times the charge.**
        $$\mathbf F = (-1.6\times10^{-19}\,\text{C})(2\times10^4\,\text{T·m/s})(4\hat x - 3\hat y) = (-1.28\,\hat x + 0.96\,\hat y)\times10^{-14}\ \text{N}$$

        **4. Size.** $|\mathbf F| = |q|vB\sin90° = (1.6\times10^{-19}\,\text{C})(5\times10^5\,\text{m/s})(0.2\,\text{T}) = 1.6\times10^{-14}$ N.

        **Check.** $\mathbf F\cdot\mathbf v \propto (-1.28)(3) + (0.96)(4) = 0$: the magnetic force is perpendicular to the velocity, as it must be. Units: C·(m/s)·T = N. ✓

        !!mistake Common mistakes
          - Using the left hand (it happens when the right one holds the pen).
          - $\hat x\times\hat z = +\hat y$. It is $-\hat y$: $z \to x$ is forward, $x \to z$ is backward.
          - Forgetting the sign of the charge: an electron's force is opposite to $\mathbf v\times\mathbf B$.
          - Treating $\hat r$ and $\hat\phi$ as fixed directions and adding them from different points.
          - Writing a dot product as a vector, or a cross product as a number.
          - Reversing the order: $\mathbf H\times\mathbf E$ points against the power flow $\mathbf E\times\mathbf H$.

        ### Check questions
      `),
      Q(md`$\hat y\times\hat x = $`, [md`$-\hat z$`, md`$+\hat z$`, md`$0$`, md`$\hat x\times\hat y$`], 0,
        [null, md`$y \to x$ runs backward on the cycle, so the sign is minus.`, 'Only parallel vectors give zero.', md`$\hat x\times\hat y = +\hat z$; reversing the order flips the sign.`],
        md`$\hat x\times\hat y = \hat z$, so $\hat y\times\hat x = -\hat z$.`),
      Q(md`An electron moves along $+\hat x$ through $\mathbf B = B\hat z$ ($B > 0$). The magnetic force on it points along…`,
        [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat z$`, 'no direction: the force is zero'], 0,
        [null, md`That is the direction of $\mathbf v\times\mathbf B$, the force on a **positive** charge.`, 'The force is perpendicular to the field.', md`$\mathbf v$ is perpendicular to $\mathbf B$, so the force is as large as it can be.`],
        md`$\hat x\times\hat z = -\hat y$, and $q < 0$ flips it: $+\hat y$.`),
      Q(md`A long wire on the $z$-axis carries current along $+\hat z$. At $(x, y, z) = (-2, 0, 0)$ m, $\mathbf B$ points along…`,
        [md`$-\hat y$`, md`$+\hat y$`, md`$-\hat x$`, md`$+\hat z$`], 0,
        [null, md`That is clockwise seen from $+z$. At $\phi = 180°$, $\hat\phi = -\hat y$.`, md`That points away from the wire; $\mathbf B$ circles it.`, md`$\mathbf B$ is perpendicular to the current.`],
        md`$\mathbf B \propto \hat z\times\hat r$ with $\hat r = -\hat x$ (from the wire to the point): $\hat z\times(-\hat x) = -\hat y$. Equivalently $\hat\phi = -\sin180°\,\hat x + \cos180°\,\hat y = -\hat y$.`),
      Q(md`A loop in the $xy$-plane carries a current that flows **clockwise** seen from $+z$. At its center, $\mathbf B$ points along…`,
        [md`$-\hat z$`, md`$+\hat z$`, md`$+\hat x$`, 'nowhere: it is zero at the center'], 0,
        [null, 'Counterclockwise seen from +z would give +ẑ. Curl your fingers clockwise as you look down: the thumb points away from you.', 'The field at the center of a loop is along its axis.', 'Every piece of the loop adds field at the center in the same direction.'],
        'Fingers clockwise seen from above, thumb down: −ẑ.'),
      Q(md`At some instant a plane wave has $\mathbf E$ along $+\hat y$ and $\mathbf H$ along $+\hat x$. It travels toward…`,
        [md`$-\hat z$`, md`$+\hat z$`, md`$+\hat y$`, md`$+\hat x$`], 0,
        [null, md`That would be $\hat x\times\hat y$. Power flows along $\mathbf E\times\mathbf H$, in that order.`, 'A plane wave travels perpendicular to its fields.', 'A plane wave travels perpendicular to its fields.'],
        md`$\mathbf E\times\mathbf H \propto \hat y\times\hat x = -\hat z$.`),
      Q(md`$\mathbf A = 2\hat x + \hat y$ and $\mathbf B = \hat x - 2\hat y + 5\hat z$. Which is true?`,
        [md`$\mathbf A\cdot\mathbf B = 0$: they are perpendicular`, md`$\mathbf A\cdot\mathbf B = 4$`, md`$\mathbf A\cdot\mathbf B = 5$`, md`$\mathbf A\times\mathbf B = 0$`], 0,
        [null, md`That treats $(1)(-2)$ as $+2$.`, md`$A_z = 0$, so the $z$ term is $0\cdot5 = 0$.`, 'The cross product vanishes only for parallel vectors; these are not parallel.'],
        md`$(2)(1) + (1)(-2) + (0)(5) = 0$.`),
      Q(md`$(\hat x + \hat y)\times(2\hat x + 2\hat y) = $`, ['$0$', md`$2\hat z$`, md`$4\hat z$`, '$4$'], 0,
        [null, md`The terms $2\hat x\times\hat y$ and $2\hat y\times\hat x$ cancel.`, 'The two vectors are parallel, so the parallelogram has no area.', 'A cross product is a vector, and here it is the zero vector.'],
        md`The second vector is twice the first: parallel, so $\sin\theta = 0$.`),
      Q(md`At $(x, y) = (-1, -1)$ m, $\hat r = $`,
        [md`$-\tfrac{1}{\sqrt2}(\hat x + \hat y)$`, md`$\tfrac{1}{\sqrt2}(\hat x + \hat y)$`, md`$\tfrac{1}{\sqrt2}(\hat x - \hat y)$`, md`$-\hat x - \hat y$`], 0,
        [null, 'That points toward the axis from this point.', md`That is $\hat\phi$ there ($\phi = 225°$).`, 'That has length √2; a unit vector has length 1.'],
        md`$\phi = 225°$: $\hat r = \cos225°\,\hat x + \sin225°\,\hat y = -\tfrac{1}{\sqrt2}(\hat x + \hat y)$, pointing away from the axis.`),
      Q(md`$\hat\phi\times\hat z = $`, [md`$\hat r$`, md`$-\hat r$`, md`$\hat\phi$`, '$0$'], 0,
        [null, md`$(\hat r, \hat\phi, \hat z)$ is a right-handed cycle like $(x, y, z)$; $\phi \to z$ is forward.`, 'The cross product is perpendicular to both factors.', 'They are perpendicular, not parallel.'],
        md`Same cycle as $\hat y\times\hat z = \hat x$.`),
      Q(md`Two parallel wires lie in the $xy$-plane and carry currents $I_1 > 0$ and $I_2 > 0$ in the same direction. The wires…`,
        ['attract', 'repel', md`feel a force along $z$`, 'feel no force'], 0,
        [null, 'Antiparallel currents repel; parallel ones attract.', md`$I\,d\mathbf l\times\mathbf B$ with $d\mathbf l$ in the plane and $\mathbf B$ along $z$ at the other wire gives a force **in** the plane.`, 'Each wire sits in the other\'s field and carries current across it.'],
        md`Put wire 1 on the $x$-axis and wire 2 at $y = d$, both along $+\hat x$. Wire 1's field at wire 2 is along $\hat x\times\hat y = +\hat z$. The force on wire 2 is along $\hat x\times\hat z = -\hat y$: toward wire 1.`, { src: 'Spring 2018 Exam 2' }),
      R(md`
        ### Drills with new situations every time

        Six right answers complete a rapid card; two complete a Level 3 problem.
      `),
      level(1, 'recognize', md`**The trick:** forward on $x \to y \to z \to x$ is $+$, backward is $-$; the same cycle works for $\hat r \to \hat\phi \to \hat z$.`),
      Object.assign(G('rf_u0_cross', { need: 6 }), { id: 'u0-vectors.r0' }),
      level(2, 'apply a right-hand rule', md`**The trick:** write both directions as signed unit vectors, cross them, then multiply in the sign of the charge.`),
      Object.assign(G('rf_u0_rhr', { need: 6 }), { id: 'u0-vectors.r1' }),
      level(3, 'compute', md`**The trick:** write the determinant's three rows out, one component at a time, and check $(\mathbf A\times\mathbf B)\cdot\mathbf A = 0$.`),
      Object.assign(G('u0_vec_calc', { need: 2 }), { id: 'u0-vectors.r2' }),
    ],
  });

  // ================================================================ B: integrals
  EM.lesson('u0', {
    id: 'u0-integrals', topic: 'B', order: 2, ref: 'Used in Topics 1–17', title: 'Line integrals, flux and the two theorems',
    steps: [
      R(md`
        !!key Why you care
          Every law in the left column of the formula sheet is a line or surface integral, and setting up $d\mathbf l$ and $d\mathbf S$ with the right directions is half of every Gauss, Ampère and Faraday problem: HW 5 #1 (flux through a cone, from $\oint\mathbf B\cdot d\mathbf S = 0$), HW 6 #1 (one rectangle walked both ways), Spring 2018 #2(a) (flux of $B \propto 1/r$ through a toroid's cross-section).

        ### Notation

        - $C$: a **path** with a direction. $d\mathbf l$: a short step along it (m), pointing the way you walk.
        - $\int_C\mathbf F\cdot d\mathbf l$: the **line integral** of $\mathbf F$ along $C$. $\oint_C$: $C$ is **closed** (it ends where it starts); the integral is the **circulation**.
        - $S$: a **surface**. $d\mathbf S = \hat n\,dS$: a small patch of it as a vector, with size = its area $dS$ (m²) and direction = its unit normal $\hat n$.
        - $\int_S\mathbf F\cdot d\mathbf S$: the **flux** of $\mathbf F$ through $S$. $\oint_S$: $S$ is **closed** (it encloses a volume).
        - $V$: a volume; $dV$ a small piece of it (m³).
        - Fluxes with names: magnetic flux $\Psi = \int_S\mathbf B\cdot d\mathbf S$ (Wb), current $I = \int_S\mathbf J\cdot d\mathbf S$ (A), and $\int_S\mathbf D\cdot d\mathbf S$ (C).

        ### The idea

        A line integral adds up how much a field pushes **along** a path; for $\mathbf E$ that is a voltage. A surface integral adds up how much a field **crosses** a surface. Both depend on a direction you choose, the way you walk $C$ or the side $d\mathbf S$ points to, and the sign of the answer comes from that choice.
      `),
      R(md`
        ### Step 1: line integrals

        $$\int_C\mathbf E\cdot d\mathbf l = \int_CE_l\,dl, \qquad E_l = \text{the component of }\mathbf E\text{ along the path}$$

        - **Along an axis**, from $x = a$ to $x = b$: write $d\mathbf l = \hat x\,dx$ and compute $\int_a^bE_x\,dx$. Walking back from $b$ to $a$ swaps the limits, which flips the sign. Let the limits carry the direction; do not also put a minus sign on $d\mathbf l$.
        - **Around a circle** of radius $r$ about the $z$-axis, counterclockwise from $+z$: $d\mathbf l = \hat\phi\,r\,d\phi$ with $\phi$ from $0$ to $2\pi$. For $\mathbf H = H_\phi(r)\hat\phi$: $\oint\mathbf H\cdot d\mathbf l = 2\pi rH_\phi$.
        - A segment perpendicular to the field contributes $0$.

        **Example.** $\mathbf F = y\,\hat x$ around the unit square $(0,0) \to (1,0) \to (1,1) \to (0,1) \to (0,0)$, counterclockwise from $+z$. Bottom ($y = 0$): $\mathbf F = 0$. Right side: $d\mathbf l = \hat y\,dy$ and $\mathbf F\cdot\hat y = 0$. Top ($y = 1$), walking from $x = 1$ to $x = 0$: $\int_1^0 1\,dx = -1$. Left side: $0$ again. So $\oint\mathbf F\cdot d\mathbf l = -1$.
      `),
      Q(md`**Predict.** $\mathbf E = 5\,\hat x$ V/m everywhere. Along the $x$-axis from $x = 2$ m to $x = 0$, $\int\mathbf E\cdot d\mathbf l = $`,
        ['$-10$ V', '$+10$ V', '$0$', md`$-10\,\hat x$ V`], 0,
        [null, md`That walks from $0$ to $2$. This path runs against $\mathbf E$.`, 'The path runs along the field line, so the integral is not zero.', 'A line integral of a dot product is a number.'],
        md`$\int_2^0 5\,dx = 5\,(0 - 2) = -10$ V. With the sheet's $V_A - V_B = \int_A^B\mathbf E\cdot d\mathbf l$: $V(2) - V(0) = -10$ V, so $x = 0$ is 10 V higher, as it should be upstream of $\mathbf E$.`),
      R(md`
        ### Step 2: surface integrals and flux

        $$\int_S\mathbf B\cdot d\mathbf S = \int_SB_n\,dS, \qquad B_n = \mathbf B\cdot\hat n = \text{the part of }\mathbf B\text{ that crosses }S$$

        Write $d\mathbf S$ as (unit normal) × (the two small lengths that span the patch):

        | Surface | $d\mathbf S$ |
        |---|---|
        | plane $z = $ const | $\pm\hat z\,dx\,dy$ |
        | plane $x = $ const | $\pm\hat x\,dy\,dz$ |
        | plane $y = $ const | $\pm\hat y\,dx\,dz$ |
        | disk centered on the $z$-axis | $\pm\hat z\,r\,dr\,d\phi$ |
        | curved side of a cylinder $r = a$ | $\pm\hat r\,a\,d\phi\,dz$ |
        | half-plane $\phi = $ const (it contains the $z$-axis) | $\pm\hat\phi\,dr\,dz$ |

        The $r$ in $r\,d\phi$ is there because a step $d\phi$ in angle is an arc of length $r\,d\phi$. A **uniform** field through a **flat** surface needs no integral: $\int\mathbf B\cdot d\mathbf S = (\mathbf B\cdot\hat n)A$.

        **Example.** $\mathbf B = B_0(x/a)\,\hat z$ through the square $0 < x < a$, $0 < y < a$, with $d\mathbf S = +\hat z\,dx\,dy$:
        $$\Psi = \int_0^a\!\!\int_0^a B_0\frac{x}{a}\,dx\,dy = \frac{B_0a^2}{2}$$
        Half of "$B_0$ times the area": the field grows from 0 to $B_0$ across the square.
      `),
      Q(md`**Predict.** A uniform $\mathbf B = B_0\hat z$ and a cylinder of radius $a$ and length $L$ on the $z$-axis. The flux of $\mathbf B$ out through its **curved side** is…`,
        ['$0$', md`$B_0\,2\pi aL$`, md`$B_0\pi a^2$`, md`$-B_0\pi a^2$`], 0,
        [null, md`That treats $\mathbf B$ as crossing the side. On the side $d\mathbf S$ is along $\hat r$, and $\hat z\cdot\hat r = 0$.`, md`That is the outward flux through the top face, not the side.`, md`That is the outward flux through the bottom face, where the normal is $-\hat z$.`],
        md`On the curved side, $\mathbf B\cdot d\mathbf S = B_0(\hat z\cdot\hat r)\,a\,d\phi\,dz = 0$: the field runs along the side and never crosses it.`),
      RF(md`
        ### Step 3: closed surfaces, and the C ↔ dS pairing

        **Closed surface:** $d\mathbf S$ points **outward**, always; there is no choice to make. $\oint_S\mathbf D\cdot d\mathbf S$ is the net flux leaving the volume, and Gauss's law sets it equal to the charge inside. A cylinder on the $z$-axis has three faces:

        [[fig:box]]

        **Open surface with a rim $C$:** the right-hand rule ties them. Fingers along $C$, thumb along $d\mathbf S$. In Ampère's law, $\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S$, a current counts as positive when it crosses $S$ along $d\mathbf S$. In Faraday's law, the emf along $C$ goes with the flux along $d\mathbf S$.

        **Any surface on the same rim** carries the same flux of $\mathbf B$, because $\oint\mathbf B\cdot d\mathbf S = 0$: two surfaces with one rim together form a closed surface. Use the easiest one, usually flat.
      `, { box: { svg: boxFig(), cap: 'A closed cylinder on the z-axis: outward normals +ẑ on top, −ẑ on the bottom, r̂ on the curved side.' } }),
      Q(md`**Predict.** A line charge on the $z$-axis has $\mathbf D = D_r(r)\hat r$. For a closed cylinder of radius $a$ and length $L$ on the axis, which faces contribute to $\oint\mathbf D\cdot d\mathbf S$?`,
        [md`only the curved side: $D_r(a)\,2\pi aL$`, 'only the top and bottom', 'all three faces', 'none: the field is radial'], 0,
        [null, md`On the top and bottom $d\mathbf S = \pm\hat z\,dS$, perpendicular to a radial field.`, 'The flat faces contribute nothing: their normals are perpendicular to the field.', md`Radial is exactly the direction of the side's normal $\hat r$.`],
        md`On the side $d\mathbf S = \hat r\,a\,d\phi\,dz$ is along the field and $D_r(a)$ is the same everywhere on it: $\oint\mathbf D\cdot d\mathbf S = D_r(a)\cdot2\pi aL$. This is Gauss's law for a line charge in one line.`),
      R(md`
        ### Step 4: Stokes' theorem and the divergence theorem

        Each theorem trades an integral over a boundary for an integral over what it bounds. Each uses a derivative of the field, computed in [Lesson C](#/l/u0-curl-div): the **curl** $\nabla\times\mathbf F$ (circulation per unit area) and the **divergence** $\nabla\cdot\mathbf F$ (outflow per unit volume).

        **Stokes:** the circulation around $C$ equals the flux of the curl through any surface $S$ on $C$, with $C$ and $d\mathbf S$ paired by the right-hand rule:
        $$\oint_C\mathbf F\cdot d\mathbf l = \int_S(\nabla\times\mathbf F)\cdot d\mathbf S$$

        **Divergence theorem:** the net outward flux through a closed $S$ equals the total divergence inside it:
        $$\oint_S\mathbf F\cdot d\mathbf S = \int_V\nabla\cdot\mathbf F\,dV$$

        This is how each row of the formula sheet turns from integral form to differential form. $\oint\mathbf D\cdot d\mathbf S = \int\rho\,dV$ for **every** volume means $\nabla\cdot\mathbf D = \rho$ at every point. Faraday's law for every surface means $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$ at every point.

        **Check with Step 1.** $\mathbf F = y\,\hat x$ has $\nabla\times\mathbf F = -\hat z$. Through the unit square with $d\mathbf S = +\hat z$ (counterclockwise $C$): $\int(-1)\,dS = -1$, the circulation found by walking around. ✓
      `),
      Q(md`**Predict.** A field has $\nabla\cdot\mathbf F = 3$ everywhere (in units of $\mathbf F$ per meter). The net outward flux of $\mathbf F$ through the surface of a cube of side 2 m is…`,
        ['$24$', '$3$', '$72$', '$0$'], 0,
        [null, 'That is the divergence at one point. Integrate it over the volume.', md`That multiplies by the surface area ($24\,\text{m}^2$); the theorem integrates over the **volume** ($8\,\text{m}^3$).`, 'Zero needs zero total divergence inside.'],
        md`$\oint\mathbf F\cdot d\mathbf S = \int_V3\,dV = 3\times(2\,\text{m})^3 = 24$.`),
      RF(md`
        ### The method

        !!method Setting up any flux or circulation
          1. Draw the path or surface. Choose the direction of $C$ (or of $d\mathbf S$); for a closed surface $d\mathbf S$ points outward.
          2. Write $d\mathbf l$ or $d\mathbf S$ from the table: unit vector × the small lengths.
          3. Dot the field into it. Only the component along $d\mathbf l$ or $d\mathbf S$ survives; faces the field runs along give 0.
          4. Integrate with limits that follow the path, start to end.
          5. Sign check: does the field cross along $d\mathbf S$ (positive) or against it?

        ### Worked example

        !!graded Problem
          A long straight wire carries $I = 10$ A upward. A rectangle lies in the same plane, from $d = 10$ cm to $d + w = 30$ cm from the wire, with height $h = 50$ cm. Find the magnetic flux through it, with $C$ clockwise on the page.

        [[fig:wr]]

        **1. Field.** Thumb up along $I$: on the right side the fingers go into the page. $B = \dfrac{\mu_0I}{2\pi r}$, into the page, at distance $r$.

        **2. Surface.** Clockwise $C$ on the page puts the thumb, and $d\mathbf S$, into the page: $d\mathbf S = (\text{into})\,dr\,dz$. The field and $d\mathbf S$ agree, so $\Psi > 0$.

        **3. Integrate.** $B$ varies with $r$, so it cannot be pulled out as $B \times$ area:
        $$\Psi = \int_0^h\!\!\int_d^{d+w}\frac{\mu_0I}{2\pi r}\,dr\,dz = \frac{\mu_0Ih}{2\pi}\ln\frac{d + w}{d}$$

        **4. Numbers.**
        $$\Psi = \frac{(4\pi\times10^{-7}\,\text{H/m})(10\,\text{A})(0.5\,\text{m})}{2\pi}\ln3 = (10^{-6}\,\text{Wb})(1.099) = 1.10\times10^{-6}\ \text{Wb}$$

        **Check.** Units: (H/m)·A·m = H·A = Wb. ✓ The near side, where $B$ is strongest, dominates; that is the logarithm. This is the integral of Spring 2018 #2(a), where $r$ runs across a toroid's cross-section.

        !!mistake Common mistakes
          - Flipping twice: a minus sign on $d\mathbf l$ **and** limits running backward.
          - $d\mathbf S$ on a cylinder side written as $d\phi\,dz$: the patch is $a\,d\phi$ wide.
          - An inward $d\mathbf S$ on a closed surface.
          - Choosing $C$ and $d\mathbf S$ independently in Ampère's or Faraday's law.
          - Multiplying a nonuniform $B$ by the area.
          - Taking the flux through the wrong face: the part of $\mathbf B$ along the surface crosses nothing.

        ### Check questions
      `, { wr: { svg: wireRectFig(), cap: 'B points into the page over the rectangle. Clockwise C on the page: dS into the page.' } }),
      Q(md`A point charge $Q$ sits at the center of a cube. The flux of $\mathbf D$ through **one** face is…`,
        [md`$Q/6$`, md`$Q$`, md`$Q/4\pi$`, '$0$'], 0,
        [null, md`$Q$ is the flux through all six faces together.`, md`$4\pi$ is the solid angle of a whole sphere; Gauss's law has no $4\pi$ for $\mathbf D$.`, 'The field leaves through every face.'],
        md`Gauss: $\oint\mathbf D\cdot d\mathbf S = Q$, and the six faces are identical by symmetry.`),
      Q(md`A wire on the $z$-axis carries current $I$ along $-\hat z$. Around a circle of radius $r$ about it, counterclockwise seen from $+z$, $\oint\mathbf H\cdot d\mathbf l = $`,
        [md`$-I$`, md`$+I$`, md`$I/2\pi r$`, '$0$'], 0,
        [null, md`Counterclockwise from $+z$ pairs with $d\mathbf S = +\hat z$; the current crosses along $-\hat z$, against it.`, md`That is $H$ itself, not its circulation.`, 'The circle encloses the current.'],
        md`$\oint\mathbf H\cdot d\mathbf l = \int\mathbf J\cdot d\mathbf S$ with $d\mathbf S = +\hat z$: the current crosses against $d\mathbf S$, so $-I$.`),
      Q(md`$\mathbf E = E_0\hat r$ in cylindrical coordinates. Around a circle of radius $a$ centered on the $z$-axis, $\oint\mathbf E\cdot d\mathbf l = $`,
        ['$0$', md`$2\pi aE_0$`, md`$\pi a^2E_0$`, md`$-2\pi aE_0$`], 0,
        [null, md`On the circle $d\mathbf l = \hat\phi\,a\,d\phi$, perpendicular to $\hat r$.`, 'That is an area times a field, not a line integral.', md`On the circle $d\mathbf l$ is along $\pm\hat\phi$, perpendicular to $\hat r$.`],
        md`$\hat r\cdot\hat\phi = 0$ at every point of the circle.`),
      Q(md`$\mathbf B = -2\,\hat z$ T is uniform. A flat loop of area $0.5\,\text{m}^2$ lies in the $xy$-plane, and $C$ runs counterclockwise seen from $+z$. The flux along $d\mathbf S$ is…`,
        ['$-1$ Wb', '$+1$ Wb', '$-4$ Wb', '$0$'], 0,
        [null, md`Counterclockwise from $+z$ gives $d\mathbf S = +\hat z$, and $\mathbf B$ points the other way.`, 'That divides B by the area; flux multiplies them.', 'The loop faces the field.'],
        md`$\Psi = (\mathbf B\cdot\hat z)A = (-2)(0.5) = -1$ Wb.`),
      Q(md`$\mathbf B = B_0(r/a)\,\hat z$ on a disk of radius $a$ in the $xy$-plane, $d\mathbf S = +\hat z$. The flux is…`,
        [md`$\tfrac{2\pi}{3}B_0a^2$`, md`$\pi B_0a^2$`, md`$\tfrac{\pi}{2}B_0a^2$`, md`$\pi B_0a$`], 0,
        [null, md`That treats $B$ as uniform at its edge value $B_0$.`, md`That averages $B$ linearly over the radius; the outer rings have more area, so weight by $r\,dr$.`, md`That drops the $r$ in $dS = r\,dr\,d\phi$; the units are wrong.`],
        md`$\Psi = \int_0^{2\pi}\!\!\int_0^aB_0\dfrac{r}{a}\,r\,dr\,d\phi = 2\pi\dfrac{B_0}{a}\dfrac{a^3}{3} = \dfrac{2\pi}{3}B_0a^2$.`),
      Q(md`Which theorem turns $\oint_S\mathbf D\cdot d\mathbf S = \int_V\rho\,dV$ into $\nabla\cdot\mathbf D = \rho$?`,
        ['the divergence theorem', 'Stokes\' theorem', 'the right-hand rule', 'the fundamental theorem of calculus for line integrals'], 0,
        [null, 'Stokes relates a circulation to a curl flux; this is a closed-surface flux.', 'The RHR pairs C and dS; it relates no integrals.', 'That one handles line integrals of gradients.'],
        md`$\oint_S\mathbf D\cdot d\mathbf S = \int_V\nabla\cdot\mathbf D\,dV$; equal to $\int_V\rho\,dV$ for every $V$, so the integrands match.`),
      Q(md`HW 6 #1 asks for the emf $\oint_C\mathbf E\cdot d\mathbf l$ around one rectangle, first one way, then the other. The second answer is…`,
        ['the negative of the first', 'the same as the first', 'zero', 'twice the first'], 0,
        [null, 'Every $d\\mathbf l$ reverses, so every contribution changes sign.', 'Only a field with zero circulation gives zero both ways.', 'Reversing the path cannot change the size.'],
        md`Reversing $C$ reverses every $d\mathbf l$: the circulation flips sign (and so does the paired $d\mathbf S$ in Stokes' theorem).`),
      Q(md`A loop $C$ is the rim of a flat disk $S_1$ and also of a bag-shaped surface $S_2$ (the same rim, ballooning out). The flux of $\mathbf B$ through $S_2$ is…`,
        [md`the same as through $S_1$`, md`larger, since $S_2$ has more area`, md`zero`, md`the negative of the flux through $S_1$`], 0,
        [null, md`More area does not mean more flux: the extra lines that enter the bag leave it too.`, 'The flux through the rim is generally not zero.', md`With both surfaces' $d\mathbf S$ paired to the same $C$, they agree; the minus sign appears only if you take $S_2$'s outward normal as for a closed surface.`],
        md`$S_1$ and $S_2$ together form a closed surface, through which $\oint\mathbf B\cdot d\mathbf S = 0$. So the flux depends only on the rim.`),
      R(md`
        ### Drills with new situations every time
      `),
      level(1, 'recognize', md`**The trick:** $d\mathbf S$ is the normal times the two small lengths; a $d\phi$ always comes with its radius.`),
      Object.assign(G('rf_u0_dS', { need: 6 }), { id: 'u0-integrals.r0' }),
      level(2, 'apply', md`**The trick:** a circle gives $2\pi r$, a uniform field gives (normal component) × area, a closed surface gives the enclosed source.`),
      Object.assign(G('rf_u0_lineint', { need: 6 }), { id: 'u0-integrals.r1' }),
      level(3, 'set up and integrate', md`**The trick:** field, $d\mathbf S$ from $C$, dot, integrate, sign check.`),
      Object.assign(G('u0_flux', { need: 2 }), { id: 'u0-integrals.r2' }),
    ],
  });

  // ================================================================ C: divergence, curl, partial derivatives
  EM.lesson('u0', {
    id: 'u0-curl-div', topic: 'C', order: 3, ref: 'Used in Topics 3, 5, 7, 12–16', title: 'Divergence, curl and partial anti-derivatives',
    steps: [
      R(md`
        !!key Why you care
          The right column of the formula sheet is written in $\nabla\cdot$ and $\nabla\times$. HW 7 #4 gets $\mathbf H$ from $\mathbf E$ with Faraday's law (and $\mathbf E$ from $\mathbf H$ with Ampère's), HW 7 #2 finds $\rho(t)$ from $\nabla\cdot\mathbf J$, HW 7 #5 checks the wave equation by differentiating, and Spring 2018 1(iv) and 1(v) are one-line divergence and curl questions. Exam 2 also tests the curl in **cylindrical** coordinates (the instructor, on Piazza): $\mathbf J$ from the $\mathbf H$ of a wire or a coax, as in the notes' coax examples. The formula sheet does not give it.

        ### Notation

        - $\partial f/\partial x$: the **partial derivative**: differentiate with respect to $x$ while holding every other variable ($y$, $z$, $t$) fixed.
        - $\nabla$ ("del"): the operator $\hat x\,\partial/\partial x + \hat y\,\partial/\partial y + \hat z\,\partial/\partial z$. It does nothing until it acts on something.
        - $\nabla f$: the **gradient** of a scalar $f$, a vector pointing uphill (steepest increase). $\mathbf E = -\nabla V$ points downhill in potential.
        - $\nabla\cdot\mathbf F$: the **divergence**, a scalar. $\nabla\times\mathbf F$: the **curl**, a vector. Both carry the units of $\mathbf F$ per meter: $\nabla\cdot\mathbf D$ is in C/m³, $\nabla\times\mathbf H$ in A/m².
        - $\nabla^2 = \nabla\cdot\nabla = \partial^2/\partial x^2 + \partial^2/\partial y^2 + \partial^2/\partial z^2$: the **Laplacian**.
        - $(r, \phi, z)$: cylindrical coordinates, with unit vectors $\hat r, \hat\phi, \hat z$ ([Lesson A](#/l/u0-vectors), Step 4); $r$ is the distance from the $z$-axis. $F_r, F_\phi, F_z$: the components of $\mathbf F$ along them.
        - $\cos(\omega t - \beta z)$: a sinusoidal wave ([Lesson E](#/l/u0-waveforms)), $\omega$ in rad/s, $\beta$ in rad/m. In a medium with permeability $\mu$ and permittivity $\epsilon$: $\beta/\omega = \sqrt{\mu\epsilon}$, and $\eta = \sqrt{\mu/\epsilon}$ ($\Omega$) is the ratio $E/H$.

        ### The idea

        Divergence measures how much a field **spreads out** of a point: a source density ($\nabla\cdot\mathbf D = \rho$). Curl measures how much it **circulates** around a point: a vortex density ($\nabla\times\mathbf H = \mathbf J$). They are the integrals of [Lesson B](#/l/u0-integrals) shrunk to a point: outflow per unit volume, and circulation per unit area.
      `),
      R(md`
        ### Step 1: partial derivatives

        Treat every other variable as a constant. For $f = x^2y\sin\omega t$:
        $$\frac{\partial f}{\partial x} = 2xy\sin\omega t \qquad \frac{\partial f}{\partial y} = x^2\sin\omega t \qquad \frac{\partial f}{\partial t} = \omega x^2y\cos\omega t$$

        The two you will take a hundred times, by the chain rule:
        $$\frac{\partial}{\partial t}\cos(\omega t - \beta z) = -\omega\sin(\omega t - \beta z) \qquad \frac{\partial}{\partial z}\cos(\omega t - \beta z) = +\beta\sin(\omega t - \beta z)$$
        In the second, the inside derivative is $-\beta$, and it cancels the minus from $\cos' = -\sin$.
      `),
      Q(md`**Predict.** $\dfrac{\partial}{\partial z}\sin(\omega t + \beta z) = $`,
        [md`$\beta\cos(\omega t + \beta z)$`, md`$-\beta\cos(\omega t + \beta z)$`, md`$\omega\cos(\omega t + \beta z)$`, md`$\beta\sin(\omega t + \beta z)$`], 0,
        [null, md`The inside derivative is $+\beta$ here, and $\sin' = +\cos$: no minus sign anywhere.`, md`That is $\partial/\partial t$; with respect to $z$ the chain rule brings down $\beta$.`, md`The derivative of $\sin$ is $\cos$.`],
        md`$\cos(\omega t + \beta z)$ times the inside derivative $\partial(\omega t + \beta z)/\partial z = \beta$.`),
      R(md`
        ### Step 2: divergence

        $$\nabla\cdot\mathbf F = \frac{\partial F_x}{\partial x} + \frac{\partial F_y}{\partial y} + \frac{\partial F_z}{\partial z}$$

        Each term asks: does the $x$-component change as you move **along** $x$? Spreading out gives a positive divergence, converging a negative one. A field that changes only **across** its own direction, like $y\,\hat x$, has zero divergence.

        **Example.** $\mathbf F = x^2y\,\hat x - z\,\hat y + 2xz\,\hat z$: $\nabla\cdot\mathbf F = 2xy + 0 + 2x$. At $(1, 2, 0)$: $4 + 2 = 6$.

        With the formula sheet's continuity equation, $\nabla\cdot\mathbf J + \partial\rho/\partial t = 0$, a positive $\nabla\cdot\mathbf J$ is the rate at which charge **drains** from a point: $\partial\rho/\partial t = -\nabla\cdot\mathbf J$.
      `),
      Q(md`**Predict.** $\nabla\cdot(y\,\hat x + x\,\hat y) = $`, ['$0$', '$2$', md`$x + y$`, md`$2\hat z$`], 0,
        [null, md`That differentiates each component by the wrong variable: $\partial F_x/\partial y + \partial F_y/\partial x$.`, 'That adds the components instead of differentiating them.', 'The divergence is a scalar.'],
        md`$\partial(y)/\partial x + \partial(x)/\partial y = 0 + 0$. Each component changes only across its own direction.`),
      RF(md`
        ### Step 3: curl

        $$\nabla\times\mathbf F = \left(\frac{\partial F_z}{\partial y} - \frac{\partial F_y}{\partial z}\right)\hat x + \left(\frac{\partial F_x}{\partial z} - \frac{\partial F_z}{\partial x}\right)\hat y + \left(\frac{\partial F_y}{\partial x} - \frac{\partial F_x}{\partial y}\right)\hat z$$

        Memorize the $\hat x$ component, $\partial_yF_z - \partial_zF_y$, then shift every letter along the cycle $x \to y \to z \to x$ to get the next. The $\hat z$ component is the circulation in the $xy$-plane per unit area.

        [[fig:shear]]

        **The case you will meet most:** one component that depends on one coordinate, as in every plane wave:
        $$\nabla\times\big(F_x(z,t)\,\hat x\big) = \frac{\partial F_x}{\partial z}\,\hat y \qquad \nabla\times\big(F_y(z,t)\,\hat y\big) = -\frac{\partial F_y}{\partial z}\,\hat x$$
        General rule: if $\mathbf F$ depends on only one coordinate $a$, then $\nabla\times\mathbf F = \hat a\times\dfrac{\partial\mathbf F}{\partial a}$.
      `, { shear: { svg: shearFig(), cap: 'F = y x̂: arrows right above the x-axis, left below. Nothing spreads out (∇·F = 0), but a paddle wheel at the origin turns clockwise seen from +z: ∇×F = −ẑ.' } }),
      Q(md`**Predict.** $\nabla\times\big(E_0\cos(\omega t - \beta z)\,\hat x\big) = $`,
        [md`$\beta E_0\sin(\omega t - \beta z)\,\hat y$`, md`$-\beta E_0\sin(\omega t - \beta z)\,\hat y$`, md`$\beta E_0\sin(\omega t - \beta z)\,\hat z$`, md`$-\omega E_0\sin(\omega t - \beta z)\,\hat y$`], 0,
        [null, md`$\partial_z\cos(\omega t - \beta z) = +\beta\sin(\omega t - \beta z)$: the two minus signs cancel.`, md`$\hat z\times\hat x = \hat y$: the curl of an $x$-directed field that varies with $z$ points along $y$.`, md`That is $\partial/\partial t$; the curl differentiates in space.`],
        md`$\nabla\times\mathbf E = \hat z\times\partial\mathbf E/\partial z = \hat z\times\hat x\,\beta E_0\sin(\omega t - \beta z) = \beta E_0\sin(\omega t - \beta z)\,\hat y$.`),
      R(md`
        ### Step 4: two identities

        For every vector field $\mathbf A$ and every scalar $f$:
        $$\nabla\cdot(\nabla\times\mathbf A) = 0 \qquad \nabla\times(\nabla f) = 0$$
        A curl has no sources; a gradient has no circulation. What they buy you:

        - $\mathbf B = \nabla\times\mathbf A$ makes $\nabla\cdot\mathbf B = 0$ automatic. A field with $\nabla\cdot\mathbf B \ne 0$ **cannot** be a magnetic field.
        - $\mathbf E = -\nabla V$ makes $\nabla\times\mathbf E = 0$ automatic. A field with curl cannot be electrostatic.
        - Take the divergence of $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$: the left side is 0, so $\nabla\cdot\mathbf J + \partial(\nabla\cdot\mathbf D)/\partial t = 0$, the continuity equation once $\nabla\cdot\mathbf D = \rho$. Charge conservation is built into Maxwell's equations.
      `),
      Q(md`**Predict.** Can $\mathbf B = \dfrac{B_0}{a}(x\,\hat x + y\,\hat y)$ be a magnetic flux density?`,
        [md`No: $\nabla\cdot\mathbf B = 2B_0/a \ne 0$`, 'Yes: any field can be', md`No: its curl is not zero`, md`Yes: it has no $z$-component`], 0,
        [null, md`Every magnetic field has $\nabla\cdot\mathbf B = 0$.`, md`Its curl **is** zero ($\partial_xB_y - \partial_yB_x = 0$); curl is not the test for $\mathbf B$.`, 'Having no z-component does not make the divergence vanish.'],
        md`$\partial_x(B_0x/a) + \partial_y(B_0y/a) = 2B_0/a$. Field lines spread out of the $z$-axis, which needs a magnetic source, and there is none.`),
      R(md`
        ### Step 5: partial anti-derivatives, and H from E

        Undoing a partial derivative, the "constant" of integration is any function of the **other** variables, since its partial derivative is zero:
        $$\frac{\partial g}{\partial t} = 6z\cos\omega t \quad\Rightarrow\quad g = \frac{6z}{\omega}\sin\omega t + h(x, y, z)$$

        This is how you get $\mathbf H$ from a given $\mathbf E$ (HW 7 #4). Take $\mathbf E = E_0\cos(\omega t - \beta z)\,\hat x$ in a medium with $\mu$ and $\epsilon$:

        1. **Curl** (Step 3): $\nabla\times\mathbf E = \hat y\,\beta E_0\sin(\omega t - \beta z)$.
        2. **Faraday**, $\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$: $\;\partial\mathbf H/\partial t = -\hat y\,(\beta E_0/\mu)\sin(\omega t - \beta z)$.
        3. **Anti-derivative in $t$** at fixed $z$: $\mathbf H = \hat y\,\dfrac{\beta E_0}{\mu\omega}\cos(\omega t - \beta z) + \mathbf h(x, y, z)$. The leftover $\mathbf h$ does not change in time; it is not part of the wave, so set $\mathbf h = 0$.
        4. **Simplify:** $\beta/(\mu\omega) = \sqrt{\mu\epsilon}/\mu = \sqrt{\epsilon/\mu} = 1/\eta$: $\;\mathbf H = \hat y\,(E_0/\eta)\cos(\omega t - \beta z)$.

        The same move in Gauss's law for a slab, $dD_z/dz = \rho(z)$, gives $D_z = \int\rho\,dz + C$; symmetry or a known value fixes $C$.
      `),
      Q(md`**Predict.** $\partial F/\partial x = 6xz^2$, where $F$ depends on $x$, $y$, $z$, $t$. Then $F = 3x^2z^2 + h$, where $h$ is an arbitrary…`,
        [md`function of $y$, $z$ and $t$`, 'number', md`function of $x$`, 'nothing: the anti-derivative is unique'], 0,
        [null, md`A number works, but so does anything without $x$ in it: $\partial h/\partial x = 0$ for all of them.`, md`A function of $x$ would change $\partial F/\partial x$.`, 'Only the derivative with respect to x is fixed.'],
        md`Any $h(y, z, t)$ has $\partial h/\partial x = 0$, so it is invisible to the given derivative. Something else (a boundary value, "no static part") must fix it.`),
      R(md`
        ### The method

        !!method A field from its partner (Faraday or Ampère)
          1. Write the field as one component depending on one coordinate $a$ and $t$.
          2. Curl it: $\nabla\times\mathbf F = \hat a\times\partial\mathbf F/\partial a$.
          3. Divide by $-\mu$ (Faraday, $\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$) or by $\epsilon$ (Ampère with $\sigma = 0$, $\nabla\times\mathbf H = \epsilon\,\partial\mathbf E/\partial t$).
          4. Anti-differentiate in $t$; drop the time-independent part.
          5. Check: $|\mathbf E|/|\mathbf H| = \eta$, and $\mathbf E\times\mathbf H$ points the way the wave travels.

        ### Worked example

        !!graded Problem
          In a medium with $\mu = \mu_0$ and $\epsilon = 4\epsilon_0$, $\mathbf E = 6\cos(\omega t + \beta z)\,\hat y$ V/m with $f = 100$ MHz. Find $\beta$ and $\mathbf H$.

        **1. Constants.** $\beta = \omega\sqrt{\mu\epsilon} = \dfrac{2\pi f\sqrt{4}}{c} = \dfrac{2\pi(10^8\,\text{s}^{-1})(2)}{3\times10^8\,\text{m/s}} = 4.19$ rad/m. $\;\eta = \dfrac{\eta_0}{\sqrt4} = 60\pi = 188.5\ \Omega$.

        **2. Curl.** $\mathbf E = E_y(z, t)\,\hat y$, so $\nabla\times\mathbf E = -\dfrac{\partial E_y}{\partial z}\hat x = -\big(-6\beta\sin(\omega t + \beta z)\big)\hat x = 6\beta\sin(\omega t + \beta z)\,\hat x$.

        **3. Faraday.** $\dfrac{\partial\mathbf H}{\partial t} = -\dfrac{1}{\mu_0}\nabla\times\mathbf E = -\dfrac{6\beta}{\mu_0}\sin(\omega t + \beta z)\,\hat x$.

        **4. Anti-derivative in $t$**, static part dropped:
        $$\mathbf H = \frac{6\beta}{\mu_0\omega}\cos(\omega t + \beta z)\,\hat x = \frac{6}{\eta}\cos(\omega t + \beta z)\,\hat x = 0.0318\cos(2\pi\times10^8t + 4.19z)\,\hat x\ \text{A/m}$$

        **Check.** $\mathbf E\times\mathbf H \propto \hat y\times\hat x = -\hat z$, and $\cos(\omega t + \beta z)$ travels toward $-z$. ✓ $\;6\ \text{V/m}\,/\,0.0318\ \text{A/m} = 188.5\ \Omega = \eta$. ✓

        !!mistake Common mistakes
          - Writing $\nabla\cdot\mathbf F$ as a vector or $\nabla\times\mathbf F$ as a number.
          - The middle component of the curl: it is $\partial_zF_x - \partial_xF_z$, in that order.
          - $\partial_z\cos(\omega t - \beta z) = -\beta\sin(\omega t - \beta z)$. The chain rule gives $+\beta\sin$.
          - Forgetting that the integration "constant" can depend on the other variables, or keeping a static field in a wave.
          - Expecting $y\,\hat x$ to have divergence. It changes across its direction, not along it.
      `),
      RF(md`
        ### Round fields: divergence and curl in cylindrical coordinates

        Wires, coax and solenoids are round, so their fields come as $F_r$, $F_\phi$, $F_z$ in $(r, \phi, z)$. The Cartesian formulas do not carry over letter for letter:
        $$\nabla\cdot\mathbf F = \frac1r\frac{\partial(rF_r)}{\partial r} + \frac1r\frac{\partial F_\phi}{\partial\phi} + \frac{\partial F_z}{\partial z}$$
        $$\nabla\times\mathbf F = \hat r\left[\frac1r\frac{\partial F_z}{\partial\phi} - \frac{\partial F_\phi}{\partial z}\right] + \hat\phi\left[\frac{\partial F_r}{\partial z} - \frac{\partial F_z}{\partial r}\right] + \hat z\,\frac1r\left[\frac{\partial(rF_\phi)}{\partial r} - \frac{\partial F_r}{\partial\phi}\right]$$

        Read them against Steps 2 and 3: the same cycle, $r \to \phi \to z \to r$, with two changes. Every $\partial/\partial\phi$ carries a $1/r$, because a step $d\phi$ is an arc of length $r\,d\phi$. And the $r$-derivative of $F_r$ (in the divergence) or of $F_\phi$ (in the $\hat z$ part of the curl) acts on $r$ **times** the component.

        [[fig:wedge]]

        **Why $\frac1r\partial_r(rF_\phi)$.** Circulate around a thin wedge between $r$ and $r + dr$. The outer arc, $(r + dr)\,d\phi$, is longer than the inner one, $r\,d\phi$, so the circulation is the change of $rF_\phi$ across the wedge times $d\phi$: $\partial_r(rF_\phi)\,dr\,d\phi$. Divide by the wedge's area, $r\,dr\,d\phi$. The divergence's $\frac1r\partial_r(rF_r)$ is the same argument for the flux through the outer and inner faces.
      `, { wedge: { svg: wedgeFig(), cap: 'Seen from +z, circulated counterclockwise. The outer arc is longer than the inner one, so the circulation per unit area measures the change of rF_φ, not of F_φ.' } }),
      R(md`
        ### The three round fields of this course

        Round symmetry leaves **one component, depending on $r$ only**. Every other term of the formulas is zero:

        | field | its source |
        |---|---|
        | $\mathbf H = H_\phi(r)\,\hat\phi$: wire, thick wire, coax | $\mathbf J = \nabla\times\mathbf H = \hat z\,\dfrac1r\dfrac{d(rH_\phi)}{dr}$ |
        | $\mathbf H = H_z(r)\,\hat z$: solenoid | $\mathbf J = \nabla\times\mathbf H = -\hat\phi\,\dfrac{dH_z}{dr}$ |
        | $\mathbf E = E_r(r)\,\hat r$: line charge, charged cylinder, coax | $\rho = \nabla\cdot(\epsilon\mathbf E) = \dfrac{\epsilon}{r}\dfrac{d(rE_r)}{dr}$ |

        $\nabla\times\mathbf H = \mathbf J$ is static Ampère; $\nabla\cdot\mathbf D = \rho$ is Gauss, with $\mathbf D = \epsilon\mathbf E$ and $\epsilon$ uniform. Both $\mathbf H$ rows have $\nabla\cdot\mathbf H = 0$, as a magnetic field must; the $\mathbf E$ row has $\nabla\times\mathbf E = 0$, as a static field must.
      `),
      Q(md`**Predict.** Inside a wire, $\mathbf H = H_0\dfrac{r^2}{a^2}\,\hat\phi$. Then $\mathbf J = $`,
        [md`$\dfrac{3H_0r}{a^2}\,\hat z$`, md`$\dfrac{2H_0r}{a^2}\,\hat z$`, md`$\dfrac{H_0r}{a^2}\,\hat z$`, md`$\dfrac{3H_0r}{a^2}\,\hat\phi$`], 0,
        [null, md`That is $\partial H_\phi/\partial r$ alone. The curl differentiates $rH_\phi = H_0r^3/a^2$, then divides by $r$.`, md`That is $H_\phi/r$ alone, the other half of the product rule.`, md`The curl of a $\hat\phi$ field that depends on $r$ points along $\hat z$, like the current that makes it.`],
        md`$rH_\phi = H_0r^3/a^2$, $\;\dfrac{d}{dr}(rH_\phi) = 3H_0r^2/a^2$, divide by $r$: $\;J_z = 3H_0r/a^2$. The current density grows outward.`, { id: 'u0-curl-div.cyl0' }),
      R(md`
        ### Four quick examples

        **Thick wire, inside** ($r < a$, $I$ uniform): $H_\phi = \dfrac{Ir}{2\pi a^2}$, so $rH_\phi = \dfrac{Ir^2}{2\pi a^2}$ and
        $$\mathbf J = \hat z\,\frac1r\frac{d}{dr}\frac{Ir^2}{2\pi a^2} = \frac{I}{\pi a^2}\,\hat z$$
        Uniform: $I$ spread over $\pi a^2$, as assumed.

        **Thick wire, outside** ($r > a$): $H_\phi = \dfrac{I}{2\pi r}$, so $rH_\phi = I/2\pi$ is constant and $\mathbf J = 0$. The field circles the axis but has no curl there. $1/r$ is the one profile $H_\phi(r)$ with zero curl: the field of a current that is all somewhere else.

        **Charged cylinder** (uniform $\rho_0$ in $r < a$, free space): inside, $E_r = \dfrac{\rho_0r}{2\epsilon_0}$ gives $\rho = \dfrac{\epsilon_0}{r}\dfrac{d}{dr}\dfrac{\rho_0r^2}{2\epsilon_0} = \rho_0$, as it must. Outside, $E_r = \dfrac{\rho_0a^2}{2\epsilon_0r}$: $rE_r$ is constant, so $\rho = 0$.

        **Solenoid:** $H_z = nI$ inside, $0$ outside. $dH_z/dr = 0$ except at the wall, where $H_z$ drops by $nI$. So the current sits in the wall, and $-dH_z/dr > 0$ there puts it along $+\hat\phi$: counterclockwise seen from $+z$, which by the RHR makes $\mathbf H$ along $+\hat z$. ✓

        !!trap The product-rule trap
          $\dfrac1r\dfrac{d(rH_\phi)}{dr}$ is **not** $\dfrac{dH_\phi}{dr}$. By the product rule, $\dfrac1r\dfrac{d(rH_\phi)}{dr} = \dfrac{dH_\phi}{dr} + \dfrac{H_\phi}{r}$. Drop the $H_\phi/r$ and the thick wire gets $J_z = -I/2\pi r^2$ outside, where there is no current, and $I/2\pi a^2$ inside, half the true value. The same holds for $\frac1r\frac{d(rE_r)}{dr}$.

        ### Check questions
      `),
      Q(md`$\nabla\cdot(x^2\,\hat x + y^2\,\hat y)$ at $(1, 2, 0)$ is…`, ['$6$', '$5$', md`$2\hat x + 4\hat y$`, '$0$'], 0,
        [null, md`That is $x^2 + y^2$: the components added, not differentiated.`, 'The divergence is a scalar: add the derivatives.', md`Each component grows along its own direction, so the divergence is positive.`],
        md`$2x + 2y = 2 + 4 = 6$.`, { id: 'u0-curl-div.p12' }),
      Q(md`$\nabla\times(x\,\hat y) = $`, [md`$\hat z$`, md`$-\hat z$`, md`$\hat x$`, '$0$'], 0,
        [null, md`$(\nabla\times\mathbf F)_z = \partial_xF_y - \partial_yF_x = 1 - 0$, positive.`, md`The curl of a $y$-directed field varying in $x$ points along $\hat x\times\hat y = \hat z$.`, md`$F_y$ changes as you move across it in $x$: that is circulation.`],
        md`Only $\partial_xF_y = 1$ survives: $\hat z$.`, { id: 'u0-curl-div.p13' }),
      Q(md`Which of these can be a magnetic flux density $\mathbf B$?`,
        [md`$y\,\hat x - x\,\hat y$`, md`$x\,\hat x$`, md`$x\,\hat x + y\,\hat y$`, md`$z^2\,\hat z$`], 0,
        [null, md`$\nabla\cdot = 1 \ne 0$.`, md`$\nabla\cdot = 2 \ne 0$.`, md`$\nabla\cdot = 2z \ne 0$.`],
        md`$\partial_x(y) + \partial_y(-x) = 0$: no sources, so it can be a $\mathbf B$ (it circles the $z$-axis, like the field inside a wire).`, { id: 'u0-curl-div.p14' }),
      Q(md`Which of these can be an **electrostatic** field $\mathbf E$?`,
        [md`$x\,\hat x + y\,\hat y$`, md`$y\,\hat x - x\,\hat y$`, md`$y\,\hat x$`, md`$x\,\hat y$`], 0,
        [null, md`Its curl is $-2\hat z$.`, md`Its curl is $-\hat z$.`, md`Its curl is $+\hat z$.`],
        md`Its curl is zero; it is $-\nabla V$ with $V = -(x^2 + y^2)/2$.`, { id: 'u0-curl-div.p15' }),
      Q(md`If $\mathbf J = 0$ in a region of free space, which must be true there for $\mathbf D$?`,
        [md`$\partial(\nabla\cdot\mathbf D)/\partial t = 0$`, md`$\partial\mathbf D/\partial t = 0$`, md`$\nabla\cdot\mathbf D = 0$`, md`$\mathbf D = 0$`], 0,
        [null, md`$\mathbf D$ can still change in time: a wave passing through has $\mathbf J = 0$.`, 'A static charge density can sit there; only its change is forbidden.', 'Fields reach into current-free regions all the time.'],
        md`Divergence of Ampère–Maxwell: $0 = \nabla\cdot\mathbf J + \partial(\nabla\cdot\mathbf D)/\partial t$. With $\mathbf J = 0$, the charge density there cannot change.`, { src: 'Spring 2018 Exam 2', id: 'u0-curl-div.p16' }),
      Q(md`$\Phi = 3x^2$ V and $\mathbf A = -6xt\,\hat x + 3y\,\hat y$ V·s/m. With $\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t$ and $\mathbf B = \nabla\times\mathbf A$…`,
        [md`$\mathbf E$ and $\mathbf B$ are both zero everywhere, for all time`, md`$\mathbf E = -6x\,\hat x$ and $\mathbf B = 0$`, md`$\mathbf E = 0$ and $\mathbf B = 3\hat z$`, md`$\mathbf E = -12x\,\hat x$, constant in time`], 0,
        [null, md`That forgets $-\partial\mathbf A/\partial t = +6x\,\hat x$, which cancels $-\nabla\Phi$.`, md`$\partial_xA_y - \partial_yA_x = 0 - 0$: $A_y$ depends on $y$ only, $A_x$ on $x$ and $t$.`, md`That subtracts $\partial\mathbf A/\partial t$ with the wrong sign.`],
        md`$-\nabla\Phi = -6x\,\hat x$ and $-\partial\mathbf A/\partial t = +6x\,\hat x$: $\mathbf E = 0$. $\nabla\times\mathbf A = 0$ because each component depends only on its own coordinate (and $t$).`, { src: 'Spring 2018 Exam 2', id: 'u0-curl-div.p17' }),
      Q(md`At fixed $z$, $\dfrac{\partial}{\partial t}\cos(\omega t - \beta z) = $`,
        [md`$-\omega\sin(\omega t - \beta z)$`, md`$\omega\sin(\omega t - \beta z)$`, md`$-\beta\sin(\omega t - \beta z)$`, md`$-\omega\cos(\omega t - \beta z)$`], 0,
        [null, md`$\cos' = -\sin$ and the inside derivative is $+\omega$: one minus sign.`, md`In $t$ the chain rule brings down $\omega$.`, md`The derivative of $\cos$ is $-\sin$.`],
        md`$-\sin(\cdot)\times\partial_t(\omega t - \beta z) = -\omega\sin(\omega t - \beta z)$.`, { id: 'u0-curl-div.p18' }),
      Q(md`The units of $\nabla\times\mathbf H$ are…`, ['A/m²', 'A/m', 'A', 'A·m'], 0,
        [null, md`That is $\mathbf H$; the curl adds a 1/m.`, md`That is a circulation $\oint\mathbf H\cdot d\mathbf l$.`, 'The curl divides by length, it does not multiply.'],
        md`$\nabla$ is "per meter": (A/m)/m = A/m², the units of $\mathbf J$, as in $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$.`, { id: 'u0-curl-div.p19' }),
      Q(md`$\mathbf E = kr\,\hat r$ in cylindrical coordinates ($k$ a constant). $\nabla\cdot\mathbf E = $`,
        ['$2k$', '$k$', '$3k$', '$0$'], 0,
        [null, md`That is $\partial E_r/\partial r$ alone. Differentiate $rE_r = kr^2$, then divide by $r$.`, md`That is the divergence of $k(x\,\hat x + y\,\hat y + z\,\hat z)$, which spreads in three dimensions; $kr\,\hat r$ spreads only away from the axis.`, md`The field spreads away from the axis: positive divergence.`],
        md`$\dfrac1r\dfrac{d}{dr}(kr^2) = 2k$. Cartesian check: $kr\,\hat r = k(x\,\hat x + y\,\hat y)$, divergence $k + k$. ✓`, { id: 'u0-curl-div.cyl1' }),
      Q(md`A thick winding makes $\mathbf H = H_0(1 - r/a)\,\hat z$ for $r < a$ (zero outside). There, $\mathbf J = $`,
        [md`$\dfrac{H_0}{a}\,\hat\phi$`, md`$-\dfrac{H_0}{a}\,\hat\phi$`, md`$\dfrac{H_0}{a}\,\hat z$`, md`$0$: $H_z$ does not depend on $\phi$`], 0,
        [null, md`The $\hat\phi$ part of the curl is $\partial F_r/\partial z - \partial F_z/\partial r$: the minus sign sits on $\partial_rH_z$, and $\partial_rH_z = -H_0/a$ is negative.`, md`The curl of a $\hat z$ field that varies with $r$ is perpendicular to $\hat z$: it circles the axis, like a solenoid's current.`, md`$H_z$ varies with $r$, and $\partial_rF_z$ is in the $\hat\phi$ part of the curl.`],
        md`$\mathbf J = -\hat\phi\,dH_z/dr = -\hat\phi(-H_0/a) = (H_0/a)\,\hat\phi$: counterclockwise from $+z$, and the RHR (fingers along $\hat\phi$) gives $\mathbf H$ along $+\hat z$. ✓`, { id: 'u0-curl-div.cyl2' }),
      Q(md`Which $\mathbf H = H_\phi(r)\,\hat\phi$ has zero curl at every $r > 0$? ($k$ is a constant.)`,
        [md`$H_\phi = k/r$`, md`$H_\phi = k$`, md`$H_\phi = kr$`, md`$H_\phi = k/r^2$`], 0,
        [null, md`$\frac1r\frac{d}{dr}(kr) = k/r \ne 0$: a constant $H_\phi$ needs current everywhere.`, md`$\frac1r\frac{d}{dr}(kr^2) = 2k$: that is the field inside a uniform wire.`, md`$\frac1r\frac{d}{dr}(k/r) = -k/r^3 \ne 0$.`],
        md`$rH_\phi = k$ is constant, so the curl is zero: the field outside a wire, $I/2\pi r$, whose current is all inside $r$.`, { id: 'u0-curl-div.cyl3' }),
      Q(md`For $\mathbf H = H_\phi(r)\,\hat\phi$, which components of $\nabla\times\mathbf H$ can be nonzero?`,
        [md`only the $\hat z$ component`, md`only the $\hat\phi$ component`, md`the $\hat r$ and $\hat z$ components`, md`none: a field that depends only on $r$ has no curl`], 0,
        [null, md`The $\hat\phi$ part, $\partial_zF_r - \partial_rF_z$, uses $F_r$ and $F_z$, both zero here.`, md`The $\hat r$ part, $\frac1r\partial_\phi F_z - \partial_zF_\phi$, needs an $F_z$ or a $z$-dependence.`, md`The $\hat z$ part, $\frac1r\partial_r(rH_\phi)$, survives: that is the axial current of a wire.`],
        md`$\nabla\times\mathbf H = \hat z\,\frac1r\frac{d(rH_\phi)}{dr}$: circulation around the axis means current along it.`, { id: 'u0-curl-div.cyl4' }),
      Q(md`In free space, $\mathbf E = kr^2\,\hat r$ inside a long charged cylinder ($k$ a constant). The charge density there is…`,
        [md`$3\epsilon_0kr$`, md`$2\epsilon_0kr$`, md`$\epsilon_0kr$`, md`$3kr$`], 0,
        [null, md`That is $\epsilon_0\,dE_r/dr$ alone; the divergence differentiates $rE_r = kr^3$.`, md`That is $\epsilon_0E_r/r$ alone, the other half of the product rule.`, md`That is $\nabla\cdot\mathbf E$; Gauss's law gives $\rho = \epsilon_0\nabla\cdot\mathbf E$.`],
        md`$\rho = \dfrac{\epsilon_0}{r}\dfrac{d}{dr}(kr^3) = 3\epsilon_0kr$.`, { id: 'u0-curl-div.cyl5' }),
      R(md`
        ### Drills with new situations every time
      `),
      level(1, 'recognize', md`**The trick:** hold everything else fixed; the chain rule brings down the inside derivative with its sign.`),
      Object.assign(G('rf_u0_partial', { need: 6 }), { id: 'u0-curl-div.r0' }),
      level(2, 'compute', md`**The trick:** divergence: each component by its own variable. Curl: each component by the **other** variables, $\partial_yF_z - \partial_zF_y$ and its cyclic shifts.`),
      Object.assign(G('rf_u0_divcurl', { need: 6 }), { id: 'u0-curl-div.r1' }),
      level(2, 'cylindrical coordinates', md`**The trick:** $H_\phi(r)$: multiply by $r$, differentiate, divide by $r$; the answer points along $\hat z$. $H_z(r)$: $J_\phi = -dH_z/dr$. $E_r(r)$: $\rho = \frac{\epsilon}{r}\frac{d}{dr}(rE_r)$.`),
      Object.assign(G('rf_u0_cyl', { need: 6 }), { id: 'u0-curl-div.r3' }),
      level(3, 'a field from its partner', md`**The trick:** $\nabla\times\mathbf F = \hat a\times\partial\mathbf F/\partial a$, divide, anti-differentiate in $t$, then check $\eta$ and $\mathbf E\times\mathbf H$.`),
      Object.assign(G('u0_h_from_e', { need: 2 }), { id: 'u0-curl-div.r2' }),
      level(3, 'a source from a round field', md`**The trick:** one surviving term of the cylindrical curl or divergence gives the density; the integral law (Ampère's or Gauss's) on a circle gives the total, and the two must agree.`),
      Object.assign(G('u0_cyl', { need: 2 }), { id: 'u0-curl-div.r4' }),
    ],
  });

  // ================================================================ D: deltas, steps, pulses
  EM.lesson('u0', {
    id: 'u0-deltas', topic: 'D', order: 4, ref: 'Used in Topics 6, 14, 15', title: 'Delta functions, steps and pulses',
    steps: [
      R(md`
        !!key Why you care
          The course writes thin things as densities with deltas: a charge sheet on $z = 0$ is $\rho = \rho_s\delta(z)$, a surface current is $\mathbf J = \mathbf J_s\delta(z)$, a line current on the $z$-axis is $\mathbf J = I\delta(x)\delta(y)\hat z$. Waveforms are built from steps, rectangles and triangles: Spring 2018 #4 uses $u[x - 100]$, HW 7 #6 uses $\triangle(t/\tau)$, Spring 2018 #5 a piecewise pulse.

        ### Notation

        - $\delta(x)$: the **Dirac delta**. Zero for $x \ne 0$, infinitely tall at $x = 0$, with **area 1**: $\int\delta(x)\,dx = 1$. Its units are 1/(units of $x$): $\delta(z)$ is in 1/m, $\delta(t)$ in 1/s.
        - $\delta(x - a)$: the same spike moved to $x = a$.
        - $u(x)$: the **unit step**: $0$ for $x < 0$, $1$ for $x > 0$. Its derivative is $\delta(x)$.
        - $\text{sgn}(x)$: the **sign function**, $-1$ for $x < 0$ and $+1$ for $x > 0$; $\text{sgn}(x) = 2u(x) - 1$. Lecture 13 writes a sheet's field with it.
        - $\text{rect}(t/\tau)$: the **unit rectangle** of width $\tau$: $1$ for $|t| < \tau/2$, $0$ otherwise.
        - $\triangle(t/\tau)$: the **unit triangle** of width $\tau$: $1 - 2|t|/\tau$ for $|t| \le \tau/2$, $0$ otherwise. Peak 1 at $t = 0$, base $\tau$ (HW 7 #6: "the unit triangle function with width $\tau$").

        ### The idea

        A sheet is a slab squeezed flat. A slab of thickness $w$ carrying $J = J_s/w$ carries $J_s$ amperes per meter of width; as $w \to 0$ the density becomes infinite but its integral across the slab stays $J_s$. The delta is that limit: $\mathbf J = \mathbf J_s\,\delta(z)$. Integrating across a delta gives back the surface (or line) quantity.
      `),
      RF(md`
        ### Step 1: area 1, and sifting

        [[fig:delta]]

        Under an integral the spike picks out one value of whatever multiplies it:
        $$\int_{-\infty}^{\infty}f(x)\,\delta(x - a)\,dx = f(a)$$
        if $a$ is inside the range of integration, and $0$ if it is outside. A squeeze rescales it: $\delta(cx) = \delta(x)/|c|$.

        Units keep you honest: $\rho_s\,\delta(z)$ is (C/m²)(1/m) = C/m³, a volume charge density, as it must be to sit in $\nabla\cdot\mathbf D = \rho$.
      `, { delta: { svg: deltaFig(), cap: 'Rectangles of width w and height 1/w (w = 2, 1, ½). Each has area 1. As w → 0 they become δ(x).' } }),
      Q(md`**Predict.** $\displaystyle\int_{-\infty}^{\infty}(x^2 + 1)\,\delta(x - 3)\,dx = $`, ['$10$', '$1$', '$9$', '$0$'], 0,
        [null, 'That is the area of the delta alone; it multiplies f(3).', 'That drops the +1 in f.', 'The spike at x = 3 is inside the range.'],
        md`Sifting: $f(3) = 9 + 1 = 10$.`),
      R(md`
        ### Step 2: sheets, lines and points as densities

        | Object | As a volume density | Integrate across it |
        |---|---|---|
        | charge sheet $\rho_s$ on $z = a$ | $\rho = \rho_s\,\delta(z - a)$ | $\int\rho\,dz = \rho_s$ |
        | surface current $J_s\hat x$ on $z = 0$ | $\mathbf J = J_s\,\delta(z)\,\hat x$ | $\int J_x\,dz = J_s$ (A/m) |
        | line charge $\rho_l$ on the $z$-axis | $\rho = \rho_l\,\delta(x)\,\delta(y)$ | $\iint\rho\,dx\,dy = \rho_l$ |
        | line current $I$ along $\hat z$ through $(x_0, y_0)$ | $\mathbf J = I\,\delta(x - x_0)\,\delta(y - y_0)\,\hat z$ | $\iint J_z\,dx\,dy = I$ |
        | point charge $Q$ at the origin | $\rho = Q\,\delta(x)\,\delta(y)\,\delta(z)$ | $\int\rho\,dV = Q$ |

        **Count the deltas.** One delta pins one coordinate: a **plane**. Two pin two: a **line** ($\delta(x)\delta(y)$ is zero unless $x = 0$ **and** $y = 0$: the $z$-axis). Three: a **point**.
      `),
      Q(md`**Predict.** $\mathbf J = 4\,\delta(y - 2)\,\hat z$ A/m² describes…`,
        [md`a current sheet in the plane $y = 2$ m, $\mathbf J_s = 4\hat z$ A/m`, md`a line current along $y = 2$`, md`a current sheet in the plane $y = -2$ m`, md`a slab of current 2 m thick`], 0,
        [null, 'One delta pins one coordinate: a plane, not a line.', md`$\delta(y - 2)$ fires where $y - 2 = 0$, at $y = +2$.`, 'A delta has no thickness.'],
        md`The spike sits at $y = 2$, and $\int J_z\,dy = 4$ A/m across it: a sheet carrying $4$ A per meter of width along $\hat z$.`),
      R(md`
        ### Step 3: the step and the sign function

        $u(x - a)$ switches on at $x = a$; $u(a - x)$ is on for $x < a$. A field that exists only on one side: Spring 2018 #4's profile at $t = 1\ \mu$s, $\mathbf E = 3u[x - 100]\,e^{-(x - 100)/50}\,\hat z$ V/m, is zero for $x < 100$ m, jumps to 3 V/m and decays.

        A **jump** in a function puts a **delta** in its derivative, sized by the jump: $\dfrac{d}{dx}u(x) = \delta(x)$, $\dfrac{d}{dx}\text{sgn}(x) = 2\delta(x)$.

        That is how a sheet appears in the differential form of Ampère's law. A sheet $\mathbf J_s = J_{s0}\hat z$ on $y = 0$ makes $\mathbf H = -\tfrac12J_{s0}\,\text{sgn}(y)\,\hat x$ (Lecture 13). Then
        $$\nabla\times\mathbf H = -\frac{\partial H_x}{\partial y}\hat z = \tfrac12J_{s0}\cdot2\delta(y)\,\hat z = J_{s0}\,\delta(y)\,\hat z = \mathbf J$$
      `),
      Q(md`**Predict.** $\dfrac{d}{dz}\big[u(z) - u(z - 1)\big] = $`,
        [md`$\delta(z) - \delta(z - 1)$`, md`$\delta(z) + \delta(z - 1)$`, '$0$', md`$1$ for $0 < z < 1$`], 0,
        [null, 'The function steps down at z = 1, so that delta has a minus sign.', 'It is flat almost everywhere, but it jumps twice.', 'The function itself is 1 there; its slope is 0 there.'],
        md`A pulse that switches on at $z = 0$ (jump $+1$) and off at $z = 1$ (jump $-1$).`),
      RF(md`
        ### Step 4: rectangles and triangles

        [[fig:pulses]]

        - $\text{rect}(t/\tau) = u(t + \tau/2) - u(t - \tau/2)$: height 1, width $\tau$, area $\tau$.
        - $\triangle(t/\tau)$: peak 1 at $t = 0$, falling linearly to 0 at $t = \pm\tau/2$. Area $\tau/2$.
        - Shifted and scaled: $A\,\triangle\big((t - t_0)/\tau\big)$ peaks at $A$ when $t = t_0$ and is zero outside $t_0 - \tau/2 < t < t_0 + \tau/2$. Same for $A\,\text{rect}$.

        HW 7 #6: $E_z(0, t) = 2\triangle(t/\tau)$ V/m with $\tau = 3\ \mu$s peaks at 2 V/m at $t = 0$ and lasts from $-1.5$ to $+1.5\ \mu$s.

        Some books write a triangle as $\Lambda(t)$ with base 2 (half-width 1). This course's $\triangle(t/\tau)$ has a **total** base of $\tau$. (And in this course $\Lambda$ is flux linkage.)
      `, { pulses: { svg: pulseFig() } }),
      Q(md`**Predict.** With $\tau = 3\ \mu$s, $2\triangle(t/\tau)$ at $t = 0.5\ \mu$s is…`, ['$1.33$', '$1.67$', '$0.667$', '$2$'], 0,
        [null, md`That uses $1 - |t|/\tau$, a triangle of base $2\tau$.`, md`That is $2|t|/\tau \times 2$, the drop instead of what is left.`, 'The peak is only at t = 0.'],
        md`$2\left(1 - \dfrac{2(0.5)}{3}\right) = 2\cdot\dfrac23 = 1.33$ V/m.`),
      R(md`
        ### The method

        !!method Reading a density with deltas
          1. Count the deltas: one is a plane, two a line, three a point. Read off where each one fires.
          2. The coefficient is the surface or line quantity: $\rho_s$ (C/m²), $J_s$ (A/m), $\rho_l$ (C/m), $I$ (A).
          3. To get a total, integrate: each delta inside the region contributes its coefficient times the size of the remaining extent; a delta outside contributes 0.

        ### Worked example

        !!graded Problem
          $\rho = \rho_s\,\delta(z - 1) + \rho_l\,\delta(x - 1)\,\delta(y - 3)$ with $\rho_s = 2$ nC/m² and $\rho_l = 5$ nC/m. Find the total charge inside the cube $0 < x, y, z < 2$ m.

        **1. Read it.** A sheet in the plane $z = 1$ m, and a line parallel to $z$ through $(x, y) = (1, 3)$ m.

        **2. The sheet.** $z = 1$ is inside $0 < z < 2$; it cuts the cube in a $2\times2$ m square: $Q_1 = (2\,\text{nC/m}^2)(4\,\text{m}^2) = 8$ nC.

        **3. The line.** $y = 3$ m is outside $0 < y < 2$: the line misses the cube. $Q_2 = 0$.

        **4. Answer.** $Q = 8$ nC.

        **Check.** Formally, $\int_0^2\delta(y - 3)\,dy = 0$ because the spike is outside the range. ✓

        !!mistake Common mistakes
          - $\delta(0) = 1$. It is infinite; its **area** is 1.
          - Dropping the units: $\delta(z)$ is in 1/m, so $\rho_s\,\delta(z)$ is in C/m³.
          - Reading $\delta(x)\delta(y)$ as two planes. It is their intersection, the $z$-axis.
          - Reading $\triangle(t/\tau)$ as base $2\tau$.
          - $u(x - a)$ versus $u(a - x)$: the first is on for $x > a$, the second for $x < a$.
          - Counting a delta that sits outside the region, or exactly at a face: avoid the face case by checking the problem's inequalities.

        ### Check questions
      `),
      Q(md`$\displaystyle\int_{-\infty}^{\infty}\cos x\;\delta(x - \pi)\,dx = $`, ['$-1$', '$1$', '$0$', md`$\pi$`], 0,
        [null, md`$\cos\pi = -1$, not $+1$.`, 'The spike is inside the range.', 'Sifting returns the function value, not the location.'],
        md`$\cos\pi = -1$.`),
      Q(md`$\displaystyle\int_0^5\delta(x + 2)\,dx = $`, ['$0$', '$1$', '$2$', '$-2$'], 0,
        [null, md`The spike sits at $x = -2$, outside $0 < x < 5$.`, 'A delta has area 1 or 0 here, never 2.', 'A delta integrates to 1 or 0 here, never negative.'],
        md`$\delta(x + 2)$ fires at $x = -2$, outside the range.`),
      Q(md`The units of $\delta(z)$, with $z$ in meters, are…`, ['1/m', 'none', 'm', 'm²'], 0,
        [null, md`$\int\delta(z)\,dz = 1$ is dimensionless and $dz$ is in meters, so $\delta$ is not.`, md`Upside down: $\delta(z)\,dz$ is a pure number, so $\delta$ carries 1/m.`, md`One delta in $z$ carries one power of 1/m; nothing gives m².`],
        md`Area 1 over $dz$ (m): $\delta(z)$ is per meter.`),
      Q(md`$\rho = \rho_l\,\delta(x)\,\delta(y)$ describes…`,
        [md`a line charge $\rho_l$ (C/m) on the $z$-axis`, md`two charge sheets, on $x = 0$ and on $y = 0$`, 'a point charge at the origin', md`a charge sheet on $z = 0$`], 0,
        [null, md`A product is nonzero only where **both** factors are: on the intersection $x = y = 0$.`, md`A point needs three deltas; $z$ is free here.`, md`Neither delta involves $z$.`],
        md`Two deltas pin two coordinates; $z$ is free: the $z$-axis.`),
      Q(md`$\triangle(t/\tau)$ at $t = \tau/4$ is…`, [md`$\tfrac12$`, md`$\tfrac34$`, md`$\tfrac14$`, '$1$'], 0,
        [null, md`That uses a base of $2\tau$: $1 - |t|/\tau$.`, md`That is $|t|/\tau$, the distance from the peak; the value is $1 - 2|t|/\tau = \tfrac12$.`, 'The peak is at t = 0 only.'],
        md`$1 - 2(\tau/4)/\tau = \tfrac12$: halfway down the slope.`),
      Q(md`$\text{rect}(t/\tau) = $`, [md`$u(t + \tau/2) - u(t - \tau/2)$`, md`$u(t) - u(t - \tau)$`, md`$u(t + \tau) - u(t - \tau)$`, md`$u(t - \tau/2) - u(t + \tau/2)$`], 0,
        [null, md`That is a rectangle of width $\tau$ starting at $t = 0$: $\text{rect}((t - \tau/2)/\tau)$.`, md`That has width $2\tau$.`, 'That is the negative of the rectangle.'],
        md`On at $t = -\tau/2$, off at $t = +\tau/2$.`),
      Q(md`$\dfrac{d}{dx}\big[3\,u(x - 2)\big] = $`, [md`$3\,\delta(x - 2)$`, md`$3$ for $x > 2$`, md`$\delta(x - 2)$`, md`$3\,\delta(x + 2)$`], 0,
        [null, 'The function is flat on both sides; its slope is zero except at the jump.', 'The jump has size 3.', md`The step is at $x = +2$.`],
        md`A jump of 3 at $x = 2$ gives $3\delta(x - 2)$.`),
      Q(md`HW 7 #6 gives $E_z(0, t) = 2\triangle(t/\tau)$ V/m with $\tau = 3\ \mu$s. A probe at $x = 0$ sees a nonzero field for…`,
        [md`$-1.5\ \mu\text{s} < t < 1.5\ \mu\text{s}$`, md`$0 < t < 3\ \mu\text{s}$`, md`$-3\ \mu\text{s} < t < 3\ \mu\text{s}$`, md`$0 < t < 1.5\ \mu\text{s}$`], 0,
        [null, md`The triangle is centered at $t = 0$, not starting there.`, md`That is a base of $2\tau$; this course's triangle has total width $\tau$.`, 'It is symmetric about t = 0.'],
        md`$\triangle(t/\tau) \ne 0$ for $|t| < \tau/2 = 1.5\ \mu$s.`),
      R(md`
        ### Drills with new situations every time
      `),
      level(1, 'recognize', md`**The trick:** a delta returns the value at its spike, if the spike is in range; count deltas for the shape.`),
      Object.assign(G('rf_u0_delta', { need: 6 }), { id: 'u0-deltas.r0' }),
      level(2, 'evaluate a pulse', md`**The trick:** subtract the center first, then compare $|t - t_0|$ with $\tau/2$.`),
      Object.assign(G('rf_u0_pulse', { need: 6 }), { id: 'u0-deltas.r1' }),
      level(3, 'totals from densities', md`**The trick:** each delta inside the region contributes its coefficient times the remaining length or area; each one outside contributes 0.`),
      Object.assign(G('u0_delta_int', { need: 2 }), { id: 'u0-deltas.r2' }),
    ],
  });

  // ================================================================ E: waveforms
  EM.lesson('u0', {
    id: 'u0-waveforms', topic: 'E', order: 5, ref: 'Used in Topics 14–17', title: 'Traveling waveforms: f(t − z/v)',
    steps: [
      R(md`
        !!key Why you care
          Every wave problem asks you to read or sketch a function of $t - z/v$: HW 7 #6 ("plot $E_z$ vs $t$ at $x = -1000$ m", "plot $H_y$ vs $x$ at $t = 20\ \mu$s"), Spring 2018 #4 (a profile at $t = 1\ \mu$s moved back to $t = 0$), Spring 2018 #5(c) (sketch $H$ vs $y$ at $t = 5$ ns), and Spring 2018 1(vii) (a phase change gives the wavelength).

        ### Notation

        - $f(\cdot)$: a function of one variable: the **shape**. $f(t - z/v)$: that shape, traveling.
        - $v$ (m/s): the speed; for a wave, $v_p$, the phase velocity: $c = 3\times10^8$ m/s $= 300$ m/μs in vacuum, $c/\sqrt{\mu_r\epsilon_r}$ in a medium of relative permeability $\mu_r$ and relative permittivity $\epsilon_r$.
        - **Profile**: the graph versus $z$ at one fixed time (a snapshot). **Waveform**: the graph versus $t$ at one fixed $z$ (what a probe at $z$ records).
        - $\omega$ (rad/s): angular frequency; $f = \omega/2\pi$ (Hz); $T = 1/f$ (s): period. $\beta$ (rad/m): phase constant; $\lambda = 2\pi/\beta$ (m): wavelength.
        - **Phase**: the argument $\omega t - \beta z + \phi_0$ of a cosine, in **radians**. $\phi_0$: the phase at $t = 0$, $z = 0$.

        ### The idea

        In $f(t - z/v)$, whatever happens at $z = 0$ at time $t$ happens at $z$ at time $t + z/v$: the same shape arrives later the farther you go. So it travels toward $+z$ at speed $v$. $f(t + z/v)$ travels toward $-z$. Equivalently (Lecture 18): $E(z, t) = E(0, t - z/v) = E(z - vt, 0)$ for a forward wave.
      `),
      R(md`
        ### Step 1: shifting

        $g(t) = f(t - t_0)$ is $f$ **delayed** by $t_0$: the same graph moved **right** by $t_0$. Whatever $f$ does at time 0, $g$ does at $t_0$. "Minus means later."

        To find where a feature lands, set the argument equal to that feature's value: if $f$ peaks at $f(1)$, then $f(t - 4)$ peaks where $t - 4 = 1$, at $t = 5$.
      `),
      Q(md`**Predict.** $f(t)$ is a pulse that peaks at $t = 2$ s. Then $f(t + 3)$ peaks at…`, [md`$t = -1$ s`, md`$t = 5$ s`, md`$t = 2$ s`, md`$t = 3$ s`], 0,
        [null, md`That would be $f(t - 3)$. A plus sign moves the graph earlier (left).`, 'The argument changed, so the peak moves.', 'Set the argument equal to the peak value: t + 3 = 2.'],
        md`$t + 3 = 2 \Rightarrow t = -1$ s: three seconds earlier.`),
      R(md`
        ### Step 2: f(t − z/v) moves

        A feature of $f(t - z/v)$ sits where $t - z/v$ is constant, so $z = vt + \text{const}$: it moves toward $+z$ at speed $v$.

        **Sign rule:** $t$ and $z$ with **opposite** signs inside: toward $+z$. **Same** signs: toward $-z$. **Speed** = (coefficient of $t$)/(coefficient of $z$), in magnitude.

        - $\cos(\omega t - \beta z)$: toward $+z$ at $\omega/\beta$.
        - $u(t + 0.02x) = u(t + x/50)$: toward $-x$ at 50 m/s.
        - $(0.05y - t)^2 = (t - y/20)^2$: toward $+y$ at 20 m/s. (Squaring cannot hide the relative sign.)
        - $g(z - 300t)$: toward $+z$ at 300 m/s; the same rule works with $z$ first.
      `),
      Q(md`**Predict.** $E = \cos(2\pi\times10^8\,t + 2\pi z)$, with $t$ in s and $z$ in m, travels…`,
        [md`toward $-z$ at $10^8$ m/s`, md`toward $+z$ at $10^8$ m/s`, md`toward $-z$ at $10^{-8}$ m/s`, md`toward $-z$ at $3\times10^8$ m/s`], 0,
        [null, md`$t$ and $z$ have the same sign inside: toward $-z$.`, 'The speed is (coefficient of t)/(coefficient of z), not the reverse.', 'Read the speed off the expression: 2π×10⁸ / 2π. The medium is not vacuum.'],
        md`Same signs: $-z$. Speed $= 2\pi\times10^8/2\pi = 10^8$ m/s, so this is a medium with $\sqrt{\mu_r\epsilon_r} = 3$.`),
      RF(md`
        ### Step 3: waveform versus profile

        **At a fixed $z_1$** the probe records $E(z_1, t) = E(0, t - z_1/v)$: the $z = 0$ waveform, delayed by $z_1/v$. Same shape, same orientation.

        **At a fixed $t_1$** the snapshot is $E(z, t_1) = E(0, t_1 - z/v)$. As $z$ increases, the argument **decreases**: the shape is **flipped**, stretched by $v$. What happened at time $t_k$ at $z = 0$ sits at $z = v(t_1 - t_k)$: the earliest feature has gone farthest. The front of the pulse is what arrived first.

        [[fig:wave]]

        **Numbers.** With $v = 300$ m/μs: the rise that happened over $0 < t < 1\ \mu$s at $z = 0$ sits, at $t_1 = 6\ \mu$s, between $z = 300(6 - 1) = 1500$ m and $z = 300(6 - 0) = 1800$ m. The slow fall ($1 < t < 4\ \mu$s) stretches back from 1500 m to 600 m.
      `, { wave: { svg: waveFig() } }),
      Q(md`**Predict.** A probe at $z = 0$ records a pulse that rises **fast** and decays **slowly**. The wave travels toward $+z$. In a snapshot $E(z, t_1)$, the steep edge is…`,
        ['at the front, the largest z', 'at the back, the smallest z', 'in the middle', 'nowhere: a snapshot has the same shape as the waveform'], 0,
        [null, 'The rise happened first, so it has traveled farthest.', 'A pulse has no reason to put its steep edge in the middle.', md`In $z$ the shape is flipped: $t_1 - z/v$ decreases as $z$ grows.`],
        md`The rise came out first, so it leads. In $z$ the waveform appears mirror-imaged.`),
      RF(md`
        ### Step 4: sinusoids and phase

        $E = E_0\cos(\omega t - \beta z + \phi_0)$, with
        $$\omega = 2\pi f = \frac{2\pi}{T} \qquad \beta = \frac{2\pi}{\lambda} \qquad v_p = \frac{\omega}{\beta} = \lambda f$$

        [[fig:cos]]

        - At a fixed $z$ it repeats every $T$; at a fixed $t$ it repeats every $\lambda$.
        - The phase is in **radians**. $\pi$ rad $= 180°$. Put your calculator in radians before evaluating $\cos(\omega t - \beta z)$.
        - Two points $\Delta z$ apart differ in phase by $\beta\,\Delta z$; a quarter wavelength is $\pi/2$ (90°).
        - $\sin x = \cos(x - \pi/2)$: a sine is a cosine delayed by a quarter period.

        **Example.** $f = 100$ MHz in vacuum: $\lambda = c/f = 3$ m, $\beta = 2\pi/3 = 2.09$ rad/m, $\omega = 2\pi\times10^8 = 6.28\times10^8$ rad/s.
      `, { cos: { svg: cosFig(), cap: 'cos(ωt − βz) versus z at t = 0 (solid) and at t = T/8 (dashed): the crests have moved λ/8 toward +z.' } }),
      Q(md`**Predict.** $E = \cos(\omega t - \beta z)$ with $\beta = \pi$ rad/m. At $t = 0$, $E(z = \tfrac13\ \text{m}) = $`, ['$0.5$', '$0.945$', '$-0.5$', '$1$'], 0,
        [null, md`That is $\cos(\tfrac13)$: the $\beta$ was dropped (the phase is $\beta z = \pi/3$).`, md`$\cos(-\pi/3) = \cos(\pi/3)$: cosine is even.`, 'Only z = 0 (or whole wavelengths) gives the crest at t = 0.'],
        md`Phase $= -\beta z = -\pi/3$ rad $= -60°$; $\cos(-60°) = 0.5$.`),
      R(md`
        ### The method

        !!method Reading any f(t ∓ z/v)
          1. Write the argument as $t - z/v$ or $t + z/v$ (divide by the coefficient of $t$). That gives the direction and $v$.
          2. **Waveform at $z_1$:** $E(z_1, t) = E(0, t - z_1/v)$ for a $+z$ wave. Shift the $z = 0$ graph later by $z_1/v$.
          3. **Profile at $t_1$:** a feature from time $t_k$ at $z = 0$ sits at $z = v(t_1 - t_k)$. Flip the shape and stretch by $v$.
          4. **Check:** the front is what arrived first; a value at one $(z, t)$ is the value at $z = 0$ at the earlier time $t - z/v$.

        ### Worked example

        !!graded Problem
          A wave travels toward $+z$ at $v = 2\times10^8$ m/s $= 200$ m/μs. At $z = 0$, $E_y(0, t) = 4\,\triangle\big((t - 2)/2\big)$ V/m, with $t$ in μs. Find $E_y(z, t)$, when the peak passes $z = 600$ m, where the pulse is at $t = 5\ \mu$s, and $E_y(500\ \text{m}, 5\ \mu\text{s})$.

        **1. Everywhere.** Replace $t$ by $t - z/v$: $\;E_y(z, t) = 4\,\triangle\!\left(\dfrac{t - z/200 - 2}{2}\right)$ V/m ($z$ in m, $t$ in μs).

        **2. Peak at 600 m.** The peak has argument 0: $t = 2 + 600/200 = 5\ \mu$s.

        **3. Snapshot at 5 μs.** Nonzero for $\left|5 - z/200 - 2\right| < 1$, i.e. $2 < z/200 < 4$: $\;400\ \text{m} < z < 800\ \text{m}$, peak at 600 m.

        **4. One value.** At $z = 500$ m: argument $(5 - 2.5 - 2)/2 = 0.25$, so $E_y = 4(1 - 2\cdot0.25) = 2$ V/m.

        **Check.** At 500 m the field at $t = 5\ \mu$s is what $z = 0$ had at $5 - 2.5 = 2.5\ \mu$s: $4\triangle(0.25) = 2$ V/m. ✓

        !!mistake Common mistakes
          - The speed upside down: it is (coefficient of $t$)/(coefficient of $z$).
          - Moving $f(t - 3)$ left. Minus means later: right.
          - Drawing the snapshot with the same orientation as the waveform. In $z$ it is flipped.
          - Degrees in $\cos(\omega t - \beta z)$: the phase is in radians.
          - Judging the direction from the sign of $z$ alone: $\cos(\beta z - \omega t)$ also travels toward $+z$.
          - $\cos(\omega t)\cos(\beta z)$ is a **standing** wave, not a traveling one (HW 7 #5(c)).

        ### Check questions
      `),
      Q(md`Which travels toward $-z$?`, [md`$f(t + z/v)$`, md`$f(t - z/v)$`, md`$f(z - vt)$`, md`$\cos(\beta z - \omega t)$`], 0,
        [null, 'Opposite signs on t and z: toward +z.', 'Opposite signs on t and z: toward +z.', md`Opposite signs on $t$ and $z$: toward $+z$. Swapping the order inside the cosine changes nothing.`],
        md`Same signs on $t$ and $z$: the feature at $t + z/v = $ const moves as $z = -vt$.`),
      Q(md`$E = e^{-(3t - 0.01z)^2}$ ($t$ in s, $z$ in m) travels…`, [md`toward $+z$ at 300 m/s`, md`toward $-z$ at 300 m/s`, md`toward $+z$ at $3.3\times10^{-3}$ m/s`, md`toward $+z$ at 3 m/s`], 0,
        [null, md`$3t$ and $-0.01z$ have opposite signs: toward $+z$.`, 'The speed is (coefficient of t)/(coefficient of z) = 3/0.01.', md`Divide by the coefficient of $z$ too: $3t - 0.01z = 3(t - z/300)$.`],
        md`$3t - 0.01z = 3(t - z/300)$: toward $+z$ at 300 m/s.`),
      Q(md`$\cos(\omega t - \beta z)$ with $\beta = 4\pi$ rad/m has wavelength…`, ['0.5 m', '2 m', '4π m', '0.25 m'], 0,
        [null, md`That is $2\pi/\beta$ with $\beta = \pi$.`, md`$\lambda = 2\pi/\beta$, not $\beta$.`, md`That is $\pi/\beta$.`],
        md`$\lambda = 2\pi/\beta = 2\pi/4\pi = 0.5$ m.`),
      Q(md`A 1 GHz wave in vacuum has wavelength…`, ['0.3 m', '3 m', '4.8 cm', '0.03 m'], 0,
        [null, 'That is 100 MHz.', md`That is $\lambda/2\pi = 1/\beta$; the wavelength is $c/f$.`, 'That is 10 GHz.'],
        md`$\lambda = c/f = 3\times10^8/10^9 = 0.3$ m.`),
      Q(md`A pulse passes $z = 0$ at $t = 0$, traveling toward $+z$ at 300 m/μs. A probe at $z = 900$ m sees it at…`, [md`$t = 3\ \mu$s`, md`$t = -3\ \mu$s`, md`$t = 0.33\ \mu$s`, 'never'], 0,
        [null, 'The probe is downstream, so it sees the pulse later, not earlier.', 'Time = distance/speed = 900/300.', 'The probe is on the side the pulse travels toward.'],
        md`$t = z/v = 900/300 = 3\ \mu$s.`),
      Q(md`A wave travels in free space. The phase at a fixed point changes by $3\pi$ rad in a 10 μs interval. Its wavelength is about…`, ['2000 m', '0.1 m', '5 m', '2 m'], 0,
        [null, md`That needs $f = c/\lambda = 3$ GHz. Here $f = \Delta\phi/(2\pi\Delta t) = 150$ kHz.`, md`That needs $f = 60$ MHz. Here $f = \Delta\phi/(2\pi\Delta t) = 150$ kHz.`, md`That treats 10 μs as 10 ns: off by 1000.`],
        md`$\omega = 3\pi/(10^{-5}\,\text{s}) = 3\pi\times10^5$ rad/s, $f = 1.5\times10^5$ Hz, $\lambda = c/f = 3\times10^8/1.5\times10^5 = 2000$ m.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`Compared with the waveform $E(0, t)$, the snapshot $E(z, t_1)$ of a wave traveling toward $+z$ is…`,
        ['flipped left-to-right and stretched by v', 'the same shape, stretched by v', 'flipped upside down', 'shrunk by v'], 0,
        [null, md`The argument $t_1 - z/v$ runs backward as $z$ increases: the shape is mirrored.`, 'The values keep their signs; only the axis runs backward.', md`One microsecond of waveform becomes $v\times1\ \mu$s of profile: a stretch by $v$.`],
        md`$E(z, t_1) = E(0, t_1 - z/v)$: each feature from time $t_k$ sits at $z = v(t_1 - t_k)$.`),
      Q(md`Is $E = \cos(\omega t)\cos(\beta x)\,\hat y$ a traveling wave?`,
        ['No: it is a standing wave, the sum of two equal waves traveling in opposite directions', md`Yes, toward $+x$`, md`Yes, toward $-x$`, 'No: it does not satisfy the wave equation'], 0,
        [null, md`It cannot be written as a function of $t - x/v$ alone: its nodes ($\cos\beta x = 0$) never move.`, 'Its nodes never move.', md`It does satisfy it when $\omega/\beta = 1/\sqrt{\mu\epsilon}$: it is the sum of two traveling waves.`],
        md`$\cos\omega t\cos\beta x = \tfrac12\big[\cos(\omega t - \beta x) + \cos(\omega t + \beta x)\big]$ (HW 7 #5(c)).`),
      R(md`
        ### Drills with new situations every time
      `),
      level(1, 'recognize', md`**The trick:** opposite signs on $t$ and the coordinate: positive direction; speed = (coefficient of $t$)/(coefficient of the coordinate).`),
      Object.assign(G('rf_u0_dir', { need: 6 }), { id: 'u0-waveforms.r0' }),
      level(2, 'shift and convert', md`**The trick:** arrival time = distance/speed; $\lambda = c/(f\sqrt{\epsilon_r})$; phase in radians.`),
      Object.assign(G('rf_u0_shift', { need: 6 }), { id: 'u0-waveforms.r1' }),
      level(3, 'read a traveling pulse', md`**The trick:** replace $t$ by $t \mp z/v$, then set the argument to the feature you want.`),
      Object.assign(G('u0_wave_read', { need: 2 }), { id: 'u0-waveforms.r2' }),
    ],
  });

  // ================================================================ generators: A
  GENS.rf_u0_cross = () => one([
    // unit vectors
    () => {
      const a = pick(AX), b = pick(AX), sa = pick([1, 1, -1]), sb = pick([1, 1, -1]);
      const q = md`$${uv(a, sa)}\times${uv(b, sb)} = $`;
      const r = cx(a, sa, b, sb);
      if (!r) {
        return MC('Unit vectors', q, '$0$',
          [[$u(a, sa * sb), md`Parallel vectors give zero: $|\mathbf A\times\mathbf B| = AB\sin0$.`], ['$1$', 'That would be a dot product of equal unit vectors; the cross product of parallel vectors is the zero vector.'], [$u(AX[(AX.indexOf(a) + 1) % 3]), 'Parallel vectors span no area, so there is no perpendicular direction to pick.']],
          md`Parallel (or antiparallel) vectors: $\sin\theta = 0$.`);
      }
      const [k, s] = r, F = fwd(AX, a, b);
      return MC('Unit vectors', q, $u(k, s),
        [[$u(k, -s), md`$${a} \to ${b}$ is ${F ? 'forward' : 'backward'} on $x \to y \to z \to x$, so $\hat ${a}\times\hat ${b} = ${F ? '' : '-'}\hat ${k}$; then multiply the signs of the factors.`], ['$0$', 'Only parallel vectors give zero.'], [$u(a, sa), 'The cross product is perpendicular to both factors.'], [$u(b, sb), 'The cross product is perpendicular to both factors.']],
        md`$\hat ${a}\times\hat ${b} = ${F ? '' : '-'}\hat ${k}$ (${F ? 'forward' : 'backward'}), times $(${sa})(${sb})$: $${uv(k, s)}$.`);
    },
    // cylindrical unit vectors
    () => {
      const T = ['r', 'phi', 'z'];
      const i = ri(0, 2); let j = ri(0, 2); if (j === i) j = (i + pick([1, 2])) % 3;
      const a = T[i], b = T[j], sa = pick([1, 1, -1]), sb = pick([1, 1, -1]);
      const [k, s] = crossT(T, a, sa, b, sb), F = fwd(T, a, b);
      return MC('Cylindrical unit vectors', md`$${uv(a, sa)}\times${uv(b, sb)} = $`, $u(k, s),
        [[$u(k, -s), md`$(\hat r, \hat\phi, \hat z)$ cycles like $(x, y, z)$; this order is ${F ? 'forward' : 'backward'}. Then multiply the signs.`], ['$0$', 'They are perpendicular, not parallel.'], [$u(a, sa), 'The cross product is perpendicular to both factors.'], [$u(b, -sb), 'The cross product is perpendicular to both factors.']],
        md`$\hat r\times\hat\phi = \hat z$, $\hat\phi\times\hat z = \hat r$, $\hat z\times\hat r = \hat\phi$; ${F ? 'forward' : 'backward'} here, so $${uv(a, sa)}\times${uv(b, sb)} = ${uv(k, s)}$.`);
    },
    // dot product of small integer vectors
    () => {
      let A, B, d;
      do { A = [ri(-3, 3), ri(-3, 3), ri(-3, 3)]; B = [ri(-3, 3), ri(-3, 3), ri(-3, 3)]; d = A[0] * B[0] + A[1] * B[1] + A[2] * B[2]; } while (A.filter((x) => x).length < 2 || B.filter((x) => x).length < 2);
      const abs = Math.abs(A[0] * B[0]) + Math.abs(A[1] * B[1]) + Math.abs(A[2] * B[2]);
      const noz = A[0] * B[0] + A[1] * B[1];
      return MC('Dot product', md`$\mathbf A = ${vt(A)}$, $\mathbf B = ${vt(B)}$. $\mathbf A\cdot\mathbf B = $`, `$${d}$`,
        [[`$${abs}$`, 'Keep the signs of the products: a negative component times a positive one is negative.'], [`$${noz}$`, md`The $z$ components multiply too.`], [`$${-d}$`, 'Sign slip: recheck each product.'], [`$${d + 2}$`, 'Arithmetic slip: multiply matching components and add.'], [md`$${vt([A[0] * B[0], A[1] * B[1], A[2] * B[2]])}$`, 'A dot product is a number: add the three products.']],
        md`$(${A[0]})(${B[0]}) + (${A[1]})(${B[1]}) + (${A[2]})(${B[2]}) = ${d}$.`);
    },
    // dot or cross?
    () => {
      const [what, isDot] = pick([
        [md`the flux $\Psi = \int\mathbf B\cdot d\mathbf S$`, true], [md`the emf $\oint\mathbf E\cdot d\mathbf l$`, true], [md`the force $q\mathbf v\times\mathbf B$`, false],
        [md`the Poynting vector $\mathbf E\times\mathbf H$`, false], [md`the power density $\mathbf E\cdot\mathbf J$`, true], [md`the force on a wire, $I\,d\mathbf l\times\mathbf B$`, false],
        [md`the sheet field $\tfrac12\mathbf J_s\times\hat n$`, false], [md`the current $\int\mathbf J\cdot d\mathbf S$`, true],
      ]);
      return MC('Dot or cross?', md`What kind of quantity is ${what}?`, isDot ? 'a number (a dot product)' : 'a vector (a cross product)',
        [[isDot ? 'a vector (a cross product)' : 'a number (a dot product)', isDot ? 'A dot product keeps only the part of one vector along the other: a number.' : 'A cross product gives a vector perpendicular to both factors.'], ['a product of magnitudes, with no direction involved', 'Directions matter: only the component along (dot) or across (cross) counts.'], ['a vector along the first factor', 'Neither product points along a factor in general.']],
        isDot ? 'A dot product: a signed number.' : 'A cross product: a vector perpendicular to both factors.');
    },
  ]);

  GENS.rf_u0_rhr = () => one([
    // field of a wire
    () => {
      const a = pick(AX), sI = pick([1, -1]), b = pick(AX.filter((x) => x !== a)), sP = pick([1, -1]), d = pick([1, 2, 3, 5]);
      const [k, s] = cx(a, sI, b, sP);
      const P = AX.map((x) => (x === b ? sP * d : 0));
      return MC('Field of a wire', md`A long straight wire on the $${a}$-axis carries current along $${uv(a, sI)}$. At the point $(${P.join(', ')})$ m, $\mathbf B$ points along…`, $u(k, s),
        [[$u(k, -s), md`That is the field of a current along $${uv(a, -sI)}$. Thumb along the current; the fingers curl the way $\mathbf B$ goes.`], [$u(b, sP), 'That points away from the wire. The field of a wire circles it.'], [$u(b, -sP), 'That points toward the wire. The field of a wire circles it.'], [$u(a, sI), 'The field is perpendicular to the current that makes it.']],
        md`$\mathbf B \propto (\text{current direction})\times(\text{direction from the wire to the point}) = ${uv(a, sI)}\times${uv(b, sP)} = ${uv(k, s)}$.`);
    },
    // force on a moving charge
    () => {
      const pos = pick([true, false]), a = pick(AX), sv = pick([1, -1]), b = pick(AX.filter((x) => x !== a)), sB = pick([1, -1]);
      const [k, s0] = cx(a, sv, b, sB), s = pos ? s0 : -s0;
      return MC('Force on a charge', md`${pos ? 'A proton' : 'An electron'} moves along $${uv(a, sv)}$ through a uniform $\mathbf B$ along $${uv(b, sB)}$. The magnetic force on it points along…`, $u(k, s),
        [[$u(k, -s), pos ? md`That is $-\mathbf v\times\mathbf B$. For a positive charge the force is along $\mathbf v\times\mathbf B$.` : md`That is $\mathbf v\times\mathbf B$; the electron's negative charge reverses it.`], [$u(a, sv), 'The magnetic force is perpendicular to the velocity.'], [$u(b, sB), 'The magnetic force is perpendicular to the field.'], [$u(a, -sv), 'The magnetic force is perpendicular to the velocity: it never brakes the charge directly.']],
        md`$\mathbf F = q\mathbf v\times\mathbf B$ and $${uv(a, sv)}\times${uv(b, sB)} = ${uv(k, s0)}$${pos ? '.' : md`; $q < 0$ flips it to $${uv(k, s)}$.`}`);
    },
    // loop: B at the center, or dS from C
    () => {
      const k = pick(AX), from = pick([1, -1]), ccw = pick([true, false]), isB = pick([true, false]);
      const s = (ccw ? 1 : -1) * from;
      const plane = { x: 'yz', y: 'xz', z: 'xy' }[k], o = AX.filter((x) => x !== k);
      const view = `${sgnTxt(from)}${k}`, turn = ccw ? 'counterclockwise' : 'clockwise';
      const q = isB ? md`A loop in the $${plane}$-plane carries a current that flows **${turn}** seen from $${view}$. At its center, $\mathbf B$ points along…`
        : md`A path $C$ in the $${plane}$-plane runs **${turn}** seen from $${view}$. The right-hand rule gives $d\mathbf S$ along…`;
      return MC(isB ? 'Loop and field' : 'Path and surface', q, $u(k, s),
        [[$u(k, -s), md`Curl the right-hand fingers ${turn} as seen from $${view}$: the thumb points ${ccw ? 'toward' : 'away from'} the viewer.`], [$u(o[0]), md`The axis of a loop in the $${plane}$-plane is along $\hat ${k}$.`], [$u(o[1], -1), md`The axis of a loop in the $${plane}$-plane is along $\hat ${k}$.`]],
        md`Counterclockwise seen from a side means the thumb points toward that side. Here: $${uv(k, s)}$.`);
    },
    // r-hat or phi-hat at a point
    () => {
      const d = pick([0, 90, 180, 270, 45, 135, 225, 315]), isPhi = pick([true, false]), m = pick([1, 2, 3]);
      const c = Math.cos(d * DEG), s = Math.sin(d * DEG);
      const P = d % 90 === 0 ? [Math.round(c) * m, Math.round(s) * m] : [Math.sign(c) * m, Math.sign(s) * m];
      const rv = [c, s], pv = [-s, c];
      const right = isPhi ? pv : rv, other = isPhi ? rv : pv;
      return MC(isPhi ? 'φ̂ at a point' : 'r̂ at a point', md`At the point $(x, y) = (${P[0]}, ${P[1]})$ m, $${isPhi ? '\\hat\\phi' : '\\hat r'} = $`, `$${vec2(right)}$`,
        [[`$${vec2(right.map((x) => -x))}$`, isPhi ? md`That is clockwise seen from $+z$; $\hat\phi$ runs counterclockwise.` : 'That points toward the z-axis; r̂ points away from it.'], [`$${vec2(other)}$`, isPhi ? md`That is $\hat r$ there, pointing away from the axis.` : md`That is $\hat\phi$ there, along the circle.`], [`$${vec2(other.map((x) => -x))}$`, isPhi ? 'That points toward the axis.' : 'That runs clockwise along the circle.']],
        md`$\phi = ${d}°$: $\hat r = \cos\phi\,\hat x + \sin\phi\,\hat y = ${vec2(rv)}$, and $\hat\phi = -\sin\phi\,\hat x + \cos\phi\,\hat y = ${vec2(pv)}$.`);
    },
    // wave direction from E x H
    () => {
      const a = pick(AX), sa = pick([1, -1]), b = pick(AX.filter((x) => x !== a)), sb = pick([1, -1]);
      const [k, s] = cx(a, sa, b, sb);
      return MC('Which way does it travel?', md`At some instant a plane wave has $\mathbf E$ along $${uv(a, sa)}$ and $\mathbf H$ along $${uv(b, sb)}$. It travels toward…`, $u(k, s),
        [[$u(k, -s), md`That is $\mathbf H\times\mathbf E$. Power flows along $\mathbf E\times\mathbf H$, in that order.`], [$u(a, sa), 'A plane wave travels perpendicular to its fields.'], [$u(b, sb), 'A plane wave travels perpendicular to its fields.']],
        md`$\mathbf E\times\mathbf H \propto ${uv(a, sa)}\times${uv(b, sb)} = ${uv(k, s)}$.`);
    },
  ]);

  GENS.u0_vec_calc = () => {
    if (pick([true, false])) {
      let A, B, d, X;
      for (let i = 0; i < 1000; i++) {
        A = [ri(-4, 4), ri(-4, 4), ri(-4, 4)]; B = [ri(-4, 4), ri(-4, 4), ri(-4, 4)];
        d = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
        X = [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]];
        if (d !== 0 && X.every((x) => x !== 0)) break;
      }
      const mA = Math.hypot(...A), mB = Math.hypot(...B), th = Math.acos(d / (mA * mB)) / DEG;
      const A2 = A[0] ** 2 + A[1] ** 2 + A[2] ** 2, B2 = B[0] ** 2 + B[1] ** 2 + B[2] ** 2;
      return {
        title: 'Dot and cross product',
        q: md`$\mathbf A = ${vt(A)}$ and $\mathbf B = ${vt(B)}$. Find $\mathbf A\cdot\mathbf B$, the three components of $\mathbf A\times\mathbf B$, and the angle $\theta$ between $\mathbf A$ and $\mathbf B$ in degrees.`,
        parts: [N('\\mathbf A\\cdot\\mathbf B', d, ''), N('(\\mathbf A\\times\\mathbf B)_x', X[0], ''), N('(\\mathbf A\\times\\mathbf B)_y', X[1], ''), N('(\\mathbf A\\times\\mathbf B)_z', X[2], ''), N('\\theta', th, 'deg', 0.01)],
        hints: [md`Dot: multiply matching components and add. Cross: $\big(A_yB_z - A_zB_y,\ A_zB_x - A_xB_z,\ A_xB_y - A_yB_x\big)$.`, md`$\cos\theta = \dfrac{\mathbf A\cdot\mathbf B}{AB}$, with $A = \sqrt{A_x^2 + A_y^2 + A_z^2}$.`],
        sol: sol({
          eq: md`$\mathbf A\cdot\mathbf B = A_xB_x + A_yB_y + A_zB_z = AB\cos\theta$; $\;\mathbf A\times\mathbf B = (A_yB_z - A_zB_y)\hat x + (A_zB_x - A_xB_z)\hat y + (A_xB_y - A_yB_x)\hat z$.`,
          sym: md`$\mathbf A\cdot\mathbf B = (${A[0]})(${B[0]}) + (${A[1]})(${B[1]}) + (${A[2]})(${B[2]}) = ${d}$. $\;(\mathbf A\times\mathbf B)_x = (${A[1]})(${B[2]}) - (${A[2]})(${B[1]}) = ${X[0]}$, $\;(\mathbf A\times\mathbf B)_y = (${A[2]})(${B[0]}) - (${A[0]})(${B[2]}) = ${X[1]}$, $\;(\mathbf A\times\mathbf B)_z = (${A[0]})(${B[1]}) - (${A[1]})(${B[0]}) = ${X[2]}$.`,
          sub: md`$$\theta = \arccos\frac{${d}}{\sqrt{${A2}}\,\sqrt{${B2}}} = ${f(th)}°$$`,
          ans: md`$\mathbf A\cdot\mathbf B = ${d}$, $\;\mathbf A\times\mathbf B = ${vt(X)}$, $\;\theta = ${f(th)}°$.`,
          check: md`$(\mathbf A\times\mathbf B)\cdot\mathbf A = (${X[0]})(${A[0]}) + (${X[1]})(${A[1]}) + (${X[2]})(${A[2]}) = ${X[0] * A[0] + X[1] * A[1] + X[2] * A[2]}$: perpendicular, as it must be. ${d > 0 ? 'A positive dot product means θ < 90°.' : 'A negative dot product means θ > 90°.'}`,
        }),
      };
    }
    const pos = pick([true, false]), vx = pick([1, 2, 3, 4, 5]) * pick([1, -1]), vy = pick([1, 2, 3, 4, 5]) * pick([1, -1]), Bz = pick([0.1, 0.2, 0.5, 1, 2]) * pick([1, -1]);
    const q = (pos ? 1 : -1) * 1.6e-19;
    const Fx = q * vy * 1e5 * Bz, Fy = -q * vx * 1e5 * Bz, Fm = Math.abs(q) * Math.hypot(vx, vy) * 1e5 * Math.abs(Bz);
    return {
      title: 'Force on a moving charge',
      q: md`${pos ? 'A proton' : 'An electron'} ($q = ${pos ? '+' : '-'}1.6\times10^{-19}$ C) moves with $\mathbf v = (${vt([vx, vy, 0])})\times10^5$ m/s through $\mathbf B = ${EM.p(Bz)}\,\hat z$ T. Find the components of $\mathbf F = q\mathbf v\times\mathbf B$ and its magnitude.`,
      parts: [N('F_x', Fx, 'N'), N('F_y', Fy, 'N'), N('|\\mathbf F|', Fm, 'N')],
      hints: [md`$\hat x\times\hat z = -\hat y$ and $\hat y\times\hat z = +\hat x$.`, md`$\mathbf v\times\mathbf B = (v_yB_z)\,\hat x - (v_xB_z)\,\hat y$ for $\mathbf B$ along $\hat z$; then multiply by $q$ with its sign.`],
      sol: sol({
        eq: md`$\mathbf F = q\mathbf v\times\mathbf B$ with $\hat x\times\hat z = -\hat y$, $\hat y\times\hat z = \hat x$.`,
        sym: md`$\mathbf v\times\mathbf B = v_yB_z\,\hat x - v_xB_z\,\hat y$, so $F_x = qv_yB_z$, $F_y = -qv_xB_z$, $|\mathbf F| = |q|\sqrt{v_x^2 + v_y^2}\,|B_z|$.`,
        sub: md`$$F_x = (${pos ? '' : '-'}1.6\times10^{-19})(${vy}\times10^5)(${Bz}) = ${f(Fx)}\ \text{N}, \qquad F_y = -(${pos ? '' : '-'}1.6\times10^{-19})(${vx}\times10^5)(${Bz}) = ${f(Fy)}\ \text{N}$$`,
        ans: md`$\mathbf F = (${f(Fx)}\,\hat x ${Fy < 0 ? '-' : '+'} ${f(Math.abs(Fy))}\,\hat y)$ N, $\;|\mathbf F| = ${f(Fm)}$ N.`,
        check: md`$\mathbf F\cdot\mathbf v \propto F_xv_x + F_yv_y = q B_z(v_yv_x - v_xv_y) = 0$: perpendicular to the velocity. ✓`,
      }),
    };
  };

  // ================================================================ generators: B
  GENS.rf_u0_dS = () => one([
    // which dS
    () => {
      const [desc, right, wrongs] = pick([
        [md`the plane $z = 2$ m, normal pointing up`, md`$\hat z\,dx\,dy$`, [[md`$\hat z\,dz$`, 'A patch of a surface needs two small lengths, the two that lie in the plane.'], [md`$\hat x\,dy\,dz$`, md`That is a patch of a plane $x = $ const.`], [md`$-\hat z\,dx\,dy$`, 'That normal points down.']]],
        [md`the plane $x = 0$, normal along $-\hat x$`, md`$-\hat x\,dy\,dz$`, [[md`$\hat x\,dy\,dz$`, 'That normal points along +x.'], [md`$-\hat x\,dx\,dy$`, md`On $x = $ const, $x$ does not vary; the patch spans $dy$ and $dz$.`], [md`$-\hat z\,dy\,dz$`, 'The normal of a plane x = const is along x.']]],
        [md`the plane $y = 3$ m, normal along $+\hat y$`, md`$\hat y\,dx\,dz$`, [[md`$\hat y\,dy\,dz$`, md`On $y = $ const, $y$ does not vary.`], [md`$\hat x\,dx\,dz$`, 'The normal of a plane y = const is along y.'], [md`$-\hat y\,dx\,dz$`, 'That normal points along −y.']]],
        [md`the curved side of a cylinder $r = a$ on the $z$-axis, outward`, md`$\hat r\,a\,d\phi\,dz$`, [[md`$\hat r\,d\phi\,dz$`, md`An angle step $d\phi$ is an arc of length $a\,d\phi$; without the $a$ it is not an area.`], [md`$\hat\phi\,a\,d\phi\,dz$`, md`$\hat\phi$ is tangent to the side; the normal is $\hat r$.`], [md`$\hat z\,r\,dr\,d\phi$`, 'That is a patch of a disk.']]],
        [md`a disk in the plane $z = 0$ centered on the $z$-axis, normal $+\hat z$, in cylindrical coordinates`, md`$\hat z\,r\,dr\,d\phi$`, [[md`$\hat z\,dr\,d\phi$`, md`A step $d\phi$ at radius $r$ has length $r\,d\phi$.`], [md`$\hat r\,r\,dr\,d\phi$`, md`$\hat r$ lies in the disk; the normal is $\hat z$.`], [md`$\hat z\,a\,d\phi\,dz$`, 'That mixes in a cylinder side.']]],
        [md`a half-plane $\phi = $ const (it contains the $z$-axis), normal $+\hat\phi$`, md`$\hat\phi\,dr\,dz$`, [[md`$\hat\phi\,r\,dr\,dz$`, md`On $\phi = $ const the patch spans $dr$ and $dz$, both plain lengths; no extra $r$.`], [md`$\hat r\,dr\,dz$`, md`$\hat r$ lies in the half-plane; the normal is $\hat\phi$.`], [md`$\hat\phi\,r\,d\phi\,dz$`, md`$\phi$ does not vary on this surface.`]]],
      ]);
      return MC('Which dS?', md`For ${desc}, the surface element is $d\mathbf S = $`, right, wrongs, md`(unit normal) × (the two small lengths that span the patch): ${right}.`);
    },
    // outward normal of a face
    () => {
      // tan: a direction that lies in the face (never its normal)
      const [face, right, wr, tan] = pick([
        [md`the face $x = 0$ of the cube $0 \le x, y, z \le 1$ m`, md`$-\hat x$`, md`$+\hat x$`, md`$+\hat y$`],
        [md`the face $y = 1$ m of the cube $0 \le x, y, z \le 1$ m`, md`$+\hat y$`, md`$-\hat y$`, md`$+\hat z$`],
        [md`the face $z = 0$ of the cube $0 \le x, y, z \le 1$ m`, md`$-\hat z$`, md`$+\hat z$`, md`$+\hat x$`],
        [md`the bottom face $z = 0$ of a closed cylinder $0 \le z \le L$`, md`$-\hat z$`, md`$+\hat z$`, md`$+\hat r$`],
        [md`the top face $z = L$ of a closed cylinder $0 \le z \le L$`, md`$+\hat z$`, md`$-\hat z$`, md`$+\hat r$`],
        [md`the curved side of a closed cylinder on the $z$-axis`, md`$+\hat r$`, md`$-\hat r$`, md`$+\hat z$`],
        [md`the face $x = -2$ m of the box $-2 \le x, y, z \le 2$ m`, md`$-\hat x$`, md`$+\hat x$`, md`$+\hat z$`],
      ]);
      return MC('Outward normal', md`Gauss's law uses a closed surface. On ${face}, $d\mathbf S$ points along…`, right,
        [[wr, 'That points into the volume. On a closed surface dS points outward.'], [md`either way: you choose`, 'Only an open surface leaves the choice to you (then fixed by C). A closed surface takes the outward normal.'], [tan, 'That direction lies in the face. A normal is perpendicular to it.']],
        md`Outward, away from the enclosed volume: ${right}.`);
    },
    // sign of a uniform flux
    () => {
      const a = pick(AX), k = pick([a, a, ...AX.filter((x) => x !== a)].slice(0, 3)), sB = pick([1, -1]), sS = pick([1, -1]);
      const B0 = pick([0.2, 0.5, 2, 3]), A = pick([0.1, 0.5, 2, 4]);
      const v = a === k ? sB * sS * B0 * A : 0;
      const plane = { x: 'yz', y: 'xz', z: 'xy' }[k];
      const o = (x) => `$${EM.p(n3(x))}$ Wb`;
      return MC('Sign of the flux', md`A uniform $\mathbf B = ${sB < 0 ? '-' : ''}${B0}\,\hat ${a}$ T, and a flat loop of area $${A}\,\text{m}^2$ in the $${plane}$-plane with $d\mathbf S$ along $${uv(k, sS)}$. The flux through the loop is $\Psi = $`, o(v),
        v === 0 ? [[o(B0 * A), md`The loop's normal is $\hat ${k}$ and $\mathbf B$ is along $\hat ${a}$: they are perpendicular, so no field crosses.`], [o(-B0 * A), 'An edge-on loop links no flux.'], [o(B0), 'Flux is field times area, and here the field does not cross at all.']]
          : [[o(-v), md`$\mathbf B$ points ${v > 0 ? 'along' : 'against'} $d\mathbf S$, so $\Psi$ is ${v > 0 ? 'positive' : 'negative'}.`], [o(0), 'The loop faces the field.'], [o(v / A), 'Flux is the field times the area, in T·m² = Wb.']],
        v === 0 ? md`$\mathbf B\cdot\hat ${k} = 0$: the field runs along the loop.` : md`$\Psi = (\mathbf B\cdot\hat n)A = (${sB * B0})(${sS})(${A}) = ${EM.p(n3(v))}$ Wb.`);
    },
    // line integral of a uniform field along an axis
    () => {
      const a = pick(AX), k = pick([a, a, ...AX.filter((x) => x !== a)].slice(0, 3)), E0 = pick([2, 3, 5, 10]) * pick([1, -1]);
      let x1 = ri(-4, 4), x2 = ri(-4, 4); if (x1 === x2) x2 = x1 + pick([2, 3, -2]);
      const v = a === k ? E0 * (x2 - x1) : 0;
      const o = (x) => `$${x}$ V`;
      return MC('Line integral', md`$\mathbf E = ${E0}\,\hat ${a}$ V/m everywhere. Along the $${k}$-axis from $${k} = ${x1}$ m to $${k} = ${x2}$ m, $\int\mathbf E\cdot d\mathbf l = $`, o(v),
        v === 0 ? [[o(E0 * (x2 - x1)), md`The path runs along $\hat ${k}$ and the field along $\hat ${a}$: perpendicular, so nothing adds up.`], [o(-E0 * (x2 - x1)), 'The field has no component along this path.'], [o(E0), 'The field has no component along this path.'], [o(-E0), 'The field has no component along this path.']]
          : [[o(-v), 'The limits run from the start to the end of the path; check which way you walk.'], [o(0), 'The path runs along the field.'], [o(E0 * (Math.abs(x2) + Math.abs(x1))), 'Integrate from the start point to the end point: E times the signed displacement.'], [o(E0 * x2), 'Use the displacement from start to end, not the end point alone.'], [o(E0), 'That is the field itself; multiply it by the signed distance walked.']],
        v === 0 ? md`$\mathbf E\cdot\hat ${k} = 0$ on the whole path.` : md`$\int_{${x1}}^{${x2}}${E0}\,d${k} = ${E0}\,(${x2} - (${x1})) = ${v}$ V.`);
    },
  ]);

  GENS.rf_u0_lineint = () => one([
    // circulation of an azimuthal field around a circle
    () => {
      const r = pick([0.5, 1.5, 3, 4]), H0 = pick([2, 3, 4, 5, 10]), cw = pick([true, false]);
      const c = (cw ? -1 : 1) * 2 * r * H0;
      const o = (x) => `$${x === 1 ? '' : x === -1 ? '-' : EM.p(x)}\\pi$ A`;
      return MC('Circulation', md`$\mathbf H = ${H0}\,\hat\phi$ A/m on a circle of radius $${r}$ m about the $z$-axis. Walking the circle **${cw ? 'clockwise' : 'counterclockwise'}** seen from $+z$, $\oint\mathbf H\cdot d\mathbf l = $`, o(c),
        [[o(-c), cw ? md`Clockwise from $+z$ runs against $\hat\phi$: $\phi$ goes from $2\pi$ down to 0.` : md`Counterclockwise from $+z$ runs along $\hat\phi$.`], [o((cw ? -1 : 1) * r * r * H0), md`That is $\pi r^2H$, an area times the field. A circulation uses the circumference $2\pi r$.`], [o((cw ? -1 : 1) * 2 * H0), md`The circumference is $2\pi r$, not $2\pi$.`]],
        md`$\oint\mathbf H\cdot d\mathbf l = ${cw ? '-' : ''}H_\phi\cdot2\pi r = ${cw ? '-' : ''}(${H0})(2\pi)(${r}) = ${EM.p(c)}\pi$ A.`);
    },
    // flux of a linearly or quadratically growing field over a square
    () => {
      const B0 = pick([1, 2, 3, 6]), a = pick([2, 3, 4]), n = pick([1, 2]), varb = pick(['x', 'y']);
      const v = B0 * a * a / (n + 1);
      const o = (x) => `$${EM.p(n3(x))}$ Wb`;
      return MC('Nonuniform flux', md`$\mathbf B = ${B0 === 1 ? '' : `${B0}\\,`}(${varb}/a)${n === 2 ? '^2' : ''}\,\hat z$ T with $a = ${a}$ m, through the square $0 < x < a$, $0 < y < a$ with $d\mathbf S = +\hat z\,dx\,dy$. $\Psi = $`, o(v),
        [[o(B0 * a * a), md`That treats $B$ as uniform at its largest value $B_0$.`], [o(B0 * a / (n + 1)), 'One side of the square is missing: the other integral gives another factor of a.'], [o(B0 * a * a / (n + 2)), md`$\int_0^a(${varb}/a)^${n}\,d${varb} = a/${n + 1}$.`]],
        md`$\Psi = B_0\,a\int_0^a\left(\dfrac{${varb}}{a}\right)^{${n}}d${varb} = \dfrac{B_0a^2}{${n + 1}} = ${EM.p(n3(v))}$ Wb.`);
    },
    // closed-surface fluxes
    () => {
      const Q0 = pick([2, 3, 6, 12]);
      const [desc, right, wrongs] = pick([
        [md`a point charge $${Q0}$ nC at the center of a cube. The flux of $\mathbf D$ through one face is`, `${EM.p(Q0 / 6)} nC`, [[`${Q0} nC`, 'That is the flux through all six faces together.'], [`${EM.p(Q0 / 4)} nC`, 'A cube has six faces, not four.'], ['0 nC', 'The field leaves through every face.']]],
        [md`a point charge $${Q0}$ nC at the center of a sphere. The flux of $\mathbf D$ out through the upper hemisphere is`, `${EM.p(Q0 / 2)} nC`, [[`${Q0} nC`, 'That is the whole sphere.'], [`${EM.p(Q0 / 4)} nC`, 'A hemisphere is half the sphere.'], ['0 nC', 'The field crosses the hemisphere outward.']]],
        [md`a point charge $${Q0}$ nC just **outside** a closed box. The net flux of $\mathbf D$ out of the box is`, '0 nC', [[`${Q0} nC`, 'The charge is not enclosed: its field lines enter the box and leave again.'], [`${EM.p(Q0 / 2)} nC`, 'Every line that enters also leaves.'], [`${-Q0} nC`, 'Every line that enters also leaves.']]],
        [md`a uniform field $\mathbf D = ${Q0}\,\hat z$ nC/m² and a closed cube of side 1 m. The net outward flux is`, '0 nC', [[`${Q0} nC`, 'That is the flux out of the top face alone; the bottom takes in the same amount.'], [`${2 * Q0} nC`, 'Top and bottom have opposite outward normals: they cancel.'], [`${6 * Q0} nC`, 'Only the top and bottom see the field, and they cancel.']]],
      ]);
      return MC('Closed surfaces', md`Take ${desc}…`, right, wrongs, md`Gauss: $\oint\mathbf D\cdot d\mathbf S = Q_{\text{enc}}$, then symmetry shares it among identical faces.`);
    },
    // path independence for a uniform field
    () => {
      let E, P1, P2, val;
      do { E = [ri(-3, 3), ri(-3, 3)]; P1 = [ri(-2, 2), ri(-2, 2)]; P2 = [ri(-2, 2), ri(-2, 2)]; val = E[0] * (P2[0] - P1[0]) + E[1] * (P2[1] - P1[1]); } while (!val || !E[0] || !E[1]);
      const o = (x) => `$${x}$ V`;
      return MC('Any path', md`$\mathbf E = ${vt([E[0], E[1], 0])}$ V/m (uniform). Along any path from $(${P1.join(', ')})$ m to $(${P2.join(', ')})$ m in the $xy$-plane, $\int\mathbf E\cdot d\mathbf l = $`, o(val),
        [[o(-val), 'That walks from the end to the start.'], [o(E[0] * P2[0] + E[1] * P2[1]), 'Use the displacement from start to end, not the end point alone.'], [o(Math.abs(E[0] * (P2[0] - P1[0])) + Math.abs(E[1] * (P2[1] - P1[1]))), 'Keep the signs: each component times its signed displacement.'],
          [o(E[0] * (P2[0] - P1[0])), md`That keeps only the $x$ part; $E_y$ times the $y$ displacement counts too.`], [o(E[1] * (P2[1] - P1[1])), md`That keeps only the $y$ part; $E_x$ times the $x$ displacement counts too.`]],
        md`A uniform field is conservative: $\int\mathbf E\cdot d\mathbf l = \mathbf E\cdot\Delta\mathbf r = (${E[0]})(${P2[0] - P1[0]}) + (${E[1]})(${P2[1] - P1[1]}) = ${val}$ V.`);
    },
  ]);

  GENS.u0_flux = () => {
    if (pick([true, false])) {
      const I = pick([2, 5, 10, 20, 50]), d = pick([1, 2, 5, 10]), w = pick([1, 2, 5, 10, 20]), h = pick([10, 20, 50, 100]);
      const up = pick([true, false]), right = pick([true, false]);
      const into = up === right;                      // current up, loop to the right: B into the page
      const psi = 2e-7 * I * (h / 100) * Math.log((d + w) / d);
      return {
        title: 'Flux of a wire through a rectangle',
        q: md`A long straight wire on the page carries $I = ${I}$ A **${up ? 'up' : 'down'}** the page. A rectangle lies on the page to the wire's **${right ? 'right' : 'left'}**, its near side $d = ${d}$ cm from the wire, its far side $${d + w}$ cm away, with height $h = ${h}$ cm (sides parallel to the wire). Find the direction of $\mathbf B$ over the rectangle and the size of the flux through it.`,
        parts: [
          { lbl: 'Over the rectangle, $\\mathbf B$ points', mc: ['into the page', 'out of the page'], a: into ? 0 : 1, fixed: true, why: into ? [null, 'Thumb along the current: on this side the fingers go into the page.'] : ['Thumb along the current: on this side the fingers come out of the page.', null] },
          N('|\\Psi|', psi, 'Wb'),
        ],
        hints: [md`$B = \mu_0I/2\pi r$ varies across the rectangle: integrate $\int_d^{d+w}dr/r$.`, md`$|\Psi| = \dfrac{\mu_0Ih}{2\pi}\ln\dfrac{d + w}{d}$, with every length in meters.`],
        sol: sol({
          eq: md`$B = \dfrac{\mu_0I}{2\pi r}$; $\;\Psi = \int\mathbf B\cdot d\mathbf S$ with $dS = dr\,dz$ on the page.`,
          sym: md`$|\Psi| = \displaystyle\int_0^h\!\!\int_d^{d+w}\frac{\mu_0I}{2\pi r}\,dr\,dz = \frac{\mu_0Ih}{2\pi}\ln\frac{d + w}{d}$`,
          sub: md`$$|\Psi| = \frac{(4\pi\times10^{-7}\,\text{H/m})(${I}\,\text{A})(${h / 100}\,\text{m})}{2\pi}\ln\frac{${d + w}}{${d}} = ${f(psi)}\ \text{Wb}$$`,
          ans: md`$\mathbf B$ ${into ? 'into' : 'out of'} the page; $|\Psi| = ${f(psi)}$ Wb.`,
          check: md`Thumb ${up ? 'up' : 'down'}: on the ${right ? 'right' : 'left'} the fingers go ${into ? 'into' : 'out of'} the page. The answer depends on $d$ and $w$ only through $(d + w)/d$, so cm can stay in the ratio; $h$ must be in meters.`,
        }),
      };
    }
    const B0 = pick([0.1, 0.2, 0.5, 1, 2]), a = pick([2, 5, 10, 20]), kind = pick([1, 2, 'lin']), cw = pick([true, false]);
    const A = a / 100, s = cw ? -1 : 1;
    const coef = kind === 'lin' ? Math.PI / 3 : 2 * Math.PI / (kind + 2);
    const psi = s * coef * B0 * A * A;
    const form = kind === 'lin' ? md`B_0\left(1 - \dfrac ra\right)` : md`B_0\left(\dfrac ra\right)${kind === 2 ? '^2' : ''}`;
    const inner = kind === 'lin' ? md`\int_0^a\left(1 - \frac ra\right)r\,dr = \frac{a^2}{2} - \frac{a^2}{3} = \frac{a^2}{6}` : md`\int_0^a\left(\frac ra\right)^{${kind}}r\,dr = \frac{a^2}{${kind + 2}}`;
    const coefTex = kind === 'lin' ? '\\dfrac{\\pi}{3}' : `\\dfrac{2\\pi}{${kind + 2}}`;
    return {
      title: 'Flux of a nonuniform field through a disk',
      q: md`$\mathbf B = ${form}\,\hat z$ with $B_0 = ${B0}$ T, through a disk of radius $a = ${a}$ cm in the $xy$-plane centered on the $z$-axis. The disk's rim $C$ runs **${cw ? 'clockwise' : 'counterclockwise'}** seen from $+z$. Find $d\mathbf S$'s direction and the flux along it.`,
      parts: [
        { lbl: '$d\\mathbf S$ points along', mc: ['$+\\hat z$', '$-\\hat z$'], a: cw ? 1 : 0, fixed: true, why: cw ? ['Clockwise seen from +z puts the thumb down.', null] : [null, 'Counterclockwise seen from +z puts the thumb up, toward the viewer.'] },
        N('\\Psi\\ \\text{along}\\ d\\mathbf S', psi, 'Wb'),
      ],
      hints: [md`$d\mathbf S = ${cw ? '-' : '+'}\hat z\,r\,dr\,d\phi$. Do the $\phi$ integral first: it gives $2\pi$.`, md`$${inner}$, and $a$ in meters.`],
      sol: sol({
        eq: md`$\Psi = \int_S\mathbf B\cdot d\mathbf S$ with $d\mathbf S = ${cw ? '-' : '+'}\hat z\,r\,dr\,d\phi$ (RHR from $C$).`,
        sym: md`$\Psi = ${cw ? '-' : ''}2\pi B_0\displaystyle\int_0^a(\ldots)\,r\,dr$ after the $\phi$ integral, with $${inner}$. So $\Psi = ${cw ? '-' : ''}${coefTex}B_0a^2$.`,
        sub: md`$$\Psi = ${cw ? '-' : ''}${coefTex}(${B0}\,\text{T})(${A}\,\text{m})^2 = ${f(psi)}\ \text{Wb}$$`,
        ans: md`$d\mathbf S$ along $${cw ? '-' : '+'}\hat z$; $\;\Psi = ${f(psi)}$ Wb.`,
        check: md`Uniform $B_0$ would give $\pi B_0a^2$; this field is ${kind === 'lin' ? 'strongest at the center, where there is little area' : 'weakest at the center'}, so the flux is ${f(coef / Math.PI)} of that. ✓`,
      }),
    };
  };

  // ================================================================ generators: C
  // monomials c x^a y^b z^c as TeX, their partial derivatives and values
  const VARS = ['x', 'y', 'z'];
  const monoTeX = (c, e) => {
    const body = VARS.map((v, i) => (e[i] ? `${v}${e[i] > 1 ? `^${e[i]}` : ''}` : '')).join('');
    if (!body) return `${c}`;
    return `${c === 1 ? '' : c === -1 ? '-' : c}${body}`;
  };
  const monoVal = (c, e, P) => c * P[0] ** e[0] * P[1] ** e[1] * P[2] ** e[2];
  const dMono = (c, e, i) => (e[i] ? [c * e[i], e.map((x, j) => (j === i ? x - 1 : x))] : [0, e]);
  const dVal = (m, i, P) => { const [c, e] = dMono(m[0], m[1], i); return c ? monoVal(c, e, P) : 0; };
  const fieldTeX = (M) => {
    let s = '';
    M.forEach((m, i) => { if (!m[0]) return; const t = monoTeX(m[0], m[1]); const neg = t.startsWith('-'); const body = neg ? t.slice(1) : t; s += (s ? (neg ? ' - ' : ' + ') : (neg ? '-' : '')) + `${body}\\,\\hat ${VARS[i]}`; });
    return s || '0';
  };
  const randMono = () => [pick([1, 2, 3, -1, -2]), [ri(0, 2), ri(0, 2), ri(0, 2)]];

  GENS.rf_u0_partial = () => one([
    // derivative of a sinusoid in t or z
    () => {
      const fn = pick(['cos', 'sin']), s = pick([1, -1]), v = pick(['t', 'z']), A = pick(['', '3', '5', 'E_0']);
      const arg = `\\omega t ${s > 0 ? '-' : '+'} \\beta z`;
      const other = fn === 'cos' ? 'sin' : 'cos';
      // d/dt: cos -> -w sin, sin -> +w cos;  d/dz: inner derivative -s*beta
      const sign = v === 't' ? (fn === 'cos' ? -1 : 1) : (fn === 'cos' ? s : -s);
      const fac = v === 't' ? '\\omega' : '\\beta', wfac = v === 't' ? '\\beta' : '\\omega', FN = '\\' + fn;
      const T = (sg, fa, fu) => `$${sg < 0 ? '-' : ''}${A}${fa}\\${fu}(${arg})$`;
      return MC('Partial derivative', md`$\dfrac{\partial}{\partial ${v}}\Big[${A}${FN}(${arg})\Big] = $`, T(sign, fac, other),
        [[T(-sign, fac, other), v === 't' ? md`$${FN}' = ${fn === 'cos' ? '-\\sin' : '\\cos'}$ and the inside derivative is $+\omega$.` : md`The inside derivative is $${s > 0 ? '-' : '+'}\beta$; combine it with $${FN}' = ${fn === 'cos' ? '-\\sin' : '\\cos'}$.`], [T(sign, wfac, other), md`Differentiating in $${v}$ brings down the coefficient of $${v}$, which is $${fac}$.`], [T(sign, fac, fn), md`The derivative of $${FN}$ is $${fn === 'cos' ? '-\\sin' : '\\cos'}$.`]],
        md`Chain rule: $${FN}'(\cdot)\times\partial(${arg})/\partial ${v}$, with $\partial(${arg})/\partial ${v} = ${v === 't' ? '\\omega' : `${s > 0 ? '-' : ''}\\beta`}$.`);
    },
    // partial of a product of powers
    () => {
      const a = ri(1, 3), b = ri(1, 3), c = pick([1, 2, 3, 5]), wrt = pick([0, 1]);
      const e = [a, b, 0], [c1, e1] = dMono(c, e, wrt), [c2, e2] = dMono(c, e, 1 - wrt);
      const right = `$${monoTeX(c1, e1)}$`;
      return MC('Partial derivative', md`$\dfrac{\partial}{\partial ${VARS[wrt]}}\big(${monoTeX(c, e)}\big) = $`, right,
        [[`$${monoTeX(c1, e1)} + ${monoTeX(c2, e2)}$`, md`That adds $\partial/\partial ${VARS[1 - wrt]}$ too. A partial derivative holds $${VARS[1 - wrt]}$ fixed.`], [`$${monoTeX(c1, e1.map((x, j) => (j === 1 - wrt ? 0 : x)))}$`, md`$${VARS[1 - wrt]}$ is held fixed, so it stays as a factor; it does not disappear.`], [`$${monoTeX(c2, e2)}$`, md`That differentiates with respect to $${VARS[1 - wrt]}$.`]],
        md`Treat $${VARS[1 - wrt]}$ as a constant: $${right.slice(1, -1)}$.`);
    },
    // the integration "constant" of a partial anti-derivative
    () => {
      const all = ['x', 'y', 'z', 't'], v = pick(all), others = all.filter((x) => x !== v);
      const g = { x: '6xz', y: '4yt', z: '2z\\cos\\omega t', t: 'z\\sin\\omega t' }[v];
      return MC('Partial anti-derivative', md`$g(x, y, z, t)$ has $\partial g/\partial ${v} = ${g}$. Anti-differentiating in $${v}$ leaves an arbitrary…`, `function of $${others.join(', ')}$`,
        [['number only', md`Any function without $${v}$ also has zero $\partial/\partial ${v}$, not just numbers.`], [`function of $${v}$`, md`A function of $${v}$ would change $\partial g/\partial ${v}$.`], ['nothing: the anti-derivative is unique', 'Only one partial derivative is given; the other variables are free.']],
        md`Anything with $\partial/\partial ${v} = 0$ can be added: an arbitrary function of $${others.join(', ')}$.`);
    },
  ]);

  GENS.rf_u0_divcurl = () => one([
    // divergence of a polynomial field at a point
    () => {
      let M, P, d;
      do { M = [randMono(), randMono(), randMono()]; P = [ri(-2, 2), ri(-2, 2), ri(-2, 2)]; d = dVal(M[0], 0, P) + dVal(M[1], 1, P) + dVal(M[2], 2, P); } while (!d);
      const mis = dVal(M[0], 1, P) + dVal(M[1], 2, P) + dVal(M[2], 0, P);
      const sum = monoVal(M[0][0], M[0][1], P) + monoVal(M[1][0], M[1][1], P) + monoVal(M[2][0], M[2][1], P);
      return MC('Divergence', md`$\mathbf F = ${fieldTeX(M)}$. At $(${P.join(', ')})$, $\nabla\cdot\mathbf F = $`, `$${d}$`,
        [[`$${mis}$`, md`Each component goes with its **own** variable: $\partial_xF_x + \partial_yF_y + \partial_zF_z$.`], [`$${sum}$`, 'That adds the components; the divergence adds their derivatives.'], [`$${-d}$`, 'Sign slip: recheck each derivative.'], [`$${2 * d}$`, 'A power came down twice: recheck each derivative.']],
        md`$\partial_xF_x + \partial_yF_y + \partial_zF_z = (${dVal(M[0], 0, P)}) + (${dVal(M[1], 1, P)}) + (${dVal(M[2], 2, P)}) = ${d}$.`);
    },
    // one component of the curl at a point
    () => {
      let M, P, k, cval, i, j;
      do {
        M = [randMono(), randMono(), randMono()]; P = [ri(-2, 2), ri(-2, 2), ri(-2, 2)]; k = ri(0, 2);
        i = (k + 1) % 3; j = (k + 2) % 3;               // (curl F)_k = d_i F_j - d_j F_i
        cval = dVal(M[j], i, P) - dVal(M[i], j, P);
      } while (!cval);
      const plus = dVal(M[j], i, P) + dVal(M[i], j, P);
      return MC('Curl', md`$\mathbf F = ${fieldTeX(M)}$. At $(${P.join(', ')})$, $(\nabla\times\mathbf F)_${VARS[k]} = $`, `$${cval}$`,
        [[`$${-cval}$`, md`Order: $(\nabla\times\mathbf F)_${VARS[k]} = \partial_${VARS[i]}F_${VARS[j]} - \partial_${VARS[j]}F_${VARS[i]}$ (cyclic $${VARS[k]} \to ${VARS[i]} \to ${VARS[j]}$).`], [`$${plus}$`, 'The curl takes a difference of the two cross derivatives, not a sum.'], [`$${dVal(M[k], k, P) + (cval === dVal(M[k], k, P) ? 1 : 0)}$`, md`The $${VARS[k]}$ component of the curl does not involve $F_${VARS[k]}$ at all.`], [`$${2 * cval}$`, 'Recheck each derivative.']],
        md`$\partial_${VARS[i]}F_${VARS[j]} - \partial_${VARS[j]}F_${VARS[i]} = (${dVal(M[j], i, P)}) - (${dVal(M[i], j, P)}) = ${cval}$.`);
    },
    // curl of a plane wave
    () => {
      const a = pick(AX), b = pick(AX.filter((x) => x !== a)), s = pick([1, -1]), sb = pick([1, -1]);
      const [k, sk] = cx(a, 1, b, 1), sg = s * sb * sk;
      const arg = `\\omega t ${s > 0 ? '-' : '+'} \\beta ${a}`;
      const T = (g, fn, dir) => `$${g < 0 ? '-' : ''}\\beta E_0\\${fn}(${arg})\\,\\hat ${dir}$`;
      return MC('Curl of a wave', md`$\mathbf E = ${sb < 0 ? '-' : ''}E_0\cos(${arg})\,\hat ${b}$. $\nabla\times\mathbf E = $`, T(sg, 'sin', k),
        [[T(-sg, 'sin', k), md`$\partial_${a}\cos(${arg}) = ${s > 0 ? '+' : '-'}\beta\sin(${arg})$, and $\hat ${a}\times\hat ${b} = ${sk > 0 ? '' : '-'}\hat ${k}$. Recount the signs.`], [T(sg, 'sin', b), 'The curl is perpendicular to the field here, not along it.'], [T(sg, 'sin', a), md`The curl of a field that varies along $${a}$ has no $${a}$-component: $\hat ${a}\times\partial\mathbf E/\partial ${a}$.`], [T(sg, 'cos', k), md`Differentiating $\cos$ gives $\sin$.`]],
        md`$\nabla\times\mathbf E = \hat ${a}\times\dfrac{\partial\mathbf E}{\partial ${a}} = \hat ${a}\times\left(${sb * s < 0 ? '-' : ''}\beta E_0\sin(${arg})\,\hat ${b}\right)$, and $\hat ${a}\times\hat ${b} = ${sk > 0 ? '' : '-'}\hat ${k}$.`);
    },
    // can it be a B field / an electrostatic E?
    () => {
      const isB = pick([true, false]);
      const pool = [
        [md`y\,\hat x + x\,\hat y`, 0, 0], [md`x\,\hat x - y\,\hat y`, 0, 0], [md`y\,\hat x - x\,\hat y`, 0, -2], [md`x\,\hat x + y\,\hat y`, 2, 0],
        [md`z\,\hat x`, 0, 1], [md`x\,\hat x`, 1, 0], [md`x^2\,\hat y`, 0, 1], [md`yz\,\hat x + xz\,\hat y + xy\,\hat z`, 0, 0], [md`x\,\hat y`, 0, 1], [md`z^2\,\hat z`, 1, 0],
      ];
      const ok = pool.filter((x) => (isB ? x[1] === 0 : x[2] === 0)), bad = pool.filter((x) => (isB ? x[1] !== 0 : x[2] !== 0));
      const r = pick(ok), w = U.shuffle(bad).slice(0, 4);
      return MC(isB ? 'Could it be B?' : 'Could it be electrostatic?', md`Which field could be ${isB ? 'a magnetic flux density $\\mathbf B$' : 'an **electrostatic** $\\mathbf E$'}?`, `$${r[0]}$`,
        w.map((x) => [`$${x[0]}$`, isB ? 'Its divergence is not zero; every B has ∇·B = 0.' : 'Its curl is not zero; an electrostatic field is a gradient, with zero curl.']),
        isB ? md`$\nabla\cdot(${r[0]}) = 0$: no magnetic sources needed.` : md`$\nabla\times(${r[0]}) = 0$: it can be written as $-\nabla V$.`);
    },
  ]);

  GENS.u0_h_from_e = () => {
    const a = pick(AX), b = pick(AX.filter((x) => x !== a)), s = pick([1, -1]), sb = pick([1, -1]);
    const er = pick([1, 2.25, 4, 9]), fM = pick([10, 30, 50, 100, 150, 300]);
    const [k, sk] = cx(a, 1, b, 1);
    const n = Math.sqrt(er), beta = 2 * Math.PI * fM * 1e6 * n / EM.c, eta = 120 * Math.PI / n;
    const arg = `\\omega t ${s > 0 ? '-' : '+'} \\beta ${a}`;
    const dirs = [[k, 1], [k, -1], [b, 1], [b, -1]];
    const mcDir = (sg) => ({
      mc: dirs.map(([d, g]) => $u(d, g)), a: sg > 0 ? 0 : 1,
      why: dirs.map(([d, g], i) => (i === (sg > 0 ? 0 : 1) ? null : d === b ? 'In a plane wave E and H are perpendicular.' : 'The sign is off: recheck ∂/∂' + a + ' and the order in the cross product, or check with E × H along the travel direction.')),
    });
    if (pick([true, false])) {
      const E0 = pick([1, 2, 5, 10, 30]), H0 = E0 / eta, sg = s * sb * sk;     // H = (s E0'/eta)(a x b) cos
      return {
        title: 'H from E with Faraday\'s law',
        q: md`In a lossless medium with $\mu = \mu_0$ and $\epsilon = ${er === 1 ? '' : er}\epsilon_0$, $\mathbf E = ${sb < 0 ? '-' : ''}${E0 === 1 ? '' : E0}\cos(${arg})\,\hat ${b}$ V/m with $f = ${fM}$ MHz. Use $\nabla\times\mathbf E = -\mu\,\partial\mathbf H/\partial t$ to find $\beta$ and $\mathbf H = H_0\cos(${arg})\,\hat h$ (with $H_0 > 0$).`,
        parts: [N('\\beta', beta, 'rad/m'), N('H_0', H0, 'A/m'), Object.assign({ lbl: 'The unit vector $\\hat h$ is' }, mcDir(sg))],
        hints: [md`$\beta = \omega\sqrt{\mu\epsilon} = 2\pi f\sqrt{\epsilon_r}/c$. The field depends only on $${a}$, so $\nabla\times\mathbf E = \hat ${a}\times\partial\mathbf E/\partial ${a}$.`, md`Anti-differentiate $\partial\mathbf H/\partial t$ in $t$ and drop the static part; the amplitude comes out as $E_0/\eta$ with $\eta = 120\pi/\sqrt{\epsilon_r}\ \Omega$.`],
        sol: sol({
          eq: md`$\nabla\times\mathbf E = \hat ${a}\times\dfrac{\partial\mathbf E}{\partial ${a}} = -\mu_0\dfrac{\partial\mathbf H}{\partial t}$; $\;\beta = \omega\sqrt{\mu_0\epsilon}$, $\;\eta = \sqrt{\mu_0/\epsilon}$.`,
          sym: md`$\dfrac{\partial\mathbf E}{\partial ${a}} = ${sb * s < 0 ? '-' : ''}\beta E_0\sin(${arg})\,\hat ${b}$, so $\nabla\times\mathbf E = ${sg < 0 ? '-' : ''}\beta E_0\sin(${arg})\,\hat ${k}$. Then $\dfrac{\partial\mathbf H}{\partial t} = ${sg < 0 ? '' : '-'}\dfrac{\beta E_0}{\mu_0}\sin(${arg})\,\hat ${k}$, and anti-differentiating in $t$: $\;\mathbf H = ${sg < 0 ? '-' : ''}\dfrac{\beta E_0}{\mu_0\omega}\cos(${arg})\,\hat ${k} = ${sg < 0 ? '-' : ''}\dfrac{E_0}{\eta}\cos(${arg})\,\hat ${k}$.`,
          sub: md`$$\beta = \frac{2\pi(${fM}\times10^6\,\text{s}^{-1})\sqrt{${er}}}{3\times10^8\,\text{m/s}} = ${f(beta)}\ \text{rad/m}, \qquad \eta = \frac{120\pi}{\sqrt{${er}}} = ${f(eta)}\ \Omega, \qquad H_0 = \frac{${E0}\ \text{V/m}}{${f(eta)}\ \Omega} = ${f(H0)}\ \text{A/m}$$`,
          ans: md`$\beta = ${f(beta)}$ rad/m; $\;\mathbf H = ${f(H0)}\cos(${arg})\,(${uv(k, sg)})$ A/m.`,
          check: md`The wave travels toward $${s > 0 ? '+' : '-'}${a}$ (${s > 0 ? 'opposite' : 'same'} signs on $t$ and $${a}$). $\mathbf E\times\mathbf H \propto ${uv(b, sb)}\times${uv(k, sg)} = ${uv(...cx(b, sb, k, sg))}$. ✓`,
        }),
      };
    }
    const H0 = pick([0.01, 0.02, 0.05, 0.1, 0.5]), E0 = eta * H0, sg = -s * sb * sk;  // E = -s eta H0'(a x b) cos
    return {
      title: 'E from H with Ampère\'s law',
      q: md`In a lossless medium ($\sigma = 0$) with $\mu = \mu_0$ and $\epsilon = ${er === 1 ? '' : er}\epsilon_0$, $\mathbf H = ${sb < 0 ? '-' : ''}${H0}\cos(${arg})\,\hat ${b}$ A/m with $f = ${fM}$ MHz. Use $\nabla\times\mathbf H = \epsilon\,\partial\mathbf E/\partial t$ to find $\beta$ and $\mathbf E = E_0\cos(${arg})\,\hat e$ (with $E_0 > 0$).`,
      parts: [N('\\beta', beta, 'rad/m'), N('E_0', E0, 'V/m'), Object.assign({ lbl: 'The unit vector $\\hat e$ is' }, mcDir(sg))],
      hints: [md`$\nabla\times\mathbf H = \hat ${a}\times\partial\mathbf H/\partial ${a}$.`, md`Anti-differentiate $\partial\mathbf E/\partial t$ in $t$; the amplitude is $\eta H_0$ with $\eta = 120\pi/\sqrt{\epsilon_r}\ \Omega$.`],
      sol: sol({
        eq: md`$\nabla\times\mathbf H = \hat ${a}\times\dfrac{\partial\mathbf H}{\partial ${a}} = \epsilon\dfrac{\partial\mathbf E}{\partial t}$; $\;\beta = \omega\sqrt{\mu_0\epsilon}$, $\;\eta = \sqrt{\mu_0/\epsilon}$.`,
        sym: md`$\dfrac{\partial\mathbf H}{\partial ${a}} = ${sb * s < 0 ? '-' : ''}\beta H_0\sin(${arg})\,\hat ${b}$, so $\nabla\times\mathbf H = ${-sg < 0 ? '-' : ''}\beta H_0\sin(${arg})\,\hat ${k}$. Then $\dfrac{\partial\mathbf E}{\partial t} = ${-sg < 0 ? '-' : ''}\dfrac{\beta H_0}{\epsilon}\sin(${arg})\,\hat ${k}$, and anti-differentiating in $t$: $\;\mathbf E = ${sg < 0 ? '-' : ''}\dfrac{\beta H_0}{\epsilon\omega}\cos(${arg})\,\hat ${k} = ${sg < 0 ? '-' : ''}\eta H_0\cos(${arg})\,\hat ${k}$.`,
        sub: md`$$\beta = \frac{2\pi(${fM}\times10^6\,\text{s}^{-1})\sqrt{${er}}}{3\times10^8\,\text{m/s}} = ${f(beta)}\ \text{rad/m}, \qquad \eta = \frac{120\pi}{\sqrt{${er}}} = ${f(eta)}\ \Omega, \qquad E_0 = (${f(eta)}\ \Omega)(${H0}\ \text{A/m}) = ${f(E0)}\ \text{V/m}$$`,
        ans: md`$\beta = ${f(beta)}$ rad/m; $\;\mathbf E = ${f(E0)}\cos(${arg})\,(${uv(k, sg)})$ V/m.`,
        check: md`The wave travels toward $${s > 0 ? '+' : '-'}${a}$. $\mathbf E\times\mathbf H \propto ${uv(k, sg)}\times${uv(b, sb)} = ${uv(...cx(k, sg, b, sb))}$. ✓`,
      }),
    };
  };

  // ---------------------------------------------------------------- C: cylindrical coordinates
  // c * S * r^p * a^s as TeX (c an integer): cylMono(3, 'H_0', 1, -2) -> \dfrac{3H_0r}{a^{2}}
  function cylMono(c, S, pr, s) {
    if (!c) return '0';
    const pw = (v, e) => (e === 1 ? v : `${v}^{${e}}`);
    const num = [S], den = [];
    if (pr > 0) num.push(pw('r', pr)); if (pr < 0) den.push(pw('r', -pr));
    if (s > 0) num.push(pw('a', s)); if (s < 0) den.push(pw('a', -s));
    const co = Math.abs(c) === 1 ? '' : String(Math.abs(c)), sg = c < 0 ? '-' : '';
    return den.length ? `${sg}\\dfrac{${co}${num.join('')}}{${den.join('')}}` : `${sg}${co}${num.join('')}`;
  }
  // the same as an answer-box expression: cylExpr(3, 'H0', 1, -2) -> 3*H0*r/(a^2)
  function cylExpr(c, S, pr, s) {
    const pw = (v, e) => (e === 1 ? v : `${v}^${e}`);
    const num = [...(c === 1 ? [] : [String(c)]), S], den = [];
    if (pr > 0) num.push(pw('r', pr)); if (pr < 0) den.push(pw('r', -pr));
    if (s > 0) num.push(pw('a', s)); if (s < 0) den.push(pw('a', -s));
    return num.join('*') + (den.length ? `/(${den.join('*')})` : '');
  }

  GENS.rf_u0_cyl = () => one([
    // H_phi = H0 (r/a)^n  ->  J_z = (n + 1) H0 r^(n-1) / a^n
    () => {
      const n = pick([0, 1, 2, 3]);
      const o = (t, dir = '\\hat z') => (t === '0' ? '$0$' : `$${t}\\,${dir}$`);
      const J = cylMono(n + 1, 'H_0', n - 1, -n);
      const half = n === 1 ? md`That is one of the two equal terms, $\partial H_\phi/\partial r$ or $H_\phi/r$; the curl is their sum.` : null;
      return MC('Curl of a round H', md`$\mathbf H = ${cylMono(1, 'H_0', n, -n)}\,\hat\phi$ (cylindrical). $\nabla\times\mathbf H = $`, o(J),
        [[o(cylMono(n, 'H_0', n - 1, -n)), half || md`That is $\partial H_\phi/\partial r$ alone. Differentiate $rH_\phi$, then divide by $r$.`],
          [o(cylMono(1, 'H_0', n - 1, -n)), half || md`That is $H_\phi/r$ alone, the other half of the product rule.`],
          [o(J, '\\hat\\phi'), md`A $\hat\phi$ field that depends on $r$ curls about the axis: its curl points along $\hat z$.`],
          [o(cylMono(n + 1, 'H_0', n, -n)), md`That is $\frac{d}{dr}(rH_\phi)$; divide by $r$.`]],
        md`$rH_\phi = ${cylMono(1, 'H_0', n + 1, -n)}$, $\;\dfrac{d}{dr}(rH_\phi) = ${cylMono(n + 1, 'H_0', n, -n)}$, divide by $r$: $\;${J}\,\hat z$.`);
    },
    // H_z(r) z-hat  ->  J_phi = -dH_z/dr
    () => {
      const n = pick([1, 2, 3]), dec = pick([true, false]);
      const rn = n === 1 ? '\\dfrac{r}{a}' : `\\dfrac{r^{${n}}}{a^{${n}}}`;
      const sg = dec ? 1 : -1;                              // J_phi = -dH_z/dr = sg * n H0 r^(n-1)/a^n
      const mag = cylMono(n, 'H_0', n - 1, -n);
      const T = (s, dir) => `$${s < 0 ? '-' : ''}${mag}\\,${dir}$`;
      const wr = [[T(-sg, '\\hat\\phi'), md`The $\hat\phi$ part of the curl is $\partial F_r/\partial z - \partial F_z/\partial r$: the minus sign sits on $\partial_rH_z$.`],
        [T(sg, '\\hat z'), md`A $\hat z$ field that varies with $r$ has its curl along $\hat\phi$: the current circles the axis.`],
        ['$0$', md`$H_z$ changes with $r$, and $-\partial_rF_z$ is in the $\hat\phi$ part of the curl.`]];
      if (!dec) wr.push([`$-${cylMono(n + 1, 'H_0', n - 1, -n)}\\,\\hat\\phi$`, md`That applies $\frac1r\frac{d}{dr}(r\,\cdot)$, which belongs to $F_\phi$ in the $\hat z$ part; $H_z$ enters as $-\partial_rH_z$.`]);
      return MC('Curl of a solenoid-like H', md`$\mathbf H = ${dec ? `H_0\\left(1 - ${rn}\\right)` : cylMono(1, 'H_0', n, -n)}\,\hat z$ for $r < a$. $\nabla\times\mathbf H = $`, T(sg, '\\hat\\phi'), wr,
        md`$\nabla\times\mathbf H = -\hat\phi\,\dfrac{dH_z}{dr}$ with $\dfrac{dH_z}{dr} = ${dec ? '-' : ''}${mag}$. ${dec ? '$H_z$ falls outward, so the current circles counterclockwise from $+z$, along $+\\hat\\phi$.' : '$H_z$ grows outward, so the current runs along $-\\hat\\phi$.'}`);
    },
    // E_r(r) r-hat  ->  rho
    () => {
      const n = pick([1, 2, 3]);
      const o = (c, S, pr) => `$${cylMono(c, S, pr, -n)}$`;
      return MC('Charge from a round E', md`In free space, $\mathbf E = ${cylMono(1, 'E_0', n, -n)}\,\hat r$ inside a long charged cylinder. $\rho = $`, o(n + 1, '\\epsilon_0E_0', n - 1),
        [[o(n, '\\epsilon_0E_0', n - 1), md`That is $\epsilon_0\,\partial E_r/\partial r$ alone. Differentiate $rE_r$, then divide by $r$.`],
          [o(n + 1, 'E_0', n - 1), md`That is $\nabla\cdot\mathbf E$. Gauss's law gives $\rho = \epsilon_0\nabla\cdot\mathbf E$.`],
          [o(n + 2, '\\epsilon_0E_0', n - 1), md`That is the spherical divergence, $\frac{1}{r^2}\partial_r(r^2E_r)$. Here $r$ is the distance from an axis: $\frac1r\partial_r(rE_r)$.`],
          [o(n + 1, '\\epsilon_0E_0', n), md`That is $\epsilon_0\frac{d}{dr}(rE_r)$; divide by $r$.`]],
        md`$\rho = \dfrac{\epsilon_0}{r}\dfrac{d}{dr}\left(${cylMono(1, 'E_0', n + 1, -n)}\right) = ${cylMono(n + 1, '\\epsilon_0E_0', n - 1, -n)}$.`);
    },
    // a number: H_phi = k r^n A/m
    () => {
      const n = pick([2, 3]), k = pick([2, 3, 4, 6, 10]), r0 = pick([0.5, 2]);
      const J = (n + 1) * k * r0 ** (n - 1);
      const o = (x) => `$${p(x)}$ A/m²`;
      return MC('A curl at a point', md`$\mathbf H = ${k}r^{${n}}\,\hat\phi$ A/m, with $r$ in meters. $J_z$ at $r = ${r0}$ m is…`, o(J),
        [[o(n * k * r0 ** (n - 1)), md`That is $\partial H_\phi/\partial r$ alone; add $H_\phi/r$.`],
          [o(k * r0 ** (n - 1)), md`That is $H_\phi/r$ alone; add $\partial H_\phi/\partial r$.`],
          [o((n + 1) * k * r0 ** n), md`That is $\frac{d}{dr}(rH_\phi)$ before dividing by $r$.`],
          [o(k * r0 ** n), md`That is $H_\phi$ itself, in A/m; the curl is a derivative.`]],
        md`$\dfrac1r\dfrac{d}{dr}\big(${k}r^{${n + 1}}\big) = ${(n + 1) * k}${n === 2 ? 'r' : `r^{${n - 1}}`}$; at $r = ${r0}$ m: $${p(J)}$ A/m².`);
    },
    // which part survives
    () => {
      const [q, right, w, s] = pick([
        [md`$\mathbf H = H_\phi(r)\,\hat\phi$ (any profile). The current density it implies points along…`, md`$\pm\hat z$ only`,
          [[md`$\pm\hat\phi$`, md`The curl of a $\hat\phi$ field that depends on $r$ has only a $\hat z$ part, $\frac1r\frac{d}{dr}(rH_\phi)$.`], [md`$\pm\hat r$`, md`The $\hat r$ part needs an $F_z$ or a $z$-dependence.`], [md`nowhere: $\mathbf J = 0$ for any $H_\phi(r)$`, md`Only $H_\phi\propto1/r$ has zero curl.`]],
          md`A wire's current runs along its axis; its $\mathbf H$ circles it.`],
        [md`$\mathbf H = H_z(r)\,\hat z$ (any profile). The current density it implies points along…`, md`$\pm\hat\phi$ only`,
          [[md`$\pm\hat z$`, md`The $\hat z$ part of the curl uses $F_\phi$ and $F_r$, which are zero.`], [md`$\pm\hat r$`, md`The $\hat r$ part, $\frac1r\partial_\phi F_z$, is zero: $H_z$ does not depend on $\phi$.`], [md`nowhere: $\mathbf J = 0$ for any $H_z(r)$`, md`Only a constant $H_z$ has zero curl.`]],
          md`$\nabla\times\mathbf H = -\hat\phi\,dH_z/dr$: a solenoid's current circles its axis.`],
        [md`$\mathbf E = E_r(r)\,\hat r$ (any profile). $\nabla\times\mathbf E = $`, md`$0$, for any $E_r(r)$`,
          [[md`$\hat z\,\frac1r\frac{d(rE_r)}{dr}$`, md`That is the divergence with a $\hat z$ attached; the $\hat z$ part of the curl uses $F_\phi$ and $\partial_\phi F_r$.`], [md`$-\hat\phi\,\frac{dE_r}{dr}$`, md`The $\hat\phi$ part is $\partial_zF_r - \partial_rF_z$: it has $\partial_zF_r$, not $\partial_rF_r$.`], [md`$0$ only if $E_r\propto1/r$`, md`$1/r$ is the zero-**divergence** profile. The curl of $E_r(r)\,\hat r$ is always zero.`]],
          md`$F_r$ enters the curl only through $\partial_zF_r$ and $\partial_\phi F_r$, both zero. So a charged cylinder's field can be electrostatic.`],
        [md`$\mathbf E = E_r(r)\,\hat r$ in a charge-free region, between the conductors of a coax. Then $E_r\propto$`, md`$1/r$`,
          [[md`$1/r^2$`, md`That is a point charge, with the spherical $r$. Here $\frac1r\frac{d}{dr}(rE_r) = 0$ needs $rE_r$ constant.`], ['$r$', 'That is inside a uniformly charged cylinder, where $\\rho \\ne 0$.'], ['a constant', md`$\frac1r\frac{d}{dr}(rE_0) = E_0/r \ne 0$.`]],
          md`$\rho = \frac{\epsilon}{r}\frac{d}{dr}(rE_r) = 0$ means $rE_r$ is constant: $E_r = \lambda/2\pi\epsilon r$.`],
      ]);
      return MC('What survives', q, right, w, s);
    },
  ]);

  // J or rho from a given round field, and the total from the integral law
  GENS.u0_cyl = () => {
    const kind = pick(['wire', 'wire', 'charge', 'sol']), n = pick([1, 2, 3]), f1 = pick([0.25, 0.5, 0.8]);
    const pf = n === 1 ? '' : n === 2 ? `\\,(${f1})` : `\\,(${f1})^{${n - 1}}`;     // (r1/a)^(n-1)
    const rn = n === 1 ? '\\dfrac{r}{a}' : `\\dfrac{r^{${n}}}{a^{${n}}}`;
    const VR = { H0: [0.5, 3], E0: [1, 10], eps0: [0.5, 2], a: [0.5, 2], r: [0.2, 1.5] };
    const vars = (...k) => Object.fromEntries(k.map((x) => [x, VR[x]]));
    if (kind === 'wire') {
      const amm = pick([1, 2, 4, 5]), a = amm / 1000, H0 = pick([10, 20, 40, 50, 100]);
      const r1 = f1 * a, J1 = (n + 1) * H0 / a * f1 ** (n - 1), I = 2 * Math.PI * a * H0;
      const Jt = cylMono(n + 1, 'H_0', n - 1, -n);
      return {
        title: 'J from the H of a wire',
        q: md`A long conductor of radius $a = ${amm}$ mm lies on the $z$-axis. Its static field is $\mathbf H = H_\phi(r)\,\hat\phi$ with $H_\phi = ${cylMono(1, 'H_0', n, -n)}$ for $r < a$ and $H_\phi = \dfrac{H_0a}{r}$ for $r > a$, where $H_0 = ${H0}$ A/m. Use $\nabla\times\mathbf H = \mathbf J$ to find $J_z(r)$ inside, its value at $r = ${p(r1 * 1000)}$ mm, and $\mathbf J$ outside. Then find the total current $I$ from Ampère's law.`,
        parts: [
          { lbl: '$J_z(r)$ for $r < a$, in A/m²', expr: cylExpr(n + 1, 'H0', n - 1, -n), vars: vars('H0', 'a', 'r') },
          N(`J_z(${p(r1 * 1000)}\\ \\text{mm})`, J1, 'A/m^2'),
          { lbl: 'For $r > a$, $\\mathbf J$ is', mc: ['zero', '$-H_0a/r^2$ along $\\hat z$', '$+H_0a/r^2$ along $\\hat z$'], a: 0, fixed: true, why: [null, 'That is $\\partial H_\\phi/\\partial r$ alone. $rH_\\phi = H_0a$ is constant, so the curl is zero.', 'That is $H_\\phi/r$ alone. The full curl, $\\partial_rH_\\phi + H_\\phi/r$, is zero.'] },
          N('I', I, 'A'),
        ],
        hints: ['Only the $\\hat z$ part of the curl survives: $J_z = \\dfrac1r\\dfrac{d}{dr}(rH_\\phi)$. Multiply by $r$ first, then differentiate, then divide by $r$.', 'Ampère on a circle outside: $2\\pi rH_\\phi = I$. It must equal $\\int_0^aJ_z\\,2\\pi r\\,dr$.'],
        sol: sol({
          eq: md`Static Ampère in point form, $\nabla\times\mathbf H = \mathbf J$; for $\mathbf H = H_\phi(r)\hat\phi$ only $J_z = \dfrac1r\dfrac{d}{dr}(rH_\phi)$ survives. Integral form on a circle of radius $r$: $2\pi rH_\phi = I_{\text{enc}}$.`,
          sym: md`Inside: $rH_\phi = ${cylMono(1, 'H_0', n + 1, -n)}$, so $J_z = \dfrac1r\cdot${cylMono(n + 1, 'H_0', n, -n)} = ${Jt}$. Outside: $rH_\phi = H_0a$ is constant, so $\mathbf J = 0$. Ampère at $r > a$: $I = 2\pi r\cdot\dfrac{H_0a}{r} = 2\pi aH_0$. Check: $\displaystyle\int_0^a${Jt}\,2\pi r\,dr = 2\pi aH_0$. ✓`,
          sub: md`$$J_z(${p(r1 * 1000)}\ \text{mm}) = ${n + 1}\,\frac{${H0}\ \text{A/m}}{${p(a)}\ \text{m}}${pf} = ${f(J1)}\ \text{A/m}^2, \qquad I = 2\pi(${p(a)}\ \text{m})(${H0}\ \text{A/m}) = ${f(I)}\ \text{A}$$`,
          ans: md`$J_z = ${Jt}$ for $r < a$ (${n === 1 ? 'uniform' : 'growing outward'}); $J_z = ${f(J1)}$ A/m² at $${p(r1 * 1000)}$ mm; $\mathbf J = 0$ for $r > a$; $I = ${f(I)}$ A along $+\hat z$.`,
          check: md`$H_\phi > 0$ circles counterclockwise from $+z$, so by the RHR the current runs along $+\hat z$: $J_z > 0$. ✓ The curl and Ampère give the same $I$. ✓ Units: (A/m)/m = A/m². ✓`,
        }),
      };
    }
    if (kind === 'charge') {
      const acm = pick([1, 2, 5]), a = acm / 100, E0 = pick([100, 200, 500, 1000, 2000]);
      const r1 = f1 * a, rho1 = (n + 1) * EM.eps0 * E0 / a * f1 ** (n - 1), lam = 2 * Math.PI * a * EM.eps0 * E0;
      const Rt = cylMono(n + 1, '\\epsilon_0E_0', n - 1, -n);
      return {
        title: 'ρ from the E of a charged cylinder',
        q: md`A long cylinder of charge, radius $a = ${acm}$ cm, lies on the $z$-axis in free space. Its field is $\mathbf E = E_r(r)\,\hat r$ with $E_r = ${cylMono(1, 'E_0', n, -n)}$ for $r < a$ and $E_r = \dfrac{E_0a}{r}$ for $r > a$, where $E_0 = ${E0}$ V/m. Use $\nabla\cdot\mathbf D = \rho$ to find $\rho(r)$ inside, its value at $r = ${p(r1 * 100)}$ cm, and $\rho$ outside. Then find the charge per unit length $\lambda$ from Gauss's law.`,
        parts: [
          { lbl: '$\\rho(r)$ for $r < a$, in C/m³', expr: cylExpr(n + 1, 'eps0*E0', n - 1, -n), vars: vars('eps0', 'E0', 'a', 'r') },
          N(`\\rho(${p(r1 * 100)}\\ \\text{cm})`, rho1, 'C/m^3'),
          { lbl: 'For $r > a$, $\\rho$ is', mc: ['zero', '$-\\epsilon_0E_0a/r^2$', '$+\\epsilon_0E_0a/r^2$'], a: 0, fixed: true, why: [null, 'That is $\\epsilon_0\\,\\partial E_r/\\partial r$ alone. $rE_r = E_0a$ is constant, so the divergence is zero.', 'That is $\\epsilon_0E_r/r$ alone. The full divergence, $\\partial_rE_r + E_r/r$, is zero.'] },
          N('\\lambda', lam, 'C/m'),
        ],
        hints: ['Only the $r$ term of the divergence survives: $\\rho = \\dfrac{\\epsilon_0}{r}\\dfrac{d}{dr}(rE_r)$.', 'Gauss on a coaxial cylinder of length $\\ell$ outside: $\\epsilon_0E_r\\,2\\pi r\\ell = \\lambda\\ell$. It must equal $\\int_0^a\\rho\\,2\\pi r\\,dr$.'],
        sol: sol({
          eq: md`Gauss in point form, $\nabla\cdot\mathbf D = \rho$ with $\mathbf D = \epsilon_0\mathbf E$; for $\mathbf E = E_r(r)\hat r$ only $\rho = \dfrac{\epsilon_0}{r}\dfrac{d}{dr}(rE_r)$ survives. Integral form on a coaxial cylinder of radius $r$, length $\ell$: $\epsilon_0E_r\,2\pi r\ell = \lambda_{\text{enc}}\ell$.`,
          sym: md`Inside: $rE_r = ${cylMono(1, 'E_0', n + 1, -n)}$, so $\rho = \dfrac{\epsilon_0}{r}\cdot${cylMono(n + 1, 'E_0', n, -n)} = ${Rt}$. Outside: $rE_r = E_0a$ is constant, so $\rho = 0$. Gauss at $r > a$: $\lambda = 2\pi r\epsilon_0\dfrac{E_0a}{r} = 2\pi a\epsilon_0E_0$. Check: $\displaystyle\int_0^a${Rt}\,2\pi r\,dr = 2\pi a\epsilon_0E_0$. ✓`,
          sub: md`$$\rho(${p(r1 * 100)}\ \text{cm}) = ${n + 1}\,\frac{(8.854\times10^{-12}\ \text{F/m})(${E0}\ \text{V/m})}{${p(a)}\ \text{m}}${pf} = ${f(rho1)}\ \text{C/m}^3$$ $$\lambda = 2\pi(${p(a)}\ \text{m})(8.854\times10^{-12}\ \text{F/m})(${E0}\ \text{V/m}) = ${f(lam)}\ \text{C/m}$$`,
          ans: md`$\rho = ${Rt}$ for $r < a$; $\rho = ${f(rho1)}$ C/m³ at $${p(r1 * 100)}$ cm; $\rho = 0$ outside; $\lambda = ${f(lam)}$ C/m.`,
          check: md`$\mathbf E$ points outward, so the charge is positive. ✓ Units: (F/m)(V/m)/m = C/m³. ✓ ${n === 1 ? 'A linear $E_r$ means a uniform $\\rho$, the formula sheet\'s cylinder.' : 'A steeper $E_r$ means charge piled toward the surface.'}`,
        }),
      };
    }
    const acm = pick([1, 2, 5]), a = acm / 100, H0 = pick([100, 200, 500, 1000]);
    const r1 = f1 * a, J1 = n * H0 / a * f1 ** (n - 1);
    const Jt = cylMono(n, 'H_0', n - 1, -n);
    return {
      title: 'J from the H of a thick winding',
      q: md`A long, thick winding of radius $a = ${acm}$ cm on the $z$-axis makes the static field $\mathbf H = H_z(r)\,\hat z$ with $H_z = H_0\left(1 - ${rn}\right)$ for $r < a$ and $H_z = 0$ for $r > a$, where $H_0 = ${H0}$ A/m. Use $\nabla\times\mathbf H = \mathbf J$ to find $J_\phi(r)$ inside, its value at $r = ${p(r1 * 100)}$ cm, and its direction. Then find the current per meter of length, $\int_0^aJ_\phi\,dr$.`,
      parts: [
        { lbl: '$J_\\phi(r)$ for $r < a$, in A/m²', expr: cylExpr(n, 'H0', n - 1, -n), vars: vars('H0', 'a', 'r') },
        N(`J_\\phi(${p(r1 * 100)}\\ \\text{cm})`, J1, 'A/m^2'),
        { lbl: 'Seen from $+z$, the current circulates', mc: ['counterclockwise ($+\\hat\\phi$)', 'clockwise ($-\\hat\\phi$)'], a: 0, fixed: true, why: [null, '$J_\\phi = -dH_z/dr$, and $H_z$ falls outward, so $J_\\phi > 0$. Check: counterclockwise current makes $\\mathbf H$ along $+\\hat z$ inside (RHR).'] },
        N('\\int_0^aJ_\\phi\\,dr', H0, 'A/m'),
      ],
      hints: ['For $\\mathbf H = H_z(r)\\hat z$ only the $\\hat\\phi$ part of the curl survives: $J_\\phi = -dH_z/dr$.', 'Integrate $J_\\phi$ from $0$ to $a$. Ampère on a rectangle with one long side on the axis and one outside gives the same.'],
      sol: sol({
        eq: md`$\nabla\times\mathbf H = \mathbf J$; for $\mathbf H = H_z(r)\hat z$ only $J_\phi = -\dfrac{dH_z}{dr}$ survives. Integral form on a rectangle of length $\ell$ in a plane through the axis, one long side on the axis and one outside: $H_z(0)\,\ell = \ell\displaystyle\int_0^aJ_\phi\,dr$.`,
        sym: md`$\dfrac{dH_z}{dr} = -${Jt}$, so $J_\phi = ${Jt}$ for $r < a$, along $+\hat\phi$; $\mathbf J = 0$ outside. Per meter of length: $\displaystyle\int_0^a${Jt}\,dr = H_0\left[${n === 1 ? 'r/a' : `r^{${n}}/a^{${n}}`}\right]_0^a = H_0$, which is $H_z(0)$, as Ampère requires. ✓`,
        sub: md`$$J_\phi(${p(r1 * 100)}\ \text{cm}) = ${n === 1 ? '' : `${n}\\,`}\frac{${H0}\ \text{A/m}}{${p(a)}\ \text{m}}${pf} = ${f(J1)}\ \text{A/m}^2, \qquad \int_0^aJ_\phi\,dr = ${H0}\ \text{A/m}$$`,
        ans: md`$J_\phi = ${Jt}$; $${f(J1)}$ A/m² at $${p(r1 * 100)}$ cm, counterclockwise from $+z$; $\int_0^aJ_\phi\,dr = ${H0}$ A/m.`,
        check: md`RHR: current counterclockwise from $+z$ makes $\mathbf H$ along $+\hat z$ inside, as given. ✓ A rectangle with its inner side at radius $r$ encloses only the current outside $r$: $\int_r^aJ_\phi\,dr' = H_0\left(1 - ${rn}\right) = H_z(r)$. ✓`,
      }),
    };
  };

  // ================================================================ generators: D
  const FUN = [['x^2', (x) => x * x], ['(2x + 1)', (x) => 2 * x + 1], ['\\cos(\\pi x)', (x) => Math.cos(Math.PI * x)], ['x^3', (x) => x ** 3], ['(x - 1)^2', (x) => (x - 1) ** 2], ['e^{0}\\,x', (x) => x]];
  const tri = (x) => (Math.abs(x) <= 0.5 ? 1 - 2 * Math.abs(x) : 0);

  GENS.rf_u0_delta = () => one([
    // sifting
    () => {
      const [ft, fn] = pick(FUN.slice(0, 5)), a = pick([-2, -1, 1, 2, 3]), inside = pick([true, true, false]);
      const lo = inside ? a - pick([1, 2, 3]) : (a > 0 ? a + 1 : a - 4), hi = inside ? a + pick([1, 2, 4]) : (a > 0 ? a + 5 : a - 1);
      const v = inside ? n3(fn(a)) : 0;
      const sh = a > 0 ? `x - ${a}` : `x + ${-a}`;
      const o = (x) => `$${EM.p(n3(x))}$`;
      return MC('Sifting', md`$\displaystyle\int_{${lo}}^{${hi}}${ft}\;\delta(${sh})\,dx = $`, o(v),
        inside ? [[o(fn(0)), md`The spike is at $x = ${a}$, not at 0.`], [o(1), 'That is the area of the delta alone; it multiplies f.'], [o(0), md`$x = ${a}$ lies inside $${lo} < x < ${hi}$.`], [o(fn(-a)), md`$\delta(${sh})$ fires where $${sh} = 0$, at $x = ${a}$.`], [o(v + 1), md`Evaluate $f$ at the spike, $x = ${a}$, and nothing else.`], [o(fn(a) * (hi - lo)), 'The delta already integrates to 1; do not multiply by the length of the range.']]
          : [[o(fn(a)), md`The spike at $x = ${a}$ lies outside $${lo} < x < ${hi}$.`], [o(1), 'The spike is outside the range.'], [o(fn(lo)), 'A delta does not pick the endpoint; outside the range it contributes nothing.']],
        inside ? md`The spike at $x = ${a}$ is in range: $f(${a}) = ${EM.p(v)}$.` : md`The spike at $x = ${a}$ is outside the range: $0$.`);
    },
    // what shape
    () => {
      const c = pick([1, 2, 3, -1, -2]), K = pick([2, 3, 4, 5]);
      const sh = (v) => (c > 0 ? `${v} - ${c}` : `${v} + ${-c}`);
      const [q, right, wrongs] = pick([
        [md`$\mathbf J = ${K}\,\delta(${sh('y')})\,\hat x$ A/m²`, `a current sheet in the plane $y = ${c}$ m carrying $${K}$ A/m along $\\hat x$`, [[`a line current along the line $y = ${c}$`, 'One delta pins one coordinate: a plane.'], [`a current sheet in the plane $y = ${-c}$ m`, md`$\delta(${sh('y')})$ fires where $${sh('y')} = 0$.`], [`a current sheet in the plane $x = ${c}$ m`, md`The delta's argument involves $y$; the current direction $\hat x$ is a separate matter.`]]],
        [md`$\rho = ${K}\,\delta(x)\,\delta(${sh('y')})$ nC/m³`, `a line charge of $${K}$ nC/m parallel to $z$, through $(0, ${c})$`, [['two charge sheets', 'A product of deltas is nonzero only where both fire: their intersection.'], [`a point charge at $(0, ${c}, 0)$`, md`A point needs three deltas; $z$ is free.`], [`a line charge parallel to $z$ through $(0, ${-c})$`, md`$\delta(${sh('y')})$ fires at $y = ${c}$.`]]],
        [md`$\rho = ${K}\,\delta(x)\,\delta(y)\,\delta(${sh('z')})$ nC/m³`, `a point charge of $${K}$ nC at $(0, 0, ${c})$ m`, [[`a line charge on the $z$-axis`, 'Three deltas pin all three coordinates.'], [`a point charge at $(0, 0, ${-c})$ m`, md`$\delta(${sh('z')})$ fires at $z = ${c}$.`], [`a charge sheet on $z = ${c}$`, 'Three deltas pin all three coordinates.']]],
      ]);
      return MC('What shape?', md`${q} describes…`, right, wrongs, 'Count the deltas: one is a plane, two a line, three a point; each fires where its argument is zero.');
    },
    // units
    () => {
      const [q, right, wrongs] = pick([
        [md`$\rho_s\,\delta(z)$ with $\rho_s$ in C/m²`, 'C/m³', [['C/m²', md`$\delta(z)$ carries 1/m.`], ['C/m', 'δ(z) divides by length, it does not multiply.'], ['C', 'Only an integral over a volume gives coulombs.']]],
        [md`$I\,\delta(x)\,\delta(y)$ with $I$ in A`, 'A/m²', [['A', 'Each delta carries 1/m.'], ['A/m', 'Two deltas: 1/m², not 1/m.'], ['A·m²', 'Deltas divide by length.']]],
        [md`$J_s\,\delta(z)$ with $J_s$ in A/m`, 'A/m²', [['A/m', md`$\delta(z)$ carries 1/m.`], ['A', 'Deltas divide by length.'], ['A/m³', 'One delta adds one 1/m.']]],
        [md`$\delta(t - t_0)$ with $t$ in seconds`, '1/s', [['none', md`$\int\delta(t)\,dt = 1$ is dimensionless and $dt$ is in seconds.`], ['s', 'Upside down.'], ['1/m', 'The argument is a time.']]],
      ]);
      return MC('Units', md`The units of ${q} are…`, right, wrongs, 'A delta has the inverse units of its argument, so that its integral is a pure number.');
    },
    // integrate across a sheet or a line
    () => {
      const K = pick([2, 3, 5, 8]), L = pick([2, 3, 4]), inside = pick([true, false]), c = inside ? pick([0.25, 0.5, 0.75]) * L : L + pick([1, 2]);
      const cs = EM.p(c);
      const v = inside ? K * L : 0;
      return MC('Integrate across', md`$\mathbf J = ${K}\,\delta(x - ${cs})\,\hat z$ A/m². The current through the square $0 < x < ${L}$ m, $0 < y < ${L}$ m in the plane $z = 0$ (with $d\mathbf S = +\hat z$) is…`, `$${v}$ A`,
        inside ? [[`$${K}$ A`, md`The sheet crosses the square along a line of length $${L}$ m: $${K}$ A/m × $${L}$ m.`], [`$${K * L * L}$ A`, 'The delta removes one integral: current per meter times a length, not times the area.'], ['$0$ A', md`$x = ${cs}$ m is inside $0 < x < ${L}$.`]]
          : [[`$${K * L}$ A`, md`The sheet sits at $x = ${cs}$ m, outside $0 < x < ${L}$.`], [`$${K}$ A`, 'The sheet misses the square.'], [`$${K * L * L}$ A`, 'The sheet misses the square.']],
        inside ? md`$\int_0^{${L}}\!\!\int_0^{${L}}${K}\,\delta(x - ${cs})\,dx\,dy = ${K}\times${L} = ${v}$ A.` : md`The spike at $x = ${cs}$ m is outside the range: no current.`);
    },
  ]);

  GENS.rf_u0_pulse = () => one([
    // value of a triangle
    () => {
      const A = pick([1, 2, 3, 4, 5]), t0 = pick([0, 1, 2, 3]), tau = pick([2, 4, 6, 8]), fr = pick([0.125, 0.25, 0.375, 0.5, -0.25, -0.125, 0.75]);
      const t = t0 + fr * tau, v = A * tri(fr), wide = A * Math.max(0, 1 - Math.abs(fr)), noshift = A * tri(t / tau);
      const o = (x) => `$${EM.p(n3(x))}$`;
      return MC('Triangle', md`$g(t) = ${A === 1 ? '' : `${A}\\,`}\triangle\!\left(\dfrac{t ${t0 ? `- ${t0}` : ''}}{${tau}}\right)$ ($t$ in μs). $g(${EM.p(t)}) = $`, o(v),
        [[o(wide), md`That uses $1 - |t - t_0|/\tau$, a triangle of base $2\tau$. This course's triangle has total width $\tau$: $1 - 2|t - t_0|/\tau$.`], [o(A), md`The peak value $${A}$ is reached only at $t = ${t0}$.`], [o(noshift), md`Subtract the center $t_0 = ${t0}$ first.`], [o(A - v), 'That is how far it has dropped from the peak, not the value.'],
          [o(A * Math.max(0, 1 - 4 * Math.abs(fr))), md`That uses $1 - 4|t - t_0|/\tau$, a base of $\tau/2$. The base is $\tau$: it reaches zero at $t_0 \pm \tau/2$.`],
          [o(A * (1 - 2 * Math.abs(fr))), md`$1 - 2|t - t_0|/\tau$ holds only on the base, $|t - t_0| < \tau/2$; outside it the triangle is 0.`]],
        Math.abs(fr) > 0.5 ? md`$|t - t_0|/\tau = ${EM.p(Math.abs(fr))} > \tfrac12$: outside the base, so $g = 0$.`
          : md`$|t - t_0|/\tau = ${EM.p(Math.abs(fr))}$, so $g = ${A}\,(1 - 2\times${EM.p(Math.abs(fr))}) = ${EM.p(n3(v))}$.`);
    },
    // where a rect is on
    () => {
      const A = pick([1, 2, 5]), t0 = pick([1, 2, 3, 5]), tau = pick([2, 4, 6]);
      const I = (x0, x1) => `$${EM.p(x0)} < t < ${EM.p(x1)}$ μs`;
      return MC('Rectangle', md`$g(t) = ${A === 1 ? '' : `${A}\\,`}\text{rect}\!\left(\dfrac{t - ${t0}}{${tau}}\right)$ ($t$ in μs) is nonzero for…`, I(t0 - tau / 2, t0 + tau / 2),
        [[I(t0, t0 + tau), 'That starts the pulse at t₀; rect is centered on its argument = 0.'], [I(t0 - tau, t0 + tau), md`That has width $2\tau$; $\text{rect}(t/\tau)$ has width $\tau$.`], [I(-t0 - tau / 2, -t0 + tau / 2), md`$t - ${t0} = 0$ at $t = +${t0}$.`]],
        md`$|t - ${t0}| < ${tau}/2$: from $${EM.p(t0 - tau / 2)}$ to $${EM.p(t0 + tau / 2)}$ μs.`);
    },
    // steps
    () => {
      const A = pick([2, 3, 4]), B = pick([1, 2, 5]), t1 = pick([0, 1]), t2 = t1 + pick([2, 3]), t3 = t2 + pick([1, 2]);
      const tt = pick([t1 - 0.5, (t1 + t2) / 2, (t2 + t3) / 2, t3 + 1]);
      const val = (t) => A * ((t > t1) - (t > t2)) + B * (t > t3);
      const v = val(tt);
      const o = (x) => `$${x}$`;
      return MC('Steps', md`$g(t) = ${A}\big[u(t ${t1 ? `- ${t1}` : ''}) - u(t - ${t2})\big] + ${B}\,u(t - ${t3})$. $g(${EM.p(tt)}) = $`, o(v),
        [[o(v === A + B ? A : A + B), 'Each step switches on when its argument passes zero: check which have.'], [o(v === 0 ? A : 0), md`At $t = ${EM.p(tt)}$, check each of $t - ${t1}$, $t - ${t2}$, $t - ${t3}$ for its sign.`], [o(v === B ? A - B : B), 'The bracket is a rectangle from t₁ to t₂; the last step is on only after t₃.'], [o(-A), md`$u$ is 0 or 1; the minus sign in the bracket turns the rectangle off, it does not go negative.`]],
        md`$u(\cdot) = 1$ when its argument is positive. At $t = ${EM.p(tt)}$: the rectangle is ${tt > t1 && tt < t2 ? 'on' : 'off'}, the last step is ${tt > t3 ? 'on' : 'off'}: $g = ${v}$.`);
    },
    // areas
    () => {
      const A = pick([1, 2, 3, 4, 6]), tau = pick([2, 3, 4, 10]), isTri = pick([true, false]);
      const v = isTri ? A * tau / 2 : A * tau;
      const o = (x) => `$${EM.p(x)}$ V·μs`;
      return MC('Area', md`$g(t) = ${A}\,${isTri ? '\\triangle' : '\\text{rect}'}(t/\tau)$ V with $\tau = ${tau}\ \mu$s. $\displaystyle\int_{-\infty}^{\infty}g\,dt = $`, o(v),
        isTri ? [[o(A * tau), 'That is a rectangle of the same height and width.'], [o(A * tau / 4), md`The base is $\tau$ and the height $${A}$: half of base × height is $${A}\tau/2$.`], [o(A * tau * 2), 'A triangle has less area than its bounding rectangle.']]
          : [[o(A * tau / 2), 'That is a triangle.'], [o(A), 'Area is height times width.'], [o(2 * A * tau), md`$\text{rect}(t/\tau)$ has width $\tau$, not $2\tau$.`], [o(A + tau), 'Area multiplies height and width; it does not add them.']],
        isTri ? md`Base $\tau$, height $${A}$: $\tfrac12(${tau})(${A}) = ${EM.p(v)}$.` : md`Width $\tau$, height $${A}$: $${EM.p(v)}$.`);
    },
  ]);

  GENS.u0_delta_int = () => {
    if (pick([true, false])) {
      const L = pick([1, 2, 3]), I1 = pick([2, 5, 10]) * pick([1, -1]), K = pick([1, 2, 3, 4]) * pick([1, -1]), J0 = pick([1, 2, 5]);
      const pin = pick([true, false]), sin = pick([true, false]);
      const a = pin ? L / 2 : L + 1, b = pin ? L / 2 : 0.5 * L, c = sin ? L / 2 : L + 2;
      const parts = [pin ? I1 : 0, sin ? K * L : 0, J0 * L * L];
      let tot = parts[0] + parts[1] + parts[2];
      const J0u = tot === 0 ? J0 + 1 : J0;
      if (tot === 0) { parts[2] = J0u * L * L; tot = parts[0] + parts[1] + parts[2]; }
      const sh = (v, x) => (x ? `${v} - ${EM.p(x)}` : v);
      return {
        title: 'Current through a rectangle',
        q: md`$\mathbf J = \Big[${I1}\,\delta(${sh('x', a)})\,\delta(${sh('y', b)}) ${K < 0 ? '-' : '+'} ${Math.abs(K)}\,\delta(${sh('x', c)}) + ${J0u}\Big]\hat z$ A/m². Find the total current through the square $0 < x < ${L}$ m, $0 < y < ${L}$ m in the plane $z = 0$, with $d\mathbf S = +\hat z\,dx\,dy$.`,
        parts: [N('I', tot, 'A')],
        hints: ['Read each term: two deltas are a line current (A), one delta is a sheet (A/m), no delta is a uniform density (A/m²).', 'A line current counts if its point is inside the square; a sheet contributes (A/m) × (its length inside the square); the uniform part contributes J₀ × area.'],
        sol: sol({
          eq: md`$I = \int_S\mathbf J\cdot d\mathbf S = \int_0^{${L}}\!\!\int_0^{${L}}J_z\,dx\,dy$; each delta inside the range sifts, each outside gives 0.`,
          sym: md`Line current at $(${EM.p(a)}, ${EM.p(b)})$: ${pin ? 'inside' : 'outside'}, $${parts[0]}$ A. Sheet at $x = ${EM.p(c)}$: ${sin ? `inside, it crosses the square along $${L}$ m: $(${K})(${L}) = ${parts[1]}$ A` : 'outside, $0$ A'}. Uniform part: $(${J0u})(${L})^2 = ${parts[2]}$ A.`,
          sub: md`$$I = ${parts[0]} + (${parts[1]}) + ${parts[2]} = ${tot}\ \text{A}$$`,
          ans: md`$I = ${tot}$ A.`,
          check: 'Units: A + (A/m)(m) + (A/m²)(m²) = A for every term. ✓',
        }),
      };
    }
    const L = pick([1, 2, 4]), rs = pick([1, 2, 3, 5]), rl = pick([2, 4, 6]), r0 = pick([1, 2, 3]);
    const zin = pick([true, false]), lin = pick([true, false]);
    const z1 = zin ? L / 2 : L + 1, x1 = lin ? L / 4 : L / 2, y1 = lin ? L / 2 : -1;
    const q1 = zin ? rs * L * L : 0, q2 = lin ? rl * L : 0, q3 = r0 * L ** 3, Q = q1 + q2 + q3;
    return {
      title: 'Charge in a box',
      q: md`$\rho = ${rs}\,\delta(z - ${EM.p(z1)}) + ${rl}\,\delta(x - ${EM.p(x1)})\,\delta(y ${y1 < 0 ? `+ ${-y1}` : `- ${EM.p(y1)}`}) + ${r0}$, with the coefficients in nC/m², nC/m and nC/m³. Find the total charge in the cube $0 < x, y, z < ${L}$ m.`,
      parts: [N('Q', Q, 'nC')],
      hints: ['One delta: a sheet (nC/m²). Two deltas: a line (nC/m). No delta: a uniform density (nC/m³).', 'Inside the cube, a sheet contributes ρₛ × (area of its cut), a line ρₗ × (length inside), the uniform part ρ₀ × volume.'],
      sol: sol({
        eq: md`$Q = \int_V\rho\,dV$; each delta inside the range sifts, each outside gives 0.`,
        sym: md`Sheet $z = ${EM.p(z1)}$ m: ${zin ? `inside, a $${L}\\times${L}$ m cut: $(${rs})(${L * L}) = ${q1}$ nC` : 'outside, 0'}. Line through $(${EM.p(x1)}, ${EM.p(y1)})$ parallel to $z$: ${lin ? `inside, length $${L}$ m: $(${rl})(${L}) = ${q2}$ nC` : 'outside (y is out of range), 0'}. Uniform: $(${r0})(${L})^3 = ${q3}$ nC.`,
        sub: md`$$Q = ${q1} + ${q2} + ${q3} = ${Q}\ \text{nC}$$`,
        ans: md`$Q = ${Q}$ nC.`,
        check: 'Units: (nC/m²)(m²) + (nC/m)(m) + (nC/m³)(m³) = nC. ✓',
      }),
    };
  };

  // ================================================================ generators: E
  GENS.rf_u0_dir = () => one([
    // a function of (a t + b x)
    () => {
      const v = pick(AX);
      let a, b;
      do { a = pick([1, 2, 3, 4, 5, 10]) * pick([1, -1]); b = pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 2, 4]) * pick([1, -1]); } while (Math.abs(a) === Math.abs(b));
      const tFirst = pick([true, false]);
      const arg = tFirst ? `${term(a, 't', true)}${term(b, v, false)}` : `${term(b, v, true)}${term(a, 't', false)}`;
      const wrap = pick([(x) => `\\cos(${x})`, (x) => `u(${x})`, (x) => `e^{-(${x})^2}`, (x) => `(${x})^2`, (x) => `\\sin(${x})`]);
      const dir = -Math.sign(a) * Math.sign(b), sp = Math.abs(a / b), inv = Math.abs(b / a);
      const T = (d, s) => `toward $${sgnTxt(d)}${v}$ at $${EM.p(s)}$ m/s`;
      const ov = AX.find((x) => x !== v);
      return MC('Direction and speed', md`$E = ${wrap(arg)}$, with $t$ in s and $${v}$ in m, travels…`, T(dir, sp),
        [[T(-dir, sp), md`$t$ and $${v}$ have ${dir > 0 ? 'opposite' : 'the same'} signs inside: that means toward $${sgnTxt(dir)}${v}$.`], [T(dir, inv), md`Speed = (coefficient of $t$)/(coefficient of $${v}$) = $${Math.abs(a)}/${Math.abs(b)}$.`], [T(-dir, inv), md`Both off: ${dir > 0 ? 'opposite' : 'same'} signs mean $${sgnTxt(dir)}${v}$, and the speed is $${Math.abs(a)}/${Math.abs(b)}$.`], [`toward $${sgnTxt(dir)}${ov}$ at $${EM.p(sp)}$ m/s`, md`The coordinate in the argument is $${v}$.`]],
        md`A feature has constant argument: $${a}\,dt ${b > 0 ? '+' : '-'} ${Math.abs(b)}\,d${v} = 0$, so $d${v}/dt = ${EM.p(-a / b)}$ m/s.`);
    },
    // cos(w t -/+ beta z) with numbers
    () => {
      const w = pick([2, 3, 6]), bb = pick([1, 2, 3, 4, 6]), s = pick([1, -1]), v = pick(AX);
      const sp = w * 1e8 / bb;
      const T = (d, x) => `toward $${sgnTxt(d)}${v}$ at $${EM.p(x)}$ m/s`;
      return MC('Direction and speed', md`$E = \cos(${w}\times10^8\,t ${s > 0 ? '-' : '+'} ${bb}\,${v})$ V/m travels…`, T(s, sp),
        [[T(-s, sp), md`${s > 0 ? 'Opposite' : 'Same'} signs on $t$ and $${v}$: toward $${sgnTxt(s)}${v}$.`], [T(s, bb / (w * 1e8)), md`$v = \omega/\beta$, not $\beta/\omega$.`], [T(s, 3e8 === sp ? 1.5e8 : 3e8), md`The speed is set by this expression, $\omega/\beta$, not assumed to be $c$.`]],
        md`$v = \omega/\beta = ${w}\times10^8/${bb} = ${EM.p(sp)}$ m/s, toward $${sgnTxt(s)}${v}$.`);
    },
    // f(z - v t) forms
    () => {
      const v = pick(AX), sp = pick([50, 100, 200, 300, 1000]), s = pick([1, -1]);
      const fn = pick(['f', 'g', 'F']);
      const T = (d, x) => `toward $${sgnTxt(d)}${v}$ at $${EM.p(x)}$ m/s`;
      return MC('Direction and speed', md`$E = ${fn}(${v} ${s > 0 ? '-' : '+'} ${sp}t)$, with $t$ in s and $${v}$ in m, travels…`, T(s, sp),
        [[T(-s, sp), md`In $${v} ${s > 0 ? '-' : '+'} ${sp}t$ a feature stays where the argument is constant: $${v} = ${s > 0 ? '' : '-'}${sp}t + $ const.`], [T(s, 1 / sp), md`Here $${sp}$ multiplies $t$ directly; it is the speed.`], [T(-s, 1 / sp), 'Both the direction and the speed are off.']],
        md`$${v} ${s > 0 ? '-' : '+'} ${sp}t = $ const means $${v} = ${s > 0 ? '+' : '-'}${sp}t + $ const.`);
    },
  ]);

  GENS.rf_u0_shift = () => one([
    // arrival time of a peak
    () => {
      const v = pick([100, 200, 300]), t0 = pick([0, 1, 2, 5]), s = pick([1, -1]), z1 = s * v * pick([1, 2, 3, 4]);
      const ta = t0 + Math.abs(z1) / v;
      const o = (x) => `$t = ${EM.p(x)}\\ \\mu$s`;
      return MC('Arrival time', md`A pulse peaks at $z = 0$ at $t = ${t0}\ \mu$s and travels toward $${sgnTxt(s)}z$ at $${v}$ m/μs. A probe at $z = ${z1}$ m sees the peak at…`, o(ta),
        [[o(t0 - Math.abs(z1) / v), 'The probe is downstream: it sees the pulse later.'], [o(Math.abs(z1) / v), md`Add the departure time $${t0}\ \mu$s.`], [o(t0 + v / Math.abs(z1) + (t0 + v / Math.abs(z1) === ta ? 1 : 0)), 'Delay = distance/speed, not speed/distance.'], [o(t0 + Math.abs(z1) / 300), md`The speed here is $${v}$ m/μs, not $c$.`]],
        md`Delay $= |z_1|/v = ${Math.abs(z1)}/${v} = ${EM.p(Math.abs(z1) / v)}\ \mu$s after $${t0}\ \mu$s.`);
    },
    // position of a peak
    () => {
      const v = pick([100, 200, 300]), t0 = pick([0, 1, 2]), dt = pick([1, 2, 3, 5]), s = pick([1, -1]);
      const t1 = t0 + dt, zp = s * v * dt;
      const o = (x) => `$z = ${x}$ m`;
      return MC('Where is the peak?', md`A wave $E(z, t) = g(t ${s > 0 ? '-' : '+'} z/v)$ with $v = ${v}$ m/μs. At $z = 0$ its peak passes at $t = ${t0}\ \mu$s. At $t = ${t1}\ \mu$s the peak is at…`, o(zp),
        [[o(-zp), md`$g(t ${s > 0 ? '-' : '+'} z/v)$ travels toward $${sgnTxt(s)}z$.`], [o(s * v * t1), md`Only the time since the peak left, $${t1} - ${t0}$ μs, counts.`], [o(s * dt), md`Multiply the time by the speed, $${v}$ m per μs.`], [o(s * 300 * dt), md`The speed here is $v = ${v}$ m/μs, not $c$.`]],
        md`It left $z = 0$ at $${t0}\ \mu$s; after $${dt}\ \mu$s at $${v}$ m/μs it is at $z = ${zp}$ m.`);
    },
    // conversions
    () => one([
      () => {
        const fM = pick([1, 3, 10, 30, 100, 300, 1000, 3000]), er = pick([1, 1, 4, 9]);
        const lam = 300 / fM / Math.sqrt(er);
        const o = (x) => `$${EM.p(n3(x))}$ m`;
        return MC('Wavelength', md`A ${fM >= 1000 ? `${fM / 1000} GHz` : `${fM} MHz`} wave in ${er === 1 ? 'vacuum' : `a medium with $\\epsilon_r = ${er}$, $\\mu_r = 1$`}. $\lambda = $`, o(lam),
          [[o(lam * 10), 'Off by ten: c = 3 × 10⁸ m/s and 1 MHz = 10⁶ Hz.'], [o(er === 1 ? lam / 2 / Math.PI : lam * Math.sqrt(er)), er === 1 ? md`That is $\lambda/2\pi = 1/\beta$.` : md`That is the vacuum wavelength; in the medium $v = c/\sqrt{\epsilon_r}$.`], [o(er === 1 ? lam / 10 : lam / Math.sqrt(er)), er === 1 ? 'Off by ten.' : md`Divide by $\sqrt{\epsilon_r} = ${Math.sqrt(er)}$, not by $\epsilon_r$.`]],
          md`$\lambda = \dfrac{c}{f\sqrt{\epsilon_r}} = \dfrac{3\times10^8}{${EM.p(fM * 1e6)}\times${Math.sqrt(er)}} = ${EM.p(n3(lam))}$ m.`);
      },
      () => {
        const k = pick([0.5, 1, 2, 4, 10]), lam = 2 / k;
        const o = (x) => `$${EM.p(n3(x))}$ m`;
        return MC('Wavelength from β', md`$\beta = ${k === 1 ? '' : EM.p(k)}\pi$ rad/m. $\lambda = $`, o(lam),
          [[o(k / 2), md`$\lambda = 2\pi/\beta$, not $\beta/2\pi$.`], [o(1 / k), md`That is $\pi/\beta$: half a wavelength.`], [o(2 * Math.PI / k), md`The $\pi$ in $\beta$ cancels the $\pi$ in $2\pi$.`]],
          md`$\lambda = 2\pi/\beta = 2\pi/(${EM.p(k)}\pi) = ${EM.p(n3(lam))}$ m.`);
      },
    ]),
    // a value of cos at a fraction of a wavelength
    () => {
      const nn = pick([8, 6, 4, 3, 12]), A = pick([1, 2, 5, 10]);
      const ph = 2 * Math.PI / nn, v = A * Math.cos(ph), degErr = A * Math.cos(360 / nn), sinv = A * Math.sin(ph);
      const o = (x) => `$${EM.p(n3(Math.abs(x) < 1e-9 ? 0 : x))}$`;
      return MC('Phase', md`$E = ${A === 1 ? '' : A}\cos(\omega t - \beta z)$ V/m. At $t = 0$ and $z = \lambda/${nn}$, $E = $`, o(v),
        [[o(degErr), md`That evaluates $\cos(${EM.p(360 / nn)})$ with the calculator in radians: the phase $${EM.p(360 / nn)}°$ must be converted, or entered in degrees.`], [o(sinv), md`$\beta z = 2\pi/${nn}$; take its cosine, not its sine.`], [o(-v), md`Cosine is even: $\cos(-\beta z) = \cos(\beta z)$.`], [o(A * Math.cos(Math.PI / nn)), md`$\beta = 2\pi/\lambda$, so $\beta z = 2\pi/${nn}$, not $\pi/${nn}$.`]],
        md`Phase $= -\beta z = -2\pi/${nn}$ rad $= -${EM.p(360 / nn)}°$; $${A}\cos(${EM.p(360 / nn)}°) = ${EM.p(n3(v))}$.`);
    },
    // wavelength from a phase change over time (Spring 2018 1(vii) style)
    () => {
      const dt = pick([1, 2, 5, 10]), m = pick([1, 2, 3, 4, 6]);
      const lam = 600 * dt / m;
      const o = (x) => `$${EM.p(n3(x))}$ m`;
      return MC('Phase change in time', md`A wave in free space: at a fixed point its phase changes by $${m === 1 ? '' : m}\pi$ rad in $${dt}\ \mu$s. $\lambda = $`, o(lam),
        [[o(lam / 2), md`$f = \Delta\phi/(2\pi\Delta t)$: a change of $\pi$ is half a period, not a whole one.`], [o(lam / (2 * Math.PI)), md`That uses $\Delta\phi/\Delta t$, which is $\omega$, as $f$; divide by $2\pi$ first.`], [o(lam / 1000), 'Off by 1000: μs are 10⁻⁶ s.']],
        md`$\omega = ${m === 1 ? '' : m}\pi/(${dt}\times10^{-6}\,\text{s})$, $f = \omega/2\pi = ${EM.p(m / (2 * dt))}\times10^6$ Hz, $\lambda = c/f = ${EM.p(n3(lam))}$ m.`);
    },
  ]);

  GENS.u0_wave_read = () => {
    const isTri = pick([true, false]), A = pick([2, 3, 4, 5, 6]), t0 = pick([1, 2, 3]), tau = pick([2, 4]), v = pick([100, 200, 300]), s = pick([1, -1]);
    const z1 = s * v * pick([2, 3, 5]), tA = t0 + Math.abs(z1) / v;
    const t1 = t0 + tau / 2 + pick([1, 2, 3]);                         // the whole pulse has left z = 0
    const zp = s * v * (t1 - t0), zA = s * v * (t1 - t0 - tau / 2), zB = s * v * (t1 - t0 + tau / 2);
    const lo = Math.min(zA, zB), hi = Math.max(zA, zB);
    const dfr = pick([0.25, -0.25, 0.125, -0.125]);                    // where we sample, as a fraction of tau from the peak
    const z2 = zp + s * v * dfr * tau, val = isTri ? A * tri(dfr) : A;
    const shape = isTri ? '\\triangle' : '\\text{rect}';
    return {
      title: 'Reading a traveling pulse',
      q: md`A wave travels toward $${sgnTxt(s)}z$ at $v = ${v}$ m/μs. At $z = 0$, $E_x(0, t) = ${A}\,${shape}\!\left(\dfrac{t - ${t0}}{${tau}}\right)$ V/m with $t$ in μs. Find when the pulse's center passes $z = ${z1}$ m, where the pulse is at $t = ${t1}\ \mu$s (its two ends and its center), and $E_x$ at $z = ${EM.p(z2)}$ m at that time.`,
      parts: [N('t_{\\text{center}}\\ \\text{at}\\ z_1', tA, 'μs'), N('z_{\\text{low end}}', lo, 'm'), N('z_{\\text{high end}}', hi, 'm'), N('z_{\\text{center}}', zp, 'm'), N(`E_x(${EM.p(z2)}\\,\\text{m},\\ ${t1}\\,\\mu\\text{s})`, val, 'V/m')],
      hints: [md`Replace $t$ by $t ${s > 0 ? '-' : '+'} z/v$: $E_x(z, t) = ${A}\,${shape}\big((t ${s > 0 ? '-' : '+'} z/${v} - ${t0})/${tau}\big)$.`, md`A feature from time $t_k$ at $z = 0$ sits at $z = ${s > 0 ? '' : '-'}v(t_1 - t_k)$. The pulse spans $t_k$ from $${t0 - tau / 2}$ to $${t0 + tau / 2}$ μs.`],
      sol: sol({
        eq: md`$E_x(z, t) = E_x(0,\ t ${s > 0 ? '-' : '+'} z/v)$ for a wave toward $${sgnTxt(s)}z$.`,
        sym: md`$E_x(z, t) = ${A}\,${shape}\!\left(\dfrac{t ${s > 0 ? '-' : '+'} z/${v} - ${t0}}{${tau}}\right)$. The center has argument 0: $z = ${s > 0 ? '' : '-'}v(t - ${t0})$; the ends have argument $\pm\tfrac12$: $z = ${s > 0 ? '' : '-'}v(t - ${t0} \mp ${tau / 2})$.`,
        sub: md`$$t_{\text{center}} = ${t0} + \frac{${Math.abs(z1)}}{${v}} = ${EM.p(tA)}\ \mu\text{s}; \qquad z = ${s > 0 ? '' : '-'}${v}\,(${t1} - ${t0} \mp ${tau / 2}) \Rightarrow ${lo}\ \text{m to } ${hi}\ \text{m}, \text{ center } ${zp}\ \text{m}$$
          At $z = ${EM.p(z2)}$ m the argument is $\big(${t1} ${s > 0 ? '-' : '+'} ${EM.p(z2)}/${v} - ${t0}\big)/${tau} = ${EM.p(-dfr)}$, so $E_x = ${isTri ? `${A}(1 - 2\\times${EM.p(Math.abs(dfr))})` : A} = ${EM.p(val)}$ V/m.`,
        ans: md`Center passes $z = ${z1}$ m at $${EM.p(tA)}\ \mu$s. At $${t1}\ \mu$s the pulse spans $${lo}$ m to $${hi}$ m, centered at $${zp}$ m; $E_x(${EM.p(z2)}\,\text{m}) = ${EM.p(val)}$ V/m.`,
        check: md`Width in space $= v\tau = ${v * tau}$ m $= ${hi} - (${lo})$. ✓ The end that left $z = 0$ first (at $t = ${t0 - tau / 2}\ \mu$s) is the one farthest along, at $${s > 0 ? hi : lo}$ m.`,
      }),
    };
  };

  // ================================================================ question bank
  EM.BANK['u0-vectors'] = [
    Q(md`$|\mathbf A\times\mathbf B|$ equals…`, ['the area of the parallelogram spanned by A and B', md`$AB\cos\theta$`, md`$A + B$`, 'the length of the projection of A on B'], 0,
      [null, md`That is $\mathbf A\cdot\mathbf B$.`, 'Magnitudes multiply; they do not add.', md`That is $A\cos\theta$, a dot-product idea.`],
      md`$|\mathbf A\times\mathbf B| = AB\sin\theta$: base × height of the parallelogram.`),
    Q(md`$\mathbf A\times\mathbf A = $`, ['$0$', md`$A^2$`, md`$\hat a$`, md`$2\mathbf A$`], 0,
      [null, md`That is $\mathbf A\cdot\mathbf A$.`, 'A cross product is perpendicular to its factors; A is not perpendicular to itself.', md`That is $\mathbf A + \mathbf A$, not a product.`],
      md`$\sin0 = 0$.`),
    Q(md`$\mathbf A\cdot\mathbf B < 0$ means the angle between them is…`, ['more than 90°', 'less than 90°', 'exactly 90°', 'exactly 180°'], 0,
      [null, md`Then $\cos\theta > 0$.`, 'That gives zero.', 'That is one case of a negative dot product, not the only one.'],
      md`$\cos\theta < 0$ for $90° < \theta \le 180°$.`),
    Q(md`$\hat z\times\hat r = $`, [md`$\hat\phi$`, md`$-\hat\phi$`, md`$\hat r$`, '$0$'], 0,
      [null, md`$z \to r$ is forward on $(r, \phi, z)$, like $\hat z\times\hat x = \hat y$.`, 'The result is perpendicular to both factors.', 'They are perpendicular, not parallel.'],
      md`$(\hat r, \hat\phi, \hat z)$ cycles like $(x, y, z)$.`),
    Q(md`The unit vector along $(1, 2, 2)$ is…`, [md`$(1, 2, 2)/3$`, md`$(1, 2, 2)/5$`, md`$(1, 2, 2)/\sqrt5$`, md`$(1, 1, 1)$`], 0,
      [null, md`$\sqrt{1 + 4 + 4} = 3$, not 5.`, 'That forgets one of the 2² terms.', 'That changes the direction.'],
      md`Divide by the length $\sqrt{1 + 4 + 4} = 3$.`),
    Q(md`A sheet $\mathbf J_s = J_s\hat x$ lies on $z = 0$. Above it, $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ with $\hat n = +\hat z$ points along…`, [md`$-\hat y$`, md`$+\hat y$`, md`$+\hat z$`, md`$-\hat x$`], 0,
      [null, md`$\hat x\times\hat z$ runs backward: $-\hat y$.`, 'H beside a sheet is parallel to the sheet.', 'H is perpendicular to the current.'],
      md`$\hat x\times\hat z = -\hat y$, matching the sheet's $\mathbf B = -\hat y\,\mu_0J_s/2$ for $z > 0$.`),
    Q(md`A wire segment carries current along $+\hat z$ in $\mathbf B = B\hat x$. The force on it, $I\,d\mathbf l\times\mathbf B$, points along…`, [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat x$`, md`$-\hat z$`], 0,
      [null, md`$z \to x$ is forward: $\hat z\times\hat x = +\hat y$.`, 'The force is perpendicular to B.', 'The force is perpendicular to the current.'],
      md`$\hat z\times\hat x = \hat y$.`),
    Q(md`A charge moves **parallel** to a uniform $\mathbf B$. The magnetic force on it is…`, ['zero', 'along v', 'maximal', 'along B'], 0,
      [null, 'The magnetic force is always perpendicular to v.', md`Maximal is when $\mathbf v \perp \mathbf B$.`, 'The force is perpendicular to B.'],
      md`$\mathbf v\times\mathbf B = 0$ for parallel vectors.`),
    Q(md`At $\phi = 45°$, $\hat\phi = $`, [md`$\tfrac{1}{\sqrt2}(-\hat x + \hat y)$`, md`$\tfrac{1}{\sqrt2}(\hat x + \hat y)$`, md`$\tfrac{1}{\sqrt2}(\hat x - \hat y)$`, md`$\hat y$`], 0,
      [null, md`That is $\hat r$ at 45°.`, 'That runs clockwise.', md`That is $\hat\phi$ at $\phi = 0$.`],
      md`$-\sin45°\,\hat x + \cos45°\,\hat y$.`),
    Q(md`Two long wires at $(x, y) = (\pm d, 0)$ both carry $I$ along $+\hat z$. At the origin, $\mathbf B$ is…`, ['zero', md`$\mu_0I/\pi d$ along $\hat y$`, md`$\mu_0I/\pi d$ along $\hat\phi$`, md`$\mu_0I/2\pi d$ along $-\hat y$`], 0,
      [null, md`The wire at $+d$ gives $-\hat y$ at the origin and the wire at $-d$ gives $+\hat y$: they cancel.`, md`$\hat\phi$ of one wire is not $\hat\phi$ of the other; convert to $\hat x, \hat y$ before adding.`, 'That is one wire alone.'],
      md`Wire at $(d, 0)$: $\hat r$ to the origin is $-\hat x$, $\mathbf B \propto \hat z\times(-\hat x) = -\hat y$. Wire at $(-d, 0)$: $\hat z\times\hat x = +\hat y$. Equal sizes: zero.`),
    Q(md`If you draw $\hat y$ to the right and $\hat z$ up on the page, $\hat x$ points…`, ['out of the page, toward you', 'into the page', 'to the left', 'down'], 0,
      [null, md`Then $\hat x\times\hat y$ would be $-\hat z$: left-handed.`, 'x must be perpendicular to both y and z.', 'x must be perpendicular to both y and z.'],
      md`$\hat y\times\hat z = \hat x$: fingers right, curl up, thumb toward you.`),
    Q(md`$(\mathbf A\times\mathbf B)\cdot\mathbf A = $`, ['$0$, always', md`$A^2B$`, md`$|\mathbf A\times\mathbf B|A$`, 'it depends on the angle'], 0,
      [null, 'A × B is perpendicular to A, so its dot product with A vanishes.', 'Only if A × B were parallel to A, which it never is.', 'It is zero at every angle.'],
      md`$\mathbf A\times\mathbf B$ is perpendicular to $\mathbf A$.`),
    Q(md`A sheet $\mathbf J_s = 2\hat y$ A/m on $z = 0$ has $\mathbf H = 3\hat z$ A/m for $z < 0$. Using $\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n$ ($\hat n$ from − to +), $\mathbf H$ for $z > 0$ is…`,
      [md`$2\hat x + 3\hat z$ A/m`, md`$-2\hat x + 3\hat z$ A/m`, md`$5\hat z$ A/m`, md`$-2\hat y + 3\hat z$ A/m`], 0,
      [null, md`$\hat y\times\hat z = +\hat x$: forward on the cycle.`, md`The jump is along $\mathbf J_s\times\hat n$, which is tangential, not along $\hat z$.`, md`$\mathbf J_s\times\hat n$ is perpendicular to $\mathbf J_s$.`],
      md`$\hat n = +\hat z$: $\mathbf J_s\times\hat n = 2(\hat y\times\hat z) = 2\hat x$, so $\mathbf H^+ = 3\hat z + 2\hat x$ A/m.`, { src: 'Spring 2018 Exam 2' }),
  ];

  EM.BANK['u0-integrals'] = [
    Q(md`You walk a circle of radius $r$ about the $z$-axis **clockwise** seen from $+z$, letting the limits carry the direction. Then $\oint\mathbf F\cdot d\mathbf l$ uses…`, [md`$d\mathbf l = \hat\phi\,r\,d\phi$, with $\phi$ from $2\pi$ down to $0$`, md`$d\mathbf l = -\hat\phi\,r\,d\phi$, with $\phi$ from $2\pi$ down to $0$`, md`$d\mathbf l = \hat\phi\,d\phi$, with $\phi$ from $2\pi$ down to $0$`, md`$d\mathbf l = \hat r\,r\,d\phi$, with $\phi$ from $0$ to $2\pi$`], 0,
      [null, 'That flips twice: the minus sign and the reversed limits cancel, giving the counterclockwise answer.', md`A step $d\phi$ has length $r\,d\phi$.`, md`$\hat r$ points off the circle, not along it.`],
      md`Clockwise, $\phi$ decreases: keep $d\mathbf l = \hat\phi\,r\,d\phi$ and run $\phi$ from $2\pi$ to 0. (Writing $-\hat\phi\,r\,d\phi$ with $\phi$ from 0 to $2\pi$ is the same thing; doing both is the error.)`),
    Q(md`A point charge $Q$ is at the center of a sphere of radius $a$. Gauss's law gives…`, [md`$D_r\cdot4\pi a^2 = Q$`, md`$D_r\cdot2\pi a = Q$`, md`$D_r\cdot\tfrac43\pi a^3 = Q$`, md`$D_r\cdot\pi a^2 = Q$`], 0,
      [null, 'That is a circumference.', 'That is the volume; the flux uses the surface area.', 'That is a disk.'],
      md`The flux is $D_r$ times the sphere's area $4\pi a^2$.`),
    Q(md`A uniform $\mathbf B = B_0\hat z$ through a hemisphere of radius $a$ (resting on the $xy$-plane, normal outward and up) gives flux…`, [md`$B_0\pi a^2$`, md`$B_0\,2\pi a^2$`, md`$0$`, md`$B_0\,4\pi a^2$`], 0,
      [null, 'That is B₀ times the curved area; only the part of B along each patch\'s normal counts.', 'The field crosses the hemisphere.', 'That is a whole sphere\'s area.'],
      md`Same rim as the flat disk underneath, so the same flux: $B_0\pi a^2$.`),
    Q(md`Which surfaces may you use with a given $C$ in Ampère's law?`, ['any surface whose rim is C', 'only the flat one', 'only surfaces perpendicular to H', 'only closed surfaces'], 0,
      [null, 'Any surface with that rim works, as long as dS follows C by the RHR (and displacement current is included if needed).', 'The surface is any one bounded by C.', 'A closed surface has no rim.'],
      md`The law holds for every surface bounded by $C$.`),
    Q(md`HW 5 #1: $\mathbf B$ is uniform and you need the flux through a curved, partial-cone surface. The fast way is…`, ['close it with flat faces and use ∮B·dS = 0', 'integrate over the cone in spherical coordinates', 'multiply B by the cone\'s area', 'the flux is zero for any curved surface'], 0,
      [null, 'Possible, but long; the closed-surface trick replaces it.', 'Only the normal component counts, and it changes over the cone.', 'Curved surfaces can carry flux.'],
      md`The flux out of the closed surface is zero, so the cone's flux equals minus the flux out through the flat faces, which are easy.`),
    Q(md`$\mathbf E = E_0\hat y$ (uniform). From $(0, 0)$ to $(1, 1)$ m, the path via $(1, 0)$ versus the straight diagonal gives…`, [md`the same: $E_0\cdot1$ m`, 'different values', md`$E_0\sqrt2$ for the diagonal`, 'zero for both'], 0,
      [null, 'A uniform field has zero curl: every path between two points gives the same integral.', md`Only the $y$-displacement counts: 1 m.`, md`The $y$-displacement is 1 m.`],
      md`$\int\mathbf E\cdot d\mathbf l = E_0\Delta y = E_0$ (with $\Delta y = 1$ m) on any path.`),
    Q(md`$\mathbf J = J_0\hat z$ (uniform) through a disk of radius $a$ in the $xy$-plane: $I = $`, [md`$J_0\pi a^2$`, md`$J_0\,2\pi a$`, md`$J_0a^2$`, md`$\tfrac23J_0\pi a^2$`], 0,
      [null, 'That is a circumference.', 'That misses the π.', md`That is for a field growing as $r/a$, not a uniform one.`],
      md`Uniform and flat: $J_0$ times the area.`),
    Q(md`$\mathbf J = J_0(r/a)\,\hat z$ through a disk of radius $a$: $I = $`, [md`$\tfrac23\pi J_0a^2$`, md`$\pi J_0a^2$`, md`$\tfrac12\pi J_0a^2$`, md`$\pi J_0a$`], 0,
      [null, 'That treats J as uniform at its edge value.', 'The outer rings, where J is large, have more area: weight by r dr.', md`That drops the $r$ of $dS = r\,dr\,d\phi$.`],
      md`$\int_0^a J_0\dfrac ra\,2\pi r\,dr = \dfrac{2\pi J_0}{a}\dfrac{a^3}{3}$.`),
    Q(md`$\mathbf H = H_\phi\hat\phi$. Along a radial line from $r = a$ to $r = b$, $\int\mathbf H\cdot d\mathbf l = $`, ['$0$', md`$H_\phi(b - a)$`, md`$2\pi(b - a)H_\phi$`, md`$H_\phi\ln(b/a)$`], 0,
      [null, md`$d\mathbf l = \hat r\,dr$, perpendicular to $\hat\phi$.`, 'A radial path is perpendicular to the field.', 'A radial path is perpendicular to the field.'],
      md`$\hat\phi\cdot\hat r = 0$.`),
    Q(md`A field has $\nabla\times\mathbf F = 0$ everywhere. Its circulation around any closed loop is…`, ['0', 'the loop\'s area', 'the enclosed current', 'not defined: it depends on the loop'], 0,
      [null, 'Stokes: the circulation is the flux of the curl, which is zero.', 'Only a field with curl can circulate.', 'It is always defined.'],
      md`Stokes: $\oint\mathbf F\cdot d\mathbf l = \int(\nabla\times\mathbf F)\cdot d\mathbf S = 0$.`),
    Q(md`A region has $\nabla\cdot\mathbf F = 0$ everywhere inside a closed surface, but $\mathbf F \ne 0$ on it. The net outward flux is…`, ['0', 'positive', 'negative', 'it depends on F on the surface'], 0,
      [null, 'Divergence theorem: the flux equals the total divergence inside, which is zero.', 'Divergence theorem: zero.', 'Whatever F looks like on the surface, inflow and outflow balance.'],
      md`$\oint\mathbf F\cdot d\mathbf S = \int\nabla\cdot\mathbf F\,dV = 0$: what flows in flows out.`),
    Q(md`For the wire-and-rectangle flux $\dfrac{\mu_0Ih}{2\pi}\ln\dfrac{d + w}{d}$, doubling both $d$ and $w$ (same $h$) makes the flux…`, ['unchanged', 'half as large', 'twice as large', 'four times as large'], 0,
      [null, md`The ratio $(d + w)/d$ is unchanged.`, md`Only the ratio $(d + w)/d$ enters, and $h$.`, 'The area doubles, but the field over it halves.'],
      md`$(2d + 2w)/2d = (d + w)/d$: a farther, wider loop sees a weaker field over more area, exactly compensating.`),
  ];

  EM.BANK['u0-curl-div'] = [
    Q(md`$\nabla(x^2y) = $`, [md`$2xy\,\hat x + x^2\,\hat y$`, md`$2xy + x^2$`, md`$2x\,\hat x + y\,\hat y$`, md`$2xy\,\hat x$`], 0,
      [null, 'A gradient is a vector: each partial derivative is a component.', md`$\partial(x^2y)/\partial y = x^2$, and $\partial/\partial x$ keeps the $y$.`, md`It has a $y$-component too: $x^2$.`],
      md`$(\partial_x, \partial_y, \partial_z)(x^2y) = (2xy, x^2, 0)$.`),
    Q(md`$\nabla^2(x^2 + y^2 + z^2) = $`, ['6', '2', md`$2x + 2y + 2z$`, '0'], 0,
      [null, 'That is one second derivative; the Laplacian adds three.', 'That stops after one derivative; differentiate twice.', md`Each second derivative is $2$, not $0$.`],
      md`$2 + 2 + 2$.`),
    Q(md`$\mathbf E = E_0\cos(\omega t - \beta z)\,\hat x$. $\nabla\cdot\mathbf E = $`, ['0', md`$\beta E_0\sin(\omega t - \beta z)$`, md`$-\omega E_0\sin(\omega t - \beta z)$`, md`$E_0$`], 0,
      [null, md`$E_x$ does not depend on $x$: $\partial_xE_x = 0$.`, md`That is a time derivative.`, 'The divergence is a derivative.'],
      md`The only component, $E_x$, varies with $z$, across its direction: no divergence. Plane waves are transverse.`),
    Q(md`The curl of a uniform field is…`, ['0', 'the field itself', 'not defined', 'perpendicular to the field with the same size'], 0,
      [null, 'Every derivative of a constant is zero.', 'It is defined, and zero.', 'Every derivative of a constant is zero.'],
      md`No derivative survives.`),
    Q(md`$\nabla\times(z\,\hat x) = $`, [md`$\hat y$`, md`$-\hat y$`, md`$\hat z$`, '0'], 0,
      [null, md`$(\nabla\times\mathbf F)_y = \partial_zF_x - \partial_xF_z = 1$.`, md`$\hat z\times\hat x = \hat y$: the curl is perpendicular to both the field and its variation.`, md`$F_x$ changes with $z$, across its direction.`],
      md`$\hat z\times\partial_z(z\hat x) = \hat z\times\hat x = \hat y$.`),
    Q(md`$\nabla\times(z\,\hat y) = $`, [md`$-\hat x$`, md`$\hat x$`, md`$\hat z$`, '0'], 0,
      [null, md`$(\nabla\times\mathbf F)_x = \partial_yF_z - \partial_zF_y = -1$.`, md`The curl is perpendicular to both $\hat y$ and $\hat z$.`, md`$F_y$ changes with $z$.`],
      md`$\hat z\times\hat y = -\hat x$.`),
    Q(md`A **static** field $\mathbf E = E_0\sin(\beta z)\,\hat x$ in a charge-free region. Is that possible?`, [md`No: its curl $\beta E_0\cos(\beta z)\,\hat y$ is not zero`, md`Yes: $\nabla\cdot\mathbf E = 0$`, md`No: $\nabla\cdot\mathbf E \ne 0$`, 'Yes: any bounded field is fine'], 0,
      [null, md`Zero divergence is needed, but a static $\mathbf E$ also needs zero curl.`, md`$\partial_xE_x = 0$: the divergence is zero.`, 'Boundedness is not the test.'],
      md`Static: $\nabla\times\mathbf E = -\partial\mathbf B/\partial t = 0$. This field has curl, so it can only exist with a changing $\mathbf B$, as part of a wave.`),
    Q(md`At some instant $\mathbf J = 3x\,\hat x$ A/m². At that instant the charge density at any point changes at…`, [md`$-3$ C/(m³·s)`, md`$+3$ C/(m³·s)`, '0', md`$-3x$ C/(m³·s)`], 0,
      [null, md`Continuity has a minus sign: $\partial\rho/\partial t = -\nabla\cdot\mathbf J$.`, md`$\nabla\cdot\mathbf J = 3 \ne 0$.`, md`$\partial_x(3x) = 3$, independent of $x$.`],
      md`$\partial\rho/\partial t = -\nabla\cdot\mathbf J = -3$: charge drains out of every point.`),
    Q(md`In a slab with uniform $\rho_0$, symmetric about $z = 0$, $dD_z/dz = \rho_0$ gives…`, [md`$D_z = \rho_0z$`, md`$D_z = \rho_0z + C$ with $C \ne 0$`, md`$D_z = \rho_0$`, md`$D_z = \rho_0z^2/2$`], 0,
      [null, md`Symmetry about $z = 0$ forces $D_z(0) = 0$, so $C = 0$.`, md`That is $dD_z/dz$, not $D_z$.`, 'That integrates twice.'],
      md`$D_z = \rho_0z + C$, and the mirror symmetry makes $D_z(0) = 0$: the formula sheet's $\mathbf E = \hat z\rho z/\epsilon_0$ inside a slab.`),
    Q(md`A field is known to equal $\nabla\times\mathbf A$ for some $\mathbf A$. Then its divergence is…`, ['0', 'equal to |A|', 'unknown without A', 'equal to ∇·A'], 0,
      [null, 'The divergence of any curl is zero.', 'The identity holds for every A.', 'No such relation.'],
      md`$\nabla\cdot(\nabla\times\mathbf A) = 0$.`),
    Q(md`The gradient $\nabla V$ points…`, ['toward increasing V, steepest', 'toward decreasing V', 'along the equipotentials', 'along E'], 0,
      [null, md`That is $-\nabla V = \mathbf E$.`, 'It is perpendicular to the equipotentials.', md`$\mathbf E = -\nabla V$ points the other way.`],
      md`$\nabla V$ is the uphill direction; $\mathbf E = -\nabla V$ runs downhill.`),
    Q(md`$\mathbf H = H_0\cos(\omega t - \beta z)\,\hat y$ in a lossless medium. By $\nabla\times\mathbf H = \epsilon\,\partial\mathbf E/\partial t$, $\mathbf E$ points along…`, [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat z$`, md`$+\hat y$`], 0,
      [null, md`Then $\mathbf E\times\mathbf H \propto -\hat x\times\hat y = -\hat z$, but $\cos(\omega t - \beta z)$ travels toward $+z$. A sign slipped: anti-differentiating $-\sin$ in $t$ gives $+\cos/\omega$.`, 'E is perpendicular to the travel direction.', 'E is perpendicular to H.'],
      md`$\nabla\times\mathbf H = \hat z\times\partial_z\mathbf H = -\beta H_0\sin(\omega t - \beta z)\,\hat x$. So $\partial\mathbf E/\partial t = -(\beta H_0/\epsilon)\sin(\cdot)\,\hat x$ and $\mathbf E = \dfrac{\beta H_0}{\epsilon\omega}\cos(\cdot)\,\hat x = \eta H_0\cos(\omega t - \beta z)\,\hat x$. Check: $\hat x\times\hat y = +\hat z$, the travel direction. ✓`),
    // cylindrical coordinates
    Q(md`$\nabla\times(H_0\,\hat\phi)$, with $H_0$ a constant, is…`,
      [md`$\dfrac{H_0}{r}\,\hat z$`, '$0$', md`$H_0\,\hat z$`, md`$\dfrac{H_0}{r}\,\hat\phi$`], 0,
      [null, md`A constant component is not a constant field: $\hat\phi$ turns from point to point, and $rH_\phi = H_0r$ grows.`, md`The curl carries a 1/m: $\frac1r\frac{d}{dr}(H_0r) = H_0/r$.`, md`A $\hat\phi$ field circulates about the axis; its curl points along $\hat z$.`],
      md`$\frac1r\frac{d}{dr}(rH_0) = H_0/r$. A constant $H_\phi$ needs a current density $H_0/r$ wherever it holds.`),
    Q(md`$\nabla\cdot\big(\hat r/r\big)$ for $r > 0$, in cylindrical coordinates, is…`,
      ['$0$', md`$-\dfrac{1}{r^2}$`, md`$\dfrac{1}{r^2}$`, md`$\dfrac{2}{r^2}$`], 0,
      [null, md`That is $\partial F_r/\partial r$ alone; $rF_r = 1$ is constant.`, md`$\frac1r\frac{d}{dr}\big(r\cdot\frac1r\big) = \frac1r\frac{d}{dr}(1) = 0$.`, md`$rF_r = 1$ is constant: no divergence.`],
      md`$\hat r/r$ is the shape of a line charge's field. Off the line there is no charge, so no divergence.`),
    Q(md`For any profile $H_\phi(r)$, $\nabla\cdot\big(H_\phi(r)\,\hat\phi\big) = $`,
      ['$0$', md`$\dfrac1r\dfrac{d(rH_\phi)}{dr}$`, md`$\dfrac{dH_\phi}{dr}$`, md`$\dfrac{H_\phi}{r}$`], 0,
      [null, md`That is the $\hat z$ part of the curl, not the divergence.`, md`The divergence uses $\partial F_\phi/\partial\phi$ for this component, and $H_\phi$ does not depend on $\phi$.`, md`The only term with $F_\phi$ is $\frac1r\partial F_\phi/\partial\phi = 0$.`],
      md`Circles neither start nor end: every wire's $\mathbf H$ satisfies $\nabla\cdot\mathbf B = 0$ automatically.`),
    Q(md`A radial field $\mathbf F = F_r(r)\,\hat r$ that depends only on $r$ has curl…`,
      [md`$0$, for any $F_r(r)$`, md`$\hat z\,\dfrac1r\dfrac{d(rF_r)}{dr}$`, md`$-\hat\phi\,\dfrac{dF_r}{dr}$`, md`zero only if $F_r\propto1/r$`], 0,
      [null, md`That is the divergence with a $\hat z$ attached. The $\hat z$ part of the curl uses $F_\phi$ and $\partial_\phi F_r$.`, md`The $\hat\phi$ part is $\partial_zF_r - \partial_rF_z$: it has $\partial_zF_r$, not $\partial_rF_r$.`, md`$1/r$ is the zero-**divergence** profile; every $F_r(r)$ has zero curl.`],
      md`$F_r$ enters the curl only through $\partial_zF_r$ and $\partial_\phi F_r$, both zero. That is why a charged cylinder's $E_r(r)$ can be electrostatic.`),
    Q(md`$\dfrac1r\dfrac{d}{dr}\big(rH_\phi\big) = $`,
      [md`$\dfrac{dH_\phi}{dr} + \dfrac{H_\phi}{r}$`, md`$\dfrac{dH_\phi}{dr}$`, md`$\dfrac{dH_\phi}{dr} + H_\phi$`, md`$r\dfrac{dH_\phi}{dr} + H_\phi$`], 0,
      [null, md`That drops the derivative of the $r$: the product rule gives two terms.`, md`After dividing by $r$, the second term is $H_\phi/r$, not $H_\phi$.`, md`That is $\frac{d}{dr}(rH_\phi)$ before dividing by $r$.`],
      md`Product rule: $\frac{d}{dr}(rH_\phi) = H_\phi + r\frac{dH_\phi}{dr}$; divide by $r$.`),
    Q(md`$\mathbf H = H_0e^{-r/a}\,\hat z$ inside a long cylinder. $\mathbf J = $`,
      [md`$\dfrac{H_0}{a}e^{-r/a}\,\hat\phi$`, md`$-\dfrac{H_0}{a}e^{-r/a}\,\hat\phi$`, md`$\dfrac{H_0}{a}e^{-r/a}\,\hat z$`, md`$H_0\left(\dfrac1r - \dfrac1a\right)e^{-r/a}\,\hat\phi$`], 0,
      [null, md`$J_\phi = -dH_z/dr$, and $dH_z/dr = -(H_0/a)e^{-r/a}$: the two minus signs cancel.`, md`A $\hat z$ field that varies with $r$ has its curl along $\hat\phi$.`, md`That applies $\frac1r\frac{d}{dr}(r\,\cdot)$, which belongs to $F_\phi$ in the $\hat z$ part; $H_z$ enters the $\hat\phi$ part as $-\partial_rH_z$.`],
      md`$J_\phi = -\dfrac{d}{dr}\big(H_0e^{-r/a}\big) = \dfrac{H_0}{a}e^{-r/a}$. $H_z$ falls outward, so the current circles counterclockwise from $+z$, and the RHR gives $+\hat z$ inside. ✓`),
    Q(md`$H_\phi = H_0r/a$ for $r < a$ and $H_0a/r$ for $r > a$. The current density is…`,
      [md`$\dfrac{2H_0}{a}\,\hat z$ inside, $0$ outside`, md`$\dfrac{H_0}{a}\,\hat z$ inside, $-\dfrac{H_0a}{r^2}\,\hat z$ outside`, md`$\dfrac{2H_0}{a}\,\hat z$ inside, $-\dfrac{2H_0a}{r^2}\,\hat z$ outside`, md`$0$ inside, $\dfrac{H_0}{a}\,\hat z$ outside`], 0,
      [null, md`That is $dH_\phi/dr$ on both sides: the $H_\phi/r$ term is missing.`, md`Outside, $rH_\phi = H_0a$ is constant: no current.`, md`Inside, $H_\phi$ grows with $r$, so current is enclosed there; outside, $rH_\phi$ is constant.`],
      md`Inside: $\frac1r\frac{d}{dr}(H_0r^2/a) = 2H_0/a$, uniform. Outside: $rH_\phi = H_0a$ is constant, so $\mathbf J = 0$. It is a uniform wire carrying $I = J\pi a^2 = 2\pi aH_0$.`),
    Q(md`In Cartesian, $\mathbf F = -y\,\hat x + x\,\hat y$ has $\nabla\times\mathbf F = 2\hat z$. In cylindrical coordinates, $\mathbf F$ is…`,
      [md`$r\,\hat\phi$, and $\frac1r\frac{d}{dr}(r\cdot r) = 2$ agrees`, md`$\hat\phi$, with curl $\frac1r\hat z$`, md`$r\,\hat r$, with no curl`, md`$-r\,\hat\phi$, with curl $-2\hat z$`], 0,
      [null, md`$|\mathbf F| = \sqrt{x^2 + y^2} = r$, not 1.`, md`$r\,\hat r = x\,\hat x + y\,\hat y$ points away from the axis; this field circles it.`, md`At $(1, 0)$, $\mathbf F = \hat y = +\hat\phi$: counterclockwise.`],
      md`$\hat\phi = -\sin\phi\,\hat x + \cos\phi\,\hat y$, so $r\hat\phi = -y\,\hat x + x\,\hat y$. Both coordinate systems give the same curl, $2\hat z$, as they must.`),
    Q(md`Inside a uniform wire, $H_\phi = H_0r/a$. Close to the axis, $\nabla\times\mathbf H = \hat z\,\frac1r\frac{d(rH_\phi)}{dr}$ is…`,
      [md`$2H_0/a$, the same as everywhere inside`, md`infinite, because of the $1/r$`, md`zero, because $H_\phi \to 0$ on the axis`, md`$H_0/a$, half its value elsewhere`], 0,
      [null, md`$rH_\phi = H_0r^2/a$ vanishes like $r^2$; its derivative, $2H_0r/a$, cancels the $1/r$.`, md`$H_\phi$ goes to zero but its slope does not; the curl measures the change.`, md`$\frac1r\frac{d}{dr}(H_0r^2/a) = 2H_0/a$ at every $r < a$; nothing changes near the axis.`],
      md`The $1/r$ is harmless: $J_z = 2H_0/a$ right up to the axis, as the Cartesian form $\frac{H_0}{a}(-y\,\hat x + x\,\hat y)$ confirms.`),
    Q(md`An ideal solenoid has $H_z = nI$ for $r < a$ and $0$ for $r > a$ ($nI > 0$). Where is $\nabla\times\mathbf H$ nonzero?`,
      [md`only at $r = a$: a sheet of current $nI$ per meter along $+\hat\phi$`, md`everywhere inside: $\dfrac{nI}{a}\,\hat\phi$`, md`nowhere: $\mathbf H$ is uniform inside and zero outside`, md`only at $r = a$, along $-\hat\phi$`], 0,
      [null, md`$H_z$ is flat inside: $dH_z/dr = 0$ there.`, md`It is flat on each side, but it drops by $nI$ at the wall: its derivative there is a spike.`, md`$J_\phi = -dH_z/dr$, and $H_z$ **drops** outward: $+\hat\phi$.`],
      md`$J_\phi = -dH_z/dr$ is a spike (a delta) at $r = a$ of weight $nI$: the turns, $nI$ amperes per meter, counterclockwise from $+z$ for $\mathbf H$ along $+\hat z$.`),
  ];

  EM.BANK['u0-deltas'] = [
    Q(md`$\delta(0) = $`, ['infinite; only its area is 1', '1', '0', '½'], 0,
      [null, 'Area 1, not height 1.', 'The spike is at 0.', 'Half the area lies on each side of 0, but the height there is infinite.'],
      md`An infinitely narrow spike with area 1 is infinitely tall.`),
    Q(md`$\delta(2x) = $`, [md`$\tfrac12\delta(x)$`, md`$2\delta(x)$`, md`$\delta(x)$`, md`$\delta(x/2)$`], 0,
      [null, 'Squeezing the spike keeps its height infinite but halves its area.', 'Integrate both: they differ by a factor of 2.', 'That is a stretched spike: area 2.'],
      md`$\int\delta(2x)\,dx = \tfrac12\int\delta(u)\,du = \tfrac12$.`),
    Q(md`$\displaystyle\int_{-1}^{1}\int_{-1}^{1}\rho_l\,\delta(x)\,\delta(y)\,dx\,dy = $`, [md`$\rho_l$`, md`$4\rho_l$`, '0', md`$2\rho_l$`], 0,
      [null, 'The deltas remove the area; nothing is left to multiply by.', 'The spike at the origin is inside the square.', 'Each delta integrates to 1.'],
      md`Each integral sifts to 1: the charge per unit length on the $z$-axis.`),
    Q(md`$\rho = \rho_s\,\delta(z + 3)$ is a charge sheet in the plane…`, [md`$z = -3$`, md`$z = 3$`, md`$z = 0$`, 'it is a line charge'], 0,
      [null, md`$z + 3 = 0$ at $z = -3$.`, 'The argument is z + 3.', 'One delta: a plane.'],
      md`The delta fires where its argument vanishes.`),
    Q(md`$\text{sgn}(z) = $`, [md`$2u(z) - 1$`, md`$u(z) - 1$`, md`$u(z) + u(-z)$`, md`$2u(z)$`], 0,
      [null, 'That is 0 for z > 0.', 'That is 1 everywhere.', 'That is 0 for z < 0.'],
      md`$-1$ for $z < 0$ and $+1$ for $z > 0$.`),
    Q(md`$\dfrac{d}{dz}\,\text{sgn}(z) = $`, [md`$2\delta(z)$`, md`$\delta(z)$`, '0', md`$\text{sgn}(z)$`], 0,
      [null, 'The jump is from −1 to +1: size 2.', 'It jumps at z = 0.', 'sgn is flat on both sides: its derivative is zero except at the jump.'],
      md`A jump of 2 gives $2\delta(z)$.`),
    Q(md`Lecture 13's sheet field $\mathbf H = -\tfrac12J_{s0}\,\text{sgn}(y)\,\hat x$ jumps across $y = 0$ by…`, [md`$J_{s0}$ in size`, md`$\tfrac12J_{s0}$`, '0', md`$2J_{s0}$`], 0,
      [null, md`It goes from $+\tfrac12J_{s0}$ to $-\tfrac12J_{s0}$: a jump of $J_{s0}$.`, 'H reverses across the sheet.', 'Half on each side, not twice.'],
      md`The tangential $\mathbf H$ jumps by the surface current density, as the boundary condition $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$ says.`),
    Q(md`$A\,\triangle\big((t - t_0)/\tau\big)$ reaches half its peak at…`, [md`$t = t_0 \pm \tau/4$`, md`$t = t_0 \pm \tau/2$`, md`$t = t_0 \pm \tau$`, md`$t = \pm\tau/4$`], 0,
      [null, md`At $t_0 \pm \tau/2$ it is zero.`, md`That is where a triangle of base $2\tau$ ends; this one is already zero at $t_0 \pm \tau/2$.`, md`Center at $t_0$, not 0.`],
      md`$1 - 2|t - t_0|/\tau = \tfrac12$ at $|t - t_0| = \tau/4$.`),
    Q(md`$u(3 - x)$ is 1 for…`, [md`$x < 3$`, md`$x > 3$`, md`$x > -3$`, 'all x'], 0,
      [null, md`$3 - x > 0$ means $x < 3$.`, 'The argument is 3 − x.', 'It switches at x = 3.'],
      md`$u$ is 1 when its argument is positive.`),
    Q(md`Spring 2018 #4: $\mathbf E(x, 1\ \mu\text{s}) = 3u[x - 100]\,e^{-(x - 100)/50}\,\hat z$ V/m. At that instant, just to the right of $x = 100$ m, $E_z$ is…`, ['3 V/m', '0', '1.10 V/m', '∞'], 0,
      [null, 'That is the left side, x < 100.', md`That is the value 50 m farther, $3e^{-1}$.`, 'A step jumps to a finite value.'],
      md`$u = 1$ and the exponential is $e^0 = 1$: 3 V/m.`),
    Q(md`A slab $-w/2 < z < w/2$ carries $\mathbf J = (K/w)\,\hat x$. As $w \to 0$ it becomes…`, [md`$K\,\delta(z)\,\hat x$, a sheet with $J_s = K$`, 'zero current', 'infinite current per meter', md`$K\,\hat x$, uniform`], 0,
      [null, 'The current per meter of width stays K.', 'The density grows, but its integral across stays K.', 'The current is confined to z = 0.'],
      md`$\int J_x\,dz = (K/w)\,w = K$ for every $w$: in the limit, $K\delta(z)$.`),
    Q(md`A rect pulse $5\,\text{rect}\big((t - 4)/2\big)$ (t in μs) is on from…`, ['3 to 5 μs', '4 to 6 μs', '2 to 6 μs', '−1 to 1 μs'], 0,
      [null, 'rect is centered at its argument = 0, i.e. at t = 4.', 'That is width 4 = 2τ.', 'Center first: t − 4 = 0 at t = 4.'],
      md`$|t - 4| < 1$.`),
  ];

  EM.BANK['u0-waveforms'] = [
    Q(md`$f(t - 3)$ compared with $f(t)$ is…`, ['shifted 3 to the right (later)', 'shifted 3 to the left (earlier)', 'stretched by 3', 'flipped'], 0,
      [null, 'Minus means later.', 'A shift is not a stretch.', 'No flip without a minus sign on t.'],
      md`Whatever $f$ did at time 0, $f(t - 3)$ does at $t = 3$.`),
    Q(md`$g = u(t + 0.02x)$ ($t$ in s, $x$ in m) travels…`, [md`toward $-x$ at 50 m/s`, md`toward $+x$ at 50 m/s`, md`toward $-x$ at 0.02 m/s`, md`toward $+x$ at 0.02 m/s`], 0,
      [null, 'Same signs on t and x: toward −x.', md`$t + 0.02x = t + x/50$: speed 50 m/s.`, 'Both wrong.'],
      md`$t + x/50$: $-x$ at 50 m/s (Lecture 18).`),
    Q(md`$f = (0.05y - t)^2$ travels…`, [md`toward $+y$ at 20 m/s`, md`toward $-y$ at 20 m/s`, md`toward $+y$ at 0.05 m/s`, 'it does not travel: it is squared'], 0,
      [null, 'Opposite signs on t and y: toward +y.', md`$0.05y - t = -(t - y/20)$: speed 20 m/s.`, 'Squaring cannot hide the relative sign.'],
      md`$(t - y/20)^2$: $+y$ at 20 m/s (Lecture 18).`),
    Q(md`$\omega = 2\pi\times10^9$ rad/s and $\beta = 20\pi/3$ rad/m. The phase velocity is…`, [md`$3\times10^8$ m/s`, md`$10^8$ m/s`, md`$3.3\times10^{-9}$ m/s`, md`$6\times10^8$ m/s`], 0,
      [null, md`$2\pi\times10^9/(20\pi/3) = 3\times10^8$.`, 'Upside down.', 'Recheck the division.'],
      md`$v_p = \omega/\beta = 3\times10^8$ m/s.`),
    Q(md`Two points $\lambda/2$ apart along the travel direction of a sinusoidal wave are…`, ['180° out of phase', 'in phase', '90° out of phase', '45° out of phase'], 0,
      [null, 'That needs a whole wavelength.', 'That is a quarter wavelength.', 'That is an eighth of a wavelength.'],
      md`$\beta\,\Delta z = (2\pi/\lambda)(\lambda/2) = \pi$.`),
    Q(md`$\sin(\omega t - \beta z)$ compared with $\cos(\omega t - \beta z)$ is…`, ['a quarter period later', 'a quarter period earlier', 'the same wave', 'a half period later'], 0,
      [null, md`$\sin x = \cos(x - \pi/2)$: the phase is $\pi/2$ behind.`, 'They differ by 90°.', 'They differ by 90°, not 180°.'],
      md`$\sin(\omega t - \beta z) = \cos(\omega t - \beta z - \pi/2)$: it reaches each crest $T/4$ later.`),
    Q(md`A forward wave has $E(0, t) = g(t)$. Then $E(z, t) = $`, [md`$g(t - z/v)$`, md`$g(t + z/v)$`, md`$g(z - vt)$`, md`$g(t)\,g(z)$`], 0,
      [null, 'That travels toward −z.', md`That is a forward wave too, but not this one: at $z = 0$ it gives $g(-vt)$, not $g(t)$.`, 'A traveling wave is a function of one combination of z and t.'],
      md`What $z = 0$ had at time $t - z/v$, $z$ has at time $t$.`),
    Q(md`Lecture 18's identity $E(z, t) = E(z - vt, 0)$ says…`, ['the snapshot at time t is the t = 0 snapshot moved by vt', 'the wave is standing', 'E does not depend on time', 'the waveform at z equals the waveform at 0'], 0,
      [null, 'A standing wave cannot be written this way.', 'It moves.', 'The waveform at z is delayed.'],
      md`The whole profile slides toward $+z$ by $vt$.`),
    Q(md`$f = 50$ Hz (power line) in vacuum has wavelength…`, ['6000 km', '6 m', '6 km', '60 km'], 0,
      [null, md`$3\times10^8/50 = 6\times10^6$ m.`, 'Recheck the powers of ten.', 'Recheck the powers of ten.'],
      md`$\lambda = c/f = 6\times10^6$ m.`),
    Q(md`A probe at $z = -600$ m records a wave $g(t - z/v)$ with $v = 300$ m/μs. Compared with $z = 0$, it sees each feature…`, ['2 μs earlier', '2 μs later', 'at the same time', 'flipped'], 0,
      [null, md`The wave travels toward $+z$; $z = -600$ m is upstream, so it sees things first.`, 'The probe is 600 m away along the line of travel.', 'A waveform at a fixed z is not flipped.'],
      md`$E(-600, t) = g(t + 2\ \mu\text{s})$: the probe is 2 μs ahead.`),
    Q(md`$\cos(\omega t - \beta z)$ at fixed $t$ has crests separated by…`, [md`$\lambda = 2\pi/\beta$`, md`$T = 2\pi/\omega$`, md`$\beta$`, md`$\lambda/2$`], 0,
      [null, 'That is the separation in time at a fixed z.', md`$\beta$ is in rad/m; the spacing is $2\pi/\beta$.`, 'Crest to crest is a full wavelength.'],
      md`The phase advances by $2\pi$ over $\Delta z = 2\pi/\beta$.`),
    Q(md`A profile at $t_1$ shows the pulse's leading edge at $z = 1200$ m, moving toward $+z$ at 300 m/μs. That edge passed $z = 0$ at…`, [md`$t_1 - 4\ \mu$s`, md`$t_1 + 4\ \mu$s`, md`$4\ \mu$s`, md`$t_1 - 0.25\ \mu$s`], 0,
      [null, 'It passed z = 0 before reaching 1200 m.', md`Measured from $t_1$, not from 0.`, 'Time = distance/speed = 1200/300.'],
      md`$1200/300 = 4\ \mu$s before $t_1$.`),
  ];
})();

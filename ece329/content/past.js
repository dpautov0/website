/* Past Exam 2 papers, blank, with full solutions: Spring 2018 (no key; solved here), Summer 2020, Summer 2019 and its
   conflict version, Summer 2018 and Summer 2017 (handwritten keys, re-derived; every key error is flagged in the solution).
   One card per independent part, with its point value. Figures are redrawn. Every number was checked in Python. */
(function () {
  'use strict';
  const { R, RF, P } = C;
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });   // natural order (letters, circle-one)
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });                 // shuffled
  const N = (lbl, ans, unit, rel = 0.02) => ({ lbl, ans, unit, tol: { rel } });
  const mu0 = EM.mu0, eps0 = EM.eps0, PI = Math.PI;

  // ---------------------------------------------------------------- figure helpers
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 28) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux, s = (L - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + body * (i + 0.5) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(L));
    g.pl(pts);
  }
  // a voltmeter drawn on a wire already in the figure: a disc that covers the wire
  const meter = (g, x, y) => g.circle(x, y, 9, { cls: 'bgfill' });
  // a step-and-ramp curve for PF.plot from corner points
  const poly = (pts) => ({ pts });

  // ---------------------------------------------------------------- Spring 2018 figures
  // 1(iii): the magnet approaching (left) and leaving (right); the arrowhead sits on the near half of the ring
  function magnetPanel(sL, sR, alt) {
    const g = PF.fig({ alt });
    const ringY = 66, rx = 22, ry = 6;
    const one = (cx, top, s, labS, labN) => {
      g.ellipse(cx, ringY, rx, ry, { half: 'back', cls: 'curve' });
      g.rect(cx - 10, top, 20, 32, { cls: 'bgfill' });
      g.rect(cx - 10, top + 32, 20, 32, { cls: 'plane' }); g.rect(cx - 10, top + 32, 20, 32);
      g.text(cx, top + labS, 'S', 'c', 'small'); g.text(cx, top + labN, 'N', 'c', 'small');
      g.ellipse(cx, ringY, rx, ry, { half: 'front', cls: 'curve' });
      g.head(cx + 14, ringY + ry * Math.sqrt(1 - (14 / rx) ** 2), s, 0, { hs: 8 });
      g.arrow(cx, top + 64, cx, top + 80, { cls: 'dim', hs: 5 });
    };
    one(24, 2, sL, 16, 44);             // approaching: the N end reaches the ring
    one(80, 62, sR, 20, 48);            // leaving: the ring is around the S end
    return g.svg();
  }
  const dirWord = (s) => (s > 0 ? 'to the right (counterclockwise from above)' : 'to the left (clockwise from above)');
  function sp18Magnets() {
    const P4 = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
    return PF.row(P4.map(([a, b], k) => ({
      svg: magnetPanel(a, b, `picture ${'abcd'[k]}: approaching, the near side of the ring carries current ${dirWord(a)}; leaving, ${dirWord(b)}`),
      cap: `(${'abcd'[k]})`,
    }))).svg;
  }

  // #2: the torus with one turn drawn, and the cross-section of one turn
  function sp18Torus() {
    const g = PF.fig({ alt: 'a short hollow cylinder: inner radius a, outer radius b, height h. One turn of the coil runs down the outer wall, inward under the bottom, up the inner wall and outward across the top' });
    const cx = 150, yt = 50, yb = 128, R0 = 110, Ry = 26, r0 = 42, ry = 10;
    g.ellipse(cx, yt, R0, Ry);
    g.ellipse(cx, yb, R0, Ry, { half: 'front' });
    g.ellipse(cx, yb, R0, Ry, { half: 'back', cls: 'dash dim thin' });
    g.line(cx - R0, yt, cx - R0, yb); g.line(cx + R0, yt, cx + R0, yb);
    g.ellipse(cx, yt, r0, ry);
    g.line(cx - r0, yt, cx - r0, yb, { cls: 'dash dim thin' }); g.line(cx + r0, yt, cx + r0, yb, { cls: 'dash dim thin' });
    g.ellipse(cx, yb, r0, ry, { cls: 'dash dim thin' });
    const A = 236 * Math.PI / 180;
    const at = (rx, rry, y) => [cx + rx * Math.cos(A), y - rry * Math.sin(A)];
    const o1 = at(R0, Ry, yt), o2 = at(R0, Ry, yb), i1 = at(r0, ry, yt), i2 = at(r0, ry, yb);
    g.line(i1[0], i1[1], o1[0], o1[1], { cls: 'thick' });
    g.line(o1[0], o1[1], o2[0], o2[1], { cls: 'thick' });
    g.line(o2[0], o2[1], i2[0], i2[1], { cls: 'thick dash' });
    g.line(i2[0], i2[1], i1[0], i1[1], { cls: 'thick dash' });
    g.head(o1[0], (o1[1] + o2[1]) / 2 + 6, 0, 1, { hs: 9 });
    g.head(i1[0], (i1[1] + i2[1]) / 2 - 6, 0, -1, { hs: 9 });
    g.head((i1[0] + o1[0]) / 2 - 2, (i1[1] + o1[1]) / 2 + 1, o1[0] - i1[0], o1[1] - i1[1], { hs: 8 });
    g.label(o2[0] - 8, o2[1] + 4, 'I', 'tr');
    g.dim(cx - R0, yt - Ry - 16, cx + R0, yt - Ry - 16, '2b');
    g.dim(cx - r0, yt, cx + r0, yt, '2a', { at: 'b' });
    g.dim(cx + R0 + 18, yt, cx + R0 + 18, yb, 'h');
    g.arrow(cx - R0 - 22, yb, cx - R0 - 22, yb - 34, { hs: 6 }); g.label(cx - R0 - 22, yb - 38, 'z', 'b', 'small');
    return g.svg();
  }
  function sp18Cross() {
    const g = PF.fig({ alt: 'cross-section of one turn: a rectangle from r = a to r = b and z = 0 to z = h. The current runs up the inner side, outward along the top, down the outer side and inward along the bottom: clockwise in this view. phi-hat points into the page' });
    const x0 = 50, x1 = 120, y0 = 30, y1 = 130;
    g.loopRect(x0, y0, x1 - x0, y1 - y0, { dir: 'cw' });
    g.label(x0 - 8, (y0 + y1) / 2, 'I', 'r');
    g.label(x0 - 6, y0, 'z = h', 'r', 'small'); g.label(x0 - 6, y1, 'z = 0', 'r', 'small');
    g.label(x0, y1 + 8, 'r = a', 't', 'small'); g.label(x1, y1 + 8, 'r = b', 't', 'small');
    g.arrow(x1 + 18, y1, x1 + 50, y1, { cls: 'dim', hs: 6 }); g.label(x1 + 54, y1, 'r', 'l', 'small');
    g.otimes(x1 + 34, y0 + 10, 6, { lab: '\\hat\\phi\\ \\text{(into page)}', at: 'b' });
    return g.svg();
  }

  // #3: the parallel-plate line, x up, z right, y out of the page
  function sp18Line() {
    const g = PF.fig({ alt: 'two parallel plates a distance d apart and length l along z; a current source I at the left end drives current up between the plates; the right end is shorted. Axes: x up, z to the right, y out of the page' });
    g.arrow(30, 96, 30, 50, { hs: 7 }); g.label(30, 46, 'x', 'b');
    g.arrow(30, 96, 76, 96, { hs: 7 }); g.label(80, 96, 'z', 'l');
    g.odot(30, 96, 7); g.label(20, 106, 'y', 'tr');
    const xa = 140, xb = 330, yt = 50, yb = 100;
    g.line(xa, yt, xb, yt, { cls: 'thick' }); g.line(xa, yb, xb, yb, { cls: 'thick' });
    g.line(xb, yt, xb, yb);
    g.line(xa, yt, 122, yt); g.line(122, yt, 122, 64); g.line(122, 86, 122, yb); g.line(122, yb, xa, yb);
    g.circle(122, 75, 11); g.arrow(122, 82, 122, 68, { hs: 6 });
    g.label(106, 75, 'I', 'r');
    g.dim(210, yt, 210, yb, 'd');
    g.dim(xa, yb + 16, xb, yb + 16, 'l', { at: 'b' });
    return g.svg();
  }

  // #4: the decaying profile with its step at x0 (m)
  const prof4 = (x0) => { const pts = [[-200, 0], [x0, 0], [x0, 3]]; for (let x = x0; x <= 600; x += 4) pts.push([x, 3 * Math.exp(-(x - x0) / 50)]); return pts; };
  const xt4 = [-200, -100, 0, 100, 200, 300, 400, 500, 600].map((v) => [v, v % 200 === 0 ? String(v) : '']);
  function sp18E(curves) {
    return PF.plot({ w: 340, h: 200, x: [-200, 600], y: [0, 3.4], xl: 'x\\,(\\text{m})', yl: 'E_z\\,(\\text{V/m})', xt: xt4, yt: [[1, '1'], [2, '2'], [3, '3']], curves });
  }

  // #5: the sheet current waveform, and H_z(y) at t = 5 ns
  function sp18Js() {
    return PF.plot({ w: 300, h: 200, x: [0, 5], y: [-5, 5], zero: true, xl: 't\\,(\\text{ns})', yl: 'J_s(t)\\,(\\text{A/m})',
      xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[4, '4'], [-4, '-4']],
      curves: [poly([[0, 0], [1, 0], [2, 4], [3, -4], [4, -4], [4, 0], [5, 0]])] });
  }
  function sp18H5() {
    return PF.plot({ w: 400, h: 210, x: [-1.5, 1.5], y: [-2.6, 2.6], zero: true, xl: 'y\\,(\\text{m})', yl: 'H_z\\,(\\text{A/m})',
      xt: [-1.2, -0.9, -0.6, -0.3, 0.3, 0.6, 0.9, 1.2].map((v) => [v, String(v)]), yt: [[2, '2'], [-2, '-2']],
      curves: [poly([[-1.5, 0], [-1.2, 0], [-0.9, 2], [-0.6, -2], [-0.3, -2], [-0.3, 0], [0.3, 0], [0.3, 2], [0.6, 2], [0.9, -2], [1.2, 0], [1.5, 0]])] });
  }

  // ---------------------------------------------------------------- Summer figures
  function s20Plates() {
    const g = PF.fig({ alt: 'two horizontal conducting plates: z = 0 carries −2 C/m² on its top face, z = 2 m carries +2 C/m² on its bottom face; free space for 0 < z < 1 m, a dielectric with ε = 2ε0 for 1 < z < 2 m' });
    const x0 = 70, x1 = 250, Y = (z) => 150 - z * 52;
    g.rect(x0, Y(2), x1 - x0, Y(1) - Y(2), { cls: 'shade' });
    g.line(x0, Y(1), x1, Y(1), { cls: 'dim dash' });
    g.plane(x0, x1, Y(0), { side: 'below' });
    g.plane(x0, x1, Y(2), { side: 'above' });
    g.label(x1 + 6, Y(2), '+2\\ \\text{C/m}^2', 'l', 'small');
    g.label(x1 + 6, Y(0), '-2\\ \\text{C/m}^2', 'l', 'small');
    g.label((x0 + x1) / 2, Y(1.5), '\\epsilon = 2\\epsilon_0', 'c');
    g.label((x0 + x1) / 2, Y(0.5), '\\epsilon_0', 'c');
    g.label(x0 - 6, Y(0), 'z = 0', 'r', 'small'); g.label(x0 - 6, Y(1), 'z = 1', 'r', 'small'); g.label(x0 - 6, Y(2), 'z = 2\\,\\text{m}', 'r', 'small');
    return g.svg();
  }
  function s20Wires() {
    const g = PF.fig({ alt: 'the xy-plane: a 2 A line current along +x on the x-axis and a 4 A line current along −y on the y-axis; the point (1, 1, 0) is marked; z points out of the page' });
    const ox = 110, oy = 120, s = 50;
    g.line(ox - 90, oy, ox + 120, oy, { cls: 'thick' }); g.head(ox + 80, oy, 1, 0, { hs: 10 });
    g.line(ox, oy - 100, ox, oy + 70, { cls: 'thick' }); g.head(ox, oy + 52, 0, 1, { hs: 10 });
    g.label(ox + 124, oy, 'x', 'l', 'small accent'); g.label(ox, oy - 104, 'y', 'b', 'small accent');
    g.label(ox + 78, oy + 8, '2\\ \\text{A}', 't', 'small'); g.label(ox - 8, oy + 50, '4\\ \\text{A}', 'r', 'small');
    g.dot(ox + s, oy - s, 3); g.label(ox + s + 6, oy - s - 4, '(1,1,0)', 'bl', 'small');
    g.line(ox + s, oy - s, ox + s, oy, { cls: 'dim dash thin' }); g.line(ox + s, oy - s, ox, oy - s, { cls: 'dim dash thin' });
    g.odot(ox - 70, oy - 80, 6, { lab: 'z', at: 'r' });
    return g.svg();
  }
  function s20Loop() {
    const g = PF.fig({ alt: 'the 1 m square loop in the xy-plane, centered at the origin, moving along +x at 4 m/s; B points out of the page (+z) and grows slowly with x; the induced current circulates clockwise' });
    g.marks('dot', 24, 22, 196, 138, 8, 6, { r: 1.8 });
    g.loopRect(60, 30, 100, 100, { dir: 'cw' });
    g.arrow(160, 80, 214, 80, { hs: 7 }); g.label(218, 80, '\\mathbf v = 4\\hat x\\ \\text{m/s}', 'l', 'small');
    g.label(110, 150, '\\mathbf B = B_z(x)\\,\\hat z\\ \\text{(out of the page)}', 't', 'small');
    g.label(164, 136, 'I', 'tl');
    return g.svg();
  }
  // slabs of current seen edge-on: [[x1, x2, sign], ...]; sign +1 out of the page, −1 into it
  function slabs(spec, axis, labs, alt) {
    const g = PF.fig({ alt });
    const X = (x) => 150 + x * 38, y0 = 34, y1 = 108;
    spec.forEach(([a, b, s], k) => {
      g.rect(X(a), y0, X(b) - X(a), y1 - y0, { cls: 'shade' });
      const n = Math.max(1, Math.round(b - a));
      for (let i = 0; i < n; i++) for (const yy of [48, 71, 94]) {
        const xx = X(a) + (X(b) - X(a)) * (i + 0.5) / n;
        if (s > 0) g.odot(xx, yy, 4.5); else g.otimes(xx, yy, 4.5);
      }
      g.label((X(a) + X(b)) / 2, y0 - 4, labs[k], 'b', 'small');
    });
    g.arrow(X(-3.7), 122, X(3.7), 122, { cls: 'dim', hs: 6 }); g.label(X(3.7) + 4, 122, axis, 'l', 'small accent');
    for (const v of [-3, -2, -1, 0, 1, 2, 3]) { g.line(X(v), 118, X(v), 126, { cls: 'dim' }); g.label(X(v), 129, String(v), 't', 'small accent'); }
    return g.svg();
  }
  // H(x) of slabs (and an optional sheet) as a plot
  function hPlot(pts, axis, comp, y = [-1.6, 5.6]) {
    return PF.plot({ w: 340, h: 210, x: [-3.5, 3.5], y, zero: true, xl: `${axis}\\,(\\text{m})`, yl: `${comp}\\,(\\text{A/m})`,
      xt: [-3, -2, -1, 1, 2, 3].map((v) => [v, String(v)]), yt: [[-1, '-1'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']].filter(([v]) => v >= y[0] && v <= y[1]),
      curves: [poly(pts)] });
  }

  // Summer 2018 #1(a): the Ampère contours, top view
  function s18Amp() {
    const g = PF.fig({ alt: 'top view: the current-carrying cylinder of radius a (shaded), J out of the page; the Ampère contours are circles centered on the axis, one inside (r < a) and one outside (r > a), both counterclockwise' });
    const cx = 110, cy = 100;
    g.circle(cx, cy, 50, { cls: 'shade' }); g.circle(cx, cy, 50, { cls: 'dim' });
    g.loopCirc(cx, cy, 28, { dir: 'ccw', cls: 'dash' });
    g.loopCirc(cx, cy, 76, { dir: 'ccw', cls: 'dash' });
    g.odot(cx, cy, 5);
    g.label(cx + 22, cy + 20, 'r < a', 'tl', 'small');
    g.label(cx + 58, cy - 58, 'r > a', 'bl', 'small');
    g.dim(cx, cy, cx - 50, cy, 'a', { at: 't' });
    return g.svg();
  }
  // Summer 2018 #1(b): line current P along z and sheet Q along x on z = 0
  function s18Sys() {
    const g = PF.fig({ alt: '3-D sketch: a line current P along +z on the z-axis, and a surface current Q along +x filling the plane z = 0 (arrows on the plane point along +x, toward the viewer and to the left)' });
    g.setProj(150, 120, 1, 0.55, 215);
    const c = [[-80, -100], [80, -100], [80, 100], [-80, 100]].map(([x, y]) => g.p3(x, y, 0));
    g.poly(c, { cls: 'plane' }); g.poly(c, { cls: 'dim thin' });
    for (const y of [-70, -25, 25, 70]) { const a = g.p3(-55, y, 0), b = g.p3(55, y, 0); g.arrow(a[0], a[1], b[0], b[1], { hs: 7 }); }
    const z0 = g.p3(0, 0, -40), z1 = g.p3(0, 0, 100);
    g.line(z0[0], z0[1], z1[0], z1[1], { cls: 'thick', arrow: 'end', hs: 9 });
    g.label(z1[0] + 6, z1[1] + 6, 'P\\,\\hat z', 'l');
    const xl = g.p3(110, 0, 0), yl = g.p3(0, 125, 0);
    g.label(xl[0], xl[1], 'x', 'c', 'small accent'); g.label(yl[0], yl[1], 'y', 'c', 'small accent');
    const ql = g.p3(80, 100, 0); g.label(ql[0] + 6, ql[1], 'Q\\,\\hat x\\ \\text{on}\\ z = 0', 'l', 'small');
    return g.svg();
  }
  // Summer 2018 #2: loop orientations relative to B along y
  function s18Orient(kind) {
    const g = PF.fig({ alt: kind === 'zero' ? 'the loop lies flat in the xy-plane; B points along +y, in the plane of the loop, so no flux crosses it' : 'the loop stands in the xz-plane, facing B, which points along +y through it' });
    g.setProj(80, 90, 1, 0.55, 215);
    const sq = kind === 'zero' ? [[-34, -34, 0], [34, -34, 0], [34, 34, 0], [-34, 34, 0]] : [[-34, 0, -34], [-34, 0, 34], [34, 0, 34], [34, 0, -34]];
    const pts = sq.map((p) => g.p3(...p));
    g.poly(pts, { cls: 'plane' }); g.poly(pts, { cls: 'thick' });
    for (const z of [-22, 0, 22]) { const a = g.p3(0, -70, z), b = g.p3(0, 70, z); g.arrow(a[0], a[1], b[0], b[1], { cls: 'dim', hs: 6 }); }
    const bl = g.p3(0, 74, 22); g.label(bl[0] + 4, bl[1], '\\mathbf B', 'l', 'small');
    const v0 = kind === 'zero' ? g.p3(34, 40, 0) : g.p3(34, 0, -34), v1 = kind === 'zero' ? g.p3(84, 40, 0) : g.p3(84, 0, -34);
    g.arrow(v0[0], v0[1], v1[0], v1[1], { hs: 7 }); g.label(v1[0] - 4, v1[1] + 2, '\\mathbf v', 'tr', 'small');
    return g.svg();
  }
  // Summer 2018 #3: the square with voltmeters V1 (left side) and V2 (right side); diag adds V3 on the diagonal
  function s18Volt(diag) {
    const g = PF.fig({ alt: 'a 2 m by 2 m square from O = (0,0) to P = (2,2). Voltmeter V1 sits in the left side and V2 in the right side, each with + at the top. B = −3t z (into the page) fills the square.' + (diag ? ' Voltmeter V3 sits on the diagonal from O to P, + toward P.' : '') });
    const X = (x) => 60 + x * 55, Y = (y) => 170 - y * 55;
    for (const x of [0.4, 1, 1.6]) for (const y of [0.4, 1, 1.6]) if (!diag || (Math.abs(x - y) > 0.3 && y !== 1)) g.marks('x', X(x), Y(y), X(x), Y(y), 1, 1, { r: 2.6 });
    g.rect(X(0), Y(2), X(2) - X(0), Y(0) - Y(2), { cls: 'thick' });
    meter(g, X(0), Y(1)); meter(g, X(2), Y(1));
    g.label(X(0) - 13, Y(1), 'V_1', 'r'); g.label(X(2) + 13, Y(1), 'V_2', 'l');
    for (const x of [0, 2]) { const dx = x ? 13 : -13, an = x ? 'l' : 'r'; g.label(X(x) + dx, Y(1) - 17, '+', an, 'small'); g.label(X(x) + dx, Y(1) + 17, '-', an, 'small'); }
    g.dot(X(0), Y(0), 3.2); g.dot(X(2), Y(2), 3.2);
    g.label(X(0) - 6, Y(0) + 6, 'O', 'tr'); g.label(X(2) + 6, Y(2) - 6, 'P', 'bl');
    if (diag) {
      g.line(X(0), Y(0), X(2), Y(2), { cls: 'dash' });
      meter(g, X(1), Y(1)); g.label(X(1) - 12, Y(1) + 8, 'V_3', 'tr');
      g.label(X(1) - 2, Y(1) - 14, '+', 'br', 'small'); g.label(X(1) + 2, Y(1) + 14, '-', 'tl', 'small');
    }
    return g.svg();
  }

  // Summer 2017 #1(a): line currents along z and along x
  function s17Lines() {
    const g = PF.fig({ alt: '3-D sketch: a line current I0 along +z on the z-axis and a line current I0 along +x on the x-axis; the point (1, 0, −1) is marked below the x-axis' });
    g.setProj(140, 110, 1, 0.55, 215);
    g.axes3(110, { labels: ['x', 'y', 'z'] });
    const z0 = g.p3(0, 0, -80), z1 = g.p3(0, 0, 60), x0 = g.p3(-60, 0, 0), x1 = g.p3(90, 0, 0);
    g.line(z0[0], z0[1], z1[0], z1[1], { cls: 'thick', arrow: 'end', hs: 9 });
    g.line(x0[0], x0[1], x1[0], x1[1], { cls: 'thick', arrow: 'end', hs: 9 });
    g.label(z1[0] - 6, z1[1] + 6, 'I_0', 'r');
    g.label(x1[0] + 2, x1[1] - 12, 'I_0', 'l');
    const p = g.p3(60, 0, -60); g.dot(p[0], p[1], 3);
    g.label(p[0] - 6, p[1] + 4, '(1, 0, -1)', 'tr', 'small');
    return g.svg();
  }
  // Summer 2017 #2(b): the big loop and the small loop rising along its axis (not to scale)
  function s17Loops() {
    const g = PF.fig({ alt: 'side view, not to scale: a loop of radius a1 in the xy-plane carrying I counterclockwise seen from above; far up the z-axis, near z = 100 m, a small loop of radius a2 encircling the axis moves up at 1 m/s' });
    const cx = 110;
    g.line(cx, 180, cx, 18, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(cx + 4, 14, 'z', 'bl', 'small accent');
    g.ellipse(cx, 150, 60, 12, { half: 'back' }); g.ellipse(cx, 150, 60, 12, { half: 'front' });
    g.head(cx + 10, 150 + 12 * Math.sqrt(1 - (10 / 60) ** 2), 1, 0, { hs: 8 });
    g.label(cx + 64, 150, 'I,\\ a_1 = 1\\,\\text{m}', 'l', 'small');
    g.ellipse(cx, 60, 14, 3.5);
    g.arrow(cx + 26, 70, cx + 26, 40, { hs: 6 }); g.label(cx + 30, 52, '1\\ \\text{m/s}', 'l', 'small');
    g.label(cx - 18, 60, 'a_2 = 1\\,\\text{cm}', 'r', 'small');
    g.label(cx - 18, 82, 'z \\approx 100\\,\\text{m}', 'r', 'small');
    g.line(cx - 12, 108, cx + 12, 100, { cls: 'thin' }); g.line(cx - 12, 116, cx + 12, 108, { cls: 'thin' });     // axis break: not to scale
    return g.svg();
  }
  // Summer 2017 #3: R1 left, R2 top, R3 right, plain wire at the bottom; A top right, B bottom left; C counterclockwise
  function s17Circuit(diag) {
    const g = PF.fig({ alt: 'a 1 m by 1 m square loop in the xy-plane: R1 on the left side, R2 on the top, R3 on the right side, a plain wire along the bottom. A is the top-right corner, B the bottom-left. C runs counterclockwise (up the right side). B0 z fills the square.' + (diag ? ' A voltmeter sits on the diagonal from A (+) to B (−).' : '') });
    const x0 = 50, x1 = 170, y0 = 30, y1 = 150;
    for (const u of [0.22, 0.5, 0.78]) for (const v of [0.22, 0.5, 0.78]) if (!diag || Math.abs(u - v) > 0.2) g.dot(x0 + u * (x1 - x0), y1 - v * (y1 - y0), 2, { cls: 'dimfill' });
    zig(g, x0, y1, x0, y0); zig(g, x0, y0, x1, y0); zig(g, x1, y0, x1, y1); g.line(x1, y1, x0, y1);
    g.head(x1, y1 - 18, 0, -1, { hs: 8 }); g.label(x1 + 8, y1 - 18, 'C', 'l');
    g.label(x0 - 10, (y0 + y1) / 2, 'R_1', 'r'); g.label((x0 + x1) / 2, y0 - 10, 'R_2', 'b'); g.label(x1 + 10, (y0 + y1) / 2, 'R_3', 'l');
    g.dot(x1, y0, 3.2); g.dot(x0, y1, 3.2); g.label(x1 + 6, y0 - 6, 'A', 'bl'); g.label(x0 - 6, y1 + 6, 'B', 'tr');
    if (diag) {
      g.line(x0, y1, x1, y0, { cls: 'dash' });
      meter(g, (x0 + x1) / 2, (y0 + y1) / 2);
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      g.label(mx + 2, my - 14, '+', 'bl', 'small'); g.label(mx - 2, my + 14, '-', 'tr', 'small');
      g.label(mx + 12, my + 8, '\\text{V}', 'tl', 'small');
    }
    return g.svg();
  }

  // ================================================================ Spring 2018
  const sp18 = [
    R(md`
      **Spring 2018 · ECE 329 · Exam 2.** Wednesday, March 14, 2018, 7:15–8:30 PM (75 minutes). Five problems, 100 points. Closed book; no calculators or electronic devices; two double-sided 3″×5″ index cards of notes. Show your work and reasoning, with units on every answer. In Problem 1 only the letter counts: no work needed, no partial credit.

      There is no official key. Every answer here was derived from scratch and checked numerically.

      **What it tests.** Forces between currents ([Topic 4](#/l/t4-force)); Faraday and Lenz ([Topic 8](#/l/t8-faraday)); charge conservation inside Ampère–Maxwell ([Topic 12](#/l/t12-displacement)); potentials ([Topic 7](#/l/t7-flux)); the H boundary condition at a current sheet ([Topic 13](#/l/t13-materials)); flux, linkage and inductance of a toroid and a parallel-plate line ([Topic 6](#/l/t6-sheets), [Topic 11](#/l/t11-inductance)); traveling waveforms ([Topic 14](#/l/t14-wave-eq)); waves launched by a sheet ([Topic 15](#/l/t15-sheet-waves)); wavelength from phase ([Topic 16](#/l/t16-sinusoids)).

      **How to use it.** Set a 75-minute timer and work on paper first. Then enter your answers: every wrong choice explains itself, and each solution is written the way a grader wants to see it.
    `),
    R(md`
      ### Problem 1 (21 points): multiple choice

      Seven questions, 3 points each. Circle one letter.
    `),
    P({ src: 'Spring 2018 #1(i) · 3 pts', title: 'Parallel currents',
      q: md`Two parallel wires lie in the $xy$-plane and carry currents $I_1 > 0$ and $I_2 > 0$ in the same direction. The wires…`,
      parts: [FIX('', ['(a) experience an attractive force', '(b) experience a repulsive force', '(c) experience a force in the $z$ direction', '(d) experience no force between them', '(e) none of these'], 0,
        [null, md`Repulsion is for antiparallel currents.`, md`Wire 1's $\mathbf B$ at wire 2 is along $\pm\hat z$; $I\,d\mathbf l\times\mathbf B$ with $d\mathbf l$ in the plane and $\mathbf B$ along $z$ lies **in** the plane.`, md`Each wire sits in the other's field, $\mu_0I/2\pi d$, so the force per length is $\mu_0I_1I_2/2\pi d$.`, md`(a) is correct.`])],
      sol: md`Put wire 1 on the $x$-axis and wire 2 at $y = d$, both along $+\hat x$. Wire 1's field at wire 2 (RHR: thumb along $+\hat x$, fingers come out of the page at $y > 0$):
$$\mathbf B_1 = \frac{\mu_0I_1}{2\pi d}\hat z$$
Force per length on wire 2: $\mathbf F/\ell = I_2\hat x\times\mathbf B_1 = -\dfrac{\mu_0I_1I_2}{2\pi d}\hat y$, toward wire 1. **(a) attractive.** Parallel currents attract, antiparallel currents repel: the opposite of like charges.` }),
    P({ src: 'Spring 2018 #1(ii) · 3 pts', title: 'Current in a loop',
      q: md`The magnetic flux density increases at the rate $\partial\mathbf B/\partial t = 10\,\hat z$ T/s. A 10 cm by 10 cm square conducting loop, centered at the origin in the $xy$-plane, has $10\ \Omega$ of distributed resistance. The **magnitude** of the induced current is…`,
      parts: [FIX('', ['(a) 1 mA', '(b) 10 mA', '(c) 0.1 mA', '(d) 100 mA', '(e) none of these'], 1,
        [md`1 mA would need an emf of 0.01 V: an extra factor of 10 lost somewhere.`, null, md`0.1 mA would need an area of $10^{-4}\,\text{m}^2$ (1 cm × 1 cm). 10 cm × 10 cm is $0.01\,\text{m}^2$.`, md`100 mA would need 1 V: an area of $0.1\,\text{m}^2$.`, md`(b) is in the list.`])],
      sol: md`$$|\emf| = A\left|\frac{\partial B_z}{\partial t}\right| = (0.1\,\text{m})^2(10\,\text{T/s}) = 0.1\ \text{V}, \qquad |I| = \frac{|\emf|}{R} = \frac{0.1\,\text{V}}{10\,\Omega} = 10\ \text{mA}$$
**(b).** Direction (not asked): the upward flux grows, so the current makes downward $\mathbf B$ inside: clockwise seen from $+z$.` }),
    P({ src: 'Spring 2018 #1(iii) · 3 pts', title: 'Falling magnet',
      q: md`A bar magnet, north end down, is dropped through a horizontal conducting ring. Each picture shows the magnet twice: approaching the ring (left) and leaving it (right). The arrowhead on the near half of the ring marks the induced current. Circle the one correct picture.

[[fig:m]]`,
      figs: { m: { svg: sp18Magnets(), cap: 'An arrowhead pointing right on the near half of the ring means counterclockwise seen from above.' } },
      parts: [FIX('', ['(a)', '(b)', '(c)', '(d)'], 1,
        [md`Right while approaching, but the current must reverse after the magnet passes: the downward flux is then shrinking, not growing.`, null, md`Wrong while approaching: clockwise from above makes downward $\mathbf B$, which adds to the growing downward flux. (It is right while leaving.)`, md`Both directions are reversed: this picture has the ring helping the change both times.`])],
      sol: md`Field lines leave the N pole, so at the ring (below the magnet and inside it) $\mathbf B$ points **down**.

**Approaching** (left): the downward flux grows. Lenz: the induced $\mathbf B$ points up inside the ring, so the current is counterclockwise from above: the near side carries it **to the right**.

**Leaving** (right): the magnet is below the ring and moving away; the downward flux shrinks. The induced $\mathbf B$ points down: clockwise from above, near side **to the left**.

Only **(b)** shows right, then left.` }),
    P({ src: 'Spring 2018 #1(iv) · 3 pts', title: 'Charge conservation',
      q: md`The current density is $\mathbf J = 0$ within a certain volume of free space. In this volume, which statement **must** be true of the electric displacement $\mathbf D$?`,
      parts: [FIX('', [md`(a) $\partial\mathbf D/\partial t = 0$`, md`(b) $\partial(\nabla\cdot\mathbf D)/\partial t = 0$`, md`(c) $\nabla\cdot\mathbf D = 0$`, md`(d) $\mathbf D = 0$`, '(e) none of the above'], 1,
        [md`$\mathbf D$ can change with $\mathbf J = 0$: that is displacement current, which is what a passing wave is made of.`, null, md`Static charge may sit in the volume. $\mathbf J = 0$ forbids the charge density from **changing**, not from existing.`, md`A charge, or a passing wave, gives $\mathbf D \ne 0$ with no current.`, md`(b) always holds.`])],
      sol: md`Take the divergence of Ampère–Maxwell, $\nabla\times\mathbf H = \mathbf J + \partial\mathbf D/\partial t$. The divergence of a curl is zero:
$$0 = \nabla\cdot\mathbf J + \frac{\partial}{\partial t}(\nabla\cdot\mathbf D)\quad\Rightarrow\quad\frac{\partial(\nabla\cdot\mathbf D)}{\partial t} = 0\ \text{ when }\mathbf J = 0$$
**(b).** Same thing in words: $\nabla\cdot\mathbf D = \rho$ (Gauss) and $\partial\rho/\partial t = -\nabla\cdot\mathbf J = 0$ (continuity). The charge density can be anything, but it cannot change.` }),
    P({ src: 'Spring 2018 #1(v) · 3 pts', title: 'Fields from potentials',
      q: md`The scalar and vector potentials are $\Phi = 3x^2$ V and $\mathbf A = -6xt\,\hat x + 3y\,\hat y$ V·s/m. Then the electric field and the magnetic flux density satisfy…`,
      parts: [FIX('', ['(a) both $\\mathbf E$ and $\\mathbf B$ are zero everywhere for all time', '(b) $\\mathbf E$ is constant in time but varies with position; $\\mathbf B$ is constant in position but varies with time', '(c) $\\mathbf E$ is constant in time but varies with position; $\\mathbf B$ is constant in time but varies with position', '(d) $\\mathbf E$ is constant in position but varies with time; $\\mathbf B$ is constant in position but varies with time', '(e) $\\mathbf E$ is constant in position but varies with time; $\\mathbf B$ is constant in time but varies with position', '(f) none of the above'], 0,
        [null, md`$-\nabla\Phi = -6x\hat x$ alone varies with position, but $-\partial\mathbf A/\partial t = +6x\hat x$ cancels it exactly. And $\nabla\times\mathbf A = 0$.`, md`Same cancellation in $\mathbf E$. $\mathbf B = \nabla\times\mathbf A = 0$: $A_x$ depends only on $x$, $A_y$ only on $y$.`, md`$\mathbf E$ is not only $-\partial\mathbf A/\partial t$; adding $-\nabla\Phi$ cancels it. $\mathbf B = 0$.`, md`Both fields vanish: $\mathbf E$ by cancellation, $\mathbf B$ because $\mathbf A$ has no curl.`, md`(a) is listed.`])],
      sol: md`$$\mathbf E = -\nabla\Phi - \frac{\partial\mathbf A}{\partial t} = -6x\,\hat x - (-6x\,\hat x) = 0$$
$\mathbf B = \nabla\times\mathbf A$: the $z$-component is $\partial A_y/\partial x - \partial A_x/\partial y = 0 - 0$, and the $x$, $y$ components need $A_z$ or a $z$-dependence, which $\mathbf A$ does not have. So $\mathbf B = 0$. **(a).** These potentials describe no field at all (a gauge choice).` }),
    P({ src: 'Spring 2018 #1(vi) · 3 pts', title: 'H across a current sheet',
      q: md`A sheet current $\mathbf J_s = 2\hat y$ A/m lies on the plane $z = 0$, surrounded by free space. In $z < 0$, $\mathbf H = 3\hat z$ A/m. In $z > 0$, $\mathbf H$ is…`,
      parts: [FIX('', [md`(a) $\mathbf H = 1\hat z$ A/m`, md`(b) $\mathbf H = 5\hat z$ A/m`, md`(c) $\mathbf H = -2\hat x + 3\hat z$ A/m`, md`(d) $\mathbf H = 2\hat x + 3\hat z$ A/m`, md`(e), (f) $\mathbf H = -2\hat y + 3\hat z$ A/m (printed twice on the paper)`], 3,
        [md`The sheet changes the **tangential** H. $H_z$ is normal to the sheet and continuous (because $B_z$ is), so it stays 3.`, md`The sheet changes the **tangential** H. $H_z$ is normal to the sheet and continuous (because $B_z$ is), so it stays 3.`, md`Sign error: $\hat z\times(-2\hat x) = -2\hat y$, the opposite of $\mathbf J_s$.`, null, md`The jump in H is perpendicular to $\mathbf J_s$, never along it.`])],
      sol: md`Boundary condition with $\hat n = \hat z$ (from $z < 0$ into $z > 0$): $\hat z\times(\mathbf H_2 - \mathbf H_1) = \mathbf J_s = 2\hat y$, and $H_{2z} = H_{1z} = 3$ (both sides are free space, $B_z$ continuous).

Write $\Delta\mathbf H = \Delta H_x\hat x + \Delta H_y\hat y$: $\hat z\times\Delta\mathbf H = \Delta H_x\hat y - \Delta H_y\hat x = 2\hat y$, so $\Delta H_x = 2$, $\Delta H_y = 0$.

**$\mathbf H_2 = 2\hat x + 3\hat z$ A/m: (d).** Check with the sheet's own field, $\frac12\mathbf J_s\times\hat n$: $+\hat x$ above, $-\hat x$ below, a jump of $2\hat x$ ✓. (The paper prints options (e) and (f) identically.)` }),
    P({ src: 'Spring 2018 #1(vii) · 3 pts', title: 'Wavelength from a phase change',
      q: md`A wave propagates in free space. An instrument observes its phase change by $3\pi$ radians in a 10 μs interval. The wavelength of the wave is approximately…`,
      parts: [FIX('', ['(a) 0.1 m', '(b) 0.5 m', '(c) 2 m', '(d) 5 m', '(e) 2000 m', '(f) none of these'], 4,
        [md`0.1 m is a 3 GHz wave; here $f = 150$ kHz.`, md`0.5 m is a 600 MHz wave; here $f = 150$ kHz.`, md`2 m is what you get by reading 10 μs as 10 ns: off by 1000.`, md`5 m is a 60 MHz wave; here $f = 150$ kHz.`, null, md`$\lambda = 2000$ m is listed: (e). (Dropping the $\pi$, i.e. reading the phase change as 3 rad, gives 6.3 km and would lead here.)`])],
      sol: md`The phase advances at the angular frequency:
$$\omega = \frac{\Delta\phi}{\Delta t} = \frac{3\pi}{10^{-5}\,\text{s}} = 3\pi\times10^5\ \text{rad/s}, \qquad f = \frac{\omega}{2\pi} = 1.5\times10^5\ \text{Hz}$$
$$\lambda = \frac{c}{f} = \frac{3\times10^8\,\text{m/s}}{1.5\times10^5\,\text{Hz}} = 2000\ \text{m}$$
**(e).** Check: one full cycle ($2\pi$) takes $\frac{2}{3}\times10\,\mu\text{s} = 6.7\,\mu$s, and light covers 2000 m in that time ✓.` }),

    RF(md`
      ### Problem 2 (20 points): toroidal coil

      A coil of $N$ turns is wound uniformly on a torus of rectangular cross-section: inner radius $a$, outer radius $b$, height $h$. The turns go all the way around the torus. The current $I$ in the coil produces, inside the core ($a < r < b$, $0 < z < h$),
      $$\mathbf B = \frac{\mu_0NI}{2\pi r}\hat\phi$$
      where $r$ is the distance from the axis of the coil.

      [[fig:t]]
    `, { t: PF.row([{ svg: sp18Torus(), cap: 'One of the N turns; the hidden parts are dashed.' }, { svg: sp18Cross(), cap: 'View of 1 loop: the current is clockwise in this view.' }]) }),
    P({ src: 'Spring 2018 #2(a) · 10 pts', title: 'Flux through one turn',
      q: md`(a) Find the magnetic flux through one turn of the coil, $\psi_1$.`,
      parts: [MC('', [md`$\psi_1 = \dfrac{\mu_0NIh}{2\pi}\ln\dfrac ba$ Wb`, md`$\psi_1 = \dfrac{\mu_0NIh(b - a)}{2\pi a}$ Wb`, md`$\psi_1 = \dfrac{\mu_0NIh}{2\pi}\left(\dfrac1a - \dfrac1b\right)$ Wb`, md`$\psi_1 = \dfrac{\mu_0N^2Ih}{2\pi}\ln\dfrac ba$ Wb`, md`$\psi_1 = 0$: $\mathbf B$ runs along the turns`], 0,
        [null, md`That treats B as uniform at its $r = a$ value. B falls as $1/r$ across the cross-section: integrate.`, md`That integrates $1/r^2$. The turn is a flat rectangle in the $r$–$z$ plane, $dS = dr\,dz$ (no extra $r$), so the integrand is $1/r$.`, md`That is the linkage of all $N$ turns, part (b).`, md`$\mathbf B$ is along $\hat\phi$, which is the **normal** of a turn's $r$–$z$ rectangle: it crosses each turn face-on.`])],
      hints: [md`One turn spans the rectangle $a < r < b$, $0 < z < h$ at fixed $\phi$: $d\mathbf S = \hat\phi\,dr\,dz$.`, md`$B$ depends on $r$ only: $\psi_1 = h\displaystyle\int_a^b\frac{\mu_0NI}{2\pi r}\,dr$.`],
      sol: md`**Surface.** One turn bounds the rectangle $a < r < b$, $0 < z < h$ at fixed $\phi$. Take $C$ along the current (clockwise in the "view of 1 loop", with $\hat\phi$ into the page); the RHR gives $d\mathbf S = \hat\phi\,dr\,dz$, along $\mathbf B$.
$$\psi_1 = \int_0^h\!\!\int_a^b\frac{\mu_0NI}{2\pi r}\,dr\,dz = \frac{\mu_0NIh}{2\pi}\ln\frac ba\ \ \text{Wb}$$
Units: (H/m)(A)(m) = H·A = Wb ✓. The $\ln$ comes from $B \propto 1/r$; for a thin torus ($b - a \ll a$) it reduces to $B(a)\cdot h(b - a)$.` }),
    P({ src: 'Spring 2018 #2(b) · 4 pts', title: 'Flux linkage',
      q: md`(b) Find the flux threading the whole coil of $N$ turns (the flux linkage), $\psi_N$.`,
      parts: [MC('', [md`$\psi_N = \dfrac{\mu_0N^2Ih}{2\pi}\ln\dfrac ba$ Wb`, md`$\psi_N = \dfrac{\mu_0NIh}{2\pi}\ln\dfrac ba$ Wb`, md`$\psi_N = \dfrac{\mu_0N^3Ih}{2\pi}\ln\dfrac ba$ Wb`, md`$\psi_N = \dfrac{\mu_0Ih}{2\pi}\ln\dfrac ba$ Wb`], 0,
        [null, md`That is one turn. Each of the $N$ turns links $\psi_1$, and the linkages add.`, md`One $N$ is already in $B$, the other counts the turns: $N^2$, not $N^3$.`, md`Dividing by $N$ undoes the field's $N$; the linkage multiplies by $N$.`])],
      sol: md`Every turn links the same $\psi_1$, so
$$\psi_N = N\psi_1 = \frac{\mu_0N^2Ih}{2\pi}\ln\frac ba\ \ \text{Wb}$$
Dividing by $I$ gives the toroid's inductance, $L = \dfrac{\mu_0N^2h}{2\pi}\ln\dfrac ba$ ([Topic 11](#/l/t11-inductance)).` }),
    P({ src: 'Spring 2018 #2(c) · 6 pts', title: 'Emf of the coil',
      q: md`(c) The current $I$ is increasing in time. Find the **magnitude** and **direction** of the induced emf. Give the direction as clockwise or counterclockwise in the "view of 1 loop" drawing.`,
      parts: [
        MC('Magnitude', [md`$\dfrac{\mu_0N^2h}{2\pi}\ln\dfrac ba\,\dfrac{dI}{dt}$ V`, md`$\dfrac{\mu_0Nh}{2\pi}\ln\dfrac ba\,\dfrac{dI}{dt}$ V`, md`$\dfrac{\mu_0N^2Ih}{2\pi}\ln\dfrac ba$ V`, md`0: $\mathbf B$ is confined to the core`], 0,
          [null, md`That is one turn's emf; the coil's $N$ turns are in series.`, md`That is the linkage $\psi_N$ (in Wb); the emf is its rate of change.`, md`The turns wrap the core, so they link its flux, and that flux changes.`]),
        FIX('Direction in the "view of 1 loop"', ['clockwise', 'counterclockwise'], 1, [md`Clockwise is the direction of $I$ itself. The induced emf opposes the increase, so it pushes against $I$.`, null]),
      ],
      sol: md`$$|\emf| = \left|\frac{d\psi_N}{dt}\right| = \frac{\mu_0N^2h}{2\pi}\ln\frac ba\,\frac{dI}{dt}\ \ \text{V}\quad(= L\,dI/dt)$$
**Direction.** With $C$ along the current (clockwise in the view, $d\mathbf S = +\hat\phi$), $\psi_N > 0$ and growing, so $\emf = -d\psi_N/dt < 0$ along $C$: the emf points **counterclockwise** in the view, against $I$. Lenz: the coil fights the growth of its own current (a back emf).` }),

    RF(md`
      ### Problem 3 (25 points): parallel-plate transmission line

      In free space, two thin conducting plates of width $w$ (along $y$) and length $l$ (along $z$) are a distance $d$ apart, with $d \ll w, l$. The line is shorted at one end, and a current $I$ [A] flows along the top plate and back along the bottom plate. The surface current density is uniform on both plates.

      [[fig:pp]]
    `, { pp: { svg: sp18Line(), cap: 'x up, z to the right, y out of the page. The source drives I up at the left end; the right end is shorted.' } }),
    P({ src: 'Spring 2018 #3(a) · 4 pts', title: 'Surface currents',
      q: md`(a) Find the surface current density vector $\mathbf J_s$ on the top and bottom plates.`,
      parts: [MC('', [md`top: $\dfrac Iw\hat z$, bottom: $-\dfrac Iw\hat z$ A/m`, md`top: $\dfrac Il\hat z$, bottom: $-\dfrac Il\hat z$ A/m`, md`top: $-\dfrac Iw\hat z$, bottom: $\dfrac Iw\hat z$ A/m`, md`top: $\dfrac Iw\hat y$, bottom: $-\dfrac Iw\hat y$ A/m`], 0,
        [null, md`$J_s$ is current per unit width measured **across** the flow. The flow is along $z$; the width across it is $w$.`, md`The source pushes $I$ up into the top plate at the left end; from there it runs toward the short, along $+z$.`, md`The current runs along the line ($z$), not across it.`])],
      sol: md`The current leaves the source upward into the top plate at the left end, runs along $+z$ to the short, then returns along $-z$ on the bottom plate. Spread uniformly over the width $w$:
$$\mathbf J_{s,\text{top}} = \frac Iw\,\hat z\ \text{A/m}, \qquad \mathbf J_{s,\text{bottom}} = -\frac Iw\,\hat z\ \text{A/m}$$` }),
    P({ src: 'Spring 2018 #3(b) · 5 pts', title: 'B between the plates',
      q: md`(b) Find the magnetic flux density vector $\mathbf B$ between the plates.`,
      parts: [MC('', [md`$\mathbf B = -\dfrac{\mu_0I}{w}\hat y$ T`, md`$\mathbf B = +\dfrac{\mu_0I}{w}\hat y$ T`, md`$\mathbf B = -\dfrac{\mu_0I}{2w}\hat y$ T`, md`$\mathbf B = 0$: the opposite currents cancel`, md`$\mathbf B = -\dfrac{\mu_0I}{2\pi d}\hat y$ T`], 0,
        [null, md`RHR sign: just below the top sheet, $\hat n = -\hat x$ and $\tfrac12\mathbf J_s\times\hat n = \tfrac{I}{2w}\hat z\times(-\hat x) = -\tfrac{I}{2w}\hat y$.`, md`That is one plate. Between the plates the two sheets' fields add.`, md`They cancel **outside** the plates; between them they add.`, md`That is a thin wire's field. Wide plates ($d \ll w$) act as infinite sheets.`])],
      sol: md`Treat each plate as an infinite sheet ($d \ll w$): $\mathbf H = \frac12\mathbf J_s\times\hat n$, with $\hat n$ pointing from the sheet to the field point.

- Top sheet, point below it ($\hat n = -\hat x$): $\dfrac{I}{2w}\hat z\times(-\hat x) = -\dfrac{I}{2w}\hat y$.
- Bottom sheet, point above it ($\hat n = +\hat x$): $-\dfrac{I}{2w}\hat z\times\hat x = -\dfrac{I}{2w}\hat y$.

They add between the plates and cancel outside:
$$\mathbf B = \mu_0\mathbf H = -\frac{\mu_0I}{w}\hat y\ \ \text{T (between the plates)}, \qquad 0\ \text{outside}$$
**RHR check:** the current circulates clockwise in the figure (up the source, right along the top, down the short, left along the bottom), so $\mathbf B$ inside points into the page, $-\hat y$ ✓.` }),
    P({ src: 'Spring 2018 #3(c) · 5 pts', title: 'Flux linked by the current',
      q: md`(c) Calculate the magnetic flux $\psi$ linked by the current path (the flux through the loop of current).`,
      parts: [MC('', [md`$\psi = \dfrac{\mu_0Idl}{w}$ Wb`, md`$\psi = \dfrac{\mu_0Iwl}{d}$ Wb`, md`$\psi = \dfrac{\mu_0Id}{w}$ Wb`, md`$\psi = \dfrac{\mu_0Idl}{2w}$ Wb`], 0,
        [null, md`Geometry inverted. The flux is $B$ times the area the current loop encloses, $d\times l$ (in the $xz$-plane), with $B = \mu_0I/w$: $w$ goes in the denominator, $d$ in the numerator.`, md`Flux needs an area: multiply $B$ by $d$ **and** $l$.`, md`That uses one plate's field.`])],
      sol: md`The current loop lies in the $xz$-plane and encloses the $d\times l$ rectangle between the plates, where $|\mathbf B| = \mu_0I/w$ is uniform and normal to it:
$$\psi = |\mathbf B|\,d\,l = \frac{\mu_0Idl}{w}\ \ \text{Wb}$$
(It is positive for $d\mathbf S$ along $-\hat y$, which the RHR assigns to the clockwise current path.)` }),
    P({ src: 'Spring 2018 #3(d) · 5 pts', title: 'Inductance',
      q: md`(d) Calculate the inductance $L$ of the transmission line.`,
      parts: [MC('', [md`$L = \dfrac{\mu_0dl}{w}$ H`, md`$L = \dfrac{\mu_0wl}{d}$ H`, md`$L = \dfrac{\mu_0Idl}{w}$ H`, md`$L = \dfrac{\mu_0dl}{2w}$ H`], 0,
        [null, md`Inverted: that is the shape of a capacitance, $\epsilon wl/d$. Wider plates spread the current thinner and lower $B$.`, md`That is $\psi$; divide by $I$.`, md`That uses one plate's field.`])],
      sol: md`$$L = \frac{\psi}{I} = \frac{\mu_0dl}{w}\ \ \text{H}$$
Per unit length, $\mu_0d/w$ H/m. Units: (H/m)(m)(m)/(m) = H ✓. Pure geometry: no $I$.` }),
    P({ src: 'Spring 2018 #3(e) · 6 pts', title: 'Scaling',
      q: md`(e) The plate separation is doubled to $2d$ and the current is reduced to $I/2$. By what factor do $|\mathbf B|$, $\psi$ and $L$ change? Circle one in each row.`,
      parts: [
        FIX('$|\\mathbf B|$ scales by', ['0.25', '0.5', '1.0', '2.0', '4.0'], 1, [md`$B$ does not depend on $d$, and it scales with $I$ only once.`, null, md`$B = \mu_0I/w$ follows $I$, which halves.`, md`$B$ is independent of $d$: doubling the gap does not change it.`, md`$B = \mu_0I/w$: no $d$ at all.`]),
        FIX('$\\psi$ scales by', ['0.25', '0.5', '1.0', '2.0', '4.0'], 2, [md`$\psi \propto Id$, not $I^2$.`, md`That forgets the doubled area $d\,l$.`, null, md`That forgets the halved current.`, md`$\psi \propto Id = (\tfrac12)(2)$.`]),
        FIX('$L$ scales by', ['0.25', '0.5', '1.0', '2.0', '4.0'], 3, [md`$L$ is geometric: the current does not enter.`, md`$L \propto d$, which doubles.`, md`$L$ does not depend on $I$, but it does depend on $d$.`, null, md`$L \propto d$, not $d^2$.`]),
      ],
      sol: md`- $|\mathbf B| = \mu_0I/w$: **×0.5** (the current halves; $d$ does not enter).
- $\psi = \mu_0Idl/w$: **×1.0** ($\tfrac12\times2$).
- $L = \mu_0dl/w$: **×2.0** (geometry only).

Consistency: $\psi = LI$ gives $2\times\tfrac12 = 1$ ✓.` }),

    RF(md`
      ### Problem 4 (14 points): a traveling waveform

      The electric field of a wave moves with velocity $\mathbf v = -c\hat x = -300\,\hat x$ m/μs. At $t = 1$ μs it has an exponentially decaying profile as $x$ increases:
      $$\mathbf E(x, t = 1\,\mu\text{s}) = 3\,u(x - 100)\,e^{-(x - 100)/50}\,\hat z\ \ \text{V/m}\quad(x\ \text{in m})$$
      where $u$ is the unit step function.

      [[fig:e]]
    `, { e: { svg: sp18E([{ pts: prof4(100) }]), cap: 'The given snapshot at t = 1 μs: a 3 V/m step at x = 100 m, decaying over 50 m.' } }),
    P({ src: 'Spring 2018 #4(a) · 7 pts', title: 'The profile at t = 0',
      q: md`(a) Find $\mathbf E(x, 0)$ everywhere, and sketch the profile.`,
      parts: [
        N('x_{\\text{step}}\\ \\text{at}\\ t = 0', 400, 'm'),
        MC('$\\mathbf E(x, 0) =$', [md`$3\,u(x - 400)\,e^{-(x - 400)/50}\,\hat z$ V/m`, md`$3\,u(x + 200)\,e^{-(x + 200)/50}\,\hat z$ V/m`, md`$3\,u(x - 100)\,e^{-(x - 100)/50}\,\hat z$ V/m`, md`$3\,u(x - 400)\,e^{+(x - 400)/50}\,\hat z$ V/m`], 0,
          [null, md`That moves the profile the way it travels ($-x$). Going back in time from 1 μs to 0 moves it **against** $\mathbf v$: 300 m toward $+x$.`, md`That is the $t = 1$ μs snapshot; in 1 μs the wave moves 300 m.`, md`The shape does not flip: it still decays as $x$ increases.`]),
      ],
      hints: [md`The wave travels 300 m toward $-x$ every μs. Where was the step 1 μs before it reached $x = 100$ m?`],
      sol: md`The wave moves toward $-x$ at 300 m/μs, so 1 μs earlier the whole profile sat 300 m further toward $+x$: the step was at $100 + 300 = 400$ m.
$$\mathbf E(x, 0) = 3\,u(x - 400)\,e^{-(x - 400)/50}\,\hat z\ \ \text{V/m}$$
The sketch: zero for $x < 400$ m, a jump to 3 V/m at 400 m, then decay by $1/e$ every 50 m (1.10 V/m at 450 m, 0.41 V/m at 500 m).

[[fig:e0]]

**Check:** moving this profile 300 m toward $-x$ puts the step back at 100 m at $t = 1$ μs ✓.`,
      figs: { e0: { svg: sp18E([{ pts: prof4(100), cls: 'dash dim', lab: 't = 1\\,\\mu\\text{s}', labAt: 150, dx: 4, dy: -14 }, { pts: prof4(400), lab: 't = 0', labAt: 430, dx: 6, dy: -10 }]), cap: '$E_z(x, 0)$ (solid): the step at x = 400 m. The given t = 1 μs snapshot is dashed.' } } }),
    P({ src: 'Spring 2018 #4(b) · 5 pts', title: 'E(x, t)',
      q: md`(b) Find $\mathbf E(x, t)$ for arbitrary $x$ and $t$. (Added check, not on the paper: evaluate $E_z$ at $x = 0$, $t = 1.5$ μs.)`,
      parts: [
        MC('$\\mathbf E(x, t) =$ ($x$ in m, $t$ in μs)', [md`$3\,u(x + 300t - 400)\,e^{-(x + 300t - 400)/50}\,\hat z$ V/m`, md`$3\,u(x - 300t - 400)\,e^{-(x - 300t - 400)/50}\,\hat z$ V/m`, md`$3\,u(x + 300t - 100)\,e^{-(x + 300t - 100)/50}\,\hat z$ V/m`, md`$3\,u(x + 300t - 400)\,e^{-(x - 400)/50}\,\hat z$ V/m`], 0,
          [null, md`$f(x - vt)$ with $v > 0$ moves toward $+x$. This wave moves toward $-x$: the argument is $x + 300t$.`, md`At $t = 1$ that puts the step at $x = -200$ m, not 100 m. Anchor the constant with the given snapshot.`, md`Every point of the profile moves: the exponent needs the same argument as the step.`]),
        N('E_z(x = 0,\\ t = 1.5\\,\\mu\\text{s})', 3 * Math.exp(-1), 'V/m'),
      ],
      sol: md`A shape moving toward $-x$ at speed $c$ is a function of $x + ct$. With $x$ in m and $t$ in μs, $c = 300$ m/μs, and $t = 0$ must give part (a):
$$\mathbf E(x, t) = 3\,u(x + 300t - 400)\,e^{-(x + 300t - 400)/50}\,\hat z\ \ \text{V/m}$$
In SI units the argument is $x + 3\times10^8\,t - 400$ ($t$ in s). Check: $t = 1$ μs gives $x + 300 - 400 = x - 100$, the given snapshot ✓.

At $x = 0$, $t = 1.5$ μs the argument is $0 + 450 - 400 = 50$ m: $E_z = 3e^{-1} = 1.10$ V/m.` }),
    P({ src: 'Spring 2018 #4(c) · 2 pts', title: 'Conductive medium?',
      q: md`(c) TRUE or FALSE: the wave is propagating in a conductive medium.`,
      parts: [FIX('', ['TRUE', 'FALSE'], 1, [md`The exponential is the pulse's **shape** along $x$, not a loss. The pulse keeps its shape and amplitude as it moves, at exactly $c$. In a conductor it would shrink as it travels, and move slower than $c$.`, null])],
      sol: md`**FALSE.** The profile translates rigidly, $f(x + ct)$, at exactly $c$: a solution of the lossless wave equation in free space. The decay is across the snapshot (along $x$), not along the path of travel: a probe at fixed $x$ sees the field jump to 3 V/m and then fade as the tail passes. A conductive medium would attenuate and distort the pulse.` }),

    RF(md`
      ### Problem 5 (20 points): waves launched by a current sheet

      An infinitesimally thin current sheet in the plane $y = 0$ launches forward ($+y$) and reverse ($-y$) uniform plane waves into free space. Its current density is $\mathbf J_s = -J_s(t)\,\hat x$ A/m, with $J_s(t)$ below. Take $v_p = 3\times10^8$ m/s and $\eta = 120\pi\ \Omega$.

      [[fig:js]]
    `, { js: { svg: sp18Js(), cap: '$J_s(t)$: 0 until 1 ns, up to 4 A/m at 2 ns, down to −4 A/m at 3 ns, −4 A/m until 4 ns, then back to 0.' } }),
    P({ src: 'Spring 2018 #5(a) · 3 pts', title: 'Forward wave',
      q: md`(a) The forward wave's magnetic field can be written $\mathbf H(y, t) = \text{(ii)}\;J_s(t - y/v_p)\;\text{(i)}$ A/m. Give (i), the unit vector of $\mathbf H$, and (ii), the coefficient in front of $J_s$ with its sign.`,
      parts: [
        FIX('(i) direction of $\\mathbf H$', ['$\\hat x$', '$\\hat y$', '$\\hat z$'], 2, [md`$\mathbf H$ is perpendicular to $\mathbf E$, and $\mathbf E$ lies along the current, $\hat x$.`, md`A uniform plane wave is transverse: $\mathbf H$ is never along the propagation direction $\hat y$.`, null]),
        FIX('(ii) coefficient', ['$-\\tfrac12$', '$+\\tfrac12$', '$-\\tfrac{\\eta}{2}$', '$-1$'], 0, [null, md`That copies the formula sheet's sign for a sheet on $z = 0$. Here the sheet is on $y = 0$, and relabeling the axes flips the handedness ($\hat y\times\hat x = -\hat z$). Check with $\mathbf E\times\mathbf H$.`, md`$\eta/2$ belongs to $\mathbf E$. $H = E/\eta$, so the coefficient of $\mathbf H$ is $\tfrac12$.`, md`The sheet's current feeds two waves; each carries $\mathbf H$ of size $\tfrac12J_s$.`]),
      ],
      sol: md`Use $\mathbf E = -\frac{\eta}{2}\mathbf J_s(t - |y|/v_p)$ on both sides. With $\mathbf J_s = -J_s\hat x$:
$$\mathbf E = \frac{\eta}{2}J_s(t - |y|/v_p)\,\hat x$$
The forward wave ($y > 0$) travels along $+\hat y$, so
$$\mathbf H = \frac1\eta\,\hat y\times\mathbf E = \frac12J_s\,(\hat y\times\hat x) = -\frac12J_s(t - y/v_p)\,\hat z\ \ \text{A/m}$$
**(i) $\hat z$, (ii) $-\tfrac12$.** Check: $\mathbf E\times\mathbf H \propto \hat x\times(-\hat z) = +\hat y$, away from the sheet ✓.` }),
    P({ src: 'Spring 2018 #5(b) · 3 pts', title: 'Reverse wave',
      q: md`(b) The reverse wave's magnetic field can be written $\mathbf H(y, t) = \text{(ii)}\;J_s(t + y/v_p)\;\text{(i)}$ A/m. Give (i) and (ii).`,
      parts: [
        FIX('(i) direction of $\\mathbf H$', ['$\\hat x$', '$\\hat y$', '$\\hat z$'], 2, [md`$\mathbf H$ is perpendicular to $\mathbf E$, which lies along $\hat x$.`, md`$\mathbf H$ is never along the propagation direction.`, null]),
        FIX('(ii) coefficient', ['$+\\tfrac12$', '$-\\tfrac12$', '$+\\tfrac{\\eta}{2}$', '$+1$'], 0, [null, md`That is the forward wave's coefficient. $\mathbf E$ is the same on both sides; the propagation direction flips, so $\mathbf H$ flips.`, md`$\eta/2$ belongs to $\mathbf E$.`, md`Each wave carries half the sheet current's $H$.`]),
      ],
      sol: md`For $y < 0$, $|y| = -y$, so $t - |y|/v_p = t + y/v_p$, and the wave travels along $-\hat y$:
$$\mathbf H = \frac1\eta(-\hat y)\times\mathbf E = +\frac12J_s(t + y/v_p)\,\hat z\ \ \text{A/m}$$
**(i) $\hat z$, (ii) $+\tfrac12$.** Check the jump at the sheet: $\hat y\times(\mathbf H_+ - \mathbf H_-) = \hat y\times(-J_s\hat z) = -J_s\hat x = \mathbf J_s$ ✓.` }),
    P({ src: 'Spring 2018 #5(c) · 14 pts', title: 'H at t = 5 ns',
      q: md`(c) Sketch the appropriate component of $\mathbf H$ (the amount of $H$ along the $\hat x$, $\hat y$ or $\hat z$ you circled above) versus $y$ at $t = 5$ ns. Label the axis scales so magnitudes and positions can be read. Then read these values off your sketch: that signed component at three points, and the outer edge of the waves.`,
      parts: [N('\\text{at}\\ y = 0.45\\ \\text{m}', 2, 'A/m'), N('\\text{at}\\ y = -0.45\\ \\text{m}', -2, 'A/m'), N('\\text{at}\\ y = 1.05\\ \\text{m}', -1, 'A/m'), N('\\text{outer edge of the waves},\\ |y|', 1.2, 'm')],
      hints: [md`Light covers 0.3 m per ns. The field at distance $|y|$ at $t = 5$ ns left the sheet at $t' = 5\,\text{ns} - |y|/(0.3\ \text{m/ns})$.`, md`For $y > 0$, $H_z = -\frac12J_s(t')$; for $y < 0$, $H_z = +\frac12J_s(t')$. The earliest part of $J_s$ ($t' = 1$ ns) has traveled farthest.`],
      sol: md`**Retarded time.** At $t = 5$ ns the field at distance $|y|$ left the sheet at $t' = 5 - |y|/0.3$ (ns, with $y$ in m). The pulse occupies $1 < t' < 4$ ns, i.e. $0.3 < |y| < 1.2$ m. The earliest part of $J_s$ is farthest out, so in $|y|$ the waveform appears **mirrored**.

| $\lvert y\rvert$ (m) | $t'$ (ns) | $J_s(t')$ (A/m) | $H_z$ at $+y$ | $H_z$ at $-y$ |
|---|---|---|---|---|
| 0 to 0.3 | 5 to 4 | 0 | 0 | 0 |
| 0.3 to 0.6 | 4 to 3 | −4 | +2 | −2 |
| 0.75 | 2.5 | 0 | 0 | 0 |
| 0.9 | 2 | +4 | −2 | +2 |
| 1.2 | 1 | 0 | 0 | 0 |

[[fig:h]]

For $y > 0$: zero out to 0.3 m, a jump to $+2$ A/m (the sudden turn-off at 4 ns), flat to 0.6 m, linear through 0 at 0.75 m down to $-2$ A/m at 0.9 m, linear back to 0 at 1.2 m. For $y < 0$ the plot is the mirror image with the sign flipped: $H_z$ is odd in $y$ ($E_x$ is even).

Readings: $H_z(0.45) = +2$ A/m, $H_z(-0.45) = -2$ A/m, $H_z(1.05) = -\tfrac12(2) = -1$ A/m ($t' = 1.5$ ns, $J_s = 2$ A/m), outer edge $|y| = 1.2$ m.

**Check:** the outer edge is the 1 ns start of the pulse after 4 ns of travel: $(4\,\text{ns})(0.3\,\text{m/ns}) = 1.2$ m ✓.`,
      figs: { h: { svg: sp18H5(), cap: md`$H_z(y)$ at t = 5 ns (A/m). Odd in y: the forward wave carries $-\tfrac12J_s$, the reverse wave $+\tfrac12J_s$.` } } }),
  ];

  // ================================================================ Summer 2020
  const su20 = [
    R(md`
      **Summer 2020 · ECE 329 · Hour Exam 2.** Three problems, 25 points each, 75 points. The scanned key has no cover page, so the time limit and rules were not recorded (the other summer Exam 2s ran 50–55 minutes with two formula sheets and no calculator). The key is handwritten; where it is wrong, the solution says so.

      **What it tests.** Dielectric layers, potential, polarization and capacitance ([Topic 1](#/l/t1-dielectrics), [Topic 2](#/l/t2-capacitance)); charge relaxation and Gauss's law ([Topic 3](#/l/t3-relaxation)); line currents written with delta functions ([deltas](#/l/u0-deltas), [Topic 4](#/l/t4-force)); nested solenoids and Lenz ([Topic 5](#/l/t5-ampere), [Topic 8](#/l/t8-faraday)); a loop moving through a nonuniform field ([Topic 9](#/l/t9-motional)).
    `),
    RF(md`
      ### Problem 1 (25 points)

      **(a)** Two infinite conducting plates have facing surfaces on $z = 0$ and $z = 2$ m. These surfaces carry $\pm2$ C/m², the top plate positive. Between the plates, $1 < z < 2$ m is filled with an ideal dielectric of permittivity $\epsilon = 2\epsilon_0$, and $0 < z < 1$ m is free space (the paper says "$z < 0$", a typo). The surface $z = 1$ m carries no free charge.

      [[fig:p]]
    `, { p: { svg: s20Plates(), cap: 'Plates at z = 0 (−2 C/m²) and z = 2 m (+2 C/m²); the dielectric fills the top half.' } }),
    P({ src: 'Summer 2020 #1(a)(i) · 5 pts', title: 'Potentials',
      q: md`(i) The bottom plate is at $V(0) = 0$ V. Find the potentials $V(1)$ and $V(2)$ at $z = 1$ m and $z = 2$ m.`,
      parts: [N('V(1)', 2 / eps0, 'V'), N('V(2)', 3 / eps0, 'V')],
      hints: [md`At a conductor face $D_n = \rho_s$. With no free charge at $z = 1$, $\mathbf D$ is the same in both layers.`, md`$\mathbf E = \mathbf D/\epsilon$ in each layer, then $V(z_2) - V(z_1) = -\int_{z_1}^{z_2}E_z\,dz$.`],
      sol: md`**D.** Field lines run from the + plate (top) down to the − plate: $\mathbf D = -2\hat z$ C/m² in both layers ($D_n$ is continuous across $z = 1$, which has no free charge). Check at the bottom plate's top face, $\hat n = +\hat z$: $\hat n\cdot\mathbf D = -2 = \rho_s$ ✓.

**E.** $\mathbf E_1 = \mathbf D/\epsilon_0 = -\dfrac{2}{\epsilon_0}\hat z$ V/m for $0 < z < 1$; $\mathbf E_2 = \mathbf D/2\epsilon_0 = -\dfrac{1}{\epsilon_0}\hat z$ V/m for $1 < z < 2$.

**V.**
$$V(1) = V(0) - \int_0^1E_{1z}\,dz = \frac{2}{\epsilon_0} = 2.26\times10^{11}\ \text{V}, \qquad V(2) = V(1) - \int_1^2E_{2z}\,dz = \frac{3}{\epsilon_0} = 3.39\times10^{11}\ \text{V}$$
The potential rises toward the + plate ✓. (The values are absurd because 2 C/m² is an enormous charge density; the exam wants $2/\epsilon_0$ and $3/\epsilon_0$ V.)` }),
    P({ src: 'Summer 2020 #1(a)(ii) · 5 pts', title: 'E, D and P',
      q: md`(ii) Give $\mathbf E$, $\mathbf D$ and $\mathbf P$ explicitly in the regions $0 < z < 1$ m and $1 < z < 2$ m between the plates. (All are along $\hat z$; enter the $z$-components.)`,
      parts: [N('D_z\\ (\\text{both regions})', -2, 'C/m^2'), N('E_z\\ (0 < z < 1)', -2 / eps0, 'V/m'), N('E_z\\ (1 < z < 2)', -1 / eps0, 'V/m'), N('P_z\\ (1 < z < 2)', -1, 'C/m^2')],
      sol: md`From part (i), with $\mathbf P = \mathbf D - \epsilon_0\mathbf E$:

| Region | $\mathbf D$ (C/m²) | $\mathbf E$ (V/m) | $\mathbf P$ (C/m²) |
|---|---|---|---|
| $0 < z < 1$, free space | $-2\hat z$ | $-(2/\epsilon_0)\hat z = -2.26\times10^{11}\hat z$ | $0$ |
| $1 < z < 2$, $\epsilon = 2\epsilon_0$ | $-2\hat z$ | $-(1/\epsilon_0)\hat z = -1.13\times10^{11}\hat z$ | $-1\hat z$ |

Check: $\mathbf P = (\epsilon - \epsilon_0)\mathbf E = \epsilon_0(-1/\epsilon_0)\hat z = -1\hat z$ ✓. The dielectric's bound charge, $\mp1$ C/m² on its top and bottom faces, cancels half of the plates' field inside it.` }),
    P({ src: 'Summer 2020 #1(a)(iii) · 5 pts', title: 'Capacitance per area',
      q: md`(iii) What is the capacitance per unit area of this configuration? (Capacitance is charge per voltage difference.)`,
      parts: [N('C/A', 2 * eps0 / 3, 'F/m^2')],
      sol: md`$$\frac CA = \frac{\rho_s}{\Delta V} = \frac{2\ \text{C/m}^2}{3/\epsilon_0\ \text{V}} = \frac{2\epsilon_0}{3} = 5.90\times10^{-12}\ \text{F/m}^2$$
Check as two capacitors in series: $\dfrac{A}{C} = \dfrac{d_1}{\epsilon_0} + \dfrac{d_2}{2\epsilon_0} = \dfrac{1}{\epsilon_0} + \dfrac{1}{2\epsilon_0} = \dfrac{3}{2\epsilon_0}$ ✓.` }),
    R(md`
      **(b)** In a homogeneous conductor where $\mathbf J = \sigma\mathbf E$, Gauss's law $\nabla\cdot\mathbf E = \rho/\epsilon_0$ and the continuity equation $\partial\rho/\partial t + \nabla\cdot\mathbf J = 0$ combine into
      $$\frac{\partial\rho}{\partial t} + \frac{\sigma}{\epsilon_0}\rho = 0$$
    `),
    P({ src: 'Summer 2020 #1(b)(i) · 5 pts', title: 'Relaxation',
      q: md`(i) At $t = 0$ the charge density is $\rho(x, y, z, 0) = \sin(4z)$ C/m³ over all space. Find $\rho$ for $t > 0$.`,
      parts: [MC('$\\rho(x, y, z, t) =$', [md`$\sin(4z)\,e^{-\sigma t/\epsilon_0}$ C/m³`, md`$\sin(4z)\,e^{-\epsilon_0t/\sigma}$ C/m³`, md`$\sin(4z - \sigma t/\epsilon_0)$ C/m³`, md`$\sin(4z)\,e^{+\sigma t/\epsilon_0}$ C/m³`], 0,
        [null, md`Upside down. $\sigma/\epsilon_0$ has units 1/s: it is the decay rate, and the time constant is $\tau = \epsilon_0/\sigma$.`, md`Relaxation does not move the charge pattern; each point decays in place.`, md`The equation has $+\sigma\rho/\epsilon_0$ on the left: the charge decays.`])],
      sol: md`At each point $d\rho/dt = -(\sigma/\epsilon_0)\rho$: exponential decay with $\tau = \epsilon_0/\sigma$.
$$\rho(x, y, z, t) = \sin(4z)\,e^{-\sigma t/\epsilon_0}\ \ \text{C/m}^3$$
The spatial pattern stays put; only its amplitude decays.` }),
    P({ src: 'Summer 2020 #1(b)(ii) · 5 pts', title: 'The field of the decaying charge',
      q: md`(ii) For this $\rho$, what is the electric field $\mathbf E$ at $t = 0$, and as $t \to \infty$, if $\sigma > 0$? (Hint: find $\partial E_z/\partial z$ first, then its antiderivative.)`,
      parts: [MC('', [md`$t = 0$: $-\dfrac{\cos(4z)}{4\epsilon_0}\hat z$ V/m; $\;t \to \infty$: 0`, md`$t = 0$: $+\dfrac{\cos(4z)}{4\epsilon_0}\hat z$ V/m; $\;t \to \infty$: 0`, md`$t = 0$: $\dfrac{4\cos(4z)}{\epsilon_0}\hat z$ V/m; $\;t \to \infty$: 0`, md`$t = 0$: $-\dfrac{\cos(4z)}{4\epsilon_0}\hat z$ V/m; $\;t \to \infty$: the same`], 0,
        [null, md`The antiderivative of $\sin(4z)$ is $-\cos(4z)/4$.`, md`That differentiates $\rho$ instead of integrating it.`, md`The field is made by the charge, and the charge decays with $\tau = \epsilon_0/\sigma$.`])],
      sol: md`$\rho$ depends on $z$ only, so take $\mathbf E = E_z(z, t)\hat z$. Gauss:
$$\frac{\partial E_z}{\partial z} = \frac{\rho}{\epsilon_0} = \frac{\sin(4z)}{\epsilon_0}e^{-\sigma t/\epsilon_0}\quad\Rightarrow\quad\mathbf E = -\frac{\cos(4z)}{4\epsilon_0}e^{-\sigma t/\epsilon_0}\,\hat z\ \ \text{V/m}$$
(The integration constant would be a uniform field; nothing here makes one.) At $t = 0$: $-\dfrac{\cos(4z)}{4\epsilon_0}\hat z$ V/m. As $t \to \infty$: **0**. Units: (C/m³)(m)/(F/m) = V/m ✓ (the 4 is in 1/m).` }),

    RF(md`
      ### Problem 2 (25 points)

      **(a)** Consider the current density
      $$\mathbf J(x, y, z) = 2\hat x\,\delta(y)\delta(z) - 4\hat y\,\delta(x)\delta(z)\ \ \text{A/m}^2$$

      [[fig:w]]
    `, { w: { svg: s20Wires(), cap: 'J is two line currents in the plane z = 0: 2 A along +x on the x-axis and 4 A along −y on the y-axis. z points out of the page.' } }),
    P({ src: 'Summer 2020 #2(a)(i) · 5 pts', title: 'B from two line currents',
      q: md`(i) What is the DC magnetic flux density $\mathbf B(1, 1, 0)$ produced by $\mathbf J$ at $(x, y, z) = (1, 1, 0)$ m? (It points along $\pm\hat z$; enter its $z$-component.)`,
      parts: [N('B_z(1,1,0)', 3 * mu0 / PI, 'T')],
      hints: [md`$\delta(y)\delta(z)$ has units 1/m², so $2\hat x\,\delta(y)\delta(z)$ A/m² is a 2 A line current on the $x$-axis.`, md`Each wire gives $B = \mu_0I/2\pi\rho$ with its direction from the RHR; both wires are 1 m from $(1,1,0)$.`],
      sol: md`**Read J.** $2\hat x\,\delta(y)\delta(z)$: 2 A along $+x$ on the $x$-axis. $-4\hat y\,\delta(x)\delta(z)$: 4 A along $-y$ on the $y$-axis.

**$x$-axis wire.** The point is 1 m away, along $+\hat y$. RHR: $\hat x\times\hat y = \hat z$, so $\mathbf B_1 = \dfrac{\mu_0(2)}{2\pi(1)}\hat z = \dfrac{\mu_0}{\pi}\hat z$.

**$y$-axis wire.** The point is 1 m away, along $+\hat x$. Current along $-\hat y$: $(-\hat y)\times\hat x = \hat z$, so $\mathbf B_2 = \dfrac{\mu_0(4)}{2\pi(1)}\hat z = \dfrac{2\mu_0}{\pi}\hat z$.
$$\mathbf B(1,1,0) = \frac{3\mu_0}{\pi}\hat z = 1.2\times10^{-6}\,\hat z\ \ \text{T}$$` }),
    P({ src: 'Summer 2020 #2(a)(ii) · 5 pts', title: 'Where B vanishes',
      q: md`(ii) Find a location $(x, y, z)$ where the $\mathbf B$ produced by $\mathbf J$ is zero. Explain.`,
      parts: [MC('', [md`$(-2, 1, 0)$: any point of the line $x = -2y$ in the plane $z = 0$`, md`$(2, 1, 0)$`, md`$(-1, 2, 0)$`, md`$(0, 0, 1)$, above the crossing`], 0,
        [null, md`In the first quadrant both wires give $+\hat z$ (as in part i): they add.`, md`The fields do point opposite ways there, but the sizes differ: $B_z \propto \frac{2}{y} + \frac{4}{x} = 1 - 4 \ne 0$. The 4 A wire must be twice as far away as the 2 A wire.`, md`There the two fields point along $-\hat y$ and $-\hat x$: perpendicular, so they cannot cancel. Off the plane $z = 0$ they never cancel.`])],
      sol: md`In the plane $z = 0$ both fields are along $\hat z$. With signed $x$ and $y$ (the RHR flips each term across its own wire):
$$B_z = \frac{\mu_0}{2\pi}\left(\frac{2}{y} + \frac{4}{x}\right) = 0\quad\Rightarrow\quad x = -2y$$
Second or fourth quadrant, twice as far from the 4 A wire as from the 2 A wire. Example **$(-2, 1, 0)$**: the $x$-axis wire gives $\dfrac{\mu_0(2)}{2\pi(1)}\hat z$, the $y$-axis wire $\dfrac{\mu_0(4)}{2\pi(2)}(-\hat z)$: equal and opposite ✓. Off the plane, the $x$-axis wire adds a $B_y$ and the $y$-axis wire a $B_x$ that nothing cancels, so $z = 0$ is required.` }),
    R(md`
      **(b)** A long solenoid around and parallel to the $x$-axis has $N = 1000$ turns/m and radius $a_1 = 1$ m.
    `),
    P({ src: 'Summer 2020 #2(b)(i) · 5 pts', title: 'Solenoid field',
      q: md`(i) The solenoid current $I_1 = 1$ mA produces an internal field $\mathbf H = H_0\hat x$. Find $H_0$ with its unit.`,
      parts: [N('H_0', 1, 'A/m')],
      sol: md`Ampère on a rectangle straddling the winding: $H = NI$ inside, 0 outside.
$$H_0 = NI_1 = (1000\ \text{m}^{-1})(10^{-3}\ \text{A}) = 1\ \text{A/m}$$
(The key writes the intermediate unit as A/m²; H is in A/m.)` }),
    P({ src: 'Summer 2020 #2(b)(ii) · 5 pts', title: 'Cancelling the field',
      q: md`(ii) A second solenoid with $N = 500$ turns/m and radius $a_2 = 0.5$ m is inserted inside the first, and its current $I_2$ is adjusted so that $\mathbf H = 0$ for $r = \sqrt{y^2 + z^2} < a_2$. Describe $I_2$: its size and direction compared with $I_1$.`,
      parts: [N('I_2\\ (\\text{positive in the sense of}\\ I_1)', -2e-3, 'A')],
      sol: md`Inside both coils ($r < a_2$) the fields add:
$$N_1I_1 + N_2I_2 = 0\quad\Rightarrow\quad I_2 = -\frac{N_1I_1}{N_2} = -\frac{(1000)(10^{-3})}{500} = -2\ \text{mA}$$
**2 mA, circulating opposite to $I_1$**: twice the current because the inner coil has half the turns per meter. Between $a_2$ and $a_1$ only coil 1 acts, and $H = 1$ A/m there.` }),
    P({ src: 'Summer 2020 #2(b)(iii) · 5 pts', title: 'Lenz with nested coils',
      q: md`(iii) $I_1$ slowly decreases, and $H_0$ decreases in proportion. How does $I_2$ respond, according to Faraday's law and Lenz's rule?`,
      parts: [MC('', [md`Coil 2 gets an induced current in the sense of $I_1$: $I_2$ ($-2$ mA) shrinks in magnitude toward zero, holding the inner flux near zero`, md`$I_2$ grows more negative`, md`$I_2$ does not change: the flux inside coil 2 is zero`, md`$I_2$ reverses at once to $+2$ mA`], 0,
        [null, md`That would add $-\hat x$ flux on top of the change. As $I_1$ falls, the net inner flux heads toward $-\hat x$; Lenz pushes back with $+\hat x$ field.`, md`Zero flux is fine; a **changing** flux induces emf. As $I_1$ falls, coil 2's flux moves from 0 toward $-\hat x$.`, md`Nothing reverses abruptly; the induced emf follows the slow $dI_1/dt$.`])],
      sol: md`Before the change, coil 2 encloses zero net flux: coil 1's $+\hat x$ flux cancels its own $-\hat x$ flux. As $I_1$ falls, coil 1's contribution drops and the net flux through coil 2 heads toward $-\hat x$. Lenz: coil 2 develops an emf that drives current making $+\hat x$ field, i.e. current in the sense of $I_1$. Added to $I_2 = -2$ mA, this makes **$I_2$ less negative: its magnitude decreases** toward zero. For an ideal (resistanceless) coil 2 it would track $I_2 = -2I_1$ and keep $\mathbf H = 0$ inside. (The key's wording is muddled but lands here.)` }),

    R(md`
      ### Problem 3 (25 points)

      A conducting square loop, 1 m × 1 m, moves with velocity $\mathbf v = 4\hat x$ m/s through a region where the static field is
      $$\mathbf B(x, y, z) = \hat z\,25\times10^{-6}(1 + x/L)\ \ \text{T}, \qquad L = 1000\ \text{m}$$
      The center of the loop is at the origin at $t = 0$, and the loop is oriented to maximize its flux linkage.
    `),
    P({ src: 'Summer 2020 #3(a) · 5 pts', title: 'Orientation',
      q: md`(a) Draw a diagram showing the orientation and direction of motion of the loop, with some sample arrows for $\mathbf B$.`,
      parts: [MC('The loop lies…', [md`in the $xy$-plane (normal along $\hat z$), moving along $+x$, with $\mathbf B$ out of the page`, md`in the $xz$-plane`, md`in the $yz$-plane`, md`tilted 45° from the $xy$-plane`], 0,
        [null, md`Its normal is $\hat y$, perpendicular to $\mathbf B$: zero flux, the minimum.`, md`Its normal is $\hat x$, perpendicular to $\mathbf B$: zero flux.`, md`The flux falls as $\cos45°$.`])],
      sol: md`Maximum linkage means the loop faces $\mathbf B$: it lies in the $xy$-plane.

[[fig:a]]`,
      figs: { a: { svg: s20Loop(), cap: 'C counterclockwise from +z goes with dS = +z. The induced current (part e) is clockwise.' } } }),
    P({ src: 'Summer 2020 #3(b) · 5 pts', title: 'Flux at t = 0',
      q: md`(b) Find the flux linkage $\Psi(0)$ at $t = 0$, using $d\mathbf S = dx\,dy\,\hat z$.`,
      parts: [N('\\Psi(0)', 25e-6, 'Wb')],
      sol: md`$$\Psi(0) = \int_{-0.5}^{0.5}\!\int_{-0.5}^{0.5}25\times10^{-6}\left(1 + \frac xL\right)dx\,dy = 25\times10^{-6}\ \text{Wb}$$
The $x/L$ term is odd about the center and integrates to zero, so $\Psi$ is $B$ at the center times the area. At any time the center is at $x = 4t$: $\Psi(t) = 25\times10^{-6}(1 + 4t/L)$ Wb.` }),
    P({ src: 'Summer 2020 #3(c) · 5 pts', title: 'Emf and its direction',
      q: md`(c) Find the emf $\emf(0)$ at $t = 0$ and its direction. (Careful: an easy problem that is easy to get wrong.)`,
      parts: [N('\\mathcal E(0)\\ \\text{along}\\ C\\ (\\text{ccw from}\\ +z)', -1e-7, 'V'),
        FIX('Seen from $+z$, the emf drives current', ['clockwise', 'counterclockwise'], 0, [null, md`The emf along the counterclockwise $C$ is negative, so it pushes clockwise.`])],
      sol: md`$d\mathbf S = +\hat z$, so $C$ runs counterclockwise seen from $+z$ (RHR).
$$\emf = -\frac{d\Psi}{dt} = -\frac{25\times10^{-6}\ \text{T}\cdot1\ \text{m}^2}{L}\frac{dx_c}{dt} = -\frac{(25\times10^{-6})(4\ \text{m/s})}{1000\ \text{m}} = -1.0\times10^{-7}\ \text{V}$$
Negative along $C$: the emf drives current **clockwise** seen from $+z$. Lenz: the loop moves into stronger $+\hat z$ field, so the induced current makes $-\hat z$ field inside: clockwise ✓. Motional check: $\oint(\mathbf v\times\mathbf B)\cdot d\mathbf l = -v(B_{\text{right}} - B_{\text{left}})(1\ \text{m}) = -4(2.5\times10^{-8}) = -10^{-7}$ V ✓.

**Key error:** the key gives this emf in "Wb". An emf is in volts.` }),
    P({ src: 'Summer 2020 #3(d) · 5 pts', title: 'Time dependence',
      q: md`(d) Is the emf of the loop time dependent? Explain.`,
      parts: [FIX('', [md`No: $B$ is linear in $x$ and $v$ is constant, so $\Psi$ grows linearly in time`, md`Yes: the loop moves into stronger field, so the emf grows`, md`Yes: it oscillates as the loop moves`], 0,
        [null, md`The field gets stronger, but the emf depends on the **difference** between the leading and trailing edges, which is the same everywhere for a linear $B$.`, md`Nothing here is periodic.`])],
      sol: md`$\Psi(t) = 25\times10^{-6}(1 + 4t/L)$ Wb is linear in $t$, so $\emf = -d\Psi/dt = -10^{-7}$ V at every instant: **constant**. Equivalently, the leading edge always sees $2.5\times10^{-8}$ T more than the trailing edge.` }),
    P({ src: 'Summer 2020 #3(e) · 5 pts', title: 'Loop current',
      q: md`(e) The loop resistance is $2\ \Omega$. Find the loop current and show its direction in the diagram of part (a).`,
      parts: [N('|I|', 5e-8, 'A'), FIX('Seen from $+z$, the current flows', ['clockwise', 'counterclockwise'], 0, [null, md`$I = \emf/R$ has the emf's sign: negative along the counterclockwise $C$.`])],
      sol: md`$$I = \frac{\emf}{R} = \frac{-10^{-7}\ \text{V}}{2\ \Omega} = -5\times10^{-8}\ \text{A along}\ C$$
**50 nA, clockwise** seen from $+z$ (figure in part a).

**Key error:** the key writes $-5\times10^{-7}$ A; $10^{-7}/2 = 5\times10^{-8}$. (Summer 2018 #2 has the same loop and gets this right.)` }),
  ];

  // ================================================================ Summer 2019 (main)
  const hyMain = [[-3.5, 0], [-2, 0], [-1, 4], [1, 4], [3, 0], [3.5, 0]];
  const hyMainSheet = [[-3.5, -1], [-2, -1], [-1, 3], [0, 3], [0, 5], [1, 5], [3, 1], [3.5, 1]];
  const su19 = [
    R(md`
      **Summer 2019 · ECE 329 · Exam 2.** Wednesday, July 10, 2019, 11:00–11:50 AM (50 minutes). Three problems, 25 points each, 75 points. Open book; no calculators; two 8.5″×11″ formula sheets, both sides. Show all your work and reasoning; units on every answer. The key is handwritten and right on this paper, apart from one unit slip noted where it occurs.

      **What it tests.** Conductance and capacitance of one geometry, and the discharge of a leaky capacitor ([Topic 2](#/l/t2-capacitance), [Topic 3](#/l/t3-relaxation)); slabs and sheets of current ([Topic 6](#/l/t6-sheets)); the vector potential ([Topic 7](#/l/t7-flux)); Faraday's law around a solenoid ([Topic 8](#/l/t8-faraday)).
    `),
    R(md`
      ### Problem 1 (25 points): coax capacitor

      A dielectric-filled coax capacitor has a conductance per unit length $\mathcal G = 2$ μS/m. The conductivity of the filling is $\sigma = 10^{-6}$ S/m.
    `),
    P({ src: 'Summer 2019 #1(a) · 7 pts', title: 'Capacitance from conductance',
      q: md`(a) What is the capacitance per unit length $\mathcal C$ of the same capacitor if the filling's permittivity is $\epsilon = 2\epsilon_0$? ($\epsilon_0 \approx 8.854\times10^{-12}$ F/m.)`,
      parts: [N('\\mathcal C', 4 * eps0, 'F/m')],
      hints: [md`Same geometry, same geometric factor: $\mathcal C/\mathcal G = \epsilon/\sigma$.`],
      sol: md`Conductance and capacitance of one geometry share its geometric factor: $\mathcal G = \sigma\cdot(\text{G.F.})$ and $\mathcal C = \epsilon\cdot(\text{G.F.})$ (for a coax, G.F. $= 2\pi/\ln(b/a)$; it cancels). So
$$\mathcal C = \frac{\epsilon}{\sigma}\,\mathcal G = \frac{2(8.854\times10^{-12}\ \text{F/m})}{10^{-6}\ \text{S/m}}\,(2\times10^{-6}\ \text{S/m}) = 3.54\times10^{-11}\ \text{F/m} = 35.4\ \text{pF/m}$$` }),
    P({ src: 'Summer 2019 #1(b) · 10 pts', title: 'Steady state',
      q: md`(b) A 0.5 m length of this coax capacitor is connected across a 10 V DC source with internal resistance $R_s = 10^6\ \Omega$. What is the capacitor voltage $V_c$ in steady state?`,
      parts: [N('V_c', 5, 'V')],
      hints: [md`A real capacitor is an ideal $C$ in parallel with the leakage resistance $R = 1/(\mathcal G\ell)$. In DC steady state the $C$ carries no current.`],
      sol: md`The leaky filling is a resistor in parallel with the capacitance: $G = \mathcal G\ell = (2\times10^{-6})(0.5) = 10^{-6}$ S, so $R = 1$ MΩ. In steady state the capacitance draws no current, leaving a divider with $R_s = 1$ MΩ:
$$V_c = 10\ \text{V}\cdot\frac{R}{R + R_s} = 10\cdot\frac{10^6}{2\times10^6} = 5\ \text{V}$$` }),
    P({ src: 'Summer 2019 #1(c) · 8 pts', title: 'Discharge',
      q: md`(c) The 10 V source is disconnected from the capacitor at $t = 0$. At what later time $t_1$ is $V_c(t_1) = V_c(0)\,e^{-1}$? (What is the decay time constant of this physical capacitor?)`,
      parts: [N('t_1', 2 * eps0 / 1e-6, 's')],
      sol: md`With the source gone, the capacitor discharges through its own filling: $C = \mathcal C\ell = 17.7$ pF and $R = 1$ MΩ.
$$t_1 = \tau = RC = (10^6\ \Omega)(17.7\times10^{-12}\ \text{F}) = 17.7\ \mu\text{s}$$
It equals the filling's relaxation time, $\epsilon/\sigma = 2(8.854\times10^{-12})/10^{-6} = 17.7\ \mu$s, whatever the geometry ([Topic 3](#/l/t3-relaxation)).` }),

    RF(md`
      ### Problem 2 (25 points)

      **(a)** Two infinite slabs of finite width in $x$ carry a constant $\hat z$-directed volume current $\mathbf J = J_z\hat z$. Slab 1 occupies $-2 < x < -1$ m with $J_{1z} = 4$ A/m²; slab 2 occupies $1 < x < 3$ m with $J_{2z} = -2$ A/m².

      [[fig:s]]
    `, { s: { svg: slabs([[-2, -1, 1], [1, 3, -1]], 'x', ['J_z = 4\\ \\text{A/m}^2', 'J_z = -2\\ \\text{A/m}^2'], 'cross-section: slab 1 from x = −2 to −1 m carries J = 4 A/m² out of the page (+z); slab 2 from x = 1 to 3 m carries J = −2 A/m², into the page. x to the right, y up, z out of the page'), cap: 'x to the right, y up, z out of the page: slab 1 carries current out of the page, slab 2 into it.' } }),
    P({ src: 'Summer 2019 #2(a)(i) · 5 pts', title: 'H of two slabs',
      q: md`(i) What is the magnetic field intensity $\mathbf H$ on the $x$-axis at $x = -3$, $-1.5$, 0, 1.5 and 3 m? (It points along $\pm\hat y$.)`,
      parts: [MC('At $x = -3$ m and $x = 3$ m, $\\mathbf H$ is…', [md`zero at both`, md`$-2\hat y$ A/m at both`, md`$-2\hat y$ A/m at $x = -3$ and $+2\hat y$ A/m at $x = 3$`, md`$4\hat y$ A/m at both`], 0,
        [null, md`That counts only the nearer slab. The other slab's field is equal and opposite out there.`, md`Each value counts one slab only; outside both, the two equal and opposite sheets of current cancel.`, md`$4\hat y$ is the field between the slabs.`]),
        N('H_y(-1.5\\ \\text{m})', 2, 'A/m'), N('H_y(0)', 4, 'A/m'), N('H_y(1.5\\ \\text{m})', 3, 'A/m')],
      hints: [md`Outside a slab of thickness $w$ carrying $J$, it acts as a sheet $J_s = Jw$: $\mathbf H = \pm\frac{Jw}{2}\hat y$. Inside, $H_y$ changes linearly: $dH_y/dx = J_z$.`, md`Slab 1 is a 4 A/m sheet, slab 2 a $-4$ A/m sheet.`],
      sol: md`**Each slab.** For a $\hat z$ current, $\mathbf H = \frac12\mathbf J_s\times\hat n$ gives $+\frac{J_s}{2}\hat y$ on its $+x$ side and $-\frac{J_s}{2}\hat y$ on its $-x$ side, with $J_s = Jw$. Inside a slab $H_y$ is linear with slope $J_z$ (Ampère, $\partial H_y/\partial x = J_z$), zero at the slab's center.

- Slab 1: $J_s = (4)(1) = 4$ A/m: $-2\hat y$ to its left, $+2\hat y$ to its right, $4(x + 1.5)\hat y$ inside.
- Slab 2: $J_s = (-2)(2) = -4$ A/m: $+2\hat y$ to its left, $-2\hat y$ to its right, $-2(x - 2)\hat y$ inside.

| $x$ (m) | slab 1 | slab 2 | $H_y$ (A/m) |
|---|---|---|---|
| −3 | −2 | +2 | 0 |
| −1.5 | 0 | +2 | 2 |
| 0 | +2 | +2 | 4 |
| 1.5 | +2 | +1 | 3 |
| 3 | +2 | −2 | 0 |

**$\mathbf H = 0,\ 2\hat y,\ 4\hat y,\ 3\hat y,\ 0$ A/m.** Outside everything the field vanishes: the net current is zero.` }),
    P({ src: 'Summer 2019 #2(a)(ii) · 5 pts', title: 'Plot H',
      q: md`(ii) Plot $H_z(x)$ and $H_y(x)$ for $-3 < x < 3$ m, consistent with part (i), and justify the plot.`,
      parts: [MC('Between $x = -1$ and $x = 1$ m, $H_y$ is…', [md`constant, 4 A/m`, md`linear, rising from 2 to 3 A/m`, md`zero`, md`linear, falling from 4 to 0 A/m`], 0,
        [null, md`No current flows between the slabs, so $dH_y/dx = J_z = 0$ there: $H_y$ is flat.`, md`Between the slabs both sheets push $+\hat y$: 2 + 2 = 4 A/m.`, md`That falling ramp belongs inside slab 2 ($1 < x < 3$).`])],
      sol: md`$H_z = 0$ everywhere (and $H_x = 0$): $\hat z$ currents that depend only on $x$ make only $\hat y$ field. $H_y$ is piecewise linear with slope $J_z$:

[[fig:p]]

Zero for $x < -2$; slope $+4$ through slab 1 up to 4 A/m at $x = -1$; flat at 4 A/m to $x = 1$; slope $-2$ through slab 2 down to 0 at $x = 3$; zero beyond. Continuous everywhere: volume currents make no jumps.`,
      figs: { p: { svg: hPlot(hyMain, 'x', 'H_y'), cap: '$H_y(x)$ (A/m); $H_z = 0$.' } } }),
    P({ src: 'Summer 2019 #2(a)(iii) · 5 pts', title: 'Adding a current sheet',
      q: md`(iii) How do the answers to (i) and (ii) change if a surface current sheet $\mathbf J_s = 2\hat z$ A/m is placed on the surface $x = 0$?`,
      parts: [N('H_y(-3\\ \\text{m})', -1, 'A/m'), N('H_y(-1.5\\ \\text{m})', 1, 'A/m'), N('H_y(1.5\\ \\text{m})', 4, 'A/m'), N('H_y(3\\ \\text{m})', 1, 'A/m'),
        MC('At $x = 0$ itself, $H_y$ is…', [md`two-valued at the sheet: 3 A/m just left of it, 5 A/m just right (average 4)`, md`4 A/m: the sheet adds nothing at its own location`, md`5 A/m on both sides`, md`3 A/m on both sides`], 0,
          [null, md`An infinitely thin sheet makes $H_y$ jump by $J_s = 2$ A/m; 4 is only the average of the two sides.`, md`The sheet adds $+1$ on its right and $-1$ on its left.`, md`The sheet adds $+1$ on its right and $-1$ on its left.`])],
      sol: md`The sheet adds $\frac12\mathbf J_s\times\hat n$: $\frac12(2)\,\hat z\times\hat x = +1\hat y$ A/m for $x > 0$ and $-1\hat y$ A/m for $x < 0$, everywhere.

New values at $x = -3, -1.5, 0, 1.5, 3$ m: **$-1\hat y$, $1\hat y$, ($3\hat y$ | $5\hat y$), $4\hat y$, $1\hat y$ A/m.** At $x = 0$, $H_y$ jumps by 2 A/m $= J_s$; the key's "$4\hat y$" there is the average of the two sides.

[[fig:p]]`,
      figs: { p: { svg: hPlot(hyMainSheet, 'x', 'H_y'), cap: '$H_y(x)$ with the sheet (A/m): every point shifts by −1 (x < 0) or +1 (x > 0), with a 2 A/m jump at x = 0.' } } }),
    P({ src: 'Summer 2019 #2(b) · 10 pts', title: 'From A to B to J',
      q: md`**(b)** Consider the magnetic vector potential $\mathbf A(x, y, z) = \hat x\,|z|$.
(i) Show that $\nabla\cdot\mathbf A = 0$. (ii) Determine $\mathbf B$ from $\mathbf A$. (iii) What $\mathbf J(x, y, z)$ would produce this $\mathbf B$?`,
      parts: [
        MC('(ii) $\\mathbf B =$', [md`$+\hat y$ T for $z > 0$, $-\hat y$ T for $z < 0$`, md`$-\hat y$ T for $z > 0$, $+\hat y$ T for $z < 0$`, md`$\hat x\,\text{sgn}(z)$ T`, md`$\hat z$ T`], 0,
          [null, md`Sign of the curl: $(\nabla\times\mathbf A)_y = \partial A_x/\partial z - \partial A_z/\partial x = +\text{sgn}(z)$.`, md`$\nabla\times\mathbf A$ is perpendicular to $\mathbf A$ here, so it cannot be along $\hat x$.`, md`$(\nabla\times\mathbf A)_z = \partial A_y/\partial x - \partial A_x/\partial y = 0$.`]),
        MC('(iii) $\\mathbf J =$', [md`$-\dfrac{2}{\mu_0}\delta(z)\,\hat x$ A/m²`, md`$+\dfrac{2}{\mu_0}\delta(z)\,\hat x$ A/m²`, md`$-\dfrac{1}{\mu_0}\delta(z)\,\hat x$ A/m²`, md`$-\dfrac{2}{\mu_0}\delta(z)\,\hat y$ A/m²`], 0,
          [null, md`Sign: $(\nabla\times\mathbf B)_x = \partial B_z/\partial y - \partial B_y/\partial z = -2\delta(z)$.`, md`$B_y$ jumps from $-1$ to $+1$: a jump of 2, so $2\delta(z)$.`, md`The current must be perpendicular to $\mathbf B$ ($\hat y$) and lie in the sheet: along $\hat x$.`]),
        N('|\\mathbf J_s|', 2 / mu0, 'A/m'),
      ],
      sol: md`**(i)** $\nabla\cdot\mathbf A = \dfrac{\partial A_x}{\partial x} = \dfrac{\partial|z|}{\partial x} = 0$ ✓ ($A_x$ depends on $z$ only).

**(ii)** $\mathbf B = \nabla\times\mathbf A = \hat y\,\dfrac{\partial|z|}{\partial z} = \hat y\,\text{sgn}(z)$: **$+\hat y$ T above, $-\hat y$ T below** the plane $z = 0$.

**(iii)** $\mathbf J = \nabla\times\mathbf H = \frac{1}{\mu_0}\nabla\times\mathbf B$. Only $(\nabla\times\mathbf B)_x = -\partial B_y/\partial z$ survives, and $\text{sgn}(z)$ jumps by 2 at $z = 0$:
$$\mathbf J = -\frac{2}{\mu_0}\delta(z)\,\hat x\ \ \text{A/m}^2,\quad\text{a sheet}\ \ \mathbf J_s = -\frac{2}{\mu_0}\hat x = -1.59\times10^6\,\hat x\ \text{A/m on}\ z = 0$$
Check with the sheet rule above it: $\mathbf H = \frac12\mathbf J_s\times\hat z = -\frac{1}{\mu_0}(\hat x\times\hat z) = +\frac{1}{\mu_0}\hat y$, so $\mathbf B = +\hat y$ ✓.` }),

    R(md`
      ### Problem 3 (25 points): solenoid and Faraday's law

      A wire loop $C$ with resistance $R = 4\ \Omega$ surrounds a tall solenoid of circular cross-section, area 1 m², in the $z = 0$ plane. The solenoid carries a surface current density $J_\phi(t)$ along $\hat\phi$: the direction of the fingers of the right hand when the thumb points along $\hat z$. $C$ is taken along $\hat\phi$ too. Ignore fringing fields.
    `),
    P({ src: 'Summer 2019 #3(a) · 5 pts', title: 'H inside',
      q: md`(a) If $J_\phi(t) = -2t$ A/m, what is $\mathbf H$ inside the solenoid at $t = 1$ s? Give magnitude, direction and unit. (Enter $H_z$.)`,
      parts: [N('H_z(1\\ \\text{s})', -2, 'A/m')],
      sol: md`Ampère on a rectangle straddling the wall: a solenoid's sheet current gives $\mathbf H = J_\phi\hat z$ inside and 0 outside (RHR: current along $\hat\phi$, field along $\hat z$).
$$\mathbf H = -2t\,\hat z\ \ \text{A/m}\quad\Rightarrow\quad\mathbf H(1\ \text{s}) = -2\hat z\ \ \text{A/m}$$
Magnitude 2 A/m, along $-\hat z$ (the current flows along $-\hat\phi$).` }),
    P({ src: 'Summer 2019 #3(b) · 5 pts', title: 'Flux linking C',
      q: md`(b) With $J_\phi(t) = -2t$ A/m, what is the magnetic flux $\Psi(t)$ linking the loop $C$?`,
      parts: [MC('$\\Psi(t) =$', [md`$-2\mu_0t$ Wb`, md`$-2t$ Wb`, md`$+2\mu_0t$ Wb`, md`$-2\pi\mu_0t$ Wb`], 0,
        [null, md`Flux uses $\mathbf B = \mu_0\mathbf H$, not $\mathbf H$.`, md`$C$ along $\hat\phi$ fixes $d\mathbf S = +\hat z$, and $\mathbf B$ points along $-\hat z$: the flux is negative.`, md`The cross-section is already given as 1 m²: no $\pi$.`]),
        N('\\Psi(1\\ \\text{s})', -2 * mu0, 'Wb')],
      sol: md`$C$ along $\hat\phi$ gives $d\mathbf S = +\hat z$ (RHR). $\mathbf B = \mu_0\mathbf H = -2\mu_0t\,\hat z$ inside and zero outside, so only the 1 m² cross-section contributes:
$$\Psi(t) = (-2\mu_0t)(1\ \text{m}^2) = -2\mu_0t\ \text{Wb} = -2.51\times10^{-6}\,t\ \text{Wb}$$` }),
    P({ src: 'Summer 2019 #3(c) · 5 pts', title: 'Emf',
      q: md`(c) Given this flux, what is the emf of the loop $C$ along $\hat\phi$?`,
      parts: [N('\\mathcal E', 2 * mu0, 'V')],
      sol: md`$$\emf = -\frac{d\Psi}{dt} = 2\mu_0 = 8\pi\times10^{-7}\ \text{V} = 2.51\ \mu\text{V along}\ +\hat\phi$$
(The key labels $\mu_0 = 4\pi\times10^{-7}$ "F/m"; its unit is H/m.)` }),
    P({ src: 'Summer 2019 #3(d) · 5 pts', title: 'Current',
      q: md`(d) Given this emf, what is the loop current $I$ around $C$ along $\hat\phi$?`,
      parts: [N('I', 2 * mu0 / 4, 'A')],
      sol: md`$$I = \frac{\emf}{R} = \frac{8\pi\times10^{-7}\ \text{V}}{4\ \Omega} = 2\pi\times10^{-7}\ \text{A} = 0.628\ \mu\text{A along}\ +\hat\phi$$` }),
    P({ src: 'Summer 2019 #3(e) · 5 pts', title: 'Lenz',
      q: md`(e) Discuss how the direction of $I$ in (d) complies with Lenz's law.`,
      parts: [MC('', [md`The flux points $-\hat z$ and grows in size; $I$ along $+\hat\phi$ makes $+\hat z$ field inside $C$, opposing that growth`, md`It should flow along $-\hat\phi$, with the solenoid current, to reinforce the field`, md`No current should flow: the wire sits where $\mathbf B = 0$`], 0,
        [null, md`Reinforcing the growing $-\hat z$ flux is the opposite of Lenz.`, md`The emf depends on the flux through $C$, not on $\mathbf B$ at the wire.`])],
      sol: md`The solenoid's flux points along $-\hat z$ and grows in magnitude ($\Psi = -2\mu_0t$ is decreasing). The induced current along $+\hat\phi$ makes $+\hat z$ field inside $C$ (RHR), opposing that growth ✓. In signs: $\Psi$ decreasing gives $\emf = -d\Psi/dt > 0$ along $C$.` }),
  ];

  // ================================================================ Summer 2019 (conflict)
  const hzConf = [[-3.5, 0], [-3, 0], [-1, 4], [1, 4], [2, 0], [3.5, 0]];
  const hzConfSheet = [[-3.5, 1], [-3, 1], [-1, 5], [0, 5], [0, 3], [1, 3], [2, -1], [3.5, -1]];
  const su19c = [
    R(md`
      **Summer 2019 · ECE 329 · Exam 2, conflict version.** Wednesday, July 10, 2019, 11:00–11:50 AM (50 minutes), same rules as the main exam: open book, no calculators, two 8.5″×11″ formula sheets. Three problems, 25 points each, 75 points. It mirrors the main exam with new geometry. The key has one real error (#2(a)(iii), the sheet's sign) and two unit slips; each is flagged.

      **What it tests.** Capacitance, conductance and the RC time of a leaky capacitor ([Topic 2](#/l/t2-capacitance), [Topic 3](#/l/t3-relaxation)); slabs and a sheet of current ([Topic 6](#/l/t6-sheets)); the vector potential ([Topic 7](#/l/t7-flux)); Faraday's law around a solenoid, worked backward from the current ([Topic 8](#/l/t8-faraday)).
    `),
    R(md`
      ### Problem 1 (25 points): capacitance

      An air-filled parallel-plate capacitor has capacitance $C = 8.854$ pF.
    `),
    P({ src: 'Summer 2019 conflict #1(a) · 5 pts', title: 'New dielectric',
      q: md`(a) What would $C$ be if the filling were a dielectric with $\epsilon = 2\epsilon_0$?`,
      parts: [N('C', 2 * 8.854e-12, 'F')],
      sol: md`$C = \epsilon\,(A/d)$; with air, $A/d = C/\epsilon_0 = 8.854\ \text{pF}/(8.854\ \text{pF/m}) = 1$ m. Doubling $\epsilon$ doubles $C$: **$C = 17.7$ pF**.` }),
    P({ src: 'Summer 2019 conflict #1(b) · 5 pts', title: 'Conductance',
      q: md`(b) What would the conductance of the same capacitor be if the dielectric's conductivity were $\sigma = 10^{-6}$ S/m?`,
      parts: [N('G', 1e-6, 'S')],
      sol: md`Same geometric factor: $G = \sigma\,(A/d) = (10^{-6}\ \text{S/m})(1\ \text{m}) = 10^{-6}$ S, i.e. a leakage resistance $R = 1/G = 1$ MΩ.` }),
    P({ src: 'Summer 2019 conflict #1(c) · 7 pts', title: 'Steady state',
      q: md`(c) The capacitor with this $C$ and $G$ is connected across a 10 V DC source with internal resistance $R_s = 10^6\ \Omega$. What is the capacitor voltage $V_c$ in steady state?`,
      parts: [N('V_c', 5, 'V')],
      sol: md`In DC steady state the capacitance draws no current; only the 1 MΩ leakage remains, in a divider with $R_s = 1$ MΩ:
$$V_c = 10\ \text{V}\cdot\frac{10^6}{10^6 + 10^6} = 5\ \text{V}$$` }),
    P({ src: 'Summer 2019 conflict #1(d) · 8 pts', title: 'Discharge',
      q: md`(d) The source is disconnected at $t = 0$. At what later time $t_1$ is $V_c(t_1) = V_c(0)\,e^{-1}$?`,
      parts: [N('t_1', 2 * 8.854e-12 * 1e6, 's')],
      sol: md`The capacitor discharges through its own leakage:
$$t_1 = \tau = RC = (10^6\ \Omega)(17.7\times10^{-12}\ \text{F}) = 17.7\ \mu\text{s}$$
the same as $\epsilon/\sigma$, the filling's relaxation time.` }),

    RF(md`
      ### Problem 2 (25 points)

      **(a)** Two infinite slabs of finite width in $y$ carry a constant $\hat x$-directed volume current $\mathbf J = J_x\hat x$. Slab 1 occupies $-3 < y < -1$ m with $J_{1x} = 2$ A/m²; slab 2 occupies $1 < y < 2$ m with $J_{2x} = -4$ A/m².

      [[fig:s]]
    `, { s: { svg: slabs([[-3, -1, 1], [1, 2, -1]], 'y', ['J_x = 2\\ \\text{A/m}^2', 'J_x = -4\\ \\text{A/m}^2'], 'cross-section: slab 1 from y = −3 to −1 m carries J = 2 A/m² out of the page (+x); slab 2 from y = 1 to 2 m carries J = −4 A/m², into the page. y to the right, z up, x out of the page'), cap: 'y to the right, z up, x out of the page: slab 1 carries current out of the page, slab 2 into it.' } }),
    P({ src: 'Summer 2019 conflict #2(a)(i) · 5 pts', title: 'H of two slabs',
      q: md`(i) What is $\mathbf H$ on the $y$-axis at $y = -3$, $-1.5$, 0, 1.5 and 3 m? (It points along $\pm\hat z$.)`,
      parts: [MC('At $y = -3$ m and $y = 3$ m, $\\mathbf H$ is…', [md`zero at both`, md`$-2\hat z$ A/m at both`, md`$+2\hat z$ A/m at $y = -3$ and $-2\hat z$ A/m at $y = 3$`, md`$4\hat z$ A/m at both`], 0,
        [null, md`That counts only one slab; the other slab's field is equal and opposite out there.`, md`Each value counts one slab only. Outside both, the two equal and opposite sheets of current cancel.`, md`$4\hat z$ is the field between the slabs.`]),
        N('H_z(-1.5\\ \\text{m})', 3, 'A/m'), N('H_z(0)', 4, 'A/m'), N('H_z(1.5\\ \\text{m})', 2, 'A/m')],
      hints: [md`For an $\hat x$ current, $\frac12\mathbf J_s\times\hat n$ with $\hat n = \pm\hat y$: $\hat x\times\hat y = \hat z$. Inside a slab, $dH_z/dy = J_x$.`],
      sol: md`**Each slab.** For an $\hat x$ current, $\mathbf H = \frac12\mathbf J_s\times\hat n$ gives $+\frac{J_s}{2}\hat z$ on its $+y$ side and $-\frac{J_s}{2}\hat z$ on its $-y$ side ($\hat x\times\hat y = \hat z$), with $J_s = Jw$. Inside, $H_z$ is linear with slope $J_x$ ($\partial H_z/\partial y = J_x$).

- Slab 1: $J_s = (2)(2) = 4$ A/m: $-2\hat z$ below it, $+2\hat z$ above it, $2(y + 2)\hat z$ inside.
- Slab 2: $J_s = (-4)(1) = -4$ A/m: $+2\hat z$ below it, $-2\hat z$ above it, $-4(y - 1.5)\hat z$ inside.

| $y$ (m) | slab 1 | slab 2 | $H_z$ (A/m) |
|---|---|---|---|
| −3 | −2 | +2 | 0 |
| −1.5 | +1 | +2 | 3 |
| 0 | +2 | +2 | 4 |
| 1.5 | +2 | 0 | 2 |
| 3 | +2 | −2 | 0 |

**$\mathbf H = 0,\ 3\hat z,\ 4\hat z,\ 2\hat z,\ 0$ A/m.**` }),
    P({ src: 'Summer 2019 conflict #2(a)(ii) · 5 pts', title: 'Plot H',
      q: md`(ii) Plot $H_x$ and $H_z$ as functions of $y$ for $-3 < y < 3$ m, consistent with part (i), and justify the plot. (The paper writes "$H_x(x)$ and $H_z(x)$ as a function of $y$"; functions of $y$ are meant.)`,
      parts: [MC('Between $y = 1$ and $y = 2$ m, $H_z$…', [md`falls linearly from 4 to 0 A/m (slope $-4$ A/m²)`, md`falls linearly from 4 to 2 A/m`, md`is constant at 2 A/m`, md`rises linearly from 0 to 4 A/m`], 0,
        [null, md`The slope is $J_x = -4$ A/m² over 1 m: the full drop from 4 to 0.`, md`Inside a slab $H_z$ changes, with slope $J_x$.`, md`Wrong sign: $J_x < 0$ in slab 2, so $H_z$ falls.`])],
      sol: md`$H_x = 0$ (and $H_y = 0$): $\hat x$ currents that depend only on $y$ make only $\hat z$ field. $H_z$ is piecewise linear with slope $J_x$:

[[fig:p]]

Zero for $y < -3$; slope $+2$ through slab 1 up to 4 A/m at $y = -1$; flat at 4 A/m to $y = 1$; slope $-4$ through slab 2 down to 0 at $y = 2$; zero beyond.`,
      figs: { p: { svg: hPlot(hzConf, 'y', 'H_z'), cap: '$H_z(y)$ (A/m); $H_x = 0$.' } } }),
    P({ src: 'Summer 2019 conflict #2(a)(iii) · 5 pts', title: 'Adding a current sheet',
      q: md`(iii) How do the answers to (i) and (ii) change if a surface current sheet $\mathbf J_s = -2\hat x$ A/m is placed on the surface $y = 0$?`,
      parts: [N('H_z(-3\\ \\text{m})', 1, 'A/m'), N('H_z(-1.5\\ \\text{m})', 4, 'A/m'), N('H_z(1.5\\ \\text{m})', 1, 'A/m'), N('H_z(3\\ \\text{m})', -1, 'A/m'),
        MC('At $y = 0$ itself, $H_z$ is…', [md`two-valued at the sheet: 5 A/m just below it, 3 A/m just above (average 4)`, md`3 A/m just below, 5 A/m just above`, md`4 A/m on both sides`], 0,
          [null, md`That is the key's sign. With $\mathbf J_s = -2\hat x$, $\frac12\mathbf J_s\times\hat y = -\hat z$ above the sheet: the field drops crossing upward.`, md`An infinitely thin sheet makes $H_z$ jump by $|J_s| = 2$ A/m.`])],
      sol: md`The sheet adds $\frac12\mathbf J_s\times\hat n$: above it ($\hat n = +\hat y$), $\frac12(-2)\,\hat x\times\hat y = -1\hat z$ A/m; below it, $+1\hat z$ A/m.

New values at $y = -3, -1.5, 0, 1.5, 3$ m: **$+1\hat z$, $4\hat z$, ($5\hat z$ below | $3\hat z$ above), $1\hat z$, $-1\hat z$ A/m.** Check the jump: $\hat y\times(\mathbf H_+ - \mathbf H_-) = \hat y\times(-2\hat z) = -2\hat x = \mathbf J_s$ ✓.

[[fig:p]]

**Key error:** the key states the rule correctly ("add $-\hat z$ for $y > 0$, $+\hat z$ for $y < 0$") but its numbers ($-\hat z$, $2\hat z$, $4\hat z$, $3\hat z$, $1\hat z$) and its plot apply the opposite sign.`,
      figs: { p: { svg: hPlot(hzConfSheet, 'y', 'H_z'), cap: '$H_z(y)$ with the sheet (A/m): +1 below y = 0, −1 above, a 2 A/m drop at the sheet.' } } }),
    P({ src: 'Summer 2019 conflict #2(b) · 10 pts', title: 'From A to B to J',
      q: md`**(b)** Consider the magnetic vector potential $\mathbf A(x, y, z) = -\hat y\,|z|$.
(i) Show that $\nabla\cdot\mathbf A = 0$. (ii) Determine $\mathbf B$ from $\mathbf A$. (iii) What $\mathbf J(x, y, z)$ would produce this $\mathbf B$?`,
      parts: [
        MC('(ii) $\\mathbf B =$', [md`$+\hat x$ T for $z > 0$, $-\hat x$ T for $z < 0$`, md`$-\hat x$ T for $z > 0$, $+\hat x$ T for $z < 0$`, md`$\hat y\,\text{sgn}(z)$ T`, md`$\hat z$ T`], 0,
          [null, md`Sign: $(\nabla\times\mathbf A)_x = \partial A_z/\partial y - \partial A_y/\partial z = 0 - (-\text{sgn}\,z) = +\text{sgn}(z)$.`, md`$\nabla\times\mathbf A$ is perpendicular to $\mathbf A$ here; it cannot be along $\hat y$.`, md`$(\nabla\times\mathbf A)_z = \partial A_y/\partial x - \partial A_x/\partial y = 0$.`]),
        MC('(iii) $\\mathbf J =$', [md`$+\dfrac{2}{\mu_0}\delta(z)\,\hat y$ A/m²`, md`$-\dfrac{2}{\mu_0}\delta(z)\,\hat y$ A/m²`, md`$\dfrac{1}{\mu_0}\delta(z)\,\hat y$ A/m²`, md`$\dfrac{2}{\mu_0}\delta(z)\,\hat x$ A/m²`], 0,
          [null, md`Sign: $(\nabla\times\mathbf B)_y = \partial B_x/\partial z - \partial B_z/\partial x = +2\delta(z)$.`, md`$B_x$ jumps from $-1$ to $+1$: a jump of 2.`, md`The current must be perpendicular to $\mathbf B$ ($\hat x$) and lie in the sheet: along $\hat y$.`]),
        N('|\\mathbf J_s|', 2 / mu0, 'A/m'),
      ],
      sol: md`**(i)** $\nabla\cdot\mathbf A = \dfrac{\partial A_y}{\partial y} = \dfrac{\partial(-|z|)}{\partial y} = 0$ ✓.

**(ii)** $\mathbf B = \nabla\times\mathbf A = -\hat x\,\dfrac{\partial A_y}{\partial z} = \hat x\,\text{sgn}(z)$: **$+\hat x$ T above, $-\hat x$ T below** $z = 0$.

**(iii)** $\mathbf J = \frac{1}{\mu_0}\nabla\times\mathbf B$; only $(\nabla\times\mathbf B)_y = \partial B_x/\partial z = 2\delta(z)$ survives:
$$\mathbf J = \frac{2}{\mu_0}\delta(z)\,\hat y\ \ \text{A/m}^2,\quad\text{a sheet}\ \ \mathbf J_s = \frac{2}{\mu_0}\hat y = 1.59\times10^6\,\hat y\ \text{A/m on}\ z = 0$$
Check above the sheet: $\mathbf H = \frac12\mathbf J_s\times\hat z = \frac{1}{\mu_0}(\hat y\times\hat z) = \frac{1}{\mu_0}\hat x$, so $\mathbf B = +\hat x$ ✓. (The key gives $\mathbf H = \pm\frac{1}{\mu_0}$ in "Wb/m²"; H is in A/m.)` }),

    R(md`
      ### Problem 3 (25 points): solenoid and Faraday's law

      A wire loop $C$ with resistance $R = 4\ \Omega$ surrounds a tall solenoid of circular cross-section, area 1 m², in the $z = 0$ plane. The solenoid carries a surface current density $J_\phi(t) = Kt$ along $\hat\phi$ (the fingers of the right hand when the thumb points along $\hat z$), where $K$ is a constant to be found. $C$ is along $\hat\phi$; ignore fringing.
    `),
    P({ src: 'Summer 2019 conflict #3(a) · 5 pts', title: 'Emf from the current',
      q: md`(a) The current in loop $C$ is $I = 2\pi\times10^{-7}$ A along $\hat\phi$. What is the emf of the loop?`,
      parts: [N('\\mathcal E', 8 * PI * 1e-7, 'V')],
      sol: md`$$\emf = IR = (2\pi\times10^{-7}\ \text{A})(4\ \Omega) = 8\pi\times10^{-7}\ \text{V} = 2.51\ \mu\text{V along}\ +\hat\phi$$` }),
    P({ src: 'Summer 2019 conflict #3(b) · 5 pts', title: 'Flux from the emf',
      q: md`(b) Given this emf, what is the magnetic flux $\Psi(t)$ linking $C$?`,
      parts: [MC('$\\Psi(t) =$', [md`$-8\pi\times10^{-7}\,t$ Wb`, md`$+8\pi\times10^{-7}\,t$ Wb`, md`$-8\pi\times10^{-7}$ Wb, constant`, md`$-4\pi\times10^{-7}\,t^2$ Wb`], 0,
        [null, md`A positive emf along $C$ needs a **decreasing** flux: $\Psi = -\int\emf\,dt$.`, md`A constant flux induces no emf.`, md`The emf is constant, so $\Psi$ is linear in $t$.`]),
        N('\\Psi(1\\ \\text{s})', -8 * PI * 1e-7, 'Wb')],
      sol: md`$\emf = -d\Psi/dt$ with a constant emf, and $\Psi(0) = 0$ because $J_\phi(0) = 0$:
$$\Psi(t) = -8\pi\times10^{-7}\,t\ \ \text{Wb}\quad(d\mathbf S = +\hat z\ \text{from}\ C\ \text{along}\ \hat\phi)$$` }),
    P({ src: 'Summer 2019 conflict #3(c) · 5 pts', title: 'H inside',
      q: md`(c) Given this $\Psi(t)$, what is $H_z(t)$ within the solenoid? Ignore fringing.`,
      parts: [MC('$H_z(t) =$', [md`$-2t$ A/m ($t$ in s)`, md`$+2t$ A/m`, md`$-8\pi\times10^{-7}\,t$ A/m`, md`$-2t/\mu_0$ A/m`], 0,
        [null, md`$\Psi < 0$ with $d\mathbf S = +\hat z$: the field points along $-\hat z$.`, md`That is $B_z$ in T; divide by $\mu_0$.`, md`One $\mu_0$ too many: $H_z = \Psi/(\mu_0A)$.`])],
      sol: md`Only the 1 m² cross-section carries flux: $B_z = \Psi/A = -8\pi\times10^{-7}\,t$ T, so
$$H_z = \frac{B_z}{\mu_0} = \frac{-8\pi\times10^{-7}\,t}{4\pi\times10^{-7}} = -2t\ \ \text{A/m}$$
**Key error (unit):** the key writes "A/s". $H$ is in A/m; the coefficient $-2$ is in A/(m·s).` }),
    P({ src: 'Summer 2019 conflict #3(d) · 5 pts', title: 'B at the center',
      q: md`(d) Given this $H_z(t)$, what is $\mathbf B$ at the center of the solenoid at $t = 1$ s? Give magnitude, direction and unit. (Enter $B_z$.)`,
      parts: [N('B_z(1\\ \\text{s})', -8 * PI * 1e-7, 'T')],
      sol: md`$H_z(1\ \text{s}) = -2$ A/m (the key's "A/s" again should be A/m), so
$$\mathbf B = \mu_0\mathbf H = (4\pi\times10^{-7})(-2)\,\hat z = -8\pi\times10^{-7}\,\hat z\ \text{T} = -2.51\ \mu\text{T}\,\hat z$$
Magnitude 2.51 μT, along $-\hat z$.` }),
    P({ src: 'Summer 2019 conflict #3(e) · 5 pts', title: 'The constant K',
      q: md`(e) Given this $H_z(t)$, what is the constant $K$ in $J_\phi(t) = Kt$?`,
      parts: [N('K', -2, 'A/(m·s)')],
      sol: md`Inside a solenoid $H_z = J_\phi$, so $Kt = -2t$: **$K = -2$ A/(m·s)**. Lenz check: $J_\phi$ is along $-\hat\phi$ and growing, so the $-\hat z$ flux grows, and the induced current runs along $+\hat\phi$, the positive $I$ given in (a) ✓.` }),
  ];

  // ================================================================ Summer 2018
  const su18 = [
    R(md`
      **Summer 2018 · ECE 329 · Exam 2.** Thursday, July 12, 2018, 11:00–11:50 AM (50 minutes). Three problems, 25 points each, 75 points. Closed book; no calculators; two 8.5″×11″ formula sheets, both sides. Show all your work and reasoning; units on every answer. The key is handwritten; it has one arithmetic error (#1(b)(iii)).

      **What it tests.** Ampère's law for a volume current ([Topic 5](#/l/t5-ampere)); line and sheet currents written with deltas ([deltas](#/l/u0-deltas), [Topic 6](#/l/t6-sheets)); a loop moving through a nonuniform field ([Topic 9](#/l/t9-motional)); voltmeters in an induced field ([Topic 10](#/l/t10-voltmeters)).
    `),
    R(md`
      ### Problem 1 (25 points): DC magnetic fields

      **(a)** A cylinder of radius $a$ centered on the $z$-axis carries the volume current density $\mathbf J = \hat z/\pi$ A/m² for $r = \sqrt{x^2 + y^2} < a$, and zero outside. It produces a DC field $\mathbf B = B_\phi(r)\hat\phi$ around the $z$-axis, like a wire.
    `),
    P({ src: 'Summer 2018 #1(a)(i) · 6 pts', title: 'Inside the cylinder',
      q: md`(i) Using the integral form of Ampère's law, show that $B_\phi(r) = \dfrac{\mu_0r}{2\pi}$ for $r < a$. Include a picture of the integration contour you use and explain your reasoning.`,
      parts: [MC('The current enclosed by a circle of radius $r < a$ is…', [md`$r^2$ A ($r$ in m)`, md`$a^2$ A`, md`$r^2/\pi$ A`, md`$2r$ A`], 0,
        [null, md`$a^2$ A is the total current, enclosed only for $r > a$.`, md`$J = 1/\pi$ times the area $\pi r^2$ gives $r^2$: the $\pi$ cancels.`, md`That integrates $J$ along the circumference; the enclosed current is $J$ times the disk's area.`])],
      sol: md`**Contour:** a circle of radius $r$ centered on the axis, in a plane $z = \text{const}$, counterclockwise from $+z$ (figure). By symmetry $B_\phi$ is the same all around it and parallel to $d\mathbf l$:
$$\oint\mathbf B\cdot d\mathbf l = 2\pi rB_\phi = \mu_0I_{\text{enc}} = \mu_0J\pi r^2 = \mu_0r^2\quad\Rightarrow\quad B_\phi = \frac{\mu_0r}{2\pi}\ \ \text{T}\ \ (r < a)\ ✓$$

[[fig:c]]`,
      figs: { c: { svg: s18Amp(), cap: 'Ampère contours: circles centered on the axis, inside for (i) and outside for (ii). J points out of the page.' } } }),
    P({ src: 'Summer 2018 #1(a)(ii) · 5 pts', title: 'Outside the cylinder',
      q: md`(ii) Using Ampère's law, determine $B_\phi(r)$ for $r > a$.`,
      parts: [MC('$B_\\phi(r > a) =$', [md`$\dfrac{\mu_0a^2}{2\pi r}$ T`, md`$\dfrac{\mu_0r}{2\pi}$ T`, md`$\dfrac{\mu_0a}{2\pi}$ T`, md`$\dfrac{\mu_0a^2}{2r}$ T`], 0,
        [null, md`That is the inside result; outside, the enclosed current stops growing at $a^2$.`, md`Outside, the field falls as $1/r$: it is constant only on the boundary circle.`, md`A $\pi$ is lost: $I = J\pi a^2 = a^2$, and the contour is $2\pi r$ long.`])],
      sol: md`Same circle, now enclosing all the current, $I = J\pi a^2 = a^2$ A:
$$2\pi rB_\phi = \mu_0a^2\quad\Rightarrow\quad B_\phi = \frac{\mu_0a^2}{2\pi r}\ \ \text{T}\ \ (r > a)$$
A wire's field with $I = a^2$. Continuous at $r = a$: both give $\mu_0a/2\pi$ ✓.` }),
    P({ src: 'Summer 2018 #1(a)(iii) · 2 pts', title: 'A number',
      q: md`(iii) What is $H_\phi$ if $a = \pi$ m and $r = a$?`,
      parts: [N('H_\\phi', 0.5, 'A/m')],
      sol: md`$H_\phi = B_\phi/\mu_0 = \dfrac{r}{2\pi} = \dfrac{\pi}{2\pi} = 0.5$ A/m.` }),
    P({ src: 'Summer 2018 #1(a)(iv) · 2 pts', title: 'Another number',
      q: md`(iv) What is $H_\phi$ if $a = 1$ m and $r = 2a$?`,
      parts: [N('H_\\phi', 1 / (4 * PI), 'A/m')],
      sol: md`$H_\phi = \dfrac{a^2}{2\pi r} = \dfrac{1}{2\pi(2)} = \dfrac{1}{4\pi} = 0.0796$ A/m.` }),
    R(md`
      **(b)** Consider the DC current density $\mathbf J(x, y, z) = P\,\delta(x)\delta(y)\,\hat z + Q\,\delta(z)\,\hat x$ A/m², with $x$, $y$, $z$ in meters.
    `),
    P({ src: 'Summer 2018 #1(b)(i) · 2 pts', title: 'Units',
      q: md`(i) What are the units of $P$ and $Q$ in the MKSA system? Justify your answer.`,
      parts: [MC('', [md`$P$ in A, $Q$ in A/m`, md`both in A/m²`, md`$P$ in A/m, $Q$ in A`, md`$P$ in A·m², $Q$ in A·m`], 0,
        [null, md`$\mathbf J$ is in A/m², but each $\delta$ carries a unit of 1/m.`, md`Swapped: two deltas (1/m²) go with $P$, one with $Q$.`, md`That multiplies by meters; a delta divides by them.`])],
      sol: md`$\delta(x)$ has units 1/m (its integral over $x$ is 1). $P\delta(x)\delta(y)$ must be A/m², so **$P$ is in A**: a line current. $Q\delta(z)$ must be A/m², so **$Q$ is in A/m**: a surface current.` }),
    P({ src: 'Summer 2018 #1(b)(ii) · 3 pts', title: 'Sketch the currents',
      q: md`(ii) Sketch the current system described by $\mathbf J$ in Cartesian coordinates, showing where the currents flow and in which directions.`,
      parts: [MC('The current system is…', [md`a line current $P$ along $+\hat z$ on the $z$-axis, plus a sheet $Q$ flowing along $+\hat x$ over the whole plane $z = 0$`, md`two line currents: $P$ along the $z$-axis and $Q$ along the $x$-axis`, md`a line current $P$ along $+\hat x$ on the $z$-axis, plus a sheet $Q$ on the plane $x = 0$`, md`a sheet $P$ on the plane $z = 0$ and a line current $Q$ along the $x$-axis`], 0,
        [null, md`$\delta(z)$ alone confines current to a plane, not a line: $Q$ is a sheet.`, md`The direction is the unit vector: $P$ flows along $\hat z$; $\delta(x)\delta(y)$ puts it on the $z$-axis.`, md`Two deltas make a line, one makes a sheet: $P$ is the line.`])],
      sol: md`$P\,\delta(x)\delta(y)\,\hat z$: a line current $P$ on the $z$-axis ($x = y = 0$), flowing along $+\hat z$. $Q\,\delta(z)\,\hat x$: a surface current $Q$ (A/m) over the whole plane $z = 0$, flowing along $+\hat x$.

[[fig:k]]`,
      figs: { k: { svg: s18Sys(), cap: 'The line current P along +z, and the sheet Q flowing along +x on the plane z = 0 (x points toward you).' } } }),
    P({ src: 'Summer 2018 #1(b)(iii) · 5 pts', title: 'H at a point',
      q: md`(iii) With $P = Q = 1$ in MKSA units, find $\mathbf H(1, 0, 1)$ caused by $\mathbf J$. (It points along $\pm\hat y$; enter $H_y$.)`,
      parts: [N('H_y(1,0,1)', (1 - PI) / (2 * PI), 'A/m')],
      hints: [md`The line current gives $\frac{P}{2\pi\rho}\hat\phi$; at $(1, 0, z)$, $\rho = 1$ and $\hat\phi = \hat y$.`, md`The sheet gives $\frac12\mathbf J_s\times\hat n$ with $\hat n = +\hat z$ above it.`],
      sol: md`**Line current** (1 A along $+\hat z$): the point is 1 m from the $z$-axis, along $+\hat x$. RHR: $\hat z\times\hat x = \hat y$, so $\mathbf H_P = \dfrac{1}{2\pi(1)}\hat y$.

**Sheet** (1 A/m along $+\hat x$ on $z = 0$): the point is above it, $\hat n = +\hat z$: $\mathbf H_Q = \frac12\hat x\times\hat z = -\frac12\hat y$ (independent of distance).
$$\mathbf H(1, 0, 1) = \left(\frac{1}{2\pi} - \frac12\right)\hat y = \frac{1 - \pi}{2\pi}\hat y = -0.341\,\hat y\ \ \text{A/m}$$
**Key error:** the key's last step writes $(2 - \pi)/(2\pi)$; $\frac{1}{2\pi} - \frac12 = \frac{1 - \pi}{2\pi}$.` }),

    R(md`
      ### Problem 2 (25 points): Faraday's law and emf

      A conducting square loop, 1 m × 1 m, moves with velocity $\mathbf v = 4\hat x$ m/s through a region where the static field is
      $$\mathbf B(x, y, z) = \hat y\,25\times10^{-6}(1 + x/L)\ \ \text{T}, \qquad L = 1000\ \text{m}$$
      The center of the loop is at the origin at $t = 0$.
    `),
    P({ src: 'Summer 2018 #2(a) · 4 pts', title: 'No current',
      q: md`(a) Show, with a diagram, a possible orientation of the loop for which no current is induced as it moves.`,
      parts: [MC('', [md`Any orientation with $\mathbf B$ in the plane of the loop (normal ⊥ $\hat y$): for example the $xy$-plane or the $yz$-plane`, md`the $xz$-plane, facing $\mathbf B$`, md`any orientation: $\mathbf B$ is static`, md`only the $yz$-plane`], 0,
        [null, md`Facing $\mathbf B$ gives the most flux, and it changes as the loop moves into stronger field.`, md`The field is static, but the loop moves through a nonuniform field, so its flux can change.`, md`The $xy$-plane works too: any loop whose plane contains $\hat y$ has zero flux.`])],
      sol: md`No current needs $\Psi$ constant. If the loop's plane contains $\hat y$ (its normal is perpendicular to $\mathbf B$), no field line crosses it: $\Psi = 0$ at every position, so $\emf = 0$. Example: the loop lying flat in the $xy$-plane.

[[fig:o]]`,
      figs: { o: { svg: PF.row([{ svg: s18Orient('zero'), cap: '(a) Flat in the xy-plane: B grazes the loop, Ψ = 0.' }, { svg: s18Orient('max'), cap: '(b) In the xz-plane: B crosses it face-on.' }]).svg } } }),
    P({ src: 'Summer 2018 #2(b) · 4 pts', title: 'Maximum current',
      q: md`(b) What orientation of the loop maximizes the induced current? Show with a diagram.`,
      parts: [MC('', [md`in the $xz$-plane, normal along $\hat y$, facing $\mathbf B$`, md`in the $xy$-plane`, md`in the $yz$-plane`, md`tilted 45° between the $xy$- and $xz$-planes`], 0,
        [null, md`$\mathbf B$ lies in the $xy$-plane's loop: zero flux, zero current.`, md`Normal $\hat x$ ⊥ $\mathbf B$: zero flux.`, md`The rate of change of flux, and the current, go as $\cos45°$.`])],
      sol: md`$|I| = |\emf|/R$ with $\emf = -d\Psi/dt \propto \cos\theta$, $\theta$ the angle between the normal and $\hat y$. Maximum for $\theta = 0$: the loop faces $\mathbf B$, in the **$xz$-plane** (figure (b) in part a).` }),
    P({ src: 'Summer 2018 #2(c) · 8 pts', title: 'Flux of the moving loop',
      q: md`(c) For the orientation of (b), find $\Psi(t)$ for $t > 0$, and show the circulation $C$ that goes with your $\Psi$. Since 1 m $\ll L$, the field across the loop can be approximated by its value at the loop's center.`,
      parts: [MC('$\\Psi(t) =$ (with $d\\mathbf S = +\\hat y$)', [md`$25\times10^{-6}(1 + 4t/L)$ Wb`, md`$25\times10^{-6}(1 + t/L)$ Wb`, md`$25\times10^{-6}\cdot4t/L$ Wb`, md`$-25\times10^{-6}(1 + 4t/L)$ Wb`], 0,
          [null, md`The center moves: $x = vt = 4t$.`, md`The constant part of $B$ is flux too.`, md`With $d\mathbf S = +\hat y$ and $\mathbf B$ along $+\hat y$, the flux is positive.`]),
        FIX('With $d\\mathbf S = +\\hat y$, $C$ runs (seen from $+y$)…', ['counterclockwise', 'clockwise'], 0, [null, md`RHR: thumb along $+\hat y$, the fingers curl counterclockwise as seen from the tip ($+y$).`]),
        N('\\Psi(0)', 25e-6, 'Wb')],
      sol: md`Loop in the $xz$-plane with $d\mathbf S = +\hat y\,dx\,dz$, so $C$ runs counterclockwise seen from $+y$ (RHR). The center is at $x = 4t$:
$$\Psi(t) = B_y(4t)\,(1\ \text{m}^2) = 25\times10^{-6}\left(1 + \frac{4t}{L}\right)\ \text{Wb}$$
(Exact, in fact: $B$ is linear in $x$, so its average over the loop is its value at the center.) The key's "V·s" is the same unit as Wb.` }),
    P({ src: 'Summer 2018 #2(d) · 6 pts', title: 'Emf',
      q: md`(d) Find the induced emf $\emf(t)$ for $t > 0$ from $\Psi(t)$.`,
      parts: [N('\\mathcal E\\ \\text{along}\\ C', -1e-7, 'V')],
      sol: md`$$\emf = -\frac{d\Psi}{dt} = -\frac{(25\times10^{-6})(4)}{1000} = -1.0\times10^{-7}\ \text{V}$$
Constant, and negative along $C$: clockwise seen from $+y$. Lenz: the loop moves into stronger $+\hat y$ field, so its current makes $-\hat y$ field inside: clockwise from $+y$ ✓.` }),
    P({ src: 'Summer 2018 #2(e) · 3 pts', title: 'Current',
      q: md`(e) What is the magnitude of the loop current if the loop resistance is $2\ \Omega$?`,
      parts: [N('|I|', 5e-8, 'A')],
      sol: md`$|I| = |\emf|/R = 10^{-7}\ \text{V}/2\ \Omega = 5\times10^{-8}$ A $= 50$ nA.` }),

    RF(md`
      ### Problem 3 (25 points): voltmeters

      Voltmeters V1 and V2 connect the points O = (0, 0) and P = (2, 2) m in the $xy$-plane along the sides of a 2 m × 2 m square, as shown. A uniform field $\mathbf B = -3t\,\hat z$ Wb/m² links the square.

      [[fig:v]]
    `, { v: { svg: s18Volt(false), cap: md`$V_1$ sits in the left side, $V_2$ in the right side, each with + at the top. The top wire joins $V_1$ to P; the bottom wire joins $V_2$ to O. The crosses are $\mathbf B = -3t\,\hat z$, into the page.` } }),
    P({ src: 'Summer 2018 #3(a) · 3 pts', title: 'Flux',
      q: md`(a) Using $d\mathbf S = \hat z\,dx\,dy$, find the flux $\Psi(t) = \int_S\mathbf B\cdot d\mathbf S$ through the square loop formed by the voltmeters.`,
      parts: [MC('$\\Psi(t) =$', [md`$-12t$ Wb`, md`$-3t$ Wb`, md`$+12t$ Wb`, md`$-6t$ Wb`], 0,
        [null, md`Multiply by the area: 2 m × 2 m = 4 m².`, md`$\mathbf B$ points along $-\hat z$, against $d\mathbf S$: negative.`, md`The area is 4 m², not 2 m².`])],
      sol: md`$$\Psi(t) = (-3t)(\hat z\cdot\hat z)(4\ \text{m}^2) = -12t\ \ \text{Wb}$$
(The key writes V·s, the same unit.)` }),
    P({ src: 'Summer 2018 #3(b) · 4 pts', title: 'Emf',
      q: md`(b) Find the strength and direction of the emf $\emf$ around the square from $\Psi(t)$.`,
      parts: [N('\\mathcal E\\ (\\text{counterclockwise})', 12, 'V'), FIX('Direction, seen from $+z$', ['counterclockwise: O → (2,0) → P → (0,2) → O', 'clockwise'], 0, [null, md`The emf is $+12$ V along the counterclockwise $C$ that goes with $d\mathbf S = +\hat z$.`])],
      sol: md`$d\mathbf S = +\hat z$ goes with $C$ counterclockwise from $+z$.
$$\emf = -\frac{d\Psi}{dt} = +12\ \text{V along}\ C\ \text{(counterclockwise)}$$
Lenz: the $-\hat z$ flux grows, so the current makes $+\hat z$ field inside: counterclockwise ✓.` }),
    P({ src: 'Summer 2018 #3(c) · 3 pts', title: 'Loop current',
      q: md`(c) The voltmeters' internal resistances are $R_1 = R_2 = 3$ kΩ (treat them as resistors). What is the loop current $I$?`,
      parts: [N('I', 2e-3, 'A')],
      sol: md`The meters are the loop's only resistance, in series: $I = \dfrac{12\ \text{V}}{6\ \text{k}\Omega} = 2$ mA, counterclockwise.` }),
    P({ src: 'Summer 2018 #3(d) · 10 pts', title: 'Voltmeter readings',
      q: md`(d) What do V1 and V2 read, paying attention to the polarity of their leads? Each voltmeter displays $\int\mathbf E\cdot d\mathbf l$ from its + tip to its − tip.`,
      parts: [N('V_1', 6, 'V'), N('V_2', -6, 'V')],
      hints: [md`A voltmeter reads the $IR$ drop across its own internal resistance, measured from + to −.`, md`The counterclockwise current runs **down** the left side (through V1 from + to −) and **up** the right side (through V2 from − to +).`],
      sol: md`Each meter reads the drop across its own resistance, from + to −.

- **V1** (left side): the counterclockwise current runs down the left side, entering V1 at + and leaving at −: $V_1 = +IR_1 = (2\ \text{mA})(3\ \text{k}\Omega) = +6$ V.
- **V2** (right side): the current runs up, entering at − and leaving at +: $V_2 = -IR_2 = -6$ V.

Both meters connect the same two points, O and P, yet read differently: $V_1 - V_2 = 12$ V $= \emf$. With a changing flux, "the voltage between O and P" depends on the path ([Topic 10](#/l/t10-voltmeters)).` }),
    P({ src: 'Summer 2018 #3(e) · 5 pts', title: 'A third voltmeter',
      q: md`(e) A third voltmeter V3 with internal resistance $R_3 = 3000$ kΩ is connected diagonally across the square between O and P, + probe at P. What does it read? (Its resistance is so high that the loop current $I$ is unchanged.)

[[fig:v3]]`,
      figs: { v3: { svg: s18Volt(true), cap: '$V_3$ on the diagonal, + toward P.' } },
      parts: [FIX('', ['0 V', '+6 V', '−6 V', '+12 V'], 0,
        [null, md`+6 V is V1's reading, for the path around the left side. The diagonal path encloses only half the flux relative to either side.`, md`−6 V is V2's reading, for the path around the right side.`, md`12 V is the whole emf; the diagonal splits the square into two halves of 6 V each.`])],
      sol: md`Apply Faraday to the lower-right triangle, counterclockwise: O → (2, 0) → P up the right side (through V2, from − to +), then P → O down the diagonal (through V3, from + to −). It encloses 2 m², so its emf is $-\frac{d}{dt}(-3t\cdot2) = 6$ V. Going up through V2 along the current gives $+IR_2 = 6$ V; the diagonal through V3 from + to − gives the reading $V_3$:
$$IR_2 + V_3 = 6\ \text{V}\quad\Rightarrow\quad V_3 = 6 - 6 = 0\ \text{V}$$
**V3 = 0 V.** By symmetry, each half of the square supplies 6 V, exactly the 6 V drop of the meter on that side.` }),
  ];

  // ================================================================ Summer 2017
  const su17 = [
    R(md`
      **Summer 2017 · ECE 329 · Exam 2.** Wednesday, July 12, 2017, 11:00–11:55 AM (55 minutes; the cover sheet is a reused template that says "Summer 15"). Three problems, 25 points each, 75 points. Closed book; no calculators; two 8.5″×11″ formula sheets, both sides. Show all your work and reasoning; units on every answer. The key is handwritten; its relaxation time is upside down (#2(a)(i)).

      **What it tests.** Line currents from delta functions, and superposition ([deltas](#/l/u0-deltas), [Topic 4](#/l/t4-force)); nested solenoids and Lenz ([Topic 5](#/l/t5-ampere), [Topic 8](#/l/t8-faraday)); charge relaxation ([Topic 3](#/l/t3-relaxation)); a small loop moving along a large loop's axis ([Topic 9](#/l/t9-motional)); a voltmeter in an induced field ([Topic 10](#/l/t10-voltmeters)).
    `),
    R(md`
      ### Problem 1 (25 points): line currents and solenoids

      **(a)** Consider the DC current density $\mathbf J(x, y, z) = I_0[\delta(x)\delta(y)\,\hat z + \delta(y)\delta(z)\,\hat x]$ A/m², with coordinates in meters.
    `),
    P({ src: 'Summer 2017 #1(a)(i) · 2 pts', title: 'Units',
      q: md`(i) What are the units of $I_0$ in the MKSA system? Justify your answer.`,
      parts: [MC('', ['A', 'A/m', 'A/m²', 'A·m'], 0, [null, md`Two deltas carry 1/m²; with A/m you would get A/m³.`, md`$\mathbf J$ is A/m², but the two deltas already supply the 1/m².`, md`That multiplies by meters; deltas divide by them.`])],
      sol: md`$\delta(x)\delta(y)$ has units 1/m², and $\mathbf J$ is in A/m², so **$I_0$ is in A**: each term is a line current $I_0$.` }),
    P({ src: 'Summer 2017 #1(a)(ii) · 3 pts', title: 'Sketch the currents',
      q: md`(ii) Sketch the current system described by $\mathbf J$ in Cartesian coordinates, showing where the currents flow and in which directions.`,
      parts: [MC('The current system is…', [md`a current $I_0$ along $+\hat z$ on the $z$-axis, and a current $I_0$ along $+\hat x$ on the $x$-axis`, md`a single current along the line $x = y$`, md`current sheets on the planes $x = 0$ and $z = 0$`, md`a current along $+\hat z$ on the $x$-axis, and along $+\hat x$ on the $z$-axis`], 0,
        [null, md`The two terms are separate line currents, each on its own axis.`, md`Two deltas make a line, not a plane.`, md`The deltas say where: $\delta(x)\delta(y)$ is the $z$-axis, and that term flows along $\hat z$.`])],
      sol: md`$I_0\delta(x)\delta(y)\hat z$: current $I_0$ on the $z$-axis, along $+\hat z$. $I_0\delta(y)\delta(z)\hat x$: current $I_0$ on the $x$-axis, along $+\hat x$.

[[fig:k]]`,
      figs: { k: { svg: s17Lines(), cap: 'Two line currents $I_0$: up the z-axis and along +x (toward you). The point of part (iii) is marked.' } } }),
    P({ src: 'Summer 2017 #1(a)(iii) · 5 pts', title: 'Find the current',
      q: md`(iii) If $\mathbf H(1, 0, -1) = 4\hat y$ A/m is caused by $\mathbf J$, find $I_0$. Show your work.`,
      parts: [N('I_0', 4 * PI, 'A')],
      hints: [md`Both wires are 1 m from $(1, 0, -1)$. Use $\mathbf H = \frac{I}{2\pi\rho}\,\hat I\times\hat\rho$, with $\hat\rho$ pointing from the wire to the point.`],
      sol: md`**$z$-axis wire:** the point is 1 m away along $+\hat x$; $\hat z\times\hat x = \hat y$: $\dfrac{I_0}{2\pi}\hat y$.

**$x$-axis wire:** the point is 1 m away along $-\hat z$; $\hat x\times(-\hat z) = +\hat y$: $\dfrac{I_0}{2\pi}\hat y$.

They add: $\dfrac{I_0}{\pi}\hat y = 4\hat y$ A/m, so **$I_0 = 4\pi$ A $= 12.6$ A**.` }),
    R(md`
      **(b)** A long solenoid around and parallel to the $z$-axis has $N = 1000$ turns/m and radius $a_1 = 1$ m.
    `),
    P({ src: 'Summer 2017 #1(b)(i) · 5 pts', title: 'Solenoid field',
      q: md`(i) The solenoid current $I_1 = 1$ mA generates an internal field $\mathbf H = H_0\hat z$. Find $H_0$ with its unit.`,
      parts: [N('H_0', 1, 'A/m')],
      sol: md`$H_0 = NI_1 = (1000\ \text{m}^{-1})(10^{-3}\ \text{A}) = 1$ A/m (taking $I_1$'s sense to give $+\hat z$).` }),
    P({ src: 'Summer 2017 #1(b)(ii) · 5 pts', title: 'Cancelling the field',
      q: md`(ii) Another solenoid with $N = 1000$ turns/m and radius $a_2 = 0.5$ m is inserted inside the first, and its current $I_2$ is adjusted so that $\mathbf H = 0$ for $r < a_2$. Describe $I_2$ compared with $I_1$.`,
      parts: [N('I_2\\ (\\text{positive in the sense of}\\ I_1)', -1e-3, 'A')],
      sol: md`Inside both: $N_1I_1 + N_2I_2 = 0$, and $N_1 = N_2$, so $I_2 = -I_1 = -1$ mA: **the same magnitude, circulating the opposite way**.` }),
    P({ src: 'Summer 2017 #1(b)(iii) · 5 pts', title: 'Lenz with nested coils',
      q: md`(iii) $I_1$ slowly grows, and $H_0$ grows in proportion. How does $I_2$ respond, according to Faraday's law and Lenz's rule?`,
      parts: [MC('', [md`$|I_2|$ grows: coil 2's induced current flows opposite to $I_1$, the way $I_2$ already flows`, md`$|I_2|$ shrinks toward zero`, md`$I_2$ does not change: its enclosed flux is zero`, md`$I_2$ reverses to flow with $I_1$`], 0,
        [null, md`That would let the $+\hat z$ flux through coil 2 grow unopposed. Lenz opposes it with $-\hat z$ field.`, md`A **changing** flux induces emf; zero flux at the start does not matter.`, md`Flowing with $I_1$ would reinforce the growing flux: the opposite of Lenz.`])],
      sol: md`As $I_1$ grows, coil 1's $+\hat z$ flux through coil 2 grows. Lenz: coil 2's emf drives current that makes $-\hat z$ field, i.e. opposite to $I_1$, which is the sense $I_2$ already has. **$|I_2|$ grows**, tending to keep $\mathbf H = 0$ inside.` }),

    R(md`
      ### Problem 2 (25 points)

      **(a)** In a homogeneous conductor where $\mathbf J = \sigma\mathbf E$, Gauss's law $\nabla\cdot\mathbf E = \rho/\epsilon_0$ and the continuity equation $\partial\rho/\partial t + \nabla\cdot\mathbf J = 0$ combine into
      $$\frac{\partial\rho}{\partial t} + \frac{\sigma}{\epsilon_0}\rho = 0$$
    `),
    P({ src: 'Summer 2017 #2(a)(i) · 6 pts', title: 'Relaxation',
      q: md`(i) Find the solution for $t > 0$ if at $t = 0$ the charge density is $\rho(x, y, z, 0) = \cos(3z)$ C/m³ over all space.`,
      parts: [MC('$\\rho(x, y, z, t) =$', [md`$\cos(3z)\,e^{-t/\tau}$ C/m³ with $\tau = \epsilon_0/\sigma$`, md`$\cos(3z)\,e^{-t/\tau}$ C/m³ with $\tau = \sigma/\epsilon_0$`, md`$\cos(3z - t/\tau)$ C/m³ with $\tau = \epsilon_0/\sigma$`, md`$\cos(3z)\,e^{+t/\tau}$ C/m³ with $\tau = \epsilon_0/\sigma$`], 0,
        [null, md`That is the key's version, and it is upside down: $\sigma/\epsilon_0$ has units 1/s, so it is the decay **rate**. The time constant is $\epsilon_0/\sigma$.`, md`Relaxation does not move the pattern; each point decays in place.`, md`The charge decays; it does not grow.`])],
      sol: md`$$\rho(x, y, z, t) = \cos(3z)\,e^{-t/\tau}\ \ \text{C/m}^3, \qquad \tau = \frac{\epsilon_0}{\sigma}$$
Units: (F/m)/(S/m) = F/S = Ω·F = s ✓.

**Key error:** the key writes $\tau = \sigma/\epsilon_0$. That is the rate in the equation, in 1/s; the time constant is its inverse, $\epsilon_0/\sigma$.` }),
    P({ src: 'Summer 2017 #2(a)(ii) · 6 pts', title: 'The field',
      q: md`(ii) Given this $\rho$ and Gauss's law, find an electric field $\mathbf E(x, y, z, t)$ with only a $z$-component. (Hint: find $\partial E_z/\partial z$ first, then its antiderivative.)`,
      parts: [MC('$\\mathbf E =$', [md`$\dfrac{\sin(3z)}{3\epsilon_0}e^{-t/\tau}\,\hat z$ V/m`, md`$-\dfrac{\sin(3z)}{3\epsilon_0}e^{-t/\tau}\,\hat z$ V/m`, md`$-\dfrac{3\sin(3z)}{\epsilon_0}e^{-t/\tau}\,\hat z$ V/m`, md`$\dfrac{\cos(3z)}{3\epsilon_0}e^{-t/\tau}\,\hat z$ V/m`], 0,
        [null, md`The antiderivative of $\cos(3z)$ is $+\sin(3z)/3$.`, md`That differentiates $\rho$ instead of integrating it.`, md`$\partial/\partial z$ of this gives $-\sin(3z)/\epsilon_0$, not $\rho/\epsilon_0$.`])],
      sol: md`$$\frac{\partial E_z}{\partial z} = \frac{\rho}{\epsilon_0} = \frac{\cos(3z)}{\epsilon_0}e^{-t/\tau}\quad\Rightarrow\quad\mathbf E = \frac{\sin(3z)}{3\epsilon_0}e^{-t/\tau}\,\hat z\ \ \text{V/m}$$
(integration constant zero), with $\tau = \epsilon_0/\sigma$. Check: $\partial_z$ gives back $\rho/\epsilon_0$ ✓.` }),
    P({ src: 'Summer 2017 #2(b) · 13 pts', title: 'A small loop rising along the axis',
      q: md`**(b)** A loop of wire of radius $a_1$ in the $xy$-plane carries current $I$ counterclockwise when viewed from the top. On the $z$-axis, for $z \gg a_1$, its field is
$$\mathbf B = \hat z\,\frac{\mu_0Ia_1^2}{2z^3}$$
Let $a_1 = 1$ m and $I = 2/\mu_0$. Use this field to estimate the induced emf (in volts) of a small loop of radius $a_2 = 1$ cm, encircling the $z$-axis and moving upward with $dz/dt = 1$ m/s near $z = 100$ m. Simplify as much as you can.

[[fig:l]]`,
      figs: { l: { svg: s17Loops(), cap: 'Not to scale: the small loop is 100 m up the axis.' } },
      parts: [N('\\mathcal E\\ (\\text{counterclockwise from above})', 3 * PI * 1e-12, 'V'),
        FIX('Seen from above, the small loop\'s emf drives current', ['counterclockwise (with I)', 'clockwise (against I)'], 0, [null, md`Moving up, the loop loses upward flux; Lenz tops it up with upward field: counterclockwise.`])],
      hints: [md`With $I = 2/\mu_0$ and $a_1 = 1$ m, $B_z = 1/z^3$ T. The small loop sees a nearly uniform field: $\Psi = \pi a_2^2B_z$.`, md`$\dfrac{d\Psi}{dt} = \dfrac{d\Psi}{dz}\dfrac{dz}{dt}$.`],
      sol: md`With $I = 2/\mu_0$ and $a_1 = 1$ m, $B_z = \dfrac{\mu_0(2/\mu_0)(1)^2}{2z^3} = \dfrac{1}{z^3}$ T ($z$ in m). The 1 cm loop is tiny next to 100 m, so $B$ is uniform across it. With $C$ counterclockwise from above ($d\mathbf S = +\hat z$):
$$\Psi = \pi a_2^2B_z = \frac{\pi\times10^{-4}}{z^3}\ \text{Wb}$$
$$\emf = -\frac{d\Psi}{dz}\frac{dz}{dt} = \frac{3\pi\times10^{-4}}{z^4}\frac{dz}{dt} = \frac{3\pi\times10^{-4}}{(100)^4}(1) = 3\pi\times10^{-12}\ \text{V} = 9.4\ \text{pV}$$
Positive: counterclockwise from above, the same sense as $I$. Lenz: moving up, the loop loses upward flux, and its current tops it up ✓.` }),

    RF(md`
      ### Problem 3 (25 points): resistors and a voltmeter in an induced field

      Resistors $R_1 = 1\ \Omega$, $R_2 = 3\ \Omega$ and $R_3 = 2\ \Omega$ form a square loop of 1 m² physical area in a uniform field $\mathbf B = B_0\hat z$ with $dB_0/dt = -12$ T/s. $C$ is the circulation direction marked on the diagram.

      [[fig:c]]
    `, { c: { svg: s17Circuit(false), cap: md`$R_1$ on the left side, $R_2$ on the top, $R_3$ on the right; the bottom is plain wire. C runs counterclockwise. The dots are $\mathbf B = B_0\hat z$, out of the page.` } }),
    P({ src: 'Summer 2017 #3(a) · 5 pts', title: 'Emf',
      q: md`(a) Compute the induced emf $\emf$ in the circuit along $C$.`,
      parts: [N('\\mathcal E', 12, 'V')],
      sol: md`$C$ counterclockwise from $+z$ goes with $d\mathbf S = +\hat z$: $\Psi = B_0(1\ \text{m}^2)$.
$$\emf = -\frac{d\Psi}{dt} = -(1\ \text{m}^2)(-12\ \text{T/s}) = +12\ \text{V along}\ C$$
Lenz: the upward flux falls, so the current tops it up: counterclockwise ✓.` }),
    P({ src: 'Summer 2017 #3(b) · 5 pts', title: 'Current',
      q: md`(b) Compute the loop current $I$ along $C$.`,
      parts: [N('I', 2, 'A')],
      sol: md`$I = \dfrac{\emf}{R_1 + R_2 + R_3} = \dfrac{12\ \text{V}}{6\ \Omega} = 2$ A along $C$ (counterclockwise). Drops: $IR_1 = 2$ V, $IR_2 = 6$ V, $IR_3 = 4$ V.` }),
    P({ src: 'Summer 2017 #3(c) · 10 pts', title: 'The diagonal voltmeter',
      q: md`(c) A voltmeter is connected **diagonally** between A and B, with its + lead at A, splitting the square into two equal triangles. What does it read?

[[fig:d]]`,
      figs: { d: { svg: s17Circuit(true), cap: 'The voltmeter on the diagonal, + at A.' } },
      parts: [N('V', 2, 'V')],
      hints: [md`The meter reads $\int\mathbf E\cdot d\mathbf l$ from A to B along its own path, the diagonal.`, md`Apply Faraday to one triangle: its emf is half the square's, 6 V.`],
      sol: md`Faraday on the lower-right triangle, counterclockwise: B → bottom-right corner (plain wire, no drop) → up through $R_3$ to A → back to B along the diagonal through the meter. It encloses 0.5 m², so its emf is 6 V. Going up through $R_3$ along the current gives $IR_3 = 4$ V; the diagonal from A (+) to B (−) gives the reading $V$:
$$0 + IR_3 + V = 6\ \text{V}\quad\Rightarrow\quad V = 6 - 4 = 2\ \text{V}$$
Check with the other triangle (A → $R_2$ → $R_1$ → B, then B → A through the meter, counterclockwise): $IR_2 + IR_1 - V = 6 + 2 - 2 = 6$ V ✓. **The meter reads 2 V.**` }),
    P({ src: 'Summer 2017 #3(d) · 5 pts', title: 'Reading R3 directly',
      q: md`(d) Describe how you would reconnect the voltmeter between A and B to read the voltage drop of $R_3$ directly.`,
      parts: [MC('', [md`Run the meter and its leads right alongside $R_3$ and the bottom wire, so the loop formed by the meter's path and $R_3$ encloses no flux`, md`Keep the diagonal and subtract half the emf from the reading`, md`It cannot be done: the voltage across $R_3$ is path-dependent`, md`Move the meter far away from the loop`], 0,
        [null, md`That computes $R_3$'s drop on paper, but the meter itself still reads 2 V.`, md`$IR_3 = 4$ V is a property of the resistor; any meter path that hugs $R_3$ reads it.`, md`Leads routed far away enclose **more** changing flux, not less.`])],
      sol: md`A voltmeter reads a resistor's drop when the loop formed by its leads and that resistor links no flux. Route the meter from A down beside $R_3$ and along the bottom wire to B ("right next to the resistor"). Faraday around that thin loop (zero area) gives: drop through $R_3$ + reading = 0. With + at A it reads **$-4$ V**: $R_3$ drops 4 V, with A at the low end, since the current flows up through $R_3$ toward A. Swap the leads to read $+4$ V.` }),
  ];

  // ---------------------------------------------------------------- register, in study order
  EM.lesson('e2-past', { id: 'past-sp18', title: 'Spring 2018 Exam 2', kind: 'exam', sub: '75 min · 100 pts · no key: solved here', steps: sp18 });
  EM.lesson('e2-past', { id: 'past-su20', title: 'Summer 2020 Exam 2', kind: 'exam', sub: '75 pts · key re-derived, 2 errors fixed', steps: su20 });
  EM.lesson('e2-past', { id: 'past-su19', title: 'Summer 2019 Exam 2', kind: 'exam', sub: '50 min · 75 pts', steps: su19 });
  EM.lesson('e2-past', { id: 'past-su19c', title: 'Summer 2019 Exam 2 (conflict)', kind: 'exam', sub: '50 min · 75 pts · key error fixed', steps: su19c });
  EM.lesson('e2-past', { id: 'past-su18', title: 'Summer 2018 Exam 2', kind: 'exam', sub: '50 min · 75 pts · key error fixed', steps: su18 });
  EM.lesson('e2-past', { id: 'past-su17', title: 'Summer 2017 Exam 2', kind: 'exam', sub: '55 min · 75 pts · key error fixed', steps: su17 });
})();

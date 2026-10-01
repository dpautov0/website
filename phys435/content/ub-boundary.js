/* Unit B — Boundary conditions: the whole picture (capstone after Unit 7).
   Lectures 5–6 (conditions at a charged surface), 7 (conductors), 9 (uniqueness), 10–11 (images),
   11–13 (separation of variables); Griffiths 2.3.5, 2.5.3, 3.1.5–3.1.6, 3.2, 3.3.
   Every final answer was checked independently with sympy/mpmath. */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  // multiple choice whose options stay in the printed order ("which step is wrong?")
  const QF = (q, opts, a, why, sol, extra = {}) => Object.assign({ t: 'prob', q, parts: [{ mc: opts, a, why, fixed: true }], sol, concept: true }, extra);

  // =====================================================================================
  // Drawing helpers
  // =====================================================================================
  const D2R = Math.PI / 180;
  const fig = (o) => PF.fig(o);
  const pol = (cx, cy, r, a) => [cx + r * Math.cos(a * D2R), cy - r * Math.sin(a * D2R)];
  const r1 = (v) => Math.round(v * 10) / 10;
  const dpath = (pts) => `M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z`;
  // translucent tint for charged (non-conducting) matter
  const tint = (f, pts, op = 0.16) => { pts.forEach((p) => f.track(p[0], p[1])); f.add(`<path class="nodecl" style="fill:var(--dim);fill-opacity:${op};stroke:none" d="${dpath(pts)}"/>`); return f; };
  // conductors (setup figures are hatched; solution figures draw a dashed outline where the images replace the metal)
  const ball = (f, cx, cy, R) => { f.hatchBand(f.arcPts(cx, cy, R, R, 0, 360)); f.circle(cx, cy, R, { cls: 'thick' }); return f; };
  const ghost = (f, cx, cy, R) => f.circle(cx, cy, R, { cls: 'dash dim' });
  const ringM = (f, cx, cy, Ri, Ro) => { f.hatchBand(f.arcPts(cx, cy, Ro, Ro, 0, 360).concat(f.arcPts(cx, cy, Ri, Ri, 360, 0))); f.circle(cx, cy, Ri, { cls: 'thick' }); f.circle(cx, cy, Ro, { cls: 'thick' }); return f; };
  // small +/- glyphs (drawn, not typeset)
  const plus = (f, x, y, s = 3.2) => { f.track(x - s, y - s, x + s, y + s); return f.add(`<path class="glyph" d="M${r1(x - s)},${r1(y)}H${r1(x + s)}M${r1(x)},${r1(y - s)}V${r1(y + s)}"/>`); };
  const minus = (f, x, y, s = 3.2) => { f.track(x - s, y - s, x + s, y + s); return f.add(`<path class="glyph" d="M${r1(x - s)},${r1(y)}H${r1(x + s)}"/>`); };
  // battery (long plate = +) hanging below (x, y), ending in a ground symbol
  const battery = (f, x, y, lab) => {
    f.line(x, y, x, y + 12); f.line(x - 11, y + 12, x + 11, y + 12); f.line(x - 6, y + 18, x + 6, y + 18, { cls: 'thick' });
    f.line(x, y + 18, x, y + 28); f.ground(x, y + 28);
    if (lab) f.label(x + 16, y + 15, lab, 'l', 'small');
    return f;
  };
  const wireGround = (f, x, y) => { f.line(x, y, x, y + 16); f.ground(x, y + 16); return f; };

  // ---------------------------------------------------------------- 1-D: two parallel plates (side view)
  // o: L, R = labels of the plates; rho: shade the gap; sym: right boundary is a mirror plane; dl: label of the gap
  function figPlates(o = {}) {
    const f = fig();
    const xL = 80, xR = 240, yT = 30, yB = 160;
    if (o.rho) tint(f, [[xL, yT], [xR, yT], [xR, yB], [xL, yB]]);
    f.wall(xL, yT, yB, { side: 'left' });
    if (o.sym) f.line(xR, yT - 10, xR, yB + 10, { cls: 'dash dim' });
    else f.wall(xR, yT, yB, { side: 'right' });
    if (o.L) f.label(xL - 16, yT + 18, o.L, 'r');
    if (o.R) f.label(xR + (o.sym ? 8 : 16), yT + 18, o.R, 'l');
    if (o.rho) f.label((xL + xR) / 2, (yT + yB) / 2, o.rhoLab || md`\rho`, 'c');
    if (o.sym && o.symLab !== false) f.text(xR + 8, yB - 12, o.symLab || 'mirror plane', 'l');
    const ya = yB + 26;
    f.arrow(xL - 34, ya, xR + 54, ya, { cls: 'dim', hs: 6 }); f.label(xR + 58, ya, 'x', 'l', 'small accent');
    f.line(xL, ya - 4, xL, ya + 4, { cls: 'dim' }); f.label(xL, ya + 7, '0', 't', 'small');
    f.line(xR, ya - 4, xR, ya + 4, { cls: 'dim' }); f.label(xR, ya + 7, o.dl || 'd', 't', 'small');
    return f.svg();
  }

  // ---------------------------------------------------------------- semi-infinite slot (Griffiths Ex. 3.3, Lecture 11)
  // o: top, bot, end (labels), far (label or false), dir 'right' (region x>0) | 'left' (region x<0), a: false hides the gap dimension
  function figSlot(o = {}) {
    const f = fig();
    const left = o.dir === 'left';
    const xE = left ? 290 : 70, xF = left ? 60 : 300;
    const yT = 40, yB = 150, ym = (yT + yB) / 2, g = 5;
    const x1 = Math.min(xE, xF), x2 = Math.max(xE, xF);
    if (o.topMirror) f.line(left ? x1 : x1 + g, yT, left ? x2 - g : x2, yT, { cls: 'dash dim' });
    else f.plane(left ? x1 : x1 + g, left ? x2 - g : x2, yT, { side: 'above' });
    f.plane(left ? x1 : x1 + g, left ? x2 - g : x2, yB, { side: 'below' });
    f.wall(xE, yT + g, yB - g, { side: left ? 'right' : 'left' });
    const xl = left ? x1 + 60 : x2 - 60;
    if (o.top) f.label(xl, yT - 14, o.top, 'b');
    if (o.bot) f.label(xl, yB + 14, o.bot, 't');
    if (o.end) f.label(left ? xE + 16 : xE - 16, ym, o.end, left ? 'l' : 'r');
    if (o.far !== false) f.label(left ? xF - 10 : xF + 10, ym, o.far || (left ? md`x\to-\infty` : md`x\to\infty`), left ? 'r' : 'l', 'small accent');
    const kx = x1 + 16, ky = yB - 14;
    f.arrow(kx, ky, kx + 34, ky, { cls: 'dim thin', hs: 5 }); f.label(kx + 38, ky, 'x', 'l', 'small accent');
    f.arrow(kx, ky, kx, ky - 34, { cls: 'dim thin', hs: 5 }); f.label(kx, ky - 38, 'y', 'b', 'small accent');
    if (!left) f.label(xE - 12, yB + 14, '0', 'tr', 'small accent');
    if (o.a !== false) f.dim(left ? x1 + 70 : x2 - 18, yB, left ? x1 + 70 : x2 - 18, yT, 'a', { at: 'l' });
    if (o.pt) { const [px, py] = [left ? xE - (xE - xF) * o.pt[0] : xE + (xF - xE) * o.pt[0], yB - (yB - yT) * o.pt[1]]; f.dot(px, py, 3); f.tag(px, py, o.ptLab || 'P', 'r', 7, 'small'); }
    return f.svg();
  }

  // ---------------------------------------------------------------- rectangular region / pipe cross-section
  // o: top, bot, left, right labels; c0, c1 corner labels; w, h; center: dot; pts: [[fx, fy, lab, at]]
  function figBox(o = {}) {
    const f = fig();
    const W = o.w || 170, H = o.h || 120, x0 = 80, y0 = 40, cx = x0 + W / 2, cy = y0 + H / 2, g = 5;
    f.plane(x0 + g, x0 + W - g, y0, { side: 'above' });
    f.plane(x0 + g, x0 + W - g, y0 + H, { side: 'below' });
    f.wall(x0, y0 + g, y0 + H - g, { side: 'left' });
    f.wall(x0 + W, y0 + g, y0 + H - g, { side: 'right' });
    if (o.top) f.label(cx, y0 - 14, o.top, 'b');
    if (o.bot) f.label(cx, y0 + H + 14, o.bot, 't');
    if (o.left) f.label(x0 - 16, cy, o.left, 'r');
    if (o.right) f.label(x0 + W + 16, cy, o.right, 'l');
    if (o.corners !== false) {
      f.label(x0 - 6, y0 + H + 6, o.c0 || '(0,0)', 'tr', 'small accent');
      f.label(x0 + W + 6, y0 - 6, o.c1 || '(b,a)', 'bl', 'small accent');
    }
    if (o.center) { f.dot(cx, cy, 3); if (o.centerLab) f.tag(cx, cy, o.centerLab, 'r', 8, 'small'); }
    for (const [fx, fy, lab, at] of (o.pts || [])) { const px = x0 + W * fx, py = y0 + H - H * fy; f.dot(px, py, 3); if (lab) f.tag(px, py, lab, at || 'r', 8, 'small'); }
    if (o.diag) f.line(x0 + 8, y0 + H - 8, x0 + W - 8, y0 + 8, { cls: 'dash dim' });
    return f.svg();
  }

  // ---------------------------------------------------------------- cube 0..a in x, y, z (oblique view)
  function figCube(o = {}) {
    const f = fig({ proj: { ox: 70, oy: 205, s: 1.3 } });
    const A = 110;
    f.box3(A, A, A, { shadeTop: true });
    f.axes3(150, { box: [A, A, A] });
    const t = f.p3(A / 2, A / 2, A);
    f.label(t[0], t[1], o.top || 'V_0', 'c');
    if (o.note) f.text(150, 264, o.note, 't');
    return f.svg();
  }

  // ---------------------------------------------------------------- point charge above a grounded plane
  function figPlaneQ(o = {}) {
    const f = fig();
    const y0 = 150, qx = 150, qy = 64;
    if (o.img) f.line(20, y0, 290, y0, { cls: 'dash dim' });
    else f.plane(20, 290, y0, { lab: o.lab });
    f.charge(qx, qy, { q: '+', lab: o.q || 'q', at: 'l' });
    f.dim(qx, qy, qx, y0, o.d || 'd', { off: -46, at: 'r' });
    if (o.img) {
      f.charge(qx, 2 * y0 - qy, { q: (o.qi || '-q').startsWith('+') ? '+' : '-', lab: o.qi || '-q', at: 'l', image: true });
      f.dim(qx, y0, qx, 2 * y0 - qy, o.d || 'd', { off: -46, at: 'r' });
      if (o.lab) f.label(286, y0 - 6, o.lab, 'br', 'small');
    }
    if (o.region) f.label(250, 90, o.region, 'c', 'small accent');
    return f.svg();
  }

  // ---------------------------------------------------------------- charge outside a sphere (grounded / neutral / held at V0 / charge Q)
  // o: cond (label), wire 'ground'|'battery', bat (battery label), A (centre-to-charge, px), img: image solution, ip, il (image pos fraction of R and label), ctr: centre image label
  function figSphereQ(o = {}) {
    const f = fig();
    const cx = 90, cy = 100, R = 50, A = o.A || 160, qx = cx + A;
    if (o.img) ghost(f, cx, cy, R); else ball(f, cx, cy, R);
    f.line(cx, cy, qx - 8, cy, { cls: 'dim thin' });
    if (!o.ctr) f.dot(cx, cy, 2.4);
    const t = pol(cx, cy, R, 120); f.line(cx, cy, t[0], t[1], { cls: 'dim' });
    const tl = pol(cx, cy, R + 12, 120); f.label(tl[0], tl[1], 'R', 'c', 'small');
    if (o.cond) { const c = pol(cx, cy, R + 8, 50); f.label(c[0], c[1], o.cond, 'bl'); }
    f.charge(qx, cy, { q: '+', lab: o.q || 'q', at: 't' });
    f.label((cx + R + qx) / 2, cy - 6, o.alab || 'a', 'b', 'small');
    if (o.wire === 'ground') wireGround(f, cx, cy + R);
    if (o.wire === 'battery') battery(f, cx, cy + R, o.bat || 'V_0');
    if (o.img) {
      const bx = cx + R * R / A;
      f.charge(bx, cy, { q: '-', lab: o.il || "q'", at: o.ctr ? 't' : 'b', image: true, r: 6 });
      if (o.ctr) f.charge(cx, cy, { q: '+', lab: o.ctr, at: 'b', image: true, r: 6 });
    }
    return f.svg();
  }

  // ---------------------------------------------------------------- charge inside a grounded spherical shell
  function figInside(o = {}) {
    const f = fig();
    const cx = 120, cy = 120, R = 80, A = 40;
    if (o.img) ghost(f, cx, cy, R); else ringM(f, cx, cy, R, R + 10);
    f.dot(cx, cy, 2.4);
    f.line(cx, cy, cx + A - 7, cy, { cls: 'dim thin' });
    f.charge(cx + A, cy, { q: '+', lab: 'q', at: 't' });
    f.label(cx + A / 2, cy + 6, 'a', 't', 'small');
    const t = pol(cx, cy, R, 135); f.line(cx, cy, t[0], t[1], { cls: 'dim' });
    const m = pol(cx, cy, R * 0.55, 135); f.label(m[0] - 7, m[1] + 7, 'R', 'tr', 'small');
    if (o.cond !== false) { const c = pol(cx, cy, R + (o.img ? 6 : 16), 40); f.label(c[0], c[1], o.cond || 'V=0', 'bl'); }
    if (o.img) {
      const bx = cx + R * R / A;
      f.line(cx + A + 7, cy, bx - 7, cy, { cls: 'dim dash thin' });
      f.charge(bx, cy, { q: '-', lab: o.il || "q'", at: 't', image: true });
    }
    return f.svg();
  }

  // ---------------------------------------------------------------- sphere in a uniform field E0 z-hat
  // o: metal (default true), q (label beside the sphere), note (words under the figure), lab (field label)
  function figField(o = {}) {
    const f = fig();
    const cx = 160, cy = 112, R = 46, yT = 18, yB = 206;
    for (const dx of [-130, -92, 92, 130]) f.arrow(cx + dx, yB, cx + dx, yT, { cls: 'dim', hs: 6 });
    for (const dx of [-26, 0, 26]) {
      const h = Math.sqrt(R * R - dx * dx);
      f.arrow(cx + dx, yB, cx + dx, cy + h + 9, { cls: 'dim', hs: 6 });
      f.arrow(cx + dx, cy - h - 7, cx + dx, yT, { cls: 'dim', hs: 6 });
    }
    if (o.metal === false) f.circle(cx, cy, R, { cls: 'thick' }); else ball(f, cx, cy, R);
    f.label(cx + 138, yT + 14, o.lab || md`\mathbf E_0`, 'l');
    if (o.q) f.label(cx + R + 10, cy, o.q, 'l');
    if (o.note) f.text(cx, yB + 8, o.note, 't');
    return f.svg();
  }

  // ---------------------------------------------------------------- spherical surface with sigma_0(theta) or V_0(theta), z axis, angle theta
  // o: lab (surface label), metal, inLab, outLab
  function figShell(o = {}) {
    const f = fig();
    const cx = 120, cy = 128, R = 72;
    if (o.metal) ball(f, cx, cy, R); else f.circle(cx, cy, R, { cls: 'thick' });
    f.line(cx, cy + R + 16, cx, cy - R - 36, { cls: 'dim dash', arrow: 'end', hs: 6 }); f.label(cx + 5, cy - R - 38, 'z', 'bl', 'small accent');
    const p = pol(cx, cy, R, 50); f.line(cx, cy, p[0], p[1], { cls: 'dim' });
    f.angle(cx, cy, 24, 50, 90, md`\theta`);
    const m = pol(cx, cy, R * 0.55, 50); f.label(m[0] + 8, m[1] + 6, 'R', 'tl', 'small');
    if (o.lab) { const L = pol(cx, cy, R + 10, 28); f.label(L[0], L[1], o.lab, 'bl'); }
    if (o.inLab) f.label(cx - 30, cy + 34, o.inLab, 'c', 'small');
    if (o.outLab) f.label(cx - R - 10, cy + R - 4, o.outLab, 'r', 'small');
    return f.svg();
  }

  // ---------------------------------------------------------------- two concentric spherical surfaces a < b
  // o: inner, outer labels; outerMetal; innerMetal
  function figConc(o = {}) {
    const f = fig();
    const cx = 140, cy = 132, a = 42, b = 94;
    if (o.outerMetal) ringM(f, cx, cy, b, b + 8); else f.circle(cx, cy, b, { cls: 'thick' });
    if (o.innerMetal) ball(f, cx, cy, a); else f.circle(cx, cy, a, { cls: 'thick' });
    f.line(cx, cy + b + 14, cx, cy - b - 34, { cls: 'dim dash', arrow: 'end', hs: 6 }); f.label(cx + 5, cy - b - 36, 'z', 'bl', 'small accent');
    const pa = pol(cx, cy, a, 210); f.line(cx, cy, pa[0], pa[1], { cls: 'dim' });
    if (o.innerMetal) { const ma = pol(cx, cy, a + 11, 210); f.label(ma[0], ma[1], 'a', 'c', 'small'); } else { const ma = pol(cx, cy, a / 2, 210); f.label(ma[0] + 5, ma[1] + 8, 'a', 'tl', 'small'); }
    const pb = pol(cx, cy, b, 330); f.line(cx, cy, pb[0], pb[1], { cls: 'dim' });
    const mb = pol(cx, cy, 70, 330); f.label(mb[0] + 4, mb[1] - 7, 'b', 'bl', 'small');
    if (o.inner) {
      const s = pol(cx, cy, a, 140), e = pol(cx, cy, b + (o.outerMetal ? 22 : 14), 140);
      f.line(s[0], s[1], e[0], e[1], { cls: 'dim thin' });
      f.label(e[0] - 2, e[1] - 2, o.inner, 'br');
    }
    if (o.outer) { const c = pol(cx, cy, b + (o.outerMetal ? 14 : 6), 42); f.label(c[0], c[1], o.outer, 'bl'); }
    return f.svg();
  }

  // ---------------------------------------------------------------- grounded plane with a hemispherical bump (optionally in a field, or with a charge on the axis)
  function figBump(o = {}) {
    const f = fig();
    const y0 = 182, cx = 170, R = 52;
    f.plane(20, 320, y0, { lab: o.plab });
    if (o.img) {
      f.line(20, y0, 320, y0, { cls: 'dash dim' });
    } else {
      f.hatchBand(f.arcPts(cx, y0, R, R, 0, 180));
      f.arc(cx, y0, R, 0, 180, { cls: 'thick' });
    }
    if (o.field) {
      for (const x of [40, 80, 260, 300]) f.arrow(x, y0 - 4, x, 20, { cls: 'dim', hs: 6 });
      for (const dx of [-24, 0, 24]) { const h = Math.sqrt(R * R - dx * dx); f.arrow(cx + dx, y0 - h - 6, cx + dx, 20, { cls: 'dim', hs: 6 }); }
      f.label(308, 28, md`\mathbf E_0`, 'l');
    }
    const t = pol(cx, y0, R, 140); f.line(cx, y0, t[0], t[1], { cls: 'dim' });
    const tl = pol(cx, y0, R + 12, 140); f.label(tl[0], tl[1], 'R', 'c', 'small');
    if (o.charge) {
      const qy = y0 - 110;
      f.line(cx, y0 - R, cx, qy + 7, { cls: 'dim dash thin' });
      f.charge(cx, qy, { q: '+', lab: 'q', at: 'r' });
      f.dim(cx, qy, cx, y0, 'a', { off: 70, at: 'l' });
    }
    if (o.pts) for (const [px, py, lab, at] of o.pts) { f.dot(px, py, 3); f.tag(px, py, lab, at || 'r', 7, 'small'); }
    if (o.blab) { const b = pol(cx, y0, R + 8, 50); f.label(b[0], b[1], o.blab, 'bl'); }
    if (o.far) f.label(170, 36, o.far, 'c');
    return f.svg();
  }

  // ---------------------------------------------------------------- sheet with sigma(x) = sigma0 sin kx in the plane y = 0 (edge on); optional grounded plane at y = -d
  function figSheet(o = {}) {
    const f = fig();
    const y0 = 100, xa = 30, xb = 330, lam = 120, x0 = 70;
    f.line(xa, y0, xb, y0, { cls: 'thick' });
    for (let x = xa + 6; x < xb - 4; x += 11) {
      const s = Math.sin(2 * Math.PI * (x - x0) / lam) * (o.cos ? 0 : 1) + Math.cos(2 * Math.PI * (x - x0) / lam) * (o.cos ? 1 : 0);
      if (Math.abs(s) < 0.4) continue;
      if (s > 0) plus(f, x, y0 - 8); else minus(f, x, y0 - 8);
    }
    f.arrow(x0, y0, x0, y0 - 74, { cls: 'dim', hs: 6 }); f.label(x0 + 5, y0 - 78, 'y', 'bl', 'small accent');
    f.label(xb + 6, y0, 'x', 'l', 'small accent');
    f.label(xb - 4, y0 - 44, o.lab || md`\sigma(x)=\sigma_0\sin kx`, 'r');
    if (o.plane) {
      const yp = y0 + 74;
      f.plane(xa, xb, yp, { lab: o.plab || 'V=0' });
      f.dim(xb - 26, y0, xb - 26, yp, 'd', { at: 'l' });
      f.dim(x0 + (o.cos ? 0 : lam / 4), y0 + 24, x0 + (o.cos ? lam : lam * 1.25), y0 + 24, md`\lambda`, { at: 'b' });
    } else {
      f.line(x0, y0, x0, y0 + 60, { cls: 'dim dash' });
      f.dim(x0 + (o.cos ? 0 : lam / 4), y0 + 30, x0 + (o.cos ? lam : lam * 1.25), y0 + 30, md`\lambda=2\pi/k`, { at: 'b' });
    }
    return f.svg();
  }

  // ---------------------------------------------------------------- 90-degree grounded corner with a charge at (a, b)
  function figCorner(o = {}) {
    const f = fig();
    const ox = 140, oy = 170, qx = ox + 100, qy = oy - 76;
    if (o.img) {
      f.line(ox, oy - 150, ox, oy + 120, { cls: 'dash dim' }); f.line(ox - 130, oy, ox + 170, oy, { cls: 'dash dim' });
    } else {
      f.plane(ox, ox + 170, oy, {}); f.wall(ox, oy - 150, oy, { side: 'left' });
      f.label(ox + 166, oy + 14, o.plab || 'V=0', 'tr', 'small');
      f.label(ox - 14, oy - 130, o.wlab || 'V=0', 'r', 'small');
    }
    f.line(qx, qy + 7, qx, oy, { cls: 'dash dim thin' }); f.line(ox, qy, qx - 7, qy, { cls: 'dash dim thin' });
    f.charge(qx, qy, { q: '+', lab: 'q', at: 'tr' });
    f.label((ox + qx) / 2, qy - 6, 'a', 'b', 'small'); f.label(qx + 6, (qy + oy) / 2, 'b', 'l', 'small');
    f.label(ox + 174, oy - 2, 'x', 'bl', 'small accent'); f.label(ox + 4, oy - 152, 'y', 'bl', 'small accent');
    if (o.img) {
      const ix = 2 * ox - qx, iy = 2 * oy - qy;
      f.charge(ix, qy, { q: '-', lab: '-q', at: 'tl', image: true });
      f.charge(qx, iy, { q: '-', lab: '-q', at: 'br', image: true });
      f.charge(ix, iy, { q: '+', lab: '+q', at: 'bl', image: true });
      f.line(ix + 7, qy, ox, qy, { cls: 'dash dim thin' }); f.line(qx, oy, qx, iy - 7, { cls: 'dash dim thin' });
      if (o.three === false) { /* nothing */ }
    }
    return f.svg();
  }

  // ---------------------------------------------------------------- charge between two grounded parallel planes
  function figPar(o = {}) {
    const f = fig();
    const yT = 40, yB = 170, qx = 150, qy = o.mid ? (yT + yB) / 2 : yB - (yB - yT) / 4;
    if (o.img) { f.line(20, yT, 300, yT, { cls: 'dash dim' }); f.line(20, yB, 300, yB, { cls: 'dash dim' }); }
    else { f.plane(20, 300, yT, { side: 'above' }); f.plane(20, 300, yB, { side: 'below' }); f.label(296, yT - 14, 'V=0', 'br', 'small'); f.label(296, yB + 14, 'V=0', 'tr', 'small'); }
    f.charge(qx, qy, { q: '+', lab: 'q', at: 'l' });
    f.dim(268, yB, 268, yT, 'L', { at: 'l' });
    f.dim(qx, qy, qx, yB, o.mid ? 'L/2' : 'L/4', { off: -40, at: 'r' });
    return f.svg();
  }

  // ---------------------------------------------------------------- Gaussian pillbox and Amperian-style loop straddling a charged sheet (edge on)
  function figPill() {
    const f = fig();
    const y0 = 110;
    f.line(20, y0, 330, y0, { cls: 'thick' }); f.label(326, y0 + 6, md`\sigma`, 'tr');
    f.rect(50, y0 - 24, 62, 48, { cls: 'dash' });
    f.arrow(81, y0 - 24, 81, y0 - 50, { hs: 6 }); f.label(87, y0 - 48, md`E^\perp_{\text{above}}`, 'l', 'small');
    f.arrow(81, y0 + 24, 81, y0 + 50, { hs: 6 }); f.label(87, y0 + 48, md`E^\perp_{\text{below}}`, 'l', 'small');
    f.text(30, y0 - 32, 'pillbox', 'br');
    f.rect(214, y0 - 16, 78, 32, { cls: 'thin' });
    f.arrow(268, y0 - 16, 240, y0 - 16, { hs: 6 }); f.arrow(238, y0 + 16, 266, y0 + 16, { hs: 6 });
    f.label(253, y0 - 22, md`E^\parallel_{\text{above}}`, 'b', 'small'); f.label(253, y0 + 22, md`E^\parallel_{\text{below}}`, 't', 'small');
    f.text(306, y0 - 30, 'loop', 'bl');
    f.arrow(160, y0, 160, y0 - 44, { hs: 7 }); f.label(166, y0 - 40, md`\hat{\mathbf n}`, 'l');
    return f.svg();
  }

  // ---------------------------------------------------------------- conductor surface: E = (sigma/eps0) n-hat just outside, zero inside
  function figCond() {
    const f = fig();
    const yS = (x) => 120 + 16 * Math.sin((x - 20) / 55);
    const surf = []; for (let x = 20; x <= 320; x += 6) surf.push([x, yS(x)]);
    f.hatchBand(surf.concat([[320, 200], [20, 200]])); f.pl(surf, { cls: 'thick' });
    const n = (x) => { const s = 16 / 55 * Math.cos((x - 20) / 55); const L = Math.hypot(s, 1); return [s / L, -1 / L]; };
    const x1 = 110, [n1x, n1y] = n(x1); f.arrow(x1, yS(x1), x1 + 40 * n1x, yS(x1) + 40 * n1y, { hs: 7 }); f.label(x1 + 40 * n1x - 6, yS(x1) + 40 * n1y - 4, md`\hat{\mathbf n}`, 'br');
    const x2 = 230, [n2x, n2y] = n(x2); f.arrow(x2, yS(x2), x2 + 52 * n2x, yS(x2) + 52 * n2y, { cls: 'thick', hs: 8 });
    f.label(x2 + 52 * n2x + 8, yS(x2) + 52 * n2y + 4, md`\mathbf E=\dfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}`, 'l');
    f.text(170, 208, 'metal: E = 0, V = const', 't');
    f.text(40, 50, 'outside', 'l');
    return f.svg();
  }

  // ---------------------------------------------------------------- uniqueness: a region with a boundary
  function figRegion(o = {}) {
    const f = fig();
    const pts = [];
    for (let i = 0; i < 72; i++) { const a = i * 5, rr = 78 + 10 * Math.sin(3 * a * D2R) + 6 * Math.sin((2 * a + 40) * D2R); pts.push(pol(160, 110, rr * (1 + 0.35 * Math.cos(a * D2R) ** 2), a)); }
    f.poly(pts, { cls: 'thick' });
    f.label(160, 104, o.inside || md`\nabla^2V=-\rho/\varepsilon_0`, 'c');
    f.text(160, 128, o.inWords || 'V wanted here', 't');
    if (o.islands) { f.circle(98, 76, 13, { cls: 'thick' }); f.label(98 + 18, 76, 'S_1', 'l', 'small'); }
    const e = pts[63]; f.line(e[0] + 4, e[1] + 4, e[0] + 30, e[1] + 26, { cls: 'dim thin' });
    f.label(e[0] + 32, e[1] + 28, o.bnd || md`V \text{ or } \partial V/\partial n \text{ given on } S`, 'tl', 'small');
    return f.svg();
  }

  // ---------------------------------------------------------------- two charges mirror-placed about the plane x = 0
  function figPair(o = {}) {
    const f = fig();
    const y = 100, xm = 160, dx = 70;
    f.line(xm, 22, xm, 182, { cls: 'dash dim' });
    f.charge(xm - dx, y, { q: '+', lab: 'q', at: 't' });
    f.charge(xm + dx, y, { q: o.anti ? '-' : '+', lab: o.anti ? '-q' : 'q', at: 't' });
    f.dim(xm - dx, y + 30, xm, y + 30, 'd', { at: 'b' }); f.dim(xm, y + 30, xm + dx, y + 30, 'd', { at: 'b' });
    f.label(xm + 5, 26, 'x=0', 'tl', 'small accent');
    return f.svg();
  }

  // ---------------------------------------------------------------- thin metal shell (charge Q) around a point charge q, or a hollow box
  function figHollow(o = {}) {
    const f = fig();
    const cx = 120, cy = 110;
    if (o.box) {
      const out = [[40, 30], [200, 30], [200, 190], [40, 190]], inn = [[54, 44], [54, 176], [186, 176], [186, 44]];
      f.hatchBand(out.concat(inn)); f.poly(out, { cls: 'thick' }); f.poly(inn, { cls: 'thick' });
      if (o.lab) f.label(206, 40, o.lab, 'l');
      if (o.inLab) f.label(120, 110, o.inLab, 'c', 'small');
      return f.svg();
    }
    ringM(f, cx, cy, 70, 78);
    f.charge(cx, cy, { q: '+', lab: 'q', at: 'r' });
    if (o.lab) { const c = pol(cx, cy, 86, 42); f.label(c[0], c[1], o.lab, 'bl'); }
    return f.svg();
  }

  // ---------------------------------------------------------------- plot of V across a charged plane (V0 e^{-|y|/L}) or similar
  function plotKink(o = {}) {
    return PF.plot({ w: 320, h: 200, x: [-3, 3], y: [0, 1.25], xl: 'y', yl: 'V(y)', zero: true,
      xt: [[-1, '-L'], [1, 'L']], yt: [[1, 'V_0']],
      curves: [{ f: o.f || ((y) => Math.exp(-Math.abs(y))) }], ml: 40 });
  }

  const LESSONS = [];

  // =====================================================================================
  // Lesson 1. What a boundary condition is
  // =====================================================================================
  // an isolated conductor of irregular shape (hatched), label outside
  function figBlob(o = {}) {
    const f = fig();
    const pts = [];
    for (let i = 0; i < 72; i++) { const a = i * 5, rr = 58 + 9 * Math.sin(2 * a * D2R + 0.6) + 6 * Math.sin(3 * a * D2R); pts.push(pol(130, 100, rr * (1 + 0.3 * Math.cos(a * D2R) ** 2), a)); }
    f.hatchBand(pts); f.poly(pts, { cls: 'thick' });
    if (o.lab) f.label(214, 34, o.lab, 'bl');
    if (o.note) f.text(130, 184, o.note, 't');
    return f.svg();
  }

  LESSONS.push({
    id: 'ub-what', title: 'What a boundary condition is, and why it decides everything',
    steps: [
      RF(md`
        In a charge-free region the potential obeys Laplace's equation, $\nabla^2V=0$; where there is charge, Poisson's, $\nabla^2V=-\rho/\varepsilon_0$. Either equation has **infinitely many** solutions. In one dimension every straight line $V=ax+b$ works. In two, $x^2-y^2$, $e^{kx}\sin ky$ for every $k$, $\ln(x^2+y^2)$, and endless others. In three, $1/r$, $r\cos\theta$, $r^2P_2(\cos\theta)$, and so on.

        The equation only says that $V$ has no bumps or dips inside the region (Lecture 8: $V$ is the average of its surroundings). Which solution you actually get is decided by what happens at the edges of the region: the **boundary conditions** (BCs).

        [[fig:plates]]

        Lecture 8's one-dimensional case: two large plates with no charge between them. $d^2V/dx^2=0$ gives $V=ax+b$: two unknown constants, so you need two conditions. With $V(0)=0$ and $V(d)=V_0$ you get $b=0$, $a=V_0/d$, so $V=V_0x/d$, and nothing else is possible.

        !!key Uniqueness: why the BCs are everything (Lecture 9)
          **First uniqueness theorem:** if $\rho$ is given in a region and $V$ is given on its entire boundary, there is exactly one $V$. Proof: two solutions differ by $V_3=V_1-V_2$, which obeys Laplace's equation and is zero on the boundary. Laplace allows no interior maxima or minima, so $V_3\equiv0$.

          Consequence: any function that satisfies the equation in the region **and every BC** is the answer, however you found it: guessed, built from image charges, or summed as a Fourier series. Images and separation of variables are two ways of manufacturing such a function.
      `, { plates: { svg: figPlates({ L: 'V=0', R: 'V_0' }), cap: 'Two large parallel plates a distance $d$ apart, no charge between them.' } }),

      Q(md`The plates in the figure have no charge between them. Before you use the plate potentials, what can you say about $V(x)$ in the gap?`,
        [md`$V=0$ in the gap, because there is no charge there`,
          md`$V=ax+b$ for **some** constants $a$ and $b$: a whole family, and the plates pick one member`,
          md`$V=V_0x/d$ is the only solution of $d^2V/dx^2=0$`,
          md`Nothing yet: you need $\rho$ outside the plates first`], 1,
        [md`No charge means no **curvature** ($V''=0$), not no potential. $V=0$ is one member of the family; it fits only if both plates are at $0$.`,
          null,
          md`That is the answer **after** you use $V(0)=0$ and $V(d)=V_0$. The equation alone allows every straight line.`,
          md`Everything outside the region acts only through the boundary values. Given $V$ on both plates you need nothing else (uniqueness).`],
        md`$V''=0$ integrates twice to $V=ax+b$, a two-parameter family. The two plate potentials are two equations for $a$ and $b$. That is every boundary-value problem in miniature: the equation gives the family, the BCs pick the member.`,
        { figHtml: figPlates({ L: 'V=0', R: 'V_0' }) }),

      Q(md`Same gap, but now only the left plate is specified, $V(0)=0$. The right plate's potential is not given. What do you know about $V(x)$?`,
        [md`$V=0$ everywhere`, md`$V=V_0x/d$`, md`$V=ax$ with $a$ undetermined: the problem is under-specified`, md`$V=ax+b$ with both constants free`], 2,
        [md`That is one possibility ($a=0$), but nothing forces it.`, md`$V_0$ was never given. That needs a second condition.`, null, md`$V(0)=0$ does fix $b=0$.`],
        md`One condition fixes one constant, $b=0$. The slope needs a second piece of information: the right plate's potential, or its charge (which fixes $V'$ through $\sigma=-\varepsilon_0\,\partial V/\partial n$). With one BC missing a whole family survives. In 2-D and 3-D the same thing happens when you forget a face or the condition at infinity.`,
        { figHtml: figPlates({ L: 'V=0', R: md`V=\,?` }) }),

      Q(md`$V_1$ and $V_2$ both satisfy Poisson's equation with the same $\rho$ in the region, and both take the given values on its boundary $S$. What does $V_3=V_1-V_2$ do?`,
        [md`It obeys Laplace's equation and vanishes on $S$, so it vanishes everywhere`,
          md`It obeys Poisson's equation with charge density $2\rho$`,
          md`It is some nonzero constant, so $V_1$ and $V_2$ differ by a constant`,
          md`It vanishes on $S$ but can be anything inside`], 0,
        [null,
          md`$\nabla^2V_3=\nabla^2V_1-\nabla^2V_2=-\rho/\varepsilon_0+\rho/\varepsilon_0=0$. The charge cancels; it doesn't double.`,
          md`A constant that vanishes on $S$ is zero. (A free constant appears only when $\partial V/\partial n$, not $V$, is given everywhere.)`,
          md`A solution of Laplace's equation has no interior maxima or minima, so its extremes are on $S$, where it is $0$.`],
        md`This is Lecture 9's proof. $V_3$ is harmonic and $V_3=0$ on the boundary. Its maximum and minimum must sit on the boundary, so both are $0$ and $V_3\equiv0$. Hence $V_1=V_2$: $\rho$ plus the boundary values fix $V$ completely.`,
        { figHtml: figRegion({ bnd: md`V \text{ given on } S` }) }),

      Q(md`A square region $0<x<a$, $0<y<a$ has its left face at $V_0$ and the other three faces grounded. A student proposes $V=V_0(1-x/a)$, notes that $\nabla^2V=0$, and stops. Verdict?`,
        [md`Correct: it satisfies Laplace's equation and matches the left and right faces`,
          md`Correct, by the uniqueness theorem`,
          md`Wrong: a linear function can never satisfy Laplace's equation in 2-D`,
          md`Wrong: it equals $V_0(1-x/a)\neq0$ on the grounded faces $y=0$ and $y=a$`], 3,
        [md`Two faces out of four is not enough. Uniqueness needs **every** boundary value.`,
          md`Uniqueness applies only to a function that matches **all** the boundary values. This one fails on two faces.`,
          md`Linear functions satisfy Laplace's equation in any dimension (every second derivative vanishes). The problem is the BCs.`,
          null],
        md`Check every face. $x=0$: $V_0$ (yes). $x=a$: $0$ (yes). $y=0$: $V_0(1-x/a)$, should be $0$ (no). $y=a$: same (no). The real answer needs a Fourier series in $y$ (lesson 5). Its center value is $V_0/4$, not the $V_0/2$ this guess gives.`,
        { figHtml: figBox({ w: 130, h: 130, left: 'V_0', right: '0', top: '0', bot: '0', c1: '(a,a)' }) }),

      RF(md`
        ### The kinds of boundary condition

        | Kind | What you write | Typical words |
        |---|---|---|
        | $V$ given (Dirichlet) | $V\big|_S=f$ | grounded ($V=0$); held at $V_0$; "the end is held at $V_0(y)$" |
        | $\partial V/\partial n$ given (Neumann) | $\dfrac{\partial V}{\partial n}\Big|_S=g$ | conductor with known $\sigma$: $\dfrac{\partial V}{\partial n}=-\dfrac{\sigma}{\varepsilon_0}$; mirror plane: $\dfrac{\partial V}{\partial n}=0$ |
        | conductor with total charge $Q$ | $V\big|_S=V_c$ (an **unknown** constant) and $-\varepsilon_0\oint_S\dfrac{\partial V}{\partial n}\,da=Q$ | neutral ($Q=0$); isolated; carries charge $Q$ |
        | at infinity | $V\to0$, or $V\to-E_0z+C$ | localized charges; uniform field $E_0\hat{\mathbf z}$ far away |
        | regularity | $V$ finite | at $r=0$; on the $z$-axis ($\theta=0,\pi$); as $x\to\infty$ |
        | symmetry | on a mirror plane: $\partial V/\partial n=0$ (symmetric) or $V=0$ (antisymmetric) | equal or opposite charges at mirror points |
        | interface (matching) | $V$ continuous and $\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-\dfrac{\sigma}{\varepsilon_0}$ | surface charge glued on; a region split in two |

        What each one does to a solution:
        - A $V$ or $\partial V/\partial n$ condition on a face fixes coefficients. When it is a **zero** condition on two opposite faces it also quantizes $k$.
        - Regularity and $V\to0$ throw away whole families: $B_\ell/r^{\ell+1}$ when the region contains the origin, $e^{kx}$ as $x\to\infty$, $A_\ell r^\ell$ as $r\to\infty$.
        - A uniform field far away does the opposite: it **supplies** a term, $A_1=-E_0$.
        - A conductor with given charge brings one unknown ($V_c$) and one extra equation ($\oint\sigma\,da=Q$, which in spherical problems reads $B_0=\tfrac{Q}{4\pi\varepsilon_0}$).
        - Symmetry halves the work: solve one side, with $V=0$ or $\partial V/\partial n=0$ on the mirror plane.
        - Matching conditions glue the solutions of two regions together.

        **Regularity on the axis.** Legendre's equation has, for every $\ell$, a second solution $Q_\ell(\cos\theta)$ that blows up on the $z$-axis (it describes line charge sitting on the axis), and for non-integer $\ell$ even the "$P$" solution blows up at $\theta=\pi$. Demanding that $V$ be finite on the whole axis keeps only $P_\ell(\cos\theta)$ with $\ell=0,1,2,\dots$ That is a boundary condition too, one the lectures use silently.
      `),

      Q(md`You know the surface charge $\sigma$ at every point of a conductor's surface, but not its potential. What boundary condition is that, in terms of $V$?`,
        [md`$V=\sigma/\varepsilon_0$ on the surface`, md`$\partial V/\partial n=-\tfrac{\sigma}{2\varepsilon_0}$ on the surface`, md`$\partial V/\partial n=-\sigma/\varepsilon_0$ on the surface, with $\hat{\mathbf n}$ pointing out of the metal (a Neumann condition)`, md`None: $\sigma$ is a result, never a boundary condition`], 2,
        [md`$\sigma$ fixes the **field** just outside, $E=\sigma/\varepsilon_0$, which is a derivative of $V$, not $V$ itself. Units don't even match.`,
          md`$\tfrac{\sigma}{2\varepsilon_0}$ is the field of an isolated flat sheet on one side. At a conductor the field inside is zero, so all of the jump $\sigma/\varepsilon_0$ appears outside.`,
          null,
          md`It is usually a result, but if it is given it is a perfectly good (Neumann) condition, the kind in HW 4 Prob. 3.5.`],
        md`Just outside a conductor $\vb E=(\sigma/\varepsilon_0)\hat{\mathbf n}$ (Lecture 7), and $E_n=-\partial V/\partial n$, so $\partial V/\partial n=-\sigma/\varepsilon_0$. Given $\sigma$ means given normal derivative: Neumann. Given potential would be Dirichlet.`,
        { figHtml: figCond() }),

      Q(md`Two equal charges $q$ sit at $x=\pm d$. Which condition holds on the plane $x=0$?`,
        [md`$\partial V/\partial x=0$: no field component crosses the plane`, md`$V=0$`, md`$\vb E=0$ everywhere on the plane`, md`$V$ and $\partial V/\partial x$ both vanish`], 0,
        [null, md`$V=0$ needs **opposite** charges at mirror points. Here both contributions are positive, so $V>0$ on the plane.`,
          md`Only $E_x$ vanishes on the plane. The components along the plane add (except at the midpoint, where they cancel too).`,
          md`$V\neq0$ there. Only the normal derivative vanishes.`],
        md`Mirror symmetry: $V(-x,y,z)=V(x,y,z)$, so $V$ is even in $x$ and $\partial V/\partial x=0$ at $x=0$. That is a Neumann condition, and it lets you solve only the half $x>0$ with $\partial V/\partial n=0$ on the plane. It is also why a **same-sign** image is wrong for a grounded plane: it produces this condition, not $V=0$.`,
        { figHtml: figPair({}) }),

      Q(md`Now the charges are $q$ at $x=-d$ and $-q$ at $x=+d$. Which condition holds on the plane $x=0$?`,
        [md`$\partial V/\partial x=0$`, md`$\vb E=0$`, md`$V=\dfrac{q}{4\pi\varepsilon_0 d}$`, md`$V=0$`], 3,
        [md`The field runs from $q$ to $-q$, straight through the plane: $E_x\neq0$ there.`,
          md`$E_x$ is largest on the plane between the charges. It is $V$ that vanishes.`,
          md`That is the potential of one charge at distance $d$. Every point of the plane is equally far from $q$ and $-q$, so the two terms cancel.`, null],
        md`Antisymmetry: $V(-x,y,z)=-V(x,y,z)$, so $V(0,y,z)=0$. Read backwards, this is the method of images: the left half sees exactly what it would see next to a grounded plane at $x=0$, with $-q$ as the image of $q$.`,
        { figHtml: figPair({ anti: true }) }),

      Q(md`An isolated conductor of irregular shape carries total charge $Q$. Which conditions on its surface $S$ enter the boundary-value problem?`,
        [md`$V=0$ on $S$, and $\oint_S\sigma\,da=Q$`, md`$V=V_c$ on $S$ with $V_c$ an **unknown** constant, and $-\varepsilon_0\oint_S\dfrac{\partial V}{\partial n}\,da=Q$`, md`$\sigma=Q/A$ on $S$, with $A$ the surface area`, md`$V=\dfrac{Q}{4\pi\varepsilon_0 R}$ on $S$, $R$ its average radius`], 1,
        [md`Isolated is not grounded. A grounded conductor's charge is whatever the BCs demand; you can't impose both $V=0$ and $Q$.`, null,
          md`Charge spreads uniformly only on an isolated sphere. On an irregular shape $\sigma$ is larger where the surface is more curved.`,
          md`That formula holds only for a sphere, and even there only with nothing else around.`],
        md`A conductor is an equipotential, so $V$ is constant on $S$, but you don't know the constant. Its total charge is fixed instead. One unknown, one extra equation: that is the data of the second uniqueness theorem (Lecture 9), and it fixes $\vb E$ uniquely.`,
        { figHtml: figBlob({ lab: 'Q', note: 'isolated, not grounded' }) }),

      Q(md`$V_0(\theta)$ is given on a sphere of radius $R$, and you want $V$ **inside**. In $V=\sum\left(A_\ell r^\ell+B_\ell r^{-(\ell+1)}\right)P_\ell(\cos\theta)$, which coefficients survive, and which condition decides?`,
        [md`Only the $B_\ell$, because $V\to0$ at infinity`, md`Both, because the region is bounded`, md`Only the $A_\ell$, because $V$ must be finite at $r=0$`, md`Only $A_0$, because $V$ inside is constant`], 2,
        [md`Infinity is not in the region. Inside, $B_\ell r^{-(\ell+1)}$ blows up at the center.`, md`A ball contains the origin, and there $r^{-(\ell+1)}$ is infinite. Only a shell $a<r<b$ keeps both.`, null, md`That holds only when $V_0$ is constant (or for an empty conducting cavity).`],
        md`The region includes $r=0$, so BC "finite at the origin" kills every $B_\ell$ (Lecture 13: $V(0,\theta)\neq\infty\Rightarrow B=0$). Then $V(R,\theta)=V_0(\theta)$ fixes the $A_\ell$ with Legendre orthogonality. Outside it's the reverse: $V\to0$ kills the $A_\ell$.`,
        { figHtml: figShell({ lab: md`V_0(\theta)`, inLab: md`V\ ?` }) }),

      Q(md`Legendre's equation has a second solution $Q_\ell(\cos\theta)$, which is infinite at $\theta=0$ and $\theta=\pi$. Why does it never appear in your sphere solutions?`,
        [md`Because the region contains the $z$-axis and $V$ must be finite there; the same requirement forces $\ell$ to be an integer`,
          md`Because it does not satisfy Laplace's equation`,
          md`Because Legendre orthogonality removes it`,
          md`Because $V\to0$ at infinity removes it`], 0,
        [null, md`It does satisfy it away from the axis; that is why it is called a solution. It is rejected by a boundary condition, not by the equation.`,
          md`Orthogonality is used to find coefficients of the functions you kept. It doesn't decide which functions you keep.`,
          md`The condition at infinity acts on the radial part ($A_\ell r^\ell$). $Q_\ell$ is an angular function; its problem is on the axis, at every $r$.`],
        md`Regularity on the axis is the hidden boundary condition of every spherical problem with azimuthal symmetry. It keeps only $P_\ell(\cos\theta)$, $\ell=0,1,2,\dots$ (A singular solution would describe line charge along the axis, which isn't in the problem.)`,
        { figHtml: figShell({ lab: md`V_0(\theta)` }) }),

      Q(md`An uncharged metal sphere sits in a field that is uniform, $\vb E_0=E_0\hat{\mathbf z}$, far away. What is the condition at infinity?`,
        [md`$V\to0$ as $r\to\infty$`, md`$V\to E_0r\cos\theta$`, md`$\partial V/\partial r\to0$`, md`$V\to-E_0r\cos\theta+C$`], 3,
        [md`The applied field never dies out, so $V$ grows like $-E_0z$. Imposing $V\to0$ would kill the very term that drives the problem.`,
          md`Sign: $\vb E=-\nabla V$, so $V=+E_0z$ would give a field $-E_0\hat{\mathbf z}$.`,
          md`$\partial V/\partial r\to-E_0\cos\theta$, not $0$.`, null],
        md`Far away the sphere's influence fades and only the applied field remains: $V\to-E_0z+C=-E_0r\cos\theta+C$. In the Legendre series this **supplies** the term $A_1=-E_0$ instead of killing the $A_\ell$. (By symmetry you can choose $C=0$; then the neutral sphere is at $V=0$.)`,
        { figHtml: figField({ note: 'uncharged metal sphere' }) }),

      RF(md`
        ### How many conditions? Over- and under-specification

        Count with the separated equations. Each one is second order, so each needs **two** conditions.
        - 1-D: $V''=0$, two conditions (two plates).
        - Slot (Lecture 11): $X''=k^2X$ needs two ($x=0$ and $x\to\infty$); $Y''=-k^2Y$ needs two ($y=0$ and $y=a$). That is the lecture's BC #1–#4.
        - Box: three separated equations, six conditions, one per face.
        - Sphere: $R(r)$ needs two (finite at $0$ and the value at $R$; or the value at $R$ and $V\to0$; or values at $a$ and $b$). $\Theta(\theta)$ needs two: finite at $\theta=0$ and at $\theta=\pi$.

        **Over-specified**: more information than that, such as $V$ **and** $\partial V/\partial n$ on the same face, or $V$ on every face plus the charge on one of them. The extra condition generally contradicts the others, and there is no solution.

        **Under-specified**: less. The classic is the slot without $V\to0$ as $x\to\infty$. Then $\sinh(n\pi x/a)\sin(n\pi y/a)$ satisfies Laplace's equation and vanishes at $x=0$, $y=0$ and $y=a$, so you could add any amount of it.

        [[fig:slotq]]

        **Neumann everywhere** (Griffiths 3.1.5; HW 4 Prob. 3.5): $\partial V/\partial n$ on every boundary fixes $\vb E$ but $V$ only up to an additive constant, and the data must be consistent with Gauss's law, $\oint\partial V/\partial n\,da=-Q_{\text{enc}}/\varepsilon_0$. In 1-D (Griffiths): giving $V'$ at both ends is either redundant (if the two slopes agree) or inconsistent (if they don't).
      `, { slotq: { svg: figSlot({ top: 'V=0', bot: 'V=0', end: 'V_0', far: md`x\to\infty:\ ?` }), cap: md`Forget the condition at $x\to\infty$ and the answer is no longer unique.` } }),

      Q(md`Which pair of conditions does **not** determine $V(x)$ in the gap between two plates (no charge in the gap)?`,
        [md`$V(0)$ and $V(d)$`, md`$V(0)$ and $V'(d)$`, md`$V'(0)$ and $V'(d)$`, md`$V(0)$ and $V'(0)$`], 2,
        [md`The standard pair: two values, two constants.`, md`A value at one end fixes $b$, a slope at the other fixes $a$. Fine.`, null, md`Value and slope at the same end fix $b$ and $a$. Fine in 1-D (in 2-D/3-D this "Cauchy" data on one face is not allowed).`],
        md`$V=ax+b$ has $V'=a$ everywhere. Two slopes either agree (then they say the same thing and $b$ is never fixed) or disagree (then no line fits). This is Griffiths' 1-D illustration of Neumann data: it fixes $\vb E=-V'\hat{\mathbf x}$ but not the additive constant.`,
        { figHtml: figPlates({ L: '?', R: '?' }) }),

      Q(md`In the slot, BC #1–#3 are imposed ($V=0$ on both plates, $V=V_0$ on the end) but the condition at $x\to\infty$ is forgotten. What goes wrong?`,
        [md`Nothing: three conditions are enough for a 2-D problem`,
          md`Any multiple of $\sinh(n\pi x/a)\sin(n\pi y/a)$ can be added: infinitely many answers`,
          md`The Fourier coefficients $C_n$ become undefined`,
          md`$k$ is no longer quantized`], 1,
        [md`Each direction needs two conditions; the $x$-direction got only one.`, null,
          md`Fourier's trick still works on the end face. The trouble is that $e^{+kx}$ terms are no longer excluded, so the split between $e^{kx}$ and $e^{-kx}$ is undetermined.`,
          md`$k=n\pi/a$ comes from the two plates, which are still there.`],
        md`Without BC #4, each $n$ allows $Ae^{n\pi x/a}+Be^{-n\pi x/a}$ with only $A+B$ fixed by the end. The difference is a $\sinh$, which vanishes on all three given faces. Physically: something far down the slot would have to be specified. "$V\to0$ as $x\to\infty$" says there is nothing there.`,
        { figHtml: figSlot({ top: 'V=0', bot: 'V=0', end: 'V_0', far: md`x\to\infty:\ ?` }) }),

      Q(md`A cubical box has $V$ specified on each face. How many boundary conditions does the separation-of-variables solution use?`,
        [md`Six: three separated equations, two conditions each, one per face`, md`Three: one per coordinate`, md`One: the live face`, md`Eight: one per corner`], 0,
        [null, md`Each separated equation $X''=\pm k^2X$ is second order and needs two.`, md`The five grounded faces are conditions too: they kill terms and quantize $k$ and $l$.`, md`Corners are where faces meet; they don't add conditions (but the insulating gaps there let $V$ jump).`],
        md`$V=X(x)Y(y)Z(z)$ gives three second-order equations, so six conditions, which are exactly the six faces. With one live face: the four side faces give $\sin$ in $x$ and $y$ with $k=n\pi/a$, $l=m\pi/a$; the bottom picks $\sinh$ in $z$; the top fixes $C_{nm}$.`,
        { figHtml: figCube({ top: md`V_{\text{top}}`, note: 'V given on every face' }) }),

      Q(md`A square pipe has $V$ given on all four faces. Someone also specifies the surface charge $\sigma$ on the top face. What is the status of this problem?`,
        [md`Fine: more data only makes the solution more accurate`,
          md`Under-specified: $\sigma$ adds an unknown`,
          md`Fine: the top face simply becomes a Neumann face`,
          md`Over-specified: $V$ on all faces already fixes $V$ inside, hence $\sigma$ everywhere; an independently chosen $\sigma$ generally contradicts it`], 3,
        [md`Boundary data are not measurements to be averaged. Uniqueness says $V$ on all faces already determines everything.`,
          md`It adds a condition, not an unknown.`,
          md`It would be Neumann only if it **replaced** the $V$ condition on that face. Here both are given on the same face.`, null],
        md`Uniqueness cuts both ways: given $V$ on the whole boundary there is exactly one solution, and its $\sigma=-\varepsilon_0\partial V/\partial n$ on the top is already determined. Specify a different $\sigma$ and no solution exists. On each piece of boundary give **either** $V$ **or** $\partial V/\partial n$, never both.`,
        { figHtml: figBox({ top: md`V_0,\ \sigma_0`, bot: '0', left: '0', right: '0' }) }),

      Q(md`Only the normal derivative $\partial V/\partial n$ is given, on every piece of the boundary of a region with known $\rho$. What is determined?`,
        [md`$V$, uniquely`, md`$\vb E$ uniquely, and $V$ up to an additive constant (the data must also satisfy $\oint\partial V/\partial n\,da=-Q_{\text{enc}}/\varepsilon_0$)`, md`Nothing; Neumann data never determine a solution`, md`$V$ on the boundary only`], 1,
        [md`Adding a constant to $V$ changes no derivative, so Neumann data can't see it.`, null, md`They determine the field completely (HW 4 Prob. 3.5).`, md`$V$ on the boundary is not given at all; it comes out of the solution (up to the constant).`],
        md`If $V_1$ and $V_2$ both fit, $V_3=V_1-V_2$ is harmonic with $\partial V_3/\partial n=0$ on the boundary; then $\int|\nabla V_3|^2d\tau=\oint V_3\,\partial V_3/\partial n\,da=0$, so $\nabla V_3=0$: $V_3$ is a constant. Fields agree; potentials may differ by a constant. Gauss's law constrains the data, since $\oint\nabla V\cdot d\vb a=-Q_{\text{enc}}/\varepsilon_0$.`,
        { figHtml: figRegion({ bnd: md`\partial V/\partial n \text{ given on } S` }) }),

      RF(md`
        ### Worked example: a charged slab between grounded plates

        Uniform charge density $\rho$ fills the gap $0<x<d$ between two grounded plates. Find $V$ and the charge induced on each plate.

        [[fig:slab]]

        **Region of interest:** $0<x<d$. There **is** charge here, so the equation is Poisson's: $V''=-\rho/\varepsilon_0$.

        **BCs:**
        1. $V(0)=0$ (grounded)
        2. $V(d)=0$ (grounded)

        General solution: $V=-\dfrac{\rho}{2\varepsilon_0}x^2+ax+b$. BC #1 gives $b=0$. BC #2 gives $-\dfrac{\rho d^2}{2\varepsilon_0}+ad=0$, so $a=\dfrac{\rho d}{2\varepsilon_0}$:
        $$V(x)=\frac{\rho}{2\varepsilon_0}\,x\,(d-x).$$

        [[fig:slabV]]

        **Induced charge:** $\sigma=-\varepsilon_0\,\partial V/\partial n$ with $\hat{\mathbf n}$ pointing **out of the metal into the region**. At $x=0$, $\hat{\mathbf n}=+\hat{\mathbf x}$; at $x=d$, $\hat{\mathbf n}=-\hat{\mathbf x}$:
        $$\sigma(0)=-\varepsilon_0V'(0)=-\frac{\rho d}{2},\qquad \sigma(d)=-\varepsilon_0\bigl(-V'(d)\bigr)=+\varepsilon_0V'(d)=-\frac{\rho d}{2}.$$

        **Checks.** Symmetric about $x=d/2$, as the setup is. Total induced charge per area is $-\rho d$, which cancels the slab's $+\rho d$: a pillbox reaching into both plates (where $E=0$) must enclose zero charge. Using $\hat{\mathbf n}=+\hat{\mathbf x}$ at the right plate would have given $+\rho d/2$ there, and the check would fail. That is the most common sign error with $\sigma=-\varepsilon_0\partial V/\partial n$.
      `, {
        slab: { svg: figPlates({ L: 'V=0', R: 'V=0', rho: true }), cap: 'Uniform $\\rho$ between two grounded plates.' },
        slabV: { svg: PF.plot({ w: 300, h: 180, x: [0, 1], y: [0, 0.32], xl: 'x', yl: 'V', xt: [[0.5, 'd/2'], [1, 'd']], yt: [[0.25, md`\tfrac{\rho d^2}{8\varepsilon_0}`]], curves: [{ f: (x) => x * (1 - x) }], ml: 54 }), cap: 'The parabola: largest in the middle, zero on both grounded plates.' },
      }),

      P({
        id: 'ub-halfslab', title: 'A charged slab with a mirror plane',
        q: md`Uniform charge density $\rho$ now fills a wider gap, $0<x<2d$, between grounded plates at $x=0$ and $x=2d$. Use the symmetry to solve only the left half, $0<x<d$.

          (a) What is the maximum potential?
          (b) What is the surface charge on the plate at $x=0$?
          (c) Which condition replaces the right plate when you solve only $0<x<d$?`,
        figHtml: figPlates({ L: 'V=0', R: 'V=0', rho: true, dl: '2d' }),
        hints: [
          md`The setup is symmetric about $x=d$, so $V$ is even about that plane. What does that say about $V'(d)$?`,
          md`Region $0<x<d$, Poisson's equation $V''=-\rho/\varepsilon_0$. BC #1: $V(0)=0$. BC #2: $V'(d)=0$ (mirror plane: no field through it).`,
          md`$V=-\dfrac{\rho}{2\varepsilon_0}x^2+ax$; BC #2 fixes $a$. Then $\sigma=-\varepsilon_0V'(0)$ with $\hat{\mathbf n}=+\hat{\mathbf x}$.`,
        ],
        parts: [
          { lbl: md`V_{\max}`, expr: 'rho*d^2/(2*eps0)', vars: { rho: [1, 3], d: [0.5, 2], eps0: [0.5, 2] }, accepts: ['rho*(2*d)^2/(8*eps0)'] },
          { lbl: md`\sigma(0)`, expr: '-rho*d', vars: { rho: [1, 3], d: [0.5, 2] } },
          { lbl: md`(c) The condition at $x=d$:`, mc: [md`$V(d)=0$`, md`$V'(d)=0$`, md`$V(d)=V_{\max}$, given`, md`$V''(d)=0$`], a: 1,
            why: [md`There is no plate at $x=d$; $V$ is at its maximum there, not zero.`, null, md`$V_{\max}$ is what you are trying to find, so it can't be an input.`, md`$V''=-\rho/\varepsilon_0$ everywhere in the slab; that is the equation, not a BC.`] },
        ],
        sol: md`
          **Region:** $0<x<d$ (the left half). **Equation:** $V''=-\rho/\varepsilon_0$.

          **BCs:**
          1. $V(0)=0$ (grounded plate)
          2. $V'(d)=0$ (mirror plane: $V(2d-x)=V(x)$, so the slope vanishes at $x=d$)

          [[fig:half]]

          $V=-\dfrac{\rho}{2\varepsilon_0}x^2+ax+b$. BC #1: $b=0$. BC #2: $-\dfrac{\rho d}{\varepsilon_0}+a=0$, so $a=\dfrac{\rho d}{\varepsilon_0}$ and
          $$V(x)=\frac{\rho}{2\varepsilon_0}\left(2dx-x^2\right),\qquad V_{\max}=V(d)=\frac{\rho d^2}{2\varepsilon_0}.$$
          Induced charge at $x=0$ ($\hat{\mathbf n}=+\hat{\mathbf x}$): $\sigma=-\varepsilon_0V'(0)=-\varepsilon_0\dfrac{\rho d}{\varepsilon_0}=-\rho d$.

          **Checks.** The full-gap solution is $\dfrac{\rho}{2\varepsilon_0}x(2d-x)$, the same function: the half-problem with the Neumann condition reproduces it. The plate at $x=0$ receives the field lines of the left half of the slab, charge $\rho d$ per area, so $\sigma=-\rho d$. Compared with the worked example (gap $d$, $V_{\max}=\tfrac{\rho d^2}{8\varepsilon_0}$), doubling the gap quadruples $V_{\max}$: $V$ scales like $(\text{gap})^2$.

          **What to remember:** a mirror plane is a free boundary condition. Symmetric setup: $\partial V/\partial n=0$ on the plane. Antisymmetric setup: $V=0$ on it.
        `,
        figs: { half: { svg: figPlates({ L: md`\#1\ V=0`, R: md`\#2\ V'=0`, rho: true, sym: true }), cap: 'Half the slab, with the mirror plane at $x=d$ as the second boundary.' } },
      }),

      P({
        id: 'ub-HW4-3.5', src: 'HW 4 · Griffiths 3.5', title: 'Uniqueness with V or ∂V/∂n on each boundary', big: true,
        q: md`Prove that the field is uniquely determined when the charge density $\rho$ is given and either $V$ or the normal derivative $\partial V/\partial n$ is specified on each boundary surface. Do not assume the boundaries are conductors, or that $V$ is constant over any given surface.

          Answer the checkpoints below, then compare your proof with the solution.`,
        figHtml: figRegion({ islands: true, bnd: md`V \text{ or } \partial V/\partial n \text{ on each piece}` }),
        hints: [
          md`Same plan as Lecture 9: suppose two solutions $V_1$, $V_2$ and study their difference $V_3=V_1-V_2$.`,
          md`What equation does $V_3$ obey inside? On a piece where $V$ is given, what is $V_3$? Where $\partial V/\partial n$ is given, what is $\partial V_3/\partial n$?`,
          md`Product rule: $\nabla\cdot(V_3\nabla V_3)=|\nabla V_3|^2+V_3\nabla^2V_3$. Integrate over the volume and use the divergence theorem.`,
        ],
        parts: [
          { lbl: md`(a) Inside the region, $V_3=V_1-V_2$ satisfies`, mc: [md`$\nabla^2V_3=-\rho/\varepsilon_0$`, md`$\nabla^2V_3=0$`, md`$\nabla^2V_3=-2\rho/\varepsilon_0$`, md`nothing in particular`], a: 1,
            why: [md`The two $-\rho/\varepsilon_0$ terms cancel in the difference.`, null, md`Subtract, don't add.`, md`Both solutions obey Poisson's equation with the same $\rho$, so the difference obeys Laplace's.`] },
          { lbl: md`(b) On a boundary piece where $V$ is specified, and on one where $\partial V/\partial n$ is specified:`, mc: [md`$V_3=0$ on both`, md`$\partial V_3/\partial n=0$ on both`, md`$V_3=0$ on the first, $\partial V_3/\partial n=0$ on the second`, md`$V_3$ is constant on each`], a: 2,
            why: [md`Where only $\partial V/\partial n$ is given, $V_1$ and $V_2$ may differ.`, md`Where only $V$ is given, the normal derivatives may differ.`, null, md`That's the conductor case (second uniqueness theorem). Here the boundaries are not equipotentials.`] },
          { lbl: md`(c) Then $\displaystyle\oint_S V_3\frac{\partial V_3}{\partial n}\,da$ over all the boundaries equals`, mc: [md`$Q_{\text{enc}}/\varepsilon_0$`, md`$\int|\nabla V_3|^2d\tau$, which is $0$ because every piece has $V_3=0$ or $\partial V_3/\partial n=0$`, md`$-\int\rho V_3\,d\tau/\varepsilon_0$`, md`$\int|\nabla V_3|^2d\tau$, which is positive`], a: 1,
            why: [md`$V_3$ has no sources; the charge cancelled in (a).`, null, md`$\nabla^2V_3=0$, so there is no volume source term.`, md`The integrand $V_3\,\partial V_3/\partial n$ vanishes piece by piece, so the integral is zero.`] },
          { lbl: md`(d) Conclusion:`, mc: [md`$V_1=V_2$ everywhere, always`, md`$\vb E_1=\vb E_2$; $V$ is unique up to a constant, and fully unique if $V$ is given on at least one piece`, md`Only the boundary values agree`, md`Nothing follows`], a: 1,
            why: [md`If only $\partial V/\partial n$ is given everywhere, $V+\text{const}$ fits the same data.`, null, md`$\nabla V_3=0$ holds throughout the volume.`, md`$\int|\nabla V_3|^2d\tau=0$ with a non-negative integrand forces $\nabla V_3=0$.`] },
        ],
        sol: md`
          Suppose $V_1$ and $V_2$ both satisfy the conditions. Let $V_3=V_1-V_2$.

          1. **Inside:** $\nabla^2V_3=\nabla^2V_1-\nabla^2V_2=-\rho/\varepsilon_0+\rho/\varepsilon_0=0$.
          2. **On each boundary piece:** where $V$ is specified, $V_1=V_2$, so $V_3=0$. Where $\partial V/\partial n$ is specified, $\partial V_3/\partial n=0$. Either way $V_3\,\partial V_3/\partial n=0$ at every boundary point.
          3. **Green's identity.** $\nabla\cdot(V_3\nabla V_3)=\nabla V_3\cdot\nabla V_3+V_3\nabla^2V_3=|\nabla V_3|^2$. Integrate over the region and use the divergence theorem:
          $$\int_{\mathcal V}|\nabla V_3|^2\,d\tau=\oint_S V_3\,\nabla V_3\cdot d\vb a=\oint_S V_3\frac{\partial V_3}{\partial n}\,da=0.$$
          ($S$ means every boundary: the outer surface and the surfaces of any islands.)
          4. The integrand $|\nabla V_3|^2\ge0$, so $\nabla V_3=0$ everywhere: $\vb E_3=-\nabla V_3=0$ and $\vb E_1=\vb E_2$. $V_3$ is a constant; if $V$ is specified on at least one piece, that constant is $0$ there, so $V_1=V_2$.

          **Why this works / what to remember:** this is the second uniqueness theorem's trick without the conductor assumption. The conductor proof needed $V_3$ constant on each surface plus $\oint\vb E_3\cdot d\vb a=0$; here each surface carries either $V_3=0$ or $\partial V_3/\partial n=0$, which kills the surface integral directly. Practical rule: on each piece of boundary specify $V$ **or** $\partial V/\partial n$ (not both), and the field is fixed.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Equation plus BCs gives one answer. The equation alone gives infinitely many.
          - Count: two conditions per second-order separated equation; one per face of a box; for a sphere, two radial (center/surface/infinity) and two angular (regular at $\theta=0,\pi$).
          - On each piece of boundary give $V$ (Dirichlet) **or** $\partial V/\partial n$ (Neumann). Neumann everywhere fixes $\vb E$; $V$ only up to a constant.
          - A conductor with given charge: "$V$ = unknown constant" plus "$\oint\sigma\,da=Q$".
          - Too few conditions: extra terms survive ($\sinh$, $B_\ell/r^{\ell+1}$, a free slope). Too many: no solution.
          - Mirror planes are free conditions: $\partial V/\partial n=0$ (symmetric) or $V=0$ (antisymmetric).
      `),
    ],
  });

  // =====================================================================================
  // Lesson 2. Words to math
  // =====================================================================================
  const GR = md`\text{grounded}`;
  // three small spheres: grounded / held at V0 / isolated with charge Q
  function figSphere3() {
    const mk = (kind) => {
      const f = fig();
      const cx = 60, cy = 56, R = 34;
      ball(f, cx, cy, R);
      if (kind === 'g') wireGround(f, cx, cy + R);
      if (kind === 'b') battery(f, cx, cy + R, 'V_0');
      if (kind === 'q') f.label(cx + R + 10, cy - R + 4, 'Q', 'bl');
      f.track(0, 0, 120, 130);
      return f.svg();
    };
    return PF.row([
      { svg: mk('g'), cap: 'grounded: $V=0$, charge unknown' },
      { svg: mk('b'), cap: 'held at $V_0$: charge unknown' },
      { svg: mk('q'), cap: 'isolated with charge $Q$: $V$ unknown' },
    ]).svg;
  }

  LESSONS.push({
    id: 'ub-words', title: 'Words to math: reading boundary conditions off a problem',
    steps: [
      RF(md`
        Exam problems describe boundaries in words. Translating them is half the work, and the lectures always do it first: "What are the boundary conditions?" is the in-class question in Lectures 9, 10 and 13. Conductors first.

        | Words | Condition on that surface | Why |
        |---|---|---|
        | grounded | $V=0$ | connected to the earth, which defines $V=0$ (the same zero as infinity) |
        | held at (maintained at) $V_0$ | $V=V_0$ | a battery supplies whatever charge it takes |
        | insulated from (a thin gap) | its own value, independent of its neighbours | $V$ may jump across the gap; that's where Fourier series ring (Gibbs) |
        | welded together; joined by a wire | one common value for all the pieces | they form a single conductor |
        | metal, conductor | $V$ constant over it; $\vb E=0$ inside | charges move until $E_\parallel=0$ on the surface |
        | isolated | its total charge can't change; $V$ floats | no wire for charge to flow along |
        | neutral, uncharged | $V=V_c$ unknown, and $\oint\sigma\,da=0$ | isolated with $Q=0$ |
        | carries charge $Q$ | $V=V_c$ unknown, and $-\varepsilon_0\oint\dfrac{\partial V}{\partial n}\,da=Q$ | the second uniqueness theorem's data |

        [[fig:three]]

        "Grounded" and "held at $V_0$" give the potential and leave the charge to be found. "Isolated", "neutral" and "carries $Q$" give the charge and leave the potential to be found. One conductor never gets both.
      `, { three: { svg: figSphere3(), cap: 'The same metal sphere, three different boundary conditions.' } }),

      Q(md`The end strip of this slot is "insulated from the plates". What does that phrase contribute to the boundary conditions?`,
        [md`The strip must be at the same potential as the plates`,
          md`The strip can have its own potential, $V(0,y)=V_0$, while the plates stay at $0$; $V$ jumps at the two corners`,
          md`No field crosses the strip: $\partial V/\partial x=0$ at $x=0$`,
          md`The strip carries no charge`], 1,
        [md`That would be "welded" or "connected". The gap is there precisely so they can differ.`, null,
          md`"Insulated" here means electrically separated from its neighbours, not a no-flux (Neumann) boundary. The strip is metal at $V_0$.`,
          md`A strip held at $V_0$ next to grounded plates certainly carries charge; the battery supplies it.`],
        md`Without the gap the strip and plates would be one conductor at one potential. The thin insulating layer lets the boundary value jump from $0$ to $V_0$ at the corners $(0,0)$ and $(0,a)$. That discontinuity is why the Fourier series of $V_0$ on $0<y<a$ overshoots near the ends (Lecture 12).`,
        { figHtml: figSlot({ top: GR, bot: GR, end: 'V_0' }) }),

      Q(md`"A cubical box consists of five metal plates, welded together and grounded. The top is a separate sheet of metal, insulated from the others, held at $V_0$" (Griffiths 3.16). What does "welded together and grounded" say about the five plates?`,
        [md`All five are at $V=0$`, md`All five are at one common potential, which you must find`, md`Each of the five has its own potential`, md`The five plates carry zero total charge`], 0,
        [null, md`"Welded" alone would say that. "Grounded" also fixes the common value at $0$.`, md`That is what "insulated from each other" would mean.`, md`They carry induced charge (negative, if $V_0>0$). Grounding fixes $V$, not $Q$.`],
        md`Welded makes them one conductor; grounded puts that conductor at $V=0$. So $V=0$ on $x=0$, $x=a$, $y=0$, $y=a$, $z=0$, and $V=V_0$ on $z=a$. Six faces, six conditions.`,
        { figHtml: figCube({ top: 'V_0', note: 'five sides welded and grounded' }) }),

      RF(md`
        Now the words about regions, distant behaviour and charges that aren't on metal:

        | Words | Condition |
        |---|---|
        | far from all charges; localized charges | $V\to0$ as $r\to\infty$ |
        | uniform field $E_0\hat{\mathbf z}$ far away | $V\to-E_0z+C=-E_0r\cos\theta+C$ |
        | infinitely long along $z$; a long pipe | no $z$-dependence: a 2-D problem |
        | semi-infinite; "extends to $x\to\infty$" | $V$ finite there; usually $V\to0$, or $V\to$ the $x$-independent solution |
        | "the end is held at $V_0(y)$" | $V(0,y)=V_0(y)$, the live (inhomogeneous) face |
        | surface charge $\sigma(\theta)$ glued on (no metal) | match: $V$ continuous, $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma/\varepsilon_0$ |
        | hollow; thin shell | a surface of zero thickness; inside and outside are separate regions |
        | cavity in a conductor | the wall is at the conductor's $V$; charge $q$ in the cavity puts $-q$ on the wall |
        | region includes the origin / the $z$-axis | $V$ finite at $r=0$ / at $\theta=0,\pi$ |
        | "find $V$ between ..." | no condition at $r=0$ or at infinity |

        **Always name the region first.** Its boundary is what you list. Infinity belongs on the list only if the region reaches it, and the origin only if the region contains it. A real charge inside the region turns Laplace into Poisson; a charge outside the region (or an image) never appears in the list at all.

        The rest of this lesson is drill: for each picture, pick the full set of conditions.
      `),

      Q(md`Two grounded metal plates at $y=0$ and $y=a$ extend to $x\to\infty$. The end at $x=0$ is a strip insulated from both plates and held at $V_0$. Which set of boundary conditions?`,
        [md`$V(x,0)=0$, $V(x,a)=0$, $V(0,y)=V_0$, and nothing more`,
          md`$V(x,0)=0$, $V(x,a)=0$, $\dfrac{\partial V}{\partial x}(0,y)=V_0$, $V\to0$ as $x\to\infty$`,
          md`$V(x,0)=V(x,a)=V(0,y)=0$, $V\to V_0$ as $x\to\infty$`,
          md`$V(x,0)=0$, $V(x,a)=0$, $V(0,y)=V_0$, $V\to0$ as $x\to\infty$`], 3,
        [md`Under-specified: $\sinh(n\pi x/a)\sin(n\pi y/a)$ could be added freely. The far end needs a condition too.`,
          md`"Held at $V_0$" fixes the potential, not its slope.`,
          md`The live face is the strip at $x=0$. Nothing at infinity is held at $V_0$.`, null],
        md`These are Lecture 11's BC #1–#4 (with $V_0(y)=V_0$). BC #4 is never stated in words. It is the physical requirement that between grounded plates, far from the strip, the potential dies out (Griffiths: "necessary on physical grounds").`,
        { figHtml: figSlot({ top: GR, bot: GR, end: 'V_0' }) }),

      Q(md`A long rectangular pipe (sides $a$ and $b$) runs along $z$. Three sides, $y=0$, $y=a$ and $x=0$, are grounded. The fourth, $x=b$, is insulated from them and held at $V_0(y)$ (HW 5 Prob. 3.17). Which set?`,
        [md`$V(x,0)=V(x,a)=0$, $V(0,y)=0$, $V(b,y)=V_0(y)$, no $z$-dependence`,
          md`The four conditions in A, plus $V\to0$ as $x\to\infty$`,
          md`$V(x,0)=V(x,a)=0$, $V(0,y)=0$, $\dfrac{\partial V}{\partial x}(b,y)=V_0(y)$`,
          md`$V(x,0)=V(x,a)=0$, $V(b,y)=V_0(y)$, $V$ finite as $z\to\pm\infty$`], 0,
        [null, md`The region stops at $x=b$; infinity isn't part of its boundary. A fifth condition over-specifies.`,
          md`"Held at $V_0(y)$" is a potential, not a slope.`,
          md`Infinitely long in $z$ means no $z$-dependence at all, and this set has dropped the grounded face $x=0$.`],
        md`Four faces, four conditions; the region is finite in $x$ and $y$ and uniform in $z$. Compared with the slot, the open end has been replaced by a grounded face at $x=0$, which will select $\sinh(n\pi x/a)$ instead of $e^{-n\pi x/a}$.`,
        { figHtml: figBox({ top: GR, bot: GR, left: GR, right: md`V_0(y)` }) }),

      Q(md`Grounded plates at $y=0$ and $y=a$ are joined at $x=\pm b$ by metal strips, each held at $V_0$ (thin insulation at the four corners; Griffiths Ex. 3.4). Which set?`,
        [md`$V(x,0)=V(x,a)=0$, $V(b,y)=V_0$, $V(-b,y)=-V_0$`,
          md`$V(x,0)=V(x,a)=0$, $V(\pm b,y)=V_0$, $V\to0$ as $|x|\to\infty$`,
          md`$V(x,0)=V(x,a)=0$, $V(b,y)=V_0$, $V(-b,y)=V_0$`,
          md`$V(x,0)=V(x,a)=V_0$, $V(\pm b,y)=0$`], 2,
        [md`Both strips are at $+V_0$. Opposite signs would be the antisymmetric case (and give $\sinh kx$).`,
          md`The region is $|x|<b$. It never reaches $|x|\to\infty$.`, null,
          md`Swapped: the plates are grounded and the strips are live.`],
        md`Four faces, four conditions. Both live faces have the same value, so $V$ is even in $x$ and the $x$-dependence is $\cosh(n\pi x/a)$. (You could also solve the half $0<x<b$ with the mirror condition $\partial V/\partial x=0$ at $x=0$ replacing the face at $-b$.)`,
        { figHtml: figBox({ left: 'V_0', right: 'V_0', top: GR, bot: GR, c0: '(-b,0)', c1: '(b,a)' }) }),

      Q(md`Discussion 4 (Griffiths 3.18): the cube in the figure has five sides welded together and grounded, and the top, insulated from them, held at $V_0$. Which set?`,
        [md`$V=V_0$ on the top; the other five faces carry no charge`,
          md`$V=0$ on $x=0$, $x=a$, $y=0$, $y=a$, $z=0$; $V=V_0$ on $z=a$`,
          md`$V=0$ on the five faces, $V=V_0$ on the top, and $V\to0$ as $r\to\infty$`,
          md`$V=0$ on the bottom, $V=V_0$ on the top, $\partial V/\partial n=0$ on the four sides`], 1,
        [md`Grounded fixes $V=0$; the faces do carry induced charge.`, null,
          md`The box is closed: infinity is not part of the region's boundary.`,
          md`The sides are grounded metal, not mirror planes. $\partial V/\partial n=0$ would describe a box whose sides no field crosses.`],
        md`Region: the inside of the box. Six faces, each with its $V$. With $x$ and $y$ grounded on both sides you get $\sin(n\pi x/a)\sin(m\pi y/a)$; the grounded bottom selects $\sinh$ in $z$; the top fixes $C_{nm}$. The center value is $V_0/6$ by symmetry.`,
        { figHtml: figCube({ top: 'V_0', note: 'five sides welded and grounded' }) }),

      Q(md`Both plates of a slot are held at $V_1$. The end strip at $x=0$, insulated from them, is held at $V_0$. Which set?`,
        [md`$V(x,0)=V(x,a)=V_1$, $V(0,y)=V_0$, $V\to0$ as $x\to\infty$`,
          md`$V(x,0)=V(x,a)=0$, $V(0,y)=V_0-V_1$, $V\to0$ as $x\to\infty$`,
          md`$V(x,0)=V(x,a)=V_1$, $V(0,y)=V_0$, $V\to V_0$ as $x\to\infty$`,
          md`$V(x,0)=V(x,a)=V_1$, $V(0,y)=V_0$, $V\to V_1$ as $x\to\infty$`], 3,
        [md`Far down the slot you are surrounded by metal at $V_1$. $V$ can't fall to $0$ there.`,
          md`That is the BC set for $\tilde V=V-V_1$, the shifted problem you'd actually solve. It's a good next step, but these are not the conditions on $V$ itself.`,
          md`The end's influence dies away from it; far away only the plates matter.`, null],
        md`Far from the end, the region is a channel between two plates at the same potential $V_1$, so $V\to V_1$. Solve with $V=V_1+\tilde V$: $\tilde V$ obeys the ordinary slot conditions with $V_0-V_1$ on the end (lesson 5).`,
        { figHtml: figSlot({ top: 'V_1', bot: 'V_1', end: 'V_0' }) }),

      Q(md`This slot extends to the **left**: the region is $x<0$, $0<y<a$, with the end strip at $x=0$ on the right, held at $V_0(y)$. Plates grounded. Which set?`,
        [md`$V(x,0)=V(x,a)=0$, $V(0,y)=V_0(y)$, $V\to0$ as $x\to-\infty$`,
          md`$V(x,0)=V(x,a)=0$, $V(0,y)=V_0(y)$, $V\to0$ as $x\to+\infty$`,
          md`$V(x,0)=V(x,a)=0$, $V(0,y)=V_0(y)$, $V$ finite at $x=0$`,
          md`$V(x,0)=V(x,a)=0$, $V(0,y)=V_0(y)$, $V(-x,y)=V(x,y)$`], 0,
        [null, md`$x\to+\infty$ is not in this region.`, md`Finiteness at $x=0$ is automatic; the missing condition is at the far end, $x\to-\infty$.`, md`There is no mirror symmetry about $x=0$: only one side exists.`],
        md`Same four kinds of condition, but the open end is at $x\to-\infty$. That keeps $e^{+n\pi x/a}$ (which decays as $x\to-\infty$) and kills $e^{-n\pi x/a}$.`,
        { figHtml: figSlot({ dir: 'left', top: GR, bot: GR, end: md`V_0(y)` }) }),

      Q(md`A square pipe: the faces $x=0$ and $y=0$ are held at $V_0$, insulated from the faces $x=a$ and $y=a$, which are grounded. Which set?`,
        [md`$V(0,y)=V_0$, $V(x,0)=V_0$, $V\to0$ far away`,
          md`$V(0,y)=V(x,0)=V_0$, $V(a,y)=V(x,a)=0$, and $\partial V/\partial n=0$ on the two live faces`,
          md`$V(0,y)=V_0$, $V(x,0)=V_0$, $V(a,y)=0$, $V(x,a)=0$`,
          md`$V(0,y)=V_0$, $V(a,y)=0$, $V(x,0)=V(x,a)=0$`], 2,
        [md`A closed cross-section has no "far away", and two faces are missing.`,
          md`$V$ and $\partial V/\partial n$ on the same face over-specifies the problem.`, null,
          md`This drops the second live face ($y=0$ is at $V_0$, not $0$).`],
        md`Four faces, four conditions, two of them live. Separation needs one live face at a time, so you'll split it into two problems and add (lesson 5). By symmetry each live face contributes $V_0/4$ at the center, so $V(a/2,a/2)=V_0/2$.`,
        { figHtml: figBox({ w: 130, h: 130, left: 'V_0', bot: 'V_0', top: GR, right: GR, c1: '(a,a)' }) }),

      Q(md`A point charge $q$ sits between two grounded parallel planes a distance $L$ apart, $L/4$ above the lower one. Which set describes $V$ between the planes?`,
        [md`$V=0$ on the lower plane; $V\to0$ far away`,
          md`$\nabla^2V=-\rho/\varepsilon_0$ with $q$ at height $L/4$; $V=0$ on $z=0$ and on $z=L$; $V\to0$ far from $q$ between the planes`,
          md`$V=0$ on both planes, and $\vb E=0$ on both planes`,
          md`$V=0$ on both planes, and $\nabla^2V=0$ everywhere between them`], 1,
        [md`The upper plane is a boundary too. (That's why one image is not enough here: fixing one plane breaks the other.)`, null,
          md`The field at a conductor's surface is $\sigma/\varepsilon_0$, normal to it. Only $E_\parallel$ vanishes there.`,
          md`$q$ is in the region, so the equation is Poisson's. With Laplace and $V=0$ on both planes the answer would be $V\equiv0$.`],
        md`Region: the slab $0<z<L$, which still extends to infinity sideways. Conditions: both planes at $0$, and $V\to0$ far from the charge. Satisfying both planes with images takes an infinite sequence of them (lesson 8).`,
        { figHtml: figPar({}) }),

      Q(md`A point charge $q$ is held a height $d$ above an infinite grounded conducting plane. You want $V$ for $z>0$. Which set (Lecture 9)?`,
        [md`$\nabla^2V=0$ for $z>0$; $V(x,y,0)=0$; $V\to0$`,
          md`$\nabla^2V=-\rho/\varepsilon_0$; $\partial V/\partial z=0$ at $z=0$; $V\to0$`,
          md`$\nabla^2V=-\rho/\varepsilon_0$; $V(x,y,0)=0$, and nothing more`,
          md`$\nabla^2V=-\rho/\varepsilon_0$ with $q$ at $(0,0,d)$; $V(x,y,0)=0$; $V\to0$ as $r\to\infty$`], 3,
        [md`The charge is in the region, so it's Poisson's equation. (Laplace with these BCs gives $V\equiv0$.)`,
          md`Grounded means $V=0$. $\partial V/\partial z=0$ describes a mirror plane: the same-sign image.`,
          md`Lecture 9 lists two conditions. Without $V\to0$ you could add $V=cz$, which also vanishes on the plane.`, null],
        md`Region $z>0$ containing $q$. BC #1: $V(x,y,0)=0$. BC #2: $V\to0$ far away. These are exactly the conditions the image solution $q$ and $-q$ at $(0,0,-d)$ meets, which is why it's right.`,
        { figHtml: figPlaneQ({ lab: GR }) }),

      Q(md`A metal sphere of radius $R$ is connected to ground. A charge $q$ sits a distance $a$ from its center. Which set describes $V$ outside the sphere?`,
        [md`$V(R,\theta)=0$ for all $\theta$; $V\to0$ as $r\to\infty$; $q$ at distance $a$ in the region $r>R$`,
          md`$V(R,\theta)=0$ and zero total charge on the sphere; $V\to0$`,
          md`$V(R,\theta)=\dfrac{q}{4\pi\varepsilon_0a}$; $V\to0$`,
          md`$\dfrac{\partial V}{\partial r}(R,\theta)=0$; $V\to0$`], 0,
        [null, md`Grounded means its charge is whatever the BCs demand ($-qR/a$, it turns out). Requiring zero as well over-specifies.`,
          md`That is the potential of the **neutral** isolated sphere.`, md`A conductor has constant $V$ on its surface, not zero normal field.`],
        md`Lecture 10: BC #1 $V(R)=0$, BC #2 $V(\infty)=0$. The ground wire supplies the induced charge $q'=-qR/a$.`,
        { figHtml: figSphereQ({ wire: 'ground' }) }),

      Q(md`Now the sphere is isolated and uncharged (no wire). Which set?`,
        [md`$V(R,\theta)=0$; $V\to0$`,
          md`$V(R,\theta)=0$ and $\oint\sigma\,da=0$; $V\to0$`,
          md`$V(R,\theta)=V_c$, an unknown constant; $\oint\sigma\,da=0$; $V\to0$`,
          md`$\sigma=0$ everywhere on the sphere; $V\to0$`], 2,
        [md`That's the grounded sphere, which ends up with charge $-qR/a$, not $0$.`,
          md`Over-specified: with $V(R)=0$ the charge is forced to be $-qR/a\neq0$.`, null,
          md`Zero **total** charge, not zero everywhere. $q$ pulls negative charge to the near side and leaves positive on the far side.`],
        md`Metal: equipotential at an unknown $V_c$. Isolated and neutral: total charge zero. The images are $q'=-qR/a$ at $R^2/a$ plus $+qR/a$ at the center, which makes $V_c=\tfrac{q}{4\pi\varepsilon_0a}$ (lesson 4).`,
        { figHtml: figSphereQ({ cond: md`Q=0` }) }),

      Q(md`Now a battery holds the sphere at $V_0$ (relative to infinity). Which set?`,
        [md`$V(R,\theta)=V_0$ and $\oint\sigma\,da=0$; $V\to0$`,
          md`$V(R,\theta)=V_0$; $V\to0$ as $r\to\infty$`,
          md`$V(R,\theta)=V_0+\dfrac{q}{4\pi\varepsilon_0a}$; $V\to0$`,
          md`$V(R,\theta)=V_0$; $V\to V_0$ as $r\to\infty$`], 1,
        [md`The battery supplies whatever charge it takes, $4\pi\varepsilon_0RV_0-qR/a$ in total. You can't fix the charge as well.`, null,
          md`The battery fixes the **total** potential of the sphere at $V_0$, including the part due to $q$.`,
          md`Far away is still the reference zero; only the sphere is at $V_0$.`],
        md`Fixed potential: $V(R)=V_0$, $V(\infty)=0$. Images: the grounded pair ($q'$ at $R^2/a$) plus $4\pi\varepsilon_0RV_0$ at the center, which raises the whole sphere by exactly $V_0$.`,
        { figHtml: figSphereQ({ wire: 'battery', bat: 'V_0' }) }),

      Q(md`Two grounded half-planes meet at a right angle. A charge $q$ sits at $(a,b)$ between them. Which set?`,
        [md`$V(0,y)=0$ for $y>0$; $V\to0$`,
          md`$V=0$ on both half-planes and $\vb E=0$ on both half-planes`,
          md`$V=0$ on both half-planes and $\partial V/\partial n=0$ on both`,
          md`$\nabla^2V=-\rho/\varepsilon_0$ with $q$ at $(a,b)$; $V(0,y)=0$ for $y>0$; $V(x,0)=0$ for $x>0$; $V\to0$`], 3,
        [md`The floor $y=0$ is grounded too.`, md`At a conductor's surface the field is normal, $\sigma/\varepsilon_0$, not zero.`, md`$V$ and $\partial V/\partial n$ on the same surface over-specifies the problem.`, null],
        md`Region: the quarter-space $x>0$, $y>0$. Two grounded faces plus infinity, and Poisson's equation because $q$ is inside. Three images ($-q$, $-q$, $+q$) satisfy both faces at once.`,
        { figHtml: figCorner({ plab: GR, wlab: GR }) }),

      Q(md`A charge $q$ is inside a grounded spherical shell of radius $R$, a distance $a<R$ from the center. Which set describes $V$ inside?`,
        [md`$\nabla^2V=-\rho/\varepsilon_0$ with $q$ at distance $a$ from the center; $V(R,\theta)=0$`,
          md`$\nabla^2V=0$ inside; $V(R,\theta)=0$; $V$ finite at $r=0$`,
          md`$\nabla^2V=-\rho/\varepsilon_0$; $V(R,\theta)=0$; $V\to0$ as $r\to\infty$`,
          md`$\nabla^2V=-\rho/\varepsilon_0$; $V(R,\theta)=0$; total induced charge $-qR/a$`], 0,
        [null, md`$q$ is inside the region. Laplace with $V=0$ on the wall would give $V\equiv0$.`,
          md`Infinity is not part of this region's boundary; the shell closes it off.`,
          md`With $V$ given on the wall, the charge is an output, not an input. (And it is $-q$, not $-qR/a$.)`],
        md`One closed boundary, one condition on it, plus the source. The image is $-qR/a$ at $R^2/a>R$, outside the region as it must be (lesson 4).`,
        { figHtml: figInside({ cond: GR }) }),

      Q(md`An uncharged metal sphere sits in a field that is uniform, $\vb E_0=E_0\hat{\mathbf z}$, far away (Griffiths Ex. 3.8). Which set?`,
        [md`$V(R,\theta)=0$; $V\to0$ as $r\to\infty$`,
          md`$V(R,\theta)=-E_0R\cos\theta$; $V\to-E_0r\cos\theta$`,
          md`$V(R,\theta)=V_c$, constant ($0$ if you choose $C=0$); total charge $0$; $V\to-E_0r\cos\theta+C$`,
          md`$\dfrac{\partial V}{\partial r}(R,\theta)=0$; $V\to-E_0r\cos\theta$`], 2,
        [md`$V\to0$ kills the applied field, which is the whole problem.`,
          md`Metal is an equipotential. $-E_0R\cos\theta$ is the applied potential with the sphere absent.`, null,
          md`That describes an insulating sphere that no field line enters (Neumann), not metal.`],
        md`Equipotential sphere, zero net charge, uniform field far away. By the antisymmetry of the setup the plane $z=0$ is at the same potential as the sphere, so choosing $C=0$ puts the sphere at $V=0$. Result: $V=-E_0(r-R^3/r^2)\cos\theta$.`,
        { figHtml: figField({ note: 'uncharged metal sphere' }) }),

      Q(md`An isolated metal sphere carrying charge $Q$ sits in a field that is uniform, $E_0\hat{\mathbf z}$, far away (Griffiths 3.21). Which set?`,
        [md`$V(R,\theta)=0$; $V\to-E_0r\cos\theta$`,
          md`$V(R,\theta)=V_c$, unknown; $-\varepsilon_0\oint\dfrac{\partial V}{\partial r}\,da=Q$ at $r=R$; $V\to-E_0r\cos\theta+C$`,
          md`$\sigma=\tfrac{Q}{4\pi R^2}$ on the sphere; $V\to-E_0r\cos\theta$`,
          md`$V(R,\theta)=V_c$; $V\to\dfrac{Q}{4\pi\varepsilon_0r}$ as $r\to\infty$`], 1,
        [md`Grounding would drain the charge: with $C=0$ the sphere would end up neutral.`, null,
          md`The field also induces $3\varepsilon_0E_0\cos\theta$; $\sigma$ is not uniform.`,
          md`Far away the applied field dominates; the $Q/r$ part decays.`],
        md`Equipotential (unknown value), total charge $Q$, uniform field far away. In the Legendre series the charge condition reads $B_0=\tfrac{Q}{4\pi\varepsilon_0}$, and the result is $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta+\dfrac{Q}{4\pi\varepsilon_0r}$ (lesson 8).`,
        { figHtml: figField({ q: 'Q', note: 'isolated metal sphere, charge Q' }) }),

      Q(md`A thin plastic shell of radius $R$ has surface charge $\sigma_0(\theta)$ glued on; there are no other charges and no metal. Which set (Griffiths Ex. 3.9)?`,
        [md`$V(R,\theta)=$ const; $V\to0$`,
          md`$V_{\text{in}}$ finite at $0$; $V_{\text{out}}\to0$; $V_{\text{in}}=V_{\text{out}}$ and $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=+\sigma_0/\varepsilon_0$ at $r=R$`,
          md`$V_{\text{in}}$ finite at $0$; $V_{\text{out}}\to0$; $\partial_rV$ continuous and $V_{\text{out}}-V_{\text{in}}=\sigma_0/\varepsilon_0$ at $r=R$`,
          md`$V_{\text{in}}$ finite at $0$; $V_{\text{out}}\to0$; $V_{\text{in}}(R,\theta)=V_{\text{out}}(R,\theta)$; $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma_0(\theta)/\varepsilon_0$ at $r=R$`], 3,
        [md`Plastic is not an equipotential; $V$ on the shell is part of the answer.`,
          md`Sign: $E_r=-\partial_rV$ jumps **up** by $\sigma_0/\varepsilon_0$ going outward, so $\partial_rV$ jumps **down**.`,
          md`Backwards: $V$ is continuous, its slope jumps.`, null],
        md`Two regions, four conditions: regular at the origin (kills $B_\ell$ inside), $V\to0$ (kills $A_\ell$ outside), and the two matching conditions at $r=R$. Continuity gives $B_\ell=A_\ell R^{2\ell+1}$; the jump fixes $A_\ell$ (lesson 3).`,
        { figHtml: figShell({ lab: md`\sigma_0(\theta)` }) }),

      Q(md`$V_0(\theta)$ is specified on a spherical surface of radius $R$, with no charge inside or outside. You want $V$ **outside**. Which set?`,
        [md`$V(R,\theta)=V_0(\theta)$; $V\to0$ as $r\to\infty$`,
          md`$V(R,\theta)=V_0(\theta)$; $V$ finite at $r=0$`,
          md`$V(R,\theta)=V_0(\theta)$; $V\to0$ as $r\to\infty$; $V$ finite at $r=0$`,
          md`$V\to0$ as $r\to\infty$ only`], 0,
        [null, md`The origin is not in the outside region.`,
          md`Imposing finiteness at the origin as well would kill the $B_\ell$ too, leaving nothing. The origin is not part of this region.`,
          md`The surface values are the only source; without them $V\equiv0$.`],
        md`Outside: $V\to0$ kills the $A_\ell$, and $V(R,\theta)=V_0(\theta)$ fixes the $B_\ell$ (Lecture 13, $B_\ell=\tfrac{2\ell+1}{2}R^{\ell+1}\int V_0P_\ell\sin\theta\,d\theta$).`,
        { figHtml: figShell({ lab: md`V_0(\theta)`, outLab: md`V\ ?` }) }),

      Q(md`The inner sphere (radius $a$) is held at $V_0\cos\theta$ and the outer shell (radius $b$) is grounded. You want $V$ between them. Which set?`,
        [md`$V(a,\theta)=V_0\cos\theta$; $V(b,\theta)=0$; $V$ finite at $r=0$`,
          md`$V(a,\theta)=V_0\cos\theta$; $V(b,\theta)=0$; $V\to0$ as $r\to\infty$`,
          md`$V(a,\theta)=V_0\cos\theta$; $V(b,\theta)=0$`,
          md`$V(a,\theta)=V_0$; $V(b,\theta)=0$`], 2,
        [md`The origin is not in $a<r<b$. Imposing it would wrongly kill the $B_\ell$.`,
          md`Infinity is not in $a<r<b$ either. Imposing it would wrongly kill the $A_\ell$.`, null,
          md`The inner potential varies with $\theta$.`],
        md`A shell region keeps both radial families, $A_\ell r^\ell+B_\ell r^{-(\ell+1)}$, and the two surfaces supply two equations per $\ell$. Here only $\ell=1$ appears (lesson 8 solves it).`,
        { figHtml: figConc({ inner: md`V_0\cos\theta`, outer: GR, outerMetal: true }) }),

      Q(md`A grounded conducting plane has a hemispherical bump of radius $R$. Far away the field is uniform, $E_0\hat{\mathbf z}$. Which set?`,
        [md`$V=0$ on the flat part; $V\to0$ far away`,
          md`$V=0$ on the plane $z=0$ outside the bump and on the bump $r=R$, $z>0$; $V\to-E_0z$ far away`,
          md`$V=0$ on the bump only; $V\to-E_0z$`,
          md`$V=0$ on the plane; $\partial V/\partial r=0$ on the bump; $V\to-E_0z$`], 1,
        [md`$V\to0$ kills the applied field, and the bump is missing.`, null,
          md`The plane and the bump are one grounded conductor; both are boundaries.`,
          md`The bump is metal, so $V=0$ on it too.`],
        md`One grounded conductor (plane plus bump), so $V=0$ on all of it, and the uniform field far away. The constant in $-E_0z+C$ must be $0$ to match the grounded plane far from the bump. Lesson 6 shows the sphere-in-a-field solution already satisfies all of this.`,
        { figHtml: figBump({ field: true, plab: GR }) }),

      Q(md`A sheet in the plane $y=0$ carries $\sigma(x)=\sigma_0\sin kx$. There are no conductors anywhere. Which set?`,
        [md`$V(x,0)=0$; $V\to0$ as $|y|\to\infty$`,
          md`$V(x,0)=\sigma_0\sin kx/\varepsilon_0$; $V\to0$ as $|y|\to\infty$`,
          md`$V\to0$ as $|y|\to\infty$; $V$ and $\partial V/\partial y$ continuous at $y=0$`,
          md`$V\to0$ as $y\to\pm\infty$; $V$ continuous at $y=0$; $\partial_yV\big|_{0^+}-\partial_yV\big|_{0^-}=-\sigma_0\sin kx/\varepsilon_0$`], 3,
        [md`The sheet isn't grounded metal. $V$ on it is part of the answer.`,
          md`$\sigma/\varepsilon_0$ is a field (a jump in slope), not a potential. Units don't match.`,
          md`A continuous slope would mean no charge on the sheet.`, null],
        md`Two half-spaces, each with its own solution; far-field conditions on each; two matching conditions at $y=0$. Lesson 3 solves it: $V=\dfrac{\sigma_0}{2\varepsilon_0k}\sin kx\,e^{-k|y|}$.`,
        { figHtml: figSheet({}) }),

      Q(md`A metal sphere of radius $a$ carries charge $Q$. It is surrounded by a concentric thin metal shell of radius $b$, which is grounded. You want $V$ between them. Which set?`,
        [md`$V(b)=0$; $V(a)=V_c$, unknown; $-\varepsilon_0\oint\dfrac{\partial V}{\partial r}\,da=Q$ at $r=a$`,
          md`$V(b)=0$; $V(a)=\dfrac{Q}{4\pi\varepsilon_0a}$`,
          md`$V(a)=V_c$; $V\to0$ as $r\to\infty$`,
          md`$V(b)=0$; $V(a)=0$; total charge $Q$ on the inner sphere`], 0,
        [null, md`That's the isolated sphere's potential. With a grounded shell around it, $V(a)=\dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$.`,
          md`Infinity isn't in the region $a<r<b$, and the grounded shell is missing.`,
          md`Both at zero would force zero charge; $V(a)$ is what you're solving for.`],
        md`Only $\ell=0$ appears: $V=A+B/r$. $V(b)=0$ and the charge condition ($-\varepsilon_0\,4\pi a^2\,\partial_rV=Q$, i.e. $B=\tfrac{Q}{4\pi\varepsilon_0}$) give $V=\dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1b\right)$, and $C=Q/V(a)=4\pi\varepsilon_0\dfrac{ab}{b-a}$.`,
        { figHtml: figConc({ innerMetal: true, outerMetal: true, inner: 'Q', outer: GR }) }),

      Q(md`A closed metal box is held at $V_0$, and its interior is empty. What is $V$ inside?`,
        [md`$V=V_0$ on the walls, falling to $0$ at the center`,
          md`$V=0$ inside: the metal shields everything`,
          md`The walls give $V=V_0$ on the boundary, and $V=V_0$ satisfies Laplace's equation, so $V=V_0$ everywhere inside`,
          md`It depends on the charges outside the box`], 2,
        [md`An interior minimum is impossible for a solution of Laplace's equation.`, md`Shielding makes $\vb E=0$ inside, not $V=0$. The inside sits at the box's potential.`, null, md`Outside charges only rearrange the outer surface charge. The cavity sees only its wall's potential.`],
        md`Griffiths Ex. 3.1: one boundary, $V=V_0$ on all of it, no charge inside. $V=V_0$ fits both, and uniqueness says it's the only answer. So $\vb E=0$ in an empty cavity (the Faraday cage of Lecture 7).`,
        { figHtml: figHollow({ box: true, lab: 'V_0', inLab: 'empty' }) }),

      RF(md`
        !!key Patterns to remember
          - "Grounded", "held at": $V$ given, charge unknown. "Isolated", "neutral", "carries $Q$": charge given, $V$ an unknown constant. Never both on one conductor.
          - "Insulated from" means each piece has its own value; "welded" or "connected" means one value.
          - Name the region first. List its faces, plus infinity only if the region reaches it, plus the origin only if the region contains it.
          - A real charge inside the region means Poisson's equation with that charge. Charges outside the region, and images, never appear in the list.
          - Uniform field far away: $V\to-E_0z+C$, never $V\to0$.
          - Glued-on charge is not metal: match across it (continuous $V$, jump in $\partial V/\partial n$).
      `),
    ],
  });

  // =====================================================================================
  // Lesson 3. Matching conditions at surfaces
  // =====================================================================================
  // long hollow cylindrical tube with uniform sigma (side view)
  function figTube() {
    const f = fig();
    const x0 = 60, x1 = 270, cy = 100, rx = 14, ry = 46;
    f.ellipse(x0, cy, rx, ry, { cls: 'thick' });
    f.line(x0, cy - ry, x1, cy - ry, { cls: 'thick' }); f.line(x0, cy + ry, x1, cy + ry, { cls: 'thick' });
    f.ellipse(x1, cy, rx, ry, { half: 'front', cls: 'thick' }); f.ellipse(x1, cy, rx, ry, { half: 'back', cls: 'dash dim' });
    f.line(x0 - 30, cy, x1 + 40, cy, { cls: 'dash dim' });
    f.line(110, cy, 110, cy - ry, { cls: 'dim' }); f.label(115, cy - ry / 2, 'R', 'l', 'small');
    f.label(x1 - 40, cy - ry - 8, md`\sigma`, 'b');
    f.text(x1 + 30, cy + ry + 8, 'infinitely long', 'tr');
    f.dot(160, cy + 22, 2.8); f.tag(160, cy + 22, 's', 'r', 6, 'small'); f.line(160, cy, 160, cy + 19, { cls: 'dim thin' });
    return f.svg();
  }
  // V along a line crossing the sheet: amplitude e^{-k|y|}
  const plotDecay = (xt, yt) => PF.plot({ w: 320, h: 190, x: [-3, 3], y: [0, 1.25], xl: 'y', yl: 'V', zero: true,
    xt: xt || [[-1, '-1/k'], [1, '1/k']], yt: yt || [[1, md`\tfrac{\sigma_0}{2\varepsilon_0 k}`]],
    curves: [{ f: (y) => Math.exp(-Math.abs(y)) }], ml: 56 });

  LESSONS.push({
    id: 'ub-match', title: 'Matching conditions at charged surfaces and conductors',
    steps: [
      RF(md`
        Lecture 5 derived two conditions at any surface carrying surface charge $\sigma$ (flat or curved: zoom in until it looks flat).
        - **Pillbox** (Gauss's law), height $\to0$: $E^\perp_{\text{above}}-E^\perp_{\text{below}}=\sigma/\varepsilon_0$.
        - **Thin loop** ($\oint\vb E\cdot d\vb l=0$), height $\to0$: $E^\parallel_{\text{above}}=E^\parallel_{\text{below}}$.

        [[fig:pill]]

        Together (Lecture 6): $\vb E_{\text{above}}-\vb E_{\text{below}}=\dfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$, with $\hat{\mathbf n}$ pointing from "below" to "above". Rename the sides and $\hat{\mathbf n}$ flips with them, so the physics doesn't change.

        In terms of $V$, which is what separation of variables uses:
        1. $V_{\text{above}}=V_{\text{below}}$ on the surface (a path of zero length gives zero $\int\vb E\cdot d\vb l$; Griffiths 2.34).
        2. $\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-\dfrac{\sigma}{\varepsilon_0}$, where $\dfrac{\partial V}{\partial n}=\nabla V\cdot\hat{\mathbf n}$.

        Condition 1 already contains the $E^\parallel$ condition: if $V$ agrees on both sides all along the surface, its derivatives **along** the surface agree too.

        !!trap The jump is $\sigma/\varepsilon_0$, not $\tfrac{\sigma}{2\varepsilon_0}$
          A lone flat sheet gives $\tfrac{\sigma}{2\varepsilon_0}$ on each side, pointing away, and the **jump** is $\sigma/\varepsilon_0$. The jump is always $\sigma/\varepsilon_0$; how it splits between the two sides depends on the other charges around.
      `, { pill: { svg: figPill(), cap: 'Pillbox (left) for the normal component, thin loop (right) for the tangential one.' } }),

      Q(md`Across a surface carrying charge density $\sigma$, which statement is right?`,
        [md`$E^\perp$ jumps by $\sigma/\varepsilon_0$; $E^\parallel$ is continuous`, md`$E^\parallel$ jumps by $\sigma/\varepsilon_0$; $E^\perp$ is continuous`, md`Both components jump by $\tfrac{\sigma}{2\varepsilon_0}$`, md`Both components are continuous; only $V$ jumps`], 0,
        [null, md`Backwards. The loop argument ($\oint\vb E\cdot d\vb l=0$) makes the tangential part continuous; the pillbox gives the normal jump.`,
          md`$\tfrac{\sigma}{2\varepsilon_0}$ is the field of the local patch on one side. The tangential part doesn't jump at all.`,
          md`$V$ is continuous across a surface charge (finite field, zero path length). Its normal derivative jumps.`],
        md`Pillbox: the flux through the lids changes by $(E^\perp_{\text{above}}-E^\perp_{\text{below}})A=\sigma A/\varepsilon_0$. Thin loop: the two long sides give $(E^\parallel_{\text{above}}-E^\parallel_{\text{below}})l=0$. Only the normal component jumps.`,
        { figHtml: figPill() }),

      Q(md`Near a sheet in the plane $y=0$, with no other charges around, the potential is $V=V_0\cos(x/L)\,e^{-|y|/L}$. What is the surface charge on the sheet?`,
        [md`$0$, because $V$ is continuous at $y=0$`, md`$\dfrac{\varepsilon_0V_0}{L}\cos(x/L)$`, md`$-\dfrac{2\varepsilon_0V_0}{L}\cos(x/L)$`, md`$\dfrac{2\varepsilon_0V_0}{L}\cos(x/L)$`], 3,
        [md`$V$ is always continuous across a surface charge. The charge shows up as a kink, a jump in $\partial V/\partial y$.`,
          md`That uses only one side. Both sides slope away from the sheet, and both contribute.`,
          md`Sign. $\partial_yV$ goes from $+V_0/L$ (below) to $-V_0/L$ (above), a change of $-2V_0/L$, which equals $-\sigma/\varepsilon_0$.`, null],
        md`With $\hat{\mathbf n}=\hat{\mathbf y}$: $\partial_yV\big|_{0^+}=-\dfrac{V_0}{L}\cos\dfrac xL$ and $\partial_yV\big|_{0^-}=+\dfrac{V_0}{L}\cos\dfrac xL$. The difference is $-\dfrac{2V_0}{L}\cos\dfrac xL=-\dfrac{\sigma}{\varepsilon_0}$, so $\sigma=\dfrac{2\varepsilon_0V_0}{L}\cos\dfrac xL$. A peak in $V$ (both sides sloping down) means positive charge. Off the sheet $\nabla^2V=(-1/L^2+1/L^2)V=0$, so nothing else is needed: this is the sinusoidal sheet with $k=1/L$.`,
        { figHtml: plotDecay([[-1, '-L'], [1, 'L']], [[1, 'V_0']]) }),

      Q(md`In the jump condition you decide to call the region **below** the sheet "above", so $\hat{\mathbf n}$ now points down. What changes?`,
        [md`$\sigma$ comes out with the opposite sign`,
          md`The jump becomes $\tfrac{\sigma}{2\varepsilon_0}$`,
          md`$E^\parallel$ now jumps instead of $E^\perp$`,
          md`Nothing physical: $\hat{\mathbf n}$, both normal derivatives and the labels all flip together, and you get the same $\sigma$`], 3,
        [md`Both $\partial V/\partial n$ terms change sign **and** swap places, so their difference keeps its sign.`,
          md`The size of the jump doesn't depend on a naming convention.`, md`Which component jumps is geometry (normal versus along the surface), not naming.`, null],
        md`$\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}$ with the new names is $\left(-\partial_yV\big|_{0^-}\right)-\left(-\partial_yV\big|_{0^+}\right)$, the same number as before. Griffiths' footnote: it doesn't matter which side you call above. What matters is using $\hat{\mathbf n}$ consistently from below to above.`,
        { figHtml: figPill() }),

      Q(md`Solving for the sinusoidal sheet, a student imposes (1) $V$ continuous at $y=0$ and (2) the jump in $\partial V/\partial y$. She worries she forgot "$E^\parallel$ continuous". Did she?`,
        [md`No: $V(x,0^+)=V(x,0^-)$ for every $x$ already makes $\partial V/\partial x$, hence $E_x$, the same on both sides`,
          md`Yes: she needs a third condition, $E_x(0^+)=E_x(0^-)$`,
          md`Yes, and it replaces condition (1)`,
          md`It doesn't matter: $E^\parallel$ is always zero at a charged sheet`], 0,
        [null, md`It is implied by (1). A third condition would over-specify the matching.`, md`Then you'd lose the potential's continuity, which you need for the coefficients.`, md`$E^\parallel=0$ only at a **conductor's** surface. A charged plastic sheet can have tangential field.`],
        md`Continuity of $V$ along the whole surface is a statement for every $x$, and differentiating it with respect to $x$ gives continuity of $E_x$. So in separation problems the two working conditions are: $V$ continuous, and the jump in the normal derivative.`,
        { figHtml: figSheet({}) }),

      RF(md`
        ### At a conductor

        Inside the metal $\vb E=0$ (Lecture 7). Call the metal "below" and the outside "above", with $\hat{\mathbf n}$ pointing **out of the metal**:
        $$\vb E_{\text{just outside}}=\frac{\sigma}{\varepsilon_0}\hat{\mathbf n},\qquad \sigma=-\varepsilon_0\frac{\partial V}{\partial n}\quad\text{(Griffiths 2.48–2.49).}$$

        [[fig:cond]]

        This is the formula behind every induced charge in images and separation of variables (Lecture 10: $\sigma=-\varepsilon_0\,\partial V/\partial z|_{z=0}$ for the plane). The whole sign is in $\hat{\mathbf n}$:

        | Surface | field region | $\hat{\mathbf n}$ | $\sigma$ |
        |---|---|---|---|
        | plane $z=0$ | $z>0$ | $+\hat{\mathbf z}$ | $-\varepsilon_0\,\partial V/\partial z$ |
        | outside of a sphere | $r>R$ | $+\hat{\mathbf r}$ | $-\varepsilon_0\,\partial V/\partial r$ |
        | inner wall of a shell (cavity) | $r<R$ | $-\hat{\mathbf r}$ | $+\varepsilon_0\,\partial V/\partial r$ |
        | plate at $x=d$ | $x<d$ | $-\hat{\mathbf x}$ | $+\varepsilon_0\,\partial V/\partial x$ |

        A thin metal shell has two surfaces; each gets its own $\sigma$ from the field on its own side. The field just outside a conductor is $\sigma/\varepsilon_0$, not $\tfrac{\sigma}{2\varepsilon_0}$: the other charges cancel the patch's field inside the metal and double it outside.
      `, { cond: { svg: figCond(), cap: 'Just outside a conductor the field is normal, $\\sigma/\\varepsilon_0$; inside it is zero.' } }),

      Q(md`A conductor carries surface charge $\sigma$ at some point of its surface. What is the field just outside, at that point?`,
        [md`$\dfrac{\sigma}{2\varepsilon_0}$, normal to the surface`, md`$\dfrac{\sigma}{\varepsilon_0}$, tangent to the surface`, md`$\dfrac{\sigma}{\varepsilon_0}$, normal to the surface`, md`$0$, because the conductor shields it`], 2,
        [md`That's the field of an isolated sheet on one side. Inside the metal the field is zero, so the whole jump $\sigma/\varepsilon_0$ is outside.`,
          md`A tangential field would push charge along the surface until it vanished.`, null,
          md`The field is zero **inside** the metal, not outside.`],
        md`Jump condition with $\vb E_{\text{below}}=0$ (in the metal): $\vb E_{\text{above}}=(\sigma/\varepsilon_0)\hat{\mathbf n}$. Normal because $E^\parallel$ is continuous and zero inside.`,
        { figHtml: figCond() }),

      Q(md`$V(r,\theta)$ is known inside a grounded spherical shell (a charge sits in the cavity). Which formula gives the charge induced on the inner wall?`,
        [md`$\sigma=+\varepsilon_0\dfrac{\partial V}{\partial r}\Big|_{r=R}$`, md`$\sigma=-\varepsilon_0\dfrac{\partial V}{\partial r}\Big|_{r=R}$`, md`$\sigma=-\dfrac{\varepsilon_0}{R}\dfrac{\partial V}{\partial\theta}\Big|_{r=R}$`, md`$\sigma=\varepsilon_0V(R)/R$`], 0,
        [null, md`That uses $\hat{\mathbf n}=+\hat{\mathbf r}$, which points from the cavity **into** the metal. $\hat{\mathbf n}$ must point out of the metal, into the field region: $-\hat{\mathbf r}$.`,
          md`That is a tangential derivative. $\sigma$ depends on the normal one.`, md`$V(R)=0$ here, and $\sigma$ depends on a derivative, not on $V$.`],
        md`$\sigma=-\varepsilon_0\,\partial V/\partial n$ with $\hat{\mathbf n}=-\hat{\mathbf r}$ gives $\partial V/\partial n=-\partial V/\partial r$, so $\sigma=+\varepsilon_0\,\partial V/\partial r$. Sanity check: a positive charge in the cavity raises $V$ inside above the wall's $0$, so $\partial V/\partial r<0$ near the wall and $\sigma<0$, as it must be.`,
        { figHtml: figInside({}) }),

      Q(md`Between two plates, $V(x)=V_0x/d$ (left plate grounded at $x=0$, right plate at $V_0$ at $x=d$). What is the surface charge on the inner face of the **right** plate?`,
        [md`$-\varepsilon_0V_0/d$`, md`$\tfrac{\varepsilon_0V_0}{2d}$`, md`$0$`, md`$+\varepsilon_0V_0/d$`], 3,
        [md`That's the left plate. Using $\hat{\mathbf n}=+\hat{\mathbf x}$ at the right plate gives this wrong sign.`, md`No factor of $\tfrac12$ at a conductor.`, md`The plates have equal and opposite charges; neither is zero.`, null],
        md`At $x=d$ the field region is to the left, so $\hat{\mathbf n}=-\hat{\mathbf x}$ and $\sigma=-\varepsilon_0\,\partial V/\partial n=+\varepsilon_0V'(d)=\varepsilon_0V_0/d$. Left plate: $\hat{\mathbf n}=+\hat{\mathbf x}$, $\sigma=-\varepsilon_0V_0/d$. The higher-potential plate is the positive one, as it should be.`,
        { figHtml: figPlates({ L: 'V=0', R: 'V_0' }) }),

      Q(md`A thin metal shell of radius $R$ carries total charge $Q$, with a point charge $q$ at its center. What are the surface charge densities on its inner and outer faces?`,
        [md`$\sigma_{\text{in}}=0$, $\sigma_{\text{out}}=\dfrac{Q}{4\pi R^2}$`, md`$\sigma_{\text{in}}=\sigma_{\text{out}}=\dfrac{Q}{8\pi R^2}$`, md`$\sigma_{\text{in}}=-\dfrac{q}{4\pi R^2}$, $\sigma_{\text{out}}=\dfrac{Q+q}{4\pi R^2}$`, md`$\sigma_{\text{in}}=\dfrac{q}{4\pi R^2}$, $\sigma_{\text{out}}=\dfrac{Q-q}{4\pi R^2}$`], 2,
        [md`The field of $q$ ends on the inner face: a Gaussian surface inside the metal encloses zero charge.`, md`The two faces see different fields, so they carry different charge.`, null, md`Signs: the inner face must cancel $q$'s flux, so it carries $-q$.`],
        md`Each face of a thin shell is its own boundary. Inner face: field region is the cavity, field $\tfrac{q}{4\pi\varepsilon_0R^2}$ pointing **into** the metal ($\hat{\mathbf n}=-\hat{\mathbf r}$), so $\sigma_{\text{in}}=-\tfrac{q}{4\pi R^2}$. The rest of the shell's charge, $Q+q$, goes to the outer face; outside, the field is that of $Q+q$ at the center.`,
        { figHtml: figHollow({ lab: 'Q' }) }),

      RF(md`
        ### Worked example: a sheet with $\sigma(x)=\sigma_0\sin kx$

        The plane $y=0$ carries $\sigma(x)=\sigma_0\sin kx$. There is no other charge anywhere. Find $V$.

        [[fig:sheet]]

        **Regions:** above ($y>0$) and below ($y<0$). Both are charge-free, so $\nabla^2V=0$ in each, and each gets its own separated solution.

        **BCs:**
        1. $V\to0$ as $y\to+\infty$
        2. $V\to0$ as $y\to-\infty$
        3. $V(x,0^+)=V(x,0^-)$ (continuity)
        4. $\dfrac{\partial V}{\partial y}\Big|_{0^+}-\dfrac{\partial V}{\partial y}\Big|_{0^-}=-\dfrac{\sigma_0\sin kx}{\varepsilon_0}$ (jump, $\hat{\mathbf n}=\hat{\mathbf y}$)

        **Separated form.** The source varies as $\sin kx$, so only that harmonic appears: $V=(Ae^{ky}+Be^{-ky})\sin kx$. (The $x$-dependence of the source picks the separation constant; no Fourier sum needed.)
        - BC #1 kills $e^{ky}$ above: $V_+=B\,e^{-ky}\sin kx$.
        - BC #2 kills $e^{-ky}$ below: $V_-=A\,e^{ky}\sin kx$.
        - BC #3: $A=B\equiv C$. So $V=C\,e^{-k|y|}\sin kx$.
        - BC #4: $-kC\sin kx-kC\sin kx=-\dfrac{\sigma_0}{\varepsilon_0}\sin kx$, so $C=\dfrac{\sigma_0}{2\varepsilon_0k}$.
        $$V(x,y)=\frac{\sigma_0}{2\varepsilon_0k}\,\sin kx\;e^{-k|y|}.$$

        [[fig:decay]]

        **Checks.** $\nabla^2V=(-k^2+k^2)V=0$ off the sheet. Just above, $E_y=-\partial_yV=\dfrac{\sigma_0\sin kx}{2\varepsilon_0}=\dfrac{\sigma(x)}{2\varepsilon_0}$: exactly the field of a uniform sheet with the local $\sigma$, as Griffiths' footnote on the local patch says. Below, $E_y=-\tfrac{\sigma}{2\varepsilon_0}$. $E_x=-\partial_xV$ is the same on both sides.

        !!intuition A periodic charge pattern is invisible from far away
          The field dies off as $e^{-k|y|}$: within a distance $1/k=\tfrac{\lambda}{2\pi}$ of the sheet. Far away the $+$ and $-$ stripes cancel. A finer pattern (larger $k$) is both weaker ($C\propto1/k$) and shorter-ranged. The same $e^{-n\pi x/a}$ decay is why only the lowest Fourier term of the slot survives far from its end.
      `, { sheet: { svg: figSheet({}), cap: 'Edge-on view of the sheet; $+$ and $-$ mark the sign of $\\sigma$.' }, decay: { svg: plotDecay(), cap: 'The potential along a vertical line where $\\sin kx=1$: a cusp at the sheet (the charge), decaying over $1/k$.' } }),

      Q(md`For the sheet $\sigma_0\sin kx$, how far from the sheet does the potential fall to $1/e$ of its value on the sheet?`,
        [md`One wavelength, $\lambda=2\pi/k$`, md`$1/k=\tfrac{\lambda}{2\pi}$`, md`$\tfrac{1}{2k}$`, md`It never decays: the sheet is infinite`], 1,
        [md`$e^{-k|y|}$ at $|y|=\lambda$ is $e^{-2\pi}\approx0.002$, far below $1/e$.`, null, md`$e^{-k/(2k)}=e^{-1/2}$.`, md`An infinite **uniform** sheet has a field that never decays. A sheet whose charge alternates in sign has zero average, and its field dies off.`],
        md`$V\propto e^{-k|y|}$, which is $1/e$ at $|y|=1/k=\tfrac{\lambda}{2\pi}$. So the field reaches out only about a sixth of a wavelength.`,
        { figHtml: figSheet({}) }),

      Q(md`The pattern's wavelength is halved ($k\to2k$) with $\sigma_0$ unchanged. What happens to $V$?`,
        [md`The amplitude on the sheet halves, and it decays twice as fast`, md`The amplitude doubles, and it decays twice as fast`, md`The amplitude is unchanged; only the decay is faster`, md`Nothing changes except the stripes are narrower`], 0,
        [null, md`$C=\tfrac{\sigma_0}{2\varepsilon_0k}$ goes **down** as $k$ goes up: narrower stripes of opposite sign cancel each other better.`, md`$C\propto1/k$, so the amplitude changes too.`, md`Both the amplitude and the range scale with $1/k$.`],
        md`$V=\dfrac{\sigma_0}{2\varepsilon_0k}\sin kx\,e^{-k|y|}$: doubling $k$ halves the prefactor and halves the decay length. (The field just above the sheet, $\tfrac{\sigma}{2\varepsilon_0}$, doesn't depend on $k$.)`,
        { figHtml: figSheet({}) }),

      Q(md`Check the long-wavelength limit. As $k\to0$ the sheet looks locally uniform. What is $E_y$ just above it?`,
        [md`It diverges like $1/k$`, md`$\sigma(x)/\varepsilon_0$`, md`$0$`, md`$\tfrac{\sigma(x)}{2\varepsilon_0}$, for every $k$, matching a uniform sheet with the local $\sigma$`], 3,
        [md`$V$'s amplitude $\propto1/k$ does grow, but $E_y=-\partial_yV$ brings down a factor $k$.`, md`That would be the field just outside a **conductor**. A lone sheet splits the jump evenly.`, md`$E_y$ just above is $\tfrac{\sigma}{2\varepsilon_0}$, not zero.`, null],
        md`$E_y(0^+)=-\partial_yV=k\cdot\dfrac{\sigma_0}{2\varepsilon_0k}\sin kx=\dfrac{\sigma(x)}{2\varepsilon_0}$. Close to the sheet only the local patch matters, and a patch looks like an infinite plane: $\tfrac{\sigma}{2\varepsilon_0}$ on each side. (The growing amplitude of $V$ as $k\to0$ is just the uniform sheet's $V=-\tfrac{\sigma|y|}{2\varepsilon_0}+\text{const}$ with the constant going to infinity.)`,
        { figHtml: plotDecay() }),

      Q(md`For the sheet, compare the field components just above and just below $y=0$.`,
        [md`Both $E_x$ and $E_y$ flip sign`, md`Both are the same on the two sides`, md`$E_x$ is the same on both sides; $E_y$ flips sign`, md`$E_x$ flips sign; $E_y$ is the same`], 2,
        [md`$E_x=-\partial_xV$ depends on $y$ only through $e^{-k|y|}$, which is $1$ on both sides.`, md`Then there would be no charge on the sheet.`, null, md`Backwards: the tangential component is continuous, the normal one jumps.`],
        md`$E_x=-\dfrac{\sigma_0}{2\varepsilon_0}\cos kx\,e^{-k|y|}$ is continuous. $E_y=\pm\dfrac{\sigma_0}{2\varepsilon_0}\sin kx\,e^{-k|y|}$ for $y\gtrless0$ flips, jumping by $\sigma(x)/\varepsilon_0$. Lecture 5's two conditions, seen in a real solution.`,
        { figHtml: figSheet({}) }),

      P({
        id: 'ub-sheetcos', title: 'A cosine charge pattern',
        q: md`The plane $z=0$ carries $\sigma(x)=\sigma_0\cos(2\pi x/\lambda)$, with no other charges anywhere.

          (a) Find $V(x,z)$ for $z>0$.
          (b) Find $E_z$ just above the sheet at $x=0$.
          (c) At what height has the amplitude of $V$ dropped to 1% of its value on the sheet? Give it in units of $\lambda$.`,
        figHtml: figSheet({ cos: true, lab: md`\sigma_0\cos(2\pi x/\lambda)` }),
        hints: [
          md`Same structure as the worked example with $k=2\pi/\lambda$ and $\cos$ instead of $\sin$. Write the four BCs first: $V\to0$ above and below, $V$ continuous at $z=0$, jump in $\partial V/\partial z$.`,
          md`$V=Ce^{-k|z|}\cos kx$ by symmetry and the far-field conditions. The jump condition gives $-2kC=-\sigma_0/\varepsilon_0$.`,
          md`For (c): $e^{-kz}=0.01$, so $z=\ln100/k$.`,
        ],
        parts: [
          { lbl: md`V(x,z)`, expr: 'sigma0*lambda/(4*pi*eps0)*cos(2*pi*x/lambda)*exp(-2*pi*z/lambda)', vars: { sigma0: [1, 2], lambda: [1, 3], x: [0.05, 0.4], z: [0.1, 1], eps0: [0.5, 2] }, accepts: ['sigma0/(2*eps0*(2*pi/lambda))*cos(2*pi*x/lambda)*exp(-2*pi*z/lambda)'] },
          { lbl: md`E_z(0,0^+)`, expr: 'sigma0/(2*eps0)', vars: { sigma0: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`z_{1\%}/\lambda`, ans: Math.log(100) / (2 * Math.PI), unit: '' },
        ],
        sol: md`
          **Regions:** $z>0$ and $z<0$, both charge-free. **BCs:**
          1. $V\to0$ as $z\to+\infty$
          2. $V\to0$ as $z\to-\infty$
          3. $V(x,0^+)=V(x,0^-)$
          4. $\partial_zV\big|_{0^+}-\partial_zV\big|_{0^-}=-\dfrac{\sigma_0}{\varepsilon_0}\cos kx$, with $k=2\pi/\lambda$

          [[fig:bcs]]

          The source has a single harmonic, $\cos kx$, so $V=(Ae^{kz}+Be^{-kz})\cos kx$ in each region. BC #1 and #2 keep $e^{-kz}$ above and $e^{kz}$ below; BC #3 makes the amplitudes equal: $V=Ce^{-k|z|}\cos kx$. BC #4: $-kC-kC=-\sigma_0/\varepsilon_0$, so $C=\dfrac{\sigma_0}{2\varepsilon_0k}=\dfrac{\sigma_0\lambda}{4\pi\varepsilon_0}$.

          **(a)** $V(x,z)=\dfrac{\sigma_0\lambda}{4\pi\varepsilon_0}\cos\dfrac{2\pi x}{\lambda}\,e^{-2\pi z/\lambda}$ for $z>0$.

          **(b)** $E_z=-\partial_zV=kC\cos kx\,e^{-kz}$; at $x=0$, $z=0^+$: $E_z=kC=\dfrac{\sigma_0}{2\varepsilon_0}$. (The local-patch value, as it must be.)

          **(c)** $e^{-2\pi z/\lambda}=0.01$ gives $z=\dfrac{\ln100}{2\pi}\lambda\approx0.733\,\lambda$.

          **What to remember:** the source's own $x$-dependence picks the separated mode, the far-field conditions pick the decaying exponential on each side, continuity equalizes the amplitudes, and the jump fixes the size.
        `,
        figs: { bcs: { svg: figSheet({ cos: true, lab: md`\#3,\ \#4\ \text{at}\ z=0` }), cap: 'BC #1 and #2 act far above and far below; #3 and #4 act on the sheet.' } },
      }),

      RF(md`
        ### Matching on a sphere: term by term (Griffiths Ex. 3.9)

        A spherical shell of radius $R$ carries $\sigma_0(\theta)$, no other charge.

        [[fig:sh]]

        **BCs:** 1. $V_{\text{in}}$ finite at $r=0$; 2. $V_{\text{out}}\to0$; 3. $V_{\text{in}}(R,\theta)=V_{\text{out}}(R,\theta)$; 4. $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma_0(\theta)/\varepsilon_0$ at $r=R$.

        BC #1 and #2: $V_{\text{in}}=\sum A_\ell r^\ell P_\ell$, $V_{\text{out}}=\sum B_\ell r^{-(\ell+1)}P_\ell$.
        BC #3, for every $\theta$, matches each Legendre coefficient: $B_\ell=A_\ell R^{2\ell+1}$.
        BC #4: $-\sum(\ell+1)B_\ell R^{-(\ell+2)}P_\ell-\sum\ell A_\ell R^{\ell-1}P_\ell=-\sigma_0/\varepsilon_0$, which with BC #3 becomes
        $$\sum_\ell(2\ell+1)A_\ell R^{\ell-1}P_\ell(\cos\theta)=\frac{\sigma_0(\theta)}{\varepsilon_0}.$$
        Expand $\sigma_0=\sum s_\ell P_\ell$ and match: $A_\ell=\dfrac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$.

        For $\sigma_0=k\cos\theta$ ($s_1=k$ only): $A_1=\dfrac{k}{3\varepsilon_0}$, so $V_{\text{in}}=\dfrac{k}{3\varepsilon_0}r\cos\theta=\dfrac{k}{3\varepsilon_0}z$ (a uniform field $-\tfrac{k}{3\varepsilon_0}\hat{\mathbf z}$ inside) and $V_{\text{out}}=\dfrac{kR^3}{3\varepsilon_0}\dfrac{\cos\theta}{r^2}$ (a dipole).
      `, { sh: { svg: figShell({ lab: md`\sigma_0(\theta)` }), cap: 'Charge glued on a shell: two regions joined at $r=R$.' } }),

      Q(md`For the shell with $\sigma_0(\theta)$, what does continuity of $V$ at $r=R$ alone give you?`,
        [md`$B_\ell=A_\ell R^{2\ell+1}$ for every $\ell$`, md`$A_\ell=B_\ell$ for every $\ell$`, md`$A_\ell=0$`, md`The values of $A_\ell$ in terms of $\sigma_0$`], 0,
        [null, md`The powers of $R$ don't match: $A_\ell R^\ell$ must equal $B_\ell R^{-(\ell+1)}$.`, md`Continuity relates inside to outside; it kills nothing.`, md`$\sigma_0$ enters only through the jump condition.`],
        md`$\sum A_\ell R^\ell P_\ell=\sum B_\ell R^{-(\ell+1)}P_\ell$ for all $\theta$; orthogonality matches coefficient by coefficient: $B_\ell=A_\ell R^{2\ell+1}$. The jump condition then fixes the $A_\ell$.`,
        { figHtml: figShell({ lab: md`\sigma_0(\theta)` }) }),

      Q(md`For $\sigma_0(\theta)=k\cos\theta$ ($k>0$), what is the field inside the shell?`,
        [md`Zero, as inside any charged shell`, md`A dipole field, falling like $1/r^3$`, md`Radial, growing like $r$`, md`Uniform, $-\dfrac{k}{3\varepsilon_0}\hat{\mathbf z}$, pointing from the positive north toward the negative south`], 3,
        [md`Zero holds for a **uniform** $\sigma$. Here only the $\ell=1$ part exists, and $r^1P_1=z$ gives a uniform field.`, md`That's outside. Inside, the regular solution is $r\cos\theta$.`, md`$r\cos\theta=z$ has a constant gradient, not a radial one.`, null],
        md`$V_{\text{in}}=\dfrac{k}{3\varepsilon_0}z$, so $\vb E=-\nabla V=-\dfrac{k}{3\varepsilon_0}\hat{\mathbf z}$. With $k=3\varepsilon_0E_0$ this is exactly the induced charge on a metal sphere in a field $E_0\hat{\mathbf z}$, and the inside field $-E_0\hat{\mathbf z}$ cancels the applied one (Griffiths' remark after Ex. 3.9).`,
        { figHtml: figShell({ lab: md`k\cos\theta` }) }),

      Q(md`If instead $\sigma_0$ is uniform, which terms survive, and what is $V$ inside?`,
        [md`Only $\ell=1$; $V_{\text{in}}\propto z$`, md`Only $\ell=0$; $V_{\text{in}}=\sigma_0R/\varepsilon_0$, a constant`, md`All even $\ell$`, md`Only $\ell=0$; $V_{\text{in}}=0$`], 1,
        [md`A uniform $\sigma_0$ is pure $P_0$.`, null, md`$\sigma_0=\sigma_0P_0$ exactly; nothing else appears.`, md`$A_0=s_0R/\varepsilon_0=\sigma_0R/\varepsilon_0\neq0$. The field inside is zero, but $V$ is not.`],
        md`$s_0=\sigma_0$, so $A_0=\sigma_0R/\varepsilon_0$ and $B_0=A_0R=\sigma_0R^2/\varepsilon_0=\tfrac{Q}{4\pi\varepsilon_0}$ with $Q=4\pi R^2\sigma_0$. Outside: a point charge. Inside: constant, equal to the surface value. (HW 3 Prob. 2.31(c) checks exactly this against the boundary conditions.)`,
        { figHtml: figShell({ lab: md`\sigma_0` }) }),

      P({
        id: 'ub-shellcos2', title: 'A shell with σ₀cos²θ',
        q: md`A thin plastic shell of radius $R$ carries $\sigma(\theta)=\sigma_0\cos^2\theta$; no other charge.

          (a) What is $V$ at the center?
          (b) Find $V(r,\theta)$ outside the shell.
          (c) Which Legendre terms appear?`,
        figHtml: figShell({ lab: md`\sigma_0\cos^2\theta` }),
        hints: [
          md`Write the four BCs (regular at $0$, $V\to0$, continuity at $R$, jump at $R$). Then expand $\sigma_0\cos^2\theta$ in Legendre polynomials.`,
          md`$\cos^2\theta=\tfrac13P_0+\tfrac23P_2(\cos\theta)$, since $P_2=\tfrac12(3\cos^2\theta-1)$.`,
          md`$A_\ell=\dfrac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$ and $B_\ell=A_\ell R^{2\ell+1}$. The center value is $A_0$.`,
        ],
        parts: [
          { lbl: md`V(0)`, expr: 'sigma0*R/(3*eps0)', vars: { sigma0: [1, 2], R: [1, 2], eps0: [0.5, 2] } },
          { lbl: md`V_{\text{out}}(r,\theta)`, expr: 'sigma0*R^2/(3*eps0*r) + sigma0*R^4*(3*cos(theta)^2-1)/(15*eps0*r^3)', vars: { sigma0: [1, 2], R: [1, 2], r: [2.5, 4], theta: [0.2, 2.9], eps0: [0.5, 2] }, accepts: ['sigma0*R^2/(3*eps0*r) + 2*sigma0*R^4/(15*eps0*r^3)*(3*cos(theta)^2-1)/2'] },
          { lbl: md`(c) Which terms appear?`, mc: [md`$\ell=2$ only`, md`$\ell=0$ and $\ell=1$`, md`$\ell=0$ and $\ell=2$`, md`All even $\ell$`], a: 2,
            why: [md`$\cos^2\theta$ has a nonzero average, so $\ell=0$ appears too (the shell has net charge).`, md`$\cos^2\theta$ is even in $\cos\theta$; no $P_1$.`, null, md`A polynomial of degree 2 in $\cos\theta$ needs only $P_0$ and $P_2$.`] },
        ],
        sol: md`
          **BCs:** 1. $V_{\text{in}}$ finite at $r=0$; 2. $V_{\text{out}}\to0$; 3. $V_{\text{in}}=V_{\text{out}}$ at $r=R$; 4. $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma/\varepsilon_0$ at $r=R$.

          Expand: $\sigma=\sigma_0\cos^2\theta=\dfrac{\sigma_0}{3}P_0+\dfrac{2\sigma_0}{3}P_2$, so $s_0=\sigma_0/3$, $s_2=2\sigma_0/3$.

          From BC #1–#4 (as in the reading): $A_\ell=\dfrac{s_\ell}{(2\ell+1)\varepsilon_0R^{\ell-1}}$, $B_\ell=A_\ell R^{2\ell+1}$:
          - $A_0=\dfrac{s_0R}{\varepsilon_0}=\dfrac{\sigma_0R}{3\varepsilon_0}$, $B_0=\dfrac{\sigma_0R^2}{3\varepsilon_0}$
          - $A_2=\dfrac{2\sigma_0/3}{5\varepsilon_0R}=\dfrac{2\sigma_0}{15\varepsilon_0R}$, $B_2=\dfrac{2\sigma_0R^4}{15\varepsilon_0}$

          **(a)** $V(0)=A_0=\dfrac{\sigma_0R}{3\varepsilon_0}$.

          **(b)** $V_{\text{out}}=\dfrac{\sigma_0R^2}{3\varepsilon_0r}+\dfrac{2\sigma_0R^4}{15\varepsilon_0r^3}P_2(\cos\theta)=\dfrac{\sigma_0R^2}{3\varepsilon_0r}+\dfrac{\sigma_0R^4(3\cos^2\theta-1)}{15\varepsilon_0r^3}$.

          **(c)** $\ell=0$ and $\ell=2$.

          **Checks.** Total charge: $Q=\int\sigma_0\cos^2\theta\,2\pi R^2\sin\theta\,d\theta=\tfrac{4\pi R^2\sigma_0}{3}$, and the monopole term is $B_0=\tfrac{Q}{4\pi\varepsilon_0}$. Continuity at $R$: inside, $V_{\text{in}}=\dfrac{\sigma_0R}{3\varepsilon_0}+\dfrac{2\sigma_0r^2}{15\varepsilon_0R}P_2$, which equals $V_{\text{out}}$ at $r=R$. Jump: $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\dfrac{\sigma_0}{3\varepsilon_0}-\dfrac{6\sigma_0}{15\varepsilon_0}P_2-\dfrac{4\sigma_0}{15\varepsilon_0}P_2=-\dfrac{\sigma_0}{\varepsilon_0}\left(\tfrac13+\tfrac23P_2\right)$ ✓.

          **What to remember:** expand the source in $P_\ell$ by eye when you can; each $\ell$ is then a separate two-equation problem (continuity and jump).
        `,
      }),

      P({
        id: 'ub-HW3-2.31', src: 'HW 3 · Griffiths 2.31', title: 'Checking the boundary conditions', big: true,
        q: md`(a) Check that the results of Exs. 2.5 and 2.6, and Prob. 2.11, are consistent with Eq. 2.33, $\vb E_{\text{above}}-\vb E_{\text{below}}=\dfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$.
          (b) Use Gauss's law to find the field inside and outside a long hollow cylindrical tube, which carries a uniform surface charge $\sigma$. Check that your result is consistent with Eq. 2.33.
          (c) Check that the result of Ex. 2.8 is consistent with boundary conditions 2.34 ($V$ continuous) and 2.36 (jump in $\partial V/\partial n$).

          (Ex. 2.5: infinite plane, $\tfrac{\sigma}{2\varepsilon_0}$ on each side. Ex. 2.6: two infinite planes $\pm\sigma$. Prob. 2.11: spherical shell, $\vb E=0$ inside and $\tfrac{\sigma R^2}{\varepsilon_0r^2}$ outside. Ex. 2.8: spherical shell of total charge $q$; find $V$.)`,
        figHtml: figTube(),
        hints: [
          md`For each surface, write $\vb E$ just above and just below with the same $\hat{\mathbf n}$, and subtract.`,
          md`(b) Coaxial Gaussian cylinder of radius $s$ and length $L$: no flux through the ends, $E\,2\pi sL=Q_{\text{enc}}/\varepsilon_0$.`,
          md`(c) Ex. 2.8: $V=\dfrac{q}{4\pi\varepsilon_0r}$ outside, $\dfrac{q}{4\pi\varepsilon_0R}$ inside. Compare values and radial slopes at $r=R$, with $\sigma=\tfrac{q}{4\pi R^2}$.`,
        ],
        parts: [
          { lbl: md`(a) For the infinite plane (Ex. 2.5), $\vb E_{\text{above}}-\vb E_{\text{below}}$ is`, mc: [md`$\dfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n}$`, md`$0$`, md`$\dfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$, consistent with 2.33`, md`$\dfrac{2\sigma}{\varepsilon_0}\hat{\mathbf n}$`], a: 2,
            why: [md`That's one side. Below, the field is $-\tfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n}$, so the difference is twice this.`, md`The field reverses direction across the plane.`, null, md`Each side has magnitude $\tfrac{\sigma}{2\varepsilon_0}$; the difference is $\sigma/\varepsilon_0$.`] },
          { lbl: md`(b) |\vb E| \text{ outside the tube, at distance } s`, expr: 'sigma*R/(eps0*s)', vars: { sigma: [1, 2], R: [1, 2], s: [2.5, 4], eps0: [0.5, 2] } },
          { lbl: md`(b) Inside the tube, and the jump at $s=R$:`, mc: [md`$\vb E=0$ inside; the jump is $\sigma/\varepsilon_0$, consistent`, md`$\vb E=\dfrac{\sigma}{2\varepsilon_0}\hat{\mathbf s}$ inside; the jump is $\tfrac{\sigma}{2\varepsilon_0}$`, md`$\vb E=0$ inside; the jump is $\sigma R/\varepsilon_0$`, md`$\vb E\propto s$ inside`], a: 0,
            why: [null, md`No charge is enclosed by a Gaussian cylinder with $s<R$, so $E=0$.`, md`At $s=R$ the outside field is $\tfrac{\sigma R}{\varepsilon_0R}=\sigma/\varepsilon_0$.`, md`That would need volume charge inside. The tube is hollow.`] },
          { lbl: md`(c) For Ex. 2.8, at $r=R$:`, mc: [md`$V$ jumps by $\tfrac{q}{4\pi\varepsilon_0R}$ and $\partial V/\partial r$ is continuous`, md`$V$ is continuous and $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\dfrac{q}{4\pi\varepsilon_0R^2}=-\dfrac{\sigma}{\varepsilon_0}$`, md`Both are continuous`, md`$V$ is continuous and $\partial_rV$ jumps by $+\sigma/\varepsilon_0$`], a: 1,
            why: [md`Both expressions equal $\tfrac{q}{4\pi\varepsilon_0R}$ at $r=R$.`, null, md`Inside, $\partial_rV=0$; outside, $-\tfrac{q}{4\pi\varepsilon_0R^2}$. It jumps.`, md`Sign: $\partial_rV$ drops from $0$ to a negative value.`] },
        ],
        sol: md`
          **(a)** Take $\hat{\mathbf n}$ from below to above in each case.
          - Ex. 2.5, one plane: $\vb E_{\text{above}}=\tfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n}$, $\vb E_{\text{below}}=-\tfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n}$. Difference $\tfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$ ✓.
          - Ex. 2.6, two planes ($+\sigma$ on the left at $x=0$, $-\sigma$ on the right): the field is $\tfrac{\sigma}{\varepsilon_0}\hat{\mathbf x}$ between them and zero outside. At the $+\sigma$ plane ($\hat{\mathbf n}=\hat{\mathbf x}$): $\tfrac{\sigma}{\varepsilon_0}\hat{\mathbf x}-0=\tfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$ ✓. At the $-\sigma$ plane: $0-\tfrac{\sigma}{\varepsilon_0}\hat{\mathbf x}=\tfrac{(-\sigma)}{\varepsilon_0}\hat{\mathbf x}$ ✓.
          - Prob. 2.11, spherical shell ($\hat{\mathbf n}=\hat{\mathbf r}$): $\vb E_{\text{out}}(R)=\tfrac{\sigma R^2}{\varepsilon_0R^2}\hat{\mathbf r}=\tfrac{\sigma}{\varepsilon_0}\hat{\mathbf r}$, $\vb E_{\text{in}}=0$. Difference $\tfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$ ✓.

          **(b)** Gaussian cylinder, radius $s$, length $L$, coaxial. Only the curved side has flux: $E\cdot2\pi sL=Q_{\text{enc}}/\varepsilon_0$.
          - $s<R$: $Q_{\text{enc}}=0$, so $\vb E=0$.
          - $s>R$: $Q_{\text{enc}}=\sigma\,2\pi RL$, so $\vb E=\dfrac{\sigma R}{\varepsilon_0s}\hat{\mathbf s}$.

          At $s=R$ ($\hat{\mathbf n}=\hat{\mathbf s}$): $\vb E_{\text{out}}-\vb E_{\text{in}}=\dfrac{\sigma}{\varepsilon_0}\hat{\mathbf s}$ ✓. The tangential components (zero on both sides) are continuous ✓.

          [[fig:tube]]

          **(c)** Ex. 2.8: $V_{\text{out}}=\dfrac{q}{4\pi\varepsilon_0r}$, $V_{\text{in}}=\dfrac{q}{4\pi\varepsilon_0R}$. At $r=R$ both equal $\dfrac{q}{4\pi\varepsilon_0R}$: continuous (2.34) ✓. Slopes: $\partial_rV_{\text{out}}=-\dfrac{q}{4\pi\varepsilon_0R^2}$, $\partial_rV_{\text{in}}=0$, so the jump is $-\dfrac{q}{4\pi\varepsilon_0R^2}=-\dfrac{\sigma}{\varepsilon_0}$ with $\sigma=\dfrac{q}{4\pi R^2}$ (2.36) ✓.

          **What to remember:** the jump is always $\sigma/\varepsilon_0$ in the normal component (or $-\sigma/\varepsilon_0$ in $\partial V/\partial n$), whatever the geometry. These checks are how you catch a wrong $E$ or $V$ on an exam.
        `,
        figs: { tube: { svg: PF.plot({ w: 300, h: 180, x: [0, 3], y: [0, 1.25], xl: 's', yl: 'E', xt: [[1, 'R']], yt: [[1, md`\tfrac{\sigma}{\varepsilon_0}`]], curves: [{ f: () => 0, to: 0.999 }, { f: (s) => 1 / s, from: 1.001 }], vlines: [[1, '']] }), cap: 'The tube: zero inside, $\\tfrac{\\sigma R}{\\varepsilon_0s}$ outside; a jump of $\\sigma/\\varepsilon_0$ at $s=R$.' } },
      }),

      RF(md`
        !!key Patterns to remember
          - Across a charged surface: $V$ continuous; $\dfrac{\partial V_{\text{above}}}{\partial n}-\dfrac{\partial V_{\text{below}}}{\partial n}=-\dfrac{\sigma}{\varepsilon_0}$. Those two are all you impose; $E^\parallel$ continuity comes free.
          - At a conductor: $\sigma=-\varepsilon_0\,\partial V/\partial n$ with $\hat{\mathbf n}$ **out of the metal, into the field region**. Cavity walls and right-hand plates get the sign flipped relative to $\partial/\partial r$ or $\partial/\partial x$.
          - A kink in $V$ (a cusp) is surface charge; a peak means positive charge.
          - A charge pattern of wavenumber $k$ has a field that decays like $e^{-k|y|}$.
          - On a sphere, match each $\ell$ separately: continuity gives $B_\ell=A_\ell R^{2\ell+1}$, the jump gives $A_\ell$.
      `),
    ],
  });

  // =====================================================================================
  // Lesson 4. Boundary conditions in the method of images
  // =====================================================================================
  // two grounded half-planes meeting at an angle deg, charge on the bisector
  function figWedge(deg) {
    const f = fig();
    const ox = 50, oy = 190, L = 230;
    f.plane(ox, ox + L, oy, {});
    const e = pol(ox, oy, L, deg), n = pol(0, 0, 10, deg + 90);
    f.hatchBand([[ox, oy], [e[0], e[1]], [e[0] + n[0], e[1] + n[1]], [ox + n[0], oy + n[1]]]);
    f.line(ox, oy, e[0], e[1], { cls: 'thick' });
    const q = pol(ox, oy, 120, deg / 2); f.charge(q[0], q[1], { q: '+', lab: 'q', at: 'r' });
    f.angle(ox, oy, 44, 0, deg, ''); const al = pol(ox, oy, 70, deg / 2); f.label(al[0], al[1], md`${deg}^\circ`, 'c', 'small');
    f.label(ox + L - 4, oy + 14, 'V=0', 'tr', 'small');
    const w = pol(ox, oy, L - 30, deg); f.label(w[0] + 18, w[1], 'V=0', 'l', 'small');
    return f.svg();
  }

  LESSONS.push({
    id: 'ub-images', title: 'Boundary conditions in the method of images',
    steps: [
      RF(md`
        The method of images (Lectures 9–11) is a boundary-condition trick. You never solve a differential equation. You place fictitious charges **outside the region** so that every BC comes out right, then let uniqueness certify the result.

        !!method The image recipe, BC by BC
          1. Name the region where you want $V$. It contains the real charges.
          2. List its BCs: the conductor surfaces and infinity (BC #1, #2, ...).
          3. Put images **outside** the region (behind the plane, inside the sphere) and tune them until every BC holds.
          4. Check: the charge inside the region is unchanged (same Poisson equation) and every BC holds. Uniqueness: done.
          5. Only then read off $\sigma=-\varepsilon_0\,\partial V/\partial n$, forces and total induced charge.

        **Plane** (Lectures 9–10). Region $z>0$, real charge $q$ at $(0,0,d)$.
        1. $V(x,y,0)=0$
        2. $V\to0$ as $r\to\infty$

        Image $-q$ at $(0,0,-d)$. Check BC #1: at $z=0$ both distances are $\sqrt{x^2+y^2+d^2}$, so the two terms cancel. BC #2: both terms fall like $1/r$. The region $z>0$ still contains only $q$.

        [[fig:pl]]

        Lecture 10's starred warning: images must be outside the region where you calculate $V$, "otherwise, you change $\rho$". The formula holds only for $z\ge0$; below the plane, inside the metal, $V=0$ and $\vb E=0$.
      `, { pl: { svg: PF.row([{ svg: figPlaneQ({ lab: 'V=0' }), cap: 'The problem' }, { svg: figPlaneQ({ img: true, lab: 'z=0' }), cap: 'The image system (no metal)' }]).svg, cap: 'Same $\\rho$ in $z>0$, same BCs, so the same $V$ in $z>0$.' } }),

      Q(md`For the charge above the grounded plane, where may the image charge go, and why?`,
        [md`Anywhere, as long as $V=0$ on the plane`, md`Below the plane, outside the region $z>0$ where $V$ is wanted`, md`On the plane itself, where the induced charge is`, md`Above the charge, at $z=2d$`], 1,
        [md`An image in $z>0$ changes the charge density in the region, so you would be solving a different Poisson equation.`, null,
          md`A charge on the boundary changes the BC surface itself; and a single point charge can't mimic a spread-out $\sigma$ there.`,
          md`That's inside the region of interest.`],
        md`Lecture 10: images must be outside the region of interest. In $z<0$ it changes nothing in $z>0$ except through its potential, which is exactly what fixes BC #1.`,
        { figHtml: figPlaneQ({ lab: 'V=0' }) }),

      Q(md`Checking BC #1 for the plane: at a point $(x,y,0)$, how do the distances to $q$ at $(0,0,d)$ and to $-q$ at $(0,0,-d)$ compare?`,
        [md`They differ by $2d$`, md`They are equal only at the origin`, md`The distance to the image is always larger`, md`They are equal, both $\sqrt{x^2+y^2+d^2}$, so $\dfrac{q}{\srm_+}-\dfrac{q}{\srm_-}=0$`], 3,
        [md`They differ by $2d$ only along the $z$-axis **off** the plane. On the plane they're equal.`, md`Every point of the plane is equidistant from the two mirror points.`, md`Only for points with $z>0$.`, null],
        md`The plane $z=0$ is the perpendicular bisector of the segment joining $q$ and its image. Every point on it is equidistant from both, so the potentials cancel. That is what "mirror image" buys you.`,
        { figHtml: figPlaneQ({ img: true, lab: 'z=0' }) }),

      Q(md`A student uses a **positive** image, $+q$ at $(0,0,-d)$. Which BC fails, and what problem does this system actually solve?`,
        [md`BC #2 fails; it solves a grounded sphere`,
          md`Nothing fails; the sign of the image doesn't matter`,
          md`BC #1 fails ($V=2\tfrac{q}{4\pi\varepsilon_0}\srm\neq0$ on the plane); it solves the problem with a mirror plane, $\partial V/\partial z=0$ at $z=0$`,
          md`BC #1 fails; it solves a plane held at $V_0$`], 2,
        [md`Both terms still vanish at infinity. The plane is where it fails.`, md`On the plane the two terms add instead of cancel.`, null,
          md`$V$ on the plane would be $2\tfrac{q}{4\pi\varepsilon_0}\sqrt{x^2+y^2+d^2}$, which varies along the plane; a conductor needs a constant.`],
        md`Same-sign mirror charges give $V$ even in $z$, so $\partial V/\partial z=0$ on the plane: the Neumann condition of a symmetry plane, not the Dirichlet condition of a grounded conductor. The grounded plane needs the odd combination.`,
        { figHtml: figPlaneQ({ img: true, qi: '+q', lab: 'z=0' }) }),

      Q(md`Why is the two-charge potential the right answer for $z>0$, even though the real system has no charge at $(0,0,-d)$?`,
        [md`Because the induced charge really collects at the point $(0,0,-d)$`,
          md`Because the field below the plane is the same in both systems`,
          md`Because in $z>0$ it satisfies Poisson's equation with only $q$, and it meets BC #1 and #2; by uniqueness it is the solution there`,
          md`Because the two systems have the same energy`], 2,
        [md`The induced charge is spread over the surface, $\sigma=-qd/2\pi(x^2+y^2+d^2)^{3/2}$. The image is fictitious.`,
          md`Below the plane the real field is zero (metal), while the image system has a field there. The systems agree only in $z\ge0$.`, null,
          md`They don't: the real system has half the energy of the two-charge system ($-q^2/16\pi\varepsilon_0d$ versus $-q^2/8\pi\varepsilon_0d$).`],
        md`Lecture 10: "This function solves Poisson's equation since the charge density for $z>0$ is the same as in the original problem. It also fits the boundary conditions. By the uniqueness theorem, this solution is the correct one." Nothing about $z<0$ is claimed.`,
        { figHtml: figPlaneQ({ lab: 'V=0' }) }),

      RF(md`
        **Grounded sphere** (Lectures 10–11). Region $r>R$, charge $q$ at distance $a>R$ from the center.
        1. $V(R,\theta)=0$ for every $\theta$
        2. $V\to0$ as $r\to\infty$

        Image $q'=-\dfrac{R}{a}q$ at $b=\dfrac{R^2}{a}$, inside the sphere. BC #1 "for all $\theta$" is two equations (match the constant parts and the $\cos\theta$ parts of $q^2(R^2+b^2-2Rb\cos\theta)=q'^2(R^2+a^2-2Ra\cos\theta)$), which is why one charge with two free numbers can do it. Geometric check: on the sphere $\srm'/\srm=R/a$ at every point, so $q/\srm+q'/\srm'=0$.

        [[fig:sp]]

        **Corner** (two grounded half-planes at $90^\circ$). Region $x>0$, $y>0$:
        1. $V(0,y)=0$ for $y>0$
        2. $V(x,0)=0$ for $x>0$
        3. $V\to0$

        Images: $-q$ at $(-a,b)$, $-q$ at $(a,-b)$, $+q$ at $(-a,-b)$. Every point of either half-plane is equidistant from a $+q$ and a $-q$. Remove the $+q$ and both BCs fail: each $-q$ fixes one plane and spoils the other, and the $+q$ repairs both.

        [[fig:co]]
      `, {
        sp: { svg: figSphereQ({ img: true }), cap: 'The grounded sphere replaced by its image $q\'=-Rq/a$ at $b=R^2/a$ (dashed: no metal in the image problem).' },
        co: { svg: figCorner({ img: true }), cap: 'Three images make both half-planes equipotentials at $V=0$.' },
      }),

      Q(md`For the grounded sphere, BC #1 must hold for **every** $\theta$. Why does that fix both $q'$ and $b$?`,
        [md`$V(R,\theta)=0$ for all $\theta$ splits into two equations, one for the constant part and one for the $\cos\theta$ part: two equations for two unknowns`,
          md`It fixes only $q'$; $b$ comes from $V\to0$`,
          md`It fixes only $b$; $q'$ comes from the total charge`,
          md`You need a third condition, the force on $q$`], 0,
        [null, md`$V\to0$ holds for any $b$ and $q'$. All the information is in BC #1.`, md`The total induced charge isn't given for a grounded sphere; it's an output ($q'$).`, md`The force is a consequence, not a condition.`],
        md`Lecture 11: squaring and cross-multiplying, $q^2(R^2+b^2)-2q^2Rb\cos\theta=q'^2(R^2+a^2)-2q'^2Ra\cos\theta$ for all $\theta$, so $q^2(R^2+b^2)=q'^2(R^2+a^2)$ and $q^2b=q'^2a$. Solving: $b=R^2/a$, $q'=-Rq/a$ (opposite sign so the terms cancel instead of add).`,
        { figHtml: figSphereQ({ cond: 'V=0', wire: 'ground' }) }),

      Q(md`On the grounded sphere, what is the ratio $\srm'/\srm$ of a surface point's distance to the image $q'$ and to the real charge $q$?`,
        [md`$1$, like the plane`, md`$a/R$`, md`It depends on $\theta$`, md`$R/a$, the same at every point of the sphere`], 3,
        [md`For the plane the ratio is $1$ and the image is $-q$. Here the image is smaller, so the ratio must be smaller too.`, md`Inverted: the image is closer to every surface point than $q$ is.`, md`If it varied, $V$ would vary over the sphere and BC #1 would fail.`, null],
        md`$V=0$ needs $q/\srm=-q'/\srm'=(R/a)q/\srm'$, so $\srm'/\srm=R/a$ everywhere on the sphere. (The sphere is an Apollonius sphere for the two points: the locus of fixed distance ratio, as Griffiths' footnote mentions.) Check at the nearest point: $\srm=a-R$, $\srm'=R-R^2/a=\tfrac{R}{a}(a-R)$.`,
        { figHtml: figSphereQ({ img: true }) }),

      Q(md`The equations for the sphere's image also have the root $b=a$, $q'=-q$. Why is it rejected?`,
        [md`It gives the wrong total induced charge`,
          md`It puts the image on top of the real charge, inside the region: it changes $\rho$ there (it simply cancels $q$)`,
          md`It violates $V\to0$`,
          md`It makes $V$ discontinuous at the sphere`], 1,
        [md`It's rejected before any charge is computed: it isn't allowed at all.`, null, md`$V\equiv0$ satisfies $V\to0$ trivially.`, md`It gives $V\equiv0$, which is continuous.`],
        md`Lecture 11: $(a-b)(R^2-ab)=0$ has two roots. $b=a$ is in the region $r>R$, so it changes the source there; the total potential would be zero everywhere, the solution of a problem with no charge at all. Images belong outside the region of interest.`,
        { figHtml: figSphereQ({ cond: 'V=0', wire: 'ground' }) }),

      Q(md`For the $90^\circ$ corner, a student keeps the two $-q$ images but drops the $+q$ at $(-a,-b)$. What happens?`,
        [md`Nothing: $+q$ is too far away to matter`, md`Only $V\to0$ fails`, md`It works if $a=b$`, md`Neither plane is at $V=0$ any more`], 3,
        [md`Distance is not the issue. Without it, every point of the planes sees an unpaired $-q$.`, md`All terms still vanish at infinity. The planes are where it fails.`, md`Symmetry doesn't save it: on the floor $y=0$, the charge $-q$ at $(-a,b)$ has no partner.`, null],
        md`Pair the charges across each plane. Across $x=0$: $q$ with $-q$ at $(-a,b)$, and $-q$ at $(a,-b)$ with $+q$ at $(-a,-b)$. Across $y=0$: $q$ with $-q$ at $(a,-b)$, and $-q$ at $(-a,b)$ with $+q$ at $(-a,-b)$. Every charge needs its opposite mirror partner across **each** plane; drop $+q$ and two pairs break.`,
        { figHtml: figCorner({ img: true }) }),

      Q(md`For which wedge angles does the method of images work with a finite number of images?`,
        [md`Any angle`, md`Only $90^\circ$`, md`$180^\circ/n$ ($90^\circ$, $60^\circ$, $45^\circ$, ...); the $60^\circ$ wedge needs $5$ images`, md`Any angle that divides $360^\circ$, such as $120^\circ$`], 2,
        [md`For most angles the reflected images land back inside the region, which is forbidden.`, md`$90^\circ$ is the simplest, not the only one.`, null, md`$120^\circ$ fails: reflecting $q$ across one plane and then the other puts an image inside the wedge.`],
        md`Repeated reflections in two mirrors at angle $\alpha$ generate $2\pi/\alpha$ copies on a circle. They close up without entering the region only if $\alpha=\pi/n$, giving $2n-1$ images ($n=2$: three images; $n=3$: five). This is the last part of Griffiths 3.11.`,
        { figHtml: figWedge(60) }),

      RF(md`
        ### Conductors that are not grounded

        The grounded sphere's images already make the sphere an equipotential at $V=0$, carrying total charge $q'$. To change its potential or its charge **without** spoiling the equipotential, add a point charge at the **center**: it adds the same $q_c/4\pi\varepsilon_0R$ at every point of the sphere.

        | Sphere | BCs | Images |
        |---|---|---|
        | grounded | $V(R)=0$, $V\to0$ | $q'=-\tfrac{R}{a}q$ at $b=R^2/a$ |
        | held at $V_0$ | $V(R)=V_0$, $V\to0$ | $q'$ at $b$, plus $4\pi\varepsilon_0RV_0$ at the center |
        | neutral, isolated | $V(R)=V_c$, total charge $0$, $V\to0$ | $q'$ at $b$, plus $-q'=+\tfrac{R}{a}q$ at the center |
        | total charge $Q$ | $V(R)=V_c$, total charge $Q$, $V\to0$ | $q'$ at $b$, plus $Q-q'$ at the center |

        For the neutral sphere, $V_c=\dfrac{1}{4\pi\varepsilon_0}\dfrac{Rq/a}{R}=\dfrac{q}{4\pi\varepsilon_0a}$: exactly the potential $q$ alone would produce at the center.

        **Total induced charge** on a grounded sphere with $q$ outside is $q'=-Rq/a$, not $-q$. Outside the sphere the real field and the image field agree, so the flux from the sphere's charge equals the image's flux. (For the infinite plane the image is $-q$ and so is the induced charge: Lecture 10's check $\int\sigma\,da=-q$.)

        !!trap What a wrong image violates
          - Same-sign image for a grounded plane: $V\neq0$ on the plane (BC #1).
          - $q'=-q$ at $R^2/a$: $V\neq0$ on the sphere (BC #1).
          - An image inside the region (the root $b=a$): changes $\rho$ there.
          - Grounded images for a neutral sphere: wrong total charge.
          - An extra charge anywhere but the center: the sphere is no longer an equipotential.
      `),

      Q(md`To turn the grounded-sphere solution into the neutral-sphere solution you add a charge $-q'$. Why must it go at the **center**?`,
        [md`A charge at the center adds the same potential at every point of the sphere, so the sphere stays an equipotential`,
          md`Because the induced charge collects at the center`,
          md`Anywhere inside the sphere would do`,
          md`Because $V\to0$ requires it`], 0,
        [null, md`Charge on a conductor lives on its surface. The center charge is another fictitious image.`, md`Off-center, it's closer to some surface points than others, so $V$ would vary over the sphere.`, md`Any finite charge satisfies $V\to0$; that's not what fixes the position.`],
        md`The grounded solution already has $V=0$ on the sphere. Adding $q_c$ at the center adds $q_c/4\pi\varepsilon_0R$, the same everywhere on the surface: still an equipotential, now at a new value, and the total charge changes by $q_c$. Choose $q_c=-q'$ to make it neutral.`,
        { figHtml: figSphereQ({ cond: md`Q=0` }) }),

      Q(md`A battery holds the sphere at $V_0$ while $q$ sits outside. What must you add to the grounded image system?`,
        [md`$-q'$ at the center`, md`A charge $V_0R$ at the center`, md`A second image at $b$`, md`$4\pi\varepsilon_0RV_0$ at the center`], 3,
        [md`That makes the sphere neutral, not $V_0$.`, md`Units: charge needs the $4\pi\varepsilon_0$; $V_0R$ is not a charge.`, md`A second charge at $b$ just changes $q'$ and spoils $V=0$ there; the potential shift has to be uniform on the sphere.`, null],
        md`A center charge $q_c$ shifts the sphere's potential by $q_c/4\pi\varepsilon_0R$. Set this equal to $V_0$: $q_c=4\pi\varepsilon_0RV_0$. Total charge on the sphere: $4\pi\varepsilon_0RV_0-Rq/a$, supplied by the battery.`,
        { figHtml: figSphereQ({ wire: 'battery', bat: 'V_0' }) }),

      Q(md`An isolated neutral metal sphere sits a distance $a$ from a charge $q$. What is the potential of the sphere?`,
        [md`$0$`, md`$-\dfrac{q}{4\pi\varepsilon_0a}\dfrac{R}{a}$`, md`$\dfrac{q}{4\pi\varepsilon_0a}$`, md`$\dfrac{q}{4\pi\varepsilon_0(a-R)}$`], 2,
        [md`That's the grounded sphere. Isolated and neutral, it floats to a positive potential (for $q>0$).`, md`That's the potential the image $q'$ would make at its own distance, not the sphere's potential.`, null, md`That's $q$'s potential at the nearest point of the sphere. The sphere's potential is an average, not the extreme.`],
        md`The center image $+Rq/a$ gives $\dfrac{Rq/a}{4\pi\varepsilon_0R}=\dfrac{q}{4\pi\varepsilon_0a}$ on the sphere (the grounded pair contributes $0$). Mean-value property check: the potential of $q$ averaged over the sphere equals its value at the center, $\tfrac{q}{4\pi\varepsilon_0a}$, and the induced charge (total zero, a dipole-like layer) averages to zero.`,
        { figHtml: figSphereQ({ cond: md`Q=0` }) }),

      Q(md`A charge $q$ sits a distance $a$ from the center of a grounded sphere. What is the total charge induced on the sphere?`,
        [md`$-q$, as for a grounded plane`, md`$-Rq/a$, the image charge`, md`$0$, because the sphere is grounded`, md`$-aq/R$`], 1,
        [md`The sphere doesn't capture all of $q$'s field lines; some go to infinity. The plane is the limit $R\to\infty$.`, null, md`Grounding fixes $V=0$; the ground wire supplies whatever charge that takes.`, md`That's bigger than $q$ in magnitude, which a grounded sphere outside the charge never gets.`],
        md`Outside the sphere the real field equals the image system's field, so a Gaussian surface hugging the sphere has the same flux as a surface around $q'$ alone: $Q_{\text{ind}}=q'=-Rq/a$. HW 4 Prob. 3.8 asks you to confirm it by integrating $\sigma(\theta)$.`,
        { figHtml: figSphereQ({ wire: 'ground' }) }),

      RF(md`
        ### Worked example: charge near a neutral sphere (Griffiths 3.9)

        A neutral, isolated metal sphere of radius $R$; a charge $q$ at distance $a$ from its center. Find $V$ outside and the force on $q$.

        **Region:** $r>R$, containing $q$. **BCs:**
        1. $V(R,\theta)=V_c$, a constant (unknown)
        2. $\oint\sigma\,da=0$ (neutral)
        3. $V\to0$ as $r\to\infty$

        **Images:** $q'=-\dfrac{R}{a}q$ at $b=\dfrac{R^2}{a}$ (makes the sphere an equipotential at $0$), plus $q''=+\dfrac{R}{a}q$ at the center (keeps it an equipotential, now at $V_c=\tfrac{q}{4\pi\varepsilon_0a}$, and makes the total charge $q'+q''=0$). Both images are inside the sphere, outside the region. BC #3 holds term by term. Uniqueness (second theorem: total charge given) says this is it.

        [[fig:neu]]

        **Force on $q$:** from the two images,
        $$F=\frac{q}{4\pi\varepsilon_0}\left[\frac{q'}{(a-b)^2}+\frac{q''}{a^2}\right]=-\frac{q^2}{4\pi\varepsilon_0}\,\frac{R^3\left(2a^2-R^2\right)}{a^3\left(a^2-R^2\right)^2}.$$
        Negative: attraction, even though the sphere is neutral. The induced negative charge sits closer to $q$ than the positive.

        **Checks.** Far away ($a\gg R$): $F\approx-\dfrac{2q^2R^3}{4\pi\varepsilon_0a^5}$, the force between a charge and the dipole it induces ($p\propto R^3/a^2$, force $\propto p/a^3$). Close ($a\to R$): the first term blows up, like a charge near a plane.
      `, { neu: { svg: figSphereQ({ img: true, ctr: "q''" }), cap: 'Neutral sphere: $q\'$ at $R^2/a$ and $q\'\'=-q\'$ at the center.' } }),

      P({
        id: 'ub-sphQ', title: 'A charged sphere near a point charge',
        q: md`An isolated metal sphere of radius $R$ carries total charge $Q$. A point charge $q$ is at distance $a>R$ from its center.

          (a) What charge must sit at the center of the image system?
          (b) What is the potential of the sphere?
          (c) $Q$ and $q$ are both positive. Is the force on $q$ always repulsive?`,
        figHtml: figSphereQ({ cond: 'Q' }),
        hints: [
          md`BCs: $V(R,\theta)=V_c$ (unknown constant), total charge $Q$, $V\to0$. Start from the grounded images and fix the total charge with a center image.`,
          md`Total image charge inside the sphere must be $Q$: $q'+q_c=Q$ with $q'=-Rq/a$.`,
          md`(c) Look at the force as $a\to R$: which image term dominates?`,
        ],
        parts: [
          { lbl: md`q_c`, expr: 'Q + R*q/a', vars: { Q: [1, 3], R: [1, 2], q: [1, 3], a: [2.5, 4] } },
          { lbl: md`V_{\text{sphere}}`, expr: '(Q/R + q/a)/(4*pi*eps0)', vars: { Q: [1, 3], R: [1, 2], q: [1, 3], a: [2.5, 4], eps0: [0.5, 2] }, accepts: ['(Q + R*q/a)/(4*pi*eps0*R)'] },
          { lbl: md`(c) Always repulsive?`, mc: [md`Yes: like charges repel`, md`No: close enough to the sphere, the attraction to the image $q'$ wins`, md`No: it is always attractive`, md`Yes, unless $Q=0$`], a: 1,
            why: [md`The induced charge near $q$ is negative; its pull grows like $1/(a-R)^2$ as $q$ approaches.`, null, md`Far away the sphere looks like a point charge $Q$, which repels $q$.`, md`Even with $Q>0$ the image term wins close in, and with $Q=0$ it's attractive at every distance.`] },
        ],
        sol: md`
          **Region:** $r>R$. **BCs:**
          1. $V(R,\theta)=V_c$ (unknown constant)
          2. total charge on the sphere $=Q$
          3. $V\to0$

          **(a)** Grounded images: $q'=-Rq/a$ at $R^2/a$ give $V=0$ on the sphere and total charge $q'$. A center charge $q_c$ keeps the equipotential and adds charge $q_c$. BC #2: $q'+q_c=Q$, so
          $$q_c=Q+\frac{R}{a}q.$$

          **(b)** On the sphere the pair contributes $0$ and the center charge $\dfrac{q_c}{4\pi\varepsilon_0R}$:
          $$V_{\text{sphere}}=\frac{1}{4\pi\varepsilon_0}\left(\frac{Q}{R}+\frac{q}{a}\right).$$
          Each source contributes what it would at the center: $Q$ (spread on the sphere) gives $\tfrac{Q}{4\pi\varepsilon_0R}$, and $q$ gives $\tfrac{q}{4\pi\varepsilon_0a}$.

          [[fig:img]]

          **(c)** $F=\dfrac{q}{4\pi\varepsilon_0}\left[\dfrac{q_c}{a^2}-\dfrac{Rq/a}{(a-R^2/a)^2}\right]$. As $a\to R$ the second term blows up like $1/(a-R)^2$ while the first stays finite, so the force becomes attractive. Far away the first term wins and it's repulsive. So no.

          **What to remember:** charge on a conductor (given $Q$, or neutral) and potential of a conductor (given $V_0$, or grounded) are different BCs; both are handled by the same grounded pair plus one center charge.
        `,
        figs: { img: { svg: figSphereQ({ img: true, ctr: 'q_c' }), cap: 'Image system: $q\'$ at $R^2/a$ and $q_c=Q+Rq/a$ at the center.' } },
      }),

      RF(md`
        ### A charge inside a grounded shell

        Now the region is $r<R$, with $q$ at distance $a<R$ from the center. **BCs:**
        1. $V(R,\theta)=0$

        That's all: the region is bounded, so there is no condition at infinity. The same construction works: $q'=-\dfrac{R}{a}q$ at $b=\dfrac{R^2}{a}$. Now $b>R$, so the image is **outside** the region, as it must be, and $|q'|>q$.

        [[fig:in]]

        **Total induced charge** on the inner wall: Gauss's law on a surface inside the metal (where $\vb E=0$) gives $-q$, **not** $q'$. The image system reproduces the field only inside the cavity; the wall's charge is fixed by the flux through it, which is $q/\varepsilon_0$. (The surface charge, with $\hat{\mathbf n}=-\hat{\mathbf r}$: $\sigma=-\dfrac{q}{4\pi R}\dfrac{R^2-a^2}{(R^2+a^2-2aR\cos\theta)^{3/2}}$, which integrates to $-q$.)
      `, { in: { svg: PF.row([{ svg: figInside({}), cap: 'The problem' }, { svg: figInside({ img: true, il: md`q'` }), cap: 'Image outside the region' }]).svg, cap: 'Inside a grounded shell the image sits outside, at $R^2/a$.' } }),

      Q(md`For a charge $q$ inside a grounded shell (radius $R$, charge at $a<R$), where is the image and how big is it?`,
        [md`$-q$ at the mirror point $2R-a$`, md`$-\dfrac{a}{R}q$ at $\dfrac{a^2}{R}$`, md`$-\dfrac{R}{a}q$ at $\dfrac{R^2}{a}$, inside the shell`, md`$-\dfrac{R}{a}q$ at $\dfrac{R^2}{a}$, outside the shell, larger than $q$`], 3,
        [md`A sphere is not a plane. The mirror point fails BC #1 everywhere except the nearest point.`, md`That would put the image inside the region $r<R$.`, md`With $a<R$, $R^2/a>R$: it's outside. Inside the region it would change $\rho$.`, null],
        md`Kelvin's construction is symmetric in $a$ and $b=R^2/a$: if $q$ is inside, its image is outside, and vice versa. $V(R)=0$ still needs $\srm'/\srm=-q'/q=R/a$ on the sphere, now with $R/a>1$, so $|q'|>q$.`,
        { figHtml: figInside({}) }),

      Q(md`For the charge inside the grounded shell, what total charge is induced on the inner wall?`,
        [md`$-q$`, md`$-\dfrac{R}{a}q$, the image charge`, md`$0$`, md`$-\dfrac{a}{R}q$`], 0,
        [null, md`The image reproduces the field only inside the cavity. Its size isn't the wall's charge here.`, md`The field of $q$ ends on the wall; it can't be zero.`, md`No: Gauss's law fixes the total, whatever $a$ is.`],
        md`Gaussian surface inside the metal: $\vb E=0$, so $Q_{\text{enc}}=q+Q_{\text{wall}}=0$ and $Q_{\text{wall}}=-q$, independent of where $q$ is. Outside problem: the induced charge **does** equal the image, $-Rq/a$. The difference: only the outside problem's region surrounds the sphere so that a Gaussian surface in it encloses only the sphere's charge.`,
        { figHtml: figInside({}) }),

      Q(md`Which way is the force on the charge inside the grounded shell?`,
        [md`Toward the center`, md`Zero: the shell is symmetric`, md`Toward the nearest part of the wall`, md`It depends on the sign of $q$`], 2,
        [md`The image is outside, beyond the near wall, and attracts $q$ toward it.`, md`Only at the exact center, where $a=0$, is it zero.`, null, md`The image always has the opposite sign, so the force is always toward the near wall.`],
        md`$F=\dfrac{q}{4\pi\varepsilon_0}\dfrac{Rq/a}{(R^2/a-a)^2}=\dfrac{q^2}{4\pi\varepsilon_0}\dfrac{Ra}{(R^2-a^2)^2}$, pointing outward along the line from the center through $q$. The charge is pulled to the wall, and harder the closer it gets.`,
        { figHtml: figInside({}) }),

      P({
        id: 'ub-inside', title: 'A charge inside a grounded shell',
        q: md`A point charge $q$ sits at distance $a$ from the center of a grounded conducting spherical shell of inner radius $R$ ($a<R$).

          (a) Find the image charge.
          (b) Find the image's distance from the center.
          (c) Find the surface charge density on the inner wall at the point nearest to $q$.
          (d) What is the total induced charge on the inner wall?`,
        figHtml: figInside({}),
        hints: [
          md`Region $r<R$, one BC: $V(R,\theta)=0$. The image goes outside the region.`,
          md`Use the same algebra as Lecture 11: $q'=-Rq/a$, $b=R^2/a$ still solve it (now $b>R$).`,
          md`$\sigma=-\varepsilon_0\,\partial V/\partial n$ with $\hat{\mathbf n}=-\hat{\mathbf r}$ (out of the metal into the cavity), so $\sigma=+\varepsilon_0\,\partial V/\partial r$ at $r=R$. At the nearest point all distances lie along one line.`,
        ],
        parts: [
          { lbl: md`q'`, expr: '-R*q/a', vars: { R: [2, 3], q: [1, 2], a: [0.5, 1.5] } },
          { lbl: md`b`, expr: 'R^2/a', vars: { R: [2, 3], a: [0.5, 1.5] } },
          { lbl: md`\sigma_{\text{near}}`, expr: '-q*(R+a)/(4*pi*R*(R-a)^2)', vars: { R: [2, 3], q: [1, 2], a: [0.5, 1.5] }, accepts: ['-q*(R^2-a^2)/(4*pi*R*(R-a)^3)'] },
          { lbl: md`(d) Total induced charge on the wall:`, mc: [md`$-Rq/a$`, md`$0$`, md`$-q$`, md`$-aq/R$`], a: 2,
            why: [md`That's the image. Here the image is outside the shell and bigger than $q$; it isn't the wall's charge.`, md`Grounded or not, the wall must end all of $q$'s field lines.`, null, md`Gauss's law gives a total independent of $a$.`] },
        ],
        sol: md`
          **Region:** $r<R$. **BC:** 1. $V(R,\theta)=0$. (No condition at infinity: the shell closes the region.)

          **(a), (b)** On the sphere we need $q/\srm+q'/\srm'=0$ for all $\theta$; Lecture 11's algebra gives the same roots, $b=R^2/a$ and $q'=-Rq/a$. With $a<R$, $b>R$: the image is outside the region, as required.

          [[fig:img]]

          **(c)** The potential inside is $V=\dfrac{1}{4\pi\varepsilon_0}\left[\dfrac{q}{\srm}-\dfrac{Rq/a}{\srm'}\right]$. On the axis, at $r$ between $a$ and $R$ in the direction of $q$: $\srm=r-a$, $\srm'=b-r$. With $\hat{\mathbf n}=-\hat{\mathbf r}$:
          $$\sigma=+\varepsilon_0\frac{\partial V}{\partial r}\Big|_{R}=\frac{q}{4\pi}\left[-\frac{1}{(R-a)^2}-\frac{R/a}{(b-R)^2}\right].$$
          Since $b-R=\dfrac{R(R-a)}{a}$, the second term is $\dfrac{R/a}{R^2(R-a)^2/a^2}=\dfrac{a}{R(R-a)^2}$, so
          $$\sigma_{\text{near}}=-\frac{q}{4\pi(R-a)^2}\left(1+\frac aR\right)=-\frac{q\,(R+a)}{4\pi R\,(R-a)^2}.$$
          Check $a\to0$ (charge at the center): $-\tfrac{q}{4\pi R^2}$, uniform, total $-q$ ✓.

          **(d)** $-q$ (Gauss's law with a surface inside the metal), not $q'$.

          **What to remember:** the image's charge equals the induced charge only when the region surrounds the conductor (charge outside a sphere, or a plane). Always get the total from Gauss's law.
        `,
        figs: { img: { svg: figInside({ img: true, il: md`q'` }), cap: 'BC #1 on the dashed sphere is met by $q$ and $q\'$ at $R^2/a$.' } },
      }),

      RF(md`
        !!key Patterns to remember
          - An image solution is a BC solution: list the BCs, place images outside the region, check each BC, invoke uniqueness.
          - Same-sign image: solves $\partial V/\partial n=0$ (mirror). Opposite-sign: solves $V=0$ (grounded).
          - Sphere: $q'=-Rq/a$ at $R^2/a$ works for $q$ outside **and** inside; the image always lands on the other side of the surface.
          - Not grounded: add a center charge. Held at $V_0$: $4\pi\varepsilon_0RV_0$. Neutral: $-q'$. Charge $Q$: $Q-q'$.
          - Total induced charge comes from Gauss's law: $-q$ for a plane, $q'=-Rq/a$ for a sphere with $q$ outside, $-q$ for the inner wall of a shell with $q$ inside.
          - Wedges: images work for angles $180^\circ/n$, with $2n-1$ images.
      `),
    ],
  });

  // =====================================================================================
  // Lesson 5. Boundary conditions in Cartesian separation of variables
  // =====================================================================================
  const SEPOPTS = [md`$e^{-kx}\sin ky$`, md`$\sinh(kx)\sin ky$`, md`$\cosh(kx)\sin ky$`, md`$\sin(kx)\sinh(ky)$`];
  const split3 = (a, b, c) => PF.row([
    { svg: figBox(Object.assign({ w: 100, h: 100, corners: false }, a.o)), cap: a.cap },
    { svg: figBox(Object.assign({ w: 100, h: 100, corners: false }, b.o)), cap: b.cap },
    { svg: figBox(Object.assign({ w: 100, h: 100, corners: false }, c.o)), cap: c.cap },
  ]).svg;

  LESSONS.push({
    id: 'ub-cart', title: 'Boundary conditions in Cartesian separation of variables',
    steps: [
      RF(md`
        After separating (Lecture 11), each direction gets either oscillating functions or exponentials:
        $$X(x)=Ae^{kx}+Be^{-kx}\ \ (\text{equivalently } \cosh kx,\ \sinh kx),\qquad Y(y)=C\sin ky+D\cos ky.$$
        Lecture 11's rule for the sign of the separation constant: oscillate ($-k^2$) in the direction with **two** zero faces; use exponentials ($+k^2$) in the direction that is open or contains the live face.

        Each **homogeneous** BC (a zero condition) throws away one function:

        | BC | kills | keeps |
        |---|---|---|
        | $V=0$ at $y=0$ | $\cos ky$ ($D=0$) | $\sin ky$ |
        | $V=0$ at $y=a$ only | | $\sin k(a-y)$ |
        | $\partial V/\partial y=0$ at $y=0$ (mirror plane) | $\sin ky$ | $\cos ky$ |
        | $V\to0$ as $x\to+\infty$ | $e^{kx}$ ($A=0$) | $e^{-kx}$ |
        | $V\to0$ as $x\to-\infty$ | $e^{-kx}$ | $e^{kx}$ |
        | $V=0$ at $x=0$, region $0<x<b$ | $\cosh kx$ | $\sinh kx$ |
        | $V=0$ at $x=b$, live face at $x=0$ | | $\sinh k(b-x)$ |
        | the same $V$ on $x=\pm b$ (even) | $\sinh kx$ | $\cosh kx$ |
        | opposite $V$ on $x=\pm b$ (odd) | $\cosh kx$ | $\sinh kx$ |

        [[fig:slot]]

        In the slot: BC #1 ($y=0$) gives $D=0$, BC #4 ($x\to\infty$) gives $A=0$, BC #2 ($y=a$) quantizes $k=n\pi/a$, and BC #3 (the end) fixes the $C_n$ by Fourier's trick (Lecture 12).
      `, { slot: { svg: figSlot({ top: md`\#2\ V=0`, bot: md`\#1\ V=0`, end: md`\#3\ V_0(y)`, far: md`\#4\ V\to0` }), cap: 'Lecture 11\'s slot with its four BCs written on the boundaries.' } }),

      Q(md`Grounded plates at $y=0$ and $y=a$, end strip at $x=0$ held at $V_0(y)$, region $x>0$. Which separated form fits the homogeneous BCs?`,
        SEPOPTS, 0,
        [null, md`$\sinh kx$ vanishes at $x=0$ (the live face) and blows up as $x\to\infty$. Both wrong.`, md`$\cosh kx$ blows up as $x\to\infty$.`, md`$\sin kx$ would need two zero faces in $x$, and $\sinh ky$ can't vanish at both $y=0$ and $y=a$.`],
        md`$y$ has two zero faces, so it oscillates: $\sin ky$ (vanishes at $y=0$; $k=n\pi/a$ makes it vanish at $y=a$). $x$ is open: $V\to0$ keeps $e^{-kx}$. This is Lecture 12's $V=\sum C_ne^{-n\pi x/a}\sin(n\pi y/a)$.`,
        { figHtml: figSlot({ top: 'V=0', bot: 'V=0', end: md`V_0(y)` }) }),

      Q(md`A pipe with grounded faces $y=0$, $y=a$ and $x=0$; the face $x=b$ is held at $V_0(y)$ (HW 5 Prob. 3.17). Which separated form?`,
        SEPOPTS, 1,
        [md`The region stops at $x=b$, and $e^{-kx}$ doesn't vanish at $x=0$, which is grounded.`, null, md`$\cosh kx$ equals $1$ at $x=0$, which is grounded.`, md`The two zero faces are in $y$, so $y$ oscillates, not $x$.`],
        md`$y$: two grounded faces, $\sin(n\pi y/a)$. $x$: $V=0$ at $x=0$ kills $\cosh$, leaving $\sinh(n\pi x/a)$. The live face fixes $C_n\sinh(n\pi b/a)=\tfrac2a\int_0^aV_0(y)\sin\tfrac{n\pi y}{a}dy$.`,
        { figHtml: figBox({ top: 'V=0', bot: 'V=0', left: 'V=0', right: md`V_0(y)` }) }),

      Q(md`Grounded plates at $y=0$, $y=a$; both strips $x=\pm b$ held at the same $V_0$ (Griffiths Ex. 3.4). Which separated form?`,
        SEPOPTS, 2,
        [md`The region is finite in $x$; nothing kills $e^{kx}$, and $e^{-kx}$ alone isn't symmetric.`, md`$\sinh kx$ is odd: it would give opposite potentials on the two strips.`, null, md`$x$ is the direction with the live faces; it can't oscillate here.`],
        md`The setup is even in $x$, so $V(-x,y)=V(x,y)$ forces $A=B$ in $Ae^{kx}+Be^{-kx}$: $\cosh kx$. With $\sin(n\pi y/a)$ from the plates: $V=\sum C_n\cosh(n\pi x/a)\sin(n\pi y/a)$ (Griffiths 3.41).`,
        { figHtml: figBox({ left: 'V_0', right: 'V_0', top: 'V=0', bot: 'V=0', c0: '(-b,0)', c1: '(b,a)' }) }),

      Q(md`A box $0<x<a$, $0<y<b$ with the top face $y=b$ held at $V_0(x)$ and the other three faces grounded. Which separated form?`,
        SEPOPTS, 3,
        [md`The two zero faces are now $x=0$ and $x=a$, so $x$ oscillates.`, md`$\sin ky$ can't fit a live top face; the roles of $x$ and $y$ have swapped.`, md`Same problem: the oscillating direction must be $x$.`, null],
        md`Rotate the pipe problem: zero faces at $x=0$ and $x=a$ give $\sin(n\pi x/a)$; the grounded bottom $y=0$ kills $\cosh$, leaving $\sinh(n\pi y/a)$; the top fixes the $C_n$. Always ask: which direction has two zero faces?`,
        { figHtml: figBox({ top: md`V_0(x)`, bot: 'V=0', left: 'V=0', right: 'V=0', c1: '(a,b)' }) }),

      Q(md`The slot now extends to the **left** (region $x<0$, end strip at $x=0$ held at $V_0(y)$, plates grounded). Which form?`,
        [md`$e^{-kx}\sin ky$`, md`$e^{kx}\sin ky$`, md`$\sinh(kx)\sin ky$`, md`$e^{kx}\cos ky$`], 1,
        [md`As $x\to-\infty$, $e^{-kx}\to\infty$.`, null, md`$\sinh kx$ is $0$ at the live face and blows up as $x\to-\infty$.`, md`$V=0$ at $y=0$ needs $\sin ky$.`],
        md`The condition at the open end decides which exponential survives: $V\to0$ as $x\to-\infty$ keeps $e^{+kx}$ ($k>0$). Same plates, same $k=n\pi/a$, same Fourier coefficients.`,
        { figHtml: figSlot({ dir: 'left', top: 'V=0', bot: 'V=0', end: md`V_0(y)` }) }),

      Q(md`A pipe $0<x<b$, $0<y<a$: the face $x=0$ is live, at $V_0(y)$; the faces $x=b$, $y=0$ and $y=a$ are grounded. Which $x$-dependence?`,
        [md`$\sinh(kx)$`, md`$\cosh(kx)$`, md`$\sinh\big(k(b-x)\big)$`, md`$e^{-kx}$`], 2,
        [md`That vanishes at $x=0$, the live face, instead of at $x=b$.`, md`Never zero; the face $x=b$ is grounded.`, null, md`Not zero at $x=b$. (It is right only if the pipe were infinitely long.)`],
        md`The grounded face is at $x=b$, so you want a combination that vanishes there: $\sinh k(b-x)$. As $b\to\infty$, $\sinh k(b-x)/\sinh kb\to e^{-kx}$: the slot.`,
        { figHtml: figBox({ left: md`V_0(y)`, right: 'V=0', top: 'V=0', bot: 'V=0' }) }),

      Q(md`Strips at $x=\pm b$ are held at **opposite** potentials, $+V_0$ at $x=b$ and $-V_0$ at $x=-b$; plates $y=0,a$ grounded. Which $x$-dependence?`,
        [md`$\cosh(kx)$`, md`$e^{-k|x|}$`, md`$\cos(kx)$`, md`$\sinh(kx)$`], 3,
        [md`Even in $x$; it would give the same sign on both strips.`, md`Not a solution with a smooth derivative at $x=0$, and it's even.`, md`$x$ has the live faces; it can't oscillate.`, null],
        md`The setup is odd under $x\to-x$, so $V(0,y)=0$: an antisymmetric mirror plane at $x=0$. That kills $\cosh$ and keeps $\sinh(n\pi x/a)$. Then one live face fixes $C_n\sinh(n\pi b/a)=\tfrac{4V_0}{n\pi}$ (odd $n$).`,
        { figHtml: figBox({ left: md`-V_0`, right: md`+V_0`, top: 'V=0', bot: 'V=0', c0: '(-b,0)', c1: '(b,a)' }) }),

      RF(md`
        ### Which BC quantizes $k$, which fixes $C_n$

        - The **second** zero condition in the oscillating direction quantizes $k$. In the slot, $\sin ka=0$ gives $k=n\pi/a$, where $a$ is the distance between the two zero faces **of that direction**, not the length in the other direction.
        - With one zero face and one mirror plane ($V=0$ at $y=0$, $\partial V/\partial y=0$ at $y=a$): $\cos ka=0$, so $k=(n-\tfrac12)\pi/a$.
        - The single **inhomogeneous** (live) face is matched by the whole sum. Fourier's trick (multiply by $\sin(m\pi y/a)$, integrate over $0<y<a$, use orthogonality with normalization $a/2$) gives
        $$C_n\,X_n(\text{live face})=\frac{2}{a}\int_0^aV_0(y)\sin\frac{n\pi y}{a}\,dy.$$

        **Homogeneous versus inhomogeneous.** A zero condition ($V=0$, $\partial V/\partial n=0$, $V\to0$) holds for every term separately and for any sum of them, so you impose it term by term first. A nonzero condition ($V=V_0(y)$) is met only by the sum, so it comes last. That's why the method needs **all faces but one** to be homogeneous, and why the oscillating direction is the one with two zero faces.
      `),

      Q(md`In the slot, which boundary condition quantizes $k$?`,
        [md`$V=0$ at $y=0$`, md`$V(0,y)=V_0(y)$`, md`$V\to0$ as $x\to\infty$`, md`$V=0$ at $y=a$, which needs $\sin ka=0$`], 3,
        [md`That one only removes $\cos ky$; any $k$ still works.`, md`The live face fixes the coefficients, after $k$ is already quantized.`, md`That removes $e^{kx}$ for any $k>0$.`, null],
        md`Lecture 12: after BC #1 ($D=0$) and BC #4 ($A=0$), BC #2 gives $\sin ka=0$, so $ka=n\pi$, $n=1,2,3,\dots$ ($n=0$ gives nothing; negative $n$ repeats). Two zero faces in one direction: that's what makes the allowed $k$ discrete.`,
        { figHtml: figSlot({ top: 'V=0', bot: 'V=0', end: md`V_0(y)` }) }),

      Q(md`A pipe $0<x<b$, $0<y<a$ with the face $x=b$ live and the other three grounded. What are the allowed $k$ in $\sinh(kx)\sin(ky)$?`,
        [md`$k=n\pi/a$`, md`$k=n\pi/b$`, md`$k=n\pi/(a+b)$`, md`Any $k$; the live face picks it`], 0,
        [null, md`$b$ is the length in the exponential direction. Quantization comes from the two zero faces at $y=0$ and $y=a$.`, md`The lengths don't mix; each direction has its own role.`, md`The live face only fixes the $C_n$.`],
        md`$\sin ky$ must vanish at $y=a$: $k=n\pi/a$. The length $b$ appears only in the factor $\sinh(n\pi b/a)$ that the Fourier coefficient is divided by. Quantizing with the wrong length is one of the most common errors on this topic.`,
        { figHtml: figBox({ top: 'V=0', bot: 'V=0', left: 'V=0', right: md`V_0(y)` }) }),

      Q(md`A slot of width $2a$ has both plates grounded and an end strip whose potential is symmetric about the midplane. You solve only the lower half, $0<y<a$, with $V=0$ at $y=0$ and $\partial V/\partial y=0$ at $y=a$. What are the allowed $k$?`,
        [md`$k=n\pi/a$`, md`$k=(n-\tfrac12)\pi/a$`, md`$k=\tfrac{n\pi}{2a}$ for all $n$`, md`$k=2n\pi/a$`], 1,
        [md`$\sin ka=0$ is for a zero **value** at $y=a$. Here the **slope** vanishes: $\cos ka=0$.`, null, md`Only the odd ones survive: $k=\tfrac{(2n-1)\pi}{2a}=(n-\tfrac12)\pi/a$. The even ones are antisymmetric about the midplane.`, md`Those would have zero slope nowhere special; and they skip the lowest mode.`],
        md`$Y=\sin ky$ (from $V=0$ at $y=0$), and $Y'(a)=k\cos ka=0$ gives $ka=(n-\tfrac12)\pi$. Check against the full slot of width $2a$: modes $\sin\tfrac{m\pi y}{2a}$, of which the symmetric ones are odd $m$, i.e. $k=\tfrac{(2n-1)\pi}{2a}$. Same set.`,
        { figHtml: figSlot({ top: md`\partial V/\partial y=0`, topMirror: true, bot: 'V=0', end: md`V_0(y)` }) }),

      Q(md`Which boundary condition determines the coefficients $C_n$?`,
        [md`The live face, through Fourier's trick`, md`$V\to0$ at infinity`, md`The grounded plates`, md`Orthogonality alone, without any BC`], 0,
        [null, md`It removes the growing exponentials; it says nothing about amplitudes.`, md`They pick the functions and the allowed $k$, but they're zero conditions: they can't set a size.`, md`Orthogonality is the tool; the data it extracts is the boundary function $V_0(y)$.`],
        md`Every homogeneous condition is already built into each term. The only nonzero information left is $V_0(y)$ on the live face, and orthogonality projects it onto each mode: $C_n=\tfrac2a\int_0^aV_0\sin(n\pi y/a)\,dy$ (divided by $X_n$ on that face if it isn't $1$).`,
        { figHtml: figSlot({ top: 'V=0', bot: 'V=0', end: md`V_0(y)` }) }),

      Q(md`Why are the zero conditions imposed on each term before summing, while the live face is imposed only on the sum?`,
        [md`It's just tradition; the order doesn't matter`,
          md`Because the live face is easier`,
          md`Because zero conditions hold term by term and survive any sum, while the live face can only be matched by the whole series`,
          md`Because the live face is a Neumann condition`], 2,
        [md`It matters: imposing $V=V_0$ on a single term would require $V_0(y)\propto\sin(n\pi y/a)$.`, md`It's the hardest one; that's why it's saved for Fourier's trick.`, null, md`It's a Dirichlet condition (a value), just a nonzero one.`],
        md`If $V_1$ and $V_2$ each vanish on a face, so does $V_1+V_2$. A nonzero value doesn't add that way: two terms each equal to $V_0$ on a face sum to $2V_0$. So homogeneous conditions are linear constraints you can apply to the building blocks; the inhomogeneous one is a single equation for the sum.`,
        { figHtml: figSlot({ top: 'V=0', bot: 'V=0', end: md`V_0(y)` }) }),

      WG.sep({ geo: 'pipe', bc: 'const', n: 5 }),

      RF(md`
        ### Several live faces: split, solve, add

        Separation needs all faces but one to be homogeneous. With two or more live faces, split $V=V_{(1)}+V_{(2)}+\cdots$, each piece with **one** live face and the others grounded. Each piece solves Laplace's equation; on every face the pieces add up to the given value, so the sum satisfies every BC, and uniqueness says it's the answer.

        [[fig:split]]

        **Symmetry shortcut for centers.** If all four faces of a square were at $V_0$, then $V=V_0$ everywhere. By symmetry each face contributes the same amount at the center, so one live face at $V_0$ gives $V_0/4$ at the center of a square ($V_0/6$ at the center of a cube, Discussion 4). Two adjacent live faces give $V_0/2$; three give $3V_0/4$.
      `, { split: { svg: split3({ o: { left: 'V_0', bot: 'V_0', top: '0', right: '0' }, cap: 'the problem' }, { o: { left: 'V_0', bot: '0', top: '0', right: '0' }, cap: 'piece 1' }, { o: { left: '0', bot: 'V_0', top: '0', right: '0' }, cap: 'piece 2' }), cap: '$V=V_{(1)}+V_{(2)}$: each piece has one live face.' } }),

      Q(md`A square pipe has the faces $x=0$ and $x=a$ both at $V_0$, and $y=0$, $y=a$ grounded. How do you set up the solution?`,
        [md`One series $\sum C_n\sin(n\pi x/a)\sinh(n\pi y/a)$`, md`Split into two one-live-face problems (each with the other face grounded) and add; or use $\cosh$ about the midline $x=a/2$`, md`$V=V_0$ everywhere, since two faces are at $V_0$`, md`It can't be done: separation needs one live face`], 1,
        [md`$x$ has the live faces; it can't be the oscillating direction.`, null, md`The other two faces are at $0$, so $V$ can't be constant.`, md`It can: split it, or exploit the symmetry. The one-live-face rule is per piece.`],
        md`Either route: $V=V_{x=0}+V_{x=a}$, each $\sum C_n\sinh(\cdot)\sin(n\pi y/a)$; or measure $x$ from the middle and use $\cosh(n\pi(x-a/2)/a)$, the even combination (Griffiths Ex. 3.4). The center value is $V_0/2$ by the symmetry shortcut.`,
        { figHtml: figBox({ w: 130, h: 130, left: 'V_0', right: 'V_0', top: '0', bot: '0', c1: '(a,a)' }) }),

      Q(md`A square pipe has three faces at $V_0$ and the fourth grounded. What is $V$ at the center?`,
        [md`$V_0/4$`, md`$V_0/2$`, md`$V_0$`, md`$3V_0/4$`], 3,
        [md`That's one live face.`, md`That's two.`, md`That would need all four faces at $V_0$.`, null],
        md`Each live face contributes $V_0/4$ at the center (four identical pieces must add to $V_0$ when all faces are live). Three of them: $3V_0/4$. Equivalently: all four faces at $V_0$ would give $V_0$, and removing one face's share leaves $V_0-V_0/4$.`,
        { figHtml: figBox({ w: 130, h: 130, left: 'V_0', top: 'V_0', bot: 'V_0', right: '0', c1: '(a,a)', center: true }) }),

      Q(md`A cube has two **opposite** faces held at $V_0$ and the other four grounded. What is $V$ at the center?`,
        [md`$V_0/6$`, md`$V_0/3$`, md`$V_0/2$`, md`$2V_0/3$`], 1,
        [md`That's one face.`, null, md`That would be three faces of a cube (or two of a square).`, md`That's four faces.`],
        md`Six faces at $V_0$ would make $V\equiv V_0$, so each face gives $V_0/6$ at the center. Two faces: $V_0/3$. (Same trick as the square, with six instead of four.)`,
        { figHtml: figCube({ top: 'V_0', note: 'top and bottom at V₀, sides grounded' }) }),

      RF(md`
        ### Nonzero constant boundaries and the $k=0$ term

        If the "grounded" faces are not at zero, subtract a simple solution that takes care of them first.
        - **Both plates at $V_1$**, end at $V_0(y)$: write $V=V_1+\tilde V$. Then $\tilde V$ solves the ordinary slot: $\tilde V=0$ on both plates, $\tilde V(0,y)=V_0(y)-V_1$, $\tilde V\to0$. So $V\to V_1$ far down the slot, not $0$.
        - **Plates at different constants**, $V(x,0)=V_1$, $V(x,a)=V_2$: the separation constant $k=0$ also gives a solution, $(A+Bx)(C+Dy)$, and its piece $V_1+(V_2-V_1)\,y/a$ is the parallel-plate potential. Write $V=V_1+(V_2-V_1)\dfrac ya+\tilde V$, with $\tilde V=0$ on both plates and $\tilde V(0,y)=V_0(y)-\left[V_1+(V_2-V_1)\dfrac ya\right]$.

        Far down the slot the potential tends to the solution of the plates alone ($x$-independent), which is the right reading of "$V$ finite as $x\to\infty$" (Griffiths' footnote: occasionally $k=0$ must be included).
      `),

      Q(md`Both plates of the slot are at $V_1$, the end at $V_0$. You write $V=V_1+\tilde V$. What are the BCs for $\tilde V$?`,
        [md`$\tilde V=0$ on both plates, $\tilde V(0,y)=V_0-V_1$, $\tilde V\to0$ as $x\to\infty$`, md`$\tilde V=V_1$ on both plates, $\tilde V(0,y)=V_0$, $\tilde V\to0$`, md`$\tilde V=0$ on both plates, $\tilde V(0,y)=V_0$, $\tilde V\to V_1$`, md`$\tilde V=0$ on both plates, $\tilde V(0,y)=V_0+V_1$, $\tilde V\to0$`], 0,
        [null, md`Then $V$ would be $2V_1$ on the plates.`, md`Subtracting $V_1$ shifts every boundary value, including the end and the far end.`, md`Subtract, don't add.`],
        md`Subtract $V_1$ from every boundary value: plates $V_1-V_1=0$, end $V_0-V_1$, far end $V_1-V_1=0$. $\tilde V=\dfrac{4(V_0-V_1)}{\pi}\sum_{\text{odd }n}\dfrac1ne^{-n\pi x/a}\sin\dfrac{n\pi y}{a}$, and $V=V_1+\tilde V$.`,
        { figHtml: figSlot({ top: 'V_1', bot: 'V_1', end: 'V_0' }) }),

      Q(md`The bottom plate is at $V_1$ and the top plate at $V_2\neq V_1$; the end strip is at $V_0$. What does $V$ approach far down the slot?`,
        [md`$0$`, md`$\tfrac12(V_1+V_2)$, uniform`, md`$V_0$`, md`$V_1+(V_2-V_1)\,y/a$, the parallel-plate potential`], 3,
        [md`The plates are not at zero, so $V$ can't decay to zero between them.`, md`The average is right only on the midline. Between two plates at different potentials, $V$ varies linearly across the gap.`, md`The end's influence decays like $e^{-\pi x/a}$.`, null],
        md`Far from the end only the plates matter: an $x$-independent solution of Laplace's equation with $V_1$ and $V_2$ on the plates is the line $V_1+(V_2-V_1)y/a$. This is the separated solution with $k=0$, which the usual $k=n\pi/a$ list leaves out.`,
        { figHtml: figSlot({ top: 'V_2', bot: 'V_1', end: 'V_0' }) }),

      RF(md`
        ### Worked example: one plate live, the $k=0$ piece

        Slot $0<y<a$, $x>0$. The bottom plate is held at $V_1$; the top plate and the end strip ($x=0$) are grounded (thin insulation at the corners). Find $V$, and its value at $(a/2,\,a/2)$.

        [[fig:ex]]

        **BCs:**
        1. $V(x,0)=V_1$
        2. $V(x,a)=0$
        3. $V(0,y)=0$
        4. $V\to V_1(1-y/a)$ as $x\to\infty$ (the plates alone)

        **Split off the $k=0$ part.** $V_p=V_1(1-y/a)$ satisfies Laplace, BC #1, #2 and #4. Write $V=V_p+\tilde V$. Then
        1. $\tilde V(x,0)=0$, 2. $\tilde V(x,a)=0$, 3. $\tilde V(0,y)=-V_1(1-y/a)$, 4. $\tilde V\to0$.

        That's the standard slot: $\tilde V=\sum C_ne^{-n\pi x/a}\sin(n\pi y/a)$ with
        $$C_n=\frac2a\int_0^a\left[-V_1\left(1-\frac ya\right)\right]\sin\frac{n\pi y}{a}\,dy=-\frac{2V_1}{n\pi}.$$
        So
        $$V(x,y)=V_1\left(1-\frac ya\right)-\frac{2V_1}{\pi}\sum_{n=1}^\infty\frac1n\,e^{-n\pi x/a}\sin\frac{n\pi y}{a}.$$

        At $(a/2,a/2)$: $\sin(n\pi/2)=1,0,-1,0,\dots$, so $V=V_1\left[\tfrac12-\tfrac2\pi\left(e^{-\pi/2}-\tfrac13e^{-3\pi/2}+\tfrac15e^{-5\pi/2}-\cdots\right)\right]=V_1\left[0.5-0.6366\times0.2050\right]\approx0.370\,V_1$.

        **Checks.** At $x=0$ the series is the Fourier series of $V_1(1-y/a)$, so $V(0,y)=0$ ✓. All $n$ appear (not just odd ones) because $1-y/a$ is not symmetric about $y=a/2$. Near the end, $V$ is pulled down from the plates' $0.5V_1$ toward the grounded strip, as it should be.
      `, { ex: { svg: figSlot({ top: 'V=0', bot: 'V_1', end: 'V=0' }), cap: 'Only the bottom plate is live.' } }),

      P({
        id: 'ub-pipe3', title: 'Three live faces',
        q: md`A long square pipe of side $a$: the face $x=0$ is grounded, and the other three faces ($x=a$, $y=0$, $y=a$) are held at $V_0$ (insulated from the grounded face).

          (a) What is $V$ at the center, in units of $V_0$?
          (b) Which expression is $V(x,y)$?
          (c) What is $V$ at $(a/4,\,a/2)$, in units of $V_0$?`,
        figHtml: figBox({ w: 130, h: 130, left: 'V=0', right: 'V_0', top: 'V_0', bot: 'V_0', c1: '(a,a)' }),
        hints: [
          md`Three faces at $V_0$ and one at $0$: subtract the constant. $V=V_0+W$, where $W$ is $0$ on the three live faces and $-V_0$ on $x=0$.`,
          md`Center: by the four-face symmetry, a single face at $-V_0$ contributes $-V_0/4$ at the center.`,
          md`$W$ has one live face at $x=0$ and a grounded face at $x=a$: $W=\sum C_n\sinh(n\pi(a-x)/a)\sin(n\pi y/a)$, with $C_n\sinh n\pi=-\tfrac{4V_0}{n\pi}$ (odd $n$).`,
        ],
        parts: [
          { lbl: md`V(a/2,a/2)/V_0`, ans: 0.75, unit: '' },
          { lbl: md`(b) $V(x,y)=$`, mc: [md`$\dfrac{4V_0}{\pi}\displaystyle\sum_{\text{odd }n}\dfrac{\sinh(n\pi x/a)}{n\sinh n\pi}\sin\dfrac{n\pi y}{a}$`,
            md`$V_0-\dfrac{4V_0}{\pi}\displaystyle\sum_{\text{odd }n}\dfrac{\sinh\big(n\pi(a-x)/a\big)}{n\sinh n\pi}\sin\dfrac{n\pi y}{a}$`,
            md`$V_0-\dfrac{4V_0}{\pi}\displaystyle\sum_{\text{odd }n}\dfrac1ne^{-n\pi x/a}\sin\dfrac{n\pi y}{a}$`,
            md`$\dfrac{3V_0}{4}$ everywhere`], a: 1,
            why: [md`That's the single live face $x=a$ with the other three grounded; it misses $y=0$ and $y=a$.`, null, md`The pipe has a grounded face at $x=a$ for $W$; $e^{-n\pi x/a}$ is the semi-infinite slot.`, md`$3V_0/4$ is only the center value.`] },
          { lbl: md`V(a/4,a/2)/V_0`, ans: 0.4595, unit: '' },
        ],
        sol: md`
          **BCs:** 1. $V(0,y)=0$; 2. $V(a,y)=V_0$; 3. $V(x,0)=V_0$; 4. $V(x,a)=V_0$.

          Three faces share the value $V_0$, so subtract it: $V=V_0+W$ with
          1. $W(0,y)=-V_0$; 2. $W(a,y)=0$; 3. $W(x,0)=0$; 4. $W(x,a)=0$.

          [[fig:bc]]

          $W$ has one live face. $y$ has two zero faces: $\sin(n\pi y/a)$. $W=0$ at $x=a$: $\sinh(n\pi(a-x)/a)$. At $x=0$: $\sum C_n\sinh(n\pi)\sin(n\pi y/a)=-V_0$, so $C_n\sinh n\pi=-\dfrac{4V_0}{n\pi}$ for odd $n$ (Lecture 12's coefficients for a constant). Hence
          $$V=V_0-\frac{4V_0}{\pi}\sum_{n\text{ odd}}\frac{\sinh\big(n\pi(a-x)/a\big)}{n\sinh n\pi}\sin\frac{n\pi y}{a}.$$

          **(a)** By symmetry a single face at $-V_0$ gives $-V_0/4$ at the center, so $V_{\text{center}}=V_0-V_0/4=\tfrac34V_0$. (Or: three faces at $V_0$, each worth $V_0/4$.) Series check: $n=1$ gives $\tfrac4\pi\tfrac{\sinh(\pi/2)}{\sinh\pi}=0.2537$, $n=3$ gives $-0.0038$, $n=5$ adds $+0.0001$: $W\approx-0.250V_0$ ✓.

          **(b)** As above.

          **(c)** At $(a/4,a/2)$: $\sin(n\pi/2)=+1,-1,+1$ for $n=1,3,5$, and $\dfrac{\sinh(3n\pi/4)}{\sinh n\pi}\approx e^{-n\pi/4}$ for $n\ge3$:
          $$\frac{W}{V_0}=-\frac4\pi\left[\frac{\sinh(3\pi/4)}{\sinh\pi}-\frac{e^{-3\pi/4}}{3}+\frac{e^{-5\pi/4}}{5}-\cdots\right]=-\frac4\pi\left[0.4527-0.0316+0.0039-0.0006\right]\approx-0.5405,$$
          so $V\approx0.459\,V_0$. Close to the grounded face, as expected.

          **What to remember:** shift away a common constant before separating; then the symmetry shortcut gives centers for free and the series gives everything else.
        `,
        figs: { bc: { svg: figBox({ w: 130, h: 130, left: md`\#1\ -V_0`, right: md`\#2\ 0`, top: md`\#4\ 0`, bot: md`\#3\ 0`, c1: '(a,a)' }), cap: 'Boundary values of $W=V-V_0$: one live face.' } },
      }),

      RF(md`
        !!key Patterns to remember
          - Oscillate in the direction with two zero faces; exponentials or $\sinh/\cosh$ in the other.
          - $V\to0$ at $+\infty$: $e^{-kx}$. Grounded face at $x=0$: $\sinh kx$. Grounded face at $x=b$: $\sinh k(b-x)$. Symmetric live faces: $\cosh kx$. Antisymmetric: $\sinh kx$.
          - The second zero face quantizes $k$ with **its own** spacing ($k=n\pi/a$, $a$ = distance between the zero faces). Zero value plus zero slope: $k=(n-\tfrac12)\pi/a$.
          - The live face fixes $C_n$ (Fourier); all zero conditions are imposed term by term first.
          - Several live faces: split and add. Centers: each face of a square gives $V_{\text{face}}/4$, of a cube $V_{\text{face}}/6$.
          - Nonzero plates: subtract the constant (or the $k=0$ linear piece), then solve the ordinary slot. Far away, $V$ tends to the plates-only solution.
      `),
    ],
  });

  // =====================================================================================
  // Lesson 6. Boundary conditions in spherical separation of variables
  // =====================================================================================
  LESSONS.push({
    id: 'ub-sph', title: 'Boundary conditions in spherical separation of variables',
    steps: [
      RF(md`
        With azimuthal symmetry (Lectures 12–13) every solution of Laplace's equation is
        $$V(r,\theta)=\sum_{\ell=0}^\infty\left(A_\ell r^\ell+\frac{B_\ell}{r^{\ell+1}}\right)P_\ell(\cos\theta).$$
        Every spherical problem is decided by which BC acts on which coefficient:

        | BC | effect |
        |---|---|
        | region contains $r=0$: $V$ finite there | $B_\ell=0$ for all $\ell$ |
        | $V\to0$ as $r\to\infty$ | $A_\ell=0$ for all $\ell$, including $A_0$ |
        | $V\to-E_0r\cos\theta+C$ (uniform field far away) | $A_1=-E_0$, $A_0=C$, $A_\ell=0$ for $\ell\ge2$ |
        | region is a shell, $a<r<b$ | nothing is killed: keep both families |
        | $V$ finite on the $z$-axis | integer $\ell$, $P_\ell$ only |
        | $V(R,\theta)=V_0(\theta)$ | Legendre's trick: $A_\ell R^\ell$ (or $B_\ell R^{-\ell-1}$) $=\tfrac{2\ell+1}{2}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$ |
        | conductor, $V(R,\theta)=V_c$ | $\ell\ge1$: $A_\ell R^\ell+B_\ell R^{-(\ell+1)}=0$; $\ell=0$: $A_0+B_0/R=V_c$ |
        | total charge $Q$ inside (region outside it) | $B_0=\tfrac{Q}{4\pi\varepsilon_0}$ |
        | surface charge $\sigma_0(\theta)$ on $r=R$ | $B_\ell=A_\ell R^{2\ell+1}$; $(2\ell+1)A_\ell R^{\ell-1}=s_\ell/\varepsilon_0$ |

        **Why the charge condition is about $B_0$ alone.** Gauss's law on a sphere of radius $r$ in the region: $\oint(-\partial_rV)\,r^2d\Omega=Q_{\text{enc}}/\varepsilon_0$. Every $P_\ell$ with $\ell\ge1$ integrates to zero over the sphere, so only the $\ell=0$ term carries flux: $-\partial_r(B_0/r)\cdot4\pi r^2=4\pi B_0$, hence $B_0=\tfrac{Q_{\text{enc}}}{4\pi\varepsilon_0}$. A conductor with given charge therefore brings one unknown ($V_c$) and fixes one coefficient ($B_0$).
      `),

      Q(md`$V_0(\theta)$ is given on a sphere of radius $R$ and you want $V$ outside, where there is no charge. Which coefficients does $V\to0$ remove?`,
        [md`All the $A_\ell$, including $A_0$`, md`Only the $A_\ell$ with $\ell\ge1$; $A_0$ is a harmless constant`, md`All the $B_\ell$`, md`None; they're fixed by $V_0(\theta)$`], 0,
        [null, md`A constant doesn't go to zero at infinity. With $V(\infty)=0$ as the reference, $A_0=0$ too.`, md`The $B_\ell r^{-(\ell+1)}$ terms are exactly the ones that decay.`, md`$V_0(\theta)$ fixes the survivors after the far-field condition has removed the growing terms.`],
        md`Lecture 13: "$V(\infty,\theta)\to0$, so $A_\ell=0$", leaving $V=\sum B_\ell r^{-(\ell+1)}P_\ell$ with $B_\ell=\tfrac{2\ell+1}{2}R^{\ell+1}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$.`,
        { figHtml: figShell({ lab: md`V_0(\theta)`, outLab: md`V\ ?` }) }),

      Q(md`You want $V$ in the region between two concentric spheres, $a<r<b$. Which terms of the general solution are allowed?`,
        [md`Only $A_\ell r^\ell$, because the region is bounded`, md`Only $B_\ell r^{-(\ell+1)}$, because the region excludes the origin`, md`Both families; the two surfaces give two equations per $\ell$`, md`Only $\ell=0$`], 2,
        [md`Bounded doesn't mean it contains the origin. Nothing is singular in $a<r<b$.`, md`It excludes the origin, but it doesn't reach infinity either, so the $r^\ell$ terms stay.`, null, md`Only if both boundary values are independent of $\theta$.`],
        md`Each term is finite everywhere in $a\le r\le b$, so no regularity condition applies. Per $\ell$ there are two unknowns ($A_\ell$, $B_\ell$) and two equations (the values on $r=a$ and $r=b$).`,
        { figHtml: figConc({ inner: md`V_a(\theta)`, outer: md`V_b(\theta)` }) }),

      Q(md`A sphere sits in a field that is uniform far away, $\vb E_0=E_0\hat{\mathbf z}$. What does the far-field condition do to the coefficients?`,
        [md`$A_1=+E_0$`, md`$B_1=-E_0$`, md`$A_1=-E_0R$`, md`$A_1=-E_0$, $A_\ell=0$ for $\ell\ge2$, and $A_0=C$`], 3,
        [md`$V=+E_0z$ would give $\vb E=-E_0\hat{\mathbf z}$.`, md`$B_1\cos\theta/r^2$ decays; it can't produce a uniform field. $B_1$ comes from the sphere's BC.`, md`$A_1r\cos\theta$ must equal $-E_0r\cos\theta$ at large $r$; no $R$ is involved.`, null],
        md`For large $r$ only the $A_\ell r^\ell$ terms matter, and they must reproduce $-E_0r\cos\theta+C=-E_0rP_1+CP_0$. Matching: $A_1=-E_0$, $A_0=C$, all other $A_\ell=0$. Here the condition at infinity **supplies** a term instead of killing one.`,
        { figHtml: figField({ note: 'uniform field far away' }) }),

      Q(md`A metal sphere (radius $R$) is an equipotential, $V(R,\theta)=V_c$. What does that say about the coefficients with $\ell\ge1$?`,
        [md`$A_\ell=B_\ell=0$`, md`$A_\ell R^\ell+B_\ell R^{-(\ell+1)}=0$, i.e. $B_\ell=-A_\ell R^{2\ell+1}$`, md`$B_\ell=A_\ell R^{2\ell+1}$`, md`$A_\ell R^\ell+B_\ell R^{-(\ell+1)}=V_c$`], 1,
        [md`Too strong: a uniform field supplies $A_1\neq0$, and $B_1$ must then cancel it on the surface.`, null, md`That's the continuity condition for a charged shell. Here the sum has to vanish.`, md`$V_c$ is matched by the $\ell=0$ term alone: $V_c=A_0+B_0/R$. Constant $V_c$ has no $\cos\theta$ dependence.`],
        md`"$V$ independent of $\theta$ on $r=R$" means every $P_\ell$ with $\ell\ge1$ has total coefficient zero there. This gives Griffiths Eq. 3.75, $B_\ell=-A_\ell R^{2\ell+1}$, used for the sphere in a field.`,
        { figHtml: figField({ note: 'metal sphere: V = const on it' }) }),

      Q(md`An isolated metal sphere carries total charge $Q$. Which coefficient does the charge condition fix?`,
        [md`$B_1$`, md`$A_0$`, md`Every $B_\ell$`, md`$B_0=\tfrac{Q}{4\pi\varepsilon_0}$`], 3,
        [md`$B_1$ is a dipole term; its flux through a sphere is zero.`, md`$A_0$ is a constant: no field, no flux.`, md`Only $\ell=0$ survives the integral over the sphere.`, null],
        md`Gauss: $Q/\varepsilon_0=\oint(-\partial_rV)r^2d\Omega$. Only $\ell=0$ survives the angular integral, giving $4\pi B_0$. So $B_0=\tfrac{Q}{4\pi\varepsilon_0}$: far away a charged sphere looks like a point charge, whatever else is going on.`,
        { figHtml: figField({ q: 'Q', note: 'isolated metal sphere, charge Q' }) }),

      RF(md`
        ### Worked example: a neutral metal sphere in a uniform field (Griffiths Ex. 3.8)

        [[fig:fld]]

        **Region:** $r>R$. **BCs:**
        1. $V(R,\theta)=V_c$, constant
        2. total charge $0$
        3. $V\to-E_0r\cos\theta+C$ as $r\to\infty$

        The setup is antisymmetric under $z\to-z$ (field reversed), so the plane $z=0$ is an equipotential, and the sphere, which touches it, has the same potential. Choose $C=0$; then $V_c=0$ and BC #1 reads $V(R,\theta)=0$.

        - BC #3: $A_1=-E_0$, all other $A_\ell=0$ (and $A_0=C=0$).
        - BC #2: $B_0=0$.
        - BC #1, for each $\ell$: $A_\ell R^\ell+B_\ell R^{-(\ell+1)}=0$, so $B_1=E_0R^3$ and all other $B_\ell=0$.
        $$V(r,\theta)=-E_0\left(r-\frac{R^3}{r^2}\right)\cos\theta.$$
        **Induced charge** ($\hat{\mathbf n}=\hat{\mathbf r}$): $\sigma=-\varepsilon_0\partial_rV\big|_R=\varepsilon_0E_0\left(1+\dfrac{2R^3}{r^3}\right)\cos\theta\Big|_R=3\varepsilon_0E_0\cos\theta$.

        **Checks.** $\sigma$ is positive on the north (where the field leaves) and integrates to zero ✓. The induced part, $E_0R^3\cos\theta/r^2$, is a dipole with $p=4\pi\varepsilon_0R^3E_0$. The field at the poles is $3E_0$: a conductor triples the applied field at its tip.
      `, { fld: { svg: figField({ note: 'uncharged metal sphere' }), cap: 'Field uniform far away; the sphere distorts it nearby.' } }),

      Q(md`For the neutral sphere in the field, the induced charge's potential outside is $E_0R^3\cos\theta/r^2$. What is it, physically?`,
        [md`The field of a dipole $p=4\pi\varepsilon_0R^3E_0$ at the center, pointing along $\hat{\mathbf z}$`, md`The field of a point charge $Q=4\pi\varepsilon_0R^2E_0$`, md`A uniform field $E_0$ that cancels the applied one outside`, md`A quadrupole`], 0,
        [null, md`The sphere is neutral: no $1/r$ term.`, md`It cancels the applied field **inside** the metal, not outside.`, md`$\cos\theta/r^2$ is the $\ell=1$ (dipole) form; a quadrupole would be $P_2/r^3$.`],
        md`Compare with $V_{\text{dip}}=\dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$: $p=4\pi\varepsilon_0R^3E_0$. The field pushes $+$ charge north and $-$ south, making a dipole aligned with $\vb E_0$.`,
        { figHtml: figField({ note: 'uncharged metal sphere' }) }),

      Q(md`On the neutral sphere in the field, $\sigma=3\varepsilon_0E_0\cos\theta$. Where is the surface field strongest, and how strong is it?`,
        [md`At the equator, $3E_0$`, md`At the poles, $E_0$`, md`Uniform over the sphere, $E_0$`, md`At the poles, $3E_0$, normal to the surface`], 3,
        [md`$\sigma=0$ at the equator, so the field is zero there.`, md`$E=\sigma/\varepsilon_0=3E_0$ at the poles.`, md`$\sigma$ varies as $\cos\theta$, so the field does too.`, null],
        md`$E=\sigma/\varepsilon_0=3E_0\cos\theta$ just outside, normal to the surface. A rounded conductor concentrates the field at its "tips"; the factor $3$ is the sphere's value.`,
        { figHtml: figField({ note: 'uncharged metal sphere' }) }),

      Q(md`Why is it legitimate to set the neutral sphere's potential to zero?`,
        [md`Because it is grounded`, md`Because neutral conductors are always at $V=0$`, md`Because $V$ is fixed only up to a constant; choosing $C=0$ in $-E_0r\cos\theta+C$ puts the plane $z=0$, and hence the sphere, at $0$ by symmetry`, md`Because $V\to0$ at infinity`], 2,
        [md`It isn't; it's isolated and neutral. The trick works only because of the reference choice.`, md`A neutral sphere near a point charge floats at $\tfrac{q}{4\pi\varepsilon_0a}\neq0$.`, null, md`In a uniform field $V$ does not go to zero at infinity.`],
        md`The applied potential has an arbitrary constant. The antisymmetry $z\to-z$ makes the plane $z=0$ an equipotential at $C$, and the sphere touches that plane, so the sphere is at $C$ too. Choosing $C=0$ costs nothing. For a **charged** sphere the same choice gives $V_c=\tfrac{Q}{4\pi\varepsilon_0R}$.`,
        { figHtml: figField({ note: 'uncharged metal sphere' }) }),

      P({
        id: 'ub-sphV0field', title: 'A sphere held at V₀ in a uniform field',
        q: md`A metal sphere of radius $R$ is held at potential $V_0$ in a field that is uniform far away, $E_0\hat{\mathbf z}$. Take the far-field potential to be $-E_0z$, so the plane $z=0$ far from the sphere is the zero of potential.

          (a) Find $V(r,\theta)$ outside.
          (b) What total charge does the battery put on the sphere?
          (c) Find $\sigma(\theta)$.`,
        figHtml: figField({ note: 'metal sphere held at V₀' }),
        hints: [
          md`BCs: $V(R,\theta)=V_0$; $V\to-E_0r\cos\theta$ (with $C=0$). Which coefficients does each fix?`,
          md`Far field: $A_1=-E_0$, other $A_\ell=0$. On the sphere: $\ell=0$: $B_0/R=V_0$; $\ell=1$: $-E_0R+B_1/R^2=0$.`,
          md`Charge from $B_0=\tfrac{Q}{4\pi\varepsilon_0}$; $\sigma=-\varepsilon_0\partial_rV$ at $r=R$.`,
        ],
        parts: [
          { lbl: md`V(r,\theta)`, expr: 'V0*R/r - E0*(r - R^3/r^2)*cos(theta)', vars: { V0: [1, 3], R: [1, 2], r: [2.5, 4], E0: [1, 2], theta: [0.2, 2.9] } },
          { lbl: md`Q`, expr: '4*pi*eps0*R*V0', vars: { R: [1, 2], V0: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`\sigma(\theta)`, expr: 'eps0*V0/R + 3*eps0*E0*cos(theta)', vars: { V0: [1, 3], R: [1, 2], E0: [1, 2], theta: [0.2, 2.9], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Region:** $r>R$. **BCs:**
          1. $V(R,\theta)=V_0$
          2. $V\to-E_0r\cos\theta$ as $r\to\infty$ ($C=0$: the reference is the far-field potential)

          BC #2: $A_1=-E_0$, $A_0=0$, $A_{\ell\ge2}=0$. BC #1 per $\ell$:
          - $\ell=0$: $B_0/R=V_0$, so $B_0=V_0R$.
          - $\ell=1$: $-E_0R+B_1/R^2=0$, so $B_1=E_0R^3$.
          - $\ell\ge2$: $B_\ell=0$.

          **(a)** $V=\dfrac{V_0R}{r}-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$: the neutral-sphere solution plus a point-charge term.

          **(b)** $B_0=\tfrac{Q}{4\pi\varepsilon_0}$, so $Q=4\pi\varepsilon_0RV_0$, the same as with no field (the field-induced part has zero net charge).

          **(c)** $\sigma=-\varepsilon_0\partial_rV\big|_R=\varepsilon_0\left[\dfrac{V_0}{R}+3E_0\cos\theta\right]$.

          **Checks.** $V(R,\theta)=V_0$ ✓. $E_0\to0$: an isolated sphere at $V_0$ ✓. $\int\sigma\,da=4\pi R^2\varepsilon_0V_0/R=Q$ ✓.

          **What to remember:** each BC acts on its own $\ell$: the far field on $\ell=1$ (through $A_1$), the sphere's potential on $\ell=0$ and $\ell=1$, and the charge only on $\ell=0$.
        `,
      }),

      RF(md`
        ### The hemispherical bump: recognising a solution you already have

        A grounded conducting plane has a hemispherical bump of radius $R$. Far away the field is uniform, $E_0\hat{\mathbf z}$. Find $V$ above the plane.

        [[fig:bump]]

        **Region:** above the plane and outside the bump. **BCs:**
        1. $V=0$ on the plane $z=0$ (for $s>R$)
        2. $V=0$ on the bump, $r=R$, $z>0$
        3. $V\to-E_0z$ far away (the constant is $0$ because the plane is at $0$)

        Look at the sphere-in-a-field solution, $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$:
        - on the plane $z=0$, $\theta=\pi/2$, so $\cos\theta=0$ and $V=0$: BC #1 ✓
        - on $r=R$, $V=0$: BC #2 ✓
        - far away, $V\to-E_0r\cos\theta=-E_0z$: BC #3 ✓
        - it satisfies Laplace's equation everywhere except $r=0$, which is not in the region ✓

        By uniqueness it **is** the answer. No new calculation: the plane $z=0$ was already an equipotential at $V=0$ in the full-sphere problem, so replacing the lower half of space by metal changes nothing above it.

        [[fig:bumpbc]]

        **Induced charge.** On the bump ($\hat{\mathbf n}=\hat{\mathbf r}$): $\sigma=3\varepsilon_0E_0\cos\theta$, so $3\varepsilon_0E_0$ at the top. On the plane ($\hat{\mathbf n}=\hat{\mathbf z}$), with $s$ the distance from the axis: $V=-E_0z\left(1-R^3/r^3\right)$ and
        $$\sigma=-\varepsilon_0\frac{\partial V}{\partial z}\Big|_{z=0}=\varepsilon_0E_0\left(1-\frac{R^3}{s^3}\right),$$
        which is $\varepsilon_0E_0$ far away and $0$ at the rim $s=R$, the inside corner where plane meets bump. The field at the top of the bump is three times the field over the flat plane: the lightning-rod effect.
      `, { bump: { svg: figBump({ field: true, plab: 'V=0' }), cap: 'Grounded plane with a hemispherical bump in a uniform field.' },
        bumpbc: { svg: figBump({ plab: md`\#1\ V=0`, blab: md`\#2\ V=0`, far: md`\#3\ V\to-E_0z` }), cap: 'The three BCs; the sphere-in-field potential meets all of them.' } }),

      Q(md`Why is $V=-E_0\left(r-R^3/r^2\right)\cos\theta$ the potential above the plane with the bump?`,
        [md`It isn't exactly; it's an approximation valid far from the bump`, md`Because the bump is small`, md`Because it satisfies Laplace's equation in the region and all three BCs (zero on the plane, zero on the bump, $-E_0z$ far away); uniqueness does the rest`, md`Because the plane acts as an image of the sphere`], 2,
        [md`It's exact: every BC holds exactly.`, md`Nothing in the argument depends on $R$ being small.`, null, md`No images are involved; the plane was already an equipotential of the sphere solution.`],
        md`Uniqueness again: equation plus BCs. The sphere-in-field solution vanishes on the equatorial plane ($\cos\theta=0$) and on the sphere, and has the right far field. So it solves the bump problem without any new work.`,
        { figHtml: figBump({ field: true, plab: 'V=0' }) }),

      Q(md`What is the surface charge density at the top of the bump?`,
        [md`$\varepsilon_0E_0$`, md`$2\varepsilon_0E_0$`, md`$0$`, md`$3\varepsilon_0E_0$`], 3,
        [md`That's the value on the flat plane far from the bump.`, md`From $\varepsilon_0E_0(1+2R^3/r^3)$ at $r=R$: $1+2=3$, not $2$.`, md`Zero is at the rim, where the bump meets the plane.`, null],
        md`$\sigma=-\varepsilon_0\partial_rV\big|_R=\varepsilon_0E_0(1+2R^3/R^3)\cos\theta=3\varepsilon_0E_0\cos\theta$, and the top is $\theta=0$.`,
        { figHtml: figBump({ field: true, plab: 'V=0' }) }),

      Q(md`What is the surface charge density on the flat plane far from the bump?`,
        [md`$\varepsilon_0E_0$`, md`$-\varepsilon_0E_0$`, md`$3\varepsilon_0E_0$`, md`$0$`], 0,
        [null, md`The field above points up, out of the metal: $\sigma=\varepsilon_0E_z>0$.`, md`The factor $3$ appears only at the top of the bump.`, md`Far from the bump the plane sees the full applied field.`],
        md`$\sigma=\varepsilon_0E_0(1-R^3/s^3)\to\varepsilon_0E_0$: a flat conductor in a field $E_0$ ending on it. The bump reduces $\sigma$ nearby and triples it on top.`,
        { figHtml: figBump({ field: true, plab: 'V=0' }) }),

      Q(md`Where on the plane is the induced charge zero?`,
        [md`Nowhere`, md`At the rim of the bump, $s=R$`, md`Far from the bump`, md`Directly under the top of the bump`], 1,
        [md`$1-R^3/s^3$ vanishes at $s=R$.`, null, md`Far away it's $\varepsilon_0E_0$.`, md`That point is inside the metal, under the bump.`],
        md`$\sigma_{\text{plane}}=\varepsilon_0E_0(1-R^3/s^3)$ is zero at $s=R$, where the plane meets the bump at a right angle. Seen from the field region that's an inside corner, and the field vanishes in an inside corner.`,
        { figHtml: figBump({ field: true, plab: 'V=0' }) }),

      WG.sphere({ bc: 'cos', n: 1 }),

      RF(md`
        ### Shells, capacitors and HW 5

        A shell region keeps both families. The simplest case, both boundary values constant ($V(a)=V_a$, $V(b)=V_b$): only $\ell=0$, $V=A_0+B_0/r$, two equations for two unknowns: the spherical capacitor. With $\theta$-dependent data each $\ell$ is its own pair of equations (lesson 8 solves $V_0\cos\theta$ inside a grounded shell).

        **Surface charge from $V_0(\theta)$** (HW 5 Prob. 3.22): when $V_0(\theta)$ is given on a sphere with no charge inside or outside, the inside and outside solutions share the same $V_0$, so their coefficients are tied: with $C_\ell=\int_0^\pi V_0P_\ell\sin\theta\,d\theta$,
        $$A_\ell=\frac{2\ell+1}{2R^\ell}C_\ell,\qquad B_\ell=\frac{2\ell+1}{2}R^{\ell+1}C_\ell.$$
        The jump in $\partial_rV$ then gives $\sigma$ term by term.
      `),

      Q(md`The inner sphere ($r=a$) is held at $V_0$, the outer ($r=b$) is grounded. Which terms appear in $V$ between them?`,
        [md`$\ell=0$ only: $V=A_0+B_0/r$`, md`$\ell=0$ and $\ell=1$`, md`All $\ell$`, md`Only $B_0/r$`], 0,
        [null, md`Nothing in the BCs depends on $\theta$, so there's no $P_1$.`, md`Uniform boundary values project only onto $P_0$.`, md`Then $V(b)=0$ would force $B_0=0$. The constant $A_0$ is needed: $A_0=-B_0/b$.`],
        md`$V(a)=V_0$, $V(b)=0$: $A_0+B_0/a=V_0$, $A_0+B_0/b=0$, so $V=\dfrac{V_0ab}{b-a}\left(\dfrac1r-\dfrac1b\right)$. The charge on the inner sphere is $4\pi\varepsilon_0B_0$, giving $C=4\pi\varepsilon_0ab/(b-a)$.`,
        { figHtml: figConc({ inner: 'V_0', outer: 'V=0', outerMetal: true }) }),

      Q(md`$V_0(\theta)=k\cos^2\theta$ on a sphere. Which Legendre terms appear inside?`,
        [md`$\ell=2$ only`, md`$\ell=0$ and $\ell=1$`, md`All even $\ell$`, md`$\ell=0$ and $\ell=2$`], 3,
        [md`$\cos^2\theta$ has a nonzero average over the sphere, so $P_0$ appears too.`, md`$\cos^2\theta$ is even in $\cos\theta$: no $P_1$.`, md`A degree-2 polynomial in $\cos\theta$ needs only $P_0$ and $P_2$.`, null],
        md`$\cos^2\theta=\tfrac13P_0+\tfrac23P_2(\cos\theta)$. Inside: $V=\tfrac k3+\tfrac{2k}{3}\dfrac{r^2}{R^2}P_2(\cos\theta)$. Read the coefficients off by eye whenever $V_0$ is a polynomial in $\cos\theta$ (Lecture 13).`,
        { figHtml: figShell({ lab: md`k\cos^2\theta`, inLab: md`V\ ?` }) }),

      P({
        id: 'ub-HW5-3.22', src: 'HW 5 · Griffiths 3.22', title: 'Surface charge from V₀(θ)', big: true,
        q: md`Suppose the potential $V_0(\theta)$ at the surface of a sphere of radius $R$ is specified, and there is no charge inside or outside the sphere. Show that the charge density on the sphere is
          $$\sigma(\theta)=\frac{\varepsilon_0}{2R}\sum_{\ell=0}^\infty(2\ell+1)^2C_\ell P_\ell(\cos\theta),\qquad C_\ell=\int_0^\pi V_0(\theta)P_\ell(\cos\theta)\sin\theta\,d\theta.$$
          Then apply it.`,
        figHtml: figShell({ lab: md`V_0(\theta)` }),
        hints: [
          md`Two regions. Inside: $V=\sum A_\ell r^\ell P_\ell$ (finite at $0$). Outside: $V=\sum B_\ell r^{-(\ell+1)}P_\ell$ ($\to0$). Both equal $V_0$ at $r=R$.`,
          md`Legendre's trick: $A_\ell R^\ell=\tfrac{2\ell+1}{2}C_\ell$ and $B_\ell R^{-(\ell+1)}=\tfrac{2\ell+1}{2}C_\ell$.`,
          md`$\sigma=-\varepsilon_0\left[\partial_rV_{\text{out}}-\partial_rV_{\text{in}}\right]_{r=R}$; the $\ell$-th term gives $(\ell+1)+\ell=2\ell+1$.`,
        ],
        parts: [
          { lbl: md`(a) The $\ell$-th term of $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}$ at $r=R$ is`, mc: [md`$-\dfrac{(2\ell+1)^2}{2R}C_\ell P_\ell$`, md`$-\dfrac{(2\ell+1)}{2R}C_\ell P_\ell$`, md`$+\dfrac{(2\ell+1)^2}{2R}C_\ell P_\ell$`, md`$0$, since $V$ is continuous`], a: 0,
            why: [null, md`You need both factors of $2\ell+1$: one from Legendre's trick, one from adding $(\ell+1)$ (outside) and $\ell$ (inside).`, md`Sign: outside the slope is $-(\ell+1)(\dots)/R$, inside $+\ell(\dots)/R$; the difference is negative.`, md`$V$ is continuous; its slope is not.`] },
          { lbl: md`\sigma(\theta) \text{ for } V_0=k\cos\theta`, expr: '3*eps0*k*cos(theta)/R', vars: { eps0: [0.5, 2], k: [1, 3], theta: [0.2, 2.9], R: [1, 2] } },
          { lbl: md`\sigma \text{ for } V_0=k \text{ (constant)}`, expr: 'eps0*k/R', vars: { eps0: [0.5, 2], k: [1, 3], R: [1, 2] } },
          { lbl: md`\sigma(\theta) \text{ for } V_0=k\cos^2\theta`, expr: 'eps0*k*(5*cos(theta)^2 - 4/3)/R', vars: { eps0: [0.5, 2], k: [1, 3], theta: [0.2, 2.9], R: [1, 2] }, accepts: ['eps0*k*(15*cos(theta)^2-4)/(3*R)'] },
        ],
        sol: md`
          **Regions and BCs:**
          1. inside: $V$ finite at $r=0$
          2. outside: $V\to0$
          3. $V_{\text{in}}(R,\theta)=V_{\text{out}}(R,\theta)=V_0(\theta)$

          BC #1 and #2: $V_{\text{in}}=\sum A_\ell r^\ell P_\ell$, $V_{\text{out}}=\sum B_\ell r^{-(\ell+1)}P_\ell$. BC #3 with Legendre's trick (Lecture 13):
          $$A_\ell=\frac{2\ell+1}{2R^\ell}C_\ell,\qquad B_\ell=\frac{2\ell+1}{2}R^{\ell+1}C_\ell.$$
          The sphere carries the charge that makes the slope jump (Griffiths 2.36, $\hat{\mathbf n}=\hat{\mathbf r}$):
          $$\sigma=-\varepsilon_0\left[\partial_rV_{\text{out}}-\partial_rV_{\text{in}}\right]_R=-\varepsilon_0\sum_\ell\left[-(\ell+1)\frac{B_\ell}{R^{\ell+2}}-\ell A_\ell R^{\ell-1}\right]P_\ell.$$
          Substituting, both brackets are $\tfrac{2\ell+1}{2R}C_\ell$ times $(\ell+1)$ and $\ell$:
          $$\sigma=\varepsilon_0\sum_\ell\frac{(2\ell+1)C_\ell}{2R}\left[(\ell+1)+\ell\right]P_\ell=\frac{\varepsilon_0}{2R}\sum_\ell(2\ell+1)^2C_\ell P_\ell(\cos\theta).\ \blacksquare$$

          **Applications.**
          - $V_0=k\cos\theta$: $C_1=\tfrac23k$, others $0$: $\sigma=\tfrac{\varepsilon_0}{2R}\cdot9\cdot\tfrac23k\cos\theta=\dfrac{3\varepsilon_0k}{R}\cos\theta$. Direct check: $V_{\text{in}}=k\tfrac rR\cos\theta$, $V_{\text{out}}=k\tfrac{R^2}{r^2}\cos\theta$; slopes $k\cos\theta/R$ and $-2k\cos\theta/R$; jump $-3k\cos\theta/R$ ✓.
          - $V_0=k$: $C_0=2k$: $\sigma=\tfrac{\varepsilon_0}{2R}\cdot2k=\dfrac{\varepsilon_0k}{R}$. Check: a sphere at potential $k$ has $Q=4\pi\varepsilon_0Rk$, so $\sigma=\tfrac{Q}{4\pi R^2}=\varepsilon_0k/R$ ✓.
          - $V_0=k\cos^2\theta$: $C_0=\tfrac23k$, $C_2=\tfrac{4}{15}k$: $\sigma=\tfrac{\varepsilon_0}{2R}\left[\tfrac23k+25\cdot\tfrac4{15}kP_2\right]=\dfrac{\varepsilon_0k}{R}\left(\tfrac13+\tfrac{10}{3}P_2\right)=\dfrac{\varepsilon_0k}{R}\left(5\cos^2\theta-\tfrac43\right)$.

          **What to remember:** two regions sharing one boundary value; each $\ell$ is independent; $\sigma$ is the jump in the radial slope. Higher $\ell$ are weighted by $(2\ell+1)^2$: fine angular structure in $V_0$ needs a lot of surface charge.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Contains the origin: $B_\ell=0$. Reaches infinity with $V\to0$: $A_\ell=0$. Shell: keep both.
          - Uniform field far away: $A_1=-E_0$ (supplied, not killed). Don't impose $V\to0$.
          - Conductor surface: $A_\ell R^\ell+B_\ell R^{-(\ell+1)}=0$ for $\ell\ge1$; the $\ell=0$ part is its potential.
          - Total charge: $B_0=\tfrac{Q}{4\pi\varepsilon_0}$, nothing else.
          - If a known solution already vanishes on a surface (the sphere-in-field on $z=0$), that surface can be made of grounded metal for free: the bump problem.
          - $\sigma$ from a solution: $-\varepsilon_0$ times the jump in $\partial_rV$ (or just $-\varepsilon_0\partial_rV$ outside a conductor).
      `),
    ],
  });

  // =====================================================================================
  // Lesson 7. Find the mistake
  // =====================================================================================
  const STEPS = (d) => [md`Step 1 (${d[0]})`, md`Step 2 (${d[1]})`, md`Step 3 (${d[2]})`, md`Step 4 (${d[3]})`];
  const MQ = (setup, svg, steps, d, a, why, sol) => QF(
    md`${setup}

      [[fig:s]]

      ${steps}

      Exactly one step contains a boundary-condition error. Which one?`,
    STEPS(d), a, why, sol, { figs: { s: { svg, cap: 'The setup.' } } });

  LESSONS.push({
    id: 'ub-mistake', title: 'Find the mistake: boundary-condition errors in worked solutions',
    steps: [
      RF(md`
        Each problem below shows a short worked solution with exactly one boundary-condition error. The rest of the steps are done correctly, given what came before, so an early mistake propagates. Find the step where the solution first goes wrong. These are the errors that cost the most points on boundary-value problems.

        !!method How to audit a solution
          1. Is the region named, and is every boundary of it in the BC list? (No infinity unless the region reaches it; no origin unless it contains it.)
          2. Is each BC the right **kind** for the words (grounded, neutral, held at, uniform field far away)?
          3. Does each BC act on the right term (which function it kills, which length quantizes $k$)?
          4. Are images outside the region? Is $\hat{\mathbf n}$ out of the metal?
          5. Check the final answer against every BC.
      `),

      MQ(md`**Problem.** A spherical surface of radius $R$ is held at $V_0(\theta)=k\cos\theta$. Find $V$ inside.`,
        figShell({ lab: md`k\cos\theta`, inLab: md`V\ ?` }),
        md`1. Region $r<R$, no charge: $V=\sum\left(A_\ell r^\ell+B_\ell r^{-(\ell+1)}\right)P_\ell(\cos\theta)$.
          2. BCs: $V(R,\theta)=k\cos\theta$, and $V\to0$ as $r\to\infty$.
          3. The second BC kills every $A_\ell$, so $V=\sum B_\ell r^{-(\ell+1)}P_\ell$.
          4. Matching at $r=R$: $B_1/R^2=k$, so $V=kR^2\cos\theta/r^2$ inside.`,
        ['general solution', 'the BC list', 'which terms die', 'matching at R'], 1,
        [md`The general solution is right; the BCs decide which parts survive.`, null,
          md`Given the BC in step 2 this follows. The problem is the BC itself.`, md`Correct algebra for the (wrong) set of terms it was handed.`],
        md`The region $r<R$ contains the origin, not infinity. The condition is **$V$ finite at $r=0$**, which kills the $B_\ell$ (Lecture 13: $V(0,\theta)\neq\infty\Rightarrow B=0$). Correct result: $V=k\dfrac rR\cos\theta$. The wrong answer blows up at the center, which is a quick way to spot it.`),

      MQ(md`**Problem.** The slot: grounded plates at $y=0$ and $y=a$, end strip at $x=0$ held at $V_0$, region $x>0$.`,
        figSlot({ top: 'V=0', bot: 'V=0', end: 'V_0' }),
        md`1. Separate: $X''=k^2X$, $Y''=-k^2Y$.
          2. $V\to0$ as $x\to\infty$ keeps $X=e^{-kx}$.
          3. $V$ should be symmetric about the slot, so take $Y=\cos ky$.
          4. $V=0$ at $y=a$: $\cos ka=0$, so $k=(n-\tfrac12)\pi/a$.`,
        ['separate', 'x-dependence', 'choice of Y', 'quantize k'], 2,
        [md`Correct: $y$ has the two zero faces, so it oscillates.`, md`Correct for $x\to+\infty$.`, null, md`Follows from step 3; fix step 3 and this changes.`],
        md`$V=0$ at $y=0$ requires $D=0$ in $C\sin ky+D\cos ky$: $\cos0=1$ can't vanish there (Lecture 11). The symmetry argument is also misplaced: the slot is symmetric about $y=a/2$, not $y=0$. Correct: $Y=\sin ky$, $k=n\pi/a$, $V=\dfrac{4V_0}{\pi}\sum_{\text{odd }n}\dfrac1ne^{-n\pi x/a}\sin\dfrac{n\pi y}{a}$.`),

      MQ(md`**Problem.** A pipe $0<x<b$, $0<y<a$: faces $x=0$, $y=0$, $y=a$ grounded; face $x=b$ at $V_0(y)$.`,
        figBox({ top: 'V=0', bot: 'V=0', left: 'V=0', right: md`V_0(y)` }),
        md`1. The faces $y=0$ and $y=a$ are grounded, so $Y=\sin ky$.
          2. The live face is at $x=b$, so the allowed values are $k=n\pi/b$.
          3. $V=0$ at $x=0$ gives $X=\sinh kx$.
          4. Fourier at $x=b$: $C_n\sinh(n\pi)=\dfrac2b\displaystyle\int_0^aV_0(y)\sin\dfrac{n\pi y}{b}\,dy$.`,
        ['Y', 'quantize k', 'X', 'Fourier'], 1,
        [md`Right: two zero faces in $y$.`, null, md`Right: $\sinh$ vanishes at $x=0$.`, md`It inherits step 2's wrong $k$.`],
        md`$k$ is quantized by the second zero face **in the oscillating direction**: $\sin ka=0$, so $k=n\pi/a$. The length $b$ belongs to the other direction and only appears in $\sinh(n\pi b/a)$. Correct: $C_n\sinh\dfrac{n\pi b}{a}=\dfrac2a\displaystyle\int_0^aV_0(y)\sin\dfrac{n\pi y}{a}\,dy$.`),

      MQ(md`**Problem.** A charge $q$ at distance $a$ from the center of a grounded sphere of radius $R$. Find the image.`,
        figSphereQ({ wire: 'ground' }),
        md`1. BCs: $V(R,\theta)=0$, $V\to0$.
          2. Try one image $q'$ at distance $b$ from the center, on the line to $q$.
          3. $V(R,\theta)=0$ for all $\theta$ gives $q^2b=q'^2a$ and $(a-b)(R^2-ab)=0$.
          4. Take the simpler root, $b=a$ and $q'=-q$.`,
        ['BCs', 'ansatz', 'equations', 'choosing the root'], 3,
        [md`Right (Lecture 10).`, md`Right: by symmetry the image is on the line through $q$.`, md`Right (Lecture 11).`, null],
        md`$b=a$ puts the image on top of the real charge, **inside the region** $r>R$. It cancels $q$ and gives $V\equiv0$, the solution of a problem with no charge. Images must sit outside the region: $b=R^2/a<R$, $q'=-\dfrac Raq$.`),

      MQ(md`**Problem.** A charge $q>0$ sits inside a grounded spherical shell (radius $R$) at distance $a$ from the center. Find the induced $\sigma$ on the inner wall.`,
        figInside({}),
        md`1. Region $r<R$; BC: $V(R,\theta)=0$.
          2. Image $q'=-Rq/a$ at $b=R^2/a$, outside the region.
          3. $\sigma=-\varepsilon_0\,\partial V/\partial r$ at $r=R$.
          4. Evaluating it gives $\sigma>0$ everywhere on the wall.`,
        ['region and BC', 'image', 'formula for sigma', 'result'], 2,
        [md`Right: bounded region, one condition.`, md`Right: Kelvin's construction, now with $b>R$.`, null, md`It follows from step 3; a positive induced charge near a positive $q$ is the giveaway.`],
        md`$\sigma=-\varepsilon_0\,\partial V/\partial n$ with $\hat{\mathbf n}$ pointing **out of the metal into the field region**: here $-\hat{\mathbf r}$. So $\sigma=+\varepsilon_0\,\partial V/\partial r\big|_R$, which is negative everywhere and integrates to $-q$.`),

      MQ(md`**Problem.** A charge $q$ at distance $a$ from a grounded sphere of radius $R$. Find the force on $q$ and the total induced charge.`,
        figSphereQ({ wire: 'ground' }),
        md`1. BCs: $V(R,\theta)=0$, $V\to0$.
          2. Image $q'=-\dfrac Raq$ at $b=\dfrac{R^2}{a}$.
          3. Force: $F=\dfrac{qq'}{4\pi\varepsilon_0(a-b)^2}=-\dfrac{q^2Ra}{4\pi\varepsilon_0(a^2-R^2)^2}$, attractive.
          4. The grounded sphere must absorb all of $q$'s field lines, so the induced charge is $-q$.`,
        ['BCs', 'image', 'force', 'induced charge'], 3,
        [md`Right.`, md`Right.`, md`Right (Griffiths Eq. 3.18).`, null],
        md`Not all of $q$'s field lines end on the sphere; many go to infinity. Outside the sphere the real field equals the image system's, so Gauss's law around the sphere gives the image's charge: $Q_{\text{ind}}=q'=-Rq/a$. Only the infinite plane ($R\to\infty$) captures all of it.`),

      MQ(md`**Problem.** A charge $q$ at distance $a$ from an **isolated, neutral** metal sphere. Find $V$ outside.`,
        figSphereQ({ cond: md`Q=0` }),
        md`1. BCs: $V(R,\theta)=0$ and $V\to0$.
          2. Image $q'=-\dfrac Raq$ at $\dfrac{R^2}{a}$.
          3. $V=\dfrac{1}{4\pi\varepsilon_0}\left(\dfrac q\srm+\dfrac{q'}{\srm'}\right)$ outside.
          4. The force on $q$ is $\dfrac{qq'}{4\pi\varepsilon_0(a-R^2/a)^2}$.`,
        ['BCs', 'image', 'V', 'force'], 0,
        [null, md`Right for the BCs it was given.`, md`Right for that image system.`, md`Right for that image system.`],
        md`Neutral and isolated is not grounded. The BCs are $V(R,\theta)=V_c$ (unknown constant), total charge $0$, $V\to0$. Fix: add $+\dfrac Raq$ at the center. Then $V_c=\dfrac{q}{4\pi\varepsilon_0a}$ and the force is weaker: $F=-\dfrac{q^2}{4\pi\varepsilon_0}\dfrac{R^3(2a^2-R^2)}{a^3(a^2-R^2)^2}$.`),

      MQ(md`**Problem.** An uncharged metal sphere in a field that is uniform far away, $E_0\hat{\mathbf z}$. Find $V$ outside.`,
        figField({ note: 'uncharged metal sphere' }),
        md`1. BCs: $V(R,\theta)=0$ and $V\to0$ as $r\to\infty$.
          2. Region $r>R$: $V=\sum\left(A_\ell r^\ell+B_\ell r^{-(\ell+1)}\right)P_\ell$.
          3. The far condition kills all $A_\ell$; the sphere condition then gives $B_\ell=0$.
          4. So $V=0$ everywhere outside.`,
        ['BCs', 'general solution', 'coefficients', 'result'], 0,
        [null, md`Right.`, md`Correct consequences of step 1.`, md`Correct consequence; the absurd result (no field at all) points back to step 1.`],
        md`In a uniform field $V$ does not go to zero far away: $V\to-E_0r\cos\theta$ (Griffiths 3.74). That **supplies** $A_1=-E_0$; then $B_1=E_0R^3$ from the sphere. Correct: $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$.`),

      MQ(md`**Problem.** A pipe $0<x<b$, $0<y<a$ with the face $x=0$ grounded, $x=b$ at $V_0$, and the faces $y=0$, $y=a$ grounded.`,
        figBox({ top: 'V=0', bot: 'V=0', left: 'V=0', right: 'V_0' }),
        md`1. $y$ has two grounded faces: $\sin(n\pi y/a)$, $k=n\pi/a$.
          2. The region is finite in $x$, so both exponentials are allowed; combine them as $\cosh kx$.
          3. At $x=b$: $\sum C_n\cosh(n\pi b/a)\sin(n\pi y/a)=V_0$, so $C_n\cosh(n\pi b/a)=\dfrac{4V_0}{n\pi}$ for odd $n$.
          4. The center value follows by summing the series at $(b/2,a/2)$.`,
        ['Y and k', 'X', 'Fourier', 'center value'], 1,
        [md`Right.`, null, md`Right algebra for the function chosen in step 2.`, md`Correct procedure, wrong function.`],
        md`Both exponentials are allowed, but the grounded face $x=0$ picks the combination: $V(0,y)=0$ needs $A+B=0$, i.e. $\sinh kx$. $\cosh kx$ is right only when the two $x$-faces have the same potential (Ex. 3.4). Correct: $C_n\sinh(n\pi b/a)=\dfrac{4V_0}{n\pi}$, $X=\sinh(n\pi x/a)$.`),

      MQ(md`**Problem.** An isolated metal sphere with charge $Q$ in a field uniform far away, $E_0\hat{\mathbf z}$. Find $V$ outside.`,
        figField({ q: 'Q', note: 'isolated metal sphere, charge Q' }),
        md`1. BCs: $V(R,\theta)=V_c$; total charge $Q$; $V\to-E_0r\cos\theta$ (choose $C=0$).
          2. Far field: $A_1=-E_0$, all other $A_\ell=0$.
          3. Equipotential sphere: $B_1=E_0R^3$, $B_\ell=0$ for $\ell\ge2$.
          4. A constant potential on the sphere needs no $\ell=0$ term, so $B_0=0$: $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$.`,
        ['BCs', 'far field', 'l ≥ 1 terms', 'l = 0 term'], 3,
        [md`Right: the full set, including the charge.`, md`Right.`, md`Right.`, null],
        md`Step 4 ignores BC "total charge $Q$". Gauss's law on any sphere around it gives $4\pi B_0=Q/\varepsilon_0$, so $B_0=\dfrac{Q}{4\pi\varepsilon_0}$. Correct: $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta+\dfrac{Q}{4\pi\varepsilon_0r}$, with the sphere at $V_c=\dfrac{Q}{4\pi\varepsilon_0R}$.`),

      MQ(md`**Problem.** A thin shell of radius $R$ carries $\sigma_0(\theta)=k\cos\theta$ (no metal). Find $V$ inside.`,
        figShell({ lab: md`k\cos\theta` }),
        md`1. $V_{\text{in}}=\sum A_\ell r^\ell P_\ell$, $V_{\text{out}}=\sum B_\ell r^{-(\ell+1)}P_\ell$.
          2. Continuity at $R$: $B_\ell=A_\ell R^{2\ell+1}$.
          3. Jump: $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=+\sigma_0/\varepsilon_0$ at $r=R$.
          4. Only $\ell=1$: $-3A_1=k/\varepsilon_0$, so $V_{\text{in}}=-\dfrac{k}{3\varepsilon_0}r\cos\theta$.`,
        ['general forms', 'continuity', 'jump', 'result'], 2,
        [md`Right: finite at the origin inside, zero at infinity outside.`, md`Right.`, null, md`Correct algebra; the sign was lost in step 3.`],
        md`$E_r$ jumps **up** by $\sigma/\varepsilon_0$ going outward, so $\partial_rV=-E_r$ jumps **down**: $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\sigma_0/\varepsilon_0$ (Griffiths 2.36). Correct: $A_1=+\dfrac{k}{3\varepsilon_0}$, $V_{\text{in}}=\dfrac{k}{3\varepsilon_0}z$. Sanity check: the field inside should run from the positive north cap to the negative south cap, i.e. along $-\hat{\mathbf z}$; the wrong answer has it backwards.`),

      MQ(md`**Problem.** Half of a symmetric slot: $V=0$ on the plate $y=0$, the midplane $y=a$ is a mirror plane, end at $x=0$ held at $V_0$.`,
        figSlot({ top: md`\partial V/\partial y=0`, topMirror: true, bot: 'V=0', end: 'V_0' }),
        md`1. $V=0$ at $y=0$ gives $Y=\sin ky$.
          2. $V\to0$ as $x\to\infty$ gives $X=e^{-kx}$.
          3. The top boundary $y=a$ requires $\sin ka=0$, so $k=n\pi/a$.
          4. Fourier's trick on $0<y<a$ with $\sin(n\pi y/a)$.`,
        ['Y', 'X', 'quantize k', 'Fourier'], 2,
        [md`Right.`, md`Right.`, null, md`Follows step 3; with the right $k$ the same trick works on the right functions.`],
        md`The top is a mirror plane, so the condition there is $\partial V/\partial y=0$: $k\cos ka=0$, so $k=(n-\tfrac12)\pi/a$. With $\sin ka=0$ every mode would vanish on the midplane, which describes a grounded plate there, a different problem.`),

      MQ(md`**Problem.** Two grounded half-planes at $90^\circ$ with a charge $q$ at $(a,b)$.`,
        figCorner({}),
        md`1. Region $x>0$, $y>0$; BCs: $V=0$ on both half-planes, $V\to0$.
          2. The wall $x=0$ needs an image $-q$ at $(-a,b)$.
          3. The floor $y=0$ needs an image $-q$ at $(a,-b)$.
          4. These two images make both half-planes equipotentials, so $V=\dfrac{q}{4\pi\varepsilon_0}\left[\dfrac1{\srm}-\dfrac1{\srm_1}-\dfrac1{\srm_2}\right]$.`,
        ['BCs', 'first image', 'second image', 'claim and V'], 3,
        [md`Right.`, md`Right, as far as it goes.`, md`Right, as far as it goes.`, null],
        md`Each new image spoils the other plane: on the wall $x=0$, the image $-q$ at $(a,-b)$ has no partner. A third image $+q$ at $(-a,-b)$ pairs with both $-q$'s and fixes both planes. Always check every BC with the full image set.`),

      MQ(md`**Problem.** Both slot plates are held at $V_1$; the end strip at $x=0$ is at $V_0$.`,
        figSlot({ top: 'V_1', bot: 'V_1', end: 'V_0' }),
        md`1. BCs: $V=V_1$ on both plates, $V(0,y)=V_0$, $V\to0$ as $x\to\infty$.
          2. Write $V=V_1+\tilde V$.
          3. $\tilde V$ is zero on both plates and $V_0-V_1$ on the end.
          4. $\tilde V=\dfrac{4(V_0-V_1)}{\pi}\displaystyle\sum_{\text{odd }n}\dfrac1ne^{-n\pi x/a}\sin\dfrac{n\pi y}{a}$.`,
        ['BCs', 'shift', 'shifted BCs', 'series'], 0,
        [null, md`A good move.`, md`Right.`, md`Right, and it actually satisfies $V\to V_1$, contradicting step 1.`],
        md`Far down the slot you are between two plates at $V_1$, so $V\to V_1$, not $0$. Steps 2–4 are correct and give a $V$ that tends to $V_1$, which shows that step 1's far condition was inconsistent with the plates.`),

      MQ(md`**Problem.** The plane $y=0$ carries $\sigma_0\sin kx$; no other charges. Find $V$.`,
        figSheet({}),
        md`1. In each half-space $V=(Ae^{ky}+Be^{-ky})\sin kx$.
          2. $V\to0$ far away keeps $e^{-ky}$ in both half-spaces.
          3. Continuity at $y=0$: the two amplitudes are equal.
          4. Jump: $\partial_yV\big|_{0^+}-\partial_yV\big|_{0^-}=-\sigma_0\sin kx/\varepsilon_0$.`,
        ['separated form', 'far-field', 'continuity', 'jump'], 1,
        [md`Right: the source picks $\sin kx$.`, null, md`Right.`, md`Right, but with step 2's functions both slopes are equal and the jump comes out $0$, a contradiction.`],
        md`Below the sheet, $y\to-\infty$, and $e^{-ky}$ blows up there. Keep $e^{+ky}$ below: $V=Ce^{-k|y|}\sin kx$ with $C=\tfrac{\sigma_0}{2\varepsilon_0k}$. With $e^{-ky}$ on both sides there is no kink, hence no charge, and the jump condition can't be met.`),

      RF(md`
        !!key Patterns to remember (the error list)
          - Wrong region boundary: $V\to0$ for an inside problem, "finite at $0$" for an outside one, $V\to0$ in a uniform field or between plates at $V_1$.
          - Wrong kind of condition: neutral or isolated treated as grounded; a total charge forgotten ($B_0$).
          - Wrong function: $\cos$ where $V=0$; $\cosh$ next to a grounded face; $e^{-ky}$ on the $y<0$ side.
          - Wrong quantization: the length of the wrong direction; $\sin ka=0$ at a mirror plane.
          - Images: inside the region, or too few (corner).
          - Signs: $\hat{\mathbf n}$ into the metal; the jump written as $+\sigma/\varepsilon_0$.
          - Totals: induced charge on a grounded sphere is $q'$, not $-q$; on a cavity wall it is $-q$, not $q'$.
      `),
    ],
  });

  // =====================================================================================
  // Lesson 8. Boundary-value problem drill
  // =====================================================================================
  // charge on the axis above a grounded plane with a hemispherical bump: the image system
  function figBumpImg() {
    const f = fig();
    const y0 = 170, cx = 160, R = 52, A = 104, b = R * R / A;
    f.line(20, y0, 300, y0, { cls: 'dash dim' });
    f.circle(cx, y0, R, { cls: 'dash dim' });
    f.line(cx, y0 - A - 24, cx, y0 + A + 24, { cls: 'dim thin' });
    f.charge(cx, y0 - A, { q: '+', lab: 'q', at: 'r' });
    f.charge(cx, y0 - b, { q: '-', lab: md`-\tfrac{R}{a}q`, at: 'r', image: true, r: 6 });
    f.charge(cx, y0 + b, { q: '+', lab: md`+\tfrac{R}{a}q`, at: 'r', image: true, r: 6 });
    f.charge(cx, y0 + A, { q: '-', lab: '-q', at: 'r', image: true });
    f.label(296, y0 - 4, 'z=0', 'br', 'small accent');
    return f.svg();
  }
  // images of a charge between two grounded parallel planes (a few periods shown)
  function figParImg() {
    const f = fig();
    const x = 150, Y = (h) => 210 - h, L = 60, z0 = 15;
    for (const k of [-2, -1, 0, 1, 2]) f.line(40, Y(k * L), 270, Y(k * L), { cls: k === 0 || k === 1 ? 'dash' : 'dash dim' });
    f.line(x, Y(-150), x, Y(165), { cls: 'dim thin' });
    f.charge(x, Y(z0), { q: '+', lab: 'q', at: 'r' });
    const im = [[-z0, '-'], [-2 * L + z0, '+'], [-2 * L - z0, '-'], [2 * L - z0, '-'], [2 * L + z0, '+']];
    for (const [h, s] of im) f.charge(x, Y(h), { q: s, lab: s === '+' ? '+q' : '-q', at: 'r', image: true, r: 6 });
    f.label(274, Y(0) - 3, 'z=0', 'bl', 'small accent'); f.label(274, Y(L) - 3, 'z=L', 'bl', 'small accent');
    return f.svg();
  }
  const plotCubeZ = () => PF.plot({ w: 300, h: 180, x: [0, 1], y: [0, 1.15], xl: 'z/a', yl: md`V/V_0`, xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1'], [0.1072, '0.107']],
    curves: [{ f: (z) => Math.sinh(Math.SQRT2 * Math.PI * z) / Math.sinh(Math.SQRT2 * Math.PI) }], ml: 50 });

  LESSONS.push({
    id: 'ub-drill', title: 'Boundary-value problem drill',
    steps: [
      RF(md`
        Full exam-style problems. Every solution starts the way the lectures do: name the region, then a numbered BC list. Do the same on paper before you touch the algebra.

        !!method The boundary-value recipe
          1. Draw the region and name it.
          2. Write the BC list: one line per boundary piece, plus infinity or the origin only if the region reaches them.
          3. Pick the method: images (point charges near planes and spheres), Cartesian separation (flat faces), spherical separation (spheres, uniform fields), or recognise a solution you already have.
          4. Say what each BC does: kills a term, quantizes $k$, fixes coefficients, places an image.
          5. Solve.
          6. Check the answer against **every** BC, and one limit.

        | Words | Condition | What it usually does |
        |---|---|---|
        | grounded / held at $V_0$ | $V=0$ / $V=V_0$ on the surface | fixes coefficients; a zero face kills $\cos$ or $\cosh$ |
        | neutral / charge $Q$ | $V=V_c$ unknown and $\oint\sigma\,da=Q$ | center image $Q-q'$; $B_0=Q/(4\pi\varepsilon_0)$ |
        | far away | $V\to0$ | kills $e^{kx}$ or $A_\ell$ |
        | uniform field far away | $V\to-E_0r\cos\theta+C$ | supplies $A_1=-E_0$ |
        | contains the origin | finite at $r=0$ | kills $B_\ell$ |
        | mirror plane | $V=0$ (odd) or $\partial V/\partial n=0$ (even) | halves the region |
        | glued charge $\sigma$ | $V$ continuous; $\partial_nV$ jumps by $-\sigma/\varepsilon_0$ | links two regions |
      `),

      Q(md`A classmate's answer for $V$ between a sphere at $V_0\cos\theta$ (radius $a$) and a grounded shell (radius $b$) is $V=V_0\dfrac{a^2}{r^2}\cos\theta$. Which BC does it violate?`,
        [md`$V(a,\theta)=V_0\cos\theta$`, md`$V(b,\theta)=0$`, md`Laplace's equation between the spheres`, md`None; it's correct`], 1,
        [md`At $r=a$ it gives $V_0\cos\theta$: that one holds.`, null, md`$\cos\theta/r^2$ is a solution of Laplace's equation.`, md`At $r=b$ it gives $V_0(a/b)^2\cos\theta\neq0$.`],
        md`It's the outside solution for an **isolated** sphere ($V\to0$ at infinity). With a grounded shell at $b$ you need the $r\cos\theta$ term too, so that the two together vanish at $r=b$. Always plug the final answer into each BC.`,
        { figHtml: figConc({ inner: md`V_0\cos\theta`, outer: 'V=0', outerMetal: true }) }),

      Q(md`For the slot with both plates at $V_1$ and the end at $V_0$, someone writes $V=\dfrac{4(V_0-V_1)}{\pi}\displaystyle\sum_{\text{odd }n}\dfrac1ne^{-n\pi x/a}\sin\dfrac{n\pi y}{a}$. Which BC fails?`,
        [md`$V=V_1$ on the plates (this gives $0$ there)`, md`$V\to0$ far away`, md`Laplace's equation`, md`$V(0,y)=V_0$ only`], 0,
        [null, md`The correct far condition is $V\to V_1$, and this answer gives $0$, so it fails that too; but the first failure is on the plates.`, md`Each term solves Laplace's equation.`, md`At $x=0$ it gives $V_0-V_1$, so this fails as well, but because the constant $V_1$ was dropped everywhere.`],
        md`The series is $\tilde V=V-V_1$. Forgetting to add back $V_1$ breaks every boundary value: plates ($0$ instead of $V_1$), end ($V_0-V_1$ instead of $V_0$), far end ($0$ instead of $V_1$). The fix is one term: $V=V_1+\tilde V$.`,
        { figHtml: figSlot({ top: 'V_1', bot: 'V_1', end: 'V_0' }) }),

      Q(md`For the charge sheet $\sigma_0\cos kx$ at height $d$ above a grounded plane, an answer reads $V=\dfrac{\sigma_0}{2\varepsilon_0k}\cos kx\,e^{-k|y|}$ for all $y>-d$ (sheet at $y=0$, plane at $y=-d$). Which BC fails?`,
        [md`$V\to0$ as $y\to\infty$`, md`continuity at the sheet`, md`$V=0$ on the grounded plane $y=-d$`, md`the jump at the sheet`], 2,
        [md`$e^{-ky}$ does vanish far above.`, md`$e^{-k|y|}$ is continuous.`, null, md`The jump is right: it's the free-sheet solution.`],
        md`At $y=-d$ it gives $\tfrac{\sigma_0}{2\varepsilon_0k}e^{-kd}\cos kx\neq0$. Below the sheet the function must be $\sinh k(y+d)$, which vanishes on the plane. The free-sheet answer ignores the conductor.`,
        { figHtml: figSheet({ plane: true, cos: true, lab: md`\sigma_0\cos kx` }) }),

      Q(md`For an isolated sphere with charge $Q$ in a uniform field, an answer reads $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta+\dfrac{Q}{4\pi\varepsilon_0R}$. Which condition fails?`,
        [md`$V\to-E_0r\cos\theta+C$`, md`The sphere is an equipotential`, md`Laplace's equation outside`, md`The total charge on the sphere is $Q$`], 3,
        [md`It holds with $C=\tfrac{Q}{4\pi\varepsilon_0R}$.`, md`On $r=R$, $V=\tfrac{Q}{4\pi\varepsilon_0R}$ for all $\theta$: it holds.`, md`A constant solves Laplace's equation.`, null],
        md`A constant carries no flux: $B_0=0$, so this sphere is neutral. The charge must appear as $\dfrac{Q}{4\pi\varepsilon_0r}$, which also takes the value $\dfrac{Q}{4\pi\varepsilon_0R}$ on the sphere but falls off outside. Constant versus $1/r$ is exactly the difference between "shift the zero" and "add charge".`,
        { figHtml: figField({ q: 'Q', note: 'isolated metal sphere, charge Q' }) }),

      Q(md`For the cube with five grounded faces and the top at $V_0\sin(\pi x/a)\sin(\pi y/a)$, an answer reads $V=V_0\sin\dfrac{\pi x}{a}\sin\dfrac{\pi y}{a}\dfrac{\cosh(\sqrt2\pi z/a)}{\cosh\sqrt2\pi}$. Which BC fails?`,
        [md`The side faces $x=0,a$ and $y=0,a$`, md`The top face`, md`The bottom face $z=0$`, md`Laplace's equation`], 2,
        [md`$\sin(\pi x/a)\sin(\pi y/a)$ vanishes on all four sides.`, md`At $z=a$ the $\cosh$ ratio is $1$: the top matches.`, null, md`$(-\pi^2/a^2-\pi^2/a^2+2\pi^2/a^2)V=0$: it solves Laplace's equation.`],
        md`At $z=0$, $\cosh0=1$, so $V\neq0$ on the grounded bottom. A grounded face at $z=0$ needs $\sinh$: $V=V_0\sin\dfrac{\pi x}{a}\sin\dfrac{\pi y}{a}\dfrac{\sinh(\sqrt2\pi z/a)}{\sinh\sqrt2\pi}$.`,
        { figHtml: figCube({ top: md`V_{\text{top}}`, note: 'five faces grounded' }) }),

      Q(md`For a charge $q$ above a grounded plane with a hemispherical bump, a student uses the images $-\tfrac Raq$ at $R^2/a$ and $-q$ at $-a$ (on the axis) and stops. Which BCs fail?`,
        [md`Only $V\to0$`, md`Only the plane`, md`Only the bump`, md`Both the plane and the bump`], 3,
        [md`All terms decay at infinity.`, md`The bump fails too: $-q$ at $-a$ has no Kelvin partner for the sphere.`, md`The plane fails too: $-\tfrac Raq$ at $R^2/a$ has no mirror partner below the plane.`, null],
        md`$q$ and $-\tfrac Raq$ (at $R^2/a$) cancel on the sphere; $q$ and $-q$ (at $-a$) cancel on the plane. Each of the two images is left unpaired on the other surface. The fourth charge $+\tfrac Raq$ at $-R^2/a$ is the mirror of the first image and the Kelvin image of the second, and fixes both.`,
        { figHtml: figBump({ charge: true, plab: 'V=0' }) }),

      P({
        id: 'ub-d1', title: 'Slot with both plates at V₁', big: true,
        q: md`Two parallel metal plates at $y=0$ and $y=a$, both held at $V_1$, extend to $x\to\infty$. The end strip at $x=0$, insulated from them, is held at $V_0$.

          (a) Find $V(x,y)$: give the coefficient $C_n$ of $e^{-n\pi x/a}\sin(n\pi y/a)$ for odd $n$ in the series part.
          (b) For $V_0=100$ V and $V_1=20$ V, find $V$ at $(a/2,\,a/2)$.
          (c) What is $V$ far down the slot?`,
        figHtml: figSlot({ top: 'V_1', bot: 'V_1', end: 'V_0', pt: [55 / 230, 0.5] }),
        hints: [
          md`BC list first. The far condition is not $V\to0$: far away you're between two plates at $V_1$.`,
          md`Write $V=V_1+\tilde V$. Then $\tilde V$ satisfies the ordinary slot BCs with $V_0-V_1$ on the end.`,
          md`For (b), sum a few terms of $\sin(n\pi/2)e^{-n\pi/2}/n$, or use Griffiths' closed form $\tilde V=\dfrac{2(V_0-V_1)}{\pi}\tan^{-1}\dfrac{\sin(\pi y/a)}{\sinh(\pi x/a)}$.`,
        ],
        parts: [
          { lbl: md`C_n`, expr: '4*(V0-V1)/(n*pi)', vars: { V0: [3, 5], V1: [1, 2], n: [1, 7] } },
          { lbl: md`V(a/2,a/2)`, ans: 40.877, unit: 'V' },
          { lbl: md`(c) Far down the slot, $V\to$`, mc: [md`$0$`, md`$V_0$`, md`$V_1$`, md`$(V_0+V_1)/2$`], a: 2,
            why: [md`The plates aren't at $0$.`, md`The end's influence dies like $e^{-\pi x/a}$.`, null, md`Nothing averages the two; far away only the plates matter.`] },
        ],
        sol: md`
          **Region:** $0<y<a$, $x>0$. **BCs:**
          1. $V(x,0)=V_1$
          2. $V(x,a)=V_1$
          3. $V(0,y)=V_0$
          4. $V\to V_1$ as $x\to\infty$

          **Shift.** $V=V_1+\tilde V$. Then 1. $\tilde V(x,0)=0$, 2. $\tilde V(x,a)=0$, 3. $\tilde V(0,y)=V_0-V_1$, 4. $\tilde V\to0$: Lecture 11–12's slot.

          [[fig:bc]]

          BC #1 kills $\cos ky$, BC #4 kills $e^{kx}$, BC #2 quantizes $k=n\pi/a$, BC #3 by Fourier's trick:
          $$C_n=\frac2a\int_0^a(V_0-V_1)\sin\frac{n\pi y}{a}\,dy=\frac{2(V_0-V_1)}{n\pi}(1-\cos n\pi)=\begin{cases}\dfrac{4(V_0-V_1)}{n\pi}&n\text{ odd}\\0&n\text{ even}\end{cases}$$
          $$V(x,y)=V_1+\frac{4(V_0-V_1)}{\pi}\sum_{n\text{ odd}}\frac1n\,e^{-n\pi x/a}\sin\frac{n\pi y}{a}.$$

          **(b)** At $(a/2,a/2)$, $\sin(n\pi/2)=+1,-1,+1,\dots$ for $n=1,3,5$:
          $$\tilde V=\frac{4(80)}{\pi}\left[e^{-\pi/2}-\tfrac13e^{-3\pi/2}+\tfrac15e^{-5\pi/2}-\cdots\right]=101.86\times[0.20788-0.00299+0.00008]=20.88\text{ V},$$
          so $V=40.88$ V. (Closed form: $\tfrac{2(80)}{\pi}\tan^{-1}\tfrac{1}{\sinh(\pi/2)}=50.93\times0.4099=20.88$ V ✓.)

          **(c)** $V_1$.

          **Checks.** Plates: every sine vanishes, $V=V_1$ ✓. End: the series is the Fourier series of $V_0-V_1$, so $V=V_0$ ✓. Far: $V\to V_1$ ✓. Midpoint value lies between $V_1$ and $V_0$, as the no-extremum rule demands.

          **What to remember:** a nonzero but common plate potential is a constant you subtract first. The far-field condition is "tends to the plates-only solution", which here is $V_1$.
        `,
        figs: { bc: { svg: figSlot({ top: md`\#2\ \tilde V=0`, bot: md`\#1\ \tilde V=0`, end: md`\#3\ V_0-V_1`, far: md`\#4\ \tilde V\to0` }), cap: 'BCs for $\\tilde V=V-V_1$: the ordinary slot.' } },
      }),

      P({
        id: 'ub-d2', title: 'Square pipe with two adjacent live faces', big: true,
        q: md`A long square pipe of side $a$. The face $x=0$ is held at $V_1$ and the face $y=0$ at $V_2$; the faces $x=a$ and $y=a$ are grounded (insulated corners).

          (a) What is $V$ at the center?
          (b) Take $V_1=V_2=V_0$. Find $V$ at $(a/2,\,a/4)$ in units of $V_0$.
          (c) Take $V_2=-V_1$. Where inside is $V=0$?`,
        figHtml: figBox({ w: 130, h: 130, left: 'V_1', bot: 'V_2', top: '0', right: '0', c1: '(a,a)', center: true, pts: [[0.5, 0.25, 'P', 'r']] }),
        hints: [
          md`Two live faces: split into two one-live-face problems and add.`,
          md`Center: four faces at the same value would give that value everywhere, so each face contributes a quarter of its potential at the center.`,
          md`For (b): the piece with $x=0$ live is $\sum_{\text{odd }n}\dfrac{4V_0}{n\pi}\dfrac{\sinh(n\pi(a-x)/a)}{\sinh n\pi}\sin\dfrac{n\pi y}{a}$; the other piece is the same with $x\leftrightarrow y$.`,
        ],
        parts: [
          { lbl: md`V_{\text{center}}`, expr: '(V1+V2)/4', vars: { V1: [1, 3], V2: [1, 3] } },
          { lbl: md`V(a/2,a/4)/V_0`, ans: 0.7226, unit: '' },
          { lbl: md`(c) With $V_2=-V_1$, $V=0$ on`, mc: [md`the line $x=a/2$`, md`the diagonal $y=a-x$`, md`nowhere inside`, md`the diagonal $y=x$`], a: 3,
            why: [md`Reflecting in $x=a/2$ doesn't map the setup onto itself (with or without a sign flip).`, md`Reflection in $y=a-x$ maps the live faces onto the grounded ones; it isn't a symmetry.`, md`$V$ takes both signs inside and is continuous, so it vanishes on some curve.`, null] },
        ],
        sol: md`
          **Region:** $0<x<a$, $0<y<a$. **BCs:**
          1. $V(0,y)=V_1$
          2. $V(x,0)=V_2$
          3. $V(a,y)=0$
          4. $V(x,a)=0$

          **Split:** $V=V_{(1)}+V_{(2)}$, where $V_{(1)}$ has $V_1$ on $x=0$ and $0$ on the other three faces, and $V_{(2)}$ has $V_2$ on $y=0$ and $0$ elsewhere. Each satisfies Laplace's equation; on every face their sum equals the given value.

          [[fig:split]]

          For $V_{(1)}$: two zero faces in $y$ give $\sin(n\pi y/a)$; zero at $x=a$ gives $\sinh(n\pi(a-x)/a)$; the face $x=0$ gives $C_n\sinh n\pi=\tfrac{4V_1}{n\pi}$ (odd $n$):
          $$V_{(1)}=\frac{4V_1}{\pi}\sum_{n\text{ odd}}\frac{\sinh\big(n\pi(a-x)/a\big)}{n\sinh n\pi}\sin\frac{n\pi y}{a},$$
          and $V_{(2)}$ is the same with $x\leftrightarrow y$ and $V_1\to V_2$.

          **(a)** Each face contributes a quarter of its value at the center: $V=\dfrac{V_1+V_2}{4}$.

          **(b)** With $V_1=V_2=V_0$: $V(a/2,a/4)=V_{(1)}(a/2,a/4)+V_{(2)}(a/2,a/4)$. Summing (odd $n$ to $n=7$): $V_{(1)}=0.1820V_0$, $V_{(2)}=0.5405V_0$ (it's $V_{(1)}$ evaluated at $(a/4,a/2)$), total $0.7226V_0$. Closer to the live bottom face, so bigger than the center's $0.5V_0$.

          **(c)** Reflection in the diagonal $y=x$ swaps the two live faces and the two grounded faces. With $V_2=-V_1$ it maps $V$ to $-V$: $V(y,x)=-V(x,y)$, so $V=0$ on the diagonal (an antisymmetric mirror line, like an image plane).

          **What to remember:** one live face per subproblem; symmetry gives centers and nodal lines for free.
        `,
        figs: { split: { svg: split3({ o: { left: 'V_1', bot: 'V_2', top: '0', right: '0' }, cap: 'the problem' }, { o: { left: 'V_1', bot: '0', top: '0', right: '0' }, cap: md`$V_{(1)}$` }, { o: { left: '0', bot: 'V_2', top: '0', right: '0' }, cap: md`$V_{(2)}$` }), cap: 'Split into one-live-face problems, then add.' } },
      }),

      P({
        id: 'ub-d3', title: 'A charge pattern above a grounded plane', big: true,
        q: md`The plane $y=0$ carries $\sigma(x)=\sigma_0\cos kx$. A grounded conducting plane lies at $y=-d$. There are no other charges.

          (a) Find the amplitude of $V$ on the sheet, i.e. $V(0,0)$.
          (b) Find the charge induced on the grounded plane, $\sigma_{\text{ind}}(x)$.
          (c) What happens as $kd\to0$?`,
        figHtml: figSheet({ plane: true, cos: true, lab: md`\sigma_0\cos kx` }),
        hints: [
          md`Two regions: $-d<y<0$ and $y>0$. Write five things: the plane, far above, continuity, jump (and the separated form in each region).`,
          md`Above: $Be^{-ky}\cos kx$. Between: $A\sinh\big(k(y+d)\big)\cos kx$, which already vanishes on the plane.`,
          md`Continuity: $A\sinh kd=B$. Jump: $-kB-kA\cosh kd=-\sigma_0/\varepsilon_0$. Then $\sigma_{\text{ind}}=-\varepsilon_0\partial_yV$ at $y=-d$ with $\hat{\mathbf n}=+\hat{\mathbf y}$.`,
        ],
        parts: [
          { lbl: md`V(0,0)`, expr: 'sigma0/(2*eps0*k)*(1-exp(-2*k*d))', vars: { sigma0: [1, 2], eps0: [0.5, 2], k: [0.5, 2], d: [0.2, 1.5] }, accepts: ['sigma0*sinh(k*d)*exp(-k*d)/(eps0*k)', 'sigma0/(eps0*k*(1+cosh(k*d)/sinh(k*d)))'] },
          { lbl: md`\sigma_{\text{ind}}(x)`, expr: '-sigma0*exp(-k*d)*cos(k*x)', vars: { sigma0: [1, 2], k: [0.5, 2], d: [0.2, 1.5], x: [0.1, 0.6] } },
          { lbl: md`(c) As $kd\to0$:`, mc: [md`$V$ on the sheet doubles`, md`Nothing changes; the plane is irrelevant`, md`$V$ on the sheet $\to0$ and $\sigma_{\text{ind}}\to-\sigma_0\cos kx$: the plane cancels the sheet`, md`$\sigma_{\text{ind}}\to0$`], a: 2,
            why: [md`$1-e^{-2kd}\to0$: it vanishes.`, md`A grounded plane right under the sheet pins $V$ near zero.`, null, md`That's the opposite limit, $kd\to\infty$.`] },
        ],
        sol: md`
          **Regions:** I: $-d<y<0$; II: $y>0$. **BCs:**
          1. $V(x,-d)=0$ (grounded plane)
          2. $V\to0$ as $y\to\infty$
          3. $V_{\text{I}}(x,0)=V_{\text{II}}(x,0)$
          4. $\partial_yV_{\text{II}}-\partial_yV_{\text{I}}=-\dfrac{\sigma_0\cos kx}{\varepsilon_0}$ at $y=0$

          [[fig:bc]]

          The source picks $\cos kx$. BC #2: $V_{\text{II}}=Be^{-ky}\cos kx$. BC #1: $V_{\text{I}}=A\sinh\big(k(y+d)\big)\cos kx$ (the combination of $e^{\pm ky}$ that vanishes at $y=-d$).
          - BC #3: $A\sinh kd=B$.
          - BC #4: $-kB-kA\cosh kd=-\sigma_0/\varepsilon_0$, so $kB(1+\coth kd)=\sigma_0/\varepsilon_0$.

          $$B=\frac{\sigma_0\sinh kd}{\varepsilon_0k(\sinh kd+\cosh kd)}=\frac{\sigma_0}{\varepsilon_0k}\sinh kd\,e^{-kd}=\frac{\sigma_0}{2\varepsilon_0k}\left(1-e^{-2kd}\right),\qquad A=\frac{\sigma_0}{\varepsilon_0k}e^{-kd}.$$

          **(a)** $V(0,0)=B=\dfrac{\sigma_0}{2\varepsilon_0k}\left(1-e^{-2kd}\right)$.

          **(b)** At the plane the field region is above it, $\hat{\mathbf n}=+\hat{\mathbf y}$: $\sigma_{\text{ind}}=-\varepsilon_0\partial_yV_{\text{I}}\big|_{-d}=-\varepsilon_0kA\cos kx=-\sigma_0e^{-kd}\cos kx$.

          **(c)** $kd\to0$: $B\to0$ and $\sigma_{\text{ind}}\to-\sigma_0\cos kx$; the plane's charge cancels the sheet's. $kd\to\infty$: $B\to\tfrac{\sigma_0}{2\varepsilon_0k}$ (the free sheet) and $\sigma_{\text{ind}}\to0$.

          **Image check.** The answer is the free sheet plus an image sheet $-\sigma_0\cos kx$ at $y=-2d$: on the sheet, $\tfrac{\sigma_0}{2\varepsilon_0k}(1-e^{-2kd})$ ✓. Images work for charge sheets too.

          **What to remember:** a grounded face in a separated region selects $\sinh$ of the distance from it; the induced charge falls off like $e^{-kd}$, the same decay as the field.
        `,
        figs: { bc: { svg: figSheet({ plane: true, cos: true, lab: md`\#3,\ \#4\ \text{at}\ y=0`, plab: md`\#1\ V=0` }), cap: 'BC #1 on the plane, #3 and #4 at the sheet, #2 far above.' } },
      }),

      P({
        id: 'ub-d4', title: 'Between two spheres', big: true,
        q: md`The inner sphere (radius $a$) is held at $V_0\cos\theta$. The concentric outer shell (radius $b$) is grounded.

          (a) Find $V(r,\theta)$ for $a<r<b$.
          (b) Find the charge density induced on the outer shell (on its inner surface).
          (c) Check: what does $V$ become as $b\to\infty$?`,
        figHtml: figConc({ inner: md`V_0\cos\theta`, outer: 'V=0', outerMetal: true }),
        hints: [
          md`Region $a<r<b$: neither the origin nor infinity, so keep both $A_\ell r^\ell$ and $B_\ell r^{-(\ell+1)}$.`,
          md`Both boundary values are pure $P_1$ (or zero), so only $\ell=1$: $V=(Ar+B/r^2)\cos\theta$.`,
          md`$Aa+B/a^2=V_0$ and $Ab+B/b^2=0$. For $\sigma$ on the shell, $\hat{\mathbf n}=-\hat{\mathbf r}$.`,
        ],
        parts: [
          { lbl: md`V(r,\theta)`, expr: 'V0*a^2*(b^3/r^2 - r)*cos(theta)/(b^3-a^3)', vars: { V0: [1, 2], a: [1, 1.5], b: [2.5, 3.5], r: [1.6, 2.4], theta: [0.2, 2.9] }, accepts: ['V0*a^2*(r - b^3/r^2)*cos(theta)/(a^3-b^3)'] },
          { lbl: md`\sigma_b(\theta)`, expr: '-3*eps0*V0*a^2*cos(theta)/(b^3-a^3)', vars: { eps0: [0.5, 2], V0: [1, 2], a: [1, 1.5], b: [2.5, 3.5], theta: [0.2, 2.9] } },
          { lbl: md`(c) As $b\to\infty$:`, mc: [md`$V\to V_0\dfrac{r}{a}\cos\theta$`, md`$V\to V_0\dfrac{a^2}{r^2}\cos\theta$, the outside solution for an isolated sphere`, md`$V\to0$`, md`$V\to V_0\cos\theta$`], a: 1,
            why: [md`That's the inside solution; it grows with $r$.`, null, md`The inner sphere still drives a field.`, md`That would mean no $r$-dependence at all.`] },
        ],
        sol: md`
          **Region:** $a<r<b$. **BCs:**
          1. $V(a,\theta)=V_0\cos\theta$
          2. $V(b,\theta)=0$

          No regularity or far-field condition: the region contains neither $r=0$ nor $\infty$, so both families stay.

          [[fig:bc]]

          Both boundary values are multiples of $P_1$, so by orthogonality only $\ell=1$ survives: $V=\left(Ar+\dfrac{B}{r^2}\right)\cos\theta$.
          - BC #2: $Ab+\dfrac{B}{b^2}=0$, so $B=-Ab^3$.
          - BC #1: $A\left(a-\dfrac{b^3}{a^2}\right)=V_0$, so $A=-\dfrac{V_0a^2}{b^3-a^3}$, $B=\dfrac{V_0a^2b^3}{b^3-a^3}$.

          **(a)** $V(r,\theta)=\dfrac{V_0a^2}{b^3-a^3}\left(\dfrac{b^3}{r^2}-r\right)\cos\theta$.

          **(b)** The field region is inside the shell, so $\hat{\mathbf n}=-\hat{\mathbf r}$ and $\sigma=+\varepsilon_0\partial_rV\big|_b=\varepsilon_0\dfrac{V_0a^2}{b^3-a^3}\left(-2-1\right)\cos\theta=-\dfrac{3\varepsilon_0V_0a^2}{b^3-a^3}\cos\theta$. Negative on the north side, facing the positive part of the inner sphere ✓.

          **(c)** $b\to\infty$: $\dfrac{a^2b^3}{b^3-a^3}\to a^2$ and the $-r$ term's coefficient $\to0$, so $V\to V_0\dfrac{a^2}{r^2}\cos\theta$ ✓.

          **Checks.** $r=a$: $\dfrac{V_0a^2}{b^3-a^3}\cdot\dfrac{b^3-a^3}{a^2}\cos\theta=V_0\cos\theta$ ✓. $r=b$: $b-b=0$ ✓.

          **What to remember:** a shell region keeps both radial powers; two surfaces, two equations per $\ell$.
        `,
        figs: { bc: { svg: figConc({ inner: md`\#1\ V_0\cos\theta`, outer: md`\#2\ V=0`, outerMetal: true }), cap: 'Two boundaries, two conditions per $\\ell$; nothing at $r=0$ or $\\infty$.' } },
      }),

      P({
        id: 'ub-d5', title: 'The bump in a field: induced charge', big: true,
        q: md`A grounded conducting plane has a hemispherical bump of radius $R$; far away the field is uniform, $E_0\hat{\mathbf z}$.

          (a) Find $\sigma$ at the top of the bump.
          (b) Find $\sigma$ on the plane far from the bump.
          (c) Find the total charge on the bump.
          (d) At what polar angle $\theta$ on the bump does $\sigma$ equal its value far out on the plane? Give it in degrees.`,
        figHtml: figBump({ field: true, plab: 'V=0' }),
        hints: [
          md`BC list: $V=0$ on the plane, $V=0$ on the bump, $V\to-E_0z$. Which known solution meets all three?`,
          md`$V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$. On the bump $\hat{\mathbf n}=\hat{\mathbf r}$; on the plane $\hat{\mathbf n}=\hat{\mathbf z}$.`,
          md`Total charge: $\int_0^{\pi/2}\sigma\,2\pi R^2\sin\theta\,d\theta$.`,
        ],
        parts: [
          { lbl: md`\sigma_{\text{top}}`, expr: '3*eps0*E0', vars: { eps0: [0.5, 2], E0: [1, 3] } },
          { lbl: md`\sigma_{\text{far}}`, expr: 'eps0*E0', vars: { eps0: [0.5, 2], E0: [1, 3] } },
          { lbl: md`Q_{\text{bump}}`, expr: '3*pi*eps0*E0*R^2', vars: { eps0: [0.5, 2], E0: [1, 3], R: [1, 2] } },
          { lbl: md`\theta`, ans: 70.53, unit: 'deg' },
        ],
        sol: md`
          **Region:** above the plane and outside the bump. **BCs:**
          1. $V=0$ on $z=0$ ($s>R$)
          2. $V=0$ on $r=R$, $z>0$
          3. $V\to-E_0z$ far away

          [[fig:bc]]

          The sphere-in-field potential $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta$ satisfies Laplace's equation in the region, vanishes at $\theta=\pi/2$ (BC #1) and at $r=R$ (BC #2), and tends to $-E_0r\cos\theta=-E_0z$ (BC #3). By uniqueness it is the answer.

          **(a)** On the bump: $\sigma=-\varepsilon_0\partial_rV\big|_R=\varepsilon_0E_0\left(1+\dfrac{2R^3}{R^3}\right)\cos\theta=3\varepsilon_0E_0\cos\theta$; at the top ($\theta=0$), $3\varepsilon_0E_0$.

          **(b)** On the plane, with $s$ the distance from the axis: $V=-E_0z\left(1-\dfrac{R^3}{r^3}\right)$, so $\sigma=-\varepsilon_0\partial_zV\big|_{z=0}=\varepsilon_0E_0\left(1-\dfrac{R^3}{s^3}\right)\to\varepsilon_0E_0$.

          **(c)** $Q=\displaystyle\int_0^{\pi/2}3\varepsilon_0E_0\cos\theta\,2\pi R^2\sin\theta\,d\theta=6\pi\varepsilon_0E_0R^2\cdot\tfrac12=3\pi\varepsilon_0E_0R^2$.

          **(d)** $3\varepsilon_0E_0\cos\theta=\varepsilon_0E_0$ gives $\cos\theta=\tfrac13$, $\theta=70.5^\circ$.

          **Checks.** At the rim $\sigma=0$ on both sides ($\cos\tfrac\pi2=0$ and $1-R^3/R^3=0$): continuous around the corner ✓. Bookkeeping: compared with a flat plane, the plane near the bump is short $\int_R^\infty\varepsilon_0E_0\tfrac{R^3}{s^3}2\pi s\,ds=2\pi\varepsilon_0E_0R^2$, and the flat disk the bump covers would have held $\pi R^2\varepsilon_0E_0$; the bump holds $3\pi\varepsilon_0E_0R^2=2\pi+\pi$ ✓.

          **What to remember:** recognise a known solution that already satisfies the BCs; then $\sigma=-\varepsilon_0\partial V/\partial n$ on each piece with its own $\hat{\mathbf n}$.
        `,
        figs: { bc: { svg: figBump({ plab: md`\#1\ V=0`, blab: md`\#2\ V=0`, far: md`\#3\ V\to-E_0z` }), cap: 'The three BCs; the sphere-in-field potential satisfies all of them.' } },
      }),

      P({
        id: 'ub-d6', title: 'A charged sphere in a uniform field (Griffiths 3.21)', big: true,
        q: md`An isolated metal sphere of radius $R$ carries total charge $Q$ and sits in a field that is uniform far away, $E_0\hat{\mathbf z}$. Set the zero of potential so that $V\to-E_0z$ far away.

          (a) Find $V(r,\theta)$ outside.
          (b) Find $\sigma(\theta)$.
          (c) What is the potential of the sphere?
          (d) For which $Q$ is there a line on the sphere where $\sigma=0$?`,
        figHtml: figField({ q: 'Q', note: 'isolated metal sphere, charge Q' }),
        hints: [
          md`BCs: $V(R,\theta)=V_c$ (unknown), total charge $Q$, $V\to-E_0r\cos\theta$. Three conditions, three kinds of coefficient.`,
          md`Far field: $A_1=-E_0$. Equipotential: $B_1=E_0R^3$, $B_{\ell\ge2}=0$. Charge: $B_0=Q/(4\pi\varepsilon_0)$.`,
          md`$\sigma=-\varepsilon_0\partial_rV$ at $R$; it vanishes where $\cos\theta=-Q/(12\pi\varepsilon_0R^2E_0)$.`,
        ],
        parts: [
          { lbl: md`V(r,\theta)`, expr: '-E0*(r - R^3/r^2)*cos(theta) + Q/(4*pi*eps0*r)', vars: { E0: [1, 2], R: [1, 2], r: [2.5, 4], theta: [0.2, 2.9], Q: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`\sigma(\theta)`, expr: '3*eps0*E0*cos(theta) + Q/(4*pi*R^2)', vars: { E0: [1, 2], R: [1, 2], theta: [0.2, 2.9], Q: [1, 3], eps0: [0.5, 2] } },
          { lbl: md`V_{\text{sphere}}`, expr: 'Q/(4*pi*eps0*R)', vars: { Q: [1, 3], eps0: [0.5, 2], R: [1, 2] } },
          { lbl: md`(d) $\sigma$ vanishes somewhere on the sphere when`, mc: [md`always`, md`$|Q|\le12\pi\varepsilon_0R^2E_0$`, md`$|Q|\le4\pi\varepsilon_0R^2E_0$`, md`only for $Q=0$`], a: 1,
            why: [md`A large enough $Q$ makes $\sigma$ one sign everywhere.`, null, md`The field-induced part has amplitude $3\varepsilon_0E_0$, not $\varepsilon_0E_0$.`, md`For $Q=0$ it vanishes on the equator, but small nonzero $Q$ just moves that line.`] },
        ],
        sol: md`
          **Region:** $r>R$. **BCs:**
          1. $V(R,\theta)=V_c$, an unknown constant
          2. $-\varepsilon_0\oint\partial_rV\,da=Q$ (total charge)
          3. $V\to-E_0r\cos\theta$ ($C=0$)

          [[fig:bc]]

          BC #3: $A_1=-E_0$, other $A_\ell=0$ (including $A_0$). BC #2: $B_0=Q/(4\pi\varepsilon_0)$. BC #1, $\ell\ge1$: $-E_0R+B_1/R^2=0\Rightarrow B_1=E_0R^3$; $B_{\ell\ge2}=0$. The $\ell=0$ part of BC #1 then just tells you $V_c=B_0/R$.

          **(a)** $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta+\dfrac{Q}{4\pi\varepsilon_0r}$.

          **(b)** $\sigma=-\varepsilon_0\partial_rV\big|_R=3\varepsilon_0E_0\cos\theta+\dfrac{Q}{4\pi R^2}$.

          **(c)** $V_c=\dfrac{Q}{4\pi\varepsilon_0R}$ (with this choice of zero).

          **(d)** $\sigma=0$ where $\cos\theta=-\dfrac{Q}{12\pi\varepsilon_0R^2E_0}$, which has a solution only if $|Q|\le12\pi\varepsilon_0R^2E_0$.

          **Checks.** $Q=0$: Griffiths Ex. 3.8 ✓. $E_0=0$: a charged sphere ✓. $\int\sigma\,da=Q$ (the $\cos\theta$ part integrates to zero) ✓.

          **What to remember:** a charged conductor in a field is the neutral solution plus a point charge at the center, not plus a constant. The constant is the reference; the $1/r$ is the charge.
        `,
        figs: { bc: { svg: figField({ q: 'Q', note: '#1: V const on sphere; #3: V → −E₀z' }), cap: 'BC #1 and BC #2 (total charge $Q$) act on the sphere; BC #3 far away.' } },
      }),

      P({
        id: 'ub-d7', title: 'A charge above a plane with a bump', big: true,
        q: md`A grounded conducting plane has a hemispherical bump of radius $R$. A point charge $q$ sits on the bump's axis at height $a>R$ above the plane.

          (a) Which image system works?
          (b) Find the force on $q$ (positive = away from the plane).
          (c) For $a=2R$, find the magnitude of the force in units of $\dfrac{q^2}{4\pi\varepsilon_0R^2}$.
          (d) What is the total charge induced on the plane and bump?`,
        figHtml: figBump({ charge: true, plab: 'V=0' }),
        hints: [
          md`BCs: $V=0$ on the plane, $V=0$ on the bump, $V\to0$. Satisfy the sphere with Kelvin's image, then the plane with mirror images of everything.`,
          md`Images: $-\tfrac Raq$ at $R^2/a$; $-q$ at $-a$; and the mirror of the first image. Check each surface: which pairs cancel there?`,
          md`Add the three forces along the axis, each $\dfrac{q\,q_i}{4\pi\varepsilon_0(a-z_i)^2}$ with the right direction.`,
        ],
        parts: [
          { lbl: md`(a) Images:`, mc: [md`$-q$ at $-a$ only`, md`$-\tfrac Raq$ at $\tfrac{R^2}{a}$ only`, md`$-\tfrac Raq$ at $\tfrac{R^2}{a}$, $-q$ at $-a$, and $+\tfrac Raq$ at $-\tfrac{R^2}{a}$`, md`$-\tfrac Raq$ at $\tfrac{R^2}{a}$ and $-q$ at $-a$`], a: 2,
            why: [md`That fixes the plane, not the bump.`, md`That fixes the sphere, not the plane.`, null, md`Each of these is unpaired on the other surface.`] },
          { lbl: md`F_z`, expr: '-(q^2/(4*pi*eps0))*(R*a/(a^2-R^2)^2 + 1/(4*a^2) - R*a/(a^2+R^2)^2)', vars: { q: [1, 2], eps0: [0.5, 2], R: [1, 1.5], a: [2, 3] } },
          { lbl: md`|F|\ (a=2R)`, ans: 0.2047, unit: '' },
          { lbl: md`(d) Total induced charge:`, mc: [md`$-q$`, md`$-\tfrac Raq$`, md`$0$`, md`$-q\left(1+\tfrac Ra\right)$`], a: 0,
            why: [null, md`That's only the sphere's Kelvin image; the plane takes the rest.`, md`The conductor is grounded and must end all of $q$'s field lines (it's an infinite plane).`, md`Add the images: $-\tfrac Raq-q+\tfrac Raq=-q$.`] },
        ],
        sol: md`
          **Region:** above the plane, outside the bump. **BCs:**
          1. $V=0$ on $z=0$ (for $s>R$)
          2. $V=0$ on $r=R$, $z>0$
          3. $V\to0$

          **Images.** For the sphere: $q_1=-\tfrac Raq$ at $z=R^2/a$ (Kelvin). For the plane: mirror both: $-q$ at $z=-a$ and $+\tfrac Raq$ at $z=-R^2/a$.

          [[fig:img]]

          **Check every BC.** Plane: the set is antisymmetric under $z\to-z$ (each charge has its negative at the mirror point), so $V=0$ on $z=0$ ✓. Sphere: $\{q,\ q_1\}$ is a Kelvin pair, and so is $\{-q$ at $-a,\ +\tfrac Raq$ at $-R^2/a\}$, so each pair gives $V=0$ on the whole sphere ✓. Infinity ✓. All images lie below the plane or inside the bump, outside the region ✓.

          **(b)** Forces on $q$ along $z$ (with $K=\tfrac{q^2}{4\pi\varepsilon_0}$):
          - $q_1$, distance $a-\tfrac{R^2}{a}$, attractive: $-K\dfrac{Ra}{(a^2-R^2)^2}$
          - $-q$ at $-a$, distance $2a$, attractive: $-\dfrac{K}{4a^2}$
          - $+\tfrac Raq$ at $-\tfrac{R^2}{a}$, distance $a+\tfrac{R^2}{a}$, repulsive: $+K\dfrac{Ra}{(a^2+R^2)^2}$
          $$F_z=-\frac{q^2}{4\pi\varepsilon_0}\left[\frac{Ra}{(a^2-R^2)^2}+\frac{1}{4a^2}-\frac{Ra}{(a^2+R^2)^2}\right].$$

          **(c)** $a=2R$: $\tfrac29+\tfrac1{16}-\tfrac2{25}=0.2222+0.0625-0.0800=0.2047$. Without the bump it would be $0.0625$: the bump more than triples the pull.

          **(d)** Total image charge: $-\tfrac Raq-q+\tfrac Raq=-q$, the same as for a flat plane (all field lines end on the conductor).

          **What to remember:** with two surfaces, image each image until every BC closes. Here it closes after three, because the plane is a mirror of the sphere problem.
        `,
        figs: { img: { svg: figBumpImg(), cap: 'Images (dashed: no metal): $-\\tfrac{R}{a}q$ at $R^2/a$, $-q$ at $-a$, $+\\tfrac{R}{a}q$ at $-R^2/a$.' } },
      }),

      P({
        id: 'ub-d8', title: 'A box with one live face in a single mode', big: true,
        q: md`A cube $0\le x,y,z\le a$ has five faces grounded. The top face $z=a$, insulated from them, is held at $V_0\sin(\pi x/a)\sin(\pi y/a)$.

          (a) Find $V(x,y,z)$.
          (b) Find $V$ at the center, in units of $V_0$.
          (c) Find the surface charge at the center of the bottom face.`,
        figHtml: figCube({ top: md`V_{\text{top}}`, note: 'five faces grounded' }),
        hints: [
          md`Six faces, six BCs. Which two directions oscillate? Which function does the grounded bottom pick in $z$?`,
          md`The top data is already a single mode, $n=m=1$: no Fourier sums needed. $Z''=(k^2+l^2)Z$ with $k=l=\pi/a$.`,
          md`$\sigma=-\varepsilon_0\partial V/\partial n$ with $\hat{\mathbf n}=+\hat{\mathbf z}$ on the bottom face.`,
        ],
        parts: [
          { lbl: md`V(x,y,z)`, expr: 'V0*sin(pi*x/a)*sin(pi*y/a)*sinh(sqrt(2)*pi*z/a)/sinh(sqrt(2)*pi)', vars: { V0: [1, 2], x: [0.2, 0.8], y: [0.2, 0.8], z: [0.2, 0.8], a: [1, 2] } },
          { lbl: md`V_{\text{center}}/V_0`, ans: 0.1072, unit: '' },
          { lbl: md`\sigma(a/2,a/2,0)`, expr: '-sqrt(2)*pi*eps0*V0/(a*sinh(sqrt(2)*pi))', vars: { eps0: [0.5, 2], V0: [1, 2], a: [1, 2] } },
        ],
        sol: md`
          **Region:** inside the cube. **BCs:**
          1. $V=0$ at $x=0$ and 2. at $x=a$
          3. $V=0$ at $y=0$ and 4. at $y=a$
          5. $V=0$ at $z=0$
          6. $V=V_0\sin(\pi x/a)\sin(\pi y/a)$ at $z=a$

          BC #1–#4: $\sin(n\pi x/a)\sin(m\pi y/a)$. Then $Z''=\pi^2\dfrac{n^2+m^2}{a^2}Z$; BC #5 picks $\sinh$. BC #6 is a single term, so by orthogonality only $n=m=1$ appears:

          **(a)** $V=V_0\sin\dfrac{\pi x}{a}\sin\dfrac{\pi y}{a}\dfrac{\sinh(\sqrt2\pi z/a)}{\sinh\sqrt2\pi}$.

          [[fig:z]]

          **(b)** Center: $\dfrac{\sinh(\sqrt2\pi/2)}{\sinh\sqrt2\pi}=\dfrac{1}{2\cosh(\pi/\sqrt2)}=0.1072$. Compare $1/6=0.167$ for a uniform top: this top averages less ($\tfrac4{\pi^2}V_0=0.405V_0$ over the face).

          **(c)** $\partial_zV\big|_{z=0}=V_0\cdot1\cdot1\cdot\dfrac{\sqrt2\pi/a}{\sinh\sqrt2\pi}$, so $\sigma=-\varepsilon_0\partial_zV=-\dfrac{\sqrt2\pi\varepsilon_0V_0}{a\sinh\sqrt2\pi}\approx-0.105\dfrac{\varepsilon_0V_0}{a}$. Negative: the field runs down from the live top into the grounded bottom.

          **Checks.** Each face: sides vanish because of the sines ✓; bottom because $\sinh0=0$ ✓; top because the $\sinh$ ratio is $1$ ✓. Laplace: $\left(-\tfrac{\pi^2}{a^2}-\tfrac{\pi^2}{a^2}+\tfrac{2\pi^2}{a^2}\right)V=0$ ✓.

          **What to remember:** when the live face is already one separated mode, the whole solution is one term, and its decay constant is $\pi\sqrt{n^2+m^2}/a$.
        `,
        figs: { z: { svg: plotCubeZ(), cap: 'Along the vertical center line: $V/V_0=\\sinh(\\sqrt2\\pi z/a)/\\sinh\\sqrt2\\pi$.' } },
      }),

      P({
        id: 'ub-d9', title: 'A charge between two grounded planes', big: true,
        q: md`A point charge $q$ sits between two grounded conducting planes, $z=0$ and $z=L$, at height $z_0=L/4$.

          (a) How many image charges does the method need?
          (b) What is the force on $q$ if it sits at the midpoint instead?
          (c) At $z_0=L/4$, find the magnitude of the force in units of $\dfrac{q^2}{4\pi\varepsilon_0L^2}$.
          (d) What total charge is induced on the lower plane?`,
        figHtml: figPar({}),
        hints: [
          md`BCs: $V=0$ on $z=0$, $V=0$ on $z=L$, $V\to0$ far away sideways. Imaging in one plane breaks the other: keep reflecting.`,
          md`Images: $+q$ at $2nL+z_0$ ($n\neq0$) and $-q$ at $2nL-z_0$ (all $n$). The $+q$ images come in pairs at equal distances above and below: their forces cancel.`,
          md`$F_z=\dfrac{q^2}{4\pi\varepsilon_0}\left[\sum_{n\ge1}\dfrac{1}{(2nL-2z_0)^2}-\sum_{m\ge0}\dfrac{1}{(2z_0+2mL)^2}\right]$. Pair the terms to make the series converge fast.`,
        ],
        parts: [
          { lbl: md`(a) Number of images:`, mc: [md`one`, md`two`, md`three`, md`infinitely many`], a: 3,
            why: [md`One image fixes one plane only.`, md`Each image spoils the other plane.`, md`Three is the right-angle corner.`, null] },
          { lbl: md`(b) Force at the midpoint:`, mc: [md`zero, by symmetry`, md`toward the lower plane`, md`$\dfrac{q^2}{4\pi\varepsilon_0L^2}$ upward`, md`infinite`], a: 0,
            why: [null, md`Both planes pull equally at the midpoint.`, md`The setup is symmetric about $z=L/2$.`, md`$q$ is a finite distance from every image.`] },
          { lbl: md`|F|`, ans: 3.664, unit: '' },
          { lbl: md`(d) Induced charge on the lower plane:`, mc: [md`$-q$`, md`$-q/2$`, md`$-3q/4$`, md`$-q/4$`], a: 2,
            why: [md`The two planes share the induced charge; together they carry $-q$.`, md`That's the midpoint case.`, null, md`That's the upper (farther) plane's share.`] },
        ],
        sol: md`
          **Region:** $0<z<L$. **BCs:**
          1. $V=0$ on $z=0$
          2. $V=0$ on $z=L$
          3. $V\to0$ far away (sideways)

          **(a)** Reflect $q$ in $z=0$: $-q$ at $-z_0$; that breaks BC #2, so reflect it in $z=L$: $+q$ at $2L+z_0$... and so on forever: $+q$ at $2nL+z_0$, $-q$ at $2nL-z_0$. Infinitely many, all outside the region. Any pair of mirror images across either plane cancels on it, so BC #1 and #2 hold.

          [[fig:img]]

          **(b)** At $z_0=L/2$ the image set is symmetric about $q$: zero force.

          **(c)** The $+q$ images ($n=\pm1,\pm2,\dots$) cancel in pairs. The $-q$ images above $q$ ($n\ge1$, distance $2nL-2z_0$) pull up; those below ($n\le0$, distance $2z_0+2|n|L$) pull down. With $z_0=L/4$, in units of $\tfrac{q^2}{4\pi\varepsilon_0L^2}$:
          $$F_z=\frac14\left[\sum_{n\ge1}\frac{1}{(n-\frac14)^2}-\sum_{m\ge0}\frac{1}{(m+\frac14)^2}\right]=\frac14\left[-16+\sum_{n\ge1}\left(\frac{1}{(n-\frac14)^2}-\frac{1}{(n+\frac14)^2}\right)\right].$$
          The bracketed terms are $1.1378,\ 0.1290,\ 0.0376,\ 0.0158,\ 0.0080,\dots$ (sum $\approx1.341$), so $F_z\approx\tfrac14(-16+1.341)=-3.664$. (Exactly $-4G$, Catalan's constant $G=0.9160$.) The force points toward the nearer plane, a bit weaker than the single-plane value $4$ because the far plane pulls back.

          **(d)** $-\tfrac34q$. Replace $q$ by a uniform sheet of charge at $z_0$ (sum over all horizontal positions: the induced charges add the same way). For a sheet $\sigma$ between grounded plates, the fields below and above satisfy $E_{\text{below}}z_0=E_{\text{above}}(L-z_0)$ (both plates at $0$) and $E_{\text{below}}+E_{\text{above}}=\sigma/\varepsilon_0$, so the lower plate gets $-\sigma\dfrac{L-z_0}{L}$. For $z_0=L/4$: $-\tfrac34$ of the charge, and $-\tfrac14$ on the upper plate.

          **What to remember:** two parallel conductors need an infinite image series; check that each reflection preserves both BCs, and use symmetry to cancel what you can before summing.
        `,
        figs: { img: { svg: figParImg(), cap: 'Some of the infinitely many images (planes $z=0$ and $z=L$ dashed: no metal in the image problem).' } },
      }),

      RF(md`
        !!key Patterns to remember
          - Start every problem with the region and a numbered BC list; end it by checking the answer against each one.
          - The far-field condition is "tends to whatever the boundaries alone produce": $0$, $V_1$, a linear profile, or $-E_0z$.
          - Constant offsets: subtract them first. Several live faces: split. Several conductors with images: keep reflecting until every BC closes.
          - Charge on a conductor is a $1/r$ term (or a center image), never a constant.
          - $\sigma=-\varepsilon_0\partial V/\partial n$ with $\hat{\mathbf n}$ out of the metal, on each piece separately.
      `),
    ],
  });


  C.unit({
    id: 'ub', num: 'Unit B', title: 'Boundary conditions: the whole picture',
    blurb: 'Every kind of boundary condition, how to read it off a picture or a sentence, what it does to the solution, and a drill of full boundary-value problems.',
    lessons: LESSONS,
  });
})();

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
    f.plane(left ? x1 : x1 + g, left ? x2 - g : x2, yT, { side: 'above' });
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
    f.label(x0 - 6, y0 + H + 6, o.c0 || '(0,0)', 'tr', 'small accent');
    f.label(x0 + W + 6, y0 - 6, o.c1 || '(b,a)', 'bl', 'small accent');
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
      f.charge(qx, 2 * y0 - qy, { q: '-', lab: o.qi || '-q', at: 'l', image: true });
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
        - A conductor with given charge brings one unknown ($V_c$) and one extra equation ($\oint\sigma\,da=Q$, which in spherical problems reads $B_0=Q/4\pi\varepsilon_0$).
        - Symmetry halves the work: solve one side, with $V=0$ or $\partial V/\partial n=0$ on the mirror plane.
        - Matching conditions glue the solutions of two regions together.

        **Regularity on the axis.** Legendre's equation has, for every $\ell$, a second solution $Q_\ell(\cos\theta)$ that blows up on the $z$-axis (it describes line charge sitting on the axis), and for non-integer $\ell$ even the "$P$" solution blows up at $\theta=\pi$. Demanding that $V$ be finite on the whole axis keeps only $P_\ell(\cos\theta)$ with $\ell=0,1,2,\dots$ That is a boundary condition too, one the lectures use silently.
      `),

      Q(md`You know the surface charge $\sigma$ at every point of a conductor's surface, but not its potential. What boundary condition is that, in terms of $V$?`,
        [md`$V=\sigma/\varepsilon_0$ on the surface`, md`$\partial V/\partial n=-\sigma/2\varepsilon_0$ on the surface`, md`$\partial V/\partial n=-\sigma/\varepsilon_0$ on the surface, with $\hat{\mathbf n}$ pointing out of the metal (a Neumann condition)`, md`None: $\sigma$ is a result, never a boundary condition`], 2,
        [md`$\sigma$ fixes the **field** just outside, $E=\sigma/\varepsilon_0$, which is a derivative of $V$, not $V$ itself. Units don't even match.`,
          md`$\sigma/2\varepsilon_0$ is the field of an isolated flat sheet on one side. At a conductor the field inside is zero, so all of the jump $\sigma/\varepsilon_0$ appears outside.`,
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

          **Checks.** The full-gap solution is $\dfrac{\rho}{2\varepsilon_0}x(2d-x)$, the same function: the half-problem with the Neumann condition reproduces it. The plate at $x=0$ receives the field lines of the left half of the slab, charge $\rho d$ per area, so $\sigma=-\rho d$. Compared with the worked example (gap $d$, $V_{\max}=\rho d^2/8\varepsilon_0$), doubling the gap quadruples $V_{\max}$: $V$ scales like $(\text{gap})^2$.

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
        md`Metal: equipotential at an unknown $V_c$. Isolated and neutral: total charge zero. The images are $q'=-qR/a$ at $R^2/a$ plus $+qR/a$ at the center, which makes $V_c=q/4\pi\varepsilon_0a$ (lesson 4).`,
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
          md`$\sigma=Q/4\pi R^2$ on the sphere; $V\to-E_0r\cos\theta$`,
          md`$V(R,\theta)=V_c$; $V\to\dfrac{Q}{4\pi\varepsilon_0r}$ as $r\to\infty$`], 1,
        [md`Grounding would drain the charge: with $C=0$ the sphere would end up neutral.`, null,
          md`The field also induces $3\varepsilon_0E_0\cos\theta$; $\sigma$ is not uniform.`,
          md`Far away the applied field dominates; the $Q/r$ part decays.`],
        md`Equipotential (unknown value), total charge $Q$, uniform field far away. In the Legendre series the charge condition reads $B_0=Q/4\pi\varepsilon_0$, and the result is $V=-E_0\left(r-\dfrac{R^3}{r^2}\right)\cos\theta+\dfrac{Q}{4\pi\varepsilon_0r}$ (lesson 8).`,
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
        md`Only $\ell=0$ appears: $V=A+B/r$. $V(b)=0$ and the charge condition ($-\varepsilon_0\,4\pi a^2\,\partial_rV=Q$, i.e. $B=Q/4\pi\varepsilon_0$) give $V=\dfrac{Q}{4\pi\varepsilon_0}\left(\dfrac1r-\dfrac1b\right)$, and $C=Q/V(a)=4\pi\varepsilon_0\dfrac{ab}{b-a}$.`,
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

        !!trap The jump is $\sigma/\varepsilon_0$, not $\sigma/2\varepsilon_0$
          A lone flat sheet gives $\sigma/2\varepsilon_0$ on each side, pointing away, and the **jump** is $\sigma/\varepsilon_0$. The jump is always $\sigma/\varepsilon_0$; how it splits between the two sides depends on the other charges around.
      `, { pill: { svg: figPill(), cap: 'Pillbox (left) for the normal component, thin loop (right) for the tangential one.' } }),

      Q(md`Across a surface carrying charge density $\sigma$, which statement is right?`,
        [md`$E^\perp$ jumps by $\sigma/\varepsilon_0$; $E^\parallel$ is continuous`, md`$E^\parallel$ jumps by $\sigma/\varepsilon_0$; $E^\perp$ is continuous`, md`Both components jump by $\sigma/2\varepsilon_0$`, md`Both components are continuous; only $V$ jumps`], 0,
        [null, md`Backwards. The loop argument ($\oint\vb E\cdot d\vb l=0$) makes the tangential part continuous; the pillbox gives the normal jump.`,
          md`$\sigma/2\varepsilon_0$ is the field of the local patch on one side. The tangential part doesn't jump at all.`,
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
          md`The jump becomes $\sigma/2\varepsilon_0$`,
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

        A thin metal shell has two surfaces; each gets its own $\sigma$ from the field on its own side. The field just outside a conductor is $\sigma/\varepsilon_0$, not $\sigma/2\varepsilon_0$: the other charges cancel the patch's field inside the metal and double it outside.
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
        [md`$-\varepsilon_0V_0/d$`, md`$\varepsilon_0V_0/2d$`, md`$0$`, md`$+\varepsilon_0V_0/d$`], 3,
        [md`That's the left plate. Using $\hat{\mathbf n}=+\hat{\mathbf x}$ at the right plate gives this wrong sign.`, md`No factor of $\tfrac12$ at a conductor.`, md`The plates have equal and opposite charges; neither is zero.`, null],
        md`At $x=d$ the field region is to the left, so $\hat{\mathbf n}=-\hat{\mathbf x}$ and $\sigma=-\varepsilon_0\,\partial V/\partial n=+\varepsilon_0V'(d)=\varepsilon_0V_0/d$. Left plate: $\hat{\mathbf n}=+\hat{\mathbf x}$, $\sigma=-\varepsilon_0V_0/d$. The higher-potential plate is the positive one, as it should be.`,
        { figHtml: figPlates({ L: 'V=0', R: 'V_0' }) }),

      Q(md`A thin metal shell of radius $R$ carries total charge $Q$, with a point charge $q$ at its center. What are the surface charge densities on its inner and outer faces?`,
        [md`$\sigma_{\text{in}}=0$, $\sigma_{\text{out}}=\dfrac{Q}{4\pi R^2}$`, md`$\sigma_{\text{in}}=\sigma_{\text{out}}=\dfrac{Q}{8\pi R^2}$`, md`$\sigma_{\text{in}}=-\dfrac{q}{4\pi R^2}$, $\sigma_{\text{out}}=\dfrac{Q+q}{4\pi R^2}$`, md`$\sigma_{\text{in}}=\dfrac{q}{4\pi R^2}$, $\sigma_{\text{out}}=\dfrac{Q-q}{4\pi R^2}$`], 2,
        [md`The field of $q$ ends on the inner face: a Gaussian surface inside the metal encloses zero charge.`, md`The two faces see different fields, so they carry different charge.`, null, md`Signs: the inner face must cancel $q$'s flux, so it carries $-q$.`],
        md`Each face of a thin shell is its own boundary. Inner face: field region is the cavity, field $q/4\pi\varepsilon_0R^2$ pointing **into** the metal ($\hat{\mathbf n}=-\hat{\mathbf r}$), so $\sigma_{\text{in}}=-q/4\pi R^2$. The rest of the shell's charge, $Q+q$, goes to the outer face; outside, the field is that of $Q+q$ at the center.`,
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

        **Checks.** $\nabla^2V=(-k^2+k^2)V=0$ off the sheet. Just above, $E_y=-\partial_yV=\dfrac{\sigma_0\sin kx}{2\varepsilon_0}=\dfrac{\sigma(x)}{2\varepsilon_0}$: exactly the field of a uniform sheet with the local $\sigma$, as Griffiths' footnote on the local patch says. Below, $E_y=-\sigma/2\varepsilon_0$. $E_x=-\partial_xV$ is the same on both sides.

        !!intuition A periodic charge pattern is invisible from far away
          The field dies off as $e^{-k|y|}$: within a distance $1/k=\lambda/2\pi$ of the sheet. Far away the $+$ and $-$ stripes cancel. A finer pattern (larger $k$) is both weaker ($C\propto1/k$) and shorter-ranged. The same $e^{-n\pi x/a}$ decay is why only the lowest Fourier term of the slot survives far from its end.
      `, { sheet: { svg: figSheet({}), cap: 'Edge-on view of the sheet; $+$ and $-$ mark the sign of $\\sigma$.' }, decay: { svg: plotDecay(), cap: 'The potential along a vertical line where $\\sin kx=1$: a cusp at the sheet (the charge), decaying over $1/k$.' } }),

      Q(md`For the sheet $\sigma_0\sin kx$, how far from the sheet does the potential fall to $1/e$ of its value on the sheet?`,
        [md`One wavelength, $\lambda=2\pi/k$`, md`$1/k=\lambda/2\pi$`, md`$1/2k$`, md`It never decays: the sheet is infinite`], 1,
        [md`$e^{-k|y|}$ at $|y|=\lambda$ is $e^{-2\pi}\approx0.002$, far below $1/e$.`, null, md`$e^{-k\cdot1/2k}=e^{-1/2}$.`, md`An infinite **uniform** sheet has a field that never decays. A sheet whose charge alternates in sign has zero average, and its field dies off.`],
        md`$V\propto e^{-k|y|}$, which is $1/e$ at $|y|=1/k=\lambda/2\pi$. So the field reaches out only about a sixth of a wavelength.`,
        { figHtml: figSheet({}) }),

      Q(md`The pattern's wavelength is halved ($k\to2k$) with $\sigma_0$ unchanged. What happens to $V$?`,
        [md`The amplitude on the sheet halves, and it decays twice as fast`, md`The amplitude doubles, and it decays twice as fast`, md`The amplitude is unchanged; only the decay is faster`, md`Nothing changes except the stripes are narrower`], 0,
        [null, md`$C=\sigma_0/2\varepsilon_0k$ goes **down** as $k$ goes up: narrower stripes of opposite sign cancel each other better.`, md`$C\propto1/k$, so the amplitude changes too.`, md`Both the amplitude and the range scale with $1/k$.`],
        md`$V=\dfrac{\sigma_0}{2\varepsilon_0k}\sin kx\,e^{-k|y|}$: doubling $k$ halves the prefactor and halves the decay length. (The field just above the sheet, $\sigma/2\varepsilon_0$, doesn't depend on $k$.)`,
        { figHtml: figSheet({}) }),

      Q(md`Check the long-wavelength limit. As $k\to0$ the sheet looks locally uniform. What is $E_y$ just above it?`,
        [md`It diverges like $1/k$`, md`$\sigma(x)/\varepsilon_0$`, md`$0$`, md`$\sigma(x)/2\varepsilon_0$, for every $k$, matching a uniform sheet with the local $\sigma$`], 3,
        [md`$V$'s amplitude $\propto1/k$ does grow, but $E_y=-\partial_yV$ brings down a factor $k$.`, md`That would be the field just outside a **conductor**. A lone sheet splits the jump evenly.`, md`$E_y$ just above is $\sigma/2\varepsilon_0$, not zero.`, null],
        md`$E_y(0^+)=-\partial_yV=k\cdot\dfrac{\sigma_0}{2\varepsilon_0k}\sin kx=\dfrac{\sigma(x)}{2\varepsilon_0}$. Close to the sheet only the local patch matters, and a patch looks like an infinite plane: $\sigma/2\varepsilon_0$ on each side. (The growing amplitude of $V$ as $k\to0$ is just the uniform sheet's $V=-\sigma|y|/2\varepsilon_0+\text{const}$ with the constant going to infinity.)`,
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
        md`$s_0=\sigma_0$, so $A_0=\sigma_0R/\varepsilon_0$ and $B_0=A_0R=\sigma_0R^2/\varepsilon_0=Q/4\pi\varepsilon_0$ with $Q=4\pi R^2\sigma_0$. Outside: a point charge. Inside: constant, equal to the surface value. (HW 3 Prob. 2.31(c) checks exactly this against the boundary conditions.)`,
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

          **Checks.** Total charge: $Q=\int\sigma_0\cos^2\theta\,2\pi R^2\sin\theta\,d\theta=\tfrac{4\pi R^2\sigma_0}{3}$, and the monopole term is $B_0=Q/4\pi\varepsilon_0$. Continuity at $R$: inside, $V_{\text{in}}=\dfrac{\sigma_0R}{3\varepsilon_0}+\dfrac{2\sigma_0r^2}{15\varepsilon_0R}P_2$, which equals $V_{\text{out}}$ at $r=R$. Jump: $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\dfrac{\sigma_0}{3\varepsilon_0}-\dfrac{6\sigma_0}{15\varepsilon_0}P_2-\dfrac{4\sigma_0}{15\varepsilon_0}P_2=-\dfrac{\sigma_0}{\varepsilon_0}\left(\tfrac13+\tfrac23P_2\right)$ ✓.

          **What to remember:** expand the source in $P_\ell$ by eye when you can; each $\ell$ is then a separate two-equation problem (continuity and jump).
        `,
      }),

      P({
        id: 'ub-HW3-2.31', src: 'HW 3 · Griffiths 2.31', title: 'Checking the boundary conditions', big: true,
        q: md`(a) Check that the results of Exs. 2.5 and 2.6, and Prob. 2.11, are consistent with Eq. 2.33, $\vb E_{\text{above}}-\vb E_{\text{below}}=\dfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$.
          (b) Use Gauss's law to find the field inside and outside a long hollow cylindrical tube, which carries a uniform surface charge $\sigma$. Check that your result is consistent with Eq. 2.33.
          (c) Check that the result of Ex. 2.8 is consistent with boundary conditions 2.34 ($V$ continuous) and 2.36 (jump in $\partial V/\partial n$).

          (Ex. 2.5: infinite plane, $\sigma/2\varepsilon_0$ on each side. Ex. 2.6: two infinite planes $\pm\sigma$. Prob. 2.11: spherical shell, $\vb E=0$ inside and $\sigma R^2/\varepsilon_0r^2$ outside. Ex. 2.8: spherical shell of total charge $q$; find $V$.)`,
        figHtml: figTube(),
        hints: [
          md`For each surface, write $\vb E$ just above and just below with the same $\hat{\mathbf n}$, and subtract.`,
          md`(b) Coaxial Gaussian cylinder of radius $s$ and length $L$: no flux through the ends, $E\,2\pi sL=Q_{\text{enc}}/\varepsilon_0$.`,
          md`(c) Ex. 2.8: $V=\dfrac{q}{4\pi\varepsilon_0r}$ outside, $\dfrac{q}{4\pi\varepsilon_0R}$ inside. Compare values and radial slopes at $r=R$, with $\sigma=q/4\pi R^2$.`,
        ],
        parts: [
          { lbl: md`(a) For the infinite plane (Ex. 2.5), $\vb E_{\text{above}}-\vb E_{\text{below}}$ is`, mc: [md`$\dfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n}$`, md`$0$`, md`$\dfrac{\sigma}{\varepsilon_0}\hat{\mathbf n}$, consistent with 2.33`, md`$\dfrac{2\sigma}{\varepsilon_0}\hat{\mathbf n}$`], a: 2,
            why: [md`That's one side. Below, the field is $-\tfrac{\sigma}{2\varepsilon_0}\hat{\mathbf n}$, so the difference is twice this.`, md`The field reverses direction across the plane.`, null, md`Each side has magnitude $\sigma/2\varepsilon_0$; the difference is $\sigma/\varepsilon_0$.`] },
          { lbl: md`(b) |\vb E| \text{ outside the tube, at distance } s`, expr: 'sigma*R/(eps0*s)', vars: { sigma: [1, 2], R: [1, 2], s: [2.5, 4], eps0: [0.5, 2] } },
          { lbl: md`(b) Inside the tube, and the jump at $s=R$:`, mc: [md`$\vb E=0$ inside; the jump is $\sigma/\varepsilon_0$, consistent`, md`$\vb E=\dfrac{\sigma}{2\varepsilon_0}\hat{\mathbf s}$ inside; the jump is $\sigma/2\varepsilon_0$`, md`$\vb E=0$ inside; the jump is $\sigma R/\varepsilon_0$`, md`$\vb E\propto s$ inside`], a: 0,
            why: [null, md`No charge is enclosed by a Gaussian cylinder with $s<R$, so $E=0$.`, md`At $s=R$ the outside field is $\sigma R/\varepsilon_0R=\sigma/\varepsilon_0$.`, md`That would need volume charge inside. The tube is hollow.`] },
          { lbl: md`(c) For Ex. 2.8, at $r=R$:`, mc: [md`$V$ jumps by $q/4\pi\varepsilon_0R$ and $\partial V/\partial r$ is continuous`, md`$V$ is continuous and $\partial_rV_{\text{out}}-\partial_rV_{\text{in}}=-\dfrac{q}{4\pi\varepsilon_0R^2}=-\dfrac{\sigma}{\varepsilon_0}$`, md`Both are continuous`, md`$V$ is continuous and $\partial_rV$ jumps by $+\sigma/\varepsilon_0$`], a: 1,
            why: [md`Both expressions equal $q/4\pi\varepsilon_0R$ at $r=R$.`, null, md`Inside, $\partial_rV=0$; outside, $-q/4\pi\varepsilon_0R^2$. It jumps.`, md`Sign: $\partial_rV$ drops from $0$ to a negative value.`] },
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
        figs: { tube: { svg: PF.plot({ w: 300, h: 180, x: [0, 3], y: [0, 1.25], xl: 's', yl: 'E', xt: [[1, 'R']], yt: [[1, md`\tfrac{\sigma}{\varepsilon_0}`]], curves: [{ f: () => 0, to: 0.999 }, { f: (s) => 1 / s, from: 1.001 }], vlines: [[1, '']] }), cap: 'The tube: zero inside, $\\sigma R/\\varepsilon_0s$ outside; a jump of $\\sigma/\\varepsilon_0$ at $s=R$.' } },
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


  C.unit({
    id: 'ub', num: 'Unit B', title: 'Boundary conditions: the whole picture',
    blurb: 'Every kind of boundary condition, how to read it off a picture or a sentence, what it does to the solution, and a drill of full boundary-value problems.',
    lessons: LESSONS,
  });
})();

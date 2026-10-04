/* Unit D — Images ladder: the method of images and the uniqueness theorems, easy to brutal (Griffiths 3.1–3.2). */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;
  const DEG = Math.PI / 180;

  // =====================================================================================
  // Figures
  // =====================================================================================

  // Grounded plane with a point charge, a line charge (end-on) or a dipole at height h (px).
  // o: { kind: 'q'|'line'|'dip', h, lab, qlab, neg, th (dipole tilt from the normal, deg), pt: [dx, dz, 'P'], field: true, noDim }
  function fPlane(o = {}) {
    const f = PF.fig();
    const y0 = 170, cx = 160, h = o.h ?? 80, cy = y0 - h;
    f.plane(20, 300, y0, { lab: o.lab ?? 'V=0' });
    if (o.kind === 'line') {
      f.charge(cx, cy, { q: '', lab: o.qlab || '\\lambda', at: 'r' });
      if (o.noteLeft) f.text(cx - 14, cy - 14, 'wire, out of the page', 'br');
      else f.text(cx + 14, cy - 14, 'line charge, along the page normal', 'bl');
    } else if (o.kind === 'dip') {
      const t = (o.th ?? 0) * DEG, L = 26;
      f.line(cx, cy + 4, cx, cy - 46, { cls: 'dim dash thin' });
      f.arrow(cx - L * Math.sin(t), cy + L * Math.cos(t), cx + L * Math.sin(t), cy - L * Math.cos(t), { cls: 'thick', hs: 8 });
      f.dot(cx, cy, 2.4);
      f.tag(cx + L * Math.sin(t), cy - L * Math.cos(t), o.qlab || '\\mathbf p', o.th > 45 ? 'r' : 'tr', 8);
      if (o.th && o.th < 80) f.label(cx + 5, cy - 50, '\\theta', 'bl', 'small');
    } else {
      f.charge(cx, cy, { q: o.neg ? '-' : '+', lab: o.qlab || 'q', at: 'r' });
    }
    if (!o.noDim) {
      f.line(cx - 52, cy, cx - 10, cy, { cls: 'dim dash thin' });
      f.dim(cx - 48, y0, cx - 48, cy, o.dLab || 'd', { at: 'l' });
    }
    if (o.field) for (const x of [50, 270]) f.arrow(x, cy + 50, x, cy - 10, { hs: 7 });
    if (o.field) f.label(58, cy - 6, 'E_0', 'l', 'small');
    for (const [dx, dz, lb, at] of (o.pts || (o.pt ? [o.pt] : []))) { f.dot(cx + dx, y0 - dz); f.tag(cx + dx, y0 - dz, lb, at || 'tr', 6, 'small'); }
    if (o.strip) {
      const w = o.strip, ys = y0 + 40;
      f.line(cx - w, y0 + 12, cx - w, ys + 4, { cls: 'dim dash thin' }); f.line(cx + w, y0 + 12, cx + w, ys + 4, { cls: 'dim dash thin' });
      f.dim(cx - w, ys, cx + w, ys, o.stripLab || '', { at: 'b' });
    }
    return f.svg();
  }
  // Image solution for the plane: conductor dashed, image below.
  function fPlaneImg(o = {}) {
    const f = PF.fig();
    const y0 = 130, cx = 150, h = o.h ?? 60;
    f.line(20, y0, 290, y0, { cls: 'dash dim' });
    f.text(290, y0 - 6, 'plane removed', 'br');
    f.line(cx, y0 - h - 18, cx, y0 + h + 18, { cls: 'dim dash thin nodecl' });
    if (o.kind === 'line') {
      f.charge(cx, y0 - h, { q: '', lab: '+\\lambda', at: 'r' });
      f.charge(cx, y0 + h, { q: '', lab: '-\\lambda', at: 'r', image: true });
    } else {
      f.charge(cx, y0 - h, { q: '+', lab: 'q', at: 'r' });
      f.charge(cx, y0 + h, { q: '-', lab: '-q', at: 'r', image: true });
    }
    f.dim(cx - 40, y0, cx - 40, y0 - h, 'd', { at: 'l' });
    f.dim(cx - 40, y0, cx - 40, y0 + h, 'd', { at: 'l' });
    f.line(cx - 44, y0 - h, cx - 10, y0 - h, { cls: 'dim dash thin' });
    f.line(cx - 44, y0 + h, cx - 10, y0 + h, { cls: 'dim dash thin' });
    for (const [dx, dz, lb, at] of (o.pts || [])) { f.dot(cx + dx, y0 - dz); f.tag(cx + dx, y0 - dz, lb, at || 'tr', 6, 'small'); }
    if (o.field) { for (const x of [30, 70]) f.arrow(x, y0 - 20, x, y0 - 80, { hs: 7 }); f.label(76, y0 - 74, 'E_0', 'l', 'small'); }
    return f.svg();
  }
  // Dipole and its image (solution).
  function fDipImg(th) {
    const f = PF.fig();
    const y0 = 120, cx = 150, h = 60, t = th * DEG, L = 24;
    f.line(30, y0, 270, y0, { cls: 'dash dim' });
    f.text(30, y0 - 6, 'plane removed', 'bl');
    f.arrow(cx - L * Math.sin(t), y0 - h + L * Math.cos(t), cx + L * Math.sin(t), y0 - h - L * Math.cos(t), { cls: 'thick', hs: 8 });
    f.tag(cx + L * Math.sin(t), y0 - h - L * Math.cos(t), '\\mathbf p', 'tr', 7);
    f.arrow(cx + L * Math.sin(t), y0 + h + L * Math.cos(t), cx - L * Math.sin(t), y0 + h - L * Math.cos(t), { cls: 'dash', hs: 8 });
    f.tag(cx - L * Math.sin(t), y0 + h - L * Math.cos(t), "\\mathbf p'", 'tl', 7, 'accent');
    f.dim(cx + 135, y0 - h, cx + 135, y0 + h, '2d', { at: 'r' });
    f.line(cx + 6, y0 - h, cx + 139, y0 - h, { cls: 'dim dash thin' });
    f.line(cx + 6, y0 + h, cx + 139, y0 + h, { cls: 'dim dash thin' });
    return f.svg();
  }

  // Conducting sphere (hatched) with q at distance a. o: { A, lab, ground, qlab, neg, aLab, kind: 'line' }
  function fSph(o = {}) {
    const f = PF.fig();
    const A = o.A ?? 3, Rp = Math.min(60, 200 / A), cx = 30 + Rp + 20, cy = 40 + Rp + 20, qx = cx + A * Rp;
    f.hatchBand(f.arcPts(cx, cy, Rp, Rp, 0, 360)); f.circle(cx, cy, Rp, { cls: 'thick' });
    f.dot(cx, cy, 2.4);
    const ra = 135 * DEG;
    f.line(cx, cy, cx + Rp * Math.cos(ra), cy - Rp * Math.sin(ra), { cls: 'dim', arrow: 'end', hs: 6 });
    f.tag(cx + Rp * Math.cos(ra), cy - Rp * Math.sin(ra), 'R', 'tl', 8, 'small');
    if (o.lab) f.tag(cx + Rp * Math.cos(225 * DEG), cy - Rp * Math.sin(225 * DEG), o.lab, 'bl', 10, 'small');
    if (o.ground) { const gx = cx + Rp * Math.cos(300 * DEG), gy = cy - Rp * Math.sin(300 * DEG); f.line(gx, gy, gx, gy + 14); f.ground(gx, gy + 14); }
    f.line(cx + 4, cy, qx - 9, cy, { cls: 'dim dash thin' });
    if (o.kind === 'line') f.charge(qx, cy, { q: '', lab: o.qlab || '\\lambda', at: 't' });
    else f.charge(qx, cy, { q: o.neg ? '-' : '+', lab: o.qlab || 'q', at: 't' });
    const yd = cy + Rp + (o.ground ? 46 : 22);
    if (o.dSurf) {
      f.line(cx + Rp, cy + 4, cx + Rp, yd + 4, { cls: 'dim dash thin' }); f.line(qx, cy + 10, qx, yd + 4, { cls: 'dim dash thin' });
      f.dim(cx + Rp, yd, qx, yd, 'd', { at: 'b' });
    } else {
      f.line(cx, cy + 4, cx, yd + 4, { cls: 'dim dash thin' }); f.line(qx, cy + 10, qx, yd + 4, { cls: 'dim dash thin' });
      f.dim(cx, yd, qx, yd, o.aLab || 'a', { at: 'b' });
    }
    for (const [xr, lb] of (o.pts || [])) { f.dot(cx + xr * Rp, cy); f.tag(cx + xr * Rp, cy, lb, 't', 7, 'small'); }
    if (o.fieldH) {
      for (const yy of [cy - Rp - 22, cy - Rp - 46]) f.arrow(cx - Rp - 10, yy, qx - 10, yy, { hs: 7 });
      f.label(qx - 4, cy - Rp - 46, 'E_0', 'l', 'small');
      f.arrow(qx + 12, cy, qx + 44, cy, { cls: 'dim', hs: 6 }); f.label(qx + 48, cy, 'z', 'l', 'small accent');
    }
    if (o.field) {
      for (const x of [cx - Rp - 34, qx + 36]) f.arrow(x, cy + 40, x, cy - 30, { hs: 7 });
      f.label(qx + 42, cy - 24, 'E_0', 'l', 'small');
    }
    return f.svg();
  }
  // Images on a line through a dashed (removed) circle. o: { Rp, items: [{ x (in R), q: '+'|'-', lab, at, image }], dims: [{ x0, x1, lab, row }], note }
  function fAxisImg(o = {}) {
    const f = PF.fig();
    const Rp = o.Rp || 56, cx = 40 + Rp + 10, cy = 40 + Rp;
    const xs = o.items.map((it) => cx + it.x * Rp);
    f.circle(cx, cy, Rp, { cls: 'dash dim' });
    f.line(Math.min(cx - Rp - 12, ...xs.map((x) => x - 16)), cy, Math.max(cx + Rp + 12, ...xs.map((x) => x + 16)), cy, { cls: 'dim dash thin nodecl' });
    if (!o.noCenter) f.dot(cx, cy, 2);
    o.items.forEach((it, i) => {
      if (it.pt) { f.dot(xs[i], cy, 2.6); f.tag(xs[i], cy, it.pt, it.at || 't', 7, 'small'); }
      else f.charge(xs[i], cy, { q: it.q, lab: it.lab, at: it.at || 't', image: it.image, r: 6 });
    });
    const base = cy + Rp + 18;
    (o.dims || []).forEach((dm) => {
      const yd = base + 24 * (dm.row || 0);
      const X0 = cx + dm.x0 * Rp, X1 = cx + dm.x1 * Rp;
      f.line(X0, cy + 8, X0, yd + 4, { cls: 'dim dash thin' }); f.line(X1, cy + 8, X1, yd + 4, { cls: 'dim dash thin' });
      f.dim(X0, yd, X1, yd, dm.lab, { at: 'b' });
    });
    f.text(cx - Rp + 2, cy - Rp - 8, o.note || 'conductor removed', 'bl');
    return f.svg();
  }

  // Spherical cavity (radius R) in a thick conducting shell (outer radius b) with q inside at distance a.
  function fShell(o = {}) {
    const f = PF.fig();
    const cx = 150, cy = 140, Rp = 80, R2 = 108, ap = (o.A ?? 0.4) * Rp;
    f.hatchBand(f.arcPts(cx, cy, R2, R2, 0, 360).concat(f.arcPts(cx, cy, Rp, Rp, 360, 0)));
    f.circle(cx, cy, R2, { cls: 'thick' }); f.circle(cx, cy, Rp, { cls: 'thick' });
    f.dot(cx, cy, 2.4);
    f.charge(cx + ap, cy, { q: '+', lab: 'q', at: 't', r: 6 });
    f.line(cx, cy + 4, cx, cy + 26, { cls: 'dim dash thin' }); f.line(cx + ap, cy + 8, cx + ap, cy + 26, { cls: 'dim dash thin' });
    f.dim(cx, cy + 22, cx + ap, cy + 22, 'a', { at: 'b' });
    f.line(cx, cy, cx + Rp * Math.cos(130 * DEG), cy - Rp * Math.sin(130 * DEG), { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(cx + 0.5 * Rp * Math.cos(130 * DEG) + 14 * Math.cos(40 * DEG), cy - 0.5 * Rp * Math.sin(130 * DEG) - 14 * Math.sin(40 * DEG), 'R', 'c', 'small');
    if (o.outer) f.tag(cx + R2 * Math.cos(40 * DEG), cy - R2 * Math.sin(40 * DEG), 'b', 'tr', 8, 'small');
    if (o.lab) f.tag(cx + R2 * Math.cos(220 * DEG), cy - R2 * Math.sin(220 * DEG), o.lab, 'bl', 10, 'small');
    if (o.ground) { const gx = cx + R2 * Math.cos(300 * DEG), gy = cy - R2 * Math.sin(300 * DEG); f.line(gx, gy, gx, gy + 14); f.ground(gx, gy + 14); }
    return f.svg();
  }

  // Two grounded walls meeting at angle al (deg); q at radius rq (px), polar angle ph (deg).
  function fWedge(al, ph, o = {}) {
    const f = PF.fig();
    const L = 210, vx = al > 90 ? 160 : 40, vy = 210, t = 10;
    const ax = vx + L * Math.cos(al * DEG), ay = vy - L * Math.sin(al * DEG);
    const nx = Math.cos((al + 90) * DEG) * t, ny = -Math.sin((al + 90) * DEG) * t;
    f.hatchBand([[vx, vy], [vx + L, vy], [vx + L, vy + t], [vx - (al > 90 ? 0 : 0), vy + t]]);
    f.hatchBand([[vx, vy], [ax, ay], [ax + nx, ay + ny], [vx + nx, vy + ny]]);
    f.line(vx, vy, vx + L, vy, { cls: 'thick' }); f.line(vx, vy, ax, ay, { cls: 'thick' });
    f.label(vx + L - 4, vy + t + 4, 'V=0', 'tr', 'small');
    f.tag(ax + nx, ay + ny, 'V=0', al > 90 ? 'bl' : 'l', 6, 'small');
    const ra = o.ra ?? 30;
    f.arc(vx, vy, ra, 0, al, { cls: 'dim' });
    const lm = al / 2 * DEG, lr = ra + (o.labR ?? 16);
    const angLabAt = o.angLab ?? (al / 2);
    f.label(vx + lr * Math.cos(angLabAt * DEG), vy - lr * Math.sin(angLabAt * DEG), `${al}^\\circ`, 'c', 'small');
    const rq = o.rq ?? 130, qx = vx + rq * Math.cos(ph * DEG), qy = vy - rq * Math.sin(ph * DEG);
    f.charge(qx, qy, { q: '+', lab: 'q', at: o.at || 'r' });
    if (o.showA) {
      f.line(vx, vy, qx - 8 * Math.cos(ph * DEG), qy + 8 * Math.sin(ph * DEG), { cls: 'dim dash thin' });
      const mx = vx + 0.62 * rq * Math.cos(ph * DEG), my = vy - 0.62 * rq * Math.sin(ph * DEG);
      f.tag(mx, my, 'a', o.aAt || 'tl', 6, 'small');
      if (o.phLab) { f.arc(vx, vy, 64, 0, ph, { cls: 'dim' }); f.label(vx + 82, vy - 82 * Math.tan(ph / 2 * DEG) + 1, o.phLab, 'l', 'small'); }
    }
    void lm;
    return f.svg();
  }
  // Wedge images on a circle of radius a. items: [[angle, sign, label, at]]
  function fWedgeImg(al, items, o = {}) {
    const f = PF.fig();
    const cx = 150, cy = 140, rq = o.rq ?? 92;
    for (let k = 0; k < 180; k += al) {
      const c = Math.cos(k * DEG), s = Math.sin(k * DEG);
      f.line(cx - 128 * c, cy + 128 * s, cx + 128 * c, cy - 128 * s, { cls: 'dash dim' });
    }
    f.circle(cx, cy, rq, { cls: 'dim thin' });
    items.forEach(([ang, sg, lab, at], i) => {
      f.charge(cx + rq * Math.cos(ang * DEG), cy - rq * Math.sin(ang * DEG), { q: sg, lab, at, image: i > 0, r: 6 });
    });
    f.text(cx, cy + 142, 'walls and their extensions dashed', 'c');
    return f.svg();
  }

  // Two grounded parallel planes, gap L, q at height h (px from the bottom plane, gap 140 px).
  function fTwoPl(o = {}) {
    const f = PF.fig();
    const yb = 200, yt = 60, cx = 170, cy = yb - (o.h ?? 47);
    f.plane(30, 300, yb, { lab: 'V=0' });
    f.plane(30, 300, yt, { side: 'above', lab: 'V=0' });
    f.charge(cx, cy, { q: '+', lab: 'q', at: 'r' });
    f.dim(80, yb, 80, yt, 'L', { at: 'l' });
    f.line(cx - 50, cy, cx - 10, cy, { cls: 'dim dash thin' });
    f.dim(cx - 46, yb, cx - 46, cy, o.xLab || 'x_0', { at: 'l' });
    return f.svg();
  }
  // 90-degree corner (floor + wall) with q at (x, y) in px from the corner.
  function fCorner(o = {}) {
    const f = PF.fig();
    const ox = 50, oy = 220, qx = ox + (o.x ?? 140), qy = oy - (o.y ?? 70);
    f.plane(ox, 300, oy, { lab: 'V=0' });
    f.wall(ox, 30, oy, { side: 'left', lab: 'V=0', laby: 50 });
    f.hatchBand([[ox, oy], [ox - 10, oy], [ox - 10, oy + 10], [ox, oy + 10]]);
    f.charge(qx, qy, { q: '+', lab: 'q', at: 'tr' });
    f.line(qx, qy + 8, qx, oy - 2, { cls: 'dim dash thin' });
    f.line(ox + 2, qy, qx - 8, qy, { cls: 'dim dash thin' });
    f.label(ox + (qx - ox) / 2, qy - 6, o.xLab ?? '2a', 'b', 'small');
    f.label(qx + 6, qy + (oy - qy) / 2, o.yLab ?? 'a', 'l', 'small');
    return f.svg();
  }
  // Grounded cylinder (cross-section) with a line charge parallel to its axis.
  function fCyl(o = {}) {
    const f = PF.fig();
    const Rp = 50, cx = 90, cy = 110, A = o.A ?? 2.4, lx = cx + A * Rp;
    f.hatchBand(f.arcPts(cx, cy, Rp, Rp, 0, 360)); f.circle(cx, cy, Rp, { cls: 'thick' });
    f.dot(cx, cy, 2.2);
    f.line(cx, cy, cx + Rp * Math.cos(135 * DEG), cy - Rp * Math.sin(135 * DEG), { cls: 'dim', arrow: 'end', hs: 6 });
    f.tag(cx + Rp * Math.cos(135 * DEG), cy - Rp * Math.sin(135 * DEG), 'R', 'tl', 8, 'small');
    f.tag(cx + Rp * Math.cos(225 * DEG), cy - Rp * Math.sin(225 * DEG), o.lab ?? 'V=0', 'bl', 10, 'small');
    f.line(cx + 4, cy, lx - 9, cy, { cls: 'dim dash thin' });
    f.charge(lx, cy, { q: '', lab: o.wLab ?? '\\lambda', at: 't' });
    f.text(lx - 20, cy - 34, 'wire parallel to the axis', 'bl');
    const yd = cy + Rp + 22;
    f.line(cx, cy + 4, cx, yd + 4, { cls: 'dim dash thin' }); f.line(lx, cy + 10, lx, yd + 4, { cls: 'dim dash thin' });
    f.dim(cx, yd, lx, yd, 'a', { at: 'b' });
    return f.svg();
  }
  // Two grounded spheres with q midway.
  function fTwoSph() {
    const f = PF.fig();
    const Rp = 40, c1 = 70, c2 = 290, cy = 100;
    for (const c of [c1, c2]) { f.hatchBand(f.arcPts(c, cy, Rp, Rp, 0, 360)); f.circle(c, cy, Rp, { cls: 'thick' }); }
    f.tag(c1 + Rp * Math.cos(225 * DEG), cy - Rp * Math.sin(225 * DEG), 'V=0', 'bl', 8, 'small');
    f.tag(c2 + Rp * Math.cos(315 * DEG), cy - Rp * Math.sin(315 * DEG), 'V=0', 'br', 8, 'small');
    f.charge((c1 + c2) / 2, cy, { q: '+', lab: 'q', at: 't' });
    f.line(c1 + Rp + 4, cy, (c1 + c2) / 2 - 10, cy, { cls: 'dim dash thin' });
    f.line((c1 + c2) / 2 + 10, cy, c2 - Rp - 4, cy, { cls: 'dim dash thin' });
    return f.svg();
  }
  // Grounded plane with a hemispherical boss vs a sphere floating above a plane (side by side).
  function fBossVsFloat() {
    const a = PF.fig();
    a.plane(10, 190, 150, { lab: 'V=0' });
    a.hatchBand(a.arcPts(100, 150, 40, 40, 0, 180)); a.arc(100, 150, 40, 0, 180, { cls: 'thick' });
    a.charge(100, 60, { q: '+', lab: 'q', at: 'r' });
    const b = PF.fig();
    b.plane(10, 190, 150, { lab: 'V=0' });
    b.hatchBand(b.arcPts(100, 95, 28, 28, 0, 360)); b.circle(100, 95, 28, { cls: 'thick' });
    b.tag(100 - 20, 95 - 20, 'V=0', 'tl', 6, 'small');
    b.charge(160, 40, { q: '+', lab: 'q', at: 'r' });
    return PF.row([{ svg: a.svg(), cap: '(i) hemispherical boss' }, { svg: b.svg(), cap: '(ii) sphere above the plane' }]).svg;
  }

  // Corner images: walls dashed (removed), q at (x, y) px from the edge, three images. o.phi: draw the polar angle.
  function fCornerImg(x, y, o = {}) {
    const f = PF.fig();
    const ox = 160, oy = 150;
    f.line(ox, oy, ox + 160, oy, { cls: 'dash dim' }); f.line(ox, oy, ox, oy - 140, { cls: 'dash dim' });
    f.line(ox - 160, oy, ox, oy, { cls: 'dim thin nodecl' }); f.line(ox, oy, ox, oy + 140, { cls: 'dim thin nodecl' });
    f.charge(ox + x, oy - y, { q: '+', lab: 'q', at: 'tr' });
    f.charge(ox - x, oy - y, { q: '-', lab: '-q', at: 'tl', image: true });
    f.charge(ox + x, oy + y, { q: '-', lab: '-q', at: 'br', image: true });
    f.charge(ox - x, oy + y, { q: '+', lab: '+q', at: 'bl', image: true });
    if (o.phi) { f.line(ox, oy, ox + x - 6, oy - y + 3, { cls: 'dim dash thin' }); f.arc(ox, oy, 46, 0, Math.atan2(y, x) / DEG, { cls: 'dim' }); f.label(ox + 54, oy - 10, o.phi, 'l', 'small'); }
    f.text(ox + 158, oy + 8, 'walls removed', 'tr');
    return f.svg();
  }
  // Visible cap of a sphere seen from q at a = A R (solution drawing; not an image figure).
  function fCap(A) {
    const f = PF.fig();
    const Rp = 60, cx = 90, cy = 100, qx = cx + A * Rp, tc = Math.acos(1 / A) / DEG;
    f.circle(cx, cy, Rp, { cls: 'dim' });
    f.arc(cx, cy, Rp, -tc, tc, { cls: 'thick' });
    for (const s of [1, -1]) {
      const tx = cx + Rp * Math.cos(tc * DEG), ty = cy - s * Rp * Math.sin(tc * DEG);
      f.line(qx - 6, cy - s * 3, tx, ty, { cls: 'dim dash thin' });
      f.line(cx, cy, tx, ty, { cls: 'dim thin' });
    }
    f.line(cx, cy, qx - 8, cy, { cls: 'dim dash thin' });
    f.dot(cx, cy, 2.2);
    f.angle(cx, cy, 18, 0, tc, '');
    f.label(cx + 24, cy - 24, '\\theta_c', 'bl', 'small');
    f.charge(qx, cy, { q: '+', lab: 'q', at: 'r' });
    f.text(cx + Rp * Math.cos(tc * DEG) + 8, cy - Rp * Math.sin(tc * DEG) - 6, 'visible cap', 'bl');
    return f.svg();
  }
  // Grounded sphere + uniform field + q: image solution (z to the right).
  function fSphFieldImg() {
    const f = PF.fig();
    const Rp = 54, cx = 100, cy = 120, A = 3, qx = cx + A * Rp, bx = cx + Rp / A;
    f.circle(cx, cy, Rp, { cls: 'dash dim' });
    f.line(cx - Rp - 14, cy, qx + 18, cy, { cls: 'dim dash thin nodecl' });
    f.arrow(cx - 16, cy, cx + 4, cy, { cls: 'thick', hs: 7 });
    f.label(cx - 10, cy + 10, '\\mathbf p', 't', 'small');
    f.charge(bx, cy, { q: '-', lab: "q'", at: 'tr', image: true, r: 6 });
    f.charge(qx, cy, { q: '+', lab: 'q', at: 't' });
    for (const yy of [cy - Rp - 22, cy + Rp + 22]) f.arrow(cx - Rp - 10, yy, qx - 10, yy, { hs: 7 });
    f.label(qx - 4, cy - Rp - 22, 'E_0', 'l', 'small');
    f.text(cx - Rp + 4, cy - Rp - 36, 'sphere removed', 'bl');
    return f.svg();
  }
  // Plots for solutions
  const pSig2R = () => PF.plot({ w: 340, h: 200, x: [0, Math.PI], y: [-3.3, 0.3], xl: '\\theta', yl: '\\sigma\\ \\text{in units } q/4\\pi R^2', zero: true,
    xt: [[Math.PI / 2, '\\pi/2'], [Math.PI, '\\pi']], yt: [[-3, '-3'], [-1, '-1']], curves: [{ f: (t) => -3 / Math.pow(5 - 4 * Math.cos(t), 1.5) }] });
  const pSigLine = () => PF.plot({ w: 340, h: 200, x: [-7, 7], y: [-0.36, 0.06], xl: 'x/d', yl: '\\sigma\\ \\text{in units } \\lambda/d', zero: true,
    xt: [[-1.732, '-\\sqrt3'], [1.732, '\\sqrt3']], yt: [[-0.318, '-1/\\pi']], curves: [{ f: (x) => -1 / (Math.PI * (1 + x * x)) }] });
  const pF8 = () => PF.plot({ w: 340, h: 210, x: [1, 4], y: [-1, 0.4], xl: 'a/R', yl: 'F\\ \\text{in units } q^2/4\\pi\\varepsilon_0R^2', zero: true,
    xt: [[1.618, '1.618'], [3, '3']], yt: [[0.2, '0.2'], [-0.5, '-0.5']], curves: [{ f: (A) => (1 + 1 / A) / (A * A) - A / Math.pow(A * A - 1, 2), from: 1.05 }] });
  const pF11 = () => PF.plot({ w: 340, h: 210, x: [1, 5], y: [-1, 0.3], xl: 'a/R', yl: 'F\\ \\text{in units } q^2/4\\pi\\varepsilon_0R^2', zero: true,
    xt: [[5 / 3, '5/3'], [4, '4']], yt: [[0.2, '0.2'], [-0.5, '-0.5']], curves: [{ f: (A) => (375 / 256) / (A * A) - A / Math.pow(A * A - 1, 2), from: 1.05 }] });

  // =====================================================================================
  // Lesson A: concepts
  // =====================================================================================
  const lessonA = {
    id: 'uD-img-concepts', title: 'Images ladder: concepts, easy → brutal',
    steps: [
      R(md`
        ### Level 1: recognize

        One idea runs the whole chapter. In a region of space, $V$ is fixed by the charge **inside the region** plus the **boundary data** (uniqueness). So you may delete a conductor and put fictitious charges **outside the region**; if together with the real charges they reproduce the boundary data, the potential they make is *the* potential in the region.

        | Conductor | Real charge | Image system |
        |---|---|---|
        | grounded plane | $q$ at height $d$ | $-q$ at depth $d$ |
        | grounded sphere, radius $R$ | $q$ at $a>R$ | $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$ |
        | grounded spherical cavity, radius $R$ | $q$ at $a<R$ | $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$ (outside the cavity) |
        | two grounded half-planes at angle $\pi/n$ | $q$ | $2n-1$ images, alternating in sign |
        | grounded plane | line $\lambda$ at height $d$ | $-\lambda$ at depth $d$ |

        Level 1 is fast: name the image before you compute anything.
      `),

      Q(md`A point charge $q$ is a height $d$ above a large grounded conducting plane. Which image system gives the right $V$ above the plane?`,
        [md`$+q$ a depth $d$ below the plane`, md`$-q$ a depth $d$ below the plane`, md`$-q$ on the plane, directly below $q$`, md`$-q/2$ a depth $d$ below the plane`], 1,
        [md`Then the two potentials add on the plane instead of cancelling: $V = \dfrac{2q}{4\pi\ep\srm}\ne0$.`,
          null,
          md`An image on the plane is not equally far from each plane point as $q$ is, and it makes $V\to-\infty$ at the foot. Every point of the plane must be equally far from $q$ and its image: that needs the mirror point.`,
          md`On the plane $q$ and $-q/2$ are equally far away, so $V = \dfrac{q/2}{4\pi\ep\srm}\ne0$.`],
        md`Every point of the plane is equidistant from $q$ and its mirror point, so $q$ and $-q$ at the mirror point cancel there: BC $V=0$ on the plane holds. The image is below the plane, outside the region $z\ge0$.`,
        { figHtml: fPlane({}) }),

      Q(md`A charge $q$ is at $a = 4R$ from the center of a grounded sphere of radius $R$. The image is`,
        [md`$-\dfrac q4$ at the center`, md`$-4q$ at $\dfrac R4$ from the center`, md`$-q$ at the mirror point, a distance $3R$ inside the surface`, md`$-\dfrac q4$ at $\dfrac R4$ from the center, on the line toward $q$`], 3,
        [md`A charge at the center puts the same potential on every point of the sphere. It cannot cancel $q$'s potential, which varies over the sphere.`,
          md`The image of an outside charge is smaller than $q$, not larger: $|q'| = \dfrac Raq$.`,
          md`That is the plane rule. A sphere is curved, so the image is smaller and much closer to the center.`,
          null],
        md`$q' = -\dfrac Raq = -\dfrac q4$ at $b = \dfrac{R^2}{a} = \dfrac R4$. Both numbers come from requiring $V(R,\theta) = 0$ at every $\theta$.`,
        { figHtml: fSph({ A: 4, lab: 'V=0', ground: true }) }),

      Q(md`A charge sits inside a grounded $90^\circ$ corner (two half-planes meeting at a right angle). The images are`,
        [md`one, $-q$, mirrored through the corner line`, md`two, both $-q$, one behind each wall`, md`three: $-q$ behind each wall and $+q$ diagonally opposite`, md`three, all $-q$`], 2,
        [md`The diagonal image alone gives $V\ne0$ on both walls.`,
          md`The image behind wall 1 spoils $V=0$ on wall 2 (it is not mirror-symmetric about wall 2). A third image is needed to fix that.`,
          null,
          md`Pair the images across each wall: across the floor, $q$ pairs with the image below it and the image behind the wall pairs with the diagonal one. Each pair must be $\pm$, so the diagonal one is $+q$.`],
        md`$90^\circ = 180^\circ/2$, $n=2$, so $2n-1 = 3$ images. Across each wall the charges come in $\pm$ mirror pairs, which forces the signs $-,-,+$.`,
        { figHtml: fCorner({}) }),

      Q(md`A long straight line charge $\lambda$ runs parallel to a grounded plane at height $d$. The image is`,
        [md`$-\lambda$ at depth $d$`, md`$-\lambda$ at depth $d$, plus a constant added to $V$ to make the plane zero`, md`$-\lambda/2$ at depth $d$`, md`a point charge $-\lambda d$ below the line`], 0,
        [null,
          md`The pair gives $V = \dfrac{\lambda}{2\pi\ep}\ln\dfrac{s'}{s}$, and on the plane $s' = s$, so $\ln 1 = 0$ already. No constant needed (contrast the cylinder in Level 6).`,
          md`The plane needs equal and opposite line charges at mirror positions; $-\lambda/2$ leaves $V\ne0$ on the plane.`,
          md`A line charge needs a line image: the problem is the same at every position along the wire.`],
        md`Mirror the line: $-\lambda$ at depth $d$. $V = \dfrac{\lambda}{2\pi\ep}\ln\dfrac{s'}{s}$, with $s,s'$ the distances to the line and its image. On the plane $s = s'$ and $V = 0$.`,
        { figHtml: fPlane({ kind: 'line' }) }),

      Q(md`A charge $q$ sits at $a<R$ inside a spherical cavity of radius $R$ in a grounded conductor. The image is`,
        [md`$-\dfrac aRq$ at $\dfrac{R^2}{a}$`, md`$-q$ at the mirror point $2R-a$`, md`$-\dfrac Raq$ at $\dfrac{R^2}{a}$, outside the cavity`, md`$-\dfrac Raq$ at $\dfrac{a^2}{R}$, inside the cavity`], 2,
        [md`The ratio is flipped. With the image at $b = R^2/a$ and $q$ at $a$, the sphere is where $\srm'/\srm = R/a$, so the image must be $R/a$ times bigger.`,
          md`That is the plane rule; it doesn't make $V = 0$ on a curved wall.`,
          null,
          md`An image inside the cavity would be inside the region of interest, adding charge there. Images must lie outside the region.`],
        md`Same formulas as the outside problem, read the other way: $q' = -\dfrac Raq$, bigger than $q$ in size, at $b = \dfrac{R^2}{a}>R$, which is in the metal, outside the region $r<R$.`,
        { figHtml: fShell({ A: 0.4, lab: 'V=0', ground: true }) }),

      R(md`
        ### Level 2: set up

        Before any image, write the region and the numbered boundary conditions. The translations you need:

        - **grounded:** $V = 0$ on that surface.
        - **held at $V_0$:** $V = V_0$ on it; its total charge is whatever it takes.
        - **isolated with charge $Q$ (or neutral, $Q=0$):** $V = $ an unknown constant on it, and $\oint\sigma\,da = Q$.
        - **far away:** $V\to0$ (for localized charge), or $V\to-E_0z$ (uniform field far away).

        The image formula is valid only **in the region**. Images must sit **outside** it.
      `),

      Q(md`For $q$ above a grounded plane, $V = \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} - \dfrac q{\srm'}\right)$. Where is this formula the real potential?`,
        [md`everywhere`, md`only for $z\le0$`, md`only for $z\ge0$; below the surface (in the metal) the real $V$ is $0$`, md`only on the plane`], 2,
        [md`Below the plane the formula gives nonzero values (it even blows up at the image), but the real metal is at $V = 0$ and has no charge at the image point.`,
          md`That is the wrong side: the region of interest is where the real charge lives.`,
          null,
          md`It is correct on the plane (0), but it is also correct everywhere above it.`],
        md`Uniqueness guarantees agreement only in the region whose boundary data you matched: $z\ge0$. Below, the image formula describes a fictitious world.`,
        { figHtml: fPlane({}) }),

      Q(md`An **isolated, uncharged** conducting sphere sits near $q$. Which boundary conditions define the problem outside it?`,
        [md`$V(R,\theta) = 0$; $V\to0$ at infinity`, md`$\sigma = 0$ everywhere on the sphere; $V\to0$`, md`$\dfrac{\partial V}{\partial r} = 0$ on the sphere; $V\to0$`, md`$V(R,\theta) = V_s$ (a constant, unknown); $\oint\sigma\,da = 0$; $V\to0$`], 3,
        [md`That is grounded. Grounding lets charge flow in; an isolated sphere can't gain any.`,
          md`Neutral means the **total** is zero. Locally $\sigma\ne0$: negative facing $q$, positive behind.`,
          md`That is an insulating (zero normal field) surface, not a conductor.`,
          null],
        md`A conductor is an equipotential, but its value isn't given; the extra condition (total charge $0$) fixes it. That is the second uniqueness theorem's data set.`,
        { figHtml: fSph({ A: 3, lab: 'Q=0' }) }),

      Q(md`A cavity of radius $R$ in a conductor held at $V_0$ contains a charge $q$. Which condition set fixes $V$ **in the cavity**?`,
        [md`$V(R,\theta) = V_0$ only`, md`$V(R,\theta) = V_0$ and $V\to0$ at infinity`, md`$V(R,\theta) = 0$, since the metal shields the cavity`, md`$V(R,\theta) = V_0$ and $\vb E = 0$ at the center`], 0,
        [null,
          md`Infinity isn't part of the cavity region. The cavity's only boundary is its wall.`,
          md`Shielding means outside charges don't affect the cavity field; the wall is still at $V_0$, not $0$.`,
          md`One condition too many: the field at the center is whatever the solution gives (here it isn't zero, because $q$ is off-center).`],
        md`The cavity region is bounded by one closed surface, the wall. Its potential plus the charge inside fix $V$ there completely (first uniqueness theorem).`,
        { figHtml: fShell({ A: 0.4, lab: 'V=V_0' }) }),

      Q(md`A student solving the grounded sphere adds a second image at $r = 2a$, outside the sphere, to "fix" a stray term. What breaks?`,
        [md`Nothing, as long as $V(R,\theta)$ still comes out $0$`, md`That image sits inside the region $r\ge R$, so the image system has the wrong charge density there, and uniqueness no longer says it matches the real problem`, md`$V$ no longer goes to $0$ at infinity`, md`Only the force on $q$ changes`], 1,
        [md`Uniqueness needs **both** the right boundary values and the right charge in the region. An extra charge in the region is a different problem.`,
          null,
          md`A point charge's potential still dies at infinity.`,
          md`$V$ changes everywhere in the region, so everything changes.`],
        md`Images are allowed only outside the region: inside the conductor, behind the plane, beyond the cavity wall. The region must contain exactly the real charges.`,
        { figHtml: fSph({ A: 2, lab: 'V=0', ground: true }) }),

      Q(md`A charge sits between two grounded parallel planes. How many images does the exact solution need?`,
        [md`two: one behind each plane`, md`three, like a corner`, md`none: between plates the field is uniform`, md`infinitely many: $\pm q$ at $\pm x_0 + 2nL$ for all integers $n$`], 3,
        [md`The image behind the bottom plane is not mirrored in the top plane, so it spoils $V=0$ there. Fixing that needs another image, which spoils the bottom, and so on.`,
          md`The corner works because the two walls meet at $\pi/n$. Parallel planes are an "angle $0$" wedge: $n\to\infty$.`,
          md`That is for charge spread on the plates. A point charge between plates has a localized field.`,
          null],
        md`Two parallel mirrors: images of images forever, alternating in sign, period $2L$. The sum converges because opposite charges come in close pairs.`,
        { figHtml: fTwoPl({}) }),

      R(md`
        ### Level 3: the standard results

        Results you should be able to rebuild in a minute ($k = \dfrac{1}{4\pi\ep}$ in words, written out in formulas):

        - **Plane**, $q$ at height $d$: $\sigma(\rho) = -\dfrac{qd}{2\pi(\rho^2+d^2)^{3/2}}$, total $-q$, force $\dfrac{1}{4\pi\ep}\dfrac{q^2}{(2d)^2}$ toward the plane.
        - **Grounded sphere**, $q$ at $a$: $\sigma(\theta) = -\dfrac{q(a^2-R^2)}{4\pi R(R^2+a^2-2Ra\cos\theta)^{3/2}}$, total $-\dfrac Raq$, force $\dfrac{1}{4\pi\ep}\dfrac{q^2Ra}{(a^2-R^2)^2}$ toward the sphere.
        - **Line** $\lambda$ at height $d$: $\sigma(x) = -\dfrac{\lambda d}{\pi(x^2+d^2)}$.
        - **Energy** with grounded conductors: $W = \tfrac12\,q\,V_{\text{image}}(\text{at }q)$. The $\tfrac12$ is not optional.

        $\sigma = -\ep\,\partial V/\partial n$, with $n$ pointing from the metal into the region. It is largest in size where $q$ is closest.
      `),

      Q(md`$q$ is at height $d$ above a grounded plane. Where is $|\sigma|$ largest, and what is $\sigma$ there?`,
        [md`directly below $q$: $\sigma = -\dfrac{q}{2\pi d^2}$`, md`directly below $q$: $\sigma = -\dfrac{q}{4\pi d^2}$`, md`on a ring of radius $d$ around the foot`, md`it is uniform, $-q/A$ for a plate of area $A$`], 0,
        [null,
          md`That is half the right value. Just above the foot, $q$ and its image each give $\dfrac{q}{4\pi\ep d^2}$, both pointing down: $E = \dfrac{q}{2\pi\ep d^2}$, and $\sigma = -\ep E$.`,
          md`$\sigma(\rho)\propto(\rho^2+d^2)^{-3/2}$ only decreases with $\rho$; there is no ring maximum.`,
          md`An infinite plate has infinite area; the induced charge is concentrated within a few $d$ of the foot.`],
        md`$\sigma(\rho) = -\dfrac{qd}{2\pi(\rho^2+d^2)^{3/2}}$ is largest in size at $\rho = 0$: $-\dfrac{q}{2\pi d^2}$.`,
        { figHtml: fPlane({}) }),

      Q(md`Same plane. Within what radius $\rho$ of the foot does **half** of the induced charge lie?`,
        [md`$\rho = d$`, md`$\rho = \sqrt3\,d$`, md`$\rho = 2d$`, md`$\rho = d/\sqrt2$`], 1,
        [md`Inside $\rho = d$ there is $1-\dfrac{1}{\sqrt2}\approx29\%$.`,
          null,
          md`Inside $2d$: $1 - \dfrac{1}{\sqrt5}\approx55\%$. Close, but not half.`,
          md`Inside $d/\sqrt2$: $1-\sqrt{\tfrac23}\approx18\%$.`],
        md`$Q(\rho) = \displaystyle\int_0^\rho\sigma\,2\pi\rho'\,d\rho' = -q\left(1 - \frac{d}{\sqrt{\rho^2+d^2}}\right)$. Half when $\sqrt{\rho^2+d^2} = 2d$: $\rho = \sqrt3\,d$. The tail is long, $\sigma\propto1/\rho^3$.`,
        { figHtml: fPlane({}) }),

      Q(md`$q$ sits inside a spherical cavity of radius $R$ in a grounded conductor, at $a$ from the center. Total charge induced on the cavity wall?`,
        [md`$-\dfrac Raq$, the image charge`, md`$-q$`, md`$0$, because the conductor is grounded`, md`$-\dfrac aRq$`], 1,
        [md`Tempting, but the image is outside the region of interest. A Gaussian surface inside the metal (where $\vb E = 0$) encloses $q$ and the wall charge, not the image.`,
          null,
          md`Grounded fixes $V$, not the charge.`,
          md`Not a quantity that appears anywhere here.`],
        md`Gauss's law on a surface inside the metal: $\vb E = 0$ there, so $Q_{\text{enc}} = q + Q_{\text{wall}} = 0$. The image's size, $\dfrac Raq$, is bigger than $q$ and is **not** the induced charge in this geometry.`,
        { figHtml: fShell({ A: 0.4, lab: 'V=0', ground: true }) }),

      Q(md`The force on $q$ at height $d$ above a grounded plane, compared with the force between $q$ and a real $-q$ a distance $d$ away, is`,
        [md`$\tfrac14$ as big`, md`the same`, md`$\tfrac12$ as big`, md`twice as big`], 0,
        [null,
          md`The image is at depth $d$, so the separation is $2d$, not $d$.`,
          md`The $\tfrac12$ belongs to the energy, not the force.`,
          md`The plane doesn't add to the image; it **is** the image.`],
        md`$F = \dfrac{1}{4\pi\ep}\dfrac{q^2}{(2d)^2}$: the separation is $2d$, a factor $\tfrac14$.`,
        { figHtml: fPlane({}) }),

      Q(md`A line charge $\lambda$ at height $d$ above a grounded plane. If you double $d$, the force per unit length on the line`,
        [md`drops to $\tfrac14$`, md`halves`, md`stays the same`, md`drops to $\tfrac18$`], 1,
        [md`That is the point-charge scaling, $1/d^2$. A line's field falls as $1/s$.`,
          null,
          md`The field of the image line at the wire, $\dfrac{\lambda}{2\pi\ep(2d)}$, depends on $d$.`,
          md`No; $1/d^3$ is a dipole-type scaling.`],
        md`$\dfrac FL = \lambda\cdot\dfrac{\lambda}{2\pi\ep(2d)} = \dfrac{\lambda^2}{4\pi\ep d}\propto\dfrac1d$.`,
        { figHtml: fPlane({ kind: 'line' }) }),

      Q(md`Far from a **grounded** sphere ($a\gg R$), the attractive force on $q$ falls off as`,
        [md`$1/a^2$`, md`$1/a^3$`, md`$1/a^4$`, md`$1/a^5$`], 1,
        [md`That would need an image of fixed size. Here $|q'| = qR/a$ shrinks as $q$ moves away.`,
          null,
          md`Not for a grounded sphere. (A dipole near a plane goes as $1/d^4$.)`,
          md`That is the **neutral** sphere: its net image charge is zero, so only an induced dipole is left.`],
        md`$F = \dfrac{1}{4\pi\ep}\dfrac{q^2Ra}{(a^2-R^2)^2}\approx\dfrac{1}{4\pi\ep}\dfrac{q\,(qR/a)}{a^2}\propto\dfrac{1}{a^3}$: a charge $\dfrac Raq$ at distance $\approx a$.`,
        { figHtml: fSph({ A: 4, lab: 'V=0', ground: true }) }),

      Q(md`As $q$ approaches a grounded sphere ($a\to R^+$), the force on $q$ tends to`,
        [md`$\dfrac{1}{4\pi\ep}\dfrac{q^2}{4(a-R)^2}$, the plane result with $d = a-R$`, md`$\dfrac{1}{4\pi\ep}\dfrac{q^2}{R^2}$`, md`$\dfrac{1}{4\pi\ep}\dfrac{q^2}{(a-R)^2}$`, md`a finite limit, because the image shrinks`], 0,
        [null,
          md`That uses the distance to the center. The image is near the surface, not at the center.`,
          md`That puts the image on the surface. It is a distance $a - R$ inside it, so the separation is $\approx2(a-R)$.`,
          md`As $a\to R$ the image grows to $-q$, it doesn't shrink.`],
        md`$\dfrac{q^2Ra}{(a-R)^2(a+R)^2}\to\dfrac{q^2R^2}{(a-R)^2\,4R^2} = \dfrac{q^2}{4(a-R)^2}$. Up close the sphere looks flat.`,
        { figHtml: fSph({ A: 1.3, lab: 'V=0', ground: true }) }),

      Q(md`$q$ is brought slowly from infinity to height $d$ above a grounded plane. The work **you** do is`,
        [md`$-\dfrac{q^2}{8\pi\ep d}$, i.e. $q\,V_{\text{image}}$`, md`$-\dfrac{q^2}{16\pi\ep d}$`, md`$0$, the plane is grounded`, md`$+\dfrac{q^2}{16\pi\ep d}$`], 1,
        [md`That treats the image as a fixed charge sitting at depth $d$ all along. It isn't: it follows $q$ in.`,
          null,
          md`The plane pulls on $q$ the whole way; the force does work.`,
          md`Wrong sign: the plane attracts, so you hold $q$ back and do negative work.`],
        md`At height $z$, the force is $\dfrac{q^2}{4\pi\ep(2z)^2}$ toward the plane. You push the other way: $W = -\displaystyle\int_\infty^d\frac{q^2}{16\pi\ep z^2}dz = -\frac{q^2}{16\pi\ep d}$, half of $qV_{\text{image}}$.`,
        { figHtml: fPlane({}) }),

      Q(md`Which reason for that factor $\tfrac12$ is correct?`,
        [md`The image moves as $q$ moves, so the force grows only gradually from $0$; integrating it gives half of what a fixed image would give.`, md`Half of the field lines end on the plane.`, md`The conductor absorbs half the energy as heat.`, md`$W = \tfrac12 QV$ always, for any charge in any field.`], 0,
        [null,
          md`All of $q$'s field lines end on the plane (total induced charge $-q$).`,
          md`Electrostatic assembly done slowly is lossless.`,
          md`$\tfrac12$ appears when the charges producing $V$ are themselves assembled in the process. Moving $q$ through a **fixed** external field costs $qV$, no half.`],
        md`Two equivalent views: (1) the image follows $q$, so $F(z)\propto1/(2z)^2$ and the integral is $\tfrac12qV_{\text{image}}$; (2) $W = \tfrac12\sum qV$ over real charges, and all the induced charge sits at $V=0$, leaving $\tfrac12qV_{\text{ind}}(q)$, where $V_{\text{ind}}$ at $q$ equals the image potential.`,
        { figHtml: fPlane({}) }),

      Q(md`$q$ is inside a grounded spherical cavity, off-center. Which way is the force on it?`,
        [md`toward the center (restoring)`, md`zero: a closed grounded shell shields the charge`, md`tangential`, md`away from the center, toward the nearest wall`], 3,
        [md`The image is beyond the near wall, on the same side as $q$, and attracts $q$ outward.`,
          md`Shielding protects the **outside** from $q$. Inside, the induced charge is lopsided (crowded at the near wall) and pulls on $q$.`,
          md`By symmetry the force is along the line through the center.`,
          null],
        md`The image $-\dfrac Raq$ sits at $b = \dfrac{R^2}{a}$, on $q$'s side, beyond the wall. Force $\dfrac{1}{4\pi\ep}\dfrac{q^2Ra}{(R^2-a^2)^2}$, outward. At the center it is zero, but unstable.`,
        { figHtml: fShell({ A: 0.4, lab: 'V=0', ground: true }) }),

      R(md`
        ### Level 4: one twist

        Each twist adds **one** image (or one constant) to a standard system. Check three things every time: the old BCs still hold, the new BC holds, and the new piece sits outside the region.

        | Sphere ($q$ outside) | Add to the grounded pair ($q' = -\tfrac Raq$ at $b$) |
        |---|---|
        | held at $V_0$ | $q_0 = 4\pi\ep RV_0$ at the center |
        | isolated, neutral | $+\dfrac Raq$ at the center |
        | isolated, total charge $Q$ | $Q + \dfrac Raq$ at the center |

        A center charge works because it shifts the sphere's potential uniformly and the center is outside the region $r\ge R$. **Wedges:** opening angle $\pi/n$ ($n$ an integer) works with $2n-1$ images. **Dipoles:** image each charge; for the plane $z=0$, $\vb p = (p_x,p_y,p_z)$ has image $\vb p' = (-p_x,-p_y,+p_z)$.
      `),

      Q(md`An isolated **neutral** conducting sphere is a distance $a$ from $q$. Its potential is`,
        [md`$0$, since it's neutral`, md`$\dfrac{1}{4\pi\ep}\dfrac{q}{a-R}$, the potential of $q$ at the nearest point`, md`$\dfrac{1}{4\pi\ep}\dfrac qR$`, md`$\dfrac{1}{4\pi\ep}\dfrac qa$`], 3,
        [md`Neutral means $Q = 0$, not $V = 0$. Only grounding sets $V = 0$.`,
          md`The sphere is an equipotential; its value isn't $q$'s potential at any special surface point.`,
          md`That is what you'd get with $q$ at the center.`,
          null],
        md`Evaluate at the center (inside the metal, so it's the sphere's potential): $q$ gives $\dfrac{q}{4\pi\ep a}$; the induced charge is all at distance $R$ and totals $0$, giving $\dfrac{0}{4\pi\ep R}$. In the image picture, the center image $+\dfrac Raq$ gives $\dfrac{qR/a}{4\pi\ep R} = \dfrac{q}{4\pi\ep a}$ on the surface. Same answer.`,
        { figHtml: fSph({ A: 3, lab: 'Q=0' }) }),

      Q(md`An isolated sphere carries total charge $Q$ and $q$ is at $a$. Besides $q' = -\dfrac Raq$ at $b$, the image system needs, at the center,`,
        [md`$Q$`, md`$Q - \dfrac Raq$`, md`$Q + \dfrac Raq$`, md`$Q + q$`], 2,
        [md`Then the images add to $Q + q'\ne Q$, and Gauss's law around the sphere gives the wrong total.`,
          md`Sign error: the center image must cancel $q'$'s contribution to the total.`,
          null,
          md`$q$ is real and outside; it is not part of the sphere's charge.`],
        md`Two conditions: the sphere is an equipotential (the center charge keeps that) and the images inside sum to $Q$: $q' + q_c = Q\Rightarrow q_c = Q + \dfrac Raq$.`,
        { figHtml: fSph({ A: 3, lab: 'Q' }) }),

      Q(md`$q$ is inside a cavity of radius $R$ whose wall is held at $V_0$. How do you change the grounded-cavity image solution?`,
        [md`Add $4\pi\ep RV_0$ at the center, as for the outside problem`, md`Add the constant $V_0$ to $V$`, md`Multiply the image by $V_0$`, md`Add a charge $4\pi\ep RV_0$ at $b = R^2/a$`], 1,
        [md`The center is **inside** the cavity, i.e. in the region of interest. A charge there changes the problem.`,
          null,
          md`Units don't even work, and scaling the image destroys $V = 0$ from the $q,q'$ pair.`,
          md`At $b$ its potential varies over the wall.`],
        md`$V = V_0 + \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} + \dfrac{q'}{\srm'}\right)$. A constant satisfies Laplace's equation, adds no charge anywhere, and lifts the whole wall to $V_0$. Outside the sphere problem, the same job needs a center charge because there $V$ must also vanish at infinity.`,
        { figHtml: fShell({ A: 0.4, lab: 'V=V_0' }) }),

      Q(md`Same cavity. Compared with the grounded case, $\sigma$ on the cavity wall when the conductor is held at $V_0$ is`,
        [md`shifted by $\ep V_0/R$ everywhere`, md`scaled by a factor depending on $V_0$`, md`unchanged`, md`zero, the battery cancels it`], 2,
        [md`That's the outside-sphere result (from a center charge). Here the change is a constant in $V$, which has zero gradient.`,
          md`No; $\sigma$ depends only on the field at the wall.`,
          null,
          md`The wall must still carry $-q$ in total (Gauss in the metal).`],
        md`$\sigma = \ep\,\partial V/\partial r$ at the wall, and adding $V_0$ doesn't change any derivative. The field and force inside the cavity don't know about $V_0$ at all. Only the charge on the **outer** surface changes.`,
        { figHtml: fShell({ A: 0.4, lab: 'V=V_0' }) }),

      Q(md`The conductor around the cavity is a thick shell with outer radius $b$, held at $V_0$. The charge on its **outer** surface is`,
        [md`$+q$`, md`$4\pi\ep bV_0 - q$`, md`$4\pi\ep RV_0$`, md`$4\pi\ep bV_0$, wherever $q$ is in the cavity`], 3,
        [md`That's the **neutral, isolated** shell. Here the battery fixes $V$, not $Q$.`,
          md`That is the total charge of the shell (inner $-q$ plus outer). The outer surface alone is $4\pi\ep bV_0$.`,
          md`The outer surface is at radius $b$, not $R$.`,
          null],
        md`Outside, the field is $\dfrac{Q_{\text{out}}}{4\pi\ep r^2}$, uniform over the outer sphere (the metal shields the cavity's lopsidedness). $V(b) = \dfrac{Q_{\text{out}}}{4\pi\ep b} = V_0$.`,
        { figHtml: fShell({ A: 0.4, lab: 'V=V_0', outer: true }) }),

      Q(md`Two grounded half-planes meet at $60^\circ$ with $q$ between them. The number of images is`,
        [md`$2$`, md`$3$`, md`$5$`, md`$6$`], 2,
        [md`Each wall's image spoils the other wall; you need images of images.`,
          md`$3$ is the $90^\circ$ count.`,
          null,
          md`$6$ is the number of charges in total, counting $q$.`],
        md`$60^\circ = 180^\circ/3$, $n = 3$: $2n-1 = 5$ images on the circle through $q$ centered on the edge, alternating in sign, at $\pm\phi_0 + 120^\circ k$.`,
        { figHtml: fWedge(60, 22, {}) }),

      Q(md`Why does the image method fail for a $120^\circ$ grounded wedge?`,
        [md`It needs infinitely many images`, md`Reflecting back and forth puts an image ($-q$ at angle $120^\circ - \phi_0$) **inside** the wedge`, md`The images don't alternate in sign`, md`It works with just two images`], 1,
        [md`The reflections close after 6 charges; the count is finite.`,
          null,
          md`They do alternate; that's not the problem.`,
          md`With only the two direct mirror images, each one spoils the other wall's $V=0$.`],
        md`Reflecting back and forth in walls at $0^\circ$ and $120^\circ$ generates $+q$ at $\phi_0 + 120^\circ k$ and $-q$ at $-\phi_0 + 120^\circ k$ ($k = 0,1,2$). One of these, $-q$ at $120^\circ-\phi_0$, lies between the walls, in the region. The method needs $180^\circ/\alpha$ to be an integer.`,
        { figHtml: fWedge(120, 40, { rq: 110, at: 'r' }) }),

      Q(md`A small dipole $\vb p$ points **parallel** to a grounded plane at height $d$. Its image is`,
        [md`$\vb p$, parallel to the original`, md`$-\vb p$: antiparallel, at the mirror point`, md`perpendicular to the plane`, md`none needed: a dipole is neutral`], 1,
        [md`Image each charge: the $+$ end gets a $-$ image below it, the $-$ end a $+$ image. For a parallel dipole that reverses it.`,
          null,
          md`Mirroring keeps the horizontal positions of the two ends; only their signs flip.`,
          md`Neutral overall, but its field isn't zero at the plane.`],
        md`$\vb p' = (-p_x,-p_y,+p_z)$. A horizontal dipole flips; a vertical one keeps its direction (head-to-tail with its image).`,
        { figHtml: fPlane({ kind: 'dip', th: 90, h: 70 }) }),

      Q(md`A dipole at height $d$ above a grounded plane is tilted at $\theta$ from the normal. The torque from the induced charge turns it toward`,
        [md`lying flat, parallel to the plane`, md`pointing straight down at the plane only`, md`perpendicular to the plane (up or down; both are equally good)`, md`nothing: the torque is zero by symmetry`], 2,
        [md`Flat is the **maximum** of the energy $W = -\dfrac{p^2(1+\cos^2\theta)}{64\pi\ep d^3}$.`,
          md`$W$ depends on $\cos^2\theta$, so up and down are equivalent.`,
          null,
          md`Only at $\theta = 0,\pi/2,\pi$. In between, $\tau\propto\sin2\theta$.`],
        md`$W(\theta) = -\dfrac{p^2(1+\cos^2\theta)}{64\pi\ep d^3}$ is lowest at $\theta = 0$ or $\pi$: head-to-tail with the image. The torque $|\tau| = \dfrac{p^2\sin2\theta}{64\pi\ep d^3}$ drives it there.`,
        { figHtml: fPlane({ kind: 'dip', th: 35, h: 70 }) }),

      Q(md`A dipole perpendicular to a grounded plane, at height $d$. The force on it`,
        [md`is zero: the dipole is neutral`, md`attracts, and falls as $1/d^2$`, md`repels, and falls as $1/d^4$`, md`attracts, and falls as $1/d^4$`], 3,
        [md`The field of the image dipole is non-uniform, so a net force acts.`,
          md`That is the point-charge scaling.`,
          md`Head-to-tail dipoles attract.`,
          null],
        md`Two coaxial head-to-tail dipoles $2d$ apart: $F = \dfrac{6p^2}{4\pi\ep(2d)^4} = \dfrac{3p^2}{32\pi\ep d^4}$, attractive. Check: $-\partial W/\partial d$ with $W = -\dfrac{2p^2}{64\pi\ep d^3}$.`,
        { figHtml: fPlane({ kind: 'dip', th: 0, h: 70 }) }),

      Q(md`A sphere held at $V_0$ (same sign as $q$) has one point $a^*$ where the force on $q$ is zero. If you raise $V_0$, $a^*$`,
        [md`moves outward`, md`moves inward, toward the sphere`, md`doesn't move`, md`disappears`], 1,
        [md`Bigger repulsion has to be balanced by a stronger attraction, and the attraction is stronger closer in.`,
          null,
          md`$a^*$ solves $q_0 = \dfrac{qRa^3}{(a^2-R^2)^2}$, which depends on $q_0 = 4\pi\ep RV_0$.`,
          md`Close enough, the attraction always wins, and far away the repulsion wins; a crossing always exists.`],
        md`The balance needs $q_0 = \dfrac{qRa^3}{(a^2-R^2)^2}$. The right side **decreases** with $a$ (from $\infty$ at $a = R$ to $\approx qR/a$ far away). Larger $q_0$ → smaller $a^*$.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`A sphere is held at a large $V_0$ with the same sign as $q$. Where is $\sigma$ largest (most positive)?`,
        [md`at the point facing $q$`, md`on the equator`, md`it is uniform`, md`at the point farthest from $q$`], 3,
        [md`That is where the induced (negative) part is strongest.`,
          md`The induced part varies monotonically from the near point to the far point.`,
          md`The $V_0$ part is uniform, the induced part isn't.`,
          null],
        md`$\sigma = \sigma_{\text{grounded}}(\theta) + \dfrac{\ep V_0}{R}$. The first term is negative everywhere and smallest in size at $\theta = \pi$, so the sum is largest there.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      R(md`
        ### Level 5: exam level

        **Uniqueness, stated so you can use it.**

        1. **First theorem.** In a region where $\rho$ is given, $V$ is fixed by its values on the whole boundary (including "at infinity" if the region is unbounded). Variant: on each piece of boundary you may give $V$ **or** $\partial V/\partial n$ (all $\partial V/\partial n$ fixes $V$ up to a constant).
        2. **Second theorem.** In a region bounded by conductors, $\vb E$ is fixed by $\rho$ in the region and the **total charge on each conductor**.
        3. **Proof idea.** Two solutions differ by $V_3$ with $\lap V_3 = 0$ and zero boundary data. $\displaystyle\int|\nabla V_3|^2\,d\tau = \oint V_3\,\nabla V_3\cdot d\vb a = 0$, so $\nabla V_3 = 0$.

        So a guess that satisfies Poisson's equation in the region and every BC is **the** answer, however you got it. **Earnshaw:** in a charge-free region $V$ equals its average over any sphere around a point, so it has no local max or min; no charge can rest in stable equilibrium under electrostatic forces alone.

        **Sphere held at $V_0$:** force on $q$ (positive = away) $F = \dfrac{q}{4\pi\ep}\left[\dfrac{q_0}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}\right]$, $q_0 = 4\pi\ep RV_0$.
      `),

      Q(md`$V_0$ is tuned so the force on $q$ vanishes at distance $a$ from the sphere. The sphere's total charge is then`,
        [md`of the same sign as $q$, for every $a$`, md`of the opposite sign to $q$`, md`exactly zero`, md`same sign for $a$ near $R$, opposite for large $a$`], 0,
        [null,
          md`The center image must beat the near image's pull, so it is bigger than $|q'|$.`,
          md`Zero total is the neutral sphere, whose force on $q$ is always attractive.`,
          md`Check: $q_0 + q' = qR\left[\dfrac{a^3}{(a^2-R^2)^2} - \dfrac1a\right] = \dfrac{qR\,[a^4 - (a^2-R^2)^2]}{a(a^2-R^2)^2}>0$ for every $a>R$.`],
        md`Balance needs $q_0 = \dfrac{qRa^3}{(a^2-R^2)^2}$, and $q_0 + q' = \dfrac{qR\,(2a^2R^2 - R^4)}{a(a^2-R^2)^2}>0$. A neutral sphere always attracts, so it takes net like charge to cancel the pull.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`At that zero-force point (battery holding $V_0$), $q$ is nudged a little. What happens?`,
        [md`Stable in every direction`, md`Unstable radially; neutral for a sideways nudge along the circle of radius $a$`, md`Stable radially, unstable sideways`, md`Neutral in every direction`], 1,
        [md`Earnshaw forbids that.`,
          null,
          md`Radially, $\dfrac{dF}{da}>0$ at the balance: out → pushed out, in → pulled in.`,
          md`$F$ depends on $a$, so a radial nudge matters.`],
        md`Moving $q$ along the circle $r = a$ is a symmetry of the sphere: the force stays zero (neutral). Radially $F$ increases through zero: unstable. Consistent with Earnshaw: no direction is restoring.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`The work you do bringing $q$ from infinity to $a$ near a **grounded** sphere is`,
        [md`$-\dfrac{1}{4\pi\ep}\dfrac{q^2R}{a^2-R^2}$`, md`$-\dfrac{1}{4\pi\ep}\dfrac{q^2R}{2a^2}$`, md`$-\dfrac{1}{4\pi\ep}\dfrac{q^2R}{2(a^2-R^2)}$`, md`$-\dfrac{1}{4\pi\ep}\dfrac{q^2R}{2(a-R)^2}$`], 2,
        [md`That is $qV_{\text{image}}$ with no $\tfrac12$: as if the image were fixed while $q$ came in.`,
          md`That uses the distance to the center, as if the image were there.`,
          null,
          md`That's a force-like denominator; integrate $F = \dfrac{q^2Ra}{4\pi\ep(a^2-R^2)^2}$, don't guess.`],
        md`$W = -\displaystyle\int_\infty^a\frac{q^2Ra'}{4\pi\ep(a'^2-R^2)^2}da' = -\frac{1}{4\pi\ep}\frac{q^2R}{2(a^2-R^2)} = \tfrac12qV_{\text{image}}$. As $R\to\infty$ with $a-R = d$, it becomes $-\dfrac{q^2}{16\pi\ep d}$, the plane.`,
        { figHtml: fSph({ A: 2.5, lab: 'V=0', ground: true }) }),

      Q(md`Now the sphere is held at $V_0$ by a battery while you bring $q$ in. In your work $W = \dfrac{qRV_0}{a} - \dfrac{1}{4\pi\ep}\dfrac{q^2R}{2(a^2-R^2)}$, which term carries the $\tfrac12$?`,
        [md`both`, md`neither`, md`only the $V_0$ term`, md`only the induced term`], 3,
        [md`The $V_0$ part comes from the fixed center image $q_0$: it doesn't change as $q$ moves, so it is an ordinary $qV$.`,
          md`The induced part has an image that grows and moves with $q$; integrating gives a $\tfrac12$.`,
          md`Backwards.`,
          null],
        md`The force has two parts: $\dfrac{qq_0}{4\pi\ep a^2}$ from a **fixed** charge (work $\dfrac{qq_0}{4\pi\ep a} = \dfrac{qRV_0}{a}$, no half) and the image pull (work $\tfrac12qV_{\text{image}}$). The battery also does work, which is why "$\tfrac12\sum qV$" alone doesn't give your work here.`,
        { figHtml: fSph({ A: 2.5, lab: 'V=V_0' }) }),

      Q(md`Far from an isolated **neutral** sphere ($a\gg R$), the force on $q$ falls off as`,
        [md`$1/a^2$`, md`$1/a^3$`, md`$1/a^5$`, md`it is exactly zero, the sphere is neutral`], 2,
        [md`The sphere has no net charge.`,
          md`That's the grounded sphere, which has net charge $-qR/a$.`,
          null,
          md`Neutral, but polarized: an induced dipole.`],
        md`The images $\mp\dfrac Raq$ at $b$ and at the center form a dipole $p = \dfrac{qR}{a}\cdot\dfrac{R^2}{a} = \dfrac{qR^3}{a^2}$, i.e. $\propto$ the field of $q$ ($\propto1/a^2$). Its field at $q$ is $\propto p/a^3$: $F\approx\dfrac{1}{4\pi\ep}\dfrac{2q^2R^3}{a^5}$, attractive.`,
        { figHtml: fSph({ A: 4, lab: 'Q=0' }) }),

      Q(md`An isolated sphere carries charge $Q = +q$ (same sign as the outside $q$). As $q$ comes very close to the surface, the force on $q$ is`,
        [md`repulsive, growing like $1/(a-R)^2$`, md`attractive, growing like $1/(a-R)^2$`, md`repulsive and finite`, md`zero`], 1,
        [md`The center image is $+q + \dfrac Raq$, finite in its effect at distance $a$. The near image's pull diverges.`,
          null,
          md`Finite repulsion, yes, but it is swamped by the diverging attraction.`,
          md`There is one zero, at a specific distance, not near the surface.`],
        md`Close up, the near image $-\dfrac Raq\to-q$ is a distance $\approx2(a-R)$ away: attraction $\approx\dfrac{q^2}{16\pi\ep(a-R)^2}$. Like charges attract at short range when one is a conductor. (Problem 8 in the next lesson finds where the force changes sign.)`,
        { figHtml: fSph({ A: 1.4, lab: 'Q=+q' }) }),

      Q(md`Two students solve the neutral-sphere problem. One uses images; the other uses a Legendre series with $\oint\sigma\,da = 0$. Their formulas look different. Which is true?`,
        [md`They may differ by a constant, since only the charge was given`, md`One of them is wrong: problems with given charge have no unique solution`, md`They agree only on the sphere's surface`, md`If both satisfy all the conditions, they are the same function for $r\ge R$`], 3,
        [md`$V\to0$ at infinity pins the constant.`,
          md`That's what the second uniqueness theorem rules out: charges on the conductors determine $\vb E$.`,
          md`Uniqueness is about the whole region, not just the boundary.`,
          null],
        md`Second uniqueness theorem: $\rho$ in the region plus the total charge on each conductor fixes $\vb E$; $V\to0$ then fixes the constant. Different-looking formulas must be identical (the image expression expands into the Legendre series).`,
        { figHtml: fSph({ A: 3, lab: 'Q=0' }) }),

      Q(md`Two conductors sit in otherwise empty space ($V\to0$ far away). Which data do **not** determine $V$ everywhere outside them?`,
        [md`the potential of each conductor`, md`the total charge on each conductor`, md`the potential of conductor 1 and the charge on conductor 2`, md`only the sum $Q_1+Q_2$`], 3,
        [md`First uniqueness theorem.`,
          md`Second uniqueness theorem.`,
          md`Mixed data work too: one condition per conductor is the rule.`,
          null],
        md`Each conductor needs one number (its $V$ or its $Q$). The sum leaves the split undetermined: $Q_1 = 1, Q_2 = 0$ and $Q_1 = 0, Q_2 = 1$ give different fields.`,
        { nofig: 'Pure statement about boundary data; no specific geometry.' }),

      Q(md`For $q$ in a cavity held at $V_0$, a student writes $V = \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} - \dfrac{qR/a}{\srm'} + \dfrac{q_0}{r}\right)$ with $q_0 = 4\pi\ep RV_0$. Verdict?`,
        [md`Correct: it gives $V_0$ on the wall`, md`Correct only if $q$ is at the center`, md`Wrong: $\dfrac{q_0}{r}$ means a charge $q_0$ at the center, which is inside the cavity, so $\lap V\ne-\rho/\ep$ there`, md`Wrong: it fails at infinity`], 2,
        [md`Right on the wall, wrong charge in the region. Both conditions of uniqueness are needed.`,
          md`Even then, a charge $q_0$ would sit on top of $q$, changing the charge.`,
          null,
          md`Infinity isn't part of the cavity region.`],
        md`It meets the boundary condition but adds a fictitious charge **inside** the region, so uniqueness doesn't apply and the answer is wrong (it diverges at the center, for one thing). The right fix is the constant: $V = V_0 + \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} - \dfrac{qR/a}{\srm'}\right)$.`,
        { figHtml: fShell({ A: 0.4, lab: 'V=V_0' }) }),

      Q(md`For $q$ above a grounded plane, a student proposes $V = \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} - \dfrac q{\srm'}\right) + \alpha z$ with $\alpha\ne0$. It satisfies Laplace's equation for $z>0$ (away from $q$) and gives $V = 0$ on the plane. Why reject it?`,
        [md`It violates $V\to0$ far away; it is the solution for a uniform field $-\alpha\,\uv z$ added far away`, md`$\alpha z$ doesn't satisfy Laplace's equation`, md`It is acceptable; uniqueness allows a linear term`, md`It gives the wrong total induced charge only`], 0,
        [null,
          md`$\lap(\alpha z) = 0$; it does.`,
          md`Uniqueness says the far-away condition is part of the data; it pins $\alpha = 0$.`,
          md`It changes $V$ everywhere, and adds a uniform $\sigma = -\ep\alpha$ over the whole infinite plane.`],
        md`Every BC counts, including the one at infinity. This candidate is a correct solution of a **different** problem: $q$ above a grounded plane in an external uniform field.`,
        { figHtml: fPlane({}) }),

      R(md`
        ### Level 6: harder than the exam

        These test whether you can reason with uniqueness, Gauss and limits instead of formulas. Most need no algebra, only the right argument.
      `),

      Q(md`$q$ sits between two grounded parallel planes, at $x_0$ from plane 1 (gap $L$). How is the induced charge split?`,
        [md`$-q/2$ on each, by symmetry of the image series`, md`all $-q$ on the nearer plane`, md`$-q\dfrac{L-x_0}{L}$ on plane 1 and $-q\dfrac{x_0}{L}$ on plane 2`, md`undefined, because the image series only converges conditionally`], 2,
        [md`The setup isn't symmetric unless $x_0 = L/2$.`,
          md`Field lines from $q$ reach both planes.`,
          null,
          md`The physical answer is perfectly finite; you just shouldn't get it by adding image fluxes. Use a cleaner argument (below).`],
        md`The totals don't depend on where $q$ is **sideways**. So smear $q$ evenly over the whole plane $x = x_0$: a sheet. For a sheet between grounded plates, $V$ is piecewise linear with a kink at $x_0$, with field sizes $E_1$ (toward plane 1) and $E_2$ (toward plane 2): $E_1x_0 = E_2(L-x_0)$ (both sides climb to the sheet's potential) and $E_1 + E_2 = \sigma/\ep$, giving the split $(L-x_0):x_0$. Linearity carries it back to the point charge. Check $x_0\to0$: all on plane 1.`,
        { figHtml: fTwoPl({}) }),

      Q(md`In which of these is the total induced charge **not** equal to the sum of the image charges?`,
        [md`$q$ above a grounded plane`, md`$q$ outside a grounded sphere`, md`$q$ in a grounded $90^\circ$ corner`, md`$q$ inside a grounded spherical cavity`], 3,
        [md`Image $-q$, induced $-q$: equal.`,
          md`Image $-\dfrac Raq$, induced $-\dfrac Raq$: equal.`,
          md`Images $-q,-q,+q$ sum to $-q$; induced $-q$: equal.`,
          null],
        md`"Induced = sum of images" is Gauss's law with a surface that encloses the conductor but stays in the region, where the real and image fields agree. Around a cavity, the only such surface is inside the metal, and it encloses $q$, not the image: induced $= -q$, image $= -\dfrac Raq$.`,
        { nofig: 'Compares four standard geometries already drawn above.' }),

      Q(md`A long wire $\lambda$ runs parallel to the axis of a grounded conducting cylinder (radius $R$), at distance $a$ from the axis. The image is`,
        [md`$-\dfrac Ra\lambda$ at $\dfrac{R^2}{a}$, like the sphere`, md`$-\lambda$ at $\dfrac{R^2}{a}$, plus a constant added to $V$`, md`$-\lambda$ at the mirror point, $2R - a$`, md`there is none; this needs a Fourier series`], 1,
        [md`For lines, $V = -\dfrac{\lambda}{2\pi\ep}\ln s$: a **ratio** of distances becomes a **difference** of logs. Equal and opposite lines give $\ln(s'/s)$, which is constant on the circle where $s'/s = R/a$. An unequal image would leave $\ln s$ terms that vary.`,
          null,
          md`That's the plane rule; it fails for a curved wall.`,
          md`It does have an exact image solution.`],
        md`With $-\lambda$ at $b = \dfrac{R^2}{a}$: $V = \dfrac{\lambda}{2\pi\ep}\ln\dfrac{s'}{s} + C$. On the cylinder $\dfrac{s'}{s} = \dfrac Ra$ (same Apollonius geometry as the sphere), so choose $C = \dfrac{\lambda}{2\pi\ep}\ln\dfrac aR$ to make it $0$. The induced charge per length is $-\lambda$.`,
        { figHtml: fCyl({}) }),

      Q(md`In that cylinder solution, why is the constant $C$ allowed, when adding a constant to the sphere solution was not?`,
        [md`In 2-D with zero net line charge, $V$ at infinity is just a finite constant; nothing pins it to zero, so the constant is free and is fixed by $V = 0$ on the cylinder`, md`Because the cylinder is infinitely long, it has infinite capacitance`, md`It isn't allowed; the answer is wrong`, md`Because $\ln$ is not single-valued`], 0,
        [null,
          md`Capacitance isn't the issue; the BC at infinity is.`,
          md`It satisfies Laplace's equation, adds no charge, and fits the only boundary condition (the cylinder).`,
          md`$\ln s$ for $s>0$ is single-valued.`],
        md`For the sphere, $V\to0$ at infinity is a real condition, so a constant would break it (you used a center **charge** instead). For the line-and-cylinder system, $V\to C$ far away; there's no separate condition there to violate. (The 2-D problem does need one condition far away: $V$ stays finite, i.e. no net line charge overall. A term $\propto\ln(s/R)$ also vanishes on the cylinder and would add extra charge; finiteness forbids it, which is what makes the pipe's charge exactly $-\lambda$.)`,
        { figHtml: fCyl({}) }),

      Q(md`$q$ sits midway between two grounded spheres. A student uses one image in each sphere ($-\dfrac Raq$ at $\dfrac{R^2}{a}$ from each center). This is`,
        [md`exact, by symmetry`, md`exact if the spheres are identical`, md`approximate: the image in sphere A makes $V\ne0$ on sphere B, which needs an image in B, and so on; the series converges because each generation is smaller by $\sim R/D$`, md`invalid: each image lies inside the other sphere`], 2,
        [md`Symmetry makes the two corrections equal, not zero.`,
          md`Same objection: identical spheres still each feel the other's image.`,
          null,
          md`Each image lies inside its own sphere, which is fine.`],
        md`Each image fixes its own sphere only. The full answer is an infinite sequence of images of images; truncating after the first generation leaves errors of relative size $\sim R/D$ ($D$ = center separation). Only special geometries (planes at $\pi/n$, a hemisphere on a plane) close after finitely many images.`,
        { figHtml: fTwoSph() }),

      Q(md`Which of these is solved **exactly** by finitely many images?`,
        [md`(ii) a grounded sphere floating above a grounded plane, $q$ nearby`, md`(i) a grounded hemispherical boss on a grounded plane, $q$ above it on the axis`, md`both`, md`neither`], 1,
        [md`The plane image of the sphere's image, the sphere's image of $q$'s plane image, ... never closes.`,
          null,
          md`Only (i) closes.`,
          md`(i) closes with 3 images.`],
        md`(i): $q$, its sphere image $-\dfrac Raq$ at $\dfrac{R^2}{a}$, and the plane mirrors of both ($-q$ at $-a$, $+\dfrac Raq$ at $-\dfrac{R^2}{a}$). The mirrored pair is itself a sphere-image pair, so $V = 0$ on the whole sphere and on the plane. (ii) never closes: infinite series.`,
        { figHtml: fBossVsFloat() }),

      Q(md`$q$ moves toward the center of a grounded cavity ($a\to0$). The image $-\dfrac Raq$ at $\dfrac{R^2}{a}$ runs off to infinity and blows up. Inside the cavity its potential becomes`,
        [md`infinite`, md`zero`, md`the constant $-\dfrac{1}{4\pi\ep}\dfrac qR$`, md`$-\dfrac{1}{4\pi\ep}\dfrac qr$`], 2,
        [md`Size $\propto1/a$, distance $\propto1/a$: the ratio stays finite.`,
          md`The ratio $\dfrac{qR/a}{R^2/a} = \dfrac qR$ doesn't go to zero.`,
          null,
          md`That's a charge at the center, not one at infinity.`],
        md`At any fixed $r$, $\srm'\approx R^2/a$, so $\dfrac{q'}{4\pi\ep\srm'}\to-\dfrac{q}{4\pi\ep R}$. Then $V = \dfrac{q}{4\pi\ep}\left(\dfrac1r - \dfrac1R\right)$, which is exactly the centered answer.`,
        { figHtml: fShell({ A: 0.15, lab: 'V=0', ground: true }) }),

      Q(md`Keep $d = a - R$ fixed and let $R\to\infty$. The sphere's image tends to`,
        [md`$-q$ a distance $d$ behind the surface: the plane image`, md`$0$`, md`$-q$ at the center`, md`$-q$ on the surface`], 0,
        [null,
          md`$q' = -\dfrac{R}{R+d}q\to-q$.`,
          md`The center runs off to infinity; the image stays near the surface.`,
          md`$R - b = R - \dfrac{R^2}{R+d} = \dfrac{Rd}{R+d}\to d$, not $0$.`],
        md`Distance from the surface: $R-b = \dfrac{Rd}{R+d}\to d$, and $q'\to-q$. Every sphere formula (force, energy, $\sigma$ near the closest point) should reduce to the plane one in this limit; use it as a check.`,
        { figHtml: fSph({ A: 1.25, lab: 'V=0', ground: true }) }),

      Q(md`Which argument gives the grounded sphere's total induced charge **without** computing $\sigma$?`,
        [md`Gauss's law on a surface hugging the sphere: the enclosed charge is the induced charge, so it is $-q$`, md`The mean value theorem: average $V$ over the sphere's surface. $q$ contributes $\dfrac{q}{4\pi\ep a}$ (its value at the center), the induced charge contributes $\dfrac{Q_{\text{ind}}}{4\pi\ep R}$, and the total is $0$`, md`Charge conservation: the ground supplies exactly $-q$`, md`Every field line from $q$ ends on the sphere`], 1,
        [md`Gauss tells you $Q_{\text{enc}}$ from the flux, but you don't know the flux without the field.`,
          null,
          md`Conservation doesn't say how much flows; the earth is an infinite reservoir.`,
          md`Many field lines from $q$ go off to infinity; only a fraction $R/a$ end on the sphere.`],
        md`$q$ is outside the sphere, so the average of $\dfrac{q}{4\pi\ep\srm}$ over the sphere is its value at the center, $\dfrac{q}{4\pi\ep a}$. Any charge **on** the sphere has average potential $\dfrac{Q}{4\pi\ep R}$ over it (shell theorem). The sphere is at $0$: $Q_{\text{ind}} = -\dfrac Raq$.`,
        { figHtml: fSph({ A: 3, lab: 'V=0', ground: true }) }),

      Q(md`Could some clever arrangement of fixed charges and grounded conductors hold a point charge $q$ in **stable** equilibrium in empty space?`,
        [md`Yes, inside a grounded cavity at its center`, md`Yes, at the zero-force point near a sphere at the right $V_0$`, md`Yes, between two equal like charges`, md`No: the fixed charges' potential is harmonic near $q$, so it has no minimum (Earnshaw), and induced charge only adds a pull toward the metal`], 3,
        [md`The center of a cavity is unstable: displaced, $q$ is pulled to the nearer wall.`,
          md`That point is radially unstable.`,
          md`Stable along the line joining them, unstable sideways.`,
          null],
        md`For fixed charges, the energy $qV$ has no minimum because $V$ is harmonic where $q$ sits: some direction is always downhill. Grounded conductors don't rescue it; their induced charge pulls $q$ toward the metal, which only destabilizes further. The cavity center and the zero-force point near a sphere at $V_0$ are both unstable examples.`,
        { nofig: 'A general theorem; no single geometry.' }),

      Q(md`A grounded sphere sits in a uniform field $E_0\uv z$, and a point charge $q$ is placed nearby. Is it legal to add the uniform-field solution and the image solution?`,
        [md`No: the sphere's total charge would be wrong`, md`Only if $q$ is on the $z$-axis`, md`Yes: each piece is $0$ on the sphere, so the sum is too; the far-away behavior of the sum is $-E_0r\cos\theta$, as required`, md`No: induced charges respond nonlinearly`], 2,
        [md`Grounded: the total charge isn't specified; it comes out of the solution ($-\dfrac Raq$ here, since the field part adds none).`,
          md`Linearity doesn't care where $q$ is.`,
          null,
          md`Laplace's equation and the BCs are linear; the response is linear.`],
        md`Superposition works when the BCs add up correctly: $0 + 0 = 0$ on the sphere, $-E_0r\cos\theta + 0$ far away. (If the sphere were held at $V_0$, you'd add the $V_0$ piece **once**, not once per term.)`,
        { figHtml: fSph({ A: 2.5, lab: 'V=0', field: true, ground: true }) }),

      Q(md`For $q$ above a grounded plane, $W = -\dfrac{q^2}{16\pi\ep d}$. If you compute $\dfrac{\ep}{2}\displaystyle\int E^2\,d\tau$ over $z>0$ with the real field, you get`,
        [md`the same $-\dfrac{q^2}{16\pi\ep d}$`, md`$+\infty$: it includes $q$'s infinite self-energy; the finite $W$ is what is left after subtracting it`, md`twice $W$`, md`$0$, since $V = 0$ on the plane`], 1,
        [md`$\int E^2$ is positive, and the point charge's own field makes it diverge.`,
          null,
          md`Doubling is what you'd get by integrating over **all** space with the image field, but both are infinite unless you subtract self-energies.`,
          md`$E\ne0$ above the plane.`],
        md`$\dfrac{\ep}{2}\int E^2$ counts the energy to assemble $q$ itself (infinite). The work to bring an already-made $q$ in from infinity is the change in that integral, which is finite: $-\dfrac{q^2}{16\pi\ep d}$. The interaction (cross) term over $z>0$ is exactly half of what it would be over all space for $q$ and a real $-q$, which is another way to see the $\tfrac12$.`,
        { figHtml: fPlane({}) }),

      Q(md`At a point $P$ in a charge-free region, a student finds $V$ has a local minimum. Possible?`,
        [md`Yes, if $P$ is near a negative charge`, md`Yes, at the center of a grounded cavity with $q$ in it`, md`No: $V(P)$ equals the average over any small sphere around $P$, so some neighbors are lower`, md`Only in 2-D problems`], 2,
        [md`The negative charge would have to be at $P$, but the region is charge-free.`,
          md`With $q$ inside, the region isn't charge-free near $q$; and away from $q$ there's still no minimum.`,
          null,
          md`The mean value property holds for circles in 2-D too.`],
        md`$V(P) = \dfrac{1}{4\pi r^2}\oint V\,da$ for every sphere around $P$ inside the region. If $V(P)$ were a strict minimum, the average would exceed it. Extremes of $V$ live on the boundary, which is why grounded boundaries plus no interior charge force $V\equiv0$.`,
        { nofig: 'A general property of harmonic functions.' }),
    ],
  };

  // =====================================================================================
  // Lesson B: problems
  // =====================================================================================
  const lessonB = {
    id: 'uD-img-problems', title: 'Images ladder: problems, easy → brutal',
    steps: [
      R(md`
        ### How to work every problem here

        1. **Region of interest** (where the real charges are, and where you want $V$).
        2. **Boundary conditions**, numbered: every surface ("grounded", "held at $V_0$", "total charge $Q$") and far away.
        3. **Images**: outside the region, chosen so each BC holds. Say which BC each image fixes.
        4. **Compute** in the region only. Force on a real charge = force from the images (the induced charge acts exactly like them in the region).
        5. **Check**: BCs, a limit (plane limit, far limit), units, sign.

        Levels 1–2 are warm-ups. The real work starts at Level 4.
      `),

      // ------------------------------------------------------------------ Level 1
      R(md`### Level 1: recognize`),

      P({
        title: 'Potential near a wire above a grounded plane',
        q: md`
          A long straight wire with charge $\lambda$ per unit length runs parallel to a large grounded conducting plane, at height $d$. Find $V$ at $P_1$, a height $2d$ above the plane directly over the wire, and at $P_2$, at height $d$ a horizontal distance $d$ from the wire.
        `,
        figHtml: fPlane({ kind: 'line', noteLeft: true, pts: [[0, 160, 'P_1', 'r'], [80, 80, 'P_2', 'tr']] }),
        hints: [
          md`A line charge above a plane: the image is a line charge. Which sign, where?`,
          md`Image $-\lambda$ at depth $d$. A pair $\pm\lambda$ gives $V = \dfrac{\lambda}{2\pi\ep}\ln\dfrac{s'}{s}$ ($s$ to the wire, $s'$ to the image).`,
          md`$P_1$: $s = d$, $s' = 3d$. $P_2$: $s = d$, $s' = \sqrt{d^2 + (2d)^2}$.`,
        ],
        parts: [
          { lbl: md`(a) The image is`, mc: [md`$-\lambda$ at depth $d$`, md`$-\lambda$ at depth $2d$`, md`$+\lambda$ at depth $d$`, md`$-\lambda/2$ at depth $d$`], a: 0,
            why: [null, md`The mirror point of height $d$ is depth $d$.`, md`Like signs add on the plane; you need cancellation.`, md`Unequal magnitudes don't cancel on the plane.`] },
          { lbl: md`(b) $V(P_1)$`, expr: 'lambda*ln(3)/(2*pi*eps0)', vars: { lambda: [1, 3], eps0: [0.5, 2] }, accepts: ['lambda*ln(9)/(4*pi*eps0)'] },
          { lbl: md`(c) $V(P_2)$`, expr: 'lambda*ln(5)/(4*pi*eps0)', vars: { lambda: [1, 3], eps0: [0.5, 2] }, accepts: ['lambda*ln(sqrt(5))/(2*pi*eps0)'] },
        ],
        sol: md`
          **Region:** $z\ge0$. **BCs:**

          1. $V = 0$ on the plane $z = 0$.
          2. $V\to0$ far from the wire (in $z>0$).

          **Image.** $-\lambda$ at depth $d$. On the plane every point is equally far from the wire and the image, so BC 1 holds. Far away $s'/s\to1$ and $\ln1 = 0$: BC 2 holds. The image is below the plane, outside the region.

          [[fig:img]]

          $$V = -\frac{\lambda}{2\pi\ep}\ln s + \frac{\lambda}{2\pi\ep}\ln s' = \frac{\lambda}{2\pi\ep}\ln\frac{s'}{s}.$$

          **$P_1$:** $s = d$, $s' = 3d$: $V = \dfrac{\lambda\ln3}{2\pi\ep}$.

          **$P_2$:** $s = d$, $s' = \sqrt5\,d$: $V = \dfrac{\lambda}{2\pi\ep}\ln\sqrt5 = \dfrac{\lambda\ln5}{4\pi\ep}$.

          **Check.** Both positive (closer to $+\lambda$ than to $-\lambda$), both $\ll$ the bare wire's divergence. The additive constant in a single line's potential cancels between the pair, which is why no reference point is needed.
        `,
        figs: { img: { svg: fPlaneImg({ kind: 'line', pts: [[0, 120, 'P_1', 'r'], [60, 60, 'P_2', 'tr']] }), cap: md`Plane removed, image $-\lambda$ at depth $d$.` } },
      }),

      P({
        title: 'Grounded sphere, charge at 5R',
        q: md`
          A charge $q$ is $a = 5R$ from the center of a grounded conducting sphere of radius $R$. Find (a) the image charge in units of $q$, (b) its distance from the center in units of $R$, and (c) $V$ at the point $P$ a distance $2R$ from the center on the side away from $q$, in units of $\dfrac{q}{4\pi\ep R}$.
        `,
        figHtml: fSph({ A: 5, ground: true, lab: 'V=0', pts: [[-2, 'P']] }),
        hints: [
          md`Grounded sphere, charge outside: $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$.`,
          md`$P$ is $7R$ from $q$ and $2R + b$ from the image.`,
        ],
        parts: [
          { lbl: md`(a) $q'/q$`, ans: -0.2 },
          { lbl: md`(b) $b/R$`, ans: 0.2 },
          { lbl: md`(c) $V(P)$`, ans: 4 / 77 },
        ],
        sol: md`
          **Region:** $r\ge R$. **BCs:** 1. $V(R,\theta) = 0$ for all $\theta$. 2. $V\to0$ as $r\to\infty$.

          **Image:** $q' = -\dfrac{R}{5R}q = -\dfrac q5$ at $b = \dfrac{R^2}{5R} = \dfrac R5$, on the line to $q$.

          [[fig:img]]

          **(c)** $P$ is $7R$ from $q$ and $2R + \dfrac R5 = \dfrac{11}{5}R$ from $q'$:
          $$V(P) = \frac{1}{4\pi\ep}\left(\frac{q}{7R} - \frac{q/5}{11R/5}\right) = \frac{q}{4\pi\ep R}\left(\frac17 - \frac1{11}\right) = \frac{4}{77}\,\frac{q}{4\pi\ep R}\approx0.052\,\frac{q}{4\pi\ep R}.$$

          **Check BC 1** at the two axis points: near point, distances $4R$ and $\tfrac45R$: $\tfrac14 - \tfrac15\cdot\tfrac54 = 0$ ✓; far point, $6R$ and $\tfrac65R$: $\tfrac16 - \tfrac15\cdot\tfrac56 = 0$ ✓.
        `,
        figs: { img: { svg: fAxisImg({ Rp: 56, noCenter: true, note: 'sphere removed', items: [{ x: 5, q: '+', lab: 'q' }, { x: 0.2, q: '-', lab: "q'", image: true, at: 'tr' }, { x: -2, pt: 'P' }], dims: [{ x0: 0, x1: 5, lab: '5R' }] }), cap: md`$q' = -q/5$ at $R/5$; the sphere is replaced by the image.` } },
      }),

      // ------------------------------------------------------------------ Level 2
      R(md`### Level 2: set up`),

      P({
        title: 'A charge two-fifths of the way to the wall',
        q: md`
          A charge $q$ is at $a = \tfrac25R$ from the center of a spherical cavity of radius $R$ in a grounded conductor. Find (a) the image charge (units of $q$), (b) its distance from the center (units of $R$), (c) the total charge on the cavity wall (units of $q$), (d) $V$ at the center of the cavity in units of $\dfrac{q}{4\pi\ep R}$.
        `,
        figHtml: fShell({ A: 0.4, ground: true, lab: 'V=0' }),
        hints: [
          md`Region: inside the cavity. The image must be outside it, i.e. in the metal.`,
          md`Same formulas as outside: $q' = -\dfrac Raq$, $b = \dfrac{R^2}{a}$.`,
          md`(c) is Gauss's law with a surface inside the metal, not the image charge.`,
        ],
        parts: [
          { lbl: md`(a) $q'/q$`, ans: -2.5 },
          { lbl: md`(b) $b/R$`, ans: 2.5 },
          { lbl: md`(c) $Q_{\text{wall}}/q$`, ans: -1 },
          { lbl: md`(d) $V(0)$`, ans: 1.5 },
          { lbl: md`(e) Where is $V = \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} + \dfrac{q'}{\srm'}\right)$ the real potential?`, mc: [md`$r\le R$ only`, md`$r\ge R$ only`, md`everywhere`, md`only on the wall`], a: 0,
            why: [null, md`Outside the cavity is metal (and beyond); there the real $V$ is $0$.`, md`In the metal the formula is nonzero but the real $V$ is $0$.`, md`It is right on the wall, but also everywhere inside.`] },
        ],
        sol: md`
          **Region:** $r\le R$ (the cavity). **BCs:**

          1. $V(R,\theta) = 0$ (grounded wall).

          That's all: the cavity has no "infinity".

          **Image.** $q' = -\dfrac{R}{2R/5}q = -\dfrac52q$ at $b = \dfrac{R^2}{2R/5} = \dfrac52R$: outside the cavity, in the metal. On the wall $\srm'/\srm = R/a = \tfrac52$, so $\dfrac q{\srm} + \dfrac{-\tfrac52q}{\tfrac52\srm} = 0$: BC 1 ✓.

          [[fig:img]]

          **(c)** A Gaussian surface inside the metal has $\vb E = 0$, so it encloses zero charge: $Q_{\text{wall}} = -q$. The image ($-2.5q$) is bigger than the induced charge; it is a stand-in for the field, not a count of charge.

          **(d)** At the center: $V = \dfrac{1}{4\pi\ep}\left(\dfrac{q}{2R/5} - \dfrac{5q/2}{5R/2}\right) = \dfrac{q}{4\pi\ep R}\left(\dfrac52 - 1\right) = \dfrac32\,\dfrac{q}{4\pi\ep R}$.

          **Check.** As $a\to0$ this should become $\dfrac{q}{4\pi\ep}\left(\dfrac1r - \dfrac1R\right)$, infinite at the center; here $a\ne0$ and the value is finite. The image's potential at the center is always $-\dfrac{q}{4\pi\ep R}$ (size $\dfrac Raq$ at distance $\dfrac{R^2}{a}$).
        `,
        figs: { img: { svg: fAxisImg({ Rp: 56, note: 'metal removed', items: [{ x: 0.4, q: '+', lab: 'q' }, { x: 2.5, q: '-', lab: "q'", image: true }], dims: [{ x0: 0, x1: 0.4, lab: 'a', row: 0 }, { x0: 0, x1: 2.5, lab: 'b', row: 1 }] }), cap: md`Cavity wall removed; image $-\tfrac52q$ at $\tfrac52R$.` } },
      }),

      P({
        title: 'A neutral sphere, charge at 3R',
        q: md`
          A charge $q$ is $a = 3R$ from the center of an isolated, uncharged conducting sphere of radius $R$. Find the sphere's potential (units of $\dfrac{q}{4\pi\ep R}$) and the force on $q$ (units of $\dfrac{q^2}{4\pi\ep R^2}$, positive = away from the sphere).
        `,
        figHtml: fSph({ A: 3, lab: 'Q=0' }),
        hints: [
          md`Translate "isolated, uncharged" into two conditions on the sphere.`,
          md`Start from the grounded images; add a center charge that keeps the sphere an equipotential and makes the total zero.`,
          md`Images: $-\dfrac q3$ at $\dfrac R3$ and $+\dfrac q3$ at the center.`,
        ],
        parts: [
          { lbl: md`(a) Which condition set is right?`, mc: [md`$V(R,\theta) = 0$, $V\to0$`, md`$\sigma = 0$ on the sphere, $V\to0$`, md`$V(R,\theta) = 0$ and $\oint\sigma\,da = 0$`, md`$V(R,\theta) = V_s$ (unknown constant), $\oint\sigma\,da = 0$, $V\to0$`], a: 3,
            why: [md`That's grounded.`, md`Only the total is zero.`, md`Both $V = 0$ and $Q = 0$ can't hold together with $q$ nearby: overdetermined.`, null] },
          { lbl: md`(b) $V_{\text{sphere}}$`, ans: 1 / 3 },
          { lbl: md`(c) $F$`, ans: -17 / 1728 },
        ],
        sol: md`
          **Region:** $r\ge R$. **BCs:**

          1. $V(R,\theta) = V_s$, the same for all $\theta$ ($V_s$ unknown).
          2. $\oint\sigma\,da = 0$.
          3. $V\to0$ at infinity.

          **Images.** $q' = -\dfrac q3$ at $\dfrac R3$ makes the sphere $V = 0$ together with $q$. A center charge $q_c$ adds the constant $\dfrac{q_c}{4\pi\ep R}$ on the sphere (BC 1 still holds) and $q' + q_c = 0$ fixes BC 2: $q_c = +\dfrac q3$. BC 3 holds for point charges.

          [[fig:img]]

          **Potential:** $V_s = \dfrac{q/3}{4\pi\ep R} = \dfrac13\,\dfrac{q}{4\pi\ep R}$, which equals $\dfrac{q}{4\pi\ep a}$ as it must for any neutral sphere.

          **Force** (positive = away):
          $$F = \frac{q}{4\pi\ep}\left[\frac{q/3}{(3R)^2} - \frac{q/3}{(3R - R/3)^2}\right] = \frac{q^2}{4\pi\ep R^2}\left[\frac1{27} - \frac{3}{64}\right] = -\frac{17}{1728}\,\frac{q^2}{4\pi\ep R^2}\approx-0.0098.$$

          Attractive, and small: compare $-\dfrac{3}{64}\approx-0.047$ for the grounded sphere. **Check:** far-field estimate $-\dfrac{2R^3}{a^5} = -\dfrac{2}{243}\approx-0.0082$ in these units, same order ✓.
        `,
        figs: { img: { svg: fAxisImg({ Rp: 64, noCenter: true, note: 'sphere removed', items: [{ x: 3, q: '+', lab: 'q' }, { x: 1 / 3, q: '-', lab: '-\\tfrac{q}{3}', image: true, at: 'tr' }, { x: 0, q: '+', lab: '+\\tfrac{q}{3}', image: true, at: 'tl' }], dims: [{ x0: 0, x1: 3, lab: '3R' }] }), cap: md`Neutral sphere: $-\tfrac q3$ at $\tfrac R3$ and $+\tfrac q3$ at the center.` } },
      }),

      // ------------------------------------------------------------------ Level 3
      R(md`### Level 3: the standard case`),

      P({
        title: 'Force in a corner, off the diagonal',
        q: md`
          Two grounded conducting half-planes meet at a right angle. A charge $q$ is at $x = 2a$ from the wall and $y = a$ above the floor. Find the force components $F_x$ (along the floor, away from the wall) and $F_y$ (up, away from the floor) in units of $\dfrac{q^2}{4\pi\ep a^2}$.
        `,
        figHtml: fCorner({}),
        hints: [
          md`$90^\circ = 180^\circ/2$: three images. Place them by mirroring in each wall.`,
          md`$-q$ at $(-2a,a)$, $-q$ at $(2a,-a)$, $+q$ at $(-2a,-a)$.`,
          md`Distances: $4a$ (horizontal), $2a$ (vertical), $\sqrt{20}\,a$ (diagonal). Add the three vectors.`,
        ],
        parts: [
          { lbl: md`(a) $F_x$`, ans: -0.01778 },
          { lbl: md`(b) $F_y$`, ans: -0.2276 },
          { lbl: md`(c) Which wall dominates the pull?`, mc: [md`the floor (the nearer one)`, md`the wall (the farther one)`, md`neither: the corner attracts along the diagonal`, md`they pull equally`], a: 0,
            why: [null, md`The wall's image is $4a$ away, the floor's $2a$: four times weaker.`, md`Only a charge on the diagonal is pulled along it.`, md`Unequal distances, unequal pulls.`] },
        ],
        sol: md`
          **Region:** $x\ge0$, $y\ge0$. **BCs:** 1. $V = 0$ on the floor $y = 0$. 2. $V = 0$ on the wall $x = 0$. 3. $V\to0$ far away.

          **Images.** $-q$ at $(-2a,a)$ (mirror in the wall), $-q$ at $(2a,-a)$ (mirror in the floor), $+q$ at $(-2a,-a)$ (mirror of either image in the other wall). Across the floor the pairs are $(q, -q)$ and $(-q, +q)$, so BC 1 holds; same across the wall for BC 2.

          [[fig:img]]

          **Forces** (units $\dfrac{q^2}{4\pi\ep a^2}$):

          - $-q$ at $(-2a,a)$: distance $4a$, attractive, along $-x$: $\left(-\dfrac1{16},\,0\right)$.
          - $-q$ at $(2a,-a)$: distance $2a$, attractive, along $-y$: $\left(0,\,-\dfrac14\right)$.
          - $+q$ at $(-2a,-a)$: distance $\sqrt{20}\,a$, repulsive, along $(4,2)/\sqrt{20}$: $\dfrac{1}{20}\cdot\left(\dfrac{4}{\sqrt{20}},\dfrac{2}{\sqrt{20}}\right) = \left(\dfrac{1}{10\sqrt5},\,\dfrac{1}{20\sqrt5}\right)$.

          $$F_x = -\frac1{16} + \frac{1}{10\sqrt5}\approx-0.0178,\qquad F_y = -\frac14 + \frac{1}{20\sqrt5}\approx-0.2276.$$

          **Check.** The diagonal image always repels, so each component is a little weaker than the single-wall pull. Toward the corner overall, mostly toward the nearer floor.
        `,
        figs: { img: { svg: fCornerImg(100, 50), cap: md`Three images; walls removed.` } },
      }),

      P({
        title: 'Grounded sphere at a = 2R: where the charge piles up',
        q: md`
          A charge $q$ is at $a = 2R$ from the center of a grounded sphere of radius $R$. Find (a) $\sigma$ at the point nearest $q$, (b) the ratio $\sigma(\text{nearest})/\sigma(\text{farthest})$, (c) the force on $q$ in units of $\dfrac{q^2}{4\pi\ep R^2}$ (positive = away).
        `,
        figHtml: fSph({ A: 2, ground: true, lab: 'V=0' }),
        hints: [
          md`$\sigma = -\ep\,\partial V/\partial r$ at $r = R$, or use the result $\sigma(\theta) = -\dfrac{q(a^2-R^2)}{4\pi R(R^2+a^2-2Ra\cos\theta)^{3/2}}$.`,
          md`At $\theta = 0$ the bracket is $(a-R)^2$; at $\theta = \pi$ it is $(a+R)^2$.`,
        ],
        parts: [
          { lbl: md`(a) $\sigma(\theta = 0)$`, expr: '-3*q/(4*pi*R^2)', vars: { q: [1, 3], R: [0.5, 2] } },
          { lbl: md`(b) ratio`, ans: 27 },
          { lbl: md`(c) $F$`, ans: -2 / 9 },
        ],
        sol: md`
          **Region** $r\ge R$; **BCs** 1. $V(R,\theta) = 0$, 2. $V\to0$. **Image** $-\dfrac q2$ at $\dfrac R2$.

          [[fig:img]]

          **(a)** $V = \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} - \dfrac{q/2}{\srm'}\right)$. Differentiating and setting $r = R$ gives the standard
          $$\sigma(\theta) = -\frac{q(a^2-R^2)}{4\pi R(R^2+a^2-2Ra\cos\theta)^{3/2}} = -\frac{3q}{4\pi R^2(5-4\cos\theta)^{3/2}}.$$
          At $\theta = 0$: $\sigma = -\dfrac{3q}{4\pi R^2}$.

          **(b)** At $\theta = \pi$: $-\dfrac{3q}{4\pi R^2\cdot27}$. Ratio $= \left(\dfrac{a+R}{a-R}\right)^3 = 27$.

          [[fig:sig]]

          **(c)** $F = -\dfrac{1}{4\pi\ep}\dfrac{q^2Ra}{(a^2-R^2)^2} = -\dfrac{2R^2}{9R^4}\cdot\dfrac{q^2}{4\pi\ep} = -\dfrac29\,\dfrac{q^2}{4\pi\ep R^2}$.

          **What to remember.** $\sigma$ scales like $1/(\text{distance from }q)^3$, so the near side holds most of the charge; the ratio $\left(\frac{a+R}{a-R}\right)^3$ is worth memorizing as a check. Total: $-\dfrac q2$.
        `,
        figs: {
          img: { svg: fAxisImg({ Rp: 64, note: 'sphere removed', items: [{ x: 2, q: '+', lab: 'q' }, { x: 0.5, q: '-', lab: '-\\tfrac{q}{2}', image: true }], dims: [{ x0: 0, x1: 2, lab: '2R' }] }), cap: md`Image $-q/2$ at $R/2$.` },
          sig: { svg: pSig2R(), cap: md`$\sigma(\theta)$ for $a = 2R$: $-3$ at the near point, $-\tfrac19$ at the far point.` },
        },
      }),

      P({
        title: 'Induced charge under a wire, strip by strip',
        q: md`
          A long wire with charge $\lambda$ per unit length runs parallel to a grounded plane at height $d$. Let $x$ be the horizontal distance from the line on the plane directly below the wire. Find (a) $\sigma(x)$, (b) the induced charge per unit length (of wire) on the strip $|x|<\sqrt3\,d$, and (c) the half-width $w$ (in units of $d$) of the strip that holds $90\%$ of the induced charge.
        `,
        figHtml: fPlane({ kind: 'line', noteLeft: true, h: 60, strip: 104, stripLab: '2\\sqrt3\\,d' }),
        hints: [
          md`Image $-\lambda$ at depth $d$. $\sigma = \ep E_z$ just above the plane.`,
          md`Each line gives $\dfrac{\lambda}{2\pi\ep s}$ along its radial direction; the $z$-components add: $E_z = -2\cdot\dfrac{\lambda}{2\pi\ep s}\cdot\dfrac ds$ with $s^2 = x^2 + d^2$.`,
          md`$\displaystyle\int\frac{d\,dx}{x^2+d^2} = \arctan\frac xd$.`,
        ],
        parts: [
          { lbl: md`(a) $\sigma(x)$`, expr: '-lambda*d/(pi*(x^2+d^2))', vars: { lambda: [1, 3], d: [0.5, 2], x: [-2, 2] } },
          { lbl: md`(b) charge per length on the strip`, expr: '-2*lambda/3', vars: { lambda: [1, 3] } },
          { lbl: md`(c) $w/d$`, ans: 6.314 },
        ],
        sol: md`
          **Region** $z\ge0$. **BCs** 1. $V = 0$ at $z = 0$. 2. $V\to0$ far away. **Image** $-\lambda$ at depth $d$.

          **(a)** At $(x, 0^+)$ both lines are a distance $s = \sqrt{x^2+d^2}$ away. The wire's field points away from it, the image's toward it; their $z$-components are both downward with size $\dfrac{\lambda}{2\pi\ep s}\cdot\dfrac ds$; the $x$-components cancel.
          $$E_z = -\frac{\lambda d}{\pi\ep(x^2+d^2)},\qquad \sigma = \ep E_z = -\frac{\lambda d}{\pi(x^2+d^2)}.$$

          [[fig:sig]]

          **(b)** $\displaystyle\int_{-\sqrt3d}^{\sqrt3d}\sigma\,dx = -\frac{2\lambda}{\pi}\arctan\sqrt3 = -\frac{2\lambda}{\pi}\cdot\frac\pi3 = -\frac23\lambda.$ The whole plane holds $-\lambda$ ($\arctan\infty = \pi/2$).

          **(c)** $\dfrac2\pi\arctan\dfrac wd = 0.9\Rightarrow w = d\tan(81^\circ)\approx6.31\,d$.

          **What to remember.** For a line charge $\sigma\propto1/x^2$, a much longer tail than the point charge's $1/\rho^3$: a third of the charge is outside $|x| = \sqrt3d$, and you have to go out past $6d$ to catch $90\%$.
        `,
        figs: { sig: { svg: pSigLine(), cap: md`$\sigma(x)$ in units of $\lambda/d$; the strip edges $\pm\sqrt3\,d$ are marked.` } },
      }),

      // ------------------------------------------------------------------ Level 4
      R(md`### Level 4: one twist`),

      P({
        title: 'A like-charged sphere that attracts',
        q: md`
          An isolated conducting sphere of radius $R$ carries total charge $Q = +q$. A point charge $+q$ is at distance $a$ from its center. Give the force on the point charge in units of $\dfrac{q^2}{4\pi\ep R^2}$ (positive = repulsive) (a) at $a = 2R$ and (b) at $a = 1.2R$. (c) At what $a/R$ does the force change sign?
        `,
        figHtml: fSph({ A: 2, lab: 'Q=+q' }),
        hints: [
          md`BCs: sphere an equipotential; total charge $q$; $V\to0$. Images: $-\dfrac Raq$ at $\dfrac{R^2}{a}$, and at the center whatever makes the total $q$.`,
          md`Center image $q + \dfrac Raq$. With $A = a/R$: $F = \dfrac{1+1/A}{A^2} - \dfrac{A}{(A^2-1)^2}$.`,
          md`For (c) try $A^2 = A+1$: then $A^2 - 1 = A$.`,
        ],
        parts: [
          { lbl: md`(a) $F(2R)$`, ans: 0.15278 },
          { lbl: md`(b) $F(1.2R)$`, ans: -4.925 },
          { lbl: md`(c) $a^*/R$`, ans: 1.618 },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:**

          1. $V(R,\theta) = V_s$, a constant (unknown).
          2. $\oint\sigma\,da = q$.
          3. $V\to0$ at infinity.

          **Images.** $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$ (with $q$ it makes the sphere $V = 0$), plus $q_c$ at the center (keeps BC 1, shifts the constant). BC 2: $q' + q_c = q\Rightarrow q_c = q + \dfrac Raq$. BC 3 ✓.

          **Force** with $A = a/R$, units $\dfrac{q^2}{4\pi\ep R^2}$:
          $$F(A) = \frac{1 + 1/A}{A^2} - \frac{A}{(A^2-1)^2}.$$
          (First term: center image at distance $a$. Second: $q'$ at distance $a - b = \dfrac{a^2-R^2}{a}$.)

          **(a)** $A = 2$: $\dfrac{1.5}{4} - \dfrac29 = 0.1528$, repulsive.
          **(b)** $A = 1.2$: $\dfrac{1.833}{1.44} - \dfrac{1.2}{0.1936} = 1.273 - 6.198 = -4.93$, attractive.

          **(c)** $F = 0$: $\dfrac{A+1}{A^3} = \dfrac{A}{(A^2-1)^2}$. If $A^2 = A + 1$, then $A^2 - 1 = A$ and $A + 1 = A^2$: left side $\dfrac{A^2}{A^3} = \dfrac1A$, right side $\dfrac{A}{A^2} = \dfrac1A$ ✓. So $A^* = \dfrac{1+\sqrt5}{2}\approx1.618$, the golden ratio. The plot shows it is the only crossing.

          [[fig:pl]]

          **What to remember.** A conductor with charge of the **same** sign still attracts a charge that comes close enough, because the induced near image diverges like $1/(a-R)^2$ while the repulsion stays finite.
        `,
        figs: { pl: { svg: pF8(), cap: md`$F(a)$ for a sphere with charge $+q$: repulsive far out, attractive inside $a\approx1.618R$.` } },
      }),

      P({
        title: 'A tilted dipole above a grounded plane',
        q: md`
          A point dipole $\vb p$ is held at height $d$ above a grounded plane, tilted by $\theta$ from the normal. Find (a) the image dipole, (b) the size of the torque on $\vb p$, (c) the vertical force on it ($+$ = away from the plane), (d) which way the torque turns it.
        `,
        figHtml: fPlane({ kind: 'dip', th: 35, h: 70 }),
        hints: [
          md`Image each end of the dipole. Result: $\vb p' = (-p_x, -p_y, +p_z)$ at depth $d$.`,
          md`Field of a dipole at displacement $\vb r$: $\vb E = \dfrac{1}{4\pi\ep r^3}[3(\vb p'\cdot\uv r)\uv r - \vb p']$, with $\vb r = 2d\,\uv z$.`,
          md`Torque $\vb p\times\vb E$. For the force, use the energy $W = -\tfrac12\vb p\cdot\vb E_{\text{image}}$ and $F_z = -\partial W/\partial d$.`,
        ],
        parts: [
          { lbl: md`(a) With $\vb p = p(\sin\theta, 0, \cos\theta)$, the image dipole is`, mc: [md`$p(\sin\theta, 0, \cos\theta)$`, md`$p(-\sin\theta, 0, -\cos\theta)$`, md`$p(\sin\theta, 0, -\cos\theta)$`, md`$p(-\sin\theta, 0, \cos\theta)$`], a: 3,
            why: [md`A horizontal component must flip (its two ends get opposite-sign images at the same horizontal positions).`, md`That flips the vertical part too; a vertical dipole's image points the same way (head to tail).`, md`Backwards: that's the reflected **position** rule, not the charge rule.`, null] },
          { lbl: md`(b) $|\tau|$`, expr: 'p^2*sin(2*theta)/(64*pi*eps0*d^3)', vars: { p: [1, 3], theta: [0.1, 1.4], eps0: [0.5, 2], d: [0.5, 2] }, accepts: ['p^2*sin(theta)*cos(theta)/(32*pi*eps0*d^3)'] },
          { lbl: md`(c) $F_z$`, expr: '-3*p^2*(1+cos(theta)^2)/(64*pi*eps0*d^4)', vars: { p: [1, 3], theta: [0.1, 1.4], eps0: [0.5, 2], d: [0.5, 2] } },
          { lbl: md`(d) The torque turns $\vb p$`, mc: [md`toward the normal (smaller $\theta$)`, md`toward lying flat`, md`it doesn't; $\tau$ is zero`, md`toward the normal only if $\theta>45^\circ$`], a: 0,
            why: [null, md`Flat is the energy maximum.`, md`Zero only at $\theta = 0,\pi/2$.`, md`$\sin2\theta>0$ for all $0<\theta<\pi/2$: always toward the normal.`] },
        ],
        sol: md`
          **Region** $z\ge0$. **BCs** 1. $V = 0$ on $z = 0$. 2. $V\to0$ far away.

          **(a)** The $+$ end at $\vb r_+$ gets $-q$ at the mirror point; the $-$ end gets $+q$. Horizontal separations keep their direction but the charges flip: horizontal part reversed. Vertical separation is mirrored **and** the charges flip: vertical part unchanged. $\vb p' = p(-\sin\theta, 0, \cos\theta)$ at $(0,0,-d)$.

          [[fig:img]]

          **Image field at $\vb p$** ($\vb r = 2d\,\uv z$, $\vb p'\cdot\uv z = p\cos\theta$):
          $$\vb E = \frac{1}{4\pi\ep(2d)^3}\left[3p\cos\theta\,\uv z - \vb p'\right] = \frac{p}{32\pi\ep d^3}(\sin\theta,\,0,\,2\cos\theta).$$

          **(b)** $\vb\tau = \vb p\times\vb E$: $\tau_y = \dfrac{p^2}{32\pi\ep d^3}(\cos\theta\sin\theta - 2\sin\theta\cos\theta) = -\dfrac{p^2\sin2\theta}{64\pi\ep d^3}$.

          **(c)** Energy (the image moves with $\vb p$, hence the $\tfrac12$):
          $$W = -\tfrac12\,\vb p\cdot\vb E = -\frac{p^2(\sin^2\theta + 2\cos^2\theta)}{64\pi\ep d^3} = -\frac{p^2(1+\cos^2\theta)}{64\pi\ep d^3}.$$
          $F_z = -\dfrac{\partial W}{\partial d} = -\dfrac{3p^2(1+\cos^2\theta)}{64\pi\ep d^4}$: attractive. No horizontal force ($W$ doesn't depend on $x, y$). Check: $-\partial W/\partial\theta = -\dfrac{p^2\sin2\theta}{64\pi\ep d^3} = \tau_y$ ✓.

          **(d)** $\tau_y<0$ decreases $\theta$: $\vb p$ swings toward the normal, the head-to-tail alignment with its image, where $W$ is lowest.

          **Check.** $\theta = 0$: $F = -\dfrac{3p^2}{32\pi\ep d^4} = -\dfrac{6p^2}{4\pi\ep(2d)^4}$, the force between coaxial dipoles $2d$ apart ✓.
        `,
        figs: { img: { svg: fDipImg(35), cap: md`The image dipole: horizontal part reversed, vertical part kept.` } },
      }),

      P({
        title: 'Balancing the image pull with a uniform field',
        q: md`
          Far-away charges produce a uniform field $E_0\uv z$ pointing away from a large grounded plane. A charge $q>0$ is placed above the plane. Find (a) the height $d^*$ where the net force vanishes, (b) whether that balance is stable, (c) $\sigma$ on the plane directly below $q$ when it sits at $d^*$.
        `,
        figHtml: fPlane({ field: true }),
        hints: [
          md`BCs: $V = 0$ on the plane; far away $V\to-E_0z$. Superpose the plane-in-field solution and the image solution.`,
          md`Force: $qE_0$ up, $\dfrac{q^2}{4\pi\ep(2d)^2}$ down.`,
          md`$\sigma = \ep E_z(0^+)$ from both pieces.`,
        ],
        parts: [
          { lbl: md`(a) $d^*$`, expr: 'sqrt(q/(16*pi*eps0*E0))', vars: { q: [1, 3], eps0: [0.5, 2], E0: [0.5, 2] } },
          { lbl: md`(b) The balance is`, mc: [md`unstable: above $d^*$ the field wins and pushes $q$ away, below it the image wins`, md`stable: the image pull restores it`, md`neutral`, md`stable vertically, unstable sideways`], a: 0,
            why: [null, md`The image pull **decreases** with height, so it can't restore an upward displacement.`, md`$F$ depends on $d$.`, md`Vertically it is already unstable.`] },
          { lbl: md`(c) $\sigma$ below $q$`, expr: '-7*eps0*E0', vars: { eps0: [0.5, 2], E0: [0.5, 2] } },
        ],
        sol: md`
          **Region** $z\ge0$. **BCs:**

          1. $V = 0$ on $z = 0$.
          2. $V\to-E_0z$ far from $q$.

          **Solution.** $V = -E_0z + \dfrac{q}{4\pi\ep}\left(\dfrac1{\srm} - \dfrac1{\srm'}\right)$: each piece is $0$ on the plane (BC 1), and the second dies far away, leaving $-E_0z$ (BC 2).

          [[fig:img]]

          **(a)** $qE_0 = \dfrac{q^2}{16\pi\ep d^2}\Rightarrow d^* = \sqrt{\dfrac{q}{16\pi\ep E_0}}$.

          **(b)** $F(d) = qE_0 - \dfrac{q^2}{16\pi\ep d^2}$ increases with $d$: unstable (Earnshaw again).

          **(c)** Field piece: $\sigma = \ep E_0$ (field lines leave the plane). Charge piece at the foot: $-\dfrac{q}{2\pi d^{*2}} = -\dfrac{q\cdot16\pi\ep E_0}{2\pi q} = -8\ep E_0$. Total $\sigma = -7\ep E_0$.

          **What to remember.** A uniform field normal to a grounded plane is its own solution ($-E_0z$ is already $0$ on the plane), so it superposes with any image solution for free.
        `,
        figs: { img: { svg: fPlaneImg({ field: true }), cap: md`Plane removed: $q$, its image, and the uniform field.` } },
      }),

      // ------------------------------------------------------------------ Level 5
      R(md`### Level 5: exam level`),

      P({
        title: 'Sphere at V0, charge at 5R/3: balance, charge, stability',
        big: true,
        q: md`
          A conducting sphere of radius $R$ is held at potential $V_0$ (relative to infinity) by a battery. A charge $q>0$ is held at $a = \tfrac53R$ from the center.

          (a) Find $V_0^*$ for which the force on $q$ is zero, in units of $\dfrac{q}{4\pi\ep R}$.
          (b) Find the total charge on the sphere at $V_0^*$ (units of $q$).
          (c) Find $\sigma$ at the point nearest $q$ at $V_0^*$, in units of $\dfrac{q}{4\pi R^2}$.
          (d) Is the balance stable? (e) With $V_0$ slightly above $V_0^*$, which way does $q$ go when released?
        `,
        figHtml: fSph({ A: 5 / 3, lab: 'V=V_0' }),
        hints: [
          md`BCs: $V(R,\theta) = V_0$; $V\to0$. Images: $q' = -\tfrac35q$ at $\tfrac35R$; $q_0 = 4\pi\ep RV_0$ at the center.`,
          md`$F = \dfrac{q}{4\pi\ep}\left[\dfrac{q_0}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}\right]$. Balance: $q_0 = \dfrac{qRa^3}{(a^2-R^2)^2}$.`,
          md`$\sigma = \sigma_{\text{grounded}} + \dfrac{q_0}{4\pi R^2}$, with $\sigma_{\text{grounded}}(0) = -\dfrac{q(a+R)}{4\pi R(a-R)^2}$.`,
          md`Stability: sign of $dF/da$ at the balance, with $V_0$ held fixed.`,
        ],
        parts: [
          { lbl: md`(a) $V_0^*$`, ans: 375 / 256 },
          { lbl: md`(b) $Q_{\text{sphere}}$`, ans: 1107 / 1280 },
          { lbl: md`(c) $\sigma(\text{nearest})$`, ans: -1161 / 256 },
          { lbl: md`(d) Stability`, mc: [md`stable radially`, md`neutral`, md`stable radially, unstable sideways`, md`unstable radially, neutral sideways (along the circle $r = a$)`], a: 3,
            why: [md`$dF/da>0$ at the balance: unstable.`, md`$F$ changes sign through the balance point.`, md`Radially it is unstable; sideways is a symmetry.`, null] },
          { lbl: md`(e) Slightly above $V_0^*$, $q$`, mc: [md`moves away from the sphere`, md`moves toward the sphere`, md`stays put`, md`oscillates`], a: 0,
            why: [null, md`More $V_0$ means more center charge: more repulsion.`, md`The balance is lost.`, md`No restoring force exists.`] },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:**

          1. $V(R,\theta) = V_0$ for all $\theta$.
          2. $V\to0$ as $r\to\infty$.

          **Images.** $q' = -\dfrac Raq = -\dfrac35q$ at $b = \dfrac{R^2}{a} = \dfrac35R$ (with $q$ gives $0$ on the sphere); $q_0 = 4\pi\ep RV_0$ at the center (adds $V_0$ uniformly). BC 1 ✓, BC 2 ✓, both images inside the sphere ✓.

          [[fig:img]]

          **(a)** With $A = \tfrac53$: $A^2 - 1 = \tfrac{16}{9}$.
          $$q_0 = \frac{qA^3}{(A^2-1)^2} = q\,\frac{125/27}{256/81} = \frac{375}{256}q\quad\Rightarrow\quad V_0^* = \frac{q_0}{4\pi\ep R} = \frac{375}{256}\,\frac{q}{4\pi\ep R}\approx1.465\,\frac{q}{4\pi\ep R}.$$

          **(b)** $Q = q_0 + q' = \left(\dfrac{375}{256} - \dfrac35\right)q = \dfrac{1107}{1280}q\approx0.865q$. Positive, as it must be at any balance point.

          **(c)** $\sigma_{\text{grounded}}(0) = -\dfrac{q(a+R)}{4\pi R(a-R)^2} = -\dfrac{q\,(8/3)}{4\pi R^2(4/9)} = -6\,\dfrac{q}{4\pi R^2}$. The center image adds $\dfrac{q_0}{4\pi R^2} = \dfrac{375}{256}\dfrac{q}{4\pi R^2}$. Total $\left(-6 + 1.465\right)\dfrac{q}{4\pi R^2} = -\dfrac{1161}{256}\dfrac{q}{4\pi R^2}\approx-4.54\,\dfrac{q}{4\pi R^2}$. Still negative: zero force does **not** mean zero induced charge facing $q$.

          **(d)** Hold $q_0$ fixed and vary $a$: $F(a) = \dfrac{q}{4\pi\ep}\left[\dfrac{q_0}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}\right]$, and at the balance $\dfrac{dF}{da} = \dfrac{1053}{1024}\dfrac{q^2}{4\pi\ep R^3}>0$. Out → pushed out; in → pulled in. Unstable radially; neutral along the circle by symmetry.

          [[fig:pl]]

          **(e)** Larger $V_0$ raises the repulsive term; $F>0$ at $a = \tfrac53R$, so $q$ moves away.
        `,
        figs: {
          img: { svg: fAxisImg({ Rp: 64, noCenter: true, note: 'sphere removed', items: [{ x: 5 / 3, q: '+', lab: 'q' }, { x: 0.6, q: '-', lab: '-\\tfrac{3}{5}q', image: true }, { x: 0, q: '+', lab: 'q_0', image: true, at: 'tl' }], dims: [{ x0: 0, x1: 0.6, lab: '\\tfrac{3}{5}R', row: 0 }, { x0: 0, x1: 5 / 3, lab: '\\tfrac{5}{3}R', row: 1 }] }), cap: md`Images: $-\tfrac35q$ at $\tfrac35R$ and $q_0 = 4\pi\ep RV_0$ at the center.` },
          pl: { svg: pF11(), cap: md`$F(a)$ with $V_0 = V_0^*$ fixed: it crosses zero upward at $a = \tfrac53R$.` },
        },
      }),

      P({
        title: 'A charge in a cavity of a shell held at V0',
        big: true,
        q: md`
          A thick conducting shell (inner radius $R$, outer radius $b$) is held at potential $V_0$. A charge $q$ is inside the cavity at $a = \tfrac35R$ from the center. Find:

          (a) $\sigma$ on the cavity wall at the point nearest $q$, in units of $\dfrac{q}{4\pi R^2}$;
          (b) the total charge on the inner surface (units of $q$);
          (c) the charge on the outer surface;
          (d) the force on $q$ in units of $\dfrac{q^2}{4\pi\ep R^2}$ (positive = away from the center);
          (e) $V$ at the center of the cavity.
        `,
        figHtml: fShell({ A: 0.6, lab: 'V=V_0', outer: true }),
        hints: [
          md`Two regions: the cavity ($r<R$) and outside ($r>b$). Each has its own BCs.`,
          md`Cavity: image $-\dfrac Raq$ at $\dfrac{R^2}{a}$, plus the **constant** $V_0$ (not a center charge).`,
          md`Inside the cavity, $\sigma = +\ep\,\partial V/\partial r$ at $r = R$ (the normal from the metal into the cavity is $-\uv r$).`,
          md`Outside: spherical symmetry; $V = \dfrac{Q_{\text{out}}}{4\pi\ep r}$ with $V(b) = V_0$.`,
        ],
        parts: [
          { lbl: md`(a) $\sigma(\text{nearest})$`, ans: -10 },
          { lbl: md`(b) $Q_{\text{inner}}/q$`, ans: -1 },
          { lbl: md`(c) $Q_{\text{outer}}$`, expr: '4*pi*eps0*b*V0', vars: { eps0: [0.5, 2], b: [1, 3], V0: [0.5, 2] } },
          { lbl: md`(d) $F$`, ans: 375 / 256 },
          { lbl: md`(e) $V(0)$`, expr: 'V0 + q/(6*pi*eps0*R)', vars: { V0: [0.5, 2], q: [1, 3], eps0: [0.5, 2], R: [0.5, 2] } },
        ],
        sol: md`
          **Cavity region** $r\le R$. **BCs:** 1. $V(R,\theta) = V_0$.
          **Outer region** $r\ge b$. **BCs:** 2. $V(b) = V_0$. 3. $V\to0$ as $r\to\infty$.

          **Cavity.** $q' = -\dfrac{R}{3R/5}q = -\dfrac53q$ at $\dfrac{R^2}{a} = \dfrac53R$, plus the constant $V_0$:
          $$V = V_0 + \frac{1}{4\pi\ep}\left(\frac q{\srm} - \frac{5q/3}{\srm'}\right)\quad(r\le R).$$
          The pair cancels on the wall, so BC 1 ✓; the constant adds no charge and keeps Laplace's equation.

          [[fig:img]]

          **(a)** Same $\sigma$ as the grounded cavity (a constant has no gradient): $\sigma(0) = -\dfrac{q(R+a)}{4\pi R(R-a)^2} = -\dfrac{q\,(8/5)}{4\pi R^2(4/25)} = -10\,\dfrac{q}{4\pi R^2}$.

          **(b)** Gauss in the metal: $Q_{\text{inner}} = -q$.

          **(c)** Outside, by symmetry $V = \dfrac{Q_{\text{out}}}{4\pi\ep r}$; BC 2 gives $Q_{\text{out}} = 4\pi\ep bV_0$, independent of $q$ and of where it sits. (The shell's net charge is $4\pi\ep bV_0 - q$; the battery supplies it.)

          **(d)** The image is beyond the near wall, at distance $\dfrac53R - \dfrac35R = \dfrac{16}{15}R$ from $q$:
          $$F = \frac{q\cdot\tfrac53q}{4\pi\ep(16R/15)^2} = \frac53\cdot\frac{225}{256}\,\frac{q^2}{4\pi\ep R^2} = \frac{375}{256}\,\frac{q^2}{4\pi\ep R^2}\approx1.46,$$
          outward, toward the nearest wall. $V_0$ doesn't enter.

          **(e)** $V(0) = V_0 + \dfrac{1}{4\pi\ep}\left(\dfrac{q}{3R/5} - \dfrac{5q/3}{5R/3}\right) = V_0 + \dfrac{q}{4\pi\ep R}\left(\dfrac53 - 1\right) = V_0 + \dfrac{q}{6\pi\ep R}$.

          **What to remember.** Inside a cavity, "held at $V_0$" is a constant shift: no change to $\sigma$, $\vb E$, or the force. Outside, the conductor's interior is invisible: only $V_0$ and $b$ matter.
        `,
        figs: { img: { svg: fAxisImg({ Rp: 64, note: 'metal removed', items: [{ x: 0.6, q: '+', lab: 'q' }, { x: 5 / 3, q: '-', lab: "q' = -\\tfrac{5}{3}q", image: true }], dims: [{ x0: 0, x1: 0.6, lab: '\\tfrac{3}{5}R', row: 0 }, { x0: 0, x1: 5 / 3, lab: '\\tfrac{5}{3}R', row: 1 }] }), cap: md`Cavity region: $q$ and its image $-\tfrac53q$ at $\tfrac53R$ (the wall is dashed), plus the constant $V_0$.` } },
      }),

      P({
        title: 'Force vector in a 60° wedge, off the bisector',
        big: true,
        q: md`
          Two grounded conducting half-planes meet at $60^\circ$. A charge $q$ is a distance $a$ from the edge, at $15^\circ$ from wall 1. Take $x$ along wall 1 (away from the edge) and $y$ perpendicular to it, into the wedge.

          (a) How many images? (b) $F_x$ and (c) $F_y$ in units of $\dfrac{q^2}{4\pi\ep a^2}$. (d) How does $F_y$ compare with the pull of wall 1 alone?
        `,
        figHtml: fWedge(60, 15, { rq: 150, showA: true, phLab: '15^\\circ' }),
        hints: [
          md`$60^\circ = 180^\circ/3$: $2\cdot3 - 1$ images on the circle of radius $a$ about the edge.`,
          md`Reflections generate $+q$ at $15^\circ + 120^\circ k$ and $-q$ at $-15^\circ + 120^\circ k$: $+q$ at $135^\circ, 255^\circ$; $-q$ at $345^\circ, 105^\circ, 225^\circ$.`,
          md`Chord length between angles $\alpha,\beta$ on the circle: $2a\sin\frac{|\alpha-\beta|}{2}$. Add the five vectors (a table helps).`,
        ],
        parts: [
          { lbl: md`(a) number of images`, ans: 5 },
          { lbl: md`(b) $F_x$`, ans: -0.1074 },
          { lbl: md`(c) $F_y$`, ans: -3.4666 },
          { lbl: md`(d) Compared with wall 1 alone ($F_y = -(2+\sqrt3)\approx-3.73$), the full $F_y$ is`, mc: [md`much bigger: the other images add up`, md`exactly the same`, md`slightly smaller in size: the far images partly cancel the near one`, md`opposite in sign`], a: 2,
            why: [md`The two $+q$ images push $q$ away from wall 1 a little.`, md`The other four images have nonzero $y$-components.`, null, md`The $-q$ image $0.52a$ away dominates; the sign can't change.`] },
        ],
        sol: md`
          **Region** $0\le\phi\le60^\circ$. **BCs:** 1. $V = 0$ on $\phi = 0$. 2. $V = 0$ on $\phi = 60^\circ$. 3. $V\to0$ far away.

          **Images.** Reflection in wall 1 sends $\phi\to-\phi$; in wall 2, $\phi\to120^\circ - \phi$. Starting from $+q$ at $15^\circ$: $-q$ at $345^\circ$ and $105^\circ$; then $+q$ at $255^\circ$ and $135^\circ$; then $-q$ at $225^\circ$. Five images, none in the wedge. Wall 1 bisects the pairs $(15^\circ,345^\circ)$, $(135^\circ,225^\circ)$, $(105^\circ,255^\circ)$, each $\pm$: BC 1 ✓. Wall 2 bisects $(15^\circ,105^\circ)$, $(135^\circ,345^\circ)$, $(225^\circ,255^\circ)$, each $\pm$: BC 2 ✓.

          [[fig:img]]

          **Forces**, units $\dfrac{q^2}{4\pi\ep a^2}$ (vector from image to $q$, times sign, over distance cubed):

          | image | angle | distance | $F_x$ | $F_y$ |
          |---|---|---|---|---|
          | $-q$ | $345^\circ$ | $2a\sin15^\circ = 0.518a$ | $0$ | $-3.732$ |
          | $-q$ | $105^\circ$ | $\sqrt2\,a$ | $-0.433$ | $+0.250$ |
          | $+q$ | $135^\circ$ | $\sqrt3\,a$ | $+0.322$ | $-0.086$ |
          | $+q$ | $255^\circ$ | $\sqrt3\,a$ | $+0.236$ | $+0.236$ |
          | $-q$ | $225^\circ$ | $1.932a$ | $-0.232$ | $-0.134$ |
          | **sum** | | | $-0.107$ | $-3.467$ |

          So $\vb F\approx(-0.107,\,-3.467)\,\dfrac{q^2}{4\pi\ep a^2}$, $|\vb F|\approx3.47$.

          **(d)** Wall 1 alone gives $-\dfrac{1}{(2\sin15^\circ)^2} = -(2+\sqrt3)\approx-3.73$. The rest of the system trims it by about $7\%$. Wall 2 ($-q$ at $105^\circ$) pulls $q$ toward itself, i.e. $+y$ and $-x$.

          **What to remember.** Close to one wall, that wall's image dominates; the others are corrections. Use that as a check on any wedge answer.
        `,
        figs: { img: { svg: fWedgeImg(60, [[15, '+', 'q', 'r'], [345, '-', '-q', 'r'], [105, '-', '-q', 't'], [135, '+', '+q', 'tl'], [255, '+', '+q', 'b'], [225, '-', '-q', 'bl']]), cap: md`$q$ and its five images on the circle of radius $a$; the walls and their extensions are dashed.` } },
      }),

      P({
        title: 'Energy to bring a charge up to a grounded sphere',
        q: md`
          A charge $q$ is brought slowly from infinity to a distance $d$ from the **surface** of a grounded sphere of radius $R$. (a) How much work do you do? (b) Evaluate for $d = R$ in units of $\dfrac{q^2}{4\pi\ep R}$. (c) How does it compare with $qV_{\text{image}}$ at the final position? (d) What does it become as $R\to\infty$ at fixed $d$?
        `,
        figHtml: fSph({ A: 1.6, ground: true, lab: 'V=0', dSurf: true }),
        hints: [
          md`At distance $r$ from the center the force is $\dfrac{1}{4\pi\ep}\dfrac{q^2Rr}{(r^2-R^2)^2}$, toward the sphere.`,
          md`$W = -\displaystyle\int_\infty^{R+d}F_{\text{attr}}\,dr$; substitute $u = r^2 - R^2$.`,
        ],
        parts: [
          { lbl: md`(a) $W$`, expr: '-q^2*R/(8*pi*eps0*d*(2*R+d))', vars: { q: [1, 3], R: [0.5, 2], eps0: [0.5, 2], d: [0.5, 2] } },
          { lbl: md`(b) $W$ at $d = R$`, ans: -1 / 6 },
          { lbl: md`(c) $W$ is`, mc: [md`$\tfrac12qV_{\text{image}}$`, md`$qV_{\text{image}}$`, md`$2qV_{\text{image}}$`, md`unrelated to $V_{\text{image}}$`], a: 0,
            why: [null, md`That would be right only if the image stayed fixed at its final place and size.`, md`No.`, md`For grounded conductors $W = \tfrac12qV_{\text{image}}$ always.`] },
          { lbl: md`(d) As $R\to\infty$`, mc: [md`$W\to0$`, md`$W\to-\infty$`, md`$W\to-\dfrac{q^2}{8\pi\ep d}$`, md`$W\to-\dfrac{q^2}{16\pi\ep d}$, the plane result`], a: 3,
            why: [md`A huge sphere looks like a plane, which still attracts.`, md`The distance to the surface stays $d$.`, md`That's $qV_{\text{image}}$ for the plane, without the $\tfrac12$.`, null] },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs** 1. $V(R,\theta) = 0$. 2. $V\to0$. At each position $r$ of $q$: image $-\dfrac Rrq$ at $\dfrac{R^2}{r}$, so the image changes as $q$ moves.

          [[fig:img]]

          **(a)** Attractive force at distance $r$: $\dfrac{1}{4\pi\ep}\dfrac{q^2Rr}{(r^2-R^2)^2}$. You hold back against it:
          $$W = -\int_\infty^{R+d}\frac{1}{4\pi\ep}\frac{q^2Rr}{(r^2-R^2)^2}\,dr = -\frac{q^2R}{4\pi\ep}\left[-\frac{1}{2(r^2-R^2)}\right]_\infty^{R+d}\cdot(-1)\cdot(-1) = -\frac{1}{4\pi\ep}\frac{q^2R}{2\left((R+d)^2-R^2\right)}.$$
          With $(R+d)^2 - R^2 = d(2R+d)$: $W = -\dfrac{q^2R}{8\pi\ep\,d(2R+d)}$.

          **(b)** $d = R$: $W = -\dfrac{q^2R}{8\pi\ep\cdot3R^2} = -\dfrac16\,\dfrac{q^2}{4\pi\ep R}$.

          **(c)** $V_{\text{image}}$ at $q$: $-\dfrac{1}{4\pi\ep}\dfrac{qR/a}{a - R^2/a} = -\dfrac{1}{4\pi\ep}\dfrac{qR}{a^2-R^2}$. So $W = \tfrac12qV_{\text{image}}$.

          **(d)** $\dfrac{R}{2R+d}\to\dfrac12$: $W\to-\dfrac{q^2}{16\pi\ep d}$, the plane ✓.
        `,
        figs: { img: { svg: fAxisImg({ Rp: 60, note: 'sphere removed', items: [{ x: 1.6, q: '+', lab: 'q' }, { x: 0.625, q: '-', lab: "q'", image: true }], dims: [{ x0: 0, x1: 0.625, lab: 'b', row: 0 }, { x0: 1, x1: 1.6, lab: 'd', row: 0 }] }), cap: md`At each instant the image is $-\dfrac{R}{a}q$ at $\dfrac{R^2}{a}$, with $a = R+d$; it grows and moves out as $q$ comes in.` } },
      }),

      // ------------------------------------------------------------------ Level 6
      R(md`### Level 6: harder than the exam`),

      P({
        title: 'Grounded sphere, point charge and a uniform field',
        big: true,
        q: md`
          A grounded conducting sphere of radius $R$ sits in a uniform field $E_0\uv z$. A charge $q>0$ is on the $+z$ axis at $a = 3R$.

          (a) Total charge on the sphere (units of $q$).
          (b) The value of $E_0$ that makes $\sigma = 0$ at the point of the sphere facing $q$.
          (c) With that $E_0$, the force on $q$ in units of $\dfrac{q^2}{4\pi\ep R^2}$ (positive = $+z$, away).
          (d) With that $E_0$, $\sigma$ at the point farthest from $q$ ($\theta = \pi$), in units of $\dfrac{q}{4\pi R^2}$.
        `,
        figHtml: fSph({ A: 3, ground: true, lab: 'V=0', fieldH: true }),
        hints: [
          md`BCs: $V(R,\theta) = 0$; $V\to-E_0r\cos\theta$ far away. Superpose two solutions that each vanish on the sphere.`,
          md`Field piece: $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$, i.e. an induced dipole $p = 4\pi\ep R^3E_0$; $\sigma = 3\ep E_0\cos\theta$. Charge piece: image $-\dfrac q3$ at $\dfrac R3$.`,
          md`On the axis the field piece gives $E_z = E_0\left(1 + \dfrac{2R^3}{r^3}\right)$.`,
        ],
        parts: [
          { lbl: md`(a) $Q/q$`, ans: -1 / 3 },
          { lbl: md`(b) $E_0$`, expr: 'q/(12*pi*eps0*R^2)', vars: { q: [1, 3], eps0: [0.5, 2], R: [0.5, 2] } },
          { lbl: md`(c) $F$`, ans: 1613 / 5184 },
          { lbl: md`(d) $\sigma(\pi)$`, ans: -1.125 },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:**

          1. $V(R,\theta) = 0$.
          2. $V\to-E_0r\cos\theta$ as $r\to\infty$.

          **Superpose.** (i) $V_E = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$: zero on the sphere, $-E_0z$ far away. (ii) $V_q = \dfrac{1}{4\pi\ep}\left(\dfrac q{\srm} - \dfrac{q/3}{\srm'}\right)$, image at $\dfrac R3$: zero on the sphere, $0$ far away. Sum: BC 1 $0+0$ ✓, BC 2 ✓.

          [[fig:img]]

          **(a)** $\sigma_E = 3\ep E_0\cos\theta$ integrates to $0$. The charge piece gives $-\dfrac Raq = -\dfrac q3$.

          **(b)** At $\theta = 0$: $\sigma_E = 3\ep E_0$; $\sigma_q = -\dfrac{q(a+R)}{4\pi R(a-R)^2} = -\dfrac{q\cdot4R}{4\pi R\cdot4R^2} = -\dfrac{q}{4\pi R^2}$. Zero sum: $E_0 = \dfrac{q}{12\pi\ep R^2}$ $\left(= \dfrac13\cdot\dfrac{q}{4\pi\ep R^2}\right)$.

          **(c)** Field from piece (i) at $q$: $E_0\left(1 + \dfrac{2}{27}\right) = \dfrac{29}{27}E_0$, up. Image pull: $\dfrac{1}{4\pi\ep}\dfrac{q^2Ra}{(a^2-R^2)^2} = \dfrac{3}{64}\dfrac{q^2}{4\pi\ep R^2}$, down.
          $$F = \frac{q^2}{4\pi\ep R^2}\left[\frac13\cdot\frac{29}{27} - \frac3{64}\right] = \frac{1613}{5184}\,\frac{q^2}{4\pi\ep R^2}\approx0.311.$$
          Pushed away: the field (helped by the induced dipole) wins.

          **(d)** At $\theta = \pi$: $\sigma_E = -3\ep E_0 = -\dfrac{q}{4\pi R^2}$; $\sigma_q = -\dfrac{q(a^2-R^2)}{4\pi R(a+R)^3} = -\dfrac{q\cdot8R^2}{4\pi R\cdot64R^3} = -\dfrac18\,\dfrac{q}{4\pi R^2}$. Total $-\dfrac98\,\dfrac{q}{4\pi R^2}$.

          **What to remember.** Superposition is legal because both pieces satisfy the **same homogeneous** condition on the sphere ($V = 0$) and their far-field conditions add to the required one. If the sphere were held at $V_0$, you'd add one $\dfrac{RV_0}{r}$ term, once.
        `,
        figs: { img: { svg: fSphFieldImg(), cap: md`Sphere removed: the uniform field, the induced dipole $\vb p = 4\pi\ep R^3E_0\,\uv z$ at the center, $q$, and its image $-q/3$ at $R/3$ ($z$ to the right).` } },
      }),

      P({
        title: 'How much induced charge can the charge see?',
        q: md`
          A charge $q$ is at $a$ from the center of a grounded sphere of radius $R$. The part of the sphere that $q$ can "see" is the cap $\cos\theta>R/a$ (bounded by the tangent lines from $q$). Find (a) the induced charge on that cap, (b) for $a = 2R$, the fraction of the total induced charge that sits on it.
        `,
        figHtml: fSph({ A: 2, ground: true, lab: 'V=0' }),
        hints: [
          md`Use $\sigma(\theta) = -\dfrac{q(a^2-R^2)}{4\pi R(R^2+a^2-2Ra\cos\theta)^{3/2}}$ and $da = 2\pi R^2\sin\theta\,d\theta$.`,
          md`Substitute $u = \cos\theta$: $\displaystyle\int\frac{du}{(R^2+a^2-2Rau)^{3/2}} = \frac{1}{Ra}(R^2+a^2-2Rau)^{-1/2}$.`,
          md`At $u = R/a$: $R^2 + a^2 - 2R^2 = a^2 - R^2$.`,
        ],
        parts: [
          { lbl: md`(a) $Q_{\text{cap}}$`, expr: '-q*((a+R) - sqrt(a^2-R^2))/(2*a)', vars: { q: [1, 3], R: [0.5, 1], a: [1.5, 4] } },
          { lbl: md`(b) fraction at $a = 2R$`, ans: 0.634 },
          { lbl: md`(c) As $a\to\infty$ the cap's share tends to`, mc: [md`$\tfrac12$: the cap becomes a hemisphere and $\sigma$ becomes nearly uniform`, md`$0$`, md`$1$`, md`$\tfrac14$`], a: 0,
            why: [null, md`The cap grows toward a hemisphere, not a point.`, md`That's the $a\to R$ limit.`, md`No.`] },
        ],
        sol: md`
          **Region** $r\ge R$; **BCs** 1. $V(R,\theta) = 0$, 2. $V\to0$; image $-\dfrac Raq$ at $\dfrac{R^2}{a}$, giving the standard $\sigma(\theta)$.

          [[fig:cap]]

          **(a)** With $u = \cos\theta$ and $u_c = R/a$:
          $$Q_{\text{cap}} = -\frac{q(a^2-R^2)R}{2}\int_{u_c}^{1}\frac{du}{(R^2+a^2-2Rau)^{3/2}} = -\frac{q(a^2-R^2)}{2a}\left[\frac{1}{a-R} - \frac{1}{\sqrt{a^2-R^2}}\right].$$
          $$Q_{\text{cap}} = -\frac{q}{2a}\left[(a+R) - \sqrt{a^2-R^2}\right].$$

          **(b)** $a = 2R$: $Q_{\text{cap}} = -\dfrac{3-\sqrt3}{4}q\approx-0.317q$, out of $-\dfrac q2$ total: fraction $\dfrac{3-\sqrt3}{2}\approx0.634$.

          **(c)** Large $a$: $\sqrt{a^2-R^2}\approx a - \dfrac{R^2}{2a}$, so $Q_{\text{cap}}\approx-\dfrac{qR}{2a}$, half the total $-\dfrac{qR}{a}$. As $a\to R$, $Q_{\text{cap}}\to-q$: the whole induced charge crowds under $q$, the plane limit.

          **Checks.** Both limits make physical sense, and the general integral with $u_c = -1$ gives the full $-\dfrac Raq$.
        `,
        figs: { cap: { svg: fCap(2), cap: md`The visible cap: $\cos\theta_c = R/a$ (the tangent lines from $q$ touch the sphere at $\theta_c$).` } },
      }),

      P({
        title: 'A wire beside a charged pipe (two-wire line)',
        big: true,
        q: md`
          A long conducting pipe of radius $R$ carries charge $-\lambda$ per unit length. A thin wire with charge $+\lambda$ per unit length runs parallel to it, a distance $a$ from the pipe's axis. Find (a) the image, (b) $\sigma$ on the pipe at the point nearest the wire, (c) the force per unit length on the wire, (d) the pipe's potential (relative to far away).
        `,
        figHtml: fCyl({ lab: '-\\lambda', wLab: '+\\lambda' }),
        hints: [
          md`BCs: pipe an equipotential; its charge per length $-\lambda$; far away $V\to0$ (zero net charge). Second uniqueness theorem: that's enough.`,
          md`For lines, $V = \dfrac{\lambda}{2\pi\ep}\ln\dfrac{s'}{s}$ for a $\pm\lambda$ pair. Find where $s'/s$ is constant on the circle $s = R$.`,
          md`The same Apollonius geometry as the sphere: image at $b = \dfrac{R^2}{a}$, and on the pipe $\dfrac{s'}{s} = \dfrac Ra$.`,
        ],
        parts: [
          { lbl: md`(a) The image is`, mc: [md`$-\dfrac Ra\lambda$ at $\dfrac{R^2}{a}$`, md`$-\lambda$ at $2R - a$`, md`$-\lambda$ at the axis`, md`$-\lambda$ at $\dfrac{R^2}{a}$`], a: 3,
            why: [md`For lines the image must be equal and opposite to make $\ln(s'/s)$ constant; it also has to carry the pipe's whole charge $-\lambda$.`, md`That's a plane mirror; it doesn't make the circle an equipotential.`, md`At the axis it adds a uniform potential, but can't cancel the wire's variation over the pipe.`, null] },
          { lbl: md`(b) $\sigma(\text{nearest})$`, expr: '-lambda*(a+R)/(2*pi*R*(a-R))', vars: { lambda: [1, 3], R: [0.5, 1], a: [1.5, 4] } },
          { lbl: md`(c) $F/L$ (size)`, expr: 'lambda^2*a/(2*pi*eps0*(a^2-R^2))', vars: { lambda: [1, 3], eps0: [0.5, 2], R: [0.5, 1], a: [1.5, 4] } },
          { lbl: md`(d) $V_{\text{pipe}}$`, expr: 'lambda*ln(R/a)/(2*pi*eps0)', vars: { lambda: [1, 3], eps0: [0.5, 2], R: [0.5, 1], a: [1.5, 4] }, accepts: ['-lambda*ln(a/R)/(2*pi*eps0)'] },
        ],
        sol: md`
          **Region** outside the pipe, $s\ge R$. **BCs:**

          1. $V(R,\phi)$ = constant (conductor).
          2. Charge per length on the pipe: $-\lambda$.
          3. $V\to0$ far away (the system is neutral per unit length).

          **Image.** $-\lambda$ at $b = \dfrac{R^2}{a}$. Then $V = \dfrac{\lambda}{2\pi\ep}\ln\dfrac{s'}{s}$ ($s$ to the wire, $s'$ to the image). On the circle $s = R$, $\dfrac{s'}{s} = \dfrac Ra$ for every $\phi$ (exactly the sphere's distance ratio), so BC 1 ✓. Gauss around the pipe encloses the image $-\lambda$: BC 2 ✓. Far away $s'/s\to1$: BC 3 ✓. By the second uniqueness theorem this is the answer.

          [[fig:img]]

          **(b)** $\sigma = -\ep\dfrac{\partial V}{\partial s}\Big|_{R}$ gives
          $$\sigma(\phi) = -\frac{\lambda}{2\pi R}\,\frac{a^2-R^2}{a^2+R^2-2aR\cos\phi},\qquad\sigma(0) = -\frac{\lambda(a+R)}{2\pi R(a-R)}.$$
          (Integrating over $\phi$ gives $-\lambda$ ✓.)

          **(c)** The wire feels the image line's field at distance $a - b = \dfrac{a^2-R^2}{a}$: $\dfrac FL = \lambda\cdot\dfrac{\lambda}{2\pi\ep(a-b)} = \dfrac{\lambda^2a}{2\pi\ep(a^2-R^2)}$, attractive.

          **(d)** On the pipe $V = \dfrac{\lambda}{2\pi\ep}\ln\dfrac Ra<0$ (negative, as for a negatively charged conductor).

          **Contrast with the sphere.** For point charges the image is **smaller** ($-\dfrac Raq$) because $1/r$ turns a distance ratio into a charge ratio. For lines, $\ln$ turns a distance ratio into an additive constant, so the image is **equal** ($-\lambda$) and the constant becomes the pipe's potential.
        `,
        figs: { img: { svg: fAxisImg({ Rp: 50, note: 'pipe removed', items: [{ x: 2.4, q: '', lab: '+\\lambda' }, { x: 1 / 2.4, q: '', lab: '-\\lambda', image: true }], dims: [{ x0: 0, x1: 1 / 2.4, lab: 'b', row: 0 }, { x0: 0, x1: 2.4, lab: 'a', row: 1 }] }), cap: md`Pipe removed: the image line $-\lambda$ at $b = R^2/a$.` } },
      }),

      P({
        title: 'Splitting the induced charge between two walls',
        big: true,
        q: md`
          A charge $q$ sits in a grounded $90^\circ$ corner at $x = \sqrt3\,a$ from the wall and $y = a$ above the floor (polar angle $30^\circ$ from the floor). Find the induced charge (a) on the floor and (b) on the wall, in units of $q$. (c) Generalize: the charge on the floor when $q$ is at polar angle $\phi$ from it.
        `,
        figHtml: fCorner({ x: 121, y: 70, xLab: '\\sqrt3\\,a', yLab: 'a' }),
        hints: [
          md`On a grounded plane with one charge $Q$ at height $h$ above it, $\sigma\,da = -\dfrac{Q}{2\pi}\,d\Omega$, where $d\Omega$ is the solid angle that $da$ subtends at $Q$. (From $\sigma = -\dfrac{Qh}{2\pi r^3}$ and $d\Omega = \dfrac{h\,da}{r^3}$.)`,
          md`On the floor, the corner's $\sigma$ is the plane $\sigma$ of $q$ plus the plane $\sigma$ of the wall image $-q$ (each with its own floor mirror).`,
          md`A half-plane seen from a point is a lune: solid angle $2(\pi - \psi)$, where $\psi$ is the angle at the edge between the half-plane and the point.`,
        ],
        parts: [
          { lbl: md`(a) $Q_{\text{floor}}/q$`, ans: -2 / 3 },
          { lbl: md`(b) $Q_{\text{wall}}/q$`, ans: -1 / 3 },
          { lbl: md`(c) $Q_{\text{floor}}(\phi)$`, expr: '-q*(1-2*phi/pi)', vars: { q: [1, 3], phi: [0.1, 1.4] } },
        ],
        sol: md`
          **Region** $x\ge0$, $y\ge0$. **BCs** 1. $V = 0$ on the floor. 2. $V = 0$ on the wall. 3. $V\to0$ far away. **Images:** $-q$ at $(-\sqrt3a, a)$, $-q$ at $(\sqrt3a,-a)$, $+q$ at $(-\sqrt3a,-a)$.

          [[fig:img]]

          **Floor field = two plane problems.** The four charges split into two "charge + floor mirror" pairs: $(q$ at $(\sqrt3a,a)$, $-q$ below it$)$ and $(-q$ at $(-\sqrt3a,a)$, $+q$ below it$)$. Each pair alone is a charge above a grounded plane, so on the floor $\sigma = \sigma_1 + \sigma_2$ with
          $$\sigma_i\,da = -\frac{Q_i}{2\pi}\,d\Omega_i .$$

          **Solid angles of the floor half-plane** ($x>0$). Seen from a point, a half-plane is a lune with opening $\pi - \psi$, solid angle $2(\pi-\psi)$, where $\psi$ is the angle at the corner line between the floor and the point.

          - From $q$: $\psi = 30^\circ$, $\Omega_1 = 2\cdot\dfrac{5\pi}{6} = \dfrac{5\pi}{3}$.
          - From the image $-q$ at $(-\sqrt3a,a)$: $\psi = 150^\circ$, $\Omega_2 = 2\cdot\dfrac{\pi}{6} = \dfrac\pi3$.

          $$Q_{\text{floor}} = -\frac{q}{2\pi}\cdot\frac{5\pi}{3} + \frac{q}{2\pi}\cdot\frac{\pi}{3} = -\frac23q.$$

          **(b)** Same on the wall (now $\psi = 60^\circ$ from $q$ and $120^\circ$ from its floor image): $-\dfrac{q}{2\pi}\cdot\dfrac{4\pi}{3} + \dfrac{q}{2\pi}\cdot\dfrac{2\pi}{3} = -\dfrac q3$. Total $-q$ ✓ (the field at infinity falls off fast, so all of $q$'s flux ends on the walls).

          **(c)** $\psi = \phi$ and $\pi - \phi$: $Q_{\text{floor}} = -\dfrac{q}{2\pi}\left[2(\pi-\phi) - 2\phi\right] = -q\left(1 - \dfrac{2\phi}{\pi}\right)$. Checks: $\phi\to0$ (on the floor) gives $-q$; $\phi = 45^\circ$ gives $-\dfrac q2$ by symmetry.

          **What to remember.** The fraction $\left(1 - \dfrac{2\phi}{\pi}\right)$ is linear in angle: the corner splits its charge like the two plates split it linearly in distance (Level 6 concept question). Both are the same theorem in disguise.
        `,
        figs: { img: { svg: fCornerImg(87, 50, { phi: '30^\\circ' }), cap: md`Images for $q$ at $30^\circ$; walls removed.` } },
      }),

      R(md`
        !!key Patterns to remember
            - Write the region and the numbered BCs first; every image must sit outside the region and fix a named BC.
            - Sphere twists add **one center charge**: $V_0$ → $4\pi\ep RV_0$; neutral → $+\tfrac Raq$; charge $Q$ → $Q + \tfrac Raq$. Cavity at $V_0$ → a **constant**, never a center charge.
            - Induced total = sum of images only when Gauss's surface can surround the conductor inside the region (not for cavities: there it's $-q$).
            - Force: images, full strength. Energy: $\tfrac12qV_{\text{image}}$ for grounded conductors; fixed charges (like $q_0$) get no $\tfrac12$.
            - Near any conductor the near image wins: attraction diverging like $1/(4d^2)$, even for like-charged spheres. All balance points are unstable.
            - Lines: images are equal and opposite ($-\lambda$); the leftover $\ln$ constant is the conductor's potential.
            - Limits: $R\to\infty$ at fixed $a-R$ gives the plane; far away the grounded sphere pulls like $1/a^3$, the neutral one like $1/a^5$.
      `),
    ],
  };

  COURSE.units.find((u) => u.id === 'uD').lessons.push(lessonA, lessonB);
})();
